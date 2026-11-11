/* Trip areas: a skill trip moves through four places in its region, one a week, the way MR2's expedition maps go
   from spot to spot. The first place is the region's own picture, the last is where its teacher lives, and each place
   has its own tasks. Tasks are [name, kind, stat]: the kind picks the animation in errantry.js and the stat decides how
   likely it goes well (0 HP, 1 Power, 2 Guard, 3 Mind, 4 Spirit, 5 Speed). Needs scenes.js and errantry.js. */
const A_ = (key, name, tasks, look = {}) => ({ key, name, tasks, look });
const TRIP_AREAS = {
  Blaze: [A_('trail', 'Ash road', [['Clear the fallen rocks', 'haul', 2], ['Search the ash for coins', 'search', 3]], { bush: '#5a4a44', dot: '#ffb347' }),
    A_('lava', 'Lava fields', [['Hop across the lava stones', 'cross', 5], ['Dodge the spitting vents', 'dodge', 5]], { stream: '#ff7a2a', foam: 'rgba(255,230,140,.9)' }),
    A_('obsidian', 'Obsidian cave', [['Find the way by the glow', 'puzzle', 3], ['Climb the glassy wall', 'climb', 1]], { ledge: '#3a2a3e' }),
    A_('crater', 'Crater rim', [['Train with the Ember Warden', 'lesson', -1]])],
  Brawl: [A_('trail', 'Dojo gate', [['Sweep the dojo yard', 'haul', 2], ['Kick the training post', 'drill', 1]]),
    A_('bamboo', 'Bamboo grove', [['Weave through the bamboo', 'dodge', 5], ['Find the hidden scroll', 'search', 3]], { bush: '#5fae4a', dot: '#f2e3b6' }),
    A_('steps', 'Stone steps', [['Run the thousand steps', 'climb', 1], ['Carry water up the stairs', 'haul', 2]], { ledge: '#a39a8a' }),
    A_('hall', "Master's hall", [['Train with the Old Master', 'lesson', -1]])],
  Spark: [A_('trail', 'Pylon road', [['Follow the humming wires', 'track', 4], ['Haul a spool of cable', 'haul', 2]]),
    A_('meadow', 'Storm meadow', [['Dodge the lightning', 'dodge', 5], ['Cross the flooded ditch', 'cross', 5]]),
    A_('shed', 'Generator shed', [['Fix the flickering panel', 'puzzle', 3], ['Push the stuck turbine', 'haul', 2]]),
    A_('rodhill', 'Lightning rod hill', [['Train with the Storm Herder', 'lesson', -1]])],
  Wild: [A_('trail', 'Forest edge', [['Forage for berries', 'search', 3], ['Follow the deer tracks', 'track', 4]]),
    A_('hollow', 'Mossy hollow', [['Cross the mossy creek', 'cross', 5], ['Find the glowing mushrooms', 'search', 3]], { bush: '#4f8a3a', dot: '#b0f0ff' }),
    A_('roots', 'Giant roots', [['Climb the giant roots', 'climb', 1], ['Dodge the falling acorns', 'dodge', 5]], { ledge: '#6b4a2e' }),
    A_('elder', 'Elder tree', [['Train with the Briar King', 'lesson', -1]])],
  Frost: [A_('trail', 'Snowfield trail', [['Wade the snowdrifts', 'track', 4], ['Dig out a buried pack', 'search', 3]], { bush: '#e8f3fb', dot: '#3b8fd0' }),
    A_('lake', 'Frozen lake', [['Fish through the ice', 'fish', 4], ['Cross the thin ice', 'cross', 5]], { stream: '#9fd3ef', foam: 'rgba(255,255,255,.9)', hole: '#2f6f9a' }),
    A_('cave', 'Ice cave', [['Find the way by echoes', 'puzzle', 3], ['Dodge falling icicles', 'dodge', 5]]),
    A_('summit', 'Summit hut', [['Train with the Frost Matron', 'lesson', -1]])],
  Tide: [A_('trail', 'Beach', [['Dig for shells', 'search', 3], ['Haul the stranded boat', 'haul', 2]], { bush: '#e3d39a', dot: '#ff8fb0' }),
    A_('pools', 'Tide pools', [['Catch a fish by hand', 'fish', 4], ['Hop the slippery rocks', 'cross', 5]], { hole: '#2f8fc4', stream: '#3aa9d9' }),
    A_('seacave', 'Sea cave', [['Follow the echo of the waves', 'puzzle', 3], ['Dodge the dripping stalactites', 'dodge', 5]]),
    A_('lighthouse', 'Lighthouse', [['Train with the Reef Keeper', 'lesson', -1]])],
  Venom: [A_('trail', 'Boardwalk', [['Cross the broken boards', 'cross', 5], ['Swat the marsh flies', 'drill', 5]], { stream: '#4f6a3a', foam: 'rgba(200,240,140,.7)' }),
    A_('bog', 'Bubbling bog', [['Dodge the popping bubbles', 'dodge', 5], ['Fish in the murky pool', 'fish', 4]], { hole: '#3f5a2a' }),
    A_('thicket', "Witch's thicket", [['Find the way through the thorns', 'puzzle', 3], ['Pick the glowcaps', 'search', 3]], { bush: '#3a4a2e', dot: '#c6ff6a' }),
    A_('mirehut', 'Mire hut', [['Train with the Bog Witch', 'lesson', -1]])],
  Charm: [A_('trail', 'Garden gate', [['Pick the ripe berries', 'search', 3], ['Carry the watering can', 'haul', 2]]),
    A_('maze', 'Rose maze', [['Find the way through the maze', 'puzzle', 3], ['Squeeze between the hedges', 'track', 4]], { bush: '#3f7a3a', dot: '#ff7aa2' }),
    A_('glade', 'Butterfly glade', [['Chase the butterflies', 'dodge', 5], ['Hop the lily pads', 'cross', 5]], { stream: '#7fc4e8' }),
    A_('pavilion', 'Moon pavilion', [['Train with the Dream Queen', 'lesson', -1]])],
  Stone: [A_('trail', 'Quarry road', [['Shift the boulder', 'haul', 2], ['Climb the quarry ledge', 'climb', 1]]),
    A_('arch', 'Rock arch', [['Dodge the falling pebbles', 'dodge', 5], ['Follow the old cart tracks', 'track', 4]]),
    A_('mine', 'Crystal mine', [['Find the vein of crystal', 'search', 3], ['Push the stuck cart', 'haul', 2]], { bush: '#5a5048', dot: '#b98cff' }),
    A_('sentinel', 'Sentinel peak', [['Train with the Stone Sentinel', 'lesson', -1]])],
  Light: [A_('trail', 'Temple stairs', [['Climb the temple stairs', 'climb', 1], ['Sweep the steps', 'haul', 2]], { ledge: '#e9dcb5' }),
    A_('court', 'Sun court', [['Meditate in the sun', 'fish', 4], ['Catch the light in a mirror', 'puzzle', 3]], { hole: '#ffe58a' }),
    A_('mirrors', 'Mirror hall', [['Find the real door', 'puzzle', 3], ['Dodge the light beams', 'dodge', 5]]),
    A_('altar', 'Dawn altar', [['Train with the Dawn Guardian', 'lesson', -1]])],
  Steel: [A_('trail', 'Scrapyard', [['Sort the scrap', 'search', 3], ['Lift a steel beam', 'haul', 2]], { bush: '#6a6e74', dot: '#ffb347' }),
    A_('conveyor', 'Conveyor floor', [['Ride the conveyor belts', 'cross', 5], ['Dodge the swinging hooks', 'dodge', 5]], { stream: '#4c535c', foam: 'rgba(255,200,100,.6)' }),
    A_('furnace', 'Furnace room', [['Feed the furnace', 'haul', 2], ['Read the gauges', 'puzzle', 3]]),
    A_('office', "Foreman's office", [['Train with the Foreman', 'lesson', -1]])],
  Shade: [A_('trail', 'Moor path', [['Follow the will-o-wisps', 'track', 4], ['Search the heather', 'search', 3]], { bush: '#3a4a3a', dot: '#b0c8ff' }),
    A_('stones', 'Standing stones', [['Read the old carvings', 'puzzle', 3], ['Climb the fallen stone', 'climb', 1]], { ledge: '#5a6070' }),
    A_('barrow', 'Fog barrow', [['Dodge the shadows', 'dodge', 5], ['Find the way through the fog', 'puzzle', 3]]),
    A_('moonwell', 'Moon well', [['Train with the Moor Shade', 'lesson', -1]])],
  Void: [A_('trail', 'Rift edge', [['Step across the cracks', 'cross', 5], ['Search the fallen stars', 'search', 3]], { stream: '#120a24', foam: 'rgba(200,170,255,.8)', bush: '#2b1b40', dot: '#6be4ff' }),
    A_('isles', 'Floating isles', [['Hop between the isles', 'cross', 5], ['Dodge the drifting rocks', 'dodge', 5]], { stream: '#3a1d5e', foam: 'rgba(200,170,255,.8)' }),
    A_('brokensky', 'Broken sky', [['Find the way out', 'puzzle', 3], ['Climb the floating stairs', 'climb', 1]], { ledge: '#5b3a8a' }),
    A_('heart', 'Rift heart', [['Train with the Rift Lord', 'lesson', -1]])],
};
/* who teaches at each region's last stop: a Mega in the region's colours */
const TEACHER = { Blaze: ['Ember Warden', 'Chomp'], Brawl: ['Old Master', 'Stilt'], Spark: ['Storm Herder', 'Antik'], Wild: ['Briar King', 'Moko'],
  Frost: ['Frost Matron', 'Squib'], Tide: ['Reef Keeper', 'Pinch'], Venom: ['Bog Witch', 'Skit'], Charm: ['Dream Queen', 'Booly'],
  Stone: ['Stone Sentinel', 'Chomp'], Light: ['Dawn Guardian', 'Stilt'], Steel: ['The Foreman', 'Antik'], Shade: ['Moor Shade', 'Booly'], Void: ['Rift Lord', 'Moko'] };

/* ---------- a small kit the pictures share ---------- */
const AK = {
  ground(c, col, lip) { const x0 = -40, w = RW + 80; c.fillStyle = lip || SC.light(col, 0.15); c.fillRect(x0, GROUND - 14, w, 5); c.fillStyle = col; c.fillRect(x0, GROUND - 10, w, 80); c.fillStyle = 'rgba(0,0,0,.07)'; c.fillRect(x0, GROUND - 10, w, 1); },
  fill(c, col) { c.fillStyle = col; c.fillRect(-40, GROUND - 400, RW + 80, 420); },
  glow(c, x, y, r, col) { const g = c.createRadialGradient(x, y, 0.5, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); },
  tree(c, x, h, leaf, trunk = '#5e3b23') { c.fillStyle = trunk; c.fillRect(x - 2.5, GROUND - 14 - h * 0.45, 5, h * 0.45);
    SC.depth(c, () => SC.blob(c, x, GROUND - 14 - h * 0.62, [[0, -h * 0.18, h * 0.24], [-h * 0.16, 0, h * 0.2], [h * 0.16, 0, h * 0.2]]), leaf, 1.5, 0.3); },
  pine(c, x, h, col, snow) { c.fillStyle = '#5e3b23'; c.fillRect(x - 1.5, GROUND - 56, 3, 10);
    for (let k = 0; k < 3; k++) { const y = GROUND - 50 - k * h * 0.28, w = h * (0.32 - k * 0.07); c.fillStyle = col; c.beginPath(); c.moveTo(x - w, y); c.lineTo(x, y - h * 0.42); c.lineTo(x + w, y); c.closePath(); c.fill();
      if (snow) { c.fillStyle = snow; c.beginPath(); c.moveTo(x - w * 0.4, y - h * 0.25); c.lineTo(x, y - h * 0.42); c.lineTo(x + w * 0.4, y - h * 0.25); c.closePath(); c.fill(); } } },
  rock(c, x, y, r, col) { SC.depth(c, () => { c.beginPath(); c.ellipse(x, y - r * 0.6, r, r * 0.7, 0, 0, 7); }, col, 1.2, 0.3); c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.95, r * 0.3, r * 0.15, -0.3, 0, 7); c.fill(); },
  cave(c, wall, rock, floor, drip) { AK.fill(c, wall);
    SC.depth(c, () => { c.beginPath(); c.moveTo(-40, GROUND - 400); c.lineTo(RW + 40, GROUND - 400); c.lineTo(RW + 40, GROUND - 120);
      for (let x = RW + 40; x >= -40; x -= 12) c.lineTo(x, GROUND - 124 + Math.sin(x / 9) * 6); c.closePath(); }, rock, 3, 0.3);
    for (let i = 0; i < 12; i++) { const x = i * 22 + 4, h = 12 + (i * 23) % 24; SC.depth(c, () => { c.beginPath(); c.moveTo(x - 5, GROUND - 124); c.lineTo(x + 5, GROUND - 124); c.lineTo(x, GROUND - 124 + h); c.closePath(); }, drip || rock, 1, 0.25); }
    AK.ground(c, floor); },
  room(c, wall, trim, floor, lines) { AK.fill(c, wall);
    if (lines) { c.strokeStyle = lines; c.lineWidth = 0.8; for (let x = -40; x < RW + 40; x += 16) { c.beginPath(); c.moveTo(x, GROUND - 400); c.lineTo(x, GROUND - 44); c.stroke(); } }
    c.fillStyle = trim; c.fillRect(-40, GROUND - 44, RW + 80, 30); c.fillStyle = SC.dark(trim, 0.15); c.fillRect(-40, GROUND - 44, RW + 80, 2.5);
    c.fillStyle = floor; c.fillRect(-40, GROUND - 14, RW + 80, 80); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1; for (let y = GROUND - 8; y < GROUND + 40; y += 9) { c.beginPath(); c.moveTo(-40, y); c.lineTo(RW + 40, y); c.stroke(); } },
  window(c, x, y, w, h, sky, frame = '#6a4226') { SC.depth(c, () => { c.beginPath(); c.roundRect(x - 3, y - 3, w + 6, h + 6, 3); }, frame, 1.5, 0.25); c.fillStyle = sky; c.fillRect(x, y, w, h);
    c.strokeStyle = frame; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke(); },
  stars(c, n, col = '#ffffff') { const R = SC.rng(7); c.fillStyle = col; for (let i = 0; i < n; i++) { c.globalAlpha = 0.4 + R() * 0.6; c.beginPath(); c.arc(R() * RW, GROUND - 190 + R() * 120, 0.5 + R() * 0.7, 0, 7); c.fill(); } c.globalAlpha = 1; },
  moon(c, x, y, r = 8) { AK.glow(c, x, y, r * 3, 'rgba(240,240,210,.35)'); c.fillStyle = '#f4f1d6'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); },
  smoke(c, x, y, t, col = '230,230,235') { for (let i = 0; i < 4; i++) { const yy = (t / 30 + i * 8) % 30; c.fillStyle = `rgba(${col},${0.6 - yy / 60})`; c.beginPath(); c.arc(x + Math.sin(i + t / 500) * 3, y - yy, 3 + yy / 7, 0, 7); c.fill(); } },
  dim(c, col) { c.fillStyle = col; c.fillRect(-40, GROUND - 400, RW + 80, 400); },
};

/* ---------- the pictures: one screen each, world x 0..RW, ground at GROUND ---------- */
const AREA_ART = {
  'Blaze:lava'(c, t) { SC.hills(c, RW + 80, GROUND - 70, GROUND, 9, 24, 0.6, '#3a1c18');
    AK.ground(c, '#2e2422', '#46362f');
    for (const [x, w] of [[30, 40], [120, 55], [205, 30]]) { const y = GROUND - 6 + (x % 3);
      AK.glow(c, x, y, w * 0.8, 'rgba(255,120,40,.35)'); c.fillStyle = '#ff7a2a'; c.beginPath(); c.ellipse(x, y, w * 0.5, 3.5, 0, 0, 7); c.fill();
      c.fillStyle = '#ffd34a'; c.beginPath(); c.ellipse(x - 3, y - 0.5, w * 0.22, 1.4, 0, 0, 7); c.fill(); }
    for (const x of [70, 170]) { c.fillStyle = '#3a2c28'; c.beginPath(); c.moveTo(x - 8, GROUND - 14); c.lineTo(x - 3, GROUND - 26); c.lineTo(x + 3, GROUND - 26); c.lineTo(x + 8, GROUND - 14); c.closePath(); c.fill(); AK.smoke(c, x, GROUND - 28, t, '200,190,190'); } },
  'Blaze:obsidian'(c, t) { AK.cave(c, '#1c1220', '#2a1c2e', '#2a2030', '#3a2a3e'); AK.glow(c, 200, GROUND - 40, 90, 'rgba(255,110,40,.3)');
    for (const [x, y, s] of [[40, GROUND - 14, 1], [150, GROUND - 14, 1.3], [215, GROUND - 14, 0.8]]) { SC.depth(c, () => { c.beginPath(); c.moveTo(x - 9 * s, y); c.lineTo(x - 4 * s, y - 26 * s); c.lineTo(x + 3 * s, y - 32 * s); c.lineTo(x + 9 * s, y); c.closePath(); }, '#2b1d36', 1, 0.3);
      c.fillStyle = 'rgba(200,150,255,.35)'; c.beginPath(); c.moveTo(x - 3 * s, y - 4); c.lineTo(x, y - 26 * s); c.lineTo(x + 2 * s, y - 4); c.closePath(); c.fill(); } },
  'Blaze:crater'(c, t) { AK.dim(c, 'rgba(80,30,20,.25)');
    AK.glow(c, 120, GROUND - 20, 140, 'rgba(255,120,40,.45)'); for (let i = 0; i < 6; i++) AK.smoke(c, 30 + i * 40, GROUND - 40, t + i * 300, '160,140,140');
    SC.depth(c, () => { c.beginPath(); c.moveTo(-40, GROUND - 10); c.quadraticCurveTo(120, GROUND - 40, RW + 40, GROUND - 10); c.lineTo(RW + 40, GROUND + 60); c.lineTo(-40, GROUND + 60); c.closePath(); }, '#4a2a22', 2, 0.3);
    AK.ground(c, '#3a2420', '#5a3a2e'); c.fillStyle = '#ff7a2a'; c.fillRect(-40, GROUND - 15, RW + 80, 2); },
  'Brawl:bamboo'(c, t) { AK.fill(c, '#d9e8c4');
    for (let i = 0; i < 18; i++) { const x = i * 15 - 10 + (i % 3) * 4, col = i % 2 ? '#6fb04a' : '#5a9a3e', far = i % 3 === 0; c.globalAlpha = far ? 0.55 : 1; c.fillStyle = col; c.fillRect(x, GROUND - 210, far ? 4 : 6, 200);
      c.fillStyle = SC.dark(col, 0.3); for (let y = GROUND - 200; y < GROUND - 14; y += 26) c.fillRect(x - 0.5, y, far ? 5 : 7, 2);
      c.fillStyle = '#7cc45a'; c.beginPath(); c.ellipse(x + 8, GROUND - 120 + (i * 17) % 60, 8, 2.2, 0.5, 0, 7); c.fill(); c.globalAlpha = 1; }
    AK.ground(c, '#a7b86a', '#c1cf88'); },
  'Brawl:steps'(c, t) { SC.hills(c, RW + 80, GROUND - 90, GROUND, 10, 30, 1, '#7d8f6a');
    for (let k = 0; k < 9; k++) { const y = GROUND - 14 - k * 12, x = 60 + k * 10; SC.depth(c, () => { c.beginPath(); c.roundRect(x, y - 12, 140 - k * 6, 12, 1); }, '#b3a998', 1.2, 0.25); }
    for (const x of [40, 210]) { c.fillStyle = '#7a6a5a'; c.fillRect(x - 2, GROUND - 46, 4, 32); SC.depth(c, () => { c.beginPath(); c.roundRect(x - 7, GROUND - 58, 14, 12, 3); }, '#c9b48c', 1, 0.25);
      AK.glow(c, x, GROUND - 52, 14, 'rgba(255,220,140,.4)'); }
    AK.ground(c, '#b58a5a', '#d1a56d'); },
  'Brawl:hall'(c, t) { AK.room(c, '#e9dcc0', '#8a5532', '#c49a6c', 'rgba(120,80,40,.12)');
    for (const x of [40, 200]) { SC.depth(c, () => { c.beginPath(); c.roundRect(x - 12, GROUND - 110, 24, 56, 2); }, '#f6efe0', 1, 0.15); c.fillStyle = '#2a1e1a'; c.font = '700 14px serif'; c.textAlign = 'center'; c.fillText(x < 100 ? '力' : '心', x, GROUND - 78); }
    SC.depth(c, () => { c.beginPath(); c.roundRect(96, GROUND - 120, 48, 30, 3); }, '#7b3b2a', 1.5, 0.3); c.fillStyle = '#ffd877'; c.beginPath(); c.arc(120, GROUND - 105, 8, 0, 7); c.fill(); },
  'Spark:meadow'(c, t) { AK.dim(c, 'rgba(30,30,60,.35)');
    for (const [x, s] of [[40, 12], [130, 14], [210, 10]]) SC.cloud(c, x, GROUND - 150, s, 0.95);
    if ((t / 500 | 0) % 6 === 0) { c.strokeStyle = '#ffe14d'; c.lineWidth = 2.4; c.beginPath(); const lx = 60 + ((t / 3000 | 0) * 70) % 140; c.moveTo(lx, GROUND - 140); c.lineTo(lx + 8, GROUND - 110); c.lineTo(lx - 4, GROUND - 90); c.lineTo(lx + 6, GROUND - 60); c.stroke(); }
    AK.ground(c, '#8f9a5a', '#a9b46a'); for (let i = 0; i < 40; i++) SC.tuft(c, (i * 13) % RW, GROUND - 4 + (i % 4) * 4, 3, 'rgba(60,80,30,.5)'); },
  'Spark:shed'(c, t) { AK.room(c, '#5a6270', '#3e444b', '#4a4f56');
    for (const x of [50, 190]) { SC.depth(c, () => { c.beginPath(); c.roundRect(x - 16, GROUND - 80, 32, 66, 4); }, '#7a8796', 1.5, 0.3);
      c.strokeStyle = '#c08f3e'; c.lineWidth = 2; for (let y = GROUND - 74; y < GROUND - 24; y += 6) { c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x + 12, y + 2); c.stroke(); }
      if ((t / 150 | 0) % 4 === 0) { c.strokeStyle = '#ffe14d'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, GROUND - 82); c.lineTo(x + 6, GROUND - 92); c.lineTo(x + 1, GROUND - 96); c.stroke(); } }
    SC.depth(c, () => { c.beginPath(); c.roundRect(96, GROUND - 120, 48, 32, 3); }, '#2b3242', 1.5, 0.3); for (let k = 0; k < 6; k++) { c.fillStyle = (t / 300 + k | 0) % 3 ? '#5be37a' : '#ff6b4a'; c.beginPath(); c.arc(104 + k * 7, GROUND - 104, 2, 0, 7); c.fill(); } },
  'Spark:rodhill'(c, t) { AK.dim(c, 'rgba(30,30,70,.3)'); SC.cloud(c, 60, GROUND - 160, 14, 0.9); SC.cloud(c, 190, GROUND - 150, 12, 0.85);
    SC.depth(c, () => { c.beginPath(); c.moveTo(-40, GROUND - 10); c.quadraticCurveTo(140, GROUND - 60, RW + 40, GROUND - 20); c.lineTo(RW + 40, GROUND + 60); c.lineTo(-40, GROUND + 60); c.closePath(); }, '#9aa36a', 2, 0.25);
    c.strokeStyle = '#3e444b'; c.lineWidth = 3; c.beginPath(); c.moveTo(150, GROUND - 46); c.lineTo(150, GROUND - 130); c.stroke(); c.fillStyle = '#c08f3e'; c.beginPath(); c.arc(150, GROUND - 132, 4, 0, 7); c.fill();
    if ((t / 400 | 0) % 5 === 0) { c.strokeStyle = '#fff6a0'; c.lineWidth = 3; c.beginPath(); c.moveTo(140, GROUND - 200); c.lineTo(156, GROUND - 170); c.lineTo(144, GROUND - 155); c.lineTo(150, GROUND - 134); c.stroke(); AK.glow(c, 150, GROUND - 132, 30, 'rgba(255,240,160,.6)'); }
    AK.ground(c, '#8f9a5a'); },
  'Wild:hollow'(c, t) { AK.dim(c, 'rgba(20,60,30,.35)');
    for (let i = 0; i < 7; i++) AK.tree(c, i * 40 + 5, 110 + (i * 13) % 30, i % 2 ? '#2f6a35' : '#3a7a3e', '#4a3020');
    AK.ground(c, '#3f7a3a', '#5a9a4a');
    SC.depth(c, () => { c.beginPath(); c.roundRect(20, GROUND - 26, 70, 14, 7); }, '#6b4a2e', 1.5, 0.3); c.fillStyle = '#5fae4a'; c.beginPath(); c.ellipse(55, GROUND - 26, 34, 4, 0, Math.PI, 0); c.fill();
    for (const x of [150, 165, 205]) { const y = GROUND - 12; AK.glow(c, x, y - 6, 12, 'rgba(160,240,255,.45)'); c.fillStyle = '#e8f6ff'; c.fillRect(x - 1, y - 6, 2, 6); c.fillStyle = '#9fe0ff'; c.beginPath(); c.ellipse(x, y - 7, 5, 3, 0, Math.PI, 0); c.fill(); } },
  'Wild:roots'(c, t) { AK.dim(c, 'rgba(30,70,30,.25)');
    c.fillStyle = '#4a3020'; c.fillRect(150, GROUND - 260, 70, 250);
    for (const [a, b, w] of [[150, 40, 16], [170, 90, 14], [200, 230, 12], [220, 260, 16]]) { c.strokeStyle = '#5e3b23'; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(a, GROUND - 40); c.quadraticCurveTo((a + b) / 2, GROUND - 90, b, GROUND - 12); c.stroke(); }
    SC.depth(c, () => SC.blob(c, 180, GROUND - 230, [[0, 0, 60], [-60, 20, 45], [50, 25, 40]]), '#2f6a35', 2, 0.3); AK.ground(c, '#4f6a3a', '#6a8a4a'); },
  'Wild:elder'(c, t) { AK.dim(c, 'rgba(255,240,200,.2)');
    SC.depth(c, () => { c.beginPath(); c.moveTo(150, GROUND - 14); c.quadraticCurveTo(160, GROUND - 120, 140, GROUND - 200); c.lineTo(230, GROUND - 200); c.quadraticCurveTo(210, GROUND - 120, 230, GROUND - 14); c.closePath(); }, '#6b4a2e', 2, 0.3);
    c.fillStyle = '#3a2416'; c.beginPath(); c.roundRect(176, GROUND - 50, 24, 36, [12, 12, 0, 0]); c.fill(); c.fillStyle = '#ffd877'; c.beginPath(); c.arc(194, GROUND - 32, 1.6, 0, 7); c.fill();
    SC.depth(c, () => SC.blob(c, 185, GROUND - 210, [[0, 0, 70], [-70, 20, 50], [60, 20, 50]]), '#3b8f44', 2, 0.3);
    for (let i = 0; i < 8; i++) AK.glow(c, (i * 37 + t / 50) % RW, GROUND - 60 - (i * 17) % 60, 4, 'rgba(255,250,170,.8)'); AK.ground(c, '#5fae4a', '#7cc45a'); },
  'Tide:pools'(c, t) { c.fillStyle = '#3a9bc9'; c.fillRect(-40, GROUND - 60, RW + 80, 46);
    for (let i = 0; i < 9; i++) { const x = ((i * 31 + t / 25) % (RW + 30)) - 15; c.strokeStyle = 'rgba(220,245,255,.8)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, GROUND - 50 + (i % 3) * 8, 4, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    AK.ground(c, '#8d8378', '#a99d8f'); for (const [x, w] of [[50, 30], [170, 38]]) { c.fillStyle = '#4fb0dc'; c.beginPath(); c.ellipse(x, GROUND - 4, w, 4, 0, 0, 7); c.fill(); }
    c.fillStyle = '#ff7a4a'; for (const [x, y] of [[40, GROUND - 4], [182, GROUND - 3]]) { c.save(); c.translate(x, y); for (let k = 0; k < 5; k++) { c.rotate(1.2566); c.beginPath(); c.ellipse(0, -2.5, 1.2, 3, 0, 0, 7); c.fill(); } c.restore(); }
    for (const x of [100, 225]) AK.rock(c, x, GROUND - 8, 10, '#7a7068'); },
  'Tide:seacave'(c, t) { AK.cave(c, '#123a50', '#1d4f6a', '#2a5f78', '#2f6a85'); AK.glow(c, 120, GROUND - 50, 100, 'rgba(90,220,230,.3)');
    c.fillStyle = '#1f7fa8'; c.fillRect(-40, GROUND - 6, RW + 80, 4); for (let i = 0; i < 6; i++) { const x = (i * 43 + t / 30) % RW; c.strokeStyle = 'rgba(180,240,255,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, GROUND - 4); c.lineTo(x + 6, GROUND - 4); c.stroke(); }
    for (const [x, y] of [[40, GROUND - 90], [200, GROUND - 100], [120, GROUND - 110]]) AK.glow(c, x, y, 6, 'rgba(140,255,240,.8)'); },
  'Tide:lighthouse'(c, t) { c.fillStyle = '#2f8fc4'; c.fillRect(-40, GROUND - 56, RW + 80, 42);
    const lx = 190; SC.depth(c, () => { c.beginPath(); c.moveTo(lx - 16, GROUND - 14); c.lineTo(lx - 10, GROUND - 130); c.lineTo(lx + 10, GROUND - 130); c.lineTo(lx + 16, GROUND - 14); c.closePath(); }, '#f6f2ea', 1.5, 0.2);
    c.fillStyle = '#e2483f'; for (const y of [GROUND - 50, GROUND - 90]) { c.beginPath(); c.moveTo(lx - 14.5, y); c.lineTo(lx - 12.5, y - 18); c.lineTo(lx + 12.5, y - 18); c.lineTo(lx + 14.5, y); c.closePath(); c.fill(); }
    SC.depth(c, () => { c.beginPath(); c.roundRect(lx - 12, GROUND - 146, 24, 16, 3); }, '#3e444b', 1, 0.3); c.fillStyle = '#ffe58a'; c.fillRect(lx - 8, GROUND - 142, 16, 9);
    const a = t / 900; c.fillStyle = 'rgba(255,240,170,.18)'; c.beginPath(); c.moveTo(lx, GROUND - 138); c.lineTo(lx + Math.cos(a) * 200, GROUND - 168); c.lineTo(lx + Math.cos(a) * 200, GROUND - 108); c.closePath(); c.fill();
    AK.ground(c, '#e3d39a', '#f1e5b6'); for (const x of [30, 120]) AK.rock(c, x, GROUND - 10, 9, '#8d8378'); },
  'Venom:bog'(c, t) { AK.dim(c, 'rgba(40,50,30,.3)');
    for (let i = 0; i < 6; i++) AK.tree(c, i * 46 + 10, 80 + (i * 11) % 30, '#4f5e3c', '#3a3024');
    c.fillStyle = '#3f5a2a'; c.fillRect(-40, GROUND - 34, RW + 80, 22);
    for (let i = 0; i < 7; i++) { const ph = ((t / 1200) + i * 0.37) % 1, x = (i * 37) % RW, r = 2 + ph * 5; c.strokeStyle = `rgba(190,240,120,${1 - ph})`; c.lineWidth = 1; c.beginPath(); c.arc(x, GROUND - 24 - ph * 4, r, 0, 7); c.stroke(); }
    AK.ground(c, '#4a4a32', '#6a7040'); },
  'Venom:thicket'(c, t) { AK.dim(c, 'rgba(30,20,40,.4)');
    for (let i = 0; i < 8; i++) { const x = i * 32; c.strokeStyle = '#2a2230'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, GROUND - 14); c.quadraticCurveTo(x + 18, GROUND - 80, x - 6, GROUND - 150); c.moveTo(x + 6, GROUND - 90); c.lineTo(x + 26, GROUND - 110); c.stroke(); }
    AK.ground(c, '#3a3a2c', '#4f5a3a');
    for (const x of [50, 120, 190]) { const y = GROUND - 12; AK.glow(c, x, y - 8, 16, 'rgba(200,255,110,.5)'); c.fillStyle = '#efe6cf'; c.fillRect(x - 1.2, y - 8, 2.4, 8); c.fillStyle = '#c6ff6a'; c.beginPath(); c.ellipse(x, y - 8, 7, 4, 0, Math.PI, 0); c.fill(); } },
  'Venom:mirehut'(c, t) { AK.dim(c, 'rgba(30,40,30,.3)'); c.fillStyle = '#3f5a2a'; c.fillRect(-40, GROUND - 30, RW + 80, 18);
    const hx = 180; c.strokeStyle = '#4a3020'; c.lineWidth = 3; for (const dx of [-20, 20]) { c.beginPath(); c.moveTo(hx + dx, GROUND - 14); c.lineTo(hx + dx, GROUND - 56); c.stroke(); }
    SC.depth(c, () => { c.beginPath(); c.roundRect(hx - 28, GROUND - 92, 56, 38, 2); }, '#5e4a38', 1.5, 0.3); SC.depth(c, () => { c.beginPath(); c.moveTo(hx - 36, GROUND - 90); c.lineTo(hx, GROUND - 120); c.lineTo(hx + 36, GROUND - 90); c.closePath(); }, '#6a7040', 1.5, 0.3);
    c.fillStyle = '#c6ff6a'; c.beginPath(); c.arc(hx + 10, GROUND - 74, 5, 0, 7); c.fill(); AK.smoke(c, hx - 14, GROUND - 120, t, '170,220,120'); AK.ground(c, '#4a4a32', '#6a7040'); },
  'Charm:maze'(c, t) { for (let r = 2; r >= 0; r--) { const y = GROUND - 14 - r * 22, col = ['#569a4e', '#4a8a44', '#3f7a3a'][r];
      SC.depth(c, () => { c.beginPath(); for (let x = -40 + r * 20; x < RW + 40; x += 70) c.roundRect(x, y - 30, 50, 30, 6); }, col, 1.5, 0.3);
      c.fillStyle = '#ff7aa2'; for (let x = -30 + r * 20; x < RW + 40; x += 18) { if ((x + 40 - r * 20) % 70 > 46) continue; c.beginPath(); c.arc(x, y - 22 + (x % 3) * 5, 2.2, 0, 7); c.fill(); } }
    AK.ground(c, '#d9c39a', '#ecd9b2'); },
  'Charm:glade'(c, t) { AK.dim(c, 'rgba(255,230,240,.25)');
    for (let i = 0; i < 5; i++) AK.tree(c, i * 60 + 10, 100, ['#9fcf8a', '#c98fb8'][i % 2]);
    AK.ground(c, '#8cc47a', '#acdc96');
    c.fillStyle = '#7fc4e8'; c.beginPath(); c.ellipse(140, GROUND - 6, 70, 6, 0, 0, 7); c.fill(); for (const x of [100, 130, 165]) { c.fillStyle = '#5fae4a'; c.beginPath(); c.ellipse(x, GROUND - 6, 7, 2.4, 0, 0.3, 6); c.fill(); }
    for (let i = 0; i < 6; i++) { const a = t / 600 + i, x = (i * 43 + t / 40) % RW, y = GROUND - 70 - Math.sin(a) * 20 - (i % 3) * 18, f = Math.abs(Math.sin(t / 90 + i)); c.fillStyle = ['#ffd166', '#ff8fd0', '#9ad9ff'][i % 3];
      c.beginPath(); c.ellipse(x - 3 * f, y, 3 * f + 0.5, 4, 0, 0, 7); c.ellipse(x + 3 * f, y, 3 * f + 0.5, 4, 0, 0, 7); c.fill(); } },
  'Charm:pavilion'(c, t) { AK.dim(c, 'rgba(40,30,80,.4)'); AK.stars(c, 30); AK.moon(c, 50, GROUND - 160, 12);
    const px = 175; c.fillStyle = '#f2e6f6'; for (const dx of [-28, -10, 10, 28]) c.fillRect(px + dx - 2, GROUND - 70, 4, 56);
    SC.depth(c, () => { c.beginPath(); c.moveTo(px - 40, GROUND - 70); c.quadraticCurveTo(px, GROUND - 110, px + 40, GROUND - 70); c.closePath(); }, '#c98fb8', 1.5, 0.3);
    AK.ground(c, '#7a9a6a', '#9fbf8a'); SC.depth(c, () => { c.beginPath(); c.roundRect(px - 36, GROUND - 18, 72, 6, 2); }, '#f2e6f6', 1, 0.2); },
  'Stone:arch'(c, t) { SC.hills(c, RW + 80, GROUND - 60, GROUND, 8, 30, 1, '#a99d8f');
    SC.depth(c, () => { c.beginPath(); c.moveTo(40, GROUND - 14); c.lineTo(40, GROUND - 120); c.quadraticCurveTo(120, GROUND - 190, 200, GROUND - 120); c.lineTo(200, GROUND - 14); c.lineTo(170, GROUND - 14); c.lineTo(170, GROUND - 110); c.quadraticCurveTo(120, GROUND - 150, 70, GROUND - 110); c.lineTo(70, GROUND - 14); c.closePath(); }, '#8d8378', 2, 0.3);
    AK.ground(c, '#9c907f', '#b8ab97'); c.strokeStyle = '#6a5a4a'; c.lineWidth = 1.5; for (const y of [GROUND - 7, GROUND - 3]) { c.beginPath(); c.moveTo(-40, y); c.lineTo(RW + 40, y); c.stroke(); } },
  'Stone:mine'(c, t) { AK.cave(c, '#2a2420', '#3e342c', '#4a4038', '#4e443a');
    for (const x of [30, 120, 210]) { c.fillStyle = '#6a4226'; c.fillRect(x - 3, GROUND - 120, 6, 106); c.fillRect(x - 18, GROUND - 124, 36, 6); AK.glow(c, x, GROUND - 100, 20, 'rgba(255,200,120,.4)'); c.fillStyle = '#ffd877'; c.beginPath(); c.arc(x, GROUND - 100, 3, 0, 7); c.fill(); }
    for (const [x, y] of [[70, GROUND - 60], [165, GROUND - 80], [95, GROUND - 105]]) { AK.glow(c, x, y, 14, 'rgba(190,140,255,.5)'); c.fillStyle = '#b98cff'; c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x + 4, y); c.lineTo(x, y + 4); c.lineTo(x - 4, y); c.closePath(); c.fill(); }
    c.strokeStyle = '#7a7068'; c.lineWidth = 1.5; for (const y of [GROUND - 7, GROUND - 3]) { c.beginPath(); c.moveTo(-40, y); c.lineTo(RW + 40, y); c.stroke(); } },
  'Stone:sentinel'(c, t) { SC.cloud(c, 40, GROUND - 120, 9, 0.9);
    SC.depth(c, () => { c.beginPath(); c.moveTo(-40, GROUND - 14); c.lineTo(60, GROUND - 80); c.lineTo(110, GROUND - 60); c.lineTo(RW + 40, GROUND - 30); c.lineTo(RW + 40, GROUND + 40); c.lineTo(-40, GROUND + 40); c.closePath(); }, '#8d8378', 2, 0.3);
    const sx = 70; SC.depth(c, () => { c.beginPath(); c.roundRect(sx - 14, GROUND - 150, 28, 70, 6); c.roundRect(sx - 22, GROUND - 130, 44, 12, 4); }, '#a99d8f', 2, 0.3); c.fillStyle = '#ffd877'; c.fillRect(sx - 8, GROUND - 140, 5, 3); c.fillRect(sx + 3, GROUND - 140, 5, 3);
    AK.ground(c, '#9c907f', '#b8ab97'); },
  'Light:court'(c, t) { AK.dim(c, 'rgba(255,240,180,.25)');
    AK.glow(c, 120, GROUND - 130, 70, 'rgba(255,230,140,.5)'); c.fillStyle = '#ffd98a'; c.beginPath(); c.arc(120, GROUND - 130, 18, 0, 7); c.fill();
    for (const x of [20, 70, 170, 220]) SC.depth(c, () => { c.beginPath(); c.roundRect(x - 6, GROUND - 100, 12, 86, 2); }, '#f6eed2', 1, 0.15);
    c.fillStyle = '#e9dcb5'; c.fillRect(-40, GROUND - 14, RW + 80, 80); c.strokeStyle = 'rgba(180,150,90,.3)'; c.lineWidth = 1; for (let x = -40; x < RW + 40; x += 20) { c.beginPath(); c.moveTo(x, GROUND - 14); c.lineTo(x + 10, GROUND + 40); c.stroke(); } },
  'Light:mirrors'(c, t) { AK.room(c, '#f6eed2', '#d9c48c', '#e9dcb5');
    for (let i = 0; i < 5; i++) { const x = 16 + i * 52; SC.depth(c, () => { c.beginPath(); c.roundRect(x - 14, GROUND - 120, 28, 70, 14); }, '#e2c46a', 1.5, 0.25);
      const g = c.createLinearGradient(x - 10, 0, x + 10, 0); g.addColorStop(0, '#cfe4f2'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#bcd6ea'); c.fillStyle = g; c.beginPath(); c.roundRect(x - 10, GROUND - 116, 20, 62, 10); c.fill(); }
    c.fillStyle = 'rgba(255,240,170,.25)'; c.beginPath(); c.moveTo(60, GROUND - 400); c.lineTo(90, GROUND - 400); c.lineTo(160, GROUND - 14); c.lineTo(120, GROUND - 14); c.closePath(); c.fill(); },
  'Light:altar'(c, t) { const g = c.createLinearGradient(0, GROUND - 200, 0, GROUND); g.addColorStop(0, '#ff9a6a'); g.addColorStop(0.6, '#ffd98a'); g.addColorStop(1, '#fff5dc'); c.fillStyle = g; c.fillRect(-40, GROUND - 400, RW + 80, 400);
    AK.glow(c, 120, GROUND - 40, 120, 'rgba(255,240,180,.6)'); c.fillStyle = '#fff4b0'; c.beginPath(); c.arc(120, GROUND - 14, 30, Math.PI, 0); c.fill();
    AK.ground(c, '#e9dcb5', '#f6eed2'); SC.depth(c, () => { c.beginPath(); c.roundRect(150, GROUND - 46, 60, 32, 3); }, '#f6eed2', 1.5, 0.15); c.fillStyle = '#e2c46a'; c.fillRect(150, GROUND - 46, 60, 4); },
  'Steel:conveyor'(c, t) { AK.room(c, '#5f666e', '#4c535c', '#55595e');
    for (const y of [GROUND - 70, GROUND - 110]) { c.fillStyle = '#2b3242'; c.fillRect(-40, y, RW + 80, 8); c.fillStyle = '#7a8796'; for (let x = -40 + (t / 20) % 12; x < RW + 40; x += 12) c.fillRect(x, y + 1, 6, 2);
      for (let x = -40 + (t / 20) % 60; x < RW + 40; x += 60) SC.depth(c, () => { c.beginPath(); c.roundRect(x, y - 12, 14, 12, 2); }, '#c98a4c', 1, 0.25); }
    for (const x of [60, 180]) { const a = Math.sin(t / 500 + x) * 0.4; c.strokeStyle = '#2b3242'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, GROUND - 160); c.lineTo(x + Math.sin(a) * 30, GROUND - 160 + Math.cos(a) * 40); c.stroke(); } },
  'Steel:furnace'(c, t) { AK.room(c, '#4a3e3a', '#3e3432', '#4a4442');
    SC.depth(c, () => { c.beginPath(); c.roundRect(130, GROUND - 120, 90, 106, 6); }, '#5a4a44', 2, 0.3); AK.glow(c, 175, GROUND - 50, 70, 'rgba(255,130,50,.55)');
    c.fillStyle = '#ff7a2a'; c.beginPath(); c.roundRect(150, GROUND - 70, 50, 34, [17, 17, 2, 2]); c.fill(); c.fillStyle = '#ffd34a'; c.beginPath(); c.roundRect(160, GROUND - 56, 30, 20, [10, 10, 2, 2]); c.fill();
    for (const x of [30, 60]) { SC.depth(c, () => { c.beginPath(); c.arc(x, GROUND - 90, 12, 0, 7); }, '#c9c2b4', 1, 0.2); c.strokeStyle = '#e2483f'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, GROUND - 90); c.lineTo(x + Math.cos(t / 400 + x) * 9, GROUND - 90 + Math.sin(t / 400 + x) * 9); c.stroke(); } },
  'Steel:office'(c, t) { AK.room(c, '#c9c2b4', '#7a6a5a', '#8a7a6a', 'rgba(0,0,0,.05)'); AK.window(c, 20, GROUND - 140, 70, 50, '#6f7a86');
    SC.depth(c, () => { c.beginPath(); c.roundRect(130, GROUND - 52, 90, 10, 2); }, '#6a4226', 1.5, 0.3); c.fillStyle = '#5a3a22'; c.fillRect(136, GROUND - 42, 6, 28); c.fillRect(208, GROUND - 42, 6, 28);
    c.fillStyle = '#f6f2ea'; c.fillRect(150, GROUND - 60, 22, 8); c.fillStyle = '#3e444b'; c.beginPath(); c.roundRect(186, GROUND - 74, 22, 22, 2); c.fill(); c.fillStyle = '#5be37a'; c.fillRect(189, GROUND - 71, 16, 12);
    SC.depth(c, () => { c.beginPath(); c.roundRect(110, GROUND - 140, 30, 24, 2); }, '#f6f2ea', 1, 0.15); c.strokeStyle = '#e2483f'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(114, GROUND - 122); c.lineTo(122, GROUND - 130); c.lineTo(128, GROUND - 126); c.lineTo(136, GROUND - 136); c.stroke(); },
  'Shade:stones'(c, t) { AK.stars(c, 20); AK.moon(c, 200, GROUND - 160, 7);
    for (const [x, h, r] of [[30, 60, -0.05], [80, 74, 0.03], [150, 66, -0.02], [205, 54, 0.06]]) { c.save(); c.translate(x, GROUND - 14); c.rotate(r); SC.depth(c, () => { c.beginPath(); c.roundRect(-10, -h, 20, h, [6, 6, 0, 0]); }, '#5a6070', 1.5, 0.3);
      c.strokeStyle = 'rgba(180,200,255,.4)'; c.lineWidth = 1; c.beginPath(); c.arc(0, -h * 0.6, 4, 0, 7); c.stroke(); c.restore(); }
    AK.ground(c, '#2f3a2c', '#45523e'); },
  'Shade:barrow'(c, t) { AK.stars(c, 14); SC.depth(c, () => { c.beginPath(); c.ellipse(150, GROUND - 14, 90, 60, 0, Math.PI, 0); }, '#3a4a3a', 2, 0.3);
    SC.depth(c, () => { c.beginPath(); c.roundRect(136, GROUND - 46, 28, 32, [14, 14, 0, 0]); }, '#1a1f28', 1, 0.2); c.strokeStyle = '#7a8090'; c.lineWidth = 3; c.beginPath(); c.arc(150, GROUND - 32, 17, Math.PI, 0); c.stroke();
    AK.ground(c, '#2f3a2c', '#45523e');
    for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(200,210,230,.16)'; c.beginPath(); c.ellipse((i * 60 + t / 25) % (RW + 60) - 30, GROUND - 20 - (i % 3) * 10, 40, 6, 0, 0, 7); c.fill(); } },
  'Shade:moonwell'(c, t) { AK.dim(c, 'rgba(10,14,40,.4)'); AK.stars(c, 40); AK.moon(c, 120, GROUND - 150, 22);
    AK.ground(c, '#2f3a2c', '#45523e');
    const wx = 180; SC.depth(c, () => { c.beginPath(); c.roundRect(wx - 22, GROUND - 40, 44, 26, 3); }, '#6a7080', 1.5, 0.3); c.fillStyle = '#b0c8ff'; c.beginPath(); c.ellipse(wx, GROUND - 40, 20, 4, 0, 0, 7); c.fill();
    AK.glow(c, wx, GROUND - 44, 26, 'rgba(176,200,255,.5)'); c.strokeStyle = '#4a3020'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(wx - 20, GROUND - 40); c.lineTo(wx - 20, GROUND - 74); c.lineTo(wx + 20, GROUND - 74); c.lineTo(wx + 20, GROUND - 40); c.stroke(); },
  'Void:isles'(c, t) { AK.stars(c, 40, '#d9b8ff');
    for (const [x, y, w] of [[40, GROUND - 40, 40], [120, GROUND - 70, 30], [200, GROUND - 40, 44], [90, GROUND - 130, 24], [190, GROUND - 120, 20]]) { const bob = Math.sin(t / 700 + x) * 3;
      SC.depth(c, () => { c.beginPath(); c.moveTo(x - w, y + bob); c.lineTo(x + w, y + bob); c.lineTo(x + w * 0.4, y + 24 + bob); c.lineTo(x - w * 0.3, y + 30 + bob); c.closePath(); }, '#5b3a8a', 1.5, 0.3);
      c.fillStyle = '#7a5ab0'; c.fillRect(x - w, y - 3 + bob, w * 2, 4); }
    AK.ground(c, '#2b1b40', '#5b3a8a'); },
  'Void:brokensky'(c, t) { AK.fill(c, '#1a0f30');
    for (let i = 0; i < 9; i++) { const x = (i * 53) % RW, y = GROUND - 180 + (i * 37) % 120, s = 18 + (i % 3) * 8; c.save(); c.translate(x, y); c.rotate(i + t / 4000);
      const g = c.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, '#6fb3f0'); g.addColorStop(1, '#d3e9fb'); c.fillStyle = g; c.beginPath(); c.moveTo(-s, -s * 0.4); c.lineTo(s * 0.6, -s * 0.6); c.lineTo(s, s * 0.3); c.lineTo(-s * 0.3, s * 0.6); c.closePath(); c.fill();
      c.strokeStyle = '#b38cff'; c.lineWidth = 1; c.stroke(); c.restore(); }
    AK.ground(c, '#2b1b40', '#5b3a8a'); },
  'Void:heart'(c, t) { AK.fill(c, '#120a24'); AK.stars(c, 30, '#d9b8ff');
    const px = 170, py = GROUND - 80; for (let k = 5; k > 0; k--) { c.fillStyle = `rgba(${120 + k * 20},${60 + k * 10},255,${0.15 + 0.05 * k})`; c.beginPath(); c.ellipse(px, py, k * 12 + Math.sin(t / 300) * 2, k * 18, Math.sin(t / 2000) * 0.3, 0, 7); c.fill(); }
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(px, py, 8, 14, 0, 0, 7); c.fill();
    for (let i = 0; i < 10; i++) { const a = t / 900 + i * 0.63, r = 40 + (i % 3) * 10; c.fillStyle = i % 2 ? '#b38cff' : '#6be4ff'; c.fillRect(px + Math.cos(a) * r - 1.5, py + Math.sin(a) * r * 1.3 - 1.5, 3, 3); }
    AK.ground(c, '#2b1b40', '#5b3a8a'); },
};

/* an area's picture; the first area of each region is the region's own picture, drawn by scenes.js */
function areaArt(c, el, key, t) {
  if (el === 'Frost') return frostArt(c, key, t);
  const f = AREA_ART[el + ':' + key]; if (!f) return false; f(c, t); return true;
}
function frostArt(c, key, t) {
  const x0 = -40, x1 = RW + 40;
  if (key === 'lake') {
    SC.hills(c, RW + 80, GROUND - 76, GROUND, 8, 26, 1.2, '#b9cde0');
    for (let i = 0; i < 11; i++) AK.pine(c, i * 24 - 6, 60 + (i * 17) % 24, '#4f7a6a', '#ffffff');
    const g = c.createLinearGradient(0, GROUND - 46, 0, GROUND); g.addColorStop(0, '#cfe9f7'); g.addColorStop(1, '#a9d4ec');
    c.fillStyle = g; c.fillRect(x0, GROUND - 46, x1 - x0, 46);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 0.8; c.lineCap = 'round';
    for (const [a, b, d] of [[30, -30, 18], [120, -20, 26], [190, -36, 14], [70, -12, 20]]) { c.beginPath(); c.moveTo(a, GROUND + b); c.lineTo(a + d * 0.5, GROUND + b + 3); c.lineTo(a + d, GROUND + b + 1); c.moveTo(a + d * 0.5, GROUND + b + 3); c.lineTo(a + d * 0.4, GROUND + b + 8); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(20 + i * 50, GROUND - 26 + (i % 2) * 10, 16, 1.5, 0, 0, 7); c.fill(); }
    c.fillStyle = '#e8f3fb'; c.fillRect(x0, GROUND - 4, x1 - x0, 80); c.fillStyle = 'rgba(0,0,0,.05)'; c.fillRect(x0, GROUND - 4, x1 - x0, 1);
    for (let i = 0; i < 14; i++) { c.fillStyle = '#ffffff'; c.beginPath(); c.arc((i * 37 + t / 30) % RW, (i * 13 + t / 12) % 110, 0.9, 0, 7); c.fill(); }
    return true;
  }
  if (key === 'cave') {
    AK.cave(c, '#1f3552', '#2b4a70', '#3d6a96', '#cfeaff'); AK.glow(c, 120, GROUND - 70, 110, 'rgba(110,200,255,.35)');
    for (const [x, y, s] of [[34, GROUND - 14, 1], [210, GROUND - 14, 1.3], [150, GROUND - 14, 0.8]]) {
      AK.glow(c, x, y - 8 * s, 22 * s, 'rgba(120,230,255,.45)');
      SC.depth(c, () => { c.beginPath(); c.moveTo(x - 7 * s, y); c.lineTo(x - 3 * s, y - 20 * s); c.lineTo(x + 2 * s, y - 26 * s); c.lineTo(x + 7 * s, y); c.closePath(); }, '#8fe3ff', 1, 0.3);
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(x - 2 * s, y - 4 * s); c.lineTo(x, y - 20 * s); c.lineTo(x + 1 * s, y - 4 * s); c.closePath(); c.fill(); }
    return true;
  }
  if (key === 'summit') {
    for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc((i * 41) % RW, (i * 29) % 80, 0.7, 0, 7); c.fill(); }
    SC.cloud(c, 40, GROUND - 60, 10, 0.95); SC.cloud(c, 200, GROUND - 52, 8, 0.85);
    SC.depth(c, () => { c.beginPath(); c.moveTo(x0, GROUND - 6); c.quadraticCurveTo(60, GROUND - 40, 130, GROUND - 46); c.quadraticCurveTo(200, GROUND - 40, x1, GROUND - 10); c.lineTo(x1, GROUND + 80); c.lineTo(x0, GROUND + 80); c.closePath(); }, '#ffffff', 2, 0.12);
    const hx = 176, hy = GROUND - 40;
    SC.depth(c, () => { c.beginPath(); c.roundRect(hx - 26, hy - 30, 52, 32, 2); }, '#8a5a32', 2, 0.25);
    c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 1; for (let y = hy - 24; y < hy; y += 6) { c.beginPath(); c.moveTo(hx - 26, y); c.lineTo(hx + 26, y); c.stroke(); }
    SC.depth(c, () => { c.beginPath(); c.moveTo(hx - 34, hy - 28); c.lineTo(hx, hy - 52); c.lineTo(hx + 34, hy - 28); c.closePath(); }, '#ffffff', 1.5, 0.15);
    c.fillStyle = '#ffd877'; c.beginPath(); c.roundRect(hx + 8, hy - 22, 10, 9, 1.5); c.fill(); c.fillStyle = '#5a3a22'; c.beginPath(); c.roundRect(hx - 14, hy - 18, 11, 20, [2, 2, 0, 0]); c.fill();
    c.fillStyle = '#6a4226'; c.fillRect(hx + 14, hy - 56, 6, 14); AK.smoke(c, hx + 17, hy - 60, t);
    c.strokeStyle = '#7a6a5a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(20, GROUND - 60); c.quadraticCurveTo(80, GROUND - 46, 140, GROUND - 58); c.stroke();
    ['#e2483f', '#ffd23f', '#3b8fd0', '#5fae4a', '#ffffff'].forEach((col, i) => { for (let k = 0; k < 2; k++) { const u = (i * 2 + k + 0.5) / 10, xx = 20 + u * 120, yy = GROUND - 60 + Math.sin(u * Math.PI) * 10 - u * 2;
      c.fillStyle = col; c.beginPath(); c.moveTo(xx - 3, yy); c.lineTo(xx + 3, yy); c.lineTo(xx + 3 + Math.sin(t / 300 + u * 9), yy + 7); c.lineTo(xx - 3 + Math.sin(t / 300 + u * 9), yy + 7); c.closePath(); c.fill(); } });
    c.fillStyle = '#eef5fb'; c.fillRect(x0, GROUND - 6, x1 - x0, 80);
    return true;
  }
  return false;
}

/* the teacher at the last stop: a big Mega in the region's colours, facing the Snabit */
const hexRGB = h => { if (h.length === 4) h = '#' + [...h.slice(1)].map(d => d + d).join(''); return [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)); };
const TEACHER_COL = { Void: '#7a4fd0', Shade: '#4a4f6a', Light: '#f2d36b' };
function teacherProp(c, p, t) {
  if (typeof CHIBI === 'undefined') return;
  const fam = (TEACHER[p.el] || TEACHER.Wild)[1], base = hexRGB(TEACHER_COL[p.el] || (typeof ELC === 'function' ? ELC(p.el) : '#7a5ab0')),
    pal = { body: base, parts: base.map(v => Math.round(v * 0.6)), accent: base.map(v => Math.round(v + (255 - v) * 0.6)) };
  const spec = { family: fam, stage: 'Mega', marks: ['Haloed'], pal, el: p.el, worn: {} }, h = 1.7 * (typeof RANCH_PX_M !== 'undefined' ? RANCH_PX_M : 48), u = h / CHIBI.height('Mega', [], fam);
  c.save(); c.translate(p.x, GROUND); c.scale(-u, u); c.translate(-100, -188); CHIBI.draw(c, spec, p.pose || 'idle', t, [-0.4, 0]); c.restore();
}
/* things that drop from above in a dodge task: icicles, sparks, embers, rocks */
const FALLER = { Frost: 'icicle', Spark: 'spark', Blaze: 'ember', Steel: 'spark', Light: 'spark' };
function fallerProp(c, p, t) {
  c.save(); c.translate(p.x, p.y);
  if (p.kind === 'icicle') { c.fillStyle = '#cfeaff'; c.beginPath(); c.moveTo(-3, -10); c.lineTo(3, -10); c.lineTo(0, 4); c.closePath(); c.fill(); }
  else if (p.kind === 'spark') { c.strokeStyle = '#ffe14d'; c.lineWidth = 2; c.beginPath(); c.moveTo(-2, -10); c.lineTo(2, -3); c.lineTo(-2, 0); c.lineTo(2, 6); c.stroke(); }
  else if (p.kind === 'ember') { AK.glow(c, 0, 0, 8, 'rgba(255,140,40,.7)'); c.fillStyle = '#ffd34a'; c.beginPath(); c.arc(0, 0, 2.5, 0, 7); c.fill(); }
  else { c.fillStyle = p.col || '#8d8378'; c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); }
  c.restore();
}

/* the route map between weeks: a paper map with the four stops, the path walked so far, and where it is now */
function routeMap(c, W, H, el, stop, t, k = 1, prog = 1) {
  const names = TRIP_AREAS[el].map(a => a.name);
  c.save(); c.scale(k, k);
  SC.depth(c, () => { c.beginPath(); c.roundRect(8, 8, W - 16, H - 16, 8); }, '#f1e2c2', 3, 0.2);
  c.strokeStyle = 'rgba(120,80,40,.25)'; c.lineWidth = 2; c.strokeRect(16, 16, W - 32, H - 32);
  const P = [[W * 0.22, H * 0.72], [W * 0.4, H * 0.46], [W * 0.6, H * 0.62], [W * 0.76, H * 0.3]];
  c.fillStyle = 'rgba(80,110,140,.3)'; for (const [x, y] of [[W * 0.5, H * 0.24], [W * 0.68, H * 0.16], [W * 0.27, H * 0.26]]) { c.beginPath(); c.moveTo(x - 14, y + 10); c.lineTo(x, y - 10); c.lineTo(x + 14, y + 10); c.closePath(); c.fill(); }
  c.setLineDash([5, 5]); c.strokeStyle = '#8a5a32'; c.lineWidth = 2.5; c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]);
  const at = (i, f) => { if (i === 0) return P[0]; const a = P[i - 1], b = P[i]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
  c.strokeStyle = '#d24f43'; c.lineWidth = 3.5; c.beginPath(); for (let i = 0; i <= stop; i++) { const [x, y] = i === stop ? at(i, prog) : P[i]; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  P.forEach(([x, y], i) => { SC.depth(c, () => { c.beginPath(); c.arc(x, y, 9, 0, 7); }, i < stop || (i === stop && prog >= 1) ? '#d24f43' : '#c9b48c', 2, 0.25);
    c.fillStyle = '#fff'; c.font = '800 10px system-ui'; c.textAlign = 'center'; c.fillText(String(i + 1), x, y + 3.5);
    c.fillStyle = '#4a3220'; c.font = '700 11px system-ui'; c.fillText(names[i], Math.min(W - 44, Math.max(44, x)), y + 24); });
  const [px, py] = at(stop, prog); c.fillStyle = '#4a86d8'; c.beginPath(); c.arc(px, py - 16 - Math.abs(Math.sin(t / 250)) * 4, 5, 0, 7); c.fill();
  c.restore();
}
/* shows the route map over the scene, walks the marker to the next stop, then takes it away */
async function showRoute(el, stop) {
  const fr = document.getElementById('r-frame'); if (!fr) return;
  const cv = document.createElement('canvas'); Object.assign(cv.style, { position: 'absolute', inset: '0', margin: 'auto', width: 'min(86%, 340px)', aspectRatio: '1.15', zIndex: 6, opacity: 0, transition: 'opacity .35s' });
  fr.appendChild(cv); const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1; cv.width = r.width * dpr; cv.height = r.height * dpr;
  const x = cv.getContext('2d'), t0 = performance.now(), dur = 1900 / rk();
  requestAnimationFrame(() => { cv.style.opacity = 1; });
  await new Promise(res => { const step = () => { const t = performance.now() - t0; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
    routeMap(x, cv.width / dpr, cv.height / dpr, el, stop, t, dpr, Math.min(1, Math.max(0, (t - 300 / rk()) / (900 / rk()))));
    if (t < dur) requestAnimationFrame(step); else res(); }; step(); });
  cv.style.opacity = 0; await new Promise(r2 => setTimeout(r2, 350)); cv.remove();
}
