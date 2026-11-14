/* The bestiary: every family in every element, 13 families by 12 elements, 156 kinds. A kind counts as seen once one is scanned or fought,
   and raised once one lives on the ranch, with a star for each stage it reached there. Milestones give prizes.
   Needs monster.js, game.js and chibi.js. */
const DEX_FAMS = ['Chomp', 'Squib', 'Antik', 'Moko', 'Pinch', 'Stilt', 'Skit', 'Booly', 'Plod', 'Bipped', 'Fizz', 'Teep', 'Lern'];
const DEX_ELS = ['Blaze', 'Brawl', 'Spark', 'Wild', 'Frost', 'Tide', 'Venom', 'Charm', 'Stone', 'Light', 'Steel', 'Shade'];
const DEX_STAGE = { Bit: 2, Byte: 4, Mega: 8 };
const DEX_SEEN_PRIZE = [[10, 'bits', 500], [30, 'Element stone'], [60, 'Stat seed'], [95, 'Life seed'], [125, 'Crown'], [156, 'Life fruit']];
const DEX_RAISE_PRIZE = [[3, 'bits', 800], [10, 'Lucky bit'], [20, 'Energy cell'], [36, 'Life fruit']];
function dex() { if (!PLAYER.dex) PLAYER.dex = {}; return PLAYER.dex; }
const dexKey = m => { const f = m && FAMILY[m.family] && FAMILY[m.family].of ? FAMILY[m.family].of[0] : m && m.family; return f && DEX_FAMS.includes(f) && DEX_ELS.includes(m.el1) ? f + '|' + m.el1 : null; };
/* the secrets: special Snabits and costumes, one tile each, found only through colour easter eggs. Unfound ones show a hint. */
const DEX_SECRETS = [['Eagle', 'Hides in stars and stripes.'], ['Vampire', 'Mostly night, a little moon and a drop of red.'], ['Phoenix', 'Red at the bottom and yellow at the top, like a flame.'],
  ['Kitsune', 'A red sun on white snow.'], ['Naga', 'A green band with gold.'], ['Yeti', 'Snow and silver with a little ice blue.'],
  ['c:Panda', 'Half black, half white.'], ['c:Bee', 'Yellow and black in stripes.'], ['c:Ladybug', 'Red with black spots.'],
  ['c:Watermelon', 'Green outside, red inside, a few black seeds.'], ['c:Candy cane', 'Red and white in stripes.']];
function dexSecret(m, bits) { if (!m || typeof PLAYER === 'undefined' || !PLAYER) return; const S = PLAYER.dexSecret = PLAYER.dexSecret || {};
  const keys = []; if (FAMILY[m.family] && FAMILY[m.family].special) keys.push(m.family); if (m.costume) keys.push('c:' + m.costume);
  for (const k of keys) S[k] = (S[k] || 0) | bits | 1; }
function dexMark(m, bits) {
  dexSecret(m, bits);
  if (typeof PLAYER === 'undefined' || !PLAYER) return; const k = dexKey(m); if (!k) return;
  const D = dex(), was = D[k] || 0; D[k] = was | bits | 1; if (D[k] !== was) dexPrizes();
}
const dexSee = m => dexMark(m, 1);
const dexRaise = (m, stage) => dexMark(m, DEX_STAGE[stage] || 2);
function dexCount() {
  const D = dex(), v = Object.values(D), seen = v.length, raised = v.filter(b => b & 14).length, total = DEX_FAMS.length * DEX_ELS.length;
  const ns = DEX_SEEN_PRIZE.find(p => p[0] > seen), nr = DEX_RAISE_PRIZE.find(p => p[0] > raised);
  const pz = p => p[1] === 'bits' ? `${p[2]} bits` : `${/^[AEIOU]/.test(p[1]) ? 'an' : 'a'} ${p[1]}`;
  return { seen, raised, total, next: ns ? `${ns[0] - seen} more seen gets ${pz(ns)}.` : nr ? `${nr[0] - raised} more raised gets ${pz(nr)}.` : '' };
}
/* prizes are handed out once each, with a line in the speech box */
function dexPrizes() {
  const D = dex(), got = PLAYER.dexGot = PLAYER.dexGot || {}, { seen, raised } = dexCount(), lines = [];
  const give = (key, p, what) => { if (got[key]) return; got[key] = 1; if (p[1] === 'bits') PLAYER.bits += p[2]; else addItem(p[1]);
    lines.push(`${p[0]} kinds ${what} in the bestiary, so Dr. Ines sent ${p[1] === 'bits' ? p[2] + ' bits' : (/^[AEIOU]/.test(p[1]) ? 'an ' : 'a ') + p[1]}.`); };
  for (const p of DEX_SEEN_PRIZE) if (seen >= p[0]) give('s' + p[0], p, 'seen');
  for (const p of DEX_RAISE_PRIZE) if (raised >= p[0]) give('r' + p[0], p, 'raised');
  if (lines.length && typeof RS !== 'undefined' && RS && typeof say === 'function') { PLAYER.dexNote = lines.join(' '); setTimeout(() => { if (PLAYER.dexNote && RS && !RS.busy) { say(PLAYER.dexNote); PLAYER.dexNote = null; } }, 400); }
}
/* everything already on the ranch counts, for saves from before the bestiary */
function dexBackfill() {
  if (!PLAYER || PLAYER.dexFilled) return; PLAYER.dexFilled = true;
  for (const e of (PLAYER.roster || []).concat(PLAYER.archive || [])) { if (!e || !e.m) continue; const st = e.st || {}; dexMark(e.m, DEX_STAGE[st.stage || 'Bit'] | 2); }
}

/* ---------- the page ---------- */
const hexArr = h => { if (h.length === 4) h = '#' + [...h.slice(1)].map(d => d + d).join(''); return [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)); };
const DEX_COL = { Light: '#f2d36b', Shade: '#4a4f6a' };
function dexSpec(fam, el, stage) {
  const b = hexArr(DEX_COL[el] || ELC(el));
  return { family: fam, stage, marks: [], pal: { body: b, parts: b.map(v => Math.round(v * 0.62)), accent: b.map(v => Math.round(v + (255 - v) * 0.55)) }, el, worn: {}, variant: null };
}
function dexTile(cv, fam, el, bits) {
  const d = devicePixelRatio || 1, S = (cv.clientWidth || 64) * d; cv.width = S; cv.height = S; const c = cv.getContext('2d');
  if (typeof CHIBI === 'undefined') return; const stage = bits & 8 ? 'Mega' : bits & 4 ? 'Byte' : 'Bit', sp = dexSpec(fam, el, stage);
  const u = S * 0.8 / CHIBI.height(stage, [], fam); c.save(); c.translate(S / 2, S * 0.92); c.scale(u, u); c.translate(-100, -188);
  if (!bits) { c.filter = 'brightness(0) opacity(.28)'; }
  CHIBI.draw(c, sp, 'idle', 0); c.restore();
}
let DEX_FAM = 'Chomp';
function openDex(fam) {
  dexBackfill(); if (fam) DEX_FAM = fam; const D = dex(), n = dexCount();
  if (DEX_FAM === 'Secrets') return openSecrets(n);
  panel(`<div class="full lab-head"><b>Bestiary</b><button class="small" id="dx-back">Back</button></div>
    <div class="full lab-info">${n.seen} of ${n.total} seen and ${n.raised} raised. ${n.next || "It's complete."}</div>
    <div class="full dex-tabs">${DEX_FAMS.map(f => { const k = DEX_ELS.filter(e => D[f + '|' + e]).length; return `<button class="small ${f === DEX_FAM ? 'on' : ''}" data-f="${f}">${f}<i>${k}/12</i></button>`; }).join('')}${dexSecretTab()}</div>
    <div class="full dex-grid">${DEX_ELS.map(e => { const b = D[DEX_FAM + '|' + e] || 0;
      return `<div class="dex-t ${b ? '' : 'unk'}"><canvas data-e="${e}"></canvas><b>${b ? speciesName(DEX_FAM, e) : '???'}</b><small>${b ? (b & 14 ? ['Bit', 'Byte', 'Mega'].filter(st => b & DEX_STAGE[st]).map(() => '★').join('') : 'Seen') : e}</small></div>`; }).join('')}</div>`);
  el('dx-back').onclick = () => menu('Out');
  el('r-panel').querySelectorAll('[data-f]').forEach(b => b.onclick = () => openDex(b.dataset.f));
  el('r-panel').querySelectorAll('canvas[data-e]').forEach(cv => dexTile(cv, DEX_FAM, cv.dataset.e, D[DEX_FAM + '|' + cv.dataset.e] || 0));
}

const SECRET_PAL = { Eagle: [[46, 84, 170], [150, 40, 48], [255, 214, 90]], Vampire: [[236, 228, 240], [52, 40, 62], [200, 40, 60]], Phoenix: [[240, 96, 48], [200, 52, 40], [255, 226, 122]],
  Kitsune: [[240, 140, 62], [150, 70, 40], [214, 58, 58]], Naga: [[96, 170, 92], [54, 110, 60], [246, 206, 60]], Yeti: [[236, 240, 246], [170, 186, 204], [120, 210, 240]] };
function dexSecretTab() { const S = (PLAYER && PLAYER.dexSecret) || {}, k = DEX_SECRETS.filter(([n]) => S[n]).length;
  return `<button class="small ${DEX_FAM === 'Secrets' ? 'on' : ''}" data-f="Secrets">Secrets<i>${k}/${DEX_SECRETS.length}</i></button>`; }
function openSecrets(n) {
  const D = dex(), S = PLAYER.dexSecret = PLAYER.dexSecret || {};
  panel(`<div class="full lab-head"><b>Bestiary</b><button class="small" id="dx-back">Back</button></div>
    <div class="full lab-info">Secrets turn up when a photo has just the right colours. Each hint says what to look for.</div>
    <div class="full dex-tabs">${DEX_FAMS.map(f => { const k = DEX_ELS.filter(e => D[f + '|' + e]).length; return `<button class="small" data-f="${f}">${f}<i>${k}/12</i></button>`; }).join('')}${dexSecretTab()}</div>
    <div class="full dex-grid">${DEX_SECRETS.map(([k, hint]) => { const b = S[k] || 0, nm = k.startsWith('c:') ? k.slice(2) + ' costume' : k;
      return `<div class="dex-t ${b ? '' : 'unk'}"><canvas data-k="${k}"></canvas><b>${b ? nm : '???'}</b><small>${b ? (b & 14 ? 'Raised' : 'Seen') : hint}</small></div>`; }).join('')}</div>`);
  el('dx-back').onclick = () => menu('Out');
  el('r-panel').querySelectorAll('[data-f]').forEach(b => b.onclick = () => openDex(b.dataset.f));
  el('r-panel').querySelectorAll('canvas[data-k]').forEach(cv => { const k = cv.dataset.k, b = S[k] || 0, d = devicePixelRatio || 1, Z = (cv.clientWidth || 64) * d; cv.width = Z; cv.height = Z;
    const c = cv.getContext('2d'); if (typeof CHIBI === 'undefined') return; const fam = k.startsWith('c:') ? 'Chomp' : k, sp = dexSpec(fam, k.startsWith('c:') ? 'Brawl' : 'Light', 'Byte');
    if (k.startsWith('c:')) sp.costume = k.slice(2); else if (SECRET_PAL[k]) sp.pal = { body: SECRET_PAL[k][0], parts: SECRET_PAL[k][1], accent: SECRET_PAL[k][2] }; const u = Z * 0.8 / CHIBI.height('Byte', [], fam); c.save(); c.translate(Z / 2, Z * 0.92); c.scale(u, u); c.translate(-100, -188);
    if (!b) c.filter = 'brightness(0) opacity(.28)'; CHIBI.draw(c, sp, 'idle', 0); c.restore(); });
}
