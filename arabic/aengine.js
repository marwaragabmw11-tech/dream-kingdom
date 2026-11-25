/* محرك كروت الأسئلة — نسخة من ../social/sengine.js بحفظ منفصل (amina-ar) + عرض فقرة القراءة (q.p) */
/* محرك الأسئلة لصفحة الدراسات (عربي) */
(function(){
const E = window.SE = {};
let S = {};
try { S = JSON.parse(localStorage.getItem('amina-ar') || '{}') || {}; } catch(e) { S = {}; }
S.stars = S.stars || {};
E.S = S;
E.save = () => { try { localStorage.setItem('amina-ar', JSON.stringify(S)); } catch(e) {} };
E.count = p => Object.keys(S.stars).filter(k => !p || k.startsWith(p)).length;
E.onStar = () => {};

let AC = null;
function tone(fs, d, type) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime;
    fs.forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t0 + i * d); g.gain.exponentialRampToValueAtTime(.16, t0 + i * d + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + (i + 1) * d);
      o.connect(g).connect(AC.destination); o.start(t0 + i * d); o.stop(t0 + (i + 1) * d + .05); });
  } catch(e) {}
}
E.ding = () => tone([660, 880, 1320], .11);
E.boop = () => tone([300, 240], .14, 'triangle');
E.pop = () => tone([520], .06);
E.speak = (text) => {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ' ').replace(/……/g, ' نقط '));
    u.lang = 'ar-EG'; u.rate = .9;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('ar')); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch(e) {}
};
const H = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
E.H = H;
const AR = '٠١٢٣٤٥٦٧٨٩';
E.norm = s => String(s || '').replace(/[٠-٩]/g, d => AR.indexOf(d)).replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[^ء-ي0-9a-z ]/gi, ' ').replace(/(^| )ال/g, '$1').replace(/\s+/g, ' ').trim();
const numOf = s => { const t = String(s || '').replace(/[٠-٩]/g, d => AR.indexOf(d)).replace(/[,\s٬]/g, '').replace(/[^\d.]/g, ''); return t ? Number(t) : NaN; };

/* ---------- figures ---------- */
const ARW = { N:[0,-1], S:[0,1], E:[1,0], W:[-1,0] };
E.fig = (k) => {
  if (k === 'flag') return `<svg class="sfig flagsvg" viewBox="0 0 300 200" role="img" aria-label="علم مصر"><rect width="300" height="67" fill="#ce1126"/><rect y="67" width="300" height="66" fill="#fff"/><rect y="133" width="300" height="67" fill="#111"/><g transform="translate(150 100)" fill="#c09300"><path d="M0-16C-6-16-8-10-6-4L-30-22-26-6-34-6-22 6-30 8-12 12-8 22H8L12 12 30 8 22 6 34-6 26-6 30-22 6-4C8-10 6-16 0-16Z"/><circle cx="0" cy="-20" r="5"/><path d="M3-21 9-19 3-17Z"/><rect x="-7" y="-4" width="14" height="16" rx="3" fill="#fff" stroke="#c09300" stroke-width="2"/><rect x="-14" y="22" width="28" height="5" rx="2"/></g><rect width="300" height="200" fill="none" stroke="#999"/></svg>`;
  const a = k[0], b = k[1], A = ARW[a], B = ARW[b];
  const c = 70, L = 55, ar = (v, col, w) => `<line x1="${c}" y1="${c}" x2="${c + v[0] * L}" y2="${c + v[1] * L}" stroke="${col}" stroke-width="${w}" marker-end="url(#ah${col === '#e63946' ? 'r' : 'k'})"/>`;
  return `<svg class="sfig dirsvg" viewBox="0 0 140 140" role="img"><defs><marker id="ahk" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8z" fill="currentColor"/></marker><marker id="ahr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8z" fill="#e63946"/></marker></defs><g stroke="currentColor">${ar(A, 'currentColor', 3)}${ar(B, 'currentColor', 3)}</g>${ar([(A[0] + B[0]) * .72, (A[1] + B[1]) * .72], '#e63946', 3.5)}</svg>`;
};

/* ---------- steps / explanation ---------- */
function explain(steps) {
  const box = H('div', 'steps hide');
  box.appendChild(H('div', 'stitle', '💡 ليه كده؟'));
  steps.forEach(s => box.appendChild(H('div', 'sline', s)));
  return box;
}

/* ---------- widgets ---------- */
function mark(el, ok) { el.classList.remove('ok', 'bad'); if (ok != null) el.classList.add(ok ? 'ok' : 'bad'); }
const W = {};
W.mcq = (q, b) => {
  const box = H('div', 'opts'); let pick = -1;
  q.o.forEach((o, i) => {
    const bt = H('button', 'opt', `<span class="ol">${'أبجد'[i] || ''}</span> ${o}`);
    bt.onclick = () => { if (b.locked) return; pick = i; [...box.children].forEach(c => c.classList.remove('sel')); bt.classList.add('sel'); b.check(); };
    box.appendChild(bt);
  });
  if (q.o.length <= 2) box.classList.add('two');
  b.body.appendChild(box);
  return { check: () => pick < 0 ? null : (mark(box.children[pick], pick === q.a), pick === q.a), show: () => { pick = q.a; mark(box.children[q.a], true); }, noBtn: true, answer: q.o[q.a] };
};
W.tf = (q, b) => {
  const box = H('div', 'opts two'); let pick = null;
  [['صواب ✔', true], ['خطأ ✘', false]].forEach(([t, v]) => {
    const bt = H('button', 'opt tfb', t);
    bt.onclick = () => { if (b.locked) return; pick = v; [...box.children].forEach(c => c.classList.remove('sel')); bt.classList.add('sel'); b.check(); };
    box.appendChild(bt);
  });
  b.body.appendChild(box);
  const idx = v => v ? 0 : 1;
  return { check: () => pick == null ? null : (mark(box.children[idx(pick)], pick === q.a), pick === q.a),
    show: () => { pick = q.a; mark(box.children[idx(q.a)], true); }, noBtn: true,
    after: q.fix ? `<b>التصويب:</b> ${q.fix}` : '' };
};
W.fill = (q, b) => {
  const row = H('div', 'row'); const i = H('input', 'inp'); i.placeholder = 'اكتبي الإجابة…'; i.autocomplete = 'off';
  row.appendChild(i); b.body.appendChild(row);
  i.onkeydown = e => { if (e.key === 'Enter') b.check(); };
  if (q.o) {
    const help = H('button', 'btn ghost sm', '🤔 مش فاكرة؟ ساعديني'); const chips = H('div', 'chips hide');
    q.o.forEach(o => { const c = H('button', 'chip', o); c.onclick = () => { i.value = o.replace(/^د\. /, ''); [...chips.children].forEach(x => x.classList.remove('sel')); c.classList.add('sel'); b.check(); }; chips.appendChild(c); });
    help.onclick = () => { chips.classList.remove('hide'); help.classList.add('hide'); b.helped = true; };
    b.body.append(help, chips);
  }
  const test = v => { const n = E.norm(v); if (!n) return false; if (/(^| )(غير|لا|مش)( |$)/.test(n) && !q.a.some(a => /(^| )(غير|لا)( |$)/.test(E.norm(a)))) return false; return q.a.some(a => { const m = E.norm(a); if (/(^| )غير( |$)/.test(m) && !/(^| )غير( |$)/.test(n)) return false; return n === m || (n.length >= 3 && (n.includes(m) || (m.includes(n) && n.length >= m.length * .6))); }); };
  return { check: () => !i.value.trim() ? null : (mark(i, test(i.value)), test(i.value)), show: () => { i.value = q.a[0]; mark(i, true); }, answer: q.a[0] };
};
W.num = (q, b) => {
  const row = H('div', 'row'); const i = H('input', 'inp num'); i.placeholder = '؟'; i.setAttribute('inputmode', 'numeric'); i.dir = 'ltr';
  row.appendChild(i); if (q.unit) row.appendChild(H('span', 'uni', q.unit)); b.body.appendChild(row);
  i.onkeydown = e => { if (e.key === 'Enter') b.check(); };
  const t = v => numOf(v) === Number(q.a);
  return { check: () => !i.value.trim() ? null : (mark(i, t(i.value)), t(i.value)), show: () => { i.value = q.a; mark(i, true); } };
};
W.multi = (q, b) => {
  const sels = q.parts.map(([lab, acc, opts]) => {
    const row = H('div', 'row mrow'); row.appendChild(H('span', 'plab', lab));
    const s = H('select', 'inp sel'); s.innerHTML = '<option value="">— اختاري —</option>' + opts.map(o => `<option>${o}</option>`).join('');
    row.appendChild(s); b.body.appendChild(row); return [s, acc];
  });
  const ok = ([s, acc]) => acc.some(a => E.norm(a) === E.norm(s.value) || E.norm(s.value).includes(E.norm(a)));
  return { check: () => { if (sels.some(([s]) => !s.value)) return null; let all = true; sels.forEach(p => { const k = ok(p); mark(p[0], k); all = all && k; }); return all; },
    show: () => sels.forEach(([s, acc], k) => { s.value = q.parts[k][2].find(o => E.norm(o).includes(E.norm(acc[0]))) || acc[0]; mark(s, true); }) };
};
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
W.self = (q, b) => {
  const ta = H('textarea', 'note'); ta.placeholder = q.open ? 'اكتبي رأيك أو فكرتك… ✏️' : 'اكتبي إجابتك هنا (أو قوليها بصوتك 🎤)…';
  b.body.appendChild(ta);
  const row = H('div', 'row');
  if (SR) {
    const mic = H('button', 'btn ghost sm', '🎤 قوليها بصوتك');
    mic.onclick = () => { try { const r = new SR(); r.lang = 'ar-EG'; r.interimResults = false; mic.textContent = '👂 سامعاكي…'; r.onresult = e => { ta.value = (ta.value + ' ' + e.results[0][0].transcript).trim(); }; r.onend = () => mic.textContent = '🎤 قوليها بصوتك'; r.start(); } catch(e) {} };
    row.appendChild(mic);
  }
  const cmp = H('button', 'btn', '👀 قارني بالإجابة النموذجية');
  row.appendChild(cmp); b.body.appendChild(row);
  const res = H('div', 'model hide'); b.body.appendChild(res);
  const yes = H('button', 'btn ok hide', '✔ إجابتي فيها نفس المعنى'), no = H('button', 'btn ghost hide', '↺ هراجعها تاني');
  const r2 = H('div', 'row'); r2.append(yes, no); b.body.appendChild(r2);
  let st = null;
  cmp.onclick = () => {
    const mine = E.norm(ta.value), keys = q.keys || [];
    const hits = keys.filter(k => mine.includes(E.norm(k)));
    let html = `<div class="mtitle">📝 الإجابة النموذجية (اكتبيها كده في الامتحان):</div><div class="mans">${q.model}</div>`;
    if (keys.length) html += `<div class="kw">🔑 الكلمات المهمة: ${keys.map(k => `<span class="${hits.includes(k) ? 'hit' : ''}">${hits.includes(k) ? '✔ ' : ''}${k}</span>`).join(' ')}</div>`;
    res.innerHTML = html; res.classList.remove('hide'); E.pop();
    const enough = keys.length && mine && hits.length >= Math.max(1, Math.ceil(keys.length / 2));
    if (enough) { st = true; b.check(); res.appendChild(H('div', 'fb good', `جبتي ${hits.length} من ${keys.length} كلمات مهمة 👏`)); }
    else { yes.classList.remove('hide'); no.classList.remove('hide'); }
  };
  yes.onclick = () => { st = true; yes.classList.add('hide'); no.classList.add('hide'); b.check(); };
  no.onclick = () => { st = false; yes.classList.add('hide'); no.classList.add('hide'); ta.focus(); b.check(); };
  return { check: () => st, show: () => cmp.onclick(), noBtn: true, self: true };
};

/* ---------- card ---------- */
const CHEERS = ['برافو يا أمينة! 🎉', 'شاطرة جداً! ⭐', 'الله عليكي! 🌟', 'مشمش فخور بيكي! 🐱', 'كده بالظبط! 👏', 'دماغك منوّرة! 💡'];
const TRY = ['قربتي! جربي تاني 💪', 'مش مشكلة، شوفي «ليه كده؟» وجربي 🌸', 'خدي نفس وجربي تاني 🙂'];
E.card = (q, key, num) => {
  const c = H('div', 'qcard' + (S.stars[key] ? ' done' : ''));
  if (q.sec) c.appendChild(H('div', 'qsec', q.sec));
  const head = H('div', 'qhead');
  head.append(H('span', 'qn', num || ''), H('span', 'qstar', S.stars[key] ? '⭐' : '☆'));
  const say = H('button', 'icon', '🔊'); say.title = 'اسمعي السؤال'; say.onclick = () => E.speak(q.q); head.appendChild(say);
  c.appendChild(head);
  c.appendChild(H('div', 'qtext', q.q));
  if (q.p && window.APAS && APAS[q.p]) { const d = H('details', 'passage', `<summary>📖 الفقرة</summary><div>${APAS[q.p]}</div>`); c.appendChild(d); }
  if (q.fig) c.appendChild(H('div', 'figw', E.fig(q.fig)));
  if (q.img) { const im = H('img', 'qimg'); im.src = q.img; im.alt = ''; im.loading = 'lazy'; c.appendChild(im); }
  const body = H('div', 'qbody'); c.appendChild(body);
  const fb = H('div', 'fb'), bar = H('div', 'qbtns');
  const b = { body, locked: false, tries: 0 };
  const w = (W[q.t] || W.self)(q, b);
  const ex = explain(q.s || []);
  const chk = H('button', 'btn', 'تحقّقي ✔'), why = H('button', 'btn ghost', '💡 ليه كده؟'), ans = H('button', 'btn ghost hide', '🙈 وريني الإجابة');
  b.check = () => {
    const r = w.check(); if (r == null) { if (!w.self) { fb.className = 'fb info'; fb.textContent = 'اكتبي أو اختاري إجابتك الأول 🙂'; } return; }
    b.tries++;
    if (r) {
      fb.className = 'fb good'; fb.innerHTML = CHEERS[Math.floor(Math.random() * CHEERS.length)] + (w.after ? `<div class="fix">${w.after}</div>` : ''); E.ding();
      if (!S.stars[key] && b.tries <= 2) { S.stars[key] = 1; E.save(); head.querySelector('.qstar').textContent = '⭐'; c.classList.add('done', 'pulse'); E.onStar(); }
      if (q.s && q.s.length) ex.classList.remove('hide');
      b.locked = q.t === 'mcq' || q.t === 'tf';
    } else {
      if (w.self) { fb.className = 'fb info'; fb.textContent = 'تمام 🌸 اقري النموذج بصوت عالي مرتين وجربي تكتبيه من دماغك.'; return; }
      fb.className = 'fb bad'; fb.textContent = TRY[Math.min(b.tries - 1, 2)]; E.boop();
      if (b.tries >= 2) ans.classList.remove('hide');
      if (q.t === 'mcq' || q.t === 'tf') setTimeout(() => [...body.querySelectorAll('.opt.bad')].forEach(o => o.classList.remove('bad', 'sel')), 900);
    }
  };
  chk.onclick = b.check;
  why.onclick = () => ex.classList.toggle('hide');
  ans.onclick = () => { w.show(); ex.classList.remove('hide'); ans.classList.add('hide'); if (w.after) fb.innerHTML = `<div class="fix">${w.after}</div>`; };
  if (!w.noBtn) bar.appendChild(chk);
  if (q.s && q.s.length) bar.appendChild(why);
  if (!w.self) bar.appendChild(ans);
  c.append(bar, fb, ex);
  return c;
};
})();
