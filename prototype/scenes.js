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
const SPEC_KINDS = ['person', 'person', 'box', 'round', 'tall'];
/* one spectator at (X,Y) feet, k its size: a person or a little monster; wave puts its arms up */
function spectator(x, X, Y, k, kind, col, wave) {
  x.save(); x.translate(X, Y); x.scale(k, k);
  const arms = wave ? -1 : 0.2;
  x.strokeStyle = SC.dark(col, 0.15); x.lineWidth = 3; x.lineCap = 'round';
  if (kind === 'person') { x.beginPath(); x.moveTo(-6, -10); x.lineTo(-11, -10 + arms * 12); x.moveTo(6, -10); x.lineTo(11, -10 + arms * 12); x.stroke();
    SC.depth(x, () => { x.beginPath(); x.roundRect(-7, -14, 14, 14, 5); }, col, 1.5, 0.35); SC.depth(x, () => { x.beginPath(); x.arc(0, -21, 7, 0, 7); }, '#f6cf98', 1.2, 0.2);
    x.fillStyle = ['#5a3420', '#2a2230', '#c98a3a', '#7a3a2a'][Math.floor(Math.abs(X * 7 + Y)) % 4]; x.beginPath(); x.arc(0, -23, 7.3, Math.PI, 0); x.fill(); }
  else if (kind === 'box') { x.beginPath(); x.moveTo(-9, -8); x.lineTo(-14, -8 + arms * 10); x.moveTo(9, -8); x.lineTo(14, -8 + arms * 10); x.stroke();
    SC.depth(x, () => { x.beginPath(); x.roundRect(-10, -20, 20, 18, 6); }, col, 1.5, 0.3); }
  else if (kind === 'round') { SC.depth(x, () => { x.beginPath(); x.ellipse(0, -11, 10, 11, 0, 0, 7); }, col, 1.5, 0.3);
    if (wave) { x.beginPath(); x.moveTo(-9, -12); x.lineTo(-13, -20); x.moveTo(9, -12); x.lineTo(13, -20); x.stroke(); } }
  else { SC.depth(x, () => { x.beginPath(); x.roundRect(-7, -30, 14, 22, 7); }, col, 1.5, 0.3); x.beginPath(); x.moveTo(-3, -9); x.lineTo(-4, 0); x.moveTo(3, -9); x.lineTo(4, 0); x.stroke(); }
  const ey = kind === 'person' ? -21 : kind === 'tall' ? -23 : -12;
  x.fillStyle = '#2a1e2e'; x.beginPath(); x.ellipse(-3, ey, 1.5, 1.9, 0, 0, 7); x.ellipse(3, ey, 1.5, 1.9, 0, 0, 7); x.fill();
  x.restore();
}
function arenaScene(c, W, H, cup, homes, now, cheer) {
  const hz = H * 0.3;                      // horizon: the CSS layout puts the far monster's feet just under half way
  if (cup) {
    const g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#1d1638'); g.addColorStop(1, '#3a2a5c'); c.fillStyle = g; c.fillRect(0, 0, W, hz + 2);
    // lamps
    for (const lx of [W * 0.1, W * 0.9]) { const rg = c.createRadialGradient(lx, hz * 0.1, 2, lx, hz * 0.1, hz * 0.9);
      rg.addColorStop(0, 'rgba(255,240,190,.55)'); rg.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, hz);
      SC.depth(c, () => { c.beginPath(); c.roundRect(lx - 14, hz * 0.04, 28, 9, 4); }, '#fff3c4', 2, 0.35); }
    c.globalAlpha = 1;
    // the crowd: people and little monsters in three rows, a few waving, all of them on their feet after a big hit
    const rows = 3, top = hz * 0.2, rowH = (hz * 0.8 - 12) / rows, R = SC.rng(21);
    for (let r = 0; r < rows; r++) {
      const y = top + (r + 1) * rowH, k = hz / 120 * (0.62 + r * 0.14);
      c.fillStyle = r % 2 ? '#2b2149' : '#33285a'; c.fillRect(0, y - 3 * k, W, 6 * k);
      for (let x = 6 + (r % 2) * 10 * k; x < W + 10; x += 22 * k + R() * 6 * k) {
        const kind = SPEC_KINDS[Math.floor(R() * SPEC_KINDS.length)], kk = k * (0.8 + R() * 0.45), ph = R() * 6.28, col = STAND_SOFT[Math.floor(R() * STAND_SOFT.length)];
        const wave = cheer ? R() > 0.15 : Math.sin(now / 900 + ph) > 0.82, hop = cheer && Math.sin(now / 120 + ph) > 0 ? 2.5 * kk : 0;
        spectator(c, x, y - hop, kk, kind, col, wave); }
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

/* ---------- the ranch: three screens side by side ----------
   World x runs from -RW to 2*RW in ranch pixels: the barn on the left screen, the yard (the old 0..RW) in the middle,
   the training ground on the right. 48 px is a metre, so the fence is 1 m and the barn door 2.3 m.
   s.cam = { L: world x at the left edge, Z: zoom, extra: canvas rows above the old 180-row yard } comes from ranch.js. */
const YARD = {
  ground: ['#86c95f', '#69b64c', '#c9a050', '#e8eef4'], hill: ['#5fa653', '#4c9845', '#a7843f', '#c7d4e0'], far: ['#9fd08c', '#8cc87e', '#d4b06c', '#dbe5ee'],
  leaf: ['#62bb5f', '#47a346', '#e08a34', null],
};
const RANCH_W0 = () => -RW, RANCH_W1 = () => 2 * RW;
function chibiYard(s, t, cv) {
  const fr = document.getElementById('r-frame'); if (!fr || !s.cam) return false;
  let o = document.getElementById('r-scene');
  if (!o) { o = document.createElement('canvas'); o.id = 'r-scene';
    Object.assign(o.style, { position: 'absolute', inset: '2px', width: 'calc(100% - 4px)', height: 'calc(100% - 4px)', pointerEvents: 'none', borderRadius: 'var(--r)' }); fr.prepend(o); }
  o.style.display = '';
  const r = o.getBoundingClientRect(), dpr = devicePixelRatio || 1, W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  if (o.width !== W) o.width = W; if (o.height !== H) o.height = H;
  const c = o.getContext('2d'), k = W / cv.width, { L, Z, extra } = s.cam, vw = cv.width, vh = cv.height;
  const season = Math.floor((PLAYER.week % 48) / 12), hr = new Date().getHours(), night = hr < 6 || hr >= 19, dusk = hr >= 17 && hr < 19;
  const G = GROUND + extra;                                           // the ground line in canvas rows
  // sky and everything far away is drawn in canvas pixels, with parallax
  c.setTransform(k, 0, 0, k, 0, 0);
  const sky = night ? ['#0e1330', '#1b2352', '#2b3570'] : dusk ? ['#e9845f', '#f5ad7c', '#ffd8a8'] : ['#6cb8ee', '#9fd3f6', '#d2edff'];
  const g = c.createLinearGradient(0, 0, 0, G); sky.forEach((col, i) => g.addColorStop(i / 2, col)); c.fillStyle = g; c.fillRect(0, 0, vw, vh);
  if (night) { const R = SC.rng(9); c.fillStyle = '#ffffff';
    for (let i = 0; i < 46; i++) { const x = R() * vw, y = R() * (G - 50), tw = 0.5 + 0.5 * Math.sin(t / 500 + i * 1.7); c.globalAlpha = 0.35 + 0.65 * tw; c.beginPath(); c.arc(x, y, 0.45 + (i % 3) * 0.2, 0, 7); c.fill(); }
    c.globalAlpha = 1; const mx = vw - 34, my = 18;
    const hg = c.createRadialGradient(mx, my, 2, mx, my, 22); hg.addColorStop(0, 'rgba(240,240,210,.35)'); hg.addColorStop(1, 'rgba(240,240,210,0)'); c.fillStyle = hg; c.fillRect(mx - 22, my - 22, 44, 44);
    c.save(); c.beginPath(); c.rect(mx - 10, my - 10, 20, 20); c.arc(mx + 3.2, my - 1.8, 5.6, 0, 7, true); c.clip();
    c.fillStyle = '#f4f1d6'; c.beginPath(); c.arc(mx, my, 6.5, 0, 7); c.fill(); c.restore(); }
  else { const sx = vw - 36, sy = 18, hg = c.createRadialGradient(sx, sy, 2, sx, sy, 26);
    hg.addColorStop(0, dusk ? 'rgba(255,190,110,.7)' : 'rgba(255,250,210,.8)'); hg.addColorStop(1, 'rgba(255,250,210,0)'); c.fillStyle = hg; c.fillRect(sx - 26, sy - 26, 52, 52);
    c.fillStyle = dusk ? '#ffb45a' : '#fff4b0'; c.beginPath(); c.arc(sx, sy, 7.5, 0, 7); c.fill();
    const d = t / 260 - L * 0.15, wrap = vw + 80; SC.cloud(c, ((40 + d) % wrap + wrap) % wrap - 40, G - 120, 9, 0.95); SC.cloud(c, ((150 + d * 0.6) % wrap + wrap) % wrap - 40, G - 96, 6.5, 0.8); }
  c.save(); c.translate(-L * 0.25 % 600, 0); SC.hills(c, vw + 640, G - 54, G, 6, 30, 2, YARD.far[season]); c.restore();
  c.save(); c.translate(-L * 0.5 % 400, 0); SC.hills(c, vw + 440, G - 40, G, 5, 21, 0.4, YARD.hill[season]); c.restore();
  // the world, zoomed about the ground line
  c.setTransform(k * Z, 0, 0, k * Z, -L * Z * k, (G - GROUND * Z) * k);
  const x0 = RANCH_W0() - 20, x1 = RANCH_W1() + 20;
  const gg = c.createLinearGradient(0, GROUND - 16, 0, GROUND + 40); gg.addColorStop(0, YARD.ground[season]); gg.addColorStop(1, SC.dark(YARD.ground[season], 0.12));
  c.fillStyle = gg; c.fillRect(x0, GROUND - 16, x1 - x0, 200);
  c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x0, GROUND - 16, x1 - x0, 1.2);
  // a dirt path along the whole ranch
  c.fillStyle = season === 3 ? '#d9dfe6' : '#d9b77e'; c.beginPath(); c.moveTo(x0, GROUND - 2);
  for (let X = x0; X <= x1; X += 16) c.lineTo(X, GROUND - 2 + Math.sin(X / 60) * 1.5); c.lineTo(x1, GROUND + 9); c.lineTo(x0, GROUND + 9); c.closePath(); c.fill();
  if (season !== 3) { const R = SC.rng(13); for (let i = 0; i < 70; i++) { const x = x0 + R() * (x1 - x0), y = GROUND - 12 + R() * 30, s2 = 1.6 + (y - GROUND + 12) / 30 * 1.6;
    if (y > GROUND - 4 && y < GROUND + 10) continue;
    if (i % 6 === 2 && season < 2) SC.flower(c, x, y - 1, 0.9, ['#ffffff', '#ffb3c8', '#fff1a0'][i % 3]); else SC.tuft(c, x, y, s2, 'rgba(30,90,30,.35)'); } }
  ranchBarn(c, -RW / 2, season, night, s);
  ranchYard(c, t, season, s);
  ranchTraining(c, RW, season);
  if (season === 3) { c.setTransform(k, 0, 0, k, 0, 0); c.fillStyle = '#ffffff'; for (let i = 0; i < 30; i++) { const x = ((i * 41 + t / 40 - L * 0.4) % vw + vw) % vw, y = (i * 23 + t / 25) % G; c.globalAlpha = 0.85; c.beginPath(); c.arc(x, y, 0.7 + (i % 3) * 0.25, 0, 7); c.fill(); } c.globalAlpha = 1; }
  const ch = document.getElementById('r-chibi'); if (ch) ch.style.filter = night ? 'brightness(.8) saturate(.88)' : '';
  if (night || dusk) { c.setTransform(k, 0, 0, k, 0, 0); const tg = c.createLinearGradient(0, G - 70, 0, G - 40), tc = night ? '18,24,72' : '255,120,70', ta = night ? 0.42 : 0.12;
    tg.addColorStop(0, `rgba(${tc},0)`); tg.addColorStop(1, `rgba(${tc},${ta})`); c.fillStyle = tg; c.fillRect(0, G - 70, vw, vh); }
  if (night) { c.setTransform(k * Z, 0, 0, k * Z, -L * Z * k, (G - GROUND * Z) * k); barnWindows(c, -RW / 2, true); }
  return true;
}
/* the barn: 2.3 m doors a Mega walks through, a hay loft, hay bales and a water trough */
const BARN = { w: 190, h: 196, door: 104 };
function barnWindows(c, cx, night) {
  const y = GROUND - 162; c.fillStyle = night ? '#ffd877' : '#f2ead6';
  c.beginPath(); c.roundRect(cx - 20, y, 40, 28, 4); c.fill();
  if (night) { const hg = c.createRadialGradient(cx, y + 14, 2, cx, y + 14, 46); hg.addColorStop(0, 'rgba(255,214,120,.4)'); hg.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = hg; c.fillRect(cx - 50, y - 34, 100, 96);
    c.fillStyle = 'rgba(255,214,120,.25)'; c.beginPath(); c.moveTo(cx - 44, GROUND); c.lineTo(cx - 34, GROUND - BARN.door + 4); c.lineTo(cx + 34, GROUND - BARN.door + 4); c.lineTo(cx + 44, GROUND); c.closePath(); c.fill(); }
}
function ranchBarn(c, cx, season, night, s) {
  const w = BARN.w, h = BARN.h, x = cx - w / 2, top = GROUND - h, red = '#c4473a';
  SC.depth(c, () => { c.beginPath(); c.moveTo(x, GROUND); c.lineTo(x, top + 64); c.lineTo(x + 26, top + 22); c.lineTo(cx, top + 4); c.lineTo(x + w - 26, top + 22); c.lineTo(x + w, top + 64); c.lineTo(x + w, GROUND); c.closePath(); }, red, 3, 0.3);
  c.fillStyle = 'rgba(0,0,0,.07)'; for (let i = 12; i < w; i += 12) c.fillRect(x + i, top + 30, 1.4, h - 30);
  SC.depth(c, () => { c.beginPath(); c.moveTo(x - 10, top + 66); c.lineTo(x + 22, top + 16); c.lineTo(cx, top - 6); c.lineTo(x + w - 22, top + 16); c.lineTo(x + w + 10, top + 66);
    c.lineTo(x + w, top + 70); c.lineTo(x + w - 28, top + 28); c.lineTo(cx, top + 10); c.lineTo(x + 28, top + 28); c.lineTo(x, top + 70); c.closePath(); }, season === 3 ? '#eef3f8' : '#6a4a3a', 2.5, 0.3);
  barnWindows(c, cx, false);
  // the doorway and open doors
  const dw = 76, dh = BARN.door, dx = cx - dw / 2;
  c.fillStyle = '#3a2416'; c.beginPath(); c.roundRect(dx, GROUND - dh, dw, dh, [6, 6, 0, 0]); c.fill();
  c.fillStyle = '#e7c46a'; c.beginPath(); c.ellipse(dx + 18, GROUND - 4, 16, 6, 0, 0, 7); c.ellipse(dx + 52, GROUND - 3, 14, 5, 0, 0, 7); c.fill();
  for (const [ex, dir] of [[dx, -1], [dx + dw, 1]]) { SC.depth(c, () => { c.beginPath(); c.moveTo(ex, GROUND - dh); c.lineTo(ex + dir * 22, GROUND - dh + 6); c.lineTo(ex + dir * 22, GROUND + 2); c.lineTo(ex, GROUND); c.closePath(); }, '#ece4d0', 1.5, 0.3);
    c.strokeStyle = red; c.lineWidth = 3.5; c.beginPath(); c.moveTo(ex, GROUND - dh + 3); c.lineTo(ex + dir * 22, GROUND - 4); c.moveTo(ex + dir * 22, GROUND - dh + 9); c.lineTo(ex, GROUND - 2); c.stroke(); }
  c.strokeStyle = '#f2ead6'; c.lineWidth = 4; c.strokeRect(dx, GROUND - dh, dw, dh);
  // hay bales and a trough beside it
  for (const [bx, by] of [[x + w + 18, 0], [x + w + 40, 0], [x + w + 29, -16]]) { SC.depth(c, () => { c.beginPath(); c.roundRect(bx - 11, GROUND - 16 + by, 22, 16, 4); }, '#e2bf62', 1.5, 0.25);
    c.strokeStyle = 'rgba(140,100,30,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx - 4, GROUND - 16 + by); c.lineTo(bx - 4, GROUND + by); c.moveTo(bx + 4, GROUND - 16 + by); c.lineTo(bx + 4, GROUND + by); c.stroke(); }
  SC.depth(c, () => { c.beginPath(); c.roundRect(x - 52, GROUND - 14, 38, 14, [2, 2, 5, 5]); }, '#8a6a4a', 1.5, 0.3);
  c.fillStyle = season === 3 ? '#dff1ff' : '#6fc3ef'; c.beginPath(); c.roundRect(x - 49, GROUND - 13, 32, 4, 2); c.fill();
}
/* the yard: fence, tree, food bowl and the toy box (balls and snacks come from here) */
function ranchYard(c, t, season, s) {
  const wood = '#c08f5c';
  for (const yy of [GROUND - 42, GROUND - 24]) SC.depth(c, () => { c.beginPath(); c.roundRect(84, yy, RW - 30, 3.4, 1.7); }, wood, 1.2, 0.3);
  for (let x = 88; x < RW + 60; x += 22) SC.depth(c, () => { c.beginPath(); c.roundRect(x, GROUND - 48, 4.5, 46, [2.2, 2.2, 0.6, 0.6]); }, wood, 1.2, 0.3);
  if (season === 3) { c.fillStyle = '#ffffff'; for (let x = 88; x < RW + 60; x += 22) { c.beginPath(); c.ellipse(x + 2.2, GROUND - 48, 3.2, 1.6, 0, 0, 7); c.fill(); } c.fillRect(84, GROUND - 42.8, RW - 30, 1.2); }
  // tree, about 3 m
  const tx = 214;
  SC.depth(c, () => { c.beginPath(); c.moveTo(tx - 6, GROUND - 4); c.lineTo(tx - 4, GROUND - 100); c.lineTo(tx + 4, GROUND - 100); c.lineTo(tx + 6, GROUND - 4); c.closePath(); }, '#7a4f2e', 1.5, 0.3);
  const leaf = YARD.leaf[season], crown = [[0, -4, 22], [-20, 8, 17], [20, 8, 18], [-9, 20, 17], [10, 22, 16]].map(([a, b, r]) => [a, b, r]);
  if (leaf) { SC.depth(c, () => SC.blob(c, tx, GROUND - 124, crown), leaf, 3.5, 0.28);
    c.fillStyle = 'rgba(255,255,255,.26)'; c.beginPath(); c.arc(tx - 9, GROUND - 134, 7, 0, 7); c.fill();
    if (season === 0) { const R = SC.rng(4); c.fillStyle = '#ffc6dc'; for (let i = 0; i < 16; i++) { c.beginPath(); c.arc(tx - 30 + R() * 60, GROUND - 146 + R() * 44, 1.8, 0, 7); c.fill(); } }
    if (season === 2) { c.fillStyle = '#e8a33c'; for (let i = 0; i < 6; i++) { const fx = tx - 30 + ((t / 30 + i * 47) % 80), fy = GROUND - 110 + ((t / 18 + i * 31) % 110); c.beginPath(); c.ellipse(fx, fy, 2, 1.1, t / 300 + i, 0, 7); c.fill(); } } }
  else { c.strokeStyle = '#7a4f2e'; c.lineCap = 'round'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(tx, GROUND - 96); c.lineTo(tx - 18, GROUND - 124); c.moveTo(tx, GROUND - 100); c.lineTo(tx + 20, GROUND - 130); c.moveTo(tx, GROUND - 98); c.lineTo(tx + 2, GROUND - 136); c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(tx - 18, GROUND - 125); c.lineTo(tx - 9, GROUND - 112); c.moveTo(tx + 20, GROUND - 131); c.lineTo(tx + 10, GROUND - 117); c.stroke(); }
  // food bowl
  SC.depth(c, () => { c.beginPath(); c.moveTo(BOWLX, GROUND - 5); c.lineTo(BOWLX + 13, GROUND - 5); c.quadraticCurveTo(BOWLX + 12, GROUND, BOWLX + 6.5, GROUND); c.quadraticCurveTo(BOWLX + 1, GROUND, BOWLX, GROUND - 5); c.closePath(); }, '#e0533f', 1, 0.3);
  const bowl = s.props.find(p => p.k === 'bowl');
  if (bowl && bowl.food) { c.fillStyle = bowl.food; c.beginPath(); c.ellipse(BOWLX + 6.5, GROUND - 5.3, 5.8, 1.9, 0, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(BOWLX + 3.5, GROUND - 3, 1.6, 0.7, 0, 0, 7); c.fill();
  // toy box where Tala used to stand
  const bx = HELPX - 4;
  SC.depth(c, () => { c.beginPath(); c.roundRect(bx - 12, GROUND - 18, 24, 18, 3); }, '#d39a5a', 1.5, 0.28);
  c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(bx - 12, GROUND - 12, 24, 1.2);
  c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(bx - 4, GROUND - 19, 4.5, Math.PI, 0); c.fill(); c.fillStyle = '#4aa3ff'; c.beginPath(); c.arc(bx + 5, GROUND - 19, 3.5, Math.PI, 0); c.fill();
}
/* the training ground: sand, posts, a boulder, a hurdle, a target and the ball machine, then the road to town */
function ranchTraining(c, X, season) {
  c.fillStyle = season === 3 ? '#e6e9ee' : '#e0c38a'; c.beginPath(); c.ellipse(X + RW / 2, GROUND + 2, RW * 0.46, 10, 0, 0, 7); c.fill();
  const bm = X + HELPX;                                  // ball machine, where drills throw balls from
  SC.depth(c, () => { c.beginPath(); c.roundRect(bm - 10, GROUND - 22, 20, 18, 5); }, '#4a86d8', 1.5, 0.3);
  c.fillStyle = '#2f3a52'; c.beginPath(); c.roundRect(bm + 4, GROUND - 24, 12, 7, 3); c.fill();
  c.strokeStyle = '#2f3a52'; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(bm - 6, GROUND - 4); c.lineTo(bm - 8, GROUND); c.moveTo(bm + 6, GROUND - 4); c.lineTo(bm + 8, GROUND); c.stroke();
  for (const [px, h] of [[X + 18, 34], [X + 30, 24], [X + 42, 42]]) SC.depth(c, () => { c.beginPath(); c.roundRect(px, GROUND - h, 9, h + 2, 4); }, '#a8774a', 1.5, 0.3);
  c.strokeStyle = '#f2ead6'; c.lineWidth = 3; c.beginPath(); c.moveTo(X + 92, GROUND); c.lineTo(X + 92, GROUND - 26); c.moveTo(X + 120, GROUND); c.lineTo(X + 120, GROUND - 26); c.stroke();
  c.strokeStyle = '#d24f43'; c.lineWidth = 4; c.beginPath(); c.moveTo(X + 90, GROUND - 24); c.lineTo(X + 122, GROUND - 24); c.stroke();
  const dx = X + 186; c.strokeStyle = '#8a5a32'; c.lineWidth = 3; c.beginPath(); c.moveTo(dx, GROUND); c.lineTo(dx, GROUND - 60); c.moveTo(dx - 14, GROUND - 44); c.lineTo(dx + 14, GROUND - 44); c.stroke();
  SC.depth(c, () => { c.beginPath(); c.ellipse(dx, GROUND - 52, 12, 16, 0, 0, 7); }, '#e7c46a', 2, 0.3);
  c.fillStyle = '#d24f43'; c.beginPath(); c.arc(dx, GROUND - 52, 6, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(dx, GROUND - 52, 2.8, 0, 7); c.fill();
  // signpost to town
  const sx = X + RW - 16; c.fillStyle = '#8a5a32'; c.fillRect(sx - 2, GROUND - 40, 4, 40);
  SC.depth(c, () => { c.beginPath(); c.moveTo(sx - 22, GROUND - 46); c.lineTo(sx + 16, GROUND - 46); c.lineTo(sx + 24, GROUND - 38); c.lineTo(sx + 16, GROUND - 30); c.lineTo(sx - 22, GROUND - 30); c.closePath(); }, '#c99a62', 1.5, 0.3);
  c.fillStyle = '#4a3220'; c.font = '700 8px system-ui'; c.textAlign = 'center'; c.fillText('Town', sx - 2, GROUND - 35);
}

/* ---------- Tala ---------- */
/* her head, about 70 units across, centred on (0,0); faces: happy, talk, worried, surprised */
function talaHead(x, face = 'talk') {
  const hair = '#5a3420', hairD = '#3e2214';
  SC.depth(x, () => { x.beginPath(); x.ellipse(30, 6, 11, 21, -0.35, 0, 7); }, hair, 3, 0.3);
  x.fillStyle = '#d24f43'; x.beginPath(); x.roundRect(22, -14, 10, 6, 3); x.fill();
  SC.depth(x, () => { x.beginPath(); x.ellipse(0, 4, 31, 30, 0, 0, 7); }, '#f8d3a3', 3, 0.22);
  x.fillStyle = hair; x.beginPath(); x.moveTo(-33, 10); x.bezierCurveTo(-36, -30, -14, -36, 0, -35); x.bezierCurveTo(16, -36, 36, -30, 33, 10);
  x.quadraticCurveTo(30, -6, 22, -12); x.quadraticCurveTo(16, -2, 8, -6); x.quadraticCurveTo(2, -14, -4, -6); x.quadraticCurveTo(-12, 0, -16, -10); x.quadraticCurveTo(-26, -4, -33, 10); x.fill();
  x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.ellipse(-12, -24, 10, 3.5, -0.35, 0, 7); x.fill();
  x.fillStyle = hairD; x.beginPath(); x.ellipse(-30, 14, 4, 10, 0.1, 0, 7); x.ellipse(30, 14, 4, 10, -0.1, 0, 7); x.fill();
  const ey = 8, ex = 12;
  if (face === 'happy') { x.strokeStyle = '#2a1e2e'; x.lineWidth = 3.2; x.lineCap = 'round'; for (const s2 of [-1, 1]) { x.beginPath(); x.arc(s2 * ex, ey + 3, 6, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); } }
  else { const ry = face === 'surprised' ? 8.5 : 7.5;
    for (const s2 of [-1, 1]) { x.fillStyle = '#2a1e2e'; x.beginPath(); x.ellipse(s2 * ex, ey, 5.6, ry, 0, 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(s2 * ex - 1.8, ey - 3, 2.3, 0, 7); x.fill(); x.beginPath(); x.arc(s2 * ex + 2, ey + 2.5, 1.1, 0, 7); x.fill(); } }
  x.strokeStyle = hairD; x.lineWidth = 2.4; x.lineCap = 'round';
  const br = face === 'worried' ? [[-17, -4, -7, -7], [17, -4, 7, -7]] : face === 'surprised' ? [[-17, -8, -7, -9], [17, -8, 7, -9]] : [[-17, -5, -7, -5], [17, -5, 7, -5]];
  for (const [a, b, c2, e] of br) { x.beginPath(); x.moveTo(a, b); x.lineTo(c2, e); x.stroke(); }
  x.fillStyle = 'rgba(255,120,140,.42)'; x.beginPath(); x.ellipse(-20, 18, 5, 3, 0, 0, 7); x.ellipse(20, 18, 5, 3, 0, 0, 7); x.fill();
  x.fillStyle = '#8a3a3a'; x.strokeStyle = '#8a3a3a'; x.lineWidth = 2.2;
  if (face === 'happy') { x.beginPath(); x.moveTo(-6, 20); x.quadraticCurveTo(0, 28, 6, 20); x.closePath(); x.fill(); }
  else if (face === 'talk') { x.beginPath(); x.ellipse(0, 22, 4.5, 3.4, 0, 0, 7); x.fill(); }
  else if (face === 'worried') { x.beginPath(); x.moveTo(-5, 24); x.quadraticCurveTo(0, 20, 5, 24); x.stroke(); }
  else if (face === 'surprised') { x.beginPath(); x.ellipse(0, 23, 3.5, 4.5, 0, 0, 7); x.fill(); }
}
/* her portrait: head and shoulders in a square canvas */
function talaPortrait(cv, face) {
  const dpr = devicePixelRatio || 1, S = (cv.clientWidth || 64) * dpr; cv.width = S; cv.height = S;
  const x = cv.getContext('2d'); x.clearRect(0, 0, S, S);
  x.fillStyle = '#cfe7f6'; x.fillRect(0, 0, S, S); x.fillStyle = '#bfe0a8'; x.fillRect(0, S * 0.74, S, S);
  const u = S / 120; x.translate(S / 2, S * 0.5); x.scale(u, u);
  x.fillStyle = '#f2c68c'; x.fillRect(-8, 24, 16, 16);                         // neck, joining head to shoulders
  SC.depth(x, () => { x.beginPath(); x.roundRect(-38, 34, 76, 60, 22); }, '#4a86d8', 3, 0.3);
  x.fillStyle = '#e9e2d0'; x.beginPath(); x.moveTo(-14, 34); x.lineTo(0, 52); x.lineTo(14, 34); x.closePath(); x.fill();
  x.fillStyle = '#d24f43'; x.beginPath(); x.moveTo(-12, 36); x.lineTo(0, 52); x.lineTo(12, 36); x.lineTo(0, 44); x.closePath(); x.fill();
  x.translate(0, -6); x.scale(1.05, 1.05); talaHead(x, face);
}
/* which face fits what she's saying */
function talaMood(t) {
  t = String(t || '').replace(/<[^>]*>/g, '');
  if (/hurt|tired|exhaust|strain|sick|\bcold\b|hates|wasn't happy|flinch|tense|scared|injur|lifespan|no training|lost|fail|cost it|worn/i.test(t)) return 'worried';
  if (/dug up|wandered in|birthday|Learned|changing|turned into|rival/i.test(t)) return 'surprised';
  if (/!|love|best|great|good|squeaky|rested|favourite|fun|solid/i.test(t)) return 'happy';
  return 'talk';
}
/* put her portrait into a speech box (the ranch line or a tip) */
function talaFace(box, text) {
  if (!box || typeof CHIBI_ART === 'undefined' || !CHIBI_ART) return;
  let cv = box.querySelector('canvas.tala-pic');
  if (!cv) { cv = document.createElement('canvas'); cv.className = 'tala-pic'; box.prepend(cv); }
  box.classList.add('has-pic'); talaPortrait(cv, talaMood(text));
}

/* ---------- ranch props and particles, drawn smooth on the monster layer in yard coordinates ---------- */
function ranchProps(c, s, t, front) {
  for (const p of s.props) {
    const x = p.x, y = p.y;
    if (!front && p.k === 'boulder') { const r = p.r * 1.4;
      SC.depth(c, () => { c.beginPath(); c.arc(x, y - r, r, 0, 7); }, '#9a948c', 1.5, 0.3);
      c.save(); c.translate(x, y - r); c.rotate(p.rot); c.strokeStyle = 'rgba(60,55,50,.4)'; c.lineWidth = 1.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r * 0.5, -r * 0.2); c.lineTo(0, r * 0.1); c.lineTo(r * 0.4, -r * 0.35); c.moveTo(-r * 0.2, r * 0.5); c.lineTo(r * 0.2, r * 0.35); c.stroke(); c.restore();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.arc(x - r * 0.35, y - r * 1.4, r * 0.28, 0, 7); c.fill(); }
    if (!front && p.k === 'box') {
      SC.depth(c, () => { c.beginPath(); c.roundRect(x - 8, y - 13, 16, 13, 2); }, '#c98a4c', 1.2, 0.28);
      c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(x - 1, y - 12, 2, 12);
      if (p.open) { SC.depth(c, () => { c.beginPath(); c.roundRect(x - 11, y - 22, 4, 10, 1.5); }, '#d9995a', 1, 0.25); }
      else SC.depth(c, () => { c.beginPath(); c.roundRect(x - 9.5, y - 16, 19, 4, 1.5); }, '#d9995a', 1, 0.25); }
    if (front && (p.k === 'ball' || p.k === 'snack')) { const r = p.k === 'ball' ? 3.6 : 2.6;
      SC.depth(c, () => { c.beginPath(); c.arc(x, y, r, 0, 7); }, p.c, 0.8, 0.3);
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.35, r * 0.32, 0, 7); c.fill(); }
    if (front && p.k === 'ring') { c.strokeStyle = `rgba(255,240,160,${Math.max(0, 1 - p.r / 28)})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y, p.r * 1.3, p.r * 0.55, 0, 0, 7); c.stroke(); }
    if (front && p.k === 'bug') { const f = Math.sin(t / 40) * 0.5 + 0.5;
      c.fillStyle = 'rgba(220,240,255,.85)'; c.beginPath(); c.ellipse(x - 1.6, y - 1.2, 1.8, 1 + f, -0.5, 0, 7); c.ellipse(x + 1.6, y - 1.2, 1.8, 1 + f, 0.5, 0, 7); c.fill();
      c.fillStyle = '#e8b23a'; c.beginPath(); c.ellipse(x, y, 1.6, 1.1, 0, 0, 7); c.fill(); }
  }
}
function ranchVisitor(c, v, t) {
  if (typeof chibiSpec !== 'function') return; const sp = chibiSpec(v.m); if (!sp) return;
  const ppu = sp.cm / 100 * RANCH_PX_M / CHIBI.height(sp.stage, [], sp.family), moving = v.lastX != null && Math.abs(v.x - v.lastX) > 0.01; v.lastX = v.x;
  c.save(); c.translate(v.x, GROUND); c.scale(-ppu, ppu); c.translate(-100, -188); CHIBI.draw(c, sp, moving ? 'walk' : 'happy', t); c.restore();
}
function ranchParticles(c, s) {
  for (const p of s.parts) {
    const a = Math.max(0, Math.min(1, (1 - p.life / p.max) * 1.6)), x = p.x, y = p.y; if (!a) continue;
    c.globalAlpha = a;
    switch (p.kind) {
      case 'heart': c.save(); c.translate(x, y); c.scale(0.28, 0.28); c.beginPath(); c.moveTo(0, 9); c.bezierCurveTo(-14, 0, -11, -11, -5, -11); c.bezierCurveTo(-2, -11, 0, -9, 0, -7);
        c.bezierCurveTo(0, -9, 2, -11, 5, -11); c.bezierCurveTo(11, -11, 14, 0, 0, 9); c.fillStyle = '#ff5d82'; c.fill(); c.restore(); break;
      case 'z': case 'q': c.font = `800 ${p.kind === 'z' ? 7 : 9}px system-ui`; c.textAlign = 'center'; c.lineWidth = 2; c.strokeStyle = 'rgba(20,24,60,.6)';
        c.strokeText(p.kind === 'z' ? 'z' : '?', x, y); c.fillStyle = p.kind === 'z' ? '#dfe8ff' : '#ffffff'; c.fillText(p.kind === 'z' ? 'z' : '?', x, y); break;
      case 'star': c.fillStyle = '#ffd94a'; c.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 1.3 : 3, b = j * Math.PI / 5 - Math.PI / 2; c[j ? 'lineTo' : 'moveTo'](x + Math.cos(b) * r, y + Math.sin(b) * r); } c.closePath(); c.fill(); break;
      case 'bulb': { const g = c.createRadialGradient(x, y, 0.5, x, y, 8); g.addColorStop(0, 'rgba(255,240,120,.6)'); g.addColorStop(1, 'rgba(255,240,120,0)'); c.fillStyle = g; c.fillRect(x - 8, y - 8, 16, 16);
        c.fillStyle = '#fff27a'; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); c.fillStyle = '#b8b2aa'; c.fillRect(x - 1.5, y + 2.5, 3, 2); break; }
      case 'sparkle': { const r = 2.4; c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); break; }
      case 'sweat': case 'drip': c.fillStyle = p.kind === 'sweat' ? '#9fd8ff' : '#4aa3ff'; c.beginPath(); c.moveTo(x, y - 2.2); c.quadraticCurveTo(x + 1.6, y, x, y + 1.3); c.quadraticCurveTo(x - 1.6, y, x, y - 2.2); c.fill(); break;
      case 'zap': c.strokeStyle = '#ffe14d'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x - 1.5, y - 2.5); c.lineTo(x + 0.5, y - 0.3); c.lineTo(x - 0.5, y + 0.3); c.lineTo(x + 1.5, y + 2.5); c.stroke(); break;
      case 'leaf': c.fillStyle = '#5fc46a'; c.beginPath(); c.ellipse(x, y, 1.8, 0.9, p.life / 6, 0, 7); c.fill(); break;
      default: { const col = { dust: 'rgba(217,200,168,.9)', crumb: '#e8c070', smoke: 'rgba(122,122,128,.7)', flake: '#ffffff' }[p.kind] || '#ffffff', r = { dust: 1.6, crumb: 0.9, smoke: 2.4 + p.life / 20, flake: 1.1 }[p.kind] || 1;
        c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    }
  }
  c.globalAlpha = 1;
}
