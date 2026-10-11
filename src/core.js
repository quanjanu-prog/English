/* ===== Tiện ích ===== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const todayISO = () => iso(new Date());
const mondayOf = s => { const d = parseISO(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
const minsOf = (a, b) => { const [h1, m1] = a.split(':').map(Number), [h2, m2] = b.split(':').map(Number); return Math.max(0, h2 * 60 + m2 - h1 * 60 - m1); };
const fmtDM = s => { const d = parseISO(s); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };
const DOW = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'];
const dowOf = s => (parseISO(s).getDay() + 6) % 7;
const fmtH = m => { const h = Math.floor(m / 60), r = m % 60; return h ? (h + 'h' + (r ? pad(r) : '')) : r + ' phút'; };
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const uid = () => Math.random().toString(36).slice(2, 10);
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = (a, n) => shuffle(a).slice(0, n);
const LET = 'ABCD';

const ICON = {
  play: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>',
  slow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 4v8l5-4z" fill="currentColor"/><path d="M10 4v8M13 4v8"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>'
};

/* ===== Đọc số bằng tiếng Anh ===== */
const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const w99 = n => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
function w999(n) { const h = Math.floor(n / 100), r = n % 100, p = []; if (h) p.push(ONES[h] + ' hundred'); if (r) { if (h) p.push('and'); p.push(w99(r)); } return p.join(' '); }
function intWords(n) {
  if (n === 0) return 'zero';
  const parts = []; let rest = n;
  for (const [v, name] of [[1e9,'billion'],[1e6,'million'],[1e3,'thousand']]) if (rest >= v) { parts.push(w999(Math.floor(rest / v)) + ' ' + name); rest %= v; }
  if (rest) { if (parts.length && rest < 100) parts.push('and'); parts.push(w999(rest)); }
  return parts.join(' ');
}
function readNumber(raw) {
  let s = String(raw).trim(), unit = '';
  if (/%$/.test(s)) { unit = ' percent'; s = s.slice(0, -1).trim(); }
  if (/\s*(vnd|đ|đồng|dong)$/i.test(s)) { unit = ' dong'; s = s.replace(/\s*(vnd|đ|đồng|dong)$/i, '').trim(); }
  if (/^\$/.test(s)) { unit = ' dollars'; s = s.slice(1); }
  s = s.replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const [i, d] = s.split('.'); const n = Number(i);
  if (n >= 1e12) return null;
  let out = intWords(n);
  if (d) out += ' point ' + [...d].map(c => ONES[+c]).join(' ');
  if (unit === ' dollars' && n === 1 && !d) unit = ' dollar';
  return out + unit;
}
const fmtNum = x => Number(x).toLocaleString('en-US', { maximumFractionDigits: 2 });

/* ===== Trạng thái ===== */
let S = null;                 // trạng thái lưu trữ
let mode = 'loading';         // loading | cloud | local
let docRef = null, AI = null, dirty = false, saving = false, saveTimer = null, lastSaved = '', migrated = false;
const ui = {
  week: null, editId: null, newBlockDate: null, pronTab: 'library', sound: 'θ', pairSet: 0, endingKind: 's',
  vocTab: 'cards', vocTopic: null, vocStatus: 'all', vocQ: '', useWord: null, grammar: null, card: null,
  listenTab: 'lesson', lesson: 'l1', showVi: true, showEn: true, dict: {}, shadow: {}, speakQ: 0, dialog: 'd1', rolePlay: false, reveal: {},
  ecom: null, conv: '125,000,000 VND', real: null, realLv: 1, quizzes: {}, steps: {}, rec: {}, progTab: 'overview', ai: {}, studioText: 'I work in e-commerce.'
};

function blankState(start) {
  return { v: 2, startDate: start, prefs: { accent: 'us' }, blocks: [], act: {}, sounds: {}, pron: { pairs: {}, stress: null, ending: {} },
    vocab: {}, grammar: {}, gwrite: {}, listening: {}, speak: [], ecom: {}, terms: {}, phrases: {}, real: {}, errors: {}, tests: [], cando: {}, last: null };
}
function normalize(x) {
  const b = blankState(x.startDate || mondayOf(todayISO()));
  for (const k of Object.keys(b)) if (x[k] === undefined || x[k] === null && k !== 'last') x[k] = b[k];
  x.prefs = Object.assign({ accent: 'us' }, x.prefs || {});
  x.pron = Object.assign({ pairs: {}, stress: null, ending: {} }, x.pron || {});
  if ((x.v || 1) < 2) {
    (x.blocks || []).forEach(b => {
      if (b.skill === 'vocab' && b.status === 'planned' && /^(Học 12 từ mới|Ôn từ đến hạn)/.test(b.lesson || '')) {
        const w = clamp(Math.floor(daysBetween(x.startDate, b.date) / 7) + 1, 1, 12);
        b.lesson = 'Học 14 từ mới: ' + VOCAB_TOPICS[WEEK_PLAN[w - 1].t];
      }
    });
    x.v = 2; migrated = true;
  }
  return x;
}
function buildAllBlocks(start) {
  const out = [];
  for (let w = 0; w < 12; w++) out.push(...buildWeekBlocks(w, addDays(start, w * 7), addDays, uid));
  return out;
}

/* ===== Lưu trữ ===== */
const LS_KEY = 'english-os-state';
function setSaveChip(kind, text) {
  const el = $('#savechip'); if (!el) return;
  el.className = 'savechip ' + kind; el.lastElementChild.textContent = text;
}
function save() {
  if (!S) return;
  dirty = true; setSaveChip('busy', 'Đang lưu');
  clearTimeout(saveTimer); saveTimer = setTimeout(flush, 700);
}
async function flush() {
  if (!S) return;
  if (mode === 'local') {
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); setSaveChip('local', 'Lưu trên trình duyệt này'); } catch { setSaveChip('local', 'Chưa lưu được'); }
    dirty = false; return;
  }
  if (saving) { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 500); return; }
  saving = true;
  const body = JSON.parse(JSON.stringify(S)); const snap = JSON.stringify(body);
  try { await docRef.set(body); lastSaved = snap; setSaveChip('ok', 'Đã lưu'); if (JSON.stringify(S) === snap) dirty = false; }
  catch (e) {
    if (e && e.code === 'unavailable') { saving = false; setTimeout(flush, 1500 + Math.random() * 1000); return; }
    setSaveChip('local', e && e.code === 'quota_exceeded' ? 'Hết dung lượng lưu' : 'Chưa lưu được');
  }
  saving = false;
}
function logAct(n = 1) { if (!S) return; const d = todayISO(); S.act[d] = (S.act[d] || 0) + n; }
function logError(kind, key, prompt, wrong, right) {
  const e = S.errors[key] || { k: kind, p: prompt, w: wrong, r: right, n: 0 };
  e.n += 1; e.w = wrong; e.d = todayISO(); S.errors[key] = e;
}
function setLast(h, label, state) { if (!S) return; S.last = { h, label, st: state || null }; save(); }

/* ===== Đọc mẫu (giọng của trình duyệt) ===== */
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch { voices = []; } }
if ('speechSynthesis' in window) { loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch {} }
function pickVoice() {
  const want = S?.prefs?.accent === 'uk' ? 'en-GB' : 'en-US';
  const exact = voices.filter(v => (v.lang || '').replace('_', '-') === want);
  return exact.find(v => /Google|Natural|Samantha|Daniel/.test(v.name)) || exact[0] || voices.find(v => (v.lang || '').startsWith('en'));
}
function speak(text, rate = 1) {
  if (!('speechSynthesis' in window)) { toast('Trình duyệt này chưa hỗ trợ đọc mẫu.'); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = S?.prefs?.accent === 'uk' ? 'en-GB' : 'en-US';
    u.rate = rate; speechSynthesis.speak(u);
  } catch { toast('Không phát được âm mẫu.'); }
}
function speakSeq(lines, rate = 1) {
  if (!('speechSynthesis' in window)) { toast('Trình duyệt này chưa hỗ trợ đọc mẫu.'); return; }
  speechSynthesis.cancel(); const v = pickVoice();
  lines.forEach(t => { const u = new SpeechSynthesisUtterance(t); if (v) { u.voice = v; u.lang = v.lang; } u.rate = rate; speechSynthesis.speak(u); });
}
const playBtn = (t, r = 1, cls = '') => '<button class="play ' + cls + '" data-a="say" data-t="' + esc(t) + '" data-r="' + r + '" aria-label="Nghe: ' + esc(t) + '" title="' + (r < 1 ? 'Nghe chậm' : 'Nghe') + '">' + (r < 1 ? ICON.slow : ICON.play) + '</button>';

let toastT = null;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2600); }

/* ===== Phản hồi của Claude ===== */
const AI_ERR = { not_granted:'Bạn chưa cho phép trang dùng Claude.', sampling_disabled:'Claude chưa khả dụng cho tài khoản này.', rate_limited:'Bạn đã hỏi nhiều lần liên tiếp. Thử lại sau ít phút.', session_expired:'Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử.', refused:'Claude không xử lý được nội dung này. Hãy viết lại câu khác.' };
async function aiCheck(key, task, answer) {
  const text = String(answer || '').trim();
  if (!text) { toast('Hãy viết câu trả lời trước.'); return; }
  if (!AI) { toast('Phản hồi từ Claude chưa khả dụng trong lần mở này.'); return; }
  ui.ai[key] = { busy: true, text: 'Đang chấm…' }; rerenderAI(key);
  const prompt = 'Bạn là giáo viên tiếng Anh cho người Việt trình độ A1 làm ngành thương mại điện tử.\n' +
    'Nhiệm vụ của học viên: ' + task + '\nCâu trả lời của học viên:\n"""' + text.slice(0, 1500) + '"""\n\n' +
    'Trả lời bằng tiếng Việt, tối đa 90 từ, đúng định dạng 3 dòng:\n' +
    'Đánh giá: (Đúng / Gần đúng / Cần sửa) + một câu nhận xét.\nCâu gợi ý: (viết lại bằng tiếng Anh đơn giản, đúng ngữ pháp, giữ ý của học viên)\nGhi chú: (một lỗi chính và cách sửa, hoặc một mẹo phát âm)';
  try {
    const { text: out } = await AI(prompt, { modelTier: 'quick', cache: false, onText: ({ text: t }) => { ui.ai[key] = { busy: true, text: t }; rerenderAI(key); } });
    ui.ai[key] = { busy: false, text: out }; logAct();
    if (/Cần sửa/i.test(out.split('\n')[0] || '')) logError('viết', 'ai:' + key, task, text.slice(0, 80), '(xem gợi ý của Claude)');
    save();
  } catch (e) {
    ui.ai[key] = { busy: false, text: (e && e.text) || AI_ERR[e && e.code] || 'Chưa nhận được phản hồi. Bấm Chấm lại để thử.' };
    if (e && (e.code === 'not_granted' || e.code === 'sampling_disabled')) AI = null;
  }
  rerenderAI(key);
}
function aiBlock(key, task, inputId) {
  const st = ui.ai[key];
  return '<div class="row" style="margin-top:8px">' +
    (AI ? '<button class="btn sm" data-a="aiCheck" data-k="' + esc(key) + '" data-task="' + esc(task) + '" data-in="' + inputId + '">' + (st ? 'Chấm lại' : 'Nhờ Claude chấm') + '</button>' : '<span class="tiny faint">Phản hồi từ Claude sẽ hiện khi trang chạy trong Claude.</span>') +
    '</div><div data-ai="' + esc(key) + '">' + (st ? '<div class="ai-out" style="margin-top:8px">' + esc(st.text) + '</div>' : '') + '</div>';
}
function rerenderAI(key) {
  const box = document.querySelector('[data-ai="' + CSS.escape(key) + '"]'); if (!box) return;
  const st = ui.ai[key]; box.innerHTML = st ? '<div class="ai-out" style="margin-top:8px">' + esc(st.text) + '</div>' : '';
}

/* ===== Bộ máy trắc nghiệm dùng chung ===== */
function quizFor(id, make) { if (!ui.quizzes[id]) ui.quizzes[id] = { items: make(), ans: {}, saved: false }; return ui.quizzes[id]; }
function renderQuiz(id, opts = {}) {
  const q = ui.quizzes[id]; if (!q) return '';
  const n = q.items.length, done = Object.keys(q.ans).length, right = q.items.filter((it, i) => q.ans[i] === it.a).length;
  let h = '<div class="quiz" id="quiz-' + esc(id) + '"><div class="qtop"><span class="num">' + done + '/' + n + ' câu đã làm</span><div class="bar acc"><i style="width:' + pct(done, n) + '%"></i></div><span class="num">' + pct(done, n) + '%</span><button class="btn sm ghost" data-a="quizReset" data-q="' + esc(id) + '">Làm lại</button></div>';
  q.items.forEach((it, i) => {
    const a = q.ans[i], answered = a !== undefined, ok = a === it.a;
    h += '<div class="qcard ' + (answered ? (ok ? 'ok' : 'no') : '') + '"><div class="qtext"><span class="qn">' + (i + 1) + '</span><div style="flex:1;min-width:0">' + (it.html || esc(it.q)) +
      (it.say ? '<div class="row" style="margin-top:6px">' + playBtn(it.say, 1) + playBtn(it.say, 0.7) + '<span class="tiny muted">Nghe rồi chọn</span></div>' : '') + '</div></div>' +
      '<div class="opts ' + (it.one || opts.one ? 'one' : '') + '">' + it.opts.map((o, j) => {
        let c = 'opt'; if (answered && j === it.a) c += ' right'; else if (answered && j === a) c += ' wrong';
        return '<button class="' + c + '" data-a="quizAns" data-q="' + esc(id) + '" data-i="' + i + '" data-j="' + j + '"' + (answered ? ' disabled' : '') + '><span class="k">' + LET[j] + '</span><span' + (it.ipaOpts ? ' class="ipa" style="font-size:1.1rem"' : '') + '>' + esc(o) + '</span></button>';
      }).join('') + '</div>' +
      (answered ? '<div class="fb ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Chính xác.' : 'Chưa đúng. Đáp án: ' + esc(it.opts[it.a])) + '</b>' + esc(it.why || '') + (it.after ? ' ' + playBtn(it.after, 0.85, 'sm') : '') + '</div>' : '') + '</div>';
  });
  if (done === n) h += '<div class="result"><div class="sc">' + right + '/' + n + '</div><div style="flex:1;min-width:200px"><b>' + (right / n >= 0.8 ? 'Đạt. Bạn có thể chuyển sang phần tiếp theo.' : 'Chưa đạt 80%. Xem lại các câu sai rồi làm lại.') + '</b><div class="small muted">Câu sai đã được ghi vào Nhật ký lỗi để ôn lại.</div></div><button class="btn" data-a="quizReset" data-q="' + esc(id) + '">Làm lại</button></div>';
  return h + '</div>';
}
function onQuizDone(id, right, n) {
  const score = pct(right, n), d = todayISO();
  const best = (o) => Object.assign(o || {}, { best: Math.max((o && o.best) || 0, score), tries: ((o && o.tries) || 0) + 1, last: score, d });
  if (id.startsWith('g:')) { const g = id.slice(2); S.grammar[g] = best(S.grammar[g]); }
  else if (id.startsWith('e:')) { const m = id.slice(2); S.ecom[m] = best(S.ecom[m]); }
  else if (id === 'p:stress') S.pron.stress = best(S.pron.stress);
  else if (id.startsWith('p:end:')) S.pron.ending[id.slice(6)] = best(S.pron.ending[id.slice(6)]);
  else if (id.startsWith('p:pair:')) { const k = id.slice(7); S.pron.pairs[k] = best(S.pron.pairs[k]); }
  else if (id === 't:week' || id === 't:a1') S.tests.push({ d, kind: id === 't:a1' ? 'Mốc A1' : 'Kiểm tra tuần ' + weekNo(d), score: right, total: n });
  logAct(2); save();
}
