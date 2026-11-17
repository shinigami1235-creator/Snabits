/* Expedition art (redrawn 15 Nov 2026 to match the approved training places and regions): the obstacles, the finds and the
   map icons. Same build as everything else: flat shapes, a darker copy a little lower for depth, one soft highlight, round
   thick lines. Each drawer works in yard units at (x, y) on the ground and takes a scale, so the map reuses them as icons. */

const XA = {
  hi(c, x, y, r, a = 0.5, from = 3.5, to = 4.6) { c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = Math.max(0.8, r * 0.16); c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, from, to); c.stroke(); },
  shadow(c, x, y, w, a = 0.22) { c.fillStyle = `rgba(30,22,16,${a})`; c.beginPath(); c.ellipse(x, y, w, w * 0.18, 0, 0, 7); c.fill(); },
  poly(c, pts) { c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); },

  // Power: a rounded boulder with a lighter top, moss, a chipped crack and pebbles round its foot
  rock(c, x, y, s = 1, rot = 0) {
    const r = 15 * s; XA.shadow(c, x, y + 1, r * 1.1);
    c.save(); c.translate(x, y - r * 0.92); c.rotate(rot);
    const body = () => SC.blob(c, 0, 0, [[0, 0, r], [-r * 0.45, r * 0.18, r * 0.72], [r * 0.5, r * 0.2, r * 0.7], [r * 0.1, -r * 0.35, r * 0.75]]);
    SC.depth(c, body, '#a49d92', 2.2 * s, 0.32);
    c.fillStyle = '#b9b3a8'; SC.blob(c, -r * 0.15, -r * 0.3, [[0, 0, r * 0.62], [r * 0.35, r * 0.1, r * 0.45]]); c.fill();
    c.fillStyle = '#6f9a4a'; SC.blob(c, r * 0.15, -r * 0.92, [[0, 0, r * 0.32], [-r * 0.3, r * 0.08, r * 0.22], [r * 0.28, r * 0.1, r * 0.2]]); c.fill();
    c.strokeStyle = 'rgba(70,62,54,.55)'; c.lineWidth = 1.1 * s; c.lineJoin = 'round'; c.beginPath(); c.moveTo(r * 0.92, -r * 0.05); c.lineTo(r * 0.55, r * 0.1); c.lineTo(r * 0.6, r * 0.38); c.stroke();
    XA.hi(c, -r * 0.1, -r * 0.05, r * 0.7, 0.5);
    c.restore();
    for (const [dx, pr] of [[-r * 1.15, 2.2], [r * 1.1, 1.8], [r * 1.35, 1.3]]) SC.depth(c, () => { c.beginPath(); c.ellipse(x + dx, y - pr * 0.6, pr * s * 1.2, pr * s * 0.8, 0, 0, 7); }, '#9a948a', 0.8, 0.3);
  },

  // Speed: a gap in the ground with rock layers down its walls, a dark drop and grit falling in
  chasm(c, x, y, w, t, s = 1) {
    const d = 46 * s, g = c.createLinearGradient(0, y, 0, y + d); g.addColorStop(0, '#3b2f29'); g.addColorStop(1, '#120d0b');
    c.fillStyle = g; XA.poly(c, [[x, y - 1], [x + w, y - 1], [x + w - 7 * s, y + d], [x + 7 * s, y + d]]); c.fill();
    for (const [side, col] of [[0, '#7a6656'], [1, '#5f4e42']]) {                         // the two walls, lit one side
      const ex = side ? x + w : x, dir = side ? -1 : 1;
      c.fillStyle = col; XA.poly(c, [[ex, y - 1], [ex + dir * 9 * s, y - 1], [ex + dir * 13 * s, y + d * 0.5], [ex + dir * 7 * s, y + d], [ex + dir * 3 * s, y + d]]); c.fill();
      c.strokeStyle = SC.dark(col, 0.3); c.lineWidth = 1 * s; for (const k of [0.22, 0.48, 0.74]) { c.beginPath(); c.moveTo(ex, y + d * k); c.lineTo(ex + dir * 11 * s, y + d * k + 2 * s); c.stroke(); } }
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x, y - 1, w, 2.5 * s);                    // the lip
    c.fillStyle = 'rgba(255,255,255,.18)'; for (const ex of [x - 6 * s, x + w]) c.fillRect(ex, y - 2, 6 * s, 1.2);
    if (t != null) { c.fillStyle = 'rgba(200,180,150,.7)'; for (let i = 0; i < 4; i++) { const q = ((t / 900 + i * 0.27) % 1); c.beginPath(); c.arc(x + w * (0.2 + 0.2 * i), y + q * d, 0.9 * s, 0, 7); c.fill(); } }
  },

  // Mind: a carved door in a stone frame with three rune sockets that light one by one; drop slides the slab into the ground
  door(c, x, y, lit, drop, t, s = 1) {
    const W = 50 * s, H = 64 * s, L = x - W / 2;
    XA.shadow(c, x, y + 1, W * 0.62);
    SC.depth(c, () => { c.beginPath(); c.roundRect(L, y - H, W, H, [10 * s, 10 * s, 2, 2]); }, '#8a847b', 2.2 * s, 0.32);   // the frame
    c.fillStyle = '#9c968c'; for (const [bx, by, bw] of [[0.08, 0.08, 0.3], [0.62, 0.08, 0.3], [0.05, 0.42, 0.14], [0.81, 0.42, 0.14], [0.05, 0.72, 0.14], [0.81, 0.72, 0.14]]) { c.beginPath(); c.roundRect(L + W * bx, y - H + H * by, W * bw, H * 0.22, 2 * s); c.fill(); }
    const dx = L + 9 * s, dw = W - 18 * s, dh = H - 14 * s, dy = y - dh;                 // the doorway, then the slab inside it
    c.fillStyle = '#2c2622'; c.beginPath(); c.roundRect(dx, dy, dw, dh, [6 * s, 6 * s, 0, 0]); c.fill();
    c.save(); c.beginPath(); c.roundRect(dx, dy, dw, dh, [6 * s, 6 * s, 0, 0]); c.clip(); c.translate(0, drop || 0);
    SC.depth(c, () => { c.beginPath(); c.roundRect(dx + 1, dy + 1, dw - 2, dh, [5 * s, 5 * s, 0, 0]); }, '#7d776f', 1.5 * s, 0.25);
    c.strokeStyle = 'rgba(45,40,36,.45)'; c.lineWidth = 1 * s; c.beginPath(); c.moveTo(x, dy + 3); c.lineTo(x, y); c.stroke();
    const runes = [[-8, 0.3, 'tri', [226, 72, 63]], [8, 0.3, 'sq', [72, 120, 196]], [0, 0.62, 'circ', [242, 193, 78]]];
    runes.forEach(([ox, oy, sh, col], i) => { const rx = x + ox * s, ry = dy + dh * oy, on = (lit || 0) > i, pulse = on ? 0.75 + 0.25 * Math.sin((t || 0) / 160 + i) : 0;
      c.fillStyle = '#5d5852'; c.beginPath(); c.arc(rx, ry, 6.2 * s, 0, 7); c.fill();
      if (on) { const g = c.createRadialGradient(rx, ry, 1, rx, ry, 12 * s); g.addColorStop(0, `rgba(${col},${0.55 * pulse})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(rx - 12 * s, ry - 12 * s, 24 * s, 24 * s); }
      c.fillStyle = on ? `rgb(${col})` : 'rgba(40,36,32,.55)'; c.beginPath(); const r = 3.6 * s;
      if (sh === 'tri') { c.moveTo(rx, ry - r); c.lineTo(rx + r, ry + r * 0.8); c.lineTo(rx - r, ry + r * 0.8); } else if (sh === 'sq') c.rect(rx - r * 0.85, ry - r * 0.85, r * 1.7, r * 1.7); else c.arc(rx, ry, r, 0, 7); c.fill(); });
    c.restore();
    c.fillStyle = '#6f9a4a'; SC.blob(c, L + 6 * s, y - H + 6 * s, [[0, 0, 4 * s], [5 * s, -1, 3 * s]]); c.fill();
    SC.blob(c, L + W - 4 * s, y - 3 * s, [[0, 0, 4 * s], [-5 * s, 1, 3 * s]]); c.fill();
    c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.roundRect(L + 3 * s, y - H + 2 * s, W - 6 * s, 4 * s, 3 * s); c.fill();   // light along the top of the frame
  },

  // Insight: a deep thicket in layered greens; shake rustles it
  thicket(c, x, y, col, shake, t, s = 1) {
    const sh = shake ? Math.sin((t || 0) / 40) * 1.6 : 0, base = col || '#3f8a44';
    XA.shadow(c, x, y + 1, 18 * s);
    SC.depth(c, () => SC.blob(c, x + sh, y - 12 * s, [[0, -5 * s, 12 * s], [-11 * s, 2 * s, 9 * s], [11 * s, 2 * s, 9 * s], [-4 * s, 4 * s, 8 * s], [5 * s, 4 * s, 8 * s]]), SC.dark(base, 0.12), 2 * s, 0.28);
    c.fillStyle = SC.light(base, 0.12); SC.blob(c, x + sh - 2 * s, y - 17 * s, [[0, 0, 7 * s], [-7 * s, 4 * s, 5 * s], [7 * s, 3 * s, 5 * s]]); c.fill();
    c.fillStyle = SC.light(base, 0.3); for (const [lx, ly] of [[-9, -10], [-2, -20], [8, -14], [3, -6]]) { c.beginPath(); c.ellipse(x + sh + lx * s, y + ly * s, 2.6 * s, 1.3 * s, -0.6, 0, 7); c.fill(); }
    c.fillStyle = '#fff1f4'; for (const [fx, fy] of [[-12, -4], [10, -9]]) { c.beginPath(); c.arc(x + sh + fx * s, y + fy * s, 1.3 * s, 0, 7); c.fill(); }
  },
  // the hidden way it spots: glowing prints with motes over them
  prints(c, x, y, n, t) {
    for (let i = 0; i < n; i++) { const gx = x + i * 15, gy = y + (i % 2) * 3, a = 0.55 + 0.45 * Math.sin(t / 220 - i * 0.8);
      const g = c.createRadialGradient(gx, gy, 0.5, gx, gy, 8); g.addColorStop(0, `rgba(255,240,170,${0.7 * a})`); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.fillRect(gx - 8, gy - 8, 16, 16);
      c.fillStyle = `rgba(255,248,210,${a})`; c.beginPath(); c.ellipse(gx, gy, 2.4, 1.4, 0, 0, 7); c.fill(); for (const d of [-1.8, 0, 1.8]) { c.beginPath(); c.arc(gx + d + 1.2, gy - 2, 0.7, 0, 7); c.fill(); }
      const my = gy - 6 - ((t / 40 + i * 7) % 12); c.fillStyle = `rgba(255,240,170,${0.8 * (1 - ((t / 40 + i * 7) % 12) / 12)})`; c.beginPath(); c.arc(gx + Math.sin(t / 300 + i) * 2, my, 0.9, 0, 7); c.fill(); }
  },

  // Constitution: a bramble wall of arching vines with thorns, leaves and berries
  bramble(c, x, y, s = 1) {
    XA.shadow(c, x, y + 1, 22 * s);
    SC.depth(c, () => SC.blob(c, x, y - 3 * s, [[-12 * s, 0, 6 * s], [0, -1 * s, 7 * s], [12 * s, 0, 6 * s]]), '#3f5a2a', 1.2 * s, 0.25);   // the tangle at its base
    const vines = [[-18, 24, -6], [-10, 30, 4], [-2, 34, -3], [6, 28, 6], [14, 22, -5], [20, 16, 3]];
    for (const pass of [0, 1]) for (const [vx, h, lean] of vines) {
      const bx = x + vx * s, tx = bx + lean * s, ty = y - h * s;
      c.strokeStyle = pass ? '#5a6a32' : '#3c4722'; c.lineWidth = (pass ? 2.2 : 3.6) * s; c.lineCap = 'round';
      c.beginPath(); c.moveTo(bx, y); c.quadraticCurveTo(bx + lean * 2 * s, y - h * 0.6 * s, tx, ty); c.quadraticCurveTo(tx + lean * 0.8 * s, ty + 6 * s, tx + lean * 1.6 * s, ty + 3 * s); c.stroke();
      if (!pass) continue;
      c.fillStyle = '#d9cfa8'; for (const k of [0.3, 0.55, 0.8]) { const px = bx + (tx - bx) * k + lean * 0.6 * s * Math.sin(k * 3), py = y - h * s * k, side = k === 0.55 ? -1 : 1;
        c.beginPath(); c.moveTo(px, py - 1.2 * s); c.lineTo(px + side * 3.2 * s, py - 2.4 * s); c.lineTo(px, py + 1.2 * s); c.fill(); } }
    c.fillStyle = '#6e8f3e'; for (const [lx, ly, a] of [[-14, -14, -0.5], [-1, -22, 0.4], [11, -12, -0.3], [4, -6, 0.6]]) { c.beginPath(); c.ellipse(x + lx * s, y + ly * s, 3.4 * s, 1.7 * s, a, 0, 7); c.fill(); }
    c.fillStyle = '#b8324a'; for (const [bx, by] of [[-8, -18], [9, -20], [-2, -9]]) { c.beginPath(); c.arc(x + bx * s, y + by * s, 1.8 * s, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(x + bx * s - 0.6 * s, y + by * s - 0.6 * s, 0.6 * s, 0, 7); c.fill(); c.fillStyle = '#b8324a'; }
  },

  // books lying open and stacked on the ground, so a door in front of them reads as a thinking problem
  litter(c, x, y, s = 1) {
    const B = [[-16, 0, '#b8463b', -0.15], [-4, 0, '#3b6fb8', 0.1], [9, 0, '#3f8f4a', -0.05], [-10, -4, '#c9a33b', 0.2]];
    for (const [bx, by, col, r] of B) { c.save(); c.translate(x + bx * s, y + by * s); c.rotate(r); SC.depth(c, () => { c.beginPath(); c.roundRect(-6 * s, -3.5 * s, 12 * s, 3.5 * s, 1); }, col, 1, 0.3); c.fillStyle = 'rgba(255,250,235,.85)'; c.fillRect(-5 * s, -2.6 * s, 10 * s, 1.1 * s); c.restore(); }
    c.save(); c.translate(x + 20 * s, y - 1); c.rotate(0.08);                              // one lying open
    c.fillStyle = '#7a3b2e'; c.beginPath(); c.moveTo(-9 * s, 0); c.lineTo(0, -1.5 * s); c.lineTo(9 * s, 0); c.lineTo(9 * s, 1.2 * s); c.lineTo(-9 * s, 1.2 * s); c.fill();
    c.fillStyle = '#f6efdc'; c.beginPath(); c.moveTo(-8 * s, -0.4 * s); c.quadraticCurveTo(-4 * s, -3.6 * s, 0, -1.6 * s); c.quadraticCurveTo(4 * s, -3.6 * s, 8 * s, -0.4 * s); c.lineTo(0, 0); c.fill();
    c.strokeStyle = 'rgba(90,65,40,.5)'; c.lineWidth = 0.6 * s; for (const k of [-5, -2.5, 2.5, 5]) { c.beginPath(); c.moveTo(k * s, -1.4 * s - Math.abs(k) * 0.12 * s); c.lineTo(k * s + (k < 0 ? 1.5 : -1.5) * s, -1.2 * s); c.stroke(); }
    c.restore();
    c.fillStyle = '#f2e6c8'; c.save(); c.translate(x - 24 * s, y - 1); c.rotate(-0.4); c.fillRect(-3 * s, -2 * s, 6 * s, 4 * s); c.restore();   // a loose page
  },

  // a dart totem: a carved stone post whose mouths fire darts across the path at two heights
  darts(c, x, y, t, s = 1, live = true) {
    const H = 46 * s, W = 16 * s;
    XA.shadow(c, x, y + 1, 12 * s);
    SC.depth(c, () => { c.beginPath(); c.roundRect(x - W / 2, y - H, W, H, [5 * s, 5 * s, 1, 1]); }, '#8a7f70', 2 * s, 0.32);
    c.fillStyle = '#a0968a'; c.beginPath(); c.roundRect(x - W / 2 + 2 * s, y - H + 2 * s, W - 4 * s, 6 * s, 3 * s); c.fill();
    c.fillStyle = '#5b5248'; c.beginPath(); c.arc(x - 3 * s, y - H + 12 * s, 1.6 * s, 0, 7); c.arc(x + 3 * s, y - H + 12 * s, 1.6 * s, 0, 7); c.fill();   // a carved face
    for (const hy of [0.42, 0.78]) { c.fillStyle = '#2c2622'; c.beginPath(); c.ellipse(x - W / 2 + 1, y - H * (1 - hy), 2.6 * s, 2 * s, 0, 0, 7); c.fill(); }
    c.fillStyle = '#6f9a4a'; SC.blob(c, x + 4 * s, y - H, [[0, 0, 3 * s], [-4 * s, 0.5 * s, 2.4 * s]]); c.fill();
    for (let i = 0; i < 4; i++) { const px = x - 28 * s - i * 10 * s; c.fillStyle = 'rgba(60,50,40,.28)'; c.fillRect(px - 4 * s, y - 1, 8 * s, 2); }   // pressure plates on the path
    if (!live || t == null) return;
    for (const [hy, ph] of [[0.42, 0], [0.78, 0.5]]) { const q = ((t / 700) + ph) % 1, dx = x - W / 2 - q * 90 * s, dy = y - H * (1 - hy);
      if (q > 0.85) continue; c.globalAlpha = 1 - q * 0.6;
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1 * s; c.beginPath(); c.moveTo(dx + 4 * s, dy); c.lineTo(dx + 14 * s, dy); c.stroke();
      c.strokeStyle = '#5a4128'; c.lineWidth = 1.3 * s; c.beginPath(); c.moveTo(dx - 5 * s, dy); c.lineTo(dx + 3 * s, dy); c.stroke();
      c.fillStyle = '#c9c2b6'; c.beginPath(); c.moveTo(dx - 7 * s, dy); c.lineTo(dx - 4 * s, dy - 1.4 * s); c.lineTo(dx - 4 * s, dy + 1.4 * s); c.fill();
      c.fillStyle = '#d24f43'; c.beginPath(); c.moveTo(dx + 3 * s, dy); c.lineTo(dx + 6 * s, dy - 2 * s); c.lineTo(dx + 5 * s, dy); c.lineTo(dx + 6 * s, dy + 2 * s); c.fill(); c.globalAlpha = 1; }
  },
  dart(c, x, y, s = 1) { c.strokeStyle = '#5a4128'; c.lineWidth = 1.3 * s; c.beginPath(); c.moveTo(x - 5 * s, y); c.lineTo(x + 3 * s, y); c.stroke(); c.fillStyle = '#c9c2b6'; c.beginPath(); c.moveTo(x - 7 * s, y); c.lineTo(x - 4 * s, y - 1.4 * s); c.lineTo(x - 4 * s, y + 1.4 * s); c.fill(); c.fillStyle = '#d24f43'; c.beginPath(); c.moveTo(x + 3 * s, y); c.lineTo(x + 6 * s, y - 2 * s); c.lineTo(x + 5 * s, y); c.lineTo(x + 6 * s, y + 2 * s); c.fill(); },

  // a hedge wall with three archways that look the same; two of them shimmer because they aren't really there
  mirage(c, x, y, real, reveal, t, s = 1, van = null) {
    const A = c.globalAlpha;   // so the whole thing can fade
    const W = 92 * s, H = 40 * s, L = x - W / 2;
    SC.depth(c, () => { c.beginPath(); c.roundRect(L, y - H, W, H, [12 * s, 12 * s, 2, 2]); }, '#3f7046', 2 * s, 0.3);
    c.fillStyle = '#4f8656'; SC.blob(c, x, y - H + 2 * s, [[-34 * s, 0, 8 * s], [-16 * s, -2 * s, 9 * s], [2 * s, 0, 8 * s], [20 * s, -2 * s, 9 * s], [36 * s, 0, 7 * s]]); c.fill();
    for (let i = 0; i < 3; i++) { const vu = van && van.i === i ? van.u : 0, rv = Math.max(reveal || 0, vu), fake = i !== real && rv > 0;   // the same as the real one until it's found out
      const ax = L + W * (0.2 + i * 0.3), ph = (t || 0) / 260 + i, wob = fake ? Math.sin(ph) * 0.8 * s * Math.min(1, rv * 4) : 0;
      const hole = () => { c.beginPath(); c.moveTo(ax - 8 * s, y); c.lineTo(ax - 8 * s + wob, y - 16 * s); c.arc(ax + wob, y - 16 * s, 8 * s, Math.PI, 0); c.lineTo(ax + 8 * s, y); c.closePath(); };
      if (fake) { c.globalAlpha = A * (1 - rv); }
      hole(); c.fillStyle = '#1d2a20'; c.fill();
      if (fake) { c.strokeStyle = `rgba(190,230,255,${0.35 + 0.25 * Math.sin(ph * 1.7)})`; c.lineWidth = 1 * s; hole(); c.stroke();
        c.fillStyle = 'rgba(220,240,255,.7)'; for (let k = 0; k < 2; k++) { const q = ((t || 0) / 900 + k * 0.5 + i * 0.3) % 1; c.beginPath(); c.arc(ax + Math.sin(q * 6 + i) * 5 * s, y - q * 20 * s, 0.8 * s, 0, 7); c.fill(); } }
      c.globalAlpha = A * (1);
      if (fake) { c.globalAlpha = A * (rv); hole(); c.fillStyle = '#3f7046'; c.fill(); c.globalAlpha = A * (1); } }   // a fake goes completely: the hedge is whole where it was
    c.fillStyle = SC.light('#3f7046', 0.25); for (const [lx, ly] of [[-40, -30], [-12, -34], [16, -30], [40, -24]]) { c.beginPath(); c.ellipse(x + lx * s, y + ly * s, 2.6 * s, 1.2 * s, -0.5, 0, 7); c.fill(); }
  },

  // a wooden chest with gold bands; open tips the lid back and lets light out
  chest(c, x, y, open, t, s = 1) {
    const W = 30 * s, H = 17 * s, L = x - W / 2, top = y - H;
    XA.shadow(c, x, y + 1, W * 0.62);
    if (open) { const g = c.createRadialGradient(x, top, 1, x, top - 6 * s, 26 * s), a = 0.7 + 0.2 * Math.sin((t || 0) / 200); g.addColorStop(0, `rgba(255,230,140,${a})`); g.addColorStop(1, 'rgba(255,230,140,0)'); c.fillStyle = g; c.fillRect(x - 28 * s, top - 34 * s, 56 * s, 40 * s);
      SC.depth(c, () => { c.beginPath(); c.roundRect(L + 1, top - 15 * s, W - 2, 14 * s, [6 * s, 6 * s, 1, 1]); }, '#8a5a2e', 1.2 * s, 0.3); }   // the lid stood up behind
    SC.depth(c, () => { c.beginPath(); c.roundRect(L, top, W, H, [1, 1, 3 * s, 3 * s]); }, '#a8692e', 2 * s, 0.3);
    c.strokeStyle = 'rgba(80,45,20,.35)'; c.lineWidth = 0.9 * s; for (const k of [0.34, 0.67]) { c.beginPath(); c.moveTo(L + 2, top + H * k); c.lineTo(L + W - 2, top + H * k); c.stroke(); }
    if (open) { c.fillStyle = '#4a2c16'; c.fillRect(L + 2, top, W - 4, 3 * s); c.fillStyle = '#f2c14e'; for (const [gx, gr] of [[-6, 2.6], [0, 3.2], [6, 2.4]]) { c.beginPath(); c.arc(x + gx * s, top + 1, gr * s, Math.PI, 0); c.fill(); } }
    else SC.depth(c, () => { c.beginPath(); c.roundRect(L - 1, top - 9 * s, W + 2, 10 * s, [8 * s, 8 * s, 1, 1]); }, '#b97a3c', 1.5 * s, 0.28);
    c.fillStyle = '#e0ad3c'; for (const bx of [L + 4 * s, L + W - 7 * s]) c.fillRect(bx, open ? top : top - 9 * s, 3 * s, H + (open ? 0 : 9 * s));
    if (!open) { SC.depth(c, () => { c.beginPath(); c.roundRect(x - 3.5 * s, top - 3 * s, 7 * s, 7 * s, 1.5 * s); }, '#f2c14e', 1 * s, 0.3); c.fillStyle = '#5a3a18'; c.beginPath(); c.arc(x, top, 1.2 * s, 0, 7); c.fill(); c.fillRect(x - 0.5 * s, top, 1 * s, 2 * s); }
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(L + 2, open ? top + 1 : top - 7 * s, W - 4, 1.6 * s);
  },

  // a spring: a ring of stones round a small pool that bubbles up, with ripples
  spring(c, x, y, t, s = 1) {
    XA.shadow(c, x, y + 2, 22 * s, 0.15);
    const g = c.createLinearGradient(0, y - 6 * s, 0, y + 2 * s); g.addColorStop(0, '#7fd0ef'); g.addColorStop(1, '#3a9bc9');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y - 2 * s, 17 * s, 5 * s, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.8 * s; for (let i = 0; i < 2; i++) { const q = (((t || 0) / 1400) + i * 0.5) % 1; c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(x, y - 2 * s, (3 + q * 12) * s, (1 + q * 3.4) * s, 0, 0, 7); c.stroke(); } c.globalAlpha = 1;
    const b = Math.sin((t || 0) / 140) * 1.2 * s; c.fillStyle = '#bfe9f8'; c.beginPath(); c.moveTo(x - 2.6 * s, y - 3 * s); c.quadraticCurveTo(x, y - (11 * s + b), x + 2.6 * s, y - 3 * s); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)'; for (const [dx, k] of [[-3, 0], [3, 0.5]]) { const q = (((t || 0) / 500) + k) % 1; c.beginPath(); c.arc(x + dx * s, y - 4 * s - q * 9 * s, 0.9 * s, 0, 7); c.fill(); }
    for (const [sx, sy, sr] of [[-18, -1, 4], [-11, 3, 3.6], [-2, 4.4, 3.4], [7, 4, 3.6], [15, 2, 3.8], [19, -2, 3], [-15, -6, 2.6], [14, -6, 2.6]]) SC.depth(c, () => { c.beginPath(); c.ellipse(x + sx * s, y + sy * s - 2 * s, sr * s, sr * 0.7 * s, 0, 0, 7); }, '#a39d93', 0.9 * s, 0.3);
    c.fillStyle = '#6f9a4a'; c.beginPath(); c.arc(x - 20 * s, y - 3 * s, 2.2 * s, 0, 7); c.arc(x + 20 * s, y - 4 * s, 1.8 * s, 0, 7); c.fill();
  },

  // a journal page: worn paper, a curled corner, ink lines and a little sketch of a stone
  page(c, x, y, t, s = 1, glow = true) {
    const fl = Math.sin((t || 0) / 260) * 0.12;
    if (glow) { const g = c.createRadialGradient(x, y, 1, x, y, 16 * s); g.addColorStop(0, 'rgba(255,240,180,.55)'); g.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = g; c.fillRect(x - 16 * s, y - 16 * s, 32 * s, 32 * s); }
    c.save(); c.translate(x, y); c.rotate(fl - 0.08);
    const W = 16 * s, H = 20 * s;
    SC.depth(c, () => { c.beginPath(); c.moveTo(-W / 2, -H / 2); c.lineTo(W / 2 - 4 * s, -H / 2); c.lineTo(W / 2, -H / 2 + 4 * s); c.lineTo(W / 2, H / 2); c.lineTo(-W / 2, H / 2); c.closePath(); }, '#f2e6c8', 1.2 * s, 0.25);
    c.fillStyle = '#d9c79c'; c.beginPath(); c.moveTo(W / 2 - 4 * s, -H / 2); c.lineTo(W / 2 - 4 * s, -H / 2 + 4 * s); c.lineTo(W / 2, -H / 2 + 4 * s); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(90,65,40,.6)'; c.lineWidth = 0.7 * s; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-W / 2 + 2.5 * s, -H / 2 + (4 + i * 2.6) * s); c.lineTo(W / 2 - (i ? 2.5 : 5.5) * s, -H / 2 + (4 + i * 2.6) * s); c.stroke(); }
    c.strokeStyle = 'rgba(90,65,40,.7)'; c.beginPath(); c.moveTo(-3 * s, 7 * s); c.lineTo(-3 * s, 1.5 * s); c.quadraticCurveTo(0, -1 * s, 3 * s, 1.5 * s); c.lineTo(3 * s, 7 * s); c.stroke();
    c.beginPath(); c.moveTo(-W / 2 + 2.5 * s, 6 * s); c.lineTo(-5 * s, 6 * s); c.moveTo(5 * s, 4 * s); c.lineTo(W / 2 - 2.5 * s, 4 * s); c.stroke();
    c.restore();
  },

  // a Pattern Stone: a rough standing stone with a carved frame round its faded pattern, moss, and a glow once it's found
  stone(c, x, y, sp, glow, t, s = 1) {
    const gl = 0.5 + 0.5 * Math.sin((t || 0) / 400);
    if (glow) { const g = c.createRadialGradient(x, y - 28 * s, 4, x, y - 28 * s, 46 * s); g.addColorStop(0, `rgba(255,236,150,${0.4 * gl + 0.15})`); g.addColorStop(1, 'rgba(255,236,150,0)'); c.fillStyle = g; c.fillRect(x - 46 * s, y - 74 * s, 92 * s, 92 * s);
      c.fillStyle = 'rgba(255,240,180,.9)'; for (let i = 0; i < 5; i++) { const q = (((t || 0) / 1600) + i / 5) % 1; c.globalAlpha = Math.sin(q * Math.PI); c.beginPath(); c.arc(x + Math.sin(i * 2.3) * 16 * s, y - 10 * s - q * 50 * s, 1.1 * s, 0, 7); c.fill(); } c.globalAlpha = 1; }
    XA.shadow(c, x, y + 1, 22 * s);
    const shape = () => XA.poly(c, [[x - 17 * s, y], [x - 18 * s, y - 30 * s], [x - 14 * s, y - 44 * s], [x - 5 * s, y - 52 * s], [x + 7 * s, y - 51 * s], [x + 15 * s, y - 43 * s], [x + 18 * s, y - 28 * s], [x + 17 * s, y]]);
    SC.depth(c, shape, '#8f8a83', 2.4 * s, 0.32);
    c.fillStyle = '#a19c94'; XA.poly(c, [[x - 15 * s, y - 31 * s], [x - 12 * s, y - 43 * s], [x - 4 * s, y - 50 * s], [x + 6 * s, y - 49 * s], [x + 2 * s, y - 40 * s], [x - 9 * s, y - 33 * s]]); c.fill();
    c.fillStyle = '#6f6a63'; c.beginPath(); c.roundRect(x - 12.5 * s, y - 41.5 * s, 25 * s, 31 * s, 2 * s); c.fill();   // the carved frame
    c.save(); c.beginPath(); c.rect(x - 10 * s, y - 39 * s, 20 * s, 26 * s); c.clip(); c.translate(x, y - 26 * s); c.scale(s, s); c.globalAlpha = 0.92; stoneGlyph(c, sp); c.globalAlpha = 1;
    c.fillStyle = 'rgba(143,138,131,.55)'; for (const [cx, cy, cr] of [[-9, -12, 2.5], [8, 10, 3], [9, -4, 1.6], [-7, 9, 1.8]]) { c.beginPath(); c.arc(cx, cy, cr, 0, 7); c.fill(); } c.restore();   // chipped paint
    c.strokeStyle = 'rgba(60,55,50,.5)'; c.lineWidth = 1 * s; c.beginPath(); c.moveTo(x + 15 * s, y - 20 * s); c.lineTo(x + 12 * s, y - 15 * s); c.lineTo(x + 14 * s, y - 9 * s); c.stroke();
    c.fillStyle = '#6f9a4a'; SC.blob(c, x - 4 * s, y - 50 * s, [[0, 0, 4 * s], [5 * s, 0.5 * s, 3.5 * s], [-4 * s, 2 * s, 2.6 * s]]); c.fill();
    SC.blob(c, x - 14 * s, y - 1, [[0, 0, 4 * s], [5 * s, 1, 3 * s]]); c.fill(); SC.blob(c, x + 15 * s, y - 1, [[0, 0, 3.4 * s], [-4 * s, 1, 2.6 * s]]); c.fill();
    SC.tuft(c, x - 20 * s, y, 5 * s, '#5f8a3e'); SC.tuft(c, x + 21 * s, y, 4 * s, '#5f8a3e');
    XA.hi(c, x - 4 * s, y - 36 * s, 11 * s, 0.25, 3.8, 4.4);
  },
};

/* the expedition props, called from awayProps in scenes.js; returns true when it drew the prop */
function exProp(c, p, t, front) {
  const x = p.x, y = p.y;
  switch (p.k) {
    case 'xrock': if (!front) XA.rock(c, x, y, p.s || 1, p.rot || 0); return true;
    case 'chasm': if (!front) XA.chasm(c, x, y, p.w || 40, t); return true;
    case 'sealdoor': if (!front) XA.door(c, x, y, p.lit, p.drop, t); return true;
    case 'xbush': if (!front) XA.thicket(c, x, y, p.col, p.shake, t); return true;
    case 'glowpath': if (!front) XA.prints(c, x, y, p.n, t); return true;
    case 'thorns': if (!front) XA.bramble(c, x, y, p.s || 1); return true;
    case 'chest': if (!front) XA.chest(c, x, y, p.open, t); return true;
    case 'litter': if (front) XA.litter(c, x, y, p.s || 1); return true;
    case 'darttrap': if (!front) XA.darts(c, x, y, t, p.s || 1, p.live !== false); return true;
    case 'dart': if (front) XA.dart(c, x, y, p.s || 1); return true;
    case 'mirage': if (front) return true;
      if (p.gone) { const g = p.gone, H = 70 * (p.s || 1);   // shimmering away: it breaks into wavering strips that thin out and fade
        for (let k = 0; k < 14; k++) { const y0 = y - H + k * H / 14; c.save(); c.globalAlpha = Math.max(0, 1 - g * (1.2 + (k % 3) * 0.15)); c.beginPath(); c.rect(x - 80, y0, 160, H / 14 + 0.6); c.clip();
          c.translate(Math.sin(t / 50 + k * 1.3) * g * 10, 0); XA.mirage(c, x, y, p.real, p.reveal || 0, t, p.s || 1, p.van); c.restore(); }
        return true; }
      XA.mirage(c, x, y, p.real, p.reveal || 0, t, p.s || 1, p.van); return true;
    case 'spring': if (!front) XA.spring(c, x, y, t); return true;
    case 'page': if (front) XA.page(c, x, y, t); return true;
    case 'pstone': if (!front) XA.stone(c, x, y, p.sp, p.glow, t); return true;
  }
  return typeof exProp2 === 'function' && exProp2(c, p, t, front);
}
