/* Shuffle answer choices once, in a fixed order (the right answer is written first in the data files). */
(function () {
  const h = s => { let x = 7; for (const c of String(s)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };
  const fix = q => {
    if (!q || q.t !== 'mcq' || !Array.isArray(q.o) || q.o.length < 2) return;
    const right = q.o[q.a], o = q.o.slice(); let seed = h(q.q + o.join('|'));
    for (let i = o.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) >>> 0; const j = (seed >>> 16) % (i + 1); [o[i], o[j]] = [o[j], o[i]]; }
    q.o = o; q.a = o.indexOf(right);
  };
  ((window.ENGQ || {}).sets || []).forEach(s => s.qs.forEach(fix));
})();
