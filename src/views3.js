/* ===== 05 Listening & Speaking ===== */
const LISTEN_TABS = [['lesson','Slow Listening'],['dict','Dictation'],['shadow','Shadowing'],['speak','Speaking Practice'],['dialog','Daily Dialogue']];
function normW(w) { return w.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9'-]/g, ''); }
function diffWords(target, typed) {
  const t = target.split(/\s+/), u = typed.trim().split(/\s+/).filter(Boolean);
  const tn = t.map(normW), un = u.map(normW), n = t.length, m = u.length;
  const dp = [...Array(n + 1)].map(() => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = tn[i] === un[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0; const out = [];
  while (i < n || j < m) {
    if (i < n && j < m && tn[i] === un[j]) { out.push('<span class="ok">' + esc(t[i]) + '</span>'); i++; j++; }
    else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) { out.push('<span class="extra">' + esc(u[j]) + '</span>'); j++; }
    else { out.push('<span class="miss">' + esc(t[i]) + '</span>'); i++; }
  }
  return { html: out.join(' '), score: n ? dp[0][0] / n : 0 };
}
function lessonPicker() {
  return '<div class="field" style="max-width:420px;margin-bottom:14px"><label for="lessonSel">Bài nghe</label><select id="lessonSel" data-c="lesson">' + LISTEN.map(l => '<option value="' + l.id + '"' + (l.id === ui.lesson ? ' selected' : '') + '>' + esc(l.title) + ' · ' + esc(l.vi) + '</option>').join('') + '</select></div>';
}
function viewListening() {
  let h = pageHead('05 · Listening & Speaking', 'Nghe hiểu và giao tiếp', 'Ở cấp độ A1, ưu tiên hiểu câu ngắn, nói rõ ý và trả lời được câu hỏi quen thuộc. Chưa cần nói nhanh như người bản ngữ.') +
    '<div class="tabs">' + LISTEN_TABS.map(([k, l]) => '<button class="' + (ui.listenTab === k ? 'on' : '') + '" data-a="tab" data-v="listenTab" data-k="' + k + '">' + l + '</button>').join('') + '</div>';
  return h + ({ lesson: listenLesson, dict: listenDict, shadow: listenShadow, speak: listenSpeak, dialog: listenDialog }[ui.listenTab])();
}
function listenLesson() {
  const L = LISTEN.find(x => x.id === ui.lesson), all = L.lines.map(x => x[0]);
  return lessonPicker() + '<div class="split"><div class="card"><div class="card-h"><h2>' + esc(L.title) + '</h2><div class="row"><button class="btn" data-a="sayAll" data-r="0.7">' + ICON.slow + ' Nghe chậm</button><button class="btn" data-a="sayAll" data-r="1">' + ICON.play + ' Tốc độ tự nhiên</button></div></div>' +
    '<div class="row" style="margin-bottom:8px"><div class="seg"><button class="' + (ui.showEn ? 'on' : '') + '" data-a="toggle" data-v="showEn">Phụ đề Anh</button><button class="' + (ui.showVi ? 'on' : '') + '" data-a="toggle" data-v="showVi">Phụ đề Việt</button></div><span class="tiny muted">Nghe từng câu: bấm nút bên trái mỗi câu</span></div>' +
    L.lines.map(([en, vi]) => '<div class="line">' + playBtn(en, 0.75, 'sm') + '<div><div class="en">' + (ui.showEn ? esc(en) : '<span class="faint">••• ••• •••</span>') + '</div>' + (ui.showVi ? '<div class="vi">' + esc(vi) + '</div>' : '') + '</div></div>').join('') + '</div>' +
    '<div class="card"><h3 style="margin-bottom:8px">Một bài nghe đi qua 5 bước</h3><ol class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px"><li>Nghe toàn bộ đoạn hội thoại khi tắt phụ đề.</li><li>Nghe lần hai và xác định từ khóa.</li><li>Bật phụ đề, tra từ và kiểm tra cách phát âm.</li><li>Shadowing: nghe một câu rồi bắt chước nhịp điệu, trọng âm.</li><li>Tắt phụ đề, tự nói lại và ghi âm.</li></ol>' +
    '<div class="row" style="margin-top:14px"><button class="btn" data-a="tab" data-v="listenTab" data-k="dict">Chép chính tả ›</button><button class="btn" data-a="tab" data-v="listenTab" data-k="shadow">Shadowing ›</button></div></div></div>';
}
function listenDict() {
  const L = LISTEN.find(x => x.id === ui.lesson), st = ui.dict[L.id] || (ui.dict[L.id] = {});
  const best = (S.listening[L.id] || {}).dict;
  let h = lessonPicker() + '<div class="card"><div class="card-h"><h2>Dictation · ' + esc(L.title) + '</h2>' + (best != null ? '<span class="pill ' + (best >= 80 ? 'good' : 'warn') + '">Tốt nhất ' + best + '%</span>' : '') + '</div><p class="small muted" style="margin-bottom:10px">Nghe từng câu rồi gõ lại. Từ đúng màu xanh, từ thiếu gạch dưới đỏ, từ thừa gạch ngang.</p>';
  L.lines.forEach(([en, vi], i) => {
    const r = st[i];
    h += '<div class="line" style="flex-wrap:wrap"><div class="row">' + playBtn(en, 0.7, 'sm') + playBtn(en, 1, 'sm') + '</div><div style="flex:1;min-width:220px"><div class="row"><input type="text" id="dict-' + i + '" value="' + esc(r ? r.typed : '') + '" placeholder="Câu ' + (i + 1) + '" autocomplete="off" spellcheck="false" style="flex:1"><button class="btn sm" data-a="dictCheck" data-i="' + i + '">Kiểm tra</button></div>' +
      (r ? '<div class="diff small" style="margin-top:6px">' + r.html + ' <span class="pill ' + (r.score >= 0.8 ? 'good' : 'warn') + '">' + Math.round(r.score * 100) + '%</span></div><div class="vi">' + esc(vi) + '</div>' : '') + '</div></div>';
  });
  const done = L.lines.every((_, i) => st[i]);
  if (done) { const avg = Math.round(L.lines.reduce((t, _, i) => t + st[i].score, 0) / L.lines.length * 100); h += '<div class="result" style="margin-top:12px"><div class="sc">' + avg + '%</div><div class="small">Điểm chép chính tả của bài này đã được lưu. Câu dưới 80% nên nghe lại ở tốc độ chậm.</div></div>'; }
  return h + '</div>';
}
function listenShadow() {
  const L = LISTEN.find(x => x.id === ui.lesson), st = ui.shadow[L.id] || (ui.shadow[L.id] = {});
  const doneAll = (S.listening[L.id] || {}).shadow;
  return lessonPicker() + '<div class="split"><div class="card"><div class="card-h"><h2>Shadowing · ' + esc(L.title) + '</h2>' + (doneAll ? '<span class="pill good">Đã hoàn thành</span>' : '') + '</div><p class="small muted" style="margin-bottom:8px">Nghe một câu, dừng lại, nói theo đúng nhịp và trọng âm. Lặp lại 3 lần rồi đánh dấu.</p>' +
    L.lines.map(([en], i) => '<div class="task ' + (st[i] ? 'done' : '') + '"><button class="chk ' + (st[i] ? 'on' : '') + '" data-a="shadowMark" data-i="' + i + '" aria-label="Đã nói theo">' + (st[i] ? ICON.check : '') + '</button><div class="t"><b>' + esc(en) + '</b></div>' + playBtn(en, 0.75, 'sm') + playBtn(en, 1, 'sm') + '</div>').join('') + '</div>' +
    recorder('shadow:' + L.id, L.lines.map(x => x[0]).join(' ')) + '</div>';
}
function listenSpeak() {
  const [q, vi, sample] = SPEAK_QS[ui.speakQ], key = 'speak:' + ui.speakQ;
  const mine = S.speak.filter(a => a.q === q).slice(-1)[0];
  return '<div class="split"><div class="card stack"><div class="row" style="justify-content:space-between"><span class="label">Câu hỏi ' + (ui.speakQ + 1) + '/' + SPEAK_QS.length + '</span><div class="row"><button class="btn sm" data-a="speakNav" data-d="-1"' + (ui.speakQ === 0 ? ' disabled' : '') + '>‹</button><button class="btn sm" data-a="speakNav" data-d="1"' + (ui.speakQ === SPEAK_QS.length - 1 ? ' disabled' : '') + '>›</button></div></div>' +
    '<div class="row" style="gap:12px">' + playBtn(q, 0.8) + '<h2 style="flex:1">' + esc(q) + '</h2></div><p class="small muted">' + esc(vi) + '</p>' +
    '<div class="field"><label for="spk">Câu trả lời của bạn (nói to trước, rồi gõ lại)</label><textarea id="spk">' + esc(mine ? mine.a : '') + '</textarea></div>' +
    '<div class="row"><button class="btn pri" data-a="speakSave">Lưu câu trả lời</button><button class="btn" data-a="speakSay">Nghe câu của tôi</button></div>' + aiBlock(key, 'Trả lời câu hỏi "' + q + '" bằng 1–3 câu đơn giản.', 'spk') + '</div>' +
    '<div class="card"><h3 style="margin-bottom:6px">Câu trả lời mẫu</h3><div class="line">' + playBtn(sample, 0.85, 'sm') + '<span class="en">' + esc(sample) + '</span></div><p class="note" style="margin-top:10px">Đổi thông tin trong câu mẫu cho đúng với bạn. Đã lưu ' + S.speak.length + ' câu trả lời.</p></div></div>';
}
function listenDialog() {
  const D = DIALOGS.find(x => x.id === ui.dialog);
  return '<div class="row" style="margin-bottom:14px"><div class="seg">' + DIALOGS.map(d => '<button class="' + (d.id === ui.dialog ? 'on' : '') + '" data-a="tab" data-v="dialog" data-k="' + d.id + '">' + esc(d.title) + '</button>').join('') + '</div></div>' +
    '<div class="card"><div class="card-h"><h2>' + esc(D.title) + '</h2><div class="row"><button class="btn" data-a="dialogPlay">' + ICON.play + ' Nghe cả hội thoại</button><button class="btn ' + (ui.rolePlay ? 'pri' : '') + '" data-a="toggle" data-v="rolePlay">Tôi đóng vai B</button></div></div>' +
    D.lines.map(([who, en], i) => { const hide = ui.rolePlay && who === 'B' && !ui.reveal[D.id + i]; return '<div class="line"><span class="who ' + (who === 'B' ? 'b' : '') + '">' + who + '</span><div style="flex:1;min-width:0">' + (hide ? '<div class="row"><input type="text" id="rp-' + i + '" placeholder="Bạn nói gì ở lượt này?" style="flex:1"><button class="btn sm" data-a="reveal" data-i="' + i + '">Xem câu mẫu</button></div>' : '<span class="en">' + esc(en) + '</span>') + '</div>' + (hide ? '' : playBtn(en, 0.85, 'sm')) + '</div>'; }).join('') +
    '<p class="tiny muted" style="margin-top:10px">Chế độ đóng vai: đọc lượt của A, nói câu trả lời của B thành tiếng, gõ lại rồi so với câu mẫu.</p></div>';
}

/* ===== 06 E-commerce English ===== */
function numVariants(raw) {
  const unit = /%$/.test(raw) ? '%' : /VND$/i.test(raw) ? ' VND' : '';
  const n = Number(raw.replace(/[^0-9.]/g, ''));
  const alt = Number.isInteger(n) ? [n * 10, n / 10] : [n * 10, n / 10];
  return [n, ...alt].map(x => fmtNum(Math.round(x * 1000) / 1000) + unit);
}
function viewEcom() {
  let h = pageHead('06 · E-commerce English', 'Tiếng Anh thương mại điện tử', 'Học kiến thức nền cùng ngôn ngữ của công việc: số liệu, chỉ số, báo cáo, quảng cáo và đơn hàng. Các module tăng dần độ khó.');
  if (!ui.ecom) {
    h += '<p class="note" style="margin-bottom:16px">Thuật ngữ chuyên ngành có thể làm quen từ sớm. Nhận diện được một thuật ngữ khác với dùng thành thạo; chưa cần phân tích báo cáo phức tạp bằng tiếng Anh khi câu cơ bản còn chưa vững.</p>';
    h += '<div class="grid g3">' + ECOM_MODS.map((m, i) => {
      let prog = '';
      if (m.id === 'm2') { const k = Object.values(S.terms).filter(Boolean).length; prog = k + '/' + TERMS.length + ' thuật ngữ'; }
      else if (m.id === 'm5') { const k = Object.values(S.phrases).filter(Boolean).length; prog = k + '/' + ADS_PHRASES.length + ' câu đã luyện'; }
      else { const r = S.ecom[m.id]; prog = r ? 'Tốt nhất ' + r.best + '%' : 'Chưa làm'; }
      return '<button class="modcard tint k-ecom" data-a="openEcom" data-m="' + m.id + '"><span class="idx">MODULE ' + (i + 1) + ' · ' + m.level.toUpperCase() + '</span><h3>' + esc(m.title) + '</h3><span class="small muted">' + esc(m.desc) + '</span><span class="pill" style="align-self:flex-start;margin-top:auto">' + prog + '</span></button>';
    }).join('') + '</div>';
    return h;
  }
  const m = ECOM_MODS.find(x => x.id === ui.ecom);
  h += '<div class="row" style="margin-bottom:14px"><button class="btn sm" data-a="ecomBack">‹ Các module</button><span class="small muted">' + esc(m.title) + ' · ' + m.level + '</span></div>';
  if (m.id === 'm1') {
    quizFor('e:m1', () => shuffle(NUM_ITEMS).map(raw => { const opts = shuffle(numVariants(raw)); const correct = numVariants(raw)[0]; return { q: 'Cách đọc đúng của ' + raw + '?', html: 'Cách đọc đúng của <span class="mono-num">' + esc(raw) + '</span>?', opts: opts.map(readNumber), a: opts.indexOf(correct), why: raw + ' = ' + readNumber(raw) + '.', after: readNumber(raw), kind: 'Đọc số', one: true }; }));
    const out = readNumber(ui.conv);
    h += '<div class="split"><div class="card"><h2 style="margin-bottom:10px">Bài tập đọc số</h2>' + renderQuiz('e:m1', { one: true }) + '</div><div class="stack"><div class="card stack"><h3>Chuyển số thành chữ</h3><div class="field"><label for="convIn">Nhập số (ví dụ 1,250 · 3.5% · 125,000,000 VND)</label><input type="text" id="convIn" data-c="conv" value="' + esc(ui.conv) + '" autocomplete="off"></div><div class="conv-out" id="convOut">' + esc(out || 'Chưa đọc được số này. Dùng dấu phẩy ngăn nghìn, dấu chấm cho số thập phân.') + '</div><div class="row">' + '<button class="btn" data-a="sayConv" data-r="0.75">' + ICON.slow + ' Nghe chậm</button><button class="btn" data-a="sayConv" data-r="1">' + ICON.play + ' Nghe</button></div>' + recorder('conv', '') + '</div>' +
      '<div class="card small"><h3 style="margin-bottom:6px">Quy tắc nhanh</h3><ul style="margin:0;padding-left:18px"><li>Dấu phẩy ngăn nghìn: 1,250 = one thousand two hundred and fifty.</li><li>Dấu chấm là số thập phân: 3.5 = three point five.</li><li>million, thousand không thêm -s sau số: two million.</li><li>percent không thêm -s: ten percent.</li><li>Tiền Việt đọc là dong: forty-five thousand dong.</li></ul></div></div></div>';
  } else if (m.id === 'm2') {
    h += '<div class="card"><div class="card-h"><h2>Thuật ngữ chỉ số</h2><span class="small muted">' + Object.values(S.terms).filter(Boolean).length + '/' + TERMS.length + ' đã đánh dấu</span></div><div class="tbl-wrap"><table><thead><tr><th>Thuật ngữ</th><th>Viết đầy đủ</th><th>Nghĩa</th><th>Cách đọc</th><th>Ví dụ</th><th>Mức độ</th></tr></thead><tbody>' +
      TERMS.map(([t, full, vi, sayHow, ex]) => { const lv = S.terms[t] || ''; return '<tr><td><b>' + esc(t) + '</b></td><td class="small">' + esc(full) + '</td><td class="small">' + esc(vi) + '</td><td class="small muted">' + esc(sayHow) + '</td><td class="small" style="min-width:220px"><span class="row" style="flex-wrap:nowrap;align-items:flex-start">' + playBtn(ex, 0.85, 'sm') + '<span>' + esc(ex) + '</span></span></td><td><div class="seg"><button class="' + (lv === 'r' ? 'on' : '') + '" data-a="termLv" data-t="' + esc(t) + '" data-l="r">Nhận diện</button><button class="' + (lv === 'u' ? 'on' : '') + '" data-a="termLv" data-t="' + esc(t) + '" data-l="u">Sử dụng</button></div></td></tr>'; }).join('') + '</tbody></table></div></div>';
  } else if (m.id === 'm3') {
    quizFor('e:m3', () => REPORT_QS.map(([q, opts, a, why]) => ({ q, opts, a, why, after: opts[a], kind: 'Báo cáo', one: true })));
    h += '<div class="split"><div class="card"><h2 style="margin-bottom:4px">Read the Sales Report</h2><p class="small muted" style="margin-bottom:12px">Đọc bảng số liệu và trả lời bằng tiếng Anh.</p>' + renderQuiz('e:m3', { one: true }) + '</div><div class="card"><h3 style="margin-bottom:8px">Sales report · tuần này</h3><div class="tbl-wrap"><table><thead><tr><th>Metric</th><th class="num">Value</th><th></th></tr></thead><tbody>' +
      REPORT.rows.map(([k, v]) => '<tr><td>' + esc(k) + '</td><td class="num mono-num">' + esc(v) + '</td><td>' + playBtn(k + ': ' + readNumber(v), 0.85, 'sm') + '</td></tr>').join('') + '</tbody></table></div><p class="tiny muted" style="margin-top:8px">Số liệu ví dụ để luyện tập.</p></div></div>';
  } else if (m.id === 'm4') {
    quizFor('e:m4', () => COMPARE_QS.map(([q, opts, a, why]) => ({ q, opts, a, why, after: opts[a], kind: 'So sánh kỳ', one: true })));
    h += '<div class="split"><div class="card"><h2 style="margin-bottom:10px">Chọn câu mô tả đúng</h2>' + renderQuiz('e:m4', { one: true }) + '</div><div class="stack"><div class="card"><h3 style="margin-bottom:8px">Tuần trước và tuần này</h3><div class="tbl-wrap"><table><thead><tr><th>Metric</th><th class="num">Last week</th><th class="num">This week</th><th class="num">Change</th></tr></thead><tbody>' +
      COMPARE.rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td class="num mono-num">' + esc(r[1]) + '</td><td class="num mono-num">' + esc(r[2]) + '</td><td class="num"><span class="pill ' + (r[3].startsWith('+') ? 'good' : r[3] === '0' ? '' : 'crit') + '">' + esc(r[3]) + '</span></td></tr>').join('') + '</tbody></table></div></div>' +
      '<div class="card"><h3 style="margin-bottom:8px">Mẫu câu so sánh</h3>' + COMPARE_PATTERNS.map(([en, vi]) => '<div class="line">' + playBtn(en, 0.85, 'sm') + '<div><div class="en">' + esc(en) + '</div><div class="vi">' + esc(vi) + '</div></div></div>').join('') + '</div></div></div>';
  } else {
    h += '<div class="card"><div class="card-h"><h2>Câu dùng cho quảng cáo và đơn hàng</h2><span class="small muted">Đánh dấu khi bạn đọc được câu rõ ràng</span></div>' +
      ADS_PHRASES.map(([en, vi], i) => '<div class="task ' + (S.phrases[i] ? 'done' : '') + '"><button class="chk ' + (S.phrases[i] ? 'on' : '') + '" data-a="phraseMark" data-i="' + i + '" aria-label="Đã luyện">' + (S.phrases[i] ? ICON.check : '') + '</button><div class="t"><b style="text-decoration:none">' + esc(en) + '</b><span class="meta">' + esc(vi) + '</span></div>' + playBtn(en, 0.8, 'sm') + playBtn(en, 1, 'sm') + '</div>').join('') + '</div>';
  }
  return h;
}

/* ===== 07 Real-life Practice ===== */
const LV = ['', 'Học câu mẫu', 'Thay thông tin của bạn', 'Tự hội thoại không nhìn mẫu'];
function fillTemplate(r, vals) { return r.l2.text.replace(/\{(\w+)\}/g, (_, k) => (vals[k] || r.l2.fields.find(f => f[0] === k)[2])); }
function viewPractice() {
  let h = pageHead('07 · Real-life Practice', 'Tiếng Anh trong cuộc sống và công việc', 'Mỗi tình huống có 3 cấp: học câu mẫu, thay bằng thông tin của bạn, rồi tự trả lời mà không nhìn mẫu.');
  if (!ui.real) {
    h += '<div class="grid g3">' + REAL.map((r, i) => { const lv = (S.real[r.id] || {}).lv || 0; return '<button class="modcard tint k-speak" data-a="openReal" data-r="' + r.id + '"><span class="idx">TÌNH HUỐNG ' + (i + 1) + '</span><h3>' + esc(r.title) + '</h3><div class="row" style="gap:4px;margin-top:auto">' + [1, 2, 3].map(k => '<span class="pill ' + (lv >= k ? 'good' : '') + '">Cấp ' + k + '</span>').join('') + '</div></button>'; }).join('') + '</div>';
    return h;
  }
  const r = REAL.find(x => x.id === ui.real), st = S.real[r.id] || {}, lv = ui.realLv;
  h += '<div class="row" style="margin-bottom:14px"><button class="btn sm" data-a="realBack">‹ Các tình huống</button><b>' + esc(r.title) + '</b></div><div class="tabs">' + [1, 2, 3].map(k => '<button class="' + (lv === k ? 'on' : '') + '" data-a="realLv" data-l="' + k + '">Cấp ' + k + ': ' + LV[k] + ((st.lv || 0) >= k ? ' ✓' : '') + '</button>').join('') + '</div>';
  if (lv === 1) {
    h += '<div class="card"><div class="card-h"><h2>Câu mẫu</h2><button class="btn" data-a="sayLines" data-r="' + r.id + '">' + ICON.play + ' Nghe tất cả</button></div>' + r.l1.map(([en, vi]) => '<div class="line">' + playBtn(en, 0.8, 'sm') + '<div><div class="en">' + esc(en) + '</div><div class="vi">' + esc(vi) + '</div></div></div>').join('') +
      '<div class="row" style="margin-top:14px"><button class="btn pri" data-a="realDone" data-l="1">Tôi đọc thuộc các câu này</button></div></div>';
  } else if (lv === 2) {
    const vals = st.fields || {}, script = fillTemplate(r, vals);
    h += '<div class="split"><div class="card stack"><h2>Điền thông tin của bạn</h2>' + r.l2.fields.map(([k, l, ph]) => '<div class="field"><label for="rf-' + k + '">' + esc(l) + '</label><input type="text" id="rf-' + k + '" data-c="realField" data-k="' + k + '" value="' + esc(vals[k] || '') + '" placeholder="' + esc(ph) + '"></div>').join('') + '</div>' +
      '<div class="card stack"><h3>Kịch bản của bạn</h3><div class="conv-out" id="realScript" style="font-size:1.05rem">' + esc(script) + '</div><div class="row"><button class="btn" data-a="sayScript" data-r="0.8">' + ICON.slow + ' Nghe chậm</button><button class="btn" data-a="sayScript" data-r="1">' + ICON.play + ' Nghe</button></div>' + recorder('real:' + r.id, '') +
      '<button class="btn pri" data-a="realDone" data-l="2">Lưu và hoàn thành cấp 2</button></div></div>';
  } else {
    const ans = st.l3 || {};
    h += '<div class="card"><div class="card-h"><h2>Tự trả lời</h2><span class="small muted">Nói to trước, rồi gõ lại câu bạn đã nói</span></div>' + r.l3.map((q, i) => { const isEn = /^[A-Za-z]/.test(q) && !/[ạảãáàâầấậẩẫăằắặẳẵđêềếệểễôồốộổỗơờớợởỡưừứựửữ]/i.test(q); return '<div style="padding:12px 0;border-top:1px solid var(--line)"><div class="row">' + (isEn ? playBtn(q, 0.85, 'sm') : '') + '<b>' + esc(q) + '</b></div><div class="field" style="margin-top:8px"><textarea id="r3-' + i + '" data-c="realAns" data-i="' + i + '" placeholder="Câu trả lời bằng tiếng Anh">' + esc(ans[i] || '') + '</textarea></div>' + aiBlock('real:' + r.id + ':' + i, (isEn ? 'Trả lời câu hỏi: ' : 'Nói bằng tiếng Anh trong tình huống: ') + q, 'r3-' + i) + '</div>'; }).join('') +
      '<button class="btn pri" style="margin-top:10px" data-a="realDone" data-l="3">Hoàn thành cấp 3</button></div>';
  }
  return h;
}

/* ===== 08 Progress & Review ===== */
function makeWeekTest() {
  const t = todayISO(), w = clamp(weekNo(t), 1, 12), gids = [...new Set(WEEK_PLAN.slice(0, w).map(p => p.g))];
  const gq = pick(GRAMMAR.filter(g => gids.includes(g.id)).flatMap(g => g.qs), 5).map(([q, opts, a, why]) => ({ q, opts, a, why, kind: 'Ngữ pháp' }));
  const topics = [...new Set(WEEK_PLAN.slice(0, w).map(p => p.t))]; const pool = WORDS.filter(x => topics.includes(x.topic));
  const vq = pick(pool, 5).map(x => { const wrong = pick(WORDS.filter(z => z.w !== x.w), 2).map(z => z.vi); const opts = shuffle([x.vi, ...wrong]); return { q: '"' + x.w + '" nghĩa là gì?', html: '<b>' + esc(x.w) + '</b> nghĩa là gì?', say: x.w, opts, a: opts.indexOf(x.vi), why: x.ex, kind: 'Từ vựng' }; });
  return shuffle([...gq, ...vq]);
}
function makeA1Test() {
  const firstPass = GRAMMAR.map(g => pick(g.qs, 1)[0]);
  const extra = pick(GRAMMAR.flatMap(g => g.qs).filter(x => !firstPass.includes(x)), 3);
  const gq = [...firstPass, ...extra].map(([q, opts, a, why]) => ({ q, opts, a, why, kind: 'Ngữ pháp' }));
  const vq = pick(WORDS, 6).map(x => { const wrong = pick(WORDS.filter(z => z.w !== x.w), 2).map(z => z.vi); const opts = shuffle([x.vi, ...wrong]); return { q: '"' + x.w + '" nghĩa là gì?', html: '<b>' + esc(x.w) + '</b> nghĩa là gì?', say: x.w, opts, a: opts.indexOf(x.vi), why: x.ex, kind: 'Từ vựng' }; });
  const nq = pick(NUM_ITEMS, 4).map(raw => { const v = numVariants(raw), opts = shuffle(v); return { q: 'Cách đọc đúng của ' + raw + '?', opts: opts.map(readNumber), a: opts.indexOf(v[0]), why: raw + ' = ' + readNumber(raw), kind: 'Đọc số', one: true }; });
  return [...gq, ...vq, ...nq];
}
function viewProgress() {
  const tabs = [['overview','Tổng quan'],['errors','Nhật ký lỗi'],['tests','Bài kiểm tra'],['cando','Việc làm được']];
  let h = pageHead('08 · Progress & Review', 'Theo dõi và sửa lỗi', 'Tiến bộ đo bằng 6 nhóm chỉ số, không chỉ bằng chuỗi ngày học hay số từ đã thuộc.') +
    '<div class="tabs">' + tabs.map(([k, l]) => '<button class="' + (ui.progTab === k ? 'on' : '') + '" data-a="tab" data-v="progTab" data-k="' + k + '">' + l + '</button>').join('') + '</div>';
  if (ui.progTab === 'overview') h += progOverview();
  else if (ui.progTab === 'errors') h += progErrors();
  else if (ui.progTab === 'tests') h += progTests();
  else h += progCando();
  return h;
}
function progOverview() {
  const t = todayISO(), past = S.blocks.filter(b => b.date <= t && b.status !== 'moved'), pd = past.filter(b => b.status === 'done').length;
  const tot = totalDone(), vc = vocabCounts(), sp = skillProgress();
  const pr = SOUNDS.filter(s => S.sounds[s.sym] && S.sounds[s.sym].n), pairT = SOUNDS.reduce((a, s) => { const p = S.sounds[s.sym] && S.sounds[s.sym].pairs; return p ? [a[0] + p[0], a[1] + p[1]] : a; }, [0, 0]);
  const dicts = LISTEN.map(l => (S.listening[l.id] || {}).dict).filter(x => x != null);
  const cando = Object.values(S.cando).filter(Boolean).length;
  const weeks = [...Array(12)].map((_, i) => ({ w: i + 1, ...weekStats(i + 1) }));
  const mx = Math.max(...weeks.map(x => Math.max(x.plan, x.done)), 60), cw = clamp(weekNo(t), 1, 12);
  let h = '<div class="card" style="margin-bottom:16px"><div class="card-h"><h2>Giờ học theo tuần</h2><span class="small muted num">' + (tot / 60).toFixed(1) + ' / 100 giờ · cần khoảng ' + Math.max(0, Math.ceil((6000 - tot) / Math.max(1, 13 - cw))) + ' phút mỗi tuần còn lại</span></div><div class="cols" style="height:150px">' +
    weeks.map(x => '<div class="col"><span class="vl">' + (x.done ? (x.done / 60).toFixed(1) : '') + '</span><div class="stk"><div class="plan" style="height:' + (x.plan / mx * 100) + '%"></div><div class="done ' + (x.w === cw ? 'today' : '') + '" style="height:' + (x.done / mx * 100) + '%"></div></div><span class="lb">T' + x.w + '</span></div>').join('') +
    '</div><div class="legend" style="margin-top:10px"><span><i style="border:1.5px dashed var(--line-2)"></i>Kế hoạch</span><span><i style="background:#9fb4ea"></i>Thực học (giờ)</span><span><i style="background:var(--accent)"></i>Tuần hiện tại</span></div></div>';
  const rows = [
    ['Thói quen', 'Giờ học thực tế, tỷ lệ hoàn thành kế hoạch', (tot / 60).toFixed(1) + ' giờ · ' + pct(pd, past.length) + '% block đã đến hạn', pct(pd, past.length)],
    ['Phát âm', 'Âm đã luyện, kết quả phân biệt âm, lỗi lặp lại', pr.length + '/44 âm · phân biệt ' + (pairT[1] ? pct(pairT[0], pairT[1]) + '%' : '–') + ' · ' + weakSounds().length + ' âm cần sửa', sp.pron],
    ['Từ vựng', 'Từ đã học, từ nhớ được, từ cần ôn', vc.seen + ' đã gặp · ' + vc.recog + ' nhận diện · ' + vc.use + ' tự dùng · ' + vc.due + ' cần ôn', sp.vocab],
    ['Ngữ pháp', 'Điểm bài tập theo chủ điểm', GRAMMAR.filter(g => S.grammar[g.id]).length + '/7 chủ điểm · TB ' + sp.grammar + '%', sp.grammar],
    ['Nghe – nói', 'Kết quả nghe hiểu, bài nói đã hoàn thành', (dicts.length ? 'Chép chính tả TB ' + Math.round(dicts.reduce((a, b) => a + b, 0) / dicts.length) + '%' : 'Chưa chép chính tả') + ' · ' + S.speak.length + ' câu trả lời', Math.round((sp.listen + sp.speak) / 2)],
    ['Ứng dụng', 'Nhiệm vụ thực tế đã làm được bằng tiếng Anh', cando + '/' + CAN_DO.length + ' việc làm được', pct(cando, CAN_DO.length)]
  ];
  h += '<div class="card" style="margin-bottom:16px"><h2 style="margin-bottom:8px">6 nhóm chỉ số</h2><div class="tbl-wrap"><table><thead><tr><th>Nhóm</th><th>Chỉ số cần theo dõi</th><th>Hiện tại</th><th style="width:22%">Mức độ</th></tr></thead><tbody>' +
    rows.map(r => '<tr><td><b>' + r[0] + '</b></td><td class="small muted">' + r[1] + '</td><td class="small num">' + r[2] + '</td><td><div class="row" style="flex-wrap:nowrap">' + '<div style="flex:1">' + bar(r[3], 'acc') + '</div><span class="tiny num" style="width:34px;text-align:right">' + r[3] + '%</span></div></td></tr>').join('') + '</tbody></table></div></div>';
  h += '<div class="card"><h2 style="margin-bottom:8px">Điểm ngữ pháp theo chủ điểm</h2>' + GRAMMAR.map((g, i) => { const r = S.grammar[g.id]; return '<div class="skillrow k-grammar" style="grid-template-columns:minmax(0,260px) minmax(0,1fr) 44px"><b class="small">' + (i + 1) + '. ' + esc(g.title) + '</b>' + bar(r ? r.best : 0, 'k') + '<span class="num">' + (r ? r.best + '%' : '–') + '</span></div>'; }).join('') + '</div>';
  return h;
}
function progErrors() {
  const list = Object.entries(S.errors).sort((a, b) => b[1].n - a[1].n || (b[1].d || '').localeCompare(a[1].d || ''));
  if (!list.length) return '<div class="empty">Chưa có lỗi nào được ghi lại. Câu trả lời sai trong bài tập sẽ tự động xuất hiện ở đây.</div>';
  return '<div class="card"><div class="card-h"><h2>Nhật ký lỗi</h2><span class="small muted">' + list.length + ' lỗi · sắp theo số lần sai</span></div><div class="tbl-wrap"><table><thead><tr><th>Loại</th><th>Câu hỏi</th><th>Bạn chọn</th><th>Đáp án đúng</th><th class="num">Lần sai</th><th>Gần nhất</th><th></th></tr></thead><tbody>' +
    list.map(([k, e]) => '<tr><td><span class="pill">' + esc(e.k) + '</span></td><td class="small" style="min-width:220px">' + esc(e.p) + '</td><td class="small" style="color:var(--crit)">' + esc(e.w) + '</td><td class="small" style="color:var(--good)">' + esc(e.r) + '</td><td class="num">' + e.n + '</td><td class="num small">' + (e.d ? fmtDM(e.d) : '') + '</td><td><button class="btn sm" data-a="errFixed" data-k="' + esc(k) + '">Đã sửa</button></td></tr>').join('') + '</tbody></table></div></div>';
}
function progTests() {
  const cur = ui.testKind;
  let h = '<div class="grid g2" style="margin-bottom:16px"><button class="modcard tint k-pron" data-a="startTest" data-k="t:week"><span class="idx">10 CÂU · KHOẢNG 10 PHÚT</span><h3>Bài kiểm tra tuần</h3><span class="small muted">Ngữ pháp và từ vựng của các tuần đã học.</span></button><button class="modcard tint k-grammar" data-a="startTest" data-k="t:a1"><span class="idx">20 CÂU · TUẦN 12</span><h3>Bài kiểm tra mốc A1</h3><span class="small muted">Ngữ pháp 7 chủ điểm, từ vựng 5 chủ đề, đọc số liệu. Đạt từ 80%.</span></button></div>';
  if (cur && ui.quizzes[cur]) h += '<div class="card" style="margin-bottom:16px"><h2 style="margin-bottom:10px">' + (cur === 't:a1' ? 'Bài kiểm tra mốc A1' : 'Bài kiểm tra tuần') + '</h2>' + renderQuiz(cur) + '</div>';
  h += '<div class="card"><h2 style="margin-bottom:8px">Lịch sử kiểm tra</h2>' + (S.tests.length ? '<div class="tbl-wrap"><table><thead><tr><th>Ngày</th><th>Bài</th><th class="num">Điểm</th><th>Kết quả</th></tr></thead><tbody>' + S.tests.slice().reverse().map(x => '<tr><td class="num">' + fmtDM(x.d) + '</td><td>' + esc(x.kind) + '</td><td class="num">' + x.score + '/' + x.total + '</td><td><span class="pill ' + (x.score / x.total >= 0.8 ? 'good' : 'warn') + '">' + (x.score / x.total >= 0.8 ? 'Đạt' : 'Chưa đạt') + '</span></td></tr>').join('') + '</tbody></table></div>' : '<p class="small muted">Chưa có bài kiểm tra nào.</p>') + '</div>';
  return h;
}
function progCando() {
  return '<div class="card"><div class="card-h"><h2>Việc làm được bằng tiếng Anh</h2><span class="small muted">Đánh dấu khi bạn đã làm được việc đó trong thực tế</span></div>' +
    CAN_DO.map((c, i) => { const d = S.cando[i]; return '<div class="task ' + (d ? 'done' : '') + '"><button class="chk ' + (d ? 'on' : '') + '" data-a="candoMark" data-i="' + i + '" aria-label="Đã làm được">' + (d ? ICON.check : '') + '</button><div class="t"><b style="text-decoration:none">' + esc(c) + '</b>' + (d ? '<span class="meta">Làm được từ ' + fmtDM(d) + '</span>' : '') + '</div></div>'; }).join('') + '</div>';
}
