/* Camera hunts: reasons to go out and point the Snaboscope at the world.
   - Today's colour: one of the 12 colours each real day, every colour once in 12 days. A Snabit hatched from a scan whose main
     colour is today's comes out a little stronger, and a wild fight from one pays half as much again.
   - The notice board in town: up to three scan requests at a time from the people in town, one new one a week. Any scan that
     fits one finishes it, and the reward goes straight to the ranch.
   - The colour atlas in the Bestiary: a 12 by 12 grid of main colour against second colour, with the main colour alone on the
     diagonal. The first scan that fits a square keeps a tiny crop of the photo there. The crops stay on the phone, in their own
     storage key next to the save. Every 12 squares filled pays out.
   Needs index.html (COL, still, aim), game.js, monster.js (pickFamily) and npcs.js (npcBox). */

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
// a hatch from today's colour comes out a little stronger
function huntBoost(m, res) { if (m && isToday(res)) { m.stats = m.stats.map(v => v + 3); m.today = true; } return m; }
// the chip on the Snaboscope's top bar
function huntChip() {
  const top = document.getElementById('top'); if (!top) return;
  let c = document.getElementById('today'); const g = todayColour();
  if (!c) { c = document.createElement('span'); c.id = 'today'; c.className = 'chip'; const m = document.getElementById('main'); m && m.nextSibling ? top.insertBefore(c, m.nextSibling) : top.appendChild(c); }
  c.innerHTML = `<i style="display:inline-block;width:.8em;height:.8em;border-radius:50%;vertical-align:-1px;margin-right:4px;background:${COL[g]};border:1px solid rgba(0,0,0,.25)"></i>Today: ${HUNT_WORD[g]}`;
}

/* ---------- the notice board ---------- */
// what each person asks for, in their own words. {a} and {b} are colours, {f} a family. Every line waits on Gid's OK
const HUNT_ASK = {
  pair: [['shop', "I'm repainting the shop sign. Show me something {a} with a bit of {b} in it."], ['mc', "I need a costume idea for the next show. Something {a} with some {b}, please."],
    ['guide', "My old jacket was {a} and {b}. Find me something like it?"]],
  mono: [['guide', "Find me something that's all {a}. Nothing else in it."], ['shop', "A customer wants a gift that's {a} and only {a}. Can you find one?"]],
  many: [['aide', "Find the most colourful thing you can. Six colours or more!"], ['mc', "The festival needs something really colourful. Six colours at least."]],
  fam: [['doc', "I want to see the colours a {f} comes from. Scan something that would hatch one."], ['aide', "Dr. Ines asked me to find colours that make a {f}. Can you help?"]]
};
function huntState() { const H = PLAYER.hunts = PLAYER.hunts || { open: [], done: 0, nextWeek: 0, seq: 0, atlas: {}, paid: 0 }; return H; }
const huntFill = (q) => q.line.replace(/\{a\}/g, HUNT_WORD[q.a] || '').replace(/\{b\}/g, HUNT_WORD[q.b] || '').replace(/\{f\}/g, q.f || '');
// families a request can ask for: ones the player has seen and the scan can make now
function huntFams() { const D = typeof dex === 'function' ? dex() : {}, seen = new Set(Object.keys(D).map(k => k.split('|')[0]));
  return (typeof DEX_FAMS !== 'undefined' ? DEX_FAMS : []).filter(f => seen.has(f) && (typeof famOpen !== 'function' || famOpen(f))); }
function huntMake(R) {
  const H = huntState(), kinds = ['pair', 'pair', 'mono', 'many', 'fam'], fams = huntFams();
  let kind = kinds[Math.floor(R() * kinds.length)]; if (kind === 'fam' && !fams.length) kind = 'pair';
  const L = HUNT_ASK[kind], [who, line] = L[Math.floor(R() * L.length)], q = { id: ++H.seq, kind, who, line, week: PLAYER.week };
  const taken = new Set(H.open.map(o => o.who));   // one request per person at a time
  if (taken.has(who)) return null;
  if (kind === 'pair') { q.a = HUNT_G[Math.floor(R() * 12)]; do q.b = HUNT_G[Math.floor(R() * 12)]; while (q.b === q.a); }
  if (kind === 'mono') q.a = HUNT_G[Math.floor(R() * 12)];
  if (kind === 'fam') q.f = fams[Math.floor(R() * fams.length)];
  const g = typeof rankIdx === 'function' ? rankIdx() : 0;
  q.bits = Math.round((kind === 'fam' ? 350 : kind === 'many' ? 300 : 220) * (1 + g * 0.5) / 10) * 10;
  q.item = kind === 'fam' ? ['Stat seed', 'Lucky bit'][Math.floor(R() * 2)] : ['Berry', 'Honey cake', 'Energy nut', 'Cool leaf', 'Fish'][Math.floor(R() * 5)];
  return q;
}
// fills the board up to three, with at most one new request a week
function huntRefresh() {
  if (!PLAYER) return; const H = huntState();
  if (!H.open.length && !H.done && H.nextWeek === 0) { const R = rng(hashStr('hunt|start')); for (let k = 0; k < 6 && H.open.length < 2; k++) { const q = huntMake(R); if (q) H.open.push(q); } H.nextWeek = PLAYER.week + 1; return; }
  if (H.open.length < 3 && PLAYER.week >= H.nextWeek) { const R = rng(hashStr('hunt|' + PLAYER.week + '|' + H.seq)); for (let k = 0; k < 6; k++) { const q = huntMake(R); if (q) { H.open.push(q); break; } } H.nextWeek = PLAYER.week + 1; }
}
function huntFits(q, res) {
  if (q.kind === 'pair') return res.main.g === q.a && !!res.second && res.second.g === q.b;
  if (q.kind === 'mono') return res.mono && res.main.g === q.a;
  if (q.kind === 'many') return res.colours >= 6;
  if (q.kind === 'fam') return pickFamily(res.cells, res).family === q.f;
  return false;
}

/* ---------- the colour atlas ---------- */
const ATLAS_KEY = () => (typeof SAVE_KEY !== 'undefined' ? SAVE_KEY : 'snabits') + '.atlas';
function atlasThumbs() { try { return JSON.parse(localStorage.getItem(ATLAS_KEY()) || '{}'); } catch (e) { return {}; } }
const atlasKey = res => res.main.g + '|' + (res.second ? res.second.g : res.main.g);
// a 28 pixel crop of the scan round the aiming ring, as a small JPEG
function atlasCrop() { try { const S = 28, c = document.createElement('canvas'); c.width = c.height = S; const w = still.width, h = still.height, k = Math.min(w, h) * 0.35;
  c.getContext('2d').drawImage(still, w * aim.x - k / 2, h * aim.y - k / 2, k, k, 0, 0, S, S); return c.toDataURL('image/jpeg', 0.6); } catch (e) { return null; } }

/* ---------- every scan comes through here ---------- */
// called by the Snaboscope on each full scan. Returns lines for the scan's card
function huntScan(res) {
  if (!PLAYER || !res || !res.main) return [];
  huntRefresh(); const H = huntState(), out = [];
  if (isToday(res)) out.push(`Today's colour is ${HUNT_WORD[res.main.g]}.`);
  // requests
  for (const q of H.open.slice()) if (huntFits(q, res)) {
    H.open = H.open.filter(o => o !== q); H.done++; PLAYER.bits += q.bits; addItem(q.item);
    out.push(`${NPC[q.who].name}'s request is done. +${q.bits.toLocaleString()} bits and a ${q.item}.`); }
  // the atlas
  const k = atlasKey(res);
  if (!H.atlas[k]) { H.atlas[k] = PLAYER.week + 1; const T = atlasThumbs(), img = atlasCrop(); if (img) { T[k] = img; try { localStorage.setItem(ATLAS_KEY(), JSON.stringify(T)); } catch (e) {} }
    const n = Object.keys(H.atlas).length, nm = res.second ? `${HUNT_WORD[res.main.g]} with ${HUNT_WORD[res.second.g]}` : `all ${HUNT_WORD[res.main.g]}`;
    out.push(`New in the colour atlas: ${nm}. That's ${n} of 144.`);
    while (Math.floor(n / 12) > H.paid) { H.paid++; const bits = 500 * H.paid, item = H.paid % 3 ? 'Lucky bit' : 'Life fruit'; PLAYER.bits += bits; addItem(item); out.push(`${H.paid * 12} squares filled. +${bits.toLocaleString()} bits and a ${item}.`); } }
  if (typeof saveGame === 'function') saveGame();
  return out;
}
// adds the hunt lines to the bottom of the scan's card
function huntNote(card, lines) { if (!card || !lines || !lines.length) return; const b = card.querySelector('.sheet-body') || card;
  const p = document.createElement('p'); p.className = 'abil hunt-note'; p.innerHTML = lines.map(l => `<b class="hid">${l}</b>`).join('<br>'); b.insertBefore(p, b.firstChild); }

/* ---------- the notice board screen, in town ---------- */
function openBoard() {
  huntRefresh(); const H = huntState(), g = todayColour();
  npcPanel(`<div class="full lab-head"><b>Notice board</b><button class="small" id="nb-back">Back</button></div>
    <div class="full lab-info">Today's colour is <b style="color:${g === 'white' ? '#999' : COL[g]}">${HUNT_WORD[g]}</b>. ${H.done ? `You've done ${H.done} request${H.done === 1 ? '' : 's'}.` : ''}</div>` +
    (H.open.length ? H.open.map(q => npcBox(q.who, huntFill(q)) + `<div class="full lab-info" style="margin-top:-4px">${q.bits.toLocaleString()} bits and a ${q.item}</div>`).join('')
      : `<div class="full lab-info">Nothing on the board this week.</div>`));
  el('nb-back').onclick = openTown;
}

/* ---------- the atlas screen, a tab in the Bestiary ---------- */
function atlasTab() { const n = PLAYER && PLAYER.hunts ? Object.keys(PLAYER.hunts.atlas).length : 0;
  return `<button class="small ${typeof DEX_FAM !== 'undefined' && DEX_FAM === 'Atlas' ? 'on' : ''}" data-f="Atlas">Atlas<i>${n}/144</i></button>`; }
function atlasHtml() {
  const H = huntState(), T = atlasThumbs(), n = Object.keys(H.atlas).length;
  const head = `<div class="atl-c" style="background:none"></div>` + HUNT_G.map(b => `<div class="atl-c atl-h" style="background:${COL[b]}" title="${HUNT_WORD[b]}"></div>`).join('');
  const rows = HUNT_G.map(a => `<div class="atl-c atl-h" style="background:${COL[a]}" title="${HUNT_WORD[a]}"></div>` + HUNT_G.map(b => { const k = a + '|' + b, got = H.atlas[k];
    return `<div class="atl-c ${got ? 'atl-got' : ''}" title="${a === b ? 'all ' + HUNT_WORD[a] : HUNT_WORD[a] + ' with ' + HUNT_WORD[b]}" style="${got && T[k] ? `background-image:url(${T[k]})` : got ? `background:${COL[a]}` : ''}"></div>`; }).join('')).join('');
  return `<div class="full lab-info">Down the side is the main colour of a scan and across the top its second colour. A square on the line from corner to corner is a scan of one colour alone. ${n} of 144 found, and every 12 pays.</div>
    <div class="full atl-grid">${head}${rows}</div>`;
}
(function atlasStyle() { const s = document.createElement('style'); s.textContent = `.atl-grid{display:grid;grid-template-columns:repeat(13,1fr);gap:2px;width:100%;max-width:420px;margin:4px auto 8px}
  .atl-c{aspect-ratio:1;border-radius:3px;background:rgba(0,0,0,.07);background-size:cover;background-position:center}
  .atl-h{border-radius:50%;transform:scale(.6);border:1px solid rgba(0,0,0,.2)} .atl-got{box-shadow:0 0 0 1px rgba(0,0,0,.25)}`; document.head.appendChild(s); })();
