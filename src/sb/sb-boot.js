/* ===== Bản độc lập: khởi động với Supabase ===== */
let loadedFor = null;
async function refreshAccess(force) {
  if (!AUTH_USER) { access = 'signedout'; PROFILE = null; S = null; loadedFor = null; route(); return; }
  MY_ID = AUTH_USER.id;
  const { data: p, error } = await sb.from('profiles').select('*').eq('id', MY_ID).maybeSingle();
  if (error) { GATE.err = 'Không tải được hồ sơ: ' + error.message; access = 'none'; route(); return; }
  PROFILE = p;
  ME = { id: MY_ID, name: (p && p.full_name) || AUTH_USER.email, email: AUTH_USER.email, isOwner: !!(p && p.is_admin) };
  const next = !p ? 'none' : p.is_admin ? 'owner' : p.status === 'approved' ? 'member' : p.status;
  const entering = (next === 'owner' || next === 'member') && (loadedFor !== MY_ID || force);
  access = next;
  if (entering) { loadedFor = MY_ID; await loadProgress(); if (next === 'owner') adminRefresh(); }
  if (!(next === 'owner' || next === 'member')) { S = null; loadedFor = null; }
  route();
}
async function boot() {
  mode = 'cloud'; access = 'checking'; route();
  if (!window.supabase || !window.supabase.createClient) {
    $('#view').innerHTML = '<div class="hero-onb card"><h1>Không tải được thư viện kết nối</h1><p class="muted">Kiểm tra kết nối mạng rồi tải lại trang.</p></div>'; $('#view').hidden = false; return;
  }
  sb = supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') ui.recovery = true;
    const u = session ? session.user : null;
    const changed = (u && u.id) !== (AUTH_USER && AUTH_USER.id);
    AUTH_USER = u;
    if (changed || event === 'SIGNED_OUT' || event === 'PASSWORD_RECOVERY') setTimeout(() => refreshAccess(false), 0);
  });
  const { data } = await sb.auth.getSession();
  AUTH_USER = data && data.session ? data.session.user : null;
  await refreshAccess(false);
}
boot();
