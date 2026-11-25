/* ترتيب الاختيارات: الإجابة الصحيحة مكتوبة أول اختيار في البيانات، فبنلخبط الترتيب هنا بشكل ثابت (نفس الترتيب كل مرة).
   الاختيارات اللي كلها علامات ترقيم أو «صح كما هي» بتتلخبط برضه. */
(function () {
  if (window.__REL_SHUF) return; window.__REL_SHUF = 1;
  const h = s => { let x = 7; for (const c of String(s)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };
  const fix = q => {
    if (!q || q.t !== 'mcq' || !Array.isArray(q.o) || q.o.length < 2) return;
    const right = q.o[q.a]; let seed = h(q.q + q.o.join('|'));
    const o = q.o.slice();
    for (let i = o.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) >>> 0; const j = (seed >>> 16) % (i + 1); [o[i], o[j]] = [o[j], o[i]]; }
    q.o = o; q.a = o.indexOf(right);
  };
  Object.values(window.RQ || {}).forEach(u => u.forEach(w => Object.values(w.models).forEach(m => m.forEach(fix))));
  (window.RMONTH || []).forEach(m => m.qs.forEach(fix));
  (window.RUNITS || []).forEach(u => u.lessons.forEach(l => fix(l.try)));
})();
