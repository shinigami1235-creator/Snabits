/* More to the expeditions (Gid, 17 Nov 2026). A region keeps its layout, journal page and stone, while its chests, springs,
   wild Snabits, stops and the stat each obstacle wants change every season. A Snabit close to what an obstacle needs gets a
   try at it, and one that knows a fitting move uses it instead of turning back. Each region has a teacher camped on the map,
   stops along the path ask for a choice, and each visit has its own weather. Needs explore.js and explore-art.js. */

/* ---------- the season's finds on the region's fixed layout ---------- */
function exSeasonal(reg, N, season) {
  const R = rng(hashStr('exfind|' + reg.n + '|' + season)), finds = ['path', 'chest', 'spring', 'wild', 'path', 'chest', 'wild', 'stop', 'spring', 'stop'];
  for (const c of [1, 3, 5]) for (let r = 0; r < 3; r++) { const n = N[c + ':' + r]; if (n.k !== 'page' && n.k !== 'stone') n.k = finds[Math.floor(R() * finds.length)]; }
  for (const c of [2, 4]) { const st = [1, 2, 3, 4, 5].sort(() => R() - 0.5); for (let r = 0; r < 3; r++) { const n = N[c + ':' + r]; n.stat = st[r]; n.mul = c === 2 ? 0.88 + R() * 0.1 : 1 + R() * 0.15; } }
  if (!reg.rift && typeof TEACHER !== 'undefined' && TEACHER[reg.el]) { const n = N['3:' + Math.floor(rng(hashStr('exteach|' + reg.n))() * 3)]; n.k = 'teach'; n.met = !!(PLAYER && PLAYER.explore && PLAYER.explore[reg.n] && PLAYER.explore[reg.n].teachSeen); }
}

/* ---------- weather, one per visit ---------- */
function exWeather(reg) {
  const v = rng(hashStr('exwx|' + reg.n + '|' + PLAYER.week))();
  if (v < 0.4) return null;
  if (reg.rift || v < 0.6) return 'Fog';
  if (reg.el === 'Frost') return 'Snow';
  if (v < 0.8 || reg.el === 'Blaze') return 'Heat';
  return 'Rain';
}
const EX_WX_LINE = {
  Fog: () => "There's thick fog today, so we'll only see the places right next to us.",
  Heat: nm => `It's hot out here today, so ${nm} will tire sooner.`,
  Snow: nm => `The snow's deep today, so ${nm} will tire sooner.`,
  Rain: () => "It's raining, so the springs will be full.",
};
/* drawn over the scene on the smooth layer, in screen pixels */
function exWeatherPass(c, s, t, W, H) {
  const wx = s.exWx; if (!wx) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const u = H / 300;
  if (wx === 'Rain') {
    c.fillStyle = 'rgba(50,80,120,.14)'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(210,230,255,.55)'; c.lineWidth = 1.3 * u; c.lineCap = 'round'; c.beginPath();
    for (let i = 0; i < 90; i++) { const sp = 0.9 + (i % 5) * 0.12, x = ((i * 97.3 + t * 0.35 * sp) % (W + 60)) - 30, y = ((i * 53.7 + t * 0.9 * sp) % (H + 40)) - 20; c.moveTo(x, y); c.lineTo(x - 4 * u, y + 14 * u); }
    c.stroke();
  } else if (wx === 'Snow') {
    c.fillStyle = 'rgba(225,235,255,.12)'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { const r = (1.2 + (i % 4) * 0.6) * u, x = (i * 71.9 + Math.sin(t / 900 + i) * 14 * u + t * 0.02) % W, y = (i * 43.1 + t * (0.04 + (i % 4) * 0.012)) % H;
      c.fillStyle = `rgba(255,255,255,${0.6 + (i % 3) * 0.13})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  } else if (wx === 'Heat') {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,170,70,.22)'); g.addColorStop(0.6, 'rgba(255,190,90,.08)'); g.addColorStop(1, 'rgba(255,200,110,.12)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,240,210,.18)'; c.lineWidth = 2 * u;
    for (let i = 0; i < 7; i++) { const y = H * 0.55 + ((i * 37 - t * 0.02) % (H * 0.4) + H * 0.4) % (H * 0.4); c.beginPath(); for (let x = 0; x <= W; x += 8 * u) { const yy = y + Math.sin(x / (22 * u) + t / 260 + i) * 2.4 * u; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
  } else if (wx === 'Fog') {
    c.fillStyle = 'rgba(232,236,240,.12)'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { const r = (70 + (i % 3) * 30) * u, x = ((i * 157 + t * (0.008 + (i % 3) * 0.004) * u * 10) % (W + 2 * r)) - r, y = H * (0.45 + (i % 4) * 0.13);
      const g = c.createRadialGradient(x, y, r * 0.1, x, y, r); g.addColorStop(0, 'rgba(240,243,246,.4)'); g.addColorStop(1, 'rgba(240,243,246,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  }
  c.restore();
}

/* ---------- getting past an obstacle with a move ---------- */
// each obstacle gives way to two elements: the boulder to a hard hit or stone, the thorns to fire or a blade, the rune door
// to a spark or a charm, the mirage to light or shadow, and the dart totem to ice or water
const EX_OPEN = { 1: ['Brawl', 'Stone'], 2: ['Blaze', 'Steel'], 3: ['Spark', 'Charm'], 4: ['Light', 'Shade'], 5: ['Frost', 'Tide'] };
function exMoveFor(f, stat) { const els = EX_OPEN[stat] || []; return f.skills.filter(k => els.includes(k.el) && k.power).sort((a, b) => b.power - a.power)[0] || null; }
const EX_MOVE_WIN = {
  1: () => 'The boulder broke apart.', 3: () => 'The runes lit up and the door opened.',
  2: el => el === 'Blaze' ? 'The thorns burned away.' : 'The thorns are cut down.',
  4: el => el === 'Light' ? 'The light showed which archway is real.' : 'The fake archways faded away.',
  5: el => el === 'Frost' ? 'The totem froze solid.' : 'Water jammed the totem.',
};
const exTween = async (ms, fn) => { const t0 = performance.now(); for (;;) { const u = Math.min(1, (performance.now() - t0) / ms); fn(u); if (u >= 1) return; await rwait(16); } };
/* the Snabit uses its move on the obstacle: a lunge for a strike, a streak for anything thrown or cast */
async function exHit(mv, tx, ty) {
  const s = RS, el = mv.el; banner(mv.name, '#ffd23f'); s.pose = 'attack';
  if (mv.kind === 'Strike') { const x0 = s.x; await exTween(160, u => { s.x = x0 + 22 * u; }); prop({ k: 'exburst', el, x: tx, y: ty, t0: performance.now() }); rsfx('hit'); await rwait(140); await exTween(220, u => { s.x = x0 + 22 * (1 - u); }); }
  else { await rwait(220); const b = prop({ k: 'exbeam', el, x: s.x + 14, y: headY() + 8, x2: tx, y2: ty, t0: performance.now() }); rsfx('whiz'); await rwait(220); unprop(b); prop({ k: 'exburst', el, x: tx, y: ty, t0: performance.now() }); rsfx('zap'); }
  await rwait(500); banner(''); s.pose = 'idle';
}
async function exMoveOpen(stat, mv, seed) {
  const s = RS, el = mv.el; let line = EX_MOVE_WIN[stat](el);
  const clear = () => { s.props = s.props.filter(p => p.k !== 'exburst'); };
  if (stat === 1) { const b = prop({ k: 'xrockb', x: 172, y: GROUND, s: 1.7, broke: 0 }); await walkTo(108, 60, 'walk'); await exHit(mv, 166, GROUND - 26);
    rsfx('rumble'); spark(172, GROUND - 4, 'dust', 10); await exTween(1100, u => { b.broke = u; }); unprop(b); }
  else if (stat === 2) { const th = prop({ k: 'thorns2', x: 168, y: GROUND, s: 1.35, gone: 0, how: el === 'Blaze' ? 'burn' : 'cut' }); await walkTo(118, 60, 'walk'); await exHit(mv, 162, GROUND - 24);
    if (el === 'Blaze') rsfx('snap'); await exTween(el === 'Blaze' ? 1500 : 1000, u => { th.gone = u; }); unprop(th); }
  else if (stat === 3) { const d = prop({ k: 'sealdoor', x: 184, y: GROUND, lit: 0, drop: 0 }), lt = prop({ k: 'litter', x: 154, y: GROUND, s: 1.3 }); await walkTo(122, 60, 'walk'); await exHit(mv, 184, GROUND - 40);
    for (let i = 1; i <= 3; i++) { d.lit = i; rsfx('chip'); await rwait(180); } await exTween(380, u => { d.drop = 61 * u; }); spark(184, GROUND - 4, 'dust', 6); rsfx('rumble'); unprop(d); unprop(lt); }
  else if (stat === 4) { const real = seed % 3, m = prop({ k: 'mirage', x: 170, y: GROUND, real, reveal: 0, s: 1.2 }); await walkTo(98, 60, 'walk'); await exHit(mv, 170, GROUND - 30);
    await exTween(700, u => { m.reveal = u; }); clear(); await walkTo(170 - 55 + 110 * (0.2 + real * 0.3), 60, 'walk'); await walkTo(224, 60, 'walk'); unprop(m); }
  else { const tr = prop({ k: 'darttrap', x: 206, y: GROUND, live: true, s: 1.5 }), coat = prop({ k: 'excoat', el, x: 206, y: GROUND, s: 1.5, a: 0 }); await walkTo(122, 60, 'walk'); await exHit(mv, 200, GROUND - 40);
    tr.live = false; await exTween(500, u => { coat.a = u; }); await rwait(300); await walkTo(236, 120, 'run'); unprop(tr); unprop(coat); }
  clear(); await walkTo(Math.max(s.x, 226), 60, 'walk'); s.pose = 'happy';
  return line;
}

/* ---------- the props those use ---------- */
const EX_EL_COL = { Brawl: ['#ffd23f', '#fff6c8'], Stone: ['#9a8a74', '#d6c8ae'], Blaze: ['#ff7a2a', '#ffd34d'], Steel: ['#b9c4cf', '#ffffff'], Spark: ['#ffe14d', '#ffffff'],
  Charm: ['#ff8fc4', '#ffe0ef'], Light: ['#ffd76a', '#fffbe0'], Shade: ['#5a3f86', '#a68ad6'], Frost: ['#8fd3ff', '#eaf8ff'], Tide: ['#3ea0e0', '#bfe8ff'] };
function exProp2(c, p, t, front) {
  const x = p.x, y = p.y, now = performance.now();
  switch (p.k) {
    case 'xrockb': if (front) return true; exRockBreak(c, x, y, p.s || 1, p.broke || 0); return true;
    case 'thorns2': if (front) return true; exThornsGone(c, x, y, p.s || 1, p.gone || 0, p.how, t); return true;
    case 'excoat': if (front) return true; exCoat(c, x, y, p.s || 1, p.el, p.a || 0, t); return true;
    case 'exburst': if (!front) return true; { const u = Math.min(1, (now - p.t0) / 900); if (u < 1) exBurst(c, x, y, p.el, u, p.t0); } return true;
    case 'exbeam': if (!front) return true; { const C = EX_EL_COL[p.el] || EX_EL_COL.Brawl, u = Math.min(1, (now - p.t0) / 220); c.save(); c.lineCap = 'round';
      const hx = p.x + (p.x2 - p.x) * u, hy = p.y + (p.y2 - p.y) * u, tx = p.x + (p.x2 - p.x) * Math.max(0, u - 0.45), ty = p.y + (p.y2 - p.y) * Math.max(0, u - 0.45);
      c.strokeStyle = C[0]; c.lineWidth = 7; c.globalAlpha = 0.55; c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx, hy); c.stroke(); c.strokeStyle = C[1]; c.lineWidth = 3; c.globalAlpha = 1; c.stroke();
      c.fillStyle = C[1]; c.beginPath(); c.arc(hx, hy, 5, 0, 7); c.fill(); c.restore(); } return true;
    case 'tent': if (front) return true; exTent(c, x, y, p.s || 1); return true;
    case 'sign': if (front) return true; exSign(c, x, y, p.s || 1); return true;
  }
  return false;
}
/* the boulder splits down a jagged crack, the halves tip outward onto the ground and rounded chunks bounce away */
function exRockBreak(c, x, y, s, u) {
  const r = 15 * s, cy = y - r * 0.92, e = 1 - Math.pow(1 - Math.min(1, u * 1.6), 3), fade = 1 - Math.max(0, u - 0.8) * 5;
  const crack = [[3, -40], [-2, -30], [4, -20], [-3, -10], [2, 0], [-1, 10]].map(([dx, dy]) => [dx * s, dy * s]);
  c.save(); c.globalAlpha = Math.max(0, fade);
  for (const side of [-1, 1]) { c.save();
    const px = x + side * r * 0.95; c.translate(px, y); c.rotate(side * e * 0.42); c.translate(-px + side * e * 5 * s, -y);
    c.beginPath(); c.moveTo(x + side * 80 * s, cy - 60 * s); for (const [dx, dy] of crack) c.lineTo(x + dx, cy + dy); c.lineTo(x + side * 80 * s, y + 4); c.closePath(); c.clip();
    XA.rock(c, x, y, s, 0);
    c.fillStyle = 'rgba(70,62,54,.55)'; c.beginPath(); for (const [dx, dy] of crack) c.lineTo(x + dx - side * 1.2 * s, cy + dy); for (const [dx, dy] of crack.slice().reverse()) c.lineTo(x + dx - side * 4 * s, cy + dy); c.fill();   // the broken face
    c.restore(); }
  for (let i = 0; i < 8; i++) { const vx = (i % 2 ? 1 : -1) * (14 + (i * 7) % 20) * s, vy = (26 + (i * 11) % 22) * s, k = Math.min(1, u * 1.3), tt = k * 1.4,
      hy = Math.max(0, vy * tt - 34 * s * tt * tt), px = x + vx * tt, py = y - 3 * s - (tt < 1.4 ? hy : 0), rr = (2.2 + (i % 3)) * s;
    c.fillStyle = i % 3 ? '#a49d92' : '#8b8378'; SC.blob(c, px, py, [[0, 0, rr], [rr * 0.5, rr * 0.2, rr * 0.7]]); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(px - rr * 0.3, py - rr * 0.35, rr * 0.35, 0, 7); c.fill(); }
  if (u < 0.6) for (let i = 0; i < 5; i++) { const k = u / 0.6, dx = (i - 2) * 12 * s * (0.6 + k), rr = (8 + i % 2 * 4) * s * (0.5 + k); c.globalAlpha = (1 - k) * 0.5; c.fillStyle = '#d8cfc2'; c.beginPath(); c.arc(x + dx, y - rr * 0.6, rr, 0, 7); c.fill(); }
  c.restore();
}
/* fire catches along the bramble, chars it black and it sinks into a pile of ash with smoke rising; a blade cuts it on a
   slant and the top slides off and drops */
function exFlame(c, fx, fy, w, h, sway) {
  for (const [col, k] of [['#e2502a', 1], ['#ff8a2a', 0.72], ['#ffd34d', 0.42]]) { const W = w * k, H = h * k;
    c.fillStyle = col; c.beginPath(); c.moveTo(fx - W, fy); c.bezierCurveTo(fx - W * 1.1, fy - H * 0.45, fx - W * 0.4 + sway * 0.5, fy - H * 0.7, fx + sway, fy - H);
    c.bezierCurveTo(fx + W * 0.5 + sway * 0.5, fy - H * 0.68, fx + W * 1.1, fy - H * 0.45, fx + W, fy); c.arc(fx, fy, W, 0, Math.PI); c.fill(); }
}
function exThornsGone(c, x, y, s, u, how, t) {
  c.save();
  if (how === 'burn') {
    const char = Math.min(1, u / 0.55), sink = Math.max(0, (u - 0.45) / 0.55), flame = Math.sin(Math.min(1, u / 0.85) * Math.PI);
    c.save(); c.globalAlpha = 1 - sink; c.filter = `brightness(${1 - char * 0.8}) saturate(${1 - char})`; c.translate(x, y); c.scale(1 - sink * 0.2, 1 - sink * 0.85); XA.bramble(c, 0, 0, s); c.restore();
    c.fillStyle = '#3a3330'; c.globalAlpha = Math.min(1, sink * 2) * (1 - Math.max(0, u - 0.9) * 10); SC.blob(c, x, y - 2, [[0, 0, 9 * s], [-12 * s, 2, 7 * s], [12 * s, 2, 7 * s], [-5 * s, 1, 8 * s]]); c.fill();   // the ash
    c.globalAlpha = 1;
    for (let i = 0; i < 7; i++) { const fx = x + (i - 3) * 8.5 * s, k = Math.max(0, Math.min(1, flame * 1.4 - Math.abs(i - 3) * 0.12)); if (k <= 0) continue;
      exFlame(c, fx, y - 4 - (1 - sink) * 6 * s, (5 + (i % 2) * 2) * s * k, (24 + 10 * Math.sin(t / 90 + i * 1.7) + (i % 3) * 6) * s * k, Math.sin(t / 120 + i) * 3 * s); }
    for (let i = 0; i < 6; i++) { const k = (u * 1.2 + i / 6) % 1, sx = x + (i - 2.5) * 8 * s + Math.sin(t / 400 + i) * 4, sy = y - 40 * s - k * 50 * s; c.globalAlpha = (1 - k) * 0.45 * Math.min(1, u * 3); c.fillStyle = '#6b6461'; c.beginPath(); c.arc(sx, sy, (4 + k * 8) * s, 0, 7); c.fill(); }
    for (let i = 0; i < 14; i++) { const k = (i * 0.37 + u * 1.6) % 1, ex = x - 26 * s + (i * 13 % 52) * s + Math.sin(t / 200 + i) * 3, ey = y - 6 - k * 70 * s; c.globalAlpha = (1 - k) * flame; c.fillStyle = i % 3 ? '#ff9a3c' : '#ffe08a'; c.beginPath(); c.arc(ex, ey, 1.5 * s, 0, 7); c.fill(); }
  } else {
    const ax = x - 34 * s, ay = y - 30 * s, bx = x + 34 * s, by = y - 12 * s, e = Math.max(0, (u - 0.2) / 0.8), fall = e * e, fade = 1 - Math.max(0, u - 0.75) * 4;
    c.globalAlpha = Math.max(0, fade);
    c.save(); c.beginPath(); c.moveTo(ax - 40, ay); c.lineTo(bx + 40, by + (by - ay) * 40 / (bx - ax)); c.lineTo(bx + 40, y + 10); c.lineTo(ax - 40, y + 10); c.closePath(); c.clip(); XA.bramble(c, x, y, s); c.restore();   // the stumps
    c.save(); c.translate(fall * 30 * s, fall * 22 * s); c.translate(x, y - 20 * s); c.rotate(fall * 1.1); c.translate(-x, -(y - 20 * s));
    c.beginPath(); c.moveTo(ax - 40, ay); c.lineTo(bx + 40, by + (by - ay) * 40 / (bx - ax)); c.lineTo(bx + 40, y - 120 * s); c.lineTo(ax - 40, y - 120 * s); c.closePath(); c.clip(); XA.bramble(c, x, y, s); c.restore();
    c.globalAlpha = 1; for (let i = 0; i < 3; i++) { const k = Math.min(1, u * 4) , a = Math.max(0, 1 - u * 2.5); if (a <= 0) break; const o = (i - 1) * 7 * s;
      c.globalAlpha = a; c.strokeStyle = 'rgba(185,196,207,.6)'; c.lineWidth = 6 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(ax + o, ay - o * 0.4); c.lineTo(ax + o + (bx - ax) * k, ay - o * 0.4 + (by - ay) * k); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 2 * s; c.stroke(); }
  }
  c.restore();
}
/* the dart totem under ice or dripping water */
function exCoat(c, x, y, s, el, a, t) {
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  if (el === 'Frost') { c.fillStyle = 'rgba(190,232,255,.55)'; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.5;
    XA.poly(c, [[x - 13 * s, y], [x - 14 * s, y - 34 * s], [x - 11 * s, y - 49 * s], [x - 2 * s, y - 54 * s], [x + 9 * s, y - 51 * s], [x + 13 * s, y - 40 * s], [x + 13 * s, y]]); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x - 7 * s, y - 46 * s); c.lineTo(x - 3 * s, y - 34 * s); c.moveTo(x + 7 * s, y - 42 * s); c.lineTo(x + 4 * s, y - 28 * s); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.roundRect(x - 11 * s, y - 46 * s, 3 * s, 30 * s, 1.5 * s); c.fill();
    for (const [dx, dy, h] of [[-10, 26, 7], [-10, 9, 6], [-2, 3, 5], [6, 3, 6]]) { c.fillStyle = 'rgba(225,246,255,.9)'; c.beginPath(); c.moveTo(x + (dx - 1.6) * s, y - dy * s); c.lineTo(x + dx * s, y - (dy - h) * s); c.lineTo(x + (dx + 1.6) * s, y - dy * s); c.fill(); }
    for (const dx of [-18, -15, 16, 19]) { c.fillStyle = 'rgba(225,246,255,.8)'; c.beginPath(); c.moveTo(x + (dx - 2) * s, y); c.lineTo(x + dx * s, y - 5 * s); c.lineTo(x + (dx + 2) * s, y); c.fill(); } }
  else { c.fillStyle = 'rgba(62,160,224,.35)'; c.beginPath(); c.ellipse(x, y - 1, 26 * s, 4 * s, 0, 0, 7); c.fill();
    for (let i = 0; i < 6; i++) { const k = (t / 700 + i / 6) % 1, dx = (i * 7 - 18) * s; c.fillStyle = '#7cc6f0'; c.beginPath(); c.ellipse(x + dx, y - 48 * s + k * 46 * s, 1.6 * s, 2.4 * s, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(124,198,240,.8)'; c.lineWidth = 2.2 * s; c.lineCap = 'round'; for (const dx of [-9, 3, 12]) { c.beginPath(); c.moveTo(x + dx * s, y - 52 * s); c.quadraticCurveTo(x + (dx + 2) * s, y - 36 * s, x + dx * s, y - 26 * s); c.stroke(); } }
  c.restore();
}
/* the burst where a move lands, drawn for each element */
function exBurst(c, x, y, el, u, seed) {
  const C = EX_EL_COL[el] || EX_EL_COL.Brawl, R = 30, out = 1 - Math.pow(1 - u, 3), fade = 1 - Math.max(0, u - 0.55) / 0.45; c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const glow = (r, a) => { const g = c.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, C[1]); g.addColorStop(0.4, C[0]); g.addColorStop(1, C[0] + '00'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.globalAlpha = 1; };
  if (el === 'Brawl') { glow(R * out * 1.1, 0.5 * fade); c.globalAlpha = fade; const k = 0.5 + out * 0.8; c.fillStyle = C[0]; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = (i % 2 ? 9 : 24) * k; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill();
    c.fillStyle = C[1]; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + 0.2, r = (i % 2 ? 5 : 13) * k; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill();
    c.strokeStyle = C[1]; c.lineWidth = 3 * (1 - u); c.beginPath(); c.arc(x, y, 12 + out * 34, 0, 7); c.stroke(); }
  else if (el === 'Stone') { for (let i = 0; i < 4; i++) { const sx = x - 24 + i * 15, h = (34 + (i % 2) * 14) * Math.sin(Math.min(1, u * 3) * Math.PI * 0.5) * (1 - Math.max(0, u - 0.6) / 0.4), w = 9 + (i % 2) * 3;
      c.fillStyle = '#7d6f5c'; c.beginPath(); c.moveTo(sx - w, GROUND + 2); c.lineTo(sx - 1, GROUND - h); c.lineTo(sx + w, GROUND + 2); c.fill(); c.fillStyle = '#ab9c82'; c.beginPath(); c.moveTo(sx - 1, GROUND - h); c.lineTo(sx + w, GROUND + 2); c.lineTo(sx + 2, GROUND + 2); c.fill(); }
    c.globalAlpha = fade; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.4, d = out * (18 + i % 3 * 8), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + u * u * 20; c.fillStyle = i % 2 ? '#9a8a74' : '#6e6252'; c.beginPath(); c.moveTo(px - 4, py); c.lineTo(px - 1, py - 4); c.lineTo(px + 4, py - 1); c.lineTo(px + 1, py + 4); c.fill(); } }
  else if (el === 'Blaze') { glow(R * 1.3, 0.55 * fade); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, fx = x + Math.cos(a) * 14 * out, fy = y + Math.sin(a) * 9 * out, h = (16 + (i % 3) * 6) * Math.sin(Math.min(1, u * 1.6) * Math.PI) ;
      c.globalAlpha = fade; c.fillStyle = C[0]; c.beginPath(); c.moveTo(fx - 6, fy); c.quadraticCurveTo(fx - 5, fy - h * 0.6, fx + Math.sin(u * 20 + i) * 2, fy - h); c.quadraticCurveTo(fx + 5, fy - h * 0.6, fx + 6, fy); c.fill();
      c.fillStyle = C[1]; c.beginPath(); c.moveTo(fx - 3, fy); c.quadraticCurveTo(fx, fy - h * 0.55, fx + 3, fy); c.fill(); }
    for (let i = 0; i < 10; i++) { const k = (u * 1.4 + i * 0.1) % 1; c.globalAlpha = (1 - k) * fade; c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(x - 20 + i * 4.4, y - k * 40, 1.6, 0, 7); c.fill(); } }
  else if (el === 'Steel') { c.globalAlpha = fade; for (const [a0, d] of [[-2.4, 1], [-0.7, -1]]) { const sw = Math.min(1, u * 2.6) * 2.2; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 4; c.beginPath(); c.arc(x + d * 4, y, 24, a0, a0 + sw * (d > 0 ? 1 : 1)); c.stroke(); c.strokeStyle = C[0]; c.lineWidth = 8; c.globalAlpha = 0.4 * fade; c.stroke(); c.globalAlpha = fade; }
    for (let i = 0; i < 6; i++) { const a = i * 1.05, d = 8 + out * 22; c.fillStyle = '#fff6c8'; c.fillRect(x + Math.cos(a) * d - 1, y + Math.sin(a) * d - 1, 2.4, 2.4); } }
  else if (el === 'Spark') { glow(R * 1.2, 0.6 * fade * (0.6 + 0.4 * Math.sin(u * 40))); c.globalAlpha = fade; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 + seed % 7, L = 10 + out * 26; c.strokeStyle = C[0]; c.lineWidth = 3.5; c.beginPath(); c.moveTo(x, y);
      for (let k = 1; k <= 4; k++) { const d = L * k / 4, j = (k % 2 ? 1 : -1) * 6; c.lineTo(x + Math.cos(a) * d - Math.sin(a) * j, y + Math.sin(a) * d + Math.cos(a) * j); } c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 1.4; c.stroke(); } }
  else if (el === 'Charm') { glow(R * 1.2, 0.45 * fade); c.globalAlpha = fade; for (let i = 0; i < 7; i++) { const a = -1.57 + (i - 3) * 0.45, d = 6 + out * 30, hx = x + Math.cos(a) * d, hy = y + Math.sin(a) * d - u * 10, r = 4.5 + (i % 2) * 2;
      c.fillStyle = i % 2 ? C[0] : '#ff6fae'; c.beginPath(); c.moveTo(hx, hy + r); c.bezierCurveTo(hx - r * 1.6, hy - r * 0.2, hx - r * 0.6, hy - r * 1.4, hx, hy - r * 0.4); c.bezierCurveTo(hx + r * 0.6, hy - r * 1.4, hx + r * 1.6, hy - r * 0.2, hx, hy + r); c.fill(); } }
  else if (el === 'Light') { glow(R * (0.6 + out), 0.7 * fade); c.globalAlpha = 0.85 * fade; c.strokeStyle = C[1]; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + u * 0.4; c.lineWidth = i % 2 ? 2 : 3.5; c.beginPath(); c.moveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); c.lineTo(x + Math.cos(a) * (16 + out * 34), y + Math.sin(a) * (16 + out * 34)); c.stroke(); } }
  else if (el === 'Shade') { glow(R * 1.3, 0.45 * fade); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + u * 2.6, d = (6 + (i % 4) * 6) * (0.4 + out), rr = (7 + (i % 3) * 3) * (0.6 + out * 0.6);
      c.globalAlpha = fade * (0.55 + (i % 2) * 0.2); c.fillStyle = i % 3 ? C[0] : '#2e2046'; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.75 - u * 8, rr, 0, 7); c.fill(); }
    c.globalAlpha = fade * 0.9; c.fillStyle = C[1]; for (let i = 0; i < 5; i++) { const a = i * 1.26 - u * 4, d = 10 + out * 18; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, 1.6, 0, 7); c.fill(); } }
  else if (el === 'Frost') { glow(R * 1.1, 0.45 * fade); c.globalAlpha = fade; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, d = 6 + out * 24, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, L = 9;
      c.fillStyle = i % 2 ? C[0] : C[1]; c.beginPath(); c.moveTo(px + Math.cos(a) * L, py + Math.sin(a) * L); c.lineTo(px + Math.cos(a + 1.57) * 3, py + Math.sin(a + 1.57) * 3); c.lineTo(px - Math.cos(a) * L * 0.5, py - Math.sin(a) * L * 0.5); c.lineTo(px - Math.cos(a + 1.57) * 3, py - Math.sin(a + 1.57) * 3); c.fill(); }
    c.strokeStyle = '#fff'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const a = i * 1.05; c.beginPath(); c.moveTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.lineTo(x - Math.cos(a) * 9, y - Math.sin(a) * 9); c.stroke(); } }
  else if (el === 'Tide') { c.globalAlpha = fade; for (const d of [-1, 1]) { c.strokeStyle = C[0]; c.lineWidth = 6; c.beginPath(); c.arc(x + d * 6, y + 6, 10 + out * 18, d > 0 ? -1.4 : -1.75 - 1.6 * out, d > 0 ? -1.4 + 1.6 * out : -1.75); c.stroke(); c.strokeStyle = C[1]; c.lineWidth = 2; c.stroke(); }
    for (let i = 0; i < 10; i++) { const a = -0.3 - i * 0.28, v = 30 + i % 3 * 10, px = x + Math.cos(a) * v * out, py = y + Math.sin(a) * v * out + u * u * 40; c.fillStyle = i % 2 ? C[0] : C[1]; c.beginPath(); c.ellipse(px, py, 2.4, 3.2, 0, 0, 7); c.fill(); } }
  c.restore();
}
/* map icons and props for the teacher's camp and a stop on the path */
function exTent(c, x, y, s) {
  SC.depth(c, () => { c.beginPath(); c.moveTo(x - 20 * s, y); c.lineTo(x, y - 26 * s); c.lineTo(x + 20 * s, y); c.closePath(); }, '#d9a14a', 2 * s, 0.3);
  c.fillStyle = '#5a3a1e'; c.beginPath(); c.moveTo(x - 6 * s, y); c.lineTo(x, y - 14 * s); c.lineTo(x + 6 * s, y); c.fill();
  c.strokeStyle = '#5a3a1e'; c.lineWidth = 1.6 * s; c.beginPath(); c.moveTo(x, y - 26 * s); c.lineTo(x, y - 36 * s); c.stroke(); c.fillStyle = '#c8553d'; c.beginPath(); c.moveTo(x, y - 36 * s); c.lineTo(x + 9 * s, y - 33 * s); c.lineTo(x, y - 30 * s); c.fill();
}
function exSign(c, x, y, s) {
  c.fillStyle = '#7a5530'; c.fillRect(x - 1.6 * s, y - 24 * s, 3.2 * s, 24 * s);
  SC.depth(c, () => { c.beginPath(); c.moveTo(x - 12 * s, y - 24 * s); c.lineTo(x + 9 * s, y - 24 * s); c.lineTo(x + 14 * s, y - 19 * s); c.lineTo(x + 9 * s, y - 14 * s); c.lineTo(x - 12 * s, y - 14 * s); c.closePath(); }, '#c99a5c', 1.5 * s, 0.3);
  c.strokeStyle = 'rgba(90,60,30,.6)'; c.lineWidth = 1 * s; c.beginPath(); c.moveTo(x - 8 * s, y - 19 * s); c.lineTo(x + 7 * s, y - 19 * s); c.stroke();
}

/* ---------- the teacher's camp ---------- */
async function exTeach(reg, st, nm, K, found) {
  const s = RS, tName = TEACHER[reg.el][0], tThe = /^The /.test(tName) ? tName : 'the ' + tName, Cap = t => t[0].toUpperCase() + t.slice(1);
  const tp = prop({ k: 'teacher', el: reg.el, x: 186, y: GROUND, keep: true }); await walkTo(128, 60, 'walk'); s.pose = 'idle';
  if (!st.teachSeen) { st.teachSeen = true; banner(Cap(tName), '#fff'); }
  K(`${Cap(tThe)} has a camp up here.`); await rwait(1500); banner('');
  const opts = tripOptions(s, reg).filter(x => x.chainOk && x.score >= x.need);
  if (!opts.length) { K(`${Cap(tThe)} watched ${nm} for a while and says it isn't ready for anything new.`); s.pose = 'sad'; await rwait(2200); unprop(tp); return; }
  const x = opts[Math.floor(Math.random() * opts.length)], got = Math.random() * 100 < Math.min(70, 35 + Math.floor((x.score - x.need) / 4));
  banner('Special training', '#ffd23f'); K(`${Cap(tThe)} will show ${nm} how to do ${x.n}.`); await rwait(1200); banner('');
  for (let k = 0; k < 3; k++) { s.pose = 'effort'; await hop(8, 240); spark(s.x + 14, headY() + 6, k === 2 && got ? 'sparkle' : 'dust', k === 2 && got ? 8 : 3); s.pose = 'idle'; await rwait(260); }
  if (got) { if (x.fam) s.famMoves = (s.famMoves || []).concat(x.n); else { s.skillsKnown = (s.skillsKnown || []).concat(x.n); bookMark(s, x.n, 'learned'); }
    found.push(`a new move, ${x.n}`); banner(`Learned ${x.n}!`, '#7dff9a'); K(`${nm} has learned ${x.n}.`); s.pose = 'happy'; await rwait(1700); banner(''); }
  else { banner('Not yet', '#ff8a8a'); K(`${nm} couldn't get ${x.n} this time.`); s.pose = 'sad'; await rwait(1500); banner(''); }
  unprop(tp);
}

/* ---------- a stop on the path ---------- */
function exChoose(opts) {
  return new Promise(res => {
    const P = el('r-panel'), h = el('ex-home'); if (h) h.style.display = 'none';
    const box = document.createElement('div'); box.className = 'full'; box.style.cssText = 'display:flex;gap:6px';
    box.innerHTML = opts.map((o, i) => `<button class="rb" style="flex:1" data-c="${i}">${o[0]}<small>${o[1]}</small></button>`).join(''); P.appendChild(box);
    box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { box.remove(); if (h) h.style.display = ''; res(+b.dataset.c); });
  });
}
/* returns the energy it gave or took */
async function exStop(reg, n, nm, K, found, force) {
  const s = RS, R = rng(hashStr('exstop|' + reg.n + n.id + exSeason())), g = exGrade(reg), G = GRADE_INFO[g];
  const pool = ['hurt', 'shortcut', 'camp', 'stuck'];
  if (typeof rookMon === 'function' && typeof story === 'function' && story().seen.intro && PLAYER.rookEx !== exSeason()) pool.push('rook', 'rook');
  const kind = force || pool[Math.floor(R() * pool.length)];
  if (kind === 'hurt') {
    const o = gradedOpponent(g, G.lv[0], R, null), fp = prop({ k: 'foe', x: 168, y: GROUND, fm: o.fm, grid: o.fm.grid, pal: o.fm.pal, pose: 'sleep' }); await walkTo(120, 60, 'walk'); s.pose = 'idle';
    K(`A League scout's ${o.m.name} is lying by the trail with a hurt leg. The tag on its collar says its scout went on ahead.`);
    const c = await exChoose([['Carry it to the scouts', '2 energy'], ['Leave it for its scout', 'Keep going']]);
    if (c) { K('We left it where its scout will find it.'); await rwait(1400); unprop(fp); return 0; }
    const pay = Math.round(G.purse * 0.5); fp.pose = 'walk'; fp.right = true; s.pose = 'walk';
    await exTween(1300, u => { s.x = 120 + u * 120; fp.x = 168 + u * 120; }); unprop(fp); s.pose = 'happy';
    PLAYER.bits += pay; drawUI(); found.push(`${pay.toLocaleString()} bits`); K(`${nm} carried it to the scouts' camp, and the League paid ${pay.toLocaleString()} bits for bringing it back.`); await rwait(2400); return -2; }
  if (kind === 'shortcut') {
    const sg = prop({ k: 'sign', x: 160, y: GROUND, s: 1.3 }); await walkTo(126, 60, 'walk'); s.pose = 'idle';
    K("There's an old sign here pointing off the trail. It might be a shortcut.");
    const c = await exChoose([['Follow the sign', 'Could save time or waste it'], ['Stay on the trail', 'Keep going']]); unprop(sg);
    if (c) { K('We stayed on the trail.'); await rwait(1100); return 0; }
    await walkTo(230, 80, 'walk');
    if (R() < 0.6) { s.pose = 'happy'; K(`The sign was right, and the shortcut saved ${nm} a long walk.`); await rwait(2000); return 2; }
    s.pose = 'tired'; K(`The sign led to a cliff, and ${nm} had a long walk back.`); await rwait(2200); return -2; }
  if (kind === 'camp') {
    const fire = prop({ k: 'fire', x: 160, y: GROUND }); await walkTo(122, 60, 'walk'); s.pose = 'idle';
    K("There's an old League camp here with the fire still going.");
    const c = await exChoose([['Rest by the fire', '3 energy back'], ['Search the camp', 'Something might be left']]);
    if (!c) { s.pose = 'sleep'; await rwait(1400); s.pose = 'happy'; K(`${nm} had a long rest by the fire.`); await rwait(1700); unprop(fire); return 3; }
    const item = EX_FINDS[Math.floor(R() * EX_FINDS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a'; addItem(item); found.push(`${a} ${item}`);
    s.pose = 'effort'; await hop(6, 220); s.pose = 'happy'; spark(s.x + 10, headY(), 'sparkle', 4); K(`${nm} found ${a} ${item} under an old crate.`); await rwait(1700); unprop(fire); return 0; }
  if (kind === 'stuck') {
    const o = gradedOpponent('E', 1, R, reg.rift ? null : reg.el), bush = prop({ k: 'xbush', x: 168, y: GROUND, col: '#5f8a3e', shake: 1 }); await walkTo(126, 60, 'walk'); s.pose = 'idle';
    K("Something small is stuck in this bush, and it's crying.");
    const c = await exChoose([['Help it out', '1 energy'], ['Leave it', 'Keep going']]);
    if (c) { bush.shake = 0; K('We kept going.'); await rwait(1000); unprop(bush); return 0; }
    s.pose = 'effort'; await rwait(700); bush.shake = 0; const fp = prop({ k: 'foe', x: 176, y: GROUND, fm: o.fm, grid: o.fm.grid, pal: o.fm.pal, pose: 'happy', right: true });
    await hop(10, 300); s.pose = 'happy'; await exTween(900, u => { fp.x = 176 + u * 90; fp.jy = -Math.abs(Math.sin(u * 9)) * 8; }); unprop(fp); unprop(bush);
    s.stress -= 8; clampAll(); K(`A baby ${o.m.name} hopped out and ran off. Helping it calmed ${nm} down, and its stress went down by 8.`); await rwait(2400); return -1; }
  // Rook's team is out after the same stones
  PLAYER.rookEx = exSeason();
  const mon = rookMon(s.grade), w = await walkIn('rival', { mon });
  w.p.face = 'surprised'; await talk('rival', "I didn't know Josie's ranch had a permit out here.");
  w.p.face = 'worried'; await talk('rival', "My father sent me after the painted stones. He won't tell me what he wants them for.");
  w.p.face = 'happy'; say("Let's see whose Snabit gets to the far end first.", 'rival');
  const c = await exChoose([['Take him on', `A match with ${mon.m.name}`], ['Not today', 'Let him go ahead']]);
  if (c) { await talk('rival', "Suit yourself. I'll get there first."); await walkOut(w); return 0; }
  await sceneFade(true, 400); let won = false;
  await new Promise(done => arenaFight({ s, foe: mon, mode: 'control', title: 'Rival', noDraw: true, onEnd: r => { won = !!(r && r.winner === 0); done(); } }));
  s.trip = true; s.camJump = true; s.pose = won ? 'happy' : 'tired'; await sceneFade(false, 400);
  if (won) { const item = EX_RARE[Math.floor(R() * EX_RARE.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a'; addItem(item); found.push(`${a} ${item}`);
    w.p.face = 'worried'; await talk('rival', `Fine, you win. Take the ${item} my team found back there.`); await walkOut(w); return 0; }
  w.p.face = 'happy'; await talk('rival', 'See you at the far end.'); await walkOut(w);
  K(`Rook's team went on ahead, and the match left ${nm} tired.`); await rwait(2000); return -3;
}
