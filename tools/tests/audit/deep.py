"""Team expeditions: a new layout each season with a waystone, a sealed way and sometimes Rook's team, then a strong team walking
a deep map through all three. Run the server first (tools/tests/serve.sh). Usage: deep.py"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
from common import launch, settle, Checks
SETUP = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game.py')).read().split('SETUP = """')[1].split('"""')[0]

TEAM = """() => { PLAYER.tutorialDone = true; RS.noScenes = true; RS.grade = 'B';
  const R = rng(11); for (const f of ['Chomp', 'Booly']) { const e = addToRoster(randomOpponent(R, f)); e.st = packRanch(newRanch(e)); }
  story().seen.intro = PLAYER.week;   // Rook only turns up on a deep map once the player has met him
  return rosterStates().slice(0, 3).map(s => s.id); }"""
# walks the map through a list of circles, any way the paths allow, tapping the next circle whenever the map waits for a tap
PILOT = """([reg, stops]) => { const M = deepMap(REGIONS.find(r => r.n === reg)), path = ['0:1'];
  const bfs = (a, z) => { const prev = { [a]: null }, q = [a]; while (q.length) { const x = q.shift(); if (x === z) break; for (const y of M.near(x)) if (!(y in prev)) { prev[y] = x; q.push(y); } }
    const P = []; for (let k = z; k !== a; k = prev[k]) P.unshift(k); return P; };
  for (const z of stops) path.push(...bfs(path[path.length - 1], z));
  window.__pilot = { path, i: 0, M, done: false };
  window.__pilotStep = () => { const P = __pilot, cv = document.getElementById('ex-map'); if (!cv || !cv.onpointerdown) return null;
    if (P.i + 1 >= P.path.length) { if (!P.done) { P.done = true; document.getElementById('ex-home').click(); } return 'home'; }
    const at = P.M.N[P.path[P.i]], to = P.M.N[P.path[P.i + 1]], off = Math.max(0, Math.min(4, at.c - 3)), W = cv.clientWidth, b = cv.getBoundingClientRect();
    const x = 26 + (to.c - off) * (W - 52) / 6, y = 52 + to.r * 62; cv.onpointerdown({ clientX: b.left + x, clientY: b.top + y }); P.i++; return to.id; };
  return path; }"""

async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        await pg.evaluate(SETUP, 'Chomp'); ids = await pg.evaluate(TEAM); await settle(pg, label='start')
        # the layouts
        L = await pg.evaluate("""()=>{ const out={}; for (const reg of REGIONS.slice(0,4)) { let shr=0, seal=0, rival=0, diff=0, prev=null;
            for (let s=0; s<40; s++) { const M=deepMap(reg, s), K=Object.values(M.N); shr+=K.filter(n=>n.k==='shrine').length===1; seal+=K.filter(n=>n.k==='seal'&&DEEP_SEAL[n.el]).length===1; rival+=K.some(n=>n.k==='rival');
              const sig=K.map(n=>n.id+n.k).join(); if (prev && sig!==prev) diff++; prev=sig; }
            out[reg.n]={shr,seal,rival,diff}; } return out; }""")
        print(json.dumps(L))
        none = await pg.evaluate("()=>{ const k=story().seen.intro; delete story().seen.intro; let n=0; for (let s=0;s<40;s++) n+=Object.values(deepMap(REGIONS[0], s).N).some(x=>x.k==='rival'); story().seen.intro=k; return n; }")
        C.ok(none == 0, "Rook's team stays off the deep maps until the player has met Rook")
        C.ok(all(v['shr'] == 40 and v['seal'] == 40 for v in L.values()), 'every season every deep map has one waystone and one sealed way')
        C.ok(all(10 <= v['rival'] <= 30 for v in L.values()), "Rook's team is on about one map in two")
        C.ok(all(v['diff'] >= 37 for v in L.values()), 'the layout changes from season to season')
        # a season where the first region has all three, and a team that can open its sealed way
        reg = await pg.evaluate("()=>REGIONS[0].n")
        plan = await pg.evaluate("""reg=>{ const R=REGIONS.find(r=>r.n===reg), w0=PLAYER.week; for (let k=0;k<80;k++) { PLAYER.week=w0+k*12; const M=deepMap(R), K=Object.values(M.N);
            const sh=K.find(n=>n.k==='shrine'), se=K.find(n=>n.k==='seal'), rv=K.find(n=>n.k==='rival'); if (sh&&se&&rv) return {week:PLAYER.week, stops:[sh.id,se.id,rv.id].sort((a,b)=>+a.split(':')[0]-+b.split(':')[0]), el:se.el}; }
          return null; }""", reg)
        print('plan', plan)
        path = await pg.evaluate(PILOT, [reg, plan['stops']]); print('path', path)
        b0 = await pg.evaluate("()=>PLAYER.bits")
        await pg.evaluate("""([reg, ids, el])=>{ window.__said=[]; const s0=say; say=(t,who)=>{ if(t) __said.push((who||'tala')+': '+t); s0(t,who); };
          const all=rosterStates(), T=ids.map(id=>all.find(s=>s.id===id));
          for (const s of T) { s.level = 60; s.tp = [400, 400, 400, 400, 400, 400]; s.m.stats = s.m.stats.map(v => v * 3); s.fatigue = 0; s.stress = 0; }
          T[1].m.el1 = el; runDeep(REGIONS.find(r=>r.n===reg), T); }""", [reg, ids, plan['el']])
        picked = False
        for k in range(4000):
            await pg.evaluate("o=>__pump(o)", {'control': True})
            if not picked and await pg.evaluate("()=>!!document.querySelector('#dp-choice [data-c=\"1\"]')"):
                await pg.evaluate("()=>document.querySelector('#dp-choice [data-c=\"1\"]').click()"); picked = True
            await pg.evaluate("()=>__pilotStep()")
            if await pg.evaluate("()=>__pilot.done && !document.getElementById('ex-map') && !RS.busy"): break
            await pg.wait_for_timeout(60)
        await settle(pg, max_s=60, label='home')
        r = await pg.evaluate("reg=>{ const st=deepState(REGIONS.find(x=>x.n===reg)); return {seen:st.seen.length, said:__said, bits:PLAYER.bits}; }", reg)
        nodes = await pg.evaluate("reg=>Object.keys(deepMap(REGIONS.find(x=>x.n===reg)).N).length", reg)
        said = ' | '.join(r['said'])
        print(json.dumps(r['said'][-14:], indent=1))
        C.ok(picked and r['seen'] == nodes, f"picking the map at the waystone shows every circle ({r['seen']} of {nodes})")
        C.ok('League cache' in said, 'a team with the right element opens the sealed way and finds the cache')
        C.ok('You beat all three' in said, "beating Rook's three Snabits pays out")
        C.ok(r['bits'] > b0, f'the trip pays ({b0} -> {r["bits"]})')
        C.ok(not any(x in said for x in ('undefined', 'NaN', '[object')), 'the lines along the way read cleanly')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
