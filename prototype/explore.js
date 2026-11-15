/* Expeditions for the Snabit League (STORY/WORLD.md, concept docs/art/explore-concept.png, approved 15 Nov 2026).
   Walt hands out the permit. Each region can be explored once a season and takes the week. The region is a map of circles
   joined by paths, with fog over what hasn't been reached. Each step costs 1 energy, and the energy comes from Stamina.
   Two columns of the map are obstacles, each needing one stat, so any way to the far end crosses two of them. The map
   names the stat and never the number. A fail costs 3 energy and shuts that way until the next expedition. Finds are
   items, journal pages, Pattern Stones, wild Snabits and springs. A region's map is the same every time, and what's been
   seen and found stays seen and found. */

// the Pattern Stone in each region, and the special Snabit its pattern belongs to
const EX_STONE = { 'Cinder Peak': 'Phoenix', 'Static Plains': 'Eagle', 'Hollow Moor': 'Vampire', 'Dream Garden': 'Kitsune', 'Nightshade Marsh': 'Naga', 'Glacier Rim': 'Yeti' };
// Helena's journal, one page a region, in the order she went
const EX_PAGES = {
  'Cinder Peak': "Found a carved stone under the ash on the north slope, painted in bands of red and orange that are still bright under the soot. Victor wants it for the Grand Ranch hall. I left it where it stood.",
  'Saffron Dojo': "The old master says his grandfather's grandfather painted the same pattern on the dojo banner. He doesn't know why, and nobody here does. They keep painting it every spring.",
  'Static Plains': "Every Snabit I scanned near the stone came out stronger. Celia says I'm imagining it, so I scanned forty to prove her wrong.",
  'Tanglewood': "Josie turned four today and I missed it again. I promised her I'd be home for the next one.",
  'Glacier Rim': "The stones all face the same way. I worked it out from the moss and the snow lines. They point past the edge of the map.",
  'Coral Shallows': "Nobody goes past the edge of the map without a League permit. Celia got us one, and Victor signed it, so Victor gets the first look at whatever we bring back.",
  'Nightshade Marsh': "Walt doesn't like it. He says the Rift isn't a place you map. He came anyway.",
  'Dream Garden': "I've fitted a lens to my Snaboscope that reads the stones. When I point it at a painted pattern it hums.",
  'Granite Steps': "The faint signal every Snabit gives off is loudest at the stones. The stones and the Rift come from the same place.",
  'Dawn Temple': "Celia asked what we'd do if we found a way through. I said we'd come back and tell everyone. She didn't answer.",
  'Iron Foundry': "Victor sent a crate of supplies and a letter for Celia. She read it twice and put it in her pack.",
  'Hollow Moor': "Last camp before the edge. If anyone finds this, the ranch is Josie's. My notes are under the barn floor.",
  'The Rift': "We go in at first light. Walt will wait at the edge for three days. If we're not back by then, he's to go home and say nothing until Josie is old enough to ask."
};
const EX_STAT = [null, 'Power', 'Constitution', 'Mind', 'Insight', 'Speed'];   // index into the six stats; Stamina is the energy
const EX_FINDS = ['Berry', 'Energy nut', 'Honey cake', 'Cool leaf', 'Medicine', 'Candy'], EX_RARE = ['Stat seed', 'Lucky bit', 'Element stone'];

function exRegions() {
  const n = typeof tripRegionCount === 'function' ? tripRegionCount() : 4, out = REGIONS.filter((r, i) => i < n);
  if (rankIdx() >= 2) out.push({ n: 'The Rift', el: 'Void', rift: true });   // the League's teams go to the edge of the Rift from grade C
  return out;
}
const exGrade = reg => reg.rift ? 'B' : ['E', 'E', 'E', 'E', 'D', 'D', 'D', 'C', 'C', 'C', 'B', 'B'][REGIONS.findIndex(r => r.n === reg.n)] || 'E';
/* what an obstacle asks for: the average stat of a Snabit at the region's grade, worked out once */
const EX_NEED = {};
function exNeed(g) {
  if (EX_NEED[g]) return EX_NEED[g];
  const R = rng(hashStr('exneed' + g)), G = GRADE_INFO[g]; let t = 0, n = 0;
  for (let k = 0; k < 8; k++) { const o = gradedOpponent(g, Math.round((G.lv[0] + G.lv[1]) / 2), R); const f = makeFighter(o.fm, o.skills, o.level); for (const s of ['pow', 'grd', 'mnd', 'spr', 'spd']) { t += f.base[s]; n++; } }
  return EX_NEED[g] = t / n;
}
const EX_KEY = ['sta', 'pow', 'grd', 'mnd', 'spr', 'spd'];
/* the region's map, the same every time: a start, three columns of finds and two columns of obstacles between them, and one
   circle at the far end with the Pattern Stone, the last journal page or a big chest */
function exMap(reg) {
  const R = rng(hashStr('exmap|' + reg.n)), N = {}, E = [], id = (c, r) => c + ':' + r;
  N[id(0, 1)] = { c: 0, r: 1, k: 'camp' };
  const finds = ['path', 'chest', 'spring', 'wild', 'path', 'chest', 'wild', 'path', 'spring'];
  for (const c of [1, 3, 5]) for (let r = 0; r < 3; r++) N[id(c, r)] = { c, r, k: finds[Math.floor(R() * finds.length)] };
  N[id(5, Math.floor(R() * 3))].k = 'page';
  for (const c of [2, 4]) { const st = [1, 2, 3, 4, 5].sort(() => R() - 0.5); for (let r = 0; r < 3; r++) N[id(c, r)] = { c, r, k: 'block', stat: st[r], mul: c === 2 ? 0.88 + R() * 0.1 : 1 + R() * 0.15 }; }
  N[id(6, 1)] = { c: 6, r: 1, k: EX_STONE[reg.n] ? 'stone' : reg.rift ? 'page' : 'chest', big: true };
  if (reg.rift) N[id(5, 0)].k = N[id(5, 0)].k === 'page' ? 'path' : N[id(5, 0)].k;
  for (let c = 0; c < 6; c++) {
    const here = Object.values(N).filter(n => n.c === c), next = Object.values(N).filter(n => n.c === c + 1);
    for (const a of here) for (const b of next) if (Math.abs(a.r - b.r) <= 1 && (here.length === 1 || next.length === 1 || R() < 0.7)) E.push([id(a.c, a.r), id(b.c, b.r)]);
    for (const b of next) if (!E.some(e => e[1] === id(b.c, b.r))) { const a = here.reduce((m, x) => Math.abs(x.r - b.r) < Math.abs(m.r - b.r) ? x : m); E.push([id(a.c, a.r), id(b.c, b.r)]); }
    for (const a of here) if (!E.some(e => e[0] === id(a.c, a.r))) { const b = next.reduce((m, x) => Math.abs(x.r - a.r) < Math.abs(m.r - a.r) ? x : m); E.push([id(a.c, a.r), id(b.c, b.r)]); }
  }
  for (const k in N) N[k].id = k;
  return { N, E, near: k => E.filter(e => e[0] === k || e[1] === k).map(e => e[0] === k ? e[1] : e[0]) };
}
function exState(reg) { const X = PLAYER.explore = PLAYER.explore || {}; return X[reg.n] = X[reg.n] || { seen: ['0:1'], got: [], season: -1 }; }
const exSeason = () => { const { yr, mo } = weekParts(PLAYER.week); return yr * 4 + Math.floor(mo / 3); };
/* the special Snabits: a scan only finds one once its Pattern Stone has been found. A save from before keeps any it raised. */
function stoneList() { if (!PLAYER) return null; if (!PLAYER.stones) { PLAYER.stones = []; for (const e of PLAYER.roster || []) if (e.m && FAMILY[e.m.family] && FAMILY[e.m.family].special && !PLAYER.stones.includes(e.m.family)) PLAYER.stones.push(e.m.family); } return PLAYER.stones; }
function stoneOpen(sp) { const L = stoneList(); return !L || L.includes(sp); }

/* ---------- the permit desk ---------- */
function openExpeditions() {
  const s = RS, season = exSeason(), regs = exRegions();
  panel(`<div class="full lab-head"><b>Expeditions</b><button class="small" id="ex-back">Back</button></div>
    <div class="full lab-info">Walt has the League's permits. An expedition takes the week, and each region can be explored once a season.</div>` +
    regs.map((r, i) => { const st = exState(r), done = st.season === season, M = exMap(r), seen = Object.keys(M.N).filter(k => st.seen.includes(k)).length;
      return `<button class="rb" data-x="${i}" ${done ? 'disabled' : ''}>${r.n}<small>${done ? 'Explored this season' : `${r.el}. ${seen} of ${Object.keys(M.N).length} places seen`}</small></button>`; }).join('') +
    `<button class="rb" id="ex-journal">Journal<small>${Object.keys(PLAYER.journal || {}).length} pages</small></button>`);
  el('ex-back').onclick = () => menu('Out');
  el('ex-journal').onclick = openJournal;
  el('r-panel').querySelectorAll('[data-x]').forEach(b => b.onclick = () => runExpedition(regs[+b.dataset.x]));
}
function openJournal() {
  const J = PLAYER.journal || {}, order = Object.keys(EX_PAGES).filter(k => J[k]);
  panel(`<div class="full lab-head"><b>Journal</b><button class="small" id="jn-back">Back</button></div>` +
    (order.length ? order.map(k => `<div class="full lab-info"><b>${k}</b><br>${EX_PAGES[k]}</div>`).join('') : `<div class="full lab-info">No pages yet.</div>`));
  el('jn-back').onclick = openExpeditions;
}

/* ---------- the map under the scene ---------- */
function exDraw(cv, M, st, at, energy, emax, blocked) {
  const d = devicePixelRatio || 1, W = cv.clientWidth || 340, H = 230; cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px';
  const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); const ink = '#5a4128';
  x.fillStyle = '#efe2c2'; x.beginPath(); x.roundRect(0, 0, W, H, 10); x.fill();
  x.fillStyle = ink; x.font = '700 12px Fredoka, system-ui'; x.fillText('Energy', 12, 20); x.fillStyle = '#d9c8a0'; x.beginPath(); x.roundRect(62, 10, W - 140, 11, 5); x.fill();
  x.fillStyle = energy > 3 ? '#6fae4f' : '#d8823a'; x.beginPath(); x.roundRect(62, 10, (W - 140) * Math.max(0, energy) / emax, 11, 5); x.fill(); x.fillStyle = ink; x.fillText(`${Math.max(0, energy)} of ${emax}`, W - 68, 20);
  const P = n => [22 + n.c * (W - 44) / 6, 62 + n.r * 64], near = M.near(at), vis = k => st.seen.includes(k) || near.includes(k) || k === at;
  x.lineCap = 'round';
  for (const [a, b] of M.E) { const A = P(M.N[a]), B = P(M.N[b]), lit = vis(a) && vis(b); x.strokeStyle = lit ? '#8a6a45' : 'rgba(138,106,69,.35)'; x.lineWidth = 3; x.setLineDash(lit ? [] : [4, 6]); x.beginPath(); x.moveTo(...A); x.lineTo(...B); x.stroke(); }
  x.setLineDash([]);
  for (const k in M.N) { const n = M.N[k], [cx, cy] = P(n), v = vis(k), can = near.includes(k) && !blocked.includes(k);
    x.fillStyle = can ? '#fff8e6' : '#f6ead0'; x.strokeStyle = can ? '#c8861f' : '#b79c6e'; x.lineWidth = can ? 3 : 2; x.beginPath(); x.arc(cx, cy, 14, 0, 7); x.fill(); x.stroke();
    if (v) exIcon(x, n, cx, cy, st.got.includes(k), blocked.includes(k));
    if (v && n.k === 'block') { x.fillStyle = blocked.includes(k) ? '#a04a3a' : '#8a5a20'; x.font = '700 9px Fredoka, system-ui'; x.textAlign = 'center'; x.fillText(EX_STAT[n.stat], cx, cy + 25); x.textAlign = 'left'; }
    if (!v) for (const [dx, dy, r] of [[0, 0, 22], [-12, 5, 14], [12, -5, 16]]) { const g = x.createRadialGradient(cx + dx, cy + dy, 2, cx + dx, cy + dy, r); g.addColorStop(0, 'rgba(226,212,180,.97)'); g.addColorStop(1, 'rgba(226,212,180,0)'); x.fillStyle = g; x.beginPath(); x.arc(cx + dx, cy + dy, r, 0, 7); x.fill(); } }
  const [tx, ty] = P(M.N[at]); x.fillStyle = '#e9852e'; x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(tx, ty, 8, 0, 7); x.fill(); x.stroke();
  return P;
}
function exIcon(x, n, cx, cy, got, shut) {
  x.save(); x.translate(cx, cy); x.lineWidth = 2; const k = n.k, ink = '#5a4128'; if (got) x.globalAlpha = 0.35;
  if (k === 'camp') { x.fillStyle = '#c8553d'; x.beginPath(); x.moveTo(-8, 6); x.lineTo(0, -8); x.lineTo(8, 6); x.fill(); }
  else if (k === 'chest') { x.fillStyle = '#a8692e'; x.fillRect(-7, -5, 14, 10); x.fillStyle = '#f2c14e'; x.fillRect(-2, -1, 4, 3); }
  else if (k === 'spring') { x.fillStyle = '#4aa3d8'; x.beginPath(); x.moveTo(0, -8); x.quadraticCurveTo(7, 2, 0, 7); x.quadraticCurveTo(-7, 2, 0, -8); x.fill(); }
  else if (k === 'wild') { x.fillStyle = ink; x.beginPath(); x.ellipse(0, 3, 4.5, 3.5, 0, 0, 7); x.fill(); for (const [a, b] of [[-5, -2], [-2, -6], [2, -6], [5, -2]]) { x.beginPath(); x.arc(a, b, 1.8, 0, 7); x.fill(); } }
  else if (k === 'page') { x.fillStyle = '#fffaf0'; x.fillRect(-5, -7, 10, 14); x.strokeStyle = '#b49a6e'; x.lineWidth = 1; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-3, -4 + i * 3); x.lineTo(3, -4 + i * 3); x.stroke(); } }
  else if (k === 'stone') { x.fillStyle = '#8f8a83'; x.beginPath(); x.moveTo(-6, 8); x.lineTo(-6, -4); x.quadraticCurveTo(0, -10, 6, -4); x.lineTo(6, 8); x.fill(); x.fillStyle = '#f2c14e'; x.fillRect(-3, -2, 6, 6); }
  else if (k === 'block') { const s = n.stat; if (shut) { x.strokeStyle = '#a04a3a'; x.beginPath(); x.moveTo(-6, -6); x.lineTo(6, 6); x.moveTo(6, -6); x.lineTo(-6, 6); x.stroke(); }
    else if (s === 1) { x.fillStyle = '#8f8a83'; x.beginPath(); x.arc(0, 1, 7, 0, 7); x.fill(); }
    else if (s === 5) { x.fillStyle = '#2a2420'; x.beginPath(); x.moveTo(-7, -5); x.lineTo(7, -5); x.lineTo(4, 7); x.lineTo(-4, 7); x.fill(); }
    else if (s === 3) { x.fillStyle = '#7d776f'; x.fillRect(-6, -8, 12, 15); x.fillStyle = '#e2483f'; x.beginPath(); x.arc(0, -2, 2.6, 0, 7); x.fill(); }
    else if (s === 4) { x.strokeStyle = ink; x.beginPath(); x.ellipse(0, 0, 8, 4.5, 0, 0, 7); x.stroke(); x.fillStyle = ink; x.beginPath(); x.arc(0, 0, 2.2, 0, 7); x.fill(); }
    else { x.strokeStyle = '#4e5a2e'; for (const d of [-4, 0, 4]) { x.beginPath(); x.moveTo(d, 7); x.lineTo(d + 2, -7); x.stroke(); } } }
  x.restore();
}
/* waits for a tap on a circle next to the Snabit, or the Head home button */
function exPick(cv, M, P, at, blocked) {
  return new Promise(res => {
    const near = M.near(at).filter(k => !blocked.includes(k));
    cv.onpointerdown = e => { const b = cv.getBoundingClientRect(), px = e.clientX - b.left, py = e.clientY - b.top;
      const hit = near.find(k => { const [cx, cy] = P(M.N[k]); return Math.hypot(px - cx, py - cy) < 22; }); if (hit) { cv.onpointerdown = null; res(hit); } };
    const h = el('ex-home'); if (h) h.onclick = () => { cv.onpointerdown = null; res(null); };
  });
}

/* ---------- the expedition ---------- */
async function runExpedition(reg) {
  const s = RS, st = exState(reg), M = exMap(reg), nm = displayName(s), K = t => say(t, 'guide'), areas = TRIP_AREAS[reg.el];
  const f = playerFighter(s), avg = (f.base.pow + f.base.grd + f.base.mnd + f.base.spr + f.base.spd) / 5;
  const emax = 10 + Math.round(6 * clamp(f.base.sta / Math.max(1, avg), 0.5, 1.5)), need = exNeed(exGrade(reg)), lines = [], found = [];
  let energy = emax, at = '0:1', blocked = [], used = [];
  st.season = exSeason(); saveGame();
  await scene(async () => {
    await tripLeave(`Walt has a League permit for ${reg.n}. ${nm} goes with him for the week.`);
    s.bg = `area:${reg.el}:${areas[0].key}`; s.trip = true; s.night = 0; s.dusk = 0; s.props = []; s.x = 60; s.pose = 'idle'; s.camJump = true; s.tripLabel = `${reg.n} expedition`; drawUI();
    await sceneFade(false, 700); banner(reg.n, '#fff'); K(reg.rift ? `This is the edge of the Rift. The League's teams have mapped this far, and nobody goes further in. Pick a way and ${nm} will try it.` : `This is as far as the trail goes. Pick a way and ${nm} will try it.`); await rwait(1200); banner('');
    el('r-panel').innerHTML = `<canvas id="ex-map" class="full" style="width:100%;display:block"></canvas><button class="rb full" id="ex-home">Head home<small>Keeps everything found so far</small></button>`;
    el('ranch').classList.add('exploring');
    try {
      for (;;) {
        for (const k of M.near(at)) if (!st.seen.includes(k)) st.seen.push(k);
        const cv = el('ex-map'), P = exDraw(cv, M, st, at, energy, emax, blocked);
        if (energy <= 0) { K(`${nm} is worn out, so that's it for this expedition.`); await rwait(1600); break; }
        const to = await exPick(cv, M, P, at, blocked); if (!to) break;
        const n = M.N[to], back = at; energy -= 1; at = to;
        const ai = n.c <= 1 ? 0 : n.c <= 3 ? 1 : 2, key = (reg.rift && n.c === 6 ? areas[2] : areas[Math.min(ai, areas.length - 2)]).key;
        exDraw(el('ex-map'), M, st, at, energy, emax, blocked);
        await sceneFade(true, 250); s.props = []; s.parts = []; s.bg = `area:${reg.el}:${key}`; s.x = 50; s.camJump = true; s.jy = 0; await sceneFade(false, 250);
        const r = await exNode(reg, n, st, need, nm, K, used, found);
        if (r === 'fail') { energy -= 3; blocked.push(to); at = back; }
        if (r === 'spring') energy = Math.min(emax, energy + 4);
        if (r === 'lost') energy -= 3;
        if (n.c === 6) { await rwait(600); break; }
        saveGame();
      }
    } finally { el('ranch').classList.remove('exploring'); el('r-panel').innerHTML = ''; }
    const got = found.length ? `${nm} brought home ${found.join(', ')}.` : `${nm} didn't find anything this time.`;
    await tripHome(`Time to head back. ${got}`, `We're back at the ranch. ${nm} will sleep well tonight.`, found.length ? 'happy' : 'idle');
    s.fatigue += Math.round(12 * tireMul(s)); s.stress += 4; clampAll();
    RS.weekAct = 'Expedition'; await endWeek(1, `${nm} explored ${reg.n}. ${got}`);
  });
}
/* one circle: what happens there. Returns 'fail' or 'lost' (energy off), 'spring' (energy back) or nothing */
async function exNode(reg, n, st, need, nm, K, used, found) {
  const s = RS, once = st.got.includes(n.id);
  await walkTo(100, 70, 'walk'); s.pose = 'idle';
  if (n.k === 'camp' || n.k === 'path') { await rwait(250); return; }
  if (n.k === 'spring') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id); s.pose = 'happy'; spark(s.x + 20, GROUND - 6, 'drip', 10); spark(s.x, headY() - 6, 'sparkle', 3); K(`There's a spring here. ${nm} drinks from it and gets 4 energy back.`); await rwait(1300); return 'spring'; }
  if (n.k === 'chest') { if (once) { K('The chest here is empty now.'); await rwait(900); return; }
    const c = prop({ k: 'crate', x: 140, y: GROUND }); await walkTo(122, 60, 'walk'); s.pose = 'happy'; spark(140, GROUND - 16, 'sparkle', 5);
    const R = rng(hashStr(reg.n + n.id)), item = n.big ? EX_RARE[Math.floor(R() * EX_RARE.length)] : EX_FINDS[Math.floor(R() * EX_FINDS.length)];
    addItem(item); found.push(`${/^[AEIOU]/.test(item) ? 'an' : 'a'} ${item}`); st.got.push(n.id); K(`${nm} found ${/^[AEIOU]/.test(item) ? 'an' : 'a'} ${item} in an old chest.`); await rwait(1400); unprop(c); return; }
  if (n.k === 'page') { if (once) { await rwait(300); return; }
    const p = prop({ k: 'page', x: 140, y: GROUND - 26 }); await walkTo(126, 60, 'walk'); s.pose = 'happy'; spark(140, GROUND - 30, 'sparkle', 4); unprop(p);
    PLAYER.journal = PLAYER.journal || {}; PLAYER.journal[reg.n] = 1; st.got.push(n.id); found.push('a journal page');
    banner('A journal page', '#ffe9a8'); say(EX_PAGES[reg.n]); await rwait(Math.min(7000, 2000 + EX_PAGES[reg.n].length * 38)); banner(''); return; }
  if (n.k === 'stone') { const sp = EX_STONE[reg.n];
    const p = prop({ k: 'pstone', x: 150, y: GROUND, glow: true, sp }); await walkTo(122, 60, 'walk'); s.pose = 'happy';
    if (!once) { st.got.push(n.id); const L = stoneList(); if (L && !L.includes(sp)) L.push(sp); found.push('a Pattern Stone'); spark(150, GROUND - 40, 'sparkle', 8); banner('A Pattern Stone', '#ffe9a8');
      K(`${nm} found a carved stone with a pattern painted on it. The Snaboscope hums when it's pointed at it.`); await rwait(2600); banner(''); }
    else { K('The Pattern Stone is still here.'); await rwait(1100); }
    unprop(p); return; }
  if (n.k === 'wild') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id);
    const g = exGrade(reg), G = GRADE_INFO[g], foe = gradedOpponent(g, Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * 0.5), Math.random, reg.el === 'Void' ? null : reg.el), prize = Math.round(G.purse * 0.4);
    const fp = prop({ k: 'foe', x: 170, y: GROUND, grid: foe.fm.grid, pal: foe.fm.pal, fm: foe.fm }); banner('A wild Snabit', '#ffd23f'); K(`A wild ${foe.m.name} is in the way.`); await rwait(1300); banner('');
    await sceneFade(true, 400); let won = false;
    await new Promise(done => arenaFight({ s: fightSnapshot(s), foe, mode: 'auto', title: 'Wild', noDraw: true, onEnd: r => { won = !!(r && r.winner === 0); done(); } }));
    unprop(fp); s.trip = true; s.camJump = true; s.pose = won ? 'happy' : 'tired'; await sceneFade(false, 400);
    if (won) { PLAYER.bits += prize; drawUI(); found.push(`${prize.toLocaleString()} bits`); K(`${nm} beat it, and a League bounty pays ${prize.toLocaleString()} bits.`); await rwait(1400); return; }
    K(`The ${foe.m.name} was too strong, and ${nm} lost 3 energy getting away.`); await rwait(1400); return 'lost'; }
  // an obstacle: the stat against what the region asks for
  const f = playerFighter(s), v = f.base[EX_KEY[n.stat]], ok = v >= need * n.mul, stat = EX_STAT[n.stat];
  await exObstacle(n.stat, ok);
  K(ok ? `${nm} got through.` : `${nm} couldn't get through, so it goes back and loses 3 energy. It needs more ${stat}.`); await rwait(1500);
  return ok ? null : 'fail';
}
/* what each obstacle looks like, getting through or not */
async function exObstacle(stat, ok) {
  const s = RS;
  if (stat === 1) { const b = prop({ k: 'boulder', x: 150, y: GROUND, r: 12, rot: 0 }); await walkTo(150 - 14 - RS.P.scale * 4, 50, 'walk'); s.pose = 'effort'; await rwait(700);
    if (ok) { for (let i = 0; i < 20; i++) { b.x += 1.2; s.x += 1.2; b.rot += 0.1; if (i % 5 === 0) spark(s.x - 8, GROUND - 1, 'dust'); await rwait(30); } b.vx = 2.5; rsfx('rumble'); s.pose = 'happy'; await rwait(700); }
    else { for (let i = 0; i < 3; i++) { s.bx = 1; await rwait(160); s.bx = 0; await rwait(160); } spark(s.x, headY(), 'sweat', 3); s.pose = 'tired'; await rwait(700); s.dir = -1; await walkTo(70, 60, 'walk'); }
    unprop(b); return; }
  if (stat === 5) { prop({ k: 'chasm', x: 128, y: GROUND, w: 44 }); await walkTo(118, 60, 'walk'); s.pose = 'crouch'; await rwait(300); s.pose = 'jump'; rsfx('leap');
    const x0 = s.x, x1 = ok ? 186 : 140; for (let f = 0; f <= 28; f++) { const q = f / 28; s.x = x0 + (x1 - x0) * q; s.jy = Math.sin(q * Math.PI) * (ok ? 30 : 14); await rwait(20); }
    s.jy = 0; if (ok) { s.pose = 'land'; spark(s.x, GROUND - 1, 'dust', 5); rsfx('thud'); await rwait(500); }
    else { s.pose = 'hurt'; for (let f = 0; f < 14; f++) { s.x -= 2; s.jy = Math.sin(f / 14 * Math.PI) * 10; await rwait(20); } s.jy = 0; spark(s.x, headY(), 'sweat', 2); await rwait(600); }
    return; }
  if (stat === 3) { const d = prop({ k: 'sealdoor', x: 165, y: GROUND, lit: 0 }); await walkTo(132, 60, 'walk'); s.pose = 'idle'; spark(s.x, headY() - 6, 'q');
    for (let i = 1; i <= 3; i++) { await rwait(420); if (!ok && i === 3) { d.lit = 0; s.flash = 2; spark(165, GROUND - 40, 'zap', 3); break; } d.lit = i; rsfx('chip'); }
    if (ok) { spark(s.x, headY() - 10, 'bulb'); await rwait(400); for (let f = 0; f < 16; f++) { d.y += 4; await rwait(20); } spark(165, GROUND - 4, 'dust', 6); rsfx('rumble'); await walkTo(190, 60, 'walk'); }
    else { s.pose = 'sad'; await rwait(800); }
    unprop(d); return; }
  if (stat === 4) { const b1 = prop({ k: 'bush', x: 150, y: GROUND }), b2 = prop({ k: 'bush', x: 176, y: GROUND }); s.pose = 'idle'; spark(s.x, headY() - 6, 'q'); await rwait(700);
    if (ok) { spark(s.x, headY() - 10, 'bulb'); const gp = prop({ k: 'glowpath', x: 128, y: GROUND - 4, n: 5 }); await rwait(500); b1.shake = b2.shake = 1; await walkTo(196, 50, 'walk'); unprop(gp); }
    else { spark(s.x, headY() - 6, 'q'); await rwait(700); s.pose = 'sad'; await rwait(700); }
    unprop(b1); unprop(b2); return; }
  // Constitution: thorns
  const th = prop({ k: 'thorns', x: 150, y: GROUND }); await walkTo(130, 50, 'walk'); s.pose = 'effort';
  if (ok) { for (let i = 0; i < 24; i++) { s.x += 1.5; if (i % 6 === 0) spark(s.x + 6, headY(), 'sweat'); await rwait(40); } unprop(th); spark(s.x, GROUND - 2, 'dust', 4); s.pose = 'happy'; await rwait(400); }
  else { await rwait(500); s.pose = 'hurt'; s.flash = 2; spark(s.x, headY() - 4, 'star', 2); await rwait(600); s.dir = -1; await walkTo(80, 60, 'walk'); unprop(th); }
}
