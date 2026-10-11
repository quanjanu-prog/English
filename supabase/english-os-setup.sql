-- =====================================================================
-- English OS · Cấu hình cơ sở dữ liệu Supabase
-- Chạy MỘT LẦN trong Supabase > SQL Editor > New query > dán toàn bộ > Run
-- =====================================================================

-- 1. Hồ sơ thành viên (tự tạo khi có người đăng ký)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text not null default '',
  goal          text not null default 'work',      -- work | life | both
  level         text not null default '0',         -- 0 | a1 | a2
  contact       text not null default '',
  consent       boolean not null default false,
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected', 'revoked')),
  is_admin      boolean not null default false,
  requested_at  timestamptz not null default now(),
  decided_at    timestamptz
);

-- 2. Tiến độ học (mỗi thành viên một dòng, lưu toàn bộ trạng thái dạng JSON)
create table if not exists public.progress (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  state       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- 3. Hàm kiểm tra quyền (chạy với quyền hệ thống để tránh vòng lặp chính sách)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_approved()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select status = 'approved' or is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 4. Tự tạo hồ sơ từ thông tin form đăng ký
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, goal, level, contact, consent)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data->>'full_name', ''), 80),
    coalesce(new.raw_user_meta_data->>'goal', 'work'),
    coalesce(new.raw_user_meta_data->>'level', '0'),
    left(coalesce(new.raw_user_meta_data->>'contact', ''), 120),
    coalesce((new.raw_user_meta_data->>'consent')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Chặn thành viên tự duyệt mình hoặc tự cấp quyền quản trị.
--    Thành viên bị từ chối được gửi lại yêu cầu (rejected -> pending).
create or replace function public.guard_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.is_admin is distinct from old.is_admin
       or new.email is distinct from old.email
       or new.decided_at is distinct from old.decided_at
       or (new.status is distinct from old.status
           and not (old.status = 'rejected' and new.status = 'pending')) then
      raise exception 'Bạn không có quyền thay đổi trạng thái tài khoản';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile();

-- 6. Quyền truy cập theo dòng (Row Level Security)
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists progress_select on public.progress;
create policy progress_select on public.progress
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists progress_insert on public.progress;
create policy progress_insert on public.progress
  for insert with check (user_id = auth.uid() and public.is_approved());

drop policy if exists progress_update on public.progress;
create policy progress_update on public.progress
  for update using (user_id = auth.uid() and public.is_approved())
  with check (user_id = auth.uid());

-- =====================================================================
-- 7. CHẠY SAU, khi bạn đã đăng ký tài khoản quan.janu@gmail.com trên website:
--    (bỏ dấu -- ở đầu dòng dưới rồi bấm Run)
-- update public.profiles
--   set is_admin = true, status = 'approved', decided_at = now()
--   where email = 'quan.janu@gmail.com';
-- =====================================================================
