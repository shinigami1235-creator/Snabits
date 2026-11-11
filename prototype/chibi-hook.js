/* Puts the chibi drawings (chibi.js) into the ranch and battle screens while the pixel art stays the default.
   Turn it on with #art=chibi in the address, or localStorage "snabits-art" set to "chibi".
   Only families listed in CHIBI_FAMS are drawn smooth; the rest keep their pixels. */
const CHIBI_FAMS = ['Chomp'];
const CHIBI_ART = /(^#|&)art=chibi(&|$)/.test(location.hash) || (() => { try { return localStorage.getItem('snabits-art') === 'chibi'; } catch (e) { return false; } })();

/* m is a hatched monster or a fight snapshot; s is the ranch state when there is one */
function chibiSpec(m, s) {
  const src = s || m, fam = (s ? s.m : m).family;
  if (!CHIBI_ART || typeof CHIBI === 'undefined' || !CHIBI_FAMS.includes(fam)) return null;
  const stage = src.stage || 'Bit', marks = [];
  if (stage !== 'Bit' && src.mark != null && MARK[src.mark]) marks.push(MARK[src.mark][0]);
  if (stage === 'Mega' && src.mark2 != null && MARK[src.mark2]) marks.push(MARK[src.mark2][0]);
  return { stage, marks, pal: src.pal || (s ? s.m.pal : m.pal), el: (s ? s.m : m).el1, worn: src.worn || {} };
}

/* ranch: the scene canvas is 240 wide and stretched, so the monster draws on a full-resolution layer over it */
const RANCH_POSE = { idle: 'idle', walk: 'walk', run: 'walk', happy: 'happy', eat: 'eat', hurt: 'hurt', sleep: 'sleep',
  sad: 'hurt', dizzy: 'hurt', effort: 'attack', tired: 'idle', sit: 'idle', lean: 'idle', guard: 'idle', float: 'idle' };
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
  const h = CHIBI.height(spec.stage, spec.marks) * CHIBI_UNIT, w = CHIBI.STAGE[spec.stage].bw * CHIBI_UNIT;   // tap box for petting
  s.bbox = [s.x - w / 2, GROUND - h, s.x + w / 2, GROUND];
  return true;
}

/* battle: the sprite canvases are 132px boxes, so the drawing fills one at full resolution */
const CB = {};
function paintSprite(cv, m, s) {
  const spec = chibiSpec(m, s);
  if (!spec) { cv.style.imageRendering = ''; delete CB[cv.id]; paint(cv, m.grid, m.pal, 1); return; }
  CB[cv.id] = { spec, pose: 'idle' };
  cv.style.imageRendering = 'auto';
  chibiBattleFrame(cv.id, performance.now());
  if (!CB.loop) { CB.loop = true; requestAnimationFrame(chibiBattleLoop); }
}
function chibiBattleFrame(id, t) {
  const st = CB[id], cv = document.getElementById(id); if (!st || !cv) return;
  const dpr = devicePixelRatio || 1, S = Math.round(132 * dpr);
  if (cv.width !== S) { cv.width = S; cv.height = S; }
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, S, S);
  const fit = Math.min(1.25, 190 / (CHIBI.height(st.spec.stage, st.spec.marks) + 30)), u = S / 228 * fit;   // small stages draw bigger in the box
  c.setTransform(u, 0, 0, u, S / 2 - 100 * u, S - 8 * dpr - 188 * u);
  CHIBI.draw(c, st.spec, st.pose, t);
}
function chibiBattleLoop(t) {
  const live = ['b-me-sprite', 'b-foe-sprite'].filter(id => CB[id]);
  if (!live.length || document.getElementById('battle').style.display === 'none') { CB.loop = false; return; }
  live.forEach(id => chibiBattleFrame(id, t)); requestAnimationFrame(chibiBattleLoop);
}
/* bump and knockout show a pose for a moment; a knockout keeps its pose */
function chibiPose(who, pose, ms) {
  const id = who === 0 ? 'b-me-sprite' : 'b-foe-sprite', st = CB[id]; if (!st) return;
  st.pose = pose; clearTimeout(st.timer); if (ms) st.timer = setTimeout(() => { if (st.pose === pose) st.pose = 'idle'; }, ms);
}
