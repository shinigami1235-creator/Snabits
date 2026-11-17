/* The bestiary: every family in every element, 56 families by 12 elements, 672 kinds. A kind counts as seen once one is scanned or fought,
   and raised once one lives on the ranch, with a star for each stage it reached there. Milestones give prizes.
   Needs monster.js, game.js and chibi.js. */
const DEX_FAMS = ['Chomp', 'Squib', 'Antik', 'Moko', 'Pinch', 'Stilt', 'Skit', 'Booly', 'Plod', 'Bipped', 'Fizz', 'Teep', 'Lern', 'Puff', 'Flit', 'Glop', 'Tock', 'Mitt', 'Brolly', 'Spine', 'Burr', 'Wick', 'Lumo', 'Snooze', 'Inky', 'Cobble', 'Nimbo', 'Dango', 'Oaklet', 'Roly', 'Trundle', 'Clank', 'Crease', 'Twiglet', 'Swirl', 'Ditty', 'Sizzle', 'Aero', 'Nesta', 'Magna', 'Helm', 'Bloop', 'Sox', 'Cuppy', 'Suds', 'Scoop', 'Tome', 'Gumball', 'Pina', 'Jingle', 'Presto', 'Vroom', 'Shutter', 'Yoyo', 'Lava', 'Pogo'];
const DEX_ELS = ['Blaze', 'Brawl', 'Spark', 'Wild', 'Frost', 'Tide', 'Venom', 'Charm', 'Stone', 'Light', 'Steel', 'Shade'];
const DEX_STAGE = { Bit: 2, Byte: 4, Mega: 8 };
const DEX_SEEN_PRIZE = [[10, 'bits', 500], [30, 'Element stone'], [60, 'Stat seed'], [95, 'Life seed'], [125, 'Crown'], [156, 'Life fruit'], [200, 'bits', 3000], [252, 'Life fruit'], [312, 'Crown'], [372, 'Life fruit'], [432, 'Crown'], [492, 'Life fruit'], [580, 'Crown'], [672, 'Life fruit']];
const DEX_RAISE_PRIZE = [[3, 'bits', 800], [10, 'Lucky bit'], [20, 'Energy cell'], [36, 'Life fruit'], [60, 'Crown']];
function dex() { if (!PLAYER.dex) PLAYER.dex = {}; return PLAYER.dex; }
const dexKey = m => { const f = m && FAMILY[m.family] && FAMILY[m.family].of ? FAMILY[m.family].of[0] : m && m.family; return f && DEX_FAMS.includes(f) && DEX_ELS.includes(m.el1) ? f + '|' + m.el1 : null; };
/* the secrets: special Snabits and costumes, one tile each, found only through colour easter eggs. Unfound ones show a hint. */
const DEX_SECRETS = [['Eagle', 'Hides in stars and stripes.'], ['Vampire', 'Mostly night, a little moon and a drop of red.'], ['Phoenix', 'Red at the bottom and yellow at the top, like a flame.'],
  ['Kitsune', 'A red sun on white snow.'], ['Naga', 'A green band with gold.'], ['Yeti', 'Snow and silver with a little ice blue.'],
  ['Kraken', 'Deep blue water with a violet curl.'], ['Golem', 'Grey stone with a line of moss.'], ['Unicorn', 'White with pink and lilac at the bottom.'], ['Jack', 'Orange and round, with a little black in the middle.'],
  ['Tengu', 'Red with a pale point and a little green below.'], ['Tanuki', 'Brown with a dark band across the middle.'], ['Mermaid', 'Teal scales under a pink fin.'],
  ['Diwata', 'Pink with green wings either side.'], ['Sphinx', 'Gold with blue stripes over the top.'],
  ['Garuda', 'Gold with red rising in a V.'], ['Werewolf', 'Grey with a pale moon and three dark marks.'], ['Minotaur', 'Brown with a pale ring under two pale horns.'],
  ['Dragon', 'Green with an orange flame at the top.'], ['Thunderbird', 'Blue with a yellow zigzag across it.'],
  ['Hydra', 'Violet with three green necks rising from one root.'], ['Griffin', 'Orange with a white band over the top and a gold beak.'], ['Kirin', 'Teal scales with orange flames along the bottom.'],
  ['Salamander', 'Black with orange spots and one yellow flame.'], ['Bakunawa', 'Blue with a pale moon and a teal serpent under it.'], ['Cerberus', 'Black with a red collar and three white spikes.'],
  ['Djinn', 'Blue with smoke curling out of a gold lamp.'], ['Troll', 'Green with a brown club and two white tusks.'], ['Mummy', 'Grey and white bands with one gold eye.'],
  ['Sarimanok', 'White with a fan of rainbow feathers.'],
  ['c:Panda', 'Half black, half white.'], ['c:Bee', 'Yellow and black in stripes.'], ['c:Ladybug', 'Red with black spots.'],
  ['c:Watermelon', 'Green outside, red inside, a few black seeds.'], ['c:Candy cane', 'Red and white in stripes.'],
  ['c:Tiger', 'Orange with black stripes.'], ['c:Zebra', 'Black and white in stripes.'], ['c:Cow', 'White with black patches.'], ['c:Penguin', 'Black and white with a little orange.'],
  ['c:Strawberry', 'Red with yellow seeds and green on top.'], ['c:Rubber duck', 'Yellow with a little orange.'], ['c:Clownfish', 'Orange with white bands.']];
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
  if (typeof openCos === 'function') { const a = seen >= 30 && openCos('Panda', 'Dr. Ines sent a League pattern card for seeing 30 kinds.'), b = raised >= 10 && openCos('Cow', 'Dr. Ines sent a League pattern card for raising 10 kinds.'); if (a) lines.push(a); if (b) lines.push(b); }
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
  if (DEX_FAM === 'Atlas') return openAtlas(n);
  panel(`<div class="full lab-head"><b>Bestiary</b><button class="small" id="dx-back">Back</button></div>
    <div class="full lab-info">${n.seen} of ${n.total} seen and ${n.raised} raised. ${n.next || "It's complete."}${typeof roamDexLine === 'function' ? roamDexLine() : ''}${typeof famOpen === 'function' && !famOpen(DEX_FAM) ? ` The Snaboscope can't find ${DEX_FAM} yet.` : ''}</div>
    <div class="full dex-tabs">${DEX_FAMS.map(f => { const k = DEX_ELS.filter(e => D[f + '|' + e]).length; return `<button class="small ${f === DEX_FAM ? 'on' : ''}" data-f="${f}">${f}<i>${k}/12</i></button>`; }).join('')}${dexSecretTab()}${typeof atlasTab === 'function' ? atlasTab() : ''}</div>
    <div class="full dex-grid">${DEX_ELS.map(e => { const b = D[DEX_FAM + '|' + e] || 0;
      return `<div class="dex-t ${b ? '' : 'unk'}"><canvas data-e="${e}"></canvas><b>${b ? speciesName(DEX_FAM, e) : '???'}</b><small>${b ? (b & 14 ? ['Bit', 'Byte', 'Mega'].filter(st => b & DEX_STAGE[st]).map(() => '★').join('') : 'Seen') : e}</small></div>`; }).join('')}</div>`);
  el('dx-back').onclick = () => menu('Out');
  el('r-panel').querySelectorAll('[data-f]').forEach(b => b.onclick = () => openDex(b.dataset.f));
  el('r-panel').querySelectorAll('canvas[data-e]').forEach(cv => dexTile(cv, DEX_FAM, cv.dataset.e, D[DEX_FAM + '|' + cv.dataset.e] || 0));
}

const SECRET_PAL = { Eagle: [[46, 84, 170], [150, 40, 48], [255, 214, 90]], Vampire: [[236, 228, 240], [52, 40, 62], [200, 40, 60]], Phoenix: [[240, 96, 48], [200, 52, 40], [255, 226, 122]],
  Kitsune: [[240, 140, 62], [150, 70, 40], [214, 58, 58]], Naga: [[96, 170, 92], [54, 110, 60], [246, 206, 60]], Yeti: [[236, 240, 246], [170, 186, 204], [120, 210, 240]],
  Kraken: [[70, 100, 190], [40, 50, 110], [160, 100, 210]], Golem: [[160, 160, 164], [96, 92, 88], [110, 170, 80]], Unicorn: [[248, 246, 250], [246, 176, 206], [200, 166, 236]], Jack: [[240, 138, 44], [150, 70, 24], [96, 150, 60]],
  Tengu: [[226, 74, 62], [244, 236, 220], [90, 170, 80]], Tanuki: [[150, 100, 56], [44, 36, 34], [96, 170, 70]], Mermaid: [[100, 214, 210], [240, 122, 176], [246, 240, 230]],
  Diwata: [[240, 122, 180], [80, 160, 70], [246, 206, 70]], Sphinx: [[242, 206, 64], [48, 104, 210], [214, 64, 52]],
  Garuda: [[242, 206, 64], [214, 64, 52], [60, 110, 210]], Werewolf: [[170, 174, 182], [40, 36, 42], [246, 242, 232]], Minotaur: [[150, 100, 56], [190, 194, 200], [246, 240, 226]],
  Dragon: [[80, 170, 76], [240, 140, 50], [246, 206, 70]], Thunderbird: [[54, 110, 214], [246, 210, 60], [246, 246, 246]],
  Hydra: [[140, 80, 200], [90, 170, 80], [246, 206, 70]], Griffin: [[240, 140, 50], [246, 246, 246], [246, 206, 70]], Kirin: [[80, 200, 210], [240, 140, 50], [246, 246, 246]],
  Salamander: [[40, 36, 42], [240, 140, 50], [246, 206, 70]], Bakunawa: [[54, 110, 214], [90, 210, 220], [246, 246, 246]], Cerberus: [[40, 36, 42], [214, 64, 52], [190, 194, 200]],
  Djinn: [[54, 110, 214], [246, 206, 70], [246, 246, 246]], Troll: [[80, 170, 76], [150, 100, 56], [246, 246, 246]], Mummy: [[246, 242, 232], [190, 194, 200], [246, 206, 70]],
  Sarimanok: [[246, 246, 246], [214, 64, 52], [246, 206, 70]],
  Cthulhu: [[80, 160, 90], [132, 96, 60], [242, 200, 50]], Hastur: [[242, 206, 64], [40, 36, 42], [240, 140, 50]], Shoggoth: [[40, 36, 42], [246, 246, 246], [214, 64, 52]],
  Dagon: [[90, 200, 200], [80, 160, 90], [246, 246, 246]], Migo: [[240, 130, 180], [190, 194, 200], [132, 96, 60]], Nightgaunt: [[40, 36, 42], [140, 80, 200], [246, 246, 246]],
  Ghoul: [[190, 194, 200], [132, 96, 60], [214, 64, 52]], Gug: [[240, 130, 180], [132, 96, 60], [246, 246, 246]], Yog: [[140, 80, 200], [90, 200, 200], [240, 130, 180]],
  Shub: [[40, 36, 42], [132, 96, 60], [80, 160, 90]] };
function dexSecretTab() { const S = (PLAYER && PLAYER.dexSecret) || {}, k = DEX_SECRETS.filter(([n]) => S[n]).length;
  return `<button class="small ${DEX_FAM === 'Secrets' ? 'on' : ''}" data-f="Secrets">Secrets<i>${k}/${DEX_SECRETS.length}</i></button>`; }
// the colour atlas tab (hunts.js)
function openAtlas(n) {
  const D = dex();
  panel(`<div class="full lab-head"><b>Bestiary</b><button class="small" id="dx-back">Back</button></div>
    <div class="full dex-tabs">${DEX_FAMS.map(f => { const k = DEX_ELS.filter(e => D[f + '|' + e]).length; return `<button class="small" data-f="${f}">${f}<i>${k}/12</i></button>`; }).join('')}${dexSecretTab()}${atlasTab()}</div>` + atlasHtml());
  el('dx-back').onclick = () => menu('Out');
  el('r-panel').querySelectorAll('[data-f]').forEach(b => b.onclick = () => openDex(b.dataset.f));
}
function openSecrets(n) {
  const D = dex(), S = PLAYER.dexSecret = PLAYER.dexSecret || {};
  panel(`<div class="full lab-head"><b>Bestiary</b><button class="small" id="dx-back">Back</button></div>
    <div class="full lab-info">Secrets turn up when a photo has just the right colours. Each hint says what to look for.</div>
    <div class="full dex-tabs">${DEX_FAMS.map(f => { const k = DEX_ELS.filter(e => D[f + '|' + e]).length; return `<button class="small" data-f="${f}">${f}<i>${k}/12</i></button>`; }).join('')}${dexSecretTab()}${typeof atlasTab === 'function' ? atlasTab() : ''}</div>
    <div class="full dex-grid">${DEX_SECRETS.map(([k, hint]) => { const b = S[k] || 0, nm = k.startsWith('c:') ? k.slice(2) + ' costume' : k;
      const shut = k.startsWith('c:') ? typeof cosOpen === 'function' && !cosOpen(k.slice(2)) : typeof stoneOpen === 'function' && !stoneOpen(k);   // a costume not opened yet keeps its hint hidden too
      return `<div class="dex-t ${b ? '' : 'unk'}"><canvas data-k="${k}"></canvas><b>${b ? nm : '???'}</b><small>${b ? (b & 14 ? 'Raised' : 'Seen') : shut ? '???' : hint}</small></div>`; }).join('')}</div>` +
    (typeof horrorSecretsHtml === 'function' && rankIdx() >= 4 ? horrorSecretsHtml(S) : ''));   // the horrors from grade A (horror.js)
  el('dx-back').onclick = () => menu('Out');
  el('r-panel').querySelectorAll('[data-f]').forEach(b => b.onclick = () => openDex(b.dataset.f));
  el('r-panel').querySelectorAll('canvas[data-k]').forEach(cv => { const k = cv.dataset.k, b = S[k] || 0, d = devicePixelRatio || 1, Z = (cv.clientWidth || 64) * d; cv.width = Z; cv.height = Z;
    const c = cv.getContext('2d'); if (typeof CHIBI === 'undefined') return; const fam = k.startsWith('c:') ? 'Chomp' : k, sp = dexSpec(fam, k.startsWith('c:') ? 'Brawl' : 'Light', 'Byte');
    if (k.startsWith('c:')) sp.costume = k.slice(2); else if (SECRET_PAL[k]) sp.pal = { body: SECRET_PAL[k][0], parts: SECRET_PAL[k][1], accent: SECRET_PAL[k][2] }; const u = Z * 0.8 / CHIBI.height('Byte', [], fam); c.save(); c.translate(Z / 2, Z * 0.92); c.scale(u, u); c.translate(-100, -188);
    if (!b) c.filter = 'brightness(0) opacity(.28)'; CHIBI.draw(c, sp, 'idle', 0); c.restore(); });
}
