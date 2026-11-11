/* The people besides Tala: Kiko the trip guide, Nena at the shop, and Dr. Ines and Benji at the lab.
   Drawn the way Tala is: a big head about 70 units across centred on (0,0), a darker copy a little lower for depth,
   big dark eyes with two sparkles, pink blush. Faces: happy, talk, worried, surprised. Needs scenes.js (SC). */
const NPC = {
  guide: { name: 'Kiko', cm: 165, tag: '#9ccf6a' },
  shop: { name: 'Nena', cm: 150, tag: '#ff9fb8' },
  doc: { name: 'Dr. Ines', cm: 168, tag: '#c9b3ff' },
  aide: { name: 'Benji', cm: 172, tag: '#7fe0d0' },
};

/* ---------- faces, shared ---------- */
function npcEyes(x, face, o = {}) {
  const ex = o.ex || 12, ey = o.ey || 8, rx = o.rx || 5.6, ry = o.ry || 7.5, ink = '#2a1e2e';
  if (face === 'happy') { x.strokeStyle = ink; x.lineWidth = 3.2; x.lineCap = 'round'; for (const s of [-1, 1]) { x.beginPath(); x.arc(s * ex, ey + 3, rx + 0.4, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); } return; }
  const r2 = face === 'surprised' ? ry + 1 : ry;
  for (const s of [-1, 1]) { x.fillStyle = ink; x.beginPath(); x.ellipse(s * ex, ey, rx, r2, 0, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(s * ex - rx * 0.32, ey - r2 * 0.4, rx * 0.41, 0, 7); x.fill(); x.beginPath(); x.arc(s * ex + rx * 0.36, ey + r2 * 0.33, rx * 0.2, 0, 7); x.fill(); }
}
function npcBrows(x, face, col, o = {}) {
  const ex = o.ex || 12, y = (o.by || -5), w = o.bw || 2.4;
  x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round';
  const d = face === 'worried' ? [1, -2] : face === 'surprised' ? [-3, -4] : [0, 0];
  for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * (ex + 5), y + d[0]); x.lineTo(s * (ex - 5), y + d[1]); x.stroke(); }
}
function npcMouth(x, face, col = '#8a3a3a', y = 22) {
  x.fillStyle = col; x.strokeStyle = col; x.lineWidth = 2.2; x.lineCap = 'round';
  if (face === 'happy') { x.beginPath(); x.moveTo(-6, y - 2); x.quadraticCurveTo(0, y + 6, 6, y - 2); x.closePath(); x.fill(); }
  else if (face === 'talk') { x.beginPath(); x.ellipse(0, y, 4.5, 3.4, 0, 0, 7); x.fill(); }
  else if (face === 'worried') { x.beginPath(); x.moveTo(-5, y + 2); x.quadraticCurveTo(0, y - 2, 5, y + 2); x.stroke(); }
  else { x.beginPath(); x.ellipse(0, y + 1, 3.5, 4.5, 0, 0, 7); x.fill(); }
}
const npcBlush = (x, y = 18, dx = 20, a = 0.42) => { x.fillStyle = `rgba(255,120,140,${a})`; x.beginPath(); x.ellipse(-dx, y, 5, 3, 0, 0, 7); x.ellipse(dx, y, 5, 3, 0, 0, 7); x.fill(); };

/* ---------- Kiko, the trip guide: an old ranger with a wide hat and a white mustache ---------- */
function kikoHead(x, face = 'talk') {
  const skin = '#d9a066', hat = '#7d8a4e', grey = '#e4e0d6';
  SC.depth(x, () => { x.beginPath(); x.ellipse(-28, 9, 6, 8, 0, 0, 7); x.ellipse(28, 9, 6, 8, 0, 0, 7); }, skin, 2, 0.28);
  SC.depth(x, () => { x.beginPath(); x.ellipse(0, 6, 28, 27, 0, 0, 7); }, skin, 2.5, 0.22);
  x.fillStyle = grey; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 27, -8); x.quadraticCurveTo(s * 31, 6, s * 25, 17); x.quadraticCurveTo(s * 21, 6, s * 21, -6); x.closePath(); x.fill(); }
  npcEyes(x, face, { ex: 11, ey: 7, rx: 4.8, ry: 6.2 });
  npcBrows(x, face, grey, { ex: 11, by: -3, bw: 4 });
  x.fillStyle = 'rgba(0,0,0,.08)'; x.beginPath(); x.moveTo(-17, 0); x.lineTo(-7, -1); x.moveTo(7, -1); x.lineTo(17, 0); x.fill();
  npcBlush(x, 17, 19, 0.32);
  if (face !== 'happy') { x.strokeStyle = 'rgba(120,70,40,.35)'; x.lineWidth = 1; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 15, 14); x.lineTo(s * 19, 15.5); x.stroke(); } }
  npcMouth(x, face, '#7a3226', 27);
  // the mustache sits over the top lip
  SC.depth(x, () => { x.beginPath(); x.moveTo(0, 17); x.bezierCurveTo(-6, 13, -15, 15, -17, 23); x.quadraticCurveTo(-10, 22, -6, 24); x.quadraticCurveTo(-2, 25, 0, 22);
    x.quadraticCurveTo(2, 25, 6, 24); x.quadraticCurveTo(10, 22, 17, 23); x.bezierCurveTo(15, 15, 6, 13, 0, 17); x.closePath(); }, '#f4f1ea', 1.2, 0.18);
  x.fillStyle = '#c98a55'; x.beginPath(); x.ellipse(0, 13, 4, 3.4, 0, 0, 7); x.fill();
  // ranger hat: a wide brim, a dented crown and a red band with a leaf pin
  SC.depth(x, () => { x.beginPath(); x.ellipse(0, -14, 47, 9, 0, 0, 7); }, hat, 2.5, 0.3);
  SC.depth(x, () => { x.beginPath(); x.moveTo(-24, -15); x.quadraticCurveTo(-25, -38, -14, -42); x.quadraticCurveTo(-5, -40, 0, -36); x.quadraticCurveTo(5, -40, 14, -42); x.quadraticCurveTo(25, -38, 24, -15); x.closePath(); }, hat, 2, 0.22);
  x.fillStyle = '#c9472f'; x.beginPath(); x.moveTo(-24.5, -22); x.lineTo(24.5, -22); x.lineTo(24, -15); x.lineTo(-24, -15); x.closePath(); x.fill();
  x.fillStyle = '#6cb04a'; x.beginPath(); x.ellipse(15, -24, 4, 7, 0.7, 0, 7); x.fill(); x.strokeStyle = '#3f7a2c'; x.lineWidth = 1; x.beginPath(); x.moveTo(11, -20); x.lineTo(19, -28); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.2)'; x.beginPath(); x.ellipse(-12, -33, 7, 3, -0.4, 0, 7); x.fill();
}

/* ---------- Nena, the shopkeeper: round glasses, a bun with a pencil through it, a striped apron ---------- */
function nenaHead(x, face = 'talk') {
  const skin = '#ecbd8c', hair = '#2c2229';
  SC.depth(x, () => { x.beginPath(); x.arc(0, -36, 14, 0, 7); }, hair, 2.5, 0.3);
  x.strokeStyle = '#f2c94c'; x.lineWidth = 3.4; x.lineCap = 'butt'; x.beginPath(); x.moveTo(-16, -30); x.lineTo(14, -46); x.stroke();
  x.strokeStyle = '#ff8fa8'; x.beginPath(); x.moveTo(14, -46); x.lineTo(18, -48); x.stroke();
  SC.depth(x, () => { x.beginPath(); x.ellipse(0, 6, 31, 28, 0, 0, 7); }, skin, 2.5, 0.22);
  // hair swept back from a centre part, tucked behind the ears
  x.fillStyle = hair; x.beginPath(); x.moveTo(-32, 8); x.bezierCurveTo(-36, -34, 36, -34, 32, 8);
  x.quadraticCurveTo(28, -6, 18, -12); x.quadraticCurveTo(8, -16, 1, -21); x.quadraticCurveTo(-8, -16, -18, -12); x.quadraticCurveTo(-28, -6, -32, 8); x.fill();
  x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.ellipse(-12, -20, 9, 3, -0.3, 0, 7); x.fill();
  npcEyes(x, face, { ex: 12, ey: 8, rx: 5, ry: 6.6 });
  npcBrows(x, face, hair, { ex: 12, by: -6, bw: 2.2 });
  npcBlush(x, 19, 21, 0.5);
  npcMouth(x, face, '#c4485a', 23);
  // round glasses
  x.strokeStyle = '#c9962f'; x.lineWidth = 2; for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 12, 8, 9.5, 0, 7); x.stroke(); }
  x.beginPath(); x.moveTo(-2.5, 6); x.quadraticCurveTo(0, 4, 2.5, 6); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.35)'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 12 + 4, 4, 2, 4, 0.5, 0, 7); x.fill(); }
  x.fillStyle = '#ffffff'; for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 31, 16, 2.2, 0, 7); x.fill(); }
}

/* ---------- Dr. Ines, who runs the lab: wild silver hair in a bun, brass goggles pushed up ---------- */
function inesHead(x, face = 'talk') {
  const skin = '#f2cba2', hair = '#c3c6d2', hairD = '#8f93a6';
  SC.depth(x, () => SC.blob(x, 10, -34, [[0, 0, 13], [-11, 4, 9], [10, 5, 9], [2, -10, 8]]), hair, 2.5, 0.3);
  x.strokeStyle = hair; x.lineWidth = 2.2; x.lineCap = 'round';
  for (const [a, b, c2, d] of [[22, -44, 30, -52], [-2, -44, -8, -54], [20, -26, 30, -24], [14, -46, 16, -56]]) { x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo((a + c2) / 2 + 3, (b + d) / 2, c2, d); x.stroke(); }
  SC.depth(x, () => { x.beginPath(); x.ellipse(0, 6, 28, 28, 0, 0, 7); }, skin, 2.5, 0.22);
  x.fillStyle = hair; x.beginPath(); x.moveTo(-31, 12); x.bezierCurveTo(-36, -34, 34, -36, 31, 4);
  x.quadraticCurveTo(24, -10, 10, -14); x.quadraticCurveTo(-6, -12, -16, -6); x.quadraticCurveTo(-26, 0, -27, 14); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(26, -2); x.quadraticCurveTo(33, 12, 28, 24); x.quadraticCurveTo(25, 12, 24, 2); x.fill();
  npcEyes(x, face, { ex: 11.5, ey: 9, rx: 5, ry: 6.8 });
  npcBrows(x, face, hairD, { ex: 11.5, by: -3, bw: 2 });
  x.strokeStyle = 'rgba(150,90,60,.3)'; x.lineWidth = 1; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 7, 17.5); x.quadraticCurveTo(s * 11, 19, s * 15, 17.5); x.stroke(); }
  npcBlush(x, 19, 19, 0.36);
  npcMouth(x, face, '#9a3e4a', 24);
  // goggles on her forehead
  x.strokeStyle = '#3b3f4f'; x.lineWidth = 4; x.beginPath(); x.moveTo(-29, -12); x.quadraticCurveTo(0, -22, 29, -12); x.stroke();
  for (const s of [-1, 1]) { SC.depth(x, () => { x.beginPath(); x.arc(s * 10, -18, 9, 0, 7); }, '#c08f3e', 1.5, 0.3);
    x.fillStyle = '#8fd8ff'; x.beginPath(); x.arc(s * 10, -18, 6.2, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(s * 10 - 2, -20.5, 2, 0, 7); x.fill(); }
}

/* ---------- Benji, her assistant: messy hair, thick square glasses ---------- */
function benjiHead(x, face = 'talk') {
  const skin = '#c98d5e', hair = '#1f1a24';
  SC.depth(x, () => { x.beginPath(); x.ellipse(-28, 10, 5, 7, 0, 0, 7); x.ellipse(28, 10, 5, 7, 0, 0, 7); }, skin, 2, 0.28);
  SC.depth(x, () => { x.beginPath(); x.ellipse(0, 7, 27, 28, 0, 0, 7); }, skin, 2.5, 0.22);
  // messy hair with tufts and a cowlick
  x.fillStyle = hair; x.beginPath(); x.moveTo(-29, 8); x.bezierCurveTo(-34, -30, -14, -36, 0, -35); x.bezierCurveTo(16, -36, 34, -30, 29, 8);
  x.lineTo(26, -4); x.lineTo(20, -8); x.lineTo(17, -2); x.lineTo(10, -10); x.lineTo(4, -4); x.lineTo(-3, -11); x.lineTo(-9, -4); x.lineTo(-15, -10); x.lineTo(-20, -3); x.lineTo(-26, -6); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(-6, -33); x.quadraticCurveTo(-4, -46, 6, -48); x.quadraticCurveTo(0, -42, 4, -34); x.fill();
  x.beginPath(); x.moveTo(-28, -16); x.lineTo(-36, -18); x.lineTo(-30, -8); x.fill(); x.beginPath(); x.moveTo(26, -20); x.lineTo(35, -24); x.lineTo(30, -12); x.fill();
  x.fillStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.ellipse(-8, -26, 8, 2.6, -0.3, 0, 7); x.fill();
  npcEyes(x, face, { ex: 11.5, ey: 9, rx: 4.6, ry: 6.2 });
  npcBrows(x, face, hair, { ex: 11.5, by: -3, bw: 2.6 });
  npcBlush(x, 21, 19, 0.3);
  npcMouth(x, face, '#6e2a2a', 25);
  // thick glasses
  x.fillStyle = 'rgba(170,220,255,.22)'; x.strokeStyle = '#2b2b35'; x.lineWidth = 3.2;
  for (const s of [-1, 1]) { x.beginPath(); x.roundRect(s * 11.5 - 9, 1, 18, 15, 5); x.fill(); x.stroke(); }
  x.beginPath(); x.moveTo(-2.5, 7); x.lineTo(2.5, 7); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.4)'; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 11.5 + 1, 3); x.lineTo(s * 11.5 + 5, 3); x.lineTo(s * 11.5, 13); x.lineTo(s * 11.5 - 3, 13); x.closePath(); x.fill(); }
}

const NPC_HEAD = { guide: kikoHead, shop: nenaHead, doc: inesHead, aide: benjiHead };

/* ---------- portraits for the speech box: head and shoulders on a coloured square ---------- */
const NPC_BG = { guide: ['#d9ecc4', '#a9cf8a'], shop: ['#fbe0c8', '#e8b98a'], doc: ['#e2dcf6', '#b9b2d8'], aide: ['#d4f0ec', '#9fd2c9'] };
function npcShoulders(x, who) {
  if (who === 'guide') { x.fillStyle = '#c98a55'; x.fillRect(-7, 24, 14, 14);
    SC.depth(x, () => { x.beginPath(); x.roundRect(-30, 34, 60, 60, 14); }, '#efe6cf', 3, 0.25);
    for (const s of [-1, 1]) SC.depth(x, () => { x.beginPath(); x.moveTo(s * 30, 40); x.quadraticCurveTo(s * 30, 34, s * 22, 34); x.lineTo(s * 9, 34); x.lineTo(s * 4, 94); x.lineTo(s * 30, 94); x.closePath(); }, '#6f8048', 2, 0.3);
    x.fillStyle = '#c98a55'; x.beginPath(); x.roundRect(-30, 38, 5, 50, 2); x.roundRect(25, 38, 5, 50, 2); x.fill(); return; }   // backpack straps
  if (who === 'shop') { x.fillStyle = '#d9a774'; x.fillRect(-8, 24, 16, 14);
    SC.depth(x, () => { x.beginPath(); x.roundRect(-34, 34, 68, 60, 18); }, '#e86f5a', 3, 0.28);
    x.save(); x.beginPath(); x.roundRect(-20, 50, 40, 50, 6); x.clip(); x.fillStyle = '#d9f2e6'; x.fillRect(-20, 50, 40, 50); x.fillStyle = '#7fcfb0'; for (let k = -18; k < 22; k += 8) x.fillRect(k, 50, 4, 50); x.restore();
    x.strokeStyle = '#7fcfb0'; x.lineWidth = 3; x.beginPath(); x.moveTo(-18, 52); x.lineTo(-10, 34); x.moveTo(18, 52); x.lineTo(10, 34); x.stroke(); return; }
  if (who === 'doc') { x.fillStyle = '#e2b88f'; x.fillRect(-7, 24, 14, 14);
    SC.depth(x, () => { x.beginPath(); x.roundRect(-30, 34, 60, 60, 14); }, '#f4f6f8', 3, 0.18);
    x.fillStyle = '#7a5bc2'; x.beginPath(); x.moveTo(-10, 34); x.lineTo(0, 58); x.lineTo(10, 34); x.closePath(); x.fill(); x.fillRect(-8, 30, 16, 6);
    x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-10, 34); x.lineTo(-16, 64); x.moveTo(10, 34); x.lineTo(16, 64); x.stroke();
    x.fillStyle = '#5ab0ff'; x.beginPath(); x.roundRect(14, 50, 3, 12, 1); x.fill(); x.fillStyle = '#ff6b6b'; x.beginPath(); x.roundRect(18, 52, 3, 10, 1); x.fill(); return; }
  x.fillStyle = '#b77d50'; x.fillRect(-7, 24, 14, 14);
  SC.depth(x, () => { x.beginPath(); x.roundRect(-32, 34, 64, 60, 14); }, '#f4f6f8', 3, 0.18);
  x.fillStyle = '#2fa89a'; x.beginPath(); x.moveTo(-10, 34); x.lineTo(0, 54); x.lineTo(10, 34); x.closePath(); x.fill();
  x.fillStyle = '#b07a45'; x.beginPath(); x.roundRect(-22, 56, 24, 30, 3); x.fill(); x.fillStyle = '#ffffff'; x.fillRect(-19, 62, 18, 22); x.fillStyle = '#9aa0ad'; x.fillRect(-14, 54, 8, 4);   // clipboard
}
function npcPortrait(cv, who, face) {
  const dpr = devicePixelRatio || 1, S = (cv.clientWidth || 64) * dpr; cv.width = S; cv.height = S;
  const x = cv.getContext('2d'); x.clearRect(0, 0, S, S); const [a, b] = NPC_BG[who] || NPC_BG.guide;
  x.fillStyle = a; x.fillRect(0, 0, S, S); x.fillStyle = b; x.fillRect(0, S * 0.74, S, S);
  const u = S / 120; x.translate(S / 2, S * 0.5 + (who === 'guide' ? S * 0.04 : 0)); x.scale(u, u);
  npcShoulders(x, who); x.translate(0, -6); x.scale(1.05, 1.05); NPC_HEAD[who](x, face);
}

/* ---------- full bodies: feet at (X,Y), h px tall. pose: stand, wave, walk, sit, point, offer ---------- */
function npcLimb(x, col, w, pts) { x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(pts[0], pts[1]); if (pts.length === 4) x.lineTo(pts[2], pts[3]); else x.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); x.stroke(); }
function npcFull(c, who, X, Y, h, face = 'happy', pose = 'stand', t = 0, flip = false) {
  const u = h / 100; c.save(); c.translate(X, Y); c.scale(u * (flip ? -1 : 1), u);
  const sw = pose === 'walk' ? Math.sin(t / 140) * 7 : 0, sit = pose === 'sit';
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 0, 20, 4, 0, 0, 7); c.fill();
  const C = {
    guide: { leg: '#8a6a44', shoe: '#5a3a22', top: '#efe6cf', skin: '#d9a066', arm: '#efe6cf' },
    shop: { leg: '#ecbd8c', shoe: '#7a4a6a', top: '#e86f5a', skin: '#ecbd8c', arm: '#e86f5a' },
    doc: { leg: '#3c3a52', shoe: '#2a2836', top: '#f4f6f8', skin: '#f2cba2', arm: '#f4f6f8' },
    aide: { leg: '#3b4a6a', shoe: '#d24f43', top: '#f4f6f8', skin: '#c98d5e', arm: '#f4f6f8' },
  }[who];
  if (sit) c.translate(0, 18);
  // backpack behind Kiko
  if (who === 'guide') {
    SC.depth(c, () => { c.beginPath(); c.roundRect(-20, -60, 26, 34, 7); }, '#c0793f', 2, 0.3);
    SC.depth(c, () => { c.beginPath(); c.roundRect(-22, -68, 30, 10, 5); }, '#4a7ab8', 1.5, 0.3);
    c.strokeStyle = '#7a4a26'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-14, -68); c.lineTo(-14, -58); c.moveTo(0, -68); c.lineTo(0, -58); c.stroke();
    c.fillStyle = '#9aa0ad'; c.beginPath(); c.arc(-20, -38, 5, 0, Math.PI); c.fill(); c.strokeStyle = '#6a707d'; c.lineWidth = 1; c.beginPath(); c.arc(-20, -38, 5, Math.PI, 0); c.stroke();
  }
  // legs
  if (sit) { SC.depth(c, () => { c.beginPath(); c.roundRect(-14, -22, 30, 9, 4.5); }, '#8a5532', 1.2, 0.3); c.fillStyle = '#c9a66b'; c.beginPath(); c.ellipse(16, -17.5, 2.6, 4.5, 0, 0, 7); c.fill();
    npcLimb(c, C.leg, 7, [-5, -28, 8, -22, 18, -20]); npcLimb(c, C.leg, 7, [5, -28, 14, -24, 22, -22]);
    c.fillStyle = C.shoe; c.beginPath(); c.ellipse(20, -21, 4, 6, 0.2, 0, 7); c.ellipse(24, -23, 4, 6, 0.2, 0, 7); c.fill(); }
  else { if (who === 'shop') { /* her skirt covers the tops of the legs */ }
    npcLimb(c, C.leg, who === 'shop' ? 5.5 : 6.5, [-4.5, -28, -5 - sw * 0.5, -3]); npcLimb(c, C.leg, who === 'shop' ? 5.5 : 6.5, [4.5, -28, 5 + sw * 0.5, -3]);
    c.fillStyle = C.shoe; for (const [s, d] of [[-1, -sw * 0.5], [1, sw * 0.5]]) { c.beginPath(); c.ellipse(s * 6 + d, -3, 6.5, 3.8, 0, 0, 7); c.fill(); }
    if (who === 'guide') { c.fillStyle = '#7a5434'; for (const [s, d] of [[-1, -sw * 0.5], [1, sw * 0.5]]) { c.beginPath(); c.roundRect(s * 5 + d - 4.5, -10, 9, 7, 2); c.fill(); } } }
  // body
  if (who === 'guide') {
    SC.depth(c, () => { c.beginPath(); c.roundRect(-12, -56, 24, 30, 8); }, C.top, 2.5, 0.25);
    for (const s of [-1, 1]) SC.depth(c, () => { c.beginPath(); c.moveTo(s * 12, -50); c.quadraticCurveTo(s * 12, -56, s * 6, -56); c.lineTo(s * 3, -56); c.lineTo(s * 2, -27); c.lineTo(s * 12.5, -27); c.closePath(); }, '#6f8048', 1.5, 0.3);
    c.fillStyle = '#5c6b3a'; for (const s of [-1, 1]) { c.beginPath(); c.roundRect(s * 7.5 - 3, -44, 6, 5, 1); c.fill(); }
    c.fillStyle = '#7a5434'; c.fillRect(-12, -31, 24, 3.5);
  } else if (who === 'shop') {
    SC.depth(c, () => { c.beginPath(); c.moveTo(-14, -24); c.quadraticCurveTo(-18, -8, -15, -6); c.lineTo(15, -6); c.quadraticCurveTo(18, -8, 14, -24); c.closePath(); }, '#5a4a7a', 2, 0.28);
    SC.depth(c, () => { c.beginPath(); c.roundRect(-15, -57, 30, 34, 13); }, C.top, 2.5, 0.28);
    c.save(); c.beginPath(); c.moveTo(-11, -42); c.lineTo(11, -42); c.lineTo(13, -10); c.lineTo(-13, -10); c.closePath(); c.clip();
    c.fillStyle = '#d9f2e6'; c.fillRect(-14, -42, 28, 34); c.fillStyle = '#7fcfb0'; for (let k = -12; k < 14; k += 6) c.fillRect(k, -42, 3, 34); c.restore();
    c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(-6, -30, 12, 8, 2); c.fill();
  } else {
    // lab coats: long, open at the front
    const coatLen = who === 'doc' ? -12 : -16;
    SC.depth(c, () => { c.beginPath(); c.moveTo(-11, -57); c.lineTo(11, -57); c.quadraticCurveTo(14, -57, 14, -53); c.lineTo(16, coatLen); c.lineTo(-16, coatLen); c.lineTo(-14, -53); c.quadraticCurveTo(-14, -57, -11, -57); c.closePath(); }, C.top, 2.5, 0.16);
    c.fillStyle = who === 'doc' ? '#7a5bc2' : '#2fa89a'; c.beginPath(); c.moveTo(-6, -57); c.lineTo(0, -40); c.lineTo(6, -57); c.closePath(); c.fill();
    c.fillStyle = C.leg; c.beginPath(); c.moveTo(-3, -40); c.lineTo(3, -40); c.lineTo(4, coatLen); c.lineTo(-4, coatLen); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-6, -57); c.lineTo(-4, coatLen); c.moveTo(6, -57); c.lineTo(4, coatLen); c.stroke();
    c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.roundRect(-13, -32, 7, 6, 1); c.roundRect(6, -32, 7, 6, 1); c.fill();
    if (who === 'doc') { c.fillStyle = '#5ab0ff'; c.beginPath(); c.roundRect(-11, -52, 2, 8, 1); c.fill(); c.fillStyle = '#ff6b6b'; c.beginPath(); c.roundRect(-8, -51, 2, 7, 1); c.fill(); }
  }
  // arms
  const sh = who === 'shop' ? 14 : 12, aw = who === 'shop' ? 6 : 5.5, hand = (x2, y2) => { c.fillStyle = C.skin; c.beginPath(); c.arc(x2, y2, 3, 0, 7); c.fill(); };
  const armL = pose === 'offer' ? [-sh, -52, -18, -44, -12, -38] : sit ? [-sh, -52, -16, -42, -8, -34] : [-sh, -52, -18 - sw * 0.3, -42, -16 - sw * 0.6, -32];
  let armR = pose === 'wave' ? [sh, -52, 27, -58, 30, -71] : pose === 'point' ? [sh, -52, 24, -52, 30, -56] : pose === 'offer' ? [sh, -52, 18, -44, 12, -38] : sit ? [sh, -52, 16, -42, 8, -34] : [sh, -52, 18 + sw * 0.3, -42, 16 + sw * 0.6, -32];
  if (who === 'aide' && pose !== 'wave' && pose !== 'point') armR = [sh, -52, 14, -44, 4, -42];
  if (who === 'doc' && pose === 'stand') armR = [sh, -52, 16, -42, 12, -32];
  npcLimb(c, C.arm, aw, armL); npcLimb(c, C.arm, aw, armR); hand(armL[4], armL[5]); hand(armR[4], armR[5]);
  if (who === 'guide' && pose !== 'wave' && pose !== 'point' && !sit) { c.strokeStyle = '#8a5a32'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(armR[4] + 1, armR[5] - 18); c.lineTo(armR[4] + 2, 0); c.stroke();
    c.fillStyle = '#6a4226'; c.beginPath(); c.arc(armR[4] + 1, armR[5] - 18, 2.2, 0, 7); c.fill(); }
  if (who === 'aide' && pose !== 'wave' && pose !== 'point') { c.save(); c.translate(2, -46); c.rotate(-0.15); c.fillStyle = '#b07a45'; c.beginPath(); c.roundRect(-6, -2, 13, 17, 1.5); c.fill(); c.fillStyle = '#fff'; c.fillRect(-4.5, 1, 10, 12.5);
    c.fillStyle = '#9aa0ad'; c.fillRect(-2, -3, 5, 3); c.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 0; k < 4; k++) c.fillRect(-3, 3.5 + k * 2.6, 6 + (k % 2) * 1.5, 0.8); c.restore(); hand(4, -42); }
  if (pose === 'offer') { c.fillStyle = '#ffd23f'; c.beginPath(); c.roundRect(-7, -44, 14, 9, 3); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-3, -41, 1.4, 0, 7); c.fill(); }
  // neck and head
  c.fillStyle = C.skin; c.fillRect(-4.5, -64, 9, 10);
  c.translate(0, who === 'guide' ? -77 : -76); c.scale(0.62, 0.62); NPC_HEAD[who](c, face);
  c.restore();
}
/* a person standing in the scenes, at real height: 48 px to a metre */
/* their portrait in the speech box, the way talaFace puts Tala's there */
function npcFace(box, who, text) {
  if (!box || typeof CHIBI_ART === 'undefined' || !CHIBI_ART) return;
  let cv = box.querySelector('canvas.tala-pic');
  if (!cv) { cv = document.createElement('canvas'); cv.className = 'tala-pic'; box.prepend(cv); }
  box.classList.add('has-pic'); npcPortrait(cv, who, typeof talaMood === 'function' ? talaMood(text) : 'talk');
}
const npcPx = who => NPC[who].cm / 100 * (typeof RANCH_PX_M !== 'undefined' ? RANCH_PX_M : 48);

/* ---------- places: Nena's shop and the lab, one screen each in the same yard coordinates as the trip regions ---------- */
const PLACE_SKY = { shop: ['#f3e2c4', '#f3e2c4', '#f3e2c4'], lab: ['#dde7ee', '#dde7ee', '#dde7ee'] };
function npcPlaceArt(c, s, bg, t) {
  if (bg === 'shop') { shopArt(c, t); return true; }
  if (bg === 'lab') { labArt(c, t); return true; }
  return false;
}
function shopArt(c, t) {
  const x0 = -40, x1 = RW + 40, top = GROUND - 400;
  c.fillStyle = '#f3e2c4'; c.fillRect(x0, top, x1 - x0, 400);
  c.strokeStyle = 'rgba(150,100,50,.12)'; c.lineWidth = 1; for (let x = x0; x < x1; x += 14) { c.beginPath(); c.moveTo(x, top); c.lineTo(x, GROUND - 44); c.stroke(); }
  c.fillStyle = '#c98a4c'; c.fillRect(x0, GROUND - 44, x1 - x0, 30); c.fillStyle = '#b07a45'; c.fillRect(x0, GROUND - 44, x1 - x0, 3);
  c.fillStyle = '#a86e3c'; c.fillRect(x0, GROUND - 14, x1 - x0, 80); c.strokeStyle = 'rgba(60,30,10,.18)';
  for (let y = GROUND - 8; y < GROUND + 60; y += 9) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
  // window with curtains
  SC.depth(c, () => { c.beginPath(); c.roundRect(10, GROUND - 124, 52, 48, 4); }, '#8a5a32', 2, 0.25);
  const g = c.createLinearGradient(0, GROUND - 120, 0, GROUND - 80); g.addColorStop(0, '#8fcdf2'); g.addColorStop(1, '#d2edff'); c.fillStyle = g; c.fillRect(14, GROUND - 120, 44, 40);
  SC.cloud(c, 28, GROUND - 108, 4, 0.9); c.fillStyle = '#86c174'; c.beginPath(); c.ellipse(36, GROUND - 80, 30, 8, 0, Math.PI, 0); c.fill();
  c.strokeStyle = '#8a5a32'; c.lineWidth = 2; c.beginPath(); c.moveTo(36, GROUND - 120); c.lineTo(36, GROUND - 80); c.moveTo(14, GROUND - 100); c.lineTo(58, GROUND - 100); c.stroke();
  for (const s2 of [-1, 1]) { c.fillStyle = '#e2574c'; c.beginPath(); const cx = s2 < 0 ? 12 : 60; c.moveTo(cx, GROUND - 128); c.quadraticCurveTo(cx + s2 * -10, GROUND - 104, cx + s2 * 2, GROUND - 76); c.lineTo(cx + s2 * 6, GROUND - 76); c.lineTo(cx + s2 * 6, GROUND - 128); c.closePath(); c.fill(); }
  c.fillStyle = '#c9472f'; c.fillRect(6, GROUND - 130, 60, 4);
  // shelves of snacks and medicine
  for (const y of [GROUND - 116, GROUND - 90, GROUND - 64]) SC.depth(c, () => { c.beginPath(); c.roundRect(72, y, 70, 4, 1.5); }, '#9a6236', 1.5, 0.3);
  const jar = (x, y, col) => { c.fillStyle = 'rgba(220,240,255,.55)'; c.beginPath(); c.roundRect(x - 5, y - 13, 10, 13, 2.5); c.fill(); c.fillStyle = col; c.beginPath(); c.roundRect(x - 4, y - 8, 8, 7, 2); c.fill(); c.fillStyle = '#d24f43'; c.fillRect(x - 5, y - 15, 10, 3); };
  [[80, '#ff7aa2'], [93, '#ffd166'], [106, '#7ad3ff'], [119, '#b98cff'], [132, '#8fe07a']].forEach(([x, col]) => jar(x, GROUND - 116, col));
  for (const x of [82, 104, 126]) { SC.depth(c, () => { c.beginPath(); c.moveTo(x - 9, GROUND - 98); c.lineTo(x + 9, GROUND - 98); c.lineTo(x + 7, GROUND - 90); c.lineTo(x - 7, GROUND - 90); c.closePath(); }, '#c9a066', 1, 0.3);
    c.fillStyle = x === 104 ? '#5fae4a' : '#d9425a'; for (let k = -6; k <= 6; k += 4) { c.beginPath(); c.arc(x + k, GROUND - 99, 2.4, 0, 7); c.fill(); } }
  for (const x of [80, 92, 104]) { c.fillStyle = '#f6efe4'; c.beginPath(); c.roundRect(x - 4, GROUND - 76, 8, 12, 2); c.fill(); c.fillStyle = '#d24f43'; c.fillRect(x - 1, GROUND - 73, 2, 6); c.fillRect(x - 3, GROUND - 71, 6, 2); }
  SC.depth(c, () => { c.beginPath(); c.arc(124, GROUND - 71, 6.5, 0, 7); }, '#ffd23f', 1, 0.3); c.strokeStyle = '#d24f43'; c.lineWidth = 1.2; c.beginPath(); c.arc(124, GROUND - 71, 6.5, -0.6, 0.9); c.stroke();
  c.fillStyle = '#c47f3a'; c.beginPath(); c.roundRect(133, GROUND - 74, 9, 10, 2); c.fill(); c.fillStyle = '#ffd98a'; c.fillRect(134, GROUND - 74, 7, 3);
  // hats and wings on pegs, the skill chip case
  c.fillStyle = '#8a5a32'; c.fillRect(156, GROUND - 128, 76, 3);
  for (const x of [166, 190, 214]) { c.fillStyle = '#6a4226'; c.beginPath(); c.arc(x, GROUND - 124, 1.6, 0, 7); c.fill(); }
  SC.depth(c, () => { c.beginPath(); c.ellipse(166, GROUND - 116, 9, 6, 0, Math.PI, 0); }, '#e2483f', 1, 0.3); c.fillStyle = '#b8352e'; c.fillRect(166, GROUND - 117, 10, 2.5);
  SC.depth(c, () => { c.beginPath(); c.roundRect(184, GROUND - 126, 12, 13, 1); }, '#1b1b1f', 1, 0.3); c.fillStyle = '#1b1b1f'; c.fillRect(181, GROUND - 114, 18, 2.5); c.fillStyle = '#c43b6a'; c.fillRect(184, GROUND - 117, 12, 2);
  c.fillStyle = '#ff6fae'; c.beginPath(); c.ellipse(210, GROUND - 118, 5, 4, -0.4, 0, 7); c.ellipse(218, GROUND - 118, 5, 4, 0.4, 0, 7); c.fill(); c.fillStyle = '#d94a8c'; c.beginPath(); c.arc(214, GROUND - 118, 2.2, 0, 7); c.fill();
  // wings and sunglasses on the wall behind the counter
  for (const sd of [-1, 1]) { c.save(); c.translate(176 + sd * 9, GROUND - 96); c.scale(sd, 1); c.fillStyle = '#f4f4f4';
    for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(6 + k * 3, -2 + k * 4, 9 - k * 2, 4, -0.5, 0, 7); c.fill(); } c.restore(); }
  c.fillStyle = '#d9b56b'; c.beginPath(); c.arc(176, GROUND - 96, 2, 0, 7); c.fill();
  c.fillStyle = '#111'; c.beginPath(); c.roundRect(164, GROUND - 72, 9, 6, 2.5); c.roundRect(175, GROUND - 72, 9, 6, 2.5); c.fill(); c.fillRect(172, GROUND - 71, 4, 1.4);
  c.fillStyle = '#7a4a26'; c.beginPath(); c.roundRect(214, GROUND - 76, 7, 9, 2); c.roundRect(223, GROUND - 76, 7, 9, 2); c.fill();
  // the sign
  c.strokeStyle = '#6a4226'; c.lineWidth = 1; c.beginPath(); c.moveTo(178, GROUND - 162); c.lineTo(184, GROUND - 150); c.moveTo(214, GROUND - 162); c.lineTo(208, GROUND - 150); c.stroke();
  SC.depth(c, () => { c.beginPath(); c.roundRect(168, GROUND - 152, 56, 18, 4); }, '#2f7a5a', 1.5, 0.3);
  c.fillStyle = '#fff4d6'; c.font = '800 10px system-ui'; c.textAlign = 'center'; c.fillText("NENA'S", 196, GROUND - 139.5);
}
/* the counter goes in front of Nena, as a prop after her */
function shopCounter(c) {
  const T = GROUND - 36;
  SC.depth(c, () => { c.beginPath(); c.roundRect(146, T + 4, 92, GROUND - T - 4, [3, 3, 0, 0]); }, '#b0703f', 2, 0.25);
  SC.depth(c, () => { c.beginPath(); c.roundRect(142, T, 100, 7, 2.5); }, '#d39a5a', 1.5, 0.28);
  c.strokeStyle = 'rgba(60,30,10,.2)'; c.lineWidth = 1; for (let x = 208; x < 238; x += 16) { c.beginPath(); c.moveTo(x, T + 8); c.lineTo(x, GROUND - 2); c.stroke(); }
  SC.depth(c, () => { c.beginPath(); c.arc(156, T, 5, Math.PI, 0); }, '#ffd23f', 1, 0.3); c.fillStyle = '#c9962f'; c.fillRect(155, T - 7, 2, 3);
  // a glass case of skill chips in the front of the counter
  c.fillStyle = '#1e2433'; c.beginPath(); c.roundRect(150, T + 10, 50, 22, 2); c.fill();
  ['#ff6b4a', '#4aa3ff', '#ffd23f', '#7fe07a', '#c08cff', '#ff8fd0'].forEach((col, i) => { const cx = 158 + (i % 3) * 17, cy = T + 16 + Math.floor(i / 3) * 10, a = 0.6 + 0.4 * Math.sin(performance.now() / 400 + i);
    const gl = c.createRadialGradient(cx, cy, 0.5, cx, cy, 7); gl.addColorStop(0, col); gl.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a * 0.6; c.fillStyle = gl; c.fillRect(cx - 7, cy - 7, 14, 14); c.globalAlpha = 1;
    c.fillStyle = col; c.beginPath(); c.roundRect(cx - 4.5, cy - 3, 9, 6, 1.5); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(cx - 3, cy - 1.8, 2.6, 1); });
  c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(150, T + 10); c.lineTo(164, T + 10); c.lineTo(154, T + 32); c.lineTo(150, T + 32); c.closePath(); c.fill();
  c.fillStyle = 'rgba(220,240,255,.6)'; c.beginPath(); c.roundRect(222, T - 16, 13, 16, 4); c.fill();
  for (const [dx, dy, col] of [[-3, -4, '#ff7aa2'], [2, -6, '#ffd166'], [-1, -9, '#7ad3ff'], [3, -11, '#8fe07a']]) { c.fillStyle = col; c.beginPath(); c.arc(228 + dx, T - 2 + dy, 2, 0, 7); c.fill(); }
}
function labArt(c, t) {
  const x0 = -40, x1 = RW + 40, top = GROUND - 400;
  c.fillStyle = '#dde7ee'; c.fillRect(x0, top, x1 - x0, 400);
  c.strokeStyle = 'rgba(80,110,140,.12)'; c.lineWidth = 0.8;
  for (let y = GROUND - 44; y > top; y -= 16) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
  for (let x = x0; x < x1; x += 16) { c.beginPath(); c.moveTo(x, top); c.lineTo(x, GROUND - 44); c.stroke(); }
  c.fillStyle = '#b9c8d3'; c.fillRect(x0, GROUND - 44, x1 - x0, 30); c.fillStyle = '#9fb0bd'; c.fillRect(x0, GROUND - 44, x1 - x0, 2.5);
  for (let x = x0, i = 0; x < x1; x += 16, i++) { c.fillStyle = i % 2 ? '#8a98a8' : '#97a5b4'; c.fillRect(x, GROUND - 14, 16, 80); }
  // the Freezer: three pods with frosted glass and a sleeping Snabit shape in each
  for (const [i, x] of [16, 44, 72].entries()) {
    SC.depth(c, () => { c.beginPath(); c.roundRect(x, GROUND - 92, 24, 80, 12); }, '#9aa6b4', 2, 0.3);
    const g = c.createLinearGradient(x, 0, x + 24, 0); g.addColorStop(0, '#bfe6ff'); g.addColorStop(0.5, '#e8f7ff'); g.addColorStop(1, '#a9d6f2');
    c.fillStyle = g; c.beginPath(); c.roundRect(x + 3, GROUND - 86, 18, 64, 9); c.fill();
    c.fillStyle = 'rgba(40,70,110,.32)'; const sh = [[0, 8], [0, 6], [0, 10]][i]; c.beginPath(); c.ellipse(x + 12, GROUND - 38 - sh[1], 6, 7 + sh[1] * 0.4, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x + 5 + ((k * 7 + i * 3) % 14), GROUND - 80 + ((k * 13 + i * 5) % 54), 1.1, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.roundRect(x + 5, GROUND - 82, 3, 40, 1.5); c.fill();
    c.fillStyle = (Math.floor(t / 600) + i) % 3 ? '#5be37a' : '#2fa84a'; c.beginPath(); c.arc(x + 12, GROUND - 17, 2, 0, 7); c.fill();
    c.fillStyle = '#6ab8ff'; c.beginPath(); c.roundRect(x + 6, GROUND - 95, 12, 3, 1.5); c.fill(); }
  c.fillStyle = '#4a5866'; c.font = '800 8px system-ui'; c.textAlign = 'center'; c.fillText('FREEZER', 56, GROUND - 102);
  // a big screen on the back wall: two parents' colours mixing into one
  SC.depth(c, () => { c.beginPath(); c.roundRect(110, GROUND - 140, 70, 46, 4); }, '#3b4554', 2, 0.25);
  c.fillStyle = '#132030'; c.fillRect(114, GROUND - 136, 62, 38);
  for (let i = 0; i < 12; i++) { const a = t / 700 + i * 0.52, r = 8, cx = 145 + Math.cos(a) * r * 1.6, cy = GROUND - 117 + Math.sin(a * 2) * r * 0.6;
    c.fillStyle = i % 2 ? '#ff8a5a' : '#5ad0ff'; c.fillRect(cx - 1.5, cy - 1.5, 3, 3); }
  c.strokeStyle = '#5be37a'; c.lineWidth = 0.8; c.beginPath(); for (let k = 0; k <= 56; k += 2) { const yy = GROUND - 103 + Math.sin(k / 4 + t / 300) * 2; k ? c.lineTo(117 + k, yy) : c.moveTo(117 + k, yy); } c.stroke();
  // shelf of flasks
  SC.depth(c, () => { c.beginPath(); c.roundRect(110, GROUND - 82, 70, 4, 1.5); }, '#9aa6b4', 1.5, 0.3);
  for (const [x, col] of [[118, '#ff7aa2'], [132, '#7ad3ff'], [146, '#b98cff'], [160, '#8fe07a'], [172, '#ffd166']]) { c.fillStyle = 'rgba(230,245,255,.7)'; c.beginPath(); c.moveTo(x - 2, GROUND - 96); c.lineTo(x + 2, GROUND - 96); c.lineTo(x + 2, GROUND - 91); c.lineTo(x + 5, GROUND - 82); c.lineTo(x - 5, GROUND - 82); c.lineTo(x - 2, GROUND - 91); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(x - 3.6, GROUND - 86); c.lineTo(x + 3.6, GROUND - 86); c.lineTo(x + 5, GROUND - 82); c.lineTo(x - 5, GROUND - 82); c.closePath(); c.fill(); }
  // the fusion machine: two pads under a ring, cables back to the wall
  const glow = 0.5 + 0.5 * Math.sin(t / 500);
  c.strokeStyle = '#4a5866'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(190, GROUND - 14); c.quadraticCurveTo(200, GROUND - 40, 236, GROUND - 60); c.stroke();
  c.strokeStyle = '#7a8796'; c.lineWidth = 5; c.beginPath(); c.arc(206, GROUND - 14, 34, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
  c.strokeStyle = `rgba(120,220,255,${0.4 + glow * 0.5})`; c.lineWidth = 2; c.beginPath(); c.arc(206, GROUND - 14, 34, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  for (const px of [190, 222]) { SC.depth(c, () => { c.beginPath(); c.ellipse(px, GROUND - 12, 12, 3.6, 0, 0, 7); }, '#7a8796', 1.5, 0.3);
    c.fillStyle = `rgba(120,220,255,${0.35 + glow * 0.4})`; c.beginPath(); c.ellipse(px, GROUND - 12.5, 9, 2.4, 0, 0, 7); c.fill(); }
}
/* a tent for nights on a trip */
function tentProp(c, x, y) {
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x, y, 30, 4, 0, 0, 7); c.fill();
  SC.depth(c, () => { c.beginPath(); c.moveTo(x - 28, y); c.lineTo(x, y - 34); c.lineTo(x + 28, y); c.closePath(); }, '#e8a33d', 2, 0.28);
  c.fillStyle = '#5a3a22'; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x, y - 24); c.lineTo(x + 9, y); c.closePath(); c.fill();
  c.fillStyle = '#d18a2a'; c.beginPath(); c.moveTo(x, y - 24); c.lineTo(x + 9, y); c.lineTo(x + 15, y); c.closePath(); c.fill();
  c.strokeStyle = '#6a4226'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y - 34); c.lineTo(x, y - 38); c.stroke();
}
/* nights on a trip: a darker region with stars and a moon, lit by the campfire */
function regionNight(c, s, t, vw, vh, G) {
  if (s.dusk) { const g = c.createLinearGradient(0, 0, 0, vh); g.addColorStop(0, `rgba(255,120,70,${0.35 * s.dusk})`); g.addColorStop(1, `rgba(120,50,80,${0.3 * s.dusk})`); c.fillStyle = g; c.fillRect(0, 0, vw, vh); }
  const n = s.night || 0; if (!n) return;
  c.fillStyle = `rgba(10,14,40,${0.62 * n})`; c.fillRect(0, 0, vw, vh);
  const R = SC.rng(21); c.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) { const x = R() * vw, y = R() * (G - 60), tw = 0.5 + 0.5 * Math.sin(t / 500 + i * 1.7); c.globalAlpha = n * (0.35 + 0.65 * tw); c.beginPath(); c.arc(x, y, 0.45 + (i % 3) * 0.2, 0, 7); c.fill(); }
  c.globalAlpha = n; const mx = vw * 0.18, my = 20; const hg = c.createRadialGradient(mx, my, 2, mx, my, 22); hg.addColorStop(0, 'rgba(240,240,210,.35)'); hg.addColorStop(1, 'rgba(240,240,210,0)'); c.fillStyle = hg; c.fillRect(mx - 22, my - 22, 44, 44);
  c.save(); c.beginPath(); c.rect(mx - 10, my - 10, 20, 20); c.arc(mx + 3.2, my - 1.8, 5.6, 0, 7, true); c.clip(); c.fillStyle = '#f4f1d6'; c.beginPath(); c.arc(mx, my, 6.5, 0, 7); c.fill(); c.restore(); c.globalAlpha = 1;
}
/* the monster layer at night: everything drawn so far darkens, except near the fire */
function npcNightPass(c, s, t, W, H, world) {
  const n = s.night || 0;
  if (!n) { if (s.dusk) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop'; c.fillStyle = `rgba(255,110,70,${0.18 * s.dusk})`; c.fillRect(0, 0, W, H); c.restore(); } return; }
  const fire = s.props.find(p => p.k === 'fire');
  let fx = 0, fy = 0; if (fire) { world(); const q = c.getTransform().transformPoint(new DOMPoint(fire.x, fire.y - 8)); fx = q.x; fy = q.y; }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
  if (fire) { const R = Math.max(W, H) * 0.32, g = c.createRadialGradient(fx, fy, R * 0.12, fx, fy, R);
    g.addColorStop(0, `rgba(255,170,80,${0.12 * n})`); g.addColorStop(0.5, `rgba(20,24,60,${0.35 * n})`); g.addColorStop(1, `rgba(10,14,40,${0.55 * n})`); c.fillStyle = g; }
  else c.fillStyle = `rgba(10,14,40,${0.5 * n})`;
  c.fillRect(0, 0, W, H); c.restore();
  if (fire) { world(); awayProps(c, fire, t, false); }
}

/* ---------- errantry with Kiko: he picks the Snabit up at the road, stands by while it works, camps with it
   between weeks and walks it home. Smooth art only; the pixel ranch keeps the old walk off and walk back. ---------- */
const kikoOn = () => typeof smoothRanch === 'function' && smoothRanch();
const asName = t => t.replace(/^It /, RS.m.name + ' ').replace(/^Its /, RS.m.name + "'s ");
function guideAt(x, o = {}) { return prop({ k: 'npc', who: 'guide', x, y: GROUND, face: 'happy', pose: 'stand', flip: false, ...o }); }
/* Kiko waits at the road to town, the monster walks over, and the yard fades out */
async function tripLeave(line) {
  const s = RS; say(line);
  if (!kikoOn()) { s.pose = 'happy'; await hop(12, 380); await walkTo(RW + 30, 60, 'walk'); return; }
  if (s.room) leaveBarn();
  const g = guideAt(2 * RW - 24, { pose: 'wave', flip: true }); s.camJump = true;
  s.pose = 'happy'; await hop(10, 360); await walkTo(2 * RW - 62, 70, 'walk'); g.pose = 'stand'; s.pose = 'idle'; await rwait(900);
  s.trip = true; await sceneFade(true, 800); unprop(g);
}
/* the region opens with Kiko standing at the left, watching */
async function tripArrive(el) {
  const s = RS; s.bg = 'reg:' + el; s.trip = true; s.night = 0; s.dusk = 0;
  if (!kikoOn()) { s.x = -30; return; }
  s.props = []; s.x = 60; s.pose = 'idle'; s.camJump = true; s.guide = guideAt(18, { face: 'talk' }); await rwait(250); await sceneFade(false, 800);
}
/* tasks clear the props; Kiko stays */
function keepGuide() { const s = RS; if (s.guide && !s.props.includes(s.guide)) s.props.unshift(s.guide); }
/* a short night at camp between weeks, then morning in the same place */
async function campNight(label, line, atDawn) {
  const s = RS; if (!kikoOn()) return;
  await sceneFade(true, 600);
  const keep = s.props; s.props = [{ k: 'tent', x: 52, y: GROUND }, { k: 'npc', who: 'guide', x: 100, y: GROUND, face: 'happy', pose: 'sit' }, { k: 'fire', x: 128, y: GROUND }];
  s.x = 164; s.pose = 'sleep'; s.night = 1; s.tripLabel = label; drawUI(); say(line, 'guide');
  await sceneFade(false, 700);
  for (let k = 0; k < 3; k++) { spark(s.x + 8, headY(), 'z'); await rwait(550); }
  await dayFade('camp', async () => { s.night = 0; s.props = keep; keepGuide(); s.x = 60; s.pose = 'idle'; if (atDawn) await atDawn(); });
}
/* sunset in the region, the walk into the ranch at night, then black and morning at home */
async function tripHome(duskLine, homeLine, mood) {
  const s = RS;
  if (!kikoOn()) { s.props = s.props.filter(p => p.k === 'bowl'); await walkTo(RW + 30, 60, 'walk'); s.bg = null; s.tripLabel = null; s.trip = false; await homeArrive(140); s.pose = mood; return; }
  s.props = []; s.guide = guideAt(172, { pose: 'wave', flip: true }); s.x = 110; s.pose = mood; s.camJump = true;
  say(duskLine, 'guide'); for (let k = 1; k <= 12; k++) { s.dusk = k / 12; await rwait(90); } s.guide.pose = 'stand'; await rwait(1500);
  await sceneFade(true, 900);
  s.dusk = 0; s.bg = null; s.tripLabel = null; s.trip = false; s.dayHour = 21; s.props = [];
  const g = guideAt(2 * RW + 14, { pose: 'walk', flip: true }); s.guide = null; s.x = 2 * RW - 14; s.camJump = true; drawUI();
  await sceneFade(false, 700); say(homeLine, 'guide');
  await Promise.all([walkTo(300, 60, 'walk'), (async () => { while (g.x > 344) { g.x -= 60 * rk() / 60; await rwait(16); } g.pose = 'stand'; })()]);
  s.pose = mood; await rwait(1200);
  await dayFade('home', () => { unprop(g); s.x = 150; s.camJump = true; s.pose = mood; });
}

/* ---------- visits: Nena's shop and the lab. No week passes, and the panel carries who is talking ---------- */
function npcBox(who, text) { const N = NPC[who]; return `<div class="tipbox npcbox full" data-who="${who}"><div class="tip-who" style="background:${N.tag}">${N.name}</div><div>${text}</div></div>`; }
function npcPanel(html) { panel(html); document.querySelectorAll('#r-panel .npcbox').forEach(b => npcFace(b, b.dataset.who, b.textContent)); }
async function visitPlace(place) {
  const s = RS; if (!s || s.busy) return;
  if (s.visit === place || !kikoOn()) return;
  if (s.room) leaveBarn();
  s.idling = false; s.cur = ++RACT;
  if (s.visit) { s.props = s.propsHome || []; s.propsHome = null; }
  try { await sceneFade(true, 500); } catch (e) {}
  s.visit = place; s.propsHome = s.props; s.bg = place; s.jy = 0; s.pose = 'idle'; s.camJump = true;
  s.props = place === 'shop' ? [{ k: 'npc', who: 'shop', x: 210, y: GROUND - 10, face: 'happy', pose: 'wave', flip: true }, { k: 'counter', x: 0, y: GROUND }]
    : [{ k: 'npc', who: 'aide', x: 94, y: GROUND, face: 'talk', pose: 'stand' }, { k: 'npc', who: 'doc', x: 168, y: GROUND, face: 'happy', pose: 'stand', flip: true }];
  s.x = place === 'shop' ? 80 : 128;
  try { await sceneFade(false, 500); } catch (e) {}
  const p = s.props.find(q => q.pose === 'wave'); if (p) setTimeout(() => { p.pose = 'stand'; }, 1600);
}
async function leaveVisit(fade = true) {
  const s = RS; if (!s || !s.visit) return;
  if (fade) try { await sceneFade(true, 450); } catch (e) {}
  s.visit = null; s.bg = null; s.props = s.propsHome || s.props.filter(p => p.k === 'bowl'); s.propsHome = null; s.x = 150; s.camJump = true;
  if (fade) try { await sceneFade(false, 450); } catch (e) {}
}
