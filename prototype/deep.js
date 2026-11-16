/* Deep expeditions for a team of three (STORY/WORLD.md, Team expeditions; Gid's calls on 15 Nov 2026).
   They open from grade C, a region at a time, once that region's regular map has been crossed to its far end. The team
   walks in a line and the leader faces everything. Switching the leader costs the incoming Snabit 1 energy. A deep map is
   eleven columns with two camps: a camp ends the day, gives energy back and brings back anyone who's out. Fights are a tag
   team, where the next Snabit steps in against whatever HP the last one left, and a Snabit that loses is out until the next
   camp. The far end has the region's teacher as a guardian, and the deep maps of Dream Garden and Hollow Moor hold the
   Kitsune and Vampire stones. Needs explore.js and explore-art.js. */

const DEEP_GRADE = { E: 'D', D: 'C', C: 'B', B: 'A', A: 'S', S: 'S' };
const deepRegions = () => rankIdx() >= 2 ? REGIONS.filter((r, i) => i < (typeof tripRegionCount === 'function' ? tripRegionCount() : 4) && exState(r).got.includes('6:1')) : [];
function deepState(reg) { const X = PLAYER.deep = PLAYER.deep || {}; return X[reg.n] = X[reg.n] || { seen: ['0:1'], got: [], season: -1 }; }

/* eleven columns: the start camp, finds, an obstacle, finds, a camp, finds, an obstacle for two, finds, a camp, a harder
   obstacle, and the guardian. The same every time for a region */
function deepMap(reg) {
  const R = rng(hashStr('deep|' + reg.n)), N = {}, E = [], id = (c, r) => c + ':' + r, finds = ['path', 'chest', 'spring', 'wild', 'chest', 'wild', 'path'];
  for (let c = 0; c <= 10; c++) for (let r = 0; r < 3; r++) {
    const one = c === 0 || c === 10, mid = r === 1;
    if (one && !mid) continue;
    let n;
    if (c === 0) n = { k: 'camp', start: true };
    else if (c === 10) n = { k: 'guard' };
    else if (c === 4 || c === 8) n = mid ? { k: 'camp' } : { k: finds[Math.floor(R() * finds.length)] };
    else if (c === 2 || c === 6 || c === 9) { const st = [1, 2, 3, 4, 5].sort(() => R() - 0.5); n = { k: 'block', stat: st[r], mul: c === 2 ? 1 + R() * 0.1 : c === 6 ? 1.02 + R() * 0.1 : 1.1 + R() * 0.12 };
      if (c === 6) n.stat2 = st[(r + 2) % 5]; }
    else n = { k: finds[Math.floor(R() * finds.length)] };
    N[id(c, r)] = { ...n, c, r, id: id(c, r) };
  }
  if (reg.ring != null && typeof riftLairs === 'function') riftLairs(reg, N);   // a Deep Rift ring's lairs (horror.js)
  for (let c = 0; c < 10; c++) {
    const here = Object.values(N).filter(n => n.c === c), next = Object.values(N).filter(n => n.c === c + 1);
    for (const a of here) for (const b of next) if (Math.abs(a.r - b.r) <= 1 && (here.length === 1 || next.length === 1 || R() < 0.7)) E.push([a.id, b.id]);
    for (const b of next) if (!E.some(e => e[1] === b.id)) { const a = here.reduce((m, x) => Math.abs(x.r - b.r) < Math.abs(m.r - b.r) ? x : m); E.push([a.id, b.id]); }
    for (const a of here) if (!E.some(e => e[0] === a.id)) { const b = next.reduce((m, x) => Math.abs(x.r - a.r) < Math.abs(m.r - a.r) ? x : m); E.push([a.id, b.id]); }
  }
  return { N, E, near: k => E.filter(e => e[0] === k || e[1] === k).map(e => e[0] === k ? e[1] : e[0]), off: 0, cols: 11 };
}

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
function deepEnergyMax(s) { const f = playerFighter(s), avg = (f.base.pow + f.base.grd + f.base.mnd + f.base.spr + f.base.spd) / 5; return 10 + Math.round(6 * clamp(f.base.sta / Math.max(1, avg), 0.5, 1.5)); }

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
async function runDeep(reg, team) {
  const home = RS, st = deepState(reg), M = deepMap(reg), g = reg.ring != null ? riftGrade(reg) : DEEP_GRADE[exGrade(reg)], need = exNeed(g), areas = TRIP_AREAS[reg.el], K = t => say(t, 'guide'), found = [];
  if (reg.ring == null && typeof horrorTear === 'function') horrorTear(reg, M);   // a tear with a horror in it, now and then from grade A
  const where = reg.ring != null ? reg.n : `${reg.n}, deep`;   // a Deep Rift ring has its own name
  const T = team.map(s => { const max = deepEnergyMax(s); return { s, e: max, max, out: false }; });
  let lead = 0, at = '0:1', blocked = [], used = [], day = 1, stop = null;
  st.season = exSeason(); saveGame();
  await scene(async () => {
    deepLead(T[0].s);
    await tripLeave(`Walt has a League permit for ${reg.ring != null ? reg.n.replace('The Rift, ', '') + ' of the Rift' : 'deep ' + reg.n}. ${T.map(m => displayName(m.s)).join(', ')} go with him for two weeks.`);
    const s0 = RS; s0.bg = `area:${reg.el}:${areas[2].key}`; s0.trip = true; s0.night = 0; s0.dusk = 0; s0.props = []; s0.x = 90; s0.pose = 'idle'; s0.camJump = true; s0.tripLabel = where; drawUI();
    stop = deepFollow(T, () => T[lead]);
    await sceneFade(false, 700); banner(where, '#fff'); K('Only League teams come out this far. Stay close, you three.'); await rwait(1400); banner('');
    el('r-panel').innerHTML = `<canvas id="dp-team" class="full" style="width:100%;display:block"></canvas><canvas id="ex-map" class="full" style="width:100%;display:block"></canvas><button class="rb full" id="ex-home">Head home<small>Keeps everything found so far</small></button>`;
    el('ranch').classList.add('exploring');
    try {
      for (;;) {
        for (const k of M.near(at)) if (!st.seen.includes(k)) st.seen.push(k);
        const col = M.N[at].c; M.off = clamp(col - 3, 0, 4);
        const boxes = deepTeamDraw(el('dp-team'), T, lead), P = exDraw(el('ex-map'), M, st, at, null, 1, blocked, `${where} · Day ${day}`);
        if (!T.some(m => !m.out && m.e > 0)) { K(T.every(m => m.out) ? "That's all three of you down. We're going home." : "You're all worn out. We're going home."); await rwait(1800); break; }
        if (T[lead].out || T[lead].e <= 0) { const nx = T.findIndex(m => !m.out && m.e > 0); lead = nx; deepLead(T[lead].s); K(`${displayName(T[lead].s)}, you go in front.`); await rwait(900); continue; }
        const pick = await deepPick(el('dp-team'), boxes, el('ex-map'), M, P, at, blocked);
        if (!pick) break;
        if (pick.sw != null) { const m = T[pick.sw]; if (pick.sw === lead || m.out || m.e < 1) continue; m.e -= 1; lead = pick.sw; deepLead(m.s); K(`${displayName(m.s)}, you go in front.`); await rwait(700); continue; }
        const to = pick.to, n = M.N[to], back = at, L = T[lead]; L.e -= 1; at = to;
        exDraw(el('ex-map'), M, st, at, null, 1, blocked, `${where} · Day ${day}`); deepTeamDraw(el('dp-team'), T, lead);
        await sceneFade(true, 250); RS.props = []; RS.parts = []; RS.bg = `area:${reg.el}:${areas[Math.min(3, 1 + Math.floor(n.c / 4))].key}`; RS.x = 70; RS.camJump = true; RS.jy = 0; await sceneFade(false, 250);
        const r = await deepNode(reg, n, st, g, need, T, () => lead, i => { lead = i; deepLead(T[i].s); }, K, used, found, M, () => day);
        if (r === 'fail') { blocked.push(to); at = back; }
        if (r === 'camp') { day++; }
        if (r === 'end') break;
        saveGame();
      }
    } finally { stop && stop(); el('ranch').classList.remove('exploring'); el('r-panel').innerHTML = ''; }
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
function deepPick(tc, boxes, cv, M, P, at, blocked) {
  return new Promise(res => {
    const near = M.near(at).filter(k => !blocked.includes(k)), done = v => { cv.onpointerdown = null; tc.onpointerdown = null; res(v); };
    cv.onpointerdown = e => { const b = cv.getBoundingClientRect(), px = e.clientX - b.left, py = e.clientY - b.top;
      const hit = near.find(k => { const [cx, cy] = P(M.N[k]); return Math.hypot(px - cx, py - cy) < 22; }); if (hit) done({ to: hit }); };
    tc.onpointerdown = e => { const b = tc.getBoundingClientRect(), px = e.clientX - b.left, i = boxes.findIndex(([a, z]) => px >= a && px <= z); if (i >= 0) done({ sw: i }); };
    const h = el('ex-home'); if (h) h.onclick = () => done(null);
  });
}
/* one circle on a deep map */
async function deepNode(reg, n, st, g, need, T, leadOf, setLead, K, used, found, M, dayOf) {
  const s = RS, once = st.got.includes(n.id), nm = displayName(T[leadOf()].s);
  await walkTo(110, 70, 'walk'); s.pose = 'idle';
  if (n.k === 'tear' || n.k === 'lair') return horrorNode(reg, n, g, T, leadOf, setLead, K, used, found);
  if (n.k === 'path') { await rwait(250); return; }
  if (n.k === 'camp') {
    if (n.start || used.includes(n.id)) { await rwait(300); return; } used.push(n.id);
    for (const m of T) { m.out = false; m.e = Math.min(m.max, Math.max(0, m.e) + 8); }
    await campNight(`${reg.ring != null ? reg.n : reg.n + ', deep'} · night ${dayOf()}`, "We'll camp here tonight.");
    // overnight a wild Snabit can wander onto a path next to camp
    if (Math.random() < 0.5) { const k = M.near(n.id).find(k => M.N[k].c > n.c && M.N[k].k === 'path'); if (k) { M.N[k].k = 'wild'; K('Something was moving around out there last night. Keep your eyes open.'); await rwait(1200); } }
    return 'camp'; }
  if (n.k === 'spring') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id); const sp = prop({ k: 'spring', x: 150, y: GROUND }); await walkTo(124, 60, 'walk'); s.pose = 'happy'; spark(150, GROUND - 10, 'drip', 8); rsfx('splash');
    for (const m of T) if (!m.out) m.e = Math.min(m.max, m.e + 3); K("There's fresh water here. Drink up, all of you."); await rwait(1300); unprop(sp); return; }
  if (n.k === 'chest') { if (once) { K('The chest here is empty now.'); await rwait(900); return; }
    const c = prop({ k: 'chest', x: 150, y: GROUND }); await walkTo(126, 60, 'walk'); await rwait(300); c.open = true; rsfx('creak'); s.pose = 'happy'; spark(150, GROUND - 22, 'sparkle', 6);
    const R = rng(hashStr('deep' + reg.n + n.id)), item = R() < 0.5 ? EX_RARE[Math.floor(R() * EX_RARE.length)] : EX_FINDS[Math.floor(R() * EX_FINDS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a';
    addItem(item); found.push(`${a} ${item}`); st.got.push(n.id); K(`${nm} found ${a} ${item} in an old chest.`); await rwait(1400); unprop(c); return; }
  if (n.k === 'wild') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id);
    const G = GRADE_INFO[g], foe = gradedOpponent(g, Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * 0.5), Math.random, reg.el), prize = Math.round(G.purse * 0.5);
    const fp = prop({ k: 'foe', x: 186, y: GROUND, fm: foe.fm }); banner('A wild Snabit', '#ffd23f'); K(`A wild ${foe.m.name} is in the way.`); await rwait(1300); banner(''); unprop(fp);
    const won = await deepFight(T, leadOf(), foe, 'Wild', K); if (T[leadOf()].out && T.some(m => !m.out)) setLead(T.findIndex(m => !m.out));
    if (won) { PLAYER.bits += prize; drawUI(); found.push(`${prize.toLocaleString()} bits`); RS.pose = 'happy'; K(`You did it! The League pays ${prize.toLocaleString()} bits for that one.`); await rwait(1400); return; }
    K(`That ${foe.m.name} beat all three of you. We're going home.`); await rwait(1400); return 'end'; }
  if (n.k === 'guard') {
    const [tName, fam] = TEACHER[reg.el], G = GRADE_INFO[g], R = rng(hashStr('guard' + reg.n)), foe = gradedOpponent(g, G.lv[1], R, null, null, randomOpponent(R, fam)); foe.boss = tName;
    const fp = prop({ k: 'foe', x: 186, y: GROUND, fm: foe.fm }); banner(tName, '#ffd23f'); K(`That's ${tName}. Nobody gets past without a fight.`); await rwait(1800); banner(''); unprop(fp);
    const won = await deepFight(T, leadOf(), foe, tName, K);
    if (!won) { K(`${tName} beat all three of you. We're going home.`); await rwait(1600); return 'end'; }
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
