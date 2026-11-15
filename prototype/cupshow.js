/* The cup show: the build-up and wrap-up around cup fights, the way a broadcast would do it.
   The lights go down and the cup's name comes up with fireworks, Mira the announcer opens it, Josie has a word at the gate,
   the draw is shown, then each match gets a VS card. After a match Rico sums it up and Josie reacts, and at the end
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
      c.globalAlpha = (1 - k) * 0.35; c.fillStyle = col; c.beginPath(); c.arc(cx, cy + k * k * 30, r * 0.9, 0, 7); c.fill(); c.globalAlpha = 1 - k;   // a soft glow without shadowBlur
      for (let p = 0; p < 28; p++) { const a = p / 28 * Math.PI * 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r + k * k * 40;
        c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a) * 14, y - Math.sin(a) * 14 - 3); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + Math.cos(a + 0.1) * r * 0.55, cy + Math.sin(a + 0.1) * r * 0.55 + k * k * 30, 1.6, 0, 7); c.fill(); }
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
    const name = who === 'tala' ? 'Josie' : NPC[who].name; c.font = `700 16px ${PIX}`; const nw = c.measureText(name).width + 18;
    c.fillStyle = TAGS[who] || NPC[who].tag; c.beginPath(); c.roundRect(x + ps + 26, y - 12, nw, 24, 5); c.fill(); c.fillStyle = '#16121e'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText(name, x + ps + 35, y + 1);
    c.font = `500 17px ${BODY}`; c.fillStyle = '#eef0f6'; c.textBaseline = 'top';
    let left = shown; wrap(c, text, w - ps - 44).slice(0, 5).forEach((ln, i) => { if (left <= 0) return; c.fillText(ln.slice(0, left), x + ps + 28, y + 22 + i * 24); left -= ln.length + 1; });
    if (done && Math.floor(t / 400) % 2 === 0) { c.fillStyle = '#ffc93c'; c.beginPath(); c.moveTo(x + w - 22, y + bh - 22); c.lineTo(x + w - 12, y + bh - 16); c.lineTo(x + w - 22, y + bh - 10); c.closePath(); c.fill(); }
    c.restore();
  }

  /* ---------- the beats. Each returns { draw(c,W,H,t), who, face, text, textAt, auto } ---------- */
  const B = {};
  /* lights down, spotlights sweep, fireworks, the cup's name on a ribbon */
  /* the lights ease down in one smooth move while the spotlights come on, then the cup's name bursts in and the lights come back */
  const eio = k => { k = cl(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  B.open = info => ({ textAt: 3200, auto: 4000, fadeIn: false, draw(c, W, H, t) {
    const B0 = 1800, dark = t < B0 ? 0.85 * eio(t / 1500) : 0.85 - 0.5 * eio((t - B0) / 1100);
    stadium(c, W, H, t, { dark, cheer: t > B0, spots: cl((t - 500) / 900), hz: 0.5 });
    if (t > B0 - 60 && t < B0 + 140) { c.fillStyle = `rgba(255,248,225,${0.5 * (1 - Math.abs(t - B0 - 40) / 100)})`; c.fillRect(0, 0, W, H); }   // a flash on the burst
    fireworks(c, W, H, t, B0, 9);
    gradeBadge(c, W / 2, H * 0.27 - 50, info.cup.grade, 20 * cl((t - B0 - 200) / 300) + 0.01);
    ribbon(c, W, H * 0.27, info.cup.name, t, B0);
    if (t > B0 + 600) { c.globalAlpha = cl((t - B0 - 600) / 300); c.font = `700 18px ${PIX}`; c.fillStyle = '#fff6d8'; c.textAlign = 'center'; c.fillText(info.cup.sub, W / 2, H * 0.27 + 44); c.globalAlpha = 1; }
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
  /* Josie and the Snabit at the players' gate, the bright ring beyond */
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
  function trophy(c, x, y, s) {
    c.save(); c.translate(x, y); const gold = '#ffc93c';
    SC.depth(c, () => { c.beginPath(); c.roundRect(-s * 0.5, s * 0.55, s, s * 0.28, 4); }, '#8a5a2a', 2, 0.3);
    c.fillStyle = gold; c.fillRect(-s * 0.12, s * 0.2, s * 0.24, s * 0.38);
    c.strokeStyle = gold; c.lineWidth = s * 0.12; for (const k of [-1, 1]) { c.beginPath(); c.arc(k * s * 0.5, -s * 0.28, s * 0.22, k > 0 ? -1.4 : 1.4 - Math.PI * 0, k > 0 ? 1.4 : Math.PI * 2 - 1.4, k < 0); c.stroke(); }
    SC.depth(c, () => { c.beginPath(); c.moveTo(-s * 0.55, -s * 0.62); c.lineTo(s * 0.55, -s * 0.62); c.quadraticCurveTo(s * 0.5, s * 0.25, 0, s * 0.25); c.quadraticCurveTo(-s * 0.5, s * 0.25, -s * 0.55, -s * 0.62); c.closePath(); }, gold, 2.5, 0.25);
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-s * 0.22, -s * 0.3, s * 0.08, s * 0.2, 0.2, 0, 7); c.fill();
    c.restore();
  }
  /* after the match: the winner celebrates in the ring and Mira or Josie says how it went */
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
  /* the podium: second on the left, first in the middle with the trophy, third on the right.
     The winner lands, catches the trophy and hops with it held up, second claps facing it, third waves, and the crowd's cameras flash.
     The second beat (Josie's line) starts with everyone already up, from `skip` ms in */
  const pz = (name, o) => Object.assign(CHIBI.blend(name, name, 1), o);
  function rays(c, x, y, t, a) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.rotate(t / 2600);
    for (let k = 0; k < 12; k++) { c.rotate(Math.PI / 6); const g = c.createLinearGradient(0, 0, 260, 0); g.addColorStop(0, `rgba(255,214,90,${0.34 * a})`); g.addColorStop(1, 'rgba(255,214,90,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(260, -26); c.lineTo(260, 26); c.closePath(); c.fill(); }
    c.restore();
  }
  function flashes(c, W, H, t) {   // phone cameras in the stands
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) { const per = 2300 + hsh(i + 40) * 1700, age = (t + hsh(i + 50) * per) % per; if (age > 170) continue;
      const x = W * hsh(i + 60), y = H * (0.12 + hsh(i + 70) * 0.3), a = 1 - age / 170, r = 5 + 16 * a;
      c.globalAlpha = a; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r * 0.4, 0, 7); c.fill();
      c.globalAlpha = a * 0.7; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke(); }
    c.restore();
  }
  function glitter(c, x, y, w, t, n = 18) {   // gold sparks rising around the winner
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const per = 1400 + hsh(i + 80) * 900, k = ((t + hsh(i + 90) * per) % per) / per, px = x + (hsh(i + 100) - 0.5) * w + Math.sin(t / 300 + i) * 6, py = y - k * 170;
      c.globalAlpha = Math.sin(k * Math.PI); c.fillStyle = i % 3 ? '#ffd23f' : '#fff'; const s = 2 + hsh(i + 110) * 3;
      c.beginPath(); c.moveTo(px, py - s * 2); c.lineTo(px + s * 0.6, py); c.lineTo(px, py + s * 2); c.lineTo(px - s * 0.6, py); c.closePath(); c.fill(); }
    c.restore();
  }
  function ring(c, x, y, age, col = '#ffd23f') {   // the burst when the winner lands
    if (age < 0 || age > 520) return; const k = age / 520, r = eo(k) * 70;
    c.save(); c.globalAlpha = 1 - k; c.strokeStyle = col; c.lineWidth = 4 * (1 - k) + 1; c.beginPath(); c.ellipse(x, y, r, r * 0.3, 0, 0, 7); c.stroke();
    for (let p = 0; p < 10; p++) { const an = p / 10 * Math.PI * 2, d = 10 + eo(k) * 56; c.fillStyle = p % 2 ? '#fff' : col; c.beginPath(); c.arc(x + Math.cos(an) * d, y - 8 + Math.sin(an) * d * 0.5 - k * 20, 3.2 * (1 - k), 0, 7); c.fill(); }
    c.restore();
  }
  B.podium = (info, who, text, face, skip = 0) => ({ who, face, text, textAt: who === 'tala' ? 200 : 1600, draw(c, W, H, t0) {
    const t = t0 + skip, land = 1300;
    stadium(c, W, H, t, { dark: 0.45, cheer: true, spots: 1, spotAt: { x: W / 2, y: H * 0.5 } });
    flashes(c, W, H, t);
    const base = H * 0.66, step = [[W * 0.18, 56, '2'], [W * 0.5, 96, '1'], [W * 0.82, 30, '3']], order = [1, 0, 2];
    if (t > land) rays(c, W / 2, base - 96 - 70, t, Math.min(1, (t - land) / 500));
    step.forEach(([x, h, n], i) => { const at = 200 + order[i] * 350, k = eo((t - at) / 400), hh = h * k; if (t < at) return;
      SC.depth(c, () => { c.beginPath(); c.roundRect(x - W * 0.16, base - hh, W * 0.32, hh + 40, 4); }, n === '1' ? '#f1e6c4' : '#e2dccb', 3, 0.25);
      c.fillStyle = n === '1' ? '#d4a62a' : n === '2' ? '#9aa0ad' : '#c4834a'; c.font = `700 30px ${PIX}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, x, base - hh + 26);
      const e = info.podium[+n - 1]; if (!e) return; const ek = back((t - at - 300) / 380); if (ek <= 0) return;
      const top = base - hh, T = t + i * 400;
      if (n === '1') {
        // hops with the trophy held up, squashing on each landing and turning to face the other way every second hop
        const per = 760, since = t - land, ph = since < 0 ? 0 : (since % per) / per, hop = since < 0 ? 0 : ph < 0.72 ? Math.sin(ph / 0.72 * Math.PI) * 30 : 0;
        const squash = since >= 0 && ph >= 0.72 && ph < 0.86, turn = since > 0 && Math.floor(since / per / 2) % 2 === 1;
        const pose = pz('happy', { arm: [[14, -14, 6, -34], [14, -14, 6, -34]], open: 0.95, lift: 0 });
        if (since < 0) { const drop = eo((t - at - 300) / 380); mon(c, e.spec, x, top - (1 - drop) * 120, 130 * Math.min(1, ek), 'jump', T); }
        else { glitter(c, x, top, 130, t); mon(c, e.spec, x, top - hop, 130, pose, T, turn, squash ? { sx: 1.1, sy: 0.88 } : hop > 4 ? { sx: 0.95, sy: 1.06 } : {}); }
        if (since >= 0) { ring(c, x, top, since); ring(c, x, top, since % per - per * 0.72); }
        // the trophy falls into its hands, then rides up and down with it
        const tk = eo((t - land) / 420), ts = 40, head = 130 * 0.9 * (squash ? 0.88 : hop > 4 ? 1.06 : 1), ty = top - hop - head - ts * 0.8;
        if (t > land) { c.save(); c.translate(x, ty - (1 - tk) * 260); c.rotate(Math.sin(t / 240) * 0.06); trophy(c, 0, 0, ts); c.restore();
          if (since < 420) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1 - since / 420; c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(x, ty, 30 + since / 6, 0, 7); c.fill(); c.restore(); } }
      } else if (n === '2') {
        // claps, facing the winner, with a little bounce on each clap
        const clap = Math.floor(T / 170) % 2 === 0, b = clap ? 0 : 9;
        mon(c, e.spec, x, top - b, 100 * Math.min(1, ek), pz('happy', { arm: clap ? [[12, -6, -2, -14], [12, -6, -2, -14]] : [[16, -8, 18, -18], [16, -8, 18, -18]], lift: 0, extra: null }), T, false, { look: [0.8, -0.2], ...(clap ? { sx: 1.06, sy: 0.94 } : { sx: 0.97, sy: 1.04 }) });
        if (clap && T % 340 < 60) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#fff'; c.lineWidth = 2.5; for (const a of [-0.6, 0, 0.6]) { c.beginPath(); c.moveTo(x + Math.sin(a) * 30, top - 108 - Math.cos(a) * 30); c.lineTo(x + Math.sin(a) * 42, top - 108 - Math.cos(a) * 42); c.stroke(); } c.restore(); }
      } else {
        // waves one arm and sways, with a hop now and then
        const wv = Math.sin(T / 140), sw = Math.sin(T / 420) * 6, per = 1300, ph = (T % per) / per, hop = ph < 0.3 ? Math.sin(ph / 0.3 * Math.PI) * 14 : 0;
        mon(c, e.spec, x + sw, top - hop, 100 * Math.min(1, ek), pz('happy', { arm: [[16, -10, 10 + wv * 10, -30], REST_ARM], lift: 0, tilt: sw * 0.8 }), T, true, { look: [0.8, -0.2] });
      }
      const pulse = n === '1' && t > land ? 1 + Math.sin(t / 200) * 0.06 : 1;
      c.save(); c.translate(x, base + 30); c.scale(pulse, pulse); c.fillStyle = e.me ? '#ffc93c' : '#fff'; c.font = `700 14px ${PIX}`; c.fillText(e.name.replace(/^Rook's /, ''), 0, 0, W * 0.29); c.restore(); });
    // fireworks keep going in waves, and confetti and streamers keep falling
    for (const k of [0, 1]) { const w = Math.floor((t - land) / 3400) - k; if (w >= 0) fireworks(c, W, H, t, land + w * 3400, w ? 5 : 8, 0.18); }
    if (t > land) { confetti(c, W, H, t - land, 60); streamers(c, W, H, t - land); }
    ribbon(c, W, H * 0.1, info.cup.name, t, 1100, { size: 28 });
  } });
  const REST_ARM = [12, 8, 16, 22];
  function streamers(c, W, H, t) {
    c.save(); c.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const sp = 0.07 + hsh(i + 120) * 0.05, x0 = W * hsh(i + 130), y0 = (hsh(i + 140) * H + t * sp) % (H + 120) - 120;
      c.strokeStyle = FW[(i + 2) % FW.length]; c.lineWidth = 4; c.beginPath();
      for (let s = 0; s <= 12; s++) { const yy = y0 + s * 7, xx = x0 + Math.sin(s * 0.7 + t / 160 + i) * 9; s ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
    c.restore();
  }

  /* a portrait tile: the Snabit's head and shoulders on a dark square, gold-edged for the player and orange for Rook */
  function tile(c, e, x, y, s, t, flip) {
    c.save(); c.beginPath(); c.roundRect(x, y, s, s, 6); c.fillStyle = e.me ? '#4a3a10' : e.rook ? '#4a2a10' : '#262a3e'; c.fill(); c.clip();
    mon(c, e.spec, x + s / 2, y + s * 1.18, s * 1.25, 'idle', t, flip); c.restore();
    c.strokeStyle = e.me ? '#ffc93c' : e.rook ? '#ffb04a' : 'rgba(255,255,255,.35)'; c.lineWidth = e.me || e.rook ? 2.5 : 1.5; c.beginPath(); c.roundRect(x, y, s, s, 6); c.stroke();
  }
  /* a green number block, the way MR2 numbers its entrants */
  function numBlock(c, n, x, y, s) {
    SC.depth(c, () => { c.beginPath(); c.roundRect(x, y, s, s, 4); }, '#3f9a4e', 2, 0.25);
    c.fillStyle = '#fff'; c.font = `700 ${s * 0.72}px ${PIX}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, x + s / 2, y + s / 2 + 1);
  }
  /* the round robin table: entrants down the side, a grid with a red circle for each win and a blue cross for each loss,
     read along the row. Results already played are there from the start, and the newest pair (info.last) pops in */
  B.table = (info, text) => ({ who: 'mc', face: 'talk', text, textAt: 700, draw(c, W, H, t) {
    stadium(c, W, H, t, { dark: 0.62 });
    c.font = `700 24px ${PIX}`; c.fillStyle = '#ffc93c'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(info.cup.name, W / 2, 48);
    c.font = `500 16px ${PIX}`; c.fillStyle = '#fff6d8'; c.fillText(info.round, W / 2, 72);
    const F = info.field, n = F.length, cs = Math.min(44, (W - 24 - 128) / n), gx = W - 12 - cs * n, rh = cs, nb = Math.min(26, rh - 8), top = Math.max(110, (H - 190 - rh * n) / 2 + 30);   // centred in the space above the speech box
    for (let j = 0; j < n; j++) numBlock(c, j + 1, gx + j * cs + (cs - nb) / 2, top - nb - 6, nb);
    F.forEach((e, i) => { const y = top + i * rh, k = eo((t - 120 * i) / 300); c.save(); c.globalAlpha = k; c.translate(-(1 - k) * 30, 0);
      numBlock(c, i + 1, 12, y + (rh - nb) / 2, nb); tile(c, e, 12 + nb + 4, y + 2, rh - 4, t + i * 300, false);
      c.font = `700 ${Math.min(16, rh * 0.36)}px ${PIX}`; c.fillStyle = e.me ? '#ffc93c' : e.rook ? '#ffb04a' : '#fff'; c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText(e.name.replace(/^Rook's /, '').split(',')[0], 12 + nb + rh + 6, y + rh / 2, gx - (12 + nb + rh + 10)); c.restore(); });
    c.fillStyle = 'rgba(10,10,24,.55)'; c.fillRect(gx, top, cs * n, rh * n);
    c.strokeStyle = '#f4f0e6'; c.lineWidth = 2; c.strokeRect(gx, top, cs * n, rh * n);
    for (let k = 1; k < n; k++) { c.beginPath(); c.moveTo(gx + k * cs, top); c.lineTo(gx + k * cs, top + rh * n); c.moveTo(gx, top + k * rh); c.lineTo(gx + cs * n, top + k * rh); c.stroke(); }
    c.beginPath(); c.moveTo(gx, top); c.lineTo(gx + cs * n, top + rh * n); c.stroke();
    F.forEach((_, i) => F.forEach((__, j) => { const r = info.res[i][j]; if (i === j || !r) return;
      const fresh = info.last && (info.last[0] === i && info.last[1] === j || info.last[0] === j && info.last[1] === i), k = fresh ? back((t - 600) / 380) : 1; if (k <= 0) return;
      const x = gx + j * cs + cs / 2, y = top + i * rh + rh / 2, rr = cs * 0.3 * k; c.lineWidth = Math.max(3, cs * 0.1); c.lineCap = 'round';
      if (r === 'w') { c.strokeStyle = '#ff4a4a'; c.beginPath(); c.arc(x, y, rr, 0, 7); c.stroke(); }
      else if (r === 'l') { c.strokeStyle = '#3d8bff'; c.beginPath(); c.moveTo(x - rr, y - rr); c.lineTo(x + rr, y + rr); c.moveTo(x + rr, y - rr); c.lineTo(x - rr, y + rr); c.stroke(); }
      else { c.strokeStyle = '#ffd23f'; c.beginPath(); c.moveTo(x, y - rr); c.lineTo(x + rr, y + rr * 0.8); c.lineTo(x - rr, y + rr * 0.8); c.closePath(); c.stroke(); } }));
    const me = F.findIndex(e => e.me); if (me >= 0) { c.strokeStyle = '#ffc93c'; c.lineWidth = 3; c.beginPath(); c.roundRect(8, top + me * rh, W - 16, rh, 6); c.stroke(); }
  } });
  /* the face-off: both Snabits framed like trading cards, VS between them, and their six stats side by side with bars
     growing out from the middle, the way MR2 lines two monsters up before a match */
  const ST_LAB = ['Sta', 'Pow', 'Con', 'Mnd', 'Ins', 'Spd'], ST_COL = ['#e2d44a', '#ff5a5a', '#5ad26a', '#d65ad6', '#4ad2e2', '#4a6aff'];
  B.faceoff = (info, text) => ({ who: 'mc', face: 'happy', text, textAt: 1300, draw(c, W, H, t) {
    stadium(c, W, H, t, { dark: 0.5, cheer: true });
    c.font = `700 18px ${PIX}`; c.fillStyle = '#fff6d8'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.globalAlpha = cl(t / 300); c.fillText(info.round, W / 2, 32); c.globalAlpha = 1;
    const cw = W * 0.4, ch = cw * 1.2, cy = 48, sl = eo(t / 450);
    const card = (e, x, flip, cols) => { c.save(); c.translate(flip ? W * (1 - sl) : -W * (1 - sl), 0);
      SC.depth(c, () => { c.beginPath(); c.roundRect(x, cy, cw, ch, 10); }, '#e9e2cf', 3, 0.3);
      c.save(); c.beginPath(); c.roundRect(x + 6, cy + 6, cw - 12, ch - 12, 7); c.clip(); const g = c.createLinearGradient(0, cy, 0, cy + ch); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); c.fillStyle = g; c.fillRect(x, cy, cw, ch);
      c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 10; for (let k = -4; k < 8; k++) { c.beginPath(); c.moveTo(x + k * 26, cy + ch); c.lineTo(x + k * 26 + ch * 0.7, cy); c.stroke(); }
      mon(c, e.spec, x + cw / 2, cy + ch * 0.9, ch * 0.62, t > 500 && t < 1300 && !flip ? 'determined' : 'idle', t + (flip ? 500 : 0), flip); c.restore();
      c.fillStyle = 'rgba(14,15,26,.92)'; c.beginPath(); c.roundRect(x - 2, cy + ch + 6, cw + 4, 30, 6); c.fill(); c.strokeStyle = e.me ? '#ffc93c' : e.rook ? '#ffb04a' : '#8a8fa8'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#fff'; c.font = `700 17px ${PIX}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e.name.replace(/^Rook's /, '').split(',')[0], x + cw / 2, cy + ch + 21, cw - 8);
      c.fillStyle = '#c9cde0'; c.font = `500 13px ${PIX}`; c.fillText(e.line, x + cw / 2, cy + ch + 50, cw); c.restore(); };
    card(info.me, W * 0.06, false, info.me.cols || ['#4a7cc8', '#1c3264']); card(info.foe, W * 0.54, true, info.foe.cols || ['#d2505e', '#5c1a26']);
    if (t > 450) { const k = t < 650 ? 1.8 - 0.8 * eo((t - 450) / 200) : 1; c.save(); c.translate(W / 2, cy + ch * 0.5); c.scale(k, k); c.font = `700 40px ${PIX}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 7; c.strokeStyle = '#c0182a'; c.strokeText('VS', 0, 0); c.fillStyle = '#ffe14a'; c.fillText('VS', 0, 0); c.restore(); }
    const ty = cy + ch + 72, rh = Math.min(38, (H - 190 - ty) / 6), lw = 52, half = (W - 24 - lw) / 2, mx = W / 2;
    ST_LAB.forEach((lab, i) => { const y = ty + i * rh, k = eo((t - 700 - i * 70) / 420); if (k <= 0) return;
      const a = info.me.st[i], b = info.foe.st[i], top = Math.max(...info.me.st, ...info.foe.st) * 1.08, bw = half - 50;   // one scale for all twelve bars, set by the highest stat on screen
      c.fillStyle = 'rgba(14,15,26,.85)'; c.fillRect(12, y, W - 24, rh - 4);
      c.fillStyle = '#6a6e80'; c.fillRect(mx - lw / 2, y, lw, rh - 4); c.fillStyle = '#fff'; c.font = `700 15px ${PIX}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lab, mx, y + rh / 2 - 1);
      const la = bw * a / top * k, lb = bw * b / top * k;
      c.fillStyle = ST_COL[i]; c.fillRect(mx - lw / 2 - 4 - la, y + 6, la, rh - 16); c.fillRect(mx + lw / 2 + 4, y + 6, lb, rh - 16);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(mx - lw / 2 - 4 - la, y + 6, la, 3); c.fillRect(mx + lw / 2 + 4, y + 6, lb, 3);
      c.font = `700 17px ${PIX}`; c.fillStyle = a > b ? '#fff' : '#b8bccb'; c.textAlign = 'left'; c.fillText(Math.round(a * k), 18, y + rh / 2 - 1);
      c.fillStyle = b > a ? '#fff' : '#b8bccb'; c.textAlign = 'right'; c.fillText(Math.round(b * k), W - 18, y + rh / 2 - 1); });
  } });
  /* the knockout draw, MR2 style: the eight entrants numbered down the side, lines joining pairs round by round to the
     trophy. Winners' lines turn gold and the ones knocked out fade, so the same picture shows the draw and every round after */
  B.draw8 = (info, text) => ({ who: 'mc', face: 'talk', text, textAt: 1500, draw(c, W, H, t) {
    stadium(c, W, H, t, { dark: 0.62 });
    c.font = `700 24px ${PIX}`; c.fillStyle = '#ffc93c'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(info.cup.name, W / 2, 48);
    c.font = `500 16px ${PIX}`; c.fillStyle = '#fff6d8'; c.fillText(info.round, W / 2, 72);
    const F = info.field, Hs = info.hist || [], order = Hs[0] || F.map((_, i) => i), top = 96, avail = H - 190 - top - 10, rh = avail / 8, ph = Math.min(48, rh - 8), pw = W * 0.56;
    const ys = order.map((_, r) => top + r * rh + rh / 2), cx = [12 + pw + 14, 12 + pw + 14 + (W - pw - 70) * 0.33, 12 + pw + 14 + (W - pw - 70) * 0.66], tx = W - 34, ty = (ys[3] + ys[4]) / 2;
    const alive = (i, r) => r === 0 || (Hs[r] || []).includes(i), out = (i, r) => Hs[r + 1] && !Hs[r + 1].includes(i);
    // lines: round 1 joins neighbours, round 2 joins pairs of pairs, the final joins the halves, then on to the trophy
    let level = order.map((i, r) => ({ i: [i], y: ys[r], x: 12 + pw }));
    const lineIn = cl((t - 300 - 8 * 110) / 500);
    for (let r = 0; r < 3; r++) { const next = [];
      for (let p = 0; p < level.length; p += 2) { const A = level[p], Bq = level[p + 1], mx = cx[r], my = (A.y + Bq.y) / 2, win = Hs[r + 1] ? A.i.concat(Bq.i).find(i => Hs[r + 1].includes(i)) : null;
        for (const q of [A, Bq]) { const won = win != null && q.i.includes(win); c.strokeStyle = won ? '#ffc93c' : win != null ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.55)'; c.lineWidth = won ? 4 : 2.5; c.globalAlpha = lineIn;
          c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(mx, q.y); c.lineTo(mx, my); c.stroke(); }
        next.push({ i: A.i.concat(Bq.i), y: my, x: mx, win }); }
      level = next; }
    const champ = Hs[3] && Hs[3][0]; c.strokeStyle = champ != null ? '#ffc93c' : 'rgba(255,255,255,.55)'; c.lineWidth = champ != null ? 4 : 2.5; c.beginPath(); c.moveTo(level[0].x, level[0].y); c.lineTo(tx - 22, ty); c.stroke(); c.globalAlpha = 1;
    const tk = back((t - 300 - 8 * 110 - 200) / 450); if (tk > 0) { c.save(); c.translate(tx, ty); c.scale(tk, tk); trophy(c, 0, 0, 22); c.restore(); }
    order.forEach((i, r) => { const e = F[i], at = 200 + r * 110, k = eo((t - at) / 320); if (t < at) return; const y = ys[r] - ph / 2, gone = [0, 1, 2].some(q => out(i, q));
      c.save(); c.globalAlpha = k * (gone ? 0.5 : 1); c.translate(-(1 - k) * 40, 0);
      numBlock(c, r + 1, 12, y + (ph - 26) / 2, 26);
      SC.depth(c, () => { c.beginPath(); c.roundRect(42, y, pw - 30, ph, 7); }, e.me ? '#ffe8a8' : e.rook ? '#ffd2a0' : '#e9dcbc', 2, 0.25);
      tile(c, e, 46, y + 3, ph - 6, t + r * 300, false);
      c.fillStyle = '#3a2618'; c.font = `700 ${Math.min(17, ph * 0.38)}px ${PIX}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(e.name.replace(/^Rook's /, '').split(',')[0], 46 + ph, y + ph * 0.38, pw - ph - 40);
      c.fillStyle = '#7a6248'; c.font = `500 ${Math.min(13, ph * 0.28)}px ${PIX}`; c.fillText(e.me ? "Josie's ranch" : e.rook ? 'Rook' : e.breeder || '', 46 + ph, y + ph * 0.72, pw - ph - 40);
      c.restore(); });
  } });
  /* ---------- running a show ---------- */
  const CPS = 0.045;   // characters per millisecond while a line types out
  function frame(c, W, H, b, t, prev) {
    c.clearRect(0, 0, W, H); b.draw(c, W, H, t);
    if (prev && t < 380) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1 - eo(t / 380); c.drawImage(prev, 0, 0); c.restore(); }   // the last beat dissolves into this one
    if (b.text && t >= (b.textAt || 0)) { const sh = b.skipAt != null ? b.text.length : Math.floor((t - b.textAt) * CPS); box(c, W, H, b.who, b.face || 'talk', b.text, sh, sh >= b.text.length, t); }
  }
  /* draws one moment of one beat onto a canvas, for storyboards */
  function still(cv, b, t, W, H) { const c = cv.getContext('2d'), d = cv.width / W; c.setTransform(d, 0, 0, d, 0, 0); frame(c, W, H, b, t, null); }
  function run(beats) {
    return new Promise(done => {
      if (!beats.length) return done();
      API.on = true; API.mus = beats[0].mus || 'arena';
      const start = b => { if (b.mus !== undefined) API.mus = b.mus; if (b.jingle && typeof musJingle === 'function') musJingle(b.jingle); };
      const cv = SUMMON.overlay(), c = cv.getContext('2d'), d = cv.width / innerWidth, W = cv.width / d, H = cv.height / d;
      const skip = document.createElement('button'); skip.className = 'small show-skip'; skip.textContent = 'Skip ▸▸'; document.body.appendChild(skip);
      let i = 0, t0 = performance.now(), over = false;
      const end = () => { if (over) return; over = true; API.on = false; cv.remove(); skip.remove(); done(); };
      const prev = document.createElement('canvas'); prev.width = cv.width; prev.height = cv.height; let hasPrev = false;
      const next = () => { prev.getContext('2d').clearRect(0, 0, prev.width, prev.height); prev.getContext('2d').drawImage(cv, 0, 0); hasPrev = true;
        i++; t0 = performance.now(); if (i >= beats.length) end(); else start(beats[i]); };
      start(beats[0]);
      const typed = (b, t) => !b.text || b.skipAt != null || (t - b.textAt) * CPS >= b.text.length;
      cv.onpointerdown = () => { const b = beats[i], t = performance.now() - t0; if (!b || t < 250) return;
        if (b.text && t < b.textAt) { t0 -= b.textAt - t; return; } if (!typed(b, t)) b.skipAt = t; else next(); };
      skip.onclick = end;
      const step = now => { if (over) return; const b = beats[i], t = now - t0; c.setTransform(d, 0, 0, d, 0, 0); frame(c, W, H, b, t, hasPrev && b.dissolve !== false ? prev : null);
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

/* ---------- the lines. Rico calls the cup, Josie talks to the player ---------- */
/* Mira's lines. She's an announcer, so she hypes the crowd and calls what happened; she doesn't read out the rules
   (Gid, 15 Nov 2026). Each line has a few takes, picked by the cup and the round so a replay says the same thing */
const vary = (list, key) => list[Math.floor(rng(hashStr(key + '|' + PLAYER.week))() * list.length)];
const anA = w => /^[AEIOU]/.test(w) ? 'an' : 'a';
const CUPLINE = {
  open: c => { const prize = c.prize ? ` and ${anA(c.prize)} ${c.prize}` : '', bits = c.purse.toLocaleString();
    return vary([`Welcome, everyone, to the ${c.name}! We've got ${c.size} Snabits here today, all after ${bits} bits${prize}!`,
      `It's a packed house for the ${c.name}! ${c.size} Snabits came to fight, and only one of them goes home with ${bits} bits${prize}.`,
      `Hello and welcome to the ${c.name}! Grab your seats, folks, because ${c.size} Snabits are about to fight for ${bits} bits${prize}!`], 'open' + c.name); },
  rules: c => c.visit ? vary(["The Northreach League sailed all the way here for this one, and they don't guard up north, so nobody guards today!",
      "Northreach is in town, folks! Their house rule is no guarding, so every Snabit here has to take its hits!"], 'rules' + c.name) : vary(c.format === 'robin' ? ["Every Snabit here fights every other one today, so there's nowhere to hide!", "It's a round robin, folks, and everybody gets a shot at everybody!"]
    : c.format === 'single' ? ['It all comes down to one match, and the winner takes everything!', 'It all comes down to one match today!']
    : c.format === 'bo3' ? ["Every match is best of three today, so nobody goes out on one bad round!", "Best of three all the way, folks. Let's see who's got staying power!"]
    : ["It's a knockout today, so one loss and you're going home!", "Win and you're through, lose and your day's over. Let's get started!"], 'rules' + c.name),
  draw: (me, foe) => vary([`Here's the draw! ${me} opens against ${foe}.`, `The draw is in, and first up for ${me} is ${foe}!`], 'draw' + me),
  vs: (round, me, foe) => { const them = foe.rook ? `${foe.name.replace(/^Rook's /, '')} with Rook from the Grand Ranch` : `${foe.name}, trained by ${foe.breeder}`;
    return vary([`${round}! From Josie's ranch, it's ${me.name}! And taking it on, ${them}!`, `${round}! ${me.name} from Josie's ranch goes up against ${them}!`,
      `${round}, and here they come! ${me.name} from Josie's ranch against ${them}!`], 'vs' + round + foe.name); },
  /* Josie's word at the gate: the one thing about this opponent worth knowing */
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
    const k = 'recap' + me + foe + (res.secs || res.turns), secs = res.secs != null ? `${res.secs} seconds` : `${res.turns} turns`;
    if (res.winner === null) return vary(["Time's up, and the judges can't split them! We've got a draw!", 'The judges call it even! It ends in a draw!'], k);
    if (res.winner === 0) {
      if (res.judged) return vary([`Time's up, and the judges give it to ${me}!`, `It goes to the judges, and they pick ${me}!`], k);
      if (res.secs != null ? res.secs <= 12 : res.turns <= 4) return vary([`Over in ${secs}! ${me} didn't waste a second!`, `${me} wins it in ${secs}! What a start!`], k);
      if (res.hpLeft > 0.6) return vary([`${me} wins it and barely took a scratch!`, `What a performance from ${me}! ${foe} couldn't keep up.`], k);
      if (res.hpLeft < 0.2) return vary([`${me} wins it, and only just! It was hanging on by a thread.`, `What a finish! ${me} was nearly out on its feet, but it wins!`], k);
      return vary([`${me} wins it! ${foe} gave it everything, but it wasn't enough.`, `And ${me} takes it after a real battle!`], k);
    }
    if (res.judged) return vary([`Time's up, and the judges give it to ${foe}.`, `The judges go with ${foe} on this one.`], k);
    if (res.foeHpLeft < 0.2) return vary([`${foe} wins, but ${me} made it work for every bit of it!`, `${me} nearly had it, but ${foe} hangs on to win!`], k);
    if (res.foeHpLeft > 0.6) return vary([`${foe} wins, and it hardly broke a sweat.`, `${foe} was just too much for ${me} today.`], k);
    return vary([`${foe} takes this one.`, `And the match goes to ${foe}!`], k);
  },
  /* Josie after a match: what it means for the cup */
  after(res, me, c, cup) {
    const won = res.winner === 0;
    if (c.format === 'robin') { const left = cup.rounds.length - cup.round; return won ? `Good job, ${me}! That's ${cup.pts[0]} points${left ? ` with ${left} round${left > 1 ? 's' : ''} to go` : ''}.` : res.winner === null ? `A draw still gets us a point.${left ? ` There ${left > 1 ? 'are' : 'is'} ${left} round${left > 1 ? 's' : ''} left.` : ''}` : left ? `We lost that one, but there ${left > 1 ? 'are' : 'is'} still ${left} round${left > 1 ? 's' : ''} to go.` : `We lost that one, ${me}. Let's see where we finish.`; }
    if (c.format === 'single') return won ? `We did it, ${me}!` : `It's okay, ${me}. We'll train up and come back for the next one.`;
    if (!won) return `It's okay, ${me}. ${cup.lastFoe} was stronger this time. We'll train up and come back for the next one.`;
    const nx = ['the semi-final', 'the final'][cup.round - 1];
    return nx ? `Nice work, ${me}! Next up is ${nx}.` : `Nice work, ${me}!`;
  },
  podium(place, me, champ, c, prize) {
    const cup = c.name, bits = (prize || 0).toLocaleString(), k = 'podium' + cup;
    if (place === 1) return vary([`Your ${cup} champion, from Josie's ranch, is ${me}! That's ${bits} bits going home with them!`, `Give it up for ${me} from Josie's ranch, the winner of the ${cup} and ${bits} bits!`], k);
    if (place === 2) return vary([`${champ} wins the ${cup}! Second place and ${bits} bits go to ${me} from Josie's ranch.`, `Your champion is ${champ}! And ${me} from Josie's ranch takes second and ${bits} bits.`], k);
    if (place === 3) return vary([`${champ} takes the ${cup}! ${me} from Josie's ranch finishes third and wins ${bits} bits.`, `The ${cup} goes to ${champ}! Third place and ${bits} bits for ${me} from Josie's ranch.`], k);
    return vary([`${champ} wins the ${cup}! Thanks for coming out, everyone!`, `Your ${cup} champion is ${champ}! See you all next time!`], k);
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
  return { visit: !!c.visit, name: c.name.replace(/ \([A-S]\)$/, ''), grade: c.major || c.legend ? 'S' : c.small ? 'F' : c.grade, format: fm, size: n, purse: cupPurse(c), prize: c.prize,
    sub: fm === 'single' ? 'One match' : `${fm === 'robin' ? 'Round robin' : fm === 'bo3' ? 'Knockout, best of 3' : 'Knockout'} · ${n} Snabits` }; };
/* the six stats as the fight uses them, for the face-off */
const showStats = e => { try { const b = (e.me ? playerFighter(RS) : makeFighter(e.o.fm, e.o.skills, e.o.level)).base; return ['sta', 'pow', 'grd', 'mnd', 'spr', 'spd'].map(k => Math.round(b[k] || 0)); } catch (err) { return [0, 0, 0, 0, 0, 0]; } };
const shade = (h, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(h.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
const cardCols = el => { const h = typeof ELC === 'function' ? ELC(el) : '#888888'; return /^#[0-9a-f]{6}$/i.test(h) ? [h, shade(h, 0.35)] : null; };   // the face-off card takes its element's colour
function showSide(i) { const e = CUP.field[i], s = RS;
  if (e.me) { const fm = fightMon(s); return { name: displayName(s), spec: showSpec(fm), line: `Lv ${s.level} · Grade ${s.grade}`, me: true, st: showStats(e), cols: cardCols(fm.el1) }; }
  return { name: e.name, spec: showSpec(e.o.fm), line: `Lv ${e.o.level} · ${e.rook ? 'Rook' : e.breeder}`, rook: !!e.rook, breeder: e.breeder, st: showStats(e), cols: cardCols(e.o.fm.el1) }; }
const showField = () => CUP.field.map((_, i) => ({ ...showSide(i), me: !!CUP.field[i].me, breeder: CUP.field[i].breeder }));
/* Mira's line over the round robin table: who leads, and where the player's Snabit stands */
function tableLine(me) {
  const F = CUP.field, n = CUP.rounds.length, done = CUP.round, order = F.map((_, i) => i).sort((a, b) => CUP.pts[b] - CUP.pts[a] || CUP.hp[b] - CUP.hp[a]), top = order[0], pts = p => `${p} point${p === 1 ? '' : 's'}`, k = 'table' + done;
  const topName = F[top].me ? me : F[top].name;
  if (!done) return vary([`Here's the table, folks! ${F.length} Snabits, and every one of them has to get through the rest.`, `Here's the table, and right now everybody's level on zero!`], k);
  if (done >= n) return vary([`Here's the final table! ${topName} finishes on top with ${pts(CUP.pts[top])}!`, `And when it's all added up, ${topName} tops the table with ${pts(CUP.pts[top])}!`], k);
  if (top === 0) return vary([`After round ${done}, ${me} is out in front on ${pts(CUP.pts[0])}!`, `${me} leads the table on ${pts(CUP.pts[0])} after round ${done}!`], k);
  return vary([`After round ${done}, ${topName} leads on ${pts(CUP.pts[top])}, and ${me} has ${pts(CUP.pts[0])}.`, `${topName} sits on top with ${pts(CUP.pts[top])}, and ${me} is on ${pts(CUP.pts[0])}.`], k);
}
function drawLine(me) {
  const H = CUP.hist, r = H.length - 1, F = CUP.field, al = CUP.alive, k = 'drawl' + r;
  if (al.length === 1) return vary([`And that's the draw done! ${al[0] === 0 ? me : F[al[0]].name} takes the cup!`, `${al[0] === 0 ? me : F[al[0]].name} has won its way through the whole draw!`], k);
  const done = ['', 'The quarter-finals are over', 'The semi-finals are over'][r] || 'That round is over', next = al.length === 2 ? 'final' : 'semi-final', at = al.indexOf(0);
  if (at < 0) return `${done}, and ${al.length} Snabits are still standing!`;
  const foe = al[at % 2 ? at - 1 : at + 1], them = F[foe].rook ? F[foe].name : `${F[foe].breeder}'s ${F[foe].name}`;
  return vary([`${done}! ${me} is through to the ${next}, where it meets ${them}!`, `${done}, and it's ${me} against ${them} in the ${next}!`], k);
}
const showOk = () => CUP && CUP.c.format !== 'team5';
/* before a match: the opening the first time, then the VS card with the square-off sting */
function cupBeforeShow(opp) {
  if (!showOk()) return Promise.resolve();
  const c = CUP.c, cup = showCup(c), me = showSide(0), foe = showSide(opp), L = CUPLINE, B = CUPSHOW.B, e = CUP.field[opp];
  const info = { cup, me, foe, round: roundName(), field: showField() };
  const beats = [];
  if (!CUP.opened) { CUP.opened = true;
    const foeF = e.o ? makeFighter(e.o.fm, e.o.skills, e.o.level) : null;
    beats.push({ ...B.open(info), mus: 'arena' }, B.mc(info, L.open(cup)), B.mc(info, L.rules(cup), { pose: 'point' }));
    if (foeF) beats.push(B.gate(info, L.advice(playerFighter(RS), foeF, me.name, foe.name)));
    if (c.format === 'robin') beats.push(B.table({ ...info, res: CUP.res, round: `${CUP.field.length} Snabits · ${CUP.rounds.length} rounds` }, tableLine(me.name)));
    if (c.format === 'elim' || c.format === 'bo3') beats.push(B.draw8({ ...info, hist: CUP.hist, round: 'The draw' }, L.draw(me.name, foe.name))); }
  beats.push({ ...B.faceoff(info, L.vs(roundName(), me, { ...e, name: e.name })), jingle: 'vs', mus: 'cup' });
  return CUPSHOW.run(beats);
}
/* after a match: Mira's recap, then Josie if the cup goes on */
function cupAfterShow(opp, res) {
  if (!showOk()) return Promise.resolve();
  const c = CUP.c, me = showSide(0), foe = showSide(opp), won = res.winner === 0, draw = res.winner === null, B = CUPSHOW.B, L = CUPLINE;
  const info = { cup: showCup(c), me, foe, won, draw, title: draw ? 'Draw' : `${won ? me.name : foe.name} wins${won ? '!' : ''}` };
  CUP.lastFoe = foe.name;
  const series = c.format === 'bo3' && CUP.series && CUP.series.opp != null;
  const over = c.format === 'single' || CUP.out || (c.format === 'robin' ? CUP.round >= CUP.rounds.length : !series && CUP.alive.length === 1);
  const beats = [{ ...B.result(info, 'mc', L.recap(res, me.name, foe.name), won ? 'happy' : 'talk'), mus: 'arena' }];
  const field = showField();
  if (c.format === 'robin') beats.push(B.table({ cup: info.cup, field, res: CUP.res, last: [0, opp], round: over ? 'Final table' : `After round ${CUP.round} of ${CUP.rounds.length}` }, tableLine(me.name)));
  if ((c.format === 'elim' || c.format === 'bo3') && !series) beats.push(B.draw8({ cup: info.cup, field, hist: CUP.hist, round: CUP.alive.length === 1 ? 'Champion' : CUP.alive.length === 2 ? 'Final' : 'Semi-final' }, drawLine(me.name)));
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
    B.podium(info, 'tala', L.talaEnd(place, me.name, up && up[1], CUP.prize), place <= 3 ? 'happy' : 'worried', 2400)]);
}
