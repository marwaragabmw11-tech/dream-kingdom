/* Card engine — copy of ../ict/iengine.js with its own save key (amina-eng), ENGL lessons, and reading texts (q.p → EPAS) */
/* Amina's ICT Lab — question engine (cards, help, Arabic word helper, print)
   Question types: mcq · tf · fill · match · odd · sort · self */
(function () {
  'use strict';
  const E = window.IE = {};
  let S = {};
  try { S = JSON.parse(localStorage.getItem('amina-eng') || '{}') || {}; } catch (e) { S = {}; }
  S.stars = S.stars || {};
  E.S = S;
  E.save = () => { try { localStorage.setItem('amina-eng', JSON.stringify(S)); } catch (e) {} };
  E.count = p => Object.keys(S.stars).filter(k => !p || k.startsWith(p)).length;
  E.onStar = () => {};
  E.isAr = () => !!S.ar;
  E.L = (en, ar) => S.ar ? ar : en;
  const H = E.H = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = E.esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuf = E.shuf = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

  /* ---------- sound + speech ---------- */
  let AC = null;
  const tone = (fr, d, type) => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t0 = AC.currentTime; fr.forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t0 + i * d); g.gain.exponentialRampToValueAtTime(.16, t0 + i * d + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + (i + 1) * d); o.connect(g).connect(AC.destination); o.start(t0 + i * d); o.stop(t0 + (i + 1) * d + .05); }); } catch (e) {} };
  E.ding = () => tone([660, 880, 1320], .1); E.boop = () => tone([300, 240], .14, 'triangle'); E.pop = () => tone([520], .05);
  E.speak = (text, lang) => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ' ').replace(/……/g, lang === 'ar' ? ' فراغ ' : ' blank ')); u.lang = lang === 'ar' ? 'ar-EG' : 'en-US'; u.rate = .9; const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith(lang === 'ar' ? 'ar' : 'en')); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {} };

  /* ---------- lessons index + glossary ---------- */
  const LS = window.ENGL || [];
  E.lessonOf = (unit, n) => { const u = LS[unit - 1]; return u && u.lessons[n - 1]; };
  const WORDS = [];
  LS.forEach(u => u.lessons.forEach(l => (l.words || []).forEach(w => WORDS.push(w))));
  E.words = WORDS;
  const strip = s => String(s).replace(/<[^>]+>/g, ' ');
  const norm = s => strip(s).toLowerCase().replace(/[^a-z0-9+#@ ]/g, ' ').replace(/\s+/g, ' ').trim();
  const STOP = new Set('the a an of to is are and or in on for with from by it its this that be can you your use used using which what when who all them none both following one some may must should not as at into than then there these those has have more most about after before because over under do does our we they his her him'.split(' '));
  const stem = w => w.replace(/(ies)$/, 'y').replace(/(es|s)$/, '').replace(/(ing|ed)$/, '');
  const toks = s => norm(s).split(' ').filter(w => w.length > 2 && !STOP.has(w)).map(stem);
  /* the Arabic meanings of the book words that appear in a question */
  E.wordHelp = (text) => {
    const t = ' ' + norm(text) + ' ', out = [], seen = new Set();
    WORDS.forEach(([en, ar]) => { const k = norm(en.split('/')[0]); if (k && t.includes(' ' + k.split(' ')[0]) && k.split(' ').every(p => t.includes(p.slice(0, Math.max(4, p.length - 2))))) { out.push([en, ar]); k.split(' ').forEach(p => seen.add(p)); } });
    const D = window.ICTDICT || {};
    norm(text).split(' ').forEach(w => { const k = D[w] ? w : D[w.replace(/e?s$/, '')] ? w.replace(/e?s$/, '') : D[w.replace(/s$/, '')] ? w.replace(/s$/, '') : null; if (k && !seen.has(w) && !seen.has(k) && w.length > 2 && !STOP.has(w)) { out.push([w, D[k]]); seen.add(w); seen.add(k); } });
    return out.slice(0, 14);
  };
  /* which lesson point answers this question? (word overlap) */
  E.findPoints = (q, unit, lessons) => {
    const qt = toks(qText(q) + ' ' + (q.o || []).join(' ') + ' ' + (q.L || []).join(' '));
    const cands = [];
    (lessons && lessons.length ? lessons : [1, 2, 3, 4, 5, 6]).forEach(n => { const l = E.lessonOf(unit, n); if (!l) return; l.points.forEach((p, i) => { const pt = new Set(toks(p)); let sc = 0; qt.forEach(w => { if (pt.has(w)) sc++; }); cands.push({ l, n, i, sc }); }); });
    cands.sort((a, b) => b.sc - a.sc);
    return cands.filter(c => c.sc > 0).slice(0, 2);
  };
  const qText = E.qText = q => q.q || '';

  /* ---------- answer text (for key / feedback / print) ---------- */
  E.answer = q => {
    switch (q.t) {
      case 'mcq': return 'abcd'[q.a] + ') ' + esc(q.o[q.a]);
      case 'tf': return q.a ? '✔ True' : '✘ False' + (q.fix ? ' — ' + esc(q.fix) : '');
      case 'fill': return esc(q.a);
      case 'match': return q.L.map((l, i) => `${i + 1} → ${'abcde'[q.a[i]]}`).join(' · ');
      case 'odd': return esc(q.o[q.a]) + (q.why ? ' — ' + esc(q.why) : '');
      case 'sort': return q.g.map((g, k) => `<b>${esc(g)}:</b> ` + q.items.filter((_, i) => q.a[i] === k || q.a[i] === 2).map(esc).join(', ')).join('<br>');
      case 'self': return esc(q.model);
    }
    return '';
  };

  /* ---------- widgets ---------- */
  const W = {};
  const mark = (el, ok) => { el.classList.remove('ok', 'bad'); if (ok != null) el.classList.add(ok ? 'ok' : 'bad'); };
  W.mcq = (q, b) => {
    const box = H('div', 'opts'); let pick = -1;
    q.o.forEach((o, i) => { const bt = H('button', 'opt', `<span class="ol">${'abcd'[i]})</span> ${esc(o)}`); bt.onclick = () => { if (b.locked) return; pick = i; [...box.children].forEach(c => c.classList.remove('sel')); bt.classList.add('sel'); b.check(); }; box.appendChild(bt); });
    b.body.appendChild(box);
    return { check: () => pick < 0 ? null : (mark(box.children[pick], pick === q.a), pick === q.a), show: () => mark(box.children[q.a], true), noBtn: true, reset: () => [...box.children].forEach(c => c.classList.remove('bad', 'sel')) };
  };
  W.tf = (q, b) => {
    const box = H('div', 'opts two'); let pick = null;
    [[true, '✔ True'], [false, '✘ False']].forEach(([v, l]) => { const bt = H('button', 'opt', l); bt.onclick = () => { if (b.locked) return; pick = v; [...box.children].forEach(c => c.classList.remove('sel')); bt.classList.add('sel'); b.check(); }; box.appendChild(bt); });
    b.body.appendChild(box);
    return { check: () => pick == null ? null : (mark(box.children[pick ? 0 : 1], pick === q.a), pick === q.a), show: () => mark(box.children[q.a ? 0 : 1], true), noBtn: true, after: () => !q.a && q.fix ? `<b>Correct it:</b> ${esc(q.fix)}` : '', reset: () => [...box.children].forEach(c => c.classList.remove('bad', 'sel')) };
  };
  W.fill = (q, b) => {
    const box = H('div', 'chips'); let pick = -1;
    q.o.forEach((o, i) => { const c = H('button', 'chip', esc(o)); c.onclick = () => { if (b.locked) return; pick = i; [...box.children].forEach(x => x.classList.remove('sel')); c.classList.add('sel'); b.check(); }; box.appendChild(c); });
    b.body.append(H('div', 'mini', 'Choose the word that fits:'), box);
    const ok = () => q.o[pick] === q.a;
    return { check: () => pick < 0 ? null : (mark(box.children[pick], ok()), ok()), show: () => mark(box.children[q.o.indexOf(q.a)], true), noBtn: true, reset: () => [...box.children].forEach(c => c.classList.remove('bad', 'sel')) };
  };
  W.odd = (q, b) => W.mcq(Object.assign({}, q, { o: q.o }), b);
  W.match = (q, b) => {
    const R = q.R.map((r, i) => ({ r, i })); const picks = q.L.map(() => null);
    const tbl = H('div', 'match');
    tbl.appendChild(H('div', 'rcol', R.map(x => `<div><b>${'abcde'[x.i]})</b> ${esc(x.r)}</div>`).join('')));
    q.L.forEach((l, i) => {
      const row = H('div', 'mrow'); row.appendChild(H('div', 'ml', `<b>${i + 1}</b> ${esc(l)}`));
      const ch = H('div', 'chips sm');
      R.forEach(x => { const c = H('button', 'chip', 'abcde'[x.i]); c.onclick = () => { if (b.locked) return; picks[i] = x.i; [...ch.children].forEach(y => y.classList.remove('sel')); c.classList.add('sel'); E.pop(); }; ch.appendChild(c); });
      row.appendChild(ch); tbl.appendChild(row);
    });
    b.body.appendChild(tbl);
    const rows = () => [...tbl.querySelectorAll('.mrow')];
    return { check: () => { if (picks.some(p => p == null)) return null; let all = true; rows().forEach((r, i) => { const ok = picks[i] === q.a[i]; mark(r, ok); all = all && ok; }); return all; },
      show: () => rows().forEach((r, i) => { [...r.querySelectorAll('.chip')].forEach((c, k) => c.classList.toggle('sel', k === q.a[i])); mark(r, true); }) };
  };
  W.sort = (q, b) => {
    const both = q.a.includes(2), picks = q.items.map(() => null);
    const box = H('div', 'sortw');
    q.items.forEach((it, i) => {
      const row = H('div', 'mrow'); row.appendChild(H('div', 'ml', esc(it)));
      const ch = H('div', 'chips sm');
      q.g.concat(both ? ['Both'] : []).forEach((g, k) => { const c = H('button', 'chip', esc(g)); c.onclick = () => { if (b.locked) return; picks[i] = k; [...ch.children].forEach(y => y.classList.remove('sel')); c.classList.add('sel'); E.pop(); }; ch.appendChild(c); });
      row.appendChild(ch); box.appendChild(row);
    });
    b.body.appendChild(box);
    const rows = () => [...box.querySelectorAll('.mrow')];
    return { check: () => { if (picks.some(p => p == null)) return null; let all = true; rows().forEach((r, i) => { const ok = picks[i] === q.a[i]; mark(r, ok); all = all && ok; }); return all; },
      show: () => rows().forEach((r, i) => { [...r.querySelectorAll('.chip')].forEach((c, k) => c.classList.toggle('sel', k === q.a[i])); mark(r, true); }), after: () => q.why ? esc(q.why) : '' };
  };
  W.self = (q, b) => {
    const pad = H('textarea', 'note'); pad.placeholder = 'Write your answer here or in your notebook ✏️';
    const mdl = H('div', 'model hide', '<b>Model answer:</b> ' + esc(q.model) + (q.keys ? `<div class="kw">🔑 ${q.keys.map(esc).join(' · ')}</div>` : ''));
    const show = H('button', 'btn', '👀 Compare with the model'), yes = H('button', 'btn ok hide', '✔ Mine is like it'), no = H('button', 'btn ghost hide', '↺ I’ll check again');
    let st = null;
    show.onclick = () => { mdl.classList.remove('hide'); yes.classList.remove('hide'); no.classList.remove('hide'); show.classList.add('hide'); };
    yes.onclick = () => { st = true; b.check(); }; no.onclick = () => { st = false; b.check(); };
    const row = H('div', 'row'); row.append(show, yes, no); b.body.append(pad, row, mdl);
    return { check: () => st, show: () => show.onclick(), noBtn: true, self: true };
  };

  /* ---------- the card ---------- */
  const CHEERS = ['Bravo, Amina! 🎉', 'Brilliant! ⭐', 'Exactly right! 🌟', 'Super smart! 🚀', 'Well done! 💛'], CHEERS_AR = ['برافو يا أمينة! 🎉', 'الله عليكي! ⭐', 'صح الصح! 🌟', 'دماغك سريعة! 🚀', 'شاطرة جدًا! 💛'];
  const TRY = ['So close! Try again 💪', 'No problem — tap 🔗 to find it in the lesson', 'Take a breath and try again 🌸'], TRY_AR = ['قربتي جدًا! جربي تاني 💪', 'مش مشكلة — دوسي 🔗 وشوفيها في الدرس', 'خدي نفس وجربي تاني 🌸'];
  const pickL = (en, ar, i) => { const L = S.ar ? ar : en; return L[i == null ? Math.floor(Math.random() * L.length) : i]; };
  E.card = (q, key, num, ctx) => {
    const c = H('div', 'qcard' + (S.stars[key] ? ' done' : ''));
    if (q.sec) c.appendChild(H('div', 'qsec', esc(q.sec)));
    const head = H('div', 'qhead');
    head.append(H('span', 'qn', num || ''), H('span', 'qstar', S.stars[key] ? '⭐' : '☆'));
    const say = H('button', 'icon', '🔊'); say.title = 'Listen'; say.onclick = () => E.speak(qText(q) + (q.o ? '. ' + q.o.join(', ') : ''), 'en'); head.appendChild(say);
    c.appendChild(head);
    c.appendChild(H('div', 'qtext', q.t === 'odd' ? 'Cross out the odd word:' : esc(qText(q))));
    if (q.p && window.EPAS && EPAS[q.p]) { const d = H('details', 'passage', `<summary>📖 Read the text</summary><div>${EPAS[q.p]}</div>`); d.dir = 'ltr'; c.appendChild(d); }
    const body = H('div', 'qbody'); c.appendChild(body);
    const fb = H('div', 'fb'), bar = H('div', 'qbtns'), help = H('div', 'help hide');
    const b = { body, locked: false, tries: 0 };
    const w = W[q.t](q, b);
    const chk = H('button', 'btn', E.L('Check ✔', 'تحقّقي ✔')), hl = H('button', 'btn ghost', '🔗 ' + E.L('In the lesson', 'في الدرس')), ar = H('button', 'btn ghost', 'ع ' + E.L('Arabic words', 'الكلمات بالعربي')), ans = H('button', 'btn ghost hide', '🙈 ' + E.L('Answer', 'الإجابة'));
    b.check = () => {
      const r = w.check(); if (r == null) { fb.className = 'fb info'; fb.textContent = E.L('Choose your answer first 🙂', 'اختاري إجابتك الأول 🙂'); return; }
      b.tries++;
      if (r) {
        fb.className = 'fb good'; fb.innerHTML = pickL(CHEERS, CHEERS_AR) + (w.after && w.after() ? `<div class="fix">${w.after()}</div>` : ''); E.ding();
        if (!S.stars[key] && b.tries <= 2) { S.stars[key] = 1; E.save(); head.querySelector('.qstar').textContent = '⭐'; c.classList.add('done', 'pulse'); E.onStar(); }
        b.locked = true;
      } else {
        if (w.self) { fb.className = 'fb info'; fb.textContent = E.L('OK 🌸 read the model twice, then try to write it from memory.', 'تمام 🌸 اقري النموذج مرتين وجربي تكتبيه من دماغك.'); return; }
        fb.className = 'fb bad'; fb.textContent = pickL(TRY, TRY_AR, Math.min(b.tries - 1, 2)); E.boop();
        if (b.tries >= 2) ans.classList.remove('hide');
        if (w.reset) setTimeout(w.reset, 900);
      }
    };
    chk.onclick = b.check;
    hl.onclick = () => {
      const unit = ctx && ctx.unit, ls = ctx && (ctx.lesson ? [ctx.lesson] : ctx.lessons);
      const pts = E.findPoints(q, unit, ls);
      help.classList.toggle('hide');
      if (!pts.length) { help.innerHTML = E.L('Read the lesson again from 📚 Lessons.', 'اقري الدرس تاني من 📚 الدروس.'); return; }
      const useAr = S.ar;
      help.innerHTML = `<b>🔗 ${useAr ? 'المعلومة دي في الدرس' : 'You can find it in the lesson'}:</b>` + pts.map(p => `<div class="hp" dir="${useAr ? 'rtl' : 'ltr'}"><small>${p.l.emoji} ${useAr ? 'درس ' + p.n + ': ' + p.l.ar : 'Lesson ' + p.n + ': ' + p.l.en}</small><br>${useAr ? p.l.pointsAr[p.i] : p.l.points[p.i]}</div>`).join('');
    };
    ar.onclick = () => {
      const ws = E.wordHelp(qText(q) + ' ' + (q.o || []).join(' ') + ' ' + (q.L || []).join(' ') + ' ' + (q.R || []).join(' ') + ' ' + (q.items || []).join(' '));
      help.classList.toggle('hide');
      help.innerHTML = '<b>ع الكلمات المهمة:</b>' + (ws.length ? '<div class="wl">' + ws.map(([e, a]) => `<span><b dir="ltr">${esc(e)}</b> = ${esc(a)}</span>`).join('') + '</div>' : '<div>مفيش كلمات من قاموس الدرس هنا. جربي 🔊 تسمعي السؤال، أو 🔗 تشوفيه في الدرس.</div>');
      help.dir = 'rtl';
    };
    ans.onclick = () => { w.show(); fb.className = 'fb info'; fb.innerHTML = '<b>Answer:</b> ' + E.answer(q); ans.classList.add('hide'); };
    if (!w.noBtn) bar.appendChild(chk);
    bar.append(hl, ar, ans);
    c.append(bar, fb, help);
    return c;
  };

  /* ---------- print ---------- */
  function pItem(q) {
    const p = window.PRINT, B = p.blank();
    let h = `<div class="pwT">${q.t === 'odd' ? 'Cross out the odd word:' : esc(qText(q))}</div>`;
    if (q.p && window.EPAS && EPAS[q.p]) h = `<div class="pwT" style="font-weight:400;border-left:3px solid #ccc;padding-left:8px">${EPAS[q.p]}</div>` + h;
    switch (q.t) {
      case 'mcq': h += p.opts(q.o.map((o, i) => 'abcd'[i] + ') ' + esc(o)), q.o.every(o => o.length < 16)); break;
      case 'tf': h += `<div class="pwRow">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</div>`; break;
      case 'fill': h = h.replace('……', '<span class="pwBlank"></span>'); break;
      case 'odd': h += `<div class="pwRow">${q.o.map(esc).join(' &nbsp;—&nbsp; ')}</div><div class="pwRow">Odd word: ${B}</div>`; break;
      case 'match': h += `<table class="pwTbl" style="direction:ltr;width:100%"><tr><td>(A)</td><td></td><td>(B)</td></tr>${q.L.map((l, i) => `<tr><td style="text-align:left">${i + 1}) ${esc(l)}</td><td style="width:50px"></td><td style="text-align:left">${q.R[i] != null ? 'abcde'[i] + ') ' + esc(q.R[i]) : ''}</td></tr>`).join('')}</table>`; break;
      case 'sort': h += `<div class="pwRow">( ${q.items.map(esc).join(' – ')} )</div><table class="pwTbl" style="width:100%"><tr>${q.g.map(g => `<td>${esc(g)}</td>`).join('')}</tr><tr>${q.g.map(() => '<td style="height:90px"></td>').join('')}</tr></table>`; break;
      case 'self': h += p.lines(3); break;
    }
    return { html: h, key: E.answer(q) };
  }
  E.print = (qs, title, sub) => {
    let last = null; const items = [];
    const banks = new Set();
    qs.forEach(q => { const it = pItem(q); if (q.t === 'fill') { const k = q.o.join(' - '); if (!banks.has(k)) { banks.add(k); it.sec = 'Complete using the words: ( ' + q.o.map(esc).join(' – ') + ' )'; } } const sec = q.sec || ({ mcq: 'Choose the correct answer:', tf: 'Put (✓) or (✗):', match: 'Choose from column (A) what suits it in column (B):', odd: 'Cross out the odd word:', sort: 'Classify:', self: 'Answer the following:' }[q.t]); if (!it.sec && sec && sec !== last) it.sec = sec; last = sec; items.push(it); });
    window.PRINT.open({ title, sub, lang: 'en', dir: 'ltr', items, note: '✍️ In “Put (✓) or (✗)”, correct the false sentences. Mum checks with the answer key on the last page.' });
  };
})();
