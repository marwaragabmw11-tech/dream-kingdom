/* Multiplication: Japanese line method, fast tricks, table map, speed game */
(function(){
const E = window.ENG, H = E.H;
const T = window.TIMES = {};
const COLORS = ['#e55039', '#3c6382', '#38ada9', '#f6b93b', '#8e44ad'];

/* ---------- Japanese line method ---------- */
T.japanese = (root) => {
  const box = H('div', 'jp');
  const ctl = H('div', 'jpctl'); ctl.dir = 'ltr';
  const a = H('input', 'inp'), b = H('input', 'inp');
  a.value = '23'; b.value = '12'; [a, b].forEach(i => { i.setAttribute('inputmode', 'numeric'); i.maxLength = 3; });
  b.maxLength = 2;
  const go = H('button', 'btn', 'ارسمي ✏️');
  ctl.append(a, H('span', 'x', '×'), b, go);
  const stage = H('div', 'jpstage'), info = H('div', 'jpinfo'), nav = H('div', 'qbtns');
  const nextB = H('button', 'btn', 'الخطوة الجاية ▶'), againB = H('button', 'btn ghost', '↺ من الأول');
  nav.append(nextB, againB);
  box.append(E.ar('اكتبي رقمين (الأول لحد 3 أرقام، التاني لحد رقمين) واضغطي ارسمي. بعدين امشي خطوة خطوة 👣', 'mini'), ctl, stage, info, nav);
  root.appendChild(box);
  let st = null;
  const build = () => {
    const A = String(E.num(a.value) || 23).slice(0, 3), B = String(E.num(b.value) || 12).slice(0, 2);
    a.value = A; b.value = B;
    const ad = A.split('').map(Number), bd = B.split('').map(Number);
    const S = 340, pad = 40, gap = 16, lineGap = 9;
    const groupsPos = (digits) => { // positions along an axis, groups separated
      const widths = digits.map(d => Math.max(1, d) - 1);
      const total = widths.reduce((s, w) => s + w * lineGap, 0) + gap * 2 * (digits.length - 1);
      let p = (S - total) / 2; const out = [];
      digits.forEach((d, k) => { const g = []; const n = Math.max(1, d); for (let i = 0; i < n; i++) g.push(p + i * lineGap); out.push(g); p += (n - 1) * lineGap + gap * 2; });
      return out;
    };
    const rows = groupsPos(ad), cols = groupsPos(bd);
    const placeA = k => ad.length - 1 - k, placeB = k => bd.length - 1 - k;
    const xs = cols.flat(), ys = rows.flat(), m = 22;
    const x0 = Math.min(...xs) - m, x1 = Math.max(...xs) + m, y0 = Math.min(...ys) - m, y1 = Math.max(...ys) + m;
    const rot = ([x, y]) => { const c = S / 2, dx = x - c, dy = y - c, k = Math.SQRT1_2; return [c + (dx + dy) * k, c + (dy - dx) * k]; };
    const rc = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(rot);
    const bx0 = Math.min(...rc.map(p => p[0])) - 8, bx1 = Math.max(...rc.map(p => p[0])) + 8, by0 = Math.min(...rc.map(p => p[1])) - 8, by1 = Math.max(...rc.map(p => p[1])) + 8;
    let svg = `<svg viewBox="${bx0} ${by0} ${bx1 - bx0} ${by1 - by0}" class="jpsvg"><g transform="rotate(-45 ${S / 2} ${S / 2})">`;
    rows.forEach((g, k) => g.forEach(y => svg += `<line class="la ${ad[k] === 0 ? 'zero' : ''}" x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${COLORS[0]}"/>`));
    cols.forEach((g, k) => g.forEach(x => svg += `<line class="lb ${bd[k] === 0 ? 'zero' : ''}" x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${COLORS[1]}"/>`));
    const zones = {};
    rows.forEach((g, i) => cols.forEach((h, j) => {
      if (!ad[i] || !bd[j]) return;
      const pl = placeA(i) + placeB(j); zones[pl] = (zones[pl] || 0) + ad[i] * bd[j];
      g.forEach(y => h.forEach(x => svg += `<circle class="dot z${pl}" cx="${x}" cy="${y}" r="4"/>`));
    }));
    svg += '</g></svg>';
    stage.innerHTML = svg;
    const maxP = ad.length + bd.length - 2;
    st = { A: +A, B: +B, ad, bd, zones, maxP, step: 0 };
    stage.querySelectorAll('line,circle').forEach(e => e.style.opacity = 0);
    info.innerHTML = ''; info.appendChild(E.ar(`هنضرب ${A} × ${B} من غير جدول ضرب! بس هنرسم خطوط ونعدّ النقط 🔴🔵`, 'say'));
    nextB.disabled = false;
  };
  const names = ['الآحاد (Ones)', 'العشرات (Tens)', 'المئات (Hundreds)', 'الآلاف (Thousands)', 'عشرات الآلاف'];
  const next = () => {
    if (!st) return; st.step++; E.pop();
    const s = st.step, P = st.maxP;
    if (s === 1) {
      stage.querySelectorAll('.la').forEach(e => e.style.opacity = 1);
      info.appendChild(E.ar(`🔴 الرقم ${st.A}: كل رقم فيه = مجموعة خطوط. ${st.ad.map(d => d === 0 ? 'الصفر = خط باهت مالوش نقط' : d + ' خطوط').join(' ثم ')}.`, 'say'));
    } else if (s === 2) {
      stage.querySelectorAll('.lb').forEach(e => e.style.opacity = 1);
      info.appendChild(E.ar(`🔵 الرقم ${st.B}: نرسم خطوطه بالعرض عليهم: ${st.bd.map(d => d === 0 ? 'خط باهت' : d + ' خطوط').join(' ثم ')}.`, 'say'));
    } else if (s === 3) {
      stage.querySelectorAll('circle').forEach(e => e.style.opacity = 1);
      info.appendChild(E.ar('✨ كل مكان الخطوط بتتقاطع فيه = نقطة. النقط اتجمعت في عواميد ملوّنة: كل عمود = خانة. اليمين = الآحاد.', 'say'));
      for (let p = 0; p <= P; p++) stage.querySelectorAll('.z' + p).forEach(c => c.style.fill = COLORS[(p + 2) % COLORS.length]);
    } else if (s - 4 <= P) {
      const p = s - 4, n = st.zones[p] || 0;
      stage.querySelectorAll('circle').forEach(c => c.classList.remove('glow'));
      stage.querySelectorAll('.z' + p).forEach(c => c.classList.add('glow'));
      info.appendChild(E.ar(`👆 ${names[p] || 'الخانة ' + (p + 1)}: نعدّ النقط = ${n}`, 'say'));
    } else if (s === P + 5) {
      let carry = 0, digits = [], txt = [];
      for (let p = 0; p <= P || carry; p++) {
        const v = (st.zones[p] || 0) + carry; digits.unshift(v % 10);
        txt.push(`${names[p] || 'الخانة ' + (p + 1)}: ` + (carry ? `${st.zones[p] || 0} + ${carry} شايل = ${v}` : `${v}`) + (v > 9 ? ` ← نكتب ${v % 10} ونشيل ${Math.floor(v / 10)}` : ' ✔'));
        carry = Math.floor(v / 10);
      }
      info.appendChild(E.ar('🎒 لو عمود فيه 10 أو أكتر، نشيل للعمود اللي على شماله:<br>' + txt.join('<br>'), 'say'));
      info.appendChild(E.ar(`🎉 ${st.A} × ${st.B} = ${E.fmt(st.A * st.B)}`, 'say big'));
      E.ding(); nextB.disabled = true;
    }
    info.scrollTop = info.scrollHeight;
  };
  go.onclick = build; againB.onclick = build; nextB.onclick = next;
  build();
};

/* ---------- 9 finger trick ---------- */
T.fingers = (root) => {
  const w = H('div', 'fing');
  const hands = H('div', 'hands'); hands.dir = 'ltr';
  const out = E.ar('اضغطي على أي صباع 👆', 'say');
  for (let i = 1; i <= 10; i++) {
    const f = H('button', 'finger', `<span>${i}</span>`); f.style.setProperty('--h', [62, 74, 82, 76, 50, 50, 76, 82, 74, 62][i - 1] + 'px');
    if (i === 6) hands.appendChild(H('span', 'handgap'));
    f.onclick = () => {
      [...hands.querySelectorAll('.finger')].forEach((x, k) => { x.classList.toggle('down', k + 1 === i); x.classList.toggle('left', k + 1 < i); });
      out.innerHTML = ''; out.appendChild(E.ar(`9 × ${i}: ثنينا صباع رقم ${i}. الصوابع اللي على شماله = ${i - 1} (عشرات) واللي على يمينه = ${10 - i} (آحاد) ← <b>${9 * i}</b> 🎉`));
      E.pop();
    };
    hands.appendChild(f);
  }
  w.append(hands, out); root.appendChild(w);
};

/* ---------- table map (which trick covers which fact) ---------- */
const trickOf = (r, c) => {
  const [a, b] = [Math.min(r, c), Math.max(r, c)];
  if (a === 1) return ['×1', 'أي رقم × 1 = نفسه 😎', '#dfe6e9'];
  if (a === 10 || b === 10) return ['×10', 'حطي صفر على اليمين 🚌', '#c7ecee'];
  if (a === 2) return ['×2', 'ضعف الرقم (اجمعيه على نفسه) 👯', '#ffeaa7'];
  if (a === 5 || b === 5) return ['×5', 'اضربي في 10 وخدي النص ✂️', '#fab1a0'];
  if (a === 9 || b === 9) return ['×9', 'صوابع الـ9 🖐️ أو ×10 ناقص الرقم', '#a29bfe'];
  if (a === 4 || b === 4) return ['×4', 'ضعف الضعف 👯👯', '#81ecec'];
  if (a === 3 || b === 3) return ['×3', 'ضعف + الرقم كمان مرة', '#ffd3b6'];
  if (a === b) return ['²', 'مربع: احفظيه كصورة 🟥', '#fd79a8'];
  if (a === 6 && b === 8) return ['6×8', '6 × 8 = 48 ← "6 و8 قعدوا على 48" 🎵', '#55efc4'];
  if (a === 7 && b === 8) return ['56', '5, 6, 7, 8 ← 56 = 7 × 8 🎵', '#55efc4'];
  if (a === 6 && b === 7) return ['6×7', '6 × 7 = 42 (6 × 6 = 36 + 6) 🪜', '#55efc4'];
  return ['', '', '#eee'];
};
T.map = (root) => {
  const g = H('div', 'tgrid'); g.dir = 'ltr';
  const tip = E.ar('اضغطي على أي خانة تعرفي الحيلة بتاعتها 👆', 'say');
  g.appendChild(H('div', 'th', '×'));
  for (let c = 1; c <= 10; c++) g.appendChild(H('div', 'th', c));
  for (let r = 1; r <= 10; r++) {
    g.appendChild(H('div', 'th', r));
    for (let c = 1; c <= 10; c++) {
      const [lab, txt, col] = trickOf(r, c);
      const d = H('button', 'tc', r * c); d.style.background = col;
      d.onclick = () => { tip.innerHTML = ''; tip.appendChild(E.ar(`<b>${r} × ${c} = ${r * c}</b> — ${txt}` + (r !== c ? ` ، ونفسها ${c} × ${r} 🔄` : ''))); g.querySelectorAll('.tc').forEach(x => x.classList.remove('on')); d.classList.add('on'); E.pop(); };
      g.appendChild(d);
    }
  }
  root.append(g, tip);
};

/* ---------- speed game ---------- */
T.game = (root) => {
  const w = H('div', 'game');
  const pick = H('div', 'chips'); const chosen = new Set([2, 3, 4, 5]);
  for (let n = 2; n <= 10; n++) { const c = H('button', 'chip' + (chosen.has(n) ? ' sel' : ''), '×' + n); c.onclick = () => { chosen.has(n) ? chosen.delete(n) : chosen.add(n); c.classList.toggle('sel'); }; pick.appendChild(c); }
  const start = H('button', 'btn big', '🚀 يلا نلعب');
  const play = H('div', 'play hide');
  const prog = H('div', 'rocket', '<i></i><span>🚀</span>');
  const qq = H('div', 'gq'); qq.dir = 'ltr';
  const disp = H('div', 'gdisp'); disp.dir = 'ltr';
  const pad = H('div', 'keypad'); pad.dir = 'ltr';
  const msg = H('div', 'fb');
  let cur = null, n = 0, good = 0, val = '';
  const newQ = () => {
    const arr = [...chosen]; const a = arr[Math.floor(Math.random() * arr.length)] || 2, b = 1 + Math.floor(Math.random() * 10);
    cur = Math.random() < .5 ? [a, b] : [b, a]; val = ''; disp.textContent = '?'; qq.textContent = `${cur[0]} × ${cur[1]} =`; msg.textContent = '';
    prog.querySelector('i').style.width = (n * 10) + '%'; prog.querySelector('span').style.insetInlineStart = (n * 10) + '%';
  };
  const submit = () => {
    if (!val) return; const ok = +val === cur[0] * cur[1]; n++;
    if (ok) { good++; E.ding(); msg.className = 'fb good'; msg.textContent = 'صح! ⭐'; }
    else { E.boop(); msg.className = 'fb bad'; msg.innerHTML = ''; msg.appendChild(E.ar(`${cur[0]} × ${cur[1]} = ${cur[0] * cur[1]} — ${trickOf(cur[0], cur[1])[1] || 'جربي الحيلة'}`)); }
    setTimeout(() => {
      if (n >= 10) {
        play.classList.add('hide'); start.classList.remove('hide'); pick.classList.remove('hide');
        res.innerHTML = ''; res.appendChild(E.ar(`خلّصتي! ${good} من 10 ${good >= 9 ? '🏆 بطلة!' : good >= 6 ? '🌟 شاطرة جداً!' : '💪 كل مرة هتبقي أسرع!'}`, 'say big'));
        const k = 'game:' + new Date().toISOString().slice(0, 10) + ':' + Date.now(); if (good >= 8) { E.S.stars[k] = 1; E.save(); E.onStar(); }
      } else newQ();
    }, ok ? 550 : 1800);
  };
  ['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', '✔'].forEach(k => {
    const bt = H('button', 'key' + (k === '✔' ? ' go' : ''), k);
    bt.onclick = () => { if (k === '⌫') val = val.slice(0, -1); else if (k === '✔') return submit(); else if (val.length < 3) val += k; disp.textContent = val || '?'; E.pop(); };
    pad.appendChild(bt);
  });
  const res = H('div', '');
  start.onclick = () => { if (!chosen.size) return; n = 0; good = 0; res.innerHTML = ''; play.classList.remove('hide'); start.classList.add('hide'); pick.classList.add('hide'); newQ(); };
  play.append(prog, qq, disp, pad, msg);
  w.append(E.ar('اختاري الجداول اللي عايزة تتمرني عليها (من غير وقت، براحتك 🌸):', 'mini'), pick, start, res, play);
  root.appendChild(w);
};
})();
