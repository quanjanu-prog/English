/* ===== Sự kiện ===== */
const H = {
  say: t => speak(t.dataset.t, +t.dataset.r || 1),
  accent: () => { if (!S) return; S.prefs.accent = S.prefs.accent === 'uk' ? 'us' : 'uk'; renderNav(); save(); toast('Giọng đọc mẫu: ' + (S.prefs.accent === 'uk' ? 'Anh (UK)' : 'Mỹ (US)')); },
  tab: t => { ui[t.dataset.v] = t.dataset.k; if (t.dataset.v === 'vocTab' && t.dataset.k !== 'grammar') ui.grammar = ui.grammar; rerender(); },
  toggle: t => { ui[t.dataset.v] = !ui[t.dataset.v]; if (t.dataset.v === 'rolePlay') ui.reveal = {}; rerender(); },
  onbStart: () => {
    const v = ($('#onbStart') || {}).value || todayISO(); const start = mondayOf(v);
    S = blankState(start); S.blocks = buildAllBlocks(start); save(); location.hash = '#dashboard'; rerender();
    toast('Đã tạo lộ trình 12 tuần, bắt đầu ' + fmtDM(start));
  },
  toggleDone: t => {
    const b = S.blocks.find(x => x.id === t.dataset.id); if (!b) return;
    if (b.status === 'done') { b.status = 'planned'; b.actual = null; } else { b.status = 'done'; if (b.actual == null) b.actual = blkMin(b); }
    save(); rerender();
  },
  continue: () => { if (!S.last) return; Object.assign(ui, S.last.st || {}); if (curRoute() === S.last.h) rerender(); else location.hash = '#' + S.last.h; },
  goRec: t => { const r = recommendations()[+t.dataset.i]; if (!r) return; Object.assign(ui, r[3] || {}); if (curRoute() === r[2]) rerender(); else location.hash = '#' + r[2]; },
  goBlock: t => goBlock(t.dataset.id),
  bannerDone: () => { const b = S.blocks.find(x => x.id === ui.fromBlock); if (!b) return; b.status = 'done'; if (b.actual == null) b.actual = blkMin(b); logAct(); save(); rerender(); toast('Đã hoàn thành: ' + b.lesson); },
  bannerPlanner: () => { const b = S.blocks.find(x => x.id === ui.fromBlock); if (b) ui.week = clamp(Math.floor(daysBetween(S.startDate, b.date) / 7) + 1, 1, 12); ui.fromBlock = null; location.hash = '#planner'; },
  bannerClose: () => { ui.fromBlock = null; rerender(); },
  weekNav: t => { ui.week = clamp(ui.week + +t.dataset.d, 1, 12); rerender(); },
  weekToday: () => { ui.week = clamp(weekNo(todayISO()), 1, 12); rerender(); },
  applyTemplate: () => { S.blocks.push(...buildWeekBlocks(ui.week - 1, weekStart(ui.week), addDays, uid)); save(); rerender(); },
  editBlock: t => { ui.editId = t.dataset.id; ui.confirmDel = false; renderSheet(); },
  newBlock: t => { ui.editId = 'new'; ui.newBlockDate = t.dataset.d; ui.confirmDel = false; renderSheet(); },
  closeSheet: (t, e) => { if (e.target.closest('[data-stop]') && t.classList.contains('sheet-bg')) return; ui.editId = null; renderSheet(); },
  saveBlock: () => {
    const g = id => $('#' + id).value;
    const start = g('bStart'), end = g('bEnd');
    if (!g('bDate') || !start || !end || minsOf(start, end) <= 0) { toast('Giờ kết thúc phải sau giờ bắt đầu.'); return; }
    const data = { date: g('bDate'), start, end, skill: g('bSkill'), lesson: g('bLesson').trim() || SKILLS[g('bSkill')].vi, pri: g('bPri'), status: g('bStatus') };
    const act = g('bActual'); data.actual = act === '' ? (data.status === 'done' ? minsOf(start, end) : null) : clamp(+act, 0, 300);
    data.link = SKILLS[data.skill].route;
    if (ui.editId === 'new') S.blocks.push(Object.assign({ id: uid() }, data));
    else { const b = S.blocks.find(x => x.id === ui.editId); if (b.skill !== data.skill) b.link = data.link; else delete data.link; Object.assign(b, data); }
    ui.editId = null; save(); rerender(); toast('Đã lưu block');
  },
  quickStatus: t => { const b = S.blocks.find(x => x.id === ui.editId); b.status = t.dataset.s; if (b.status === 'done' && b.actual == null) b.actual = blkMin(b); ui.editId = null; save(); rerender(); },
  moveBlock: () => {
    const b = S.blocks.find(x => x.id === ui.editId), d = $('#bMoveDate').value, st = $('#bMoveStart').value;
    if (!d || !st) { toast('Chọn ngày và giờ mới.'); return; }
    const len = blkMin(b), [hh, mm] = st.split(':').map(Number), endM = Math.min(hh * 60 + mm + len, 23 * 60 + 59);
    S.blocks.push(Object.assign({}, b, { id: uid(), date: d, start: st, end: pad(Math.floor(endM / 60)) + ':' + pad(endM % 60), status: 'planned', actual: null }));
    b.status = 'moved'; ui.editId = null; save(); rerender(); toast('Đã chuyển sang ' + DOW[dowOf(d)] + ' ' + fmtDM(d));
  },
  askDel: () => { ui.confirmDel = true; renderSheet(); },
  cancelDel: () => { ui.confirmDel = false; renderSheet(); },
  delBlock: () => { S.blocks = S.blocks.filter(x => x.id !== ui.editId); ui.editId = null; ui.confirmDel = false; save(); rerender(); toast('Đã xóa block'); },
  /* Phát âm */
  pickSound: t => { ui.sound = t.dataset.s; ui.pronTab = 'library'; setLast('pronunciation', 'Phát âm · âm /' + ui.sound + '/', { pronTab: 'library', sound: ui.sound }); rerender(); },
  stepToggle: t => { const s = ui.steps[ui.sound] || (ui.steps[ui.sound] = {}); s[t.dataset.i] = !s[t.dataset.i]; rerender(); },
  goPairs: t => { ui.pairSet = +t.dataset.i; ui.pronTab = 'pairs'; rerender(); },
  pickPair: t => { ui.pairSet = +t.dataset.i; rerender(); },
  rateSound: t => {
    const r = +t.dataset.r, sym = ui.sound, x = S.sounds[sym] || (S.sounds[sym] = { n: 0 }), t0 = todayISO();
    const gap = r === 1 ? 1 : r === 2 ? 3 : (x.rating === 3 && x.n >= 2 ? 14 : 7);
    x.n = (x.n || 0) + 1; x.rating = r; x.last = t0; x.next = addDays(t0, gap);
    if (r === 1) logError('Phát âm', 'snd:' + sym, 'Âm /' + sym + '/', 'Tự chấm: cần sửa', SOUNDS.find(s => s.sym === sym).tip.split('.')[0]);
    logAct(); save(); rerender(); toast('Đã ghi: ' + RATE_VI[r] + ' · ôn lại sau ' + gap + ' ngày');
  },
  saveNote: () => { const sym = ui.sound, x = S.sounds[sym] || (S.sounds[sym] = { n: 0 }); x.note = $('#soundNote').value.trim(); if (!x.next) x.next = todayISO(); save(); toast('Đã lưu nhận xét'); },
  studioPick: t => { ui.studioText = t.dataset.t; rerender(); },
  /* Trắc nghiệm */
  quizAns: t => {
    const id = t.dataset.q, q = ui.quizzes[id], i = +t.dataset.i, j = +t.dataset.j; if (!q || q.ans[i] !== undefined) return;
    q.ans[i] = j; const it = q.items[i], ok = j === it.a;
    if (!ok) logError(it.kind || 'Bài tập', 'q:' + (it.q || '').slice(0, 60), it.q, it.opts[j], it.opts[it.a]);
    if (it.meta) it.meta.forEach(sym => { const x = S.sounds[sym] || (S.sounds[sym] = { n: 0 }); x.pairs = [(x.pairs ? x.pairs[0] : 0) + (ok ? 1 : 0), (x.pairs ? x.pairs[1] : 0) + 1]; });
    if (it.after && ok) speak(it.after, 0.9);
    const n = q.items.length;
    if (Object.keys(q.ans).length === n && !q.saved) { q.saved = true; onQuizDone(id, q.items.filter((x, k) => q.ans[k] === x.a).length, n); }
    else save();
    rerender();
  },
  quizReset: t => { const id = t.dataset.q; delete ui.quizzes[id]; if (id === 't:week' || id === 't:a1') ui.quizzes[id] = { items: id === 't:a1' ? makeA1Test() : makeWeekTest(), ans: {}, saved: false }; rerender(); },
  startTest: t => { const k = t.dataset.k; ui.testKind = k; ui.quizzes[k] = { items: k === 't:a1' ? makeA1Test() : makeWeekTest(), ans: {}, saved: false }; rerender(); },
  /* Từ vựng */
  cardFlip: (t, e) => { if (e.target.closest('.play')) return; ui.card.show = !ui.card.show; rerender(); },
  cardRate: t => {
    const c = ui.card, w = c.queue[c.i], r = +t.dataset.r, v = S.vocab[w] || (S.vocab[w] = {}), t0 = todayISO();
    v.seen = true;
    if (r === 0) { v.step = 0; v.due = t0; v.wrong = (v.wrong || 0) + 1; c.stats.again++; c.queue.push(w); logError('Từ vựng', 'w:' + w, 'Nghĩa của "' + w + '"', 'Quên', WORDS.find(x => x.w === w).vi); }
    else { const step = Math.min((v.step || 0) + r, SRS.length); v.recog = true; v.step = step; v.due = addDays(t0, SRS[Math.min(step - 1, SRS.length - 1)]); c.stats.ok++; }
    c.i++; c.show = false; logAct(); save(); rerender();
  },
  cardRestart: () => { ui.card = buildCardQueue(); rerender(); },
  useOpen: t => { ui.useWord = t.dataset.w; rerender(); setTimeout(() => { const el = $('#useIn'); if (el) el.focus(); }, 30); },
  useClose: () => { ui.useWord = null; rerender(); },
  markUse: t => { const w = t.dataset.w, v = S.vocab[w] || (S.vocab[w] = {}); v.use = true; v.seen = true; v.recog = true; if (!v.step) { v.step = 1; v.due = addDays(todayISO(), 3); } ui.useWord = null; logAct(); save(); rerender(); toast('Đã ghi: tự dùng được "' + w + '"'); },
  openGrammar: t => { ui.grammar = t.dataset.g; ui.vocTab = 'grammar'; const g = GRAMMAR.find(x => x.id === ui.grammar); setLast('vocabulary', 'Ngữ pháp · ' + g.title, { vocTab: 'grammar', grammar: ui.grammar }); rerender(); window.scrollTo(0, 0); },
  grammarBack: () => { ui.grammar = null; rerender(); },
  aiCheck: t => { const el = $('#' + t.dataset.in); aiCheck(t.dataset.k, t.dataset.task, el ? el.value : ''); },
  /* Nghe */
  sayAll: t => { const L = LISTEN.find(x => x.id === ui.lesson); speakSeq(L.lines.map(x => x[0]), +t.dataset.r); logAct(); },
  dictCheck: t => {
    const i = +t.dataset.i, L = LISTEN.find(x => x.id === ui.lesson), typed = $('#dict-' + i).value;
    if (!typed.trim()) { toast('Gõ câu bạn nghe được trước.'); return; }
    const r = diffWords(L.lines[i][0], typed); (ui.dict[L.id] || (ui.dict[L.id] = {}))[i] = { typed, html: r.html, score: r.score };
    if (r.score < 0.8) logError('Nghe', 'dict:' + L.id + ':' + i, 'Chép chính tả: ' + L.lines[i][0], typed.slice(0, 60), L.lines[i][0]);
    const st = ui.dict[L.id];
    if (L.lines.every((_, k) => st[k])) { const avg = Math.round(L.lines.reduce((a, _, k) => a + st[k].score, 0) / L.lines.length * 100); const x = S.listening[L.id] || (S.listening[L.id] = {}); x.dict = Math.max(x.dict || 0, avg); setLast('listening', 'Nghe · ' + L.title, { listenTab: 'dict', lesson: L.id }); }
    logAct(); save(); rerender();
  },
  shadowMark: t => {
    const i = +t.dataset.i, L = LISTEN.find(x => x.id === ui.lesson), st = ui.shadow[L.id] || (ui.shadow[L.id] = {}); st[i] = !st[i];
    if (L.lines.every((_, k) => st[k])) { (S.listening[L.id] || (S.listening[L.id] = {})).shadow = true; toast('Hoàn thành shadowing bài này'); }
    logAct(); save(); rerender();
  },
  speakNav: t => { ui.speakQ = clamp(ui.speakQ + +t.dataset.d, 0, SPEAK_QS.length - 1); rerender(); },
  speakSave: () => { const a = $('#spk').value.trim(); if (!a) { toast('Viết câu trả lời trước.'); return; } S.speak.push({ q: SPEAK_QS[ui.speakQ][0], a, d: todayISO() }); if (S.speak.length > 60) S.speak = S.speak.slice(-60); logAct(); save(); rerender(); toast('Đã lưu câu trả lời'); },
  speakSay: () => { const a = $('#spk').value.trim(); if (a) speak(a, 0.9); },
  dialogPlay: () => { const D = DIALOGS.find(x => x.id === ui.dialog); speakSeq(D.lines.map(x => x[1]), 0.9); },
  reveal: t => { ui.reveal[ui.dialog + t.dataset.i] = true; rerender(); },
  /* TMĐT */
  openEcom: t => { ui.ecom = t.dataset.m; const m = ECOM_MODS.find(x => x.id === ui.ecom); setLast('ecommerce', 'TMĐT · ' + m.title, { ecom: ui.ecom }); rerender(); window.scrollTo(0, 0); },
  ecomBack: () => { ui.ecom = null; rerender(); },
  sayConv: t => { const out = readNumber(ui.conv); if (out) speak(out, +t.dataset.r); },
  termLv: t => { const k = t.dataset.t, l = t.dataset.l; S.terms[k] = S.terms[k] === l ? '' : l; logAct(); save(); rerender(); },
  phraseMark: t => { const i = t.dataset.i; S.phrases[i] = !S.phrases[i]; logAct(); save(); rerender(); },
  /* Thực hành */
  openReal: t => { ui.real = t.dataset.r; const st = S.real[ui.real] || {}; ui.realLv = clamp((st.lv || 0) + 1, 1, 3); const r = REAL.find(x => x.id === ui.real); setLast('practice', 'Thực hành · ' + r.title, { real: ui.real }); rerender(); window.scrollTo(0, 0); },
  realBack: () => { ui.real = null; rerender(); },
  realLv: t => { ui.realLv = +t.dataset.l; rerender(); },
  sayLines: () => { const r = REAL.find(x => x.id === ui.real); speakSeq(r.l1.map(x => x[0]), 0.85); },
  sayScript: t => { const r = REAL.find(x => x.id === ui.real); speak(fillTemplate(r, (S.real[r.id] || {}).fields || {}), +t.dataset.r); },
  realDone: t => { const l = +t.dataset.l, st = S.real[ui.real] || (S.real[ui.real] = {}); st.lv = Math.max(st.lv || 0, l); logAct(2); save(); ui.realLv = clamp(l + 1, 1, 3); rerender(); toast(l < 3 ? 'Hoàn thành cấp ' + l + '. Chuyển sang cấp ' + (l + 1) : 'Hoàn thành cả 3 cấp của tình huống này'); },
  /* Tiến độ */
  errFixed: t => { delete S.errors[t.dataset.k]; save(); rerender(); },
  candoMark: t => { const i = t.dataset.i; S.cando[i] = S.cando[i] ? null : todayISO(); save(); rerender(); }
};
Object.assign(H, ADMIN_H, AUTH_H);
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t) return;
  const a = t.dataset.a;
  if (a === 'closeSheet' && t.classList.contains('sheet-bg') && e.target !== t) return;
  if (H[a]) { e.preventDefault(); H[a](t, e); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && ui.editId) { ui.editId = null; renderSheet(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.fc-card')) { e.preventDefault(); ui.card.show = !ui.card.show; rerender(); }
  if (e.key === 'Enter' && e.target.id && e.target.id.startsWith('dict-')) { e.preventDefault(); H.dictCheck({ dataset: { i: e.target.id.slice(5) } }); }
});
let inputT = null;
document.addEventListener('input', e => {
  const t = e.target, c = t.dataset && t.dataset.c; if (!c) return;
  if (c === 'vocQ') {
    ui.vocQ = t.value; const q = t.value.trim().toLowerCase();
    if (q && ui.vocTopic !== 'all') { ui.vocTopic = 'all'; rerender(); const el = $('#vocQ'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } return; }
    document.querySelectorAll('#vocRows tr').forEach(tr => { tr.hidden = !!q && !tr.dataset.s.includes(q); });
  }
  else if (c === 'conv') { ui.conv = t.value; const o = $('#convOut'); if (o) o.textContent = readNumber(t.value) || 'Chưa đọc được số này. Dùng dấu phẩy ngăn nghìn, dấu chấm cho số thập phân.'; }
  else if (c === 'studioText') { ui.studioText = t.value; document.querySelectorAll('#view [data-a="say"]').forEach(b => { if (b.closest('.card') === t.closest('.card')) b.dataset.t = t.value; }); }
  else if (c === 'gwrite') { S.gwrite[t.dataset.g] = t.value; clearTimeout(inputT); inputT = setTimeout(save, 900); }
  else if (c === 'realField') { const st = S.real[ui.real] || (S.real[ui.real] = {}); (st.fields || (st.fields = {}))[t.dataset.k] = t.value; const r = REAL.find(x => x.id === ui.real); const o = $('#realScript'); if (o) o.textContent = fillTemplate(r, st.fields); clearTimeout(inputT); inputT = setTimeout(save, 900); }
  else if (c === 'realAns') { const st = S.real[ui.real] || (S.real[ui.real] = {}); (st.l3 || (st.l3 = {}))[t.dataset.i] = t.value; clearTimeout(inputT); inputT = setTimeout(save, 900); }
});
document.addEventListener('change', e => {
  const t = e.target, c = t.dataset && t.dataset.c; if (!c) return;
  if (c === 'vocTopic') { ui.vocTopic = t.value; ui.vocQ = ''; rerender(); }
  else if (c === 'lesson') { ui.lesson = t.value; const L = LISTEN.find(x => x.id === ui.lesson); setLast('listening', 'Nghe · ' + L.title, { listenTab: ui.listenTab, lesson: ui.lesson }); rerender(); }
  else if (c === 'rec') { const f = t.files && t.files[0]; if (!f) return; if (ui.rec[t.dataset.k]) URL.revokeObjectURL(ui.rec[t.dataset.k]); ui.rec[t.dataset.k] = URL.createObjectURL(f); logAct(); rerender(); }
});
window.addEventListener('hashchange', () => { ui.editId = null; if (curRoute() !== 'planner') ui.week = ui.week; window.scrollTo(0, 0); route(); });

/* ===== Khởi động ===== */
function startLocal() {
  mode = 'local';
  try { const raw = localStorage.getItem(LS_KEY); if (raw) S = normalize(JSON.parse(raw)); } catch { S = null; }
  setSaveChip('local', S ? 'Lưu trên trình duyệt này' : 'Chưa lưu');
  route();
  if (migrated && S) { migrated = false; save(); }
}
let stateUnsub = null;
function startState(id) {
  if (stateUnsub) { stateUnsub(); stateUnsub = null; }
  docRef = DB.collection('data/users/' + id).doc('state');
  mode = 'cloud'; let first = true;
  stateUnsub = docRef.onSnapshot(snap => {
    const data = snap.exists ? snap.data() : null;
    if (first) {
      first = false; S = data ? normalize(JSON.parse(JSON.stringify(data))) : null; lastSaved = data ? JSON.stringify(data) : '';
      setSaveChip('ok', S ? 'Đã đồng bộ' : 'Chưa có dữ liệu'); route();
      if (migrated && S) { migrated = false; save(); }
      return;
    }
    if (snap.metadata.hasPendingWrites || dirty || saving || !data) return;
    const js = JSON.stringify(data); if (js === lastSaved) return;
    lastSaved = js; S = normalize(JSON.parse(js)); setSaveChip('ok', 'Đã đồng bộ');
    const a = document.activeElement; if (!a || !/INPUT|TEXTAREA|SELECT/.test(a.tagName)) rerender();
  }, err => {
    setSaveChip('local', 'Mất kết nối lưu trữ');
    if (first) { first = false; access = 'owner'; startLocal(); }
  });
}
async function boot() {
  route();
  if (!window.claude || typeof window.claude.use !== 'function') { access = 'owner'; startLocal(); return; }
  claude.use('sample').then(fn => { AI = fn || null; if (S && mode !== 'loading') { const y = window.scrollY; route(); window.scrollTo(0, y); } }).catch(() => { AI = null; });
  let db = null, u = null, id = null;
  try { [db, u] = await Promise.all([claude.use('db'), claude.use('user')]); id = u ? await u.id() : null; } catch { db = null; }
  if (!db || !id) { access = 'owner'; startLocal(); return; }
  DB = db; USER = u; MY_ID = id;
  try { ME = await u.me(); } catch { ME = { id, name: '', email: null, isOwner: false }; }
  if (ME.isOwner) { access = 'owner'; startState(id); subscribeAdmin(); return; }
  // Thành viên: kiểm tra đăng ký và trạng thái duyệt trước khi mở hệ thống học
  access = 'checking'; mode = 'cloud'; route();
  let gotA = false, gotM = false;
  const evalGate = () => {
    if (!gotA || !gotM) return;
    const ap = GATE.approval, rq = GATE.request, st = ap && ap.status;
    let next;
    if (st === 'approved') next = 'member';
    else if (rq && (!ap || (rq.requestedAt || '') > (ap.at || ''))) next = 'pending';
    else if (st === 'rejected' || st === 'revoked') next = st;
    else next = GATE.viewOnly ? 'viewonly' : 'none';
    if (next === 'member') { if (access !== 'member') { access = 'member'; S = null; startState(id); } return; }
    if (stateUnsub) { stateUnsub(); stateUnsub = null; }
    S = null; access = next; setSaveChip('ok', next === 'pending' ? 'Chờ duyệt' : 'Chưa là thành viên'); route();
  };
  db.doc('approvals/' + id).onSnapshot(sn => { GATE.approval = sn.exists ? sn.data() : null; gotA = true; evalGate(); }, () => { GATE.approval = null; gotA = true; evalGate(); });
  db.doc('members/' + id).onSnapshot(sn => { GATE.request = sn.exists ? sn.data() : null; gotM = true; evalGate(); }, () => { GATE.request = null; gotM = true; evalGate(); });
  GATE.reeval = evalGate;
}
boot();
