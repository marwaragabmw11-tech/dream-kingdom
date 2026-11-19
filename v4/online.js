/* =====================================================================
   رحلة إلى مملكة الأحلام — اللعب الجماعي عبر الإنترنت (Firebase)
   - جهاز المضيف هو الحَكَم: يختار الأسئلة ويصحّح ويوزّع النقاط.
   - الإجابة الصحيحة لا تُرسل إلى قاعدة البيانات قبل لحظة الكشف.
   - قواعد الأمان (database.rules.json) تمنع اللاعبين من تعديل النقاط.
   ===================================================================== */
(function () {
  'use strict';

  /* ============ إعدادات Firebase — ضع هنا إعدادات مشروعك ============ */
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBNqR6lQo0iqJyQX4sq4iqw2RgN5nP4Yds",
    authDomain: "dream-kingdom-5fe4e.firebaseapp.com",
    databaseURL: "https://dream-kingdom-5fe4e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dream-kingdom-5fe4e",
    storageBucket: "dream-kingdom-5fe4e.firebasestorage.app",
    messagingSenderId: "388627209191",
    appId: "1:388627209191:web:a58075e0e426bb9f7f7b42"
  };
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  /* ================================================================== */

  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const LETTERS = ['أ', 'ب', 'ج', 'د'];
  const AV = ['🦊', '🐼', '🐯', '🐸', '🦉', '🐨', '🦁', '🐰', '🐻', '🐱', '🐵', '🦄', '🐧', '🐢', '🐬', '🦋'];
  const DECOS = [
    { id: 'tree', name: 'شجرة', emoji: '🌳', cost: 15 }, { id: 'flower', name: 'زهور', emoji: '🌸', cost: 15 },
    { id: 'rabbit', name: 'أرنب', emoji: '🐇', cost: 20 }, { id: 'fountain', name: 'نافورة', emoji: '⛲', cost: 35 },
    { id: 'horse', name: 'حصان', emoji: '🐴', cost: 60 }, { id: 'statue', name: 'تمثال', emoji: '🗿', cost: 80 }];
  const STATUS_AR = { lobby: 'غرفة الانتظار', question: 'سؤال', reveal: 'النتيجة', build: 'مرحلة البناء', end: 'انتهت اللعبة' };

  const qs = new URLSearchParams(location.search);
  const FAKE = (() => { try { return window.top !== window && window.top.__fakeDB || null; } catch (e) { return null; } })();
  const LSP = FAKE ? (window.name || 'f') + ':' : '';
  const LS = {
    get: k => { try { return localStorage.getItem('dko_' + LSP + k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem('dko_' + LSP + k, v); } catch (e) { } },
    del: k => { try { localStorage.removeItem('dko_' + LSP + k); } catch (e) { } }
  };
  const E = s => escapeHtml(s);
  const box = () => document.getElementById('onl');

  /* ------------------------- طبقة الاتصال ------------------------- */
  let api = null, apiPromise = null;
  function getApi() {
    if (api) return Promise.resolve(api);
    if (!apiPromise) apiPromise = (FAKE ? Promise.resolve(FAKE.connect(window.name)) : connectFirebase()).then(a => (api = a));
    return apiPromise;
  }
  async function connectFirebase() {
    const [A0, A, D] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-database.js')]);
    const app = A0.initializeApp(FIREBASE_CONFIG);
    const auth = A.getAuth(app);
    if (qs.get('fresh') === '1') await A.setPersistence(auth, A.inMemoryPersistence);
    if (auth.authStateReady) await auth.authStateReady();
    const user = auth.currentUser || (await A.signInAnonymously(auth)).user;
    const db = D.getDatabase(app);
    let off = 0; D.onValue(D.ref(db, '.info/serverTimeOffset'), s => { off = s.val() || 0; });
    const r = p => D.ref(db, p);
    return {
      uid: user.uid, TS: D.serverTimestamp(),
      get: async p => (await D.get(r(p))).val(),
      set: (p, v) => D.set(r(p), v),
      update: (p, v) => D.update(r(p), v),
      remove: p => D.remove(r(p)),
      push: async (p, v) => { const k = D.push(r(p)); await D.set(k, v); return k.key; },
      on: (p, cb) => D.onValue(r(p), s => cb(s.val()), e => console.warn('listen', p, e && e.message)),
      onAdd: (p, cb) => D.onChildAdded(r(p), s => cb(s.key, s.val())),
      claim: async (p, v) => (await D.runTransaction(r(p), cur => (cur === null ? v : undefined))).committed,
      now: () => Date.now() + off,
      presence: p => {
        const un = D.onValue(r('.info/connected'), s => {
          if (s.val() === true) { D.onDisconnect(r(p)).update({ online: false }).catch(() => { }); D.update(r(p), { online: true }).catch(() => { }); }
        });
        return () => { un(); D.onDisconnect(r(p)).cancel().catch(() => { }); };
      },
      onConn: cb => D.onValue(r('.info/connected'), s => cb(!!s.val()))
    };
  }

  /* ------------------------- الحالة المشتركة ------------------------- */
  const R = { role: null, code: null, meta: null, question: null, reveal: null, players: {}, kingdoms: {}, answers: {}, banned: {}, unsubs: [], connected: true, myAnswer: {}, chMap: {}, lastMsgAt: 0, presenceOff: null };
  const H = { current: null, finishedKey: null, chain: Promise.resolve(), ansUnsub: null, pendingCh: {}, kLoaded: false, starting: false };
  const P = x => `rooms/${R.code}/${x}`;

  function blankK() { return { gold: 100, gems: 2, stars: 0, score: 0, crops: 10, knowledge: {}, buildings: {}, regions: [0], decos: [], correct: 0, wrong: 0, steps: 0, streak: 0, fastest: 0 }; }
  function normK(k) {
    const o = Object.assign(blankK(), k || {});
    o.knowledge = o.knowledge || {}; o.buildings = o.buildings || {};
    o.regions = Array.isArray(o.regions) ? o.regions.filter(x => x !== null && x !== undefined) : Object.values(o.regions || { 0: 0 });
    o.decos = Array.isArray(o.decos) ? o.decos.filter(Boolean) : Object.values(o.decos || {});
    return o;
  }
  function toast2(msg) { if (typeof toast === 'function') toast(msg); }
  function vib(p) { try { if (LS.get('vib') !== '0' && navigator.vibrate) navigator.vibrate(p); } catch (e) { } }
  function snd(f, d) { try { if (LS.get('snd') !== '0') { const s = state.soundEnabled; state.soundEnabled = true; tone(f, d); state.soundEnabled = s; } } catch (e) { } }
  function playerList() {
    return Object.entries(R.players || {}).map(([uid, p]) => ({ uid, ...p, k: normK((R.kingdoms || {})[uid]) }));
  }
  function ranking() { return playerList().sort((a, b) => b.k.score - a.k.score || b.k.correct - a.k.correct); }
  function remainMs() {
    if (!R.question) return 0;
    if (R.meta && R.meta.paused) return R.meta.pausedLeft || 0;
    return Math.max(0, (R.question.endsAt || 0) - api.now());
  }
  function stopListeners() { R.unsubs.forEach(u => { try { u(); } catch (e) { } }); R.unsubs = []; if (H.ansUnsub) { try { H.ansUnsub(); } catch (e) { } H.ansUnsub = null; } if (R.presenceOff) { R.presenceOff(); R.presenceOff = null; } }
  function linkFor(kind) { return location.origin + location.pathname + '?' + kind + '=' + R.code; }

  /* ------------------------- أدوات العرض ------------------------- */
  function boardHtml(limit) {
    const rows = ranking().slice(0, limit || 100);
    if (!rows.length) return '<p class="small">لا يوجد لاعبون بعد.</p>';
    return `<table class="oBoard"><thead><tr><th>#</th><th>اللاعب</th><th>النقاط</th><th>🪙</th><th>⭐</th><th>✔️</th></tr></thead><tbody>${rows.map((x, i) => `<tr class="${x.uid === (api && api.uid) ? 'me' : ''}"><td>${['🥇', '🥈', '🥉'][i] || i + 1}</td><td>${E(x.avatar || '🙂')} ${E(x.name)}${x.online === false ? ' <small>(غير متصل)</small>' : ''}</td><td>${x.k.score}</td><td>${x.k.gold}</td><td>${x.k.stars}</td><td>${x.k.correct}</td></tr>`).join('')}</tbody></table>`;
  }
  function chipsHtml(highlight) {
    const ps = playerList();
    if (!ps.length) return '<p class="small">بانتظار انضمام اللاعبين…</p>';
    return `<div class="oChips">${ps.map(p => `<span class="oChip ${p.online === false ? 'off' : ''} ${highlight && highlight[p.uid] ? 'done' : ''}">${E(p.avatar || '🙂')} ${E(p.name)}${p.online === false ? ' ⚪' : ' 🟢'}</span>`).join('')}</div>`;
  }
  function optionsHtml(q, opts) {
    const o = opts || {};
    return `<div class="oAnswers ${q.o.length === 2 ? 'two' : ''}">${q.o.map((t, i) => {
      let cls = 'oAns';
      if (o.correct === i) cls += ' correct'; else if (o.correct !== undefined && o.mine === i) cls += ' wrong';
      if (o.mine === i) cls += ' mine';
      const cnt = o.dist ? `<span class="oCnt">${o.dist[i] || 0}</span>` : '';
      return o.clickable ? `<button class="${cls}" data-oa="answer" data-i="${i}" ${o.disabled ? 'disabled' : ''}><b>${LETTERS[i]}</b> ${E(t)}</button>` : `<div class="${cls}"><b>${LETTERS[i]}</b> ${E(t)}${cnt}</div>`;
    }).join('')}</div>`;
  }
  function qHeader() {
    const m = R.meta || {}, q = R.question || {};
    return `<div class="oQHead"><span class="badge">الجولة ${m.round || 1} من ${m.roundLimit || 1}</span><span class="badge">سؤال ${m.roundQ || 0} من ${m.qPer || 0}</span><span class="badge">${E(q.c || '')} · ${E(q.d || '')}</span>${q.golden ? '<span class="badge gold">⭐ سؤال ذهبي</span>' : ''}${m.paused ? '<span class="badge">⏸️ متوقف مؤقتًا</span>' : ''}</div>`;
  }
  function timerHtml() { return `<div class="oTimer" id="oTimer">⏳ ${Math.ceil(remainMs() / 1000)}</div>`; }

  /* ========================== الشاشة الرئيسية ========================== */
  function renderHome(msg) {
    R.role = null; setTimeout(renderBar, 0);
    const hostCode = LS.get('host'), pl = parseJ(LS.get('player'));
    box().innerHTML = `
      ${msg ? `<div class="notice error">${E(msg)}</div>` : ''}
      <div class="grid">
        <div class="panel oCard"><h2>👑 أنا المضيف</h2><p>أنشئ غرفة وشارك كودها، واعرض الأسئلة على شاشة كبيرة.</p>
          <div class="grid">
            <label>عدد الجولات<input id="oRounds" type="number" min="1" max="20" value="3"></label>
            <label>أسئلة كل جولة<input id="oQper" type="number" min="1" max="30" value="5"></label>
            <label>وقت السؤال (ثانية)<input id="oQtime" type="number" min="5" max="120" value="20"></label>
            <label>الصعوبة<select id="oDiff"><option value="مختلط">مختلط</option><option>سهل</option><option>متوسط</option><option>صعب</option></select></label>
          </div>
          <details><summary><b>الفئات</b> (كلها مختارة)</summary><div class="oCats">${CATS.map(c => `<label><input type="checkbox" class="oCat" value="${E(c)}" checked style="width:auto"> ${E(c)}</label>`).join('')}</div></details>
          <div class="row">
            <label><input id="oLate" type="checkbox" checked style="width:auto"> السماح بالانضمام بعد البدء</label>
            <label><input id="oSpeed" type="checkbox" checked style="width:auto"> مكافأة السرعة</label>
            <label><input id="oGolden" type="checkbox" checked style="width:auto"> أسئلة ذهبية</label>
            <label><input id="oCh" type="checkbox" checked style="width:auto"> أحكام مرحة عند الخطأ</label>
          </div>
          <button class="primary" data-oa="create">✨ إنشاء غرفة جديدة</button>
          ${hostCode ? `<button data-oa="resumeHost">↩️ متابعة غرفتي ${E(hostCode)}</button>` : ''}
        </div>
        <div class="panel oCard"><h2>🎮 أنا لاعب</h2><p>اكتب كود الغرفة الذي أرسله المضيف.</p>
          <label>كود الغرفة<input id="oCode" maxlength="6" autocomplete="off" style="text-transform:uppercase;letter-spacing:4px;font-size:22px;text-align:center" value="${E((qs.get('room') || (pl && pl.code) || '').toUpperCase())}"></label>
          <label>اسمك<input id="oName" maxlength="20" value="${E((pl && pl.name) || '')}"></label>
          <div class="oAvPick">${AV.map((a, i) => `<button class="oAv ${((pl && pl.avatar) || AV[0]) === a ? 'sel' : ''}" data-oa="pickAv" data-a="${a}">${a}</button>`).join('')}</div>
          <button class="primary" data-oa="join">🚀 دخول الغرفة</button>
        </div>
        <div class="panel oCard"><h2>📺 شاشة العرض</h2><p>لعرض الأسئلة والترتيب على تلفاز أو حاسوب.</p>
          <label>كود الغرفة<input id="oDispCode" maxlength="6" style="text-transform:uppercase;letter-spacing:4px;text-align:center"></label>
          <button data-oa="display">فتح شاشة العرض</button>
        </div>
      </div>`;
  }
  function parseJ(s) { try { return JSON.parse(s); } catch (e) { return null; } }

  /* ============================== المضيف ============================== */
  async function createRoom() {
    const cats = [...document.querySelectorAll('.oCat:checked')].map(x => x.value);
    if (!cats.length) return toast2('اختر فئة واحدة على الأقل.');
    const settings = {
      rounds: clamp(+$('oRounds').value, 1, 20, 3), qPer: clamp(+$('oQper').value, 1, 30, 5), qtime: clamp(+$('oQtime').value, 5, 120, 20),
      diff: $('oDiff').value, cats, late: $('oLate').checked, speed: $('oSpeed').checked, golden: $('oGolden').checked, ch: $('oCh').checked
    };
    box().innerHTML = '<div class="panel">⏳ جارٍ إنشاء الغرفة…</div>';
    const a = await getApi();
    cleanupOldRooms().catch(() => { });
    const old = LS.get('host'); if (old) { a.remove('rooms/' + old).catch(() => { }); a.remove('roomsIndex/' + old).catch(() => { }); }
    let code = null;
    for (let i = 0; i < 25 && !code; i++) {
      const c = Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
      try { if (await a.claim('rooms/' + c + '/host', a.uid)) code = c; } catch (e) { console.warn(e); }
    }
    if (!code) return renderHome('تعذّر إنشاء الغرفة. تحقق من الاتصال بالإنترنت ومن قواعد Firebase.');
    R.code = code;
    await a.set(P('meta'), { status: 'lobby', round: 1, roundLimit: settings.rounds, qPer: settings.qPer, qtime: settings.qtime, roundQ: 0, qNum: 0, qKey: '', allowJoin: true, paused: false, settings, used: [], lastActive: a.TS, createdAt: a.TS });
    await a.set('roomsIndex/' + code, a.TS).catch(() => { });
    LS.set('host', code); LS.del('hostCur');
    attachHost();
  }
  function clamp(v, lo, hi, d) { v = Math.round(v); return isFinite(v) && v >= lo ? Math.min(hi, v) : d; }
  async function cleanupOldRooms() {
    const a = await getApi(); const idx = await a.get('roomsIndex') || {}; const limit = a.now() - 86400000;
    for (const [c, t] of Object.entries(idx)) if (typeof t === 'number' && t < limit) { await a.remove('rooms/' + c).catch(() => { }); await a.remove('roomsIndex/' + c).catch(() => { }); }
  }
  async function resumeHost() {
    const a = await getApi(); const code = LS.get('host');
    const host = code && await a.get('rooms/' + code + '/host').catch(() => null);
    if (host !== a.uid) { LS.del('host'); return renderHome('لم تعد الغرفة متاحة. أنشئ غرفة جديدة.'); }
    R.code = code; H.current = parseJ(LS.get('hostCur')); attachHost();
  }
  function attachHost() {
    stopListeners(); R.role = 'host'; document.body.classList.add('onlineMode');
    H.kLoaded = false; H.finishedKey = null; H.pendingCh = {};
    R.unsubs.push(api.on(P('meta'), m => {
      if (!m) { LS.del('host'); stopListeners(); return renderHome('أُغلقت الغرفة.'); }
      const prevKey = R.meta && R.meta.qKey; R.meta = m;
      if (m.status === 'question' && (m.qKey !== prevKey || !H.ansUnsub)) listenAnswers(m.qKey);
      renderHost();
    }));
    R.unsubs.push(api.on(P('players'), v => { R.players = v || {}; ensureKingdoms(); checkAllAnswered(); renderHost(); }));
    R.unsubs.push(api.on(P('kingdoms'), v => { R.kingdoms = v || {}; H.kLoaded = true; ensureKingdoms(); renderHost(); }));
    R.unsubs.push(api.on(P('question'), v => { R.question = v; renderHost(); }));
    R.unsubs.push(api.on(P('reveal'), v => { R.reveal = v; renderHost(); }));
    R.unsubs.push(api.onAdd(P('requests'), (key, req) => { H.chain = H.chain.then(() => processRequest(key, req)).catch(e => console.warn(e)); }));
    R.unsubs.push(api.onConn(c => { R.connected = c; renderBar(); }));
  }
  function ensureKingdoms() {
    if (!H.kLoaded) return;
    const up = {};
    Object.keys(R.players || {}).forEach(uid => { if (!R.kingdoms[uid]) { R.kingdoms[uid] = blankK(); up['kingdoms/' + uid] = R.kingdoms[uid]; } });
    if (Object.keys(up).length) api.update('rooms/' + R.code, up).catch(e => console.warn(e));
  }
  function metaUp(o) { return api.update(P('meta'), Object.assign({ lastActive: api.TS }, o)); }
  function pickQuestion() {
    const s = R.meta.settings || {}; const used = new Set(R.meta.used || []);
    const ok = q => (s.cats || CATS).includes(q.cat) && (s.diff === 'مختلط' || !s.diff || q.diff === s.diff) && Array.isArray(q.opts) && q.opts.length >= 2;
    let pool = state.questions.filter(q => ok(q) && !used.has(q.id)), reset = false;
    if (!pool.length) { pool = state.questions.filter(ok); reset = true; }
    if (!pool.length) pool = state.questions.slice();
    return { q: pool[Math.floor(Math.random() * pool.length)], reset };
  }
  async function startQuestion(round, roundQ) {
    if (H.starting) return; H.starting = true;
    try {
      const m = R.meta, s = m.settings || {};
      const { q, reset } = pickQuestion();
      const order = q.opts.map((_, i) => i);
      if (q.t !== 'tf') for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[order[i], order[j]] = [order[j], order[i]]; }
      const opts = order.map(i => q.opts[i]), correct = order.indexOf(q.correct);
      const qNum = (m.qNum || 0) + 1, qKey = 'q' + qNum, golden = !!s.golden && Math.random() < 0.12;
      const endsAt = api.now() + m.qtime * 1000 + 1500;
      H.current = { id: q.id, qKey, correct, exp: q.exp || '', cat: q.cat, diff: q.diff, golden, endsAt, qtime: m.qtime };
      LS.set('hostCur', JSON.stringify(H.current)); H.finishedKey = null;
      const used = reset ? [q.id] : (m.used || []).concat(q.id);
      await api.set(P('question'), { qKey, q: q.q, o: opts, t: q.t || 'mcq', c: q.cat, d: q.diff, golden, endsAt, qtime: m.qtime });
      await api.set(P('reveal'), null);
      await metaUp({ status: 'question', qKey, qNum, round, roundQ, used, paused: false, pausedLeft: 0 });
      api.set('roomsIndex/' + R.code, api.TS).catch(() => { });
    } finally { H.starting = false; }
  }
  function listenAnswers(qKey) {
    if (H.ansUnsub) { try { H.ansUnsub(); } catch (e) { } }
    R.answers = {};
    H.ansUnsub = api.on(P('answers/' + qKey), v => { R.answers = v || {}; checkAllAnswered(); renderHost(); });
  }
  function checkAllAnswered() {
    if (R.role !== 'host' || !R.meta || R.meta.status !== 'question' || R.meta.paused) return;
    const online = Object.entries(R.players || {}).filter(([, p]) => p.online !== false).map(([u]) => u);
    if (online.length && online.every(u => R.answers[u])) setTimeout(() => finishQuestion(), 700);
  }
  function recoverCurrent() {
    const q = R.question, m = R.meta; if (!q || !m) return null;
    if (H.current && H.current.qKey === q.qKey) return H.current;
    const bq = state.questions.find(x => x.q === q.q); if (!bq) return null;
    H.current = { id: bq.id, qKey: q.qKey, correct: q.o.indexOf(bq.opts[bq.correct]), exp: bq.exp || '', cat: q.c, diff: q.d, golden: !!q.golden, endsAt: q.endsAt, qtime: q.qtime || m.qtime };
    LS.set('hostCur', JSON.stringify(H.current)); return H.current;
  }
  async function finishQuestion() {
    const c = recoverCurrent(), m = R.meta;
    if (!c || !m || m.status !== 'question' || m.qKey !== c.qKey || H.finishedKey === c.qKey) return;
    H.finishedKey = c.qKey;
    const s = m.settings || {};
    const base = c.diff === 'سهل' ? state.rewards.easy : c.diff === 'صعب' ? state.rewards.hard : state.rewards.med;
    const kn = c.diff === 'سهل' ? 1 : c.diff === 'صعب' ? 3 : 2;
    const ans = Object.assign({}, R.answers), results = {}, dist = [0, 0, 0, 0];
    const startAt = c.endsAt - c.qtime * 1000 - 1500;
    const corrects = Object.entries(ans).filter(([u, a]) => R.players[u] && a.c === c.correct).sort((x, y) => x[1].at - y[1].at);
    const fastest = corrects.length ? corrects[0][0] : null;
    const up = {};
    Object.keys(R.players || {}).forEach(uid => {
      const a = ans[uid], k = normK(R.kingdoms[uid]);
      if (a && a.c >= 0 && a.c <= 3) dist[a.c]++;
      if (a && a.c === c.correct) {
        const frac = s.speed ? Math.max(0, Math.min(1, 1 - (a.at - startAt) / (c.qtime * 1000))) : 0;
        let reward = Math.round(base * (1 + 0.5 * frac)) * (c.golden ? (state.rewards.gold || 2) : 1);
        if (uid === fastest && s.speed) { reward += 5; k.fastest++; }
        k.gold += reward; k.score += reward; k.correct++; k.streak++;
        k.stars += c.diff === 'صعب' ? 2 : 1; k.steps += kn;
        k.knowledge[c.cat] = (k.knowledge[c.cat] || 0) + kn;
        if (k.streak > 0 && k.streak % 5 === 0) k.gems++;
        openRegions(k);
        results[uid] = { ok: true, reward, fast: uid === fastest && !!s.speed };
      } else {
        k.wrong++; k.streak = 0;
        results[uid] = { ok: false, none: !a };
      }
      R.kingdoms[uid] = k; up['kingdoms/' + uid] = k;
    });
    try {
      await api.update('rooms/' + R.code, up);
      await api.set(P('reveal'), { qKey: c.qKey, correct: c.correct, exp: c.exp, dist, results, fastest: fastest || '', golden: c.golden });
      await metaUp({ status: 'reveal', paused: false });
    } catch (e) { H.finishedKey = null; toast2('تعذّر حفظ النتيجة، أعد المحاولة.'); console.warn(e); }
  }
  function openRegions(k) {
    REGIONS.forEach((r, i) => { if (!k.regions.includes(i) && k.steps >= r[2] && (i < 6 || (k.buildings.palace || 0) > 0)) k.regions.push(i); });
  }
  async function processRequest(key, req) {
    if (R.role !== 'host' || !req) return;
    for (let i = 0; i < 20 && (!R.meta || !H.kLoaded); i++) await new Promise(r => setTimeout(r, 250));
    if (!R.meta) return;
    const uid = req.uid, k = normK(R.kingdoms[uid]);
    if (req.t === 'ch') { H.pendingCh[key] = req; renderHost(); return; }
    let msg = null, ok = false;
    if (!R.players[uid]) msg = null;
    else if (R.meta.status !== 'build') msg = 'البناء والشراء متاحان في مرحلة البناء فقط.';
    else if (req.t === 'b') {
      const b = BUILDINGS.find(x => x.id === req.id);
      if (b) {
        const lv = k.buildings[b.id] || 0, cost = b.cost * (lv + 1), need = b.know * (lv + 1), have = k.knowledge[b.cat] || 0;
        if (lv >= 5) msg = 'وصل المبنى إلى المستوى الأقصى.';
        else if (k.gold < cost) msg = `تحتاج ${cost} ذهب، ومعك ${k.gold}.`;
        else if (have < need) msg = `تحتاج ${need} معرفة في «${b.cat}»، ومعك ${have}.`;
        else {
          k.gold -= cost; k.buildings[b.id] = lv + 1;
          if (b.id === 'farm') k.crops += 5 * (lv + 1);
          if (b.id === 'treasury') k.gems += 1;
          openRegions(k); ok = true; msg = `🎉 تم ${lv ? 'تطوير' : 'بناء'} ${b.name} إلى المستوى ${lv + 1}!`;
        }
      }
    } else if (req.t === 'd') {
      const d = DECOS.find(x => x.id === req.id);
      if (d) { if (k.gold < d.cost) msg = 'ذهب غير كافٍ.'; else { k.gold -= d.cost; k.decos.push(d.emoji); ok = true; msg = `تمت إضافة ${d.name} إلى مملكتك.`; } }
    }
    if (msg) { k.msg = { text: msg, ok, at: api.TS }; R.kingdoms[uid] = k; await api.set(P('kingdoms/' + uid), k).catch(e => console.warn(e)); }
    await api.remove(P('requests/' + key)).catch(() => { });
  }
  async function decideChallenge(key, give) {
    const req = H.pendingCh[key]; delete H.pendingCh[key];
    if (req && give && R.players[req.uid]) {
      const k = normK(R.kingdoms[req.uid]); k.gold += 5; k.stars += 1; k.msg = { text: '🎭 أحسنت! منحك المضيف 5 ذهب ونجمة لتنفيذ الحكم.', ok: true, at: api.TS };
      R.kingdoms[req.uid] = k; await api.set(P('kingdoms/' + req.uid), k).catch(() => { });
    }
    await api.remove(P('requests/' + key)).catch(() => { });
    renderHost();
  }
  async function hostNext() {
    const m = R.meta; if (!m) return;
    if (m.status === 'lobby') {
      if (!Object.keys(R.players).length) return toast2('انتظر انضمام لاعب واحد على الأقل.');
      await metaUp({ allowJoin: !!(m.settings && m.settings.late) });
      return startQuestion(1, 1);
    }
    if (m.status === 'question') return finishQuestion();
    if (m.status === 'reveal') {
      if ((m.roundQ || 0) >= m.qPer) return metaUp({ status: 'build' });
      return startQuestion(m.round, (m.roundQ || 0) + 1);
    }
    if (m.status === 'build') {
      if ((m.round || 1) >= m.roundLimit) return metaUp({ status: 'end', allowJoin: false });
      return startQuestion((m.round || 1) + 1, 1);
    }
  }
  async function hostPause() {
    const m = R.meta; if (!m || m.status !== 'question') return;
    if (!m.paused) return metaUp({ paused: true, pausedLeft: Math.max(0, R.question.endsAt - api.now()) });
    const endsAt = api.now() + (m.pausedLeft || 0);
    if (H.current) { H.current.endsAt = endsAt + 0; LS.set('hostCur', JSON.stringify(H.current)); }
    await api.update(P('question'), { endsAt });
    await metaUp({ paused: false, pausedLeft: 0 });
  }
  async function kick(uid) {
    const p = R.players[uid]; if (!p || !confirm('إخراج ' + p.name + ' من الغرفة؟ لن يستطيع العودة إليها.')) return;
    await api.update('rooms/' + R.code, { ['players/' + uid]: null, ['banned/' + uid]: true }).catch(e => toast2('تعذّر الإخراج.'));
  }
  async function closeRoom() {
    if (!confirm('إغلاق الغرفة نهائيًا وحذف بياناتها؟')) return;
    const code = R.code; stopListeners();
    await api.remove('rooms/' + code).catch(() => { }); await api.remove('roomsIndex/' + code).catch(() => { });
    LS.del('host'); LS.del('hostCur'); document.body.classList.remove('onlineMode'); renderHome();
  }

  function renderHost() {
    if (R.role !== 'host' || !R.meta) return;
    const m = R.meta, q = R.question, rv = R.reveal, ps = playerList();
    const answered = R.answers || {}, nAns = Object.keys(answered).filter(u => R.players[u]).length;
    let main = '', ctrl = '';
    if (m.status === 'lobby') {
      main = `<div class="oBig">كود الغرفة<div class="oCode">${E(R.code)}</div></div>
        <div class="row oShare"><input readonly value="${E(linkFor('room'))}" onclick="this.select()"><button data-oa="copy">📋 نسخ الرابط</button><a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('تعالوا نلعب «رحلة إلى مملكة الأحلام» 🌙\nادخلوا من هنا: ' + linkFor('room') + '\nكود الغرفة: ' + R.code)}">💬 واتساب</a></div>
        <p class="small">شاشة العرض للتلفاز: <a href="${E(linkFor('display'))}" target="_blank" rel="noopener">${E(linkFor('display'))}</a></p>
        <h3>اللاعبون (${ps.length})</h3>${chipsHtml()}`;
      ctrl = `<button class="primary" data-oa="next" ${ps.length ? '' : 'disabled'}>🚀 ابدأ اللعبة</button>`;
    } else if (m.status === 'question' && q) {
      main = `${qHeader()}<div class="oQ">${E(q.q)}</div>${optionsHtml(q)}${timerHtml()}
        <p><b>أجاب ${nAns} من ${ps.filter(p => p.online !== false).length}</b> (المتصلون)</p>${chipsHtml(answered)}
        <p class="small"><button data-oa="peek">${H.peek ? '🙈 إخفاء الإجابة' : '👁️ إظهار الإجابة لي'}</button> ${H.peek ? `الإجابة الصحيحة: <b>${(c0 => c0 ? LETTERS[c0.correct] + ' · ' + E(q.o[c0.correct]) : '—')(recoverCurrent())}</b>` : '<span>(أخفِها إن كانت شاشتك معروضة للاعبين)</span>'}</p>`;
      ctrl = `<button class="primary" data-oa="next">✨ كشف الإجابة الآن</button><button data-oa="pause">${m.paused ? '▶️ استئناف' : '⏸️ إيقاف مؤقت'}</button>`;
    } else if (m.status === 'reveal' && q && rv) {
      const winners = Object.entries(rv.results || {}).filter(([, r]) => r.ok).map(([u, r]) => `<span class="oChip done">${E((R.players[u] || {}).avatar || '')} ${E((R.players[u] || {}).name || '؟')} +${r.reward}${r.fast ? ' ⚡' : ''}</span>`).join('');
      const pend = Object.entries(H.pendingCh).map(([key, r]) => `<div class="row"><span>🎭 ${E((R.players[r.uid] || {}).name || '؟')} يقول إنه نفّذ الحكم</span><button class="good" data-oa="chYes" data-k="${key}">✅ +5 ذهب</button><button data-oa="chNo" data-k="${key}">✖</button></div>`).join('');
      main = `${qHeader()}<div class="oQ">${E(q.q)}</div>${optionsHtml(q, { correct: rv.correct, dist: rv.dist })}
        ${rv.exp ? `<div class="notice">💡 ${E(rv.exp)}</div>` : ''}
        <h3>أصابوا الإجابة</h3>${winners ? `<div class="oChips">${winners}</div>` : '<p>لم يُصب أحد هذه المرة 🌧️</p>'}
        ${pend ? `<div class="panel"><h3>أحكام بانتظار موافقتك</h3>${pend}</div>` : ''}
        <h3>الترتيب</h3>${boardHtml(10)}`;
      ctrl = `<button class="primary" data-oa="next">${(m.roundQ || 0) >= m.qPer ? '🏗️ الانتقال إلى مرحلة البناء' : '➡️ السؤال التالي'}</button>`;
    } else if (m.status === 'build') {
      main = `<div class="oBig">🏗️ مرحلة البناء — الجولة ${m.round} من ${m.roundLimit}</div><p>يبني اللاعبون ممالكهم الآن من هواتفهم. اضغط زر المتابعة عندما ينتهون.</p>
        <table class="oBoard"><thead><tr><th>اللاعب</th><th>🪙</th><th>المباني</th><th>المناطق</th></tr></thead><tbody>${ps.map(p => `<tr><td>${E(p.avatar)} ${E(p.name)}</td><td>${p.k.gold}</td><td>${BUILDINGS.filter(b => p.k.buildings[b.id]).map(b => b.emoji + (p.k.buildings[b.id] > 1 ? '×' + p.k.buildings[b.id] : '')).join(' ') || '—'}</td><td>${p.k.regions.length}/7</td></tr>`).join('')}</tbody></table>`;
      ctrl = `<button class="primary" data-oa="next">${(m.round || 1) >= m.roundLimit ? '🏆 إنهاء اللعبة وإعلان النتائج' : '🚀 بدء الجولة التالية'}</button>`;
    } else if (m.status === 'end') {
      const w = ranking()[0];
      main = `<div class="oBig">🎉 انتهت الرحلة!</div>${w ? `<div class="oWinner">🏆 الفائز: ${E(w.avatar)} ${E(w.name)} — ${w.k.score} نقطة</div>` : ''}${boardHtml()}`;
      ctrl = `<button class="primary" data-oa="close">🆕 إغلاق الغرفة وبدء لعبة جديدة</button>`;
    } else main = '<div class="panel">⏳ جارٍ التحميل…</div>';
    const manage = `<details class="panel"><summary><b>⚙️ إدارة الغرفة</b> — ${E(R.code)} · ${STATUS_AR[m.status] || ''}</summary>
      <div class="row"><button data-oa="toggleJoin">${m.allowJoin ? '🔓 الانضمام مفتوح (اضغط للإغلاق)' : '🔒 الانضمام مغلق (اضغط للفتح)'}</button>
      ${m.status !== 'lobby' && m.status !== 'end' ? '<button data-oa="redoRound">🔁 إعادة الجولة الحالية</button><button class="danger" data-oa="endNow">⏹ إنهاء اللعبة الآن</button>' : ''}
      <button class="danger" data-oa="close">🗑️ إغلاق الغرفة</button></div>
      <h4>اللاعبون</h4>${ps.map(p => `<div class="row"><span>${E(p.avatar)} ${E(p.name)} ${p.online === false ? '⚪ غير متصل' : '🟢 متصل'}</span><button class="danger" data-oa="kick" data-u="${E(p.uid)}">إخراج</button></div>`).join('') || '<p class="small">لا يوجد لاعبون.</p>'}
      <p class="small">رابط اللاعبين: ${E(linkFor('room'))}<br>رابط شاشة العرض: ${E(linkFor('display'))}</p></details>`;
    box().innerHTML = `<div class="panel oStage">${main}<div class="oCtrl">${ctrl}</div></div>${manage}`;
    renderBar();
  }

  /* ============================== اللاعب ============================== */
  async function joinRoom(codeIn, name, avatar, silent) {
    const code = (codeIn || '').trim().toUpperCase();
    if (code.length !== 6) return silent ? renderHome() : toast2('كود الغرفة من 6 خانات.');
    name = (name || '').trim().slice(0, 20); if (!name) return toast2('اكتب اسمك أولًا.');
    box().innerHTML = '<div class="panel">⏳ جارٍ الدخول…</div>';
    const a = await getApi();
    const host = await a.get('rooms/' + code + '/host').catch(() => null);
    if (!host) { LS.del('player'); return renderHome('لم نجد غرفة بهذا الكود. تأكد من الكود.'); }
    if (host === a.uid) { return renderHome('هذا الجهاز هو مضيف الغرفة. افتح الرابط من جهاز آخر للعب.'); }
    const banned = await a.get('rooms/' + code + '/banned/' + a.uid).catch(() => null);
    if (banned) { LS.del('player'); return renderHome('لا يمكنك دخول هذه الغرفة.'); }
    const mine = await a.get('rooms/' + code + '/players/' + a.uid).catch(() => null);
    try { await a.update('rooms/' + code + '/players/' + a.uid, { name, avatar: avatar || AV[0], online: true, joinedAt: mine && mine.joinedAt || a.TS }); }
    catch (e) { const m = await a.get('rooms/' + code + '/meta').catch(() => null); return renderHome(m && !m.allowJoin ? 'بدأت اللعبة وأغلق المضيف باب الانضمام. اطلب منه فتحه.' : 'تعذّر الدخول إلى الغرفة.'); }
    R.code = code; LS.set('player', JSON.stringify({ code, name, avatar }));
    attachPlayer();
  }
  function attachPlayer() {
    stopListeners(); R.role = 'player'; document.body.classList.add('onlineMode'); R.lastMsgAt = 0; let first = true, joined = false;
    R.presenceOff = api.presence(P('players/' + api.uid));
    R.unsubs.push(api.on(P('meta'), m => {
      if (!m) { stopListeners(); LS.del('player'); document.body.classList.remove('onlineMode'); return renderHome('أغلق المضيف الغرفة. شكرًا للعب! 🌙'); }
      const prev = R.meta; R.meta = m;
      if (prev && prev.status !== m.status && m.status === 'build') { snd(523, 150); vib(80); }
      renderPlayer();
    }));
    R.unsubs.push(api.on(P('question'), v => {
      const nk = v && v.qKey; const ok = R.question && R.question.qKey; R.question = v;
      if (nk && nk !== ok) { snd(660, 120); vib(40); api.get(P('answers/' + nk + '/' + api.uid)).then(a => { if (a) { R.myAnswer[nk] = a.c; renderPlayer(); } }).catch(() => { }); }
      renderPlayer();
    }));
    R.unsubs.push(api.on(P('reveal'), v => {
      const was = R.reveal && R.reveal.qKey; R.reveal = v;
      if (v && v.qKey !== was) { const r = (v.results || {})[api.uid]; if (r) { if (r.ok) { snd(880, 220); vib([60, 40, 60]); } else { snd(220, 220); vib(200); } } }
      renderPlayer();
    }));
    R.unsubs.push(api.on(P('players'), v => {
      R.players = v || {};
      if (R.players[api.uid]) joined = true;
      else if (joined) { stopListeners(); LS.del('player'); document.body.classList.remove('onlineMode'); return renderHome('أخرجك المضيف من الغرفة.'); }
      renderPlayer();
    }));
    R.unsubs.push(api.on(P('kingdoms'), v => {
      R.kingdoms = v || {}; const k = R.kingdoms[api.uid];
      if (k && k.msg && k.msg.at) { if (first) R.lastMsgAt = k.msg.at; else if (k.msg.at > R.lastMsgAt) { R.lastMsgAt = k.msg.at; toast2(k.msg.text); vib(k.msg.ok ? 50 : [30, 30, 30]); if (k.msg.ok) snd(700, 160); } }
      first = false; renderPlayer();
    }));
    R.unsubs.push(api.onConn(c => { R.connected = c; renderBar(); }));
  }
  async function sendAnswer(i) {
    const q = R.question, m = R.meta; if (!q || !m || m.status !== 'question' || m.paused) return;
    if (R.myAnswer[q.qKey] !== undefined) return;
    if (remainMs() <= 0) return toast2('انتهى الوقت ⏰');
    R.myAnswer[q.qKey] = i; renderPlayer();
    try { await api.set(P('answers/' + q.qKey + '/' + api.uid), { c: i, at: api.TS }); vib(30); }
    catch (e) {
      const ex = await api.get(P('answers/' + q.qKey + '/' + api.uid)).catch(() => null);
      if (ex) R.myAnswer[q.qKey] = ex.c; else { delete R.myAnswer[q.qKey]; toast2('لم تُسجَّل الإجابة (انتهى الوقت أو انقطع الاتصال).'); }
      renderPlayer();
    }
  }
  function kingdomHtml(k, canBuild) {
    const wallet = [['🪙', 'الذهب', k.gold], ['💎', 'الجواهر', k.gems], ['⭐', 'النجوم', k.stars], ['🌾', 'المحاصيل', k.crops], ['📚', 'المعرفة', Object.values(k.knowledge).reduce((a, b) => a + b, 0)]];
    const scene = BUILDINGS.filter(b => k.buildings[b.id]).map(b => `<div class="sceneItem"><span class="emoji">${b.emoji}${'✨'.repeat(k.buildings[b.id] - 1)}</span>${b.name}<small>المستوى ${k.buildings[b.id]}</small></div>`).join('') + k.decos.map(d => `<div class="sceneItem"><span class="emoji">${d}</span></div>`).join('');
    const regions = REGIONS.map((r, i) => `<span class="oRegion ${k.regions.includes(i) ? 'open' : ''}" title="${r[0]}">${r[1]} ${r[0]}${k.regions.includes(i) ? '' : ` <small>🔒 ${r[2]}${i === 6 ? ' + القصر' : ''}</small>`}</span>`).join('');
    const blds = BUILDINGS.map(b => {
      const lv = k.buildings[b.id] || 0, cost = b.cost * (lv + 1), need = b.know * (lv + 1), have = k.knowledge[b.cat] || 0;
      const can = canBuild && lv < 5 && k.gold >= cost && have >= need;
      return `<div class="building ${lv ? 'owned' : ''}"><div class="emoji">${b.emoji}</div><h4>${b.name}</h4><span class="badge">${lv}/5</span><p class="small">🪙 ${cost}${need ? ` · 📚 ${need} ${E(b.cat)} (معك ${have})` : ''}</p>${lv < 5 ? `<button data-oa="build" data-id="${b.id}" ${can ? '' : 'disabled'}>${lv ? 'تطوير' : 'بناء'}</button>` : '<span class="badge">مكتمل</span>'}</div>`;
    }).join('');
    const decos = DECOS.map(d => `<button data-oa="deco" data-id="${d.id}" ${canBuild && k.gold >= d.cost ? '' : 'disabled'}>${d.emoji} ${d.name} (${d.cost})</button>`).join('');
    return `<div class="grid oWallet">${wallet.map(x => `<div class="stat">${x[0]} ${x[1]}<strong>${x[2]}</strong></div>`).join('')}</div>
      <div class="kingdomScene">${scene || '<p>ابنِ أول مبنى في مملكتك!</p>'}</div>
      <h4>🗺️ مناطق المملكة (${k.regions.length}/7) — خطوات المعرفة: ${k.steps}</h4><div class="oRegions">${regions}</div>
      <h4>🏗️ المباني</h4><div class="buildings">${blds}</div><h4>🌸 الزينة</h4><div class="row">${decos}</div>`;
  }
  function renderPlayer() {
    if (R.role !== 'player' || !R.meta) { if (R.role === 'player') box().innerHTML = '<div class="panel">⏳ جارٍ التحميل…</div>'; return; }
    const m = R.meta, q = R.question, rv = R.reveal, me = R.players[api.uid] || {}, k = normK(R.kingdoms[api.uid]);
    let html = '';
    if (m.status === 'lobby') {
      html = `<div class="oBig">أهلًا ${E(me.avatar || '')} ${E(me.name || '')}!</div><p>انضممت إلى الغرفة <b>${E(R.code)}</b>. انتظر حتى يبدأ المضيف اللعبة…</p>${chipsHtml()}`;
    } else if (m.status === 'question' && q) {
      const mine = R.myAnswer[q.qKey], left = remainMs();
      html = `${qHeader()}<div class="oQ">${E(q.q)}</div>${timerHtml()}${optionsHtml(q, { clickable: true, mine, disabled: mine !== undefined || left <= 0 || m.paused })}
        <p class="oStatus">${mine !== undefined ? '✅ أُرسلت إجابتك. بانتظار الباقين…' : m.paused ? '⏸️ أوقف المضيف اللعبة مؤقتًا' : 'اختر إجابتك 👆'}</p>`;
    } else if (m.status === 'reveal' && q && rv) {
      const r = (rv.results || {})[api.uid] || { none: true }, mine = R.myAnswer[q.qKey];
      if (!R.chMap[q.qKey] && !r.ok && (m.settings || {}).ch !== false) R.chMap[q.qKey] = nextChallenge();
      html = `${qHeader()}<div class="oResult ${r.ok ? 'ok' : 'bad'}">${r.ok ? `🎉 إجابة صحيحة! +${r.reward} ذهب${r.fast ? ' ⚡ الأسرع!' : ''}${rv.golden ? ' ⭐ سؤال ذهبي' : ''}` : r.none ? '⏰ لم تُجب في الوقت' : '🌧️ ليست الإجابة الصحيحة'}</div>
        <div class="oQ small2">${E(q.q)}</div>${optionsHtml(q, { correct: rv.correct, mine })}${rv.exp ? `<div class="notice">💡 ${E(rv.exp)}</div>` : ''}
        ${R.chMap[q.qKey] ? `<div class="notice"><b>🎭 حكم مرح (اختياري):</b> ${E(R.chMap[q.qKey])}<div class="row"><button class="good" data-oa="chDone" data-q="${E(q.qKey)}">نفّذته! (يوافق المضيف)</button></div></div>` : ''}
        <h3>الترتيب</h3>${boardHtml(5)}<p class="small">بانتظار السؤال التالي…</p>`;
    } else if (m.status === 'build') {
      html = `<div class="oBig">🏗️ مرحلة البناء</div><p>ابنِ مملكتك قبل أن يبدأ المضيف الجولة التالية.</p>${kingdomHtml(k, true)}`;
    } else if (m.status === 'end') {
      const rk = ranking(), pos = rk.findIndex(x => x.uid === api.uid) + 1;
      html = `<div class="oBig">🎉 انتهت الرحلة!</div><div class="oWinner">ترتيبك: ${pos || '—'} من ${rk.length}</div>${boardHtml()}<h3>مملكتك</h3>${kingdomHtml(k, false)}<button data-oa="leave">🚪 خروج</button>`;
    } else html = '<div class="panel">⏳ بانتظار المضيف…</div>';
    box().innerHTML = `<div class="panel oStage">${html}</div>
      <details class="panel"><summary>🏰 مملكتي والترتيب</summary>${m.status !== 'build' ? kingdomHtml(k, false) : ''}${boardHtml()}</details>
      <div class="row"><button data-oa="toggleSnd">${LS.get('snd') === '0' ? '🔇 الصوت' : '🔊 الصوت'}</button><button data-oa="toggleVib">${LS.get('vib') === '0' ? '📴 الاهتزاز' : '📳 الاهتزاز'}</button><button class="danger" data-oa="leave">🚪 مغادرة الغرفة</button></div>`;
    renderBar();
  }

  /* ============================ شاشة العرض ============================ */
  async function attachDisplay(code) {
    code = (code || '').trim().toUpperCase(); if (code.length !== 6) return toast2('كود الغرفة من 6 خانات.');
    const a = await getApi(); R.code = code;
    if (!(await a.get(P('host')).catch(() => null))) return renderHome('لم نجد غرفة بهذا الكود.');
    stopListeners(); R.role = 'display'; document.body.classList.add('onlineMode', 'displayMode');
    let lastRv = null;
    R.unsubs.push(a.on(P('meta'), m => { if (!m) return renderHome('أُغلقت الغرفة.'); R.meta = m; renderDisplay(); }));
    R.unsubs.push(a.on(P('question'), v => { R.question = v; renderDisplay(); }));
    R.unsubs.push(a.on(P('reveal'), v => { R.reveal = v; if (v && v.qKey !== lastRv) { lastRv = v.qKey; snd(880, 200); if (typeof confettiBurst === 'function') confettiBurst(); } renderDisplay(); }));
    R.unsubs.push(a.on(P('players'), v => { R.players = v || {}; renderDisplay(); }));
    R.unsubs.push(a.on(P('kingdoms'), v => { R.kingdoms = v || {}; renderDisplay(); }));
    R.unsubs.push(a.on(P('answers'), v => { R.allAnswers = v || {}; renderDisplay(); }));
  }
  function renderDisplay() {
    if (R.role !== 'display' || !R.meta) return;
    const m = R.meta, q = R.question, rv = R.reveal;
    let html = '';
    if (m.status === 'lobby') html = `<div class="oBig">🌙 رحلة إلى مملكة الأحلام</div><div class="oBig">ادخلوا بالكود<div class="oCode">${E(R.code)}</div></div><p class="oLink">${E(linkFor('room'))}</p>${chipsHtml()}`;
    else if (m.status === 'question' && q) { const ans = (R.allAnswers || {})[q.qKey] || {}; html = `${qHeader()}<div class="oQ">${E(q.q)}</div>${optionsHtml(q)}${timerHtml()}<p>أجاب ${Object.keys(ans).length} من ${Object.keys(R.players).length}</p>${chipsHtml(ans)}`; }
    else if (m.status === 'reveal' && q && rv) html = `${qHeader()}<div class="oQ">${E(q.q)}</div>${optionsHtml(q, { correct: rv.correct, dist: rv.dist })}${rv.exp ? `<div class="notice">💡 ${E(rv.exp)}</div>` : ''}${boardHtml(8)}`;
    else if (m.status === 'build') html = `<div class="oBig">🏗️ مرحلة البناء</div><p>يبني اللاعبون ممالكهم الآن…</p>${boardHtml()}`;
    else if (m.status === 'end') { const w = ranking()[0]; html = `<div class="oBig">🎉 انتهت الرحلة!</div>${w ? `<div class="oWinner">🏆 ${E(w.avatar)} ${E(w.name)}</div>` : ''}${boardHtml()}`; }
    box().innerHTML = `<div class="oStage oDisplay">${html}<div class="oCtrl"><button data-oa="fs">⛶ ملء الشاشة</button></div></div>`;
  }

  /* ============================ شريط الحالة ============================ */
  function renderBar() {
    const b = document.getElementById('oBar'); if (!b) return;
    if (!R.role) { b.innerHTML = ''; return; }
    const me = R.role === 'player' ? R.players[api.uid] : null, k = me ? normK(R.kingdoms[api.uid]) : null;
    b.innerHTML = `${R.connected ? '' : '<span class="oWarn">⚠️ انقطع الاتصال — نحاول إعادة الاتصال…</span>'}
      <span>🌐 ${E(R.code || '')}</span>${me ? `<span>${E(me.avatar)} ${E(me.name)}</span><span>🪙 ${k.gold}</span><span>⭐ ${k.stars}</span><span>🏆 ${k.score}</span>` : `<span>${R.role === 'host' ? '👑 المضيف' : '📺 شاشة العرض'}</span>`}
      <button data-oa="exitOnline">↩️ اللعبة المحلية</button>`;
  }

  /* ============================ المؤقّت العام ============================ */
  setInterval(() => {
    if (!api || !R.role || !R.meta) return;
    const t = document.getElementById('oTimer');
    if (t && R.meta.status === 'question') { const s = Math.ceil(remainMs() / 1000); t.textContent = (R.meta.paused ? '⏸️ ' : '⏳ ') + s; t.classList.toggle('low', s <= 5); }
    if (R.role === 'player' && R.meta.status === 'question' && R.question && remainMs() <= 0 && !document.querySelector('.oAns[disabled]')) renderPlayer();
    if (R.role === 'host' && R.meta.status === 'question' && !R.meta.paused && R.question && R.question.qKey === R.meta.qKey && api.now() >= R.question.endsAt + 800) finishQuestion();
  }, 250);

  /* ============================ الأحداث ============================ */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-oa]'); if (!b) return;
    const act = b.dataset.oa;
    const run = f => Promise.resolve().then(f).catch(err => { console.warn(err); toast2('حدث خطأ في الاتصال: ' + (err && err.message || err)); });
    switch (act) {
      case 'create': return run(createRoom);
      case 'resumeHost': return run(resumeHost);
      case 'pickAv': document.querySelectorAll('.oAv').forEach(x => x.classList.toggle('sel', x === b)); return;
      case 'join': { const av = (document.querySelector('.oAv.sel') || {}).dataset; return run(() => joinRoom($('oCode').value, $('oName').value, av && av.a)); }
      case 'display': return run(() => attachDisplay($('oDispCode').value));
      case 'next': b.disabled = true; return run(hostNext);
      case 'pause': return run(hostPause);
      case 'peek': H.peek = !H.peek; return renderHost();
      case 'kick': return run(() => kick(b.dataset.u));
      case 'close': return run(closeRoom);
      case 'toggleJoin': return run(() => metaUp({ allowJoin: !R.meta.allowJoin }));
      case 'endNow': if (confirm('إنهاء اللعبة الآن وإعلان النتائج؟')) return run(() => metaUp({ status: 'end', allowJoin: false })); return;
      case 'redoRound': if (confirm('إعادة الجولة الحالية من سؤالها الأول؟ (تبقى النقاط المكتسبة)')) return run(() => startQuestion(R.meta.round || 1, 1)); return;
      case 'copy': try { navigator.clipboard.writeText(linkFor('room')); toast2('تم نسخ الرابط.'); } catch (err) { } return;
      case 'chYes': return run(() => decideChallenge(b.dataset.k, true));
      case 'chNo': return run(() => decideChallenge(b.dataset.k, false));
      case 'answer': return run(() => sendAnswer(+b.dataset.i));
      case 'build': b.disabled = true; return run(() => api.push(P('requests'), { uid: api.uid, t: 'b', id: b.dataset.id, at: api.TS }));
      case 'deco': b.disabled = true; return run(() => api.push(P('requests'), { uid: api.uid, t: 'd', id: b.dataset.id, at: api.TS }));
      case 'chDone': b.disabled = true; b.textContent = '⏳ بانتظار موافقة المضيف'; return run(() => api.push(P('requests'), { uid: api.uid, t: 'ch', q: b.dataset.q, at: api.TS }));
      case 'toggleSnd': LS.set('snd', LS.get('snd') === '0' ? '1' : '0'); return renderPlayer();
      case 'toggleVib': LS.set('vib', LS.get('vib') === '0' ? '1' : '0'); return renderPlayer();
      case 'leave': if (!confirm('مغادرة الغرفة؟ يمكنك العودة لاحقًا بالكود نفسه.')) return;
        return run(async () => { const code = R.code; if (R.presenceOff) { R.presenceOff(); R.presenceOff = null; } await api.update('rooms/' + code + '/players/' + api.uid, { online: false }).catch(() => { }); stopListeners(); document.body.classList.remove('onlineMode'); R.role = null; renderHome(); renderBar(); });
      case 'fs': { const el = document.documentElement; if (!document.fullscreenElement) el.requestFullscreen && el.requestFullscreen(); else document.exitFullscreen && document.exitFullscreen(); return; }
      case 'exitOnline': stopListeners(); R.role = null; document.body.classList.remove('onlineMode', 'displayMode'); renderBar(); renderHome(); if (typeof showScreen === 'function') showScreen('setup'); return;
    }
  });

  /* ============================ البدء ============================ */
  window.DKOnline = {
    open() { if (!R.role) renderHome(); },
    _state: R, _host: H
  };
  function boot() {
    if (!document.getElementById('onl')) return;
    const room = (qs.get('room') || '').toUpperCase(), disp = qs.get('display'), pl = parseJ(LS.get('player'));
    if (disp) { showScreen('online'); if (typeof enterGame === 'function') enterGame(); attachDisplay(disp).catch(e => renderHome('تعذّر الاتصال: ' + e.message)); return; }
    renderHome();
    if (room) {
      showScreen('online'); if (typeof enterGame === 'function') enterGame();
      if (pl && pl.code === room && pl.name) joinRoom(pl.code, pl.name, pl.avatar, true).catch(e => renderHome('تعذّر الاتصال: ' + e.message));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
