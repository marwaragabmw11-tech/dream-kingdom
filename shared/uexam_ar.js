/* =====================================================================
   📝 امتحان الوحدة كامل — للصفحات العربي الشكل (العربي · الدين)
   UEXAM_AR.build(unit, WEEKS, month) → [{ q, orig, key }]
     - كل أسئلة أسابيع/دروس الوحدة (تدريبات الكتاب + المجموعات) + مراجعة الوحدة
     - من غير تكرار، ومترتبة زي الامتحان:
       القراءة (كل فقرة مرة واحدة) ← اختاري ← أكملي ← صح/خطأ ← أسئلة متعددة ← أجيبي ← الخط ← التعبير
     - q   : نسخة للطباعة فيها sec (عنوان القسم)
     - orig: السؤال الأصلي (للحل على الشاشة)
     - key : مفتاح النجوم الأصلي، فالنجمة اللي بتاخدها هنا بتتحسب في الكويز الأصلي كمان
   UEXAM_AR.mount({ V, H, E, go, back, app, WEEKS, SUNITS, SMONTH, print, brand })
     بيضيف V.uexam(unitId) وبيرجّع دالة button(unitId) لزرار الامتحان.
   ===================================================================== */
(function () {
  const norm = s => String(s || '').replace(/<[^>]+>/g, '').replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^ء-يa-z0-9]+/gi, ' ').trim();
  const SEC = {
    mcq: 'اختاري الإجابة الصحيحة:',
    fill: 'أكملي:',
    tf: 'ضعي علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام الخطأ، وصوّبي الخطأ:',
    multi: 'أجيبي:',
    self: 'أجيبي عن الأسئلة الآتية:',
    hand: '✍️ الخط:',
    open: '📝 التعبير:'
  };
  const kindOf = q => q.t === 'self' ? (/^\s*\(?الخط\)?/.test(q.q) ? 'hand' : q.open ? 'open' : 'self') : q.t;

  function build(unit, WEEKS, month) {
    const seen = new Set(), all = [];
    const add = (q, key) => {
      const k = q.t + '|' + norm(q.q) + '|' + (q.o || []).map(norm).join('|') + '|' + (q.p || '');
      if (seen.has(k)) return; seen.add(k); all.push({ q, key });
    };
    WEEKS.filter(w => w.unit.id === unit.id).forEach(w => Object.keys(w.models).forEach(m => w.models[m].forEach((q, i) => add(q, `w:${w.id}:${m}:${i}`))));
    if (month) month.qs.forEach((q, i) => add(q, `m:${month.id}:${i}`));

    const out = [], push = (x, sec, extra) => out.push({ q: Object.assign({}, x.q, { sec }, extra || {}), orig: x.q, key: x.key });
    /* القراءة: كل فقرة مع أسئلتها، والفقرة بتتطبع مرة واحدة */
    const pas = []; all.filter(x => x.q.p).forEach(x => { if (!pas.includes(x.q.p)) pas.push(x.q.p); });
    pas.forEach((p, n) => all.filter(x => x.q.p === p).forEach((x, j) => push(x, `📖 القراءة (${n + 1}): اقري الفقرة، ثم أجيبي:`, j ? { p: undefined } : null)));
    ['mcq', 'fill', 'tf', 'multi', 'self', 'hand', 'open'].forEach(t => all.filter(x => !x.q.p && kindOf(x.q) === t).forEach(x => push(x, SEC[t])));
    /* أي نوع تاني (لو اتضاف بعدين) في الآخر */
    all.filter(x => !x.q.p && !SEC[kindOf(x.q)]).forEach(x => push(x, SEC.self));
    return out;
  }

  function mount(o) {
    const { V, H, E, back, app, WEEKS, SUNITS, SMONTH, print, brand } = o;
    const NTH = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];
    const monthOf = ui => SMONTH.find(m => m.id === 'r' + (ui + 1));
    const examOf = id => { const ui = SUNITS.findIndex(u => u.id === id); return { u: SUNITS[ui], ui, list: build(SUNITS[ui], WEEKS, monthOf(ui)) }; };
    V.uexam = (id) => {
      const { u, ui, list } = examOf(id);
      back('الكويزات', () => o.go('quiz'));
      const title = `📝 امتحان الوحدة ${NTH[ui]} كامل`;
      app.appendChild(H('h2', '', title));
      app.appendChild(H('div', 'mini', `${u.emoji || ''} ${u.t} · ${list.length} سؤال — كل أسئلة الوحدة (تدريبات الكتاب + المجموعات + مراجعة الوحدة) من غير تكرار.`));
      app.appendChild(H('div', 'say', 'الامتحان طويل 🌸 مش لازم يتحل مرة واحدة: قسّميه على يومين. النجوم اللي بتاخديها هنا بتتحسب في الكويزات الأصلية كمان.'));
      const pr = H('div', 'printb'), p = H('button', 'btn', '🖨️ اطبعي امتحان الوحدة');
      p.onclick = () => print(list.map(x => x.q), `امتحان الوحدة ${NTH[ui]}: ${u.t}`, `${brand} · كل أسئلة الوحدة · ${list.length} سؤال`);
      pr.appendChild(p); app.appendChild(pr);
      let last = null;
      list.forEach((x, k) => { if (x.q.sec !== last) { app.appendChild(H('h3', 'usec', x.q.sec)); last = x.q.sec; } app.appendChild(E.card(x.orig, x.key, k + 1)); });
    };
    return id => { const { u, ui, list } = examOf(id); const b = H('button', 'item uexam', `<b>📝</b><div><span>امتحان الوحدة ${NTH[ui]} كامل</span><small>${u.t} · ${list.length} سؤال · 🖨️ للطباعة</small></div>`); b.onclick = () => o.go('uexam', id); return b; };
  }
  window.UEXAM_AR = { build, mount };
})();
