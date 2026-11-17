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
  dgSecrets(M, R, reg.el);   // the ways between rooms, traps, a hidden room and a gate (deep-gen.js)
  return M;
}
const deepFeats = M => M.floors.flatMap(F => Object.values(F.feat));

/* ---------- picking the team ---------- */
const DP = { reg: null, pick: [] };
function openDeepPick(reg) {
  DP.reg = reg; DP.pick = DP.pick.filter(id => rosterStates().some(s => s.id === id && s.stage !== 'Bit')).slice(0, 3);
  const all = rosterStates();
  // one Snabit eats less and carries less; three are safer and need more packed (Gid, 17 Nov 2026)
  panel(`<div class="full lab-head"><b>${reg.ring != null ? reg.n : reg.n + ', deep'}</b><button class="small" id="dp-back">Back</button></div>
    <div class="full lab-info">Pick one, two or three. The first one you pick leads.</div>` +
    all.map(s => { const k = DP.pick.indexOf(s.id); return `<button class="rb tm-pick ${k >= 0 ? 'on' : ''}" data-id="${s.id}"><span class="tm-n">${k >= 0 ? k + 1 : ''}</span><b>${displayName(s)}</b><small>Lv ${s.level} · ${s.stage} · ${s.m.el1}${s.injured ? ' · Hurt' : ''}${s.stage === 'Bit' ? ' · Too young' : ''}</small></button>`; }).join('') +
    `<button class="big full" id="dp-go" ${DP.pick.length ? '' : 'disabled'}>Pack for the trip</button>`);
  el('dp-back').onclick = openExpeditions;
  el('r-panel').querySelectorAll('.tm-pick').forEach(b => b.onclick = () => { const s = all.find(x => x.id === b.dataset.id);
    if (s && s.stage === 'Bit') { say(`${displayName(s)} is still too young for this.`, 'guide'); return; }   // a Bit stays home (Gid, 17 Nov 2026)
    const i = DP.pick.indexOf(b.dataset.id); if (i >= 0) DP.pick.splice(i, 1); else if (DP.pick.length < 3) DP.pick.push(b.dataset.id); openDeepPick(reg); });
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
  const d = devicePixelRatio || 1, W = cv.clientWidth || 340, H = 74; cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px';
  const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); const cw = (W - 16) / 3, boxes = [];
  const bar = (L, y, w, v, max, col) => { x.fillStyle = '#d9c8a0'; x.beginPath(); x.roundRect(L, y, w, 6, 3); x.fill(); if (v > 0) { x.fillStyle = col; x.beginPath(); x.roundRect(L, y, Math.max(6, w * v / max), 6, 3); x.fill(); } };
  T.forEach((m, i) => { const L = 4 + i * (cw + 4), on = i === lead, gone = m.down; boxes.push([L, L + cw]);
    SC.depth(x, () => { x.beginPath(); x.roundRect(L, 3, cw, 66, 9); }, on ? '#fff3d2' : '#efe2c2', 2.5, 0.25);
    x.strokeStyle = on ? '#d39a2c' : '#b59a6c'; x.lineWidth = on ? 2.4 : 1.1; x.beginPath(); x.roundRect(L, 3, cw, 66, 9); x.stroke();
    const sp = chibiSpec(fightMon(m.s), m.s); if (sp) { x.save(); if (gone) x.globalAlpha = 0.4; x.translate(L + 17, 36); x.scale(-0.19, 0.19); x.translate(-100, -188); CHIBI.draw(x, sp, gone ? 'tired' : 'idle', 0); x.restore(); }
    const nm = displayName(m.s); x.fillStyle = '#5a4128'; x.font = '700 10.5px Fredoka, system-ui'; x.fillText(nm.length > 9 ? nm.slice(0, 9) : nm, L + 34, 18);
    x.font = '600 8.5px Fredoka, system-ui'; x.fillStyle = gone ? '#a04a3a' : on ? '#b07a1c' : '#8a6a45'; x.fillText(gone ? "Can't go on" : on ? 'Leading' : m.e > 0 ? 'Tap to switch' : 'Worn out', L + 34, 29);
    const bw = cw - 12; x.fillStyle = '#5a4128'; x.font = '600 8px Fredoka, system-ui';
    x.fillText(`Energy ${Math.max(0, m.e)}/${m.max}`, L + 6, 45); bar(L + 6, 47, bw, m.e, m.max, m.e > 3 ? '#6fae4f' : '#d8823a');
    x.fillText(`HP ${Math.max(0, m.hp)}/${m.hpMax}`, L + 6, 60); bar(L + 6, 62, bw, m.hp, m.hpMax, m.hp > m.hpMax * 0.3 ? '#d9534a' : '#8a2a22'); });
  return boxes;
}
/* the others in the party walk on their own: each keeps its own side of the leader and its own distance, waits a moment
   before it sets off, walks at its own pace, and only moves once the leader has got far enough away, so they never trail
   along like a chain or swap sides every time the leader turns (Gid, 17 Nov 2026). An event can send one somewhere
   (m.goX) or give it a pose (m.act). Between things they look around, sit down for a moment or hop. The same tick eases
   the leader towards where the map says it is (RS.tx) and slides the corridor along (RS.bgT) */
function deepFollow(T, leadOf) {
  const props = new Map(); let last = performance.now();
  const tick = () => { const L = leadOf(); if (!RS || !RS.props) return; let k = 0; const now = performance.now(), dt = Math.min(3, (now - last) / 16); last = now;
    if (RS.tx != null) { const d = RS.tx - RS.x; RS.x += d * 0.16; if (Math.abs(d) > 0.6) RS.dir = d > 0 ? 1 : -1; }
    if (RS.bgT != null) RS.bgOff = (RS.bgOff || 0) + (RS.bgT - (RS.bgOff || 0)) * 0.16;
    const hall = typeof RS.bg === 'string' && RS.bg.includes(':hall:');
    for (const m of T) { if (m.s === L.s) continue; k++;
      let p = props.get(m); if (!p || !RS.props.includes(p)) { p = { k: 'foe', follower: true, x: RS.x - (24 + 28 * (k - 1)) * (RS.dir || 1), y: GROUND, fm: fightMon(m.s), spec: typeof chibiSpec === 'function' ? chibiSpec(null, m.s) : null, right: true, pose: 'idle' }; RS.props.unshift(p); props.set(m, p); }
      m.prop = p; if (m.gap == null) { m.gap = 24 + 28 * (k - 1) + Math.random() * 10; m.pace = 1.1 + Math.random() * 0.5; m.side = -(RS.dir || 1); }
      // where it wants to stand: its own spot on its own side, or straight behind while the corridor slides past
      if (hall && RS.pose === 'walk') m.side = -(RS.dir || 1);
      const want = m.goX != null ? m.goX : clamp(RS.x + m.side * m.gap, 10, RW - 10), off = want - p.x;
      if (RS.snapFollow) { p.x = want; m.go = false; }
      else { if (!m.go && Math.abs(off) > (m.goX != null ? 2 : 20)) { m.go = true; m.at = now + (m.goX != null ? 0 : 120 + Math.random() * 260); }
        if (m.go && now >= m.at) { const v = Math.min(Math.abs(off), m.pace * dt * (Math.abs(off) > 40 ? 1.4 : 1)); p.x += Math.sign(off) * v; if (Math.abs(off) <= 1.5) m.go = false; } }
      if (m.goX == null && !(hall && RS.pose === 'walk')) m.side = Math.sign(p.x - RS.x) || m.side;   // it stays on whichever side it ended up
      const moving = (m.go && now >= m.at) || (hall && RS.pose === 'walk' && m.goX == null);
      p.right = moving ? (hall && RS.pose === 'walk' && !m.go ? RS.dir !== -1 : off > 0) : m.face != null ? m.face > 0 : RS.x > p.x;
      // a little life while nothing's happening
      if (!moving && !m.act && !m.down && RS.pose !== 'walk') { if (!m.idleT || now > m.idleT) { m.idleT = now + 2500 + Math.random() * 3500; m.idle = ['look', 'look', 'sit', 'hop', 'sniff', null][Math.floor(Math.random() * 6)]; m.idleUntil = now + 1400; m.face = m.idle === 'look' ? (Math.random() < 0.5 ? 1 : -1) : null; } }
      else if (moving) { m.idle = null; m.face = null; }
      const idle = m.idle && now < m.idleUntil ? m.idle : null;
      p.pose = m.down ? 'tired' : m.act || (moving ? 'walk' : idle === 'sit' ? 'sit' : idle === 'sniff' ? 'lean' : 'idle');
      p.jy = -((m.act === 'happy' || idle === 'hop') && !m.down ? Math.abs(Math.sin(now / 140 + k)) * 5 : 0);
      p.fade = m.down ? 0.55 : 1; }
    RS.snapFollow = false;
    for (const [m, p] of props) if (m.s === L.s) { const i = RS.props.indexOf(p); if (i >= 0) RS.props.splice(i, 1); props.delete(m); m.gap = null; } };
  const iv = setInterval(tick, 16); return () => { clearInterval(iv); for (const p of props.values()) { const i = RS.props.indexOf(p); if (i >= 0) RS.props.splice(i, 1); } };
}
/* a quick dissolve from one place to the next: a copy of the scene as it was fades out over the new one, so walking from a
   corridor into a room never cuts to black (Gid, 17 Nov 2026: the scenes kept snapping back and forth) */
async function deepCross(swap, ms = 280) {
  const cv = el('r-canvas'); let o = null;
  if (cv && cv.parentNode) { o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height; o.getContext('2d').drawImage(cv, 0, 0);
    Object.assign(o.style, { position: 'absolute', left: cv.offsetLeft + 'px', top: cv.offsetTop + 'px', width: cv.offsetWidth + 'px', height: cv.offsetHeight + 'px', pointerEvents: 'none', opacity: '1', transition: `opacity ${ms}ms ease`, zIndex: 1 });
    cv.parentNode.insertBefore(o, cv.nextSibling); }
  swap(); RS.snapFollow = true; await rwait(30); if (o) o.style.opacity = '0'; await rwait(ms); if (o) o.remove();
}
// the room's own prop for something, when the scene already shows it, or a new one
function deepUse(o, n) { const p = (n && RS.props.find(q => q.nid === n.id)) || RS.props.find(q => !q.follower && q.k === o.k && q.nid == null); return p || prop(o); }
// sends the Snabits behind the leader to stand at the given spots, with a pose, or back behind the leader
function deepCrew(T, lead, xs, act) { let k = 0; for (const [i, m] of T.entries()) { if (i === lead || m.down) continue; m.goX = xs[k++] ?? null; m.act = act || null; m.face = null; } }
function deepCrewOff(T) { for (const m of T) { m.goX = null; m.act = null; m.face = null; } }
async function deepFight(T, leadI, foe, title, K, o = {}) {
  const order = [leadI, ...T.map((m, i) => i).filter(i => i !== leadI)].filter(i => !T[i].down);
  let foeHp = null; const done = won => { for (const m of T) m.out = false; return won; };
  // the face-off first, both cards side by side, the way a cup match starts (Gid, 17 Nov 2026)
  if (order.length) { const shown = deepFaceoff(T[order[0]].s, foe, o.where || title, o.line || title); sceneFade(true, 300); await shown; }   // the scene goes dark under the card, so it doesn't flash back before the fight
  for (let j = 0; j < order.length; j++) {
    const m = T[order[j]];
    if (j) { K(`${displayName(m.s)}, you're up!`); await rwait(1100); }
    await sceneFade(true, 400); if (o.fp) { unprop(o.fp); o.fp = null; } let res = null;
    await new Promise(done => arenaFight({ s: m.s, foe, mode: 'control', title, noDraw: true, foeHp, deep: DEEP_LIVE.el || 'Stone', onEnd: r => { res = r; done(); } }));
    RS.trip = true; RS.camJump = true; await sceneFade(false, 400);
    // a fight costs HP: a third of what it lost in the fight for a win, 40% of its HP for a loss
    if (res && res.winner === 0) { deepHurt(m, (1 - (res.hpLeft ?? 1)) * 0.35); return done(true); }
    deepHurt(m, 0.4); m.out = true; foeHp = res ? Math.max(0.05, res.foeHpLeft) : foeHp;
  }
  return done(false);
}
/* the face-off card from the cups (cupshow.js), on the region's own dungeon floor, with Walt saying the line */
function deepFaceoff(s, foe, where, line) {
  if (typeof CUPSHOW === 'undefined' || !CUPSHOW.B || !CUPSHOW.B.faceoff || !foe || !foe.fm) return Promise.resolve();
  const st = b => ['sta', 'pow', 'grd', 'mnd', 'spr', 'spd'].map(k => Math.round((b && b[k]) || 0)), fm = fightMon(s);
  let fb = null; try { fb = makeFighter(foe.fm, foe.skills, foe.level).base; } catch (e) {}
  const me = { name: displayName(s), spec: showSpec(fm), line: `Lv ${s.level} · Grade ${s.grade}`, me: true, st: st(playerFighter(s).base), cols: cardCols(fm.el1) };
  const them = { name: foe.m.name, spec: showSpec(foe.fm), line: `Lv ${foe.level}`, st: st(fb), cols: cardCols(foe.fm.el1) };
  const b = CUPSHOW.B.faceoff({ round: where, me, foe: them }, line), el = DEEP_LIVE.el || 'Stone';
  b.who = 'guide'; b.face = 'talk'; b.jingle = 'vs'; b.mus = 'wild';
  CUPSHOW.bg = (c, W, H) => atStageDeep(c, W, H, H * 0.62, el);
  return CUPSHOW.run([b]).finally(() => { CUPSHOW.bg = null; });
}
/* something the team meets walks in from the side of the room, in place of popping up in front of it (Gid, 17 Nov 2026) */
async function deepFoeIn(foe) {
  const fromR = RS.x < RW / 2, from = fromR ? RW + 40 : -40, to = fromR ? Math.min(RW - 28, RS.x + 84) : Math.max(28, RS.x - 84);
  const fp = prop({ k: 'foe', x: from, y: GROUND, fm: foe.fm, right: !fromR, pose: 'walk' });
  for (let k = 1; k <= 45; k++) { fp.x = from + (to - from) * (1 - Math.pow(1 - k / 45, 2)); await rwait(22); }
  fp.pose = 'idle'; fp.right = RS.x > fp.x; RS.dir = fp.x > RS.x ? 1 : -1; return fp;
}
// what the League pays for, kept until the team is home: wild Snabits beaten, Rook's team, a guardian, caches and finds
function deepPay(T, what, bits, n = 1) { const t = T.tally = T.tally || { wild: 0, beat: [], bits: 0, n: 0 }; t.bits += bits; if (what !== 'find') t.n = (t.n || 0) + n; if (what === 'wild') t.wild++; else if (what && what !== 'find') t.beat.push(what); }
const deepAll = T => T.length === 1 ? displayName(T[0].s) : T.length === 2 ? 'both of you' : 'all three of you';
const DEEP_WON = ['Nice work.', "Good. It's run off.", "That one won't bother us again.", 'Well done, everyone.', 'Off it goes.'];
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
const capFirst = t => t[0].toUpperCase() + t.slice(1);
// the scene prop for something in a room (deep-art.js and explore-art.js)
function deepPropOf(n) {
  switch (n.k) { case 'chest': case 'cache': return { k: 'chest' }; case 'spring': return { k: 'spring' }; case 'shrine': return { k: 'shrine' }; case 'camp': return { k: 'tent' };
    case 'down': return { k: 'stairsdown', locked: n.locked }; case 'up': return { k: 'stairsup' }; case 'lever': return { k: 'lever' }; case 'relic': return { k: 'relic' };
    case 'tear': return { k: 'tear' }; case 'lair': return { k: 'lairdoor' }; case 'event': return { k: DEEP_EV[n.ev].prop, n: deepPlates(n) }; }
  return null;
}

async function runDeep(reg, team, pack = {}) {
  const home = RS, st = deepState(reg), M = deepMap(reg), ring = reg.ring != null, g = ring ? riftGrade(reg) : DEEP_GRADE[exGrade(reg)], need = exNeed(g), areas = TRIP_AREAS[reg.el], K = t => say(t, 'guide'), found = [], gotItems = [];
  DEEP_LIVE.el = reg.el;   // fights down here stand on the region's own dungeon floor (atStageDeep in deep-art.js)
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
  const compass = bag["Pathfinder's compass"] > 0 ? 1 : 0;
  const look = () => { const F = Fl(), v = 1 + (best('mnd') >= 1 ? 1 : 0) + (best('mnd') >= 1.6 ? 1 : 0) + lantern[at.f] + compass, H = dgHops(F, at.room, e => !e.hidden);
    vis = new Set(F.rooms.map((r, k) => k).filter(k => H.D[k] >= 0 && H.D[k] <= v)); see = new Set();
    for (const k of vis) { const rm = F.rooms[k]; for (let y = rm.y1; y <= rm.y2; y++) for (let x = rm.x1; x <= rm.x2; x++) { const i = dgI(F, x, y); if (F.room[i] === k || !rm.cave) see.add(i); } }
    for (const e of F.E) if (!e.hidden && vis.has(e.a) && vis.has(e.b)) for (const i of e.path) see.add(i);
    for (const i of [...see]) { const x = i % F.w, y = (i / F.w) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dgAt(F, x + dx, y + dy) === DG.ROCK && dgIn(F, x + dx, y + dy)) see.add(dgI(F, x + dx, y + dy)); }
    for (const i of see) F.seen[i] = 1; for (const p of F.pats) if (!p.dead && vis.has(p.room)) p.spotted = true; };
  M.reveal = () => { const F = Fl(); for (const e of F.E) if (!e.hidden) for (const i of e.path) F.seen[i] = 1; F.rooms.forEach((rm, k) => { if (F.adj[k].every(e => e.hidden)) return; for (let y = rm.y1; y <= rm.y2; y++) for (let x = rm.x1; x <= rm.x2; x++) F.seen[dgI(F, x, y)] = 1; });
    for (let i = 0; i < F.t.length; i++) if (dgWall(F, i) && [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([a, b]) => F.seen[i + a + b * F.w] && F.t[i + a + b * F.w] !== DG.ROCK)) F.seen[i] = 1; };
  M.spawn = () => { const F = Fl(), H = dgHops(F, at.room), ks = F.rooms.map((r, k) => k).filter(k => H.D[k] >= 3 && k !== F.upRoom); if (!ks.length) return null;
    const k = ks[Math.floor(Math.random() * ks.length)], fr = dgFree(F, k); if (!fr.length) return null; const p = { x: fr[0][0], y: fr[0][1], room: k, id: 'n' + at.f + F.pats.length }; F.pats.push(p); return p; };
  // the scene above the map: the room the team is in with what's in it, or a corridor while it walks between rooms (deep-art.js)
  const roomBg = () => { const F = Fl(), rm = F.rooms[at.room]; return `deep:${reg.el}:${F.kind === 'caves' ? 'cave' : 'room'}:${rm.design}:${rm.dark ? 1 : 0}:${at.f * 100 + at.room}:${F.adj[at.room].filter(e => !e.hidden).length}`; }, hallBg = `deep:${reg.el}:hall:plain:0`;
  const sx = x => { const rm = Fl().rooms[at.room]; return 36 + clamp((x - rm.x1) / Math.max(1, rm.x2 - rm.x1), 0, 1) * 168; };
  const roomProps = () => { const F = Fl(), L = [];
    for (const n of Object.values(F.feat)) { if (F.room[dgI(F, n.x, n.y)] !== at.room) continue; const pr = deepPropOf(n); if (pr) L.push({ ...pr, nid: n.id, x: sx(n.x), y: GROUND }); }
    // things in the same room never stand on top of each other
    L.sort((a, b) => a.x - b.x); for (let i = 1; i < L.length; i++) L[i].x = Math.max(L[i].x, L[i - 1].x + 44);
    const over = L.length ? L[L.length - 1].x - (RW - 18) : 0; if (over > 0) for (const q of L) q.x = Math.max(18, q.x - over);
    RS.props = RS.props.filter(p => p.follower).concat(L); };
  const enterRoom = () => { RS.bg = roomBg(); RS.x = sx(at.x); RS.tx = null; RS.camJump = true; RS.jy = 0; roomProps(); };
  const scenery = async () => { RS.parts = []; RS.jy = 0; RS.tx = null; };
  let boxes = [];
  const draw = () => { boxes = deepTeamDraw(el('dp-team'), T, lead); deepDraw(el('ex-map'), M, at, T, lead, see, trail, `${where} · Floor ${at.f + 1} · Day ${day}`); };
  // puts the team on a free spot in a room
  const placeIn = (k, near) => { const F = Fl(), fr = dgFree(F, k); const c = near && fr.length ? fr.reduce((m, q) => Math.abs(q[0] - near[0]) + Math.abs(q[1] - near[1]) < Math.abs(m[0] - near[0]) + Math.abs(m[1] - near[1]) ? q : m) : fr[0] || dgRoomCentre(F.rooms[k]);
    at.room = k; [at.x, at.y] = c; trail = []; };
  // walks a list of tiles, one step at a time
  const steps = async (P, each, quiet) => { const F0 = Fl(), hx = P.length ? Math.sign(P[P.length - 1] % F0.w - at.x) || RS.dir || 1 : 1;   // a corridor scrolls one way for the whole walk, even round its corners
    for (const i of P) { const F = Fl(); if (each) { const r = await each(i); if (r) return r; } const ox = at.x; trail.unshift([at.x, at.y]); trail.length = Math.min(trail.length, 2); at.x = i % F.w; at.y = (i / F.w) | 0;
    if (F.t[i] === DG.DOOR) F.open[i] = 1; RS.pose = 'walk';
    const k = F.room[i];
    if (k < 0) { if (RS.bg !== hallBg) await deepCross(() => { RS.bg = hallBg; RS.props = RS.props.filter(p => p.follower); RS.x = 120; RS.tx = null; RS.dir = hx; RS.bgT = RS.bgOff || 0; RS.camJump = true; });
      RS.dir = hx; RS.bgT = (RS.bgT ?? RS.bgOff ?? 0) + hx * 7; }
    else { if (k !== at.room || RS.bg === hallBg) await deepCross(() => { at.room = k; enterRoom(); }); if (quiet) continue; RS.tx = sx(at.x); RS.pose = 'walk'; }
    draw(); await rwait(k < 0 ? 75 : 60); }
    if (RS.tx != null) { await rwait(160); RS.x = RS.tx; RS.tx = null; } RS.pose = 'idle'; };
  // the shortest way inside one room
  const inside = (F, k, to) => { const s = dgI(F, at.x, at.y); if (s === to) return []; const prv = new Map([[s, -1]]), q = [s];
    for (let h = 0; h < q.length; h++) { const i = q[h]; if (i === to) break; const x = i % F.w, y = (i / F.w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = dgI(F, x + dx, y + dy); if (prv.has(j) || !dgIn(F, x + dx, y + dy) || !dgPass(F.t[j]) || (F.room[j] !== k && j !== to)) continue; prv.set(j, i); q.push(j); } }
    if (!prv.has(to)) return []; const P = []; for (let i = to; i !== s; i = prv.get(i)) P.unshift(i); return P; };
  // a fight that sends the team back where it came from when all three lose
  const pushBack = () => { const F = Fl(), k = prev != null && prev !== at.room ? prev : F.upRoom; placeIn(k); prev = null; enterRoom(); };
  const afterFight = () => { if (T[lead].down && live().length) setLead(T.indexOf(live()[0])); };
  // one thing in a room, or a blocker on the way out of one
  const feature = async n => {
    const F = Fl(), i = dgI(F, n.x, n.y), nm = name(T[lead]);
    if (n.k === 'down') {
      if (n.locked) { K("The gate's shut. There has to be a lever somewhere on this floor."); await rwait(1500); return; }
      await sceneFade(true, 450); at.f++; const F2 = Fl(); placeIn(F2.upRoom); [at.x, at.y] = F2.up; prev = null;
      enterRoom(); look(); await sceneFade(false, 450);
      if (!used.includes('floor' + at.f)) { used.push('floor' + at.f); K(at.f === 2 ? (ring ? "It's the bottom of this ring. Whatever lives down here knows we're here." : "This is as deep as it goes. The guardian's down here somewhere.") : 'Watch your step. It goes deeper from here.'); await rwait(1300); }
      return; }
    if (n.k === 'up') { if (!at.f) return; await sceneFade(true, 450); at.f--; const F2 = Fl(); placeIn(F2.downRoom); [at.x, at.y] = F2.down; prev = null;
      enterRoom(); look(); await sceneFade(false, 450); return; }
    if (n.k === 'lever') { const lp = RS.props.find(p => p.k === 'lever'); if (lp) { await walkTo(lp.x - 18, 60, 'walk'); lp.on = true; } delete F.feat[i]; const d = F.feat[dgI(F, ...F.down)]; if (d) d.locked = false; rsfx('creak'); RS.shake = 4; K(`${nm} pulls the lever, and something heavy grinds open far away.`); await rwait(1600); return; }
    if (n.k === 'relic') { delete F.feat[i]; const r = rng(hashStr('relic|' + reg.n + '|' + n.id + '|' + exSeason())), item = RELICS[Math.floor(r() * RELICS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a';
      const rp = RS.props.find(p => p.k === 'relic'); if (rp) { deepCrew(T, lead, [rp.x + 26, rp.x + 48]); await walkTo(rp.x - 16, 60, 'walk'); unprop(rp); }
      addItem(item); found.push(`${a} ${item}`); gotItems.push(item); RS.pose = 'happy'; deepCrew(T, lead, [], 'happy'); setTimeout(() => deepCrewOff(T), 1600);
      let more = ''; if (r() < 0.4) { const t = deepTreasure(r), a2 = /^[AEIOU]/.test(t) ? 'an' : 'a'; addItem(t); found.push(`${a2} ${t}`); gotItems.push(t); more = ` There's ${a2} ${t} next to it.`; }
      K(`${nm} found ${a} ${item} on the floor.${more}`); await rwait(1800); return; }
    await scenery();
    const bag0 = { ...PLAYER.bag };
    if (n.k === 'event') { const r0 = await deepEvent(reg, n, g, T, leadOf, setLead, K, found, M, need); deepCrewOff(T); enterRoom(); if (r0 === 'fail') n.failed = r0 !== 'retry'; if (r0 !== 'fail' && r0 !== 'retry') delete F.feat[i]; return; }
    const r = await deepNode(reg, n, st, g, need, T, leadOf, setLead, K, used, found, M, () => day, at.f);
    for (const k in PLAYER.bag) if ((PLAYER.bag[k] || 0) > (bag0[k] || 0)) for (let c = bag0[k] || 0; c < PLAYER.bag[k]; c++) gotItems.push(k);   // what it found, in case the team has to run
    afterFight();
    if (r === 'fail') { if (n.k !== 'tear') n.failed = true; return 'fail'; }
    if (r === 'lost') { pushBack(); return 'lost'; }
    if (r === 'end') return 'end';
    if (n.k === 'seal' && r === 'open') { F.open[i] = 1; F.shut.delete(i); }
    if (n.k === 'block') F.shut.delete(i);
    if (DEEP_ONCE.includes(n.k) || (n.k === 'tear' && used.includes(n.id))) delete F.feat[i];
    if (F.room[i] >= 0) { at.room = F.room[i]; enterRoom(); }
  };
  // a trap in a corridor, played out in the scene: darts or arrows hit the leader unless its Speed gets it clear, a boulder rolls
  // through all three unless one of them is strong enough to stop it, a pit drops the leader in (rope gets it out faster), fire
  // from the walls hits the leader unless it's a Blaze Snabit, and gas gets everyone who isn't a Venom Snabit
  const trap = async e => { e.sprung = true; const L = T[lead], nm = name(L), team = live(), G0 = GROUND, x0 = RS.x;
    const hit = (m, sh) => deepHurt(m, clamp(sh / deepVs(m.s, 'grd', need), sh * 0.5, sh * 2)), dodge = Math.random() < clamp((deepVs(L.s, 'spd', need) - 0.8) * 0.45, 0, 0.5);
    const anim = async (n, f) => { for (let k = 0; k <= n; k++) { f(k / n); await rwait(16); } };
    const isEl = (m, el) => m.s.m.el1 === el || m.s.m.el2 === el;
    RS.pose = 'idle'; deepCrew(T, lead, []); await rwait(250);
    let line;
    if (e.trap === 1 || e.trap === 4) { const darts = e.trap === 1, fly = prop(darts ? { k: 'dart', x: RS.x + 170, y: G0 - 30 } : { k: 'arrow', x: RS.x + 110, y: G0 - 170, a: 2.3 }); rsfx('whiz');   // both come in from off the screen
      await anim(20, k => { fly.x = (darts ? RS.x + 170 : RS.x + 110) - k * (darts ? 162 : 104); if (!darts) fly.y = G0 - 170 + k * 144; if (dodge) RS.jy = -Math.sin(k * Math.PI) * 16; });
      unprop(fly);
      if (dodge) line = `${darts ? 'Darts came out of the wall' : 'Arrows came down from the ceiling'}, and ${nm} jumped clear!`;
      else { hit(L, 0.22); RS.pose = 'hurt'; spark(RS.x + 4, G0 - 30, 'star', 5); rsfx('thud'); line = `${darts ? 'Darts came out of the wall' : 'Arrows came down from the ceiling'} and hit ${nm}!`; } }
    else if (e.trap === 2) { const b = prop({ k: 'boulder', x: -30, y: G0, rot: 0 }), strong = team.slice().sort((a, c) => playerFighter(c.s).base.pow - playerFighter(a.s).base.pow)[0], stop = deepVs(strong.s, 'pow', need) >= 1.25;
      rsfx('rumble'); RS.shake = 3;
      if (stop) { const si = T.indexOf(strong); if (si !== lead) strong.goX = x0 - 56; await anim(30, k => { b.x = -30 + k * (x0 - 112 + 30); b.rot = k * 6; }); if (si !== lead) strong.act = 'happy'; else RS.pose = 'happy';
        line = `A boulder came rolling down the corridor, and ${name(strong)} stopped it!`; await rwait(500); }
      else { await anim(34, k => { b.x = -30 + k * 300; b.rot = k * 9; }); for (const m of team) hit(m, 0.14); RS.pose = 'hurt'; deepCrew(T, lead, [], 'hurt'); spark(RS.x, G0 - 24, 'dust', 6);
        line = `A boulder came rolling down the corridor and knocked everyone over!`; }
      unprop(b); }
    else if (e.trap === 3) { const pit = prop({ k: 'pit', x: x0, y: G0, w: 0 });
      // the floor gives way, the leader drops out of sight, the others run to the edge and get it back up
      rsfx('creak'); await anim(10, k => { pit.w = 24 * k; }); spark(x0, G0, 'dust', 8); RS.pose = 'hurt'; RS.clipY = G0 + 1;
      await anim(16, k => { RS.jy = -k * k * 90; }); rsfx('thud'); spark(x0, G0, 'dust', 6);
      deepCrew(T, lead, [x0 - 36, x0 + 36], 'lean'); await rwait(800);
      const rope = bag.Rope > 0; if (rope) { bag.Rope--; pit.rope = x0 - 36; hit(L, 0.06); line = `The floor gave way under ${nm}, and the others pulled it out on the rope.`; }
      else { hit(L, 0.3); line = `The floor gave way under ${nm}! It took a while to get it back out.`; }
      await anim(rope ? 45 : 90, k => { RS.jy = -90 * (1 - k) + (rope ? 0 : Math.sin(k * 40) * 2); });
      RS.clipY = null; pit.rope = null; await anim(14, k => { RS.jy = Math.sin(k * Math.PI) * 12; RS.x = x0 + k * 30; }); RS.jy = 0; RS.pose = 'hurt';
      deepCrew(T, lead, []); await rwait(400); await anim(10, k => { pit.w = 24 * (1 - k); }); unprop(pit); }
    else if (e.trap === 5) { const jets = [prop({ k: 'firejet', x: RS.x - 10, y: G0, a: 0 }), prop({ k: 'firejet', x: RS.x + 20, y: G0, a: 0 })];
      rsfx('creak'); await anim(12, k => jets.forEach(j => j.a = k)); await rwait(250); jets.forEach(j => j.on = true); rsfx('ember');   // the wall stones slide back first
      await rwait(700); jets.forEach(j => j.on = false);
      if (isEl(L, 'Blaze')) line = `Fire came out of the walls, and ${nm} didn't even blink.`;
      else if (dodge) line = `Fire came out of the walls, and ${nm} jumped clear!`;
      else { hit(L, 0.22); RS.pose = 'hurt'; line = `Fire came out of the walls and caught ${nm}!`; }
      await rwait(300); await anim(12, k => jets.forEach(j => j.a = 1 - k)); jets.forEach(unprop); }
    else { const gas = prop({ k: 'gas', x: RS.x - 20, y: G0, r: 10, a: 0 }); await anim(30, k => { gas.r = 10 + k * 40; gas.a = Math.min(0.7, k * 1.2); }); rsfx('puff');
      const ok = team.filter(m => isEl(m, 'Venom')), sick = team.filter(m => !isEl(m, 'Venom')); for (const m of sick) hit(m, 0.12);
      line = ok.length ? `Poison gas! ${name(ok[0])} doesn't mind it, but the others are coughing.` : 'Poison gas! Everyone through, quick!';
      deepCrew(T, lead, [], 'hurt'); RS.pose = sick.includes(L) ? 'hurt' : 'idle'; await anim(30, k => { gas.a = 0.7 * (1 - k); }); unprop(gas); }
    draw(); const down = T.filter(m => m.down && team.includes(m)); if (down.length) line += ` ${down.map(name).join(' and ')} can't go on.`;
    K(line); await rwait(1700); RS.pose = 'idle'; RS.jy = 0; deepCrewOff(T); afterFight(); };
  // a fight with a Snabit on patrol
  const patrol = async p => { await scenery(); const r = await deepNode(reg, { k: 'wild', id: p.id }, st, g, need, T, leadOf, setLead, K, used, found, M, () => day, at.f); afterFight();
    if (r === 'lost') { pushBack(); return 'lost'; } p.dead = true; enterRoom(); };
  // the patrols take a step: toward the team when it's two rooms away or less, otherwise now and then somewhere else. Never into camp
  const patrolsMove = () => { const F = Fl(), ok = e => !e.hidden && (e.block < 0 || !F.shut.has(e.block));
    for (const p of F.pats) { if (p.dead) continue; const D = dgHops(F, p.room, ok).D, d = D[at.room]; let e = null;
      if (d >= 0 && d <= 2 && Math.random() < 0.55) e = dgFirst(F, p.room, at.room, ok);
      else if (Math.random() < 0.35) { const L = F.adj[p.room].filter(ok); e = L[Math.floor(Math.random() * L.length)] || null; }
      if (!e) continue; const b = e.a === p.room ? e.b : e.a; if (b === F.upRoom || F.pats.some(o => o !== p && !o.dead && o.room === b)) continue;
      const fr = dgFree(F, b); if (!fr.length) continue; p.room = b; [p.x, p.y] = fr[Math.floor(Math.random() * Math.min(4, fr.length))]; } };
  // what the team's best nose picks up on walking into a room, from its Insight, and Walt notices it doing it: a hidden way, a
  // trap, or which way to go
  const notice = async () => { const F = Fl(), key = at.f + ':' + at.room; if (told.has(key)) return; told.add(key);
    const nose = live().slice().sort((a, b) => playerFighter(b.s).base.spr - playerFighter(a.s).base.spr)[0], p = clamp(0.45 * best('spr'), 0.15, 0.9), dir = e => dgDir(F, e, at.room), sn = name(nose);
    const sniff = () => { if (nose === T[lead]) { RS.pose = 'lean'; spark(RS.x, GROUND - 46, 'q', 3); } else { nose.act = 'lean'; if (nose.prop) spark(nose.prop.x, GROUND - 46, 'q', 3); } setTimeout(() => { nose.act = null; if (RS.pose === 'lean') RS.pose = 'idle'; }, 1600); };
    const hid = F.adj[at.room].find(e => e.hidden); if (hid && Math.random() < p) { hid.hidden = false; sniff(); K(`${sn} keeps sniffing at this wall. There's a draught coming through a crack.`); await rwait(1700); return; }
    const tr = F.adj[at.room].find(e => e.trap && !e.sprung && !e.hinted); if (tr && Math.random() < p) { tr.hinted = true; sniff(); K(`${sn} won't go near the way ${dir(tr)}. Something's wrong over there.`); await rwait(1700); return; }
    const dn = F.feat[dgI(F, ...F.down)], lv = Object.values(F.feat).find(n => n.k === 'lever'), goal = dn && dn.locked && lv ? lv : dn;
    if (goal && !F.seen[dgI(F, goal.x, goal.y)] && Math.random() < p) { const e = dgFirst(F, at.room, roomOf(F)(goal), e => !e.hidden); if (e) { sniff();
      K(`${sn} keeps looking ${dir(e)}. ` + (goal.k === 'lever' ? "There's something over there it wants us to see." : at.f === 2 ? "I think the guardian's that way." : "I think the way down is over there.")); await rwait(1700); } } };
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
    if (r === 'back' || r === 'lost') { if (r === 'back') { placeIn(a, [at.x, at.y]); enterRoom(); } return r; }
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
    // a ration each: one that goes without gets back half its energy and a little HP
    const L = live(), fed = Math.min(L.length, bag.Ration || 0); bag.Ration = (bag.Ration || 0) - fed;
    nights--; await campNight(`${where} · night ${day}`, fed === L.length ? "We'll camp here tonight." : fed ? `We'll camp here tonight. There isn't enough food for everyone.` : "We'll camp here tonight, with nothing to eat."); enterRoom();
    L.forEach((m, k) => { const ate = k < fed; m.e = ate ? m.max : Math.max(m.e, Math.round(m.max / 2)); m.hp = Math.min(m.hpMax, m.hp + Math.round(m.hpMax * (ate ? 0.6 : 0.2))); });
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
    const s0 = RS; s0.bg = `deep:${reg.el}:room:plain:0`; s0.trip = true; s0.night = 0; s0.dusk = 0; s0.props = []; s0.x = 90; s0.pose = 'idle'; s0.camJump = true; s0.tripLabel = where; drawUI();
    stop = deepFollow(T, () => T[lead]);
    await sceneFade(false, 700); banner(where, '#fff'); K('Only League teams come out this far. We camp here, by the entrance.'); await rwait(1400); banner('');
    el('r-panel').innerHTML = `<canvas id="dp-team" class="full" style="width:100%;display:block"></canvas><canvas id="ex-map" class="full" style="width:100%;display:block"></canvas><div id="dp-acts" class="full dp-acts"></div>`;
    el('ranch').classList.add('exploring');
    look(); enterRoom();
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
        if (c.t === 'act') { const F = Fl(); await steps(inside(F, at.room, dgI(F, c.n.x, c.n.y)), null, true); const pr = RS.props.find(q => q.nid === c.n.id); if (pr && Math.abs(RS.x - (pr.x - 24)) > 2) await walkTo(pr.x - 24, 60, 'walk'); r = await feature(c.n); look(); if (c.n.k !== 'down' && c.n.k !== 'up') await notice(); }
        if (c.t === 'camp') await camp();
        if (c.t === 'back') for (let k = 0; k < 40 && at.room !== Fl().upRoom && live().length; k++) { const e = dgFirst(Fl(), at.room, Fl().upRoom); if (!e) break; r = await go(e); if (r) break; }
        if (c.t === 'item') await useItem(c.k);
        if (r === 'end') break;
        saveGame();
      }
    } finally { stop && stop(); DEEP_LIVE.pick = null; DEEP_LIVE.el = null; el('ranch').classList.remove('exploring'); el('r-panel').innerHTML = ''; }
    // a team that had to run leaves the relics and half of what else it found behind, and the League pays for nothing until a
    // team of its own goes back (deepLeftBehind, deepWeek in deep-pack.js). A team that comes home gets paid for the lot
    const lost = [], tally = T.tally || { wild: 0, beat: [], bits: 0 };
    if (retreat) gotItems.forEach((k, j) => { if ((RELICS.includes(k) || TREASURES.includes(k) || j % 2 === 0) && PLAYER.bag[k] > 0) { PLAYER.bag[k]--; if (!PLAYER.bag[k]) delete PLAYER.bag[k]; lost.push(k); } });
    const left = retreat && (lost.length || tally.bits > 0); if (left) deepLeftBehind(reg, lost.slice(), tally.bits);
    const pay = retreat ? 0 : tally.bits, n = tally.n || 0;
    if (pay) PLAYER.bits += pay;
    const league = !pay ? '' : n ? ` You beat ${n} Snabit${n > 1 ? 's' : ''} down there and the League is paying you ${pay.toLocaleString()} bits for it.` : ` The League is paying you ${pay.toLocaleString()} bits for what you found.`;
    for (const k in bag) if (bag[k] > 0) addItem(k, bag[k]);   // what's left in the pack goes back in the bag
    // the team comes home: the ranch Snabit takes its place again, and all three carry the trip
    for (const k of DEEP_KEYS) home[k] = RS[k]; RS = home; RS.props = []; drawUI();
    const hurt = [];
    for (const m of T) { m.s.fatigue = Math.min(100, m.s.fatigue + Math.round(20 * tireMul(m.s))); m.s.stress = Math.min(100, m.s.stress + 8);
      if (m.down) { m.s.injured = true; m.s.used = (m.s.used || 0) + deepLife(g, ring); hurt.push(name(m)); } }
    clampAll();
    for (const m of T) if (m.s !== home) { const e = PLAYER.roster.find(r => r.id === m.s.id); if (e) e.st = packRanch(m.s); }
    const keep = found.filter(f => !lost.some(k => f.endsWith(' ' + k)) || (lost.splice(lost.findIndex(k => f.endsWith(' ' + k)), 1), false));
    // said in short sentences: how many things came home and the best of them, never the whole list (Gid, 17 Nov 2026)
    const best = keep.find(f => TREASURES.some(k => f.endsWith(' ' + k))) || keep.find(f => RELICS.some(k => f.endsWith(' ' + k)));
    const brought = keep.length === 1 ? `We brought home ${keep[0]}.` : keep.length ? `We brought home ${keep.length} things.${best ? ` One of them is ${best}.` : ''}` : '';
    const got = (keep.length ? brought : left ? '' : "We didn't find anything this time.") + league + (left ? ` We had to leave ${keep.length ? 'the rest' : 'everything we found'} down there when we ran. I'll ask the League to send a team after it.` : '');
    const whoHurt = hurt.length === T.length && T.length > 1 ? (T.length === 2 ? 'Both of them' : 'All three') : hurt.join(' and ');
    const mo = deepLife(g, ring) / 4, ow = hurt.length ? ` ${whoHurt} came home hurt, and it cost ${hurt.length > 1 ? 'each of them' : 'it'} ${mo} month${mo > 1 ? 's' : ''} of ${hurt.length > 1 ? 'their' : 'its'} prime.` : '';
    await tripHome(`${retreat ? 'We made it out.' : 'Time to head back.'}${got ? ' ' + got : ''}${ow}`, "We're back at the ranch. Everyone will sleep well tonight.", keep.length && !hurt.length ? 'happy' : 'idle');
    RS.weekAct = 'Expedition'; await endWeek(2, `${T.length === 1 ? name(T[0]) : 'The team'} explored ${ring ? reg.n.replace('The Rift, ', '') + ' of the Rift' : 'deep ' + reg.n}.`);   // Walt has already said what came home
  });
}

/* the buttons under the map: what's in this room, the ways out, the camp and the pack. Resolves with what was picked */
function deepChoose(M, at, T, lead, vis, prev, nights, bag, boxes) {
  const F = M.floors[at.f], box = el('dp-acts'), opts = [], room = n => F.room[dgI(F, n.x, n.y)];
  for (const n of Object.values(F.feat)) if (room(n) === at.room && (DEEP_ACT[n.k] || n.k === 'event') && !(n.k === 'up' && !at.f) && !n.failed) opts.push({ t: 'act', n, label: n.k === 'event' ? DEEP_EV[n.ev].act : n.k === 'down' && n.locked ? 'The gate' : DEEP_ACT[n.k], sub: '' });
  if (at.room === F.upRoom) opts.push({ t: 'camp', label: 'Camp', sub: nights ? `${nights} night${nights > 1 ? 's' : ''} left` : 'No supplies left', off: !nights });
  for (const e of F.adj[at.room]) { if (e.hidden) continue; const b = e.a === at.room ? e.b : e.a, bl = e.block >= 0 && F.feat[e.block] && F.shut.has(e.block) ? F.feat[e.block] : null;
    let sub;
    if (bl) sub = bl.failed ? "We can't get through" : bl.k === 'seal' ? 'A sealed door' : "Something's in the way";
    else if (b === prev) sub = 'Back the way we came';
    else if (!vis.has(b)) sub = F.rooms[b].been ? 'Been there' : 'Not explored yet';
    else { const L = Object.values(F.feat).filter(n => room(n) === b && (DEEP_SEE[n.k] || n.k === 'event') && !(n.k === 'up' && !at.f)).map(n => n.k === 'event' ? DEEP_EV[n.ev].see : DEEP_SEE[n.k]);
      if (F.pats.some(p => !p.dead && p.room === b)) L.unshift('a wild Snabit'); if (b === F.upRoom) L.push('the camp');
      sub = L.length ? capFirst(L.slice(0, 2).join(' and ')) : 'An empty room'; }
    if (e.hinted && !e.sprung) sub += '. Something feels off';
    const dir = dgDir(F, e, at.room), deg = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'].indexOf(dir) * 45;
    opts.push({ t: 'exit', e, to: b, label: `<i class="dp-arr" style="transform:rotate(${deg}deg)"></i>${capFirst(dir)}`, sub, off: bl && bl.failed }); }
  if (at.room !== F.upRoom && dgFirst(F, at.room, F.upRoom)) opts.push({ t: 'back', label: 'Back to camp', sub: (n => `${n} room${n > 1 ? 's' : ''}`)(dgHops(F, at.room).D[F.upRoom]) });
  for (const k of Object.keys(bag)) if (bag[k] > 0 && !['Rope', 'Ration', "Pathfinder's compass"].includes(k)) opts.push({ t: 'item', k, label: `Use ${/^[AEIOU]/.test(k) ? 'an' : 'a'} ${k.toLowerCase()}`, sub: `${bag[k]} in the pack` });
  if (bag.Rope > 0) opts.push({ t: 'none', label: `Rope ×${bag.Rope}`, sub: 'For getting out of a pit', off: true });
  opts.push({ t: 'home', label: 'Head home', sub: 'Keeps everything found so far' });
  F.rooms[at.room].been = true;
  return new Promise(res => {
    // what was picked stays on show, greyed out, until the next room's choices replace it, so nothing on screen moves
    const cv = el('ex-map'), tc = el('dp-team'), done = v => { cv.onpointerdown = null; tc.onpointerdown = null; DEEP_LIVE.pick = null; box.querySelectorAll('button').forEach(b => b.disabled = true); res(v && v.t === 'home' ? null : v); };
    const arrows = deepArrows(cv, F, at, opts.filter(o => o.t === 'exit'));
    let pack = false;
    const bar = () => { const L = pack ? opts.filter(o => o.t === 'item').concat([{ t: 'back2', label: 'Close the pack' }]) : opts.filter(o => o.t !== 'exit' && o.t !== 'item' && o.t !== 'none');
      if (!pack && opts.some(o => o.t === 'item' || o.t === 'none')) L.splice(L.length - 1, 0, { t: 'pack', label: 'The pack', sub: Object.entries(bag).filter(([k, n]) => n > 0).map(([k, n]) => `${n} ${k.toLowerCase()}`).join(', ') });
      box.innerHTML = L.map((o, i) => `<button class="rb" data-o="${i}" ${o.off ? 'disabled' : ''}>${o.label}${o.sub ? `<small>${o.sub}</small>` : ''}</button>`).join('');
      box.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const o = L[+b.dataset.o]; if (o.t === 'pack' || o.t === 'back2') { pack = o.t === 'pack'; bar(); return; } done(o); }); };
    bar();
    // a tap on the map: an arrow, or a room next to this one, goes that way
    cv.onpointerdown = e => { const b = cv.getBoundingClientRect(), px = e.clientX - b.left, py = e.clientY - b.top, a = arrows.find(a => Math.hypot(a.x - px, a.y - py) < 18);
      if (a) { if (!a.o.off) done(a.o); return; }
      const V = deepView(cv, F, at), x = Math.floor((px + V.ox) / V.ts), y = Math.floor((py + V.oy) / V.ts), k = dgIn(F, x, y) ? F.room[dgI(F, x, y)] : -1;
      const o = opts.find(o => o.t === 'exit' && o.to === k && !o.off); if (o) done(o); };
    tc.onpointerdown = e => { const b = tc.getBoundingClientRect(), px = e.clientX - b.left, i = boxes.findIndex(([a, z]) => px >= a && px <= z); if (i >= 0) done({ t: 'sw', i }); };
    DEEP_LIVE.pick = { opts, take: i => done(opts[i]), home: () => done(null), at, M, T, nights };
  });
}
// an arrow on the map at each way out of the room, pointing out of it: gold, orange with a ! when someone sensed a trap, grey
// with a cross when the team couldn't get through. Returns where they are, for taps
function deepArrows(cv, F, at, exits) {
  const V = deepView(cv, F, at), x = cv.getContext('2d'), d = devicePixelRatio || 1, out = []; x.setTransform(d, 0, 0, d, 0, 0);
  for (const o of exits) { const P = dgWay(o.e, at.room), door = P.find(i => F.room[i] !== at.room) ?? P[P.length - 1], deg = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'].indexOf(dgDir(F, o.e, at.room)) * 45, a = deg * Math.PI / 180;
    const ax = clamp((door % F.w) * V.ts + V.ts / 2 - V.ox + Math.cos(a) * 6, 14, V.W - 14), ay = clamp(((door / F.w) | 0) * V.ts + V.ts / 2 - V.oy + Math.sin(a) * 6, 14, V.H - 14);
    const warn = o.e.hinted && !o.e.sprung, col = o.off ? '#9a8f80' : warn ? '#e07a2c' : '#e0a83a';
    SC.depth(x, () => { x.beginPath(); x.arc(ax, ay, 11, 0, 7); }, col, 2, 0.3); x.strokeStyle = '#fff6dc'; x.lineWidth = 1.6; x.beginPath(); x.arc(ax, ay, 11, 0, 7); x.stroke();
    x.save(); x.translate(ax, ay); x.fillStyle = '#fff6dc';
    if (o.off) { x.strokeStyle = '#fff6dc'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(-4, -4); x.lineTo(4, 4); x.moveTo(4, -4); x.lineTo(-4, 4); x.stroke(); }
    else { x.rotate(a); x.beginPath(); x.moveTo(7, 0); x.lineTo(0, -6); x.lineTo(0, -2.4); x.lineTo(-6, -2.4); x.lineTo(-6, 2.4); x.lineTo(0, 2.4); x.lineTo(0, 6); x.closePath(); x.fill(); }
    x.restore(); if (warn) { x.fillStyle = '#7a2a12'; x.font = '800 10px Fredoka, system-ui'; x.fillText('!', ax + 8, ay - 8); }
    out.push({ x: ax, y: ay, o }); }
  return out;
}
(function deepStyle() { const s = document.createElement('style'); s.textContent = `.dp-acts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:44px;gap:6px;margin:4px 0 0;height:100px;padding-bottom:4px;overflow-y:auto;overscroll-behavior:contain}
  .dp-acts .rb{margin:0;min-width:0;padding:3px 7px;font-size:12px;line-height:1.15;min-height:0;display:flex;flex-direction:column;justify-content:center}.dp-acts .rb small{font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dp-arr{display:inline-block;width:12px;height:12px;margin-right:5px;vertical-align:-1px;background:currentColor;clip-path:polygon(0 35%,55% 35%,55% 8%,100% 50%,55% 92%,55% 65%,0 65%)}`; document.head.appendChild(s); })();

/* ---------- the map ---------- */
const DEEP_TS = 16, DEEP_MAP_H = 164;   // tile size and map height on screen
// where the map's view sits: centred on the leader, kept inside the floor
function deepView(cv, F, at) { const W = cv.clientWidth || 340, H = DEEP_MAP_H, ts = DEEP_TS;
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
  if (n.k === 'spring') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id); const sp = deepUse({ k: 'spring', x: 150, y: GROUND }, n); deepCrew(T, leadOf(), []); await walkTo(sp.x - 26, 60, 'walk'); s.pose = 'eat'; spark(sp.x, GROUND - 10, 'drip', 8); rsfx('splash'); await rwait(900); s.pose = 'happy'; deepCrew(T, leadOf(), [], 'happy');
    for (const m of T) if (!m.down) { m.e = Math.min(m.max, m.e + 3); m.hp = Math.min(m.hpMax, m.hp + Math.round(m.hpMax * 0.15)); } K("There's fresh water here. Drink up, all of you."); await rwait(1300); unprop(sp); deepCrewOff(T); return; }
  if (n.k === 'chest') { if (once) { K('The chest here is empty now.'); await rwait(900); return; }
    const c = deepUse({ k: 'chest', x: 150, y: GROUND }, n); deepCrew(T, leadOf(), []); await walkTo(c.x - 24, 60, 'walk'); await rwait(300);
    await rwait(400); c.open = true; rsfx('creak'); s.pose = 'happy'; deepCrew(T, leadOf(), [], 'happy'); spark(c.x, GROUND - 22, 'sparkle', 6);
    const R = rng(hashStr('deep' + reg.n + n.id + '|' + exSeason())), tr = f === 2 && R() < 0.15, item = tr ? deepTreasure(R) : R() < 0.5 ? EX_RARE[Math.floor(R() * EX_RARE.length)] : EX_FINDS[Math.floor(R() * EX_FINDS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a';
    addItem(item); found.push(`${a} ${item}`); st.got.push(n.id); K(`${nm} found ${a} ${item} in an old chest.`);
    if (T.lucky) { T.lucky = false; const x2 = EX_RARE[Math.floor(R() * EX_RARE.length)], a2 = /^[AEIOU]/.test(x2) ? 'an' : 'a'; addItem(x2); found.push(`${a2} ${x2}`); await rwait(1300); K(`And there's ${a2} ${x2} under it. That waystone was right.`); }   // luck from a waystone (deep-more.js)
    await rwait(1400); unprop(c); deepCrewOff(T); return; }
  if (n.k === 'wild') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id);
    const G = GRADE_INFO[g], foe = gradedOpponent(g, Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * [0.4, 0.55, 0.7][f]), Math.random, reg.el), prize = Math.round(G.purse * [0.4, 0.5, 0.6][f]);   // deeper floors, stronger Snabits
    const fp = await deepFoeIn(foe);
    const won = await deepFight(T, leadOf(), foe, 'Wild', K, { fp, where: 'A wild Snabit', line: `A wild ${foe.m.name} caught up with us.` }); if (T[leadOf()].down && T.some(m => !m.down)) setLead(T.findIndex(m => !m.down));
    if (won) { deepPay(T, 'wild', prize); RS.pose = 'happy'; deepCrew(T, leadOf(), [], 'happy'); K(DEEP_WON[Math.floor(Math.random() * DEEP_WON.length)]); await rwait(1300); deepCrewOff(T); return; }
    used.splice(used.indexOf(n.id), 1); K(`That ${foe.m.name} beat ${deepAll(T)}.`); await rwait(1400); return 'lost'; }
  if (n.k === 'guard') {
    const [tName, fam] = TEACHER[reg.el], G = GRADE_INFO[g], R = rng(hashStr('guard' + reg.n)), foe = gradedOpponent(g, G.lv[1], R, null, null, randomOpponent(R, fam)); foe.boss = tName;
    const fp = await deepFoeIn(foe);
    const won = await deepFight(T, leadOf(), foe, tName, K, { fp, where: 'The guardian', line: `That's ${tName}. Nobody gets past without a fight.` });
    if (!won) { K(`${tName} beat ${deepAll(T)}.`); await rwait(1600); return 'lost'; }
    const alive = T.findIndex(m => !m.down); if (alive >= 0 && T[leadOf()].down) setLead(alive);
    const sp = EX_DEEP_STONE[reg.n], L0 = sp && stoneList(), have = L0 ? L0.includes(sp) : once;   // a save that beat this guardian when it guarded two items still finds the stone
    if (sp && !have) { const p = prop({ k: 'pstone', x: 170, y: GROUND, glow: true, sp }); await walkTo(140, 60, 'walk'); RS.pose = 'happy'; if (!once) st.got.push(n.id); const L = stoneList(); if (L && !L.includes(sp)) L.push(sp);
      found.push('a Pattern Stone'); spark(170, GROUND - 40, 'sparkle', 8); banner('A Pattern Stone', '#ffe9a8'); K("Look behind it. Someone painted a pattern on that stone, and the Snaboscope's humming at it."); await rwait(2800); banner(''); unprop(p); return 'end'; }
    let gift = '';
    if (!once) { st.got.push(n.id); const R2 = rng(hashStr('guardchest' + reg.n)), items = [EX_RARE[Math.floor(R2() * 3)], typeof deepTreasure === 'function' ? deepTreasure(R2) : EX_RARE[Math.floor(R2() * 3)]]; items.forEach(addItem); found.push(...items.map(i => `${/^[AEIOU]/.test(i) ? 'an' : 'a'} ${i}`)); gift = ` It was guarding ${items.map(i => `${/^[AEIOU]/.test(i) ? 'an' : 'a'} ${i}`).join(' and ')}.`; }
    deepPay(T, tName, Math.round(G.purse * 1.5));
    RS.pose = 'happy'; deepCrew(T, leadOf(), [], 'happy'); K(`You beat ${tName}!${gift}`); await rwait(2000); return 'end'; }
  // an obstacle: whoever is best at it takes it on and the others help it (Gid, 17 Nov 2026: let them work together).
  // A helper adds a quarter of its own stat. With one Snabit left, it does everything itself
  const leadI = leadOf(), team = T.map((m, i) => ({ m, i })).filter(o => !o.m.down), stat = (m, k) => playerFighter(m.s).base[EX_KEY[k]];
  const take = async (k, seed, not) => {
    const pool = team.filter(o => o.i !== not), who = (pool.length ? pool : team).slice().sort((a, b) => stat(b.m, k) - stat(a.m, k))[0];
    const v = stat(who.m, k) + team.filter(o => o !== who).reduce((a, o) => a + stat(o.m, k) * 0.25, 0), ok = v >= need * n.mul;
    if (who.i !== leadOf()) { K(`${displayName(who.m.s)}, this one's yours.`); await rwait(900); await sceneFade(true, 200); setLead(who.i); RS.props = RS.props.filter(p => p.follower); RS.x = 70; RS.camJump = true; await sceneFade(false, 200); }
    deepCrew(T, leadOf(), [46, 26]); await walkTo(100, 70, 'walk');
    await exObstacle(k, ok, seed); deepCrew(T, leadOf(), [46, 26], ok ? 'happy' : 'tired');
    if (!ok) who.m.e -= 3;
    K((ok ? EX_WIN : EX_LOSE)[k](displayName(who.m.s))); await rwait(ok ? 1100 : 1500); deepCrewOff(T);
    return { who, ok };
  };
  const a1 = await take(n.stat, hashStr(reg.n + n.id));
  if (!a1.ok) { setLead(leadI); return 'fail'; }
  if (!n.stat2) { setLead(leadI); return; }
  K("There's more past it."); await rwait(900);
  const a2 = await take(n.stat2, hashStr(reg.n + n.id + '2'), a1.who.i);
  setLead(leadI);
  return a2.ok ? null : 'fail';
}
