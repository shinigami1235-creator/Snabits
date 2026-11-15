/* The summon and fusion scenes, drawn on one full-screen canvas. Every frame is worked out from the time alone, so the
   storyboard and the game show the same thing.
   Summon: the shutter snaps, the photo shrinks to a card, a scan line turns it into blocks of its own colours, the blocks
   spin into a disc that shoots a pillar of light, collapse into an egg that cracks, and the Snabit makes its entrance.
   Fusion: the two parents break into bits, the bits orbit and mix, crush into a light, and fly out to build the child. */
const SUMMON = (() => {
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), seg = (t, a, b) => cl((t - a) / (b - a));
  const out3 = k => 1 - Math.pow(1 - k, 3), io3 = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const back = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const spring = (dt, amp, decay = 140, freq = 48) => dt < 0 ? 0 : amp * Math.exp(-dt / decay) * Math.cos(dt / freq);
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const lt = (c, k) => c.map(v => v + (255 - v) * k), mixc = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);

  /* a monster with its feet at (x, y), h px tall; spec is a chibi spec, or { img } for the pixel art */
  function mon(c, spec, x, y, h, pose, t, o = {}) {
    if (!spec) return;
    c.save(); c.translate(x, y); c.scale((o.sx || 1) * (o.flip ? -1 : 1), o.sy || 1);
    if (o.alpha != null) c.globalAlpha *= cl(o.alpha); if (o.filter) c.filter = o.filter;
    if (spec.img) { const k = h / spec.img.height; c.imageSmoothingEnabled = false; c.drawImage(spec.img, -spec.img.width * k / 2, -spec.img.height * k, spec.img.width * k, spec.img.height * k); }
    else { const u = h / (CHIBI.height(spec.stage, spec.marks || [], spec.family) + 8); c.scale(u, u); c.translate(-100, -188); CHIBI.draw(c, spec, pose, t); }
    c.restore();
  }
  /* the drawing cut into square bits, each with its screen spot and colour */
  function toBits(spec, x, y, h, bs, pose = 'idle') {
    const W = Math.ceil(h * 1.9), H = Math.ceil(h * 1.35), fy = H * 0.94, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); mon(c, spec, W / 2, fy, h, pose, 600);
    const d = c.getImageData(0, 0, W, H).data, out = [];
    for (let j = bs / 2; j < H; j += bs) for (let i = bs / 2; i < W; i += bs) { const k = ((j | 0) * W + (i | 0)) * 4;
      if (d[k + 3] > 150) out.push({ x: x + i - W / 2, y: y + j - fy, c: [d[k], d[k + 1], d[k + 2]] }); }
    return out;
  }
  const famOf = spec => { if (!spec || spec.img) return 'pop'; const f = spec.family, of = typeof FAMILY !== 'undefined' && FAMILY[f] && FAMILY[f].of; return of ? of[0] : f; };
  const poseWith = (name, extra) => Object.assign(CHIBI.blend(name, name, 0), extra);
  function star(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath();
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? r * 0.3 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore(); }
  function rays(c, x, y, n, len, rot, col, a) {
    c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = rgba(col, a);
    for (let k = 0; k < n; k++) { const a0 = k * Math.PI * 2 / n; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, len, a0 - 0.09, a0 + 0.09); c.closePath(); c.fill(); }
    c.restore();
  }
  function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(lt(col, 0.5), a)); g.addColorStop(0.45, rgba(col, a * 0.45)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }

  /* ---------- the entrances: how each family steps out of the light ----------
     each returns { dx, dy, sx, sy, pose, alpha, filter } for the monster, and may draw extras under or over it */
  const ENTER = {
    Chomp(tt, H) { const k = seg(tt, 0, 420), land = tt - 420, sp = spring(land, 0.28);
      return { dy: -H * 0.42 * (1 - k * k), sx: 1 + sp, sy: 1 - sp, pose: tt < 420 ? 'jump' : tt < 620 ? 'land' : tt < 1150 ? (Math.floor((tt - 620) / 140) % 2 ? 'chomp' : 'bitewide') : 'happy' }; },
    Squib(tt, H, W) { const k = out3(seg(tt, 0, 950));
      return { dy: -H * 0.3 * (1 - k), dx: Math.sin(tt / 260) * W * 0.03 * (1 - k), pose: tt < 950 ? 'hover' : 'happy' }; },
    Antik(tt) { const on = tt > 640, flick = !on && (Math.floor(tt / 70) % 3 === 0);
      return { pose: tt < 900 ? 'idle' : 'happy', filter: on ? null : flick ? 'brightness(1.6)' : 'grayscale(1) brightness(0.45)', sx: on ? 1 + spring(tt - 640, 0.08) : 1, sy: on ? 1 - spring(tt - 640, 0.08) : 1,
        over(c, x, y, h) { if (on) return; c.save(); c.globalAlpha = 0.5; const r = rng(Math.floor(tt / 50) + 7);
          for (let k = 0; k < 14; k++) { c.fillStyle = r() > 0.5 ? '#fff' : '#555'; c.fillRect(x - h * 0.42 + r() * h * 0.84, y - h * 0.9 + r() * h * 0.8, h * (0.08 + r() * 0.3), 2 + r() * 3); } c.restore(); } }; },
    Moko(tt, H) { const k = back(seg(tt, 0, 380)), open = tt > 720;
      return { sx: k, sy: k, pose: open ? (tt < 1000 ? poseWith('idle', { eyes: 'open' }) : 'happy') : poseWith('idle', { eyes: 'shut' }),
        over(c, x, y, h) { if (tt > 720 && tt < 1150) { const p = seg(tt, 720, 1150); star(c, x + h * 0.28, y - h * 0.78, h * 0.09 * Math.sin(p * Math.PI), '#fff'); } } }; },
    Pinch(tt, H, W) { const k = out3(seg(tt, 0, 650));
      return { dx: W * 0.6 * (1 - k), pose: tt < 650 ? 'walk' : tt < 1250 ? (Math.floor((tt - 650) / 150) % 2 ? 'swipeup' : 'guard') : 'happy', t: tt * 2.2 }; },
    Stilt(tt) { const k = back(seg(tt, 80, 650));
      return { sy: 0.3 + 0.7 * k, sx: 1 + (1 - k) * 0.25, pose: tt < 650 ? 'crouch' : tt < 900 ? 'idle' : 'happy' }; },
    Skit(tt, H) { const k = seg(tt, 0, 600), dy = tt < 600 ? -H * 0.48 * (1 - k * k) : -spring(tt - 600, H * 0.06, 160, 70) - H * 0.0;
      return { dy, pose: tt < 900 ? 'hover' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 950, 1200); if (a <= 0) return; c.strokeStyle = `rgba(240,240,255,${0.85 * a})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y + dy - h * 0.55); c.stroke(); } }; },
    Booly(tt, H) { const a = seg(tt, 0, 750);
      return { alpha: a, dy: -Math.sin(tt / 380) * H * 0.012, pose: tt < 760 ? 'hover' : tt < 1050 ? 'swipeup' : 'happy',
        under(c, x, y, h) { const r = rng(5); for (let k = 0; k < 7; k++) { const p = seg(tt, k * 60, 900 + k * 60), ang = r() * 7;
          c.fillStyle = `rgba(240,240,255,${0.55 * (1 - p) * (p > 0)})`; c.beginPath(); c.arc(x + Math.cos(ang) * h * 0.5 * p, y - h * 0.45 + Math.sin(ang) * h * 0.35 * p, h * (0.12 + 0.18 * p), 0, 7); c.fill(); } } }; },
    /* the five families added 14 Nov 2026 */
    Plod(tt, H, W) { const k = seg(tt, 0, 900), st = Math.floor(tt / 225), bump = tt < 900 ? Math.abs(Math.sin(tt / 225 * Math.PI)) : 0, land = tt - 1000, sp = spring(land, 0.16);
      return { dx: W * 0.55 * (1 - k), dy: -bump * H * 0.02, sx: 1 + (tt > 1000 ? sp : 0), sy: 1 - (tt > 1000 ? sp : 0), pose: tt < 900 ? 'walk' : tt < 1000 ? 'crouch' : 'happy', t: tt * 1.4,
        under(c, x, y, h) { if (tt > 1000 && tt < 1400) { const p = seg(tt, 1000, 1400); c.fillStyle = `rgba(200,180,150,${0.5 * (1 - p)})`; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(x + sd * h * (0.3 + p * 0.4), y, h * 0.16 * (1 + p), h * 0.05, 0, 0, 7); c.fill(); } } } }; },
    Bipped(tt, H, W) { const k = out3(seg(tt, 0, 700));   // it walks in and throws two jabs at the air, like a boxer warming up
      return { dx: -W * 0.55 * (1 - k), pose: tt < 700 ? 'walk' : tt < 1150 ? (Math.floor((tt - 700) / 150) % 2 ? 'punch' : 'punchwind') : 'happy', t: tt * 1.6 }; },
    Fizz(tt, H, W) { const shake = tt < 650 ? Math.sin(tt / 28) * W * 0.01 * seg(tt, 0, 650) : 0, pop = tt > 650 ? spring(tt - 650, H * 0.12, 200, 90) : 0;
      return { dx: shake, dy: -pop, sy: tt < 650 ? 1 - 0.18 * seg(tt, 0, 650) : 1 + (tt < 760 ? 0.12 : 0), sx: tt < 650 ? 1 + 0.1 * seg(tt, 0, 650) : 1, pose: tt < 650 ? 'crouch' : tt < 1000 ? 'jump' : 'happy',
        over(c, x, y, h) { const r = rng(9); for (let k = 0; k < 10; k++) { const p = seg(tt, 600 + k * 40, 1300 + k * 40); if (p <= 0 || p >= 1) continue;
          c.fillStyle = `rgba(255,255,255,${0.8 * (1 - p)})`; c.beginPath(); c.arc(x + (r() - 0.5) * h * 0.6, y - h * (0.9 + p * 0.6), h * 0.03 * (1 + r()), 0, 7); c.fill(); } } }; },
    Teep(tt, H, W) { const k = seg(tt, 0, 900);   // it rattles like a kettle on the boil, then hops
      return { dx: tt < 900 ? Math.sin(tt / 40) * W * 0.008 * k : 0, dy: tt > 900 && tt < 1150 ? -Math.sin(seg(tt, 900, 1150) * Math.PI) * H * 0.06 : 0, pose: tt < 900 ? 'idle' : 'happy',
        over(c, x, y, h) { for (let i = 0; i < 6; i++) { const p = ((tt / 700) + i / 6) % 1; if (tt > 1200) continue;
          c.fillStyle = `rgba(255,255,255,${0.7 * (1 - p) * Math.min(1, tt / 300)})`; c.beginPath(); c.arc(x - h * 0.55 - p * h * 0.15, y - h * (0.75 + p * 0.5), h * (0.04 + p * 0.08), 0, 7); c.fill(); } } }; },
    Lern(tt, H) { const k = out3(seg(tt, 0, 800)), lit = tt > 850;
      return { dy: -H * 0.35 * (1 - k) - Math.sin(tt / 400) * H * 0.01, pose: tt < 800 ? 'hover' : tt < 1100 ? 'idle' : 'happy', filter: lit ? null : 'brightness(0.45)',
        under(c, x, y, h) { if (!lit) return; const a = 1 - seg(tt, 850, 1500) * 0.6, g = c.createRadialGradient(x, y - h * 0.5, 2, x, y - h * 0.5, h * 0.9);
          g.addColorStop(0, `rgba(255,230,160,${0.55 * a})`); g.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g; c.fillRect(x - h, y - h * 1.4, h * 2, h * 1.8); } }; },
    /* the twelve families added 15 Nov 2026 */
    Puff(tt, H) { const k = back(seg(tt, 0, 600));   // it sprouts out of the ground like a mushroom, then puffs out spores
      return { sy: Math.max(0.08, k), sx: 0.7 + 0.3 * Math.min(1, k), pose: tt < 650 ? 'crouch' : tt < 950 ? 'idle' : 'happy',
        over(c, x, y, h) { const r = rng(21); for (let i = 0; i < 12; i++) { const p = seg(tt, 600 + i * 30, 1500 + i * 30); if (p <= 0 || p >= 1) continue; const ang = -Math.PI * (0.1 + r() * 0.8);
          c.fillStyle = `rgba(255,236,170,${0.85 * (1 - p)})`; c.beginPath(); c.arc(x + Math.cos(ang) * h * 0.7 * p, y - h * 0.7 + Math.sin(ang) * h * 0.5 * p + p * p * h * 0.3, h * 0.025, 0, 7); c.fill(); } } }; },
    Flit(tt, H, W) { const k = out3(seg(tt, 0, 950));   // it flutters in on a zigzag and hangs in the air
      return { dx: -W * 0.5 * (1 - k), dy: -H * 0.25 * (1 - k) + Math.sin(tt / 70) * H * 0.02 * (1 - k) - Math.sin(tt / 300) * H * 0.012, pose: tt < 950 ? 'hover' : tt < 1200 ? 'idle' : 'happy', t: tt * 2 }; },
    Glop(tt, H) { const k = seg(tt, 0, 520), land = tt - 520, sp = spring(land, 0.45, 180, 60);   // a drip that falls and splats into shape
      return { dy: -H * 0.5 * (1 - k * k), sx: tt < 520 ? 0.75 : 1 + sp, sy: tt < 520 ? 1.3 : 1 - sp, pose: tt < 800 ? 'idle' : 'happy',
        under(c, x, y, h) { const p = seg(tt, 520, 1100); if (p <= 0 || p >= 1) return; for (let i = 0; i < 8; i++) { const ang = Math.PI + (i + 0.5) / 8 * Math.PI, r = h * (0.3 + p * 0.6);
          c.fillStyle = `rgba(150,220,255,${0.8 * (1 - p)})`; c.beginPath(); c.arc(x + Math.cos(ang) * r, y + Math.sin(ang) * r * 0.5 + p * p * h * 0.3, h * 0.04, 0, 7); c.fill(); } } }; },
    Tock(tt, H, W) { const step = Math.min(5, Math.floor(tt / 160)), done = tt > 900;   // it ticks in one step at a time, then rings
      return { dx: W * 0.5 * (1 - step / 5), dy: tt < 800 && tt % 160 < 60 ? -H * 0.015 : 0, pose: !done ? 'walk' : tt < 1300 ? 'idle' : 'happy', t: step * 220,
        over(c, x, y, h) { if (!done || tt > 1500) return; const a = 1 - seg(tt, 900, 1500), w = Math.sin(tt / 30) * h * 0.02; c.strokeStyle = `rgba(255,236,150,${a})`; c.lineWidth = 2;
          for (const sd of [-1, 1]) for (let i = 1; i <= 2; i++) { c.beginPath(); c.arc(x + w, y - h * 0.62, h * (0.32 + i * 0.1), sd > 0 ? -0.9 : Math.PI + 0.3, sd > 0 ? -0.3 : Math.PI + 0.9); c.stroke(); } } }; },
    Mitt(tt, H) { const k = seg(tt, 0, 480), land = tt - 480, sp = spring(land, 0.25);   // it drops in and throws one big punch at the air
      return { dy: -H * 0.4 * (1 - k * k), sx: 1 + (tt > 480 ? sp : 0), sy: 1 - (tt > 480 ? sp : 0), pose: tt < 480 ? 'jump' : tt < 650 ? 'land' : tt < 850 ? 'punchwind' : tt < 1150 ? 'punch' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 850, 1150); if (p > 0 && p < 1) star(c, x + h * 0.7, y - h * 0.5, h * 0.14 * Math.sin(p * Math.PI), '#ffe08a'); } }; },
    Brolly(tt, H, W) { const k = seg(tt, 0, 1100);   // it floats down like an open umbrella, rocking side to side
      return { dy: -H * 0.5 * (1 - k), dx: Math.sin(tt / 220) * W * 0.05 * (1 - k), pose: tt < 1100 ? 'hover' : tt < 1250 ? 'land' : 'happy',
        over(c, x, y, h) { const a = 1 - seg(tt, 900, 1300); if (a <= 0) return; c.strokeStyle = `rgba(170,210,255,${0.7 * a})`; c.lineWidth = 1.5; const r = rng(31);
          for (let i = 0; i < 14; i++) { const px = x + (r() - 0.5) * h * 1.6, py = ((tt / 2 + r() * 400) % (h * 1.3)) + y - h * 1.4; c.beginPath(); c.moveTo(px, py); c.lineTo(px - 2, py + 7); c.stroke(); } } }; },
    Spine(tt, H) { const k = out3(seg(tt, 0, 800));   // it pushes up out of the sand, then its needles glint
      return { dy: H * 0.25 * (1 - k), dx: tt < 800 ? Math.sin(tt / 35) * 2 : 0, pose: tt < 800 ? 'idle' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 700, 1100); if (a <= 0) return; c.fillStyle = `rgba(220,190,130,${0.7 * a})`; c.beginPath(); c.ellipse(x, y + 2, h * 0.55, h * 0.09, 0, 0, 7); c.fill(); },
        over(c, x, y, h) { for (let i = 0; i < 3; i++) { const p = seg(tt, 850 + i * 120, 1150 + i * 120); if (p > 0 && p < 1) star(c, x + (i - 1) * h * 0.3, y - h * (0.55 + (i % 2) * 0.2), h * 0.07 * Math.sin(p * Math.PI), '#fff'); } } }; },
    Burr(tt, H) { const k = out3(seg(tt, 250, 900));   // dirt flies out of a hole, then it pops its head up
      return { dy: H * 0.32 * (1 - k), pose: tt < 900 ? 'idle' : tt < 1150 ? 'swipeup' : 'happy',
        under(c, x, y, h) { if (tt > 1200) return; c.fillStyle = 'rgba(110,80,50,.7)'; c.beginPath(); c.ellipse(x, y + 2, h * 0.5, h * 0.08, 0, 0, 7); c.fill(); },
        over(c, x, y, h) { const r = rng(41); for (let i = 0; i < 10; i++) { const p = seg(tt, i * 50, 600 + i * 50); if (p <= 0 || p >= 1) continue; const sd = r() > 0.5 ? 1 : -1, vx = sd * h * (0.3 + r() * 0.4);
          c.fillStyle = `rgba(140,100,60,${1 - p})`; c.beginPath(); c.arc(x + vx * p, y - h * 0.8 * Math.sin(p * Math.PI) * (0.6 + r() * 0.4), h * 0.035, 0, 7); c.fill(); } } }; },
    /* batch 3, 16 Nov 2026 */
    Wick(tt, H) { const lit = tt > 700;   // it stands dark, a match strikes, and the flame catches
      return { pose: tt < 1000 ? 'idle' : 'happy', filter: lit ? null : 'brightness(0.4)', sx: lit ? 1 + spring(tt - 700, 0.1) : 1, sy: lit ? 1 - spring(tt - 700, 0.1) : 1,
        under(c, x, y, h) { if (lit) glow(c, x, y - h * 0.9, h * 0.8, [255, 170, 60], 0.45 * (1 - seg(tt, 700, 1500) * 0.6)); },
        over(c, x, y, h) { const p = seg(tt, 300, 700); if (p > 0 && p < 1) { const mx = x - h * 0.6 + p * h * 0.6, my = y - h * 1.1; c.strokeStyle = '#b07a40'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(mx - h * 0.25, my + h * 0.12); c.lineTo(mx, my); c.stroke();
            c.fillStyle = '#ff9a3c'; c.beginPath(); c.arc(mx, my, 5 + 3 * Math.sin(tt / 30), 0, 7); c.fill(); }
          const s = seg(tt, 650, 1000); if (s > 0 && s < 1) for (let i = 0; i < 8; i++) { const a = i / 8 * 7; c.fillStyle = `rgba(255,200,90,${1 - s})`; c.beginPath(); c.arc(x + Math.cos(a) * h * 0.4 * s, y - h * 1.05 + Math.sin(a) * h * 0.3 * s, 2.5, 0, 7); c.fill(); } } }; },
    Lumo(tt, H, W) { const k = out3(seg(tt, 0, 1000));   // it drifts down from the dark trailing light, and its lamp pulses on
      return { dx: W * 0.3 * (1 - k) * Math.cos(tt / 200), dy: -H * 0.4 * (1 - k) - Math.sin(tt / 300) * H * 0.01, pose: tt < 1000 ? 'hover' : tt < 1250 ? 'idle' : 'happy',
        under(c, x, y, h) { for (let i = 1; i < 10; i++) { const t2 = tt - i * 50; if (t2 < 0 || t2 > 1000) continue; const k2 = out3(seg(t2, 0, 1000)), px = x - W * 0.3 * (1 - k) * Math.cos(tt / 200) + W * 0.3 * (1 - k2) * Math.cos(t2 / 200), py = y + H * 0.4 * (1 - k) - H * 0.4 * (1 - k2);
            c.fillStyle = `rgba(240,255,140,${0.6 * (1 - i / 10)})`; c.beginPath(); c.arc(px, py - h * 0.2, 4 - i * 0.3, 0, 7); c.fill(); }
          const p = seg(tt, 1000, 1600); if (p > 0 && p < 1) { c.strokeStyle = `rgba(240,255,140,${1 - p})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y - h * 0.3, h * (0.2 + p * 0.6), 0, 7); c.stroke(); } } }; },
    Snooze(tt, H) { const k = seg(tt, 0, 450), land = tt - 450;   // it drops flat like a thrown pillow, squashes, and feathers puff out
      return { dy: -H * 0.42 * (1 - k * k), sx: tt < 450 ? 1 : 1 + spring(land, 0.35, 220, 60), sy: tt < 450 ? 1 : 1 - spring(land, 0.35, 220, 60), pose: tt < 450 ? 'jump' : tt < 1100 ? poseWith('idle', { eyes: 'shut' }) : 'happy',
        over(c, x, y, h) { const r = rng(61); for (let i = 0; i < 9; i++) { const p = seg(tt, 450 + i * 20, 1500 + i * 30); if (p <= 0 || p >= 1) continue; const vx = (r() - 0.5) * h * 1.6, vy = -h * (0.3 + r() * 0.4);
            c.save(); c.translate(x + vx * p, y - h * 0.3 + vy * Math.sin(p * Math.PI) + p * h * 0.2); c.rotate(Math.sin(tt / 150 + i) * 0.8); c.fillStyle = `rgba(255,255,255,${1 - p})`; c.beginPath(); c.ellipse(0, 0, h * 0.05, h * 0.018, 0, 0, 7); c.fill(); c.restore(); } } }; },
    Inky(tt, H) { const k = out3(seg(tt, 250, 950));   // a drop of ink falls into a puddle, and it rises out of the splash
      return { sy: Math.max(0.05, k), sx: 1 + (1 - k) * 0.4, pose: tt < 950 ? 'idle' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 900, 1400); if (a > 0) { c.fillStyle = `rgba(30,30,50,${0.8 * a})`; c.beginPath(); c.ellipse(x, y + 1, h * 0.6 * Math.min(1, tt / 300), h * 0.09, 0, 0, 7); c.fill(); }
          if (tt < 260) { c.fillStyle = 'rgba(30,30,50,.9)'; c.beginPath(); c.ellipse(x, y - h * 1.2 + (tt / 260) * h * 1.2, h * 0.05, h * 0.08, 0, 0, 7); c.fill(); } },
        over(c, x, y, h) { const p = seg(tt, 250, 800); if (p <= 0 || p >= 1) return; for (let i = 0; i < 8; i++) { const a = Math.PI + (i + 0.5) / 8 * Math.PI, r = h * (0.2 + p * 0.5); c.fillStyle = `rgba(30,30,50,${1 - p})`; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7 + p * p * h * 0.3, h * 0.035, 0, 7); c.fill(); } } }; },
    Cobble(tt, H, W) { const k = seg(tt, 0, 900), hop = Math.abs(Math.sin(k * Math.PI * 3)) * (1 - k);   // it bounces in like a skipped stone, three hops, and lands with a thud
      return { dx: W * 0.55 * (1 - out3(k)), dy: -hop * H * 0.12, sx: tt > 900 ? 1 + spring(tt - 900, 0.18) : 1, sy: tt > 900 ? 1 - spring(tt - 900, 0.18) : 1, pose: tt < 900 ? 'jump' : tt < 1100 ? 'land' : 'happy',
        under(c, x, y, h) { for (let i = 0; i < 4; i++) { const p = seg(tt, i * 300, i * 300 + 500); if (p <= 0 || p >= 1) continue; c.fillStyle = `rgba(190,170,140,${0.5 * (1 - p)})`; c.beginPath(); c.ellipse(x + (W * 0.55 * (i < 3 ? 1 - out3(i / 3) : 0) - W * 0.55 * (1 - out3(k))), y, h * (0.2 + p * 0.4), h * 0.05, 0, 0, 7); c.fill(); } } }; },
    Nimbo(tt, H) { const a = seg(tt, 100, 800);   // mist drifts in from both sides and gathers into a cloud, then it rains and thunder flashes
      return { alpha: a, dy: -Math.sin(tt / 400) * H * 0.01, pose: tt < 900 ? 'hover' : tt < 1200 ? 'idle' : 'happy', filter: tt > 950 && tt < 1050 ? 'brightness(1.8)' : null,
        under(c, x, y, h) { for (let i = 0; i < 8; i++) { const sd = i % 2 ? 1 : -1, p = seg(tt, i * 40, 800 + i * 40), r = h * (0.18 + (i % 3) * 0.05); if (p >= 1) continue;
            c.fillStyle = `rgba(240,245,255,${0.6 * (1 - p * 0.7)})`; c.beginPath(); c.arc(x + sd * h * (1.3 - p * 1.1), y - h * 0.5 + ((i >> 1) - 1.5) * h * 0.12, r, 0, 7); c.fill(); }
          const rp = seg(tt, 800, 1600); if (rp > 0 && rp < 1) for (let i = 0; i < 10; i++) { const ph = (rp * 3 + i * 0.13) % 1; c.strokeStyle = `rgba(150,200,250,${1 - rp})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + (i - 4.5) * h * 0.08, y + ph * h * 0.6); c.lineTo(x + (i - 4.5) * h * 0.08 - 2, y + ph * h * 0.6 + 8); c.stroke(); } } }; },
    Dango(tt, H) { const hops = [[0, 420, 0.42], [420, 720, 0.16], [720, 920, 0.06]], seg0 = hops.find(([a, b]) => tt >= a && tt < b);   // it drops and bounces on its stick, three bounces, each smaller
      const dy = seg0 ? (seg0[0] === 0 ? -H * seg0[2] * (1 - seg(tt, 0, 420) ** 2) : -H * seg0[2] * Math.sin(seg(tt, seg0[0], seg0[1]) * Math.PI)) : 0, land = tt >= 420 && tt < 470 || tt >= 720 && tt < 760;
      return { dy, sx: land ? 1.12 : 1, sy: land ? 0.88 : 1, pose: tt < 920 ? 'jump' : tt < 1100 ? 'land' : 'happy',
        over(c, x, y, h) { if (tt < 920 || tt > 1500) return; const p = seg(tt, 920, 1500); for (let i = 0; i < 5; i++) { c.save(); c.translate(x + (i - 2) * h * 0.25 * p * 1.6, y - h * (0.6 + Math.sin(p * Math.PI) * 0.4)); c.rotate(p * 4 + i); c.fillStyle = `rgba(255,190,210,${1 - p})`; c.beginPath(); c.ellipse(0, 0, h * 0.04, h * 0.022, 0, 0, 7); c.fill(); c.restore(); } } }; },
    Oaklet(tt, H) { const g0 = back(seg(tt, 550, 1100));   // an acorn drops, plants itself in the ground, and it sprouts up out of the spot
      return { sy: Math.max(0.04, g0), sx: 0.6 + 0.4 * Math.min(1, g0), pose: tt < 1100 ? 'crouch' : tt < 1300 ? 'idle' : 'happy',
        under(c, x, y, h) { if (tt < 560) { const k = seg(tt, 0, 450); c.fillStyle = '#9a6a3c'; c.beginPath(); c.ellipse(x, y - h * 1.1 * (1 - k * k) - h * 0.06, h * 0.07, h * 0.09, 0, 0, 7); c.fill(); c.fillStyle = '#6b4a2a'; c.beginPath(); c.ellipse(x, y - h * 1.1 * (1 - k * k) - h * 0.12, h * 0.08, h * 0.045, 0, Math.PI, 0); c.fill(); }
          const a = 1 - seg(tt, 1100, 1500); if (tt > 450 && a > 0) { c.fillStyle = `rgba(120,85,55,${0.7 * a})`; c.beginPath(); c.ellipse(x, y + 1, h * 0.3, h * 0.05, 0, 0, 7); c.fill(); } },
        over(c, x, y, h) { const p = seg(tt, 1000, 1700); if (p <= 0 || p >= 1) return; for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.1 + i * 0.16); c.save(); c.translate(x + Math.cos(a) * h * 0.7 * p, y - h * 0.8 + Math.sin(a) * h * 0.5 * p + p * p * h * 0.4); c.rotate(p * 5 + i);
            c.fillStyle = `rgba(110,180,80,${1 - p})`; c.beginPath(); c.ellipse(0, 0, h * 0.05, h * 0.025, 0, 0, 7); c.fill(); c.restore(); } } }; },
    Roly(tt, H, W) { const k = out3(seg(tt, 0, 800)), un = tt > 800;   // it rolls in curled up in a ball, stops, and uncurls
      return { dx: W * 0.6 * (1 - k), sx: un ? 1 + spring(tt - 800, 0.15) : 0.7, sy: un ? 1 - spring(tt - 800, 0.15) : 0.7, dy: un ? 0 : -H * 0.01 * Math.abs(Math.sin(tt / 60)), pose: tt < 800 ? 'crouch' : tt < 1000 ? 'idle' : 'happy',
        under(c, x, y, h) { if (tt > 1000) return; for (let i = 0; i < 4; i++) { const ph = (tt / 300 + i / 4) % 1; c.fillStyle = `rgba(200,180,150,${0.5 * (1 - ph)})`; c.beginPath(); c.arc(x + h * (0.3 + ph * 0.5), y - ph * h * 0.1, h * (0.04 + ph * 0.05), 0, 7); c.fill(); } } }; },
    Trundle(tt, H, W) { const k = seg(tt, 0, 1100);   // it slides in slowly on a shiny trail, then stretches up and looks around
      return { dx: -W * 0.35 * (1 - k), sy: tt > 1100 && tt < 1400 ? 1 + 0.08 * Math.sin(seg(tt, 1100, 1400) * Math.PI) : 1, pose: tt < 1100 ? 'walk' : tt < 1300 ? 'idle' : 'happy', t: tt * 0.6,
        under(c, x, y, h) { const a = 1 - seg(tt, 1200, 1800); if (a <= 0) return; const len = W * 0.35 * k + h * 0.2; c.fillStyle = `rgba(200,230,255,${0.5 * a})`; c.beginPath(); c.ellipse(x - len / 2 - h * 0.1, y + 1, len / 2, h * 0.025, 0, 0, 7); c.fill();
          for (let i = 0; i < 4; i++) if (Math.sin(tt / 120 + i * 2) > 0.5) star(c, x - h * 0.2 - i * len / 4, y - 2, h * 0.02, `rgba(255,255,255,${a})`); } }; },
    Clank(tt, H, W) { const wound = tt < 600, step = Math.min(4, Math.floor(Math.max(0, tt - 600) / 140));   // the key winds, it rattles, then it marches in stiffly, one jerk at a time
      return { dx: wound ? W * 0.45 : W * 0.45 * (1 - step / 4), dy: wound ? 0 : (tt - 600) % 140 < 50 && tt < 1160 ? -H * 0.012 : 0, sx: wound ? 1 + Math.sin(tt / 25) * 0.03 : 1, pose: tt < 1160 ? 'walk' : tt < 1300 ? 'idle' : 'happy', t: step * 260,
        over(c, x, y, h) { if (!wound) return; for (let i = 0; i < 3; i++) { const p = ((tt / 200) + i / 3) % 1; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - p)})`; c.lineWidth = 2; c.beginPath(); c.arc(x + h * 0.45, y - h * 0.5, h * (0.08 + p * 0.12), -0.8, 0.8); c.stroke(); } } }; },
    Crease(tt, H) { const k = out3(seg(tt, 0, 700)), f = back(seg(tt, 650, 1050));   // a flat sheet of paper drifts down, then folds itself up
      return { dy: -H * 0.35 * (1 - k) + Math.sin(tt / 160) * H * 0.02 * (1 - k), sx: tt < 650 ? 1.7 : 1.7 - 0.7 * f, sy: tt < 650 ? 0.12 : 0.12 + 0.88 * f, pose: tt < 1050 ? 'hover' : tt < 1250 ? 'idle' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 650, 1050); if (p <= 0 || p >= 1) return; c.strokeStyle = `rgba(255,255,255,${1 - p})`; c.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + p * 3; c.beginPath(); c.moveTo(x, y - h * 0.5); c.lineTo(x + Math.cos(a) * h * 0.6 * (1 - p), y - h * 0.5 + Math.sin(a) * h * 0.4 * (1 - p)); c.stroke(); } } }; },
    Twiglet(tt, H) { const k = seg(tt, 0, 420), land = tt - 420;   // the pot drops with a thunk, then leaves swirl up and settle
      return { dy: -H * 0.4 * (1 - k * k), sx: tt > 420 ? 1 + spring(land, 0.14) : 1, sy: tt > 420 ? 1 - spring(land, 0.14) : 1, pose: tt < 420 ? 'jump' : tt < 650 ? 'land' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 450, 1500); if (p <= 0 || p >= 1) return; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + p * 5, r = h * (0.25 + p * 0.5); c.save(); c.translate(x + Math.cos(a) * r, y - h * 0.7 + Math.sin(a) * r * 0.4 - p * h * 0.2); c.rotate(a);
            c.fillStyle = `rgba(${i % 2 ? '255,190,210' : '120,190,90'},${1 - p})`; c.beginPath(); c.ellipse(0, 0, h * 0.045, h * 0.022, 0, 0, 7); c.fill(); c.restore(); } } }; },
    Swirl(tt, H, W) { const shake = tt < 700 ? Math.sin(tt / 22) * W * 0.02 * seg(tt, 0, 300) : 0;   // something shakes it hard, then a burst of snow
      return { dx: shake, sy: tt > 700 && tt < 900 ? 1.06 : 1, pose: tt < 700 ? 'idle' : tt < 900 ? 'jump' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 650, 1700); if (p <= 0 || p >= 1) return; const r = rng(81); for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, d = h * (0.2 + r() * 0.7) * Math.min(1, p * 2);
            c.fillStyle = `rgba(255,255,255,${1 - p})`; c.beginPath(); c.arc(x + Math.cos(a) * d, y - h * 0.5 + Math.sin(a) * d * 0.6 + p * p * h * 0.3, 1.5 + r() * 2, 0, 7); c.fill(); } } }; },
    Ditty(tt, H) { const beat = Math.floor(tt / 300), ph = (tt % 300) / 300;   // it bounces in time to its own tune, three beats, and notes float up
      return { dy: beat < 3 ? -Math.sin(ph * Math.PI) * H * 0.05 : 0, sx: beat < 3 && ph < 0.12 ? 1.08 : 1, sy: beat < 3 && ph < 0.12 ? 0.92 : 1, pose: beat < 3 ? 'jump' : tt < 1100 ? 'idle' : 'happy',
        over(c, x, y, h) { for (let i = 0; i < 5; i++) { const p = seg(tt, i * 200, 900 + i * 200); if (p <= 0 || p >= 1) continue; const nx = x + (i - 2) * h * 0.18 + Math.sin(p * 6 + i) * 6, ny = y - h * (0.9 + p * 0.6);
            c.fillStyle = `rgba(255,${180 + i * 10},220,${1 - p})`; c.beginPath(); c.ellipse(nx, ny, 3.6, 2.6, -0.4, 0, 7); c.fill(); c.fillRect(nx + 2.4, ny - 12, 1.8, 12); } } }; },
    Sizzle(tt, H) { const k = seg(tt, 0, 380), land = tt - 380, pop = tt > 380 && tt < 700;   // it pops up out of nowhere like toast, lands, and steam puffs off it
      return { dy: tt < 380 ? -H * 0.45 * Math.sin(k * Math.PI * 0.5 + Math.PI * 0.5) : 0, sx: tt > 380 ? 1 + spring(land, 0.18) : 1, sy: tt > 380 ? 1 - spring(land, 0.18) : 1, pose: tt < 380 ? 'jump' : tt < 600 ? 'land' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 400, 1500); if (p <= 0 || p >= 1) return; for (let i = 0; i < 4; i++) { const q = (p + i / 4) % 1; c.fillStyle = `rgba(255,255,255,${0.6 * (1 - q) * (1 - p)})`; c.beginPath(); c.arc(x + (i - 1.5) * h * 0.15 + Math.sin(q * 6) * 4, y - h * (0.9 + q * 0.5), h * (0.05 + q * 0.06), 0, 7); c.fill(); } } }; },
    Aero(tt, H, W) { const k = out3(seg(tt, 0, 1000));   // a gust carries it in on a long curve, with wind streaks behind it
      return { dx: -W * 0.55 * (1 - k), dy: -H * 0.3 * Math.sin((1 - k) * Math.PI), pose: tt < 1000 ? 'hover' : tt < 1200 ? 'idle' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 900, 1400); if (a <= 0) return; c.strokeStyle = `rgba(255,255,255,${0.6 * a})`; c.lineWidth = 2; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const yy = y - h * (0.3 + i * 0.15), len = h * (0.5 + (i % 2) * 0.3); c.beginPath(); c.moveTo(x - h * 0.4, yy); c.lineTo(x - h * 0.4 - len, yy + Math.sin(tt / 100 + i) * 3); c.stroke(); } } }; },
    Nesta(tt, H) { const k = back(seg(tt, 0, 450));   // a small doll appears, a bigger one closes over it, then a bigger one again
      const step = tt < 450 ? 0 : tt < 750 ? 1 : 2, s = [0.4, 0.7, 1][step] * (tt < 450 ? k : 1);
      return { sx: s * (tt > 450 && (tt % 300) < 60 && tt < 800 ? 1.08 : 1), sy: s * (tt > 450 && (tt % 300) < 60 && tt < 800 ? 0.92 : 1), pose: tt < 900 ? 'idle' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 750, 1300); if (p <= 0 || p >= 1) return; for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.15 + i * 0.14); c.fillStyle = `rgba(255,220,120,${1 - p})`; c.beginPath(); c.arc(x + Math.cos(a) * h * 0.6 * p, y - h * 0.5 + Math.sin(a) * h * 0.5 * p, 2.5, 0, 7); c.fill(); } } }; },
    Magna(tt, H, W) { const k = seg(tt, 0, 700), snap = tt > 700;   // something pulls it in fast, it snaps into place, and bits of metal fly in after it
      return { dx: snap ? 0 : W * 0.6 * (1 - k * k * k), sx: snap ? 1 + spring(tt - 700, 0.12) : 1.15, sy: snap ? 1 - spring(tt - 700, 0.12) : 0.88, pose: tt < 700 ? 'idle' : tt < 900 ? 'land' : 'happy',
        over(c, x, y, h) { for (let i = 0; i < 6; i++) { const p = seg(tt, 600 + i * 50, 1000 + i * 50); if (p <= 0 || p >= 1) continue; const sx = x + W * 0.5 * (1 - p) * (i % 2 ? 1 : 0.7), sy = y - h * (0.2 + (i % 3) * 0.25);
            c.save(); c.translate(sx, sy); c.rotate(p * 8 + i); c.fillStyle = '#9aa0ab'; c.fillRect(-1.5, -6, 3, 11); c.fillStyle = '#c8cdd6'; c.fillRect(-4, -8, 8, 3); c.restore(); } } }; },
    Helm(tt, H) { const k = out3(seg(tt, 100, 1000));   // it rises up through a column of bubbles
      return { dy: H * 0.3 * (1 - k), pose: tt < 1000 ? 'idle' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 1000, 1500); if (a <= 0) return; for (let i = 0; i < 14; i++) { const ph = ((tt / 700) + i / 14) % 1; c.strokeStyle = `rgba(200,235,255,${0.8 * (1 - ph) * a})`; c.lineWidth = 1.5; c.beginPath(); c.arc(x + Math.sin(i * 2.3 + ph * 4) * h * 0.35, y - ph * h * 1.3, 2 + (i % 4), 0, 7); c.stroke(); } } }; },
    Bloop(tt, H) { const k = out3(seg(tt, 0, 1000)), bob = Math.sin(tt / 160) * H * 0.02;   // it drifts down like a jellyfish, pulsing, and settles
      return { dy: -H * 0.5 * (1 - k) + bob, sx: 1 + Math.sin(tt / 120) * 0.05 * (1 - seg(tt, 900, 1200)), sy: 1 - Math.sin(tt / 120) * 0.05 * (1 - seg(tt, 900, 1200)), pose: tt < 1000 ? 'hover' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 900, 1500); if (a <= 0) return; for (let i = 0; i < 10; i++) { const ph = ((tt / 900) + i / 10) % 1; c.fillStyle = `rgba(190,220,255,${0.7 * a * (1 - ph)})`; c.beginPath(); c.arc(x + Math.sin(i * 1.7) * h * 0.4, y - h * 0.2 - ph * h * 0.9, 1.5 + (i % 3), 0, 7); c.fill(); } } }; },
    Sox(tt, H, W) { const k = seg(tt, 0, 700), land = tt - 700;   // it slides in across the floor like a sock on a polished floor and bumps to a stop
      return { dx: -W * 0.5 * (1 - out3(k)), sx: tt > 700 ? 1 + spring(land, 0.12) : 1.06, sy: tt > 700 ? 1 - spring(land, 0.12) : 0.95, pose: tt < 700 ? 'idle' : tt < 900 ? 'land' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 600, 1000); if (a <= 0) return; c.strokeStyle = `rgba(255,255,255,${0.5 * a})`; c.lineWidth = 2; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x - h * 0.3, y - i * 5); c.lineTo(x - h * 0.3 - h * (0.4 + i * 0.15), y - i * 5); c.stroke(); } } }; },
    Cuppy(tt, H) { const k = back(seg(tt, 0, 500));   // it pops up out of a cake box, and candles light one at a time
      return { sx: k, sy: k, pose: tt < 500 ? 'jump' : tt < 1200 ? 'idle' : 'happy',
        over(c, x, y, h) { for (let i = 0; i < 3; i++) { const p = seg(tt, 550 + i * 180, 1600 + i * 120); if (p <= 0 || p >= 1) continue; const fx = x + (i - 1) * h * 0.25, fy = y - h * 1.05 - Math.sin(p * Math.PI) * h * 0.1;
            c.fillStyle = `rgba(255,200,80,${1 - p})`; c.beginPath(); c.ellipse(fx, fy, 3, 6, 0, 0, 7); c.fill(); c.fillStyle = `rgba(255,255,220,${1 - p})`; c.beginPath(); c.ellipse(fx, fy + 1, 1.4, 3, 0, 0, 7); c.fill(); } } }; },
    Suds(tt, H) { const k = seg(tt, 0, 700);   // a big soap bubble floats down and pops, leaving it there
      return { alpha: tt < 700 ? 0.25 : 1, dy: -H * 0.35 * (1 - k), pose: tt < 700 ? 'hover' : tt < 900 ? 'land' : 'happy',
        over(c, x, y, h) { if (tt < 700) { const yy = y - h * 0.5 - H * 0.35 * (1 - k); c.strokeStyle = 'rgba(200,240,255,0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(x, yy, h * 0.65, 0, 7); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(x - h * 0.25, yy - h * 0.3, h * 0.08, h * 0.04, -0.6, 0, 7); c.fill(); return; }
          const p = seg(tt, 700, 1200); if (p >= 1) return; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; c.fillStyle = `rgba(200,240,255,${1 - p})`; c.beginPath(); c.arc(x + Math.cos(a) * h * (0.65 + p * 0.3), y - h * 0.5 + Math.sin(a) * h * (0.65 + p * 0.3), 2, 0, 7); c.fill(); } } }; },
    Scoop(tt, H) { const k = seg(tt, 0, 420), land = tt - 420;   // it drops into place like a scoop onto a cone, squashes, and sprinkles rain down
      return { dy: -H * 0.5 * (1 - k * k), sx: tt > 420 ? 1 + spring(land, 0.2) : 0.95, sy: tt > 420 ? 1 - spring(land, 0.2) : 1.05, pose: tt < 420 ? 'jump' : tt < 650 ? 'land' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 420, 1400); if (p <= 0 || p >= 1) return; const r = rng(23); for (let i = 0; i < 14; i++) { const sx = x + (r() - 0.5) * h * 1.2, sy = y - h * 1.3 + p * h * (0.6 + r() * 0.6);
            c.save(); c.translate(sx, sy); c.rotate(r() * 3); c.fillStyle = ['#ff6fa0', '#7fd0ff', '#ffe066', '#9be37a'][i % 4]; c.globalAlpha = 1 - p; c.fillRect(-3, -1, 6, 2); c.restore(); } } }; },
    Tome(tt, H) { const k = seg(tt, 0, 800);   // pages flutter in from both sides and close into it
      return { alpha: seg(tt, 500, 850), pose: tt < 900 ? 'idle' : 'happy',
        over(c, x, y, h) { if (tt > 900) return; for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1, d = (1 - k) * h * (0.8 + (i >> 1) * 0.2);
            c.save(); c.translate(x + side * d, y - h * (0.3 + (i >> 1) * 0.15)); c.rotate(side * (1 - k) * 2 + i); c.fillStyle = `rgba(250,244,225,${0.9 * (1 - seg(tt, 700, 900))})`; c.fillRect(-7, -9, 14, 18); c.strokeStyle = 'rgba(120,100,70,0.6)'; c.strokeRect(-7, -9, 14, 18); c.restore(); } } }; },
    Gumball(tt, H) { const k = seg(tt, 0, 450), land = tt - 450;   // it rolls out of a gumball machine chute and bounces twice
      const b = tt < 450 ? 0 : Math.abs(Math.sin((land / 450) * Math.PI * 2)) * H * 0.1 * Math.max(0, 1 - land / 900);
      return { dx: tt < 450 ? -H * 0.6 * (1 - k) : 0, dy: -b, sx: tt > 450 && b < 2 ? 1.08 : 1, sy: tt > 450 && b < 2 ? 0.92 : 1, pose: tt < 450 ? 'jump' : tt < 1350 ? 'idle' : 'happy' }; },
    Pina(tt, H) { const k = back(seg(tt, 0, 600));   // it sprouts up from the ground crown first, and a flower garland drops round it
      return { sy: k, sx: 0.7 + 0.3 * k, pose: tt < 600 ? 'idle' : tt < 1100 ? 'jump' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 600, 1400); if (p <= 0 || p >= 1) return; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + p * 2; c.fillStyle = `rgba(${i % 2 ? '255,120,170' : '255,220,90'},${1 - p})`; c.beginPath(); c.arc(x + Math.cos(a) * h * 0.5, y - h * 0.4 + Math.sin(a) * h * 0.15 - (1 - p) * h * 0.3, 3, 0, 7); c.fill(); } } }; },
    Jingle(tt, H) { const k = seg(tt, 0, 600);   // coins rain down, then it drops in on top of the pile
      return { dy: tt < 600 ? -H * 0.6 : -H * 0.6 * (1 - out3(seg(tt, 600, 900))), sx: tt > 900 ? 1 + spring(tt - 900, 0.14) : 1, sy: tt > 900 ? 1 - spring(tt - 900, 0.14) : 1, alpha: tt < 600 ? 0 : 1, pose: tt < 900 ? 'jump' : tt < 1100 ? 'land' : 'happy',
        under(c, x, y, h) { const r = rng(55); for (let i = 0; i < 12; i++) { const p = seg(tt, i * 40, 500 + i * 40); if (p <= 0) continue; const cx = x + (r() - 0.5) * h * 1.2, cy = y - h * 1.2 * (1 - Math.min(1, p)); const a = 1 - seg(tt, 1100, 1600); if (a <= 0) return;
            c.fillStyle = `rgba(255,205,60,${a})`; c.beginPath(); c.ellipse(cx, cy, 5, 2.5 + Math.abs(Math.sin(tt / 60 + i)) * 2.5, 0, 0, 7); c.fill(); } } }; },
    Presto(tt, H) { const a = seg(tt, 450, 700);   // a puff of smoke, then it bows
      return { alpha: a, pose: tt < 700 ? 'idle' : tt < 1150 ? 'swipeup' : 'happy',
        over(c, x, y, h) { const p = seg(tt, 200, 1100); if (p <= 0 || p >= 1) return; for (let i = 0; i < 9; i++) { const ang = i / 9 * Math.PI * 2; c.fillStyle = `rgba(230,225,240,${0.8 * (1 - p)})`; c.beginPath(); c.arc(x + Math.cos(ang) * h * 0.4 * (0.4 + p), y - h * 0.45 + Math.sin(ang) * h * 0.3 * (0.4 + p), h * (0.12 + p * 0.1), 0, 7); c.fill(); }
          if (tt < 900) { const q = seg(tt, 300, 900); c.fillStyle = `rgba(255,230,120,${1 - q})`; for (let i = 0; i < 5; i++) star(c, x + (i - 2) * h * 0.2, y - h * (0.9 + q * 0.4), 4, `rgba(255,230,120,${1 - q})`); } } }; },
    Vroom(tt, H, W) { const k = seg(tt, 0, 900);   // it zooms in on a zigzag, dust trailing, then parks
      return { dx: W * 0.55 * (1 - out3(k)), dy: Math.sin(k * Math.PI * 3) * H * 0.04 * (1 - k), pose: tt < 900 ? 'idle' : tt < 1100 ? 'land' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 800, 1300); if (a <= 0) return; for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(200,190,170,${0.4 * a * (1 - i / 6)})`; c.beginPath(); c.arc(x + h * 0.3 + i * h * 0.15, y - 4 - (i % 2) * 4, h * (0.06 + i * 0.02), 0, 7); c.fill(); } } }; },
    Shutter(tt, H, W) { const flash = tt > 400 && tt < 560;   // a camera flash goes off and when it fades it is there
      return { alpha: tt < 480 ? 0 : 1, pose: tt < 800 ? 'idle' : 'happy',
        over(c, x, y, h) { if (!flash) return; const p = (tt - 400) / 160; c.fillStyle = `rgba(255,255,245,${1 - p})`; c.fillRect(x - W, y - H, W * 2, H * 2); } }; },
    Yoyo(tt, H) { const down = tt < 500 ? out3(seg(tt, 0, 500)) : 1;   // it drops on a string, spins at the bottom, and the string snaps back up
      return { dy: -H * 0.6 * (1 - down), sx: tt > 500 && tt < 900 ? Math.cos((tt - 500) / 40) : 1, pose: tt < 900 ? 'idle' : 'happy',
        under(c, x, y, h) { const a = tt < 900 ? 1 : 1 - seg(tt, 900, 1100); if (a <= 0) return; const top = y - H, bot = tt < 900 ? y - h * 0.9 : y - h * 0.9 - (H - h * 0.9) * seg(tt, 900, 1100);
          c.strokeStyle = `rgba(250,250,250,${0.8 * a})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, top); c.lineTo(x, Math.max(top, bot)); c.stroke(); } }; },
    Lava(tt, H) { const k = out3(seg(tt, 100, 1000));   // it oozes up out of a glowing crack in the ground
      return { dy: H * 0.25 * (1 - k), sx: 1.2 - 0.2 * k, sy: 0.6 + 0.4 * k, pose: tt < 1000 ? 'idle' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 900, 1500); if (a <= 0) return; c.fillStyle = `rgba(255,120,40,${0.8 * a})`; c.beginPath(); c.ellipse(x, y, h * 0.6, h * 0.1, 0, 0, 7); c.fill(); c.fillStyle = `rgba(255,220,90,${0.8 * a})`; c.beginPath(); c.ellipse(x, y, h * 0.3, h * 0.05, 0, 0, 7); c.fill();
          for (let i = 0; i < 5; i++) { const ph = ((tt / 500) + i / 5) % 1; c.fillStyle = `rgba(255,${140 + i * 20},50,${a * (1 - ph)})`; c.beginPath(); c.arc(x + (i - 2) * h * 0.2, y - ph * h * 0.6, 2.5, 0, 7); c.fill(); } } }; },
    Pogo(tt, H, W) { const hop = Math.floor(tt / 330), ph = (tt % 330) / 330;   // it bounces in from the side in three big hops
      const go = Math.min(1, tt / 990);
      return { dx: -W * 0.5 * (1 - go), dy: hop < 3 ? -Math.sin(ph * Math.PI) * H * (0.25 - hop * 0.06) : 0, sx: hop < 3 && ph < 0.15 ? 1.12 : tt > 990 ? 1 + spring(tt - 990, 0.15) : 1, sy: hop < 3 && ph < 0.15 ? 0.88 : tt > 990 ? 1 - spring(tt - 990, 0.15) : 1, pose: tt < 990 ? 'jump' : tt < 1150 ? 'land' : 'happy' }; },
    /* the special Snabits */
    Eagle(tt, H, W) { const k = seg(tt, 0, 700), e = out3(k), land = tt - 700, sp = spring(land, 0.2);   // it swoops down in an arc and lands with its wings out
      return { dx: W * 0.45 * (1 - e), dy: -H * 0.45 * (1 - e) + Math.sin(k * Math.PI) * H * 0.06, sx: 1 + (tt > 700 ? sp : 0), sy: 1 - (tt > 700 ? sp : 0), pose: tt < 700 ? 'jump' : tt < 860 ? 'land' : 'happy',
        over(c, x, y, h) { for (let i = 0; i < 6; i++) { const p = seg(tt, 600 + i * 50, 1500 + i * 50); if (p <= 0 || p >= 1) continue; c.save(); c.translate(x + (i - 2.5) * h * 0.16 + Math.sin(p * 9 + i) * 8, y - h * 0.9 + p * h * 0.8); c.rotate(Math.sin(p * 7 + i));
          c.fillStyle = `rgba(250,248,240,${1 - p})`; c.beginPath(); c.ellipse(0, 0, h * 0.05, h * 0.018, 0, 0, 7); c.fill(); c.restore(); } } }; },
    Vampire(tt, H) { const a = seg(tt, 250, 800);   // a swirl of bats, then it is there, cape first
      return { alpha: a, pose: tt < 800 ? 'idle' : tt < 1150 ? 'swipeup' : 'happy',
        over(c, x, y, h) { for (let i = 0; i < 9; i++) { const p = seg(tt, i * 40, 900 + i * 40); if (p <= 0 || p >= 1) continue; const ang = i * 0.7 + p * 5, r = h * (0.15 + p * 0.9);
          const bx = x + Math.cos(ang) * r, by2 = y - h * 0.5 + Math.sin(ang) * r * 0.5, w = Math.sin(tt / 40 + i) * 0.5 + 0.6, s2 = h * 0.0016;
          c.save(); c.translate(bx, by2); c.scale(s2 * 6, s2 * 6); c.globalAlpha = 1 - p * 0.6; c.fillStyle = '#2a1d33'; c.beginPath(); c.ellipse(0, 0, 4, 5, 0, 0, 7); c.fill();
          for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, -1); c.quadraticCurveTo(sd * 7, -8 * w, sd * 14, -3 * w); c.quadraticCurveTo(sd * 8, 2, 0, 4); c.closePath(); c.fill(); } c.restore(); } } }; },
    Phoenix(tt, H) { const k = back(seg(tt, 200, 700));   // a pillar of flame, and it rises out of it
      return { sx: Math.max(0.05, k), sy: Math.max(0.05, k), dy: -H * 0.05 * Math.sin(seg(tt, 700, 1100) * Math.PI), pose: tt < 900 ? 'hover' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 700, 1300); if (a <= 0) return; for (let i = 0; i < 12; i++) { const ph = ((tt / 500) + i / 12) % 1, px = x + (i - 5.5) * h * 0.06 + Math.sin(tt / 90 + i) * 4;
          c.fillStyle = `rgba(${i % 2 ? '255,214,94' : '255,120,46'},${a * (1 - ph)})`; c.beginPath(); c.ellipse(px, y - ph * h * 1.3, h * 0.06 * (1 - ph * 0.5), h * 0.12 * (1 - ph * 0.5), 0, 0, 7); c.fill(); } } }; },
    Kitsune(tt, H) { const a = tt > 500 ? 1 : 0;   // three fox-fires circle, a puff of smoke, and it is sitting there
      return { alpha: a, sx: a ? 1 + spring(tt - 500, 0.15) : 1, sy: a ? 1 - spring(tt - 500, 0.15) : 1, pose: tt < 1000 ? 'idle' : 'happy',
        over(c, x, y, h) { for (let i = 0; i < 3; i++) { const ang = tt / 150 + i * 2.1, r = h * (0.5 - 0.3 * seg(tt, 0, 500)), fade = 1 - seg(tt, 900, 1300); if (fade <= 0) continue;
            const g = c.createRadialGradient(x + Math.cos(ang) * r, y - h * 0.5 + Math.sin(ang) * r * 0.4, 1, x + Math.cos(ang) * r, y - h * 0.5 + Math.sin(ang) * r * 0.4, h * 0.1);
            g.addColorStop(0, `rgba(255,255,255,${fade})`); g.addColorStop(0.4, `rgba(150,200,255,${0.8 * fade})`); g.addColorStop(1, 'rgba(150,200,255,0)'); c.fillStyle = g; c.fillRect(x - h, y - h * 1.2, h * 2, h * 1.4); }
          const pf = seg(tt, 450, 900); if (pf > 0 && pf < 1) for (let i = 0; i < 8; i++) { const ang = i / 8 * 7; c.fillStyle = `rgba(240,240,250,${0.7 * (1 - pf)})`; c.beginPath(); c.arc(x + Math.cos(ang) * h * 0.4 * pf, y - h * 0.4 + Math.sin(ang) * h * 0.25 * pf, h * (0.1 + 0.12 * pf), 0, 7); c.fill(); } } }; },
    Naga(tt, H) { const k = out3(seg(tt, 0, 900));   // it rises out of the ground, coil by coil
      return { dy: H * 0.3 * (1 - k), pose: tt < 900 ? 'idle' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 800, 1200); if (a <= 0) return; c.fillStyle = `rgba(120,90,60,${0.6 * a})`; c.beginPath(); c.ellipse(x, y + 2, h * 0.6, h * 0.08, 0, 0, 7); c.fill(); } }; },
    Yeti(tt, H) { const k = seg(tt, 0, 520), land = tt - 520, sp = spring(land, 0.3);   // it drops in heavily and snow bursts out
      return { dy: -H * 0.45 * (1 - k * k), sx: 1 + (tt > 520 ? sp : 0), sy: 1 - (tt > 520 ? sp : 0), pose: tt < 520 ? 'jump' : tt < 700 ? 'land' : 'happy',
        under(c, x, y, h) { const p = seg(tt, 520, 1300); if (p <= 0 || p >= 1) return; for (let i = 0; i < 10; i++) { const ang = Math.PI + i / 9 * Math.PI, r = h * (0.2 + p * 0.8);
          c.fillStyle = `rgba(245,250,255,${1 - p})`; c.beginPath(); c.arc(x + Math.cos(ang) * r, y + Math.sin(ang) * r * 0.4 + p * p * h * 0.2, h * (0.06 - p * 0.03), 0, 7); c.fill(); } } }; },
    Kraken(tt, H) { const k = out3(seg(tt, 150, 1000));   // a pool opens and it rises out of the water
      return { dy: H * 0.35 * (1 - k), pose: tt < 1000 ? 'idle' : 'happy',
        under(c, x, y, h) { const a = 1 - seg(tt, 1000, 1500); if (a <= 0) return; c.fillStyle = `rgba(40,80,160,${0.75 * a})`; c.beginPath(); c.ellipse(x, y + 2, h * 0.7 * Math.min(1, tt / 300), h * 0.1, 0, 0, 7); c.fill();
          c.strokeStyle = `rgba(200,230,255,${0.6 * a})`; c.lineWidth = 1.2; for (let i = 0; i < 2; i++) { const p = ((tt / 600) + i / 2) % 1; c.beginPath(); c.ellipse(x, y + 2, h * (0.3 + p * 0.5), h * (0.04 + p * 0.06), 0, 0, 7); c.stroke(); } } }; },
    Golem(tt, H, W) { const k = seg(tt, 0, 560), land = tt - 560, shake = tt > 560 && tt < 900 ? Math.sin(tt / 25) * W * 0.012 * (1 - seg(tt, 560, 900)) : 0;   // it drops like a boulder and the ground shakes
      return { dy: -H * 0.45 * (1 - k * k), dx: shake, sx: 1 + (tt > 560 ? spring(land, 0.12) : 0), sy: 1 - (tt > 560 ? spring(land, 0.12) : 0), pose: tt < 560 ? 'jump' : tt < 900 ? 'land' : 'happy',
        under(c, x, y, h) { const p = seg(tt, 560, 1300); if (p <= 0 || p >= 1) return; for (let i = 0; i < 8; i++) { const sd = i % 2 ? 1 : -1, d = h * (0.3 + (i >> 1) * 0.15 + p * 0.4);
          c.fillStyle = `rgba(150,140,128,${1 - p})`; c.beginPath(); c.roundRect(x + sd * d - 3, y - Math.sin(p * Math.PI) * h * 0.25 * (1 + (i >> 1) * 0.3) - 3, 6, 5, 1.5); c.fill(); } } }; },
    Unicorn(tt, H, W) { const k = out3(seg(tt, 0, 750));   // it gallops in on a rainbow trail and rears up
      return { dx: W * 0.6 * (1 - k), dy: tt < 750 ? -Math.abs(Math.sin(tt / 90)) * H * 0.02 : 0, pose: tt < 750 ? 'walk' : tt < 1050 ? 'jump' : 'happy', t: tt * 2.4,
        under(c, x, y, h) { const a = 1 - seg(tt, 750, 1400); if (a <= 0) return; const cols = ['255,140,160', '255,210,120', '150,220,170', '150,190,255', '200,160,240'], len = W * 0.6 * (1 - k) + h * 0.3;
          cols.forEach((col, i) => { c.fillStyle = `rgba(${col},${0.55 * a})`; c.fillRect(x + h * 0.15, y - h * (0.18 + i * 0.05), len, h * 0.05); }); } }; },
    Jack(tt, H) { const lit = tt > 900, fl = !lit && Math.floor(tt / 90) % 3 === 0;   // it sits dark with a candle flickering, then lights up all at once
      return { pose: tt < 1100 ? 'idle' : 'happy', filter: lit ? null : fl ? 'brightness(0.75)' : 'brightness(0.35)', sx: lit ? 1 + spring(tt - 900, 0.1) : 1, sy: lit ? 1 - spring(tt - 900, 0.1) : 1,
        under(c, x, y, h) { if (!lit) return; glow(c, x, y - h * 0.5, h * 0.9, [255, 170, 60], 0.5 * (1 - seg(tt, 900, 1600) * 0.7)); },
        over(c, x, y, h) { if (!lit) return; for (let i = 0; i < 6; i++) { const p = seg(tt, 900 + i * 60, 1700 + i * 60); if (p <= 0 || p >= 1) continue;
          c.fillStyle = `rgba(255,${180 - i * 10},70,${1 - p})`; c.beginPath(); c.arc(x + (i - 2.5) * h * 0.12 + Math.sin(p * 6 + i) * 4, y - h * (0.6 + p * 0.7), h * 0.02, 0, 7); c.fill(); } } }; },
    pop(tt) { const k = back(seg(tt, 0, 420)); return { sx: k, sy: k, pose: 'idle' }; }
  };

  /* ---------- summon ---------- */
  function summon(cv, o) {
    const c = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H * 0.44, pal = o.pal, main = pal.body, acc = pal.accent || lt(main, 0.5);
    const ph = o.photo, pa = ph.height / ph.width;
    let cw = W * 0.7, chh = cw * pa; if (chh > H * 0.5) { chh = H * 0.5; cw = chh / pa; }
    const card = { x: cx - cw / 2, y: cy - chh / 2, w: cw, h: chh }, N = 14, bs = cw / N, rows = Math.max(1, Math.round(chh / bs));
    const sm = document.createElement('canvas'); sm.width = N; sm.height = rows; const sc = sm.getContext('2d'); sc.drawImage(ph, 0, 0, N, rows);
    const sd = sc.getImageData(0, 0, N, rows).data, r = rng(99), R0 = cw * 0.42, blocks = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < N; i++) { const k = (j * N + i) * 4, hx = card.x + (i + 0.5) * bs, hy = card.y + (j + 0.5) * (chh / rows);
      blocks.push({ hx, hy, c: [sd[k], sd[k + 1], sd[k + 2]], a0: Math.atan2(hy - cy, hx - cx), r0: Math.hypot(hx - cx, hy - cy), a1: (j * N + i) / (N * rows) * Math.PI * 2 * 3 + r() * 0.3, r1: R0 * (0.75 + r() * 0.5), d: j / rows * 260 + r() * 160 }); }
    const conf = Array.from({ length: 46 }, () => ({ a: r() * 7, v: 0.35 + r() * 0.7, s: 3 + r() * 6, c: [main, acc, lt(main, 0.6), [255, 255, 255]][Math.floor(r() * 4)], spin: r() * 6 }));
    const sparks = Array.from({ length: 24 }, () => ({ x: (r() - 0.5) * cw * 0.3, d: r() * 900, v: 0.25 + r() * 0.3, s: 1.5 + r() * 2.5 }));
    const hM = Math.min(W, H) * 0.42, feet = cy + hM * 0.5, fam = famOf(o.spec), E = ENTER[fam] || ENTER.pop;
    const spin = t => { const x = seg(t, 1250, 3000); return x * x * 14 + t / 1000 * 0.4; };
    /* the build-up (shutter to burst) plays SLOW times longer than its numbers below; the entrance keeps its own pace */
    const SLOW = 1.35, BURST = 3500, toScene = t => t < BURST * SLOW ? t / SLOW : t - BURST * (SLOW - 1);
    function render(tReal) {
      const t = toScene(tReal);
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
      // the room darkens around the photo
      const dark = seg(t, 320, 700); c.fillStyle = `rgba(12,13,20,${0.97 * dark})`; c.fillRect(0, 0, W, H);
      if (t >= 3500) { glow(c, cx, cy, Math.max(W, H) * 0.6, main, 0.55); rays(c, cx, cy, 14, Math.max(W, H), t / 4000, lt(main, 0.6), 0.12); }
      // the photo: full screen, then shrinking into a card
      if (t < 1250) { const k = out3(seg(t, 320, 700)), x = card.x * k, y = card.y * k, w = W + (cw - W) * k, h = H + (chh - H) * k, b = 6 * k;
        c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(-0.04 * k); c.translate(-w / 2, -h / 2);
        if (b) { c.fillStyle = '#f5f0e2'; c.fillRect(-b, -b, w + 2 * b, h + 2 * b); }
        const scanY = t < 700 ? -1 : seg(t, 700, 1200) * h;
        c.drawImage(ph, 0, 0, w, h);
        if (scanY > 0) { c.save(); c.beginPath(); c.rect(0, 0, w, scanY); c.clip();
          for (const q of blocks) { c.fillStyle = rgba(q.c); c.fillRect(q.hx - card.x - bs / 2 - 0.5, q.hy - card.y - chh / rows / 2 - 0.5, bs + 1, chh / rows + 1); }
          c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; for (let i = 1; i < N; i++) { c.beginPath(); c.moveTo(i * bs, 0); c.lineTo(i * bs, scanY); c.stroke(); }
          for (let j = 1; j < rows; j++) { const yy = j * chh / rows; if (yy > scanY) break; c.beginPath(); c.moveTo(0, yy); c.lineTo(w, yy); c.stroke(); }
          c.restore();
          if (t < 1230) { c.fillStyle = rgba(lt(acc, 0.3), 0.95); c.fillRect(-8, scanY - 2, w + 16, 4); const g = c.createLinearGradient(0, scanY - 40, 0, scanY); g.addColorStop(0, rgba(acc, 0)); g.addColorStop(1, rgba(acc, 0.45)); c.fillStyle = g; c.fillRect(0, scanY - 40, w, 40); } }
        c.restore(); }
      // the blocks lift off and spin into a disc, then fall into the egg
      if (t >= 1250 && t < 3000) { const S = spin(t), shrink = seg(t, 2150, 2800), col = seg(t, 2800, 2980);
        const plat = seg(t, 1700, 2100) * (1 - col);
        if (plat > 0) { c.save(); c.translate(cx, cy); c.scale(1.18, 0.35 * 1.18); c.globalAlpha = plat;
          const g = c.createRadialGradient(0, 0, 0, 0, 0, R0 * 1.25); g.addColorStop(0, rgba(lt(main, 0.6), 0.9)); g.addColorStop(0.6, rgba(main, 0.55)); g.addColorStop(1, rgba(main, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R0 * 1.25, 0, 7); c.fill();
          c.strokeStyle = rgba(lt(acc, 0.4), 0.9); c.lineWidth = 3; for (const k2 of [0.55, 0.85, 1.1]) { c.beginPath(); c.arc(0, 0, R0 * k2, 0, 7); c.stroke(); }
          c.rotate(-S * 0.5); c.lineWidth = 5; for (let k2 = 0; k2 < 12; k2++) { const a = k2 * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(a) * R0 * 0.9, Math.sin(a) * R0 * 0.9); c.lineTo(Math.cos(a) * R0 * 1.05, Math.sin(a) * R0 * 1.05); c.stroke(); }
          c.restore(); }
        if (t > 2150) { glow(c, cx, cy, R0 * (1.4 + shrink), main, 0.5 * shrink); }
        if (t > 2300) { const p = seg(t, 2300, 2700) * (1 - col), w = cw * 0.34 * p * (1 + 0.15 * Math.sin(t / 60));
          const g = c.createLinearGradient(cx - w, 0, cx + w, 0); g.addColorStop(0, rgba(main, 0)); g.addColorStop(0.5, rgba(lt(main, 0.75), 0.85)); g.addColorStop(1, rgba(main, 0));
          c.fillStyle = g; c.fillRect(cx - w, 0, w * 2, cy);
          for (const s of sparks) { const q = ((t - 2300 + s.d) * s.v) % (cy + 40); c.fillStyle = rgba(lt(acc, 0.5), 0.9); c.fillRect(cx + s.x - s.s / 2, cy - q, s.s, s.s); } }
        for (const q of blocks) { const k = io3(seg(t, 1250 + q.d, 1250 + q.d + 620));
          const a = q.a0 + (q.a1 + S - q.a0) * k, rr = (q.r0 + (q.r1 * (1 - 0.35 * shrink) - q.r0) * k) * (1 - col);
          const sz = bs * (1 - 0.45 * k) * (1 - col * 0.8), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * (1 - 0.65 * k);
          c.fillStyle = rgba(mixc(q.c, lt(main, 0.3), shrink * 0.6)); c.fillRect(x - sz / 2, y - sz / 2, sz, sz); } }
      // the egg wobbles and cracks
      if (t >= 2820 && t < 3560) { const g = seg(t, 2820, 3000), wob = Math.sin(t / 55) * 0.16 * seg(t, 3000, 3480), rx = cw * 0.2 * back(g), ry = rx * 1.22;
        glow(c, cx, cy, rx * 3, main, 0.7);
        c.save(); c.translate(cx, cy + ry * 0.2); c.rotate(wob); c.translate(0, -ry * 0.2);
        c.fillStyle = rgba(lt(main, 0.15)); c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.fill();
        c.fillStyle = rgba(lt(main, 0.55)); c.beginPath(); c.ellipse(-rx * 0.3, -ry * 0.35, rx * 0.28, ry * 0.18, -0.5, 0, 7); c.fill();
        if (t > 3200) { const p = seg(t, 3200, 3480); c.strokeStyle = 'rgba(255,255,240,.95)'; c.lineWidth = 2.5; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-rx * 0.9, -ry * 0.05);
          for (let k = 1; k <= 6; k++) { if (k / 6 > p + 0.15) break; c.lineTo(-rx * 0.9 + k * rx * 0.3, -ry * 0.05 + (k % 2 ? -1 : 1) * ry * 0.16); } c.stroke(); }
        c.restore(); }
      // the burst
      if (t >= 3500 && t < 4400) { const p = seg(t, 3500, 4400);
        rays(c, cx, cy, 12, Math.max(W, H) * 0.8, p * 0.6, [255, 255, 240], 0.35 * (1 - p));
        c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - p)})`; c.lineWidth = 6 * (1 - p) + 1; c.beginPath(); c.arc(cx, cy, Math.max(W, H) * 0.55 * out3(p), 0, 7); c.stroke();
        for (const f of conf) { const d = out3(p) * Math.max(W, H) * 0.5 * f.v, x = cx + Math.cos(f.a) * d, y = cy + Math.sin(f.a) * d + p * p * H * 0.2;
          c.save(); c.translate(x, y); c.rotate(f.spin * p * 3); c.fillStyle = rgba(f.c, 1 - p * 0.8); c.fillRect(-f.s / 2, -f.s / 2, f.s, f.s); c.restore(); } }
      // the Snabit
      if (t >= 3500) { const tt = t - 3500, e = E(tt, H, W), x = cx + (e.dx || 0), y = feet + (e.dy || 0);
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(cx + (e.dx || 0), feet, hM * 0.32 * (e.alpha == null ? 1 : e.alpha), hM * 0.05, 0, 0, 7); c.fill();
        if (e.under) e.under(c, x, y, hM);
        mon(c, o.spec, x, y, hM, e.pose, e.t != null ? e.t : tt, e);
        if (e.over) e.over(c, x, y, hM);
        if (tt > 1100 && o.name) { const a = seg(tt, 1100, 1450); c.globalAlpha = a; c.font = `700 ${Math.round(W * 0.08)}px Pix, monospace`; c.textAlign = 'center';
          c.fillStyle = 'rgba(0,0,0,.45)'; c.fillText(o.name, cx + 2, feet + hM * 0.24 + 2 + (1 - a) * 12); c.fillStyle = '#f5f0e2'; c.fillText(o.name, cx, feet + hM * 0.24 + (1 - a) * 12); c.globalAlpha = 1; } }
      // shutter: a white flash and an iris snapping shut and open again, drawn last
      if (t < 340) { const k = t < 170 ? out3(t / 170) : 1 - out3((t - 170) / 170), rad = Math.hypot(W, H) * (1 - k) * 0.6;
        c.save(); c.fillStyle = 'rgba(10,10,16,.96)'; c.beginPath(); c.rect(0, 0, W, H);
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + k * 0.7; i ? c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad) : c.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
        c.closePath(); c.fill('evenodd');
        c.strokeStyle = 'rgba(70,74,96,.9)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + k * 0.7; c.beginPath(); c.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); c.lineTo(cx + Math.cos(a + 1.2) * W * 2, cy + Math.sin(a + 1.2) * W * 2); c.stroke(); }
        c.restore(); }
      const fl = t < 280 ? Math.pow(1 - t / 280, 2) * 0.95 : t >= 3500 ? Math.pow(1 - seg(t, 3500, 3850), 2) * 0.85 : 0;
      if (fl > 0.01) { c.fillStyle = `rgba(255,255,255,${fl})`; c.fillRect(0, 0, W, H); }
    }
    return { render, duration: 5100 + BURST * (SLOW - 1), music: 'summon', burst: BURST * SLOW, fam: o.family || fam, stage: o.spec && o.spec.stage,
      cues: [[0, 'tap'], [1250 * SLOW, 'whoosh'], [2300 * SLOW, 'charge'], [BURST * SLOW, 'heavy'], [BURST * SLOW + 150, 'whoosh'], [BURST * SLOW + 520, 'cry']] };
  }

  /* ---------- fusion ---------- */
  function fusion(cv, o) {
    const c = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H * 0.46, r = rng(42);
    const hP = Math.min(W, H) * 0.3, hC = Math.min(W, H) * 0.42, fP = cy + hP * 0.5, fC = cy + hC * 0.5, xa = cx - W * 0.25, xb = cx + W * 0.25;
    const bs = Math.max(5, Math.round(hP / 14));
    const A = toBits(o.a, xa, fP, hP, bs), B = toBits(o.b, xb, fP, hP, bs).map(q => ({ ...q, x: 2 * xb - q.x })), T = toBits(o.child, cx, fC, hC, bs);
    const P = A.map(q => ({ ...q, side: 0 })).concat(B.map(q => ({ ...q, side: 1 })));
    const n = Math.max(P.length, T.length), pal = o.child.pal || { body: [255, 255, 255] }, main = pal.body;
    const parts = Array.from({ length: n }, (_, i) => { const p = P[i % P.length], tg = T[i % T.length], yA = (p.y - (fP - hP)) / hP;
      return { ...p, from: i < P.length, tx: tg.x, ty: tg.y, tc: tg.c, toT: i < T.length, d: cl(yA) * 380 + r() * 160, a: r() * Math.PI * 2, rr: 0.7 + r() * 0.6,
        ad: (1 - cl((tg.y - (fC - hC)) / hC)) * 520 + r() * 140, bx: (r() - 0.5) * W * 0.6, by: (r() - 0.5) * H * 0.4 }; });
    const spin = t => { const x = seg(t, 900, 2700); return x * x * 16; };
    function render(t) {
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
      c.fillStyle = '#0c0d14'; c.fillRect(0, 0, W, H); glow(c, cx, cy, W * 0.8, mixc(o.a.pal ? o.a.pal.body : main, o.b.pal ? o.b.pal.body : main, 0.5), 0.25 + 0.3 * seg(t, 1500, 2800));
      // the parents: a hop, a beam between them, a flash, then bits
      if (t < 1000) { const hop = t > 220 && t < 520 ? Math.sin(seg(t, 220, 520) * Math.PI) * hP * 0.12 : 0, fl = seg(t, 650, 900);
        if (t > 450) { const p = seg(t, 450, 900); c.strokeStyle = `rgba(255,255,255,${0.7 * p})`; c.lineWidth = 3 + 3 * Math.sin(t / 40); c.setLineDash([10, 8]); c.lineDashOffset = -t / 10;
          c.beginPath(); c.moveTo(xa + hP * 0.3, fP - hP * 0.45); c.quadraticCurveTo(cx, fP - hP * (0.9 + 0.1 * Math.sin(t / 90)), xb - hP * 0.3, fP - hP * 0.45); c.stroke(); c.setLineDash([]); }
        mon(c, o.a, xa, fP - hop, hP, t > 220 && t < 700 ? 'happy' : 'idle', t, { filter: fl ? `brightness(${1 + fl * 2.5})` : null });
        mon(c, o.b, xb, fP - hop, hP, t > 220 && t < 700 ? 'happy' : 'idle', t, { flip: true, filter: fl ? `brightness(${1 + fl * 2.5})` : null }); }
      // bits: peel off top first, orbit in two tilted rings, crush into a light, fly out to build the child
      if (t >= 900 && t < 4100) { const S = spin(t), R = W * (0.3 - 0.12 * seg(t, 1500, 2500)) * (1 - io3(seg(t, 2500, 2800))), mixk = seg(t, 1600, 2600);
        for (const q of parts) { let x, y, col = q.c, sz = bs;
          if (t < 2850) { if (!q.from) continue;
            const k = io3(seg(t, 900 + q.d, 900 + q.d + 650)), tilt = q.side ? -0.4 : 0.4, a = q.a + S * (q.side ? -1 : 1);
            const ox = Math.cos(a) * R * q.rr, oy = Math.sin(a) * R * q.rr * 0.35, rx = ox * Math.cos(tilt) - oy * Math.sin(tilt), ry = ox * Math.sin(tilt) + oy * Math.cos(tilt);
            const lift = Math.sin(k * Math.PI) * hP * 0.25;
            x = q.x + (cx + rx - q.x) * k; y = q.y + (cy + ry - q.y) * k - lift; col = mixc(q.c, q.tc, mixk); sz = bs * (1 - 0.25 * k);
          } else { if (!q.toT) { continue; }
            const k = out3(seg(t, 2900 + q.ad, 2900 + q.ad + 480)), m = Math.sin(k * Math.PI) * 0.5;
            x = cx + (q.tx - cx) * k + q.bx * m; y = cy + (q.ty - cy) * k + q.by * m; col = mixc(q.c, q.tc, 0.6 + 0.4 * k); sz = bs * (0.6 + 0.4 * k); }
          c.fillStyle = rgba(col, t > 3700 ? 1 - seg(t, 3700, 4100) : 1); c.fillRect(x - sz / 2, y - sz / 2, sz + 0.5, sz + 0.5); }
        if (t > 2300 && t < 3200) { const p = seg(t, 2300, 2850), q2 = 1 - seg(t, 2850, 3200); glow(c, cx, cy, W * 0.25 * (0.4 + p), main, 0.9 * q2); } }
      // the child: blocks fade into the drawing, then a happy hop and sparkles
      if (t >= 3600) { const a = seg(t, 3600, 4100), hop = t > 4150 && t < 4500 ? Math.sin(seg(t, 4150, 4500) * Math.PI) * hC * 0.1 : 0;
        mon(c, o.child, cx, fC - hop, hC, t > 4100 ? 'happy' : 'idle', t, { alpha: a });
        for (let k = 0; k < 5; k++) { const p = seg(t, 4100 + k * 90, 4700 + k * 90); if (p <= 0 || p >= 1) continue; const ang = k * 1.3 + 0.4;
          star(c, cx + Math.cos(ang) * hC * 0.55, fC - hC * 0.6 + Math.sin(ang) * hC * 0.4 - p * 20, hC * 0.06 * Math.sin(p * Math.PI), '#fff4c0'); }
        if (o.name && t > 4300) { const al = seg(t, 4300, 4650); c.globalAlpha = al; c.font = `700 ${Math.round(W * 0.08)}px Pix, monospace`; c.textAlign = 'center';
          c.fillStyle = '#f5f0e2'; c.fillText(o.name, cx, fC + hC * 0.24 + (1 - al) * 12); c.globalAlpha = 1; } }
      const fl = t >= 2800 && t < 3150 ? Math.pow(1 - seg(t, 2800, 3150), 2) * 0.9 : 0; if (fl > 0.01) { c.fillStyle = `rgba(255,255,255,${fl})`; c.fillRect(0, 0, W, H); }
    }
    return { render, duration: 4900, music: 'fusion', burst: 2800, fam: o.family || famOf(o.child), stage: 'Bit',
      cues: [[450, 'charge'], [950, 'whoosh'], [2800, 'heavy'], [2950, 'whoosh'], [4150, 'tap'], [4250, 'cry']] };
  }

  /* plays a scene on a full-screen canvas; tap to skip */
  function play(scene, cv, done) {
    const t0 = performance.now(); let skip = false, cue = 0;
    const mus = scene.music && typeof musCue === 'function' ? musCue(scene.music, scene.burst, scene.duration) : null;   // the score is laid out to the scene's own timing
    cv.onpointerdown = () => { if (!skip && mus) mus.skip(performance.now() - t0); skip = true; };
    const step = now => { const t = skip ? scene.duration : now - t0; scene.render(Math.min(t, scene.duration));
      while (!skip && scene.cues && cue < scene.cues.length && scene.cues[cue][0] <= t) { const k = scene.cues[cue][1];
        if (k === 'cry') { if (typeof cry === 'function') cry(scene.fam, scene.stage); } else if (typeof sfx === 'function') sfx(k); cue++; }
      if (t < scene.duration) requestAnimationFrame(step); else { cv.onpointerdown = null; if (skip && typeof cry === 'function') cry(scene.fam, scene.stage); done && done(); } };
    requestAnimationFrame(step);
  }
  /* a full-screen canvas over everything, at the screen's real resolution */
  function overlay() { const cv = document.createElement('canvas'), d = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d); cv.className = 'summon-cv'; document.body.appendChild(cv); return cv; }
  /* what to draw for a monster: the smooth drawing's spec, or its pixel sprite as an image */
  function specFor(m, st, stage) {
    const sp = typeof chibiSpec === 'function' && chibiSpec(m, st);
    if (sp) { if (stage) sp.stage = stage; return sp; }
    const c = document.createElement('canvas'); paint(c, (st && st.grid) || m.grid, (st && st.pal) || m.pal, 4); return { img: c, pal: m.pal };
  }
  /* plays a scene on its own overlay and resolves when it ends or is tapped away */
  const run = scene => new Promise(done => { const cv = overlay(); play(scene(cv), cv, () => { cv.remove(); done(); }); });
  return { summon, fusion, play, toBits, ENTER, overlay, specFor, run };
})();
