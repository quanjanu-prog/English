/* ===== Bản độc lập: Supabase · thành viên, duyệt và quản trị ===== */
const SB_URL = 'https://ihvyhcznddxaiqbpfgei.supabase.co';
const SB_KEY = 'sb_publishable_ZvW-Z0QKEAIrrO2K5PZ8Eg_ai8GGB5p';
const ADMIN_EMAIL = 'quan.janu@gmail.com';
let access = 'checking';            // checking | signedout | owner | member | pending | rejected | revoked | none
let sb = null, AUTH_USER = null, PROFILE = null, ME = null, MY_ID = null, DB = null, USER = null;
const GATE = { busy: false, err: '', info: '' };
const ADM = { profiles: [], progress: {}, loading: false, loaded: false, open: null, err: '' };
const GOALS = { work: 'Giao tiếp công việc TMĐT', life: 'Giao tiếp đời sống', both: 'Cả công việc và đời sống' };
const LEVELS = { 0: 'Mất gốc (0)', a1: 'Biết một ít (A1)', a2: 'Cơ bản (A2)' };
const fmtDT = s => { if (!s) return ''; const d = new Date(s); return isNaN(d) ? '' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const STATUS_VI = { pending: ['Chờ duyệt', 'warn'], approved: ['Đã duyệt', 'good'], rejected: ['Từ chối', 'crit'], revoked: ['Đã thu hồi', ''] };
function viewGate() { return ''; }

/* Lưu tiến độ: giữ nguyên giao diện lưu của core.js (docRef.set) nhưng ghi vào bảng progress */
function makeProgressRef(uid) {
  return {
    async set(body) {
      const { error } = await sb.from('progress').upsert({ user_id: uid, state: body, updated_at: new Date().toISOString() });
      if (error) {
        const transient = !error.code || /fetch|network|timeout/i.test(error.message || '');
        throw { code: transient ? 'unavailable' : 'denied', message: error.message };
      }
    }
  };
}
async function loadProgress() {
  const { data, error } = await sb.from('progress').select('state').eq('user_id', MY_ID).maybeSingle();
  if (error) { setSaveChip('local', 'Chưa tải được tiến độ'); S = null; return; }
  S = data && data.state ? normalize(JSON.parse(JSON.stringify(data.state))) : null;
  lastSaved = S ? JSON.stringify(data.state) : '';
  docRef = makeProgressRef(MY_ID);
  setSaveChip('ok', S ? 'Đã đồng bộ' : 'Chưa có dữ liệu');
  if (migrated && S) { migrated = false; save(); }
}

/* --- Quản trị --- */
const pendingCount = () => ADM.profiles.filter(p => p.status === 'pending' && !p.is_admin).length;
async function adminRefresh() {
  if (access !== 'owner') return;
  ADM.loading = true; ADM.err = '';
  if (curRoute() === 'admin') rerender();
  const [pr, pg] = await Promise.all([
    sb.from('profiles').select('*').order('requested_at', { ascending: true }),
    sb.from('progress').select('user_id,state,updated_at')
  ]);
  if (pr.error || pg.error) ADM.err = 'Chưa tải được dữ liệu thành viên. Thử Tải lại sau ít giây.';
  ADM.profiles = (pr.data || []).filter(p => p.id !== MY_ID);
  ADM.progress = {}; (pg.data || []).forEach(r => { ADM.progress[r.user_id] = r; });
  ADM.loading = false; ADM.loaded = true;
  renderNav();
  if (curRoute() === 'admin') { const a = document.activeElement; if (!a || !/INPUT|TEXTAREA|SELECT/.test(a.tagName)) rerender(); }
}
function metricsOf(st) {
  if (!st) return null;
  const keepS = S, keepM = migrated;
  try {
    S = normalize(JSON.parse(JSON.stringify(st)));
    const t = todayISO(), past = S.blocks.filter(b => b.date <= t && b.status !== 'moved'), pd = past.filter(b => b.status === 'done').length;
    const days = [...activeDays()].sort();
    return { start: S.startDate, week: weekNo(t), hours: totalDone() / 60, comp: pct(pd, past.length), vc: vocabCounts(), sp: skillProgress(), streak: streak(), last: days[days.length - 1] || null, errors: Object.keys(S.errors).length, tests: S.tests.slice(-1)[0] || null, weak: weakSounds().map(s => s.sym), topErr: topErrors(3).map(e => e[1]) };
  } catch { return null; } finally { S = keepS; migrated = keepM; }
}
function viewAdmin() {
  if (!ADM.loaded && !ADM.loading) setTimeout(adminRefresh, 0);
  const P = ADM.profiles, pend = P.filter(p => p.status === 'pending'), appr = P.filter(p => p.status === 'approved'), other = P.filter(p => p.status === 'rejected' || p.status === 'revoked');
  const nm = p => esc(p.full_name || p.email || 'Chưa có tên');
  let h = pageHead('Quản trị', 'Thành viên và tiến độ', 'Duyệt đăng ký và theo dõi tiến độ học của từng thành viên.',
    '<div class="row"><button class="btn" data-a="adminExport">Xuất dữ liệu (JSON)</button><button class="btn" data-a="adminReload"' + (ADM.loading ? ' disabled' : '') + '>' + (ADM.loading ? 'Đang tải…' : 'Tải lại') + '</button></div>');
  if (ADM.err) h += '<div class="alert crit" style="margin-bottom:12px"><span class="ic">!</span><div class="bd">' + esc(ADM.err) + '</div></div>';
  h += '<div class="kpis" style="margin-bottom:16px"><div class="kpi tint ' + (pend.length ? 'k-warn' : 'k-review') + '"><div class="label">Chờ duyệt</div><div class="v">' + pend.length + '</div><div class="s">' + (pend.length ? 'Cần bạn xử lý' : 'Không có yêu cầu mới') + '</div></div>' +
    '<div class="kpi tint k-vocab"><div class="label">Thành viên</div><div class="v">' + appr.length + '</div><div class="s">Đang học</div></div>' +
    '<div class="kpi tint k-listen"><div class="label">Học trong 7 ngày</div><div class="v">' + appr.filter(p => { const m = metricsOf((ADM.progress[p.id] || {}).state); return m && m.last && daysBetween(m.last, todayISO()) <= 7; }).length + '</div><div class="s">thành viên có hoạt động</div></div>' +
    '<div class="kpi tint k-review"><div class="label">Từ chối, thu hồi</div><div class="v">' + other.length + '</div></div></div>';
  h += '<div class="card ' + (pend.length ? 't-focus' : '') + '" style="margin-bottom:16px"><div class="card-h"><h2>Yêu cầu chờ duyệt</h2>' + (pend.length ? '<span class="pill warn">' + pend.length + '</span>' : '') + '</div>';
  if (!pend.length) h += '<p class="small muted">' + (ADM.loaded ? 'Chưa có yêu cầu nào. Người đăng ký mới sẽ hiện ở đây.' : 'Đang tải…') + '</p>';
  pend.forEach(p => { h += '<div class="task" style="flex-wrap:wrap"><div class="t" style="min-width:220px"><b>' + nm(p) + '</b><span class="meta"><span class="num">' + esc(p.email || '') + '</span><span>' + esc(GOALS[p.goal] || '') + '</span><span>Trình độ: ' + esc(LEVELS[p.level] || '0') + '</span><span class="num">Gửi ' + fmtDT(p.requested_at) + '</span></span></div>' +
    '<div class="row"><button class="btn pri sm" data-a="approve" data-id="' + esc(p.id) + '">Duyệt</button><button class="btn sm" data-a="reject" data-id="' + esc(p.id) + '">Từ chối</button></div></div>'; });
  h += '</div>';
  h += '<div class="card" style="margin-bottom:16px"><div class="card-h"><h2>Tiến độ thành viên</h2><span class="small muted">Bấm tên để xem chi tiết</span></div>';
  if (!appr.length) h += '<p class="small muted">Chưa có thành viên nào được duyệt.</p>';
  else {
    h += '<div class="tbl-wrap"><table><thead><tr><th>Thành viên</th><th>Bắt đầu</th><th class="num">Tuần</th><th class="num">Giờ học</th><th>Hoàn thành block</th><th class="num">Từ nhận diện</th><th class="num">Ngữ pháp TB</th><th class="num">Chuỗi</th><th>Học gần nhất</th><th class="num">Lỗi</th><th></th></tr></thead><tbody>';
    appr.forEach(p => {
      const m = metricsOf((ADM.progress[p.id] || {}).state);
      const lastCell = m && m.last ? (daysBetween(m.last, todayISO()) > 3 ? '<span class="pill crit">' + fmtDM(m.last) + '</span>' : '<span class="pill good">' + fmtDM(m.last) + '</span>') : '<span class="pill">Chưa học</span>';
      h += '<tr><td><button class="btn ghost sm" style="padding-left:0;font-weight:600" data-a="adminOpen" data-id="' + esc(p.id) + '">' + nm(p) + '</button><div class="tiny muted">' + esc(p.email || '') + '</div></td>' +
        (m ? '<td class="num">' + fmtDM(m.start) + '</td><td class="num">' + (m.week < 1 ? '–' : clamp(m.week, 1, 12)) + '</td><td class="num">' + m.hours.toFixed(1) + '</td><td style="min-width:140px"><div class="row" style="flex-wrap:nowrap"><div style="flex:1">' + bar(m.comp, 'acc') + '</div><span class="tiny num">' + m.comp + '%</span></div></td><td class="num">' + m.vc.recog + '</td><td class="num">' + m.sp.grammar + '%</td><td class="num">' + m.streak + '</td><td>' + lastCell + '</td><td class="num">' + m.errors + '</td>'
          : '<td colspan="9" class="small muted">Chưa tạo lộ trình</td>') +
        '<td>' + (ui.revokeId === p.id ? '<span class="row" style="flex-wrap:nowrap"><button class="btn danger sm" data-a="revoke" data-id="' + esc(p.id) + '">Thu hồi</button><button class="btn sm" data-a="revokeCancel">Giữ</button></span>' : '<button class="btn sm ghost" data-a="revokeAsk" data-id="' + esc(p.id) + '">Thu hồi</button>') + '</td></tr>';
      if (ADM.open === p.id && m) {
        h += '<tr><td colspan="11" style="background:var(--surface-2)"><div class="grid g3" style="gap:12px">' +
          '<div><div class="label" style="margin-bottom:6px">Kỹ năng</div>' + [['pron', 'Phát âm'], ['vocab', 'Từ vựng'], ['grammar', 'Ngữ pháp'], ['listen', 'Nghe'], ['speak', 'Nói'], ['ecom', 'TMĐT']].map(([k, l]) => '<div class="skillrow k-' + k + '" style="grid-template-columns:70px minmax(0,1fr) 40px;padding:3px 0"><b class="small">' + l + '</b>' + bar(m.sp[k], 'k') + '<span class="num small">' + m.sp[k] + '%</span></div>').join('') + '</div>' +
          '<div><div class="label" style="margin-bottom:6px">Từ vựng</div><p class="small">' + m.vc.seen + ' đã gặp · ' + m.vc.recog + ' nhận diện · ' + m.vc.use + ' tự dùng · ' + m.vc.due + ' cần ôn</p><div class="label" style="margin:10px 0 6px">Bài kiểm tra gần nhất</div><p class="small">' + (m.tests ? esc(m.tests.kind) + ': ' + m.tests.score + '/' + m.tests.total + ' (' + fmtDM(m.tests.d) + ')' : 'Chưa làm') + '</p></div>' +
          '<div><div class="label" style="margin-bottom:6px">Điểm yếu</div>' + (m.weak.length ? '<p class="small">Âm cần sửa: <span class="ipa">' + m.weak.map(x => '/' + esc(x) + '/').join(' ') + '</span></p>' : '') + (m.topErr.length ? m.topErr.map(e => '<p class="small">' + esc(e.k) + ': ' + esc(e.p.slice(0, 60)) + ' <span class="muted">(' + e.n + ' lần)</span></p>').join('') : '<p class="small muted">Chưa có lỗi lặp lại.</p>') + '</div></div></td></tr>';
      }
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';
  if (other.length) h += '<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:8px">Từ chối và thu hồi</h3>' + other.map(p => '<div class="task"><div class="t"><b>' + nm(p) + '</b><span class="meta"><span class="num">' + esc(p.email || '') + '</span><span class="pill ' + STATUS_VI[p.status][1] + '">' + STATUS_VI[p.status][0] + '</span><span class="num">' + fmtDT(p.decided_at) + '</span></span></div><button class="btn sm" data-a="approve" data-id="' + esc(p.id) + '">Duyệt lại</button></div>').join('') + '</div>';
  h += '<div class="card flat small"><h3 style="margin-bottom:8px">Cách mời thành viên</h3><p>Gửi link website cho người học. Họ bấm <b>Đăng ký</b>, tạo tài khoản bằng email và mật khẩu, rồi chờ bạn duyệt tại trang này. Sau khi được duyệt, họ đăng nhập là vào học được ngay.</p></div>';
  return h;
}
async function setApproval(id, status) {
  const { error } = await sb.from('profiles').update({ status, decided_at: new Date().toISOString() }).eq('id', id);
  if (error) { toast('Chưa lưu được: ' + (error.message || 'lỗi kết nối')); return; }
  toast(status === 'approved' ? 'Đã duyệt thành viên' : status === 'rejected' ? 'Đã từ chối yêu cầu' : 'Đã thu hồi quyền học');
  adminRefresh();
}
function downloadJSON(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const ADMIN_H = {
  approve: t => setApproval(t.dataset.id, 'approved'),
  reject: t => setApproval(t.dataset.id, 'rejected'),
  revokeAsk: t => { ui.revokeId = t.dataset.id; rerender(); },
  revokeCancel: () => { ui.revokeId = null; rerender(); },
  revoke: t => { ui.revokeId = null; setApproval(t.dataset.id, 'revoked'); },
  adminOpen: t => { ADM.open = ADM.open === t.dataset.id ? null : t.dataset.id; rerender(); },
  adminReload: () => adminRefresh(),
  adminExport: () => downloadJSON('english-os-du-lieu-' + todayISO() + '.json', { exportedAt: new Date().toISOString(), profiles: ADM.profiles, progress: Object.values(ADM.progress) }),
  myExport: () => { if (S) downloadJSON('english-os-tien-do-cua-toi-' + todayISO() + '.json', S); },
  myImport: () => { const el = $('#importFile'); if (el) el.click(); }
};
/* Nhập tiến độ từ file JSON (bản Claude hoặc bản xuất trước đó) */
document.addEventListener('change', async e => {
  const t = e.target; if (!t || t.id !== 'importFile') return;
  const f = t.files && t.files[0]; if (!f) return;
  try {
    const raw = JSON.parse(await f.text()); const st = raw && raw.data && raw.data.blocks ? raw.data : raw;
    if (!st || !Array.isArray(st.blocks) || !st.startDate) throw new Error('bad');
    S = normalize(st); save(); route(); toast('Đã nhập tiến độ từ file');
  } catch { toast('File không đúng định dạng tiến độ English OS.'); }
  t.value = '';
});
