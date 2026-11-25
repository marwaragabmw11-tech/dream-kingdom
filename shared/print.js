/* =====================================================================
   ورقة الطباعة المشتركة — Printable worksheet (math · social · science)
   PRINT.open({ title, sub, dir, lang, items:[{html, key, work}], note })
     html : the question as HTML (already escaped by the caller)
     key  : the answer for the answer key (HTML)
     work : height of a "show your work" box in lines (0 = none)
   The page shows a preview with options, then calls window.print().
   On a phone: Print → "Save as PDF" or a nearby printer.
   ===================================================================== */
(function () {
  const CSS = `
#pwRoot{position:fixed;inset:0;z-index:9999;background:#e9e4dc;overflow:auto;-webkit-overflow-scrolling:touch;font-family:'Baloo 2','Baloo Bhaijaan 2',system-ui,sans-serif;color:#222}
#pwRoot .pwBar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 12px;background:#2d2a32;color:#fff}
#pwRoot .pwBar b{flex:1 1 100%;font-size:16px}
#pwRoot .pwBar label{display:flex;align-items:center;gap:6px;font-size:15px;background:rgba(255,255,255,.12);border-radius:12px;padding:4px 10px}
#pwRoot .pwBar input{width:18px;height:18px}
#pwRoot .pwBar button{border:0;border-radius:14px;padding:8px 16px;font-family:inherit;font-weight:800;font-size:16px;cursor:pointer}
#pwRoot .pwGo{background:#ff7a59;color:#fff}
#pwRoot .pwX{background:#fff;color:#2d2a32}
#pwRoot .pwHint{font-size:13px;opacity:.85;flex:1 1 100%}
.pwSheet{background:#fff;max-width:800px;margin:14px auto 40px;padding:28px 30px;box-shadow:0 4px 18px rgba(0,0,0,.15);font-size:15.5px;line-height:1.55}
.pwHead{display:flex;justify-content:space-between;gap:10px;align-items:flex-end;border-bottom:3px double #444;padding-bottom:8px;margin-bottom:12px}
.pwHead h1{font-size:21px;margin:0}
.pwHead .pwSub{font-size:13.5px;color:#555}
.pwName{display:flex;gap:18px;flex-wrap:wrap;font-size:14px;margin:6px 0 14px}
.pwName span{flex:1;min-width:150px;border-bottom:1.5px solid #888;padding-bottom:2px}
.pwNote{font-size:13px;color:#555;border:1.5px dashed #bbb;border-radius:8px;padding:6px 10px;margin-bottom:12px}
.pwQ{display:flex;gap:8px;padding:9px 0 11px;border-bottom:1px solid #e3e3e3;break-inside:avoid;page-break-inside:avoid}
.pwN{flex:none;min-width:26px;height:26px;border:2px solid #333;border-radius:50%;text-align:center;font-weight:800;font-size:13.5px;line-height:22px}
.pwB{flex:1;min-width:0}
.pwT{font-weight:700}
.pwSec{font-weight:800;font-size:15px;background:#f1eee8;border-radius:6px;padding:3px 10px;margin:14px 0 2px;break-after:avoid;page-break-after:avoid}
.pwOpts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 18px;margin-top:5px}
.pwOpts.four{grid-template-columns:repeat(4,minmax(0,1fr))}
.pwOpts div::before{content:'○ ';font-size:17px}
.pwLine{border-bottom:1.5px solid #999;height:30px}
.pwBlank{display:inline-block;min-width:120px;border-bottom:1.5px solid #777;height:1.2em;vertical-align:bottom}
.pwBlank.s{min-width:70px}
.pwWork{border:1.5px dashed #aaa;border-radius:8px;margin-top:6px;position:relative;background-image:linear-gradient(#eee 1px,transparent 1px);background-size:100% 26px}
.pwWork::before{content:attr(data-l);position:absolute;top:2px;inset-inline-start:8px;font-size:11.5px;color:#888;background:#fff;padding:0 4px}
.pwRow{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;margin-top:5px}
.pwImg{max-width:260px;max-height:170px;display:block;margin:6px 0}
.pwFig{max-width:280px;margin:6px 0}
.pwFig svg{max-width:100%;height:auto}
.pwKey{break-before:page;page-break-before:always;margin-top:26px}
.pwKey h2{font-size:18px;border-bottom:2px solid #444;padding-bottom:4px}
.pwKey ol{padding-inline-start:26px;margin:0}
.pwKey li{margin:4px 0;break-inside:avoid}
.pwKey small{color:#666}
.pwTbl{border-collapse:collapse;margin-top:6px;direction:ltr}
.pwTbl td{border:1.5px solid #777;min-width:40px;height:34px;text-align:center;font-weight:700;padding:0 6px}
.pwCol{font:800 20px/1.25 'Baloo 2',monospace;letter-spacing:9px;direction:ltr;display:inline-block;margin:6px 0 0;text-align:right}
.pwCol .ln{border-top:2.5px solid #333;height:30px}
@media print{
  @page{size:A4;margin:12mm}
  body>*:not(#pwRoot){display:none!important}
  html,body{background:#fff!important}
  #pwRoot{position:static;background:#fff;overflow:visible}
  #pwRoot .pwBar{display:none}
  .pwSheet{box-shadow:none;margin:0;max-width:none;padding:0}
  .pwNoKey .pwKey{display:none}
  .pwNoName .pwName{display:none}
}`;
  let root = null;
  function css() { if (document.getElementById('pwCss')) return; const s = document.createElement('style'); s.id = 'pwCss'; s.textContent = CSS; document.head.appendChild(s); }
  const T = (lang, en, ar) => lang === 'ar' ? ar : en;
  function work(n, lang) { return n ? `<div class="pwWork" data-l="${T(lang, 'Show your work', 'مكان الحل')}" style="height:${Math.max(2, n) * 26 + 8}px"></div>` : ''; }
  function lines(n) { let h = ''; for (let i = 0; i < n; i++) h += '<div class="pwLine"></div>'; return h; }
  function close() { if (root) { root.remove(); root = null; } document.documentElement.style.overflow = ''; }
  function open(o) {
    css(); close();
    const lang = o.lang || 'en', dir = o.dir || (lang === 'ar' ? 'rtl' : 'ltr');
    root = document.createElement('div'); root.id = 'pwRoot'; root.dir = dir; root.lang = lang;
    const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB');
    const qs = o.items.map((it, i) => (it.sec ? `<div class="pwSec">${it.sec}</div>` : '') +
      `<div class="pwQ"><div class="pwN">${i + 1}</div><div class="pwB">${it.html}${work(it.work || 0, lang)}</div></div>`).join('');
    const key = o.items.map(it => `<li>${it.key || '—'}</li>`).join('');
    root.innerHTML = `<div class="pwBar" dir="${dir}">
        <b>🖨️ ${T(lang, 'Print the quiz to answer on paper', 'اطبعي الكويز علشان تحلّي كتابة')}</b>
        <label><input type="checkbox" id="pwK"> ${T(lang, 'Answer key on the last page', 'نموذج الإجابة في آخر صفحة')}</label>
        <label><input type="checkbox" id="pwNm" checked> ${T(lang, 'Name & date', 'الاسم والتاريخ')}</label>
        <button class="pwGo" id="pwGo">🖨️ ${T(lang, 'Print / Save PDF', 'اطبعي / احفظي PDF')}</button>
        <button class="pwX" id="pwX">✕ ${T(lang, 'Close', 'إغلاق')}</button>
        <span class="pwHint">${T(lang, 'On a phone: choose “Save as PDF” or a printer. Tip: print the answer key separately for Mum.', 'على الموبايل: اختاري «حفظ كـ PDF» أو الطابعة. نصيحة: اطبعي نموذج الإجابة لوحده لماما.')}</span>
      </div>
      <div class="pwSheet pwNoKey" id="pwSheet">
        <div class="pwHead"><div><h1>${o.title}</h1><div class="pwSub">${o.sub || ''}</div></div><div class="pwSub">${o.items.length} ${T(lang, 'questions', 'سؤال')}</div></div>
        <div class="pwName"><span>${T(lang, 'Name', 'الاسم')}: </span><span>${T(lang, 'Date', 'التاريخ')}: ${date}</span><span>${T(lang, 'Score', 'الدرجة')}: &nbsp;&nbsp;&nbsp; / ${o.items.length}</span></div>
        ${o.note ? `<div class="pwNote">${o.note}</div>` : ''}
        ${qs}
        <div class="pwKey"><h2>🔑 ${T(lang, 'Answer key', 'نموذج الإجابة')} — ${o.title}</h2><ol>${key}</ol></div>
      </div>`;
    document.body.appendChild(root);
    document.documentElement.style.overflow = 'hidden';
    const sh = root.querySelector('#pwSheet');
    root.querySelector('#pwK').onchange = e => sh.classList.toggle('pwNoKey', !e.target.checked);
    root.querySelector('#pwNm').onchange = e => sh.classList.toggle('pwNoName', !e.target.checked);
    root.querySelector('#pwGo').onclick = () => window.print();
    root.querySelector('#pwX').onclick = close;
    root.scrollTop = 0;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  window.PRINT = { open, close, lines, work, esc, opts: (arr, four) => `<div class="pwOpts${four ? ' four' : ''}">${arr.map(x => `<div>${x}</div>`).join('')}</div>`, blank: s => `<span class="pwBlank${s ? ' s' : ''}"></span>` };
})();
