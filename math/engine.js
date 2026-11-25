/* Quiz engine: widgets for every question type + helpers */
(function(){
const E = window.ENG = {};
/* ---------- storage ---------- */
let S = {};
try { S = JSON.parse(localStorage.getItem('amina-math') || '{}') || {}; } catch(e) { S = {}; }
S.stars = S.stars || {}; S.seen = S.seen || {};
E.S = S;
E.save = () => { try { localStorage.setItem('amina-math', JSON.stringify(S)); } catch(e) {} };
E.starCount = (prefix) => Object.keys(S.stars).filter(k => !prefix || k.startsWith(prefix)).length;
E.onStar = () => {};

/* ---------- sound + speech ---------- */
let AC = null;
function tone(freqs, dur, type) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime;
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * dur);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + i * dur + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
      o.connect(g).connect(AC.destination); o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.05);
    });
  } catch(e) {}
}
E.ding = () => tone([660, 880, 1320], 0.11);
E.boop = () => tone([300, 240], 0.14, 'triangle');
E.pop = () => tone([520], 0.06);
E.speak = (text, lang) => {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, '').replace(/……|\.\.\./g, ' blank ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus '));
    u.lang = lang || 'en-US'; u.rate = 0.88;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith((lang || 'en').slice(0, 2)));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch(e) {}
};

/* ---------- text helpers ---------- */
const AR = '٠١٢٣٤٥٦٧٨٩', FA = '۰۱۲۳۴۵۶۷۸۹';
E.digits = s => String(s == null ? '' : s).replace(/[٠-٩]/g, d => AR.indexOf(d)).replace(/[۰-۹]/g, d => FA.indexOf(d)).replace(/٫/g, '.').replace(/٬|،/g, ',');
E.num = s => { const t = E.digits(s).replace(/[,\s]/g, '').replace(/[^\d.\-]/g, ''); return t === '' || t === '-' ? NaN : Number(t); };
E.fmt = n => Number(n).toLocaleString('en-US');
E.list = s => E.digits(s).split(/[,،;\s\-–]+/).map(x => x.trim()).filter(Boolean).map(Number).filter(x => !isNaN(x));
const H = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
E.H = H;
/* wrap LTR math runs inside Arabic text so numbers don't flip */
const RUN = /[0-9A-Za-z(][0-9A-Za-z ,.+\-−×÷=()²³:?…_%\/<>|]*[0-9A-Za-z)²³?…%]|[0-9A-Za-z]/g;
E.bidi = (el) => {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
  while (w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n => {
    if (n.parentNode.closest && n.parentNode.closest('[dir=ltr],[dir=auto],.m,.qtext,svg,textarea')) return;
    const t = n.nodeValue; if (!/[0-9A-Za-z]/.test(t)) return;
    const frag = document.createDocumentFragment(); let last = 0;
    t.replace(RUN, (m, i) => {
      if (i > last) frag.appendChild(document.createTextNode(t.slice(last, i)));
      const s = H('span', 'm'); s.dir = 'ltr'; s.textContent = m; frag.appendChild(s); last = i + m.length; return m;
    });
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    n.parentNode.replaceChild(frag, n);
  });
  return el;
};
E.ar = (html, cls, tag) => E.bidi(H(tag || 'div', cls, html));

/* ---------- figures ---------- */
function svgPoly(pts, labels, sc) {
  const M = 58, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const w = (Math.max(...xs) - Math.min(...xs)) * sc + 2 * M, h = (Math.max(...ys) - Math.min(...ys)) * sc + 2 * M;
  const P = ([x, y]) => [M + x * sc, M + y * sc];
  const L = labels.map(([x, y, t]) => { const [X, Y] = P([x, y]); return `<text x="${X}" y="${Y}" text-anchor="middle" dominant-baseline="middle">${t}</text>`; }).join('');
  return `<svg class="fig" direction="ltr" viewBox="0 0 ${w} ${h}" style="max-width:${Math.min(360, w * 1.15)}px" role="img"><polygon points="${pts.map(P).map(p => p.join(',')).join(' ')}" class="shape"/>${L}</svg>`;
}
E.figs = {
  figA: () => svgPoly([[0,0],[4,0],[4,1],[5,1],[5,3],[4,3],[4,4],[0,4]], [[2,-.5,'4 cm'],[-.75,2,'4 cm'],[2,4.5,'4 cm'],[4.5,.5,'1 cm'],[4.5,3.5,'1 cm'],[4.5,2,'1 cm'],[5.75,2,'2 cm']], 46),
  figT: () => svgPoly([[0,0],[11,0],[11,2],[8,2],[8,6],[3,6],[3,2],[0,2]], [[5.5,-.9,'11 cm'],[-1.4,1,'2 cm'],[5.5,6.9,'5 cm'],[9.6,4,'4 cm']], 24),
  figL: () => svgPoly([[0,0],[15,0],[15,6],[8,6],[8,2],[0,2]], [[7.5,-1,'15 cm'],[16.6,3,'6 cm'],[-1.6,1,'2 cm'],[4,3,'8 cm'],[11.5,7,'?'],[7,4,'?']], 20)
};
function areaFig(a) {
  const tbl = `<div class="amodel" dir="ltr"><div class="aside">${a.d}</div><div class="acells">${a.top.map(t => `<div class="acell">${t}</div>`).join('')}</div><div class="abot">${a.bot.map(t => `<div class="${t === '?' ? 'q' : ''}">${t}</div>`).join('')}</div></div>`;
  return tbl;
}

/* ---------- step-by-step reveal ---------- */
function stepsBox(steps) {
  const box = H('div', 'steps'), list = H('ol', 'slist'), btn = H('button', 'btn ghost', '👣 الخطوة الجاية');
  let i = 0;
  const next = () => {
    if (i >= steps.length) return;
    const li = E.ar(steps[i], '', 'li'); list.appendChild(li); E.pop(); i++;
    if (i >= steps.length) { btn.textContent = '✅ دي كل الخطوات'; btn.disabled = true; }
  };
  btn.onclick = next;
  box.append(list, btn);
  box.next = next; box.all = () => { while (i < steps.length) next(); };
  return box;
}

/* ---------- generated steps ---------- */
function colSteps(op, x, y) {
  const xs = String(x).split('').reverse().map(Number), ys = String(y).split('').reverse().map(Number);
  const names = ['Ones (الآحاد)', 'Tens (العشرات)', 'Hundreds (المئات)', 'Thousands (الآلاف)', 'Ten thousands', 'Hundred thousands', 'Millions'];
  const out = [`نكتب الرقمين تحت بعض، كل خانة تحت أختها، ونبدأ من اليمين (الآحاد).`];
  if (op === '+') {
    let c = 0;
    for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
      const a = xs[i] || 0, b = ys[i] || 0, s = a + b + c;
      out.push(`${names[i] || 'الخانة ' + (i + 1)}: ${a} + ${b}${c ? ' + ' + c + ' (الشايل)' : ''} = ${s}` + (s > 9 ? ` ← نكتب ${s % 10} ونشيل 1 🎒` : ` ← نكتب ${s}`));
      c = s > 9 ? 1 : 0;
    }
    if (c) out.push('فاضل 1 شايل ← ننزّله في الآخر.');
    out.push(`الناتج: ${E.fmt(x + y)}`);
  } else {
    const a = xs.slice();
    for (let i = 0; i < a.length; i++) {
      const b = ys[i] || 0;
      if (a[i] < b) {
        let j = i + 1; while (a[j] === 0) j++;
        a[j]--; for (let k = j - 1; k > i; k--) a[k] = 9; a[i] += 10;
        out.push(`${names[i] || 'الخانة ' + (i + 1)}: ${a[i] - 10} أصغر من ${b} ← نستلف من الجار 🤝 فتبقى ${a[i]}. ${a[i]} − ${b} = ${a[i] - b}`);
      } else out.push(`${names[i] || 'الخانة ' + (i + 1)}: ${a[i]} − ${b} = ${a[i] - b}`);
    }
    out.push(`الناتج: ${E.fmt(x - y)}`);
    out.push(`نتأكد بالجمع: ${E.fmt(x - y)} + ${E.fmt(y)} = ${E.fmt(x)} ✔`);
  }
  return out;
}
const r1000 = n => Math.round(n / 1000) * 1000;
function estSteps(op, x, y) {
  const rx = r1000(x), ry = r1000(y), f = E.fmt;
  return [
    `الناتج الحقيقي: ${f(x)} ${op === '+' ? '+' : '−'} ${f(y)} = ${f(op === '+' ? x + y : x - y)}`,
    `نقرّب لأقرب ألف: نبص على رقم المئات. 5 أو أكتر ← نطلع لفوق، أقل من 5 ← نفضل زي ما احنا.`,
    `${f(x)} ← ${f(rx)}  و  ${f(y)} ← ${f(ry)}`,
    `التقدير: ${f(rx)} ${op === '+' ? '+' : '−'} ${f(ry)} = ${f(op === '+' ? rx + ry : rx - ry)}`,
    `الرقمين قريبين من بعض ← إجابتنا منطقية ✔`
  ];
}
function parts(x) { const s = String(x), n = s.length; return s.split('').map((d, i) => Number(d) * Math.pow(10, n - 1 - i)).filter(v => v > 0); }
E.parts = parts;
function multSteps(how, x, y) {
  const p = parts(x), f = E.fmt;
  const st = [`نفك ${f(x)} حسب القيمة المكانية: ${p.map(f).join(' + ')}`];
  if (how === 'area') st.push(`نرسم مستطيل ونقسمه ${p.length} حتت: ${p.map(f).join(' | ')} والارتفاع ${y}.`);
  if (how === 'dist') st.push(`${f(x)} × ${y} = ${p.map(v => `(${f(v)} × ${y})`).join(' + ')}`);
  p.forEach(v => st.push(`${f(v)} × ${y} = ${f(v * y)}` + (v >= 10 ? `   (حيلة: ${String(v).replace(/0+$/, '')} × ${y} = ${String(v).replace(/0+$/, '') * y} ونرجّع الأصفار)` : '')));
  st.push(`نجمع الحتت: ${p.map(v => f(v * y)).join(' + ')} = ${f(x * y)} 🎉`);
  return st;
}

/* ---------- widgets ---------- */
function input(ph, cls, mode) {
  const i = H('input', 'inp ' + (cls || '')); i.placeholder = ph == null ? '؟' : ph; i.dir = 'ltr';
  i.setAttribute('inputmode', mode || 'decimal'); i.autocomplete = 'off'; i.spellcheck = false;
  return i;
}
function mark(el, ok) { el.classList.remove('ok', 'bad'); if (ok != null) el.classList.add(ok ? 'ok' : 'bad'); }
const eqNum = (v, a) => !isNaN(E.num(v)) && E.num(v) === E.num(a);
const setEq = (arr, ans) => { const A = [...new Set(arr)].sort((a, b) => a - b), B = [...new Set(ans)].sort((a, b) => a - b); return A.length === B.length && A.every((v, i) => v === B[i]); };
const PROPS = ['Commutative', 'Associative', 'Additive identity', 'Commutative + Associative'];

const W = {};
W.mcq = (q, b) => {
  const box = H('div', 'opts'); let pick = -1;
  q.o.forEach((o, i) => {
    const bt = H('button', 'opt', `<span class="ol">${'abcd'[i]})</span> <span dir="ltr">${o}</span>`);
    bt.dir = 'ltr';
    bt.onclick = () => { if (b.locked) return; pick = i; [...box.children].forEach(c => c.classList.remove('sel')); bt.classList.add('sel'); b.check(); };
    box.appendChild(bt);
  });
  b.body.appendChild(box);
  return { check: () => pick < 0 ? null : (mark(box.children[pick], pick === q.a), pick === q.a), show: () => { pick = q.a; mark(box.children[q.a], true); }, noBtn: true };
};
W.pick = (q, b) => W.mcq(q, b);
function single(q, b, ph, test, mode) {
  const row = H('div', 'row'), i = input(ph, '', mode); row.dir = 'ltr'; row.style.justifyContent = 'flex-end'; row.appendChild(i);
  if (q.unit) row.appendChild(H('span', 'uni', q.unit));
  b.body.appendChild(row); i.onkeydown = e => { if (e.key === 'Enter') b.check(); };
  return { check: () => i.value.trim() === '' ? null : (mark(i, test(i.value)), test(i.value)), show: () => { i.value = q.show || q.a; mark(i, true); } };
}
W.num = (q, b) => single(q, b, '؟', v => eqNum(v, q.a) || (q.alt || []).some(a => eqNum(v, a)));
W.var = W.num;
W.word = (q, b) => {
  const nz = s => E.digits(s).toLowerCase().replace(/-/g, ' ').replace(/,/g, ' ').replace(/\band\b/g, ' ').replace(/\s+/g, ' ').trim();
  const r = single(q, b, 'write in words…', v => nz(v) === nz(q.a), 'text');
  b.body.querySelector('input').classList.add('wide'); return r;
};
W.time = (q, b) => single(q, b, 'h:mm', v => { const m = E.digits(v).replace(/\s/g, '').replace(/[.؛;]/, ':').match(/^(\d{1,2}):(\d{2})$/); return !!m && `${+m[1]}:${m[2]}` === q.a; }, 'text');
W.lt = (q, b) => single(Object.assign({ show: E.fmt(q.n - 1) }, q), b, '؟', v => !isNaN(E.num(v)) && E.num(v) < q.n && E.num(v) >= 0);
W.gt = (q, b) => single(Object.assign({ show: E.fmt(q.n + 1) }, q), b, '؟', v => !isNaN(E.num(v)) && E.num(v) > q.n);
W.exp = (q, b) => {
  const r = single(q, b, '3,000 + 500 + 40 + 2', v => {
    const t = E.digits(v).split('+').map(x => x.replace(/[,\s]/g, '')).filter(Boolean);
    if (!t.every(x => /^[1-9]0*$/.test(x))) return false;
    const L = t.map(x => x.length); if (new Set(L).size !== L.length) return false;
    return t.reduce((s, x) => s + Number(x), 0) === q.n;
  }, 'text');
  b.body.querySelector('input').classList.add('wide');
  r.show = () => { const i = b.body.querySelector('input'); i.value = parts(q.n).map(E.fmt).join(' + '); mark(i, true); };
  return r;
};
W.factors = (q, b) => {
  const F = []; for (let i = 1; i <= q.n; i++) if (q.n % i === 0) F.push(i);
  const r = single(q, b, '1, 2, 3, …', v => setEq(E.list(v), F), 'text');
  b.body.querySelector('input').classList.add('wide');
  r.show = () => { const i = b.body.querySelector('input'); i.value = F.join(', '); mark(i, true); };
  return r;
};
W.mults = (q, b) => {
  const ok = n => n > 0 && q.of.every(d => n % d === 0) && (q.min == null || n > q.min) && (q.max == null || n < q.max);
  const all = []; if (q.all) for (let n = 1; n < q.max; n++) if (ok(n)) all.push(n);
  const r = single(q, b, '8, 16, 24', v => { const L = [...new Set(E.list(v))]; return q.all ? setEq(L, all) : (L.length >= q.count && L.every(ok)); }, 'text');
  b.body.querySelector('input').classList.add('wide');
  r.show = () => { const i = b.body.querySelector('input'); let L = all; if (!q.all) { L = []; for (let n = 1; L.length < q.count; n++) if (ok(n)) L.push(n); } i.value = L.join(', '); mark(i, true); };
  return r;
};
W.multi = (q, b) => {
  const ins = q.parts.map(([lab, ans]) => {
    const row = H('div', 'row'); row.appendChild(H('span', 'plab', `<span dir="ltr">${lab}</span>`));
    const i = input('؟', String(ans).includes(',') ? 'wide' : '', String(ans).includes(',') ? 'text' : 'decimal'); row.appendChild(i); b.body.appendChild(row); return [i, ans];
  });
  const t = ([i, a]) => String(a).includes(',') ? setEq(E.list(i.value), E.list(a)) : eqNum(i.value, a) || E.digits(i.value).trim().toLowerCase() === String(a).toLowerCase();
  return { check: () => { if (ins.some(([i]) => i.value.trim() === '')) return null; let all = true; ins.forEach(p => { const k = t(p); mark(p[0], k); all = all && k; }); return all; },
    show: () => ins.forEach(([i, a]) => { i.value = a; mark(i, true); }) };
};
W.prop = (q, b) => {
  const row = H('div', 'row'), i = input('؟'); row.appendChild(i); b.body.appendChild(row);
  const box = H('div', 'opts small'); let pick = -1;
  PROPS.forEach((p, k) => { const bt = H('button', 'opt', `<span dir="ltr">${p}</span>`); bt.onclick = () => { pick = k; [...box.children].forEach(c => c.classList.remove('sel')); bt.classList.add('sel'); }; box.appendChild(bt); });
  b.body.append(H('div', 'mini', 'والخاصية اسمها إيه؟'), box);
  return { check: () => { if (i.value.trim() === '' || pick < 0) return null; const a = eqNum(i.value, q.a), c = pick === q.p; mark(i, a); mark(box.children[pick], c); return a && c; },
    show: () => { i.value = q.a; pick = q.p; mark(i, true); mark(box.children[q.p], true); } };
};
W.ord = (q, b) => {
  const chips = H('div', 'chips'), line = H('div', 'oline'), reset = H('button', 'btn ghost sm', '↺ من الأول');
  let seq = [];
  const draw = () => { line.innerHTML = seq.length ? seq.map(k => `<span dir="ltr">${q.items[k]}</span>`).join('<i>›</i>') : '<em>اضغطي على الأرقام بالترتيب…</em>'; [...chips.children].forEach((c, k) => c.disabled = seq.includes(k)); };
  q.items.forEach((t, k) => { const c = H('button', 'chip', `<span dir="ltr">${t}</span>`); c.onclick = () => { if (!seq.includes(k)) { seq.push(k); E.pop(); draw(); if (seq.length === q.items.length) b.check(); } }; chips.appendChild(c); });
  reset.onclick = () => { seq = []; mark(line, null); draw(); };
  line.dir = 'ltr'; b.body.append(chips, line, reset); draw();
  return { check: () => seq.length < q.items.length ? null : (mark(line, seq.join() === q.ans.join()), seq.join() === q.ans.join()),
    show: () => { seq = q.ans.slice(); draw(); mark(line, true); }, noBtn: true };
};
W.col = (q, b) => {
  const res = q.op === '+' ? q.x + q.y : q.x - q.y;
  const L = Math.max(String(q.x).length, String(q.y).length, String(res).length);
  const g = H('div', 'colgrid'); g.dir = 'ltr'; g.style.setProperty('--n', L + 1);
  const cell = (t, c) => H('div', 'cc ' + (c || ''), t);
  const carry = [];
  g.appendChild(cell('', 'op'));
  for (let k = 0; k < L; k++) { const i = input('', 'carry'); i.maxLength = 2; i.title = q.op === '+' ? 'الشايل' : 'بعد الاستلاف'; carry.push(i); const c = cell('', 'cr'); c.appendChild(i); g.appendChild(c); }
  const pad = n => String(n).padStart(L, ' ').split('');
  g.appendChild(cell('', 'op')); pad(q.x).forEach(d => g.appendChild(cell(d.trim())));
  g.appendChild(cell(q.op === '+' ? '+' : '−', 'op')); pad(q.y).forEach(d => g.appendChild(cell(d.trim(), 'ul')));
  g.appendChild(cell('', 'op'));
  const outs = [];
  for (let k = 0; k < L; k++) { const i = input('', 'dig', 'numeric'); i.maxLength = 1; outs.push(i); const c = cell('', 'ans'); c.appendChild(i); g.appendChild(c); }
  outs.forEach((i, k) => i.addEventListener('input', () => { i.value = E.digits(i.value).replace(/\D/g, '').slice(-1); if (i.value && k > 0) outs[k - 1].focus(); }));
  b.body.append(E.ar('املي الناتج رقم رقم <b>من اليمين للشمال</b> ⬅️. المربعات الصغيرة فوق للشايل أو الاستلاف لو حبيتي.', 'mini'), g);
  setTimeout(() => {}, 0);
  const want = String(res).padStart(L, ' ');
  return {
    check: () => { const got = outs.map(i => i.value).join(''); if (got.replace(/\s/g, '') === '') return null; let ok = true; outs.forEach((i, k) => { const w = want[k].trim(); const v = i.value.trim(); const good = w === '' ? (v === '' || v === '0') : v === w; if (w !== '' || v !== '') mark(i, good); ok = ok && good; }); return ok; },
    show: () => outs.forEach((i, k) => { i.value = want[k].trim(); if (want[k].trim()) mark(i, true); }),
    steps: colSteps(q.op, q.x, q.y)
  };
};
W.est = (q, b) => {
  const act = q.op === '+' ? q.x + q.y : q.x - q.y, est = q.op === '+' ? r1000(q.x) + r1000(q.y) : r1000(q.x) - r1000(q.y);
  const i1 = input('؟'), i2 = input('؟');
  const r1 = H('div', 'row'); r1.append(H('span', 'plab', 'الناتج الحقيقي (Actual)'), i1);
  const r2 = H('div', 'row'); r2.append(H('span', 'plab', 'التقدير (Estimate)'), i2);
  b.body.append(r1, r2);
  return { check: () => { if (!i1.value.trim() || !i2.value.trim()) return null; const a = eqNum(i1.value, act), c = eqNum(i2.value, est); mark(i1, a); mark(i2, c); return a && c; },
    show: () => { i1.value = E.fmt(act); i2.value = E.fmt(est); mark(i1, true); mark(i2, true); }, steps: estSteps(q.op, q.x, q.y) };
};
W.bar = (q, b) => {
  const f = E.fmt, whole = q.total == null;
  const tot = whole ? q.part + q.other : q.total, part = q.part, ans = whole ? tot : tot - part;
  const pw = Math.max(18, Math.min(82, part / tot * 100));
  b.body.appendChild(H('div', 'barm', `<div class="btot" dir="ltr">${whole ? 'X = ?' : f(tot)}</div><div class="bbar" dir="ltr"><div class="bp" style="width:${pw}%">${f(part)}</div><div class="bx">${whole ? f(q.other) : 'X'}</div></div>`));
  const r = single({ a: E.fmt(ans) }, b, 'X = ?', v => eqNum(v, ans));
  r.steps = q.s || (whole ? [`X هو الشريط كله (الكل).`, `الكل = الجزء + الجزء`, `X = ${f(part)} + ${f(q.other)} = ${f(ans)}`] :
    [`الشريط كله = ${f(tot)} ، وجزء منه = ${f(part)} ، والجزء التاني X.`, `علشان نلاقي جزء: الكل − الجزء التاني`, `X = ${f(tot)} − ${f(part)} = ${f(ans)}`, `نتأكد: ${f(part)} + ${f(ans)} = ${f(tot)} ✔`]);
  return r;
};
W.self = (q, b) => {
  const pad = H('textarea', 'note'); pad.placeholder = 'اكتبي/ارسمي إجابتك هنا أو في الكشكول ✏️'; pad.dir = 'ltr';
  const mdl = E.ar('<b>الإجابة النموذجية:</b><br><span dir="ltr">' + q.model + '</span>', 'model hide');
  const show = H('button', 'btn', '👀 قارني بإجابتي');
  const yes = H('button', 'btn ok hide', '✔ إجابتي زيها'), no = H('button', 'btn ghost hide', '↺ هراجع تاني');
  show.onclick = () => { mdl.classList.remove('hide'); yes.classList.remove('hide'); no.classList.remove('hide'); show.classList.add('hide'); };
  let st = null; yes.onclick = () => { st = true; b.check(); }; no.onclick = () => { st = false; b.check(); };
  const row = H('div', 'row'); row.append(show, yes, no);
  b.body.append(pad, row, mdl);
  return { check: () => st, show: () => show.onclick(), noBtn: true };
};
W.mult = (q, b) => {
  const p = parts(q.x), y = q.y, f = E.fmt, ins = [];
  const mk = v => { const i = input('؟'); i._a = v * y; ins.push(i); return i; };
  if (q.how === 'area') {
    const wrap = H('div', 'areaw'); wrap.dir = 'ltr';
    const top = H('div', 'atop'), boxr = H('div', 'abox');
    const tot = p.reduce((s, v) => s + Math.log10(v + 1), 0);
    p.forEach((v, k) => {
      const w = Math.max(22, Math.log10(v + 1) / tot * 100);
      top.appendChild(H('div', 'atl', f(v))).style.flex = w;
      const c = H('div', 'ab c' + k); c.style.flex = w; c.appendChild(H('div', 'abl', `${f(v)} × ${y}`)); c.appendChild(mk(v)); boxr.appendChild(c);
    });
    const arow = H('div', 'arow'); arow.append(H('div', 'aside2', y), boxr);
    top.prepend(H('div', 'aside2 blank', ''));
    wrap.append(top, arow);
    b.body.appendChild(wrap);
  } else if (q.how === 'dist') {
    b.body.appendChild(H('div', 'eqline', `<span dir="ltr">${f(q.x)} × ${y} = ${p.map(v => `(${f(v)} × ${y})`).join(' + ')}</span>`));
    const r = H('div', 'pprow'); r.dir = 'ltr';
    p.forEach((v, k) => { if (k) r.appendChild(H('span', 'plus', '+')); r.appendChild(mk(v)); });
    b.body.appendChild(r);
  } else {
    const t = H('div', 'pp'); t.dir = 'ltr';
    t.appendChild(H('div', 'pph', `<span>${f(q.x)}</span><span>× ${y}</span>`));
    p.slice().reverse().forEach(v => { const r = H('div', 'ppr'); r.appendChild(H('span', 'ppl', `${f(v)} × ${y} =`)); r.appendChild(mk(v)); t.appendChild(r); });
    b.body.appendChild(t);
  }
  const tr = H('div', 'row'), ti = input('؟'); tr.append(H('span', 'plab', 'الناتج النهائي ='), ti); b.body.appendChild(tr);
  return {
    check: () => { if (!ti.value.trim()) return null; ins.forEach(i => { if (i.value.trim()) mark(i, eqNum(i.value, i._a)); }); const ok = eqNum(ti.value, q.x * y); mark(ti, ok); return ok; },
    show: () => { ins.forEach(i => { i.value = f(i._a); mark(i, true); }); ti.value = f(q.x * y); mark(ti, true); },
    steps: multSteps(q.how, q.x, y)
  };
};

/* ---------- question card ---------- */
const CHEERS = ['برافو يا أمينة! 🎉', 'شيف شاطرة! 👩‍🍳', 'الله عليكي! ⭐', 'صح الصح! 🌟', 'دماغك سريعة! 🚀', 'كده الوصفة مظبوطة! 🍰'];
const TRY = ['قربتي جداً! جربي تاني 💪', 'مش مشكلة، الغلط بيعلّمنا. بصّي على أول خطوة 👣', 'خدي نفس وجربي تاني 🌸'];
E.card = (q, key, num) => {
  const c = H('div', 'qcard' + (S.stars[key] ? ' done' : ''));
  const head = H('div', 'qhead');
  head.append(H('span', 'qn', num || ''), H('span', 'qstar', S.stars[key] ? '⭐' : '☆'));
  const say = H('button', 'icon', '🔊'); say.title = 'اسمعي السؤال'; say.onclick = () => E.speak(q.q); head.appendChild(say);
  c.appendChild(head);
  const qt = H('div', 'qtext', q.q); qt.dir = 'auto'; c.appendChild(qt);
  if (q.fig && E.figs[q.fig]) c.appendChild(H('div', 'figw', E.figs[q.fig]()));
  if (q.area) c.appendChild(H('div', 'figw', areaFig(q.area)));
  const body = H('div', 'qbody'); c.appendChild(body);
  const fb = H('div', 'fb'); const bar = H('div', 'qbtns');
  const b = { body, locked: false, tries: 0 };
  const w = (W[q.t] || W.num)(q, b);
  const steps = q.s || w.steps || [];
  const sb = stepsBox(steps); sb.classList.add('hide');
  const chk = H('button', 'btn', 'تحقّقي ✔'), hint = H('button', 'btn ghost', '👣 ورّيني الخطوات'), ans = H('button', 'btn ghost hide', '🙈 الإجابة');
  b.check = () => {
    const r = w.check(); if (r == null) { fb.className = 'fb info'; fb.textContent = 'اكتبي إجابتك الأول 🙂'; return; }
    b.tries++;
    if (r) {
      fb.className = 'fb good'; fb.textContent = CHEERS[Math.floor(Math.random() * CHEERS.length)]; E.ding();
      if (!S.stars[key] && b.tries <= 2) { S.stars[key] = 1; E.save(); head.querySelector('.qstar').textContent = '⭐'; c.classList.add('done', 'pulse'); E.onStar(); }
      if (steps.length) { sb.classList.remove('hide'); fb.appendChild(E.ar(' — دي الوصفة (الخطوات) علشان تكتبيها في الامتحان:', 'mini')); sb.all(); }
      b.locked = q.t === 'mcq' || q.t === 'pick';
    } else {
      fb.className = 'fb bad'; fb.textContent = TRY[Math.min(b.tries - 1, 2)]; E.boop();
      if (b.tries >= 2) ans.classList.remove('hide');
      if (q.t === 'mcq' || q.t === 'pick') setTimeout(() => [...body.querySelectorAll('.opt.bad')].forEach(o => o.classList.remove('bad', 'sel')), 900);
    }
  };
  chk.onclick = b.check;
  hint.onclick = () => { sb.classList.remove('hide'); sb.next(); };
  ans.onclick = () => { w.show(); sb.classList.remove('hide'); sb.all(); ans.classList.add('hide'); };
  if (!w.noBtn) bar.appendChild(chk);
  if (steps.length) bar.appendChild(hint);
  bar.appendChild(ans);
  c.append(bar, fb, sb);
  c._w = w; c._q = q;
  return c;
};
})();
