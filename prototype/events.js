/* Letters and visitors between weeks, the way MR2 fills its calendar: about one week in four after the first month,
   something small happens at the ranch. Some just happen, and some ask what to do. The same one doesn't come back
   within eight weeks. The people are the breeders the cups already name (BREEDERS in venue.js) and the town's own.
   Needs ranch.js, game.js and venue.js. */
const EVENT_LIST = [
  { id: 'basket', when: () => true,
    run: (s, R) => { const who = pickOf(R, ['Auntie Mae', 'Old Pim', 'Lani Reyes']), it = pickOf(R, ['Honey cake', 'Berry', 'Candy', 'Energy nut']);
      addItem(it); return { text: `${who} dropped off a basket for ${nameOf(s)}. There was ${aOr(it)} ${it} in it.` }; } },
  { id: 'kid', when: () => true,
    run: (s, R) => ({ text: `A kid from town is at the gate asking to meet ${nameOf(s)}.`, choices: [
      { label: 'Let them play', small: 'Out in the yard for the afternoon', go: () => { s.stress -= 8; s.spoil += 3; s.fatigue += 4; clampAll(); return `They played tag until dinner. ${nameOf(s)} looks happy and a bit tired.`; } },
      { label: 'Not today', small: 'Send them home', go: () => 'The kid waved and said they\'d come back another day.' }] }) },
  { id: 'friendly', when: s => s.level >= 4,
    run: (s, R) => { const who = pickOf(R, BREEDERS.filter(b => b !== 'Ines')); return { text: `${who} came by with a Snabit and wants a friendly match with ${nameOf(s)}.`, choices: [
      { label: 'Fight', small: 'A friendly, nothing at stake', go: () => new Promise(done => { const o = gradedOpponent(s.grade, Math.max(1, s.level + Math.floor(R() * 3) - 1), R);
        arenaFight({ s, foe: o, mode: 'control', title: 'Friendly', learn: true, onEnd: r => { const pay = r.winner === 0 ? 40 + 10 * s.level : 0; PLAYER.bits += pay; s.fatigue += 5; clampAll();
          done(r.winner === 0 ? `${nameOf(s)} won, and ${who} paid ${pay} bits for the lesson.` : r.winner === 1 ? `${who}'s Snabit won. They shook hands and said to come by for a rematch.` : 'It was a draw, and both of them wanted another go.'); } }); }) },
      { label: 'Maybe later', small: 'Turn it down', go: () => `${who} said the offer stands.` }] }; } },
  { id: 'stray', when: () => true,
    run: (s, R) => { const fam = pickOf(R, ['Skit', 'Squib', 'Moko', 'Chomp']); return { text: `A wild ${fam} got into the yard and won't leave ${nameOf(s)} alone.`, choices: [
      { label: 'Let it stay the night', small: 'It eats a little', go: () => { s.stress -= 10; PLAYER.bits = Math.max(0, PLAYER.bits - 20); clampAll(); return `The ${fam} curled up next to ${nameOf(s)} in the barn and was gone by morning. It ate 20 bits' worth of feed.`; } },
      { label: 'Shoo it off', small: 'Back to the hills', go: () => { s.stress += 2; clampAll(); return `The ${fam} ran off. ${nameOf(s)} watched the gate for a while.`; } }] }; } },
  { id: 'logs', when: s => s.level >= 6,
    run: (s, R) => { const who = pickOf(R, ['Coach Rosa', 'Mister Okon', 'Tomas']), pay = 150 + 25 * s.level; return { text: `${who} needs a strong Snabit to haul logs for a day and will pay ${pay} bits.`, choices: [
      { label: 'Send it', small: `${pay} bits, and a tiring day`, go: () => { PLAYER.bits += pay; s.fatigue += 15; s.tp[1] += 2; clampAll(); return `${nameOf(s)} hauled logs all day and came home sore. ${who} paid ${pay} bits.`; } },
      { label: 'It needs its rest', small: 'Turn it down', go: () => `${who} found someone else.` }] }; } },
  { id: 'paper', when: s => (s.cups || []).length > 0,
    run: (s, R) => ({ text: `The town paper wants a photo of ${nameOf(s)} for a story on the ${(s.cups[s.cups.length - 1] || '').replace(/ \([A-SF]\)$/, '')}.`, choices: [
      { label: 'Pose for it', small: 'It loves the attention', go: () => { s.spoil += 5; PLAYER.bits += 60; clampAll(); return `${nameOf(s)} hammed it up for the camera. The paper paid 60 bits.`; } },
      { label: 'No photos', small: 'Keep it humble', go: () => { s.fear += 2; clampAll(); return 'The reporter left with a quote from Josie instead.'; } }] }) },
  { id: 'cart', when: () => PLAYER.bits >= 600,
    run: (s, R) => { const it = pickOf(R, ['Stat seed', 'Element stone', 'Lucky bit']), cost = 600; return { text: `Nora's cart came up the road with ${aOr(it)} ${it} she's selling for ${cost} bits, a lot less than the shop asks.`, choices: [
      { label: 'Buy it', small: `${cost} bits`, go: () => { PLAYER.bits -= cost; addItem(it); return `It's in the bag. Nora says she won't be up this way again for a while.`; } },
      { label: 'Not this time', small: 'Keep the bits', go: () => 'Nora shrugged and headed back to town.' }] }; } },
  { id: 'fan', when: s => s.wins >= 5,
    run: (s, R) => { s.stress -= 5; clampAll(); return { text: `A letter came for ${nameOf(s)} from a kid who watched it fight. There's a crayon drawing of it inside.` }; } },
  { id: 'storm', when: () => true,
    run: (s, R) => ({ text: `A storm blew the barn door open last night and ${nameOf(s)} is shaking in the hay.`, choices: [
      { label: 'Sit with it', small: 'Stay until it calms down', go: () => { s.fear -= 3; s.spoil += 4; s.stress -= 6; clampAll(); return `You stayed in the barn until the rain stopped. ${nameOf(s)} fell asleep against you.`; } },
      { label: 'Fix the door first', small: 'It\'ll be fine', go: () => { s.stress += 4; s.fear += 3; clampAll(); return `You fixed the door, but ${nameOf(s)} took a while to come out of the hay.`; } }] }) },
];
/* Walt notices a Snabit that has outgrown the ranch (Gid, 17 Nov 2026): once its stats would clear most obstacles on the
   expeditions it can reach, and some region could teach it a move, he comes by once and points it at a skill trip. */
function waltTripReady(s) {
  if (!s || s.waltTrip || typeof exRegions !== 'function' || typeof tripOptions !== 'function' || typeof tripsLocked === 'function' && tripsLocked()) return null;
  const regs = exRegions().filter(r => !r.rift); if (!regs.length) return null;
  const f = playerFighter(s), keys = ['pow', 'grd', 'mnd', 'spr', 'spd'];
  const clears = regs.filter(r => { const need = exNeed(exGrade(r)) * 1.1; return keys.filter(k => f.base[k] >= need).length >= 4; }).length;
  if (clears < Math.ceil(regs.length * 0.6)) return null;
  const trips = TRIP_REGIONS().filter((r, i) => r.n !== 'The Rift' && i < tripRegionCount());
  const ready = trips.filter(r => tripOptions(s, r).some(x => x.chainOk && x.score >= x.need));
  return ready.length ? ready : null;
}
const WALT_TRIP = { id: 'walttrip', when: s => !!waltTripReady(s),
  run: (s, R) => { const ready = waltTripReady(s), reg = pickOf(R, ready); s.waltTrip = PLAYER.week;
    return { text: `Walt stopped at the fence and watched ${nameOf(s)} train for a while. "That one's outgrown the trails round here. Snabits I take out on a trip come home knowing moves they'd never pick up on a ranch."`, choices: [
      { label: 'Where would you take it?', small: 'Ask Walt', go: () => `"${reg.n}. Four weeks out there and ${nameOf(s)} would come back with something new. You know where to find me."` },
      { label: 'Not yet', small: 'It stays home for now', go: () => `"Suit yourself. The offer stands."` }] }; } };
const pickOf = (R, a) => a[Math.floor(R() * a.length)];
const aOr = w => /^[AEIOU]/.test(w) ? 'an' : 'a';
const nameOf = s => s.m.name;

/* after a week ends: maybe one of these, with its own panel */
function weekEvent(s) {
  if (!s || s.dead || s.away || !PLAYER || PLAYER.week < 4 || s.noEvents) return null;
  const R = rng(hashStr(s.id + '|ev|' + PLAYER.week));
  if (WALT_TRIP.when(s)) return WALT_TRIP.run(s, R);   // Walt's visit doesn't wait for the usual one week in four
  if (R() > 0.25) return null;
  const seen = PLAYER.evSeen = PLAYER.evSeen || {};
  const ok = EVENT_LIST.filter(e => e.when(s) && !(seen[e.id] > PLAYER.week - 8)); if (!ok.length) return null;
  const e = pickOf(R, ok); seen[e.id] = PLAYER.week; return e.run(s, R);
}
function showWeekEvent(ev) {
  return new Promise(done => {
    if (!ev.choices) { say(ev.text); done(); return; }
    panel(`<div class="full lab-info ev-card">${ev.text}</div>` + ev.choices.map((c, i) => `<button class="rb" data-c="${i}">${c.label}<small>${c.small}</small></button>`).join(''));
    el('r-panel').querySelectorAll('[data-c]').forEach(b => b.onclick = async () => { panel(''); const line = await ev.choices[+b.dataset.c].go(); if (RS) { say(line); drawUI(); saveGame(); } done(); });
  });
}
