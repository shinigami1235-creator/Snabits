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
  function arm(c, sx, sy, a, side, st, col, hand, mat, t) {
    const o = side, q = [sx, sy, sx + a[0] * o, sy + a[1], sx + a[2] * o, sy + a[3]];
    limb(c, q, st.arm, col, mat, t);
    blob(c, q[4], q[5], st.hand, st.hand, hand, mat, t, 'hand');
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
  function drawChomp(c, m, p, t = 0, look = [0, 0]) {
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
      const fm = (m.limbs || {})[i ? 'legR' : 'legL'];
      blob(c, x, y, st.foot[0], st.foot[1], parts, fm, t, 'foot');
      if (st.toes && !fm) for (let k = 0; k < st.toes; k++) { c.fillStyle = rgb(acc); c.beginPath(); c.arc(x - 7 + k * 7, y + st.foot[1] - 2.5, 2.6, 0, 7); c.fill(); }
    }
    if (horned) horns(c, g, lt(parts, 0.5));
    const shoulderY = g.top + g.bh * 0.56;
    const armBehind = st.arm && !P.front, arms = () => {
      arm(c, left + 4, shoulderY, P.arm[0], -1, st, parts, handCol, (m.limbs || {}).armL, t);
      arm(c, left + g.bw - 4, shoulderY, P.arm[1], 1, st, parts, handCol, (m.limbs || {}).armR, t);
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

  /* ---------- swappable limbs: any arm, hand, leg, foot or tentacle can be flesh, robot, slime, vine, light or shadow ---------- */
  const METAL = [150, 158, 172], METAL_D = [84, 92, 106], VINE = [70, 142, 60], LEAF = [112, 196, 92], LIGHT = [255, 240, 176], SHADOW = [34, 22, 56];
  const qpt = (q, u) => { const a = 1 - u; return [a * a * q[0] + 2 * a * u * q[2] + u * u * q[4], a * a * q[1] + 2 * a * u * q[3] + u * u * q[5]]; };
  const qnorm = (q, u) => { const dx = 2 * (1 - u) * (q[2] - q[0]) + 2 * u * (q[4] - q[2]), dy = 2 * (1 - u) * (q[3] - q[1]) + 2 * u * (q[5] - q[3]), l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  const strokeQ = (c, q) => { c.beginPath(); c.moveTo(q[0], q[1]); c.quadraticCurveTo(q[2], q[3], q[4], q[5]); c.stroke(); };
  const leaf = (c, x, y, a, sz) => { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = rgb(LEAF); c.beginPath(); c.ellipse(sz * 0.6, 0, sz * 0.75, sz * 0.36, 0, 0, 7); c.fill();
    c.strokeStyle = rgb(VINE); c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(sz * 1.2, 0); c.stroke(); c.restore(); };
  function vineWrap(c, q, w, t) {
    c.strokeStyle = rgb(VINE); c.lineWidth = Math.max(2.4, w * 0.3); c.beginPath();
    for (let i = 0; i <= 16; i++) { const u = i / 16, p = qpt(q, u), n = qnorm(q, u), o = Math.sin(i * 1.25) * w * 0.62;
      i ? c.lineTo(p[0] + n[0] * o, p[1] + n[1] * o) : c.moveTo(p[0] + n[0] * o, p[1] + n[1] * o); }
    c.stroke();
    for (const u of [0.3, 0.75]) { const p = qpt(q, u), n = qnorm(q, u); leaf(c, p[0] + n[0] * w * 0.6, p[1] + n[1] * w * 0.6, Math.atan2(n[1], n[0]) - 0.4, w * 0.9); }
  }
  function limb(c, q, w, col, mat, t) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (mat === 'robot') {
      c.strokeStyle = rgb(METAL_D); c.lineWidth = w + 2.5; strokeQ(c, q);
      c.strokeStyle = rgb(METAL); c.lineWidth = w - 1.5; strokeQ(c, q);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = w * 0.22; strokeQ(c, q.map((v, i) => v - (i % 2 ? 1.5 : 1)));
      const j = qpt(q, 0.5); c.fillStyle = rgb(METAL_D); c.beginPath(); c.arc(j[0], j[1], w * 0.62, 0, 7); c.fill();
      c.fillStyle = rgb(lt(METAL, 0.45)); c.beginPath(); c.arc(j[0] - 0.8, j[1] - 0.8, w * 0.24, 0, 7); c.fill();
      return;
    }
    if (mat === 'slime') {
      c.strokeStyle = rgba(lt(col, 0.35), 0.8); c.lineWidth = w + 4; strokeQ(c, q);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = w * 0.25; strokeQ(c, q.map((v, i) => v - (i % 2 ? 2 : 1.5)));
      const d = qpt(q, 0.55), ph = (t / 900) % 1; c.fillStyle = rgba(lt(col, 0.35), 0.8 * (1 - ph));
      c.beginPath(); c.arc(d[0], d[1] + w * 0.5 + ph * 14, w * 0.28, 0, 7); c.fill();
      return;
    }
    if (mat === 'light') {
      c.save(); c.shadowColor = 'rgba(255,226,120,.95)'; c.shadowBlur = 16; c.strokeStyle = rgb(LIGHT); c.lineWidth = w + 1; strokeQ(c, q); c.restore();
      c.strokeStyle = '#fff'; c.lineWidth = w * 0.4; strokeQ(c, q); return;
    }
    if (mat === 'shadow') {
      c.strokeStyle = rgba(SHADOW, 0.92); c.lineWidth = w; strokeQ(c, q);
      c.strokeStyle = rgba(SHADOW, 0.42); c.lineWidth = w * 0.42;
      for (let k = 1; k <= 3; k++) { const p0 = qpt(q, k / 4), wv = Math.sin(t / 280 + k * 2) * 3;
        c.beginPath(); c.moveTo(p0[0], p0[1]); c.quadraticCurveTo(p0[0] - 7 + wv, p0[1] + 4, p0[0] - 5 + wv, p0[1] + 14); c.stroke(); }
      return;
    }
    c.strokeStyle = rgb(col); c.lineWidth = w; strokeQ(c, q);
    if (mat === 'vine') vineWrap(c, q, w, t);
  }
  /* hands and feet: kind is 'hand' or 'foot' */
  function blob(c, x, y, rx, ry, col, mat, t, kind) {
    const foot = kind === 'foot';
    if (mat === 'robot') {
      if (foot) { roundBox(c, x - rx, y - ry, rx * 2, ry * 2 + 1.5, ry * 0.8); c.fillStyle = rgb(METAL_D); c.fill();
        roundBox(c, x - rx, y - ry - 1.5, rx * 2, ry * 2, ry * 0.8); c.fillStyle = rgb(METAL); c.fill();
        c.fillStyle = rgb(METAL_D); for (const k of [-0.5, 0.5]) { c.beginPath(); c.arc(x + k * rx, y - 1, 1.6, 0, 7); c.fill(); } }
      else { c.fillStyle = rgb(METAL_D); for (const a of [-0.5, 0.5]) { c.save(); c.translate(x, y); c.rotate(a); roundBox(c, -2.2, 0, 4.4, rx * 1.5, 2); c.fill(); c.restore(); }
        c.beginPath(); c.arc(x, y, rx * 0.85, 0, 7); c.fill(); c.fillStyle = rgb(METAL); c.beginPath(); c.arc(x - 0.6, y - 0.6, rx * 0.62, 0, 7); c.fill(); }
      return;
    }
    if (mat === 'slime') {
      c.fillStyle = rgba(lt(col, 0.35), 0.82); c.beginPath(); c.ellipse(x, y + (foot ? 1 : 0), rx * 1.15, ry * (foot ? 1 : 1.1), 0, 0, 7); c.fill();
      if (foot) { c.beginPath(); c.ellipse(x, y + ry * 0.8, rx * 1.5, ry * 0.45, 0, 0, 7); c.fill(); }
      else { const ph = (t / 800) % 1; c.beginPath(); c.arc(x, y + ry + ph * 12, rx * 0.32 * (1 - ph * 0.5), 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(x - rx * 0.35, y - ry * 0.35, rx * 0.28, ry * 0.18, -0.5, 0, 7); c.fill();
      return;
    }
    if (mat === 'light') {
      c.save(); c.shadowColor = 'rgba(255,226,120,.95)'; c.shadowBlur = 16; c.fillStyle = rgb(LIGHT); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, y, rx * 0.5, ry * 0.5, 0, 0, 7); c.fill();
      star(c, x + rx * 0.9, y - ry - 2 + Math.sin(t / 250) * 2, 0.32, '#fff6c8'); return;
    }
    if (mat === 'shadow') {
      c.fillStyle = rgba(SHADOW, 0.92); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill();
      c.strokeStyle = rgba(SHADOW, 0.4); c.lineWidth = 3; c.lineCap = 'round';
      for (const k of [-0.6, 0, 0.6]) { const wv = Math.sin(t / 260 + k * 3) * 2.5; c.beginPath(); c.moveTo(x + k * rx, y - ry * 0.4); c.quadraticCurveTo(x + k * rx + wv, y - ry - 5, x + k * rx * 1.3 - wv, y - ry - 12); c.stroke(); }
      return;
    }
    if (foot) { c.fillStyle = rgb(dk(col, 0.25)); c.beginPath(); c.ellipse(x, y + 1.5, rx, ry, 0, 0, 7); c.fill(); }
    c.fillStyle = rgb(col); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill();
    if (mat === 'vine') { c.strokeStyle = rgb(VINE); c.lineWidth = 2.4; c.beginPath(); c.ellipse(x, y, rx * 1.05, ry * 0.55, -0.3, 0, 7); c.stroke(); leaf(c, x + rx * 0.7, y - ry * 0.5, -0.9, rx * 0.8); }
  }

  /* ---------- the other seven families: one body path each, plus what hangs off it ---------- */
  function lid(c, x, ey, s, side, look, col) {
    c.save(); c.beginPath(); c.ellipse(x + look[0] * 2.5 * s, ey + look[1] * 2 * s, 9.2 * s, 10.8 * s, 0, 0, 7); c.clip();
    c.fillStyle = col; c.beginPath(); c.moveTo(x - 12 * s * side, ey - 14 * s); c.lineTo(x + 12 * s * side, ey - 14 * s);
    c.lineTo(x + 12 * s * side, ey - 10 * s); c.lineTo(x - 12 * s * side, ey - 4 * s); c.closePath(); c.fill(); c.restore();
  }
  function smallMouth(c, cx, my, s, open, fang) {
    c.strokeStyle = rgb(INK); c.fillStyle = rgb(INK); c.lineCap = 'round'; c.lineWidth = 3.6 * s;
    if (open < 0.2) { c.beginPath(); c.moveTo(cx - 7 * s, my); c.quadraticCurveTo(cx, my + 7 * s, cx + 7 * s, my); c.stroke();
      if (fang) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(cx + 1.5 * s, my + 2.6 * s); c.lineTo(cx + 6 * s, my + 1.2 * s); c.lineTo(cx + 4.4 * s, my + 6.5 * s); c.closePath(); c.fill(); }
      return; }
    const h = (6 + open * 10) * s; c.save(); c.beginPath(); c.moveTo(cx - 9 * s, my - 1); c.quadraticCurveTo(cx, my - 3 * s, cx + 9 * s, my - 1);
    c.quadraticCurveTo(cx, my + h * 1.6, cx - 9 * s, my - 1); c.closePath(); c.fill(); c.clip();
    c.fillStyle = rgb(TONGUE); c.beginPath(); c.ellipse(cx, my + h, 6 * s, 4.5 * s, 0, 0, 7); c.fill();
    if (fang) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(cx + 2 * s, my - 1); c.lineTo(cx + 7 * s, my - 1); c.lineTo(cx + 4.5 * s, my + 4 * s); c.closePath(); c.fill(); }
    c.restore();
  }
  /* two eyes, blush and a small mouth; o: ey, ex, my, s as fractions of the body */
  function faceTwo(c, g, x, look, o) {
    const s = o.s, ey = g.top + g.bh * o.ey, ex = g.bw * o.ex, my = g.top + g.bh * o.my;
    c.fillStyle = rgba(BLUSH, 0.7);
    for (const side of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + side * (ex + 9 * s), ey + 12 * s, 7 * s, 4.2 * s, 0, 0, 7); c.fill(); }
    const eyes = x.P.eyes === 'open' && x.stage === 'Mega' ? 'fierce' : x.P.eyes;
    eye(c, g.cx - ex, ey, s, eyes, -1, look); eye(c, g.cx + ex, ey, s, eyes, 1, look);
    if (eyes === 'fierce') for (const side of [-1, 1]) lid(c, g.cx + side * ex, ey, s, side, look, rgb(o.lidCol || x.body));
    if (o.extraEyes) for (const side of [-1, 1]) eye(c, g.cx + side * g.bw * o.extraEyes, ey - 7 * s, s * 0.45, eyes === 'fierce' ? 'open' : eyes, side, look);
    smallMouth(c, g.cx, my, s, x.open, x.stage === 'Mega' || o.fang);
    if (o.chelicerae) { c.fillStyle = rgb(lt(x.parts, 0.6)); for (const side of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + side * 3 * s, my + 5 * s); c.lineTo(g.cx + side * 8 * s, my + 5 * s); c.lineTo(g.cx + side * 5 * s, my + 11 * s); c.closePath(); c.fill(); } }
    return my;
  }
  /* a crab claw at the end of an arm, opening outward; side flips it for the left arm */
  function claw(c, x, y, ang, sz, col, side, serrate) {
    c.save(); c.translate(x, y); c.scale(side, 1); c.rotate(ang);
    const jaw = (up) => { const k = up ? -1 : 1; c.beginPath(); c.moveTo(-sz * 0.1, 0);
      c.bezierCurveTo(sz * 0.1, k * sz * (up ? 0.95 : 0.7), sz * 0.9, k * sz * (up ? 0.8 : 0.55), sz * 1.15, k * sz * (up ? 0.22 : 0.1));
      c.quadraticCurveTo(sz * 0.6, k * sz * 0.2, sz * 0.15, k * sz * 0.08); c.closePath(); };
    for (const up of [false, true]) { c.save(); c.translate(0, 2.5); jaw(up); c.fillStyle = rgb(dk(col, 0.32)); c.fill(); c.restore(); jaw(up); c.fillStyle = rgb(lt(col, 0.12)); c.fill(); }
    if (serrate) { c.fillStyle = '#fff'; for (const f of [0.45, 0.7]) { c.beginPath(); c.moveTo(sz * f, -sz * 0.2); c.lineTo(sz * (f + 0.12), -sz * 0.2); c.lineTo(sz * (f + 0.06), -sz * 0.05); c.closePath(); c.fill(); } }
    c.fillStyle = rgb(col); c.beginPath(); c.arc(0, 0, sz * 0.42, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(sz * 0.35, -sz * 0.5, sz * 0.18, sz * 0.08, -0.4, 0, 7); c.fill();
    c.restore();
  }
  const by = (stage, a, b, cc) => stage === 'Bit' ? a : stage === 'Byte' ? b : cc;
  const legPair = (c, x, sideList, fn) => sideList.forEach(fn);

  const FAM = {
    /* round dome with a scalloped hem, standing on tentacles */
    Squib: {
      dims: { Bit: [76, 56], Byte: [98, 70], Mega: [118, 84] }, tl: st => by(st, 18, 26, 34),
      bottom(st) { return 184 - this.tl(st); }, height(st) { return this.dims[st][1] + this.tl(st) + 6; },
      path(c, g) { const R = g.left + g.bw, n = by(g.stage, 3, 4, 5), w = g.bw / n;
        c.beginPath(); c.moveTo(g.left, g.bot); c.bezierCurveTo(g.left, g.bot - g.bh * 1.33, R, g.bot - g.bh * 1.33, R, g.bot);
        for (let i = 0; i < n; i++) c.quadraticCurveTo(R - (i + 0.5) * w, g.bot + 9, R - (i + 1) * w, g.bot); c.closePath(); },
      behind(c, g, x) { const n = by(g.stage, 3, 4, 5), w = g.bw / n, tl = this.tl(g.stage), lw = by(g.stage, 9, 10, 11);
        for (let i = 0; i < n; i++) { const tx = g.left + (i + 0.5) * w, sw = Math.sin(x.t / 260 + i * 1.3) * 4 + x.walk * 3, curl = (i < n / 2 ? -1 : 1) * 7;
          const mat = i < n / 2 ? x.L.legL : x.L.legR;
          limb(c, [tx, g.bot - 4, tx + sw, g.bot + tl * 0.55, tx + curl + sw * 0.5, 182], lw, x.parts, mat, x.t);
          blob(c, tx + curl + sw * 0.5, 182, lw * 0.55, lw * 0.55, x.parts, mat, x.t, 'hand'); } },
      inside(c, g, x) { if (g.stage === 'Mega') { c.fillStyle = rgb(lt(x.body, 0.38)); c.fillRect(g.left, g.bot - 12, g.bw, 20); } },
      hl: g => [g.left + g.bw * 0.12, g.bot - g.bh * 0.3, g.left + g.bw * 0.14, g.top + g.bh * 0.22, g.cx - g.bw * 0.14, g.top + g.bh * 0.08],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.48, ex: 0.17, my: 0.72, s: by(g.stage, 0.8, 0.94, 1) })
    },
    /* an old television: a rounded box with the face on its screen, rabbit-ear antennae and two thin legs */
    Antik: {
      dims: { Bit: [72, 66], Byte: [92, 84], Mega: [108, 98] }, ll: st => by(st, 10, 14, 18), al: st => by(st, 18, 24, 30),
      bottom(st) { return 180 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + this.al(st) + 14; },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, by(g.stage, 22, 24, 26)); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.6, armK: 0.8,
      behind(c, g, x) {
        const al = this.al(g.stage), ants = g.stage === 'Mega' ? [-0.42, 0.42] : [0.28];
        c.strokeStyle = rgb(dk(x.parts, 0.15)); c.lineWidth = 4; c.lineCap = 'round';
        for (const a of ants) { const bx = g.cx + a * 12, tx = g.cx + Math.sin(a) * al * 1.2 + Math.sin(x.t / 500) * 1.5, ty = g.top - al;
          c.beginPath(); c.moveTo(bx, g.top + 6); c.lineTo(tx, ty); c.stroke(); c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(tx, ty, by(g.stage, 4.5, 5.5, 6), 0, 7); c.fill(); }
        const ll = this.ll(g.stage), lw = by(g.stage, 7, 8, 9);
        [[-1, x.L.legL, 0], [1, x.L.legR, 1]].forEach(([side, mat, i]) => { const hx = g.cx + side * g.bw * 0.22, lift = [Math.max(0, x.walk), Math.max(0, -x.walk)][i] * 5;
          limb(c, [hx, g.bot - 6, hx, g.bot + ll * 0.5, hx + x.P.feet[i * 2], 181 - lift], lw, x.parts, mat, x.t);
          blob(c, hx + x.P.feet[i * 2], 182 - lift, by(g.stage, 9, 11, 12), by(g.stage, 5.5, 6.5, 7), x.parts, mat, x.t, 'foot'); });
      },
      inside(c, g, x) { if (g.stage === 'Bit') return;
        roundBox(c, g.left + g.bw * 0.12, g.top + g.bh * 0.12, g.bw * 0.76, g.bh * 0.58, 14); c.fillStyle = rgb(lt(x.body, 0.66)); c.fill();
        c.strokeStyle = rgb(dk(x.body, 0.22)); c.lineWidth = 3; c.stroke();
        if (g.stage === 'Mega') { c.fillStyle = rgb(x.acc); for (const k of [0, 1]) { c.beginPath(); c.arc(g.left + g.bw * (0.7 + k * 0.13), g.top + g.bh * 0.84, 4.5, 0, 7); c.fill(); }
          c.strokeStyle = rgb(dk(x.body, 0.25)); c.lineWidth = 2.5; for (let k = 0; k < 3; k++) { const yy = g.top + g.bh * (0.78 + k * 0.06); c.beginPath(); c.moveTo(g.left + g.bw * 0.16, yy); c.lineTo(g.left + g.bw * 0.42, yy); c.stroke(); } } },
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Bit' ? { ey: 0.42, ex: 0.18, my: 0.64, s: 0.8 } : { ey: 0.35, ex: 0.16, my: 0.55, s: by(g.stage, 0.8, 0.88, 0.92), lidCol: lt(x.body, 0.66) })
    },
    /* a soft oval with one big eye, on three stubby roots */
    Moko: {
      dims: { Bit: [70, 72], Byte: [90, 94], Mega: [104, 112] },
      bottom() { return 174; }, height(st) { return this.dims[st][1] + 14; },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      arms: 'stub', armW: st => by(st, 0, 7, 8), handR: st => by(st, 0, 5.5, 6.5), shoulderY: 0.58, armK: 0.9, shoulderIn: 0.06,
      behind(c, g, x) { const lw = by(g.stage, 10, 12, 13);
        [-0.24, 0, 0.24].forEach((k, i) => { const fx = g.cx + k * g.bw, sw = (i - 1) * 3 + Math.sin(x.t / 300 + i) * 1.5 + x.walk * (i - 1) * 3, mat = k < 0 ? x.L.legL : k > 0 ? x.L.legR : null;
          limb(c, [fx, g.bot - 10, fx + sw, 178, fx + sw * 1.4, 182], lw, x.parts, mat, x.t);
          blob(c, fx + sw * 1.4, 182, lw * 0.6, lw * 0.5, x.parts, mat, x.t, 'foot'); }); },
      face(c, g, x, look) {
        const s = by(g.stage, 1.45, 1.75, 2.0), ey = g.top + g.bh * 0.42, my = g.top + g.bh * 0.72, e = x.P.eyes;
        c.fillStyle = rgba(BLUSH, 0.7); for (const side of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + side * g.bw * 0.3, ey + 15 * s * 0.55, 7.5, 4.5, 0, 0, 7); c.fill(); }
        if (e === 'open' && g.stage === 'Mega') {          // the Mega's eye gets a coloured iris and a slanted lid
          const lx = look[0] * 4, ly = look[1] * 3;
          c.fillStyle = '#fff'; c.beginPath(); c.ellipse(g.cx, ey, 10.5 * s, 11.5 * s, 0, 0, 7); c.fill(); c.strokeStyle = rgb(INK); c.lineWidth = 3; c.stroke();
          c.fillStyle = rgb(mix(x.acc, x.body, 0.35)); c.beginPath(); c.arc(g.cx + lx, ey + ly, 7.2 * s, 0, 7); c.fill();
          c.fillStyle = rgb(INK); c.beginPath(); c.arc(g.cx + lx, ey + ly, 4 * s, 0, 7); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(g.cx + lx + 2.6 * s, ey + ly - 2.8 * s, 2.2 * s, 0, 7); c.fill(); c.beginPath(); c.arc(g.cx + lx - 2.4 * s, ey + ly + 2.6 * s, 1 * s, 0, 7); c.fill();
          c.save(); c.beginPath(); c.ellipse(g.cx, ey, 10.5 * s, 11.5 * s, 0, 0, 7); c.clip(); c.fillStyle = rgb(x.body); c.fillRect(g.cx - 12 * s, ey - 13 * s, 24 * s, 5 * s); c.restore();
        } else eye(c, g.cx, ey, s, e === 'hurt' ? 'shut' : e, 1, look);
        smallMouth(c, g.cx, my, by(g.stage, 0.85, 0.95, 1), x.open, g.stage === 'Mega');
        return my;
      }
    },
    /* a square body with crab claws on the arms and short pointed legs */
    Pinch: {
      dims: { Bit: [70, 60], Byte: [90, 78], Mega: [106, 92] },
      bottom() { return 174; }, height(st) { return this.dims[st][1] + 16 + by(st, 0, 14, 22); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, by(g.stage, 18, 21, 23)); },
      arms: 'claw', armW: st => by(st, 0, 8, 10), clawSz: st => by(st, 11, 16, 22), shoulderY: 0.55, armK: 0.75,
      behind(c, g, x) { const n = by(g.stage, 2, 2, 3), lw = by(g.stage, 6, 7, 8);
        for (const [side, mat] of [[-1, x.L.legL], [1, x.L.legR]]) for (let k = 0; k < n; k++) {
          const hx = g.cx + side * g.bw * (0.12 + k * 0.14), fx = g.cx + side * g.bw * (0.18 + k * 0.2), lift = Math.max(0, Math.sin(x.t / 110 + k * 2 + side)) * 4 * Math.abs(x.walk);
          limb(c, [hx, g.bot - 6, fx + side * 6, g.bot + 2, fx, 184 - lift], lw, x.parts, mat, x.t); } },
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.38, ex: 0.18, my: 0.64, s: by(g.stage, 0.8, 0.94, 1) })
    },
    /* a narrow capsule up on long jointed legs with bird feet at Mega */
    Stilt: {
      dims: { Bit: [50, 52], Byte: [60, 66], Mega: [68, 78] }, ll: st => by(st, 26, 40, 54),
      bottom(st) { return 180 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 8; },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw / 2); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.58, armK: 0.7,
      behind(c, g, x) { const ll = this.ll(g.stage), lw = by(g.stage, 6, 7, 8);
        [[-1, x.L.legL, 0], [1, x.L.legR, 1]].forEach(([side, mat, i]) => {
          const lift = [Math.max(0, x.walk), Math.max(0, -x.walk)][i] * 8, hx = g.cx + side * g.bw * 0.2, kx = g.cx + side * g.bw * 0.42, ky = g.bot + ll * 0.48 - lift * 0.5, fx = g.cx + side * g.bw * 0.26 + x.P.feet[i * 2], fy = 181 - lift;
          limb(c, [hx, g.bot - 6, (hx + kx) / 2 + side * 2, (g.bot + ky) / 2, kx, ky], lw, x.parts, mat, x.t);
          limb(c, [kx, ky, (kx + fx) / 2 + side * 2, (ky + fy) / 2, fx, fy], lw, x.parts, mat, x.t);
          if (g.stage === 'Mega' && !mat) { c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(kx, ky, lw * 0.75, 0, 7); c.fill();
            c.strokeStyle = rgb(x.parts); c.lineWidth = 4; c.lineCap = 'round'; for (const a of [-0.9, 0, 0.9]) { c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + Math.sin(a) * 10, fy + 4 - Math.abs(a) * 2); c.stroke(); } }
          else blob(c, fx, fy + 1, by(g.stage, 8, 9, 10), 5, x.parts, mat, x.t, 'foot'); }); },
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.36, ex: 0.2, my: 0.6, s: by(g.stage, 0.74, 0.8, 0.86) })
    },
    /* a flat body slung between spider legs, four eyes at Mega and no arms */
    Skit: {
      dims: { Bit: [80, 40], Byte: [104, 50], Mega: [126, 58] },
      bottom(st) { return by(st, 168, 166, 164); }, height(st) { return 184 - (this.bottom(st) - this.dims[st][1]) + 6; },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bh * 0.5); },
      behind(c, g, x) { const n = by(g.stage, 2, 3, 4), lw = by(g.stage, 5, 5, 5.5);
        for (const [side, mat] of [[-1, x.L.legL], [1, x.L.legR]]) for (let k = n - 1; k >= 0; k--) {
          const f = n === 1 ? 0.5 : k / (n - 1), hx = g.cx + side * g.bw * (0.2 + f * 0.22), hy = g.bot - g.bh * 0.45;
          const kx = g.cx + side * (g.bw * 0.46 + 4 + f * 26), ky = g.top + g.bh * 0.35 - f * 22;
          const lift = Math.max(0, Math.sin(x.t / 100 + k * 1.7 + side)) * 5 * Math.abs(x.walk), fx = g.cx + side * (g.bw * 0.34 + f * (g.bw * 0.3 + 30)), fy = 184 - lift;
          limb(c, [hx, hy, (hx + kx) / 2, ky - 8, kx, ky], lw, x.parts, mat, x.t);
          limb(c, [kx, ky, kx + side * 8, (ky + fy) / 2, fx, fy], lw, x.parts, mat, x.t);
          c.fillStyle = rgb(dk(x.parts, 0.2)); c.beginPath(); c.arc(fx, fy, lw * 0.5, 0, 7); c.fill(); } },
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.13, my: 0.72, s: by(g.stage, 0.72, 0.8, 0.86), extraEyes: g.stage === 'Mega' ? 0.27 : 0, chelicerae: g.stage === 'Mega' })
    },
    /* a tall cone that floats, ending in a curling ghost tail */
    Booly: {
      dims: { Bit: [60, 70], Byte: [76, 90], Mega: [90, 108] }, float: true,
      bottom() { return 166; }, height(st) { return this.dims[st][1] + 26; },
      path(c, g, x) { const R = g.left + g.bw, tl = g.bw * by(g.stage, 0.28, 0.36, 0.44), sw = Math.sin((x ? x.t : 0) / 320) * 4;
        c.beginPath(); c.moveTo(g.cx, g.top);
        c.bezierCurveTo(g.cx + g.bw * 0.36, g.top, R, g.top + g.bh * 0.4, R, g.bot - g.bh * 0.14);
        c.quadraticCurveTo(R + tl * 0.15, g.bot + g.bh * 0.06, R + tl, g.bot - g.bh * 0.1 + sw);
        c.quadraticCurveTo(R + tl * 0.35, g.bot + g.bh * 0.2, g.cx + g.bw * 0.1, g.bot + g.bh * 0.04);
        c.quadraticCurveTo(g.cx - g.bw * 0.22, g.bot + g.bh * 0.1, g.left + g.bw * 0.08, g.bot - g.bh * 0.02);
        c.quadraticCurveTo(g.left, g.bot - g.bh * 0.08, g.left, g.bot - g.bh * 0.2);
        c.bezierCurveTo(g.left, g.top + g.bh * 0.4, g.cx - g.bw * 0.36, g.top, g.cx, g.top); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 7, 8), handR: st => by(st, 0, 5, 6), shoulderY: 0.62, armK: 0.7, shoulderIn: 0.04,
      glow: st => st === 'Mega',
      hl: g => [g.cx - g.bw * 0.34, g.top + g.bh * 0.5, g.cx - g.bw * 0.32, g.top + g.bh * 0.16, g.cx - g.bw * 0.06, g.top + g.bh * 0.05],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.47, ex: 0.17, my: 0.66, s: by(g.stage, 0.76, 0.86, 0.94) })
    }
  };

  function drawFamily(c, m, p, t, look, F) {
    const P = typeof p === 'string' ? POSE[p] || POSE.idle : p, stage = F.dims[m.stage] ? m.stage : 'Bit';
    const [bw, bh] = F.dims[stage], pal = m.pal, body = pal.body, parts = pal.parts, acc = pal.accent, L = m.limbs || {};
    const walk = P.walk ? Math.sin(t / 130) : 0, chew = P.chew ? (Math.sin(t / 110) + 1) / 2 : 0;
    const fl = F.float ? Math.sin(t / 420) * 4 - 2 : 0, bob = P.walk ? -Math.abs(walk) * 4 : Math.sin(t / 600) * 1.2;
    const lift = (P.lift || 0) + bob + fl, open = Math.max(0, Math.min(1, (P.open || 0) + chew * 0.5 - (P.chew ? 0.25 : 0)));
    const bot = F.bottom(stage), g = { cx: 100, bw, bh, bot, top: bot - bh, left: 100 - bw / 2, stage };
    const x = { P, t, walk, body, parts, acc, L, stage, open, m };
    c.fillStyle = rgba(INK, F.float ? 0.08 : 0.14);
    c.beginPath(); c.ellipse(100 + (P.lean || 0) * 0.5, 189, Math.max(bw * 0.44, 24) * (F.float ? 0.75 : 1) * (1 + lift * 0.008), 6, 0, 0, 7); c.fill();
    c.save();
    c.translate(P.lean || 0, lift);
    c.translate(100, 176); c.rotate((P.tilt || 0) * Math.PI / 180); c.scale(P.sx || 1, P.sy || 1); c.translate(-100, -176);
    if (F.behind) F.behind.call(F, c, g, x);
    const sy = g.top + g.bh * (F.shoulderY || 0.56), inset = 4 + g.bw * (F.shoulderIn || 0), k = F.armK || 1;
    const arms = () => {
      if (F.arms === 'claw') {
        const aw = F.armW(stage), sz = F.clawSz(stage);
        [[-1, P.arm[0], L.armL], [1, P.arm[1], L.armR]].forEach(([side, a, mat]) => {
          const sx = g.cx + side * (g.bw / 2 - inset), hx = sx + side * a[2] * k, hy = sy + a[3] * k - (stage === 'Bit' ? 10 : 6);
          if (aw) limb(c, [sx, sy, sx + side * a[0] * k, sy + a[1] * k, hx, hy], aw, parts, mat, t);
          claw(c, stage === 'Bit' ? sx + side * 6 : hx, stage === 'Bit' ? sy - 2 : hy, -0.75 + (P.eyes === 'happy' ? -0.4 : 0), sz, parts, side, stage === 'Mega'); });
      } else if (F.arms === 'stub' && F.armW(stage)) {
        const st = { arm: F.armW(stage), hand: F.handR(stage) };
        [[-1, P.arm[0], L.armL], [1, P.arm[1], L.armR]].forEach(([side, a, mat]) =>
          arm(c, g.cx + side * (g.bw / 2 - inset), sy, a.map(v => v * k), side, st, parts, lt(parts, 0.22), mat, t));
      }
    };
    if (!P.front) arms();
    if (F.glow && F.glow(stage)) { c.save(); c.shadowColor = rgba(lt(body, 0.5), 0.9); c.shadowBlur = 18; F.path(c, g, x); c.fillStyle = rgb(body); c.fill(); c.restore(); }
    c.save(); c.translate(0, 4); F.path(c, g, x); c.restore(); c.fillStyle = rgb(dk(body, 0.38)); c.fill();
    const grad = c.createLinearGradient(g.left, g.top, g.left + g.bw, g.bot);
    grad.addColorStop(0, rgb(lt(body, 0.14))); grad.addColorStop(0.55, rgb(body)); grad.addColorStop(1, rgb(dk(body, 0.1)));
    F.path(c, g, x); c.fillStyle = grad; c.fill();
    c.save(); F.path(c, g, x); c.clip();
    const E = ELEMENT[m.el];
    if (stage === 'Mega' && E) E.pattern(c, g, body);
    if (F.inside) F.inside(c, g, x);
    c.restore();
    const h = F.hl ? F.hl(g) : [g.left + g.bw * 0.13, g.top + g.bh * 0.42, g.left + g.bw * 0.12, g.top + g.bh * 0.12, g.left + g.bw * 0.4, g.top + g.bh * 0.08];
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = stage === 'Bit' ? 4.5 : 5.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(h[0], h[1]); c.quadraticCurveTo(h[2], h[3], h[4], h[5]); c.stroke();
    if (E) for (const side of [-1, 1]) E.mark(c, g.cx + side * (g.bw / 2 - 10), g.top + g.bh * 0.3, stage === 'Bit' ? 0.7 : 0.85, rgba(acc, 0.9));
    const my = F.face(c, g, x, look);
    if (m.worn && m.worn.head === 'Cap') cap(c, g);
    if (P.front) arms();
    c.restore();
    const top = g.top + lift;
    if (P.extra === 'zz') { c.strokeStyle = rgb(lt(INK, 0.4)); c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [zx, zy, z] of [[g.cx + g.bw / 2 + 2, top + 4, 9], [g.cx + g.bw / 2 + 16, top - 12, 6]]) {
        const yy = zy - (t / 60 % 10); c.beginPath(); c.moveTo(zx, yy); c.lineTo(zx + z, yy); c.lineTo(zx, yy + z); c.lineTo(zx + z, yy + z); c.stroke(); } }
    if (P.extra === 'sweat') { c.fillStyle = '#9CD4F5'; const sx2 = g.cx + g.bw / 2 - 4, sy2 = top + 6;
      c.beginPath(); c.moveTo(sx2, sy2); c.quadraticCurveTo(sx2 + 8, sy2 + 12, sx2, sy2 + 15); c.quadraticCurveTo(sx2 - 8, sy2 + 12, sx2, sy2); c.fill(); }
    if (P.extra === 'heart') heart(c, g.cx + g.bw / 2 + 6, top - 4 + Math.sin(t / 200) * 2, 0.7, rgb(BLUSH));
    if (P.extra === 'stars') for (let k2 = 0; k2 < 3; k2++) { const a = t / 400 + k2 * 2.1;
      star(c, g.cx + Math.cos(a) * g.bw * 0.4, top + 4 + Math.sin(a) * 6, 0.55, k2 % 2 ? '#ffd23f' : rgb(lt(acc, 0.3))); }
    if (P.extra === 'crumbs' && my) { c.fillStyle = rgb(lt(parts, 0.4)); for (let k2 = 0; k2 < 4; k2++) { const ph = (t / 400 + k2 / 4) % 1;
      c.beginPath(); c.arc(g.cx - 12 + k2 * 8, my + lift + ph * 22, 2, 0, 7); c.fill(); } }
  }

  /* blend two poses for the spring between them (numbers only; the face swaps halfway) */
  function blend(a, b, k) {
    const A = POSE[a] || POSE.idle, B = POSE[b] || POSE.idle, n = (x, y) => lerp(x || 0, y || 0, k), o = (x, y) => lerp(x ?? 1, y ?? 1, k);
    return { ...(k < 0.5 ? A : B), arm: A.arm.map((s, i) => s.map((v, j) => lerp(v, B.arm[i][j], k))), feet: A.feet.map((v, i) => lerp(v, B.feet[i], k)),
      open: n(A.open, B.open), lift: n(A.lift, B.lift), tilt: n(A.tilt, B.tilt), lean: n(A.lean, B.lean), sx: o(A.sx, B.sx), sy: o(A.sy, B.sy) };
  }

  /* the visible height of each stage in units, so screens can size it */
  const chompHeight = (stage, marks = []) => (STAGE[stage] || STAGE.Bit).bh + 18 + (marks.includes('Horned') && stage !== 'Bit' ? 28 : 0);
  const draw = (c, m, p, t = 0, look = [0, 0]) => (FAM[m.family] ? drawFamily(c, m, p, t, look, FAM[m.family]) : drawChomp(c, m, p, t, look));
  const height = (stage, marks = [], family = 'Chomp') => FAM[family] ? FAM[family].height(stage) : chompHeight(stage, marks);
  const width = (stage, family = 'Chomp') => FAM[family] ? FAM[family].dims[stage][0] : STAGE[stage].bw;
  return { draw, blend, height, width, POSES: Object.keys(POSE), STAGE, FAMILIES: ['Chomp', ...Object.keys(FAM)] };
})();
