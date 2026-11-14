/* The info page, laid out like Monster Rancher 2's monster data: Status (stats, personality, ability, likes, how it's been
   raised, fatigue and stress), Skills (the 4 it fights with, picked from everything it has learned) and Record.
   Opens from the Info button or the name on the ranch, and from Care > Skills. Needs game.js and ranch.js. */
const INFO = { tab: 'status', slot: 0, filter: 'All', raf: 0 };
const INFO_EL = { Blaze: '#e24c3e', Brawl: '#e88c34', Spark: '#f2cf3c', Wild: '#76be5c', Frost: '#78d6e0', Tide: '#4682dc', Venom: '#9660ce',
  Charm: '#f496be', Stone: '#a07a56', Light: '#f4f0e2', Steel: '#aab2c0', Shade: '#5a5070', Void: '#3a2a5a' };
const INFO_STAT_COL = ['#57dd96', '#ff8a4c', '#9aa6cf', '#b088f0', '#ffd36e', '#5cb8ff'];
const INFO_RANK_COL = { S: '#ff7aa2', A: '#ffc93c', B: '#57dd96', C: '#a6a4b8', D: '#75738a', E: '#4a506c' };
const INFO_STAT_KEY = { hp: 'HP', sta: 'Stamina', pow: 'Power', grd: 'Constitution', mnd: 'Mind', spr: 'Insight', spd: 'Speed', acc: 'Accuracy', eva: 'Dodge' };
const elChip = (e, label) => `<span class="i-el" style="background:${INFO_EL[e] || '#a6a4b8'};color:${['Shade', 'Void', 'Blaze', 'Tide', 'Venom'].includes(e) ? '#fff' : '#1a1208'}">${label || e}</span>`;

function openInfo(tab) {
  if (typeof syncRead === 'function') syncRead();
  const s = RS; if (!s || s.busy) return;
  INFO.tab = tab || INFO.tab || 'status'; INFO.slot = 0; INFO.filter = 'All';
  let d = el('info');
  if (!d) { d = document.createElement('div'); d.id = 'info'; document.body.appendChild(d); }
  d.style.display = 'flex'; drawInfo();
}
function closeInfo() { const d = el('info'); if (d) d.style.display = 'none'; cancelAnimationFrame(INFO.raf); if (RS) { fixEquip(RS); saveGame(); drawUI(); } }

function drawInfo() {
  const s = RS, d = el('info'); cancelAnimationFrame(INFO.raf);
  const tabs = [['status', 'Status'], ['skills', 'Skills'], ['record', 'Record']];
  d.innerHTML = `<div class="i-top"><h2>${s.m.name}</h2><button class="iconbtn" id="i-x" aria-label="Close">✕</button></div>
    <div class="i-tabs">${tabs.map(([k, n]) => `<button class="i-tab ${INFO.tab === k ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}</div>
    <div class="i-body">${INFO.tab === 'skills' ? infoSkills(s) : INFO.tab === 'record' ? infoRecord(s) : infoStatus(s)}</div>`;
  el('i-x').onclick = closeInfo;
  d.querySelectorAll('.i-tab').forEach(b => b.onclick = () => { INFO.tab = b.dataset.t; drawInfo(); });
  if (INFO.tab === 'status') infoPortrait(s);
  if (INFO.tab === 'skills') bindSkills(s);
}

/* ---------- Status ---------- */
function meter(v, max, words) {
  const n = Math.min(5, Math.round(v / max * 5)), cls = n <= 1 ? 'f' : n <= 3 ? 'w' : 'h';
  return `<span class="i-meter">${[0, 1, 2, 3, 4].map(k => `<i class="${k < Math.max(1, n) ? cls : ''}"></i>`).join('')}<span>${words}</span></span>`;
}
function tasteLine(s, t) {
  const T = t === 'like' ? s.likeT : s.disT;
  if (!T || !(s.found || {})[t]) return `<span class="i-q">Not found yet</span>`;
  const what = T.k === 'meal' ? 'meal' : T.k === 'drill' ? 'drill' : T.k === 'snack' ? 'snack' : T.k === 'item' ? 'to wear' : '';
  return `${tasteName(T)} ${t === 'like' ? '♥' : '✕'}${what ? ` <small>(${what})</small>` : ''}`;
}
function infoStatus(s) {
  const m = s.m, base = FAMILY[m.family].base, h = hearts(), cm = typeof heightCm === 'function' ? heightCm(m, s.stage) : null;
  const stats = STATS.map((st, i) => { const v = shownStat(i), r = rankOf(base[i]);
    return `<div class="i-stat"><span>${st}</span><span class="i-r" style="background:${INFO_RANK_COL[r]};color:${'DE'.includes(r) ? '#fff' : '#1a1208'}">${r}</span><span class="i-bar"><i style="width:${Math.min(100, v / 2)}%;background:${INFO_STAT_COL[i]}"></i></span><span class="i-n">${v}</span></div>`; }).join('');
  const P = m.pers, lean = Math.max(4, Math.min(96, 50 + (s.fear - s.spoil)));
  const raised = spoiled() ? 'Spoiled' : scared() ? 'Strict' : 'Balanced';
  const fat = s.fatigue < 20 ? 'Fresh' : s.fatigue < 50 ? 'A bit tired' : s.fatigue < 70 ? 'Tired' : s.fatigue < 90 ? 'Worn out' : 'Exhausted';
  const str = s.stress < 15 ? 'Relaxed' : s.stress < 35 ? 'A bit tense' : s.stress < 55 ? 'Stressed' : 'Very stressed';
  const cond = s.injured ? 'Injured' : s.sick ? 'Has a cold' : typeof fedToday === 'function' && !fedToday(s) ? 'Hungry, no meal yet today' : 'Healthy';
  const looks = [s.stage !== 'Bit' && s.mark >= 0 ? MARK[s.mark][0] : null, s.stage === 'Mega' && s.mark2 != null && s.mark2 >= 0 ? MARK[s.mark2][0] : null, s.variant].filter(Boolean);
  return `<div class="i-hero"><canvas class="i-port" id="i-port"></canvas><div class="i-id">
      <b>${s.stage === 'Bit' ? m.family : `${s.variant && s.variant !== 'Scruffy' ? s.variant + ' ' : ''}${MARK[s.mark][0]} ${m.family}`}</b>
      <div class="i-chips">${elChip(m.el1)}${m.el2 && m.el2 !== m.el1 ? elChip(m.el2) : ''}<span class="i-fam">${m.family}</span></div>
      <span class="i-big">${s.stage} · Lv ${s.level} · Grade ${s.grade}</span>
      <span>${ageText(s)}</span>
      <span>${cm ? heightText(cm) + ' · ' : ''}${shapeOf(s.weight)[0]} build</span>
      <span class="i-hearts">${'♥'.repeat(h)}${'♡'.repeat(5 - h)}</span></div></div>
    <div class="i-card">${stats}</div>
    <div class="i-card i-rows">
      <span class="k">Personality</span><span><b>${P[0]}</b> · ${STATS[P[1]]} +10%, ${STATS[P[2]]} −10%</span>
      <span class="k">Ability</span><span><b>${m.ability[0]}</b> · ${m.ability[1].charAt(0).toLowerCase() + m.ability[1].slice(1)}</span>
      <span class="k">Likes</span><span>${tasteLine(s, 'like')}</span>
      <span class="k">Dislikes</span><span>${tasteLine(s, 'dis')}</span>
      <span class="k">Raised</span><span><div class="i-lean"><b style="left:calc(${lean}% - 3px)"></b></div><div class="i-ends"><span>Spoiled</span><span>${raised}</span><span>Strict</span></div></span>
      <span class="k">Fatigue</span>${meter(s.fatigue, 100, fat)}
      <span class="k">Stress</span>${meter(s.stress, 70, str)}
      <span class="k">Condition</span><span>${cond}</span>
      ${looks.length ? `<span class="k">Look</span><span>${looks.join(', ')}</span>` : ''}
    </div>
    <div class="i-talk"><span class="who">Tala</span>${condition()}${s.stress > 45 ? ' It seems tense, so a rest would help.' : ''}</div>`;
}
function infoPortrait(s) {
  const cv = el('i-port'); if (!cv) return;
  const smooth = typeof chibiSpec === 'function' && chibiSpec(null, s);
  const draw = t => { if (!el('i-port')) return; paintMon(cv, { ...s.m, pal: s.pal || s.m.pal }, { s, grid: s.grid || s.m.grid, scale: (s.grid || s.m.grid).length > 20 ? 3 : 6, size: 128, t }); if (smooth) INFO.raf = requestAnimationFrame(draw); };
  draw(performance.now());
}

/* ---------- Skills ---------- */
function skillBits(sk) {
  const b = [];
  if (sk.power) b.push(sk.hits ? `${sk.power} × ${sk.hits}` : `${sk.power} power`);
  b.push(`${sk.cost} energy`);
  return b.join(' · ');
}
function skillNote(sk) {
  const n = [], st = o => Object.keys(o).map(k => INFO_STAT_KEY[k] || k).join(' and ');
  if (sk.first) n.push('goes first');
  if (sk.status) n.push(`${sk.status[1]}% to ${sk.status[0]}`);
  if (sk.raise) n.push(`${st(sk.raise)} up ${Math.max(...Object.values(sk.raise))} step${Math.max(...Object.values(sk.raise)) > 1 ? 's' : ''}`);
  if (sk.lower) n.push(`${sk.lowerChance && sk.lowerChance < 100 ? sk.lowerChance + '% to lower ' : 'lowers '}${st(sk.lower)}`);
  if (sk.selfLower) n.push(`lowers its own ${st(sk.selfLower)}`);
  if (sk.pierce) n.push('breaks through Guard');
  if (sk.charge) n.push('fires next turn');
  if (sk.drain) n.push(`heals ${Math.round(sk.drain * 100)}% of the damage`);
  if (sk.recoil) n.push(`takes ${Math.round(sk.recoil * 100)}% back`);
  if (sk.heal) n.push(`heals ${Math.round(sk.heal * 100)}%`);
  if (sk.protect) n.push('blocks one hit');
  if (sk.counter) n.push('hits back');
  if (sk.field) n.push(`turns the field ${sk.field}`);
  if (sk.noDodge) n.push("can't be dodged");
  if (sk.hpScale) n.push('stronger at high HP');
  if (sk.rest) n.push('sleeps it off');
  if (sk.taunt) n.push('taunts');
  if (sk.regen) n.push('heals each turn');
  return n.slice(0, 2).join(', ');
}
function skillTag(n, sk) {
  if (sk.sig) return ['Signature', '#ffc93c', '#1a1208'];
  const e = sk.el, k = sk.kind;
  return [`${e ? e + ' ' : ''}${k}`, e ? INFO_EL[e] : '#a6a4b8', ['Shade', 'Void', 'Blaze', 'Tide', 'Venom'].includes(e) ? '#fff' : '#1a1208'];
}
function skillWhere(s, n) {
  const sk = SKILLS[n];
  if (sk.sig) return 'its own move';
  if ((s.learned || []).includes(n)) return 'from training';
  if (sk.chip) return 'from a chip';
  if (s.m.pool.includes(n)) return `learned at Lv ${sk.lv}`;
  return 'from a trip';
}
function infoSkills(s) {
  fixEquip(s);
  const eq = s.equip, known = knownSkills(s), uses = s.uses || {};
  const slots = [0, 1, 2, 3].map(i => { const n = eq[i];
    if (!n) return `<button class="i-slot empty ${INFO.slot === i ? 'sel' : ''}" data-s="${i}"><span class="no">${i + 1}</span>Empty</button>`;
    const sk = SKILLS[n], [tag, bg, fg] = skillTag(n, sk);
    return `<button class="i-slot ${INFO.slot === i ? 'sel' : ''}" data-s="${i}"><span class="no">${i + 1}</span><span class="i-kind" style="background:${bg};color:${fg}">${tag}</span>
      <b>${skillLabelOf(s, n)}${(uses[n] || 0) >= MASTERY ? ' ★' : ''}</b><small>${skillBits(sk)}</small><small>${skillNote(sk) || '&nbsp;'}</small></button>`; }).join('');
  const kinds = ['All', 'Strike', 'Cast', 'Support'];
  const list = known.filter(n => INFO.filter === 'All' || SKILLS[n].kind === INFO.filter || (INFO.filter === 'Support' && SKILLS[n].kind === 'Field'))
    .sort((a, b) => (eq.includes(b) - eq.includes(a)) || (SKILLS[b].sig ? 1 : 0) - (SKILLS[a].sig ? 1 : 0) || (SKILLS[b].power || 0) - (SKILLS[a].power || 0));
  const rows = list.map(n => { const sk = SKILLS[n], [, bg] = skillTag(n, sk), on = eq.includes(n);
    return `<button class="i-sk ${on ? 'eq' : ''}" data-k="${n}"><span class="dot" style="background:${bg}"></span><span><b>${skillLabelOf(s, n)}${(uses[n] || 0) >= MASTERY ? ' ★' : ''}</b>${on ? `<em>slot ${eq.indexOf(n) + 1}</em>` : ''}<small>${skillTag(n, sk)[0]} · ${[skillNote(sk), skillWhere(s, n)].filter(Boolean).join(' · ')}</small></span>
      <span class="pw">${sk.power ? (sk.hits ? sk.power + '×' + sk.hits : sk.power) : '–'}<small>${sk.cost} en</small></span></button>`; }).join('');
  return `<div class="i-slots">${slots}</div>
    <div class="i-talk"><span class="who">Tala</span>${eq[INFO.slot] ? `Slot ${INFO.slot + 1} is picked. Tap a skill below to put it there.` : `Slot ${INFO.slot + 1} is empty. Tap a skill below to fill it.`}</div>
    <div class="i-sec">Learned · ${known.length}</div>
    <div class="i-filters">${kinds.map(k => `<button class="${INFO.filter === k ? 'on' : ''}" data-f="${k}">${k}</button>`).join('')}</div>
    <div class="i-list">${rows || '<div class="i-q">Nothing of that kind yet.</div>'}</div>
    <div class="i-foot"><button class="small" id="i-book">Skill book</button></div>
    <div class="i-style"><b>Fight style.</b> ${styleText(s)}</div>`;
}
function bindSkills(s) {
  const d = el('info');
  d.querySelectorAll('.i-slot').forEach(b => b.onclick = () => { INFO.slot = +b.dataset.s; drawInfo(); });
  d.querySelectorAll('.i-filters button').forEach(b => b.onclick = () => { INFO.filter = b.dataset.f; drawInfo(); });
  d.querySelectorAll('.i-sk').forEach(b => b.onclick = () => {
    const n = b.dataset.k, eq = s.equip, at = eq.indexOf(n), i = INFO.slot;
    if (at === i) return;
    if (at >= 0) { eq[at] = eq[i]; eq[i] = n; if (!eq[at]) eq.splice(at, 1); }       // already in another slot: swap the two
    else if (i < eq.length) eq[i] = n; else eq.push(n);
    s.equip = eq.filter(Boolean).slice(0, 4); INFO.slot = Math.min(3, s.equip.indexOf(n) + 1); saveGame(); drawInfo();
  });
  el('i-book').onclick = () => { closeInfo(); openBook(); };
}

/* ---------- Record ---------- */
const INFO_ACT_COL = { Stamina: '#57dd96', Power: '#ff8a4c', Constitution: '#9aa6cf', Mind: '#b088f0', Insight: '#ffd36e', Speed: '#5cb8ff', Rest: '#3a3f58', Trip: '#7a62b8', Mission: '#7a62b8', Cup: '#ffc93c' };
function infoRecord(s) {
  const uses = s.uses || {}, top = Object.entries(uses).sort((a, b) => b[1] - a[1])[0], mastered = Object.keys(uses).filter(n => uses[n] >= MASTERY);
  const born = s.born != null ? (() => { const w = s.born, mo = Math.floor(w / 4) % 12, y = Math.floor(w / 48) + 1; return `${SEASON[Math.floor(mo / 3)]}, Month ${mo % 3 + 1}, Week ${w % 4 + 1}${y > 1 ? `, Year ${y}` : ''}`; })() : '';
  const regions = Object.entries(s.stageRegions || {}).sort((a, b) => b[1] - a[1]).map(([r, w]) => `${r} (${w} wk)`).join(', ');
  const looks = [s.stage !== 'Bit' && s.mark >= 0 ? `${MARK[s.mark][0]} (${STATS[s.mark]}, at Byte)` : null, s.stage === 'Mega' && s.mark2 != null && s.mark2 >= 0 ? `${MARK[s.mark2][0]} (${STATS[s.mark2]}, at Mega)` : null, s.variant ? `${s.variant} (${VARIANT_TEXT[s.variant] || ''})` : null].filter(Boolean);
  const line = (k, v) => v ? `<div class="i-line"><span>${k}</span><span>${v}</span></div>` : '';
  const log = (s.log || []), weekNo = PLAYER.week - log.length;
  return `<div class="i-nums"><div><b>${s.wins || 0}</b><small>Wins</small></div><div><b>${s.losses || 0}</b><small>Losses</small></div><div><b>${(s.cups || []).length}</b><small>Cups</small></div></div>
    ${(s.cups || []).length ? `<div class="i-card"><div class="i-sec">Cups won</div><div class="i-cups">${s.cups.map(c => `<span>${typeof c === 'string' ? c : c.n || c.name || 'Cup'}</span>`).join('')}</div></div>` : ''}
    <div class="i-card">
      ${line('Fight style', styleText(s))}
      ${line('Favourite move', top ? `${top[0]} (${top[1]} uses)` : '')}
      ${line('Mastered', mastered.map(n => n + ' ★').join(', '))}
      ${line('Trips', regions)}
      ${line('Marks', looks.join('; '))}
      ${line('Born', born)}
    </div>
    <div class="i-card"><div class="i-sec">Last ${Math.max(1, log.length)} week${log.length === 1 ? '' : 's'}</div>
      ${log.length ? `<div class="i-log">${log.map((a, k) => `<div><span style="background:${INFO_ACT_COL[a] || '#3a3f58'};color:${['Rest', 'Trip', 'Mission'].includes(a) ? '#f5f0e2' : '#11121a'}">${a}</span><small>W${weekNo + k + 1}</small></div>`).join('')}</div>` : '<div class="i-q">Nothing logged yet. Each week it trains, rests or travels shows up here.</div>'}</div>`;
}
