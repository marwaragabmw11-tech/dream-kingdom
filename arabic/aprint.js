/* ورقة طباعة الدراسات: تحوّل أسئلة الكويز لأسئلة على الورق + نموذج إجابة.
   تستخدم ../shared/print.js (window.PRINT) و sengine.js (window.SE). */
(function () {
  const E = window.SE, P = () => window.PRINT;
  const esc = s => P().esc(s);
  const nLines = t => Math.max(2, Math.min(6, Math.ceil(String(t || '').length / 48) + 1));
  function item(q) {
    const p = P(), B = p.blank();
    let h = `<div class="pwT">${q.q}</div>`, key = '';
    if (q.p && window.APAS && APAS[q.p]) h = `<div class="pwT" style="font-weight:400;border-right:3px solid #ccc;padding-right:8px">${APAS[q.p]}</div>` + h;
    if (q.fig && E.fig) h += `<div class="pwFig">${E.fig(q.fig)}</div>`;
    if (q.img) h += `<img class="pwImg" src="${q.img}" alt="">`;
    switch (q.t) {
      case 'mcq':
        h += p.opts(q.o.map((o, i) => '(' + 'أبجد'[i] + ') ' + o), q.o.every(o => String(o).length < 12));
        key = q.o[q.a]; break;
      case 'fill':
        if (!/……|\.\.\./.test(q.q)) h += `<div class="pwRow">الإجابة: ${B}${p.blank()}</div>`;
        key = [].concat(q.a)[0]; break;
      case 'tf':
        h += `<div class="pwRow">( &nbsp; صح &nbsp; ) &nbsp;&nbsp; ( &nbsp; خطأ &nbsp; )</div><div class="pwRow">التصويب لو خطأ: ${B}${p.blank()}${p.blank()}</div>`;
        key = q.a ? 'صح ✔' : 'خطأ ✘' + (q.fix ? ' — التصويب: ' + q.fix : ''); break;
      case 'num':
        h += `<div class="pwRow">الإجابة: ${B} ${q.unit || ''}</div>`; key = q.a + (q.unit ? ' ' + q.unit : '');
        return { html: h, key, work: 2 };
      case 'multi':
        h += q.parts.map(pt => `<div class="pwRow">${pt[0]}: ${B}${p.blank()}</div>`).join('');
        key = q.parts.map(pt => `${pt[0]}: ${[].concat(pt[1])[0]}`).join(' · '); break;
      default: /* self: بم تفسر / دلل / قارن … */
        h += p.lines(nLines(q.model));
        key = (q.model || '') + (q.keys && q.keys.length ? `<br><small>🔑 الكلمات المهمة: ${q.keys.map(esc).join('، ')}</small>` : '');
    }
    return { html: h, key, work: 0 };
  }
  window.SPRINT = (qs, title, sub) => P().open({
    title, sub, lang: 'ar', dir: 'rtl',
    items: (() => { let last = null; return qs.map(q => { const it = item(q); if (q.sec && q.sec !== last) it.sec = q.sec; last = q.sec || last; return it; }); })(),
    note: '✍️ في «علل» ابدئي بـ«لأن»، وفي «الجمال» قولي «تعبير مجازي، حيث صوّر…». نموذج الإجابة فيه الكلمات المهمة 🔑 اللي ماما بتدوّر عليها وهي بتصحح.'
  });
})();
