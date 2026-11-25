/* =====================================================================
   مملكة أمينة للمذاكرة — محرّك اللعبة
   3 أراضي (رياضيات · علوم · دراسات) + قلعة + متجر + إنجازات + صندوق الأخطاء
   + «الورقة الذهبية» (سؤال مفتوح يتكتب على ورقة وماما تصححه)
   + «صيد الكلمات المفتاحية» (أسئلة بم تفسر/دلل من غير كتابة)
   الحفظ على الجهاز (localStorage). مفيش خسارة ذهب على الغلط.
   ===================================================================== */
(function () {
  'use strict';
  const ENG = window.ENG, SE = window.SE, SK = window.SK;
  const $ = s => document.querySelector(s);
  const app = $('#app');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuf = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const today = () => new Date().toISOString().slice(0, 10);
  const N = s => ENG.num(s), fmt = n => ENG.fmt(n);
  const eqN = (v, a) => !isNaN(N(v)) && N(v) === N(a);
  const normAr = s => SE.norm(s);
  const normEn = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  /* ------------------------- الحفظ ------------------------- */
  const KEY = 'study-kingdom-v1';
  const NEW = () => ({ name: 'أمينة', gold: 50, ok: {}, bad: {}, st: {}, boss: {}, b: {}, castle: 0, decos: [], pets: [], outfits: [], outfit: '', ach: {}, pens: 0, paperStars: 0, keysPerfect: 0, bestStreak: 0, days: [], lastDay: '', pin: '', sound: true, answers: 0, fixed: 0, arHelp: false, wb: {}, fz: { build: {}, frame: {}, fusha: {} }, mdays: [], daily: {} });
  let G = NEW();
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) G = Object.assign(NEW(), s); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) {} };

  /* ------------------------- الصوت ------------------------- */
  let AC = null;
  const tone = (fr, d, type) => { if (!G.sound) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t0 = AC.currentTime; fr.forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t0 + i * d); g.gain.exponentialRampToValueAtTime(.16, t0 + i * d + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + (i + 1) * d); o.connect(g).connect(AC.destination); o.start(t0 + i * d); o.stop(t0 + (i + 1) * d + .05); }); } catch (e) {} };
  const sfx = { ok: () => tone([660, 880, 1320], .1), no: () => tone([330, 260], .14, 'triangle'), pop: () => tone([560], .05), win: () => tone([523, 659, 784, 1047, 1319], .12), build: () => tone([392, 523, 659, 784], .09, 'square') };
  const speak = (text, lang) => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ' ').replace(/……|_{3,}|\.\.\./g, lang === 'ar' ? ' فراغ ' : ' blank ').replace(/×/g, lang === 'ar' ? ' في ' : ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ')); u.lang = lang === 'ar' ? 'ar-EG' : 'en-US'; u.rate = .9; const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith(lang === 'ar' ? 'ar' : 'en')); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {} };

  /* ------------------------- المملكة ------------------------- */
  const ARL = it => it.s === 'soc' || it.s === 'ar';   /* أسئلة عربي الشكل (دراسات + لغة عربية) */
  const BLD = {
    math: [
      { id: 'bakery', name: 'مخبز الكب كيك', looks: ['🥚', '🧁', '🧁🍰', '🎂🧁', '🎂🧁👑'], d: 'هنا بنخبز الأرقام: كل كيكة متقسمة حتت متساوية زي القسمة بالظبط.' },
      { id: 'pizza', name: 'مطعم البيتزا', looks: ['🍅', '🍕', '🍕🍝', '🍕🍝🥤', '🏪🍕⭐'], d: 'البيتزا بتتقطع زي نموذج المساحة: 36 × 7 = (30 × 7) + (6 × 7).' },
      { id: 'choco', name: 'مصنع الشيكولاتة', looks: ['🍫', '🍫🍬', '🏭🍫', '🏭🍫🍭', '🏭🍫🌈'], d: 'ألواح الشيكولاتة صفوف وعواميد: 3 صفوف × 5 = 15 مربع.' },
      { id: 'market', name: 'سوق الأرقام', looks: ['🧺', '⛺', '🛒', '🏪', '🏬'], d: 'كل مستوى بيخفّض أسعار المتجر 4%.' }
    ],
    sci: [
      { id: 'fennec', name: 'محمية الفنك', looks: ['🌵', '🦊', '🦊🌵', '🦊🦎🌵', '🦊🦎🐪'], d: 'بيت ثعلب الفنك والجربوع والجمل: حيوانات اتكيّفت مع الصحرا.' },
      { id: 'butterfly', name: 'بيت الفراشات', looks: ['🥚', '🐛', '🐛🍃', '🦋', '🦋🌸🐝'], d: 'دورة الحياة: بيضة ← يرقة ← عذراء ← حشرة كاملة.' },
      { id: 'greenhouse', name: 'الصوبة', looks: ['🌱', '🌿', '🪴', '🌻', '🌻🌽🫘'], d: 'البذرة بتاكل من الفلقتين لحد ما ورقها يوصل للنور.' },
      { id: 'lighthouse', name: 'برج الضوء', looks: ['🕯️', '🔦', '💡', '🗼', '🗼🌞'], d: 'الضوء بيمشي في خطوط مستقيمة من فوق البرج.' }
    ],
    soc: [
      { id: 'compass', name: 'منارة البوصلة', looks: ['🧭', '🧭⭐', '🗼🧭', '🗼🧭✨', '🗼🧭🌟'], d: 'الإبرة المغناطيسية بتشاور دايمًا على الشمال.' },
      { id: 'museum', name: 'متحف الأجداد', looks: ['🏺', '🏺📜', '🏛️', '🏛️🏺', '🏛️👑'], d: 'حكايات المصريين القدماء: أخيتاتون والنجم القطبي.' },
      { id: 'maps', name: 'بيت الخرائط', looks: ['📜', '🗺️', '🗺️📍', '🗺️🧭📍', '🌍🗺️'], d: 'عنوان الخريطة ومفتاحها ومقياس الرسم ووردة الاتجاهات.' },
      { id: 'port', name: 'ميناء النيل', looks: ['🛶', '⛵', '⛵⛵', '🚢', '🚢⚓🌊'], d: 'النيل والسواحل: طرق مصر للتجارة والسياحة.' }
    ],
    ict: [
      { id: 'satstation', name: 'محطة الأقمار الصناعية', looks: ['📡', '🛰️', '🛰️📡', '🛰️🌍', '🛰️🌍🚀'], d: 'GPS والأقمار الصناعية بيلاقوا أي مكان، والـGPR والماجنتوميتر بيدوّروا تحت الأرض.' },
      { id: 'complab', name: 'معمل الكمبيوتر', looks: ['⌨️', '🖱️⌨️', '💻', '💻🖨️', '🖥️💻🖨️'], d: 'إدخال ← معالجة ← إخراج. والمعالج CPU هو مخ الكمبيوتر.' },
      { id: 'robots', name: 'مصنع الروبوتات', looks: ['🔩', '🤖', '🤖🦾', '🤖🦾🦿', '🤖🤖🚀'], d: 'التكنولوجيا المساعدة بتساعد أصحاب الهمم يعملوا كل حاجة.' },
      { id: 'pwcastle', name: 'قلعة كلمات السر', looks: ['🔑', '🔐', '🛡️🔐', '🏰🔐', '🏰🛡️✨'], d: 'كلمة السر القوية: 8 رموز على الأقل، حروف وأرقام ورموز، ومن غير اسمك.' }
    ],
    ar: [
      { id: 'library', name: 'مكتبة الحكايات', looks: ['📄', '📖', '📚', '📚🕯️', '🏛️📚'], d: 'كل حكاية في الكتاب ليها فكرة عامة وشخصية رئيسة وقيمة. اقري الفقرة مرتين قبل الأسئلة.' },
      { id: 'palmtree', name: 'نخلة الكلمات', looks: ['🌱', '🌴', '🌴🌴', '🌴🐪', '🌴🐪🏜️'], d: 'كل كلمة ليها معنى ومضاد وجمع: «الحلم» ← «الأحلام».' },
      { id: 'penhouse', name: 'بيت القلم', looks: ['✏️', '🖋️', '🖋️📜', '🖋️📜✨', '🏡🖋️📜'], d: 'الجملة الاسمية: مبتدأ + خبر. «الشجرةُ عجوزٌ».' },
      { id: 'stage', name: 'مسرح الشعر', looks: ['🎤', '🎭', '🎭🎶', '🎪🎭', '🎪🎭⭐'], d: 'اسلمي يا مصر، وطريق السعادة، وفي البستان: نقرا الشعر بصوت عالي ونفهم معاني كلماته.' }
    ]
  };
  const CASTLE = { looks: ['🛖', '🏠', '🏯', '🏰', '🏰👑'], gold: [40, 80, 140, 220, 320], stars: [0, 6, 15, 30, 50] };
  const B_GOLD = [30, 60, 100, 150, 220], B_MAST = [5, 20, 40, 60, 80];
  const SHOP = {
    outfit: [['🎀', 'فيونكة', 30], ['🌸', 'وردة', 25], ['👒', 'قبعة الصيف', 40], ['🕶️', 'نضارة شمس', 40], ['🎩', 'قبعة الساحر', 55], ['🎓', 'قبعة التخرج', 80], ['👑', 'تاج الملكة', 120]],
    pet: [['🐥', 'كتكوت', 25], ['🐰', 'أرنوب', 30], ['🐢', 'سلحفاة', 30], ['🐶', 'كلب', 50], ['🐱', 'قطة صاحبة مشمش', 50], ['🦜', 'ببغاء', 60], ['🐴', 'حصان', 80], ['🐬', 'دولفين', 110], ['🐼', 'باندا', 120], ['🦄', 'حصان سحري', 160]],
    deco: [['🌳', 'شجرة', 15], ['🌷', 'ورد', 15], ['🎈', 'بلالين', 20], ['🏮', 'فانوس', 30], ['🎨', 'مرسم أمينة', 70], ['⛲', 'نافورة', 60], ['🌈', 'قوس قزح', 120]]
  };
  const lvOf = id => G.b[id] || 0;
  const landItems = l => l.all;
  const mastery = l => { const a = landItems(l); return a.length ? Math.round(a.filter(id => G.ok[id]).length / a.length * 100) : 0; };
  const starsTotal = () => Object.values(G.st).reduce((s, v) => s + v, 0) + Object.values(G.boss).reduce((s, v) => s + v, 0) + G.paperStars;
  const discount = () => Math.min(0.4, lvOf('market') * 0.04);
  const price = p => Math.round(p * (1 - discount()));
  function bReq(landId, b) {
    const lv = lvOf(b.id) + 1; if (lv > 5) return null;
    const l = SK.lands.find(x => x.id === landId), m = mastery(l);
    const need = [{ ok: G.gold >= B_GOLD[lv - 1], t: `🪙 ${B_GOLD[lv - 1]}` }, { ok: m >= B_MAST[lv - 1], t: `إتقان ${l.sub} ${B_MAST[lv - 1]}% (دلوقتي ${m}%)` }];
    if (lv > 1) need.push({ ok: G.castle >= lv - 1, t: `القلعة في المستوى ${lv - 1}` });
    return { lv, gold: B_GOLD[lv - 1], need, can: need.every(x => x.ok) };
  }
  function cReq() {
    const lv = G.castle + 1; if (lv > 5) return null; const s = starsTotal();
    const need = [{ ok: G.gold >= CASTLE.gold[lv - 1], t: `🪙 ${CASTLE.gold[lv - 1]}` }, { ok: s >= CASTLE.stars[lv - 1], t: `⭐ ${CASTLE.stars[lv - 1]} نجمة (معاكي ${s})` }];
    return { lv, gold: CASTLE.gold[lv - 1], need, can: need.every(x => x.ok) };
  }
  const harvestAmount = () => G.castle * 5 + Object.values(BLD).flat().reduce((s, b) => s + lvOf(b.id) * 2, 0);

  /* ------------------------- الإنجازات ------------------------- */
  const nOk = () => Object.keys(G.ok).length;
  const ACH = [
    ['first', '🌱', 'أول إجابة صح', () => nOk() >= 1],
    ['ok25', '⭐', '25 إجابة صح', () => nOk() >= 25],
    ['ok100', '🌟', '100 إجابة صح', () => nOk() >= 100],
    ['ok300', '💫', '300 إجابة صح', () => nOk() >= 300],
    ['build1', '🏗️', 'أول مبنى', () => Object.values(G.b).some(v => v > 0)],
    ['all3', '🗺️', 'مبنى في كل أرض', () => SK.lands.every(l => BLD[l.id] && BLD[l.id].some(b => lvOf(b.id) > 0))],
    ['lv5', '🏆', 'مبنى في المستوى الخامس', () => Object.values(G.b).some(v => v >= 5)],
    ['castle3', '🏰', 'القلعة في المستوى 3', () => G.castle >= 3],
    ['star3', '🌠', '3 نجوم في مرحلة', () => Object.values(G.st).some(v => v >= 3)],
    ['boss1', '🐉', 'هزمتي أول امتحان ملك', () => Object.values(G.boss).some(v => v > 0)],
    ['pen1', '✍️', 'أول ورقة ذهبية', () => G.pens >= 1],
    ['pen10', '📜', '10 ورقات ذهبية', () => G.pens >= 10],
    ['keys10', '🔑', '10 صيد كلمات كامل', () => G.keysPerfect >= 10],
    ['streak5', '🔥', '5 صح ورا بعض', () => G.bestStreak >= 5],
    ['streak10', '☄️', '10 صح ورا بعض', () => G.bestStreak >= 10],
    ['fix10', '🔁', 'صلّحتي 10 من صندوق الأخطاء', () => G.fixed >= 10],
    ['pets3', '🐾', '3 حيوانات في المملكة', () => G.pets.length >= 3],
    ['days3', '📅', 'لعبتي 3 أيام مختلفة', () => G.days.length >= 3],
    ['days7', '🗓️', 'لعبتي 7 أيام مختلفة', () => G.days.length >= 7],
    ['land50', '🧠', 'إتقان 50% من أرض كاملة', () => SK.lands.some(l => mastery(l) >= 50)],
    ['words20', '🌱', '20 كلمة في الحديقة', () => Object.keys(G.wb || {}).length >= 20],
    ['bloom30', '🌻', '30 كلمة ثابتة (فتّحت)', () => Object.values(G.wb || {}).filter(e => e.b >= 4).length >= 30],
    ['sent20', '🧩', '20 جملة فصحى', () => G.fz ? Object.keys(G.fz.build).length + Object.keys(G.fz.frame).length + Object.keys(G.fz.fusha).length >= 20 : false],
    ['mission7', '📅', 'مهمة اليوم 7 أيام', () => (G.mdays || []).length >= 7]
  ];
  function checkAch() {
    const got = [];
    ACH.forEach(([id, e, t, ok]) => { if (!G.ach[id] && ok()) { G.ach[id] = today(); G.gold += 20; got.push(e + ' ' + t); } });
    if (got.length) { save(); got.forEach((g, i) => setTimeout(() => toast('🏅 إنجاز جديد: ' + g + ' (+20 🪙)', 'gold'), 400 + i * 2300)); }
    return got;
  }

  /* ------------------------- مشمش ------------------------- */
  const CHEER = ['برافو يا أمينة! 🎉', 'الله عليكي! ⭐', 'صح الصح! 🌟', 'دماغك سريعة! 🚀', 'شاطرة جدًا! 💛', 'مشمش فخور بيكي! 🐱'];
  const SOFT = ['قربتي جدًا! 💪 بصّي على الإجابة وخطواتها', 'مش مشكلة 🌸 الغلط بيعلّمنا، وهيرجعلك في صندوق الأخطاء', 'عادي خالص 🐱 مرة الجاية هتعرفيها'];
  const mish = (txt, mood) => `<div class="mish ${mood || ''}"><span class="mface"><img src="../math/img/face.webp" alt="مشمش">${G.outfit ? `<i>${G.outfit}</i>` : ''}</span><p>${txt}</p></div>`;

  /* ------------------------- واجهة عامة ------------------------- */
  let V = 'home', VA = null, RUN = null, CUR = null;
  function hud() {
    $('#hud').innerHTML = `<span>🪙 ${G.gold}</span><span>⭐ ${starsTotal()}</span><span>✍️ ${G.pens}</span>`;
  }
  function toast(t, cls) { const d = document.createElement('div'); d.className = 'toast ' + (cls || ''); d.innerHTML = t; document.body.appendChild(d); setTimeout(() => d.classList.add('out'), 2000); setTimeout(() => d.remove(), 2500); }
  function sheet(html) { const s = $('#sheet'); s.innerHTML = `<div class="sbox">${html}<button class="btn ghost wide" data-a="close">إغلاق</button></div>`; s.classList.remove('hide'); }
  const closeSheet = () => $('#sheet').classList.add('hide');
  function go(v, a) { try { speechSynthesis.cancel(); } catch (e) {} closeSheet(); V = v; VA = a; draw(); window.scrollTo(0, 0); }
  function draw() {
    hud();
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.go === V || (V === 'land' && b.dataset.go === 'lands')));
    $('#nav').classList.toggle('hide', V === 'play' || V === 'paper' || V === 'wplay' || V === 'fplay');
    app.innerHTML = (VIEWS[V] || VIEWS.home)();
    if (V === 'play' && CUR) afterDraw();
  }

  /* ------------------------- الشاشات ------------------------- */
  const VIEWS = {};
  VIEWS.home = () => {
    const due = Object.keys(G.bad).filter(id => SK.items[id]).length;
    return `<section class="hero"><img src="../social/img/explorer.webp" alt="مشمش المستكشف"><div><h2>أهلاً يا ${esc(G.name)}! 👋</h2><p>دي مملكتك 🏰 كل إجابة صح بتجيب ذهب، والذهب بيبني المملكة. ومفيش حاجة بتضيع لو غلطتي 🌸</p></div></section>
    ${missionCard()}
    <div class="tiles">
      <button class="tile" data-go="lands"><b>🎮</b><span>يلا نلعب</span><small>اختاري أرض ومرحلة</small></button>
      <button class="tile" data-go="kingdom"><b>${CASTLE.looks[Math.max(0, G.castle - 1)]}</b><span>مملكتي</span><small>ابني وطوّري</small></button>
      <button class="tile" data-a="mix"><b>🎲</b><span>خلطة كل المواد</span><small>8 أسئلة من كل حاجة</small></button>
      <button class="tile" data-go="review"><b>🔁</b><span>صندوق الأخطاء</span><small>${due ? due + ' سؤال مستنيكي' : 'فاضي 🎉'}</small></button>
      <button class="tile" data-go="garden"><b>🌱</b><span>حديقة الكلمات</span><small>عربي + علوم + ICT</small></button>
      <button class="tile" data-go="factory"><b>🧩</b><span>مصنع الجمل</span><small>نبني جمل بالفصحى</small></button>
    </div>
    <div class="card"><h3>🗺️ أراضي المملكة</h3>${SK.lands.map(l => { const m = mastery(l); return `<button class="lrow" data-go="land" data-arg="${l.id}" style="--c:${l.col};--bg:${l.bg}"><span class="le">${l.emoji}</span><span class="lt"><b>${l.name}</b><small>${l.sub} · ${l.all.length} سؤال</small><span class="bar"><i style="width:${m}%"></i></span></span><span class="lp">${m}%</span></button>`; }).join('')}</div>
    ${mish(pickOne(['الورقة الذهبية 📜 بتجيب أكبر مكافأة في اللعبة! اكتبيها على ورقة وورّيها لماما.', 'صيد الكلمات 🔑: في أسئلة «بم تفسر» اختاري الكلمات المهمة اللي لازم تبقى في الإجابة.', 'كل مبنى في المملكة محتاج إتقان أرضه… يعني كل ما تذاكري أكتر المملكة تكبر 🏗️', 'لو عايزة تحلي كتابة من غير لعب، صفحات المواد فيها زرار طباعة 🖨️']))}`;
  };
  VIEWS.lands = () => `<h2>🎮 اختاري الأرض</h2>${SK.lands.map(l => { const m = mastery(l); return `<button class="bigland" data-go="land" data-arg="${l.id}" style="--c:${l.col};--bg:${l.bg}"><span class="le">${l.emoji}</span><span class="lt"><b>${l.name}</b><small>${l.sub} · ${l.stages.length} مرحلة + ${l.boss.length} امتحان ملك</small><span class="bar"><i style="width:${m}%"></i></span><small>إتقان ${m}%</small></span></button>`; }).join('')}`;
  VIEWS.land = () => {
    const l = SK.lands.find(x => x.id === VA); const m = mastery(l);
    const stars = s => '★'.repeat(G.st[s.id] || 0) + '☆'.repeat(3 - (G.st[s.id] || 0));
    const done = s => s.ids.filter(id => G.ok[id]).length;
    return `<div class="top"><button class="hb" data-go="lands">→</button><b>${l.emoji} ${l.name}</b></div>
    <section class="lhero" style="--c:${l.col};--bg:${l.bg}"><b>${l.sub}</b><span class="bar"><i style="width:${m}%"></i></span><small>إتقان الأرض ${m}% — المباني بتحتاجه</small><button class="btn" data-a="quick" data-l="${l.id}">⚡ جولة سريعة من الأرض كلها</button></section>
    <h3>🛤️ المراحل</h3><div class="stages">${l.stages.map((s, k) => `<button class="stage" data-a="stage" data-l="${l.id}" data-i="${k}"><span class="se">${s.emoji}</span><span class="st"><b dir="auto">${esc(s.title)}</b><small dir="auto">${esc(s.sub)} · ${done(s)}/${s.ids.length} ✔</small></span><span class="ss">${stars(s)}</span></button>`).join('')}</div>
    <h3>${l.bossEmoji} امتحانات الملك (الشهري)</h3><div class="stages">${l.boss.map((b, k) => `<button class="stage boss" data-a="boss" data-l="${l.id}" data-i="${k}"><span class="se">${l.bossEmoji}</span><span class="st"><b>${esc(b.title)}</b><small dir="auto">${esc(b.sub)} · ${b.ids.length} سؤال · 10 في كل مواجهة</small></span><span class="ss">${'★'.repeat(G.boss[b.id] || 0)}${'☆'.repeat(3 - (G.boss[b.id] || 0))}</span></button>`).join('')}</div>`;
  };
  VIEWS.review = () => {
    const ids = Object.keys(G.bad).filter(id => SK.items[id]);
    const by = SK.lands.map(l => [l, ids.filter(id => SK.items[id].s === l.id).length]);
    return `<h2>🔁 صندوق الأخطاء</h2>${mish(ids.length ? 'الأسئلة اللي غلطتي فيها مستنياكي هنا. لما تحليها صح بتطلع من الصندوق وتاخدي ذهب زيادة 💪' : 'الصندوق فاضي! كل حاجة غلطتي فيها اتصلّحت 🎉')}
    ${ids.length ? `<div class="card">${by.map(([l, n]) => `<div class="kv"><span>${l.emoji} ${l.sub}</span><b>${n}</b></div>`).join('')}<button class="btn wide" data-a="review">🔁 ابدئي المراجعة (${Math.min(8, ids.length)} أسئلة)</button></div>` : ''}`;
  };
  VIEWS.kingdom = () => {
    const c = G.castle, cr = cReq();
    const garden = G.pets.concat(G.decos);
    return `<h2>🏰 مملكتي</h2>
    <div class="realm">
      <button class="castle" data-a="bsheet" data-l="castle" data-i="castle"><span class="look">${c ? CASTLE.looks[c - 1] : '🏗️'}</span><b>القلعة الملكية</b><small>${c ? 'المستوى ' + c : 'لسه متبنتش'}${cr && cr.can ? ' · ✨ جاهزة' : ''}</small></button>
      ${SK.lands.map(l => `<div class="plot" style="--c:${l.col};--bg:${l.bg}"><div class="ph">${l.emoji} ${l.name} <small>${mastery(l)}%</small></div><div class="pg">${BLD[l.id].map(b => { const lv = lvOf(b.id), r = bReq(l.id, b); return `<button class="bld ${lv ? '' : 'empty'} ${r && r.can ? 'glow' : ''}" data-a="bsheet" data-l="${l.id}" data-i="${b.id}"><span class="look">${lv ? b.looks[lv - 1] : '🏗️'}</span><small>${b.name}</small><em>${lv ? '★'.repeat(lv) : 'أرض فاضية'}</em></button>`; }).join('')}</div></div>`).join('')}
      <div class="garden"><div class="ph">🌳 حديقة المملكة</div><div class="gg">${garden.length ? garden.map(e => `<span>${e}</span>`).join('') : '<small>اشتري حيوانات وزينة من المتجر 🛍️</small>'}</div></div>
    </div>
    <div class="row"><button class="btn" data-go="shop">🛍️ المتجر</button><button class="btn ghost" data-a="harvestInfo">🌾 الحصاد اليومي: ${harvestAmount()} 🪙</button></div>`;
  };
  VIEWS.shop = () => {
    const sec = (k, title, owned) => `<h3>${title}</h3><div class="shop">${SHOP[k].map(([e, n, p]) => { const has = owned.includes(e), pr = price(p); return `<button class="sitem ${has ? 'own' : ''}" data-a="buy" data-k="${k}" data-e="${e}"><span>${e}</span><small>${n}</small><b>${has ? (k === 'outfit' ? (G.outfit === e ? '✔ لابساه' : 'البسيه') : '✔ عندك') : '🪙 ' + pr}</b></button>`; }).join('')}</div>`;
    return `<div class="top"><button class="hb" data-go="kingdom">→</button><b>🛍️ المتجر</b></div>
    ${mish('أختار لبس جديد؟ 😺 ولا نجيب حيوان للمملكة؟' + (discount() ? ` السوق مخفّض الأسعار ${Math.round(discount() * 100)}% 🛒` : ''))}
    ${sec('outfit', '🎀 لبس مشمش', G.outfits)}${G.outfit ? '<button class="btn ghost sm" data-a="unwear">اقلعي اللبس</button>' : ''}${sec('pet', '🐾 حيوانات المملكة', G.pets)}${sec('deco', '🌷 زينة', G.decos)}`;
  };
  VIEWS.ach = () => `<h2>🏅 إنجازاتي</h2><p class="note">كل إنجاز = 20 🪙 هدية.</p><div class="achs">${ACH.map(([id, e, t]) => `<div class="ach ${G.ach[id] ? 'got' : ''}"><span>${G.ach[id] ? e : '🔒'}</span><b>${t}</b>${G.ach[id] ? `<small>${G.ach[id]}</small>` : ''}</div>`).join('')}</div>`;
  VIEWS.parents = () => {
    const stat = l => { const a = l.all, ok = a.filter(id => G.ok[id]).length, bad = a.filter(id => G.bad[id]).length; return `<div class="kv"><span>${l.emoji} ${l.sub}</span><b>${ok}/${a.length} صح · ${bad} في المراجعة</b></div>`; };
    return `<h2>👩‍⚖️ ركن ماما</h2>
    <div class="card"><h3>📊 التقدم</h3>${SK.lands.map(stat).join('')}<div class="kv"><span>✍️ ورقات ذهبية متصححة</span><b>${G.pens}</b></div><div class="kv"><span>🔑 صيد كلمات كامل</span><b>${G.keysPerfect}</b></div><div class="kv"><span>📅 أيام اللعب</span><b>${G.days.length}</b></div></div>
    <div class="card"><h3>🔒 رمز الحَكَم (اختياري)</h3><p class="note">لو حطيتي رمز، شاشة تصحيح «الورقة الذهبية» مش هتفتح غير بيه، علشان أمينة متصححش لنفسها.</p><div class="row"><input id="pinSet" class="inp" type="password" inputmode="numeric" maxlength="8" placeholder="${G.pin ? '••••' : 'مثلاً 1234'}"><button class="btn" data-a="setpin">حفظ</button>${G.pin ? '<button class="btn ghost" data-a="clearpin">شيل الرمز</button>' : ''}</div></div>
    <div class="card"><h3>💡 إزاي تستخدميها</h3><ul class="note"><li>الأسئلة جاية من صفحات المواد التلاتة نفسها، فأي تعديل في الصفحات بيظهر هنا.</li><li>«الورقة الذهبية» بتظهر مرة في كل جولة: أمينة تكتب الإجابة على ورقة، وانتي تعلّمي على الكلمات المهمة اللي كتبتها.</li><li>عايزة كويز كامل على ورق؟ صفحات المواد فيها زرار 🖨️ للطباعة مع نموذج إجابة.</li><li>مفيش خسارة ذهب على الغلط، والغلط بيروح «صندوق الأخطاء» ويرجع تاني.</li></ul></div>
    <div class="card"><h3>⚙️ إعدادات</h3><div class="row"><label>الاسم: <input id="nameSet" class="inp" value="${esc(G.name)}" maxlength="20"></label><button class="btn ghost" data-a="setname">حفظ</button></div><div class="row"><button class="btn ghost" data-a="sound">${G.sound ? '🔊 الصوت شغّال' : '🔇 الصوت مقفول'}</button><button class="btn danger" data-a="reset">🗑️ ابدئي من الأول</button></div></div>
    <p class="note">روابط المواد: <a href="../math/">الرياضيات</a> · <a href="../science/">العلوم</a> · <a href="../social/">الدراسات</a></p>`;
  };

  /* ------------------------- الجولة ------------------------- */
  const paperable = id => SK.items[id] && SK.items[id].paper;
  function pickRound(ids, n) {
    const fresh = shuf(ids.filter(id => !G.ok[id])), old = shuf(ids.filter(id => G.ok[id]));
    return fresh.concat(old).slice(0, n);
  }
  function startRun(o) {
    let list = o.list.filter(id => SK.items[id]);
    if (!list.length) { toast('مفيش أسئلة هنا لسه'); return; }
    let golden = -1;
    if (list.length >= 4 && o.mode !== 'review') {
      const pool = o.pool || list;
      const inList = list.findIndex(paperable);
      let g = inList >= 0 ? list[inList] : shuf(pool.filter(id => paperable(id) && !list.includes(id)))[0];
      if (g) { list = list.filter(id => id !== g); list.splice(Math.min(3, list.length), 0, g); golden = list.indexOf(g); }
    }
    RUN = Object.assign({}, o, { list, k: 0, right: 0, gold: 0, streak: 0, golden, hp: 7, log: [], done: null });
    newQ(); go('play');
  }
  function newQ() {
    const id = RUN.list[RUN.k], it = SK.items[id];
    CUR = prep(it); CUR.id = id; CUR.golden = RUN.k === RUN.golden; CUR.phase = CUR.golden ? 'offer' : 'q';
  }

  /* --- تجهيز السؤال: نوعه واختياراته --- */
  function prep(it) {
    const q = it.q, c = { it, kind: 'mcq', opts: null, ans: -1, dir: it.lang === 'ar' ? 'rtl' : 'ltr', pick: new Set(), seq: [] };
    if (it.s === 'math') {
      const t = q.t;
      if (t === 'mcq' || t === 'pick') { c.opts = q.o.slice(); c.ans = q.a; }
      else if (t === 'multi') c.kind = 'multi';
      else if (t === 'prop') c.kind = 'prop';
      else if (t === 'ord') c.kind = 'ord';
      else if (t === 'est') c.kind = 'est';
      else if (t === 'self') c.kind = 'self';
      else c.kind = 'input';
    } else if (ARL(it)) {
      const t = q.t;
      if (t === 'mcq') { c.opts = q.o.slice(); c.ans = q.a; }
      else if (t === 'tf') { c.kind = 'tf'; }
      else if (t === 'fill') { fillOpts(it, c); }
      else if (t === 'num') c.kind = 'input';
      else if (t === 'multi') c.kind = 'smulti';
      else if ((q.keys || []).length && !q.open) { c.kind = 'keys'; keyChips(it, c); } else c.kind = 'self';
    } else if (it.s === 'ict') {
      const t = q.t;
      if (t === 'mcq' || t === 'odd') { c.opts = q.o.slice(); c.ans = q.a; }
      else if (t === 'tf') c.kind = 'tf';
      else if (t === 'fill') { c.opts = q.o.slice(); c.ans = q.o.indexOf(q.a); }
      else if (t === 'match') c.kind = 'imatch';
      else if (t === 'sort') c.kind = 'isort';
      else c.kind = 'self';
    } else {
      const r = it.row;
      if (r[4].length > 1) { c.opts = shuf(r[4].slice()); c.ans = c.opts.indexOf(r[4][0]); }
      else sciOpts(it, c);
    }
    return c;
  }
  function fillOpts(it, c) {
    const q = it.q, acc = [].concat(q.a), A = acc.map(normAr);
    const isOk = x => { const n = normAr(x); return A.some(a => a === n || (a.length > 2 && (n.includes(a) || a.includes(n)))); };
    let o = (q.o || []).slice();
    if (!o.some(isOk)) o = [];
    if (o.length < 2) {
      const others = shuf(Object.values(SK.items).filter(x => x.s === it.s && x.q.t === 'fill' && x.id !== it.id).map(x => [].concat(x.q.a)[0]).filter(x => x && !isOk(x)));
      o = [acc[0]].concat([...new Set(others)].slice(0, 3));
    }
    c.opts = shuf(o); const ex = c.opts.findIndex(x => A.includes(normAr(x))); c.ans = ex >= 0 ? ex : c.opts.findIndex(isOk);
  }
  function sciOpts(it, c) {
    const r = it.row, a = r[4][0], picks = [];
    if (r[1] === 'Correct') { const wrong = r[3].replace(/^[^:]*:\s*/, '').replace(/^[a-z]\)\s*/, '').trim(); if (wrong && normEn(wrong) !== normEn(a)) picks.push(wrong); }
    let pool = Object.values(SK.items).filter(x => x.s === 'sci' && x.row[0] !== r[0] && x.row[4].length === 1 && x.row[1] === r[1]);
    if (pool.length < 4) pool = Object.values(SK.items).filter(x => x.s === 'sci' && x.row[0] !== r[0] && x.row[4].length === 1);
    shuf(pool).forEach(x => { const w = x.row[4][0]; if (picks.length < 3 && normEn(w) !== normEn(a) && !picks.some(p => normEn(p) === normEn(w))) picks.push(w); });
    c.opts = shuf([a].concat(picks)); c.ans = c.opts.indexOf(a);
  }
  function keyChips(it, c) {
    const keys = [...new Set(it.q.keys || [])], K = keys.map(normAr);
    const KP = it.s === 'ar' ? SK.arKeyPool : SK.socKeyPool;
    let pool = (KP[it.stage] || []).concat(...Object.values(KP));
    pool = [...new Set(pool)].filter(w => { const n = normAr(w); return !K.some(k => k === n || k.includes(n) || n.includes(k)) && !normAr(it.q.model).includes(n); });
    const extra = shuf(pool).slice(0, Math.max(3, Math.min(5, 8 - keys.length)));
    c.keys = keys; c.chips = shuf(keys.concat(extra));
  }

  /* --- تصحيح --- */
  const setEq = (a, b) => { const A = [...new Set(a)].sort((x, y) => x - y), B = [...new Set(b)].sort((x, y) => x - y); return A.length === B.length && A.every((v, i) => v === B[i]); };
  const PROPS = ['Commutative', 'Associative', 'Additive identity', 'Commutative + Associative'];
  function mathAnswer(q) {
    switch (q.t) {
      case 'col': return q.op === '+' ? q.x + q.y : q.x - q.y;
      case 'mult': return q.x * q.y;
      case 'bar': return q.total == null ? q.part + q.other : q.total - q.part;
      default: return q.a;
    }
  }
  function checkInput(it, v) {
    const q = it.q;
    if (ARL(it)) return eqN(v, q.a) || (q.alt || []).some(a => eqN(v, a));
    switch (q.t) {
      case 'word': { const nz = s => ENG.digits(s).toLowerCase().replace(/-/g, ' ').replace(/,/g, ' ').replace(/\band\b/g, ' ').replace(/\s+/g, ' ').trim(); return nz(v) === nz(q.a); }
      case 'time': { const m = ENG.digits(v).replace(/\s/g, '').replace(/[.؛;]/, ':').match(/^(\d{1,2}):(\d{2})$/); return !!m && `${+m[1]}:${m[2]}` === q.a; }
      case 'lt': return !isNaN(N(v)) && N(v) < q.n && N(v) >= 0;
      case 'gt': return !isNaN(N(v)) && N(v) > q.n;
      case 'exp': { const t = ENG.digits(v).split('+').map(x => x.replace(/[,\s]/g, '')).filter(Boolean); if (!t.every(x => /^[1-9]0*$/.test(x))) return false; const L = t.map(x => x.length); if (new Set(L).size !== L.length) return false; return t.reduce((s, x) => s + Number(x), 0) === q.n; }
      case 'factors': { const F = []; for (let i = 1; i <= q.n; i++) if (q.n % i === 0) F.push(i); return setEq(ENG.list(v), F); }
      case 'mults': { const ok = n => n > 0 && q.of.every(d => n % d === 0) && (q.min == null || n > q.min) && (q.max == null || n < q.max); const Ls = [...new Set(ENG.list(v))]; if (q.all) { const all = []; for (let n = 1; n < q.max; n++) if (ok(n)) all.push(n); return setEq(Ls, all); } return Ls.length >= q.count && Ls.every(ok); }
      default: { const a = mathAnswer(q); return eqN(v, a) || (q.alt || []).some(x => eqN(v, x)); }
    }
  }
  function answerText(it) {
    const q = it.q;
    if (it.s === 'sci') return esc(it.row[4][0]);
    if (it.s === 'ict') {
      if (q.t === 'mcq' || q.t === 'odd') return esc(q.o[q.a]);
      if (q.t === 'tf') return (q.a ? '✔ True' : '✘ False') + (q.fix ? ' — ' + esc(q.fix) : '');
      if (q.t === 'fill') return esc(q.a);
      if (q.t === 'match') return q.L.map((l, i) => `${esc(l)} → ${esc(q.R[q.a[i]])}`).join('<br>');
      if (q.t === 'sort') return q.g.map((g, k) => `<b>${esc(g)}:</b> ` + q.items.filter((_, i) => q.a[i] === k || q.a[i] === 2).map(esc).join(', ')).join('<br>');
      return esc(q.model);
    }
    if (ARL(it)) {
      if (q.t === 'mcq') return q.o[q.a];
      if (q.t === 'tf') return (q.a ? 'صح ✔' : 'خطأ ✘') + (q.fix ? ` — التصويب: ${q.fix}` : '');
      if (q.t === 'fill') return [].concat(q.a)[0];
      if (q.t === 'num') return q.a + (q.unit ? ' ' + q.unit : '');
      if (q.t === 'multi') return q.parts.map(p => `${p[0]}: ${[].concat(p[1])[0]}`).join(' · ');
      return q.model;
    }
    switch (q.t) {
      case 'mcq': case 'pick': return q.o[q.a];
      case 'lt': return 'any number less than ' + fmt(q.n) + ' (e.g. ' + fmt(q.n - 1) + ')';
      case 'gt': return 'any number greater than ' + fmt(q.n) + ' (e.g. ' + fmt(q.n + 1) + ')';
      case 'exp': return ENG.parts(q.n).map(fmt).join(' + ');
      case 'factors': { const F = []; for (let i = 1; i <= q.n; i++) if (q.n % i === 0) F.push(i); return F.join(', '); }
      case 'mults': return (q.s || q.e || []).slice(-1)[0] || '';
      case 'multi': return q.parts.map(([l, a]) => `${l}: ${a}`).join(' · ');
      case 'prop': return fmt(q.a) + ' — ' + PROPS[q.p];
      case 'ord': return q.ans.map(i => q.items[i]).join(/descend/i.test(q.q) ? ' > ' : ' < ');
      case 'est': { const r = n => Math.round(n / 1000) * 1000; return 'Actual ' + fmt(q.op === '+' ? q.x + q.y : q.x - q.y) + ' · Estimate ' + fmt(q.op === '+' ? r(q.x) + r(q.y) : r(q.x) - r(q.y)); }
      case 'self': return q.model;
      case 'time': case 'word': return q.a;
      default: { const a = mathAnswer(q); return isNaN(N(a)) ? a : fmt(N(a)) + (q.unit ? ' ' + q.unit : ''); }
    }
  }
  /* خطوات الحل بالإنجليزي (وبالعربي عند الطلب) للأسئلة اللي ملهاش خطوات مكتوبة */
  function genSteps(q) {
    const f = fmt;
    if (q.t === 'col') return [`${f(q.x)} ${q.op === '+' ? '+' : '−'} ${f(q.y)} = ${f(mathAnswer(q))}`, q.op === '+' ? 'Add from the right (ones first). If a column makes 10 or more, carry 1.' : `Subtract from the right. If the top digit is smaller, regroup. Check: ${f(mathAnswer(q))} + ${f(q.y)} = ${f(q.x)} ✔`];
    if (q.t === 'mult') { const p = ENG.parts(q.x); return [`${f(q.x)} = ${p.map(f).join(' + ')}`].concat(p.map(v => `${f(v)} × ${q.y} = ${f(v * q.y)}`), [`${p.map(v => f(v * q.y)).join(' + ')} = ${f(q.x * q.y)}`]); }
    if (q.t === 'est') { const r = n => Math.round(n / 1000) * 1000, o = q.op === '+' ? '+' : '−'; return [`Actual: ${f(q.x)} ${o} ${f(q.y)} = ${f(q.op === '+' ? q.x + q.y : q.x - q.y)}`, `Round to the nearest thousand: ${f(q.x)} → ${f(r(q.x))}, ${f(q.y)} → ${f(r(q.y))}`, `Estimate: ${f(r(q.x))} ${o} ${f(r(q.y))} = ${f(q.op === '+' ? r(q.x) + r(q.y) : r(q.x) - r(q.y))}`]; }
    if (q.t === 'bar') { const whole = q.total == null; return whole ? [`X is the whole: X = ${f(q.part)} + ${f(q.other)} = ${f(mathAnswer(q))}`] : [`X is a part: X = ${f(q.total)} − ${f(q.part)} = ${f(mathAnswer(q))}`]; }
    return [];
  }
  function genStepsAr(q) {
    const f = fmt;
    if (q.t === 'col') return [`${f(q.x)} ${q.op === '+' ? '+' : '−'} ${f(q.y)} = ${f(mathAnswer(q))}`, q.op === '+' ? 'نجمع من اليمين (الآحاد الأول)، ولو العمود طلع 10 أو أكتر نشيل 1.' : 'نطرح من اليمين، ولو الرقم اللي فوق أصغر نستلف من الجار.'];
    if (q.t === 'mult') { const p = ENG.parts(q.x); return [`نفك ${f(q.x)} = ${p.map(f).join(' + ')}`].concat(p.map(v => `${f(v)} × ${q.y} = ${f(v * q.y)}`), [`نجمع: ${f(q.x * q.y)}`]); }
    if (q.t === 'est') return ['نحسب الناتج الحقيقي، وبعدين نقرّب كل رقم لأقرب ألف ونحسب التقدير.'];
    if (q.t === 'bar') return [q.total == null ? 'X هو الكل ← نجمع الجزئين.' : 'X جزء ← الكل − الجزء التاني.'];
    return [];
  }
  /* كلمات مهمة لتصحيح الورقة */
  const STOP = 'that this with from have they their them when what which will your into than then there these those very much more most also only does both each make makes made were been being about after before because over under such like just some many other another'.split(' ');
  function paperKeys(it) {
    if (ARL(it)) return (it.q.keys || []).length ? [...new Set(it.q.keys)] : it.s === 'ar' ? ['الجملة مكتوبة كاملة', 'الحروف واضحة ومنقوطة', 'الكتابة على السطر'] : ['الإجابة مكتوبة كاملة', 'فيها سبب أو تبرير', 'الكتابة واضحة'];
    if (it.s === 'ict') { const src = it.q.t === 'self' ? (it.q.keys || []).join(' ') : (it.q.fix || ''); const ws = (src.match(/[A-Za-z+#@]+/g) || []).filter(w => w.length >= 4 && !STOP.includes(w.toLowerCase())); const k = [...new Set(ws.map(w => w.toLowerCase()))].slice(0, 4); if (it.q.t === 'self') return k.length ? k : ['the answer is complete']; return it.q.a ? ['✔ True — she marked it right'] : ['✘ False — she marked it wrong'].concat(k.length ? k : ['the correction is right']); }
    if (it.s === 'sci') { const ws = (String(it.row[4][0]).match(/[A-Za-z]+/g) || []).filter(w => w.length >= 4 && !STOP.includes(w.toLowerCase())); return [...new Set(ws.map(w => w.toLowerCase()))].slice(0, 5); }
    return ['الناتج صح', 'الخطوات مكتوبة بالترتيب', 'الكتابة واضحة والوحدة مكتوبة (لو فيه)'];
  }

  /* ------------------------- رسم السؤال ------------------------- */
  function qHead(it) {
    const l = SK.lands.find(x => x.id === it.s);
    let h = '';
    if (it.s === 'ict') {
      const q = it.q; h += `<div class="qt" dir="ltr">${q.t === 'odd' ? 'Cross out the odd word:' : esc(q.q)}</div>`;
      if (q.t === 'imatch' || q.t === 'match') h += `<div class="rlist" dir="ltr">${q.R.map((x, i) => `<div><b>${'abcde'[i]})</b> ${esc(x)}</div>`).join('')}</div>`;
    } else if (it.s === 'sci') {
      const r = it.row; h += `<div class="qt" dir="ltr">${esc(r[3])}</div>`;
      if (r[8] && typeof SV !== 'undefined' && SV[r[8]]) h += `<div class="fig">${SV[r[8]]}</div>`;
    } else {
      const q = it.q; h += `<div class="qt" dir="${it.lang === 'ar' ? 'rtl' : 'ltr'}">${q.q}</div>`;
      if (it.s === 'math') { if (q.fig && ENG.figs[q.fig]) h += `<div class="fig">${ENG.figs[q.fig]()}</div>`; if (q.area) h += `<div class="fig" dir="ltr"><table class="tbl"><tr><td></td>${q.area.top.map(t => `<td>${t}</td>`).join('')}</tr><tr><td>${q.area.d}</td>${q.area.bot.map(t => `<td>${t}</td>`).join('')}</tr></table></div>`; }
      if (it.s === 'ar' && q.p && window.APAS && APAS[q.p]) h = `<details class="psg" open><summary>📖 الفقرة</summary><p>${APAS[q.p]}</p></details>` + h;
      if (it.s === 'soc') { if (q.fig && SE.fig) h += `<div class="fig">${SE.fig(q.fig)}</div>`; if (q.img) h += `<img class="qimg" src="${q.img}" alt="">`; }
      if (q.t === 'col') h += `<div class="colv" dir="ltr"><div>${fmt(q.x)}</div><div>${q.op === '+' ? '+' : '−'} ${fmt(q.y)}</div></div>`;
      if (q.t === 'bar') { const whole = q.total == null; h += `<div class="barm" dir="ltr"><div class="btot">${whole ? 'X = ?' : fmt(q.total)}</div><div class="bbar"><div class="bp">${fmt(q.part)}</div><div class="bx">${whole ? fmt(q.other) : 'X'}</div></div></div>`; }
    }
    return `<div class="qtag" style="--c:${l.col}">${l.emoji} ${l.sub}<button class="say" data-a="say">🔊</button></div>` + h;
  }
  function qBody(c) {
    const it = c.it, q = it.q, dir = c.dir;
    const optBtns = (arr, cls) => `<div class="opts ${cls || ''}" dir="${dir}">${arr.map((o, i) => `<button class="opt" data-a="pick" data-i="${i}">${it.s === 'sci' ? esc(o) : o}</button>`).join('')}</div>`;
    switch (c.kind) {
      case 'mcq': return optBtns(c.opts);
      case 'tf': return `<div class="opts two"><button class="opt" data-a="tf" data-v="1">✔ صح</button><button class="opt" data-a="tf" data-v="0">✘ خطأ</button></div>`;
      case 'input': return `<div class="ans" dir="ltr"><input id="in1" class="inp ${/word|exp|factors|mults/.test(q.t) ? 'wide' : ''}" autocomplete="off" inputmode="${/word|exp|factors|mults|time/.test(q.t) ? 'text' : 'decimal'}" placeholder="${q.t === 'time' ? 'h:mm' : q.t === 'exp' ? '3,000 + 500 + 40' : '؟'}">${q.unit ? `<span class="unit">${q.unit}</span>` : ''}</div><button class="btn wide" data-a="submit">تمّ ✔</button>${it.s === 'math' && /col|mult|est|bar/.test(q.t) ? '<p class="note">💡 احسبيها في دماغك واكتبي الناتج بس، والخطوات هتظهرلك بعدها.</p>' : ''}`;
      case 'est': return `<div class="ans col" dir="ltr"><label>Actual <input id="in1" class="inp" inputmode="decimal"></label><label>Estimate <input id="in2" class="inp" inputmode="decimal"></label></div><button class="btn wide" data-a="submit">تمّ ✔</button>`;
      case 'multi': return `<div class="ans col" dir="ltr">${q.parts.map(([l], i) => `<label>${l} <input id="in${i + 1}" class="inp" inputmode="${/,/.test(q.parts[i][1]) || isNaN(N(q.parts[i][1])) ? 'text' : 'decimal'}"></label>`).join('')}</div><button class="btn wide" data-a="submit">تمّ ✔</button>`;
      case 'prop': return `<div class="ans" dir="ltr"><input id="in1" class="inp" inputmode="decimal" placeholder="?"></div><p class="note">والخاصية اسمها إيه؟</p><div class="opts" dir="ltr">${PROPS.map((p, i) => `<button class="opt ${c.prop === i ? 'sel' : ''}" data-a="prop" data-i="${i}">${p}</button>`).join('')}</div><button class="btn wide" data-a="submit">تمّ ✔</button>`;
      case 'ord': return `<div class="chips" dir="ltr">${q.items.map((t, i) => `<button class="chip" data-a="ord" data-i="${i}" ${c.seq.includes(i) ? 'disabled' : ''}>${t}</button>`).join('')}</div><div class="oline" dir="ltr">${c.seq.length ? c.seq.map(i => q.items[i]).join(' <i>›</i> ') : '<em>اضغطي على الأرقام بالترتيب…</em>'}</div><div class="row"><button class="btn ghost sm" data-a="ordreset">↺ من الأول</button><button class="btn" data-a="submit">تمّ ✔</button></div>`;
      case 'smulti': return `<div class="ans col">${q.parts.map((p, i) => `<div class="pl"><b>${p[0]}</b><div class="chips">${(p[2] || []).map((o, k) => `<button class="chip ${c.sm && c.sm[i] === k ? 'sel' : ''}" data-a="sm" data-p="${i}" data-i="${k}">${o}</button>`).join('')}</div></div>`).join('')}</div><button class="btn wide" data-a="submit">تمّ ✔</button>`;
      case 'imatch': return `<div class="ans col" dir="ltr">${q.L.map((l, i) => `<div class="pl"><b>${i + 1}) ${esc(l)}</b><div class="chips">${q.R.map((_, k) => `<button class="chip ${c.sm && c.sm[i] === k ? 'sel' : ''}" data-a="sm" data-p="${i}" data-i="${k}">${'abcde'[k]}</button>`).join('')}</div></div>`).join('')}</div><button class="btn wide" data-a="submit">تمّ ✔</button>`;
      case 'isort': { const gs = q.g.concat(q.a.includes(2) ? ['Both'] : []); return `<div class="ans col" dir="ltr">${q.items.map((t, i) => `<div class="pl"><b>${esc(t)}</b><div class="chips">${gs.map((g, k) => `<button class="chip ${c.sm && c.sm[i] === k ? 'sel' : ''}" data-a="sm" data-p="${i}" data-i="${k}">${esc(g)}</button>`).join('')}</div></div>`).join('')}</div><button class="btn wide" data-a="submit">تمّ ✔</button>`; }
      case 'keys': return `<p class="note">🔑 <b>صيد الكلمات:</b> اختاري الكلمات اللي <b>لازم</b> تبقى في الإجابة (فيه ${c.keys.length}). متختاريش كلمات غريبة!</p><div class="chips">${c.chips.map((w, i) => `<button class="chip ${c.pick.has(i) ? 'sel' : ''}" data-a="key" data-i="${i}">${w}</button>`).join('')}</div><button class="btn wide" data-a="submit">تمّ ✔ (${c.pick.size}/${c.keys.length})</button>`;
      case 'self': return `<p class="note">${ARL(it) ? 'ده سؤال رأي/كتابة. قوليه بصوتك أو اكتبيه، وبعدين قارني بالإجابة النموذجية.' : 'ده سؤال رسم/كتابة. حلّيه في الكشكول، وبعدين قارني بالإجابة النموذجية.'}</p><button class="btn wide" data-a="showmodel">👀 وريني النموذج</button>${c.showModel ? `<div class="model" dir="${dir}">${q.model}</div><div class="row"><button class="btn ok" data-a="selfok">✔ إجابتي زيها</button><button class="btn ghost" data-a="selfno">↺ لسه</button></div>` : ''}`;
    }
    return '';
  }
  function feedback(c) {
    const it = c.it, q = it.q, r = c.res;
    let h = `<div class="fb ${r.ok ? 'ok' : r.half ? 'half' : 'no'}"><b>${r.msg}</b>`;
    if (r.gain) h += ` <span class="gain">+${r.gain} 🪙</span>`;
    if ((!r.ok || (c.kind === 'keys' && c.hit) || CUR.paperDone) && !(CUR.paperDone && ARL(it))) h += `<div class="ansl"><small>الإجابة:</small><div dir="auto" style="text-align:start">${answerText(it)}</div></div>`;
    if (c.kind === 'keys' && c.hit) h += `<div class="kw">${c.keys.map(k => `<span class="${c.hit.includes(k) ? 'hit' : ''}">${c.hit.includes(k) ? '✔ ' : ''}${k}</span>`).join('')}</div>`;
    h += '</div>';
    /* الشرح */
    if (it.s === 'math') {
      const en = q.e || genSteps(q), ar = q.s || genStepsAr(q);
      if (en.length || ar.length) {
        const useAr = (G.arHelp && ar.length) || !en.length;
        h += `<div class="steps"><div class="sh"><b>${useAr ? '👣 الخطوات (الوصفة)' : '👣 Steps (the recipe)'}</b>${en.length && ar.length ? `<button class="langb" data-a="arhelp">${useAr ? 'English' : 'ع  اشرحي بالعربي'}</button>` : ''}</div><ol dir="${useAr ? 'rtl' : 'ltr'}">${(useAr ? ar : en).map(s => `<li>${s}</li>`).join('')}</ol></div>`;
      }
    } else if (it.s === 'ict') {
      const les = it.set && it.set.lesson && window.ICTL ? window.ICTL[it.set.unit - 1].lessons[it.set.lesson - 1] : null;
      const ex = q.t === 'tf' && !q.a && q.fix ? `✍️ <b>Correct it:</b> ${esc(q.fix)}` : (q.why ? '💡 ' + esc(q.why) : '');
      if (ex || les) h += `<div class="steps" dir="ltr">${ex ? `<p>${ex}</p>` : ''}${les ? `<p>📚 Lesson ${les.n}: ${esc(les.en)} <span dir="rtl">(${les.ar})</span></p>` : ''}</div>`;
    } else if (it.s === 'sci') {
      const rr = it.row; if (rr[5]) h += `<div class="steps" dir="ltr"><p>💡 ${esc(rr[5])}</p>${rr[6] ? `<p>🌍 ${esc(rr[6])}</p>` : ''}</div>`;
    } else {
      if (q.s && q.s.length) h += `<div class="steps"><ul>${q.s.map(s => `<li>${s}</li>`).join('')}</ul></div>`;
      else if (q.t === 'self') h += `<div class="steps"><p>📖 <b>الإجابة النموذجية:</b> ${q.model}</p></div>`;
    }
    return h + `<div class="row"><button class="btn ghost" data-a="sayans">🔊 اسمعي</button><button class="btn" data-a="next">${RUN.k + 1 >= RUN.list.length ? 'النتيجة 🏁' : 'التالي ▶'}</button></div>`;
  }
  VIEWS.play = () => {
    if (!RUN || !CUR) return VIEWS.home();
    const it = CUR.it, n = RUN.list.length;
    let top = `<div class="top"><button class="hb" data-a="quit">✕</button><div class="prog"><i style="width:${(RUN.k) / n * 100}%"></i></div><b>${RUN.k + 1}/${n}</b></div>`;
    if (RUN.mode === 'boss') top += `<div class="bossbar"><span>${RUN.bossEmoji}</span><div class="hp"><i style="width:${Math.max(0, RUN.hp) / 7 * 100}%"></i></div><small>${RUN.right}/7 ضربات</small></div>`;
    if (RUN.streak >= 3) top += `<div class="streak">🔥 ${RUN.streak} صح ورا بعض</div>`;
    if (CUR.phase === 'offer') {
      return top + `<div class="qcard golden"><div class="gtitle">📜 الورقة الذهبية!</div>${qHead(it)}
        ${mish('السؤال ده من أسئلة الكتابة. لو كتبتيه على ورقة وماما صححته، تاخدي <b>لحد 50 🪙 ونجمة</b>! ✍️')}
        <button class="btn gold wide" data-a="paper">✍️ هكتبها على ورقة</button><button class="btn ghost wide" data-a="nopaper">🎮 لأ، العبيها عادي</button></div>`;
    }
    if (CUR.phase === 'write') {
      return top + `<div class="qcard golden"><div class="gtitle">✍️ اكتبي على الورقة</div>${qHead(it)}
        <ol class="note"><li>اكتبي رقم السؤال والإجابة كاملة على ورقة أو في الكشكول.</li><li>${it.s === 'ict' ? (it.q.t === 'tf' ? 'Write (✓) or (✗). If it is wrong, write the correct sentence.' : 'Write a full answer in English.') : it.s === 'math' ? 'Write the steps (the recipe) and the final answer.' : it.s === 'sci' ? 'Write a full sentence: “Because …” / “It … because …”.' : 'في «بم تفسر» ابدئي بـ«لأن»، وفي «دلل» هاتي مثال.'}</li><li>لما تخلصي، نادي ماما واضغطي «خلّصت».</li></ol>
        <button class="btn gold wide" data-a="wrote">✅ خلّصت — ماما تصحح</button><button class="btn ghost wide" data-a="nopaper">🎮 أرجع ألعبها عادي</button></div>`;
    }
    return top + `<div class="qcard">${qHead(it)}${CUR.phase === 'q' ? qBody(CUR) : feedback(CUR)}</div>`;
  };
  function afterDraw() {
    if (CUR.phase !== 'q') return;
    const i1 = $('#in1'); if (i1 && !('ontouchstart' in window)) i1.focus();
    document.querySelectorAll('.ans input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') judgeQ(); }));
  }

  /* ------------------------- التصحيح والمكافأة ------------------------- */
  function award(ok, half) {
    const it = CUR.it, boss = RUN.mode === 'boss';
    let gain = 0;
    if (ok) {
      RUN.streak++; G.bestStreak = Math.max(G.bestStreak, RUN.streak);
      gain = boss ? 15 : 10; if (RUN.streak >= 3) gain += 5;
      if (G.bad[CUR.id]) { delete G.bad[CUR.id]; G.fixed++; gain += 5; }
      G.ok[CUR.id] = 1; RUN.right++; if (boss) RUN.hp--;
      sfx.ok();
    } else {
      RUN.streak = 0; G.bad[CUR.id] = Date.now();
      if (half) gain = 5; sfx.no();
    }
    G.answers++; G.gold += gain; RUN.gold += gain; RUN.log.push({ id: CUR.id, ok });
    save();
    return gain;
  }
  function finish(ok, half, extra) {
    const gain = award(ok, half);
    CUR.res = Object.assign({ ok, half, gain, msg: ok ? pickOne(CHEER) : half ? 'قربتي جدًا! 👏' : pickOne(SOFT) }, extra || {});
    CUR.phase = 'fb'; draw(); checkAch();
  }
  function judgeQ() {
    const c = CUR, it = c.it, q = it.q;
    if (c.phase !== 'q') return;
    const val = id => { const e = $('#' + id); return e ? e.value.trim() : ''; };
    switch (c.kind) {
      case 'input': { const v = val('in1'); if (!v) return toast('اكتبي إجابتك الأول 🙂'); return finish(checkInput(it, v)); }
      case 'est': { const a = val('in1'), b = val('in2'); if (!a || !b) return toast('اكتبي الاتنين 🙂'); const r = n => Math.round(n / 1000) * 1000; return finish(eqN(a, q.op === '+' ? q.x + q.y : q.x - q.y) && eqN(b, q.op === '+' ? r(q.x) + r(q.y) : r(q.x) - r(q.y))); }
      case 'multi': { const vs = q.parts.map((_, i) => val('in' + (i + 1))); if (vs.some(v => !v)) return toast('كمّلي كل الخانات 🙂'); return finish(q.parts.every(([, a], i) => String(a).includes(',') ? setEq(ENG.list(vs[i]), ENG.list(a)) : eqN(vs[i], a) || ENG.digits(vs[i]).trim().toLowerCase() === String(a).toLowerCase())); }
      case 'prop': { const v = val('in1'); if (!v || c.prop == null) return toast('اكتبي الرقم واختاري الخاصية 🙂'); return finish(eqN(v, q.a) && c.prop === q.p); }
      case 'ord': if (c.seq.length < q.items.length) return toast('رتّبي كل الأرقام 🙂'); return finish(c.seq.join() === q.ans.join());
      case 'imatch': case 'isort': { const n = (q.L || q.items).length; if (!c.sm || [...Array(n).keys()].some(i => c.sm[i] == null)) return toast('اختاري لكل سطر 🙂'); return finish(q.a.every((v, i) => c.sm[i] === v)); }
      case 'smulti': { if (!c.sm || q.parts.some((_, i) => c.sm[i] == null)) return toast('اختاري لكل رقم 🙂'); return finish(q.parts.every((p, i) => [].concat(p[1]).map(normAr).includes(normAr(p[2][c.sm[i]])))); }
      case 'keys': {
        if (!c.pick.size) return toast('اختاري الكلمات المهمة 🙂');
        const chosen = [...c.pick].map(i => c.chips[i]); c.hit = chosen.filter(w => c.keys.includes(w)); const wrong = chosen.length - c.hit.length;
        const perfect = c.hit.length === c.keys.length && !wrong, near = !perfect && c.hit.length >= Math.ceil(c.keys.length / 2) && wrong <= 1;
        if (perfect) G.keysPerfect++;
        return finish(perfect, near, { msg: perfect ? '🔑 صيد كامل! ' + pickOne(CHEER) : near ? `جبتي ${c.hit.length} من ${c.keys.length} 👏 قربتي!` : `جبتي ${c.hit.length} من ${c.keys.length} — اقري النموذج مرتين 🌸` });
      }
    }
  }

  /* --- الورقة الذهبية: شاشة الحكم --- */
  function referee() {
    const it = CUR.it, keys = paperKeys(it);
    CUR.ticks = new Set();
    const model = it.s === 'ict' ? (it.q.t === 'self' ? esc(it.q.model) : it.q.a ? '✔ True' : '✘ False — ' + esc(it.q.fix || '')) : it.s === 'sci' ? esc(it.row[4][0]) : ARL(it) ? it.q.model : (answerText(it) + ((it.q.e || genSteps(it.q)).length ? '<ol dir="ltr">' + (it.q.e || genSteps(it.q)).map(s => `<li>${s}</li>`).join('') + '</ol>' : ''));
    sheet(`<h2>👩‍⚖️ تصحيح الورقة الذهبية</h2><p class="note">ماما: قارني ورقة أمينة بالنموذج، وعلّمي على كل حاجة موجودة في إجابتها.</p>
      <div class="model" dir="${it.lang === 'ar' ? 'rtl' : 'ltr'}"><b>📖 ${it.lang === 'ar' ? 'الإجابة النموذجية' : 'Model answer'}:</b><br>${model}</div>
      <p><b>✔ علّمي على اللي اتكتب صح:</b></p><div class="ticks" dir="auto">${keys.map((k, i) => `<button class="tick" data-a="tick" data-i="${i}">☐ ${esc(k)}</button>`).join('')}</div>
      <button class="btn gold wide" data-a="grade">💾 حفظ التصحيح</button><button class="btn ghost wide" data-a="gradeAgain">🔁 محتاجة تحاول تاني (+3 🪙 للمحاولة)</button>`);
    CUR.keysN = keys.length;
  }
  function askPin(then) {
    if (!G.pin) return then();
    sheet(`<h2>🔒 رمز الحَكَم</h2><p class="note">ماما: اكتبي الرمز علشان تصححي.</p><input id="pinIn" class="inp" type="password" inputmode="numeric" maxlength="8"><button class="btn wide" data-a="pinok">موافق</button>`);
    CUR.afterPin = then; setTimeout(() => { const p = $('#pinIn'); if (p) p.focus(); }, 50);
  }
  function applyGrade(again) {
    closeSheet();
    const n = CUR.keysN || 1, t = again ? 0 : CUR.ticks.size, all = t === n;
    let gain = again ? 3 : t * 8 + (all ? 20 : 0);
    const ok = !again && t >= Math.ceil(n / 2);
    if (ok) { G.pens++; if (G.bad[CUR.id]) { delete G.bad[CUR.id]; G.fixed++; } G.ok[CUR.id] = 1; RUN.right++; RUN.streak++; G.bestStreak = Math.max(G.bestStreak, RUN.streak); if (RUN.mode === 'boss') RUN.hp--; sfx.win(); }
    else { G.bad[CUR.id] = Date.now(); RUN.streak = 0; sfx.pop(); }
    if (all) G.paperStars++;
    G.gold += gain; RUN.gold += gain; G.answers++; RUN.log.push({ id: CUR.id, ok }); save();
    CUR.kind = CUR.kind; CUR.res = { ok, half: !ok && t > 0, gain, msg: all ? '🌟 ورقة كاملة! +1 ⭐ — القلم الذهبي ✍️' : ok ? '✍️ ورقة حلوة! ' + pickOne(CHEER) : again ? 'مش مشكلة 🌸 هترجع في صندوق الأخطاء' : `علّمت ماما على ${t} من ${n} 👏` };
    CUR.phase = 'fb'; CUR.paperDone = true; draw(); checkAch();
  }

  /* --- نهاية الجولة --- */
  function endRun() {
    const n = RUN.list.length, r = RUN.right, pct = r / n;
    let stars = pct >= 1 ? 3 : pct >= .75 ? 2 : pct >= .5 ? 1 : 0, newBest = false, win = false;
    if (RUN.mode === 'stage') { if (stars > (G.st[RUN.stageId] || 0)) { G.st[RUN.stageId] = stars; newBest = true; } }
    if (RUN.mode === 'boss') { win = r >= 7; stars = win ? (r >= 9 ? 3 : r >= 8 ? 2 : 1) : 0; if (stars > (G.boss[RUN.bossId] || 0)) { G.boss[RUN.bossId] = stars; newBest = true; } if (win) { G.gold += 30; RUN.gold += 30; } }
    save(); RUN.done = { stars, newBest, win };
    if (stars || win) sfx.win();
    go('result'); checkAch();
  }
  VIEWS.result = () => {
    const R = RUN, d = R.done, n = R.list.length, wrong = R.log.filter(x => !x.ok).length;
    const big = R.mode === 'boss' ? (d.win ? `🏆 هزمتي ${R.bossEmoji} ${R.bossName}!` : `${R.bossEmoji} ${R.bossName} لسه واقف… محتاجة 7 ضربات`) : d.stars === 3 ? '🌟 جولة كاملة!' : d.stars ? '👏 برافو!' : '💪 كل جولة بتعلّمك حاجة';
    return `<div class="card res"><h2>${big}</h2><div class="bigstars">${'★'.repeat(d.stars)}${'☆'.repeat(3 - d.stars)}</div>
      <div class="kv"><span>✔ صح</span><b>${R.right} من ${n}</b></div><div class="kv"><span>🪙 ذهب الجولة</span><b>+${R.gold}${R.mode === 'boss' && d.win ? ' (منهم 30 مكافأة الفوز)' : ''}</b></div>
      ${wrong ? `<div class="kv"><span>🔁 راحوا صندوق الأخطاء</span><b>${wrong}</b></div>` : ''}${d.newBest ? '<p class="note">⭐ رقم قياسي جديد في المرحلة دي!</p>' : ''}
      ${mish(d.stars >= 2 || d.win ? 'يلا نروح نبني حاجة جديدة في المملكة! 🏗️' : 'كل سؤال غلط هيرجعلك في صندوق الأخطاء، ولما تحليه تاخدي ذهب زيادة 💛')}
      <div class="row"><button class="btn" data-a="again">🔄 تاني</button><button class="btn gold" data-go="kingdom">🏰 ابني</button>${R.landId ? `<button class="btn ghost" data-go="land" data-arg="${R.landId}">🗺️ الأرض</button>` : ''}</div></div>`;
  };

  /* ------------------------- الأحداث ------------------------- */
  function doBuild(landId, id) {
    if (id === 'castle') { const r = cReq(); if (!r || !r.can) return; G.gold -= r.gold; G.castle = r.lv; }
    else { const b = BLD[landId].find(x => x.id === id), r = bReq(landId, b); if (!r || !r.can) return; G.gold -= r.gold; G.b[id] = r.lv; }
    save(); sfx.build(); closeSheet(); draw(); toast('🎉 اتبنى! المملكة كبرت', 'gold'); checkAch();
  }
  function bSheet(landId, id) {
    if (id === 'castle') {
      const r = cReq(), c = G.castle;
      return sheet(`<h2>${c ? CASTLE.looks[c - 1] : '🏗️'} القلعة الملكية</h2><div class="looks">${CASTLE.looks.map((e, i) => `<span class="${i < c ? 'on' : ''}">${e}</span>`).join('')}</div><p class="note">قلب المملكة: كل مستوى بيفتح مستويات أعلى للمباني، وبيزوّد الحصاد اليومي 5 🪙.</p>${r ? `<h3>${c ? 'التطوير للمستوى ' + r.lv : 'ابنيها'}</h3><ul class="req">${r.need.map(x => `<li class="${x.ok ? 'ok' : ''}">${x.ok ? '✅' : '⬜'} ${x.t}</li>`).join('')}</ul><button class="btn gold wide" data-a="build" data-l="castle" data-i="castle" ${r.can ? '' : 'disabled'}>🏗️ ${c ? 'طوّري' : 'ابني'} (${r.gold} 🪙)</button>` : '<p>👑 القلعة في أعلى مستوى!</p>'}`);
    }
    const b = BLD[landId].find(x => x.id === id), lv = lvOf(id), r = bReq(landId, b);
    sheet(`<h2>${lv ? b.looks[lv - 1] : '🏗️'} ${b.name}</h2><div class="looks">${b.looks.map((e, i) => `<span class="${i < lv ? 'on' : ''}">${e}</span>`).join('')}</div><p class="note">${b.d}</p><p class="note">كل مستوى بيزوّد الحصاد اليومي 2 🪙.</p>${r ? `<h3>${lv ? 'التطوير للمستوى ' + r.lv : 'ابنيه'}</h3><ul class="req">${r.need.map(x => `<li class="${x.ok ? 'ok' : ''}">${x.ok ? '✅' : '⬜'} ${x.t}</li>`).join('')}</ul><button class="btn gold wide" data-a="build" data-l="${landId}" data-i="${id}" ${r.can ? '' : 'disabled'}>🏗️ ${lv ? 'طوّري' : 'ابني'} (${r.gold} 🪙)</button>${r.can ? '' : `<button class="btn ghost wide" data-go="land" data-arg="${landId}">📚 روحي العبي في الأرض دي</button>`}` : '<p>👑 في أعلى مستوى!</p>'}`);
  }
  function buy(k, e) {
    const item = SHOP[k].find(x => x[0] === e); if (!item) return;
    const owned = k === 'outfit' ? G.outfits : k === 'pet' ? G.pets : G.decos;
    if (owned.includes(e)) { if (k === 'outfit') { G.outfit = e; save(); draw(); } return; }
    const p = price(item[2]); if (G.gold < p) { sfx.no(); return toast(`محتاجة ${p - G.gold} 🪙 كمان`); }
    G.gold -= p; owned.push(e); if (k === 'outfit') G.outfit = e; save(); sfx.build(); draw(); toast(`${e} ${item[1]} بقى عندك!`, 'gold'); checkAch();
  }
  function stageRun(landId, k) { const l = SK.lands.find(x => x.id === landId), s = l.stages[k]; startRun({ mode: 'stage', landId, stageId: s.id, pool: s.ids, list: pickRound(s.ids, 8) }); }
  function bossRun(landId, k) { const l = SK.lands.find(x => x.id === landId), b = l.boss[k]; startRun({ mode: 'boss', landId, bossId: b.id, bossName: l.bossName, bossEmoji: l.bossEmoji, pool: b.ids, list: pickRound(b.ids, 10) }); }

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g && !e.target.closest('[data-a]')) { closeSheet(); go(g.dataset.go, g.dataset.arg); sfx.pop(); return; }
    const b = e.target.closest('[data-a]'); if (!b) { if (e.target.id === 'sheet') closeSheet(); return; }
    const a = b.dataset.a, i = b.dataset.i;
    if (a === 'close') return closeSheet();
    if (a === 'stage') return stageRun(b.dataset.l, +i);
    if (a === 'boss') return bossRun(b.dataset.l, +i);
    if (a === 'quick') { const l = SK.lands.find(x => x.id === b.dataset.l); const ids = [].concat(...l.stages.map(s => s.ids)); return startRun({ mode: 'quick', landId: l.id, pool: ids, list: pickRound(shuf(ids), 8) }); }
    if (a === 'mix') { const per = SK.lands.map(l => shuf([].concat(...l.stages.map(s => s.ids)))); const n = per.length, list = shuf([].concat(...per.map((p, k) => p.slice(0, Math.floor(8 / n) + (k < 8 % n ? 1 : 0))))); return startRun({ mode: 'mix', pool: [].concat(...per), list }); }
    if (a === 'review') { const ids = Object.keys(G.bad).filter(id => SK.items[id]).sort((x, y) => G.bad[x] - G.bad[y]); return startRun({ mode: 'review', list: ids.slice(0, 8) }); }
    if (a === 'again') { const R = RUN; if (R.mode === 'stage') { const l = SK.lands.find(x => x.id === R.landId); return stageRun(R.landId, l.stages.findIndex(s => s.id === R.stageId)); } if (R.mode === 'boss') { const l = SK.lands.find(x => x.id === R.landId); return bossRun(R.landId, l.boss.findIndex(x => x.id === R.bossId)); } if (R.mode === 'review') { const ids = Object.keys(G.bad).filter(id => SK.items[id]); if (!ids.length) return go('review'); return startRun({ mode: 'review', list: ids.slice(0, 8) }); } return startRun(Object.assign({}, R, { list: pickRound(shuf(R.pool || R.list), R.list.length), log: [], right: 0, gold: 0, k: 0, done: null })); }
    if (a === 'quit') { if (RUN && RUN.k > 0 && !confirm('تخرجي من الجولة؟ الذهب اللي كسبتيه محفوظ.')) return; RUN = null; CUR = null; return go('home'); }
    if (a === 'bsheet') return bSheet(b.dataset.l, i);
    if (a === 'build') return doBuild(b.dataset.l, i);
    if (a === 'buy') return buy(b.dataset.k, b.dataset.e);
    if (a === 'unwear') { G.outfit = ''; save(); return draw(); }
    if (a === 'harvestInfo') return sheet(`<h2>🌾 الحصاد اليومي</h2><p>كل يوم أول ما تفتحي اللعبة، المباني بتجيبلك ذهب: <b>${harvestAmount()} 🪙</b> دلوقتي.</p><p class="note">القلعة: 5 🪙 لكل مستوى · كل مبنى: 2 🪙 لكل مستوى · وهدية اليوم 15 🪙.</p>`);
    if (a === 'setpin') { const v = ($('#pinSet') || {}).value || ''; G.pin = v.trim(); save(); draw(); return toast(G.pin ? 'اتحفظ رمز الحَكَم 🔒' : 'مفيش رمز'); }
    if (a === 'clearpin') { G.pin = ''; save(); return draw(); }
    if (a === 'setname') { const v = (($('#nameSet') || {}).value || '').trim(); if (v) { G.name = v; save(); toast('اتحفظ ✔'); } return draw(); }
    if (a === 'sound') { G.sound = !G.sound; save(); return draw(); }
    if (a === 'reset') { if (confirm('متأكدة؟ هيتمسح كل التقدم والمملكة.') && confirm('آخر تأكيد: نمسح كل حاجة؟')) { G = NEW(); save(); go('home'); } return; }
    /* داخل السؤال */
    if (!CUR) return;
    if (a === 'say') { const it = CUR.it; return speak(it.s === 'sci' ? it.row[3] : (it.q.q || '') + (it.q.o ? '. ' + it.q.o.join(', ') : ''), it.lang); }
    if (a === 'sayans') { const it = CUR.it; const t = (it.s === 'sci' ? it.row[4][0] + '. ' + (it.row[5] || '') : String(answerText(it))); return speak(t, ARL(it) ? 'ar' : /[؀-ۿ]/.test(t) && it.s === 'math' ? 'ar' : it.lang); }
    if (a === 'pick' && CUR.phase === 'q') { const k = +i; b.classList.add(k === CUR.ans ? 'good' : 'bad'); return setTimeout(() => finish(k === CUR.ans), 250); }
    if (a === 'tf' && CUR.phase === 'q') return finish((b.dataset.v === '1') === !!CUR.it.q.a);
    if (a === 'prop') { CUR.prop = +i; document.querySelectorAll('[data-a=prop]').forEach(x => x.classList.toggle('sel', +x.dataset.i === CUR.prop)); return sfx.pop(); }
    if (a === 'ord') { const k = +i; if (!CUR.seq.includes(k)) CUR.seq.push(k); sfx.pop(); return draw(); }
    if (a === 'ordreset') { CUR.seq = []; return draw(); }
    if (a === 'sm') { CUR.sm = CUR.sm || {}; CUR.sm[+b.dataset.p] = +i; sfx.pop(); return draw(); }
    if (a === 'key') { const k = +i; CUR.pick.has(k) ? CUR.pick.delete(k) : CUR.pick.add(k); sfx.pop(); return draw(); }
    if (a === 'submit') return judgeQ();
    if (a === 'showmodel') { CUR.showModel = true; return draw(); }
    if (a === 'selfok') return finish(true);
    if (a === 'selfno') return finish(false);
    if (a === 'arhelp') { G.arHelp = !G.arHelp; save(); return draw(); }
    if (a === 'paper') { CUR.phase = 'write'; sfx.pop(); return draw(); }
    if (a === 'nopaper') { CUR.phase = 'q'; return draw(); }
    if (a === 'wrote') return askPin(referee);
    if (a === 'pinok') { const v = ($('#pinIn') || {}).value; if (v === G.pin) { const f = CUR.afterPin; CUR.afterPin = null; return f(); } sfx.no(); return toast('الرمز مش صح'); }
    if (a === 'tick') { const k = +i; CUR.ticks.has(k) ? CUR.ticks.delete(k) : CUR.ticks.add(k); b.classList.toggle('on', CUR.ticks.has(k)); b.textContent = (CUR.ticks.has(k) ? '☑ ' : '☐ ') + b.textContent.slice(2); return sfx.pop(); }
    if (a === 'grade') return applyGrade(false);
    if (a === 'gradeAgain') return applyGrade(true);
    if (a === 'next') { RUN.k++; if (RUN.k >= RUN.list.length || (RUN.mode === 'boss' && RUN.hp <= 0 && RUN.k >= 7)) { if (RUN.mode === 'boss') RUN.list = RUN.list.slice(0, RUN.k); return endRun(); } newQ(); draw(); window.scrollTo(0, 0); }
  });

  /* =====================================================================
     🌱 حديقة الكلمات (مراجعة متباعدة) + 🧩 مصنع الجمل (فصحى)
     ===================================================================== */
  const SW = window.SKW || { words: [], sentences: [], fusha: [], FRAMES: {} };
  const INT = [0, 1, 3, 7, 14, 30];          // أيام المراجعة لكل صندوق
  const NEW_PER_DAY = 5, SESSION_MAX = 12;
  const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const dailyToday = () => { if (G.daily.d !== today()) G.daily = { d: today(), w: false, s: 0, done: false }; return G.daily; };
  const WBY = id => SW.words.find(w => w.id === id);
  const wordsOf = s => SW.words.filter(w => !s || w.s === s);
  const dueWords = s => wordsOf(s).filter(w => G.wb[w.id] && G.wb[w.id].due <= today());
  const PLANT = ['🌰', '🌱', '🌿', '🪴', '🌷', '🌻'];
  const newLeft = () => { const d = dailyToday(); return Math.max(0, NEW_PER_DAY - (d.nw || 0)); };
  function missionCheck() {
    const d = dailyToday();
    if (!d.done && d.w && d.s >= 3) { d.done = true; G.gold += 20; if (!G.mdays.includes(d.d)) G.mdays.push(d.d); save(); setTimeout(() => toast('📅 خلّصتي مهمة اليوم! +20 🪙', 'gold'), 500); }
  }
  const missionCard = () => {
    const d = dailyToday(), due = dueWords().length;
    return `<div class="card mission"><h3>📅 مهمة اليوم <small>(10 دقايق)</small></h3>
      <button class="mrow2 ${d.w ? 'ok' : ''}" data-go="garden"><span>${d.w ? '✅' : '🌱'}</span><b>جلسة حديقة الكلمات</b><small>${d.w ? 'خلصت' : (due ? due + ' كلمة عطشانة + ' : '') + newLeft() + ' كلمة جديدة'}</small></button>
      <button class="mrow2 ${d.s >= 3 ? 'ok' : ''}" data-go="factory"><span>${d.s >= 3 ? '✅' : '🧩'}</span><b>3 جمل في مصنع الجمل</b><small>${Math.min(d.s, 3)}/3</small></button>
      ${G.mdays.length ? `<p class="note">🔥 خلّصتي المهمة ${G.mdays.length} يوم</p>` : ''}</div>`;
  };

  /* ---------- 🌱 الحديقة ---------- */
  let WS = null;
  VIEWS.garden = () => {
    const tab = VA || 'all', list = wordsOf(tab === 'all' ? null : tab);
    const planted = list.filter(w => G.wb[w.id]), due = planted.filter(w => G.wb[w.id].due <= today());
    const bloom = planted.filter(w => G.wb[w.id].b >= 4).length;
    const tabs = [['all', 'الكل'], ['ar', '📖 العربي'], ['sci', '🔬 العلوم'], ['ict', '💻 ICT']].map(([k, n]) => `<button class="${tab === k ? 'on' : ''}" data-go="garden" data-arg="${k}">${n}</button>`).join('');
    return `<h2>🌱 حديقة الكلمات</h2>
      ${mish('كل يوم <b>5 كلمات جديدة بس</b> 🌱. الكلمة بتكبر لما تفتكريها، ولو نسيتيها <b>تعطش</b> 🥀 وترجعلك تسقيها. مفيش حفظ، كله لعب!')}
      <div class="wtabs">${tabs}</div>
      <div class="card"><div class="kv"><span>🌱 مزروعة</span><b>${planted.length} من ${list.length}</b></div><div class="kv"><span>🥀 عطشانة النهارده</span><b>${due.length}</b></div><div class="kv"><span>🌻 ثابتة في دماغك</span><b>${bloom}</b></div>
      <button class="btn gold wide" data-a="wstart" data-s="${tab}">🌱 يلا جلسة اليوم (${Math.min(SESSION_MAX, due.length + newLeft())} ${Math.min(SESSION_MAX, due.length + newLeft()) <= 10 ? 'كلمات' : 'كلمة'})</button></div>
      <div class="garden2">${planted.length ? planted.map(w => { const e = G.wb[w.id], thirsty = e.due <= today(); return `<button class="pl2 ${thirsty ? 'th' : ''}" data-a="wshow" data-i="${w.id}"><span>${thirsty ? '🥀' : PLANT[Math.min(5, e.b)]}</span><small dir="auto">${esc(w.en.split('/')[0])}</small></button>`; }).join('') : '<p class="note">الحديقة لسه فاضية… أول جلسة هتزرع أول 5 كلمات 🌰</p>'}</div>`;
  };
  function wordOpts(w, field) {
    if (w.s === 'ar' && field === 'ar' && w.bo && w.bo.length >= 3 && w.bo.includes(w.ar)) { const o = shuf(w.bo.slice()); return { o, a: o.indexOf(w.ar) }; }
    let pool = SW.words.filter(x => x.s === w.s && x.id !== w.id && x[field] && x[field] !== w[field] && (w.s !== 'ar' || x.rel === w.rel));
    const same = shuf(pool.filter(x => x.g === w.g)), other = shuf(pool.filter(x => x.g !== w.g));
    const picks = [...new Set(same.concat(other).map(x => x[field]))].slice(0, 3);
    const o = shuf([w[field]].concat(picks)); return { o, a: o.indexOf(w[field]) };
  }
  function wNewQ() {
    const it = WS.list[WS.k], w = it.w, e = G.wb[w.id];
    const canSpell = /^[a-z]{3,12}$/i.test(w.en), box = e ? e.b : 0;
    let modes = w.s === 'ar' ? ['en2ar', 'en2ar', 'ar2en', 'listen'] : ['listen', 'ar2en', 'en2ar'];
    if (w.def) modes.push('def');
    if (canSpell && box >= 2) modes.push('spell', 'spell');
    it.mode = it.isNew && !it.seen ? 'intro' : pickOne(modes);
    WS.phase = it.mode === 'intro' ? 'intro' : 'q';
    WS.built = []; WS.pickOk = null;
    if (it.mode === 'listen' || it.mode === 'ar2en' || it.mode === 'def') Object.assign(it, wordOpts(w, 'en'));
    if (it.mode === 'en2ar') Object.assign(it, wordOpts(w, 'ar'));
    if (it.mode === 'spell') it.tiles = shuf(w.en.toLowerCase().split('').map((c, i) => ({ c, i })));
    if (it.mode === 'listen') setTimeout(() => speak(w.en, w.s === 'ar' ? 'ar' : 'en'), 300);
  }
  function wStart(s) {
    const subj = s === 'all' ? null : s;
    const due = dueWords(subj).sort((a, b) => G.wb[a.id].due.localeCompare(G.wb[b.id].due) || G.wb[a.id].b - G.wb[b.id].b);
    let list = due.slice(0, SESSION_MAX).map(w => ({ w }));
    const room = Math.min(newLeft(), SESSION_MAX - list.length);
    if (room > 0) {
      let fresh = wordsOf(subj).filter(w => !G.wb[w.id]).sort((a, b) => a.n - b.n);
      if (!subj) { const qs = ['ar', 'sci', 'ict'].map(k => fresh.filter(w => w.s === k)); fresh = []; while (qs.some(q => q.length)) qs.forEach(q => { if (q.length) fresh.push(q.shift()); }); }
      list = fresh.slice(0, room).map(w => ({ w, isNew: true })).concat(list);
    }
    if (!list.length) { toast('مفيش كلمات عطشانة النهارده 🌻 تعالي بكرة!'); return; }
    WS = { list, k: 0, right: 0, gold: 0, planted: 0, s };
    wNewQ(); go('wplay');
  }
  const REL = {
    mean: { f: 'معنى', r: 'أنهي كلمة معناها:', tip: 'قوليها في جملة من عندك بصوت عالي، وارسمي معناها رسمة صغيرة 🎨' },
    opp: { f: 'مضاد', r: 'أنهي كلمة مضادها:', tip: 'تخيّلي الكلمة ومضادها صورتين عكس بعض، زي ⬆️⬇️ وارسميهم.' },
    pl: { f: 'جمع', r: 'إيه مفرد الكلمة دي؟', tip: 'المفرد واحد ☝️ والجمع كتير 🖐️ — قوليهم ورا بعض 3 مرات.' }
  };
  VIEWS.wplay = () => {
    if (!WS) return VIEWS.garden();
    const it = WS.list[WS.k], w = it.w, n = WS.list.length;
    let h = `<div class="top"><button class="hb" data-a="wquit">✕</button><div class="prog"><i style="width:${WS.k / n * 100}%"></i></div><b>${WS.k + 1}/${n}</b></div>`;
    const isA = w.s === 'ar', R = isA ? REL[w.rel] : null;
    const big = `<div class="wbig ${isA ? 'arw' : ''}" dir="${isA ? 'rtl' : 'ltr'}">${esc(w.en)} <button class="say" data-a="wsay">🔊</button></div>`;
    const ans = isA ? `<div class="war"><small>${R.f}:</small> ${esc(w.ar)}</div>` : `<div class="war">${esc(w.ar)}</div>`;
    const tag = `<div class="qtag" style="--c:${isA ? '#c98a12' : w.s === 'sci' ? '#2fa36b' : '#5b6cff'}">${isA ? '📖 العربي' : w.s === 'sci' ? '🔬 Science' : '💻 ICT'} · ${esc(w.g)}</div>`;
    if (WS.phase === 'intro') {
      return h + `<div class="qcard">${tag}<div class="gtitle">🌰 كلمة جديدة!</div>${big}${ans}${w.def ? `<p class="wdef" dir="ltr">💡 ${esc(w.def)}</p>` : ''}
        <div class="steps"><b>🎨 حيلة تثبيت:</b> ${isA ? R.tip : 'قوليها بصوتك 3 مرات، وارسمي لها رسمة صغيرة في الكشكول جنب معناها.'}</div>
        <button class="btn wide" data-a="wgo">يلا نجرب! ▶</button></div>`;
    }
    const opts = arr => `<div class="opts">${arr.map((o, i) => `<button class="opt" data-a="wpick" data-i="${i}" dir="auto">${esc(o)}</button>`).join('')}</div>`;
    let body = '';
    if (WS.phase === 'q') {
      if (isA && it.mode === 'en2ar') body = `<p class="note">${R.f} الكلمة دي إيه؟</p>${big}${opts(it.o)}`;
      else if (isA && it.mode === 'ar2en') body = `<p class="note">${R.r}</p><div class="war">${esc(w.ar)}</div>${opts(it.o)}`;
      else if (it.mode === 'listen') body = `<p class="note">🔊 اسمعي الكلمة واختاريها:</p><button class="btn ghost wide" data-a="wsay">🔊 اسمعي تاني</button>${opts(it.o)}`;
      else if (it.mode === 'ar2en') body = `<p class="note">إيه الكلمة الإنجليزي اللي معناها:</p><div class="war">${esc(w.ar)}</div>${opts(it.o)}`;
      else if (it.mode === 'en2ar') body = `<p class="note">معنى الكلمة دي إيه؟</p>${big}${opts(it.o)}`;
      if (it.mode === 'def') body = `<p class="note">أنهي كلمة ليها التعريف ده؟</p><p class="wdef" dir="ltr">💡 ${esc(w.def)}</p>${opts(it.o)}`;
      if (it.mode === 'spell') body = `<p class="note">ركّبي الكلمة اللي معناها <b>${esc(w.ar)}</b> 🔤 <button class="say" data-a="wsay">🔊</button></p><div class="spell" dir="ltr">${WS.built.map(t => `<span>${t.c}</span>`).join('') || '<em>…</em>'}</div><div class="chips tiles2" dir="ltr">${it.tiles.map((t, i) => `<button class="chip" data-a="wtile" data-i="${i}" ${WS.built.includes(t) ? 'disabled' : ''}>${t.c}</button>`).join('')}</div><div class="row"><button class="btn ghost sm" data-a="wback">⌫</button><button class="btn ghost sm" data-a="wclear">↺</button></div>`;
    } else {
      const ok = WS.pickOk;
      body = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? pickOne(['🌱 كبرت!', 'برافو! 💛', 'الله عليكي! ⭐']) : '🥀 مش مشكلة، هترجعلك تاني'}</b>${WS.lastGain ? ` <span class="gain">+${WS.lastGain} 🪙</span>` : ''}</div>${big}${ans}${w.def ? `<p class="wdef" dir="ltr">💡 ${esc(w.def)}</p>` : ''}<button class="btn wide" data-a="wnext">${WS.k + 1 >= n ? 'خلصت 🏁' : 'التالي ▶'}</button>`;
    }
    return h + `<div class="qcard">${tag}${body}</div>`;
  };
  function wAnswer(ok) {
    const it = WS.list[WS.k], w = it.w; let e = G.wb[w.id];
    const first = !e;
    if (!e) e = G.wb[w.id] = { b: 0, due: today(), n: 0 };
    e.n++;
    let gain = 0;
    if (ok) { e.b = Math.min(5, e.b + 1); e.due = addDays(INT[e.b]); gain = it.isNew ? 3 : 2 + Math.min(3, e.b); WS.right++; sfx.ok(); }
    else { e.b = Math.max(1, Math.min(e.b, 1)); e.due = today(); sfx.no(); if (!it.again) WS.list.push({ w, again: true }); it.again = true; }
    if (first) { WS.planted++; const d = dailyToday(); d.nw = (d.nw || 0) + 1; }
    G.gold += gain; WS.gold += gain; WS.lastGain = gain; WS.pickOk = ok; WS.phase = 'fb'; save(); draw(); checkAch();
  }
  function wEnd() {
    const d = dailyToday(); d.w = true; G.gold += 10; WS.gold += 10; save(); sfx.win();
    const R = WS; WS = null;
    go('garden');
    sheet(`<h2>🌻 خلصت جلسة الكلمات!</h2><div class="kv"><span>🌱 كلمات جديدة اتزرعت</span><b>${R.planted}</b></div><div class="kv"><span>✔ إجابات صح</span><b>${R.right}</b></div><div class="kv"><span>🪙 الذهب</span><b>+${R.gold}</b></div><p class="note">الكلمات هترجعلك تتسقي بعد يوم، وبعدين 3 أيام، وبعدين أسبوع… لحد ما تفتّح 🌻</p><button class="btn gold wide" data-go="factory">🧩 كمّلي مهمة اليوم في مصنع الجمل</button>`);
    missionCheck(); checkAch();
  }

  /* ---------- 🧩 مصنع الجمل ---------- */
  let FS = null;
  const fzCount = () => Object.keys(G.fz.build).length + Object.keys(G.fz.frame).length + Object.keys(G.fz.fusha).length;
  VIEWS.factory = () => {
    const sub = VA || 'all', inSub = x => sub === 'all' || x.sub === sub;
    const bp = SW.sentences.filter(x => inSub(x) && x.wc >= 4 && x.wc <= 35), fp = SW.sentences.filter(x => inSub(x) && x.type);
    const d = dailyToday(), sb = bp.length, bf = bp.filter(x => G.fz.build[x.id]).length;
    const fr = fp.length, ff = fp.filter(x => G.fz.frame[x.id]).length;
    const tabs = [['all', 'الكل'], ['ar', '📖 العربي'], ['soc', '🧭 الدراسات']].map(([k, n]) => `<button class="${sub === k ? 'on' : ''}" data-go="factory" data-arg="${k}">${n}</button>`).join('');
    return `<h2>🧩 مصنع الجمل</h2>
      ${mish('الإجابة بالفصحى زي الكيكة 🎂: ليها مكونات بترتيب. هنا بنتمرن نبني الجملة <b>من غير ما نكتب</b>، ولما تتعودي هتكتبيها لوحدك على الورقة الذهبية ✍️')}
      <p class="note">النهارده: ${Math.min(d.s, 3)}/3 جمل ${d.s >= 3 ? '✅' : ''}</p>
      <div class="wtabs">${tabs}</div>
      <button class="bigland" data-a="fstart" data-m="build" data-s="${sub}" style="--c:#e07a5f"><span class="le">🧩</span><span class="lt"><b>ركّبي الجملة</b><small>رتّبي حتت الإجابة النموذجية لأسئلة العربي والدراسات</small><span class="bar"><i style="width:${bf / sb * 100}%"></i></span><small>${bf} من ${sb}</small></span></button>
      <button class="bigland" data-a="fstart" data-m="frame" data-s="${sub}" style="--c:#3d85c6"><span class="le">🪜</span><span class="lt"><b>أول الإجابة</b><small>«بم تفسر» نبدأها بإيه؟ و«دلل»؟ و«ماذا يحدث»؟</small><span class="bar"><i style="width:${ff / fr * 100}%"></i></span><small>${ff} من ${fr}</small></span></button>
      <button class="bigland" data-a="fstart" data-m="fusha" style="--c:#2a9d8f"><span class="le">🔄</span><span class="lt"><b>من العامية للفصحى</b><small>اختاري الجملة اللي كلها فصحى</small><span class="bar"><i style="width:${Object.keys(G.fz.fusha).length / SW.fusha.length * 100}%"></i></span><small>${Object.keys(G.fz.fusha).length} من ${SW.fusha.length}</small></span></button>
      <div class="card"><h3>🪜 قوالب الإجابة</h3>${Object.values(SW.FRAMES).map(f => `<p class="note">${f.tip}</p>`).join('')}</div>`;
  };
  function chunkify(model) {
    const ws = model.split(/\s+/).filter(Boolean), ch = []; let cur = [];
    const target = ws.length <= 7 ? 1 : ws.length <= 14 ? 2 : ws.length <= 24 ? 3 : 4;
    ws.forEach((w, i) => { cur.push(w); if (/[،؛.:,!؟?]$/.test(w) || cur.length >= target || i === ws.length - 1) { ch.push(cur.join(' ')); cur = []; } });
    while (ch.length > 7) { let k = 0, best = 1e9; for (let i = 0; i < ch.length - 1; i++) { const l = ch[i].length + ch[i + 1].length; if (l < best) { best = l; k = i; } } ch.splice(k, 2, ch[k] + ' ' + ch[k + 1]); }
    return ch;
  }
  function fPick(mode, sub) {
    const done = G.fz[mode], inSub = x => !sub || sub === 'all' || x.sub === sub;
    if (mode === 'fusha') { const left = SW.fusha.filter(x => !done[x.id]); return shuf(left.length ? left : SW.fusha).slice(0, 5); }
    const pool = SW.sentences.filter(x => inSub(x) && (mode === 'frame' ? x.type : (x.wc >= 4 && x.wc <= 35)));
    const left = pool.filter(x => !done[x.id]);
    return (left.length ? left.slice(0, 12) : shuf(pool)).sort(() => Math.random() - .5).slice(0, 5);
  }
  function fNewQ() {
    const it = FS.list[FS.k]; FS.phase = 'q'; FS.tries = 0; FS.seq = []; FS.res = null;
    if (FS.mode === 'build') { it.ch = chunkify(it.x.model); let o; do { o = shuf(it.ch.map((t, i) => i)); } while (it.ch.length > 2 && o.every((v, i) => v === i)); it.order = o; }
    if (FS.mode === 'frame') { const all = Object.keys(SW.FRAMES); it.o = shuf([it.x.type].concat(shuf(all.filter(k => k !== it.x.type)).slice(0, 3))); }
    if (FS.mode === 'fusha') it.o = shuf(it.x.o.slice());
  }
  const psg = x => x.p && window.APAS && APAS[x.p] ? `<details class="psg"><summary>📖 الفقرة (افتحيها لو محتاجاها)</summary><p>${APAS[x.p]}</p></details>` : '';
  function fStart(mode, sub) { FS = { mode, sub, list: fPick(mode, sub).map(x => ({ x })), k: 0, right: 0, gold: 0 }; fNewQ(); go('fplay'); }
  VIEWS.fplay = () => {
    if (!FS) return VIEWS.factory();
    const it = FS.list[FS.k], x = it.x, n = FS.list.length;
    let h = `<div class="top"><button class="hb" data-a="fquit">✕</button><div class="prog"><i style="width:${FS.k / n * 100}%"></i></div><b>${FS.k + 1}/${n}</b></div><div class="qcard">`;
    if (FS.mode === 'build') {
      h += `<div class="qtag" style="--c:#e07a5f">🧩 ركّبي الجملة · ${x.sub === 'ar' ? '📖 عربي' : '🧭 دراسات'}</div>${psg(x)}<div class="qt">${esc(x.q)}</div>`;
      if (FS.phase === 'q') h += `<p class="note">رتّبي الحتت علشان تعملي الإجابة بالفصحى:</p><div class="sline">${FS.seq.map(i => `<span>${esc(it.ch[i])}</span>`).join(' ') || '<em>اضغطي على الحتت بالترتيب…</em>'}</div><div class="chips">${it.order.map(i => `<button class="chip" data-a="fch" data-i="${i}" ${FS.seq.includes(i) ? 'disabled' : ''}>${esc(it.ch[i])}</button>`).join('')}</div><div class="row"><button class="btn ghost sm" data-a="fback">⌫ رجّعي حتة</button><button class="btn" data-a="fcheck">تمّ ✔</button></div>${FS.tries ? `<div class="fb no"><b>قربتي! الحتت الخضرا في مكانها الصح 💪</b><div class="sline">${FS.lastSeq.map((v, k) => `<span class="${v === k ? 'g' : 'r'}">${esc(it.ch[v])}</span>`).join(' ')}</div></div>` : ''}`;
    }
    if (FS.mode === 'frame') {
      const F = SW.FRAMES;
      h += `<div class="qtag" style="--c:#3d85c6">🪜 أول الإجابة · ${x.sub === 'ar' ? '📖 عربي' : '🧭 دراسات'}</div>${psg(x)}<div class="qt">${esc(x.q)}</div>`;
      if (FS.phase === 'q') h += `<p class="note">الإجابة دي نبدأها بإيه؟</p><div class="opts">${it.o.map(k => `<button class="opt" data-a="fpick" data-k="${k}">${esc(F[k].o)}</button>`).join('')}</div>`;
    }
    if (FS.mode === 'fusha') {
      h += `<div class="qtag" style="--c:#2a9d8f">🔄 من العامية للفصحى</div><p class="note">بالعامية:</p><div class="ammi">🗣️ ${esc(x.ammi)}</div>`;
      if (FS.phase === 'q') h += `<p class="note">أنهي جملة <b>كلها فصحى</b>؟</p><div class="opts one">${it.o.map((o, i) => `<button class="opt" data-a="fpick" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
    }
    if (FS.phase === 'fb') {
      const r = FS.res;
      h += `<div class="fb ${r.ok ? 'ok' : 'no'}"><b>${r.msg}</b>${r.gain ? ` <span class="gain">+${r.gain} 🪙</span>` : ''}</div>`;
      if (FS.mode === 'fusha') h += `<div class="steps"><p>✅ <b>${esc(x.ok)}</b></p><div class="kw">${x.pairs.map(([a, f]) => `<span>${esc(a)} ← <b>${esc(f)}</b></span>`).join('')}</div></div>`;
      else h += `<div class="steps">${FS.mode === 'frame' ? `<p>${SW.FRAMES[x.type].tip}</p>` : ''}<p>📖 <b>الإجابة النموذجية:</b> ${esc(x.model)}</p></div><p class="note">🗣️ اقريها بصوتك مرة، وبعدين قوليها من غير ما تبصّي.</p>`;
      h += `<div class="row"><button class="btn ghost" data-a="fsay">🔊 اسمعيها</button><button class="btn" data-a="fnext">${FS.k + 1 >= n ? 'خلصت 🏁' : 'التالي ▶'}</button></div>`;
    }
    return h + '</div>';
  };
  function fResult(ok, msg) {
    const it = FS.list[FS.k], gain = ok ? (FS.mode === 'build' ? (FS.tries <= 1 ? 5 : 3) : 3) : 0;
    if (ok) { G.fz[FS.mode][it.x.id] = today(); FS.right++; sfx.ok(); } else sfx.no();
    const d = dailyToday(); d.s = (d.s || 0) + 1;
    G.gold += gain; FS.gold += gain; FS.res = { ok, msg, gain }; FS.phase = 'fb'; save(); draw(); missionCheck(); checkAch();
  }
  function fEnd() {
    G.gold += 10; FS.gold += 10; save(); sfx.win();
    const R = FS; FS = null;
    go('factory', R.sub);
    sheet(`<h2>🧩 برافو يا شاطرة!</h2><div class="kv"><span>✔ صح</span><b>${R.right} من ${R.list.length}</b></div><div class="kv"><span>🪙 الذهب</span><b>+${R.gold}</b></div><p class="note">جربي تكتبي جملة من دول على ورقة وورّيها لماما ✍️</p>`);
    missionCheck();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a, i = b.dataset.i;
    if (a === 'wstart') return wStart(b.dataset.s);
    if (a === 'wshow') { const w = WBY(i), en = G.wb[i], isA = w.s === 'ar'; speak(w.en, isA ? 'ar' : 'en'); return sheet(`<h2 dir="auto">${PLANT[Math.min(5, en.b)]} ${esc(w.en)}</h2><div class="war">${isA ? `<small>${REL[w.rel].f}:</small> ` : ''}${esc(w.ar)}</div>${w.def ? `<p class="wdef" dir="ltr">💡 ${esc(w.def)}</p>` : ''}<p class="note">${en.due <= today() ? '🥀 عطشانة: هتيجي في جلسة النهارده' : 'المراجعة الجاية: ' + en.due}</p>`); }
    if (WS) {
      const it = WS.list[WS.k];
      if (a === 'wsay') return speak(it.w.en, it.w.s === 'ar' ? 'ar' : 'en');
      if (a === 'wgo') { it.seen = true; wNewQ(); if (it.mode === 'intro') { it.mode = 'listen'; } return draw(); }
      if (a === 'wpick' && WS.phase === 'q') { const ok = +i === it.a; b.classList.add(ok ? 'good' : 'bad'); return setTimeout(() => wAnswer(ok), 250); }
      if (a === 'wtile' && WS.phase === 'q') { const t = it.tiles[+i]; if (!WS.built.includes(t)) WS.built.push(t); sfx.pop(); if (WS.built.length === it.tiles.length) return wAnswer(WS.built.map(x => x.c).join('') === it.w.en.toLowerCase()); return draw(); }
      if (a === 'wback') { WS.built.pop(); return draw(); }
      if (a === 'wclear') { WS.built = []; return draw(); }
      if (a === 'wnext') { WS.k++; if (WS.k >= WS.list.length) return wEnd(); wNewQ(); draw(); return window.scrollTo(0, 0); }
      if (a === 'wquit') { if (!confirm('تخرجي من الجلسة؟ اللي اتزرع محفوظ.')) return; WS = null; return go('garden'); }
    }
    if (a === 'fstart') return fStart(b.dataset.m, b.dataset.s);
    if (FS) {
      const it = FS.list[FS.k];
      if (a === 'fch') { const k = +i; if (!FS.seq.includes(k)) FS.seq.push(k); sfx.pop(); return draw(); }
      if (a === 'fback') { FS.seq.pop(); return draw(); }
      if (a === 'fcheck') {
        if (FS.seq.length < it.ch.length) return toast('حطي كل الحتت الأول 🙂');
        const same = FS.seq.map(k => it.ch[k]).join(' ') === it.ch.join(' ');
        FS.tries++;
        if (same) return fResult(true, FS.tries === 1 ? '🎉 جملة فصحى مظبوطة من أول مرة!' : '👏 مظبوطة!');
        if (FS.tries >= 3) return fResult(false, 'مش مشكلة 🌸 بصّي على الترتيب الصح');
        FS.lastSeq = FS.seq.slice(); FS.seq = []; sfx.no(); return draw();
      }
      if (a === 'fpick' && FS.phase === 'q') {
        if (FS.mode === 'frame') { const ok = b.dataset.k === it.x.type; return fResult(ok, ok ? '🪜 بداية مظبوطة!' : 'لأ، البداية الصح: ' + SW.FRAMES[it.x.type].o); }
        const ok = it.o[+i] === it.x.ok; return fResult(ok, ok ? '🔄 فصحى 100%!' : 'الجملة دي لسه فيها عامية 🙂');
      }
      if (a === 'fsay') return speak(FS.mode === 'fusha' ? it.x.ok : it.x.model, 'ar');
      if (a === 'fnext') { FS.k++; if (FS.k >= FS.list.length) return fEnd(); fNewQ(); draw(); return window.scrollTo(0, 0); }
      if (a === 'fquit') { const sb = FS.sub; FS = null; return go('factory', sb); }
    }
  });

  /* ------------------------- البداية ------------------------- */
  (function daily() {
    const d = today();
    if (G.lastDay !== d) {
      const h = G.lastDay ? harvestAmount() + 15 : 0;
      G.lastDay = d; if (!G.days.includes(d)) G.days.push(d); if (G.days.length > 60) G.days = G.days.slice(-60);
      if (h) { G.gold += h; setTimeout(() => toast(`🌅 صباح الخير! هدية اليوم والحصاد: +${h} 🪙`, 'gold'), 600); }
      save();
    }
  })();
  window.SKG = { get G() { return G; }, go, draw, start: (list, o) => startRun(Object.assign({ mode: 'quick', list }, o || {})), get RUN() { return RUN; }, get CUR() { return CUR; } };
  go('home');
})();
