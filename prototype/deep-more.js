/* More to find on the team expeditions (Gid, 17 Nov 2026: a deep map was done after one or two clears).
   Each season, every deep map and Rift ring is built anew (deep-gen.js) and three kinds of place turn up on it:
   - a waystone: an old League marker where the team picks one kind of help for the rest of the trip: a rest, the whole map, or
     luck at the next chest
   - a sealed way: the doorway of a dead-end room, blocked by something only a Snabit of one element can clear, with a League
     cache inside. The element changes with the season so a team that can't open it this season might next time
   - Rook's team: three of Rook's Snabits, one after another with his own partner last, for a big purse. About one map in two
     has them, once the player has met Rook. Losing to them sends the team back to the entrance
   Needs deep.js, explore.js, explore-art.js and npcs.js. */

// what blocks a sealed way and how a Snabit of that element clears it. Every line waits on Gid's OK
const DEEP_SEAL = {
  Blaze: ['Thick dry vines cover a door in the rock.', n => `${n} burns the vines away.`],
  Tide: ['There\'s a door with a dry basin in front of it.', n => `${n} fills the basin and the door floats open.`],
  Frost: ['Water pours down over a door in the rock.', n => `${n} freezes the water solid and we can get to the door.`],
  Spark: ['It\'s too dark to find the handle on this door and there\'s an old lamp beside it.', n => `${n} lights the old lamp.`],
  Wild: ['Dead roots have grown over a stone door.', n => `${n} wakes the roots up and they pull the door open.`],
  Stone: ['Rocks are piled up against a door.', n => `${n} shifts the rocks aside.`],
  Brawl: ['A rusted door is jammed shut.', n => `${n} knocks it open.`],
  Steel: ['A heavy iron bar is across the door.', n => `${n} pulls the iron bar off.`],
  Light: ['There\'s a door at the back of a pitch-black hollow.', n => `${n} lights up the hollow.`],
  Shade: ['There\'s a door here that only shows in a shadow.', n => `${n} steps into the shadow and the door opens.`],
  Charm: ['A big Snabit is asleep against the door.', n => `${n} wakes it gently and it moves aside.`],
  Venom: ['A thorn bush has grown over the door.', n => `${n} wilts the thorns.`] };
const DEEP_SEAL_ELS = Object.keys(DEEP_SEAL);

/* called from deepMap: a sealed way on the doorway of a dead-end room with a League cache inside, a waystone and sometimes Rook's
   team. The sealed way goes first so nothing else lands behind it */
function deepExtras(reg, M, R) {
  const el = DEEP_SEAL_ELS[Math.floor(R() * DEEP_SEAL_ELS.length)];
  for (const f of [1, 2, 0]) { const L = M.leaf(f); if (!L) continue; const [x, y, k] = L, F = M.floors[f], i = dgI(F, x, y);
    F.leafUsed.push(k); F.feat[i] = { k: 'seal', el, id: `${f}:seal:${i}`, f, x, y }; F.shut.add(i);
    const c = dgFree(F, k)[0]; if (c) { const j = dgI(F, ...c); F.feat[j] = { k: 'cache', id: `${f}:cache:${j}`, f, x: c[0], y: c[1] }; } break; }
  M.place('shrine', {}, [0, 1], R);
  // the room events: one on each of the first two floors and two on the last, the kinds this region likes coming up more
  const fav = DEEP_EV_FAV[reg.el] || [], kinds = Object.keys(DEEP_EV), pick = () => { const L = kinds.concat(fav, fav); return L[Math.floor(R() * L.length)]; };
  for (const f of [0, 1, 2, 2]) M.place('event', { ev: pick() }, [f], R);
  const rook = R() < 0.5; if (rook && PLAYER && typeof story === 'function' && story().seen.intro != null) M.place('rival', {}, [1, 2], R);   // only once the player has met Rook
}

/* the map icons for the new circles (called from exIcon) */
function deepIcon(x, k, cx, cy, n) {
  if (k === 'shrine') { x.fillStyle = '#9a948a'; x.beginPath(); x.roundRect(cx - 6, cy - 11, 12, 21, [6, 6, 2, 2]); x.fill();   // a standing stone with a ring cut in it
    x.strokeStyle = '#6fd6d0'; x.lineWidth = 1.8; x.beginPath(); x.arc(cx, cy - 2, 3.4, 0, 7); x.stroke(); return true; }
  if (k === 'seal') { x.fillStyle = '#5a4630'; x.beginPath(); x.moveTo(cx - 9, cy + 9); x.lineTo(cx - 9, cy - 3); x.arc(cx, cy - 3, 9, Math.PI, 0); x.lineTo(cx + 9, cy + 9); x.closePath(); x.fill();   // a door, with the colour of the element that opens it
    const c = typeof ELC === 'function' ? ELC(n.el) : '#ffd23f'; x.fillStyle = c; x.beginPath(); x.arc(cx, cy, 3.4, 0, 7); x.fill(); return true; }
  if (k === 'rival') { x.fillStyle = '#ffb04a'; x.beginPath(); x.moveTo(cx - 8, cy + 9); x.lineTo(cx - 8, cy - 9); x.lineTo(cx + 9, cy - 5); x.lineTo(cx - 8, cy - 1); x.fill();   // Rook's orange flag
    x.strokeStyle = '#6a4a2a'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(cx - 8, cy - 10); x.lineTo(cx - 8, cy + 10); x.stroke(); return true; }
  return false;
}

/* two to three choices in the menu box, in place of the room's choices so nothing on screen moves. Resolves with the index picked */
function deepChoice(opts) {
  return new Promise(res => { const box = el('dp-acts'); if (!box) { res(0); return; }
    box.innerHTML = `<div id="dp-choice" style="display:contents">` + opts.map((o, i) => `<button class="rb" data-c="${i}">${o[0]}<small>${o[1]}</small></button>`).join('') + `</div>`;
    box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { box.querySelectorAll('button').forEach(x => x.disabled = true); res(+b.dataset.c); }); });
}

/* ---------- the room events, where the team works together (Gid, 17 Nov 2026) ----------
   Each one still works with two Snabits left or one. Every line waits on Gid's OK */
const DEEP_EV = {
  plates: { prop: 'plates', act: 'The stone plates', see: 'stone plates' },
  lid: { prop: 'lid', act: 'The stone chest', see: 'a stone chest' },
  stuck: { prop: 'stuck', act: 'The fallen rocks', see: 'a Snabit under some rocks' },
  mural: { prop: 'mural', act: 'The carving on the wall', see: 'a carving' },
  crack: { prop: 'crack', act: 'The crack in the floor', see: 'a crack in the floor' } };
// the events a region's rooms lean towards
const DEEP_EV_FAV = { Stone: ['lid', 'stuck'], Brawl: ['lid', 'stuck'], Steel: ['plates', 'lid'], Spark: ['plates'], Shade: ['mural'], Light: ['mural'], Charm: ['mural', 'stuck'],
  Void: ['mural'], Wild: ['crack', 'stuck'], Tide: ['crack'], Frost: ['crack'], Venom: ['crack'], Blaze: ['crack', 'lid'] };
// how many plates: two or three on the last floor
const deepPlates = n => n.f >= 2 ? 3 : 2;
async function deepEvent(reg, n, g, T, leadOf, setLead, K, found, M, need) {
  const s = RS, G = GRADE_INFO[g], live = T.map((m, i) => ({ m, i })).filter(o => !o.m.down), st = (o, k) => playerFighter(o.m.s).base[k], nm = o => displayName(o.m.s);
  const best = k => live.slice().sort((a, b) => st(b, k) - st(a, k))[0], sum = k => live.reduce((a, o) => a + st(o, k), 0);
  const pr = deepUse({ k: DEEP_EV[n.ev].prop, x: 150, y: GROUND, n: deepPlates(n) }, n), X = pr.x;
  const lead = async o => { if (o.i !== leadOf()) setLead(o.i); };
  const gift = async (line, rare) => { const R = rng(hashStr('ev|' + reg.n + '|' + n.id + '|' + exSeason())), item = rare && R() < 0.25 ? deepTreasure(R) : rare || R() < 0.4 ? EX_RARE[Math.floor(R() * EX_RARE.length)] : EX_FINDS[Math.floor(R() * EX_FINDS.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a', bits = Math.round(G.purse * 0.4);
    addItem(item); deepPay(T, 'find', bits); found.push(`${a} ${item}`); s.pose = 'happy'; deepCrew(T, leadOf(), [], 'happy'); spark(X, GROUND - 30, 'sparkle', 8);
    K(line.replace('{x}', `${a} ${item}`)); await rwait(1900); };
  if (n.ev === 'plates') {   // a plate for every Snabit; one short, the strongest shoves a stone onto the last plate
    const N = deepPlates(n), xs = [...Array(N)].map((_, k) => X + (k - (N - 1) / 2) * 34), on = Math.min(N, live.length);
    deepCrew(T, leadOf(), xs.slice(1)); await walkTo(xs[0], 60, 'walk'); await rwait(400); pr.on = on; rsfx('thud');
    if (on < N) { const o = best('pow'); if (st(o, 'pow') < need * 1.15) { K(`There are ${N} plates and only ${on} of us. Nothing happens.`); await rwait(1800); return 'retry'; }
      K(`${nm(o)} shoves a loose stone onto the last plate.`); await rwait(1200); pr.on = N; }
    rsfx('creak'); RS.shake = 3; await rwait(600); await gift('Something clicked in the wall and a hidden shelf slid out with {x} on it.'); return; }
  if (n.ev === 'lid') {   // everyone lifts together
    deepCrew(T, leadOf(), [X + 26, X + 6]); await walkTo(X - 26, 60, 'walk'); await rwait(300); s.pose = 'effort'; deepCrew(T, leadOf(), [X + 26, X + 6], 'effort'); rsfx('rumble'); await rwait(900);
    if (sum('pow') < need * 1.9) { for (const o of live) o.m.e = Math.max(0, o.m.e - 2); K(live.length > 1 ? "It won't budge. Not even with all of us lifting." : `${nm(live[0])} can't lift it alone.`); await rwait(1800); return 'fail'; }
    pr.open = true; rsfx('creak'); s.pose = 'happy'; await rwait(500); await gift(live.length > 1 ? 'Everyone lifted together and the lid came off. There was {x} inside.' : `${nm(live[0])} heaved the lid off by itself. There was {x} inside.`, true); return; }
  if (n.ev === 'stuck') {   // a little wild Snabit under fallen rocks
    deepCrew(T, leadOf(), [X + 30, X + 50]); await walkTo(X - 28, 60, 'walk'); K("There's a little wild Snabit stuck under those rocks."); await rwait(1300); s.pose = 'effort'; deepCrew(T, leadOf(), [X + 28, X + 42], 'effort'); rsfx('rumble'); await rwait(900);
    if (sum('pow') < need * 1.6) { for (const o of live) o.m.e = Math.max(0, o.m.e - 2); K(live.length > 1 ? "We pulled and pulled and the rocks won't move." : `${nm(live[0])} can't move the rocks on its own.`); await rwait(1800); return 'fail'; }
    pr.free = true; rsfx('thud'); s.pose = 'happy'; deepCrew(T, leadOf(), [X + 28, X + 42], 'happy'); await rwait(700); await gift('Everyone pulled the rocks away and it ran off. It left {x} behind for us.'); return; }
  if (n.ev === 'mural') {   // the best Mind reads it: a map of the floor
    const o = best('mnd'); await lead(o); deepCrew(T, leadOf(), [X - 34, X + 34], 'lean'); await walkTo(X, 60, 'walk'); s.pose = 'lean'; await rwait(900); s.pose = 'idle';
    if (st(o, 'mnd') < need * 1.05) { K('None of us can make sense of it.'); await rwait(1600); return 'fail'; }
    pr.read = true; rsfx('sparkle'); M.reveal(); const F = M.floors[n.f], hid = F.E.filter(e => e.hidden); hid.forEach(e => e.hidden = false);
    K(`${nm(o)} worked it out. It's a map of this floor` + (hid.length ? ", with a room nobody's been in." : '.')); await rwait(2000); return; }
  // a crack: the fastest jumps it
  const o = best('spd'); await lead(o); deepCrew(T, leadOf(), [X - 50, X - 72]); await walkTo(X - 24, 60, 'walk'); await rwait(400);
  if (st(o, 'spd') < need * 1.05) { K("It's too far for any of us to jump."); await rwait(1600); return 'fail'; }
  const x0 = s.x; for (let k = 0; k <= 20; k++) { s.x = x0 + k * 2.6; s.jy = -Math.sin(k / 20 * Math.PI) * 26; await rwait(16); } pr.got = true;
  await gift(`${nm(o)} jumped the crack and came back with {x}.`); for (let k = 0; k <= 20; k++) { s.x = x0 + 52 - k * 2.6; s.jy = -Math.sin(k / 20 * Math.PI) * 26; await rwait(16); }
 
}

/* one of the new circles, called from deepNode */
async function deepMore(reg, n, st, g, T, leadOf, setLead, K, used, found, M) {
  const s = RS, G = GRADE_INFO[g];
  if (used.includes(n.id)) { await rwait(200); return; }
  if (n.k === 'shrine') {
    const p = deepUse({ k: 'shrine', x: 160, y: GROUND }, n); deepCrew(T, leadOf(), []); await walkTo(p.x - 30, 60, 'walk'); s.pose = 'idle';
    K("This is an old League waystone. Put a paw on it and pick what we need most."); await rwait(600);
    const c = await deepChoice([['A rest', 'For tired legs'], ['The map', 'Every path out here'], ['Luck', 'For the next chest']]);
    used.push(n.id); spark(p.x, GROUND - 40, 'sparkle', 10); rsfx('sparkle'); s.pose = 'happy'; deepCrew(T, leadOf(), [], 'happy');
    if (c === 0) { for (const m of T) if (!m.down) { m.e = Math.min(m.max, m.e + 4); m.hp = Math.min(m.hpMax, m.hp + Math.round(m.hpMax * 0.3)); } K('That feels better. Let\'s keep going.'); }
    if (c === 1) { M.reveal(); K('There. Now we can see the whole way.'); }
    if (c === 2) { T.lucky = true; K('Let\'s find a chest while our luck lasts.'); }
    await rwait(1300); return; }
  if (n.k === 'seal') {
    const [what, how] = DEEP_SEAL[n.el], p = prop({ k: 'seal', x: 170, y: GROUND, el: n.el }); K(what); await rwait(1400);
    const who = T.map((m, i) => ({ m, i })).find(({ m }) => !m.down && (m.s.m.el1 === n.el || m.s.m.el2 === n.el));
    if (!who) { K(`A ${n.el} Snabit could get us past that. Maybe next season.`); await rwait(1600); return 'fail'; }
    used.push(n.id);
    if (who.i !== leadOf()) { await sceneFade(true, 200); setLead(who.i); RS.props = [p]; RS.x = 70; RS.camJump = true; await sceneFade(false, 200); }
    await walkTo(140, 60, 'walk'); RS.pose = 'happy'; p.open = true; spark(170, GROUND - 30, 'sparkle', 10); rsfx('creak');
    K(how(displayName(who.m.s))); await rwait(1500); return 'open'; }
  if (n.k === 'cache') {   // what the sealed way kept safe
    used.push(n.id); const c = deepUse({ k: 'chest', x: 150, y: GROUND, big: true }, n); deepCrew(T, leadOf(), []); await walkTo(c.x - 24, 60, 'walk'); await rwait(300); c.open = true; rsfx('creak'); s.pose = 'happy'; deepCrew(T, leadOf(), [], 'happy'); spark(c.x, GROUND - 22, 'sparkle', 8);
    const R = rng(hashStr('seal|' + reg.n + '|' + n.id + '|' + exSeason())), item = EX_RARE[Math.floor(R() * EX_RARE.length)], bits = Math.round(G.purse), a = /^[AEIOU]/.test(item) ? 'an' : 'a';
    addItem(item); deepPay(T, 'find', bits); found.push(`${a} ${item}`);
    K(`There's an old League cache back here, with ${a} ${item} in it.`); await rwait(1700); return; }
  if (n.k === 'rival') {
    used.push(n.id); const R = Math.random, lv = Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * 0.75);
    say("Well, look who made it out here. My team's been waiting for someone to beat.", 'rival'); await rwait(2200);
    for (let k = 0; k < 3; k++) {
      const foe = k === 2 && typeof rookMon === 'function' ? rookMon(g, 0.85) : gradedOpponent(g, lv, R); foe.boss = null;   // Rook's own partner goes last
      const fp = await deepFoeIn(foe);
      const won = await deepFight(T, leadOf(), foe, `Rook's ${foe.m.name}`, K, { fp, where: `Rook's team, ${k + 1} of 3`, line: k === 0 ? `Rook's ${foe.m.name} goes first.` : k === 1 ? `Next up is Rook's ${foe.m.name}.` : `Rook's own ${foe.m.name} is last.` });
      if (!won) { say('Better luck next time. My team never loses out here.', 'rival'); await rwait(1800); K(`Rook's team beat ${deepAll(T)}.`); await rwait(1400); used.splice(used.indexOf(n.id), 1); return 'lost'; }
      const alive = T.findIndex(m => !m.down); if (alive >= 0 && T[leadOf()].down) setLead(alive);
    }
    const bits = Math.round(G.purse * 2.5), R2 = rng(hashStr('rival|' + reg.n + '|' + exSeason())), item = EX_RARE[Math.floor(R2() * EX_RARE.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a';
    deepPay(T, "Rook's team", bits, 3); addItem(item); found.push(`${a} ${item}`); RS.pose = 'happy';
    say(`Fine. You beat all three. Take this before I change my mind.`, 'rival'); await rwait(1800);
    K(`Rook left ${a} ${item} behind.`); await rwait(1500); return; }
}
