/* Contests: one in the first week of every month, judged on stats or looks instead of a fight. Strength, Speed,
   Smarts and Style take turns. Junior is for grades E and D, Senior for C and B, Pro for A and S. Three rounds,
   five entrants, and the prize table pays the top three. Needs ranch.js, game.js and story.js. */
const CONTEST_KINDS = [
  { kind: 'Strength', judged: 'Power and Constitution', stats: [1, 2], place: 'quarry', rounds: ['The boulder lift', 'The cart push', 'The log hold'] },
  { kind: 'Speed', judged: 'Speed and Stamina', stats: [5, 0], place: 'road', rounds: ['The sprint', 'The hurdles', 'The long run'] },
  { kind: 'Smarts', judged: 'Mind and Insight', stats: [3, 4], place: 'study', rounds: ['The puzzle box', 'The memory cards', 'The maze'] },
  { kind: 'Style', judged: 'loyalty, what it wears and its cups', stats: null, place: 'court', rounds: ['The walk', 'The pose', 'The trick'] },
];
const CONTEST_WINS = { 1: 'Bow', 3: 'Party hat', 6: 'Top hat', 12: 'Crown' };   // something to wear at each milestone
const CONTEST_TIER = g => GRADES.indexOf(g) < 2 ? ['Junior', 'E', 400, 'Energy nut'] : GRADES.indexOf(g) < 4 ? ['Senior', 'C', 1500, 'Stat seed'] : ['Pro', 'A', 5000, 'Life seed'];
function contestOf(w) { const { mo, wk } = weekParts(w); if (wk !== 0) return null; const K = CONTEST_KINDS[mo % 4]; return { ...K, name: `${K.kind} Contest` }; }
function nextContest() { for (let k = 0; k < 8; k++) { const c = contestOf(PLAYER.week + k); if (c) return [k, c]; } return [null, null]; }

/* a score out of 10 from two stats, against what a monster of this tier usually has */
function contestScore(f, K, tierG, R) {
  if (!K.stats) return null;
  const v = [f.maxhp / 2, f.base.pow, f.base.grd, f.base.mnd, f.base.spr, f.base.spd], a = v[K.stats[0]] * 0.65 + v[K.stats[1]] * 0.35;
  const par = { E: 45, C: 105, A: 170 }[tierG];
  return clamp(6 + (a / par - 1) * 6 + (R() - 0.5) * 2.2, 1, 9.9);
}
function styleScore(s, R) {
  const worn = Object.values(s.worn || {}).filter(Boolean).length;
  return clamp(3 + hearts() * 0.9 + worn * 0.6 + (s.variant ? 0.8 : 0) + Math.min(2, (s.cups || []).length * 0.25) + (s.mess > 40 ? -1.5 : 0) + (R() - 0.5) * 2, 1, 9.9);
}

function openContests() {
  const s = RS, c = contestOf(PLAYER.week), [k, nx] = nextContest(), T = CONTEST_TIER(s.grade);
  const ill = null;
  panel(`<div class="full lab-head"><b>Contests</b><button class="small" id="ct-back">Back</button></div>
    <div class="full lab-info">${c ? `The ${T[0]} ${c.name} is on this week, judged on ${c.judged}. First place wins ${T[2].toLocaleString()} bits and ${/^[AEIOU]/.test(T[3]) ? 'an' : 'a'} ${T[3]}. It takes the week.` : `The next contest is the ${nx.name} in ${k} week${k > 1 ? 's' : ''}, judged on ${nx.judged}.`}</div>
    ${c ? `<button class="rb full feat" id="ct-go" ${ill ? 'disabled' : ''}>Enter the ${T[0]} ${c.name}<small>${ill || `${story().contests} contest${story().contests === 1 ? '' : 's'} won so far`}</small></button>` : ''}`);
  el('ct-back').onclick = () => menu('Out');
  if (c && !ill) el('ct-go').onclick = () => runContest(c);
}

async function runContest(K) {
  const s = RS, T = CONTEST_TIER(s.grade), R = rng(hashStr(s.id + '|contest|' + PLAYER.week)), nm = s.m.name;
  const rivals = [0, 1, 2, 3].map(() => { const G = GRADE_INFO[T[1]], o = gradedOpponent(T[1], Math.round(G.lv[0] + R() * (G.lv[1] - G.lv[0])), R); return { o, name: o.m.name, f: makeFighter(o.fm, o.skills, o.level), sum: 0 }; });
  const me = { name: nm, f: playerFighter(s), sum: 0, me: true }, all = [me].concat(rivals);
  await scene(async () => {
    s.weekAct = 'Contest'; say(`${nm} is entered in the ${T[0]} ${K.name}. It has three rounds, and the judges score each one out of 10.`);
    await goPlace(K.place);
    if (K.kind === 'Strength') prop({ k: 'crate', x: s.x + 24, y: GROUND });
    rivals.slice(0, 2).forEach((r, i) => prop({ k: 'foe', x: s.x - 50 - i * 30, y: GROUND, fm: r.o.fm, grid: r.o.fm.grid, pal: r.o.fm.pal }));
    for (let r = 0; r < 3; r++) {
      banner(`Round ${r + 1}: ${K.rounds[r]}`, '#fff'); await rwait(1100); banner('');
      for (const e of all) e.last = e.me ? (K.stats ? contestScore(e.f, K, T[1], R) : styleScore(s, R)) : (K.stats ? contestScore(e.f, K, T[1], R) : clamp(3.5 + R() * 5.5, 1, 9.9));
      // what it does in the round, by kind
      const good = me.last >= 6.5;
      if (K.kind === 'Speed') { const x0 = s.x; await walkTo(x0 - 50, 90, 'walk'); await walkTo(x0 + 20, good ? 130 : 70, 'run'); await walkTo(x0, 60, 'walk'); }
      else if (K.kind === 'Strength') { for (let i = 0; i < 3; i++) { s.pose = 'effort'; s.bx = 2; spark(s.x + 12, GROUND - 6, 'dust', 2); await rwait(260); s.bx = 0; await rwait(140); } }
      else if (K.kind === 'Smarts') { s.pose = 'idle'; spark(s.x, headY() - 6, 'q'); await rwait(700); if (good) spark(s.x, headY() - 6, 'bulb'); await rwait(500); }
      else { s.pose = 'happy'; await hop(12, 360); s.dir = -s.dir; await rwait(200); s.dir = -s.dir; await hop(8, 300); }
      s.pose = good ? 'happy' : 'idle'; if (good) spark(s.x, headY() - 6, 'sparkle', 4);
      for (const e of all) e.sum += e.last;
      const lead = all.slice().sort((a, b) => b.sum - a.sum)[0];
      say(`${nm} scored ${me.last.toFixed(1)} for ${K.rounds[r].toLowerCase()}. ${lead.me ? `It leads with ${me.sum.toFixed(1)} points.` : `${lead.name} leads with ${lead.sum.toFixed(1)}, and ${nm} has ${me.sum.toFixed(1)}.`}`);
      banner(`${nm}: ${me.last.toFixed(1)}`, good ? '#ffd23f' : '#fff'); await rwait(1800); banner('');
    }
    const order = all.slice().sort((a, b) => b.sum - a.sum), place = order.indexOf(me) + 1;
    const purse = place === 1 ? T[2] : place === 2 ? Math.round(T[2] / 2) : place === 3 ? Math.round(T[2] / 4) : 0;
    banner(place === 1 ? 'First place!' : `Place ${place} of 5`, place === 1 ? '#ffd23f' : '#fff');
    if (place === 1) { s.pose = 'happy'; spark(s.x, headY() - 6, 'sparkle', 12); await hop(16, 420); } else s.pose = place <= 3 ? 'happy' : 'sad';
    await rwait(1500); banner('');
    PLAYER.bits += purse; if (place === 1) { addItem(T[3]); story().contests++; }
    s.stress -= 15; s.fatigue += 8; s.spoil += place === 1 ? 2 : 0; clampAll(); drawUI();
    const lines = [`${nm} finished ${['first', 'second', 'third', 'fourth', 'fifth'][place - 1]} in the ${T[0]} ${K.name} with ${me.sum.toFixed(1)} points. ${order[0].me ? `Second was ${order[1].name} with ${order[1].sum.toFixed(1)}.` : `${order[0].name} won with ${order[0].sum.toFixed(1)}.`}`];
    if (purse) lines.push(`It brings home ${purse.toLocaleString()} bits${place === 1 ? ` and ${/^[AEIOU]/.test(T[3]) ? 'an' : 'a'} ${T[3]}` : ''}.`);
    const wonNow = place === 1 && CONTEST_WINS[story().contests]; if (wonNow) { addItem(wonNow); lines.push(`That's ${story().contests} contest win${story().contests > 1 ? 's' : ''}, and the judges sent ${/^[AEIOU]/.test(wonNow) ? 'an' : 'a'} ${wonNow} to wear.`); }
    lines.push('It lost 15 stress and gained 8 fatigue.');
    if (smoothRanch()) { await sceneFade(true, 800); backHome(); s.dayHour = 21; s.x = 2 * RW - 14; s.camJump = true; await sceneFade(false, 700);   // home at night, then off to bed
      await walkTo(300, 60, 'walk'); await toBed(place === 1 ? 'happy' : 'idle'); }
    else await dayFade('night', backHome);
    await endWeek(1, lines.join(' '));
  });
}
