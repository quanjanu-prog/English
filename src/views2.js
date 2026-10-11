/* ===== 03 Pronunciation Lab ===== */
const PRON_TABS = [['library','IPA Library'],['pairs','Minimal Pairs'],['stress','Word Stress'],['ending','Ending Sounds'],['studio','Recording Studio'],['review','Pronunciation Review']];
const PRON_STEPS = ['Nghe âm mẫu và từ mẫu.','Quan sát khẩu hình và hướng dẫn vị trí lưỡi.','Nghe phân biệt các cặp âm gần nhau.','Ghi âm bản thân và nghe lại cạnh âm mẫu.','Đọc từ, câu ngắn rồi kiểm tra lại sau 1, 3 và 7 ngày.'];
const RATE_VI = { 1: 'Cần sửa', 2: 'Gần đúng', 3: 'Đúng' };
function viewPron() {
  const tabs = '<div class="tabs" role="tablist">' + PRON_TABS.map(([k, l]) => '<button class="' + (ui.pronTab === k ? 'on' : '') + '" data-a="tab" data-v="pronTab" data-k="' + k + '">' + l + '</button>').join('') + '</div>';
  const practiced = SOUNDS.filter(s => S.sounds[s.sym] && S.sounds[s.sym].n).length;
  let h = pageHead('03 · Pronunciation Lab', 'Phòng luyện phát âm', 'Giai đoạn nền tảng dành khoảng 40% thời gian cho phát âm. Mỗi âm đi theo 5 bước: nghe, khẩu hình, phân biệt, ghi âm, ôn lại.', '<span class="pill acc">' + practiced + '/44 âm đã luyện</span>') + tabs;
  h += ({ library: pronLibrary, pairs: pronPairs, stress: pronStress, ending: pronEnding, studio: pronStudio, review: pronReview }[ui.pronTab])();
  return h;
}
/* Ghi âm trực tiếp bằng micro máy tính / điện thoại (MediaRecorder) */
const REC = { key: null, mr: null, stream: null, chunks: [], t0: 0, tick: null, ctx: null, raf: 0, mime: '' };
const REC_MAX = 90;
const recSupported = () => !!(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
function recPickMime() {
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch {} }
  return '';
}
function recMicOff() {
  if (REC.stream) REC.stream.getTracks().forEach(t => t.stop());
  REC.stream = null; clearInterval(REC.tick); REC.tick = null; cancelAnimationFrame(REC.raf);
  if (REC.ctx) { try { REC.ctx.close(); } catch {} REC.ctx = null; }
}
function recErrMsg(err) {
  const n = err && err.name;
  if (n === 'NotAllowedError' || n === 'SecurityError') return 'Micro đang bị chặn. Bấm biểu tượng ổ khoá cạnh địa chỉ web, chọn Cho phép (Allow) micro, rồi tải lại trang.';
  if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'Không tìm thấy micro. Hãy cắm tai nghe có mic hoặc kiểm tra micro trong cài đặt âm thanh của máy.';
  if (n === 'NotReadableError' || n === 'AbortError') return 'Micro đang bị ứng dụng khác dùng (Zoom, Meet...). Hãy tắt ứng dụng đó rồi thử lại.';
  return 'Không bật được micro. Hãy thử lại hoặc dùng nút Chọn file.';
}
async function recStart(key) {
  if (REC.mr) recStop();
  if (!recSupported()) { toast('Trình duyệt này chưa ghi âm trực tiếp được. Hãy dùng Chrome/Edge bản mới hoặc nút Chọn file.'); return; }
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch {}
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch (err) { ui.recErr = Object.assign({}, ui.recErr, { [key]: recErrMsg(err) }); rerender(); return; }
  const mime = recPickMime();
  let mr;
  try { mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
  catch { stream.getTracks().forEach(t => t.stop()); toast('Không khởi động được trình ghi âm.'); return; }
  Object.assign(REC, { key, mr, stream, chunks: [], t0: Date.now(), mime: mr.mimeType || mime });
  if (ui.recErr) delete ui.recErr[key];
  mr.ondataavailable = e => { if (e.data && e.data.size) REC.chunks.push(e.data); };
  mr.onstop = () => {
    const k = REC.key, blob = new Blob(REC.chunks, { type: REC.mime || 'audio/webm' });
    Object.assign(REC, { key: null, mr: null, chunks: [] });
    recMicOff();
    if (blob.size) { if (ui.rec[k]) URL.revokeObjectURL(ui.rec[k]); ui.rec[k] = URL.createObjectURL(blob); logAct(); }
    else toast('Không thu được âm thanh. Hãy kiểm tra micro rồi thử lại.');
    rerender();
  };
  mr.start(250);
  REC.tick = setInterval(() => {
    const s = Math.floor((Date.now() - REC.t0) / 1000), el = document.getElementById('recTime');
    if (el) el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    if (s >= REC_MAX) { recStop(); toast('Đã tự dừng sau ' + REC_MAX + ' giây.'); }
  }, 250);
  try {
    const AC = window.AudioContext || window.webkitAudioContext; REC.ctx = new AC(); if (REC.ctx.state === "suspended") REC.ctx.resume().catch(() => {});
    const an = REC.ctx.createAnalyser(); an.fftSize = 512; REC.ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize);
    const loop = () => { an.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128)); const el = document.getElementById('recLvl'); if (el) el.style.width = Math.min(100, m / 0.9) + '%'; REC.raf = requestAnimationFrame(loop); };
    loop();
  } catch {}
  rerender();
}
function recStop() { if (REC.mr && REC.mr.state !== 'inactive') REC.mr.stop(); else recMicOff(); }
function recCompare(key, model) {
  const url = ui.rec[key]; if (!url) return;
  const a = document.querySelector('audio[data-rk="' + CSS.escape(key) + '"]');
  const playMine = () => { if (a) { a.currentTime = 0; a.play().catch(() => {}); } };
  if (!model || !('speechSynthesis' in window)) { playMine(); return; }
  try {
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(model); const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = S?.prefs?.accent === 'uk' ? 'en-GB' : 'en-US';
    u.rate = 0.85; u.onend = () => setTimeout(playMine, 400); speechSynthesis.speak(u);
  } catch { playMine(); }
}
function recorder(key, model) {
  const url = ui.rec[key], live = REC.key === key && REC.mr, busy = REC.mr && !live;
  const err = ui.recErr && ui.recErr[key], k = esc(key);
  const file = '<label class="btn ghost sm" for="rec-' + k + '">Chọn file</label><input type="file" id="rec-' + k + '" accept="audio/*" data-c="rec" data-k="' + k + '" hidden>';
  let h = '<div class="card flat rec-box' + (live ? ' live' : '') + '"><div class="row" style="justify-content:space-between;margin-bottom:8px"><b class="small">Ghi âm và so sánh</b>' + (model ? '<div class="row"><span class="tiny muted">Âm mẫu</span>' + playBtn(model, 0.8) + playBtn(model, 1) + '</div>' : '') + '</div>';
  if (live) {
    h += '<div class="row" style="gap:10px;align-items:center"><button class="btn danger" data-a="recStop">' + '<span class="rec-dot"></span>Dừng ghi · tắt mic</button><span class="mono-num small" id="recTime">0:00</span><div class="rec-meter" aria-hidden="true"><i id="recLvl"></i></div></div>' +
      '<p class="tiny muted" style="margin-top:8px">Micro đang bật. Đọc to, rõ rồi bấm Dừng. Mic tự tắt sau ' + REC_MAX + ' giây hoặc khi chuyển trang.</p>';
  } else {
    h += '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" data-a="recStart" data-k="' + k + '"' + (busy ? ' disabled' : '') + '>' + ICON.mic + (url ? ' Ghi lại' : ' Bật mic và ghi âm') + '</button>' +
      (url && model ? '<button class="btn" data-a="recCompare" data-k="' + k + '" data-t="' + esc(model) + '">Nghe mẫu rồi nghe mình</button>' : '') + file + '</div>';
    if (err) h += '<div class="alert crit" style="margin-top:10px"><span class="ic">!</span><div class="bd small">' + esc(err) + '</div></div>';
    h += url ? '<audio controls data-rk="' + k + '" src="' + url + '" style="width:100%;margin-top:10px"></audio>'
      : '<p class="tiny muted" style="margin-top:8px">' + (recSupported() ? 'Lần đầu, trình duyệt sẽ hỏi quyền dùng micro: chọn Cho phép. ' : 'Trình duyệt này chưa ghi âm trực tiếp được, hãy dùng Chọn file. ') + 'Bản ghi chỉ phát lại trong phiên này, không tải lên đâu cả.</p>';
  }
  return h + '</div>';
}
function pronLibrary() {
  const s = SOUNDS.find(x => x.sym === ui.sound) || SOUNDS[0], rec = S.sounds[s.sym] || {};
  const steps = ui.steps[s.sym] || {};
  let left = '<div class="card"><div class="ipa-groups">';
  ['v','d','c'].forEach(g => {
    left += '<div><div class="label" style="margin-bottom:8px">' + SOUND_GROUPS[g] + ' · ' + SOUNDS.filter(x => x.g === g).length + '</div><div class="ipa-grid">' +
      SOUNDS.filter(x => x.g === g).map(x => { const r = S.sounds[x.sym]; return '<button class="ipa-cell ' + (x.sym === s.sym ? 'on' : '') + '" data-a="pickSound" data-s="' + esc(x.sym) + '" aria-label="Âm ' + esc(x.sym) + '">' + (x.pri ? '<span class="pr" title="Âm người Việt hay sai">•</span>' : '') + '<span class="rt ' + (r && r.rating ? 'r' + r.rating : '') + '"></span><span class="ipa">' + esc(x.sym) + '</span><small>' + esc(x.ex[0]) + '</small></button>'; }).join('') + '</div></div>';
  });
  left += '</div><div class="legend" style="margin-top:14px"><span><i style="background:var(--crit);border-radius:50%;width:8px;height:8px"></i>Cần sửa</span><span><i style="background:var(--warn);border-radius:50%;width:8px;height:8px"></i>Gần đúng</span><span><i style="background:var(--good);border-radius:50%;width:8px;height:8px"></i>Đúng</span><span><b style="color:var(--crit)">•</b>Âm người Việt hay sai</span></div></div>';
  const pairIdx = PAIRS.findIndex(p => p.a === s.sym || p.b === s.sym);
  let right = '<div class="card stack"><div class="row" style="gap:16px;align-items:center"><div class="bigsym">/' + esc(s.sym) + '/</div><div style="flex:1;min-width:0"><div class="label">' + SOUND_GROUPS[s.g] + ' · ' + (s.voiced ? 'Hữu thanh (voiced)' : 'Vô thanh (voiceless)') + '</div><h2 style="margin:4px 0">Cách phát âm</h2><p class="small">' + esc(s.tip) + '</p></div></div>' +
    '<div class="alert warn"><span class="ic">!</span><div class="bd"><b>Lỗi người Việt hay gặp:</b> ' + esc(s.trap) + '</div></div>' +
    '<div><div class="label" style="margin-bottom:6px">Từ mẫu</div><div class="ex-words">' + s.ex.map(w => '<span class="ex-word">' + esc(w) + playBtn(w, 0.75, 'sm') + '</span>').join('') + '</div></div>' +
    '<div><div class="label" style="margin-bottom:4px">Quy trình luyện tập</div><div class="steps">' + PRON_STEPS.map((t, i) => '<div class="step ' + (steps[i] ? 'done' : '') + '"><button class="n" data-a="stepToggle" data-i="' + i + '" aria-label="Đánh dấu bước ' + (i + 1) + '">' + (steps[i] ? ICON.check : i + 1) + '</button><div class="bd small">' + t +
      (i === 0 ? ' <span class="row" style="display:inline-flex;margin-left:4px">' + playBtn(s.ex.join(', '), 0.7, 'sm') + '</span>' : '') +
      (i === 2 && pairIdx >= 0 ? ' <button class="btn sm" data-a="goPairs" data-i="' + pairIdx + '">Luyện /' + esc(PAIRS[pairIdx].a) + '/ – /' + esc(PAIRS[pairIdx].b) + '/</button>' : '') + '</div></div>').join('') + '</div></div>' +
    recorder('s:' + s.sym, s.ex.join('. ') + '.') +
    '<div><div class="label" style="margin-bottom:6px">Tự đánh giá lần luyện này</div><div class="rate3">' + [1, 2, 3].map(r => '<button class="r' + r + (rec.rating === r ? ' on' : '') + '" data-a="rateSound" data-r="' + r + '">' + RATE_VI[r] + '</button>').join('') + '</div>' +
    '<div class="field" style="margin-top:10px"><label for="soundNote">Nhận xét của bạn</label><textarea id="soundNote" placeholder="Ví dụ: hay quên đặt lưỡi giữa răng ở cuối từ">' + esc(rec.note || '') + '</textarea></div><button class="btn sm" style="margin-top:6px" data-a="saveNote">Lưu nhận xét</button>' +
    '<p class="tiny muted" style="margin-top:10px">' + (rec.n ? 'Đã luyện ' + rec.n + ' lần · ôn tiếp ngày ' + fmtDM(rec.next) : 'Chưa luyện âm này.') + (rec.pairs ? ' · Phân biệt âm ' + rec.pairs[0] + '/' + rec.pairs[1] + ' đúng' : '') + '</p></div>' +
    '<p class="note">Ghi âm và nghe lại giúp bạn tự phát hiện lỗi nhưng chưa đủ để kết luận phát âm đúng. Khi có thể, nhờ giáo viên hoặc gia sư nghe lại các âm bạn chấm "Gần đúng".</p></div>';
  return '<div class="split">' + left + right + '</div>';
}
function pronPairs() {
  const p = PAIRS[ui.pairSet] || PAIRS[0], id = 'p:pair:' + ui.pairSet;
  quizFor(id, () => shuffle([...p.words.map((w, i) => [w, 0]), ...p.words.map((w, i) => [w, 1])]).slice(0, 6).map(([pair, k]) => ({ q: 'Bạn nghe thấy từ nào?', say: pair[k], opts: pair, a: k, why: '/' + p.a + '/: ' + pair[0] + ' · /' + p.b + '/: ' + pair[1], kind: 'Phát âm', meta: [p.a, p.b] })));
  const best = S.pron.pairs[ui.pairSet];
  return '<div class="split"><div class="card"><div class="card-h"><h2><span class="ipa">/' + esc(p.a) + '/</span> và <span class="ipa">/' + esc(p.b) + '/</span></h2>' + (best ? '<span class="pill ' + (best.best >= 80 ? 'good' : 'warn') + '">Tốt nhất ' + best.best + '%</span>' : '') + '</div>' +
    '<p class="small muted" style="margin-bottom:14px">Nghe một từ rồi chọn từ bạn nghe được. Nghe chậm nếu chưa chắc.</p>' + renderQuiz(id) + '</div>' +
    '<div class="card"><h3 style="margin-bottom:10px">Các cặp âm dễ nhầm</h3><div class="stack" style="gap:6px">' + PAIRS.map((x, i) => { const b = S.pron.pairs[i]; return '<button class="btn ' + (i === ui.pairSet ? 'pri' : '') + '" style="justify-content:space-between" data-a="pickPair" data-i="' + i + '"><span><span class="ipa">/' + esc(x.a) + '/ – /' + esc(x.b) + '/</span> <span class="tiny">' + x.words.map(w => w.join('/')).join(', ') + '</span></span><span class="tiny">' + (b ? b.best + '%' : '') + '</span></button>'; }).join('') + '</div>' +
    '<div class="label" style="margin:16px 0 6px">Nghe cả cặp</div>' + p.words.map(w => '<div class="row small" style="padding:4px 0">' + playBtn(w[0], 0.8, 'sm') + '<span style="min-width:70px">' + esc(w[0]) + '</span>' + playBtn(w[1], 0.8, 'sm') + '<span>' + esc(w[1]) + '</span></div>').join('') + '</div></div>';
}
function pronStress() {
  quizFor('p:stress', () => pick(STRESS, 8).map(x => ({ q: 'Trọng âm của "' + x.w + '" rơi vào âm tiết nào?', html: 'Trọng âm của <b>' + esc(x.w) + '</b> rơi vào âm tiết nào?', opts: x.syl.map(s => s.toUpperCase()), a: x.s, why: x.syl.map((s, i) => i === x.s ? s.toUpperCase() : s).join('-'), after: x.w, kind: 'Trọng âm', one: false })));
  const best = S.pron.stress;
  return '<div class="split"><div class="card"><div class="card-h"><h2>Word Stress</h2>' + (best ? '<span class="pill">Tốt nhất ' + best.best + '%</span>' : '') + '</div><p class="small muted" style="margin-bottom:14px">Âm tiết mang trọng âm đọc to hơn, dài hơn, cao hơn. Âm tiết không nhấn thường đọc yếu thành /ə/.</p>' + renderQuiz('p:stress') + '</div>' +
    '<div class="card"><h3 style="margin-bottom:8px">20 từ ngành TMĐT</h3><div class="tbl-wrap"><table><tbody>' + STRESS.map(x => '<tr><td>' + playBtn(x.w, 0.8, 'sm') + '</td><td><b>' + esc(x.w) + '</b></td><td class="num">' + x.syl.map((s, i) => i === x.s ? '<b style="color:var(--accent)">' + esc(s.toUpperCase()) + '</b>' : esc(s)).join('·') + '</td></tr>').join('') + '</tbody></table></div></div></div>';
}
function pronEnding() {
  const k = ui.endingKind, E = ENDINGS[k], id = 'p:end:' + k;
  quizFor(id, () => shuffle(E.items).slice(0, 8).map(([w, a]) => ({ q: '"' + w + '": đuôi đọc là?', html: '<b>' + esc(w) + '</b>: đuôi đọc là?', opts: E.opts, a, ipaOpts: true, why: E.rules[a][1] + '.', after: w, kind: 'Âm cuối' })));
  const best = S.pron.ending[k];
  return '<div class="seg" style="margin-bottom:14px">' + Object.entries(ENDINGS).map(([kk, e]) => '<button class="' + (kk === k ? 'on' : '') + '" data-a="tab" data-v="endingKind" data-k="' + kk + '">' + e.title + '</button>').join('') + '</div>' +
    '<div class="split"><div class="card"><div class="card-h"><h2>Phân loại cách đọc</h2>' + (best ? '<span class="pill">Tốt nhất ' + best.best + '%</span>' : '') + '</div>' + renderQuiz(id) + '</div>' +
    '<div class="card"><h3 style="margin-bottom:8px">Quy tắc ' + E.title + '</h3><div class="tbl-wrap"><table><thead><tr><th>Đọc</th><th>Khi nào</th><th>Ví dụ</th></tr></thead><tbody>' + E.rules.map(r => '<tr><td class="ipa" style="font-size:1.1rem">' + r[0] + '</td><td class="small">' + esc(r[1]) + '</td><td class="small">' + esc(r[2]) + ' ' + playBtn(r[2], 0.75, 'sm') + '</td></tr>').join('') + '</tbody></table></div>' +
    '<p class="note" style="margin-top:12px">Người Việt hay bỏ âm cuối. Đọc chậm, phát âm rõ âm cuối trước khi nói nhanh.</p></div></div>';
}
function pronStudio() {
  const samples = ['I work in e-commerce.','Revenue increased by ten percent.','The conversion rate is three point five percent.','I think the shipping fee is too high.','Thank you for your order.','We have three new products this month.'];
  return '<div class="split"><div class="card stack"><h2>Recording Studio</h2><div class="field"><label for="studioText">Câu luyện đọc</label><textarea id="studioText" data-c="studioText">' + esc(ui.studioText) + '</textarea></div>' +
    '<div class="row">' + playBtn(ui.studioText, 0.7) + '<span class="small muted">Chậm</span>' + playBtn(ui.studioText, 1) + '<span class="small muted">Tự nhiên</span></div>' + recorder('studio', '') +
    '<div class="card flat small"><b>Cách so sánh</b><ol style="margin:6px 0 0;padding-left:18px"><li>Nghe câu mẫu 2–3 lần ở tốc độ chậm.</li><li>Ghi âm câu của bạn.</li><li>Nghe xen kẽ: mẫu, bản ghi, mẫu.</li><li>Đánh dấu từ bạn đọc khác mẫu: âm cuối, trọng âm, nối âm.</li></ol></div></div>' +
    '<div class="card"><h3 style="margin-bottom:10px">Câu gợi ý</h3><div class="stack" style="gap:6px">' + samples.map(t => '<button class="btn" style="justify-content:flex-start;white-space:normal;text-align:left" data-a="studioPick" data-t="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div></div></div>';
}
function pronReview() {
  const t = todayISO(), list = SOUNDS.filter(s => S.sounds[s.sym] && S.sounds[s.sym].n).sort((a, b) => (S.sounds[a.sym].next || '').localeCompare(S.sounds[b.sym].next || ''));
  if (!list.length) return '<div class="empty">Chưa có âm nào được luyện. Vào IPA Library, chọn một âm và tự đánh giá sau khi luyện.</div>';
  return '<div class="card"><div class="card-h"><h2>Bảng theo dõi từng âm</h2><span class="small muted">Sắp theo ngày ôn tiếp theo</span></div><div class="tbl-wrap"><table><thead><tr><th>Âm</th><th class="num">Số lần luyện</th><th class="num">Phân biệt âm</th><th>Đánh giá</th><th>Nhận xét</th><th>Ôn tiếp</th><th></th></tr></thead><tbody>' +
    list.map(s => { const r = S.sounds[s.sym], due = r.next && r.next <= t; return '<tr><td class="ipa" style="font-size:1.25rem">/' + esc(s.sym) + '/</td><td class="num">' + r.n + '</td><td class="num">' + (r.pairs ? r.pairs[0] + '/' + r.pairs[1] : '–') + '</td><td><span class="pill ' + ({ 1: 'crit', 2: 'warn', 3: 'good' }[r.rating] || '') + '">' + (RATE_VI[r.rating] || '–') + '</span></td><td class="small" style="max-width:260px">' + esc(r.note || '') + '</td><td class="num">' + (due ? '<span class="pill warn">Hôm nay</span>' : fmtDM(r.next)) + '</td><td><button class="btn sm" data-a="pickSound" data-s="' + esc(s.sym) + '">Luyện</button></td></tr>'; }).join('') +
    '</tbody></table></div></div>';
}

/* ===== 04 Vocabulary & Grammar ===== */
const SRS = [1, 3, 7, 14, 30];
const NEW_PER_DAY = 14;
const weekTopic = () => WEEK_PLAN[clamp(weekNo(todayISO()), 1, 12) - 1].t;
function buildCardQueue() {
  const t = todayISO(), w = clamp(weekNo(t), 1, 12), topic = WEEK_PLAN[w - 1].t;
  const due = dueWords().map(x => x.w), order = WEEK_PLAN.map(p => p.t);
  const rank = t => t === topic ? 0 : order.indexOf(t) < w - 1 ? 1 : 2;
  const newOnes = WORDS.filter(x => !(S.vocab[x.w] && S.vocab[x.w].seen)).sort((a, b) => rank(a.topic) - rank(b.topic)).slice(0, NEW_PER_DAY).map(x => x.w);
  return { queue: [...due, ...newOnes], i: 0, show: false, stats: { again: 0, ok: 0 } };
}
function highlight(sentence, word) {
  const re = new RegExp('(' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'i');
  return esc(sentence).replace(re, '<mark>$1</mark>');
}
function viewVocab() {
  const tabs = [['cards','Flashcard'],['list','Danh sách từ'],['grammar','Ngữ pháp']];
  const vc = vocabCounts();
  let h = pageHead('04 · Vocabulary & Grammar', 'Từ vựng và ngữ pháp', 'Từ vựng ôn theo lặp lại ngắt quãng (1, 3, 7, 14, 30 ngày). Ngữ pháp học theo thứ tự 7 chủ điểm, mỗi bài có lý thuyết ngắn, ví dụ, bài tập và tự đặt câu.') +
    '<div class="kpis" style="margin-bottom:16px"><div class="kpi tint k-review"><div class="label">Đã gặp</div><div class="v">' + vc.seen + ' <small>/ ' + vc.total + '</small></div></div><div class="kpi tint k-vocab"><div class="label">Nhận diện được</div><div class="v">' + vc.recog + '</div><div class="s">Nhớ nghĩa khi đọc, nghe</div></div><div class="kpi tint k-listen"><div class="label">Tự dùng được</div><div class="v">' + vc.use + '</div><div class="s">Đặt được câu khi nói, viết</div></div><div class="kpi tint ' + (vc.due ? 'k-warn' : 'k-review') + '"><div class="label">Cần ôn hôm nay</div><div class="v">' + vc.due + '</div></div></div>' +
    '<div class="tabs">' + tabs.map(([k, l]) => '<button class="' + (ui.vocTab === k ? 'on' : '') + '" data-a="tab" data-v="vocTab" data-k="' + k + '">' + l + '</button>').join('') + '</div>';
  if (ui.vocTab === 'cards') h += vocabCards(); else if (ui.vocTab === 'list') h += vocabList(); else h += ui.grammar ? grammarTopic() : grammarIndex();
  return h;
}
function vocabCards() {
  if (!ui.card) ui.card = buildCardQueue();
  const c = ui.card;
  if (c.i >= c.queue.length) return '<div class="fc"><div class="empty">' + (c.queue.length ? 'Xong phiên ôn: ' + c.stats.ok + ' từ nhớ, ' + c.stats.again + ' từ cần ôn lại.' : 'Không có từ đến hạn hoặc từ mới hôm nay.') + '<div class="row" style="justify-content:center;margin-top:12px"><button class="btn" data-a="cardRestart">Tạo phiên mới</button><button class="btn" data-a="tab" data-v="vocTab" data-k="list">Xem danh sách từ</button></div></div></div>';
  const x = WORDS.find(z => z.w === c.queue[c.i]), st = vocabState(x.w);
  return '<div class="fc"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="small" style="color:var(--accent);font-weight:600">' + (c.i + 1) + '/' + c.queue.length + '</span><span class="row"><span class="pill ' + st.cls + '">' + st.vi + '</span><span class="pill">' + VOCAB_TOPICS[x.topic] + '</span></span></div>' +
    '<div class="fc-card" data-a="cardFlip" role="button" tabindex="0" aria-label="Lật thẻ"><div class="sent">' + highlight(x.ex, x.w) + '</div>' +
    (c.show ? '<div class="fc-ans"><div class="w">' + esc(x.w) + ' ' + playBtn(x.w, 0.8) + '</div><div class="ipa">/' + esc(x.ipa) + '/</div><div class="small muted">' + esc(x.pos) + '</div><div><b>' + esc(x.vi) + '</b></div><div class="small muted">Cụm từ: <i>' + esc(x.col) + '</i> ' + playBtn(x.ex, 0.85, 'sm') + '</div></div>' : '<div class="small muted" style="margin-top:auto">Đoán nghĩa từ được tô màu, rồi chạm để xem đáp án</div>') + '</div>' +
    (c.show ? '<div class="fc-rate"><button data-a="cardRate" data-r="0">Quên<small>ôn lại hôm nay</small></button><button data-a="cardRate" data-r="1">Nhớ<small>ôn sau ' + SRS[Math.min(((S.vocab[x.w] || {}).step || 0), 4)] + ' ngày</small></button><button data-a="cardRate" data-r="2">Dễ<small>giãn khoảng ôn</small></button></div>' : '') + '</div>';
}
function vocabList() {
  if (!ui.vocTopic) ui.vocTopic = weekTopic();
  const flt = WORDS.filter(x => (ui.vocTopic === 'all' || x.topic === ui.vocTopic) && (ui.vocStatus === 'all' || vocabState(x.w).k === ui.vocStatus));
  const order = WEEK_PLAN.map(p => p.t), q = ui.vocQ.trim().toLowerCase();
  const count = t => WORDS.filter(x => x.topic === t).length;
  let h = '<div class="row" style="margin-bottom:12px;align-items:flex-end"><div class="field" style="min-width:240px;flex:1;max-width:340px"><label for="vocTopicSel">Chủ đề</label><select id="vocTopicSel" data-c="vocTopic"><option value="all"' + (ui.vocTopic === 'all' ? ' selected' : '') + '>Tất cả chủ đề · ' + WORDS.length + ' từ</option>' +
    order.map((t, i) => '<option value="' + t + '"' + (ui.vocTopic === t ? ' selected' : '') + '>Tuần ' + (i + 1) + ': ' + VOCAB_TOPICS[t] + ' · ' + count(t) + ' từ</option>').join('') + '</select></div>' +
    '<div class="field" style="min-width:200px;flex:1;max-width:300px"><label for="vocQ">Tìm từ hoặc nghĩa</label><input type="text" id="vocQ" data-c="vocQ" value="' + esc(ui.vocQ) + '" placeholder="ví dụ: order, giao hàng" autocomplete="off"></div>' +
    '<div class="seg">' + [['all','Mọi trạng thái'],['new','Mới'],['learning','Đang học'],['known','Đã nhớ'],['due','Cần ôn']].map(([k, l]) => '<button class="' + (ui.vocStatus === k ? 'on' : '') + '" data-a="tab" data-v="vocStatus" data-k="' + k + '">' + l + '</button>').join('') + '</div></div>';
  if (ui.useWord) {
    const x = WORDS.find(z => z.w === ui.useWord);
    h += '<div class="card" style="margin-bottom:14px"><div class="card-h"><h3>Tự đặt câu với "' + esc(x.w) + '"</h3><button class="btn sm ghost" data-a="useClose">Đóng</button></div><p class="small muted">Mẫu: ' + esc(x.ex) + '</p><div class="field" style="margin-top:8px"><label for="useIn">Câu của bạn (về công việc hoặc cuộc sống của bạn)</label><textarea id="useIn"></textarea></div>' +
      aiBlock('use:' + x.w, 'Đặt một câu tiếng Anh dùng đúng từ "' + x.w + '" (' + x.vi + ').', 'useIn') + '<div class="row" style="margin-top:10px"><button class="btn pri" data-a="markUse" data-w="' + esc(x.w) + '">Tôi tự dùng được từ này</button></div></div>';
  }
  h += '<div class="card"><div class="small muted" style="margin-bottom:6px">' + flt.length + ' từ' + (ui.vocTopic !== 'all' ? ' · ' + esc(VOCAB_TOPICS[ui.vocTopic]) : '') + '</div><div class="tbl-wrap"><table><thead><tr><th></th><th>Từ</th><th>IPA</th><th>Loại</th><th>Nghĩa</th><th>Ví dụ</th><th>Cụm từ</th><th>Trạng thái</th><th>Tự dùng</th></tr></thead><tbody id="vocRows">' +
    flt.map(x => { const st = vocabState(x.w), v = S.vocab[x.w] || {}, key = (x.w + ' ' + x.vi).toLowerCase(); return '<tr data-s="' + esc(key) + '"' + (q && !key.includes(q) ? ' hidden' : '') + '><td>' + playBtn(x.w, 0.8, 'sm') + '</td><td><b>' + esc(x.w) + '</b></td><td class="ipa">/' + esc(x.ipa) + '/</td><td class="small muted">' + esc(x.pos) + '</td><td>' + esc(x.vi) + '</td><td class="small" style="min-width:220px">' + esc(x.ex) + '</td><td class="small muted">' + esc(x.col) + '</td><td><span class="pill ' + st.cls + '">' + st.vi + '</span></td><td>' + (v.use ? '<span class="pill good">Có</span>' : '<button class="btn sm" data-a="useOpen" data-w="' + esc(x.w) + '">Đặt câu</button>') + '</td></tr>'; }).join('') +
    '</tbody></table></div>' + (flt.length ? '' : '<div class="empty">Không có từ phù hợp bộ lọc.</div>') + '</div>';
  return h;
}
function grammarIndex() {
  const t = todayISO(), w = clamp(weekNo(t), 1, 12), cur = WEEK_PLAN[w - 1].g;
  return '<div class="grid g2">' + GRAMMAR.map((g, i) => { const r = S.grammar[g.id]; return '<button class="modcard tint ' + (g.id === cur ? 'k-pron' : 'k-grammar') + '" data-a="openGrammar" data-g="' + g.id + '"><span class="idx">BÀI ' + (i + 1) + (g.id === cur ? ' · TUẦN NÀY' : '') + '</span><h3>' + esc(g.title) + '</h3><span class="small muted">' + esc(g.goal) + '</span>' +
    '<span class="row" style="margin-top:auto">' + (r ? '<span class="pill ' + (r.best >= 80 ? 'good' : 'warn') + '">Tốt nhất ' + r.best + '%</span><span class="tiny muted">' + r.tries + ' lần làm</span>' : '<span class="pill">Chưa làm</span>') + '</span></button>'; }).join('') + '</div>';
}
function grammarTopic() {
  const g = GRAMMAR.find(x => x.id === ui.grammar), idx = GRAMMAR.indexOf(g), id = 'g:' + g.id;
  quizFor(id, () => g.qs.map(([q, opts, a, why]) => ({ q, opts, a, why, kind: 'Ngữ pháp' })));
  const next = GRAMMAR[idx + 1];
  return '<div class="row" style="margin-bottom:12px"><button class="btn sm" data-a="grammarBack">‹ Danh sách chủ điểm</button><span class="small muted">Bài ' + (idx + 1) + '/7</span></div>' +
    '<div class="split"><div class="stack"><div class="card"><div class="label">Mục tiêu</div><h2 style="margin:4px 0 6px">' + esc(g.title) + '</h2><p class="small">' + esc(g.goal) + '</p></div>' +
    '<div class="card"><h3 style="margin-bottom:10px">Bài tập</h3>' + renderQuiz(id) + '</div>' +
    '<div class="card"><h3 style="margin-bottom:6px">Tự đặt câu</h3><p class="small muted">' + esc(g.write) + '</p><div class="field" style="margin-top:8px"><label for="gw">Câu của bạn</label><textarea id="gw" data-c="gwrite" data-g="' + g.id + '">' + esc(S.gwrite[g.id] || '') + '</textarea></div>' + aiBlock('g:' + g.id, g.write + ' Chủ điểm: ' + g.title + '.', 'gw') + '</div></div>' +
    '<div class="stack"><div class="card"><h3 style="margin-bottom:8px">Lý thuyết ngắn</h3><ul style="margin:0;padding-left:18px" class="small">' + g.theory.map(t => '<li style="margin-bottom:6px">' + esc(t) + '</li>').join('') + '</ul></div>' +
    '<div class="card"><h3 style="margin-bottom:8px">Ví dụ</h3>' + g.ex.map(e => '<div class="line">' + playBtn(e, 0.85, 'sm') + '<span class="en">' + esc(e) + '</span></div>').join('') + '</div>' +
    (next ? '<button class="btn" data-a="openGrammar" data-g="' + next.id + '">Bài tiếp: ' + esc(next.title) + ' ›</button>' : '') + '</div></div>';
}
