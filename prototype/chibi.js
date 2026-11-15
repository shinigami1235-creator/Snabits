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
        for (const sd of [-1, 1]) { const fx = g.cx + sd * g.bw * 0.22; blob(c, fx, 182, by(g.stage, 7, 8, 9), 4.5, dk(x.parts, 0.1), sd < 0 ? x.L.legL : x.L.legR, x.t, 'foot'); x.feet.push([fx, 182, 7]); } },
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
