/* More to the expeditions (Gid, 17 Nov 2026). A region keeps its layout, journal page and stone, while its chests, springs,
   wild Snabits, stops and the stat each obstacle wants change every season. A Snabit close to what an obstacle needs gets a
   try at it, and one that knows a fitting move uses it instead of turning back. Each region has a teacher camped on the map,
   stops along the path ask for a choice, and each visit has its own weather. Needs explore.js and explore-art.js. */

/* ---------- the season's finds on the region's fixed layout ---------- */
function exSeasonal(reg, N, season) {
  const R = rng(hashStr('exfind|' + reg.n + '|' + season)), finds = ['path', 'chest', 'spring', 'wild', 'path', 'chest', 'wild', 'stop', 'spring', 'stop'];
  for (const c of [1, 3, 5]) for (let r = 0; r < 3; r++) { const n = N[c + ':' + r]; if (n.k !== 'page' && n.k !== 'stone') n.k = finds[Math.floor(R() * finds.length)]; }
  for (const c of [2, 4]) { const st = [1, 2, 3, 4, 5].sort(() => R() - 0.5); for (let r = 0; r < 3; r++) { const n = N[c + ':' + r]; n.stat = st[r]; n.mul = c === 2 ? 0.88 + R() * 0.1 : 1 + R() * 0.15; } }
  if (!reg.rift && typeof TEACHER !== 'undefined' && TEACHER[reg.el]) { const n = N['3:' + Math.floor(rng(hashStr('exteach|' + reg.n))() * 3)]; n.k = 'teach'; n.met = !!(PLAYER && PLAYER.explore && PLAYER.explore[reg.n] && PLAYER.explore[reg.n].teachSeen); }
}

/* ---------- weather, one per visit ---------- */
function exWeather(reg) {
  const v = rng(hashStr('exwx|' + reg.n + '|' + PLAYER.week))();
  if (v < 0.4) return null;
  if (reg.rift || v < 0.6) return 'Fog';
  if (reg.el === 'Frost') return 'Snow';
  if (v < 0.8 || reg.el === 'Blaze') return 'Heat';
  return 'Rain';
}
const EX_WX_LINE = {
  Fog: () => "There's thick fog today, so we'll only see the places right next to us.",
  Heat: nm => `It's hot out here today, so ${nm} will tire sooner.`,
  Snow: nm => `The snow's deep today, so ${nm} will tire sooner.`,
  Rain: () => "It's raining, so the springs will be full.",
};
/* drawn over the scene on the smooth layer, in screen pixels */
function exWeatherPass(c, s, t, W, H) {
  const wx = s.exWx; if (!wx) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const u = H / 300;
  if (wx === 'Rain') {
    c.fillStyle = 'rgba(50,80,120,.14)'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(210,230,255,.55)'; c.lineWidth = 1.3 * u; c.lineCap = 'round'; c.beginPath();
    for (let i = 0; i < 90; i++) { const sp = 0.9 + (i % 5) * 0.12, x = ((i * 97.3 + t * 0.35 * sp) % (W + 60)) - 30, y = ((i * 53.7 + t * 0.9 * sp) % (H + 40)) - 20; c.moveTo(x, y); c.lineTo(x - 4 * u, y + 14 * u); }
    c.stroke();
  } else if (wx === 'Snow') {
    c.fillStyle = 'rgba(225,235,255,.12)'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { const r = (1.2 + (i % 4) * 0.6) * u, x = (i * 71.9 + Math.sin(t / 900 + i) * 14 * u + t * 0.02) % W, y = (i * 43.1 + t * (0.04 + (i % 4) * 0.012)) % H;
      c.fillStyle = `rgba(255,255,255,${0.6 + (i % 3) * 0.13})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  } else if (wx === 'Heat') {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,170,70,.22)'); g.addColorStop(0.6, 'rgba(255,190,90,.08)'); g.addColorStop(1, 'rgba(255,200,110,.12)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,240,210,.18)'; c.lineWidth = 2 * u;
    for (let i = 0; i < 7; i++) { const y = H * 0.55 + ((i * 37 - t * 0.02) % (H * 0.4) + H * 0.4) % (H * 0.4); c.beginPath(); for (let x = 0; x <= W; x += 8 * u) { const yy = y + Math.sin(x / (22 * u) + t / 260 + i) * 2.4 * u; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
  } else if (wx === 'Fog') {
    c.fillStyle = 'rgba(232,236,240,.12)'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { const r = (70 + (i % 3) * 30) * u, x = ((i * 157 + t * (0.008 + (i % 3) * 0.004) * u * 10) % (W + 2 * r)) - r, y = H * (0.45 + (i % 4) * 0.13);
      const g = c.createRadialGradient(x, y, r * 0.1, x, y, r); g.addColorStop(0, 'rgba(240,243,246,.4)'); g.addColorStop(1, 'rgba(240,243,246,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  }
  c.restore();
}

/* ---------- getting past an obstacle with a move ---------- */
// each obstacle gives way to two elements: the boulder to a hard hit or stone, the thorns to fire or a blade, the rune door
// to a spark or a charm, the mirage to light or shadow, and the dart totem to ice or water
const EX_OPEN = { 1: ['Brawl', 'Stone'], 2: ['Blaze', 'Steel'], 3: ['Spark', 'Charm'], 4: ['Light', 'Shade'], 5: ['Frost', 'Tide'] };
function exMoveFor(f, stat) { const els = EX_OPEN[stat] || []; return f.skills.filter(k => els.includes(k.el) && k.power).sort((a, b) => b.power - a.power)[0] || null; }
const EX_MOVE_WIN = {
  1: () => 'The boulder broke apart.', 3: () => 'The runes lit up and the door opened.',
  2: el => el === 'Blaze' ? 'The thorns burned away.' : 'The thorns are cut down.',
  4: el => el === 'Light' ? 'The light showed which archway is real.' : 'The fake archways faded away.',
  5: el => el === 'Frost' ? 'The totem froze solid.' : 'Water jammed the totem.',
};
/* ---------- the drama: a slower clock for hit stop, the camera, a dimmed backdrop, shake and flash ---------- */
const EXD = { frozen: 0, stopAt: 0, stopUntil: 0 };
const exNow = () => { const n = performance.now(); return (n < EXD.stopUntil ? EXD.stopAt : n) - EXD.frozen; };
const exTween = async (ms, fn, ease) => { const t0 = exNow(); for (;;) { const u = Math.min(1, (exNow() - t0) / ms); fn(ease ? ease(u) : u); if (u >= 1) return; await rwait(16); } };
const exOut = u => 1 - Math.pow(1 - u, 3), exIn = u => u * u * u;
async function exFreeze(ms) { EXD.stopAt = performance.now(); EXD.stopUntil = EXD.stopAt + ms; await rwait(ms); EXD.frozen += ms; EXD.stopUntil = 0; }
function exFocus(x, z) { const s = RS; s.panC = x; s.panUntil = performance.now() + 1e9; s.zoomT = z; }
function exFocusOff() { const s = RS; s.panUntil = 0; s.panC = null; s.zoomT = null; }
function exDim(a, ms = 350) { const c = el('r-scene'); if (!c) return; c.style.transition = `filter ${ms}ms ease`; c.style.filter = a ? `brightness(${1 - a}) saturate(${1 - a * 0.6})` : ''; }
function exLayer() { let f = el('ex-fx'); if (!f) { const fr = el('r-frame'); if (!fr) return null; f = document.createElement('div'); f.id = 'ex-fx'; f.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5;opacity:0'; fr.appendChild(f); } return f; }
async function exFlash(col = '#fff', a = 0.85, ms = 260) { const f = exLayer(); if (!f) return; f.style.background = col; await exTween(ms, u => { f.style.opacity = String(a * (1 - u)); }); f.style.opacity = '0'; }
function exShake(px, ms) {   // smooth sines that die away, on the backdrop and the sprite layer together
  const els = ['r-scene', 'r-chibi', 'r-canvas'].map(el).filter(Boolean), t0 = performance.now();
  const step = () => { const u = (performance.now() - t0) / ms; if (u >= 1) { els.forEach(e => e.style.transform = ''); return; } const k = px * Math.pow(1 - u, 2), t = performance.now();
    els.forEach(e => e.style.transform = `translate(${(Math.sin(t / 23) * k).toFixed(1)}px,${(Math.cos(t / 31) * k * 0.7).toFixed(1)}px)`); requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function exCalm() { exDim(0); exFocusOff(); const s = RS; s.ghosts = false; s.props = s.props.filter(p => !/^ex(burst|charge|lines|beam)/.test(p.k)); }

/* ---------- the sounds of it, made from the game's own synth and its recorded hits ---------- */
function exSfx(kind) {
  try { const d = sfxBus(); if (!d) return; MC = AC; const t = AC.currentTime + 0.01, R = Math.random;
    switch (kind) {
      case 'charge': { const o = mo('triangle', 160, t), g = MC.createGain(); o.frequency.exponentialRampToValueAtTime(880, t + 0.75); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); o.connect(g); g.connect(d); o.start(t); o.stop(t + 0.85);
        nsw(d, t, 0.75, 0.1, 'bandpass', 300, 2600, 2); break; }
      case 'impact': smp('hitH', 0.9); smp('ko', 0.55); dKick(d, t, 0.9); dNoise(d, t, 0.25, 0.25, 'lowpass', 900); break;
      case 'crumble': for (let i = 0; i < 9; i++) dNoise(d, t + i * 0.07 + R() * 0.04, 0.09, 0.16, 'lowpass', 500 + R() * 600); dNoise(d, t, 0.9, 0.12, 'lowpass', 160); smp('hitL', 0.5, 0.25); smp('hitM', 0.4, 0.45); break;
      case 'roar': nsw(d, t, 1.3, 0.22, 'lowpass', 350, 2200); dNoise(d, t, 1.4, 0.1, 'lowpass', 220); for (let i = 0; i < 18; i++) dNoise(d, t + 0.1 + i * 0.07 + R() * 0.05, 0.03, 0.12, 'highpass', 3500 + R() * 2500); break;
      case 'crackle': for (let i = 0; i < 10; i++) dNoise(d, t + i * 0.09 + R() * 0.08, 0.025, 0.08, 'highpass', 4000 + R() * 2000); break;
      case 'slash': smp('whoosh', 0.7, 0, 1.7); sTone(d, t + 0.05, 'triangle', 3400, 2600, 0.35, 0.05); sTone(d, t + 0.05, 'sine', 5200, 5000, 0.5, 0.025); break;
      case 'zap': for (let i = 0; i < 10; i++) sTone(d, t + i * 0.035, 'sawtooth', 80 + R() * 400, 60, 0.05, 0.05); dNoise(d, t, 0.45, 0.16, 'highpass', 3500); sTone(d, t, 'square', 3200, 600, 0.3, 0.03); break;
      case 'chime': [1047, 1319, 1568, 2093].forEach((f, i) => sTone(d, t + i * 0.08, 'sine', f, 0, 0.6, 0.06)); break;
      case 'shine': [784, 1175, 1568, 2349].forEach(f => sTone(d, t, 'sine', f, f * 1.01, 1.1, 0.035)); nsw(d, t, 0.9, 0.05, 'highpass', 2000, 7000); break;
      case 'shadow': nsw(d, t, 0.8, 0.18, 'lowpass', 150, 900); sTone(d, t, 'sine', 70, 45, 0.9, 0.12); sTone(d, t + 0.1, 'sawtooth', 110, 55, 0.6, 0.03); break;
      case 'freeze': for (let i = 0; i < 12; i++) dNoise(d, t + i * 0.04 + R() * 0.03, 0.03, 0.1, 'highpass', 5000); [3136, 2637, 2093].forEach((f, i) => sTone(d, t + 0.2 + i * 0.06, 'sine', f, 0, 0.5, 0.05)); break;
      case 'surge': nsw(d, t, 0.9, 0.3, 'lowpass', 500, 2600); nsw(d, t + 0.2, 0.7, 0.14, 'bandpass', 2400, 700, 1); sTone(d, t, 'sine', 260, 90, 0.4, 0.08); break;
      case 'whoosh': smp('whoosh', 0.8, 0, 1.1); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => sTone(d, t + i * 0.07, 'triangle', f, 0, 0.3, 0.055)); break;
      case 'thud': smp('hitH', 0.8); dKick(d, t, 0.8); break;
      case 'rumble': dNoise(d, t, 1.2, 0.16, 'lowpass', 140); dKick(d, t, 0.5); break;
      case 'glass': for (let i = 0; i < 14; i++) sTone(d, t + i * 0.025 + R() * 0.03, 'triangle', 2500 + R() * 3500, 1800, 0.18, 0.035); dNoise(d, t, 0.35, 0.18, 'highpass', 4500); break;
      case 'slowmo': nsw(d, t, 1.4, 0.2, 'lowpass', 900, 180); sTone(d, t, 'sine', 180, 60, 1.3, 0.1); break;
      case 'dart': smp('whoosh', 0.35, 0, 2); break;
      case 'thunk': dNoise(d, t, 0.06, 0.18, 'bandpass', 900, 2); sTone(d, t, 'square', 260, 120, 0.06, 0.03); break;
      case 'growl': nsw(d, t, 0.9, 0.25, 'lowpass', 160, 700); sTone(d, t, 'sawtooth', 90, 70, 0.8, 0.07); sTone(d, t, 'sawtooth', 135, 100, 0.8, 0.04); break;
      case 'scratch': dNoise(d, t, 0.08, 0.16, 'highpass', 3200); sTone(d, t, 'square', 600, 300, 0.05, 0.02); break;
      case 'rays': [523, 784, 1047, 1568, 2093].forEach((f, i) => sTone(d, t + i * 0.05, 'sine', f, f, 1.3, 0.045)); nsw(d, t, 1.2, 0.08, 'highpass', 1500, 6000); break;
      case 'learn': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => sTone(d, t + i * 0.08, 'triangle', f, 0, 0.5, 0.06)); [1047, 1568, 2093].forEach(f => sTone(d, t + 0.55, 'sine', f, 0, 1.2, 0.05)); break;
      case 'fizzle': nsw(d, t, 0.6, 0.12, 'highpass', 2500, 600); sTone(d, t, 'sine', 600, 150, 0.5, 0.05); break;
      case 'thunder': dKick(d, t, 0.7); dNoise(d, t, 0.08, 0.3, 'highpass', 2500); dNoise(d, t + 0.05, 2.2, 0.22, 'lowpass', 220); dNoise(d, t + 0.4, 1.6, 0.14, 'lowpass', 120); break;
    } } catch (err) {}
}
/* the weather's own sound, looped noise through a filter, and thunder now and then in the rain */
const EXA = { nodes: [], timer: null };
function exAmb(kind) {
  exAmbStop();
  if (kind === 'Rain') { EXA.timer = setInterval(() => { if (Math.random() < 0.5) exThunder(); }, 3200); setTimeout(exThunder, 900); }   // the flashes show with the sound off too
  if (kind === 'Heat') EXA.timer = setInterval(() => exSfx('crackle'), 1400);
  try { const d = sfxBus(); if (!d) return; MC = AC; const t = AC.currentTime;
    const loop = (type, f, q, v, lfo) => { const len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      const src = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); src.buffer = buf; src.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.8); src.connect(fl); fl.connect(g); g.connect(d); src.start(t); EXA.nodes.push({ src, g });
      if (lfo) { const o = AC.createOscillator(), og = AC.createGain(); o.frequency.value = lfo; og.gain.value = f * 0.5; o.connect(og); og.connect(fl.frequency); o.start(t); EXA.nodes.push({ src: o }); } };
    if (kind === 'Rain') { loop('bandpass', 2600, 0.6, 0.11); loop('lowpass', 500, 0.7, 0.07); }
    else if (kind === 'Snow') { loop('lowpass', 700, 1.2, 0.12, 0.17); loop('bandpass', 1800, 2, 0.03, 0.31); }
    else if (kind === 'Fog') { loop('lowpass', 300, 1, 0.08, 0.08); }
    else if (kind === 'Heat') { loop('highpass', 6000, 0.7, 0.025); }
  } catch (err) {}
}
function exAmbStop() { try { const t = AC.currentTime; for (const n of EXA.nodes) { if (n.g) n.g.gain.setTargetAtTime(0.0001, t, 0.2); n.src.stop(t + 0.8); } } catch (err) {} EXA.nodes = []; clearInterval(EXA.timer); EXA.timer = null; }
function exThunder() { const f = exLayer(); if (f) { f.style.background = '#eef4ff'; let k = 0; const seq = [0.8, 0.1, 0.6, 0]; const step = () => { f.style.opacity = String(seq[k] || 0); if (++k < seq.length) setTimeout(step, 70); }; step(); } exSfx('thunder'); }
const EX_EL_SFX = { Brawl: 'thud', Stone: 'crumble', Blaze: 'roar', Steel: 'slash', Spark: 'zap', Charm: 'chime', Light: 'shine', Shade: 'shadow', Frost: 'freeze', Tide: 'surge' };

/* ---------- getting past an obstacle with a move ---------- */
/* the move as a moment: the camera pushes in, the backdrop darkens, the element gathers round the Snabit, then it lets go
   with a lunge or a shot, time stops on the hit, the screen flashes and shakes, and the obstacle comes apart */
async function exHit(mv, tx, ty) {
  const s = RS, el = mv.el;
  exFocus((s.x + tx) / 2, 1.6); exDim(0.5); await rwait(400);
  banner(mv.name, '#ffd23f'); s.pose = 'effort'; exSfx('charge'); if (typeof elSfx === 'function') elSfx(el, 'cast');
  const ch = prop({ k: 'excharge', el, x: s.x, y: GROUND - 14, t0: exNow() }); await rwait(850); unprop(ch);
  s.pose = 'attack'; banner('');
  const big = () => { exSfx('impact'); exSfx(EX_EL_SFX[el]); if (typeof elSfx === 'function') elSfx(el, 'hit'); exFlash(EX_EL_COL[el] ? EX_EL_COL[el][1] : '#fff', 0.75, 300); exShake(9, 520); };
  if (el === 'Steel') {   // it leaps and rakes three claws through the target
    const x0 = s.x; s.ghosts = true; exSfx('whoosh'); await exTween(160, u => { s.x = x0 + (tx - 34 - x0) * u; s.jy = -Math.sin(u * Math.PI) * 18; }, exIn); s.jy = 0;
    prop({ k: 'exclaw', x: tx, y: ty, t0: exNow() }); exSfx('slash'); await rwait(90); big(); await exFreeze(150);
  } else if (el === 'Stone') {   // it stamps and stone spikes burst up under the target
    s.jy = -14; await rwait(160); s.jy = 0; exSfx('thud'); exShake(4, 200); prop({ k: 'excrack', x: s.x, y: GROUND, g: 1 });
    const sp = prop({ k: 'exspikes', x: tx + 10, y: GROUND, h: 0 }); s.props.splice(s.props.indexOf(sp), 1); s.props.unshift(sp); EXD.spikes = sp;   // behind the boulder, so it rides up on them await rwait(140); await exTween(160, u => { sp.h = u; }, exOut); big(); await exFreeze(140);
  } else if (mv.kind === 'Strike') {
    const x0 = s.x; s.ghosts = true; exSfx('whoosh'); await exTween(170, u => { s.x = x0 + (tx - 30 - x0) * u; }, exIn);
    prop({ k: 'exlines', x: tx, y: ty, t0: exNow() }); prop({ k: 'exburst', el, x: tx, y: ty, t0: exNow(), k2: 1.7 }); big(); await exFreeze(140);
  } else {
    const sx = s.x + 14, sy = headY() + 8, ms = el === 'Spark' ? 120 : el === 'Light' ? 160 : el === 'Tide' ? 260 : 300;
    exSfx(el === 'Spark' ? 'zap' : 'whoosh'); const b = prop({ k: 'exshot', el, x: sx, y: sy, x2: tx, y2: ty, t0: exNow(), ms }); await rwait(ms);
    if (el !== 'Light' && el !== 'Tide' && el !== 'Spark') unprop(b);
    prop({ k: 'exlines', x: tx, y: ty, t0: exNow() }); prop({ k: 'exburst', el, x: tx, y: ty, t0: exNow(), k2: 1.6 }); big(); await exFreeze(140);
    if (b) { await rwait(el === 'Tide' ? 350 : 200); unprop(b); }
  }
  s.ghosts = false;
  if (mv.kind === 'Strike') { const x1 = s.x; await exTween(260, u => { s.x = x1 - 26 * u; s.jy = -Math.sin(u * Math.PI) * 8; }, exOut); s.jy = 0; }
  s.pose = 'idle';
}
async function exMoveOpen(stat, mv, seed) {
  const s = RS, el = mv.el, line = EX_MOVE_WIN[stat](el);
  try {
    if (stat === 1) { const b = prop({ k: 'xrockb', x: 172, y: GROUND, s: 1.7, broke: 0 }); await walkTo(104, 60, 'walk');
      if (el === 'Stone') { const hit = exHit(mv, 162, GROUND - 26); while (!EXD.spikes) await rwait(16); const sp = EXD.spikes; await exTween(300, () => { b.y = GROUND - sp.h * 22; }); await hit; EXD.spikes = null;
        exSfx('crumble'); spark(172, GROUND - 4, 'dust', 16); exShake(5, 700); await exTween(1300, u => { b.broke = u; sp.h = 1 - u * 0.4; if (u > 0.5) b.y = GROUND - 22 + (u - 0.5) * 44; }); unprop(sp); unprop(b); }
      else { await exHit(mv, 162, GROUND - 26); exSfx('crumble'); spark(172, GROUND - 4, 'dust', 16); exShake(5, 700); await exTween(1300, u => { b.broke = u; }); unprop(b); } }
    else if (stat === 2) { const th = prop({ k: 'thorns2', x: 168, y: GROUND, s: 1.35, gone: 0, how: el === 'Blaze' ? 'burn' : 'cut' }); await walkTo(110, 60, 'walk'); await exHit(mv, 160, GROUND - 24);
      if (el === 'Blaze') exSfx('crackle'); else { th.how = 'shred'; exSfx('snap'); } await exTween(el === 'Blaze' ? 1700 : 1200, u => { th.gone = u; }); unprop(th); }
    else if (stat === 3) { const d = prop({ k: 'sealdoor', x: 184, y: GROUND, lit: 0, drop: 0 }), lt = prop({ k: 'litter', x: 154, y: GROUND, s: 1.3 }); await walkTo(118, 60, 'walk'); await exHit(mv, 184, GROUND - 40);
      const RU = [[176, GROUND - 35], [192, GROUND - 35], [184, GROUND - 19]];
      for (let i = 1; i <= 3; i++) { d.lit = i; const [rx, ry] = RU[i - 1]; if (el === 'Spark') { const b = prop({ k: 'exbeam', el, x: rx + 12 - i * 8, y: GROUND - 110, x2: rx, y2: ry, t0: exNow() }); setTimeout(() => unprop(b), 160); } else prop({ k: 'exburst', el, x: rx, y: ry, t0: exNow(), k2: 0.6 }); exSfx(el === 'Spark' ? 'zap' : 'chime'); exShake(2, 200); await rwait(260); }
      await exDoorOpen(d, el); unprop(lt); }
    else if (stat === 4) { const real = seed % 3, m = prop({ k: 'mirage', x: 170, y: GROUND, real, reveal: 0, s: 1.2 }); await walkTo(98, 60, 'walk'); await exHit(mv, 170, GROUND - 30);
      await exMirageBreak(m, real, el); exCalm(); await walkTo(170 - 55 + 110 * (0.2 + real * 0.3), 60, 'walk'); await walkTo(224, 60, 'walk'); unprop(m); }
    else { const tr = prop({ k: 'darttrap', x: 206, y: GROUND, live: true, s: 1.5 }), coat = prop({ k: 'excoat', el, x: 206, y: GROUND, s: 1.5, a: 0 }); await walkTo(120, 60, 'walk'); tr.live = false; await exHit(mv, 200, GROUND - 40);
      tr.live = false; spark(206, GROUND - 40, el === 'Frost' ? 'sparkle' : 'drip', 12); await exTween(700, u => { coat.a = u; });
      const mist = prop({ k: 'exmist', el, x: 206, y: GROUND, t0: exNow() }); exSfx(el === 'Frost' ? 'freeze' : 'surge'); await rwait(700); exCalm(); await walkTo(236, 120, 'run'); unprop(tr); unprop(coat); unprop(mist); }
  } finally { exCalm(); }
  await walkTo(Math.max(s.x, 226), 60, 'walk'); s.pose = 'happy'; exSfx('win'); spark(s.x, headY() - 6, 'sparkle', 6); await hop(10, 300);
  return line;
}

/* the rune door slides down and light pours out of the doorway */
async function exDoorOpen(d, el) {
  const r = prop({ k: 'exrays', x: 184, y: GROUND - 25, a: 0, el: el || 'Mind' }); exSfx('rumble'); exSfx('rays'); exShake(5, 800);
  await exTween(700, u => { d.drop = 61 * u; r.a = u; }, exIn); spark(184, GROUND - 4, 'dust', 12); exFlash('#fffbe0', 0.5, 300); await rwait(500);
  await exTween(500, u => { r.a = 1 - u; }); unprop(r); unprop(d);
}
/* the two fake archways crack and shatter, and the real one glows */
async function exMirageBreak(m, real, el) {
  const ax = i => 170 - 55 + 110 * (0.2 + i * 0.3), fakes = [0, 1, 2].filter(i => i !== real);
  const rip = prop({ k: 'exripple', x: RS.x, y: GROUND - 20, t0: exNow(), el: el || 'Insight' }); exSfx('shine'); await rwait(450);
  for (const i of fakes) prop({ k: el === 'Shade' ? 'exburst' : 'exshards', el: 'Shade', x: ax(i), y: GROUND - 20, t0: exNow(), k2: 0.8 });
  exSfx(el === 'Shade' ? 'shadow' : 'glass'); exShake(4, 400); exFlash('#ffffff', 0.4, 200);
  await exTween(600, u => { m.reveal = u; }); unprop(rip);
  const gl = prop({ k: 'exglow', x: ax(real), y: GROUND - 18, t0: exNow() }); await rwait(700); unprop(gl);
}
/* ---------- getting past on its own stats, each with its own big moment (not the drill version) ---------- */
// returns true when it played the obstacle itself; explore.js falls back to the old version for the rest
async function exObstacle2(stat, ok, seed) {
  const s = RS;
  if (stat === 1) {   // Power: it digs in, the ground cracks, it charges and slams the boulder off down the trail
    const b = prop({ k: 'xrock', x: 176, y: GROUND, s: 1.7, rot: 0 }); await walkTo(104, 60, 'walk');
    exFocus(140, 1.6); exDim(0.35); await rwait(400);
    s.pose = 'effort'; exSfx('rumble'); const ck = prop({ k: 'excrack', x: s.x, y: GROUND, g: 0 }), ch = prop({ k: 'excharge', el: 'Stone', x: s.x, y: GROUND - 14, t0: exNow() });
    await exTween(900, u => { ck.g = u; s.bx = Math.sin(u * 60) * u * 1.2; }); unprop(ch); s.bx = 0; exSfx('charge');
    s.pose = 'attack'; s.ghosts = true; exSfx('whoosh'); const x0 = s.x; await exTween(200, u => { s.x = x0 + (176 - 44 - x0) * u; }, exIn);
    prop({ k: 'exlines', x: 150, y: GROUND - 26, t0: exNow() }); exSfx('thud'); exShake(ok ? 10 : 6, 500); exFlash('#fff', 0.7, 240); await exFreeze(130); s.ghosts = false;
    try {
      if (ok) { exSfx('rumble'); let v = 0;
        exFocus(190, 1.25); await exTween(1500, u => { v = 0.6 + u * 3.4; b.x += v; b.rot += v * 0.045; if (Math.random() < 0.6) spark(b.x - 22, GROUND - 2, 'dust', 1, true); });
        exSfx('impact'); exShake(7, 600); spark(232, GROUND - 6, 'dust', 14); s.pose = 'happy'; exSfx('win'); await hop(12, 320); unprop(ck); }
      else { for (let i = 0; i < 2; i++) { b.rot = 0.06; await rwait(120); b.rot = -0.04; await rwait(120); } b.rot = 0;
        s.pose = 'hurt'; s.flash = 2; exSfx('thud'); spark(s.x, headY() - 4, 'star', 4); const x1 = s.x; await exTween(420, u => { s.x = x1 - 46 * u; s.jy = -Math.sin(u * Math.PI) * 16; }, exOut); s.jy = 0;
        exShake(4, 300); s.pose = 'tired'; spark(s.x, headY(), 'sweat', 3); await rwait(500); unprop(ck); exCalm(); await exBack(70); }
    } finally { exCalm(); unprop(b); }
    return true; }
  if (stat === 5) {   // Speed: time slows, darts hang in the air and it weaves between them
    const tr = prop({ k: 'darttrap', x: 206, y: GROUND, live: true, s: 1.5 }); await walkTo(104, 60, 'walk');
    exFocus(150, 1.5); exDim(0.45); s.pose = 'effort'; const ch = prop({ k: 'excharge', el: 'Speed', x: s.x, y: GROUND - 14, t0: exNow() }); exSfx('charge'); await rwait(800); unprop(ch);
    exSfx('slowmo'); exFlash('#dff6ff', 0.4, 300); tr.live = false; const ds = [];
    for (const [hy, at] of [[0.78, 0], [0.42, 200], [0.62, 400], [0.3, 600]]) setTimeout(() => { ds.push(prop({ k: 'dart', x: 194, y: GROUND - 69 * (1 - hy), s: 1.4 })); exSfx('dart'); }, at);
    s.pose = 'run'; s.ghosts = true; const x0 = s.x;
    try {
      if (ok) { await exTween(1500, u => { s.x = x0 + (236 - x0) * u; s.jy = -Math.abs(Math.sin(u * Math.PI * 3)) * 14; for (const d of ds) d.x -= 0.9; });
        s.jy = 0; s.ghosts = false; exFlash('#ffffff', 0.5, 200); for (const d of ds) { d.x -= 0; exSfx('thunk'); spark(d.x, GROUND - 2, 'dust', 3); } exShake(3, 300); s.pose = 'happy'; exSfx('win'); await hop(12, 320); }
      else { await exTween(700, u => { s.x = x0 + 50 * u; s.jy = -Math.abs(Math.sin(u * Math.PI * 2)) * 10; for (const d of ds) d.x -= 0.9; });
        s.ghosts = false; prop({ k: 'exlines', x: s.x + 6, y: headY() + 8, t0: exNow() }); exSfx('thud'); exFlash('#ff8a8a', 0.5, 250); exShake(6, 400); s.pose = 'hurt'; s.flash = 2; await exFreeze(130);
        spark(s.x, headY() - 4, 'star', 4); const x1 = s.x; await exTween(450, u => { s.x = x1 - 50 * u; s.jy = -Math.sin(u * Math.PI) * 14; }, exOut); s.jy = 0; s.pose = 'tired'; await rwait(500); exCalm(); await exBack(84); }
    } finally { ds.forEach(unprop); exCalm(); unprop(tr); }
    return true; }
  if (stat === 3) {   // Mind: the runes lift off the door, circle it, and lock back in the right order
    const d = prop({ k: 'sealdoor', x: 184, y: GROUND, lit: 0, drop: 0 }), lt = prop({ k: 'litter', x: 154, y: GROUND, s: 1.3 }); await walkTo(118, 60, 'walk');
    exFocus(158, 1.6); exDim(0.45); s.pose = 'idle'; spark(s.x, headY() - 10, 'bulb'); const ch = prop({ k: 'excharge', el: 'Mind', x: s.x, y: GROUND - 14, t0: exNow() }); exSfx('charge'); await rwait(800); unprop(ch);
    const g = prop({ k: 'exglyph', x: 184, y: GROUND, u: 0, lock: 0, bad: 0 }); exSfx('shine');
    try {
      await exTween(1200, u => { g.u = u; });
      if (ok) { for (let i = 1; i <= 3; i++) { await exTween(240, u => { g.lock = i - 1 + u; }); d.lit = i; exSfx('chime'); exShake(2, 160); } unprop(g); await exDoorOpen(d, 'Mind'); unprop(lt);
        s.pose = 'happy'; exSfx('win'); await walkTo(212, 60, 'walk'); }
      else { g.bad = 1; exSfx('zap'); const b = prop({ k: 'exbeam', el: 'Spark', x: 184, y: GROUND - 34, x2: s.x + 6, y2: headY() + 8, t0: exNow() }); await rwait(230); unprop(b); unprop(g);
        exFlash('#ffe14d', 0.6, 250); exShake(6, 400); s.pose = 'hurt'; s.flash = 2; await exFreeze(120); spark(s.x, headY() - 4, 'zap', 3);
        const x1 = s.x; await exTween(420, u => { s.x = x1 - 34 * u; s.jy = -Math.sin(u * Math.PI) * 10; }, exOut); s.jy = 0; s.pose = 'sad'; await rwait(600); exCalm(); await exBack(96); unprop(d); unprop(lt); }
    } finally { unprop(g); exCalm(); }
    return true; }
  if (stat === 4) {   // Insight: it sees through them, a ripple runs out and the fake archways shatter
    const real = seed % 3, m = prop({ k: 'mirage', x: 170, y: GROUND, real, reveal: 0, s: 1.2 }), ax = i => 170 - 55 + 110 * (0.2 + i * 0.3);
    await walkTo(98, 60, 'walk'); exFocus(150, 1.5); exDim(0.4); s.pose = 'idle'; spark(s.x + 4, headY() - 2, 'sparkle', 4);
    try {
      if (ok) { const ch = prop({ k: 'excharge', el: 'Insight', x: s.x, y: GROUND - 14, t0: exNow() }); exSfx('charge'); await rwait(800); unprop(ch);
        await exMirageBreak(m, real, 'Insight'); exCalm(); s.pose = 'happy'; exSfx('win'); await walkTo(ax(real), 60, 'walk'); await walkTo(224, 60, 'walk'); }
      else { const wrong = (real + 1) % 3; s.pose = 'happy'; await walkTo(ax(wrong) - 14, 80, 'walk');
        prop({ k: 'exripple', x: ax(wrong), y: GROUND - 20, t0: exNow(), el: 'Insight' }); prop({ k: 'exlines', x: ax(wrong) - 6, y: GROUND - 22, t0: exNow() }); exSfx('thud'); exSfx('glass');
        exFlash('#ffffff', 0.5, 220); exShake(5, 350); s.pose = 'hurt'; s.flash = 2; await exFreeze(130); spark(s.x, headY() - 4, 'star', 3);
        const x1 = s.x; await exTween(420, u => { s.x = x1 - 36 * u; s.jy = -Math.sin(u * Math.PI) * 12; }, exOut); s.jy = 0; s.pose = 'sad'; await rwait(500); exCalm(); await exBack(90); }
    } finally { exCalm(); unprop(m); }
    return true; }
  if (stat === 2) {   // Constitution: it takes the scratches, then roars and blasts the bramble apart
    const th = prop({ k: 'thorns2', x: 168, y: GROUND, s: 1.35, gone: 0, how: 'blast' }); await walkTo(132, 60, 'walk');
    exFocus(152, 1.6); exDim(0.4); s.pose = 'effort';
    try {
      for (let i = 0; i < 4; i++) { s.x += 2; s.flash = 1; spark(s.x + 12, headY() + 4 + i * 3, 'star', 1); exSfx('scratch'); exShake(2, 120); await rwait(260); }
      if (ok) { const ch = prop({ k: 'excharge', el: 'Grit', x: s.x, y: GROUND - 14, t0: exNow() }); exSfx('charge'); await rwait(700); unprop(ch);
        s.pose = 'attack'; exSfx('growl'); prop({ k: 'exring', x: s.x, y: GROUND - 18, t0: exNow(), el: 'Grit' }); exFlash('#ffd9b0', 0.6, 300); exShake(9, 600); await exFreeze(120);
        exSfx('crumble'); await exTween(1000, u => { th.gone = u; }); s.pose = 'happy'; exSfx('win'); await walkTo(222, 60, 'walk'); }
      else { const w = prop({ k: 'exwrap', x: s.x, y: GROUND, a: 0 }); await exTween(500, u => { w.a = u; w.x = s.x; });
        for (let i = 0; i < 6; i++) { s.bx = i % 2 ? 2 : -2; exSfx('scratch'); await rwait(140); } s.bx = 0; exSfx('snap');
        unprop(w); exShake(5, 300); s.pose = 'hurt'; s.flash = 2; spark(s.x, headY() - 4, 'star', 3); const x1 = s.x; await exTween(420, u => { s.x = x1 - 40 * u; s.jy = -Math.sin(u * Math.PI) * 10; }, exOut); s.jy = 0;
        s.pose = 'tired'; await rwait(500); exCalm(); await exBack(84); }
    } finally { exCalm(); unprop(th); }
    return true; }
  return false;
}

/* ---------- the props those use ---------- */
const EX_EL_COL = { Speed: ['#8fe3ff', '#ffffff'], Mind: ['#b48cff', '#f1e6ff'], Insight: ['#6fe0cc', '#e8fffb'], Grit: ['#e0763a', '#ffd9b0'], Brawl: ['#ffd23f', '#fff6c8'], Stone: ['#9a8a74', '#d6c8ae'], Blaze: ['#ff7a2a', '#ffd34d'], Steel: ['#b9c4cf', '#ffffff'], Spark: ['#ffe14d', '#ffffff'],
  Charm: ['#ff8fc4', '#ffe0ef'], Light: ['#ffd76a', '#fffbe0'], Shade: ['#5a3f86', '#a68ad6'], Frost: ['#8fd3ff', '#eaf8ff'], Tide: ['#3ea0e0', '#bfe8ff'] };
function exProp2(c, p, t, front) {
  const x = p.x, y = p.y, now = performance.now();
  switch (p.k) {
    case 'xrockb': if (front) return true; exRockBreak(c, x, y, p.s || 1, p.broke || 0); return true;
    case 'thorns2': if (front) return true; exThornsGone(c, x, y, p.s || 1, p.gone || 0, p.how, t); return true;
    case 'excoat': if (front) return true; exCoat(c, x, y, p.s || 1, p.el, p.a || 0, t); return true;
    case 'exburst': if (!front) return true; { const u = Math.min(1, (exNow() - p.t0) / 1000); if (u < 1) { c.save(); const k2 = p.k2 || 1; c.translate(x, y); c.scale(k2, k2); c.translate(-x, -y); exBurst(c, x, y, p.el, u, p.t0, k2); c.restore(); } } return true;
    case 'exbeam': if (!front) return true; if (p.el === 'Spark') { exBolt(c, p.x, p.y, p.x2, p.y2, Math.floor(t / 40), 1); return true; } { const C = EX_EL_COL[p.el] || EX_EL_COL.Brawl, u = Math.min(1, (exNow() - p.t0) / 230); c.save(); c.lineCap = 'round';
      const hx = p.x + (p.x2 - p.x) * u, hy = p.y + (p.y2 - p.y) * u, tx = p.x + (p.x2 - p.x) * Math.max(0, u - 0.45), ty = p.y + (p.y2 - p.y) * Math.max(0, u - 0.45);
      c.shadowColor = C[0]; c.shadowBlur = 14; c.strokeStyle = C[0]; c.lineWidth = 12; c.globalAlpha = 0.6; c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx, hy); c.stroke(); c.strokeStyle = C[1]; c.lineWidth = 5; c.globalAlpha = 1; c.stroke();
      if (p.el === 'Blaze') { const a = Math.atan2(p.y2 - p.y, p.x2 - p.x); c.save(); c.translate(hx, hy); c.rotate(a - Math.PI / 2); exFlame(c, 0, 0, 9, 30, Math.sin(t / 40) * 3); c.restore(); }
      c.fillStyle = C[1]; c.beginPath(); c.arc(hx, hy, 9, 0, 7); c.fill(); c.restore(); } return true;
    case 'excharge': if (!front) return true; exChargeDraw(c, x, y, p.el, (exNow() - p.t0) / 800, t); return true;
    case 'exlines': if (!front) return true; { const u = (exNow() - p.t0) / 320; if (u < 1) exLines(c, x, y, u); } return true;
    case 'exrays': if (front) return true; { const C = EX_EL_COL[p.el] || EX_EL_COL.Light; c.save(); c.globalAlpha = p.a; const g = c.createLinearGradient(x, y, x - 140, y); g.addColorStop(0, C[1]); g.addColorStop(1, C[1] + '00'); c.fillStyle = g;
      for (let i = 0; i < 5; i++) { const a = Math.PI + (i - 2) * 0.16 + Math.sin(t / 400 + i) * 0.03; c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + Math.cos(a - 0.05) * 160, y + Math.sin(a - 0.05) * 160 - 12); c.lineTo(x + Math.cos(a + 0.05) * 160, y + Math.sin(a + 0.05) * 160 - 12); c.closePath(); c.fill(); }
      const r = c.createRadialGradient(x, y - 10, 2, x, y - 10, 40); r.addColorStop(0, C[1]); r.addColorStop(1, C[1] + '00'); c.fillStyle = r; c.fillRect(x - 40, y - 50, 80, 80); c.restore(); } return true;
    case 'exripple': if (!front) return true; { const u = (exNow() - p.t0) / 800; if (u >= 1) return true; const C = EX_EL_COL[p.el] || EX_EL_COL.Insight; c.save();
      for (let k = 0; k < 3; k++) { const v = u - k * 0.12; if (v <= 0) continue; c.globalAlpha = (1 - v) * 0.8; c.strokeStyle = k ? C[0] : C[1]; c.lineWidth = 4 - k; c.beginPath(); c.ellipse(x, y, 10 + v * 150, 6 + v * 60, 0, 0, 7); c.stroke(); } c.restore(); } return true;
    case 'exshards': if (!front) return true; { const u = (exNow() - p.t0) / 900; if (u >= 1) return true; c.save();
      for (let i = 0; i < 14; i++) { const a = i * 0.45 + 0.3, v = 30 + (i % 4) * 14, px = x + Math.cos(a) * v * u * 1.2, py = y - 4 + Math.sin(a) * v * u * 0.7 - 20 * u + 60 * u * u, r = 3 + (i % 3) * 2;
        c.save(); c.globalAlpha = 1 - u; c.translate(px, py); c.rotate(u * 6 + i); c.fillStyle = i % 2 ? 'rgba(200,255,245,.85)' : 'rgba(120,200,180,.75)'; c.strokeStyle = '#fff'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(0, -r); c.lineTo(r * 0.8, r * 0.6); c.lineTo(-r * 0.7, r * 0.4); c.closePath(); c.fill(); c.stroke(); c.restore(); }
      c.restore(); } return true;
    case 'exglow': if (front) return true; { const u = Math.min(1, (exNow() - p.t0) / 300); c.save(); c.globalAlpha = u * (0.7 + 0.2 * Math.sin(t / 120)); const g = c.createRadialGradient(x, y, 2, x, y, 34); g.addColorStop(0, '#fffbe0'); g.addColorStop(0.5, '#ffd76a88'); g.addColorStop(1, '#ffd76a00'); c.fillStyle = g; c.fillRect(x - 34, y - 34, 68, 68); c.restore(); } return true;
    case 'exring': if (!front) return true; { const u = (exNow() - p.t0) / 600; if (u >= 1) return true; const C = EX_EL_COL[p.el] || EX_EL_COL.Brawl; c.save(); c.globalAlpha = 1 - u; c.strokeStyle = C[1]; c.lineWidth = 6 * (1 - u) + 1; c.shadowColor = C[0]; c.shadowBlur = 10;
      c.beginPath(); c.ellipse(x, y, 10 + u * 110, 8 + u * 50, 0, 0, 7); c.stroke(); c.restore(); } return true;
    case 'exwrap': if (!front) return true; { c.save(); c.globalAlpha = p.a; c.strokeStyle = '#4f7a34'; c.lineWidth = 3.5; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const yy = y - 6 - i * 9; c.beginPath(); c.ellipse(x, yy, 15 + Math.sin(t / 90 + i) * 1.5, 4, 0.15 * (i % 2 ? 1 : -1), 0, 7); c.stroke();
        c.fillStyle = '#e6e0c8'; for (let k = 0; k < 3; k++) { const a = k * 2.1 + i; c.beginPath(); c.moveTo(x + Math.cos(a) * 15, yy + Math.sin(a) * 4); c.lineTo(x + Math.cos(a) * 19, yy + Math.sin(a) * 4 - 3); c.lineTo(x + Math.cos(a + 0.2) * 15, yy + Math.sin(a + 0.2) * 4); c.fill(); } } c.restore(); } return true;
    case 'exmist': if (!front) return true; { const u = (exNow() - p.t0) / 1400; if (u >= 1) return true; c.save(); const col = p.el === 'Frost' ? '230,246,255' : '240,244,248';
      for (let i = 0; i < 8; i++) { const k = (u + i / 8) % 1, mx = x + (i - 4) * 9 + Math.sin(i * 2 + u * 3) * 6, my = y - 10 - k * 60, r = 8 + k * 14; c.globalAlpha = (1 - k) * 0.5 * (1 - u * 0.5); c.fillStyle = `rgb(${col})`; c.beginPath(); c.arc(mx, my, r, 0, 7); c.fill(); }
      c.restore(); } return true;
    case 'expillar': if (!front) return true; exPillar(c, x, y, (exNow() - p.t0) / 1600, t); return true;
    case 'exglyph': if (!front) return true; exGlyphs(c, x, y, p.u || 0, p.lock || 0, p.bad, t); return true;
    case 'exshot': if (!front) return true; exShot(c, p, Math.min(1, (exNow() - p.t0) / p.ms), t); return true;
    case 'exclaw': if (!front) return true; { const u = (exNow() - p.t0) / 700; if (u < 1) exClaw(c, x, y, u, t); } return true;
    case 'exspikes': if (front) return true; exSpikes(c, x, y, p.h || 0); return true;
    case 'chest2': if (front) return true; exChestDraw(c, p, t); return true;
    case 'exitem': if (!front) return true; exItemDraw(c, p, t); return true;
    case 'excrack': if (front) return true; { const g = p.g || 0; if (g <= 0) return true; c.save(); c.strokeStyle = 'rgba(40,28,18,.75)'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const dir = i % 2 ? 1 : -1, L = (14 + i * 6) * g; c.beginPath(); c.moveTo(x, y); let px = x, py = y; for (let k = 1; k <= 4; k++) { px += dir * L / 4; py += (k % 2 ? 1.2 : -0.8) + i * 0.15; c.lineTo(px, py); } c.stroke(); }
      c.fillStyle = 'rgba(40,28,18,.25)'; c.beginPath(); c.ellipse(x, y + 1, 20 * g, 3 * g, 0, 0, 7); c.fill(); c.restore(); } return true;
    case 'tent': if (front) return true; exTent(c, x, y, p.s || 1); return true;
    case 'sign': if (front) return true; exSign(c, x, y, p.s || 1); return true;
  }
  return false;
}
/* the boulder splits down a jagged crack, the halves tip outward onto the ground and rounded chunks bounce away */
function exRockBreak(c, x, y, s, u) {
  const r = 15 * s, cy = y - r * 0.92, e = 1 - Math.pow(1 - Math.min(1, u * 1.6), 3), fade = 1 - Math.max(0, u - 0.8) * 5;
  const crack = [[3, -40], [-2, -30], [4, -20], [-3, -10], [2, 0], [-1, 10]].map(([dx, dy]) => [dx * s, dy * s]);
  c.save(); c.globalAlpha = Math.max(0, fade);
  for (const side of [-1, 1]) { c.save();
    const px = x + side * r * 0.95; c.translate(px, y); c.rotate(side * e * 0.42); c.translate(-px + side * e * 5 * s, -y);
    c.beginPath(); c.moveTo(x + side * 80 * s, cy - 60 * s); for (const [dx, dy] of crack) c.lineTo(x + dx, cy + dy); c.lineTo(x + side * 80 * s, y + 4); c.closePath(); c.clip();
    XA.rock(c, x, y, s, 0);
    c.fillStyle = 'rgba(70,62,54,.55)'; c.beginPath(); for (const [dx, dy] of crack) c.lineTo(x + dx - side * 1.2 * s, cy + dy); for (const [dx, dy] of crack.slice().reverse()) c.lineTo(x + dx - side * 4 * s, cy + dy); c.fill();   // the broken face
    c.restore(); }
  for (let i = 0; i < 8; i++) { const vx = (i % 2 ? 1 : -1) * (14 + (i * 7) % 20) * s, vy = (26 + (i * 11) % 22) * s, k = Math.min(1, u * 1.3), tt = k * 1.4,
      hy = Math.max(0, vy * tt - 34 * s * tt * tt), px = x + vx * tt, py = y - 3 * s - (tt < 1.4 ? hy : 0), rr = (2.2 + (i % 3)) * s;
    c.fillStyle = i % 3 ? '#a49d92' : '#8b8378'; SC.blob(c, px, py, [[0, 0, rr], [rr * 0.5, rr * 0.2, rr * 0.7]]); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(px - rr * 0.3, py - rr * 0.35, rr * 0.35, 0, 7); c.fill(); }
  if (u < 0.6) for (let i = 0; i < 5; i++) { const k = u / 0.6, dx = (i - 2) * 12 * s * (0.6 + k), rr = (8 + i % 2 * 4) * s * (0.5 + k); c.globalAlpha = (1 - k) * 0.5; c.fillStyle = '#d8cfc2'; c.beginPath(); c.arc(x + dx, y - rr * 0.6, rr, 0, 7); c.fill(); }
  c.restore();
}
/* fire catches along the bramble, chars it black and it sinks into a pile of ash with smoke rising; a blade cuts it on a
   slant and the top slides off and drops */
function exFlame(c, fx, fy, w, h, sway) {
  for (const [col, k] of [['#e2502a', 1], ['#ff8a2a', 0.72], ['#ffd34d', 0.42]]) { const W = w * k, H = h * k;
    c.fillStyle = col; c.beginPath(); c.moveTo(fx - W, fy); c.bezierCurveTo(fx - W * 1.1, fy - H * 0.45, fx - W * 0.4 + sway * 0.5, fy - H * 0.7, fx + sway, fy - H);
    c.bezierCurveTo(fx + W * 0.5 + sway * 0.5, fy - H * 0.68, fx + W * 1.1, fy - H * 0.45, fx + W, fy); c.arc(fx, fy, W, 0, Math.PI); c.fill(); }
}
function exThornsGone(c, x, y, s, u, how, t) {
  c.save();
  if (how === 'burn') {
    const char = Math.min(1, u / 0.55), sink = Math.max(0, (u - 0.45) / 0.55), flame = Math.sin(Math.min(1, u / 0.85) * Math.PI);
    c.save(); c.globalAlpha = 1 - sink; c.filter = `brightness(${1 - char * 0.8}) saturate(${1 - char})`; c.translate(x, y); c.scale(1 - sink * 0.2, 1 - sink * 0.85); XA.bramble(c, 0, 0, s); c.restore();
    c.fillStyle = '#3a3330'; c.globalAlpha = Math.min(1, sink * 2) * (1 - Math.max(0, u - 0.9) * 10); SC.blob(c, x, y - 2, [[0, 0, 9 * s], [-12 * s, 2, 7 * s], [12 * s, 2, 7 * s], [-5 * s, 1, 8 * s]]); c.fill();   // the ash
    c.globalAlpha = 1;
    for (let i = 0; i < 7; i++) { const fx = x + (i - 3) * 8.5 * s, k = Math.max(0, Math.min(1, flame * 1.4 - Math.abs(i - 3) * 0.12)); if (k <= 0) continue;
      exFlame(c, fx, y - 4 - (1 - sink) * 6 * s, (5 + (i % 2) * 2) * s * k, (24 + 10 * Math.sin(t / 90 + i * 1.7) + (i % 3) * 6) * s * k, Math.sin(t / 120 + i) * 3 * s); }
    for (let i = 0; i < 6; i++) { const k = (u * 1.2 + i / 6) % 1, sx = x + (i - 2.5) * 8 * s + Math.sin(t / 400 + i) * 4, sy = y - 40 * s - k * 50 * s; c.globalAlpha = (1 - k) * 0.45 * Math.min(1, u * 3); c.fillStyle = '#6b6461'; c.beginPath(); c.arc(sx, sy, (4 + k * 8) * s, 0, 7); c.fill(); }
    for (let i = 0; i < 14; i++) { const k = (i * 0.37 + u * 1.6) % 1, ex = x - 26 * s + (i * 13 % 52) * s + Math.sin(t / 200 + i) * 3, ey = y - 6 - k * 70 * s; c.globalAlpha = (1 - k) * flame; c.fillStyle = i % 3 ? '#ff9a3c' : '#ffe08a'; c.beginPath(); c.arc(ex, ey, 1.5 * s, 0, 7); c.fill(); }
  } else if (how === 'shred') {   // cut into three slices along the claw marks, which slide apart and drop
    const e = Math.max(0, (u - 0.1) / 0.9), fall = e * e, fade = 1 - Math.max(0, u - 0.7) / 0.3, ang = 0.75, ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i < 4; i++) { c.save(); c.globalAlpha = Math.max(0, fade); c.translate(x, y - 24 * s); c.rotate(ang);
      const b0 = -60 + i * 30 * s, dir = i % 2 ? 1 : -1; c.translate(dir * fall * 10 * s, fall * 6 * s); c.beginPath(); c.rect(-90, b0 - (i ? 0 : 60), 180, i === 3 ? 120 : 30 * s + (i ? 0 : 60)); c.rotate(-ang); c.translate(-x, -(y - 24 * s));
      c.translate(0, fall * (10 + i * 14) * s); c.clip(); XA.bramble(c, x, y, s); c.restore(); }
  } else if (how === 'blast') {
    const e = 1 - Math.pow(1 - u, 2), fade = 1 - Math.max(0, u - 0.6) / 0.4;
    for (const side of [-1, 1]) { c.save(); c.globalAlpha = Math.max(0, fade); const px = x + side * 30 * s; c.translate(px + side * e * 50 * s, y - Math.sin(u * Math.PI) * 24 * s); c.rotate(side * e * 0.9); c.translate(-px, -y);
      c.beginPath(); side < 0 ? c.rect(x - 120, y - 140, 120, 150) : c.rect(x, y - 140, 120, 150); c.clip(); XA.bramble(c, x, y, s); c.restore(); }
    for (let i = 0; i < 14; i++) { const a = -0.3 - i * 0.2, v = (40 + (i % 4) * 16) * s, lx = x + Math.cos(a) * v * e * (i % 2 ? 1 : -1), ly = y - 30 * s + Math.sin(a) * v * e + 50 * u * u * s;
      c.save(); c.globalAlpha = Math.max(0, fade); c.translate(lx, ly); c.rotate(u * 8 + i); c.fillStyle = i % 3 ? '#5f9a3e' : '#7fb24a'; c.beginPath(); c.ellipse(0, 0, 4 * s, 2 * s, 0, 0, 7); c.fill(); c.restore(); }
  } else {
    const ax = x - 34 * s, ay = y - 30 * s, bx = x + 34 * s, by = y - 12 * s, e = Math.max(0, (u - 0.2) / 0.8), fall = e * e, fade = 1 - Math.max(0, u - 0.75) * 4;
    c.globalAlpha = Math.max(0, fade);
    c.save(); c.beginPath(); c.moveTo(ax - 40, ay); c.lineTo(bx + 40, by + (by - ay) * 40 / (bx - ax)); c.lineTo(bx + 40, y + 10); c.lineTo(ax - 40, y + 10); c.closePath(); c.clip(); XA.bramble(c, x, y, s); c.restore();   // the stumps
    c.save(); c.translate(fall * 30 * s, fall * 22 * s); c.translate(x, y - 20 * s); c.rotate(fall * 1.1); c.translate(-x, -(y - 20 * s));
    c.beginPath(); c.moveTo(ax - 40, ay); c.lineTo(bx + 40, by + (by - ay) * 40 / (bx - ax)); c.lineTo(bx + 40, y - 120 * s); c.lineTo(ax - 40, y - 120 * s); c.closePath(); c.clip(); XA.bramble(c, x, y, s); c.restore();
    c.globalAlpha = 1; for (let i = 0; i < 3; i++) { const k = Math.min(1, u * 4) , a = Math.max(0, 1 - u * 2.5); if (a <= 0) break; const o = (i - 1) * 7 * s;
      c.globalAlpha = a; c.strokeStyle = 'rgba(185,196,207,.6)'; c.lineWidth = 6 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(ax + o, ay - o * 0.4); c.lineTo(ax + o + (bx - ax) * k, ay - o * 0.4 + (by - ay) * k); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 2 * s; c.stroke(); }
  }
  c.restore();
}
/* the dart totem under ice or dripping water */
function exCoat(c, x, y, s, el, a, t) {
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  if (el === 'Frost') { c.fillStyle = 'rgba(190,232,255,.55)'; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.5;
    XA.poly(c, [[x - 13 * s, y], [x - 14 * s, y - 34 * s], [x - 11 * s, y - 49 * s], [x - 2 * s, y - 54 * s], [x + 9 * s, y - 51 * s], [x + 13 * s, y - 40 * s], [x + 13 * s, y]]); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x - 7 * s, y - 46 * s); c.lineTo(x - 3 * s, y - 34 * s); c.moveTo(x + 7 * s, y - 42 * s); c.lineTo(x + 4 * s, y - 28 * s); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.roundRect(x - 11 * s, y - 46 * s, 3 * s, 30 * s, 1.5 * s); c.fill();
    for (const [dx, dy, h] of [[-10, 26, 7], [-10, 9, 6], [-2, 3, 5], [6, 3, 6]]) { c.fillStyle = 'rgba(225,246,255,.9)'; c.beginPath(); c.moveTo(x + (dx - 1.6) * s, y - dy * s); c.lineTo(x + dx * s, y - (dy - h) * s); c.lineTo(x + (dx + 1.6) * s, y - dy * s); c.fill(); }
    for (const dx of [-18, -15, 16, 19]) { c.fillStyle = 'rgba(225,246,255,.8)'; c.beginPath(); c.moveTo(x + (dx - 2) * s, y); c.lineTo(x + dx * s, y - 5 * s); c.lineTo(x + (dx + 2) * s, y); c.fill(); } }
  else { c.fillStyle = 'rgba(62,160,224,.35)'; c.beginPath(); c.ellipse(x, y - 1, 26 * s, 4 * s, 0, 0, 7); c.fill();
    for (let i = 0; i < 6; i++) { const k = (t / 700 + i / 6) % 1, dx = (i * 7 - 18) * s; c.fillStyle = '#7cc6f0'; c.beginPath(); c.ellipse(x + dx, y - 48 * s + k * 46 * s, 1.6 * s, 2.4 * s, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(124,198,240,.8)'; c.lineWidth = 2.2 * s; c.lineCap = 'round'; for (const dx of [-9, 3, 12]) { c.beginPath(); c.moveTo(x + dx * s, y - 52 * s); c.quadraticCurveTo(x + (dx + 2) * s, y - 36 * s, x + dx * s, y - 26 * s); c.stroke(); } }
  c.restore();
}
/* the burst where a move lands, drawn for each element */
function exBurst(c, x, y, el, u, seed, p2k) {
  const C = EX_EL_COL[el] || EX_EL_COL.Brawl, R = 30, out = 1 - Math.pow(1 - u, 3), fade = 1 - Math.max(0, u - 0.55) / 0.45; c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const glow = (r, a) => { const g = c.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, C[1]); g.addColorStop(0.4, C[0]); g.addColorStop(1, C[0] + '00'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.globalAlpha = 1; };
  if (el === 'Brawl') { glow(R * out * 1.1, 0.5 * fade); c.globalAlpha = fade; const k = 0.5 + out * 0.8; c.fillStyle = C[0]; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = (i % 2 ? 9 : 24) * k; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill();
    c.fillStyle = C[1]; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + 0.2, r = (i % 2 ? 5 : 13) * k; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill();
    c.strokeStyle = C[1]; c.lineWidth = 3 * (1 - u); c.beginPath(); c.arc(x, y, 12 + out * 34, 0, 7); c.stroke(); }
  else if (el === 'Stone') { for (let i = 0; i < 4; i++) { const sx = x - 24 + i * 15, h = (34 + (i % 2) * 14) * Math.sin(Math.min(1, u * 3) * Math.PI * 0.5) * (1 - Math.max(0, u - 0.6) / 0.4), w = 9 + (i % 2) * 3;
      c.fillStyle = '#7d6f5c'; c.beginPath(); c.moveTo(sx - w, GROUND + 2); c.lineTo(sx - 1, GROUND - h); c.lineTo(sx + w, GROUND + 2); c.fill(); c.fillStyle = '#ab9c82'; c.beginPath(); c.moveTo(sx - 1, GROUND - h); c.lineTo(sx + w, GROUND + 2); c.lineTo(sx + 2, GROUND + 2); c.fill(); }
    c.globalAlpha = fade; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.4, d = out * (18 + i % 3 * 8), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + u * u * 20; c.fillStyle = i % 2 ? '#9a8a74' : '#6e6252'; c.beginPath(); c.moveTo(px - 4, py); c.lineTo(px - 1, py - 4); c.lineTo(px + 4, py - 1); c.lineTo(px + 1, py + 4); c.fill(); } }
  else if (el === 'Blaze') { glow(R * 1.3, 0.55 * fade); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, fx = x + Math.cos(a) * 14 * out, fy = y + Math.sin(a) * 9 * out, h = (16 + (i % 3) * 6) * Math.sin(Math.min(1, u * 1.6) * Math.PI) ;
      c.globalAlpha = fade; c.fillStyle = C[0]; c.beginPath(); c.moveTo(fx - 6, fy); c.quadraticCurveTo(fx - 5, fy - h * 0.6, fx + Math.sin(u * 20 + i) * 2, fy - h); c.quadraticCurveTo(fx + 5, fy - h * 0.6, fx + 6, fy); c.fill();
      c.fillStyle = C[1]; c.beginPath(); c.moveTo(fx - 3, fy); c.quadraticCurveTo(fx, fy - h * 0.55, fx + 3, fy); c.fill(); }
    for (let i = 0; i < 10; i++) { const k = (u * 1.4 + i * 0.1) % 1; c.globalAlpha = (1 - k) * fade; c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(x - 20 + i * 4.4, y - k * 40, 1.6, 0, 7); c.fill(); } }
  else if (el === 'Steel') { c.globalAlpha = fade; for (const [a0, d] of [[-2.4, 1], [-0.7, -1]]) { const sw = Math.min(1, u * 2.6) * 2.2; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 4; c.beginPath(); c.arc(x + d * 4, y, 24, a0, a0 + sw * (d > 0 ? 1 : 1)); c.stroke(); c.strokeStyle = C[0]; c.lineWidth = 8; c.globalAlpha = 0.4 * fade; c.stroke(); c.globalAlpha = fade; }
    for (let i = 0; i < 6; i++) { const a = i * 1.05, d = 8 + out * 22; c.fillStyle = '#fff6c8'; c.fillRect(x + Math.cos(a) * d - 1, y + Math.sin(a) * d - 1, 2.4, 2.4); } }
  else if (el === 'Spark') { glow(R * 1.3, 0.7 * fade * (0.6 + 0.4 * Math.sin(u * 50))); c.globalAlpha = fade; const fl = Math.floor(u * 14);
    if (u < 0.45) for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283 + fl * 0.9, L = (12 + out * 20) / (p2k || 1); exBolt(c, x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, fl * 7 + i, 0.3); }
    for (let i = 0; i < 10; i++) { const a = i * 0.63 + seed % 5, d = (8 + out * 30) / (p2k || 1); c.globalAlpha = fade * (0.5 + 0.5 * Math.sin(u * 60 + i)); c.fillStyle = i % 2 ? '#fff' : '#ffe14d'; c.fillRect(x + Math.cos(a) * d - 1, y + Math.sin(a) * d - 1, 2, 2); } }
  else if (el === 'Charm') { glow(R * 1.2, 0.45 * fade); c.globalAlpha = fade; for (let i = 0; i < 7; i++) { const a = -1.57 + (i - 3) * 0.45, d = 6 + out * 30, hx = x + Math.cos(a) * d, hy = y + Math.sin(a) * d - u * 10, r = 4.5 + (i % 2) * 2;
      c.fillStyle = i % 2 ? C[0] : '#ff6fae'; c.beginPath(); c.moveTo(hx, hy + r); c.bezierCurveTo(hx - r * 1.6, hy - r * 0.2, hx - r * 0.6, hy - r * 1.4, hx, hy - r * 0.4); c.bezierCurveTo(hx + r * 0.6, hy - r * 1.4, hx + r * 1.6, hy - r * 0.2, hx, hy + r); c.fill(); } }
  else if (el === 'Light') { glow(R * (0.6 + out), 0.7 * fade); c.globalAlpha = 0.85 * fade; c.strokeStyle = C[1]; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + u * 0.4; c.lineWidth = i % 2 ? 2 : 3.5; c.beginPath(); c.moveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); c.lineTo(x + Math.cos(a) * (16 + out * 34), y + Math.sin(a) * (16 + out * 34)); c.stroke(); } }
  else if (el === 'Shade') { glow(R * 1.3, 0.45 * fade); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + u * 2.6, d = (6 + (i % 4) * 6) * (0.4 + out), rr = (7 + (i % 3) * 3) * (0.6 + out * 0.6);
      c.globalAlpha = fade * (0.55 + (i % 2) * 0.2); c.fillStyle = i % 3 ? C[0] : '#2e2046'; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.75 - u * 8, rr, 0, 7); c.fill(); }
    c.globalAlpha = fade * 0.9; c.fillStyle = C[1]; for (let i = 0; i < 5; i++) { const a = i * 1.26 - u * 4, d = 10 + out * 18; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, 1.6, 0, 7); c.fill(); } }
  else if (el === 'Frost') { glow(R * 1.1, 0.45 * fade); c.globalAlpha = fade; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, d = 6 + out * 24, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, L = 9;
      c.fillStyle = i % 2 ? C[0] : C[1]; c.beginPath(); c.moveTo(px + Math.cos(a) * L, py + Math.sin(a) * L); c.lineTo(px + Math.cos(a + 1.57) * 3, py + Math.sin(a + 1.57) * 3); c.lineTo(px - Math.cos(a) * L * 0.5, py - Math.sin(a) * L * 0.5); c.lineTo(px - Math.cos(a + 1.57) * 3, py - Math.sin(a + 1.57) * 3); c.fill(); }
    c.strokeStyle = '#fff'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const a = i * 1.05; c.beginPath(); c.moveTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.lineTo(x - Math.cos(a) * 9, y - Math.sin(a) * 9); c.stroke(); } }
  else if (el === 'Tide') { c.globalAlpha = fade; for (const d of [-1, 1]) { c.strokeStyle = C[0]; c.lineWidth = 6; c.beginPath(); c.arc(x + d * 6, y + 6, 10 + out * 18, d > 0 ? -1.4 : -1.75 - 1.6 * out, d > 0 ? -1.4 + 1.6 * out : -1.75); c.stroke(); c.strokeStyle = C[1]; c.lineWidth = 2; c.stroke(); }
    for (let i = 0; i < 10; i++) { const a = -0.3 - i * 0.28, v = 30 + i % 3 * 10, px = x + Math.cos(a) * v * out, py = y + Math.sin(a) * v * out + u * u * 40; c.fillStyle = i % 2 ? C[0] : C[1]; c.beginPath(); c.ellipse(px, py, 2.4, 3.2, 0, 0, 7); c.fill(); } }
  c.restore();
}
/* each element gathers in its own way before the move goes off */
function exChargeDraw(c, x, y, el, u, t) {
  const C = EX_EL_COL[el] || EX_EL_COL.Brawl; u = Math.min(1, Math.max(0, u)); c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const pool = (r, a) => { const g = c.createRadialGradient(x, GROUND, 2, x, GROUND, r); g.addColorStop(0, C[1]); g.addColorStop(0.5, C[0] + '88'); g.addColorStop(1, C[0] + '00'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.ellipse(x, GROUND, r, r * 0.22, 0, 0, 7); c.fill(); c.globalAlpha = 1; };
  const R = k => { const v = Math.sin(k * 127.1 + Math.floor(t / 60) * 311.7) * 43758.5; return v - Math.floor(v); };
  if (el === 'Spark') {   // arcs crawl over its body and jump to the ground
    pool(34, 0.5 + 0.3 * R(1));
    for (let i = 0; i < 4 + Math.floor(u * 4); i++) { const a0 = R(i + 2) * 6.28, r0 = 14 + R(i + 9) * 8; let px = x + Math.cos(a0) * r0, py = y + Math.sin(a0) * r0 * 0.9; const pts = [[px, py]];
      for (let k = 0; k < 4; k++) { px += (R(i * 7 + k) - 0.5) * 16; py += (R(i * 5 + k + 3) - 0.3) * 12; pts.push([px, py]); }
      for (const [w, col] of [[6, C[0] + '66'], [3, C[0]], [1.2, '#fff']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([a, b], k) => k ? c.lineTo(a, b) : c.moveTo(a, b)); c.stroke(); } }
    c.globalAlpha = 0.35 + 0.4 * R(5); const g = c.createRadialGradient(x, y, 2, x, y, 30); g.addColorStop(0, '#fff'); g.addColorStop(1, '#ffe14d00'); c.fillStyle = g; c.fillRect(x - 30, y - 30, 60, 60); }
  else if (el === 'Blaze') { pool(36, 0.6); for (let i = 0; i < 7; i++) { const fx = x + (i - 3) * 6, k = Math.min(1, u * 2 - Math.abs(i - 3) * 0.1); if (k > 0) { c.globalAlpha = 0.85; exFlame(c, fx, GROUND - 2, 4 + (i % 2) * 2, (14 + 10 * Math.sin(t / 80 + i * 1.9)) * k * (1 + u * 0.5), Math.sin(t / 110 + i) * 2); } }
    for (let i = 0; i < 8; i++) { const k = (u * 1.5 + i / 8) % 1; c.globalAlpha = 1 - k; c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(x + Math.sin(i * 2.3 + t / 300) * 18, y + 10 - k * 46, 1.6, 0, 7); c.fill(); } }
  else if (el === 'Steel') { pool(30, 0.4); for (let i = 0; i < 3; i++) { const a = t / 120 + i * 2.09, r = 26 - u * 8; c.save(); c.translate(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.5); c.rotate(a + 1.2);
      const g = c.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, '#8a96a3'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#8a96a3'); c.fillStyle = g; c.beginPath(); c.moveTo(-11, 0); c.quadraticCurveTo(0, -5, 11, -1); c.quadraticCurveTo(0, 2, -11, 0); c.fill(); c.restore(); }
    if ((t / 90 | 0) % 3 === 0) { c.fillStyle = '#fff'; const gx = x + 10, gy = y - 12; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * 0.785, r = i % 2 ? 2 : 9; c.lineTo(gx + Math.cos(a) * r, gy + Math.sin(a) * r); } c.fill(); } }
  else if (el === 'Charm') { pool(30, 0.4); for (let i = 0; i < 9; i++) { const a = i * 0.7 + t / 500, k = ((u * 1.6 + i / 9) % 1), d = 40 * (1 - k) + 6, hx = x + Math.cos(a) * d, hy = y + Math.sin(a) * d * 0.7 - 6, r = 3 + (i % 3);
      c.globalAlpha = k; c.fillStyle = i % 2 ? '#ff6fae' : '#ffc2df'; c.beginPath(); c.moveTo(hx, hy + r); c.bezierCurveTo(hx - r * 1.6, hy - r * 0.2, hx - r * 0.6, hy - r * 1.4, hx, hy - r * 0.4); c.bezierCurveTo(hx + r * 0.6, hy - r * 1.4, hx + r * 1.6, hy - r * 0.2, hx, hy + r); c.fill(); } }
  else if (el === 'Light') { c.globalAlpha = 0.5 * u; const g = c.createLinearGradient(0, y - 70, 0, y + 14); g.addColorStop(0, '#fffbe000'); g.addColorStop(1, '#fffbe0'); c.fillStyle = g; c.fillRect(x - 16, y - 70, 32, 84);
    c.globalAlpha = 0.9; c.strokeStyle = '#ffd76a'; c.lineWidth = 2.5; c.shadowColor = '#ffd76a'; c.shadowBlur = 10; c.beginPath(); c.ellipse(x, y - 26, 12 * u + 2, 3.5, 0, 0, 7); c.stroke(); c.shadowBlur = 0;
    for (let i = 0; i < 10; i++) { const k = (u * 1.3 + i / 10) % 1; c.globalAlpha = (1 - k) * 0.9; c.fillStyle = '#fffbe0'; c.beginPath(); c.arc(x + Math.sin(i * 2.9) * 22, y + 16 - k * 50, 1.8, 0, 7); c.fill(); } }
  else if (el === 'Shade') { c.fillStyle = '#1a1028'; c.globalAlpha = 0.75; c.beginPath(); c.ellipse(x, GROUND, 14 + u * 26, 3 + u * 5, 0, 0, 7); c.fill();
    for (let i = 0; i < 6; i++) { const bx = x + (i - 2.5) * 8, h = (16 + (i % 3) * 8) * u * (0.8 + 0.2 * Math.sin(t / 150 + i)); c.strokeStyle = i % 2 ? '#5a3f86' : '#2e2046'; c.lineWidth = 4; c.globalAlpha = 0.8;
      c.beginPath(); c.moveTo(bx, GROUND); c.bezierCurveTo(bx + 6 * Math.sin(t / 200 + i), GROUND - h * 0.5, bx - 6, GROUND - h * 0.8, bx + 3 * Math.sin(t / 130 + i), GROUND - h); c.stroke(); }
    c.globalAlpha = 0.3; c.fillStyle = '#a68ad6'; c.beginPath(); c.arc(x, y, 22, 0, 7); c.fill(); }
  else if (el === 'Frost') { pool(32, 0.4); c.strokeStyle = '#eaf8ff'; c.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) { const a = i * 0.785 + t / 600, d = 34 - u * 14, fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d * 0.7; c.globalAlpha = 0.9; for (let k = 0; k < 3; k++) { const b = k * 1.047; c.beginPath(); c.moveTo(fx - Math.cos(b) * 4, fy - Math.sin(b) * 4); c.lineTo(fx + Math.cos(b) * 4, fy + Math.sin(b) * 4); c.stroke(); } }
    for (let i = 0; i < 5; i++) { const sx = x + (i - 2) * 9, h = (5 + (i % 2) * 5) * u; c.fillStyle = '#bfe8ff'; c.globalAlpha = 0.85; c.beginPath(); c.moveTo(sx - 3, GROUND); c.lineTo(sx, GROUND - h); c.lineTo(sx + 3, GROUND); c.fill(); } }
  else if (el === 'Tide') { for (let i = 0; i < 3; i++) { const a0 = t / 160 + i * 2.09; c.strokeStyle = i % 2 ? '#3ea0e0' : '#bfe8ff'; c.lineWidth = 4 - i; c.globalAlpha = 0.85;
      c.beginPath(); for (let k = 0; k <= 16; k++) { const a = a0 + k * 0.2, r = 30 - u * 8 - k * 0.6; k ? c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.55) : c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.55); } c.stroke(); }
    for (let i = 0; i < 8; i++) { const a = i + t / 200; c.fillStyle = '#7cc6f0'; c.globalAlpha = 0.8; c.beginPath(); c.ellipse(x + Math.cos(a) * 28, y + Math.sin(a) * 14, 1.6, 2.4, 0, 0, 7); c.fill(); } }
  else if (el === 'Speed') { for (let i = 0; i < 12; i++) { const yy = y - 24 + i * 4.5, k = ((t / 200 + i * 0.37) % 1); c.globalAlpha = 0.7 * (1 - k); c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + 40 - k * 90, yy); c.lineTo(x + 40 - k * 90 - 18 - u * 14, yy); c.stroke(); }
    if (Math.sin(t / 60) > 0.6) { c.fillStyle = '#d8cfc2'; c.globalAlpha = 0.6; c.beginPath(); c.arc(x - 10, GROUND - 3, 5, 0, 7); c.fill(); } }
  else if (el === 'Mind') { c.globalAlpha = 0.5 + 0.3 * u; const g = c.createRadialGradient(x, y - 14, 1, x, y - 14, 28); g.addColorStop(0, '#f1e6ff'); g.addColorStop(1, '#b48cff00'); c.fillStyle = g; c.fillRect(x - 28, y - 42, 56, 56);
    const sig = ['△', '□', '○', '✦', '◇']; c.font = '700 11px system-ui'; c.textAlign = 'center';
    for (let i = 0; i < 5; i++) { const a = t / 400 + i * 1.256, r = 30 - u * 6; c.globalAlpha = 0.85; c.fillStyle = '#d9c4ff'; c.fillText(sig[i], x + Math.cos(a) * r, y - 10 + Math.sin(a) * r * 0.45); } }
  else if (el === 'Insight') { for (let k = 0; k < 3; k++) { const v = ((t / 700) + k / 3) % 1; c.globalAlpha = (1 - v) * 0.7; c.strokeStyle = '#6fe0cc'; c.lineWidth = 2; c.beginPath(); c.ellipse(x + 10 + v * 50, y - 6, 4 + v * 20, 10 + v * 30, 0, -1.2, 1.2); c.stroke(); }
    c.globalAlpha = 0.8; c.fillStyle = '#fff'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * 0.785, r = i % 2 ? 1.5 : 6 * u + 2; c.lineTo(x + 6 + Math.cos(a) * r, y - 14 + Math.sin(a) * r); } c.fill(); }
  else if (el === 'Grit') { pool(34, 0.4); for (let i = 0; i < 4; i++) { const k = ((t / 500) + i / 4) % 1; c.globalAlpha = (1 - k) * 0.6; c.fillStyle = '#f2ece4'; c.beginPath(); c.arc(x + (i % 2 ? 10 : -10) + k * (i % 2 ? 8 : -8), y - 22 - k * 24, 3 + k * 7, 0, 7); c.fill(); }
    c.globalAlpha = 0.25 + 0.2 * Math.sin(t / 70); c.fillStyle = '#ff5a3a'; c.beginPath(); c.arc(x, y, 20, 0, 7); c.fill(); }
  else if (el === 'Stone') { pool(34, 0.5); for (let i = 0; i < 5; i++) { const a = t / 260 + i * 1.256, r = 30 - u * 6, rx = x + Math.cos(a) * r, ry = y + 6 + Math.sin(a) * r * 0.35 - u * 10 - Math.sin(t / 150 + i) * 3;
      c.fillStyle = i % 2 ? '#9a8a74' : '#7d6f5c'; SC.blob(c, rx, ry, [[0, 0, 3.5], [2, 1, 2.5]]); c.fill(); } }
  else { pool(40, 0.5 + 0.4 * u);
    for (let i = 0; i < 16; i++) { const a = i * 2.4 + i * i * 0.13, k = ((u * 2.2 + i * 0.137) % 1), d = 70 * (1 - k) + 8, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.8;
      c.globalAlpha = k * (0.9 - u * 0.2); c.strokeStyle = i % 2 ? C[0] : C[1]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * 12 * (1 - k), py + Math.sin(a) * 10 * (1 - k)); c.stroke(); }
    c.globalAlpha = 0.85; c.strokeStyle = C[1]; c.lineWidth = 3 + u * 2; c.shadowColor = C[0]; c.shadowBlur = 12; c.beginPath(); c.arc(x, y, 46 - u * 26, 0, 7); c.stroke(); }
  c.restore();
}
/* a forked bolt between two points: a wide soft glow, the yellow body and a white core, re-forked every few frames */
function exBolt(c, x1, y1, x2, y2, seed, w = 1) {
  const R = k => { const v = Math.sin(k * 91.7 + seed * 13.1) * 43758.5; return v - Math.floor(v); }, n = 9, pts = [[x1, y1]], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 1; i < n; i++) { const f = i / n, j = (R(i) - 0.5) * L * 0.22 * Math.sin(f * Math.PI); pts.push([x1 + dx * f + nx * j, y1 + dy * f + ny * j]); } pts.push([x2, y2]);
  const path = P => { c.beginPath(); P.forEach(([a, b], k) => k ? c.lineTo(a, b) : c.moveTo(a, b)); };
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [lw, col, blur] of [[14 * w, 'rgba(255,225,77,.25)', 18], [6 * w, '#ffe14d', 8], [2.4 * w, '#ffffff', 0]]) { c.strokeStyle = col; c.lineWidth = lw; c.shadowColor = '#ffe14d'; c.shadowBlur = blur; path(pts); c.stroke();
    for (let b = 2; b < n - 1; b += 3) { const [bx, by] = pts[b], br = [[bx, by]]; let px = bx, py = by; for (let k = 0; k < 3; k++) { px += dx / n * 0.6 + nx * (R(b * 9 + k) - 0.3) * 18; py += dy / n * 0.6 + ny * (R(b * 5 + k) - 0.3) * 18; br.push([px, py]); }
      c.lineWidth = lw * 0.5; path(br); c.stroke(); } }
  c.restore();
}
/* what a cast or thrown move looks like in the air, one per element */
function exShot(c, p, u, t) {
  const { x, y, x2, y2, el } = p, C = EX_EL_COL[el] || EX_EL_COL.Brawl, hx = x + (x2 - x) * u, hy = y + (y2 - y) * u - Math.sin(u * Math.PI) * (el === 'Charm' ? 16 : 0), a = Math.atan2(y2 - y, x2 - x);
  c.save(); c.lineCap = 'round';
  if (el === 'Spark') { const flick = Math.floor(t / 40); exBolt(c, x, y, x + (x2 - x) * Math.min(1, u * 1.2), y + (y2 - y) * Math.min(1, u * 1.2), flick, 1.2); if (u >= 1) exBolt(c, x, y - 4, x2, y2 + 4, flick + 7, 0.6); }
  else if (el === 'Light') { const w = 10 + 6 * Math.sin(t / 40); c.translate(x, y); c.rotate(a); const L = Math.hypot(x2 - x, y2 - y) * Math.min(1, u * 1.3);
    const g = c.createLinearGradient(0, -w, 0, w); g.addColorStop(0, '#ffd76a00'); g.addColorStop(0.3, '#ffd76a'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(0.7, '#ffd76a'); g.addColorStop(1, '#ffd76a00');
    c.fillStyle = g; c.shadowColor = '#ffd76a'; c.shadowBlur = 20; c.fillRect(0, -w, L, w * 2); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, w * 0.9, 0, 7); c.fill(); }
  else if (el === 'Tide') { c.translate(x, y); c.rotate(a); const L = Math.hypot(x2 - x, y2 - y) * Math.min(1, u * 1.2);
    for (const [w, col] of [[11, '#2f86c9'], [7, '#3ea0e0'], [3, '#d6f1ff']]) { c.fillStyle = col; c.beginPath(); c.moveTo(0, -w * 0.5); for (let k = 0; k <= 12; k++) { const xx = L * k / 12; c.lineTo(xx, -w * (0.5 + 0.3 * k / 12) + Math.sin(t / 50 + k) * 1.5); } for (let k = 12; k >= 0; k--) { const xx = L * k / 12; c.lineTo(xx, w * (0.5 + 0.3 * k / 12) + Math.sin(t / 60 + k * 1.3) * 1.5); } c.fill(); }
    for (let i = 0; i < 6; i++) { c.fillStyle = '#bfe8ff'; c.beginPath(); c.arc(L * ((t / 300 + i / 6) % 1), Math.sin(i * 3 + t / 70) * 6, 1.6, 0, 7); c.fill(); } }
  else if (el === 'Shade') { for (let i = 0; i < 6; i++) { const k = i / 6, tx = hx - Math.cos(a) * k * 30, ty = hy - Math.sin(a) * k * 30 + Math.sin(t / 60 + i) * 3; c.globalAlpha = (1 - k) * 0.6; c.fillStyle = i % 2 ? '#5a3f86' : '#2e2046'; c.beginPath(); c.arc(tx, ty, 9 - k * 6, 0, 7); c.fill(); }
    c.globalAlpha = 1; const g = c.createRadialGradient(hx - 3, hy - 3, 1, hx, hy, 13); g.addColorStop(0, '#5a3f86'); g.addColorStop(0.7, '#1a1028'); g.addColorStop(1, '#a68ad6'); c.fillStyle = g; c.beginPath(); c.arc(hx, hy, 13, 0, 7); c.fill(); c.strokeStyle = '#a68ad6'; c.lineWidth = 2; c.stroke(); }
  else if (el === 'Frost') { for (let i = 0; i < 3; i++) { const v = Math.max(0, Math.min(1, u * 1.3 - i * 0.15)), ix = x + (x2 - x) * v, iy = y + (y2 - y) * v + (i - 1) * 9; c.save(); c.translate(ix, iy); c.rotate(a);
      const g = c.createLinearGradient(-18, 0, 8, 0); g.addColorStop(0, '#8fd3ff00'); g.addColorStop(1, '#eaf8ff'); c.fillStyle = g; c.fillRect(-26, -2, 20, 4); c.fillStyle = '#bfe8ff'; c.strokeStyle = '#fff'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(10, 0); c.lineTo(-8, -4.5); c.lineTo(-6, 0); c.lineTo(-8, 4.5); c.closePath(); c.fill(); c.stroke(); c.restore(); } }
  else if (el === 'Charm') { const r = 10 + Math.sin(t / 60) * 1.5; c.translate(hx, hy); c.rotate(Math.sin(t / 90) * 0.3); c.shadowColor = '#ff8fc4'; c.shadowBlur = 14; c.fillStyle = '#ff6fae';
    c.beginPath(); c.moveTo(0, r); c.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.6, -r * 1.4, 0, -r * 0.4); c.bezierCurveTo(r * 0.6, -r * 1.4, r * 1.6, -r * 0.2, 0, r); c.fill(); c.fillStyle = '#ffd6ea'; c.beginPath(); c.arc(-r * 0.45, -r * 0.45, r * 0.22, 0, 7); c.fill(); }
  else { c.shadowColor = C[0]; c.shadowBlur = 14; c.strokeStyle = C[0]; c.lineWidth = 12; c.globalAlpha = 0.6; const tx = x + (x2 - x) * Math.max(0, u - 0.45), ty = y + (y2 - y) * Math.max(0, u - 0.45);
    c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx, hy); c.stroke(); c.globalAlpha = 1;
    if (el === 'Blaze') { c.save(); c.translate(hx, hy); c.rotate(a - Math.PI / 2); exFlame(c, 0, 0, 9, 30, Math.sin(t / 40) * 3); c.restore(); }
    c.fillStyle = C[1]; c.beginPath(); c.arc(hx, hy, 9, 0, 7); c.fill(); }
  c.restore();
}
/* three steel claws raked through on a slant: tapered blades of light that leave glowing gouges and sparks */
function exClaw(c, x, y, u, t) {
  c.save(); c.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const o = (i - 1) * 22, draw = Math.min(1, u * 5 - i * 0.25), fade = 1 - Math.max(0, u - 0.4) / 0.6; if (draw <= 0) continue;
    const x0 = x - 40 + o, y0 = y - 34 + o * 0.3, x1 = x + 36 + o, y1 = y + 30 + o * 0.3, mx = x + o + 14, my = y - 4 + o * 0.3, n = 18, pts = [];
    for (let k = 0; k <= n * draw; k++) { const f = k / n, qx = (1 - f) * (1 - f) * x0 + 2 * (1 - f) * f * mx + f * f * x1, qy = (1 - f) * (1 - f) * y0 + 2 * (1 - f) * f * my + f * f * y1; pts.push([qx, qy, Math.sin(f * Math.PI)]); }
    for (const [w, col, blur] of [[12, 'rgba(185,196,207,.35)', 14], [6, '#dfe6ee', 6], [2.4, '#ffffff', 0]]) { c.globalAlpha = fade; c.strokeStyle = col; c.shadowColor = '#cfe6ff'; c.shadowBlur = blur;
      for (let k = 1; k < pts.length; k++) { c.lineWidth = w * (0.2 + pts[k][2] * 0.8); c.beginPath(); c.moveTo(pts[k - 1][0], pts[k - 1][1]); c.lineTo(pts[k][0], pts[k][1]); c.stroke(); } }
    if (draw >= 1) for (let k = 0; k < 5; k++) { const v = Math.min(1, (u - 0.2) * 2), a = -0.6 + k * 0.35 + i, d = 10 + v * 30; c.globalAlpha = (1 - v) * fade; c.fillStyle = k % 2 ? '#fff6c8' : '#ffffff'; c.fillRect(x1 + Math.cos(a) * d - 1.5, y1 - 10 + Math.sin(a) * d - 1.5, 3, 3); } }
  c.restore();
}
/* stone spikes thrust up from the ground under the target */
function exSpikes(c, x, y, h) {
  if (h <= 0) return; c.save();
  c.fillStyle = 'rgba(40,28,18,.35)'; c.beginPath(); c.ellipse(x, y + 1, 34, 5, 0, 0, 7); c.fill();
  for (const [dx, H, w] of [[-20, 30, 9], [-6, 46, 12], [10, 40, 11], [22, 26, 8]]) { const hh = H * h; c.fillStyle = '#7d6f5c'; c.beginPath(); c.moveTo(x + dx - w, y + 2); c.lineTo(x + dx - 1, y - hh); c.lineTo(x + dx + w, y + 2); c.fill();
    c.fillStyle = '#ab9c82'; c.beginPath(); c.moveTo(x + dx - 1, y - hh); c.lineTo(x + dx + w, y + 2); c.lineTo(x + dx + 2, y + 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(x + dx - 1, y - hh); c.lineTo(x + dx - w * 0.4, y - hh * 0.4); c.lineTo(x + dx - 1, y - hh * 0.5); c.fill(); }
  c.restore();
}
/* comic impact lines bursting out from where the hit lands */
function exLines(c, x, y, u) {
  c.save(); c.globalAlpha = 1 - u; c.fillStyle = '#fff'; c.strokeStyle = 'rgba(40,30,20,.6)'; c.lineWidth = 1;
  for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283 + (i % 2) * 0.1, r0 = 22 + u * 30, r1 = r0 + 30 + (i % 3) * 16, w = 0.07;
    c.beginPath(); c.moveTo(x + Math.cos(a - w) * r0, y + Math.sin(a - w) * r0); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); c.lineTo(x + Math.cos(a + w) * r0, y + Math.sin(a + w) * r0); c.closePath(); c.fill(); c.stroke(); }
  c.restore();
}
/* the door's three runes lifted off and circling, then locking back one at a time */
function exGlyphs(c, x, y, u, lock, bad, t) {
  const home = [[x - 8, y - 35, 'tri', '#e2483f'], [x + 8, y - 35, 'sq', '#4878c4'], [x, y - 19, 'circ', '#f2c14e']];
  c.save();
  home.forEach(([hx, hy, sh, col], i) => { const a = t / 300 + i * 2.09, ox = x + Math.cos(a) * 34, oy = y - 34 + Math.sin(a) * 18, out = Math.min(1, u * 2.5), back = Math.min(1, Math.max(0, lock - i));
    const px = hx + (ox - hx) * out * (1 - back), py = hy + (oy - hy) * out * (1 - back), cc = bad ? '#ff3b3b' : col, r = 6 + 2 * out * (1 - back);
    const g = c.createRadialGradient(px, py, 1, px, py, r * 3); g.addColorStop(0, cc + 'cc'); g.addColorStop(1, cc + '00'); c.fillStyle = g; c.fillRect(px - r * 3, py - r * 3, r * 6, r * 6);
    c.fillStyle = cc; c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.beginPath();
    if (sh === 'tri') { c.moveTo(px, py - r); c.lineTo(px + r, py + r * 0.8); c.lineTo(px - r, py + r * 0.8); c.closePath(); } else if (sh === 'sq') c.rect(px - r * 0.8, py - r * 0.8, r * 1.6, r * 1.6); else c.arc(px, py, r * 0.85, 0, 7);
    c.fill(); c.stroke(); });
  c.restore();
}
/* a column of light over the Snabit when a lesson takes */
function exPillar(c, x, y, u, t) {
  if (u <= 0) return; c.save(); const w = 26 * Math.min(1, u * 3) * (1 - Math.max(0, u - 0.7) / 0.3), g = c.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, '#fff6c800'); g.addColorStop(0.5, '#fffbe8'); g.addColorStop(1, '#fff6c800'); c.globalAlpha = 0.85; c.fillStyle = g; c.fillRect(x - w, y - 260, w * 2, 262);
  for (let i = 0; i < 10; i++) { const k = (u * 1.5 + i / 10) % 1; c.globalAlpha = (1 - k) * 0.9; c.fillStyle = '#fff'; c.beginPath(); c.arc(x + Math.sin(i * 3 + t / 200) * w * 0.8, y - k * 150, 1.8, 0, 7); c.fill(); }
  c.restore();
}
/* ---------- a chest: it rattles, light leaks from the seams, the lid bursts open and the find rises out ---------- */
const EX_ITEM_COL = { Berry: '#e2483f', 'Energy nut': '#a8692e', 'Honey cake': '#f2b33d', 'Cool leaf': '#5fbf6a', Medicine: '#f4f4f4', Candy: '#ff8fc4', 'Stat seed': '#ffd23f', 'Lucky bit': '#f2c14e', 'Element stone': '#a77ef0' };
function exChestDraw(c, p, t) {
  const s = p.s || 1.4, sh = p.shake ? Math.sin(t / 25) * p.shake : 0; c.save(); c.translate(p.x + sh, p.y); c.rotate(sh * 0.02); c.translate(-(p.x + sh), -p.y);
  XA.chest(c, p.x + sh, p.y, p.open, t, s);
  if (!p.open && p.glow > 0) { const W = 30 * s, top = p.y - 17 * s; c.globalAlpha = p.glow; c.strokeStyle = '#fff2b0'; c.lineWidth = 2; c.shadowColor = '#ffd76a'; c.shadowBlur = 12;
    c.beginPath(); c.moveTo(p.x - W / 2 + 2, top); c.lineTo(p.x + W / 2 - 2, top); c.stroke();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.3, L = 10 + 14 * p.glow + Math.sin(t / 60 + i) * 3; c.globalAlpha = p.glow * 0.6; c.beginPath(); c.moveTo(p.x + (i - 2) * 6, top); c.lineTo(p.x + (i - 2) * 6 + Math.cos(a) * L, top + Math.sin(a) * L); c.stroke(); } }
  c.restore();
}
function exItemDraw(c, p, t) {
  const u = Math.min(1, p.u || 0), x = p.x, y = p.y - 50 * (1 - Math.pow(1 - u, 3)) + Math.sin(t / 200) * 2 * u, col = EX_ITEM_COL[p.item] || '#ffd23f', r = 9 + 3 * u; c.save();
  const g = c.createRadialGradient(x, y, 2, x, y, 34); g.addColorStop(0, '#fffbe0'); g.addColorStop(0.4, '#ffd76a88'); g.addColorStop(1, '#ffd76a00'); c.fillStyle = g; c.fillRect(x - 34, y - 34, 68, 68);
  c.strokeStyle = '#fff6c8'; c.lineWidth = 2; for (let i = 0; i < 10; i++) { const a = i * 0.628 + t / 900, r0 = 14, r1 = 22 + 6 * Math.sin(t / 150 + i); c.globalAlpha = 0.7; c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); c.stroke(); }
  c.globalAlpha = 1; SC.depth(c, () => { c.beginPath(); c.arc(x, y, r, 0, 7); }, col, 1.5, 0.3); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, 7); c.fill();
  c.restore();
}
async function exChest(item, big) {
  const s = RS, ch = prop({ k: 'chest2', x: 150, y: GROUND, s: big ? 1.8 : 1.4, open: false, glow: 0, shake: 0 }); await walkTo(118, 60, 'walk'); s.pose = 'idle';
  exFocus(140, 1.75); exDim(0.35); spark(s.x, headY() - 8, 'q'); await rwait(500);
  try {
    for (let i = 0; i < 3; i++) { ch.shake = 2 + i; rsfx('rattle'); await rwait(260); ch.shake = 0; await rwait(160); }
    exSfx('charge'); ch.shake = 1.5; await exTween(700, u => { ch.glow = u; }); ch.shake = 0;
    ch.open = true; ch.glow = 0; rsfx('creak'); exSfx('rays'); exFlash('#fff2b0', 0.7, 320); exShake(4, 300); prop({ k: 'exburst', el: 'Light', x: 150, y: GROUND - 30, t0: exNow(), k2: big ? 1.5 : 1.1 });
    const it = prop({ k: 'exitem', item, x: 150, y: GROUND - 24, u: 0 }); s.pose = 'happy'; await exTween(600, u => { it.u = u; });
    exSfx('win'); spark(150, GROUND - 74, 'sparkle', 10); banner(`${/^[AEIOU]/.test(item) ? 'An' : 'A'} ${item}!`, '#ffe9a8'); await hop(10, 300); await rwait(900); banner(''); unprop(it);
  } finally { exCalm(); unprop(ch); }
}

/* ---------- the secret fight at the end of an expedition: a wild Snabit that has followed them, fought on its own ---------- */
// the grade it comes at: up to the ranch's own, one above when the Snabit's stats are strong enough for it, and the
// strongest one its stats suit within that
function exSecretFoe(s, reg) {
  const ri = Math.min(5, rankIdx()), f = playerFighter(s), avg = ['pow', 'grd', 'mnd', 'spr', 'spd'].reduce((a, k) => a + f.base[k], 0) / 5;
  let cap = ri; if (ri < 5 && avg >= exNeed(GRADES[ri + 1]) * 0.95) cap = ri + 1;
  let g = 0; for (let i = 0; i <= cap; i++) if (exNeed(GRADES[i]) <= avg * 1.1) g = i;
  if (g > 0 && Math.random() < 0.3) g--;
  const grade = GRADES[g], G = GRADE_INFO[grade], over = clamp(avg / exNeed(grade) - 0.9, 0, 0.6) / 0.6, lv = Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * over);
  const foe = gradedOpponent(grade, lv, Math.random, reg.rift ? null : reg.el); return { foe, grade };
}
async function exSecret(reg, nm, K, found) {
  const s = RS; if (Math.random() > 0.5) return;
  const { foe, grade } = exSecretFoe(s, reg), G = GRADE_INFO[grade], prize = Math.round(G.purse * 0.75);
  await sceneFade(true, 300); s.props = []; s.x = 80; s.dusk = 1; s.camJump = true; await sceneFade(false, 400);
  const bush = prop({ k: 'xbush', x: 190, y: GROUND, col: '#3f6a2e', shake: 1 }); K('Wait. Something has been following us.'); exSfx('rumble'); await rwait(1400);
  exFocus(140, 1.5); exDim(0.5); bush.shake = 0; const fp = prop({ k: 'foe', x: 190, y: GROUND, grid: foe.fm.grid, pal: foe.fm.pal, fm: foe.fm, jy: 0 });
  prop({ k: 'exlines', x: 175, y: GROUND - 30, t0: exNow() }); exSfx('growl'); exSfx('impact'); exFlash('#ffffff', 0.6, 260); exShake(8, 500);
  await exTween(420, u => { fp.x = 190 - 20 * u; fp.jy = -Math.sin(u * Math.PI) * 30; }); fp.jy = 0; await exFreeze(140);
  banner('A secret fight', '#ff8a5c'); K(`A wild ${foe.m.name} jumped out of the bushes!`); await rwait(1800); banner(''); exCalm();
  await sceneFade(true, 400); let won = false;
  await new Promise(done => arenaFight({ s: fightSnapshot(s), foe, mode: 'auto', title: 'Secret fight', noDraw: true, onEnd: r => { won = !!(r && r.winner === 0); done(); } }));
  unprop(fp); unprop(bush); s.trip = true; s.camJump = true; s.pose = won ? 'happy' : 'tired'; await sceneFade(false, 400);
  if (won) { PLAYER.bits += prize; drawUI(); found.push(`${prize.toLocaleString()} bits`); exSfx('win'); spark(s.x, headY() - 6, 'sparkle', 10); await hop(14, 360);
    K(`${nm} won the secret fight, and the League pays ${prize.toLocaleString()} bits for a ${foe.m.name} like that.`); await rwait(2200); }
  else { s.stress += 4; clampAll(); K(`That ${foe.m.name} was too much for ${nm} this time.`); await rwait(2000); }
  s.dusk = 0;
}

/* map icons and props for the teacher's camp and a stop on the path */
function exTent(c, x, y, s) {
  SC.depth(c, () => { c.beginPath(); c.moveTo(x - 20 * s, y); c.lineTo(x, y - 26 * s); c.lineTo(x + 20 * s, y); c.closePath(); }, '#d9a14a', 2 * s, 0.3);
  c.fillStyle = '#5a3a1e'; c.beginPath(); c.moveTo(x - 6 * s, y); c.lineTo(x, y - 14 * s); c.lineTo(x + 6 * s, y); c.fill();
  c.strokeStyle = '#5a3a1e'; c.lineWidth = 1.6 * s; c.beginPath(); c.moveTo(x, y - 26 * s); c.lineTo(x, y - 36 * s); c.stroke(); c.fillStyle = '#c8553d'; c.beginPath(); c.moveTo(x, y - 36 * s); c.lineTo(x + 9 * s, y - 33 * s); c.lineTo(x, y - 30 * s); c.fill();
}
function exSign(c, x, y, s) {
  c.fillStyle = '#7a5530'; c.fillRect(x - 1.6 * s, y - 24 * s, 3.2 * s, 24 * s);
  SC.depth(c, () => { c.beginPath(); c.moveTo(x - 12 * s, y - 24 * s); c.lineTo(x + 9 * s, y - 24 * s); c.lineTo(x + 14 * s, y - 19 * s); c.lineTo(x + 9 * s, y - 14 * s); c.lineTo(x - 12 * s, y - 14 * s); c.closePath(); }, '#c99a5c', 1.5 * s, 0.3);
  c.strokeStyle = 'rgba(90,60,30,.6)'; c.lineWidth = 1 * s; c.beginPath(); c.moveTo(x - 8 * s, y - 19 * s); c.lineTo(x + 7 * s, y - 19 * s); c.stroke();
}

/* ---------- the teacher's camp ---------- */
async function exTeach(reg, st, nm, K, found) {
  const s = RS, tName = TEACHER[reg.el][0], tThe = /^The /.test(tName) ? tName : 'the ' + tName, Cap = t => t[0].toUpperCase() + t.slice(1);
  const tp = prop({ k: 'teacher', el: reg.el, x: 186, y: GROUND, keep: true }); await walkTo(128, 60, 'walk'); s.pose = 'idle';
  if (!st.teachSeen) { st.teachSeen = true; banner(Cap(tName), '#fff'); }
  K(`${Cap(tThe)} has a camp up here.`); await rwait(1500); banner('');
  const opts = tripOptions(s, reg).filter(x => x.chainOk && x.score >= x.need);
  if (!opts.length) { K(`${Cap(tThe)} watched ${nm} for a while and says it isn't ready for anything new.`); s.pose = 'sad'; await rwait(2200); unprop(tp); return; }
  const x = opts[Math.floor(Math.random() * opts.length)], got = Math.random() * 100 < Math.min(70, 35 + Math.floor((x.score - x.need) / 4)), el = reg.el;
  banner('Special training', '#ffd23f'); K(`${Cap(tThe)} will show ${nm} how to do ${x.n}.`); await rwait(1300); banner('');
  try {
    // the teacher shows it first
    exFocus(158, 1.45); exDim(0.45); let ch = prop({ k: 'excharge', el, x: 186, y: GROUND - 30, t0: exNow() }); exSfx('charge'); if (typeof elSfx === 'function') elSfx(el, 'cast'); await rwait(800); unprop(ch);
    prop({ k: 'exburst', el, x: 150, y: GROUND - 26, t0: exNow(), k2: 1.4 }); prop({ k: 'exlines', x: 150, y: GROUND - 26, t0: exNow() }); exSfx(EX_EL_SFX[el] || 'impact'); exFlash('#ffffff', 0.5, 220); exShake(6, 400); await rwait(900);
    // then the Snabit tries, twice short and once for real
    for (let k = 0; k < 3; k++) { s.pose = 'effort'; ch = prop({ k: 'excharge', el, x: s.x, y: GROUND - 14, t0: exNow() }); exSfx('charge'); await rwait(k < 2 ? 450 : 800); unprop(ch);
      s.pose = 'attack'; if (k < 2) { spark(s.x + 16, headY() + 6, 'smoke', 3); exSfx('fizzle'); await rwait(420); continue; }
      if (got) { prop({ k: 'exburst', el, x: s.x + 30, y: GROUND - 20, t0: exNow(), k2: 1.3 }); exSfx(EX_EL_SFX[el] || 'impact'); exShake(5, 300); await exFreeze(110); }
      else { spark(s.x + 16, headY() + 6, 'smoke', 5); exSfx('fizzle'); } }
    if (got) { if (x.fam) s.famMoves = (s.famMoves || []).concat(x.n); else { s.skillsKnown = (s.skillsKnown || []).concat(x.n); bookMark(s, x.n, 'learned'); }
      found.push(`a new move, ${x.n}`); const pl = prop({ k: 'expillar', x: s.x, y: GROUND, t0: exNow() }); exSfx('learn'); exFlash('#fffbe0', 0.6, 400); s.pose = 'happy'; await hop(14, 360);
      banner(`Learned ${x.n}!`, '#7dff9a'); K(`${nm} has learned ${x.n}.`); spark(s.x, headY() - 6, 'sparkle', 10); await rwait(1700); banner(''); unprop(pl); }
    else { banner('Not yet', '#ff8a8a'); K(`${nm} couldn't get ${x.n} this time.`); s.pose = 'sad'; await rwait(1500); banner(''); }
  } finally { exCalm(); }
  unprop(tp);
}

/* ---------- a stop on the path ---------- */
function exChoose(opts) {
  return new Promise(res => {
    const P = el('r-panel'), h = el('ex-home'); if (h) h.style.display = 'none';
    const box = document.createElement('div'); box.className = 'full'; box.style.cssText = 'display:flex;gap:6px';
    box.innerHTML = opts.map((o, i) => `<button class="rb" style="flex:1" data-c="${i}">${o[0]}<small>${o[1]}</small></button>`).join(''); P.appendChild(box);
    box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { box.remove(); if (h) h.style.display = ''; res(+b.dataset.c); });
  });
}
/* returns the energy it gave or took */
async function exStop(reg, n, nm, K, found, force) {
  const s = RS, R = rng(hashStr('exstop|' + reg.n + n.id + exSeason())), g = exGrade(reg), G = GRADE_INFO[g];
  const pool = ['hurt', 'shortcut', 'camp', 'stuck'];
  if (typeof rookMon === 'function' && typeof story === 'function' && story().seen.intro && PLAYER.rookEx !== exSeason()) pool.push('rook', 'rook');
  const kind = force || pool[Math.floor(R() * pool.length)];
  if (kind === 'hurt') {
    const o = gradedOpponent(g, G.lv[0], R, null), fp = prop({ k: 'foe', x: 168, y: GROUND, fm: o.fm, grid: o.fm.grid, pal: o.fm.pal, pose: 'sleep' }); await walkTo(120, 60, 'walk'); s.pose = 'idle';
    K(`A League scout's ${o.m.name} is lying by the trail with a hurt leg. The tag on its collar says its scout went on ahead.`);
    const c = await exChoose([['Carry it to the scouts', '2 energy'], ['Leave it for its scout', 'Keep going']]);
    if (c) { K('We left it where its scout will find it.'); await rwait(1400); unprop(fp); return 0; }
    const pay = Math.round(G.purse * 0.5); fp.pose = 'walk'; fp.right = true; s.pose = 'walk';
    await exTween(1300, u => { s.x = 120 + u * 120; fp.x = 168 + u * 120; }); unprop(fp); s.pose = 'happy';
    PLAYER.bits += pay; drawUI(); found.push(`${pay.toLocaleString()} bits`); K(`${nm} carried it to the scouts' camp, and the League paid ${pay.toLocaleString()} bits for bringing it back.`); await rwait(2400); return -2; }
  if (kind === 'shortcut') {
    const sg = prop({ k: 'sign', x: 160, y: GROUND, s: 1.3 }); await walkTo(126, 60, 'walk'); s.pose = 'idle';
    K("There's an old sign here pointing off the trail. It might be a shortcut.");
    const c = await exChoose([['Follow the sign', 'Could save time or waste it'], ['Stay on the trail', 'Keep going']]); unprop(sg);
    if (c) { K('We stayed on the trail.'); await rwait(1100); return 0; }
    await walkTo(230, 80, 'walk');
    if (R() < 0.6) { s.pose = 'happy'; K(`The sign was right, and the shortcut saved ${nm} a long walk.`); await rwait(2000); return 2; }
    s.pose = 'tired'; K(`The sign led to a cliff, and ${nm} had a long walk back.`); await rwait(2200); return -2; }
  if (kind === 'camp') {
    const fire = prop({ k: 'fire', x: 160, y: GROUND }); await walkTo(122, 60, 'walk'); s.pose = 'idle';
    K("There's an old League camp here with the fire still going.");
    const c = await exChoose([['Rest by the fire', '3 energy back'], ['Search the camp', 'Something might be left']]);
    if (!c) { s.pose = 'sleep'; await rwait(1400); s.pose = 'happy'; K(`${nm} had a long rest by the fire.`); await rwait(1700); unprop(fire); return 3; }
    const item = EX_FINDS[Math.floor(R() * EX_FINDS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a'; addItem(item); found.push(`${a} ${item}`);
    s.pose = 'effort'; await hop(6, 220); s.pose = 'happy'; spark(s.x + 10, headY(), 'sparkle', 4); K(`${nm} found ${a} ${item} under an old crate.`); await rwait(1700); unprop(fire); return 0; }
  if (kind === 'stuck') {
    const o = gradedOpponent('E', 1, R, reg.rift ? null : reg.el), bush = prop({ k: 'xbush', x: 168, y: GROUND, col: '#5f8a3e', shake: 1 }); await walkTo(126, 60, 'walk'); s.pose = 'idle';
    K("Something small is stuck in this bush, and it's crying.");
    const c = await exChoose([['Help it out', '1 energy'], ['Leave it', 'Keep going']]);
    if (c) { bush.shake = 0; K('We kept going.'); await rwait(1000); unprop(bush); return 0; }
    s.pose = 'effort'; await rwait(700); bush.shake = 0; const fp = prop({ k: 'foe', x: 176, y: GROUND, fm: o.fm, grid: o.fm.grid, pal: o.fm.pal, pose: 'happy', right: true });
    await hop(10, 300); s.pose = 'happy'; await exTween(900, u => { fp.x = 176 + u * 90; fp.jy = -Math.abs(Math.sin(u * 9)) * 8; }); unprop(fp); unprop(bush);
    s.stress -= 8; clampAll(); K(`A baby ${o.m.name} hopped out and ran off. Helping it calmed ${nm} down, and its stress went down by 8.`); await rwait(2400); return -1; }
  // Rook's team is out after the same stones
  PLAYER.rookEx = exSeason();
  const mon = rookMon(s.grade), w = await walkIn('rival', { mon });
  w.p.face = 'surprised'; await talk('rival', "I didn't know Josie's ranch had a permit out here.");
  w.p.face = 'worried'; await talk('rival', "My father sent me after the painted stones. He won't tell me what he wants them for.");
  w.p.face = 'happy'; say("Let's see whose Snabit gets to the far end first.", 'rival');
  const c = await exChoose([['Take him on', `A match with ${mon.m.name}`], ['Not today', 'Let him go ahead']]);
  if (c) { await talk('rival', "Suit yourself. I'll get there first."); await walkOut(w); return 0; }
  await sceneFade(true, 400); let won = false;
  await new Promise(done => arenaFight({ s, foe: mon, mode: 'control', title: 'Rival', noDraw: true, onEnd: r => { won = !!(r && r.winner === 0); done(); } }));
  s.trip = true; s.camJump = true; s.pose = won ? 'happy' : 'tired'; await sceneFade(false, 400);
  if (won) { const item = EX_RARE[Math.floor(R() * EX_RARE.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a'; addItem(item); found.push(`${a} ${item}`);
    w.p.face = 'worried'; await talk('rival', `Fine, you win. Take the ${item} my team found back there.`); await walkOut(w); return 0; }
  w.p.face = 'happy'; await talk('rival', 'See you at the far end.'); await walkOut(w);
  K(`Rook's team went on ahead, and the match left ${nm} tired.`); await rwait(2000); return -3;
}
