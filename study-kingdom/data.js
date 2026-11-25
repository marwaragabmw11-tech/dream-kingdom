/* =====================================================================
   مملكة أمينة للمذاكرة — طبقة البيانات
   بتقرا الأسئلة من ملفات المواد نفسها (من غير نسخ):
     الرياضيات: ../math/q1–q5.js + qm1–qm2.js (+ steps_en.js للخطوات بالإنجليزي)
     الدراسات:  ../social/s1–s3.js + sm1–sm3.js
     العلوم:    ../science/bank.js  (C, Q, MN, SV…)
     الـICT:    ../ict/q1.js + q2.js (+ lessons.js لأسماء الدروس)
     العربي:    ../arabic/a1–a3.js + a_rev.js (+ alearn.js لأسماء الوحدات)
   وبتحوّلها لشكل واحد تفهمه اللعبة: window.SK = { lands, items }
   ===================================================================== */
(function () {
  'use strict';
  const items = {};                       // id → سؤال اللعبة
  const add = it => { items[it.id] = it; return it.id; };

  /* أسئلة فيها غلط مطبعي في الكتاب نفسه (معلّمة في ملفات الرياضيات) — مش بتدخل اللعبة */
  const SKIP = new Set(['m:m2:16', 'm:m2:35']);

  /* ---------------- الرياضيات ---------------- */
  const MATH_PAPER = new Set(['col', 'est', 'mult', 'bar', 'self', 'multi']);
  const mathItem = (id, q, stage) => SKIP.has(id) ? null : add({
    id, s: 'math', stage, q, lang: 'en',
    paper: MATH_PAPER.has(q.t) || ((q.e || q.s || []).length >= 3)
  });
  const mathStages = [], mathBoss = [];
  const MEMO = { u1: '🏰', u2: '➕', u3: '📏', u4: '🟩', u5: '✖️', u6: '🌈', u7: '🧮', u8: '🧩' };
  Object.keys(window.QUIZ || {}).forEach(u => (window.QUIZ[u] || []).forEach(w => {
    const ids = [];
    Object.keys(w.models).forEach(m => w.models[m].forEach((q, i) => { const id = mathItem(`m:${w.id}:${m}:${i}`, q, w.id); if (id) ids.push(id); }));
    mathStages.push({ id: 'm-' + w.id, title: w.title.replace('Weekly Assessment: ', ''), sub: `Week ${mathStages.length + 1} · page ${w.page}`, emoji: MEMO[u] || '📝', ids });
  }));
  (window.MONTH || []).forEach((mo, k) => {
    const ids = mo.qs.map((q, i) => mathItem(`m:${mo.id}:${i}`, q, mo.id)).filter(Boolean);
    mathBoss.push({ id: 'mb-' + mo.id, title: ['امتحان الشهر الأول', 'امتحان الشهر التاني', 'امتحان الشهر التالت'][k] || mo.title, sub: mo.title + ' · p. ' + mo.page, ids });
  });

  /* ---------------- الدراسات ---------------- */
  const socStages = [], socBoss = [];
  const fixImg = q => q.img && !/^(https?:|\.\.\/)/.test(q.img) ? Object.assign({}, q, { img: '../social/' + q.img }) : q;
  const socItem = (id, q, stage) => add({ id, s: 'soc', stage, q: fixImg(q), lang: 'ar', paper: q.t === 'self' });
  const SEMO = { u1: '🧭', u2: '🏙️', u3: '🇪🇬' };
  Object.keys(window.SQ || {}).forEach(u => (window.SQ[u] || []).forEach(w => {
    const ids = [];
    Object.keys(w.models).forEach(m => w.models[m].forEach((q, i) => ids.push(socItem(`s:${w.id}:${m}:${i}`, q, w.id))));
    socStages.push({ id: 's-' + w.id, title: w.title, sub: `الأسبوع ${socStages.length + 1} · ص ${w.page}`, emoji: SEMO[u] || '🧭', ids });
  }));
  (window.SMONTH || []).forEach(mo => {
    socBoss.push({ id: 'sb-' + mo.id, title: mo.title, sub: mo.sub || '', ids: mo.qs.map((q, i) => socItem(`s:${mo.id}:${i}`, q, mo.id)) });
  });
  /* بنك كلمات لكل وحدة دراسات: منه بنجيب الكلمات «الغلط» في صيد الكلمات */
  const socKeyPool = {};
  Object.values(items).filter(it => it.s === 'soc' && it.q.t === 'self').forEach(it => {
    const u = it.stage; (socKeyPool[u] = socKeyPool[u] || []).push(...(it.q.keys || []));
  });

  /* ---------------- العلوم ---------------- */
  const sciStages = [], sciBoss = [];
  const SQB = typeof Q !== 'undefined' ? Q : [], SC = typeof C !== 'undefined' ? C : [];
  const SCI_PAPER = /Give Reason|What Happens|Compare|Short Answer|Define|Correct/;
  SQB.forEach((r, i) => add({ id: 'c:' + i, s: 'sci', stage: r[9] ? 'month' + r[9] : 'ch' + r[0], row: r, idx: i, lang: 'en', paper: r[4].length === 1 && SCI_PAPER.test(r[1]) }));
  const SCI_AR = ['الطبيعة من حولنا', 'إزاي الحشرات بتكبر', 'إزاي النبات بيكبر', 'خصائص الضوء', 'خصائص الصوت', 'قوة الرياح', 'قوة المطاط', 'التربة والماء والحياة'];
  const SCI_EMO = ['🦊', '🦋', '🌱', '💡', '🔊', '⛵', '🪀', '🏺'];
  SC.forEach((name, c) => sciStages.push({ id: 'c-' + c, title: name, sub: SCI_AR[c] || '', emoji: SCI_EMO[c] || '🔬', ids: SQB.map((r, i) => (!r[9] && r[0] === c) ? 'c:' + i : null).filter(Boolean) }));
  [1, 2, 3].forEach(m => sciBoss.push({ id: 'cb-' + m, title: ['التقييم الشهري الأول', 'التقييم الشهري التاني', 'التقييم الشهري التالت'][m - 1], sub: (typeof MN !== 'undefined' ? MN[m - 1] : ''), ids: SQB.map((r, i) => r[9] === m ? 'c:' + i : null).filter(Boolean) }));

  /* ---------------- الـICT ---------------- */
  const ictStages = [], ictBoss = [];
  const ISETS = (window.ICTQ && window.ICTQ.sets) || [], ILES = window.ICTL || [];
  const ictItem = (set, q, i) => add({ id: `i:${set.id}:${i}`, s: 'ict', stage: set.id, q, lang: 'en', set, paper: q.t === 'self' || q.t === 'tf' });
  ISETS.forEach(set => {
    const ids = set.qs.map((q, i) => ictItem(set, q, i));
    const les = set.lesson && ILES[set.unit - 1] ? ILES[set.unit - 1].lessons[set.lesson - 1] : null;
    if (set.kind === 'ex' || set.kind === 'test') ictStages.push({ id: 'i-' + set.id, title: set.title, sub: `Unit ${set.unit}` + (les ? ' · ' + les.ar : ''), emoji: les ? les.emoji : '🎯', ids });
  });
  const bossOf = (title, sub, kinds, unit) => ({ id: 'ib-' + title.replace(/\s+/g, ''), title, sub, ids: [].concat(...ISETS.filter(st => kinds.includes(st.kind) && (!unit || st.unit === unit) && (st.kind !== 'month' || st.unit === unit)).map(st => st.qs.map((_, i) => `i:${st.id}:${i}`))) });
  if (ISETS.length) {
    ictBoss.push(bossOf('امتحان أكتوبر', 'October Exam · Lessons 1–5', ['month'], 1));
    ictBoss.push(bossOf('امتحان نوفمبر', 'November Exam · Unit 2 lessons 1–4', ['month'], 2));
    ictBoss.push(bossOf('نماذج الوحدة الأولى', 'Revision on Unit 1 · 5 model exams', ['model'], 1));
    ictBoss.push(bossOf('نماذج الوحدة التانية', 'Revision on Unit 2 · 5 model exams', ['model'], 2));
  }

  /* ---------------- اللغة العربية ---------------- */
  const arStages = [], arBoss = [];
  const AUN = window.AUNITS || [], AEMO = { u1: '🌟', u2: '💛', u3: '🌳' };
  const arItem = (id, q, stage) => add({ id, s: 'ar', stage, q, lang: 'ar', paper: q.t === 'self' });
  AUN.forEach(u => ((window.AQ || {})[u.id] || []).forEach(w => {
    const ids = [];
    Object.keys(w.models).forEach(m => w.models[m].forEach((q, i) => ids.push(arItem(`a:${w.id}:${m}:${i}`, q, w.id))));
    arStages.push({ id: 'a-' + w.id, title: w.title, sub: `الأسبوع ${arStages.length + 1} · ص ${w.page}`, emoji: AEMO[u.id] || u.emoji || '📖', ids });
  }));
  (window.AMONTH || []).forEach(mo => {
    arBoss.push({ id: 'ab-' + mo.id, title: mo.title, sub: mo.sub || '', ids: mo.qs.map((q, i) => arItem(`a:${mo.id}:${i}`, q, mo.id)) });
  });
  const arKeyPool = {};
  Object.values(items).filter(it => it.s === 'ar' && it.q.t === 'self').forEach(it => {
    const u = it.stage; (arKeyPool[u] = arKeyPool[u] || []).push(...(it.q.keys || []));
  });

  /* ---------------- الأراضي ---------------- */
  const lands = [
    { id: 'math', name: 'وادي المطبخ', sub: 'الرياضيات', emoji: '🧁', col: '#ff7a59', bg: '#fff0e8', stages: mathStages, boss: mathBoss, bossName: 'الشيف العملاق', bossEmoji: '🧑‍🍳' },
    { id: 'sci', name: 'غابة الحيوانات', sub: 'العلوم', emoji: '🌿', col: '#2fa36b', bg: '#e6f7ee', stages: sciStages, boss: sciBoss, bossName: 'التنين النعسان', bossEmoji: '🐉' },
    { id: 'soc', name: 'جزيرة المستكشف', sub: 'الدراسات الاجتماعية', emoji: '🧭', col: '#3b7fc4', bg: '#e6effa', stages: socStages, boss: socBoss, bossName: 'حارس الخريطة', bossEmoji: '🗿' },
    { id: 'ict', name: 'مدينة الروبوتات', sub: 'الـICT', emoji: '🤖', col: '#5b6cff', bg: '#eceeff', stages: ictStages, boss: ictBoss, bossName: 'الروبوت المتمرّد', bossEmoji: '👾' },
    { id: 'ar', name: 'واحة الحكايات', sub: 'اللغة العربية', emoji: '🌴', col: '#c98a12', bg: '#fff5dc', stages: arStages, boss: arBoss, bossName: 'أسد الواحة', bossEmoji: '🦁' }
  ].filter(l => l.stages.length);
  lands.forEach(l => { l.all = [].concat(...l.stages.map(s => s.ids), ...l.boss.map(b => b.ids)); });

  window.SK = { lands, items, socKeyPool, arKeyPool, landOf: id => lands.find(l => l.id === items[id].s) };
})();
