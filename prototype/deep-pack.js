/* What a team takes on a deep expedition and what it brings back (Gid, 17 Nov 2026: stock up on items before a trip, a good
   way to use money; relics to take home).
   - The pack: before setting off, the team takes things from the bag. How many it can carry comes from the three Snabits'
     Power added up, against what the grade's Snabits have. Whatever isn't used comes back to the bag.
   - Nora sells the expedition things: trail mix and energy nuts for energy, bandages and medicine for HP, a lantern to see
     further on one floor, and rope for climbing out of a pit.
   - Relics: old things found in hidden rooms. Nora buys them, or they stay in the bag.
   Needs deep.js, town.js and game.js. */

const DEEP_PACK = ['Trail mix', 'Energy nut', 'Bandage', 'Medicine', 'Lantern', 'Rope'];
const RELICS = ['Old League badge', 'Fossil shell', 'Carved stone mask', 'Silver compass', 'Faded map', 'Ancient coin', 'Cracked crystal egg'];
const RELIC_PRICE = { 'Old League badge': 1600, 'Fossil shell': 1200, 'Carved stone mask': 2400, 'Silver compass': 3000, 'Faded map': 1400, 'Ancient coin': 1800, 'Cracked crystal egg': 4000 };
(function deepGoods() {
  if (typeof MARKET !== 'undefined') Object.assign(MARKET, { 'Trail mix': 60, 'Bandage': 90, 'Lantern': 150, 'Rope': 120 });
  if (typeof DESC !== 'undefined') Object.assign(DESC, { 'Trail mix': 'Nuts and dried fruit for a long day out exploring.', 'Bandage': 'Wraps up a scrape on an expedition.',
    'Lantern': 'Lights the way further ahead on an expedition.', 'Rope': 'Strong rope for climbing out of a pit on an expedition.',
    'Old League badge': 'A League badge from long before the League was called that.', 'Fossil shell': 'A shell turned to stone, from a sea that dried up long ago.',
    'Carved stone mask': 'A stone face with a Snabit carved on its forehead.', 'Silver compass': "It doesn't point north. It points somewhere.",
    'Faded map': 'A map of a place nobody has found yet.', 'Ancient coin': 'A coin with a Snabit on one side and nothing on the other.', 'Cracked crystal egg': 'Something was in this once.' });
  if (typeof ITEMS !== 'undefined') for (const k of RELICS) ITEMS[k] = { rarity: 4, price: RELIC_PRICE[k] * 2, desc: `Nora pays ${RELIC_PRICE[k].toLocaleString()} bits for this relic` };   // priceOf halves it when selling
})();

// how many things the team can carry: 3 for a weak team, up to 9
function deepSlots(team, need) { const pow = team.reduce((a, s) => a + playerFighter(s).base.pow, 0); return clamp(Math.round(pow / Math.max(1, need)) + 1, 3, 9); }

/* the pack screen, between picking the team and setting off */
function openDeepPack(reg, team, pack = {}) {
  const g = reg.ring != null ? riftGrade(reg) : DEEP_GRADE[exGrade(reg)], slots = deepSlots(team, exNeed(g)), n = Object.values(pack).reduce((a, b) => a + b, 0), bag = PLAYER.bag;
  panel(`<div class="full lab-head"><b>The pack</b><button class="small" id="pk-back">Back</button></div>
    <div class="full lab-info">${team.map(s => displayName(s)).join(', ')} can carry ${slots} things between them. ${n} packed.</div>` +
    DEEP_PACK.map(k => { const have = (bag[k] || 0) - (pack[k] || 0);
      return `<button class="rb pk-row" data-k="${k}" ${have <= 0 || n >= slots ? 'disabled' : ''}>${k}${pack[k] ? ` · ${pack[k]} packed` : ''}<small>${itemDesc(k)} ${have > 0 ? `${have} in the bag` : 'None in the bag. Nora sells them'}</small></button>`; }).join('') +
    (n ? `<button class="rb full" id="pk-clear">Take everything out</button>` : '') +
    `<button class="big full" id="pk-go">Set off</button>`);
  el('pk-back').onclick = () => openDeepPick(reg);
  el('r-panel').querySelectorAll('.pk-row').forEach(b => b.onclick = () => { const k = b.dataset.k; pack[k] = (pack[k] || 0) + 1; openDeepPack(reg, team, pack); });
  if (el('pk-clear')) el('pk-clear').onclick = () => openDeepPack(reg, team, {});
  el('pk-go').onclick = () => { for (const k in pack) { bag[k] -= pack[k]; if (bag[k] <= 0) delete bag[k]; } saveGame(); runDeep(reg, team, pack); };
}
