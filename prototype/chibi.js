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
    duck:   { arm: [[10, 12, 16, 18], [10, 12, 16, 18]], feet: [-7, 0, 7, 0], eyes: 'shut', open: 0, sx: 1.24, sy: 0.6, tilt: -2 },   // Dodgeball: squashed flat under a high ball
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
    c.beginPath(); c.ellipse(100 + (P.lean || 0) * 0.5, 186.5, g.bw * 0.44 * (1 + lift * 0.008), 6, 0, 0, 7); c.fill();
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
    costumeBehind(c, m, g, headC, t);
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
    variantOn(c, g); costumeOn(c, m, g, body, t);
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
    // a tortoise-brown shell tinted by the parts colour, kept light enough that a near-black Snabit's shell doesn't read as a black blob behind it
    let sc = mix(dk(parts, 0.1), [138, 108, 78], 0.55); const lum = q => 0.3 * q[0] + 0.59 * q[1] + 0.11 * q[2]; if (lum(sc) < 90) sc = lt(sc, (90 - lum(sc)) / 160);
    const bone = mix([240, 228, 204], parts, 0.15);
    for (const a of [-2.55, -2.05, -1.57, -1.09, -0.59, -3.05, -0.09]) {
      const ex = cx + Math.cos(a) * rx * 0.94, ey = cy + Math.sin(a) * ry * 0.94, l = over ? 11 : 13, nx = Math.cos(a), ny = Math.sin(a);
      c.fillStyle = rgb(dk(bone, 0.3)); c.beginPath(); c.moveTo(ex - ny * 6, ey + nx * 6 + 2); c.lineTo(ex + nx * l, ey + ny * l + 2); c.lineTo(ex + ny * 6, ey - nx * 6 + 2); c.closePath(); c.fill();
      c.fillStyle = rgb(bone); c.beginPath(); c.moveTo(ex - ny * 6, ey + nx * 6); c.lineTo(ex + nx * l, ey + ny * l); c.lineTo(ex + ny * 6, ey - nx * 6); c.closePath(); c.fill();
    }
    c.fillStyle = rgb(dk(sc, 0.35)); c.beginPath(); c.ellipse(cx, cy + 4, rx, ry, 0, 0, 7); c.fill();
    c.fillStyle = rgb(sc); c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fill();
    if (!over) { c.strokeStyle = rgb(lt(sc, 0.3)); c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.ellipse(cx, cy, rx - 2, ry - 2, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }   // the shell's lit rim over the top
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
    if (!o.noMouth) smallMouth(c, g.cx, my, s, x.open, x.P.ouch ? 'ouch' : VAR === 'Feral' ? 'two' : x.stage === 'Mega' || o.fang, x.P.frown);   // noMouth: for a face with nothing there, like Cthulhu's feelers or the Nightgaunt's blank skin
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

  /* ---------- costumes: an everyday-thing look over any family, found through a colour easter egg ----------
     costumeBehind draws what sticks out (ears, wings, feelers), costumeOn paints the body inside its outline */
  const BLACK = [38, 32, 40];
  function costumeBehind(c, m, g, head, t) {
    const k = m.costume; if (!k) return; const [hx, hy, hw] = head;
    if (k === 'Panda') for (const sd of [-1, 1]) { c.fillStyle = rgb(BLACK); c.beginPath(); c.arc(hx + sd * hw * 0.74, hy + 3, hw * 0.27, 0, 7); c.fill(); }
    if (k === 'Bee' || k === 'Ladybug') for (const sd of [-1, 1]) { const sw = Math.sin(t / 300 + sd) * 2; c.strokeStyle = rgb(BLACK); c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(hx + sd * 6, hy + 6); c.quadraticCurveTo(hx + sd * 10, hy - 10, hx + sd * 16 + sw, hy - 16); c.stroke(); c.fillStyle = rgb(BLACK); c.beginPath(); c.arc(hx + sd * 16 + sw, hy - 16, 3.5, 0, 7); c.fill(); }
    if (k === 'Bee') for (const sd of [-1, 1]) { const fl = Math.sin(t / 45) * 0.25; c.save(); c.translate(g.cx + sd * g.bw * 0.3, g.top + g.bh * 0.25); c.rotate(sd * (-0.6 + fl));
      c.fillStyle = 'rgba(220,240,255,.75)'; c.strokeStyle = 'rgba(120,150,180,.8)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(sd * 14, -8, 16, 9, 0, 0, 7); c.fill(); c.stroke(); c.restore(); }
    if (k === 'Watermelon') { c.strokeStyle = '#3f8f3a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy + 4); c.quadraticCurveTo(hx + 4, hy - 8, hx + 10, hy - 10); c.stroke();
      c.fillStyle = '#5fb04f'; c.beginPath(); c.ellipse(hx + 12, hy - 12, 7, 4, -0.5, 0, 7); c.fill(); }
    if (k === 'Candy cane') { c.fillStyle = '#2f8f4e'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(hx + sd * 9, hy, 8, 4.5, sd * 0.4, 0, 7); c.fill(); }
      c.fillStyle = '#d6303f'; c.beginPath(); c.arc(hx, hy + 1, 4.5, 0, 7); c.fill(); }
    // the second set of costumes (proposed 15 Nov 2026)
    if (k === 'Tiger') for (const sd of [-1, 1]) { const ex = hx + sd * hw * 0.68, ey = hy + 4; c.fillStyle = '#e9852e'; c.beginPath(); c.arc(ex, ey, hw * 0.24, 0, 7); c.fill();
      c.fillStyle = rgb(BLACK); c.beginPath(); c.arc(ex, ey, hw * 0.24, Math.PI * 1.1, Math.PI * 1.9); c.lineTo(ex, ey); c.fill(); c.fillStyle = '#fbe9d2'; c.beginPath(); c.arc(ex, ey + 1, hw * 0.12, 0, 7); c.fill(); }
    if (k === 'Zebra') { c.fillStyle = rgb(BLACK); c.beginPath(); c.ellipse(hx, hy + 2, 5, 11, 0, 0, 7); c.fill(); c.fillStyle = '#f6f4ee'; for (const dy of [-6, 0, 6]) c.fillRect(hx - 5, hy + 2 + dy, 10, 2);
      for (const sd of [-1, 1]) { c.fillStyle = '#f6f4ee'; c.beginPath(); c.ellipse(hx + sd * hw * 0.62, hy + 4, 5, 10, sd * 0.5, 0, 7); c.fill(); c.fillStyle = rgb(BLACK); c.beginPath(); c.ellipse(hx + sd * hw * 0.62, hy - 2, 3, 4, sd * 0.5, 0, 7); c.fill(); } }
    if (k === 'Cow') for (const sd of [-1, 1]) { c.fillStyle = '#e8dcc4'; c.beginPath(); c.moveTo(hx + sd * 7, hy + 6); c.quadraticCurveTo(hx + sd * 14, hy - 6, hx + sd * 10, hy - 14); c.lineTo(hx + sd * 5, hy + 4); c.fill();
      c.fillStyle = '#f6f4ee'; c.beginPath(); c.ellipse(hx + sd * hw * 0.78, hy + 10, 9, 5, sd * -0.4, 0, 7); c.fill(); c.fillStyle = rgb(BLACK); c.beginPath(); c.ellipse(hx + sd * hw * 0.82, hy + 10, 4, 3, sd * -0.4, 0, 7); c.fill(); }
    if (k === 'Penguin') { c.fillStyle = rgb(BLACK); c.beginPath(); c.ellipse(hx, hy + 6, 6, 4, 0, 0, 7); c.fill(); }
    if (k === 'Strawberry') { c.fillStyle = '#3f9a45'; for (let i = -2; i <= 2; i++) { c.save(); c.translate(hx + i * 6, hy + 6); c.rotate(i * 0.45); c.beginPath(); c.ellipse(0, -7, 4, 9, 0, 0, 7); c.fill(); c.restore(); }
      c.strokeStyle = '#2f7a35'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 2, hy - 12); c.stroke(); }
    if (k === 'Rubber duck') { const sw = Math.sin(t / 260) * 1.5; c.fillStyle = '#f5c832'; c.beginPath(); c.ellipse(hx + sw, hy, 4, 8, 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(hx + 5 + sw, hy - 2, 3.5, 7, 0.8, 0, 7); c.fill(); }
    if (k === 'Clownfish') { const sw = Math.sin(t / 200) * 0.15; c.save(); c.translate(hx, hy + 6); c.rotate(sw); c.fillStyle = '#f0782a'; c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(0, -20, 10, 0); c.closePath(); c.fill();
      c.strokeStyle = rgb(BLACK); c.lineWidth = 2; c.stroke(); c.fillStyle = '#fff'; c.fillRect(-2, -12, 4, 12); c.restore(); }
  }
  function costumeOn(c, m, g, body, t) {
    const k = m.costume; if (!k) return; const W = g.bw, H = g.bh, L = g.left, T = g.top;
    if (k === 'Panda') { c.fillStyle = 'rgba(250,250,247,.88)'; c.fillRect(L - 4, T - 4, W + 8, H + 8);
      c.fillStyle = rgb(BLACK); for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * W * 0.2, T + H * 0.38, W * 0.15, H * 0.17, sd * -0.45, 0, 7); c.fill(); }
      c.fillRect(L - 4, T + H * 0.8, W + 8, H * 0.3); }
    if (k === 'Bee') { c.fillStyle = 'rgba(246,200,40,.9)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = rgb(BLACK);
      for (const f of [0.62, 0.84]) c.fillRect(L - 4, T + H * f, W + 8, H * 0.11); }
    if (k === 'Ladybug') { c.fillStyle = 'rgba(214,44,44,.92)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = rgb(BLACK);
      c.fillRect(L - 4, T + H * 0.7, W + 8, 2.4); for (const [fx, fy, r] of [[0.18, 0.62, 0.08], [0.82, 0.6, 0.08], [0.3, 0.86, 0.07], [0.7, 0.86, 0.07], [0.08, 0.3, 0.06], [0.92, 0.32, 0.06]]) { c.beginPath(); c.arc(L + W * fx, T + H * fy, W * r, 0, 7); c.fill(); } }
    if (k === 'Watermelon') { c.fillStyle = 'rgba(236,72,86,.9)'; c.fillRect(L - 4, T - 4, W + 8, H + 8);
      c.fillStyle = '#f3f7e6'; c.fillRect(L - 4, T + H * 0.8, W + 8, H * 0.06); c.fillStyle = '#3f8f3a'; c.fillRect(L - 4, T + H * 0.86, W + 8, H * 0.2);
      c.fillStyle = rgb(BLACK); for (const [fx, fy] of [[0.15, 0.6], [0.32, 0.72], [0.5, 0.64], [0.68, 0.72], [0.85, 0.6], [0.1, 0.32], [0.9, 0.3]]) { c.beginPath(); c.ellipse(L + W * fx, T + H * fy, 2.4, 3.6, 0.3, 0, 7); c.fill(); } }
    if (k === 'Tiger') { c.fillStyle = 'rgba(233,133,46,.93)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = '#fbe9d2'; c.beginPath(); c.ellipse(g.cx, T + H * 0.78, W * 0.26, H * 0.2, 0, 0, 7); c.fill();
      c.fillStyle = rgb(BLACK); for (const sd of [-1, 1]) for (const f of [0.18, 0.42, 0.66]) { c.beginPath(); c.moveTo(g.cx + sd * (W / 2 + 4), T + H * f); c.quadraticCurveTo(g.cx + sd * W * 0.3, T + H * (f + 0.05), g.cx + sd * W * 0.2, T + H * (f + 0.03)); c.quadraticCurveTo(g.cx + sd * W * 0.3, T + H * (f + 0.1), g.cx + sd * (W / 2 + 4), T + H * (f + 0.08)); c.fill(); }
      c.beginPath(); c.moveTo(g.cx - 5, T - 4); c.lineTo(g.cx, T + H * 0.12); c.lineTo(g.cx + 5, T - 4); c.fill(); }
    if (k === 'Zebra') { c.fillStyle = 'rgba(246,244,238,.94)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = rgb(BLACK);
      for (let i = 0; i < 7; i++) { const x0 = L + W * (i + 0.5) / 7; c.beginPath(); c.moveTo(x0 - W * 0.04, T - 4); c.quadraticCurveTo(x0 + W * 0.05, T + H * 0.5, x0 - W * 0.03, T + H + 4); c.lineTo(x0 + W * 0.03, T + H + 4); c.quadraticCurveTo(x0 + W * 0.1, T + H * 0.5, x0 + W * 0.03, T - 4); c.fill(); } }
    if (k === 'Cow') { c.fillStyle = 'rgba(246,244,238,.94)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = rgb(BLACK);
      for (const [fx, fy, rx, ry] of [[0.12, 0.25, 0.16, 0.13], [0.86, 0.62, 0.15, 0.16], [0.3, 0.9, 0.18, 0.1], [0.82, 0.12, 0.1, 0.08]]) { c.beginPath(); c.ellipse(L + W * fx, T + H * fy, W * rx, H * ry, fx, 0, 7); c.fill(); }
      c.fillStyle = '#f2b7b7'; c.beginPath(); c.ellipse(g.cx, T + H * 0.86, W * 0.24, H * 0.12, 0, 0, 7); c.fill(); c.fillStyle = '#c47a7a'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * W * 0.08, T + H * 0.86, 2.4, 3.2, 0, 0, 7); c.fill(); } }
    if (k === 'Penguin') { c.fillStyle = 'rgba(38,32,40,.95)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = '#f6f4ee'; c.beginPath(); c.ellipse(g.cx, T + H * 0.62, W * 0.36, H * 0.44, 0, 0, 7); c.fill();
      c.fillStyle = '#f2a33a'; c.beginPath(); c.moveTo(g.cx - 6, T + H * 0.52); c.lineTo(g.cx + 6, T + H * 0.52); c.lineTo(g.cx, T + H * 0.6); c.closePath(); c.fill(); }
    if (k === 'Strawberry') { c.fillStyle = 'rgba(226,52,64,.93)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = '#f7d65a';
      for (let i = 0; i < 16; i++) { const fx = ((i * 0.618) % 1) * 0.9 + 0.05, fy = (i / 16) * 0.85 + 0.1; c.beginPath(); c.ellipse(L + W * fx, T + H * fy, 1.6, 2.4, 0, 0, 7); c.fill(); } }
    if (k === 'Rubber duck') { c.fillStyle = 'rgba(245,200,50,.95)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(L + W * 0.3, T + H * 0.3, W * 0.12, H * 0.08, -0.5, 0, 7); c.fill();
      c.fillStyle = '#f08a2a'; c.beginPath(); c.ellipse(g.cx, T + H * 0.62, W * 0.16, H * 0.07, 0, 0, 7); c.fill(); }
    if (k === 'Clownfish') { c.fillStyle = 'rgba(240,120,42,.95)'; c.fillRect(L - 4, T - 4, W + 8, H + 8);
      for (const f of [0.26, 0.7]) { c.fillStyle = rgb(BLACK); c.fillRect(L - 4, T + H * f - 4, W + 8, H * 0.14 + 8); c.fillStyle = '#fbfbf6'; c.fillRect(L - 4, T + H * f - 1, W + 8, H * 0.14 + 2); } }
    if (k === 'Candy cane') { c.fillStyle = 'rgba(250,248,244,.92)'; c.fillRect(L - 4, T - 4, W + 8, H + 8); c.fillStyle = '#d6303f';
      for (let i = -3; i < 6; i++) { const x0 = L + i * W * 0.24; c.beginPath(); c.moveTo(x0, T + H + 4); c.lineTo(x0 + W * 0.1, T + H + 4); c.lineTo(x0 + W * 0.1 + H * 0.9, T - 4); c.lineTo(x0 + H * 0.9, T - 4); c.closePath(); c.fill(); } }
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
      front(c, g, x) { PLODLEG(c, g, x, g.cx - g.bw * 0.25, x.L.legL, 0, false); PLODLEG(c, g, x, g.cx + g.bw * 0.25, x.L.legR, 2, false);   // front legs set out wide, under the shoulders
        const sw = Math.sin(x.t / 420) * 6, tw = by(g.stage, 9, 11, 13), y0 = g.top + g.bh * 0.5, y1 = g.bot + by(g.stage, 2, 6, 8);
        if (g.stage === 'Mega') for (const sd of [-1, 1]) { c.strokeStyle = '#f6efe0'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx + sd * 12, y0 + 18); c.quadraticCurveTo(g.cx + sd * 22, y0 + 34, g.cx + sd * 14, y0 + 40); c.stroke(); }
        // the trunk: a dark edge and a shade darker than the body so it reads against the face, a lighter ridge down the front and three wrinkles
        const tq = [g.cx, y0, g.cx + sw * 0.4, (y0 + y1) / 2, g.cx + sw, y1], plain = !x.L.tail || x.L.tail === 'flesh';
        if (plain) { c.lineCap = 'round'; c.strokeStyle = rgb(dk(x.body, 0.5)); c.lineWidth = tw + 3.5; c.beginPath(); c.moveTo(tq[0], tq[1]); c.quadraticCurveTo(tq[2], tq[3], tq[4], tq[5]); c.stroke(); }
        limb(c, tq, tw, plain ? dk(x.body, 0.14) : x.body, x.L.tail, x.t);
        if (plain) { const gr = c.createLinearGradient(0, y0 - tw, 0, y0 + tw * 1.4); gr.addColorStop(0, rgba(x.body, 1)); gr.addColorStop(0.55, rgba(x.body, 1)); gr.addColorStop(1, rgba(x.body, 0));   // the root of the trunk grows out of the face
          c.fillStyle = gr; c.beginPath(); c.ellipse(g.cx + sw * 0.05, y0 + tw * 0.2, tw * 0.95, tw * 1.25, 0, 0, 7); c.fill(); }
        if (plain) { c.strokeStyle = rgba(lt(x.body, 0.35), 0.55); c.lineWidth = tw * 0.22; c.beginPath(); c.moveTo(tq[0] - tw * 0.15, tq[1] + 4); c.quadraticCurveTo(tq[2] - tw * 0.15, tq[3], tq[4] - tw * 0.15, tq[5] - 4); c.stroke();
          c.strokeStyle = rgb(dk(x.body, 0.45)); c.lineWidth = 1.4; for (const k of [0.45, 0.62, 0.78]) { const mt = 1 - k, px = mt * mt * tq[0] + 2 * mt * k * tq[2] + k * k * tq[4], py = mt * mt * tq[1] + 2 * mt * k * tq[3] + k * k * tq[5];
            c.beginPath(); c.moveTo(px - tw * 0.38, py - 1); c.quadraticCurveTo(px, py + 1.6, px + tw * 0.38, py - 1); c.stroke(); } }
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
    },

    /* ---------- the twelve families drawn on 15 Nov 2026: four common, four registered, four special ---------- */
    /* Puff: a mushroom. The cap is its body colour with pale spots, the face is on the pale stalk, and spores drift off it at Mega */
    Puff: {
      dims: { Bit: [70, 64], Byte: [88, 82], Mega: [106, 98] }, cap: 0.5,
      bottom() { return 178; }, height(st) { return this.dims[st][1] + 12; },
      path(c, g) { const ch = g.bh * this.cap, sw = g.bw * 0.62, sl = g.cx - sw / 2;
        c.beginPath(); c.moveTo(g.left - 4, g.top + ch); c.bezierCurveTo(g.left - 4, g.top - ch * 0.35, g.left + g.bw + 4, g.top - ch * 0.35, g.left + g.bw + 4, g.top + ch);
        c.quadraticCurveTo(g.cx + sw * 0.62, g.top + ch + 6, sl + sw, g.top + ch + 4); c.quadraticCurveTo(sl + sw + 4, g.bot, g.cx + sw * 0.3, g.bot);
        c.lineTo(g.cx - sw * 0.3, g.bot); c.quadraticCurveTo(sl - 4, g.bot, sl, g.top + ch + 4); c.quadraticCurveTo(g.cx - sw * 0.62, g.top + ch + 6, g.left - 4, g.top + ch); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 5.5), shoulderY: 0.72, armK: 0.75, shoulderIn: 0.18,
      behind(c, g, x) { for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.16, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, by(g.stage, 8, 9, 10), 5, lt(x.body, 0.7), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); } },
      inside(c, g, x) { const ch = g.bh * this.cap;
        c.fillStyle = rgb(lt(x.body, 0.78)); c.fillRect(g.left - 6, g.top + ch, g.bw + 12, g.bh);
        c.fillStyle = rgb(dk(x.body, 0.25)); c.beginPath(); c.ellipse(g.cx, g.top + ch, g.bw * 0.5 + 2, 5, 0, 0, Math.PI); c.fill();   // the gills under the rim
        if (g.stage !== 'Bit') { c.strokeStyle = rgba(dk(x.body, 0.4), 0.6); c.lineWidth = 1.5; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(g.cx + k * g.bw * 0.05, g.top + ch); c.lineTo(g.cx + k * g.bw * 0.1, g.top + ch + 4); c.stroke(); } }
        c.fillStyle = rgba(lt(x.acc, 0.6), 0.95);
        for (const [fx, fy, r] of [[0.3, 0.16, 0.09], [0.62, 0.1, 0.07], [0.78, 0.3, 0.06], [0.18, 0.36, 0.05], [0.48, 0.32, 0.05]].slice(0, by(g.stage, 3, 4, 5))) { c.beginPath(); c.ellipse(g.left + g.bw * fx, g.top + g.bh * fy, g.bw * r, g.bw * r * 0.8, 0, 0, 7); c.fill(); } },
      front(c, g, x) { if (g.stage === 'Mega') for (let k = 0; k < 6; k++) { const ph = (x.t / 2200 + k / 6) % 1, px = g.cx + Math.sin(k * 2.3 + ph * 4) * g.bw * 0.6, py = g.top + g.bh * 0.3 - ph * 50;
          c.fillStyle = rgba(lt(x.acc, 0.4), 0.8 * (1 - ph)); c.beginPath(); c.arc(px, py, 2.5 + (k % 3), 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.32, g.left + g.bw * 0.12, g.top + g.bh * 0.06, g.left + g.bw * 0.36, g.top - g.bh * 0.02],
      head: g => [g.cx, g.top - 4, g.bw * 0.56],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.66, ex: 0.13, my: 0.84, s: by(g.stage, 0.7, 0.8, 0.88), lidCol: lt(x.body, 0.78) })
    },
    /* Flit: a round bat that hovers on wide membrane wings, with big pointed ears, a fang and little hanging feet */
    Flit: {
      dims: { Bit: [58, 54], Byte: [72, 66], Mega: [86, 78] }, float: true, slots: { feet: false },
      bottom() { return 160; }, height(st) { return this.dims[st][1] + 40; },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      behind(c, g, x) { const fl = Math.sin(x.t / 110), span = g.bw * by(g.stage, 0.66, 0.72, 0.78), ws = by(g.stage, 0.9, 1, 1.1);
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.38, g.top + g.bh * 0.42); c.scale(sd, 1); c.rotate(-0.2 + fl * 0.35);
          const tips = [[span, -span * 0.42], [span * 1.02, span * 0.06], [span * 0.72, span * 0.38]];
          c.fillStyle = rgb(dk(x.parts, 0.32)); c.beginPath(); c.moveTo(0, -6); for (const [tx, ty] of tips) c.lineTo(tx, ty + 3); c.quadraticCurveTo(span * 0.3, span * 0.3, 0, 14); c.closePath(); c.fill();
          c.fillStyle = rgb(x.parts); c.beginPath(); c.moveTo(0, -8);
          tips.forEach(([tx, ty], i) => { c.lineTo(tx, ty); const nx = i < 2 ? tips[i + 1] : [0, 12]; c.quadraticCurveTo((tx + nx[0]) * 0.42, (ty + nx[1]) * 0.42 + 4, nx[0], nx[1]); });
          c.closePath(); c.fill();
          c.strokeStyle = rgb(dk(x.parts, 0.4)); c.lineWidth = 2.2 * ws; c.lineCap = 'round'; for (const [tx, ty] of tips) { c.beginPath(); c.moveTo(0, -4); c.lineTo(tx * 0.98, ty * 0.98); c.stroke(); }
          c.restore(); }
        for (const sd of [-1, 1]) { c.fillStyle = rgb(x.body); c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.08, g.top + 8); c.lineTo(g.cx + sd * g.bw * 0.44, g.top - g.bh * by(g.stage, 0.36, 0.42, 0.5)); c.lineTo(g.cx + sd * g.bw * 0.42, g.top + g.bh * 0.3); c.closePath(); c.fill();
          c.fillStyle = rgb(lt(x.acc, 0.25)); c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.18, g.top + 8); c.lineTo(g.cx + sd * g.bw * 0.4, g.top - g.bh * by(g.stage, 0.22, 0.28, 0.34)); c.lineTo(g.cx + sd * g.bw * 0.38, g.top + g.bh * 0.22); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * 8, fy = g.bot + 8 + Math.sin(x.t / 300 + sd) * 1.5; c.strokeStyle = rgb(dk(x.parts, 0.3)); c.lineWidth = 3; c.lineCap = 'round';
          c.beginPath(); c.moveTo(fx, g.bot - 2); c.lineTo(fx, fy); c.stroke(); for (const k of [-1, 1]) { c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + k * 3, fy + 4); c.stroke(); } } },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.3)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.12, g.bw * 0.3, g.bh * 0.24, 0, 0, 7); c.fill();
        if (g.stage === 'Mega') { c.fillStyle = rgb(lt(x.body, 0.45)); for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(g.cx + k * 6 - 4, g.top + g.bh * 0.72); c.lineTo(g.cx + k * 6, g.top + g.bh * 0.84); c.lineTo(g.cx + k * 6 + 4, g.top + g.bh * 0.72); c.fill(); } } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.48, g.left + g.bw * 0.16, g.top + g.bh * 0.18, g.left + g.bw * 0.4, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.18, my: 0.64, fang: true, s: by(g.stage, 0.74, 0.84, 0.92) })
    },
    /* Glop: a slime. A dome with a drippy hem that squashes and stretches as it breathes, a darker core and bubbles inside */
    Glop: {
      dims: { Bit: [76, 52], Byte: [96, 66], Mega: [114, 80] }, glass: true, patternAfter: true, slots: { feet: false },
      bottom() { return 182; }, height(st) { return this.dims[st][1] + 8; },
      path(c, g, x) { const t = x ? x.t : 0, br = Math.sin(t / 520) * 0.05, w = g.bw * (1 + br), h = g.bh * (1 - br), L = g.cx - w / 2, R = g.cx + w / 2, T = g.bot - h, n = by(g.stage, 4, 5, 6);
        c.beginPath(); c.moveTo(L, g.bot - 4); c.bezierCurveTo(L - 2, T - h * 0.12, R + 2, T - h * 0.12, R, g.bot - 4);
        for (let i = 0; i < n; i++) { const x0 = R - i * w / n, x1 = R - (i + 1) * w / n, d = 5 + ((i * 7) % 4); c.quadraticCurveTo((x0 + x1) / 2, g.bot + d, x1, g.bot - 4); } c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 7, 8), handR: st => by(st, 0, 6, 7), shoulderY: 0.62, armK: 0.7, shoulderIn: 0.02,
      inside(c, g, x) { c.fillStyle = rgb(x.body); c.globalAlpha = 0.85; c.fillRect(g.left - 10, g.top - 10, g.bw + 20, g.bh + 20);
        c.globalAlpha = 1; c.fillStyle = rgba(dk(x.body, 0.25), 0.7); c.beginPath(); c.arc(g.cx + Math.sin(x.t / 900) * 4, g.top + g.bh * 0.66, g.bw * by(g.stage, 0.1, 0.12, 0.14), 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 4; k++) { const ph = (x.t / 2400 + k / 4) % 1; c.beginPath(); c.arc(g.cx + (k - 1.5) * g.bw * 0.18, g.bot - 6 - ph * g.bh * 0.6, 1.5 + k % 2, 0, 7); c.fill(); }
        if (g.stage === 'Mega') { c.fillStyle = rgb(x.acc); star(c, g.cx + Math.sin(x.t / 900) * 4, g.top + g.bh * 0.66, 0.5, rgb(lt(x.acc, 0.3))); } },
      front(c, g, x) { const ph = (x.t / 1300) % 1; c.fillStyle = rgba(lt(x.body, 0.2), 0.85 * (1 - ph)); drop(c, g.left + g.bw * 0.22, g.bot + ph * 6, 0.55); c.fill();
        if (g.stage === 'Mega') for (let k = -1; k <= 1; k++) { const yy = g.top - 10 + Math.sin(x.t / 400 + k) * 3; c.fillStyle = rgba(lt(x.body, 0.3), 0.9); c.beginPath(); c.arc(g.cx + k * 16, yy, 5 - Math.abs(k), 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.2, g.top + g.bh * 0.52, g.left + g.bw * 0.22, g.top + g.bh * 0.3, g.left + g.bw * 0.36, g.top + g.bh * 0.22],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.44, ex: 0.17, my: 0.66, s: by(g.stage, 0.78, 0.88, 0.96) })
    },
    /* Tock: an alarm clock. A round case with the face on its dial, ticking hands above the eyes, twin bells and a hammer on top, and thin legs */
    Tock: {
      dims: { Bit: [62, 62], Byte: [80, 80], Mega: [96, 96] }, ll: st => by(st, 8, 12, 14),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 18, 22, 28); },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.58, armK: 0.8,
      behind(c, g, x) { const rg = Math.floor(x.t / 90) % 14 === 0 ? 2 : 0, br = by(g.stage, 11, 14, 17);
        for (const sd of [-1, 1]) { const bx = g.cx + sd * g.bw * 0.34 + (rg ? sd * 1.5 : 0), byy = g.top + 4;
          c.strokeStyle = rgb(dk(x.parts, 0.2)); c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.22, g.top + 10); c.lineTo(bx, byy); c.stroke();
          c.fillStyle = rgb(dk(x.parts, 0.25)); c.beginPath(); c.arc(bx, byy + 2, br, Math.PI, 0); c.closePath(); c.fill();
          c.fillStyle = rgb(x.parts); c.beginPath(); c.arc(bx, byy, br, Math.PI, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(bx - br * 0.35, byy - br * 0.5, br * 0.22, 0, 7); c.fill(); }
        c.strokeStyle = rgb(dk(x.parts, 0.2)); c.lineWidth = 3.5; c.beginPath(); c.moveTo(g.cx, g.top + 2); c.lineTo(g.cx, g.top - by(g.stage, 8, 10, 12)); c.stroke();
        c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(g.cx, g.top - by(g.stage, 9, 11, 13), 4, 0, 7); c.fill();
        if (g.stage === 'Mega') { c.save(); c.translate(g.cx + g.bw * 0.5, g.top + g.bh * 0.5); c.rotate(x.t / 700); c.strokeStyle = rgb(x.acc); c.lineWidth = 4; c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.stroke();
          for (const k of [-1, 1]) { c.beginPath(); c.ellipse(k * 10, 0, 5, 3.5, 0, 0, 7); c.stroke(); } c.restore(); }
        const ll = this.ll(g.stage), lw = by(g.stage, 4, 5, 6);
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 5; c.strokeStyle = rgb(dk(x.parts, 0.2)); c.lineWidth = lw; c.beginPath(); c.moveTo(hx, g.bot - 8); c.lineTo(hx + sd * 4, 181 - lift); c.stroke();
          blob(c, hx + sd * 5, 182 - lift, by(g.stage, 7, 8, 9), 4.5, x.parts, sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([hx + sd * 5, 182 - lift, 7]); } },
      inside(c, g, x) { const r = g.bw * 0.4, cy = g.top + g.bh / 2;
        c.fillStyle = rgb(lt(x.body, 0.82)); c.beginPath(); c.arc(g.cx, cy, r, 0, 7); c.fill(); c.strokeStyle = rgb(dk(x.body, 0.2)); c.lineWidth = 2.5; c.stroke();
        c.strokeStyle = rgb(dk(x.body, 0.45)); c.lineCap = 'round';
        for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, r0 = r * (k % 3 ? 0.9 : 0.82); c.lineWidth = k % 3 ? 1.5 : 2.5; c.beginPath(); c.moveTo(g.cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(g.cx + Math.cos(a) * r * 0.97, cy + Math.sin(a) * r * 0.97); c.stroke(); }
        const hy = cy, ha = x.t / 3000 - 0.6, ma = x.t / 250; c.strokeStyle = rgba(dk(x.body, 0.55), 0.55); c.lineCap = 'round'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(g.cx, hy); c.lineTo(g.cx + Math.sin(ha) * r * 0.5, hy - Math.cos(ha) * r * 0.5); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(g.cx, hy); c.lineTo(g.cx + Math.sin(ma) * r * 0.78, hy - Math.cos(ma) * r * 0.78); c.stroke();
        c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(g.cx, hy, 2.6, 0, 7); c.fill(); },
      hl: g => [g.left + g.bw * 0.08, g.top + g.bh * 0.55, g.left + g.bw * 0.06, g.top + g.bh * 0.22, g.left + g.bw * 0.28, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top - 8, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.52, ex: 0.17, my: 0.74, s: by(g.stage, 0.66, 0.76, 0.84), lidCol: lt(x.body, 0.82) })
    },
    /* Mitt: a boxing glove. The face is on the back of the glove, the thumb bulges out one side, a laced cuff sits at the bottom, and it stands on two short legs */
    Mitt: {
      dims: { Bit: [70, 66], Byte: [90, 84], Mega: [106, 100] }, ll: st => by(st, 8, 11, 13), cuff: 0.2,
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 6; },
      path(c, g) { const cb = g.bh * this.cuff, T = g.top, B = g.bot - cb, L = g.left, R = L + g.bw;
        c.beginPath(); c.moveTo(L + g.bw * 0.12, B); c.bezierCurveTo(L - g.bw * 0.06, B - g.bh * 0.3, L - g.bw * 0.02, T, g.cx - g.bw * 0.06, T);
        c.bezierCurveTo(R + g.bw * 0.02, T - g.bh * 0.02, R + g.bw * 0.06, B - g.bh * 0.36, R - g.bw * 0.1, B); c.closePath(); },
      behind(c, g, x) { const ll = this.ll(g.stage), lw = by(g.stage, 9, 11, 12);
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 5; limb(c, [hx, g.bot - 6, hx, g.bot + ll * 0.5, hx, 181 - lift], lw, dk(x.body, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t);
          blob(c, hx, 182 - lift, by(g.stage, 9, 11, 12), 5.5, x.parts, sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([hx, 182 - lift, 8]); }
        // the thumb, tucked against the left side
        if (g.stage === 'Mega') { const hy = g.top + g.bh * 0.12, sw = Math.sin(x.t / 200) * 3; c.fillStyle = rgb(dk(x.acc, 0.1));   // the headband's tails, trailing behind
          for (const k of [0, 1]) { c.beginPath(); c.moveTo(g.left + g.bw * 0.9, hy + k * 6); c.quadraticCurveTo(g.left + g.bw * 1.12, hy + 4 + k * 8 + sw, g.left + g.bw * 1.22, hy + 12 + k * 10 + sw); c.lineTo(g.left + g.bw * 1.16, hy + 16 + k * 10 + sw); c.quadraticCurveTo(g.left + g.bw * 1.06, hy + 10 + k * 8, g.left + g.bw * 0.86, hy + 8 + k * 6); c.closePath(); c.fill(); } }
        const tx = g.left + g.bw * 0.02, ty = g.top + g.bh * 0.5; c.fillStyle = rgb(dk(x.body, 0.32)); c.beginPath(); c.ellipse(tx, ty + 3, g.bw * 0.16, g.bh * 0.2, -0.4, 0, 7); c.fill(); c.fillStyle = rgb(dk(x.body, 0.06)); c.beginPath(); c.ellipse(tx, ty, g.bw * 0.16, g.bh * 0.2, -0.4, 0, 7); c.fill(); },
      front(c, g, x) { const cb = g.bh * this.cuff, cy = g.bot - cb - 2, cw = g.bw * 0.8;
        roundBox(c, g.cx - cw / 2, cy + 3, cw, cb + 2, 6); c.fillStyle = rgb(dk(x.parts, 0.3)); c.fill();
        roundBox(c, g.cx - cw / 2, cy, cw, cb + 2, 6); c.fillStyle = rgb(x.parts); c.fill();
        c.strokeStyle = rgb(lt(x.acc, 0.5)); c.lineWidth = 2; for (let k = 0; k < by(g.stage, 2, 3, 4); k++) { const yy = cy + 4 + k * (cb - 4) / by(g.stage, 2, 3, 4); c.beginPath(); c.moveTo(g.cx - 5, yy); c.lineTo(g.cx + 5, yy + 4); c.moveTo(g.cx + 5, yy); c.lineTo(g.cx - 5, yy + 4); c.stroke(); }
        if (g.stage === 'Byte') { c.fillStyle = 'rgba(255,255,255,.75)'; for (const fx of [-0.36, 0.3]) c.fillRect(g.cx + fx * cw, cy, cw * 0.08, cb + 2); }   // athletic tape
        if (g.stage === 'Mega') { roundBox(c, g.cx - cw * 0.44, cy + cb * 0.18, cw * 0.32, cb * 0.7, 3); c.fillStyle = '#e9b23a'; c.fill(); star(c, g.cx - cw * 0.28, cy + cb * 0.53, 0.4, '#fff6c4');
          for (let k = -1; k <= 1; k++) { const sx = g.cx + k * g.bw * 0.2, sy = g.top + 5 + Math.abs(k) * 4; c.fillStyle = '#8a8f99'; c.beginPath(); c.arc(sx, sy + 1.5, 4.5, 0, 7); c.fill(); c.fillStyle = '#d6dae2'; c.beginPath(); c.arc(sx, sy, 4.5, 0, 7); c.fill(); }   // knuckle studs
          const hy = g.top + g.bh * 0.12; c.fillStyle = rgb(x.acc); c.beginPath(); c.moveTo(g.left + g.bw * 0.08, hy + 4); c.quadraticCurveTo(g.cx, hy - 6, g.left + g.bw * 0.94, hy + 6); c.lineTo(g.left + g.bw * 0.95, hy + 13); c.quadraticCurveTo(g.cx, hy + 1, g.left + g.bw * 0.06, hy + 11); c.closePath(); c.fill(); } },
      inside(c, g, x) { c.strokeStyle = rgba(dk(x.body, 0.3), 0.55); c.lineWidth = 2; c.beginPath(); c.moveTo(g.left + g.bw * 0.22, g.top + g.bh * 0.18); c.quadraticCurveTo(g.cx, g.top + g.bh * 0.06, g.left + g.bw * 0.8, g.top + g.bh * 0.2); c.stroke();
        if (g.stage !== 'Bit') { c.setLineDash([3, 4]); c.beginPath(); c.moveTo(g.left + g.bw * 0.14, g.top + g.bh * 0.3); c.quadraticCurveTo(g.cx, g.top + g.bh * 0.16, g.left + g.bw * 0.88, g.top + g.bh * 0.32); c.stroke(); c.setLineDash([]); } },
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.46, g.left + g.bw * 0.16, g.top + g.bh * 0.14, g.left + g.bw * 0.42, g.top + g.bh * 0.04],
      head: g => [g.cx, g.top + 2, g.bw * 0.48],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.4, ex: 0.17, my: 0.6, s: by(g.stage, 0.76, 0.86, 0.94) })
    },
    /* Brolly: an umbrella. The face is on the canopy, panels alternate light and dark, and it hops on its hooked handle */
    Brolly: {
      dims: { Bit: [80, 46], Byte: [100, 56], Mega: [120, 66] }, hl_: 0, hh: st => by(st, 30, 38, 46), slots: { feet: false },
      bottom(st) { return 184 - this.hh(st); }, height(st) { return this.dims[st][1] + this.hh(st) + 12; },
      path(c, g) { const n = by(g.stage, 4, 5, 6), w = g.bw / n, R = g.left + g.bw;
        c.beginPath(); c.moveTo(g.left, g.bot); c.bezierCurveTo(g.left, g.top - g.bh * 0.3, R, g.top - g.bh * 0.3, R, g.bot);
        for (let i = 0; i < n; i++) c.quadraticCurveTo(R - (i + 0.5) * w, g.bot - 9, R - (i + 1) * w, g.bot); c.closePath(); },
      behind(c, g, x) { const hh = this.hh(g.stage), hop = Math.max(0, Math.sin(x.t / 260)) * (x.walk ? 4 : 0), lw = by(g.stage, 4.5, 5, 6), hx = g.cx, hb = 183 - hop;
        c.strokeStyle = rgb(dk(x.parts, 0.35)); c.lineWidth = lw + 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, g.bot - 4); c.lineTo(hx, hb - 8); c.arc(hx - 8, hb - 8, 8, 0, Math.PI * 0.95); c.stroke();
        c.strokeStyle = rgb(x.parts); c.lineWidth = lw; c.beginPath(); c.moveTo(hx, g.bot - 4); c.lineTo(hx, hb - 8); c.arc(hx - 8, hb - 8, 8, 0, Math.PI * 0.95); c.stroke();
        x.feet.push([hx - 4, hb, 6]);
        if (g.stage !== 'Bit') { const by0 = g.bot + 8; c.fillStyle = rgb(x.acc); for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(hx, by0); c.lineTo(hx + sd * 9, by0 - 5); c.lineTo(hx + sd * 9, by0 + 5); c.closePath(); c.fill(); } c.beginPath(); c.arc(hx, by0, 3, 0, 7); c.fill(); }   // a bow tied on the handle
        if (g.stage === 'Mega') { const tw = g.bw * 0.42, ty = g.top - g.bh * 0.12 - 4, th = 16;   // a second, smaller canopy on top
          c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.moveTo(g.cx - tw / 2, ty + 3); c.quadraticCurveTo(g.cx, ty - th * 1.4 + 3, g.cx + tw / 2, ty + 3); c.closePath(); c.fill();
          c.fillStyle = rgb(lt(x.body, 0.18)); c.beginPath(); c.moveTo(g.cx - tw / 2, ty); c.quadraticCurveTo(g.cx, ty - th * 1.4, g.cx + tw / 2, ty); c.closePath(); c.fill(); }
        c.strokeStyle = rgb(dk(x.parts, 0.2)); c.lineWidth = 3.5; c.beginPath(); c.moveTo(g.cx, g.top - g.bh * 0.12); c.lineTo(g.cx, g.top - g.bh * 0.12 - by(g.stage, 8, 10, 12)); c.stroke();
        c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(g.cx, g.top - g.bh * 0.12 - by(g.stage, 9, 11, 13) - (g.stage === 'Mega' ? 14 : 0), 3.5, 0, 7); c.fill(); },
      inside(c, g, x) { const n = by(g.stage, 4, 5, 6), w = g.bw / n;
        if (g.stage !== 'Bit') for (let i = 0; i < n; i += 2) { c.fillStyle = rgba(lt(x.body, 0.25), 0.9); c.beginPath(); c.moveTo(g.cx, g.top - g.bh * 0.12); c.lineTo(g.left + i * w, g.bot + 2); c.lineTo(g.left + (i + 1) * w, g.bot + 2); c.closePath(); c.fill(); }
        c.strokeStyle = rgba(dk(x.body, 0.3), 0.6); c.lineWidth = 1.6; for (let i = 1; i < n; i++) { c.beginPath(); c.moveTo(g.cx, g.top - g.bh * 0.12); c.lineTo(g.left + i * w, g.bot - 7); c.stroke(); } },
      front(c, g, x) { const n = by(g.stage, 4, 5, 6), w = g.bw / n;
        for (let i = 0; i <= n; i++) { c.fillStyle = rgb(dk(x.parts, 0.1)); c.beginPath(); c.arc(g.left + i * w, g.bot - (i === 0 || i === n ? 0 : 8), 2.6, 0, 7); c.fill(); }
        if (g.stage === 'Mega') for (let i = 0; i <= n; i++) { const ph = (x.t / 1100 + i * 0.37) % 1; c.fillStyle = `rgba(150,205,250,${0.9 * (1 - ph)})`; drop(c, g.left + i * w, g.bot + 4 + ph * 22, 0.5); c.fill(); }   // rain running off the rim
        if (g.stage === 'Mega') for (let i = 0; i < n; i++) { const tx = g.left + (i + 0.5) * w, sw = Math.sin(x.t / 300 + i) * 2; c.strokeStyle = rgb(x.acc); c.lineWidth = 1.6; c.beginPath(); c.moveTo(tx, g.bot - 6); c.lineTo(tx + sw, g.bot + 2); c.stroke();
            c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(tx + sw, g.bot + 4, 2.4, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.66, g.left + g.bw * 0.14, g.top + g.bh * 0.12, g.left + g.bw * 0.4, g.top - g.bh * 0.08],
      head: g => [g.cx, g.top - g.bh * 0.16, g.bw * 0.4],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.48, ex: 0.13, my: 0.76, s: by(g.stage, 0.66, 0.74, 0.82) })
    },
    /* Spine: a potted cactus. A ribbed column with spines and the face on its front, arms branching up from Byte, a flower on top at Mega, in a clay pot it hops in */
    Spine: {
      dims: { Bit: [52, 64], Byte: [62, 84], Mega: [74, 102] }, ph: st => by(st, 18, 22, 26), slots: { feet: false },
      bottom(st) { return 184 - this.ph(st) + 6; }, height(st) { return this.dims[st][1] + this.ph(st) - 2 + (st === 'Mega' ? 12 : 0); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh + 6, g.bw * 0.46); },
      behind(c, g, x) { if (g.stage === 'Bit') return; const aw = by(g.stage, 0, 13, 15), sw = Math.sin(x.t / 500) * 0.06, A = x.P.arm || [[12, 8, 16, 22], [12, 8, 16, 22]];
        const reach = Math.max(-0.3, Math.min(1, (A[1][2] - 16) / 30)), lift = Math.max(0, Math.min(1, (-A[1][3] - 22) / 30));   // how far the right arm, the one facing the opponent, is thrown out or up
        for (const [sd, hy, up] of g.stage === 'Mega' ? [[-1, 0.5, 0.4], [1, 0.36, 0.34]] : [[1, 0.46, 0.3]]) { const sx = g.cx + sd * g.bw * 0.3, sy = g.top + g.bh * hy, ex = g.cx + sd * g.bw * 0.78, ey = sy - g.bh * up;
          const rot = sd > 0 ? 1.15 * Math.max(0, reach) - 0.3 * lift : -sw;   // a punch swings the arm forward and down onto the target
          c.save(); c.translate(sx, sy); c.rotate(sd * (sw + rot)); c.translate(-sx, -sy);
          c.strokeStyle = rgb(dk(x.body, 0.38)); c.lineWidth = aw + 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy + 2); c.lineTo(ex, sy + 2); c.lineTo(ex, ey + 2); c.stroke();
          c.strokeStyle = rgb(x.body); c.lineWidth = aw; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, sy); c.lineTo(ex, ey); c.stroke();
          if (sd > 0 && CAP) (CAP.hands = CAP.hands || []).push(capPt(c, ex, ey));
          c.restore(); } },
      inside(c, g, x) { c.strokeStyle = rgba(dk(x.body, 0.22), 0.6); c.lineWidth = 2.2; for (const k of [-0.28, 0.28]) { c.beginPath(); c.moveTo(g.cx + k * g.bw, g.top + 10); c.lineTo(g.cx + k * g.bw * 1.1, g.bot + 6); c.stroke(); }
        c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.4; c.lineCap = 'round';
        for (let k = 0; k < by(g.stage, 8, 12, 16); k++) { const px = g.left + g.bw * (0.08 + ((k * 0.37) % 0.84)), py = g.top + g.bh * (0.08 + ((k * 0.53) % 0.9)); if (Math.abs(px - g.cx) < g.bw * 0.24 && py > g.top + g.bh * 0.3 && py < g.top + g.bh * 0.8) continue;
          c.beginPath(); c.moveTo(px - 2, py); c.lineTo(px + 2, py - 1); c.moveTo(px, py - 2); c.lineTo(px + 1, py + 2); c.stroke(); } },
      front(c, g, x) { const ph = this.ph(g.stage), pw = g.bw * 1.12, py = g.bot - 2, hop = x.walk ? Math.max(0, Math.sin(x.t / 200)) * 3 : 0;
        const clay = mix(x.parts, [196, 112, 72], 0.65);
        c.fillStyle = rgb(dk(clay, 0.3)); c.beginPath(); c.moveTo(g.cx - pw / 2, py + 3); c.lineTo(g.cx + pw / 2, py + 3); c.lineTo(g.cx + pw * 0.38, py + ph + 3 - hop); c.lineTo(g.cx - pw * 0.38, py + ph + 3 - hop); c.closePath(); c.fill();
        c.fillStyle = rgb(clay); c.beginPath(); c.moveTo(g.cx - pw / 2, py); c.lineTo(g.cx + pw / 2, py); c.lineTo(g.cx + pw * 0.38, py + ph - hop); c.lineTo(g.cx - pw * 0.38, py + ph - hop); c.closePath(); c.fill();
        roundBox(c, g.cx - pw / 2 - 4, py - 3, pw + 8, 9, 3); c.fillStyle = rgb(lt(clay, 0.15)); c.fill();
        x.feet.push([g.cx, py + ph, pw * 0.3]);
        if (g.stage === 'Mega') { const fx = g.cx + 6, fy = g.top - 2; c.fillStyle = rgb(x.acc); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3; c.beginPath(); c.ellipse(fx + Math.cos(a) * 7, fy + Math.sin(a) * 7, 6, 4, a, 0, 7); c.fill(); }
          c.fillStyle = '#ffe27a'; c.beginPath(); c.arc(fx, fy, 4, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.18, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.16, g.left + g.bw * 0.4, g.top + g.bh * 0.04],
      head: g => [g.cx, g.top + 2, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.18, my: 0.62, s: by(g.stage, 0.7, 0.78, 0.86) })
    },
    /* Burr: a mole. A soft oval with a pink nose, small squinting eyes, whiskers, big spade paws with claws in front, and clods of dirt at Mega */
    Burr: {
      dims: { Bit: [74, 58], Byte: [94, 72], Mega: [112, 86] }, ll: st => by(st, 4, 5, 6),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 6 + (st === 'Mega' ? 10 : 0); },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      behind(c, g, x) { if (g.stage === 'Mega') for (let k = -2; k <= 2; k++) { const px = g.cx + k * g.bw * 0.17, py = g.top - 1 + Math.abs(k) * 6, r = 13 - Math.abs(k) * 1.5;   // a ridge of rock plates along its back
          c.fillStyle = '#6f6a62'; c.beginPath(); c.ellipse(px, py + 2, r, r * 0.8, 0, 0, 7); c.fill(); c.fillStyle = '#9a948a'; c.beginPath(); c.ellipse(px, py, r, r * 0.8, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(px - r * 0.3, py - r * 0.3, r * 0.25, 0, 7); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, by(g.stage, 10, 12, 14), 5, lt(x.parts, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 9]); } },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.35)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.12, g.bw * 0.3, g.bh * 0.26, 0, 0, 7); c.fill();
        c.strokeStyle = rgba(dk(x.body, 0.2), 0.5); c.lineWidth = 1.6; for (let k = 0; k < 9; k++) { const a = k * 0.7 + 0.2, px = g.cx + Math.cos(a) * g.bw * 0.4, py = g.top + g.bh * 0.5 + Math.sin(a) * g.bh * 0.38; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 2, py + 4); c.stroke(); } },
      /* long spade paws reaching forward and down, three long claws each; they dig when it walks */
      front(c, g, x) { const sz = by(g.stage, 1, 1.15, 1.32), dig = x.walk ? Math.sin(x.t / 120) * 0.25 : Math.sin(x.t / 700) * 0.06, cl = by(g.stage, 9, 11, 14);
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.36, g.top + g.bh * 0.7); c.scale(sd * sz, sz); c.rotate(0.55 + dig * sd);
          c.fillStyle = rgb(dk(x.parts, 0.28)); c.beginPath(); c.ellipse(8, 3, 16, 7.5, 0, 0, 7); c.fill(); c.fillStyle = rgb(lt(x.parts, 0.18)); c.beginPath(); c.ellipse(8, 1, 16, 7.5, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(12, 3, 8, 3.5, 0, 0, 7); c.fill();
          c.fillStyle = '#f4ead8'; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(21, k * 4.6 - 2.2); c.quadraticCurveTo(21 + cl * 0.7, k * 5 - 1, 21 + cl, k * 5.6 + 1); c.lineTo(21, k * 4.6 + 2.2); c.closePath(); c.fill(); } c.restore(); }
        if (g.stage === 'Byte') { const gy = g.top + g.bh * 0.16;   // digging goggles pushed up on its forehead
          c.strokeStyle = rgb(dk(x.parts, 0.3)); c.lineWidth = 3.5; c.beginPath(); c.moveTo(g.cx - g.bw * 0.44, gy + 8); c.quadraticCurveTo(g.cx, gy - 6, g.cx + g.bw * 0.44, gy + 8); c.stroke();
          for (const sd of [-1, 1]) { c.fillStyle = rgb(dk(x.parts, 0.3)); c.beginPath(); c.arc(g.cx + sd * 10, gy, 8, 0, 7); c.fill(); c.fillStyle = 'rgba(160,215,240,.9)'; c.beginPath(); c.arc(g.cx + sd * 10, gy, 5.5, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(g.cx + sd * 10 - 2, gy - 2, 1.6, 0, 7); c.fill(); } }
        if (g.stage === 'Mega') { c.fillStyle = '#8a6440'; for (const [px, py, r] of [[-0.56, 1.02, 5], [0.6, 1, 4], [-0.4, 1.08, 3], [0.44, 1.07, 3]]) { c.beginPath(); c.arc(g.cx + px * g.bw, g.top + g.bh * py, r, 0, 7); c.fill(); } } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.18, g.left + g.bw * 0.4, g.top + g.bh * 0.04],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.4, ex: 0.14, my: 0.72, s: by(g.stage, 0.6, 0.66, 0.72) }), ny = g.top + g.bh * 0.57, s = fi.s;
        c.strokeStyle = rgba(dk(x.body, 0.5), 0.7); c.lineWidth = 1.4; for (const sd of [-1, 1]) for (const k of [-4, 0, 4]) { c.beginPath(); c.moveTo(g.cx + sd * 10 * s, ny + k * 0.6); c.lineTo(g.cx + sd * 26 * s, ny + k * 1.6); c.stroke(); }
        c.fillStyle = '#e88aa0'; c.beginPath(); c.ellipse(g.cx, ny, 9 * s, 6.5 * s, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(g.cx - 3 * s, ny - 2 * s, 2.5 * s, 1.6 * s, 0, 0, 7); c.fill();
        return fi; }
    },
    /* ---------- batch 3, drawn 16 Nov 2026: ten commons and ten uncommons (docs/BATCH-PLAN.md) ---------- */
    /* Wick: a candle stub. A wax column in its body colour with drips down the rim, a wick and a flickering flame on top.
       Mega is a candelabra: a crown of melted wax, a blue-hot flame, and two brass arms each holding a small candle of its own, on a brass stand it hops on */
    Wick: {
      dims: { Bit: [50, 56], Byte: [60, 74], Mega: [66, 80] }, ll: st => by(st, 6, 8, 30),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 26, 32, 52); },
      path(c, g) { const r = g.bw * 0.2; c.beginPath(); c.moveTo(g.left, g.top + r);
        if (g.stage === 'Mega') { const n = 5, w = g.bw / n; c.lineTo(g.left, g.top); for (let i = 0; i < n; i++) { c.lineTo(g.left + (i + 0.5) * w, g.top + (i % 2 ? 9 : 5)); c.lineTo(g.left + (i + 1) * w, g.top - (i === 1 || i === 3 ? 4 : 0)); } }
        else { c.quadraticCurveTo(g.left, g.top, g.left + r, g.top); c.lineTo(g.left + g.bw - r, g.top); c.quadraticCurveTo(g.left + g.bw, g.top, g.left + g.bw, g.top + r); }
        c.lineTo(g.left + g.bw, g.bot - 6); c.quadraticCurveTo(g.left + g.bw, g.bot, g.left + g.bw - 6, g.bot); c.lineTo(g.left + 6, g.bot); c.quadraticCurveTo(g.left, g.bot, g.left, g.bot - 6); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 0), handR: st => by(st, 0, 4.5, 0), shoulderY: 0.56, armK: 0.8,
      flame(c, fx, fy, fh, t, hot) { const fl = 1 + Math.sin(t / 90) * 0.08, one = (s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(fx, fy - fh * s * fl); c.quadraticCurveTo(fx + fh * 0.42 * s, fy - fh * 0.3 * s, fx, fy + 2); c.quadraticCurveTo(fx - fh * 0.42 * s, fy - fh * 0.3 * s, fx, fy - fh * s * fl); c.fill(); };
        const g2 = c.createRadialGradient(fx, fy - fh * 0.4, 1, fx, fy - fh * 0.4, fh * 1.4); g2.addColorStop(0, hot ? 'rgba(170,210,255,.5)' : 'rgba(255,220,130,.45)'); g2.addColorStop(1, 'rgba(255,220,130,0)'); c.fillStyle = g2; c.fillRect(fx - fh * 1.5, fy - fh * 2, fh * 3, fh * 2.6);
        if (hot) { one(1.12, '#ff6a2a'); one(0.86, '#ffd35a'); one(0.58, '#ffffff'); one(0.36, '#7fc4ff'); } else { one(1, '#ff8a2e'); one(0.68, '#ffc64a'); one(0.36, '#fff4c2'); } },
      behind(c, g, x) { const ll = this.ll(g.stage);
        if (g.stage === 'Mega') { const brass = [214, 168, 70], hop = x.walk ? Math.max(0, Math.sin(x.t / 200)) * 3 : 0, sx = g.cx, foot = 182 - hop;   // the brass stand: a cup under the wax, a stem with a knot, a round foot
          c.fillStyle = rgb(dk(brass, 0.3)); c.beginPath(); c.ellipse(sx, foot + 1, g.bw * 0.5, 6, 0, 0, 7); c.fill(); c.fillStyle = rgb(brass); c.beginPath(); c.ellipse(sx, foot - 1, g.bw * 0.5, 5.5, 0, 0, 7); c.fill();
          c.fillStyle = rgb(dk(brass, 0.12)); c.fillRect(sx - 5, g.bot, 10, foot - g.bot - 2); c.beginPath(); c.ellipse(sx, g.bot + ll * 0.5, 9, 6, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(sx - 3, g.bot + 2, 2, foot - g.bot - 6); x.feet.push([sx, foot, g.bw * 0.4]);
          for (const sd of [-1, 1]) { const ax = g.cx + sd * g.bw * 0.95, ay = g.top + g.bh * 0.42, sw = Math.sin(x.t / 500 + sd) * 2;   // two arms, each with its own small candle
            c.strokeStyle = rgb(dk(brass, 0.3)); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx, g.bot - 2); c.bezierCurveTo(g.cx + sd * g.bw * 0.5, g.bot + 14, ax, g.bot + 4, ax, ay + 12); c.stroke();
            c.strokeStyle = rgb(brass); c.lineWidth = 4; c.stroke(); c.fillStyle = rgb(brass); c.beginPath(); c.ellipse(ax, ay + 12, 10, 4, 0, 0, 7); c.fill();
            roundBox(c, ax - 6, ay - 10 + sw, 12, 22, 3); c.fillStyle = rgb(lt(x.body, 0.1)); c.fill(); c.fillStyle = rgb(lt(x.body, 0.45)); c.fillRect(ax - 4, ay - 10 + sw, 3, 9);
            c.strokeStyle = '#3a2a20'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ax, ay - 10 + sw); c.lineTo(ax, ay - 14 + sw); c.stroke(); this.flame(c, ax, ay - 14 + sw, 13, x.t + sd * 300, false);
            if (CAP && sd > 0) (CAP.hands = CAP.hands || []).push(capPt(c, ax, ay)); }
          return; }
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4;
          limb(c, [hx, g.bot - 4, hx, g.bot + ll * 0.5, hx, 181 - lift], by(g.stage, 7, 8, 9), dk(x.body, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t);
          blob(c, hx, 182 - lift, by(g.stage, 7, 8, 9), 4.5, lt(x.body, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([hx, 182 - lift, 7]); } },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.35)); for (const [fx, d] of [[0.12, 0.3], [0.36, 0.18], [0.68, 0.38], [0.86, 0.22]].slice(0, by(g.stage, 2, 3, 4))) { const dx = g.left + g.bw * fx;
          c.beginPath(); c.moveTo(dx - 5, g.top); c.lineTo(dx - 4, g.top + g.bh * d); c.arc(dx, g.top + g.bh * d, 4, Math.PI, 0, true); c.lineTo(dx + 5, g.top); c.closePath(); c.fill(); }   // wax drips down from the rim
        if (g.stage === 'Mega') { c.strokeStyle = rgba(dk(x.body, 0.3), 0.5); c.lineWidth = 2; for (const k of [0.6, 0.8]) { c.beginPath(); c.moveTo(g.left, g.top + g.bh * k); c.quadraticCurveTo(g.cx, g.top + g.bh * k + 4, g.left + g.bw, g.top + g.bh * k); c.stroke(); }   // carved rings
          c.fillStyle = '#e9b23a'; c.beginPath(); c.arc(g.cx, g.top + g.bh * 0.7, 4, 0, 7); c.fill(); return; }
        c.fillStyle = rgb(lt(x.body, 0.5)); c.beginPath(); c.ellipse(g.cx, g.top + 3, g.bw * 0.36, 3.5, 0, 0, 7); c.fill(); },
      front(c, g, x) { const mega = g.stage === 'Mega', fh = by(g.stage, 16, 20, 34), fx = g.cx + Math.sin(x.t / 140) * 1.5, fy = g.top - (mega ? 2 : 6);
        c.strokeStyle = '#3a2a20'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx, g.top + 4); c.quadraticCurveTo(g.cx + 2, fy + 2, fx, fy); c.stroke();
        this.flame(c, fx, fy, fh, x.t, mega);
        if (mega) for (let k = 0; k < 7; k++) { const ph = (x.t / 1300 + k / 7) % 1; c.fillStyle = `rgba(${k % 2 ? '150,200,255' : '255,190,90'},${1 - ph})`; c.beginPath(); c.arc(fx + Math.sin(k * 2.1 + ph * 6) * 12, fy - fh - ph * 34, 1.8, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.7, g.left + g.bw * 0.12, g.top + g.bh * 0.2, g.left + g.bw * 0.26, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.38, ex: 0.2, my: 0.58, s: by(g.stage, 0.66, 0.74, 0.8) })
    },
    /* Lumo: a firefly. A round body that hovers on little clear wings, two antennae, and a tail lamp under it that pulses.
       Mega is the firefly queen: it rides a big ribbed lantern of a tail, on four long wings with glowing veins, wears a crown of light, and three little fireflies circle it */
    Lumo: {
      dims: { Bit: [52, 48], Byte: [64, 58], Mega: [70, 62] }, float: true, slots: { feet: false },
      bottom(st) { return st === 'Mega' ? 112 : 150; }, height(st) { return this.dims[st][1] + (st === 'Mega' ? 96 : 46); },
      behind(c, g, x) { const fl = Math.sin(x.t / 45), mega = g.stage === 'Mega', lp = 0.65 + 0.35 * Math.sin(x.t / 380);
        if (mega) for (const [yk, sz, ang] of [[0.3, 1.1, -0.55], [0.6, 0.85, 0.15]]) for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.3, g.top + g.bh * yk); c.rotate(sd * (ang + fl * 0.18));   // four long wings with glowing veins
            const wl = g.bw * 0.62 * sz, wh = g.bh * 0.2 * sz; c.fillStyle = 'rgba(230,245,255,.6)'; c.strokeStyle = `rgba(240,255,140,${0.6 + 0.4 * lp})`; c.lineWidth = 1.6;
            c.beginPath(); c.ellipse(sd * wl, 0, wl, wh, 0, 0, 7); c.fill(); c.stroke(); c.lineWidth = 1; for (const k of [-0.4, 0, 0.4]) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sd * wl, wh * k * 1.5, sd * wl * 1.9, wh * k); c.stroke(); } c.restore(); }
        else for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.34, g.top + g.bh * 0.38); c.rotate(sd * (-0.35 + fl * 0.25));
          c.fillStyle = 'rgba(225,240,255,.55)'; c.strokeStyle = 'rgba(160,190,220,.8)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(sd * g.bw * 0.3, -g.bh * 0.12, g.bw * 0.32, g.bh * 0.17, sd * 0.3, 0, 7); c.fill(); c.stroke(); c.restore(); }
        const tr = mega ? g.bw * 0.66 : g.bw * by(g.stage, 0.3, 0.34, 0.38), tx = g.cx, ty = g.bot + tr * (mega ? 0.8 : 0.35);   // the tail lamp
        const gl = c.createRadialGradient(tx, ty, 1, tx, ty, tr * 3); gl.addColorStop(0, `rgba(230,255,120,${0.75 * lp})`); gl.addColorStop(1, 'rgba(230,255,120,0)'); c.fillStyle = gl; c.fillRect(tx - tr * 3, ty - tr * 3, tr * 6, tr * 6);
        c.fillStyle = rgb(mix([224, 250, 90], [255, 214, 60], 0.5 - 0.5 * lp)); c.beginPath(); c.ellipse(tx, ty, tr, tr * (mega ? 1 : 0.9), 0, 0, 7); c.fill();
        c.fillStyle = `rgba(255,255,230,${0.5 + 0.5 * lp})`; c.beginPath(); c.ellipse(tx - tr * 0.2, ty - tr * 0.25, tr * 0.45, tr * 0.35, 0, 0, 7); c.fill();
        if (mega) { c.strokeStyle = rgba(dk(x.parts, 0.25), 0.75); c.lineWidth = 2.5; for (const k of [-0.7, -0.35, 0, 0.35, 0.7]) { c.beginPath(); c.ellipse(tx, ty, tr * Math.sqrt(1 - k * k), tr, 0, -Math.PI / 2, Math.PI / 2, k < 0); c.stroke(); }   // the lantern's ribs, a cap and a tassel
          roundBox(c, tx - tr * 0.4, ty + tr - 3, tr * 0.8, 8, 3); c.fillStyle = rgb(dk(x.parts, 0.2)); c.fill(); c.strokeStyle = rgb(x.acc); c.lineWidth = 2; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(tx + k * 3, ty + tr + 5); c.lineTo(tx + k * 3 + Math.sin(x.t / 300) * 2, ty + tr + 18); c.stroke(); }
          x.feet.push([tx, ty + tr + 18, 8]); }
        else { if (g.stage === 'Byte') { c.strokeStyle = rgba(dk(x.parts, 0.3), 0.5); c.lineWidth = 2; c.beginPath(); c.ellipse(tx, ty, tr * 0.95, tr * 0.3, 0, 0.15, Math.PI - 0.15); c.stroke(); } x.feet.push([g.cx, ty + tr, 6]); }
        const ant = mega ? 3 : 1; for (const sd of [-1, 1]) for (let a = 0; a < ant; a++) { const bx = g.cx + sd * g.bw * (0.12 + a * 0.08), ax = g.cx + sd * g.bw * (by(g.stage, 0.32, 0.36, 0.2) + a * 0.18), ay = g.top - by(g.stage, 12, 16, 26) + a * 6 + Math.sin(x.t / 300 + sd + a) * 2;   // antennae, a crown of them at Mega
          c.strokeStyle = rgb(dk(x.parts, 0.3)); c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, g.top + 6); c.quadraticCurveTo(bx + sd * 2, ay, ax, ay); c.stroke();
          if (mega) { const h2 = c.createRadialGradient(ax, ay, 0, ax, ay, 9); h2.addColorStop(0, `rgba(255,250,170,${0.8 * lp})`); h2.addColorStop(1, 'rgba(255,250,170,0)'); c.fillStyle = h2; c.fillRect(ax - 9, ay - 9, 18, 18); }
          c.fillStyle = g.stage === 'Bit' ? rgb(x.parts) : `rgba(255,248,170,${0.7 + 0.3 * lp})`; c.beginPath(); c.arc(ax, ay, by(g.stage, 2.5, 3, 3.5), 0, 7); c.fill(); } },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.3)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.14, g.bw * 0.28, g.bh * 0.18, 0, 0, 7); c.fill();
        if (g.stage !== 'Bit') { c.fillStyle = rgb(dk(x.parts, 0.2)); for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * g.bw * 0.26, g.bot - 4, 3, 5, sd * 0.4, 0, 7); c.fill(); } } },
      front(c, g, x) { if (g.stage !== 'Mega') return; for (let k = 0; k < 3; k++) { const a = x.t / 900 + k * 2.1, px = g.cx + Math.cos(a) * g.bw * 1.05, py = g.top + g.bh * 0.9 + Math.sin(a) * g.bh * 0.7, b = 0.6 + 0.4 * Math.sin(x.t / 200 + k);   // fireflies circling
          const h3 = c.createRadialGradient(px, py, 0, px, py, 8); h3.addColorStop(0, `rgba(240,255,140,${b})`); h3.addColorStop(1, 'rgba(240,255,140,0)'); c.fillStyle = h3; c.fillRect(px - 8, py - 8, 16, 16);
          c.fillStyle = rgb(dk(x.body, 0.2)); c.beginPath(); c.arc(px - 2, py - 1, 2, 0, 7); c.fill(); c.fillStyle = `rgba(250,255,170,${b})`; c.beginPath(); c.arc(px + 1.5, py + 1, 2.2, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.16, g.top + g.bh * 0.2, g.left + g.bw * 0.4, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.18, my: 0.66, s: by(g.stage, 0.72, 0.82, 0.86) })
    },
    /* Snooze: a pillow. A soft cushion with pinched corners and a seam, little stub feet, and a floppy striped nightcap from Byte.
       Mega is a dream cloud: it floats on puffs, its outline turns to cloud, it's quilted with stars, the cap ends in a glowing moon, and a dream bubble with a jumping sheep floats over it */
    Snooze: {
      dims: { Bit: [76, 52], Byte: [94, 64], Mega: [116, 78] }, ll: st => by(st, 4, 5, 22),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 8, 30, 60); },
      path(c, g, x) { if (g.stage === 'Mega') { const t = x ? x.t : 0, n = 7, cy = g.top + g.bh * 0.52;   // a cloud: bumps all round
          c.beginPath(); for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2 - Math.PI / 2, a1 = (i + 1) / n * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2, k = 1.2 + 0.03 * Math.sin(t / 500 + i);
            const p0 = [g.cx + Math.cos(a0) * g.bw * 0.44, cy + Math.sin(a0) * g.bh * 0.44], p1 = [g.cx + Math.cos(a1) * g.bw * 0.44, cy + Math.sin(a1) * g.bh * 0.44];
            if (!i) c.moveTo(p0[0], p0[1]); c.quadraticCurveTo(g.cx + Math.cos(am) * g.bw * 0.5 * k, cy + Math.sin(am) * g.bh * 0.5 * k, p1[0], p1[1]); } c.closePath(); return; }
        const p = 6, L = g.left, R = L + g.bw, T = g.top, B = g.bot;   // a cushion: corners pulled out, edges sagging in
        c.beginPath(); c.moveTo(L - p, T - p * 0.4); c.quadraticCurveTo(g.cx, T + p, R + p, T - p * 0.4); c.quadraticCurveTo(R - p, g.top + g.bh / 2, R + p, B + p * 0.2);
        c.quadraticCurveTo(g.cx, B - p * 0.6, L - p, B + p * 0.2); c.quadraticCurveTo(L + p, g.top + g.bh / 2, L - p, T - p * 0.4); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.6, armK: 0.7, shoulderIn: 0.06,
      behind(c, g, x) { if (g.stage === 'Mega') { const bob = Math.sin(x.t / 600) * 2;   // it floats on a bank of little cloud puffs
          for (let k = -2; k <= 2; k++) { const px = g.cx + k * g.bw * 0.2, py = 178 + Math.abs(k) * -2 + Math.sin(x.t / 500 + k) * 1.5 + bob * 0.3; c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(px, py, 10 - Math.abs(k) * 1.5, 0, 7); c.fill(); }
          x.feet.push([g.cx, 182, g.bw * 0.4]); return; }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.26, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, by(g.stage, 8, 9, 10), 4.5, dk(x.body, 0.12), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); } },
      inside(c, g, x) { if (g.stage === 'Mega') { // quilted, with star buttons
          c.strokeStyle = rgba(lt(x.body, 0.5), 0.7); c.lineWidth = 1.3; c.setLineDash([3, 3]); const q = g.bw / 6;
          for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(g.cx + k * q - g.bh, g.top - 6); c.lineTo(g.cx + k * q + g.bh, g.bot + 6); c.moveTo(g.cx + k * q + g.bh, g.top - 6); c.lineTo(g.cx + k * q - g.bh, g.bot + 6); c.stroke(); } c.setLineDash([]);
          for (const [fx, fy] of [[0.18, 0.18], [0.82, 0.22], [0.5, 0.06], [0.1, 0.62], [0.9, 0.66]]) star(c, g.left + g.bw * fx, g.top + g.bh * fy, 0.42 + 0.08 * Math.sin(x.t / 300 + fx * 9), '#ffd84a'); return; }
        c.strokeStyle = rgba(dk(x.body, 0.25), 0.55); c.lineWidth = 1.5; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(g.left + 4, g.top + 6); c.quadraticCurveTo(g.cx, g.top + 12, g.left + g.bw - 4, g.top + 6); c.stroke(); c.setLineDash([]);
        for (const [px, py] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { c.strokeStyle = rgba(dk(x.body, 0.3), 0.5); c.lineWidth = 1.4; const cx0 = g.left + px * g.bw + (px ? -2 : 2), cy0 = g.top + py * g.bh + (py ? -2 : 2);   // creases at each corner
          for (const k of [-1, 1]) { c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0 + (px ? -1 : 1) * 8, cy0 + (py ? -1 : 1) * (5 + k * 3)); c.stroke(); } } },
      front(c, g, x) { if (g.stage === 'Bit') return; const mega = g.stage === 'Mega', cw = g.bw * (mega ? 0.5 : 0.62), cx0 = g.cx - cw * 0.5 - 4, cy0 = g.top + (mega ? 0 : 3), sw = Math.sin(x.t / 700) * 3,
          tipX = g.left + g.bw + (mega ? 6 : 12) + sw, tipY = g.top + g.bh * (mega ? -0.1 : 0.12);
        c.fillStyle = rgb(dk(x.acc, 0.2)); c.beginPath(); c.moveTo(cx0, cy0 + 4); c.quadraticCurveTo(g.cx - 4, g.top - g.bh * 0.62, g.cx + cw * 0.36, g.top - g.bh * 0.3); c.quadraticCurveTo(tipX - 6, tipY - 14, tipX, tipY); c.quadraticCurveTo(g.cx + cw * 0.3, g.top - g.bh * 0.06, g.cx + cw * 0.5, cy0 + 4); c.closePath(); c.fill();
        c.fillStyle = rgb(x.acc); c.beginPath(); c.moveTo(cx0, cy0 + 1); c.quadraticCurveTo(g.cx - 4, g.top - g.bh * 0.66, g.cx + cw * 0.36, g.top - g.bh * 0.34); c.quadraticCurveTo(tipX - 6, tipY - 17, tipX, tipY - 3); c.quadraticCurveTo(g.cx + cw * 0.3, g.top - g.bh * 0.1, g.cx + cw * 0.5, cy0 + 1); c.closePath(); c.fill();
        c.save(); c.clip(); c.strokeStyle = rgba(lt(x.acc, 0.45), 0.9); c.lineWidth = 4; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(cx0 + k * 12 - 10, cy0 + 6); c.lineTo(cx0 + k * 12 + 20, g.top - g.bh * 0.7); c.stroke(); } c.restore();
        roundBox(c, cx0 - 2, cy0 - 1, cw + 12, 7, 3.5); c.fillStyle = rgb(dk(x.acc, 0.15)); c.fill();
        if (!mega) { c.fillStyle = rgb(lt(x.acc, 0.55)); c.beginPath(); c.arc(tipX, tipY + 2, 5, 0, 7); c.fill(); return; }
        const mx = tipX + 2, my = tipY + 4, h1 = c.createRadialGradient(mx, my, 0, mx, my, 16); h1.addColorStop(0, 'rgba(255,240,150,.7)'); h1.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = h1; c.fillRect(mx - 16, my - 16, 32, 32);   // a glowing moon at the tip
        c.fillStyle = '#ffe27a'; c.beginPath(); c.arc(mx, my, 7, 0.9, 0.9 + Math.PI * 1.55); c.arc(mx + 3.2, my - 2.4, 5.6, 0.9 + Math.PI * 1.45, 0.75, true); c.closePath(); c.fill();
        const bx = g.left - 4, by0 = g.top - 26 + Math.sin(x.t / 900) * 3;   // a dream bubble with a sheep jumping a fence
        c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(bx, by0, 24, 17, 0, 0, 7); c.fill(); c.beginPath(); c.arc(bx + 18, by0 + 20, 3.5, 0, 7); c.arc(bx + 24, by0 + 27, 2, 0, 7); c.fill();
        c.strokeStyle = '#a07850'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(bx - 4, by0 + 10); c.lineTo(bx - 4, by0 + 2); c.moveTo(bx + 4, by0 + 10); c.lineTo(bx + 4, by0 + 2); c.moveTo(bx - 7, by0 + 5); c.lineTo(bx + 7, by0 + 5); c.stroke();
        const jp = (x.t / 1400) % 1, sx = bx - 14 + jp * 28, sy = by0 + 4 - Math.sin(jp * Math.PI) * 12; c.fillStyle = '#ffffff'; c.strokeStyle = '#b8b8c8'; c.lineWidth = 1;
        for (const [ox, oy] of [[-3, 0], [0, -2], [3, 0], [0, 1.5]]) { c.beginPath(); c.arc(sx + ox, sy + oy, 3.2, 0, 7); c.fill(); c.stroke(); } c.fillStyle = '#3a3a48'; c.beginPath(); c.arc(sx + 5.5, sy - 0.5, 2, 0, 7); c.fill();
        c.font = '700 12px system-ui'; c.textAlign = 'left'; for (let k = 0; k < 3; k++) { const ph = (x.t / 2600 + k / 3) % 1; c.fillStyle = `rgba(120,140,200,${1 - ph})`; c.fillText('z', g.left + g.bw + 12 + ph * 14 + k * 2, g.top + 18 - ph * 30); } },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.62, g.left + g.bw * 0.1, g.top + g.bh * 0.22, g.left + g.bw * 0.3, g.top + g.bh * 0.14],
      head: g => [g.cx, g.top - 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.5, ex: 0.16, my: 0.72, s: by(g.stage, 0.74, 0.84, 0.92) })
    },
    /* Inky: an ink blot. A splat with round bumps all round and drips under it, a steel pen nib stuck in its head from Byte, and an ink pot it stands in at Mega with a quill */
    Inky: {
      dims: { Bit: [70, 60], Byte: [86, 74], Mega: [102, 86] }, ll: st => by(st, 4, 4, 4),
      bottom(st) { return 182 - this.ll(st) - (st === 'Mega' ? 14 : 0); }, height(st) { return this.dims[st][1] + this.ll(st) + (st === 'Bit' ? 10 : 26) + (st === 'Mega' ? 14 : 0); },
      path(c, g, x) { const t = x ? x.t : 0, n = by(g.stage, 7, 8, 9), cy = g.top + g.bh * 0.52;
        c.beginPath(); for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, bump = i % 2 ? 0.86 : 1.04 + 0.03 * Math.sin(t / 400 + i), rx = g.bw / 2 * bump, ry = g.bh / 2 * bump;
          const px = g.cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry; if (i === 0) c.moveTo(px, py); else { const am = (i - 0.5) / (n * 2) * Math.PI * 2 - Math.PI / 2, bm = i % 2 ? 1.06 : 0.9; c.quadraticCurveTo(g.cx + Math.cos(am) * g.bw / 2 * bm, cy + Math.sin(am) * g.bh / 2 * bm, px, py); } } c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.6, armK: 0.75, shoulderIn: 0.06,
      behind(c, g, x) { if (g.stage === 'Mega') {
          c.save(); c.translate(g.left + g.bw * 0.92, g.top + g.bh * 0.2); c.rotate(0.45 + Math.sin(x.t / 600) * 0.06); c.scale(1.5, 1.3); const fc = [246, 244, 236];   // a quill: soft vanes in notches down a stiff shaft
          for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) { const y0 = 8 - k * 7, w = (10 - Math.abs(k - 3) * 1.8) * (k === 5 ? 0.6 : 1); c.fillStyle = rgb(k % 2 ? fc : [222, 226, 236]); c.beginPath(); c.moveTo(0, y0); c.quadraticCurveTo(sd * w, y0 - 2, sd * w * 0.8, y0 - 8); c.lineTo(0, y0 - 6); c.closePath(); c.fill(); }
          c.strokeStyle = rgb(dk(x.acc, 0.25)); c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 20); c.lineTo(0, -36); c.stroke(); c.restore(); return; }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, by(g.stage, 7, 8, 9), 4.5, dk(x.body, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); } },
      inside(c, g, x) { c.fillStyle = rgba(lt(x.body, 0.25), 0.8); for (const [fx, fy, r] of [[0.24, 0.24, 0.05], [0.7, 0.3, 0.035], [0.78, 0.7, 0.04]].slice(0, by(g.stage, 1, 2, 3))) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, g.bw * r, 0, 7); c.fill(); } },
      front(c, g, x) { if (g.stage === 'Mega') { const pw = g.bw * 0.96, ph = 30, py = 182 - ph;   // the round glass ink bottle it sits in
          c.fillStyle = rgb(dk(x.body, 0.2)); c.beginPath(); c.ellipse(g.cx, py + ph * 0.55, pw / 2, ph * 0.6, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(190,215,240,.45)'; c.beginPath(); c.ellipse(g.cx, py + ph * 0.5, pw / 2, ph * 0.6, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.stroke();
          c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(g.cx - pw * 0.3, py + ph * 0.5, 3, ph * 0.3, 0.2, 0, 7); c.fill();
          roundBox(c, g.cx - pw * 0.34, py - 6, pw * 0.68, 8, 3); c.fillStyle = 'rgba(190,215,240,.75)'; c.fill(); x.feet.push([g.cx, 182, pw * 0.4]); }
        if (g.stage !== 'Mega') for (let k = 0; k < by(g.stage, 1, 2, 2); k++) { const ph = (x.t / 1600 + k * 0.5) % 1; c.fillStyle = rgba(x.body, 1 - ph); drop(c, g.left + g.bw * (0.32 + k * 0.4), g.bot + 2 + ph * 10, 0.55); c.fill(); }   // drips
        if (g.stage === 'Bit') return; const nx = g.cx + 4, ny = g.top - 2, nh = by(g.stage, 0, 24, 30), nw = nh * 0.44;   // the pen nib, point down into its head
        c.save(); c.translate(nx, ny); c.rotate(0.25); c.fillStyle = '#7e848f'; c.beginPath(); c.moveTo(0, 8); c.lineTo(nw / 2 + 1, -nh * 0.45); c.quadraticCurveTo(nw * 0.55, -nh, 0, -nh - 2); c.quadraticCurveTo(-nw * 0.55, -nh, -nw / 2 - 1, -nh * 0.45); c.closePath(); c.fill();
        c.fillStyle = '#c9ced8'; c.beginPath(); c.moveTo(0, 6); c.lineTo(nw / 2 - 1, -nh * 0.45); c.quadraticCurveTo(nw * 0.45, -nh + 2, 0, -nh); c.quadraticCurveTo(-nw * 0.45, -nh + 2, -nw / 2 + 1, -nh * 0.45); c.closePath(); c.fill();
        c.strokeStyle = '#5a5f6a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -nh * 0.4); c.stroke(); c.fillStyle = '#5a5f6a'; c.beginPath(); c.arc(0, -nh * 0.45, 2.2, 0, 7); c.fill(); c.restore(); },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.26, g.left + g.bw * 0.38, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.46, ex: 0.17, my: 0.68, s: by(g.stage, 0.74, 0.84, 0.92) })
    },
    /* Cobble: a pile of pebbles. A big round stone with the face on it, grey stones sitting on top and leaning on its side, and speckles.
       Mega is a geode: the stone goes faceted and splits along glowing seams, a cluster of crystals bursts out of its top, and three stones orbit it */
    Cobble: {
      dims: { Bit: [72, 56], Byte: [90, 68], Mega: [104, 86] }, ll: st => by(st, 4, 5, 6),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 16, 26, 52); },
      path(c, g) { if (g.stage === 'Mega') { const P = [[0.08, 1], [-0.02, 0.62], [0.06, 0.22], [0.3, 0.02], [0.66, -0.02], [0.94, 0.18], [1.03, 0.56], [0.94, 1]];   // faceted
          c.beginPath(); P.forEach(([fx, fy], i) => { const px = g.left + g.bw * fx, py = g.top + g.bh * fy; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath(); return; }
        c.beginPath(); c.moveTo(g.left + 8, g.bot); c.bezierCurveTo(g.left - 6, g.bot - 4, g.left - 2, g.top + g.bh * 0.1, g.cx - g.bw * 0.06, g.top);
        c.bezierCurveTo(g.left + g.bw + 8, g.top - 2, g.left + g.bw + 4, g.bot - 6, g.left + g.bw - 8, g.bot); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 7, 8), handR: st => by(st, 0, 6, 7), shoulderY: 0.62, armK: 0.7, shoulderIn: 0.04,
      stones: { Bit: [[0.12, -0.14, 0.18]], Byte: [[0.16, -0.16, 0.2], [-0.16, -0.08, 0.15], [0.56, 0.62, 0.15]], Mega: [] },
      pebble(c, x, px, py, r, k) { const col = mix(k % 2 ? lt(x.body, 0.2) : dk(x.body, 0.05), [150, 150, 156], 0.55); r *= 1.1;
        c.fillStyle = rgb(dk(col, 0.3)); c.beginPath(); c.ellipse(px, py + 2, r, r * 0.62, 0, 0, 7); c.fill();
        c.fillStyle = rgb(col); c.beginPath(); c.ellipse(px, py, r, r * 0.62, k * 0.25, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(px - r * 0.35, py - r * 0.3, r * 0.28, r * 0.18, -0.4, 0, 7); c.fill(); },
      orbit(c, g, x, back) { for (let k = 0; k < 3; k++) { const a = x.t / 1100 + k * 2.09, s = Math.sin(a); if ((s < 0) !== back) continue;
          this.pebble(c, x, g.cx + Math.cos(a) * g.bw * 0.92, g.top + g.bh * 0.62 + s * g.bh * 0.22, g.bw * (0.1 + (k === 1 ? 0.03 : 0)) * (back ? 0.85 : 1), k); } },
      crystals(c, g, x) { const glow = 0.7 + 0.3 * Math.sin(x.t / 500), base = g.top + g.bh * 0.08, cc = lt(x.acc, 0.35);
        const h0 = c.createRadialGradient(g.cx, base - 16, 2, g.cx, base - 16, 46); h0.addColorStop(0, rgba(lt(x.acc, 0.6), 0.55 * glow)); h0.addColorStop(1, rgba(x.acc, 0)); c.fillStyle = h0; c.fillRect(g.cx - 46, base - 62, 92, 92);
        for (const [dx, h, w, ang] of [[-0.24, 26, 9, -0.5], [0.22, 30, 10, 0.45], [-0.06, 44, 13, -0.08], [0.08, 34, 11, 0.2], [0.34, 18, 7, 0.8]]) { c.save(); c.translate(g.cx + dx * g.bw, base + 6); c.rotate(ang);
          c.fillStyle = rgb(dk(cc, 0.25)); c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h * 0.75); c.lineTo(0, -h); c.lineTo(w / 2, -h * 0.75); c.lineTo(w / 2, 0); c.closePath(); c.fill();
          c.fillStyle = rgb(cc); c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h * 0.75); c.lineTo(0, -h); c.lineTo(0, 0); c.closePath(); c.fill();
          c.fillStyle = `rgba(255,255,255,${0.45 * glow})`; c.beginPath(); c.moveTo(-w / 2 + 2, -2); c.lineTo(-w / 2 + 2, -h * 0.7); c.lineTo(-1, -h * 0.85); c.lineTo(-1, -2); c.closePath(); c.fill(); c.restore(); } },
      behind(c, g, x) { for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, by(g.stage, 8, 9, 11), 5, dk(x.body, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); }
        if (g.stage === 'Mega') { this.orbit(c, g, x, true); this.crystals(c, g, x); return; }
        this.stones[g.stage].forEach(([fx, fy, r], k) => { if (fy > 0) return; this.pebble(c, x, g.cx + fx * g.bw, g.top + fy * g.bh + g.bh * 0.12, r * g.bw, k); }); },
      inside(c, g, x) { if (g.stage === 'Mega') { const glow = 0.7 + 0.3 * Math.sin(x.t / 500);   // facets, and seams of crystal light running through the stone
          c.fillStyle = rgba(lt(x.body, 0.15), 0.6); c.beginPath(); c.moveTo(g.left + g.bw * 0.3, g.top); c.lineTo(g.left + g.bw * 0.66, g.top); c.lineTo(g.left + g.bw * 0.5, g.top + g.bh * 0.22); c.closePath(); c.fill();
          c.fillStyle = rgba(dk(x.body, 0.15), 0.6); c.beginPath(); c.moveTo(g.left + g.bw * 0.94, g.top + g.bh * 0.18); c.lineTo(g.left + g.bw * 1.03, g.top + g.bh * 0.56); c.lineTo(g.left + g.bw * 0.86, g.top + g.bh * 0.5); c.closePath(); c.fill();
          c.lineCap = 'round'; c.lineJoin = 'round'; for (const [w, a] of [[7, 0.4], [3, 1]]) { c.strokeStyle = rgba(w > 4 ? lt(x.acc, 0.2) : lt(x.acc, 0.7), a * glow); c.lineWidth = w;
            for (const S of [[[0.5, 0.0], [0.42, 0.14], [0.5, 0.24]], [[0.06, 0.4], [0.16, 0.5], [0.12, 0.66], [0.2, 0.8]], [[0.98, 0.4], [0.88, 0.62], [0.9, 0.86]]]) { c.beginPath(); S.forEach(([fx, fy], i) => { const px = g.left + g.bw * fx, py = g.top + g.bh * fy; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); } }
          c.fillStyle = 'rgb(110,170,80)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(g.left + g.bw * (0.14 + k * 0.05), g.bot - 2 - (k % 2) * 2, 4, 0, 7); c.fill(); } return; }
        c.fillStyle = rgba(dk(x.body, 0.35), 0.5); const r = rng(5); for (let k = 0; k < by(g.stage, 8, 12, 16); k++) { const px = g.left + g.bw * (0.1 + r() * 0.8), py = g.top + g.bh * (0.15 + r() * 0.75); if (Math.abs(px - g.cx) < g.bw * 0.3 && py > g.top + g.bh * 0.3 && py < g.top + g.bh * 0.85) continue; c.beginPath(); c.arc(px, py, 1 + r() * 1.3, 0, 7); c.fill(); }
        c.strokeStyle = rgba(dk(x.body, 0.4), 0.5); c.lineWidth = 1.4; c.beginPath(); c.moveTo(g.left + g.bw * 0.82, g.top + g.bh * 0.2); c.lineTo(g.left + g.bw * 0.76, g.top + g.bh * 0.34); c.lineTo(g.left + g.bw * 0.84, g.top + g.bh * 0.44); c.stroke(); },
      front(c, g, x) { if (g.stage === 'Mega') { this.orbit(c, g, x, false); return; }
        this.stones[g.stage].forEach(([fx, fy, r], k) => { if (fy <= 0) return; this.pebble(c, x, g.cx + fx * g.bw, g.top + fy * g.bh + g.bh * 0.3, r * g.bw, k + 1); }); },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.6, g.left + g.bw * 0.14, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 4, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.46, ex: 0.17, my: 0.68, s: by(g.stage, 0.74, 0.84, 0.92) })
    },
    /* Nimbo: a small rain cloud. Puffy on top with a grey belly and a drizzle under it.
       Mega is a thunderhead: a tall storm cloud with a wide anvil top, a curtain of rain, lightning forking out of it and a rainbow behind */
    Nimbo: {
      dims: { Bit: [72, 46], Byte: [90, 56], Mega: [100, 92] }, float: true, slots: { feet: false },
      bottom(st) { return st === 'Mega' ? 132 : 138; }, height(st) { return this.dims[st][1] + (st === 'Mega' ? 60 : 50); },
      path(c, g, x) { const t = x ? x.t : 0;
        const P = g.stage === 'Mega' ? [[0.1, 1], [0.04, 0.72], [0.12, 0.46], [-0.14, 0.24], [0.1, -0.02], [0.5, -0.06], [0.9, -0.02], [1.14, 0.24], [0.88, 0.46], [0.96, 0.72], [0.9, 1]]   // a thunderhead: a tower with a wide anvil top
          : g.stage === 'Byte' ? [[0.08, 1], [-0.04, 0.6], [0.2, 0.18], [0.5, 0.0], [0.8, 0.18], [1.04, 0.6], [0.92, 1]] : [[0.1, 1], [0, 0.56], [0.3, 0.06], [0.7, 0.06], [1, 0.56], [0.9, 1]];
        const Q = P.map(([fx, fy]) => [g.left + g.bw * fx, g.top + g.bh * fy]); let mx = 0, my = 0; Q.forEach(([px, py]) => { mx += px / Q.length; my += py / Q.length; });
        c.beginPath(); c.moveTo(Q[0][0], Q[0][1]);
        for (let i = 1; i <= Q.length; i++) { const A = Q[i - 1], B = Q[i % Q.length], cx0 = (A[0] + B[0]) / 2, cy0 = (A[1] + B[1]) / 2, len = Math.hypot(B[0] - A[0], B[1] - A[1]);
          let nx = -(B[1] - A[1]) / len, ny = (B[0] - A[0]) / len; if (nx * (cx0 - mx) + ny * (cy0 - my) < 0) { nx = -nx; ny = -ny; }
          const bulge = (i === Q.length ? 0.12 : 0.62) * len * (1 + 0.04 * Math.sin(t / 600 + i));   // each side bulges out into a puff, the bottom stays nearly flat
          c.quadraticCurveTo(cx0 + nx * bulge, cy0 + ny * bulge, B[0], B[1]); } c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.66, armK: 0.7, shoulderIn: 0.04,
      behind(c, g, x) { const mega = g.stage === 'Mega';
        if (mega) { const rx = g.cx, ry = g.bot + 4, rr = g.bw * 0.95; [[230, 90, 90], [240, 170, 80], [240, 220, 100], [120, 200, 120], [110, 160, 230], [160, 120, 210]].forEach((col, i) => {   // a rainbow behind
            c.strokeStyle = rgba(col, 0.55); c.lineWidth = 5; c.beginPath(); c.arc(rx, ry, rr - i * 5, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }); }
        const n = by(g.stage, 3, 6, 12), sp = mega ? 1.6 : 1;   // rain
        for (let i = 0; i < n; i++) { const ph = (x.t / (mega ? 380 : 650) + i * 0.37) % 1, px = g.left + g.bw * (0.15 + 0.7 * ((i * 0.618) % 1)), py = g.bot - 4 + ph * (mega ? 44 : 30);
          c.strokeStyle = `rgba(150,200,250,${0.9 * (1 - ph)})`; c.lineWidth = mega ? 2 : 1.6; c.beginPath(); c.moveTo(px, py); c.lineTo(px - 2 * sp, py + 7 * sp); c.stroke(); }
        x.feet.push([g.cx, g.bot + 30, g.bw * 0.3]); },
      inside(c, g, x) { const mega = g.stage === 'Mega', bh = mega ? 0.42 : 0.3;
        const gb = c.createLinearGradient(0, g.bot - g.bh * bh, 0, g.bot); gb.addColorStop(0, rgba(dk(x.body, 0.3), 0)); gb.addColorStop(1, rgba(dk(x.body, mega ? 0.45 : 0.3), 0.85)); c.fillStyle = gb; c.fillRect(g.left - 20, g.bot - g.bh * bh, g.bw + 40, g.bh * bh + 10);   // the grey belly
        if (g.stage !== 'Bit') { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(g.left + g.bw * 0.3, g.top + g.bh * 0.22, g.bw * 0.14, g.bh * 0.08, -0.2, 0, 7); c.fill(); }
        if (mega && Math.floor(x.t / 110) % 13 === 0) { c.fillStyle = 'rgba(255,250,200,.35)'; c.fillRect(g.left - 20, g.top - 20, g.bw + 40, g.bh + 40); } },   // a flash lighting it up from inside
      front(c, g, x) { if (g.stage !== 'Mega') return; const on = Math.floor(x.t / 110) % 13;   // lightning forking down from the base
        if (on < 2) for (const sd of [-1, 1]) { let px = g.cx + sd * g.bw * 0.3, py = g.bot - 4; c.strokeStyle = 'rgba(255,248,170,.95)'; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath(); c.moveTo(px, py);
          for (let k = 0; k < 4; k++) { px += sd * (k % 2 ? -6 : 9); py += 10; c.lineTo(px, py); } c.stroke(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.2; c.stroke(); }
        c.fillStyle = 'rgba(255,240,140,.95)'; c.save(); c.translate(g.cx + g.bw * 0.5, g.top + g.bh * 0.2); c.rotate(0.3); c.beginPath(); c.moveTo(0, -10); c.lineTo(6, -2); c.lineTo(1, -1); c.lineTo(5, 10); c.lineTo(-4, 0); c.lineTo(1, -1); c.closePath(); c.fill(); c.restore(); },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.62, g.left + g.bw * 0.14, g.top + g.bh * 0.3, g.left + g.bw * 0.34, g.top + g.bh * 0.12],
      head: g => [g.cx, g.top + 2, g.bw * 0.48],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.5, ex: 0.17, my: 0.7, s: 0.9 } : { ey: 0.54, ex: 0.16, my: 0.76, s: by(g.stage, 0.72, 0.82, 0.9) })
    },
    /* Dango: dumplings on a skewer. Bit is one dumpling on a stick, Byte three stacked pink, white and green with the face on the middle one, and it hops on its stick.
       Mega is a dango samurai: a big head dumpling over a body dumpling with a sash, a headband, a topknot, and the skewer held as a sword */
    Dango: {
      dims: { Bit: [56, 56], Byte: [60, 98], Mega: [84, 112] }, sl: st => by(st, 14, 16, 0), slots: { feet: false },
      bottom(st) { return st === 'Mega' ? 176 : 184 - this.sl(st); }, height(st) { return this.dims[st][1] + this.sl(st) + by(st, 18, 18, 30); },
      circ(g) { if (g.stage === 'Bit') return [[g.top + g.bh / 2, g.bw / 2]]; if (g.stage === 'Byte') { const r = g.bh / 5.2; return [0, 1, 2].map(i => [g.top + r + i * 1.6 * r, r]); }
        const ra = g.bw * 0.46, rb = g.bw * 0.42; return [[g.top + ra, ra], [g.bot - rb, rb]]; },
      path(c, g) { const C = this.circ(g); c.beginPath(); if (C.length === 1) { c.arc(g.cx, C[0][0], C[0][1], 0, 7); return; }
        const ang = (A, B) => { const d = B[0] - A[0], h = (d * d + A[1] * A[1] - B[1] * B[1]) / (2 * d), w = Math.sqrt(Math.max(1, A[1] * A[1] - h * h)); return [Math.atan2(h, w), Math.atan2(h - d, w)]; };
        const J = []; for (let i = 0; i < C.length - 1; i++) J.push(ang(C[i], C[i + 1]));
        c.arc(g.cx, C[0][0], C[0][1], Math.PI - J[0][0], Math.PI * 2 + J[0][0]);   // down the right side, round the bottom, up the left
        for (let i = 1; i < C.length - 1; i++) c.arc(g.cx, C[i][0], C[i][1], J[i - 1][1], J[i][0]);
        const L = C.length - 1; c.arc(g.cx, C[L][0], C[L][1], J[L - 1][1], Math.PI - J[L - 1][1]);
        for (let i = L - 1; i >= 1; i--) c.arc(g.cx, C[i][0], C[i][1], Math.PI - J[i][0], Math.PI - J[i - 1][1]); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 8), handR: st => by(st, 0, 4.5, 7), shoulderY: 0.64, armK: 0.7, shoulderIn: 0.1,
      behind(c, g, x) { const mega = g.stage === 'Mega', wood = [200, 160, 110];
        if (!mega) { const hop = x.walk ? Math.max(0, Math.sin(x.t / 200)) * 4 : 0, sb = 183 - hop; c.strokeStyle = rgb(dk(wood, 0.25)); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx, g.top - 12); c.lineTo(g.cx, sb); c.stroke();
          c.strokeStyle = rgb(wood); c.lineWidth = 4; c.stroke(); x.feet.push([g.cx, sb, 5]); return; }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 9, 5, dk(x.body, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); }
},
      inside(c, g, x) { const C = this.circ(g), tints = C.length === 3 ? [[255, 175, 195], null, [150, 210, 120]] : C.length === 2 ? [[255, 205, 215], [150, 210, 120]] : [null];
        C.forEach(([cy, r], i) => { if (tints[i]) { c.fillStyle = rgba(tints[i], i ? 0.72 : 0.5); c.beginPath(); c.arc(g.cx, cy, r + 2, 0, 7); c.fill(); }
          c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(g.cx - r * 0.4, cy - r * 0.45, r * 0.25, r * 0.14, -0.5, 0, 7); c.fill(); });
        if (g.stage === 'Mega') { const by0 = C[1][0] - C[1][1] * 0.1; c.fillStyle = rgb(dk(x.acc, 0.1)); c.fillRect(g.left - 4, by0 - 6, g.bw + 8, 12); c.fillStyle = rgb(lt(x.acc, 0.3)); c.fillRect(g.left - 4, by0 - 6, g.bw + 8, 3);   // the sash
          c.fillStyle = rgb(dk(x.acc, 0.25)); c.beginPath(); c.moveTo(g.cx + 8, by0); c.lineTo(g.cx + 20, by0 + 14); c.lineTo(g.cx + 12, by0 + 15); c.closePath(); c.fill(); } },
      front(c, g, x) { if (g.stage !== 'Mega') return; const wood = [200, 160, 110];
        const A = x.P.arm || [[12, 8, 16, 22], [12, 8, 16, 22]], swing = Math.max(-0.2, Math.min(1.2, (A[1][2] - 16) / 26));   // the skewer as a sword, swinging down when it strikes
        c.save(); c.translate(g.cx + g.bw * 0.5, g.top + g.bh * 0.7); c.rotate(-0.5 + swing * 1.6);
        c.strokeStyle = rgb(dk(wood, 0.3)); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 8); c.lineTo(0, -66); c.stroke(); c.strokeStyle = rgb(lt(wood, 0.2)); c.lineWidth = 3.5; c.stroke();
        c.fillStyle = '#2a2a33'; roundBox(c, -9, -2, 18, 6, 2); c.fill(); c.fillStyle = rgb(mix(x.body, [150, 210, 120], 0.6)); c.beginPath(); c.arc(0, -70, 7, 0, 7); c.fill();
        if (CAP) (CAP.hands = CAP.hands || []).push(capPt(c, 0, -66)); c.restore();
        const C = this.circ(g), hy = C[0][0] - C[0][1] * 0.5, sw = Math.sin(x.t / 260) * 3;
        c.fillStyle = rgb(x.acc); roundBox(c, g.left + 4, hy - 4, g.bw - 8, 9, 4); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(g.cx, hy + 0.5, 3.4, 0, 7); c.fill(); c.fillStyle = rgb(dk(x.acc, 0.2)); c.beginPath(); c.arc(g.cx, hy + 0.5, 1.8, 0, 7); c.fill();   // the headband with its tails
        for (const k of [0, 1]) { c.fillStyle = rgb(dk(x.acc, 0.1 * k)); c.beginPath(); c.moveTo(g.left + 8, hy); c.quadraticCurveTo(g.left - 10, hy + 2 + k * 6 + sw, g.left - 18, hy + 10 + k * 8 + sw); c.lineTo(g.left - 14, hy + 15 + k * 8 + sw); c.quadraticCurveTo(g.left - 4, hy + 8 + k * 4, g.left + 8, hy + 6); c.closePath(); c.fill(); }
        c.fillStyle = rgb(dk(x.body, 0.35)); c.beginPath(); c.ellipse(g.cx, g.top - 4, 7, 9, 0, 0, 7); c.fill();   // a topknot
        for (let k = 0; k < 5; k++) { const ph = (x.t / 2400 + k / 5) % 1, px = g.left - 10 + ((k * 0.37 + ph * 0.6) % 1) * (g.bw + 20), py = g.top - 10 + ph * (g.bh + 20);   // sakura petals drifting past
          c.save(); c.translate(px, py); c.rotate(ph * 6 + k); c.fillStyle = `rgba(255,190,210,${0.9 * Math.sin(ph * Math.PI)})`; c.beginPath(); c.ellipse(0, 0, 3.6, 2, 0, 0, 7); c.fill(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.3, g.left + g.bw * 0.18, g.top + g.bh * 0.1, g.left + g.bw * 0.4, g.top + g.bh * 0.02],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Byte' ? { ey: 0.46, ex: 0.18, my: 0.57, s: 0.66 } : g.stage === 'Mega' ? { ey: 0.3, ex: 0.16, my: 0.44, s: 0.9 } : { ey: 0.46, ex: 0.18, my: 0.68, s: 0.7 })
    },
    /* Oaklet: an acorn. A round nut with a pointed bottom under a textured cap with a stem, and a leaf on the stem from Byte.
       Mega is an oak guardian: the nut grows into a bark trunk, the cap opens into a leafy canopy with acorns hanging from it, branches for arms and roots for feet */
    Oaklet: {
      topUp: { Mega: 70 },
      dims: { Bit: [60, 62], Byte: [74, 78], Mega: [74, 88] }, ll: st => by(st, 4, 6, 6),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 16, 26, 64); },
      cap: 0.36,
      path(c, g) { if (g.stage === 'Mega') { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * 0.3); return; }
        const ct = g.top + g.bh * this.cap * 0.7; c.beginPath(); c.moveTo(g.left, ct); c.bezierCurveTo(g.left, g.bot - g.bh * 0.12, g.cx - g.bw * 0.2, g.bot, g.cx, g.bot + 6);
        c.bezierCurveTo(g.cx + g.bw * 0.2, g.bot, g.left + g.bw, g.bot - g.bh * 0.12, g.left + g.bw, ct); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 0), handR: st => by(st, 0, 4.5, 0), shoulderY: 0.62, armK: 0.75,
      canopy(c, g, x) { const leaf = mix([110, 190, 80], x.body, 0.15), sw = Math.sin(x.t / 900) * 2;
        for (const [fx, fy, r, k] of [[-0.56, -0.02, 0.34, 0.15], [0.56, 0.0, 0.34, 0.15], [-0.28, -0.34, 0.4, 0], [0.28, -0.34, 0.4, 0.05], [0, -0.56, 0.38, -0.05]]) {
          const px = g.cx + fx * g.bw + sw * (fy < 0 ? 1 : 0.5), py = g.top + fy * g.bh * 0.9 - 6; c.fillStyle = rgb(dk(leaf, 0.25 + k)); c.beginPath(); c.arc(px, py + 3, r * g.bw, 0, 7); c.fill(); c.fillStyle = rgb(lt(leaf, k)); c.beginPath(); c.arc(px, py, r * g.bw, 0, 7); c.fill();
          c.fillStyle = rgba(lt(leaf, 0.35), 0.6); c.beginPath(); c.arc(px - r * g.bw * 0.3, py - r * g.bw * 0.35, r * g.bw * 0.35, 0, 7); c.fill(); }
        for (const [fx, fy] of [[-0.75, 0.3], [0.78, 0.32], [-0.1, 0.06]]) { const px = g.cx + fx * g.bw, py = g.top + fy * g.bh + Math.sin(x.t / 500 + fx) * 1.5;   // acorns hanging from it
          c.strokeStyle = rgb(dk(x.parts, 0.3)); c.lineWidth = 1.4; c.beginPath(); c.moveTo(px, py - 8); c.lineTo(px, py - 3); c.stroke(); c.fillStyle = rgb(lt(x.body, 0.05)); c.beginPath(); c.ellipse(px, py + 3, 4.5, 5.5, 0, 0, 7); c.fill();
          c.fillStyle = rgb(dk(x.parts, 0.2)); c.beginPath(); c.ellipse(px, py - 2, 5.5, 3.2, 0, Math.PI, 0); c.fill(); } },
      behind(c, g, x) { const mega = g.stage === 'Mega', ll = this.ll(g.stage);
        if (mega) { const bark = mix(x.body, [120, 82, 55], 0.7);
          for (const sd of [-1, 1]) { const sx = g.cx + sd * g.bw * 0.4, sy = g.top + g.bh * 0.5, A = x.P.arm || [[12, 8, 16, 22], [12, 8, 16, 22]], reach = sd > 0 ? Math.max(0, (A[1][2] - 16) / 30) : 0;   // branch arms
            c.save(); c.translate(sx, sy); c.rotate(sd * (-0.5 + Math.sin(x.t / 700) * 0.05) + sd * reach * 0.9);
            c.strokeStyle = rgb(dk(bark, 0.2)); c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(sd * 26, -6); c.moveTo(sd * 16, -3); c.lineTo(sd * 24, -16); c.stroke();
            c.strokeStyle = rgb(bark); c.lineWidth = 6; c.stroke(); c.fillStyle = 'rgb(110,175,80)'; for (const [lx, ly] of [[28, -6], [25, -19]]) { c.beginPath(); c.ellipse(sd * lx, ly, 6, 3.5, sd * -0.5, 0, 7); c.fill(); }
            if (sd > 0 && CAP) (CAP.hands = CAP.hands || []).push(capPt(c, sd * 28, -6)); c.restore(); }
          for (const sd of [-1, 0, 1]) { const rx = g.cx + sd * g.bw * 0.3, lift = sd ? Math.max(0, sd * x.walk) * 4 : 0;   // roots
            c.strokeStyle = rgb(dk(bark, 0.15)); c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(rx, g.bot - 6); c.quadraticCurveTo(rx + sd * 6, 176 - lift, rx + sd * 14, 182 - lift); c.stroke();
            c.strokeStyle = rgb(bark); c.lineWidth = 4.5; c.stroke(); x.feet.push([rx + sd * 12, 182 - lift, 6]); }
          this.canopy(c, g, x); return; }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.18, lift = Math.max(0, sd * x.walk) * 4;
          limb(c, [fx, g.bot - 6, fx, g.bot + ll * 0.5, fx, 181 - lift], 6, dk(x.body, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t);
          blob(c, fx, 182 - lift, 7, 4.5, dk(x.parts, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); } },
      inside(c, g, x) { if (g.stage === 'Mega') { c.fillStyle = rgba(mix(x.body, [130, 90, 60], 0.7), 0.88); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8); c.strokeStyle = rgba([70, 45, 30], 0.5); c.lineWidth = 2;   // bark over the body colour, bark lines, and the old nut shell as a patch on its chest
          for (const fx of [0.14, 0.86]) { c.beginPath(); c.moveTo(g.left + g.bw * fx, g.top + 8); c.quadraticCurveTo(g.left + g.bw * (fx + (fx < 0.5 ? 0.06 : -0.06)), g.top + g.bh * 0.5, g.left + g.bw * fx, g.bot - 6); c.stroke(); }
          c.fillStyle = rgba(lt(x.body, 0.25), 0.8); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.82, 8, 6, 0, 0, 7); c.fill(); c.fillStyle = rgba(dk(x.parts, 0.15), 0.9); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.78, 8.5, 4, 0, Math.PI, 0); c.fill(); return; }
        c.fillStyle = rgba(lt(x.body, 0.2), 0.7); c.beginPath(); c.arc(g.cx, g.bot + 1, 3, 0, 7); c.fill(); },
      front(c, g, x) { if (g.stage === 'Mega') return; const ch = g.bh * this.cap, cw = g.bw + 10, cy = g.top + ch * 0.7;   // the cap, with its crosshatch and stem
        c.fillStyle = rgb(dk(x.parts, 0.35)); c.beginPath(); c.ellipse(g.cx, cy + 3, cw / 2, ch * 0.75, 0, Math.PI, 0); c.closePath(); c.fill();
        c.fillStyle = rgb(dk(x.parts, 0.1)); c.beginPath(); c.ellipse(g.cx, cy, cw / 2, ch * 0.78, 0, Math.PI, 0); c.closePath(); c.fill();
        c.save(); c.clip(); c.strokeStyle = rgba(dk(x.parts, 0.4), 0.6); c.lineWidth = 1.4; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(g.cx + k * 7 - 20, cy); c.lineTo(g.cx + k * 7 + 10, cy - ch); c.moveTo(g.cx + k * 7 + 20, cy); c.lineTo(g.cx + k * 7 - 10, cy - ch); c.stroke(); } c.restore();
        roundBox(c, g.cx - cw / 2, cy - 3, cw, 6, 3); c.fillStyle = rgb(dk(x.parts, 0.25)); c.fill();
        c.strokeStyle = rgb(dk(x.parts, 0.4)); c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx, cy - ch * 0.7); c.quadraticCurveTo(g.cx + 2, cy - ch - 6, g.cx + 6, cy - ch - 8); c.stroke();
        if (g.stage === 'Byte') { const sw = Math.sin(x.t / 600) * 0.15; c.save(); c.translate(g.cx + 6, cy - ch - 8); c.rotate(-0.6 + sw); c.fillStyle = 'rgb(110,175,80)'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -10, 22, -4); c.quadraticCurveTo(10, 4, 0, 0); c.fill();
          c.strokeStyle = 'rgb(70,130,55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(20, -4); c.stroke(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.66, g.left + g.bw * 0.14, g.top + g.bh * 0.4, g.left + g.bw * 0.3, g.top + g.bh * 0.3],
      head: g => [g.cx, g.top + 2, g.bw * 0.48],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.36, ex: 0.18, my: 0.56, s: 0.82 } : { ey: 0.56, ex: 0.17, my: 0.74, s: by(g.stage, 0.7, 0.8, 0.86) })
    },
    /* Roly: a pill bug. A domed oval of overlapping plates with many little legs under it and two antennae.
       Mega rolls itself into an armoured ball: gold-edged bands with studs running round it, turning as it moves, its face peeking out of the gap, and dust kicking up */
    Roly: {
      dims: { Bit: [74, 46], Byte: [94, 58], Mega: [96, 96] }, ll: st => by(st, 5, 6, 2),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 20, 10); },
      path(c, g) { if (g.stage === 'Mega') { c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2, 0, 7); return; }
        c.beginPath(); c.moveTo(g.left, g.bot); c.bezierCurveTo(g.left - 4, g.top + g.bh * 0.1, g.left + g.bw + 4, g.top + g.bh * 0.1, g.left + g.bw, g.bot); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 0, 0), handR: st => 0, shoulderY: 0.7, armK: 0.7,
      behind(c, g, x) { const mega = g.stage === 'Mega';
        if (mega) { for (let k = 0; k < 3; k++) { const ph = (x.t / 500 + k / 3) % 1; c.fillStyle = `rgba(200,180,150,${0.5 * (1 - ph)})`; c.beginPath(); c.arc(g.left - ph * 18, 180 - ph * 6, 4 + ph * 6, 0, 7); c.fill(); }   // dust kicking up
          x.feet.push([g.cx, 182, g.bw * 0.3]); return; }
        const n = by(g.stage, 4, 6, 6); for (let i = 0; i < n; i++) { const fx = g.left + g.bw * (0.15 + 0.7 * i / (n - 1)), ph = Math.sin(x.t / 90 + i * 1.3) * (x.walk ? 2 : 0.5);   // many little legs
          c.strokeStyle = rgb(dk(x.parts, 0.3)); c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx, g.bot - 2); c.lineTo(fx + ph, 182); c.stroke(); }
        x.feet.push([g.cx, 182, g.bw * 0.35]);
        for (const sd of [-1, 1]) { const ax = g.cx + sd * g.bw * by(g.stage, 0.32, 0.4, 0.4), ay = g.top - by(g.stage, 8, 14, 14) + Math.sin(x.t / 300 + sd) * 2;   // antennae
          c.strokeStyle = rgb(dk(x.parts, 0.3)); c.lineWidth = 2; c.beginPath(); c.moveTo(g.cx + sd * 6, g.top + 8); c.quadraticCurveTo(g.cx + sd * 10, ay - 4, ax, ay); c.stroke(); if (g.stage === 'Byte') { c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(ax, ay, 2.5, 0, 7); c.fill(); } } },
      inside(c, g, x) { const mega = g.stage === 'Mega';
        if (mega) { const R = g.bw / 2, cy = g.top + R, roll = (x.t / (x.walk ? 400 : 1600)) % 1, gold = [228, 186, 80];   // bands running round the ball
          for (let i = -4; i <= 4; i++) { const u = ((i + roll) / 4.5), a = Math.asin(Math.max(-1, Math.min(1, u))), yy = cy + Math.sin(a) * R, w = Math.cos(a) * R; if (Math.abs(u) >= 1) continue;
            c.fillStyle = rgba(dk(x.body, 0.3), 0.6); c.beginPath(); c.ellipse(g.cx, yy + 2, w, 4 * Math.cos(a) + 1, 0, 0, Math.PI); c.fill();
            c.strokeStyle = rgba(gold, 0.95); c.lineWidth = 2.4; c.beginPath(); c.ellipse(g.cx, yy, w, 4 * Math.cos(a) + 1, 0, 0, Math.PI); c.stroke();
            for (const k of [-0.6, 0, 0.6]) { const sx = g.cx + w * k, sy = yy + 4 * Math.cos(a) * Math.sqrt(1 - k * k); c.fillStyle = rgb(lt(gold, 0.3)); c.beginPath(); c.arc(sx, sy, 2.2 * Math.cos(a) + 0.5, 0, 7); c.fill(); } }
          c.fillStyle = rgba(dk(x.body, 0.55), 0.85); c.beginPath(); c.ellipse(g.cx, cy + R * 0.12, R * 0.62, R * 0.4, 0, 0, 7); c.fill();   // the gap its face peeks out of
          c.fillStyle = rgb(lt(x.body, 0.25)); c.beginPath(); c.ellipse(g.cx, cy + R * 0.14, R * 0.56, R * 0.34, 0, 0, 7); c.fill(); return; }
        const n = by(g.stage, 4, 6, 6); for (let i = 1; i < n; i++) { const fy = g.top + g.bh * (i / n) * 0.95; c.strokeStyle = rgba(dk(x.body, 0.3), 0.6); c.lineWidth = 2; c.beginPath(); c.moveTo(g.left + 4, fy + g.bh * 0.08); c.quadraticCurveTo(g.cx, fy - 6, g.left + g.bw - 4, fy + g.bh * 0.08); c.stroke();
          if (g.stage === 'Byte') { c.strokeStyle = rgba(lt(x.body, 0.35), 0.6); c.lineWidth = 1; c.beginPath(); c.moveTo(g.left + 6, fy + g.bh * 0.08 - 2); c.quadraticCurveTo(g.cx, fy - 8, g.left + g.bw - 6, fy + g.bh * 0.08 - 2); c.stroke(); } } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.2, g.top + g.bh * 0.24, g.left + g.bw * 0.4, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.56, ex: 0.15, my: 0.68, s: 0.74 } : { ey: 0.5, ex: 0.16, my: 0.74, s: by(g.stage, 0.72, 0.8, 0.8) })
    },
    /* Trundle: a snail. A soft body with the face on it, two eye-stalk feelers, and a spiral shell on its back, striped from Byte.
       Mega carries a cottage instead of a shell: timber walls, a red roof, a lit window, a door and a chimney with smoke, and a slime trail that sparkles */
    Trundle: {
      dims: { Bit: [54, 60], Byte: [64, 74], Mega: [72, 80] }, ll: st => 0,
      bottom() { return 182; }, height(st) { return this.dims[st][1] + by(st, 26, 36, 70); },
      path(c, g) { c.beginPath(); c.moveTo(g.left - 10, g.bot); c.lineTo(g.left, g.bot - 6); c.bezierCurveTo(g.left - 4, g.top + g.bh * 0.2, g.left + g.bw * 0.1, g.top, g.cx, g.top);
        c.bezierCurveTo(g.left + g.bw * 0.9, g.top, g.left + g.bw + 4, g.top + g.bh * 0.2, g.left + g.bw, g.bot - 6); c.lineTo(g.left + g.bw + 10, g.bot); c.closePath(); },
      arms: 'stub', armW: st => 0, handR: st => 0, shoulderY: 0.6, armK: 0.7, slots: { feet: false },
      behind(c, g, x) { const mega = g.stage === 'Mega', sx = g.cx - g.bw * 0.42, sy = g.top + g.bh * 0.36;
        if (mega) { const hw = 64, hh = 48, hx = sx - hw * 0.5 + 6, hy = sy - hh + 18, wood = mix(x.parts, [200, 160, 110], 0.6), roof = mix(x.acc, [196, 70, 60], 0.5);   // the cottage on its back
          roundBox(c, hx, hy + 3, hw, hh, 4); c.fillStyle = rgb(dk(wood, 0.3)); c.fill(); roundBox(c, hx, hy, hw, hh, 4); c.fillStyle = rgb(wood); c.fill();
          c.strokeStyle = rgba(dk(wood, 0.35), 0.7); c.lineWidth = 1.5; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(hx, hy + k * hh / 4); c.lineTo(hx + hw, hy + k * hh / 4); c.stroke(); }
          c.fillStyle = rgb(dk(roof, 0.3)); c.beginPath(); c.moveTo(hx - 8, hy + 3); c.lineTo(hx + hw / 2, hy - 30); c.lineTo(hx + hw + 8, hy + 3); c.closePath(); c.fill();
          c.fillStyle = rgb(roof); c.beginPath(); c.moveTo(hx - 8, hy); c.lineTo(hx + hw / 2, hy - 33); c.lineTo(hx + hw + 8, hy); c.closePath(); c.fill();
          c.fillStyle = rgb(dk(roof, 0.4)); c.fillRect(hx + hw * 0.66, hy - 30, 9, 18); c.fillStyle = rgb(dk(roof, 0.2)); c.fillRect(hx + hw * 0.64, hy - 32, 13, 4);   // chimney and its smoke
          for (let k = 0; k < 3; k++) { const ph = (x.t / 1800 + k / 3) % 1; c.fillStyle = `rgba(235,235,240,${0.7 * (1 - ph)})`; c.beginPath(); c.arc(hx + hw * 0.7 + ph * 10 + Math.sin(ph * 6) * 3, hy - 36 - ph * 26, 4 + ph * 5, 0, 7); c.fill(); }
          const lit = 0.75 + 0.25 * Math.sin(x.t / 400); c.fillStyle = `rgba(255,214,110,${lit})`; roundBox(c, hx + 8, hy + 12, 16, 14, 2); c.fill(); c.strokeStyle = rgb(dk(wood, 0.45)); c.lineWidth = 2; c.strokeRect(hx + 8, hy + 12, 16, 14); c.beginPath(); c.moveTo(hx + 16, hy + 12); c.lineTo(hx + 16, hy + 26); c.moveTo(hx + 8, hy + 19); c.lineTo(hx + 24, hy + 19); c.stroke();
          c.fillStyle = rgb(dk(wood, 0.5)); roundBox(c, hx + hw - 24, hy + hh - 24, 14, 24, 6); c.fill(); c.fillStyle = '#e9c45a'; c.beginPath(); c.arc(hx + hw - 13, hy + hh - 12, 1.5, 0, 7); c.fill();
          for (const [fx, col] of [[-6, '#ff8fb0'], [2, '#ffd65a'], [hw + 4, '#a8c8ff']]) { c.fillStyle = 'rgb(90,160,70)'; c.fillRect(hx + fx, hy + hh - 6, 2, 7); c.fillStyle = col; c.beginPath(); c.arc(hx + fx + 1, hy + hh - 7, 3, 0, 7); c.fill(); } }
        else { const R = g.bw * by(g.stage, 0.5, 0.56, 0.6);   // the spiral shell
          c.fillStyle = rgb(dk(x.parts, 0.3)); c.beginPath(); c.arc(sx, sy + 3, R, 0, 7); c.fill(); c.fillStyle = rgb(x.parts); c.beginPath(); c.arc(sx, sy, R, 0, 7); c.fill();
          if (g.stage === 'Byte') { c.save(); c.beginPath(); c.arc(sx, sy, R, 0, 7); c.clip(); c.strokeStyle = rgba(lt(x.acc, 0.3), 0.7); c.lineWidth = 5; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(sx + k * 12 - R, sy - R); c.lineTo(sx + k * 12 + R * 0.4, sy + R); c.stroke(); } c.restore(); }
          c.strokeStyle = rgb(dk(x.parts, 0.35)); c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); for (let a = 0; a < 13; a += 0.2) { const r = R * 0.9 * (1 - a / 14); c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } c.stroke(); }
        for (const sd of [-1, 1]) { const ax = g.cx + sd * g.bw * 0.28, ay = g.top - by(g.stage, 14, 18, 20) + Math.sin(x.t / 400 + sd) * 2;   // eye-stalk feelers
          c.strokeStyle = rgb(dk(x.body, 0.15)); c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.16, g.top + 6); c.lineTo(ax, ay); c.stroke(); c.fillStyle = rgb(lt(x.body, 0.1)); c.beginPath(); c.arc(ax, ay, 4, 0, 7); c.fill(); }
        x.feet.push([g.cx, 182, g.bw * 0.5]); },
      inside(c, g, x) { c.fillStyle = rgba(lt(x.body, 0.25), 0.7); c.beginPath(); c.ellipse(g.cx, g.bot - 3, g.bw * 0.55, 4, 0, 0, 7); c.fill(); },
      front(c, g, x) { if (g.stage === 'Bit') return; for (let k = 0; k < (g.stage === 'Mega' ? 6 : 3); k++) { const ph = (x.t / 1600 + k / 6) % 1, px = g.left - 10 - k * 9, tw = Math.sin(x.t / 150 + k) > 0.6;   // the slime trail
          c.fillStyle = 'rgba(200,230,255,.45)'; c.beginPath(); c.ellipse(px, 183, 6, 1.6, 0, 0, 7); c.fill(); if (g.stage === 'Mega' && tw) star(c, px, 180, 0.25, '#ffffff'); } },
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.6, g.left + g.bw * 0.18, g.top + g.bh * 0.24, g.left + g.bw * 0.4, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.4, ex: 0.18, my: 0.6, s: by(g.stage, 0.7, 0.78, 0.84) })
    },
    /* ---- batch 3 uncommons ---- */
    /* Clank: a wind-up tin toy. Bit is a tin can with a key and one antenna. Byte is a boxy tin robot with a chest gauge, pincer hands and springy antennae.
       Mega is a walker mech: a wide armoured chassis on piston legs, shoulder plates with exhaust pipes, a spinning chest gear and a jet pack */
    Clank: {
      dims: { Bit: [54, 56], Byte: [72, 68], Mega: [104, 78] }, ll: st => by(st, 7, 13, 26),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 22, 26, 34); },
      path(c, g) { if (g.stage === 'Bit') { roundBox(c, g.left, g.top, g.bw, g.bh, 10); return; } if (g.stage === 'Byte') { roundBox(c, g.left, g.top, g.bw, g.bh, 7); return; }
        const L = g.left, R = L + g.bw, T = g.top, B = g.bot, ch = 14; c.beginPath(); c.moveTo(L + ch, T); c.lineTo(R - ch, T); c.lineTo(R, T + ch); c.lineTo(R - 6, B); c.lineTo(L + 6, B); c.lineTo(L, T + ch); c.closePath(); },
      arms: 'stub', armW: st => 0, handR: st => 0, shoulderY: 0.6, armK: 0.8,
      tin: x => mix(x.parts, [170, 178, 190], 0.6),
      behind(c, g, x) { const st = g.stage, ll = this.ll(st), tin = this.tin(x), kr = x.t / 300;
        if (st !== 'Mega') { const kx = g.left + g.bw + 4, ky = g.top + g.bh * 0.45, ks = by(st, 8, 11, 0), w = Math.abs(Math.cos(kr));   // the wind-up key turning on its side
          c.fillStyle = rgb(dk(tin, 0.2)); c.fillRect(g.left + g.bw - 2, ky - 2, 8, 4); c.fillStyle = rgb(lt(tin, 0.1)); for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(kx + 4, ky + sd * ks * 0.55, ks * 0.45 * (0.3 + 0.7 * w), ks * 0.5, 0, 0, 7); c.fill(); } }
        const ants = st === 'Bit' ? [0] : st === 'Byte' ? [-1, 1] : [];
        for (const sd of ants) { const ax = g.cx + sd * g.bw * 0.22, top = g.top - by(st, 14, 18, 0) + Math.sin(x.t / 200 + sd) * 2; c.strokeStyle = rgb(dk(tin, 0.3)); c.lineWidth = 2; c.beginPath(); c.moveTo(ax, g.top);
          if (st === 'Byte') { for (let k = 0; k < 5; k++) c.lineTo(ax + (k % 2 ? 3 : -3), g.top - (k + 1) * (g.top - top) / 6); } c.lineTo(ax, top); c.stroke(); c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(ax, top, 3.5, 0, 7); c.fill(); }
        if (st === 'Mega') { const jp = [g.left + 8, g.left + g.bw - 30];   // the jet pack: two thrusters with flames
          for (const jx of jp) { roundBox(c, jx, g.top - 14, 22, 34, 6); c.fillStyle = rgb(dk(tin, 0.25)); c.fill(); c.fillStyle = rgb(dk(tin, 0.45)); c.fillRect(jx + 4, g.top - 18, 14, 6);
            const fl = 0.8 + 0.2 * Math.sin(x.t / 40 + jx); c.fillStyle = 'rgba(255,170,60,.9)'; c.beginPath(); c.moveTo(jx + 4, g.top - 18); c.quadraticCurveTo(jx + 11, g.top - 38 * fl, jx + 18, g.top - 18); c.fill(); c.fillStyle = 'rgba(255,240,180,.95)'; c.beginPath(); c.moveTo(jx + 7, g.top - 18); c.quadraticCurveTo(jx + 11, g.top - 28 * fl, jx + 15, g.top - 18); c.fill(); }
          for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.28, lift = Math.max(0, sd * x.walk) * 5;   // piston legs on wide feet
            c.fillStyle = rgb(dk(tin, 0.3)); c.fillRect(hx - 9, g.bot - 4, 18, 12); c.fillStyle = rgb(lt(tin, 0.15)); c.fillRect(hx - 5, g.bot + 6, 10, ll - 12 - lift); c.fillStyle = rgb(dk(tin, 0.1)); c.fillRect(hx - 7, g.bot + 8, 14, 4);
            roundBox(c, hx - 16, 172 - lift, 32, 11, 4); c.fillStyle = rgb(dk(tin, 0.35)); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 0; k < 4; k++) c.fillRect(hx - 13 + k * 8, 180 - lift, 4, 3); x.feet.push([hx, 182 - lift, 14]); }
          return; }
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4;
          limb(c, [hx, g.bot - 4, hx, g.bot + ll * 0.5, hx, 181 - lift], by(st, 6, 7, 0), dk(tin, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t);
          roundBox(c, hx - by(st, 7, 9, 0), 176 - lift, by(st, 14, 18, 0), 7, 3); c.fillStyle = rgb(dk(tin, 0.35)); c.fill(); x.feet.push([hx, 182 - lift, 7]); }
        if (st === 'Byte') { const A = x.P.arm || [[12, 8, 16, 22], [12, 8, 16, 22]];   // pincer hands on stiff arms
          for (const sd of [-1, 1]) { const a = A[sd < 0 ? 0 : 1], sx = g.cx + sd * g.bw * 0.5, sy = g.top + g.bh * 0.55, ex = sx + sd * Math.max(10, a[2] * 0.7), ey = sy + 14 - Math.max(0, -a[3] - 10) * 0.6;
            c.strokeStyle = rgb(dk(tin, 0.2)); c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
            c.strokeStyle = rgb(dk(tin, 0.35)); c.lineWidth = 3; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + sd * 6, ey + k * 5); c.lineTo(ex + sd * 10, ey + k * 2); c.stroke(); }
            if (sd > 0 && CAP) (CAP.hands = CAP.hands || []).push(capPt(c, ex + 8, ey)); } } },
      inside(c, g, x) { const st = g.stage, tin = this.tin(x);
        c.fillStyle = rgba(tin, 0.45); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8);   // tin over the body colour
        c.fillStyle = rgb(dk(tin, 0.3)); for (const [fx, fy] of [[0.1, 0.12], [0.9, 0.12], [0.1, 0.88], [0.9, 0.88]]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, 2.2, 0, 7); c.fill(); }   // rivets
        if (st === 'Bit') { c.strokeStyle = rgba(dk(tin, 0.3), 0.6); c.lineWidth = 1.5; for (const fy of [0.2, 0.84]) { c.beginPath(); c.moveTo(g.left, g.top + g.bh * fy); c.lineTo(g.left + g.bw, g.top + g.bh * fy); c.stroke(); } }
        if (st === 'Byte') { const gx = g.cx, gy = g.top + g.bh * 0.8; c.fillStyle = rgb(lt(tin, 0.4)); c.beginPath(); c.arc(gx, gy, 7, Math.PI, 0); c.fill(); c.strokeStyle = '#c23a3a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + Math.cos(Math.PI + 0.6 + Math.sin(x.t / 500)) * 6, gy + Math.sin(Math.PI + 0.6 + Math.sin(x.t / 500)) * 6); c.stroke(); }
        if (st === 'Mega') { const gx = g.cx, gy = g.top + g.bh * 0.82, rr = 10;   // a spinning gear around a glowing core
          c.save(); c.translate(gx, gy); c.rotate(x.t / 600); c.fillStyle = rgb(dk(tin, 0.15)); for (let k = 0; k < 8; k++) { c.save(); c.rotate(k * Math.PI / 4); c.fillRect(-2.5, -rr - 3, 5, 5); c.restore(); } c.beginPath(); c.arc(0, 0, rr, 0, 7); c.fill(); c.restore();
          const gl = 0.7 + 0.3 * Math.sin(x.t / 300); c.fillStyle = rgba(lt(x.acc, 0.4), gl); c.beginPath(); c.arc(gx, gy, 5, 0, 7); c.fill();
          c.strokeStyle = rgba(dk(tin, 0.35), 0.6); c.lineWidth = 1.5; c.beginPath(); c.moveTo(g.left + 14, g.top + g.bh * 0.62); c.lineTo(g.left + g.bw - 14, g.top + g.bh * 0.62); c.stroke(); } },
      front(c, g, x) { if (g.stage !== 'Mega') return; const tin = this.tin(x);
        for (const sd of [-1, 1]) { const px = sd < 0 ? g.left - 14 : g.left + g.bw - 18, py = g.top + 2;   // shoulder plates with exhaust pipes
          roundBox(c, px, py + 3, 32, 22, 8); c.fillStyle = rgb(dk(x.acc, 0.3)); c.fill(); roundBox(c, px, py, 32, 22, 8); c.fillStyle = rgb(x.acc); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(px + 5, py + 4, 18, 3);
          const ex = px + 16, ey = py - 4; c.fillStyle = rgb(dk(tin, 0.3)); c.fillRect(ex - 3, ey - 10, 6, 12); for (let k = 0; k < 2; k++) { const ph = (x.t / 900 + k / 2 + (sd > 0 ? 0.25 : 0)) % 1; c.fillStyle = `rgba(230,230,235,${0.7 * (1 - ph)})`; c.beginPath(); c.arc(ex + sd * ph * 6, ey - 12 - ph * 20, 3 + ph * 5, 0, 7); c.fill(); } }
        const A = x.P.arm || [[12, 8, 16, 22], [12, 8, 16, 22]], reach = Math.max(0, (A[1][2] - 16) / 30);   // a big fist on the right arm
        const fx = g.left + g.bw + 6 + reach * 18, fy = g.top + g.bh * 0.62; roundBox(c, fx - 9, fy - 8, 18, 16, 5); c.fillStyle = rgb(dk(tin, 0.2)); c.fill(); c.fillStyle = rgb(lt(tin, 0.1)); c.fillRect(fx - 7, fy - 6, 14, 4); if (CAP) (CAP.hands = CAP.hands || []).push(capPt(c, fx + 8, fy)); },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.6, g.left + g.bw * 0.1, g.top + g.bh * 0.22, g.left + g.bw * 0.3, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.48],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.36, ex: 0.15, my: 0.56, s: 0.86 } : { ey: 0.4, ex: 0.18, my: 0.62, s: by(g.stage, 0.66, 0.76, 0.86) })
    },
    /* Crease: paper folding. Bit is a folded paper boat. Byte is a paper crane with its wings up, a long neck and a pointed tail.
       Mega is a paper phoenix: layered wings in three papers, a crest of folded points, long folded streamers for a tail, and little cranes circling it */
    Crease: {
      dims: { Bit: [74, 40], Byte: [60, 56], Mega: [70, 64] }, float: true, slots: { feet: false },
      bottom(st) { return st === 'Bit' ? 180 : st === 'Byte' ? 140 : 124; }, height(st) { return this.dims[st][1] + by(st, 34, 56, 80); },
      path(c, g) { if (g.stage === 'Bit') { c.beginPath(); c.moveTo(g.left - 8, g.top + 6); c.lineTo(g.left + g.bw + 8, g.top + 6); c.lineTo(g.left + g.bw - 8, g.bot); c.lineTo(g.left + 8, g.bot); c.closePath(); return; }
        c.beginPath(); c.moveTo(g.cx, g.top); c.lineTo(g.left + g.bw, g.top + g.bh * 0.5); c.lineTo(g.cx, g.bot); c.lineTo(g.left, g.top + g.bh * 0.5); c.closePath(); },
      behind(c, g, x) { const st = g.stage, fl = Math.sin(x.t / (st === 'Mega' ? 260 : 340));
        if (st === 'Bit') { c.fillStyle = rgb(lt(x.body, 0.35)); c.beginPath(); c.moveTo(g.cx, g.top - 30); c.lineTo(g.cx + 22, g.top + 6); c.lineTo(g.cx - 22, g.top + 6); c.closePath(); c.fill();   // the boat's folded sail
          c.fillStyle = rgb(lt(x.body, 0.15)); c.beginPath(); c.moveTo(g.cx, g.top - 30); c.lineTo(g.cx, g.top + 6); c.lineTo(g.cx - 22, g.top + 6); c.closePath(); c.fill();
          for (let k = 0; k < 3; k++) { const ph = (x.t / 1400 + k / 3) % 1; c.strokeStyle = `rgba(150,200,240,${0.6 * (1 - ph)})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(g.cx, 182, g.bw * (0.5 + ph * 0.4), 3 + ph * 2, 0, 0, Math.PI); c.stroke(); }
          x.feet.push([g.cx, 182, g.bw * 0.4]); return; }
        const papers = st === 'Mega' ? [lt(x.acc, 0.2), x.parts, lt(x.body, 0.3)] : [lt(x.body, 0.3)];
        papers.forEach((pc, i) => { const span = g.bw * (st === 'Mega' ? 1.25 - i * 0.2 : 1.1), lift = g.bh * (st === 'Mega' ? 1.0 - i * 0.18 : 0.9);   // wings, layered at Mega
          for (const sd of [-1, 1]) { const bx = g.cx + sd * g.bw * 0.2, by0 = g.top + g.bh * 0.5, tx = g.cx + sd * span, ty = by0 - lift * (0.8 + fl * 0.2);
            c.fillStyle = rgb(dk(pc, 0.12)); c.beginPath(); c.moveTo(bx, by0); c.lineTo(tx, ty); c.lineTo(g.cx + sd * span * 0.55, by0 + 4); c.closePath(); c.fill();
            c.fillStyle = rgb(pc); c.beginPath(); c.moveTo(bx, by0); c.lineTo(tx, ty); c.lineTo(g.cx + sd * span * 0.5, by0 - lift * 0.15); c.closePath(); c.fill(); } });
        const nk = st === 'Mega' ? 1.3 : 1;   // the neck and head up to one side, the tail up to the other
        c.fillStyle = rgb(lt(x.body, 0.1)); c.beginPath(); c.moveTo(g.cx + g.bw * 0.3, g.top + g.bh * 0.5); c.lineTo(g.cx + g.bw * 0.9 * nk, g.top - g.bh * 0.5 * nk); c.lineTo(g.cx + g.bw * 0.46, g.top + g.bh * 0.66); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(g.cx + g.bw * 0.9 * nk, g.top - g.bh * 0.5 * nk); c.lineTo(g.cx + g.bw * 1.08 * nk, g.top - g.bh * 0.32 * nk); c.lineTo(g.cx + g.bw * 0.86 * nk, g.top - g.bh * 0.4 * nk); c.closePath(); c.fill();
        c.fillStyle = rgb(dk(x.body, 0.05)); c.beginPath(); c.moveTo(g.cx - g.bw * 0.3, g.top + g.bh * 0.5); c.lineTo(g.cx - g.bw * 0.86 * nk, g.top - g.bh * 0.36 * nk); c.lineTo(g.cx - g.bw * 0.46, g.top + g.bh * 0.66); c.closePath(); c.fill();
        if (st === 'Mega') { for (let k = 0; k < 4; k++) { const sw = Math.sin(x.t / 300 + k) * 6, col = [x.acc, x.parts, lt(x.body, 0.2), x.acc][k];   // folded streamers
            c.fillStyle = rgb(col); c.beginPath(); c.moveTo(g.cx - 6 + k * 4, g.bot - 6); for (let s = 1; s <= 5; s++) c.lineTo(g.cx - 10 + k * 6 + (s % 2 ? sw : -sw) * 0.6 - s * 3, g.bot + s * 9); c.lineTo(g.cx - 4 + k * 6 - 15, g.bot + 45); c.lineTo(g.cx + k * 4, g.bot - 6); c.closePath(); c.fill(); }
          for (let k = 0; k < 3; k++) { const ang = -Math.PI / 2 + (k - 1) * 0.5, px = g.cx + Math.cos(ang) * 14, py = g.top + 4 + Math.sin(ang) * 14; c.fillStyle = rgb(k === 1 ? x.acc : lt(x.acc, 0.3)); c.beginPath(); c.moveTo(px - 4, py + 6); c.lineTo(px + Math.cos(ang) * 14, py + Math.sin(ang) * 14); c.lineTo(px + 4, py + 6); c.closePath(); c.fill(); } }   // a crest
        x.feet.push([g.cx, st === 'Mega' ? 182 : 182, 8]); },
      inside(c, g, x) { c.strokeStyle = rgba(dk(x.body, 0.25), 0.6); c.lineWidth = 1.2;   // the creases
        if (g.stage === 'Bit') { c.beginPath(); c.moveTo(g.cx, g.top + 6); c.lineTo(g.cx, g.bot); c.moveTo(g.left, g.top + 6); c.lineTo(g.cx, g.bot); c.moveTo(g.left + g.bw, g.top + 6); c.lineTo(g.cx, g.bot); c.stroke(); return; }
        c.beginPath(); c.moveTo(g.cx, g.top); c.lineTo(g.cx, g.bot); c.moveTo(g.left, g.top + g.bh * 0.5); c.lineTo(g.left + g.bw, g.top + g.bh * 0.5); c.stroke();
        c.fillStyle = rgba(dk(x.body, 0.1), 0.35); c.beginPath(); c.moveTo(g.cx, g.top); c.lineTo(g.left + g.bw, g.top + g.bh * 0.5); c.lineTo(g.cx, g.top + g.bh * 0.5); c.closePath(); c.fill(); },
      front(c, g, x) { if (g.stage !== 'Mega') return; for (let k = 0; k < 3; k++) { const a = x.t / 1200 + k * 2.1, px = g.cx + Math.cos(a) * g.bw * 1.3, py = g.top + g.bh * 0.4 + Math.sin(a) * g.bh * 0.6;   // little white cranes circling
          c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.moveTo(px, py); c.lineTo(px - 6, py - 5 - Math.sin(x.t / 120 + k) * 3); c.lineTo(px - 2, py + 1); c.lineTo(px + 6, py - 5 - Math.sin(x.t / 120 + k) * 3); c.closePath(); c.fill(); } },
      hl: g => [g.left + g.bw * 0.24, g.top + g.bh * 0.5, g.left + g.bw * 0.3, g.top + g.bh * 0.32, g.left + g.bw * 0.42, g.top + g.bh * 0.16],
      head: g => [g.cx, g.top + 2, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Bit' ? { ey: 0.4, ex: 0.16, my: 0.72, s: 0.66 } : { ey: 0.48, ex: 0.15, my: 0.68, s: by(g.stage, 0.66, 0.66, 0.74) })
    },
    /* Twiglet: a little potted plant. Bit is a sprout with two leaves in a small clay pot. Byte is a bonsai with a twisting trunk and cloud pads of leaves in a glazed pot.
       Mega is a bonsai garden on a wide tray: a cherry bonsai in blossom, a stone lantern, rocks and moss, with petals falling */
    Twiglet: {
      topUp: { Mega: 52 },
      dims: { Bit: [50, 44], Byte: [62, 50], Mega: [112, 46] }, ll: st => by(st, 4, 5, 8),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 30, 56, 84); },
      path(c, g) { if (g.stage === 'Mega') { roundBox(c, g.left, g.top, g.bw, g.bh, 8); return; } const ins = g.stage === 'Bit' ? 7 : 4;
        c.beginPath(); c.moveTo(g.left - 3, g.top); c.lineTo(g.left + g.bw + 3, g.top); c.lineTo(g.left + g.bw - ins, g.bot - 4); c.quadraticCurveTo(g.left + g.bw - ins, g.bot, g.left + g.bw - ins - 4, g.bot); c.lineTo(g.left + ins + 4, g.bot); c.quadraticCurveTo(g.left + ins, g.bot, g.left + ins, g.bot - 4); c.closePath(); },
      pad(c, px, py, r, col) { c.fillStyle = rgb(dk(col, 0.25)); c.beginPath(); c.ellipse(px, py + 3, r, r * 0.55, 0, 0, 7); c.fill(); c.fillStyle = rgb(col); for (const [ox, oy, k] of [[-0.45, 0, 0.6], [0, -0.2, 0.7], [0.45, 0, 0.6]]) { c.beginPath(); c.ellipse(px + ox * r, py + oy * r, r * k, r * 0.45, 0, 0, 7); c.fill(); }
        c.fillStyle = rgba(lt(col, 0.3), 0.7); c.beginPath(); c.ellipse(px - r * 0.2, py - r * 0.25, r * 0.3, r * 0.15, 0, 0, 7); c.fill(); },
      behind(c, g, x) { const st = g.stage, sw = Math.sin(x.t / 900) * 2, bark = [120, 84, 58], leaf = mix([100, 170, 80], x.acc, 0.15);
        for (const sd of [-1, 1]) for (const k of st === 'Mega' ? [0.12, 0.88] : [0.3]) { const fx = st === 'Mega' ? g.left + g.bw * (sd < 0 ? k : 1 - k + 0.76 - 0.76) : g.cx + sd * g.bw * k, lift = Math.max(0, sd * x.walk) * 3;   // little feet under the pot or the tray
          if (st === 'Mega' && sd > 0) continue; for (const fx2 of st === 'Mega' ? [g.left + g.bw * 0.12, g.left + g.bw * 0.88] : [fx]) { roundBox(c, fx2 - 6, g.bot - 2, 12, 182 - g.bot + 2 - lift, 3); c.fillStyle = rgb(dk(x.body, 0.35)); c.fill(); x.feet.push([fx2, 182 - lift, 6]); } }
        if (st === 'Bit') { c.strokeStyle = 'rgb(90,150,70)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx, g.top + 2); c.quadraticCurveTo(g.cx + 2, g.top - 12, g.cx + sw, g.top - 20); c.stroke();   // a sprout
          for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sw, g.top - 20); c.rotate(sd * (0.6 + Math.sin(x.t / 700) * 0.1)); c.fillStyle = 'rgb(120,190,90)'; c.beginPath(); c.ellipse(sd * 9, 0, 10, 5.5, 0, 0, 7); c.fill(); c.restore(); } return; }
        const tx = st === 'Mega' ? g.left + g.bw * 0.66 : g.cx, ty = g.top + 2, s = st === 'Mega' ? 1.6 : 1;   // a twisting trunk
        c.strokeStyle = rgb(dk(bark, 0.2)); c.lineWidth = 9 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx, ty); c.bezierCurveTo(tx - 16 * s, ty - 14 * s, tx + 14 * s, ty - 26 * s, tx - 4 * s + sw, ty - 40 * s); c.stroke();
        c.strokeStyle = rgb(bark); c.lineWidth = 6 * s; c.stroke(); c.lineWidth = 4 * s; c.beginPath(); c.moveTo(tx - 2 * s, ty - 20 * s); c.quadraticCurveTo(tx - 22 * s, ty - 22 * s, tx - 26 * s + sw, ty - 30 * s); c.moveTo(tx + 4 * s, ty - 28 * s); c.quadraticCurveTo(tx + 20 * s, ty - 30 * s, tx + 24 * s + sw, ty - 36 * s); c.stroke();
        const pc = st === 'Mega' ? mix([255, 185, 205], x.acc, 0.15) : leaf;
        this.pad(c, tx - 26 * s + sw, ty - 34 * s, 14 * s, pc); this.pad(c, tx + 24 * s + sw, ty - 40 * s, 13 * s, pc); this.pad(c, tx - 4 * s + sw, ty - 50 * s, 16 * s, pc);
        if (st === 'Mega') { const lx = g.left + g.bw * 0.2, ly = g.top + 2, st2 = [150, 148, 140];   // a stone lantern, rocks and moss on the tray
          c.fillStyle = rgb(dk(st2, 0.2)); c.fillRect(lx - 3, ly - 22, 6, 22); c.fillStyle = rgb(st2); c.fillRect(lx - 9, ly - 32, 18, 12); c.fillStyle = 'rgba(255,220,130,.85)'; c.fillRect(lx - 4, ly - 29, 8, 6);
          c.fillStyle = rgb(dk(st2, 0.1)); c.beginPath(); c.moveTo(lx - 13, ly - 32); c.lineTo(lx, ly - 42); c.lineTo(lx + 13, ly - 32); c.closePath(); c.fill();
          for (const [rx, rr] of [[0.38, 8], [0.46, 5], [0.86, 7]]) { c.fillStyle = rgb(dk(st2, 0.15)); c.beginPath(); c.ellipse(g.left + g.bw * rx, ly, rr, rr * 0.7, 0, Math.PI, 0); c.fill(); }
          c.fillStyle = 'rgb(110,170,80)'; for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(g.left + 10 + k * (g.bw - 20) / 8, ly + 1, 4, Math.PI, 0); c.fill(); } } },
      inside(c, g, x) { const st = g.stage;
        if (st === 'Bit') { c.fillStyle = rgba(mix(x.body, [196, 112, 72], 0.5), 0.6); c.fillRect(g.left - 4, g.top - 2, g.bw + 8, g.bh + 6); }   // clay
        c.fillStyle = rgb(dk(x.body, 0.25)); c.fillRect(g.left - 4, g.top, g.bw + 8, 6);   // the rim
        if (st === 'Byte') { c.strokeStyle = rgba(lt(x.acc, 0.3), 0.8); c.lineWidth = 2.5; c.beginPath(); for (let k = 0; k <= 10; k++) c.lineTo(g.left + g.bw * k / 10, g.bot - 10 + (k % 2 ? -4 : 0)); c.stroke(); }   // a glaze band
        if (st === 'Mega') { c.fillStyle = rgba(lt(x.body, 0.3), 0.5); c.fillRect(g.left + 6, g.top + 8, g.bw - 12, 3); c.fillStyle = '#e9b23a'; for (const fx of [0.08, 0.92]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * 0.55, 3, 0, 7); c.fill(); } } },
      front(c, g, x) { if (g.stage !== 'Mega') return; for (let k = 0; k < 6; k++) { const ph = (x.t / 2600 + k / 6) % 1, px = g.left + g.bw * (0.4 + ((k * 0.37) % 0.6)) - ph * 30, py = g.top - 90 + ph * 100;   // petals falling
          c.save(); c.translate(px, py); c.rotate(ph * 7 + k); c.fillStyle = `rgba(255,190,210,${Math.sin(ph * Math.PI)})`; c.beginPath(); c.ellipse(0, 0, 3.5, 2, 0, 0, 7); c.fill(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.08, g.top + g.bh * 0.7, g.left + g.bw * 0.1, g.top + g.bh * 0.3, g.left + g.bw * 0.2, g.top + g.bh * 0.2],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.5, ex: 0.1, my: 0.78, s: 0.76 } : { ey: 0.46, ex: 0.18, my: 0.74, s: by(g.stage, 0.6, 0.7, 0.7) })
    },
    /* Swirl: snow. Bit is a snowball with stick arms. Byte is a snow globe on a wooden base with snow swirling inside it.
       Mega is a grand snow globe: a frozen castle and an aurora inside, a gold base set with gems, a ring of blizzard circling it and an ice crown */
    Swirl: {
      dims: { Bit: [60, 58], Byte: [76, 72], Mega: [96, 92] }, bs: st => by(st, 0, 16, 22), ll: st => by(st, 5, 4, 4),
      bottom(st) { return 182 - this.ll(st) - this.bs(st); }, height(st) { return this.dims[st][1] + this.ll(st) + this.bs(st) + by(st, 8, 10, 26); },
      glass: true, patternAfter: true,
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      arms: 'stub', armW: st => 0, handR: st => 0, shoulderY: 0.6, armK: 0.7,
      behind(c, g, x) { const st = g.stage, lift0 = x.walk ? Math.max(0, Math.sin(x.t / 200)) * 3 : 0;
        if (st === 'Bit') { for (const sd of [-1, 1]) { const sx = g.cx + sd * g.bw * 0.45, sy = g.top + g.bh * 0.5, A = x.P.arm || [[12, 8, 16, 22], [12, 8, 16, 22]], r = sd > 0 ? Math.max(0, (A[1][2] - 16) / 30) : 0;   // stick arms
            c.strokeStyle = '#7a5434'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + sd * (16 + r * 12), sy - 10 + r * 8); c.moveTo(sx + sd * 10, sy - 5); c.lineTo(sx + sd * 14, sy - 13); c.stroke(); if (sd > 0 && CAP) (CAP.hands = CAP.hands || []).push(capPt(c, sx + 16 + r * 12, sy - 10 + r * 8)); }
          for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 8, 4.5, lt(x.body, 0.3), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); } return; }
        x.feet.push([g.cx, 182, g.bw * 0.4]);
        if (st === 'Mega') { const a = x.t / 700; for (let k = 0; k < 14; k++) { const ang = a + k / 14 * Math.PI * 2, s = Math.sin(ang); if (s > 0) continue; c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(g.cx + Math.cos(ang) * g.bw * 0.72, g.top + g.bh * 0.55 + s * 14, 2.5, 0, 7); c.fill(); } } },
      inside(c, g, x) { const st = g.stage;
        if (st === 'Bit') { c.fillStyle = rgba(lt(x.body, 0.6), 0.7); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8); c.fillStyle = 'rgba(200,215,235,.6)'; const r = rng(3); for (let k = 0; k < 10; k++) { c.beginPath(); c.arc(g.left + g.bw * r(), g.top + g.bh * r(), 1.5 + r() * 2, 0, 7); c.fill(); } return; }   // a snowball
        const cy = g.top + g.bh / 2;
        if (st === 'Mega') { const au = c.createLinearGradient(0, g.top, 0, cy); au.addColorStop(0, rgba(mix([120, 240, 190], x.acc, 0.3), 0.5)); au.addColorStop(1, 'rgba(120,240,190,0)'); c.fillStyle = au;   // an aurora and a frozen castle
          c.beginPath(); c.moveTo(g.left, cy - 6); for (let k = 0; k <= 8; k++) c.lineTo(g.left + g.bw * k / 8, g.top + g.bh * 0.12 + Math.sin(x.t / 700 + k) * 6); c.lineTo(g.left + g.bw, cy - 6); c.closePath(); c.fill();
          const cb = g.bot - 4, cc = 'rgba(225,240,255,.85)'; c.fillStyle = cc; c.fillRect(g.cx - 26, cb - 22, 52, 22); for (const [tx, tw, th] of [[-26, 12, 38], [14, 12, 38], [-8, 16, 46]]) { c.fillRect(g.cx + tx, cb - th, tw, th); c.beginPath(); c.moveTo(g.cx + tx - 2, cb - th); c.lineTo(g.cx + tx + tw / 2, cb - th - 12); c.lineTo(g.cx + tx + tw + 2, cb - th); c.closePath(); c.fill(); }
          c.fillStyle = 'rgba(255,220,130,.8)'; c.fillRect(g.cx - 3, cb - 34, 6, 8); }
        c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(g.cx, g.bot - 4, g.bw * 0.46, 8, 0, 0, 7); c.fill();   // snow on the floor of the globe
        for (let k = 0; k < by(st, 0, 12, 22); k++) { const a = x.t / 900 + k * 2.4, r = g.bw * 0.12 + ((k * 37) % 30) / 30 * g.bw * 0.32; c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(g.cx + Math.cos(a) * r, cy + Math.sin(a * 1.3) * r * 0.8, 1.6 + (k % 3) * 0.5, 0, 7); c.fill(); } },
      front(c, g, x) { const st = g.stage; if (st === 'Bit') return; const bs = this.bs(st), bw = g.bw * (st === 'Mega' ? 0.96 : 0.86), by0 = g.bot - 4, wood = [150, 100, 65], gold = [228, 186, 80], base = st === 'Mega' ? gold : wood;   // the base
        c.fillStyle = rgb(dk(base, 0.3)); c.beginPath(); c.moveTo(g.cx - bw * 0.42, by0); c.lineTo(g.cx + bw * 0.42, by0); c.lineTo(g.cx + bw / 2, by0 + bs + 4); c.lineTo(g.cx - bw / 2, by0 + bs + 4); c.closePath(); c.fill();
        c.fillStyle = rgb(base); c.beginPath(); c.moveTo(g.cx - bw * 0.42, by0); c.lineTo(g.cx + bw * 0.42, by0); c.lineTo(g.cx + bw / 2, by0 + bs); c.lineTo(g.cx - bw / 2, by0 + bs); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(g.cx - bw * 0.4, by0 + 3, bw * 0.8, 2);
        if (st === 'Mega') { for (const [fx, col] of [[-0.25, '#e05a6a'], [0, '#5ab0e0'], [0.25, '#6ad08a']]) { c.fillStyle = col; c.beginPath(); c.moveTo(g.cx + fx * bw, by0 + bs * 0.3); c.lineTo(g.cx + fx * bw + 5, by0 + bs * 0.55); c.lineTo(g.cx + fx * bw, by0 + bs * 0.8); c.lineTo(g.cx + fx * bw - 5, by0 + bs * 0.55); c.closePath(); c.fill(); }
          const a = x.t / 700; for (let k = 0; k < 14; k++) { const ang = a + k / 14 * Math.PI * 2, s = Math.sin(ang); if (s <= 0) continue; c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(g.cx + Math.cos(ang) * g.bw * 0.72, g.top + g.bh * 0.55 + s * 14, 2.8, 0, 7); c.fill(); }
          c.fillStyle = 'rgba(200,235,255,.95)'; for (let k = -2; k <= 2; k++) { const hx = g.cx + k * 9, h = 18 - Math.abs(k) * 4; c.beginPath(); c.moveTo(hx - 4, g.top + 4); c.lineTo(hx, g.top - h); c.lineTo(hx + 4, g.top + 4); c.closePath(); c.fill(); } }   // an ice crown
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2 - 2, Math.PI * 1.1, Math.PI * 1.4); c.stroke(); },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.26, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.36, ex: 0.15, my: 0.52, s: 0.78 } : { ey: 0.44, ex: 0.17, my: 0.64, s: by(g.stage, 0.72, 0.76, 0.8) })
    },
    /* Ditty: a music box. Bit is a closed box with a gold clasp and a crank turning on its side. Byte opens its lid, and a little dancer spins on top while notes float out.
       Mega is a gramophone: a wooden cabinet with the face, a record spinning on top with the dancer on it, and a big brass horn pouring out notes */
    Ditty: {
      dims: { Bit: [62, 48], Byte: [76, 58], Mega: [84, 66] }, ll: st => by(st, 5, 6, 8),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 10, 46, 80); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.stage === 'Mega' ? 10 : 6); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.6, armK: 0.75,
      notes(c, x0, y0, t, n, spread, col) { for (let k = 0; k < n; k++) { const ph = (t / 1500 + k / n) % 1, px = x0 + Math.sin(ph * 6 + k) * 8 + (k - n / 2) * spread * ph, py = y0 - ph * 46;
          c.fillStyle = rgba(col, 1 - ph); c.beginPath(); c.ellipse(px, py, 3.2, 2.4, -0.4, 0, 7); c.fill(); c.fillRect(px + 2, py - 11, 1.6, 11); if (k % 2) c.fillRect(px + 2, py - 11, 6, 2); } },
      dancer(c, dx, dy, t, sc, col) { const w = Math.cos(t / 260); c.save(); c.translate(dx, dy); c.scale(sc, sc);   // a little dancer spinning on a spindle
        c.strokeStyle = '#c9a24a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -6); c.stroke(); c.save(); c.scale(0.4 + 0.6 * Math.abs(w), 1);
        c.fillStyle = rgb(col); c.beginPath(); c.moveTo(-10, -12); c.quadraticCurveTo(0, -22, 10, -12); c.quadraticCurveTo(0, -8, -10, -12); c.fill();
        c.fillStyle = '#f6e3d3'; c.fillRect(-2, -26, 4, 12); c.beginPath(); c.arc(0, -29, 3.5, 0, 7); c.fill(); c.strokeStyle = '#f6e3d3'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -24); c.quadraticCurveTo(-7, -32, -2, -36); c.moveTo(0, -24); c.quadraticCurveTo(7, -32, 2, -36); c.stroke(); c.restore(); c.restore(); },
      behind(c, g, x) { const st = g.stage, wood = mix(x.body, [150, 95, 60], 0.3);
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.34, lift = Math.max(0, sd * x.walk) * 4; roundBox(c, fx - 6, g.bot - 2, 12, 182 - g.bot + 2 - lift, 3); c.fillStyle = '#c9a24a'; c.fill(); x.feet.push([fx, 182 - lift, 6]); }   // brass feet
        if (st !== 'Mega') { const kx = g.left - 6, ky = g.top + g.bh * 0.5, a = x.t / 350; c.strokeStyle = '#c9a24a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.left + 2, ky); c.lineTo(kx, ky); c.lineTo(kx + Math.cos(a) * 8, ky + Math.sin(a) * 8); c.stroke(); c.fillStyle = '#e9c45a'; c.beginPath(); c.arc(kx + Math.cos(a) * 8, ky + Math.sin(a) * 8, 3, 0, 7); c.fill(); }   // the crank
        if (st === 'Byte') { const lh = g.bh * 0.55; c.fillStyle = rgb(dk(wood, 0.35)); c.beginPath(); c.moveTo(g.left + 2, g.top + 2); c.lineTo(g.left + g.bw - 2, g.top + 2); c.lineTo(g.left + g.bw - 8, g.top - lh); c.lineTo(g.left + 8, g.top - lh); c.closePath(); c.fill();   // the open lid with a mirror
          c.fillStyle = 'rgba(200,225,245,.75)'; c.fillRect(g.left + 16, g.top - lh + 6, g.bw - 32, lh - 12); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(g.left + 20, g.top - lh + 9, 4, lh - 18);
          this.dancer(c, g.cx, g.top + 2, x.t, 1, x.acc); this.notes(c, g.left + g.bw * 0.8, g.top - 6, x.t, 3, 6, dk(x.acc, 0.1)); }
        if (st === 'Mega') { const rx = g.cx - 4, ry = g.top - 2;   // the horn, then the record with the dancer on it
          c.save(); c.translate(g.left + g.bw * 0.78, g.top + 4); c.rotate(-0.55); const br = [214, 168, 70];
          c.fillStyle = rgb(dk(br, 0.2)); c.fillRect(-3, -30, 6, 30); c.fillStyle = rgb(br); c.beginPath(); c.moveTo(-4, -28); c.bezierCurveTo(-8, -50, -40, -62, -44, -80); c.lineTo(44, -80); c.bezierCurveTo(40, -62, 8, -50, 4, -28); c.closePath(); c.fill();
          c.fillStyle = rgb(dk(br, 0.35)); c.beginPath(); c.ellipse(0, -80, 44, 10, 0, 0, 7); c.fill(); c.fillStyle = rgb(dk(br, 0.55)); c.beginPath(); c.ellipse(0, -80, 34, 6.5, 0, 0, 7); c.fill();
          c.strokeStyle = rgba(lt(br, 0.4), 0.7); c.lineWidth = 1.5; for (const k of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(k * 4, -30); c.quadraticCurveTo(k * 20, -60, k * 44, -80); c.stroke(); }
          this.notes(c, 0, -86, x.t, 5, 10, dk(x.acc, 0.1)); c.restore();
          c.fillStyle = '#26232a'; c.beginPath(); c.ellipse(rx, ry, g.bw * 0.36, 7, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; for (const k of [0.8, 0.6, 0.4]) { c.beginPath(); c.ellipse(rx, ry, g.bw * 0.36 * k, 7 * k, 0, 0, 7); c.stroke(); }
          c.fillStyle = rgb(x.acc); c.beginPath(); c.ellipse(rx, ry, 7, 2.5, 0, 0, 7); c.fill(); const ga = x.t / 200; c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(rx + Math.cos(ga) * g.bw * 0.25, ry + Math.sin(ga) * 4.5, 3, 1.2, 0, 0, 7); c.fill();
          this.dancer(c, rx, ry - 2, x.t, 1.25, x.acc); } },
      inside(c, g, x) { const st = g.stage, wood = mix(x.body, [150, 95, 60], 0.3);
        c.fillStyle = rgba(wood, 0.5); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8);
        c.fillStyle = rgb(dk(wood, 0.25)); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, st === 'Bit' ? g.bh * 0.3 : 7);   // the lid band, or the cabinet top
        c.strokeStyle = 'rgba(233,196,90,.9)'; c.lineWidth = 2; c.strokeRect(g.left + 4, g.top + (st === 'Bit' ? g.bh * 0.3 + 3 : 10), g.bw - 8, g.bh - (st === 'Bit' ? g.bh * 0.3 + 7 : 14));
        if (st === 'Bit') { c.fillStyle = '#e9c45a'; roundBox(c, g.cx - 5, g.top + g.bh * 0.3 - 5, 10, 9, 2); c.fill(); }
        if (st === 'Mega') { c.fillStyle = rgba(dk(wood, 0.45), 0.8); for (const fx of [0.12, 0.88]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * 0.62, 6, 0, 7); c.fill(); c.fillStyle = 'rgba(233,196,90,.9)'; c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * 0.62, 2, 0, 7); c.fill(); c.fillStyle = rgba(dk(wood, 0.45), 0.8); } } },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.66, g.left + g.bw * 0.1, g.top + g.bh * 0.3, g.left + g.bw * 0.3, g.top + g.bh * 0.18],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Bit' ? { ey: 0.6, ex: 0.17, my: 0.82, s: 0.66 } : { ey: 0.48, ex: 0.17, my: 0.72, s: by(g.stage, 0.66, 0.74, 0.82) })
    },
    /* Sizzle: breakfast heat. Bit is a slice of toast. Byte is a chrome toaster with two slices popping up and a lever.
       Mega is a cast-iron stove: a fire glowing behind the door window, a chimney pipe, and a kettle on top whistling steam */
    Sizzle: {
      dims: { Bit: [56, 60], Byte: [80, 60], Mega: [88, 78] }, ll: st => by(st, 6, 7, 10),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 8, 34, 56); },
      path(c, g) { if (g.stage === 'Bit') { const r = g.bw * 0.28; c.beginPath(); c.moveTo(g.left + 3, g.bot); c.lineTo(g.left + 3, g.top + r * 1.2); c.arc(g.left + r, g.top + r, r, Math.PI, Math.PI * 1.5); c.lineTo(g.left + g.bw - r, g.top);
          c.arc(g.left + g.bw - r, g.top + r, r, Math.PI * 1.5, 0); c.lineTo(g.left + g.bw - 3, g.top + r * 1.2); c.lineTo(g.left + g.bw - 3, g.bot); c.closePath(); return; }
        roundBox(c, g.left, g.top, g.bw, g.bh, g.stage === 'Byte' ? 18 : 6); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5.5), shoulderY: 0.6, armK: 0.75,
      behind(c, g, x) { const st = g.stage, chrome = [205, 210, 220], iron = [58, 56, 62];
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.3, lift = Math.max(0, sd * x.walk) * 4;
          if (st === 'Bit') { blob(c, fx, 182 - lift, 7, 4.5, dk(x.body, 0.3), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); } else { roundBox(c, fx - 6, g.bot - 2, 12, 182 - g.bot + 2 - lift, 3); c.fillStyle = rgb(st === 'Mega' ? iron : dk(chrome, 0.3)); c.fill(); } x.feet.push([fx, 182 - lift, 7]); }
        if (st === 'Byte') { const pop = Math.max(0, Math.sin(x.t / 700)) * 10; for (const sd of [-1, 1]) { const tx = g.cx + sd * g.bw * 0.2;   // two slices popping up
            roundBox(c, tx - 13, g.top - 20 - pop, 26, 30, 9); c.fillStyle = 'rgb(176,120,70)'; c.fill(); roundBox(c, tx - 10, g.top - 17 - pop, 20, 26, 7); c.fillStyle = 'rgb(232,196,140)'; c.fill(); }
          c.fillStyle = rgb(dk(chrome, 0.35)); c.fillRect(g.left + g.bw - 2, g.top + g.bh * 0.3, 10, 6); c.fillStyle = rgb(x.acc); roundBox(c, g.left + g.bw + 4, g.top + g.bh * 0.24, 8, 16, 3); c.fill(); }
        if (st === 'Mega') { const px = g.left + g.bw - 18;   // the chimney pipe and the kettle
          c.fillStyle = rgb(dk(iron, 0.2)); c.fillRect(px, g.top - 60, 12, 62); c.fillStyle = rgb(iron); c.fillRect(px - 3, g.top - 64, 18, 6);
          for (let k = 0; k < 3; k++) { const ph = (x.t / 1600 + k / 3) % 1; c.fillStyle = `rgba(120,120,128,${0.6 * (1 - ph)})`; c.beginPath(); c.arc(px + 6 + ph * 8, g.top - 70 - ph * 26, 4 + ph * 6, 0, 7); c.fill(); }
          const kx = g.left + g.bw * 0.34, ky = g.top - 2, kc = mix(x.acc, [220, 80, 70], 0.5); c.fillStyle = rgb(dk(kc, 0.3)); c.beginPath(); c.ellipse(kx, ky - 12, 20, 15, 0, Math.PI, 0); c.fill(); c.fillRect(kx - 20, ky - 12, 40, 12);
          c.fillStyle = rgb(kc); c.beginPath(); c.ellipse(kx, ky - 14, 18, 14, 0, Math.PI, 0); c.fill(); c.fillRect(kx - 18, ky - 14, 36, 11); c.strokeStyle = rgb(dk(kc, 0.4)); c.lineWidth = 3; c.beginPath(); c.arc(kx, ky - 26, 9, Math.PI, 0); c.stroke();
          c.strokeStyle = rgb(dk(kc, 0.2)); c.lineWidth = 5; c.beginPath(); c.moveTo(kx - 16, ky - 10); c.lineTo(kx - 28, ky - 22); c.stroke();
          const wh = Math.floor(x.t / 1500) % 2; for (let k = 0; k < 4; k++) { const ph = (x.t / 500 + k / 4) % 1; c.fillStyle = `rgba(255,255,255,${(wh ? 0.85 : 0.4) * (1 - ph)})`; c.beginPath(); c.arc(kx - 30 - ph * 14, ky - 26 - ph * 16, 3 + ph * 5, 0, 7); c.fill(); } } },
      inside(c, g, x) { const st = g.stage;
        if (st === 'Bit') { c.fillStyle = rgba(mix(x.body, [232, 196, 140], 0.6), 0.85); c.fillRect(g.left + 6, g.top + 6, g.bw - 12, g.bh - 8);   // the crumb inside the crust
          c.fillStyle = rgba(dk(x.body, 0.2), 0.4); for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(g.left + 12 + (k * 13) % (g.bw - 24), g.top + 14 + (k * 17) % (g.bh - 22), 1.4, 0, 7); c.fill(); } return; }
        const chrome = st === 'Mega' ? [58, 56, 62] : [205, 210, 220]; c.fillStyle = rgba(chrome, st === 'Mega' ? 0.8 : 0.55); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8);
        if (st === 'Byte') { c.fillStyle = 'rgba(40,40,48,.8)'; for (const sd of [-1, 1]) roundBox(c, g.cx + sd * g.bw * 0.2 - 12, g.top + 2, 24, 5, 2), c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(g.left + 8, g.top + 10, 5, g.bh - 20); }
        if (st === 'Mega') { const dy = g.top + g.bh * 0.66, fl = 0.75 + 0.25 * Math.sin(x.t / 90); roundBox(c, g.cx - 22, dy, 44, g.bh * 0.28, 5); c.fillStyle = rgb([40, 38, 44]); c.fill();   // the fire door
          roundBox(c, g.cx - 17, dy + 4, 34, g.bh * 0.2, 4); c.fillStyle = `rgba(255,${120 + 60 * fl},40,${fl})`; c.fill(); c.strokeStyle = '#d9a440'; c.lineWidth = 2; for (const k of [-8, 0, 8]) { c.beginPath(); c.moveTo(g.cx + k, dy + 4); c.lineTo(g.cx + k, dy + 4 + g.bh * 0.2); c.stroke(); }
          c.fillStyle = '#d9a440'; for (const fx of [0.08, 0.92]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + 8, 2.5, 0, 7); c.fill(); } } },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.6, g.left + g.bw * 0.12, g.top + g.bh * 0.24, g.left + g.bw * 0.3, g.top + g.bh * 0.1],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.3, ex: 0.16, my: 0.5, s: 0.82 } : { ey: 0.46, ex: 0.17, my: 0.68, s: by(g.stage, 0.66, 0.74, 0.8) })
    },
    /* Aero: the wind. Bit is a pinwheel spinning on a stick, the face in its hub. Byte is a diamond kite with a bow tail on a string.
       Mega is a hot-air balloon: a striped envelope with the face, a burner flaring under it, a wicker basket with sandbags, and birds flying past */
    Aero: {
      topUp: { Mega: 14 },
      dims: { Bit: [50, 50], Byte: [60, 70], Mega: [96, 92] }, float: true, slots: { feet: false },
      bottom(st) { return st === 'Bit' ? 142 : st === 'Byte' ? 124 : 112; }, height(st) { return this.dims[st][1] + by(st, 44, 62, 72); },
      path(c, g) { if (g.stage === 'Bit') { c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw * 0.34, 0, 7); return; }
        if (g.stage === 'Byte') { c.beginPath(); c.moveTo(g.cx, g.top); c.lineTo(g.left + g.bw, g.top + g.bh * 0.4); c.lineTo(g.cx, g.bot); c.lineTo(g.left, g.top + g.bh * 0.4); c.closePath(); return; }
        c.beginPath(); c.moveTo(g.cx - g.bw * 0.18, g.bot); c.bezierCurveTo(g.left - 10, g.top + g.bh * 0.7, g.left - 6, g.top - 4, g.cx, g.top - 4); c.bezierCurveTo(g.left + g.bw + 6, g.top - 4, g.left + g.bw + 10, g.top + g.bh * 0.7, g.cx + g.bw * 0.18, g.bot); c.closePath(); },
      behind(c, g, x) { const st = g.stage, sp = x.t / (x.walk ? 90 : 220);
        if (st === 'Bit') { c.strokeStyle = 'rgb(176,130,80)'; c.lineWidth = 4; c.beginPath(); c.moveTo(g.cx, g.top + g.bh / 2); c.lineTo(g.cx, 182); c.stroke(); x.feet.push([g.cx, 182, 5]);   // a stick and spinning vanes
          const cols = [x.acc, lt(x.body, 0.35), x.parts, lt(x.acc, 0.4)]; for (let k = 0; k < 4; k++) { const a = sp + k * Math.PI / 2, R = g.bw * 0.95, cy = g.top + g.bh / 2; c.fillStyle = rgb(cols[k]); c.beginPath(); c.moveTo(g.cx, cy); c.lineTo(g.cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.quadraticCurveTo(g.cx + Math.cos(a + 0.7) * R * 0.9, cy + Math.sin(a + 0.7) * R * 0.9, g.cx + Math.cos(a + Math.PI / 2) * R * 0.3, cy + Math.sin(a + Math.PI / 2) * R * 0.3); c.closePath(); c.fill(); } return; }
        if (st === 'Byte') { const sw = Math.sin(x.t / 300); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(g.cx, g.top + g.bh * 0.45); c.quadraticCurveTo(g.cx - 30, 160, g.cx - 50, 182); c.stroke(); x.feet.push([g.cx - 46, 182, 4]);   // the string, and a tail of bows
          c.strokeStyle = rgb(dk(x.parts, 0.1)); c.lineWidth = 1.6; c.beginPath(); c.moveTo(g.cx, g.bot); for (let k = 1; k <= 5; k++) c.lineTo(g.cx + Math.sin(x.t / 200 + k) * 6 * k / 2, g.bot + k * 11); c.stroke();
          for (let k = 1; k <= 4; k++) { const bx = g.cx + Math.sin(x.t / 200 + k) * 6 * k / 2, byy = g.bot + k * 11; c.fillStyle = rgb(k % 2 ? x.acc : x.parts); for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(bx, byy); c.lineTo(bx + sd * 6, byy - 3 + sw); c.lineTo(bx + sd * 6, byy + 3 + sw); c.closePath(); c.fill(); } }
          c.strokeStyle = rgb(dk(x.parts, 0.3)); c.lineWidth = 2; c.beginPath(); c.moveTo(g.cx, g.top); c.lineTo(g.cx, g.bot); c.moveTo(g.left, g.top + g.bh * 0.4); c.lineTo(g.left + g.bw, g.top + g.bh * 0.4); c.stroke(); return; }
        const bw = 36, bh = 24, bx0 = g.cx - bw / 2, by0 = g.bot + 22, wick = [196, 150, 96];   // ropes, the basket, sandbags and the burner
        c.strokeStyle = 'rgb(120,90,60)'; c.lineWidth = 1.5; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + k * g.bw * 0.18, g.bot - 2); c.lineTo(g.cx + k * bw * 0.45, by0); c.stroke(); }
        const f = 0.7 + 0.3 * Math.sin(x.t / 60); c.fillStyle = `rgba(255,170,60,${f})`; c.beginPath(); c.moveTo(g.cx - 6, g.bot + 8); c.quadraticCurveTo(g.cx, g.bot - 14 * f, g.cx + 6, g.bot + 8); c.fill(); c.fillStyle = '#5a5a62'; c.fillRect(g.cx - 7, g.bot + 7, 14, 6);
        roundBox(c, bx0, by0 + 2, bw, bh, 4); c.fillStyle = rgb(dk(wick, 0.3)); c.fill(); roundBox(c, bx0, by0, bw, bh, 4); c.fillStyle = rgb(wick); c.fill();
        c.strokeStyle = rgba(dk(wick, 0.35), 0.7); c.lineWidth = 1.2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(bx0, by0 + k * bh / 4); c.lineTo(bx0 + bw, by0 + k * bh / 4); c.stroke(); } for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(bx0 + k * bw / 5, by0); c.lineTo(bx0 + k * bw / 5, by0 + bh); c.stroke(); }
        for (const sd of [-1, 1]) { c.fillStyle = 'rgb(200,180,140)'; c.beginPath(); c.ellipse(g.cx + sd * (bw / 2 + 3), by0 + 10, 4.5, 6, 0, 0, 7); c.fill(); }
        x.feet.push([g.cx, by0 + bh, 12]); },
      inside(c, g, x) { const st = g.stage; if (st === 'Bit') return;
        if (st === 'Byte') { c.fillStyle = rgba(lt(x.body, 0.3), 0.6); c.beginPath(); c.moveTo(g.cx, g.top); c.lineTo(g.left + g.bw, g.top + g.bh * 0.4); c.lineTo(g.cx, g.top + g.bh * 0.4); c.closePath(); c.fill(); c.beginPath(); c.moveTo(g.cx, g.bot); c.lineTo(g.left, g.top + g.bh * 0.4); c.lineTo(g.cx, g.top + g.bh * 0.4); c.closePath(); c.fill(); return; }
        const n = 6; for (let k = 0; k < n; k++) { if (k % 2) continue; const a0 = -g.bw / 2 + k * g.bw / n, a1 = a0 + g.bw / n; c.fillStyle = rgba(k % 4 ? x.acc : lt(x.body, 0.4), 0.8);   // stripes down the envelope
          c.beginPath(); c.moveTo(g.cx, g.top - 4); c.quadraticCurveTo(g.cx + a0 * 1.25, g.top + g.bh * 0.4, g.cx + a0 * 0.36, g.bot); c.lineTo(g.cx + a1 * 0.36, g.bot); c.quadraticCurveTo(g.cx + a1 * 1.25, g.top + g.bh * 0.4, g.cx, g.top - 4); c.closePath(); c.fill(); } },
      front(c, g, x) { if (g.stage !== 'Mega') return; for (let k = 0; k < 2; k++) { const ph = (x.t / 4000 + k * 0.5) % 1, bx = g.cx + g.bw * (1.2 - ph * 2.4), byy = g.top + 10 + k * 22 + Math.sin(ph * 12) * 3, w = Math.sin(x.t / 80 + k) * 3;   // birds flying past
          c.strokeStyle = 'rgba(60,60,70,.8)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(bx - 6, byy - w); c.quadraticCurveTo(bx - 3, byy - 3, bx, byy); c.quadraticCurveTo(bx + 3, byy - 3, bx + 6, byy - w); c.stroke(); } },
      hl: g => [g.left + g.bw * 0.2, g.top + g.bh * 0.5, g.left + g.bw * 0.22, g.top + g.bh * 0.24, g.left + g.bw * 0.4, g.top + g.bh * 0.1],
      head: g => [g.cx, g.top + 2, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Bit' ? { ey: 0.44, ex: 0.12, my: 0.62, s: 0.5 } : g.stage === 'Byte' ? { ey: 0.42, ex: 0.14, my: 0.6, s: 0.62 } : { ey: 0.44, ex: 0.16, my: 0.64, s: 0.84 })
    },
    /* Nesta: a nesting doll. Bit is the smallest doll, plain and round with a scarf. Byte is a full doll with a painted apron of flowers and a headscarf.
       Mega opens up: its top half floats over its head, gold patterns run round it, and its four smaller sisters stand in a row beside it */
    Nesta: {
      dims: { Bit: [44, 54], Byte: [62, 82], Mega: [70, 92] }, ll: st => by(st, 3, 3, 3),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 4, 6, 50); },
      path(c, g) { const T = g.top, B = g.bot, w = g.bw, nk = g.top + g.bh * 0.42;   // a doll: round head and a wider round body
        c.beginPath(); c.moveTo(g.cx, T); c.bezierCurveTo(g.cx + w * 0.42, T, g.cx + w * 0.4, nk - 4, g.cx + w * 0.36, nk); c.bezierCurveTo(g.cx + w * 0.56, nk + 10, g.cx + w * 0.52, B, g.cx + w * 0.3, B);
        c.lineTo(g.cx - w * 0.3, B); c.bezierCurveTo(g.cx - w * 0.52, B, g.cx - w * 0.56, nk + 10, g.cx - w * 0.36, nk); c.bezierCurveTo(g.cx - w * 0.4, nk - 4, g.cx - w * 0.42, T, g.cx, T); c.closePath(); },
      arms: 'stub', armW: st => 0, handR: st => 0, shoulderY: 0.6, armK: 0.7, slots: { feet: false },
      mini(c, px, base, h, col, acc, t, k) { const w = h * 0.7, nk = base - h * 0.58; c.fillStyle = rgb(dk(col, 0.3)); c.beginPath(); c.ellipse(px, base - h * 0.28 + 1, w * 0.5, h * 0.3, 0, 0, 7); c.fill();
        c.fillStyle = rgb(col); c.beginPath(); c.ellipse(px, base - h * 0.3, w * 0.5, h * 0.3, 0, 0, 7); c.fill(); c.beginPath(); c.arc(px, nk - h * 0.12, w * 0.38, 0, 7); c.fill();
        c.fillStyle = '#f6e3d3'; c.beginPath(); c.arc(px, nk - h * 0.1, w * 0.24, 0, 7); c.fill(); c.fillStyle = '#2a2230'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(px + sd * w * 0.09, nk - h * 0.12 - (Math.floor(t / 1800 + k) % 7 === 0 ? 0 : 0), 1.1, 0, 7); c.fill(); }
        c.fillStyle = rgb(acc); c.beginPath(); c.arc(px, base - h * 0.3, w * 0.16, 0, 7); c.fill(); },
      behind(c, g, x) { x.feet.push([g.cx, 182, g.bw * 0.3]); if (g.stage !== 'Mega') return;
        const lift = 30 + Math.sin(x.t / 600) * 4, w = g.bw, T = g.top - lift, nk = g.top + g.bh * 0.42 - lift;   // the top half floating over its head
        c.fillStyle = rgb(dk(x.body, 0.25)); c.beginPath(); c.moveTo(g.cx - w * 0.44, nk + 2); c.bezierCurveTo(g.cx - w * 0.44, T, g.cx + w * 0.44, T, g.cx + w * 0.44, nk + 2); c.closePath(); c.fill();
        c.fillStyle = rgb(x.body); c.beginPath(); c.moveTo(g.cx - w * 0.44, nk - 2); c.bezierCurveTo(g.cx - w * 0.44, T - 4, g.cx + w * 0.44, T - 4, g.cx + w * 0.44, nk - 2); c.closePath(); c.fill();
        c.strokeStyle = '#e9b23a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(g.cx - w * 0.42, nk - 4); c.lineTo(g.cx + w * 0.42, nk - 4); c.stroke(); for (let k = -2; k <= 2; k++) { c.fillStyle = '#e9b23a'; c.beginPath(); c.arc(g.cx + k * 10, nk - 14 - Math.abs(k) * -2, 2.4, 0, 7); c.fill(); }
        c.strokeStyle = 'rgba(255,230,150,.6)'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { const ph = (x.t / 900 + k / 4) % 1; c.beginPath(); c.moveTo(g.cx + (k - 1.5) * 14, nk + 4 + ph * 18); c.lineTo(g.cx + (k - 1.5) * 14, nk + 8 + ph * 18); c.stroke(); }
        const cols = [lt(x.body, 0.2), x.acc, lt(x.parts, 0.1), lt(x.acc, 0.3)];   // the four smaller sisters
        [[-1, 0.62], [-1, 0.42], [1, 0.5], [1, 0.32]].forEach(([sd, s], k) => { const px = g.cx + sd * (g.bw * 0.62 + k % 2 * 18), hop = Math.max(0, Math.sin(x.t / 260 + k)) * (x.walk ? 4 : 1.2); this.mini(c, px, 182 - hop, g.bh * s, cols[k], x.acc, x.t, k); }); },
      inside(c, g, x) { const st = g.stage, nk = g.top + g.bh * 0.42, fc = [246, 227, 211];
        c.fillStyle = rgb(fc); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.25, g.bw * (st === 'Bit' ? 0.26 : 0.27), g.bh * 0.17, 0, 0, 7); c.fill();   // the painted face oval, then a scarf round it
        c.strokeStyle = rgb(st === 'Bit' ? dk(x.body, 0.2) : x.acc); c.lineWidth = by(st, 4, 5, 6); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.25, g.bw * 0.29, g.bh * 0.19, 0, 0, 7); c.stroke();
        if (st === 'Bit') return;
        c.fillStyle = rgba(lt(x.body, 0.55), 0.95); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.72, g.bw * 0.3, g.bh * 0.22, 0, 0, 7); c.fill();   // the apron with flowers
        const fl = [[0, 0.68, x.acc], [-0.13, 0.78, x.parts], [0.13, 0.78, x.parts]].concat(st === 'Mega' ? [[-0.2, 0.62, lt(x.acc, 0.3)], [0.2, 0.62, lt(x.acc, 0.3)]] : []);
        for (const [fx, fy, col] of fl) { const px = g.cx + fx * g.bw, py = g.top + fy * g.bh; c.fillStyle = rgb(col); for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; c.beginPath(); c.arc(px + Math.cos(a) * 3.6, py + Math.sin(a) * 3.6, 2.8, 0, 7); c.fill(); } c.fillStyle = '#ffe27a'; c.beginPath(); c.arc(px, py, 2, 0, 7); c.fill(); }
        c.fillStyle = 'rgb(110,170,80)'; for (const fx of [-0.07, 0.07]) { c.beginPath(); c.ellipse(g.cx + fx * g.bw, g.top + g.bh * 0.86, 4, 2, fx * 9, 0, 7); c.fill(); }
        if (st === 'Mega') { c.strokeStyle = '#e9b23a'; c.lineWidth = 2; c.beginPath(); c.moveTo(g.left, nk + 2); c.lineTo(g.left + g.bw, nk + 2); c.stroke(); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.72, g.bw * 0.32, g.bh * 0.24, 0, 0, 7); c.stroke(); } },
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.7, g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.3, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.24, ex: 0.11, my: 0.33, s: by(g.stage, 0.5, 0.62, 0.68), lidCol: [246, 227, 211] })
    },
    /* Magna: magnetism. Bit is a bar magnet with a red end and a blue end. Byte is a horseshoe magnet with red and silver tips and a few bolts stuck to them.
       Mega is an electromagnet tower: a copper-wound core on an iron stand, field lines arcing round it, sparks, and scrap metal orbiting it */
    Magna: {
      dims: { Bit: [64, 40], Byte: [72, 74], Mega: [74, 90] }, ll: st => by(st, 5, 6, 12),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 6, 14, 30); },
      path(c, g) { if (g.stage === 'Bit') { roundBox(c, g.left, g.top, g.bw, g.bh, 8); return; }
        if (g.stage === 'Byte') { const t = g.bw * 0.3, R = g.bw / 2; c.beginPath(); c.moveTo(g.left, g.bot); c.lineTo(g.left, g.top + R); c.arc(g.cx, g.top + R, R, Math.PI, 0); c.lineTo(g.left + g.bw, g.bot); c.lineTo(g.left + g.bw - t, g.bot);
          c.lineTo(g.left + g.bw - t, g.top + R); c.arc(g.cx, g.top + R, R - t, 0, Math.PI, true); c.lineTo(g.left + t, g.bot); c.closePath(); return; }
        roundBox(c, g.left + g.bw * 0.12, g.top, g.bw * 0.76, g.bh, 14); },
      arms: 'stub', armW: st => by(st, 0, 0, 0), handR: st => 0, shoulderY: 0.6, armK: 0.7,
      behind(c, g, x) { const st = g.stage, iron = [70, 72, 80];
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * (st === 'Byte' ? 0.36 : 0.26), lift = Math.max(0, sd * x.walk) * 4;
          if (st === 'Mega') { roundBox(c, g.cx - g.bw * 0.5, 170, g.bw, 12, 4); c.fillStyle = rgb(iron); c.fill(); if (sd > 0) x.feet.push([g.cx, 182, g.bw * 0.4]); continue; }
          blob(c, fx, 182 - lift, 7, 4.5, dk(x.parts, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); }
        if (st === 'Mega') { const gl = 0.5 + 0.5 * Math.sin(x.t / 200);   // field lines and sparks
          c.strokeStyle = rgba(lt(x.acc, 0.3), 0.35 + 0.25 * gl); c.lineWidth = 2; c.setLineDash([6, 5]); c.lineDashOffset = -x.t / 30;
          for (const k of [0.9, 1.25, 1.6]) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.5, g.bw * 0.4 * k, g.bh * 0.62 * k, 0, 0, 7); c.stroke(); } c.setLineDash([]); } },
      inside(c, g, x) { const st = g.stage, red = [214, 70, 66], sil = [205, 210, 220];
        if (st === 'Bit') { c.fillStyle = rgba(red, 0.75); c.fillRect(g.left - 2, g.top - 2, g.bw * 0.3, g.bh + 4); c.fillStyle = rgba([70, 120, 210], 0.75); c.fillRect(g.left + g.bw * 0.7, g.top - 2, g.bw * 0.32, g.bh + 4);
          c.fillStyle = '#fff'; c.font = '700 11px system-ui'; c.textAlign = 'center'; c.fillText('N', g.left + g.bw * 0.14, g.top + g.bh * 0.62); c.fillText('S', g.left + g.bw * 0.86, g.top + g.bh * 0.62); return; }
        if (st === 'Byte') { c.fillStyle = rgba(red, 0.8); c.fillRect(g.left - 2, g.top + g.bh * 0.58, g.bw + 4, g.bh * 0.42 + 4); c.fillStyle = rgb(sil); c.fillRect(g.left - 2, g.bot - g.bh * 0.16, g.bw + 4, g.bh * 0.2); return; }
        const cu = [196, 120, 70]; c.fillStyle = rgba(iron = [86, 88, 98], 0.0);   // copper winding round the core
        for (let k = 0; k < 12; k++) { const yy = g.top + g.bh * (0.12 + k * 0.064); c.fillStyle = rgb(k % 2 ? cu : lt(cu, 0.15)); c.fillRect(g.left + g.bw * 0.1, yy, g.bw * 0.8, g.bh * 0.06); }
        c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(g.left + g.bw * 0.18, g.top + g.bh * 0.12, 4, g.bh * 0.76);
        c.fillStyle = rgb(red); roundBox(c, g.left + g.bw * 0.08, g.top - 4, g.bw * 0.84, 10, 4); c.fill(); var iron; },
      front(c, g, x) { const st = g.stage, bolt = (px, py, a) => { c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = '#9aa0ab'; c.fillRect(-1.5, -7, 3, 12); c.fillStyle = '#c8cdd6'; c.fillRect(-4, -9, 8, 3); c.restore(); };
        if (st === 'Byte') { bolt(g.left + 8, g.bot + 6, 0.4); bolt(g.left + g.bw - 6, g.bot + 7, -0.5); bolt(g.left + g.bw - 14, g.bot + 9, 0.2); return; }   // bolts stuck to the tips
        if (st !== 'Mega') return; for (let k = 0; k < 5; k++) { const a = x.t / 900 + k * 1.26, px = g.cx + Math.cos(a) * g.bw * 0.82, py = g.top + g.bh * 0.5 + Math.sin(a) * g.bh * 0.3;   // scrap orbiting it
          if (k % 2) bolt(px, py, a * 2); else { c.fillStyle = '#8a8f99'; c.save(); c.translate(px, py); c.rotate(a); for (let q = 0; q < 6; q++) { c.save(); c.rotate(q * Math.PI / 3); c.fillRect(-1.5, -6, 3, 3); c.restore(); } c.beginPath(); c.arc(0, 0, 4.5, 0, 7); c.fill(); c.fillStyle = '#4a4e57'; c.beginPath(); c.arc(0, 0, 1.6, 0, 7); c.fill(); c.restore(); } }
        if (Math.floor(x.t / 120) % 6 === 0) { c.strokeStyle = rgba(lt(x.acc, 0.5), 0.9); c.lineWidth = 2; for (const sd of [-1, 1]) { let px = g.cx + sd * g.bw * 0.42, py = g.top + 6; c.beginPath(); c.moveTo(px, py); for (let k = 0; k < 3; k++) { px += sd * 6; py -= 6 + (k % 2) * 3; c.lineTo(px, py); } c.stroke(); } } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.6, g.left + g.bw * 0.14, g.top + g.bh * 0.24, g.left + g.bw * 0.34, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Bit' ? { ey: 0.42, ex: 0.12, my: 0.74, s: 0.6 } : g.stage === 'Byte' ? { ey: 0.2, ex: 0.12, my: 0.32, s: 0.56 } : { ey: 0.34, ex: 0.14, my: 0.56, s: 0.74 })
    },
    /* Helm: deep-sea diving. Bit is a small brass helmet with one porthole. Byte is a full diving helmet with three portholes, bolts, an air hose and lead boots.
       Mega is a submarine: a brass hull with the face in its big front porthole, a conning tower with a periscope, a propeller spinning, a headlamp beam and bubbles */
    Helm: {
      dims: { Bit: [56, 54], Byte: [72, 70], Mega: [112, 66] }, ll: st => by(st, 5, 10, 18),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 6, 12, 40); },
      path(c, g) { if (g.stage === 'Mega') { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); return; } roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * 0.42); },
      arms: 'stub', armW: st => by(st, 0, 6, 0), handR: st => by(st, 0, 6, 0), shoulderY: 0.7, armK: 0.7,
      behind(c, g, x) { const st = g.stage, brass = mix(x.body, [214, 168, 70], 0.55);
        if (st === 'Mega') { const tx = g.cx - 6, ty = g.top + 4;   // the conning tower and periscope, the propeller, the stand
          roundBox(c, tx - 16, ty - 22, 32, 28, 8); c.fillStyle = rgb(dk(brass, 0.2)); c.fill(); c.fillStyle = rgb(dk(brass, 0.4)); c.fillRect(tx + 6, ty - 44, 5, 24); c.fillRect(tx + 6, ty - 46, 14, 6);
          c.fillStyle = 'rgba(200,230,255,.8)'; c.fillRect(tx + 16, ty - 45, 4, 4);
          const pa = x.t / (x.walk ? 40 : 120); c.save(); c.translate(g.left - 6, g.top + g.bh / 2); c.fillStyle = rgb(dk(brass, 0.3)); c.fillRect(0, -3, 10, 6); for (let k = 0; k < 3; k++) { const a = pa + k * 2.09; c.fillStyle = rgb(brass); c.beginPath(); c.ellipse(-2, Math.sin(a) * 9, 4, Math.abs(Math.cos(a)) * 9 + 1.5, 0, 0, 7); c.fill(); } c.restore();
          for (const sd of [-1, 1]) { const sx = g.cx + sd * g.bw * 0.28; c.fillStyle = rgb(dk(brass, 0.35)); c.fillRect(sx - 4, g.bot - 4, 8, 182 - g.bot + 2); roundBox(c, sx - 12, 176, 24, 7, 3); c.fill(); }
          x.feet.push([g.cx, 182, g.bw * 0.35]); return; }
        if (st === 'Byte') { c.strokeStyle = 'rgb(70,70,78)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.left + g.bw - 6, g.top + 14); c.bezierCurveTo(g.left + g.bw + 24, g.top, g.left + g.bw + 30, g.top + 40, g.left + g.bw + 16, g.bot + 10); c.stroke(); }   // the air hose
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4;
          if (st === 'Byte') { c.fillStyle = 'rgb(110,105,96)'; c.fillRect(fx - 6, g.bot - 2, 12, 182 - g.bot - 6 - lift); roundBox(c, fx - 10, 174 - lift, 20, 9, 3); c.fillStyle = 'rgb(60,62,70)'; c.fill(); }   // lead boots
          else blob(c, fx, 182 - lift, 7, 4.5, dk(brass, 0.3), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); } },
      inside(c, g, x) { const st = g.stage, brass = mix(x.body, [214, 168, 70], 0.55);
        c.fillStyle = rgba(brass, 0.7); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8);
        const port = st === 'Mega' ? [g.cx + g.bw * 0.12, g.top + g.bh * 0.5, g.bh * 0.38] : [g.cx, g.top + g.bh * 0.46, g.bw * (st === 'Bit' ? 0.34 : 0.3)];   // the porthole the face looks out of
        c.fillStyle = rgb(dk(brass, 0.3)); c.beginPath(); c.arc(port[0], port[1], port[2] + 6, 0, 7); c.fill(); c.fillStyle = rgba(mix(x.body, [170, 210, 235], 0.6), 0.95); c.beginPath(); c.arc(port[0], port[1], port[2], 0, 7); c.fill();
        c.fillStyle = rgb(dk(brass, 0.45)); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; c.beginPath(); c.arc(port[0] + Math.cos(a) * (port[2] + 3), port[1] + Math.sin(a) * (port[2] + 3), 1.6, 0, 7); c.fill(); }
        if (st === 'Byte') for (const sd of [-1, 1]) { c.fillStyle = rgb(dk(brass, 0.3)); c.beginPath(); c.arc(g.cx + sd * g.bw * 0.42, g.top + g.bh * 0.42, 8, 0, 7); c.fill(); c.fillStyle = 'rgba(170,210,235,.9)'; c.beginPath(); c.arc(g.cx + sd * g.bw * 0.42, g.top + g.bh * 0.42, 5, 0, 7); c.fill(); }
        if (st !== 'Bit') { c.fillStyle = rgb(dk(brass, 0.3)); c.fillRect(g.left - 4, g.bot - g.bh * 0.14, g.bw + 8, 5); }   // the collar or the hull seam
        if (st === 'Mega') { c.fillStyle = 'rgba(255,255,255,.18)'; for (const k of [0.25, 0.42]) c.fillRect(g.left + g.bw * k, g.top + 6, 3, g.bh - 12); } },
      front(c, g, x) { const st = g.stage;
        if (st === 'Mega') { const lx = g.left + g.bw - 4, ly = g.top + g.bh * 0.5, gl = c.createLinearGradient(lx, ly, lx + 70, ly); gl.addColorStop(0, 'rgba(255,250,200,.55)'); gl.addColorStop(1, 'rgba(255,250,200,0)');   // a headlamp beam
          c.fillStyle = gl; c.beginPath(); c.moveTo(lx, ly - 4); c.lineTo(lx + 70, ly - 24); c.lineTo(lx + 70, ly + 24); c.lineTo(lx, ly + 4); c.closePath(); c.fill(); c.fillStyle = '#fff6c4'; c.beginPath(); c.arc(lx, ly, 4.5, 0, 7); c.fill(); }
        for (let k = 0; k < by(st, 2, 3, 6); k++) { const ph = (x.t / 1300 + k / by(st, 2, 3, 6)) % 1, px = g.cx + (st === 'Mega' ? -g.bw * 0.2 : 0) + Math.sin(ph * 8 + k) * 6 + (k - 1) * 5, py = g.top - 4 - ph * 34;   // bubbles
          c.strokeStyle = `rgba(200,235,255,${0.85 * (1 - ph)})`; c.lineWidth = 1.4; c.beginPath(); c.arc(px, py, 2 + (k % 3), 0, 7); c.stroke(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.6, g.left + g.bw * 0.14, g.top + g.bh * 0.24, g.left + g.bw * 0.34, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => g.stage === 'Mega' ? faceTwo(c, { ...g, cx: g.cx + g.bw * 0.12 }, x, look, { ey: 0.44, ex: 0.07, my: 0.62, s: 0.6 }) : faceTwo(c, g, x, look, { ey: 0.42, ex: 0.12, my: 0.6, s: by(g.stage, 0.58, 0.6, 0.6) })
    },
    /* ---- batch 4, drawn 16 Nov 2026 for Gid's look-over (not wired yet) ---- */
    /* Bloop: a jellyfish. Bit is a small frilly bell with stubby tentacles. Byte is a clear glowing bell with long wavy tentacles and frilled arms.
       Mega is a jellyfish queen: a crown of coral set with pearls, a glowing hem and spots, a curtain of long glowing tentacles and three baby jellies drifting round it */
    Bloop: {
      topUp: { Mega: 34 },
      dims: { Bit: [60, 40], Byte: [76, 52], Mega: [86, 58] }, float: true, glass: true, patternAfter: true, slots: { feet: false },
      bottom(st) { return st === 'Bit' ? 146 : st === 'Byte' ? 120 : 104; }, height(st) { return this.dims[st][1] + by(st, 40, 66, 96); },
      path(c, g, x) { const t = x ? x.t : 0, n = by(g.stage, 5, 7, 9), br = Math.sin(t / 500) * 0.04, w = g.bw * (1 + br), L = g.cx - w / 2;
        c.beginPath(); c.moveTo(L, g.bot); c.bezierCurveTo(L, g.top - g.bh * 0.3, L + w, g.top - g.bh * 0.3, L + w, g.bot);
        for (let i = 0; i < n; i++) c.quadraticCurveTo(L + w - (i + 0.5) * w / n, g.bot + 7, L + w - (i + 1) * w / n, g.bot); c.closePath(); },
      behind(c, g, x) { const st = g.stage, n = by(st, 3, 5, 9), len = by(st, 16, 48, 78), gl = 0.6 + 0.4 * Math.sin(x.t / 400);
        for (let i = 0; i < n; i++) { const tx = g.left + g.bw * (0.15 + 0.7 * i / (n - 1)), col = st === 'Mega' ? `rgba(${i % 2 ? '200,170,255' : '150,220,255'},${0.5 + 0.4 * gl})` : rgba(lt(x.body, 0.2), 0.8);
          c.strokeStyle = col; c.lineWidth = st === 'Bit' ? 4 : 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx, g.bot); for (let k = 1; k <= 6; k++) c.lineTo(tx + Math.sin(x.t / 300 + i + k * 0.9) * (st === 'Bit' ? 1.5 : 4) * k / 3, g.bot + k * len / 6); c.stroke(); }
        if (st !== 'Bit') for (const sd of [-1, 1]) { c.strokeStyle = rgba(lt(x.acc, 0.3), 0.75); c.lineWidth = 6; c.beginPath(); c.moveTo(g.cx + sd * 6, g.bot); for (let k = 1; k <= 5; k++) c.lineTo(g.cx + sd * 6 + Math.sin(x.t / 350 + k + sd) * 5, g.bot + k * len * 0.12); c.stroke(); }   // frilled arms
x.feet.push([g.cx, 182, 10]); },
      inside(c, g, x) { const st = g.stage, gl = 0.6 + 0.4 * Math.sin(x.t / 400);
        if (st === 'Bit') { c.fillStyle = rgba(lt(x.body, 0.3), 0.5); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.3, g.bw * 0.3, g.bh * 0.2, 0, 0, 7); c.fill(); return; }
        for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + 0.78; c.fillStyle = rgba(lt(x.acc, 0.3), 0.35 + 0.35 * gl); c.beginPath(); c.ellipse(g.cx + Math.cos(a) * g.bw * 0.12, g.top + g.bh * 0.62 + Math.sin(a) * g.bh * 0.12, g.bw * 0.07, g.bw * 0.05, a, 0, 7); c.fill(); }   // the glowing rings inside
        if (st === 'Mega') for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI, px = g.cx + Math.cos(a) * g.bw * 0.4, py = g.bot - 6 - Math.sin(a) * g.bh * 0.5; c.fillStyle = `rgba(200,255,255,${0.4 + 0.5 * Math.sin(x.t / 200 + k)})`; c.beginPath(); c.arc(px, py, 2, 0, 7); c.fill(); } },
      front(c, g, x) { if (g.stage !== 'Mega') return; const gl = 0.6 + 0.4 * Math.sin(x.t / 400);
        c.strokeStyle = `rgba(200,255,255,${0.4 + 0.4 * gl})`; c.lineWidth = 3; c.beginPath(); c.moveTo(g.left + 2, g.bot - 2); for (let i = 0; i <= 9; i++) c.lineTo(g.left + 2 + i * (g.bw - 4) / 9, g.bot + (i % 2 ? 4 : -1)); c.stroke();   // a glowing hem
        const cy = g.top - 4, coral = mix(x.acc, [255, 120, 140], 0.5);   // a crown of coral branches set with pearls
        for (const [dx, h, a] of [[-18, 14, -0.5], [-8, 20, -0.15], [4, 24, 0.1], [16, 16, 0.45]]) { c.save(); c.translate(g.cx + dx, cy + 6); c.rotate(a); c.strokeStyle = rgb(dk(coral, 0.15)); c.lineWidth = 4; c.lineCap = 'round';
          c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h); c.moveTo(0, -h * 0.5); c.lineTo(-5, -h * 0.75); c.moveTo(0, -h * 0.6); c.lineTo(5, -h * 0.85); c.stroke(); c.restore(); }
        for (let k = -2; k <= 2; k++) { c.fillStyle = '#f6f2ea'; c.beginPath(); c.arc(g.cx + k * 9, cy + 6 + Math.abs(k) * 1.5, 3.4, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(g.cx + k * 9 - 1, cy + 5 + Math.abs(k) * 1.5, 1.1, 0, 7); c.fill(); }
        for (let k = 0; k < 3; k++) { const a = x.t / 1800 + k * 2.1, px = g.cx + Math.cos(a) * g.bw * 1.05, py = g.bot + 22 + Math.sin(a) * 14 + Math.sin(x.t / 300 + k) * 3, s = Math.sin(a) > 0 ? 1 : 0.8;   // three baby jellies drifting round it
          c.fillStyle = `rgba(${['200,170,255', '150,220,255', '255,180,220'][k]},.85)`; c.beginPath(); c.moveTo(px - 8 * s, py); c.bezierCurveTo(px - 8 * s, py - 12 * s, px + 8 * s, py - 12 * s, px + 8 * s, py); c.closePath(); c.fill();
          c.strokeStyle = c.fillStyle; c.lineWidth = 1.5; for (const d of [-4, 0, 4]) { c.beginPath(); c.moveTo(px + d * s, py); c.lineTo(px + d * s + Math.sin(x.t / 200 + d) * 2, py + 10 * s); c.stroke(); }
          c.fillStyle = '#2a2230'; for (const d of [-2.5, 2.5]) { c.beginPath(); c.arc(px + d * s, py - 4 * s, 1, 0, 7); c.fill(); } } },
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.6, g.left + g.bw * 0.2, g.top + g.bh * 0.2, g.left + g.bw * 0.4, g.top + g.bh * 0.02],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.16, my: 0.66, s: by(g.stage, 0.66, 0.74, 0.8) })
    },
    /* Sox: a sock. Bit is a striped sock standing on its toe end with a heel bump. Byte is a sock puppet: yarn hair, a stitched mouth line and a ribbed cuff.
       Mega is a sock dragon: felt spikes down its back, wings made of odd socks, a long striped sock tail, and a darning needle for a horn */
    Sox: {
      dims: { Bit: [44, 68], Byte: [56, 82], Mega: [64, 90] }, ll: st => by(st, 4, 4, 4), slots: { feet: false },
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 6, 18, 30); },
      path(c, g) { const r = g.bw / 2; c.beginPath(); c.moveTo(g.left, g.bot); c.lineTo(g.left, g.top + r); c.arc(g.cx, g.top + r, r, Math.PI, 0); c.lineTo(g.left + g.bw, g.bot - 10);
        c.quadraticCurveTo(g.left + g.bw + (g.stage === 'Bit' ? 12 : 4), g.bot - 4, g.left + g.bw - 4, g.bot); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.56, armK: 0.75,
      behind(c, g, x) { const st = g.stage;
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(x.body, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); }
        if (st === 'Mega') { const sw = Math.sin(x.t / 400);   // odd-sock wings, a striped tail and felt spikes
          for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.4, g.top + g.bh * 0.32); c.rotate(sd * (-0.5 + sw * 0.15)); const wc = sd < 0 ? x.acc : x.parts;
            c.fillStyle = rgb(dk(wc, 0.2)); roundBox(c, sd < 0 ? -50 : 0, -12, 50, 24, 12); c.fill(); c.fillStyle = rgb(wc); roundBox(c, sd < 0 ? -48 : 2, -12, 46, 20, 10); c.fill();
            c.fillStyle = rgb(lt(wc, 0.4)); for (let k = 0; k < 3; k++) c.fillRect(sd < 0 ? -42 + k * 14 : 8 + k * 14, -12, 6, 20); c.restore(); }
          c.strokeStyle = rgb(x.body); c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.left + 6, g.bot - 6); c.bezierCurveTo(g.left - 30, g.bot, g.left - 40, g.bot - 30, g.left - 26 + sw * 4, g.bot - 46); c.stroke();
          c.strokeStyle = rgb(lt(x.acc, 0.3)); c.lineWidth = 12; c.setLineDash([5, 7]); c.stroke(); c.setLineDash([]);
          c.fillStyle = rgb(x.acc); for (let k = 0; k < 4; k++) { const a = Math.PI * (1.15 + k * 0.22), px = g.cx + Math.cos(a) * g.bw * 0.52, py = g.top + g.bw / 2 + Math.sin(a) * g.bw * 0.52; c.beginPath(); c.moveTo(px - 5, py + 3); c.lineTo(px + Math.cos(a) * 12, py + Math.sin(a) * 12); c.lineTo(px + 5, py + 3); c.closePath(); c.fill(); } } },
      inside(c, g, x) { const st = g.stage; c.fillStyle = rgba(lt(x.acc, 0.35), 0.75); for (let k = 0; k < by(st, 3, 2, 2); k++) c.fillRect(g.left - 4, g.top + g.bh * (0.36 + k * 0.18), g.bw + 16, g.bh * 0.07);   // stripes
        c.fillStyle = rgba(dk(x.body, 0.15), 0.8); c.beginPath(); c.ellipse(g.cx, g.top + g.bw * 0.25, g.bw * 0.3, g.bw * 0.2, 0, Math.PI, 0); c.fill();   // the darker toe
        if (st !== 'Bit') { c.fillStyle = rgb(dk(x.body, 0.25)); c.fillRect(g.left - 2, g.bot - 12, g.bw + 6, 12); c.strokeStyle = rgba(lt(x.body, 0.2), 0.7); c.lineWidth = 1.5; for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(g.left + 2 + k * g.bw / 7, g.bot - 12); c.lineTo(g.left + 2 + k * g.bw / 7, g.bot); c.stroke(); } } },
      front(c, g, x) { const st = g.stage; if (st === 'Bit') return;
        c.strokeStyle = rgb(lt(x.parts, 0.2)); c.lineWidth = 3; c.lineCap = 'round'; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(g.cx + k * 4, g.top + 2); c.quadraticCurveTo(g.cx + k * 8, g.top - 12, g.cx + k * 10 + Math.sin(x.t / 300 + k) * 2, g.top - 8); c.stroke(); }   // yarn hair
        if (st === 'Mega') { c.save(); c.translate(g.cx + 6, g.top + 2); c.rotate(0.3); c.fillStyle = '#c9ced8'; c.beginPath(); c.moveTo(-2, 0); c.lineTo(0, -26); c.lineTo(2, 0); c.closePath(); c.fill(); c.strokeStyle = '#8a8f99'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, -20, 1, 3, 0, 0, 7); c.stroke(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.16, g.top + g.bh * 0.2, g.left + g.bw * 0.36, g.top + g.bh * 0.04],
      head: g => [g.cx, g.top + 2, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.24, ex: 0.18, my: 0.36, s: by(g.stage, 0.6, 0.7, 0.76) })
    },
    /* Cuppy: a cupcake. Bit is a plain muffin in a pleated paper cup. Byte is a cupcake with a tall swirl of frosting, sprinkles and a cherry.
       Mega is a three-tier cake: frosting dripping off each tier, strawberries round the middle, and candles burning on top */
    Cuppy: {
      topUp: { Mega: 24 },
      dims: { Bit: [58, 56], Byte: [64, 62], Mega: [92, 96] }, ll: st => by(st, 4, 4, 6),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 10, 44, 34); },
      path(c, g) { if (g.stage === 'Mega') { const W = [0.6, 0.8, 1].map(w => g.bw * w / 2), Y = [g.top, g.top + g.bh * 0.3, g.top + g.bh * 0.62, g.bot], P = [];   // three tiers as one stepped outline
          P.push([g.cx - W[2], Y[3]], [g.cx - W[2], Y[2]], [g.cx - W[1], Y[2]], [g.cx - W[1], Y[1]], [g.cx - W[0], Y[1]], [g.cx - W[0], Y[0]], [g.cx + W[0], Y[0]], [g.cx + W[0], Y[1]], [g.cx + W[1], Y[1]], [g.cx + W[1], Y[2]], [g.cx + W[2], Y[2]], [g.cx + W[2], Y[3]]);
          c.beginPath(); c.moveTo((P[0][0] + P[11][0]) / 2, Y[3]); for (let i = 0; i < P.length; i++) c.arcTo(P[i][0], P[i][1], P[(i + 1) % P.length][0], P[(i + 1) % P.length][1], 5); c.closePath(); return; }
        const cup = g.top + g.bh * 0.42; c.beginPath(); c.moveTo(g.left + 6, g.bot); c.lineTo(g.left - 2, cup); c.bezierCurveTo(g.left - 6, g.top, g.left + g.bw + 6, g.top, g.left + g.bw + 2, cup); c.lineTo(g.left + g.bw - 6, g.bot); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.62, armK: 0.75,
      behind(c, g, x) { const st = g.stage; for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(x.parts, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); }
        if (st === 'Byte') { const fr = lt(x.acc, 0.45), cy = g.top + g.bh * 0.3; for (const [w, dy] of [[1.12, 0], [0.86, -14], [0.6, -26], [0.32, -36]]) { c.fillStyle = rgb(dk(fr, 0.12)); c.beginPath(); c.ellipse(g.cx, cy + dy + 3, g.bw * w / 2, 9, 0, 0, 7); c.fill(); c.fillStyle = rgb(fr); c.beginPath(); c.ellipse(g.cx, cy + dy, g.bw * w / 2, 9, 0, 0, 7); c.fill(); }   // the frosting swirl and its cherry
          c.fillStyle = '#d8333f'; c.beginPath(); c.arc(g.cx + 2, cy - 46, 7, 0, 7); c.fill(); c.strokeStyle = '#5a7a3a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(g.cx + 3, cy - 52); c.quadraticCurveTo(g.cx + 8, cy - 60, g.cx + 12, cy - 60); c.stroke();
          const cols = ['#ff6b8a', '#6bc6ff', '#ffe066', '#8ae06b', '#c08bff']; for (let k = 0; k < 14; k++) { c.fillStyle = cols[k % 5]; c.save(); c.translate(g.cx + ((k * 37) % 50 - 25) * g.bw / 64, cy - 30 + ((k * 23) % 36)); c.rotate(k); c.fillRect(-3, -1, 6, 2); c.restore(); } }
        if (st === 'Mega') for (let k = -2; k <= 2; k++) { const cx0 = g.cx + k * 10, top = g.top - 18 - (k === 0 ? 4 : 0);   // candles
          c.fillStyle = ['#ff8fb0', '#8fd0ff', '#fff2a0'][(k + 3) % 3]; c.fillRect(cx0 - 2.5, top, 5, 20); const f = 1 + Math.sin(x.t / 90 + k) * 0.12; c.fillStyle = '#ff9a3c'; c.beginPath(); c.moveTo(cx0, top - 10 * f); c.quadraticCurveTo(cx0 + 4, top - 3, cx0, top); c.quadraticCurveTo(cx0 - 4, top - 3, cx0, top - 10 * f); c.fill(); c.fillStyle = '#fff4c2'; c.beginPath(); c.arc(cx0, top - 3, 1.6, 0, 7); c.fill(); } },
      inside(c, g, x) { const st = g.stage, liner = mix(x.parts, [240, 200, 160], 0.4);
        if (st === 'Mega') { const T = [[0.6, 0, 0.3], [0.8, 0.3, 0.32], [1, 0.62, 0.38]], fr = lt(x.acc, 0.5); T.forEach(([w, y0, h], i) => { const L = g.cx - g.bw * w / 2, y = g.top + g.bh * y0;   // frosting dripping off each tier
            c.fillStyle = rgb(fr); c.beginPath(); c.moveTo(L - 2, y); c.lineTo(L + g.bw * w + 2, y); c.lineTo(L + g.bw * w + 2, y + 6); for (let k = 7; k >= 0; k--) { const px = L + g.bw * w * k / 7; c.quadraticCurveTo(px + g.bw * w / 14, y + 6 + (k % 2 ? 10 : 4), px, y + 6); } c.closePath(); c.fill();
            if (i === 2) for (let k = 0; k < 5; k++) { const px = L + g.bw * w * (0.1 + k * 0.2), py = y + 16; c.fillStyle = '#e8394a'; c.beginPath(); c.moveTo(px - 5, py - 4); c.quadraticCurveTo(px, py - 8, px + 5, py - 4); c.quadraticCurveTo(px + 3, py + 5, px, py + 6); c.quadraticCurveTo(px - 3, py + 5, px - 5, py - 4); c.fill(); } }); return; }
        const cup = g.top + g.bh * 0.42; c.fillStyle = rgba(liner, 0.95); c.beginPath(); c.moveTo(g.left + 6, g.bot + 2); c.lineTo(g.left - 3, cup); c.lineTo(g.left + g.bw + 3, cup); c.lineTo(g.left + g.bw - 6, g.bot + 2); c.closePath(); c.fill();   // the pleated paper cup
        c.strokeStyle = rgba(dk(liner, 0.25), 0.7); c.lineWidth = 1.5; for (let k = 1; k < 8; k++) { const fx = k / 8; c.beginPath(); c.moveTo(g.left - 3 + (g.bw + 6) * fx, cup); c.lineTo(g.left + 6 + (g.bw - 12) * fx, g.bot); c.stroke(); }
        if (st === 'Bit') { c.fillStyle = rgba(dk(x.body, 0.3), 0.5); for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(g.left + g.bw * (0.2 + k * 0.15), g.top + g.bh * (0.18 + (k % 2) * 0.1), 2, 0, 7); c.fill(); } } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.4, g.left + g.bw * 0.16, g.top + g.bh * 0.16, g.left + g.bw * 0.36, g.top + g.bh * 0.04],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.42, ex: 0.14, my: 0.55, s: 0.74 } : { ey: 0.6, ex: 0.16, my: 0.78, s: by(g.stage, 0.6, 0.66, 0.7) })
    },
    /* Suds: soap. Bit is a soap bubble with a rainbow sheen. Byte is a bar of soap with foam piled on top and bubbles drifting off.
       Mega is a clawfoot bathtub: a mountain of foam on top, gold claw feet, and bubbles of every size floating up */
    Suds: {
      dims: { Bit: [54, 54], Byte: [76, 52], Mega: [104, 62] }, ll: st => by(st, 0, 4, 12),
      bottom(st) { return st === 'Bit' ? 150 : 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 34, 26, 50); },
      path(c, g) { if (g.stage === 'Bit') { c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2, 0, 7); return; } if (g.stage === 'Byte') { roundBox(c, g.left, g.top, g.bw, g.bh, 18); return; }
        c.beginPath(); c.moveTo(g.left - 6, g.top); c.lineTo(g.left + g.bw + 6, g.top); c.lineTo(g.left + g.bw + 2, g.top + 8); c.bezierCurveTo(g.left + g.bw, g.bot + 4, g.left, g.bot + 4, g.left - 2, g.top + 8); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.56, armK: 0.75,
      bub(c, px, py, r, a) { c.fillStyle = `rgba(220,240,255,${0.25 * a})`; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); c.strokeStyle = `rgba(255,255,255,${0.85 * a})`; c.lineWidth = 1.2; c.stroke();
        c.strokeStyle = `rgba(255,170,230,${0.6 * a})`; c.beginPath(); c.arc(px, py, r - 1.5, 0.3, 1.4); c.stroke(); c.fillStyle = `rgba(255,255,255,${0.9 * a})`; c.beginPath(); c.arc(px - r * 0.35, py - r * 0.35, r * 0.18, 0, 7); c.fill(); },
      foam(c, cx0, y0, w, n, t) { for (let k = 0; k < n; k++) { const px = cx0 - w / 2 + (k + 0.5) * w / n, r = 7 + ((k * 7) % 5) + Math.sin(t / 600 + k) * 0.8; c.fillStyle = 'rgba(205,220,235,.95)'; c.beginPath(); c.arc(px, y0 - r * 0.4 + 2, r, 0, 7); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(px, y0 - r * 0.4, r, 0, 7); c.fill(); } },
      behind(c, g, x) { const st = g.stage;
        if (st === 'Bit') { x.feet.push([g.cx, 182, 8]); return; }
        if (st === 'Byte') { for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.26, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(x.body, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); } return; }
        for (const sd of [-1, 1]) for (const k of [0.16, 0.84]) { if ((k < 0.5) !== (sd < 0)) continue; const fx = g.left + g.bw * k, lift = Math.max(0, sd * x.walk) * 3;   // gold claw feet
          c.fillStyle = '#b8902e'; c.beginPath(); c.moveTo(fx - 5, g.bot - 6); c.lineTo(fx + 5, g.bot - 6); c.lineTo(fx + 7, 180 - lift); c.lineTo(fx - 7, 180 - lift); c.closePath(); c.fill(); c.fillStyle = '#e9c45a'; for (const d of [-5, 0, 5]) { c.beginPath(); c.arc(fx + d, 181 - lift, 2.6, 0, 7); c.fill(); } x.feet.push([fx, 182 - lift, 7]); }
        this.foam(c, g.cx, g.top + 2, g.bw * 1.05, 7, x.t); this.foam(c, g.cx - 4, g.top - 12, g.bw * 0.7, 5, x.t + 300); this.foam(c, g.cx + 2, g.top - 24, g.bw * 0.36, 3, x.t + 600); },
      inside(c, g, x) { const st = g.stage;
        if (st === 'Bit') { const sh = c.createLinearGradient(g.left, g.top, g.left + g.bw, g.bot); sh.addColorStop(0, 'rgba(255,170,230,.35)'); sh.addColorStop(0.5, 'rgba(170,230,255,.2)'); sh.addColorStop(1, 'rgba(200,255,190,.35)'); c.fillStyle = sh; c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8); return; }
        if (st === 'Byte') { c.strokeStyle = rgba(dk(x.body, 0.25), 0.6); c.lineWidth = 2; c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.55, g.bw * 0.38, g.bh * 0.32, 0, 0, 7); c.stroke(); return; }   // an engraved oval
        c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(g.left + 8, g.top + 10, 5, g.bh - 24); c.strokeStyle = rgba(dk(x.body, 0.3), 0.5); c.lineWidth = 2; c.beginPath(); c.moveTo(g.left, g.top + 9); c.lineTo(g.left + g.bw, g.top + 9); c.stroke(); },
      front(c, g, x) { const st = g.stage; if (st === 'Byte') this.foam(c, g.cx, g.top + 3, g.bw * 0.9, 5, x.t);
        const n = by(st, 2, 4, 8); for (let k = 0; k < n; k++) { const ph = (x.t / (st === 'Mega' ? 2200 : 1800) + k / n) % 1, r = by(st, 4, 5, 4) + (k % 3) * 3; this.bub(c, g.cx + Math.sin(ph * 5 + k * 2) * g.bw * 0.5 + (k - n / 2) * 4, g.top - 10 - ph * 70, r, 1 - ph); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: by(g.stage, 0.44, 0.48, 0.42), ex: 0.16, my: by(g.stage, 0.66, 0.7, 0.62), s: by(g.stage, 0.7, 0.74, 0.82) })
    },
    /* Scoop: ice cream. Bit is one scoop melting on a waffle cone it hops on. Byte is a double scoop in two flavours with sprinkles and a wafer stick.
       Mega is a sundae: a tall glass with three scoops on top, whipped cream, a cherry, wafer fans like wings, and chocolate running down the glass */
    Scoop: {
      dims: { Bit: [58, 50], Byte: [62, 88], Mega: [80, 70] }, cl: st => by(st, 28, 30, 0), slots: { feet: false },
      bottom(st) { return st === 'Mega' ? 168 : 184 - this.cl(st); }, height(st) { return this.dims[st][1] + this.cl(st) + by(st, 6, 14, 76); },
      circ(g) { if (g.stage === 'Bit') return [[g.top + g.bh / 2, g.bw / 2]]; const r1 = g.bw * 0.42, r2 = g.bw / 2; return [[g.top + r1, r1], [g.bot - r2, r2]]; },
      path(c, g) { if (g.stage === 'Mega') { c.beginPath(); c.moveTo(g.left - 4, g.top); c.lineTo(g.left + g.bw + 4, g.top); c.bezierCurveTo(g.left + g.bw, g.top + g.bh * 0.7, g.cx + 10, g.bot - 6, g.cx + 6, g.bot); c.lineTo(g.cx - 6, g.bot); c.bezierCurveTo(g.cx - 10, g.bot - 6, g.left, g.top + g.bh * 0.7, g.left - 4, g.top); c.closePath(); return; }
        const C = this.circ(g); c.beginPath(); if (C.length === 1) { const [cy, r] = C[0]; c.arc(g.cx, cy, r, Math.PI * 0.95, Math.PI * 2.05); for (let k = 0; k <= 6; k++) { const px = g.cx + r - k * 2 * r / 6; c.quadraticCurveTo(px + r / 6, cy + r * (k % 2 ? 0.9 : 0.5), px, cy + r * 0.45); } c.closePath(); return; }
        const [A, B] = C, d = B[0] - A[0], h = (d * d + A[1] * A[1] - B[1] * B[1]) / (2 * d), w = Math.sqrt(Math.max(1, A[1] * A[1] - h * h)), ja = Math.atan2(h, w), jb = Math.atan2(h - d, w);
        c.arc(g.cx, A[0], A[1], Math.PI - ja, Math.PI * 2 + ja); c.arc(g.cx, B[0], B[1], jb, Math.PI - jb); c.closePath(); },
      behind(c, g, x) { const st = g.stage, waf = [214, 160, 96];
        if (st !== 'Mega') { const hop = x.walk ? Math.max(0, Math.sin(x.t / 200)) * 4 : 0, ct = g.bot - 6, cw = g.bw * 0.4, tip = 183 - hop;   // the waffle cone
          c.fillStyle = rgb(dk(waf, 0.25)); c.beginPath(); c.moveTo(g.cx - cw, ct); c.lineTo(g.cx + cw, ct); c.lineTo(g.cx, tip); c.closePath(); c.fill(); c.fillStyle = rgb(waf); c.beginPath(); c.moveTo(g.cx - cw + 2, ct); c.lineTo(g.cx + cw - 2, ct); c.lineTo(g.cx, tip - 3); c.closePath(); c.fill();
          c.save(); c.clip(); c.strokeStyle = rgba(dk(waf, 0.3), 0.7); c.lineWidth = 1.4; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(g.cx + k * 7, ct); c.lineTo(g.cx + k * 7 + 30, tip); c.moveTo(g.cx + k * 7, ct); c.lineTo(g.cx + k * 7 - 30, tip); c.stroke(); } c.restore(); x.feet.push([g.cx, tip, 4]);
          if (st === 'Byte') { c.fillStyle = rgb(lt(waf, 0.15)); c.save(); c.translate(g.cx + g.bw * 0.3, g.top + 8); c.rotate(0.4); roundBox(c, -4, -20, 8, 26, 2); c.fill(); c.restore(); } return; }
        const sc = [x.body, mix(x.acc, [255, 190, 210], 0.4), [120, 80, 55]], sx = [g.cx - 20, g.cx + 20, g.cx];   // three scoops, wafer fans, whipped cream and a cherry
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * 26, g.top - 26); c.rotate(sd * 0.7); c.fillStyle = rgb(waf); c.beginPath(); c.moveTo(0, 8); for (let k = 0; k <= 4; k++) { const a = -Math.PI / 2 + (k - 2) * 0.32; c.lineTo(Math.cos(a) * 30, Math.sin(a) * 30 + 8); } c.closePath(); c.fill();
          c.strokeStyle = rgba(dk(waf, 0.3), 0.7); c.lineWidth = 1.2; for (let k = 0; k <= 4; k++) { const a = -Math.PI / 2 + (k - 2) * 0.32; c.beginPath(); c.moveTo(0, 8); c.lineTo(Math.cos(a) * 30, Math.sin(a) * 30 + 8); c.stroke(); } c.restore(); }
        [0, 1, 2].forEach(i => { const py = g.top - (i === 2 ? 26 : 8); c.fillStyle = rgb(dk(sc[i], 0.15)); c.beginPath(); c.arc(sx[i], py + 2, 17, 0, 7); c.fill(); c.fillStyle = rgb(sc[i]); c.beginPath(); c.arc(sx[i], py, 17, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(sx[i] - 6, py - 6, 4, 0, 7); c.fill(); });
        c.fillStyle = '#ffffff'; for (const [ox, oy, r] of [[-8, -44, 9], [8, -44, 9], [0, -52, 9], [0, -60, 6]]) { c.beginPath(); c.arc(g.cx + ox, g.top + oy, r, 0, 7); c.fill(); }
        c.fillStyle = '#d8333f'; c.beginPath(); c.arc(g.cx + 2, g.top - 68, 6, 0, 7); c.fill(); c.strokeStyle = '#5a7a3a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(g.cx + 3, g.top - 73); c.quadraticCurveTo(g.cx + 8, g.top - 80, g.cx + 12, g.top - 79); c.stroke();
        c.fillStyle = '#bfe3f0'; c.fillRect(g.cx - 4, g.bot - 2, 8, 182 - g.bot - 4); c.beginPath(); c.ellipse(g.cx, 180, 20, 4, 0, 0, 7); c.fill(); x.feet.push([g.cx, 182, 14]); },
      inside(c, g, x) { const st = g.stage;
        if (st === 'Byte') { const [A] = this.circ(g); c.fillStyle = rgba(mix(x.acc, [255, 190, 210], 0.4), 0.85); c.beginPath(); c.arc(g.cx, A[0], A[1] + 2, 0, 7); c.fill(); }   // the second flavour on top
        if (st !== 'Mega') { const cols = ['#ff6b8a', '#6bc6ff', '#ffe066', '#8ae06b', '#c08bff']; for (let k = 0; k < by(st, 6, 14, 0); k++) { c.fillStyle = cols[k % 5]; c.save(); c.translate(g.left + ((k * 37) % 100) / 100 * g.bw, g.top + ((k * 23) % 40) / 100 * g.bh); c.rotate(k); c.fillRect(-3, -1, 6, 2); c.restore(); } return; }
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(g.left + 10, g.top + 6, 5, g.bh * 0.6); c.fillStyle = rgba([120, 80, 55], 0.95); c.beginPath(); c.moveTo(g.left - 4, g.top); c.lineTo(g.left + g.bw + 4, g.top);   // chocolate running down the glass
        for (let k = 8; k >= 0; k--) { const px = g.left - 4 + (g.bw + 8) * k / 8; c.quadraticCurveTo(px + (g.bw + 8) / 16, g.top + (k % 3 ? 10 : 22), px, g.top + 4); } c.closePath(); c.fill(); },
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.5, g.left + g.bw * 0.18, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.44, ex: 0.15, my: 0.66, s: 0.76 } : g.stage === 'Byte' ? { ey: 0.68, ex: 0.16, my: 0.82, s: 0.7 } : { ey: 0.46, ex: 0.17, my: 0.66, s: 0.66 })
    },
    /* Tome: a book. Bit is a closed notebook with a spine stripe and an elastic band. Byte is a book standing open, pages fluttering and a ribbon bookmark hanging.
       Mega is a spellbook: it floats open over a magic circle, gold corners on its cover, runes circling it and loose pages drifting round */
    Tome: {
      dims: { Bit: [50, 62], Byte: [88, 58], Mega: [100, 66] }, ll: st => by(st, 5, 5, 0),
      bottom(st) { return st === 'Mega' ? 150 : 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 6, 20, 48); },
      path(c, g) { if (g.stage === 'Bit') { roundBox(c, g.left, g.top, g.bw, g.bh, 6); return; }
        const dip = g.stage === 'Mega' ? 8 : 6; c.beginPath(); c.moveTo(g.cx, g.top + dip); c.quadraticCurveTo(g.left + g.bw * 0.3, g.top - 4, g.left, g.top + 4); c.lineTo(g.left, g.bot); c.quadraticCurveTo(g.left + g.bw * 0.3, g.bot - 8, g.cx, g.bot + 2);
        c.quadraticCurveTo(g.left + g.bw * 0.7, g.bot - 8, g.left + g.bw, g.bot); c.lineTo(g.left + g.bw, g.top + 4); c.quadraticCurveTo(g.left + g.bw * 0.7, g.top - 4, g.cx, g.top + dip); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 0), handR: st => by(st, 0, 4.5, 0), shoulderY: 0.6, armK: 0.75,
      behind(c, g, x) { const st = g.stage, cover = dk(x.body, 0.35);
        if (st === 'Mega') { const gl = 0.6 + 0.4 * Math.sin(x.t / 400);   // the magic circle, the cover behind the pages, runes circling
          c.strokeStyle = rgba(lt(x.acc, 0.3), 0.5 + 0.3 * gl); c.lineWidth = 2; c.beginPath(); c.ellipse(g.cx, 178, g.bw * 0.6, 7, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(g.cx, 178, g.bw * 0.45, 5, 0, 0, 7); c.stroke();
          for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + x.t / 2000; c.beginPath(); c.moveTo(g.cx + Math.cos(a) * g.bw * 0.45, 178 + Math.sin(a) * 5); c.lineTo(g.cx + Math.cos(a + 2.1) * g.bw * 0.45, 178 + Math.sin(a + 2.1) * 5); c.stroke(); }
          c.fillStyle = rgb(cover); c.beginPath(); c.moveTo(g.cx, g.top + 2); c.lineTo(g.left - 8, g.top - 2); c.lineTo(g.left - 8, g.bot + 6); c.lineTo(g.cx, g.bot + 8); c.lineTo(g.left + g.bw + 8, g.bot + 6); c.lineTo(g.left + g.bw + 8, g.top - 2); c.closePath(); c.fill();
          c.fillStyle = '#e9b23a'; for (const [px, py] of [[g.left - 8, g.top - 2], [g.left - 8, g.bot + 6], [g.left + g.bw + 8, g.top - 2], [g.left + g.bw + 8, g.bot + 6]]) { c.beginPath(); c.moveTo(px, py); c.lineTo(px + (px < g.cx ? 10 : -10), py); c.lineTo(px, py + (py < g.cx ? 10 : -10)); c.closePath(); c.fill(); }
          x.feet.push([g.cx, 182, g.bw * 0.4]); return; }
        if (st === 'Byte') { c.fillStyle = rgb(cover); c.beginPath(); c.moveTo(g.cx, g.top + 4); c.lineTo(g.left - 5, g.top); c.lineTo(g.left - 5, g.bot + 4); c.lineTo(g.cx, g.bot + 6); c.lineTo(g.left + g.bw + 5, g.bot + 4); c.lineTo(g.left + g.bw + 5, g.top); c.closePath(); c.fill();
          c.fillStyle = rgb(x.acc); c.fillRect(g.cx - 2, g.bot, 4, 18 + Math.sin(x.t / 400) * 2); c.beginPath(); c.moveTo(g.cx - 2, g.bot + 18); c.lineTo(g.cx + 2, g.bot + 18); c.lineTo(g.cx, g.bot + 14); c.fill(); }   // the ribbon bookmark
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * (st === 'Bit' ? 0.24 : 0.3), lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(cover, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); } },
      inside(c, g, x) { const st = g.stage, cover = dk(x.body, 0.35);
        if (st === 'Bit') { c.fillStyle = rgb(cover); c.fillRect(g.left - 2, g.top - 2, 10, g.bh + 4); c.fillStyle = rgb(x.acc); c.fillRect(g.left + g.bw - 12, g.top - 2, 5, g.bh + 4); return; }   // spine stripe and elastic band
        c.fillStyle = rgba(mix(x.body, [250, 244, 228], 0.7), 0.9); c.fillRect(g.left - 2, g.top - 4, g.bw + 4, g.bh + 12);   // paper
        c.strokeStyle = rgba(dk(x.body, 0.35), 0.35); c.lineWidth = 1.2; for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) { const y0 = g.top + g.bh * (0.2 + k * 0.12); if (y0 > g.top + g.bh * 0.3 && y0 < g.top + g.bh * 0.82 && false) continue; c.beginPath(); c.moveTo(g.cx + sd * 8, y0); c.lineTo(g.cx + sd * g.bw * 0.42, y0); c.stroke(); }
        c.strokeStyle = rgba(dk(x.body, 0.3), 0.5); c.beginPath(); c.moveTo(g.cx, g.top + 6); c.lineTo(g.cx, g.bot); c.stroke();
        if (st === 'Byte') { const fl = Math.sin(x.t / 300); c.fillStyle = 'rgba(255,252,240,.95)'; c.beginPath(); c.moveTo(g.cx, g.top + 4); c.quadraticCurveTo(g.cx + 10, g.top - 12 - fl * 6, g.cx + g.bw * 0.3, g.top - 6 - fl * 8); c.lineTo(g.cx + g.bw * 0.3, g.top + 14); c.quadraticCurveTo(g.cx + 10, g.top + 6, g.cx, g.top + 20); c.closePath(); c.fill(); } },
      front(c, g, x) { if (g.stage !== 'Mega') return; const gl = 0.6 + 0.4 * Math.sin(x.t / 400);
        c.font = '700 13px serif'; c.textAlign = 'center'; const R = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ']; for (let k = 0; k < 6; k++) { const a = x.t / 1600 + k / 6 * Math.PI * 2, s = Math.sin(a); c.fillStyle = rgba(lt(x.acc, 0.4), (0.4 + 0.5 * gl) * (s > 0 ? 1 : 0.5)); c.fillText(R[k], g.cx + Math.cos(a) * g.bw * 0.75, g.top + g.bh * 0.4 + s * 16); }
        for (let k = 0; k < 3; k++) { const ph = (x.t / 2600 + k / 3) % 1, px = g.cx + Math.sin(ph * 6 + k * 2) * g.bw * 0.7, py = g.bot + 10 - ph * 110; c.save(); c.translate(px, py); c.rotate(Math.sin(ph * 8 + k) * 0.6); c.fillStyle = `rgba(255,250,235,${Math.sin(ph * Math.PI)})`; c.fillRect(-7, -9, 14, 18); c.strokeStyle = `rgba(150,140,120,${0.6 * Math.sin(ph * Math.PI)})`; c.lineWidth = 1; for (let q = 0; q < 3; q++) { c.beginPath(); c.moveTo(-5, -5 + q * 5); c.lineTo(5, -5 + q * 5); c.stroke(); } c.restore(); } },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.6, g.left + g.bw * 0.12, g.top + g.bh * 0.24, g.left + g.bw * 0.3, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Bit' ? { ey: 0.42, ex: 0.16, my: 0.62, s: 0.62 } : { ey: 0.46, ex: by(g.stage, 0.16, 0.2, 0.2), my: 0.68, s: by(g.stage, 0.62, 0.72, 0.8) })
    },
    /* Gumball: candy. Bit is one shiny gumball on little feet. Byte is a gumball machine: a glass globe full of gumballs on a red base with a coin slot and a chute.
       Mega is a candy carousel: a striped canopy over the globe, gold poles, and lollipop horses riding round its base */
    Gumball: {
      topUp: { Mega: 12 },
      dims: { Bit: [50, 50], Byte: [70, 66], Mega: [80, 76] }, bs: st => by(st, 0, 30, 34), ll: st => by(st, 4, 4, 4),
      bottom(st) { return 182 - this.ll(st) - this.bs(st); }, height(st) { return this.dims[st][1] + this.bs(st) + this.ll(st) + by(st, 6, 12, 50); },
      glass: true, patternAfter: true,
      path(c, g) { c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2, 0, 7); },
      arms: 'stub', armW: st => 0, handR: st => 0, shoulderY: 0.6, armK: 0.7,
      cols: ['#ff5a6a', '#ffd84a', '#5ac6ff', '#7be07b', '#c08bff', '#ff9f4a'],
      behind(c, g, x) { const st = g.stage;
        if (st === 'Bit') { for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(x.body, 0.25), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); } return; }
        x.feet.push([g.cx, 182, g.bw * 0.4]);
        if (st === 'Mega') { const ch = g.top - 34, rw = g.bw * 0.9;   // poles, canopy, and horses behind
          c.fillStyle = '#e9b23a'; for (const sd of [-1, 1]) c.fillRect(g.cx + sd * rw * 0.82 - 2, ch + 10, 4, 182 - ch - 14);
          for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#ffffff' : rgb(x.acc); c.beginPath(); c.moveTo(g.cx, ch - 18); c.lineTo(g.cx - rw + k * rw / 4, ch + 12); c.lineTo(g.cx - rw + (k + 1) * rw / 4, ch + 12); c.closePath(); c.fill(); }
          for (let k = 0; k <= 8; k++) { c.fillStyle = k % 2 ? '#ffffff' : rgb(x.acc); c.beginPath(); c.arc(g.cx - rw + k * rw / 4, ch + 12, rw / 8, 0, Math.PI); c.fill(); }
          c.fillStyle = '#e9b23a'; c.beginPath(); c.arc(g.cx, ch - 20, 4, 0, 7); c.fill(); this.horses(c, g, x, true); } },
      horses(c, g, x, back) { for (let k = 0; k < 4; k++) { const a = x.t / 1400 + k * Math.PI / 2, s = Math.sin(a); if ((s < 0) !== back) continue; const px = g.cx + Math.cos(a) * g.bw * 0.82, py = 168 + s * 6 - Math.max(0, Math.sin(x.t / 300 + k)) * 6, sc = back ? 0.8 : 1;   // lollipop horses on poles
          c.fillStyle = '#d9d0c0'; c.fillRect(px - 1, py - 24, 2, 26); c.fillStyle = this.cols[k]; c.beginPath(); c.arc(px, py - 26, 8 * sc, 0, 7); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 2 * sc; c.beginPath(); c.arc(px, py - 26, 4.5 * sc, 0, Math.PI * 1.5); c.stroke(); } },
      inside(c, g, x) { const st = g.stage; if (st === 'Bit') { c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(g.cx + g.bw * 0.15, g.top + g.bh * 0.7, g.bw * 0.08, 0, 7); c.fill(); return; }
        const r = st === 'Mega' ? 6.5 : 6; for (let k = 0; k < 26; k++) { const px = g.left + 6 + ((k * 37) % 100) / 100 * (g.bw - 12), py = g.top + g.bh * 0.66 + ((k * 61) % 100) / 100 * g.bh * 0.32; if (Math.hypot(px - g.cx, py - g.top - g.bh / 2) > g.bw / 2 - r) continue;   // gumballs filling the globe
          c.fillStyle = this.cols[k % 6]; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.arc(px - 2, py - 2, 1.6, 0, 7); c.fill(); } },
      front(c, g, x) { const st = g.stage; if (st === 'Bit') return; const bs = this.bs(st), bw = g.bw * (st === 'Mega' ? 0.9 : 0.8), by0 = g.bot - 4, base = mix(x.acc, [220, 60, 60], 0.5);   // the base with its coin slot and chute
        c.fillStyle = rgb(dk(base, 0.3)); c.beginPath(); c.moveTo(g.cx - bw * 0.38, by0); c.lineTo(g.cx + bw * 0.38, by0); c.lineTo(g.cx + bw / 2, by0 + bs + 4); c.lineTo(g.cx - bw / 2, by0 + bs + 4); c.closePath(); c.fill();
        c.fillStyle = rgb(base); c.beginPath(); c.moveTo(g.cx - bw * 0.38, by0); c.lineTo(g.cx + bw * 0.38, by0); c.lineTo(g.cx + bw / 2, by0 + bs); c.lineTo(g.cx - bw / 2, by0 + bs); c.closePath(); c.fill();
        c.fillStyle = '#c9ced8'; c.beginPath(); c.arc(g.cx, by0 + bs * 0.35, 6, 0, 7); c.fill(); c.fillStyle = '#3a3a44'; c.fillRect(g.cx - 3, by0 + bs * 0.35 - 1, 6, 2); c.fillStyle = '#3a3a44'; roundBox(c, g.cx - 6, by0 + bs * 0.62, 12, 8, 3); c.fill();
        if (st === 'Mega') this.horses(c, g, x, false); },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: by(g.stage, 0.44, 0.34, 0.34), ex: 0.16, my: by(g.stage, 0.66, 0.5, 0.5), s: by(g.stage, 0.66, 0.72, 0.76) })
    },
    /* Pina: a pineapple. Bit is a little round bud with a short leafy crown. Byte is a full pineapple with its crosshatched skin and a tall crown.
       Mega is a tiki totem: a carved wooden pole with the pineapple crown on top, a flower lei round its middle, and a torch burning on each side */
    Pina: {
      topUp: { Mega: 20 },
      dims: { Bit: [50, 46], Byte: [62, 74], Mega: [64, 104] }, ll: st => by(st, 4, 5, 4),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 24, 40, 40); },
      path(c, g) { if (g.stage === 'Mega') { roundBox(c, g.left, g.top, g.bw, g.bh, 12); return; } c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      arms: 'stub', armW: st => by(st, 0, 5, 7), handR: st => by(st, 0, 4.5, 6), shoulderY: 0.62, armK: 0.75,
      crown(c, cx0, y0, h, n, t) { for (let k = 0; k < n; k++) { const a = (k / (n - 1) - 0.5) * 1.6, sw = Math.sin(t / 700 + k) * 0.05, len = h * (1 - Math.abs(a) * 0.35); c.save(); c.translate(cx0, y0); c.rotate(a + sw);
          c.fillStyle = k % 2 ? 'rgb(70,140,70)' : 'rgb(95,170,85)'; c.beginPath(); c.moveTo(-5, 0); c.quadraticCurveTo(-3, -len * 0.6, 0, -len); c.quadraticCurveTo(3, -len * 0.6, 5, 0); c.closePath(); c.fill(); c.restore(); } },
      behind(c, g, x) { const st = g.stage;
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(x.body, 0.3), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); }
        this.crown(c, g.cx, g.top + 6, by(st, 22, 40, 40), by(st, 5, 7, 9), x.t);
        if (st === 'Mega') for (const sd of [-1, 1]) { const tx = g.cx + sd * (g.bw * 0.5 + 22), ty = g.top + 10;   // a torch each side
          c.fillStyle = 'rgb(130,90,55)'; c.fillRect(tx - 3, ty, 6, 182 - ty); c.fillStyle = 'rgb(160,115,70)'; c.beginPath(); c.moveTo(tx - 8, ty); c.lineTo(tx + 8, ty); c.lineTo(tx + 5, ty + 12); c.lineTo(tx - 5, ty + 12); c.closePath(); c.fill();
          const f = 1 + Math.sin(x.t / 80 + sd) * 0.12; c.fillStyle = '#ff8a2e'; c.beginPath(); c.moveTo(tx, ty - 22 * f); c.quadraticCurveTo(tx + 10, ty - 6, tx, ty + 2); c.quadraticCurveTo(tx - 10, ty - 6, tx, ty - 22 * f); c.fill(); c.fillStyle = '#ffd35a'; c.beginPath(); c.moveTo(tx, ty - 12 * f); c.quadraticCurveTo(tx + 5, ty - 3, tx, ty + 1); c.quadraticCurveTo(tx - 5, ty - 3, tx, ty - 12 * f); c.fill(); } },
      inside(c, g, x) { const st = g.stage;
        if (st === 'Mega') { c.fillStyle = rgba(mix(x.body, [150, 105, 65], 0.65), 0.9); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8);   // carved wood, bands and a lei
          c.fillStyle = rgba([100, 65, 40], 0.6); for (const fy of [0.08, 0.86]) c.fillRect(g.left - 4, g.top + g.bh * fy, g.bw + 8, 6);
          c.strokeStyle = rgba([100, 65, 40], 0.5); c.lineWidth = 2; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(g.left + 4 + k * (g.bw - 8) / 5, g.top + g.bh * 0.72); c.lineTo(g.left + 4 + k * (g.bw - 8) / 5 + 5, g.top + g.bh * 0.8); c.stroke(); }
          const cols = ['#ff6b8a', '#ffd84a', '#ffffff', '#ff9f4a']; for (let k = 0; k < 9; k++) { const px = g.left + 2 + k * (g.bw - 4) / 8, py = g.top + g.bh * 0.62 + Math.sin(k / 8 * Math.PI) * 8; c.fillStyle = cols[k % 4]; for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; c.beginPath(); c.arc(px + Math.cos(a) * 2.6, py + Math.sin(a) * 2.6, 2.2, 0, 7); c.fill(); } } return; }
        c.save(); c.strokeStyle = rgba(dk(x.body, 0.3), 0.55); c.lineWidth = 1.5; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(g.cx + k * 9 - 30, g.top); c.lineTo(g.cx + k * 9 + 30, g.bot); c.moveTo(g.cx + k * 9 + 30, g.top); c.lineTo(g.cx + k * 9 - 30, g.bot); c.stroke(); }   // the crosshatched skin
        c.fillStyle = rgba(lt(x.acc, 0.3), 0.6); for (let k = 0; k < 12; k++) { c.beginPath(); c.arc(g.left + 6 + (k * 37 % 100) / 100 * (g.bw - 12), g.top + 6 + (k * 53 % 100) / 100 * (g.bh - 12), 1.4, 0, 7); c.fill(); } c.restore(); },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.26, g.left + g.bw * 0.36, g.top + g.bh * 0.1],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.28, ex: 0.18, my: 0.46, s: 0.78 } : { ey: 0.46, ex: 0.17, my: 0.68, s: by(g.stage, 0.64, 0.72, 0.8) })
    },
    /* Jingle: money. Bit is a gold coin with a star stamped on it. Byte is a piggy bank with a coin slot on its back, a snout, ears and a curly tail.
       Mega is a treasure chest: its lid thrown open, gold coins and gems spilling over, and a glow pouring out */
    Jingle: {
      dims: { Bit: [52, 52], Byte: [80, 60], Mega: [92, 60] }, ll: st => by(st, 4, 10, 6),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 6, 16, 50); },
      path(c, g) { if (g.stage === 'Bit') { c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2, 0, 7); return; } if (g.stage === 'Byte') { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); return; } roundBox(c, g.left, g.top, g.bw, g.bh, 8); },
      arms: 'stub', armW: st => by(st, 0, 0, 6), handR: st => by(st, 0, 0, 5), shoulderY: 0.6, armK: 0.75,
      coin(c, px, py, r, t, k) { const w = Math.abs(Math.cos(t / 400 + k)); c.fillStyle = '#b8902e'; c.beginPath(); c.ellipse(px, py + 1, r * (0.3 + 0.7 * w), r, 0, 0, 7); c.fill(); c.fillStyle = '#f2cc4a'; c.beginPath(); c.ellipse(px, py, r * (0.3 + 0.7 * w), r, 0, 0, 7); c.fill(); },
      behind(c, g, x) { const st = g.stage, gold = [233, 190, 70];
        if (st === 'Bit') { for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(gold, 0.3), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); } return; }
        if (st === 'Byte') { for (const k of [-0.32, -0.12, 0.12, 0.32]) { const fx = g.cx + k * g.bw, lift = (k > 0 ? 1 : -1) * x.walk > 0 ? 3 : 0; roundBox(c, fx - 6, g.bot - 6, 12, 182 - g.bot + 6 - lift, 4); c.fillStyle = rgb(dk(x.body, 0.15)); c.fill(); x.feet.push([fx, 182 - lift, 5]); }   // trotters, ears, a curly tail
          for (const sd of [-1, 1]) { c.fillStyle = rgb(dk(x.body, 0.1)); c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.16, g.top + 4); c.lineTo(g.cx + sd * g.bw * 0.34, g.top - 12); c.lineTo(g.cx + sd * g.bw * 0.36, g.top + 8); c.closePath(); c.fill(); }
          c.strokeStyle = rgb(dk(x.body, 0.1)); c.lineWidth = 3; c.beginPath(); for (let a = 0; a < 9; a += 0.3) c.lineTo(g.left + g.bw + 4 + Math.cos(a) * (1 + a * 0.6), g.top + g.bh * 0.4 + Math.sin(a) * (1 + a * 0.6)); c.stroke(); return; }
        const lid = g.top + 2, gl = 0.6 + 0.4 * Math.sin(x.t / 400), wood = mix(x.body, [140, 90, 55], 0.6);   // the open lid, the glow and the treasure heap
        const h0 = c.createRadialGradient(g.cx, lid - 10, 2, g.cx, lid - 10, 70); h0.addColorStop(0, `rgba(255,230,140,${0.6 * gl})`); h0.addColorStop(1, 'rgba(255,230,140,0)'); c.fillStyle = h0; c.fillRect(g.cx - 70, lid - 80, 140, 110);
        c.fillStyle = rgb(dk(wood, 0.3)); c.beginPath(); c.moveTo(g.left - 2, lid); c.lineTo(g.left + g.bw + 2, lid); c.lineTo(g.left + g.bw - 6, lid - 44); c.quadraticCurveTo(g.cx, lid - 56, g.left + 6, lid - 44); c.closePath(); c.fill();
        c.fillStyle = 'rgba(80,50,30,.9)'; c.beginPath(); c.moveTo(g.left + 6, lid - 4); c.lineTo(g.left + g.bw - 6, lid - 4); c.lineTo(g.left + g.bw - 12, lid - 38); c.quadraticCurveTo(g.cx, lid - 48, g.left + 12, lid - 38); c.closePath(); c.fill();
        c.fillStyle = '#e9b23a'; c.fillRect(g.left + 4, lid - 6, g.bw - 8, 4);
        for (let k = 0; k < 14; k++) this.coin(c, g.left + 10 + (k * 37 % 100) / 100 * (g.bw - 20), lid - 4 - ((k * 23) % 14), 6, x.t, k);
        for (const [fx, col] of [[0.3, '#e05a6a'], [0.62, '#5ab0e0'], [0.48, '#6ad08a']]) { const px = g.left + g.bw * fx, py = lid - 12; c.fillStyle = col; c.beginPath(); c.moveTo(px, py - 6); c.lineTo(px + 5, py); c.lineTo(px, py + 6); c.lineTo(px - 5, py); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.34; c.fillStyle = '#b8902e'; c.fillRect(fx - 5, g.bot - 2, 10, 182 - g.bot + 2); x.feet.push([fx, 182, 6]); } },
      inside(c, g, x) { const st = g.stage;
        if (st === 'Bit') { c.fillStyle = 'rgba(242,204,74,.85)'; c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2, 0, 7); c.fill(); c.strokeStyle = '#b8902e'; c.lineWidth = 3; c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2 - 4, 0, 7); c.stroke();
          star(c, g.cx, g.top + g.bh * 0.82, 0.35, '#fff3b0'); return; }
        if (st === 'Byte') { c.fillStyle = rgb(dk(x.body, 0.35)); roundBox(c, g.cx - 12, g.top + 3, 24, 5, 2); c.fill(); return; }   // the coin slot
        c.fillStyle = rgba(mix(x.body, [140, 90, 55], 0.6), 0.85); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8); c.fillStyle = '#d9a440'; for (const fx of [0.12, 0.88]) c.fillRect(g.left + g.bw * fx - 4, g.top - 2, 8, g.bh + 4);   // wood with gold bands
        c.fillStyle = '#e9c45a'; roundBox(c, g.cx - 8, g.top + g.bh * 0.78 - 8, 16, 14, 3); c.fill(); c.fillStyle = '#5a4020'; c.beginPath(); c.arc(g.cx, g.top + g.bh * 0.78 - 2, 2.4, 0, 7); c.fill(); },
      front(c, g, x) { if (g.stage !== 'Byte') return; c.fillStyle = rgb(dk(x.body, 0.12)); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.66, 10, 7, 0, 0, 7); c.fill(); c.fillStyle = rgb(dk(x.body, 0.4)); for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * 3.5, g.top + g.bh * 0.66, 1.8, 2.6, 0, 0, 7); c.fill(); } },   // the snout
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Bit' ? { ey: 0.42, ex: 0.16, my: 0.62, s: 0.64 } : g.stage === 'Byte' ? { ey: 0.4, ex: 0.18, my: 0.84, s: 0.72 } : { ey: 0.4, ex: 0.16, my: 0.62, s: 0.78 })
    },
    /* Presto: a magician's hat. Bit is a plain top hat with a band. Byte has bunny ears poking out of the top and a wand tucked in the band.
       Mega is the full act: a starry hat, a red-lined cape, doves flying out of the top, a fan of cards and a wand throwing sparkles */
    Presto: {
      topUp: { Byte: 12, Mega: 16 },
      dims: { Bit: [50, 56], Byte: [58, 64], Mega: [66, 74] }, ll: st => by(st, 5, 6, 8),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 8, 30, 50); },
      path(c, g) { const bh = 9, bw = g.bw * 0.66; c.beginPath(); c.moveTo(g.left - 8, g.bot); c.quadraticCurveTo(g.left - 10, g.bot - bh, g.left - 2, g.bot - bh); c.lineTo(g.cx - bw / 2 - 2, g.bot - bh); c.lineTo(g.cx - bw / 2, g.top + 4);
        c.quadraticCurveTo(g.cx - bw / 2, g.top, g.cx - bw / 2 + 4, g.top); c.lineTo(g.cx + bw / 2 - 4, g.top); c.quadraticCurveTo(g.cx + bw / 2, g.top, g.cx + bw / 2, g.top + 4); c.lineTo(g.cx + bw / 2 + 2, g.bot - bh); c.lineTo(g.left + g.bw + 2, g.bot - bh); c.quadraticCurveTo(g.left + g.bw + 10, g.bot - bh, g.left + g.bw + 8, g.bot); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.6, armK: 0.75,
      behind(c, g, x) { const st = g.stage;
        if (st === 'Mega') { const sw = Math.sin(x.t / 500) * 4; c.fillStyle = '#7a1f2e'; c.beginPath(); c.moveTo(g.cx - g.bw * 0.4, g.top + g.bh * 0.5); c.quadraticCurveTo(g.left - 30 + sw, g.bot, g.left - 24 + sw, 182); c.lineTo(g.left + g.bw + 24 - sw, 182); c.quadraticCurveTo(g.left + g.bw + 30 - sw, g.bot, g.cx + g.bw * 0.4, g.top + g.bh * 0.5); c.closePath(); c.fill();   // the cape
          c.fillStyle = '#1e1a28'; c.beginPath(); c.moveTo(g.cx - g.bw * 0.4, g.top + g.bh * 0.5); c.quadraticCurveTo(g.left - 34 + sw, g.bot, g.left - 30 + sw, 180); c.lineTo(g.left - 18 + sw, 180); c.quadraticCurveTo(g.left - 16, g.bot, g.cx - g.bw * 0.3, g.top + g.bh * 0.5); c.closePath(); c.fill();
          for (let k = 0; k < 2; k++) { const ph = (x.t / 1600 + k / 2) % 1, px = g.cx + (k ? 1 : -1) * ph * 40, py = g.top - 10 - ph * 50, fl = Math.sin(x.t / 60 + k) * 4;   // doves flying out
            c.fillStyle = `rgba(255,255,255,${1 - ph * 0.8})`; c.beginPath(); c.ellipse(px, py, 7, 4, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(px - 2, py); c.lineTo(px - 8, py - 6 - fl); c.lineTo(px + 2, py - 1); c.lineTo(px + 8, py - 6 - fl); c.closePath(); c.fill(); } }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, [42, 38, 50], sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); }
        if (st !== 'Bit') for (const sd of [-1, 1]) { const ex = g.cx + sd * 7, tw = Math.sin(x.t / 400 + sd) * 0.15; c.save(); c.translate(ex, g.top + 2); c.rotate(sd * 0.2 + tw);   // bunny ears
          c.fillStyle = '#f4f0ea'; c.beginPath(); c.ellipse(0, -14, 5, 15, 0, 0, 7); c.fill(); c.fillStyle = '#ffb3c6'; c.beginPath(); c.ellipse(0, -14, 2.4, 10, 0, 0, 7); c.fill(); c.restore(); } },
      inside(c, g, x) { const st = g.stage; c.fillStyle = rgba([40, 36, 50], 0.55); c.fillRect(g.left - 12, g.top - 4, g.bw + 24, g.bh + 8);
        const bw = g.bw * 0.66; c.fillStyle = rgb(x.acc); c.fillRect(g.cx - bw / 2 - 2, g.bot - 22, bw + 4, 9);   // the band
        if (st === 'Mega') for (let k = 0; k < 7; k++) star(c, g.cx - bw / 2 + 4 + ((k * 37) % 100) / 100 * (bw - 8), g.top + 6 + ((k * 53) % 100) / 100 * (g.bh * 0.55), 0.22, '#ffe27a'); },
      front(c, g, x) { const st = g.stage; if (st === 'Bit') return; const A = x.P.arm || [[12, 8, 16, 22], [12, 8, 16, 22]], r = Math.max(0, (A[1][2] - 16) / 30);   // the wand
        const wx = g.left + g.bw + (st === 'Mega' ? 4 : -2), wy = g.bot - (st === 'Mega' ? 30 : 20); c.save(); c.translate(wx, wy); c.rotate(-0.8 + r * 0.9); c.fillStyle = '#1e1a28'; c.fillRect(-2, -26, 4, 26); c.fillStyle = '#ffffff'; c.fillRect(-2, -26, 4, 6); if (CAP) (CAP.hands = CAP.hands || []).push(capPt(c, 0, -26)); c.restore();
        if (st === 'Mega') { for (let k = 0; k < 4; k++) { const ph = (x.t / 900 + k / 4) % 1; star(c, wx + 14 + ph * 20, wy - 26 - ph * 16 + Math.sin(ph * 8) * 4, 0.25 * (1 - ph), '#fff3b0'); }
          for (let k = 0; k < 4; k++) { c.save(); c.translate(g.left - 14, g.bot - 26); c.rotate(-0.6 + k * 0.25); c.fillStyle = '#ffffff'; roundBox(c, -6, -20, 12, 18, 2); c.fill(); c.fillStyle = k % 2 ? '#d8333f' : '#2a2632'; c.beginPath(); c.arc(0, -11, 2.5, 0, 7); c.fill(); c.restore(); } } },   // a fan of cards
      hl: g => [g.left + g.bw * 0.24, g.top + g.bh * 0.6, g.left + g.bw * 0.26, g.top + g.bh * 0.24, g.left + g.bw * 0.4, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.4],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.36, ex: 0.12, my: 0.54, s: by(g.stage, 0.56, 0.62, 0.68) })
    },
    /* Vroom: cleaning. Bit is a dust bunny, a fluffy grey puff. Byte is a robot vacuum: a flat disc with a bumper ring, spinning side brushes and a blinking light.
       Mega is a ride-on floor polisher: a cab with a flashing beacon, big round brushes spinning in front, wheels, and a gleaming trail behind it */
    Vroom: {
      dims: { Bit: [56, 48], Byte: [90, 40], Mega: [86, 74] }, ll: st => by(st, 4, 4, 12),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 6, 14, 26); },
      path(c, g, x) { const st = g.stage; if (st === 'Bit') { const t = x ? x.t : 0, n = 16; c.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, r = (i % 2 ? 0.88 : 1.04) + 0.03 * Math.sin(t / 200 + i); i ? c.lineTo(g.cx + Math.cos(a) * g.bw / 2 * r, g.top + g.bh / 2 + Math.sin(a) * g.bh / 2 * r) : c.moveTo(g.cx + Math.cos(a) * g.bw / 2 * r, g.top + g.bh / 2 + Math.sin(a) * g.bh / 2 * r); } c.closePath(); return; }
        if (st === 'Byte') { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); return; } roundBox(c, g.left, g.top, g.bw, g.bh, 12); },
      arms: 'stub', armW: st => by(st, 0, 0, 6), handR: st => by(st, 0, 0, 5), shoulderY: 0.6, armK: 0.75,
      behind(c, g, x) { const st = g.stage, sp = x.t / (x.walk ? 60 : 160);
        if (st === 'Bit') { for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 6, 4, dk(x.body, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); } return; }
        if (st === 'Byte') { for (const sd of [-1, 1]) { const bx = g.cx + sd * g.bw * 0.4, by0 = g.bot - 2; c.strokeStyle = 'rgba(80,80,90,.8)'; c.lineWidth = 1.5; for (let k = 0; k < 3; k++) { const a = sp * sd + k * 2.09; c.beginPath(); c.moveTo(bx, by0); c.lineTo(bx + Math.cos(a) * 12, by0 + Math.sin(a) * 4); c.stroke(); } }   // side brushes
          c.fillStyle = '#3a3a44'; c.fillRect(g.cx - g.bw * 0.3, g.bot - 4, g.bw * 0.6, 182 - g.bot + 2); x.feet.push([g.cx, 182, g.bw * 0.35]); return; }
        const cl = mix(x.parts, [250, 240, 200], 0.5); c.fillStyle = 'rgba(200,235,255,.4)'; c.fillRect(g.left - 70, 179, 70, 3); for (let k = 0; k < 3; k++) if (Math.sin(x.t / 150 + k * 2) > 0.5) star(c, g.left - 20 - k * 20, 176, 0.25, '#ffffff');   // the gleaming trail
        for (const sd of [-1, 1]) { const wx = g.cx + sd * g.bw * 0.34; c.fillStyle = '#2a2a33'; c.beginPath(); c.arc(wx, 174, 9, 0, 7); c.fill(); c.fillStyle = '#9aa0ab'; c.beginPath(); c.arc(wx, 174, 4, 0, 7); c.fill(); x.feet.push([wx, 182, 8]); }
        const on = Math.floor(x.t / 300) % 2; c.fillStyle = '#5a5a62'; c.fillRect(g.cx - 4, g.top - 10, 8, 10); c.fillStyle = on ? 'rgba(255,170,40,.95)' : 'rgba(200,120,30,.8)'; c.beginPath(); c.arc(g.cx, g.top - 14, 7, Math.PI, 0); c.fill();   // the beacon
        if (on) { const h0 = c.createRadialGradient(g.cx, g.top - 14, 1, g.cx, g.top - 14, 26); h0.addColorStop(0, 'rgba(255,190,60,.5)'); h0.addColorStop(1, 'rgba(255,190,60,0)'); c.fillStyle = h0; c.fillRect(g.cx - 26, g.top - 40, 52, 52); } },
      inside(c, g, x) { const st = g.stage;
        if (st === 'Bit') { c.fillStyle = 'rgba(255,255,255,.25)'; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; c.beginPath(); c.arc(g.cx + Math.cos(a) * g.bw * 0.3, g.top + g.bh / 2 + Math.sin(a) * g.bh * 0.3, 4, 0, 7); c.fill(); } return; }
        if (st === 'Byte') { c.strokeStyle = rgba(dk(x.body, 0.35), 0.8); c.lineWidth = 4; c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2 - 3, g.bh / 2 - 3, 0, 0, Math.PI); c.stroke();   // the bumper and a blinking light
          c.fillStyle = Math.floor(x.t / 500) % 2 ? '#6ad08a' : '#2f6a40'; c.beginPath(); c.arc(g.cx + g.bw * 0.3, g.top + g.bh * 0.3, 3, 0, 7); c.fill(); return; }
        c.fillStyle = rgba(dk(x.body, 0.25), 0.6); c.fillRect(g.left - 4, g.bot - g.bh * 0.24, g.bw + 8, g.bh * 0.3); c.fillStyle = '#e9b23a'; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(g.left + k * g.bw / 6, g.bot - 4); c.lineTo(g.left + k * g.bw / 6 + 7, g.bot - 4); c.lineTo(g.left + k * g.bw / 6 + 14, g.bot - g.bh * 0.2); c.lineTo(g.left + k * g.bw / 6 + 7, g.bot - g.bh * 0.2); c.closePath(); c.fill(); } },   // hazard stripes
      front(c, g, x) { if (g.stage !== 'Mega') return; const sp = x.t / (x.walk ? 50 : 140); for (const sd of [-1, 1]) { const bx = g.cx + sd * g.bw * 0.2, by0 = 178;   // round brushes spinning in front
          c.fillStyle = 'rgba(60,140,220,.85)'; c.beginPath(); c.ellipse(bx, by0, 16, 5, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { const a = sp * sd + k * Math.PI / 2; c.beginPath(); c.moveTo(bx, by0); c.lineTo(bx + Math.cos(a) * 15, by0 + Math.sin(a) * 4.5); c.stroke(); } } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Byte' ? { ey: 0.4, ex: 0.12, my: 0.66, s: 0.6 } : { ey: by(g.stage, 0.44, 0.4, 0.34), ex: 0.16, my: by(g.stage, 0.66, 0.66, 0.54), s: by(g.stage, 0.62, 0.6, 0.76) })
    },
    /* Shutter: a camera. Bit is a roll of film in its canister with the strip sticking out. Byte is an instant camera with a lens, a flash on top and a photo sliding out.
       Mega is an old bellows camera on a tripod: a wooden box, a brass lens on an accordion, and a flash bar it fires off in a burst of light */
    Shutter: {
      dims: { Bit: [44, 58], Byte: [80, 60], Mega: [76, 62] }, ll: st => by(st, 4, 6, 36),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 10, 16, 40); },
      path(c, g) { if (g.stage === 'Bit') { roundBox(c, g.left, g.top, g.bw, g.bh, 10); return; } roundBox(c, g.left, g.top, g.bw, g.bh, g.stage === 'Byte' ? 14 : 6); },
      arms: 'stub', armW: st => by(st, 0, 5, 0), handR: st => by(st, 0, 4.5, 0), shoulderY: 0.6, armK: 0.75,
      behind(c, g, x) { const st = g.stage;
        if (st === 'Mega') { const wood = [130, 88, 55], fl = (x.t % 2400) < 160;   // the tripod, the flash bar and its burst
          c.strokeStyle = rgb(dk(wood, 0.2)); c.lineWidth = 5; c.lineCap = 'round'; for (const [ax, bx] of [[-6, -34], [0, 0], [6, 34]]) { c.beginPath(); c.moveTo(g.cx + ax, g.bot); c.lineTo(g.cx + bx, 182); c.stroke(); } x.feet.push([g.cx, 182, 30]);
          const fx = g.left + g.bw * 0.2, fy = g.top - 22; c.strokeStyle = '#5a5a62'; c.lineWidth = 3; c.beginPath(); c.moveTo(fx, g.top); c.lineTo(fx - 6, fy); c.stroke(); c.fillStyle = '#c9ced8'; c.beginPath(); c.moveTo(fx - 24, fy - 4); c.lineTo(fx + 12, fy - 4); c.lineTo(fx + 6, fy + 4); c.lineTo(fx - 18, fy + 4); c.closePath(); c.fill();
          if (fl) { const h0 = c.createRadialGradient(fx - 6, fy - 4, 2, fx - 6, fy - 4, 60); h0.addColorStop(0, 'rgba(255,255,240,.95)'); h0.addColorStop(1, 'rgba(255,255,240,0)'); c.fillStyle = h0; c.fillRect(fx - 66, fy - 64, 120, 120); } else { c.fillStyle = 'rgba(200,200,200,.5)'; for (let k = 0; k < 2; k++) { const ph = ((x.t % 2400) / 2400 + k * 0.2) % 1; c.beginPath(); c.arc(fx - 6 + ph * 10, fy - 10 - ph * 30, 3 + ph * 6, 0, 7); c.fill(); } }
          return; }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(x.body, 0.3), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); }
        if (st === 'Bit') { const sx = g.left + g.bw - 2; c.fillStyle = '#2a2630'; c.fillRect(sx, g.top + g.bh * 0.3, 22 + Math.sin(x.t / 600) * 2, g.bh * 0.4); c.fillStyle = '#e8d8b0'; for (let k = 0; k < 4; k++) { c.fillRect(sx + 3 + k * 5, g.top + g.bh * 0.3 + 2, 3, 3); c.fillRect(sx + 3 + k * 5, g.top + g.bh * 0.7 - 5, 3, 3); } return; }   // the film strip
        c.fillStyle = '#e9e5dc'; c.fillRect(g.left + g.bw - 26, g.top - 8, 20, 9); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(g.left + g.bw - 24, g.top - 7, 16, 6);   // the flash on top
        const pp = (x.t / 2000) % 1; c.fillStyle = '#ffffff'; c.fillRect(g.cx - 14, g.bot - 4, 28, 6 + pp * 18); c.fillStyle = rgba(lt(x.acc, 0.2), 0.8); c.fillRect(g.cx - 11, g.bot + 1, 22, Math.max(0, pp * 18 - 4)); },   // a photo sliding out
      inside(c, g, x) { const st = g.stage;
        if (st === 'Bit') { c.fillStyle = rgb(dk(x.body, 0.35)); c.fillRect(g.left - 2, g.top - 2, g.bw + 4, 8); c.fillRect(g.left - 2, g.bot - 6, g.bw + 4, 8); c.fillStyle = rgba(lt(x.acc, 0.3), 0.8); c.fillRect(g.left - 2, g.top + g.bh * 0.62, g.bw + 4, g.bh * 0.16); return; }
        if (st === 'Mega') { c.fillStyle = rgba(mix(x.body, [130, 88, 55], 0.7), 0.9); c.fillRect(g.left - 4, g.top - 4, g.bw + 8, g.bh + 8); c.strokeStyle = 'rgba(80,50,30,.5)'; c.lineWidth = 1.5; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(g.left, g.top + k * g.bh / 4); c.lineTo(g.left + g.bw, g.top + k * g.bh / 4); c.stroke(); } c.fillStyle = '#d9a440'; for (const [fx, fy] of [[0.06, 0.08], [0.94, 0.08], [0.06, 0.92], [0.94, 0.92]]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, 2.4, 0, 7); c.fill(); } return; }
        c.fillStyle = rgb(x.acc); for (const fx of [0.3, 0.4, 0.5]) c.fillRect(g.left + g.bw * fx, g.top - 2, g.bw * 0.08, g.bh + 4); },   // a rainbow stripe
      front(c, g, x) { const st = g.stage; if (st === 'Bit') return;
        if (st === 'Byte') { const lx = g.left + g.bw * 0.82, ly = g.top + g.bh * 0.62, r = g.bh * 0.22; c.fillStyle = '#2a2630'; c.beginPath(); c.arc(lx, ly, r + 3, 0, 7); c.fill(); c.fillStyle = '#4a5a7a'; c.beginPath(); c.arc(lx, ly, r, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(lx - r * 0.35, ly - r * 0.35, r * 0.25, 0, 7); c.fill(); return; }   // the lens
        const bx = g.left + g.bw, by0 = g.top + g.bh * 0.5, n = 4; for (let k = 0; k < n; k++) { const w = 26 - k * 3; c.fillStyle = k % 2 ? '#2a2630' : '#3a3540'; c.fillRect(bx + k * 6, by0 - w / 2, 7, w); }   // the bellows and the brass lens
        const lx = bx + n * 6 + 6; c.fillStyle = '#b8902e'; c.beginPath(); c.arc(lx, by0, 11, 0, 7); c.fill(); c.fillStyle = '#4a5a7a'; c.beginPath(); c.arc(lx, by0, 7, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(lx - 2.5, by0 - 2.5, 2, 0, 7); c.fill(); if (CAP) (CAP.hands = CAP.hands || []).push(capPt(c, lx, by0)); },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.6, g.left + g.bw * 0.14, g.top + g.bh * 0.24, g.left + g.bw * 0.34, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => g.stage === 'Byte' ? faceTwo(c, { ...g, cx: g.cx - g.bw * 0.14 }, x, look, { ey: 0.44, ex: 0.12, my: 0.66, s: 0.62 }) : faceTwo(c, g, x, look, { ey: by(g.stage, 0.34, 0.4, 0.42), ex: 0.15, my: by(g.stage, 0.52, 0.66, 0.64), s: by(g.stage, 0.58, 0.64, 0.74) })
    },
    /* Yoyo: a toy that spins. Bit is a yo-yo hanging on its string from a finger loop. Byte swings round the world: its string loops out in a circle and its rim glows with speed.
       Mega is a battle top: a cone spinning on its tip with a metal ring, sparks flying off where it grinds the floor and speed lines whipping round it */
    Yoyo: {
      dims: { Bit: [52, 52], Byte: [58, 58], Mega: [84, 70] }, ll: st => by(st, 0, 0, 14), float: true, slots: { feet: false },
      bottom(st) { return st === 'Mega' ? 168 : st === 'Bit' ? 150 : 140; }, height(st) { return this.dims[st][1] + by(st, 40, 52, 22); },
      path(c, g) { if (g.stage === 'Mega') { c.beginPath(); c.moveTo(g.left, g.top + g.bh * 0.3); c.quadraticCurveTo(g.left, g.top, g.cx, g.top); c.quadraticCurveTo(g.left + g.bw, g.top, g.left + g.bw, g.top + g.bh * 0.3); c.lineTo(g.cx + 6, g.bot); c.lineTo(g.cx - 6, g.bot); c.closePath(); return; }
        c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2, 0, 7); },
      behind(c, g, x) { const st = g.stage;
        if (st === 'Bit') { const bob = Math.sin(x.t / 400) * 3; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(g.cx, g.top + g.bh / 2); c.lineTo(g.cx, g.top - 30 + bob); c.stroke(); c.strokeStyle = rgb(x.acc); c.lineWidth = 3; c.beginPath(); c.arc(g.cx, g.top - 34 + bob, 4, 0, 7); c.stroke(); x.feet.push([g.cx, 182, 8]); return; }
        if (st === 'Byte') { const a = x.t / 300, R = 44, hx = g.cx - Math.cos(a) * R * 0.2, hy = g.top - 34; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(g.cx, g.top + g.bh / 2); c.lineTo(hx, hy); c.stroke();   // round the world
          c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy + R * 0.7, R * 0.9, a, a + 2.2); c.stroke(); c.strokeStyle = rgb(x.acc); c.lineWidth = 3; c.beginPath(); c.arc(hx, hy - 4, 4, 0, 7); c.stroke(); x.feet.push([g.cx, 182, 8]); return; }
        const sp = x.t / 60; c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.3, g.bw * (0.62 + k * 0.1), 10 + k * 3, 0, sp + k * 2, sp + k * 2 + 2.2); c.stroke(); }   // speed lines
        c.strokeStyle = '#c9ced8'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.cx, g.bot); c.lineTo(g.cx, 182); c.stroke(); x.feet.push([g.cx, 182, 6]); },
      inside(c, g, x) { const st = g.stage, sp = x.t / (st === 'Mega' ? 40 : st === 'Byte' ? 90 : 400);
        if (st === 'Mega') { c.fillStyle = 'rgba(205,210,220,.9)'; c.fillRect(g.left - 4, g.top + g.bh * 0.24, g.bw + 8, g.bh * 0.14); c.fillStyle = 'rgba(255,255,255,.6)'; for (let k = 0; k < 6; k++) { const px = g.left + ((k / 6 + sp / 6) % 1) * g.bw; c.fillRect(px, g.top + g.bh * 0.24, 4, g.bh * 0.14); }   // the metal ring and spinning stripes
          c.strokeStyle = rgba(dk(x.body, 0.3), 0.5); c.lineWidth = 3; for (let k = 0; k < 4; k++) { const fx = ((k / 4 + sp / 4) % 1); c.beginPath(); c.moveTo(g.left + g.bw * fx, g.top + g.bh * 0.4); c.lineTo(g.cx + (fx - 0.5) * 10, g.bot); c.stroke(); } return; }
        c.strokeStyle = rgba(dk(x.body, 0.35), 0.7); c.lineWidth = 3; c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2 - 3, 0, 7); c.stroke();
        if (st === 'Byte') { c.strokeStyle = rgba(lt(x.acc, 0.4), 0.8); c.lineWidth = 2.5; c.beginPath(); c.arc(g.cx, g.top + g.bh / 2, g.bw / 2 - 1, sp, sp + 4); c.stroke(); } },
      front(c, g, x) { if (g.stage !== 'Mega') return; for (let k = 0; k < 5; k++) { const ph = (x.t / 400 + k / 5) % 1, a = Math.PI + (k % 2 ? 0.3 : -0.3) + (k - 2) * 0.4; c.fillStyle = `rgba(255,${200 + k * 10},90,${1 - ph})`; c.beginPath(); c.arc(g.cx + Math.cos(a) * ph * 30 * (k % 2 ? 1 : -1), 180 - Math.abs(Math.sin(a)) * ph * 16, 1.8, 0, 7); c.fill(); } },   // sparks
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.6, g.left + g.bw * 0.18, g.top + g.bh * 0.24, g.left + g.bw * 0.38, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.16, ex: 0.16, my: 0.24, s: 0.62 } : { ey: 0.44, ex: 0.16, my: 0.66, s: by(g.stage, 0.62, 0.68, 0.7) })
    },
    /* Lava: molten wax. Bit is a wobbling blob of warm wax. Byte is a lava lamp: a tapered glass with a metal cap and base and blobs drifting up and down inside.
       Mega is a volcano: a cone of rock with the face on it, lava pouring from the crater and running down its sides, and embers shooting up */
    Lava: {
      dims: { Bit: [58, 46], Byte: [52, 84], Mega: [108, 80] }, ll: st => by(st, 4, 14, 2),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 6, 16, 40); },
      glass: true, patternAfter: true,
      path(c, g, x) { const st = g.stage, t = x ? x.t : 0;
        if (st === 'Bit') { const b = Math.sin(t / 300) * 0.06; c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.55, g.bw / 2 * (1 + b), g.bh / 2 * (1 - b), 0, 0, 7); return; }
        if (st === 'Byte') { c.beginPath(); c.moveTo(g.cx - g.bw * 0.22, g.top); c.lineTo(g.cx + g.bw * 0.22, g.top); c.quadraticCurveTo(g.left + g.bw + 4, g.top + g.bh * 0.6, g.cx + g.bw * 0.36, g.bot); c.lineTo(g.cx - g.bw * 0.36, g.bot); c.quadraticCurveTo(g.left - 4, g.top + g.bh * 0.6, g.cx - g.bw * 0.22, g.top); c.closePath(); return; }
        c.beginPath(); c.moveTo(g.left - 4, g.bot); c.quadraticCurveTo(g.left + g.bw * 0.2, g.top + g.bh * 0.4, g.cx - g.bw * 0.2, g.top + 4); c.lineTo(g.cx - g.bw * 0.12, g.top + 10); c.lineTo(g.cx + g.bw * 0.12, g.top + 10); c.lineTo(g.cx + g.bw * 0.2, g.top + 4);
        c.quadraticCurveTo(g.left + g.bw * 0.8, g.top + g.bh * 0.4, g.left + g.bw + 4, g.bot); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 0, 7), handR: st => by(st, 0, 0, 6), shoulderY: 0.66, armK: 0.7,
      behind(c, g, x) { const st = g.stage, metal = [190, 196, 206];
        if (st === 'Byte') { roundBox(c, g.cx - g.bw * 0.2, g.top - 12, g.bw * 0.4, 14, 4); c.fillStyle = rgb(dk(metal, 0.1)); c.fill(); c.fillStyle = rgb(dk(metal, 0.25)); c.beginPath(); c.moveTo(g.cx - g.bw * 0.36, g.bot - 2); c.lineTo(g.cx + g.bw * 0.36, g.bot - 2); c.lineTo(g.cx + g.bw * 0.5, 182); c.lineTo(g.cx - g.bw * 0.5, 182); c.closePath(); c.fill(); x.feet.push([g.cx, 182, g.bw * 0.4]); return; }
        if (st === 'Bit') { for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, 7, 4, dk(x.body, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 6]); } return; }
        const gl = 0.6 + 0.4 * Math.sin(x.t / 300), h0 = c.createRadialGradient(g.cx, g.top, 2, g.cx, g.top, 60); h0.addColorStop(0, `rgba(255,140,50,${0.55 * gl})`); h0.addColorStop(1, 'rgba(255,140,50,0)'); c.fillStyle = h0; c.fillRect(g.cx - 60, g.top - 60, 120, 100);   // the crater's glow and embers
        for (let k = 0; k < 8; k++) { const ph = (x.t / 900 + k / 8) % 1, px = g.cx + Math.sin(k * 2.3) * 18 * ph, py = g.top + 4 - ph * 60 + ph * ph * 30; c.fillStyle = `rgba(255,${150 + k * 10},60,${1 - ph})`; c.beginPath(); c.arc(px, py, 2.4, 0, 7); c.fill(); }
        x.feet.push([g.cx, 182, g.bw * 0.45]); },
      inside(c, g, x) { const st = g.stage, lv = mix(x.acc, [255, 110, 50], 0.6);
        if (st === 'Bit') { c.fillStyle = rgba(lt(x.body, 0.3), 0.5); for (let k = 0; k < 3; k++) { const ph = (x.t / 1800 + k / 3) % 1; c.beginPath(); c.arc(g.cx + (k - 1) * 12, g.bot - 4 - ph * g.bh * 0.7, 3 + k, 0, 7); c.fill(); } return; }
        if (st === 'Byte') { for (let k = 0; k < 4; k++) { const ph = (x.t / 3000 + k / 4) % 1, yy = g.bot - 8 - Math.abs(Math.sin(ph * Math.PI)) * (g.bh - 18), r = 6 + (k % 2) * 4, w = Math.sin(x.t / 300 + k) * 0.15; c.fillStyle = rgb(lv); c.beginPath(); c.ellipse(g.cx + (k - 1.5) * 6, yy, r * (1 + w), r * (1 - w), 0, 0, 7); c.fill(); } return; }   // blobs drifting in the lamp
        c.fillStyle = rgba(mix(x.body, [110, 90, 80], 0.6), 0.85); c.fillRect(g.left - 6, g.top - 4, g.bw + 12, g.bh + 8);   // rock, and lava running down from the crater
        c.fillStyle = rgb(lv); c.beginPath(); c.moveTo(g.cx - g.bw * 0.12, g.top + 8); c.lineTo(g.cx + g.bw * 0.12, g.top + 8);
        for (const [fx, len] of [[0.06, 0.55], [-0.08, 0.38], [0.14, 0.3]]) { } c.lineTo(g.cx + g.bw * 0.16, g.top + 18); c.quadraticCurveTo(g.cx + g.bw * 0.3, g.top + g.bh * 0.5, g.cx + g.bw * 0.34, g.top + g.bh * 0.62 + Math.sin(x.t / 500) * 2); c.quadraticCurveTo(g.cx + g.bw * 0.26, g.top + g.bh * 0.6, g.cx + g.bw * 0.2, g.top + 26);
        c.lineTo(g.cx - g.bw * 0.16, g.top + 22); c.quadraticCurveTo(g.cx - g.bw * 0.3, g.top + g.bh * 0.4, g.cx - g.bw * 0.36, g.top + g.bh * 0.5 + Math.sin(x.t / 600) * 2); c.quadraticCurveTo(g.cx - g.bw * 0.28, g.top + g.bh * 0.36, g.cx - g.bw * 0.12, g.top + 14); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,230,140,.7)'; c.beginPath(); c.ellipse(g.cx, g.top + 11, g.bw * 0.1, 2.5, 0, 0, 7); c.fill(); },
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.6, g.left + g.bw * 0.18, g.top + g.bh * 0.3, g.left + g.bw * 0.34, g.top + g.bh * 0.14],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face: (c, g, x, look) => faceTwo(c, g, x, look, g.stage === 'Mega' ? { ey: 0.58, ex: 0.13, my: 0.78, s: 0.76 } : g.stage === 'Byte' ? { ey: 0.56, ex: 0.16, my: 0.74, s: 0.6 } : { ey: 0.46, ex: 0.16, my: 0.68, s: 0.64 })
    },
    /* Pogo: bouncing. Bit is a striped rubber ball that never stops bouncing. Byte is a pogo stick: handlebars on its sides and a spring under it that it hops on.
       Mega is a jack-in-the-box: a painted box with a crank turning, its lid flung open and a jester's hat bobbing up out of it on a spring */
    Pogo: {
      dims: { Bit: [46, 46], Byte: [52, 60], Mega: [76, 70] }, ll: st => by(st, 0, 26, 6), slots: { feet: false },
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 30, 14, 64); },
      bounce(st, t) { return st === 'Mega' ? 0 : Math.abs(Math.sin(t / (st === 'Bit' ? 260 : 300))) * (st === 'Bit' ? 26 : 16); },
      path(c, g, x) { const st = g.stage, b = x ? this.bounce(st, x.t) : 0; if (st === 'Mega') { roundBox(c, g.left, g.top, g.bw, g.bh, 6); return; }
        const sq = b < 3 ? 0.08 : 0; if (st === 'Bit') { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2 - b, g.bw / 2 * (1 + sq), g.bh / 2 * (1 - sq), 0, 0, 7); return; } roundBox(c, g.left, g.top - b, g.bw, g.bh, 16); },
      arms: 'stub', armW: st => 0, handR: st => 0, shoulderY: 0.6, armK: 0.7,
      behind(c, g, x) { const st = g.stage, b = this.bounce(st, x.t);
        if (st === 'Bit') { c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(g.cx, 182, g.bw * 0.4 * (1 - b / 60), 3, 0, 0, 7); c.fill(); x.feet.push([g.cx, 182, 6]); return; }
        if (st === 'Byte') { const sy = g.bot - b, coils = 6, sl = 182 - sy; c.strokeStyle = '#9aa0ab'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.cx, sy); for (let k = 0; k <= coils * 2; k++) c.lineTo(g.cx + (k % 2 ? 9 : -9), sy + sl * k / (coils * 2)); c.stroke();   // the spring, the foot pegs and the handlebars
          c.fillStyle = '#3a3a44'; c.fillRect(g.cx - 3, 176, 6, 6); c.fillStyle = '#c9ced8'; c.fillRect(g.cx - 16, sy - 2, 32, 5); x.feet.push([g.cx, 182, 6]);
          for (const sd of [-1, 1]) { c.strokeStyle = '#5a5a62'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.4, g.top + 10 - b); c.lineTo(g.cx + sd * (g.bw * 0.5 + 12), g.top + 2 - b); c.stroke(); c.fillStyle = rgb(x.acc); roundBox(c, g.cx + sd * (g.bw * 0.5 + 12) - 5, g.top - 4 - b, 10, 10, 3); c.fill(); } return; }
        const spr = 22 + Math.abs(Math.sin(x.t / 260)) * 18, hx = g.cx + Math.sin(x.t / 400) * 6, hy = g.top - spr;   // the open lid, the spring and the jester hat
        c.save(); c.translate(g.left, g.top); c.rotate(-1.75); c.fillStyle = rgb(dk(x.acc, 0.25)); c.fillRect(0, -2, g.bw * 0.9, 16); c.fillStyle = rgb(x.acc); c.fillRect(0, 0, g.bw * 0.9, 12); c.fillStyle = '#e9b23a'; c.fillRect(0, 0, g.bw * 0.9, 2); c.restore();
        c.strokeStyle = '#c9ced8'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.cx, g.top + 2); for (let k = 0; k <= 8; k++) c.lineTo(g.cx + (k % 2 ? 8 : -8) + (hx - g.cx) * k / 8, g.top + 2 - spr * k / 8); c.stroke();
        for (const [sd, col] of [[-1, x.acc], [0, x.parts], [1, x.acc]]) { c.fillStyle = rgb(col); c.beginPath(); c.moveTo(hx - 14, hy); c.lineTo(hx + 14, hy); c.quadraticCurveTo(hx + sd * 18, hy - 16, hx + sd * 22, hy - 22 + Math.abs(sd) * 6); c.closePath(); c.fill(); c.fillStyle = '#ffe27a'; c.beginPath(); c.arc(hx + sd * 22, hy - 22 + Math.abs(sd) * 6, 3.5, 0, 7); c.fill(); }
        roundBox(c, hx - 15, hy - 3, 30, 7, 3); c.fillStyle = '#ffffff'; c.fill(); for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.34; c.fillStyle = '#b8902e'; c.beginPath(); c.arc(fx, 179, 4, 0, 7); c.fill(); x.feet.push([fx, 182, 5]); } },
      inside(c, g, x) { const st = g.stage, b = this.bounce(st, x.t);
        if (st === 'Bit') { c.fillStyle = rgba(lt(x.acc, 0.3), 0.85); c.fillRect(g.left - 4, g.top + g.bh * 0.4 - b, g.bw + 8, g.bh * 0.2); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(g.cx - g.bw * 0.2, g.top + g.bh * 0.25 - b, 4, 0, 7); c.fill(); return; }
        if (st === 'Byte') { c.fillStyle = rgba(lt(x.acc, 0.3), 0.7); for (let k = 0; k < 3; k++) c.fillRect(g.left - 4, g.top + g.bh * (0.15 + k * 0.32) - b, g.bw + 8, 4); return; }
        const cols = [x.acc, lt(x.body, 0.35)]; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = rgba(cols[(i + j) % 2], 0.55); c.fillRect(g.left + i * g.bw / 4, g.top + j * g.bh / 4, g.bw / 4, g.bh / 4); }   // a painted checkerboard
        c.strokeStyle = '#e9b23a'; c.lineWidth = 3; c.strokeRect(g.left + 2, g.top + 2, g.bw - 4, g.bh - 4); },
      front(c, g, x) { if (g.stage !== 'Mega') return; const a = x.t / 300, kx = g.left + g.bw + 6, ky = g.top + g.bh * 0.5; c.strokeStyle = '#9aa0ab'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.left + g.bw, ky); c.lineTo(kx, ky); c.lineTo(kx + Math.cos(a) * 10, ky + Math.sin(a) * 10); c.stroke(); c.fillStyle = '#d8333f'; c.beginPath(); c.arc(kx + Math.cos(a) * 10, ky + Math.sin(a) * 10, 3.5, 0, 7); c.fill(); },   // the crank
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.6, g.left + g.bw * 0.16, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face(c, g, x, look) { const b = this.bounce(g.stage, x.t); return faceTwo(c, { ...g, top: g.top - b }, x, look, { ey: by(g.stage, 0.42, 0.44, 0.42), ex: 0.16, my: by(g.stage, 0.64, 0.66, 0.66), s: by(g.stage, 0.6, 0.64, 0.76) }); }
    },
    /* ---- the four specials ---- */
    /* Kraken: a tall pointed mantle with fins, two long arms curling up behind it, a skirt of short tentacles with suckers, and a fin crest at Mega */
    Kraken: {
      special: true, dims: { Bit: [62, 70], Byte: [78, 90], Mega: [94, 108] }, tl: st => by(st, 16, 22, 28), slots: { feet: false },
      bottom(st) { return 184 - this.tl(st); }, height(st) { return this.dims[st][1] + this.tl(st) + 16; },
      path(c, g) { const R = g.left + g.bw; c.beginPath(); c.moveTo(g.left, g.bot); c.bezierCurveTo(g.left - 4, g.top + g.bh * 0.4, g.cx - g.bw * 0.2, g.top, g.cx, g.top - 6);
        c.bezierCurveTo(g.cx + g.bw * 0.2, g.top, R + 4, g.top + g.bh * 0.4, R, g.bot); c.quadraticCurveTo(g.cx, g.bot + 8, g.left, g.bot); c.closePath(); },
      behind(c, g, x) { const tl = this.tl(g.stage), lw = by(g.stage, 9, 11, 13);
        if (g.stage === 'Mega') for (const sd of [-1, 1]) { const sw = Math.sin(x.t / 470 + sd * 2) * 6, q = [g.cx + sd * g.bw * 0.2, g.bot - 10, g.cx + sd * g.bw * 1.05, g.top + g.bh * 0.8 + sw, g.cx + sd * g.bw * 1.0, g.top + g.bh * 0.3 + sw];   // a second, lower pair of arms
          limb(c, q, lw * 0.8, dk(x.parts, 0.15), sd < 0 ? x.L.armL : x.L.armR, x.t); c.fillStyle = rgb(dk(x.parts, 0.15)); c.beginPath(); c.arc(q[4] - sd * 4, q[5], lw * 0.55, 0, 7); c.fill(); }
        for (const sd of [-1, 1]) { const sw = Math.sin(x.t / 520 + sd) * 8, q = [g.cx + sd * g.bw * 0.3, g.bot - 6, g.cx + sd * g.bw * 0.95, g.top + g.bh * 0.5 + sw, g.cx + sd * g.bw * 0.7, g.top - g.bh * by(g.stage, 0.05, 0.15, 0.25) + sw];
          limb(c, q, lw, x.parts, sd < 0 ? x.L.armL : x.L.armR, x.t); c.fillStyle = rgb(x.parts); c.beginPath(); c.arc(q[4] - sd * 6, q[5], lw * 0.7, 0, 7); c.fill();
          if (g.stage !== 'Bit') { c.fillStyle = rgb(lt(x.parts, 0.4)); for (let k = 1; k <= 3; k++) { const p = qpt(q, k / 4); c.beginPath(); c.arc(p[0] - sd * 2, p[1], 2, 0, 7); c.fill(); } } }
        if (g.stage !== 'Bit') for (const sd of [-1, 1]) { c.fillStyle = rgb(dk(x.body, 0.15)); c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.22, g.top + g.bh * 0.1); c.quadraticCurveTo(g.cx + sd * g.bw * 0.62, g.top + g.bh * 0.02, g.cx + sd * g.bw * 0.48, g.top + g.bh * 0.36); c.closePath(); c.fill(); }
        const n = by(g.stage, 4, 5, 6), span = g.bw * 0.86;
        for (let i = 0; i < n; i++) { const f = i / (n - 1), tx = g.cx - span / 2 + f * span, out = (f - 0.5) * 2, sw = Math.sin(x.t / 260 + i * 1.3) * 4 + x.walk * 3, q = [tx, g.bot - 6, tx + out * 6 + sw * 0.5, g.bot + tl * 0.5, tx + out * 14 + sw, 182];
          limb(c, q, by(g.stage, 7, 8, 9), x.parts, f < 0.5 ? x.L.legL : x.L.legR, x.t); c.fillStyle = rgb(lt(x.parts, 0.35)); c.beginPath(); c.arc(q[4] + out * 3, 181, 3, 0, 7); c.fill(); } },
      inside(c, g, x) { if (g.stage === 'Byte') { c.fillStyle = rgba(lt(x.body, 0.3), 0.7); for (const [fx, fy, r] of [[0.28, 0.3, 4], [0.7, 0.26, 3], [0.22, 0.6, 3], [0.8, 0.56, 4]]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, r, 0, 7); c.fill(); } }
        if (g.stage === 'Mega') { const gl = 0.55 + Math.sin(x.t / 300) * 0.35; c.save(); c.shadowColor = rgba(lt(x.acc, 0.3), 1); c.shadowBlur = 8;   // a ring of lights that pulse down its mantle
          for (let k = 0; k < 7; k++) { const f = k / 6, px = g.left + g.bw * (0.12 + f * 0.76), py = g.top + g.bh * (0.86 - Math.sin(f * Math.PI) * 0.08); c.fillStyle = rgba(lt(x.acc, 0.5), gl * (0.6 + 0.4 * Math.sin(x.t / 200 - k))); c.beginPath(); c.arc(px, py, 3, 0, 7); c.fill(); } c.restore(); } },
      front(c, g, x) { if (g.stage === 'Mega') for (const sd of [-1, 1]) { c.fillStyle = rgb(dk(x.acc, 0.1)); c.beginPath(); c.moveTo(g.cx + sd * 6, g.top + 4);   // two curled horns
          c.quadraticCurveTo(g.cx + sd * 26, g.top - 6, g.cx + sd * 22, g.top - 24); c.quadraticCurveTo(g.cx + sd * 16, g.top - 8, g.cx + sd * 2, g.top + 8); c.closePath(); c.fill(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.66, g.left + g.bw * 0.18, g.top + g.bh * 0.24, g.cx - g.bw * 0.08, g.top + g.bh * 0.02],
      head: g => [g.cx, g.top - 4, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.56, ex: 0.18, my: 0.78, fang: true, s: by(g.stage, 0.74, 0.84, 0.92) })
    },
    /* Golem: stacked stone. A blocky body with cracks and moss, a glowing rune on its chest, boulder fists and pillar legs, crystals on its shoulders at Mega */
    Golem: {
      special: true, dims: { Bit: [72, 66], Byte: [92, 84], Mega: [110, 100] }, ll: st => by(st, 8, 11, 13),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 6 + (st === 'Mega' ? 14 : 0); },
      path(c, g) { const L = g.left, R = L + g.bw, T = g.top, B = g.bot, j = g.bw * 0.05; c.beginPath(); c.moveTo(L + j, T + 6); c.lineTo(g.cx - j, T); c.lineTo(R - j * 2, T + 4); c.lineTo(R, T + g.bh * 0.3); c.lineTo(R - j, B - 4); c.lineTo(g.cx + j, B); c.lineTo(L + j * 2, B - 2); c.lineTo(L, T + g.bh * 0.4); c.closePath(); },
      behind(c, g, x) { const ll = this.ll(g.stage);
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4, lw = by(g.stage, 14, 17, 20); roundBox(c, hx - lw / 2, g.bot - 6, lw, ll + 8 - lift, 4); c.fillStyle = rgb(dk(x.body, 0.2)); c.fill(); x.feet.push([hx, 182 - lift, lw * 0.5]); }
        const fs = by(g.stage, 10, 13, 16), sw = Math.sin(x.t / 600) * 2;
        for (const sd of [-1, 1]) { const fx = g.cx + sd * (g.bw / 2 + fs * 0.5), fy = g.top + g.bh * 0.66 + sw * sd; c.fillStyle = rgb(dk(x.parts, 0.3)); c.beginPath(); c.arc(fx, fy + 3, fs, 0, 7); c.fill(); c.fillStyle = rgb(x.parts); c.beginPath(); c.arc(fx, fy, fs, 0, 7); c.fill();
          c.strokeStyle = rgba(dk(x.parts, 0.4), 0.7); c.lineWidth = 1.6; c.beginPath(); c.moveTo(fx - fs * 0.4, fy - fs * 0.2); c.lineTo(fx + fs * 0.1, fy + fs * 0.2); c.stroke(); }
        if (g.stage === 'Mega') for (const sd of [-1, 1]) for (const [dx, h, a] of [[0, 16, 0.2], [7, 11, 0.5]]) { c.save(); c.translate(g.cx + sd * (g.bw * 0.38 + dx), g.top + 6); c.rotate(sd * a); c.fillStyle = rgb(lt(x.acc, 0.2)); c.beginPath(); c.moveTo(-4, 0); c.lineTo(0, -h); c.lineTo(4, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(-1, -2); c.lineTo(0, -h + 3); c.lineTo(1, -2); c.fill(); c.restore(); } },
      inside(c, g, x) { c.strokeStyle = rgba(dk(x.body, 0.4), 0.7); c.lineWidth = 2; c.lineCap = 'round';
        for (const pts of [[[0.18, 0.1], [0.26, 0.28], [0.2, 0.4]], [[0.86, 0.5], [0.76, 0.62], [0.8, 0.8]], [[0.4, 0.92], [0.48, 0.82]]]) { c.beginPath(); pts.forEach(([fx, fy], i) => i ? c.lineTo(g.left + g.bw * fx, g.top + g.bh * fy) : c.moveTo(g.left + g.bw * fx, g.top + g.bh * fy)); c.stroke(); }
        c.fillStyle = 'rgba(96,150,70,.85)'; for (const [fx, fy, r] of [[0.7, 0.04, 9], [0.82, 0.08, 6], [0.12, 0.62, 5]]) { c.beginPath(); c.ellipse(g.left + g.bw * fx, g.top + g.bh * fy, r, r * 0.6, 0, 0, 7); c.fill(); }
        if (g.stage !== 'Bit') { const gl = 0.6 + Math.sin(x.t / 400) * 0.3, cx = g.cx, cy = g.top + g.bh * 0.82; c.save(); c.shadowColor = rgba(x.acc, 0.9); c.shadowBlur = 10; c.strokeStyle = rgba(lt(x.acc, 0.4), gl); c.lineWidth = 2.5;
          c.beginPath(); c.moveTo(cx - 7, cy - 5); c.lineTo(cx, cy + 4); c.lineTo(cx + 7, cy - 5); c.moveTo(cx, cy - 7); c.lineTo(cx, cy + 4); c.stroke(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.46, g.left + g.bw * 0.1, g.top + g.bh * 0.16, g.left + g.bw * 0.34, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top, g.bw * 0.48],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.36, ex: 0.17, my: 0.58, s: by(g.stage, 0.72, 0.82, 0.9) })
    },
    /* Unicorn: a round body on four slim legs with gold hooves, a spiral horn, a curly mane and tail in its accent colours, and sparkles at Mega */
    Unicorn: {
      special: true, dims: { Bit: [66, 58], Byte: [84, 72], Mega: [100, 86] }, ll: st => by(st, 12, 16, 20),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 18, 24, 30); },
      path(c, g) { c.beginPath(); c.roundRect(g.left, g.top, g.bw, g.bh, [g.bw * 0.48, g.bw * 0.48, g.bh * 0.32, g.bh * 0.32]); },
      leg(c, g, x, lx, i, back) { const ll = this.ll(g.stage), lift = Math.max(0, Math.sin(x.t / 150 + i * Math.PI / 2)) * 5 * Math.abs(x.walk), lw = by(g.stage, 7, 8, 9), fy = (back ? 178 : 182) - lift, col = dk(x.body, back ? 0.18 : 0.04);
        limb(c, [lx, g.bot - 8, lx, (g.bot + fy) / 2, lx, fy - 3], lw, col, i % 2 ? x.L.legR : x.L.legL, x.t); roundBox(c, lx - lw * 0.62, fy - 4, lw * 1.24, 6, 2); c.fillStyle = '#e9b23a'; c.fill(); x.feet.push([lx, fy, lw * 0.6]); },
      behind(c, g, x) { const sw = Math.sin(x.t / 420) * 0.15; c.save(); c.translate(g.left + 4, g.top + g.bh * 0.5); c.rotate(-0.4 + sw);
          for (let k = 0; k < 3; k++) { c.fillStyle = rgb(k % 2 ? x.acc : x.parts); c.beginPath(); c.ellipse(-12 - k * 2, 4 + k * 8, 12, 7, 0.4 + k * 0.2, 0, 7); c.fill(); } c.restore();
        this.leg(c, g, x, g.cx - g.bw * 0.3, 1, true); this.leg(c, g, x, g.cx + g.bw * 0.3, 3, true);
        const n = by(g.stage, 4, 5, 6); for (let k = n - 1; k >= 0; k--) { const a = -0.2 + k * 0.42, mr = by(g.stage, 9, 11, 13), mx = g.cx + g.bw * 0.1 + Math.cos(a) * g.bw * 0.42, my = g.top + g.bh * 0.32 + Math.sin(a) * g.bh * 0.5 - g.bh * 0.12 + Math.sin(x.t / 500 + k) * 1.5;
          c.fillStyle = rgb(dk(k % 2 ? x.acc : x.parts, 0.2)); c.beginPath(); c.arc(mx, my + 2, mr, 0, 7); c.fill(); c.fillStyle = rgb(k % 2 ? x.acc : x.parts); c.beginPath(); c.arc(mx, my, mr, 0, 7); c.fill(); }
        const hx = g.cx - g.bw * 0.08, hl = by(g.stage, 20, 26, 32), hw = by(g.stage, 5, 6, 7), hb = g.top + 8, hy = hb - hl;
        c.fillStyle = '#c99a24'; c.beginPath(); c.moveTo(hx - hw, hb + 2); c.lineTo(hx + 2, hy + 2); c.lineTo(hx + hw, hb + 2); c.closePath(); c.fill();
        c.fillStyle = '#f2cf5a'; c.beginPath(); c.moveTo(hx - hw, hb); c.lineTo(hx + 1, hy); c.lineTo(hx + hw, hb); c.closePath(); c.fill();
        c.strokeStyle = '#c99a24'; c.lineWidth = 1.5; for (let k = 1; k < 4; k++) { const yy = hb - hl * k / 4, w2 = hw * (1 - k / 4); c.beginPath(); c.moveTo(hx - w2, yy + 2); c.lineTo(hx + w2, yy - 2); c.stroke(); }
        if (g.stage === 'Mega') { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,240,180,${0.35 + Math.sin(x.t / 300) * 0.15})`; c.beginPath(); c.arc(hx, hy + 4, 10, 0, 7); c.fill(); c.restore(); } },
      front(c, g, x) { this.leg(c, g, x, g.cx - g.bw * 0.22, 0, false); this.leg(c, g, x, g.cx + g.bw * 0.22, 2, false);
        for (let k = 0; k < 2; k++) { const mx = g.cx + g.bw * (0.06 + k * 0.1), my = g.top + 3 + k * 2; c.fillStyle = rgb(k % 2 ? x.acc : x.parts); c.beginPath(); c.arc(mx, my, by(g.stage, 6, 7, 8), 0, 7); c.fill(); }   // the forelock
        if (g.stage === 'Mega') for (let k = 0; k < 4; k++) { const a = x.t / 700 + k * 1.6; star(c, g.cx + Math.cos(a) * g.bw * 0.66, g.top + g.bh * 0.4 + Math.sin(a) * 18, 0.4, k % 2 ? '#fff6c4' : rgb(lt(x.acc, 0.3))); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.16, g.left + g.bw * 0.36, g.top + g.bh * 0.06],
      head: g => [g.cx - 6, g.top - 2, g.bw * 0.44],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.18, my: 0.64, s: by(g.stage, 0.76, 0.86, 0.94) })
    },
    /* Jack: a jack-o'-lantern. A ribbed pumpkin with a carved face that glows from inside, a curly stem and leaf, vine feet, and floating flames at Mega */
    Jack: {
      special: true, dims: { Bit: [76, 62], Byte: [96, 78], Mega: [114, 92] },
      bottom() { return 180; }, height(st) { return this.dims[st][1] + by(st, 18, 22, 26); },
      path(c, g) { const n = by(g.stage, 5, 5, 7), cy = g.top + g.bh / 2; c.beginPath();
        for (let i = 0; i <= 72; i++) { const a = i / 72 * Math.PI * 2, bulge = 1 + 0.045 * Math.abs(Math.cos(a * n / 2)), px = g.cx + Math.cos(a) * g.bw / 2 * bulge, py = cy + Math.sin(a) * g.bh / 2 * (1 - 0.06 * Math.abs(Math.sin(a)) * (Math.sin(a) < 0 ? 1 : 0));
          if (!i) c.moveTo(px, py); else c.lineTo(px, py); } c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.6, armK: 0.8,
      behind(c, g, x) { if (g.stage === 'Byte') for (const a of [-0.9, 0, 0.9]) { c.save(); c.translate(g.cx, g.top + 4); c.rotate(a); c.fillStyle = '#5d9134'; c.beginPath(); c.ellipse(0, -10, 6, 13, 0, 0, 7); c.fill(); c.fillStyle = '#7cb246'; c.beginPath(); c.ellipse(0, -11, 4.5, 11, 0, 0, 7); c.fill(); c.restore(); }   // a collar of leaves
        if (g.stage !== 'Mega') { c.strokeStyle = '#4f7a2c'; c.lineWidth = by(g.stage, 6, 7, 8); c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx, g.top + 6); c.quadraticCurveTo(g.cx - 2, g.top - 10, g.cx + 8, g.top - by(g.stage, 14, 18, 22)); c.stroke();
        c.fillStyle = '#6fa63a'; c.beginPath(); c.ellipse(g.cx - 12, g.top - 4, 10, 5, -0.5, 0, 7); c.fill(); c.strokeStyle = '#4f7a2c'; c.lineWidth = 2; c.beginPath(); c.moveTo(g.cx + 8, g.top - 12); c.bezierCurveTo(g.cx + 22, g.top - 20, g.cx + 24, g.top - 4, g.cx + 16, g.top - 6); c.stroke(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; blob(c, fx, 182 - lift, by(g.stage, 8, 9, 10), 5, [79, 122, 44], sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 7]); } },
      inside(c, g, x) { const n = by(g.stage, 5, 5, 7); c.strokeStyle = rgba(dk(x.body, 0.3), 0.55); c.lineWidth = 2.2;
        for (let k = 1; k < n; k++) { const f = k / n, px = g.left + g.bw * f; c.beginPath(); c.moveTo(g.cx + (px - g.cx) * 0.4, g.top + 4); c.quadraticCurveTo(px, g.top + g.bh / 2, g.cx + (px - g.cx) * 0.4, g.bot - 4); c.stroke(); } },
      front(c, g, x) {
        if (g.stage !== 'Bit') for (let k = 0; k < 5; k++) { const ph = (x.t / 1500 + k / 5) % 1; c.fillStyle = `rgba(255,${150 + k * 15},60,${0.9 * (1 - ph)})`;   // embers drifting up
          c.beginPath(); c.arc(g.cx + Math.sin(k * 2.1 + ph * 5) * g.bw * 0.35, g.top + g.bh * 0.3 - ph * 46, 1.6 + (k % 2), 0, 7); c.fill(); }
        if (g.stage !== 'Bit') for (const sd of [-1, 1]) { const ax = g.cx + sd * (g.bw / 2 - 2), ay = g.top + g.bh * 0.62; c.fillStyle = '#7cb246';   // little leaves where the vine arms grow out
          c.beginPath(); c.ellipse(ax + sd * 4, ay - 6, 5, 2.6, sd * -0.7, 0, 7); c.fill(); }
        if (g.stage === 'Mega') for (let k = 0; k < 2; k++) { const a = x.t / 900 + k * Math.PI, bx = g.cx + Math.cos(a) * g.bw * 0.75, byy = g.top - 6 + Math.sin(a * 2) * 10, fl2 = Math.sin(x.t / 70 + k) * 0.5;   // two bats circling
          c.fillStyle = '#2d2433'; c.save(); c.translate(bx, byy); c.beginPath(); c.ellipse(0, 0, 4, 3.4, 0, 0, 7); c.fill();
          for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 2, -1); c.quadraticCurveTo(sd * 8, -6 - fl2 * 6, sd * 13, -2 - fl2 * 4); c.quadraticCurveTo(sd * 9, 0, sd * 8, 3); c.quadraticCurveTo(sd * 5, 1, sd * 2, 2); c.fill(); }
          c.fillStyle = '#ffcf5a'; c.fillRect(-2, -1.4, 1.2, 1.2); c.fillRect(0.8, -1.4, 1.2, 1.2); c.restore(); }
        if (g.stage === 'Byte') { c.strokeStyle = '#4f7a2c'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.left + g.bw * 0.08, g.top + g.bh * 0.3);   // a vine curling across the top
          c.bezierCurveTo(g.left + g.bw * 0.2, g.top - 2, g.cx - 10, g.top + g.bh * 0.12, g.cx - 4, g.top + 6); c.stroke(); c.fillStyle = '#7cb246'; c.beginPath(); c.ellipse(g.left + g.bw * 0.2, g.top + g.bh * 0.12, 5, 3, -0.6, 0, 7); c.fill(); }
        if (g.stage === 'Mega') { const bob = Math.sin(x.t / 350) * 3, ly = g.top - 16 + bob, lw = g.bw * 0.36, fl = 1 + Math.sin(x.t / 70) * 0.12;   // the lid floats off and a flame burns out of the top
          c.save(); c.translate(g.cx, g.top + 4); c.scale(1, fl); c.fillStyle = 'rgba(255,150,40,.95)'; c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(16, -10, 11, 2); c.quadraticCurveTo(0, 8, -11, 2); c.quadraticCurveTo(-16, -10, 0, -30); c.fill();
          c.fillStyle = '#ffe28a'; c.beginPath(); c.moveTo(0, -16); c.quadraticCurveTo(7, -4, 4, 2); c.quadraticCurveTo(0, 5, -4, 2); c.quadraticCurveTo(-7, -4, 0, -16); c.fill(); c.restore();
          c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.ellipse(g.cx, ly + 3, lw / 2, 7, 0, 0, 7); c.fill(); c.fillStyle = rgb(x.body); c.beginPath(); c.ellipse(g.cx, ly, lw / 2, 7, 0, 0, 7); c.fill();
          c.strokeStyle = '#4f7a2c'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx, ly - 4); c.quadraticCurveTo(g.cx - 2, ly - 14, g.cx + 6, ly - 18); c.stroke();
          c.strokeStyle = 'rgba(58,26,10,.7)'; c.lineWidth = 2.5; c.beginPath(); for (let k = 0; k <= 8; k++) { const px = g.cx - lw / 2 + k * lw / 8, py = g.top + 6 + (k % 2 ? 4 : 0); k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); }
        if (g.stage === 'Mega') for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.62, fy = g.top + g.bh * 0.2 + Math.sin(x.t / 300 + sd) * 5, fl = 1 + Math.sin(x.t / 80 + sd) * 0.1;
          c.save(); c.translate(fx, fy); c.scale(1, fl); c.fillStyle = 'rgba(255,170,60,.92)'; c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(7, -2, 5, 4); c.arc(0, 4, 5, 0, Math.PI); c.quadraticCurveTo(-7, -2, 0, -12); c.fill(); c.fillStyle = '#fff6c4'; c.beginPath(); c.arc(0, 3, 2.5, 0, 7); c.fill(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.18, g.left + g.bw * 0.36, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top - 4, g.bw * 0.46],
      /* the carved face: triangle eyes and a jagged grin cut out of the pumpkin, lit from inside; the shapes change with the mood */
      face(c, g, x, look) { const s = by(g.stage, 0.86, 1, 1.12), ey = g.top + g.bh * 0.4, ex = g.bw * 0.2, my = g.top + g.bh * 0.66, fl = 0.85 + Math.sin(x.t / 90) * 0.1 + Math.sin(x.t / 37) * 0.05;
        const glow = `rgba(255,${Math.round(200 * fl)},80,1)`, cut = '#3a1a0a', e = x.P.eyes, lx = look[0] * 2;
        { const gr = c.createRadialGradient(g.cx, (ey + my) / 2, 4, g.cx, (ey + my) / 2, g.bw * 0.55); gr.addColorStop(0, `rgba(255,190,80,${0.38 * fl})`); gr.addColorStop(1, 'rgba(255,190,80,0)');   // candlelight on the skin around the cuts
          c.save(); this.path(c, g, x); c.clip(); c.fillStyle = gr; c.fillRect(g.left, g.top, g.bw, g.bh); c.restore(); }
        const hole = fn => { c.fillStyle = cut; c.save(); c.translate(0, 1.5); fn(); c.fill(); c.restore(); c.fillStyle = glow; fn(); c.fill(); };
        for (const sd of [-1, 1]) { const cx = g.cx + sd * ex + lx;
          if (e === 'shut' || e === 'happy') hole(() => { c.beginPath(); c.moveTo(cx - 8 * s, ey + 3 * s); c.lineTo(cx, ey - 5 * s); c.lineTo(cx + 8 * s, ey + 3 * s); c.lineTo(cx, ey - 1 * s); c.closePath(); });
          else if (e === 'hurt' || e === 'dizzy' || e === 'ko') hole(() => { c.beginPath(); c.moveTo(cx - 7 * s, ey - 6 * s); c.lineTo(cx + 3 * s, ey); c.lineTo(cx - 7 * s, ey + 6 * s); c.lineTo(cx - 3 * s, ey); c.closePath(); });
          else hole(() => { c.beginPath(); c.moveTo(cx - 8 * s, ey + 6 * s); c.lineTo(cx + 8 * s, ey + 6 * s); c.lineTo(cx + (e === 'fierce' ? -sd * 2 : 0) * s, ey - 8 * s); c.closePath(); }); }
        hole(() => { c.beginPath(); c.moveTo(g.cx - 4 * s, ey + 13 * s); c.lineTo(g.cx + 4 * s, ey + 13 * s); c.lineTo(g.cx, ey + 8 * s); c.closePath(); });
        const mw = g.bw * 0.3, sad = x.P.frown || x.P.ouch || e === 'sad', op = 9 + x.open * 8;
        // a grin: the top edge curves down with two square teeth hanging into the cut, the bottom edge curves deeper; a sad face flips it
        const dir = sad ? -1 : 1, Y = v => my + dir * v * s, tw = mw * 0.18;
        hole(() => { c.beginPath(); c.moveTo(g.cx - mw, Y(-4)); c.quadraticCurveTo(g.cx - mw * 0.5, Y(3), g.cx - tw * 2, Y(4));
          c.lineTo(g.cx - tw * 2, Y(9)); c.lineTo(g.cx - tw, Y(9)); c.lineTo(g.cx - tw, Y(4.5)); c.lineTo(g.cx + tw, Y(4.5)); c.lineTo(g.cx + tw, Y(9)); c.lineTo(g.cx + tw * 2, Y(9)); c.lineTo(g.cx + tw * 2, Y(4));
          c.quadraticCurveTo(g.cx + mw * 0.5, Y(3), g.cx + mw, Y(-4)); c.quadraticCurveTo(g.cx + mw * 0.6, Y(op + 6), g.cx, Y(op + 7)); c.quadraticCurveTo(g.cx - mw * 0.6, Y(op + 6), g.cx - mw, Y(-4)); c.closePath(); });
        return { my, ey, ex, s: s * 0.9, cx: g.cx }; }
    },

    /* ---------- the twenty specials of 16 Nov 2026, in groups of five ---------- */
    /* Tengu: a mountain spirit. A red egg body with a long nose, a small black cap and stubby feet; a leaf fan, wooden sandals and white pom-poms from Byte; black feathered wings, a white mane and white brows at Mega */
    Tengu: {
      special: true, dims: { Bit: [64, 62], Byte: [80, 78], Mega: [94, 90] }, ll: st => by(st, 5, 10, 12),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 18, 30); },
      path(c, g) { const T = g.top, B = g.bot, h = g.bw / 2; c.beginPath(); c.moveTo(g.cx, T);
        c.bezierCurveTo(g.cx + h * 0.86, T, g.cx + h, T + g.bh * 0.5, g.cx + h, T + g.bh * 0.66); c.bezierCurveTo(g.cx + h, B, g.cx + h * 0.4, B, g.cx, B);
        c.bezierCurveTo(g.cx - h * 0.4, B, g.cx - h, B, g.cx - h, T + g.bh * 0.66); c.bezierCurveTo(g.cx - h, T + g.bh * 0.5, g.cx - h * 0.86, T, g.cx, T); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.66,
      behind(c, g, x) { const ll = this.ll(g.stage);
        if (g.stage === 'Mega') { const fl = Math.sin(x.t / 380) * 0.08;
          for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.28, g.top + g.bh * 0.46); c.scale(sd, 1); c.rotate(-0.5 - fl);   // black feathered wings
            for (let i = 5; i >= 0; i--) { const L = 54 - i * 5; c.save(); c.rotate(-0.55 + i * 0.3);
              c.fillStyle = '#17131c'; c.beginPath(); c.ellipse(L * 0.55, 2.5, L * 0.58, 7.5, 0, 0, 7); c.fill();
              c.fillStyle = i % 2 ? '#38323f' : '#4a4356'; c.beginPath(); c.ellipse(L * 0.55, 0, L * 0.58, 7, 0, 0, 7); c.fill();
              c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(4, 0); c.lineTo(L * 0.95, 0); c.stroke(); c.restore(); }
            c.restore(); }
          for (const [fx, fy, r] of [[-0.5, 0.42, 11], [0.5, 0.42, 11], [-0.44, 0.2, 13], [0.44, 0.2, 13], [-0.3, 0.02, 14], [0.3, 0.02, 14], [-0.12, -0.08, 14], [0.12, -0.08, 14]]) {   // a white mane round the head
            c.fillStyle = '#cfc9c0'; c.beginPath(); c.arc(g.cx + fx * g.bw, g.top + fy * g.bh + 8, r, 0, 7); c.fill();
            c.fillStyle = '#f4f1ea'; c.beginPath(); c.arc(g.cx + fx * g.bw, g.top + fy * g.bh + 6, r, 0, 7); c.fill(); } }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4, fy = 182 - lift, mat = sd < 0 ? x.L.legL : x.L.legR;
          if (g.stage === 'Bit') { blob(c, fx, fy, 8, 4.5, dk(x.body, 0.15), mat, x.t, 'foot'); x.feet.push([fx, fy, 7]); continue; }
          limb(c, [fx, g.bot - 6, fx, fy - ll / 2, fx, fy - 8], 7, dk(x.body, 0.12), mat, x.t);   // a wooden sandal on one tall tooth
          c.fillStyle = '#5c3f26'; c.fillRect(fx - 3, fy - 4, 6, 5);
          roundBox(c, fx - 11, fy - 9, 22, 5.5, 2); c.fillStyle = '#9a7048'; c.fill();
          c.strokeStyle = '#c8402e'; c.lineWidth = 2; c.beginPath(); c.moveTo(fx - 6, fy - 9); c.lineTo(fx, fy - 13); c.lineTo(fx + 6, fy - 9); c.stroke();
          x.feet.push([fx, fy - 7, 8]); } },
      front(c, g, x) { const cs = by(g.stage, 0.8, 0.95, 1.05), cy = g.top + by(g.stage, 3, 3, 1);
        c.save(); c.translate(g.cx, cy); c.scale(cs, cs); c.fillStyle = '#17131a';   // the small black cap
        c.beginPath(); c.moveTo(-9, 3); c.lineTo(-7, -7); c.lineTo(0, -11); c.lineTo(7, -7); c.lineTo(9, 3); c.quadraticCurveTo(0, 6, -9, 3); c.fill();
        c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.moveTo(-5.5, -5); c.lineTo(0, -8.5); c.lineTo(0, 1); c.lineTo(-6, 1.5); c.closePath(); c.fill(); c.restore();
        if (g.stage === 'Bit') return;
        const n = by(g.stage, 0, 2, 4), y0 = g.top + g.bh * 0.88, w = g.bw * by(g.stage, 0, 0.3, 0.48), r = by(g.stage, 0, 5, 5.5);   // white pom-poms on a cord
        c.strokeStyle = rgb(dk(x.body, 0.45)); c.lineWidth = 2; c.beginPath(); c.moveTo(g.cx - w * 0.8, y0 - 8); c.quadraticCurveTo(g.cx, y0 + 4, g.cx + w * 0.8, y0 - 8); c.stroke();
        for (let i = 0; i < n; i++) { const f = i / (n - 1), px = g.cx - w / 2 + f * w, py = y0 - 3 + Math.sin(f * Math.PI) * 3;
          c.fillStyle = '#d6d0c6'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.beginPath(); c.arc(px + Math.cos(a) * r * 0.55, py + 1 + Math.sin(a) * r * 0.55, r * 0.6, 0, 7); c.fill(); }
          c.fillStyle = '#fbf8f2'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.beginPath(); c.arc(px + Math.cos(a) * r * 0.5, py + Math.sin(a) * r * 0.5, r * 0.55, 0, 7); c.fill(); } }
        const a = x.P.arm[1], sx = g.cx + g.bw / 2 - 4, sy = g.top + g.bh * this.shoulderY, fs = by(g.stage, 0, 0.85, 1.15);   // the leaf fan in its right hand
        c.save(); c.translate(sx + a[2], sy + a[3]); c.rotate(0.3); c.scale(fs, fs);
        c.strokeStyle = '#6b4a2e'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -10); c.stroke();
        for (let k = 0; k < 7; k++) { c.save(); c.translate(0, -10); c.rotate(-Math.PI / 2 + (k - 3) * 0.36);
          c.fillStyle = rgb(dk(x.acc, 0.25)); c.beginPath(); c.ellipse(11, 1.2, 11, 4.2, 0, 0, 7); c.fill(); c.fillStyle = rgb(x.acc); c.beginPath(); c.ellipse(11, 0, 11, 4, 0, 0, 7); c.fill();
          c.strokeStyle = rgba(lt(x.acc, 0.5), 0.8); c.lineWidth = 1; c.beginPath(); c.moveTo(3, 0); c.lineTo(19, 0); c.stroke(); c.restore(); }
        c.fillStyle = rgb(dk(x.acc, 0.1)); c.beginPath(); c.arc(0, -10, 4, 0, 7); c.fill(); c.restore(); },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.56, g.left + g.bw * 0.16, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top - 6, g.bw * 0.4],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.38, ex: 0.2, my: 0.78, s: by(g.stage, 0.72, 0.82, 0.9) }), s = fi.s, nl = by(g.stage, 17, 26, 34), ny = fi.ey + 15 * s;
        if (g.stage === 'Mega' && !x.back) for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * fi.ex, fi.ey - 13 * s); c.rotate(sd * 0.3); c.fillStyle = '#f4f1ea';   // bushy white brows
          for (const k of [-1, 0, 1]) { c.beginPath(); c.ellipse(k * 5 * s, k * sd * 0.5, 6 * s, 3.6 * s, 0, 0, 7); c.fill(); } c.restore(); }
        c.save(); c.translate(g.cx + 1, ny); c.rotate(-0.16);   // the long nose
        const nose = dy => { c.beginPath(); c.moveTo(-2, -7 * s + dy); c.quadraticCurveTo(nl * 0.55, -5 * s + dy, nl, dy - 1); c.quadraticCurveTo(nl + 4, dy + 1.5, nl - 1, dy + 3.5); c.quadraticCurveTo(nl * 0.55, 6.5 * s + dy, -2, 7 * s + dy); c.closePath(); };
        nose(2.5); c.fillStyle = rgb(dk(x.body, 0.45)); c.fill(); nose(0); c.fillStyle = rgb(lt(x.body, 0.1)); c.fill(); c.strokeStyle = rgb(dk(x.body, 0.4)); c.lineWidth = 1.5; c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(2, -2.5 * s); c.lineTo(nl * 0.75, -1.5 * s); c.stroke(); c.restore();
        return fi; }
    },
    /* Tanuki: a raccoon dog. A round body with a pale belly, a dark mask round its eyes, round ears, a ringed tail and a leaf on its head; a straw hat on its back from Byte; the hat on its head, a gourd and floating leaves at Mega */
    Tanuki: {
      special: true, dims: { Bit: [70, 60], Byte: [88, 76], Mega: [104, 90] }, ll: st => by(st, 4, 6, 8),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 16, 30); },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.6,
      hatRim(c, cx, cy, w) { c.fillStyle = '#a8813c'; c.beginPath(); c.ellipse(cx, cy + 2, w, w * 0.3, 0, 0, 7); c.fill(); c.fillStyle = '#dcb866'; c.beginPath(); c.ellipse(cx, cy, w, w * 0.3, 0, 0, 7); c.fill();
        c.fillStyle = '#e8c87a'; c.beginPath(); c.moveTo(cx - w * 0.62, cy); c.quadraticCurveTo(cx, cy - w * 0.62, cx + w * 0.62, cy); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(120,84,30,.5)'; c.lineWidth = 1.2; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(cx + k * w * 0.22, cy + w * 0.2); c.lineTo(cx + k * w * 0.08, cy - w * 0.32); c.stroke(); } },
      behind(c, g, x) { const dark = dk(x.parts, 0.05);
        if (g.stage === 'Byte') { c.save(); c.translate(g.cx - g.bw * 0.4, g.top + g.bh * 0.34); c.rotate(-0.5); c.fillStyle = '#a8813c'; c.beginPath(); c.arc(0, 2, 26, 0, 7); c.fill();   // the straw hat slung on its back
          c.fillStyle = '#dcb866'; c.beginPath(); c.arc(0, 0, 26, 0, 7); c.fill(); c.strokeStyle = 'rgba(120,84,30,.45)'; c.lineWidth = 1.2; for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(0, 0, k * 7, 0, 7); c.stroke(); } c.restore(); }
        const tl = g.bh * by(g.stage, 0.55, 0.72, 0.9), sw = Math.sin(x.t / 520) * 4, q = [g.cx + g.bw * 0.3, g.bot - 10, g.cx + g.bw * 0.68 + sw, g.bot - 4, g.cx + g.bw * 0.6 + sw, g.bot - 10 - tl], rr = by(g.stage, 9, 11, 13);
        for (let i = 0; i <= 10; i++) { const f = i / 10, p = qpt(q, f), r = rr * (0.7 + Math.sin(Math.min(f, 0.9) * Math.PI) * 0.45); c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.arc(p[0], p[1] + 2, r, 0, 7); c.fill(); }
        for (let i = 0; i <= 10; i++) { const f = i / 10, p = qpt(q, f), r = rr * (0.7 + Math.sin(Math.min(f, 0.9) * Math.PI) * 0.45); c.fillStyle = rgb(f > 0.88 || Math.floor(f * 6) % 2 ? dark : lt(x.body, 0.08)); c.beginPath(); c.arc(p[0], p[1], r, 0, 7); c.fill(); }   // a ringed tail
        for (const sd of [-1, 1]) { const ex = g.cx + sd * g.bw * 0.3, ey = g.top + g.bh * 0.08, er = by(g.stage, 9, 11, 12);   // round ears
          c.fillStyle = rgb(dark); c.beginPath(); c.arc(ex, ey, er, 0, 7); c.fill(); c.fillStyle = rgb(dk(x.body, 0.18)); c.beginPath(); c.arc(ex, ey + 2, er * 0.55, 0, 7); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; limb(c, [fx, g.bot - 8, fx, g.bot - 1 - lift / 2, fx, 180 - lift], by(g.stage, 9, 11, 13), dark, sd < 0 ? x.L.legL : x.L.legR, x.t); blob(c, fx, 182 - lift, by(g.stage, 9, 10, 12), 5, dark, sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 8]); } },
      inside(c, g, x) { const dark = dk(x.parts, 0.05);
        c.fillStyle = rgb(lt(x.body, 0.5)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.26, g.bw * 0.32, g.bh * 0.32, 0, 0, 7); c.fill();   // the pale belly
        if (g.stage === 'Mega') { c.strokeStyle = rgba(dk(x.body, 0.1), 0.35); c.lineWidth = 2; c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.24, g.bw * 0.22, g.bh * 0.2, 0, 0, 7); c.stroke(); }
        if (x.back) return;
        c.fillStyle = rgb(lt(x.body, 0.55)); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.62, g.bw * 0.17, g.bh * 0.12, 0, 0, 7); c.fill();   // a pale muzzle
        c.fillStyle = rgb(lt(x.body, 0.4)); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.2, g.bw * 0.08, g.bh * 0.12, 0, 0, 7); c.fill();
        for (const sd of [-1, 1]) { c.fillStyle = rgb(dark); c.beginPath(); c.ellipse(g.cx + sd * g.bw * 0.21, g.top + g.bh * 0.45, g.bw * 0.17, g.bh * 0.15, sd * 0.4, 0, 7); c.fill(); } },   // the dark mask
      front(c, g, x) { const lf = (lx, ly, a, sz) => { c.save(); c.translate(lx, ly); c.rotate(a); c.fillStyle = rgb(dk(x.acc, 0.2)); c.beginPath(); c.ellipse(0, -sz + 1, sz * 0.5, sz, 0, 0, 7); c.fill();
          c.fillStyle = rgb(x.acc); c.beginPath(); c.ellipse(0, -sz, sz * 0.5, sz, 0, 0, 7); c.fill(); c.strokeStyle = rgb(dk(x.acc, 0.3)); c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 2); c.lineTo(0, -sz * 1.7); c.stroke(); c.restore(); };
        if (g.stage === 'Mega') { const hy = g.top + 6; this.hatRim(c, g.cx, hy, g.bw * 0.46); lf(g.cx + 2, hy - g.bw * 0.2, 0.2, 9);   // the hat on its head with the leaf on top
          const gx = g.left + 8, gy = g.top + g.bh * 0.72 + Math.sin(x.t / 600) * 1.5;   // a gourd on a cord
          c.strokeStyle = '#7a4e2a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(gx + 6, g.top + g.bh * 0.5); c.lineTo(gx, gy - 12); c.stroke();
          c.fillStyle = '#b8742e'; c.beginPath(); c.arc(gx, gy + 5, 8, 0, 7); c.fill(); c.beginPath(); c.arc(gx, gy - 5, 5.5, 0, 7); c.fill(); c.fillStyle = '#d99a4c'; c.beginPath(); c.arc(gx - 2, gy + 3, 6, 0, 7); c.fill(); c.beginPath(); c.arc(gx - 1, gy - 6, 4, 0, 7); c.fill();
          c.fillStyle = '#c8402e'; c.fillRect(gx - 5, gy - 1.5, 10, 2.5);
          for (let k = 0; k < 3; k++) { const ph = (x.t / 2600 + k / 3) % 1, lx = g.cx + Math.sin(k * 2.3 + ph * 6) * g.bw * 0.7, ly = g.top + g.bh * 0.9 - ph * g.bh * 1.2;
            c.save(); c.globalAlpha = Math.sin(ph * Math.PI); lf(lx, ly, ph * 6 + k, 6); c.restore(); } }
        else lf(g.cx + 3, g.top + 4, 0.25, by(g.stage, 7, 8, 8)); },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.34, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.45, ex: 0.21, my: 0.7, s: by(g.stage, 0.74, 0.82, 0.9) }), s = fi.s;
        if (!x.back) { c.fillStyle = '#2a1e1c'; c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.58, 4.5 * s, 3.4 * s, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(g.cx - 1.4 * s, g.top + g.bh * 0.58 - 1.2 * s, 1.2 * s, 0, 7); c.fill(); }
        return fi; }
    },
    /* Mermaid: a round body on a curling fish tail with a fin at the end and a shell on its head; hair, three shells and scales from Byte; long hair, five shells with a pearl, a pearl strand, a big raised fin and bubbles at Mega */
    Mermaid: {
      special: true, dims: { Bit: [62, 56], Byte: [76, 68], Mega: [90, 80] }, tl: st => by(st, 16, 20, 24), slots: { feet: false },
      bottom(st) { return 182 - this.tl(st); }, height(st) { return this.dims[st][1] + this.tl(st) + by(st, 12, 16, 28); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bh * 0.48); },
      arms: 'stub', armW: st => by(st, 0, 5.5, 6.5), handR: st => by(st, 0, 4.5, 5.5), shoulderY: 0.62,
      shell(c, px, py, sz, col, a = 0) { c.save(); c.translate(px, py); c.rotate(a); c.scale(sz, sz);
        c.fillStyle = rgb(dk(col, 0.25)); c.beginPath(); c.moveTo(0, 3); c.lineTo(-8, -4); c.arc(0, -4, 8, Math.PI, 0); c.closePath(); c.fill();
        c.fillStyle = rgb(col); c.beginPath(); c.moveTo(0, 2); c.lineTo(-8, -5); c.arc(0, -5, 8, Math.PI, 0); c.closePath(); c.fill();
        c.strokeStyle = rgb(dk(col, 0.2)); c.lineWidth = 0.9; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(0, 2); c.lineTo(k * 3.4, -11.5 + Math.abs(k) * 0.9); c.stroke(); }
        c.fillStyle = rgb(dk(col, 0.1)); c.fillRect(-3, 1, 6, 3); c.restore(); },
      behind(c, g, x) { const tl = this.tl(g.stage), hair = dk(x.parts, 0.05);
        if (g.stage !== 'Bit') { const n = by(g.stage, 0, 2, 4), len = g.bh * by(g.stage, 0, 0.55, 1.05);   // hair falling behind its shoulders
          for (const sd of [-1, 1]) for (let i = 0; i < n; i++) { const hx = g.cx + sd * g.bw * (0.32 + i * 0.07), sw = Math.sin(x.t / 600 + i + sd) * 3;
            c.strokeStyle = rgb(i % 2 ? dk(hair, 0.15) : hair); c.lineWidth = by(g.stage, 0, 13, 14) - i; c.lineCap = 'round';
            c.beginPath(); c.moveTo(hx - sd * 8, g.top + 8); c.bezierCurveTo(hx + sd * 10 + sw, g.top + len * 0.35, hx - sd * 4 - sw, g.top + len * 0.7, hx + sd * 6 + sw, g.top + len); c.stroke(); } }
        const end = by(g.stage, [g.cx + g.bw * 0.74, 168], [g.cx + g.bw * 0.86, g.top + g.bh * 0.55], [g.cx + g.bw * 0.78, g.top + g.bh * 0.24]), sw = Math.sin(x.t / 500) * 3;
        const q = [g.cx + g.bw * 0.1, g.bot - 6, g.cx + g.bw * 0.72, 190, end[0] + sw, end[1]], w0 = g.bw * 0.27;   // the fish tail, tapering as it curls up
        for (const pass of [0, 1]) for (let i = 0; i <= 18; i++) { const f = i / 18, p = qpt(q, f), r = w0 * (1 - f * 0.78);
          c.fillStyle = rgb(pass ? (i % 2 ? x.body : lt(x.body, 0.04)) : dk(x.body, 0.3)); c.beginPath(); c.arc(p[0], p[1] + (pass ? 0 : 2.5), r, 0, 7); c.fill(); }
        c.strokeStyle = rgba(lt(x.body, 0.4), 0.7); c.lineWidth = 1.4; for (let i = 2; i < 15; i += 2) { const f = i / 18, p = qpt(q, f), r = w0 * (1 - f * 0.78) * 0.5;   // scales
          c.beginPath(); c.arc(p[0], p[1] - r * 0.3, r, 0.2, Math.PI - 0.2); c.stroke(); }
        const nrm = qnorm(q, 1), ang = Math.atan2(q[5] - q[3], q[4] - q[2]), fs = by(g.stage, 1.1, 1.35, 1.5);   // the fin
        c.save(); c.translate(q[4], q[5]); c.rotate(ang + Math.sin(x.t / 300) * 0.12); c.scale(fs, fs);
        for (const sd of [-1, 1]) { const lobe = d => { c.beginPath(); c.moveTo(-2, 0); c.bezierCurveTo(2, sd * 10 + d, 10, sd * 15 + d, 19, sd * 14 + d); c.quadraticCurveTo(13, sd * 5 + d, 2, d); c.closePath(); };
          lobe(2); c.fillStyle = rgb(dk(x.parts, 0.25)); c.fill(); lobe(0); c.fillStyle = rgb(x.parts); c.fill();
          c.strokeStyle = rgba(lt(x.parts, 0.45), 0.8); c.lineWidth = 1; for (const f of [0.4, 0.7]) { c.beginPath(); c.moveTo(1, 0); c.lineTo(18 * f + 4, sd * 13 * f); c.stroke(); } }
        c.restore(); void nrm; },
      inside(c, g, x) { if (g.stage === 'Bit') return; c.strokeStyle = rgba(lt(x.body, 0.4), 0.6); c.lineWidth = 1.4;
        for (let row = 0; row < 2; row++) for (let k = 0; k < 6; k++) { const px = g.left + g.bw * (0.12 + k * 0.16 + row * 0.08), py = g.bot - 6 - row * 6; c.beginPath(); c.arc(px, py, 5, 0.2, Math.PI - 0.2); c.stroke(); } },
      front(c, g, x) { const sc = lt(x.acc, 0.3), hair = dk(x.parts, 0.05);
        if (g.stage !== 'Bit') for (const sd of [-1, 1]) { c.fillStyle = rgb(hair); c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.1, g.top + 1);   // locks over the forehead and down the sides of the face
          c.quadraticCurveTo(g.cx + sd * g.bw * 0.46, g.top - 2, g.cx + sd * g.bw * 0.5, g.top + g.bh * 0.42); c.quadraticCurveTo(g.cx + sd * g.bw * 0.42, g.top + g.bh * 0.2, g.cx + sd * g.bw * 0.16, g.top + g.bh * 0.12); c.closePath(); c.fill(); }
        if (g.stage === 'Mega') { const py = g.top + g.bh * 0.86; c.fillStyle = '#fbf6ee'; for (let k = 0; k < 9; k++) { const f = k / 8; c.beginPath(); c.arc(g.cx - g.bw * 0.28 + f * g.bw * 0.56, py - Math.sin(f * Math.PI) * -5, 2.6, 0, 7); c.fill(); }   // a pearl strand
          for (let k = 0; k < 4; k++) { const ph = (x.t / 1800 + k / 4) % 1; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - ph)})`; c.lineWidth = 1.2; c.beginPath(); c.arc(g.cx + Math.sin(k * 2.4) * g.bw * 0.6, g.top + g.bh * 0.6 - ph * 60, 2 + k % 2 * 1.5, 0, 7); c.stroke(); } }   // bubbles
        const n = by(g.stage, 1, 3, 5), span = by(g.stage, 0, 0.36, 0.56) * g.bw;   // a crown of shells
        for (let i = 0; i < n; i++) { const f = n === 1 ? 0.5 : i / (n - 1), a = (f - 0.5) * 0.9, mid = 1 - Math.abs(f - 0.5) * 2;
          this.shell(c, g.cx - span / 2 + f * span + (n === 1 ? 6 : 0), g.top + 4 - mid * 4, by(g.stage, 0.75, 0.75, 0.8) * (0.8 + mid * 0.3), sc, a); }
        if (g.stage === 'Mega') { c.fillStyle = '#fbf6ee'; c.beginPath(); c.arc(g.cx, g.top - 11, 4, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(g.cx - 1.3, g.top - 12.3, 1.3, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.56, g.left + g.bw * 0.16, g.top + g.bh * 0.22, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top - 2, g.bw * 0.44],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.48, ex: 0.19, my: 0.72, s: by(g.stage, 0.74, 0.82, 0.9) })
    },
    /* Diwata: a forest fairy that floats. A bud-shaped body with petal wings and a flower on its head; four wings, a flower crown and a leaf skirt from Byte; six glowing wings, vine hair with blossoms and drifting lights at Mega */
    Diwata: {
      special: true, float: true, dims: { Bit: [58, 60], Byte: [70, 74], Mega: [82, 86] }, slots: { feet: false },
      bottom(st) { return by(st, 168, 164, 160); }, height(st) { return this.dims[st][1] + by(st, 34, 40, 52); },
      path(c, g) { const r = g.bw / 2, cy = g.top + r; c.beginPath(); c.arc(g.cx, cy, r, Math.PI, 0); c.bezierCurveTo(g.left + g.bw, cy + (g.bot - cy) * 0.6, g.cx + r * 0.4, g.bot, g.cx, g.bot);
        c.bezierCurveTo(g.cx - r * 0.4, g.bot, g.left, cy + (g.bot - cy) * 0.6, g.left, cy); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 5, 6), handR: st => by(st, 0, 4.5, 5), shoulderY: 0.58,
      flower(c, px, py, sz, petal, mid) { c.save(); c.translate(px, py); c.scale(sz, sz); for (let k = 0; k < 5; k++) { c.save(); c.rotate(k / 5 * Math.PI * 2); c.fillStyle = rgb(dk(petal, 0.12)); c.beginPath(); c.ellipse(0, -5.5, 3.6, 5.2, 0, 0, 7); c.fill();
          c.fillStyle = rgb(petal); c.beginPath(); c.ellipse(0, -5, 3.2, 4.6, 0, 0, 7); c.fill(); c.restore(); } c.fillStyle = rgb(mid); c.beginPath(); c.arc(0, 0, 3, 0, 7); c.fill(); c.restore(); },
      behind(c, g, x) { const fl = Math.sin(x.t / 150) * 0.12, pet = lt(x.body, 0.55), rim = lt(x.body, 0.15), mega = g.stage === 'Mega';
        const wing = (sd, a, L, W) => { c.save(); c.translate(g.cx + sd * g.bw * 0.16, g.top + g.bh * 0.5); c.scale(sd, 1); c.rotate(a - fl * (a < 0 ? 1 : -0.6));
          const shp = () => { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(L * 0.25, -W, L * 0.9, -W * 0.9, L, 0); c.bezierCurveTo(L * 0.9, W * 0.7, L * 0.25, W * 0.8, 0, 0); c.closePath(); };
          if (mega) { c.save(); c.shadowColor = rgba(lt(x.body, 0.6), 0.9); c.shadowBlur = 14; shp(); c.fillStyle = rgba(pet, 0.85); c.fill(); c.restore(); }
          shp(); c.fillStyle = rgba(pet, 0.9); c.fill(); c.strokeStyle = rgb(rim); c.lineWidth = 2; c.stroke();
          c.strokeStyle = rgba([255, 255, 255], 0.8); c.lineWidth = 1.2; c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(L * 0.5, -W * 0.2, L * 0.88, 0); c.stroke(); c.restore(); };
        const set = by(g.stage, [[-0.55, 38, 13]], [[-0.6, 48, 16], [0.45, 30, 10]], [[-0.85, 50, 15], [-0.25, 58, 17], [0.5, 38, 12]]);
        for (const sd of [-1, 1]) for (let i = set.length - 1; i >= 0; i--) wing(sd, ...set[i]);
        if (mega) for (const sd of [-1, 1]) { c.strokeStyle = rgb(dk(x.parts, 0.1)); c.lineWidth = 5; c.lineCap = 'round'; const sw = Math.sin(x.t / 700 + sd) * 4;   // vine hair trailing down
          c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.3, g.top + 6); c.bezierCurveTo(g.cx + sd * g.bw * 0.72, g.top + g.bh * 0.3, g.cx + sd * g.bw * 0.46 + sw, g.top + g.bh * 0.8, g.cx + sd * g.bw * 0.66 + sw, g.bot + 14); c.stroke();
          for (const f of [0.35, 0.7, 1]) { const px = g.cx + sd * g.bw * (0.62 - f * 0.05) + (f === 1 ? sw : sw * f), py = g.top + g.bh * (0.3 + f * 0.6) + (f === 1 ? 14 : 0); this.flower(c, px, py, 0.6, lt(x.body, 0.4), x.acc); } } },
      front(c, g, x) { const pet = lt(x.body, 0.42), leafC = x.parts;
        if (g.stage !== 'Bit') { const n = by(g.stage, 0, 5, 7);   // a skirt of leaves round the bottom
          for (let i = 0; i < n; i++) { const f = i / (n - 1), a = (f - 0.5) * 1.6, px = g.cx + (f - 0.5) * g.bw * 0.5, py = g.bot - g.bh * 0.12 - Math.sin(f * Math.PI) * -2;
            c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = rgb(dk(leafC, 0.25)); c.beginPath(); c.ellipse(0, 9, 5, 11, 0, 0, 7); c.fill(); c.fillStyle = rgb(i % 2 ? leafC : lt(leafC, 0.12)); c.beginPath(); c.ellipse(0, 8, 4.6, 10, 0, 0, 7); c.fill();
            c.strokeStyle = rgba(dk(leafC, 0.3), 0.7); c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 16); c.stroke(); c.restore(); } }
        const n = by(g.stage, 1, 3, 5), span = by(g.stage, 0, 0.5, 0.7) * g.bw;   // flowers on its head
        if (g.stage !== 'Bit') for (let i = 0; i < n + 1; i++) { const f = i / n, px = g.cx - span / 2 + f * span - span / n / 2; if (i === 0 || i === n) continue; c.save(); c.translate(px + span / n / 2, g.top + 3 - Math.sin(f * Math.PI) * 4); c.rotate((f - 0.5) * 1.5); c.fillStyle = rgb(leafC); c.beginPath(); c.ellipse(0, -6, 3, 7, 0, 0, 7); c.fill(); c.restore(); }
        for (let i = 0; i < n; i++) { const f = n === 1 ? 0.5 : i / (n - 1), mid = 1 - Math.abs(f - 0.5) * 2; this.flower(c, g.cx - span / 2 + f * span, g.top + 3 - mid * 5, by(g.stage, 1, 0.9, 0.95) * (0.85 + mid * 0.25), pet, x.acc); }
        if (g.stage === 'Mega') for (let k = 0; k < 6; k++) { const a = x.t / 1100 + k * 1.05, r = g.bw * (0.62 + (k % 2) * 0.12), px = g.cx + Math.cos(a) * r, py = g.top + g.bh * 0.5 + Math.sin(a * 1.3) * g.bh * 0.55, tw = 0.5 + 0.5 * Math.sin(x.t / 200 + k);
          c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,240,170,${0.35 + tw * 0.4})`; c.beginPath(); c.arc(px, py, 3.5 + tw * 1.5, 0, 7); c.fill(); c.restore(); c.fillStyle = '#fffbe6'; c.beginPath(); c.arc(px, py, 1.4, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.52, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.36, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top - 4, g.bw * 0.44],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.44, ex: 0.19, my: 0.66, s: by(g.stage, 0.72, 0.8, 0.88) })
    },
    /* Sphinx: a lion in a striped head cloth. A round sandy body, big front paws and a tufted tail; long side flaps and a gold band from Byte; a cobra crest, a braided beard, a broad collar, lined eyes and folded gold wings at Mega */
    Sphinx: {
      special: true, dims: { Bit: [72, 60], Byte: [90, 74], Mega: [104, 88] }, ll: st => by(st, 5, 7, 8),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 16, 36); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bh * 0.46); },
      behind(c, g, x) { const tuft = dk(x.parts, 0.1);
        if (g.stage === 'Mega') for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.36, g.top + g.bh * 0.5); c.scale(sd, 1);   // folded gold wings
          for (let i = 0; i < 6; i++) { const L = 66 - i * 7; c.save(); c.rotate(-1.3 + i * 0.15); c.fillStyle = '#a8761c'; c.beginPath(); c.ellipse(L * 0.5, 2, L * 0.55, 7, 0, 0, 7); c.fill();
            c.fillStyle = i % 2 ? '#e9b23a' : '#f4cd5c'; c.beginPath(); c.ellipse(L * 0.5, 0, L * 0.55, 6.5, 0, 0, 7); c.fill(); c.restore(); }
          c.fillStyle = rgb(x.parts); c.beginPath(); c.ellipse(4, -6, 12, 7, -1.2, 0, 7); c.fill(); c.restore(); }
        const sw = Math.sin(x.t / 450) * 0.2, tq = [g.cx + g.bw * 0.38, g.bot - 8, g.cx + g.bw * 0.72, g.bot - 2, g.cx + g.bw * 0.66, g.top + g.bh * by(g.stage, 0.3, 0.2, 0.1)];   // the tail and its tuft
        c.save(); c.translate(tq[0], tq[1]); c.rotate(sw * 0.3); c.translate(-tq[0], -tq[1]); limb(c, tq, by(g.stage, 5, 6, 7), dk(x.body, 0.08), x.L.tail, x.t);
        c.fillStyle = rgb(tuft); for (const [dx, dy, r] of [[0, -4, 6], [-4, 0, 5], [4, 0, 5], [0, 2, 5]]) { c.beginPath(); c.arc(tq[4] + dx, tq[5] + dy, r * by(g.stage, 0.9, 1, 1.15), 0, 7); c.fill(); } c.restore();
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.38; blob(c, fx, 180, by(g.stage, 8, 9, 10), 5, dk(x.body, 0.18), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); } },   // back paws
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.38)); c.beginPath(); c.ellipse(g.cx, g.bot - 2, g.bw * 0.3, g.bh * 0.3, 0, 0, 7); c.fill(); },
      front(c, g, x) { const S = g.stage, flap = by(S, 0.52, 0.74, 0.8), gold = [233, 178, 58], st1 = x.parts, st2 = lt(x.body, 0.45);
        const cloth = () => { c.beginPath(); c.moveTo(g.left - 3, g.top + g.bh * flap); c.lineTo(g.left - 2, g.top + g.bh * 0.3); c.quadraticCurveTo(g.left + 2, g.top - 4, g.cx, g.top - 5);
          c.quadraticCurveTo(g.left + g.bw - 2, g.top - 4, g.left + g.bw + 2, g.top + g.bh * 0.3); c.lineTo(g.left + g.bw + 3, g.top + g.bh * flap);
          c.lineTo(g.cx + g.bw * 0.3, g.top + g.bh * flap); c.lineTo(g.cx + g.bw * 0.32, g.top + g.bh * 0.34); c.quadraticCurveTo(g.cx, g.top + g.bh * 0.2, g.cx - g.bw * 0.32, g.top + g.bh * 0.34);
          c.lineTo(g.cx - g.bw * 0.3, g.top + g.bh * flap); c.closePath(); };
        c.save(); c.translate(0, 2.5); cloth(); c.fillStyle = rgb(dk(st1, 0.35)); c.fill(); c.restore();   // the striped head cloth
        c.save(); cloth(); c.clip(); c.fillStyle = rgb(st2); c.fillRect(g.left - 6, g.top - 8, g.bw + 12, g.bh);
        c.fillStyle = rgb(st1); for (let y = g.top - 8; y < g.top + g.bh; y += 9) c.fillRect(g.left - 6, y, g.bw + 12, 4.5); c.restore();
        if (S !== 'Bit') { c.strokeStyle = rgb(gold); c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx - g.bw * 0.32, g.top + g.bh * 0.34); c.quadraticCurveTo(g.cx, g.top + g.bh * 0.2, g.cx + g.bw * 0.32, g.top + g.bh * 0.34); c.stroke(); }
        if (S === 'Mega') { const cx = g.cx, cy = g.top + g.bh * 0.22;   // a gold cobra on its brow
          c.fillStyle = '#a8761c'; c.beginPath(); c.ellipse(cx, cy - 4, 6, 8, 0, 0, 7); c.fill(); c.fillStyle = '#f4cd5c'; c.beginPath(); c.ellipse(cx, cy - 5, 5, 7, 0, 0, 7); c.fill();
          c.fillStyle = '#c8402e'; c.beginPath(); c.arc(cx, cy - 4, 2.2, 0, 7); c.fill();
          const ky = g.top + g.bh * 0.84; for (const [k, col] of [[0, st1], [1, gold], [2, x.acc]]) { c.strokeStyle = rgb(col); c.lineWidth = 4; c.beginPath(); c.ellipse(g.cx, ky, g.bw * (0.22 + k * 0.05), 7 + k * 4.5, 0, 0.15, Math.PI - 0.15); c.stroke(); }   // a broad collar
          const s = by(S, 0.74, 0.82, 0.88), by0 = g.top + g.bh * 0.8, bw2 = 7 * s; c.fillStyle = rgb(dk(x.parts, 0.15)); c.beginPath(); c.moveTo(g.cx - bw2, by0); c.lineTo(g.cx + bw2, by0); c.lineTo(g.cx + bw2 * 0.6, by0 + 18 * s); c.quadraticCurveTo(g.cx, by0 + 22 * s, g.cx - bw2 * 0.6, by0 + 18 * s); c.closePath(); c.fill();   // a braided beard
          c.strokeStyle = rgba(lt(x.parts, 0.4), 0.8); c.lineWidth = 1.2; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(g.cx - bw2 * (1 - k * 0.08), by0 + k * 4 * s); c.lineTo(g.cx + bw2 * (1 - k * 0.08), by0 + k * 4 * s); c.stroke(); } }
        for (const sd of [-1, 1]) { const px = g.cx + sd * g.bw * 0.2, r = by(S, 10, 12, 14), lift = Math.max(0, sd * x.walk) * 3;   // big front paws
          blob(c, px, 181 - r * 0.3 - lift, r, r * 0.62, lt(x.body, 0.05), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot');
          c.strokeStyle = rgba(dk(x.body, 0.3), 0.7); c.lineWidth = 1.4; for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(px + k * r * 0.35, 181 - r * 0.1 - lift); c.lineTo(px + k * r * 0.38, 181 + r * 0.25 - lift); c.stroke(); }
          x.feet.push([px, 181 - lift, r * 0.7]); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.62, g.left + g.bw * 0.12, g.top + g.bh * 0.44, g.left + g.bw * 0.24, g.top + g.bh * 0.36],
      head: g => [g.cx, g.top - 4, g.bw * 0.5],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.5, ex: 0.17, my: 0.71, s: by(g.stage, 0.74, 0.82, 0.88) }), s = fi.s;
        if (x.back) return fi;
        c.fillStyle = rgb(dk(x.body, 0.45)); c.beginPath(); c.moveTo(g.cx - 4 * s, g.top + g.bh * 0.6); c.lineTo(g.cx + 4 * s, g.top + g.bh * 0.6); c.lineTo(g.cx, g.top + g.bh * 0.6 + 4 * s); c.closePath(); c.fill();
        if (g.stage === 'Mega') { c.strokeStyle = '#1f1622'; c.lineWidth = 2.2 * s; c.lineCap = 'round'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + sd * (fi.ex + 8 * s), fi.ey - 1 * s); c.lineTo(g.cx + sd * (fi.ex + 15 * s), fi.ey - 5 * s); c.stroke(); }   // lined eyes
        }
        return fi; }
    },

    /* Garuda: a king of birds standing like a person. A gold body with a hooked beak, red wing stubs and a small crown point; red wings, arms with gold bands, a tall crown and a feather skirt from Byte; huge red wings tipped gold, a jewelled collar and talons at Mega */
    Garuda: {
      special: true, dims: { Bit: [62, 62], Byte: [74, 80], Mega: [86, 94] }, ll: st => by(st, 5, 12, 15),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 20, 30, 40); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * by(g.stage, 0.48, 0.42, 0.4)); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.6,
      behind(c, g, x) { const wing = x.parts, tip = [242, 196, 60], S = g.stage, fl = Math.sin(x.t / 300) * 0.08;
        const n = by(S, 3, 5, 7), len = by(S, 24, 44, 70), up = by(S, -0.2, -0.5, -0.75);
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.3, g.top + g.bh * 0.45); c.scale(sd, 1); c.rotate(up - fl);
          for (let i = n - 1; i >= 0; i--) { const L = len * (1 - i * 0.06), a = i * by(S, 0.4, 0.28, 0.2); c.save(); c.rotate(a);
            c.fillStyle = rgb(dk(wing, 0.35)); c.beginPath(); c.ellipse(L * 0.55, 3, L * 0.6, L * 0.16 + 2, 0, 0, 7); c.fill();
            c.fillStyle = rgb(i % 2 ? wing : lt(wing, 0.1)); c.beginPath(); c.ellipse(L * 0.55, 0, L * 0.6, L * 0.16 + 2, 0, 0, 7); c.fill();
            if (S === 'Mega') { c.fillStyle = rgb(tip); c.beginPath(); c.ellipse(L * 1.0, 0, L * 0.14, L * 0.11, 0, 0, 7); c.fill(); } c.restore(); }
          c.restore(); }
        if (S !== 'Bit') for (let i = -2; i <= 2; i++) { c.save(); c.translate(g.cx + i * g.bw * 0.14, g.bot - 6); c.rotate(i * 0.25); c.fillStyle = rgb(i % 2 ? dk(wing, 0.15) : wing);   // a skirt of feathers
          c.beginPath(); c.ellipse(0, 9, 6, by(S, 0, 13, 15), 0, 0, 7); c.fill(); c.restore(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.18, lift = Math.max(0, sd * x.walk) * 4, fy = 183 - lift, ll = this.ll(S); x.feet.push([fx, fy, 7]);
          c.strokeStyle = '#d99a22'; c.lineWidth = by(S, 3.5, 5, 6); c.lineCap = 'round'; c.beginPath(); c.moveTo(fx, g.bot - 4); c.lineTo(fx, fy - 2); c.stroke();
          c.lineWidth = by(S, 3, 3.5, 4); for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx, fy - 2); c.lineTo(fx + k * by(S, 6, 7, 8), fy + 2); c.stroke(); }
          if (S === 'Mega') { c.fillStyle = '#f4f1ea'; for (const k of [-1, 0, 1]) { c.beginPath(); c.arc(fx + k * 8, fy + 2.5, 1.8, 0, 7); c.fill(); } } void ll; } },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.35)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.12, g.bw * 0.3, g.bh * 0.24, 0, 0, 7); c.fill();
        if (g.stage === 'Mega' && !x.back) { const cy = g.top + g.bh * 0.9; for (const [k, col] of [[0, [200, 40, 40]], [1, [242, 196, 60]]]) { c.strokeStyle = rgb(col); c.lineWidth = 3.5; c.beginPath(); c.ellipse(g.cx, cy - 10, g.bw * (0.28 + k * 0.06), 10 + k * 4, 0, 0.3, Math.PI - 0.3); c.stroke(); }   // a jewelled collar
          for (const k of [-1, 0, 1]) { c.fillStyle = k ? '#3a7ad8' : '#c8402e'; c.beginPath(); c.arc(g.cx + k * g.bw * 0.16, cy + 2 - Math.abs(k) * 3, 3, 0, 7); c.fill(); } } },
      front(c, g, x) { const S = g.stage, gold = [242, 196, 60], gd = dk(gold, 0.3), h = by(S, 8, 18, 28), w = by(S, 7, 11, 14);
        c.fillStyle = rgb(gd); c.beginPath(); c.moveTo(g.cx - w, g.top + 5); c.lineTo(g.cx, g.top - h + 2); c.lineTo(g.cx + w, g.top + 5); c.closePath(); c.fill();   // the crown
        c.fillStyle = rgb(gold); c.beginPath(); c.moveTo(g.cx - w, g.top + 3); c.lineTo(g.cx, g.top - h); c.lineTo(g.cx + w, g.top + 3); c.closePath(); c.fill();
        if (S !== 'Bit') { roundBox(c, g.cx - w - 4, g.top, w * 2 + 8, 6, 2); c.fillStyle = rgb(gd); c.fill(); for (const k of [-1, 1]) { c.fillStyle = rgb(gold); c.beginPath(); c.moveTo(g.cx + k * (w + 2), g.top + 1); c.lineTo(g.cx + k * (w + 6), g.top - h * 0.5); c.lineTo(g.cx + k * (w - 2), g.top + 1); c.closePath(); c.fill(); }
          c.fillStyle = '#c8402e'; c.beginPath(); c.arc(g.cx, g.top + 3, 3, 0, 7); c.fill(); }
        if (S === 'Mega') { c.fillStyle = '#3a7ad8'; c.beginPath(); c.arc(g.cx, g.top - h * 0.45, 3, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top - 8, g.bw * 0.4],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.34, ex: 0.2, my: 0.6, s: by(g.stage, 0.74, 0.82, 0.9) }), s = fi.s, y0 = g.top + g.bh * 0.44;
        if (x.back) return fi;
        c.fillStyle = '#b5671a'; c.beginPath(); c.moveTo(g.cx - 9 * s, y0 + 2); c.quadraticCurveTo(g.cx, y0 - 5 * s, g.cx + 9 * s, y0 + 2); c.quadraticCurveTo(g.cx + 7 * s, y0 + 12 * s, g.cx - 1 * s, y0 + 17 * s); c.quadraticCurveTo(g.cx + 1 * s, y0 + 9 * s, g.cx - 9 * s, y0 + 2); c.fill();   // a hooked beak
        c.fillStyle = '#f0a43a'; c.beginPath(); c.moveTo(g.cx - 9 * s, y0); c.quadraticCurveTo(g.cx, y0 - 7 * s, g.cx + 9 * s, y0); c.quadraticCurveTo(g.cx + 7 * s, y0 + 10 * s, g.cx - 1 * s, y0 + 15 * s); c.quadraticCurveTo(g.cx + 1 * s, y0 + 7 * s, g.cx - 9 * s, y0); c.fill();
        return fi; }
    },
    /* Werewolf: a wolf kid. A grey body with pointed ears, a pale muzzle and a little tail; a torn shirt, claws and a bushy tail from Byte; a ruff of fur, a shredded shirt, a full moon behind it and bigger claws at Mega */
    Werewolf: {
      special: true, dims: { Bit: [64, 60], Byte: [78, 78], Mega: [94, 94] }, ll: st => by(st, 5, 9, 12),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 22, 26, 34); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * 0.44); },
      arms: 'stub', armW: st => by(st, 0, 7, 8), handR: st => by(st, 0, 5.5, 6.5), shoulderY: 0.6,
      behind(c, g, x) { const S = g.stage, fur = dk(x.body, 0.12), dark = dk(x.parts, 0.05);
        if (S === 'Mega') { const mx = g.cx + g.bw * 0.4, my = g.top - 4; c.save(); c.shadowColor = 'rgba(255,248,210,.9)'; c.shadowBlur = 18; c.fillStyle = '#fbf6e0'; c.beginPath(); c.arc(mx, my, 22, 0, 7); c.fill(); c.restore();   // the full moon behind it
          c.fillStyle = 'rgba(200,196,170,.6)'; for (const [dx, dy, r] of [[-6, -4, 5], [6, 5, 4], [4, -8, 3]]) { c.beginPath(); c.arc(mx + dx, my + dy, r, 0, 7); c.fill(); } }
        const tl = by(S, 0.32, 0.55, 0.7) * g.bh, sw = Math.sin(x.t / 400) * 0.25;   // the tail
        c.save(); c.translate(g.cx + g.bw * 0.34, g.bot - 10); c.rotate(-0.6 + sw); c.fillStyle = rgb(dk(fur, 0.15)); c.beginPath(); c.ellipse(tl * 0.5, 2, tl * 0.55, tl * by(S, 0.2, 0.26, 0.3), 0, 0, 7); c.fill();
        c.fillStyle = rgb(fur); c.beginPath(); c.ellipse(tl * 0.5, 0, tl * 0.55, tl * by(S, 0.2, 0.26, 0.3), 0, 0, 7); c.fill(); c.fillStyle = rgb(lt(x.body, 0.45)); c.beginPath(); c.ellipse(tl * 0.9, 0, tl * 0.18, tl * 0.14, 0, 0, 7); c.fill(); c.restore();
        if (S === 'Mega') for (let k = 0; k < 9; k++) { const a = Math.PI + 0.15 + k / 8 * (Math.PI - 0.3), r = g.bw * 0.52;   // a ruff of fur round its head
          c.fillStyle = rgb(k % 2 ? fur : dk(fur, 0.1)); c.beginPath(); c.moveTo(g.cx + Math.cos(a - 0.2) * r * 0.8, g.top + g.bh * 0.42 + Math.sin(a - 0.2) * r * 0.8); c.lineTo(g.cx + Math.cos(a) * r * 1.25, g.top + g.bh * 0.42 + Math.sin(a) * r * 1.0); c.lineTo(g.cx + Math.cos(a + 0.2) * r * 0.8, g.top + g.bh * 0.42 + Math.sin(a + 0.2) * r * 0.8); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const ex = g.cx + sd * g.bw * 0.3, eh = by(S, 20, 26, 30), tw = Math.sin(x.t / 650 + sd) * 1.5;   // pointed ears
          c.fillStyle = rgb(fur); c.beginPath(); c.moveTo(ex - 11, g.top + 12); c.lineTo(ex + sd * 3 + tw, g.top - eh); c.lineTo(ex + 11, g.top + 12); c.closePath(); c.fill();
          c.fillStyle = rgb(dark); c.beginPath(); c.moveTo(ex - 5, g.top + 8); c.lineTo(ex + sd * 2.5 + tw, g.top - eh * 0.6); c.lineTo(ex + 5, g.top + 8); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; limb(c, [fx, g.bot - 8, fx, g.bot - 1 - lift / 2, fx, 180 - lift], by(S, 9, 12, 14), dk(fur, 0.05), sd < 0 ? x.L.legL : x.L.legR, x.t); blob(c, fx, 182 - lift, by(S, 8, 10, 12), 5, fur, sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 8]);
          if (S !== 'Bit') { c.fillStyle = '#f4f1ea'; for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx + k * 4 - 1.5, 184 - lift); c.lineTo(fx + k * 4.5, 188 - lift); c.lineTo(fx + k * 4 + 1.5, 184 - lift); c.fill(); } } } },
      inside(c, g, x) { const S = g.stage; c.fillStyle = rgb(lt(x.body, 0.45)); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.62, g.bw * 0.22, g.bh * 0.16, 0, 0, 7); c.fill();   // a pale muzzle
        if (S === 'Bit') return; const shirt = [80, 112, 170], sy = g.top + g.bh * by(S, 0, 0.72, 0.76);   // a shirt, torn at the hem and more so at Mega
        c.fillStyle = rgb(shirt); c.beginPath(); c.moveTo(g.left - 2, sy); c.lineTo(g.cx - g.bw * 0.14, sy - 4); c.lineTo(g.cx, sy + 6); c.lineTo(g.cx + g.bw * 0.14, sy - 4); c.lineTo(g.left + g.bw + 2, sy);
        const n = by(S, 0, 6, 9); for (let k = n; k >= 0; k--) { const px = g.left + g.bw * k / n, py = g.bot + 2 - (k % 2 ? by(S, 0, 8, 14) : 0); c.lineTo(px, py); } c.closePath(); c.fill();
        c.strokeStyle = rgb(dk(shirt, 0.3)); c.lineWidth = 1.5; c.beginPath(); c.moveTo(g.cx, sy + 6); c.lineTo(g.cx, g.bot); c.stroke();
        if (S === 'Mega') { c.fillStyle = rgb(lt(x.body, 0.1)); for (const [fx, fy] of [[0.3, 0.9], [0.7, 0.86]]) { c.beginPath(); c.ellipse(g.left + g.bw * fx, g.top + g.bh * fy, 6, 4, 0.4, 0, 7); c.fill(); } } },
      front(c, g, x) { if (g.stage === 'Bit' || x.back) return; const a = x.P.arm, sy = g.top + g.bh * this.shoulderY, cl = by(g.stage, 0, 5, 7);   // claws on its hands
        for (const [side, A] of [[-1, a[0]], [1, a[1]]]) { const hx = g.cx + side * (g.bw / 2 - 4) + side * A[2], hy = sy + A[3]; c.fillStyle = '#f4f1ea';
          for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(hx + side * 3 + k * 3 - 1.2, hy + 2); c.lineTo(hx + side * (3 + cl) + k * 3.5, hy + 4 + cl * 0.4); c.lineTo(hx + side * 3 + k * 3 + 1.2, hy + 3); c.fill(); } } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.34, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.42, ex: 0.2, my: 0.68, fang: true, s: by(g.stage, 0.74, 0.82, 0.9) }), s = fi.s;
        if (!x.back) { c.fillStyle = '#2a1e22'; c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.57, 5 * s, 3.6 * s, 0, 0, 7); c.fill(); }
        return fi; }
    },
    /* Minotaur: a bull. A brown body with a pale muzzle, a nose ring and horn buds; curved horns, hooves, a tuft and a little axe from Byte; long horns, a big two-headed axe, a belt and snorts of steam at Mega */
    Minotaur: {
      special: true, dims: { Bit: [70, 62], Byte: [88, 80], Mega: [104, 96] }, ll: st => by(st, 6, 10, 13),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 20, 26); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bh * 0.42); },
      arms: 'stub', armW: st => by(st, 0, 8, 9), handR: st => by(st, 0, 6.5, 7.5), shoulderY: 0.6,
      behind(c, g, x) { const S = g.stage, horn = lt(x.acc, 0.05), hornD = dk(x.acc, 0.25), hl = by(S, 9, 22, 36);
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.34, hy = g.top + 10;   // horns
          const shp = () => { c.beginPath(); c.moveTo(hx - sd * 7, hy + 4); c.quadraticCurveTo(hx + sd * hl * 0.9, hy + 2, hx + sd * hl * 0.8, hy - hl * 0.8); c.quadraticCurveTo(hx + sd * hl * 0.5, hy - 4, hx + sd * 4, hy - 6); c.closePath(); };
          c.save(); c.translate(0, 2); shp(); c.fillStyle = rgb(hornD); c.fill(); c.restore(); shp(); c.fillStyle = rgb(horn); c.fill(); }
        for (const sd of [-1, 1]) { const ex = g.cx + sd * g.bw * 0.5, ey = g.top + g.bh * 0.3; c.fillStyle = rgb(dk(x.body, 0.15)); c.beginPath(); c.ellipse(ex, ey, 10, 5, sd * 0.4, 0, 7); c.fill(); }   // ears
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4, fy = 182 - lift;
          if (S === 'Bit') { blob(c, fx, fy, 9, 5, dk(x.body, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, fy, 8]); continue; }
          roundBox(c, fx - 9, g.bot - 6, 18, fy - g.bot + 2, 5); c.fillStyle = rgb(dk(x.body, 0.18)); c.fill();
          roundBox(c, fx - 10, fy - 7, 20, 8, 3); c.fillStyle = '#3b2e2a'; c.fill(); c.fillStyle = '#1f1715'; c.fillRect(fx - 1, fy - 7, 2, 8); x.feet.push([fx, fy - 4, 9]); }   // split hooves
        if (S !== 'Bit') { const sw = Math.sin(x.t / 500) * 4; c.strokeStyle = rgb(dk(x.body, 0.1)); c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx + g.bw * 0.4, g.bot - 14); c.quadraticCurveTo(g.cx + g.bw * 0.7, g.bot - 8, g.cx + g.bw * 0.64 + sw, g.bot - 34); c.stroke();
          c.fillStyle = rgb(dk(x.body, 0.45)); c.beginPath(); c.ellipse(g.cx + g.bw * 0.64 + sw, g.bot - 37, 4, 6, 0, 0, 7); c.fill(); } },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.38)); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.66, g.bw * 0.26, g.bh * 0.17, 0, 0, 7); c.fill();   // the muzzle
        c.fillStyle = rgb(dk(x.body, 0.4)); for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * g.bw * 0.09, g.top + g.bh * 0.66, 3, 4.5, 0, 0, 7); c.fill(); }
        if (g.stage !== 'Bit') { c.fillStyle = rgb(dk(x.body, 0.35)); c.beginPath(); c.moveTo(g.cx - 10, g.top); c.quadraticCurveTo(g.cx, g.top + 14, g.cx + 10, g.top); c.closePath(); c.fill(); }   // a tuft on its brow
        if (g.stage === 'Mega') { roundBox(c, g.left - 2, g.top + g.bh * 0.86, g.bw + 4, 8, 3); c.fillStyle = '#5a3a24'; c.fill(); roundBox(c, g.cx - 7, g.top + g.bh * 0.86 - 1, 14, 10, 2); c.fillStyle = rgb(x.parts); c.fill(); } },   // a belt
      front(c, g, x) { const S = g.stage, ring = x.parts, ry = g.top + g.bh * 0.74;
        c.strokeStyle = rgb(dk(ring, 0.25)); c.lineWidth = by(S, 3, 3.5, 4.5); c.beginPath(); c.arc(g.cx, ry + 1, by(S, 6, 7, 9), 0.1, Math.PI - 0.1); c.stroke();   // the nose ring
        c.strokeStyle = rgb(lt(ring, 0.25)); c.lineWidth = by(S, 2.2, 2.6, 3.2); c.beginPath(); c.arc(g.cx, ry, by(S, 6, 7, 9), 0.1, Math.PI - 0.1); c.stroke();
        if (S === 'Mega') for (const sd of [-1, 1]) { const ph = ((x.t / 1400) + (sd > 0 ? 0.5 : 0)) % 1; c.fillStyle = `rgba(240,240,240,${0.7 * (1 - ph)})`; c.beginPath(); c.arc(g.cx + sd * (g.bw * 0.14 + ph * 16), ry - 6 + ph * 4, 4 + ph * 5, 0, 7); c.fill(); }   // snorts of steam
        if (S === 'Bit' || x.back) return; const a = x.P.arm[1], hx = g.cx + g.bw / 2 - 4 + a[2], hy = g.top + g.bh * this.shoulderY + a[3], al = by(S, 0, 38, 48), bw2 = by(S, 0, 13, 16);   // the axe in its right hand
        c.save(); c.translate(hx, hy); c.rotate(-0.25); c.strokeStyle = '#6b4a2e'; c.lineWidth = by(S, 0, 3.5, 4.5); c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 8); c.lineTo(0, -al); c.stroke();
        const blade = sd => { c.beginPath(); c.moveTo(0, -al + 4); c.quadraticCurveTo(sd * bw2 * 1.4, -al - bw2 * 0.6, sd * bw2 * 1.5, -al + bw2 * 0.9); c.quadraticCurveTo(sd * bw2 * 0.6, -al + bw2 * 0.5, 0, -al + bw2 * 0.9); c.closePath(); };
        for (const sd of S === 'Mega' ? [-1, 1] : [1]) { c.save(); c.translate(0, 1.5); blade(sd); c.fillStyle = rgb(dk(ring, 0.35)); c.fill(); c.restore(); blade(sd); c.fillStyle = rgb(lt(ring, 0.15)); c.fill(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(sd * bw2 * 0.4, -al - bw2 * 0.1); c.lineTo(sd * bw2 * 1.3, -al + bw2 * 0.5); c.stroke(); }
        c.restore(); },
      hl: g => [g.left + g.bw * 0.1, g.top + g.bh * 0.48, g.left + g.bw * 0.1, g.top + g.bh * 0.16, g.left + g.bw * 0.32, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.38, ex: 0.21, my: 0.86, s: by(g.stage, 0.74, 0.82, 0.9) })
    },
    /* Dragon: a hatchling that grows into a dragon. A green body with an eggshell round its bottom, horn nubs and small wings; bigger wings, curved horns, back spikes, belly plates and a spade tail from Byte; wide wings, long horns and smoke and flame from its mouth at Mega */
    Dragon: {
      special: true, dims: { Bit: [64, 60], Byte: [82, 80], Mega: [98, 94] }, ll: st => by(st, 4, 9, 12),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 16, 24, 32); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * 0.44); },
      arms: 'stub', armW: st => by(st, 0, 6.5, 7.5), handR: st => by(st, 0, 5, 6), shoulderY: 0.62,
      behind(c, g, x) { const S = g.stage, mem = x.parts, bone = dk(x.body, 0.3), fl = Math.sin(x.t / 260) * 0.12, span = by(S, 22, 40, 66);
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.28, g.top + g.bh * 0.4); c.scale(sd, 1); c.rotate(-0.45 - fl);   // membrane wings on bony fingers
          const pts = [[span, -span * 0.45], [span * 1.05, span * 0.05], [span * 0.8, span * 0.42], [span * 0.4, span * 0.55]];
          c.fillStyle = rgb(dk(mem, 0.1)); c.beginPath(); c.moveTo(0, 0); for (const [i, [px, py]] of pts.entries()) { if (!i) c.lineTo(px, py); else { const [qx, qy] = pts[i - 1]; c.quadraticCurveTo((px + qx) / 2 - 4, (py + qy) / 2 - 2, px, py); } } c.quadraticCurveTo(span * 0.15, span * 0.35, 0, 8); c.closePath(); c.fill();
          c.strokeStyle = rgb(bone); c.lineWidth = by(S, 3, 4, 5); c.lineCap = 'round'; for (const [px, py] of pts.slice(0, 3)) { c.beginPath(); c.moveTo(2, 0); c.lineTo(px, py); c.stroke(); }
          c.fillStyle = rgb(bone); c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[0][0] + 6, pts[0][1] - 5); c.lineTo(pts[0][0] - 2, pts[0][1] + 3); c.fill(); c.restore(); }
        if (S !== 'Bit') { const tq = [g.cx + g.bw * 0.3, g.bot - 8, g.cx + g.bw * 0.78, g.bot, g.cx + g.bw * 0.7 + Math.sin(x.t / 500) * 4, g.bot - by(S, 0, 30, 46)];   // a tail with a spade tip
          limb(c, tq, by(S, 0, 9, 11), dk(x.body, 0.08), x.L.tail, x.t); c.save(); c.translate(tq[4], tq[5]); c.fillStyle = rgb(mem); c.beginPath(); c.moveTo(0, 4); c.lineTo(-7, -2); c.lineTo(0, -12); c.lineTo(7, -2); c.closePath(); c.fill(); c.restore(); }
        if (S !== 'Bit') for (let k = 0; k < by(S, 0, 4, 6); k++) { const a = -0.9 + k * by(S, 0, 0.6, 0.36), r = g.bw * 0.5, px = g.cx + Math.sin(a) * r, py = g.top + g.bh * 0.5 - Math.cos(a) * g.bh * 0.55;   // spikes along its back
          c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = rgb(mem); c.beginPath(); c.moveTo(-5, 4); c.lineTo(0, -by(S, 0, 9, 12)); c.lineTo(5, 4); c.closePath(); c.fill(); c.restore(); }
        const hl = by(S, 6, 16, 26);   // horns
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.24, hy = g.top + 6; c.fillStyle = '#f2e6c8'; c.beginPath(); c.moveTo(hx - 5, hy + 2); c.quadraticCurveTo(hx + sd * hl * 0.3, hy - hl * 0.6, hx + sd * hl * 0.7, hy - hl); c.quadraticCurveTo(hx + sd * hl * 0.15, hy - hl * 0.3, hx + 5, hy + 2); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; limb(c, [fx, g.bot - 8, fx, g.bot - 1 - lift / 2, fx, 180 - lift], by(S, 9, 12, 14), dk(x.body, 0.12), sd < 0 ? x.L.legL : x.L.legR, x.t); blob(c, fx, 182 - lift, by(S, 8, 10, 12), 5, dk(x.body, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 8]);
          if (S !== 'Bit') { c.fillStyle = '#f4f1ea'; for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx + k * 4.5 - 1.5, 184 - lift); c.lineTo(fx + k * 5, 188 - lift); c.lineTo(fx + k * 4.5 + 1.5, 184 - lift); c.fill(); } } } },
      inside(c, g, x) { const S = g.stage; if (S === 'Bit') return; const pl = lt(x.parts, 0.45);   // belly plates
        for (let k = 0; k < 4; k++) { const yy = g.top + g.bh * (0.62 + k * 0.1); roundBox(c, g.cx - g.bw * (0.2 - k * 0.02), yy, g.bw * (0.4 - k * 0.04), g.bh * 0.08, 4); c.fillStyle = rgb(k % 2 ? pl : lt(pl, 0.1)); c.fill(); } },
      front(c, g, x) { const S = g.stage;
        if (S === 'Bit') { const sh = '#f6f0e2', y0 = g.top + g.bh * 0.62; c.fillStyle = rgb([214, 206, 188]); c.beginPath(); c.moveTo(g.left - 3, y0 + 2); for (let k = 0; k <= 8; k++) c.lineTo(g.left - 3 + (g.bw + 6) * k / 8, y0 + 2 + (k % 2 ? -8 : 2)); c.lineTo(g.left + g.bw + 2, 184); c.quadraticCurveTo(g.cx, 190, g.left - 2, 184); c.closePath(); c.fill();   // the eggshell it hatched from
          c.fillStyle = sh; c.beginPath(); c.moveTo(g.left - 3, y0); for (let k = 0; k <= 8; k++) c.lineTo(g.left - 3 + (g.bw + 6) * k / 8, y0 + (k % 2 ? -8 : 2)); c.lineTo(g.left + g.bw + 2, 182); c.quadraticCurveTo(g.cx, 188, g.left - 2, 182); c.closePath(); c.fill();
          c.fillStyle = 'rgba(120,180,90,.5)'; for (const [fx, fy] of [[0.2, 0.86], [0.7, 0.9], [0.45, 0.8]]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, 3, 0, 7); c.fill(); } }
        if (S === 'Mega' && !x.back) { const my = g.top + g.bh * 0.62; for (let k = 0; k < 4; k++) { const ph = ((x.t / 900) + k / 4) % 1; c.fillStyle = `rgba(200,200,200,${0.6 * (1 - ph)})`; c.beginPath(); c.arc(g.cx + g.bw * 0.3 + ph * 22, my + 8 - ph * 30, 4 + ph * 6, 0, 7); c.fill(); }   // smoke
          const fl = 1 + Math.sin(x.t / 70) * 0.15; c.save(); c.translate(g.cx + 8, my + 4); c.rotate(0.35); c.scale(fl, 1); c.fillStyle = 'rgba(255,140,40,.9)'; c.beginPath(); c.moveTo(0, -5); c.quadraticCurveTo(18, -8, 26, 0); c.quadraticCurveTo(18, 8, 0, 5); c.closePath(); c.fill();
          c.fillStyle = '#ffe28a'; c.beginPath(); c.moveTo(0, -2.5); c.quadraticCurveTo(10, -4, 15, 0); c.quadraticCurveTo(10, 4, 0, 2.5); c.closePath(); c.fill(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.12, g.top + g.bh * 0.2, g.left + g.bw * 0.32, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.38, ex: 0.2, my: 0.62, fang: true, s: by(g.stage, 0.74, 0.82, 0.9) }), s = fi.s;
        if (!x.back) { c.fillStyle = rgb(dk(x.body, 0.45)); for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * 5 * s, g.top + g.bh * 0.52, 1.8 * s, 1.2 * s, 0, 0, 7); c.fill(); } }
        return fi; }
    },
    /* Thunderbird: a storm bird. A blue body with a curled crest and a hooked beak, with a lightning streak on each small wing; wide wings with bolts down them and carved brows from Byte; huge wings crackling with lightning, lightning crackling off them and a storm cloud under its feet at Mega */
    Thunderbird: {
      special: true, dims: { Bit: [60, 62], Byte: [74, 78], Mega: [88, 92] }, ll: st => by(st, 5, 8, 10),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 24, 32, 40); },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      zig(c, x0, y0, x1, y1, n, w) { c.beginPath(); c.moveTo(x0, y0); for (let k = 1; k <= n; k++) { const f = k / n, px = x0 + (x1 - x0) * f, py = y0 + (y1 - y0) * f, o = k < n ? (k % 2 ? w : -w) : 0; c.lineTo(px + o * (y1 - y0) / Math.hypot(x1 - x0, y1 - y0), py - o * (x1 - x0) / Math.hypot(x1 - x0, y1 - y0)); } c.stroke(); },
      behind(c, g, x) { const S = g.stage, bolt = x.parts, fl = Math.sin(x.t / 240) * 0.1, span = by(S, 30, 54, 70), n = by(S, 3, 5, 7);
        if (S === 'Mega') { c.fillStyle = 'rgba(90,96,120,.9)'; for (const [dx, r] of [[-0.5, 14], [-0.2, 18], [0.15, 17], [0.48, 14]]) { c.beginPath(); c.arc(g.cx + dx * g.bw, 182, r, Math.PI, 0); c.fill(); }   // a storm cloud under it
          c.fillStyle = 'rgba(140,146,170,.9)'; for (const [dx, r] of [[-0.35, 12], [0.02, 14], [0.34, 11]]) { c.beginPath(); c.arc(g.cx + dx * g.bw, 178, r, Math.PI, 0); c.fill(); } }
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.32, g.top + g.bh * 0.42); c.scale(sd, 1); c.rotate(-0.35 - fl);   // wide wings, feathers squared off at the tips
          for (let i = n - 1; i >= 0; i--) { const L = span * (1 - i * 0.07), a = -0.25 + i * by(S, 0.4, 0.26, 0.19); c.save(); c.rotate(a);
            roundBox(c, 0, -5, L, 11, 4); c.fillStyle = rgb(dk(x.body, 0.35)); c.fill(); roundBox(c, 0, -6, L, 10, 4); c.fillStyle = rgb(i % 2 ? x.body : lt(x.body, 0.1)); c.fill();
            c.fillStyle = rgb(x.acc); c.fillRect(L - 8, -6, 4, 10); c.restore(); }
          c.strokeStyle = rgb(bolt); c.lineWidth = by(S, 2.5, 3, 3.5); c.lineJoin = 'round'; this.zig(c, 4, 2, span * 0.9, span * 0.2, by(S, 3, 5, 7), 4);   // lightning down the wing
          c.restore(); }
        const cr = by(S, 10, 16, 22);   // a curled crest
        for (const k of [-1, 0, 1]) { c.save(); c.translate(g.cx + k * 7, g.top + 4); c.rotate(k * 0.4); c.strokeStyle = rgb(k ? dk(x.body, 0.2) : bolt); c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(0, -cr, cr * 0.4 * (k || 1), -cr * 1.1); c.arc(cr * 0.4 * (k || 1) + 3 * (k || 1), -cr * 1.1 + 3, 3.5, Math.PI * 1.2, Math.PI * 0.4, k < 0); c.stroke(); c.restore(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.18, fy = 183 - Math.max(0, sd * x.walk) * 4; x.feet.push([fx, fy, 7]); c.strokeStyle = '#e9ad2e'; c.lineWidth = 4; c.lineCap = 'round';
          c.beginPath(); c.moveTo(fx, g.bot - 4); c.lineTo(fx, fy - 2); c.stroke(); for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx, fy - 2); c.lineTo(fx + k * 6.5, fy + 2); c.stroke(); } } },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.35)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.15, g.bw * 0.3, g.bh * 0.24, 0, 0, 7); c.fill();
        if (g.stage !== 'Bit') { c.strokeStyle = rgb(x.parts); c.lineWidth = 2.5; c.lineJoin = 'round'; this.zig(c, g.cx - g.bw * 0.2, g.bot - g.bh * 0.16, g.cx + g.bw * 0.2, g.bot - g.bh * 0.16, 6, 3); } },
      front(c, g, x) { const S = g.stage; if (S !== 'Mega') return; for (let k = 0; k < 3; k++) { const on = Math.floor(x.t / 120 + k * 3) % 5 === 0; if (!on) continue;   // lightning crackling off its wings
          const sd = k % 2 ? 1 : -1, x0 = g.cx + sd * g.bw * (0.9 + k * 0.1), y0 = g.top - 6 + k * 14; c.save(); c.shadowColor = rgba(lt(x.parts, 0.3), 1); c.shadowBlur = 8; c.strokeStyle = rgb(lt(x.parts, 0.4)); c.lineWidth = 2.5; this.zig(c, x0, y0, x0 + sd * 10, y0 + 30, 4, 4); c.restore(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.38, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top - 4, g.bw * 0.44],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.36, ex: 0.2, my: 0.62, s: by(g.stage, 0.74, 0.82, 0.9) }), s = fi.s, y0 = g.top + g.bh * 0.46;
        if (x.back) return fi;
        if (g.stage !== 'Bit') for (const sd of [-1, 1]) { c.strokeStyle = rgb(dk(x.body, 0.5)); c.lineWidth = 3 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx + sd * 3 * s, fi.ey - 11 * s); c.quadraticCurveTo(g.cx + sd * (fi.ex + 4 * s), fi.ey - 19 * s, g.cx + sd * (fi.ex + 14 * s), fi.ey - 7 * s); c.stroke(); }   // carved brows that curl at the ends
        c.fillStyle = '#c98a14'; c.beginPath(); c.moveTo(g.cx - 8 * s, y0 + 2); c.quadraticCurveTo(g.cx + 2 * s, y0 - 4 * s, g.cx + 9 * s, y0 + 3); c.quadraticCurveTo(g.cx + 6 * s, y0 + 14 * s, g.cx - 1 * s, y0 + 17 * s); c.closePath(); c.fill();   // a hooked beak
        c.fillStyle = '#f6c445'; c.beginPath(); c.moveTo(g.cx - 8 * s, y0); c.quadraticCurveTo(g.cx + 2 * s, y0 - 6 * s, g.cx + 9 * s, y0 + 1); c.quadraticCurveTo(g.cx + 6 * s, y0 + 11 * s, g.cx - 1 * s, y0 + 15 * s); c.closePath(); c.fill();
        return fi; }
    },

    /* Hydra: a serpent with more heads as it grows. A round head on coils with two little head buds; two more heads on necks with frills from Byte; three big frilled heads and two small ones growing back at Mega */
    Hydra: {
      special: true, dims: { Bit: [60, 56], Byte: [70, 66], Mega: [80, 76] }, cl: st => by(st, 18, 22, 26),
      bottom(st) { return 182 - this.cl(st); }, height(st) { return this.dims[st][1] + this.cl(st) + by(st, 12, 30, 44); },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      mini(c, x, y, r, col, frill, look, t) { if (frill) { c.fillStyle = rgb(frill); for (let k = -2; k <= 2; k++) { c.save(); c.translate(x, y); c.rotate(k * 0.42); c.beginPath(); c.ellipse(0, -r * 1.05, r * 0.28, r * 0.55, 0, 0, 7); c.fill(); c.restore(); } }
        c.fillStyle = rgb(dk(col, 0.25)); c.beginPath(); c.ellipse(x, y + 2, r, r * 0.92, 0, 0, 7); c.fill(); c.fillStyle = rgb(col); c.beginPath(); c.ellipse(x, y, r, r * 0.92, 0, 0, 7); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = Math.max(1.5, r * 0.14); c.lineCap = 'round'; c.beginPath(); c.arc(x - r * 0.2, y - r * 0.15, r * 0.6, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
        const bl = Math.floor(t / 2600 + x) % 7 === 0; for (const sd of [-1, 1]) { const ex = x + sd * r * 0.36, ey = y - r * 0.05; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, r * 0.24, bl ? r * 0.04 : r * 0.27, 0, 0, 7); c.fill();
          if (!bl) { c.fillStyle = rgb(INK); c.beginPath(); c.arc(ex + look[0] * r * 0.06, ey + r * 0.03, r * 0.15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - r * 0.05, ey - r * 0.06, r * 0.06, 0, 7); c.fill(); } }
        c.strokeStyle = rgb(INK); c.lineWidth = Math.max(1.4, r * 0.1); c.beginPath(); c.arc(x, y + r * 0.32, r * 0.18, 0.3, Math.PI - 0.3); c.stroke(); },
      behind(c, g, x) { const S = g.stage, cl = this.cl(S), belly = lt(x.parts, 0.2), look = [Math.sin(x.t / 900), 0];
        const nk = by(S, 0, 32, 44), hr = by(S, 9, 15, 19), sw = Math.sin(x.t / 600) * 4, fr = S === 'Mega' ? x.acc : S === 'Byte' ? lt(x.parts, 0.1) : null;
        for (const sd of [-1, 1]) { if (S === 'Bit') { this.mini(c, g.cx + sd * g.bw * 0.5, g.top + g.bh * 0.62, hr, x.body, null, look, x.t); continue; }   // the side heads
          const hx = g.cx + sd * (g.bw * 0.7 + sw * sd * 0.5), hy = g.top - nk * 0.15 + Math.sin(x.t / 500 + sd) * 3, q = [g.cx + sd * g.bw * 0.2, g.bot + 4, g.cx + sd * g.bw * 0.75, g.bot - 10, hx, hy + hr * 0.6];
          limb(c, q, by(S, 0, 13, 16), dk(x.body, 0.1), sd < 0 ? x.L.armL : x.L.armR, x.t); c.strokeStyle = rgba(belly, 0.8); c.lineWidth = by(S, 0, 5, 6); c.beginPath(); c.moveTo(q[0], q[1]); c.quadraticCurveTo(q[2] - sd * 3, q[3], q[4] - sd * 3, q[5]); c.stroke();
          this.mini(c, hx, hy, hr, x.body, fr, look, x.t); }
        if (S === 'Mega') for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.34, hy = g.top - 18 + Math.sin(x.t / 450 + sd * 2) * 2;   // two small heads growing back
          c.strokeStyle = rgb(dk(x.body, 0.1)); c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.2, g.top + 10); c.quadraticCurveTo(g.cx + sd * g.bw * 0.3, g.top, hx, hy + 5); c.stroke(); this.mini(c, hx, hy, 9, lt(x.body, 0.08), null, look, x.t); }
        for (let k = 2; k >= 0; k--) { const cy = 182 - k * cl * 0.36 - 4, cw = g.bw * (0.62 - k * 0.08) + by(S, 0, 4, 8);   // coils under it
          c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.ellipse(g.cx + (k % 2 ? 4 : -4), cy + 3, cw, cl * 0.32, 0, 0, 7); c.fill(); c.fillStyle = rgb(k % 2 ? x.body : lt(x.body, 0.06)); c.beginPath(); c.ellipse(g.cx + (k % 2 ? 4 : -4), cy, cw, cl * 0.3, 0, 0, 7); c.fill();
          c.fillStyle = rgba(belly, 0.75); c.beginPath(); c.ellipse(g.cx + (k % 2 ? 4 : -4), cy + cl * 0.08, cw * 0.7, cl * 0.1, 0, 0, 7); c.fill(); } },
      inside(c, g, x) { if (g.stage === 'Bit') return; c.fillStyle = rgba(dk(x.body, 0.2), 0.5); for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.4; c.beginPath(); c.arc(g.cx + Math.cos(a) * g.bw * 0.38, g.top + g.bh * 0.5 + Math.sin(a) * g.bh * 0.36, 3, 0, 7); c.fill(); } },
      front(c, g, x) { if (g.stage === 'Bit') return; const fr = g.stage === 'Mega' ? x.acc : lt(x.parts, 0.1); c.fillStyle = rgb(fr);   // a frill on the middle head
        for (let k = -2; k <= 2; k++) { c.save(); c.translate(g.cx, g.top + g.bh * 0.3); c.rotate(k * 0.36); c.beginPath(); c.ellipse(0, -g.bh * 0.45, 4, by(g.stage, 0, 8, 11), 0, 0, 7); c.fill(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.38, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top - 6, g.bw * 0.4],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.44, ex: 0.2, my: 0.7, fang: true, s: by(g.stage, 0.72, 0.8, 0.86) })
    },
    /* Griffin: an eagle's head on a lion's body. A sandy body with a white feathered cap, a hooked beak, lion paws and a tufted tail; white wings and ear tufts from Byte; big wings, a feather ruff on its chest and talons at Mega */
    Griffin: {
      special: true, dims: { Bit: [66, 60], Byte: [84, 76], Mega: [100, 90] }, ll: st => by(st, 5, 8, 10),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 26, 36); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bh * 0.46); },
      behind(c, g, x) { const S = g.stage, fea = lt(x.parts, 0.02), fl = Math.sin(x.t / 280) * 0.1;
        if (S !== 'Bit') { const n = by(S, 0, 4, 6), len = by(S, 0, 46, 66);   // white wings, sandy at the tips
          for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.3, g.top + g.bh * 0.42); c.scale(sd, 1); c.rotate(-0.7 - fl);
            for (let i = n - 1; i >= 0; i--) { const L = len * (1 - i * 0.08); c.save(); c.rotate(i * 0.24); c.fillStyle = rgb(dk(fea, 0.22)); c.beginPath(); c.ellipse(L * 0.55, 3, L * 0.58, 7, 0, 0, 7); c.fill();
              c.fillStyle = rgb(i % 2 ? fea : dk(fea, 0.06)); c.beginPath(); c.ellipse(L * 0.55, 0, L * 0.58, 7, 0, 0, 7); c.fill(); c.fillStyle = rgb(x.body); c.beginPath(); c.ellipse(L * 1.0, 0, L * 0.12, 5, 0, 0, 7); c.fill(); c.restore(); }
            c.restore(); } }
        const tq = [g.cx + g.bw * 0.38, g.bot - 8, g.cx + g.bw * 0.72, g.bot - 2, g.cx + g.bw * 0.68 + Math.sin(x.t / 450) * 4, g.top + g.bh * 0.3];   // a lion's tail with a tuft
        limb(c, tq, by(S, 5, 6, 7), dk(x.body, 0.08), x.L.tail, x.t); c.fillStyle = rgb(dk(x.body, 0.4)); for (const [dx, dy, r] of [[0, -4, 6], [-4, 0, 5], [4, 0, 5]]) { c.beginPath(); c.arc(tq[4] + dx, tq[5] + dy, r, 0, 7); c.fill(); }
        if (S !== 'Bit') for (const sd of [-1, 1]) { c.fillStyle = rgb(fea); c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.2, g.top + 6); c.lineTo(g.cx + sd * g.bw * by(S, 0, 0.36, 0.42), g.top - by(S, 0, 12, 18)); c.lineTo(g.cx + sd * g.bw * 0.36, g.top + 10); c.closePath(); c.fill(); }   // ear tufts
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.36; blob(c, fx, 180, by(S, 8, 9, 10), 5, dk(x.body, 0.18), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); } },
      inside(c, g, x) { const fea = lt(x.parts, 0.02); c.fillStyle = rgb(fea); c.beginPath(); c.moveTo(g.left - 2, g.top + g.bh * 0.62);   // the white feathered cap, scalloped at the edge
        const n = 7; for (let k = 0; k <= n; k++) { const px = g.left + g.bw * k / n, py = g.top + g.bh * (0.58 + (k % 2 ? 0.06 : 0)); c.lineTo(px, py); } c.lineTo(g.left + g.bw + 2, g.top - 2); c.lineTo(g.left - 2, g.top - 2); c.closePath(); c.fill();
        c.strokeStyle = rgba(dk(fea, 0.18), 0.7); c.lineWidth = 1.3; for (let r = 0; r < 2; r++) for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(g.left + g.bw * (0.12 + k * 0.15 + r * 0.07), g.top + g.bh * (0.2 + r * 0.16), 4, 0.2, Math.PI - 0.2); c.stroke(); }
        if (g.stage === 'Mega' && !x.back) { c.fillStyle = rgb(fea); for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(g.cx + (k - 2) * g.bw * 0.12, g.top + g.bh * 0.68 + Math.abs(k - 2) * -2, 7, 10, 0, 0, 7); c.fill(); } } },   // a feather ruff
      front(c, g, x) { const S = g.stage; for (const sd of [-1, 1]) { const px = g.cx + sd * g.bw * 0.2, r = by(S, 9, 11, 13), lift = Math.max(0, sd * x.walk) * 3;   // front feet: paws, talons at Mega
          if (S === 'Mega') { c.strokeStyle = '#e9ad2e'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, g.bot - 8); c.lineTo(px, 178 - lift); c.stroke(); c.lineWidth = 4; for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(px, 178 - lift); c.lineTo(px + k * 8, 183 - lift); c.stroke(); }
            c.fillStyle = '#f4f1ea'; for (const k of [-1, 0, 1]) { c.beginPath(); c.arc(px + k * 8.5, 184 - lift, 2, 0, 7); c.fill(); } x.feet.push([px, 182 - lift, 8]); continue; }
          blob(c, px, 181 - r * 0.3 - lift, r, r * 0.62, lt(x.body, 0.05), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); c.strokeStyle = rgba(dk(x.body, 0.3), 0.7); c.lineWidth = 1.4;
          for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(px + k * r * 0.35, 181 - r * 0.1 - lift); c.lineTo(px + k * r * 0.38, 181 + r * 0.25 - lift); c.stroke(); } x.feet.push([px, 181 - lift, r * 0.7]); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.12, g.top + g.bh * 0.2, g.left + g.bw * 0.34, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top, g.bw * 0.46],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.3, ex: 0.2, my: 0.72, s: by(g.stage, 0.74, 0.82, 0.88), lidCol: lt(x.parts, 0.02) }), s = fi.s, y0 = g.top + g.bh * 0.4;
        if (x.back) return fi; c.fillStyle = rgb(dk(x.acc, 0.3)); c.beginPath(); c.moveTo(g.cx - 9 * s, y0 + 2); c.quadraticCurveTo(g.cx + 2 * s, y0 - 4 * s, g.cx + 9 * s, y0 + 3); c.quadraticCurveTo(g.cx + 6 * s, y0 + 15 * s, g.cx - 1 * s, y0 + 19 * s); c.closePath(); c.fill();   // a hooked beak
        c.fillStyle = rgb(lt(x.acc, 0.05)); c.beginPath(); c.moveTo(g.cx - 9 * s, y0); c.quadraticCurveTo(g.cx + 2 * s, y0 - 6 * s, g.cx + 9 * s, y0 + 1); c.quadraticCurveTo(g.cx + 6 * s, y0 + 12 * s, g.cx - 1 * s, y0 + 17 * s); c.closePath(); c.fill();
        return fi; }
    },
    /* Kirin: a scaled deer. A round body on four thin legs with flames for hooves, a short antler horn and an orange mane; scales, a longer horn, whiskers and a flame-tipped tail from Byte; a branching horn, a big flame mane and fire round its hooves at Mega */
    Kirin: {
      special: true, dims: { Bit: [64, 56], Byte: [80, 70], Mega: [94, 82] }, ll: st => by(st, 12, 16, 20),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 20, 28, 38); },
      path(c, g) { c.beginPath(); c.roundRect(g.left, g.top, g.bw, g.bh, [g.bw * 0.46, g.bw * 0.46, g.bh * 0.34, g.bh * 0.34]); },
      fl(c, x, y, w, h, t, k, col) { const f = 1 + Math.sin(t / 80 + k) * 0.12; c.save(); c.translate(x, y); c.scale(1, f); c.fillStyle = rgb(col); c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(-w * 0.8, -h * 0.6, 0, -h); c.quadraticCurveTo(w * 0.8, -h * 0.6, w, 0); c.closePath(); c.fill();
        c.fillStyle = '#ffe28a'; c.beginPath(); c.moveTo(-w * 0.45, 0); c.quadraticCurveTo(-w * 0.4, -h * 0.35, 0, -h * 0.55); c.quadraticCurveTo(w * 0.4, -h * 0.35, w * 0.45, 0); c.closePath(); c.fill(); c.restore(); },
      leg(c, g, x, lx, i, back) { const ll = this.ll(g.stage), lift = Math.max(0, Math.sin(x.t / 150 + i * Math.PI / 2)) * 5 * Math.abs(x.walk), lw = by(g.stage, 6, 7, 8), fy = (back ? 178 : 182) - lift, col = dk(x.body, back ? 0.18 : 0.04);
        limb(c, [lx, g.bot - 8, lx, (g.bot + fy) / 2, lx, fy - 4], lw, col, i % 2 ? x.L.legR : x.L.legL, x.t); this.fl(c, lx, fy + 1, lw * 0.9, by(g.stage, 9, 11, 14), x.t, i, x.parts); x.feet.push([lx, fy, lw * 0.6]); },
      behind(c, g, x) { const S = g.stage, mane = x.parts;
        if (S === 'Mega') for (let k = 0; k < 5; k++) { const ph = ((x.t / 1100) + k / 5) % 1; c.fillStyle = `rgba(255,${150 + k * 15},60,${0.6 * (1 - ph)})`; c.beginPath(); c.arc(g.cx + (k - 2) * g.bw * 0.25, 182 - ph * 16, 3 + ph * 3, 0, 7); c.fill(); }   // fire round its hooves
        const tq = [g.left + 6, g.top + g.bh * 0.6, g.left - 14, g.top + g.bh * 0.5, g.left - 10 + Math.sin(x.t / 500) * 3, g.top + g.bh * 0.2]; limb(c, tq, by(S, 4, 5, 6), dk(x.body, 0.1), x.L.tail, x.t);   // the tail
        if (S !== 'Bit') this.fl(c, tq[4], tq[5] + 4, by(S, 0, 6, 8), by(S, 0, 14, 20), x.t, 7, mane);
        this.leg(c, g, x, g.cx - g.bw * 0.3, 1, true); this.leg(c, g, x, g.cx + g.bw * 0.3, 3, true);
        const n = by(S, 3, 5, 7); for (let k = 0; k < n; k++) { const f = k / (n - 1), mx = g.cx + g.bw * (0.1 + f * 0.3), my = g.top + g.bh * (0.02 + f * 0.45);   // the mane, in tongues of flame down its neck
          c.save(); c.translate(mx, my); c.rotate(0.6 + f * 0.6); this.fl(c, 0, 0, by(S, 5, 6, 8), by(S, 12, 16, 24), x.t, k, mane); c.restore(); }
        const hx = g.cx - g.bw * 0.1, hl = by(S, 12, 22, 30);   // the horn, swept back, branching from Byte
        c.strokeStyle = '#efe0b8'; c.lineWidth = by(S, 4, 5, 6); c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, g.top + 6); c.quadraticCurveTo(hx - 2, g.top - hl * 0.6, hx + hl * 0.35, g.top - hl); c.stroke();
        if (S !== 'Bit') { c.lineWidth = by(S, 0, 3.5, 4.5); c.beginPath(); c.moveTo(hx - 1, g.top - hl * 0.4); c.lineTo(hx - hl * 0.3, g.top - hl * 0.7); c.stroke(); }
        if (S === 'Mega') { c.beginPath(); c.moveTo(hx + hl * 0.12, g.top - hl * 0.8); c.lineTo(hx + hl * 0.05, g.top - hl * 1.1); c.stroke(); } },
      inside(c, g, x) { if (g.stage === 'Bit') return; c.strokeStyle = rgba(dk(x.body, 0.25), 0.6); c.lineWidth = 1.4;   // scales on its sides
        for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) { c.beginPath(); c.arc(g.cx + sd * g.bw * (0.26 + k * 0.06 + (r % 2) * 0.03), g.top + g.bh * (0.5 + r * 0.13), 4, 0.2, Math.PI - 0.2); c.stroke(); }
        c.fillStyle = rgb(lt(x.body, 0.4)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.1, g.bw * 0.22, g.bh * 0.16, 0, 0, 7); c.fill(); },
      front(c, g, x) { this.leg(c, g, x, g.cx - g.bw * 0.22, 0, false); this.leg(c, g, x, g.cx + g.bw * 0.22, 2, false);
        if (g.stage !== 'Bit' && !x.back) for (const sd of [-1, 1]) { const wy = g.top + g.bh * 0.62, sw = Math.sin(x.t / 400 + sd) * 3;   // long whiskers
          c.strokeStyle = rgb(dk(x.parts, 0.1)); c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.3, wy + 2); c.bezierCurveTo(g.cx + sd * g.bw * 0.48, wy + 4, g.cx + sd * g.bw * 0.52, wy + 16 + sw, g.cx + sd * g.bw * by(g.stage, 0, 0.64, 0.74), wy + 10 + sw); c.stroke(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.18, g.left + g.bw * 0.34, g.top + g.bh * 0.06],
      head: g => [g.cx - 4, g.top - 2, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.4, ex: 0.18, my: 0.64, s: by(g.stage, 0.74, 0.84, 0.92) })
    },
    /* Salamander: a fire lizard. A low dark body with bright spots, splayed legs and a flame at the tip of its tail; stripes down its back, arms and a longer burning tail from Byte; a flame crest, flames down its back and a big burning tail at Mega */
    Salamander: {
      special: true, dims: { Bit: [68, 52], Byte: [86, 66], Mega: [102, 80] }, ll: st => by(st, 4, 6, 8),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 18, 22, 34); },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.64,
      flame(c, x, y, s, t, k) { const f = 1 + Math.sin(t / 70 + k) * 0.14; c.save(); c.translate(x, y); c.scale(s, s * f); c.fillStyle = 'rgba(255,120,30,.95)'; c.beginPath(); c.moveTo(0, -16); c.quadraticCurveTo(10, -4, 7, 4); c.quadraticCurveTo(0, 9, -7, 4); c.quadraticCurveTo(-10, -4, 0, -16); c.fill();
        c.fillStyle = '#ffd25a'; c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(5, 0, 3, 4); c.quadraticCurveTo(0, 6, -3, 4); c.quadraticCurveTo(-5, 0, 0, -7); c.fill(); c.restore(); },
      behind(c, g, x) { const S = g.stage, tl = by(S, 22, 34, 46), sw = Math.sin(x.t / 380) * 5;   // a tail that ends in flame
        const tq = [g.cx + g.bw * 0.34, g.bot - 8, g.cx + g.bw * 0.7, g.bot + 2, g.cx + g.bw * 0.5 + tl * 0.6 + sw, g.bot - tl * 0.8];
        for (let i = 0; i <= 14; i++) { const f = i / 14, p = qpt(tq, f), r = by(S, 8, 10, 12) * (1 - f * 0.7); c.fillStyle = rgb(i % 3 === 1 && S !== 'Bit' ? x.parts : f > 0.5 ? dk(x.body, 0.1) : x.body); c.beginPath(); c.arc(p[0], p[1], r, 0, 7); c.fill(); }
        this.flame(c, tq[4], tq[5] + 2, by(S, 0.7, 1, 1.5), x.t, 0);
        for (const sd of [-1, 1]) for (const fb of [-1, 1]) { const fx = g.cx + sd * g.bw * (fb < 0 ? 0.36 : 0.18), lift = Math.max(0, sd * fb * x.walk) * 4, fy = 182 - lift;   // splayed legs
          limb(c, [g.cx + sd * g.bw * 0.22, g.bot - 6, fx + sd * 6, g.bot, fx, fy - 3], by(S, 6, 7, 8), dk(x.body, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t);
          c.fillStyle = rgb(x.parts); for (const k of [-1, 0, 1]) { c.beginPath(); c.arc(fx + k * 4, fy, 2.4, 0, 7); c.fill(); } if (fb > 0) x.feet.push([fx, fy, 7]); }
        if (S === 'Mega') for (let k = -2; k <= 2; k++) this.flame(c, g.cx + k * g.bw * 0.16, g.top + 6 + Math.abs(k) * 6, 0.75 - Math.abs(k) * 0.08, x.t, k + 3); },   // flames along its back
      inside(c, g, x) { const S = g.stage, sp = x.parts; c.fillStyle = rgb(sp);
        for (const [fx, fy, r] of [[0.18, 0.4, 5], [0.82, 0.38, 5], [0.12, 0.66, 4], [0.88, 0.64, 4], [0.3, 0.86, 4], [0.7, 0.88, 4]]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, r * by(S, 0.9, 1, 1.15), 0, 7); c.fill(); }   // bright spots
        if (S !== 'Bit') { c.strokeStyle = rgb(sp); c.lineWidth = by(S, 0, 4, 5); c.lineCap = 'round'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.12, g.top + 4); c.quadraticCurveTo(g.cx + sd * g.bw * 0.28, g.top + g.bh * 0.3, g.cx + sd * g.bw * 0.36, g.top + g.bh * 0.2); c.stroke(); } } },   // stripes over its back
      front(c, g, x) { if (g.stage !== 'Mega') return; for (let k = -1; k <= 1; k++) this.flame(c, g.cx + k * 9, g.top + 2 - (k ? 0 : 5), 0.6 + (k ? 0 : 0.2), x.t, k + 9);   // a flame crest
        for (let k = 0; k < 5; k++) { const ph = (x.t / 1300 + k / 5) % 1; c.fillStyle = `rgba(255,${160 + k * 15},60,${0.9 * (1 - ph)})`; c.beginPath(); c.arc(g.cx + Math.sin(k * 2.1 + ph * 5) * g.bw * 0.5, g.top - ph * 40, 1.6 + (k % 2), 0, 7); c.fill(); } },   // embers
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.16, g.top + g.bh * 0.2, g.left + g.bw * 0.38, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.22, my: 0.66, s: by(g.stage, 0.74, 0.82, 0.9) })
    },
    /* Bakunawa: a sea serpent that swallows the moon. A round head with fin ears on its coils; a dorsal fin, whiskers and scaled coils from Byte; big frilled fins, a crescent moon held in its jaws and waves round its coils at Mega */
    Bakunawa: {
      special: true, dims: { Bit: [62, 58], Byte: [76, 70], Mega: [90, 82] }, cl: st => by(st, 18, 22, 26),
      bottom(st) { return 182 - this.cl(st); }, height(st) { return this.dims[st][1] + this.cl(st) + by(st, 16, 24, 34); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bh * 0.44); },
      behind(c, g, x) { const S = g.stage, cl = this.cl(S), fin = x.parts, sw = Math.sin(x.t / 500) * 0.15;
        if (S !== 'Bit') { const n = by(S, 0, 4, 6), h = by(S, 0, 22, 32);   // a fin along its back
          c.fillStyle = rgb(dk(fin, 0.15)); c.beginPath(); c.moveTo(g.cx - g.bw * 0.3, g.top + 8); for (let k = 0; k <= n; k++) { const f = k / n; c.lineTo(g.cx - g.bw * 0.3 + f * g.bw * 0.6, g.top + 6 - h * Math.sin(f * Math.PI) - (k % 2 ? 0 : 6)); } c.lineTo(g.cx + g.bw * 0.3, g.top + 8); c.closePath(); c.fill();
          c.strokeStyle = rgba(lt(fin, 0.4), 0.8); c.lineWidth = 1.2; for (let k = 1; k < n; k++) { const f = k / n; c.beginPath(); c.moveTo(g.cx - g.bw * 0.3 + f * g.bw * 0.6, g.top + 8); c.lineTo(g.cx - g.bw * 0.3 + f * g.bw * 0.6, g.top + 6 - h * Math.sin(f * Math.PI) * 0.8); c.stroke(); } }
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.48, g.top + g.bh * 0.34); c.rotate(sd * (0.5 + sw)); c.scale(sd, 1); const L = by(S, 14, 20, 30);   // fin ears
          c.fillStyle = rgb(dk(fin, 0.15)); c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(L * 0.6, -L * 0.7, L, -L * 0.3); c.quadraticCurveTo(L * 0.7, 0, L, L * 0.3); c.quadraticCurveTo(L * 0.5, L * 0.3, 0, 6); c.closePath(); c.fill();
          c.fillStyle = rgb(fin); c.beginPath(); c.moveTo(0, -5); c.quadraticCurveTo(L * 0.55, -L * 0.6, L * 0.9, -L * 0.25); c.quadraticCurveTo(L * 0.6, 0, L * 0.9, L * 0.25); c.quadraticCurveTo(L * 0.45, L * 0.25, 0, 5); c.closePath(); c.fill(); c.restore(); }
        if (S === 'Mega') for (let k = 0; k < 2; k++) { const ph = ((x.t / 1600) + k / 2) % 1; c.strokeStyle = `rgba(200,236,255,${0.7 * (1 - ph)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(g.cx, 182, g.bw * (0.6 + ph * 0.4), 6 + ph * 4, 0, Math.PI, 0); c.stroke(); }   // waves
        for (let k = 2; k >= 0; k--) { const cy = 182 - k * cl * 0.36 - 4, cw = g.bw * (0.6 - k * 0.07);   // coils with scales
          c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.ellipse(g.cx + (k % 2 ? -5 : 5), cy + 3, cw, cl * 0.32, 0, 0, 7); c.fill(); c.fillStyle = rgb(k % 2 ? x.body : lt(x.body, 0.06)); c.beginPath(); c.ellipse(g.cx + (k % 2 ? -5 : 5), cy, cw, cl * 0.3, 0, 0, 7); c.fill();
          if (S !== 'Bit') { c.strokeStyle = rgba(lt(x.body, 0.35), 0.7); c.lineWidth = 1.2; for (let j = -2; j <= 2; j++) { c.beginPath(); c.arc(g.cx + (k % 2 ? -5 : 5) + j * cw * 0.35, cy - 1, 3.5, 0.2, Math.PI - 0.2); c.stroke(); } } } },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.parts, 0.35)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.08, g.bw * 0.3, g.bh * 0.16, 0, 0, 7); c.fill(); },
      front(c, g, x) { const S = g.stage; if (x.back) return;
        if (S !== 'Bit') for (const sd of [-1, 1]) { const wy = g.top + g.bh * 0.66, sw = Math.sin(x.t / 400 + sd) * 3; c.strokeStyle = rgb(lt(x.parts, 0.2)); c.lineWidth = 2; c.lineCap = 'round';   // whiskers
          c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.16, wy); c.bezierCurveTo(g.cx + sd * g.bw * 0.45, wy + 2, g.cx + sd * g.bw * 0.55, wy + 16 + sw, g.cx + sd * g.bw * by(S, 0, 0.62, 0.74), wy + 10 + sw); c.stroke(); }
        if (S === 'Mega') { const mx = g.cx, my = g.top + g.bh * 0.84; c.save(); c.shadowColor = 'rgba(255,250,220,.95)'; c.shadowBlur = 14; c.fillStyle = '#fbf6e0'; c.translate(mx, my); c.rotate(-0.3);   // the moon in its jaws
          c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill(); c.restore(); c.fillStyle = rgb(dk(x.body, 0.1)); c.beginPath(); c.arc(mx + 9, my - 5, 10, 0, 7); c.fill();
          c.fillStyle = '#fff'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(mx + sd * 12, my - 9); c.lineTo(mx + sd * 9, my - 2); c.lineTo(mx + sd * 6, my - 9); c.fill(); } } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.12, g.top + g.bh * 0.2, g.left + g.bw * 0.36, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top - 4, g.bw * 0.44],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.4, ex: 0.21, my: 0.66, fang: true, s: by(g.stage, 0.74, 0.82, 0.9) })
    },

    /* Cerberus: a guard dog with three heads. A dark dog head with pointed ears and a red collar, two sleepy pup heads beside it; three awake heads with spiked collars and paws from Byte; bigger heads with studded collars, a chain and a snake for a tail at Mega */
    Cerberus: {
      special: true, dims: { Bit: [62, 58], Byte: [72, 68], Mega: [84, 80] }, ll: st => by(st, 6, 9, 11),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 18, 24, 30); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * 0.44); },
      dog(c, x, y, r, col, red, stud, awake, look, t) { const ear = dk(col, 0.25);
        for (const sd of [-1, 1]) { c.fillStyle = rgb(ear); c.beginPath(); c.moveTo(x + sd * r * 0.25, y - r * 0.6); c.lineTo(x + sd * r * 0.85, y - r * (awake ? 1.55 : 0.9)); c.lineTo(x + sd * r * 0.95, y - r * 0.2); c.closePath(); c.fill(); }
        c.fillStyle = rgb(dk(col, 0.3)); c.beginPath(); c.ellipse(x, y + 2, r, r * 0.92, 0, 0, 7); c.fill(); c.fillStyle = rgb(col); c.beginPath(); c.ellipse(x, y, r, r * 0.92, 0, 0, 7); c.fill();
        c.fillStyle = rgb(lt(col, 0.3)); c.beginPath(); c.ellipse(x, y + r * 0.42, r * 0.48, r * 0.34, 0, 0, 7); c.fill(); c.fillStyle = '#1c1416'; c.beginPath(); c.ellipse(x, y + r * 0.26, r * 0.17, r * 0.12, 0, 0, 7); c.fill();
        for (const sd of [-1, 1]) { const ex = x + sd * r * 0.4, ey = y - r * 0.12; if (!awake) { c.strokeStyle = rgb(INK); c.lineWidth = Math.max(1.4, r * 0.1); c.lineCap = 'round'; c.beginPath(); c.arc(ex, ey - r * 0.04, r * 0.15, 0.2, Math.PI - 0.2); c.stroke(); continue; }
          c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, r * 0.2, r * 0.23, 0, 0, 7); c.fill(); c.fillStyle = rgb(INK); c.beginPath(); c.arc(ex + look[0] * r * 0.05, ey + r * 0.03, r * 0.13, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - r * 0.04, ey - r * 0.05, r * 0.05, 0, 7); c.fill(); }
        c.fillStyle = rgb(red); roundBox(c, x - r * 0.8, y + r * 0.72, r * 1.6, r * 0.32, r * 0.14); c.fill();   // its collar
        if (stud) { c.fillStyle = rgb(stud); for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * r * 0.32 - r * 0.09, y + r * 0.74); c.lineTo(x + k * r * 0.32, y + r * 0.5); c.lineTo(x + k * r * 0.32 + r * 0.09, y + r * 0.74); c.fill(); } } },
      behind(c, g, x) { const S = g.stage, look = [Math.sin(x.t / 900), 0], red = x.parts, stud = S === 'Mega' ? lt(x.acc, 0.2) : S === 'Byte' ? lt(x.acc, 0.1) : null;
        if (S === 'Mega') { const tq = [g.cx + g.bw * 0.36, g.bot - 6, g.cx + g.bw * 0.8, g.bot - 4, g.cx + g.bw * 0.72 + Math.sin(x.t / 500) * 4, g.top + g.bh * 0.3];   // a snake for a tail
          limb(c, tq, 7, [90, 150, 80], x.L.tail, x.t); c.fillStyle = 'rgb(90,150,80)'; c.beginPath(); c.ellipse(tq[4], tq[5] - 3, 6, 7, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(tq[4] - 2, tq[5] - 5, 1.6, 0, 7); c.arc(tq[4] + 2, tq[5] - 5, 1.6, 0, 7); c.fill();
          c.strokeStyle = '#d23a3a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(tq[4], tq[5] + 3); c.lineTo(tq[4], tq[5] + 7); c.lineTo(tq[4] - 2, tq[5] + 9); c.moveTo(tq[4], tq[5] + 7); c.lineTo(tq[4] + 2, tq[5] + 9); c.stroke(); }
        else { const tw = Math.sin(x.t / 200) * 0.3; c.save(); c.translate(g.cx + g.bw * 0.4, g.bot - 10); c.rotate(-0.8 + tw); c.fillStyle = rgb(dk(x.body, 0.1)); c.beginPath(); c.ellipse(9, 0, 10, 4, 0, 0, 7); c.fill(); c.restore(); }   // a wagging tail
        const hr = by(S, 10, 17, 21), dx = g.bw * by(S, 0.5, 0.56, 0.58), dy = by(S, 0.6, 0.34, 0.3);   // the side heads, each on a thick neck from the shoulder
        for (const sd of [-1, 1]) { const hx = g.cx + sd * dx, hy = g.top + g.bh * dy; limb(c, [g.cx + sd * g.bw * 0.22, g.top + g.bh * 0.7, g.cx + sd * dx * 0.9, g.top + g.bh * (dy + 0.25), hx, hy + hr * 0.2], hr * 1.15, dk(x.body, 0.14), sd < 0 ? x.L.armL : x.L.armR, x.t);
          c.fillStyle = rgb(x.parts); c.save(); c.translate(hx, hy + hr * 0.95); c.rotate(-sd * 0.35); roundBox(c, -hr * 0.62, -hr * 0.14, hr * 1.24, hr * 0.3, hr * 0.12); c.fill(); c.restore(); }
        for (const sd of [-1, 1]) this.dog(c, g.cx + sd * dx, g.top + g.bh * dy + Math.sin(x.t / 600 + sd) * 1.5, hr, dk(x.body, 0.06), red, stud, S !== 'Bit', look, x.t);
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; limb(c, [fx, g.bot - 8, fx, g.bot - 1 - lift / 2, fx, 180 - lift], by(S, 9, 11, 13), dk(x.body, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t);
          blob(c, fx, 182 - lift, by(S, 8, 10, 12), 5, dk(x.body, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 8]);
          if (S !== 'Bit') { c.fillStyle = rgb(lt(x.body, 0.4)); for (const k of [-1, 0, 1]) { c.beginPath(); c.arc(fx + k * 4, 184 - lift, 1.4, 0, 7); c.fill(); } } }
        for (const sd of [-1, 1]) { const ex = g.cx + sd * g.bw * 0.32, eh = by(S, 14, 18, 22); c.fillStyle = rgb(dk(x.body, 0.25)); c.beginPath(); c.moveTo(ex - 7, g.top + 8); c.lineTo(ex + sd * 5, g.top - eh); c.lineTo(ex + 8, g.top + 10); c.closePath(); c.fill(); } },   // the middle head's ears
      inside(c, g, x) { c.fillStyle = rgb(lt(x.body, 0.3)); c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.66, g.bw * 0.24, g.bh * 0.17, 0, 0, 7); c.fill(); },
      front(c, g, x) { const S = g.stage, red = x.parts, r = g.bw * 0.5; c.fillStyle = rgb(red); roundBox(c, g.left + 2, g.top + g.bh * 0.84, g.bw - 4, g.bh * 0.12, 4); c.fill();   // the middle collar
        if (S !== 'Bit') { c.fillStyle = rgb(lt(x.acc, 0.15)); for (let k = -3; k <= 3; k++) { const px = g.cx + k * g.bw * 0.13; c.beginPath(); c.moveTo(px - 3, g.top + g.bh * 0.86); c.lineTo(px, g.top + g.bh * 0.86 - by(S, 0, 6, 8)); c.lineTo(px + 3, g.top + g.bh * 0.86); c.fill(); } }
        if (S === 'Mega') { c.strokeStyle = rgb(lt(x.acc, 0.1)); c.lineWidth = 2.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(g.cx + 4 + k * 5, g.bot + 4 + k * 3, 3.5, 2.2, 0.6, 0, 7); c.stroke(); } }   // a chain hanging from it
        c.fillStyle = '#1c1416'; c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.6, 5, 3.6, 0, 0, 7); c.fill(); void r; },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.12, g.top + g.bh * 0.2, g.left + g.bw * 0.34, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.4, ex: 0.2, my: 0.72, fang: true, s: by(g.stage, 0.72, 0.8, 0.86) })
    },
    /* Djinn: a genie that floats out of a gold lamp on a curl of smoke, with a topknot; arms with gold bands, earrings and a longer smoke trail from Byte; a turban with a jewel, a bigger lamp and sparkles at Mega */
    Djinn: {
      special: true, float: true, dims: { Bit: [58, 58], Byte: [70, 70], Mega: [84, 82] }, slots: { feet: false },
      bottom(st) { return by(st, 150, 146, 140); }, height(st) { return this.dims[st][1] + by(st, 30, 36, 48) + (182 - this.bottom(st)); },
      path(c, g) { const r = g.bw / 2, cy = g.top + r; c.beginPath(); c.arc(g.cx, cy, r, Math.PI, 0); c.bezierCurveTo(g.left + g.bw, cy + (g.bot - cy) * 0.7, g.cx + r * 0.3, g.bot, g.cx, g.bot);
        c.bezierCurveTo(g.cx - r * 0.3, g.bot, g.left, cy + (g.bot - cy) * 0.7, g.left, cy); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.56,
      behind(c, g, x) { const S = g.stage, gold = [240, 196, 60], gd = dk(gold, 0.3), lw = by(S, 16, 20, 26), ly = 178, lx = g.cx - 4;
        const sw = Math.sin(x.t / 400) * 4, q = [g.cx, g.bot - 6, g.cx + 14 + sw, (g.bot + ly) / 2, lx + lw * 1.05, ly - lw * 0.3];   // the curl of smoke down into the spout
        for (let i = 0; i <= 12; i++) { const f = i / 12, p = qpt(q, f), r = by(S, 9, 11, 13) * (1 - f * 0.55); c.fillStyle = rgba(lt(x.body, 0.1 + f * 0.25), 0.95); c.beginPath(); c.arc(p[0], p[1], r, 0, 7); c.fill(); }
        c.fillStyle = rgb(gd); c.beginPath(); c.ellipse(lx, ly + 2, lw, lw * 0.42, 0, 0, 7); c.fill(); c.fillStyle = rgb(gold); c.beginPath(); c.ellipse(lx, ly, lw, lw * 0.42, 0, 0, 7); c.fill();   // the lamp
        c.beginPath(); c.moveTo(lx + lw * 0.6, ly - lw * 0.1); c.quadraticCurveTo(lx + lw * 1.1, ly - lw * 0.1, lx + lw * 1.25, ly - lw * 0.5); c.lineTo(lx + lw * 1.05, ly - lw * 0.45); c.quadraticCurveTo(lx + lw * 0.9, ly + lw * 0.1, lx + lw * 0.5, ly + lw * 0.2); c.closePath(); c.fill();
        c.strokeStyle = rgb(gd); c.lineWidth = 3; c.beginPath(); c.arc(lx - lw * 0.82, ly - lw * 0.05, lw * 0.3, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
        c.fillStyle = rgb(gd); c.beginPath(); c.ellipse(lx, ly - lw * 0.38, lw * 0.36, lw * 0.14, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(lx - lw * 0.4, ly - lw * 0.1, lw * 0.3, lw * 0.08, -0.2, 0, 7); c.fill();
        if (S !== 'Mega') { const ty = g.top - by(S, 6, 8, 0), tw = Math.sin(x.t / 500) * 3; c.fillStyle = rgb(dk(x.body, 0.45)); c.beginPath(); c.ellipse(g.cx, ty + 4, 7, 6, 0, 0, 7); c.fill();   // a topknot with a ponytail
          c.strokeStyle = rgb(dk(x.body, 0.45)); c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.cx, ty); c.quadraticCurveTo(g.cx + 10 + tw, ty - 12, g.cx + 18 + tw, ty - 2); c.stroke(); c.fillStyle = rgb(gold); c.fillRect(g.cx - 4, ty + 6, 8, 3); } },
      front(c, g, x) { const S = g.stage, gold = [240, 196, 60];
        if (S !== 'Bit' && !x.back) for (const sd of [-1, 1]) { c.strokeStyle = rgb(gold); c.lineWidth = 2; c.beginPath(); c.arc(g.cx + sd * g.bw * 0.47, g.top + g.bh * 0.42, 4, 0, 7); c.stroke(); }   // earrings
        if (S !== 'Bit') for (const [side, A] of [[-1, x.P.arm[0]], [1, x.P.arm[1]]]) { const sx = g.cx + side * (g.bw / 2 - 4), sy = g.top + g.bh * this.shoulderY, p = qpt([sx, sy, sx + side * A[0], sy + A[1], sx + side * A[2], sy + A[3]], 0.7);   // gold bands on its arms
          c.fillStyle = rgb(gold); c.beginPath(); c.arc(p[0], p[1], by(S, 0, 4.5, 5.5), 0, 7); c.fill(); }
        if (S === 'Mega') { const ty = g.top + 16; c.fillStyle = rgb(dk(x.acc, 0.12)); c.beginPath(); c.ellipse(g.cx, ty - 2, g.bw * 0.46, 20, 0, Math.PI, 0); c.fill(); c.fillStyle = rgb(lt(x.acc, 0.05)); c.beginPath(); c.ellipse(g.cx, ty - 4, g.bw * 0.46, 20, 0, Math.PI, 0); c.fill();   // a turban with a jewel and a feather
          c.strokeStyle = rgba(dk(x.acc, 0.2), 0.6); c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(g.cx, ty - 4, g.bw * 0.46, 20 - k * 5, 0, Math.PI + 0.3, -0.3); c.stroke(); }
          c.fillStyle = rgb(lt(x.acc, 0.1)); c.beginPath(); c.ellipse(g.cx + 7, ty - 26, 4, 11, 0.4, 0, 7); c.fill();
          c.fillStyle = '#c8402e'; c.beginPath(); c.moveTo(g.cx, ty - 22); c.lineTo(g.cx + 6, ty - 15); c.lineTo(g.cx, ty - 8); c.lineTo(g.cx - 6, ty - 15); c.closePath(); c.fill();
          for (let k = 0; k < 4; k++) { const a = x.t / 700 + k * 1.6; star(c, g.cx + Math.cos(a) * g.bw * 0.7, g.top + g.bh * 0.5 + Math.sin(a) * 20, 0.4, k % 2 ? '#fff6c4' : rgb(gold)); } } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.36, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top - 6, g.bw * 0.42],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.4, ex: 0.18, my: 0.62, s: by(g.stage, 0.72, 0.8, 0.88) })
    },
    /* Troll: a mossy bridge troll. A green lump with a big nose, small tusks, drooping ears and moss on top; long arms, a wooden club and toes from Byte; a club studded with stones, mushrooms growing on it and a moss beard at Mega */
    Troll: {
      special: true, dims: { Bit: [72, 60], Byte: [92, 76], Mega: [108, 92] }, ll: st => by(st, 6, 8, 10),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 18, 28); },
      path(c, g) { const T = g.top, B = g.bot, h = g.bw / 2; c.beginPath(); c.moveTo(g.cx, T); c.bezierCurveTo(g.cx + h * 0.9, T, g.cx + h, T + g.bh * 0.4, g.cx + h, T + g.bh * 0.7); c.bezierCurveTo(g.cx + h, B, g.cx + h * 0.5, B, g.cx, B);
        c.bezierCurveTo(g.cx - h * 0.5, B, g.cx - h, B, g.cx - h, T + g.bh * 0.7); c.bezierCurveTo(g.cx - h, T + g.bh * 0.4, g.cx - h * 0.9, T, g.cx, T); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 9, 11), handR: st => by(st, 0, 7, 8.5), shoulderY: 0.5, armK: 1.35,
      behind(c, g, x) { const S = g.stage;
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.46, g.top + g.bh * 0.34); c.rotate(sd * 0.5); c.fillStyle = rgb(dk(x.body, 0.15)); c.beginPath(); c.ellipse(sd * 8, 4, 12, 6, sd * 0.3, 0, 7); c.fill(); c.restore(); }   // drooping ears
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4; limb(c, [fx, g.bot - 8, fx, g.bot - 1 - lift / 2, fx, 180 - lift], by(S, 12, 15, 18), dk(x.body, 0.12), sd < 0 ? x.L.legL : x.L.legR, x.t);
          blob(c, fx, 182 - lift, by(S, 11, 14, 17), 6, dk(x.body, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 10]);
          if (S !== 'Bit') { c.fillStyle = '#e6dcc0'; for (const k of [-1, 0, 1]) { c.beginPath(); c.ellipse(fx + k * 5, 185 - lift, 2.4, 1.6, 0, 0, 7); c.fill(); } } } },
      inside(c, g, x) { const S = g.stage, moss = dk(x.body, 0.3); c.fillStyle = rgb(moss);   // moss on its head and shoulders
        for (const [fx, fy, r] of [[0.5, 0.02, 14], [0.32, 0.06, 10], [0.68, 0.06, 10], [0.15, 0.3, 7], [0.85, 0.32, 7]]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, r * by(S, 0.8, 1, 1.15), 0, 7); c.fill(); }
        c.fillStyle = rgb(lt(x.body, 0.25)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.18, g.bw * 0.3, g.bh * 0.2, 0, 0, 7); c.fill();
        if (S === 'Mega' && !x.back) { c.fillStyle = rgb(moss); c.beginPath(); c.moveTo(g.cx - g.bw * 0.22, g.top + g.bh * 0.68); for (let k = 0; k <= 6; k++) c.lineTo(g.cx - g.bw * 0.22 + k * g.bw * 0.073, g.top + g.bh * (0.8 + (k % 2 ? 0.08 : 0))); c.lineTo(g.cx + g.bw * 0.22, g.top + g.bh * 0.68); c.closePath(); c.fill(); } },   // a moss beard
      front(c, g, x) { const S = g.stage;
        if (S === 'Mega') for (const [fx, fy, r, col] of [[0.24, -0.02, 7, '#c8402e'], [0.78, 0.04, 6, '#d99a4c'], [0.1, 0.24, 5, '#c8402e']]) { const px = g.left + g.bw * fx, py = g.top + g.bh * fy;   // mushrooms
          c.fillStyle = '#efe6d2'; c.fillRect(px - 2, py - 2, 4, 7); c.fillStyle = col; c.beginPath(); c.arc(px, py - 2, r, Math.PI, 0); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(px - r * 0.4, py - r * 0.5, 1.4, 0, 7); c.arc(px + r * 0.3, py - r * 0.7, 1.2, 0, 7); c.fill(); }
        if (S === 'Bit' || x.back) return; const a = x.P.arm[1], k = this.armK, hx = g.cx + g.bw / 2 - 4 + a[2] * k, hy = g.top + g.bh * this.shoulderY + a[3] * k, cl = by(S, 0, 38, 52), cw = by(S, 0, 9, 12);   // the club
        c.save(); c.translate(hx, hy); c.rotate(-0.35); const wood = x.parts; c.fillStyle = rgb(dk(wood, 0.25)); c.beginPath(); c.moveTo(-3, 6); c.lineTo(-cw, -cl); c.quadraticCurveTo(0, -cl - cw * 1.2, cw, -cl); c.lineTo(3, 6); c.closePath(); c.fill();
        c.fillStyle = rgb(wood); c.beginPath(); c.moveTo(-2, 5); c.lineTo(-cw + 2, -cl + 1); c.quadraticCurveTo(0, -cl - cw, cw - 2, -cl + 1); c.lineTo(2, 5); c.closePath(); c.fill();
        c.strokeStyle = rgba(dk(wood, 0.35), 0.7); c.lineWidth = 1.2; c.beginPath(); c.moveTo(-cw * 0.4, -cl * 0.8); c.lineTo(-cw * 0.2, -cl * 0.5); c.moveTo(cw * 0.3, -cl * 0.9); c.lineTo(cw * 0.15, -cl * 0.6); c.stroke();
        if (S === 'Mega') { c.fillStyle = '#9a948a'; for (const [px, py] of [[-cw, -cl * 0.85], [cw, -cl * 0.8], [-cw * 0.9, -cl * 0.6], [cw * 0.85, -cl * 0.55], [0, -cl - cw * 0.9]]) { c.beginPath(); c.moveTo(px - 3, py + 2); c.lineTo(px + (px > 0 ? 6 : px < 0 ? -6 : 0), py - (px ? 0 : 6)); c.lineTo(px + 3, py - 2); c.closePath(); c.fill(); } }
        c.restore(); },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.56, g.left + g.bw * 0.14, g.top + g.bh * 0.26, g.left + g.bw * 0.34, g.top + g.bh * 0.1],
      head: g => [g.cx, g.top + 2, g.bw * 0.42],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.36, ex: 0.18, my: 0.7, s: by(g.stage, 0.72, 0.8, 0.88) }), s = fi.s;
        if (x.back) return fi; const ny = g.top + g.bh * 0.52; c.fillStyle = rgb(dk(x.body, 0.2)); c.beginPath(); c.ellipse(g.cx, ny + 2, 10 * s, 9 * s, 0, 0, 7); c.fill(); c.fillStyle = rgb(lt(x.body, 0.12)); c.beginPath(); c.ellipse(g.cx, ny, 10 * s, 9 * s, 0, 0, 7); c.fill();   // a big nose
        c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(g.cx - 3 * s, ny - 3 * s, 3 * s, 2 * s, -0.4, 0, 7); c.fill();
        c.fillStyle = rgb(lt(x.acc, 0.1)); for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + sd * 8 * s, fi.my + 3 * s); c.lineTo(g.cx + sd * 10 * s, fi.my - by(g.stage, 6, 8, 10) * s); c.lineTo(g.cx + sd * 12 * s, fi.my + 3 * s); c.closePath(); c.fill(); }   // tusks
        return fi; }
    },
    /* Mummy: a Snabit wrapped in bandages with one eye showing and a loose end trailing; wrapped arms and feet with more loose ends from Byte; a glowing eye, a gold scarab on its chest and strips floating round it at Mega */
    Mummy: {
      special: true, dims: { Bit: [62, 60], Byte: [76, 76], Mega: [90, 90] }, ll: st => by(st, 5, 8, 10),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 10, 14, 24); },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * 0.42); },
      arms: 'stub', armW: st => by(st, 0, 7, 8), handR: st => by(st, 0, 5.5, 6.5), shoulderY: 0.58,
      strip(c, x0, y0, len, a, col, t, k) { c.save(); c.translate(x0, y0); c.rotate(a); c.fillStyle = rgb(col); c.beginPath(); c.moveTo(0, -3);
        for (let i = 0; i <= 8; i++) c.lineTo(i * len / 8, -3 + Math.sin(t / 250 + k + i) * 2); for (let i = 8; i >= 0; i--) c.lineTo(i * len / 8, 3 + Math.sin(t / 250 + k + i) * 2); c.closePath(); c.fill(); c.restore(); },
      behind(c, g, x) { const S = g.stage, wrap = lt(x.body, 0.02);
        this.strip(c, g.cx + g.bw * 0.4, g.top + g.bh * 0.8, by(S, 16, 22, 28), 0.5, dk(wrap, 0.1), x.t, 1);   // a loose end
        if (S === 'Mega') for (let k = 0; k < 3; k++) { const a = x.t / 1400 + k * 2.1; this.strip(c, g.cx + Math.cos(a) * g.bw * 0.75, g.top + g.bh * 0.5 + Math.sin(a) * g.bh * 0.5, 22, a + 1.2, dk(wrap, 0.08), x.t, k + 3); }   // strips floating round it
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22, lift = Math.max(0, sd * x.walk) * 4; limb(c, [fx, g.bot - 8, fx, g.bot - 1 - lift / 2, fx, 180 - lift], by(S, 9, 11, 13), dk(wrap, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t);
          blob(c, fx, 182 - lift, by(S, 8, 10, 12), 5, dk(wrap, 0.12), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 8]);
          c.strokeStyle = rgba(dk(wrap, 0.3), 0.6); c.lineWidth = 1; c.beginPath(); c.moveTo(fx - 6, 179 - lift); c.lineTo(fx + 6, 181 - lift); c.stroke(); } },
      inside(c, g, x) { const S = g.stage, line = dk(x.body, 0.22); c.strokeStyle = rgba(line, 0.75); c.lineWidth = 1.6;   // the wraps
        for (let k = 0; k < by(S, 6, 8, 9); k++) { const y = g.top + g.bh * (0.08 + k * by(S, 0.16, 0.12, 0.11)), tilt = (k % 2 ? 1 : -1) * 4; c.beginPath(); c.moveTo(g.left - 2, y - tilt); c.lineTo(g.left + g.bw + 2, y + tilt); c.stroke(); }
        if (S === 'Mega' && !x.back) { const sx = g.cx, sy = g.top + g.bh * 0.82; c.fillStyle = '#c99a24'; c.beginPath(); c.ellipse(sx, sy, 9, 7, 0, 0, 7); c.fill();   // a gold scarab
          c.fillStyle = '#f2cf5a'; c.beginPath(); c.ellipse(sx, sy - 1, 7, 5.5, 0, 0, 7); c.fill(); c.strokeStyle = '#a8761c'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(sx, sy - 6); c.lineTo(sx, sy + 4); c.stroke();
          c.fillStyle = '#3a7ad8'; c.beginPath(); c.arc(sx, sy - 6, 2.2, 0, 7); c.fill(); for (const sd of [-1, 1]) { c.strokeStyle = '#c99a24'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx + sd * 6, sy); c.quadraticCurveTo(sx + sd * 14, sy - 6, sx + sd * 16, sy + 2); c.stroke(); } } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.12, g.top + g.bh * 0.2, g.left + g.bw * 0.34, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face(c, g, x, look) { const fi = faceTwo(c, g, x, look, { ey: 0.4, ex: 0.19, my: 0.66, s: by(g.stage, 0.74, 0.82, 0.9) }), s = fi.s, wrap = lt(x.body, 0.02);
        if (x.back) return fi;
        c.save(); c.translate(g.cx - fi.ex, fi.ey); c.rotate(-0.25); c.fillStyle = rgb(dk(wrap, 0.12)); roundBox(c, -14 * s, -6 * s, 28 * s, 12 * s, 3); c.fill(); c.fillStyle = rgb(wrap); roundBox(c, -14 * s, -7 * s, 28 * s, 11 * s, 3); c.fill();   // a bandage over one eye
        c.strokeStyle = rgba(dk(wrap, 0.25), 0.7); c.lineWidth = 1; c.beginPath(); c.moveTo(-12 * s, -1 * s); c.lineTo(12 * s, -2 * s); c.stroke(); c.restore();
        if (g.stage === 'Mega') { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rgba(lt(x.acc, 0.2), 0.35 + Math.sin(x.t / 200) * 0.12); c.beginPath(); c.arc(g.cx + fi.ex, fi.ey, 13 * s, 0, 7); c.fill(); c.restore(); }   // the eye glows
        return fi; }
    },
    /* Sarimanok: a rooster with rainbow tail feathers. A white chick with a red comb and three bright tail feathers; a fan of five feathers, a wattle, wings and a fish in its beak from Byte; seven long curling feathers and gold swirls on its wings at Mega */
    Sarimanok: {
      special: true, dims: { Bit: [60, 60], Byte: [72, 74], Mega: [84, 86] }, ll: st => by(st, 6, 10, 12),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 22, 36, 52); },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      RAIN: [[228, 64, 52], [244, 150, 40], [244, 206, 60], [80, 170, 80], [60, 120, 210], [140, 90, 200], [240, 110, 170]],
      behind(c, g, x) { const S = g.stage, n = by(S, 3, 5, 7), L = by(S, 26, 44, 66), sw = Math.sin(x.t / 600) * 0.06;   // the rainbow tail
        for (let i = 0; i < n; i++) { const f = n === 1 ? 0.5 : i / (n - 1), a = -1.25 + f * 1.15 + sw, col = this.RAIN[Math.round(f * (this.RAIN.length - 1))] , LL = L * (0.85 + Math.sin(f * Math.PI) * 0.25);
          c.save(); c.translate(g.cx + g.bw * 0.2, g.top + g.bh * 0.62); c.rotate(a); c.fillStyle = rgb(dk(col, 0.25)); c.beginPath(); c.ellipse(LL * 0.55, 2, LL * 0.58, by(S, 5, 7, 8), 0, 0, 7); c.fill();
          c.fillStyle = rgb(col); c.beginPath(); c.ellipse(LL * 0.55, 0, LL * 0.58, by(S, 5, 7, 8), 0, 0, 7); c.fill();
          if (S === 'Mega') { c.strokeStyle = 'rgba(255,240,180,.85)'; c.lineWidth = 1.4; c.beginPath(); c.arc(LL * 1.02, -4, 5, Math.PI * 0.5, Math.PI * 2); c.stroke(); } c.restore(); }
        if (S !== 'Bit') for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.42, g.top + g.bh * 0.55); c.scale(sd, 1); c.rotate(0.35 + Math.sin(x.t / 300) * 0.05);   // wings
          c.fillStyle = rgb(dk(x.body, 0.18)); c.beginPath(); c.ellipse(6, 2, by(S, 0, 14, 18), by(S, 0, 9, 11), 0.3, 0, 7); c.fill(); c.fillStyle = rgb(dk(x.body, 0.06)); c.beginPath(); c.ellipse(6, 0, by(S, 0, 14, 18), by(S, 0, 9, 11), 0.3, 0, 7); c.fill();
          if (S === 'Mega') { c.strokeStyle = '#e0aa30'; c.lineWidth = 1.6; c.beginPath(); c.arc(6, 0, 5, 0, Math.PI * 1.6); c.stroke(); c.beginPath(); c.arc(12, 3, 3, Math.PI, Math.PI * 2.6); c.stroke(); } c.restore(); }
        const cr = x.parts, ch = by(S, 7, 11, 15); for (let k = -1; k <= 1; k++) { c.fillStyle = rgb(k ? cr : lt(cr, 0.1)); c.beginPath(); c.ellipse(g.cx + k * ch * 0.6, g.top + 2 - (k ? 0 : 3), ch * 0.4, ch * 0.7, k * 0.3, 0, 7); c.fill(); }   // the comb
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.18, fy = 183 - Math.max(0, sd * x.walk) * 4; x.feet.push([fx, fy, 7]); c.strokeStyle = '#e9ad2e'; c.lineWidth = 3.5; c.lineCap = 'round';
          c.beginPath(); c.moveTo(fx, g.bot - 4); c.lineTo(fx, fy - 2); c.stroke(); for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx, fy - 2); c.lineTo(fx + k * 6, fy + 2); c.stroke(); } } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.38, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top - 6, g.bw * 0.42],
      face(c, g, x, look) { const S = g.stage, fi = faceTwo(c, g, x, look, { ey: 0.36, ex: 0.2, my: 0.62, s: by(S, 0.74, 0.82, 0.9) }), s = fi.s, y0 = g.top + g.bh * 0.46;
        if (x.back) return fi;
        if (S !== 'Bit') { c.fillStyle = rgb(x.parts); c.beginPath(); c.ellipse(g.cx - 4 * s, y0 + 14 * s, 3.5 * s, 6 * s, 0.3, 0, 7); c.fill(); }   // the wattle
        const fish = S !== 'Bit', gape = fish ? 4 * s : 0;
        c.fillStyle = '#d9921c'; c.beginPath(); c.moveTo(g.cx - 7 * s, y0 + 4 * s); c.lineTo(g.cx + 9 * s, y0 + 6 * s + gape); c.lineTo(g.cx - 7 * s, y0 + 10 * s); c.closePath(); c.fill();   // the lower beak, dropped open when it holds a fish
        if (fish) { const fl = by(S, 0, 26, 32) * s, sw = Math.sin(x.t / 150) * 0.1;   // the fish: its head between the jaws, its body and tail hanging out and flapping
          c.save(); c.translate(g.cx + 1 * s, y0 + 5 * s); c.rotate(0.28 + sw); c.fillStyle = '#5e88ad'; c.beginPath(); c.ellipse(fl * 0.5, 1, fl * 0.55, fl * 0.24, 0, 0, 7); c.fill(); c.fillStyle = '#86b0d2'; c.beginPath(); c.ellipse(fl * 0.5, 0, fl * 0.55, fl * 0.22, 0, 0, 7); c.fill();
          c.fillStyle = '#5e88ad'; c.save(); c.translate(fl * 1.02, 0); c.rotate(Math.sin(x.t / 120) * 0.35); c.beginPath(); c.moveTo(-2, 0); c.lineTo(fl * 0.32, -fl * 0.26); c.lineTo(fl * 0.24, 0); c.lineTo(fl * 0.32, fl * 0.26); c.closePath(); c.fill(); c.restore();
          c.fillStyle = '#c4dcee'; c.beginPath(); c.ellipse(fl * 0.55, -fl * 0.07, fl * 0.38, fl * 0.07, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(40,60,90,.5)'; c.lineWidth = 1; for (const k of [0.45, 0.62, 0.79]) { c.beginPath(); c.arc(fl * k, 0, fl * 0.1, -1, 1); c.stroke(); } c.restore(); }
        c.fillStyle = '#f6c445'; c.beginPath(); c.moveTo(g.cx - 7 * s, y0); c.lineTo(g.cx + 10 * s, y0 + 3 * s); c.lineTo(g.cx - 7 * s, y0 + 7 * s); c.closePath(); c.fill();   // the upper beak, over the fish
        c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(g.cx - 1 * s, y0 + 2 * s, 4 * s, 1 * s, 0.15, 0, 7); c.fill();
        return fi; }
    },

    /* ---------- the horror series: cosmic horrors from the Rift, drawn cute ---------- */
    /* Cthulhu: an octopus head with a beard of feelers on a crouching body, big bat wings and clawed hands and feet. Small wings and four feelers; long clawed arms, suckers and wings over its head from Byte; huge ribbed wings, eight feelers and a ridge of spines at Mega */
    Cthulhu: {
      special: true, dims: { Bit: [62, 64], Byte: [78, 80], Mega: [94, 96] }, ll: st => by(st, 6, 9, 11),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 18, 36, 56); },
      hh: g => g.bh * 0.62,
      path(c, g) { const hh = this.hh(g), tw = g.bw * 0.74; c.beginPath(); c.ellipse(g.cx, g.top + hh / 2, g.bw / 2, hh / 2, 0, 0, 7);
        c.moveTo(g.cx + tw / 2, g.top + hh * 0.8); c.roundRect(g.cx - tw / 2, g.top + hh * 0.8, tw, g.bot - g.top - hh * 0.8, [tw * 0.3, tw * 0.3, tw * 0.46, tw * 0.46]); },
      arms: 'stub', armW: st => by(st, 7, 8, 9), handR: st => by(st, 5, 6, 7), shoulderY: 0.7, shoulderIn: 0.1, armK: 1.35,
      hand(g, x, side) { const a = x.P.arm[side < 0 ? 0 : 1], k = this.armK, sx = g.cx + side * (g.bw / 2 - 4 - g.bw * this.shoulderIn), sy = g.top + g.bh * this.shoulderY; return [sx + side * a[2] * k, sy + a[3] * k]; },
      wing(c, sx, sy, sd, span, h, ribs, col, t) { const ph = (t % 3400) / 700, flap = ph < 1 ? Math.sin(ph * Math.PI * 2) * 0.5 : 0, fl = Math.sin(t / 320) * 0.1 + flap; c.save(); c.translate(sx, sy); c.scale(sd, 1); c.rotate(0.12 - fl);   // a slow sway and a big flap every few seconds   // a bat wing: ribs fanning out with the skin scalloped between them
        const tips = []; for (let k = 0; k < ribs; k++) { const f = ribs > 1 ? k / (ribs - 1) : 0; tips.push([span * (0.45 + f * 0.55), -h * (1 - f * 1.05)]); }
        c.fillStyle = rgb(col); c.beginPath(); c.moveTo(0, 0); c.lineTo(tips[0][0], tips[0][1]);
        for (let k = 1; k < ribs; k++) { const a = tips[k - 1], b = tips[k]; c.quadraticCurveTo((a[0] + b[0]) * 0.42, (a[1] + b[1]) * 0.42, b[0], b[1]); }
        c.quadraticCurveTo(span * 0.4, h * 0.14, 0, h * 0.2); c.closePath(); c.fill();
        c.strokeStyle = rgb(dk(col, 0.35)); c.lineWidth = 2.2; c.lineCap = 'round'; for (const [px, py] of tips) { c.beginPath(); c.moveTo(0, 0); c.lineTo(px, py); c.stroke(); }
        c.fillStyle = rgb(dk(col, 0.35)); c.beginPath(); c.moveTo(tips[0][0] - 2, tips[0][1] + 2); c.lineTo(tips[0][0] + 3, tips[0][1] - 6); c.lineTo(tips[0][0] + 3, tips[0][1] + 3); c.closePath(); c.fill(); c.restore(); },   // a hook on the top of each wing
      behind(c, g, x) { const S = g.stage, hh = this.hh(g);
        for (const sd of [-1, 1]) this.wing(c, g.cx + sd * g.bw * 0.3, g.top + hh * 0.95, sd, by(S, 18, 38, 58), by(S, 18, 50, 78), by(S, 3, 4, 5), dk(x.parts, 0.05), x.t + sd * 200);
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 4;   // crouching legs
          limb(c, [fx, g.bot - 8, fx + sd * 6, g.bot + this.ll(S) * 0.3, fx, 180 - lift], by(S, 12, 14, 16), dk(x.body, 0.12), sd < 0 ? x.L.legL : x.L.legR, x.t);
          blob(c, fx, 182 - lift, by(S, 9, 11, 13), 5, dk(x.body, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 9]);
          c.fillStyle = rgb(lt(x.acc, 0.3)); for (const k of [-1, 0, 1]) { const tx = fx + k * 5; c.beginPath(); c.moveTo(tx - 2, 184 - lift); c.lineTo(tx, 188 - lift); c.lineTo(tx + 2, 184 - lift); c.closePath(); c.fill(); } } },   // claws on its toes
      inside(c, g, x) { const S = g.stage, hh = this.hh(g); c.fillStyle = rgba(dk(x.body, 0.18), 0.55);   // spots on the head
        for (const [fx, fy, r] of [[0.3, 0.14, 5], [0.62, 0.1, 4], [0.8, 0.26, 3], [0.18, 0.32, 3]].slice(0, by(S, 2, 3, 4))) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + hh * fy, r * by(S, 1, 1.15, 1.3), 0, 7); c.fill(); }
        c.fillStyle = rgb(lt(x.body, 0.2)); c.beginPath(); c.ellipse(g.cx, g.bot - (g.bot - g.top - hh) * 0.42, g.bw * 0.24, (g.bot - g.top - hh) * 0.36, 0, 0, 7); c.fill(); },   // a round belly
      front(c, g, x) { const S = g.stage, hh = this.hh(g), n = by(S, 3, 4, 5), y0 = g.top + hh * 0.72, len = by(S, 18, 26, 34), span = g.bw * by(S, 0.42, 0.52, 0.56), col = dk(x.body, 0.18);
        if (!x.back) for (let i = 0; i < n; i++) { const f = i / (n - 1) - 0.5, tx = g.cx + f * span, sw = Math.sin(x.t / 260 + i * 1.7) * 7, cu = f < 0 ? -1 : 1, l = len * (1 - Math.abs(f) * 0.45);   // the beard of feelers
          const q = [tx, y0, tx + f * 12 + sw * 0.5, y0 + l * 0.6, tx + f * 22 + sw + cu * 4, y0 + l]; limb(c, q, by(S, 7, 9, 10) - Math.abs(f) * 2, col, x.L.armL, x.t);
          c.strokeStyle = rgb(col); c.lineWidth = by(S, 4, 4.5, 5); c.lineCap = 'round'; c.beginPath(); c.arc(q[4] + cu * 3, q[5], 3.5, cu > 0 ? Math.PI : 0, cu > 0 ? Math.PI * 2.2 : -Math.PI * 1.2, cu < 0); c.stroke();
          if (S !== 'Bit') { c.fillStyle = rgb(lt(x.body, 0.35)); for (const k of [0.35, 0.65]) { const p = qpt(q, k); c.beginPath(); c.arc(p[0], p[1], 1.5, 0, 7); c.fill(); } } }   // suckers
        if (!x.back) for (const sd of [-1, 1]) { const [hx, hy] = this.hand(g, x, sd); c.fillStyle = rgb(lt(x.acc, 0.3)); for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(hx + k * 4 - 2, hy + 3); c.lineTo(hx + k * 5, hy + 9); c.lineTo(hx + k * 4 + 2, hy + 3); c.closePath(); c.fill(); } }   // claws
        if (S === 'Mega') { c.fillStyle = rgb(dk(x.parts, 0.1)); for (const [dx, h] of [[-14, 10], [0, 16], [14, 10]]) { c.beginPath(); c.moveTo(g.cx + dx - 6, g.top + 3); c.quadraticCurveTo(g.cx + dx - 2, g.top - h * 0.6, g.cx + dx + 2, g.top - h); c.quadraticCurveTo(g.cx + dx + 3, g.top - h * 0.4, g.cx + dx + 6, g.top + 3); c.closePath(); c.fill(); } } },   // a ridge of spines
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.3, g.left + g.bw * 0.16, g.top + g.bh * 0.1, g.left + g.bw * 0.36, g.top + g.bh * 0.02],
      head: g => [g.cx, g.top, g.bw * 0.46],
      face(c, g, x, look) { const hh = FAM.Cthulhu.hh(g); return faceTwo(c, g, x, look, { ey: hh * 0.44 / g.bh, ex: 0.18, my: hh * 0.66 / g.bh, noMouth: true, s: by(g.stage, 0.74, 0.8, 0.86) }); }
    },
    /* Hastur: the King in Yellow. A tall hood with a pale mask deep inside it, a long tattered robe to the ground, a torn mantle over its shoulders and a crown on the hood. A small crown; torn sleeves, a staff, a taller crown and rags drifting round it from Byte; a huge crown, a dark halo behind it, glowing eyes, a staff with its sign and a flared, ragged robe at Mega */
    Hastur: {
      special: true, dims: { Bit: [56, 68], Byte: [70, 92], Mega: [86, 116] }, slots: { feet: false },
      bottom() { return 182; }, height(st) { return this.dims[st][1] + by(st, 26, 40, 62); },
      mask: [238, 230, 210],
      path(c, g, x) { const S = g.stage, R = g.left + g.bw, fl = g.bw * by(S, 0.08, 0.16, 0.24), n = by(S, 4, 7, 9), j = by(S, 6, 10, 14), t = x ? x.t : 0, tip = by(S, 10, 16, 22);
        c.beginPath(); c.moveTo(g.cx + 4, g.top - tip); c.bezierCurveTo(g.cx + g.bw * 0.28, g.top + g.bh * 0.02, g.cx + g.bw * 0.4, g.top + g.bh * 0.14, g.cx + g.bw * 0.4, g.top + g.bh * 0.32);
        c.quadraticCurveTo(R, g.top + g.bh * 0.4, R + fl, g.bot);   // the robe flaring out wide to the ground
        for (let i = 1; i <= n * 2; i++) { const f = i / (n * 2), px = R + fl - f * (g.bw + fl * 2), w = Math.sin(t / 260 + i) * 2; c.lineTo(px, i % 2 ? g.bot - j - (i % 4 === 1 ? 4 : 0) + w : g.bot); }   // the tattered hem
        c.lineTo(g.left - fl, g.bot); c.quadraticCurveTo(g.left, g.top + g.bh * 0.4, g.cx - g.bw * 0.4, g.top + g.bh * 0.32);
        c.bezierCurveTo(g.cx - g.bw * 0.4, g.top + g.bh * 0.14, g.cx - g.bw * 0.28, g.top + g.bh * 0.02, g.cx + 4, g.top - tip); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 8, 10), handR: st => by(st, 0, 5, 6.5), shoulderY: 0.46,
      hand(g, x, side) { const a = x.P.arm[side < 0 ? 0 : 1], sx = g.cx + side * (g.bw / 2 - 4), sy = g.top + g.bh * this.shoulderY; return [sx + side * a[2], sy + a[3]]; },
      sign(c, cx, cy, r, col) { c.strokeStyle = col; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy, r * 0.28, 0, 7); c.stroke();   // its own sign: three hooks round a ring
        for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3 - Math.PI / 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * r * 0.36, cy + Math.sin(a) * r * 0.36);
          c.quadraticCurveTo(cx + Math.cos(a + 0.5) * r, cy + Math.sin(a + 0.5) * r, cx + Math.cos(a + 1.1) * r * 0.8, cy + Math.sin(a + 1.1) * r * 0.8); c.stroke(); } },
      rag(c, x0, y0, len, a, col, t, k) { c.save(); c.translate(x0, y0); c.rotate(a); c.fillStyle = rgb(col); c.beginPath(); c.moveTo(0, -4);   // a strip of torn cloth
        for (let i = 0; i <= 6; i++) c.lineTo(i * len / 6, -4 * (1 - i / 7) + Math.sin(t / 240 + k + i) * 2.5); c.lineTo(len + 4, Math.sin(t / 240 + k + 7) * 2.5);
        for (let i = 6; i >= 0; i--) c.lineTo(i * len / 6, 4 * (1 - i / 7) + Math.sin(t / 240 + k + i) * 2.5); c.closePath(); c.fill(); c.restore(); },
      behind(c, g, x) { const S = g.stage, hy = g.top + g.bh * 0.22;
        if (S === 'Mega') { const pulse = 0.8 + 0.2 * Math.sin(x.t / 500); c.save(); c.globalAlpha = 0.85;   // a dark halo with rays behind its head
          c.fillStyle = rgba(dk(x.parts, 0.2), 0.8 * pulse); c.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2 + x.t / 4000, r = k % 2 ? g.bw * 0.5 : g.bw * (0.78 + 0.08 * Math.sin(k + x.t / 300)); c.lineTo(g.cx + Math.cos(a) * r, hy + Math.sin(a) * r); } c.closePath(); c.fill();
          c.strokeStyle = rgba(lt(x.body, 0.25), 0.9 * pulse); c.lineWidth = 3; c.beginPath(); c.arc(g.cx, hy, g.bw * 0.52, 0, 7); c.stroke(); c.restore(); }
        if (S !== 'Bit') for (let k = 0; k < by(S, 0, 2, 5); k++) { const a = x.t / 1500 + k * Math.PI * 2 / by(S, 1, 2, 5), rx = g.bw * 0.78, px = g.cx + Math.cos(a) * rx, py = g.top + g.bh * 0.55 + Math.sin(a) * g.bh * 0.32;   // rags drifting round it
          this.rag(c, px, py, by(S, 0, 18, 24), a + 2, dk(x.body, 0.12), x.t, k); }
        if (S === 'Bit') return; const [hx, hy2] = this.hand(g, x, 1), top = g.top - by(S, 0, 6, 18), gold = x.acc;   // the staff, held in its right hand
        c.strokeStyle = rgb(dk(x.parts, 0.25)); c.lineWidth = by(S, 0, 4, 5); c.lineCap = 'round'; c.beginPath(); c.moveTo(hx + 3, 182); c.lineTo(hx, top); c.stroke();
        if (S === 'Mega') { c.save(); c.shadowColor = rgba(lt(gold, 0.3), 1); c.shadowBlur = 10; this.sign(c, hx, top - 12, 13, rgb(gold)); c.restore(); }
        else { c.strokeStyle = rgb(gold); c.lineWidth = 3; c.beginPath(); c.arc(hx, top - 6, 6, Math.PI * 0.5, Math.PI * 2.2); c.stroke(); } },
      inside(c, g, x) { const S = g.stage, mx = g.cx, my = g.top + g.bh * by(S, 0.36, 0.28, 0.25), rx = g.bw * by(S, 0.3, 0.26, 0.23), ry = g.bh * by(S, 0.22, 0.17, 0.15);
        c.fillStyle = rgb(dk(x.body, 0.78)); c.beginPath(); c.ellipse(mx, my + 1, rx * 1.3, ry * 1.35, 0, 0, 7); c.fill();   // the deep, dark hood
        c.fillStyle = rgb(dk(this.mask, 0.14)); c.beginPath(); c.ellipse(mx, my + 3, rx * 0.84, ry * 0.86, 0, 0, 7); c.fill(); c.fillStyle = rgb(this.mask); c.beginPath(); c.ellipse(mx, my + 1, rx * 0.84, ry * 0.86, 0, 0, 7); c.fill();   // the pale mask
        c.strokeStyle = rgba(dk(x.body, 0.3), 0.6); c.lineWidth = 2; for (const f of [-0.3, -0.1, 0.1, 0.3]) { c.beginPath(); c.moveTo(g.cx + g.bw * f * 0.7, g.top + g.bh * 0.5); c.quadraticCurveTo(g.cx + g.bw * (f + 0.05), g.top + g.bh * 0.8, g.cx + g.bw * f * 1.4, g.bot); c.stroke(); }   // deep folds
        if (S === 'Mega' && !x.back) this.sign(c, g.cx, g.top + g.bh * 0.72, 12, rgb(dk(x.parts, 0.1))); },
      front(c, g, x) { const S = g.stage, col = x.acc, sy = g.top + g.bh * by(S, 0.6, 0.47, 0.42), mw = g.bw * by(S, 0.5, 0.58, 0.64), ml = g.bh * by(S, 0.18, 0.22, 0.24);
        c.fillStyle = rgb(dk(x.body, 0.14)); c.beginPath(); c.moveTo(g.cx - g.bw * 0.3, sy - 4); c.lineTo(g.cx + g.bw * 0.3, sy - 4);   // a torn mantle over its shoulders, cut into long points
        const n = by(S, 5, 7, 9); c.lineTo(g.cx + mw, sy + 4); for (let i = 1; i <= n * 2; i++) { const f = i / (n * 2), px = g.cx + mw - f * mw * 2, d = Math.sin(f * Math.PI) * 0.4 + 0.6, w = Math.sin(x.t / 300 + i) * 1.5; c.lineTo(px, sy + (i % 2 ? ml * d : ml * d * 0.45) + w); }
        c.lineTo(g.cx - mw, sy + 4); c.closePath(); c.fill();
        if (S !== 'Bit') for (const sd of [-1, 1]) { const [hx, hy] = this.hand(g, x, sd), sx = g.cx + sd * (g.bw / 2 - 4), sy2 = g.top + g.bh * this.shoulderY;   // torn sleeves
          c.fillStyle = rgb(dk(x.body, 0.08)); c.beginPath(); c.moveTo(sx - sd * 4, sy2 - 4); c.lineTo(hx + sd * 3, hy - 8); for (let k = 0; k <= 4; k++) c.lineTo(hx + sd * (7 - k * 4), hy + 2 + (k % 2 ? 8 : 0)); c.lineTo(sx - sd * 6, sy2 + 10); c.closePath(); c.fill(); }
        const cy = g.top + by(S, 2, 0, -2), cw = by(S, 12, 16, 20), ch = by(S, 10, 16, 28), pts = by(S, 3, 5, 7);   // a crown on the hood
        if (S === 'Mega') { c.save(); c.shadowColor = rgba(lt(col, 0.3), 1); c.shadowBlur = 12; }
        c.fillStyle = rgb(dk(col, 0.25)); c.fillRect(g.cx + 4 - cw, cy - 1, cw * 2, 7); c.fillStyle = rgb(col); c.beginPath(); c.moveTo(g.cx + 4 - cw, cy + 2);
        for (let i = 0; i < pts; i++) { const f = i / (pts - 1), px = g.cx + 4 - cw + f * cw * 2, mid = Math.abs(f - 0.5); c.lineTo(px - (i ? 2.5 : 0), cy - 2); c.lineTo(px, cy - ch * (1.2 - mid * 1.1)); c.lineTo(px + (i < pts - 1 ? 2.5 : 0), cy - 2); }
        c.lineTo(g.cx + 4 + cw, cy + 2); c.closePath(); c.fill(); if (S === 'Mega') c.restore();
        if (S !== 'Bit') { c.fillStyle = rgb(lt(x.parts, 0.1)); for (let i = 0; i < pts; i++) { c.beginPath(); c.arc(g.cx + 4 - cw + i / (pts - 1) * cw * 2, cy + 2, S === 'Mega' ? 2.4 : 1.8, 0, 7); c.fill(); } } },   // jewels on the band
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.6, g.left + g.bw * 0.2, g.top + g.bh * 0.3, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 4, g.bw * 0.36],
      face(c, g, x, look) { const S = g.stage, fi = faceTwo(c, g, x, look, { ey: by(S, 0.34, 0.27, 0.24), ex: by(S, 0.12, 0.1, 0.09), my: by(S, 0.45, 0.36, 0.32), lidCol: FAM.Hastur.mask, s: by(S, 0.56, 0.6, 0.62) });
        if (S !== 'Mega' || x.back) return fi; c.save(); c.globalCompositeOperation = 'lighter'; const gl = 0.35 + Math.sin(x.t / 250) * 0.12;   // its eyes glow at Mega
        for (const sd of [-1, 1]) { c.fillStyle = rgba(lt(x.acc, 0.3), gl); c.beginPath(); c.arc(g.cx + sd * fi.ex, fi.ey, 9 * fi.s, 0, 7); c.fill(); } c.restore(); return fi; }
    },
    /* Shoggoth: a wide mound of dark goo with eyes of every size all over it, feelers curling up off its top and a wide toothy mouth. Three spare eyes and three feelers; eight eyes, six feelers and teeth from Byte; fourteen eyes that glow, nine feelers and a second mouth on its side at Mega */
    Shoggoth: {
      special: true, dims: { Bit: [74, 50], Byte: [94, 68], Mega: [114, 86] }, slots: { feet: false },
      bottom() { return 182; }, height(st) { return this.dims[st][1] + by(st, 16, 28, 40); },
      path(c, g, x) { const t = x ? x.t : 0, base = g.bot - 5, rx = g.bw / 2, ry = g.bh - 5, n = 32; c.beginPath();
        for (let i = 0; i <= n; i++) { const a = Math.PI + i / n * Math.PI, w = 1 + 0.05 * Math.sin(a * 6 + t / 400) + 0.03 * Math.sin(a * 3 - t / 300); const px = g.cx + Math.cos(a) * rx * w, py = base + Math.sin(a) * ry * w;
          i ? c.lineTo(px, py) : c.moveTo(px, py); }
        c.quadraticCurveTo(g.cx + rx * 1.1, g.bot, g.cx + rx * 0.7, g.bot); c.lineTo(g.cx - rx * 0.7, g.bot); c.quadraticCurveTo(g.cx - rx * 1.1, g.bot, g.cx - rx, base); c.closePath(); },
      eyeAt(c, px, py, r0, t, k, lidCol, glow, wave) { const o = wave == null ? 1 : Math.max(0, Math.min(1, (Math.sin(t / 1300 + wave) + 0.25) * 1.6)), shut = o < 0.2 || (t + k * 913) % 3400 < 140, r = r0 * (0.55 + 0.45 * o);   // o: how far open, so whole patches of eyes sink shut while others open
        c.fillStyle = rgb(lidCol); c.beginPath(); c.arc(px, py, r + 1.5, 0, 7); c.fill();
        if (shut) { c.strokeStyle = '#2b2430'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(px - r, py); c.quadraticCurveTo(px, py + r * 0.5, px + r, py); c.stroke(); return; }
        if (glow) { c.save(); c.shadowColor = rgba(glow, 0.9); c.shadowBlur = 6; } c.fillStyle = glow ? rgb(lt(glow, 0.55)) : '#fff'; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); if (glow) c.restore();
        const ox = Math.sin(t / 900 + k) * r * 0.3, oy = Math.cos(t / 700 + k * 2) * r * 0.2;
        c.fillStyle = '#2b2430'; c.beginPath(); c.arc(px + ox, py + oy, r * 0.5, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(px + ox - r * 0.18, py + oy - r * 0.2, r * 0.16, 0, 7); c.fill(); },
      mouth(c, px, py, w, h, nt, col) { c.fillStyle = '#3a1f2a'; c.beginPath(); c.moveTo(px - w / 2, py); c.quadraticCurveTo(px, py + h * 2, px + w / 2, py); c.quadraticCurveTo(px, py + h * 0.5, px - w / 2, py); c.fill();   // a wide grin full of little teeth
        c.fillStyle = '#f2ece0'; for (let i = 0; i < nt; i++) { const f = (i + 0.5) / nt, tx = px - w / 2 + f * w, ty = py + Math.sin(f * Math.PI) * h * 0.5; c.beginPath(); c.moveTo(tx - 1.8, ty); c.lineTo(tx, ty + 4); c.lineTo(tx + 1.8, ty); c.closePath(); c.fill(); }
        c.fillStyle = col; c.beginPath(); c.ellipse(px, py + h * 1.05, w * 0.14, h * 0.3, 0, 0, 7); c.fill(); },   // a tongue
      behind(c, g, x) { const S = g.stage; c.fillStyle = rgb(dk(x.body, 0.25)); c.beginPath(); c.ellipse(g.cx, 182, g.bw * by(S, 0.58, 0.62, 0.66), by(S, 5, 6, 8), 0, 0, 7); c.fill();   // goo spreading round it
        const n = by(S, 3, 6, 9); for (let i = 0; i < n; i++) { const f = n > 1 ? i / (n - 1) - 0.5 : 0, a = Math.PI * (1.5 + f * 0.9), bx = g.cx + Math.cos(a) * g.bw * 0.4, byy = g.bot - 5 + Math.sin(a) * (g.bh - 5) * 0.92;   // feelers curling up off its top
          const len = by(S, 14, 22, 30) * (1 - Math.abs(f) * 0.3), sw = Math.sin(x.t / 360 + i * 1.9) * 4, d = f < 0 ? -1 : 1, q = [bx, byy + 6, bx + d * len * 0.3 + sw, byy - len * 0.5, bx + d * len * 0.5 + sw, byy - len];
          limb(c, q, by(S, 6, 7, 8) - Math.abs(f) * 2, dk(x.body, 0.05), i % 2 ? x.L.armR : x.L.armL, x.t);
          c.strokeStyle = rgb(dk(x.body, 0.05)); c.lineWidth = by(S, 4, 4.5, 5); c.lineCap = 'round'; c.beginPath(); c.arc(q[4] + d * 4, q[5], 4, d > 0 ? Math.PI : 0, d > 0 ? Math.PI * 2.4 : -Math.PI * 1.4, d < 0); c.stroke(); } },
      inside(c, g, x) { const S = g.stage; c.lineCap = 'round';
        for (const [f, col, a] of [[0.22, x.parts, 0.3], [0.62, x.acc, 0.2], [0.84, x.parts, 0.22]]) { c.strokeStyle = rgba(col, a); c.lineWidth = 5; c.beginPath(); c.moveTo(g.left + g.bw * (f - 0.1), g.bot - 4);   // an oily sheen
          c.bezierCurveTo(g.left + g.bw * (f + 0.12), g.top + g.bh * 0.7, g.left + g.bw * (f - 0.12), g.top + g.bh * 0.4, g.left + g.bw * (f + 0.06), g.top + g.bh * 0.1); c.stroke(); }
        if (x.back) return; const E = [[0.13, 0.62, 4], [0.87, 0.58, 3.5], [0.24, 0.24, 5], [0.78, 0.26, 6], [0.5, 0.08, 3.5], [0.1, 0.84, 3.5], [0.9, 0.84, 4], [0.36, 0.1, 3], [0.66, 0.1, 4], [0.06, 0.44, 3], [0.94, 0.42, 3.5], [0.3, 0.9, 3], [0.7, 0.9, 3], [0.18, 0.44, 2.5]];
        E.slice(0, by(S, 4, 10, 14)).forEach(([fx, fy, r], k) => this.eyeAt(c, g.left + g.bw * fx, g.top + g.bh * fy, r * by(S, 0.9, 1.05, 1.2), x.t, k, x.body, S === 'Mega' ? x.parts : null, fx * 6 + fy * 3));
        if (S === 'Mega') this.mouth(c, g.left + g.bw * 0.8, g.top + g.bh * 0.74, 16, 5, 4, '#d06070'); },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.62, g.left + g.bw * 0.2, g.top + g.bh * 0.26, g.left + g.bw * 0.38, g.top + g.bh * 0.06],
      head: g => [g.cx, g.top + 4, g.bw * 0.42],
      face(c, g, x, look) { const S = g.stage, fi = faceTwo(c, g, x, look, { ey: by(S, 0.42, 0.38, 0.36), ex: 0.13, my: by(S, 0.66, 0.6, 0.56), s: by(S, 0.72, 0.8, 0.86) });
        if (x.back || S === 'Bit') return fi; FAM.Shoggoth.mouth(c, g.cx, fi.my - 1, g.bw * by(S, 0, 0.3, 0.34), by(S, 0, 6, 8) * (x.open ? 1.4 : 1), by(S, 0, 6, 8), '#d06070'); return fi; }
    },
    /* Dagon: a deep one, a lanky frog-fish that stands like a person. A round fish with a little crest and stubby legs; a pear-shaped body, a crest running down its back, long clawed webbed arms, long bent legs, gills and a toothy mouth from Byte; a bigger crest, a coral crown, a string of pearls and barnacles at Mega */
    Dagon: {
      special: true, dims: { Bit: [62, 58], Byte: [68, 86], Mega: [80, 106] }, ll: st => by(st, 6, 14, 18),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 22, 32); },
      path(c, g) { const R = g.left + g.bw, sh = by(g.stage, 0.5, 0.36, 0.34); c.beginPath(); c.moveTo(g.cx, g.top); c.bezierCurveTo(g.cx + g.bw * 0.46, g.top, R, g.top + g.bh * 0.14, R, g.top + g.bh * sh);
        c.bezierCurveTo(R - g.bw * 0.12, g.top + g.bh * (sh + 0.2), R - g.bw * 0.04, g.bot, g.cx, g.bot); c.bezierCurveTo(g.left + g.bw * 0.04, g.bot, g.left + g.bw * 0.12, g.top + g.bh * (sh + 0.2), g.left, g.top + g.bh * sh);
        c.bezierCurveTo(g.left, g.top + g.bh * 0.14, g.cx - g.bw * 0.46, g.top, g.cx, g.top); c.closePath(); },
      arms: 'stub', armW: st => by(st, 0, 7, 8), handR: st => by(st, 0, 5.5, 6.5), shoulderY: 0.5, armK: 1.55,
      hand(g, x, side) { const a = x.P.arm[side < 0 ? 0 : 1], k = this.armK, sx = g.cx + side * (g.bw / 2 - 4), sy = g.top + g.bh * this.shoulderY; return [sx + side * a[2] * k, sy + a[3] * k]; },
      fin(c, pts, h, col, t) { c.fillStyle = rgb(col); c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);   // a webbed fin with spines, along a list of points
        for (let i = 1; i < pts.length; i++) { const [px, py] = pts[i], [qx, qy] = pts[i - 1], w = Math.sin(t / 300 + i) * 1.5, hh = h * (1 - i / pts.length * 0.5); c.quadraticCurveTo((px + qx) / 2 - hh * 0.3, (py + qy) / 2 - hh * 0.4, px + w - hh * 0.5, py - hh); c.lineTo(px, py); }
        c.closePath(); c.fill(); c.strokeStyle = rgb(dk(col, 0.3)); c.lineWidth = 1.4; for (let i = 1; i < pts.length; i++) { const [px, py] = pts[i], hh = h * (1 - i / pts.length * 0.5); c.beginPath(); c.moveTo(px, py + 2); c.lineTo(px - hh * 0.5, py - hh + 2); c.stroke(); } },
      behind(c, g, x) { const S = g.stage, fc = x.parts, n = by(S, 3, 6, 8), pts = [];
        for (let i = 0; i <= n; i++) { const a = Math.PI * (1.62 - i / n * 0.75); pts.push([g.cx + Math.cos(a) * g.bw * 0.48 + g.bw * 0.04, g.top + g.bh * 0.34 + Math.sin(a) * g.bh * 0.36]); }   // a crest from the top of its head down its back
        this.fin(c, pts, by(S, 10, 14, 18), fc, x.t);
        if (S !== 'Bit') for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.48, g.top + g.bh * 0.22); c.scale(sd, 1); c.rotate(Math.sin(x.t / 400 + sd) * 0.1); c.fillStyle = rgb(fc); c.beginPath(); c.moveTo(0, -6);   // fins where ears would be
          c.lineTo(by(S, 0, 13, 17), -12); c.quadraticCurveTo(by(S, 0, 9, 12), 0, by(S, 0, 13, 17), 10); c.lineTo(0, 6); c.closePath(); c.fill(); c.restore(); }
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.2, fx = hx + sd * by(S, 2, 8, 10), lift = Math.max(0, sd * x.walk) * 5;   // long bent legs with webbed feet
          limb(c, [hx, g.bot - 10, hx + sd * by(S, 6, 16, 20), g.bot + this.ll(S) * 0.35, fx, 180 - lift], by(S, 10, 10, 12), dk(x.body, 0.12), sd < 0 ? x.L.legL : x.L.legR, x.t);
          c.fillStyle = rgb(fc); c.beginPath(); c.moveTo(fx - sd * 2, 177 - lift); for (const k of [-1, 0, 1]) c.lineTo(fx + sd * 5 + k * by(S, 5, 7, 8), 184 - lift); c.closePath(); c.fill();
          c.fillStyle = rgb(dk(x.body, 0.15)); for (const k of [-1, 0, 1]) { c.beginPath(); c.arc(fx + sd * 5 + k * by(S, 5, 7, 8), 184 - lift, 2, 0, 7); c.fill(); } x.feet.push([fx, 182 - lift, 9]); } },
      inside(c, g, x) { const S = g.stage; c.fillStyle = rgb(lt(x.body, 0.38)); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.24, g.bw * 0.28, g.bh * 0.26, 0, 0, 7); c.fill();   // a pale belly
        if (S !== 'Bit') { c.strokeStyle = rgba(dk(x.body, 0.25), 0.5); c.lineWidth = 1.2; for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { const px = g.left + g.bw * (0.12 + k * 0.15 + (r % 2) * 0.07), py = g.top + g.bh * (0.04 + r * 0.06);   // scales
            c.beginPath(); c.arc(px, py, 5, 0.2, Math.PI - 0.2); c.stroke(); }
          c.strokeStyle = rgba(dk(x.body, 0.35), 0.8); c.lineWidth = 1.6; for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const gx = g.cx + sd * g.bw * (0.34 + k * 0.045), gy = g.top + g.bh * 0.38;   // gills
            c.beginPath(); c.moveTo(gx, gy - 5); c.quadraticCurveTo(gx + sd * 3, gy, gx, gy + 5); c.stroke(); } }
        if (S === 'Mega' && !x.back) { c.fillStyle = '#f4eee2'; for (let k = 0; k < 9; k++) { const f = k / 8, a = Math.PI * (0.15 + f * 0.7); c.beginPath(); c.arc(g.cx - Math.cos(a) * g.bw * 0.3, g.top + g.bh * 0.5 + Math.sin(a) * 9, 2.6, 0, 7); c.fill(); }   // a string of pearls
          for (const [fx, fy, r] of [[0.84, 0.62, 4], [0.88, 0.72, 3], [0.16, 0.76, 3.5]]) { c.fillStyle = '#b8b0a2'; c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, r, 0, 7); c.fill(); c.fillStyle = '#7a7266'; c.beginPath(); c.arc(g.left + g.bw * fx, g.top + g.bh * fy, r * 0.4, 0, 7); c.fill(); } } },   // barnacles
      front(c, g, x) { const S = g.stage;
        if (!x.back && S !== 'Bit') for (const sd of [-1, 1]) { const [hx, hy] = this.hand(g, x, sd); c.fillStyle = rgba(x.parts, 0.9); c.beginPath(); c.moveTo(hx - 5, hy + 1); c.lineTo(hx - 7, hy + 10); c.lineTo(hx + 7, hy + 10); c.lineTo(hx + 5, hy + 1); c.closePath(); c.fill();   // webbed claws
          c.fillStyle = rgb(lt(x.acc, 0.3)); for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(hx + k * 6 - 2, hy + 9); c.lineTo(hx + k * 7, hy + 15); c.lineTo(hx + k * 6 + 2, hy + 9); c.closePath(); c.fill(); } }
        if (S !== 'Mega') return; const col = x.acc; c.strokeStyle = rgb(col); c.lineCap = 'round';   // a coral crown
        for (const [dx, h, a] of [[-12, 16, -0.4], [0, 22, 0], [12, 16, 0.4]]) { const bx = g.cx + dx, bt = g.top + 6, tx = bx + Math.sin(a) * h, ty = bt - Math.cos(a) * h; c.lineWidth = 4; c.beginPath(); c.moveTo(bx, bt); c.lineTo(tx, ty); c.stroke();
          c.lineWidth = 3; for (const sd of [-1, 1]) { const mx = (bx + tx) / 2, my = (bt + ty) / 2; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + sd * 6, my - 6); c.stroke(); } c.fillStyle = rgb(lt(col, 0.2)); c.beginPath(); c.arc(tx, ty, 2.5, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.4, g.left + g.bw * 0.16, g.top + g.bh * 0.16, g.left + g.bw * 0.36, g.top + g.bh * 0.04],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face(c, g, x, look) { const S = g.stage, ey = by(S, 0.36, 0.2, 0.18), fi = faceTwo(c, g, x, look, { ey, ex: 0.21, my: ey + by(S, 0.24, 0.15, 0.13), s: by(S, 0.8, 0.84, 0.9) });
        if (x.back) return fi; c.fillStyle = rgb(dk(x.body, 0.06)); for (const sd of [-1, 1]) { c.beginPath(); c.arc(g.cx + sd * fi.ex, fi.ey - 2, 12 * fi.s, Math.PI * 1.05, Math.PI * 1.95); c.fill(); }   // bulging eye ridges
        if (S !== 'Bit') FAM.Shoggoth.mouth(c, g.cx, fi.my - 2, g.bw * 0.52, by(S, 0, 5, 6) * (x.open ? 1.4 : 1) * (1 + 0.7 * Math.max(0, Math.sin(x.t / 220)) * ((x.t % 2600) < 900 ? 1 : 0)), by(S, 0, 7, 9), '#d06070'); return fi; }   // a wide fish mouth full of little teeth
    },
    /* Migo: a fungus-insect from the stars. A big round head with huge eyes and two short feelers on a small ridged body, thin jointed legs and veined insect wings. Two legs and one pair of wings; four legs, crab pincers and longer wings from Byte; six legs, two pairs of wings, a glowing head and a brain in a jar at Mega */
    Migo: {
      special: true, dims: { Bit: [62, 62], Byte: [74, 78], Mega: [86, 94] }, ll: st => by(st, 12, 18, 22),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 18, 28, 36); },
      hh: g => g.bh * by(g.stage, 0.66, 0.62, 0.6),
      path(c, g) { const hh = this.hh(g), bw2 = g.bw * by(g.stage, 0.5, 0.52, 0.54); c.beginPath(); c.ellipse(g.cx, g.top + hh / 2, g.bw / 2, hh / 2, 0, 0, 7);
        c.moveTo(g.cx + bw2 / 2, g.top + hh * 0.9 + (g.bh - hh * 0.9) / 2); c.ellipse(g.cx, g.top + hh * 0.9 + (g.bh - hh * 0.9) / 2, bw2 / 2, (g.bh - hh * 0.9) / 2, 0, 0, 7); },
      arms: 'claw', armW: st => by(st, 0, 4, 5), clawSz: st => by(st, 0, 8, 10), shoulderY: 0.74, shoulderIn: 0.2,
      behind(c, g, x) { const S = g.stage, hh = this.hh(g), wc = lt(x.parts, 0.2);
        for (let pr = 0; pr < (S === 'Mega' ? 2 : 1); pr++) for (const sd of [-1, 1]) { const fl = Math.sin(x.t / 120 + pr * 1.4) * 0.16, wl = by(S, 26, 42, 54) - pr * 12;   // long veined insect wings
          c.save(); c.translate(g.cx + sd * g.bw * 0.16, g.top + hh * (0.86 + pr * 0.12)); c.scale(sd, 1); c.rotate(-0.55 + fl + pr * 0.7); c.fillStyle = rgba(wc, 0.7); c.beginPath(); c.ellipse(wl * 0.55, 0, wl * 0.62, wl * 0.2, 0, 0, 7); c.fill();
          c.strokeStyle = rgba(dk(x.parts, 0.3), 0.75); c.lineWidth = 1; c.beginPath(); c.moveTo(2, 0); c.lineTo(wl * 1.1, 0); for (const k of [0.3, 0.55, 0.8]) { c.moveTo(wl * k, 0); c.lineTo(wl * (k + 0.12), -wl * 0.15); c.moveTo(wl * k, 0); c.lineTo(wl * (k + 0.12), wl * 0.14); } c.stroke(); c.restore(); }
        const n = by(S, 1, 2, 3); for (const sd of [-1, 1]) for (let k = 0; k < n; k++) { const hx = g.cx + sd * g.bw * (0.1 + k * 0.06), lift = Math.max(0, Math.sin(x.t / 130 + k * 2 + sd)) * 3 * Math.abs(x.walk), kx = hx + sd * (by(S, 14, 20, 24) + k * 6), tx = kx + sd * (4 + k * 3);   // thin legs with their knees up high
          limb(c, [hx, g.bot - 6, (hx + kx) / 2, g.bot - by(S, 10, 16, 20), kx, g.bot - by(S, 4, 8, 10)], 4.5, dk(x.parts, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t);
          limb(c, [kx, g.bot - by(S, 4, 8, 10), kx + sd * 2, (g.bot + 182) / 2, tx, 182 - lift], 4, dk(x.parts, 0.15), sd < 0 ? x.L.legL : x.L.legR, x.t); x.feet.push([tx, 182 - lift, 3]); }
        for (const sd of [-1, 1]) { const bx = g.cx + sd * g.bw * 0.16, byy = g.top + 4, w = Math.sin(x.t / 300 + sd) * 2;   // two short feelers
          c.strokeStyle = rgb(dk(x.body, 0.2)); c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, byy); c.quadraticCurveTo(bx + sd * 4, byy - 10, bx + sd * 8 + w, byy - by(S, 10, 14, 18)); c.stroke();
          c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(bx + sd * 8 + w, byy - by(S, 10, 14, 18), 2.4, 0, 7); c.fill(); }
        if (S === 'Mega') { const jx = g.cx + g.bw * 0.74, jw = 24, jh = 34, jy = 182 - jh;   // a brain in a jar beside it
          c.fillStyle = '#8f949c'; c.fillRect(jx - jw / 2, jy, jw, jh); c.fillStyle = '#c6cad1'; c.fillRect(jx - jw / 2, jy, jw, 5); c.fillRect(jx - jw / 2, jy + jh - 4, jw, 4);
          c.fillStyle = 'rgba(190,230,240,.85)'; c.fillRect(jx - jw / 2 + 3, jy + 7, jw - 6, jh - 13); c.fillStyle = '#e89aae'; c.beginPath(); c.arc(jx - 3.5, jy + 17, 6, 0, 7); c.arc(jx + 3.5, jy + 17, 6, 0, 7); c.fill();
          c.strokeStyle = '#c4687e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(jx, jy + 12); c.lineTo(jx, jy + 22); c.moveTo(jx - 7, jy + 16); c.quadraticCurveTo(jx - 4, jy + 13, jx - 2, jy + 17); c.moveTo(jx + 7, jy + 18); c.quadraticCurveTo(jx + 4, jy + 21, jx + 2, jy + 17); c.stroke(); } },
      inside(c, g, x) { const S = g.stage, hh = this.hh(g), glow = S === 'Mega' ? 0.25 + 0.2 * Math.sin(x.t / 300) : 0;
        c.strokeStyle = rgba(lt(dk(x.body, 0.2), glow), 0.5); c.lineWidth = 2; c.lineCap = 'round';   // wrinkles across the top of its head
        for (const [fx, fy, a, r] of [[0.26, 0.14, 0.3, 8], [0.7, 0.12, 2.6, 9], [0.5, 0.06, 1.8, 7]].slice(0, by(S, 1, 2, 3))) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + hh * fy, r, a, a + 2.2); c.stroke(); }
        c.strokeStyle = rgba(dk(x.body, 0.22), 0.55); c.lineWidth = 1.8; const by0 = g.top + hh * 0.9;   // ridges on its body
        for (let k = 1; k <= by(S, 2, 3, 3); k++) { const y = by0 + (g.bot - by0) * k / 4; c.beginPath(); c.moveTo(g.cx - g.bw * 0.3, y - 2); c.quadraticCurveTo(g.cx, y + 4, g.cx + g.bw * 0.3, y - 2); c.stroke(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.36, g.left + g.bw * 0.16, g.top + g.bh * 0.12, g.left + g.bw * 0.36, g.top + g.bh * 0.03],
      head: g => [g.cx, g.top, g.bw * 0.46],
      face(c, g, x, look) { const hh = FAM.Migo.hh(g); return faceTwo(c, g, x, look, { ey: hh * 0.5 / g.bh, ex: 0.22, my: hh * 0.78 / g.bh, s: by(g.stage, 0.95, 1, 1.05) }); }
    },
    /* Nightgaunt: a thin black gargoyle with no mouth, only two pale eyes, horns curling back, big bat wings, a barbed tail and long clawed limbs, crouching. Small wings and nub horns; long thin arms and wings over its head from Byte; huge wings, long curling horns, spines down its back and glowing eyes at Mega */
    Nightgaunt: {
      special: true, dims: { Bit: [50, 66], Byte: [56, 86], Mega: [62, 104] }, ll: st => by(st, 10, 14, 18),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 22, 40, 58); },
      hh: g => g.bh * by(g.stage, 0.54, 0.46, 0.42),
      path(c, g) { const hh = this.hh(g), tw = g.bw * 0.5; c.beginPath(); c.ellipse(g.cx, g.top + hh / 2, g.bw * 0.46, hh / 2, 0, 0, 7);   // a smooth head on a thin body
        c.moveTo(g.cx + tw / 2, g.top + hh * 0.85); c.roundRect(g.cx - tw / 2, g.top + hh * 0.85, tw, g.bot - g.top - hh * 0.85, [tw * 0.3, tw * 0.3, tw * 0.5, tw * 0.5]); },
      arms: 'stub', armW: st => by(st, 4, 5, 5), handR: st => by(st, 3.5, 4, 4.5), armK: 1.5,
      shoulder(g) { return { y: g.top + this.hh(g) + 6, dx: g.bw * 0.24 }; },
      wing(c, sx, sy, sd, span, h, ribs, col, t) { const ph = ((t + 1500) % 3000) / 600, flap = ph < 1 ? Math.sin(ph * Math.PI * 2) * 0.45 : 0, fl = Math.sin(t / 260) * 0.1 + flap; c.save(); c.translate(sx, sy); c.scale(sd, 1); c.rotate(0.05 - fl);   // a bat wing raised over its head, flapping now and then
        const tips = []; for (let k = 0; k < ribs; k++) { const f = ribs > 1 ? k / (ribs - 1) : 0; tips.push([span * (0.35 + f * 0.65), -h * (1 - f * 0.95)]); }
        c.fillStyle = rgb(col); c.beginPath(); c.moveTo(0, 0); c.lineTo(tips[0][0], tips[0][1]);
        for (let k = 1; k < ribs; k++) { const a = tips[k - 1], b = tips[k]; c.quadraticCurveTo((a[0] + b[0]) * 0.42, (a[1] + b[1]) * 0.42, b[0], b[1]); }
        c.quadraticCurveTo(span * 0.4, h * 0.1, 0, h * 0.14); c.closePath(); c.fill();
        c.strokeStyle = rgb(dk(col, 0.4)); c.lineWidth = 2.2; c.lineCap = 'round'; for (const [px, py] of tips) { c.beginPath(); c.moveTo(0, 0); c.lineTo(px, py); c.stroke(); }
        c.fillStyle = rgb(dk(col, 0.4)); c.beginPath(); c.moveTo(tips[0][0] - 2, tips[0][1] + 3); c.lineTo(tips[0][0] - 1, tips[0][1] - 7); c.lineTo(tips[0][0] + 3, tips[0][1] + 2); c.closePath(); c.fill(); c.restore(); },   // a hook on the top
      behind(c, g, x) { const S = g.stage, hh = this.hh(g);
        for (const sd of [-1, 1]) this.wing(c, g.cx + sd * g.bw * 0.16, g.top + hh * 1.05, sd, by(S, 22, 36, 52), by(S, 24, 56, 82), by(S, 3, 4, 5), dk(x.parts, 0.1), x.t + sd * 150);
        const sw = Math.sin(x.t / 400) * 6, q = [g.cx + 4, g.bot - 6, g.cx + 26 + sw, g.bot + 6, g.cx + by(S, 26, 34, 42) + sw, g.bot - by(S, 10, 20, 30)];   // a barbed tail curling up
        limb(c, q, by(S, 4, 4.5, 5), dk(x.body, 0.05), x.L.legR, x.t); c.fillStyle = rgb(dk(x.body, 0.05)); c.save(); c.translate(q[4], q[5]); c.rotate(Math.atan2(q[5] - q[3], q[4] - q[2])); c.beginPath(); c.moveTo(-2, -6); c.lineTo(10, 0); c.lineTo(-2, 6); c.lineTo(2, 0); c.closePath(); c.fill(); c.restore();
        for (const sd of [-1, 1]) { const hl = by(S, 8, 14, 22), bx = g.cx + sd * g.bw * 0.2, byy = g.top + 6; c.strokeStyle = rgb(dk(x.parts, 0.1)); c.lineWidth = by(S, 4, 5, 6); c.lineCap = 'round';   // horns curling back
          c.beginPath(); c.moveTo(bx, byy); c.quadraticCurveTo(bx + sd * hl * 0.3, byy - hl * 1.1, bx + sd * hl * 0.9, byy - hl * (S === 'Mega' ? 1.3 : 1)); c.stroke(); }
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.14, kx = hx + sd * by(S, 12, 16, 20), lift = Math.max(0, sd * x.walk) * 4, fx = kx - sd * 2;   // thin crouching legs, knees out
          limb(c, [hx, g.bot - 6, kx, g.bot - 2, kx, g.bot + 2], by(S, 6, 6, 7), dk(x.body, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t); limb(c, [kx, g.bot + 2, kx, (g.bot + 182) / 2, fx, 180 - lift], by(S, 5, 5, 6), dk(x.body, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t);
          c.strokeStyle = rgb(dk(x.body, 0.1)); c.lineWidth = 2; for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx, 180 - lift); c.quadraticCurveTo(fx + k * 4, 182 - lift, fx + k * 6, 184 - lift); c.stroke(); } x.feet.push([fx, 182 - lift, 5]); } },
      inside(c, g, x) { const S = g.stage, hh = this.hh(g); if (S !== 'Mega') return; c.fillStyle = rgb(dk(x.body, 0.2)); for (let k = 0; k < 4; k++) { const y = g.top + hh + 6 + k * 9; c.beginPath(); c.moveTo(g.cx - 3, y); c.lineTo(g.cx, y - 5); c.lineTo(g.cx + 3, y); c.closePath(); c.fill(); } },   // spines down its front
      front(c, g, x) { if (x.back) return; const sh = this.shoulder(g); for (const sd of [-1, 1]) { const a = x.P.arm[sd < 0 ? 0 : 1], k = this.armK, hx = g.cx + sd * sh.dx + sd * a[2] * k, hy = sh.y + a[3] * k;   // long thin claws
          c.strokeStyle = rgb(dk(x.parts, 0.1)); c.lineWidth = 1.8; c.lineCap = 'round'; for (const j of [-1, 0, 1]) { c.beginPath(); c.moveTo(hx + j * 2, hy + 2); c.quadraticCurveTo(hx + j * 4, hy + 7, hx + j * 3 + sd * 2, hy + 11); c.stroke(); } } },
      hl: g => [g.left + g.bw * 0.16, g.top + g.bh * 0.3, g.left + g.bw * 0.2, g.top + g.bh * 0.12, g.left + g.bw * 0.38, g.top + g.bh * 0.03],
      head: g => [g.cx, g.top, g.bw * 0.4],
      face(c, g, x, look) { const S = g.stage, hh = FAM.Nightgaunt.hh(g), fi = faceTwo(c, g, x, look, { ey: hh * 0.46 / g.bh, ex: 0.18, my: hh * 0.74 / g.bh, noMouth: true, s: by(S, 0.7, 0.72, 0.76) });   // it has no mouth
        if (x.back) return fi;
        if (S === 'Mega') { c.save(); c.globalCompositeOperation = 'lighter'; for (const sd of [-1, 1]) { c.fillStyle = rgba(lt(x.acc, 0.3), 0.35 + Math.sin(x.t / 250) * 0.1); c.beginPath(); c.arc(g.cx + sd * fi.ex, fi.ey, 11 * fi.s, 0, 7); c.fill(); } c.restore(); }   // its eyes glow at Mega
        return fi; }
    },
    /* Ghoul: a gaunt, stooping person with a dog's head: a snout, pointed ears, a thin body with ribs, long arms with claws and hoof feet. A big head and short arms; long arms, a tattered loincloth and fangs from Byte; a longer snout, spiky hair, bigger ears and a bone in its hand at Mega */
    Ghoul: {
      special: true, dims: { Bit: [58, 70], Byte: [64, 92], Mega: [72, 110] }, ll: st => by(st, 10, 16, 20),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 14, 18, 26); },
      hh: g => g.bh * by(g.stage, 0.56, 0.48, 0.44),
      path(c, g) { const hh = this.hh(g), tw = g.bw * by(g.stage, 0.64, 0.6, 0.58); c.beginPath(); c.ellipse(g.cx, g.top + hh / 2, g.bw / 2, hh / 2, 0, 0, 7);   // a big head on a thin body
        c.moveTo(g.cx + tw / 2, g.top + hh * 0.86); c.roundRect(g.cx - tw / 2, g.top + hh * 0.86, tw, g.bot - g.top - hh * 0.86, [tw * 0.4, tw * 0.4, tw * 0.3, tw * 0.3]); },
      arms: 'stub', armW: st => by(st, 5, 6, 7), handR: st => by(st, 4.5, 5, 6), armK: 1.55,
      shoulder(g) { return { y: g.top + this.hh(g) + 6, dx: g.bw * by(g.stage, 0.3, 0.28, 0.27) }; },
      hand(g, x, side) { const sh = this.shoulder(g), a = x.P.arm[side < 0 ? 0 : 1], k = this.armK; return [g.cx + side * sh.dx + side * a[2] * k, sh.y + a[3] * k]; },
      behind(c, g, x) { const S = g.stage, hh = this.hh(g);
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.34, g.top + hh * 0.16); c.scale(sd, 1); c.rotate(-0.4 + Math.sin(x.t / 600 + sd) * 0.05);   // pointed ears
          c.fillStyle = rgb(dk(x.body, 0.1)); c.beginPath(); c.moveTo(-4, 4); c.lineTo(by(S, 12, 16, 22), -by(S, 14, 18, 24)); c.lineTo(8, 8); c.closePath(); c.fill(); c.fillStyle = rgb(lt(x.acc, 0.3)); c.beginPath(); c.moveTo(0, 4); c.lineTo(by(S, 9, 12, 17), -by(S, 10, 13, 18)); c.lineTo(6, 6); c.closePath(); c.fill(); c.restore(); }
        if (S === 'Mega') { c.fillStyle = rgb(dk(x.body, 0.35)); for (let k = 0; k < 5; k++) { const px = g.cx - 16 + k * 8; c.beginPath(); c.moveTo(px - 4, g.top + 6); c.lineTo(px + (k - 2) * 2, g.top - 10 - (k % 2) * 4); c.lineTo(px + 4, g.top + 6); c.closePath(); c.fill(); } }   // spiky hair
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.16, lift = Math.max(0, sd * x.walk) * 4, kx = fx + sd * by(S, 5, 9, 11);   // thin legs bent at the knee, with hoof feet
          limb(c, [fx, g.bot - 8, kx, g.bot + this.ll(S) * 0.35, fx + sd * 2, 179 - lift], by(S, 8, 8, 9), dk(x.body, 0.14), sd < 0 ? x.L.legL : x.L.legR, x.t);
          c.fillStyle = rgb(dk(x.parts, 0.3)); c.beginPath(); c.moveTo(fx + sd * 2 - 6, 178 - lift); c.lineTo(fx + sd * 2 + 6, 178 - lift); c.lineTo(fx + sd * 2 + 7, 184 - lift); c.lineTo(fx + sd * 2 - 7, 184 - lift); c.closePath(); c.fill(); x.feet.push([fx + sd * 2, 182 - lift, 7]); } },
      inside(c, g, x) { const S = g.stage, hh = this.hh(g), ty = g.top + hh * 0.86; c.fillStyle = rgba(dk(x.body, 0.15), 0.5); for (const [fx, fy, r] of [[0.22, 0.2, 4], [0.76, 0.3, 3]]) { c.beginPath(); c.arc(g.left + g.bw * fx, g.top + hh * fy, r, 0, 7); c.fill(); }   // blotches
        c.strokeStyle = rgba(dk(x.body, 0.3), 0.6); c.lineWidth = 1.5; for (let k = 0; k < by(S, 2, 3, 4); k++) { const y = ty + 8 + k * 6; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + sd * 3, y); c.quadraticCurveTo(g.cx + sd * g.bw * 0.12, y - 3, g.cx + sd * g.bw * 0.22, y + 2); c.stroke(); } }   // ribs
        if (S !== 'Bit') { c.fillStyle = rgb(x.parts); c.beginPath(); c.moveTo(g.cx - g.bw * 0.3, g.bot - 10); c.lineTo(g.cx + g.bw * 0.3, g.bot - 10); for (let k = 0; k <= 6; k++) c.lineTo(g.cx + g.bw * (0.3 - k * 0.1), g.bot + (k % 2 ? 6 : 0)); c.closePath(); c.fill(); } },   // a tattered loincloth
      front(c, g, x) { const S = g.stage; if (x.back) return;
        for (const sd of [-1, 1]) { const [hx, hy] = this.hand(g, x, sd); c.fillStyle = rgb(lt(x.acc, 0.4)); for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(hx + k * 4 - 1.8, hy + 3); c.lineTo(hx + k * 5, hy + 9); c.lineTo(hx + k * 4 + 1.8, hy + 3); c.closePath(); c.fill(); } }   // claws
        if (S === 'Mega') { const [hx, hy] = this.hand(g, x, 1); c.save(); c.translate(hx, hy); c.rotate(-0.6 + Math.sin(x.t / 280) * 0.25); c.fillStyle = '#efe6d2'; c.fillRect(-2, -18, 4, 22); for (const y of [-18, 4]) for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 3, y, 3, 0, 7); c.fill(); } c.restore(); } },   // a bone
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.3, g.left + g.bw * 0.16, g.top + g.bh * 0.12, g.left + g.bw * 0.36, g.top + g.bh * 0.03],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face(c, g, x, look) { const S = g.stage, hh = FAM.Ghoul.hh(g), fi = faceTwo(c, g, x, look, { ey: hh * 0.4 / g.bh, ex: 0.18, my: hh * 0.74 / g.bh, s: by(S, 0.72, 0.76, 0.8) }), s = fi.s;
        if (x.back) return fi; const sl = by(S, 8, 10, 13) * s, ny = fi.ey + 9 * s;   // a dog's snout with a black nose
        c.fillStyle = rgb(lt(x.body, 0.12)); c.beginPath(); c.ellipse(g.cx, ny + sl * 0.5, sl * 1.1, sl * 0.8, 0, 0, 7); c.fill();
        c.fillStyle = '#2b2430'; c.beginPath(); c.ellipse(g.cx, ny + 1, 4 * s, 3 * s, 0, 0, 7); c.fill();
        c.strokeStyle = '#2b2430'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(g.cx, ny + 3); c.lineTo(g.cx, ny + sl * 0.7); c.moveTo(g.cx - sl * 0.6, ny + sl * 0.8); c.quadraticCurveTo(g.cx, ny + sl * 1.1, g.cx + sl * 0.6, ny + sl * 0.8); c.stroke();
        if (S !== 'Bit') { c.fillStyle = '#fff'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + sd * sl * 0.4 - 1.5, ny + sl * 0.85); c.lineTo(g.cx + sd * sl * 0.4, ny + sl * 0.85 + (S === 'Mega' ? 6 : 4)); c.lineTo(g.cx + sd * sl * 0.4 + 1.5, ny + sl * 0.85); c.closePath(); c.fill(); } }   // fangs
        return fi; }
    },
    /* Gug: a hunched, shaggy giant with a big head sunk between its shoulders, long arms that hang to its knees, and forearms that fork at the elbow into two clawed hands. A furry little lump with short arms and a wide grin; long forked arms, a crouch and a shaggy mane from Byte; huge shoulders, a ridge of spiky fur, arms to the ground and big claws at Mega */
    Gug: {
      special: true, dims: { Bit: [66, 62], Byte: [82, 80], Mega: [96, 96] }, ll: st => by(st, 10, 18, 24),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 30, 40, 52); },   // room for the mouth on its head
      hh: g => g.bh * by(g.stage, 0.6, 0.5, 0.46),
      path(c, g) { const hh = this.hh(g), sy = g.top + hh * 0.42, bw = g.bw, tw = bw * by(g.stage, 0.7, 0.6, 0.56);   // a head sunk between two big hunched shoulders over a body that narrows to the hips
        c.beginPath(); c.ellipse(g.cx, g.top + hh / 2, bw * 0.33, hh / 2, 0, 0, 7);
        for (const sd of [-1, 1]) { c.moveTo(g.cx + sd * bw * 0.3 + bw * 0.2, sy + hh * 0.18); c.ellipse(g.cx + sd * bw * 0.3, sy + hh * 0.18, bw * 0.2, hh * 0.3, 0, 0, 7); }
        c.moveTo(g.cx - bw * 0.48, sy + hh * 0.2); c.lineTo(g.cx + bw * 0.48, sy + hh * 0.2); c.bezierCurveTo(g.cx + bw * 0.48, g.bot - (g.bot - sy) * 0.35, g.cx + tw / 2, g.bot - 6, g.cx + tw / 2, g.bot - 2);
        c.quadraticCurveTo(g.cx, g.bot + 3, g.cx - tw / 2, g.bot - 2); c.bezierCurveTo(g.cx - tw / 2, g.bot - 6, g.cx - bw * 0.48, g.bot - (g.bot - sy) * 0.35, g.cx - bw * 0.48, sy + hh * 0.2); c.closePath(); },
      arms: 'stub', armW: st => by(st, 7, 8, 10), handR: st => by(st, 5.5, 6, 7.5), armK: 1.6,
      shoulder(g) { return { y: g.top + this.hh(g) * 0.62, dx: g.bw * 0.46 }; },
      hand(g, x, side) { const sh = this.shoulder(g), a = x.P.arm[side < 0 ? 0 : 1], k = this.armK; return [g.cx + side * sh.dx + side * a[2] * k, sh.y + a[3] * k]; },
      claws(c, hx, hy, k, col, sd) { c.fillStyle = col; for (const j of [-1, 0, 1]) { c.beginPath(); c.moveTo(hx + j * 3.6 * k - 1.6 * k, hy + 2 * k); c.lineTo(hx + j * 4.4 * k + sd * k, hy + 8 * k); c.lineTo(hx + j * 3.6 * k + 1.6 * k, hy + 2 * k); c.closePath(); c.fill(); } },
      behind(c, g, x) { const S = g.stage, hh = this.hh(g), sy = g.top + hh * 0.5, fur = rgb(dk(x.body, 0.16));
        // shaggy fur round the shoulders and back, more of it as it grows
        c.fillStyle = fur; const n = by(S, 5, 7, 9);
        for (let k = 0; k < n; k++) { const f = k / (n - 1), px = g.cx + (f - 0.5) * g.bw * 1.02, py = sy - 2 + Math.abs(f - 0.5) * 10, h = by(S, 6, 9, 12) * (1 - Math.abs(f - 0.5)) + 4, sw = Math.sin(x.t / 700 + k) * 1.2;
          c.beginPath(); c.moveTo(px - 5, py + 4); c.lineTo(px + sw + (f - 0.5) * 6, py - h); c.lineTo(px + 5, py + 4); c.closePath(); c.fill(); }
        { const tw = g.bw * by(S, 0.7, 0.6, 0.56), n2 = by(S, 5, 6, 7); c.fillStyle = rgb(dk(x.body, 0.1));   // a shaggy fringe of fur round its hips
          for (let k = 0; k < n2; k++) { const px = g.cx - tw / 2 + 2 + k * (tw - 4) / (n2 - 1); c.beginPath(); c.moveTo(px - 4, g.bot - 6); c.lineTo(px + Math.sin(x.t / 500 + k) * 1.2, g.bot + by(S, 4, 6, 7)); c.lineTo(px + 4, g.bot - 6); c.closePath(); c.fill(); } }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, lift = Math.max(0, sd * x.walk) * 4, kx = fx + sd * by(S, 6, 11, 14);   // crouching legs bent out at the knee, with clawed feet
          limb(c, [fx, g.bot - 8, kx, g.bot + this.ll(S) * 0.4, fx + sd * 3, 179 - lift], by(S, 10, 11, 13), dk(x.body, 0.12), sd < 0 ? x.L.legL : x.L.legR, x.t);
          blob(c, fx + sd * 3, 181 - lift, by(S, 8, 9, 11), 5, dk(x.body, 0.16), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot');
          this.claws(c, fx + sd * 3, 177 - lift, by(S, 0.7, 0.8, 0.95), rgb(lt(x.acc, 0.35)), sd); x.feet.push([fx + sd * 3, 182 - lift, 9]);  }
        if (x.back) return;
        for (const sd of [-1, 1]) { const F2 = this.fork(g, x, sd), aw = this.armW(S), hr = this.handR(S), mat = sd < 0 ? x.L.armL : x.L.armR;   // the second forearm on each arm
          limb(c, F2.q, aw, x.parts, mat, x.t); blob(c, F2.h2x, F2.h2y, hr, hr, lt(x.parts, 0.22), mat, x.t, 'hand');
          this.claws(c, F2.h2x, F2.h2y + 2, by(S, 0.75, 0.85, 1.05), rgb(lt(x.acc, 0.35)), sd);
          if (S === 'Mega') this.thorns(c, F2.q, rgb(lt(x.acc, 0.25))); } },
      inside(c, g, x) { const S = g.stage, hh = this.hh(g), sy = g.top + hh * 0.5;
        if (S === 'Mega') { c.fillStyle = rgb(dk(x.body, 0.22)); for (const f of [0, 0.07, 0.14, 0.21, 0.79, 0.86, 0.93, 1]) { const k = Math.round(f * 14), px = g.left + g.bw * (0.04 + f * 0.92), py = sy + hh * 0.1 + Math.abs(f - 0.5) * 6 + (k % 2) * 3, L = 12 + (k % 3) * 4, sw = Math.sin(x.t / 650 + k) * 1.5;   // a thick mane of darker fur down each shoulder
          c.beginPath(); c.moveTo(px - 6, py - 6); c.lineTo(px + sw + (f - 0.5) * 4, py + L); c.lineTo(px + 6, py - 6); c.closePath(); c.fill(); } }
        c.fillStyle = rgba(lt(x.body, 0.18), 0.6); c.beginPath(); c.ellipse(g.cx, sy + (g.bot - sy) * 0.55, g.bw * by(S, 0.2, 0.2, 0.19), (g.bot - sy) * 0.36, 0, 0, 7); c.fill();   // a paler chest
        c.strokeStyle = rgba(dk(x.body, 0.25), 0.55); c.lineWidth = 1.4;   // tufts of fur
        for (const [fx, fy] of [[0.18, 0.62], [0.82, 0.6], [0.24, 0.84], [0.76, 0.86]]) { const px = g.left + g.bw * fx, py = g.top + g.bh * fy; c.beginPath(); c.moveTo(px - 3, py - 3); c.lineTo(px, py + 2); c.lineTo(px + 3, py - 3); c.stroke(); } },
      // where each arm runs, the same curve the arm itself is drawn on: shoulder, bend and hand
      armQ(g, x, sd) { const a = x.P.arm[sd < 0 ? 0 : 1], sh = this.shoulder(g), sx = g.cx + sd * sh.dx, k = this.armK; return [sx, sh.y, sx + sd * a[0] * k, sh.y + a[1] * k, sx + sd * a[2] * k, sh.y + a[3] * k]; },
      // the second forearm leaves the arm at its elbow along the arm's own direction and bends out to a second hand.
      // It's drawn before the arms, so the main arm covers the joint
      fork(g, x, sd) { const S = g.stage, q = this.armQ(g, x, sd), [ex, ey] = qpt(q, 0.5), tx = q[4] - q[0], ty = q[5] - q[1], tL = Math.hypot(tx, ty) || 1, sp = by(S, 12, 15, 17);
        const h2x = q[4] + sd * sp, h2y = q[5] - sp * 0.75, len = Math.hypot(h2x - ex, h2y - ey), cx2 = ex + tx / tL * len * 0.45, cy2 = ey + ty / tL * len * 0.45;
        return { ex, ey, h2x, h2y, q: [ex, ey, cx2, cy2, h2x, h2y] }; },
      thorns(c, q, col) { c.fillStyle = col; for (const f of [0.4, 0.7]) { const [px, py] = qpt(q, f), [nx2, ny2] = qpt(q, f + 0.04), dx = nx2 - px, dy = ny2 - py, L = Math.hypot(dx, dy) || 1, ux = -dy / L, uy = dx / L, up = uy > 0 ? -1 : 1;
        c.beginPath(); c.moveTo(px - dx / L * 2.5, py - dy / L * 2.5); c.lineTo(px + ux * up * 6, py + uy * up * 6); c.lineTo(px + dx / L * 2.5, py + dy / L * 2.5); c.closePath(); c.fill(); } },
      front(c, g, x) { const S = g.stage; if (x.back) return; const ck = by(S, 0.75, 0.85, 1.05), cc = rgb(lt(x.acc, 0.35));
        for (const sd of [-1, 1]) { const q = this.armQ(g, x, sd); this.claws(c, q[4], q[5] + 2, ck, cc, sd);
          if (S === 'Mega') this.thorns(c, [...qpt(q, 0.5), q[2] + (q[4] - q[2]) * 0.5, q[3] + (q[5] - q[3]) * 0.5, q[4], q[5]], rgb(lt(x.acc, 0.25))); } },   // thorns along the forearm at Mega
      // a mouth on top of its head, shaped like a flytrap: two fleshy jaws that open in a V from where they meet, dark red inside with
      // pink gums, white teeth along both rims and a tongue in the middle. It stays open and snaps shut now and then
      trap(c, bx, by0, H, W, t, open, n, tl, x) { const ph = (t % 2600) / 2600, snap = ph > 0.86 ? Math.abs(Math.sin((ph - 0.86) / 0.14 * Math.PI)) : 0, o = (open ? 1.15 : 1) * (1 - snap * 0.85), sw = 0.2 + 0.8 * o, u0 = W / 22;
        const b0 = by0 - 2 * u0, mh = H * (0.62 - 0.3 * (1 - sw));
        c.fillStyle = rgb(x.body); c.beginPath(); c.ellipse(bx, by0 - 1 * u0, W * 0.55, 5 * u0, 0, 0, 7); c.fill();   // where the jaws grow out of the head
        const J = sd => { const peak = [bx + sd * W * 0.55 * sw + sd * 1.5 * u0, b0 - H], mid = [bx + sd * 1.2 * u0, b0 - mh], o1 = [bx + sd * W * (0.55 * sw + 0.85), b0 - H * 0.85], o2 = [bx + sd * W * (0.4 * sw + 0.9), b0 - H * 0.12], base = [bx + sd * u0, b0];
          return { peak, mid, o1, o2, base, at: u => { const v = 1 - u; return [0, 1].map(i => v * v * v * peak[i] + 3 * v * v * u * o1[i] + 3 * v * u * u * o2[i] + u * u * u * base[i]); },
            path: ins => { c.beginPath(); c.moveTo(base[0], base[1] - ins); c.lineTo(mid[0] + sd * ins * 0.2, mid[1]); c.lineTo(peak[0] - sd * ins * 0.5, peak[1] + ins * 1.2); c.bezierCurveTo(o1[0] - sd * ins, o1[1] + ins * 0.4, o2[0] - sd * ins, o2[1] - ins * 0.3, base[0], base[1] - ins); c.closePath(); } }; };
        c.fillStyle = rgb(dk(x.body, 0.12)); c.beginPath(); c.roundRect(bx - 2.2 * u0, b0 - mh, 4.4 * u0, mh + 2 * u0, 2 * u0); c.fill();   // the hinge where the two jaws join
        for (const sd of [-1, 1]) { const q = J(sd);
          c.fillStyle = rgb(dk(x.body, 0.06)); q.path(0); c.fill();   // the jaw, in its own colour, with a thick lip
          c.fillStyle = '#d96c7c'; q.path(3.4 * u0); c.fill();   // the gums
          // teeth rooted in the gums and reaching out over the lip, along the rim and longest near the top
          c.fillStyle = '#f6f0e4'; c.strokeStyle = 'rgba(90,60,50,.45)'; c.lineWidth = 0.6 * u0; for (let k2 = 0; k2 < n; k2++) { const u = 0.05 + k2 / n * 0.82, [px, py] = q.at(u), [qx, qy] = q.at(u + 0.025), dx = qx - px, dy = qy - py, L = Math.hypot(dx, dy) || 1, nx = dy / L * sd, ny = -dx / L * sd, len = tl * (1.25 - u * 0.55), wd = 2.1 * u0;
            const ix = px - nx * 4.4 * u0, iy = py - ny * 4.4 * u0; c.beginPath(); c.moveTo(ix - dx / L * wd, iy - dy / L * wd); c.quadraticCurveTo(px + nx * len * 0.6, py + ny * len * 0.6, px + nx * len - dx / L * len * 0.3, py + ny * len - dy / L * len * 0.3); c.lineTo(ix + dx / L * wd, iy + dy / L * wd); c.closePath(); c.fill(); c.stroke(); }
          const gx = (q.mid[0] + q.o1[0]) / 2, gy = (q.mid[1] + q.o2[1]) / 2, gr = c.createRadialGradient(bx, gy, 1, gx, gy, W * 0.95);
          gr.addColorStop(0, '#4a0f1e'); gr.addColorStop(0.6, '#7d1a30'); gr.addColorStop(1, '#a52a44'); c.fillStyle = gr; q.path(5.4 * u0); c.fill();   // inside the mouth
          c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(q.o1[0] - sd * W * 0.2, q.o1[1] + H * 0.12, W * 0.12, H * 0.07, sd * 0.6, 0, 7); c.fill(); }   // a gleam inside
      },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.62, g.left + g.bw * 0.16, g.top + g.bh * 0.5, g.left + g.bw * 0.24, g.top + g.bh * 0.42],
      head: g => [g.cx, g.top + 2, g.bw * 0.32],
      face(c, g, x, look) { const S = g.stage, hh = FAM.Gug.hh(g), fi = faceTwo(c, g, x, look, { ey: hh * 0.5 / g.bh, ex: 0.13, my: hh * 0.78 / g.bh, noMouth: true, s: by(S, 0.72, 0.76, 0.8) });
        if (x.back) return fi;
        // its mouth sits on top of its head, two jaws that open like a flytrap's (trap below)
        this.trap(c, g.cx, g.top + hh * 0.16, hh * by(S, 0.62, 0.72, 0.82), g.bw * by(S, 0.2, 0.21, 0.22), x.t, x.open, by(S, 6, 7, 8), by(S, 5, 6.5, 8), x);
        if (S === 'Mega') for (const sd of [-1, 1]) this.trap(c, g.cx + sd * g.bw * 0.37, g.top + hh * 0.5, hh * 0.38, g.bw * 0.1, x.t + 900 + sd * 450, false, 5, 4.5, x);   // two smaller mouths on its shoulders, snapping out of step
        return fi; }
    },
    /* Yog: Yog-Sothoth, a floating globe with smaller glowing globes always drifting round it, passing in front and behind, and feelers trailing under it. Three globes and three feelers; five globes with eyes in them and five feelers from Byte; seven globes that change colour, a ring of sparks and seven feelers at Mega */
    Yog: {
      special: true, float: true, dims: { Bit: [58, 58], Byte: [70, 70], Mega: [82, 82] }, slots: { feet: false },
      bottom(st) { return by(st, 158, 150, 142); }, height(st) { return this.dims[st][1] + by(st, 30, 38, 48) + (182 - this.bottom(st)); },
      globes(g, t) { const n = by(g.stage, 3, 5, 7), cy = g.top + g.bh * 0.46, out = [];   // each globe on its own tilted orbit at its own speed, drifting in and out
        for (let k = 0; k < n; k++) { const sp = (k % 2 ? -1 : 1) * (0.00045 + k * 0.00009), a = k * 2.399 + t * sp, rx = g.bw * (0.7 + 0.1 * Math.sin(t / 900 + k * 1.7)), tilt = 0.2 * Math.sin(k * 1.3 + 0.5), depth = Math.sin(a);
          const r = g.bw * by(g.stage, 0.18, 0.16, 0.14) * (0.85 + 0.25 * (depth + 1) / 2); out.push([g.cx + Math.cos(a) * rx, cy + Math.cos(a) * rx * tilt + depth * g.bh * (0.4 + 0.04 * (k % 3)), r, k, depth]); }   // a ring seen from a little above: passing in front takes a globe under its face, passing behind takes it over its head
        return out; },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      globe(c, g, x, px, py, r, k) { const S = g.stage, hues = [x.acc, x.parts, lt(x.acc, 0.3), lt(x.parts, 0.3)], col = S === 'Mega' ? hues[(k + Math.floor(x.t / 900)) % hues.length] : hues[k % hues.length];
        c.save(); c.shadowColor = rgba(lt(col, 0.3), 0.8); c.shadowBlur = 8; const gr = c.createRadialGradient(px - r * 0.3, py - r * 0.3, 1, px, py, r); gr.addColorStop(0, rgba(lt(col, 0.55), 1)); gr.addColorStop(1, rgba(col, 0.95)); c.fillStyle = gr; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); c.restore();
        c.strokeStyle = rgba(dk(col, 0.3), 0.6); c.lineWidth = 1.5; c.beginPath(); c.arc(px, py, r, 0, 7); c.stroke();
        if (S !== 'Bit' && !x.back) { const er = r * 0.42, shut = (x.t + k * 700) % 3000 < 150; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(px, py, er, shut ? 0.8 : er, 0, 0, 7); c.fill();
          if (!shut) { c.fillStyle = '#2b2430'; c.beginPath(); c.arc(px + (g.cx - px) * 0.04, py + (g.top + g.bh / 2 - py) * 0.04, er * 0.5, 0, 7); c.fill(); } } },   // each eye keeps looking in at the big globe
      behind(c, g, x) { const S = g.stage, n = by(S, 3, 5, 7), col = x.parts;
        if (S === 'Mega') { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + x.t / 2400, r = g.bw * 0.86, px = g.cx + Math.cos(a) * r, py = g.top + g.bh / 2 + Math.sin(a) * r * 0.9;   // a ring of sparks turning round it
          c.fillStyle = rgba(lt(x.acc, 0.4), 0.35 + 0.25 * Math.sin(x.t / 300 + k)); c.beginPath(); c.arc(px, py, 2.5, 0, 7); c.fill(); } c.restore(); }
        for (let i = 0; i < n; i++) { const f = n > 1 ? i / (n - 1) - 0.5 : 0, bx = g.cx + f * g.bw * 0.7, by0 = g.top + g.bh * (0.86 - Math.abs(f) * 0.3), len = by(S, 22, 30, 38) * (1 - Math.abs(f) * 0.4), sw = Math.sin(x.t / 380 + i * 1.6) * 6, d = f < 0 ? -1 : f > 0 ? 1 : (i % 2 ? 1 : -1);   // feelers trailing under it
          const q = [bx, by0, bx + f * 12 + sw, by0 + len * 0.55, bx + f * 18 + sw * 0.5, by0 + len]; limb(c, q, by(S, 6, 7, 8) - Math.abs(f) * 2, dk(col, 0.05), i % 2 ? x.L.armR : x.L.armL, x.t);
          c.strokeStyle = rgb(dk(col, 0.05)); c.lineWidth = by(S, 4, 4.5, 5); c.lineCap = 'round'; c.beginPath(); c.arc(q[4] + d * 3.5, q[5], 3.5, d > 0 ? Math.PI : 0, d > 0 ? Math.PI * 2.3 : -Math.PI * 1.3, d < 0); c.stroke();
          if (S !== 'Bit') { c.fillStyle = rgb(lt(col, 0.4)); for (const k of [0.4, 0.7]) { const p = qpt(q, k); c.beginPath(); c.arc(p[0], p[1], 1.4, 0, 7); c.fill(); } } }
        for (const [px, py, r, k, depth] of this.globes(g, x.t)) if (depth < 0) this.globe(c, g, x, px, py, r, k); },   // the globes passing behind it
      inside(c, g, x) { c.strokeStyle = rgba(lt(x.body, 0.3), 0.35); c.lineWidth = 2; c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.56, g.bw * 0.4, g.bh * 0.34, 0, 0.3, Math.PI - 0.3); c.stroke(); },   // a soft band round the big globe
      front(c, g, x) { for (const [px, py, r, k, depth] of this.globes(g, x.t).sort((a, b) => a[4] - b[4])) if (depth >= 0) this.globe(c, g, x, px, py, r, k); },   // the globes passing in front
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.62, g.left + g.bw * 0.16, g.top + g.bh * 0.4, g.left + g.bw * 0.3, g.top + g.bh * 0.24],
      head: g => [g.cx, g.top + 2, g.bw * 0.44],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.5, ex: 0.18, my: 0.7, s: by(g.stage, 0.74, 0.8, 0.86) })
    },
    /* Shub: Shub-Niggurath, the black goat of the woods. A shaggy black goat with curled ram's horns, long ears, a long muzzle, a goat beard and four hoofed legs, with ropy feelers sprouting off its back. Small horns, two legs and three feelers; four legs, bigger horns and five feelers from Byte; huge curled horns, seven feelers, a drooling mouth on each side and glowing goat eyes at Mega */
    Shub: {
      special: true, dims: { Bit: [66, 56], Byte: [86, 68], Mega: [104, 80] }, ll: st => by(st, 14, 18, 22),
      bottom(st) { return 182 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + by(st, 22, 32, 46); },
      path(c, g, x) { const t = x ? x.t : 0, R = g.left + g.bw, n = 9; c.beginPath(); c.moveTo(g.cx, g.top); c.bezierCurveTo(g.cx + g.bw * 0.44, g.top, R, g.top + g.bh * 0.24, R, g.top + g.bh * 0.56);   // a round goat body with a shaggy fringe hanging off the bottom
        c.lineTo(R - 2, g.bot - 6); for (let i = 1; i <= n * 2; i++) { const f = i / (n * 2), w = Math.sin(t / 400 + i) * 1.2; c.lineTo(R - 2 - f * (g.bw - 4), i % 2 ? g.bot + 4 + w : g.bot - 4); }
        c.lineTo(g.left, g.top + g.bh * 0.56); c.bezierCurveTo(g.left, g.top + g.bh * 0.24, g.cx - g.bw * 0.44, g.top, g.cx, g.top); c.closePath(); },
      leg(c, g, x, lx, i, back) { const S = g.stage, ll = this.ll(S), lift = Math.max(0, Math.sin(x.t / 150 + i * Math.PI / 2)) * 4 * Math.abs(x.walk), fy = (back ? 178 : 182) - lift, col = dk(x.body, back ? 0.25 : 0.1), lw = by(S, 6, 7, 8), top = g.bot - 8, hock = top + ll * 0.6;
        limb(c, [lx, top, lx + 4, (top + hock) / 2, lx - 2, hock], lw * 1.25, col, i % 2 ? x.L.legR : x.L.legL, x.t); limb(c, [lx - 2, hock, lx - 1, (hock + fy) / 2, lx, fy - 4], lw * 0.8, col, i % 2 ? x.L.legR : x.L.legL, x.t);   // a goat leg with the hock bent back
        c.fillStyle = '#2b2430'; c.beginPath(); c.moveTo(lx - lw * 0.7, fy - 5); c.lineTo(lx + lw * 0.7, fy - 5); c.lineTo(lx + lw * 0.8, fy + 1); c.lineTo(lx - lw * 0.8, fy + 1); c.closePath(); c.fill(); c.strokeStyle = '#4a4050'; c.lineWidth = 1; c.beginPath(); c.moveTo(lx, fy - 4); c.lineTo(lx, fy + 1); c.stroke(); x.feet.push([lx, fy, lw * 0.7]); },   // a cloven hoof
      behind(c, g, x) { const S = g.stage, n = by(S, 3, 5, 7), col = dk(x.body, 0.06);
        for (let i = 0; i < n; i++) { const f = n > 1 ? i / (n - 1) - 0.5 : 0, a = -Math.PI / 2 + f * 2.4, bx = g.cx + Math.cos(a) * g.bw * 0.36, byy = g.top + g.bh * 0.5 + Math.sin(a) * g.bh * 0.4, len = by(S, 20, 28, 36) * (1 - Math.abs(f) * 0.3), sw = Math.sin(x.t / 360 + i * 1.9) * 0.3;   // ropy feelers sprouting off its back
          const ex = bx + Math.cos(a + sw) * len, ey = byy + Math.sin(a + sw) * len, q = [bx, byy, (bx + ex) / 2 + Math.cos(a + 1.5) * 6, (byy + ey) / 2 + Math.sin(a + 1.5) * 6, ex, ey]; limb(c, q, by(S, 6, 7, 8), col, i % 2 ? x.L.armR : x.L.armL, x.t);
          c.strokeStyle = rgb(col); c.lineWidth = by(S, 4, 4.5, 5); c.lineCap = 'round'; c.beginPath(); c.arc(ex + Math.cos(a - 1.6) * 3.5, ey + Math.sin(a - 1.6) * 3.5, 3.5, a + 1.6, a - 1.2); c.stroke(); }
        c.fillStyle = rgb(dk(x.body, 0.1)); c.beginPath(); c.ellipse(g.cx + g.bw * 0.46, g.top + g.bh * 0.66, 5, 8, 0.6 + Math.sin(x.t / 300) * 0.2, 0, 7); c.fill();   // a short goat tail
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.38, g.top + g.bh * 0.26); c.scale(sd, 1); c.rotate(0.15 + Math.sin(x.t / 700 + sd) * 0.06);   // long goat ears sticking out sideways
          c.fillStyle = rgb(dk(x.body, 0.1)); c.beginPath(); c.ellipse(12, 0, by(S, 12, 15, 18), 5.5, 0, 0, 7); c.fill(); c.fillStyle = rgb(lt(x.acc, 0.2)); c.beginPath(); c.ellipse(13, 0, by(S, 8, 10, 12), 2.8, 0, 0, 7); c.fill(); c.restore(); }
        if (S !== 'Bit') { this.leg(c, g, x, g.cx - g.bw * 0.1, 1, true); this.leg(c, g, x, g.cx + g.bw * 0.1, 3, true); }
        for (const sd of [-1, 1]) { const hx = g.cx + sd * g.bw * 0.2, hy = g.top + g.bh * 0.08, hr = by(S, 9, 13, 18);   // curled ram's horns sweeping back and down
          c.strokeStyle = rgb(dk(x.parts, 0.25)); c.lineWidth = by(S, 7, 9, 12); c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy + 4); c.quadraticCurveTo(hx + sd * hr * 0.4, hy - hr * 1.1, hx + sd * hr * 1.3, hy - hr * 0.5);
          c.arc(hx + sd * hr * 1.3, hy + hr * 0.15, hr * 0.65, -Math.PI / 2, sd > 0 ? Math.PI * 0.75 : Math.PI * 0.25, sd < 0); c.stroke();
          c.strokeStyle = rgb(x.parts); c.lineWidth = by(S, 4, 5.5, 7); c.beginPath(); c.moveTo(hx, hy + 4); c.quadraticCurveTo(hx + sd * hr * 0.4, hy - hr * 1.1, hx + sd * hr * 1.3, hy - hr * 0.5); c.arc(hx + sd * hr * 1.3, hy + hr * 0.15, hr * 0.65, -Math.PI / 2, sd > 0 ? Math.PI * 0.75 : Math.PI * 0.25, sd < 0); c.stroke();
          c.strokeStyle = rgba(dk(x.parts, 0.35), 0.8); c.lineWidth = 1.4; for (let k = 1; k <= 4; k++) { const p = qpt([hx, hy + 4, hx + sd * hr * 0.4, hy - hr * 1.1, hx + sd * hr * 1.3, hy - hr * 0.5], k / 5); c.beginPath(); c.moveTo(p[0] - 3, p[1] - 1); c.lineTo(p[0] + 3, p[1] + 1); c.stroke(); } } },   // ridges on the horns
      inside(c, g, x) { const S = g.stage; c.strokeStyle = rgba(dk(x.body, 0.3), 0.55); c.lineWidth = 2; c.lineCap = 'round';   // shaggy locks of fur
        for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { const px = g.left + g.bw * (0.12 + k * 0.15 + (r % 2) * 0.07), py = g.top + g.bh * (0.5 + r * 0.14); c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 3, py + 5, px - 1, py + 9); c.stroke(); }
        if (x.back || S !== 'Mega') return; for (const sd of [-1, 1]) { const px = g.cx + sd * g.bw * 0.34, py = g.top + g.bh * 0.72, w = 13, o = 0.45 + 0.55 * Math.abs(Math.sin(x.t / 260 + sd)), h = w * 0.4 * o;   // a drooling mouth on each side
          c.fillStyle = '#5a1f2e'; c.beginPath(); c.ellipse(px, py, w / 2, h, 0, 0, 7); c.fill(); c.fillStyle = '#f2ece0'; for (let i = 0; i < 3; i++) { const tx = px - w * 0.25 + i * w * 0.25; c.beginPath(); c.moveTo(tx - 2, py - h); c.lineTo(tx, py - h + 4); c.lineTo(tx + 2, py - h); c.closePath(); c.fill(); }
          c.strokeStyle = 'rgba(150,210,110,.85)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 2, py + h); c.lineTo(px + 3, py + h + 6 + 4 * o); c.stroke(); } },
      front(c, g, x) { this.leg(c, g, x, g.cx - g.bw * 0.26, 0, false); this.leg(c, g, x, g.cx + g.bw * 0.26, 2, false); },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.56, g.left + g.bw * 0.16, g.top + g.bh * 0.28, g.left + g.bw * 0.34, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 4, g.bw * 0.4],
      face(c, g, x, look) { const S = g.stage, fi = faceTwo(c, g, x, look, { ey: 0.3, ex: 0.18, my: 0.62, s: by(S, 0.7, 0.76, 0.82) }), s = fi.s;
        if (x.back) return fi; const my = fi.ey + 9 * s, ml = by(S, 16, 18, 22) * s;   // a long goat muzzle running down its face
        c.fillStyle = rgb(lt(x.body, 0.1)); c.beginPath(); c.moveTo(g.cx - 8 * s, my); c.quadraticCurveTo(g.cx - 11 * s, my + ml, g.cx, my + ml + 3 * s); c.quadraticCurveTo(g.cx + 11 * s, my + ml, g.cx + 8 * s, my); c.closePath(); c.fill();
        c.fillStyle = rgb(lt(x.body, 0.24)); c.beginPath(); c.ellipse(g.cx, my + ml * 0.8, 9 * s, 6 * s, 0, 0, 7); c.fill();
        c.fillStyle = '#2b2430'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * 3.2 * s, my + ml * 0.7, 1.4 * s, 2.2 * s, sd * 0.3, 0, 7); c.fill(); }   // nostrils
        c.strokeStyle = '#2b2430'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(g.cx - 4 * s, my + ml + 1); c.quadraticCurveTo(g.cx, my + ml + 3 * s, g.cx + 4 * s, my + ml + 1); c.stroke();
        c.fillStyle = rgb(lt(x.body, 0.32)); c.beginPath(); c.moveTo(g.cx - 5 * s, my + ml + 2 * s); c.quadraticCurveTo(g.cx, my + ml + by(S, 10, 13, 16) * s, g.cx + 1 * s, my + ml + by(S, 13, 17, 22) * s); c.quadraticCurveTo(g.cx + 2 * s, my + ml + 6 * s, g.cx + 5 * s, my + ml + 2 * s); c.closePath(); c.fill();   // a goat beard
        for (const sd of [-1, 1]) { const ex = g.cx + sd * fi.ex; c.fillStyle = S === 'Mega' ? rgb(lt(x.acc, 0.3)) : '#f6e7a8'; c.beginPath(); c.ellipse(ex, fi.ey, 5.5 * s, 3.2 * s, 0, 0, 7); c.fill();   // goat eyes with a bar for a pupil
          c.fillStyle = '#2b2430'; c.fillRect(ex - 4 * s, fi.ey - 1.1 * s, 8 * s, 2.2 * s); }
        return fi; }
    },
    /* ---------- special Snabits: found only through a colour easter egg, and only fusion changes their element ---------- */
    /* Eagle: a round bird with a white head, a hooked yellow beak, fanned wings and yellow talons (the stars-and-stripes egg) */
    Eagle: {
      special: true, dims: { Bit: [62, 64], Byte: [78, 80], Mega: [92, 96] },
      bottom() { return 174; }, height(st) { return this.dims[st][1] + 18 + (st === 'Mega' ? 16 : 0); },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      behind(c, g, x) { const fl = Math.sin(x.t / 260) * 0.16, n = by(g.stage, 3, 4, 5), len = g.bh * by(g.stage, 0.42, 0.52, 0.62);
        for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.34, g.top + g.bh * 0.46); c.scale(sd, 1); c.rotate(-0.55 - fl);
          for (let i = n - 1; i >= 0; i--) { const L = len * (1 - i * 0.07); c.save(); c.rotate(i * 0.3);
            c.fillStyle = rgb(dk(x.parts, 0.3)); c.beginPath(); c.ellipse(L * 0.55, 3, L * 0.6, L * 0.17, 0, 0, 7); c.fill();
            c.fillStyle = rgb(i % 2 ? x.parts : lt(x.parts, 0.12)); c.beginPath(); c.ellipse(L * 0.55, 0, L * 0.6, L * 0.17, 0, 0, 7); c.fill(); c.restore(); }
          c.restore(); }
        for (let i = -1; i <= 1; i++) { c.save(); c.translate(g.cx + i * 7, g.bot - 6); c.rotate(i * 0.35); c.fillStyle = rgb(i ? x.parts : '#f7f4ee');
          c.beginPath(); c.ellipse(0, 10, 6, 13, 0, 0, 7); c.fill(); c.restore(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2, fy = 183 - Math.max(0, sd * x.walk) * 4; x.feet.push([fx, fy, 7]);
          c.strokeStyle = '#e9ad2e'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx, g.bot - 4); c.lineTo(fx, fy - 2); c.stroke();
          for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx, fy - 2); c.lineTo(fx + k * 6, fy + 2); c.stroke(); } } },
      inside(c, g, x) { c.fillStyle = '#f7f4ee'; c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.16, g.bw * 0.62, g.bh * 0.44, 0, 0, 7); c.fill();
        c.fillStyle = rgba(lt(x.body, 0.35), 0.55); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.12, g.bw * 0.3, g.bh * 0.2, 0, 0, 7); c.fill();
        if (g.stage === 'Mega' && !x.back) star(c, g.cx, g.top + g.bh * 0.78, 0.9, rgb(x.acc)); },
      front(c, g, x) { const s = by(g.stage, 0.8, 0.9, 1), y0 = g.top + g.bh * 0.47; if (!x.back) {
        c.fillStyle = '#c98a14'; c.beginPath(); c.moveTo(g.cx - 8 * s, y0 + 2); c.quadraticCurveTo(g.cx + 2 * s, y0 - 4 * s, g.cx + 9 * s, y0 + 3); c.quadraticCurveTo(g.cx + 6 * s, y0 + 13 * s, g.cx, y0 + 15 * s); c.closePath(); c.fill();
        c.fillStyle = '#f6c445'; c.beginPath(); c.moveTo(g.cx - 8 * s, y0); c.quadraticCurveTo(g.cx + 2 * s, y0 - 6 * s, g.cx + 9 * s, y0 + 1); c.quadraticCurveTo(g.cx + 6 * s, y0 + 10 * s, g.cx, y0 + 13 * s); c.closePath(); c.fill(); }
        if (g.stage === 'Mega') for (const k of [-1, 0, 1]) { c.save(); c.translate(g.cx + k * 9, g.top + 4); c.rotate(k * 0.4); c.fillStyle = '#f7f4ee'; c.beginPath(); c.ellipse(0, -9, 4.5, 11, 0, 0, 7); c.fill(); c.restore(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.38, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.33, ex: 0.21, my: 0.56, s: by(g.stage, 0.78, 0.86, 0.94), lidCol: [247, 244, 238] })
    },
    /* Vampire: a pale round body with a dark widow's-peak hairline, a high-collared cape with a red lining, fangs, and bat wings at Mega */
    Vampire: {
      special: true, dims: { Bit: [62, 60], Byte: [76, 76], Mega: [88, 90] }, ll: st => by(st, 6, 8, 10),
      bottom(st) { return 181 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 22; },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bw * 0.44); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5, 6), shoulderY: 0.62,
      behind(c, g, x) { const cape = dk(x.parts, 0.15), sw = Math.sin(x.t / 500) * 3;
        if (g.stage === 'Mega') for (const sd of [-1, 1]) { c.save(); c.translate(g.cx + sd * g.bw * 0.4, g.top + g.bh * 0.3); c.scale(sd, 1); c.rotate(-0.3 + Math.sin(x.t / 300) * 0.12);
          c.fillStyle = rgb(dk(x.parts, 0.35)); c.beginPath(); c.moveTo(0, 0); c.lineTo(46, -22); c.quadraticCurveTo(40, -6, 46, 4); c.quadraticCurveTo(36, 2, 34, 12); c.quadraticCurveTo(24, 8, 20, 18); c.quadraticCurveTo(10, 10, 0, 14); c.closePath(); c.fill(); c.restore(); }
        const L = g.left - 8, R = g.left + g.bw + 8, y0 = g.top + g.bh * 0.28;
        c.fillStyle = rgb(dk(cape, 0.3)); c.beginPath(); c.moveTo(L + 6, y0 + 4); c.lineTo(L - 4 - sw, 186); c.lineTo(R + 4 + sw, 186); c.lineTo(R - 6, y0 + 4); c.closePath(); c.fill();
        c.fillStyle = '#b8243a'; c.beginPath(); c.moveTo(L + 10, y0 + 6); c.lineTo(L + 2 - sw, 184); c.lineTo(R - 2 + sw, 184); c.lineTo(R - 10, y0 + 6); c.closePath(); c.fill();
        for (const sd of [-1, 1]) { c.fillStyle = rgb(cape); c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.2, g.top + g.bh * 0.45); c.lineTo(g.cx + sd * (g.bw * 0.62), g.top - 6); c.lineTo(g.cx + sd * g.bw * 0.5, g.top + g.bh * 0.55); c.closePath(); c.fill();
          c.fillStyle = '#b8243a'; c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.3, g.top + g.bh * 0.42); c.lineTo(g.cx + sd * g.bw * 0.56, g.top + 2); c.lineTo(g.cx + sd * g.bw * 0.48, g.top + g.bh * 0.48); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.2; blob(c, fx, 182, by(g.stage, 7, 8, 9), 4.5, dk(x.parts, 0.2), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182, 7]); } },
      inside(c, g, x) { c.fillStyle = rgb(dk(x.parts, 0.25)); c.beginPath(); c.moveTo(g.left - 2, g.top - 2); c.lineTo(g.left + g.bw + 2, g.top - 2); c.lineTo(g.left + g.bw + 2, g.top + g.bh * 0.24);
        c.quadraticCurveTo(g.cx + g.bw * 0.22, g.top + g.bh * 0.12, g.cx, g.top + g.bh * 0.3); c.quadraticCurveTo(g.cx - g.bw * 0.22, g.top + g.bh * 0.12, g.left - 2, g.top + g.bh * 0.24); c.closePath(); c.fill();
        c.fillStyle = rgb(dk(x.parts, 0.15)); c.beginPath(); c.moveTo(g.cx - g.bw * 0.5, g.bot); c.lineTo(g.cx, g.bot - g.bh * 0.22); c.lineTo(g.cx + g.bw * 0.5, g.bot); c.closePath(); c.fill();
        c.fillStyle = '#b8243a'; c.beginPath(); c.arc(g.cx, g.bot - g.bh * 0.2, by(g.stage, 2.5, 3.5, 4.5), 0, 7); c.fill(); },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.62, g.left + g.bw * 0.12, g.top + g.bh * 0.38, g.left + g.bw * 0.26, g.top + g.bh * 0.3],
      head: g => [g.cx, g.top + 2, g.bw * 0.52],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.48, ex: 0.19, my: 0.7, fang: true, s: by(g.stage, 0.76, 0.84, 0.92) })
    },
    /* Phoenix: a plump firebird with a crest of flame feathers, flame wings, and long tail plumes with golden eye-spots */
    Phoenix: {
      special: true, dims: { Bit: [64, 58], Byte: [80, 72], Mega: [94, 84] },
      bottom() { return 172; }, height(st) { return this.dims[st][1] + by(st, 30, 38, 46); },
      glow: st => st !== 'Bit',
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      behind(c, g, x) { const T = x.t, hot = ['#ffe27a', '#ffae3b', '#f2542d'];
        // tail plumes sweep out behind the body to both sides, each ending in a golden eye-spot
        const n = by(g.stage, 2, 4, 6);
        for (let i = 0; i < n; i++) { const sd = i % 2 ? 1 : -1, k = Math.floor(i / 2), sw = Math.sin(T / 360 + i) * 4, L = g.bw * (0.55 + k * 0.16), y0 = g.bot - 10;
          const ex = g.cx + sd * L, ey = y0 + 8 - k * 14 + sw;
          c.fillStyle = rgb(dk(x.parts, 0.25)); c.beginPath(); c.moveTo(g.cx, y0 - 6); c.quadraticCurveTo(g.cx + sd * L * 0.5, y0 + 20, ex, ey + 4); c.quadraticCurveTo(g.cx + sd * L * 0.5, y0 + 8, g.cx, y0 + 6); c.closePath(); c.fill();
          c.fillStyle = rgb(x.parts); c.beginPath(); c.moveTo(g.cx, y0 - 8); c.quadraticCurveTo(g.cx + sd * L * 0.5, y0 + 16, ex, ey); c.quadraticCurveTo(g.cx + sd * L * 0.5, y0 + 4, g.cx, y0 + 4); c.closePath(); c.fill();
          c.fillStyle = '#ffd45e'; c.beginPath(); c.ellipse(ex, ey, 7, 5.5, sd * 0.3, 0, 7); c.fill(); c.fillStyle = rgb(dk(x.parts, 0.2)); c.beginPath(); c.arc(ex, ey, 2.6, 0, 7); c.fill(); }
        // flame wings: layered feathers, darker at the root and yellow at the tips, flickering
        const wn = by(g.stage, 3, 4, 5), wl = g.bh * by(g.stage, 0.62, 0.72, 0.82);
        for (const sd of [-1, 1]) for (let i = wn - 1; i >= 0; i--) { const a = sd * (0.75 + i * 0.3) + Math.sin(T / 150 + i * 1.3) * 0.07 * sd, L = wl * (1 - i * 0.1);
          c.save(); c.translate(g.cx + sd * g.bw * 0.4, g.top + g.bh * 0.46); c.rotate(a);
          for (let j = 0; j < 3; j++) { const W = 7 - j * 2, LL = L * (1 - j * 0.3); c.fillStyle = j ? hot[2 - j] : rgb(x.parts);
            c.beginPath(); c.moveTo(-W, 0); c.quadraticCurveTo(-W * 0.8, -LL * 0.6, Math.sin(T / 110 + i + j) * 2, -LL); c.quadraticCurveTo(W * 0.8, -LL * 0.6, W, 0); c.closePath(); c.fill(); }
          c.restore(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.16; x.feet.push([fx, 183, 6]); c.strokeStyle = '#e9ad2e'; c.lineWidth = 3; c.lineCap = 'round';
          c.beginPath(); c.moveTo(fx, g.bot - 4); c.lineTo(fx, 181); c.stroke(); for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx, 181); c.lineTo(fx + k * 5, 184); c.stroke(); } } },
      inside(c, g, x) { const gr = c.createLinearGradient(0, g.bot, 0, g.top); gr.addColorStop(0, 'rgba(255,226,122,.7)'); gr.addColorStop(0.45, 'rgba(255,226,122,0)'); c.fillStyle = gr; c.fillRect(g.left, g.top, g.bw, g.bh);
        if (x.back) return; c.fillStyle = rgba([255, 226, 150], 0.55); c.beginPath(); c.ellipse(g.cx, g.bot - g.bh * 0.12, g.bw * 0.26, g.bh * 0.22, 0, 0, 7); c.fill();
        },
      front(c, g, x) { const s = by(g.stage, 0.8, 0.88, 0.96), y0 = g.top + g.bh * 0.5;
        if (!x.back) { c.fillStyle = '#c98a14'; c.beginPath(); c.moveTo(g.cx - 6 * s, y0 + 1); c.lineTo(g.cx + 6 * s, y0 + 1); c.lineTo(g.cx, y0 + 10 * s); c.closePath(); c.fill();
          c.fillStyle = '#f6c445'; c.beginPath(); c.moveTo(g.cx - 6 * s, y0); c.lineTo(g.cx + 6 * s, y0); c.lineTo(g.cx, y0 + 8 * s); c.closePath(); c.fill(); }
        // the crest: tall flame feathers that sway, red at the base and yellow at the tip
        const n = by(g.stage, 3, 4, 5);
        for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2, L = by(g.stage, 18, 24, 30) * (1 - Math.abs(k) * 0.16), sw = Math.sin(x.t / 130 + i) * 2.5, bx = g.cx + k * 6, by0 = g.top + 5;
          for (let j = 0; j < 3; j++) { const LL = L * (1 - j * 0.32), W = 5 - j * 1.4; c.fillStyle = ['#e2412d', '#ff9a2e', '#ffe27a'][j];
            c.beginPath(); c.moveTo(bx - W, by0); c.quadraticCurveTo(bx + k * 3 - W * 0.4 + sw * 0.5, by0 - LL * 0.6, bx + k * 5 + sw, by0 - LL); c.quadraticCurveTo(bx + k * 3 + W * 0.4 + sw * 0.5, by0 - LL * 0.6, bx + W, by0); c.closePath(); c.fill(); } } },
      hl: g => [g.left + g.bw * 0.13, g.top + g.bh * 0.55, g.left + g.bw * 0.14, g.top + g.bh * 0.24, g.left + g.bw * 0.36, g.top + g.bh * 0.09],
      head: g => [g.cx, g.top - 6, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.38, ex: 0.19, my: 0.64, s: by(g.stage, 0.76, 0.84, 0.92) })
    },
    /* Kitsune: a fox with tall pointed ears, red face marks, and tails that grow from one to three to nine */
    Kitsune: {
      special: true, dims: { Bit: [66, 58], Byte: [80, 72], Mega: [92, 84] }, ll: st => by(st, 6, 8, 10),
      bottom(st) { return 181 - this.ll(st); }, height(st) { return this.dims[st][1] + this.ll(st) + 34; },
      path(c, g) { roundBox(c, g.left, g.top, g.bw, g.bh, g.bh * 0.46); },
      arms: 'stub', armW: st => by(st, 0, 6, 7), handR: st => by(st, 0, 5.5, 6.5), shoulderY: 0.64,
      behind(c, g, x) { const n = by(g.stage, 1, 3, 9), L = g.bh * by(g.stage, 0.9, 1.0, 1.05);
        for (let i = 0; i < n; i++) { const k = n === 1 ? 0.5 : i / (n - 1), a = -1.1 + k * 2.2 + Math.sin(x.t / 500 + i) * 0.08;
          c.save(); c.translate(g.cx, g.bot - 8); c.rotate(a * (n === 1 ? 0.6 : 1) + (n === 1 ? 0.9 : 0));
          c.fillStyle = rgb(dk(x.body, 0.25)); c.beginPath(); c.ellipse(0, -L * 0.55, L * 0.2, L * 0.55, 0, 0, 7); c.fill();
          c.fillStyle = rgb(lt(x.body, 0.05)); c.beginPath(); c.ellipse(0, -L * 0.55 - 2, L * 0.19, L * 0.52, 0, 0, 7); c.fill();
          c.fillStyle = '#f7f4ee'; c.beginPath(); c.ellipse(0, -L * 0.98, L * 0.12, L * 0.14, 0, 0, 7); c.fill(); c.restore(); }
        for (const sd of [-1, 1]) { const ex = g.cx + sd * g.bw * 0.3, ey = g.top + 4, eh = g.bh * by(g.stage, 0.55, 0.6, 0.62), ew = g.bw * 0.2, tw = Math.sin(x.t / 700 + sd) * 2;
          c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.moveTo(ex - ew, ey + 10); c.lineTo(ex + sd * 4 + tw, ey - eh + 3); c.lineTo(ex + ew, ey + 10); c.closePath(); c.fill();
          c.fillStyle = rgb(x.body); c.beginPath(); c.moveTo(ex - ew, ey + 8); c.lineTo(ex + sd * 4 + tw, ey - eh); c.lineTo(ex + ew, ey + 8); c.closePath(); c.fill();
          c.fillStyle = rgb(dk(x.parts, 0.1)); c.beginPath(); c.moveTo(ex - ew * 0.5, ey + 6); c.lineTo(ex + sd * 3 + tw, ey - eh * 0.6); c.lineTo(ex + ew * 0.5, ey + 6); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22; limb(c, [fx, g.bot - 8, fx, g.bot, fx, 180], by(g.stage, 8, 9, 10), dk(x.parts, 0.12), sd < 0 ? x.L.legL : x.L.legR, x.t); blob(c, fx, 182, by(g.stage, 7, 8, 9), 4.5, dk(x.parts, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182, 7]); } },
      inside(c, g, x) { c.fillStyle = '#f7f4ee'; c.beginPath(); c.ellipse(g.cx, g.bot, g.bw * 0.34, g.bh * 0.42, 0, 0, 7); c.fill();
        for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * g.bw * 0.36, g.top + g.bh * 0.66, g.bw * 0.2, g.bh * 0.14, 0, 0, 7); c.fill(); }
        c.strokeStyle = '#d23a3a'; c.lineWidth = 2.4; c.lineCap = 'round'; const ey = g.top + g.bh * 0.42, s = by(g.stage, 0.8, 0.88, 0.96);
        if (!x.back) for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.3, ey - 9 * s); c.quadraticCurveTo(g.cx + sd * g.bw * 0.38, ey - 12 * s, g.cx + sd * g.bw * 0.44, ey - 6 * s); c.stroke(); }
        if (g.stage === 'Mega') { c.fillStyle = '#d23a3a'; c.beginPath(); c.moveTo(g.cx, g.top + 6); c.lineTo(g.cx + 4, g.top + 12); c.lineTo(g.cx, g.top + 18); c.lineTo(g.cx - 4, g.top + 12); c.closePath(); c.fill(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.5, g.left + g.bw * 0.12, g.top + g.bh * 0.22, g.left + g.bw * 0.3, g.top + g.bh * 0.1],
      head: g => [g.cx, g.top + 2, g.bw * 0.46],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.18, my: 0.66, s: by(g.stage, 0.78, 0.86, 0.94) })
    },
    /* Naga: a serpent head with a cobra hood, rising from coils, with a flicking tongue and a gold jewel at Mega */
    Naga: {
      special: true, dims: { Bit: [58, 52], Byte: [70, 62], Mega: [80, 72] },
      bottom(st) { return by(st, 150, 140, 130); }, height(st) { return 188 - this.bottom(st) + this.dims[st][1] + 8; },
      path(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); },
      behind(c, g, x) { const hw = g.bw * by(g.stage, 0.7, 0.8, 0.9), hy = g.top + g.bh * 0.55;
        c.fillStyle = rgb(dk(x.body, 0.3)); c.beginPath(); c.ellipse(g.cx, hy + 3, hw, g.bh * 0.62, 0, 0, 7); c.fill();
        c.fillStyle = rgb(dk(x.body, 0.08)); c.beginPath(); c.ellipse(g.cx, hy, hw, g.bh * 0.62, 0, 0, 7); c.fill();
        c.fillStyle = rgb(x.acc); for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(g.cx + sd * hw * 0.62, hy, hw * 0.16, g.bh * 0.24, 0, 0, 7); c.fill(); }
        const nw = g.bw * 0.42, sw = Math.sin(x.t / 520) * 4, cy = 172, cw = by(g.stage, 34, 40, 46), th = by(g.stage, 13, 15, 17);
        c.fillStyle = rgb(dk(x.body, 0.35)); c.beginPath(); c.ellipse(g.cx, cy + 6, cw + th, th * 0.9, 0, 0, 7); c.fill();
        c.fillStyle = rgb(dk(x.body, 0.1)); c.beginPath(); c.ellipse(g.cx, cy + 2, cw + th, th * 0.9, 0, 0, 7); c.fill();
        c.fillStyle = rgb(x.body); c.beginPath(); c.ellipse(g.cx - 4, cy - th * 0.8, cw * 0.8 + th * 0.6, th * 0.8, 0, 0, 7); c.fill();
        limb(c, [g.cx + cw + 6, cy + 4, g.cx + cw + 22 + sw, cy - 6, g.cx + cw + 16 + sw, cy - 24], by(g.stage, 9, 10, 12), x.body, null, x.t);
        c.fillStyle = rgb(x.body); c.beginPath(); c.moveTo(g.cx - nw / 2, g.bot - 6); c.quadraticCurveTo(g.cx - nw * 0.6 + sw * 0.4, (g.bot + cy) / 2, g.cx - nw * 0.4, cy - th); c.lineTo(g.cx + nw * 0.5, cy - th); c.quadraticCurveTo(g.cx + nw * 0.6 + sw * 0.4, (g.bot + cy) / 2, g.cx + nw / 2, g.bot - 6); c.closePath(); c.fill();
        c.fillStyle = rgb(lt(x.parts, 0.35)); for (let i = 0; i < 4; i++) { const yy = g.bot + 2 + i * ((cy - th - g.bot) / 4); c.beginPath(); c.ellipse(g.cx + sw * 0.1 * i, yy, nw * 0.26, 3.2, 0, 0, 7); c.fill(); }
        x.feet.push([g.cx - cw * 0.5, 180, 8], [g.cx + cw * 0.5, 180, 8]); },
      inside(c, g, x) { c.fillStyle = rgb(lt(x.parts, 0.3)); c.beginPath(); c.ellipse(g.cx, g.bot, g.bw * 0.22, g.bh * 0.18, 0, 0, 7); c.fill(); },
      front(c, g, x) { const ph = (x.t / 1600) % 1; if (ph < 0.18) { const my = g.top + g.bh * 0.74, L = Math.sin(ph / 0.18 * Math.PI) * 12; c.strokeStyle = '#d23a5a'; c.lineWidth = 2; c.lineCap = 'round';
          c.beginPath(); c.moveTo(g.cx, my); c.lineTo(g.cx, my + L); c.lineTo(g.cx - 3, my + L + 4); c.moveTo(g.cx, my + L); c.lineTo(g.cx + 3, my + L + 4); c.stroke(); }
        if (g.stage === 'Mega') { c.fillStyle = '#f2c94c'; c.beginPath(); c.moveTo(g.cx - 14, g.top + 6); c.lineTo(g.cx - 10, g.top - 8); c.lineTo(g.cx - 4, g.top + 2); c.lineTo(g.cx, g.top - 12); c.lineTo(g.cx + 4, g.top + 2); c.lineTo(g.cx + 10, g.top - 8); c.lineTo(g.cx + 14, g.top + 6); c.closePath(); c.fill();
          c.fillStyle = rgb(x.acc); c.beginPath(); c.arc(g.cx, g.top + 2, 3, 0, 7); c.fill(); } },
      hl: g => [g.left + g.bw * 0.12, g.top + g.bh * 0.55, g.left + g.bw * 0.14, g.top + g.bh * 0.22, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.2, my: 0.68, s: by(g.stage, 0.74, 0.82, 0.9) })
    },
    /* Yeti: a big shaggy snowball with a pale blue face patch, small ivory horns from Byte, and wide feet */
    Yeti: {
      special: true, dims: { Bit: [70, 66], Byte: [88, 84], Mega: [104, 100] },
      bottom() { return 176; }, height(st) { return this.dims[st][1] + 16 + (st === 'Bit' ? 0 : 12); },
      path(c, g) { const n = 22, cx = g.cx, cy = g.top + g.bh / 2; c.beginPath();
        for (let i = 0; i <= n * 2; i++) { const a = -Math.PI / 2 + i / (n * 2) * Math.PI * 2, r = 1 + (i % 2 ? 0.055 : 0), px = cx + Math.cos(a) * g.bw / 2 * r, py = cy + Math.sin(a) * g.bh / 2 * r;
          if (!i) c.moveTo(px, py); else c.lineTo(px, py); } c.closePath(); },
      arms: 'stub', armW: st => by(st, 8, 10, 12), handR: st => by(st, 7, 8.5, 10), shoulderY: 0.55,
      behind(c, g, x) { if (g.stage !== 'Bit') for (const sd of [-1, 1]) { c.fillStyle = '#efe6cf'; c.beginPath(); c.moveTo(g.cx + sd * g.bw * 0.16, g.top + 8); c.quadraticCurveTo(g.cx + sd * g.bw * 0.3, g.top - 14, g.cx + sd * g.bw * 0.24, g.top - by(g.stage, 0, 16, 22)); c.quadraticCurveTo(g.cx + sd * g.bw * 0.22, g.top - 4, g.cx + sd * g.bw * 0.08, g.top + 10); c.closePath(); c.fill(); }
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.24, lift = Math.max(0, sd * x.walk) * 5; blob(c, fx, 182 - lift, by(g.stage, 13, 16, 19), 6, lt(x.parts, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182 - lift, 12]); } },
      inside(c, g, x) { if (!x.back) { c.fillStyle = '#b9d3e6'; c.beginPath(); c.ellipse(g.cx, g.top + g.bh * 0.46, g.bw * 0.32, g.bh * 0.26, 0, 0, 7); c.fill(); }
        c.strokeStyle = rgba(dk(x.body, 0.12), 0.6); c.lineWidth = 2; c.lineCap = 'round';
        for (let i = 0; i < 7; i++) { const a = i * 0.9, px = g.cx + Math.cos(a) * g.bw * 0.36, py = g.top + g.bh * 0.55 + Math.sin(a) * g.bh * 0.3; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 3, py + 6); c.stroke(); } },
      hl: g => [g.left + g.bw * 0.14, g.top + g.bh * 0.5, g.left + g.bw * 0.14, g.top + g.bh * 0.2, g.left + g.bw * 0.36, g.top + g.bh * 0.08],
      head: g => [g.cx, g.top + 2, g.bw * 0.5],
      face: (c, g, x, look) => faceTwo(c, g, x, look, { ey: 0.42, ex: 0.17, my: 0.6, fang: true, lidCol: [185, 211, 230], s: by(g.stage, 0.74, 0.82, 0.9) })
    }
  };

  /* ---------- fusion hybrids: the first family's body on the second family's legs ----------
     Chomp is drawn by its own function, so a Chomp body or Chomp feet use this stand-in built from STAGE. */
  /* ---------- how the specials grow (Gid, 16 Nov 2026): a Bit is a round baby, a Byte is taller on longer legs,
     and a Mega takes a grown-up build, broad at the shoulders and narrower at the base. A family whose own shape is
     the point (a pumpkin, a mantle, a hood, coils, a round belly, four legs) keeps that shape and still changes proportion ---------- */
  const EVO_K = { Bit: [1.06, 0.9], Byte: [0.96, 1.12], Mega: [1.06, 1.14] }, EVO_LEG = { Bit: 0, Byte: 4, Mega: 8 };
  function evoRound(c, g) { c.beginPath(); c.ellipse(g.cx, g.top + g.bh / 2, g.bw / 2, g.bh / 2, 0, 0, 7); }
  function evoHero(c, g) { const L = g.left, R = g.left + g.bw, T = g.top, B = g.bot, w = g.bw, nb = w * 0.1, r = w * 0.46;   // broad shoulders, sides drawing in to a narrower base
    c.beginPath(); c.moveTo(L + r, T); c.lineTo(R - r, T); c.quadraticCurveTo(R, T, R, T + r * 0.9); c.bezierCurveTo(R, T + g.bh * 0.62, R - nb, B - w * 0.06, R - nb - w * 0.2, B);
    c.lineTo(L + nb + w * 0.2, B); c.bezierCurveTo(L + nb, B - w * 0.06, L, T + g.bh * 0.62, L, T + r * 0.9); c.quadraticCurveTo(L, T, L + r, T); c.closePath(); }
  const EVO_KEEP = { Jack: 'both', Kraken: 'both', Naga: 'both', Hydra: 'both', Bakunawa: 'both', Yeti: 'both', Golem: 'bit', Tanuki: 'mega', Diwata: 'mega', Unicorn: 'mega', Kirin: 'mega',
    Sphinx: 'mega', Griffin: 'mega', Cerberus: 'mega', Troll: 'mega', Salamander: 'mega', Mermaid: 'mega',
    Cthulhu: 'both', Hastur: 'both', Shoggoth: 'both', Dagon: 'both', Migo: 'both',
    Nightgaunt: 'both', Ghoul: 'both', Gug: 'both', Yog: 'both', Shub: 'both' };
  const EVO_LOW = { Salamander: 1 };   // a lizard stays low to the ground at every stage
  for (const [n, F] of Object.entries(FAM)) { if (!F.special || F.hybridOf) continue;
    const D = F.dims; F.dims = {}; for (const st in D) F.dims[st] = [Math.round(D[st][0] * EVO_K[st][0] * (EVO_LOW[n] && st !== 'Bit' ? 1.06 : 1)), Math.round(D[st][1] * (EVO_LOW[n] ? (st === 'Bit' ? 0.94 : 0.96) : EVO_K[st][1]))];
    if (F.ll) { const l0 = F.ll; F.ll = st => l0(st) + EVO_LEG[st]; }
    const keep = EVO_KEEP[n], p0 = F.path;
    F.path = function (c, g, x) { if (g.stage === 'Bit' && keep !== 'both' && keep !== 'bit') return evoRound(c, g); if (g.stage === 'Mega' && keep !== 'both' && keep !== 'mega') return evoHero(c, g); return p0.call(this, c, g, x); }; }

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
    c.beginPath(); c.ellipse(100 + (P.lean || 0) * 0.5, 186.5, Math.max(bw * 0.44, 24) * (F.float ? 0.75 : 1) * (1 + lift * 0.008), 6, 0, 0, 7); c.fill();
    c.save();
    c.translate(P.lean || 0, lift);
    c.translate(100, 176); c.rotate(((P.tilt || 0) + (P.wobble ? Math.sin(t / 160) * 8 : 0)) * Math.PI / 180); c.scale(P.sx || 1, P.sy || 1); c.translate(-100, -176);
    if (m.fx) fxBehind(c, m.fx, () => F.path.call(F, c, g, x), g, body, t);
    const headAt = F.head ? F.head.call(F, g) : [g.cx, g.top + 2, g.bw * 0.5], pathF = () => F.path.call(F, c, g, x);
    variantBehind(c, pathF, g, body, t);
    costumeBehind(c, m, g, headAt, t);
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
    bellyOn(c, m, g, body); variantOn(c, g); costumeOn(c, m, g, body, t);
    if (m.fx) fxOnBody(c, m.fx, () => F.path.call(F, c, g, x), g, body, t);
    c.restore();
    variantOutline(c, pathF);
    capBody(c, g); if (CAP && F.topUp && F.topUp[stage]) CAP.top = capPt(c, g.cx, g.top + g.bh * 0.18 - F.topUp[stage]);   // headgear the bar above it has to clear
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
  const COSTUME_PARTS = { Panda: [38, 32, 40], Bee: [38, 32, 40], Ladybug: [38, 32, 40], Watermelon: [63, 143, 58], 'Candy cane': [214, 48, 63],
    Tiger: [196, 98, 30], Zebra: [38, 32, 40], Cow: [236, 230, 220], Penguin: [240, 150, 50], Strawberry: [63, 154, 69], 'Rubber duck': [240, 138, 42], Clownfish: [38, 32, 40] };
  const draw = (c, m, p, t = 0, look = [0, 0]) => {
    if (m.costume && COSTUME_PARTS[m.costume] && m.pal) m = { ...m, pal: { ...m.pal, parts: COSTUME_PARTS[m.costume] } };
    CAP = m.capture || null; if (CAP) { CAP.hands = []; CAP.eyes = null; CAP.mouth = null; }
    VAR = m.variant || null; EYE = VAR === 'Moonlit' ? 'moon' : VAR === 'Pampered' ? 'spark' : null; LIDC = m.pal && m.pal.body ? rgb(m.pal.body) : '#999';
    const r = FAM[m.family] ? drawFamily(c, m, p, t, look, FAM[m.family]) : drawChomp(c, m, p, t, look);
    CAP = null; VAR = null; EYE = null; return r;
  };
  const height = (stage, marks = [], family = 'Chomp') => FAM[family] ? FAM[family].height(stage) : chompHeight(stage, marks);
  const width = (stage, family = 'Chomp') => FAM[family] ? FAM[family].dims[stage][0] : STAGE[stage].bw;
  return { draw, blend, height, width, hybrid, POSES: Object.keys(POSE), STAGE, FAMILIES: ['Chomp', ...Object.keys(FAM).filter(k => !FAM[k].hybridOf)] };
})();
