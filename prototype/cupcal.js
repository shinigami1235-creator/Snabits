/* The cup calendar, opened from the ranch the way Monster Rancher 2 does it: the ranch stays on screen, a month of cups sits
   under it with one grade tile per cup, and the card over the ranch shows the cup that's picked. Only this week's cups can be
   entered, which takes the Snabit to the stadium. Needs tourney.js and venue.js. */
const CAL_ROWS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];   // F holds the Open Cup, the Friendly match, rival matches and the exhibition
const calRow = c => c.major || c.legend ? 'S' : c.small || c.open || c.rival || c.exhibition ? 'F' : c.grade;
const calTile = c => c.rival ? 'R' : c.open ? 'O' : c.small ? 'F' : c.exhibition ? 'T' : calRow(c);
let CAL = null;

function openCupCal(sel) {
  const s = RS; if (!s) return;
  CAL = { off: 0, sel: sel || null, adv: {}, sure: null };
  if (!el('r-cal')) { const d = document.createElement('div'); d.id = 'r-cal'; el('r-panel').after(d); const k = document.createElement('div'); k.id = 'r-calcard'; el('r-frame').appendChild(k); }
  document.body.classList.add('cal-open');
  if (!CAL.sel) { const now = cupsOfWeek(PLAYER.week).filter(c => !cupBlock(c, s)), mine = now.find(c => signedFor(PLAYER.week, c.name)); CAL.sel = { w: PLAYER.week, c: mine || now[0] || cupsOfWeek(PLAYER.week)[0] || null }; }
  calDraw();
}
function closeCupCal() { CAL = null; document.body.classList.remove('cal-open'); const a = el('r-cal'), b = el('r-calcard'); if (a) a.innerHTML = ''; if (b) b.innerHTML = ''; }

function calDraw() {
  const s = RS, start = Math.floor(PLAYER.week / 4) * 4 + CAL.off * 4, mo = Math.floor(start / 4) % 12;
  // cupsOfWeek builds new objects on every call, so each tile keeps the cup's place in its week's list
  const weeks = [0, 1, 2, 3].map(k => cupsOfWeek(start + k));
  const cells = CAL_ROWS.map(g => [0, 1, 2, 3].map(k => { const w = start + k;
    return weeks[k].map((c, i) => calRow(c) !== g ? '' : (() => { const no = cupBlock(c, s), on = CAL.sel && CAL.sel.w === w && CAL.sel.c && CAL.sel.c.name === c.name;
      return `<button class="ct g${calRow(c)}${no ? ' no' : ''}${on ? ' on' : ''}${c.official ? ' up' : ''}${signedFor(w, c.name) ? ' sg' : ''}" data-w="${w}" data-i="${i}">${calTile(c)}</button>`; })()).join(''); }));
  const ev = [0, 1, 2, 3].map(k => { const w = start + k, f = typeof festivalOf === 'function' && festivalOf(w), ct = typeof contestOf === 'function' && contestOf(w);
    return (f ? `<i class="ce" title="${f[0]}">★</i>` : '') + (ct ? `<i class="ce" title="${ct.name}">C</i>` : ''); });
  el('r-cal').innerHTML = `<div class="cal-card">
      <div class="cal-nav"><button class="small" id="cal-prev" ${CAL.off <= 0 ? 'disabled' : ''}>◀</button><b>${SEASON[Math.floor(mo / 3)]} · Month ${mo % 3 + 1}</b><button class="small" id="cal-next" ${CAL.off >= 11 ? 'disabled' : ''}>▶</button></div>
      <div class="cal-grid">
        <span></span>${[0, 1, 2, 3].map(k => { const w = start + k; return `<span class="wkh${w === PLAYER.week ? ' now' : w < PLAYER.week ? ' past' : ''}">${w === PLAYER.week ? 'Now' : 'Wk ' + (k + 1)}</span>`; }).join('')}
        ${CAL_ROWS.map((g, r) => `<span class="rowh">${g === 'F' ? 'Other' : g}</span>${cells[r].map((h, k) => `<span class="cell${start + k === PLAYER.week ? ' now' : ''}">${h}</span>`).join('')}`).join('')}
        <span class="rowh">Events</span>${ev.map((h, k) => `<span class="cell ev${start + k === PLAYER.week ? ' now' : ''}">${h}</span>`).join('')}
      </div></div>
    <div class="cal-tala" id="cal-tala"></div>
    <div class="cal-acts"><button class="btn2" id="cal-back">Back</button><button class="big" id="cal-go"></button></div>`;
  calCard();
  el('cal-prev').onclick = () => { CAL.off--; calDraw(); }; el('cal-next').onclick = () => { CAL.off++; calDraw(); };
  el('r-cal').querySelectorAll('.ct').forEach(b => b.onclick = () => { const w = +b.dataset.w; CAL.sel = { w, c: cupsOfWeek(w)[+b.dataset.i] }; CAL.sure = null; calDraw(); });
  el('cal-back').onclick = closeCupCal;
  el('cal-go').onclick = calEnter;
}

/* the card over the ranch: date, name, grade, format, entries and prize of the picked cup, the way MR2 shows it on the farm */
function calCard() {
  const s = RS, sel = CAL.sel, go = el('cal-go'), card = el('r-calcard');
  if (!sel || !sel.c) { card.innerHTML = ''; go.textContent = 'Enter'; go.disabled = true; return; }
  const c = sel.c, { mo, wk } = weekParts(sel.w), k = sel.w - PLAYER.week, why = cupBlock(c, s), fee = cupFee(c);
  const n = c.format === 'robin' ? c.size : c.format === 'single' ? 2 : c.format === 'team5' ? '2 teams of 5' : 8;
  const fmt = c.format === 'robin' ? 'Round robin' : c.format === 'elim' ? 'Knockout' : c.format === 'bo3' ? 'Knockout, best of 3' : c.format === 'team5' ? 'Team exhibition' : 'One match';
  card.innerHTML = `<div class="cc-date">Week ${wk + 1}, month ${mo % 3 + 1}<em>${k === 0 ? 'This week' : k < 0 ? 'Done' : `In ${k} week${k > 1 ? 's' : ''}`}</em></div>
    <div class="cc-name">${c.name.replace(/ \([A-SF]\)$/, '')}</div>
    <div class="cc-row">${calRow(c) === 'F' ? 'Any grade' : `Grade ${calRow(c)}`} · ${fmt} · ${n} entries${c.official && c.grade === s.grade && s.grade !== 'S' ? ' · grade-up cup' : ''}</div>
    <div class="cc-row">Prize <b>${cupPurse(c).toLocaleString()} bits${c.prize ? ` and ${/^[AEIOU]/.test(c.prize) ? 'an' : 'a'} ${c.prize}` : ''}</b>${fee ? ` · Entry <b>${fee} bits</b>` : ''}</div>
    ${why ? `<div class="cc-no">${why}</div>` : signedFor(sel.w, c.name) ? '<div class="cc-row"><b>Signed up</b></div>' : ''}`;
  // Josie's read on this week's cups, worked out once per cup since it runs a few dozen fights off screen
  const tala = el('cal-tala'), key = sel.w + '|' + c.name;
  let adv = null; if (k === 0 && !why && typeof cupAdvice === 'function') adv = CAL.adv[key] !== undefined ? CAL.adv[key] : (CAL.adv[key] = cupAdvice(c, s));
  const low = fee && PLAYER.bits < fee;
  tala.innerHTML = low ? `<b>Josie</b>The ${c.name.replace(/ \([A-SF]\)$/, '')} costs ${fee} bits to enter, and we have ${PLAYER.bits}.` : adv ? `<b>Josie</b>${adv.t}` : '';
  const sure = !(adv && adv.weak) || CAL.sure === key;
  go.textContent = k === 0 ? `${sure ? 'Enter' : 'Enter anyway'}${fee ? ` · ${fee} bits` : ''}` : k < 0 ? 'Done' : signedFor(sel.w, c.name) ? 'Cancel sign-up' : 'Sign up';
  go.disabled = k < 0 || !!why || (k === 0 && low);
}
/* Enter takes the Snabit to the stadium for the cup. When Josie thinks the field is too strong, the first tap asks again */
function calEnter() {
  const sel = CAL && CAL.sel; if (!sel || !sel.c || sel.w < PLAYER.week) return;
  if (sel.w > PLAYER.week) { toggleSignup(sel.w, sel.c.name); calDraw(); return; }   // a cup weeks away: sign up for it, or cancel
  const key = sel.w + '|' + sel.c.name, adv = CAL.adv[key];
  if (adv && adv.weak && CAL.sure !== key) { CAL.sure = key; el('cal-go').textContent = `Yes, enter${cupFee(sel.c) ? ` · ${cupFee(sel.c)} bits` : ''}`; return; }
  const c = sel.c; closeCupCal(); CUP = null;
  const go = () => { openVenue(); startCup(c); const d = el('r-dusk'); if (d) { d.style.transition = 'none'; d.style.backgroundColor = 'transparent'; } };
  if (typeof smoothRanch === 'function' && smoothRanch() && !RS.busy) sceneFade(true, 500).then(go, go); else go();
}
