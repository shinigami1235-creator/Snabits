/* The horror series in play (docs/HORROR-PLAN.md, OKed by Gid on 16 Nov 2026).
   Each horror has a myth in three parts, kept in the Journal's Myths tab. The first part comes from a tear on a deep map
   (Yog's from the Tower, Cthulhu's from a nightmare week), the second from the ranch or town, and the third at the door of
   its lair in the Deep Rift. With all three found, the lair opens and the horror waits inside at Mega. The first win sends a
   little one home at Bit, while the ranch has no other horror. The Deep Rift is three team expeditions past the Rift's edge:
   the Outer Ring at grade A, the Middle Ring at S and the Heart after the Legend Cup.
   Needs explore.js, deep.js, monster.js (HORROR_EGG) and ranch.js. */

const HORROR_RING = [['Ghoul', 'Nightgaunt', 'Migo', 'Dagon', 'Shub'], ['Gug', 'Shoggoth', 'Hastur'], ['Yog', 'Cthulhu']];
const RIFT_RING = ['the Outer Ring', 'the Middle Ring', 'the Heart'];
// where each lair sits on its ring's map: column:row
const RIFT_LAIR = [{ '3:0': 'Ghoul', '5:2': 'Nightgaunt', '7:0': 'Migo', '7:2': 'Dagon', '10:1': 'Shub' }, { '5:0': 'Gug', '7:2': 'Shoggoth', '10:1': 'Hastur' }, { '7:1': 'Yog', '10:1': 'Cthulhu' }];
const HORROR_REGION = { 'Hollow Moor': 'Ghoul', 'Dream Garden': 'Nightgaunt', 'Granite Steps': 'Migo', 'Coral Shallows': 'Dagon', 'Tanglewood': 'Shub', 'Cinder Peak': 'Gug', 'Iron Foundry': 'Shoggoth', 'Static Plains': 'Hastur' };
const HORROR_NAME = { Migo: 'Mi-Go', Shub: 'Shub-Niggurath', Yog: 'Yog-Sothoth' };
const horrorName = f => HORROR_NAME[f] || f;
const HORROR_LAIR = { Ghoul: 'the Burrows', Nightgaunt: 'the Night Cliffs', Migo: 'the Humming Mine', Dagon: 'the Drowned Steps', Shub: 'the Thousand Grove',
  Gug: 'the Sealed Gate', Shoggoth: 'the Empty Workshop', Hastur: 'the Yellow Stage', Yog: 'the Gate', Cthulhu: 'the Sunken City' };
// the myths: a title and three parts each. Every line is waiting on Gid's OK
const MYTH = {
  Ghoul: ['The Diggers', [
    "People at Hollow Moor leave a bone on a grave so the diggers leave the rest alone. The diggers keep to their tunnels under the moor and only come up for what's left out for them.",
    "A bone turned up on the barn step one morning with a thank-you scratched into it. Some of the diggers used to be people who stayed underground too long, and they still thank anyone who feeds them.",
    "The door of the Burrows says the diggers keep their tunnels all the way down to a door far bigger than this one, so nothing on the other side can come up."]],
  Nightgaunt: ['The Ones Who Tickle', [
    "Children who wander Dream Garden at night get carried off by something with no face and dropped home at dawn, giggling and unable to say why.",
    "One of the ranch's Snabits giggled for a whole week and couldn't say why either. The Nightgaunts can't talk, so tickling is the only way they have to tell anyone something.",
    "Painted on the rock at the Night Cliffs is a row of faceless figures carrying children home. One of them is carrying a Snabit."]],
  Migo: ['The Pink Lights', [
    "Hikers on Granite Steps see pink lights over the peaks. A Snabit that wanders up there comes back knowing a move nobody taught it.",
    "Someone left a jar of something pink on the step of Dr. Ines's lab, with a note asking for her notes in return.",
    "Shelves of jars line the way into the Humming Mine, each one labelled in writing nobody can read. The Mi-Go keep everything they learn, and they're always looking for something new to learn."]],
  Dagon: ["The Fisherman's Friend", [
    "The fishing boats off Coral Shallows always come home full, and the old fishers won't say who they thank for it.",
    "An old fisher at the Harvest Fair hummed a song nobody else knew. When it's sung at the water, the Deep One under the steps comes up to listen, and the nets come home full.",
    "Carved on the Drowned Steps under the waterline is a fishing boat with a singer at the bow and a big webbed hand under the hull holding it up."]],
  Shub: ['The Goat with a Thousand Kids', [
    "Goats in Tanglewood wander off and come back with more kids than any goat could have, and the trees there grow in rings.",
    "A stray kid with black hooves turned up at the ranch in spring, ate half the hay and walked home on its own the next morning.",
    "The way into the Thousand Grove is a ring of trees, and each one has a kid's name and a birthday carved in it. All of them are hers."]],
  Gug: ['The Giants Below', [
    "Under Cinder Peak is a door so big it reads as a cliff, and something on the other side knocks on it every hundred years.",
    "Something knocked on the barn floor from underneath during the heatwave, three times and then nothing.",
    "The ancient people shut the Gugs below the world, and the Ghouls keep the tunnels to the door so the Gugs can't come up. Carved on the Sealed Gate is a count of the knocks, and the last one is this year."]],
  Shoggoth: ['The Servant That Forgot', [
    "The ancient people made a helper out of living goo that could take any shape their work needed. When they left, it stayed.",
    "A mess in the Workshop cleaned itself up overnight. Nobody on the ranch did it, and the floor was covered in round prints like eyes.",
    "The tools in the Empty Workshop still hang where the ancient people left them. It has so many eyes since it still copies whatever shape it saw last."]],
  Hastur: ['The King in Yellow', [
    "There's a play nobody has read to the end, since everyone who tries falls asleep at the third act.",
    "Nora found a ticket in the Town Hall's lost and found, for a seat that doesn't exist. Hastur buys a seat in a yellow cloak at every performance of the play and never stays to the end.",
    "The Yellow Stage is set for the third act. The programme on the seat lists the whole cast, from the first player down to Hastur, the King in Yellow."]],
  Yog: ['The Gate', [
    "There's a door on the Tower's sixtieth floor that wasn't there the week before. Every door has the same thing on the other side if you open it the right way.",
    "Dr. Ines found the same globe drawn faintly in the corner of every page of the bestiary. Nobody at the lab drew it.",
    "The Rift is the biggest door it knows about, and the Gate at its heart is where it waits. Yog-Sothoth is what's on the other side of every door."]],
  Cthulhu: ['The Sleeper', [
    "Every Snabit on the ranch had the same nightmare this week, about a city under the sea past the Rift with something asleep in it.",
    "The nightmare came back louder. Every special called through Helena's lens makes the dream louder, and that's the signal Dr. Ines has been measuring.",
    "The doors of the Sunken City are open. Whatever's asleep in there dreams loud enough for every Snabit to hear."]]
};
function myth(f) { const M = PLAYER.myths = PLAYER.myths || {}; return M[f] = M[f] || [0, 0, 0]; }
// finds part k of a myth; true if it was new
function mythFind(f, k) { const P = myth(f); if (P[k]) return false; P[k] = PLAYER.week + 1; return true; }
const mythDone = f => myth(f).every(Boolean);
function lairState(f) { const L = PLAYER.lairs = PLAYER.lairs || {}; return L[f] = L[f] || { season: -1, won: 0 }; }

/* ---------- the horror as a foe: trained to its stage at the grade's top level ---------- */
function horrorFoe(fam, stage, g, R) {
  const G = GRADE_INFO[g], level = G.lv[1] + (stage === 'Mega' ? 4 : 0), m = randomOpponent(R, fam), evo = EVO_TOTAL[fam] || [150, 320];
  const total = Math.round(Math.max(G.earned[1], stage === 'Mega' ? evo[1] : evo[0]) * 1.1), focus = Math.floor(R() * 6), tp = [0, 0, 0, 0, 0, 0];
  for (let k = 0; k < total; k++) tp[R() < 0.5 ? focus : Math.floor(R() * 6)]++;
  const st = { m, tp, stage, mark: focus, mark2: (focus + 3) % 6, level }; st.grid = stageGrid(st);
  const fm = fightMon(st), open = m.pool.filter(n => SKILLS[n].lv <= level), lo = aiLoadout(m, level, R);
  while (lo.length < slotsFor(st) && open.some(n => !lo.includes(n))) lo.push(open.find(n => !lo.includes(n)));
  for (const n of (typeof sigSkills === 'function' ? sigSkills({ m, level }) : [])) if (SKILLS[n] && !lo.includes(n)) { if (lo.length < slotsFor(st)) lo.push(n); else lo[lo.length - 1] = n; }
  return { m, fm, level, skills: lo.filter(Boolean), stage, mark: focus, earned: total, horror: fam, boss: horrorName(fam) };
}

/* ---------- the Deep Rift ---------- */
// the rings open to a team now: the Outer Ring at grade A once the Rift's edge has been crossed, the Middle Ring at S, the Heart after the Legend Cup
function riftRings() {
  if (!PLAYER || rankIdx() < 4 || !exState({ n: 'The Rift' }).got.includes('6:1')) return [];
  const out = [0]; if (rankIdx() >= 5) out.push(1); if (typeof story === 'function' && story().legendWon) out.push(2);
  return out.map(i => ({ n: `The Rift, ${RIFT_RING[i]}`, el: 'Void', rift: true, ring: i }));
}
const riftGrade = reg => ['A', 'S', 'S'][reg.ring];
// called from deepMap for a ring: the last lair takes the guardian's place at the bottom, and the others go on the lower floors,
// the ones from the first half of the old map on the middle floor
function riftLairs(reg, M) {
  const E = Object.entries(RIFT_LAIR[reg.ring]).sort((a, b) => +a[0].split(':')[0] - +b[0].split(':')[0]), R = rng(hashStr('lair|' + M.seed));
  E.forEach(([id, fam], j) => { if (j === E.length - 1) { const F = M.floors[2], i = dgI(F, ...F.down); F.feat[i] = { ...F.feat[i], k: 'lair', fam, id: 'lair:' + fam }; return; }
    M.place('lair', { fam }, [+id.split(':')[0] <= 5 ? 1 : 2], R); });
}

/* ---------- tears on the deep maps ---------- */
// from grade A, about one season in four, a deep map with a horror's myth to start shows a tear on one of its finds
function horrorTear(reg, M) {
  const f = HORROR_REGION[reg.n]; if (!f || rankIdx() < 4 || myth(f)[0]) return;
  const h = hashStr('tear|' + reg.n + '|' + exSeason()); if (h % 4) return;
  M.place('tear', { fam: f }, [1, 2], rng(h));
}

/* one tear or lair circle on a deep map, called from deepNode */
async function horrorNode(reg, n, g, T, leadOf, setLead, K, used, found) {
  const f = n.fam, nm = horrorName(f), s = RS;
  if (n.k === 'tear') {
    if (used.includes(n.id)) { await rwait(200); return; }
    const tp = prop({ k: 'tear', x: 186, y: GROUND }); banner('A tear', '#d9c8ff'); K("There's a tear in the air there. Something's on the other side, and it's looking at us."); await rwait(1800); banner('');
    const foe = horrorFoe(f, 'Byte', GRADES.indexOf(g) < 4 ? 'A' : g, Math.random); foe.boss = null;
    const won = await deepFight(T, leadOf(), foe, 'A tear', K); unprop(tp);
    if (T[leadOf()].down && T.some(m => !m.down)) setLead(T.findIndex(m => !m.down));
    if (!won) { K(`The ${nm} went back through the tear. It's still open.`); await rwait(1600); return 'fail'; }
    used.push(n.id);
    if (mythFind(f, 0)) { found.push('a myth'); banner(MYTH[f][0], '#d9c8ff'); K(`The ${nm} went back through the tear and left something behind. It's the start of a story.`); await rwait(2400); banner(''); }
    else { K(`The ${nm} went back through the tear.`); await rwait(1400); }
    return; }
  // a lair door
  const P = myth(f), L = lairState(f), season = exSeason();
  banner(HORROR_LAIR[f].replace(/^the /, 'The '), '#d9c8ff'); await rwait(1200); banner('');
  if (!P[0] || !P[1]) { K("There's a door here with something carved on it. We don't know enough about what's behind it yet."); await rwait(1800); return; }
  if (!P[2]) { mythFind(f, 2); found.push('a myth'); banner(MYTH[f][0], '#d9c8ff'); K("The carving on this door finishes the story, and the door's opening."); await rwait(2400); banner(''); }
  if (L.season === season) { K("It's quiet in there now. We'll come back next season."); await rwait(1500); return; }
  L.season = season; saveGame();
  const R = rng(hashStr('lair|' + f + '|' + season)), foe = horrorFoe(f, 'Mega', g, R);
  const fp = prop({ k: 'foe', x: 186, y: GROUND, fm: foe.fm }); banner(nm, '#d9c8ff'); K(`That's the ${nm}. Nobody's coming to help us in there.`); await rwait(2000); banner(''); unprop(fp);
  const won = await deepFight(T, leadOf(), foe, nm, K);
  if (!won) { for (const m of T) m.s.stress = Math.min(100, m.s.stress + 15); K(`The ${nm} threw all three of you out. We're going home.`); await rwait(1800); return 'end'; }
  const alive = T.findIndex(m => !m.down); if (alive >= 0 && T[leadOf()].down) setLead(alive);
  const G = GRADE_INFO[g], bounty = Math.round(G.purse * 2); PLAYER.bits += bounty; found.push(`${bounty.toLocaleString()} bits`); drawUI();
  s.pose = 'happy'; K(`The ${nm} went back into the Rift.`); await rwait(1500);
  if (!L.won && !horrorOwned()) {
    const m = randomOpponent(rng(hashStr('little|' + f + '|' + PLAYER.week)), f), e = addToRoster(m);
    if (!e) { K("A little one stayed behind and wanted to come with us, but the Freezer's full."); await rwait(1800); return 'end'; }
    L.won = 1; found.push(`a little ${nm}`); if (typeof dexSee === 'function') dexSee(m);
    banner(`A little ${nm}`, '#d9c8ff'); K(`A little one stayed behind, and it's following us home. It'll wait in the Freezer.`); await rwait(2400); banner(''); }
  else if (!L.won) { K("A little one stayed behind, but it won't come near the ranch while there's another one like it there."); await rwait(1800); }
  saveGame(); return 'end';
}

/* ---------- the second parts, found in a week on the ranch or in town (called from endWeek) ---------- */
function mythWeek(s, fest) {
  if (!PLAYER) return [];
  const out = [], { mo } = weekParts(PLAYER.week), roll = f => hashStr('myth|' + f + '|' + PLAYER.week) % 3 === 0;
  const add = (f, k, line) => { if (mythFind(f, k)) out.push(`${line} There's a new page in the Myths: ${MYTH[f][0]}.`); };
  const p1 = f => myth(f)[0] && !myth(f)[1];
  if (p1('Ghoul') && roll('Ghoul')) add('Ghoul', 1, 'A bone turned up on the barn step this morning with a thank-you scratched into it.');
  if (p1('Nightgaunt') && roll('Nightgaunt')) add('Nightgaunt', 1, `${displayName(s)} giggled all week and couldn't say why.`);
  if (p1('Migo') && roll('Migo')) add('Migo', 1, "Dr. Ines found a jar of something pink on the lab's step, with a note asking for her notes.");
  if (p1('Dagon') && fest && fest[0] === 'Harvest Fair') add('Dagon', 1, 'An old fisher at the Harvest Fair hummed a song nobody else knew.');
  if (p1('Shub') && mo < 3 && roll('Shub')) add('Shub', 1, 'A stray kid with black hooves turned up and ate half the hay, then walked home on its own.');
  if (p1('Gug') && s.weather === 'A heatwave') add('Gug', 1, 'Something knocked on the barn floor from underneath, three times and then nothing.');
  if (p1('Shoggoth') && roll('Shoggoth')) add('Shoggoth', 1, 'A mess in the Workshop cleaned itself up overnight, and nobody on the ranch did it.');
  if (p1('Hastur') && roll('Hastur')) add('Hastur', 1, "Nora found a theatre ticket in the Town Hall's lost and found, for a seat that doesn't exist.");
  if (p1('Yog') && Object.keys(PLAYER.dex || {}).length >= 150) add('Yog', 1, 'Dr. Ines found the same globe drawn faintly in the corner of every page of the bestiary.');
  const called = Object.keys(PLAYER.dexSecret || {}).filter(k => FAMILY[k] && FAMILY[k].special && !FAMILY[k].horror).length;
  if (called >= 15 && !myth('Cthulhu')[0]) add('Cthulhu', 0, 'Every Snabit on the ranch had the same nightmare this week.');
  else if (called >= 30 && myth('Cthulhu')[0] && !myth('Cthulhu')[1]) add('Cthulhu', 1, 'The nightmare came back this week, louder.');
  return out;
}

/* ---------- the Journal's Myths tab ---------- */
function mythsHtml() {
  const fams = Object.keys(MYTH).filter(f => myth(f).some(Boolean));
  if (!fams.length) return '<div class="full lab-info">No myths yet.</div>';
  return fams.map(f => { let n = 0;
    const body = myth(f).map((v, k) => v ? MYTH[f][1][k] : '???').join('<br><br>'), head = `${horrorName(f)}: ${MYTH[f][0]}`;
    // anywhere his name would be written a third time in one place, it's blank
    const txt = (head + '\u0001' + body).replace(/Hastur/g, w => ++n >= 3 ? '_____' : w).split('\u0001');
    return `<div class="full lab-info"><b>${txt[0]}</b><br>${txt[1]}</div>`; }).join('');
}

/* ---------- leaving ---------- */
// how each one leaves at the end of its lifespan, on the ranch and outside the Freezer
const HORROR_GO = { Cthulhu: 'spread its wings for the first time and flew off over the sea', Hastur: 'walked out of the gate in its yellow cloak and never looked back',
  Shoggoth: 'poured itself down the well and never came back up', Dagon: 'walked down to the river and swam away', Migo: 'flew up towards a pink light over the hills',
  Nightgaunt: 'flew off into the night without a sound', Ghoul: 'dug down under the barn and filled the hole in behind it',
  Gug: 'went down into the ground in the night, and the barn shook once', Yog: 'opened a door in the air and stepped through it',
  Shub: 'walked into the trees, and a ring of mushrooms came up where it last stood' };
// true when the ranch Snabit is a horror that's reached the end of its lifespan this week (called from endWeek)
const horrorDue = (s, weeks) => !!(FAMILY[s.m.family] && FAMILY[s.m.family].horror) && s.used - s.m.lifespan * 4 >= 0 && s.used - s.m.lifespan * 4 < weeks;
async function horrorLeave(s) {
  const f = s.m.family, nm = displayName(s);
  s.hidden = true; drawUI(); say(`Last night ${nm} ${HORROR_GO[f]}.`); await rwait(3200);   // it's already gone when the week opens
  PLAYER.roster = PLAYER.roster.filter(r => r.id !== s.id);
  if (PLAYER.active === s.id) { PLAYER.active = PLAYER.roster.length ? PLAYER.roster[0].id : null; RS = null; }
  const L = stoneList(); if (L && !L.includes(f)) L.push(f);
  saveGame(); panel('');
  if (PLAYER.roster.length) openRanch(); else { closeRanch(); openScope(); }
  if (RS) say(`${nm} left its painted stone by the barn door.`);
}
// a retired horror's statue is gone after 4 weeks, and its stone sits on the empty plinth (called from endWeek)
function horrorHallWeek() {
  const out = [];
  for (const h of (PLAYER.hall || [])) if (!h.gone && FAMILY[h.m.family] && FAMILY[h.m.family].horror && PLAYER.week - h.week >= 4) {
    h.gone = 1; const L = stoneList(); if (L && !L.includes(h.m.family)) L.push(h.m.family);
    out.push(`${h.name.split(',')[0]}'s statue is gone from its plinth, and there's a painted stone where it stood.`); }
  return out;
}

/* ---------- the Secrets tab's Horrors row ---------- */
// [where its lair is, once the myth's started; the clue to its stone, once the stone is on the ranch]. Every line is waiting on Gid's OK
const HORROR_SECRET = {
  Cthulhu: ['Its city lies at the heart of the Rift.', 'Sea green, mud and a yellow moon, after the lamps go out.'],
  Hastur: ["Its stage is in the Rift's Middle Ring.", 'A yellow sign on black over an orange stage, once the last show is over.'],
  Shoggoth: ["Its workshop is in the Rift's Middle Ring.", 'Eyes in the dark round a red mouth, when the whole house is asleep.'],
  Dagon: ["Its steps go down in the Rift's Outer Ring.", 'Foam on teal water over weed, long after the fishers are in bed.'],
  Migo: ["Its mine is in the Rift's Outer Ring.", 'A silver jar under pink lights on brown rock, late, when the hills are dark.'],
  Nightgaunt: ["Its cliffs are in the Rift's Outer Ring.", 'Black wings across a white moon on violet, in the witching hour.'],
  Ghoul: ["Its burrows are in the Rift's Outer Ring.", 'A grey bone in brown earth under a red sky, near midnight.'],
  Gug: ["Its gate is in the Rift's Middle Ring.", 'A band of pink bricks in a brown wall, in the dead of night.'],
  Yog: ['Its gate stands at the heart of the Rift.', 'Teal and pink globes on violet, between the last bell and the first.'],
  Shub: ["Its grove is in the Rift's Outer Ring.", 'A black goat with brown horns on green, when the forest is asleep.'] };
function horrorSecretsHtml(S) {
  return `<div class="full lab-head" style="margin-top:6px"><b>Horrors</b></div><div class="full dex-grid">${Object.keys(HORROR_SECRET).map(f => {
    const b = S[f] || 0, stone = (PLAYER.stones || []).includes(f), hint = stone ? HORROR_SECRET[f][1] : myth(f)[0] ? HORROR_SECRET[f][0] : '???';
    return `<div class="dex-t ${b ? '' : 'unk'}"><canvas data-k="${f}"></canvas><b>${b ? horrorName(f) : '???'}</b><small>${stone ? hint : b ? (b & 14 ? 'Raised' : 'Seen') : hint}</small></div>`; }).join('')}</div>`;
}
