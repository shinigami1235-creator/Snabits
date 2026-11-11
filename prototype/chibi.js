/* Smooth chibi monsters drawn the way Nong Tape is drawn: a darker copy of the body under it for depth,
   one white highlight arc, big dark eyes with two sparkles, pink blush, thick round limbs, and every colour
   a shade of the photo's colours. The Mega is the full drawing and Byte and Bit take parts away.
   Units are a 200×200 box with the ground at y 188. The caller scales the context.
   Only Chomp is drawn so far. */
const CHIBI = (() => {
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const dk = (c, t) => mix(c, [0, 0, 0], t), lt = (c, t) => mix(c, [255, 255, 255], t);
  const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`, rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const lerp = (a, b, t) => a + (b - a) * t;
  const INK = [42, 22, 30], BLUSH = [245, 154, 181], TONGUE = [242, 122, 155];

  /* Bit keeps the silhouette, eyes, feet, colour and the toothy mouth. Byte adds arms and the training mark.
     Mega adds fangs, claws, the second mark and the element pattern. */
  const STAGE = {
    Bit:  { bw: 80,  bh: 64,  r: 26, eye: 0.82, arm: 0,  hand: 0,   foot: [11, 7],  mw: 0.46, teeth: 4, fang: 0, toes: 0 },
    Byte: { bw: 106, bh: 84,  r: 32, eye: 0.96, arm: 9,  hand: 6.5, foot: [13, 8],  mw: 0.58, teeth: 5, fang: 0, toes: 0 },
    Mega: { bw: 126, bh: 100, r: 38, eye: 1.04, arm: 11, hand: 8.5, foot: [16, 9.5], mw: 0.64, teeth: 6, fang: 2, toes: 3 }
  };

  /* Arms are [elbow out, elbow y, hand out, hand y] from the shoulder, where "out" points away from the body,
     so every pose blends into every other. Feet are [left dx, left lift, right dx, right lift]. */
  const POSE = {
    idle:   { arm: [[12, 8, 16, 22], [12, 8, 16, 22]], feet: [0, 0, 0, 0], eyes: 'open', open: 0 },
    walk:   { arm: [[12, 8, 16, 22], [12, 8, 16, 22]], feet: [0, 0, 0, 0], eyes: 'open', open: 0.1, walk: 1 },
    happy:  { arm: [[16, -10, 14, -28], [16, -10, 14, -28]], feet: [-3, 0, 3, 0], eyes: 'happy', open: 0.75, lift: -12, extra: 'heart' },
    eat:    { arm: [[8, 16, -8, 24], [8, 16, -8, 24]], feet: [0, 0, 0, 0], eyes: 'happy', open: 0.5, chew: 1, front: 1, extra: 'crumbs' },
    hurt:   { arm: [[8, 2, 2, -12], [8, 2, 2, -12]], feet: [-2, 0, 2, 0], eyes: 'hurt', open: 0.15, tilt: -5, sx: 1.04, sy: 0.95, front: 1, extra: 'sweat' },
    sleep:  { arm: [[10, 10, 12, 16], [10, 10, 12, 16]], feet: [-4, 0, 4, 0], eyes: 'shut', open: 0, sx: 1.07, sy: 0.86, extra: 'zz' },
    attack: { arm: [[18, -2, 30, -6], [18, -2, 30, -6]], feet: [-5, 0, 5, -3], eyes: 'fierce', open: 1, tilt: 7, lean: 8, front: 1 },
    hit:    { arm: [[16, -8, 24, -18], [16, -8, 24, -18]], feet: [-3, -4, 3, 0], eyes: 'hurt', open: 0.3, tilt: -9, lean: -6, sx: 0.94, sy: 1.04, extra: 'sweat' },
    ko:     { arm: [[14, 14, 22, 18], [14, 14, 22, 18]], feet: [-6, 0, 6, 0], eyes: 'ko', open: 0.2, tilt: 9, sx: 1.1, sy: 0.74, extra: 'stars' }
  };

  function roundBox(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  const star = (c, x, y, s, col) => { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath();
    c.moveTo(0, -9); c.lineTo(2, -2); c.lineTo(9, 0); c.lineTo(2, 2); c.lineTo(0, 9); c.lineTo(-2, 2); c.lineTo(-9, 0); c.lineTo(-2, -2);
    c.closePath(); c.fillStyle = col; c.fill(); c.restore(); };
  const heart = (c, x, y, s, col) => { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 9);
    c.bezierCurveTo(-14, 0, -11, -11, -5, -11); c.bezierCurveTo(-2, -11, 0, -9, 0, -7); c.bezierCurveTo(0, -9, 2, -11, 5, -11);
    c.bezierCurveTo(11, -11, 14, 0, 0, 9); c.fillStyle = col; c.fill(); c.restore(); };
  const flame = (c, x, y, w, h) => { c.beginPath(); c.moveTo(x - w / 2, y);
    c.bezierCurveTo(x - w / 2, y - h * 0.45, x - w * 0.1, y - h * 0.55, x + w * 0.05, y - h);
    c.bezierCurveTo(x + w * 0.15, y - h * 0.6, x + w / 2, y - h * 0.5, x + w / 2, y);
    c.quadraticCurveTo(x, y + w * 0.35, x - w / 2, y); c.closePath(); };

  /* the element's small marks on the sides of the face (every stage) and its body pattern (Mega only) */
  const ELEMENT = {
    Blaze: {
      mark(c, x, y, s, col) { c.fillStyle = col; flame(c, x, y + 5 * s, 7 * s, 13 * s); c.fill(); },
      pattern(c, g, body) {          // flame stripes rising up both sides, clear of the face and the head
        c.fillStyle = rgb(dk(body, 0.24));
        for (const side of [-1, 1]) {
          flame(c, g.cx + side * (g.bw / 2 - 5), g.bot + 4, 24, 62); c.fill();
          flame(c, g.cx + side * (g.bw / 2 - 20), g.bot + 4, 16, 38); c.fill();
        }
      }
    },
    Brawl: {
      mark(c, x, y, s, col) {        // two short war-paint dashes
        c.strokeStyle = col; c.lineWidth = 3.2 * s; c.lineCap = 'round';
        for (const k of [0, 6]) { c.beginPath(); c.moveTo(x - 4 * s, y + (k - 2) * s); c.lineTo(x + 4 * s, y + (k - 5) * s); c.stroke(); }
      },
      pattern(c, g, body) {          // three tapered tiger stripes in from each side
        c.fillStyle = rgb(dk(body, 0.26));
        for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
          const x = g.cx + side * g.bw / 2, y = g.top + g.bh * (0.42 + k * 0.17), len = g.bw * (0.2 - k * 0.03);
          c.beginPath(); c.moveTo(x, y - 6); c.quadraticCurveTo(x - side * len * 0.6, y - 4, x - side * len, y + 1);
          c.quadraticCurveTo(x - side * len * 0.6, y + 3, x, y + 6); c.closePath(); c.fill();
        }
      }
    },
    Frost: {
      mark(c, x, y, s, col) { star(c, x, y + 2 * s, 0.55 * s, col); },
      pattern(c, g, body) {          // pale snow spots scattered over the sides and back
        c.fillStyle = rgba(lt(body, 0.55), 0.85);
        for (const [fx, fy, r] of [[0.08, 0.5, 6], [0.16, 0.74, 4.5], [0.06, 0.86, 3.5], [0.92, 0.48, 5.5], [0.85, 0.7, 4], [0.94, 0.84, 3.5], [0.24, 0.92, 3], [0.76, 0.93, 3.5]]) {
          c.beginPath(); c.arc(g.cx - g.bw / 2 + g.bw * fx, g.top + g.bh * fy, r, 0, 7); c.fill(); }
      }
    }
  };

  function eye(c, x, y, s, type, side, look) {
    c.save(); c.translate(x, y);
    c.strokeStyle = rgb(INK); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 4.2 * s;
    if (type === 'happy') { c.beginPath(); c.moveTo(-8 * s, 2 * s); c.quadraticCurveTo(0, -9 * s, 8 * s, 2 * s); c.stroke(); }
    else if (type === 'shut') { c.beginPath(); c.moveTo(-8 * s, -1 * s); c.quadraticCurveTo(0, 6 * s, 8 * s, -1 * s); c.stroke(); }
    else if (type === 'hurt') { const d = side; c.beginPath(); c.moveTo(-6 * s * d, -6 * s); c.lineTo(6 * s * d, 0); c.lineTo(-6 * s * d, 6 * s); c.stroke(); }
    else if (type === 'ko') { c.beginPath(); c.moveTo(-6 * s, -6 * s); c.lineTo(6 * s, 6 * s); c.moveTo(6 * s, -6 * s); c.lineTo(-6 * s, 6 * s); c.stroke(); }
    else {
      const lx = look[0] * 2.5 * s, ly = look[1] * 2 * s;
      c.fillStyle = rgb(INK); c.beginPath(); c.ellipse(lx, ly, 8.6 * s, 10.2 * s, 0, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(lx + 3 * s, ly - 3.8 * s, 3.4 * s, 0, 7); c.fill();
      c.beginPath(); c.arc(lx - 2.8 * s, ly + 3.8 * s, 1.6 * s, 0, 7); c.fill();
    }
    c.restore();
  }

  /* The signature part. A D-shaped grin with a row of pointed teeth along the top; open widens it to show the tongue,
     and the Mega's two bottom fangs show at every opening. */
  function mouth(c, cx, cy, w, open, st, body) {
    const h = w * 0.13 + open * w * 0.42, L = cx - w / 2, R = cx + w / 2;
    c.save();
    c.beginPath(); c.moveTo(L, cy); c.quadraticCurveTo(cx, cy - w * 0.05, R, cy);
    c.bezierCurveTo(R, cy + h * 1.25, L, cy + h * 1.25, L, cy); c.closePath();
    c.fillStyle = rgb(mix(dk(body, 0.72), INK, 0.4)); c.fill();
    c.clip();
    if (open > 0.25) { c.fillStyle = rgb(TONGUE); c.beginPath(); c.ellipse(cx + w * 0.06, cy + h * 0.98, w * 0.24, h * 0.42, 0, 0, 7); c.fill(); }
    c.fillStyle = '#fff';
    const n = st.teeth, tw = (w * 0.9) / n, th = Math.min(tw * 0.95, 4 + h * 0.55);
    for (let i = 0; i < n; i++) { const x0 = L + w * 0.05 + i * tw;
      c.beginPath(); c.moveTo(x0, cy - 3); c.lineTo(x0 + tw, cy - 3); c.lineTo(x0 + tw / 2, cy - 3 + th + (i % 2 ? 0 : 1.5)); c.closePath(); c.fill(); }
    if (st.fang) for (const fx of [L + w * 0.27, R - w * 0.27]) {
      const by = cy + h * 0.94 + 2; c.beginPath(); c.moveTo(fx - tw * 0.42, by); c.lineTo(fx + tw * 0.42, by); c.lineTo(fx, by - Math.min(tw, 3 + h * 0.5)); c.closePath(); c.fill(); }
    c.restore();
  }

  /* the arm is one stroke with a round end and a hand ball, like Nong Tape's */
  function arm(c, sx, sy, a, side, st, col, hand) {
    const o = side; c.strokeStyle = rgb(col); c.lineWidth = st.arm; c.lineCap = 'round';
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + a[0] * o, sy + a[1], sx + a[2] * o, sy + a[3]); c.stroke();
    c.fillStyle = rgb(hand); c.beginPath(); c.arc(sx + a[2] * o, sy + a[3], st.hand, 0, 7); c.fill();
  }

  function horns(c, g, col) {
    for (const side of [-1, 1]) {
      const bx = g.cx + side * g.bw * 0.27, by = g.top + 8, o = side;
      const shape = () => { c.beginPath(); c.moveTo(bx - 9 * o, by); c.quadraticCurveTo(bx - 9 * o, by - 20, bx + 9 * o, by - 32);
        c.quadraticCurveTo(bx + 4 * o, by - 16, bx + 9 * o, by); c.closePath(); };
      c.save(); c.translate(0, 3); shape(); c.fillStyle = rgb(dk(col, 0.35)); c.fill(); c.restore();
      shape(); c.fillStyle = rgb(col); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(bx - 5 * o, by - 6); c.quadraticCurveTo(bx - 4 * o, by - 18, bx + 3 * o, by - 25); c.stroke();
    }
  }

  function cap(c, g) {
    const w = g.bw * 0.46, y = g.top + 3;
    c.fillStyle = '#b8352e'; c.beginPath(); c.ellipse(g.cx + w * 0.22, y + 1, w * 0.62, 5, 0, 0, 7); c.fill();
    c.fillStyle = '#e2483f'; c.beginPath(); c.moveTo(g.cx - w / 2, y); c.bezierCurveTo(g.cx - w / 2, y - 22, g.cx + w / 2, y - 22, g.cx + w / 2, y); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(g.cx - w * 0.18, y - 11, 5, 3, -0.5, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(g.cx, y - 16, 2.4, 0, 7); c.fill();
  }

  /* m: { stage, pal, marks: ['Horned', 'Stout'], el, worn: { head } }   p: pose name or blended pose object */
  function draw(c, m, p, t = 0, look = [0, 0]) {
    const P = typeof p === 'string' ? POSE[p] || POSE.idle : p, S = STAGE[m.stage] || STAGE.Bit;
    const marks = m.marks || [], stout = marks.includes('Stout') && m.stage !== 'Bit', horned = marks.includes('Horned') && m.stage !== 'Bit';
    const st = { ...S, bw: S.bw + (stout ? 14 : 0) };
    const pal = m.pal, body = pal.body, parts = pal.parts, acc = pal.accent;
    const rim = dk(body, 0.38), handCol = lt(parts, 0.22);
    const walk = P.walk ? Math.sin(t / 130) : 0, chew = P.chew ? (Math.sin(t / 110) + 1) / 2 : 0;
    const bob = P.walk ? -Math.abs(walk) * 4 : Math.sin(t / 600) * 1.2;
    const lift = (P.lift || 0) + bob, open = Math.max(0, Math.min(1, (P.open || 0) + chew * 0.5 - (P.chew ? 0.25 : 0)));
    const sx = (P.sx || 1) * (1 + Math.sin(t / 600) * 0.008), sy = (P.sy || 1) * (1 - Math.sin(t / 600) * 0.008);
    const g = { cx: 100, bw: st.bw, bh: st.bh, bot: 174, top: 174 - st.bh }, left = g.cx - g.bw / 2;
    const fy = 183, fx = g.bw * 0.24;
    // shadow stays on the ground and shrinks as the body lifts
    c.fillStyle = rgba(INK, 0.14 + lift * 0.004);
    c.beginPath(); c.ellipse(100 + (P.lean || 0) * 0.5, 189, g.bw * 0.44 * (1 + lift * 0.008), 6, 0, 0, 7); c.fill();
    c.save();
    c.translate(P.lean || 0, lift);
    c.translate(100, 176); c.rotate((P.tilt || 0) * Math.PI / 180); c.scale(sx, sy); c.translate(-100, -176);
    // feet sit behind the body
    const F = P.feet || [0, 0, 0, 0], footLift = [Math.max(0, walk) * -5, Math.max(0, -walk) * -5];
    for (const [i, side] of [[0, -1], [1, 1]]) {
      const x = g.cx + side * fx + F[i * 2], y = fy + F[i * 2 + 1] + footLift[i] - lift * 0.5;
      c.fillStyle = rgb(dk(parts, 0.25)); c.beginPath(); c.ellipse(x, y + 1.5, st.foot[0], st.foot[1], 0, 0, 7); c.fill();
      c.fillStyle = rgb(parts); c.beginPath(); c.ellipse(x, y, st.foot[0], st.foot[1], 0, 0, 7); c.fill();
      if (st.toes) for (let k = 0; k < st.toes; k++) { c.fillStyle = rgb(acc); c.beginPath(); c.arc(x - 7 + k * 7, y + st.foot[1] - 2.5, 2.6, 0, 7); c.fill(); }
    }
    if (horned) horns(c, g, lt(parts, 0.5));
    const shoulderY = g.top + g.bh * 0.56;
    const armBehind = st.arm && !P.front, arms = () => {
      arm(c, left + 4, shoulderY, P.arm[0], -1, st, parts, handCol);
      arm(c, left + g.bw - 4, shoulderY, P.arm[1], 1, st, parts, handCol);
    };
    if (armBehind) arms();
    // depth: a darker copy of the body under it
    roundBox(c, left, g.top + 4, g.bw, g.bh, st.r); c.fillStyle = rgb(rim); c.fill();
    const grad = c.createLinearGradient(left, g.top, left + g.bw, g.bot);
    grad.addColorStop(0, rgb(lt(body, 0.14))); grad.addColorStop(0.55, rgb(body)); grad.addColorStop(1, rgb(dk(body, 0.1)));
    roundBox(c, left, g.top, g.bw, g.bh, st.r); c.fillStyle = grad; c.fill();
    c.save(); roundBox(c, left, g.top, g.bw, g.bh, st.r); c.clip();
    const E = ELEMENT[m.el];
    if (m.stage === 'Mega' && E) E.pattern(c, g, body);
    const my = g.top + g.bh * 0.62, mw = g.bw * st.mw;
    if (stout) { c.fillStyle = rgb(lt(body, 0.6)); c.beginPath(); c.ellipse(g.cx, my + g.bh * 0.17, g.bw * 0.36, g.bh * 0.28, 0, 0, 7); c.fill(); }
    c.restore();
    // one white highlight arc on the upper left
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = m.stage === 'Bit' ? 4.5 : 5.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(left + 9, g.top + st.r * 1.05); c.quadraticCurveTo(left + 10, g.top + 9, left + st.r * 1.25, g.top + 7); c.stroke();
    // face
    const ey = g.top + g.bh * 0.34, ex = g.bw * 0.19, s = st.eye;
    if (E) for (const side of [-1, 1]) E.mark(c, g.cx + side * (g.bw / 2 - 11), ey - 6, s * (m.stage === 'Bit' ? 0.8 : 1), rgba(acc, 0.9));
    c.fillStyle = rgba(BLUSH, 0.7);
    for (const side of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + side * g.bw * 0.31, ey + 13 * s, 7.5 * s, 4.5 * s, 0, 0, 7); c.fill(); }
    const eyes = P.eyes === 'open' && m.stage === 'Mega' ? 'fierce' : P.eyes;
    eye(c, g.cx - ex, ey, s, eyes, -1, look); eye(c, g.cx + ex, ey, s, eyes, 1, look);
    if (eyes === 'fierce') {        // a slanted top lid in body colour makes the Mega look ready to fight
      c.fillStyle = rgb(mix(lt(body, 0.05), body, 0.5));
      for (const side of [-1, 1]) { const x = g.cx + side * ex;
        c.save(); c.beginPath(); c.ellipse(x + look[0] * 2.5 * s, ey + look[1] * 2 * s, 9.2 * s, 10.8 * s, 0, 0, 7); c.clip();
        c.beginPath(); c.moveTo(x - 12 * s * side, ey - 14 * s); c.lineTo(x + 12 * s * side, ey - 14 * s); c.lineTo(x + 12 * s * side, ey - 10 * s); c.lineTo(x - 12 * s * side, ey - 4 * s); c.closePath(); c.fill(); c.restore(); }
    }
    mouth(c, g.cx, my, mw, open, st, body);
    if (m.worn && m.worn.head === 'Cap') cap(c, g);
    if (!armBehind && st.arm) arms();
    c.restore();
    // extras float above and do not tilt with the body
    const top = g.top + lift;
    if (P.extra === 'zz') { c.strokeStyle = rgb(lt(INK, 0.4)); c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [x, y, z] of [[g.cx + g.bw / 2 + 2, top + 4, 9], [g.cx + g.bw / 2 + 16, top - 12, 6]]) {
        const yy = y - (t / 60 % 10); c.beginPath(); c.moveTo(x, yy); c.lineTo(x + z, yy); c.lineTo(x, yy + z); c.lineTo(x + z, yy + z); c.stroke(); } }
    if (P.extra === 'sweat') { c.fillStyle = '#9CD4F5'; const x = g.cx + g.bw / 2 - 4, y = top + 6;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 8, y + 12, x, y + 15); c.quadraticCurveTo(x - 8, y + 12, x, y); c.fill(); }
    if (P.extra === 'heart') heart(c, g.cx + g.bw / 2 + 6, top - 4 + Math.sin(t / 200) * 2, 0.7, rgb(BLUSH));
    if (P.extra === 'stars') for (let k = 0; k < 3; k++) { const a = t / 400 + k * 2.1;
      star(c, g.cx + Math.cos(a) * g.bw * 0.4, top + 4 + Math.sin(a) * 6, 0.55, k % 2 ? '#ffd23f' : rgb(lt(acc, 0.3))); }
    if (P.extra === 'crumbs') { c.fillStyle = rgb(lt(parts, 0.4)); for (let k = 0; k < 4; k++) { const ph = (t / 400 + k / 4) % 1;
      c.beginPath(); c.arc(g.cx - 12 + k * 8, my + lift + ph * 22, 2, 0, 7); c.fill(); } }
  }

  /* blend two poses for the spring between them (numbers only; the face swaps halfway) */
  function blend(a, b, k) {
    const A = POSE[a] || POSE.idle, B = POSE[b] || POSE.idle, n = (x, y) => lerp(x || 0, y || 0, k), o = (x, y) => lerp(x ?? 1, y ?? 1, k);
    return { ...(k < 0.5 ? A : B), arm: A.arm.map((s, i) => s.map((v, j) => lerp(v, B.arm[i][j], k))), feet: A.feet.map((v, i) => lerp(v, B.feet[i], k)),
      open: n(A.open, B.open), lift: n(A.lift, B.lift), tilt: n(A.tilt, B.tilt), lean: n(A.lean, B.lean), sx: o(A.sx, B.sx), sy: o(A.sy, B.sy) };
  }

  /* the visible height of each stage in units, so screens can size it */
  const height = (stage, marks = []) => (STAGE[stage] || STAGE.Bit).bh + 18 + (marks.includes('Horned') && stage !== 'Bit' ? 28 : 0);
  return { draw, blend, height, POSES: Object.keys(POSE), STAGE };
})();
