/* The story: the ranch came with a 30,000 bit loan from the Grand Ranch, and Rook, the son of the family that runs it,
   wants the land back. Prize money pays the loan at the Town Hall, and each quarter paid opens more of the Workshop.
   Rook enters the official cups and has a rival match each month. Each new grade brings a scene, the Rift opens at A,
   and winning the Legend Cup ends the story. Needs game.js, ranch.js, npcs.js, tourney.js and town.js. */
const LOAN = 30000;
function story() { const P = PLAYER; if (!P.story) P.story = { seen: {}, paid: 0, grade: null, rookW: 0, rookL: 0, contests: 0 }; return P.story; }
const bestGrade = () => { const gs = [RS && RS.grade].concat((PLAYER.roster || []).map(e => e.st && e.st.grade)).filter(Boolean); return gs.length ? GRADES[Math.max(...gs.map(g => GRADES.indexOf(g)))] : 'E'; };
const loanLeft = () => Math.max(0, LOAN - story().paid);

/* Rook's Snabit: always the same monster, trained up to whatever grade it's facing */
function rookMon(grade) {
  const G = GRADE_INFO[grade], lv = Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * 0.7);
  const o = gradedOpponent(grade, lv, rng(hashStr('rook-partner')), 'Shade', Math.round(G.earned[0] + (G.earned[1] - G.earned[0]) * 0.75));
  return o;
}
const rookName = g => `Rook's ${rookMon(g || 'E').m.name}`;

/* ---------- running a scene ---------- */
const talkMs = t => Math.min(5600, 1500 + t.length * 40);
async function talk(who, text) { say(text, who === 'tala' ? null : who); await rwait(talkMs(text)); }
/* someone walks in from the road on the right and stops near the monster */
async function walkIn(who, o = {}) {
  if (typeof smoothRanch === 'function' && !smoothRanch()) return { p: {}, pet: null, none: true };   // pixel art has no people drawn, so they only talk
  const s = RS, to = s.x + 80, pet = o.mon ? prop({ k: 'foe', x: to + 170 + 46, y: GROUND, fm: o.mon.fm, grid: o.mon.fm.grid, pal: o.mon.fm.pal, pose: 'walk' }) : null;
  const p = prop({ k: 'npc', who, x: to + 170, y: GROUND, face: 'talk', pose: 'walk', flip: true });   // after the pet, so Rook draws in front of a big Mega
  // the camera sits between the monster and the visitor, with room for a visitor's Snabit behind them
  s.panC = s.x + (pet ? 64 : 40); s.panUntil = performance.now() + 1e9;
  s.dir = 1; while (p.x > to) { p.x -= 1.4 * rk(); if (pet) pet.x = p.x + 46; await rwait(16); }
  p.pose = 'stand'; if (pet) pet.pose = 'idle'; return { p, pet };
}
async function walkOut(w) { if (w.none) return; w.p.flip = false; w.p.pose = 'walk'; if (w.pet) w.pet.pose = 'walk';
  const end = w.p.x + 200; while (w.p.x < end) { w.p.x += 1.6 * rk(); if (w.pet) w.pet.x = w.p.x + 46; await rwait(16); } unprop(w.p); if (w.pet) unprop(w.pet); RS.panUntil = 0; RS.panC = null; }
async function homeStage() { const s = RS; if (s.room) leaveBarn(); s.bg = null; s.trip = false; s.night = 0; s.dusk = 0; s.props = s.props.filter(p => p.k === 'bowl'); s.x = clamp(s.x, 120, 300); s.camJump = true; s.pose = 'idle'; await rwait(200); }
/* runs a beat inside the scene that's already playing, or starts a scene for it */
async function playBeat(id) {
  const B = BEATS[id]; if (!B) return; story().seen[id] = PLAYER.week;
  const run = async () => { await homeStage(); try { await B(); } finally { RS.panUntil = 0; RS.panC = null; } saveGame(); };
  if (RS.busy) await run(); else await scene(run);
}

/* ---------- the beats ---------- */
const BEATS = {
  async intro() {
    const s = RS, nm = s.m.name, mon = rookMon('C');
    await talk('tala', "The Grand Ranch sent a letter. I still owe them 30,000 bits from when I bought this ranch, and they want the money.");
    const w = await walkIn('rival', { mon }); s.dir = 1;
    await talk('rival', `You must be the new ranch hand. I'm Rook, and this is my Snabit, ${mon.m.name}. My family owns the Grand Ranch.`);
    w.p.face = 'worried'; await talk('rival', "My father wants this land for a second ranch. If Tala can't pay the 30,000 bits, it goes to us.");
    w.p.face = 'happy'; await talk('rival', `I'll make you a deal. ${mon.m.name} and I are entering the official cups too. Win the Legend Cup before we do and I'll get my father to drop what's left of the loan.`);
    await walkOut(w); s.pose = 'happy';
    await talk('tala', `Cup prizes are the quickest way to pay him back. Take the prize money to the Town Hall in town and pay 1,000 or 5,000 at a time. Every quarter we pay off, the Workshop can build more for ${nm}.`);
    say('Out > Goals shows how much is paid and what to aim for next.');
  },
  async loan25() { await talk('tala', "We've paid off a quarter of the loan, so the Workshop can start building upgrades for the barn."); },
  async loan50() { await talk('tala', "We've paid off half the loan, so the Workshop can upgrade the training places and drills there will give more."); },
  async loan75() { await talk('tala', "We've paid off three quarters of the loan, so the Workshop can build the second level of each training place."); },
  async loan100() {
    const s = RS; const w = await walkIn('rival', { mon: rookMon(bestGrade()) });
    w.p.face = 'worried'; await talk('rival', 'My father got your last payment and told me to bring you the deed.');
    s.pose = 'happy'; await hop(12, 380); await talk('tala', 'The ranch is finally ours.');
    w.p.face = 'happy'; await talk('rival', "This doesn't change anything at the cups. I'm still going to beat you at the Majors.");
    await walkOut(w); addItem('Life fruit'); await talk('tala', 'The Grand Ranch sent a Life fruit with the deed.');
  },
  async gradeD() {
    const s = RS; const w = await walkIn('rival', { mon: rookMon('D') });
    w.p.face = 'surprised'; await talk('rival', `Grade D already? It took ${rookMon('D').m.name} a whole season to get there.`);
    w.p.face = 'happy'; await talk('rival', "I'm at the stadium in the third week of every month. Come find me if you want a match.");
    await walkOut(w); await talk('tala', 'The rival match shows under Out > Tournaments in week 3, and winning it pays a quarter of an official cup prize.');
  },
  async gradeC() { await talk('shop', "Grade C! From now on I'll have a second held item for you each week."); },
  async gradeB() {
    const w = await walkIn('doc');
    await talk('doc', "Every Snabit you've scanned with the Snaboscope gives off the same faint signal.");
    w.p.face = 'worried'; await talk('doc', 'It comes from the Rift, past the edge of the map. Only a grade A monster is strong enough to go there.');
    await walkOut(w); await talk('tala', 'Get a Snabit to grade A, and Kiko can take it to the Rift on a skill trip.');
  },
  async gradeA() {
    const w = await walkIn('guide');
    await talk('guide', "So you made grade A. I've never taken anyone to the Rift, but I'll take you. Pick The Rift from the skill trips.");
    w.p.face = 'worried'; await talk('guide', 'The Rift is the only place that teaches Void skills. The Rift Lord lives in the middle of it and trains monsters there.');
    await walkOut(w);
  },
  async gradeS() {
    const w = await walkIn('rival', { mon: rookMon('S') });
    w.p.face = 'talk'; await talk('rival', 'So you made grade S. Win the Official S Cup and they send you an invite to the Major 4. I already have mine.');
    await walkOut(w);
  },
  async master() {
    const w = await walkIn('rival', { mon: rookMon('S') });
    w.p.face = 'talk'; await talk('rival', "You won all four Majors, so you can enter the Legend Cup in the first month of Summer. I'm entered too.");
    await walkOut(w);
  },
  async legend() {
    const s = RS, St = story(); const w = await walkIn('rival', { mon: rookMon('S') });
    w.p.face = 'worried'; await talk('rival', "You won the Legend Cup, so I'll keep my word.");
    if (loanLeft() > 0) { St.paid = LOAN; ['loan25', 'loan50', 'loan75', 'loan100'].forEach(k => St.seen[k] = PLAYER.week); await talk('rival', "My family has dropped the rest of the loan. The ranch is Tala's, deed and all."); }
    else { addItem('Life fruit'); await talk('rival', "The loan's paid already, so take this Life fruit instead."); }
    w.p.face = 'happy'; await talk('rival', "I'm still coming back next year to win it."); await walkOut(w);
    const d = await walkIn('doc');
    await talk('doc', 'Kiko took me into the middle of the Rift while you were at the cup. Snabits come through it as colour and hide in whatever has that colour.');
    await talk('doc', 'They blend into it so well that only a Snaboscope can uncover them. Every Snabit you found came from there.');
    await walkOut(d); s.pose = 'happy'; await hop(14, 400); spark(s.x, headY() - 6, 'sparkle', 12);
    say(''); banner('The End', '#ffd23f'); await rwait(2600); banner('');
    await talk('tala', 'The cups and the Rift stay open, and the Legend Cup comes back every Summer.');
  },
};

/* which beat is due: called at the end of every week */
function dueBeat() {
  const St = story(), seen = St.seen, g = bestGrade(), gi = GRADES.indexOf(g);
  if (PLAYER.week < 1) return null;
  if (!seen.intro) { if (St.grade == null) { St.grade = g; for (let i = 1; i <= gi; i++) seen['grade' + GRADES[i]] = -1; } return 'intro'; }
  for (const [k, f] of [['loan25', 0.25], ['loan50', 0.5], ['loan75', 0.75], ['loan100', 1]]) if (!seen[k] && St.paid >= LOAN * f) return k;
  for (let i = 1; i <= gi; i++) if (!seen['grade' + GRADES[i]]) return 'grade' + GRADES[i];
  const anyMaster = (RS && RS.master) || (PLAYER.roster || []).some(e => e.st && e.st.master);
  if (anyMaster && !seen.master) return 'master';
  if (St.legendWon && !seen.legend) return 'legend';
  return null;
}
async function storyAfterWeek() {
  if (typeof PLAYER === 'undefined' || !RS || RS.dead) return;
  const id = dueBeat(); if (!id) return;
  await rwait(2400); await playBeat(id);
}

/* ---------- the Town Hall: pay the loan ---------- */
function openHall(msg) {
  const St = story(), left = loanLeft(), pct = Math.round(St.paid / LOAN * 100);
  const amts = [1000, 5000].filter(a => a < left).concat(left ? [left] : []);
  panel(`<div class="full lab-head"><b>Town Hall</b><button class="small" id="th-back">Back</button></div>
    <div class="full lab-info">${msg ? msg + ' ' : ''}${left ? `The ranch owes the Grand Ranch ${left.toLocaleString()} bits. You have ${PLAYER.bits.toLocaleString()}.` : 'The loan is paid and the deed is yours.'}</div>
    <div class="full goal-bar"><i style="width:${pct}%"></i><span>${St.paid.toLocaleString()} of ${LOAN.toLocaleString()} paid</span></div>` +
    amts.map(a => `<button class="rb" data-pay="${a}" ${PLAYER.bits < a ? 'disabled' : ''}>Pay ${a === left ? 'the rest, ' : ''}${a.toLocaleString()}<small>${PLAYER.bits < a ? (a - PLAYER.bits).toLocaleString() + ' more bits needed' : 'Leaves ' + (PLAYER.bits - a).toLocaleString() + ' bits'}</small></button>`).join(''));
  el('th-back').onclick = openTown;
  el('r-panel').querySelectorAll('[data-pay]').forEach(b => b.onclick = async () => {
    const a = +b.dataset.pay; if (PLAYER.bits < a) return; PLAYER.bits -= a; St.paid += a; drawUI(); saveGame();
    const due = () => { const k = [['loan25', 0.25], ['loan50', 0.5], ['loan75', 0.75], ['loan100', 1]].find(([k, f]) => !St.seen[k] && St.paid >= LOAN * f); return k ? k[0] : null; };
    if (due()) { await scene(async () => { await homeStage(); for (let id; (id = due());) { story().seen[id] = PLAYER.week; await BEATS[id](); } RS.panUntil = 0; RS.panC = null; }); openHall(); return; }
    openHall(`Paid ${a.toLocaleString()} bits.`);
  });
}
const loanStep = () => { const p = story().paid / LOAN; return p >= 1 ? 4 : p >= 0.75 ? 3 : p >= 0.5 ? 2 : p >= 0.25 ? 1 : 0; };

/* ---------- Rook at the cups ---------- */
function rookEntrant(grade) { const o = rookMon(grade); return { o, name: `Rook's ${o.m.name}`, breeder: 'Rook', rook: true }; }
function rookResult(won) { const St = story(); if (won) St.rookW++; else St.rookL++; }

/* ---------- festivals: one a season, a gift from town and a lighter week ---------- */
const FESTIVALS = { 1: ['Blossom Festival', 'Berry'], 5: ['Lantern Festival', 'Honey cake'], 7: ['Harvest Fair', 'Energy nut'], 10: ['Snow Fair', 'Candy'] };
const festivalOf = w => { const { mo, wk } = weekParts(w); return wk === 1 && FESTIVALS[mo] ? FESTIVALS[mo] : null; };

/* ---------- goals: what's done and what's next ---------- */
function nextGradeLine(s) {
  if (s.grade === 'S') return s.master ? 'Win the Legend Cup in the first month of Summer.' : s.majorInvite ? `Win all four Majors (${(s.majors || []).length} of 4 so far).` : 'Win the Official S Cup for an invite to the Major 4.';
  for (let k = 0; k < 16; k++) { const { mo, wk } = weekParts(PLAYER.week + k); if (wk === 3 && mo % 3 === 2) return `Win the Official ${s.grade} Cup to move up to grade ${GRADES[GRADES.indexOf(s.grade) + 1]}. It's ${k ? `in ${k} week${k > 1 ? 's' : ''}` : 'this week'}.`; }
  return '';
}
function openGoals() {
  const s = RS, St = story(), pct = Math.round(St.paid / LOAN * 100), dx = typeof dexCount === 'function' ? dexCount() : null;
  const row = (t, d, done) => `<div class="goal ${done ? 'done' : ''}"><i>${done ? '✓' : '•'}</i><span><b>${t}</b><small>${d}</small></span></div>`;
  panel(`<div class="full lab-head"><b>Goals</b><button class="small" id="gl-back">Back</button></div>
    <div class="full goal-list">
    ${row('Pay off the ranch', `${St.paid.toLocaleString()} of ${LOAN.toLocaleString()} bits paid at the Town Hall.`, St.paid >= LOAN)}
    <div class="goal-bar"><i style="width:${pct}%"></i></div>
    ${row(`Grade ${s.grade}`, nextGradeLine(s), St.legendWon)}
    ${row('Beat Rook', `${St.rookW} of 5 wins against him, ${St.rookL} loss${St.rookL === 1 ? '' : 'es'}.`, St.rookW >= 5)}
    ${dx ? row('Fill the bestiary', `${dx.seen} of ${dx.total} seen, ${dx.raised} raised.${dx.next ? ' ' + dx.next : ''}`, dx.seen >= dx.total) : ''}
    ${row('Win contests', `${St.contests} of 12 won. There's one in the first week of every month.`, St.contests >= 12)}
    </div>
    <div class="full lab-info"><b>What each grade opens</b>, counted from the ranch's best Snabit, now grade ${bestGrade()}:</div>
    <div class="full goal-list">${PERKS.map(([g, t], i) => row(`Grade ${g}`, t, i <= GRADES.indexOf(bestGrade()))).join('')}</div>`);
  el('gl-back').onclick = () => menu('Out');
}
