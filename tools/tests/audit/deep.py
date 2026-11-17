"""Team expeditions: three floors built every season by the Deep Mouth's rules for rooms and corridors (deep-gen.js), with a
waystone, a sealed way and sometimes Rook's team, then a strong team walking all the way down past every one of them and the
guardian, and a weak team caught by a patrol waking up back at the entrance. Run the server first (tools/tests/serve.sh).
Usage: deep.py"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
from common import launch, settle, Checks
SETUP = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game.py')).read().split('SETUP = """')[1].split('"""')[0]

TEAM = """() => { PLAYER.tutorialDone = true; RS.noScenes = true; RS.grade = 'B';
  const R = rng(11); for (const f of ['Chomp', 'Booly']) { const e = addToRoster(randomOpponent(R, f)); e.st = packRanch(newRanch(e)); }
  story().seen.intro = PLAYER.week;   // Rook only turns up on a deep map once the player has met him
  return rosterStates().slice(0, 3).map(s => s.id); }"""

# the rules every floor has to keep, over many seasons
RULES = """() => { const out = { maps: 0, floors: 0, caves: 0, aspect: 0, wide: 0, door: 0, doorTouch: 0, broken: 0, stairs: 0, reach: 0, block: 0, shrine: 0, seal: 0, cache: 0, rival: 0, diff: 0, pats: 0, designs: {}, rooms: 0 };
  for (const reg of REGIONS.slice(0, 4)) { let prev = null;
    for (let s = 0; s < 30; s++) { const M = deepMap(reg, s), K = deepFeats(M); out.maps++;
      out.shrine += K.filter(n => n.k === 'shrine').length === 1; out.seal += K.filter(n => n.k === 'seal' && DEEP_SEAL[n.el]).length === 1; out.cache += K.filter(n => n.k === 'cache').length === 1; out.rival += K.some(n => n.k === 'rival');
      const sig = M.floors.map(F => F.t.join('')).join('|'); if (prev && sig !== prev) out.diff++; prev = sig;
      for (const F of M.floors) { out.floors++; if (F.kind === 'caves') out.caves++; out.pats += F.pats.length; out.rooms += F.rooms.length;
        for (const r of F.rooms) { out.designs[r.design] = (out.designs[r.design] || 0) + 1;
          if (!r.cave) { const w = r.x2 - r.x1 - 1, h = r.y2 - r.y1 - 1; if (Math.max(w, h) / Math.min(w, h) > 2.01) out.aspect++; } }
        for (let y = 0; y < F.h - 1; y++) for (let x = 0; x < F.w - 1; x++) if ([[0, 0], [1, 0], [0, 1], [1, 1]].every(([a, b]) => F.t[dgI(F, x + a, y + b)] === DG.HALL)) out.wide++;
        for (let i = 0; i < F.t.length; i++) if (F.t[i] === DG.DOOR) { const x = i % F.w, y = (i / F.w) | 0; if (!dgDoorway(F, x, y)) out.door++; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => dgAt(F, x + a, y + b) === DG.DOOR)) out.doorTouch++; }
        if (!dgWhole(F)) out.broken++;
        const S = dgReach(F, ...F.up, F.shut); if (!S[dgI(F, ...F.down)]) out.stairs++;
        // everything is reachable without passing a blocker, except what a blocker keeps behind it
        for (const n of Object.values(F.feat)) { const i = dgI(F, n.x, n.y); if (S[i] || F.shut.has(i)) continue; if (n.k !== 'chest' && n.k !== 'cache') out.reach++; }
        // a blocker either has another way round it or stands in the one doorway of a dead-end room
        for (const i of F.shut) { const one = new Set([i]); if (dgWhole(F, one)) continue; const n = F.feat[i], k = F.room[dgI(F, n.x + 1, n.y)] >= 0 ? F.room[dgI(F, n.x + 1, n.y)] : F.room[dgI(F, n.x - 1, n.y)] >= 0 ? F.room[dgI(F, n.x - 1, n.y)] : F.room[dgI(F, n.x, n.y + 1)] >= 0 ? F.room[dgI(F, n.x, n.y + 1)] : F.room[dgI(F, n.x, n.y - 1)];
          if (!(k >= 0 && dgOpenings(F, F.rooms[k]).length === 1)) out.block++; } } } }
  return out; }"""

# the autopilot: heads for the wanted things on this floor, else explores the nearest edge of the unknown, else takes the stairs down
AUTO = """(want) => { const P = DEEP_LIVE.pick; if (!P) return null; const M = P.M, at = P.at, F = M.floors[at.f];
  const done = window.__done = window.__done || new Set(); { const here = F.feat[dgI(F, at.x, at.y)]; if (here) done.add(here.id); }   // something stood on and left there, like a lair still shut
  const feats = Object.values(F.feat).filter(n => F.seen[dgI(F, n.x, n.y)] && !n.failed && !done.has(n.id));
  for (const k of want) { const n = feats.find(n => n.k === k || n.k + ':' + n.fam === k); if (n && deepPath(F, [at.x, at.y], [n.x, n.y])) { P.go([n.x, n.y]); return 'to ' + k; } }
  const D = dgDist(F, at.x, at.y, F.shut); let best = null, bd = 1e9;
  for (let i = 0; i < F.t.length; i++) { if (!F.seen[i] || D[i] < 1 || D[i] >= bd || F.feat[i]) continue; const x = i % F.w, y = (i / F.w) | 0;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => dgIn(F, x + a, y + b) && !F.seen[dgI(F, x + a, y + b)])) { best = [x, y]; bd = D[i]; } }
  if (best && deepPath(F, [at.x, at.y], best)) { P.go(best); return 'explore'; }
  const d = feats.find(n => n.k === 'down' || n.k === 'guard'); if (d) { P.go([d.x, d.y]); return 'to ' + d.k; }
  P.home(); return 'home'; }"""

SAY = "()=>{ window.__said=[]; const s0=say; say=(t,who)=>{ if(t) __said.push((who||'tala')+': '+t); s0(t,who); }; }"

async def drive(pg, want, steps=6000, pick=None):
    picked = False
    for k in range(steps):
        await pg.evaluate("o=>__pump(o)", {'control': True})
        if pick is not None and not picked and await pg.evaluate(f"()=>!!document.querySelector('#dp-choice [data-c=\"{pick}\"]')"):
            await pg.evaluate(f"()=>document.querySelector('#dp-choice [data-c=\"{pick}\"]').click()"); picked = True
        if await pg.evaluate("()=>!!DEEP_LIVE.pick"):
            await pg.evaluate(AUTO, want)
        if await pg.evaluate("()=>!document.getElementById('ex-map') && !RS.busy && window.__went"): break
        if k == 5: await pg.evaluate("()=>{ window.__went = true; }")
        await pg.wait_for_timeout(40)
    return picked

async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        await pg.evaluate(SETUP, 'Chomp'); ids = await pg.evaluate(TEAM); await settle(pg, label='start')
        r = await pg.evaluate(RULES); print(json.dumps(r))
        n = r['maps']
        C.ok(r['aspect'] == 0, f"no room is more than twice as long as it is wide, counted on its floor ({r['aspect']})")
        C.ok(r['wide'] == 0, f"no corridor runs two wide ({r['wide']} 2 by 2 blocks)")
        C.ok(r['door'] == 0 and r['doorTouch'] == 0, f"doors only hang in one-tile doorways and never touch ({r['door']}, {r['doorTouch']})")
        C.ok(r['broken'] == 0 and r['stairs'] == 0, f"every floor is in one piece and its stairs down can be reached past no blocker ({r['broken']}, {r['stairs']})")
        C.ok(r['reach'] == 0, f"everything on a floor can be reached, apart from what a blocker keeps behind it ({r['reach']})")
        C.ok(r['block'] == 0, f"an obstacle or sealed way only stands where there's a way round or in a dead-end room's doorway ({r['block']})")
        C.ok(r['shrine'] == n and r['seal'] == n and r['cache'] == n, f"every map has one waystone and one sealed way with a cache behind it ({r['shrine']}, {r['seal']}, {r['cache']} of {n})")
        C.ok(n * 0.3 <= r['rival'] <= n * 0.7, f"Rook's team is on about one map in two ({r['rival']} of {n})")
        C.ok(r['diff'] >= n - 4 - 1, f"the layout changes from season to season ({r['diff']})")
        C.ok(0 < r['caves'] < r['floors'] * 0.25, f"some last floors are caverns ({r['caves']} of {r['floors']})")
        C.ok(all(r['designs'].get(k, 0) > 0 for k in ('plain', 'pillars', 'pool', 'rubble', 'garden')), f"every room design turns up ({r['designs']})")
        e = await pg.evaluate("()=>{ const s=RS, sta=playerFighter(s).base.sta; return [deepEnergyMax(s, sta*2), deepEnergyMax(s, sta), deepEnergyMax(s, sta/2), deepRegen(s, sta*2), deepRegen(s, sta), deepRegen(s, sta/2)]; }")
        C.ok(e == [13, 16, 22, 72, 36, 18], f"Stamina sets a Snabit's energy, 13 to 22, and how fast it comes back behind the leader, every 72 to 18 steps ({e})")
        none = await pg.evaluate("()=>{ const k=story().seen.intro; delete story().seen.intro; let n=0; for (let s=0;s<30;s++) n+=deepFeats(deepMap(REGIONS[0], s)).some(x=>x.k==='rival'); story().seen.intro=k; return n; }")
        C.ok(none == 0, "Rook's team stays off the deep maps until the player has met Rook")
        ring = await pg.evaluate("()=>{ const reg={ n:'The Rift, Outer Ring', el:'Void', rift:true, ring:0 }, M=deepMap(reg, 3); return { kinds:M.floors.map(F=>F.kind), lairs:deepFeats(M).filter(n=>n.k==='lair').map(n=>n.fam+'@'+n.f), guard:deepFeats(M).some(n=>n.k==='guard') }; }")
        print('ring', ring)
        C.ok(ring['kinds'] == ['rooms', 'caves', 'caves'] and len(ring['lairs']) == 5 and 'Shub@2' in ring['lairs'] and not ring['guard'], f"a Rift ring's lower floors are caverns holding its five lairs, Shub-Niggurath's at the bottom ({ring})")
        # a season where the first region has a waystone, a sealed way and Rook's team, and a team that can open the sealed way
        reg = await pg.evaluate("()=>REGIONS[0].n")
        plan = await pg.evaluate("""reg=>{ const R=REGIONS.find(r=>r.n===reg), w0=PLAYER.week; for (let k=0;k<80;k++) { PLAYER.week=w0+k*12; const K=deepFeats(deepMap(R));
            const se=K.find(n=>n.k==='seal'), rv=K.find(n=>n.k==='rival'); if (se&&rv) return {week:PLAYER.week, el:se.el, rival:rv.f, seal:se.f}; } return null; }""", reg)
        print('plan', plan)
        b0 = await pg.evaluate("()=>PLAYER.bits")
        await pg.evaluate(SAY)
        await pg.evaluate("""([reg, ids, el])=>{ const all=rosterStates(), T=ids.map(id=>all.find(s=>s.id===id));
          for (const s of T) { s.level = 60; s.tp = [400, 400, 400, 400, 400, 400]; s.m.stats = s.m.stats.map(v => v * 3); s.fatigue = 0; s.stress = 0; }
          T[1].m.el1 = el; window.__went=false; runDeep(REGIONS.find(r=>r.n===reg), T); }""", [reg, ids, plan['el']])
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/deep-start.png')
        picked = await drive(pg, ['shrine', 'seal', 'cache', 'rival', 'camp', 'spring', 'chest', 'guard'], pick=1)
        await settle(pg, max_s=60, label='home')
        r = await pg.evaluate("reg=>({said:__said, bits:PLAYER.bits, got:deepState(REGIONS.find(x=>x.n===reg)).got})", reg)
        said = ' | '.join(r['said'])
        print(json.dumps(r['said'][-24:], indent=1))
        C.ok(picked and 'see the whole way' in said, 'picking the map at the waystone shows the whole floor')
        C.ok('League cache' in said, 'a team with the right element opens the sealed way and finds the cache inside')
        C.ok('You beat all three' in said, "beating Rook's three Snabits pays out")
        C.ok('caught up with us' in said, 'Snabits on patrol catch up with the team and start fights')
        C.ok("That's " in said and 'guard' in r['got'], 'the team gets all the way down and beats the guardian')
        C.ok(r['bits'] > b0, f'the trip pays ({b0} -> {r["bits"]})')
        C.ok(not any(x in said for x in ('undefined', 'NaN', '[object')), 'the lines along the way read cleanly')
        # a weak team caught by a patrol wakes up at the entrance with less energy
        await settle(pg, max_s=60, label='after')
        await pg.evaluate(SAY)
        await pg.evaluate("""([reg, ids])=>{ const all=rosterStates(), T=ids.map(id=>all.find(s=>s.id===id)); PLAYER.week += 12;
          for (const s of T) { s.level = 1; s.tp = [0, 0, 0, 0, 0, 0]; s.m.stats = s.m.stats.map(v => 8); s.fatigue = 0; s.stress = 0; }
          deepState(REGIONS.find(r=>r.n===reg)).season = -1; window.__went=false; runDeep(REGIONS.find(r=>r.n===reg), T); }""", [reg, ids])
        lost = False
        for k in range(3000):
            await pg.evaluate("o=>__pump(o)", {'control': True})
            if await pg.evaluate("()=>__said.some(t=>t.includes('start again from the entrance'))"): lost = True; break
            if await pg.evaluate("()=>!!DEEP_LIVE.pick"):
                # walk at the nearest patrol the team can see, or explore
                await pg.evaluate("""()=>{ const P=DEEP_LIVE.pick, F=P.M.floors[P.at.f], p=F.pats.find(q=>!q.dead&&q.spotted&&F.seen[dgI(F,q.x,q.y)]);
                  if (p) { const D=dgDist(F,p.x,p.y,F.shut); let best=null; for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]) { const i=dgI(F,p.x+a,p.y+b); if (D[i]>=0&&F.seen[i]&&!F.feat[i]&&(!best||1)) best=[p.x+a,p.y+b]; } if (best&&deepPath(F,[P.at.x,P.at.y],best)) { P.go(best); return; } } }""")
                if await pg.evaluate("()=>!!DEEP_LIVE.pick"): await pg.evaluate(AUTO, [])
            await pg.wait_for_timeout(40)
        await pg.wait_for_timeout(2500)
        w = await pg.evaluate("()=>{ const P=DEEP_LIVE.pick; return P ? { f:P.at.f, x:P.at.x, y:P.at.y, up:P.M.floors[0].up } : null; }")
        print('lost', lost, w)
        C.ok(lost and w and w['f'] == 0 and [w['x'], w['y']] == w['up'], 'a team that loses to a patrol wakes up back at the entrance')
        await pg.screenshot(path='/tmp/deep-lost.png')
        if await pg.evaluate("()=>!!DEEP_LIVE.pick"): await pg.evaluate("()=>DEEP_LIVE.pick.home()")
        await settle(pg, max_s=60, label='home2')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
