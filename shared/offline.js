/* تشغيل صفحات المذاكرة من غير إنترنت: بيسجّل sw.js (في جذر المستودع) وبيظهر رسالة صغيرة.
   ضيفيه في آخر أي صفحة:  <script src="../shared/offline.js"></script>  */
(function () {
  const me = document.currentScript && document.currentScript.src;
  if (!me || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const base = me.replace(/shared\/offline\.js.*$/, '');
  const KEY = 'amina-offline-ready';

  // أيقونة وmanifest علشان «إضافة للشاشة الرئيسية»
  const link = (rel, href, extra) => { if (document.querySelector(`link[rel="${rel}"]`)) return; const l = document.createElement('link'); l.rel = rel; l.href = href; Object.assign(l, extra || {}); document.head.appendChild(l); };
  link('manifest', base + 'manifest.webmanifest');
  link('apple-touch-icon', base + 'icons/icon-192.png');
  if (!document.querySelector('meta[name="theme-color"]')) { const m = document.createElement('meta'); m.name = 'theme-color'; m.content = '#7b61c9'; document.head.appendChild(m); }

  const css = document.createElement('style');
  css.textContent = '.ofl-toast{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:9999;background:#2a2340;color:#fff;padding:10px 16px;border-radius:16px;font:600 15px/1.5 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:90vw;text-align:center;direction:rtl;transition:opacity .4s}.ofl-chip{position:fixed;top:8px;left:8px;z-index:9999;background:#e76f51;color:#fff;padding:4px 10px;border-radius:12px;font:700 13px system-ui,sans-serif;direction:rtl}@media print{.ofl-toast,.ofl-chip{display:none}}';
  document.head.appendChild(css);
  const toast = (msg, ms) => { const t = document.createElement('div'); t.className = 'ofl-toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, ms || 4500); };

  // شارة «بدون إنترنت»
  let chip;
  const net = () => { if (!navigator.onLine) { if (!chip) { chip = document.createElement('div'); chip.className = 'ofl-chip'; chip.textContent = '📴 بدون إنترنت'; document.body.appendChild(chip); } } else if (chip) { chip.remove(); chip = null; } };
  addEventListener('online', net); addEventListener('offline', net);

  navigator.serviceWorker.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === 'offline-ready') {
      let seen = null; try { seen = localStorage.getItem(KEY); } catch (err) {}
      if (seen !== d.version) { try { localStorage.setItem(KEY, d.version); } catch (err) {} toast('✅ كل صفحات المذاكرة اتحفظت على الجهاز — تقدري تفتحيها من غير إنترنت'); }
    }
  });

  addEventListener('load', () => {
    net();
    navigator.serviceWorker.register(base + 'sw.js', { scope: base }).then(reg => {
      const ask = w => w && w.postMessage({ type: 'ready?' });
      if (reg.active) {
        ask(reg.active);
        // تحديث المحفوظ في الخلفية مرة كل 12 ساعة لما يكون فيه نت
        let last = 0; try { last = +localStorage.getItem(KEY + '-refresh') || 0; } catch (err) {}
        if (navigator.onLine && Date.now() - last > 12 * 3600e3) { reg.active.postMessage({ type: 'refresh' }); try { localStorage.setItem(KEY + '-refresh', Date.now()); } catch (err) {} }
      }
    }).catch(() => {});
  });
})();
