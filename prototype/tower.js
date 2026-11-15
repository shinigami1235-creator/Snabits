/* The Tower, the League's floor-by-floor ladder in town, for Snabits at grade A and up. A climb takes the week.
   Each floor is one fight against a Snabit a little stronger than the last, the Snabit comes back to full between
   floors, and every fifth floor has a keeper. A loss ends the climb, and leaving keeps what was won.
   The best streak is kept on the Snabit and on the ranch. Needs ranch.js, game.js, battle-ui.js and arena-ui.js. */
let TOWER = null;
const TOWER_GRADE = 'A';
const towerOpen = s => s && GRADES.indexOf(s.grade) >= GRADES.indexOf(TOWER_GRADE);
const TOWER_KEEPERS = ['Keeper Quill', 'Keeper Zeno', 'Keeper Ivo', 'Keeper Yuki'];
const TOWER_PRIZE = { 5: 'Energy cell', 10: 'Life seed', 15: 'Stat seed', 20: 'Life fruit', 25: 'Rebirth seed', 30: 'Element stone', 40: 'Life fruit', 50: 'Life fruit' };
function towerFoe(s, n, R) {
  const keeper = n % 5 === 0, lv = Math.min(99, s.level - 2 + Math.floor(n / 2) + (keeper ? 3 : 0)), G = GRADE_INFO[s.grade] || GRADE_INFO.A;
  const earned = Math.round(G.earned[0] + (G.earned[1] - G.earned[0]) * Math.min(1.6, 0.35 + n * 0.04));
  const o = gradedOpponent(s.grade, lv, R, null, earned);
  if (keeper) o.boss = TOWER_KEEPERS[(n / 5 - 1) % TOWER_KEEPERS.length];
  return o;
}
function openTower() {
  const s = RS; if (!s) return;
  const best = s.towerBest || 0, ranchBest = (PLAYER.towerBest || 0);
  panel(`<div class="full lab-head"><b>The Tower</b><button class="small" id="tw-tback">Back</button></div>
    <div class="full lab-info">${best ? `${displayName(s)}'s best is ${best} floor${best > 1 ? 's' : ''}.` : `${displayName(s)} hasn't climbed it yet.`}${ranchBest > best ? ` The ranch's best is ${ranchBest}.` : ''}</div>
    <button class="rb full feat" id="tw-climb">Climb<small>Takes the week</small></button>`);
  el('tw-tback').onclick = openTown;
  el('tw-climb').onclick = () => { if (s.busy) return; TOWER = { n: 1, won: [], bits: 0, R: rng(hashStr(s.id + '|tower|' + PLAYER.week)) }; towerFloor(); };
}
function towerFloor() {
  const s = RS, T = TOWER, keeper = T.n % 5 === 0, o = T.foe || (T.foe = towerFoe(s, T.n, T.R));
  const nm = o.boss ? `${o.boss} with ${o.m.name}` : o.m.name;
  panel(`<div class="full lab-head"><b>Floor ${T.n}</b><span style="font-size:13px">${T.n - 1} won</span></div>
    <div class="full lab-info">${keeper ? `The keeper of floor ${T.n} is waiting with ${aOr(o.m.name)} ${o.m.name}, level ${o.level}.` : `${aOr(o.m.name).replace(/^a/, 'A')} ${o.m.name}, level ${o.level}.`}</div>
    <button class="rb feat" id="tw-f">Fight</button><button class="rb" id="tw-a">Auto</button><button class="rb" id="tw-m">Moves</button><button class="rb" id="tw-l">Leave<small>${T.n > 1 ? `Keep the ${T.n - 1} floor${T.n > 2 ? 's' : ''} won` : 'Go home'}</small></button>`);
  const go = mode => { panel(''); arenaFight({ s, foe: o, mode, title: keeper ? 'Tower keeper' : 'Tower', noDraw: true, learn: true, rand: T.R, onEnd: r => towerAfter(r) }); };
  el('tw-f').onclick = () => go('control'); el('tw-a').onclick = () => go('auto');
  el('tw-m').onclick = () => atPresetCard(s, towerFloor);
  el('tw-l').onclick = () => towerEnd(false);
}
function towerAfter(r) {
  const s = RS, T = TOWER;
  s.fatigue = Math.min(100, s.fatigue + 4); clampAll();
  if (r.winner !== 0) return towerEnd(true);
  const pay = 60 + T.n * 25; PLAYER.bits += pay; T.bits += pay;
  if (TOWER_PRIZE[T.n]) { addItem(TOWER_PRIZE[T.n]); T.won.push(TOWER_PRIZE[T.n]); }
  T.n++; T.foe = null; drawUI(); saveGame(); towerFloor();
}
function towerEnd(lost) {
  const s = RS, T = TOWER, floors = T.n - 1; TOWER = null;
  if (!floors && !lost) { openTower(); return; }   // turned back at the door, so the week isn't used
  const best = floors > (s.towerBest || 0); s.towerBest = Math.max(s.towerBest || 0, floors); PLAYER.towerBest = Math.max(PLAYER.towerBest || 0, floors);
  const won = T.won.length ? ` It also won ${T.won.map(w => `${aOr(w)} ${w}`).join(', ')}.` : '';
  const line = floors ? `${lost ? `${displayName(s)} lost on floor ${floors + 1}` : `${displayName(s)} came down after floor ${floors}`}, with ${T.bits} bits.${won}${best ? ` That's its best climb.` : ''}` : `${displayName(s)} ${lost ? 'lost on the first floor' : 'came home without climbing'}.`;
  panel(''); s.weekAct = 'Tower';
  scene(async () => { await endWeek(1, line); });
}
