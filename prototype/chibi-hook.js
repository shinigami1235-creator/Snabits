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
  return { family: fam, stage, marks, pal: src.pal || base.pal, el: base.el1, worn: src.worn || {}, cm: heightCm(base, stage) };
}

/* ---------- size ----------
   How tall each family stands at Bit, Byte and Mega, in cm. A person is about 160 cm. Each monster is 85% to 115% of
   that from its photo, so two monsters of the same kind still differ, and it keeps its size for life. */
const SIZE_CM = { Chomp: [50, 100, 170], Squib: [40, 85, 150], Antik: [60, 120, 200], Moko: [50, 95, 160], Pinch: [45, 90, 150],
  Stilt: [70, 140, 240], Skit: [35, 70, 110], Booly: [55, 110, 190], Quad: [50, 100, 170], Bipped: [60, 120, 190], Flask: [45, 90, 150], Teep: [40, 80, 140], Lern: [45, 90, 160] };
function sizeK(m) {
  if (!m) return 1; if (m.sizeK) return m.sizeK;
  const t = JSON.stringify([m.pal, m.stats, m.lifespan, m.family]); let h = 2166136261;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 0.85 + ((h >>> 0) % 1000) / 1000 * 0.3;
}
function heightCm(m, stage) { const a = SIZE_CM[m && m.family] || [50, 100, 170]; return a[Math.max(0, ['Bit', 'Byte', 'Mega'].indexOf(stage || 'Bit'))] * sizeK(m); }
const heightText = cm => cm >= 100 ? (cm / 100).toFixed(2) + ' m' : Math.round(cm) + ' cm';

/* ranch: the scene canvas is 240 wide and stretched, so the monster draws on a full-resolution layer over it */
const RANCH_POSE = { idle: 'idle', walk: 'walk', run: 'run', happy: 'happy', eat: 'eat', hurt: 'hurt', sleep: 'sleep',
  sad: 'sad', dizzy: 'dizzy', effort: 'effort', tired: 'tired', sit: 'sit', lean: 'lean', guard: 'guard', float: 'hover' };
const CHIBI_UNIT = 0.5;
const RANCH_PX_M = 48;                  // ranch pixels per metre: the fence is 1 m, the barn door 2.3 m
const chibiHeadY = s => { const sp = chibiSpec(null, s); return sp ? GROUND - sp.cm / 100 * RANCH_PX_M * 0.95 - (s.jy || 0) : null; };                 // game pixels per drawing unit: a Bit stands about as tall as the pixel Bit did
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
  const k = W / cv.width, cam = s.cam;
  // world transform for props, particles and visitors (local yard coords plus the zone offset)
  const world = () => c.setTransform(k * cam.Z, 0, 0, k * cam.Z, (-cam.L + (s.zx || 0)) * cam.Z * k, (GROUND + cam.extra - GROUND * cam.Z) * k);
  if (cam && typeof ranchProps === 'function') { world(); ranchProps(c, s, t, false); if (s.visitor) ranchVisitor(c, s.visitor, t); }
  if (!s.hidden) {
    let u, x, y, ppu;
    if (cam) {                                     // the side-scrolling ranch: world camera with zoom, size in cm
      ppu = spec.cm / 100 * RANCH_PX_M / CHIBI.height(spec.stage, [], spec.family);
      u = k * cam.Z * ppu; x = (s.x + (s.zx || 0) - cam.L) * cam.Z * k; y = (GROUND + cam.extra - (s.jy || 0) * cam.Z) * k;
    } else { const room = RW - cv.width, camX = Math.round(clamp(s.camX || 0, 0, room)); ppu = CHIBI_UNIT; u = k * ppu; x = (s.x - camX) * k; y = (GROUND + (s.vExtra || 0) - (s.jy || 0)) * k; }
    const kx = typeof shapeOf === 'function' ? shapeOf(s.weight)[2] : 1;      // feeding still makes it thinner or rounder
    c.setTransform(u * kx, 0, 0, u, x - 100 * u * kx, y - 188 * u);
    CHIBI.draw(c, spec, RANCH_POSE[s.pose] || 'idle', t);
    const h = CHIBI.height(spec.stage, spec.marks, spec.family) * ppu, w = CHIBI.width(spec.stage, spec.family) * ppu * kx;   // tap box for petting
    s.bbox = [s.x - w / 2, GROUND - h, s.x + w / 2, GROUND];
  }
  if (cam && typeof ranchProps === 'function') { world(); ranchProps(c, s, t, true); ranchParticles(c, s); }
  return true;
}

/* ---------- battle ----------
   Both monsters draw on one layer over the arena, so an attack can cross it and land on the other side.
   The sprite canvases stay in place, hidden, as the anchors for each side's position and for the damage popups. */
/* te is the battle's own clock: it stops during hit stop and runs slow during a knockout, so every timeline,
   reaction and particle freezes or slows together. Real time (now) still drives the screen shake and the vibration. */
const CB = { side: [null, null], anim: null, loop: false, now: null, te: 0, last: 0, freezeUntil: 0, slowUntil: 0, trauma: 0, impact: null, parts: [] };
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
function tick(now) {
  const dt = Math.max(0, Math.min(50, now - (CB.last || now))); CB.last = now;
  CB.te += dt * (now < CB.freezeUntil ? 0 : now < CB.slowUntil ? 0.35 : 1);
  CB.trauma = Math.max(0, CB.trauma - dt / 1000 * 1.6);
  return dt;
}
const SIDE_ID = ['b-me-sprite', 'b-foe-sprite'];
const cbNow = () => CB.now != null ? CB.now : performance.now();
const eo = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3), ei = k => Math.pow(Math.min(1, Math.max(0, k)), 3);
const eb = k => { k = Math.min(1, Math.max(0, k)) - 1; return 1 + 2.70158 * k * k * k + 1.70158 * k * k; };   // overshoots, then settles
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
/* in battle the size difference shows but is squeezed, so a Bit facing a Mega looks small without becoming a speck */
const unitOf = (st, h) => { const px = h.size * Math.min(0.86, Math.max(0.4, 0.62 * Math.sqrt((st.spec.cm || 170) / 170)));
  return px / CHIBI.height(st.spec.stage, [], st.spec.family); };

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
      if (t < 580) { const a = 1 - eb((t - 480) / 100); return { f: 0.95, arc: top, pose: 'land', sx: 1 + 0.2 * a, sy: 1 - 0.18 * a }; }
      const k = eio((t - 580) / 300), a = 1 - eb((t - 580) / 170);
      return { f: 0.95 * (1 - k), arc: top * (1 - k) - Math.sin(k * Math.PI) * 50, pose: k < 0.85 ? 'jump' : 'idle', sx: 1 - 0.25 * a, sy: 1 + 0.35 * a }; },
    def(t) { if (t < 480 || t > 760) return null; const a = 1 - eb((t - 480) / 280); return { sx: 1 + 0.6 * a, sy: 1 - 0.75 * a }; },
    fx(c, t, x) { if (t > 480 && t < 700) dust(c, x.target, (t - 480) / 220); if (t > 480 && t < 960) stompStars(c, x.target, (t - 480) / 480); } },
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
  /* projectiles start where the move comes from: x.from is a list of points (eyes, mouth or hands) */
  bolt: { C: 560, D: 860,
    atk: t => ({ f: 0, pose: t < 220 ? (fromHands(t) ? 'slamup' : 'cast') : t < 640 ? 'push' : 'idle' }),
    fx(c, t, x) { const o = x.from[0], tg = x.target;
      if (t < 220) missile(c, o, x, t, 0.3 + t / 380);
      else if (t < 560) { const k = (t - 220) / 340; for (let i = 4; i >= 0; i--) { const kk = k - i * 0.05; if (kk > 0) missile(c, lerpP(o, tg, kk, 16), x, t, i ? 0.9 - i * 0.15 : 1, i ? 0.45 - i * 0.08 : 1); } } } },
  beam: { C: 380, D: 960,
    atk: t => ({ f: 0, pose: t < 200 ? 'cast' : t < 820 ? (x_src === 'eyes' ? 'idle' : 'push') : 'idle' }),
    fx(c, t, x) { if (t < 200) { x.from.forEach(o => missile(c, o, x, t, 0.2 + t / 450)); return; }
      if (t < 800) { const w = Math.min(1, (t - 200) / 90) * Math.min(1, (800 - t) / 140); x.from.forEach(o => { beamFx(c, x, t, w * (x.from.length > 1 ? 0.55 : 1), o); missile(c, o, x, t, 0.55 * w); }); } } },
  spear: { C: 520, D: 860,
    atk: t => ({ f: 0, pose: t < 200 ? 'slamup' : t < 640 ? 'push' : 'idle' }),
    fx(c, t, x) { for (let i = 0; i < 3; i++) { const o = x.from[i % x.from.length], k = (t - 200 - i * 70) / 320;
        if (t < 200 + i * 70) spearFx(c, x, { x: o.x, y: o.y - 6 - i * 4, ang: Math.atan2(x.target.y - o.y, x.target.x - o.x) }, i, Math.min(1, t / 180));
        else if (k <= 1) spearFx(c, x, lerpP(o, x.target, k, 10, (i - 1) * 10), i, 1); } } },
  volley: { C: 560, D: 980,
    atk: t => ({ f: 0, pose: t < 160 ? 'cast' : t < 760 ? 'push' : 'idle' }),
    fx(c, t, x) { for (let i = 0; i < 6; i++) { const k = (t - 160 - i * 60) / 400; if (k > 0 && k <= 1) bit(c, x, lerpP(x.from[i % x.from.length], x.target, k, 30 + (i % 3) * 22, (i % 2 ? 1 : -1) * 10 * (i % 3)), t, i); } } },
  shadowclaw: { C: 520, D: 920,
    atk: t => ({ f: 0, pose: t < 200 ? 'swipeup' : t < 620 ? 'swipedown' : 'idle' }),
    fx(c, t, x) { const k = (t - 220) / 300; if (k > 0 && k <= 1) crescents(c, lerpP(x.from[0], x.target, k, 12), x, k);
      if (t > 500 && t < 880) slash(c, x.target, (t - 500) / 380, [70, 30, 120], 1.4); } },
  lightning: { C: 420, D: 880,
    atk: t => ({ f: 0, pose: t < 700 ? 'slamup' : 'idle' }),
    fx(c, t, x) { if (t < 300) { psyAura(c, x.self, t, 0.7, 0, [255, 226, 90]); x.from.forEach(o => { c.save(); c.strokeStyle = '#fff6a0'; c.lineWidth = 2;
        for (let i = 0; i < 3; i++) { const a = t / 40 + i * 2; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x + Math.cos(a) * 10, o.y + Math.sin(a) * 10 - 4); c.stroke(); } c.restore(); }); return; }
      const sx = { bolts: CB.boltCache = t < 320 ? {} : CB.boltCache || {} };
      for (const t0 of [300, 520]) if (t >= t0 && t < t0 + 260) { const fl = lightningFx(c, x.target, t - t0, sx), big = CB.lastHit && CB.lastHit.tier === 'heavy' && CB.te - CB.lastHit.te < 500; if (fl && big) CB.screenFlash = fl; } } },
  pillar: { C: 520, D: 1040,
    atk: t => ({ f: 0, pose: t < 220 ? 'slamup' : t < 860 ? 'slam' : 'idle' }),
    fx(c, t, x) { if (t > 220 && t < 520) crack(c, x.self, x.target, (t - 220) / 300, x.col); if (t >= 460 && t < 980) pillarFx(c, x, Math.min(1, (t - 460) / 90) * Math.min(1, (980 - t) / 160), t); } },
  /* rock attacks: slam the ground and send the earth across */
  rockpath: { C: 600, D: 1100,
    atk: t => ({ f: 0, pose: t < 240 ? 'slamup' : t < 900 ? 'slam' : 'idle' }),
    def: t => t > 600 && t < 760 ? { lift: -18 * Math.sin((t - 600) / 160 * Math.PI) } : null,
    fx(c, t, x) { if (t > 240) rockSpikes(c, x.self, x.target, (t - 240) / 360, t); } },
  boulder: { C: 760, D: 1150,
    atk: t => ({ f: 0, pose: t < 220 ? 'slamup' : t < 440 ? 'slam' : t < 560 ? 'punchwind' : t < 760 ? 'punch' : 'idle' }),
    fx(c, t, x) { const front = lerpP(x.self, x.target, 0.18);
      if (t > 220 && t < 560) boulderFx(c, { x: front.x, y: front.y - 30 * eo((t - 220) / 200) + 12 }, t, 0.6 + 0.4 * eo((t - 220) / 200));
      else if (t >= 560 && t < 760) { const k = (t - 560) / 200; boulderFx(c, lerpP({ x: front.x, y: front.y - 18 }, x.target, ei(k), 40), t * 3, 1); } } },
  cast: { C: 320, D: 620,
    atk: t => ({ f: 0, pose: t < 480 ? 'cast' : 'idle' }),
    fx(c, t, x) { if (t < 480) psyAura(c, x.self, t, 0.6, 0, x.col); } }
};
/* which attack a move plays: by its name first, then by what the body can do */
let x_src = 'hands';
const fromHands = () => x_src === 'hands';
const PROJECTILE = [[/Solar Beam|Prism Ray|Holy Ray|Hypno Ray/, 'beam'], [/Zap|Bolt Strike/, 'lightning'], [/Flame Pillar|Absolute Zero/, 'pillar'],
  [/Ice Shard|Frost Nip/, 'spear'], [/Stone Edge|Quake/, 'rockpath'], [/Rock Slam|Landslide/, 'boulder'],
  [/Seed Volley|Leaf Storm|Heart Burst|Starfall|Bitstorm/, 'volley'], [/Night Claw/, 'shadowclaw']];
/* where a projectile leaves the body: rays from the eyes, breath and spit from the mouth, thrown things from the hands */
function sourceFor(e, spec) {
  const n = e.name || '', arms = !['Squib', 'Skit'].includes(spec.family) && spec.stage !== 'Bit';
  if (/Hypno|Prism|Holy|Glint|Abyss|Gaze/.test(n)) return 'eyes';
  if (/Solar|Flare|Fire|Flame|Toxic|Acid|Spit|Seed|Ember|Breath/.test(n)) return 'mouth';
  return arms ? 'hands' : 'mouth';
}
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
  CB.anim = { who: e.who, kind, t0: CB.te, el: e.el, name: e.name, src: sourceFor(e, st.spec), col: e.el ? hexRgb(typeof ELC === 'function' ? ELC(e.el) : '#a070ff') : [255, 214, 90] };
  sfx(['bolt', 'beam', 'spear', 'volley', 'lightning', 'pillar', 'shadowclaw', 'lift', 'push'].includes(kind) ? 'charge' : 'whoosh');
  return new Promise(r => setTimeout(r, A.C));
}
const hexRgb = h => /^#[0-9a-f]{6}$/i.test(h) ? [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)) : [170, 110, 255];
/* a hit lands: everything here fires within the same instant, scaled by how hard it was */
const TIER = {
  light:  { stop: 30,  trauma: 0.1,  push: 0.04, sparks: 4,  flash: 45 },
  medium: { stop: 55,  trauma: 0.22, push: 0.07, sparks: 7,  flash: 55 },
  heavy:  { stop: 100, trauma: 0.75, push: 0.15, sparks: 22, flash: 100, white: 1, impact: 1 }   // crits and super-effective hits only
};
function chibiHit(e) {
  const st = CB.side[e.who]; if (!st) return;
  const tier = e.dot ? 'light' : e.crit || e.eff > 1 ? 'heavy' : e.dmg >= 30 ? 'medium' : 'light', T = TIER[tier], now = cbNow();
  st.react = { kind: 'hit', t0: CB.te, tier }; CB.lastHit = { tier, te: CB.te };
  if (!e.dot) { CB.freezeUntil = Math.max(CB.freezeUntil, now + T.stop); CB.vibrate = { who: e.who, until: now + T.stop + 60 }; }
  CB.trauma = Math.min(1, CB.trauma + T.trauma * (REDUCED ? 0.35 : 1));
  if (T.impact && !REDUCED) CB.impact = { who: e.who, until: now + 70 };
  const A = CB.anim; if (A && A.who !== e.who && /^(tackle|bite|stomp|punch|claw)$/.test(A.kind) && CB.side[A.who]) CB.side[A.who].recoil = { t0: CB.te, amt: tier === 'heavy' ? 0.06 : 0.035 };
  CB.spark = { who: e.who, n: T.sparks, col: CB.anim && CB.anim.who !== e.who ? CB.anim.col : [255, 236, 160], fresh: true };
  sfx(tier === 'heavy' ? 'heavy' : tier === 'medium' ? 'hit' : 'tap');
}
function chibiBump(who, cls) {
  const st = CB.side[who]; if (!st) return;
  if (cls === 'bhit') { if (!st.react || CB.te - st.react.t0 > 30) st.react = { kind: 'hit', t0: CB.te, tier: 'light' }; }
  if (cls === 'miss') { st.react = { kind: 'dodge', t0: CB.te }; sfx('whoosh'); }
  if (cls === 'bguard') st.hold = { pose: 'guard', until: CB.te + 550 };
  if (cls === 'bcast' && !(CB.anim && CB.anim.who === who)) st.hold = { pose: 'cast', until: CB.te + 500 };
  if (cls === 'ability') { st.hold = { pose: 'cast', until: CB.te + 450 }; st.aura = CB.te; }
}
function chibiPose(who, pose, ms) {
  const st = CB.side[who]; if (!st) return;
  if (pose === 'ko') { st.ko = CB.te; CB.slowUntil = cbNow() + 650; CB.trauma = Math.min(1, CB.trauma + (REDUCED ? 0.2 : 0.6)); sfx('ko'); return; }
  st.hold = { pose, until: ms ? CB.te + ms : Infinity };
}
/* hit sounds built on the game's own synth, so they follow the music on/off switch */
let SFXBUS = null;
function sfx(kind) {
  try {
    if (typeof AC === 'undefined' || !AC || typeof MUS === 'undefined' || !MUS.on || !MUS.nb || CB.now != null) return;
    if (!SFXBUS) { SFXBUS = AC.createGain(); SFXBUS.gain.value = 0.55; SFXBUS.connect(AC.destination); }
    const t = AC.currentTime + 0.005, d = SFXBUS;
    if (kind === 'tap') { dKick(d, t, 0.35); dNoise(d, t, 0.05, 0.2, 'bandpass', 2400, 1.4); }
    if (kind === 'hit') { dKick(d, t, 0.7); dNoise(d, t, 0.09, 0.35, 'bandpass', 1600, 1); }
    if (kind === 'heavy') { dKick(d, t, 1); dKick(d, t + 0.03, 0.6); dNoise(d, t, 0.22, 0.5, 'lowpass', 900); dNoise(d, t, 0.06, 0.4, 'highpass', 4000); }
    if (kind === 'ko') { dKick(d, t, 1); dNoise(d, t, 0.5, 0.45, 'lowpass', 500); }
    if (kind === 'whoosh') dNoise(d, t, 0.16, 0.18, 'bandpass', 900, 0.7);
    if (kind === 'charge') { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.22);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26); o.connect(g); g.connect(d); o.start(t); o.stop(t + 0.28); }
  } catch (err) {}
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
/* little stars that spin up off a stomped enemy and fade */
function stompStars(c, p, k) {
  for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.6, d = 10 + 34 * eo(k), x = p.x + Math.cos(a) * d, y = p.y - 26 + Math.sin(a) * d;
    c.save(); c.globalAlpha = k < 0.45 ? 1 : 1 - (k - 0.45) / 0.55; c.translate(x, y); c.rotate(k * Math.PI * 2 + i);
    c.fillStyle = '#ffd94a'; c.strokeStyle = '#7a4a10'; c.lineWidth = 1.5; c.beginPath();
    for (let j = 0; j < 10; j++) { const r = j % 2 ? 3.2 : 7.5, b = j * Math.PI / 5 - Math.PI / 2; c[j ? 'lineTo' : 'moveTo'](Math.cos(b) * r, Math.sin(b) * r); }
    c.closePath(); c.fill(); c.stroke(); c.restore(); }
}
/* soft dust and smoke puffs: dash start, skid stop, faint. Ages run on the battle clock, so they hold during hitstop */
function spawnPuff(x, y, n, dir, spread, speed, size, col, life) {
  CB.puffs = CB.puffs || [];
  for (let i = 0; i < n; i++) { const a = dir == null ? Math.random() * Math.PI * 2 : dir + (Math.random() - 0.5) * spread, v = speed * (0.5 + Math.random() * 0.5);
    CB.puffs.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (dir == null ? 0.02 : 0.015), t0: CB.te, life: life * (0.8 + Math.random() * 0.4), r: size * (0.6 + Math.random() * 0.4), col }); }
}
function drawPuffs(c) {
  if (!CB.puffs) return; const te = CB.te;
  CB.puffs = CB.puffs.filter(q => te - q.t0 < q.life);
  for (const q of CB.puffs) { const k = (te - q.t0) / q.life, d = eo(k) * q.life;
    c.globalAlpha = 0.75 * (1 - k); c.fillStyle = q.col; c.beginPath(); c.arc(q.x + q.vx * d, q.y + q.vy * d, q.r * (0.6 + 0.8 * k), 0, 7); c.fill(); }
  c.globalAlpha = 1;
}
/* streaks behind a fast move, pointing back the way it came */
function speedLines(c, p, dir, s, seed) {
  const bx = -Math.cos(dir), by = -Math.sin(dir), px = -by, py = bx;
  c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const o = ((i * 37 + seed) % 11 - 5) * 5, back = 18 + (i * 13 + seed) % 14, len = (22 + (i * 7) % 18) * Math.min(1, s * 3);
    const x0 = p.x + px * o + bx * back, y0 = p.y + py * o + by * back;
    c.globalAlpha = Math.min(1, s * 2.4) * (0.5 + (i % 2) * 0.4); c.lineWidth = 1.5 + (i % 3);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + bx * len, y0 + by * len); c.stroke(); }
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
  if (el === 'Blaze') { const gr = c.createRadialGradient(0, 0, 1, 0, 0, 19); gr.addColorStop(0, '#fff6b0'); gr.addColorStop(0.45, '#ffb030'); gr.addColorStop(1, 'rgba(230,60,30,0)');
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, 19 + Math.sin(t / 40) * 2.5, 0, 7); c.fill(); }
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
function beamFx(c, x, t, w, a) {
  const b = x.target, prism = /Prism/.test(x.name), hypno = /Hypno/.test(x.name), col = /Solar/.test(x.name) ? [200, 240, 90] : x.col;
  c.save(); c.lineCap = 'round'; c.shadowColor = rgbS(col, 0.9); c.shadowBlur = 20;
  if (prism) { const gr = c.createLinearGradient(a.x, a.y, b.x, b.y); ['#ff5a5a', '#ffb347', '#ffe14a', '#5ad16a', '#4aa8ff', '#a070ff'].forEach((h, i) => gr.addColorStop(i / 5, h)); c.strokeStyle = gr; }
  else c.strokeStyle = rgbS(col, 0.85);
  c.lineWidth = 16 * w + Math.sin(t / 30) * 2 * w; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  c.shadowBlur = 0; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 5 * w; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  if (hypno) for (let i = 0; i < 4; i++) { const k = ((t / 300) + i / 4) % 1, p = lerpP(a, b, k); c.strokeStyle = `rgba(255,140,210,${1 - k * 0.5})`; c.lineWidth = 2.5; c.beginPath(); c.arc(p.x, p.y, 8 + k * 6, 0, 7); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(b.x, b.y, 10 * w + Math.sin(t / 25) * 3, 0, 7); c.fill();
  c.restore();
}
function spearFx(c, x, p, i, sc = 1) {
  c.save(); c.translate(p.x, p.y); c.rotate(p.ang); c.scale(sc, sc); const rock = x.el === 'Stone';
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
/* lightning the hand-drawn way (lightning-vfx skill): a jagged line, keep only the strongest corners and push them out,
   thick at the bends and thin between, sparks off the corners, a broad soft glow, a narrower bright glow, a white core last.
   One strike is 5 frames at 20 fps: thickest and brightest first, then thinner, then broken apart and fading. */
function boltShape(a, b, seed) {
  let r = seed; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  let pts = [a, b];
  for (let d = 0; d < 5; d++) { const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) { const p = pts[i], q = pts[i + 1], L = Math.hypot(q.x - p.x, q.y - p.y), g = (rnd() + rnd() + rnd() - 1.5) * 0.65;
      out.push({ x: (p.x + q.x) / 2 - (q.y - p.y) / L * g * L * 0.32, y: (p.y + q.y) / 2 + (q.x - p.x) / L * g * L * 0.32 }, q); }
    pts = out; }
  const turn = i => { const u = [pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y], v = [pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y]; return Math.abs(Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1])); };
  const idx = pts.slice(1, -1).map((p, i) => [turn(i + 1), i + 1]).sort((x, y) => y[0] - x[0]).slice(0, 7).map(z => z[1]).sort((x, y) => x - y);
  let k = [pts[0], ...idx.map(i => pts[i]), pts[pts.length - 1]];
  k = k.map((p, i) => i === 0 || i === k.length - 1 ? p : { x: (k[i - 1].x + k[i + 1].x) / 2 + (p.x - (k[i - 1].x + k[i + 1].x) / 2) * 1.6, y: p.y });
  for (let i = 1; i < k.length; i++) if (k[i].y < k[i - 1].y + 4) k[i].y = k[i - 1].y + 4;     // always moving down the strike
  const sparks = [2, 4, 6].filter(i => i < k.length - 1).map(i => { const sd = rnd() < 0.5 ? -1 : 1; return [k[i], { x: k[i].x + sd * (14 + rnd() * 10), y: k[i].y + 6 + rnd() * 8 }]; });
  return { k, sparks };
}
function strokeBolt(c, B, w, col, keep) {
  c.strokeStyle = col; c.lineCap = 'round';
  for (let i = 0; i < B.k.length - 1; i++) { if (keep && !keep[i]) continue;
    const p = B.k[i], q = B.k[i + 1], taper = 1 - i / B.k.length * 0.7;
    c.lineWidth = w * taper * 1.35; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo((p.x + q.x) / 2, (p.y + q.y) / 2); c.stroke();      // thick near the bend
    c.lineWidth = w * taper * 0.75; c.beginPath(); c.moveTo((p.x + q.x) / 2, (p.y + q.y) / 2); c.lineTo(q.x, q.y); c.stroke(); }   // thin between bends
  for (const [a, b] of B.sparks) { c.lineWidth = w * 0.45; c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo((a.x + b.x) / 2, a.y, b.x, b.y); c.stroke(); }
}
function lightningFx(c, p, t, x) {
  const f = Math.floor(t / 50); if (f > 4) return 0;
  const plan = [[0, 1, 1.25], [1, 0.9, 1], [0, 0.7, 0.75], [2, 0.5, 0.6], [2, 0.25, 0.45]][f];
  x.bolts = x.bolts || {};
  const key = plan[0]; if (!x.bolts[key]) x.bolts[key] = boltShape({ x: p.x + 12, y: -10 }, { x: p.x, y: p.y + 6 }, 17 + key * 31 + Math.floor(p.x));
  const B = x.bolts[key], strength = plan[1], w = 7 * plan[2], keep = f >= 3 ? B.k.map((_, i) => (i * 7 + f) % 3 !== 0) : null;
  c.save(); c.globalAlpha = strength;
  c.shadowColor = 'rgba(255,200,60,.9)'; c.shadowBlur = 26; strokeBolt(c, B, w * 3.2, 'rgba(184,134,11,.45)', keep);        // broad soft glow
  c.shadowBlur = 10; strokeBolt(c, B, w * 1.7, 'rgba(255,224,74,.9)', keep);                                             // narrower bright glow
  c.shadowBlur = 0; strokeBolt(c, B, w * 0.6, '#ffffff', keep);                                                           // white core last
  c.restore();
  return [0.6, 0.25, 0, 0, 0][f];        // how strongly the screen flashes on this frame
}
function groundRing(c, p, k, col) { c.save(); c.strokeStyle = rgbS(col, 0.8 * (1 - k * 0.3)); c.lineWidth = 3; c.beginPath(); c.ellipse(p.x, p.foot - 2, 18 + k * 18, 6 + k * 6, 0, 0, 7); c.stroke(); c.restore(); }
function pillarFx(c, x, w, t) {
  const p = x.target, ice = x.el === 'Frost', H = 130 * Math.min(1, w * 1.4);
  c.save();
  if (ice) { for (let i = -2; i <= 2; i++) { const h = (40 + (2 - Math.abs(i)) * 22) * w, bx = p.x + i * 13;
      c.fillStyle = i % 2 ? 'rgba(190,232,255,.95)' : 'rgba(150,210,250,.95)'; c.beginPath(); c.moveTo(bx - 8, p.foot); c.lineTo(bx, p.foot - h); c.lineTo(bx + 8, p.foot); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.moveTo(bx - 2, p.foot - 4); c.lineTo(bx, p.foot - h + 6); c.lineTo(bx + 1, p.foot - 4); c.closePath(); c.fill(); } }
  else { const gr = c.createLinearGradient(0, p.foot, 0, p.foot - H); gr.addColorStop(0, 'rgba(230,60,30,.95)'); gr.addColorStop(0.5, 'rgba(255,150,40,.9)'); gr.addColorStop(1, 'rgba(255,230,120,0)');
    c.fillStyle = gr; for (let i = -2; i <= 2; i++) { const wd = 50 - Math.abs(i) * 9, fl = Math.sin(t / 50 + i * 2) * 5, xo = i * 19; c.beginPath(); c.moveTo(p.x + xo - wd / 2, p.foot);
      c.quadraticCurveTo(p.x + xo - wd / 2 + fl, p.foot - H * 0.6, p.x + i * 13 + fl, p.foot - H * (1 - Math.abs(i) * 0.2)); c.quadraticCurveTo(p.x + xo + wd / 2 - fl, p.foot - H * 0.6, p.x + xo + wd / 2, p.foot); c.fill(); }
    c.fillStyle = 'rgba(255,90,30,.35)'; c.beginPath(); c.ellipse(p.x, p.foot, 62 * w, 12 * w, 0, 0, 7); c.fill(); }
  c.restore();
}

/* a crack runs along the ground from the attacker's feet to the enemy's */
function crack(c, a, b, k, col) {
  const n = 9, A = { x: a.x, y: a.foot }, B = { x: b.x, y: b.foot };
  c.save(); c.strokeStyle = 'rgba(70,40,20,.85)'; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath();
  for (let i = 0; i <= n * Math.min(1, k); i++) { const p = lerpP(A, B, i / n); i ? c.lineTo(p.x + (i % 2 ? 4 : -4), p.y + (i % 2 ? 2 : -1)) : c.moveTo(p.x, p.y); } c.stroke();
  const tip = lerpP(A, B, Math.min(1, k)); c.fillStyle = rgbS(col, 0.6); c.beginPath(); c.ellipse(tip.x, tip.y, 10, 4, 0, 0, 7); c.fill(); c.restore();
}
/* rock spikes burst up one after another along the ground, the last and biggest under the enemy */
function rockSpikes(c, a, b, k, t) {
  const n = 7, A = { x: a.x, y: a.foot }, B = { x: b.x, y: b.foot };
  c.save();
  for (let i = 1; i <= n; i++) { const born = (i - 1) / n, age = (k - born) * 3.2; if (age <= 0) continue;
    const p = lerpP(A, B, i / n), big = i === n ? 1.9 : 0.7 + i * 0.08, rise = Math.min(1, age) * (age > 2.2 ? Math.max(0, 1 - (age - 2.2)) : 1), h = 26 * big * eo(rise), w = 11 * big;
    if (h < 1) continue;
    c.fillStyle = 'rgb(122,92,66)'; c.beginPath(); c.moveTo(p.x - w, p.y + 2); c.lineTo(p.x - w * 0.2, p.y - h); c.lineTo(p.x + w * 0.35, p.y - h * 0.75); c.lineTo(p.x + w, p.y + 2); c.closePath(); c.fill();
    c.fillStyle = 'rgb(168,132,96)'; c.beginPath(); c.moveTo(p.x - w * 0.55, p.y); c.lineTo(p.x - w * 0.2, p.y - h); c.lineTo(p.x, p.y - h * 0.4); c.closePath(); c.fill();
    if (age < 0.5) { c.fillStyle = 'rgba(200,170,130,.7)'; for (let d = 0; d < 3; d++) { c.beginPath(); c.arc(p.x + (d - 1) * 9, p.y - age * 30 - d * 4, 3, 0, 7); c.fill(); } } }
  c.restore();
}
function boulderFx(c, p, t, sc) {
  c.save(); c.translate(p.x, p.y); c.rotate(t / 160); c.scale(sc, sc);
  c.fillStyle = 'rgb(108,82,60)'; c.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, r = 17 + (i % 3) * 2.5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r + 2); } c.closePath(); c.fill();
  c.fillStyle = 'rgb(150,118,88)'; c.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, r = 16 + (i % 3) * 2.5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(-5, -7, 6, 3, -0.5, 0, 7); c.fill();
  c.restore();
}
/* sparks fly away from the attacker in a cone and fall; they live on the battle clock, so they freeze in hit stop */
function spawnSparks(p, dir, n, col) {
  for (let i = 0; i < n; i++) { const a = dir + (Math.random() - 0.5) * 1.7, v = 0.18 + Math.random() * 0.32;
    CB.parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.12, born: CB.te, life: 260 + Math.random() * 260, col: i % 3 ? col : [255, 255, 255], w: 2 + Math.random() * 2.5 }); }
}
function drawSparks(c, dt) {
  CB.parts = CB.parts.filter(q => CB.te - q.born < q.life);
  for (const q of CB.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 0.0009 * dt; const k = (CB.te - q.born) / q.life;
    c.strokeStyle = rgbS(q.col, 1 - k); c.lineWidth = q.w * (1 - k * 0.5); c.lineCap = 'round';
    c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - q.vx * 26, q.y - q.vy * 26); c.stroke(); }
}
/* origin points for the attack in progress */
function originOf(p, src, tgt) {
  if (!p) return [];
  // seen from behind, the face is on the far side: start just past the body's edge, toward the enemy
  const past = () => { const dx = tgt.x - p.top.x, dy = tgt.y - p.top.y, L = Math.hypot(dx, dy) || 1; return { x: p.top.x + dx / L * p.r, y: p.top.y + dy / L * p.r }; };
  if (src === 'eyes') return p.back || !p.eyes ? [past()] : p.eyes;
  if (src === 'mouth') return [p.back || !p.mouth ? past() : p.mouth];
  return p.hands && p.hands.length ? p.hands : [p.back || !p.mouth ? past() : p.mouth];
}

/* ---------- one frame ---------- */
function sideState(who, te, pos) {
  const st = CB.side[who], A = CB.anim, out = { f: 0, arc: 0, lift: 0, rot: 0, sx: 1, sy: 1, pose: 'idle', flash: 0, shake: 0, off: [0, 0], alpha: 1 };
  if (A) { const t = te - A.t0, K = ANIM[A.kind]; x_src = A.src;
    if (t > K.D) CB.anim = null;
    else if (A.who === who) Object.assign(out, K.atk(t, pos));
    else if (K.def) { const d = K.def(t, pos); if (d) Object.assign(out, d); } }
  if (st.hold) { if (te > st.hold.until) st.hold = null; else out.pose = st.hold.pose; }
  if (st.recoil) { const k = (te - st.recoil.t0) / 170; if (k > 1) st.recoil = null; else out.f -= st.recoil.amt * Math.sin(k * Math.PI); }
  const R = st.react;
  if (R) { const dur = R.kind === 'hit' ? (R.tier === 'heavy' ? 560 : 420) : 380, k = (te - R.t0) / dur;
    if (k > 1) st.react = null;
    else if (R.kind === 'hit') { const T = TIER[R.tier || 'light'];
      out.pose = 'hit'; const dt = te - R.t0; out.flash = T.white ? (dt < 18 ? 2 : dt < T.flash ? 1 : 0) : dt < T.flash ? 3 : 0;
      out.f += -T.push * (k < 0.25 ? eo(k / 0.25) : 1 - eio((k - 0.25) / 0.75)); out.rot += -0.12 * (R.tier === 'heavy' ? 1.6 : 1) * Math.sin(Math.min(1, k * 1.5) * Math.PI) * (who ? -1 : 1); }
    else { const s2 = Math.sin(k * Math.PI); out.pose = 'dodge'; out.off = [pos.perp[0] * 30 * s2, pos.perp[1] * 30 * s2 - 10 * s2]; } }
  if (st.ko != null) { out.pose = 'ko'; const k = (te - st.ko - 420) / 160;
    if (k > 0) { out.sx *= 1 + 0.4 * eo(k); out.sy *= 1 + 0.4 * eo(k); out.alpha = Math.max(0, 1 - k); } }
  return out;
}
function chibiBattleLoop() {
  const bat = document.getElementById('battle');
  if (!CB.side[0] && !CB.side[1] || !bat || bat.style.display === 'none') { CB.loop = false; const ar = document.getElementById('arena'); if (ar) ar.style.transform = ''; return; }
  chibiBattleFrame(cbNow());
  requestAnimationFrame(chibiBattleLoop);
}
function chibiBattleFrame(now) {
  tick(now); const te = CB.te, dte = CB.prevTe == null ? 0 : Math.max(0, te - CB.prevTe); CB.prevTe = te;
  const o = arenaLayer(), r = o.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  if (o.width !== W) o.width = W; if (o.height !== H) o.height = H;
  const c = o.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  // screen shake: trauma squared, smooth sines, never random per frame
  const ar = document.getElementById('arena'), sh = CB.trauma * CB.trauma;
  if (ar) ar.style.transform = sh > 0.001 ? `translate(${(10 * sh * Math.sin(now / 27)).toFixed(2)}px,${(7 * sh * Math.sin(now / 19 + 1)).toFixed(2)}px) rotate(${(1.4 * sh * Math.sin(now / 33)).toFixed(3)}deg)` : '';
  const homes = [home(0), home(1)], placed = [], imp = CB.impact && now < CB.impact.until ? CB.impact : null;
  if (typeof chibiArenaScene === 'function') chibiArenaScene(now, homes);
  if (imp) {                                   // impact frame: the arena goes dark with speed lines, the one hit turns white
    c.save(); c.scale(dpr, dpr); c.fillStyle = 'rgba(16,8,28,.88)'; c.fillRect(0, 0, r.width, r.height);
    const h = homes[imp.who]; c.strokeStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r0 = 40 + (i % 3) * 14; c.lineWidth = 1.5 + (i % 4);
      c.beginPath(); c.moveTo(h.x + Math.cos(a) * r0, h.y - 40 + Math.sin(a) * r0); c.lineTo(h.x + Math.cos(a) * 400, h.y - 40 + Math.sin(a) * 400); c.stroke(); }
    c.restore();
  }
  for (const who of [1, 0]) {                        // the far side first, so the near side draws over it
    const st = CB.side[who]; if (!st) continue;
    const h = homes[who], o2 = homes[1 - who], V = [o2.x - h.x, o2.y - h.y], L = Math.hypot(V[0], V[1]) || 1;
    const u = unitOf(st, h), other = CB.side[1 - who];
    const foeH = other ? CHIBI.height(other.spec.stage, other.spec.marks, other.spec.family) * unitOf(other, o2) : 60;
    const S = sideState(who, te, { foeH, perp: [-V[1] / L, V[0] / L] });
    if (S.pose !== st.shown) { st.from = st.shown; st.shown = S.pose; st.t0 = te; }
    const k = (te - st.t0) / 110, P = k >= 0 && k < 1 && CHIBI.POSES.includes(st.from) ? CHIBI.blend(st.from, S.pose, k) : S.pose;
    const vib = CB.vibrate && CB.vibrate.who === who && now < CB.vibrate.until ? Math.sin(now / 9) * 4 : 0;     // the target shakes while time is stopped
    const x = h.x + V[0] * S.f + S.shake + S.off[0] + vib, y = h.y + V[1] * S.f + S.arc + S.lift + S.off[1], mir = who === 1 ? -1 : 1;
    const put = (alpha, filter, cap) => { c.save(); c.scale(dpr, dpr); c.globalAlpha = alpha; if (filter) c.filter = filter;
      c.translate(x, y);
      if (st.str > 0.01) { const a = st.dir || 0; c.translate(0, -bodyMid); c.rotate(a); c.scale(1 + st.str, 1 - st.str * 0.5); c.rotate(-a); c.translate(0, bodyMid); }
      c.rotate(S.rot); c.scale(mir * u * S.sx, u * S.sy); c.translate(-100, -188);
      CHIBI.draw(c, cap ? { ...st.spec, capture: (st.cap = {}) } : st.spec, P, te, [0.6, who === 0 ? -0.5 : 0.5]); c.restore(); };
    // afterimages behind a fast move
    st.trail = st.trail || []; const last = st.trail[st.trail.length - 1], speed = last ? Math.hypot(x - last.x, y - last.y) : 0;
    st.trail.push({ x, y }); if (st.trail.length > 10) st.trail.shift();
    if (dte > 0) {                                   // stretch along the move while it's fast, hold it through hitstop
      const v = speed / dte, want = REDUCED ? 0 : Math.min(0.42, Math.max(0, (v - 0.45) * 0.45));
      if (last && speed > 0.5) st.dir = Math.atan2(y - last.y, x - last.x);
      st.str = (st.str || 0) * 0.55 + want * 0.45;
      const moving = want > 0.08;
      if (moving !== !!st.moving && st.ko == null) spawnPuff(x, y - 2, moving ? 7 : 9, (st.dir || 0) + Math.PI, 1.2, moving ? 0.09 : 0.12, 6 * u / 0.9, 'rgba(235,228,214,1)', 340);
      st.moving = moving; }
    if (st.ko != null && te - st.ko > 420 && !st.koPuff) { st.koPuff = true; spawnPuff(x, y - CHIBI.height(st.spec.stage, st.spec.marks, st.spec.family) * u * 0.4, 16, null, 0, 0.11, 11 * u / 0.9, 'rgba(240,236,250,1)', 520); sfx('whoosh'); }
    if (st.ko == null) st.koPuff = false;
    const bodyMid = CHIBI.height(st.spec.stage, st.spec.marks, st.spec.family) * u * 0.45;
    if (st.str > 0.12 && !REDUCED && !imp) { c.save(); c.scale(dpr, dpr); speedLines(c, { x, y: y - bodyMid }, st.dir || 0, st.str, Math.floor(te / 40) % 7); c.restore(); }
    if (speed > 5 && st.trail.length > 6 && !imp) for (const [i, a] of [[st.trail.length - 7, 0.14], [st.trail.length - 4, 0.24]]) {
      const g = st.trail[i]; c.save(); c.translate((g.x - x) * dpr, (g.y - y) * dpr); put(a * S.alpha, 'saturate(0.4) brightness(1.4)', false); c.restore(); }
    const white = imp && imp.who === who;
    put(S.alpha, white || S.flash === 2 ? 'brightness(0) invert(1)' : S.flash === 1 ? 'brightness(1.5)' : S.flash === 3 ? 'brightness(1.18)' : '', true);
    const cp = st.cap || {}, d = q => q ? { x: q.x / dpr, y: q.y / dpr } : null;
    placed[who] = { x, y: y - CHIBI.height(st.spec.stage, st.spec.marks, st.spec.family) * u * 0.45, foot: y, lift: S.lift, back: !!st.spec.back, r: CHIBI.width(st.spec.stage, st.spec.family) * u * 0.55,
      eyes: cp.eyes && cp.eyes.map(d), mouth: d(cp.mouth), hands: (cp.hands || []).map(d), top: d(cp.top) || { x, y: y - 50 }, center: d(cp.center) };
    if (st.aura != null && te - st.aura < 500) { c.save(); c.scale(dpr, dpr); psyAura(c, placed[who], te, 1 - (te - st.aura) / 500, 0, [255, 214, 90]); c.restore(); }
  }
  c.save(); c.scale(dpr, dpr);
  const A = CB.anim;
  if (A && ANIM[A.kind].fx && placed[A.who]) { const T0 = placed[1 - A.who] || { x: homes[1 - A.who].x, y: homes[1 - A.who].y - 40, foot: homes[1 - A.who].y };
    const tgt = { ...T0, x: T0.center ? T0.center.x : T0.x, y: T0.center ? T0.center.y : T0.y };
    ANIM[A.kind].fx(c, te - A.t0, { self: placed[A.who], target: tgt, targetLift: tgt.lift || 0, col: A.col || [255, 214, 90], el: A.el, name: A.name || '', from: originOf(placed[A.who], A.src, tgt) }); }
  if (CB.spark && CB.spark.fresh && placed[CB.spark.who]) { const p = placed[CB.spark.who], src = placed[1 - CB.spark.who] || homes[1 - CB.spark.who];
    const c0 = p.center || p; spawnSparks(c0, Math.atan2(c0.y - src.y, c0.x - src.x), CB.spark.n, CB.spark.col); CB.spark.fresh = false; CB.burstAt = { who: CB.spark.who, t0: te, col: CB.spark.col }; }
  if (CB.burstAt && placed[CB.burstAt.who] && te - CB.burstAt.t0 < 260) { const p = placed[CB.burstAt.who]; burst(c, p.center || p, (te - CB.burstAt.t0) / 260, CB.burstAt.col); }
  drawSparks(c, dte); drawPuffs(c);
  if (CB.screenFlash > 0.01) {                       // lightning: the whole arena flashes white, then drops off fast
    c.fillStyle = `rgba(255,255,250,${(CB.screenFlash * (REDUCED ? 0.3 : 1)).toFixed(3)})`; c.fillRect(0, 0, r.width, r.height);
    CB.screenFlash *= dte > 0 ? Math.pow(0.5, dte / 40) : 1; }
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
  const k = W / cv.width, now = performance.now();
  for (const q of VQ.splice(0)) {
    const u = k * Math.min(50, Math.max(20, 36 * Math.sqrt((q.spec.cm || 170) / 170))) / CHIBI.height(q.spec.stage, [], q.spec.family);   // sized by height, squeezed like battle
    c.setTransform(u * (q.flip ? -1 : 1), 0, 0, u, q.cx * k - 100 * u * (q.flip ? -1 : 1), (q.base + 6) * (H / cv.height) - 188 * u);
    CHIBI.draw(c, q.spec, 'idle', now, [q.flip ? 0.5 : -0.5, 0]);
  }
}
