/* Where a fight happens. Each cup level has its own place, so climbing the grades looks like climbing:
   - ring: the town ring, a fenced dirt ring with two wooden benches, for E and D cups, practice and friendlies
   - stadium: the League stadium at C and B
   - grand: the big stadium at A and S, with floodlight towers and a scoreboard
   - majors: the Majors, the Legend Cup and the Invitational, at night under spotlights
   - tower: the Tower's stone hall, with no crowd
   The crowd is people and little monsters (spectator() in scenes.js), drawn soft behind the fight. A crit, a special or a
   knockout brings them to their feet for a moment. Needs scenes.js and arena-ui.js. */

const AT_VENUES = ['ring', 'stadium', 'grand', 'majors', 'tower'];

/* the place for a cup card (venue.js) */
function atCupVenue(c) {
  if (!c) return 'stadium';
  if (c.major || c.legend || /Invitational/.test(c.name || '')) return 'majors';
  const g = c.small ? 'E' : c.grade;
  return g === 'A' || g === 'S' ? 'grand' : g === 'C' || g === 'B' ? 'stadium' : 'ring';
}
/* the place for any other fight, from its title */
function atVenueOf(o) {
  if (!o) return 'stadium';
  if (o.venue && AT_VENUES.includes(o.venue)) return o.venue;
  if (/^Tower/.test(o.title || '')) return 'tower';
  if (/^(Practice|Friendly)/.test(o.title || '') || !o.title) return 'ring';
  return 'stadium';
}

/* ---------- the crowd ---------- */
// rows of spectators between top and bottom, the back rows smaller; returns the layout so the cheering frames match the calm one
function atCrowdLayout(W, top, bottom, rows, gap, seed) {
  const R = SC.rng(seed), out = [], rowH = (bottom - top) / rows;
  for (let r = 0; r < rows; r++) {
    const y = top + (r + 1) * rowH, k = rowH / 36 * (0.82 + r / Math.max(1, rows - 1) * 0.18), L = [];
    for (let x = 8 + (r % 2) * gap * 0.5; x < W + 10; x += gap * (0.9 + R() * 0.35))
      L.push({ x, kind: SPEC_KINDS[Math.floor(R() * SPEC_KINDS.length)], kk: k * (0.85 + R() * 0.3), col: STAND_SOFT[Math.floor(R() * STAND_SOFT.length)], ph: R() * 6.28, hop: R() });
    out.push({ y, k, L, bench: r });
  }
  return { top, bottom, rows: out };
}
// one frame of the crowd on its own canvas, blurred and dimmed so it reads as the stands: calm, or on its feet with arms up
function atCrowdFrame(lay, W, dpr, o) {
  // drawn sharp on a scratch canvas first, then blurred onto the frame in one pass: a blur on every spectator's shapes would take seconds
  const h = Math.ceil(lay.bottom - lay.top + 40), mk = () => { const v = document.createElement('canvas'); v.width = Math.ceil(W * dpr); v.height = Math.ceil(h * dpr); return v; };
  const raw = mk(), r = raw.getContext('2d'); r.scale(dpr, dpr); r.translate(0, 40 - lay.top);
  for (const row of lay.rows) {
    if (o.bench) { r.fillStyle = row.bench % 2 ? o.bench[0] : o.bench[1]; r.fillRect(0, row.y - 4 * row.k, W, 8 * row.k); }
    for (const p of row.L) {
      const up = o.cheer ? (o.frame ? p.hop > 0.5 : p.hop <= 0.5) : false, wave = o.cheer ? p.hop > 0.12 : p.hop > 0.93;
      spectator(r, p.x, row.y - (up ? 5 * p.kk : 0), p.kk, p.kind, p.col, wave);
    }
  }
  const cv = mk(), c = cv.getContext('2d'); c.filter = `blur(${1.3 * dpr}px)`; c.drawImage(raw, 0, 0); c.filter = 'none'; c.scale(dpr, dpr); c.translate(0, 40 - lay.top);
  const dk = o.dark || [0.42, 0.12], dim = c.createLinearGradient(0, lay.top, 0, lay.bottom); dim.addColorStop(0, `rgba(${o.dim},${dk[0]})`); dim.addColorStop(1, `rgba(${o.dim},${dk[1]})`);
  c.fillStyle = dim; c.fillRect(0, lay.top - 40, W, lay.bottom - lay.top + 40);
  if (o.after) o.after(c, lay);   // what hangs in front of the stands: floodlight glare at the big stadium, spotlight beams at the Majors
  return { cv, y: lay.top - 40, h };
}
// called every frame from the arena's draw, in arena units, right after the background
function atCrowdDraw(c, te) {
  const C = AT && AT.crowd; if (!C) return;
  const cheer = AT.cheerUntil && te < AT.cheerUntil;
  const F = cheer ? C.frames[1 + (Math.floor(te / 130) % 2)] : C.frames[0];
  c.drawImage(F.cv, 0, F.y, C.W, F.h);
  if (cheer && C.confetti) atConfetti(c, te, C);
}
// paper confetti over the stands at the Majors
function atConfetti(c, te, C) {
  const k0 = (te - (AT.cheerUntil - 1400)) / 1400;
  for (let i = 0; i < 46; i++) {
    const x = (i * 97.3 % C.W), fall = (k0 * 260 + i * 37 % 120), y = C.top - 60 + fall, sw = Math.sin(te / 90 + i) * 6;
    c.save(); c.translate(x + sw, y); c.rotate(te / 160 + i); c.fillStyle = BANNER_SOFT[i % BANNER_SOFT.length]; c.globalAlpha = Math.max(0, 1 - k0 * 0.8); c.fillRect(-3, -1.5, 6, 3); c.restore();
  }
}
function atCheer(ms) { if (AT && AT.crowd) AT.cheerUntil = Math.max(AT.cheerUntil || 0, AT.te + (ms || 1300)); }

/* ---------- the places ---------- */
function atStageVenue(c, W, H, FY, v) {
  const dpr = AT && AT.dpr || 1, sand = FY - 230, lip = sand - 12;
  const sky = (top, bot, a, b) => { const g = c.createLinearGradient(0, 0, 0, bot); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, top, W, bot - top); };
  const glow = (x, y, r, rgb, a) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); };
  const floor = (a, b, grain) => { const f = c.createLinearGradient(0, sand, 0, H); f.addColorStop(0, a); f.addColorStop(1, b); c.fillStyle = f; c.fillRect(0, sand, W, H - sand);
    for (let k = 0; k < W * (H - sand) / 700; k++) { const x = (k * 7919) % W, y = sand + ((k * 104729) % (H - sand)); c.fillStyle = k % 3 ? grain[0] : grain[1]; c.fillRect(x, y, 3, 2); } };
  const ringLine = col => { c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(12, FY + 120); c.lineTo(W - 12, FY + 120); c.stroke();
    c.lineWidth = 4; c.globalAlpha = 0.55; c.beginPath(); c.ellipse(W / 2, FY + 120, 90, 26, 0, 0, Math.PI); c.stroke(); c.globalAlpha = 1; };
  const crowd = (lay, o) => { AT.crowd = { W, top: lay.top, confetti: !!o.confetti, frames: [false, true, true].map((ch, i) => atCrowdFrame(lay, W, dpr, { ...o, cheer: ch, frame: i === 2 })) }; };
  AT.crowd = null;

  if (v === 'ring') {
    // a sunny town ring: sky, hills and rooftops, two wooden benches, a fence with bunting, packed dirt
    sky(0, sand, '#8fd0f2', '#d6f0fb');
    c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { const x = (k * W / 3.6 + 50) % W, y = sand - 330 + (k * 53) % 70; for (const [dx, dy, r] of [[0, 0, 28], [26, -10, 22], [50, 2, 24]]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, 7); c.fill(); } }
    c.fillStyle = '#9fd27e'; c.beginPath(); c.moveTo(0, sand - 150); for (let x = 0; x <= W; x += 30) c.lineTo(x, sand - 165 - 22 * Math.sin(x / 150)); c.lineTo(W, sand - 90); c.lineTo(0, sand - 90); c.fill();
    for (let k = 0; k < 7; k++) { const x = 30 + k * (W - 60) / 6, w = 46 + (k * 17) % 20, y = sand - 175 - (k * 31) % 22, rc = ['#d9785a', '#c4664a', '#6f8fc2', '#d9a35a'][k % 4];
      c.fillStyle = '#f2e6cf'; c.fillRect(x - w / 2, y, w, 34); c.fillStyle = rc; c.beginPath(); c.moveTo(x - w / 2 - 6, y + 2); c.lineTo(x, y - 22); c.lineTo(x + w / 2 + 6, y + 2); c.fill();
      c.fillStyle = '#7a5a3a'; c.fillRect(x - 5, y + 16, 10, 18); }
    crowd(atCrowdLayout(W, sand - 150, sand - 28, 2, 40, 31), { dim: '60,90,120', bench: ['#a8774a', '#93653d'] });
    // the fence: posts, two rails and bunting strung between the posts
    for (let x = 6; x < W; x += 52) { c.fillStyle = '#8a5a34'; c.fillRect(x, sand - 44, 9, 46); }
    for (const y of [sand - 36, sand - 16]) { c.fillStyle = '#a8703f'; c.fillRect(0, y, W, 7); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(0, y + 5, W, 2); }
    for (let x = 10; x < W; x += 52) { c.strokeStyle = 'rgba(80,60,40,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, sand - 44); c.quadraticCurveTo(x + 26, sand - 30, x + 52, sand - 44); c.stroke();
      for (let j = 1; j < 5; j++) { const t = j / 5, px = x + 52 * t, py = sand - 44 + 28 * t * (1 - t); c.fillStyle = BANNER_SOFT[(j + Math.round(x)) % BANNER_SOFT.length]; c.beginPath(); c.moveTo(px - 4, py); c.lineTo(px + 4, py); c.lineTo(px, py + 9); c.fill(); } }
    floor('#caa070', '#b0834f', ['rgba(110,72,34,.2)', 'rgba(255,240,210,.22)']);
    for (let k = 0; k < 40; k++) { const x = (k * 151) % W, y = sand + 4 + (k * 37) % 30; c.fillStyle = 'rgba(90,150,60,.55)'; c.fillRect(x, y, 2, 6); c.fillRect(x + 3, y + 1, 2, 5); }
    ringLine('rgba(255,250,236,.6)');
    return;
  }
  if (v === 'tower') {
    // the Tower's hall: stone blocks, arches, pillars with torches, banners, a flagstone floor
    c.fillStyle = '#4a4458'; c.fillRect(0, 0, W, sand);
    for (let y = 0, r = 0; y < sand; y += 26, r++) for (let x = (r % 2) * 30; x < W; x += 60) { c.fillStyle = (x * 7 + y) % 3 ? '#575167' : '#514b61'; c.fillRect(x + 1, y + 1, 58, 24); }
    for (let k = 0; k < 4; k++) { const x = W * (0.125 + k * 0.25), aw = 90, top = sand - 300;
      c.fillStyle = '#231f2e'; c.beginPath(); c.moveTo(x - aw / 2, sand); c.lineTo(x - aw / 2, top + aw / 2); c.arc(x, top + aw / 2, aw / 2, Math.PI, 0); c.lineTo(x + aw / 2, sand); c.fill();
      c.fillStyle = BANNER_SOFT[k + 1]; c.fillRect(x - 16, top + 30, 32, 90); c.beginPath(); c.moveTo(x - 16, top + 120); c.lineTo(x, top + 136); c.lineTo(x + 16, top + 120); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x, top + 70, 9, 0, 7); c.fill(); }
    for (let k = 0; k <= 4; k++) { const x = W * k / 4 - (k === 4 ? 30 : k === 0 ? 0 : 15); c.fillStyle = '#6a6380'; c.fillRect(x, sand - 330, 30, 330); c.fillStyle = '#7d7594'; c.fillRect(x, sand - 330, 30, 10); c.fillRect(x - 4, sand - 18, 38, 18);
      const ty = sand - 190; glow(x + 15, ty - 14, 90, '255,190,90', 0.35); c.fillStyle = '#3a2a1e'; c.fillRect(x + 11, ty - 6, 8, 20); c.fillStyle = '#ffb347'; c.beginPath(); c.ellipse(x + 15, ty - 14, 6, 11, 0, 0, 7); c.fill(); c.fillStyle = '#fff1a8'; c.beginPath(); c.ellipse(x + 15, ty - 11, 3, 6, 0, 0, 7); c.fill(); }
    const f = c.createLinearGradient(0, sand, 0, H); f.addColorStop(0, '#6e6880'); f.addColorStop(1, '#55506a'); c.fillStyle = f; c.fillRect(0, sand, W, H - sand);
    for (let y = sand, r = 0; y < H; y += 34 + r * 6, r++) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, y, W, 2); for (let x = (r % 2) * 40; x < W; x += 80 + r * 6) c.fillRect(x, y, 2, 34 + r * 6); }
    ringLine('rgba(255,236,190,.35)');
    return;
  }
  // the three stadiums share a shape: sky, stands full of spectators, a wall of banners and a sand floor
  const big = v !== 'stadium', night = v === 'majors', ctop = Math.max(0, lip - (big ? 420 : 360));
  if (night) { sky(0, ctop + 60, '#070815', '#1b1840'); for (let k = 0; k < 70; k++) { c.fillStyle = `rgba(255,255,240,${0.3 + (k % 5) / 8})`; c.fillRect((k * 113) % W, (k * 59) % Math.max(20, ctop + 20), 2, 2); } }
  else sky(0, ctop + 60, v === 'grand' ? '#1f2a4e' : '#140f26', v === 'grand' ? '#34467a' : '#2a1f4a');
  if (v === 'stadium') for (let k = 0; k < W; k += W / 7) { c.fillStyle = 'rgba(255,236,170,.9)'; c.beginPath(); c.arc(k + W / 14, ctop - 40, 5, 0, 7); c.fill(); glow(k + W / 14, ctop - 40, 28, '255,236,170', 0.12); }
  if (v === 'grand') for (const x of [40, W - 40]) { c.fillStyle = '#2a2f45'; c.fillRect(x - 5, ctop - 150, 10, 190); c.fillStyle = '#e8ecf5'; c.fillRect(x - 34, ctop - 172, 68, 26);
    for (let j = 0; j < 4; j++) { c.fillStyle = '#fffbe6'; c.beginPath(); c.arc(x - 24 + j * 16, ctop - 159, 6, 0, 7); c.fill(); } glow(x, ctop - 159, 200, '255,250,220', 0.22); }
  if (night) for (const [x, a] of [[W * 0.2, 0.35], [W * 0.8, -0.35], [W * 0.5, 0.05]]) { c.save(); c.translate(x, ctop + 20); c.rotate(a);
    const g = c.createLinearGradient(0, 0, 0, sand - ctop); g.addColorStop(0, 'rgba(255,250,220,.0)'); g.addColorStop(0.3, 'rgba(255,250,220,.10)'); g.addColorStop(1, 'rgba(255,250,220,.02)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.lineTo(110, sand - ctop); c.lineTo(-110, sand - ctop); c.fill(); c.restore(); }
  c.fillStyle = night ? '#241a3e' : v === 'grand' ? '#25304f' : '#3a2b5e'; c.fillRect(0, ctop, W, lip - ctop);
  const glare = (cc, lay) => { cc.globalCompositeOperation = 'lighter';
      for (const x of [W * 0.08, W * 0.92]) { const g = cc.createRadialGradient(x, lay.top - 10, 0, x, lay.top - 10, 230); g.addColorStop(0, 'rgba(255,250,225,.55)'); g.addColorStop(1, 'rgba(255,250,225,0)'); cc.fillStyle = g; cc.fillRect(x - 230, lay.top - 240, 460, 480); }
      cc.globalCompositeOperation = 'source-over'; cc.fillStyle = '#c9cfe0'; cc.fillRect(0, lay.bottom - 10, W, 3); for (let x = 0; x < W; x += 34) cc.fillRect(x, lay.bottom - 22, 3, 14); },
    beams = (cc, lay) => { cc.globalCompositeOperation = 'lighter';
      for (const [x, a] of [[W * 0.18, 0.42], [W * 0.82, -0.42], [W * 0.5, 0.08], [W * 0.34, -0.2]]) { cc.save(); cc.translate(x, lay.top - 30); cc.rotate(a);
        const g = cc.createLinearGradient(0, 0, 0, lay.bottom - lay.top + 60); g.addColorStop(0, 'rgba(255,245,210,.30)'); g.addColorStop(1, 'rgba(255,245,210,.04)');
        cc.fillStyle = g; cc.beginPath(); cc.moveTo(-8, 0); cc.lineTo(8, 0); cc.lineTo(70, lay.bottom - lay.top + 60); cc.lineTo(-70, lay.bottom - lay.top + 60); cc.fill(); cc.restore(); }
      cc.globalCompositeOperation = 'source-over'; };
  crowd(atCrowdLayout(W, ctop + 10, lip - 6, big ? 9 : 8, big ? 21 : 23, v === 'grand' ? 47 : night ? 59 : 13),
    { dim: night ? '10,8,30' : v === 'grand' ? '14,20,42' : '20,14,38', dark: night ? [0.66, 0.4] : v === 'grand' ? [0.4, 0.18] : [0.5, 0.26],
      bench: night ? ['#2e2350', '#271d46'] : v === 'grand' ? ['#2c385c', '#263152'] : ['#3f3166', '#372a5c'], confetti: night, after: night ? beams : v === 'grand' ? glare : null });
  // the wall: banners at the stadium, a scoreboard band and gold trim at the big one, star banners at the Majors
  if (v === 'stadium') for (let k = 0; k < 6; k++) { c.fillStyle = ['#e2483f', '#3b6fb8', '#f2c14e', '#4caf6a', '#c08cff', '#ff8a3d'][k]; c.fillRect(6 + k * (W - 12) / 6, lip, (W - 12) / 6 - 5, 12); }
  else { c.fillStyle = night ? '#3a1f4e' : '#1c2440'; c.fillRect(0, lip - 4, W, 20); c.fillStyle = '#e8b84a'; c.fillRect(0, lip - 4, W, 3); c.fillRect(0, lip + 13, W, 3);
    for (let k = 0; k < (night ? 9 : 5); k++) { const x = (k + 0.5) * W / (night ? 9 : 5); c.fillStyle = night ? '#ffd76a' : '#9fd3ff';
      if (night) { c.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 3 : 7, a = j * Math.PI / 5 - Math.PI / 2; c[j ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, lip + 6 + Math.sin(a) * r); } c.fill(); }
      else { c.fillRect(x - 22, lip + 1, 44, 10); c.fillStyle = '#1c2440'; for (let j = 0; j < 4; j++) c.fillRect(x - 18 + j * 10, lip + 3, 6, 6); } } }
  if (night) floor('#8a4a3a', '#6e3a2e', ['rgba(40,14,10,.22)', 'rgba(255,210,180,.14)']);
  else if (v === 'grand') floor('#e2bb7c', '#c79a58', ['rgba(120,78,36,.16)', 'rgba(255,245,220,.26)']);
  else floor('#d9a866', '#b98245', ['rgba(120,78,36,.18)', 'rgba(255,240,210,.22)']);
  if (night) { c.strokeStyle = 'rgba(255,215,120,.45)'; c.lineWidth = 6; c.beginPath(); c.ellipse(W / 2, FY + 60, 210, 54, 0, 0, 7); c.stroke(); c.lineWidth = 3; c.beginPath(); c.ellipse(W / 2, FY + 60, 170, 42, 0, 0, 7); c.stroke(); }
  ringLine(v === 'grand' ? 'rgba(232,184,74,.7)' : 'rgba(255,248,232,.55)');
  for (const x of [0, W - 12]) { c.fillStyle = night ? '#4a3270' : v === 'grand' ? '#3a4670' : '#6b5a8a'; c.fillRect(x, sand - 30, 12, H - sand + 30); c.fillStyle = v === 'grand' || night ? '#e8b84a' : '#8a78ab'; c.fillRect(x, sand - 30, 12, 5); }
}
