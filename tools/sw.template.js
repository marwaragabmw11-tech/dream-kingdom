/* مملكة أمينة للمذاكرة — شغل من غير إنترنت (Service Worker)
   الملف ده متولّد تلقائي من tools/sw.template.js بالأمر: python3 tools/build-offline.py — متعدّليهوش بإيدك.
   الفكرة: أول مرة الصفحة تتفتح والنت شغال، كل ملفات صفحات المذاكرة بتتحفظ على الجهاز.
   بعد كده: لو فيه نت بناخد أحدث نسخة (ونحدّث المحفوظ)، ولو مفيش نت بنفتح من المحفوظ. */
const VERSION = '__VERSION__';
const CACHE = 'amina-study-' + VERSION;
const FONTS = 'amina-fonts';
const FILES = __FILES__;
const NET_TIMEOUT = 3500;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // ملف ملف، علشان لو واحد فشل الباقي يتحفظ عادي
    await Promise.allSettled(FILES.map(f => c.add(new Request(f, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('amina-study-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    const cs = await self.clients.matchAll({ includeUncontrolled: true });
    cs.forEach(c => c.postMessage({ type: 'offline-ready', version: VERSION }));
  })());
});

// الصفحة بتطلب «ready?» علشان تعرف إن الحفظ خلص، و«refresh» علشان نحدّث كل المحفوظ في الخلفية
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'ready?') e.waitUntil((async () => {
    const c = await caches.open(CACHE), keys = await c.keys();
    e.source && e.source.postMessage({ type: keys.length >= FILES.length * 0.9 ? 'offline-ready' : 'offline-partial', version: VERSION });
  })());
  if (d.type === 'refresh') e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(FILES.map(async f => { const r = await fetch(f, { cache: 'no-cache' }); if (r.ok) await c.put(f, r); }));
  })());
});

const timeout = (p, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); p.then(v => { clearTimeout(t); res(v); }, err => { clearTimeout(t); rej(err); }); });
const isFont = u => u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
const isAsset = u => /\.(webp|png|jpe?g|gif|svg|mp3|wav|ogg|woff2?)$/i.test(u.pathname);

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // الخطوط من جوجل: من المحفوظ الأول، ولو مش محفوظة نجيبها ونحفظها
  if (isFont(url)) {
    e.respondWith((async () => {
      const c = await caches.open(FONTS), hit = await c.match(req);
      if (hit) return hit;
      try { const r = await fetch(req); if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }
      catch (err) { return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } }); }
    })());
    return;
  }
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const page = () => { let p = url.pathname; if (!/\.[a-z0-9]+$/i.test(p)) p = p.replace(/\/?$/, '/index.html'); return c.match(new URL(p, url).href); };
    const cached = () => c.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? page() : null));
    // الصور: من المحفوظ الأول (مش بتتغير كتير)
    if (isAsset(url)) {
      const hit = await cached();
      if (hit) return hit;
      const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
    }
    // الصفحات والسكريبتات: أحدث نسخة من النت، ولو مفيش نت (أو بطيء) من المحفوظ
    try {
      const r = await timeout(fetch(req, { cache: 'no-cache' }), NET_TIMEOUT);
      if (r.ok) c.put(req, r.clone());
      return r;
    } catch (err) {
      // «…/arabic» من غير «/» في الآخر: نحوّلها لـ«…/arabic/» علشان مسارات الملفات تشتغل
      if (req.mode === 'navigate' && !/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith('/')) return Response.redirect(url.pathname + '/' + url.search, 302);
      const hit = await cached();
      if (hit) return hit;
      if (req.mode === 'navigate') return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;text-align:center;padding:40px" dir="rtl"><h2>📴 مفيش إنترنت</h2><p>الصفحة دي لسه ماتحفظتش على الجهاز. افتحيها مرة والنت شغال، وبعد كده هتشتغل من غير نت.</p></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      throw err;
    }
  })());
});
