/* The Hall of Fame. A Snabit can retire from the Freezer once it's grown past Bit or reached the end of its lifespan.
   It turns to stone on a plinth in a short ceremony, a statue of it stands behind the yard fence (the newest three),
   and the next fresh Snabit raised starts with one move it taught and a tenth of its training.
   Needs ranch.js, lab.js, cupshow.js and summon.js. */
function hallList() { if (!PLAYER.hall) PLAYER.hall = []; return PLAYER.hall; }
const HALL_SPEC = new Map();
function hallSpec(h) { if (!HALL_SPEC.has(h.id)) HALL_SPEC.set(h.id, typeof SUMMON !== 'undefined' ? SUMMON.specFor(h.m, h.st) : null); return HALL_SPEC.get(h.id); }
function canRetire(e) { const st = entryState(e); return (st.stage && st.stage !== 'Bit') || (st.used || 0) >= (e.m.lifespan || 99) * 4; }
function hallBest(st) {   // its latest cup win, which is usually its biggest, for the plaque
  const cups = st.cups || []; return cups.length ? cups[cups.length - 1] : null; }

/* the ranch: the newest three statues stand behind the fence between the bowl and the tree */
function hallStatues(c, t) {
  const L = (PLAYER && PLAYER.hall || []).slice(-3); if (!L.length || typeof CUPSHOW === 'undefined') return;
  L.forEach((h, i) => { const x = 122 + i * 28, base = GROUND - 22, sp = hallSpec(h); if (!sp) return;
    SC.depth(c, () => { c.beginPath(); c.roundRect(x - 9, base, 18, 7, 2); }, '#b9b4a8', 1, 0.3);
    if (h.gone) { c.save(); c.translate(x, base - 7); c.scale(0.5, 0.5); stoneGlyph(c, h.m.family); c.restore(); return; }   // a horror's statue goes after 4 weeks and leaves its stone (horror.js)
    c.save(); c.filter = 'grayscale(1) brightness(1.08) contrast(.85)'; CUPSHOW.mon(c, sp, x, base, 20, 'idle', 0, false); c.restore(); });
}

/* the Freezer's retire button opens this */
function retirePick(e) {
  const st = entryState(e), s = RS && RS.id === e.id ? RS : newRanch(e), nm = entryName(e);
  const skills = (typeof knownSkills === 'function' ? knownSkills(s) : (st.skillsKnown || [])).filter(n => SKILLS[n]);
  panel(`<div class="full lab-head"><b>Retire ${nm}</b><button class="small" id="rt-back">Back</button></div>
    <div class="full lab-info">${nm} goes into the Hall of Fame and spends its days in the League's meadow. Before it leaves, it can show the next Snabit you raise one of its moves.</div>
    ${skills.map(n => `<button class="rb" data-k="${n}">${n}<small>${SKILLS[n].el || 'Neutral'} · ${SKILLS[n].kind || 'move'}</small></button>`).join('')}
    <button class="rb" data-k="">No move<small>Retire it without passing one on</small></button>`);
  el('rt-back').onclick = openFreezer;
  el('r-panel').querySelectorAll('[data-k]').forEach(b => b.onclick = () => retireNow(e, b.dataset.k || null));
}
async function retireNow(e, skill) {
  if (RS && RS.id === e.id) { saveGame(); }
  const s = RS && RS.id === e.id ? RS : newRanch(e), st = RS && RS.id === e.id ? packRanch(RS) : (e.st || {}), nm = displayName(s);
  const h = { id: e.id, name: nm, m: e.m, st: { stage: s.stage, mark: s.mark, mark2: s.mark2, pal: s.pal, worn: s.worn, variant: s.variant, grid: s.grid },
    level: s.level, grade: s.grade, wins: s.wins || 0, losses: s.losses || 0, best: hallBest(st), weeks: s.used || 0, week: PLAYER.week, skill };
  hallList().push(h);
  PLAYER.legacy = { from: e.m.name, skill, tp: (s.tp || []).map(v => Math.round(v * 0.1)) };
  PLAYER.roster = PLAYER.roster.filter(r => r.id !== e.id);
  if (PLAYER.active === e.id) { PLAYER.active = PLAYER.roster.length ? PLAYER.roster[0].id : null; RS = null; }
  const L = stoneList(), mum = L && !L.includes('Mummy'); if (mum) L.push('Mummy');
  saveGame(); panel('');
  if (typeof CUPSHOW !== 'undefined' && hallSpec(h) && hallSpec(h).family) await CUPSHOW.run([hallBeat(h)]);
  if (PLAYER.roster.length) openRanch(); else { closeRanch(); openScope(); }
  if (RS) say(`${h.name.split(',')[0]}'s statue is up behind the fence.${mum ? ' Someone left a painted stone at the foot of it.' : ''}${RS.say && RS.say !== 'Welcome back.' && !/^This is the ranch/.test(RS.say) ? ' ' + RS.say : ''}`);
}
/* the ceremony: dusk, the Snabit on a plinth turns to stone from the feet up, and the plaque comes in */
function hallBeat(h) {
  const sp = hallSpec(h), rec = `${h.wins} wins, ${h.losses} losses${h.best ? ` · ${h.best.replace(/ \([A-SF]\)$/, '')}` : ''}`;
  return { who: 'tala', face: 'happy', textAt: 3600, mus: null, jingle: true,
    text: `${h.name.split(',')[0]} gave us ${Math.max(1, Math.round(h.weeks / 4))} month${h.weeks >= 8 ? 's' : ''} and ${h.wins} wins. It's earned a rest.`,
    draw(c, W, H, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b2a5a'); g.addColorStop(0.55, '#e98a5c'); g.addColorStop(1, '#f4c27a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const gy = H * 0.6; c.fillStyle = '#5b7a3c'; c.fillRect(0, gy, W, H - gy); c.fillStyle = '#6e8f47'; c.beginPath(); c.ellipse(W / 2, gy, W * 0.7, 26, 0, Math.PI, 0); c.fill();
      // the plinth rises, the Snabit stands on it, and stone creeps up it
      const pk = Math.min(1, Math.max(0, (t - 300) / 700)), ph = 70 * (1 - Math.pow(1 - pk, 3)), top = gy - ph, x = W / 2, px = 150;
      SC.depth(c, () => { c.beginPath(); c.roundRect(x - 70, top, 140, ph + 10, 6); }, '#cfc8b8', 3, 0.28);
      if (pk > 0.6) { c.fillStyle = '#7a6a4a'; c.font = '700 13px Pix, monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(h.name.split(',')[0], x, top + ph * 0.4, 130); }
      const sk = Math.min(1, Math.max(0, (t - 1300) / 1800));   // 0 = all colour, 1 = all stone
      CUPSHOW.mon(c, sp, x, top, px, sk < 1 ? 'happy' : 'idle', sk < 1 ? t : 0, false);
      if (sk > 0) { const cut = top - px * 1.15 * sk; c.save(); c.beginPath(); c.rect(0, cut, W, top - cut + 2); c.clip(); c.filter = 'grayscale(1) brightness(1.05) contrast(.85)';
        CUPSHOW.mon(c, sp, x, top, px, sk < 1 ? 'happy' : 'idle', sk < 1 ? t : 0, false); c.restore();
        if (sk < 1) { c.fillStyle = 'rgba(255,248,220,.8)'; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(x - 60 + i * 17, cut + Math.sin(t / 90 + i) * 3, 2.5, 0, 7); c.fill(); } } }
      if (sk >= 1) { const a = Math.min(1, (t - 3100) / 500); c.save(); c.globalAlpha = a;
        c.fillStyle = 'rgba(20,16,30,.55)'; c.beginPath(); c.roundRect(W / 2 - 150, H * 0.12, 300, 64, 10); c.fill();
        c.fillStyle = '#ffc93c'; c.font = '700 20px Pix, monospace'; c.textAlign = 'center'; c.fillText('Hall of Fame', W / 2, H * 0.12 + 24);
        c.fillStyle = '#fff6d8'; c.font = '500 13px system-ui'; c.fillText(rec, W / 2, H * 0.12 + 48, 284); c.restore();
        for (let i = 0; i < 14; i++) { const k = ((t - 3100) / 1600 + i / 14) % 1; c.fillStyle = i % 2 ? '#ffd23f' : '#fff'; c.globalAlpha = Math.sin(k * Math.PI); c.beginPath(); c.arc(x - 80 + (i * 37) % 160, top - k * 160, 2.2, 0, 7); c.fill(); } c.globalAlpha = 1; }
    } };
}
/* a fresh Snabit picks up what the last one to retire left it */
function applyLegacy(s) {
  const L = PLAYER.legacy; if (!L) return null; PLAYER.legacy = null;
  s.tp = s.tp.map((v, i) => v + (L.tp[i] || 0));
  if (L.skill && SKILLS[L.skill]) { s.skillsKnown = [...new Set((s.skillsKnown || []).concat(L.skill))]; return `${L.from} spent its last week here showing it ${L.skill}.`; }
  return `${L.from} spent its last week here showing it the ropes.`;
}
/* the list, from the Out menu */
function openHall_() {
  const L = hallList().slice().reverse();
  panel(`<div class="full lab-head"><b>Hall of Fame</b><button class="small" id="hf-back">Back</button></div>` +
    L.map(h => `<div class="rb full" style="text-align:left;cursor:default"><b>${h.name}</b><small>Lv ${h.level} · grade ${h.grade} · ${h.wins}-${h.losses}${h.best ? ` · won the ${h.best.replace(/ \([A-SF]\)$/, '')}` : ''} · ${Math.max(1, Math.round(h.weeks / 4))} month${h.weeks >= 8 ? 's' : ''}</small></div>`).join(''));
  el('hf-back').onclick = () => menu('Out');
}
