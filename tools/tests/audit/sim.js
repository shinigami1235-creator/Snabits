/* Balance simulator. It runs in the game's own page and plays whole lives with the game's own functions (runDrill, runRest,
   endWeek, startCup, finishCup, wildFight, giveExp and the rest). Only three things are swapped out: the waits and walks that
   pace a scene on screen are instant, a fight on screen is worked out with the game's arSim (what Auto fights and the cup's
   other matches already use), and the cup's ceremony screens are skipped. No formula is copied here. */
window.SIM = (() => {
  const tick = () => new Promise(r => setTimeout(r, 0));
  function fast() {
    if (window.__simFast) return; window.__simFast = true;
    rwait = async (ms, id = RS.cur) => { if (id !== RACT) throw RSTOP; };
    walkTo = (x, sp, pose, id = RS.cur) => { if (id !== RACT) return Promise.reject(RSTOP); RS.x = x; return Promise.resolve(); };
    hop = () => Promise.resolve(); until = async () => {}; spark = () => {}; rsfx = () => {};
    const react = praiseOrScold; praiseOrScold = res => { const p = react(res); const b = document.getElementById('r-pr'); if (b && REACT[res]) b.click(); return p; };   // praise a great, scold a slack, console a fail
    const pv = pickVariant; pickVariant = list => { const p = pv(list); const b = document.querySelector('#r-panel [data-v]'); if (b) b.click(); return p; };
    const yn = askYesNo; askYesNo = (q, y, n) => { const p = yn(q, y, n); const b = document.getElementById('yn-n'); if (b) b.click(); return p; };
    // a fight: the same result object the fight screen hands back, from the game's off-screen arena
    arenaFight = ({ s, foe, mode, noDraw, record, learn, rand = Math.random, onEnd }) => {
      if (record) s.fightNo = (s.fightNo || 0) + 1;
      const f = arSim(arPlayer(s), arFoe(foe), rand, noDraw), lines = learn ? afterFight(s, f.p[0], true) : [];
      const tz = s.likeT ? taste('battle', null, s) : null; if (tz) { tasteFound(tz, s); s.stress = Math.max(0, s.stress + (tz === 'like' ? -4 : 6)); s.spoil += tz === 'like' ? 2 : -1; }
      SIM.fights.push([s.grade, f.winner, f.secs, f.judged]);
      onEnd({ winner: f.winner, turns: f.secs, secs: f.secs, judged: f.judged, hpLeft: f.p[0].hp / f.p[0].maxhp, foeHpLeft: f.p[1].hp / f.p[1].maxhp, learned: lines });
    };
    matchCard = opp => { CUP.opp = opp; CUP.view = 'match'; const c = CUP.c; arenaFight({ s: RS, foe: CUP.field[opp].o, mode: 'auto', title: c.name, noDraw: c.format !== 'robin', learn: true, rand: CUP.R, onEnd: res => afterMatch(opp, res) }); };
    cupAfterShow = null; cupPodiumShow = null; cupBeforeShow = null; venueCeremony = done => done();
    musJingle = () => {}; if (typeof MUS !== 'undefined') MUS.on = false;
    injectVenue(); clearInterval(RIDLE);
  }
  async function idle() { for (let k = 0; k < 20000 && RS.busy; k++) await tick(); if (RS.busy) throw new Error('scene never ended: ' + RS.say); }
  /* a scan result shaped like the ones randomOpponent builds, for wild fights */
  function randRes(R) { const g = Object.keys(EL), pick = () => g[Math.floor(R() * g.length)], main = pick(); let second = pick(); while (second === main) second = pick(); let third = pick(); while (third === main || third === second) third = pick();
    const mono = R() < 0.35, hex = h => [1, 3, 5].map(k => parseInt(COL[h].slice(k, k + 2), 16)), r = (n, w) => ({ g: n, w, raw: w, cd: 0.3, rgb: hex(n) }), ranked = [r(main, mono ? 70 : 45), r(second, mono ? 15 : 30), r(third, 10)], colours = 3 + Math.floor(R() * 6);
    return { ranked, main: ranked[0], second: mono ? null : ranked[1], mono, tie: false, colours, pool: colours + 4, cells: Array.from({ length: 9 }, () => R()), sat: 0.2 + R() * 0.6, bright: 0.3 + R() * 0.6, contrast: 0.1 + R() * 0.25, photoKey: 'sim' + Math.floor(R() * 1e9) }; }
  function start(fam, seed, o = {}) {
    fast(); const R = rng(seed); PLAYER = newPlayer(); RS = null; PLAYER.tutorialDone = true; PLAYER.onboarded = true;
    let a = seed * 7919 + 13; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const m = o.mon || randomOpponent(R, fam); openRanch(m); RS.noScenes = true; SIM.fights = []; return R;
  }
  const money = { cup: 0, wild: 0, yard: 0, meal: 0, trip: 0, contest: 0, other: 0 };
  async function act(kind, fn) { const b0 = PLAYER.bits; await fn(); await idle(); money[kind] = (money[kind] || 0) + PLAYER.bits - b0; }
  /* one life from hatch to the end of its lifespan, on a plain sensible plan:
     the week's wild fights while it's fresh enough (none on a cup week), the cup of its grade each month and the official cup when
     Josie gives it a fair chance, a rest when it's tired or tense, the week before the official cup kept free of cups and wild fights
     (a rest if it isn't in top shape), and otherwise a drill in one of its family's better stats. */
  async function life(fam, seed, P = {}) {
    const p = { restAt: 50, stressAt: 35, wildMax: 3, wildFat: 40, heavy: true, cupOdds: 0.4, mealEvery: 8, maxWeeks: 260, afterS: 0, ...P };
    const R = start(fam, seed, P); for (const k in money) money[k] = 0;
    const s0 = RS, base = FAMILY[RS.m.family].base, order = base.map((v, i) => [RANK_PTS[rankOf(v)], v, i]).sort((x, y) => y[0] - x[0] || y[1] - x[1]).map(x => x[2]), plan = [order[0], order[1], order[0], order[2], order[1], order[3]];
    const out = { fam: RS.m.family, lifeWeeks: lifeWeeks(), grades: {}, counts: { drill: 0, heavy: 0, rest: 0, cup: 0, cupWon: 0, official: 0, officialWon: 0, wild: 0, wildWon: 0, great: 0, fail: 0, slack: 0, hurt: 0, cold: 0, strain: 0 }, cups: {}, track: [] };
    let k = 0, sAt = null;
    while (PLAYER.week < p.maxWeeks) {
      const s = RS; if (s !== s0) throw new Error('lost the Snabit');
      if (s.used >= lifeWeeks() && sAt == null) break; if (sAt != null && PLAYER.week - sAt >= p.afterS) break;
      const w0 = PLAYER.week, u0 = s.used;
      if (p.mealEvery && k % p.mealEvery === 0 && PLAYER.bits >= 60) await act('meal', () => runMeal(2));
      await act('other', () => runCare('pet')); await act('other', () => runCare('play')); if (s.mess >= 60) await act('other', () => runCare('clean'));
      const mine = cupsThisWeek(s).filter(c => !c.open && !c.small && !c.qualifier && !c.exhibition && (c.grade === s.grade || c.major || c.legend));
      const offNext = cupsOfWeek(PLAYER.week + 1).some(c => c.official && c.grade === s.grade) && (s.grade !== 'S' || !s.majorInvite);
      // wild fights: exp and a few bits, at a cost in fatigue, so not on a cup week or the week before the official cup
      for (let n = 0; n < p.wildMax && !mine.length && !offNext && wildLeft(s) > 0 && !wildBlock(s) && s.fatigue < p.wildFat; n++) { const b0 = PLAYER.bits, w = s.wins; WILD = { s, seen: 0 }; WILD.foe = wildFrom(randRes(R), s, R); const nf = SIM.fights.length; wildFight(); await idle();
        money.wild += PLAYER.bits - b0; out.counts.wild++; if (SIM.fights[nf] && SIM.fights[nf][1] === 0) out.counts.wildWon++; }
      const cups = cupsThisWeek(s).filter(c => !c.open && !c.small && !c.qualifier && !c.exhibition), off = cups.find(c => c.official && c.grade === s.grade), big = cups.find(c => c.major || c.legend), reg = cups.find(c => !c.official && !c.major && !c.legend && c.grade === s.grade);
      let c = big || (off && (s.grade !== 'S' || !s.majorInvite) ? off : null) || (offNext ? null : reg), did = null;   // no monthly cup the week before the official one
      if (c && s.fatigue <= 60 && PLAYER.bits >= cupFee(c)) { const odds = cupOdds(c, s);
        if (odds == null || odds >= p.cupOdds) { const g = s.grade, key = (c.official ? 'official ' : c.major ? 'major ' : c.legend ? 'legend ' : 'regular ') + c.grade; const b0 = PLAYER.bits;
          openVenue(); startCup(c); await idle(); for (let j = 0; j < 2000 && !(CUP && CUP.done) ; j++) await tick(); await idle(); money.cup += PLAYER.bits - b0;
          const rec = out.cups[key] = out.cups[key] || { n: 0, won: 0, odds: 0 }; rec.n++; rec.odds += odds || 0; if (CUP.place === 1) rec.won++;
          out.counts.cup++; if (CUP.place === 1) out.counts.cupWon++; if (c.official) { out.counts.official++; if (CUP.place === 1) out.counts.officialWon++; }
          if (s.grade !== g) out.grades[s.grade] = PLAYER.week; did = 'cup'; } }
      if (!did) {
        if (s.fatigue >= p.restAt || s.stress >= p.stressAt || s.injured || s.sick || (offNext && fightCond(s).name !== 'Top shape' && s.fatigue > 15)) { await act('yard', runRest); out.counts.rest++; did = 'rest'; }
        else { const heavy = p.heavy && hearts() >= 2 && s.fatigue < 25 && s.fatigue + 2 * s.stress < 60 && k % 2 === 0, stat = plan[out.counts.drill % plan.length], i = heavy ? 6 + HEAVY.findIndex(h => h[1] === stat) : stat;
          const t0 = s.tp.slice(), inj = s.injured; let seen = null; const bn = banner; banner = (t, c2) => { if (/Great|Success|Fail|Slacked/.test(t)) seen = t; bn(t, c2); };
          await act('yard', () => runDrill(i)); banner = bn; out.counts.drill++; if (heavy) out.counts.heavy++;
          if (seen === 'Great!') out.counts.great++; else if (seen === 'Fail') out.counts.fail++; else if (seen === 'Slacked off') out.counts.slack++; if (s.injured && !inj) out.counts.hurt++; did = 'drill'; } }
      if (PLAYER.week === w0) throw new Error('week did not move after ' + did);
      if (s.used - u0 > PLAYER.week - w0 && !(s.injured && did === 'drill')) out.counts.strain += s.used - u0 - (PLAYER.week - w0);
      if (s.sick && !out._sick) out.counts.cold++; out._sick = !!s.sick;
      if (s.grade === 'S' && sAt == null) { sAt = PLAYER.week; if (!p.afterS) break; }
      out.minBits = Math.min(out.minBits == null ? 1e9 : out.minBits, PLAYER.bits); if (PLAYER.week <= 48) out.bitsYear1 = PLAYER.bits;
      if (k % 12 === 0) out.track.push([PLAYER.week, s.grade, s.level, tpTotal(), PLAYER.bits]);
      k++;
    }
    const s = RS; delete out._sick;
    return { ...out, weeks: PLAYER.week, used: s.used, grade: s.grade, level: s.level, tp: tpTotal(), tps: s.tp.slice(), bits: PLAYER.bits, money: { ...money }, wl: [s.wins, s.losses], stage: s.stage, hearts: hearts(), reachedS: sAt, majors: (s.majors || []).length, master: !!s.master };
  }
  /* a Snabit at par for a grade: the middle of the grade's level and training ranges, trained the way the plan above trains */
  function par(fam, grade, R, at = 0.5) { fast(); const G = GRADE_INFO[grade], m = randomOpponent(R, fam); PLAYER = newPlayer(); RS = null; PLAYER.tutorialDone = true; openRanch(m); const s = RS;
    s.level = Math.round(G.lv[0] + (G.lv[1] - G.lv[0]) * at); s.grade = grade; const total = Math.round(G.earned[0] + (G.earned[1] - G.earned[0]) * at);
    const base = FAMILY[fam].base, order = base.map((v, i) => [RANK_PTS[rankOf(v)], v, i]).sort((x, y) => y[0] - x[0] || y[1] - x[1]).map(x => x[2]), plan = [order[0], order[1], order[0], order[2], order[1], order[3]];
    for (let k = 0; k < total; k++) s.tp[plan[k % 6]]++; const evo = EVO_TOTAL[fam]; if (total >= evo[0]) { s.stage = 'Byte'; s.mark = order[0]; } if (total >= evo[1]) { s.stage = 'Mega'; s.mark2 = order[1]; } if (s.stage !== 'Bit') rebuildLook(s); fixEquip(s); return s; }
  /* how hard each grade's cups are for a Snabit at par: its share of single matches won, and of whole cups won */
  function cupTable(n = 6, at = 0.5) { const out = {}, R = rng(4242), fams = ['Chomp', 'Pinch', 'Stilt', 'Skit', 'Antik', 'Squib', 'Moko', 'Booly', 'Plod', 'Bipped', 'Fizz', 'Teep', 'Lern'];
    for (const g of GRADES) { const row = { regular: [0, 0], official: [0, 0] };
      for (let k = 0; k < n; k++) { const s = par(fams[(k * 5 + GRADES.indexOf(g)) % fams.length], g, R, at);
        for (const [kind, c] of [['regular', { grade: g, name: 'Par Cup (' + g + ')', format: 'robin', size: 4 }], ['official', { grade: g, name: 'Official ' + g + ' Cup', format: 'robin', size: 6, official: true }]]) {
          for (let j = 0; j < 12; j++) { const o = cupOpponent(c, s, R), f = arSim(arPlayer(s), arFoe(o), R, true); row[kind][1]++; if (f.winner === 0) row[kind][0]++; } } }
      out[g] = { regular: Math.round(100 * row.regular[0] / row.regular[1]), official: Math.round(100 * row.official[0] / row.official[1]) }; }
    return out; }
  /* what one drill gives and costs, straight from runDrill: each result forced in turn for a light and a heavy drill, on a
     Snabit in its prime with a clean slate, in its best-ranked stat and in its worst */
  async function drillTable(fam = 'Chomp') { const R = start(fam, 77), s = RS, base = FAMILY[fam].base, order = base.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0]).map(x => x[1]), out = [], roll = rollDrill;
    for (const [label, stat] of [['best stat', order[0]], ['worst stat', order[5]]]) for (const heavy of [false, true]) for (const res of ['great', 'success', 'fail', 'slack']) {
      s.used = Math.round(lifeWeeks() * 0.4); s.fatigue = 0; s.stress = 0; s.spoil = 50; s.fear = 50; s.weight = 0; s.injured = false; s.sick = 0; s.likeT = s.disT = { k: 'battle' }; s.tp = [50, 50, 50, 50, 50, 50]; s.weatherBonus = false; const tp = s.tp.slice(); rollDrill = () => res;   // no favourite or hated drill, so the plain numbers show
      await runDrill(heavy ? 6 + HEAVY.findIndex(h => h[1] === stat) : stat); await idle();
      out.push({ stat: label + ' (rank ' + rankOf(base[stat]) + ')', drill: heavy ? 'heavy' : 'light', result: res, gain: s.tp.map((v, i) => v - tp[i]).filter(v => v).join(' '), fatigue: s.fatigue, stress: s.stress }); }
    rollDrill = roll; return out; }
  return { fast, start, life, par, cupTable, drillTable, idle, fights: [], money };
})();
