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
  /* when a drawing is given m.capture, it records where its eyes, mouth, hands and body ended up on the canvas
     (canvas pixels, after every transform), so attacks can start from the right spot */
  let CAP = null;
  const capPt = (c, x, y) => { const p = c.getTransform().transformPoint({ x, y }); return { x: p.x, y: p.y }; };
  function capBody(c, g) { if (!CAP) return; CAP.top = capPt(c, g.cx, g.top + g.bh * 0.18); CAP.center = capPt(c, g.cx, g.top + g.bh * 0.5); CAP.feet = capPt(c, g.cx, 186); }
  function capFace(c, cx, ey, ex, my, one) { if (!CAP) return; CAP.eyes = one ? [capPt(c, cx, ey)] : [capPt(c, cx - ex, ey), capPt(c, cx + ex, ey)]; CAP.mouth = capPt(c, cx, my); }

  /* Bit keeps the silhouette, eyes, feet, colour and the toothy mouth. Byte adds arms and the training mark.
     Mega adds fangs, claws, the second mark and the element pattern. */
  const STAGE = {
    Bit:  { bw: 80,  bh: 64,  r: 26, eye: 0.82, arm: 0,  hand: 0,   foot: [11, 7],  mw: 0.46, teeth: 4, fang: 0, toes: 0 },
    Byte: { bw: 106, bh: 84,  r: 32, eye: 0.96, arm: 9,  hand: 6.5, foot: [13, 8],  mw: 0.58, teeth: 5, fang: 0, toes: 0 },
    Mega: { bw: 126, bh: 100, r: 38, eye: 1.04, arm: 11, hand: 8.5, foot: [16, 9.5], mw: 0.64, teeth: 6, fang: 2, toes: 3 }
  };

  /* Arms are [elbow out, elbow y, hand out, hand y] from the shoulder, where "out" points away from the body,
     so every pose blends into every other. Feet are [left dx, left lift, right dx, right lift]. */
  /* Arms are [elbow out, elbow y, hand out, hand y] from the shoulder, where "out" points away from the body,
     so every pose blends into every other. The first arm is the left one; in battle the right arm faces the enemy.
     Feet are [left dx, left lift, right dx, right lift]. */
  const REST = [12, 8, 16, 22], UP = [16, -10, 14, -28], DROOP = [8, 14, 6, 26];
  const POSE = {
    // ranch
    idle:   { arm: [REST, REST], feet: [0, 0, 0, 0], eyes: 'open', open: 0 },
    walk:   { arm: [REST, REST], feet: [0, 0, 0, 0], eyes: 'open', open: 0.1, walk: 1 },
    run:    { arm: [[14, 2, 22, 6], [14, 2, 22, 6]], feet: [0, 0, 0, 0], eyes: 'fierce', open: 0.4, walk: 2, tilt: 6, lean: 4 },
    happy:  { arm: [UP, UP], feet: [-3, 0, 3, 0], eyes: 'happy', open: 0.75, lift: -12, extra: 'heart' },
    sad:    { arm: [DROOP, DROOP], feet: [0, 0, 0, 0], eyes: 'sad', open: 0, frown: 1, sy: 0.96, extra: 'tear' },
    // moods for the ranch idle: worn down, fresh, and fired up on a great day
    droopy: { arm: [DROOP, DROOP], feet: [-2, 0, 2, 0], eyes: 'droopy', open: 0, sy: 0.95, sx: 1.03, tilt: -2, extra: 'sigh' },
    fresh:  { arm: [[14, -2, 20, 10], [14, -2, 20, 10]], feet: [-3, 0, 3, 0], eyes: 'open', open: 0.35, lift: -4, extra: 'shine' },
    determined: { arm: [[12, -6, 4, -20], [12, -6, 4, -20]], feet: [-6, 0, 6, 0], eyes: 'fierce', open: 0.18, sy: 1.04, sx: 1.02, extra: 'glint' },
    tired:  { arm: [DROOP, DROOP], feet: [-2, 0, 2, 0], eyes: 'tired', open: 0.15, sy: 0.93, sx: 1.04, tilt: -3 },
    eat:    { arm: [[8, 16, -8, 24], [8, 16, -8, 24]], feet: [0, 0, 0, 0], eyes: 'happy', open: 0.5, chew: 1, front: 1, extra: 'crumbs' },
    sleep:  { arm: [[10, 10, 12, 16], [10, 10, 12, 16]], feet: [-4, 0, 4, 0], eyes: 'shut', open: 0, sx: 1.07, sy: 0.86, extra: 'zz' },
    sit:    { arm: [[10, 12, 14, 18], [10, 12, 14, 18]], feet: [-7, -3, 7, -3], eyes: 'open', open: 0, sx: 1.05, sy: 0.9 },
    zen:    { arm: [[10, 12, 14, 18], [10, 12, 14, 18]], feet: [-7, -3, 7, -3], eyes: 'shut', open: 0, sx: 1.05, sy: 0.9 },   // Meditate: sitting with its eyes shut
    dizzy:  { arm: [[14, 4, 20, 14], [14, 4, 20, 14]], feet: [-3, 0, 3, 0], eyes: 'dizzy', open: 0.25, wobble: 1, extra: 'stars' },
    effort: { arm: [[12, 4, 8, 12], [12, 4, 8, 12]], feet: [-5, 0, 5, 0], eyes: 'hurt', open: 0.15, sx: 1.08, sy: 0.9, extra: 'sweat' },
    lean:   { arm: [REST, [10, 10, 4, 18]], feet: [-2, 0, 2, 0], eyes: 'open', open: 0, tilt: -9, lean: -3 },
    hover:  { arm: [[16, -2, 24, -4], [16, -2, 24, -4]], feet: [-2, -6, 2, -6], eyes: 'happy', open: 0.3, lift: -14 },
    hurt:   { arm: [[8, 2, 2, -12], [8, 2, 2, -12]], feet: [-2, 0, 2, 0], eyes: 'hurt', open: 0, ouch: 1, tilt: -5, sx: 1.04, sy: 0.95, front: 1, extra: 'sweat' },
    // battle
    guard:  { arm: [[8, 4, -16, -2], [8, 4, -16, 4]], feet: [-4, 0, 4, 0], eyes: 'fierce', open: 0, sy: 0.95, front: 1 },
    crouch: { arm: [[10, 10, 14, 16], [10, 10, 14, 16]], feet: [-5, 0, 5, 0], eyes: 'fierce', open: 0.2, sx: 1.1, sy: 0.84, lean: -5, tilt: -4 },
    tackle: { arm: [[6, 4, -2, 14], [6, 4, -4, 10]], feet: [-6, -4, 6, -6], eyes: 'fierce', open: 0.3, sx: 1.08, sy: 0.9, tilt: 18, lean: 8 },
    bitewide: { arm: [[14, 2, 22, 6], [14, 2, 22, 6]], feet: [-4, -3, 4, -5], eyes: 'fierce', open: 1, tilt: 10, lean: 8 },
    chomp:  { arm: [[12, 6, 18, 12], [12, 6, 18, 12]], feet: [-4, 0, 4, 0], eyes: 'fierce', open: 0, sx: 1.06, sy: 0.95, tilt: 6, lean: 6 },
    jump:   { arm: [[14, -12, 16, -26], [14, -12, 16, -26]], feet: [-3, -6, 3, -6], eyes: 'fierce', open: 0.45, sx: 0.9, sy: 1.12 },
    land:   { arm: [[16, 4, 24, 8], [16, 4, 24, 8]], feet: [-7, 0, 7, 0], eyes: 'fierce', open: 0.55, sx: 1.16, sy: 0.78 },
    punchwind: { arm: [[10, 8, 12, 18], [6, 4, -8, 2]], feet: [-5, 0, 5, 0], eyes: 'fierce', open: 0.2, lean: -5, tilt: -6 },
    punch:  { arm: [[8, 10, 4, 16], [26, -6, 46, -10]], feet: [-6, 0, 6, -3], eyes: 'fierce', open: 0.6, lean: 10, tilt: 10, front: 1 },
    swipeup: { arm: [[10, -16, 4, -32], [10, -16, 4, -32]], feet: [-4, 0, 4, 0], eyes: 'fierce', open: 0.4, tilt: -7, lean: -3 },
    swipedown: { arm: [[18, 4, 30, 16], [18, 4, 30, 16]], feet: [-5, 0, 5, -3], eyes: 'fierce', open: 0.75, tilt: 11, lean: 8, front: 1 },
    cast:   { arm: [[14, -14, 22, -24], [14, -14, 22, -24]], feet: [-3, 0, 3, 0], eyes: 'shut', open: 0, lift: -6 },
    push:   { arm: [[18, -4, 34, -6], [18, -4, 34, -6]], feet: [-6, 0, 6, 0], eyes: 'fierce', open: 0.35, lean: 7, tilt: 5, front: 1 },
    float:  { arm: [[14, -10, 20, -22], [14, -10, 20, -22]], feet: [-4, 6, 4, 6], eyes: 'hurt', open: 0, ouch: 1, extra: 'sweat' },
    dodge:  { arm: [[14, -6, 20, -14], REST], feet: [-6, -3, 2, 0], eyes: 'open', open: 0.3, tilt: -14, lean: -6 },
    slamup: { arm: [[12, -18, 6, -38], [12, -18, 6, -38]], feet: [-3, 0, 3, 0], eyes: 'fierce', open: 0.45, sx: 0.92, sy: 1.1, lift: -6 },
    slam:   { arm: [[18, 10, 26, 30], [18, 10, 26, 30]], feet: [-7, 0, 7, 0], eyes: 'fierce', open: 0.85, sx: 1.16, sy: 0.8, front: 1 },
    attack: { arm: [[18, -2, 30, -6], [18, -2, 30, -6]], feet: [-5, 0, 5, -3], eyes: 'fierce', open: 1, tilt: 7, lean: 8, front: 1 },
    hit:    { arm: [[16, -8, 24, -18], [16, -8, 24, -18]], feet: [-3, -4, 3, 0], eyes: 'hurt', open: 0, ouch: 1, tilt: -9, lean: -6, sx: 0.94, sy: 1.04, extra: 'sweat' },
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
  /* Every element puts small marks on the sides of the face at every stage and a body pattern at Mega.
     Patterns stay below the eyes and on the sides since the top of the head holds the modular parts. */
  const bolt = (c, x, y, s) => { c.beginPath(); c.moveTo(x + 1 * s, y - 7 * s); c.lineTo(x - 4 * s, y + 1 * s); c.lineTo(x, y + 1 * s); c.lineTo(x - 1.5 * s, y + 7 * s); c.lineTo(x + 4.5 * s, y - 1.5 * s); c.lineTo(x + 0.5 * s, y - 1.5 * s); c.closePath(); };
  const drop = (c, x, y, s) => { c.beginPath(); c.moveTo(x, y - 6 * s); c.quadraticCurveTo(x + 5 * s, y + 1 * s, x, y + 5 * s); c.quadraticCurveTo(x - 5 * s, y + 1 * s, x, y - 6 * s); c.closePath(); };
  const leafShape = (c, x, y, s, a = -0.6) => { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 6 * s, 3 * s, 0, 0, 7); c.restore(); };
  const moon = (c, x, y, s) => { c.beginPath(); c.arc(x, y, 5.5 * s, 0.6, Math.PI * 2 - 0.6, false); c.arc(x + 3.2 * s, y - 1 * s, 4.2 * s, Math.PI * 2 - 0.9, 0.9, true); c.closePath(); };
  const sides = (g, fn) => { for (const side of [-1, 1]) fn(side); };
  const scatter = (g, pts, fn) => pts.forEach(([fx, fy, r]) => fn(g.left + g.bw * fx, g.top + g.bh * fy, r));
  const SIDE_SPOTS = [[0.08, 0.55, 1], [0.15, 0.78, 0.75], [0.07, 0.9, 0.6], [0.92, 0.52, 0.95], [0.86, 0.74, 0.7], [0.94, 0.88, 0.6], [0.26, 0.93, 0.55], [0.74, 0.94, 0.6]];
  const ELEMENT = {
    Blaze: {
      mark(c, x, y, s, col) { c.fillStyle = col; flame(c, x, y + 5 * s, 7 * s, 13 * s); c.fill(); },
      pattern(c, g, body) { c.fillStyle = rgb(dk(body, 0.24));
        sides(g, side => { flame(c, g.cx + side * (g.bw / 2 - 5), g.bot + 4, 24, Math.min(62, g.bh * 0.62)); c.fill(); flame(c, g.cx + side * (g.bw / 2 - 20), g.bot + 4, 16, Math.min(38, g.bh * 0.4)); c.fill(); }); }
    },
    Brawl: {
      mark(c, x, y, s, col) { c.strokeStyle = col; c.lineWidth = 3.2 * s; c.lineCap = 'round';
        for (const k of [0, 6]) { c.beginPath(); c.moveTo(x - 4 * s, y + (k - 2) * s); c.lineTo(x + 4 * s, y + (k - 5) * s); c.stroke(); } },
      pattern(c, g, body) { c.fillStyle = rgb(dk(body, 0.26));
        sides(g, side => { for (let k = 0; k < 3; k++) { const x = g.cx + side * g.bw / 2, y = g.top + g.bh * (0.42 + k * 0.17), len = g.bw * (0.2 - k * 0.03);
          c.beginPath(); c.moveTo(x, y - 6); c.quadraticCurveTo(x - side * len * 0.6, y - 4, x - side * len, y + 1); c.quadraticCurveTo(x - side * len * 0.6, y + 3, x, y + 6); c.closePath(); c.fill(); } }); }
    },
    Spark: {
      mark(c, x, y, s, col) { c.fillStyle = col; bolt(c, x, y + 1, 0.9 * s); c.fill(); },
      pattern(c, g, body) { c.fillStyle = rgb(dk(body, 0.2));
        sides(g, side => { const x = g.cx + side * (g.bw / 2 - 2), y = g.top + g.bh * 0.5; c.save(); c.translate(x, y); c.scale(-side, 1);
          c.beginPath(); c.moveTo(0, -12); c.lineTo(16, -6); c.lineTo(8, -2); c.lineTo(22, 6); c.lineTo(6, 4); c.lineTo(12, 10); c.lineTo(0, 8); c.closePath(); c.fill(); c.restore(); }); }
    },
    Wild: {
      mark(c, x, y, s, col) { c.fillStyle = col; leafShape(c, x, y + 2, 0.9 * s); c.fill(); },
      pattern(c, g, body) { c.fillStyle = rgb(dk(body, 0.2)); scatter(g, SIDE_SPOTS, (x, y, r) => { leafShape(c, x, y, r * 1.3, r > 0.8 ? -0.5 : 0.7); c.fill(); }); }
    },
    Frost: {
      mark(c, x, y, s, col) { star(c, x, y + 2 * s, 0.55 * s, col); },
      pattern(c, g, body) { c.fillStyle = rgba(lt(body, 0.55), 0.85); scatter(g, SIDE_SPOTS, (x, y, r) => { c.beginPath(); c.arc(x, y, 6 * r, 0, 7); c.fill(); }); }
    },
    Tide: {
      mark(c, x, y, s, col) { c.fillStyle = col; drop(c, x, y + 2, 0.9 * s); c.fill(); },
      pattern(c, g, body) { c.strokeStyle = rgb(lt(body, 0.32)); c.lineWidth = 5; c.lineCap = 'round';
        for (const fy of [0.8, 0.93]) { c.beginPath(); for (let i = 0; i <= 12; i++) { const x = g.left + g.bw * i / 12, y = g.top + g.bh * fy + Math.sin(i * 1.6) * 3; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }
    },
    Venom: {
      mark(c, x, y, s, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y + 2 * s, 3.4 * s, 0, 7); c.fill(); c.beginPath(); c.arc(x + 4 * s, y - 3 * s, 2 * s, 0, 7); c.fill(); },
      pattern(c, g, body) { c.fillStyle = rgb(dk(body, 0.22)); scatter(g, SIDE_SPOTS, (x, y, r) => { c.beginPath(); c.arc(x, y, 6.5 * r, 0, 7); c.fill(); });
        c.fillStyle = rgba(lt(body, 0.5), 0.6); scatter(g, SIDE_SPOTS, (x, y, r) => { c.beginPath(); c.arc(x - 2 * r, y - 2 * r, 1.8 * r, 0, 7); c.fill(); }); }
    },
    Charm: {
      mark(c, x, y, s, col) { heart(c, x, y + 2 * s, 0.38 * s, col); },
      pattern(c, g, body) { scatter(g, SIDE_SPOTS, (x, y, r) => heart(c, x, y, 0.5 * r, rgb(lt(body, 0.4)))); }
    },
    Stone: {
      mark(c, x, y, s, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x - 4 * s, y + 4 * s); c.lineTo(x - 3 * s, y - 2 * s); c.lineTo(x + 1 * s, y - 4 * s); c.lineTo(x + 4.5 * s, y); c.lineTo(x + 3 * s, y + 4 * s); c.closePath(); c.fill(); },
      pattern(c, g, body) { c.strokeStyle = rgb(dk(body, 0.3)); c.lineWidth = 2.6; c.lineCap = 'round'; c.lineJoin = 'round';
        sides(g, side => { const x = g.cx + side * g.bw / 2, y = g.top + g.bh * 0.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x - side * 10, y + 6); c.lineTo(x - side * 8, y + 16); c.lineTo(x - side * 18, y + 22); c.moveTo(x - side * 10, y + 6); c.lineTo(x - side * 20, y + 4); c.stroke(); });
        c.fillStyle = rgb(dk(body, 0.18)); scatter(g, SIDE_SPOTS, (x, y, r) => { c.beginPath(); c.arc(x, y, 2.4 * r, 0, 7); c.fill(); }); }
    },
    Light: {
      mark(c, x, y, s, col) { star(c, x, y + 2 * s, 0.6 * s, col); },
      pattern(c, g, body) { scatter(g, SIDE_SPOTS, (x, y, r) => star(c, x, y, 0.75 * r, rgb(mix(body, [255, 210, 90], 0.55)))); }
    },
    Steel: {
      mark(c, x, y, s, col) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.lineTo(x + Math.cos(a) * 4 * s, y + 2 * s + Math.sin(a) * 4 * s); } c.closePath(); c.fill(); },
      pattern(c, g, body) { c.strokeStyle = rgb(dk(body, 0.22)); c.lineWidth = 2.5;
        sides(g, side => { const x = g.cx + side * g.bw * 0.36; c.beginPath(); c.moveTo(x, g.top + g.bh * 0.45); c.lineTo(x, g.bot + 4); c.stroke();
          c.fillStyle = rgb(lt(body, 0.35)); for (const fy of [0.55, 0.72, 0.89]) { c.beginPath(); c.arc(x + side * 7, g.top + g.bh * fy, 2.4, 0, 7); c.fill(); } }); }
    },
    Shade: {
      mark(c, x, y, s, col) { c.fillStyle = col; moon(c, x, y + 2 * s, 0.85 * s); c.fill(); },
      pattern(c, g, body) { c.fillStyle = rgba(lt(body, 0.35), 0.8); scatter(g, SIDE_SPOTS.filter((p, i) => i % 2 === 0), (x, y, r) => { moon(c, x, y, 1.2 * r); c.fill(); }); }
    }
  };

  function eye(c, x, y, s, type, side, look) {
    c.save(); c.translate(x, y);
    c.strokeStyle = rgb(INK); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 4.2 * s;
    if (type === 'happy') { c.beginPath(); c.moveTo(-8 * s, 2 * s); c.quadraticCurveTo(0, -9 * s, 8 * s, 2 * s); c.stroke(); }
    else if (type === 'shut') { c.beginPath(); c.moveTo(-8 * s, -1 * s); c.quadraticCurveTo(0, 6 * s, 8 * s, -1 * s); c.stroke(); }
    else if (type === 'hurt') { const d = -side; c.beginPath(); c.moveTo(-6 * s * d, -6 * s); c.lineTo(6 * s * d, 0); c.lineTo(-6 * s * d, 6 * s); c.stroke(); }
    else if (type === 'ko') { c.beginPath(); c.moveTo(-6 * s, -6 * s); c.lineTo(6 * s, 6 * s); c.moveTo(6 * s, -6 * s); c.lineTo(-6 * s, 6 * s); c.stroke(); }
    else if (type === 'dizzy') { c.lineWidth = 2.6 * s; c.beginPath(); for (let a = 0; a < 15; a++) { const r = a * 0.62 * s, an = a * 0.9 * side; a ? c.lineTo(Math.cos(an) * r, Math.sin(an) * r) : c.moveTo(0, 0); } c.stroke(); }
    else if (type === 'tired') { c.fillStyle = rgb(INK); c.beginPath(); c.ellipse(0, 1 * s, 8.6 * s, 9 * s, 0, 0, Math.PI); c.fill();
      c.beginPath(); c.moveTo(-9.5 * s, 1 * s); c.lineTo(9.5 * s, 1 * s); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(3 * s, 4 * s, 2.2 * s, 0, 7); c.fill(); }
    else if (type === 'sad') { c.fillStyle = rgb(INK); c.beginPath(); c.ellipse(0, 1 * s, 7.6 * s, 9 * s, 0, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(2.6 * s, -2.4 * s, 3 * s, 0, 7); c.fill(); c.beginPath(); c.arc(-2.4 * s, 4 * s, 1.5 * s, 0, 7); c.fill();
      c.lineWidth = 3 * s; c.beginPath(); c.moveTo(-8 * s * side, -15 * s); c.lineTo(7 * s * side, -11.5 * s); c.stroke(); }
    else {
      const lx = look[0] * 2.5 * s, ly = look[1] * 2 * s;
      if (type === 'droopy') {       // tired but awake: a heavy top lid that sags at the outer corner
        c.fillStyle = rgb(INK); c.beginPath(); c.ellipse(lx, ly + 1 * s, 8.6 * s, 9.4 * s, 0, 0, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(lx + 2.6 * s, ly + 3 * s, 2.4 * s, 0, 7); c.fill();
        const o = side === 0 ? 0 : side || 1, lidY = k => -1 * s + k * 3.2 * s * o;   // lower toward the outer corner
        c.save(); c.beginPath(); c.ellipse(lx, ly + 1 * s, 9.4 * s, 10.2 * s, 0, 0, 7); c.clip();
        c.fillStyle = LIDC; c.beginPath(); c.moveTo(-14 * s, -14 * s); c.lineTo(14 * s, -14 * s); c.lineTo(14 * s, lidY(1)); c.lineTo(-14 * s, lidY(-1)); c.closePath(); c.fill(); c.restore();
        c.lineWidth = 3.2 * s; c.beginPath(); c.moveTo(-9.4 * s, lidY(-1) - 0.6 * s); c.lineTo(9.4 * s, lidY(1) - 0.6 * s); c.stroke();
      } else if (EYE === 'moon') {          // Moonlit: silver eyes with a dark rim
        const gr = c.createLinearGradient(0, ly - 10 * s, 0, ly + 10 * s); gr.addColorStop(0, '#eef1ff'); gr.addColorStop(1, '#9aa6cf');
        c.fillStyle = gr; c.beginPath(); c.ellipse(lx, ly, 8.6 * s, 10.2 * s, 0, 0, 7); c.fill();
        c.lineWidth = 2 * s; c.strokeStyle = rgb(INK); c.stroke();
        c.fillStyle = rgb(INK); c.beginPath(); c.ellipse(lx, ly + 1 * s, 3.2 * s, 4.6 * s, 0, 0, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(lx + 2.6 * s, ly - 4 * s, 2.4 * s, 0, 7); c.fill();
      } else {
      c.fillStyle = rgb(INK); c.beginPath(); c.ellipse(lx, ly, 8.6 * s, 10.2 * s, 0, 0, 7); c.fill();
      if (EYE === 'spark') {         // Pampered: star sparkles in the eyes
        star(c, lx + 2.4 * s, ly - 3.2 * s, 0.62 * s, '#fff'); c.fillStyle = '#ffd0e6'; c.beginPath(); c.arc(lx - 2.8 * s, ly + 3.8 * s, 1.9 * s, 0, 7); c.fill();
      } else {
      c.fillStyle = '#fff'; c.beginPath(); c.arc(lx + 3 * s, ly - 3.8 * s, 3.4 * s, 0, 7); c.fill();
      c.beginPath(); c.arc(lx - 2.8 * s, ly + 3.8 * s, 1.6 * s, 0, 7); c.fill(); } }
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
    if (CAP) (CAP.hands = CAP.hands || []).push(capPt(c, q[4], q[5]));
    limb(c, q, st.arm, col, mat, t);
    blob(c, q[4], q[5], st.hand, st.hand, hand, mat, t, 'hand');
  }

  /* m: { stage, pal, marks: ['Horned', 'Stout'], el, worn: { head } }   p: pose name or blended pose object */
  function drawChomp(c, m, p, t = 0, look = [0, 0]) {
    const P = typeof p === 'string' ? POSE[p] || POSE.idle : p, S = STAGE[m.stage] || STAGE.Bit;
    const marks = m.marks || [], stout = marks.includes('Stout') && m.stage !== 'Bit', horned = marks.includes('Horned') && m.stage !== 'Bit';
    const st = { ...S, bw: Math.round((S.bw + (stout ? 14 : 0)) * (VAR_W[VAR] || 1)), bh: Math.round(S.bh * (VAR_H[VAR] || 1)), fang: VAR === 'Feral' ? 2 : S.fang };
    const pal = m.pal, body = pal.body, parts = pal.parts, acc = pal.accent;
    const rim = dk(body, 0.38), handCol = lt(parts, 0.22);
    const walk = P.walk ? Math.sin(t / (P.walk > 1 ? 75 : 130)) : 0, chew = P.chew ? (Math.sin(t / 110) + 1) / 2 : 0;
    const bob = P.walk ? -Math.abs(walk) * 4 : Math.sin(t / 600) * 1.2;
    const lift = (P.lift || 0) + bob, open = Math.max(0, Math.min(1, (P.open || 0) + chew * 0.5 - (P.chew ? 0.25 : 0)));
    const sx = (P.sx || 1) * (1 + Math.sin(t / 600) * 0.008), sy = (P.sy || 1) * (1 - Math.sin(t / 600) * 0.008);
    const g = { cx: 100, bw: st.bw, bh: st.bh, bot: 174, top: 174 - st.bh, left: 100 - st.bw / 2 }, left = g.left;
    const fy = 183, fx = g.bw * 0.24;
    // shadow stays on the ground and shrinks as the body lifts
    c.fillStyle = rgba(INK, 0.14 + lift * 0.004);
    c.beginPath(); c.ellipse(100 + (P.lean || 0) * 0.5, 189, g.bw * 0.44 * (1 + lift * 0.008), 6, 0, 0, 7); c.fill();
    c.save();
    c.translate(P.lean || 0, lift);
    c.translate(100, 176); c.rotate(((P.tilt || 0) + (P.wobble ? Math.sin(t / 160) * 8 : 0)) * Math.PI / 180); c.scale(sx, sy); c.translate(-100, -176);
    if (m.fx) fxBehind(c, m.fx, () => roundBox(c, left, g.top, g.bw, g.bh, st.r), g, body, t);
    const W = m.worn || {}, feetAt = [], back = !!m.back;
    if (W.back && !back) wings(c, g, W.back, t);
    // feet sit behind the body
    const F = P.feet || [0, 0, 0, 0], footLift = [Math.max(0, walk) * -5, Math.max(0, -walk) * -5];
    for (const [i, side] of [[0, -1], [1, 1]]) {
      const x = g.cx + side * fx + F[i * 2], y = fy + F[i * 2 + 1] + footLift[i] - lift * 0.5;
      const fm = (m.limbs || {})[i ? 'legR' : 'legL'];
      blob(c, x, y, st.foot[0], st.foot[1], parts, fm, t, 'foot'); feetAt.push([x, y, st.foot[0] * 0.85]);
      if (st.toes && !fm) for (let k = 0; k < st.toes; k++) { c.fillStyle = rgb(acc); c.beginPath(); c.arc(x - 7 + k * 7, y + st.foot[1] - 2.5, 2.6, 0, 7); c.fill(); }
    }
    if (W.feet === 'Boots') boots(c, feetAt);
    const headC = [g.cx, g.top + 3, g.bw * 0.46], pathC = () => roundBox(c, left, g.top, g.bw, g.bh, st.r);
    variantBehind(c, pathC, g, body, t);
    marksBehind(c, m, g, headC, t);
    const shoulderY = g.top + g.bh * 0.56;
    const armBehind = st.arm && (!P.front || back), arms = () => {
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
    if (stout && !back) { c.fillStyle = rgb(lt(body, 0.6)); c.beginPath(); c.ellipse(g.cx, my + g.bh * 0.17, g.bw * 0.36, g.bh * 0.28, 0, 0, 7); c.fill(); }
    variantOn(c, g);
    if (m.fx) fxOnBody(c, m.fx, () => roundBox(c, left, g.top, g.bw, g.bh, st.r), g, body, t);
    c.restore();
    variantOutline(c, pathC);
    capBody(c, g);
    // one white highlight arc on the upper left
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = m.stage === 'Bit' ? 4.5 : 5.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(left + 9, g.top + st.r * 1.05); c.quadraticCurveTo(left + 10, g.top + 9, left + st.r * 1.25, g.top + 7); c.stroke();
    const ey = g.top + g.bh * 0.34, ex = g.bw * 0.19, s = st.eye;
    if (back) {                    // seen from behind: no face, a little tail, and wings and hats on top
      c.fillStyle = rgb(rim); c.beginPath(); c.arc(g.cx, g.bot - 4, 8.5, 0, 7); c.fill(); c.fillStyle = rgb(lt(body, 0.12)); c.beginPath(); c.arc(g.cx, g.bot - 6, 7.5, 0, 7); c.fill();
      if (W.back) wings(c, g, W.back, t);
      if (W.head) hat(c, { head: [g.cx, g.top + 3, g.bw * 0.46] }, W.head, t);
    } else {
    // face
    if (E) for (const side of [-1, 1]) E.mark(c, g.cx + side * (g.bw / 2 - 11), ey - 6, s * (m.stage === 'Bit' ? 0.8 : 1), rgba(acc, 0.9));
    c.fillStyle = rgba(BLUSH, 0.7);
    for (const side of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + side * g.bw * 0.31, ey + 13 * s, 7.5 * s, 4.5 * s, 0, 0, 7); c.fill(); }
    const eyes = P.eyes === 'open' && (m.stage === 'Mega' || VAR === 'Feral') ? 'fierce' : P.eyes;
    LIDC = rgb(body); eye(c, g.cx - ex, ey, s, eyes, -1, look); eye(c, g.cx + ex, ey, s, eyes, 1, look);
    capFace(c, g.cx, ey, ex, my, false);
    if (eyes === 'fierce') {        // a slanted top lid in body colour makes the Mega look ready to fight
      c.fillStyle = rgb(mix(lt(body, 0.05), body, 0.5));
      for (const side of [-1, 1]) { const x = g.cx + side * ex;
        c.save(); c.beginPath(); c.ellipse(x + look[0] * 2.5 * s, ey + look[1] * 2 * s, 9.2 * s, 10.8 * s, 0, 0, 7); c.clip();
        c.beginPath(); c.moveTo(x - 12 * s * side, ey - 14 * s); c.lineTo(x + 12 * s * side, ey - 14 * s); c.lineTo(x + 12 * s * side, ey - 10 * s); c.lineTo(x - 12 * s * side, ey - 4 * s); c.closePath(); c.fill(); c.restore(); }
    }
    if (P.frown || P.ouch) { c.save(); c.translate(0, my * 2 + mw * 0.2); c.scale(1, -1); mouth(c, g.cx, my, mw * 0.7, 0, st, body); c.restore(); } else mouth(c, g.cx, my, mw, open, st, body);
    wornFront(c, { head: [g.cx, g.top + 3, g.bw * 0.46], eyes: { cx: g.cx, y: ey, ex, s }, mouth: [g.cx, my, s] }, W, t);
    }
    if (!armBehind && st.arm) arms();
    variantFront(c, g, t, back);
    marksOver(c, m, g, headC, t);
    if (m.fx) fxFront(c, m.fx, () => roundBox(c, left, g.top, g.bw, g.bh, st.r), g, t);
    c.restore();
    // extras float above and do not tilt with the body
    const top = g.top + lift;
    if (P.extra === 'zz') { c.strokeStyle = rgb(lt(INK, 0.4)); c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [x, y, z] of [[g.cx + g.bw / 2 + 2, top + 4, 9], [g.cx + g.bw / 2 + 16, top - 12, 6]]) {
        const yy = y - (t / 60 % 10); c.beginPath(); c.moveTo(x, yy); c.lineTo(x + z, yy); c.lineTo(x, yy + z); c.lineTo(x + z, yy + z); c.stroke(); } }
    if (P.extra === 'sweat') { c.fillStyle = '#9CD4F5'; const x = g.cx + g.bw / 2 - 4, y = top + 6;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 8, y + 12, x, y + 15); c.quadraticCurveTo(x - 8, y + 12, x, y); c.fill(); }
    if (P.extra === 'heart') heart(c, g.cx + g.bw / 2 + 6, top - 4 + Math.sin(t / 200) * 2, 0.7, rgb(BLUSH));
    if (P.extra === 'tear') { const ph = (t / 900) % 1; c.fillStyle = `rgba(156,212,245,${1 - ph * 0.6})`; drop(c, g.cx - g.bw * 0.2, top + g.bh * 0.5 + ph * 14, 0.8); c.fill(); }
    if (P.extra === 'stars') for (let k = 0; k < 3; k++) { const a = t / 400 + k * 2.1;
      star(c, g.cx + Math.cos(a) * g.bw * 0.4, top + 4 + Math.sin(a) * 6, 0.55, k % 2 ? '#ffd23f' : rgb(lt(acc, 0.3))); }
    moodExtra(c, P, g, top, t, acc);
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

  /* ---------- worn items and effects, placed on each family's own anchors ----------
     A = { head: [x, y, w], eyes: { cx, y, ex, s, one }, mouth: [x, y, s] }; feet are [x, y, r] */
  function hat(c, A, item, t) {
    const [x, y, w] = A.head;
    if (item === 'Cap') {
      c.fillStyle = '#b8352e'; c.beginPath(); c.ellipse(x + w * 0.22, y + 1, w * 0.62, 5, 0, 0, 7); c.fill();
      c.fillStyle = '#e2483f'; c.beginPath(); c.moveTo(x - w / 2, y); c.bezierCurveTo(x - w / 2, y - w * 0.44, x + w / 2, y - w * 0.44, x + w / 2, y); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - w * 0.18, y - w * 0.2, 5, 3, -0.5, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y - w * 0.32, 2.4, 0, 7); c.fill();
    }
    if (item === 'Top hat') { const hw = w * 0.56, hh = w * 0.6;
      c.fillStyle = '#111116'; c.beginPath(); c.ellipse(x, y, w * 0.48, 5, 0, 0, 7); c.fill();
      roundBox(c, x - hw / 2, y - hh, hw, hh, 4); c.fillStyle = '#1b1b22'; c.fill();
      c.fillStyle = '#c43b6a'; c.fillRect(x - hw / 2, y - 9, hw, 6);
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x - hw / 2 + 4, y - hh + 4, 4, hh - 16); }
    if (item === 'Crown') { const cw = w * 0.62, ch = w * 0.34;
      c.fillStyle = '#c9971f'; c.beginPath(); c.moveTo(x - cw / 2, y + 2); c.lineTo(x - cw / 2, y - ch + 2); c.lineTo(x - cw / 4, y - ch * 0.45 + 2); c.lineTo(x, y - ch - 4 + 2);
      c.lineTo(x + cw / 4, y - ch * 0.45 + 2); c.lineTo(x + cw / 2, y - ch + 2); c.lineTo(x + cw / 2, y + 2); c.closePath(); c.fill();
      c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(x - cw / 2, y); c.lineTo(x - cw / 2, y - ch); c.lineTo(x - cw / 4, y - ch * 0.45); c.lineTo(x, y - ch - 4);
      c.lineTo(x + cw / 4, y - ch * 0.45); c.lineTo(x + cw / 2, y - ch); c.lineTo(x + cw / 2, y); c.closePath(); c.fill();
      for (const [gx, col] of [[-0.25, '#e2483f'], [0, '#3b8fd9'], [0.25, '#e2483f']]) { c.fillStyle = col; c.beginPath(); c.arc(x + gx * cw, y - 5, 2.6, 0, 7); c.fill(); } }
    if (item === 'Party hat') { const bw2 = w * 0.44, hh = w * 0.66;
      c.save(); c.beginPath(); c.moveTo(x - bw2 / 2, y); c.lineTo(x, y - hh); c.lineTo(x + bw2 / 2, y); c.closePath(); c.fillStyle = '#f2c94c'; c.fill(); c.clip();
      c.strokeStyle = '#3b6fb8'; c.lineWidth = 5; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - bw2, y - k * hh / 4 + 8); c.lineTo(x + bw2, y - k * hh / 4 - 8); c.stroke(); } c.restore();
      c.fillStyle = '#ff6fae'; c.beginPath(); c.arc(x, y - hh, 4.5, 0, 7); c.fill(); }
    if (item === 'Bow') { const bx = x + w * 0.3, byy = y + 3;
      c.fillStyle = '#ff6fae'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(bx + sd * 7, byy, 7.5, 5.5, sd * 0.35, 0, 7); c.fill(); }
      c.fillStyle = '#d94a8c'; c.beginPath(); c.arc(bx, byy, 3.6, 0, 7); c.fill(); }
  }
  function faceItem(c, A, item) {
    const E = A.eyes, s = E.s;
    if (item === 'Sunglasses') {
      c.fillStyle = '#1d1d26';
      const lens = (lx, w, h) => { roundBox(c, lx - w / 2, E.y - h / 2, w, h, h * 0.42); c.fill(); };
      if (E.one) lens(E.cx, 40 * s, 22 * s);
      else { lens(E.cx - E.ex, 21 * s, 15 * s); lens(E.cx + E.ex, 21 * s, 15 * s);
        c.strokeStyle = '#1d1d26'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(E.cx - E.ex + 9 * s, E.y - 3 * s); c.lineTo(E.cx + E.ex - 9 * s, E.y - 3 * s); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2.2 * s; c.lineCap = 'round';
      for (const lx of E.one ? [E.cx - 10 * s] : [E.cx - E.ex - 4 * s, E.cx + E.ex - 4 * s]) { c.beginPath(); c.moveTo(lx, E.y - 3 * s); c.lineTo(lx + 5 * s, E.y - 5.5 * s); c.stroke(); }
    }
    if (item === 'Monocle') { const mx = E.one ? E.cx : E.cx + E.ex, r = (E.one ? 21 : 12.5) * s;
      c.strokeStyle = '#e2b13c'; c.lineWidth = 2.6 * s; c.beginPath(); c.arc(mx, E.y, r, 0, 7); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fill();
      c.lineWidth = 1.4 * s; c.beginPath(); c.moveTo(mx + r * 0.7, E.y + r * 0.7); c.quadraticCurveTo(mx + r * 1.4, E.y + r * 2, mx + r * 1.1, E.y + r * 3); c.stroke(); }
  }
  function mustache(c, A) { const [x, y, s] = A.mouth, yy = y - 4 * s;
    c.fillStyle = '#5a3a22';
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x, yy); c.bezierCurveTo(x + sd * 6 * s, yy - 6 * s, x + sd * 14 * s, yy - 3 * s, x + sd * 16 * s, yy - 7 * s);
      c.bezierCurveTo(x + sd * 17 * s, yy + 2 * s, x + sd * 8 * s, yy + 4 * s, x, yy + 1.5 * s); c.closePath(); c.fill(); } }
  /* wings hang behind the body from its shoulders */
  function wings(c, g, item, t, wy = 0.42) {
    const y = g.top + g.bh * wy, flap = Math.sin(t / 180) * 0.12;
    for (const sd of [-1, 1]) {
      c.save(); c.translate(g.cx + sd * g.bw * 0.36, y); c.scale(sd, 1); c.rotate(-0.25 + flap); const W = Math.max(34, g.bw * 0.42);
      if (item === 'Bat wings') {
        c.fillStyle = '#3c2a55'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(W * 0.5, -W * 0.75, W * 1.1, -W * 0.55);
        c.quadraticCurveTo(W * 0.95, -W * 0.25, W * 1.05, W * 0.05); c.quadraticCurveTo(W * 0.78, -W * 0.05, W * 0.7, W * 0.22);
        c.quadraticCurveTo(W * 0.45, W * 0.05, W * 0.3, W * 0.3); c.quadraticCurveTo(W * 0.2, W * 0.1, 0, W * 0.2); c.closePath(); c.fill();
        c.strokeStyle = '#5b4580'; c.lineWidth = 2; c.beginPath(); c.moveTo(4, 2); c.lineTo(W * 1.05, -W * 0.5); c.moveTo(4, 4); c.lineTo(W * 0.72, W * 0.18); c.stroke();
      } else {
        for (let k = 2; k >= 0; k--) { c.fillStyle = k % 2 ? '#e3e8f5' : '#ffffff';
          c.beginPath(); c.ellipse(W * (0.42 + k * 0.12), -W * 0.12 + k * W * 0.16, W * (0.62 - k * 0.1), W * 0.2, -0.45 + k * 0.18, 0, 7); c.fill(); }
      }
      c.restore();
    }
  }
  function boots(c, feet) {
    for (const [x, y, r] of feet) {
      roundBox(c, x - r * 1.05, y - r * 1.25, r * 2.1, r * 1.85, r * 0.55); c.fillStyle = '#7a2a22'; c.fill();
      roundBox(c, x - r * 1.05, y - r * 1.4, r * 2.1, r * 1.75, r * 0.55); c.fillStyle = '#c0442e'; c.fill();
      c.fillStyle = '#f4ead8'; c.fillRect(x - r * 1.05, y - r * 1.4, r * 2.1, r * 0.45);
    }
  }
  function wornFront(c, A, worn, t) {
    if (!worn) return;
    if (worn.mouth === 'Mustache') mustache(c, A);
    if (worn.face) faceItem(c, A, worn.face);
    if (worn.head) hat(c, A, worn.head, t);
  }
  /* ---------- evolution marks and care variants, drawn on any family ----------
     head is the family's head anchor [x, y, w]. VAR holds the variant of the monster being drawn. */
  let VAR = null, EYE = null, LIDC = '#999';
  const VAR_W = { Bulky: 1.12, Lean: 0.88, Pampered: 1.05 }, VAR_H = { Lean: 1.07, Pampered: 0.97, Bulky: 0.98 };
  function horns(c, head, col) {
    const [hx, hy, w] = head, k = Math.max(0.8, Math.min(1.2, w / 52));
    for (const side of [-1, 1]) {
      const bx = hx + side * w * 0.58, by = hy + 5, o = side;
      const shape = () => { c.beginPath(); c.moveTo(bx - 9 * k * o, by); c.quadraticCurveTo(bx - 9 * k * o, by - 20 * k, bx + 9 * k * o, by - 32 * k);
        c.quadraticCurveTo(bx + 4 * k * o, by - 16 * k, bx + 9 * k * o, by); c.closePath(); };
      c.save(); c.translate(0, 3); shape(); c.fillStyle = rgb(dk(col, 0.35)); c.fill(); c.restore();
      shape(); c.fillStyle = rgb(col); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(bx - 5 * k * o, by - 6 * k); c.quadraticCurveTo(bx - 4 * k * o, by - 18 * k, bx + 3 * k * o, by - 25 * k); c.stroke();
    }
  }
  /* Sage: two feathery feelers with glowing tips */
  function feelers(c, head, acc, parts, t) {
    const [hx, hy, w] = head, sway = Math.sin(t / 520) * 2;
    for (const side of [-1, 1]) {
      const bx = hx + side * w * 0.2, by = hy + 8, tx = hx + side * w * 0.62 + sway, ty = hy - w * 0.78, cx2 = hx + side * w * 0.12, cy2 = hy - w * 0.5;
      c.strokeStyle = rgb(dk(parts, 0.15)); c.lineWidth = 3.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(cx2, cy2, tx, ty); c.stroke();
      c.strokeStyle = rgb(lt(parts, 0.25)); c.lineWidth = 1.8;
      for (let i = 2; i <= 6; i++) { const u = i / 7, a = 1 - u, px = a * a * bx + 2 * a * u * cx2 + u * u * tx, py = a * a * by + 2 * a * u * cy2 + u * u * ty, l = 4 + i * 0.6;
        c.beginPath(); c.moveTo(px, py); c.lineTo(px + side * l, py + l * 0.35); c.moveTo(px, py); c.lineTo(px - side * l * 0.5, py - l * 0.6); c.stroke(); }
      const pulse = 0.75 + 0.25 * Math.sin(t / 300 + side), gr = c.createRadialGradient(tx, ty, 0, tx, ty, 11);
      gr.addColorStop(0, rgba(lt(acc, 0.5), 0.9 * pulse)); gr.addColorStop(1, rgba(acc, 0));
      c.fillStyle = gr; c.beginPath(); c.arc(tx, ty, 11, 0, 7); c.fill();
      c.fillStyle = rgb(lt(acc, 0.35)); c.beginPath(); c.arc(tx, ty, 4.2, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(tx - 1.3, ty - 1.3, 1.5, 0, 7); c.fill();
    }
  }
  /* Haloed: a gold ring floating over the head, above any hat */
  const HAT_H = { 'Top hat': 0.62, 'Party hat': 0.72, Crown: 0.42, Cap: 0.44, Bow: 0.05 };
  function halo(c, head, hat, t, up = 0) {
    const [hx, hy, w] = head, y = hy - up - (HAT_H[hat] || 0) * w - 13 + Math.sin(t / 450) * 2, rx = Math.max(16, w * 0.4), ry = rx * 0.3;
    c.save(); c.shadowColor = 'rgba(255,214,90,.95)'; c.shadowBlur = 14;
    c.strokeStyle = '#e9b52f'; c.lineWidth = 6; c.beginPath(); c.ellipse(hx, y, rx, ry, 0, 0, 7); c.stroke(); c.restore();
    c.strokeStyle = '#ffe58a'; c.lineWidth = 3; c.beginPath(); c.ellipse(hx, y - 1, rx, ry, 0, 0, 7); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(hx, y - 1.5, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
  }
  /* Shelled: a spiked shell on the back; from the front only its rim and spikes show round the body */
  function shell(c, g, parts, over) {
    const cx = g.cx, rx = g.bw * (over ? 0.46 : 0.57), ry = Math.min(g.bh * (over ? 0.44 : 0.56), rx * (over ? 0.85 : 0.82)), cy = g.top + Math.max(g.bh * (over ? 0.48 : 0.42), ry * 0.85);
    const sc = mix(dk(parts, 0.1), [120, 96, 70], 0.25), bone = mix([240, 228, 204], parts, 0.15);
    for (const a of [-2.55, -2.05, -1.57, -1.09, -0.59, -3.05, -0.09]) {
      const ex = cx + Math.cos(a) * rx * 0.94, ey = cy + Math.sin(a) * ry * 0.94, l = over ? 11 : 13, nx = Math.cos(a), ny = Math.sin(a);
      c.fillStyle = rgb(dk(bone, 0.3)); c.beginPath(); c.moveTo(ex - ny * 6, ey + nx * 6 + 2); c.lineTo(ex + nx * l, ey + ny * l + 2); c.lineTo(ex + ny * 6, ey - nx * 6 + 2); c.closePath(); c.fill();
      c.fillStyle = rgb(bone); c.beginPath(); c.moveTo(ex - ny * 6, ey + nx * 6); c.lineTo(ex + nx * l, ey + ny * l); c.lineTo(ex + ny * 6, ey - nx * 6); c.closePath(); c.fill();
    }
    c.fillStyle = rgb(dk(sc, 0.35)); c.beginPath(); c.ellipse(cx, cy + 4, rx, ry, 0, 0, 7); c.fill();
    c.fillStyle = rgb(sc); c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fill();
    if (over) {                    // seen from behind: plates on the shell
      c.strokeStyle = rgb(dk(sc, 0.3)); c.lineWidth = 2.5;
      c.beginPath(); c.ellipse(cx, cy, rx * 0.45, ry * 0.45, 0, 0, 7); c.stroke();
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.5; c.beginPath(); c.moveTo(cx + Math.cos(a) * rx * 0.45, cy + Math.sin(a) * ry * 0.45); c.lineTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.ellipse(cx, cy, rx * 0.8, ry * 0.8, 0, Math.PI * 1.15, Math.PI * 1.45); c.stroke();
    }
  }
  /* Winged: small feathered wings in the body's colours, flapping quicker than worn wings */
  function markWings(c, g, body, parts, t, wy = 0.42) {
    const y = g.top + g.bh * wy, flap = Math.sin(t / 110) * 0.18, W = Math.max(24, g.bw * 0.3);
    for (const sd of [-1, 1]) {
      c.save(); c.translate(g.cx + sd * g.bw * 0.38, y); c.scale(sd, 1); c.rotate(-0.45 + flap);
      for (let k = 2; k >= 0; k--) {
        c.fillStyle = rgb(k === 0 ? lt(body, 0.45) : k === 1 ? lt(body, 0.25) : parts);
        c.beginPath(); c.ellipse(W * (0.42 + k * 0.1), -W * 0.1 + k * W * 0.17, W * (0.6 - k * 0.1), W * 0.2, -0.5 + k * 0.2, 0, 7); c.fill();
      }
      c.restore();
    }
  }
  function marksBehind(c, m, g, head, t, wingY) {
    if (m.stage === 'Bit') return;
    const mk = m.marks || [], P = m.pal;
    if (mk.includes('Shelled') && !m.back) shell(c, g, P.parts, false);
    if (mk.includes('Winged') && !(m.worn || {}).back && !m.back) markWings(c, g, P.body, P.parts, t, wingY);
    if (mk.includes('Sage')) feelers(c, head, P.accent, P.parts, t);
    if (mk.includes('Horned')) horns(c, head, lt(P.parts, 0.5));
  }
  function marksOver(c, m, g, head, t, wingY, haloUp = 0) {
    if (m.stage === 'Bit') return;
    const mk = m.marks || [], P = m.pal;
    if (m.back && mk.includes('Shelled')) shell(c, g, P.parts, true);
    if (m.back && mk.includes('Winged') && !(m.worn || {}).back) markWings(c, g, P.body, P.parts, t, wingY);
    if (mk.includes('Haloed')) halo(c, head, (m.worn || {}).head, t, Math.max(haloUp, mk.includes('Horned') ? 16 : 0, mk.includes('Sage') ? 20 : 0));
  }
  const bellyOn = (c, m, g, body) => { if (m.stage === 'Bit' || m.back || !(m.marks || []).includes('Stout')) return;
    // Booly's mouth sits low on its cone, so a pale oval there read as a beard: its belly is a soft glow down at the base instead
    if (m.family === 'Booly') { const cy = g.top + g.bh * 0.97, rx = g.bw * 0.42, gr = c.createRadialGradient(g.cx, cy, 2, g.cx, cy, rx);
      gr.addColorStop(0, rgb(lt(body, 0.32))); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.save(); c.fillStyle = gr; c.translate(g.cx, cy); c.scale(1, 0.42); c.translate(-g.cx, -cy); c.beginPath(); c.arc(g.cx, cy, rx, 0, 7); c.fill(); c.restore(); return; }
    c.fillStyle = rgb(lt(body, 0.6)); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.82, g.bw * 0.34, g.bh * 0.24, 0, 0, 7); c.fill(); };
  /* variant pieces: behind the body, on it, and in front */
  function variantBehind(c, pathFn, g, body, t) {
    if (VAR === 'Devoted') { const p = 0.8 + 0.2 * Math.sin(t / 420); aura(c, pathFn, [255, 176, 196], 0.5 * p, 14, 30); aura(c, pathFn, [255, 220, 200], 0.45 * p, 6, 12); }
    if (VAR === 'Scruffy') {
      c.fillStyle = rgb(dk(body, 0.12));
      const tuft = (x, y, nx, ny) => { for (const o of [-6, 0, 6]) { const px = x - ny * o, py = y + nx * o, l = 9 + (o ? 0 : 4);
        c.beginPath(); c.moveTo(px - ny * 4, py + nx * 4); c.lineTo(px + nx * l + ny * o * 0.3, py + ny * l - nx * o * 0.3); c.lineTo(px + ny * 4, py - nx * 4); c.closePath(); c.fill(); } };
      for (const fx of [0.2, 0.5, 0.8]) { const x = g.left + g.bw * fx, y = edgeY(c, pathFn, g, x, true); if (y != null) tuft(x, y + 3, 0, -1); }
      for (const side of [-1, 1]) for (const fy of [0.35, 0.7]) { const y = g.top + g.bh * fy; tuft(edgeX(c, pathFn, g, y, side) - side * 3, y, side, 0); }
    }
  }
  function variantOn(c, g) {
    if (VAR === 'Scruffy') { c.fillStyle = 'rgba(110,80,50,.35)'; for (const [fx, fy, r] of [[0.28, 0.75, 4], [0.7, 0.55, 3], [0.62, 0.86, 3.5]]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, r, 0, 7); c.fill(); } }
  }
  function variantOutline(c, pathFn) { if (VAR !== 'Feral') return; c.save(); c.strokeStyle = 'rgba(24,14,18,.92)'; c.lineWidth = 3.4; c.lineJoin = 'round'; pathFn(); c.stroke(); c.restore(); }
  function variantFront(c, g, t, back) {
    if (VAR === 'Champion' && !back) {         // a gold medal on a ribbon
      const k = Math.max(1.25, Math.min(1.7, g.bw / 70)), x = g.cx + g.bw * 0.3, y = g.top + g.bh * 0.78;
      c.save(); c.translate(x, y); c.scale(k, k);
      c.fillStyle = '#3b6fb8'; c.beginPath(); c.moveTo(-7, -13); c.lineTo(-1, -1); c.lineTo(-7, -1); c.closePath(); c.fill();
      c.fillStyle = '#e2483f'; c.beginPath(); c.moveTo(7, -13); c.lineTo(1, -1); c.lineTo(7, -1); c.closePath(); c.fill();
      c.fillStyle = '#b8861e'; c.beginPath(); c.arc(0, 3, 7.5, 0, 7); c.fill(); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(0, 2, 7, 0, 7); c.fill();
      star(c, 0, 2, 0.42, '#fff3c0'); c.restore();
    }
    if (VAR === 'Champion' && back) { const x = g.cx, y = g.top + g.bh * 0.42; star(c, x, y + 2, 1.5, '#b8861e'); star(c, x, y, 1.45, '#ffd23f'); star(c, x - 1, y - 1, 0.5, '#fff3c0'); }
    if (VAR === 'Pampered') for (let k = 0; k < 2; k++) { const ph = (t / 1600 + k / 2) % 1, tw = Math.sin(ph * Math.PI);
      star(c, g.cx + (k ? 1 : -1) * g.bw * 0.52, g.top + g.bh * (0.15 + k * 0.25) - ph * 10, 0.5 * tw + 0.1, 'rgba(255,214,240,.95)'); }
    if (VAR === 'Devoted') { const ph = (t / 2200) % 1; if (ph < 0.8) { c.globalAlpha = 1 - ph / 0.8; heart(c, g.cx + g.bw * 0.46 + Math.sin(ph * 9) * 3, g.top + 6 - ph * 34, 0.5, rgb(BLUSH)); c.globalAlpha = 1; } }
    if (VAR === 'Moonlit') for (let k = 0; k < 3; k++) { const a = t / 900 + k * 2.1, tw = 0.5 + 0.5 * Math.sin(t / 260 + k * 3);
      star(c, g.cx + Math.cos(a) * g.bw * 0.6, g.top + g.bh * 0.3 + Math.sin(a) * g.bh * 0.5, 0.25 + tw * 0.2, 'rgba(220,228,255,.9)'); }
  }

  /* ---------- effects ----------
     Each effect works on the body itself: an aura around the outline (behind), a tint on the body (on), and pieces that
     cling to or leave the body (front). pathFn rebuilds the body outline. */
  const vivid = col => { const m = Math.max(...col) || 1, v = col.map(c2 => Math.round(c2 * 255 / m)); return Math.min(...col) > 190 ? [255, 196, 70] : mix(v, [255, 255, 255], 0.15); };
  /* the body's top or bottom edge at x, found by testing points against the outline */
  function edgeY(c, pathFn, g, x, fromTop) {
    pathFn(); const M = c.getTransform();
    for (let i = 0; i <= 90; i++) { const y = fromTop ? g.top - 50 + i * 2.5 : g.bot + 30 - i * 2.5, p = M.transformPoint({ x, y }); if (c.isPointInPath(p.x, p.y)) return y; }
    return null;
  }
  function edgeX(c, pathFn, g, y, side) {
    pathFn(); const M = c.getTransform();
    for (let i = 0; i <= 80; i++) { const x = g.cx + side * (g.bw / 2 + 30 - i * 2.5), p = M.transformPoint({ x, y }); if (c.isPointInPath(p.x, p.y)) return x; }
    return g.cx + side * g.bw / 2;
  }
  const aura = (c, pathFn, col, a, w, blur) => { c.save(); c.shadowColor = rgba(col, 0.95); c.shadowBlur = blur; c.strokeStyle = rgba(col, a); c.lineWidth = w; c.lineJoin = 'round'; pathFn(); c.stroke(); c.restore(); };
  function fxBehind(c, fx, pathFn, g, body, t) {
    const pulse = 0.8 + 0.2 * Math.sin(t / 380);
    if (fx === 'glow') { const hc = vivid(body); aura(c, pathFn, hc, 0.55 * pulse, 18, 34); aura(c, pathFn, hc, 0.5 * pulse, 8, 14); }
    if (fx === 'flame') {
      aura(c, pathFn, [255, 110, 30], 0.55, 14, 26);
      for (let k = 0; k < 7; k++) { const x = g.left + g.bw * (0.12 + k * 0.127), top = edgeY(c, pathFn, g, x, true); if (top == null) continue;
        const h = (16 + (k % 3) * 7) * (1 + 0.25 * Math.sin(t / 90 + k * 2.3)), w = 15 + (k % 2) * 5;
        const gr = c.createLinearGradient(0, top + 8, 0, top - h); gr.addColorStop(0, 'rgba(235,70,30,.95)'); gr.addColorStop(0.55, 'rgba(255,150,40,.95)'); gr.addColorStop(1, 'rgba(255,226,100,.95)');
        c.fillStyle = gr; flame(c, x + Math.sin(t / 130 + k) * 1.5, top + 10, w, h + 10); c.fill(); }
    }
    if (fx === 'shadow') {
      aura(c, pathFn, [40, 20, 70], 0.6, 16, 26);
      c.save(); c.lineCap = 'round'; c.shadowColor = 'rgba(30,14,54,.9)'; c.shadowBlur = 10;
      for (let k = 0; k < 5; k++) {           // smoke curls off the outline, fading as it rises
        const x0 = g.left + g.bw * (0.12 + k * 0.19), top = edgeY(c, pathFn, g, x0, true); if (top == null) continue;
        const ph = (t / 1800 + k / 5) % 1, len = 18 + ph * 22, sw = Math.sin(t / 380 + k * 1.9) * 6, dir = k % 2 ? 1 : -1;
        c.strokeStyle = rgba([40, 20, 70], 0.55 * (1 - ph)); c.lineWidth = 11 - ph * 6;
        c.beginPath(); c.moveTo(x0, top + 6); c.bezierCurveTo(x0 + dir * 10 + sw, top - len * 0.3, x0 - dir * 8 - sw, top - len * 0.65, x0 + dir * 6 + sw, top - len); c.stroke();
      }
      c.restore();
    }
    if (fx === 'frost') aura(c, pathFn, [150, 215, 255], 0.75, 12, 22);
  }
  /* called with the body outline already clipped */
  function fxOnBody(c, fx, pathFn, g, body, t) {
    if (fx === 'glow') { c.strokeStyle = rgba(lt(vivid(body), 0.45), 0.75); c.lineWidth = 10; pathFn(); c.stroke(); }
    if (fx === 'flame') { const gr = c.createLinearGradient(0, g.bot, 0, g.top + g.bh * 0.35); gr.addColorStop(0, 'rgba(255,110,30,.5)'); gr.addColorStop(1, 'rgba(255,110,30,0)'); c.fillStyle = gr; c.fillRect(g.left - 20, g.top - 60, g.bw + 40, g.bh + 90); }
    if (fx === 'shadow') { const gr = c.createLinearGradient(0, g.bot, 0, g.top + g.bh * 0.3); gr.addColorStop(0, 'rgba(26,12,46,.6)'); gr.addColorStop(1, 'rgba(26,12,46,0)'); c.fillStyle = gr; c.fillRect(g.left - 20, g.top - 60, g.bw + 40, g.bh + 90);
      c.strokeStyle = 'rgba(26,12,46,.35)'; c.lineWidth = 8; pathFn(); c.stroke(); }
    if (fx === 'frost') { const gr = c.createLinearGradient(0, g.top, 0, g.bot); gr.addColorStop(0, 'rgba(225,245,255,.55)'); gr.addColorStop(0.45, 'rgba(190,230,255,.12)'); gr.addColorStop(1, 'rgba(160,215,255,.45)');
      c.fillStyle = gr; c.fillRect(g.left - 20, g.top - 60, g.bw + 40, g.bh + 90); c.strokeStyle = 'rgba(235,250,255,.85)'; c.lineWidth = 7; pathFn(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.6;      // frost crystals on the sides
      for (const [fx2, fy] of [[0.12, 0.62], [0.88, 0.56], [0.2, 0.85], [0.8, 0.82]]) { const x = g.left + g.bw * fx2, y = g.top + g.bh * fy;
        for (let a = 0; a < 3; a++) { const an = a * Math.PI / 3; c.beginPath(); c.moveTo(x - Math.cos(an) * 6, y - Math.sin(an) * 6); c.lineTo(x + Math.cos(an) * 6, y + Math.sin(an) * 6); c.stroke(); } } }
  }
  function fxFront(c, fx, pathFn, g, t) {
    if (fx === 'sparkle') for (let k = 0; k < 7; k++) { const a = k * 0.9 + 0.3, tw = (Math.sin(t / 240 + k * 1.7) + 1) / 2;
      star(c, g.cx + Math.cos(a) * g.bw * 0.62, g.top + g.bh * 0.45 + Math.sin(a) * g.bh * 0.66, 0.35 + tw * 0.55, k % 2 ? '#ffd23f' : '#ffe98a'); }
    if (fx === 'flame') {
      for (const side of [-1, 1]) { const y = g.top + g.bh * 0.62, x = edgeX(c, pathFn, g, y, side), h = 20 * (1 + 0.25 * Math.sin(t / 80 + side));   // licks up the sides, in front
        const gr = c.createLinearGradient(0, y + 6, 0, y - h); gr.addColorStop(0, 'rgba(240,80,30,.95)'); gr.addColorStop(1, 'rgba(255,214,90,.95)');
        c.fillStyle = gr; c.save(); c.translate(x, y); c.rotate(side * 0.35); flame(c, 0, 6, 13, h); c.fill(); c.restore(); }
      for (let k = 0; k < 8; k++) { const ph = (t / 1500 + k / 8) % 1, x = g.cx + Math.sin(k * 2.4) * g.bw * 0.5 + Math.sin(ph * 7 + k) * 5, y = g.top + g.bh * 0.3 - ph * 60;
        c.fillStyle = `rgba(255,${150 + (k % 3) * 35},60,${1 - ph})`; c.beginPath(); c.arc(x, y, 2.2 * (1 - ph * 0.5), 0, 7); c.fill(); }
    }
    if (fx === 'shadow') for (let k = 0; k < 5; k++) { const ph = (t / 2000 + k / 5) % 1, x = g.cx + Math.sin(k * 2.1) * g.bw * 0.45, y = g.top + g.bh * 0.4 - ph * 70;
      c.fillStyle = `rgba(60,30,100,${0.8 * (1 - ph)})`; c.save(); c.translate(x + Math.sin(ph * 6 + k) * 6, y); c.rotate(ph * 3); c.fillRect(-2.5, -2.5, 5, 5); c.restore(); }
    if (fx === 'frost') {
      for (let k = 0; k < 5; k++) { const x = g.left + g.bw * (0.2 + k * 0.15), bot = edgeY(c, pathFn, g, x, false); if (bot == null) continue;   // icicles under the bottom edge
        const len = 8 + (k % 2) * 6; c.fillStyle = 'rgba(190,230,255,.95)'; c.beginPath(); c.moveTo(x - 4, bot - 2); c.lineTo(x + 4, bot - 2); c.lineTo(x, bot + len); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(x - 1.5, bot - 1, 1.5, len * 0.6); }
      for (let k = 0; k < 8; k++) { const ph = ((t / 2600) + k / 8) % 1, x = g.cx - g.bw * 0.65 + (k * 37 % 100) / 100 * g.bw * 1.3 + Math.sin(ph * 6 + k) * 4, y = g.top - 24 + ph * (g.bh + 40);
        star(c, x, y, 0.7, 'rgba(80,150,225,.95)'); star(c, x, y, 0.38, '#ffffff'); }
    }
  }

  /* ---------- the other families: one body path each, plus what hangs off it ---------- */
  function lid(c, x, ey, s, side, look, col) {
    c.save(); c.beginPath(); c.ellipse(x + look[0] * 2.5 * s, ey + look[1] * 2 * s, 9.2 * s, 10.8 * s, 0, 0, 7); c.clip();
    c.fillStyle = col; c.beginPath(); c.moveTo(x - 12 * s * side, ey - 14 * s); c.lineTo(x + 12 * s * side, ey - 14 * s);
    c.lineTo(x + 12 * s * side, ey - 10 * s); c.lineTo(x - 12 * s * side, ey - 4 * s); c.closePath(); c.fill(); c.restore();
  }
  function smallMouth(c, cx, my, s, open, fang, frown) {
    c.strokeStyle = rgb(INK); c.fillStyle = rgb(INK); c.lineCap = 'round'; c.lineWidth = 3.6 * s;
    if (frown) { c.beginPath(); c.moveTo(cx - 6 * s, my + 4 * s); c.quadraticCurveTo(cx, my - 2 * s, cx + 6 * s, my + 4 * s); c.stroke(); return; }
    if (fang === 'ouch') { roundBox(c, cx - 9 * s, my - 2 * s, 18 * s, 9 * s, 3.5 * s); c.fill();          // gritted teeth
      c.strokeStyle = '#fff'; c.lineWidth = 1.8 * s; c.lineJoin = 'round'; c.beginPath(); c.moveTo(cx - 7 * s, my + 2.5 * s);
      for (let k = 1; k <= 6; k++) c.lineTo(cx - 7 * s + k * 14 * s / 6, my + (k % 2 ? 0.5 : 4.5) * s); c.stroke(); return; }
    if (fang === 'two' && open < 0.2) { c.beginPath(); c.moveTo(cx - 7 * s, my); c.quadraticCurveTo(cx, my + 7 * s, cx + 7 * s, my); c.stroke();
      c.fillStyle = '#fff'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(cx + sd * 1.5 * s, my + 2.8 * s); c.lineTo(cx + sd * 6 * s, my + 1.4 * s); c.lineTo(cx + sd * 4.2 * s, my + 7.5 * s); c.closePath(); c.fill(); }
      return; }
    if (open < 0.2) { c.beginPath(); c.moveTo(cx - 7 * s, my); c.quadraticCurveTo(cx, my + 7 * s, cx + 7 * s, my); c.stroke();
      if (fang) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(cx + 1.5 * s, my + 2.6 * s); c.lineTo(cx + 6 * s, my + 1.2 * s); c.lineTo(cx + 4.4 * s, my + 6.5 * s); c.closePath(); c.fill(); }
      return; }
    const h = (6 + open * 10) * s; c.save(); c.beginPath(); c.moveTo(cx - 9 * s, my - 1); c.quadraticCurveTo(cx, my - 3 * s, cx + 9 * s, my - 1);
    c.quadraticCurveTo(cx, my + h * 1.6, cx - 9 * s, my - 1); c.closePath(); c.fill(); c.clip();
    c.fillStyle = rgb(TONGUE); c.beginPath(); c.ellipse(cx, my + h, 6 * s, 4.5 * s, 0, 0, 7); c.fill();
    if (fang) { c.fillStyle = '#fff'; for (const sd of fang === 'two' ? [-1, 1] : [1]) { c.beginPath(); c.moveTo(cx + sd * 2 * s, my - 1); c.lineTo(cx + sd * 7 * s, my - 1); c.lineTo(cx + sd * 4.5 * s, my + 4 * s); c.closePath(); c.fill(); } }
    c.restore();
  }
  /* two eyes, blush and a small mouth; o: ey, ex, my, s as fractions of the body */
  function faceTwo(c, g, x, look, o) {
    const s = o.s, ey = g.top + g.bh * o.ey, ex = g.bw * o.ex, my = g.top + g.bh * o.my;
    c.fillStyle = rgba(BLUSH, 0.7);
    for (const side of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + side * (ex + 9 * s), ey + 12 * s, 7 * s, 4.2 * s, 0, 0, 7); c.fill(); }
    const eyes = x.P.eyes === 'open' && (x.stage === 'Mega' || VAR === 'Feral') ? 'fierce' : x.P.eyes;
    LIDC = rgb(o.lidCol || x.body); eye(c, g.cx - ex, ey, s, eyes, -1, look); eye(c, g.cx + ex, ey, s, eyes, 1, look);
    capFace(c, g.cx, ey, ex, my, false);
    if (eyes === 'fierce') for (const side of [-1, 1]) lid(c, g.cx + side * ex, ey, s, side, look, rgb(o.lidCol || x.body));
    if (o.extraEyes) for (const side of [-1, 1]) eye(c, g.cx + side * g.bw * o.extraEyes, ey - 7 * s, s * 0.45, eyes === 'fierce' ? 'open' : eyes, side, look);
    smallMouth(c, g.cx, my, s, x.open, x.P.ouch ? 'ouch' : VAR === 'Feral' ? 'two' : x.stage === 'Mega' || o.fang, x.P.frown);
    if (o.chelicerae) { c.fillStyle = rgb(lt(x.parts, 0.6)); for (const side of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + side * 3 * s, my + 5 * s); c.lineTo(g.cx + side * 8 * s, my + 5 * s); c.lineTo(g.cx + side * 5 * s, my + 11 * s); c.closePath(); c.fill(); } }
    return { my, ey, ex, s, cx: g.cx };
  }
  /* a crab claw at the end of an arm, opening outward; side flips it for the left arm */
  function claw(c, x, y, ang, sz, col, side, serrate) {
    if (CAP) (CAP.hands = CAP.hands || []).push(capPt(c, x, y));
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

  /* a stumpy pillar leg for Plod; back legs sit higher and darker so the body reads as having depth; dark = how much darker the leg is */
  function PLODLEG(c, g, x, lx, mat, i, back, dark = 0) {
    const lw = by(g.stage, 13, 15, 18) * (back ? 0.85 : 1), lift = Math.max(0, Math.sin(x.t / 150 + i * Math.PI / 2)) * 5 * Math.abs(x.walk);
    const col = dk(x.parts, (back ? 0.18 : 0) + dark), fy = (back ? 177 : 182) - lift;
    limb(c, [lx, g.bot - 12, lx, (g.bot + fy) / 2, lx, fy - 2], lw, col, mat, x.t); blob(c, lx, fy, lw * 0.66, lw * 0.42, col, mat, x.t, 'foot'); x.feet.push([lx, fy, lw * 0.58]);
  }
  const FAM = {
    /* round dome with a scalloped hem, standing on tentacles */
    Squib: {
      dims: { Bit: [76, 56], Byte: [98, 70], Mega: [118, 84] }, slots: { feet: false }, tl: st => by(st, 18, 26, 34),
      bottom(st) { return 184 - this.tl(st); }, height(st) { return this.dims[st][1] + this.tl(st) + 6; },
      path(c, g) { const R = g.left + g.bw, n = by(g.stage, 3, 4, 5), w = g.bw / n;
        c.beginPath(); c.moveTo(g.left, g.bot); c.bezierCurveTo(g.left, g.bot - g.bh * 1.33, R, g.bot - g.bh * 1.33, R, g.bot);
        for (let i = 0; i < n; i++) c.quadraticCurveTo(R - (i + 0.5) * w, g.bot + 9, R - (i + 1) * w, g.bot); c.closePath(); },
      behind(c, g, x) { const n = by(g.stage, 3, 4, 5), w = g.bw / n, tl = this.tl(g.stage), lw = by(g.stage, 9, 10, 11);
        for (let i = 0; i < n; i++) { const tx = g.left + (i + 0.5) * w, sw = Math.sin(x.t / 260 + i * 1.3) * 4 + x.walk * 3, curl = (i < n / 2 ? -1 : 1) * 7;
          const mat = i < n / 2 ? x.L.legL : x.L.legR, L = x.P.lash && i === 0 ? x.P.lash : 0;
          const ex = tx + curl + sw * 0.5 - L * 70, ey = 182 - L * (182 - g.bot + g.bh * 0.35);
          limb(c, [tx, g.bot - 4, tx + sw - L * 30, g.bot + tl * 0.55 - L * 30, ex, ey], lw, x.parts, mat, x.t);
          blob(c, ex, ey, lw * 0.55, lw * 0.55, x.parts, mat, x.t, 'hand'); } },
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
      behind(c, g, x) { this.ants(c, g, x); this.legs(c, g, x); },
      ants(c, g, x) {
        const al = this.al(g.stage), ants = g.stage === 'Mega' ? [-0.42, 0.42] : [0.28];
        c.strokeStyle = rgb(dk(x.parts, 0.15)); c.lineWidth = 4; c.lineCap = 'round';
        for (const a of ants) { const bx = g.cx + a * 12, tx = g.cx + Math.sin(a) * al * 1.2 + Math.sin(x.t / 500) * 1.5, ty = g.top - al;
          c.beginPath(); c.moveTo(bx, g.top + 6); c.lineTo(tx, ty); c.stroke(); c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(tx, ty, by(g.stage, 4.5, 5.5, 6), 0, 7); c.fill(); } },
      legs(c, g, x) {
        const ll = this.ll(g.stage), lw = by(g.stage, 7, 8, 9);
        [[-1, x.L.legL, 0], [1, x.L.legR, 1]].forEach(([side, mat, i]) => { const hx = g.cx + side * g.bw * 0.22, lift = [Math.max(0, x.walk), Math.max(0, -x.walk)][i] * 5;
          limb(c, [hx, g.bot - 6, hx, g.bot + ll * 0.5, hx + x.P.feet[i * 2], 181 - lift], lw, x.parts, mat, x.t);
          blob(c, hx + x.P.feet[i * 2], 182 - lift, by(g.stage, 9, 11, 12), by(g.stage, 5.5, 6.5, 7), x.parts, mat, x.t, 'foot'); x.feet.push([hx + x.P.feet[i * 2], 182 - lift, by(g.stage, 8, 9, 10)]); });
      },
      backInside(c, g, x) {          // the back of the set: a vented panel and a plug
        roundBox(c, g.left + g.bw * 0.16, g.top + g.bh * 0.16, g.bw * 0.68, g.bh * 0.6, 10); c.fillStyle = rgb(dk(x.body, 0.12)); c.fill();
        c.strokeStyle = rgb(dk(x.body, 0.32)); c.lineWidth = 3; c.lineCap = 'round';
        for (let k = 0; k < 4; k++) { const yy = g.top + g.bh * (0.26 + k * 0.12); c.beginPath(); c.moveTo(g.cx - g.bw * 0.22, yy); c.lineTo(g.cx + g.bw * 0.22, yy); c.stroke(); }
        c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(g.cx, g.top + g.bh * 0.86, 4.5, 0, 7); c.fill(); },
      inside(c, g, x) { if (g.stage === 'Bit') return;
        roundBox(c, g.left + g.bw * 0.12, g.top + g.bh * 0.12, g.bw * 0.76, g.bh * 0.58, 14); c.fillStyle = rgb(lt(x.body, 0.66)); c.fill();
        c.strokeStyle = rgb(dk(x.body, 0.22)); c.lineWidth = 3; c.stroke();
        if (g.stage === 'Mega') { c.fillStyle = rgb(x.acc); for (const k of [0, 1]) { c.beginPath(); c.arc(g.left + g.bw * (0.7 + k * 0.13), g.top + g.bh * 0.84, 4.5, 0, 7); c.fill(); }
          c.strokeStyle = rgb(dk(x.body, 0.25)); c.lineWidth = 2.5; for (let k = 0; k < 3; k++) { const yy = g.top + g.bh * (0.78 + k * 0.06); c.beginPath(); c.moveTo(g.left + g.bw * 0.16, yy); c.lineTo(g.left + g.bw * 0.42, yy); c.stroke(); } } },
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Bit' ? { ey: 0.42, ex: 0.18, my: 0.64, s: 0.8 } : { ey: 0.35, ex: 0.16, my: 0.55, s: by(g.stage, 0.8, 0.88, 0.92), lidCol: lt(x.body, 0.66) })
    },
    /* a soft oval with one big eye, on three stubby roots */
    Moko: {
      dims: { Bit: [70, 72], Byte: [90, 94], Mega: [104, 112] }, head: g => [g.cx, g.top + 4, g.bw * 0.46],
      bottom() { return 174; }, height(st) { return this.dims[st][1] + 14; },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      arms: 'stub', armW: st => by(st, 0, 7, 8), handR: st => by(st, 0, 5.5, 6.5), shoulderY: 0.58, armK: 0.9, shoulderIn: 0.06,
      behind(c, g, x) { const lw = by(g.stage, 10, 12, 13);
        [-0.24, 0, 0.24].forEach((k, i) => { const fx = g.cx + k * g.bw, sw = (i - 1) * 3 + Math.sin(x.t / 300 + i) * 1.5 + x.walk * (i - 1) * 3, mat = k < 0 ? x.L.legL : k > 0 ? x.L.legR : null;
          limb(c, [fx, g.bot - 10, fx + sw, 178, fx + sw * 1.4, 182], lw, x.parts, mat, x.t);
          blob(c, fx + sw * 1.4, 182, lw * 0.6, lw * 0.5, x.parts, mat, x.t, 'foot'); x.feet.push([fx + sw * 1.4, 183, lw * 0.6]); }); },
      face(c, g, x, look) {
        const s = by(g.stage, 1.45, 1.75, 2.0), ey = g.top + g.bh * 0.42, my = g.top + g.bh * 0.72, e = x.P.eyes;
        capFace(c, g.cx, ey, 0, my, true);
        c.fillStyle = rgba(BLUSH, 0.7); for (const side of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + side * g.bw * 0.3, ey + 15 * s * 0.55, 7.5, 4.5, 0, 0, 7); c.fill(); }
        if ((e === 'open' && g.stage === 'Mega') || e === 'fierce') {          // the Mega's eye gets a coloured iris and a slanted lid
          const lx = look[0] * 4, ly = look[1] * 3;
          c.fillStyle = '#fff'; c.beginPath(); c.ellipse(g.cx, ey, 10.5 * s, 11.5 * s, 0, 0, 7); c.fill(); c.strokeStyle = rgb(INK); c.lineWidth = 3; c.stroke();
          c.fillStyle = rgb(mix(x.acc, x.body, 0.35)); c.beginPath(); c.arc(g.cx + lx, ey + ly, 7.2 * s, 0, 7); c.fill();
          c.fillStyle = rgb(INK); c.beginPath(); c.arc(g.cx + lx, ey + ly, 4 * s, 0, 7); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(g.cx + lx + 2.6 * s, ey + ly - 2.8 * s, 2.2 * s, 0, 7); c.fill(); c.beginPath(); c.arc(g.cx + lx - 2.4 * s, ey + ly + 2.6 * s, 1 * s, 0, 7); c.fill();
          c.save(); c.beginPath(); c.ellipse(g.cx, ey, 10.5 * s, 11.5 * s, 0, 0, 7); c.clip(); c.fillStyle = rgb(x.body); c.fillRect(g.cx - 12 * s, ey - 13 * s, 24 * s, 5 * s); c.restore();
        } else if (e === 'hurt') { eye(c, g.cx - 7 * s * 0.55, ey, s * 0.6, 'hurt', -1, look); eye(c, g.cx + 7 * s * 0.55, ey, s * 0.6, 'hurt', 1, look); }
        else { LIDC = rgb(x.body); eye(c, g.cx, ey, s, e, e === 'droopy' ? 0 : 1, look); }
        smallMouth(c, g.cx, my, by(g.stage, 0.85, 0.95, 1), x.open, x.P.ouch ? 'ouch' : g.stage === 'Mega', x.P.frown);
        return { my, ey, ex: 0, s: s * 0.55, one: true, cx: g.cx };
      }
    },
    /* a crab shell, widest across the shoulders and narrowing to the bottom, with claws and short pointed legs */
    Pinch: {
      dims: { Bit: [78, 56], Byte: [100, 70], Mega: [118, 82] }, slots: { feet: false },
      bottom() { return 172; }, height(st) { return this.dims[st][1] + 18 + by(st, 0, 14, 22); },
      path(c, g) { const L = g.left, R = L + g.bw, T = g.top, B = g.bot, w = g.bw, h = g.bh;
        c.beginPath(); c.moveTo(L + w * 0.04, T + h * 0.42);
        c.quadraticCurveTo(L - w * 0.02, T + h * 0.06, L + w * 0.28, T + h * 0.02);
        c.quadraticCurveTo(g.cx, T - h * 0.1, R - w * 0.28, T + h * 0.02);
        c.quadraticCurveTo(R + w * 0.02, T + h * 0.06, R - w * 0.04, T + h * 0.42);
        c.quadraticCurveTo(R - w * 0.02, T + h * 0.8, R - w * 0.22, B);
        c.quadraticCurveTo(g.cx, B + h * 0.1, L + w * 0.22, B);
        c.quadraticCurveTo(L + w * 0.02, T + h * 0.8, L + w * 0.04, T + h * 0.42); c.closePath(); },
      backInside(c, g, x) {          // the top of the shell: two ridges and a row of bumps
        c.strokeStyle = rgb(dk(x.body, 0.2)); c.lineWidth = 3; c.lineCap = 'round';
        for (const k of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + k * g.bw * 0.14, g.top + g.bh * 0.12); c.quadraticCurveTo(g.cx + k * g.bw * 0.26, g.top + g.bh * 0.5, g.cx + k * g.bw * 0.16, g.top + g.bh * 0.9); c.stroke(); }
        c.fillStyle = rgb(lt(x.body, 0.18)); for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(g.cx, g.top + g.bh * (0.25 + k * 0.22), 5 - k, 0, 7); c.fill(); } },
      inside(c, g, x) { if (g.stage === 'Bit') return;           // the shell's seam and, at Mega, its rim of points
        c.strokeStyle = rgb(dk(x.body, 0.18)); c.lineWidth = 2.6; c.beginPath(); c.moveTo(g.left + g.bw * 0.12, g.top + g.bh * 0.66); c.quadraticCurveTo(g.cx, g.top + g.bh * 0.8, g.left + g.bw * 0.88, g.top + g.bh * 0.66); c.stroke(); },
      front(c, g, x) { if (g.stage !== 'Mega') return;
        for (const sd of [-1, 1]) for (const fy of [0.22, 0.42]) { const px = g.cx + sd * (g.bw / 2 - 2), py = g.top + g.bh * fy;
          c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.moveTo(px - sd * 6, py - 5); c.lineTo(px + sd * 7, py + 1); c.lineTo(px - sd * 6, py + 7); c.closePath(); c.fill(); } },
      arms: 'claw', armW: st => by(st, 0, 8, 10), clawSz: st => by(st, 11, 16, 22), shoulderY: 0.55, armK: 0.75,
      behind(c, g, x) { const n = by(g.stage, 2, 2, 3), lw = by(g.stage, 6, 7, 8);
        for (const [side, mat] of [[-1, x.L.legL], [1, x.L.legR]]) for (let k = 0; k < n; k++) {
          const hx = g.cx + side * g.bw * (0.12 + k * 0.14), fx = g.cx + side * g.bw * (0.18 + k * 0.2), lift = Math.max(0, Math.sin(x.t / 110 + k * 2 + side)) * 4 * Math.abs(x.walk);
          limb(c, [hx, g.bot - 6, fx + side * 6, g.bot + 2, fx, 184 - lift], lw, x.parts, mat, x.t); } },
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.36, ex: 0.17, my: 0.58, s: by(g.stage, 0.8, 0.92, 0.98) })
    },
    /* a narrow capsule up on long jointed legs with bird feet at Mega */
    Stilt: {
      dims: { Bit: [50, 52], Byte: [60, 66], Mega: [68, 78] }, ll: st => by(st, 26, 40, 54),
      bottom(st) { return 180 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 8; },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw / 2); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.58, armK: 0.7,
      behind(c, g, x) { const ll = this.ll(g.stage), lw = by(g.stage, 6, 7, 8);
        [[-1, x.L.legL, 0], [1, x.L.legR, 1]].forEach(([side, mat, i]) => {
          const lift = [Math.max(0, x.walk), Math.max(0, -x.walk)][i] * 8, hx = g.cx + side * g.bw * 0.2, fy0 = x.P.feet[i * 2 + 1] || 0, kx = g.cx + side * g.bw * 0.42 + x.P.feet[i * 2] * 0.45, ky = g.bot + ll * 0.48 - lift * 0.5 + fy0 * 0.55, fx = g.cx + side * g.bw * 0.26 + x.P.feet[i * 2], fy = 181 - lift + fy0;
          limb(c, [hx, g.bot - 6, (hx + kx) / 2 + side * 2, (g.bot + ky) / 2, kx, ky], lw, x.parts, mat, x.t);
          limb(c, [kx, ky, (kx + fx) / 2 + side * 2, (ky + fy) / 2, fx, fy], lw, x.parts, mat, x.t);
          if (g.stage === 'Mega' && !mat) { c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(kx, ky, lw * 0.75, 0, 7); c.fill();
            c.strokeStyle = rgb(x.parts); c.lineWidth = 4; c.lineCap = 'round'; for (const a of [-0.9, 0, 0.9]) { c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + Math.sin(a) * 10, fy + 4 - Math.abs(a) * 2); c.stroke(); } }
          else blob(c, fx, fy + 1, by(g.stage, 8, 9, 10), 5, x.parts, mat, x.t, 'foot');
          x.feet.push([fx, fy + 1, by(g.stage, 7, 8, 9)]); }); },
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.36, ex: 0.2, my: 0.6, s: by(g.stage, 0.74, 0.8, 0.86) })
    },
    /* a flat body slung between spider legs, four eyes at Mega and no arms */
    Skit: {
      dims: { Bit: [80, 40], Byte: [104, 50], Mega: [126, 58] }, slots: { feet: false }, wingY: 0.05,
      bottom(st) { return by(st, 168, 166, 164); },
      backInside(c, g, x) {          // the marking on a spider's back
        c.fillStyle = rgb(lt(x.body, 0.3)); c.beginPath(); c.moveTo(g.cx, g.top + g.bh * 0.15); c.lineTo(g.cx + g.bw * 0.12, g.top + g.bh * 0.5); c.lineTo(g.cx, g.top + g.bh * 0.85); c.lineTo(g.cx - g.bw * 0.12, g.top + g.bh * 0.5); c.closePath(); c.fill();
        c.fillStyle = rgb(x.acc); for (const k of [-1, 1]) { c.beginPath(); c.arc(g.cx + k * g.bw * 0.26, g.top + g.bh * 0.5, 4, 0, 7); c.fill(); } }, height(st) { return 184 - (this.bottom(st) - this.dims[st][1]) + 6; },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bh * 0.5); },
      behind(c, g, x) { const n = by(g.stage, 2, 3, 4), lw = by(g.stage, 5, 5, 5.5);
        for (const [side, mat] of [[-1, x.L.legL], [1, x.L.legR]]) for (let k = n - 1; k >= 0; k--) {
          const f = n === 1 ? 0.5 : k / (n - 1), hx = g.cx + side * g.bw * (0.2 + f * 0.22), hy = g.bot - g.bh * 0.45;
          const kx = g.cx + side * (g.bw * 0.46 + 4 + f * 26), ky = g.top + g.bh * 0.35 - f * 22;
          const J = x.P.jab && side === -1 && k === (x.P.jabK != null ? x.P.jabK % n : n - 1) ? x.P.jab : 0;
          const lift = Math.max(0, Math.sin(x.t / 100 + k * 1.7 + side)) * 5 * Math.abs(x.walk), fx = g.cx + side * (g.bw * 0.34 + f * (g.bw * 0.3 + 30)) + side * J * 46, fy = 184 - lift - J * (184 - g.top - g.bh * 0.3);
          limb(c, [hx, hy, (hx + kx) / 2, ky - 8 - J * 14, kx + side * J * 10, ky - J * 18], lw, x.parts, mat, x.t);
          limb(c, [kx + side * J * 10, ky - J * 18, kx + side * (8 + J * 24), (ky + fy) / 2 - J * 10, fx, fy], lw, x.parts, mat, x.t);
          c.fillStyle = rgb(dk(x.parts, 0.2)); c.beginPath(); c.arc(fx, fy, lw * 0.5, 0, 7); c.fill(); } },
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.13, my: 0.72, s: by(g.stage, 0.72, 0.8, 0.86), extraEyes: g.stage === 'Mega' ? 0.27 : 0, chelicerae: g.stage === 'Mega' })
    },
    /* a tall cone that floats, ending in a curling ghost tail */
    Booly: {
      dims: { Bit: [60, 70], Byte: [76, 90], Mega: [90, 108] }, float: true, slots: { feet: false }, head: g => [g.cx, g.top + 9, g.bw * 0.42],
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
      /* Booly's own trait: a blue ghost flame that circles its head */
      front(c, g, x) {
        { const a = x.t / 900, wx = g.cx + Math.cos(a) * g.bw * 0.62, wy = g.top + g.bh * 0.12 + Math.sin(a * 2) * 6, s = by(g.stage, 0.8, 1, 1.2), fl = 1 + Math.sin(x.t / 70) * 0.08;
          c.save(); c.translate(wx, wy); c.scale(s, s * fl); c.shadowColor = 'rgba(140,200,255,.9)'; c.shadowBlur = 14;
          c.fillStyle = 'rgba(150,205,255,.95)'; c.beginPath(); c.moveTo(0, -16); c.quadraticCurveTo(9, -4, 7, 4); c.arc(0, 4, 7, 0, Math.PI); c.quadraticCurveTo(-9, -4, 0, -16); c.fill();
          c.shadowBlur = 0; c.fillStyle = '#f2fbff'; c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(4, 0, 3, 4); c.arc(0, 4, 3, 0, Math.PI); c.quadraticCurveTo(-4, 0, 0, -7); c.fill(); c.restore(); }
      },
      hl: g => [g.cx - g.bw * 0.34, g.top + g.bh * 0.5, g.cx - g.bw * 0.32, g.top + g.bh * 0.16, g.cx - g.bw * 0.06, g.top + g.bh * 0.05],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.47, ex: 0.17, my: 0.66, s: by(g.stage, 0.76, 0.86, 0.94) })
    },
    /* Plod (Gid picked this look on 14 Nov 2026 over a long neck and a woolly body): a round dome on four pillar legs,
       big ears that flap, a trunk that swings, and tusks at Mega */
    Plod: {
      dims: { Bit: [72, 62], Byte: [94, 78], Mega: [114, 94] }, ll: st => by(st, 8, 10, 12),
      bottom(st) { return 183 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 8; },
      path(c, g) { c.beginPath(); c.roundRect(g.left, g.top, g.bw, g.bh, [g.bw * 0.5, g.bw * 0.5, g.bh * 0.22, g.bh * 0.22]); },
      behind(c, g, x) { const fl = Math.sin(x.t / 380) * 0.12, er = g.bh * 0.32;
        for (const sd of [-1, 1]) { const ex = g.cx + sd * g.bw * 0.44, ey = g.top + g.bh * 0.4;
          c.save(); c.translate(ex, ey); c.rotate(sd * (0.15 + fl)); c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.ellipse(sd * er * 0.5, 3, er * 0.68, er, 0, 0, 7); c.fill();
          c.fillStyle = rgb(x.body); c.beginPath(); c.ellipse(sd * er * 0.5, 0, er * 0.68, er, 0, 0, 7); c.fill();
          c.fillStyle = rgb(lt(x.acc, 0.2)); c.beginPath(); c.ellipse(sd * er * 0.5, 2, er * 0.42, er * 0.68, 0, 0, 7); c.fill(); c.restore(); }
        PLODLEG(c, g, x, g.cx - g.bw * 0.3, x.L.legL, 1, true); PLODLEG(c, g, x, g.cx + g.bw * 0.3, x.L.legR, 3, true); },
      front(c, g, x) { PLODLEG(c, g, x, g.cx - g.bw * 0.16, x.L.legL, 0, false); PLODLEG(c, g, x, g.cx + g.bw * 0.16, x.L.legR, 2, false);
        const sw = Math.sin(x.t / 420) * 6, tw = by(g.stage, 9, 11, 13), y0 = g.top + g.bh * 0.5, y1 = g.bot + by(g.stage, 2, 6, 8);
        if (g.stage === 'Mega') for (const sd of [-1, 1]) { c.strokeStyle = '#f6efe0'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx + sd * 12, y0 + 18); c.quadraticCurveTo(g.cx + sd * 22, y0 + 34, g.cx + sd * 14, y0 + 40); c.stroke(); }
        limb(c, [g.cx, y0, g.cx + sw * 0.4, (y0 + y1) / 2, g.cx + sw, y1], tw, x.body, x.L.tail, x.t);
        c.fillStyle = rgb(dk(x.body, 0.4)); for (const sd of [-1, 1]) { c.beginPath(); c.arc(g.cx + sw + sd * tw * 0.2, y1 + 1, 1.6, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.5, g.left + g.bw * 0.16, g.top + g.bh * 0.12, g.left + g.bw * 0.42, g.top + g.bh * 0.04],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.38, ex: 0.2, my: 0.62, s: by(g.stage, 0.8, 0.9, 0.98) })
    },
    /* upright: a big round head on a small body, with arms and legs */
    Bipped: {
      dims: { Bit: [64, 74], Byte: [74, 98], Mega: [82, 118] }, ll: st => by(st, 8, 12, 16),
      bottom(st) { return 183 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 6; },
      torso(g) { const th = g.bh - g.bw + 8, tw = g.bw * by(g.stage, 0.56, 0.6, 0.64); return { th, tw, tx: g.cx - tw / 2, ty: g.bot - th }; },
      path(c, g) { const hr = g.bw / 2, { th, tw, tx, ty } = this.torso(g), r = Math.min(tw, th) * 0.4;
        c.beginPath(); c.moveTo(tx + r, ty); c.lineTo(tx + tw - r, ty); c.quadraticCurveTo(tx + tw, ty, tx + tw, ty + r); c.lineTo(tx + tw, g.bot - r); c.quadraticCurveTo(tx + tw, g.bot, tx + tw - r, g.bot);
        c.lineTo(tx + r, g.bot); c.quadraticCurveTo(tx, g.bot, tx, g.bot - r); c.lineTo(tx, ty + r); c.quadraticCurveTo(tx, ty, tx + r, ty); c.closePath();
        c.moveTo(g.cx + hr, g.top + hr); c.arc(g.cx, g.top + hr, hr, 0, Math.PI * 2); c.closePath(); },
      arms: 'stub', armW: st => by(st, 6, 7, 8), handR: st => by(st, 5, 6, 6.5),
      shoulder(g) { const { tw, ty } = this.torso(g); return { dx: tw / 2 - 2, y: ty + 8 }; },
      behind(c, g, x) { const { tw } = this.torso(g), lw = by(g.stage, 7, 8, 9);
        [[-1, x.L.legL, 0], [1, x.L.legR, 1]].forEach(([side, mat, i]) => { const hx = g.cx + side * tw * 0.24, lift = [Math.max(0, x.walk), Math.max(0, -x.walk)][i] * 6, fx = hx + x.P.feet[i * 2];
          limb(c, [hx, g.bot - 6, hx, (g.bot + 182) / 2, fx, 181 - lift], lw, x.parts, mat, x.t);
          blob(c, fx + side * 2, 182 - lift, lw * 1.2, lw * 0.7, x.parts, mat, x.t, 'foot'); x.feet.push([fx + side * 2, 182 - lift, lw]); }); },
      inside(c, g, x) { if (g.stage !== 'Mega') return; const { tx, tw, th } = this.torso(g), yy = g.bot - th * 0.35;
        c.fillStyle = rgb(x.parts); c.fillRect(tx, yy, tw, 6); c.fillStyle = rgb(x.acc); roundBox(c, g.cx - 5, yy - 2, 10, 10, 2); c.fill(); },
      hl: g => [g.cx - g.bw * 0.36, g.top + g.bw * 0.44, g.cx - g.bw * 0.34, g.top + g.bw * 0.13, g.cx - g.bw * 0.08, g.top + g.bw * 0.06],
      head: g => [g.cx, g.top + 3, g.bw * 0.56],
      face: (c, g, x, look) => faceTwo(c, { cx: g.cx, top: g.top, bh: g.bw, bw: g.bw, stage: g.stage }, x, look, { ey: 0.5, ex: 0.19, my: 0.73, s: by(g.stage, 0.8, 0.88, 0.94) })
    },
    /* Fizz: a round-bottom flask with the monster's colour as the liquid inside, corked at the top */
    Fizz: {
      dims: { Bit: [60, 60], Byte: [76, 76], Mega: [90, 90] }, glass: true, patternAfter: true,
      nh: st => by(st, 10, 16, 20), ch: st => by(st, 8, 10, 12),
      bottom() { return 178; }, height(st) { return this.dims[st][1] + this.nh(st) + this.ch(st) + 10; },
      path(c, g) { const r = g.bw / 2, nw = g.bw * 0.36, nh = this.nh(g.stage);
        c.beginPath(); c.moveTo(g.cx + r, g.top + r); c.arc(g.cx, g.top + r, r, 0, Math.PI * 2); c.closePath();
        c.moveTo(g.cx - nw / 2, g.top - nh); c.lineTo(g.cx + nw / 2, g.top - nh); c.lineTo(g.cx + nw / 2, g.top + r * 0.4); c.lineTo(g.cx - nw / 2, g.top + r * 0.4); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 5.5), shoulderY: 0.58, armK: 0.8, shoulderIn: 0.04,
      behind(c, g, x) { for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2; blob(c, fx, 182, by(g.stage, 7, 8, 9), 5, x.parts, sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182, by(g.stage, 6, 7, 8)]); } },
      inside(c, g, x) {
        const lvl = g.top + g.bh * 0.42, wave = k => Math.sin(x.t / 300 + k * 0.4) * 2.2;
        c.fillStyle = rgb(x.body); c.beginPath(); c.moveTo(g.left - 2, lvl + wave(0));
        for (let k = 1; k <= 10; k++) c.lineTo(g.left + g.bw * k / 10, lvl + wave(k)); c.lineTo(g.left + g.bw + 2, g.bot + 4); c.lineTo(g.left - 2, g.bot + 4); c.closePath(); c.fill();
        if (g.stage === 'Mega') { c.fillStyle = rgb(dk(x.body, 0.22)); c.fillRect(g.left, g.top + g.bh * 0.8, g.bw, g.bh); }
        c.strokeStyle = rgba(lt(x.body, 0.45), 0.9); c.lineWidth = 2.5; c.beginPath(); c.moveTo(g.left + g.bw * 0.12, lvl + 4); c.lineTo(g.left + g.bw * 0.88, lvl + 4); c.stroke();
        c.fillStyle = rgba(lt(x.body, 0.55), 0.85); for (let k = 0; k < 3; k++) { const ph = (x.t / 1600 + k / 3) % 1;
          c.beginPath(); c.arc(g.cx + (k - 1) * g.bw * 0.22, g.bot - 6 - ph * g.bh * 0.5, 2 + k * 0.6, 0, 7); c.fill(); }
        if (g.stage !== 'Bit') { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { const yy = g.top + g.bh * (0.3 + k * 0.14); c.beginPath(); c.moveTo(g.left + g.bw * 0.86, yy); c.lineTo(g.left + g.bw * 0.95, yy); c.stroke(); } }
      },
      front(c, g, x) { const nw = g.bw * 0.36, nh = this.nh(g.stage), ch = this.ch(g.stage);
        roundBox(c, g.cx - nw / 2 - 3, g.top - nh - 2, nw + 6, 6, 3); c.fillStyle = rgb(dk(x.body, 0.3)); c.fill();
        roundBox(c, g.cx - nw * 0.45, g.top - nh - ch - 1, nw * 0.9, ch + 2, 3); c.fillStyle = rgb(x.parts); c.fill();
        c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(g.cx - nw * 0.3, g.top - nh - ch + 1, 3, ch - 3); },
      head(g) { return [g.cx, g.top - this.nh(g.stage) - this.ch(g.stage), g.bw * 0.5]; },
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.54, ex: 0.18, my: 0.74, s: by(g.stage, 0.78, 0.88, 0.94) })
    },
    /* a teapot: the spout and handle are its signature parts, and the lid is where a hat sits */
    Teep: {
      dims: { Bit: [72, 52], Byte: [94, 66], Mega: [110, 78] }, lr: st => by(st, 8, 10, 12),
      bottom() { return 176; }, height(st) { return this.dims[st][1] + this.lr(st) + 18; },
      path(c, g) { const L = g.left, R = L + g.bw, T = g.top, B = g.bot, w = g.bw, h = g.bh;
        c.beginPath(); c.moveTo(L + w * 0.2, T); c.lineTo(R - w * 0.2, T); c.quadraticCurveTo(R + w * 0.02, T + h * 0.12, R, T + h * 0.56);
        c.quadraticCurveTo(R - w * 0.03, B, g.cx, B); c.quadraticCurveTo(L + w * 0.03, B, L, T + h * 0.56); c.quadraticCurveTo(L - w * 0.02, T + h * 0.12, L + w * 0.2, T); c.closePath(); },
      behind(c, g, x) { const L = g.left, R = L + g.bw, sw = by(g.stage, 10, 12, 14);
        const q = [L + 10, g.top + g.bh * 0.62, L - g.bw * 0.24, g.top + g.bh * 0.6, L - g.bw * 0.27, g.top + g.bh * 0.04];
        c.lineCap = 'round'; c.strokeStyle = rgb(dk(x.body, 0.38)); c.lineWidth = sw + 3; strokeQ(c, q.map((v, i) => i % 2 ? v + 3 : v));
        c.strokeStyle = rgb(x.body); c.lineWidth = sw; strokeQ(c, q);
        c.fillStyle = rgb(dk(x.body, 0.45)); c.beginPath(); c.ellipse(q[4], q[5], sw * 0.48, sw * 0.26, -0.3, 0, 7); c.fill();
        c.strokeStyle = rgb(x.parts); c.lineWidth = by(g.stage, 6, 7, 8); c.beginPath(); c.moveTo(R - 6, g.top + g.bh * 0.22);
        c.bezierCurveTo(R + g.bw * 0.3, g.top + g.bh * 0.1, R + g.bw * 0.3, g.top + g.bh * 0.85, R - 6, g.top + g.bh * 0.78); c.stroke();
        if (g.stage === 'Mega') for (let k = 0; k < 3; k++) { const ph = (x.t / 1400 + k / 3) % 1; c.fillStyle = `rgba(255,255,255,${0.75 * (1 - ph)})`;
          c.beginPath(); c.arc(q[4] - 4 + Math.sin(ph * 6 + k) * 4, q[5] - 6 - ph * 30, 4 + ph * 5, 0, 7); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24; blob(c, fx, 182, by(g.stage, 8, 9, 10), 5, x.parts, sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182, by(g.stage, 7, 8, 9)]); } },
      inside(c, g, x) { if (g.stage === 'Mega') { c.fillStyle = rgb(x.parts); c.fillRect(g.left, g.top + g.bh * 0.82, g.bw, 5); } },
      front(c, g, x) { const ry = this.lr(g.stage);
        c.fillStyle = rgb(dk(x.parts, 0.25)); c.beginPath(); c.ellipse(g.cx, g.top + 5, g.bw * 0.33, ry, 0, Math.PI, 0); c.fill();
        c.fillStyle = rgb(x.parts); c.beginPath(); c.ellipse(g.cx, g.top + 3, g.bw * 0.33, ry, 0, Math.PI, 0); c.fill();
        c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(g.cx, g.top + 3 - ry, by(g.stage, 4.5, 5.5, 6.5), 0, 7); c.fill(); },
      head(g) { return [g.cx, g.top - this.lr(g.stage) - 2, g.bw * 0.42]; },
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.17, my: 0.66, s: by(g.stage, 0.8, 0.92, 0.98) })
    },
    /* a paper lantern glowing from inside, with caps, a carry loop and a tassel at Mega */
    Lern: {
      dims: { Bit: [58, 62], Byte: [74, 80], Mega: [86, 96] },
      bottom() { return 171; }, height(st) { return this.dims[st][1] + 34; },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * 0.42); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.6, armK: 0.8,
      behind(c, g, x) {
        c.strokeStyle = rgb(dk(x.parts, 0.1)); c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx - g.bw * 0.22, g.top - 5);
        c.quadraticCurveTo(g.cx, g.top - g.bw * 0.5, g.cx + g.bw * 0.22, g.top - 5); c.stroke();
        if (g.stage === 'Mega') { const sw = Math.sin(x.t / 400) * 3; c.strokeStyle = rgb(x.acc); c.lineWidth = 2; c.beginPath(); c.moveTo(g.cx, g.bot + 6); c.lineTo(g.cx + sw, g.bot + 12); c.stroke();
          c.fillStyle = rgb(x.acc); c.beginPath(); c.moveTo(g.cx + sw - 3, g.bot + 12); c.lineTo(g.cx + sw + 3, g.bot + 12); c.lineTo(g.cx + sw * 1.3 + 2, g.bot + 22); c.lineTo(g.cx + sw * 1.3 - 2, g.bot + 22); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2; blob(c, fx, 182, by(g.stage, 6.5, 7.5, 8.5), 4.5, x.parts, sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182, by(g.stage, 6, 6.5, 7.5)]); } },
      inside(c, g, x) {
        const gr = c.createRadialGradient(g.cx, g.top + g.bh * 0.6, 2, g.cx, g.top + g.bh * 0.6, g.bw * 0.6);
        gr.addColorStop(0, `rgba(255,230,150,${0.55 + Math.sin(x.t / 180) * 0.08})`); gr.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = gr; c.fillRect(g.left, g.top, g.bw, g.bh);
        c.strokeStyle = rgba(dk(x.body, 0.2), 0.45); c.lineWidth = 2;
        for (const k of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + k * g.bw * 0.2, g.top); c.quadraticCurveTo(g.cx + k * g.bw * 0.34, g.top + g.bh / 2, g.cx + k * g.bw * 0.2, g.bot); c.stroke(); } },
      front(c, g, x) { for (const yy of [g.top - 6, g.bot - 3]) { roundBox(c, g.cx - g.bw * 0.3, yy, g.bw * 0.6, 9, 3); c.fillStyle = rgb(x.parts); c.fill();
          if (g.stage === 'Mega') { c.fillStyle = rgb(x.acc); c.fillRect(g.cx - g.bw * 0.3, yy + 3.5, g.bw * 0.6, 2); } } },
      head: g => [g.cx, g.top - 6, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.18, my: 0.64, s: by(g.stage, 0.76, 0.86, 0.92) })
    }
  };

  /* ---------- fusion hybrids: the first family's body on the second family's legs ----------
     Chomp is drawn by its own function, so a Chomp body or Chomp feet use this stand-in built from STAGE. */
  const CHOMP_F = {
    dims: { Bit: [STAGE.Bit.bw, STAGE.Bit.bh], Byte: [STAGE.Byte.bw, STAGE.Byte.bh], Mega: [STAGE.Mega.bw, STAGE.Mega.bh] },
    bottom() { return 174; }, height(st) { return STAGE[st].bh + 18; },
    path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, STAGE[g.stage].r * g.bw / STAGE[g.stage].bw); },
    arms: 'stub', armW: st => STAGE[st].arm, handR: st => STAGE[st].hand, shoulderY: 0.56,
    legs(c, g, x) { const S = STAGE[g.stage], F = x.P.feet || [0, 0, 0, 0], fx = g.bw * 0.24;
      for (const [i, side] of [[0, -1], [1, 1]]) { const lift = [Math.max(0, x.walk), Math.max(0, -x.walk)][i] * -5;
        const px = g.cx + side * fx + F[i * 2], py = 183 + F[i * 2 + 1] + lift, mat = i ? x.L.legR : x.L.legL;
        blob(c, px, py, S.foot[0], S.foot[1], x.parts, mat, x.t, 'foot'); x.feet.push([px, py, S.foot[0] * 0.85]);
        if (S.toes && !mat) for (let k = 0; k < S.toes; k++) { c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(px - 7 + k * 7, py + S.foot[1] - 2.5, 2.6, 0, 7); c.fill(); } } },
    face(c, g, x, look) { const S = { ...STAGE[g.stage], fang: VAR === 'Feral' ? 2 : STAGE[g.stage].fang }, k = g.bw / S.bw, s = S.eye * Math.min(1.1, k);
      const ey = g.top + g.bh * 0.34, ex = g.bw * 0.19, my = g.top + g.bh * 0.62, mw = g.bw * S.mw;
      c.fillStyle = rgba(BLUSH, 0.7); for (const side of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + side * g.bw * 0.31, ey + 13 * s, 7.5 * s, 4.5 * s, 0, 0, 7); c.fill(); }
      const eyes = x.P.eyes === 'open' && (g.stage === 'Mega' || VAR === 'Feral') ? 'fierce' : x.P.eyes;
      LIDC = rgb(x.body); eye(c, g.cx - ex, ey, s, eyes, -1, look); eye(c, g.cx + ex, ey, s, eyes, 1, look); capFace(c, g.cx, ey, ex, my, false);
      if (eyes === 'fierce') for (const side of [-1, 1]) lid(c, g.cx + side * ex, ey, s, side, look, rgb(x.body));
      if (x.P.frown || x.P.ouch) { c.save(); c.translate(0, my * 2 + mw * 0.2); c.scale(1, -1); mouth(c, g.cx, my, mw * 0.7, 0, S, x.body); c.restore(); } else mouth(c, g.cx, my, mw, x.open, S, x.body);
      return { my, ey, ex, s, cx: g.cx }; }
  };
  /* Booly's legs are a ghost tail, so a body on them floats with a wisp curling underneath */
  function ghostTail(c, g, x) {
    const sw = Math.sin(x.t / 320) * 5, tl = g.bw * 0.5, L = g.left + g.bw * 0.14, R = g.left + g.bw * 0.86, y0 = g.bot - 12;
    const shape = () => { c.beginPath(); c.moveTo(L, y0); c.quadraticCurveTo(g.cx - g.bw * 0.1, g.bot + 24, g.cx + tl * 0.7 + sw, g.bot + 14 + sw * 0.4);
      c.quadraticCurveTo(g.cx + tl * 0.5, g.bot + 6, R, y0); c.closePath(); };
    c.save(); c.translate(0, 4); shape(); c.fillStyle = rgb(dk(x.body, 0.38)); c.fill(); c.restore();
    shape(); c.fillStyle = rgb(lt(x.body, 0.08)); c.fill();
  }
  /* Squib's legs on another body: a short jelly skirt under the body and tapered tentacles that sway and splay out */
  function jellyLegs(c, g, x) {
    const n = by(g.stage, 4, 5, 6), tl = FAM.Squib.tl(g.stage) + 4, w0 = by(g.stage, 9, 10, 11), span = g.bw * 0.78, x0 = g.cx - span / 2;
    for (let i = 0; i < n; i++) { const f = n === 1 ? 0.5 : i / (n - 1), tx = x0 + f * span, out = (f - 0.5) * 2, sw = Math.sin(x.t / 240 + i * 1.4) * 5 + x.walk * 3;
      const ex = tx + out * 12 + sw, ey = 183, mx = tx + out * 4 - sw * 0.6, my = g.bot + tl * 0.5, mat = f < 0.5 ? x.L.legL : x.L.legR;
      for (let k = 0; k < 6; k++) { const u0 = k / 6, u1 = (k + 1) / 6, P = u => { const a = 1 - u; return [a * a * tx + 2 * a * u * mx + u * u * ex, a * a * (g.bot - 6) + 2 * a * u * my + u * u * ey]; };
        const [ax, ay] = P(u0), [bx, by2] = P(u1); if (u1 < 0.3) continue; c.strokeStyle = rgb(k % 2 ? x.parts : lt(x.parts, 0.08)); c.lineWidth = w0 * (1 - u0 * 0.6); c.lineCap = 'round';
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by2); c.stroke(); }
      c.fillStyle = rgb(lt(x.parts, 0.25)); c.beginPath(); c.arc(ex + out * 2, ey - 1, w0 * 0.32, 0, 7); c.fill(); }
    const sk = lt(x.body, 0.3), m = by(g.stage, 4, 5, 6), sw2 = g.bw * 0.86 / m, L = g.cx - g.bw * 0.43;
    c.fillStyle = rgb(dk(sk, 0.18)); c.beginPath(); c.moveTo(L, g.bot - 6); for (let i = 0; i < m; i++) c.quadraticCurveTo(L + (i + 0.5) * sw2, g.bot + 26, L + (i + 1) * sw2, g.bot + 8); c.lineTo(L + g.bw * 0.86, g.bot - 6); c.closePath(); c.fill();
    c.fillStyle = rgb(sk); c.beginPath(); c.moveTo(L, g.bot - 8); for (let i = 0; i < m; i++) c.quadraticCurveTo(L + (i + 0.5) * sw2, g.bot + 22, L + (i + 1) * sw2, g.bot + 5); c.lineTo(L + g.bw * 0.86, g.bot - 8); c.closePath(); c.fill();
  }
  const famOf = n => n === 'Chomp' ? CHOMP_F : FAM[n];
  function legsOf(b) { const B = famOf(b); if (b === 'Booly') return ghostTail; if (b === 'Squib') return jellyLegs; if (b === 'Antik') return (c, g, x) => B.legs(c, g, x); return (c, g, x) => (B.legs || B.behind).call(B, c, g, x); }
  function hybrid(name, a, b) {
    if (FAM[name]) return FAM[name];
    const A = famOf(a), B = famOf(b); if (!A || !B) return null;
    const legs = legsOf(b), F = Object.create(A);
    Object.assign(F, {
      hybridOf: [a, b], float: b === 'Booly', slots: B.slots, wingY: A.wingY,
      bottom: st => B.bottom.call(B, st), height: st => A.height.call(A, st) - (184 - A.bottom.call(A, st)) + (184 - B.bottom.call(B, st)) + (b === 'Booly' ? 10 : 0),
      behind(c, g, x) { if (a === 'Antik') A.ants.call(A, c, g, x); legs(c, g, x); },
      arms: b === 'Skit' && A.arms !== 'claw' ? null : A.arms
    });
    FAM[name] = F; return F;
  }

  function drawFamily(c, m, p, t, look, F) {
    const P = typeof p === 'string' ? POSE[p] || POSE.idle : p, stage = F.dims[m.stage] ? m.stage : 'Bit';
    const mk = m.marks || [], stoutK = stage !== 'Bit' && mk.includes('Stout') ? 1.12 : 1, D = F.dims[stage], bw = Math.round(D[0] * stoutK * (VAR_W[VAR] || 1)), bh = Math.round(D[1] * (VAR_H[VAR] || 1)), pal = m.pal, body = pal.body, parts = pal.parts, acc = pal.accent, L = m.limbs || {};
    const walk = P.walk ? Math.sin(t / (P.walk > 1 ? 75 : 130)) : 0, chew = P.chew ? (Math.sin(t / 110) + 1) / 2 : 0;
    const fl = F.float ? Math.sin(t / 420) * 4 - 2 : 0, bob = P.walk ? -Math.abs(walk) * 4 : Math.sin(t / 600) * 1.2;
    const lift = (P.lift || 0) + bob + fl, open = Math.max(0, Math.min(1, (P.open || 0) + chew * 0.5 - (P.chew ? 0.25 : 0)));
    const bot = F.bottom(stage), g = { cx: 100, bw, bh, bot, top: bot - bh, left: 100 - bw / 2, stage };
    const x = { P, t, walk, body, parts, acc, L, stage, open, m, feet: [], back: !!m.back }, W = m.worn || {}, bootsOn = W.feet === 'Boots' && !(F.slots && F.slots.feet === false);
    c.fillStyle = rgba(INK, F.float ? 0.08 : 0.14);
    c.beginPath(); c.ellipse(100 + (P.lean || 0) * 0.5, 189, Math.max(bw * 0.44, 24) * (F.float ? 0.75 : 1) * (1 + lift * 0.008), 6, 0, 0, 7); c.fill();
    c.save();
    c.translate(P.lean || 0, lift);
    c.translate(100, 176); c.rotate(((P.tilt || 0) + (P.wobble ? Math.sin(t / 160) * 8 : 0)) * Math.PI / 180); c.scale(P.sx || 1, P.sy || 1); c.translate(-100, -176);
    if (m.fx) fxBehind(c, m.fx, () => F.path.call(F, c, g, x), g, body, t);
    const headAt = F.head ? F.head.call(F, g) : [g.cx, g.top + 2, g.bw * 0.5], pathF = () => F.path.call(F, c, g, x);
    variantBehind(c, pathF, g, body, t);
    marksBehind(c, m, g, headAt, t, F.wingY);
    if (F.behind) F.behind.call(F, c, g, x);
    if (W.back && !x.back) wings(c, g, W.back, t, F.wingY);
    let booted = 0; const putBoots = () => { if (bootsOn) boots(c, x.feet.slice(booted)); booted = x.feet.length; };
    putBoots();
    const sh = F.shoulder ? F.shoulder.call(F, g) : null;
    const sy = sh ? sh.y : g.top + g.bh * (F.shoulderY || 0.56), inset = sh ? g.bw / 2 - sh.dx : 4 + g.bw * (F.shoulderIn || 0), k = F.armK || 1;
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
    if (!P.front || x.back) arms();
    if (F.glow && F.glow(stage)) { c.save(); c.shadowColor = rgba(lt(body, 0.5), 0.9); c.shadowBlur = 18; F.path(c, g, x); c.fillStyle = rgb(body); c.fill(); c.restore(); }
    const shell = F.glass ? lt(body, 0.72) : body;
    c.save(); c.translate(0, 4); F.path.call(F, c, g, x); c.restore(); c.fillStyle = rgb(dk(body, F.glass ? 0.3 : 0.38)); c.fill();
    const grad = c.createLinearGradient(g.left, g.top, g.left + g.bw, g.bot);
    grad.addColorStop(0, rgb(lt(shell, 0.14))); grad.addColorStop(0.55, rgb(shell)); grad.addColorStop(1, rgb(dk(shell, 0.1)));
    F.path.call(F, c, g, x); c.fillStyle = grad; c.fill();
    c.save(); F.path.call(F, c, g, x); c.clip();
    const E = ELEMENT[m.el];
    if (stage === 'Mega' && E && !F.patternAfter) E.pattern(c, g, body);
    if (F.inside && !(x.back && F.backInside)) F.inside.call(F, c, g, x);
    if (x.back && F.backInside) F.backInside.call(F, c, g, x);
    if (stage === 'Mega' && E && F.patternAfter) E.pattern(c, g, body);
    bellyOn(c, m, g, body); variantOn(c, g);
    if (m.fx) fxOnBody(c, m.fx, () => F.path.call(F, c, g, x), g, body, t);
    c.restore();
    variantOutline(c, pathF);
    capBody(c, g);
    const h = F.hl ? F.hl(g) : [g.left + g.bw * 0.13, g.top + g.bh * 0.42, g.left + g.bw * 0.12, g.top + g.bh * 0.12, g.left + g.bw * 0.4, g.top + g.bh * 0.08];
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = stage === 'Bit' ? 4.5 : 5.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(h[0], h[1]); c.quadraticCurveTo(h[2], h[3], h[4], h[5]); c.stroke();
    let my = g.top + g.bh * 0.65;
    if (x.back) {                  // seen from behind: no face; wings sit on the back in front of the body
      if (F.front) F.front.call(F, c, g, x);
      putBoots();
      if (W.back) wings(c, g, W.back, t, F.wingY);
      if (W.head) hat(c, { head: headAt }, W.head, t);
    } else {
      if (E) for (const side of [-1, 1]) E.mark(c, g.cx + side * (g.bw / 2 - 10), g.top + g.bh * 0.3, stage === 'Bit' ? 0.7 : 0.85, rgba(acc, 0.9));
      const fi = F.face(c, g, x, look); my = fi.my;
      if (F.front) F.front.call(F, c, g, x);
      putBoots();
      wornFront(c, { head: headAt, eyes: { cx: fi.cx, y: fi.ey, ex: fi.ex, s: fi.s, one: fi.one }, mouth: [fi.cx, my, fi.s] }, W, t);
    }
    if (P.front && !x.back) arms();
    variantFront(c, g, t, x.back);
    marksOver(c, m, g, headAt, t, F.wingY, F.al ? F.al(stage) + 10 : 0);
    if (m.fx) fxFront(c, m.fx, () => F.path.call(F, c, g, x), g, t);
    c.restore();
    const top = g.top + lift;
    if (P.extra === 'zz') { c.strokeStyle = rgb(lt(INK, 0.4)); c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [zx, zy, z] of [[g.cx + g.bw / 2 + 2, top + 4, 9], [g.cx + g.bw / 2 + 16, top - 12, 6]]) {
        const yy = zy - (t / 60 % 10); c.beginPath(); c.moveTo(zx, yy); c.lineTo(zx + z, yy); c.lineTo(zx, yy + z); c.lineTo(zx + z, yy + z); c.stroke(); } }
    if (P.extra === 'sweat') { c.fillStyle = '#9CD4F5'; const sx2 = g.cx + g.bw / 2 - 4, sy2 = top + 6;
      c.beginPath(); c.moveTo(sx2, sy2); c.quadraticCurveTo(sx2 + 8, sy2 + 12, sx2, sy2 + 15); c.quadraticCurveTo(sx2 - 8, sy2 + 12, sx2, sy2); c.fill(); }
    if (P.extra === 'heart') heart(c, g.cx + g.bw / 2 + 6, top - 4 + Math.sin(t / 200) * 2, 0.7, rgb(BLUSH));
    if (P.extra === 'tear') { const ph = (t / 900) % 1; c.fillStyle = `rgba(156,212,245,${1 - ph * 0.6})`; drop(c, g.cx - g.bw * 0.2, top + g.bh * 0.5 + ph * 14, 0.8); c.fill(); }
    if (P.extra === 'stars') for (let k2 = 0; k2 < 3; k2++) { const a = t / 400 + k2 * 2.1;
      star(c, g.cx + Math.cos(a) * g.bw * 0.4, top + 4 + Math.sin(a) * 6, 0.55, k2 % 2 ? '#ffd23f' : rgb(lt(acc, 0.3))); }
    moodExtra(c, P, g, top, t, acc);
    if (P.extra === 'crumbs' && my) { c.fillStyle = rgb(lt(parts, 0.4)); for (let k2 = 0; k2 < 4; k2++) { const ph = (t / 400 + k2 / 4) % 1;
      c.beginPath(); c.arc(g.cx - 12 + k2 * 8, my + lift + ph * 22, 2, 0, 7); c.fill(); } }
  }

  /* the mood extras on the ranch: a sigh puff when worn down, twinkles when fresh, a gleam and fired-up lines on a great day */
  function moodExtra(c, P, g, top, t, acc) {
    if (P.extra === 'sigh') { const ph = (t / 1800) % 1, x0 = g.cx + g.bw * 0.42 + ph * 14, y0 = top + g.bh * 0.55 - ph * 10;
      c.fillStyle = `rgba(235,240,250,${0.75 * (1 - ph)})`; c.beginPath(); c.arc(x0, y0, 4 + ph * 4, 0, 7); c.arc(x0 + 6 + ph * 3, y0 - 2, 3 + ph * 3, 0, 7); c.fill(); }
    if (P.extra === 'shine') for (let k = 0; k < 2; k++) { const tw = 0.5 + 0.5 * Math.sin(t / 260 + k * 2.4);
      star(c, g.cx + (k ? -1 : 1) * g.bw * (0.42 + k * 0.06), top - 2 + k * 10, 0.35 + 0.3 * tw, k ? '#fff6c4' : '#ffffff'); }
    if (P.extra === 'glint') { const tw = (t / 900) % 1;
      if (tw < 0.35) star(c, g.cx + g.bw * 0.2, top + g.bh * 0.22, 0.4 + Math.sin(tw / 0.35 * Math.PI) * 0.5, '#ffffff');
      c.strokeStyle = rgb(lt(acc, 0.2)); c.lineWidth = 3; c.lineCap = 'round';
      for (let k = -1; k <= 1; k++) { const yy = top - 8 - ((t / 22 + k * 7) % 14), xx = g.cx + k * g.bw * 0.22;
        c.globalAlpha = 0.8; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + k * 2, yy - 7); c.stroke(); } c.globalAlpha = 1; }
  }
  /* blend two poses for the spring between them (numbers only; the face swaps halfway) */
  function blend(a, b, k) {
    const A = POSE[a] || POSE.idle, B = POSE[b] || POSE.idle, n = (x, y) => lerp(x || 0, y || 0, k), o = (x, y) => lerp(x ?? 1, y ?? 1, k);
    return { ...(k < 0.5 ? A : B), arm: A.arm.map((s, i) => s.map((v, j) => lerp(v, B.arm[i][j], k))), feet: A.feet.map((v, i) => lerp(v, B.feet[i], k)),
      open: n(A.open, B.open), lift: n(A.lift, B.lift), tilt: n(A.tilt, B.tilt), lean: n(A.lean, B.lean), sx: o(A.sx, B.sx), sy: o(A.sy, B.sy) };
  }

  /* the visible height of each stage in units, so screens can size it */
  const chompHeight = (stage, marks = []) => (STAGE[stage] || STAGE.Bit).bh + 18 + (marks.includes('Horned') && stage !== 'Bit' ? 28 : 0);
  const draw = (c, m, p, t = 0, look = [0, 0]) => {
    CAP = m.capture || null; if (CAP) { CAP.hands = []; CAP.eyes = null; CAP.mouth = null; }
    VAR = m.variant || null; EYE = VAR === 'Moonlit' ? 'moon' : VAR === 'Pampered' ? 'spark' : null; LIDC = m.pal && m.pal.body ? rgb(m.pal.body) : '#999';
    const r = FAM[m.family] ? drawFamily(c, m, p, t, look, FAM[m.family]) : drawChomp(c, m, p, t, look);
    CAP = null; VAR = null; EYE = null; return r;
  };
  const height = (stage, marks = [], family = 'Chomp') => FAM[family] ? FAM[family].height(stage) : chompHeight(stage, marks);
  const width = (stage, family = 'Chomp') => FAM[family] ? FAM[family].dims[stage][0] : STAGE[stage].bw;
  return { draw, blend, height, width, hybrid, POSES: Object.keys(POSE), STAGE, FAMILIES: ['Chomp', ...Object.keys(FAM).filter(k => !FAM[k].hybridOf)] };
})();
