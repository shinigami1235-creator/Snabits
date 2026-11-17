/* What a team takes on a deep expedition and what it brings back (Gid, 17 Nov 2026: stock up before a trip, a good way to use
   money; relics and rare things that make an expedition worth it).
   - Rations: a night at camp feeds every Snabit one ration. One that goes hungry gets back half its energy and little HP, so a
     team of three needs three times what one Snabit does.
   - The pack: the rest comes out of the bag, as many things as the team's Power added up allows. Whatever isn't used comes back.
   - Nora sells rations, trail mix, bandages, lanterns and rope.
   - Relics: old things found in hidden rooms. Nora buys them.
   - Treasures: rare things found deep down that do what nothing in the shop does. Timeworn amber gives back a month of a
     Snabit's prime, up to three times. A star shard adds 5 to every stat. Mender's moss heals an injury and takes all fatigue
     and stress off. A pathfinder's compass, packed for a trip, lets the team see one room further on every floor.
   - When a team has to run, a League team goes back for what it left. Two or three weeks later Walt brings some of it home.
   Needs deep.js, town.js, game.js and lab.js. */

const DEEP_PACK = ['Trail mix', 'Energy nut', 'Bandage', 'Medicine', 'Lantern', 'Rope', "Pathfinder's compass"];
const RELICS = ['Old League badge', 'Fossil shell', 'Carved stone mask', 'Silver compass', 'Faded map', 'Ancient coin', 'Cracked crystal egg'];
const RELIC_PRICE = { 'Old League badge': 1600, 'Fossil shell': 1200, 'Carved stone mask': 2400, 'Silver compass': 3000, 'Faded map': 1400, 'Ancient coin': 1800, 'Cracked crystal egg': 4000 };
const TREASURES = ['Timeworn amber', 'Star shard', "Mender's moss", "Pathfinder's compass"];
const TREASURE_PRICE = { 'Timeworn amber': 6000, 'Star shard': 5000, "Mender's moss": 3000, "Pathfinder's compass": 4000 };
(function deepGoods() {
  if (typeof MARKET !== 'undefined') Object.assign(MARKET, { 'Ration': 30, 'Trail mix': 60, 'Bandage': 90, 'Lantern': 150, 'Rope': 120 });
  if (typeof DESC !== 'undefined') Object.assign(DESC, { 'Ration': "A day's food for one Snabit on an expedition.", 'Trail mix': 'Nuts and dried fruit for a long day out exploring.',
    'Bandage': 'Wraps up a scrape on an expedition.', 'Lantern': 'Lights the way further ahead on an expedition.', 'Rope': 'Strong rope for climbing out of a pit on an expedition.',
    'Old League badge': 'A League badge from long before the League was called that.', 'Fossil shell': 'A shell turned to stone, from a sea that dried up long ago.',
    'Carved stone mask': 'A stone face with a Snabit carved on its forehead.', 'Silver compass': "It doesn't point north. It points somewhere.",
    'Faded map': 'A map of a place nobody has found yet.', 'Ancient coin': 'A coin with a Snabit on one side and nothing on the other.', 'Cracked crystal egg': 'Something was in this once.',
    'Timeworn amber': 'Amber with a tiny leaf in it. They say it slows the years down.', 'Star shard': 'A shard that fell from the night sky, still warm.',
    "Mender's moss": 'Soft moss that grows where nobody walks. It mends anything.', "Pathfinder's compass": 'An old League compass that points at doors you haven\'t found yet.' });
  if (typeof ITEMS !== 'undefined') { for (const k of RELICS) ITEMS[k] = { rarity: 4, price: RELIC_PRICE[k] * 2, desc: `Nora pays ${RELIC_PRICE[k].toLocaleString()} bits for this relic` };   // priceOf halves it when selling
    Object.assign(ITEMS, { 'Timeworn amber': { rarity: 4, price: 12000, desc: '+1 month of prime, up to 3 times per monster' }, 'Star shard': { rarity: 4, price: 10000, desc: '+5 to every stat' },
      "Mender's moss": { rarity: 4, price: 6000, desc: 'Heals an injury and takes all fatigue and stress off' }, "Pathfinder's compass": { rarity: 4, price: 8000, desc: 'Packed for a deep expedition: sees one room further on every floor' } }); }
})();
// using a treasure from the bag on the ranch Snabit
(function deepTreasureUse() {
  if (typeof useItem !== 'function') return; const base = useItem;
  window.useItem = useItem = function (k) {
    const s = RS, bag = PLAYER.bag;
    if (k === 'Timeworn amber') { if ((s.amber || 0) >= 3) { say("It's had three already. Another won't do anything."); return; } s.amber = (s.amber || 0) + 1; s.used = Math.max(0, (s.used || 0) - 4); say('It held the amber for a long time. That gave back a month of its prime.'); }
    else if (k === 'Star shard') { s.tp = s.tp.map(v => v + 5 * EARN_DIV); say('The shard went dim, and every stat went up by 5.'); }
    else if (k === "Mender's moss") { if (!s.injured && s.fatigue < 10 && s.stress < 10) { say("It's in good shape, so the moss would be wasted."); return; } s.injured = false; s.fatigue = 0; s.stress = 0; say("The moss did its work. It's good as new."); }
    else if (k === "Pathfinder's compass") { say('The compass is for packing on a deep expedition.'); return; }
    else return base(k);
    bag[k]--; if (bag[k] <= 0) delete bag[k]; clampAll(); drawUI(); saveGame(); openItems();
  };
})();
// a treasure, now and then: from hidden rooms, the last floor's chests, a stone chest, and a guardian beaten for the first time
function deepTreasure(R) { return TREASURES[Math.floor(R() * TREASURES.length)]; }

// how many things the team can carry: 3 for a weak team, up to 9
function deepSlots(team, need) { const pow = team.reduce((a, s) => a + playerFighter(s).base.pow, 0); return clamp(Math.round(pow / Math.max(1, need)) + 1, 2, 9); }

/* the pack screen, between picking the team and setting off */
function openDeepPack(reg, team, pack = {}) {
  const g = reg.ring != null ? riftGrade(reg) : DEEP_GRADE[exGrade(reg)], slots = deepSlots(team, exNeed(g)), n = Object.entries(pack).filter(([k]) => k !== 'Ration').reduce((a, [, v]) => a + v, 0), bag = PLAYER.bag;
  const nights = DEEP_NIGHTS, need = team.length * nights, food = pack.Ration || 0, inBag = k => (bag[k] || 0) - (pack[k] || 0);
  panel(`<div class="full lab-head"><b>The pack</b><button class="small" id="pk-back">Back</button></div>
    <div class="full lab-info">${team.length === 1 ? `${displayName(team[0])} goes alone and can carry ${slots} things.` : `${team.map(s => displayName(s)).join(', ')} can carry ${slots} things between them.`} ${n} packed. A night at camp needs ${team.length === 1 ? 'one ration' : `${team.length} rations, one each`}.</div>` +
    `<button class="rb full pk-row" data-k="Ration" ${inBag('Ration') <= 0 ? 'disabled' : ''}>Rations · ${food} packed<small>${food >= need ? `Enough for all ${nights} nights.` : `${need} for all ${nights} nights.`} ${inBag('Ration') > 0 ? `${inBag('Ration')} in the bag` : 'None in the bag. Nora sells them'}</small></button>` +
    DEEP_PACK.map(k => { const have = inBag(k);
      return `<button class="rb pk-row" data-k="${k}" ${have <= 0 || n >= slots ? 'disabled' : ''}>${k}${pack[k] ? ` · ${pack[k]} packed` : ''}<small>${itemDesc(k)} ${have > 0 ? `${have} in the bag` : 'None in the bag'}</small></button>`; }).join('') +
    (n || food ? `<button class="rb full" id="pk-clear">Take everything out</button>` : '') +
    `<button class="big full" id="pk-go">Set off</button>`);
  el('pk-back').onclick = () => openDeepPick(reg);
  el('r-panel').querySelectorAll('.pk-row').forEach(b => b.onclick = () => { const k = b.dataset.k; pack[k] = (pack[k] || 0) + (k === 'Ration' ? Math.min(team.length, inBag(k)) : 1); openDeepPack(reg, team, pack); });
  if (el('pk-clear')) el('pk-clear').onclick = () => openDeepPack(reg, team, {});
  el('pk-go').onclick = () => { for (const k in pack) { bag[k] -= pack[k]; if (bag[k] <= 0) delete bag[k]; } saveGame(); runDeep(reg, team, pack); };
}

/* ---------- after a trip that went wrong ---------- */
// called by runDeep when the team ran: what it left behind waits for a League team to fetch it
function deepLeftBehind(reg, items, bits) { PLAYER.deepLost = PLAYER.deepLost || []; PLAYER.deepLost.push({ week: PLAYER.week + 2 + Math.floor(Math.random() * 2), where: reg.ring != null ? reg.n.replace('The Rift, ', 'the Rift\'s ') : 'deep ' + reg.n, items, bits }); }
// called from endWeek: Walt brings back about half of it, two or three weeks later
function deepWeek() {
  const L = PLAYER.deepLost; if (!L || !L.length) return []; const out = [];
  for (const x of L.filter(x => PLAYER.week >= x.week)) {
    const items = x.items.filter((k, i) => i % 2 === 0), bits = Math.round(x.bits / 2 / 10) * 10; items.forEach(k => addItem(k)); PLAYER.bits += bits;
    const list = deepCount(items.map(k => `${/^[AEIOU]/.test(k) ? 'an' : 'a'} ${k}`)).concat(bits ? [`${bits.toLocaleString()} bits`] : []);
    out.push(`Walt came by. A League team went back into ${x.where} and found some of what your team left behind${list.length ? `: ${list.join(', ').replace(/, ([^,]*)$/, ' and $1')}` : ', but nothing worth bringing home'}.`); }
  PLAYER.deepLost = L.filter(x => PLAYER.week < x.week); return out;
}

// "a Berry, a Berry, an Element stone" reads as "2 Berries and an Element stone"
const DEEP_NUM = ['', '', 'two', 'three', 'four', 'five', 'six'];
function deepCount(list) { const n = new Map(); for (const x of list) n.set(x, (n.get(x) || 0) + 1);
  return [...n].map(([x, k]) => { if (k === 1) return x; const w = x.replace(/^an? /, ''), pl = /(s|sh|ch)$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's';
    return `${DEEP_NUM[k] || k} ${pl}`; }); }
