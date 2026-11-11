/* Puts the chibi drawings (chibi.js) into the ranch and battle screens while the pixel art stays the default.
   Turn it on with #art=chibi in the address, or localStorage "snabits-art" set to "chibi".
   Only families listed in CHIBI_FAMS are drawn smooth; the rest keep their pixels. */
const CHIBI_FAMS = ['Chomp', 'Squib', 'Antik', 'Moko', 'Pinch', 'Stilt', 'Skit', 'Booly'];
const CHIBI_ART = /(^#|&)art=chibi(&|$)/.test(location.hash) || (() => { try { return localStorage.getItem('snabits-art') === 'chibi'; } catch (e) { return false; } })();

/* m is a hatched monster or a fight snapshot; s is the ranch state when there is one */
function chibiSpec(m, s) {
  const base = s && s.m ? s.m : m, src = s || m, fam = base.family;
  if (!CHIBI_ART || typeof CHIBI === 'undefined' || !CHIBI_FAMS.includes(fam)) return null;
  const stage = src.stage || 'Bit', marks = [];
  if (stage !== 'Bit' && src.mark != null && MARK[src.mark]) marks.push(MARK[src.mark][0]);
  if (stage === 'Mega' && src.mark2 != null && MARK[src.mark2]) marks.push(MARK[src.mark2][0]);
  return { family: fam, stage, marks, pal: src.pal || base.pal, el: base.el1, worn: src.worn || {} };
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
  if (who === 0) spec.back = true;          // the player's own monster faces the enemy, so we see its back
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
  /* projectiles: the attacker stays home and sends something across */
  bolt: { C: 560, D: 860,
    atk: t => ({ f: 0, pose: t < 220 ? 'cast' : t < 640 ? 'push' : 'idle' }),
    fx(c, t, x) { if (t < 220) missile(c, lerpP(x.self, x.target, 0.08, 0), x, t, 0.4 + t / 400);
      else if (t < 560) { const k = (t - 220) / 340; for (let i = 4; i >= 0; i--) { const kk = k - i * 0.05; if (kk > 0) missile(c, lerpP(x.self, x.target, 0.08 + kk * 0.92, 18), x, t, i ? 0.9 - i * 0.15 : 1, i ? 0.45 - i * 0.08 : 1); } }
      else if (t < 780) burst(c, x.target, (t - 560) / 220, x.col); } },
  beam: { C: 380, D: 960,
    atk: t => ({ f: 0, pose: t < 200 ? 'cast' : t < 820 ? 'push' : 'idle' }),
    fx(c, t, x) { if (t < 200) { missile(c, lerpP(x.self, x.target, 0.08, 0), x, t, 0.3 + t / 300); return; }
      if (t < 800) beamFx(c, x, t, Math.min(1, (t - 200) / 90) * Math.min(1, (800 - t) / 140)); } },
  spear: { C: 520, D: 860,
    atk: t => ({ f: 0, pose: t < 200 ? 'cast' : t < 640 ? 'push' : 'idle' }),
    fx(c, t, x) { for (let i = 0; i < 3; i++) { const k = (t - 200 - i * 70) / 320; if (k > 0 && k <= 1) spearFx(c, x, lerpP(x.self, x.target, 0.08 + k * 0.92, 10, (i - 1) * 14), i); }
      if (t > 520 && t < 760) burst(c, x.target, (t - 520) / 240, x.col); } },
  volley: { C: 560, D: 980,
    atk: t => ({ f: 0, pose: t < 160 ? 'cast' : t < 760 ? 'push' : 'idle' }),
    fx(c, t, x) { for (let i = 0; i < 6; i++) { const k = (t - 160 - i * 60) / 400; if (k > 0 && k <= 1) bit(c, x, lerpP(x.self, x.target, 0.08 + k * 0.92, 30 + (i % 3) * 22, (i % 2 ? 1 : -1) * 10 * (i % 3)), t, i); }
      if (t > 560 && t < 900) burst(c, x.target, ((t - 560) % 120) / 120, x.col); } },
  shadowclaw: { C: 520, D: 920,
    atk: t => ({ f: 0, pose: t < 200 ? 'swipeup' : t < 620 ? 'swipedown' : 'idle' }),
    fx(c, t, x) { const k = (t - 220) / 300; if (k > 0 && k <= 1) crescents(c, lerpP(x.self, x.target, 0.1 + k * 0.9, 12), x, k);
      if (t > 500 && t < 880) slash(c, x.target, (t - 500) / 380, [70, 30, 120], 1.4); } },
  lightning: { C: 420, D: 880,
    atk: t => ({ f: 0, pose: t < 700 ? 'cast' : 'idle' }),
    fx(c, t, x) { if (t < 300) { psyAura(c, x.self, t, 0.7, 0, x.col); return; } if (t < 700 && Math.floor(t / 55) % 3 !== 2) lightningFx(c, x.target, t); if (t > 420 && t < 700) burst(c, x.target, (t - 420) / 280, [255, 236, 120]); } },
  pillar: { C: 460, D: 1000,
    atk: t => ({ f: 0, pose: t < 820 ? 'cast' : 'idle' }),
    fx(c, t, x) { if (t > 100 && t < 460) groundRing(c, x.target, (t - 100) / 360, x.col); if (t >= 400 && t < 940) pillarFx(c, x, Math.min(1, (t - 400) / 90) * Math.min(1, (940 - t) / 160), t); } },
  cast: { C: 320, D: 620,
    atk: t => ({ f: 0, pose: t < 480 ? 'cast' : 'idle' }),
    fx(c, t, x) { if (t < 480) psyAura(c, x.self, t, 0.6, 0, x.col); } }
};
/* which attack a move plays: by its name first, then by what the body can do */
const PROJECTILE = [[/Solar Beam|Prism Ray|Holy Ray|Hypno Ray/, 'beam'], [/Zap|Bolt Strike/, 'lightning'], [/Flame Pillar|Absolute Zero/, 'pillar'],
  [/Ice Shard|Frost Nip|Stone Edge/, 'spear'], [/Seed Volley|Leaf Storm|Heart Burst|Starfall|Bitstorm/, 'volley'], [/Night Claw/, 'shadowclaw']];
function animFor(e, spec) {
  const n = e.name || '', fam = spec.family, bit = spec.stage === 'Bit', arms = !['Squib', 'Skit'].includes(fam) && !bit;
  for (const [re, kind] of PROJECTILE) if (re.test(n)) return kind;
  if (e.kind === 'Cast') return /Nightmare|Abyss|Soul Sap|Sap Drain|Plague/.test(n) ? 'lift' : /Thunderclap|Radiance|Maelstrom|Overload/.test(n) ? 'push' : 'bolt';
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
  CB.anim = { who: e.who, kind, t0: cbNow(), el: e.el, name: e.name, col: e.el ? hexRgb(typeof ELC === 'function' ? ELC(e.el) : '#a070ff') : [255, 214, 90] };
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
function burst(c, p, k, col) {
  c.save(); c.translate(p.x, p.y); c.globalAlpha = 1 - k; c.strokeStyle = col ? `rgb(${col.map(v => Math.min(255, v + 60)).join(',')})` : '#fff6c8'; c.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3, r0 = 10 + k * 18, r1 = r0 + 14 * (1 - k); c.lineWidth = 4 * (1 - k) + 1;
    c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); c.stroke(); }
  c.fillStyle = col ? `rgb(${col.join(',')})` : '#ffd23f'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 6 : 16 * (1 - k * 0.5); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
  c.restore();
}
function slash(c, p, k, col, sz = 1) {
  c.save(); c.translate(p.x, p.y); c.scale(sz, sz); c.globalAlpha = 1 - k * k; c.strokeStyle = col ? `rgb(${col.join(',')})` : '#ffffff'; c.lineCap = 'round';
  if (col) { c.shadowColor = 'rgba(150,90,255,.9)'; c.shadowBlur = 10; }
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

/* a point k of the way from a to b, lifted into an arc and pushed sideways by off */
function lerpP(a, b, k, arc = 0, off = 0) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
  return { x: a.x + dx * k - dy / L * off, y: a.y + dy * k + dx / L * off - Math.sin(k * Math.PI) * arc, ang: Math.atan2(dy, dx) };
}
const rgbS = (col, a = 1) => `rgba(${col[0]},${col[1]},${col[2]},${a})`;
/* the thing a bolt carries, drawn by element */
function missile(c, p, x, t, sc = 1, alpha = 1) {
  c.save(); c.translate(p.x, p.y); c.scale(sc, sc); c.globalAlpha = alpha; const col = x.col, el = x.el;
  c.shadowColor = rgbS(col, 0.9); c.shadowBlur = 16;
  if (el === 'Blaze') { const gr = c.createRadialGradient(0, 0, 1, 0, 0, 14); gr.addColorStop(0, '#fff6b0'); gr.addColorStop(0.45, '#ffb030'); gr.addColorStop(1, 'rgba(230,60,30,0)');
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, 14 + Math.sin(t / 40) * 2, 0, 7); c.fill(); }
  else if (el === 'Spark') { c.fillStyle = '#fff6a0'; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.strokeStyle = '#ffe14a'; c.lineWidth = 2.5;
    for (let i = 0; i < 5; i++) { const a = i * 1.26 + t / 60; c.beginPath(); c.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); c.lineTo(Math.cos(a + 0.3) * 13, Math.sin(a + 0.3) * 13); c.lineTo(Math.cos(a) * 18, Math.sin(a) * 18); c.stroke(); } }
  else if (el === 'Venom') { c.fillStyle = 'rgb(150,90,210)'; c.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2, r = 11 + Math.sin(a * 3 + t / 60) * 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill();
    c.fillStyle = 'rgba(190,255,140,.9)'; c.beginPath(); c.arc(-3, -3, 3.5, 0, 7); c.fill(); }
  else if (el === 'Tide') { c.fillStyle = 'rgba(80,150,240,.9)'; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(-4, -4, 4, 2.5, -0.6, 0, 7); c.fill(); }
  else if (el === 'Shade') { c.shadowColor = 'rgba(140,80,220,.9)'; c.fillStyle = 'rgb(40,20,70)'; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill(); c.strokeStyle = 'rgba(170,110,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 14, t / 90, t / 90 + 4); c.stroke(); }
  else if (el === 'Light') { c.rotate(t / 120); c.fillStyle = '#fffbe6'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 5 : 15; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); }
  else { c.fillStyle = rgbS(col.map(v => Math.min(255, v + 40))); c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(-3, -3, 3.5, 0, 7); c.fill(); }
  c.restore();
}
function beamFx(c, x, t, w) {
  const a = lerpP(x.self, x.target, 0.08), b = x.target, prism = /Prism/.test(x.name), hypno = /Hypno/.test(x.name), col = /Solar/.test(x.name) ? [200, 240, 90] : x.col;
  c.save(); c.lineCap = 'round'; c.shadowColor = rgbS(col, 0.9); c.shadowBlur = 20;
  if (prism) { const gr = c.createLinearGradient(a.x, a.y, b.x, b.y); ['#ff5a5a', '#ffb347', '#ffe14a', '#5ad16a', '#4aa8ff', '#a070ff'].forEach((h, i) => gr.addColorStop(i / 5, h)); c.strokeStyle = gr; }
  else c.strokeStyle = rgbS(col, 0.85);
  c.lineWidth = 16 * w + Math.sin(t / 30) * 2 * w; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  c.shadowBlur = 0; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 5 * w; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  if (hypno) for (let i = 0; i < 4; i++) { const k = ((t / 300) + i / 4) % 1, p = lerpP(a, b, k); c.strokeStyle = `rgba(255,140,210,${1 - k * 0.5})`; c.lineWidth = 2.5; c.beginPath(); c.arc(p.x, p.y, 8 + k * 6, 0, 7); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(b.x, b.y, 10 * w + Math.sin(t / 25) * 3, 0, 7); c.fill();
  c.restore();
}
function spearFx(c, x, p, i) {
  c.save(); c.translate(p.x, p.y); c.rotate(p.ang); const rock = x.el === 'Stone';
  c.shadowColor = rock ? 'rgba(0,0,0,.3)' : 'rgba(150,215,255,.9)'; c.shadowBlur = 10;
  c.fillStyle = rock ? 'rgb(150,112,78)' : 'rgb(190,232,255)'; c.beginPath();
  if (rock) { c.moveTo(16, 0); c.lineTo(2, -8); c.lineTo(-12, -5); c.lineTo(-10, 6); c.lineTo(4, 7); }
  else { c.moveTo(22, 0); c.lineTo(-4, -6); c.lineTo(-16, 0); c.lineTo(-4, 6); }
  c.closePath(); c.fill(); c.shadowBlur = 0;
  c.fillStyle = rock ? 'rgb(190,156,118)' : '#ffffff'; c.beginPath(); c.moveTo(rock ? 12 : 20, 0); c.lineTo(-4, rock ? -5 : -3); c.lineTo(-2, 0); c.closePath(); c.fill();
  c.restore();
}
/* one item of a volley, shaped by the move */
function bit(c, x, p, t, i) {
  c.save(); c.translate(p.x, p.y); c.rotate(t / 90 + i); const n = x.name;
  if (/Heart/.test(n)) heartShape(c, 0, 0, 0.6, '#ff7fb0');
  else if (/Star/.test(n)) { c.fillStyle = '#ffe98a'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, r = k % 2 ? 4 : 10; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); }
  else if (/Bit/.test(n)) { c.fillStyle = i % 2 ? '#8ef0ff' : '#c9d2e0'; c.fillRect(-5, -5, 10, 10); }
  else if (/Leaf/.test(n)) { c.fillStyle = '#6cc25a'; c.beginPath(); c.ellipse(0, 0, 10, 4.5, 0, 0, 7); c.fill(); c.strokeStyle = '#3f8a38'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.stroke(); }
  else { c.fillStyle = '#a8763c'; c.beginPath(); c.ellipse(0, 0, 6, 4, 0, 0, 7); c.fill(); c.fillStyle = '#7dc95a'; c.beginPath(); c.ellipse(4, -3, 3, 1.6, 0.6, 0, 7); c.fill(); }
  c.restore();
}
function heartShape(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 9);
  c.bezierCurveTo(-14, 0, -11, -11, -5, -11); c.bezierCurveTo(-2, -11, 0, -9, 0, -7); c.bezierCurveTo(0, -9, 2, -11, 5, -11); c.bezierCurveTo(11, -11, 14, 0, 0, 9); c.fillStyle = col; c.fill(); c.restore(); }
function crescents(c, p, x, k) {
  c.save(); c.translate(p.x, p.y); c.rotate(p.ang); c.shadowColor = 'rgba(150,90,255,.9)'; c.shadowBlur = 12; c.fillStyle = 'rgba(50,24,90,.92)';
  for (let i = -1; i <= 1; i++) { c.save(); c.translate(-Math.abs(i) * 6, i * 11); c.beginPath(); c.arc(0, 0, 12, -1.2, 1.2); c.arc(-6, 0, 10, 1.1, -1.1, true); c.closePath(); c.fill(); c.restore(); }
  c.restore();
}
function lightningFx(c, p, t) {
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; let x0 = p.x + 10, y0 = 0; const pts = [[x0, y0]], seed = Math.floor(t / 55);
  for (let i = 1; i <= 7; i++) pts.push([p.x + Math.sin(seed * 7 + i * 2.3) * 14 * (1 - i / 8), (p.y + 6) * i / 7]);
  for (const [w, col] of [[10, 'rgba(255,226,90,.55)'], [4.5, 'rgba(255,248,190,1)'], [1.8, '#ffffff']]) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.stroke(); }
  c.restore();
}
function groundRing(c, p, k, col) { c.save(); c.strokeStyle = rgbS(col, 0.8 * (1 - k * 0.3)); c.lineWidth = 3; c.beginPath(); c.ellipse(p.x, p.foot - 2, 18 + k * 18, 6 + k * 6, 0, 0, 7); c.stroke(); c.restore(); }
function pillarFx(c, x, w, t) {
  const p = x.target, ice = x.el === 'Frost', H = 130 * Math.min(1, w * 1.4);
  c.save();
  if (ice) { for (let i = -2; i <= 2; i++) { const h = (40 + (2 - Math.abs(i)) * 22) * w, bx = p.x + i * 13;
      c.fillStyle = i % 2 ? 'rgba(190,232,255,.95)' : 'rgba(150,210,250,.95)'; c.beginPath(); c.moveTo(bx - 8, p.foot); c.lineTo(bx, p.foot - h); c.lineTo(bx + 8, p.foot); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.moveTo(bx - 2, p.foot - 4); c.lineTo(bx, p.foot - h + 6); c.lineTo(bx + 1, p.foot - 4); c.closePath(); c.fill(); } }
  else { const gr = c.createLinearGradient(0, p.foot, 0, p.foot - H); gr.addColorStop(0, 'rgba(230,60,30,.95)'); gr.addColorStop(0.5, 'rgba(255,150,40,.9)'); gr.addColorStop(1, 'rgba(255,230,120,0)');
    c.fillStyle = gr; for (let i = -1; i <= 1; i++) { const wd = 34 - Math.abs(i) * 10, fl = Math.sin(t / 50 + i * 2) * 4; c.beginPath(); c.moveTo(p.x + i * 14 - wd / 2, p.foot);
      c.quadraticCurveTo(p.x + i * 14 - wd / 2 + fl, p.foot - H * 0.6, p.x + i * 10 + fl, p.foot - H * (1 - Math.abs(i) * 0.25)); c.quadraticCurveTo(p.x + i * 14 + wd / 2 - fl, p.foot - H * 0.6, p.x + i * 14 + wd / 2, p.foot); c.fill(); } }
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
    ANIM[A.kind].fx(c, now - A.t0, { self: placed[A.who], target: tgt, targetLift: tgt.lift || 0, col: A.col || [255, 214, 90], el: A.el, name: A.name || '' }); }
  for (const [kind, who, k] of fxq) if (k < 1 && placed[who]) burst(c, placed[who], k);
  c.restore();
}

/* ---------- tiles and the stadium ---------- */
/* a still drawing in a tile canvas (scan result, Freezer, fusion lab, first-scan picker, wild battle card);
   o: { stage, s (ranch state), grid and scale for the pixel fallback, size in css px when the canvas isn't shown yet } */
function paintMon(cv, m, o = {}) {
  const spec = chibiSpec(m, o.s);
  if (!spec) { cv.style.imageRendering = ''; paint(cv, o.grid || m.grid, m.pal, o.scale || 1); return; }
  if (o.stage) spec.stage = o.stage;
  const dpr = devicePixelRatio || 1, css = cv.clientWidth || o.size || 92, S = Math.round(css * dpr);
  cv.width = S; cv.height = S; cv.style.imageRendering = 'auto';
  const c = cv.getContext('2d'), u = S / 205 * Math.min(1.6, 165 / (CHIBI.height(spec.stage, spec.marks, spec.family) + 20));
  c.setTransform(u, 0, 0, u, S / 2 - 100 * u, S * 0.95 - 188 * u);
  CHIBI.draw(c, spec, o.pose || 'idle', 600, [0, 0]);
}
/* the stadium canvas is 195 wide and stretched, so its monsters draw on a layer over it like the ranch */
const VQ = [];
function chibiVenue(fm, cx, flip, base) {
  const spec = fm && chibiSpec(fm); if (!spec) return false;
  VQ.push({ spec, cx, flip, base }); return true;
}
function chibiVenueFlush(cv) {
  let o = document.getElementById('v-chibi');
  if (!VQ.length && !o) return;
  if (!o) { o = document.createElement('canvas'); o.id = 'v-chibi'; o.style.position = 'absolute'; o.style.pointerEvents = 'none'; cv.parentNode.appendChild(o); }
  Object.assign(o.style, { left: cv.offsetLeft + 'px', top: cv.offsetTop + 'px', width: cv.offsetWidth + 'px', height: cv.offsetHeight + 'px' });
  const dpr = devicePixelRatio || 1, W = Math.round(cv.offsetWidth * dpr), H = Math.round(cv.offsetHeight * dpr);
  if (o.width !== W) o.width = W; if (o.height !== H) o.height = H;
  const c = o.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  const k = W / cv.width, u = k * 0.3, now = performance.now();
  for (const q of VQ.splice(0)) {
    c.setTransform(u * (q.flip ? -1 : 1), 0, 0, u, q.cx * k - 100 * u * (q.flip ? -1 : 1), (q.base + 6) * (H / cv.height) - 188 * u);
    CHIBI.draw(c, q.spec, 'idle', now, [q.flip ? 0.5 : -0.5, 0]);
  }
}
