/* Printable science worksheet (uses ../shared/print.js and the bank in bank.js: C, Q, SV, LANDS…).
   Q row: [chapter, type, level, question, answers(first = correct), why, example, label, picture, month] */
(function () {
  const P = () => window.PRINT;
  const esc = s => P().esc(s);
  const nLines = a => Math.max(1, Math.min(5, Math.ceil(String(a || '').length / 55)));
  /* stable shuffle so the paper and its answer key match */
  const mix = (arr, seed) => arr.map((x, i) => [Math.sin(seed * 97 + i * 13.7) * 1e4 % 1, x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  function item(i) {
    const q = Q[i], p = P(), ans = q[4][0];
    let h = `<div class="pwT">${esc(q[3])}</div>`, key = `<b>${esc(ans)}</b>`, work = 0;
    if (q[8] && typeof SV !== 'undefined' && SV[q[8]]) h += `<div class="pwFig">${SV[q[8]]}</div>`;
    if (q[4].length > 1) {
      const o = mix(q[4], i), short = o.every(x => x.length < 16);
      h += p.opts(o.map((x, k) => 'abcd'[k] + ') ' + esc(x)), short);
      key = 'abcd'[o.indexOf(ans)] + ') ' + key;
    } else if (q[1] === 'Complete' && /_{3,}/.test(q[3])) {
      h = h.replace(/_{3,}/g, '<span class="pwBlank"></span>');
    } else {
      h += p.lines(nLines(ans) + (/Compare|Correct/.test(q[1]) ? 1 : 0));
    }
    if (q[5] && !/the book gives this model answer/.test(q[5])) key += ` <small>— ${esc(q[5])}</small>`;
    return { html: h, key, work };
  }
  window.SCIPRINT = (ids, title, sub) => P().open({
    title, sub, lang: 'en', dir: 'ltr', items: ids.map(item),
    note: '✍️ Answer in full sentences: “Because …” for reasons, “It … because …” for what happens. Mum checks with the answer key on the last page.'
  });
})();
