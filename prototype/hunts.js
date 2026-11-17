/* Camera hunts: reasons to go out and point the Snaboscope at the world.
   A photo of a screen can show any colour, so nothing here hatches a Snabit (Gid, 17 Nov 2026). A hunt scan summons a wild
   Snabit to fight, and the reward is for winning it.
   - Today's colour: one of the 12 colours each real day, every colour once in 12 days. A wild fight from a scan whose main
     colour is today's pays half as much again.
   - The notice board in town: people post a wild Snabit they want found, up to three at a time and one new one a week. Taking
     one makes every wild scan a hunt for it. The poster's first clue says where they saw it. A scan that fits its colours
     brings it out; a scan that doesn't brings out some other wild Snabit, and after that fight the poster says how close the
     colours were and remembers more. After a second miss, Dr. Ines (or Benji, if the doctor posted it) works out the clearest
     clue. A scan that's close but not right can still bring the Snabit out, and the odds grow with every miss.
   - The colour atlas in the Bestiary: a 12 by 12 grid of main colour against second colour. The first wild or hunt scan that
     fits a square keeps a tiny crop of the photo there. The crops stay on the phone, in their own storage key next to the save.
     Every 12 squares filled pays out.
   Needs index.html (COL, still, aim), game.js, wild.js and npcs.js (npcBox). */

const HUNT_G = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'pink', 'brown', 'white', 'silver', 'black'];
const HUNT_WORD = { red: 'red', orange: 'orange', yellow: 'yellow', green: 'green', cyan: 'teal', blue: 'blue', violet: 'purple', pink: 'pink', brown: 'brown', white: 'white', silver: 'grey', black: 'black' };

/* ---------- today's colour ---------- */
// the real day's colour: each block of 12 days deals out all 12 colours in a shuffled order
function todayColour(d = new Date()) {
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5), R = rng(hashStr('today|' + Math.floor(day / 12))), L = HUNT_G.slice();
  for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
  return L[day % 12];
}
const isToday = res => !!(res && res.main && res.main.g === todayColour());
// the chip on the Snaboscope's top bar
function huntChip() {
  const top = document.getElementById('top'); if (!top) return;
  let c = document.getElementById('today'); const g = todayColour();
  if (!c) { c = document.createElement('span'); c.id = 'today'; c.className = 'chip'; const m = document.getElementById('main'); m && m.nextSibling ? top.insertBefore(c, m.nextSibling) : top.appendChild(c); }
  c.innerHTML = `<i style="display:inline-block;width:.8em;height:.8em;border-radius:50%;vertical-align:-1px;margin-right:4px;background:${COL[g]};border:1px solid rgba(0,0,0,.25)"></i>Today: ${HUNT_WORD[g]}`;
}

/* ---------- what people say. Every line waits on Gid's OK ---------- */
// where the poster saw it: a place in the Snabit's main colour
const HUNT_PLACE = { red: 'in the apple crates', orange: 'in the pumpkin patch', yellow: 'in the sunflowers', green: 'in the hedges', cyan: 'by the duck pond',
  blue: 'in the bluebells', violet: 'in the lavender', pink: 'in the blossom trees', brown: 'in the woodpile', white: 'in the washing on the line',
  silver: 'on the old stone wall', black: 'in the coal shed' };
// an everyday thing in each colour, for the clearest clue
const HUNT_THING = { red: 'an apple', orange: 'a carrot', yellow: 'a banana', green: 'a leaf', cyan: 'a teal towel', blue: 'a blue bucket',
  violet: 'a bunch of grapes', pink: 'a pink eraser', brown: 'a cardboard box', white: 'a sheet of paper', silver: 'a spoon', black: 'a black umbrella' };
// the first clue, on the board
const HUNT_ASK = {
  shop: "A Snabit keeps sneaking into my stockroom. I only ever catch it {place}. Can you track it down?",
  mc: "I want a wild Snabit for the next show. The one I saw was hiding {place}.",
  guide: "There's a wild Snabit on my walking route. I keep spotting it {place}.",
  aide: "I saw a Snabit nobody's written up yet. It was {place}, and it ran when I got close.",
  doc: "Benji says he saw a Snabit {place}. I'd like it found before it moves on." };
// what the poster says after a fight with the wrong Snabit, by how close the scan's colours were
const HUNT_CLOSE = { hot: "That wasn't it but you're close.", warm: "Not that one, though its colours weren't far off.", cold: 'That one looked nothing like it.' };
// the second clue, from the poster
const HUNT_MORE = { pair: 'It had some {b} on it too, now I think about it.', mono: 'It was one colour all over, now I think about it.' };
// the clearest clue, from Dr. Ines or Benji
const HUNT_BEST = { doc: 'I found the Snabit {who} saw in my notes.', aide: 'Dr. Ines found the Snabit {who} saw in her notes.',
  pair: 'It hides in {a} things with a bit of {b}, like {A} with {B} beside it.', mono: 'It only hides in things that are {a} all over, like {A}.' };

/* ---------- the board ---------- */
const HUNT_FAMS = ['Squib', 'Booly', 'Moko', 'Skit', 'Stilt', 'Antik', 'Pinch', 'Chomp'];
function huntState() {
  const H = PLAYER.hunts = PLAYER.hunts || { open: [], done: 0, nextWeek: 0, seq: 0, atlas: {}, paid: 0 };
  // a save from before hunts: requests for colours become hunts, the rest are taken down
  if (H.open.some(q => !q.fam)) H.open = H.open.filter(q => q.kind === 'pair' || q.kind === 'mono').map(q => q.fam ? q : huntDress(q, rng(hashStr('hunt|old|' + q.id))));
  return H;
}
const huntWho = q => NPC[q.who].name;
const huntFill = (t, q) => t.replace(/\{place\}/g, HUNT_PLACE[q.a]).replace(/\{a\}/g, HUNT_WORD[q.a]).replace(/\{b\}/g, HUNT_WORD[q.b] || '')
  .replace(/\{A\}/g, HUNT_THING[q.a]).replace(/\{B\}/g, HUNT_THING[q.b] || '').replace(/\{who\}/g, huntWho(q));
// the family it is and the first clue
function huntDress(q, R) {
  const D = typeof dex === 'function' ? dex() : {}, seen = Object.keys(D).map(k => k.split('|')[0]).filter(f => typeof famOpen !== 'function' || famOpen(f));
  const L = [...new Set([...HUNT_FAMS, ...seen])]; q.fam = L[Math.floor(R() * L.length)];
  q.clues = [[q.who, huntFill(HUNT_ASK[q.who], q)]]; q.misses = 0; return q;
}
function huntMake(R) {
  const H = huntState(), who = ['shop', 'mc', 'guide', 'aide', 'doc'][Math.floor(R() * 5)];
  if (H.open.some(o => o.who === who)) return null;   // one hunt per person at a time
  const kind = R() < 0.7 ? 'pair' : 'mono', q = { id: ++H.seq, kind, who, week: PLAYER.week, a: HUNT_G[Math.floor(R() * 12)] };
  if (kind === 'pair') do q.b = HUNT_G[Math.floor(R() * 12)]; while (q.b === q.a);
  const g = typeof rankIdx === 'function' ? rankIdx() : 0;
  q.bits = Math.round((kind === 'pair' ? 260 : 220) * (1 + g * 0.5) / 10) * 10;
  q.item = ['Berry', 'Honey cake', 'Energy nut', 'Cool leaf', 'Fish', 'Stat seed', 'Lucky bit'][Math.floor(R() * 7)];
  return huntDress(q, R);
}
// fills the board up to three, with at most one new hunt a week
function huntRefresh() {
  if (!PLAYER) return; const H = huntState();
  if (!H.open.length && !H.done && H.nextWeek === 0) { const R = rng(hashStr('hunt|start')); for (let k = 0; k < 6 && H.open.length < 2; k++) { const q = huntMake(R); if (q) H.open.push(q); } H.nextWeek = PLAYER.week + 1; return; }
  if (H.open.length < 3 && PLAYER.week >= H.nextWeek) { const R = rng(hashStr('hunt|' + PLAYER.week + '|' + H.seq)); for (let k = 0; k < 6; k++) { const q = huntMake(R); if (q) { H.open.push(q); break; } } H.nextWeek = PLAYER.week + 1; }
}
// the hunt every wild scan is for right now, if any
function huntActive() { if (!PLAYER || !PLAYER.hunts) return null; const H = huntState(); return H.open.find(q => q.id === H.active) || null; }

/* ---------- how close a scan is ---------- */
const HUNT_WHEEL = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'pink'], HUNT_GREY = ['white', 'silver', 'black'];
function huntNear(a, b) {
  if (a === b) return false; const i = HUNT_WHEEL.indexOf(a), j = HUNT_WHEEL.indexOf(b);
  if (i >= 0 && j >= 0) return Math.min((i - j + 8) % 8, (j - i + 8) % 8) === 1;
  const p = HUNT_GREY.indexOf(a), q = HUNT_GREY.indexOf(b); if (p >= 0 && q >= 0) return Math.abs(p - q) === 1;
  return (a === 'brown' && ['red', 'orange'].includes(b)) || (b === 'brown' && ['red', 'orange'].includes(a));
}
// fit, hot, warm or cold
function huntClose(q, res) {
  const m = res.main.g, s = res.second ? res.second.g : null;
  if (m === q.a && (q.kind === 'mono' ? res.mono : s === q.b)) return 'fit';
  if (m === q.a || (q.kind === 'pair' && m === q.b && s === q.a)) return 'hot';
  if (huntNear(m, q.a) || (q.kind === 'pair' && s === q.b)) return 'warm';
  return 'cold';
}
// the chance the hunted Snabit comes out of this scan: a fit always does, a close one more often after each miss
const huntOdds = (c, misses) => c === 'fit' ? 1 : c === 'hot' ? Math.min(0.85, 0.3 + 0.2 * misses) : c === 'warm' ? Math.min(0.4, 0.1 * misses) : 0;

/* ---------- the hunted Snabit ---------- */
const huntRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
// built from the hunt's own colours and family, a little stronger than a wild one
function huntFoe(q, res, s, R) {
  const col = (g, from) => from && from.g === g ? from : { ...(from || res.main), g, rgb: huntRgb(COL[g]) };
  const r2 = { ...res, main: col(q.a, res.main), second: q.b ? col(q.b, res.second || res.ranked[1]) : null, mono: !q.b, photoKey: 'hunt|' + q.id };
  const o = wildFrom(r2, s, R, { family: q.fam, strong: true }); o.hunt = q.id; return o;
}
// called by wildCard: the hunted Snabit or some other wild one
function huntPick(res, s, R) {
  const q = huntActive(); if (!q || !WILD) return null;
  const c = huntClose(q, res); WILD.close = c; WILD.hunt = q.id;
  return R() < huntOdds(c, q.misses) ? huntFoe(q, res, s, R) : null;
}
// called when a hunt fight ends. Returns lines for the result, and [who, line] for what someone says after
function huntAfter(o, won) {
  const q = huntActive(); if (!q || !WILD || WILD.hunt !== q.id) return { lines: [] };
  const H = huntState();
  if (o.hunt === q.id) {
    if (!won) return { lines: [`${huntWho(q)}'s Snabit got away. It's still out there.`] };
    H.open = H.open.filter(x => x !== q); H.done++; H.active = null; PLAYER.bits += q.bits; addItem(q.item);
    return { lines: [`That was the Snabit ${huntWho(q)} was after. +${q.bits.toLocaleString()} bits and ${/^[AEIOU]/.test(q.item) ? 'an' : 'a'} ${q.item}.`] };
  }
  q.misses++; const c = WILD.close || 'cold';
  if (q.misses === 2) {   // the clearest clue, from someone who looked it up
    const who = q.who === 'doc' ? 'aide' : 'doc', t = huntFill(HUNT_BEST[who] + ' ' + HUNT_BEST[q.kind], q); q.clues.push([who, t]); return { lines: [], after: [who, t] }; }
  let t = HUNT_CLOSE[c];
  if (q.misses === 1) { const more = huntFill(HUNT_MORE[q.kind], q); q.clues.push([q.who, more]); t += ' ' + more; }
  return { lines: [], after: [q.who, t] };
}

/* ---------- the colour atlas ---------- */
const ATLAS_KEY = () => (typeof SAVE_KEY !== 'undefined' ? SAVE_KEY : 'snabits') + '.atlas';
function atlasThumbs() { try { return JSON.parse(localStorage.getItem(ATLAS_KEY()) || '{}'); } catch (e) { return {}; } }
const atlasKey = res => res.main.g + '|' + (res.second ? res.second.g : res.main.g);
// a 28 pixel crop of the scan round the aiming ring, as a small JPEG
function atlasCrop() { try { const S = 28, c = document.createElement('canvas'); c.width = c.height = S; const w = still.width, h = still.height, k = Math.min(w, h) * 0.35;
  c.getContext('2d').drawImage(still, w * aim.x - k / 2, h * aim.y - k / 2, k, k, 0, 0, S, S); return c.toDataURL('image/jpeg', 0.6); } catch (e) { return null; } }

/* ---------- every wild or hunt scan comes through here ---------- */
// returns lines for the scan's card
function huntScan(res) {
  if (!PLAYER || !res || !res.main) return [];
  huntRefresh(); const H = huntState(), out = [];
  if (isToday(res)) out.push(`Today's colour is ${HUNT_WORD[res.main.g]}.`);
  const k = atlasKey(res);
  if (!H.atlas[k]) { H.atlas[k] = PLAYER.week + 1; const T = atlasThumbs(), img = atlasCrop(); if (img) { T[k] = img; try { localStorage.setItem(ATLAS_KEY(), JSON.stringify(T)); } catch (e) {} }
    const n = Object.keys(H.atlas).length, nm = res.second ? `${HUNT_WORD[res.main.g]} with ${HUNT_WORD[res.second.g]}` : `all ${HUNT_WORD[res.main.g]}`;
    out.push(`New in the colour atlas: ${nm}. That's ${n} of 144.`);
    while (Math.floor(n / 12) > H.paid) { H.paid++; const bits = 500 * H.paid, item = H.paid % 3 ? 'Lucky bit' : 'Life fruit'; PLAYER.bits += bits; addItem(item); out.push(`${H.paid * 12} squares filled. +${bits.toLocaleString()} bits and a ${item}.`); } }
  if (typeof saveGame === 'function') saveGame();
  return out;
}
// adds lines to the top of the scan's card
function huntNote(card, lines) { if (!card || !lines || !lines.length) return; const b = card.querySelector('.sheet-body') || card;
  const p = document.createElement('p'); p.className = 'abil hunt-note'; p.innerHTML = lines.map(l => `<b class="hid">${l}</b>`).join('<br>'); b.insertBefore(p, b.firstChild); }
// the Snaboscope's message while hunting: the latest clue
function huntScopeText() { const q = huntActive(); if (!q) return null; const [who, t] = q.clues[q.clues.length - 1]; return { title: `Hunt: ${huntWho(q)}'s Snabit`, text: `${NPC[who].name}: "${t}"` }; }

/* ---------- the notice board screen, in town ---------- */
function openNotice() {
  huntRefresh(); const H = huntState(), g = todayColour();
  npcPanel(`<div class="full lab-head"><b>Notice board</b><button class="small" id="nb-back">Back</button></div>
    <div class="full lab-info">Today's colour is <b style="color:${g === 'white' ? '#999' : COL[g]}">${HUNT_WORD[g]}</b>. ${H.done ? `You've found ${H.done} Snabit${H.done === 1 ? '' : 's'} for people in town.` : ''}</div>` +
    (H.open.length ? H.open.map(q => q.clues.map(([who, t]) => npcBox(who, t)).join('') +
      `<button class="rb full nb-go ${H.active === q.id ? 'on' : ''}" data-q="${q.id}">${H.active === q.id ? 'Hunting it' : 'Hunt it'}<small>${H.active === q.id ? 'Tap to stop' : `${q.bits.toLocaleString()} bits and ${/^[AEIOU]/.test(q.item) ? 'an' : 'a'} ${q.item}`}</small></button>`).join('')
      : `<div class="full lab-info">Nothing on the board this week.</div>`));
  el('nb-back').onclick = openTown;
  el('r-panel').querySelectorAll('.nb-go').forEach(b => b.onclick = () => { const id = +b.dataset.q;
    if (H.active === id) { H.active = null; saveGame(); openNotice(); return; }
    H.active = id; saveGame(); startWild(); if (!WILD) openNotice(); });
}

/* ---------- the atlas screen, a tab in the Bestiary ---------- */
function atlasTab() { const n = PLAYER && PLAYER.hunts ? Object.keys(PLAYER.hunts.atlas).length : 0;
  return `<button class="small ${typeof DEX_FAM !== 'undefined' && DEX_FAM === 'Atlas' ? 'on' : ''}" data-f="Atlas">Atlas<i>${n}/144</i></button>`; }
function atlasHtml() {
  const H = huntState(), T = atlasThumbs(), n = Object.keys(H.atlas).length;
  const head = `<div class="atl-c" style="background:none"></div>` + HUNT_G.map(b => `<div class="atl-c atl-h" style="background:${COL[b]}" title="${HUNT_WORD[b]}"></div>`).join('');
  const rows = HUNT_G.map(a => `<div class="atl-c atl-h" style="background:${COL[a]}" title="${HUNT_WORD[a]}"></div>` + HUNT_G.map(b => { const k = a + '|' + b, got = H.atlas[k];
    return `<div class="atl-c ${got ? 'atl-got' : ''}" title="${a === b ? 'all ' + HUNT_WORD[a] : HUNT_WORD[a] + ' with ' + HUNT_WORD[b]}" style="${got && T[k] ? `background-image:url(${T[k]})` : got ? `background:${COL[a]}` : ''}"></div>`; }).join('')).join('');
  return `<div class="full lab-info">Down the side is the main colour of a wild scan and across the top its second colour. A square on the line from corner to corner is a scan of one colour alone. ${n} of 144 found and every 12 pays.</div>
    <div class="full atl-grid">${head}${rows}</div>`;
}
(function atlasStyle() { const s = document.createElement('style'); s.textContent = `.atl-grid{display:grid;grid-template-columns:repeat(13,1fr);gap:2px;width:100%;max-width:420px;margin:4px auto 8px}
  .atl-c{aspect-ratio:1;border-radius:3px;background:rgba(0,0,0,.07);background-size:cover;background-position:center}
  .atl-h{border-radius:50%;transform:scale(.6);border:1px solid rgba(0,0,0,.2)} .atl-got{box-shadow:0 0 0 1px rgba(0,0,0,.25)}`; document.head.appendChild(s); })();
