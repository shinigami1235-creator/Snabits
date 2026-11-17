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
  pal(el) { const A = REGION_ART[el] || REGION_ART.Stone; return { rock: SC.dark(A.far, 0.55), wall: SC.mix(A.mid, '#6b5d52', 0.45), wall2: SC.dark(SC.mix(A.mid, '#6b5d52', 0.45), 0.25), floor: SC.mix(A.ground, '#8a7a66', 0.35), floor2: SC.dark(SC.mix(A.ground, '#8a7a66', 0.35), 0.18), top: A.top }; },
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
  const [, el, kind, design, dark] = bg.split(':'), P = DA.pal(el), G = GROUND, touch = DA.touch[el];
  c.fillStyle = P.rock; c.fillRect(-60, -60, RW + 120, RH + 120);
  if (kind === 'hall') {
    // a corridor: a low ceiling, a block wall with torches that slide by as the team walks, and flagstones
    c.fillStyle = SC.dark(P.rock, 0.3); c.fillRect(-60, -60, RW + 120, 92);
    DA.blocks(c, -40, RW + 40, 32, G - 6, 30, 14, P.wall, off * 0.8);
    const g = c.createLinearGradient(0, 32, 0, 60); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-40, 32, RW + 80, 28);
    for (let x = 60 - (off * 0.8) % 120; x < RW + 60; x += 120) { DA.torch(c, x, G - 74, t); if (touch) touch(c, x + 60, G, t, true); }
    c.fillStyle = P.floor; c.fillRect(-40, G - 6, RW + 80, RH - G + 60); c.strokeStyle = SC.dark(P.floor, 0.25); c.lineWidth = 1;
    for (let x = -40 - (off % 28); x < RW + 40; x += 28) { c.beginPath(); c.moveTo(x, G - 6); c.lineTo(x - 12, RH + 20); c.stroke(); }
    if (touch) for (let x = 30 - (off % 90); x < RW + 40; x += 90) touch(c, x, G, t, false);
  } else if (kind === 'cave') {
    // a cavern: rough rock with hanging points, an uneven floor
    c.fillStyle = P.wall2; c.beginPath(); c.moveTo(-40, G); for (let x = -40; x <= RW + 40; x += 12) c.lineTo(x, 26 + Math.sin(x / 23) * 12 + Math.sin(x / 7) * 4); c.lineTo(RW + 40, G); c.closePath(); c.fill();
    c.fillStyle = P.wall; c.beginPath(); c.moveTo(-40, G); for (let x = -40; x <= RW + 40; x += 10) c.lineTo(x, 60 + Math.sin(x / 31 + 1) * 16 + Math.sin(x / 9) * 5); c.lineTo(RW + 40, G); c.closePath(); c.fill();
    c.fillStyle = P.rock; for (let x = -10; x < RW + 20; x += 26) { const h = 10 + (x * 13 % 17); c.beginPath(); c.moveTo(x - 6, 20 + Math.sin(x / 23) * 8); c.lineTo(x + 6, 20 + Math.sin(x / 23) * 8); c.lineTo(x, 26 + h); c.fill(); }
    c.fillStyle = P.floor; c.beginPath(); c.moveTo(-40, RH + 40); c.lineTo(-40, G - 4); for (let x = -40; x <= RW + 40; x += 16) c.lineTo(x, G - 6 + Math.sin(x / 19) * 2.5); c.lineTo(RW + 40, RH + 40); c.closePath(); c.fill();
    if (touch) for (const x of [40, 130, 205]) { touch(c, x, G, t, true); touch(c, x + 20, G, t, false); }
  } else {
    // a room: a tall block wall with a dark way out on each side, and a wider floor
    DA.blocks(c, -40, RW + 40, 6, G - 6, 38, 18, P.wall, 0);
    for (const x of [-6, RW - 18]) { c.fillStyle = P.rock; c.beginPath(); c.moveTo(x, G - 6); c.lineTo(x, G - 62); c.arc(x + 12, G - 62, 12, Math.PI, 0); c.lineTo(x + 24, G - 6); c.fill(); }
    c.fillStyle = P.top; c.globalAlpha = 0.5; c.fillRect(-40, 6, RW + 80, 4); c.globalAlpha = 1;
    c.fillStyle = P.floor; c.fillRect(-40, G - 6, RW + 80, RH - G + 60); c.strokeStyle = SC.dark(P.floor, 0.18); c.lineWidth = 1;
    for (let x = -40; x < RW + 40; x += 34) { c.beginPath(); c.moveTo(x, G - 6); c.lineTo(x - 16, RH + 20); c.stroke(); } c.beginPath(); c.moveTo(-40, G + 8); c.lineTo(RW + 40, G + 8); c.stroke();
    DA.torch(c, 60, G - 92, t); DA.torch(c, 180, G - 92, t);
    if (touch) for (const x of [36, 120, 204]) { touch(c, x, G, t, true); touch(c, x + 30, G, t, false); }
  }
  // the room's design, behind the team
  if (kind !== 'hall') {
    if (design === 'pillars') for (const x of [44, 120, 196]) { SC.depth(c, () => { c.beginPath(); c.roundRect(x - 9, 14, 18, G - 18, 3); }, SC.light(P.wall, 0.15), 3, 0.3);
      c.fillStyle = SC.dark(P.wall, 0.2); c.fillRect(x - 12, 10, 24, 7); c.fillRect(x - 12, G - 10, 24, 6); }
    if (design === 'pool') { c.fillStyle = SC.dark(P.floor, 0.3); c.beginPath(); c.ellipse(170, G - 2, 54, 9, 0, 0, 7); c.fill(); c.fillStyle = '#5aa6cc'; c.beginPath(); c.ellipse(170, G - 2, 50, 7.5, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { const r = ((t / 30 + k * 16) % 48); c.globalAlpha = 1 - r / 48; c.beginPath(); c.ellipse(170, G - 2, r, r * 0.15, 0, 0, 7); c.stroke(); } c.globalAlpha = 1; }
    if (design === 'rubble') for (const [x, y, r] of [[22, G - 4, 10], [36, G - 2, 7], [212, G - 5, 12], [196, G - 1, 6], [226, G - 1, 7]]) { SC.depth(c, () => { c.beginPath(); c.ellipse(x, y - r * 0.4, r, r * 0.75, 0, 0, 7); }, SC.mix(P.wall, '#9b927f', 0.5), 2, 0.3); }
    if (design === 'garden') { for (let x = 6; x < RW; x += 17) SC.tuft(c, x, G - 3, 6 + (x % 4), '#5fa24a'); for (const x of [30, 92, 160, 214]) SC.flower(c, x, G - 9, 3, ['#f2a6cf', '#ffe28a', '#a6c8ff'][x % 3]);
      const g = c.createLinearGradient(110, 0, 140, G); g.addColorStop(0, 'rgba(255,250,210,.35)'); g.addColorStop(1, 'rgba(255,250,210,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(100, 0); c.lineTo(140, 0); c.lineTo(170, G); c.lineTo(90, G); c.fill(); }
  }
  // a dark room shows only a small circle round the leader; every place gets a soft vignette
  if (dark === '1') { c.save(); const g = c.createRadialGradient(s.x || 120, G - 30, 20, s.x || 120, G - 30, 90); g.addColorStop(0, 'rgba(5,4,10,0)'); g.addColorStop(1, 'rgba(5,4,10,.92)'); c.fillStyle = g; c.fillRect(-60, -60, RW + 120, RH + 120); c.restore(); }
  const v = c.createRadialGradient(RW / 2, G - 40, 60, RW / 2, G - 40, 170); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)'); c.fillStyle = v; c.fillRect(-60, -60, RW + 120, RH + 120);
  return true;
}

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
    case 'firejet': if (front) { if (!p.on) return true; for (let k = 0; k < 7; k++) { const r = 5 + k * 2.4, yy = y - 64 + k * 9 + Math.sin(t / 60 + k) * 2; c.fillStyle = k < 2 ? '#fff0a0' : k < 4 ? '#ffb040' : 'rgba(230,80,40,.8)'; c.beginPath(); c.arc(x + Math.sin(t / 80 + k) * 3, yy, r, 0, 7); c.fill(); } return true; }
      c.fillStyle = '#2a2026'; c.beginPath(); c.ellipse(x, y - 70, 7, 4, 0, 0, 7); c.fill(); return true;
    case 'gas': if (!front) return true; c.save(); c.globalAlpha = p.a == null ? 0.6 : p.a;
      for (let k = 0; k < 9; k++) { const a = k * 0.7 + t / 900, r = (p.r || 30) * (0.5 + (k % 3) * 0.25); c.fillStyle = k % 2 ? '#9ad05a' : '#b78ad8'; c.beginPath(); c.arc(x + Math.cos(a) * (p.r || 30) * 0.8, y - 26 + Math.sin(a * 1.3) * 12, r * 0.45, 0, 7); c.fill(); }
      c.restore(); return true;
    case 'pit': if (front) return true; c.fillStyle = '#0d0a10'; c.beginPath(); c.ellipse(x, y + 2, p.w || 24, 5, 0, 0, 7); c.fill(); c.fillStyle = SC.dark('#8a7a66', 0.4); c.fillRect(x - (p.w || 24), y - 1, (p.w || 24) * 2, 2); return true;
  }
  return false;
}
