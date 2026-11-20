/* =====================================================================
   رحلة إلى مملكة الأحلام — اللعب الجماعي عبر الإنترنت (Firebase)
   - جهاز المضيف هو الحَكَم: يختار الأسئلة ويصحّح ويوزّع النقاط ويطبّق البطاقات.
   - الإجابة الصحيحة لا تُرسل إلى قاعدة البيانات قبل لحظة الكشف.
   - قواعد الأمان (database.rules.json) تمنع اللاعبين من تعديل النقاط والمخزون.
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
  const MODES = {
    solo: { icon: '🧑', name: 'كل لاعب ضد الجميع', desc: 'لكل لاعب مملكته ونقاطه.' },
    speed: { icon: '⚡', name: 'تحدي السرعة', desc: 'أول إجابة صحيحة تأخذ 15 ذهبًا إضافيًا.' },
    teams: { icon: '🛡️', name: 'فرق ضد فرق', desc: 'لكل فريق مملكة وخزينة مشتركة، ومكافأة الفريق متوسط مكافآت أعضائه.' },
    coop: { icon: '🤝', name: 'المملكة التعاونية', desc: 'الجميع يبني مملكة واحدة، والهدف بناء القصر العظيم معًا.' },
    survival: { icon: '❤️', name: 'وضع البقاء', desc: 'لكل لاعب عدد من الأرواح، والخطأ يُفقد روحًا. آخر من يبقى يفوز.' },
    tournament: { icon: '🏆', name: 'البطولة', desc: 'بعد كل جولة يخرج أصحاب أقل النقاط، ويتأهل الباقون.' }
  };
  const CARDS = {
    fifty: { emoji: '✂️', name: 'حذف خيارين', cost: 25, desc: 'يحذف خيارين خاطئين من سؤالك الحالي.' },
    double: { emoji: '✨', name: 'مضاعفة المكافأة', cost: 30, desc: 'يضاعف مكافأتك في السؤال الحالي إن أجبت صحيحًا.' },
    second: { emoji: '🔄', name: 'فرصة ثانية', cost: 35, desc: 'تختار إجابتين؛ إن صحّت الأولى فالمكافأة كاملة، وإن صحّت الثانية فنصفها.' },
    shield: { emoji: '🛡️', name: 'درع الحماية', cost: 30, desc: 'يعمل تلقائيًا مرة واحدة: يمنع خسارة روح أو نقاط، ويصدّ السرقة.' },
    steal: { emoji: '🦹', name: 'بطاقة السرقة', cost: 40, desc: 'في مرحلة البناء فقط: تأخذ 10% من ذهب منافس (20 بحد أقصى). الدرع يصدّها.' }
  };
  const TEAM_STYLE = [['الفريق الأحمر', '#e5534b', '🔴'], ['الفريق الأزرق', '#3b82f6', '🔵'], ['الفريق الأخضر', '#22a06b', '🟢'], ['الفريق الأصفر', '#d39e00', '🟡'], ['الفريق البنفسجي', '#8b5cf6', '🟣'], ['الفريق البرتقالي', '#f97316', '🟠']];
  const EVENTS = {
    treasure: '💰 ظهر كنز في المملكة! كل مملكة تحصل على 20 ذهبًا.',
    gift: '🎁 هدية ملكية',
    boost: '✨ الذهب مضاعف في الجولة القادمة!',
    urgent: '🏗️ مهمة بناء عاجلة: أول من يبني الآن يحصل على 25 ذهبًا إضافيًا!',
    group: '👨‍👩‍👧 تحدٍّ جماعي',
    secret: '🗝️ لغز سري: من يحلّه تُفتح له منطقة جديدة!'
  };
  const STATUS_AR = { lobby: 'غرفة الانتظار', question: 'سؤال', reveal: 'النتيجة', build: 'مرحلة البناء', end: 'انتهت اللعبة' };
  const TYPE_AR = { tf: 'صح أم خطأ', cmp: 'أكمل العبارة', who: 'من أنا؟', rid: 'لغز', ord: 'رتّب', num: 'إجابة رقمية', pic: 'خمّن من الصورة', err: 'اكتشف الخطأ', spd: '⚡ سؤال سرعة' };

  const qs = new URLSearchParams(location.search);
  const FAKE = (() => { try { return window.top !== window && window.top.__fakeDB || null; } catch (e) { return null; } })();
  const LSP = FAKE ? (window.name || 'f') + ':' : (qs.get('fresh') === '1' ? 'fresh' + Math.random().toString(36).slice(2, 8) + ':' : '');
  const LS = {
    get: k => { try { return localStorage.getItem('dko_' + LSP + k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem('dko_' + LSP + k, v); } catch (e) { } },
    del: k => { try { localStorage.removeItem('dko_' + LSP + k); } catch (e) { } }
  };
  const E = s => escapeHtml(s);
  const box = () => document.getElementById('onl');
  const CHS = window.DK_CHALLENGES || [];

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
  const R = { role: null, code: null, meta: null, question: null, reveal: null, players: {}, kingdoms: {}, stats: {}, teams: {}, answers: {}, allAnswers: {}, unsubs: [], qUnsubs: [], connected: true, myAnswer: {}, chMap: {}, sel: [], myHint: null, myUses: null, lastMsgAt: 0, presenceOff: null };
  const H = { uses: {}, current: null, finishedKey: null, chain: Promise.resolve(), ansUnsub: null, pendingCh: {}, loaded: {}, starting: false, peek: false };
  const P = x => `rooms/${R.code}/${x}`;
  let chDeck = [];

  function blankK() { return { gold: 100, gems: 2, stars: 0, score: 0, crops: 10, knowledge: {}, buildings: {}, regions: [0], decos: [], steps: 0 }; }
  function normK(k) {
    const o = Object.assign(blankK(), k || {});
    o.knowledge = o.knowledge || {}; o.buildings = o.buildings || {};
    o.regions = Array.isArray(o.regions) ? o.regions.filter(x => x !== null && x !== undefined) : Object.values(o.regions || { 0: 0 });
    o.decos = Array.isArray(o.decos) ? o.decos.filter(Boolean) : Object.values(o.decos || {});
    return o;
  }
  function blankS(lives) { return { score: 0, correct: 0, wrong: 0, streak: 0, fastest: 0, lives: lives || 0, out: false, ch: 0, cards: { fifty: 0, double: 0, second: 0, shield: 0, steal: 0 } }; }
  function normS(s) { const o = Object.assign(blankS(0), s || {}); o.cards = Object.assign({ fifty: 0, double: 0, second: 0, shield: 0, steal: 0 }, o.cards || {}); return o; }
  const S = () => (R.meta && R.meta.settings) || {};
  const mode = () => S().mode || 'solo';
  function ownerOf(uid) {
    if (mode() === 'teams') return ((R.teams || {}).map || {})[uid] || 't1';
    if (mode() === 'coop') return 'all';
    return uid;
  }
  function teamInfo(tid) { return (((R.teams || {}).list) || {})[tid] || { name: tid, color: '#888', emoji: '⚪' }; }
  function ownerName(o) { if (mode() === 'coop') return 'المملكة المشتركة'; if (mode() === 'teams') { const t = teamInfo(o); return t.emoji + ' ' + t.name; } const p = R.players[o]; return p ? (p.avatar || '') + ' ' + p.name : '؟'; }
  function toast2(msg) { if (typeof toast === 'function') toast(msg); }
  function vib(p) { try { if (LS.get('vib') !== '0' && navigator.vibrate) navigator.vibrate(p); } catch (e) { } }
  function snd(f, d) { try { if (LS.get('snd') !== '0') { const s = state.soundEnabled; state.soundEnabled = true; tone(f, d); state.soundEnabled = s; } } catch (e) { } }
  function playerList() {
    return Object.entries(R.players || {}).map(([uid, p]) => ({ uid, ...p, s: normS((R.stats || {})[uid]), k: normK((R.kingdoms || {})[ownerOf(uid)]) }));
  }
  function ranking() { return playerList().sort((a, b) => (a.s.out - b.s.out) || b.s.score - a.s.score || b.s.lives - a.s.lives || b.s.correct - a.s.correct); }
  function teamRanking() {
    const list = (R.teams || {}).list || {};
    return Object.keys(list).map(tid => ({ tid, t: list[tid], k: normK(R.kingdoms[tid]), members: playerList().filter(p => ownerOf(p.uid) === tid) })).sort((a, b) => b.k.score - a.k.score);
  }
  function canAnswer(uid) { const m = R.meta || {}; const s = normS(R.stats[uid]); return !s.out && (!m.only || !!m.only[uid]); }
  function remainMs() {
    if (!R.question) return 0;
    if (R.meta && R.meta.paused) return R.meta.pausedLeft || 0;
    return Math.max(0, (R.question.endsAt || 0) - api.now());
  }
  function stopQ() { R.qUnsubs.forEach(u => { try { u(); } catch (e) { } }); R.qUnsubs = []; }
  function stopListeners() { R.unsubs.forEach(u => { try { u(); } catch (e) { } }); R.unsubs = []; stopQ(); if (H.ansUnsub) { try { H.ansUnsub(); } catch (e) { } H.ansUnsub = null; } if (R.presenceOff) { R.presenceOff(); R.presenceOff = null; } }
  function linkFor(kind) { return location.origin + location.pathname + '?' + kind + '=' + R.code; }
  function nextCh() {
    if (!CHS.length) return { id: 'x', title: 'حكم مرح', text: typeof nextChallenge === 'function' ? String(nextChallenge().text || nextChallenge()) : 'قل معلومة جميلة تعرفها.', time: 20, reward: 5, lvl: 'سهل', cat: '' };
    if (!chDeck.length) { chDeck = CHS.map((_, i) => i); for (let i = chDeck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[chDeck[i], chDeck[j]] = [chDeck[j], chDeck[i]]; } }
    return CHS[chDeck.pop()];
  }
  function chHtml(c, extra) { return `<div class="oCh"><div class="oChHead"><b>🎭 ${E(c.title)}</b><span class="badge">${E(c.cat)} · ${E(c.lvl)}</span><span class="badge">⏱️ ${c.time} ث</span><span class="badge">🪙 +${c.reward}</span></div><p>${E(c.text)}</p>${extra || ''}</div>`; }

  /* ------------------------- أدوات العرض ------------------------- */
  function boardHtml(limit) {
    if (mode() === 'teams') {
      const tr = teamRanking();
      return `<table class="oBoard"><thead><tr><th>#</th><th>الفريق</th><th>النقاط</th><th>🪙</th><th>الأعضاء</th></tr></thead><tbody>${tr.map((x, i) => `<tr><td>${['🥇', '🥈', '🥉'][i] || i + 1}</td><td style="color:${E(x.t.color)}"><b>${E(x.t.emoji)} ${E(x.t.name)}</b></td><td>${x.k.score}</td><td>${x.k.gold}</td><td>${x.members.map(m => E(m.avatar)).join(' ')}</td></tr>`).join('')}</tbody></table>${limit && limit <= 5 ? '' : playersTable(limit)}`;
    }
    return playersTable(limit);
  }
  function playersTable(limit) {
    const rows = ranking().slice(0, limit || 100), surv = mode() === 'survival';
    if (!rows.length) return '<p class="small">لا يوجد لاعبون بعد.</p>';
    return `<table class="oBoard"><thead><tr><th>#</th><th>اللاعب</th><th>النقاط</th>${surv ? '<th>❤️</th>' : ''}<th>✔️</th>${mode() === 'coop' || mode() === 'teams' ? '' : '<th>🪙</th>'}</tr></thead><tbody>${rows.map((x, i) => `<tr class="${x.uid === (api && api.uid) ? 'me' : ''} ${x.s.out ? 'out' : ''}"><td>${x.s.out ? '🚫' : ['🥇', '🥈', '🥉'][i] || i + 1}</td><td>${E(x.avatar || '🙂')} ${E(x.name)}${x.online === false ? ' <small>(غير متصل)</small>' : ''}${x.s.out ? ' <small>(خرج)</small>' : ''}</td><td>${x.s.score}</td>${surv ? `<td>${'❤️'.repeat(Math.max(0, x.s.lives)) || '—'}</td>` : ''}<td>${x.s.correct}</td>${mode() === 'coop' || mode() === 'teams' ? '' : `<td>${x.k.gold}</td>`}</tr>`).join('')}</tbody></table>`;
  }
  function chipsHtml(highlight, onlyActive) {
    const ps = playerList().filter(p => !onlyActive || canAnswer(p.uid));
    if (!ps.length) return '<p class="small">بانتظار انضمام اللاعبين…</p>';
    return `<div class="oChips">${ps.map(p => `<span class="oChip ${p.online === false ? 'off' : ''} ${highlight && highlight[p.uid] ? 'done' : ''}" ${mode() === 'teams' ? `style="border-color:${E(teamInfo(ownerOf(p.uid)).color)}"` : ''}>${E(p.avatar || '🙂')} ${E(p.name)}${p.online === false ? ' ⚪' : ' 🟢'}${mode() === 'survival' && !p.s.out ? ' ' + '❤️'.repeat(Math.max(0, p.s.lives)) : ''}${p.s.out ? ' 🚫' : ''}</span>`).join('')}</div>`;
  }
  function picHtml(q) { if (!q || !q.p) return ''; return /^https?:\/\//.test(q.p) ? `<img class="qImg" src="${E(q.p)}" alt="صورة السؤال">` : `<div class="oPic" role="img" aria-label="صورة السؤال">${E(q.p)}</div>`; }
  function optionsHtml(q, opts) {
    const o = opts || {};
    if (q.t === 'num') {
      if (o.clickable) return `<div class="oNum"><input id="oNumIn" type="text" inputmode="decimal" autocomplete="off" placeholder="اكتب الرقم" ${o.disabled ? 'disabled' : ''} value="${o.mine !== undefined ? E(o.mine) : ''}"><button class="primary" data-oa="sendNum" ${o.disabled ? 'disabled' : ''}>إرسال</button></div>`;
      return `<div class="oNumAns">${o.num !== undefined ? `الإجابة الصحيحة: <b>${E(o.num)}</b>${o.mine !== undefined ? ` · إجابتك: ${E(o.mine)}` : ''}` : '🔢 اكتب الإجابة رقمًا على هاتفك'}</div>`;
    }
    const hidden = o.hidden || [], sel = o.sel || [];
    return `<div class="oAnswers ${q.o.length === 2 ? 'two' : ''} ${q.t === 'ord' ? 'ord' : ''}">${q.o.map((t, i) => {
      let cls = 'oAns';
      if (o.correct === i) cls += ' correct'; else if (o.correct !== undefined && (o.mine === i || o.mine2 === i)) cls += ' wrong';
      if (o.mine === i || o.mine2 === i || sel.includes(i)) cls += ' mine';
      if (hidden.includes(i)) cls += ' gone';
      const cnt = o.dist ? `<span class="oCnt">${o.dist[i] || 0}</span>` : '';
      return o.clickable ? `<button class="${cls}" data-oa="answer" data-i="${i}" ${o.disabled || hidden.includes(i) ? 'disabled' : ''}><b>${LETTERS[i]}</b> ${E(t)}</button>` : `<div class="${cls}"><b>${LETTERS[i]}</b> ${E(t)}${cnt}</div>`;
    }).join('')}</div>`;
  }
  function qHeader() {
    const m = R.meta || {}, q = R.question || {};
    const sp = q.special === 'duel' ? '<span class="badge gold">⚔️ تحدٍّ مباشر</span>' : q.special === 'tiebreak' ? '<span class="badge gold">⚖️ كسر التعادل</span>' : q.special === 'secret' ? '<span class="badge gold">🗝️ لغز سري</span>' : `<span class="badge">سؤال ${m.roundQ || 0} من ${m.qPer || 0}</span>`;
    return `<div class="oQHead"><span class="badge">${MODES[mode()].icon} ${MODES[mode()].name}</span><span class="badge">الجولة ${m.round || 1} من ${m.roundLimit || 1}</span>${sp}<span class="badge">${E(q.c || '')} · ${E(q.d || '')}</span>${TYPE_AR[q.t] ? `<span class="badge">${TYPE_AR[q.t]}</span>` : ''}${q.golden ? '<span class="badge gold">⭐ سؤال ذهبي ×2</span>' : ''}${q.legend ? '<span class="badge legend">🌟 سؤال أسطوري ×3</span>' : ''}${q.final ? '<span class="badge fire">🔥 الجولة النهائية ×2</span>' : ''}${q.boost ? '<span class="badge gold">✨ ذهب مضاعف</span>' : ''}${m.paused ? '<span class="badge">⏸️ متوقف مؤقتًا</span>' : ''}</div>`;
  }
  function eventHtml() { const ev = R.meta && R.meta.event; return ev && ev.text && R.meta.status !== 'question' ? `<div class="oEvent">${E(ev.text)}</div>` : ''; }
  function duelHtml() { const d = R.meta && R.meta.duel; if (!d) return ''; const a = R.players[d.a] || {}, b = R.players[d.b] || {}; return `<div class="oDuel">⚔️ ${E(a.avatar)} ${E(a.name)} <b>${(d.score || {})[d.a] || 0}</b> — <b>${(d.score || {})[d.b] || 0}</b> ${E(b.avatar)} ${E(b.name)} <small>(سؤال ${d.n || 0} من ${d.total})</small></div>`; }
  function timerHtml() { return `<div class="oTimer" id="oTimer">⏳ ${Math.ceil(remainMs() / 1000)}</div>`; }

  /* ========================== الشاشة الرئيسية ========================== */
  function renderHome(msg) {
    R.role = null; setTimeout(renderBar, 0);
    const hostCode = LS.get('host'), pl = parseJ(LS.get('player'));
    box().innerHTML = `
      ${msg ? `<div class="notice error">${E(msg)}</div>` : ''}
      <div class="grid">
        <div class="panel oCard"><h2>👑 أنا المضيف</h2><p>أنشئ غرفة وشارك كودها، واعرض الأسئلة على شاشة كبيرة.</p>
          <label>نمط اللعب<select id="oMode">${Object.entries(MODES).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('')}</select></label>
          <p class="small" id="oModeDesc">${MODES.solo.desc}</p>
          <div class="grid">
            <label class="oTeamsOpt hidden">عدد الفرق<input id="oTeams" type="number" min="2" max="6" value="2"></label>
            <label class="oLivesOpt hidden">عدد الأرواح<input id="oLives" type="number" min="1" max="5" value="3"></label>
            <label>عدد الجولات<input id="oRounds" type="number" min="1" max="20" value="3"></label>
            <label>أسئلة كل جولة<input id="oQper" type="number" min="1" max="30" value="5"></label>
            <label>وقت السؤال (ثانية)<input id="oQtime" type="number" min="5" max="120" value="20"></label>
            <label>الصعوبة<select id="oDiff"><option value="مختلط">مختلط</option><option>سهل</option><option>متوسط</option><option>صعب</option></select></label>
          </div>
          <details><summary><b>الفئات</b> (كلها مختارة)</summary><div class="oCats">${CATS.map(c => `<label><input type="checkbox" class="oCat" value="${E(c)}" checked style="width:auto"> ${E(c)}</label>`).join('')}</div></details>
          <details><summary><b>قواعد الفوز والإثارة</b></summary><div class="oCats">
            <label><input id="oLate" type="checkbox" checked style="width:auto"> السماح بالانضمام بعد البدء</label>
            <label><input id="oSpeed" type="checkbox" checked style="width:auto"> مكافأة السرعة</label>
            <label><input id="oGolden" type="checkbox" checked style="width:auto"> أسئلة ذهبية وأسطورية</label>
            <label><input id="oFinal" type="checkbox" checked style="width:auto"> جولة نهائية بمكافآت مضاعفة</label>
            <label><input id="oCh" type="checkbox" checked style="width:auto"> أحكام مرحة عند الخطأ</label>
            <label><input id="oShop" type="checkbox" checked style="width:auto"> متجر البطاقات</label>
            <label><input id="oEvents" type="checkbox" checked style="width:auto"> أحداث عشوائية بين الجولات</label>
            <label><input id="oSteal" type="checkbox" style="width:auto"> السماح ببطاقة السرقة</label>
            <label><input id="oPenalty" type="checkbox" style="width:auto"> خصم 5 ذهب عند الخطأ</label>
          </div></details>
          <button class="primary" data-oa="create">✨ إنشاء غرفة جديدة</button>
          ${hostCode ? `<button data-oa="resumeHost">↩️ متابعة غرفتي ${E(hostCode)}</button>` : ''}
        </div>
        <div class="panel oCard"><h2>🎮 أنا لاعب</h2><p>اكتب كود الغرفة الذي أرسله المضيف.</p>
          <label>كود الغرفة<input id="oCode" maxlength="6" autocomplete="off" style="text-transform:uppercase;letter-spacing:4px;font-size:22px;text-align:center" value="${E((qs.get('room') || (pl && pl.code) || '').toUpperCase())}"></label>
          <label>اسمك<input id="oName" maxlength="20" value="${E((pl && pl.name) || '')}"></label>
          <div class="oAvPick">${AV.map(a => `<button class="oAv ${((pl && pl.avatar) || AV[0]) === a ? 'sel' : ''}" data-oa="pickAv" data-a="${a}">${a}</button>`).join('')}</div>
          <button class="primary" data-oa="join">🚀 دخول الغرفة</button>
        </div>
        <div class="panel oCard"><h2>📺 شاشة العرض</h2><p>لعرض الأسئلة والترتيب على تلفاز أو حاسوب.</p>
          <label>كود الغرفة<input id="oDispCode" maxlength="6" style="text-transform:uppercase;letter-spacing:4px;text-align:center"></label>
          <button data-oa="display">فتح شاشة العرض</button>
        </div>
      </div>`;
    const ms = document.getElementById('oMode');
    if (ms) ms.addEventListener('change', () => {
      const v = ms.value; $('oModeDesc').textContent = MODES[v].desc;
      document.querySelector('.oTeamsOpt').classList.toggle('hidden', v !== 'teams');
      document.querySelector('.oLivesOpt').classList.toggle('hidden', v !== 'survival');
      if (v === 'coop') { $('oSteal').checked = false; }
    });
  }
  function parseJ(s) { try { return JSON.parse(s); } catch (e) { return null; } }

  /* ============================== المضيف ============================== */
  async function createRoom() {
    const cats = [...document.querySelectorAll('.oCat:checked')].map(x => x.value);
    if (!cats.length) return toast2('اختر فئة واحدة على الأقل.');
    const md = $('oMode').value;
    const settings = {
      mode: md, teams: clamp(+$('oTeams').value, 2, 6, 2), lives: clamp(+$('oLives').value, 1, 5, 3),
      rounds: clamp(+$('oRounds').value, 1, 20, 3), qPer: clamp(+$('oQper').value, 1, 30, 5), qtime: clamp(+$('oQtime').value, 5, 120, 20),
      diff: $('oDiff').value, cats, late: $('oLate').checked, speed: $('oSpeed').checked, golden: $('oGolden').checked, final: $('oFinal').checked,
      ch: $('oCh').checked, shop: $('oShop').checked, events: $('oEvents').checked, steal: $('oSteal').checked && md !== 'coop', penalty: $('oPenalty').checked
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
    if (md === 'teams') {
      const list = {}; for (let i = 0; i < settings.teams; i++) list['t' + (i + 1)] = { name: TEAM_STYLE[i][0], color: TEAM_STYLE[i][1], emoji: TEAM_STYLE[i][2] };
      await a.set(P('teams'), { list });
    }
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
    H.listenKey = null; H.loaded = {}; H.finishedKey = null; H.pendingCh = {};
    const done = k => { H.loaded[k] = true; ensureEntities(); };
    R.unsubs.push(api.on(P('meta'), m => {
      if (!m) { LS.del('host'); stopListeners(); return renderHome('أُغلقت الغرفة.'); }
      R.meta = m; done('meta');
      if (m.status === 'question' && m.qKey !== H.listenKey) listenAnswers(m.qKey);
      renderHost();
    }));
    R.unsubs.push(api.on(P('players'), v => { R.players = v || {}; done('players'); checkAllAnswered(); renderHost(); }));
    R.unsubs.push(api.on(P('kingdoms'), v => { R.kingdoms = v || {}; done('kingdoms'); renderHost(); }));
    R.unsubs.push(api.on(P('stats'), v => { R.stats = v || {}; done('stats'); renderHost(); }));
    R.unsubs.push(api.on(P('teams'), v => { R.teams = v || {}; done('teams'); renderHost(); }));
    R.unsubs.push(api.on(P('question'), v => { R.question = v; renderHost(); }));
    R.unsubs.push(api.on(P('reveal'), v => { R.reveal = v; renderHost(); }));
    R.unsubs.push(api.onAdd(P('requests'), (key, req) => { H.chain = H.chain.then(() => processRequest(key, req)).catch(e => console.warn(e)); }));
    R.unsubs.push(api.onConn(c => { R.connected = c; renderBar(); }));
  }
  function ensureEntities() {
    const L = H.loaded; if (!(L.meta && L.players && L.kingdoms && L.stats && L.teams)) return;
    const up = {}, started = R.meta.status !== 'lobby', s = S();
    if (mode() === 'teams' && !(R.teams && R.teams.list)) {
      const list = {}; for (let i = 0; i < (s.teams || 2); i++) list['t' + (i + 1)] = { name: TEAM_STYLE[i][0], color: TEAM_STYLE[i][1], emoji: TEAM_STYLE[i][2] };
      R.teams = { list, map: {} }; up['teams/list'] = list;
    }
    Object.keys(R.players || {}).forEach(uid => {
      if (!R.stats[uid]) { const st = blankS(mode() === 'survival' ? s.lives : 0); if (started && (mode() === 'survival' || mode() === 'tournament')) st.out = true; R.stats[uid] = st; up['stats/' + uid] = st; }
      if (mode() === 'teams' && !((R.teams.map || {})[uid])) {
        const counts = {}; Object.keys(R.teams.list).forEach(t => counts[t] = 0); Object.values(R.teams.map || {}).forEach(t => { if (t in counts) counts[t]++; });
        const tid = Object.keys(counts).sort((a, b) => counts[a] - counts[b])[0];
        R.teams.map = R.teams.map || {}; R.teams.map[uid] = tid; up['teams/map/' + uid] = tid;
      }
      const o = ownerOf(uid); if (!R.kingdoms[o]) { R.kingdoms[o] = blankK(); up['kingdoms/' + o] = R.kingdoms[o]; }
    });
    if (Object.keys(up).length) api.update('rooms/' + R.code, up).catch(e => console.warn(e));
  }
  function metaUp(o) { Object.assign(R.meta, o); return api.update(P('meta'), Object.assign({ lastActive: api.TS }, o)); }
  function pickQuestion(filter) {
    if (FAKE && window.DKOnline && DKOnline._force) { const f = state.questions.find(x => x.id === DKOnline._force); DKOnline._force = null; if (f) return { q: f, reset: false }; }
    const s = S(); const used = new Set(R.meta.used || []);
    const ok = q => (s.cats || CATS).includes(q.cat) && (s.diff === 'مختلط' || !s.diff || q.diff === s.diff) && (q.t === 'num' || (Array.isArray(q.opts) && q.opts.length >= 2)) && (!filter || filter(q));
    let pool = state.questions.filter(q => ok(q) && !used.has(q.id)), reset = false;
    if (!pool.length) { pool = state.questions.filter(ok); reset = true; }
    if (!pool.length && filter) pool = state.questions.filter(q => filter(q));
    if (!pool.length) pool = state.questions.slice();
    return { q: pool[Math.floor(Math.random() * pool.length)], reset };
  }
  async function startQuestion(round, roundQ, special) {
    if (H.starting) return; H.starting = true;
    try {
      const m = R.meta, s = S();
      const { q, reset } = pickQuestion(special === 'secret' ? (x => x.t === 'rid' || x.diff === 'صعب') : null);
      let opts = [], correct = -1;
      if (q.t !== 'num') {
        const order = q.opts.map((_, i) => i);
        if (q.t !== 'tf') for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[order[i], order[j]] = [order[j], order[i]]; }
        opts = order.map(i => q.opts[i]); correct = order.indexOf(q.correct);
      }
      const qNum = (m.qNum || 0) + 1, qKey = 'q' + qNum;
      const legend = !special && !!s.golden && Math.random() < 0.04, golden = !special && !legend && !!s.golden && Math.random() < 0.1;
      const final = !special && !!s.final && round >= m.roundLimit && m.roundLimit > 1;
      const boost = !special && m.boostRound === round;
      const qtime = q.t === 'spd' ? Math.max(5, Math.round(m.qtime / 2)) : m.qtime;
      const endsAt = api.now() + qtime * 1000 + 1500;
      H.current = { id: q.id, qKey, t: q.t || 'mcq', correct, n: q.n, tol: q.tol || 0, exp: q.exp || '', cat: q.cat, diff: q.diff, golden, legend, final, boost, endsAt, qtime, special: special || '' };
      LS.set('hostCur', JSON.stringify(H.current)); H.finishedKey = null;
      const used = reset ? [q.id] : (m.used || []).concat(q.id);
      const pub = { qKey, q: q.q, o: opts, t: q.t || 'mcq', c: q.cat, d: q.diff, golden, legend, final, boost, endsAt, qtime, special: special || '' };
      if (q.p) pub.p = q.p;
      await api.set(P('question'), pub);
      await api.set(P('reveal'), null);
      const mu = { status: 'question', qKey, qNum, round, roundQ, used, paused: false, pausedLeft: 0, event: null };
      if (!special) mu.urgent = false;
      await metaUp(mu);
      api.set('roomsIndex/' + R.code, api.TS).catch(() => { });
    } finally { H.starting = false; }
  }
  function listenAnswers(qKey) {
    if (H.ansUnsub) { try { H.ansUnsub(); } catch (e) { } }
    R.answers = {}; H.uses = {}; H.listenKey = qKey;
    const u1 = api.on(P('answers/' + qKey), v => { R.answers = v || {}; checkAllAnswered(); renderHost(); });
    const u2 = api.on(P('uses/' + qKey), v => { H.uses = v || {}; });
    H.ansUnsub = () => { u1(); u2(); };
  }
  function activeUids() { return Object.entries(R.players || {}).filter(([u, p]) => p.online !== false && canAnswer(u)).map(([u]) => u); }
  function checkAllAnswered() {
    if (R.role !== 'host' || !R.meta || R.meta.status !== 'question' || R.meta.paused) return;
    const act = activeUids();
    if (act.length && act.every(u => R.answers[u])) setTimeout(() => finishQuestion(), 700);
  }
  function recoverCurrent() {
    const q = R.question, m = R.meta; if (!q || !m) return null;
    if (H.current && H.current.qKey === q.qKey) return H.current;
    const bq = state.questions.find(x => x.q === q.q && (x.p || '') === (q.p || '') && (q.t === 'num' ? x.t === 'num' : (x.opts || []).length === q.o.length && q.o.every(o => x.opts.includes(o)))); if (!bq) return null;
    H.current = { id: bq.id, qKey: q.qKey, t: q.t, correct: q.t === 'num' ? -1 : q.o.indexOf(bq.opts[bq.correct]), n: bq.n, tol: bq.tol || 0, exp: bq.exp || '', cat: q.c, diff: q.d, golden: !!q.golden, legend: !!q.legend, final: !!q.final, boost: !!q.boost, endsAt: q.endsAt, qtime: q.qtime || m.qtime, special: q.special || '' };
    LS.set('hostCur', JSON.stringify(H.current)); return H.current;
  }
  function openRegions(k) { REGIONS.forEach((r, i) => { if (!k.regions.includes(i) && k.steps >= r[2] && (i < 6 || (k.buildings.palace || 0) > 0)) k.regions.push(i); }); }
  function openNextRegionFree(k) { const i = REGIONS.findIndex((r, j) => !k.regions.includes(j) && (j < 6 || (k.buildings.palace || 0) > 0)); if (i >= 0) { k.regions.push(i); return REGIONS[i][0]; } return null; }
  async function finishQuestion() {
    const c = recoverCurrent(), m = R.meta;
    if (!c || !m || m.status !== 'question' || m.qKey !== c.qKey || H.finishedKey === c.qKey) return;
    H.finishedKey = c.qKey;
    const s = S(), md = mode();
    const base = c.diff === 'سهل' ? state.rewards.easy : c.diff === 'صعب' ? state.rewards.hard : state.rewards.med;
    const kn = c.diff === 'سهل' ? 1 : c.diff === 'صعب' ? 3 : 2;
    const mult = (c.golden ? (state.rewards.gold || 2) : 1) * (c.legend ? 3 : 1) * (c.final ? 2 : 1) * (c.boost ? 2 : 1);
    const ans = Object.assign({}, R.answers), uses = H.uses || {}, results = {}, dist = [0, 0, 0, 0];
    const startAt = c.endsAt - c.qtime * 1000 - 1500;
    const eligible = Object.keys(R.players || {}).filter(u => canAnswer(u));
    // تحديد الصواب
    const isOk = {}, isHalf = {};
    let closest = null;
    if (c.t === 'num') {
      eligible.forEach(u => { const a = ans[u]; if (a && typeof a.n === 'number' && Math.abs(a.n - c.n) <= c.tol) isOk[u] = true; });
      if (!Object.keys(isOk).length) {
        let best = Infinity; eligible.forEach(u => { const a = ans[u]; if (a && typeof a.n === 'number') { const d = Math.abs(a.n - c.n); if (d < best) best = d; } });
        if (isFinite(best) && best <= Math.max(1, Math.abs(c.n) * 0.25)) eligible.forEach(u => { const a = ans[u]; if (a && typeof a.n === 'number' && Math.abs(a.n - c.n) === best) { isOk[u] = true; isHalf[u] = true; closest = best; } });
      }
    } else {
      eligible.forEach(u => {
        const a = ans[u]; if (!a) return;
        if (a.c >= 0 && a.c <= 3) dist[a.c]++;
        if (a.c === c.correct) isOk[u] = true;
        else if ((uses[u] || {}).second && a.c2 === c.correct) { isOk[u] = true; isHalf[u] = true; }
      });
    }
    const corrects = Object.keys(isOk).filter(u => !isHalf[u]).sort((x, y) => ans[x].at - ans[y].at);
    const fastest = corrects[0] || '';
    const fastBonus = md === 'speed' ? 15 : (s.speed ? 5 : 0);
    const up = {}, teamGain = {}, teamCnt = {}, msgs = [];
    const touchedK = {};
    const K = o => (touchedK[o] = touchedK[o] || normK(R.kingdoms[o]));
    eligible.forEach(uid => {
      const a = ans[uid], st = normS(R.stats[uid]), o = ownerOf(uid), k = K(o), use = uses[uid] || {};
      if (md === 'teams' && R.players[uid].online !== false) teamCnt[o] = (teamCnt[o] || 0) + 1;
      const r = {};
      const noReward = c.special === 'duel' || c.special === 'tiebreak';
      if (isOk[uid] && noReward) { Object.assign(r, { ok: true, reward: 0, half: !!isHalf[uid] }); }
      else if (isOk[uid]) {
        const frac = (s.speed || md === 'speed') && md !== 'teams' ? Math.max(0, Math.min(1, 1 - (a.at - startAt) / (c.qtime * 1000))) : 0;
        let reward = Math.round(base * (1 + 0.5 * frac)) * mult;
        if (isHalf[uid]) reward = Math.round(reward / 2);
        if (use.double) reward *= 2;
        if (uid === fastest && fastBonus && !c.special) { reward += fastBonus; st.fastest++; r.fast = true; }
        st.score += reward; st.correct++; st.streak++;
        if (st.streak > 0 && st.streak % 5 === 0) k.gems++;
        k.stars += c.diff === 'صعب' ? 2 : 1; k.steps += kn; k.knowledge[c.cat] = (k.knowledge[c.cat] || 0) + kn;
        if (c.legend) k.gems++;
        if (md === 'teams') teamGain[o] = (teamGain[o] || 0) + reward; else { k.gold += reward; k.score += reward; }
        if (c.special === 'secret') { const reg = openNextRegionFree(k); k.gold += 10; r.region = reg || ''; }
        openRegions(k);
        Object.assign(r, { ok: true, reward, half: !!isHalf[uid], dbl: !!use.double });
      } else {
        st.wrong++; st.streak = 0;
        const loses = md === 'survival' || s.penalty;
        if (loses && !c.special) {
          if (st.cards.shield > 0) { st.cards.shield--; r.shield = true; }
          else {
            if (md === 'survival') { st.lives = Math.max(0, st.lives - 1); r.lost = 1; if (st.lives <= 0) { st.out = true; r.outNow = true; msgs.push(`🚫 خرج ${R.players[uid].name} من وضع البقاء.`); } }
            if (s.penalty) { k.gold = Math.max(0, k.gold - 5); r.penalty = 5; }
          }
        }
        Object.assign(r, { ok: false, none: !a });
      }
      if (c.special === 'duel' && m.duel) { /* يُحتسب أدناه */ }
      R.stats[uid] = st; up['stats/' + uid] = st; results[uid] = r;
    });
    if (md === 'teams') Object.keys(teamGain).forEach(o => { const k = K(o), g = Math.round(teamGain[o] / Math.max(1, teamCnt[o] || 1)); k.gold += g; k.score += g; });
    Object.keys(touchedK).forEach(o => { R.kingdoms[o] = touchedK[o]; up['kingdoms/' + o] = touchedK[o]; });
    // تحدٍّ مباشر وكسر التعادل
    if (c.special === 'duel' && m.duel) {
      const d = JSON.parse(JSON.stringify(m.duel)); d.score = d.score || {}; d.time = d.time || {}; d.n = (d.n || 0) + 1;
      [d.a, d.b].forEach(u => { if (isOk[u] && !isHalf[u]) { d.score[u] = (d.score[u] || 0) + 1; d.time[u] = (d.time[u] || 0) + (ans[u].at - startAt); } });
      up['meta/duel'] = d; m.duel = d;
    }
    let tbWinner = '';
    if (c.special === 'tiebreak' && fastest) { const st = R.stats[fastest]; st.score += 1; up['stats/' + fastest] = st; tbWinner = fastest; msgs.push(`⚖️ ${R.players[fastest].name} يفوز بكسر التعادل!`); }
    try {
      await api.update('rooms/' + R.code, up);
      const rv = { qKey: c.qKey, correct: c.correct, exp: c.exp, dist, results, fastest, golden: c.golden, legend: c.legend, special: c.special, msg: msgs.join(' ') };
      if (c.t === 'num') { rv.num = c.n; if (closest !== null) rv.closest = closest; }
      if (tbWinner) rv.tbWinner = tbWinner;
      await api.set(P('reveal'), rv);
      await metaUp({ status: 'reveal', paused: false });
    } catch (e) { H.finishedKey = null; toast2('تعذّر حفظ النتيجة، أعد المحاولة.'); console.warn(e); }
  }
  function aliveCount() { return Object.keys(R.players).filter(u => !normS(R.stats[u]).out).length; }
  async function msgTo(uid, text, ok) { const st = normS(R.stats[uid]); st.msg = { text, ok: !!ok, at: api.TS }; R.stats[uid] = st; await api.set(P('stats/' + uid), st).catch(e => console.warn(e)); }
  async function processRequest(key, req) {
    if (R.role !== 'host' || !req) return;
    for (let i = 0; i < 20 && !(H.loaded.meta && H.loaded.kingdoms && H.loaded.stats); i++) await new Promise(r => setTimeout(r, 250));
    if (!R.meta) return;
    const uid = req.uid, m = R.meta, s = S();
    if (req.t === 'ch') { H.pendingCh[key] = req; renderHost(); return; }
    const done = () => api.remove(P('requests/' + key)).catch(() => { });
    if (!R.players[uid]) return done();
    const st = normS(R.stats[uid]), o = ownerOf(uid), k = normK(R.kingdoms[o]);
    let msg = null, ok = false, saveK = false, saveS = false;
    const extra = {};
    if (req.t === 'use') {
      const card = CARDS[req.id], q = R.question, cur = recoverCurrent();
      if (!card || !['fifty', 'double', 'second'].includes(req.id)) msg = 'بطاقة غير صالحة.';
      else if (!s.shop) msg = 'المتجر معطّل في هذه اللعبة.';
      else if (m.status !== 'question' || m.paused || !q || req.q !== q.qKey) msg = 'لا يمكن استخدام البطاقة الآن.';
      else if (!canAnswer(uid)) msg = 'لا يمكنك المشاركة في هذا السؤال.';
      else if (R.answers[uid]) msg = 'استخدم البطاقة قبل إرسال إجابتك.';
      else if ((H.uses[uid] || {})[req.id]) msg = 'استخدمت هذه البطاقة في هذا السؤال.';
      else if (st.cards[req.id] <= 0) msg = 'لا تملك هذه البطاقة.';
      else if ((req.id === 'fifty' || req.id === 'second') && (q.t === 'num' || q.o.length < 3)) msg = 'هذه البطاقة لا تعمل مع هذا النوع من الأسئلة.';
      else {
        st.cards[req.id]--; saveS = true; ok = true;
        H.uses[uid] = Object.assign({}, H.uses[uid], { [req.id]: true });
        extra['uses/' + q.qKey + '/' + uid + '/' + req.id] = true;
        if (req.id === 'fifty' && cur) {
          const wrong = q.o.map((_, i) => i).filter(i => i !== cur.correct); for (let i = wrong.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[wrong[i], wrong[j]] = [wrong[j], wrong[i]]; }
          extra['hints/' + q.qKey + '/' + uid] = wrong.slice(0, 2);
        }
        msg = `${card.emoji} تم تفعيل «${card.name}».`;
      }
    } else if (m.status !== 'build') msg = 'البناء والشراء متاحان في مرحلة البناء فقط.';
    else if (req.t === 'buy') {
      const card = CARDS[req.id];
      if (!card || !s.shop || (req.id === 'steal' && !s.steal)) msg = 'هذه البطاقة غير متاحة في هذه اللعبة.';
      else if (k.gold < card.cost) msg = `تحتاج ${card.cost} ذهب، ومعك ${k.gold}.`;
      else { k.gold -= card.cost; st.cards[req.id]++; saveK = saveS = ok = true; msg = `${card.emoji} اشتريت «${card.name}».`; }
    } else if (req.t === 'steal') {
      const tgt = req.target, to = tgt && ownerOf(tgt);
      if (!s.steal) msg = 'السرقة غير مسموحة في هذه اللعبة.';
      else if (!tgt || !R.players[tgt] || to === o) msg = 'اختر منافسًا من مملكة أخرى.';
      else if (st.cards.steal <= 0) msg = 'لا تملك بطاقة سرقة.';
      else {
        st.cards.steal--; saveS = true;
        const ts = normS(R.stats[tgt]), tk = normK(R.kingdoms[to]);
        if (ts.cards.shield > 0) { ts.cards.shield--; ts.msg = { text: `🛡️ صدّ درعك محاولة سرقة من ${R.players[uid].name}!`, ok: true, at: api.TS }; R.stats[tgt] = ts; extra['stats/' + tgt] = ts; msg = `🛡️ ${R.players[tgt].name} يملك درعًا وصدّ السرقة.`; }
        else {
          const amt = Math.min(20, Math.floor(tk.gold * 0.1));
          tk.gold -= amt; k.gold += amt; saveK = ok = true; R.kingdoms[to] = tk; extra['kingdoms/' + to] = tk;
          ts.msg = { text: `🦹 أخذ ${R.players[uid].name} منك ${amt} ذهبًا. اشترِ درعًا لتحمي نفسك!`, ok: false, at: api.TS }; R.stats[tgt] = ts; extra['stats/' + tgt] = ts;
          msg = `🦹 أخذت ${amt} ذهبًا من ${R.players[tgt].name}.`;
        }
      }
    } else if (req.t === 'b') {
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
          openRegions(k); ok = saveK = true; msg = `🎉 تم ${lv ? 'تطوير' : 'بناء'} ${b.name} إلى المستوى ${lv + 1}!`;
          if (m.urgent) { k.gold += 25; msg += ' 🏗️ ربحت مكافأة المهمة العاجلة: 25 ذهبًا!'; extra['meta/urgent'] = false; m.urgent = false; extra['meta/event'] = { id: 'urgentDone', text: `🏗️ ${R.players[uid].name} أنجز مهمة البناء العاجلة!`, at: api.TS }; }
        }
      }
    } else if (req.t === 'd') {
      const d = DECOS.find(x => x.id === req.id);
      if (d) { if (k.gold < d.cost) msg = 'ذهب غير كافٍ.'; else { k.gold -= d.cost; k.decos.push(d.emoji); ok = saveK = true; msg = `تمت إضافة ${d.name} إلى المملكة.`; } }
    }
    if (saveK) { R.kingdoms[o] = k; extra['kingdoms/' + o] = k; }
    if (msg) st.msg = { text: msg, ok, at: api.TS };
    R.stats[uid] = st; extra['stats/' + uid] = st;
    await api.update('rooms/' + R.code, extra).catch(e => console.warn(e));
    await done();
  }
  async function decideChallenge(key, give) {
    const req = H.pendingCh[key]; delete H.pendingCh[key];
    if (req && give && R.players[req.uid]) {
      const ch = CHS.find(x => x.id === req.id), rew = ch ? ch.reward : 5;
      const o = ownerOf(req.uid), k = normK(R.kingdoms[o]), st = normS(R.stats[req.uid]);
      k.gold += rew; k.stars += 1; st.ch++; st.msg = { text: `🎭 أحسنت! منحك المضيف ${rew} ذهبًا ونجمة لتنفيذ «${ch ? ch.title : 'الحكم'}».`, ok: true, at: api.TS };
      R.kingdoms[o] = k; R.stats[req.uid] = st;
      await api.update('rooms/' + R.code, { ['kingdoms/' + o]: k, ['stats/' + req.uid]: st }).catch(() => { });
    }
    await api.remove(P('requests/' + key)).catch(() => { });
    renderHost();
  }
  /* ---------- الأحداث ---------- */
  async function fireEvent(id) {
    const m = R.meta, up = {}, owners = [...new Set(Object.keys(R.players).map(ownerOf))];
    let text = EVENTS[id];
    if (id === 'treasure') owners.forEach(o => { const k = normK(R.kingdoms[o]); k.gold += 20; R.kingdoms[o] = k; up['kingdoms/' + o] = k; });
    else if (id === 'gift') {
      const ps = Object.keys(R.players).filter(u => !normS(R.stats[u]).out); if (!ps.length) return;
      const u = ps[Math.floor(Math.random() * ps.length)], o = ownerOf(u), k = normK(R.kingdoms[o]); k.gold += 10; k.gems += 1; R.kingdoms[o] = k; up['kingdoms/' + o] = k;
      text += `: حصل ${R.players[u].avatar} ${R.players[u].name} على 10 ذهب وجوهرة! 💎`;
    } else if (id === 'boost') { const br = m.status === 'build' || m.status === 'lobby' ? (m.status === 'lobby' ? 1 : (m.round || 1) + 1) : (m.round || 1); up['meta/boostRound'] = br; m.boostRound = br; text = br === m.round ? '✨ الذهب مضاعف في بقية هذه الجولة!' : EVENTS.boost; }
    else if (id === 'urgent') { if (m.status !== 'build') return toast2('مهمة البناء العاجلة تعمل في مرحلة البناء فقط.'); up['meta/urgent'] = true; m.urgent = true; }
    else if (id === 'group') { const c = nextGroupCh(); text += `: «${c.title}» — ${c.text}`; up['meta/groupCh'] = c.id; m.groupCh = c.id; }
    else if (id === 'secret') { up['meta/event'] = { id, text, at: api.TS }; await api.update('rooms/' + R.code, up); return startQuestion(m.round || 1, m.roundQ || 0, 'secret'); }
    up['meta/event'] = { id, text, at: api.TS };
    await api.update('rooms/' + R.code, up);
  }
  function nextGroupCh() { const g = CHS.filter(c => c.cat === 'جماعية' || c.cat === 'فرق'); return g[Math.floor(Math.random() * g.length)] || nextCh(); }
  async function groupSuccess() {
    const ch = CHS.find(c => c.id === R.meta.groupCh), rew = ch ? ch.reward : 10, up = {};
    [...new Set(Object.keys(R.players).map(ownerOf))].forEach(o => { const k = normK(R.kingdoms[o]); k.gold += rew; k.stars += 1; R.kingdoms[o] = k; up['kingdoms/' + o] = k; });
    up['meta/groupCh'] = null; up['meta/event'] = { id: 'groupDone', text: `🎉 نجح التحدي الجماعي! كل مملكة تحصل على ${rew} ذهبًا ونجمة.`, at: api.TS };
    await api.update('rooms/' + R.code, up);
  }
  async function randomEventAtBuild() {
    if (!S().events || Math.random() > 0.5) return;
    const ids = ['treasure', 'gift', 'boost', 'urgent'];
    await fireEvent(ids[Math.floor(Math.random() * ids.length)]);
  }
  /* ---------- التحدي المباشر وكسر التعادل والإقصاء ---------- */
  async function startDuel() {
    const a = $('oDuelA').value, b = $('oDuelB').value;
    if (!a || !b || a === b) return toast2('اختر لاعبَين مختلفَين.');
    if (!['reveal', 'build'].includes(R.meta.status)) return toast2('ابدأ التحدي بعد كشف إجابة أو في مرحلة البناء.');
    await metaUp({ duel: { a, b, n: 0, total: 3, score: { [a]: 0, [b]: 0 }, time: { [a]: 0, [b]: 0 }, from: R.meta.status }, only: { [a]: true, [b]: true } });
    return startQuestion(R.meta.round || 1, R.meta.roundQ || 0, 'duel');
  }
  async function finishDuel() {
    const d = R.meta.duel, sa = d.score[d.a] || 0, sb = d.score[d.b] || 0;
    let w = sa > sb ? d.a : sb > sa ? d.b : ((d.time[d.a] || 0) <= (d.time[d.b] || 0) && sa > 0 ? d.a : (sa > 0 ? d.b : ''));
    const up = { 'meta/duel': null, 'meta/only': null };
    let text = '⚔️ انتهى التحدي المباشر بالتعادل دون فائز.';
    if (w) { const o = ownerOf(w), k = normK(R.kingdoms[o]), st = normS(R.stats[w]); k.gold += 30; k.stars += 2; st.score += 10; R.kingdoms[o] = k; R.stats[w] = st; up['kingdoms/' + o] = k; up['stats/' + w] = st; text = `⚔️ فاز ${R.players[w].avatar} ${R.players[w].name} بالتحدي المباشر (${sa}–${sb}) وحصل على 30 ذهبًا ونجمتين و10 نقاط!`; }
    up['meta/event'] = { id: 'duelDone', text, at: api.TS };
    if (d.from === 'build') up['meta/status'] = 'build';
    R.meta.duel = null; R.meta.only = null;
    await api.update('rooms/' + R.code, up);
  }
  function tiedTop() {
    if (mode() === 'teams' || mode() === 'coop') return [];
    const r = ranking().filter(p => !p.s.out || mode() === 'survival'); if (r.length < 2) return [];
    const top = r[0].s.score; const tied = r.filter(p => p.s.score === top && (mode() !== 'survival' || p.s.lives === r[0].s.lives));
    return tied.length > 1 ? tied.map(p => p.uid) : [];
  }
  async function startTiebreak() {
    const t = tiedTop(); if (t.length < 2) return toast2('لا يوجد تعادل في المركز الأول.');
    const only = {}, up = {}; t.forEach(u => { only[u] = true; const st = normS(R.stats[u]); if (st.out) { st.out = false; R.stats[u] = st; up['stats/' + u] = st; } });
    if (Object.keys(up).length) await api.update('rooms/' + R.code, up);
    await metaUp({ only, tiebreak: true });
    return startQuestion(R.meta.round || 1, R.meta.roundQ || 0, 'tiebreak');
  }
  async function eliminateTournament() {
    const act = ranking().filter(p => !p.s.out);
    if (act.length <= 2) return '';
    const n = Math.max(1, Math.floor(act.length / 4));
    const cutScore = act[act.length - n].s.score, aboveScore = act[act.length - n - 1].s.score;
    const outs = act.filter(p => p.s.score < aboveScore && p.s.score <= cutScore).slice(-n);
    if (!outs.length) return '⚖️ لم يخرج أحد هذه الجولة بسبب تعادل النقاط.';
    const up = {}; outs.forEach(p => { const st = normS(R.stats[p.uid]); st.out = true; st.msg = { text: '🏆 انتهت مشاركتك في البطولة. شكرًا لك! تابع المنافسة مشاهدًا 👀', ok: false, at: api.TS }; R.stats[p.uid] = st; up['stats/' + p.uid] = st; });
    await api.update('rooms/' + R.code, up);
    return `🏆 خرج من البطولة: ${outs.map(p => p.name).join('، ')}. يتأهل ${act.length - outs.length} لاعبين.`;
  }
  async function hostNext() {
    const m = R.meta; if (!m) return;
    if (m.status === 'lobby') {
      if (!Object.keys(R.players).length) return toast2('انتظر انضمام لاعب واحد على الأقل.');
      if (mode() === 'survival' || mode() === 'tournament') { const up = {}; Object.keys(R.players).forEach(u => { const st = normS(R.stats[u]); st.out = false; if (mode() === 'survival') st.lives = S().lives; up['stats/' + u] = st; R.stats[u] = st; }); await api.update('rooms/' + R.code, up); }
      await metaUp({ allowJoin: !!S().late });
      return startQuestion(1, 1);
    }
    if (m.status === 'question') return finishQuestion();
    if (m.status === 'reveal') {
      const sp = R.question && R.question.special;
      if (sp === 'tiebreak') return metaUp({ status: 'end', only: null, tiebreak: false });
      if (m.duel) { if ((m.duel.n || 0) < m.duel.total) return startQuestion(m.round, m.roundQ, 'duel'); await finishDuel(); if (R.meta.status === 'build') return; return; }
      if (mode() === 'survival' && aliveCount() <= 1 && Object.keys(R.players).length > 1) return metaUp({ status: 'end', allowJoin: false, event: { id: 'survEnd', text: '❤️ انتهى وضع البقاء!', at: api.TS } });
      if ((m.roundQ || 0) >= m.qPer) { await metaUp({ status: 'build', urgent: false, event: null }); if (!sp) return randomEventAtBuild(); return; }
      return startQuestion(m.round, (m.roundQ || 0) + 1);
    }
    if (m.status === 'build') {
      if ((m.round || 1) >= m.roundLimit) return metaUp({ status: 'end', allowJoin: false });
      if (mode() === 'tournament' && m.elimRound !== m.round) { const t = await eliminateTournament(); await metaUp({ elimRound: m.round, event: { id: 'elim', text: t || '🏆 تأهل الجميع إلى الجولة التالية!', at: api.TS } }); if (aliveCount() <= 1) return metaUp({ status: 'end', allowJoin: false }); return; }
      return startQuestion((m.round || 1) + 1, 1);
    }
  }
  async function hostPause() {
    const m = R.meta; if (!m || m.status !== 'question') return;
    if (!m.paused) return metaUp({ paused: true, pausedLeft: Math.max(0, R.question.endsAt - api.now()) });
    const endsAt = api.now() + (m.pausedLeft || 0);
    if (H.current) { H.current.endsAt = endsAt; LS.set('hostCur', JSON.stringify(H.current)); }
    await api.update(P('question'), { endsAt });
    await metaUp({ paused: false, pausedLeft: 0 });
  }
  async function kick(uid) {
    const p = R.players[uid]; if (!p || !confirm('إخراج ' + p.name + ' من الغرفة؟ لن يستطيع العودة إليها.')) return;
    await api.update('rooms/' + R.code, { ['players/' + uid]: null, ['banned/' + uid]: true }).catch(e => toast2('تعذّر الإخراج.'));
  }
  async function setTeam(uid, tid) { R.teams.map = R.teams.map || {}; R.teams.map[uid] = tid; const o = tid; const up = { ['teams/map/' + uid]: tid }; if (!R.kingdoms[o]) up['kingdoms/' + o] = blankK(); await api.update('rooms/' + R.code, up); }
  async function closeRoom() {
    if (!confirm('إغلاق الغرفة نهائيًا وحذف بياناتها؟')) return;
    const code = R.code; stopListeners();
    await api.remove('rooms/' + code).catch(() => { }); await api.remove('roomsIndex/' + code).catch(() => { });
    LS.del('host'); LS.del('hostCur'); document.body.classList.remove('onlineMode'); renderHome();
  }

  function renderHost() {
    if (R.role !== 'host' || !R.meta) return;
    const m = R.meta, q = R.question, rv = R.reveal, ps = playerList();
    const answered = R.answers || {}, act = activeUids(), nAns = Object.keys(answered).filter(u => R.players[u]).length;
    let main = '', ctrl = '';
    if (m.status === 'lobby') {
      main = `<div class="oBig">كود الغرفة<div class="oCode">${E(R.code)}</div></div>
        <p><span class="badge">${MODES[mode()].icon} ${MODES[mode()].name}</span> ${E(MODES[mode()].desc)}</p>
        <div class="row oShare"><input readonly value="${E(linkFor('room'))}" onclick="this.select()"><button data-oa="copy">📋 نسخ الرابط</button><a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('تعالوا نلعب «رحلة إلى مملكة الأحلام» 🌙\nادخلوا من هنا: ' + linkFor('room') + '\nكود الغرفة: ' + R.code)}">💬 واتساب</a></div>
        <p class="small">شاشة العرض للتلفاز: <a href="${E(linkFor('display'))}" target="_blank" rel="noopener">${E(linkFor('display'))}</a></p>
        <h3>اللاعبون (${ps.length})</h3>${mode() === 'teams' ? teamsEditor() : chipsHtml()}`;
      ctrl = `<button class="primary" data-oa="next" ${ps.length ? '' : 'disabled'}>🚀 ابدأ اللعبة</button>`;
    } else if (m.status === 'question' && q) {
      const cur = recoverCurrent();
      main = `${qHeader()}${duelHtml()}${picHtml(q)}<div class="oQ">${E(q.q)}</div>${optionsHtml(q)}${timerHtml()}
        <p><b>أجاب ${nAns} من ${act.length}</b>${m.only ? ' (المشاركون في هذا السؤال)' : ' (المتصلون)'}</p>${chipsHtml(answered, true)}
        <p class="small"><button data-oa="peek">${H.peek ? '🙈 إخفاء الإجابة' : '👁️ إظهار الإجابة لي'}</button> ${H.peek ? `الإجابة الصحيحة: <b>${cur ? (cur.t === 'num' ? E(cur.n) + (cur.tol ? ' (±' + cur.tol + ')' : '') : LETTERS[cur.correct] + ' · ' + E(q.o[cur.correct])) : '—'}</b>` : '<span>(أخفِها إن كانت شاشتك معروضة للاعبين)</span>'}</p>`;
      ctrl = `<button class="primary" data-oa="next">✨ كشف الإجابة الآن</button><button data-oa="pause">${m.paused ? '▶️ استئناف' : '⏸️ إيقاف مؤقت'}</button>`;
    } else if (m.status === 'reveal' && q && rv) {
      const winners = Object.entries(rv.results || {}).filter(([, r]) => r.ok).map(([u, r]) => `<span class="oChip done">${E((R.players[u] || {}).avatar || '')} ${E((R.players[u] || {}).name || '؟')} +${r.reward}${r.fast ? ' ⚡' : ''}${r.dbl ? ' ✨×2' : ''}${r.half ? ' (½)' : ''}${r.region ? ' 🗝️' : ''}</span>`).join('');
      const losers = Object.entries(rv.results || {}).filter(([, r]) => r.lost || r.shield || r.penalty).map(([u, r]) => `<span class="oChip">${E((R.players[u] || {}).name || '؟')} ${r.shield ? '🛡️ حماه الدرع' : (r.lost ? '−❤️' : '') + (r.penalty ? ' −5🪙' : '')}${r.outNow ? ' 🚫' : ''}</span>`).join('');
      const pend = Object.entries(H.pendingCh).map(([key, r]) => { const ch = CHS.find(x => x.id === r.id); return `<div class="row"><span>🎭 ${E((R.players[r.uid] || {}).name || '؟')} يقول إنه نفّذ «${E(ch ? ch.title : 'الحكم')}»</span><button class="good" data-oa="chYes" data-k="${key}">✅ +${ch ? ch.reward : 5} ذهب</button><button data-oa="chNo" data-k="${key}">✖</button></div>`; }).join('');
      const dDone = m.duel && (m.duel.n || 0) >= m.duel.total;
      main = `${qHeader()}${duelHtml()}${picHtml(q)}<div class="oQ">${E(q.q)}</div>${optionsHtml(q, { correct: rv.correct, dist: rv.dist, num: rv.num })}
        ${rv.exp ? `<div class="notice">💡 ${E(rv.exp)}</div>` : ''}${rv.msg ? `<div class="oEvent">${E(rv.msg)}</div>` : ''}
        <h3>أصابوا الإجابة</h3>${winners ? `<div class="oChips">${winners}</div>` : '<p>لم يُصب أحد هذه المرة 🌧️</p>'}${losers ? `<div class="oChips">${losers}</div>` : ''}
        ${pend ? `<div class="panel"><h3>أحكام بانتظار موافقتك</h3>${pend}</div>` : ''}${eventHtml()}${groupCtrl()}
        <h3>الترتيب</h3>${boardHtml(10)}`;
      const label = q.special === 'tiebreak' ? '🏁 العودة إلى النتائج' : m.duel ? (dDone ? '⚔️ إعلان نتيجة التحدي' : '⚔️ سؤال التحدي التالي') : (mode() === 'survival' && aliveCount() <= 1 && ps.length > 1) ? '🏆 إعلان الفائز' : (m.roundQ || 0) >= m.qPer ? '🏗️ الانتقال إلى مرحلة البناء' : '➡️ السؤال التالي';
      ctrl = `<button class="primary" data-oa="next">${label}</button>`;
    } else if (m.status === 'build') {
      main = `<div class="oBig">🏗️ مرحلة البناء — الجولة ${m.round} من ${m.roundLimit}</div>${eventHtml()}${groupCtrl()}<p>يبني اللاعبون ممالكهم ويشترون البطاقات من هواتفهم الآن. اضغط زر المتابعة عندما ينتهون.</p>
        <table class="oBoard"><thead><tr><th>المملكة</th><th>🪙</th><th>المباني</th><th>المناطق</th></tr></thead><tbody>${[...new Set(ps.map(p => ownerOf(p.uid)))].map(o => { const k = normK(R.kingdoms[o]); return `<tr><td>${E(ownerName(o))}</td><td>${k.gold}</td><td>${BUILDINGS.filter(b => k.buildings[b.id]).map(b => b.emoji + (k.buildings[b.id] > 1 ? '×' + k.buildings[b.id] : '')).join(' ') || '—'}</td><td>${k.regions.length}/7</td></tr>`; }).join('')}</tbody></table>`;
      ctrl = `<button class="primary" data-oa="next">${(m.round || 1) >= m.roundLimit ? '🏆 إنهاء اللعبة وإعلان النتائج' : mode() === 'tournament' && m.elimRound !== m.round ? '🏆 إعلان المتأهلين' : '🚀 بدء الجولة التالية'}</button>`;
    } else if (m.status === 'end') {
      const tied = tiedTop();
      main = `<div class="oBig">🎉 انتهت الرحلة!</div>${eventHtml()}${winnerHtml()}${boardHtml()}${tied.length ? `<div class="notice">⚖️ تعادل في المركز الأول بين: ${tied.map(u => E(R.players[u].name)).join('، ')}</div>` : ''}`;
      ctrl = `${tied.length ? '<button class="primary" data-oa="tiebreak">⚖️ تحدي كسر التعادل</button>' : ''}<button class="${tied.length ? '' : 'primary'}" data-oa="close">🆕 إغلاق الغرفة وبدء لعبة جديدة</button>`;
    } else main = '<div class="panel">⏳ جارٍ التحميل…</div>';
    box().innerHTML = `<div class="panel oStage">${main}<div class="oCtrl">${ctrl}</div></div>${manageHtml()}`;
    renderBar();
  }
  function groupCtrl() { return R.meta.groupCh ? '<div class="row"><button class="good" data-oa="groupYes">✅ نجح التحدي الجماعي</button><button data-oa="groupNo">✖ لم ينجح</button></div>' : ''; }
  function winnerHtml() {
    if (mode() === 'teams') { const t = teamRanking()[0]; return t ? `<div class="oWinner">🏆 الفريق الفائز: ${E(t.t.emoji)} ${E(t.t.name)} — ${t.k.score} نقطة</div>` : ''; }
    if (mode() === 'coop') { const k = normK(R.kingdoms.all), pal = (k.buildings.palace || 0) > 0; const mvp = ranking()[0]; return `<div class="oWinner">${pal ? '🏰 أحسنتم! بنيتم القصر العظيم معًا!' : '🤝 بنيتم مملكة رائعة معًا!'} — ${Object.values(k.buildings).reduce((a, b) => a + b, 0)} مستوى بناء</div>${mvp ? `<p>⭐ صاحب أكبر مساهمة: ${E(mvp.avatar)} ${E(mvp.name)} (${mvp.s.score} نقطة)</p>` : ''}`; }
    const w = ranking()[0]; return w ? `<div class="oWinner">🏆 الفائز: ${E(w.avatar)} ${E(w.name)} — ${w.s.score} نقطة${mode() === 'survival' ? ' · ' + '❤️'.repeat(w.s.lives) : ''}</div>` : '';
  }
  function teamsEditor() {
    const list = (R.teams || {}).list || {};
    return `<div class="grid">${Object.entries(list).map(([tid, t]) => `<div class="panel" style="border-color:${E(t.color)}"><b style="color:${E(t.color)}">${E(t.emoji)} ${E(t.name)}</b>${playerList().filter(p => ownerOf(p.uid) === tid).map(p => `<div class="row"><span>${E(p.avatar)} ${E(p.name)}</span><select data-oa-change="team" data-u="${E(p.uid)}">${Object.entries(list).map(([x, tt]) => `<option value="${x}" ${x === tid ? 'selected' : ''}>${E(tt.emoji)} ${E(tt.name)}</option>`).join('')}</select></div>`).join('') || '<p class="small">لا أحد بعد</p>'}</div>`).join('')}</div>`;
  }
  function manageHtml() {
    const m = R.meta, ps = playerList(), running = m.status !== 'lobby' && m.status !== 'end';
    const evBtns = Object.keys(EVENTS).map(id => `<button data-oa="event" data-id="${id}" ${(id === 'urgent' && m.status !== 'build') || (id === 'secret' && !['reveal', 'build'].includes(m.status)) || m.status === 'question' ? 'disabled' : ''}>${EVENTS[id].split(':')[0].split('!')[0]}</button>`).join('');
    const opts = w => ps.filter(p => !p.s.out).map(p => `<option value="${E(p.uid)}" ${H['duel' + w] === p.uid ? 'selected' : ''}>${E(p.avatar)} ${E(p.name)}</option>`).join('');
    return `<details class="panel" id="oManage" ${H.manageOpen ? 'open' : ''}><summary><b>⚙️ إدارة الغرفة</b> — ${E(R.code)} · ${STATUS_AR[m.status] || ''}</summary>
      <div class="row"><button data-oa="toggleJoin">${m.allowJoin ? '🔓 الانضمام مفتوح (اضغط للإغلاق)' : '🔒 الانضمام مغلق (اضغط للفتح)'}</button>
      ${running ? '<button data-oa="redoRound">🔁 إعادة الجولة الحالية</button><button class="danger" data-oa="endNow">⏹ إنهاء اللعبة الآن</button>' : ''}
      <button class="danger" data-oa="close">🗑️ إغلاق الغرفة</button></div>
      ${running ? `<h4>🎲 أحداث المملكة (تُطلقها متى شئت بين الأسئلة)</h4><div class="row oEvBtns">${evBtns}</div>
      <h4>⚔️ تحدٍّ مباشر (3 أسئلة بين لاعبَين، والفائز يأخذ 30 ذهبًا)</h4><div class="row"><select id="oDuelA">${opts('A')}</select><select id="oDuelB">${opts('B')}</select><button data-oa="duel" ${m.duel || !['reveal', 'build'].includes(m.status) ? 'disabled' : ''}>ابدأ التحدي</button></div>` : ''}
      <h4>اللاعبون</h4>${ps.map(p => `<div class="row"><span>${E(p.avatar)} ${E(p.name)} ${p.online === false ? '⚪ غير متصل' : '🟢 متصل'}${p.s.out ? ' 🚫 خارج المنافسة' : ''}</span><button class="danger" data-oa="kick" data-u="${E(p.uid)}">إخراج</button></div>`).join('') || '<p class="small">لا يوجد لاعبون.</p>'}
      ${mode() === 'teams' && m.status !== 'lobby' ? '<h4>الفرق</h4>' + teamsEditor() : ''}
      <p class="small">رابط اللاعبين: ${E(linkFor('room'))}<br>رابط شاشة العرض: ${E(linkFor('display'))}</p></details>`;
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
      if (m.event && m.event.at && (!prev || !prev.event || prev.event.at !== m.event.at)) { toast2(m.event.text); vib([40, 30, 40]); }
      renderPlayer();
    }));
    R.unsubs.push(api.on(P('question'), v => {
      const nk = v && v.qKey; const ok = R.question && R.question.qKey; R.question = v;
      if (nk && nk !== ok) {
        snd(660, 120); vib(40); R.sel = []; stopQ(); R.myHint = null; R.myUses = null;
        R.qUnsubs.push(api.on(P('hints/' + nk + '/' + api.uid), h => { R.myHint = h; renderPlayer(); }));
        R.qUnsubs.push(api.on(P('uses/' + nk + '/' + api.uid), u => { R.myUses = u; renderPlayer(); }));
        api.get(P('answers/' + nk + '/' + api.uid)).then(a => { if (a) { R.myAnswer[nk] = a.n !== undefined ? { n: a.n } : { c: a.c, c2: a.c2 }; renderPlayer(); } }).catch(() => { });
      }
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
    R.unsubs.push(api.on(P('kingdoms'), v => { R.kingdoms = v || {}; renderPlayer(); }));
    R.unsubs.push(api.on(P('teams'), v => { R.teams = v || {}; renderPlayer(); }));
    R.unsubs.push(api.on(P('stats'), v => {
      R.stats = v || {}; const st = R.stats[api.uid];
      if (st && st.msg && st.msg.at) { if (first) R.lastMsgAt = st.msg.at; else if (st.msg.at > R.lastMsgAt) { R.lastMsgAt = st.msg.at; toast2(st.msg.text); vib(st.msg.ok ? 50 : [30, 30, 30]); if (st.msg.ok) snd(700, 160); } }
      first = false; renderPlayer();
    }));
    R.unsubs.push(api.onConn(c => { R.connected = c; renderBar(); }));
  }
  async function sendAnswer(payload) {
    const q = R.question, m = R.meta; if (!q || !m || m.status !== 'question' || m.paused) return;
    if (R.myAnswer[q.qKey] !== undefined) return;
    if (remainMs() <= 0) return toast2('انتهى الوقت ⏰');
    R.myAnswer[q.qKey] = payload; R.sel = []; renderPlayer();
    try { await api.set(P('answers/' + q.qKey + '/' + api.uid), Object.assign({}, payload, { at: api.TS })); vib(30); }
    catch (e) {
      const ex = await api.get(P('answers/' + q.qKey + '/' + api.uid)).catch(() => null);
      if (ex) R.myAnswer[q.qKey] = ex.n !== undefined ? { n: ex.n } : { c: ex.c, c2: ex.c2 }; else { delete R.myAnswer[q.qKey]; toast2('لم تُسجَّل الإجابة (انتهى الوقت أو انقطع الاتصال).'); }
      renderPlayer();
    }
  }
  function onAnswerClick(i) {
    const q = R.question; if (!q) return;
    if ((R.myUses || {}).second) {
      if (R.sel.includes(i)) R.sel = R.sel.filter(x => x !== i); else if (R.sel.length < 2) R.sel.push(i);
      if (R.sel.length === 2) return sendAnswer({ c: R.sel[0], c2: R.sel[1] });
      return renderPlayer();
    }
    return sendAnswer({ c: i });
  }
  function cardsBar(q, mine) {
    const s = S(); if (!s.shop) return '';
    const st = normS(R.stats[api.uid]), used = R.myUses || {};
    const btn = id => { const c = CARDS[id], n = st.cards[id] || 0, na = (id !== 'double') && (q.t === 'num' || (q.o || []).length < 3); return `<button class="oPw ${used[id] ? 'on' : ''}" data-oa="useCard" data-id="${id}" ${n <= 0 || used[id] || mine !== undefined || na ? 'disabled' : ''} title="${E(c.desc)}">${c.emoji} ${c.name} <b>${used[id] ? '✓' : n}</b></button>`; };
    return `<div class="oPws">${btn('fifty')}${btn('double')}${btn('second')}${st.cards.shield ? `<span class="oPw on">🛡️ درع ×${st.cards.shield}</span>` : ''}</div>${used.second && mine === undefined ? `<p class="oStatus">🔄 اختر إجابتين بالترتيب: الأولى ثم الثانية (${R.sel.length}/2)</p>` : ''}`;
  }
  function kingdomHtml(k, canBuild) {
    const st = normS(R.stats[api.uid]), s = S();
    const wallet = [['🪙', 'الذهب', k.gold], ['💎', 'الجواهر', k.gems], ['⭐', 'النجوم', k.stars], ['🌾', 'المحاصيل', k.crops], ['📚', 'المعرفة', Object.values(k.knowledge).reduce((a, b) => a + b, 0)]];
    const scene = BUILDINGS.filter(b => k.buildings[b.id]).map(b => `<div class="sceneItem"><span class="emoji">${b.emoji}${'✨'.repeat(k.buildings[b.id] - 1)}</span>${b.name}<small>المستوى ${k.buildings[b.id]}</small></div>`).join('') + k.decos.map(d => `<div class="sceneItem"><span class="emoji">${d}</span></div>`).join('');
    const regions = REGIONS.map((r, i) => `<span class="oRegion ${k.regions.includes(i) ? 'open' : ''}" title="${r[0]}">${r[1]} ${r[0]}${k.regions.includes(i) ? '' : ` <small>🔒 ${r[2]}${i === 6 ? ' + القصر' : ''}</small>`}</span>`).join('');
    const blds = BUILDINGS.map(b => {
      const lv = k.buildings[b.id] || 0, cost = b.cost * (lv + 1), need = b.know * (lv + 1), have = k.knowledge[b.cat] || 0;
      const can = canBuild && lv < 5 && k.gold >= cost && have >= need;
      return `<div class="building ${lv ? 'owned' : ''}"><div class="emoji">${b.emoji}</div><h4>${b.name}</h4><span class="badge">${lv}/5</span><p class="small">🪙 ${cost}${need ? ` · 📚 ${need} ${E(b.cat)} (معك ${have})` : ''}</p>${lv < 5 ? `<button data-oa="build" data-id="${b.id}" ${can ? '' : 'disabled'}>${lv ? 'تطوير' : 'بناء'}</button>` : '<span class="badge">مكتمل</span>'}</div>`;
    }).join('');
    const decos = DECOS.map(d => `<button data-oa="deco" data-id="${d.id}" ${canBuild && k.gold >= d.cost ? '' : 'disabled'}>${d.emoji} ${d.name} (${d.cost})</button>`).join('');
    const shop = s.shop ? `<h4>🛒 متجر البطاقات</h4><div class="buildings">${Object.entries(CARDS).filter(([id]) => id !== 'steal' || s.steal).map(([id, c]) => `<div class="building"><div class="emoji">${c.emoji}</div><h4>${c.name}</h4><p class="small">${E(c.desc)}</p><span class="badge">معك ${st.cards[id] || 0}</span><button data-oa="buy" data-id="${id}" ${canBuild && k.gold >= c.cost ? '' : 'disabled'}>شراء (${c.cost} 🪙)</button></div>`).join('')}</div>` : '';
    const rivals = playerList().filter(p => ownerOf(p.uid) !== ownerOf(api.uid));
    const steal = s.steal && canBuild && st.cards.steal > 0 && rivals.length ? `<div class="row"><select id="oStealT">${rivals.map(p => `<option value="${E(p.uid)}" ${R.stealT === p.uid ? 'selected' : ''}>${E(p.avatar)} ${E(p.name)}</option>`).join('')}</select><button data-oa="steal">🦹 استخدم بطاقة السرقة</button></div>` : '';
    const coopGoal = mode() === 'coop' ? `<div class="notice">🤝 الهدف المشترك: بناء 🏰 القصر العظيم (${(k.buildings.palace || 0) ? '✅ تم!' : `يحتاج 300 ذهب — معكم ${k.gold}`})</div>` : '';
    return `${coopGoal}<div class="grid oWallet">${wallet.map(x => `<div class="stat">${x[0]} ${x[1]}<strong>${x[2]}</strong></div>`).join('')}</div>
      <div class="kingdomScene">${scene || '<p>ابنِ أول مبنى في مملكتك!</p>'}</div>
      <h4>🗺️ مناطق المملكة (${k.regions.length}/7) — خطوات المعرفة: ${k.steps}</h4><div class="oRegions">${regions}</div>
      <h4>🏗️ المباني</h4><div class="buildings">${blds}</div><h4>🌸 الزينة</h4><div class="row">${decos}</div>${shop}${steal}`;
  }
  function myBadge() {
    const md = mode(), st = normS(R.stats[api.uid]);
    if (md === 'teams') { const t = teamInfo(ownerOf(api.uid)); return `<div class="oTeamBadge" style="background:${E(t.color)}">فريقك: ${E(t.emoji)} ${E(t.name)}</div>`; }
    if (md === 'survival') return `<div class="oTeamBadge" style="background:#c0392b">${st.out ? '🚫 خرجت — تابع مشاهدًا' : 'أرواحك: ' + '❤️'.repeat(Math.max(0, st.lives))}</div>`;
    if (md === 'tournament' && st.out) return '<div class="oTeamBadge" style="background:#555">👀 خرجت من البطولة — تابع مشاهدًا</div>';
    return '';
  }
  function renderPlayer() {
    if (R.role !== 'player' || !R.meta) { if (R.role === 'player') box().innerHTML = '<div class="panel">⏳ جارٍ التحميل…</div>'; return; }
    const keepNum = document.getElementById('oNumIn'), numVal = keepNum ? keepNum.value : '', numFocus = keepNum && document.activeElement === keepNum;
    const m = R.meta, q = R.question, rv = R.reveal, me = R.players[api.uid] || {}, k = normK(R.kingdoms[ownerOf(api.uid)]);
    let html = '';
    if (m.status === 'lobby') {
      html = `<div class="oBig">أهلًا ${E(me.avatar || '')} ${E(me.name || '')}!</div><p>انضممت إلى الغرفة <b>${E(R.code)}</b>.</p><p><span class="badge">${MODES[mode()].icon} ${MODES[mode()].name}</span> ${E(MODES[mode()].desc)}</p>${myBadge()}<p>انتظر حتى يبدأ المضيف اللعبة…</p>${chipsHtml()}`;
    } else if (m.status === 'question' && q) {
      const mine = R.myAnswer[q.qKey], left = remainMs(), can = canAnswer(api.uid);
      if (!can) html = `${qHeader()}${duelHtml()}${myBadge()}${picHtml(q)}<div class="oQ">${E(q.q)}</div>${timerHtml()}${optionsHtml(q)}<p class="oStatus">👀 ${m.only ? 'هذا السؤال للمتنافسين فقط — شجّعهم!' : 'أنت تشاهد الآن.'}</p>`;
      else html = `${qHeader()}${duelHtml()}${myBadge()}${picHtml(q)}<div class="oQ">${E(q.q)}</div>${timerHtml()}${optionsHtml(q, { clickable: true, mine: mine ? (mine.n !== undefined ? mine.n : mine.c) : undefined, mine2: mine && mine.c2, sel: R.sel, hidden: R.myHint || [], disabled: mine !== undefined || left <= 0 || m.paused })}${cardsBar(q, mine)}
        <p class="oStatus">${mine !== undefined ? '✅ أُرسلت إجابتك. بانتظار الباقين…' : m.paused ? '⏸️ أوقف المضيف اللعبة مؤقتًا' : q.t === 'num' ? 'اكتب الرقم ثم اضغط «إرسال» 👆' : 'اختر إجابتك 👆'}</p>`;
    } else if (m.status === 'reveal' && q && rv) {
      const r = (rv.results || {})[api.uid], mine = R.myAnswer[q.qKey];
      if (r && R.chMap[q.qKey] === undefined && !r.ok && S().ch !== false && !q.special) R.chMap[q.qKey] = nextCh();
      const ch = R.chMap[q.qKey];
      const res = !r ? '<div class="oResult">👀 لم تشارك في هذا السؤال</div>' : `<div class="oResult ${r.ok ? 'ok' : 'bad'}">${r.ok ? `🎉 ${r.half ? 'إجابة قريبة' : 'إجابة صحيحة'}! +${r.reward} نقطة${r.fast ? ' ⚡ الأسرع!' : ''}${r.dbl ? ' ✨ مضاعفة' : ''}${rv.golden ? ' ⭐ سؤال ذهبي' : ''}${rv.legend ? ' 🌟 سؤال أسطوري (+💎)' : ''}${r.region ? ` 🗝️ فُتحت لك «${E(r.region)}»` : ''}` : r.none ? '⏰ لم تُجب في الوقت' : '🌧️ ليست الإجابة الصحيحة'}${r.shield ? '<br>🛡️ حماك الدرع من الخسارة!' : ''}${r.lost ? '<br>−❤️ فقدت روحًا' : ''}${r.penalty ? '<br>−5 ذهب' : ''}${r.outNow ? '<br>🚫 انتهت أرواحك، تابع مشاهدًا' : ''}</div>`;
      html = `${qHeader()}${duelHtml()}${myBadge()}${res}${rv.msg ? `<div class="oEvent">${E(rv.msg)}</div>` : ''}
        ${picHtml(q)}<div class="oQ small2">${E(q.q)}</div>${optionsHtml(q, { correct: rv.correct, mine: mine ? (mine.n !== undefined ? mine.n : mine.c) : undefined, mine2: mine && mine.c2, num: rv.num })}${rv.exp ? `<div class="notice">💡 ${E(rv.exp)}</div>` : ''}
        ${ch ? chHtml(ch, `<div class="row"><button class="good" data-oa="chDone" data-q="${E(q.qKey)}" data-id="${E(ch.id)}">نفّذته! (يوافق المضيف)</button><button data-oa="chOther" data-q="${E(q.qKey)}">🔀 تحدٍّ آخر</button><button data-oa="chSkip" data-q="${E(q.qKey)}">تخطٍّ</button></div>`) : ''}
        ${eventHtml()}<h3>الترتيب</h3>${boardHtml(5)}<p class="small">بانتظار المضيف…</p>`;
    } else if (m.status === 'build') {
      html = `<div class="oBig">🏗️ مرحلة البناء</div>${myBadge()}${eventHtml()}<p>ابنِ ${mode() === 'teams' ? 'مملكة فريقك' : mode() === 'coop' ? 'المملكة المشتركة' : 'مملكتك'} واشترِ بطاقاتك قبل أن يبدأ المضيف الجولة التالية.</p>${kingdomHtml(k, true)}`;
    } else if (m.status === 'end') {
      const rk = ranking(), pos = rk.findIndex(x => x.uid === api.uid) + 1;
      html = `<div class="oBig">🎉 انتهت الرحلة!</div>${eventHtml()}${winnerHtml()}${mode() === 'teams' || mode() === 'coop' ? '' : `<div class="oWinner">ترتيبك: ${pos || '—'} من ${rk.length}</div>`}${boardHtml()}<h3>${mode() === 'teams' ? 'مملكة فريقك' : mode() === 'coop' ? 'المملكة المشتركة' : 'مملكتك'}</h3>${kingdomHtml(k, false)}<button data-oa="leave">🚪 خروج</button>`;
    } else html = '<div class="panel">⏳ بانتظار المضيف…</div>';
    const st = normS(R.stats[api.uid]);
    box().innerHTML = `<div class="panel oStage">${html}</div>
      <details class="panel" id="oMine" ${R.mineOpen ? 'open' : ''}><summary>🏰 المملكة والترتيب والبطاقات</summary>${m.status !== 'build' ? kingdomHtml(k, false) : ''}${boardHtml()}<p>بطاقاتك: ${Object.entries(CARDS).map(([id, c]) => `${c.emoji} ${st.cards[id] || 0}`).join(' · ')}</p></details>
      <div class="row"><button data-oa="toggleSnd">${LS.get('snd') === '0' ? '🔇 الصوت' : '🔊 الصوت'}</button><button data-oa="toggleVib">${LS.get('vib') === '0' ? '📴 الاهتزاز' : '📳 الاهتزاز'}</button><button class="danger" data-oa="leave">🚪 مغادرة الغرفة</button></div>`;
    const ni = document.getElementById('oNumIn'); if (ni && numVal && !ni.disabled) { ni.value = numVal; if (numFocus) ni.focus(); }
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
    R.unsubs.push(a.on(P('reveal'), v => { R.reveal = v; if (v && v.qKey !== lastRv) { lastRv = v.qKey; snd(880, 200); } renderDisplay(); }));
    R.unsubs.push(a.on(P('players'), v => { R.players = v || {}; renderDisplay(); }));
    R.unsubs.push(a.on(P('kingdoms'), v => { R.kingdoms = v || {}; renderDisplay(); }));
    R.unsubs.push(a.on(P('stats'), v => { R.stats = v || {}; renderDisplay(); }));
    R.unsubs.push(a.on(P('teams'), v => { R.teams = v || {}; renderDisplay(); }));
    R.unsubs.push(a.on(P('answers'), v => { R.allAnswers = v || {}; renderDisplay(); }));
  }
  function renderDisplay() {
    if (R.role !== 'display' || !R.meta) return;
    const m = R.meta, q = R.question, rv = R.reveal;
    let html = '';
    if (m.status === 'lobby') html = `<div class="oBig">🌙 رحلة إلى مملكة الأحلام</div><p><span class="badge">${MODES[mode()].icon} ${MODES[mode()].name}</span></p><div class="oBig">ادخلوا بالكود<div class="oCode">${E(R.code)}</div></div><p class="oLink">${E(linkFor('room'))}</p>${chipsHtml()}`;
    else if (m.status === 'question' && q) { const ans = (R.allAnswers || {})[q.qKey] || {}; html = `${qHeader()}${duelHtml()}${picHtml(q)}<div class="oQ">${E(q.q)}</div>${optionsHtml(q)}${timerHtml()}<p>أجاب ${Object.keys(ans).length} من ${Object.keys(R.players).filter(u => canAnswer(u)).length}</p>${chipsHtml(ans, true)}`; }
    else if (m.status === 'reveal' && q && rv) html = `${qHeader()}${duelHtml()}${picHtml(q)}<div class="oQ">${E(q.q)}</div>${optionsHtml(q, { correct: rv.correct, dist: rv.dist, num: rv.num })}${rv.exp ? `<div class="notice">💡 ${E(rv.exp)}</div>` : ''}${rv.msg ? `<div class="oEvent">${E(rv.msg)}</div>` : ''}${eventHtml()}${boardHtml(8)}`;
    else if (m.status === 'build') html = `<div class="oBig">🏗️ مرحلة البناء</div>${eventHtml()}<p>يبني اللاعبون ممالكهم الآن…</p>${boardHtml()}`;
    else if (m.status === 'end') html = `<div class="oBig">🎉 انتهت الرحلة!</div>${eventHtml()}${winnerHtml()}${boardHtml()}`;
    box().innerHTML = `<div class="oStage oDisplay">${html}<div class="oCtrl"><button data-oa="fs">⛶ ملء الشاشة</button></div></div>`;
  }

  /* ============================ شريط الحالة ============================ */
  function renderBar() {
    const b = document.getElementById('oBar'); if (!b) return;
    if (!R.role) { b.innerHTML = ''; return; }
    const me = R.role === 'player' ? R.players[api.uid] : null, k = me ? normK(R.kingdoms[ownerOf(api.uid)]) : null, st = me ? normS(R.stats[api.uid]) : null;
    b.innerHTML = `${R.connected ? '' : '<span class="oWarn">⚠️ انقطع الاتصال — نحاول إعادة الاتصال…</span>'}
      <span>🌐 ${E(R.code || '')}</span>${me ? `<span>${E(me.avatar)} ${E(me.name)}</span><span>🪙 ${k.gold}</span><span>⭐ ${k.stars}</span><span>🏆 ${st.score}</span>` : `<span>${R.role === 'host' ? '👑 المضيف' : '📺 شاشة العرض'}</span>`}
      <button data-oa="exitOnline">↩️ اللعبة المحلية</button>`;
  }

  /* ============================ المؤقّت العام ============================ */
  setInterval(() => {
    if (!api || !R.role || !R.meta) return;
    const t = document.getElementById('oTimer');
    if (t && R.meta.status === 'question') { const s = Math.ceil(remainMs() / 1000); t.textContent = (R.meta.paused ? '⏸️ ' : '⏳ ') + s; t.classList.toggle('low', s <= 5); }
    if (R.role === 'player' && R.meta.status === 'question' && R.question && remainMs() <= 0 && document.querySelector('[data-oa="answer"]:not([disabled]),[data-oa="sendNum"]:not([disabled])')) renderPlayer();
    if (R.role === 'host' && R.meta.status === 'question' && !R.meta.paused && R.question && R.question.qKey === R.meta.qKey && api.now() >= R.question.endsAt + 800) finishQuestion();
  }, 250);

  /* ============================ الأحداث ============================ */
  document.addEventListener('toggle', e => { const t = e.target; if (!t || !t.id) return; if (t.id === 'oManage') H.manageOpen = t.open; if (t.id === 'oMine') R.mineOpen = t.open; }, true);
  document.addEventListener('change', e => {
    const id = e.target && e.target.id; if (id === 'oDuelA') H.duelA = e.target.value; if (id === 'oDuelB') H.duelB = e.target.value; if (id === 'oStealT') R.stealT = e.target.value;
    const s = e.target.closest('[data-oa-change]'); if (!s) return;
    if (s.dataset.oaChange === 'team' && R.role === 'host') setTeam(s.dataset.u, s.value).catch(err => toast2('تعذّر نقل اللاعب.'));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.id === 'oNumIn') { const b = document.querySelector('[data-oa="sendNum"]'); if (b) b.click(); } });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-oa]'); if (!b) return;
    const act = b.dataset.oa;
    const run = f => Promise.resolve().then(f).catch(err => { console.warn(err); toast2('حدث خطأ في الاتصال: ' + (err && err.message || err)); });
    const req = o => api.push(P('requests'), Object.assign({ uid: api.uid, at: api.TS }, o));
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
      case 'endNow': if (confirm('إنهاء اللعبة الآن وإعلان النتائج؟')) return run(() => metaUp({ status: 'end', allowJoin: false, duel: null, only: null })); return;
      case 'redoRound': if (confirm('إعادة الجولة الحالية من سؤالها الأول؟ (تبقى النقاط المكتسبة)')) return run(() => startQuestion(R.meta.round || 1, 1)); return;
      case 'copy': try { navigator.clipboard.writeText(linkFor('room')); toast2('تم نسخ الرابط.'); } catch (err) { } return;
      case 'chYes': return run(() => decideChallenge(b.dataset.k, true));
      case 'chNo': return run(() => decideChallenge(b.dataset.k, false));
      case 'event': b.disabled = true; return run(() => fireEvent(b.dataset.id));
      case 'groupYes': return run(groupSuccess);
      case 'groupNo': return run(() => api.update(P('meta'), { groupCh: null, event: { id: 'groupFail', text: '👨‍👩‍👧 لم ينجح التحدي الجماعي هذه المرة. حاولوا لاحقًا!', at: api.TS } }));
      case 'duel': b.disabled = true; return run(startDuel);
      case 'tiebreak': b.disabled = true; return run(startTiebreak);
      case 'answer': return run(() => onAnswerClick(+b.dataset.i));
      case 'sendNum': { const v = parseFloat(String($('oNumIn').value).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫', '.')); if (!isFinite(v)) return toast2('اكتب رقمًا صحيحًا.'); return run(() => sendAnswer({ n: v })); }
      case 'useCard': b.disabled = true; return run(() => req({ t: 'use', id: b.dataset.id, q: R.question.qKey }));
      case 'buy': b.disabled = true; return run(() => req({ t: 'buy', id: b.dataset.id }));
      case 'steal': b.disabled = true; return run(() => req({ t: 'steal', target: $('oStealT').value }));
      case 'build': b.disabled = true; return run(() => req({ t: 'b', id: b.dataset.id }));
      case 'deco': b.disabled = true; return run(() => req({ t: 'd', id: b.dataset.id }));
      case 'chDone': b.disabled = true; b.textContent = '⏳ بانتظار موافقة المضيف'; return run(() => req({ t: 'ch', q: b.dataset.q, id: b.dataset.id }));
      case 'chOther': R.chMap[b.dataset.q] = nextCh(); return renderPlayer();
      case 'chSkip': R.chMap[b.dataset.q] = false; return renderPlayer();
      case 'toggleSnd': LS.set('snd', LS.get('snd') === '0' ? '1' : '0'); return renderPlayer();
      case 'toggleVib': LS.set('vib', LS.get('vib') === '0' ? '1' : '0'); return renderPlayer();
      case 'leave': if (!confirm('مغادرة الغرفة؟ يمكنك العودة لاحقًا بالكود نفسه.')) return;
        return run(async () => { const code = R.code; if (R.presenceOff) { R.presenceOff(); R.presenceOff = null; } await api.update('rooms/' + code + '/players/' + api.uid, { online: false }).catch(() => { }); stopListeners(); document.body.classList.remove('onlineMode'); R.role = null; renderHome(); renderBar(); });
      case 'fs': { const el = document.documentElement; if (!document.fullscreenElement) el.requestFullscreen && el.requestFullscreen(); else document.exitFullscreen && document.exitFullscreen(); return; }
      case 'exitOnline': stopListeners(); R.role = null; document.body.classList.remove('onlineMode', 'displayMode'); renderBar(); renderHome(); if (typeof showScreen === 'function') showScreen('setup'); return;
    }
  });

  /* ============================ البدء ============================ */
  window.DKOnline = { open() { if (!R.role) renderHome(); }, _state: R, _host: H };
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
