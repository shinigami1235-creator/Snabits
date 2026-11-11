/* Puts the chibi drawings (chibi.js) into the ranch and battle screens while the pixel art stays the default.
   Turn it on with #art=chibi in the address, or localStorage "snabits-art" set to "chibi".
   Only families listed in CHIBI_FAMS are drawn smooth; the rest keep their pixels. */
const CHIBI_FAMS = ['Chomp', 'Squib', 'Antik', 'Moko', 'Pinch', 'Stilt', 'Skit', 'Booly'];
const CHIBI_ART = /(^#|&)art=chibi(&|$)/.test(location.hash) || (() => { try { return localStorage.getItem('snabits-art') === 'chibi'; } catch (e) { return false; } })();

/* m is a hatched monster or a fight snapshot; s is the ranch state when there is one */
function chibiSpec(m, s) {
  const src = s || m, fam = (s ? s.m : m).family;
  if (!CHIBI_ART || typeof CHIBI === 'undefined' || !CHIBI_FAMS.includes(fam)) return null;
  const stage = src.stage || 'Bit', marks = [];
  if (stage !== 'Bit' && src.mark != null && MARK[src.mark]) marks.push(MARK[src.mark][0]);
  if (stage === 'Mega' && src.mark2 != null && MARK[src.mark2]) marks.push(MARK[src.mark2][0]);
  return { family: fam, stage, marks, pal: src.pal || (s ? s.m.pal : m.pal), el: (s ? s.m : m).el1, worn: src.worn || {} };
}

/* ranch: the scene canvas is 240 wide and stretched, so the monster draws on a full-resolution layer over it */
const RANCH_POSE = { idle: 'idle', walk: 'walk', run: 'run', happy: 'happy', eat: 'eat', hurt: 'hurt', sleep: 'sleep',
  sad: 'sad', dizzy: 'dizzy', effort: 'effort', tired: 'tired', sit: 'sit', lean: 'lean', guard: 'guard', float: 'hover' };
const CHIBI_UNIT = 0.5;                 // game pixels per drawing unit: a Bit stands about as tall as the pixel Bit did
function chibiLayer() {
  let o = document.getElementById('r-chibi');
  if (!o) { o = document.createElement('canvas'); o.id = 'r-chibi';
    Object.assign(o.style, { position: 'absolute', inset: '2px', width: 'calc(100% - 4px)', height: 'calc(100% - 4px)', pointerEvents: 'none', borderRadius: 'var(--r)' });
    document.getElementById('r-frame').appendChild(o); }
  return o;
}
function chibiRanch(s, t) {
  const spec = chibiSpec(null, s), old = document.getElementById('r-chibi');
  if (!spec) { if (old) old.remove(); return false; }
  const o = chibiLayer(), cv = document.getElementById('r-canvas'), r = o.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  if (o.width !== W) o.width = W; if (o.height !== H) o.height = H;
  const c = o.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  if (s.hidden) return true;
  const k = W / cv.width, room = RW - cv.width, camX = Math.round(clamp(s.camX || 0, 0, room)), u = k * CHIBI_UNIT;
  const x = (s.x - camX) * k, y = (GROUND + (s.vExtra || 0) - (s.jy || 0)) * k;
  c.setTransform(u, 0, 0, u, x - 100 * u, y - 188 * u);
  CHIBI.draw(c, spec, RANCH_POSE[s.pose] || 'idle', t);
  const h = CHIBI.height(spec.stage, spec.marks, spec.family) * CHIBI_UNIT, w = CHIBI.width(spec.stage, spec.family) * CHIBI_UNIT;   // tap box for petting
  s.bbox = [s.x - w / 2, GROUND - h, s.x + w / 2, GROUND];
  return true;
}

/* ---------- battle ----------
   Both monsters draw on one layer over the arena, so an attack can cross it and land on the other side.
   The sprite canvases stay in place, hidden, as the anchors for each side's position and for the damage popups. */
const CB = { side: [null, null], anim: null, loop: false, now: null };
const SIDE_ID = ['b-me-sprite', 'b-foe-sprite'];
const cbNow = () => CB.now != null ? CB.now : performance.now();
const eo = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3), ei = k => Math.pow(Math.min(1, Math.max(0, k)), 3);
const eio = k => { k = Math.min(1, Math.max(0, k)); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };

function arenaLayer() {
  let o = document.getElementById('b-chibi');
  if (!o) { o = document.createElement('canvas'); o.id = 'b-chibi';
    Object.assign(o.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
    document.getElementById('arena').appendChild(o); }
  return o;
}
function paintSprite(cv, m, s) {
  const who = SIDE_ID.indexOf(cv.id), spec = chibiSpec(m, s);
  if (!spec || who < 0) { cv.style.visibility = ''; if (who >= 0) CB.side[who] = null; paint(cv, m.grid, m.pal, 1); return; }
  cv.style.visibility = 'hidden';
  CB.side[who] = { spec, pose: 'idle', shown: 'idle', from: 'idle', t0: 0, react: null, hold: null, ko: null };
  if (who === 0 || who === 1) CB.anim = null;
  arenaLayer();
  if (!CB.loop) { CB.loop = true; requestAnimationFrame(chibiBattleLoop); }
}
/* where each side stands, in arena pixels: the bottom centre of its sprite box */
function home(who) {
  const r = document.getElementById(SIDE_ID[who]).getBoundingClientRect(), a = document.getElementById('arena').getBoundingClientRect();
  return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height - 6, size: r.width };
}
const unitOf = (st, h) => h.size / 228 * Math.min(1.25, 190 / (CHIBI.height(st.spec.stage, st.spec.marks, st.spec.family) + 30));

/* ---------- attacks ----------
   Each attack is a timeline in milliseconds. atk() moves the attacker along the line to the enemy (f = 0 at home,
   1 at the enemy) and picks its pose; def() moves the enemy; fx() draws what flies between them. C is the moment of
   contact, when the damage number appears. */
const ANIM = {
  tackle: { C: 330, D: 760,
    atk: t => t < 180 ? { f: -0.05 * eo(t / 180), pose: 'crouch' } : t < 330 ? { f: -0.05 + 0.87 * ei((t - 180) / 150), pose: 'tackle' }
      : t < 440 ? { f: 0.82 - 0.14 * eo((t - 330) / 110), pose: 'tackle' } : { f: 0.68 * (1 - eio((t - 440) / 320)), arc: -Math.sin(eio((t - 440) / 320) * Math.PI) * 22, pose: 'idle' } },
  bite: { C: 300, D: 720,
    atk: t => t < 150 ? { f: -0.04 * eo(t / 150), pose: 'crouch' } : t < 300 ? { f: -0.04 + 0.8 * ei((t - 150) / 150), pose: 'bitewide' }
      : t < 410 ? { f: 0.76, pose: 'chomp' } : { f: 0.76 * (1 - eio((t - 410) / 300)), arc: -Math.sin(eio((t - 410) / 300) * Math.PI) * 16, pose: 'idle' },
    fx(c, t, x) { if (t > 300 && t < 470) chompMarks(c, x.target, (t - 300) / 170); } },
  stomp: { C: 480, D: 880,
    atk(t, x) { const top = -x.foeH * 0.55;
      if (t < 150) return { f: 0, pose: 'crouch' };
      if (t < 480) { const k = (t - 150) / 330; return { f: 0.95 * eio(k), arc: top * eio(k) - Math.sin(k * Math.PI) * 80, pose: k < 0.8 ? 'jump' : 'land' }; }
      if (t < 580) return { f: 0.95, arc: top, pose: 'land' };
      const k = eio((t - 580) / 300); return { f: 0.95 * (1 - k), arc: top * (1 - k) - Math.sin(k * Math.PI) * 50, pose: k < 0.85 ? 'jump' : 'idle' }; },
    def: t => t > 480 && t < 640 ? { sx: 1.18, sy: 0.7 } : null,
    fx(c, t, x) { if (t > 480 && t < 700) dust(c, x.target, (t - 480) / 220); } },
  punch: { C: 470, D: 870,
    atk: t => t < 250 ? { f: 0.6 * eo(t / 250), pose: 'walk' } : t < 380 ? { f: 0.6, pose: 'punchwind' } : t < 470 ? { f: 0.6 + 0.08 * eo((t - 380) / 90), pose: 'punch' }
      : t < 570 ? { f: 0.68, pose: 'punch' } : { f: 0.68 * (1 - eio((t - 570) / 300)), pose: 'idle' } },
  claw: { C: 450, D: 850,
    atk: t => t < 250 ? { f: 0.62 * eo(t / 250), pose: 'walk' } : t < 370 ? { f: 0.62, pose: 'swipeup' } : t < 450 ? { f: 0.62 + 0.06 * eo((t - 370) / 80), pose: 'swipedown' }
      : t < 550 ? { f: 0.68, pose: 'swipedown' } : { f: 0.68 * (1 - eio((t - 550) / 300)), pose: 'idle' },
    fx(c, t, x) { if (t > 430 && t < 760) slash(c, x.target, (t - 430) / 330); } },
  lift: { C: 830, D: 1150,
    atk: t => ({ f: 0, pose: t < 900 ? 'cast' : 'idle' }),
    def(t) { if (t < 150) return null; if (t < 650) return { lift: -70 * eo((t - 150) / 500), rot: Math.sin(t / 95) * 0.1, pose: 'float' };
      if (t < 770) return { lift: -70 + Math.sin(t / 40) * 2, rot: Math.sin(t / 95) * 0.1, pose: 'float' };
      if (t < 830) return { lift: -70 * (1 - ei((t - 770) / 60)), pose: 'float' }; return null; },
    fx(c, t, x) { if (t < 900) psyAura(c, x.self, t, 1); if (t > 150 && t < 830) psyAura(c, x.target, t, 0.8, x.targetLift); } },
  push: { C: 470, D: 1000,
    atk: t => ({ f: t < 470 ? 0.05 * eo(t / 470) : 0.05 * (1 - eio((t - 470) / 400)), pose: t < 200 ? 'cast' : t < 700 ? 'push' : 'idle' }),
    def(t) { if (t < 470) return null; const k = (t - 470) / 530; return { f: -0.22 * (k < 0.25 ? eo(k / 0.25) : 1 - eio((k - 0.25) / 0.75)), rot: -0.15 * (1 - k), pose: k < 0.5 ? 'hit' : 'idle' }; },
    fx(c, t, x) { if (t < 300) psyAura(c, x.self, t, 0.7); if (t > 200 && t < 560) waves(c, x.self, x.target, (t - 200) / 360); } },
  cast: { C: 320, D: 620,
    atk: t => ({ f: 0, pose: t < 480 ? 'cast' : 'idle' }),
    fx(c, t, x) { if (t < 480) psyAura(c, x.self, t, 0.6, 0, x.col); } }
};
/* which attack a move plays: by its name first, then by what the body can do */
function animFor(e, spec) {
  const n = e.name || '', fam = spec.family, bit = spec.stage === 'Bit', arms = !['Squib', 'Skit'].includes(fam) && !bit;
  if (e.kind === 'Cast') return /Nightmare|Abyss|Hypno|Soul Sap|Sap Drain|Plague/.test(n) ? 'lift' : /Heart Burst|Thunderclap|Radiance|Maelstrom|Overload|Absolute/.test(n) ? 'push' : 'cast';
  if (/Bite|Fang|Maw|Grind/.test(n)) return 'bite';
  if (/Drop|Fall|Quake|Comet|Meteor|Crash|Landslide/.test(n)) return 'stomp';
  if (/Jab|Palm|Punch|Kick|Flurry/.test(n)) return arms ? 'punch' : 'tackle';
  if (/Claw|Lash|Edge|Sting|Sneak/.test(n)) return fam === 'Pinch' || arms ? 'claw' : 'bite';
  if (e.name === 'Attack') return fam === 'Chomp' || fam === 'Skit' ? 'bite' : fam === 'Pinch' ? 'claw' : bit ? (fam === 'Stilt' || fam === 'Antik' ? 'stomp' : 'tackle') : arms ? 'punch' : 'tackle';
  return 'tackle';
}
function chibiUse(e) {
  const st = CB.side[e.who]; if (!st) return Promise.resolve();
  const kind = animFor(e, st.spec), A = ANIM[kind];
  CB.anim = { who: e.who, kind, t0: cbNow(), col: e.el ? hexRgb(typeof ELC === 'function' ? ELC(e.el) : '#a070ff') : [170, 110, 255] };
  return new Promise(r => setTimeout(r, A.C));
}
const hexRgb = h => /^#[0-9a-f]{6}$/i.test(h) ? [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)) : [170, 110, 255];
/* a hit, a miss, a guard or a cast shown on one side */
function chibiBump(who, cls) {
  const st = CB.side[who]; if (!st) return;
  const now = cbNow();
  if (cls === 'bhit') st.react = { kind: 'hit', t0: now };
  if (cls === 'miss') st.react = { kind: 'dodge', t0: now };
  if (cls === 'bguard') st.hold = { pose: 'guard', until: now + 550 };
  if (cls === 'bcast' && !(CB.anim && CB.anim.who === who)) st.hold = { pose: 'cast', until: now + 500 };
}
function chibiPose(who, pose, ms) {
  const st = CB.side[who]; if (!st) return;
  if (pose === 'ko') { st.ko = cbNow(); return; }
  st.hold = { pose, until: ms ? cbNow() + ms : Infinity };
}

/* ---------- effects that fly between the two sides ---------- */
function burst(c, p, k) {
  c.save(); c.translate(p.x, p.y); c.globalAlpha = 1 - k; c.strokeStyle = '#fff6c8'; c.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3, r0 = 10 + k * 18, r1 = r0 + 14 * (1 - k); c.lineWidth = 4 * (1 - k) + 1;
    c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); c.stroke(); }
  c.fillStyle = '#ffd23f'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 6 : 16 * (1 - k * 0.5); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
  c.restore();
}
function slash(c, p, k) {
  c.save(); c.translate(p.x, p.y); c.globalAlpha = 1 - k * k; c.strokeStyle = '#ffffff'; c.lineCap = 'round';
  for (let i = -1; i <= 1; i++) { const len = Math.min(1, k * 3) * 46; c.lineWidth = 5 - Math.abs(i) * 1.5;
    c.beginPath(); c.moveTo(-20 + i * 11, -24); c.quadraticCurveTo(-4 + i * 11, -2, -20 + i * 11 + len * 0.7, -24 + len); c.stroke(); }
  c.restore();
}
function chompMarks(c, p, k) {
  c.save(); c.translate(p.x, p.y); c.globalAlpha = 1 - k; c.fillStyle = '#fff';
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const x = -18 + i * 12, y = sd * (16 - k * 10);
    c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.lineTo(x, y - sd * 10); c.closePath(); c.fill(); }
  c.restore();
}
function dust(c, p, k) {
  c.save(); c.globalAlpha = 0.7 * (1 - k); c.fillStyle = '#e8dcc4';
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(p.x + sd * (20 + i * 12 + k * 26), p.foot - 4 - i * 3 - k * 8, 6 + i * 2 + k * 5, 0, 7); c.fill(); }
  c.restore();
}
function psyAura(c, p, t, a, lift = 0, col = [170, 110, 255]) {
  c.save(); c.globalAlpha = a; c.lineWidth = 3;
  for (let i = 0; i < 3; i++) { const k = ((t / 600) + i / 3) % 1; c.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.9 * (1 - k)})`;
    c.beginPath(); c.ellipse(p.x, p.foot - 4 + lift, 20 + k * 40, 6 + k * 12, 0, 0, 7); c.stroke(); }
  c.shadowColor = `rgba(${col[0]},${col[1]},${col[2]},.9)`; c.shadowBlur = 12; c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},.9)`;
  for (let i = 0; i < 5; i++) { const ph = ((t / 900) + i / 5) % 1, ang = i * 1.3 + t / 500;
    c.beginPath(); c.arc(p.x + Math.cos(ang) * 30, p.foot - 10 + lift - ph * 60, 2.5 * (1 - ph) + 1, 0, 7); c.fill(); }
  c.restore();
}
function waves(c, a, b, k) {
  c.save(); const ang = Math.atan2(b.y - a.y, b.x - a.x);
  for (let i = 0; i < 3; i++) { const kk = k - i * 0.15; if (kk < 0 || kk > 1) continue;
    const x = a.x + (b.x - a.x) * kk, y = a.y + (b.y - a.y) * kk;
    c.strokeStyle = `rgba(190,150,255,${0.9 * (1 - kk * 0.6)})`; c.lineWidth = 5 - i; c.beginPath(); c.arc(x, y, 16 + kk * 18, ang - 0.9, ang + 0.9); c.stroke(); }
  c.restore();
}

/* ---------- one frame ---------- */
function sideState(who, now, pos) {
  const st = CB.side[who], A = CB.anim, out = { f: 0, arc: 0, lift: 0, rot: 0, sx: 1, sy: 1, pose: 'idle', flash: 0, shake: 0, off: [0, 0], alpha: 1 };
  if (A) { const t = now - A.t0, K = ANIM[A.kind];
    if (t > K.D) CB.anim = null;
    else if (A.who === who) Object.assign(out, K.atk(t, pos));
    else if (K.def) { const d = K.def(t, pos); if (d) Object.assign(out, d); } }
  if (st.hold) { if (now > st.hold.until) st.hold = null; else out.pose = st.hold.pose; }
  const R = st.react;
  if (R) { const k = (now - R.t0) / (R.kind === 'hit' ? 420 : 380);
    if (k > 1) st.react = null;
    else if (R.kind === 'hit') { out.pose = 'hit'; out.flash = k < 0.25 ? 1 : 0; out.shake = Math.sin(k * 40) * 6 * (1 - k); out.f += -0.05 * Math.sin(k * Math.PI); }
    else { const s2 = Math.sin(k * Math.PI); out.pose = 'dodge'; out.off = [pos.perp[0] * 30 * s2, pos.perp[1] * 30 * s2 - 10 * s2]; } }
  if (st.ko) { out.pose = 'ko'; out.alpha = Math.max(0, 1 - (now - st.ko - 350) / 600); }
  return out;
}
function chibiBattleLoop() {
  const bat = document.getElementById('battle');
  if (!CB.side[0] && !CB.side[1] || !bat || bat.style.display === 'none') { CB.loop = false; return; }
  chibiBattleFrame(cbNow());
  requestAnimationFrame(chibiBattleLoop);
}
function chibiBattleFrame(now) {
  const o = arenaLayer(), r = o.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  if (o.width !== W) o.width = W; if (o.height !== H) o.height = H;
  const c = o.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  const H0 = home(0), H1 = home(1), homes = [H0, H1];
  const placed = [], fxq = [];
  for (const who of [1, 0]) {                        // the far side first, so the near side draws over it
    const st = CB.side[who]; if (!st) continue;
    const h = homes[who], o2 = homes[1 - who], V = [o2.x - h.x, o2.y - h.y], L = Math.hypot(V[0], V[1]) || 1;
    const u = unitOf(st, h), other = CB.side[1 - who];
    const foeH = other ? CHIBI.height(other.spec.stage, other.spec.marks, other.spec.family) * unitOf(other, o2) : 60;
    const S = sideState(who, now, { foeH, perp: [-V[1] / L, V[0] / L] });
    if (S.pose !== st.shown) { st.from = st.shown; st.shown = S.pose; st.t0 = now; }
    const k = (now - st.t0) / 110, P = k >= 0 && k < 1 && CHIBI.POSES.includes(st.from) ? CHIBI.blend(st.from, S.pose, k) : S.pose;
    const x = h.x + V[0] * S.f + S.shake + S.off[0], y = h.y + V[1] * S.f + S.arc + S.lift + S.off[1], mir = who === 1 ? -1 : 1;
    c.save(); c.scale(dpr, dpr); c.globalAlpha = S.alpha; if (S.flash) c.filter = 'brightness(1.45)';
    c.translate(x, y); c.rotate(S.rot); c.scale(mir * u * S.sx, u * S.sy); c.translate(-100, -188);
    CHIBI.draw(c, st.spec, P, now, [0.6, who === 0 ? -0.5 : 0.5]);
    c.restore();
    placed[who] = { x, y: y - CHIBI.height(st.spec.stage, st.spec.marks, st.spec.family) * u * 0.45, foot: y, lift: S.lift };
    if (st.react && st.react.kind === 'hit') fxq.push(['burst', who, (now - st.react.t0) / 260]);
  }
  c.save(); c.scale(dpr, dpr);
  const A = CB.anim;
  if (A && ANIM[A.kind].fx && placed[A.who]) { const tgt = placed[1 - A.who] || { x: homes[1 - A.who].x, y: homes[1 - A.who].y - 40, foot: homes[1 - A.who].y };
    ANIM[A.kind].fx(c, now - A.t0, { self: placed[A.who], target: tgt, targetLift: tgt.lift || 0, col: A.col }); }
  for (const [kind, who, k] of fxq) if (k < 1 && placed[who]) burst(c, placed[who], k);
  c.restore();
}
