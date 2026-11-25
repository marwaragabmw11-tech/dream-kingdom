/* Printable math worksheet: turns quiz questions into paper questions + an answer key.
   Uses ../shared/print.js (window.PRINT) and engine.js (window.ENG). */
(function () {
  const E = window.ENG, P = () => window.PRINT, f = n => E.fmt(n);
  const PROPS = ['Commutative', 'Associative', 'Additive identity', 'Commutative + Associative'];
  const r1000 = n => Math.round(n / 1000) * 1000;
  const factorsOf = n => { const F = []; for (let i = 1; i <= n; i++) if (n % i === 0) F.push(i); return F; };
  const multsOf = q => { const ok = n => n > 0 && q.of.every(d => n % d === 0) && (q.min == null || n > q.min) && (q.max == null || n < q.max); const L = []; if (q.all) { for (let n = 1; n < q.max; n++) if (ok(n)) L.push(n); } else for (let n = 1; L.length < q.count; n++) if (ok(n)) L.push(n); return L; };
  const ltr = h => `<span dir="ltr">${h}</span>`;

  function item(q) {
    const p = P(), B = p.blank();
    let h = `<div class="pwT" dir="ltr">${q.q}</div>`, key = '', work = 0;
    if (q.fig && E.figs[q.fig]) h += `<div class="pwFig">${E.figs[q.fig]()}</div>`;
    if (q.area) h += `<div class="pwFig" dir="ltr"><table class="pwTbl"><tr><td></td>${q.area.top.map(t => `<td>${t}</td>`).join('')}</tr><tr><td>${q.area.d}</td>${q.area.bot.map(t => `<td>${t === '?' ? '' : t}</td>`).join('')}</tr></table></div>`;
    switch (q.t) {
      case 'mcq': case 'pick':
        h += p.opts(q.o.map((o, i) => ltr('abcd'[i] + ') ' + o)), q.o.length > 2 && q.o.every(o => String(o).length < 14));
        key = ltr('abcd'[q.a] + ') ' + q.o[q.a]); work = q.t === 'pick' ? 2 : 0; break;
      case 'num': case 'var':
        h += `<div class="pwRow" dir="ltr">Answer: ${B} ${q.unit || ''}</div>`; key = ltr(f(q.a) + (q.unit ? ' ' + q.unit : '')); work = q.q.length > 70 ? 4 : 2; break;
      case 'word': h += `<div class="pwRow" dir="ltr">${p.lines(1)}</div>`; key = ltr(q.a); break;
      case 'time': h += `<div class="pwRow" dir="ltr">Answer: ${p.blank(1)} : ${p.blank(1)}</div>`; key = ltr(q.a); work = 2; break;
      case 'lt': key = ltr('any number less than ' + f(q.n) + ', e.g. ' + f(q.n - 1)); h += `<div class="pwRow" dir="ltr">Answer: ${B}</div>`; break;
      case 'gt': key = ltr('any number greater than ' + f(q.n) + ', e.g. ' + f(q.n + 1)); h += `<div class="pwRow" dir="ltr">Answer: ${B}</div>`; break;
      case 'exp': h += p.lines(1); key = ltr(E.parts(q.n).map(f).join(' + ')); break;
      case 'factors': h += p.lines(1); key = ltr(factorsOf(q.n).join(', ')); work = 2; break;
      case 'mults': h += p.lines(1); key = ltr(multsOf(q).join(', ') + (q.all ? '' : ' (or other correct ones)')); break;
      case 'multi': h += `<div dir="ltr">${q.parts.map(([l]) => `<div class="pwRow">${l}: ${B}</div>`).join('')}</div>`; key = ltr(q.parts.map(([l, a]) => `${l}: ${a}`).join(' · ')); work = 3; break;
      case 'prop': h += `<div class="pwRow" dir="ltr">Answer: ${B} &nbsp; Property: ${B}${p.blank()}</div>`; key = ltr(f(q.a) + ' — ' + PROPS[q.p]); break;
      case 'ord': h += `<div class="pwRow" dir="ltr">${q.items.join(' &nbsp;·&nbsp; ')}</div><div class="pwRow" dir="ltr">${q.items.map(() => p.blank(1)).join(/descend/i.test(q.q) ? ' &gt; ' : ' &lt; ')}</div>`;
        key = ltr(q.ans.map(i => q.items[i]).join(/descend/i.test(q.q) ? ' > ' : ' < ')); break;
      case 'col': {
        const res = q.op === '+' ? q.x + q.y : q.x - q.y, L = Math.max(String(q.x).length, String(q.y).length, String(res).length) + 1;
        const pad = n => String(n).padStart(L, ' ').replace(/ /g, '&nbsp;');
        h += `<div class="pwCol"><div>${pad(q.x)}</div><div>${q.op === '+' ? '+' : '−'}${pad(q.y).slice(6)}</div><div class="ln"></div></div>`;
        key = ltr(f(res)); work = 2; break;
      }
      case 'est': h += `<div class="pwRow" dir="ltr">Actual: ${B} &nbsp; Estimate: ${B}</div>`;
        key = ltr('Actual ' + f(q.op === '+' ? q.x + q.y : q.x - q.y) + ' · Estimate ' + f(q.op === '+' ? r1000(q.x) + r1000(q.y) : r1000(q.x) - r1000(q.y))); work = 4; break;
      case 'mult': {
        const pp = E.parts(q.x);
        if (q.how === 'area') h += `<div dir="ltr"><table class="pwTbl"><tr><td></td>${pp.map(v => `<td>${f(v)}</td>`).join('')}</tr><tr><td>${q.y}</td>${pp.map(() => '<td style="min-width:70px"></td>').join('')}</tr></table></div>`;
        h += `<div class="pwRow" dir="ltr">Final answer: ${B}</div>`; key = ltr(f(q.x * q.y)); work = 4; break;
      }
      case 'bar': {
        const whole = q.total == null, tot = whole ? q.part + q.other : q.total, ans = whole ? tot : tot - q.part;
        h += `<div dir="ltr"><table class="pwTbl"><tr><td colspan="2">${whole ? 'X = ?' : f(tot)}</td></tr><tr><td style="min-width:120px">${f(q.part)}</td><td style="min-width:90px">${whole ? f(q.other) : 'X'}</td></tr></table></div><div class="pwRow" dir="ltr">X = ${B}</div>`;
        key = ltr(f(ans)); work = 3; break;
      }
      case 'self': h += ''; key = `<span dir="ltr">${q.model || ''}</span>`; work = 6; break;
      default: h += `<div class="pwRow" dir="ltr">Answer: ${B}</div>`; key = ltr(q.a != null ? q.a : '');
    }
    return { html: h, key, work };
  }
  window.MPRINT = (qs, title, sub) => P().open({
    title, sub, lang: "en", dir: "ltr", items: qs.map(q => Object.assign(item(q), { sec: q.sec })),
    note: 'Write the steps (the recipe 📝) in the boxes — that’s how the teacher sees you understand. ✏️'
  });
})();
