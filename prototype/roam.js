/* The Drifter: one Snabit in colours no scan gives, wandering the regions. From grade D it can turn up in a wild scan
   now and then, and an expedition into the region it's near that week is more likely to meet it. Each week it moves
   on to another region. Beat it and it follows you home, and after that it's gone from the wild.
   The bestiary notes where and when it was last seen. Needs wild.js, explore.js and missions.js (REGIONS). */
function roamState() {
  if (!PLAYER || rankIdx() < 1) return null;
  if (!PLAYER.roam) {
    const R = rng(hashStr('drifter|' + (PLAYER.nextId || 1) + '|' + PLAYER.week)), shut = Object.keys(LICENCE).filter(f => typeof famOpen === 'function' && !famOpen(f));
    const fam = shut.length ? shut[Math.floor(R() * shut.length)] : ['Chomp', 'Skit', 'Booly', 'Stilt'][Math.floor(R() * 4)];
    const m = randomOpponent(R, fam), sh = c => { const [h, sa, v] = rgbToHsv(c); return hsvToRgb([(h + 200) % 360, Math.min(1, sa * 1.1), Math.min(1, v * 1.05)]); };
    m.pal = { ...m.pal, body: sh(m.pal.body), parts: sh(m.pal.parts), accent: [255, 214, 90] };
    m.stats = m.stats.map(v => Math.round(v * 1.15)); m.lifespan = (m.lifespan || 12) + 4; m.drifter = true;
    PLAYER.roam = { m, caught: false, seen: null };
  }
  return PLAYER.roam.caught ? null : PLAYER.roam;
}
/* the region it's near this week, from the regions open to expeditions */
function roamAt(w = PLAYER.week) { const L = (typeof exRegions === 'function' ? exRegions() : REGIONS).filter(r => !r.rift); return L[hashStr('drift|' + w) % L.length].n; }
/* a fight-ready copy, a little stronger than the Snabit it meets */
function roamFoe(s, R) {
  const D = roamState(); if (!D) return null; const m = D.m, level = s.level + 2;
  const total = Math.round(s.tp.reduce((a, b) => a + b, 0) * 1.1 + 20), focus = Math.floor(R() * 6), tp = [0, 0, 0, 0, 0, 0];
  for (let k = 0; k < total; k++) tp[R() < 0.5 ? focus : Math.floor(R() * 6)]++;
  const st = { m, tp, stage: s.stage, mark: -1, level, grid: m.grid, pal: m.pal };
  if (s.stage !== 'Bit') { st.mark = focus; st.grid = scale2x(addMark(m.grid, focus)); }
  const fm = fightMon(st), open = m.pool.filter(n => SKILLS[n].lv <= level), lo = aiLoadout(m, level, R);
  while (lo.length < slotsFor(st) && open.some(n => !lo.includes(n))) lo.push(open.find(n => !lo.includes(n)));
  D.seen = { w: PLAYER.week, at: roamAt() };
  return { m, fm, level, skills: lo.filter(Boolean), stage: st.stage, mark: st.mark, earned: total, shiny: true, drifter: true };
}
/* a wild scan meets it about one time in eight, once a week at most */
function roamInScan(s, R) { const D = roamState(); if (!D || D.fought === PLAYER.week || R() > 0.125) return null; D.fought = PLAYER.week; return roamFoe(s, R); }
/* an expedition's wild Snabit is the Drifter half the time when the region is where it's been seen this week */
function roamInRegion(s, reg, R) { const D = roamState(); if (!D || D.fought === PLAYER.week || roamAt() !== reg.n || R() > 0.5) return null; D.fought = PLAYER.week; return roamFoe(s, R); }
/* after a fight with it: a win and it follows you home */
function roamResult(won) {
  const D = PLAYER.roam; if (!D || D.caught) return '';
  if (!won) return 'It got away, so keep an ear out for where it turns up next.';
  const e = addToRoster(JSON.parse(JSON.stringify(D.m))); if (!e) return "It wanted to come home with you, but the Freezer's full, so it wandered off.";
  D.caught = true; saveGame(); return `It's following you home! The ${D.m.name} with the strange colours is in the Freezer now.`;
}
/* the bestiary's line about it */
function roamDexLine() {
  const D = PLAYER && PLAYER.roam; if (!D || !D.seen) return '';
  if (D.caught) return ` The ${D.m.name} with the strange colours lives at the ranch now.`;
  const { mo, wk } = weekParts(D.seen.w); return ` A ${D.m.name} in strange colours was last seen near ${D.seen.at} in ${SEASON[Math.floor(mo / 3)]}, month ${mo + 1}, week ${wk + 1}.`;
}
