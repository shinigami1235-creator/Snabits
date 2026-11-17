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
  dgSecrets(M, R);   // the ways between rooms, traps, a hidden room and a gate (deep-gen.js)
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
  el('dp-go').onclick = () => { const all2 = rosterStates(); openDeepPack(reg, DP.pick.map(id => all2.find(s => s.id === id))); };   // the pack, then off (deep-pack.js)
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

/* the team strip over the map: a card each with its energy and HP, and whether it leads, can be switched in or can't go on */
function deepTeamDraw(cv, T, lead) {
  const d = devicePixelRatio || 1, W = cv.clientWidth || 340, H = 100; cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px';
  const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); const cw = (W - 16) / 3, boxes = [];
  const bar = (L, y, w, v, max, col) => { SC.depth(x, () => { x.beginPath(); x.roundRect(L, y, w, 8, 4); }, '#d9c8a0', 1.5, 0.25);
    if (v > 0) SC.depth(x, () => { x.beginPath(); x.roundRect(L, y, Math.max(8, w * v / max), 8, 4); }, col, 0, 0); };
  T.forEach((m, i) => { const L = 4 + i * (cw + 4), on = i === lead, gone = m.down; boxes.push([L, L + cw]);
    SC.depth(x, () => { x.beginPath(); x.roundRect(L, 6, cw, 88, 10); }, on ? '#fff3d2' : '#efe2c2', 3, 0.25);
    x.strokeStyle = on ? '#d39a2c' : '#b59a6c'; x.lineWidth = on ? 2.6 : 1.2; x.beginPath(); x.roundRect(L, 6, cw, 88, 10); x.stroke();
    const sp = chibiSpec(fightMon(m.s), m.s); if (sp) { x.save(); if (gone) x.globalAlpha = 0.4; x.translate(L + 22, 50); x.scale(-0.24, 0.24); x.translate(-100, -188); CHIBI.draw(x, sp, gone ? 'tired' : 'idle', 0); x.restore(); }
    const nm = displayName(m.s); x.fillStyle = '#5a4128'; x.font = '700 11px Fredoka, system-ui'; x.fillText(nm.length > 9 ? nm.slice(0, 9) : nm, L + 42, 22);
    x.font = '600 9px Fredoka, system-ui'; x.fillStyle = gone ? '#a04a3a' : on ? '#b07a1c' : '#8a6a45'; x.fillText(gone ? "Can't go on" : on ? 'Leading' : m.e > 0 ? 'Tap to switch' : 'Worn out', L + 42, 34);
    const bw = cw - 14; x.fillStyle = '#5a4128'; x.font = '600 8.5px Fredoka, system-ui';
    x.fillText(`Energy ${Math.max(0, m.e)}/${m.max}`, L + 7, 56); bar(L + 7, 60, bw, m.e, m.max, m.e > 3 ? '#6fae4f' : '#d8823a');
    x.fillText(`HP ${Math.max(0, m.hp)}/${m.hpMax}`, L + 7, 77); bar(L + 7, 81, bw, m.hp, m.hpMax, m.hp > m.hpMax * 0.3 ? '#d9534a' : '#8a2a22'); });
  return boxes;
}
/* the two behind the leader follow it along the path */
function deepFollow(T, leadOf) {
  const props = new Map();
  const tick = () => { const L = leadOf(); if (!RS || !RS.props) return; let k = 0;
    for (const m of T) { if (m.s === L.s) continue; k++;
      let p = props.get(m); if (!p || !RS.props.includes(p)) { p = { k: 'foe', x: RS.x - 30 * k, y: GROUND, fm: fightMon(m.s), right: true, pose: 'idle' }; RS.props.unshift(p); props.set(m, p); }
      const tx = Math.max(12, RS.x - 30 * k * (RS.dir || 1)), dx = (tx - p.x) * 0.12; p.x += dx; p.right = Math.abs(dx) > 0.2 ? dx > 0 : RS.dir !== -1;
      p.pose = m.down ? 'tired' : Math.abs(dx) > 0.25 ? 'walk' : 'idle'; p.fade = m.down ? 0.55 : 1; }
    for (const [m, p] of props) if (m.s === L.s) { const i = RS.props.indexOf(p); if (i >= 0) RS.props.splice(i, 1); props.delete(m); } };
  const iv = setInterval(tick, 16); return () => { clearInterval(iv); for (const p of props.values()) { const i = RS.props.indexOf(p); if (i >= 0) RS.props.splice(i, 1); } };
}

/* a tag-team fight: the leader goes first, and each Snabit that loses is out until camp. True if the team won */
async function deepFight(T, leadI, foe, title, K) {
  const order = [leadI, ...T.map((m, i) => i).filter(i => i !== leadI)].filter(i => !T[i].down);
  let foeHp = null; const done = won => { for (const m of T) m.out = false; return won; };
  for (let j = 0; j < order.length; j++) {
    const m = T[order[j]];
    if (j) { K(`${displayName(m.s)}, you're up!`); await rwait(1100); }
    await sceneFade(true, 400); let res = null;
    await new Promise(done => arenaFight({ s: m.s, foe, mode: 'control', title, noDraw: true, foeHp, onEnd: r => { res = r; done(); } }));
    RS.trip = true; RS.camJump = true; await sceneFade(false, 400);
    // a fight costs HP: a third of what it lost in the fight for a win, 40% of its HP for a loss
    if (res && res.winner === 0) { deepHurt(m, (1 - (res.hpLeft ?? 1)) * 0.35); return done(true); }
    deepHurt(m, 0.4); m.out = true; foeHp = res ? Math.max(0.05, res.foeHpLeft) : foeHp;
  }
  return done(false);
}
// takes a share of a Snabit's HP. At 0 it can't go on for the rest of the trip
function deepHurt(m, share) { if (m.hpMax == null) return; m.hp = Math.max(0, m.hp - Math.max(1, Math.round(m.hpMax * share))); if (m.hp <= 0) m.down = true; }

/* ---------- the deep expedition ---------- */
// one-time things in a room go once they've been dealt with; the stairs, a lair and a waiting tear stay
const DEEP_ONCE = ['chest', 'spring', 'shrine', 'seal', 'cache', 'rival', 'guard', 'block', 'relic', 'lever'];
const DEEP_LIVE = { pick: null };   // the choice the trip is waiting on, for the tests
const DEEP_NIGHTS = 4;   // nights at camp on one trip
// a stat next to what the grade's Snabits have, from half to twice
const deepVs = (s, k, need) => clamp(playerFighter(s).base[k] / Math.max(1, need), 0.5, 2);
// HP from Constitution: 27 at half the grade's, up to 50 at twice it
const deepHpMax = (s, need) => 20 + Math.round(15 * deepVs(s, 'grd', need));
// weeks of its prime a Snabit loses when it can't go on: more in the higher grades and the Rift
const deepLife = (g, ring) => ring ? 16 : ({ C: 4, B: 8, A: 12, S: 12 }[g] || 4);
// what a room's buttons call the things in it
const DEEP_ACT = { chest: 'Open the chest', spring: 'Drink from the spring', shrine: 'The old waystone', cache: 'The League cache', relic: 'Something on the floor', lever: 'Pull the lever',
  tear: 'The tear', lair: 'The carved door', down: 'Go down the stairs', up: 'Climb back up' };
const DEEP_SEE = { chest: 'a chest', spring: 'a spring', shrine: 'a waystone', cache: 'a cache', relic: 'something shiny', lever: 'a lever', tear: 'a tear', lair: 'a carved door',
  down: 'the stairs down', up: 'the way up', guard: 'the guardian', rival: "Rook's team" };
const DEEP_TRAP = [null, () => 'Darts came flying out of the wall!', () => 'Rocks came down from the ceiling!', n => `The floor gave way under ${n}!`];
const capFirst = t => t[0].toUpperCase() + t.slice(1);

async function runDeep(reg, team, pack = {}) {
  const home = RS, st = deepState(reg), M = deepMap(reg), ring = reg.ring != null, g = ring ? riftGrade(reg) : DEEP_GRADE[exGrade(reg)], need = exNeed(g), areas = TRIP_AREAS[reg.el], K = t => say(t, 'guide'), found = [], gotItems = [];
  if (!ring && typeof horrorTear === 'function') horrorTear(reg, M);   // a tear with a horror in it, now and then from grade A
  const where = ring ? reg.n : `${reg.n}, deep`;   // a Deep Rift ring has its own name
  const T = team.map(s => { const max = deepEnergyMax(s, need), hp = deepHpMax(s, need); return { s, e: max, max, every: deepRegen(s, need), walked: 0, tire: 0, hp, hpMax: hp, down: false, out: false }; });
  const live = () => T.filter(m => !m.down), best = k => Math.max(0.5, ...live().map(m => deepVs(m.s, k, need)));
  if (st.got.includes('10:1') && !st.got.includes('guard')) st.got.push('guard');   // a guardian beaten on the old maps stays beaten
  st.season = exSeason(); saveGame();
  const bag = { ...pack };   // what the team carries
  let lead = 0, day = 1, nights = DEEP_NIGHTS, stop = null, see = new Set(), vis = new Set(), trail = [], used = [], warned = false, prev = null, retreat = false, empty = false;
  const lantern = [0, 0, 0], told = new Set();
  for (const F of M.floors) for (const p of F.pats) p.room = F.room[dgI(F, p.x, p.y)];
  const at = { f: 0, room: M.floors[0].upRoom, x: M.floors[0].up[0], y: M.floors[0].up[1] }, Fl = () => M.floors[at.f];
  const name = m => displayName(m.s), setLead = i => { lead = i; deepLead(T[i].s); }, leadOf = () => lead;
  const roomOf = F => (n => F.room[dgI(F, n.x, n.y)]);
  // what the team can see: rooms out to a number of steps set by the best Mind on the team, plus a lantern
  const look = () => { const F = Fl(), v = 1 + (best('mnd') >= 1 ? 1 : 0) + (best('mnd') >= 1.6 ? 1 : 0) + lantern[at.f], H = dgHops(F, at.room, e => !e.hidden);
    vis = new Set(F.rooms.map((r, k) => k).filter(k => H.D[k] >= 0 && H.D[k] <= v)); see = new Set();
    for (const k of vis) { const rm = F.rooms[k]; for (let y = rm.y1; y <= rm.y2; y++) for (let x = rm.x1; x <= rm.x2; x++) { const i = dgI(F, x, y); if (F.room[i] === k || !rm.cave) see.add(i); } }
    for (const e of F.E) if (!e.hidden && vis.has(e.a) && vis.has(e.b)) for (const i of e.path) see.add(i);
    for (const i of [...see]) { const x = i % F.w, y = (i / F.w) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dgAt(F, x + dx, y + dy) === DG.ROCK && dgIn(F, x + dx, y + dy)) see.add(dgI(F, x + dx, y + dy)); }
    for (const i of see) F.seen[i] = 1; for (const p of F.pats) if (!p.dead && vis.has(p.room)) p.spotted = true; };
  M.reveal = () => { const F = Fl(); for (const e of F.E) if (!e.hidden) for (const i of e.path) F.seen[i] = 1; F.rooms.forEach((rm, k) => { if (F.adj[k].every(e => e.hidden)) return; for (let y = rm.y1; y <= rm.y2; y++) for (let x = rm.x1; x <= rm.x2; x++) F.seen[dgI(F, x, y)] = 1; });
    for (let i = 0; i < F.t.length; i++) if (dgWall(F, i) && [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([a, b]) => F.seen[i + a + b * F.w] && F.t[i + a + b * F.w] !== DG.ROCK)) F.seen[i] = 1; };
  M.spawn = () => { const F = Fl(), H = dgHops(F, at.room), ks = F.rooms.map((r, k) => k).filter(k => H.D[k] >= 3 && k !== F.upRoom); if (!ks.length) return null;
    const k = ks[Math.floor(Math.random() * ks.length)], fr = dgFree(F, k); if (!fr.length) return null; const p = { x: fr[0][0], y: fr[0][1], room: k, id: 'n' + at.f + F.pats.length }; F.pats.push(p); return p; };
  const scenery = async () => { await sceneFade(true, 250); RS.props = []; RS.parts = []; RS.bg = `area:${reg.el}:${areas[Math.min(3, 1 + at.f)].key}`; RS.x = 70; RS.camJump = true; RS.jy = 0; await sceneFade(false, 250); };
  let boxes = [];
  const draw = () => { boxes = deepTeamDraw(el('dp-team'), T, lead); deepDraw(el('ex-map'), M, at, T, lead, see, trail, `${where} · Floor ${at.f + 1} · Day ${day}`); };
  // puts the team on a free spot in a room
  const placeIn = (k, near) => { const F = Fl(), fr = dgFree(F, k); const c = near && fr.length ? fr.reduce((m, q) => Math.abs(q[0] - near[0]) + Math.abs(q[1] - near[1]) < Math.abs(m[0] - near[0]) + Math.abs(m[1] - near[1]) ? q : m) : fr[0] || dgRoomCentre(F.rooms[k]);
    at.room = k; [at.x, at.y] = c; trail = []; };
  // walks a list of tiles, one step at a time
  const steps = async (P, each) => { for (const i of P) { const F = Fl(); if (each) { const r = await each(i); if (r) return r; } trail.unshift([at.x, at.y]); trail.length = Math.min(trail.length, 2); at.x = i % F.w; at.y = (i / F.w) | 0;
    if (F.t[i] === DG.DOOR) F.open[i] = 1; RS.pose = 'walk'; draw(); await rwait(45); } RS.pose = 'idle'; };
  // the shortest way inside one room
  const inside = (F, k, to) => { const s = dgI(F, at.x, at.y); if (s === to) return []; const prv = new Map([[s, -1]]), q = [s];
    for (let h = 0; h < q.length; h++) { const i = q[h]; if (i === to) break; const x = i % F.w, y = (i / F.w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = dgI(F, x + dx, y + dy); if (prv.has(j) || !dgIn(F, x + dx, y + dy) || !dgPass(F.t[j]) || (F.room[j] !== k && j !== to)) continue; prv.set(j, i); q.push(j); } }
    if (!prv.has(to)) return []; const P = []; for (let i = to; i !== s; i = prv.get(i)) P.unshift(i); return P; };
  // a fight that sends the team back where it came from when all three lose
  const pushBack = () => { const F = Fl(), k = prev != null && prev !== at.room ? prev : F.upRoom; placeIn(k); prev = null; };
  const afterFight = () => { if (T[lead].down && live().length) setLead(T.indexOf(live()[0])); };
  // one thing in a room, or a blocker on the way out of one
  const feature = async n => {
    const F = Fl(), i = dgI(F, n.x, n.y), nm = name(T[lead]);
    if (n.k === 'down') {
      if (n.locked) { K("The gate's shut. There has to be a lever somewhere on this floor."); await rwait(1500); return; }
      await sceneFade(true, 450); at.f++; const F2 = Fl(); placeIn(F2.upRoom); [at.x, at.y] = F2.up; prev = null;
      RS.props = []; RS.bg = `area:${reg.el}:${areas[Math.min(3, 1 + at.f)].key}`; RS.x = 90; RS.camJump = true; look(); await sceneFade(false, 450);
      if (!used.includes('floor' + at.f)) { used.push('floor' + at.f); K(at.f === 2 ? (ring ? "It's the bottom of this ring. Whatever lives down here knows we're here." : "This is as deep as it goes. The guardian's down here somewhere.") : 'Watch your step. It goes deeper from here.'); await rwait(1300); }
      return; }
    if (n.k === 'up') { if (!at.f) return; await sceneFade(true, 450); at.f--; const F2 = Fl(); placeIn(F2.downRoom); [at.x, at.y] = F2.down; prev = null;
      RS.props = []; RS.bg = `area:${reg.el}:${areas[Math.min(3, 1 + at.f)].key}`; RS.x = 90; RS.camJump = true; look(); await sceneFade(false, 450); return; }
    if (n.k === 'lever') { delete F.feat[i]; const d = F.feat[dgI(F, ...F.down)]; if (d) d.locked = false; rsfx('creak'); K(`${nm} pulls the lever, and something heavy grinds open far away.`); await rwait(1600); return; }
    if (n.k === 'relic') { delete F.feat[i]; const r = rng(hashStr('relic|' + reg.n + '|' + n.id + '|' + exSeason())), item = RELICS[Math.floor(r() * RELICS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a';
      addItem(item); found.push(`${a} ${item}`); gotItems.push(item); RS.pose = 'happy'; K(`${nm} found ${a} ${item} on the floor.`); await rwait(1600); return; }
    await scenery();
    const bag0 = { ...PLAYER.bag };
    const r = await deepNode(reg, n, st, g, need, T, leadOf, setLead, K, used, found, M, () => day, at.f);
    for (const k in PLAYER.bag) if ((PLAYER.bag[k] || 0) > (bag0[k] || 0)) for (let c = bag0[k] || 0; c < PLAYER.bag[k]; c++) gotItems.push(k);   // what it found, in case the team has to run
    afterFight();
    if (r === 'fail') { if (n.k !== 'tear') n.failed = true; return 'fail'; }
    if (r === 'lost') { pushBack(); return 'lost'; }
    if (r === 'end') return 'end';
    if (n.k === 'seal' && r === 'open') { F.open[i] = 1; F.shut.delete(i); }
    if (n.k === 'block') F.shut.delete(i);
    if (DEEP_ONCE.includes(n.k) || (n.k === 'tear' && used.includes(n.id))) delete F.feat[i];
  };
  // a trap on the way between two rooms
  const trap = async e => { e.sprung = true; const L = T[lead], nm = name(L);
    if (bag.Rope > 0) { bag.Rope--; K(`There's a trap here. ${nm} gets everyone past it on the rope.`); await rwait(1500); return; }
    RS.pose = 'hurt'; spark(RS.x + 6, GROUND - 40, 'star', 6); rsfx('thud'); deepHurt(L, clamp(0.22 / deepVs(L.s, 'grd', need), 0.11, 0.44)); draw();
    K(DEEP_TRAP[e.trap](nm) + (L.down ? ` ${nm} can't go on.` : '')); await rwait(1600); RS.pose = 'idle'; afterFight(); };
  // a fight with a Snabit on patrol
  const patrol = async p => { await scenery(); const r = await deepNode(reg, { k: 'wild', id: p.id }, st, g, need, T, leadOf, setLead, K, used, found, M, () => day, at.f); afterFight();
    if (r === 'lost') { pushBack(); return 'lost'; } p.dead = true; };
  // the patrols take a step: toward the team when it's two rooms away or less, otherwise now and then somewhere else. Never into camp
  const patrolsMove = () => { const F = Fl(), ok = e => !e.hidden && (e.block < 0 || !F.shut.has(e.block));
    for (const p of F.pats) { if (p.dead) continue; const D = dgHops(F, p.room, ok).D, d = D[at.room]; let e = null;
      if (d >= 0 && d <= 2 && Math.random() < 0.55) e = dgFirst(F, p.room, at.room, ok);
      else if (Math.random() < 0.35) { const L = F.adj[p.room].filter(ok); e = L[Math.floor(Math.random() * L.length)] || null; }
      if (!e) continue; const b = e.a === p.room ? e.b : e.a; if (b === F.upRoom || F.pats.some(o => o !== p && !o.dead && o.room === b)) continue;
      const fr = dgFree(F, b); if (!fr.length) continue; p.room = b; [p.x, p.y] = fr[Math.floor(Math.random() * Math.min(4, fr.length))]; } };
  // what someone with good Insight notices on walking into a room: a hidden way, a trap, or which way to go
  const notice = async () => { const F = Fl(), key = at.f + ':' + at.room; if (told.has(key)) return; told.add(key);
    const p = clamp(0.45 * best('spr'), 0.15, 0.9), dir = e => dgDir(F, e, at.room);
    const hid = F.adj[at.room].find(e => e.hidden); if (hid && Math.random() < p) { hid.hidden = false; K("There's a draught coming through a crack in this wall."); await rwait(1500); return; }
    const tr = F.adj[at.room].find(e => e.trap && !e.sprung && !e.hinted); if (tr && Math.random() < p) { tr.hinted = true; K(`Something about the way ${dir(tr)} feels off.`); await rwait(1500); return; }
    const dn = F.feat[dgI(F, ...F.down)], lv = Object.values(F.feat).find(n => n.k === 'lever'), goal = dn && dn.locked && lv ? lv : dn;
    if (goal && !F.seen[dgI(F, goal.x, goal.y)] && Math.random() < p) { const e = dgFirst(F, at.room, roomOf(F)(goal), e => !e.hidden); if (e) {
      K(goal.k === 'lever' ? `I think there's something ${dir(e)} of here we need.` : at.f === 2 ? `I think the guardian is ${dir(e)} of here.` : `I think the way down is ${dir(e)} of here.`); await rwait(1500); } } };
  // a Snabit walking in front pays for each room it walks to: 1 energy, down to 1 for every 1.6 rooms with lots of Speed. Out of energy, it pays in HP
  const pay = () => { const L = T[lead]; L.tire += 1 / clamp(deepVs(L.s, 'spd', need), 0.8, 1.6);
    while (L.tire >= 1) { L.tire -= 1; if (L.e > 0) L.e -= 1; else { deepHurt(L, 0.08); empty = true; } } };
  // over an edge to the next room
  const go = async e => {
    const F = Fl(), a = at.room, b = e.a === a ? e.b : e.a, P = dgWay(e, a), mid = P[P.length >> 1];
    pay(); empty = false;
    const walk = [...inside(F, a, P[0]), ...P.slice(1)];
    const r = await steps(walk, async i => { const n = F.feat[i];
      if (F.shut.has(i) && n) { if (n.failed) return 'back'; RS.pose = 'idle'; const r2 = await feature(n); if (r2) return r2 === 'fail' ? 'back' : r2; }
      if (i === mid && e.trap && !e.sprung) await trap(e); });
    if (r === 'back' || r === 'lost') { if (r === 'back') placeIn(a, [at.x, at.y]); return r; }
    if (r === 'end') return 'end';
    if (T.every(m => m.down)) return;
    for (const m of T) if (m !== T[lead] && !m.down && m.e < m.max) { m.walked += walk.length; while (m.walked >= m.every && m.e < m.max) { m.walked -= m.every; m.e += 1; } }   // the two behind get their breath back
    prev = a; at.room = b; look();
    if (empty) { K(`${name(T[lead])} is running on empty.`); await rwait(1200); }
    const here = () => F.pats.find(p => !p.dead && p.room === at.room);
    if (here()) return patrol(here());
    const boss = Object.values(F.feat).find(n => (n.k === 'guard' || n.k === 'rival') && roomOf(F)(n) === at.room);
    if (boss) { await steps(inside(F, at.room, dgI(F, boss.x, boss.y)).slice(0, -1)); const r3 = await feature(boss); if (r3) return r3; }
    patrolsMove(); look(); if (here()) return patrol(here());
    await notice();
  };
  // a night at the camp by the entrance of the floor
  const camp = async () => {
    if (nights <= 0) { K("We're out of supplies for another night."); await rwait(1400); return; }
    nights--; await campNight(`${where} · night ${day}`, "We'll camp here tonight.");
    for (const m of live()) { m.e = m.max; m.hp = Math.min(m.hpMax, m.hp + Math.round(m.hpMax * 0.6)); }
    day++; warned = false;
    if (Math.random() < 0.5 && M.spawn()) { K('Something was moving around out there last night. Keep your eyes open.'); await rwait(1200); } };
  // something from the pack, given to whoever needs it most
  const useItem = async k => { const L = live(); if (!L.length || !bag[k]) return; const low = f => L.slice().sort((a, b) => f(a) - f(b))[0];
    if (k === 'Trail mix' || k === 'Energy nut') { const m = low(m => m.e / m.max); m.e = Math.min(m.max, m.e + (k === 'Trail mix' ? 6 : 3)); K(`${name(m)} has the ${k.toLowerCase()}.`); }
    else if (k === 'Bandage' || k === 'Medicine') { const m = low(m => m.hp / m.hpMax); m.hp = Math.min(m.hpMax, m.hp + Math.round(m.hpMax * (k === 'Bandage' ? 0.4 : 0.3))); K(`${name(m)} gets patched up.`); }
    else if (k === 'Lantern') { lantern[at.f]++; look(); K('That lights things up a lot further.'); }
    else return;
    bag[k]--; await rwait(1100); };
  await scene(async () => {
    deepLead(T[0].s);
    await tripLeave(`Walt has a League permit for ${ring ? reg.n.replace('The Rift, ', '') + ' of the Rift' : 'deep ' + reg.n}. ${T.map(name).join(', ')} go with him for two weeks.`);
    const s0 = RS; s0.bg = `area:${reg.el}:${areas[1].key}`; s0.trip = true; s0.night = 0; s0.dusk = 0; s0.props = []; s0.x = 90; s0.pose = 'idle'; s0.camJump = true; s0.tripLabel = where; drawUI();
    stop = deepFollow(T, () => T[lead]);
    await sceneFade(false, 700); banner(where, '#fff'); K('Only League teams come out this far. We camp here, by the entrance.'); await rwait(1400); banner('');
    el('r-panel').innerHTML = `<canvas id="dp-team" class="full" style="width:100%;display:block"></canvas><canvas id="ex-map" class="full" style="width:100%;display:block"></canvas><div id="dp-acts" class="full dp-acts"></div><button class="rb full" id="ex-home">Head home<small>Keeps everything found so far</small></button>`;
    el('ranch').classList.add('exploring');
    look();
    try {
      for (;;) {
        draw();
        if (!live().length) { retreat = true; K("That's everyone down. We're getting out of here."); await rwait(1800); break; }
        if (T[lead].down) { setLead(T.indexOf(live()[0])); K(`${name(T[lead])}, you go in front.`); await rwait(900); continue; }
        { const fresh = live().filter(m => m !== T[lead] && m.e >= 2).sort((a, b) => b.e - a.e)[0];   // out of energy in front: whoever has the most takes over
          if (T[lead].e <= 0 && fresh) { fresh.e -= 1; setLead(T.indexOf(fresh)); K(`${name(fresh)}, you go in front.`); await rwait(900); continue; } }
        const L2 = live(); if (!warned && (L2.some(m => m.hp <= m.hpMax * 0.5) || L2.reduce((a, m) => a + Math.max(0, m.e), 0) <= L2.reduce((a, m) => a + m.max, 0) * 0.25)) {
          warned = true; K("We're running low. We should head back to camp, or go home."); await rwait(1600); continue; }
        const c = await deepChoose(M, at, T, lead, vis, prev, nights, bag, boxes);
        if (!c) break;
        let r;
        if (c.t === 'sw') { const m = T[c.i]; if (c.i === lead || m.down || m.e < 1) continue; m.e -= 1; setLead(c.i); K(`${name(m)}, you go in front.`); await rwait(700); continue; }
        if (c.t === 'exit') r = await go(c.e);
        if (c.t === 'act') { const F = Fl(); await steps(inside(F, at.room, dgI(F, c.n.x, c.n.y))); r = await feature(c.n); look(); if (c.n.k !== 'down' && c.n.k !== 'up') await notice(); }
        if (c.t === 'camp') await camp();
        if (c.t === 'back') for (let k = 0; k < 40 && at.room !== Fl().upRoom && live().length; k++) { const e = dgFirst(Fl(), at.room, Fl().upRoom); if (!e) break; r = await go(e); if (r) break; }
        if (c.t === 'item') await useItem(c.k);
        if (r === 'end') break;
        saveGame();
      }
    } finally { stop && stop(); DEEP_LIVE.pick = null; el('ranch').classList.remove('exploring'); el('r-panel').innerHTML = ''; }
    // a team that had to run leaves the relics and half of what else it found behind
    const lost = [];
    if (retreat) gotItems.forEach((k, j) => { if ((RELICS.includes(k) || j % 2 === 0) && PLAYER.bag[k] > 0) { PLAYER.bag[k]--; if (!PLAYER.bag[k]) delete PLAYER.bag[k]; lost.push(k); } });
    for (const k in bag) if (bag[k] > 0) addItem(k, bag[k]);   // what's left in the pack goes back in the bag
    // the team comes home: the ranch Snabit takes its place again, and all three carry the trip
    for (const k of DEEP_KEYS) home[k] = RS[k]; RS = home; RS.props = []; drawUI();
    const hurt = [];
    for (const m of T) { m.s.fatigue = Math.min(100, m.s.fatigue + Math.round(20 * tireMul(m.s))); m.s.stress = Math.min(100, m.s.stress + 8);
      if (m.down) { m.s.injured = true; m.s.used = (m.s.used || 0) + deepLife(g, ring); hurt.push(name(m)); } }
    clampAll();
    for (const m of T) if (m.s !== home) { const e = PLAYER.roster.find(r => r.id === m.s.id); if (e) e.st = packRanch(m.s); }
    const keep = found.filter(f => !lost.some(k => f.endsWith(' ' + k)) || (lost.splice(lost.findIndex(k => f.endsWith(' ' + k)), 1), false));
    const got = keep.length ? `The team brought home ${keep.join(', ')}.` : "The team didn't find anything this time.";
    const mo = deepLife(g, ring) / 4, ow = hurt.length ? ` ${hurt.join(' and ')} came home hurt, and it cost ${hurt.length > 1 ? 'each of them' : 'it'} ${mo} month${mo > 1 ? 's' : ''} of ${hurt.length > 1 ? 'their' : 'its'} prime.` : '';
    await tripHome(`Time to head back. ${got}${ow}`, "We're back at the ranch. Everyone will sleep well tonight.", keep.length && !hurt.length ? 'happy' : 'idle');
    RS.weekAct = 'Expedition'; await endWeek(2, `The team explored ${ring ? reg.n.replace('The Rift, ', '') + ' of the Rift' : 'deep ' + reg.n}. ${got}${ow}`);
  });
}

/* the buttons under the map: what's in this room, the ways out, the camp and the pack. Resolves with what was picked */
function deepChoose(M, at, T, lead, vis, prev, nights, bag, boxes) {
  const F = M.floors[at.f], box = el('dp-acts'), opts = [], room = n => F.room[dgI(F, n.x, n.y)];
  for (const n of Object.values(F.feat)) if (room(n) === at.room && DEEP_ACT[n.k] && !(n.k === 'up' && !at.f) && !n.failed) opts.push({ t: 'act', n, label: n.k === 'down' && n.locked ? 'The gate' : DEEP_ACT[n.k], sub: '' });
  if (at.room === F.upRoom) opts.push({ t: 'camp', label: 'Camp for the night', sub: nights ? `${nights} night${nights > 1 ? 's' : ''} of supplies left` : 'No supplies left', off: !nights });
  for (const e of F.adj[at.room]) { if (e.hidden) continue; const b = e.a === at.room ? e.b : e.a, bl = e.block >= 0 && F.feat[e.block] && F.shut.has(e.block) ? F.feat[e.block] : null;
    let sub;
    if (bl) sub = bl.failed ? "We can't get through" : bl.k === 'seal' ? 'A sealed door' : "Something's in the way";
    else if (b === prev) sub = 'Back the way we came';
    else if (!vis.has(b)) sub = F.rooms[b].been ? 'Been there' : 'Not explored yet';
    else { const L = Object.values(F.feat).filter(n => room(n) === b && DEEP_SEE[n.k] && !(n.k === 'up' && !at.f)).map(n => DEEP_SEE[n.k]);
      if (F.pats.some(p => !p.dead && p.room === b)) L.unshift('a wild Snabit'); if (b === F.upRoom) L.push('the camp');
      sub = L.length ? capFirst(L.slice(0, 2).join(' and ')) : 'An empty room'; }
    if (e.hinted && !e.sprung) sub += '. Something feels off';
    opts.push({ t: 'exit', e, to: b, label: capFirst(dgDir(F, e, at.room)), sub, off: bl && bl.failed }); }
  if (at.room !== F.upRoom && dgFirst(F, at.room, F.upRoom)) opts.push({ t: 'back', label: 'Back to camp', sub: (n => `${n} room${n > 1 ? 's' : ''} away`)(dgHops(F, at.room).D[F.upRoom]) });
  for (const k of Object.keys(bag)) if (bag[k] > 0 && k !== 'Rope') opts.push({ t: 'item', k, label: `Use ${/^[AEIOU]/.test(k) ? 'an' : 'a'} ${k.toLowerCase()}`, sub: `${bag[k]} in the pack` });
  if (bag.Rope > 0) opts.push({ t: 'none', label: `Rope ×${bag.Rope}`, sub: 'For the next trap', off: true });
  F.rooms[at.room].been = true;
  return new Promise(res => {
    const cv = el('ex-map'), tc = el('dp-team'), done = v => { cv.onpointerdown = null; tc.onpointerdown = null; DEEP_LIVE.pick = null; box.innerHTML = ''; res(v); };
    box.innerHTML = opts.map((o, i) => `<button class="rb ${o.t === 'exit' ? 'dp-exit' : ''}" data-o="${i}" ${o.off ? 'disabled' : ''}>${o.label}<small>${o.sub}</small></button>`).join('');
    box.querySelectorAll('[data-o]').forEach(b => b.onclick = () => done(opts[+b.dataset.o]));
    // a tap on the map: a room next to this one goes there
    cv.onpointerdown = e => { const b = cv.getBoundingClientRect(), V = deepView(cv, F, at), x = Math.floor((e.clientX - b.left + V.ox) / V.ts), y = Math.floor((e.clientY - b.top + V.oy) / V.ts), k = dgIn(F, x, y) ? F.room[dgI(F, x, y)] : -1;
      const o = opts.find(o => o.t === 'exit' && o.to === k && !o.off); if (o) done(o); };
    tc.onpointerdown = e => { const b = tc.getBoundingClientRect(), px = e.clientX - b.left, i = boxes.findIndex(([a, z]) => px >= a && px <= z); if (i >= 0) done({ t: 'sw', i }); };
    DEEP_LIVE.pick = { opts, take: i => done(opts[i]), home: () => done(null), at, M, T, nights };
    const h = el('ex-home'); if (h) h.onclick = () => done(null);
  });
}
(function deepStyle() { const s = document.createElement('style'); s.textContent = `.dp-acts{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}.dp-acts .rb{margin:0}`; document.head.appendChild(s); })();

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
    if (n.k === 'up' || n.k === 'down') { x.fillStyle = n.k === 'down' ? '#5a4128' : '#a98a5e'; x.fillRect(cx - 7, cy - 7, 14, 14); x.fillStyle = n.k === 'down' ? '#c9b088' : '#f1e3c0'; for (let s = 0; s < 3; s++) x.fillRect(cx - 6 + s * 4, cy - 6 + s * 4, 12 - s * 4, 2.2);
      if (n.locked) { x.strokeStyle = '#4a4f57'; x.lineWidth = 1.6; x.beginPath(); for (let b = -5; b <= 5; b += 3.3) { x.moveTo(cx + b, cy - 8); x.lineTo(cx + b, cy + 8); } x.stroke(); } continue; }
    if (n.k === 'relic') { x.fillStyle = '#7fd6e0'; x.beginPath(); x.moveTo(cx, cy - 6); x.lineTo(cx + 5, cy - 1); x.lineTo(cx, cy + 6); x.lineTo(cx - 5, cy - 1); x.closePath(); x.fill(); x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.moveTo(cx - 2, cy - 3); x.lineTo(cx, cy - 5); x.lineTo(cx + 1, cy - 2); x.fill(); continue; }
    if (n.k === 'lever') { x.fillStyle = '#6a5038'; x.fillRect(cx - 6, cy + 3, 12, 4); x.strokeStyle = '#8a8f96'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(cx, cy + 4); x.lineTo(cx + 4, cy - 5); x.stroke(); x.fillStyle = '#c8553d'; x.beginPath(); x.arc(cx + 4, cy - 5, 2.4, 0, 7); x.fill(); continue; }
    x.save(); x.translate(cx, cy); x.scale(0.72, 0.72); exIcon(x, n.k === 'cache' ? { ...n, k: 'chest', big: true } : n, 0, 0, false, !!n.failed); x.restore(); }
  // the Snabits on patrol, while they're in sight
  for (const p of F.pats) { if (p.dead || !see.has(dgI(F, p.x, p.y))) continue; const cx = p.x * ts + ts / 2, cy = p.y * ts + ts / 2;
    x.fillStyle = p.chase ? '#c8553d' : '#9a6a4a'; x.beginPath(); x.arc(cx, cy, 7.5, 0, 7); x.fill(); x.save(); x.translate(cx, cy); x.scale(0.55, 0.55); x.fillStyle = '#fff3dc';
    x.beginPath(); x.ellipse(0, 3, 5, 4, 0, 0, 7); x.fill(); for (const [a, b] of [[-6, -2], [-2.4, -6.5], [2.4, -6.5], [6, -2]]) { x.beginPath(); x.ellipse(a, b, 2, 2.5, a * 0.08, 0, 7); x.fill(); } x.restore(); }
  // the two behind the leader, then the leader's pin
  trail.forEach(([tx, ty], k) => { const m = T.filter((q, j) => j !== lead)[k]; if (!m) return; x.fillStyle = typeof ELC === 'function' ? ELC(m.s.m.el1) : '#8a6a45'; x.globalAlpha = m.down ? 0.4 : 1;
    x.beginPath(); x.arc(tx * ts + ts / 2, ty * ts + ts / 2, 4.5, 0, 7); x.fill(); x.strokeStyle = '#fff6dc'; x.lineWidth = 1.5; x.stroke(); x.globalAlpha = 1; });
  const tx = at.x * ts + ts / 2, ty = at.y * ts + ts / 2, py = ty - 12;
  x.fillStyle = 'rgba(40,25,10,.25)'; x.beginPath(); x.ellipse(tx, ty + 6, 5, 2, 0, 0, 7); x.fill();
  SC.depth(x, () => { x.beginPath(); x.moveTo(tx, py + 15); x.bezierCurveTo(tx - 9, py + 4, tx - 7, py - 7, tx, py - 7); x.bezierCurveTo(tx + 7, py - 7, tx + 9, py + 4, tx, py + 15); }, '#e9852e', 1.5, 0.3);
  x.fillStyle = '#fff6dc'; x.beginPath(); x.arc(tx, py + 1, 2.8, 0, 7); x.fill();
  x.restore();
  x.strokeStyle = 'rgba(122,90,55,.55)'; x.lineWidth = 1.5; x.beginPath(); x.roundRect(4, 4, W - 8, H - 8, 7); x.stroke();
  if (title) { x.font = '700 10px Fredoka, system-ui'; const tw = x.measureText(title).width; x.fillStyle = 'rgba(239,226,194,.9)'; x.beginPath(); x.roundRect(W - tw - 22, H - 24, tw + 14, 16, 6); x.fill(); x.fillStyle = ink; x.textAlign = 'right'; x.fillText(title, W - 15, H - 12); x.textAlign = 'left'; }
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
    for (const m of T) if (!m.down) { m.e = Math.min(m.max, m.e + 3); m.hp = Math.min(m.hpMax, m.hp + Math.round(m.hpMax * 0.15)); } K("There's fresh water here. Drink up, all of you."); await rwait(1300); unprop(sp); return; }
  if (n.k === 'chest') { if (once) { K('The chest here is empty now.'); await rwait(900); return; }
    const c = prop({ k: 'chest', x: 150, y: GROUND }); await walkTo(126, 60, 'walk'); await rwait(300); c.open = true; rsfx('creak'); s.pose = 'happy'; spark(150, GROUND - 22, 'sparkle', 6);
    const R = rng(hashStr('deep' + reg.n + n.id + '|' + exSeason())), item = R() < 0.5 ? EX_RARE[Math.floor(R() * EX_RARE.length)] : EX_FINDS[Math.floor(R() * EX_FINDS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a';
    addItem(item); found.push(`${a} ${item}`); st.got.push(n.id); K(`${nm} found ${a} ${item} in an old chest.`);
    if (T.lucky) { T.lucky = false; const x2 = EX_RARE[Math.floor(R() * EX_RARE.length)], a2 = /^[AEIOU]/.test(x2) ? 'an' : 'a'; addItem(x2); found.push(`${a2} ${x2}`); await rwait(1300); K(`And there's ${a2} ${x2} under it. That waystone was right.`); }   // luck from a waystone (deep-more.js)
    await rwait(1400); unprop(c); return; }
  if (n.k === 'wild') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id);
    const G = GRADE_INFO[g], foe = gradedOpponent(g, Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * [0.4, 0.55, 0.7][f]), Math.random, reg.el), prize = Math.round(G.purse * [0.4, 0.5, 0.6][f]);   // deeper floors, stronger Snabits
    const fp = prop({ k: 'foe', x: 186, y: GROUND, fm: foe.fm }); banner('A wild Snabit', '#ffd23f'); K(`A wild ${foe.m.name} caught up with us.`); await rwait(1300); banner(''); unprop(fp);
    const won = await deepFight(T, leadOf(), foe, 'Wild', K); if (T[leadOf()].down && T.some(m => !m.down)) setLead(T.findIndex(m => !m.down));
    if (won) { PLAYER.bits += prize; drawUI(); found.push(`${prize.toLocaleString()} bits`); RS.pose = 'happy'; K(`You did it! The League pays ${prize.toLocaleString()} bits for that one.`); await rwait(1400); return; }
    used.splice(used.indexOf(n.id), 1); K(`That ${foe.m.name} beat all three of you.`); await rwait(1400); return 'lost'; }
  if (n.k === 'guard') {
    const [tName, fam] = TEACHER[reg.el], G = GRADE_INFO[g], R = rng(hashStr('guard' + reg.n)), foe = gradedOpponent(g, G.lv[1], R, null, null, randomOpponent(R, fam)); foe.boss = tName;
    const fp = prop({ k: 'foe', x: 186, y: GROUND, fm: foe.fm }); banner(tName, '#ffd23f'); K(`That's ${tName}. Nobody gets past without a fight.`); await rwait(1800); banner(''); unprop(fp);
    const won = await deepFight(T, leadOf(), foe, tName, K);
    if (!won) { K(`${tName} beat all three of you.`); await rwait(1600); return 'lost'; }
    const alive = T.findIndex(m => !m.down); if (alive >= 0 && T[leadOf()].down) setLead(alive);
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
  const helpers = T.map((m, i) => ({ m, i })).filter(({ m, i }) => i !== leadI && !m.down && m.e > 0).sort((a, b) => playerFighter(b.m.s).base[EX_KEY[n.stat2]] - playerFighter(a.m.s).base[EX_KEY[n.stat2]]);
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
