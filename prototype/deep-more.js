/* More to find on the team expeditions (Gid, 17 Nov 2026: a deep map was done after one or two clears).
   Each season, every deep map and Rift ring is built anew (deep-gen.js), and three kinds of place turn up on it:
   - a waystone: an old League marker where the team picks one kind of help for the rest of the trip: a rest, the whole map, or
     luck at the next chest
   - a sealed way: the doorway of a dead-end room, blocked by something only a Snabit of one element can clear, with a League
     cache inside. The element changes with the season, so a team that can't open it this season might next time
   - Rook's team: three of Rook's Snabits, one after another with his own partner last, for a big purse. About one map in two
     has them, once the player has met Rook. Losing to them sends the team back to the entrance
   Needs deep.js, explore.js, explore-art.js and npcs.js. */

// what blocks a sealed way, and how a Snabit of that element clears it. Every line waits on Gid's OK
const DEEP_SEAL = {
  Blaze: ['Thick dry vines cover a door in the rock.', n => `${n} burns the vines away.`],
  Tide: ['There\'s a door with a dry basin in front of it.', n => `${n} fills the basin, and the door floats open.`],
  Frost: ['Water pours down over a door in the rock.', n => `${n} freezes the water solid, and we can get to the door.`],
  Spark: ['It\'s too dark to find the handle on this door, and there\'s an old lamp beside it.', n => `${n} lights the old lamp.`],
  Wild: ['Dead roots have grown over a stone door.', n => `${n} wakes the roots up, and they pull the door open.`],
  Stone: ['Rocks are piled up against a door.', n => `${n} shifts the rocks aside.`],
  Brawl: ['A rusted door is jammed shut.', n => `${n} knocks it open.`],
  Steel: ['A heavy iron bar is across the door.', n => `${n} pulls the iron bar off.`],
  Light: ['There\'s a door at the back of a pitch-black hollow.', n => `${n} lights up the hollow.`],
  Shade: ['There\'s a door here that only shows in a shadow.', n => `${n} steps into the shadow, and the door opens.`],
  Charm: ['A big Snabit is asleep against the door.', n => `${n} wakes it gently, and it moves aside.`],
  Venom: ['A thorn bush has grown over the door.', n => `${n} wilts the thorns.`] };
const DEEP_SEAL_ELS = Object.keys(DEEP_SEAL);

/* called from deepMap: a sealed way on the doorway of a dead-end room with a League cache inside, a waystone, and sometimes Rook's
   team. The sealed way goes first, so nothing else lands behind it */
function deepExtras(reg, M, R) {
  const el = DEEP_SEAL_ELS[Math.floor(R() * DEEP_SEAL_ELS.length)];
  for (const f of [1, 2, 0]) { const L = M.leaf(f); if (!L) continue; const [x, y, k] = L, F = M.floors[f], i = dgI(F, x, y);
    F.leafUsed.push(k); F.feat[i] = { k: 'seal', el, id: `${f}:seal:${i}`, f, x, y }; F.shut.add(i);
    const c = dgFree(F, k)[0]; if (c) { const j = dgI(F, ...c); F.feat[j] = { k: 'cache', id: `${f}:cache:${j}`, f, x: c[0], y: c[1] }; } break; }
  M.place('shrine', {}, [0, 1], R);
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

/* two to three buttons under the map; resolves with the index picked */
function deepChoice(opts) {
  return new Promise(res => { const box = document.createElement('div'); box.className = 'full'; box.id = 'dp-choice';
    box.innerHTML = opts.map((o, i) => `<button class="rb" data-c="${i}">${o[0]}<small>${o[1]}</small></button>`).join('');
    const home = el('ex-home'); el('r-panel').insertBefore(box, home); if (home) home.style.display = 'none';
    box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { box.remove(); if (home) home.style.display = ''; res(+b.dataset.c); }); });
}

/* one of the new circles, called from deepNode */
async function deepMore(reg, n, st, g, T, leadOf, setLead, K, used, found, M) {
  const s = RS, G = GRADE_INFO[g];
  if (used.includes(n.id)) { await rwait(200); return; }
  if (n.k === 'shrine') {
    const p = prop({ k: 'shrine', x: 160, y: GROUND }); await walkTo(130, 60, 'walk'); s.pose = 'idle';
    K("This is an old League waystone. Put a paw on it and pick what we need most."); await rwait(600);
    const c = await deepChoice([['A rest', 'For tired legs'], ['The map', 'Every path out here'], ['Luck', 'For the next chest']]);
    used.push(n.id); spark(160, GROUND - 40, 'sparkle', 10); rsfx('sparkle'); s.pose = 'happy';
    if (c === 0) { for (const m of T) if (!m.out) m.e = Math.min(m.max, m.e + 4); K('That feels better. Let\'s keep going.'); }
    if (c === 1) { M.reveal(); K('There. Now we can see the whole way.'); }
    if (c === 2) { T.lucky = true; K('Let\'s find a chest while our luck lasts.'); }
    await rwait(1300); unprop(p); return; }
  if (n.k === 'seal') {
    const [what, how] = DEEP_SEAL[n.el], p = prop({ k: 'seal', x: 170, y: GROUND, el: n.el }); K(what); await rwait(1400);
    const who = T.map((m, i) => ({ m, i })).find(({ m }) => !m.out && (m.s.m.el1 === n.el || m.s.m.el2 === n.el));
    if (!who) { K(`A ${n.el} Snabit could get us past that. Maybe next season.`); await rwait(1600); unprop(p); return 'fail'; }
    used.push(n.id);
    if (who.i !== leadOf()) { await sceneFade(true, 200); setLead(who.i); RS.props = [p]; RS.x = 70; RS.camJump = true; await sceneFade(false, 200); }
    await walkTo(140, 60, 'walk'); RS.pose = 'happy'; p.open = true; spark(170, GROUND - 30, 'sparkle', 10); rsfx('creak');
    K(how(displayName(who.m.s))); await rwait(1500); unprop(p); return 'open'; }
  if (n.k === 'cache') {   // what the sealed way kept safe
    used.push(n.id); const c = prop({ k: 'chest', x: 150, y: GROUND, big: true }); await walkTo(126, 60, 'walk'); await rwait(300); c.open = true; rsfx('creak'); s.pose = 'happy'; spark(150, GROUND - 22, 'sparkle', 8);
    const R = rng(hashStr('seal|' + reg.n + '|' + n.id + '|' + exSeason())), item = EX_RARE[Math.floor(R() * EX_RARE.length)], bits = Math.round(G.purse), a = /^[AEIOU]/.test(item) ? 'an' : 'a';
    addItem(item); PLAYER.bits += bits; drawUI(); found.push(`${a} ${item}`, `${bits.toLocaleString()} bits`);
    K(`There's an old League cache back here: ${a} ${item} and ${bits.toLocaleString()} bits.`); await rwait(1700); unprop(c); return; }
  if (n.k === 'rival') {
    used.push(n.id); const R = Math.random, lv = Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * 0.75);
    say("Well, look who made it out here. My team's been waiting for someone to beat.", 'rival'); await rwait(2200);
    for (let k = 0; k < 3; k++) {
      const foe = k === 2 && typeof rookMon === 'function' ? rookMon(g, 0.85) : gradedOpponent(g, lv, R); foe.boss = null;   // Rook's own partner goes last
      const fp = prop({ k: 'foe', x: 186, y: GROUND, fm: foe.fm }); banner(`Rook's team, ${k + 1} of 3`, '#ffb04a'); await rwait(1100); banner(''); unprop(fp);
      const won = await deepFight(T, leadOf(), foe, `Rook's ${foe.m.name}`, K);
      if (!won) { say('Better luck next time. My team never loses out here.', 'rival'); await rwait(1800); K("Rook's team beat all three of you."); await rwait(1400); used.splice(used.indexOf(n.id), 1); return 'lost'; }
      const alive = T.findIndex(m => !m.out); if (alive >= 0 && T[leadOf()].out) setLead(alive);
    }
    const bits = Math.round(G.purse * 2.5), R2 = rng(hashStr('rival|' + reg.n + '|' + exSeason())), item = EX_RARE[Math.floor(R2() * EX_RARE.length)], a = /^[AEIOU]/.test(item) ? 'an' : 'a';
    PLAYER.bits += bits; addItem(item); drawUI(); found.push(`${bits.toLocaleString()} bits`, `${a} ${item}`); RS.pose = 'happy';
    say(`Fine. You beat all three. Take this before I change my mind.`, 'rival'); await rwait(1800);
    K(`The League pays ${bits.toLocaleString()} bits for beating a whole team, and Rook left ${a} ${item}.`); await rwait(1700); return; }
}
