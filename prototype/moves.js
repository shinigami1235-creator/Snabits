/* Move animations, second pass. Loaded after chibi-hook.js, which it extends: every skill gets a fitting animation,
   projectiles carry a trail and land with an element blast, and support skills (buffs, shields, heals, fields) get
   their own effect instead of a plain cast pose. Strength scales the effect: weak moves draw smaller and lighter,
   strong ones bigger, with more pieces. */

/* which animation each skill plays; anything not listed falls back to the rules in animFor */
const MOVE_KIND = {
  // Blaze
  'Ember Bite': 'bite', 'Fire Wheel': 'tackle', 'Flame Pillar': 'pillar', 'Flare Charge': 'bolt', 'Inferno': 'tornado', 'Fire Spin': 'firespin',
  // Brawl
  'Jab': 'punch', 'Iron Palm': 'punch', 'Flurry Kick': 'punch', 'Focus Punch': 'punch',
  // Spark
  'Zap': 'lightning', 'Thunder Fang': 'bite', 'Thunderclap': 'lightning', 'Overload': 'push', 'Bolt Strike': 'lightning',
  // Wild
  'Vine Lash': 'claw', 'Sap Drain': 'drain', 'Seed Volley': 'volley', 'Leaf Storm': 'tornado', 'Solar Beam': 'beam',
  // Frost
  'Frost Nip': 'spear', 'Ice Shard': 'spear', 'Glacier Fall': 'icefall', 'Absolute Zero': 'pillar',
  // Tide
  'Splash Fang': 'bite', 'Aqua Jet': 'tackle', 'Tidal Crash': 'wave', 'Maelstrom': 'tornado',
  // Venom
  'Toxic Spit': 'bolt', 'Venom Fang': 'bite', 'Acid Splash': 'bolt', 'Leech Sting': 'drain', 'Plague': 'mist',
  // Charm
  'Hypno Ray': 'beam', 'Heart Burst': 'volley', 'Starfall': 'volley',
  // Stone
  'Rock Slam': 'boulder', 'Stone Edge': 'rockpath', 'Quake': 'rockpath', 'Landslide': 'boulder', 'Meteor Drop': 'meteor',
  // Light
  'Glint': 'bolt', 'Prism Ray': 'beam', 'Holy Ray': 'beam', 'Radiance': 'push',
  // Steel
  'Iron Ram': 'tackle', 'Bitstorm': 'volley', 'Gear Grind': 'bite', 'Steel Comet': 'meteor',
  // Shade
  'Shadow Bolt': 'bolt', 'Shadow Sneak': 'shadowstrike', 'Shadow Strike': 'shadowstrike', 'Night Claw': 'shadowclaw', 'Soul Sap': 'drain', 'Nightmare': 'lift',
  // Void
  'Abyss Gaze': 'beam', 'Rift Maw': 'bite',
  // neutral, wind and stat skills
  'Quick Strike': 'tackle', 'Gust': 'gust', 'Tornado': 'tornado', 'Body Slam': 'stomp', 'Haymaker': 'punch', 'Crush': 'stomp', 'Rampage': 'tackle',
  'Shield Bash': 'tackle', 'Mind Spike': 'bolt', 'Brainstorm': 'push', 'Soul Flare': 'bolt', 'Dart': 'tackle', 'Barrage': 'volley',
  // signature skills
  'Crunch': 'bite', 'Ink Jet': 'bolt', 'Static Screen': 'push', 'High Kick': 'stomp', 'Fly': 'fly',
};
function moveAnim(e, spec) {
  const n = e.name || '';
  if (/ Web$/.test(n)) return 'web';
  const of = typeof FAMILY !== 'undefined' && FAMILY[spec.family] && FAMILY[spec.family].of;
  if (MOVE_KIND[n] === 'punch' && (['Squib', 'Skit'].includes(spec.family) || (of && (['Squib', 'Skit'].includes(of[0]) || of[1] === 'Skit')) || spec.stage === 'Bit')) return 'tackle';
  return MOVE_KIND[n] || null;
}
/* how big an effect draws: weak moves 0.8, middling 1.05, strong 1.35 */
function movePower(n) { const s = typeof SKILLS !== 'undefined' && SKILLS[n]; const p = s ? (s.power || 0) * (s.hits || 1) : 40; return p < 55 ? 0.8 : p < 95 ? 1.05 : 1.35; }

/* ---------- small element pieces: embers, snow, drops, leaves, bubbles, sparks ---------- */
function ePart(c, el, x, y, s, t, i, name) {
  c.save(); c.translate(x, y);
  if (/Ink/.test(name || '')) { c.fillStyle = '#1d1b2a'; c.beginPath(); c.arc(0, 0, 3 * s, 0, 7); c.fill(); c.restore(); return; }
  switch (el) {
    case 'Blaze': { const g = c.createRadialGradient(0, 0, 0.3, 0, 0, 4 * s); g.addColorStop(0, '#fff1a0'); g.addColorStop(0.5, '#ff9a2e'); g.addColorStop(1, 'rgba(255,70,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 4 * s, 0, 7); c.fill(); break; }
    case 'Frost': c.rotate(t / 300 + i); c.strokeStyle = '#ffffff'; c.lineWidth = 1.1 * s; c.lineCap = 'round'; c.beginPath();
      for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; c.moveTo(Math.cos(a) * 3.2 * s, Math.sin(a) * 3.2 * s); c.lineTo(-Math.cos(a) * 3.2 * s, -Math.sin(a) * 3.2 * s); } c.stroke(); break;
    case 'Tide': c.fillStyle = 'rgba(120,190,255,.9)'; c.beginPath(); c.moveTo(0, -3.4 * s); c.quadraticCurveTo(2.6 * s, 0, 0, 2.2 * s); c.quadraticCurveTo(-2.6 * s, 0, 0, -3.4 * s); c.fill(); break;
    case 'Wild': c.rotate(t / 200 + i); c.fillStyle = i % 2 ? '#6cc25a' : '#8fd36a'; c.beginPath(); c.ellipse(0, 0, 4 * s, 1.8 * s, 0, 0, 7); c.fill(); break;
    case 'Venom': c.fillStyle = i % 2 ? 'rgba(170,240,110,.85)' : 'rgba(160,100,220,.85)'; c.beginPath(); c.arc(0, 0, 2.4 * s, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(-0.8 * s, -0.8 * s, 0.7 * s, 0, 7); c.fill(); break;
    case 'Spark': c.strokeStyle = '#ffe94a'; c.lineWidth = 1.2 * s; c.beginPath(); c.moveTo(-2.5 * s, -3 * s); c.lineTo(0.5 * s, -0.3 * s); c.lineTo(-0.5 * s, 0.3 * s); c.lineTo(2.5 * s, 3 * s); c.stroke(); break;
    case 'Charm': heartShape(c, 0, 0, 0.26 * s, i % 2 ? '#ff8fc0' : '#ffc0dc'); break;
    case 'Stone': c.rotate(i); c.fillStyle = i % 2 ? '#9a7a56' : '#b8956a'; c.beginPath(); c.moveTo(3 * s, 0); c.lineTo(0.5 * s, -2.6 * s); c.lineTo(-2.6 * s, -1 * s); c.lineTo(-1.6 * s, 2.2 * s); c.lineTo(1.8 * s, 2 * s); c.closePath(); c.fill(); break;
    case 'Light': { const r = 3 * s; c.fillStyle = '#fffbe0'; c.beginPath(); c.moveTo(0, -r); c.quadraticCurveTo(0, 0, r, 0); c.quadraticCurveTo(0, 0, 0, r); c.quadraticCurveTo(0, 0, -r, 0); c.quadraticCurveTo(0, 0, 0, -r); c.fill(); break; }
    case 'Steel': c.rotate(t / 100 + i); c.fillStyle = '#c9d2e0'; c.fillRect(-2 * s, -2 * s, 4 * s, 4 * s); c.fillStyle = '#7a8496'; c.fillRect(-0.8 * s, -0.8 * s, 1.6 * s, 1.6 * s); break;
    case 'Shade': c.fillStyle = 'rgba(90,50,150,.7)'; c.beginPath(); c.arc(0, 0, 3.4 * s, 0, 7); c.fill(); c.fillStyle = 'rgba(30,14,50,.8)'; c.beginPath(); c.arc(0, 0, 1.8 * s, 0, 7); c.fill(); break;
    case 'Void': c.rotate(t / 160 + i); c.fillStyle = i % 2 ? '#b38cff' : '#6be4ff'; c.beginPath(); c.moveTo(0, -3.4 * s); c.lineTo(1.6 * s, 0); c.lineTo(0, 3.4 * s); c.lineTo(-1.6 * s, 0); c.closePath(); c.fill(); break;
    case 'Brawl': c.fillStyle = 'rgba(255,214,140,.9)'; c.beginPath(); c.arc(0, 0, 2.6 * s, 0, 7); c.fill(); break;
    default: c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.2 * s; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 4 * s, i, i + 2.2); c.stroke();
  }
  c.restore();
}

/* ---------- the orb a bolt carries, drawn by element, pointing the way it flies ---------- */
function orb(c, p, x, t, sc) {
  const el = x.el, ang = p.ang || 0, n = x.name || '';
  c.save(); c.translate(p.x, p.y); c.scale(sc, sc);
  if (/Ink/.test(n)) { c.rotate(ang); c.fillStyle = '#1d1b2a'; c.beginPath(); c.ellipse(0, 0, 12, 9, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-12, 0, 8, 4, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(3, -3, 2.5, 0, 7); c.fill(); c.restore(); return; }
  if (el === 'Blaze') {                  // a fireball: a flickering teardrop of flame, white-hot at the nose
    c.rotate(ang); const f = Math.sin(t / 35) * 2, g = c.createRadialGradient(4, 0, 2, 0, 0, 30); g.addColorStop(0, 'rgba(255,200,90,.55)'); g.addColorStop(1, 'rgba(255,90,20,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 30, 0, 7); c.fill();
    for (const [r, len, col] of [[16, 46, '#e8401c'], [12.5, 36, '#ff8a22'], [8.5, 24, '#ffd040'], [5, 12, '#fff6c8']]) {
      c.fillStyle = col; c.beginPath(); c.arc(4, 0, r, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(-len * 0.45, r + f, -len, f * 0.6); c.quadraticCurveTo(-len * 0.45, -r + f, 4, -r); c.fill(); }
    c.restore(); return; }
  if (el === 'Frost') { c.rotate(t / 160); c.shadowColor = 'rgba(150,215,255,.9)'; c.shadowBlur = 14; c.fillStyle = '#bfe8ff'; c.beginPath();
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 7 : 14; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.shadowBlur = 0;
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(0, -14); c.lineTo(5, -5); c.lineTo(0, 0); c.closePath(); c.fill(); c.restore(); return; }
  if (el === 'Tide') { c.rotate(ang); c.fillStyle = 'rgba(70,150,240,.92)'; c.beginPath(); c.arc(2, 0, 12, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(-14, 10, -22, 0); c.quadraticCurveTo(-14, -10, 2, -12); c.fill();
    c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(4, -5, 4, 2.2, 0.3, 0, 7); c.fill(); c.restore(); return; }
  if (el === 'Venom') { c.fillStyle = 'rgb(150,90,210)'; c.beginPath(); for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2, r = 12 + Math.sin(a * 3 + t / 60) * 2.5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill();
    c.fillStyle = 'rgba(190,255,140,.95)'; for (const [bx, by, br] of [[-4, -3, 3.5], [4, 3, 2.2], [3, -6, 1.6]]) { c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); } c.restore(); return; }
  if (el === 'Charm') { heartShape(c, 0, 0, 1.1 + Math.sin(t / 80) * 0.08, '#ff7fb0'); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(-4, -5, 2.4, 0, 7); c.fill(); c.restore(); return; }
  if (el === 'Wild') { c.fillStyle = '#7dc95a'; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.rotate(t / 100); c.fillStyle = '#4f9a3f';
    for (let k = 0; k < 3; k++) { c.rotate(Math.PI * 2 / 3); c.beginPath(); c.ellipse(9, 0, 6, 2.6, 0, 0, 7); c.fill(); } c.restore(); return; }
  if (el === 'Stone') { c.rotate(t / 90); boulderFx(c, { x: 0, y: 0 }, t, 0.45); c.restore(); return; }
  if (el === 'Steel') { c.rotate(t / 60); c.fillStyle = '#c9d2e0'; c.beginPath(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, r = k % 2 ? 9 : 12; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill();
    c.fillStyle = '#7a8496'; c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.restore(); return; }
  if (el === 'Void') { c.rotate(t / 120); c.shadowColor = 'rgba(180,120,255,.9)'; c.shadowBlur = 14; c.fillStyle = '#1a0a30'; c.beginPath(); c.moveTo(0, -15); c.lineTo(9, 0); c.lineTo(0, 15); c.lineTo(-9, 0); c.closePath(); c.fill();
    c.strokeStyle = '#b38cff'; c.lineWidth = 2; c.stroke(); c.restore(); return; }
  if (el === 'Brawl' || !el) { const col = /Mind|Brain/.test(n) ? [255, 130, 210] : /Soul/.test(n) ? [255, 214, 90] : [255, 190, 110], g = c.createRadialGradient(0, 0, 1, 0, 0, 16);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, rgbS(col, 0.95)); g.addColorStop(1, rgbS(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fill(); c.restore(); return; }
  c.restore(); missile(c, p, x, t, sc);        // Spark, Shade and Light keep their first-pass look
}
/* a trail of pieces behind something flying from a to b, k of the way along */
function trailFx(c, x, a, b, k, t, n, s) {
  for (let j = 1; j <= n; j++) { const kk = k - j * 0.035; if (kk <= 0) break; const q = lerpP(a, b, kk, 16), jx = Math.sin(j * 2.3 + t / 50) * 4, jy = Math.cos(j * 1.7 + t / 60) * 4;
    c.globalAlpha = Math.max(0, 1 - j / (n + 1)); ePart(c, x.el, q.x + jx, q.y + jy, s * (1 - j / (n + 2) * 0.6), t, j, x.name);
    if (x.el === 'Blaze' && j > n * 0.55) { c.globalAlpha = 0.3 * (1 - j / (n + 1)); c.fillStyle = '#6a6460'; c.beginPath(); c.arc(q.x + jx, q.y + jy - j, 3 + j * 0.6, 0, 7); c.fill(); } }
  c.globalAlpha = 1;
}
/* the landing: a flash, a ring and pieces flying outward, in the move's element */
function blast(c, p, k, x) {
  const pw = x.pw || 1, col = x.col, R = 46 * pw;
  c.save(); c.globalAlpha = Math.max(0, 1 - k);
  const g = c.createRadialGradient(p.x, p.y, 2, p.x, p.y, R * (0.4 + k));
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.35, rgbS(col.map(v => Math.min(255, v + 60)), 0.8)); g.addColorStop(1, rgbS(col, 0));
  c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, R * (0.4 + k), 0, 7); c.fill();
  c.strokeStyle = rgbS(col.map(v => Math.min(255, v + 80)), 1); c.lineWidth = 4 * (1 - k) + 1; c.beginPath(); c.ellipse(p.x, p.y, R * (0.3 + k * 0.9), R * (0.22 + k * 0.6), 0, 0, 7); c.stroke();
  if (x.el === 'Blaze') for (let i = 0; i < 7 + pw * 3; i++) { const a = i * 2.4 + 0.4, d = R * (0.2 + eo(k) * 0.8);       // flame tongues
    c.save(); c.translate(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d - k * 10); c.rotate(a + Math.PI / 2); c.fillStyle = i % 2 ? '#ff8a22' : '#ffd040';
    c.beginPath(); c.moveTo(-4 * (1 - k * 0.5), 0); c.quadraticCurveTo(0, -14 * (1 - k * 0.4), 4 * (1 - k * 0.5), 0); c.closePath(); c.fill(); c.restore(); }
  else if (x.el === 'Frost') for (let i = 0; i < 6 + pw * 4; i++) { const a = i * 2.1 + 0.3, d = R * (0.15 + eo(k) * 0.9);        // ice splinters
    c.save(); c.translate(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); c.rotate(a); c.fillStyle = i % 2 ? '#dff4ff' : '#9fd6f5'; c.beginPath(); c.moveTo(7, 0); c.lineTo(-3, -2.6); c.lineTo(-5, 0); c.lineTo(-3, 2.6); c.closePath(); c.fill(); c.restore(); }
  else for (let i = 0; i < 6 + pw * 4; i++) { const a = i * 2.4 + 0.2, d = R * (0.15 + eo(k) * 0.95); ePart(c, x.el, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 1.4 * pw, k * 400, i, x.name); }
  c.restore();
}

/* ---------- bolt: charge at the source, fly with a trail, land with a blast ---------- */
ANIM.bolt = { C: 560, D: 940,
  atk: t => ({ f: 0, pose: t < 220 ? (fromHands(t) ? 'slamup' : 'cast') : t < 640 ? 'push' : 'idle' }),
  fx(c, t, x) { const o = x.from[0], tg = x.target, pw = x.pw || 1, sc = 0.8 + 0.45 * pw;
    if (t < 220) { const k = t / 220;                       // gathering: pieces drawn in toward the source
      for (let i = 0; i < 8; i++) { const a = i * 0.785 + t / 120, d = 34 * (1 - k) + 4; c.globalAlpha = k; ePart(c, x.el, o.x + Math.cos(a) * d, o.y + Math.sin(a) * d, 1.2, t, i, x.name); }
      c.globalAlpha = 1; orb(c, { x: o.x, y: o.y, ang: Math.atan2(tg.y - o.y, tg.x - o.x) }, x, t, sc * (0.3 + 0.7 * k)); }
    else if (t < 560) { const k = ei((t - 220) / 340) * 0.7 + (t - 220) / 340 * 0.3, p = lerpP(o, tg, k, 16);
      trailFx(c, x, o, tg, k, t, Math.round(9 + 7 * pw), 1.4 + pw * 0.5); orb(c, p, x, t, sc); }
    else if (t < 920) blast(c, tg, (t - 560) / 360, x); } };

/* ---------- ice shards: faceted crystals that spin up, fly and shatter ---------- */
function shardFx(c, p, sc, a = 1) {
  c.save(); c.translate(p.x, p.y); c.rotate(p.ang); c.scale(sc, sc); c.globalAlpha = a;
  c.shadowColor = 'rgba(150,215,255,1)'; c.shadowBlur = 18;
  c.fillStyle = '#8fcbf0'; c.beginPath(); c.moveTo(26, 0); c.lineTo(6, 7); c.lineTo(-14, 5); c.lineTo(-20, 0); c.closePath(); c.fill(); c.shadowBlur = 0;
  c.fillStyle = '#e4f6ff'; c.beginPath(); c.moveTo(26, 0); c.lineTo(6, -7); c.lineTo(-14, -5); c.lineTo(-20, 0); c.closePath(); c.fill();
  c.strokeStyle = '#ffffff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(24, 0); c.lineTo(-18, 0); c.stroke();
  c.restore();
}
ANIM.spear = { C: 520, D: 900,
  atk: t => ({ f: 0, pose: t < 200 ? 'slamup' : t < 640 ? 'push' : 'idle' }),
  fx(c, t, x) { const pw = x.pw || 1, n = pw < 1 ? 3 : 5, rock = x.el === 'Stone';
    for (let i = 0; i < n; i++) { const o = x.from[i % x.from.length], off = (i - (n - 1) / 2) * 12, k = (t - 200 - i * 45) / 300, ang = Math.atan2(x.target.y - o.y, x.target.x - o.x);
      if (t < 200 + i * 45) { const a = Math.min(1, t / 160), sp = { x: o.x + Math.cos(t / 120 + i * 2.1) * 16 * (1 - a * 0.4), y: o.y - 14 + Math.sin(t / 120 + i * 2.1) * 10, ang: ang + Math.sin(t / 90 + i) * 0.6 };
        rock ? spearFx(c, x, sp, i, a) : shardFx(c, sp, 0.8 * a + 0.3, a); }
      else if (k <= 1) { const p = lerpP(o, x.target, k, 10, off);
        for (let j = 1; j < 7; j++) { const q = lerpP(o, x.target, Math.max(0, k - j * 0.04), 10, off); c.globalAlpha = 0.7 - j * 0.09; ePart(c, 'Frost', q.x + Math.sin(j * 3 + t / 40) * 3, q.y, 1.4, t, j);
          c.fillStyle = 'rgba(220,240,255,.35)'; c.beginPath(); c.arc(q.x, q.y, 3 + j, 0, 7); c.fill(); }
        c.globalAlpha = 1; rock ? spearFx(c, x, p, i, 1.2) : shardFx(c, p, 1.05 + 0.2 * pw); } }
    if (t > 520 && t < 880) { const k = (t - 520) / 360; blast(c, x.target, k, x);
      c.save(); c.globalAlpha = 0.7 * (1 - k); c.fillStyle = '#dff4ff'; c.beginPath(); c.ellipse(x.target.x, x.target.foot - 2, 30 + 20 * k, 7 + 3 * k, 0, 0, 7); c.fill(); c.restore(); } } };

/* ---------- tornado: forms in front of the user, crosses over and lifts the target ---------- */
function tornadoFx(c, cx, foot, h, w, t, el, a) {
  const style = el === 'Blaze' ? ['rgba(255,120,40,', 'rgba(255,214,90,'] : el === 'Tide' ? ['rgba(70,150,240,', 'rgba(200,235,255,'] : el === 'Wild' ? ['rgba(110,190,90,', 'rgba(220,245,200,'] :
    el === 'Frost' ? ['rgba(200,230,255,', 'rgba(255,255,255,'] : el === 'Venom' ? ['rgba(150,90,210,', 'rgba(190,255,140,'] : ['rgba(220,228,240,', 'rgba(255,255,255,'];
  c.save(); c.globalAlpha = a; c.lineCap = 'round';
  const N = 12;
  for (let i = 0; i < N; i++) { const k = i / (N - 1), y = foot - k * h, r = w * (0.14 + k * 0.86), sway = Math.sin(t / 180 + k * 3) * 8 * k, rot = t / 70 + i * 0.9;
    c.strokeStyle = style[i % 2] + (0.35 + 0.5 * (1 - Math.abs(k - 0.5))) + ')'; c.lineWidth = 2 + 4 * k;
    c.beginPath(); c.ellipse(cx + sway, y, r, r * 0.28, 0, rot % 6.28, rot % 6.28 + 4.2); c.stroke(); }
  if (el === 'Blaze') { const g = c.createRadialGradient(cx, foot - h * 0.4, 4, cx, foot - h * 0.4, w * 1.2); g.addColorStop(0, 'rgba(255,170,60,.35)'); g.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = g; c.fillRect(cx - w * 1.2, foot - h, w * 2.4, h + 10); }
  for (let i = 0; i < 14; i++) { const k = ((t / 900) + i / 14) % 1, y = foot - k * h, r = w * (0.14 + k * 0.86), ang = t / 110 + i * 1.7;
    ePart(c, el, cx + Math.cos(ang) * r + Math.sin(t / 180 + k * 3) * 8 * k, y + Math.sin(ang) * r * 0.28, 1.4, t, i); }
  c.restore();
}
ANIM.tornado = { C: 600, D: 1180,
  atk: t => ({ f: 0, pose: t < 260 ? 'cast' : t < 900 ? 'push' : 'idle' }),
  def(t) { if (t < 600 || t > 1060) return null; const k = (t - 600) / 460; return { lift: -46 * Math.sin(k * Math.PI), rot: Math.sin(t / 55) * 0.5, pose: 'hit' }; },
  fx(c, t, x) { const pw = x.pw || 1, s0 = lerpP(x.self, x.target, 0.22), H = 120 * pw, W = 40 * pw;
    if (t < 300) tornadoFx(c, s0.x, s0.y + 30, H * eo(t / 300), W * eo(t / 300), t, x.el, 1);
    else if (t < 600) { const p = lerpP(s0, x.target, ei((t - 300) / 300)); tornadoFx(c, p.x, p.y + 30 + ((x.target.foot - x.target.y - 30) * (t - 300) / 300), H, W, t, x.el, 1); }
    else if (t < 1150) tornadoFx(c, x.target.x, x.target.foot, H * 1.15, W * 1.15, t, x.el, Math.min(1, (1150 - t) / 200)); } };

/* ---------- fire spin: rings of flame wind around the target ---------- */
ANIM.firespin = { C: 460, D: 1100,
  atk: t => ({ f: 0, pose: t < 220 ? 'cast' : t < 820 ? 'push' : 'idle' }),
  def: t => t > 460 && t < 1000 ? { pose: 'hit', rot: Math.sin(t / 70) * 0.08 } : null,
  fx(c, t, x) { const p = x.target;
    if (t < 460) { const k = (t - 120) / 340; if (k > 0) { const q = lerpP(x.from[0], p, ei(Math.min(1, k)), 30); for (let i = 0; i < 10; i++) { const a = t / 50 + i * 0.63; ePart(c, 'Blaze', q.x + Math.cos(a) * 16, q.y + Math.sin(a) * 8, 2.6, t, i); } } return; }
    const a = Math.min(1, (t - 460) / 120) * Math.min(1, (1080 - t) / 180);
    c.save(); c.globalAlpha = a;
    for (let ring = 0; ring < 3; ring++) { const y = p.foot - 6 - ring * 28, r = 50 + ring * 4;
      for (let i = 0; i < 9; i++) { const ang = t / (110 - ring * 15) + i * 0.7 + ring, fx = p.x + Math.cos(ang) * r, fy = y + Math.sin(ang) * r * 0.3, front = Math.sin(ang) > 0;
        if (!front) c.globalAlpha = a * 0.55; else c.globalAlpha = a;
        c.save(); c.translate(fx, fy); const fl = 22 + Math.sin(t / 40 + i) * 6;
        for (const [w, col, h] of [[9, '#e8401c', 1], [6.5, i % 3 ? '#ff8a22' : '#ffb030', 0.8], [3.5, '#ffe27a', 0.55]]) { c.fillStyle = col; c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(-w * 0.7, -fl * h * 0.6, 0, -fl * h); c.quadraticCurveTo(w * 0.7, -fl * h * 0.6, w, 0); c.closePath(); c.fill(); } c.restore(); } }
    c.restore(); } };

/* ---------- gust: crescents of wind fly across and shove the target back ---------- */
ANIM.gust = { C: 400, D: 820,
  atk: t => ({ f: 0, pose: t < 160 ? 'cast' : t < 600 ? 'push' : 'idle' }),
  def(t) { if (t < 400) return null; const k = (t - 400) / 420; return { f: -0.18 * (k < 0.3 ? eo(k / 0.3) : 1 - eio((k - 0.3) / 0.7)), pose: k < 0.5 ? 'hit' : 'idle' }; },
  fx(c, t, x) { const a = x.self, b = x.target, ang = Math.atan2(b.y - a.y, b.x - a.x);
    for (let i = 0; i < 4; i++) { const k = (t - 120 - i * 60) / 300; if (k < 0 || k > 1.2) continue; const p = lerpP(a, b, Math.min(1, k), 6, (i - 1.5) * 10);
      c.save(); c.translate(p.x, p.y); c.rotate(ang); c.globalAlpha = Math.max(0, 1 - Math.max(0, k - 0.9) * 4); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineCap = 'round';
      c.lineWidth = 3; c.beginPath(); c.arc(-6, 0, 18, -1.1, 1.1); c.stroke(); c.lineWidth = 1.6; c.beginPath(); c.arc(-14, 0, 14, -1, 1); c.stroke();
      c.lineWidth = 1.4; for (const dy of [-8, 0, 8]) { c.beginPath(); c.moveTo(-26, dy); c.lineTo(-46, dy); c.stroke(); } c.restore(); }
    if (t > 380 && t < 760) for (let i = 0; i < 6; i++) { const k = (t - 380) / 380; ePart(c, 'Wild', b.x - 20 + k * 60 + i * 6, b.y - 30 + i * 10 + Math.sin(t / 50 + i) * 6, 1.2, t, i); } } };

/* ---------- shadow strike: sinks into its shadow, slides under, rises behind the target and hits ---------- */
function puddle(c, x, y, w, a) { c.save(); c.globalAlpha = a; const g = c.createRadialGradient(x, y, 2, x, y, w); g.addColorStop(0, 'rgba(25,10,45,.95)'); g.addColorStop(0.7, 'rgba(60,25,100,.7)'); g.addColorStop(1, 'rgba(60,25,100,0)');
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y, w, w * 0.26, 0, 0, 7); c.fill(); c.restore(); }
ANIM.shadowstrike = { C: 620, D: 1160,
  atk(t) {
    if (t < 240) { const k = eo(t / 240); return { f: 0, pose: 'crouch', sy: 1 - 0.9 * k, sx: 1 + 0.3 * k, alpha: 1 - k }; }
    if (t < 520) return { f: (t - 240) / 280 * 1.06, alpha: 0, pose: 'crouch' };
    if (t < 620) { const k = eo((t - 520) / 100); return { f: 1.08, pose: 'swipedown', sy: 0.3 + 0.7 * k, alpha: k }; }
    if (t < 780) return { f: 1.08, pose: 'swipedown' };
    if (t < 940) { const k = (t - 780) / 160; return { f: 1.08, pose: 'crouch', sy: 1 - 0.9 * k, alpha: 1 - k }; }
    const k = eo((t - 940) / 220); return { f: 0, pose: 'idle', sy: 0.1 + 0.9 * k, alpha: k }; },
  fx(c, t, x) { const a = x.self, b = x.target, w = 34;
    if (t < 260) puddle(c, a.x, a.foot, w * eo(t / 200), 1);
    else if (t < 520) { const k = (t - 240) / 280, p = { x: a.x + (b.x - a.x) * k * 1.06, y: a.foot + (b.foot - a.foot) * k * 1.06 }; puddle(c, p.x, p.y, w, 1);
      for (let i = 0; i < 4; i++) ePart(c, 'Shade', p.x - (b.x - a.x) * 0.04 * i, p.y - 2 - i * 3, 1.2, t, i); }
    else if (t < 940) { const p = { x: a.x + (b.x - a.x) * 1.08, y: a.foot + (b.foot - a.foot) * 1.08 }; puddle(c, p.x, p.y, w, t < 820 ? 1 : 1 - (t - 820) / 120); }
    else puddle(c, a.x, a.foot, w, 1 - (t - 940) / 220);
    if (t > 600 && t < 900) slash(c, b, (t - 600) / 300, [70, 30, 120], 1.3); } };

/* ---------- web: a strand shoots out, then a web spreads over the target in the user's element ---------- */
ANIM.web = { C: 420, D: 1150,
  atk: t => ({ f: 0, pose: t < 150 ? 'crouch' : t < 500 ? 'push' : 'idle' }),
  def: t => t > 420 && t < 1100 ? { pose: 'hurt', sy: 0.94, sx: 1.03 } : null,
  fx(c, t, x) { const o = x.from[0], b = x.target, col = x.el === 'Brawl' || x.el === 'Steel' ? [236, 236, 236] : x.col.map(v => Math.min(255, v + 70));
    if (t > 150 && t < 520) { const k = Math.min(1, (t - 150) / 270), p = lerpP(o, b, k, 6); c.save(); c.strokeStyle = rgbS(col, 0.95); c.lineWidth = 2; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(p.x, p.y); c.stroke();
      c.fillStyle = rgbS(col); c.beginPath(); c.arc(p.x, p.y, 4, 0, 7); c.fill(); c.restore(); }
    if (t >= 420) { const k = Math.min(1, (t - 420) / 160), a = Math.min(1, (1150 - t) / 200), R = 46 * k;
      c.save(); c.globalAlpha = a; c.translate(b.x, b.y); c.strokeStyle = rgbS(col, 0.95); c.lineWidth = 1.6; c.shadowColor = rgbS(x.col, 0.8); c.shadowBlur = 6;
      for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4 + 0.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ang) * R, Math.sin(ang) * R * 0.85); c.stroke(); }
      for (let ring = 1; ring <= 4; ring++) { const r = R * ring / 4; c.beginPath();
        for (let i = 0; i <= 8; i++) { const ang = i * Math.PI / 4 + 0.2, an2 = ang - Math.PI / 8, mid = r * 0.86; if (!i) c.moveTo(Math.cos(ang) * r, Math.sin(ang) * r * 0.85); else c.quadraticCurveTo(Math.cos(an2) * mid, Math.sin(an2) * mid * 0.85, Math.cos(ang) * r, Math.sin(ang) * r * 0.85); } c.stroke(); }
      c.shadowBlur = 0; c.restore();
      if (k >= 1) for (let i = 0; i < 8; i++) { const ang = i * 0.785 + 0.6, r = R * (0.4 + (i % 3) * 0.2); c.globalAlpha = a; ePart(c, x.el, b.x + Math.cos(ang) * r, b.y + Math.sin(ang) * r * 0.85 + Math.sin(t / 120 + i) * 2, 1.3, t, i); }
      c.globalAlpha = 1; } } };

/* ---------- fly: up out of sight, then a dive onto the target ---------- */
ANIM.fly = { C: 640, D: 1180,
  atk(t) { const sky = CB.anim && CB.anim.fromSky;
    if (t < 280) return sky ? { f: 0, lift: -280, alpha: 0, pose: 'jump' } : { f: 0, lift: -280 * ei(t / 280), pose: 'jump' };
    if (t < 520) return { f: 0.92, lift: -280, alpha: 0, pose: 'jump' };
    if (t < 640) { const k = ei((t - 520) / 120); return { f: 0.92, lift: -280 * (1 - k), alpha: 1, pose: 'tackle', sy: 1.25, sx: 0.85 }; }
    if (t < 760) { const a = 1 - eb((t - 640) / 120); return { f: 0.92, pose: 'land', sx: 1 + 0.2 * a, sy: 1 - 0.18 * a }; }
    const k = eio((t - 760) / 420); return { f: 0.92 * (1 - k), arc: -Math.sin(k * Math.PI) * 60, pose: 'jump' }; },
  def: t => t > 640 && t < 800 ? { sx: 1.25, sy: 0.75 } : null,
  fx(c, t, x) { if (t > 280 && t < 640) { const b = x.target, k = (t - 280) / 360; c.save(); c.globalAlpha = 0.15 + 0.35 * k; c.fillStyle = '#000'; c.beginPath(); c.ellipse(b.x, b.foot, 12 + 26 * k, 4 + 5 * k, 0, 0, 7); c.fill(); c.restore(); }
    if (t > 520 && t < 640) { const b = x.target, k = (t - 520) / 120; c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineCap = 'round';
      for (let i = -2; i <= 2; i++) { c.lineWidth = 2; c.beginPath(); c.moveTo(b.x + i * 12, b.y - 200 + k * 140); c.lineTo(b.x + i * 12, b.y - 260 + k * 140); c.stroke(); } c.restore(); }
    if (t > 640 && t < 900) { dust(x.c || c, x.target, (t - 640) / 260); blast(c, x.target, (t - 640) / 260, x); } } };

/* ---------- falling blocks: an ice chunk or a meteor drops from above ---------- */
function chunk(c, p, s, el, t) {
  c.save(); c.translate(p.x, p.y); c.rotate(t / 300); c.scale(s, s);
  if (el === 'Frost') { c.shadowColor = 'rgba(150,215,255,.9)'; c.shadowBlur = 14; c.fillStyle = '#9fd6f5'; c.beginPath(); c.moveTo(0, -26); c.lineTo(22, -8); c.lineTo(16, 20); c.lineTo(-14, 22); c.lineTo(-24, -4); c.closePath(); c.fill(); c.shadowBlur = 0;
    c.fillStyle = '#e4f6ff'; c.beginPath(); c.moveTo(0, -26); c.lineTo(22, -8); c.lineTo(2, 0); c.lineTo(-24, -4); c.closePath(); c.fill(); }
  else { const g = c.createRadialGradient(-6, -6, 2, 0, 0, 30); g.addColorStop(0, '#ffd27a'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 32, 0, 7); c.fill(); boulderFx(c, { x: 0, y: 0 }, t, 1.1); }
  c.restore();
}
ANIM.icefall = { C: 560, D: 1000,
  atk: t => ({ f: 0, pose: t < 300 ? 'slamup' : t < 700 ? 'slam' : 'idle' }),
  def: t => t > 560 && t < 720 ? { sx: 1.3, sy: 0.75, pose: 'hit' } : null,
  fx(c, t, x) { const b = x.target, pw = x.pw || 1, el = x.name === 'Glacier Fall' ? 'Frost' : 'Stone';
    if (t > 200 && t < 560) { const k = ei((t - 200) / 360), y = b.y - 170 + (170 - 10) * k; c.save(); c.globalAlpha = 0.25 + 0.4 * k; c.fillStyle = '#000'; c.beginPath(); c.ellipse(b.x, b.foot, 20 + 20 * k, 5 + 4 * k, 0, 0, 7); c.fill(); c.restore();
      if (el === 'Stone') for (let j = 1; j < 6; j++) { c.globalAlpha = 0.5 - j * 0.08; ePart(c, 'Blaze', b.x - j * 5, y - j * 16, 2, t, j); } c.globalAlpha = 1;
      chunk(c, { x: b.x - (1 - k) * 40, y }, 0.9 * pw, el, t); }
    if (t >= 560 && t < 960) { const k = (t - 560) / 400; blast(c, b, k, { ...x, el, col: el === 'Frost' ? [150, 215, 255] : [255, 150, 70] }); dust(c, b, k); } } };
ANIM.meteor = ANIM.icefall;

/* ---------- wave: a wall of water rolls across ---------- */
ANIM.wave = { C: 560, D: 1060,
  atk: t => ({ f: 0, pose: t < 220 ? 'slamup' : t < 760 ? 'push' : 'idle' }),
  def(t) { if (t < 560) return null; const k = (t - 560) / 500; return { f: -0.14 * Math.sin(Math.min(1, k * 1.5) * Math.PI), lift: -20 * Math.sin(Math.min(1, k * 2) * Math.PI), pose: k < 0.6 ? 'hit' : 'idle' }; },
  fx(c, t, x) { if (t < 160 || t > 1000) return; const a = x.self, b = x.target, k = Math.min(1.1, (t - 160) / 420), p = lerpP(a, b, Math.min(1, k)), h = 70 * (x.pw || 1) * Math.min(1, (t - 160) / 200), A = Math.min(1, (1000 - t) / 200);
    const dir = Math.sign(b.x - a.x) || 1, base = p.y + 30 + (b.foot - b.y - 30) * Math.min(1, k);
    c.save(); c.globalAlpha = A; c.translate(p.x, base); c.scale(dir, 1);
    const g = c.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#bfe9ff'); g.addColorStop(0.4, '#4fa8e8'); g.addColorStop(1, '#2a74c0'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-80, 0); c.bezierCurveTo(-50, -h * 0.2, -30, -h * 0.95, 6, -h); c.bezierCurveTo(30, -h * 1.02, 40, -h * 0.7, 26, -h * 0.55);
    c.bezierCurveTo(16, -h * 0.45, 10, -h * 0.62, 18, -h * 0.68); c.bezierCurveTo(8, -h * 0.5, 30, -h * 0.25, 40, 0); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-60, -4); c.bezierCurveTo(-40, -h * 0.2, -26, -h * 0.7, 0, -h * 0.86); c.lineTo(-6, -h * 0.7); c.bezierCurveTo(-28, -h * 0.5, -40, -h * 0.15, -60, -4); c.fill();
    c.fillStyle = '#ffffff'; for (let i = 0; i < 9; i++) { const a2 = i / 8 * 2.4 - 0.4; c.beginPath(); c.arc(8 + Math.cos(a2) * 20 + Math.sin(t / 50 + i) * 2, -h * 0.8 + Math.sin(a2) * 14, 4.5 - i * 0.3, 0, 7); c.fill(); }
    c.restore(); for (let i = 0; i < 8; i++) { c.globalAlpha = A; ePart(c, 'Tide', p.x + dir * (20 + i * 4), base - h * 0.9 - Math.abs(Math.sin(t / 80 + i)) * 20, 1.5, t, i); } c.globalAlpha = 1; } };

/* ---------- drain: a hit, then orbs of life float back to the user ---------- */
ANIM.drain = { C: 380, D: 1120,
  atk: t => ({ f: 0, pose: t < 200 ? 'cast' : t < 1000 ? 'push' : 'idle' }),
  def: t => t > 380 && t < 900 ? { pose: 'hurt' } : null,
  fx(c, t, x) { const a = x.self, b = x.target, col = x.el === 'Shade' ? [170, 110, 255] : x.el === 'Venom' ? [190, 255, 140] : [140, 240, 120];
    if (t < 380) { const p = lerpP(x.from[0], b, ei(Math.max(0, t - 120) / 260), 10); orb(c, p, x, t, 0.5); return; }
    if (t < 600) blast(c, b, (t - 380) / 220, { ...x, pw: 0.7 });
    for (let i = 0; i < 8; i++) { const k = (t - 420 - i * 55) / 460; if (k < 0 || k > 1) continue; const p = lerpP(b, a, eio(k), 30 + (i % 3) * 14, (i % 2 ? 1 : -1) * 12);
      c.save(); c.shadowColor = rgbS(col, 0.9); c.shadowBlur = 10; c.fillStyle = rgbS(col, 0.95); c.beginPath(); c.arc(p.x, p.y, 4.5, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(p.x - 1.2, p.y - 1.2, 1.4, 0, 7); c.fill(); c.restore(); }
    if (t > 800) psyAura(c, a, t, Math.min(1, (1120 - t) / 200) * 0.8, 0, col); } };

/* ---------- mist: a cloud drifts over and swirls around the target ---------- */
ANIM.mist = { C: 560, D: 1150,
  atk: t => ({ f: 0, pose: t < 220 ? 'cast' : t < 800 ? 'push' : 'idle' }),
  def: t => t > 560 && t < 1050 ? { pose: 'hurt' } : null,
  fx(c, t, x) { const a = x.from[0], b = x.target, col = x.el === 'Charm' ? [255, 170, 210] : x.el === 'Venom' ? [160, 110, 210] : x.col, k = Math.min(1, Math.max(0, (t - 180) / 380)), A = Math.min(1, (1150 - t) / 220);
    for (let i = 0; i < 9; i++) { const ang = t / 260 + i * 0.7, spread = 10 + 30 * k, p = lerpP(a, b, eio(k), 20);
      c.save(); c.globalAlpha = 0.55 * A; c.fillStyle = rgbS(col, 1); c.beginPath(); c.arc(p.x + Math.cos(ang) * spread, p.y + Math.sin(ang) * spread * 0.6, 12 + (i % 3) * 5, 0, 7); c.fill(); c.restore(); }
    if (t > 560) for (let i = 0; i < 6; i++) { c.globalAlpha = A; if (x.el === 'Charm') { c.save(); c.fillStyle = '#ffffff'; c.font = '700 14px system-ui'; c.fillText(i % 2 ? '♪' : '♫', b.x - 30 + i * 12, b.y - 30 - ((t / 6 + i * 20) % 40)); c.restore(); }
      else ePart(c, x.el || 'Venom', b.x - 30 + i * 12, b.y - 10 - ((t / 8 + i * 17) % 50), 1.6, t, i); }
    c.globalAlpha = 1; } };

/* ---------- support skills ---------- */
function arrowsFx(c, p, t, up, col, a) {
  c.save(); c.globalAlpha = a; c.fillStyle = rgbS(col, 0.9); c.shadowColor = rgbS(col, 0.9); c.shadowBlur = 8;
  for (let i = 0; i < 6; i++) { const k = ((t / 700) + i / 6) % 1, x = p.x - 30 + (i * 13) % 60, y = up ? p.foot - 10 - k * 80 : p.y - 50 + k * 80;
    c.globalAlpha = a * Math.sin(k * Math.PI); c.save(); c.translate(x, y); if (!up) c.scale(1, -1);
    c.scale(1.6, 1.6); c.beginPath(); c.moveTo(0, -8); c.lineTo(6, 0); c.lineTo(2, 0); c.lineTo(2, 7); c.lineTo(-2, 7); c.lineTo(-2, 0); c.lineTo(-6, 0); c.closePath(); c.fill(); c.restore(); }
  c.restore();
}
function shieldFx(c, p, t, a, style) {
  const w = (p.r || 40) * 1.5, h = (p.foot - p.top.y) * 1.25 + 20, cx = p.x, cy = p.foot - h * 0.45;
  const col = style === 'ice' ? [180, 230, 255] : style === 'rock' ? [200, 160, 110] : style === 'steel' ? [200, 210, 225] : style === 'mirror' ? [255, 200, 240] : style === 'shell' ? [255, 140, 110] : [130, 200, 255];
  c.save(); c.globalAlpha = a;
  const g = c.createRadialGradient(cx, cy, w * 0.3, cx, cy, w); g.addColorStop(0, rgbS(col, 0.05)); g.addColorStop(1, rgbS(col, 0.35)); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, w, h * 0.6, 0, 0, 7); c.fill();
  c.strokeStyle = rgbS(col, 0.9); c.lineWidth = 2.5; c.beginPath(); c.ellipse(cx, cy, w, h * 0.6, 0, 0, 7); c.stroke();
  c.lineWidth = 1; c.strokeStyle = rgbS(col, 0.5);                // a hex pattern on the bubble
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const hx = cx + i * w * 0.36 + (j % 2) * w * 0.18, hy = cy + j * h * 0.18; if (((hx - cx) / w) ** 2 + ((hy - cy) / (h * 0.6)) ** 2 > 0.8) continue;
    c.beginPath(); for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; c.lineTo(hx + Math.cos(an) * w * 0.17, hy + Math.sin(an) * w * 0.17); } c.closePath(); c.stroke(); }
  const sweep = ((t / 500) % 1); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, w, h * 0.6, 0, -2.4 + sweep * 3, -2.0 + sweep * 3); c.stroke();
  if (style === 'ice' || style === 'rock') for (let i = 0; i < 6; i++) { const an = i * 1.05 + t / 900; ePart(c, style === 'ice' ? 'Frost' : 'Stone', cx + Math.cos(an) * w, cy + Math.sin(an) * h * 0.6, 2, t, i); }
  c.restore();
}
function sparkleUp(c, p, t, a, col) {
  for (let i = 0; i < 10; i++) { const k = ((t / 800) + i / 10) % 1, x = p.x - 32 + (i * 17) % 64, y = p.foot - 6 - k * 90;
    c.save(); c.globalAlpha = a * Math.sin(k * Math.PI); c.fillStyle = rgbS(col, 1); c.shadowColor = rgbS(col, 0.9); c.shadowBlur = 8;
    if (i % 3 === 0) { c.fillRect(x - 1.5, y - 6, 3, 12); c.fillRect(x - 6, y - 1.5, 12, 3); } else ePart(c, 'Light', x, y, 1.5, t, i); c.restore(); }
}
function fieldFx(c, x, t, a) {
  const f = typeof SKILLS !== 'undefined' && SKILLS[x.name] ? SKILLS[x.name].field : '', W = x.W, H = x.H;
  c.save(); c.globalAlpha = a;
  if (f === 'Sunlit') { const g = c.createRadialGradient(W * 0.85, -20, 10, W * 0.85, -20, W); g.addColorStop(0, 'rgba(255,240,170,.7)'); g.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,240,180,.5)'; c.lineWidth = 10; for (let i = 0; i < 6; i++) { const an = 1.9 + i * 0.16 + Math.sin(t / 400) * 0.03; c.beginPath(); c.moveTo(W * 0.85, -20); c.lineTo(W * 0.85 + Math.cos(an) * W * 1.2, -20 + Math.sin(an) * W * 1.2); c.stroke(); } }
  else if (f === 'Rain') { c.fillStyle = 'rgba(40,60,110,.25)'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(190,220,255,.8)'; c.lineWidth = 1.5;
    for (let i = 0; i < 60; i++) { const x0 = (i * 37 + t * 0.4) % (W + 40) - 20, y0 = (i * 53 + t * 0.9) % H; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 - 4, y0 + 14); c.stroke(); } }
  else if (f === 'Snow') { c.fillStyle = 'rgba(220,235,255,.18)'; c.fillRect(0, 0, W, H); for (let i = 0; i < 50; i++) ePart(c, 'Frost', (i * 37 + t * 0.06 * (1 + i % 3)) % W, (i * 53 + t * 0.12) % H, 1.6, t, i); }
  else if (f === 'Static') { c.fillStyle = 'rgba(255,240,120,.08)'; c.fillRect(0, 0, W, H); for (let i = 0; i < 18; i++) { if ((t / 60 + i) % 4 < 2) ePart(c, 'Spark', (i * 61 + t * 0.2) % W, H * 0.45 + (i * 29) % (H * 0.5), 3, t, i); } }
  else if (f === 'Moonlit') { c.fillStyle = 'rgba(20,16,60,.35)'; c.fillRect(0, 0, W, H); c.fillStyle = '#f4f1d6'; c.beginPath(); c.arc(W * 0.82, H * 0.14, 18, 0, 7); c.fill();
    c.fillStyle = 'rgba(20,16,60,1)'; c.beginPath(); c.arc(W * 0.82 + 8, H * 0.14 - 4, 15, 0, 7); c.fill(); }
  c.restore();
}
const SUP = (kind, D, fx, atk) => ({ C: Math.round(D * 0.75), D, atk: atk || (t => ({ f: 0, pose: t < D - 150 ? 'cast' : 'idle' })), fx });
ANIM.buff = SUP('buff', 900, (c, t, x) => { const a = Math.min(1, t / 150) * Math.min(1, (900 - t) / 200); psyAura(c, x.self, t, a * 0.8, 0, [255, 150, 80]); arrowsFx(c, x.self, t, true, [255, 120, 70], a); });
ANIM.debuff = SUP('debuff', 900, (c, t, x) => { const a = Math.min(1, t / 150) * Math.min(1, (900 - t) / 200); arrowsFx(c, x.target, t, false, [90, 150, 255], a); });
ANIM.heal = SUP('heal', 1000, (c, t, x) => { const a = Math.min(1, t / 150) * Math.min(1, (1000 - t) / 200); psyAura(c, x.self, t, a * 0.7, 0, [140, 240, 150]); sparkleUp(c, x.self, t, a, [170, 255, 170]); });
ANIM.shield = SUP('shield', 950, (c, t, x) => { const n = x.name || '', st = /Frost/.test(n) ? 'ice' : /Shard|Harden/.test(n) ? 'rock' : /Iron|Polish|Bulwark/.test(n) ? 'steel' : /Mirror/.test(n) ? 'mirror' : 'bubble';
  shieldFx(c, x.self, t, Math.min(1, t / 160) * Math.min(1, (950 - t) / 220), st); }, t => ({ f: 0, pose: t < 800 ? 'guard' : 'idle' }));
ANIM.bunker = SUP('bunker', 1000, (c, t, x) => { const a = Math.min(1, t / 160) * Math.min(1, (1000 - t) / 220); shieldFx(c, x.self, t, a, 'shell');
  if (t > 200 && t < 400) dust(c, x.self, (t - 200) / 200); },
  t => ({ f: 0, pose: 'guard', sy: t < 180 ? 1 - 0.22 * eo(t / 180) : t < 850 ? 0.78 : 0.78 + 0.22 * eo((t - 850) / 150), sx: t < 850 ? 1.08 : 1 }));
ANIM.glare = SUP('glare', 900, (c, t, x) => { const eyes = x.from, b = x.target, a = Math.min(1, t / 120) * Math.min(1, (900 - t) / 200);
  c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(255,90,90,.8)'; c.lineWidth = 3; c.shadowColor = 'rgba(255,60,60,.9)'; c.shadowBlur = 10;
  for (const o of eyes) { c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(b.x, b.y - 10); c.stroke(); } c.restore(); arrowsFx(c, b, t, false, [90, 150, 255], a); });
ANIM.phase = SUP('phase', 1000, (c, t, x) => { for (let i = 0; i < 8; i++) { const k = ((t / 600) + i / 8) % 1; c.globalAlpha = 0.6 * (1 - k); ePart(c, 'Shade', x.self.x - 30 + (i * 17) % 60, x.self.foot - 10 - k * 70, 2, t, i); } c.globalAlpha = 1; },
  t => ({ f: 0, pose: 'float', alpha: 0.25 + 0.75 * Math.abs(Math.cos(t / 90)), off: [Math.sin(t / 40) * 6, 0] }));
ANIM.field = SUP('field', 1000, (c, t, x) => fieldFx(c, x, t, Math.min(1, t / 150) * Math.min(1, (1000 - t) / 250)), t => ({ f: 0, pose: t < 800 ? 'slamup' : 'idle' }));
ANIM.gather = SUP('gather', 800, (c, t, x) => { const p = x.self, a = Math.min(1, (800 - t) / 150);
  for (let i = 0; i < 20; i++) { const k = ((t / 450) + i / 20) % 1, ang = i * 2.4, d = 90 * (1 - k); c.globalAlpha = a * k; ePart(c, x.el || 'Brawl', p.x + Math.cos(ang) * d, p.y + Math.sin(ang) * d * 0.7, 2.6, t, i); }
  const g = c.createRadialGradient(p.x, p.y, 4, p.x, p.y, 60); g.addColorStop(0, rgbS(x.col, 0.45 * a * Math.min(1, t / 400))); g.addColorStop(1, rgbS(x.col, 0)); c.globalAlpha = 1; c.fillStyle = g; c.fillRect(p.x - 60, p.y - 60, 120, 120);
  psyAura(c, p, t, a, 0, x.col); });
ANIM.takeoff = SUP('takeoff', 700, (c, t, x) => { if (t < 300) dust(c, x.self, t / 300); }, t => ({ f: 0, pose: 'jump', lift: -280 * ei(Math.min(1, t / 500)) }));
ANIM.mistcast = { ...ANIM.mist };

/* which support effect a non-damage skill plays */
function supportKind(n, charge) {
  const s = typeof SKILLS !== 'undefined' && SKILLS[n]; if (!s) return 'buff';
  if (charge) return n === 'Fly' ? 'takeoff' : 'gather';
  if (n === 'Bunker Down') return 'bunker'; if (n === 'Glare') return 'glare'; if (s.afterimage) return 'phase';
  if (s.field) return 'field'; if (s.inflict) return 'mistcast';
  if (s.heal || s.regen || s.rest || s.cleanse) return 'heal';
  if (s.protect || s.counter || s.mirror || s.castWard || s.bulwark || s.endure || s.statusBlock || s.raise && Object.keys(s.raise).every(k => k === 'grd' || k === 'spr')) return 'shield';
  if (s.lower || s.taunt || s.erase) return 'debuff';
  return 'buff';
}
/* a cast event: plays the support effect and says how long to wait before the battle moves on */
function chibiSupport(e) {
  const st = CB.side[e.who]; if (!st || !e.name) return 0;
  const kind = supportKind(e.name, e.charge), A = ANIM[kind]; if (!A) return 0;
  CB.anim = { who: e.who, kind, t0: CB.te, el: e.el, name: e.name, src: 'eyes', pw: 1, col: e.el ? hexRgb(typeof ELC === 'function' ? ELC(e.el) : '#a070ff') : [255, 214, 90] };
  if (kind === 'takeoff') st.sky = true;
  if (kind === 'mistcast') CB.anim.kind = 'mist';
  sfx(kind === 'buff' || kind === 'heal' || kind === 'gather' ? 'charge' : 'whoosh');
  return Math.round(A.D * 0.85);
}
