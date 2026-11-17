/* Expeditions for the Snabit League (STORY/WORLD.md, concept docs/art/explore-concept.png, approved 15 Nov 2026).
   Walt hands out the permit. Each region can be explored once a season and takes the week. The region is a map of circles
   joined by paths, with fog over what hasn't been reached. Each step costs 1 energy, and the energy comes from Stamina.
   Two columns of the map are obstacles, each needing one stat, so any way to the far end crosses two of them. The map
   names the stat and never the number. A fail costs 3 energy and shuts that way until the next expedition. Finds are
   items, journal pages, Pattern Stones, wild Snabits and springs. A region's map is the same every time, and what's been
   seen and found stays seen and found. */

// the Pattern Stone in each region, and the special Snabit its pattern belongs to
const EX_STONE = { 'Cinder Peak': 'Phoenix', 'Static Plains': 'Eagle', 'Nightshade Marsh': 'Naga', 'Glacier Rim': 'Yeti', 'Saffron Dojo': 'Tengu', 'Tanglewood': 'Tanuki', 'Coral Shallows': 'Mermaid', 'Dream Garden': 'Diwata', 'Granite Steps': 'Sphinx', 'Dawn Temple': 'Garuda', 'Hollow Moor': 'Werewolf', 'Iron Foundry': 'Minotaur' };
// the stones only a team reaches, on the deep maps (Gid, 15 Nov 2026: stones from grade C)
const EX_DEEP_STONE = { 'Dream Garden': 'Kitsune', 'Hollow Moor': 'Vampire', 'Tanglewood': 'Jack', 'Coral Shallows': 'Kraken', 'Granite Steps': 'Golem', 'Dawn Temple': 'Unicorn', 'Cinder Peak': 'Dragon', 'Static Plains': 'Thunderbird', 'Nightshade Marsh': 'Hydra', 'Glacier Rim': 'Griffin', 'Saffron Dojo': 'Kirin', 'Iron Foundry': 'Salamander' };
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
function exMap(reg, season = PLAYER ? exSeason() : 0) {
  const R = rng(hashStr('exmap|' + reg.n)), N = {}, E = [], id = (c, r) => c + ':' + r;
  N[id(0, 1)] = { c: 0, r: 1, k: 'camp' };
  const finds = ['path', 'chest', 'spring', 'wild', 'path', 'chest', 'wild', 'path', 'spring'];
  for (const c of [1, 3, 5]) for (let r = 0; r < 3; r++) N[id(c, r)] = { c, r, k: finds[Math.floor(R() * finds.length)] };
  N[id(5, Math.floor(R() * 3))].k = 'page';
  for (const c of [2, 4]) { const st = [1, 2, 3, 4, 5].sort(() => R() - 0.5); for (let r = 0; r < 3; r++) N[id(c, r)] = { c, r, k: 'block', stat: st[r], mul: c === 2 ? 0.88 + R() * 0.1 : 1 + R() * 0.15 }; }
  N[id(6, 1)] = { c: 6, r: 1, k: EX_STONE[reg.n] ? 'stone' : reg.rift ? 'page' : 'chest', big: true };
  if (reg.rift) N[id(5, 0)].k = 'stone';   // Bakunawa's stone waits on the last ring before the edge
  for (let c = 0; c < 6; c++) {
    const here = Object.values(N).filter(n => n.c === c), next = Object.values(N).filter(n => n.c === c + 1);
    for (const a of here) for (const b of next) if (Math.abs(a.r - b.r) <= 1 && (here.length === 1 || next.length === 1 || R() < 0.7)) E.push([id(a.c, a.r), id(b.c, b.r)]);
    for (const b of next) if (!E.some(e => e[1] === id(b.c, b.r))) { const a = here.reduce((m, x) => Math.abs(x.r - b.r) < Math.abs(m.r - b.r) ? x : m); E.push([id(a.c, a.r), id(b.c, b.r)]); }
    for (const a of here) if (!E.some(e => e[0] === id(a.c, a.r))) { const b = next.reduce((m, x) => Math.abs(x.r - a.r) < Math.abs(m.r - a.r) ? x : m); E.push([id(a.c, a.r), id(b.c, b.r)]); }
  }
  if (typeof exSeasonal === 'function') exSeasonal(reg, N, season);   // the season's finds on the fixed layout (explore-more.js)
  for (const k in N) N[k].id = k;
  return { N, E, near: k => E.filter(e => e[0] === k || e[1] === k).map(e => e[0] === k ? e[1] : e[0]) };
}
function exState(reg) { const X = PLAYER.explore = PLAYER.explore || {}; return X[reg.n] = X[reg.n] || { seen: ['0:1'], got: [], season: -1 }; }
const exSeason = () => { const { yr, mo } = weekParts(PLAYER.week); return yr * 4 + Math.floor(mo / 3); };
/* the special Snabits: a scan only finds one once its Pattern Stone has been found. A save from before keeps any it raised. */
function stoneList() { if (!PLAYER) return null; if (!PLAYER.stones) { PLAYER.stones = []; for (const e of PLAYER.roster || []) if (e.m && FAMILY[e.m.family] && FAMILY[e.m.family].special && !FAMILY[e.m.family].horror && !PLAYER.stones.includes(e.m.family)) PLAYER.stones.push(e.m.family); } return PLAYER.stones; }
function stoneOpen(sp) { const L = stoneList(); return !L || L.includes(sp); }

/* ---------- the permit desk ---------- */
function openExpeditions() {
  const s = RS, season = exSeason(), regs = exRegions();
  panel(`<div class="full lab-head"><b>Expeditions</b><button class="small" id="ex-back">Back</button></div>
    <div class="full lab-info">Walt has the League's permits. An expedition takes the week, and each region can be explored once a season.</div>` +
    regs.map((r, i) => { const st = exState(r), done = st.season === season, M = exMap(r), seen = Object.keys(M.N).filter(k => st.seen.includes(k)).length;
      return `<button class="rb" data-x="${i}" ${done ? 'disabled' : ''}>${r.n}<small>${done ? 'Explored this season' : `${r.el}. ${seen} of ${Object.keys(M.N).length} places seen`}</small></button>`; }).join('') +
    (typeof riftRings === 'function' ? riftRings().map((r, i) => { const done = deepState(r).season === season; return `<button class="rb" data-r="${i}" ${done ? 'disabled' : ''}>${r.n}<small>${done ? 'Explored this season' : 'A team of three, two weeks'}</small></button>`; }).join('') : '') +
    (typeof deepRegions === 'function' ? deepRegions().map((r, i) => { const done = deepState(r).season === season; return `<button class="rb" data-d="${i}" ${done ? 'disabled' : ''}>${r.n}, deep<small>${done ? 'Explored this season' : 'A team of three, two weeks'}</small></button>`; }).join('') : '') +
    `<button class="rb" id="ex-journal">Journal<small>${Object.keys(PLAYER.journal || {}).length} pages</small></button>`);
  el('ex-back').onclick = () => menu('Out');
  el('ex-journal').onclick = openJournal;
  el('r-panel').querySelectorAll('[data-x]').forEach(b => b.onclick = () => runExpedition(regs[+b.dataset.x]));
  el('r-panel').querySelectorAll('[data-d]').forEach(b => b.onclick = () => openDeepPick(deepRegions()[+b.dataset.d]));
  el('r-panel').querySelectorAll('[data-r]').forEach(b => b.onclick = () => openDeepPick(riftRings()[+b.dataset.r]));
}
function openJournal(tab) {
  const J = PLAYER.journal || {}, order = Object.keys(EX_PAGES).filter(k => J[k]), myths = typeof mythsHtml === 'function' && PLAYER.myths && Object.values(PLAYER.myths).some(p => p.some(Boolean));
  panel(`<div class="full lab-head"><b>Journal</b><button class="small" id="jn-back">Back</button></div>` +
    (myths ? `<button class="rb ${tab === 'myths' ? '' : 'on'}" id="jn-pages">Helena's pages</button><button class="rb ${tab === 'myths' ? 'on' : ''}" id="jn-myths">Myths</button>` : '') +
    (tab === 'myths' && myths ? mythsHtml() : order.length ? order.map(k => `<div class="full lab-info"><b>${k}</b><br>${EX_PAGES[k]}</div>`).join('') : `<div class="full lab-info">No pages yet.</div>`));
  el('jn-back').onclick = openExpeditions;
  if (myths) { el('jn-pages').onclick = () => openJournal(); el('jn-myths').onclick = () => openJournal('myths'); }
}

/* ---------- the map under the scene ---------- */
function exDraw(cv, M, st, at, energy, emax, blocked, title) {
  const d = devicePixelRatio || 1, W = cv.clientWidth || 340, H = 236; cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px';
  const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); const ink = '#5a4128', R = SC.rng(7);
  // parchment with a few stains and an inked double border
  x.fillStyle = '#efe2c2'; x.beginPath(); x.roundRect(0, 0, W, H, 10); x.fill();
  for (let i = 0; i < 7; i++) { const sx = R() * W, sy = R() * H, sr = 20 + R() * 40, g = x.createRadialGradient(sx, sy, 1, sx, sy, sr); g.addColorStop(0, 'rgba(196,165,110,.16)'); g.addColorStop(1, 'rgba(196,165,110,0)'); x.fillStyle = g; x.fillRect(sx - sr, sy - sr, sr * 2, sr * 2); }
  x.strokeStyle = 'rgba(122,90,55,.55)'; x.lineWidth = 1.5; x.beginPath(); x.roundRect(5, 5, W - 10, H - 10, 7); x.stroke(); x.lineWidth = 0.7; x.beginPath(); x.roundRect(8.5, 8.5, W - 17, H - 17, 5); x.stroke();
  // energy: a pill with depth
  if (energy != null) {   // a team shows each Snabit's energy on its own card instead
  x.fillStyle = ink; x.font = '700 12px Fredoka, system-ui'; x.fillText('Energy', 16, 27);
  const bx = 64, bw = W - 146; SC.depth(x, () => { x.beginPath(); x.roundRect(bx, 17, bw, 12, 6); }, '#d9c8a0', 2, 0.25);
  if (energy > 0) SC.depth(x, () => { x.beginPath(); x.roundRect(bx, 17, Math.max(12, bw * energy / emax), 12, 6); }, energy > 3 ? '#6fae4f' : '#d8823a', 0, 0);
  x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(bx + 5, 19, Math.max(0, bw * Math.max(0, energy) / emax - 10), 2);
  x.fillStyle = ink; x.fillText(`${Math.max(0, energy)} of ${emax}`, W - 74, 27);
  }
  const top = energy != null ? 72 : 52, P = n => [26 + (n.c - (M.off || 0)) * (W - 52) / 6, top + n.r * 62], near = M.near(at), vis = k => (!M.fog && st.seen.includes(k)) || near.includes(k) || k === at;   // fog shows only the places next to the Snabit
  x.save(); x.beginPath(); x.rect(9, 9, W - 18, H - 18); x.clip();   // a deep map is wider than the screen and scrolls with the Snabit
  x.lineCap = 'round';
  for (const [a, b] of M.E) { const A = P(M.N[a]), B = P(M.N[b]), lit = vis(a) && vis(b);
    if (lit) { x.strokeStyle = '#9c7b52'; x.lineWidth = 5; x.setLineDash([]); x.beginPath(); x.moveTo(...A); x.lineTo(...B); x.stroke(); x.strokeStyle = '#d9c39a'; x.lineWidth = 2; x.setLineDash([3, 5]); x.beginPath(); x.moveTo(...A); x.lineTo(...B); x.stroke(); }
    else { x.strokeStyle = 'rgba(138,106,69,.35)'; x.lineWidth = 2; x.setLineDash([2, 6]); x.beginPath(); x.moveTo(...A); x.lineTo(...B); x.stroke(); } }
  x.setLineDash([]);
  for (const k in M.N) { const n = M.N[k], [cx, cy] = P(n), v = vis(k), can = near.includes(k) && !blocked.includes(k), seen = st.seen.includes(k) || k === at;
    SC.depth(x, () => { x.beginPath(); x.arc(cx, cy, 16, 0, 7); }, can ? '#fff6dc' : seen ? '#f3e6c6' : '#ebdcba', 2.5, 0.3);
    x.strokeStyle = can ? '#d39a2c' : '#b59a6c'; x.lineWidth = can ? 2.6 : 1.4; x.beginPath(); x.arc(cx, cy, can ? 16 : 15, 0, 7); x.stroke();
    if (v) exIcon(x, n, cx, cy, n.k === 'page' || n.k === 'stone' ? st.got.includes(k) : (M.used || []).includes(k), blocked.includes(k));
    // obstacles carry no stat name: the picture on the circle says what it needs (Gid, 15 Nov 2026)
    if (!v) { const fog = () => SC.blob(x, cx, cy + 2, [[0, -4, 13], [-12, 3, 10], [12, 3, 10], [-5, 6, 9], [6, 7, 9]]); x.globalAlpha = 0.96; SC.depth(x, fog, '#e3d4b2', 2, 0.12); x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.arc(cx - 4, cy - 6, 6, 3.4, 4.9); x.fill(); x.globalAlpha = 1; } }
  // the Snabit's pin over where it stands
  const [tx, ty] = P(M.N[at]), py = ty - 22;
  x.fillStyle = 'rgba(40,25,10,.25)'; x.beginPath(); x.ellipse(tx, ty + 13, 6, 2, 0, 0, 7); x.fill();
  SC.depth(x, () => { x.beginPath(); x.moveTo(tx, py + 15); x.bezierCurveTo(tx - 11, py + 2, tx - 9, py - 11, tx, py - 11); x.bezierCurveTo(tx + 9, py - 11, tx + 11, py + 2, tx, py + 15); }, '#e9852e', 1.5, 0.3);
  x.fillStyle = '#fff6dc'; x.beginPath(); x.arc(tx, py - 2, 3.6, 0, 7); x.fill();
  x.restore();
  if (title) { x.fillStyle = ink; x.font = '700 10px Fredoka, system-ui'; x.textAlign = 'right'; x.fillText(title, W - 16, energy != null ? H - 14 : 24); x.textAlign = 'left'; }
  return P;
}
/* the map icons reuse the scene props from explore-art.js, scaled down onto the circle */
function exIcon(x, n, cx, cy, got, shut) {
  x.save(); const k = n.k; if (got) x.globalAlpha = 0.4;
  if (k === 'camp') { const y = cy + 7; SC.depth(x, () => { x.beginPath(); x.moveTo(cx - 10, y); x.lineTo(cx, y - 15); x.lineTo(cx + 10, y); x.closePath(); }, '#c8553d', 1.2, 0.3); x.fillStyle = '#5a2a1e'; x.beginPath(); x.moveTo(cx - 3, y); x.lineTo(cx, y - 7); x.lineTo(cx + 3, y); x.fill(); }
  else if (k === 'chest') XA.chest(x, cx, cy + 6, got, 0, n.big ? 0.55 : 0.45);
  else if (k === 'spring') XA.spring(x, cx, cy + 4, 0, 0.42);
  else if (k === 'page') XA.page(x, cx, cy, 0, 0.62, false);
  else if (k === 'stone') XA.stone(x, cx, cy + 8, null, false, 0, 0.3);
  else if (k === 'wild') { x.fillStyle = '#5a4128'; x.beginPath(); x.ellipse(cx, cy + 3, 5, 4, 0, 0, 7); x.fill(); for (const [a, b] of [[-6, -2], [-2.4, -6.5], [2.4, -6.5], [6, -2]]) { x.beginPath(); x.ellipse(cx + a, cy + b, 2, 2.5, a * 0.08, 0, 7); x.fill(); } }
  else if (k === 'guard') { x.strokeStyle = '#e0ad3c'; x.lineWidth = 2.4; x.beginPath(); x.ellipse(cx, cy - 7, 7, 2.4, 0, 0, 7); x.stroke();   // the guardian: a halo over a big paw
    x.fillStyle = '#5a4128'; x.beginPath(); x.ellipse(cx, cy + 5, 5.5, 4.5, 0, 0, 7); x.fill(); for (const [a, b] of [[-6.5, -0.5], [-2.6, -4], [2.6, -4], [6.5, -0.5]]) { x.beginPath(); x.ellipse(cx + a, cy + b, 2.1, 2.6, a * 0.08, 0, 7); x.fill(); } }
  else if (k === 'tear') { x.strokeStyle = '#8a5ad8'; x.lineWidth = 3; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - 1, cy - 10); x.lineTo(cx + 3, cy - 4); x.lineTo(cx - 2, cy + 1); x.lineTo(cx + 2, cy + 6); x.lineTo(cx, cy + 10); x.stroke();
    x.strokeStyle = '#2a1840'; x.lineWidth = 1.2; x.stroke(); }   // a horror's tear: a violet crack
  else if (k === 'lair') { x.fillStyle = '#3a2a52'; x.beginPath(); x.moveTo(cx - 8, cy + 9); x.lineTo(cx - 8, cy - 3); x.arc(cx, cy - 3, 8, Math.PI, 0); x.lineTo(cx + 8, cy + 9); x.closePath(); x.fill();   // a lair: a dark door with a violet mark
    x.strokeStyle = '#a77ef0'; x.lineWidth = 1.4; x.beginPath(); x.arc(cx, cy, 3, 0, 7); x.stroke(); }
  else if (k === 'teach') { if (n.met) exTent(x, cx, cy + 9, 0.5); else { x.fillStyle = 'rgba(110,80,50,.5)'; for (const [a, b] of [[-5, 4], [0, -1], [5, 4]]) { x.beginPath(); x.ellipse(cx + a, cy + b, 1.8, 2.6, 0, 0, 7); x.fill(); } } }
  else if (k === 'stop') exSign(x, cx, cy + 10, 0.62);
  else if (k === 'path') { x.fillStyle = 'rgba(110,80,50,.5)'; for (const [a, b] of [[-5, 4], [0, -1], [5, 4]]) { x.beginPath(); x.ellipse(cx + a, cy + b, 1.8, 2.6, 0, 0, 7); x.fill(); } }
  else if (k === 'block') { for (const [st, dx] of (n.stat2 ? [[n.stat, -5], [n.stat2, 6]] : [[n.stat, 0]])) exBlockIcon(x, st, cx + dx, cy, n.stat2 ? 0.75 : 1);
    if (shut) { x.globalAlpha = 1; x.strokeStyle = '#b8402e'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 7, cy - 7); x.lineTo(cx + 7, cy + 7); x.moveTo(cx + 7, cy - 7); x.lineTo(cx - 7, cy + 7); x.stroke(); } }
  x.restore();
}
function exBlockIcon(x, st, cx, cy, k) {
  if (st === 1) XA.rock(x, cx, cy + 10 * k, 0.72 * k);
  else if (st === 5) { XA.darts(x, cx + 6 * k, cy + 10 * k, 0, 0.4 * k, false); XA.dart(x, cx - 5 * k, cy - 3 * k, 0.8 * k); }
  else if (st === 3) { XA.door(x, cx + 2 * k, cy + 9 * k, 0, 0, 0, 0.28 * k); XA.litter(x, cx - 2 * k, cy + 10 * k, 0.35 * k); }
  else if (st === 4) XA.mirage(x, cx, cy + 8 * k, 1, 0, 0, 0.3 * k);
  else XA.bramble(x, cx, cy + 8 * k, 0.48 * k);
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
  const wx = typeof exWeather === 'function' ? exWeather(reg) : null, top = wx === 'Heat' || wx === 'Snow' ? emax - 3 : emax;
  let energy = top, at = '0:1', blocked = [], used = []; M.used = used; M.fog = wx === 'Fog';
  st.season = exSeason(); saveGame();
  await scene(async () => {
    await tripLeave(`Walt has a League permit for ${reg.n}. ${nm} goes with him for the week.`);
    s.bg = `area:${reg.el}:${areas[0].key}`; s.trip = true; s.night = 0; s.dusk = 0; s.props = []; s.x = 60; s.pose = 'idle'; s.camJump = true; s.tripLabel = `${reg.n} expedition`; drawUI();
    await sceneFade(false, 700); banner(reg.n, '#fff'); K(reg.rift ? "This is the edge of the Rift. The League's mapped this far and no further." : 'The trail ends here. Where to?'); await rwait(1200); banner('');
    if (wx) { s.exWx = wx; K(EX_WX_LINE[wx](nm)); await rwait(2000); }
    el('r-panel').innerHTML = `<canvas id="ex-map" class="full" style="width:100%;display:block"></canvas><button class="rb full" id="ex-home">Head home<small>Keeps everything found so far</small></button>`;
    el('ranch').classList.add('exploring');
    try {
      for (;;) {
        for (const k of M.near(at)) if (!st.seen.includes(k)) st.seen.push(k);
        const cv = el('ex-map'), P = exDraw(cv, M, st, at, energy, top, blocked, wx ? `${reg.n} · ${wx}` : reg.n);
        if (energy <= 0) { K(`${nm}'s worn out. We're going home.`); await rwait(1600); break; }
        const to = await exPick(cv, M, P, at, blocked); if (!to) break;
        const n = M.N[to], back = at; energy -= 1; at = to;
        const ai = n.c <= 1 ? 0 : n.c <= 3 ? 1 : 2, key = (reg.rift && n.c === 6 ? areas[2] : areas[Math.min(ai, areas.length - 2)]).key;
        exDraw(el('ex-map'), M, st, at, energy, top, blocked, wx ? `${reg.n} · ${wx}` : reg.n);
        await sceneFade(true, 250); s.props = []; s.parts = []; s.bg = `area:${reg.el}:${key}`; s.x = 50; s.camJump = true; s.jy = 0; await sceneFade(false, 250);
        const r = await exNode(reg, n, st, need, nm, K, used, found);
        if (r === 'fail') { energy -= 3; blocked.push(to); at = back; }
        if (r === 'spring') energy = Math.min(top, energy + (wx === 'Rain' ? 7 : 4));
        if (r === 'move') energy -= 2;
        if (typeof r === 'number') energy = Math.min(top, energy + r);
        if (r === 'lost') energy -= 3;
        if (n.c === 6) { await rwait(600); break; }
        saveGame();
      }
    } finally { el('ranch').classList.remove('exploring'); el('r-panel').innerHTML = ''; delete s.exWx; }
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
  if (n.k === 'spring') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id); const sp = prop({ k: 'spring', x: 150, y: GROUND }); await walkTo(124, 60, 'walk'); s.pose = 'happy'; spark(150, GROUND - 10, 'drip', 8); rsfx('splash'); spark(s.x, headY() - 6, 'sparkle', 3); K(`There's fresh water here. Drink up, ${nm}.`); await rwait(1300); unprop(sp); return 'spring'; }
  if (n.k === 'chest') { if (used.includes(n.id)) { K('The chest here is empty now.'); await rwait(900); return; } used.push(n.id);
    const c = prop({ k: 'chest', x: 144, y: GROUND }); await walkTo(120, 60, 'walk'); s.pose = 'idle'; await rwait(300); c.open = true; rsfx('creak'); s.pose = 'happy'; spark(144, GROUND - 22, 'sparkle', 6);
    const R = rng(hashStr(reg.n + n.id + exSeason())), item = n.big ? EX_RARE[Math.floor(R() * EX_RARE.length)] : EX_FINDS[Math.floor(R() * EX_FINDS.length)];
    addItem(item); found.push(`${/^[AEIOU]/.test(item) ? 'an' : 'a'} ${item}`); if (!once) st.got.push(n.id); K(`${nm} found ${/^[AEIOU]/.test(item) ? 'an' : 'a'} ${item} in an old chest.`); await rwait(1400); unprop(c); return; }
  if (n.k === 'page') { if (once) { await rwait(300); return; }
    const p = prop({ k: 'page', x: 140, y: GROUND - 26 }); await walkTo(126, 60, 'walk'); s.pose = 'happy'; spark(140, GROUND - 30, 'sparkle', 4); unprop(p);
    PLAYER.journal = PLAYER.journal || {}; PLAYER.journal[reg.n] = 1; st.got.push(n.id); found.push('a journal page');
    banner('A journal page', '#ffe9a8'); say(EX_PAGES[reg.n]); await rwait(Math.min(7000, 2000 + EX_PAGES[reg.n].length * 38)); banner(''); return; }
  if (n.k === 'stone') { const sp = EX_STONE[reg.n] || (reg.rift ? 'Bakunawa' : null);
    const p = prop({ k: 'pstone', x: 150, y: GROUND, glow: true, sp }); await walkTo(122, 60, 'walk'); s.pose = 'happy';
    const L0 = stoneList(), have = L0 ? L0.includes(sp) : once;   // a save that opened this circle when it held a chest still finds the stone
    if (!have) { if (!once) st.got.push(n.id); const L = stoneList(); if (L && !L.includes(sp)) L.push(sp); found.push('a Pattern Stone'); spark(150, GROUND - 40, 'sparkle', 8); banner('A Pattern Stone', '#ffe9a8');
      K("Look at this. Someone painted a pattern on this stone, and the Snaboscope's humming at it."); await rwait(2600); banner(''); }
    else { K('The painted stone is still here.'); await rwait(1100); }
    unprop(p); return; }
  if (n.k === 'teach') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id); await exTeach(reg, st, nm, K, found); return; }
  if (n.k === 'stop') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id); return await exStop(reg, n, nm, K, found); }
  if (n.k === 'wild') { if (used.includes(n.id)) { await rwait(200); return; } used.push(n.id);
    const g = exGrade(reg), G = GRADE_INFO[g], foe = (typeof roamInRegion === 'function' && roamInRegion(s, reg, Math.random)) || gradedOpponent(g, Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * 0.5), Math.random, reg.el === 'Void' ? null : reg.el), prize = Math.round(G.purse * 0.4);
    const fp = prop({ k: 'foe', x: 170, y: GROUND, grid: foe.fm.grid, pal: foe.fm.pal, fm: foe.fm }); banner('A wild Snabit', '#ffd23f'); K(foe.drifter ? `Look at those colours! Everyone in town has been talking about this ${foe.m.name}.` : `A wild ${foe.m.name} is in the way.`); await rwait(1300); banner('');
    await sceneFade(true, 400); let won = false;
    await new Promise(done => arenaFight({ s, foe, mode: 'control', title: 'Wild', noDraw: true, onEnd: r => { won = !!(r && r.winner === 0); done(); } }));
    unprop(fp); s.trip = true; s.camJump = true; s.pose = won ? 'happy' : 'tired'; await sceneFade(false, 400);
    if (foe.drifter && typeof roamResult === 'function') { K(roamResult(won)); await rwait(2200); }
    if (won) { PLAYER.bits += prize; drawUI(); found.push(`${prize.toLocaleString()} bits`); K(`You did it! The League pays ${prize.toLocaleString()} bits for that one.`); await rwait(1400); return; }
    K(`That ${foe.m.name} was too strong. Let's get out of here.`); await rwait(1400); return 'lost'; }
  // an obstacle: the stat against what the region asks for. Nothing names the stat, since the obstacle shows it
  const f = playerFighter(s), v = f.base[EX_KEY[n.stat]], want = need * n.mul;
  let ok = v >= want;
  // close to what it needs: it gets a try, from about one in six up to three in four
  if (!ok && v >= want * 0.85) { K(`It's close. Come on, ${nm}!`); await rwait(1000); ok = Math.random() < 0.15 + (v / want - 0.85) / 0.15 * 0.6; }
  // a move that fits gets it through for 2 energy, where turning back costs 3 and shuts the way
  const mv = !ok && typeof exMoveFor === 'function' && exMoveFor(f, n.stat);
  if (mv) { const line = await exMoveOpen(n.stat, mv, hashStr(reg.n + n.id)); K(line); await rwait(1500); return 'move'; }
  await exObstacle(n.stat, ok, hashStr(reg.n + n.id));
  K((ok ? EX_WIN : EX_LOSE)[n.stat](nm)); await rwait(1500);
  return ok ? null : 'fail';
}
const EX_WIN = { 1: nm => `${nm} shoved the boulder aside!`, 5: nm => `${nm} made it past the darts!`, 3: nm => `${nm} worked out the door!`, 4: nm => `${nm} found the real way through!`, 2: nm => `${nm} pushed through the thorns!` };
const EX_LOSE = { 1: () => "It won't budge.", 5: nm => `Ow, a dart got ${nm}.`, 3: nm => `${nm} can't work out the door.`, 4: () => "That archway wasn't really there.", 2: nm => `The thorns are too much for ${nm}.` };
const exBack = async x => { RS.dir = -1; await walkTo(x, 60, 'walk'); RS.dir = 1; };
/* what each obstacle looks like, getting through or not */
async function exObstacle(stat, ok, seed = 0) {
  const s = RS;
  if (stat === 1) {   // Power: a giant boulder across the path
    const b = prop({ k: 'xrock', x: 172, y: GROUND, s: 1.7, rot: 0 }); await walkTo(172 - 44 - RS.P.scale * 4, 50, 'walk'); s.pose = 'effort'; await rwait(700);
    if (ok) { for (let i = 0; i < 26; i++) { b.x += 1.2; s.x += 1.2; b.rot += 0.05; if (i % 5 === 0) spark(s.x - 8, GROUND - 1, 'dust'); if (i % 8 === 0) rsfx('rumble'); await rwait(34); }
      for (let i = 0; i < 24; i++) { b.x += 3; b.rot += 0.12; await rwait(20); } spark(b.x - 20, GROUND - 2, 'dust', 6); s.pose = 'happy'; await rwait(500); }
    else { for (let i = 0; i < 3; i++) { s.bx = 1; await rwait(160); s.bx = 0; await rwait(160); } spark(s.x, headY(), 'sweat', 3); s.pose = 'tired'; await rwait(700); await exBack(70); }
    unprop(b); return; }
  if (stat === 5) {   // Speed: a dart totem firing across pressure plates
    const tr = prop({ k: 'darttrap', x: 206, y: GROUND, live: true, s: 1.5 }); await walkTo(112, 60, 'walk'); s.pose = 'idle'; await rwait(900); tr.live = false;
    const H = 69, fire = hy => { const d = prop({ k: 'dart', x: 194, y: GROUND - H * (1 - hy), s: 1.4 }); (async () => { for (let f = 0; f < 30; f++) { d.x -= 5; await rwait(16); } unprop(d); })(); rsfx('whiz'); return d; };
    s.pose = 'run'; rsfx('leap');
    if (ok) { const plan = [[134, 0.78, 'jump'], [160, 0.42, 'duck'], [186, 0.78, 'jump']];
      for (const [px, hy, move] of plan) { fire(hy); await walkTo(px, 160, 'run'); if (move === 'jump') { s.pose = 'jump'; for (let f = 0; f <= 12; f++) { s.jy = Math.sin(f / 12 * Math.PI) * 18; s.x += 1.2; await rwait(18); } s.jy = 0; } else { s.pose = 'duck'; await rwait(240); } }
      await walkTo(226, 160, 'run'); s.pose = 'happy'; spark(s.x, GROUND - 1, 'dust', 4); await rwait(500); }
    else { fire(0.42); await walkTo(150, 140, 'run'); s.pose = 'hurt'; s.flash = 2; spark(s.x, headY() - 4, 'star', 3); rsfx('hit'); await rwait(400); for (let f = 0; f < 14; f++) { s.x -= 3; s.jy = Math.sin(f / 14 * Math.PI) * 8; await rwait(18); } s.jy = 0; s.pose = 'tired'; await rwait(500); await exBack(84); }
    unprop(tr); return; }
  if (stat === 3) {   // Mind: a rune door with books left lying in front of it
    const d = prop({ k: 'sealdoor', x: 184, y: GROUND, lit: 0, drop: 0 }), lt = prop({ k: 'litter', x: 154, y: GROUND, s: 1.3 }); await walkTo(126, 60, 'walk'); s.pose = 'idle'; spark(s.x, headY() - 6, 'q');
    for (let i = 1; i <= 3; i++) { await rwait(480); if (!ok && i === 3) { d.lit = 0; s.flash = 2; spark(184, GROUND - 40, 'zap', 3); rsfx('zap'); break; } d.lit = i; rsfx('chip'); }
    if (ok) { spark(s.x, headY() - 10, 'bulb'); await rwait(400); for (let f = 0; f < 18; f++) { d.drop += 3.4; await rwait(20); } spark(184, GROUND - 4, 'dust', 6); rsfx('rumble'); await walkTo(212, 60, 'walk'); }
    else { s.pose = 'sad'; await rwait(800); await exBack(96); }
    unprop(d); unprop(lt); return; }
  if (stat === 4) {   // Insight: three archways in a hedge, and two of them aren't there
    const real = seed % 3, m = prop({ k: 'mirage', x: 170, y: GROUND, real, reveal: 0, s: 1.2 }), ax = i => 170 - 55 + 110 * (0.2 + i * 0.3);
    await walkTo(98, 60, 'walk'); s.pose = 'idle'; spark(s.x, headY() - 6, 'q'); await rwait(900);
    if (ok) { spark(s.x, headY() - 10, 'bulb'); rsfx('chip'); for (let f = 0; f <= 20; f++) { m.reveal = f / 20; await rwait(30); } await walkTo(ax(real), 60, 'walk'); await walkTo(224, 60, 'walk'); s.pose = 'happy'; await rwait(400); }
    else { const wrong = (real + 1) % 3; await walkTo(ax(wrong), 70, 'walk'); s.pose = 'hurt'; s.flash = 2; spark(s.x, headY() - 4, 'star', 2); rsfx('thud'); await rwait(500); s.pose = 'sad'; await rwait(400); await exBack(90); }
    unprop(m); return; }
  // Constitution: a bramble wall
  const th = prop({ k: 'thorns', x: 168, y: GROUND, s: 1.35 }); await walkTo(140, 50, 'walk'); s.pose = 'effort';
  if (ok) { for (let i = 0; i < 30; i++) { s.x += 1.6; if (i % 6 === 0) { spark(s.x + 6, headY(), 'sweat'); rsfx('snap'); } await rwait(40); } unprop(th); spark(s.x, GROUND - 2, 'dust', 4); s.pose = 'happy'; await rwait(400); }
  else { await rwait(500); s.pose = 'hurt'; s.flash = 2; spark(s.x, headY() - 4, 'star', 2); await rwait(600); await exBack(84); unprop(th); }
}
