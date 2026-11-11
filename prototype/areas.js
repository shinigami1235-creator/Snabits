/* Trip areas: a skill trip moves through four places in its region, one a week, the way MR2's expedition maps
   move from spot to spot. Each area has its own picture and its own tasks. Concept stage: Glacier Rim is drawn,
   the rest have their names. Needs scenes.js (SC) and errantry.js (REGION_ART). */
const TRIP_AREAS = {
  Frost: [
    { key: 'trail', name: 'Snowfield trail', tasks: ['Wade the snowdrifts', 'Dig out a buried pack'] },
    { key: 'lake', name: 'Frozen lake', tasks: ['Cross the thin ice', 'Fish through the ice', 'Snowball fight'] },
    { key: 'cave', name: 'Ice cave', tasks: ['Find the way by echoes', 'Dodge falling icicles'] },
    { key: 'summit', name: 'Summit hut', tasks: ['Train with the Frost Matron'] },
  ],
  Blaze: ['Ash road', 'Lava fields', 'Obsidian cave', 'Crater rim'], Brawl: ['Dojo gate', 'Bamboo grove', 'Stone steps', 'Master\'s hall'],
  Spark: ['Pylon road', 'Storm meadow', 'Generator shed', 'Lightning rod hill'], Wild: ['Forest edge', 'Mossy hollow', 'Giant roots', 'Elder tree'],
  Tide: ['Beach', 'Tide pools', 'Sea cave', 'Lighthouse'], Venom: ['Boardwalk', 'Bubbling bog', 'Witch\'s thicket', 'Mire hut'],
  Charm: ['Garden gate', 'Rose maze', 'Butterfly glade', 'Moon pavilion'], Stone: ['Quarry road', 'Rock arch', 'Crystal mine', 'Sentinel peak'],
  Light: ['Temple stairs', 'Sun court', 'Mirror hall', 'Dawn altar'], Steel: ['Scrapyard', 'Conveyor floor', 'Furnace room', 'Foreman\'s office'],
  Shade: ['Moor path', 'Standing stones', 'Fog barrow', 'Moon well'], Void: ['Rift edge', 'Floating isles', 'Broken sky', 'Rift heart'],
};

/* an area's picture, in the same yard coordinates as the regions: world x 0..RW, ground at GROUND */
function areaArt(c, el, key, t) {
  const A = REGION_ART[el] || REGION_ART.Wild, x0 = -40, x1 = RW + 40;
  if (el === 'Frost' && key === 'lake') {
    SC.hills(c, RW + 80, GROUND - 76, GROUND, 8, 26, 1.2, '#b9cde0');
    for (let i = 0; i < 11; i++) { const x = i * 24 - 6, h = 30 + (i * 17) % 18;
      c.fillStyle = '#4f7a6a'; c.beginPath(); c.moveTo(x, GROUND - 44 - h); c.lineTo(x - 9, GROUND - 44); c.lineTo(x + 9, GROUND - 44); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x, GROUND - 44 - h); c.lineTo(x - 4, GROUND - 44 - h * 0.6); c.lineTo(x + 4, GROUND - 44 - h * 0.6); c.closePath(); c.fill(); }
    const g = c.createLinearGradient(0, GROUND - 46, 0, GROUND); g.addColorStop(0, '#cfe9f7'); g.addColorStop(1, '#a9d4ec');
    c.fillStyle = g; c.fillRect(x0, GROUND - 46, x1 - x0, 46);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 0.8; c.lineCap = 'round';
    for (const [a, b, d] of [[30, -30, 18], [120, -20, 26], [190, -36, 14], [70, -12, 20]]) { c.beginPath(); c.moveTo(a, GROUND + b); c.lineTo(a + d * 0.5, GROUND + b + 3); c.lineTo(a + d, GROUND + b + 1); c.moveTo(a + d * 0.5, GROUND + b + 3); c.lineTo(a + d * 0.4, GROUND + b + 8); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(20 + i * 50, GROUND - 26 + (i % 2) * 10, 16, 1.5, 0, 0, 7); c.fill(); }
    SC.depth(c, () => { c.beginPath(); c.ellipse(178, GROUND - 8, 9, 3, 0, 0, 7); }, '#2f6f9a', 0.8, 0.3);
    c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(178, GROUND - 9.5, 11, 2, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#e8f3fb'; c.fillRect(x0, GROUND - 4, x1 - x0, 80); c.fillStyle = 'rgba(0,0,0,.05)'; c.fillRect(x0, GROUND - 4, x1 - x0, 1);
    for (let i = 0; i < 14; i++) { c.fillStyle = '#ffffff'; c.beginPath(); c.arc((i * 37 + t / 30) % RW, (i * 13 + t / 12) % 110, 0.9, 0, 7); c.fill(); }
    return true;
  }
  if (el === 'Frost' && key === 'cave') {
    c.fillStyle = '#1f3552'; c.fillRect(x0, GROUND - 400, x1 - x0, 400);
    const glow = (x, y, r, col) => { const gg = c.createRadialGradient(x, y, 1, x, y, r); gg.addColorStop(0, col); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(x - r, y - r, r * 2, r * 2); };
    glow(120, GROUND - 70, 110, 'rgba(110,200,255,.35)');
    SC.depth(c, () => { c.beginPath(); c.moveTo(x0, GROUND - 400); c.lineTo(x1, GROUND - 400); c.lineTo(x1, GROUND - 120);
      for (let x = x1; x >= x0; x -= 12) c.lineTo(x, GROUND - 124 + Math.sin(x / 9) * 6 + (x % 36 === 0 ? 16 : 0)); c.closePath(); }, '#2b4a70', 3, 0.3);
    for (let i = 0; i < 12; i++) { const x = i * 22 + 4, h = 14 + (i * 23) % 26;
      SC.depth(c, () => { c.beginPath(); c.moveTo(x - 5, GROUND - 124); c.lineTo(x + 5, GROUND - 124); c.lineTo(x, GROUND - 124 + h); c.closePath(); }, '#cfeaff', 1, 0.25); }
    for (const [x, y, s] of [[34, GROUND - 22, 1], [210, GROUND - 30, 1.3], [150, GROUND - 16, 0.8]]) {
      glow(x, y - 8 * s, 22 * s, 'rgba(120,230,255,.45)');
      SC.depth(c, () => { c.beginPath(); c.moveTo(x - 7 * s, y); c.lineTo(x - 3 * s, y - 20 * s); c.lineTo(x + 2 * s, y - 26 * s); c.lineTo(x + 7 * s, y); c.closePath(); }, '#8fe3ff', 1, 0.3);
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(x - 2 * s, y - 4 * s); c.lineTo(x, y - 20 * s); c.lineTo(x + 1 * s, y - 4 * s); c.closePath(); c.fill(); }
    c.fillStyle = '#3d6a96'; c.fillRect(x0, GROUND - 10, x1 - x0, 80); c.fillStyle = '#6fa3cf'; c.fillRect(x0, GROUND - 12, x1 - x0, 3);
    return true;
  }
  if (el === 'Frost' && key === 'summit') {
    for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc((i * 41) % RW, (i * 29) % 80, 0.7, 0, 7); c.fill(); }
    SC.cloud(c, 40, GROUND - 60, 10, 0.95); SC.cloud(c, 200, GROUND - 52, 8, 0.85);
    SC.depth(c, () => { c.beginPath(); c.moveTo(x0, GROUND - 6); c.quadraticCurveTo(60, GROUND - 40, 130, GROUND - 46); c.quadraticCurveTo(200, GROUND - 40, x1, GROUND - 10); c.lineTo(x1, GROUND + 80); c.lineTo(x0, GROUND + 80); c.closePath(); }, '#ffffff', 2, 0.12);
    // the hut
    const hx = 176, hy = GROUND - 40;
    SC.depth(c, () => { c.beginPath(); c.roundRect(hx - 26, hy - 30, 52, 32, 2); }, '#8a5a32', 2, 0.25);
    c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 1; for (let y = hy - 24; y < hy; y += 6) { c.beginPath(); c.moveTo(hx - 26, y); c.lineTo(hx + 26, y); c.stroke(); }
    SC.depth(c, () => { c.beginPath(); c.moveTo(hx - 34, hy - 28); c.lineTo(hx, hy - 52); c.lineTo(hx + 34, hy - 28); c.closePath(); }, '#ffffff', 1.5, 0.15);
    c.fillStyle = '#ffd877'; c.beginPath(); c.roundRect(hx + 8, hy - 22, 10, 9, 1.5); c.fill(); c.fillStyle = '#5a3a22'; c.beginPath(); c.roundRect(hx - 14, hy - 18, 11, 20, [2, 2, 0, 0]); c.fill();
    c.fillStyle = '#6a4226'; c.fillRect(hx + 14, hy - 56, 6, 14);
    for (let i = 0; i < 4; i++) { const yy = (t / 30 + i * 8) % 30; c.fillStyle = `rgba(230,230,235,${0.6 - yy / 60})`; c.beginPath(); c.arc(hx + 17 + Math.sin(i + t / 500) * 3, hy - 60 - yy, 3 + yy / 7, 0, 7); c.fill(); }
    // prayer flags
    c.strokeStyle = '#7a6a5a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(20, GROUND - 60); c.quadraticCurveTo(80, GROUND - 46, 140, GROUND - 58); c.stroke();
    ['#e2483f', '#ffd23f', '#3b8fd0', '#5fae4a', '#ffffff'].forEach((col, i) => { for (let k = 0; k < 2; k++) { const u = (i * 2 + k + 0.5) / 10, xx = 20 + u * 120, yy = GROUND - 60 + Math.sin(u * Math.PI) * 10 - u * 2;
      c.fillStyle = col; c.beginPath(); c.moveTo(xx - 3, yy); c.lineTo(xx + 3, yy); c.lineTo(xx + 3 + Math.sin(t / 300 + u * 9), yy + 7); c.lineTo(xx - 3 + Math.sin(t / 300 + u * 9), yy + 7); c.closePath(); c.fill(); } });
    c.fillStyle = '#eef5fb'; c.fillRect(x0, GROUND - 6, x1 - x0, 80);
    return true;
  }
  return false;
}

/* the route map between areas: a paper map with the four stops, the path walked so far, and where it is now */
function routeMap(c, W, H, el, stop, t, k = 1) {
  const A = REGION_ART[el] || REGION_ART.Wild, areas = TRIP_AREAS[el], names = areas.map(a => a.name || a);
  c.save(); c.scale(k, k);
  SC.depth(c, () => { c.beginPath(); c.roundRect(8, 8, W - 16, H - 16, 8); }, '#f1e2c2', 3, 0.2);
  c.strokeStyle = 'rgba(120,80,40,.25)'; c.lineWidth = 2; c.strokeRect(16, 16, W - 32, H - 32);
  const P = [[W * 0.27, H * 0.74], [W * 0.4, H * 0.5], [W * 0.6, H * 0.64], [W * 0.72, H * 0.3]];
  // little landmarks
  c.fillStyle = 'rgba(80,110,140,.35)'; for (const [x, y] of [[W * 0.5, H * 0.26], [W * 0.7, H * 0.2], [W * 0.27, H * 0.3]]) { c.beginPath(); c.moveTo(x - 14, y + 10); c.lineTo(x, y - 10); c.lineTo(x + 14, y + 10); c.closePath(); c.fill(); }
  c.setLineDash([5, 5]); c.strokeStyle = '#8a5a32'; c.lineWidth = 2.5; c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]);
  c.strokeStyle = '#d24f43'; c.lineWidth = 3.5; c.beginPath(); P.slice(0, stop + 1).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
  P.forEach(([x, y], i) => { SC.depth(c, () => { c.beginPath(); c.arc(x, y, 9, 0, 7); }, i <= stop ? '#d24f43' : '#c9b48c', 2, 0.25);
    c.fillStyle = '#fff'; c.font = '800 10px system-ui'; c.textAlign = 'center'; c.fillText(String(i + 1), x, y + 3.5);
    c.fillStyle = '#4a3220'; c.font = '700 11px system-ui'; c.fillText(names[i], x, y + 24); });
  const [px, py] = P[stop]; c.fillStyle = '#4a86d8'; c.beginPath(); c.arc(px, py - 20 - Math.abs(Math.sin(t / 250)) * 4, 5, 0, 7); c.fill();
  c.restore();
}
