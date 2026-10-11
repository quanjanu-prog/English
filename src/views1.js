/* ===== Tính toán tiến độ ===== */
const weekNo = d => Math.floor(daysBetween(S.startDate, d) / 7) + 1;
const weekStart = w => addDays(S.startDate, (w - 1) * 7);
const blocksOn = d => S.blocks.filter(b => b.date === d).sort((a, b) => a.start.localeCompare(b.start));
const blkMin = b => minsOf(b.start, b.end);
const doneMin = b => b.status === 'done' ? (b.actual ?? blkMin(b)) : 0;
function weekStats(w) {
  const s = weekStart(w), e = addDays(s, 6);
  const bs = S.blocks.filter(b => b.date >= s && b.date <= e && b.status !== 'moved');
  const plan = bs.reduce((t, b) => t + blkMin(b), 0), done = bs.reduce((t, b) => t + doneMin(b), 0);
  return { bs, plan, done, n: bs.length, nd: bs.filter(b => b.status === 'done').length, nm: bs.filter(b => b.status === 'missed').length };
}
function totalDone() { return S.blocks.reduce((t, b) => t + doneMin(b), 0); }
function activeDays() {
  const set = new Set(Object.keys(S.act).filter(k => S.act[k] > 0));
  S.blocks.forEach(b => { if (b.status === 'done') set.add(b.date); });
  return set;
}
function streak() {
  const set = activeDays(); let d = todayISO(), n = 0;
  if (!set.has(d)) d = addDays(d, -1);
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
function vocabState(w) {
  const v = S.vocab[w]; const t = todayISO();
  if (!v || !v.seen) return { k: 'new', vi: 'Mới', cls: '' };
  if (v.due && v.due <= t) return { k: 'due', vi: 'Cần ôn', cls: 'warn' };
  if ((v.step || 0) >= 3) return { k: 'known', vi: 'Đã nhớ', cls: 'good' };
  return { k: 'learning', vi: 'Đang học', cls: 'acc' };
}
const dueWords = () => WORDS.filter(x => vocabState(x.w).k === 'due');
function vocabCounts() {
  let seen = 0, recog = 0, use = 0;
  WORDS.forEach(x => { const v = S.vocab[x.w]; if (v && v.seen) seen++; if (v && v.recog) recog++; if (v && v.use) use++; });
  return { seen, recog, use, due: dueWords().length, total: WORDS.length };
}
function skillProgress() {
  const pr = SOUNDS.reduce((t, s) => t + ((S.sounds[s.sym] && S.sounds[s.sym].rating) || 0), 0) / (SOUNDS.length * 3) * 100;
  const vc = vocabCounts(); const vo = (vc.recog * 0.7 + vc.use * 0.3) / vc.total * 100;
  const gr = GRAMMAR.reduce((t, g) => t + ((S.grammar[g.id] && S.grammar[g.id].best) || 0), 0) / GRAMMAR.length;
  const li = LISTEN.reduce((t, l) => { const x = S.listening[l.id] || {}; return t + (x.dict || 0) * 0.6 + (x.shadow ? 40 : 0); }, 0) / LISTEN.length;
  const realLv = REAL.reduce((t, r) => t + ((S.real[r.id] && S.real[r.id].lv) || 0), 0);
  const sp = realLv / (REAL.length * 3) * 70 + Math.min(S.speak.length, 20) / 20 * 30;
  const mods = ['m1','m3','m4'].map(m => (S.ecom[m] && S.ecom[m].best) || 0);
  const termP = pct(Object.values(S.terms).filter(Boolean).length, TERMS.length);
  const phrP = pct(Object.values(S.phrases).filter(Boolean).length, ADS_PHRASES.length);
  const ec = (mods.reduce((a, b) => a + b, 0) + termP + phrP) / 5;
  return { pron: Math.round(pr), vocab: Math.round(vo), grammar: Math.round(gr), listen: Math.round(li), speak: Math.round(sp), ecom: Math.round(ec) };
}
function weakSounds() { return SOUNDS.filter(s => S.sounds[s.sym] && S.sounds[s.sym].rating === 1); }
function topErrors(n = 3) { return Object.entries(S.errors).sort((a, b) => b[1].n - a[1].n || (b[1].d || '').localeCompare(a[1].d || '')).slice(0, n); }

/* ===== Khung trang và điều hướng ===== */
const NAV = [['dashboard','Dashboard'],['planner','Lịch học'],['pronunciation','Học tập'],['practice','Thực hành'],['progress','Tiến độ']];
const LEARN = [['pronunciation','03','Phát âm'],['vocabulary','04','Từ vựng & Ngữ pháp'],['listening','05','Nghe & Nói'],['ecommerce','06','Tiếng Anh TMĐT']];
const ROUTES = ['dashboard','planner','pronunciation','vocabulary','listening','ecommerce','practice','progress','admin'];
const curRoute = () => { const h = (location.hash || '').slice(1); return ROUTES.includes(h) ? h : 'dashboard'; };
function renderNav() {
  const r = curRoute(), learn = LEARN.some(x => x[0] === r);
  const gate = !['owner', 'member'].includes(access);
  const items = gate ? [] : NAV.concat(access === 'owner' && mode === 'cloud' ? [['admin', 'Quản trị' + (pendingCount() ? ' <span class="pill warn" style="margin-left:4px;padding:0 7px">' + pendingCount() + '</span>' : '')]] : []);
  $('#mainnav').innerHTML = items.map(([h, t]) => '<a href="#' + h + '" class="' + ((h === r || (h === 'pronunciation' && learn)) ? 'on' : '') + '">' + t + '</a>').join('');
  $('#mainnav').hidden = gate;
  const rc = $('#roleChip'); if (rc) { rc.hidden = mode !== 'cloud' || gate; rc.textContent = access === 'owner' ? 'Quản trị viên' : 'Thành viên'; }
  const sub = $('#subnav'); sub.hidden = !learn || gate;
  sub.innerHTML = LEARN.map(([h, n, t]) => '<a href="#' + h + '" class="' + (h === r ? 'on' : '') + '"><span>' + n + '</span>' + t + '</a>').join('');
  const ab = $('#accentBtn'); if (ab) ab.textContent = 'Giọng ' + (S && S.prefs.accent === 'uk' ? 'UK' : 'US');
}
function route() {
  renderNav();
  const v = $('#view');
  const authEl = $('#auth'), top = $('#topbar'), lo = $('#logoutBtn');
  if (lo) lo.hidden = mode !== 'cloud';
  if (mode !== 'loading' && needAuth()) { authEl.innerHTML = viewAuth(); authEl.hidden = false; v.hidden = true; top.hidden = true; ui.editId = null; renderSheet(); return; }
  authEl.hidden = true; authEl.innerHTML = ''; v.hidden = false; top.hidden = false;
  if (mode === 'loading' || access === 'checking') { v.innerHTML = '<div class="loading">Đang tải dữ liệu học tập…</div>'; return; }
  if (!['owner', 'member'].includes(access)) { v.innerHTML = viewGate(); renderSheet(); return; }
  const r = curRoute();
  if (r === 'admin') { if (access === 'owner' && mode === 'cloud') { v.innerHTML = viewAdmin(); renderSheet(); return; } location.hash = '#dashboard'; return; }
  if (!S) { v.innerHTML = viewOnboarding(); return; }
  const fn = { dashboard: viewDashboard, planner: viewPlanner, pronunciation: viewPron, vocabulary: viewVocab, listening: viewListening, ecommerce: viewEcom, practice: viewPractice, progress: viewProgress }[r];
  v.innerHTML = blockBanner(r) + fn();
  renderSheet();
}

/* ===== Liên kết block lịch học → bài học cụ thể ===== */
function blockTarget(b) {
  const w = clamp(Math.floor(daysBetween(S.startDate, b.date) / 7) + 1, 1, 12), p = WEEK_PLAN[w - 1], L = b.lesson || '';
  const has = s => L.toLowerCase().includes(s.toLowerCase());
  const byTitle = (arr, key, fb) => (arr.find(x => x.title && has(x.title)) || {}).id || fb;
  const nm = id => (arr => (arr.find(x => x.id === id) || {}).title)(GRAMMAR.concat(LISTEN, ECOM_MODS, REAL));
  if (b.skill === 'vocab') return { h: 'vocabulary', st: { vocTab: 'cards', card: null }, label: 'Flashcard từ vựng · ' + VOCAB_TOPICS[p.t] };
  if (b.skill === 'grammar') { const g = byTitle(GRAMMAR, 'title', p.g); return { h: 'vocabulary', st: { vocTab: 'grammar', grammar: g }, label: 'Ngữ pháp · ' + nm(g) }; }
  if (b.skill === 'pron') {
    if (has('Phân biệt')) { const i = Math.max(0, PAIRS.findIndex(x => p.s.includes(x.a) || p.s.includes(x.b))); return { h: 'pronunciation', st: { pronTab: 'pairs', pairSet: i }, label: 'Minimal Pairs · /' + PAIRS[i].a + '/ – /' + PAIRS[i].b + '/' }; }
    if (has('Trọng âm')) return { h: 'pronunciation', st: { pronTab: 'stress' }, label: 'Word Stress' };
    if (has('Âm cuối')) return { h: 'pronunciation', st: { pronTab: 'ending', endingKind: 's' }, label: 'Ending Sounds · -s / -ed' };
    const m = L.match(/\/([^\/]+)\//), sym = m && SOUNDS.some(s => s.sym === m[1]) ? m[1] : p.s[0];
    return { h: 'pronunciation', st: { pronTab: 'library', sound: sym }, label: 'IPA Library · âm /' + sym + '/' };
  }
  if (b.skill === 'listen') {
    const l = byTitle(LISTEN, 'title', p.l), tab = has('Chép chính tả') ? 'dict' : has('Shadowing') ? 'shadow' : 'lesson';
    return { h: 'listening', st: { listenTab: tab, lesson: l }, label: { dict: 'Dictation', shadow: 'Shadowing', lesson: 'Slow Listening' }[tab] + ' · ' + nm(l) };
  }
  if (b.skill === 'ecom') { const mo = has('Thuật ngữ') ? 'm2' : byTitle(ECOM_MODS, 'title', p.m); return { h: 'ecommerce', st: { ecom: mo }, label: 'TMĐT · ' + nm(mo) }; }
  if (b.skill === 'speak') {
    if (has('Ghi âm')) return { h: 'pronunciation', st: { pronTab: 'studio' }, label: 'Recording Studio' };
    if (has('Trả lời câu hỏi')) return { h: 'listening', st: { listenTab: 'speak' }, label: 'Speaking Practice' };
    const r = has('Viết tin nhắn') ? 'r6' : byTitle(REAL, 'title', p.r), lv = clamp(((S.real[r] || {}).lv || 0) + 1, 1, 3);
    return { h: 'practice', st: { real: r, realLv: lv }, label: 'Thực hành · ' + nm(r) + ' · cấp ' + lv };
  }
  if (b.skill === 'review') {
    if (has('kiểm tra')) { const k = has('A1') ? 't:a1' : 't:week'; return { h: 'progress', st: { progTab: 'tests', testKind: k }, test: k, label: k === 't:a1' ? 'Bài kiểm tra mốc A1' : 'Bài kiểm tra tuần' }; }
    return { h: 'progress', st: { progTab: 'errors' }, label: 'Nhật ký lỗi để ôn tuần' };
  }
  return { h: SKILLS[b.skill] ? SKILLS[b.skill].route : 'dashboard', st: {}, label: SKILLS[b.skill] ? SKILLS[b.skill].vi : 'Bài học' };
}
function goBlock(id) {
  const b = S.blocks.find(x => x.id === id); if (!b) return;
  const t = blockTarget(b);
  ui.editId = null; ui.fromBlock = id;
  if (t.h === 'vocabulary' && t.st.vocTab !== 'grammar') ui.grammar = null;
  if (t.h === 'ecommerce' || t.h === 'practice') { ui.ecom = null; ui.real = null; }
  Object.assign(ui, t.st);
  if (t.test && !(ui.quizzes[t.test] && Object.keys(ui.quizzes[t.test].ans).length < ui.quizzes[t.test].items.length)) ui.quizzes[t.test] = { items: t.test === 't:a1' ? makeA1Test() : makeWeekTest(), ans: {}, saved: false };
  S.last = { h: t.h, label: t.label, st: Object.assign({}, t.st, { card: undefined }) }; save();
  if (curRoute() === t.h) { renderSheet(); route(); window.scrollTo(0, 0); } else location.hash = '#' + t.h;
}
function blockBanner(r) {
  if (!ui.fromBlock) return '';
  const b = S.blocks.find(x => x.id === ui.fromBlock); if (!b) { ui.fromBlock = null; return ''; }
  const t = blockTarget(b); if (t.h !== r) return '';
  const done = b.status === 'done';
  return '<div class="card t-focus row" style="margin-bottom:16px;justify-content:space-between;padding:12px 14px"><div class="row" style="min-width:0"><span class="pill ' + (done ? 'good' : 'acc') + '">' + (done ? 'Đã xong' : 'Đang học') + '</span><span class="small"><b>' + esc(b.lesson) + '</b> <span class="muted num">· ' + DOW[dowOf(b.date)] + ' ' + fmtDM(b.date) + ', ' + b.start + '–' + b.end + '</span></span></div>' +
    '<div class="row">' + (done ? '' : '<button class="btn sm pri" data-a="bannerDone">Đánh dấu hoàn thành</button>') + '<a class="btn sm" href="#planner" data-a="bannerPlanner">Về lịch học</a><button class="btn sm ghost" data-a="bannerClose" aria-label="Ẩn thanh này">Ẩn</button></div></div>';
}
function rerender() { const y = window.scrollY; route(); window.scrollTo(0, y); }
const pageHead = (eyebrow, title, desc, right = '') => '<div class="pagehead"><div><div class="label">' + eyebrow + '</div><h1>' + title + '</h1>' + (desc ? '<p>' + desc + '</p>' : '') + '</div>' + right + '</div>';
const skillTag = k => '<span class="skill k-' + k + '">' + SKILLS[k].vi + '</span>';
const bar = (p, cls = '') => '<div class="bar ' + cls + '"><i style="width:' + clamp(p, 0, 100) + '%"></i></div>';

/* ===== Khởi tạo ===== */
function viewOnboarding() {
  const t = todayISO(); const def = dowOf(t) === 0 ? t : addDays(mondayOf(t), 7);
  return '<div class="hero-onb card"><div class="label">Personal Learning System</div><h1 style="margin:6px 0 8px">Bắt đầu lộ trình 12 tuần</h1>' +
    '<p class="muted">Mục tiêu giai đoạn nền tảng: từ 0 lên A1, khoảng 100 giờ. Lịch mẫu gồm 75 phút mỗi ngày từ thứ Hai đến thứ Sáu (5 block) và 90 phút thứ Bảy. Bạn có thể sửa từng block sau.</p>' +
    '<div class="field" style="margin:18px 0"><label for="onbStart">Ngày bắt đầu (nên chọn thứ Hai)</label><input type="date" id="onbStart" value="' + def + '"></div>' +
    '<button class="btn pri" data-a="onbStart">Tạo lộ trình</button>' +
    (mode === 'local' ? '<p class="note" style="margin-top:16px">Trang đang mở ngoài Claude nên tiến độ chỉ lưu trên trình duyệt này.</p>' : '') + '</div>';
}

/* ===== 01 Dashboard ===== */
function recommendations() {
  const out = [], t = todayISO(), w = clamp(weekNo(t), 1, 12), p = WEEK_PLAN[w - 1];
  const next = blocksOn(t).find(b => b.status === 'planned');
  if (next) out.push(['Block tiếp theo hôm nay: ' + next.lesson, next.start + '–' + next.end, next.link]);
  const due = dueWords().length; if (due >= 1) out.push(['Ôn ' + due + ' từ đến hạn', 'Lặp lại ngắt quãng', 'vocabulary']);
  const ws = weakSounds()[0]; if (ws) out.push(['Luyện lại âm /' + ws.sym + '/', 'Bạn tự đánh giá "Cần sửa"', 'pronunciation', { sound: ws.sym, pronTab: 'library' }]);
  const g = S.grammar[p.g]; if (!g || g.best < 80) out.push(['Hoàn thành ngữ pháp tuần ' + w + ': ' + GRAMMAR.find(x => x.id === p.g).title, g ? 'Điểm tốt nhất ' + g.best + '%' : 'Chưa làm bài', 'vocabulary', { vocTab: 'grammar', grammar: p.g }]);
  const te = topErrors(1)[0]; if (te) out.push(['Ôn lỗi lặp lại: ' + te[1].p.slice(0, 48), te[1].n + ' lần sai', 'progress', { progTab: 'errors' }]);
  return out.slice(0, 3);
}
function viewDashboard() {
  const t = todayISO(), wRaw = weekNo(t), w = clamp(wRaw, 1, 12), ws = weekStats(w), tot = totalDone(), str = streak();
  const today = blocksOn(t).filter(b => b.status !== 'moved'), td = today.filter(b => b.status === 'done').length;
  const sp = skillProgress(), vc = vocabCounts();
  const before = wRaw < 1;
  let h = pageHead(DOW[dowOf(t)] + ', ' + fmtDM(t) + ' · ' + (before ? 'Chưa bắt đầu (từ ' + fmtDM(S.startDate) + ')' : 'Tuần ' + w + '/12'), 'Hôm nay học gì?', 'Mục tiêu: English for E-commerce & Daily Life · 12 tuần · 100 giờ · đích A1.');
  h += '<div class="kpis"><div class="kpi tint k-pron"><div class="label">Tuần này</div><div class="v">' + fmtH(ws.done) + ' <small>/ ' + fmtH(ws.plan) + '</small></div>' + bar(pct(ws.done, ws.plan), 'acc') + '</div>' +
    '<div class="kpi tint k-speak"><div class="label">Chuỗi ngày học</div><div class="v">' + str + ' <small>ngày</small></div><div class="s">' + (str ? 'Giữ nhịp, học tiếp hôm nay' : 'Hoàn thành 1 block để bắt đầu chuỗi') + '</div></div>' +
    '<div class="kpi tint k-listen"><div class="label">Tổng giờ học</div><div class="v">' + (tot / 60).toFixed(1) + ' <small>/ 100 giờ</small></div>' + bar(tot / 60, '') + '</div>' +
    '<div class="kpi tint k-vocab"><div class="label">Từ vựng</div><div class="v">' + vc.recog + ' <small>/ ' + vc.total + ' nhận diện</small></div><div class="s">' + vc.use + ' từ tự dùng được · ' + vc.due + ' cần ôn</div></div></div>';
  h += '<div class="split" style="margin-top:16px"><div class="stack">';
  // Today's Focus
  h += '<div class="card t-focus"><div class="card-h"><h2>Today\'s Focus</h2><span class="pill">' + DOW[dowOf(t)] + '</span></div>';
  if (today.length) {
    h += '<div class="row small muted" style="justify-content:space-between;margin-bottom:6px"><span>Hoàn thành ' + td + '/' + today.length + ' nhiệm vụ</span><span class="mono-num" style="color:var(--fg)">' + pct(td, today.length) + '%</span></div>' + bar(pct(td, today.length), 'acc') + '<div style="margin-top:8px">';
    today.forEach(b => {
      h += '<div class="task ' + (b.status === 'done' ? 'done' : '') + '"><button class="chk ' + (b.status === 'done' ? 'on' : '') + '" data-a="toggleDone" data-id="' + b.id + '" aria-label="Đánh dấu hoàn thành">' + (b.status === 'done' ? ICON.check : '') + '</button>' +
        '<div class="t"><b>' + esc(b.lesson) + '</b><div class="meta"><span class="num">' + b.start + '–' + b.end + '</span><span>' + blkMin(b) + ' phút</span>' + skillTag(b.skill) + (b.status === 'missed' ? '<span class="pill crit">Bỏ lỡ</span>' : '') + '</div></div>' +
        '<button class="btn sm" data-a="goBlock" data-id="' + b.id + '" title="' + esc(blockTarget(b).label) + '">Vào bài</button></div>';
    });
    h += '</div>';
  } else h += '<div class="empty">' + (dowOf(t) === 6 ? 'Chủ nhật là ngày nghỉ theo lịch mẫu. Nếu muốn, hãy ôn vài từ đến hạn.' : 'Hôm nay chưa có block nào trong lịch.') + ' <a href="#planner">Mở lịch học</a></div>';
  h += '</div>';
  // Weekly progress
  const s = weekStart(w), days = [...Array(7)].map((_, i) => addDays(s, i));
  const vals = days.map(d => { const bs = blocksOn(d).filter(b => b.status !== 'moved'); return { d, plan: bs.reduce((x, b) => x + blkMin(b), 0), done: bs.reduce((x, b) => x + doneMin(b), 0) }; });
  const mx = Math.max(90, ...vals.map(v => Math.max(v.plan, v.done)));
  h += '<div class="card"><div class="card-h"><h2>Weekly Progress</h2><span class="small muted num">' + fmtH(ws.done) + ' / ' + fmtH(ws.plan) + ' · ' + pct(ws.done, ws.plan) + '%</span></div><div class="cols">' +
    vals.map((v, i) => '<div class="col"><span class="vl">' + (v.done ? v.done : '') + '</span><div class="stk"><div class="plan" style="height:' + (v.plan / mx * 100) + '%"></div><div class="done ' + (v.d === t ? 'today' : '') + '" style="height:' + (v.done / mx * 100) + '%"></div></div><span class="lb">' + ['T2','T3','T4','T5','T6','T7','CN'][i] + '</span></div>').join('') +
    '</div><div class="legend" style="margin-top:10px"><span><i style="border:1.5px dashed var(--line-2)"></i>Kế hoạch (phút)</span><span><i style="background:#9fb4ea"></i>Đã học</span><span><i style="background:var(--accent)"></i>Hôm nay</span></div></div>';
  h += '</div><div class="stack">';
  // Continue + recommendations
  h += '<div class="card t-next"><div class="card-h"><h2>Continue Learning</h2></div>' + (S.last ? '<button class="btn pri" data-a="continue" style="width:100%;justify-content:space-between"><span>' + esc(S.last.label) + '</span><span>Tiếp tục</span></button>' : '<p class="small muted">Chưa có bài học gần nhất. Bắt đầu từ Today\'s Focus.</p>') +
    '<div class="label" style="margin:16px 0 6px">Đề xuất cho bạn</div>' + recommendations().map((r, i) => '<button class="task" style="width:100%;border-left:0;border-right:0;border-bottom:0;background:none;text-align:left;padding:9px 0" data-a="goRec" data-i="' + i + '"><span class="pill acc">' + (i + 1) + '</span><span class="t"><b>' + esc(r[0]) + '</b><span class="meta">' + esc(r[1]) + '</span></span></button>').join('') + '</div>';
  // Skill progress
  h += '<div class="card"><div class="card-h"><h2>Skill Progress</h2><a class="small" href="#progress">Chi tiết</a></div>' +
    [['pron','Phát âm'],['vocab','Từ vựng'],['grammar','Ngữ pháp'],['listen','Nghe'],['speak','Nói'],['ecom','TMĐT']].map(([k, l]) => '<div class="skillrow k-' + k + '"><b>' + l + '</b>' + bar(sp[k], 'k') + '<span class="num">' + sp[k] + '%</span></div>').join('') + '</div>';
  // Weakness alert
  const errs = topErrors(3), wk = weakSounds();
  h += '<div class="card' + ((errs.length || wk.length || vc.due) ? ' t-alert' : '') + '"><div class="card-h"><h2>Weakness Alert</h2>' + ((errs.length || wk.length) ? '<span class="pill crit">' + (errs.length + wk.length) + ' điểm yếu</span>' : '') + '</div><div class="stack" style="gap:8px">';
  if (!errs.length && !wk.length && !vc.due) h += '<p class="small muted">Chưa có lỗi lặp lại. Lỗi sai trong bài tập và âm bạn chấm "Cần sửa" sẽ hiện ở đây.</p>';
  wk.slice(0, 3).forEach(s => { h += '<div class="alert crit"><span class="ic">!</span><div class="bd">Âm <span class="ipa" style="font-size:1.05rem">/' + esc(s.sym) + '/</span> cần sửa. ' + esc(s.trap) + '</div></div>'; });
  errs.forEach(([k, e]) => { h += '<div class="alert ' + (e.n >= 2 ? 'crit' : 'warn') + '"><span class="ic">' + e.n + '</span><div class="bd"><b>' + esc(e.k) + ':</b> ' + esc(e.p) + '<div class="tiny muted">Bạn chọn "' + esc(e.w) + '", đúng là "' + esc(e.r) + '"</div></div></div>'; });
  if (vc.due) h += '<div class="alert warn"><span class="ic">' + vc.due + '</span><div class="bd">' + vc.due + ' từ đến hạn ôn. <a href="#vocabulary">Ôn ngay</a></div></div>';
  h += '</div></div></div></div>';
  return h;
}

/* ===== 02 Study Planner ===== */
function viewPlanner() {
  const t = todayISO(); if (ui.week == null) ui.week = clamp(weekNo(t), 1, 12);
  const w = ui.week, s = weekStart(w), ws = weekStats(w);
  let h = pageHead('02 · Study Planner', 'Lịch học tuần ' + w, 'Time-blocking: mỗi block có giờ bắt đầu, kết thúc, kỹ năng và bài học. Đánh dấu hoàn thành, bỏ lỡ hoặc chuyển lịch.',
    '<div class="row"><button class="btn" data-a="weekNav" data-d="-1"' + (w <= 1 ? ' disabled' : '') + ' aria-label="Tuần trước">‹</button><span class="num small" style="min-width:112px;text-align:center">' + fmtDM(s) + ' – ' + fmtDM(addDays(s, 6)) + '</span><button class="btn" data-a="weekNav" data-d="1"' + (w >= 12 ? ' disabled' : '') + ' aria-label="Tuần sau">›</button><button class="btn" data-a="weekToday">Tuần này</button></div>');
  const bySkill = {}; ws.bs.forEach(b => { bySkill[b.skill] = bySkill[b.skill] || [0, 0]; bySkill[b.skill][0] += blkMin(b); bySkill[b.skill][1] += doneMin(b); });
  h += '<div class="kpis" style="margin-bottom:16px"><div class="kpi tint k-pron"><div class="label">Kế hoạch</div><div class="v">' + fmtH(ws.plan) + '</div><div class="s">' + ws.n + ' block</div></div>' +
    '<div class="kpi tint k-vocab"><div class="label">Thực học</div><div class="v">' + fmtH(ws.done) + '</div>' + bar(pct(ws.done, ws.plan), 'acc') + '</div>' +
    '<div class="kpi tint k-listen"><div class="label">Hoàn thành</div><div class="v">' + pct(ws.nd, ws.n) + '%</div><div class="s">' + ws.nd + '/' + ws.n + ' block</div></div>' +
    '<div class="kpi tint ' + (ws.nm ? 'k-crit' : 'k-review') + '"><div class="label">Bỏ lỡ</div><div class="v">' + ws.nm + '</div><div class="s">Chuyển lịch để học bù</div></div></div>';
  if (!ws.bs.length) h += '<div class="empty" style="margin-bottom:16px">Tuần này chưa có block. <button class="btn sm" data-a="applyTemplate">Áp dụng lịch mẫu tuần ' + w + '</button></div>';
  h += '<div class="week">';
  for (let i = 0; i < 7; i++) {
    const d = addDays(s, i), bs = blocksOn(d);
    h += '<div class="day ' + (d === t ? 'today' : '') + '"><div class="day-h"><b>' + DOW[i] + '</b><span>' + fmtDM(d) + '</span></div>';
    bs.forEach(b => {
      const stv = { done: ['Xong', 'good'], missed: ['Bỏ lỡ', 'crit'], moved: ['Đã chuyển', ''], planned: ['', ''] }[b.status];
      h += '<div class="blk k-' + b.skill + ' st-' + b.status + '"><button class="chk ' + (b.status === 'done' ? 'on' : '') + '" data-a="toggleDone" data-id="' + b.id + '" aria-label="Hoàn thành">' + (b.status === 'done' ? ICON.check : '') + '</button>' +
        '<button class="blk-main" data-a="editBlock" data-id="' + b.id + '"><span class="tm">' + b.start + '–' + b.end + '</span><span class="sk">' + SKILLS[b.skill].vi + (b.pri === 'cao' ? ' · ưu tiên' : '') + '</span><span class="ls">' + esc(b.lesson) + '</span>' + (stv[0] ? '<span class="st" style="color:var(--' + (stv[1] || 'muted') + ')">' + stv[0] + (b.status === 'done' && b.actual != null && b.actual !== blkMin(b) ? ' · ' + b.actual + ' phút' : '') + '</span>' : '') + '</button>' + (b.status === 'moved' ? '' : '<button class="blk-go" data-a="goBlock" data-id="' + b.id + '" aria-label="Vào bài: ' + esc(blockTarget(b).label) + '" title="Vào bài: ' + esc(blockTarget(b).label) + '">›</button>') + '</div>';
    });
    h += '<button class="addblk" data-a="newBlock" data-d="' + d + '">+ Thêm block</button></div>';
  }
  h += '</div>';
  h += '<div class="grid g2" style="margin-top:16px"><div class="card"><div class="card-h"><h3>Thời gian theo kỹ năng</h3><span class="small muted">phút thực học / kế hoạch</span></div><div class="tbl-wrap"><table><thead><tr><th>Kỹ năng</th><th class="num">Kế hoạch</th><th class="num">Thực học</th><th style="width:40%">Tỷ lệ</th></tr></thead><tbody>' +
    Object.entries(bySkill).map(([k, [p, d]]) => '<tr class="k-' + k + '"><td>' + skillTag(k) + '</td><td class="num">' + p + '</td><td class="num">' + d + '</td><td>' + bar(pct(d, p), 'k') + '</td></tr>').join('') + '</tbody></table></div></div>' +
    '<div class="card"><h3 style="margin-bottom:8px">Cách dùng lịch</h3><div class="stack small muted" style="gap:6px"><p>Bấm vòng tròn để đánh dấu xong; số phút thực học mặc định bằng độ dài block, sửa được trong block.</p><p>Bấm nút › ở góc mỗi block để vào thẳng bài học tương ứng: đúng âm, đúng chủ điểm ngữ pháp, đúng bài nghe hoặc module.</p><p>Bấm vào nội dung block để đổi giờ, kỹ năng, bài học, mức ưu tiên, trạng thái hoặc chuyển sang ngày khác.</p><p>Không cần học liên tục: chia 75 phút thành sáng, trưa và tối như lịch mẫu.</p><p>Lộ trình bắt đầu ngày ' + fmtDM(S.startDate) + '/' + parseISO(S.startDate).getFullYear() + '.</p></div></div></div>';
  return h;
}
function renderSheet() {
  const el = $('#sheet');
  if (!ui.editId) { el.innerHTML = ''; return; }
  const isNew = ui.editId === 'new';
  const b = isNew ? { date: ui.newBlockDate, start: '20:00', end: '20:15', skill: 'vocab', lesson: '', pri: 'vừa', status: 'planned', actual: null, link: 'vocabulary' } : S.blocks.find(x => x.id === ui.editId);
  if (!b) { ui.editId = null; el.innerHTML = ''; return; }
  const opt = (arr, v) => arr.map(([k, l]) => '<option value="' + k + '"' + (k === v ? ' selected' : '') + '>' + l + '</option>').join('');
  el.innerHTML = '<div class="sheet-bg" data-a="closeSheet"><div class="sheet" role="dialog" aria-label="Chỉnh block học" data-stop="1">' +
    '<div class="row" style="justify-content:space-between"><h2>' + (isNew ? 'Thêm block học' : 'Chỉnh block học') + '</h2><button class="btn ghost sm" data-a="closeSheet">Đóng</button></div>' +
    (isNew ? '' : '<div class="card flat stack" style="gap:8px;padding:14px"><div class="label">Bài học của block này</div><b>' + esc(blockTarget(b).label) + '</b><button class="btn acc" data-a="goBlock" data-id="' + b.id + '" style="width:100%">Vào bài học ›</button></div>') +
    '<div class="grid g2" style="gap:10px"><div class="field"><label for="bDate">Ngày học</label><input type="date" id="bDate" value="' + b.date + '"></div><div class="field"><label for="bSkill">Kỹ năng</label><select id="bSkill">' + opt(Object.entries(SKILLS).map(([k, v]) => [k, v.vi]), b.skill) + '</select></div>' +
    '<div class="field"><label for="bStart">Bắt đầu</label><input type="time" id="bStart" value="' + b.start + '"></div><div class="field"><label for="bEnd">Kết thúc</label><input type="time" id="bEnd" value="' + b.end + '"></div></div>' +
    '<div class="field"><label for="bLesson">Bài học</label><input type="text" id="bLesson" value="' + esc(b.lesson) + '" placeholder="Ví dụ: Luyện âm /θ/"></div>' +
    '<div class="grid g2" style="gap:10px"><div class="field"><label for="bPri">Ưu tiên</label><select id="bPri">' + opt([['cao','Cao'],['vừa','Vừa'],['thấp','Thấp']], b.pri) + '</select></div>' +
    '<div class="field"><label for="bStatus">Trạng thái</label><select id="bStatus">' + opt([['planned','Kế hoạch'],['done','Hoàn thành'],['missed','Bỏ lỡ'],['moved','Đã chuyển']], b.status) + '</select></div></div>' +
    '<div class="field"><label for="bActual">Số phút thực học</label><input type="number" id="bActual" min="0" max="300" value="' + (b.actual ?? '') + '" placeholder="' + blkMin(b) + '"></div>' +
    '<div class="row"><button class="btn pri" data-a="saveBlock">Lưu</button>' + (isNew ? '' : '<button class="btn" data-a="quickStatus" data-s="done">Hoàn thành</button><button class="btn" data-a="quickStatus" data-s="missed">Bỏ lỡ</button>') + '</div>' +
    (isNew ? '' : '<div class="card flat"><h3 style="margin-bottom:8px">Chuyển lịch</h3><div class="grid g2" style="gap:10px"><div class="field"><label for="bMoveDate">Sang ngày</label><input type="date" id="bMoveDate" value="' + addDays(b.date, 1) + '"></div><div class="field"><label for="bMoveStart">Giờ bắt đầu</label><input type="time" id="bMoveStart" value="' + b.start + '"></div></div><button class="btn" style="margin-top:10px" data-a="moveBlock">Chuyển block</button><p class="tiny muted" style="margin-top:6px">Block cũ được đánh dấu "Đã chuyển", block mới giữ nguyên thời lượng.</p></div>' +
      '<div class="row" style="margin-top:auto">' + (ui.confirmDel ? '<span class="small">Xóa block này?</span><button class="btn danger sm" data-a="delBlock">Xóa</button><button class="btn sm" data-a="cancelDel">Giữ lại</button>' : '<button class="btn ghost sm danger" data-a="askDel">Xóa block</button>') + '</div>') +
    '</div></div>';
}
