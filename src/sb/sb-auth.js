/* ===== Bản độc lập: màn hình đăng nhập / đăng ký bằng email và mật khẩu ===== */
ui.authTab = 'login';
const needAuth = () => mode === 'cloud' && access !== 'checking' && (ui.recovery || !['owner', 'member'].includes(access));
const ICON_LOCK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2"/></svg>';
const ICON_CAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/><path d="M22 9v6"/></svg>';
const AUTH_ERR = [
  [/invalid login credentials/i, 'Email hoặc mật khẩu chưa đúng.'],
  [/already registered|already exists/i, 'Email này đã có tài khoản. Hãy chuyển sang tab Đăng nhập.'],
  [/email not confirmed/i, 'Bạn chưa xác nhận email. Mở hộp thư và bấm vào link xác nhận trước khi đăng nhập.'],
  [/rate limit|too many/i, 'Bạn thao tác quá nhanh. Đợi vài phút rồi thử lại.'],
  [/password.*(at least|should be|weak)/i, 'Mật khẩu quá yếu. Dùng ít nhất 8 ký tự, có cả chữ và số.'],
  [/invalid.*email|email.*invalid/i, 'Email chưa đúng định dạng.'],
  [/fetch|network/i, 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.']
];
const authMsg = e => { const m = (e && (e.message || e.error_description)) || ''; const hit = AUTH_ERR.find(([re]) => re.test(m)); return hit ? hit[1] : 'Có lỗi xảy ra: ' + (m || 'không rõ nguyên nhân') + '.'; };
const field = (id, label, type, val, extra = '') => '<div class="field"><label for="' + id + '">' + label + '</label><input type="' + type + '" id="' + id + '" value="' + esc(val || '') + '" ' + extra + '></div>';
function authAccount() {
  const name = (PROFILE && PROFILE.full_name) || (AUTH_USER && AUTH_USER.email) || '';
  const role = access === 'owner' ? '<span class="pill acc">Quản trị viên</span>' : access === 'member' ? '<span class="pill good">Thành viên</span>' : access === 'pending' ? '<span class="pill warn">Chờ duyệt</span>' : '<span class="pill crit">Chưa có quyền học</span>';
  return '<div class="auth-acct"><span class="auth-av auth-av-f">' + esc((name || '?').slice(0, 1).toUpperCase()) + '</span><div style="min-width:0;flex:1"><b class="auth-name">' + esc(name) + '</b><div class="tiny muted auth-name">' + esc(AUTH_USER ? AUTH_USER.email : '') + '</div></div>' + role + '</div>';
}
const msgBox = () => (GATE.err ? '<div class="alert crit"><span class="ic">!</span><div class="bd">' + esc(GATE.err) + '</div></div>' : '') + (GATE.info ? '<div class="auth-state good"><span>' + esc(GATE.info) + '</span></div>' : '');
function paneSignedIn() {
  const p = PROFILE || {};
  if (access === 'pending') return authAccount() +
    '<div class="auth-state warn"><b>Tài khoản đang chờ duyệt</b><span>Đăng ký lúc ' + fmtDT(p.requested_at) + '. Quản trị viên duyệt xong, bạn bấm Kiểm tra lại hoặc đăng nhập lần sau là vào học được.</span></div>' +
    (AUTH_USER && AUTH_USER.email === ADMIN_EMAIL ? '<div class="auth-state"><b>Bạn là quản trị viên?</b><span>Chạy lệnh SQL ở bước 7 trong file english-os-setup.sql để cấp quyền quản trị cho tài khoản này, rồi bấm Kiểm tra lại.</span></div>' : '') +
    '<button class="btn pri auth-cta" data-a="authRecheck"' + (GATE.busy ? ' disabled' : '') + '>' + (GATE.busy ? 'Đang kiểm tra…' : 'Kiểm tra lại') + '</button><button class="btn auth-cta" data-a="logout">Đăng xuất</button>';
  if (access === 'rejected') return authAccount() +
    '<div class="auth-state crit"><b>Yêu cầu đăng ký chưa được chấp nhận</b><span>Liên hệ quản trị viên qua <span class="num">' + ADMIN_EMAIL + '</span> hoặc gửi lại yêu cầu.</span></div>' + msgBox() +
    '<button class="btn pri auth-cta" data-a="reapply"' + (GATE.busy ? ' disabled' : '') + '>Gửi lại yêu cầu</button><button class="btn auth-cta" data-a="logout">Đăng xuất</button>';
  if (access === 'revoked') return authAccount() +
    '<div class="auth-state crit"><b>Quyền học đã bị thu hồi</b><span>Liên hệ quản trị viên qua <span class="num">' + ADMIN_EMAIL + '</span> nếu bạn cần trao đổi.</span></div><button class="btn auth-cta" data-a="logout">Đăng xuất</button>';
  return authAccount() + '<div class="auth-state crit"><b>Chưa tìm thấy hồ sơ thành viên</b><span>Tài khoản đã tạo nhưng hồ sơ chưa có. Bấm Kiểm tra lại sau vài giây; nếu vẫn vậy, liên hệ ' + ADMIN_EMAIL + '.</span></div><button class="btn pri auth-cta" data-a="authRecheck">Kiểm tra lại</button><button class="btn auth-cta" data-a="logout">Đăng xuất</button>';
}
function paneLogin() {
  return '<form class="stack" style="gap:12px" data-form="login" novalidate>' +
    field('liEmail', 'Email', 'email', ui.liEmail, 'autocomplete="email" inputmode="email" placeholder="ban@email.com" required') +
    field('liPass', 'Mật khẩu', 'password', '', 'autocomplete="current-password" placeholder="••••••••" required') +
    '<div class="row" style="justify-content:flex-end;margin-top:-4px"><button type="button" class="btn ghost sm" data-a="authTab" data-k="forgot">Quên mật khẩu?</button></div>' + msgBox() +
    '<button type="submit" class="btn pri auth-cta"' + (GATE.busy ? ' disabled' : '') + '>' + (GATE.busy ? 'Đang đăng nhập…' : 'Đăng nhập') + '</button>' +
    '<p class="tiny muted auth-c">Chưa có tài khoản? <button type="button" class="btn ghost sm" style="padding:0 4px" data-a="authTab" data-k="register">Đăng ký</button></p></form>';
}
function paneRegister() {
  return '<form class="stack" style="gap:12px" data-form="register" novalidate>' +
    field('rgName', 'Họ và tên', 'text', ui.rgName, 'autocomplete="name" maxlength="80" placeholder="Nguyễn Văn A" required') +
    field('rgEmail', 'Email', 'email', ui.rgEmail, 'autocomplete="email" inputmode="email" placeholder="ban@email.com" required') +
    '<div class="grid g2" style="gap:10px">' + field('rgPass', 'Mật khẩu', 'password', '', 'autocomplete="new-password" placeholder="Ít nhất 8 ký tự" required') + field('rgPass2', 'Nhập lại mật khẩu', 'password', '', 'autocomplete="new-password" required') + '</div>' +
    '<div class="grid g2" style="gap:10px"><div class="field"><label for="rgGoal">Mục tiêu</label><select id="rgGoal">' + Object.entries(GOALS).map(([k, v]) => '<option value="' + k + '">' + v + '</option>').join('') + '</select></div>' +
    '<div class="field"><label for="rgLevel">Trình độ</label><select id="rgLevel">' + Object.entries(LEVELS).map(([k, v]) => '<option value="' + k + '">' + v + '</option>').join('') + '</select></div></div>' +
    '<label class="auth-check"><input type="checkbox" id="rgConsent"><span>Tôi đồng ý để quản trị viên xem tiến độ học của tôi. Thành viên khác không xem được.</span></label>' + msgBox() +
    '<button type="submit" class="btn pri auth-cta"' + (GATE.busy ? ' disabled' : '') + '>' + (GATE.busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản') + '</button>' +
    '<p class="tiny muted auth-c">Tài khoản mới cần quản trị viên duyệt trước khi vào học.</p></form>';
}
function paneForgot() {
  return '<form class="stack" style="gap:12px" data-form="forgot" novalidate><p class="small muted">Nhập email đã đăng ký. Chúng tôi gửi link đặt lại mật khẩu vào hộp thư của bạn.</p>' +
    field('fgEmail', 'Email', 'email', ui.liEmail, 'autocomplete="email" inputmode="email" required') + msgBox() +
    '<button type="submit" class="btn pri auth-cta"' + (GATE.busy ? ' disabled' : '') + '>Gửi link đặt lại</button><button type="button" class="btn auth-cta" data-a="authTab" data-k="login">Quay lại đăng nhập</button></form>';
}
function paneRecovery() {
  return '<form class="stack" style="gap:12px" data-form="recovery" novalidate><p class="small muted">Đặt mật khẩu mới cho tài khoản ' + esc(AUTH_USER ? AUTH_USER.email : '') + '.</p>' +
    field('rcPass', 'Mật khẩu mới', 'password', '', 'autocomplete="new-password" placeholder="Ít nhất 8 ký tự" required') +
    field('rcPass2', 'Nhập lại mật khẩu mới', 'password', '', 'autocomplete="new-password" required') + msgBox() +
    '<button type="submit" class="btn pri auth-cta"' + (GATE.busy ? ' disabled' : '') + '>Lưu mật khẩu mới</button></form>';
}
function viewAuth() {
  const signedIn = !!AUTH_USER && !ui.recovery;
  const tab = ui.recovery ? 'recovery' : signedIn ? 'status' : (ui.authTab || 'login');
  const title = { login: 'Chào mừng trở lại', register: 'Tạo tài khoản học', forgot: 'Quên mật khẩu', recovery: 'Đặt mật khẩu mới', status: 'Tài khoản của bạn' }[tab];
  const sub = { login: 'Đăng nhập để tiếp tục lộ trình của bạn', register: 'Đăng ký thành viên English OS', forgot: 'Lấy lại quyền truy cập tài khoản', recovery: 'Bước cuối để lấy lại tài khoản', status: 'Trạng thái đăng ký' }[tab];
  const ipa = ['θ', 'ʃ', 'æ', 'ð', 'ŋ', 'ɜː', 'eɪ', 'ʒ', 'iː', 'ə', 'tʃ', 'r'];
  const pos = [[6,8],[62,5],[80,22],[12,30],[70,40],[4,58],[52,66],[84,62],[24,82],[64,86],[40,18],[30,48]];
  return '<div class="auth">' +
    '<section class="auth-brand"><div class="auth-ipa" aria-hidden="true">' + ipa.map((s, i) => '<span style="left:' + pos[i][0] + '%;top:' + pos[i][1] + '%;font-size:' + (2 + (i % 4) * 0.6) + 'rem;transform:rotate(' + ((i % 5) - 2) * 4 + 'deg)">/' + s + '/</span>').join('') + '</div>' +
      '<div class="auth-brand-in"><div class="auth-logo">' + ICON_CAP + '<span><b>ENGLISH OS</b><small>Personal Learning System</small></span></div>' +
      '<h1 class="auth-h">Tiếng Anh cho công việc TMĐT, mỗi ngày 75 phút.</h1>' +
      '<ul class="auth-pts"><li><b>44 âm IPA</b><span>Phát âm chuẩn từ ngày đầu, nghe mẫu và tự ghi âm</span></li><li><b>800 từ vựng</b><span>12 chủ đề, ôn theo lặp lại ngắt quãng</span></li><li><b>12 tuần, 0 → A1</b><span>Lịch time-blocking và theo dõi tiến độ</span></li></ul>' +
      '<div class="auth-quote"><span class="ipa">/kənˈvɜːʃn reɪt/</span> conversion rate · tỷ lệ chuyển đổi</div></div></section>' +
    '<section class="auth-side"><div class="auth-card"><div class="auth-mark">' + ICON_CAP + '</div><h2 class="auth-title">' + title + '</h2><p class="small muted" style="text-align:center;margin-bottom:18px">' + sub + '</p>' +
      (tab === 'login' || tab === 'register' ? '<div class="auth-tabs" role="tablist"><button role="tab" class="' + (tab === 'login' ? 'on' : '') + '" data-a="authTab" data-k="login">Đăng nhập</button><button role="tab" class="' + (tab === 'register' ? 'on' : '') + '" data-a="authTab" data-k="register">Đăng ký</button></div>' : '') +
      '<div class="auth-pane">' + ({ login: paneLogin, register: paneRegister, forgot: paneForgot, recovery: paneRecovery, status: paneSignedIn }[tab])() + '</div>' +
      '<div class="auth-foot">' + ICON_LOCK + '<span>Mật khẩu được mã hóa và quản lý bởi Supabase. English OS không lưu mật khẩu của bạn.</span></div>' +
    '</div></section></div>';
}
async function submitAuth(kind) {
  const v = id => ($('#' + id) || {}).value || '';
  GATE.err = ''; GATE.info = '';
  if (kind === 'login') {
    const email = v('liEmail').trim(), password = v('liPass'); ui.liEmail = email;
    if (!email || !password) { GATE.err = 'Nhập email và mật khẩu.'; route(); return; }
    GATE.busy = true; route();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    GATE.busy = false; if (error) { GATE.err = authMsg(error); route(); }
    return;
  }
  if (kind === 'register') {
    const name = v('rgName').trim(), email = v('rgEmail').trim(), p1 = v('rgPass'), p2 = v('rgPass2'), goal = v('rgGoal'), level = v('rgLevel'), consent = $('#rgConsent').checked;
    ui.rgName = name; ui.rgEmail = email;
    if (name.length < 2) GATE.err = 'Nhập họ và tên.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) GATE.err = 'Email chưa đúng định dạng.';
    else if (p1.length < 8 || !/[A-Za-z]/.test(p1) || !/\d/.test(p1)) GATE.err = 'Mật khẩu cần ít nhất 8 ký tự, có cả chữ và số.';
    else if (p1 !== p2) GATE.err = 'Hai lần nhập mật khẩu chưa khớp.';
    else if (!consent) GATE.err = 'Bạn cần đồng ý để quản trị viên theo dõi tiến độ.';
    if (GATE.err) { route(); return; }
    GATE.busy = true; route();
    const { data, error } = await sb.auth.signUp({ email, password: p1, options: { data: { full_name: name, goal, level, contact: email, consent: true }, emailRedirectTo: location.origin + location.pathname } });
    GATE.busy = false;
    if (error) { GATE.err = authMsg(error); route(); return; }
    if (data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) { GATE.err = 'Email này đã có tài khoản. Hãy chuyển sang tab Đăng nhập.'; route(); return; }
    if (!data.session) { ui.authTab = 'login'; ui.liEmail = email; GATE.info = 'Đã tạo tài khoản. Mở email ' + email + ' và bấm link xác nhận, sau đó đăng nhập. Quản trị viên sẽ duyệt tài khoản của bạn.'; route(); }
    return;
  }
  if (kind === 'forgot') {
    const email = v('fgEmail').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { GATE.err = 'Email chưa đúng định dạng.'; route(); return; }
    GATE.busy = true; route();
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    GATE.busy = false;
    if (error) GATE.err = authMsg(error); else GATE.info = 'Nếu email này đã đăng ký, link đặt lại mật khẩu đã được gửi. Kiểm tra cả thư mục Spam.';
    route(); return;
  }
  if (kind === 'recovery') {
    const p1 = v('rcPass'), p2 = v('rcPass2');
    if (p1.length < 8 || !/[A-Za-z]/.test(p1) || !/\d/.test(p1)) { GATE.err = 'Mật khẩu cần ít nhất 8 ký tự, có cả chữ và số.'; route(); return; }
    if (p1 !== p2) { GATE.err = 'Hai lần nhập mật khẩu chưa khớp.'; route(); return; }
    GATE.busy = true; route();
    const { error } = await sb.auth.updateUser({ password: p1 });
    GATE.busy = false;
    if (error) { GATE.err = authMsg(error); route(); return; }
    ui.recovery = false; toast('Đã đổi mật khẩu'); await refreshAccess(true);
  }
}
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault(); submitAuth(f.dataset.form);
});
const AUTH_H = {
  authTab: t => { ui.authTab = t.dataset.k; GATE.err = ''; GATE.info = ''; route(); },
  authRecheck: async () => { GATE.busy = true; route(); await refreshAccess(true); GATE.busy = false; route(); },
  reapply: async () => {
    GATE.busy = true; route();
    const { error } = await sb.from('profiles').update({ status: 'pending', requested_at: new Date().toISOString() }).eq('id', MY_ID);
    GATE.busy = false; if (error) GATE.err = 'Chưa gửi lại được: ' + error.message; await refreshAccess(true);
  },
  logout: async () => { await sb.auth.signOut(); ui.authTab = 'login'; ui.editId = null; window.scrollTo(0, 0); }
};

/* Không có Claude trong bản độc lập: ẩn phần chấm câu bằng AI */
function aiBlock() { return ''; }
/* Khởi tạo lộ trình: thêm lựa chọn nhập tiến độ từ bản cũ */
function viewOnboarding() {
  const t = todayISO(); const def = dowOf(t) === 0 ? t : addDays(mondayOf(t), 7);
  return '<div class="hero-onb card"><div class="label">Personal Learning System</div><h1 style="margin:6px 0 8px">Bắt đầu lộ trình 12 tuần</h1>' +
    '<p class="muted">Mục tiêu giai đoạn nền tảng: từ 0 lên A1, khoảng 100 giờ. Lịch mẫu gồm 75 phút mỗi ngày từ thứ Hai đến thứ Sáu và 90 phút thứ Bảy. Bạn có thể sửa từng block sau.</p>' +
    '<div class="field" style="margin:18px 0"><label for="onbStart">Ngày bắt đầu (nên chọn thứ Hai)</label><input type="date" id="onbStart" value="' + def + '"></div>' +
    '<div class="row"><button class="btn pri" data-a="onbStart">Tạo lộ trình</button><button class="btn" data-a="myImport">Nhập tiến độ từ file</button><input type="file" id="importFile" accept="application/json,.json" hidden></div>' +
    '<p class="tiny muted" style="margin-top:10px">Đã học trên bản English OS cũ? Chọn "Nhập tiến độ từ file" và dùng file sao lưu .json để tiếp tục đúng chỗ đang học.</p></div>';
}
/* Trang Tiến độ › Việc làm được: thêm khối sao lưu */
function progCando() {
  return '<div class="card" style="margin-bottom:16px"><div class="card-h"><h2>Việc làm được bằng tiếng Anh</h2><span class="small muted">Đánh dấu khi bạn đã làm được việc đó trong thực tế</span></div>' +
    CAN_DO.map((c, i) => { const d = S.cando[i]; return '<div class="task ' + (d ? 'done' : '') + '"><button class="chk ' + (d ? 'on' : '') + '" data-a="candoMark" data-i="' + i + '" aria-label="Đã làm được">' + (d ? ICON.check : '') + '</button><div class="t"><b style="text-decoration:none">' + esc(c) + '</b>' + (d ? '<span class="meta">Làm được từ ' + fmtDM(d) + '</span>' : '') + '</div></div>'; }).join('') + '</div>' +
    '<div class="card flat"><h3 style="margin-bottom:6px">Sao lưu tiến độ</h3><p class="small muted" style="margin-bottom:10px">Tải bản sao lưu về máy hoặc nhập lại từ file. Nhập file sẽ thay thế tiến độ hiện tại.</p><div class="row"><button class="btn" data-a="myExport">Tải bản sao lưu (.json)</button><button class="btn" data-a="myImport">Nhập từ file</button><input type="file" id="importFile" accept="application/json,.json" hidden></div></div>';
}
