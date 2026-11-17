/* The floors of a team expedition, built by the rules Gid's roguelike, the Deep Mouth, builds its floors with (dungeon.py,
   DUNGEON_AUDIT_74W.md, waves 74X and 79). Gid, 17 Nov 2026: procedurally generated maps with interchangeable designs but
   fixed rules on how a map should be.
   Rooms and corridors:
   - a room's long side is rolled first, and its short side is kept within 2 to 1 of it, counted on the floor you can walk on
   - rooms go one to a cell of a loose grid with some cells left empty, and two rooms never touch
   - each room digs an L-shaped corridor to the nearest room already placed, stranded groups get joined to the rest, and then
     about two rooms in five also dig to their second-nearest, so there's more than one way round
   - corridors never run two wide: one tile of every 2 by 2 block of corridor is filled back in wherever the floor stays whole
   - about one doorway in three gets a door, only on a one-tile gap in a wall and never touching another door
   - one floor in twenty has a dark room, never the room you arrive in
   Caverns, for the Rift and now and then a region's last floor: round chambers with short corridors between them and no doors.
   Room designs are interchangeable: plain, pillars, a pool, rubble or a garden, on any room big enough for one, with the
   region's own kind picked more often. A design only uses the floor two tiles in from the walls, so the ring of floor inside the
   walls always stays open and no design can cut a room off.
   What goes on a floor: the stairs, camps, chests, springs, obstacles, and the patrolling Snabits; deep-more.js adds the
   waystone, the sealed way and Rook's team, horror.js the tears and lairs, and the last floor holds the guardian.
   An obstacle or a sealed way only ever stands in a corridor that has another way round it, or in the one doorway of a dead-end
   room, so failing one never cuts the way down. */

const DG = { W: 44, H: 30, ROCK: 0, ROOM: 1, HALL: 2, DOOR: 3, WATER: 4, PILLAR: 5, RUBBLE: 6 };
const DG_ROOM = [5, 9], DG_ASPECT = 2, DG_CELL_H = 9, DG_SKIP = 0.15, DG_LOOPS = 0.4, DG_DOOR = 0.35, DG_DARK = 0.05;
const DG_CAVE = { tries: 60, rx: [3, 3, 4, 4, 5, 5, 6, 6, 7], ry: [2, 2, 3, 3, 4, 4, 5], gap: 1, n: 3, bump: 0.5 };
const DG_DESIGN = { Tide: 'pool', Frost: 'pool', Wild: 'garden', Charm: 'garden', Venom: 'garden', Stone: 'rubble', Brawl: 'rubble', Blaze: 'rubble',
  Steel: 'pillars', Spark: 'pillars', Light: 'pillars', Shade: 'pillars', Void: 'pillars' };
const dgPass = t => t === DG.ROOM || t === DG.HALL || t === DG.DOOR;

/* ---------- one floor ---------- */
function dgNew(kind) { const { W, H } = DG; return { w: W, h: H, kind, t: new Uint8Array(W * H), room: new Int16Array(W * H).fill(-1), rooms: [], feat: {}, pats: [], seen: new Uint8Array(W * H), open: {} }; }
const dgI = (F, x, y) => y * F.w + x;
const dgIn = (F, x, y) => x >= 0 && y >= 0 && x < F.w && y < F.h;
const dgAt = (F, x, y) => dgIn(F, x, y) ? F.t[dgI(F, x, y)] : DG.ROCK;
const dgCentre = r => [Math.floor((r.x1 + r.x2) / 2), Math.floor((r.y1 + r.y2) / 2)];
function dgDig(F, x, y) { if (dgIn(F, x, y) && F.t[dgI(F, x, y)] === DG.ROCK) F.t[dgI(F, x, y)] = DG.HALL; }
function dgL(F, R, [ax, ay], [bx, by]) {
  const h = (x1, x2, y) => { for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) dgDig(F, x, y); }, v = (y1, y2, x) => { for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) dgDig(F, x, y); };
  if (R() < 0.5) { h(ax, bx, ay); v(ay, by, bx); } else { v(ay, by, ax); h(ax, bx, by); }
}
// every open tile reachable from a start, with some tiles counted as shut
function dgReach(F, sx, sy, shut) {
  const seen = new Uint8Array(F.w * F.h), q = [dgI(F, sx, sy)]; if (!dgPass(F.t[q[0]])) return seen; seen[q[0]] = 1;
  while (q.length) { const i = q.pop(), x = i % F.w, y = (i / F.w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!dgIn(F, nx, ny)) continue; const j = dgI(F, nx, ny);
      if (!seen[j] && dgPass(F.t[j]) && !(shut && shut.has(j))) { seen[j] = 1; q.push(j); } } }
  return seen;
}
function dgWhole(F, shut) { let start = -1, n = 0; for (let i = 0; i < F.t.length; i++) if (dgPass(F.t[i]) && !(shut && shut.has(i))) { n++; if (start < 0) start = i; }
  if (start < 0) return true; const S = dgReach(F, start % F.w, (start / F.w) | 0, shut); let m = 0; for (let i = 0; i < S.length; i++) m += S[i]; return m === n; }
// steps from a tile to every tile, for picking the far room and for patrols
function dgDist(F, sx, sy, shut) {
  const D = new Int16Array(F.w * F.h).fill(-1), q = [dgI(F, sx, sy)]; D[q[0]] = 0;
  for (let h = 0; h < q.length; h++) { const i = q[h], x = i % F.w, y = (i / F.w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!dgIn(F, nx, ny)) continue; const j = dgI(F, nx, ny);
      if (D[j] < 0 && dgPass(F.t[j]) && !(shut && shut.has(j))) { D[j] = D[i] + 1; q.push(j); } } }
  return D;
}

/* rooms and corridors */
function dgSize(R, lo, hi) {
  const long = lo + Math.floor(R() * (hi - lo + 1)), floor = Math.max(lo, Math.round((long - 1) / DG_ASPECT) + 1), lo2 = Math.min(floor, long), short = lo2 + Math.floor(R() * (long - lo2 + 1));
  return R() < 0.5 ? [long, short] : [short, long];
}
function dgRooms(R, el) {
  const F = dgNew('rooms'), { W, H } = DG, [lo, hi] = DG_ROOM, cols = Math.max(1, Math.floor((W - 2) / (lo + 6))), rows = Math.max(1, Math.floor((H - 2) / DG_CELL_H));
  const cw = Math.floor((W - 2) / cols), ch = Math.floor((H - 2) / rows), cells = [];
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) cells.push([c, r]);
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  for (const [c, r] of cells) {
    if (R() < DG_SKIP) continue;
    let [w, h] = dgSize(R, lo, Math.min(hi, cw - 2)); h = Math.min(h, ch - 2); if (w < lo || h < 4) continue;
    const x0 = 1 + c * cw, y0 = 1 + r * ch, x1 = Math.min(W - w - 2, x0 + cw - w - 1), y1 = Math.min(H - h - 2, y0 + ch - h - 1); if (x1 < x0 || y1 < y0) continue;
    const x = x0 + Math.floor(R() * (x1 - x0 + 1)), y = y0 + Math.floor(R() * (y1 - y0 + 1)), rm = { x1: x, y1: y, x2: x + w, y2: y + h };
    if (F.rooms.some(o => rm.x1 <= o.x2 && rm.x2 >= o.x1 && rm.y1 <= o.y2 && rm.y2 >= o.y1)) continue;
    const k = F.rooms.length; for (let yy = rm.y1 + 1; yy < rm.y2; yy++) for (let xx = rm.x1 + 1; xx < rm.x2; xx++) { F.t[dgI(F, xx, yy)] = DG.ROOM; F.room[dgI(F, xx, yy)] = k; }
    const [cx, cy] = dgCentre(rm);
    if (F.rooms.length) { const near = F.rooms.reduce((m, o) => { const [ox, oy] = dgCentre(o), [mx, my] = dgCentre(m); return (ox - cx) ** 2 + (oy - cy) ** 2 < (mx - cx) ** 2 + (my - cy) ** 2 ? o : m; }); dgL(F, R, dgCentre(near), [cx, cy]); }
    F.rooms.push(rm);
  }
  if (F.rooms.length < 4) return null;
  dgJoin(F, R);
  for (const rm of F.rooms) { if (R() >= DG_LOOPS) continue; const [cx, cy] = dgCentre(rm), o = F.rooms.filter(x => x !== rm).sort((a, b) => { const [ax, ay] = dgCentre(a), [bx, by] = dgCentre(b); return (ax - cx) ** 2 + (ay - cy) ** 2 - (bx - cx) ** 2 - (by - cy) ** 2; });
    if (o.length >= 2) dgL(F, R, dgCentre(o[1]), [cx, cy]); }
  dgThin(F);
  // doors: some of the one-tile gaps in a room's wall
  for (const rm of F.rooms) for (const [x, y] of dgOpenings(F, rm)) {
    const i = dgI(F, x, y); if (F.t[i] !== DG.HALL || !dgDoorway(F, x, y)) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => dgAt(F, x + dx, y + dy) === DG.DOOR)) continue;
    if (R() < DG_DOOR) F.t[i] = DG.DOOR; }
  // the designs: the region's own kind turns up more often
  const pick = () => { const L = ['plain', 'plain', 'plain', 'plain', 'pillars', 'pool', 'rubble', 'garden'], own = DG_DESIGN[el]; if (own) L.push(own, own, own); return L[Math.floor(R() * L.length)]; };
  F.rooms.forEach(rm => { rm.design = pick(); dgDress(F, rm, R); });
  return F;
}
function dgJoin(F, R) {
  for (let k = 0; k < F.rooms.length; k++) {
    const [sx, sy] = dgCentre(F.rooms[0]), S = dgReach(F, sx, sy), lost = F.rooms.filter(r => { const [x, y] = dgCentre(r); return !S[dgI(F, x, y)]; }); if (!lost.length) return;
    const [lx, ly] = dgCentre(lost[0]), home = F.rooms.filter(r => { const [x, y] = dgCentre(r); return S[dgI(F, x, y)]; }).reduce((m, o) => { const [ox, oy] = dgCentre(o), [mx, my] = dgCentre(m); return (ox - lx) ** 2 + (oy - ly) ** 2 < (mx - lx) ** 2 + (my - ly) ** 2 ? o : m; });
    dgL(F, R, dgCentre(home), [lx, ly]);
  }
}
// fills one tile of every 2 by 2 block of corridor, wherever the floor stays whole
function dgThin(F) {
  for (let y = 0; y < F.h - 1; y++) for (let x = 0; x < F.w - 1; x++) {
    const B = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]; if (!B.every(([a, b]) => F.t[dgI(F, a, b)] === DG.HALL)) continue;
    for (const [a, b] of B) { const i = dgI(F, a, b); F.t[i] = DG.ROCK; if (dgWhole(F)) break; F.t[i] = DG.HALL; } }
}
function dgOpenings(F, rm) { const out = [];
  for (let x = rm.x1; x <= rm.x2; x++) for (const y of [rm.y1, rm.y2]) if (dgAt(F, x, y) !== DG.ROCK) out.push([x, y]);
  for (let y = rm.y1 + 1; y < rm.y2; y++) for (const x of [rm.x1, rm.x2]) if (dgAt(F, x, y) !== DG.ROCK) out.push([x, y]);
  return out; }
const dgDoorway = (F, x, y) => (dgAt(F, x - 1, y) === DG.ROCK && dgAt(F, x + 1, y) === DG.ROCK) || (dgAt(F, x, y - 1) === DG.ROCK && dgAt(F, x, y + 1) === DG.ROCK);
// a room's design, kept two tiles in from its walls
function dgDress(F, rm, R) {
  const x0 = rm.x1 + 2, x1 = rm.x2 - 2, y0 = rm.y1 + 2, y1 = rm.y2 - 2; if (x1 < x0 || y1 < y0) { rm.design = rm.design === 'garden' ? 'garden' : 'plain'; return; }
  const put = (x, y, t) => { const i = dgI(F, x, y); if (F.t[i] === DG.ROOM) F.t[i] = t; };
  if (rm.design === 'pillars') { if (x1 - x0 < 2 || y1 - y0 < 2) { rm.design = 'plain'; return; } for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) put(x, y, DG.PILLAR); }
  if (rm.design === 'pool') { if (x1 - x0 < 1) { rm.design = 'plain'; return; } for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, DG.WATER); }
  if (rm.design === 'rubble') { const n = 2 + Math.floor(R() * 3); for (let k = 0; k < n; k++) put(x0 + Math.floor(R() * (x1 - x0 + 1)), y0 + Math.floor(R() * (y1 - y0 + 1)), DG.RUBBLE); }
}

/* caverns: round chambers, joined by short corridors */
function dgCaves(R) {
  const F = dgNew('caves'), { W, H } = DG, C = DG_CAVE, placed = [];
  const shape = (cx, cy, rx, ry, pad) => { const out = [], px = rx + pad + C.bump, py = ry + pad + C.bump;
    for (let y = Math.max(1, cy - ry - pad); y < Math.min(H - 1, cy + ry + pad + 1); y++) for (let x = Math.max(1, cx - rx - pad); x < Math.min(W - 1, cx + rx + pad + 1); x++)
      if ((Math.abs(x - cx) / px) ** C.n + (Math.abs(y - cy) / py) ** C.n <= 1) out.push([x, y]); return out; };
  for (let k = 0; k < C.tries; k++) {
    const rx = C.rx[Math.floor(R() * C.rx.length)], ry = C.ry[Math.floor(R() * C.ry.length)], cx = rx + 1 + Math.floor(R() * Math.max(1, W - 2 * rx - 3)), cy = ry + 1 + Math.floor(R() * Math.max(1, H - 2 * ry - 3));
    if (placed.some(([px, py, prx, pry]) => (Math.abs(cx - px) / (rx + prx + C.gap + 1)) ** C.n + (Math.abs(cy - py) / (ry + pry + C.gap + 1)) ** C.n <= 1)) continue;
    const kk = F.rooms.length; for (const [x, y] of shape(cx, cy, rx, ry, 0)) { F.t[dgI(F, x, y)] = DG.ROOM; F.room[dgI(F, x, y)] = kk; }
    if (placed.length) { const n = placed.reduce((m, p) => (p[0] - cx) ** 2 + (p[1] - cy) ** 2 < (m[0] - cx) ** 2 + (m[1] - cy) ** 2 ? p : m); dgL(F, R, [n[0], n[1]], [cx, cy]); }
    placed.push([cx, cy, rx, ry]); F.rooms.push({ x1: Math.max(0, cx - rx - 1), y1: Math.max(0, cy - ry - 1), x2: Math.min(W - 1, cx + rx + 1), y2: Math.min(H - 1, cy + ry + 1), cx, cy, rx, ry, design: 'plain', cave: true });
  }
  if (F.rooms.length < 4) return null;
  // a scrap of open floor with no open neighbour is filled back in
  for (let i = 0; i < F.t.length; i++) { const x = i % W, y = (i / W) | 0; if (F.t[i] !== DG.ROCK && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => dgPass(dgAt(F, x + dx, y + dy)))) { F.t[i] = DG.ROCK; F.room[i] = -1; } }
  dgJoin(F, R); dgThin(F);
  // now and then a pool in the middle of a big chamber
  for (const c of F.rooms) if (c.rx >= 5 && c.ry >= 4 && R() < 0.25) { c.design = 'pool'; for (const [x, y] of shape(c.cx, c.cy, c.rx - 3, c.ry - 3, 0)) { const i = dgI(F, x, y); if (F.t[i] === DG.ROOM) F.t[i] = DG.WATER; } }
  if (!dgWhole(F)) return null;
  return F;
}
const dgRoomCentre = rm => rm.cave ? [rm.cx, rm.cy] : dgCentre(rm);

/* ---------- what's on a floor ---------- */
// the free floor tiles of a room, centre first
function dgFree(F, k, shut) { const rm = F.rooms[k], [cx, cy] = dgRoomCentre(rm), out = [];
  for (let y = rm.y1; y <= rm.y2; y++) for (let x = rm.x1; x <= rm.x2; x++) { const i = dgI(F, x, y); if (F.room[i] === k && F.t[i] === DG.ROOM && !F.feat[i] && !(shut && !shut[i])) out.push([x, y]); }
  return out.sort((a, b) => Math.abs(a[0] - cx) + Math.abs(a[1] - cy) - Math.abs(b[0] - cx) - Math.abs(b[1] - cy)); }
// a dead-end room: one way in, through a one-tile doorway. Returns [doorway x, y, room] or null
function dgLeaf(F, used) {
  if (F.kind !== 'rooms') return null;
  for (let k = 1; k < F.rooms.length; k++) { const rm = F.rooms[k]; if (k === F.upRoom || k === F.downRoom || used.includes(k)) continue;
    const O = dgOpenings(F, rm); if (O.length !== 1) continue; const [x, y] = O[0], i = dgI(F, x, y);
    if (Object.values(F.feat).some(n => F.room[dgI(F, n.x, n.y)] === k)) continue;   // nothing already inside
    if (F.feat[i] || !dgDoorway(F, x, y)) continue; return [x, y, k]; }
  return null;
}
// a corridor tile with another way round it, so shutting it cuts nothing off
function dgLoopTile(F, R, shut) {
  const L = []; for (let i = 0; i < F.t.length; i++) if (F.t[i] === DG.HALL && !F.feat[i] && F.room[i] < 0) L.push(i);
  for (let k = L.length - 1; k > 0; k--) { const j = Math.floor(R() * (k + 1)); [L[k], L[j]] = [L[j], L[k]]; }
  for (const i of L.slice(0, 40)) { const S = new Set(shut); S.add(i); if (dgWhole(F, S)) return i; }
  return -1;
}

/* the whole expedition: three floors, the guardian on the last. o: { el, caves: [floor kinds], season seed } */
function dgExpedition(seed, o) {
  const R = rng(hashStr(seed)), floors = []; o.sealFloor = [1, 2, 0].find(f => o.kinds[f] === 'rooms');
  for (let f = 0; f < 3; f++) {
    let F = null;
    for (let k = 0; k < 40 && !F; k++) { F = o.kinds[f] === 'caves' ? dgCaves(R) : dgRooms(R, o.el); if (F && !dgStock(F, f, R, o)) F = null; }
    floors.push(F);
  }
  const M = { floors, f: 0, seed };
  // puts a feature in a room on one of the listed floors, away from the stairs. Returns the feature or null
  M.place = (k, props, fls, R2 = R) => {
    for (let tries = 0; tries < 20; tries++) {
      const f = fls[Math.floor(R2() * fls.length)], F = floors[f], open = dgReach(F, ...F.up, F.shut);
      const ks = F.rooms.map((r, i) => i).filter(i => i !== F.upRoom && !(k !== 'guard' && i === F.downRoom && f === 2) && !F.leafUsed.includes(i)); if (!ks.length) continue;
      const free = dgFree(F, ks[Math.floor(R2() * ks.length)], open); if (!free.length) continue;
      const [x, y] = free[Math.min(free.length - 1, Math.floor(R2() * Math.min(4, free.length)))], i = dgI(F, x, y);
      return F.feat[i] = { k, id: `${f}:${k}:${i}`, f, x, y, ...props };
    }
    return null;
  };
  M.leaf = f => { const F = floors[f]; if (F.sealLeaf) { const L = F.sealLeaf; F.sealLeaf = null; return L; } return dgLeaf(F, F.leafUsed); };
  return M;
}
// stairs, camps, chests, springs, obstacles and patrols on one floor. False if the floor can't hold them
function dgStock(F, f, R, o) {
  F.shut = new Set(); F.leafUsed = [];
  // the stairs: up in the first room, down in the room farthest from it
  F.upRoom = 0; const up = dgFree(F, 0)[0]; if (!up) return false; F.up = up;
  const D = dgDist(F, ...up); let best = -1;
  F.rooms.forEach((rm, k) => { const [x, y] = dgRoomCentre(rm), d = D[dgI(F, x, y)]; if (k && d > best) { best = d; F.downRoom = k; } });
  if (best < 12) return false;
  const down = dgFree(F, F.downRoom)[0]; if (!down) return false; F.down = down;
  const at = (x, y, n) => { const i = dgI(F, x, y); return F.feat[i] = { id: `${f}:${n.k}:${i}`, f, x, y, ...n }; };
  at(...up, { k: 'up', start: f === 0 });
  at(...down, f === 2 ? { k: 'guard', id: 'guard' } : { k: 'down' });
  // obstacles: in a dead-end room's doorway with a chest behind it, or in a corridor with a way round
  const want = f === 0 ? [{ mul: 1 + R() * 0.1 }] : f === 1 ? [{ mul: 1.02 + R() * 0.1, two: true }] : [{ mul: 1.1 + R() * 0.12 }];
  for (const w of want) {
    const st = [1, 2, 3, 4, 5].sort(() => R() - 0.5), n = { k: 'block', stat: st[0], mul: w.mul }; if (w.two) n.stat2 = st[1];
    const lf = R() < 0.6 && f !== o.sealFloor ? dgLeaf(F, F.leafUsed) : null;   // the sealed way's floor keeps its dead-end room for it
    if (lf) { const [x, y, k] = lf; F.leafUsed.push(k); at(x, y, n); F.shut.add(dgI(F, x, y)); const c = dgFree(F, k)[0]; if (c) at(...c, { k: 'chest', big: true }); continue; }
    const i = dgLoopTile(F, R, F.shut); if (i < 0) continue; at(i % F.w, (i / F.w) | 0, n); F.shut.add(i);
  }
  if (f === o.sealFloor) { const L = dgLeaf(F, F.leafUsed); if (!L) return false; F.sealLeaf = L; F.leafUsed.push(L[2]); }   // a dead-end room kept for the sealed way (deep-more.js)
  // a camp on the lower floors, next to the stairs you arrive by
  const open = dgReach(F, ...up, F.shut), put = (k, props) => { const ks = F.rooms.map((r, i) => i).filter(i => i !== F.upRoom && i !== F.downRoom && !F.leafUsed.includes(i));
    for (let t = 0; t < 12; t++) { const free = dgFree(F, ks[Math.floor(R() * ks.length)], open); if (free.length) { const [x, y] = free[Math.floor(R() * Math.min(5, free.length))]; return at(x, y, { k, ...props }); } } return null; };
  if (f > 0) { const c = dgFree(F, F.upRoom, open)[0]; if (c) at(...c, { k: "camp" }); }
  for (let k = 0; k < (f === 2 ? 1 : 2); k++) put('chest');
  if (f < 2) put('spring');
  // the Snabits that walk the floor
  const pk = F.rooms.map((r, i) => i).filter(i => i !== F.upRoom && !(f === 2 && i === F.downRoom) && !F.leafUsed.includes(i));
  for (let k = 0; k < [2, 3, 3][f] && pk.length; k++) { const r = pk.splice(Math.floor(R() * pk.length), 1)[0], free = dgFree(F, r, open); if (free.length) { const [x, y] = free[free.length >> 1]; F.pats.push({ x, y, id: `${f}:p${k}`, home: r }); } }
  // now and then a dark room, never the one you arrive in
  if (F.kind === 'rooms' && R() < DG_DARK) F.rooms[1 + Math.floor(R() * (F.rooms.length - 1))].dark = true;
  return true;
}

/* ---------- seeing ---------- */
// a straight line of sight: nothing solid between
function dgLine(F, x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy, x = x0, y = y0;
  for (;;) { if (x === x1 && y === y1) return true; if (!(x === x0 && y === y0)) { const t = dgAt(F, x, y); if (t === DG.ROCK || t === DG.PILLAR || (t === DG.DOOR && !F.open[dgI(F, x, y)])) return false; }
    const e2 = 2 * e; if (e2 >= dy) { e += dy; x += sx; } if (e2 <= dx) { e += dx; y += sy; } }
}
// what the leader sees from a tile: a whole lit room from inside it or its doorway, and a short way round otherwise
function dgSee(F, x, y) {
  const S = new Set(), add = (a, b) => { if (dgIn(F, a, b)) S.add(dgI(F, a, b)); };
  let k = F.room[dgI(F, x, y)];
  if (k < 0) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = F.room[dgI(F, x + dx, y + dy)] ?? -1; if (j >= 0 && F.kind === 'rooms') k = j; }
  const rm = k >= 0 ? F.rooms[k] : null;
  if (rm && !rm.dark && F.kind === 'rooms') for (let b = rm.y1; b <= rm.y2; b++) for (let a = rm.x1; a <= rm.x2; a++) add(a, b);
  const rad = F.kind === 'caves' ? 5 : rm && rm.dark ? 1 : 2;
  for (let b = y - rad; b <= y + rad; b++) for (let a = x - rad; a <= x + rad; a++) if (dgIn(F, a, b) && (a - x) ** 2 + (b - y) ** 2 <= rad * rad + 1 && dgLine(F, x, y, a, b)) add(a, b);
  // the rock next to anything seen shows as wall
  for (const i of [...S]) { const a = i % F.w, b = (i / F.w) | 0; if (F.t[i] === DG.ROCK) continue; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dgAt(F, a + dx, b + dy) === DG.ROCK) add(a + dx, b + dy); }
  return S;
}

/* ---------- the patrols ---------- */
// tiles a patrol won't step on: blockers, the stairs and anything else on the floor
function dgPatShut(F) { const S = new Set(F.shut); for (const k in F.feat) S.add(+k); return S; }
// one turn for every patrol. Returns the first one now touching the leader, or null
function dgPatrols(F, L, seeNow, R) {
  const shut = dgPatShut(F), toL = dgDist(F, L.x, L.y, shut);
  for (const p of F.pats) {
    if (p.dead) continue;
    const near = Math.abs(p.x - L.x) + Math.abs(p.y - L.y), sees = seeNow.has(dgI(F, p.x, p.y)) && near <= 6;
    if (sees) p.chase = true; else if (near > 10) p.chase = false;
    if (R() > (p.chase ? 0.75 : 0.55)) continue;
    let D;
    if (p.chase) D = toL;
    else { if (!p.goal || (p.goal[0] === p.x && p.goal[1] === p.y)) { const r = F.rooms[Math.floor(R() * F.rooms.length)], fr = dgFree(F, F.rooms.indexOf(r)); p.goal = fr.length ? fr[Math.floor(R() * fr.length)] : null; }
      if (!p.goal) continue; D = dgDist(F, p.goal[0], p.goal[1], shut); }
    let bx = p.x, by = p.y, bd = D[dgI(F, p.x, p.y)];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = p.x + dx, ny = p.y + dy; if (!dgIn(F, nx, ny)) continue; const d = D[dgI(F, nx, ny)];
      if (d >= 0 && (bd < 0 || d < bd) && !F.pats.some(o => o !== p && !o.dead && o.x === nx && o.y === ny)) { bx = nx; by = ny; bd = d; } }
    if (bx === L.x && by === L.y) return p;
    p.x = bx; p.y = by;
  }
  return F.pats.find(p => !p.dead && Math.abs(p.x - L.x) + Math.abs(p.y - L.y) <= 1) || null;
}
// a new patrol in a room out of sight, after a night at camp
function dgSpawn(F, L, R) {
  const D = dgDist(F, L.x, L.y, F.shut), ks = F.rooms.map((r, i) => i).filter(i => { const [x, y] = dgRoomCentre(F.rooms[i]); return D[dgI(F, x, y)] > 14; });
  if (!ks.length) return null; const k = ks[Math.floor(R() * ks.length)], fr = dgFree(F, k); if (!fr.length) return null;
  const p = { x: fr[0][0], y: fr[0][1], id: 'n' + F.pats.length, home: k }; F.pats.push(p); return p;
}
// rock with open floor next to it, which the map shows as wall
function dgWall(F, i) { const x = i % F.w, y = (i / F.w) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (F.t[i] === DG.ROCK && dgAt(F, x + dx, y + dy) !== DG.ROCK) return true; return false; }
