/* Deep expeditions for a team of three (STORY/WORLD.md, Team expeditions; Gid's calls on 15 and 17 Nov 2026).
   They open from grade C, a region at a time, once that region's regular map has been crossed to its far end. A deep map is three
   floors built new every season by the rules of Gid's roguelike (deep-gen.js), seen from above and explored as the team walks:
   a lit room shows whole from its doorway, a corridor only a little way ahead. Tap a spot the team has seen and it walks there.
   The leader goes in front and tires on a long walk, while the two behind slowly get energy back. Stamina sets how much energy a
   Snabit has and how fast it comes back. Switching the leader costs the incoming Snabit 1 energy. Wild Snabits walk
   the floors and come after the team once they see it. Touching one starts a tag-team fight, where the next Snabit steps in
   against whatever HP the last one left, and a Snabit that loses is out until camp. When all three lose, the team wakes up back
   at the entrance with less energy, and the Snabit that beat them is still out there. The lower floors each have a camp by the
   stairs for one night. The bottom floor has the region's teacher as a guardian, and the deep maps of Dream Garden and Hollow
   Moor hold the Kitsune and Vampire stones. Needs deep-gen.js, explore.js and explore-art.js. */

const DEEP_GRADE = { E: 'D', D: 'C', C: 'B', B: 'A', A: 'S', S: 'S' };
const deepRegions = () => rankIdx() >= 2 ? REGIONS.filter((r, i) => i < (typeof tripRegionCount === 'function' ? tripRegionCount() : 4) && exState(r).got.includes('6:1')) : [];
function deepState(reg) { const X = PLAYER.deep = PLAYER.deep || {}; return X[reg.n] = X[reg.n] || { seen: ['0:1'], got: [], season: -1 }; }

/* the three floors of a deep map (deep-gen.js), a new layout every season. A Deep Rift ring's lower floors are caverns, and a
   region's last floor is a cavern about one season in three */
function deepMap(reg, season = typeof exSeason === 'function' ? exSeason() : 0) {
  const ring = reg.ring != null, kinds = ring ? ['rooms', 'caves', 'caves'] : ['rooms', 'rooms', hashStr('cave|' + reg.n + '|' + season) % 3 ? 'rooms' : 'caves'];
  const M = dgExpedition('deep|' + reg.n + '|' + season, { kinds, el: reg.el }), R = rng(hashStr('deepx|' + reg.n + '|' + season));
  if (typeof deepExtras === 'function') deepExtras(reg, M, R);   // a waystone, a sealed way and sometimes Rook's team (deep-more.js)
  if (ring && typeof riftLairs === 'function') riftLairs(reg, M);   // a Deep Rift ring's lairs (horror.js)
  return M;
}
const deepFeats = M => M.floors.flatMap(F => Object.values(F.feat));

/* ---------- picking the team ---------- */
const DP = { reg: null, pick: [] };
function openDeepPick(reg) {
  DP.reg = reg; DP.pick = DP.pick.filter(id => rosterStates().some(s => s.id === id)).slice(0, 3);
  const all = rosterStates();
  panel(`<div class="full lab-head"><b>${reg.ring != null ? reg.n : reg.n + ', deep'}</b><button class="small" id="dp-back">Back</button></div>
    <div class="full lab-info">${all.length < 3 ? `A deep expedition needs three Snabits. You have ${all.length}.` : 'Pick three. The first one you pick leads.'}</div>` +
    all.map(s => { const k = DP.pick.indexOf(s.id); return `<button class="rb tm-pick ${k >= 0 ? 'on' : ''}" data-id="${s.id}"><span class="tm-n">${k >= 0 ? k + 1 : ''}</span><b>${displayName(s)}</b><small>Lv ${s.level} · ${s.stage} · ${s.m.el1}</small></button>`; }).join('') +
    `<button class="big full" id="dp-go" ${DP.pick.length === 3 ? '' : 'disabled'}>Set off</button>`);
  el('dp-back').onclick = openExpeditions;
  el('r-panel').querySelectorAll('.tm-pick').forEach(b => b.onclick = () => { const i = DP.pick.indexOf(b.dataset.id); if (i >= 0) DP.pick.splice(i, 1); else if (DP.pick.length < 3) DP.pick.push(b.dataset.id); openDeepPick(reg); });
  el('dp-go').onclick = () => { const all2 = rosterStates(); runDeep(reg, DP.pick.map(id => all2.find(s => s.id === id))); };
}

/* ---------- the leader stands in for the ranch Snabit while the team is out ---------- */
const DEEP_KEYS = ['x', 'dir', 'pose', 'jy', 'bx', 'flash', 'shake', 'ghosts', 'trail', 'props', 'parts', 'busy', 'cur', 'skip', 'noScenes', 'showNums', 'bg', 'trip', 'tripLabel', 'night', 'dusk', 'camJump', 'training', 'guide', 'dayHour', 'zx', 'hidden', 'behind', 'upside', 'open', 'cam', 'camL', 'camX', 'pan', 'panC', 'panL', 'panUntil', 'room', 'vExtra', 'visitor', 'weather', 'zoom', 'lull'];
function deepLead(st) { if (RS === st) return; const o = RS; for (const k of DEEP_KEYS) st[k] = o[k]; st.pose = 'idle'; RS = st; drawUI(); }
// Stamina against what the grade's Snabits have: from half of it to twice it (Gid, 17 Nov 2026: more energy and faster recovery from Stamina)
const deepSta = (s, need) => clamp(playerFighter(s).base.sta / Math.max(1, need), 0.5, 2);
// 13 energy at half the grade's Stamina, up to 22 at twice it
function deepEnergyMax(s, need = exNeed(DEEP_GRADE[s.grade] || 'C')) { return 10 + Math.round(6 * deepSta(s, need)); }
// a Snabit walking behind gets 1 energy back every this many steps: 72 at half the grade's Stamina, 18 at twice it
const deepRegen = (s, need) => Math.round(36 / deepSta(s, need));

/* the team strip over the map: a card each with its energy, and whether it leads, can be switched in or is out */
function deepTeamDraw(cv, T, lead) {
  const d = devicePixelRatio || 1, W = cv.clientWidth || 340, H = 84; cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px';
  const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); const cw = (W - 16) / 3, boxes = [];
  T.forEach((m, i) => { const L = 4 + i * (cw + 4), on = i === lead; boxes.push([L, L + cw]);
    SC.depth(x, () => { x.beginPath(); x.roundRect(L, 6, cw, 70, 10); }, on ? '#fff3d2' : '#efe2c2', 3, 0.25);
    x.strokeStyle = on ? '#d39a2c' : '#b59a6c'; x.lineWidth = on ? 2.6 : 1.2; x.beginPath(); x.roundRect(L, 6, cw, 70, 10); x.stroke();
    const sp = chibiSpec(fightMon(m.s), m.s); if (sp) { x.save(); if (m.out) x.globalAlpha = 0.4; x.translate(L + 24, 66); x.scale(-0.27, 0.27); x.translate(-100, -188); CHIBI.draw(x, sp, m.out ? 'tired' : 'idle', 0); x.restore(); }
    const nm = displayName(m.s); x.fillStyle = '#5a4128'; x.font = '700 11px Fredoka, system-ui'; x.fillText(nm.length > 9 ? nm.slice(0, 9) : nm, L + 46, 24);
    x.font = '600 9px Fredoka, system-ui'; x.fillStyle = m.out ? '#a04a3a' : on ? '#b07a1c' : '#8a6a45'; x.fillText(m.out ? 'Out until camp' : on ? 'Leading' : m.e > 0 ? 'Tap to switch' : 'Worn out', L + 46, 37);
    SC.depth(x, () => { x.beginPath(); x.roundRect(L + 46, 46, cw - 54, 9, 4.5); }, '#d9c8a0', 1.5, 0.25);
    if (m.e > 0) SC.depth(x, () => { x.beginPath(); x.roundRect(L + 46, 46, Math.max(9, (cw - 54) * m.e / m.max), 9, 4.5); }, m.e > 3 ? '#6fae4f' : '#d8823a', 0, 0);
    x.fillStyle = '#5a4128'; x.font = '600 9px Fredoka, system-ui'; x.fillText(`${Math.max(0, m.e)} of ${m.max}`, L + 46, 68); });
  return boxes;
}
/* the two behind the leader follow it along the path */
function deepFollow(T, leadOf) {
  const props = new Map();
  const tick = () => { const L = leadOf(); if (!RS || !RS.props) return; let k = 0;
    for (const m of T) { if (m.s === L.s) continue; k++;
      let p = props.get(m); if (!p || !RS.props.includes(p)) { p = { k: 'foe', x: RS.x - 30 * k, y: GROUND, fm: fightMon(m.s), right: true, pose: 'idle' }; RS.props.unshift(p); props.set(m, p); }
      const tx = Math.max(12, RS.x - 30 * k * (RS.dir || 1)), dx = (tx - p.x) * 0.12; p.x += dx; p.right = Math.abs(dx) > 0.2 ? dx > 0 : RS.dir !== -1;
      p.pose = m.out ? 'tired' : Math.abs(dx) > 0.25 ? 'walk' : 'idle'; p.fade = m.out ? 0.55 : 1; }
    for (const [m, p] of props) if (m.s === L.s) { const i = RS.props.indexOf(p); if (i >= 0) RS.props.splice(i, 1); props.delete(m); } };
  const iv = setInterval(tick, 16); return () => { clearInterval(iv); for (const p of props.values()) { const i = RS.props.indexOf(p); if (i >= 0) RS.props.splice(i, 1); } };
}

/* a tag-team fight: the leader goes first, and each Snabit that loses is out until camp. True if the team won */
async function deepFight(T, leadI, foe, title, K) {
  const order = [leadI, ...T.map((m, i) => i).filter(i => i !== leadI)].filter(i => !T[i].out);
  let foeHp = null;
  for (let j = 0; j < order.length; j++) {
    const m = T[order[j]];
    if (j) { K(`${displayName(m.s)}, you're up!`); await rwait(1100); }
    await sceneFade(true, 400); let res = null;
    await new Promise(done => arenaFight({ s: m.s, foe, mode: 'control', title, noDraw: true, foeHp, onEnd: r => { res = r; done(); } }));
    RS.trip = true; RS.camJump = true; await sceneFade(false, 400);
    if (res && res.winner === 0) return true;
    m.out = true; foeHp = res ? Math.max(0.05, res.foeHpLeft) : foeHp;
  }
  return false;
}

/* ---------- the deep expedition ---------- */
// one-time things on a floor go once they've been dealt with; the stairs, a lair and a waiting tear stay
const DEEP_ONCE = ['chest', 'spring', 'camp', 'shrine', 'seal', 'cache', 'rival', 'guard', 'block'];
const DEEP_LIVE = { pick: null };   // the input a walk is waiting on, for the tests
async function runDeep(reg, team) {
  const home = RS, st = deepState(reg), M = deepMap(reg), g = reg.ring != null ? riftGrade(reg) : DEEP_GRADE[exGrade(reg)], need = exNeed(g), areas = TRIP_AREAS[reg.el], K = t => say(t, 'guide'), found = [];
  if (reg.ring == null && typeof horrorTear === 'function') horrorTear(reg, M);   // a tear with a horror in it, now and then from grade A
  const where = reg.ring != null ? reg.n : `${reg.n}, deep`;   // a Deep Rift ring has its own name
  const T = team.map(s => { const max = deepEnergyMax(s, need); return { s, e: max, max, out: false, every: deepRegen(s, need), walked: 0 }; });
  if (st.got.includes('10:1') && !st.got.includes('guard')) st.got.push('guard');   // a guardian beaten on the old maps stays beaten
  st.season = exSeason(); saveGame();
  let lead = 0, day = 1, stop = null, steps = 0, see = new Set(), trail = [], used = [];
  const at = { f: 0, x: M.floors[0].up[0], y: M.floors[0].up[1] }, Fl = () => M.floors[at.f];
  const look = () => { const F = Fl(); see = dgSee(F, at.x, at.y); for (const i of see) F.seen[i] = 1; for (const p of F.pats) if (!p.dead && see.has(dgI(F, p.x, p.y))) p.spotted = true; };
  M.reveal = () => { const F = Fl(); for (let i = 0; i < F.t.length; i++) if (F.t[i] !== DG.ROCK || dgWall(F, i)) F.seen[i] = 1; };
  M.spawn = () => dgSpawn(Fl(), at, Math.random);
  const setLead = i => { lead = i; deepLead(T[i].s); }, leadOf = () => lead;
  const scenery = async () => { await sceneFade(true, 250); RS.props = []; RS.parts = []; RS.bg = `area:${reg.el}:${areas[Math.min(3, 1 + at.f)].key}`; RS.x = 70; RS.camJump = true; RS.jy = 0; await sceneFade(false, 250); };
  let boxes = [];
  const draw = () => { boxes = deepTeamDraw(el('dp-team'), T, lead); deepDraw(el('ex-map'), M, at, T, lead, see, trail, `${where} · Floor ${at.f + 1} · Day ${day}`); };
  // back to the entrance after the whole team loses a fight
  const toStart = async () => { for (const m of T) { m.out = false; m.e = Math.max(0, m.e - 2); }
    await sceneFade(true, 500); at.f = 0; [at.x, at.y] = M.floors[0].up; trail = []; RS.props = []; RS.bg = `area:${reg.el}:${areas[1].key}`; RS.x = 90; RS.camJump = true; look(); await sceneFade(false, 500);
    setLead(Math.max(0, T.findIndex(m => m.e > 0))); K("Everyone up? We'll start again from the entrance."); await rwait(1600); };
  // a fight with a Snabit on patrol
  const patrol = async p => {
    await scenery(); const r = await deepNode(reg, { k: 'wild', id: p.id }, st, g, need, T, leadOf, setLead, K, used, found, M, () => day, at.f);
    if (r === 'lost') { await toStart(); return 'stop'; }
    p.dead = true; return 'stop';
  };
  // one thing on the floor, stepped onto
  const feature = async (n, from) => {
    const F = Fl(), i = dgI(F, n.x, n.y);
    if (n.k === 'down' || (n.k === 'up' && at.f > 0)) {
      await sceneFade(true, 450); at.f += n.k === 'down' ? 1 : -1; const F2 = Fl(); [at.x, at.y] = n.k === 'down' ? F2.up : F2.down; trail = [];
      RS.props = []; RS.bg = `area:${reg.el}:${areas[Math.min(3, 1 + at.f)].key}`; RS.x = 90; RS.camJump = true; look(); await sceneFade(false, 450);
      if (n.k === 'down' && !used.includes('floor' + at.f)) { used.push('floor' + at.f); K(at.f === 2 ? (reg.ring != null ? "It's the bottom of this ring. Whatever lives down here knows we're here." : "This is as deep as it goes. The guardian's down here somewhere.") : 'Watch your step. It goes deeper from here.'); await rwait(1300); }
      return 'stop'; }
    if (n.k === 'up') return;   // the way out, where the trip started
    await scenery();
    const r = await deepNode(reg, n, st, g, need, T, leadOf, setLead, K, used, found, M, () => day, at.f);
    if (r === 'fail') { if (n.k !== 'tear') n.failed = true; [at.x, at.y] = from; return 'stop'; }
    if (r === 'lost') { await toStart(); return 'stop'; }
    if (r === 'camp') day++;
    if (r === 'end') return 'end';
    if (n.k === 'seal' && r === 'open') { F.open[i] = 1; F.shut.delete(i); }
    if (n.k === 'block') F.shut.delete(i);
    if (DEEP_ONCE.includes(n.k) || (n.k === 'tear' && used.includes(n.id))) delete F.feat[i];
    return 'stop';
  };
  // walks the team along a path of tiles, one step at a time
  const walk = async path => {
    for (const [nx, ny] of path) {
      const L = T[lead]; if (L.out || L.e <= 0) return;
      const F = Fl(), i = dgI(F, nx, ny), n = F.feat[i]; if (n && n.failed) return;
      const from = [at.x, at.y]; trail.unshift(from); trail.length = Math.min(trail.length, 2); at.x = nx; at.y = ny;
      if (F.t[i] === DG.DOOR) F.open[i] = 1;
      if (++steps % 10 === 0) L.e -= 1;   // a long walk tires the leader
      for (const m of T) if (m !== L && !m.out && m.e < m.max && ++m.walked >= m.every) { m.walked = 0; m.e += 1; }   // and the two behind get their breath back
      RS.pose = 'walk'; const seen0 = F.pats.filter(p => p.spotted && !p.dead).length; look();
      if (n) { RS.pose = 'idle'; const r = await feature(n, from); look(); draw(); if (r) return r; }
      let p = F.pats.find(q => !q.dead && Math.abs(q.x - at.x) + Math.abs(q.y - at.y) <= 1) || dgPatrols(F, at, see, Math.random);
      look(); draw();
      if (p) { RS.pose = 'idle'; return patrol(p); }
      if (F.pats.filter(q => q.spotted && !q.dead).length > seen0) { RS.pose = 'idle'; if (Math.random() < 0.5) { K("Something's moving up ahead."); } return; }
      await rwait(85);
    }
    RS.pose = 'idle';
  };
  await scene(async () => {
    deepLead(T[0].s);
    await tripLeave(`Walt has a League permit for ${reg.ring != null ? reg.n.replace('The Rift, ', '') + ' of the Rift' : 'deep ' + reg.n}. ${T.map(m => displayName(m.s)).join(', ')} go with him for two weeks.`);
    const s0 = RS; s0.bg = `area:${reg.el}:${areas[1].key}`; s0.trip = true; s0.night = 0; s0.dusk = 0; s0.props = []; s0.x = 90; s0.pose = 'idle'; s0.camJump = true; s0.tripLabel = where; drawUI();
    stop = deepFollow(T, () => T[lead]);
    await sceneFade(false, 700); banner(where, '#fff'); K('Only League teams come out this far. Stay close, you three.'); await rwait(1400); banner('');
    el('r-panel').innerHTML = `<canvas id="dp-team" class="full" style="width:100%;display:block"></canvas><canvas id="ex-map" class="full" style="width:100%;display:block"></canvas><button class="rb full" id="ex-home">Head home<small>Keeps everything found so far</small></button>`;
    el('ranch').classList.add('exploring');
    look();
    try {
      for (;;) {
        draw();
        if (!T.some(m => !m.out && m.e > 0)) { K(T.every(m => m.out) ? "That's all three of you down. We're going home." : "You're all worn out. We're going home."); await rwait(1800); break; }
        if (T[lead].out || T[lead].e <= 0) { setLead(T.findIndex(m => !m.out && m.e > 0)); K(`${displayName(T[lead].s)}, you go in front.`); await rwait(900); continue; }
        const pick = await deepInput(el('dp-team'), boxes, el('ex-map'), M, at);
        if (!pick) break;
        if (pick.sw != null) { const m = T[pick.sw]; if (pick.sw === lead || m.out || m.e < 1) continue; m.e -= 1; setLead(pick.sw); K(`${displayName(m.s)}, you go in front.`); await rwait(700); continue; }
        const r = await walk(pick.path);
        if (r === 'end') break;
        saveGame();
      }
    } finally { stop && stop(); DEEP_LIVE.pick = null; el('ranch').classList.remove('exploring'); el('r-panel').innerHTML = ''; window.removeEventListener('keydown', deepKey); }
    // the team comes home: the ranch Snabit takes its place again, and all three carry the trip
    for (const k of DEEP_KEYS) home[k] = RS[k]; RS = home; RS.props = []; drawUI();
    for (const m of T) { m.s.fatigue = Math.min(100, m.s.fatigue + Math.round(20 * tireMul(m.s))); m.s.stress = Math.min(100, m.s.stress + 8); }
    clampAll();
    for (const m of T) if (m.s !== home) { const e = PLAYER.roster.find(r => r.id === m.s.id); if (e) e.st = packRanch(m.s); }
    const got = found.length ? `The team brought home ${found.join(', ')}.` : "The team didn't find anything this time.";
    await tripHome(`Time to head back. ${got}`, "We're back at the ranch. Everyone will sleep well tonight.", found.length ? 'happy' : 'idle');
    RS.weekAct = 'Expedition'; await endWeek(2, `The team explored ${reg.ring != null ? reg.n.replace('The Rift, ', '') + ' of the Rift' : 'deep ' + reg.n}. ${got}`);
  });
}

/* ---------- the map ---------- */
const DEEP_TS = 16;   // tile size on screen
// where the map's view sits: centred on the leader, kept inside the floor
function deepView(cv, F, at) { const W = cv.clientWidth || 340, H = 236, ts = DEEP_TS;
  const ox = clamp(at.x * ts + ts / 2 - W / 2, 0, Math.max(0, F.w * ts - W)), oy = clamp(at.y * ts + ts / 2 - H / 2, 0, Math.max(0, F.h * ts - H)); return { W, H, ts, ox, oy }; }
function deepDraw(cv, M, at, T, lead, see, trail, title) {
  const F = M.floors[at.f], d = devicePixelRatio || 1, V = deepView(cv, F, at), { W, H, ts, ox, oy } = V; cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px';
  const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); const ink = '#5a4128', R = SC.rng(7);
  x.fillStyle = '#efe2c2'; x.beginPath(); x.roundRect(0, 0, W, H, 10); x.fill();
  for (let i = 0; i < 7; i++) { const sx = R() * W, sy = R() * H, sr = 20 + R() * 40, gr = x.createRadialGradient(sx, sy, 1, sx, sy, sr); gr.addColorStop(0, 'rgba(196,165,110,.16)'); gr.addColorStop(1, 'rgba(196,165,110,0)'); x.fillStyle = gr; x.fillRect(sx - sr, sy - sr, sr * 2, sr * 2); }
  x.save(); x.beginPath(); x.roundRect(4, 4, W - 8, H - 8, 7); x.clip(); x.translate(-ox, -oy);
  const c0 = Math.max(0, Math.floor(ox / ts)), c1 = Math.min(F.w - 1, Math.ceil((ox + W) / ts)), r0 = Math.max(0, Math.floor(oy / ts)), r1 = Math.min(F.h - 1, Math.ceil((oy + H) / ts));
  const garden = new Set(F.rooms.map((r, k) => r.design === 'garden' ? k : -1));
  for (let ty = r0; ty <= r1; ty++) for (let tx = c0; tx <= c1; tx++) {
    const i = dgI(F, tx, ty); if (!F.seen[i]) continue; const t = F.t[i], X = tx * ts, Y = ty * ts;
    if (t === DG.ROCK) { x.fillStyle = '#b89a6c'; x.fillRect(X, Y, ts, ts); x.strokeStyle = 'rgba(90,65,40,.35)'; x.lineWidth = 1; x.beginPath(); for (let k = -ts; k < ts; k += 5) { x.moveTo(X + Math.max(0, k), Y + Math.max(0, -k)); x.lineTo(X + Math.min(ts, k + ts), Y + Math.min(ts, ts - k)); } x.stroke(); continue; }
    x.fillStyle = t === DG.HALL || (t === DG.DOOR) ? '#e6d2a4' : '#f8eed4'; x.fillRect(X, Y, ts, ts);
    if (t === DG.ROOM && garden.has(F.room[i]) && (i * 7) % 5 === 0) { x.strokeStyle = '#7fae55'; x.lineWidth = 1.2; x.beginPath(); for (const a of [-3, 0, 3]) { x.moveTo(X + 8 + a, Y + 12); x.lineTo(X + 8 + a * 1.4, Y + 7); } x.stroke(); }
    if (t === DG.WATER) { x.fillStyle = '#86c3dc'; x.fillRect(X, Y, ts, ts); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1; x.beginPath(); x.moveTo(X + 3, Y + 6 + (tx % 2) * 4); x.quadraticCurveTo(X + 8, Y + 3 + (tx % 2) * 4, X + 13, Y + 6 + (tx % 2) * 4); x.stroke(); }
    if (t === DG.PILLAR) { x.fillStyle = 'rgba(60,40,20,.25)'; x.beginPath(); x.ellipse(X + 9, Y + 12, 6, 3, 0, 0, 7); x.fill(); x.fillStyle = '#b3a690'; x.beginPath(); x.arc(X + 8, Y + 8, 5.5, 0, 7); x.fill(); x.fillStyle = '#d4c9b4'; x.beginPath(); x.arc(X + 6.5, Y + 6.5, 2.2, 0, 7); x.fill(); }
    if (t === DG.RUBBLE) for (const [a, b, r] of [[5, 10, 3.5], [10, 7, 4], [11, 12, 2.5]]) { x.fillStyle = '#9b927f'; x.beginPath(); x.arc(X + a, Y + b, r, 0, 7); x.fill(); x.fillStyle = '#bdb4a0'; x.beginPath(); x.arc(X + a - 1, Y + b - 1, r * 0.45, 0, 7); x.fill(); }
    if (t === DG.DOOR) { const hz = dgAt(F, tx - 1, ty) === DG.ROCK; x.fillStyle = '#8a5a2b';
      if (F.open[i]) { x.fillRect(X + (hz ? 0 : 1), Y + (hz ? 1 : 0), hz ? 3 : 14, hz ? 14 : 3); }
      else { x.fillRect(hz ? X + 1 : X + 5, hz ? Y + 5 : Y + 1, hz ? 14 : 6, hz ? 6 : 14); x.fillStyle = '#e0b64a'; x.beginPath(); x.arc(X + 8, Y + 8, 1.4, 0, 7); x.fill(); } }
    if (!see.has(i)) { x.fillStyle = 'rgba(110,80,50,.16)'; x.fillRect(X, Y, ts, ts); }
  }
  // what's on the floor
  for (const k in F.feat) { const n = F.feat[k], i = +k; if (!F.seen[i]) continue; const cx = n.x * ts + ts / 2, cy = n.y * ts + ts / 2;
    if (n.k === 'up' || n.k === 'down') { x.fillStyle = n.k === 'down' ? '#5a4128' : '#a98a5e'; x.fillRect(cx - 7, cy - 7, 14, 14); x.fillStyle = n.k === 'down' ? '#c9b088' : '#f1e3c0'; for (let s = 0; s < 3; s++) x.fillRect(cx - 6 + s * 4, cy - 6 + s * 4, 12 - s * 4, 2.2); continue; }
    x.save(); x.translate(cx, cy); x.scale(0.72, 0.72); exIcon(x, n.k === 'cache' ? { ...n, k: 'chest', big: true } : n, 0, 0, false, !!n.failed); x.restore(); }
  // the Snabits on patrol, while they're in sight
  for (const p of F.pats) { if (p.dead || !see.has(dgI(F, p.x, p.y))) continue; const cx = p.x * ts + ts / 2, cy = p.y * ts + ts / 2;
    x.fillStyle = p.chase ? '#c8553d' : '#9a6a4a'; x.beginPath(); x.arc(cx, cy, 7.5, 0, 7); x.fill(); x.save(); x.translate(cx, cy); x.scale(0.55, 0.55); x.fillStyle = '#fff3dc';
    x.beginPath(); x.ellipse(0, 3, 5, 4, 0, 0, 7); x.fill(); for (const [a, b] of [[-6, -2], [-2.4, -6.5], [2.4, -6.5], [6, -2]]) { x.beginPath(); x.ellipse(a, b, 2, 2.5, a * 0.08, 0, 7); x.fill(); } x.restore(); }
  // the two behind the leader, then the leader's pin
  trail.forEach(([tx, ty], k) => { const m = T.filter((q, j) => j !== lead)[k]; if (!m) return; x.fillStyle = typeof ELC === 'function' ? ELC(m.s.m.el1) : '#8a6a45'; x.globalAlpha = m.out ? 0.4 : 1;
    x.beginPath(); x.arc(tx * ts + ts / 2, ty * ts + ts / 2, 4.5, 0, 7); x.fill(); x.strokeStyle = '#fff6dc'; x.lineWidth = 1.5; x.stroke(); x.globalAlpha = 1; });
  const tx = at.x * ts + ts / 2, ty = at.y * ts + ts / 2, py = ty - 12;
  x.fillStyle = 'rgba(40,25,10,.25)'; x.beginPath(); x.ellipse(tx, ty + 6, 5, 2, 0, 0, 7); x.fill();
  SC.depth(x, () => { x.beginPath(); x.moveTo(tx, py + 15); x.bezierCurveTo(tx - 9, py + 4, tx - 7, py - 7, tx, py - 7); x.bezierCurveTo(tx + 7, py - 7, tx + 9, py + 4, tx, py + 15); }, '#e9852e', 1.5, 0.3);
  x.fillStyle = '#fff6dc'; x.beginPath(); x.arc(tx, py + 1, 2.8, 0, 7); x.fill();
  x.restore();
  x.strokeStyle = 'rgba(122,90,55,.55)'; x.lineWidth = 1.5; x.beginPath(); x.roundRect(4, 4, W - 8, H - 8, 7); x.stroke();
  if (title) { x.font = '700 10px Fredoka, system-ui'; const tw = x.measureText(title).width; x.fillStyle = 'rgba(239,226,194,.9)'; x.beginPath(); x.roundRect(W - tw - 22, H - 24, tw + 14, 16, 6); x.fill(); x.fillStyle = ink; x.textAlign = 'right'; x.fillText(title, W - 15, H - 12); x.textAlign = 'left'; }
}
// the shortest way over floor the team has seen, to a tile it has seen. Blockers can only be the end of a path
function deepPath(F, from, to) {
  const ti = dgI(F, ...to); if (!F.seen[ti] || !dgPass(F.t[ti])) return null;
  const prev = new Int32Array(F.w * F.h).fill(-1), s = dgI(F, ...from), q = [s]; prev[s] = s;
  for (let h = 0; h < q.length; h++) { const i = q[h]; if (i === ti) break; const x = i % F.w, y = (i / F.w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!dgIn(F, nx, ny)) continue; const j = dgI(F, nx, ny);
      if (prev[j] >= 0 || !F.seen[j] || !dgPass(F.t[j])) continue; const n = F.feat[j]; if (n && n.failed) continue; if (j !== ti && (F.shut.has(j) || n)) continue;
      prev[j] = i; q.push(j); } }
  if (prev[ti] < 0) return null; const P = []; for (let i = ti; i !== s; i = prev[i]) P.unshift([i % F.w, (i / F.w) | 0]); return P;
}
let deepKey = () => {};
// waits for a tap on the map, the team strip or Head home, or an arrow key
function deepInput(tc, boxes, cv, M, at) {
  return new Promise(res => {
    const F = M.floors[at.f], done = v => { cv.onpointerdown = null; tc.onpointerdown = null; window.removeEventListener('keydown', deepKey); DEEP_LIVE.pick = null; res(v); };
    const go = to => { const P = deepPath(F, [at.x, at.y], to); if (P && P.length) done({ path: P }); };
    DEEP_LIVE.pick = { go, sw: i => done({ sw: i }), home: () => done(null), at, M };
    cv.onpointerdown = e => { const b = cv.getBoundingClientRect(), V = deepView(cv, F, at); go([Math.floor((e.clientX - b.left + V.ox) / V.ts), Math.floor((e.clientY - b.top + V.oy) / V.ts)]); };
    tc.onpointerdown = e => { const b = tc.getBoundingClientRect(), px = e.clientX - b.left, i = boxes.findIndex(([a, z]) => px >= a && px <= z); if (i >= 0) done({ sw: i }); };
    deepKey = e => { const D = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]; if (!D) return; e.preventDefault(); go([at.x + D[0], at.y + D[1]]); };
    window.addEventListener('keydown', deepKey);
    const h = el('ex-home'); if (h) h.onclick = () => done(null);
  });
}
/* one thing on a deep floor, or a fight with a patrol. f is the floor, 0 to 2 */
async function deepNode(reg, n, st, g, need, T, leadOf, setLead, K, used, found, M, dayOf, f = 0) {
  const s = RS, once = st.got.includes(n.id), nm = displayName(T[leadOf()].s);
  await walkTo(110, 70, 'walk'); s.pose = 'idle';
  if (n.k === 'tear' || n.k === 'lair') return horrorNode(reg, n, g, T, leadOf, setLead, K, used, found);
  if (n.k === 'shrine' || n.k === 'seal' || n.k === 'rival' || n.k === 'cache') return deepMore(reg, n, st, g, T, leadOf, setLead, K, used, found, M);
  if (n.k === 'path') { await rwait(250); return; }
  if (n.k === 'camp') {
    if (n.start || used.includes(n.id)) { await rwait(300); return; } used.push(n.id);
    for (const m of T) { m.out = false; m.e = Math.min(m.max, Math.max(0, m.e) + 8); }
    await campNight(`${reg.ring != null ? reg.n : reg.n + ', deep'} · night ${dayOf()}`, "We'll camp here tonight.");
    // overnight a wild Snabit can wander in somewhere out of sight
    if (Math.random() < 0.5 && M.spawn && M.spawn()) { K('Something was moving around out there last night. Keep your eyes open.'); await rwait(1200); }
    return 'camp'; }
  if (n.k === 'spring') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id); const sp = prop({ k: 'spring', x: 150, y: GROUND }); await walkTo(124, 60, 'walk'); s.pose = 'happy'; spark(150, GROUND - 10, 'drip', 8); rsfx('splash');
    for (const m of T) if (!m.out) m.e = Math.min(m.max, m.e + 3); K("There's fresh water here. Drink up, all of you."); await rwait(1300); unprop(sp); return; }
  if (n.k === 'chest') { if (once) { K('The chest here is empty now.'); await rwait(900); return; }
    const c = prop({ k: 'chest', x: 150, y: GROUND }); await walkTo(126, 60, 'walk'); await rwait(300); c.open = true; rsfx('creak'); s.pose = 'happy'; spark(150, GROUND - 22, 'sparkle', 6);
    const R = rng(hashStr('deep' + reg.n + n.id + '|' + exSeason())), item = R() < 0.5 ? EX_RARE[Math.floor(R() * EX_RARE.length)] : EX_FINDS[Math.floor(R() * EX_FINDS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a';
    addItem(item); found.push(`${a} ${item}`); st.got.push(n.id); K(`${nm} found ${a} ${item} in an old chest.`);
    if (T.lucky) { T.lucky = false; const x2 = EX_RARE[Math.floor(R() * EX_RARE.length)], a2 = /^[AEIOU]/.test(x2) ? 'an' : 'a'; addItem(x2); found.push(`${a2} ${x2}`); await rwait(1300); K(`And there's ${a2} ${x2} under it. That waystone was right.`); }   // luck from a waystone (deep-more.js)
    await rwait(1400); unprop(c); return; }
  if (n.k === 'wild') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id);
    const G = GRADE_INFO[g], foe = gradedOpponent(g, Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * [0.4, 0.55, 0.7][f]), Math.random, reg.el), prize = Math.round(G.purse * [0.4, 0.5, 0.6][f]);   // deeper floors, stronger Snabits
    const fp = prop({ k: 'foe', x: 186, y: GROUND, fm: foe.fm }); banner('A wild Snabit', '#ffd23f'); K(`A wild ${foe.m.name} caught up with us.`); await rwait(1300); banner(''); unprop(fp);
    const won = await deepFight(T, leadOf(), foe, 'Wild', K); if (T[leadOf()].out && T.some(m => !m.out)) setLead(T.findIndex(m => !m.out));
    if (won) { PLAYER.bits += prize; drawUI(); found.push(`${prize.toLocaleString()} bits`); RS.pose = 'happy'; K(`You did it! The League pays ${prize.toLocaleString()} bits for that one.`); await rwait(1400); return; }
    used.splice(used.indexOf(n.id), 1); K(`That ${foe.m.name} beat all three of you.`); await rwait(1400); return 'lost'; }
  if (n.k === 'guard') {
    const [tName, fam] = TEACHER[reg.el], G = GRADE_INFO[g], R = rng(hashStr('guard' + reg.n)), foe = gradedOpponent(g, G.lv[1], R, null, null, randomOpponent(R, fam)); foe.boss = tName;
    const fp = prop({ k: 'foe', x: 186, y: GROUND, fm: foe.fm }); banner(tName, '#ffd23f'); K(`That's ${tName}. Nobody gets past without a fight.`); await rwait(1800); banner(''); unprop(fp);
    const won = await deepFight(T, leadOf(), foe, tName, K);
    if (!won) { K(`${tName} beat all three of you.`); await rwait(1600); return 'lost'; }
    const alive = T.findIndex(m => !m.out); if (alive >= 0 && T[leadOf()].out) setLead(alive);
    const sp = EX_DEEP_STONE[reg.n], L0 = sp && stoneList(), have = L0 ? L0.includes(sp) : once;   // a save that beat this guardian when it guarded two items still finds the stone
    if (sp && !have) { const p = prop({ k: 'pstone', x: 170, y: GROUND, glow: true, sp }); await walkTo(140, 60, 'walk'); RS.pose = 'happy'; if (!once) st.got.push(n.id); const L = stoneList(); if (L && !L.includes(sp)) L.push(sp);
      found.push('a Pattern Stone'); spark(170, GROUND - 40, 'sparkle', 8); banner('A Pattern Stone', '#ffe9a8'); K("Look behind it. Someone painted a pattern on that stone, and the Snaboscope's humming at it."); await rwait(2800); banner(''); unprop(p); return 'end'; }
    if (!once) { st.got.push(n.id); const R2 = rng(hashStr('guardchest' + reg.n)), items = [EX_RARE[Math.floor(R2() * 3)], EX_RARE[Math.floor(R2() * 3)]]; items.forEach(addItem); found.push(...items.map(i => `${/^[AEIOU]/.test(i) ? 'an' : 'a'} ${i}`)); }
    const bounty = Math.round(G.purse * 1.5); PLAYER.bits += bounty; drawUI(); found.push(`${bounty.toLocaleString()} bits`);
    RS.pose = 'happy'; K(`You beat ${tName}! The League pays ${bounty.toLocaleString()} bits for that.`); await rwait(1800); return 'end'; }
  // an obstacle, maybe one that needs two Snabits
  const leadI = leadOf(), L = T[leadI], v1 = playerFighter(L.s).base[EX_KEY[n.stat]];
  await exObstacle(n.stat, v1 >= need * n.mul, hashStr(reg.n + n.id));
  if (v1 < need * n.mul) { L.e -= 3; K(EX_LOSE[n.stat](displayName(L.s))); await rwait(1500); return 'fail'; }
  K(EX_WIN[n.stat](displayName(L.s))); await rwait(1100);
  if (!n.stat2) return;
  const helpers = T.map((m, i) => ({ m, i })).filter(({ m, i }) => i !== leadI && !m.out && m.e > 0).sort((a, b) => playerFighter(b.m.s).base[EX_KEY[n.stat2]] - playerFighter(a.m.s).base[EX_KEY[n.stat2]]);
  if (!helpers.length) { K("There's more past it, and nobody's got the energy left."); await rwait(1500); return 'fail'; }
  const H = helpers[0], v2 = playerFighter(H.m.s).base[EX_KEY[n.stat2]], ok2 = v2 >= need * n.mul; H.m.e -= 1;
  K(`There's more past it. ${displayName(H.m.s)}, your turn.`); await rwait(1100);
  await sceneFade(true, 250); setLead(H.i); RS.props = []; RS.x = 70; RS.camJump = true; await sceneFade(false, 250); await walkTo(100, 70, 'walk');
  await exObstacle(n.stat2, ok2, hashStr(reg.n + n.id + '2'));
  if (!ok2) H.m.e -= 3;
  K((ok2 ? EX_WIN : EX_LOSE)[n.stat2](displayName(H.m.s))); await rwait(1500);
  setLead(leadI);
  return ok2 ? null : 'fail';
}
