/* What the scene above the map shows on a team expedition (Gid, 17 Nov 2026: the map and the scenery above in sync).
   A corridor while the team walks between rooms, with stone blocks and torches that slide past as it walks, and the room it's
   in once it gets there: the room's own design (pillars, a pool, rubble, a garden), its own darkness, and the things on the
   map in that room standing in it. Caverns get rough rock instead of blocks. Every region colours its floors from its own
   palette in REGION_ART, and adds its own touch: lava cracks, puddles, ice, wires, roots, sand, beams, pipes, gold trim,
   mist, crystals, slime or Rift sparks. The backdrop is set with RS.bg = 'deep:<element>:<hall|room|cave>:<design>:<dark>'.
   Also the props for the new room events and the corridor traps. Needs scenes.js (SC, awayScene) and errantry.js
   (REGION_ART). */

const DA = {
  // the region's touch, drawn on the back wall (w) or the floor (f)
  touch: {
    Blaze: (c, x, y, t, w) => { if (w) return; c.strokeStyle = `rgba(255,${120 + Math.sin(t / 300 + x) * 40 | 0},40,.85)`; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 10, y + 6); c.lineTo(x - 2, y + 3); c.lineTo(x + 4, y + 8); c.lineTo(x + 12, y + 5); c.stroke(); },
    Tide: (c, x, y, t, w) => { if (w) { c.fillStyle = 'rgba(160,220,255,.35)'; c.fillRect(x, y - 30, 1.5, 22 + Math.sin(t / 400 + x) * 3); return; } c.fillStyle = 'rgba(120,190,230,.5)'; c.beginPath(); c.ellipse(x, y + 7, 12, 2.5, 0, 0, 7); c.fill(); },
    Frost: (c, x, y, t, w) => { if (!w) { c.fillStyle = 'rgba(230,245,255,.7)'; c.beginPath(); c.ellipse(x, y + 7, 14, 2.6, 0, 0, 7); c.fill(); return; } c.fillStyle = '#e8f6ff'; c.beginPath(); c.moveTo(x - 3, y - 46); c.lineTo(x + 3, y - 46); c.lineTo(x, y - 34); c.fill(); },
    Spark: (c, x, y, t, w) => { if (!w) return; c.strokeStyle = '#3a3a42'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 20, y - 40); c.quadraticCurveTo(x, y - 30, x + 20, y - 40); c.stroke(); if ((t / 90 + x) % 20 < 2) { c.fillStyle = '#fff36a'; c.beginPath(); c.arc(x, y - 34, 1.8, 0, 7); c.fill(); } },
    Wild: (c, x, y, t, w) => { c.strokeStyle = '#4f8a3a'; c.lineWidth = 1.6; c.beginPath(); if (w) { c.moveTo(x, y - 60); c.quadraticCurveTo(x + 6, y - 40, x - 2, y - 20); } else { c.moveTo(x - 8, y + 6); c.quadraticCurveTo(x, y + 2, x + 9, y + 7); } c.stroke(); },
    Stone: (c, x, y, t, w) => { if (w) return; c.fillStyle = 'rgba(210,190,150,.5)'; c.beginPath(); c.ellipse(x, y + 7, 13, 2.4, 0, 0, 7); c.fill(); },
    Brawl: (c, x, y, t, w) => { if (!w) return; c.fillStyle = '#7a5434'; c.fillRect(x - 2, y - 70, 4, 70); },
    Steel: (c, x, y, t, w) => { if (!w) return; c.fillStyle = '#6d747c'; c.fillRect(x - 24, y - 52, 48, 4); c.fillStyle = '#9aa1a8'; for (const d of [-20, 0, 20]) { c.beginPath(); c.arc(x + d, y - 50, 1.3, 0, 7); c.fill(); } },
    Light: (c, x, y, t, w) => { if (!w) return; c.fillStyle = 'rgba(255,214,90,.8)'; c.fillRect(x - 26, y - 64, 52, 2); },
    Shade: (c, x, y, t, w) => { if (w) return; c.fillStyle = `rgba(150,130,210,${0.18 + Math.sin(t / 700 + x) * 0.06})`; c.beginPath(); c.ellipse(x, y + 4, 22, 4, 0, 0, 7); c.fill(); },
    Charm: (c, x, y, t, w) => { if (!w) return; c.fillStyle = '#f2a6cf'; c.beginPath(); c.moveTo(x, y - 40); c.lineTo(x + 4, y - 32); c.lineTo(x, y - 24); c.lineTo(x - 4, y - 32); c.fill(); },
    Venom: (c, x, y, t, w) => { if (!w) return; const d = (t / 14 + x * 7) % 50; c.fillStyle = '#8ad04a'; c.beginPath(); c.ellipse(x, y - 64 + d, 1.4, 2.2, 0, 0, 7); c.fill(); c.fillRect(x - 1, y - 70, 2, 6); },
    Void: (c, x, y, t, w) => { if (!w) return; c.fillStyle = `rgba(190,140,255,${0.4 + Math.sin(t / 300 + x) * 0.3})`; c.beginPath(); c.arc(x + Math.sin(t / 900 + x) * 6, y - 40 + Math.cos(t / 700 + x) * 6, 1.6, 0, 7); c.fill(); } },
  pal(el) { const A = REGION_ART[el] || REGION_ART.Stone; return { el, rock: SC.dark(A.far, 0.55), wall: SC.mix(A.mid, '#6b5d52', 0.45), wall2: SC.dark(SC.mix(A.mid, '#6b5d52', 0.45), 0.25), floor: SC.mix(A.ground, '#8a7a66', 0.35), floor2: SC.dark(SC.mix(A.ground, '#8a7a66', 0.35), 0.18), top: A.top }; },
  torch(c, x, y, t) { c.fillStyle = '#5a3a22'; c.fillRect(x - 1.5, y, 3, 10); const f = Math.sin(t / 90 + x) * 1.5;
    const g = c.createRadialGradient(x, y - 4, 1, x, y - 4, 34); g.addColorStop(0, 'rgba(255,200,110,.35)'); g.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = g; c.fillRect(x - 34, y - 38, 68, 68);
    c.fillStyle = '#ff9a3c'; c.beginPath(); c.moveTo(x - 3.5, y); c.quadraticCurveTo(x - 3 + f, y - 9, x + f * 0.5, y - 12); c.quadraticCurveTo(x + 3 + f, y - 7, x + 3.5, y); c.fill();
    c.fillStyle = '#ffe28a'; c.beginPath(); c.moveTo(x - 1.6, y); c.quadraticCurveTo(x, y - 6, x + f * 0.3, y - 7); c.quadraticCurveTo(x + 1.6, y - 3, x + 1.6, y); c.fill(); },
  // a row of stone blocks between y0 and y1, slid along by off
  blocks(c, x0, x1, y0, y1, bw, bh, col, off) { c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.strokeStyle = SC.dark(col, 0.3); c.lineWidth = 1;
    for (let r = 0, y = y0; y < y1; r++, y += bh) { const sh = (r % 2) * bw / 2 - (off % bw); c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
      for (let x = x0 + sh - bw; x < x1; x += bw) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, Math.min(y1, y + bh)); c.stroke(); } } }
};

// the backdrop. Returns true when bg is a deep one
function deepArt(c, s, bg, t, off) {
  if (!bg || !bg.startsWith('deep:')) return false;
  const [, el, kind, design, dark, seed, ways] = bg.split(':'), P = DA.pal(el), G = GROUND, R = SC.rng(+seed || 7);
  c.fillStyle = P.rock; c.fillRect(-60, -60, RW + 120, RH + 120);
  if (kind === 'hall') DA.hall(c, P, el, t, off);
  else if (kind === 'cave') DA.cave(c, P, el, t, R);
  else DA.room(c, P, el, t, R, +ways || 2);
  if (kind !== 'hall') DA.design(c, P, el, design, t, R, kind === 'cave', +ways || 2);
  if (kind !== 'hall') DA.decor(c, P, el, t, R);
  // a dark room shows only a circle round the leader; every place gets a soft vignette
  if (dark === '1') { const g = c.createRadialGradient(s.x || 120, G - 30, 18, s.x || 120, G - 30, 84); g.addColorStop(0, 'rgba(5,4,10,0)'); g.addColorStop(1, 'rgba(5,4,10,.94)'); c.fillStyle = g; c.fillRect(-60, -60, RW + 120, RH + 120); }
  const v = c.createRadialGradient(RW / 2, G - 50, 70, RW / 2, G - 50, 180); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = v; c.fillRect(-60, -60, RW + 120, RH + 120);
  return true;
}
const DA_HZ = GROUND - 34;   // where the back wall meets the floor
Object.assign(DA, {
  // a lit pool of torchlight on the wall and floor
  glow(c, x, y, r, a = 0.32) { const g = c.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, `rgba(255,196,110,${a})`); g.addColorStop(1, 'rgba(255,196,110,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); },
  // the floor: flagstones in perspective from the back wall down to the front
  floor(c, P, x0, x1, vx = RW / 2) { const H = DA_HZ, G2 = RH + 20, g = c.createLinearGradient(0, H, 0, G2); g.addColorStop(0, SC.dark(P.floor, 0.28)); g.addColorStop(1, SC.light(P.floor, 0.06));
    c.fillStyle = g; c.fillRect(x0, H, x1 - x0, G2 - H); c.strokeStyle = SC.dark(P.floor, 0.32); c.lineWidth = 0.8; c.globalAlpha = 0.6;
    for (let k = -8; k <= 8; k++) { const xb = vx + k * 22; c.beginPath(); c.moveTo(vx + (xb - vx) * 0.35, H); c.lineTo(vx + (xb - vx) * 1.9, G2); c.stroke(); }
    for (const f of [0.08, 0.2, 0.36, 0.58, 0.86]) { const y = H + (G2 - H) * f; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
    c.globalAlpha = 1; },
  // a dark doorway with a stone frame, drawn on a side wall in perspective (side -1 left, 1 right) or on the back wall (side 0)
  door(c, P, x, side, w = 22, h = 50) { const H = DA_HZ, top = H - h;
    if (!side) { SC.depth(c, () => { c.beginPath(); c.moveTo(x - w / 2 - 4, H); c.lineTo(x - w / 2 - 4, top + 6); c.arc(x, top + 6, w / 2 + 4, Math.PI, 0); c.lineTo(x + w / 2 + 4, H); c.closePath(); }, SC.light(P.wall, 0.12), 0, 0);
      c.fillStyle = '#0c0910'; c.beginPath(); c.moveTo(x - w / 2, H); c.lineTo(x - w / 2, top + 6); c.arc(x, top + 6, w / 2, Math.PI, 0); c.lineTo(x + w / 2, H); c.fill(); return; }
    const near = side < 0 ? 2 : RW - 2, far = side < 0 ? 22 : RW - 22, yb = (xx) => H + (Math.abs(xx - (side < 0 ? 24 : RW - 24)) / 24) * 34;
    c.fillStyle = '#0c0910'; c.beginPath(); c.moveTo(far, H); c.lineTo(far, H - 42); c.quadraticCurveTo((far + near) / 2, H - 62, near, H - 52); c.lineTo(near, H + 30); c.closePath(); c.fill();
    c.strokeStyle = SC.light(P.wall, 0.15); c.lineWidth = 2.5; c.stroke(); },
  room(c, P, el, t, R, ways) {
    const H = DA_HZ;
    DA.blocks(c, -40, RW + 40, 4, H, 34, 15, P.wall, R() * 30);
    // stains and cracks so no two walls look the same
    c.strokeStyle = SC.dark(P.wall, 0.35); c.lineWidth = 0.9; for (let k = 0; k < 4; k++) { let x = 30 + R() * 180, y = 14 + R() * 40; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (R() - 0.5) * 12; y += 5 + R() * 6; c.lineTo(x, y); } c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(20 + R() * 200, 20 + R() * 60, 10 + R() * 18, 6 + R() * 10, 0, 0, 7); c.fill(); }
    // a ledge along the bottom of the wall, and a dark band of ceiling
    c.fillStyle = SC.dark(P.wall, 0.3); c.fillRect(-40, H - 5, RW + 80, 5); const gc = c.createLinearGradient(0, 0, 0, 30); gc.addColorStop(0, 'rgba(0,0,0,.55)'); gc.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gc; c.fillRect(-40, 0, RW + 80, 30);
    DA.floor(c, P, -40, RW + 40);
    // side walls in perspective
    for (const sd of [-1, 1]) { const xw = sd < 0 ? 24 : RW - 24, xo = sd < 0 ? -40 : RW + 40;
      c.fillStyle = SC.dark(P.wall, 0.32); c.beginPath(); c.moveTo(xw, 0); c.lineTo(xw, H); c.lineTo(xo, RH + 40); c.lineTo(xo, 0); c.closePath(); c.fill();
      c.strokeStyle = SC.dark(P.wall, 0.5); c.lineWidth = 0.8; for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(xw, H * k / 6); c.lineTo(xo, H * k / 6 + (RH + 40 - H) * 0.0); c.stroke(); } }
    // the ways out: one on each side, more on the back wall
    for (const x of ways >= 3 ? [40, 200, 120 + (R() - 0.5) * 40] : [40, 200]) DA.door(c, P, x, 0);   // doorways sit in the back wall, standing on the floor
    for (const x of [64, 176]) { DA.glow(c, x, H - 62, 70); DA.torch(c, x, H - 70, t); DA.glow(c, x, H + 20, 46, 0.18); }
  },
  hall(c, P, el, t, off) {
    const H = DA_HZ + 6, far = off * 0.45, near = off;
    // the far wall slides slowly, the beams and torches at walking pace
    DA.blocks(c, -40, RW + 40, 26, H, 26, 12, SC.dark(P.wall, 0.12), far);
    c.fillStyle = SC.dark(P.rock, 0.35); c.fillRect(-40, -40, RW + 80, 66);
    DA.floor(c, P, -40, RW + 40, RW / 2);
    for (let x = 45 - ((near % 110) + 110) % 110; x < RW + 60; x += 110) {
      DA.glow(c, x + 55, H - 50, 60, 0.28); DA.torch(c, x + 55, H - 58, t);
      // a timber arch holding the roof up
      c.fillStyle = '#5a3d24'; c.fillRect(x - 6, 20, 12, H - 20); c.fillRect(x - 16, 18, 32, 9); c.fillStyle = '#7a5434'; c.fillRect(x - 6, 20, 4, H - 20);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + 6, 24, 4, H - 24); if (DA.touch[el]) DA.touch[el](c, x + 30, GROUND, t, true); }
    if (DA.touch[el]) for (let x = 20 - ((near % 90) + 90) % 90; x < RW + 40; x += 90) DA.touch[el](c, x, GROUND, t, false);
    // the tunnel goes dark at both ends
    for (const [x0, x1] of [[-40, 40], [RW + 40, RW - 40]]) { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(6,4,10,.85)'); g.addColorStop(1, 'rgba(6,4,10,0)'); c.fillStyle = g; c.fillRect(Math.min(x0, x1), -40, 80, RH + 80); }
  },
  cave(c, P, el, t, R) {
    const H = DA_HZ, G = GROUND;
    for (const [col, base, amp, ph] of [[SC.dark(P.wall, 0.3), 14, 16, 0], [P.wall2, 34, 18, 2], [P.wall, 56, 14, 4]]) {
      c.fillStyle = col; c.beginPath(); c.moveTo(-40, H + 10); for (let x = -40; x <= RW + 40; x += 8) c.lineTo(x, base + Math.sin(x / 27 + ph) * amp + Math.sin(x / 9 + ph * 2) * 4); c.lineTo(RW + 40, H + 10); c.closePath(); c.fill(); }
    DA.floor(c, P, -40, RW + 40);
    c.fillStyle = P.rock; for (let x = -10; x < RW + 20; x += 18 + R() * 10) { const h = 12 + R() * 26, y0 = -2; c.beginPath(); c.moveTo(x - 5 - R() * 3, y0); c.lineTo(x + 5 + R() * 3, y0); c.lineTo(x, y0 + h); c.fill(); }
    for (let k = 0; k < 4; k++) { const x = 10 + R() * 220, h = 10 + R() * 16; SC.depth(c, () => { c.beginPath(); c.moveTo(x - 7, H + 4); c.lineTo(x, H + 4 - h); c.lineTo(x + 7, H + 4); c.closePath(); }, P.wall2, 2, 0.3); }
    DA.glow(c, 60, H - 40, 70, 0.2); DA.glow(c, 190, H - 30, 60, 0.18);
  },
  // the room's design, in the middle of the room behind the team
  design(c, P, el, design, t, R, cave, ways = 2) {
    const H = DA_HZ, G = GROUND, stone = SC.light(P.wall, 0.12);
    if (design === 'pillars') for (const [x, w] of [[44, 18], [196, 18], [92, 10], [148, 10]]) { const y0 = w > 12 ? 8 : 20, y1 = w > 12 ? G - 6 : H, g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      g.addColorStop(0, SC.dark(stone, 0.25)); g.addColorStop(0.35, SC.light(stone, 0.15)); g.addColorStop(1, SC.dark(stone, 0.4)); c.fillStyle = g; c.fillRect(x - w / 2, y0, w, y1 - y0);
      c.fillStyle = SC.dark(stone, 0.2); c.fillRect(x - w / 2 - 4, y0, w + 8, 6); c.fillRect(x - w / 2 - 4, y1 - 6, w + 8, 6); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x + 4, y1, w * 0.9, 3, 0, 0, 7); c.fill(); }
    if (design === 'pool') { const px = 176, py = G - 14, rx = cave ? 62 : 48, ry = cave ? 10 : 8;
      SC.depth(c, () => { c.beginPath(); c.ellipse(px, py, rx + 6, ry + 4, 0, 0, 7); }, stone, 2, 0.3);
      const g = c.createLinearGradient(0, py - ry, 0, py + ry); g.addColorStop(0, '#2f6f9a'); g.addColorStop(1, '#6fb8dc'); c.fillStyle = g; c.beginPath(); c.ellipse(px, py, rx, ry, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 0.9; for (let k = 0; k < 3; k++) { const r = (t / 40 + k * 14) % 42; c.globalAlpha = 1 - r / 42; c.beginPath(); c.ellipse(px - 10, py, r, r * 0.16, 0, 0, 7); c.stroke(); } c.globalAlpha = 1;
      if (el === 'Wild' || el === 'Charm' || el === 'Venom') { c.fillStyle = '#5fa24a'; for (const [dx, dy] of [[-26, 2], [18, -3]]) { c.beginPath(); c.ellipse(px + dx, py + dy, 6, 2, 0, 0.3, 6.1); c.fill(); } }
      if (el === 'Tide' || el === 'Frost') { c.fillStyle = '#ff9a5a'; const fx = px - 20 + Math.sin(t / 700) * 20; c.beginPath(); c.ellipse(fx, py + 2, 3.5, 1.4, 0, 0, 7); c.fill(); } }
    if (design === 'rubble') { const col = SC.mix(P.wall, '#9b927f', 0.45);
      c.save(); c.translate(198, G - 10); c.rotate(-0.12); SC.depth(c, () => { c.beginPath(); c.roundRect(-30, -9, 60, 16, 4); }, SC.light(P.wall, 0.1), 2, 0.3); c.strokeStyle = SC.dark(P.wall, 0.3); c.beginPath(); c.moveTo(-8, -9); c.lineTo(-4, 7); c.stroke(); c.restore();
      for (const [x, y, r] of [[20, G - 6, 11], [36, G - 3, 7], [148, G - 18, 5], [226, G - 2, 6], [96, G - 20, 4]]) SC.depth(c, () => { c.beginPath(); c.ellipse(x, y - r * 0.4, r, r * 0.75, 0, 0, 7); }, col, 2, 0.3);
      c.fillStyle = 'rgba(200,190,170,.25)'; c.beginPath(); c.ellipse(120, G - 4, 90, 6, 0, 0, 7); c.fill(); }
    if (design === 'garden') { const g = c.createLinearGradient(110, 0, 150, G); g.addColorStop(0, 'rgba(255,250,210,.4)'); g.addColorStop(1, 'rgba(255,250,210,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(104, -10); c.lineTo(132, -10); c.lineTo(176, G); c.lineTo(96, G); c.fill();
      c.fillStyle = 'rgba(120,180,90,.35)'; c.beginPath(); c.ellipse(130, G - 6, 110, 10, 0, 0, 7); c.fill();
      for (let x = 4; x < RW; x += 13) SC.tuft(c, x, G - 3 - (x % 3), 6 + (x % 5), x % 2 ? '#5fa24a' : '#4f8a3a');
      for (const [x, y] of [[30, G - 14], [210, G - 10]]) { SC.depth(c, () => SC.blob(c, x, y, [[0, 0, 12], [-9, 4, 9], [9, 4, 9]]), '#4f8a3a', 2, 0.3); for (let k = 0; k < 4; k++) SC.flower(c, x - 8 + k * 5, y - 4 + (k % 2) * 6, 2.4, ['#f2a6cf', '#ffe28a', '#a6c8ff', '#ffffff'][k]); }
      for (let k = 0; k < 2; k++) { const bx = 100 + Math.sin(t / 900 + k * 3) * 50, by = 60 + Math.cos(t / 700 + k) * 20; c.fillStyle = ['#ffe28a', '#f2a6cf'][k]; c.beginPath(); c.ellipse(bx - 2, by, 2.4, 1.6 + Math.sin(t / 60) * 1.2, -0.5, 0, 7); c.ellipse(bx + 2, by, 2.4, 1.6 + Math.sin(t / 60) * 1.2, 0.5, 0, 7); c.fill(); } }
    if (design === 'plain' && !cave && ways < 3) { const x = 120; c.fillStyle = '#7a3a2e'; c.fillRect(x - 13, 16, 26, 40); c.fillStyle = '#e0b64a'; c.beginPath(); c.moveTo(x - 13, 56); c.lineTo(x, 64); c.lineTo(x + 13, 56); c.fill();   // a League banner
      c.strokeStyle = '#e0b64a'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, 32, 7, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x, 25); c.lineTo(x, 39); c.moveTo(x - 7, 32); c.lineTo(x + 7, 32); c.stroke(); c.fillStyle = '#5a3d24'; c.fillRect(x - 16, 14, 32, 3); }
  },
  // a few things lying about, in the region's own kind: two or three per room, never the same set twice
  decor(c, P, el, t, R) {
    const G = GROUND, H = DA_HZ, n = 2 + Math.floor(R() * 2), spots = [18, 74, 166, 222].sort(() => R() - 0.5).slice(0, n);
    const kinds = DA.decorOf[el] || ['crate', 'pot'];
    for (const x of spots) { const k = kinds[Math.floor(R() * kinds.length)], y = G - 2 - R() * 10; DA.thing[k] && DA.thing[k](c, x, y, t, P, R); }
  },
  decorOf: { Blaze: ['ember', 'pot', 'obsidian'], Tide: ['coral', 'shell', 'pot'], Frost: ['snow', 'icy', 'crate'], Spark: ['coil', 'crate', 'pipe'], Wild: ['shroom', 'roots', 'pot'],
    Stone: ['statue', 'sand', 'pot'], Brawl: ['dummy', 'crate', 'rack'], Steel: ['crate', 'pipe', 'gear'], Light: ['crystal', 'pot', 'statue'], Shade: ['candle', 'web', 'shroom'],
    Charm: ['crystal', 'flowers', 'pot'], Venom: ['shroom', 'slime', 'pot'], Void: ['crystal', 'floater', 'candle'] },
  thing: {
    crate: (c, x, y) => { SC.depth(c, () => { c.beginPath(); c.rect(x - 10, y - 18, 20, 18); }, '#9a6a3a', 2, 0.3); c.strokeStyle = '#6a4424'; c.lineWidth = 1.4; c.strokeRect(x - 10, y - 18, 20, 18); c.beginPath(); c.moveTo(x - 10, y - 18); c.lineTo(x + 10, y); c.stroke(); },
    pot: (c, x, y, t, P) => { SC.depth(c, () => { c.beginPath(); c.ellipse(x, y - 8, 8, 9, 0, 0, 7); }, SC.mix(P.floor, '#b0644a', 0.6), 2, 0.3); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, y - 16, 4, 1.5, 0, 0, 7); c.fill(); },
    ember: (c, x, y, t) => { c.fillStyle = '#2a1410'; c.beginPath(); c.ellipse(x, y, 12, 3, 0, 0, 7); c.fill(); for (let k = 0; k < 3; k++) { const a = ((t / 15 + k * 20 + x) % 40); c.fillStyle = `rgba(255,${140 + k * 30},60,${1 - a / 40})`; c.beginPath(); c.arc(x - 4 + k * 4, y - a, 1.3, 0, 7); c.fill(); } },
    obsidian: (c, x, y) => { c.fillStyle = '#231a26'; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x - 2, y - 16); c.lineTo(x + 3, y - 6); c.lineTo(x + 7, y); c.fill(); c.fillStyle = 'rgba(180,120,255,.4)'; c.fillRect(x - 2, y - 12, 1.2, 8); },
    coral: (c, x, y) => { c.strokeStyle = '#ff8a7a'; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 14); c.moveTo(x, y - 8); c.lineTo(x - 6, y - 14); c.moveTo(x, y - 10); c.lineTo(x + 6, y - 18); c.stroke(); },
    shell: (c, x, y) => { c.fillStyle = '#f6dcc8'; c.beginPath(); c.arc(x, y - 3, 5, Math.PI, 0); c.fill(); c.fillStyle = '#ff9a5a'; c.beginPath(); for (let k = 0; k < 5; k++) { const a = k * 1.2566 - 1.57; c.lineTo(x + 14 + Math.cos(a) * 5, y - 4 + Math.sin(a) * 5); c.lineTo(x + 14 + Math.cos(a + 0.63) * 2, y - 4 + Math.sin(a + 0.63) * 2); } c.fill(); },
    snow: (c, x, y) => SC.depth(c, () => SC.blob(c, x, y - 4, [[0, 0, 9], [-8, 2, 6], [8, 2, 6]]), '#eef6fb', 2, 0.15),
    icy: (c, x, y) => { c.fillStyle = 'rgba(200,235,255,.8)'; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x - 2, y - 20); c.lineTo(x + 2, y - 8); c.lineTo(x + 6, y - 16); c.lineTo(x + 8, y); c.fill(); },
    coil: (c, x, y, t) => { c.fillStyle = '#6d747c'; c.fillRect(x - 3, y - 26, 6, 26); c.strokeStyle = '#c08a4a'; c.lineWidth = 1.4; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x, y - 6 - k * 4, 6, 1.6, 0, 0, 7); c.stroke(); } if ((t / 120 + x) % 9 < 1) { c.strokeStyle = '#fff36a'; c.beginPath(); c.moveTo(x, y - 28); c.lineTo(x + 6, y - 34); c.lineTo(x + 2, y - 38); c.stroke(); } },
    pipe: (c, x, y) => { c.fillStyle = '#7a8088'; c.fillRect(x - 3, DA_HZ - 70, 6, 70 - 4); c.fillStyle = '#5b6168'; c.fillRect(x - 5, DA_HZ - 40, 10, 5); },
    gear: (c, x, y) => { c.fillStyle = '#7a7f85'; c.save(); c.translate(x, DA_HZ - 44); for (let k = 0; k < 8; k++) { c.rotate(0.785); c.fillRect(-2, -11, 4, 4); } c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.fillStyle = SC.dark('#7a7f85', 0.4); c.beginPath(); c.arc(0, 0, 3, 0, 7); c.fill(); c.restore(); },
    shroom: (c, x, y, t, P, R) => { for (const [dx, h, col] of [[0, 9, '#c8553d'], [7, 6, '#e0b64a'], [-6, 5, '#9a6ad8']]) { c.fillStyle = '#efe6d2'; c.fillRect(x + dx - 1, y - h, 2, h); c.fillStyle = col; c.beginPath(); c.arc(x + dx, y - h, 4, Math.PI, 0); c.fill(); } },
    roots: (c, x, y) => { c.strokeStyle = '#6a4a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 12, DA_HZ - 60); c.quadraticCurveTo(x, DA_HZ - 30, x - 4, DA_HZ); c.moveTo(x + 4, DA_HZ - 70); c.quadraticCurveTo(x + 14, DA_HZ - 40, x + 8, DA_HZ); c.stroke(); },
    statue: (c, x, y, t, P) => { const col = SC.light(P.wall, 0.2); SC.depth(c, () => { c.beginPath(); c.rect(x - 9, y - 10, 18, 10); }, col, 2, 0.3); SC.depth(c, () => { c.beginPath(); c.ellipse(x, y - 20, 9, 10, 0, 0, 7); }, col, 2, 0.3);
      c.fillStyle = SC.dark(col, 0.4); c.beginPath(); c.arc(x - 3, y - 22, 1.4, 0, 7); c.arc(x + 3, y - 22, 1.4, 0, 7); c.fill(); c.strokeStyle = SC.dark(col, 0.4); c.beginPath(); c.moveTo(x + 4, y - 30); c.lineTo(x + 7, y - 24); c.stroke(); },
    sand: (c, x, y) => { c.fillStyle = 'rgba(214,190,140,.8)'; c.beginPath(); c.ellipse(x, y, 16, 5, 0, Math.PI, 0); c.fill(); },
    dummy: (c, x, y) => { c.fillStyle = '#7a5434'; c.fillRect(x - 2, y - 30, 4, 30); c.fillRect(x - 10, y - 24, 20, 3); SC.depth(c, () => { c.beginPath(); c.ellipse(x, y - 30, 7, 8, 0, 0, 7); }, '#d8b47a', 2, 0.3); },
    rack: (c, x, y) => { c.fillStyle = '#6a4424'; c.fillRect(x - 12, y - 26, 3, 26); c.fillRect(x + 9, y - 26, 3, 26); c.fillRect(x - 12, y - 26, 24, 3); c.strokeStyle = '#a07a4a'; c.lineWidth = 2; for (let k = -6; k <= 6; k += 6) { c.beginPath(); c.moveTo(x + k, y - 24); c.lineTo(x + k + 3, y - 2); c.stroke(); } },
    crystal: (c, x, y, t, P) => { const col = { Light: '#ffe8a0', Charm: '#f4a6d2', Void: '#b78aff' }[P.el] || '#a6d8ff'; for (const [dx, h, a] of [[0, 18, 0], [-6, 11, -0.3], [6, 12, 0.35]]) { c.save(); c.translate(x + dx, y); c.rotate(a); c.fillStyle = col; c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -h); c.lineTo(3, 0); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-1, -h + 4, 1, h - 6); c.restore(); }
      DA.glow(c, x, y - 8, 22, 0.18); },
    candle: (c, x, y, t) => { c.fillStyle = '#efe6d2'; c.fillRect(x - 2, y - 10, 4, 10); c.fillStyle = '#ffb040'; c.beginPath(); c.ellipse(x, y - 13 + Math.sin(t / 90) * 0.6, 1.6, 3, 0, 0, 7); c.fill(); DA.glow(c, x, y - 12, 18, 0.25); },
    web: (c, x) => { const cx = x < 120 ? 26 : RW - 26, sx = x < 120 ? 1 : -1; c.strokeStyle = 'rgba(230,230,240,.45)'; c.lineWidth = 0.7; for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(cx, 4, k * 8, sx > 0 ? 0 : Math.PI / 2, sx > 0 ? Math.PI / 2 : Math.PI); c.stroke(); } for (let a = 0; a <= 4; a++) { const r = a * 0.39 + (sx > 0 ? 0 : 1.57); c.beginPath(); c.moveTo(cx, 4); c.lineTo(cx + Math.cos(r) * 26, 4 + Math.sin(r) * 26); c.stroke(); } },
    flowers: (c, x, y) => { for (let k = 0; k < 4; k++) { SC.tuft(c, x - 6 + k * 4, y, 5, '#5fa24a'); SC.flower(c, x - 6 + k * 4, y - 6 - (k % 2) * 3, 2.2, ['#f2a6cf', '#ffffff', '#ffe28a', '#f2a6cf'][k]); } },
    slime: (c, x, y, t) => { c.fillStyle = '#7ec84a'; c.beginPath(); c.ellipse(x, y, 13, 3.5, 0, 0, 7); c.fill(); const b = (t / 400 + x) % 1; c.strokeStyle = `rgba(200,255,150,${1 - b})`; c.beginPath(); c.arc(x + 4, y - 2 - b * 6, 2 + b * 2, 0, 7); c.stroke(); },
    floater: (c, x, y, t) => { const yy = y - 40 + Math.sin(t / 800 + x) * 5; SC.depth(c, () => { c.beginPath(); c.moveTo(x - 9, yy); c.lineTo(x + 9, yy); c.lineTo(x + 3, yy + 10); c.lineTo(x - 4, yy + 8); c.closePath(); }, '#3d2066', 2, 0.3); c.fillStyle = 'rgba(190,140,255,.3)'; c.beginPath(); c.ellipse(x, y, 8, 2, 0, 0, 7); c.fill(); } }
});
/* ---------- the props: the things in a room, the room events and the corridor traps ---------- */
function deepProp(c, p, t, front) {
  const x = p.x, y = p.y, G = GROUND;
  switch (p.k) {
    case 'stairsdown': if (front) return true;   // a dark way down with steps
      c.fillStyle = '#17121c'; c.beginPath(); c.moveTo(x - 18, y); c.lineTo(x - 18, y - 40); c.arc(x, y - 40, 18, Math.PI, 0); c.lineTo(x + 18, y); c.fill();
      for (let k = 0; k < 4; k++) { c.fillStyle = SC.mix('#6b5d52', '#17121c', k * 0.25); c.fillRect(x - 15 + k * 2, y - 8 - k * 6, 30 - k * 4, 4); }
      if (p.locked) { c.strokeStyle = '#4a4f57'; c.lineWidth = 2.4; for (let b = -14; b <= 14; b += 7) { c.beginPath(); c.moveTo(x + b, y); c.lineTo(x + b, y - 52); c.stroke(); } c.fillStyle = '#4a4f57'; c.fillRect(x - 18, y - 32, 36, 3); }
      return true;
    case 'stairsup': if (front) return true;
      for (let k = 0; k < 5; k++) SC.depth(c, () => { c.beginPath(); c.rect(x - 16 + k * 3, y - 6 - k * 7, 32 - k * 3, 7); }, SC.mix('#9a8a76', '#d8ccb4', k * 0.15), 1, 0.3);
      return true;
    case 'lever': if (front) return true;
      SC.depth(c, () => { c.beginPath(); c.roundRect(x - 8, y - 46, 16, 22, 3); }, '#6b6f76', 1.5, 0.3);
      c.strokeStyle = '#a7acb3'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y - 35); c.lineTo(x + (p.on ? -9 : 9), y - 52); c.stroke(); c.fillStyle = '#c8553d'; c.beginPath(); c.arc(x + (p.on ? -9 : 9), y - 52, 3.4, 0, 7); c.fill(); return true;
    case 'relic': if (front) return true;
      SC.depth(c, () => { c.beginPath(); c.roundRect(x - 9, y - 12, 18, 12, 2); }, '#8a7a66', 2, 0.3);
      c.fillStyle = '#7fd6e0'; c.beginPath(); c.moveTo(x, y - 26 + Math.sin(t / 400) * 1.5); c.lineTo(x + 6, y - 19); c.lineTo(x, y - 12); c.lineTo(x - 6, y - 19); c.fill();
      c.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(t / 200) * 0.4})`; c.beginPath(); c.arc(x - 2, y - 21, 1.4, 0, 7); c.fill(); return true;
    case 'lairdoor': if (front) return true;
      c.fillStyle = '#2a1e3a'; c.beginPath(); c.moveTo(x - 20, y); c.lineTo(x - 20, y - 50); c.arc(x, y - 50, 20, Math.PI, 0); c.lineTo(x + 20, y); c.fill();
      c.strokeStyle = '#a77ef0'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y - 44, 7, 0, 7); c.moveTo(x, y - 51); c.lineTo(x, y - 37); c.stroke(); return true;
    case 'plates': if (front) return true;   // stone plates in the floor, some pressed down
      for (let k = 0; k < p.n; k++) { const px = x + (k - (p.n - 1) / 2) * 34, on = k < (p.on || 0);
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(px, y + 1, 13, 3.6, 0, 0, 7); c.fill();
        SC.depth(c, () => { c.beginPath(); c.ellipse(px, y - (on ? 0 : 2), 12, 3.2, 0, 0, 7); }, on ? '#c9b26a' : '#a89a84', on ? 0.5 : 2, 0.3);
        c.strokeStyle = on ? '#ffe28a' : '#6b5d52'; c.lineWidth = 1; c.beginPath(); c.ellipse(px, y - (on ? 0 : 2), 6, 1.6, 0, 0, 7); c.stroke(); }
      return true;
    case 'lid': if (front) return true;   // a big stone chest with a heavy lid
      SC.depth(c, () => { c.beginPath(); c.roundRect(x - 22, y - 22, 44, 22, 3); }, '#8f8574', 2, 0.3);
      c.save(); c.translate(x - 22, y - 22); c.rotate(p.open ? -0.5 : 0); SC.depth(c, () => { c.beginPath(); c.roundRect(-2, -9, 48, 10, 3); }, '#a49a88', 2, 0.3); c.restore();
      c.strokeStyle = '#6b5d52'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 12, y - 14); c.lineTo(x + 12, y - 14); c.stroke(); return true;
    case 'stuck': if (front) return true;   // a little wild Snabit stuck under fallen rocks
      if (!p.free) { c.fillStyle = '#ffcf6a'; c.beginPath(); c.arc(x + 4, y - 9, 9, 0, 7); c.fill(); c.fillStyle = '#2a1e2e'; for (const d of [-3, 3]) { c.beginPath(); c.arc(x + 4 + d, y - 11, 1.3, 0, 7); c.fill(); } }
      for (const [dx, dy, r] of (p.free ? [[-26, -4, 8], [26, -3, 7], [-18, -2, 6]] : [[-8, -16, 10], [10, -20, 9], [-14, -6, 8], [16, -6, 8], [2, -26, 7]])) SC.depth(c, () => { c.beginPath(); c.ellipse(x + dx, y + dy, r, r * 0.78, 0, 0, 7); }, '#9b927f', 2, 0.3);
      return true;
    case 'mural': if (front) return true;   // an old carving on the wall: three Snabits round a circle
      SC.depth(c, () => { c.beginPath(); c.roundRect(x - 30, y - 92, 60, 44, 3); }, '#b8ab97', 2, 0.25);
      c.strokeStyle = p.read ? '#ffe28a' : '#6b5d52'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y - 70, 9, 0, 7); for (const a of [0, 2.1, 4.2]) { c.moveTo(x + Math.cos(a) * 18 + 4, y - 70 + Math.sin(a) * 14); c.arc(x + Math.cos(a) * 18, y - 70 + Math.sin(a) * 14, 4, 0, 7); } c.stroke(); return true;
    case 'crack': if (front) return true;   // a crack across the floor, with something on the far side
      c.fillStyle = '#120e16'; c.beginPath(); c.moveTo(x - 14, y + 6); c.lineTo(x - 6, y - 4); c.lineTo(x + 4, y - 3); c.lineTo(x + 12, y + 7); c.fill();
      if (!p.got) { c.fillStyle = '#e0b64a'; c.beginPath(); c.arc(x + 40, y - 5, 4, 0, 7); c.fill(); } return true;
    case 'boulder': if (!front) return true;   // a rolling boulder
      c.save(); c.translate(x, y - 22); c.rotate(p.rot || 0); SC.depth(c, () => { c.beginPath(); c.arc(0, 0, 22, 0, 7); }, '#8d8378', 3, 0.3); c.strokeStyle = '#6b6158'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-10, -6); c.lineTo(4, -2); c.lineTo(8, 10); c.stroke(); c.restore(); return true;
    case 'arrow': if (!front) return true;
      c.save(); c.translate(x, y); c.rotate(p.a || 0); c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-14, 0); c.lineTo(8, 0); c.stroke(); c.fillStyle = '#9aa1a8'; c.beginPath(); c.moveTo(12, 0); c.lineTo(6, -3); c.lineTo(6, 3); c.fill();
      c.fillStyle = '#e2483f'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-18, -3); c.lineTo(-12, 0); c.lineTo(-18, 3); c.fill(); c.restore(); return true;
    // a stone vent in the wall; when it fires, the flame comes out of the middle of its hole and spreads as it falls to the floor
    case 'firejet': { const vy = GROUND - 56; if (!front) { SC.depth(c, () => { c.beginPath(); c.roundRect(x - 9, vy - 8, 18, 16, 2); }, '#8a8178', 2, 0.35);
        c.fillStyle = 'rgba(30,20,20,.35)'; c.beginPath(); c.ellipse(x, vy - 14, 7, 6, 0, 0, 7); c.fill();   // soot above it
        c.fillStyle = '#5e5650'; c.beginPath(); c.arc(x, vy, 5.5, 0, 7); c.fill(); c.fillStyle = p.on ? '#ffb040' : '#140e10'; c.beginPath(); c.arc(x, vy, 3.8, 0, 7); c.fill(); return true; }
      if (!p.on) return true; DA.glow(c, x, vy, 34, 0.45);
      // one tapering tongue of flame from the hole to the floor, flickering at the edges, with a smaller hot core inside it
      const tongue = (w0, w1, col, k0) => { const y1 = GROUND - 2, n = 10, L = [], Rr = [];
        for (let k = 0; k <= n; k++) { const f = k / n, yy = vy + f * (y1 - vy), w = (w0 + (w1 - w0) * Math.pow(f, 0.8)) * (1 + Math.sin(t / 45 + k * 1.9 + k0) * 0.12 * f), sw = Math.sin(t / 90 + k0) * 2 * f;
          L.push([x + sw - w, yy]); Rr.push([x + sw + w, yy]); }
        c.fillStyle = col; c.beginPath(); c.moveTo(x, vy - 1); for (const [a, b] of L) c.lineTo(a, b); c.quadraticCurveTo(x, y1 + w1 * 0.7, Rr[n][0], Rr[n][1]); for (let k = n - 1; k >= 0; k--) c.lineTo(Rr[k][0], Rr[k][1]); c.closePath(); c.fill(); };
      const g = c.createLinearGradient(0, vy, 0, GROUND); g.addColorStop(0, '#ffd27a'); g.addColorStop(0.5, '#ff8a30'); g.addColorStop(1, 'rgba(220,60,30,.85)');
      tongue(3.5, 12, g, 0); const g2 = c.createLinearGradient(0, vy, 0, GROUND); g2.addColorStop(0, '#fffbe6'); g2.addColorStop(1, 'rgba(255,200,80,.6)'); tongue(1.8, 5.5, g2, 2);
      c.fillStyle = 'rgba(255,140,50,.5)'; c.beginPath(); c.ellipse(x, GROUND - 1, 16, 3.5, 0, 0, 7); c.fill();   // where it hits the floor
      return true; }
      c.fillStyle = '#2a2026'; c.beginPath(); c.ellipse(x, y - 70, 7, 4, 0, 0, 7); c.fill(); return true;
    case 'gas': if (!front) return true; c.save(); c.globalAlpha = p.a == null ? 0.6 : p.a;
      for (let k = 0; k < 9; k++) { const a = k * 0.7 + t / 900, r = (p.r || 30) * (0.5 + (k % 3) * 0.25); c.fillStyle = k % 2 ? '#9ad05a' : '#b78ad8'; c.beginPath(); c.arc(x + Math.cos(a) * (p.r || 30) * 0.8, y - 26 + Math.sin(a * 1.3) * 12, r * 0.45, 0, 7); c.fill(); }
      c.restore(); return true;
    // a hole in the floor opening to p.w; its near lip is drawn in front, and a rope hangs into it from p.rope when it's there
    case 'pit': { const w = p.w || 0; if (w < 0.5) return true;
      if (!front) { c.fillStyle = 'rgba(200,190,170,.5)'; c.beginPath(); c.ellipse(x, y + 2, w + 3.5, 6.5, 0, 0, 7); c.fill();
        const g = c.createRadialGradient(x, y + 1, 1, x, y + 2, w); g.addColorStop(0, '#000'); g.addColorStop(1, '#2a2026'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y + 2, w, 5, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(90,80,70,.8)'; for (const d of [-0.8, -0.3, 0.4, 0.9]) { c.beginPath(); c.arc(x + d * w, y - 1 + Math.abs(d) * 2, 1.6, 0, 7); c.fill(); }
        return true; }
      c.strokeStyle = 'rgba(120,110,95,.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y + 2, w + 1, 5.5, 0, 0.15, Math.PI - 0.15); c.stroke();
      if (p.rope != null) { c.strokeStyle = '#b08a52'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(p.rope + 8, y - 16); c.quadraticCurveTo((p.rope + x) / 2, y - 4, x - 2, y + 6); c.stroke(); }
      return true; }
  }
  return false;
}

/* the stage for a fight on a deep expedition: the region's own dungeon wall and flagstones, lit by torches, in place of the
   meadow or the cup arena. Called by atStage (arena-ui.js) with the arena's big world size; the fighters stand at FY */
function atStageDeep(c, W, H, FY, el) {
  const P = DA.pal(el), top = FY - 150, R = SC.rng(el.length * 97 + 3);
  c.fillStyle = SC.dark(P.rock, 0.2); c.fillRect(0, 0, W, H);
  DA.blocks(c, 0, W, 0, top, 96, 44, P.wall, 0);
  c.strokeStyle = SC.dark(P.wall, 0.35); c.lineWidth = 2.5; for (let k = 0; k < 10; k++) { let x = R() * W, y = top - 300 + R() * 200; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (R() - 0.5) * 30; y += 16 + R() * 16; c.lineTo(x, y); } c.stroke(); }
  c.fillStyle = SC.dark(P.wall, 0.3); c.fillRect(0, top - 14, W, 14);
  // the floor in perspective, darker at the back
  const g = c.createLinearGradient(0, top, 0, H); g.addColorStop(0, SC.dark(P.floor, 0.3)); g.addColorStop(1, SC.light(P.floor, 0.05)); c.fillStyle = g; c.fillRect(0, top, W, H - top);
  c.strokeStyle = SC.dark(P.floor, 0.3); c.lineWidth = 2; c.globalAlpha = 0.5;
  for (let k = -16; k <= 16; k++) { const xb = W / 2 + k * 80; c.beginPath(); c.moveTo(W / 2 + (xb - W / 2) * 0.5, top); c.lineTo(W / 2 + (xb - W / 2) * 2.2, H); c.stroke(); }
  for (const f of [0.1, 0.24, 0.42, 0.66, 0.95]) { const y = top + (H - top) * f; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.globalAlpha = 1;
  // pillars and torches along the wall, with the region's own touch on the floor
  for (let x = 140; x < W; x += 420) { const gr = c.createLinearGradient(x - 26, 0, x + 26, 0), st = SC.light(P.wall, 0.12); gr.addColorStop(0, SC.dark(st, 0.3)); gr.addColorStop(0.35, SC.light(st, 0.15)); gr.addColorStop(1, SC.dark(st, 0.45));
    c.fillStyle = gr; c.fillRect(x - 26, 0, 52, top + 8); c.fillStyle = SC.dark(st, 0.25); c.fillRect(x - 34, top - 4, 68, 16);
    for (const tx of [x + 210]) { DA.glow(c, tx, top - 170, 220, 0.3); c.save(); c.translate(tx, top - 190); c.scale(3, 3); DA.torch(c, 0, 0, 0); c.restore(); } }
  if (DA.touch[el]) { c.save(); c.scale(3, 3); for (let x = 20; x < W / 3; x += 70) DA.touch[el](c, x, (FY + 70) / 3, 0, false); c.restore(); }
  const v = c.createRadialGradient(W / 2, FY - 100, W * 0.2, W / 2, FY - 100, W * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}
