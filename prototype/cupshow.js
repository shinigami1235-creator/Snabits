/* The cup show: the build-up and wrap-up around cup fights, the way a broadcast would do it.
   The lights go down and the cup's name comes up with fireworks, Mira the announcer opens it, Tala has a word at the gate,
   the draw is shown, then each match gets a VS card. After a match Rico sums it up and Tala reacts, and at the end
   the top three stand on the podium. Mira is the announcer. Each beat is a picture drawn from its own clock plus an optional line in a speech box.
   Tap to finish a line or move on, and Skip ends the whole show. Needs scenes.js, npcs.js, chibi.js and summon.js. */
const CUPSHOW = (() => {
  const cl = k => Math.min(1, Math.max(0, k)), eo = k => 1 - Math.pow(1 - cl(k), 3);
  const back = k => { k = cl(k); const s = 1.7; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); };
  const hsh = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const FW = ['#ffd23f', '#ff7aa2', '#5cb8ff', '#57dd96', '#ffffff', '#c08cff', '#ff9a4a'];
  const TAGS = { tala: '#5cb8ff' };
  const PIX = 'Pix, "Courier New", monospace', BODY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  /* ---------- pieces ---------- */
  function mon(c, spec, cx, base, px, pose = 'idle', t = 0, flip = false, o = {}) {
    if (!spec) return;
    c.save(); c.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    if (spec.img) { const s = px * 1.1; c.translate(cx, base); if (flip) c.scale(-1, 1); c.imageSmoothingEnabled = false; c.drawImage(spec.img, -s / 2, -s, s, s); c.restore(); return; }
    const u = px / CHIBI.height(spec.stage, [], spec.family);
    c.translate(cx + (o.dx || 0), base + (o.dy || 0)); c.scale(u * (flip ? -1 : 1) * (o.sx || 1), u * (o.sy || 1)); c.translate(-100, -188);
    CHIBI.draw(c, spec, pose, t, o.look || [flip ? -0.5 : 0.5, 0]); c.restore();
  }
  const shadow = (c, x, y, w) => { c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(x, y, w, w * 0.22, 0, 0, 7); c.fill(); };
  /* the stadium wide shot, with the lights dimmed by `dark` and spotlights sweeping when `spots` */
  function stadium(c, W, H, t, o = {}) {
    arenaScene(c, W, H, true, [], t, !!o.cheer, o.hz || 0.42, null);
    if (o.dark) { c.fillStyle = `rgba(6,5,18,${o.dark})`; c.fillRect(0, 0, W, H); }
    if (o.spots) spots(c, W, H, t, o.spots, o.spotAt);
  }
  function spots(c, W, H, t, a = 1, at = null) {
    c.save(); c.globalCompositeOperation = 'lighter';
    [[W * 0.08, 0.9], [W * 0.92, -0.9]].forEach(([sx, dir], i) => {
      const ang = at ? Math.atan2(at.y, at.x - sx) : Math.PI / 2 - dir * (0.3 + Math.sin(t / 700 + i * 2) * 0.26), L = H * 1.2, w = 0.11;
      const g = c.createLinearGradient(sx, 0, sx + Math.cos(ang) * L, Math.sin(ang) * L); g.addColorStop(0, `rgba(255,246,210,${0.42 * a})`); g.addColorStop(1, 'rgba(255,246,210,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(sx, -4); c.lineTo(sx + Math.cos(ang - w) * L, Math.sin(ang - w) * L); c.lineTo(sx + Math.cos(ang + w) * L, Math.sin(ang + w) * L); c.closePath(); c.fill(); });
    c.restore();
  }
  /* fireworks that burst on a fixed beat from `from`, so any frame can be drawn on its own */
  function fireworks(c, W, H, t, from = 0, n = 8, top = 0.32) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const born = from + i * 360, age = t - born; if (age < 0 || age > 1500) continue;
      const cx = W * (0.12 + hsh(i) * 0.76), cy = H * (0.06 + hsh(i + 9) * top), col = FW[i % FW.length], k = age / 1500, r = eo(age / 700) * (60 + hsh(i + 3) * 46);
      if (age < 200) { c.fillStyle = col; c.globalAlpha = 1; c.beginPath(); c.arc(cx, cy + (1 - age / 200) * H * 0.3, 2.2, 0, 7); c.fill(); continue; }
      c.globalAlpha = 1 - k;
      c.shadowColor = col; c.shadowBlur = 10;
      for (let p = 0; p < 28; p++) { const a = p / 28 * Math.PI * 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r + k * k * 40;
        c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a) * 14, y - Math.sin(a) * 14 - 3); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + Math.cos(a + 0.1) * r * 0.55, cy + Math.sin(a + 0.1) * r * 0.55 + k * k * 30, 1.6, 0, 7); c.fill(); }
      c.shadowBlur = 0;
      if (age < 320) { c.globalAlpha = 1 - age / 320; c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 14, 0, 7); c.fill(); }
    }
    c.restore();
  }
  function confetti(c, W, H, t, n = 46) {
    for (let i = 0; i < n; i++) { const sp = 0.05 + hsh(i) * 0.06, x = (hsh(i + 1) * W + Math.sin(t / 400 + i) * 14) % W, y = ((hsh(i + 2) * H) + t * sp) % (H + 20) - 10;
      c.save(); c.translate(x, y); c.rotate(t / 260 + i); c.scale(1, Math.cos(t / 180 + i)); c.fillStyle = FW[i % FW.length]; c.fillRect(-4, -2.5, 8, 5); c.restore(); }
  }
  /* a ribbon banner with a line of text, popping in from `at` */
  function ribbon(c, W, y, text, t, at = 0, o = {}) {
    const k = back((t - at) / 420); if (t < at) return;
    c.save(); c.translate(W / 2, y); c.scale(k, k);
    c.font = `700 ${o.size || 34}px ${PIX}`; const tw = Math.min(W - 70, c.measureText(text).width + 50), h = (o.size || 34) * 1.45, col = o.col || '#ffc93c', dk = o.dk || '#c48f12';
    for (const s of [-1, 1]) { c.fillStyle = dk; c.beginPath(); c.moveTo(s * tw / 2, -h / 2 + 8); c.lineTo(s * (tw / 2 + 26), -h / 2 + 8); c.lineTo(s * (tw / 2 + 14), 8); c.lineTo(s * (tw / 2 + 26), h / 2 + 8); c.lineTo(s * tw / 2, h / 2 + 8); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(-tw / 2, -h / 2 + 5, tw, h, 6); c.fill();
    c.fillStyle = col; c.beginPath(); c.roundRect(-tw / 2, -h / 2, tw, h, 6); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-tw / 2 + 6, -h / 2 + 4, tw - 12, 3);
    c.fillStyle = o.ink || '#2a1a02'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 2, tw - 20);
    c.restore();
  }
  const gradeBadge = (c, x, y, g, r = 18) => { const col = { E: '#9aa0ad', D: '#57dd96', C: '#5cb8ff', B: '#c08cff', A: '#ff9a4a', S: '#ffc93c', F: '#ff7aa2' }[g] || '#9aa0ad';
    SC.depth(c, () => { c.beginPath(); c.arc(x, y, r, 0, 7); }, col, 3, 0.3); c.fillStyle = '#1b1530'; c.font = `700 ${r * 1.2}px ${PIX}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(g, x, y + 1); };
  /* the speech box drawn on the show's own canvas: portrait, name tag and the line typing out */
  const PIC = {};
  function pic(who, face) { const k = who + face; if (PIC[k]) return PIC[k]; const cv = document.createElement('canvas');
    if (who === 'tala') talaPortrait(cv, face); else npcPortrait(cv, who, face); return (PIC[k] = cv); }
  function wrap(c, text, w) { const out = []; let line = '';
    for (const word of text.split(' ')) { const tryL = line ? line + ' ' + word : word; if (c.measureText(tryL).width > w && line) { out.push(line); line = word; } else line = tryL; }
    if (line) out.push(line); return out; }
  function box(c, W, H, who, face, text, shown, done, t) {
    const bh = 150, x = 12, y = H - bh - 18, w = W - 24, ps = 88;
    c.save(); c.fillStyle = 'rgba(18,19,30,.94)'; c.strokeStyle = '#3a3f58'; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y, w, bh, 12); c.fill(); c.stroke();
    c.drawImage(pic(who, face), x + 12, y + 18, ps, ps); c.strokeStyle = '#11131c'; c.lineWidth = 3; c.beginPath(); c.roundRect(x + 12, y + 18, ps, ps, 10); c.stroke();
    const name = who === 'tala' ? 'Tala' : NPC[who].name; c.font = `700 16px ${PIX}`; const nw = c.measureText(name).width + 18;
    c.fillStyle = TAGS[who] || NPC[who].tag; c.beginPath(); c.roundRect(x + ps + 26, y - 12, nw, 24, 5); c.fill(); c.fillStyle = '#16121e'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText(name, x + ps + 35, y + 1);
    c.font = `500 17px ${BODY}`; c.fillStyle = '#eef0f6'; c.textBaseline = 'top';
    let left = shown; wrap(c, text, w - ps - 44).slice(0, 5).forEach((ln, i) => { if (left <= 0) return; c.fillText(ln.slice(0, left), x + ps + 28, y + 22 + i * 24); left -= ln.length + 1; });
    if (done && Math.floor(t / 400) % 2 === 0) { c.fillStyle = '#ffc93c'; c.beginPath(); c.moveTo(x + w - 22, y + bh - 22); c.lineTo(x + w - 12, y + bh - 16); c.lineTo(x + w - 22, y + bh - 10); c.closePath(); c.fill(); }
    c.restore();
  }

  /* ---------- the beats. Each returns { draw(c,W,H,t), who, face, text, textAt, auto } ---------- */
  const B = {};
  /* lights down, spotlights sweep, fireworks, the cup's name on a ribbon */
  B.open = info => ({ textAt: 2600, auto: 3400, draw(c, W, H, t) {
    const dark = t < 600 ? 0.25 + 0.6 * eo(t / 600) : 0.85 - 0.5 * eo((t - 1300) / 900);
    stadium(c, W, H, t, { dark, cheer: t > 1300, spots: t > 500 ? cl((t - 500) / 400) : 0, hz: 0.5 });
    fireworks(c, W, H, t, 1300, 9);
    gradeBadge(c, W / 2, H * 0.27 - 50, info.cup.grade, 20 * cl((t - 1500) / 300) + 0.01);
    ribbon(c, W, H * 0.27, info.cup.name, t, 1300);
    if (t > 1900) { c.globalAlpha = cl((t - 1900) / 300); c.font = `700 18px ${PIX}`; c.fillStyle = '#fff6d8'; c.textAlign = 'center'; c.fillText(info.cup.sub, W / 2, H * 0.27 + 44); c.globalAlpha = 1; }
  } });
  /* Mira on the announcer's stand at the edge of the ring, under a spotlight */
  B.mc = (info, text, o = {}) => ({ who: 'mc', face: o.face || 'happy', text, textAt: 300, draw(c, W, H, t) {
    stadium(c, W, H, t, { dark: 0.35, cheer: true, spots: 1, spotAt: { x: W * 0.5, y: H * 0.55 } });
    const fx = W * 0.5, fy = H * 0.6;
    const g = c.createRadialGradient(fx, fy, 4, fx, fy, 120); g.addColorStop(0, 'rgba(255,246,210,.45)'); g.addColorStop(1, 'rgba(255,246,210,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    SC.depth(c, () => { c.beginPath(); c.roundRect(fx - 64, fy - 6, 128, 26, 6); }, '#3a2a5c', 3, 0.3);
    c.fillStyle = '#ffc93c'; c.fillRect(fx - 60, fy, 120, 4);
    npcFull(c, 'mc', fx, fy, 210, Math.floor(t / 260) % 2 ? 'talk' : 'happy', o.pose || (t % 2400 < 1200 ? 'wave' : 'point'), t);
    if (o.fw) fireworks(c, W, H, t, 0, 6, 0.2);
  } });
  /* Tala and the Snabit at the players' gate, the bright ring beyond */
  B.gate = (info, text, face = 'talk') => ({ who: 'tala', face, text, textAt: 500, draw(c, W, H, t) {
    c.fillStyle = '#2a2140'; c.fillRect(0, 0, W, H);
    const ox = W * 0.18, ow = W * 0.64, oy = H * 0.12, oh = H * 0.5;
    c.save(); c.beginPath(); c.roundRect(ox, oy, ow, oh, 10); c.clip(); arenaScene(c, W, oy + oh, true, [], t, true, 0.62, null);
    c.fillStyle = 'rgba(255,248,220,.25)'; c.fillRect(ox, oy, ow, oh); c.restore();
    // the tunnel: ceiling, two walls and the floor running out to the bright opening
    const poly = (pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); };
    poly([[0, 0], [W, 0], [ox + ow, oy], [ox, oy]], '#1a1430'); poly([[0, 0], [ox, oy], [ox, oy + oh], [0, H]], '#251c3c'); poly([[W, 0], [ox + ow, oy], [ox + ow, oy + oh], [W, H]], '#251c3c');
    const fl = c.createLinearGradient(0, oy + oh, 0, H); fl.addColorStop(0, '#6a5684'); fl.addColorStop(1, '#2a2140'); c.fillStyle = fl; c.beginPath(); c.moveTo(ox, oy + oh); c.lineTo(ox + ow, oy + oh); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.fillStyle = '#ffc93c'; for (let k = 0; k < 6; k++) { const f = k / 6, on = Math.floor(t / 260 - k) % 3 === 0; c.globalAlpha = on ? 1 : 0.35;
      for (const [x0, x1] of [[0, ox], [W, ox + ow]]) { c.beginPath(); c.arc(x0 + (x1 - x0) * f, H * 0.42 + (oy + oh * 0.5 - H * 0.42) * f, 6 - f * 3, 0, 7); c.fill(); } } c.globalAlpha = 1;
    c.fillStyle = '#ffc93c'; c.font = `700 20px ${PIX}`; c.textAlign = 'center'; c.fillText('ENTRANCE', W / 2, oy - 12);
    const lp = c.createRadialGradient(W / 2, oy + oh, 10, W / 2, oy + oh, W * 0.6); lp.addColorStop(0, 'rgba(255,240,200,.35)'); lp.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = lp; c.fillRect(0, oy + oh, W, H);
    const gy = H * 0.7; shadow(c, W * 0.6, gy, 46); mon(c, info.me.spec, W * 0.6, gy, 120, Math.floor(t / 900) % 3 === 2 ? 'determined' : 'idle', t, false, { look: [0.3, -0.6] });
    talaFull(c, W * 0.28, gy + 6, 210, 'talk', false, t);
  } });
  /* the draw: eight tiles light up one by one and the lines join them to the trophy */
  B.bracket = (info, text) => ({ who: 'mc', face: 'talk', text, textAt: 1500, draw(c, W, H, t) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1d4a'); g.addColorStop(1, '#14102a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    spots(c, W, H, t, 0.5);
    c.font = `700 26px ${PIX}`; c.fillStyle = '#ffc93c'; c.textAlign = 'center'; c.fillText('The draw', W / 2, 52);
    const F = info.field, n = F.length, rows = n / 2, top = 86, avail = H - top - 200, th = Math.min(66, avail / rows - 10), tw = W * 0.34;
    const tiles = F.map((e, i) => { const side = i < rows ? 0 : 1, r = i % rows; return { e, x: side ? W - 14 - tw : 14, y: top + r * (avail / rows) + 4, side }; });
    // lines: pairs, then pairs of pairs, then the middle
    c.lineWidth = 3; c.lineCap = 'round';
    const lineIn = cl((t - 300 - n * 140) / 500);
    for (let s = 0; s < 2; s++) for (let p = 0; p < rows / 2; p++) { const a = tiles[s * rows + p * 2], b = tiles[s * rows + p * 2 + 1], ex = s ? a.x - 18 : a.x + tw + 18;
      const mine = a.e.me || b.e.me; c.strokeStyle = mine ? '#ffc93c' : 'rgba(255,255,255,.35)'; c.globalAlpha = lineIn;
      const ay = a.y + th / 2, by = b.y + th / 2, ax = s ? a.x : a.x + tw; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ex, ay); c.lineTo(ex, by); c.lineTo(ax, by); c.moveTo(ex, (ay + by) / 2); c.lineTo(W / 2 + (s ? 22 : -22), (ay + by) / 2); c.stroke(); }
    c.globalAlpha = 1;
    // the trophy in the middle
    const tk = back((t - 300 - n * 140 - 300) / 450); if (tk > 0) { c.save(); c.translate(W / 2, top + avail / 2); c.scale(tk, tk); trophy(c, 0, 0, 34); c.restore(); }
    tiles.forEach((T, i) => { const at = 300 + i * 140, k = back((t - at) / 360); if (t < at) return;
      c.save(); c.translate(T.x + tw / 2, T.y + th / 2); c.scale(k, k); c.translate(-tw / 2, -th / 2);
      const col = T.e.me ? '#ffc93c' : T.e.rook ? '#ffb04a' : '#3a3f58';
      c.fillStyle = 'rgba(14,15,26,.92)'; c.strokeStyle = col; c.lineWidth = T.e.me || T.e.rook ? 3 : 2; c.beginPath(); c.roundRect(0, 0, tw, th, 8); c.fill(); c.stroke();
      c.save(); c.beginPath(); c.roundRect(2, 2, th - 4, th - 4, 6); c.clip(); c.fillStyle = T.e.me ? '#4a3a10' : '#262a3e'; c.fillRect(0, 0, th, th);
      mon(c, T.e.spec, th / 2, th * 1.02, th * 0.95, 'idle', t + i * 300, !!T.side); c.restore();
      c.fillStyle = '#eef0f6'; c.font = `700 ${Math.min(15, th * 0.24)}px ${PIX}`; c.textAlign = 'left'; c.textBaseline = 'middle';
      const nm = T.e.name.replace(/^Rook's /, ''); c.fillText(nm, th + 4, th * 0.36, tw - th - 8);
      c.fillStyle = T.e.me ? '#ffc93c' : T.e.rook ? '#ffb04a' : '#9aa0b8'; c.font = `500 ${Math.min(12, th * 0.2)}px ${PIX}`; c.fillText(T.e.me ? "Tala's ranch" : T.e.breeder, th + 4, th * 0.68, tw - th - 8);
      c.restore(); });
  } });
  function trophy(c, x, y, s) {
    c.save(); c.translate(x, y); const gold = '#ffc93c';
    SC.depth(c, () => { c.beginPath(); c.roundRect(-s * 0.5, s * 0.55, s, s * 0.28, 4); }, '#8a5a2a', 2, 0.3);
    c.fillStyle = gold; c.fillRect(-s * 0.12, s * 0.2, s * 0.24, s * 0.38);
    c.strokeStyle = gold; c.lineWidth = s * 0.12; for (const k of [-1, 1]) { c.beginPath(); c.arc(k * s * 0.5, -s * 0.28, s * 0.22, k > 0 ? -1.4 : 1.4 - Math.PI * 0, k > 0 ? 1.4 : Math.PI * 2 - 1.4, k < 0); c.stroke(); }
    SC.depth(c, () => { c.beginPath(); c.moveTo(-s * 0.55, -s * 0.62); c.lineTo(s * 0.55, -s * 0.62); c.quadraticCurveTo(s * 0.5, s * 0.25, 0, s * 0.25); c.quadraticCurveTo(-s * 0.5, s * 0.25, -s * 0.55, -s * 0.62); c.closePath(); }, gold, 2.5, 0.25);
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-s * 0.22, -s * 0.3, s * 0.08, s * 0.2, 0.2, 0, 7); c.fill();
    c.restore();
  }
  /* the match card: the two Snabits slide in from each side and VS slams down between them */
  B.vs = (info, text) => ({ who: 'mc', face: 'happy', text, textAt: 900, draw(c, W, H, t) {
    const sl = eo(t / 500), cut = H * 0.08;
    c.fillStyle = '#121022'; c.fillRect(0, 0, W, H);
    const half = (side, cols) => { c.save(); c.beginPath(); if (!side) { c.moveTo(0, 0); c.lineTo(W / 2 + cut, 0); c.lineTo(W / 2 - cut, H); c.lineTo(0, H); } else { c.moveTo(W / 2 + cut + 6, 0); c.lineTo(W, 0); c.lineTo(W, H); c.lineTo(W / 2 - cut + 6, H); }
      c.closePath(); c.clip(); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 3; for (let k = 0; k < 14; k++) { const y = (hsh(k + side * 20) * H + t * (0.3 + hsh(k) * 0.4) * (side ? 1 : -1)) % H; c.beginPath(); c.moveTo(0, y < 0 ? y + H : y); c.lineTo(W, (y < 0 ? y + H : y) - 30); c.stroke(); }
      c.restore(); };
    c.save(); c.translate(-W * (1 - sl), 0); half(0, ['#2c5aa8', '#16264e']); c.restore();
    c.save(); c.translate(W * (1 - sl), 0); half(1, ['#b8364a', '#4e1622']); c.restore();
    const gy = H * 0.5, px = Math.min(150, W * 0.38);
    shadow(c, W * 0.27 - W * (1 - sl), gy, 40); shadow(c, W * 0.73 + W * (1 - sl), gy, 40);
    mon(c, info.me.spec, W * 0.27 - W * (1 - sl), gy, px * (info.me.k || 1), t > 600 && t < 1400 ? 'determined' : 'idle', t, false);
    mon(c, info.foe.spec, W * 0.73 + W * (1 - sl), gy, px * (info.foe.k || 1), 'idle', t + 500, true);
    const plate = (x, e, al, col) => { c.save(); c.globalAlpha = cl((t - 500) / 300); c.textAlign = al; c.fillStyle = '#fff'; c.font = `700 22px ${PIX}`; c.fillText(e.name, x, gy + 40, W * 0.44);
      c.font = `500 15px ${PIX}`; c.fillStyle = col; c.fillText(e.line, x, gy + 62, W * 0.44); c.restore(); };
    plate(16, info.me, 'left', '#a9d4ff'); plate(W - 16, info.foe, 'right', '#ffb3be');
    if (t > 500) { const k = t < 700 ? 1.8 - 0.8 * eo((t - 500) / 200) : 1, sh = t < 760 ? (hsh(Math.floor(t / 30)) - 0.5) * 8 : 0;
      c.save(); c.translate(W / 2 + sh, H * 0.24); c.scale(k, k); c.font = `700 64px ${PIX}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 8; c.strokeStyle = '#1b1530'; c.strokeText('VS', 0, 0); c.fillStyle = '#ffc93c'; c.fillText('VS', 0, 0); c.restore(); }
    c.font = `700 18px ${PIX}`; c.fillStyle = '#fff6d8'; c.textAlign = 'center'; c.globalAlpha = cl((t - 300) / 300); c.fillText(info.round, W / 2, 34); c.globalAlpha = 1;
  } });
  /* after the match: the winner celebrates in the ring and Mira or Tala says how it went */
  B.result = (info, who, text, face) => ({ who, face, text, textAt: who === 'tala' ? 200 : 1200, draw(c, W, H, t) {
    const won = info.won;
    stadium(c, W, H, t, { cheer: true, spots: 0.6, spotAt: { x: W * (won ? 0.3 : 0.7), y: H * 0.6 } });
    const gy = H * 0.62, hop = Math.abs(Math.sin(t / 220)) * 22;
    shadow(c, W * 0.3, gy, 46); shadow(c, W * 0.7, gy, 46);
    const dr = info.draw, up = hop > 11 ? 'jump' : 'happy';
    mon(c, info.me.spec, W * 0.3, gy - (won ? hop : 0), 150, dr ? 'tired' : won ? up : 'sad', t, false);
    mon(c, info.foe.spec, W * 0.7, gy - (won || dr ? 0 : hop), 150, dr ? 'tired' : won ? 'sad' : up, t, true);
    if (won) confetti(c, W, H * 0.7, t, 30);
    ribbon(c, W, H * 0.2, info.title, t, 100, won ? {} : { col: '#9aa0ad', dk: '#5a6070' });
  } });
  /* the podium: second on the left, first in the middle with the trophy, third on the right */
  B.podium = (info, who, text, face) => ({ who, face, text, textAt: who === 'tala' ? 200 : 1600, draw(c, W, H, t) {
    stadium(c, W, H, t, { dark: 0.45, cheer: true, spots: 1, spotAt: { x: W / 2, y: H * 0.5 } });
    const base = H * 0.66, step = [[W * 0.18, 56, '2'], [W * 0.5, 96, '1'], [W * 0.82, 30, '3']];
    const order = [1, 0, 2];
    step.forEach(([x, h, n], i) => { const at = 200 + order[i] * 350, k = eo((t - at) / 400), hh = h * k; if (t < at) return;
      SC.depth(c, () => { c.beginPath(); c.roundRect(x - W * 0.16, base - hh, W * 0.32, hh + 40, 4); }, n === '1' ? '#f1e6c4' : '#e2dccb', 3, 0.25);
      c.fillStyle = n === '1' ? '#d4a62a' : n === '2' ? '#9aa0ad' : '#c4834a'; c.font = `700 30px ${PIX}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, x, base - hh + 26);
      const e = info.podium[+n - 1]; if (!e) return; const ek = back((t - at - 300) / 380); if (ek <= 0) return;
      const hop = n === '1' ? Math.abs(Math.sin(t / 240)) * 10 : 0;
      mon(c, e.spec, x, base - hh - hop, (n === '1' ? 130 : 100) * Math.min(1, ek), n === '1' ? (hop > 5 ? 'jump' : 'happy') : 'happy', t + i * 400, n === '3');
      c.fillStyle = e.me ? '#ffc93c' : '#fff'; c.font = `700 14px ${PIX}`; c.fillText(e.name.replace(/^Rook's /, ''), x, base + 30, W * 0.29); });
    if (t > 1300) { const k = back((t - 1300) / 400); c.save(); c.translate(W / 2, base - 96 - 200 + Math.sin(t / 500) * 4); c.scale(k, k); trophy(c, 0, 0, 34); c.restore(); }
    fireworks(c, W, H, t, 1300, 8, 0.18); if (t > 1300) confetti(c, W, H, t - 1300, 40);
    ribbon(c, W, H * 0.1, info.cup.name, t, 1100, { size: 28 });
  } });

  /* ---------- running a show ---------- */
  const CPS = 0.045;   // characters per millisecond while a line types out
  function frame(c, W, H, b, t) {
    c.clearRect(0, 0, W, H); b.draw(c, W, H, t);
    if (b.fadeIn !== false && t < 260) { c.fillStyle = `rgba(0,0,0,${1 - t / 260})`; c.fillRect(0, 0, W, H); }
    if (b.text && t >= (b.textAt || 0)) { const sh = b.skipAt != null ? b.text.length : Math.floor((t - b.textAt) * CPS); box(c, W, H, b.who, b.face || 'talk', b.text, sh, sh >= b.text.length, t); }
  }
  /* draws one moment of one beat onto a canvas, for storyboards */
  function still(cv, b, t, W, H) { const c = cv.getContext('2d'), d = cv.width / W; c.setTransform(d, 0, 0, d, 0, 0); frame(c, W, H, { ...b, fadeIn: false }, t); }
  function run(beats) {
    return new Promise(done => {
      if (!beats.length) return done();
      API.on = true; API.mus = beats[0].mus || 'arena';
      const start = b => { if (b.mus !== undefined) API.mus = b.mus; if (b.jingle && typeof musJingle === 'function') musJingle(b.jingle); };
      const cv = SUMMON.overlay(), c = cv.getContext('2d'), d = devicePixelRatio || 1, W = cv.width / d, H = cv.height / d;
      const skip = document.createElement('button'); skip.className = 'small show-skip'; skip.textContent = 'Skip ▸▸'; document.body.appendChild(skip);
      let i = 0, t0 = performance.now(), over = false;
      const end = () => { if (over) return; over = true; API.on = false; cv.remove(); skip.remove(); done(); };
      const next = () => { i++; t0 = performance.now(); if (i >= beats.length) end(); else start(beats[i]); };
      start(beats[0]);
      const typed = (b, t) => !b.text || b.skipAt != null || (t - b.textAt) * CPS >= b.text.length;
      cv.onpointerdown = () => { const b = beats[i], t = performance.now() - t0; if (!b || t < 250) return;
        if (b.text && t < b.textAt) { t0 -= b.textAt - t; return; } if (!typed(b, t)) b.skipAt = t; else next(); };
      skip.onclick = end;
      const step = now => { if (over) return; const b = beats[i], t = now - t0; c.setTransform(d, 0, 0, d, 0, 0); frame(c, W, H, b, t);
        if (b.cue && !b.cued && t >= b.cue[0]) { b.cued = true; if (typeof sfx === 'function') sfx(b.cue[1]); }
        const textEnd = b.text ? (b.skipAt != null ? b.skipAt : b.textAt + b.text.length / CPS) : 0;
        if (b.text ? t > textEnd + 2600 : t > (b.auto || 2000)) next();
        requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  const API = { B, run, still, frame, mon, trophy, on: false, mus: null };
  return API;
})();

/* ---------- the lines. Rico calls the cup, Tala talks to the player ---------- */
const CUPLINE = {
  open: c => `Welcome to the ${c.name}! ${c.size} Snabits signed up this week, and the winner takes home ${c.purse.toLocaleString()} bits${c.prize ? ` and ${/^[AEIOU]/.test(c.prize) ? 'an' : 'a'} ${c.prize}` : ''}.`,
  rules: c => c.format === 'robin' ? 'Everyone fights everyone once. A win is worth 3 points and a draw is worth 1.' : c.format === 'single' ? "It's one match, and the winner takes the purse." : c.format === 'bo3' ? "It's a knockout, and every match is the best of three." : "It's a knockout, so one loss and you're out.",
  draw: (me, foe) => `Here's the draw. ${me} meets ${foe} in the first round.`,
  vs: (round, me, foe) => `${round}! On the left, ${me.name} from Tala's ranch. On the right, ${foe.rook ? `${foe.name.replace(/^Rook's /, '')} with Rook from the Grand Ranch` : `${foe.name}, raised by ${foe.breeder}`}!`,
  /* Tala's word at the gate: the one thing about this opponent worth knowing */
  advice(meF, foeF, meName, foeName) {
    const hurt = Math.max(...[foeF.el1, foeF.el2].filter(Boolean).map(e => effect(e, meF))), hit = Math.max(...[meF.el1, meF.el2].filter(Boolean).map(e => effect(e, foeF)));
    if (hit > 1) return `${meName}'s ${meF.el1} skills are strong against ${foeName}. Use them early and keep up the pressure.`;
    if (hurt > 1) return `${foeName}'s ${foeF.el1} skills hit ${meName} hard. Guard when it charges up and try to end it quickly.`;
    const st = ['pow', 'grd', 'mnd', 'spr', 'spd'], top = st.reduce((a, k) => foeF.base[k] > foeF.base[a] ? k : a, 'pow');
    if (meF.base.spd > foeF.base.spd * 1.15) return `${meName} is quicker than ${foeName}, so it should get the first hit in. Start with your strongest skill.`;
    if (top === 'pow' || top === 'mnd') return `${foeName} hits hard. Guard when it charges up and hit back on the next turn.`;
    if (top === 'grd') return `${foeName} can take a lot of hits. Save your energy for strong skills rather than chipping away.`;
    if (top === 'spr') return `${foeName} rarely misses and shakes off statuses, so hit it hard rather than trying to slow it down.`;
    return `${foeName} looks about even with ${meName}. Watch its first few moves before using your strongest skills.`;
  },
  recap(res, me, foe) {
    if (res.winner === null) return "Time's up and the judges can't split them. It's a draw!";
    if (res.winner === 0) {
      if (res.judged) return `Time's up, and the judges give it to ${me}!`;
      if (res.turns <= 4) return `${me} wins in just ${res.turns} turns!`;
      if (res.hpLeft > 0.6) return `${me} wins with most of its HP left! ${foe} couldn't keep up.`;
      if (res.hpLeft < 0.2) return `${me} wins, and only just! It was down to its last bit of HP.`;
      return `${me} wins! It took ${res.turns} turns to wear ${foe} down.`;
    }
    if (res.judged) return `Time's up, and the judges give it to ${foe}.`;
    if (res.foeHpLeft < 0.2) return `${foe} wins, but only just! ${me} had it down to its last bit of HP.`;
    if (res.foeHpLeft > 0.6) return `${foe} wins, and it still has most of its HP left.`;
    return `${foe} wins after ${res.turns} turns.`;
  },
  /* Tala after a match: what it means for the cup */
  after(res, me, c, cup) {
    const won = res.winner === 0;
    if (c.format === 'robin') { const left = cup.rounds.length - cup.round; return won ? `Good job, ${me}! That's ${cup.pts[0]} points${left ? ` with ${left} round${left > 1 ? 's' : ''} to go` : ''}.` : res.winner === null ? `A draw still gets us a point.${left ? ` There ${left > 1 ? 'are' : 'is'} ${left} round${left > 1 ? 's' : ''} left.` : ''}` : left ? `We lost that one, but there ${left > 1 ? 'are' : 'is'} still ${left} round${left > 1 ? 's' : ''} to go.` : `We lost that one, ${me}. Let's see where we finish.`; }
    if (c.format === 'single') return won ? `We did it, ${me}!` : `It's okay, ${me}. We'll train up and come back for the next one.`;
    if (!won) return `It's okay, ${me}. ${cup.lastFoe} was stronger this time. We'll train up and come back for the next one.`;
    const nx = ['the semi-final', 'the final'][cup.round - 1];
    return nx ? `Nice work, ${me}! Next up is ${nx}.` : `Nice work, ${me}!`;
  },
  podium(place, me, champ, c, prize) {
    if (place === 1) return `In first place, and taking home ${prize.toLocaleString()} bits, ${me} from Tala's ranch!`;
    if (place === 2) return `${champ} wins the ${c.name}! ${me} from Tala's ranch takes second place and ${prize.toLocaleString()} bits.`;
    if (place === 3) return `${champ} wins the ${c.name}! ${me} from Tala's ranch finishes third and takes home ${prize.toLocaleString()} bits.`;
    return `${champ} wins the ${c.name}! Thanks for coming, everyone.`;
  },
  talaEnd(place, me, up, prize) {
    if (place === 1) return up ? `We won, ${me}! And that means you're grade ${up} now.` : `We won the cup, ${me}! I knew you could do it.`;
    if (place === 2) return `Second place! We were one win away from the trophy. ${prize ? `The ${prize.toLocaleString()} bits will help with the loan.` : ''}`.trim();
    if (place === 3) return `Third place and ${prize.toLocaleString()} bits. That'll help with the loan.`;
    return `We'll get them next time, ${me}. Let's go home and rest up.`;
  },
};

/* ---------- the shows the cups play ---------- */
const showSpec = fm => SUMMON.specFor(fm);
const showCup = c => { const fm = c.format, n = CUP.field.length;
  return { name: c.name.replace(/ \([A-S]\)$/, ''), grade: c.major || c.legend ? 'S' : c.small ? 'F' : c.grade, format: fm, size: n, purse: cupPurse(c), prize: c.prize,
    sub: fm === 'single' ? 'One match' : `${fm === 'robin' ? 'Round robin' : fm === 'bo3' ? 'Knockout, best of 3' : 'Knockout'} · ${n} Snabits` }; };
function showSide(i) { const e = CUP.field[i], s = RS;
  if (e.me) return { name: displayName(s), spec: showSpec(fightMon(s)), line: `Lv ${s.level} · Grade ${s.grade}`, me: true };
  return { name: e.name, spec: showSpec(e.o.fm), line: `Lv ${e.o.level} · ${e.rook ? 'Rook' : e.breeder}`, rook: !!e.rook, breeder: e.breeder }; }
const showOk = () => CUP && CUP.c.format !== 'team5';
/* before a match: the opening the first time, then the VS card with the square-off sting */
function cupBeforeShow(opp) {
  if (!showOk()) return Promise.resolve();
  const c = CUP.c, cup = showCup(c), me = showSide(0), foe = showSide(opp), L = CUPLINE, B = CUPSHOW.B, e = CUP.field[opp];
  const info = { cup, me, foe, round: roundName(), field: CUP.field.map((_, i) => ({ ...showSide(i), me: !!CUP.field[i].me, breeder: CUP.field[i].breeder })) };
  const beats = [];
  if (!CUP.opened) { CUP.opened = true;
    const foeF = e.o ? makeFighter(e.o.fm, e.o.skills, e.o.level) : null;
    beats.push({ ...B.open(info), mus: 'arena' }, B.mc(info, L.open(cup)), B.mc(info, L.rules(cup), { pose: 'point' }));
    if (foeF) beats.push(B.gate(info, L.advice(playerFighter(RS), foeF, me.name, foe.name)));
    if (c.format === 'elim' || c.format === 'bo3') beats.push(B.bracket(info, L.draw(me.name, foe.name))); }
  beats.push({ ...B.vs(info, L.vs(roundName(), me, { ...e, name: e.name })), jingle: 'vs', mus: 'cup' });
  return CUPSHOW.run(beats);
}
/* after a match: Mira's recap, then Tala if the cup goes on */
function cupAfterShow(opp, res) {
  if (!showOk()) return Promise.resolve();
  const c = CUP.c, me = showSide(0), foe = showSide(opp), won = res.winner === 0, draw = res.winner === null, B = CUPSHOW.B, L = CUPLINE;
  const info = { cup: showCup(c), me, foe, won, draw, title: draw ? 'Draw' : `${won ? me.name : foe.name} wins${won ? '!' : ''}` };
  CUP.lastFoe = foe.name;
  const series = c.format === 'bo3' && CUP.series && CUP.series.opp != null;
  const over = c.format === 'single' || CUP.out || (c.format === 'robin' ? CUP.round >= CUP.rounds.length : !series && CUP.alive.length === 1);
  const beats = [{ ...B.result(info, 'mc', L.recap(res, me.name, foe.name), won ? 'happy' : 'talk'), mus: 'arena' }];
  if (!over) beats.push(B.result(info, 'tala', series ? `${won ? `Good job, ${me.name}!` : `We lost that one, ${me.name}.`} It's ${CUP.series.me} to ${CUP.series.them} in the series.` : L.after(res, me.name, c, CUP), won || draw ? 'happy' : 'worried'));
  return CUPSHOW.run(beats);
}
/* at the end: the top three on the podium */
function cupPodiumShow() {
  if (!showOk() || CUP.place == null || CUP.field.length < 4 || !CUP.fights) return Promise.resolve();
  const c = CUP.c, order = cupOrder(), me = showSide(0), B = CUPSHOW.B, L = CUPLINE, place = CUP.place, champ = showSide(order[0]).name;
  const info = { cup: showCup(c), podium: order.slice(0, 3).map(i => ({ ...showSide(i), me: !!CUP.field[i].me })) };
  const up = (CUP.lines.find(l => /moves up to grade (\w)/.test(l)) || '').match(/grade (\w)/);
  return CUPSHOW.run([{ ...B.podium(info, 'mc', L.podium(place, me.name, champ, info.cup, CUP.prize), 'happy'), mus: place === 1 ? null : 'arena', jingle: place === 1 ? true : null },
    B.podium(info, 'tala', L.talaEnd(place, me.name, up && up[1], CUP.prize), place <= 3 ? 'happy' : 'worried')]);
}
