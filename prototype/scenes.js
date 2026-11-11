/* Smooth backgrounds for the chibi art: the battle arenas (wild field and cup stadium) and the ranch yard.
   They draw at full screen resolution on a layer under the game's own canvas, and only when the chibi art is on.
   Same build as the monsters: flat shapes, a darker copy a little lower for depth, one soft highlight. */

const SC = {
  rng(seed) { let r = seed; return () => (r = (r * 9301 + 49297) % 233280) / 233280; },
  mix(a, b, k) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); },
  dark: (h, k = 0.22) => SC.mix(h, '#1a1426', k),
  light: (h, k = 0.3) => SC.mix(h, '#ffffff', k),
  // fill a shape twice: a darker copy dy lower, then the shape itself
  depth(c, path, col, dy = 3, dk = 0.25) { c.save(); c.translate(0, dy); path(); c.fillStyle = SC.dark(col, dk); c.fill(); c.restore(); path(); c.fillStyle = col; c.fill(); },
  blob(c, x, y, rs) { c.beginPath(); for (const [dx, dy, r] of rs) { c.moveTo(x + dx + r, y + dy); c.arc(x + dx, y + dy, r, 0, 7); } },
  cloud(c, x, y, s, a = 1) {
    c.save(); c.globalAlpha = a; const rs = [[-1.1, 0.2, 0.62], [-0.35, -0.25, 0.85], [0.55, -0.05, 0.7], [1.2, 0.3, 0.5], [0, 0.35, 0.7]].map(([dx, dy, r]) => [dx * s, dy * s, r * s]);
    SC.depth(c, () => SC.blob(c, x, y, rs), '#ffffff', s * 0.14, 0.12); c.restore(); },
  tuft(c, x, y, s, col) { c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = Math.max(1, s * 0.32);
    c.beginPath(); c.moveTo(x - s * 0.5, y); c.quadraticCurveTo(x - s * 0.55, y - s * 0.6, x - s * 0.95, y - s * 1.0);
    c.moveTo(x, y); c.quadraticCurveTo(x, y - s * 0.8, x + s * 0.1, y - s * 1.35);
    c.moveTo(x + s * 0.5, y); c.quadraticCurveTo(x + s * 0.55, y - s * 0.6, x + s * 0.95, y - s * 0.9); c.stroke(); },
  flower(c, x, y, s, col) { c.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i * 1.2566; c.beginPath(); c.arc(x + Math.cos(a) * s * 0.6, y + Math.sin(a) * s * 0.6, s * 0.55, 0, 7); c.fill(); }
    c.fillStyle = '#ffd34a'; c.beginPath(); c.arc(x, y, s * 0.45, 0, 7); c.fill(); },
  // rolling hill line across the width, filled down to y1
  hills(c, W, y0, y1, amp, wl, ph, col) { c.beginPath(); c.moveTo(0, y1);
    for (let x = 0; x <= W + 8; x += 8) c.lineTo(x, y0 - Math.sin(x / wl + ph) * amp - Math.sin(x / (wl * 0.43) + ph * 2) * amp * 0.35);
    c.lineTo(W, y1); c.closePath(); c.fillStyle = col; c.fill(); },
  // a soft dirt or sand patch for a monster to stand on
  patch(c, x, y, w, col) { const h = w * 0.2, g = c.createRadialGradient(x, y, h * 0.1, x, y, w / 2);
    g.addColorStop(0, col); g.addColorStop(0.7, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.translate(x, y); c.scale(1, h / w); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, w / 2, 0, 7); c.fill(); c.restore();
    c.fillStyle = 'rgba(40,24,10,.22)'; c.beginPath(); c.ellipse(x, y - h * 0.05, w * 0.3, h * 0.22, 0, 0, 7); c.fill(); },
};

/* ---------- battle arena ---------- */
const STAND_SOFT = ['#ff9b9b', '#ffd77a', '#9ad9ff', '#bff29a', '#e3b2ff', '#ffbf96', '#f6f1e4'];
const BANNER_SOFT = ['#9ad28a', '#7cc7e8', '#c9a7f2', '#f2b36b', '#ff8f8f', '#ffc93c'];
function arenaScene(c, W, H, cup, homes, now, cheer) {
  const hz = H * 0.3;                      // horizon: the CSS layout puts the far monster's feet just under half way
  if (cup) {
    const g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#1d1638'); g.addColorStop(1, '#3a2a5c'); c.fillStyle = g; c.fillRect(0, 0, W, hz + 2);
    // lamps
    for (const lx of [W * 0.1, W * 0.9]) { const rg = c.createRadialGradient(lx, hz * 0.1, 2, lx, hz * 0.1, hz * 0.9);
      rg.addColorStop(0, 'rgba(255,240,190,.55)'); rg.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, hz);
      SC.depth(c, () => { c.beginPath(); c.roundRect(lx - 14, hz * 0.04, 28, 9, 4); }, '#fff3c4', 2, 0.35); }
    c.globalAlpha = 1;
    // crowd rows: round heads that hop when they cheer
    const rows = 4, top = hz * 0.26, rowH = (hz * 0.74 - 14) / rows, R = SC.rng(7), hr = Math.max(3, rowH * 0.3);
    for (let r = 0; r < rows; r++) {
      const y = top + r * rowH + rowH * 0.62;
      c.fillStyle = r % 2 ? '#2b2149' : '#30254f'; c.fillRect(0, y - rowH * 0.15, W, rowH * 0.62);
      for (let x = (r % 2 ? hr * 1.3 : 0) + hr; x < W + hr; x += hr * 2.6) {
        const col = STAND_SOFT[Math.floor(R() * STAND_SOFT.length)], ph = R() * 6.28, hop = (Math.sin(now / 180 + ph) > (cheer ? -0.2 : 0.85) ? 1 : 0) * hr * (cheer ? 0.9 : 0.45);
        c.fillStyle = SC.dark(col, 0.45); c.beginPath(); c.ellipse(x, y + hr * 0.9 - hop, hr * 1.05, hr * 0.7, 0, Math.PI, 0); c.fill();
        c.fillStyle = col; c.beginPath(); c.arc(x, y - hop, hr * 0.78, 0, 7); c.fill(); }
    }
    // banners along the wall
    const bw = (W - 16) / 6;
    for (let k = 0; k < 6; k++) SC.depth(c, () => { c.beginPath(); c.roundRect(8 + k * bw + 2, hz - 12, bw - 4, 10, 4); }, BANNER_SOFT[k], 2, 0.3);
    // sand floor with a painted ring
    const f = c.createLinearGradient(0, hz, 0, H); f.addColorStop(0, '#d8ab6a'); f.addColorStop(1, '#c08b4e'); c.fillStyle = f; c.fillRect(0, hz, W, H - hz);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, hz, W, 3);
    const Rs = SC.rng(3); c.fillStyle = 'rgba(120,80,40,.18)';
    for (let i = 0; i < 70; i++) { const y = hz + 6 + Rs() * (H - hz - 8), s = 0.6 + (y - hz) / (H - hz) * 1.6; c.beginPath(); c.ellipse(Rs() * W, y, s * 1.6, s * 0.8, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(255,236,196,.55)'; c.lineWidth = 3; c.beginPath(); c.ellipse(W / 2, hz + (H - hz) * 0.5, W * 0.4, (H - hz) * 0.3, 0, 0, 7); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 - W * 0.06, hz + (H - hz) * 0.5); c.lineTo(W / 2 + W * 0.06, hz + (H - hz) * 0.5); c.stroke();
    homes.forEach((h, i) => h && SC.patch(c, h.x, h.y + 2, h.size * (i ? 0.95 : 1.05), '#e2bd84'));
  } else {
    const g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#79bdf0'); g.addColorStop(1, '#cdebff'); c.fillStyle = g; c.fillRect(0, 0, W, hz + 2);
    const sun = c.createRadialGradient(W * 0.82, hz * 0.28, 2, W * 0.82, hz * 0.28, hz * 0.5); sun.addColorStop(0, 'rgba(255,250,215,1)'); sun.addColorStop(0.25, 'rgba(255,245,190,.9)'); sun.addColorStop(1, 'rgba(255,245,190,0)');
    c.fillStyle = sun; c.fillRect(0, 0, W, hz);
    const drift = (now / 900) % (W + 200);
    SC.cloud(c, (W * 0.18 + drift * 0.3) % (W + 120) - 60, hz * 0.32, hz * 0.17, 0.95);
    SC.cloud(c, (W * 0.62 + drift * 0.18) % (W + 120) - 60, hz * 0.5, hz * 0.12, 0.85);
    SC.hills(c, W, hz * 0.86, hz + 4, hz * 0.12, W / 5, 1, '#9fcf8c');
    SC.hills(c, W, hz * 0.98, hz + 4, hz * 0.07, W / 3.4, 3, '#86c174');
    const f = c.createLinearGradient(0, hz, 0, H); f.addColorStop(0, '#78c05c'); f.addColorStop(1, '#58a447'); c.fillStyle = f; c.fillRect(0, hz, W, H - hz);
    // mown stripes running toward the horizon
    c.fillStyle = 'rgba(255,255,255,.06)'; const vx = W / 2, n = 9;
    for (let i = 0; i < n; i += 2) { const a = -W * 0.9 + i * (W * 2.8 / n), b = a + W * 2.8 / n;
      c.beginPath(); c.moveTo(vx + (a - vx) * 0.12, hz); c.lineTo(vx + (b - vx) * 0.12, hz); c.lineTo(b, H); c.lineTo(a, H); c.closePath(); c.fill(); }
    const R = SC.rng(5);
    for (let i = 0; i < 46; i++) { const y = hz + 6 + Math.pow(R(), 0.8) * (H - hz - 6), s = 2 + (y - hz) / (H - hz) * 6, x = R() * W;
      if (homes.some(h => h && Math.abs(x - h.x) < h.size * 0.5 && Math.abs(y - h.y) < h.size * 0.14)) continue;
      if (i % 7 === 3) SC.flower(c, x, y - s * 0.6, s * 0.38, ['#ffffff', '#ffb3c8', '#fff1a0'][i % 3]); else SC.tuft(c, x, y, s, 'rgba(46,110,40,.55)'); }
    homes.forEach((h, i) => h && SC.patch(c, h.x, h.y + 2, h.size * (i ? 0.95 : 1.05), '#b88a58'));
  }
}
/* called every battle frame: redraws only when the size changes, or when the crowd hops */
function chibiArenaScene(now, homes) {
  const ar = document.getElementById('arena'); if (!ar) return;
  let o = document.getElementById('b-scene');
  if (!o) { o = document.createElement('canvas'); o.id = 'b-scene';
    Object.assign(o.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' }); ar.prepend(o); }
  ar.classList.add('chibi');
  const cup = ar.classList.contains('cup'), r = ar.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  const cheer = CB.lastHit && CB.lastHit.tier === 'heavy' && CB.te - CB.lastHit.te < 900;
  const key = [W, H, cup, cup ? Math.floor(now / 90) : Math.floor(now / 250), cheer, homes.map(h => h && Math.round(h.x) + ',' + Math.round(h.y)).join()].join('|');
  if (o.dataset.key === key) return; o.dataset.key = key;
  if (o.width !== W) o.width = W; if (o.height !== H) o.height = H;
  const c = o.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  arenaScene(c, r.width, r.height, cup, homes, now, cheer);
}

/* ---------- ranch yard ---------- */
const YARD = {
  ground: ['#86c95f', '#69b64c', '#c9a050', '#e8eef4'], hill: ['#5fa653', '#4c9845', '#a7843f', '#c7d4e0'], far: ['#9fd08c', '#8cc87e', '#d4b06c', '#dbe5ee'],
  leaf: ['#62bb5f', '#47a346', '#e08a34', null],
};
function chibiYard(s, t, cv) {
  const fr = document.getElementById('r-frame'); if (!fr) return false;
  let o = document.getElementById('r-scene');
  if (!o) { o = document.createElement('canvas'); o.id = 'r-scene';
    Object.assign(o.style, { position: 'absolute', inset: '2px', width: 'calc(100% - 4px)', height: 'calc(100% - 4px)', pointerEvents: 'none', borderRadius: 'var(--r)' }); fr.prepend(o); }
  o.style.display = '';
  const r = o.getBoundingClientRect(), dpr = devicePixelRatio || 1, W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  if (o.width !== W) o.width = W; if (o.height !== H) o.height = H;
  const c = o.getContext('2d'), k = W / cv.width, room = RW - cv.width, camX = Math.round(clamp(s.camX || 0, 0, room)), extra = s.vExtra || 0;
  c.setTransform(1, 0, 0, 1, 0, 0);
  const season = Math.floor((PLAYER.week % 48) / 12), hr = new Date().getHours(), night = hr < 6 || hr >= 19, dusk = hr >= 17 && hr < 19;
  // sky over the whole layer, including any extra height above the yard
  const sky = night ? ['#0e1330', '#1b2352', '#2b3570'] : dusk ? ['#e9845f', '#f5ad7c', '#ffd8a8'] : ['#6cb8ee', '#9fd3f6', '#d2edff'];
  const g = c.createLinearGradient(0, 0, 0, H * 0.75); sky.forEach((col, i) => g.addColorStop(i / 2, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.setTransform(k, 0, 0, k, -camX * k, extra * k);       // from here on, game pixels: the yard is RW x RH with the ground at GROUND
  const top = -extra;
  if (night) { const R = SC.rng(9); c.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) { const x = R() * RW, y = top + R() * (100 + extra), tw = 0.5 + 0.5 * Math.sin(t / 500 + i * 1.7); c.globalAlpha = 0.35 + 0.65 * tw; c.beginPath(); c.arc(x, y, 0.45 + (i % 3) * 0.2, 0, 7); c.fill(); }
    c.globalAlpha = 1; const mx = 204, my = Math.max(top + 14, 18);
    const hg = c.createRadialGradient(mx, my, 2, mx, my, 22); hg.addColorStop(0, 'rgba(240,240,210,.35)'); hg.addColorStop(1, 'rgba(240,240,210,0)'); c.fillStyle = hg; c.fillRect(mx - 22, my - 22, 44, 44);
    c.save(); c.beginPath(); c.rect(mx - 10, my - 10, 20, 20); c.arc(mx + 3.2, my - 1.8, 5.6, 0, 7, true); c.clip();
    c.fillStyle = '#f4f1d6'; c.beginPath(); c.arc(mx, my, 6.5, 0, 7); c.fill(); c.restore(); }
  else { const sx = 202, sy = Math.max(top + 14, 18), hg = c.createRadialGradient(sx, sy, 2, sx, sy, 26);
    hg.addColorStop(0, dusk ? 'rgba(255,190,110,.7)' : 'rgba(255,250,210,.8)'); hg.addColorStop(1, 'rgba(255,250,210,0)'); c.fillStyle = hg; c.fillRect(sx - 26, sy - 26, 52, 52);
    c.fillStyle = dusk ? '#ffb45a' : '#fff4b0'; c.beginPath(); c.arc(sx, sy, 7.5, 0, 7); c.fill();
    const d = (t / 260) % (RW + 80); SC.cloud(c, (40 + d) % (RW + 80) - 40, 30, 9, 0.95); SC.cloud(c, (150 + d * 0.6) % (RW + 80) - 40, 52, 6.5, 0.8); }
  // hills
  SC.hills(c, RW + 40, 96, GROUND, 6, 30, 2, YARD.far[season]);
  SC.hills(c, RW + 40, 110, GROUND, 5, 21, 0.4, YARD.hill[season]);
  // ground
  const gg = c.createLinearGradient(0, GROUND - 16, 0, RH); gg.addColorStop(0, YARD.ground[season]); gg.addColorStop(1, SC.dark(YARD.ground[season], 0.12));
  c.fillStyle = gg; c.fillRect(-4, GROUND - 16, RW + 8, RH - GROUND + 20);
  c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(-4, GROUND - 16, RW + 8, 1.2);
  if (season !== 3) { const R = SC.rng(13); for (let i = 0; i < 26; i++) { const x = R() * RW, y = GROUND - 12 + R() * 30, s = 1.6 + (y - GROUND + 12) / 30 * 1.6;
    if (i % 6 === 2 && season < 2) SC.flower(c, x, y - 1, 0.9, ['#ffffff', '#ffb3c8', '#fff1a0'][i % 3]); else SC.tuft(c, x, y, s, 'rgba(30,90,30,.35)'); } }
  // fence
  const wood = '#c08f5c';
  for (const yy of [GROUND - 31, GROUND - 23]) SC.depth(c, () => { c.beginPath(); c.roundRect(80, yy, RW - 76, 2.6, 1.3); }, wood, 1, 0.3);
  for (let x = 84; x < RW; x += 16) SC.depth(c, () => { c.beginPath(); c.roundRect(x, GROUND - 36, 3.6, 24, [1.8, 1.8, 0.6, 0.6]); }, wood, 1, 0.3);
  if (season === 3) { c.fillStyle = '#ffffff'; for (let x = 84; x < RW; x += 16) { c.beginPath(); c.ellipse(x + 1.8, GROUND - 36, 2.6, 1.3, 0, 0, 7); c.fill(); } c.fillRect(80, GROUND - 31.8, RW - 76, 1); }
  // tree
  SC.depth(c, () => { c.beginPath(); c.moveTo(213, GROUND - 10); c.lineTo(214.5, GROUND - 52); c.lineTo(219.5, GROUND - 52); c.lineTo(221, GROUND - 10); c.closePath(); }, '#7a4f2e', 1, 0.3);
  const leaf = YARD.leaf[season], crown = [[0, -2, 10], [-9, 4, 8], [9, 4, 8.5], [-4, 9, 8], [5, 10, 7.5]];
  if (leaf) { SC.depth(c, () => SC.blob(c, 217, GROUND - 64, crown), leaf, 2.2, 0.28);
    c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.arc(212, GROUND - 69, 4, 0, 7); c.fill();
    if (season === 0) { const R = SC.rng(4); c.fillStyle = '#ffc6dc'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(203 + R() * 28, GROUND - 74 + R() * 22, 1.1, 0, 7); c.fill(); } }
    if (season === 2) { const R = SC.rng(6); c.fillStyle = '#e8a33c'; for (let i = 0; i < 5; i++) { const fx = 200 + ((t / 30 + i * 47) % 50), fy = GROUND - 60 + ((t / 18 + i * 31) % 50); c.beginPath(); c.ellipse(fx, fy, 1.4, 0.8, t / 300 + i, 0, 7); c.fill(); } } }
  else { c.strokeStyle = '#7a4f2e'; c.lineCap = 'round'; c.lineWidth = 2; c.beginPath(); c.moveTo(217, GROUND - 50); c.lineTo(208, GROUND - 62); c.moveTo(217, GROUND - 52); c.lineTo(226, GROUND - 66); c.moveTo(217, GROUND - 50); c.lineTo(218, GROUND - 68); c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(208, GROUND - 63); c.lineTo(213, GROUND - 57); c.moveTo(226, GROUND - 67); c.lineTo(221, GROUND - 61); c.stroke(); }
  if (season === 3) { c.fillStyle = '#ffffff'; for (let i = 0; i < 26; i++) { const x = (i * 41 + t / 40) % RW, y = top + (i * 23 + t / 25) % (GROUND - top); c.globalAlpha = 0.85; c.beginPath(); c.arc(x, y, 0.7 + (i % 3) * 0.25, 0, 7); c.fill(); } c.globalAlpha = 1; }
  if (!s.bg) { yardHut(c, s, night); yardTala(c, t); }
  const ch = document.getElementById('r-chibi'); if (ch) ch.style.filter = night ? 'brightness(.8) saturate(.88)' : '';
  if (night || dusk) { const tg = c.createLinearGradient(0, 80, 0, 100), tc = night ? '18,24,72' : '255,120,70', ta = night ? 0.42 : 0.12;
    tg.addColorStop(0, `rgba(${tc},0)`); tg.addColorStop(1, `rgba(${tc},${ta})`); c.fillStyle = tg; c.fillRect(-4, 80, RW + 8, RH - 76); }
  if (night && !s.bg) { const x = 4, top = GROUND - 40, hg = c.createRadialGradient(x + 7.5, top + 23.5, 1, x + 7.5, top + 23.5, 13);
    hg.addColorStop(0, 'rgba(255,214,120,.55)'); hg.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = hg; c.fillRect(x - 6, top + 10, 28, 28);
    c.fillStyle = '#ffd877'; c.beginPath(); c.roundRect(x + 3.5, top + 20, 8, 7, 1.5); c.fill(); }
  return true;
}
function yardHut(c, s, night) {
  const x = 4, w = 40, top = GROUND - 40;
  SC.depth(c, () => { c.beginPath(); c.roundRect(x, top + 12, w, 28, 2); }, '#c98b57', 1.5, 0.25);
  c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = top + 17; y < GROUND - 2; y += 5) c.fillRect(x + 1, y, w - 2, 0.8);
  SC.depth(c, () => { c.beginPath(); c.moveTo(x - 4, top + 14); c.quadraticCurveTo(x + w / 2, top - 6, x + w + 4, top + 14); c.lineTo(x + w + 4, top + 16); c.lineTo(x - 4, top + 16); c.closePath(); }, '#b24e3a', 2, 0.3);
  c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(x + 12, top + 6, 6, 1.6, -0.35, 0, 7); c.fill();
  SC.depth(c, () => { c.beginPath(); c.roundRect(x + 14, top + 22, 12, 18, [3, 3, 0, 0]); }, s.hidden ? '#5a3a28' : '#5b3824', 0, 0);
  c.fillStyle = '#e8c070'; c.beginPath(); c.arc(x + 23.5, top + 32, 0.9, 0, 7); c.fill();
  const win = night ? '#ffd877' : '#bfe4ff';
  SC.depth(c, () => { c.beginPath(); c.roundRect(x + 3.5, top + 20, 8, 7, 1.5); }, win, 1, 0.3);
  // bowl
  SC.depth(c, () => { c.beginPath(); c.moveTo(BOWLX, GROUND - 4.5); c.lineTo(BOWLX + 12, GROUND - 4.5); c.quadraticCurveTo(BOWLX + 11, GROUND, BOWLX + 6, GROUND); c.quadraticCurveTo(BOWLX + 1, GROUND, BOWLX, GROUND - 4.5); c.closePath(); }, '#e0533f', 1, 0.3);
  const bowl = s.props.find(p => p.k === 'bowl');
  if (bowl && bowl.food) { c.fillStyle = bowl.food; c.beginPath(); c.ellipse(BOWLX + 6, GROUND - 4.8, 5.4, 1.8, 0, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(BOWLX + 3.5, GROUND - 3, 1.6, 0.7, 0, 0, 7); c.fill();
}
/* Tala, the ranch assistant: a small chibi person standing by the hut */
function yardTala(c, t) {
  const x = HELPX + 4, y = GROUND, b = Math.sin(t / 420) * 0.35;
  c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(x, y, 5, 1.2, 0, 0, 7); c.fill();
  c.strokeStyle = '#2f2a3a'; c.lineCap = 'round'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 1.6, y - 6); c.lineTo(x - 1.8, y - 0.8); c.moveTo(x + 1.6, y - 6); c.lineTo(x + 1.8, y - 0.8); c.stroke();
  SC.depth(c, () => { c.beginPath(); c.roundRect(x - 4.2, y - 14 + b, 8.4, 9, 3); }, '#4a86d8', 1, 0.3);
  c.strokeStyle = '#f2c68c'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x - 4, y - 12 + b); c.lineTo(x - 5.4, y - 7.5 + b); c.moveTo(x + 4, y - 12 + b); c.lineTo(x + 5.4, y - 7.5 + b); c.stroke();
  SC.depth(c, () => { c.beginPath(); c.arc(x, y - 19 + b, 5.6, 0, 7); }, '#f6cf98', 1, 0.25);
  c.fillStyle = '#4a2c1a'; c.beginPath(); c.arc(x, y - 20.2 + b, 5.9, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(x + 4.6, y - 18 + b, 1.6, 3.4, -0.3, 0, 7); c.fill();
  c.fillStyle = '#2a1e2e'; c.beginPath(); c.arc(x - 1.9, y - 18.2 + b, 0.85, 0, 7); c.arc(x + 1.9, y - 18.2 + b, 0.85, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,120,140,.45)'; c.beginPath(); c.arc(x - 3.3, y - 16.6 + b, 1, 0, 7); c.arc(x + 3.3, y - 16.6 + b, 1, 0, 7); c.fill();
}
