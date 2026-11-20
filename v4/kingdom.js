/* =====================================================================
   رحلة إلى مملكة الأحلام — محرّك المملكة المشترك (المرحلة الثالثة)
   يستخدمه اللعب المحلي واللعب عبر الإنترنت معًا:
   - 14 مبنى بخمسة مستويات وشكل مختلف لكل مستوى، و6 موارد.
   - 8 مناطق تُفتح تدريجيًا، لكل منطقة كنز ومهمة استكشاف، ومنطقة نادرة.
   - حصاد في بداية كل مرحلة بناء، وصناديق مفاجآت، ومتجر موسّع.
   - الخبرة والألقاب والإنجازات (ملف دائم لكل لاعب على الجهاز).
   - الخريطة التفاعلية ونافذة التفاصيل، والوضع الليلي والموسيقى.
   الدوال هنا لا تكتب في قاعدة البيانات: تعدّل كائن المملكة وتُرجع رسالة،
   والمستدعي (اللعبة المحلية أو جهاز المضيف) هو من يحفظ النتيجة.
   ===================================================================== */
(function () {
  'use strict';
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------- الموارد ------------------------- */
  const RES = [['gold', '🪙', 'الذهب'], ['gems', '💎', 'الجواهر'], ['stars', '⭐', 'النجوم'], ['know', '📚', 'المعرفة'], ['crops', '🌾', 'المحاصيل'], ['magic', '✨', 'الطاقة السحرية']];
  const RES_ICON = { gold: '🪙', gems: '💎', stars: '⭐', crops: '🌾', magic: '✨', steps: '👣' };
  const RES_NAME = { gold: 'ذهب', gems: 'جوهرة', stars: 'نجمة', crops: 'محصول', magic: 'طاقة سحرية', steps: 'خطوة معرفة' };

  /* ------------------------- المباني ------------------------- */
  // zone: المنطقة التي يقع فيها المبنى على الخريطة (ولا يُبنى قبل فتحها)
  // castle: مستوى القلعة المطلوب · cost: تكلفة المستوى الأول (تتضاعف بعدد المستوى)
  // know: المعرفة المطلوبة في الفئة cat (لا تُستهلك) · prod: إنتاج كل مستوى في الحصاد
  const BUILDINGS = [
    { id: 'castle', name: 'القلعة الملكية', zone: 0, castle: 0, cost: { gold: 40, stars: 2 }, prod: { gold: 5 }, looks: ['🛖', '🏠', '🏯', '🏰', '🏰👑'], desc: 'قلب المملكة. كل مستوى منها يفتح مباني جديدة، ومظهرها يتغير من المتجر.' },
    { id: 'farm', name: 'المزرعة السحرية', zone: 0, castle: 0, cost: { gold: 30 }, prod: { crops: 5 }, looks: ['🌱', '🌿', '🌾', '🌾🌻', '🌾🌻🍎'], desc: 'تنتج المحاصيل التي تحتاجها مبانٍ كثيرة.' },
    { id: 'market', name: 'سوق المملكة', zone: 0, castle: 1, cost: { gold: 50, crops: 5 }, passive: 'market', looks: ['🧺', '⛺', '🛒', '🏪', '🏬'], desc: 'يخفّض أسعار المتجر 5% عن كل مستوى.' },
    { id: 'library', name: 'مكتبة المعرفة', zone: 0, castle: 1, cat: 'اللغة العربية', know: 3, cost: { gold: 60 }, prodKnow: 1, looks: ['📜', '📖', '📚', '📚🕯️', '🏛️📚'], desc: 'تضيف معرفة في اللغة العربية مع كل حصاد.' },
    { id: 'startower', name: 'برج النجوم', zone: 1, castle: 1, cat: 'العلوم', know: 3, cost: { gold: 70 }, prod: { stars: 1 }, looks: ['🔭', '🗼', '🗼⭐', '🗼🌟', '🗼🌠'], desc: 'يرصد السماء ويجمع النجوم مع كل حصاد.' },
    { id: 'mine', name: 'منجم الذهب', zone: 1, castle: 2, cost: { gold: 80, crops: 10 }, prod: { gold: 10 }, looks: ['⛏️', '⛏️🪨', '⛏️🪙', '⛏️💰', '⛏️💰👑'], desc: 'أكبر مصدر للذهب في المملكة.' },
    { id: 'zoo', name: 'حديقة الحيوانات الخيالية', zone: 2, castle: 1, cat: 'الطبيعة والحيوانات', know: 3, cost: { gold: 80, crops: 10 }, prod: { gold: 3, crops: 3 }, looks: ['🐣', '🦋', '🦌', '🦄', '🦄🐉'], desc: 'تجذب الزوار فتنتج ذهبًا ومحاصيل.' },
    { id: 'tower', name: 'برج الحراسة', zone: 2, castle: 2, cat: 'التاريخ', know: 3, cost: { gold: 90 }, passive: 'guard', looks: ['🪵', '🧱', '🗼', '🗼🛡️', '🗼⚔️'], desc: 'يحمي المملكة من السرقة: كل مستوى يقلّل المسروق 20%.' },
    { id: 'school', name: 'مدرسة الحكماء', zone: 3, castle: 2, cat: 'المعارف الإسلامية', know: 4, cost: { gold: 90 }, prod: { steps: 2 }, looks: ['🪔', '🏫', '🕌', '🕌✨', '🕌🌙'], desc: 'تضيف خطوتي معرفة عن كل مستوى، فتُفتح المناطق أسرع.' },
    { id: 'lab', name: 'مختبر الاختراعات', zone: 3, castle: 2, cat: 'الرياضيات والمنطق', know: 4, cost: { gold: 100 }, prod: { magic: 1 }, looks: ['🔧', '⚙️', '🧪', '🧪🤖', '🧪🚀'], desc: 'يصنع الطاقة السحرية اللازمة لبوابة العوالم.' },
    { id: 'port', name: 'ميناء المغامرات', zone: 4, castle: 2, cat: 'الجغرافيا', know: 3, cost: { gold: 110 }, prodBox: 0.2, looks: ['🛶', '⛵', '🚤', '⚓🚢', '⚓🚢🗺️'], desc: 'ترجع سفنه بصناديق مفاجآت: فرصة 20% عن كل مستوى في كل حصاد.' },
    { id: 'gemworks', name: 'مصنع الأحجار الكريمة', zone: 4, castle: 3, cost: { gold: 120, stars: 4 }, prodGems: true, looks: ['🪨', '🔨', '💎', '💎💎', '💎👑'], desc: 'ينتج الجواهر: جوهرة عن كل مستويين.' },
    { id: 'awards', name: 'قصر الجوائز', zone: 5, castle: 3, cat: 'الفنون', know: 3, cost: { gold: 120, stars: 6 }, passive: 'awards', looks: ['🎖️', '🏅', '🏆', '🏆🎉', '🏆👑'], desc: 'يزيد مكافأة كل تحدٍّ ينجح فيه اللاعب ذهبتين عن كل مستوى.' },
    { id: 'portal', name: 'بوابة العوالم', zone: 6, castle: 4, cost: { gold: 220, gems: 2, magic: 5 }, prod: { magic: 3 }, looks: ['🌀', '🌀✨', '🌀🌟', '🌌', '🌌🌈'], desc: 'أعظم مباني المملكة: تنتج الطاقة السحرية وتفتح عالم الأحلام النادر.' }
  ];
  const LEGACY = { observatory: 'startower', garden: 'zoo', logic: 'lab', wisdom: 'school', treasury: 'gemworks', palace: 'castle', history: 'tower', museum: 'awards' };

  /* ------------------------- المناطق ------------------------- */
  const REGIONS = [
    { name: 'القرية الصغيرة', emoji: '🏡', steps: 0, tre: { gold: 15 }, mis: { text: 'ابنِ أول مبنى', target: 1, val: k => builtCount(k), rew: { gold: 20 } } },
    { name: 'المزرعة الخضراء', emoji: '🌾', steps: 3, tre: { crops: 10, gold: 10 }, mis: { text: 'اجمع 30 محصولًا', target: 30, val: k => k.crops, rew: { gold: 25, magic: 1 } } },
    { name: 'غابة الأسرار', emoji: '🌲', steps: 7, tre: { gems: 1 }, mis: { text: 'ابنِ 3 مبانٍ مختلفة', target: 3, val: k => builtCount(k), rew: { gems: 1, stars: 2 } } },
    { name: 'مدينة المعرفة', emoji: '🏙️', steps: 12, tre: { gold: 30, magic: 1 }, mis: { text: 'اجمع 20 نقطة معرفة', target: 20, val: k => knowTotal(k), rew: { stars: 5, magic: 2 } } },
    { name: 'جزيرة الكنوز', emoji: '🏝️', steps: 18, tre: { gold: 50, gems: 1 }, mis: { text: 'طوّر مبنى إلى المستوى 3', target: 3, val: k => maxLv(k), rew: { gems: 2, gold: 30 } } },
    { name: 'جبل الأبطال', emoji: '⛰️', steps: 25, tre: { stars: 5, magic: 3 }, mis: { text: 'امتلك 10 نجوم', target: 10, val: k => k.stars, rew: { gold: 60, magic: 2 } } },
    { name: 'القصر العظيم', emoji: '🏰', steps: 35, castle: 4, tre: { gold: 80, gems: 3 }, mis: { text: 'ابنِ 8 مبانٍ مختلفة', target: 8, val: k => builtCount(k), rew: { gems: 2, magic: 5 } } },
    { name: 'عالم الأحلام', emoji: '🌈', rare: true, steps: 0, portal: 1, magic: 8, tre: { gems: 5, gold: 100, magic: 5 }, mis: { text: 'أكمل مهام 4 مناطق', target: 4, val: k => k.mis.length, rew: { gems: 3, gold: 100, deco: 'rainbow' } } }
  ];

  /* ------------------------- المتجر ------------------------- */
  const DECOS = [
    { id: 'tree', name: 'شجرة', emoji: '🌳', cost: 15 }, { id: 'flower', name: 'زهور', emoji: '🌸', cost: 15 },
    { id: 'palm', name: 'نخلة', emoji: '🌴', cost: 20 }, { id: 'rabbit', name: 'أرنب', emoji: '🐇', cost: 20 },
    { id: 'lantern', name: 'فانوس', emoji: '🏮', cost: 25 }, { id: 'fountain', name: 'نافورة', emoji: '⛲', cost: 35 },
    { id: 'swan', name: 'بجعة البحيرة', emoji: '🦢', cost: 40 }, { id: 'horse', name: 'حصان', emoji: '🐴', cost: 50 },
    { id: 'statue', name: 'تمثال', emoji: '🗿', cost: 60 }, { id: 'unicorn', name: 'تمثال وحيد القرن', emoji: '🦄', cost: 90 },
    { id: 'dragon', name: 'تمثال التنين', emoji: '🐉', cost: 120 }, { id: 'rainbow', name: 'قوس قزح النادر', emoji: '🌈', cost: 0, rare: true }
  ];
  const AVATARS = [
    { id: 'wizard', name: 'ساحر الحكمة', emoji: '🧙', cost: 40 }, { id: 'fairy', name: 'جنية الأحلام', emoji: '🧚', cost: 40 },
    { id: 'ninja', name: 'النينجا', emoji: '🥷', cost: 50 }, { id: 'hero', name: 'البطل الخارق', emoji: '🦸', cost: 50 },
    { id: 'mermaid', name: 'حورية البحر', emoji: '🧜', cost: 50 }, { id: 'prince', name: 'الأمير', emoji: '🤴', cost: 60 },
    { id: 'princess', name: 'الأميرة', emoji: '👸', cost: 60 }, { id: 'astro', name: 'رائد الفضاء', emoji: '🧑‍🚀', cost: 60 },
    { id: 'dragonav', name: 'التنين الصغير', emoji: '🐲', cost: 70 }, { id: 'genie', name: 'الجني', emoji: '🧞', cost: 80 }
  ];
  const SKINS = [
    { id: '', name: 'القلعة الكلاسيكية', emoji: '🏰', cost: 0, desc: 'المظهر الأصلي.' },
    { id: 'ice', name: 'قلعة الجليد', emoji: '❄️', cost: 60, desc: 'جدران زرقاء متلألئة.' },
    { id: 'candy', name: 'قلعة الحلوى', emoji: '🍭', cost: 60, desc: 'أبراج من الحلوى الملونة.' },
    { id: 'desert', name: 'قلعة الواحة', emoji: '🌴', cost: 60, desc: 'قلعة ذهبية في واحة خضراء.' },
    { id: 'night', name: 'قلعة القمر', emoji: '🌙', cost: 80, desc: 'قلعة تتلألأ تحت النجوم.' },
    { id: 'gold', name: 'القلعة الذهبية', emoji: '👑', cost: 120, desc: 'أفخم مظهر في المملكة.' }
  ];
  const BOX_COST = 40;

  /* ------------------------- أدوات المملكة ------------------------- */
  function norm(k) {
    k = k || {};
    const d = { gold: 100, gems: 2, stars: 0, score: 0, crops: 10, magic: 0, steps: 0, boxes: 0, skin: '' };
    Object.keys(d).forEach(x => { if (typeof k[x] !== typeof d[x] || (typeof d[x] === 'number' && !isFinite(k[x]))) k[x] = d[x]; });
    k.knowledge = k.knowledge && typeof k.knowledge === 'object' ? k.knowledge : {};
    k.buildings = k.buildings && typeof k.buildings === 'object' ? k.buildings : {};
    Object.keys(LEGACY).forEach(o => { if (k.buildings[o]) { const n = LEGACY[o]; k.buildings[n] = Math.max(k.buildings[n] || 0, k.buildings[o]); delete k.buildings[o]; } });
    const arr = v => Array.isArray(v) ? v.filter(x => x !== null && x !== undefined) : Object.values(v || {});
    k.regions = arr(k.regions); if (!k.regions.includes(0)) k.regions.unshift(0);
    if (k.decorations && !k.decos) k.decos = k.decorations;
    k.decos = arr(k.decos); delete k.decorations;
    k.tre = arr(k.tre); k.mis = arr(k.mis); k.skins = arr(k.skins);
    return k;
  }
  const lvOf = (k, id) => (k.buildings || {})[id] || 0;
  const builtCount = k => BUILDINGS.filter(b => lvOf(k, b.id) > 0).length;
  const maxLv = k => Math.max(0, ...BUILDINGS.map(b => lvOf(k, b.id)));
  const knowTotal = k => Object.values(k.knowledge || {}).reduce((a, b) => a + (+b || 0), 0);
  const findB = id => BUILDINGS.find(b => b.id === id);
  function costFor(b, lv) { const c = {}; Object.entries(b.cost).forEach(([r, v]) => c[r] = v * (lv + 1)); return c; }
  function needFor(b, lv) { return b.cat ? { cat: b.cat, n: (b.know || 0) * (lv + 1) } : null; }
  function resTxt(o) { return Object.entries(o || {}).filter(([r, v]) => v && r !== 'deco').map(([r, v]) => `${RES_ICON[r] || ''} ${v}`).join(' · ') + (o && o.deco ? ` · ${(DECOS.find(d => d.id === o.deco) || {}).emoji || ''} زينة نادرة` : ''); }
  function give(k, o) { Object.entries(o || {}).forEach(([r, v]) => { if (r === 'deco') { const d = DECOS.find(x => x.id === v); if (d) k.decos.push(d.emoji); } else if (r === 'steps') k.steps += v; else k[r] = (k[r] || 0) + v; }); }
  function zoneLock(k, z) { return k.regions.includes(z) ? '' : `تُفتح بعد فتح منطقة «${REGIONS[z].name}»`; }
  function bState(k, b) {
    const lv = lvOf(k, b.id), max = lv >= 5, cost = costFor(b, lv), need = needFor(b, lv), miss = [];
    let lock = zoneLock(k, b.zone);
    if (!lock && b.castle && lvOf(k, 'castle') < b.castle) lock = `تحتاج القلعة الملكية بالمستوى ${b.castle}`;
    if (!max && !lock) {
      Object.entries(cost).forEach(([r, v]) => { if ((k[r] || 0) < v) miss.push(`${RES_ICON[r]} ينقصك ${v - (k[r] || 0)}`); });
      if (need && (k.knowledge[need.cat] || 0) < need.n) miss.push(`📚 تحتاج ${need.n} معرفة في «${need.cat}» (معك ${k.knowledge[need.cat] || 0})`);
    }
    return { lv, max, cost, need, lock, miss, locked: !!lock, can: !max && !lock && !miss.length };
  }
  function look(k, b, lv) {
    const l = b.looks[Math.max(0, Math.min(4, (lv || 1) - 1))];
    if (b.id === 'castle' && k.skin) { const s = SKINS.find(x => x.id === k.skin); if (s) return s.emoji + l; }
    return l;
  }

  function regionOpenable(k, i) {
    const r = REGIONS[i]; if (!r || r.rare) return false;
    return k.steps >= r.steps && (!r.castle || lvOf(k, 'castle') >= r.castle);
  }
  function autoRegions(k) {
    const opened = [];
    REGIONS.forEach((r, i) => { if (!k.regions.includes(i) && regionOpenable(k, i)) { k.regions.push(i); opened.push(i); } });
    return opened;
  }
  function regionReq(k, i) {
    const r = REGIONS[i];
    if (r.rare) return `ابنِ بوابة العوالم، ثم ادفع ${r.magic} ✨ طاقة سحرية لفتحها`;
    const parts = [];
    if (r.steps) parts.push(`${r.steps} خطوة معرفة (معك ${k.steps})`);
    if (r.castle) parts.push(`القلعة الملكية بالمستوى ${r.castle}`);
    return parts.join(' + ') || 'مفتوحة من البداية';
  }
  function openRare(k) {
    const r = REGIONS[7];
    if (k.regions.includes(7)) return { ok: false, msg: 'عالم الأحلام مفتوح بالفعل.' };
    if (lvOf(k, 'portal') < 1) return { ok: false, msg: 'ابنِ بوابة العوالم أولًا.' };
    if (k.magic < r.magic) return { ok: false, msg: `تحتاج ${r.magic} ✨ طاقة سحرية، ومعك ${k.magic}.` };
    k.magic -= r.magic; k.regions.push(7);
    return { ok: true, msg: '🌈 عبرت بوابة العوالم وفتحت «عالم الأحلام» النادر! ابحث عن كنزه.', rare: true };
  }
  function openNextFree(k) {
    const i = REGIONS.findIndex((r, j) => j > 0 && j < 6 && !k.regions.includes(j));
    if (i < 0) return null; k.regions.push(i); return REGIONS[i].name;
  }
  function collectTreasure(k, i) {
    const r = REGIONS[i];
    if (!r || !k.regions.includes(i)) return { ok: false, msg: 'افتح المنطقة أولًا.' };
    if (k.tre.includes(i)) return { ok: false, msg: 'جُمع كنز هذه المنطقة من قبل.' };
    k.tre.push(i); give(k, r.tre);
    return { ok: true, msg: `🎁 وجدت كنز «${r.name}»: ${resTxt(r.tre)}` };
  }
  function missionState(k, i) {
    const m = REGIONS[i].mis, cur = Math.max(0, +m.val(k) || 0);
    return { text: m.text, target: m.target, cur: Math.min(cur, m.target), done: cur >= m.target, claimed: k.mis.includes(i), open: k.regions.includes(i), rew: m.rew };
  }
  function claimMission(k, i) {
    if (!REGIONS[i]) return { ok: false, msg: 'مهمة غير موجودة.' };
    const s = missionState(k, i);
    if (!s.open) return { ok: false, msg: 'افتح المنطقة أولًا.' };
    if (s.claimed) return { ok: false, msg: 'استلمت مكافأة هذه المهمة من قبل.' };
    if (!s.done) return { ok: false, msg: `المهمة لم تكتمل بعد (${s.cur}/${s.target}).` };
    k.mis.push(i); give(k, s.rew);
    return { ok: true, msg: `🧭 أنجزت مهمة «${s.text}»: ${resTxt(s.rew)}` };
  }
  function build(k, id) {
    const b = findB(id); if (!b) return { ok: false, msg: 'مبنى غير معروف.' };
    const s = bState(k, b);
    if (s.max) return { ok: false, msg: 'وصل المبنى إلى المستوى الأقصى.' };
    if (s.lock) return { ok: false, msg: `🔒 ${b.name}: ${s.lock}.` };
    if (s.miss.length) return { ok: false, msg: `لا يمكن بناء ${b.name}: ${s.miss.join('، ')}.` };
    Object.entries(s.cost).forEach(([r, v]) => k[r] -= v);
    k.buildings[id] = s.lv + 1;
    const opened = autoRegions(k);
    let msg = `🎉 تم ${s.lv ? 'تطوير' : 'بناء'} ${b.name} إلى المستوى ${s.lv + 1}!`;
    if (opened.length) msg += ' 🗺️ فُتحت: ' + opened.map(i => REGIONS[i].name).join('، ');
    return { ok: true, msg, lv: s.lv + 1, opened };
  }
  function harvest(k, rnd) {
    rnd = rnd || Math.random; const g = {}; let boxes = 0;
    const add = (r, v) => { if (v > 0) g[r] = (g[r] || 0) + v; };
    BUILDINGS.forEach(b => {
      const lv = lvOf(k, b.id); if (!lv) return;
      Object.entries(b.prod || {}).forEach(([r, v]) => add(r, v * lv));
      if (b.prodKnow) { k.knowledge[b.cat] = (k.knowledge[b.cat] || 0) + b.prodKnow * lv; add('know', b.prodKnow * lv); }
      if (b.prodGems) add('gems', Math.ceil(lv / 2));
      if (b.prodBox && rnd() < Math.min(1, b.prodBox * lv)) boxes++;
    });
    Object.entries(g).forEach(([r, v]) => { if (r !== 'know') { if (r === 'steps') k.steps += v; else k[r] = (k[r] || 0) + v; } });
    k.boxes += boxes;
    const opened = autoRegions(k);
    const parts = Object.entries(g).map(([r, v]) => `+${v} ${r === 'know' ? '📚' : RES_ICON[r]}`);
    if (boxes) parts.push(`+${boxes} 🎁 صندوق مفاجآت`);
    let text = parts.length ? '🌾 حصاد الجولة: ' + parts.join(' ') : '';
    if (opened.length) text += (text ? ' · ' : '') + '🗺️ فُتحت: ' + opened.map(i => REGIONS[i].name).join('، ');
    return { text, gains: g, boxes, opened };
  }
  const price = (k, base) => Math.max(0, Math.round(base * (1 - 0.05 * Math.min(5, lvOf(k, 'market')))));
  const stealFactor = k => Math.max(0, 1 - 0.2 * lvOf(k, 'tower'));
  const chBonus = k => 2 * lvOf(k, 'awards');
  // kind: deco | skin | box | av   ·  owned: قائمة الشخصيات التي يملكها اللاعب (للشخصيات فقط)
  function buy(k, kind, id, owned) {
    if (kind === 'deco') {
      const d = DECOS.find(x => x.id === id); if (!d || d.rare) return { ok: false, msg: 'هذه الزينة لا تُشترى.' };
      const p = price(k, d.cost); if (k.gold < p) return { ok: false, msg: `تحتاج ${p} ذهب، ومعك ${k.gold}.` };
      k.gold -= p; k.decos.push(d.emoji); return { ok: true, msg: `${d.emoji} أضفت ${d.name} إلى مملكتك.` };
    }
    if (kind === 'skin') {
      const s = SKINS.find(x => x.id === id); if (!s) return { ok: false, msg: 'مظهر غير معروف.' };
      if (s.id && !k.skins.includes(s.id)) { const p = price(k, s.cost); if (k.gold < p) return { ok: false, msg: `تحتاج ${p} ذهب، ومعك ${k.gold}.` }; k.gold -= p; k.skins.push(s.id); }
      k.skin = s.id; return { ok: true, msg: `${s.emoji} أصبح مظهر قلعتك: ${s.name}.` };
    }
    if (kind === 'box') {
      const p = price(k, BOX_COST); if (k.gold < p) return { ok: false, msg: `تحتاج ${p} ذهب، ومعك ${k.gold}.` };
      k.gold -= p; k.boxes++; return { ok: true, msg: '🎁 اشتريت صندوق مفاجآت. افتحه لترى ما فيه!' };
    }
    if (kind === 'av') {
      const a = AVATARS.find(x => x.id === id); if (!a) return { ok: false, msg: 'شخصية غير معروفة.' };
      owned = owned || [];
      if (!owned.includes(a.id)) { const p = price(k, a.cost); if (k.gold < p) return { ok: false, msg: `تحتاج ${p} ذهب، ومعك ${k.gold}.` }; k.gold -= p; }
      return { ok: true, msg: `${a.emoji} أصبحت شخصيتك: ${a.name}.`, avatar: a.emoji, avId: a.id };
    }
    return { ok: false, msg: 'عنصر غير معروف.' };
  }
  function openBox(k, rnd) {
    rnd = rnd || Math.random;
    if (k.boxes <= 0) return { ok: false, msg: 'لا تملك صندوق مفاجآت.' };
    k.boxes--;
    const x = rnd();
    if (x < 0.30) { k.gold += 25; return { ok: true, msg: '🎁 في الصندوق: 25 ذهبًا! 🪙' }; }
    if (x < 0.45) { k.gold += 50; return { ok: true, msg: '🎁 كنز كبير: 50 ذهبًا! 💰' }; }
    if (x < 0.60) { k.gems += 1; return { ok: true, msg: '🎁 في الصندوق: جوهرة لامعة! 💎' }; }
    if (x < 0.70) { k.stars += 4; return { ok: true, msg: '🎁 في الصندوق: 4 نجوم! ⭐' }; }
    if (x < 0.80) { k.magic += 3; return { ok: true, msg: '🎁 في الصندوق: 3 طاقة سحرية! ✨' }; }
    if (x < 0.95) return { ok: true, msg: '🎁 في الصندوق: بطاقة مساعدة!', card: true };
    const cheap = DECOS.filter(d => !d.rare && d.cost <= 40), d = cheap[Math.floor(rnd() * cheap.length) % cheap.length];
    k.decos.push(d.emoji); return { ok: true, msg: `🎁 في الصندوق: ${d.emoji} ${d.name} لمملكتك!` };
  }

  /* ------------------------- الخبرة والألقاب والإنجازات ------------------------- */
  const TITLES = [['مبتدئ', '🌱', 0], ['مستكشف', '🧭', 150], ['مغامر', '🗺️', 400], ['عبقري', '🧠', 800], ['حكيم', '🦉', 1400], ['بطل المملكة', '🛡️', 2200], ['ملك الأحلام', '👑', 3500]];
  const XPW = { correct: 10, hard: 10, ch: 15, builds: 15, regions: 25, roundWins: 30, wins: 100, clean: 50, tre: 10, boxes: 5, mis: 20, rare: 100 };
  const MAXKEYS = ['maxLv', 'streak', 'rare'];
  const ACH = [
    ['first', '🌟', 'أول إجابة صحيحة', 'correct', 1], ['c10', '🎯', '10 إجابات صحيحة', 'correct', 10], ['c50', '🏹', '50 إجابة صحيحة', 'correct', 50],
    ['hard1', '🧗', 'إجابة صحيحة عن سؤال صعب', 'hard', 1], ['hard10', '🦅', '10 أسئلة صعبة', 'hard', 10],
    ['streak5', '🔥', '5 إجابات صحيحة متتالية', 'streak', 5], ['rw5', '🥇', 'الفوز بخمس جولات', 'roundWins', 5],
    ['ch3', '🎭', 'إكمال 3 تحديات', 'ch', 3], ['ch10', '🎪', 'إكمال 10 تحديات', 'ch', 10],
    ['b1', '🧱', 'بناء أول مبنى', 'builds', 1], ['lv5', '🏰', 'تطوير مبنى إلى المستوى الخامس', 'maxLv', 5],
    ['reg1', '🗺️', 'فتح منطقة جديدة', 'regions', 1], ['reg6', '🧭', 'فتح 6 مناطق', 'regions', 6], ['rare', '🌈', 'الوصول إلى عالم الأحلام النادر', 'rare', 1],
    ['tre3', '🎁', 'جمع 3 كنوز', 'tre', 3], ['mis3', '📜', 'إنجاز 3 مهام استكشاف', 'mis', 3], ['box1', '📦', 'فتح صندوق مفاجآت', 'boxes', 1],
    ['win1', '🏆', 'الفوز بلعبة', 'wins', 1], ['clean', '🧠', 'الفوز دون استخدام المساعدات', 'clean', 1]
  ].map(a => ({ id: a[0], emoji: a[1], name: a[2], key: a[3], target: a[4] }));
  function xp(c) { c = c || {}; return Object.entries(XPW).reduce((s, [key, w]) => s + (+c[key] || 0) * w, 0); }
  function levelOf(x) {
    let i = 0; TITLES.forEach((t, j) => { if (x >= t[2]) i = j; });
    const cur = TITLES[i][2], nx = TITLES[i + 1] ? TITLES[i + 1][2] : null;
    return { i, title: TITLES[i][0], emoji: TITLES[i][1], xp: x, next: nx, pct: nx ? Math.round((x - cur) / (nx - cur) * 100) : 100, nextTitle: TITLES[i + 1] ? TITLES[i + 1][0] : '' };
  }
  function levelBadge(x) { const l = levelOf(x || 0); return `<span class="kTitle" title="${E(l.xp)} نقطة خبرة">${l.emoji} ${E(l.title)}</span>`; }
  function achList(c) { c = c || {}; return ACH.map(a => ({ ...a, cur: Math.min(a.target, +c[a.key] || 0), done: (+c[a.key] || 0) >= a.target })); }
  const PKEY = 'dkProfiles';
  const prof = {
    all() { try { return JSON.parse(localStorage.getItem(PKEY) || '{}') || {}; } catch (e) { return {}; } },
    get(name) { const a = prof.all(); return a[name] || { c: {}, ach: {} }; },
    save(name, p) { const a = prof.all(); a[name] = p; try { localStorage.setItem(PKEY, JSON.stringify(a)); } catch (e) { } },
    // يضيف إلى العدّادات ويُرجع الإنجازات الجديدة
    add(name, delta, av) {
      if (!name) return [];
      const p = prof.get(name); p.c = p.c || {}; p.ach = p.ach || {};
      Object.entries(delta || {}).forEach(([key, v]) => { v = +v || 0; if (MAXKEYS.includes(key)) p.c[key] = Math.max(+p.c[key] || 0, v); else if (v) p.c[key] = (+p.c[key] || 0) + v; });
      if (av) p.av = av;
      const fresh = achList(p.c).filter(a => a.done && !p.ach[a.id]);
      fresh.forEach(a => p.ach[a.id] = Date.now());
      prof.save(name, p); return fresh;
    },
    summary(name) { const p = prof.get(name), x = xp(p.c); return { xp: x, lvl: levelOf(x).i, ach: Object.keys(p.ach || {}).length }; }
  };
  function profileHtml(name, extra) {
    const p = prof.get(name), x = xp(p.c), l = levelOf(x), list = achList(p.c), done = list.filter(a => a.done).length, c = p.c || {};
    return `<div class="kProfile"><div class="kProfHead"><span class="kProfAv">${E(p.av || '🙂')}</span><div><b>${E(name)}</b><div>${l.emoji} ${E(l.title)} · ${x} نقطة خبرة</div></div></div>
      <div class="kBar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${l.pct}" aria-label="التقدم نحو اللقب التالي"><span style="width:${l.pct}%"></span></div>
      <p class="small">${l.next ? `بقي ${l.next - x} نقطة للقب «${E(l.nextTitle)}»` : 'وصلت إلى أعلى لقب في المملكة! 👑'}</p>
      <div class="kTitles">${TITLES.map((t, i) => `<span class="${i <= l.i ? 'on' : ''}">${t[1]} ${E(t[0])}</span>`).join('')}</div>
      <p class="small">✔️ ${c.correct || 0} إجابة صحيحة · 🧗 ${c.hard || 0} صعبة · 🎭 ${c.ch || 0} تحديًا · 🧱 ${c.builds || 0} بناء · 🏆 ${c.wins || 0} فوز · 🎮 ${c.games || 0} لعبة</p>
      <h4>🏅 الإنجازات (${done} من ${list.length})</h4>
      <div class="kAchs">${list.map(a => `<div class="kAch ${a.done ? 'done' : ''}"><span class="kAchE">${a.done ? a.emoji : '🔒'}</span><b>${E(a.name)}</b><div class="kBar sm"><span style="width:${Math.round(a.cur / a.target * 100)}%"></span></div><small>${a.cur}/${a.target}</small></div>`).join('')}</div>${extra || ''}</div>`;
  }

  /* ------------------------- العرض: المحفظة والخريطة ------------------------- */
  function walletHtml(k) {
    const v = { gold: k.gold, gems: k.gems, stars: k.stars, know: knowTotal(k), crops: k.crops, magic: k.magic };
    return `<div class="kWallet">${RES.map(r => `<div class="kRes" title="${r[2]}"><span>${r[1]}</span><b>${v[r[0]]}</b><small>${r[2]}</small></div>`).join('')}${k.boxes ? `<div class="kRes"><span>🎁</span><b>${k.boxes}</b><small>صناديق</small></div>` : ''}</div>`;
  }
  const lastLv = {}, popAt = {};
  function mapHtml(k, opt) {
    opt = opt || {}; const key = opt.key || 'x', prev = lastLv[key] || {}, now = {}, pops = popAt[key] = popAt[key] || {}, tnow = Date.now();
    const zones = REGIONS.map((r, i) => {
      const open = k.regions.includes(i);
      const plots = BUILDINGS.filter(b => b.zone === i).map(b => {
        const s = bState(k, b); now[b.id] = s.lv;
        if (prev[b.id] !== undefined && s.lv > prev[b.id]) pops[b.id] = tnow;
        const el = tnow - (pops[b.id] || 0), pop = el < 1300 ? ' kPop' : '';
        const st = s.lv ? 'built lv' + s.lv : s.locked ? 'locked' : 'site';
        const ready = opt.canBuild && s.can ? ' ready' : '';
        const label = `${b.name}، ${s.lv ? 'المستوى ' + s.lv + ' من 5' : s.locked ? 'مقفل: ' + s.lock : 'أرض بناء متاحة'}${ready ? '، يمكن بناؤه الآن' : ''}`;
        return `<button type="button" class="kPlot ${st}${ready}${pop}"${pop ? ` style="--pd:-${el}ms"` : ''} data-kplot="${b.id}" aria-label="${E(label)}"><span class="kLook">${s.lv ? look(k, b, s.lv) : s.locked ? '🔒' : '🏗️'}</span>${s.lv ? `<span class="kLv">${'★'.repeat(s.lv)}</span>` : ''}<span class="kName">${E(b.name)}</span></button>`;
      }).join('');
      const chest = open && !k.tre.includes(i) ? `<button type="button" class="kChest" data-kreg="${i}" aria-label="كنز مخفي في ${E(r.name)}">🎁</button>` : '';
      const ms = missionState(k, i), mflag = open && ms.done && !ms.claimed ? `<button type="button" class="kFlag" data-kreg="${i}" aria-label="مهمة مكتملة في ${E(r.name)}، استلم المكافأة">🧭</button>` : '';
      const decos = open ? k.decos.filter((_, j) => j % REGIONS.length === i).slice(0, 8).map(d => `<span class="kDeco" aria-hidden="true">${E(d)}</span>`).join('') : '';
      return `<div class="kZone z${i} ${open ? 'open' : 'fog'} ${r.rare ? 'rare' : ''}"><button type="button" class="kZoneHead" data-kreg="${i}" aria-label="${E(r.name)}، ${open ? 'مفتوحة' : 'مقفلة'}">${r.emoji} ${E(r.name)}${open ? '' : ' 🔒'}</button>${chest}${mflag}<div class="kPlots">${plots}</div>${open ? '' : `<small class="kReq">${E(regionReq(k, i))}</small>`}<div class="kDecos">${decos}</div></div>`;
    }).join('');
    lastLv[key] = now;
    if (Object.keys(prev).length && BUILDINGS.some(b => (now[b.id] || 0) > (prev[b.id] || 0))) setTimeout(() => sparkleSound(), 30);
    return `<div class="kMap kSkin-${E(k.skin || 'classic')}" role="group" aria-label="خريطة المملكة التفاعلية">${zones}</div><p class="small kHint">اضغط أي مبنى أو منطقة لمعرفة التفاصيل${opt.canBuild ? ' والبناء والتطوير' : ''}. ✨ المباني المتوهجة يمكن بناؤها الآن.</p>`;
  }
  function miniHtml(k) {
    const blds = BUILDINGS.filter(b => lvOf(k, b.id)).map(b => `<span class="kMini" title="${E(b.name)} — المستوى ${lvOf(k, b.id)}">${look(k, b, lvOf(k, b.id))}<sub>${lvOf(k, b.id)}</sub></span>`).join('');
    return `<div class="kMiniRow">${blds || '<small>لم تُبنَ مبانٍ بعد</small>'}</div><small>🗺️ ${k.regions.length}/8 مناطق · 🪙 ${k.gold} · 💎 ${k.gems} · ✨ ${k.magic}${k.decos.length ? ' · ' + k.decos.slice(-6).join('') : ''}</small>`;
  }
  function regionsHtml(k, opt) {
    opt = opt || {};
    return `<div class="kRegions">${REGIONS.map((r, i) => {
      const open = k.regions.includes(i), ms = missionState(k, i);
      return `<div class="kRegCard ${open ? 'open' : ''} ${r.rare ? 'rare' : ''}"><button type="button" class="kRegBtn" data-kreg="${i}">${r.emoji} <b>${E(r.name)}</b> ${open ? '✅' : '🔒'}</button>
        ${open ? `<small>🎁 الكنز: ${k.tre.includes(i) ? 'جُمع ✔️' : 'ينتظرك!'}</small><small>🧭 ${E(ms.text)}: ${ms.claimed ? 'أُنجزت ✔️' : ms.cur + '/' + ms.target}</small><div class="kBar sm"><span style="width:${Math.round(ms.cur / ms.target * 100)}%"></span></div>` : `<small>${E(regionReq(k, i))}</small>`}</div>`;
    }).join('')}</div>`;
  }
  function shopHtml(k, opt) {
    opt = opt || {}; const can = !!opt.canBuy, owned = opt.avs || [], md = n => n ? (price(k, n) < n ? `<s>${n}</s> ${price(k, n)}` : n) : 'مجانًا';
    const card = (data, emoji, name, desc, cost, label, dis) => `<div class="kItem"><div class="kItemE">${emoji}</div><b>${E(name)}</b>${desc ? `<small>${E(desc)}</small>` : ''}<button type="button" data-kbuy="${data}" ${can && !dis ? '' : 'disabled'}>${label || ('🪙 ' + md(cost))}</button></div>`;
    const disc = lvOf(k, 'market') ? `<p class="small">🛒 خصم السوق: ${5 * Math.min(5, lvOf(k, 'market'))}% على كل الأسعار.</p>` : '';
    return `${disc}<h4>🎁 صناديق المفاجآت</h4><div class="kItems">${card('box', '🎁', 'صندوق مفاجآت', 'ذهب أو جوهرة أو نجوم أو طاقة سحرية أو بطاقة أو زينة.', BOX_COST, '', k.gold < price(k, BOX_COST))}${k.boxes ? `<div class="kItem"><div class="kItemE">📦</div><b>صناديقك: ${k.boxes}</b><button type="button" class="primary" data-kbuy="open" ${can ? '' : 'disabled'}>افتح صندوقًا</button></div>` : ''}</div>
      <h4>🌳 زخارف المملكة</h4><div class="kItems">${DECOS.filter(d => !d.rare).map(d => card('deco:' + d.id, d.emoji, d.name, '', d.cost, '', k.gold < price(k, d.cost))).join('')}</div>
      <h4>🏰 مظاهر القلعة</h4><div class="kItems">${SKINS.map(s => { const has = !s.id || k.skins.includes(s.id), on = (k.skin || '') === s.id; return card('skin:' + s.id, s.emoji, s.name, s.desc, s.cost, on ? '✔️ المظهر الحالي' : has ? 'استخدم' : '', on || (!has && k.gold < price(k, s.cost))); }).join('')}</div>
      ${opt.noAv ? '' : `<h4>🧙 شخصيات رمزية</h4><div class="kItems">${AVATARS.map(a => { const has = owned.includes(a.id); return card('av:' + a.id, a.emoji, a.name, '', a.cost, opt.curAv === a.emoji ? '✔️ شخصيتك' : has ? 'اخترها' : '', opt.curAv === a.emoji || (!has && k.gold < price(k, a.cost))); }).join('')}</div>`}`;
  }

  /* ------------------------- نافذة التفاصيل ------------------------- */
  // ctx = { getK(), canBuild, act(type, id) }  — تسجّله كل شاشة عند الرسم
  let ctx = null, sheet = null;
  function setCtx(c) { ctx = c; refresh(); }
  function sheetEl() {
    if (!sheet) { sheet = document.createElement('div'); sheet.id = 'kSheet'; sheet.className = 'kSheetWrap hidden'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); document.body.appendChild(sheet); }
    return sheet;
  }
  function costRow(k, cost, need) {
    const items = Object.entries(cost).map(([r, v]) => `<span class="kCost ${(k[r] || 0) >= v ? 'ok' : 'no'}">${RES_ICON[r]} ${v} <small>(معك ${k[r] || 0})</small></span>`);
    if (need) items.push(`<span class="kCost ${(k.knowledge[need.cat] || 0) >= need.n ? 'ok' : 'no'}">📚 ${need.n} ${E(need.cat)} <small>(معك ${k.knowledge[need.cat] || 0})</small></span>`);
    return items.join('');
  }
  function prodText(b, lv) {
    const t = [];
    Object.entries(b.prod || {}).forEach(([r, v]) => t.push(`+${v * lv} ${RES_ICON[r]} ${RES_NAME[r]}`));
    if (b.prodKnow) t.push(`+${b.prodKnow * lv} 📚 معرفة في ${b.cat}`);
    if (b.prodGems) t.push(`+${Math.ceil(lv / 2)} 💎`);
    if (b.prodBox) t.push(`فرصة ${Math.min(100, Math.round(b.prodBox * lv * 100))}% لصندوق مفاجآت`);
    if (b.passive === 'market') t.push(`خصم ${5 * lv}% في المتجر`);
    if (b.passive === 'guard') t.push(`يقلّل السرقة ${Math.min(100, 20 * lv)}%`);
    if (b.passive === 'awards') t.push(`+${2 * lv} ذهب لكل تحدٍّ`);
    return t.join(' · ');
  }
  function buildingSheet(k, b) {
    const s = bState(k, b), can = ctx && ctx.canBuild;
    const tiers = b.looks.map((l, i) => `<span class="kTier ${i < s.lv ? 'on' : ''} ${i === s.lv - 1 ? 'cur' : ''}" title="المستوى ${i + 1}">${b.id === 'castle' && k.skin ? look(k, b, i + 1) : l}<small>${i + 1}</small></span>`).join('');
    let action = '';
    if (s.max) action = '<p class="kOk">🏆 وصل المبنى إلى المستوى الأقصى!</p>';
    else if (s.lock) action = `<p class="kNo">🔒 ${E(s.lock)}.</p>`;
    else action = `<h4>${s.lv ? `تكلفة التطوير إلى المستوى ${s.lv + 1}` : 'تكلفة البناء'}</h4><div class="kCosts">${costRow(k, s.cost, s.need)}</div>
      ${s.miss.length ? `<p class="kNo">${E(s.miss.join(' · '))}</p>` : ''}
      <button type="button" class="primary kBig" data-kact="b" data-id="${b.id}" ${can && s.can ? '' : 'disabled'}>${s.lv ? '⬆️ تطوير' : '🏗️ بناء'} ${E(b.name)}</button>
      ${can ? '' : '<p class="small">البناء متاح في مرحلة البناء بعد انتهاء أسئلة الجولة.</p>'}`;
    return `<div class="kSheetLook">${s.lv ? look(k, b, s.lv) : s.locked ? '🔒' : '🏗️'}</div><h3>${E(b.name)}</h3>
      <p><span class="badge">المستوى ${s.lv}/5</span> <span class="badge">${E(REGIONS[b.zone].emoji + ' ' + REGIONS[b.zone].name)}</span></p>
      <p>${E(b.desc)}</p><div class="kTiers">${tiers}</div>
      ${s.lv ? `<p class="small">⚙️ الآن: ${E(prodText(b, s.lv))}</p>` : ''}${!s.max ? `<p class="small">⬆️ ${s.lv ? 'بعد التطوير' : 'بعد البناء'}: ${E(prodText(b, s.lv + 1))}</p>` : ''}${action}`;
  }
  function regionSheet(k, i) {
    const r = REGIONS[i], open = k.regions.includes(i), ms = missionState(k, i), can = ctx && ctx.canBuild;
    const blds = BUILDINGS.filter(b => b.zone === i).map(b => `<button type="button" class="kChip" data-kplot="${b.id}">${lvOf(k, b.id) ? look(k, b, lvOf(k, b.id)) : '🏗️'} ${E(b.name)}</button>`).join('') || '<small>منطقة للاستكشاف والكنوز</small>';
    let body = '';
    if (!open) {
      body = `<p class="kNo">🔒 شرط الفتح: ${E(regionReq(k, i))}</p>`;
      if (r.rare) body += `<button type="button" class="primary kBig" data-kact="rare" data-id="7" ${can && lvOf(k, 'portal') >= 1 && k.magic >= r.magic ? '' : 'disabled'}>🌀 افتح بوابة عالم الأحلام (${r.magic} ✨)</button>`;
      else body += `<p class="small">تكسب خطوات المعرفة بالإجابات الصحيحة (السهل 1، والمتوسط 2، والصعب 3) ومن مدرسة الحكماء.</p>`;
    } else {
      body = `<h4>🎁 الكنز المخفي</h4>${k.tre.includes(i) ? '<p class="kOk">جمعت هذا الكنز ✔️</p>' : `<p>${E(resTxt(r.tre))}</p><button type="button" class="primary" data-kact="tre" data-id="${i}" ${can ? '' : 'disabled'}>🎁 افتح الكنز</button>`}
        <h4>🧭 مهمة الاستكشاف</h4><p>${E(ms.text)} — المكافأة: ${E(resTxt(ms.rew))}</p><div class="kBar"><span style="width:${Math.round(ms.cur / ms.target * 100)}%"></span></div><small>${ms.cur}/${ms.target}</small>
        ${ms.claimed ? '<p class="kOk">أنجزت المهمة ✔️</p>' : `<div><button type="button" class="primary" data-kact="mis" data-id="${i}" ${can && ms.done ? '' : 'disabled'}>استلم المكافأة</button></div>`}
        ${can ? '' : '<p class="small">جمع الكنوز واستلام المكافآت متاحان في مرحلة البناء.</p>'}`;
    }
    return `<div class="kSheetLook">${r.emoji}</div><h3>${E(r.name)}${r.rare ? ' <span class="badge legend">نادرة</span>' : ''}</h3>${body}<h4>المباني هنا</h4><div class="kChips">${blds}</div>`;
  }
  let open = null;
  function openSheet(kind, id) { open = { kind, id }; refresh(true); }
  function closeSheet() { open = null; if (sheet) sheet.classList.add('hidden'); }
  function refresh(focus) {
    if (!open || !ctx) { if (sheet && open && !ctx) closeSheet(); return; }
    const k = ctx.getK(); if (!k) return closeSheet();
    const el = sheetEl();
    const inner = open.kind === 'b' ? buildingSheet(k, findB(open.id)) : regionSheet(k, +open.id);
    el.innerHTML = `<div class="kSheet">${inner}<div class="row"><button type="button" data-kclose="1">إغلاق ✖</button></div></div>`;
    el.classList.remove('hidden');
    if (focus) { const f = el.querySelector('[data-kact]:not([disabled])') || el.querySelector('[data-kclose]'); if (f) f.focus(); }
  }
  document.addEventListener('click', e => {
    const t = e.target;
    if (t && t.id === 'kSheet') return closeSheet();
    const pl = t.closest && t.closest('[data-kplot]'); if (pl) return openSheet('b', pl.dataset.kplot);
    const rg = t.closest && t.closest('[data-kreg]'); if (rg) return openSheet('r', rg.dataset.kreg);
    if (t.closest && t.closest('[data-kclose]')) return closeSheet();
    const ac = t.closest && t.closest('[data-kact]'); if (ac && ctx) { ac.disabled = true; return ctx.act(ac.dataset.kact, ac.dataset.id); }
    const by = t.closest && t.closest('[data-kbuy]'); if (by && ctx) { by.disabled = true; const v = by.dataset.kbuy, i = v.indexOf(':'); return ctx.act(i < 0 ? v : v.slice(0, i), i < 0 ? '' : v.slice(i + 1)); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeSheet(); });

  /* ------------------------- الصوت والموسيقى والوضع الليلي ------------------------- */
  let ac = null;
  function actx() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } }
  function note(c, f, t, d, vol, type) { const o = c.createOscillator(), g = c.createGain(); o.type = type || 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.05); }
  function sparkleSound() {
    try { if (localStorage.getItem('dkSfx') === '0') return; } catch (e) { }
    const c = actx(); if (!c) return; const t = c.currentTime;[784, 988, 1175, 1568].forEach((f, i) => note(c, f, t + i * 0.07, 0.25, 0.05));
  }
  const music = {
    on: false, timer: null, step: 0, next: 0,
    // لحن هادئ من السلّم الخماسي يُولَّد في المتصفح (لا ملفات صوتية)
    mel: [523, 659, 784, 659, 587, 784, 880, 784, 659, 587, 523, 587, 659, 523, 440, 523],
    bass: [131, 131, 165, 165, 147, 147, 131, 196],
    start() {
      const c = actx(); if (!c) return; this.on = true; this.next = c.currentTime + 0.1; this.step = 0;
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        const c2 = actx(); if (!c2 || !this.on) return;
        while (this.next < c2.currentTime + 0.6) {
          const i = this.step % 16; note(c2, this.mel[i], this.next, 0.5, 0.025, 'sine');
          if (i % 2 === 0) note(c2, this.bass[(i / 2) % 8], this.next, 0.9, 0.03, 'triangle');
          this.next += 0.38; this.step++;
        }
      }, 150);
    },
    stop() { this.on = false; clearInterval(this.timer); this.timer = null; },
    toggle() { if (this.on) this.stop(); else this.start(); try { localStorage.setItem('dkMusic', this.on ? '1' : '0'); } catch (e) { } paintCtl(); return this.on; }
  };
  const theme = {
    get() { try { const v = localStorage.getItem('dkTheme'); if (v) return v; } catch (e) { } return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; },
    apply(v) { document.body.classList.toggle('dark', v === 'dark'); const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = v === 'dark' ? '#141b2d' : '#315c8d'; },
    toggle() { const v = document.body.classList.contains('dark') ? 'light' : 'dark'; try { localStorage.setItem('dkTheme', v); } catch (e) { } this.apply(v); paintCtl(); }
  };
  function paintCtl() {
    const d = document.getElementById('kCtl'); if (!d) return; const dark = document.body.classList.contains('dark');
    d.innerHTML = `<button type="button" data-kctl="theme" aria-pressed="${dark}" aria-label="${dark ? 'الوضع النهاري' : 'الوضع الليلي'}" title="${dark ? 'الوضع النهاري' : 'الوضع الليلي'}">${dark ? '☀️' : '🌙'}</button><button type="button" data-kctl="music" aria-pressed="${music.on}" aria-label="الموسيقى الخلفية" title="${music.on ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}">${music.on ? '🎵' : '🔇'}</button>`;
  }
  function bootUi() {
    theme.apply(theme.get());
    if (!document.getElementById('kCtl')) { const d = document.createElement('div'); d.id = 'kCtl'; d.className = 'kCtl'; document.body.appendChild(d); }
    paintCtl();
    // المتصفح لا يسمح بالصوت قبل أول لمسة، فنبدأ الموسيقى المحفوظة عند أول نقرة
    let want = false; try { want = localStorage.getItem('dkMusic') === '1'; } catch (e) { }
    if (want) document.addEventListener('pointerdown', function f() { document.removeEventListener('pointerdown', f); if (!music.on) { music.start(); paintCtl(); } }, { once: true });
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-kctl]'); if (!b) return; if (b.dataset.kctl === 'theme') theme.toggle(); else music.toggle(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootUi); else bootUi();

  /* ------------------------- طابور رسائل الإنجازات ------------------------- */
  // رسالة الإنجاز تنتظر حتى تمر 2.8 ثانية دون رسائل أخرى، فلا تغطي رسالة مهمة (مثل نتيجة البناء)
  let lastToast = 0, achQ = [], achT = null;
  function hookToast() {
    if (typeof window.toast !== 'function' || window.toast.__dk) return;
    const orig = window.toast, w = function () { lastToast = Date.now(); return orig.apply(this, arguments); };
    w.__dk = true; w.__orig = orig; window.toast = w;
  }
  function achToast(msg) { hookToast(); achQ.push(msg); if (!achT) pump(); }
  function pump() {
    if (!achQ.length) { achT = null; return; }
    const wait = 2800 - (Date.now() - lastToast);
    if (wait > 0) { achT = setTimeout(pump, wait + 50); return; }
    if (typeof window.toast === 'function') window.toast(achQ.shift());
    sparkleSound(); achT = setTimeout(pump, 2900);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hookToast); else setTimeout(hookToast, 0);

  /* ------------------------- التنسيق ------------------------- */
  const css = `
.kWallet{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:8px;margin:8px 0}
.kRes{background:linear-gradient(145deg,#fff8e1,#eaf7ef);border:1px solid #e5dcc0;border-radius:14px;padding:8px 4px;text-align:center;display:flex;flex-direction:column;align-items:center}
.kRes span{font-size:22px}.kRes b{font-size:20px}.kRes small{font-size:11px;opacity:.8}
.kMap{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-areas:"z4 z5 z3" "z2 z0 z1" "z7 z6 z6";gap:8px;padding:10px;border-radius:24px;border:4px solid #fff;background:linear-gradient(160deg,#a8dcf0,#bfe8b8 45%,#8fcf9a);box-shadow:inset 0 0 40px #ffffff80,0 8px 20px #0002}
.kZone{grid-area:var(--a);position:relative;border-radius:20px;padding:8px 6px 22px;min-height:120px;border:2px dashed #ffffffb0;display:flex;flex-direction:column;align-items:center;gap:4px;transition:filter .4s}
.z0{--a:z0;background:radial-gradient(circle,#fff6cf,#f6df97)}.z1{--a:z1;background:radial-gradient(circle,#e3f6c2,#a8db7c)}.z2{--a:z2;background:radial-gradient(circle,#b9e3b0,#5fa968)}
.z3{--a:z3;background:radial-gradient(circle,#e7e4ff,#b7b1f0)}.z4{--a:z4;background:radial-gradient(circle,#fff1c9 0 35%,#7fd0e8 70%)}.z5{--a:z5;background:radial-gradient(circle,#f1f1f1,#b8b2a6)}
.z6{--a:z6;background:radial-gradient(circle,#ffe7f3,#f2b6d3)}.z7{--a:z7;background:linear-gradient(135deg,#ffd6e8,#fff3b0,#c8f7dc,#c9d8ff)}
.kZone.fog{filter:grayscale(.85) brightness(.92)}.kZone.fog::after{content:'☁️' / '';position:absolute;top:4px;left:8px;font-size:22px;opacity:.8}
.kZone.rare.open{box-shadow:0 0 18px #ffe066}
.kZoneHead{background:#ffffffd9;border:0;border-radius:12px;padding:4px 10px;font-weight:bold;font-size:14px;cursor:pointer;color:#24304a}
.kPlots{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.kMap .kPlot{position:relative;width:92px;min-height:86px;border-radius:16px;border:2px solid #fff;background:#ffffffc4;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:4px 2px;box-shadow:0 4px 0 #0000001a;color:#24304a}
.kPlot:focus-visible,.kZoneHead:focus-visible,.kChest:focus-visible{outline:4px solid #315c8d;outline-offset:2px}
.kPlot .kLook{font-size:30px;line-height:1.2;white-space:nowrap}.kPlot .kName{font-size:11px;font-weight:bold;line-height:1.3}
.kPlot .kLv{font-size:11px;color:#c98a00;letter-spacing:-1px}
.kPlot.site{border-style:dashed;background:#ffffff80}.kPlot.locked{opacity:.7;background:#eeeeee90}
.kPlot.lv2{background:linear-gradient(#fff,#e8eef5)}.kPlot.lv3{background:linear-gradient(#fff,#ffe9a8);border-color:#f4c542}
.kPlot.lv4{background:linear-gradient(#fff,#b8f0d2);border-color:#3fbf7f}.kPlot.lv5{background:linear-gradient(135deg,#ffe0f0,#fff3b0,#c8f7dc,#c9d8ff);border-color:#b48cff;box-shadow:0 0 14px #b48cffaa}
.kPlot.ready{animation:kGlow 1.4s ease-in-out infinite}
@keyframes kGlow{0%,100%{box-shadow:0 0 0 0 #ffd54f00}50%{box-shadow:0 0 0 6px #ffd54fcc}}
.kMap .kPop{animation:kPop .9s ease-out both;animation-delay:var(--pd,0ms)}.kPop::after{content:'✨🎉✨' / '';position:absolute;top:-14px;left:0;right:0;font-size:18px;animation:kRise 1.2s ease-out forwards;animation-delay:var(--pd,0ms)}
@keyframes kPop{0%{transform:scale(.6)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
@keyframes kRise{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-26px)}}
.kMap .kChest,.kMap .kFlag{position:absolute;top:2px;right:6px;border:0;background:none;box-shadow:none;padding:0;min-height:0;font-size:24px;cursor:pointer;animation:kBob 1.6s ease-in-out infinite}.kMap .kFlag{right:auto;left:6px}
@keyframes kBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.kReq{font-size:11px;text-align:center;background:#ffffffd0;border-radius:8px;padding:2px 6px;color:#5a3d00}
.kDecos{position:absolute;bottom:2px;left:6px;right:6px;display:flex;gap:2px;justify-content:center;font-size:16px;pointer-events:none}
.kSkin-ice .z0{background:radial-gradient(circle,#f0fbff,#a9dcf5)}.kSkin-candy .z0{background:radial-gradient(circle,#fff0f7,#ffb3d9)}.kSkin-desert .z0{background:radial-gradient(circle,#fff6dc,#f2c879)}
.kSkin-night .z0{background:radial-gradient(circle,#4b4a8a,#1f2350);color:#fff}.kSkin-gold .z0{background:radial-gradient(circle,#fff7cc,#e8b923)}
.kHint{text-align:center}
.kSheetWrap{position:fixed;inset:0;background:#14213dcc;z-index:1000;display:grid;place-items:center;padding:14px}.kSheetWrap.hidden{display:none}
.kSheet{background:#fffdf5;border-radius:22px;padding:18px;max-width:560px;width:100%;max-height:90vh;overflow:auto;text-align:center;color:#24304a;animation:kPop .3s ease-out}
.kSheetLook{font-size:64px;line-height:1.1}.kTiers{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:8px 0}
.kTier{background:#eef1f5;border-radius:12px;padding:4px 8px;font-size:22px;opacity:.5;display:flex;flex-direction:column;align-items:center}.kTier small{font-size:11px}
.kTier.on{opacity:1;background:#fff4ce}.kTier.cur{outline:3px solid #f4b942}
.kCosts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0}.kCost{border-radius:10px;padding:4px 8px;font-weight:bold}.kCost.ok{background:#d6f5df}.kCost.no{background:#ffe0dc}
.kNo{color:#b3261e;font-weight:bold}.kOk{color:#1e7d3c;font-weight:bold}.kBig{font-size:20px;padding:12px 20px;margin-top:8px}
.kChips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.kChip{font-size:14px;padding:6px 10px}
.kBar{height:14px;background:#e6e9ef;border-radius:10px;overflow:hidden;margin:6px 0}.kBar span{display:block;height:100%;background:linear-gradient(90deg,#68c38f,#f4b942);border-radius:10px;transition:width .6s}.kBar.sm{height:8px;margin:3px 0}
.kRegions{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}.kRegCard{background:#f3f3f3;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:2px}.kRegCard.open{background:#eefaf0}.kRegCard.rare{background:linear-gradient(135deg,#ffe6f2,#fff6cc,#e3f9ec)}
.kRegBtn{text-align:right;background:#fff;font-size:15px}
.kItems{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}.kItem{background:#fff;border:2px solid #ece6d6;border-radius:14px;padding:8px;text-align:center;display:flex;flex-direction:column;gap:4px;align-items:center}
.kItem small{font-size:11px;opacity:.85}.kItemE{font-size:32px}.kItem button{width:100%}
.kTitle{display:inline-block;background:linear-gradient(120deg,#fff1c1,#e3d9ff);border-radius:12px;padding:2px 8px;font-size:13px;font-weight:bold;color:#24304a}
.kProfile{text-align:right}.kProfHead{display:flex;gap:10px;align-items:center}.kProfAv{font-size:44px}
.kTitles{display:flex;flex-wrap:wrap;gap:4px}.kTitles span{background:#eee;border-radius:10px;padding:2px 8px;font-size:12px;opacity:.6}.kTitles span.on{background:#fff1c1;opacity:1;font-weight:bold}
.kAchs{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px}.kAch{background:#f2f2f2;border-radius:12px;padding:6px;text-align:center;font-size:13px;opacity:.75}.kAch.done{background:#fff4ce;opacity:1}.kAchE{font-size:24px;display:block}
.kMiniRow{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;font-size:24px}.kMini sub{font-size:11px}
.kHarvest{background:linear-gradient(120deg,#fff6cc,#e2f7d8);border-radius:14px;padding:8px 12px;font-weight:bold;margin:8px 0}
.kKingdoms{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}.kKCard{background:#ffffff1f;border:1px solid #ffffff40;border-radius:16px;padding:10px}
.kCtl{position:fixed;bottom:10px;left:10px;z-index:50;display:flex;gap:6px;opacity:.9}.kCtl button{border-radius:50%;width:42px;height:42px;padding:0;font-size:19px;box-shadow:0 3px 10px #0003;min-height:0}
.oDisplay .kKCard,.oDisplay .kKCard small,.oDisplay .kKCard .small{color:#f3f6ff}.oDisplay .kKCard{background:#ffffff26}.oDisplay .kMiniRow{font-size:30px}
@media(max-width:560px){.kMap{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-areas:"z0 z0" "z1 z2" "z3 z4" "z5 z6" "z7 z7";padding:6px}.kPlot{width:78px;min-height:78px}.kPlot .kLook{font-size:24px}}
body.dark{--ink:#e8ecf6;background:linear-gradient(145deg,#121a2c,#1c2440 60%,#20304a);color:#e8ecf6}
body.dark .panel,body.dark .modal>div{background:linear-gradient(150deg,#1d2740,#1a2a36);border-color:#33435f;color:#e8ecf6;box-shadow:none}
body.dark .stat,body.dark .kRes{background:linear-gradient(145deg,#26324d,#22383a);border-color:#3a4a66;color:#e8ecf6}
body.dark .item-card,body.dark .building,body.dark .kItem,body.dark .kRegCard,body.dark .kAch{background:#232f4a;border-color:#3a4a66;color:#e8ecf6}
body.dark .kRegCard.open,body.dark .kAch.done{background:#2c3b2f}body.dark .kRegBtn{background:#2a3654;color:#e8ecf6}
body.dark input,body.dark select,body.dark textarea{background:#16203a;color:#e8ecf6;border-color:#3a4a66}
body.dark button{background:#2f3d5e;color:#f1f4fb;border-color:#45577c}body.dark button.primary{background:linear-gradient(120deg,#c58a12,#d4682f);color:#fff}
body.dark table,body.dark td,body.dark th{color:#e8ecf6;border-color:#3a4a66}body.dark th{background:#26324d}body.dark .oBoard tr.me td{background:#4a3f1e}
body.dark .notice{background:#26324d;color:#e8ecf6;border-color:#3a4a66}body.dark header,body.dark nav{background:transparent;color:#e8ecf6}
body.dark .kMap{background:linear-gradient(160deg,#1f3d58,#24453a 45%,#1d3a2b);border-color:#33435f}body.dark .kZone{filter:brightness(.82)}body.dark .kZone.fog{filter:grayscale(.85) brightness(.55)}
body.dark .kMap .kPlot{background:#ffffffd0;color:#24304a;border-color:#fff}body.dark .kMap .kPlot.locked{background:#d9dde5;opacity:.75}body.dark .kMap .kPlot.site{background:#ffffffa0}body.dark .kMap .kPlot.lv3{background:linear-gradient(#fff,#ffe9a8)}body.dark .kMap .kPlot.lv4{background:linear-gradient(#fff,#b8f0d2)}body.dark .kMap .kPlot.lv5{background:linear-gradient(135deg,#ffe0f0,#fff3b0,#c8f7dc,#c9d8ff)}body.dark .kMap .kChest,body.dark .kMap .kFlag{background:none}
body.dark .kSheet{background:#1d2740;color:#e8ecf6}body.dark .kTier{background:#2a3654}body.dark .kTier.on{background:#4a3f1e}body.dark .kBar{background:#33405c}
body.dark .oAns{background:#26324d;border-color:#3a4a66;color:#e8ecf6}body.dark .oAns.correct{background:#1f5132}body.dark .oAns.wrong{background:#5c2626}
body.dark .oChip,body.dark .kZoneHead,body.dark .kReq{background:#2a3654;color:#e8ecf6}body.dark .oRegion{background:#2a3654}body.dark .oCh{background:#2e2a1e}
body.dark .kCost.ok{background:#1f5132}body.dark .kCost.no{background:#5c2626}body.dark .kNo{color:#ff9d93}body.dark .kOk{color:#8be0a6}
body.dark .kTitles span{background:#2a3654}body.dark .kTitles span.on{background:#4a3f1e}body.dark .kTitle{background:linear-gradient(120deg,#4a3f1e,#3b3466);color:#fff}
body.dark .footer,body.dark .small{color:#b9c3d8}body.dark .oEvent,body.dark .kHarvest{background:linear-gradient(120deg,#3d3518,#2b3c2a);color:#f6f0d8}
body.dark .introCard{background:#1d2740;color:#e8ecf6}
@media (prefers-reduced-motion: reduce){.kPlot.ready,.kPop,.kPop::after,.kChest,.kFlag{animation:none}}`;
  const st = document.createElement('style'); st.id = 'kCss'; st.textContent = css; (document.head || document.documentElement).appendChild(st);

  window.DKK = {
    RES, BUILDINGS, REGIONS, DECOS, AVATARS, SKINS, TITLES, ACH, BOX_COST,
    norm, lvOf, builtCount, maxLv, knowTotal, bState, look, build, harvest, autoRegions, regionReq, openRare, openNextFree,
    collectTreasure, achToast, missionState, claimMission, price, stealFactor, chBonus, buy, openBox, resTxt,
    xp, levelOf, levelBadge, achList, prof, profileHtml,
    walletHtml, mapHtml, miniHtml, regionsHtml, shopHtml, setCtx, refresh, openSheet, closeSheet, sparkleSound, music, theme, E
  };
})();
