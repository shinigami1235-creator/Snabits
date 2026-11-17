"""Team expeditions: three floors built every season by the Deep Mouth's rules for rooms and corridors (deep-gen.js), explored
room by room. Checks the floor rules, the ways between rooms, traps, hidden rooms and gates, the stats' jobs and the pack, then a
strong team going all the way down past the waystone, the sealed way, Rook's team and the guardian, and a weak team worn down
until it has to run home hurt. Run the server first (tools/tests/serve.sh). Usage: deep.py"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
from common import launch, settle, Checks
SETUP = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game.py')).read().split('SETUP = """')[1].split('"""')[0]

TEAM = """() => { PLAYER.tutorialDone = true; RS.noScenes = true; RS.grade = 'B';
  const R = rng(11); for (const f of ['Chomp', 'Booly']) { const e = addToRoster(randomOpponent(R, f)); e.st = packRanch(newRanch(e)); }
  story().seen.intro = PLAYER.week;   // Rook only turns up on a deep map once the player has met him
  return rosterStates().slice(0, 3).map(s => s.id); }"""

# the rules every floor has to keep, over many seasons
RULES = """() => { const out = { gstairs: 0, graph: 0, hidden: 0, traps: 0, relicBad: 0, gates: 0, leverBad: 0, maps: 0, floors: 0, caves: 0, aspect: 0, wide: 0, door: 0, doorTouch: 0, broken: 0, stairs: 0, reach: 0, block: 0, shrine: 0, seal: 0, cache: 0, rival: 0, diff: 0, pats: 0, designs: {}, rooms: 0 };
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
          if (!(k >= 0 && dgOpenings(F, F.rooms[k]).length === 1)) out.block++; }
        // the ways between rooms: the stairs down past no blocker or hidden way, every room reachable one way or another
        const clear = dgHops(F, F.upRoom, e => !e.hidden && e.block < 0).D, any = dgHops(F, F.upRoom, () => true).D;
        if (clear[F.downRoom] < 0) out.gstairs++; if (any.some(d => d < 0)) out.graph++;
        const hid = F.E.filter(e => e.hidden); out.hidden += hid.length > 0; out.traps += F.E.filter(e => e.trap).length;
        for (const e of hid) { const k = F.adj[e.a].length === 1 ? e.a : e.b; if (!Object.values(F.feat).some(n => n.k === 'relic' && F.room[dgI(F, n.x, n.y)] === k)) out.relicBad++; }
        const dn = F.feat[dgI(F, ...F.down)]; if (dn && dn.locked) { out.gates++; const lv = Object.values(F.feat).find(n => n.k === 'lever'); if (!lv || clear[F.room[dgI(F, lv.x, lv.y)]] < 0) out.leverBad++; } } } }
  return out; }"""

# the autopilot: takes the wanted things in a room, camps when low, explores rooms it hasn't been to, then goes down
AUTO = """(want) => { const P = DEEP_LIVE.pick; if (!P) return null; const O = P.opts, M = P.M, at = P.at, F = M.floors[at.f], done = window.__done = window.__done || new Set();
  const is = (n, w) => w === n.k || w === n.k + ':' + n.fam, take = (i, why) => { P.take(i); return why; };
  for (const w of want) { const i = O.findIndex(o => o.t === 'act' && is(o.n, w) && !done.has(o.n.id) && !(o.n.k === 'down' && o.n.locked)); if (i >= 0) { done.add(O[i].n.id); return take(i, w); } }
  const live = P.T.filter(m => !m.down), low = live.some(m => m.e <= 1 || m.hp < m.hpMax * 0.35);
  if (low && P.nights > 0) { const c = O.findIndex(o => o.t === 'camp' && !o.off); if (c >= 0) return take(c, 'camp'); const b = O.findIndex(o => o.t === 'back'); if (b >= 0) return take(b, 'back'); }
  const it = O.findIndex(o => o.t === 'item'); if (low && it >= 0) return take(it, 'item');
  const fresh = O.findIndex(o => o.t === 'exit' && !o.off && !F.rooms[o.to].been); if (fresh >= 0) return take(fresh, 'explore');
  const ok = e => !e.hidden && (e.block < 0 || !F.shut.has(e.block) || (F.feat[e.block] && !F.feat[e.block].failed)), H = dgHops(F, at.room, ok);
  const wantIn = k => Object.values(F.feat).some(n => F.room[dgI(F, n.x, n.y)] === k && (DEEP_ACT[n.k] || n.k === 'guard' || n.k === 'rival') && want.some(w => is(n, w)) && !done.has(n.id) && !(n.k === 'down' && n.locked));
  const goals = F.rooms.map((r, k) => k).filter(k => H.D[k] > 0 && (!F.rooms[k].been || wantIn(k))).sort((a, b) => H.D[a] - H.D[b]);
  for (const k of goals) { const e = dgFirst(F, at.room, k, ok), i = O.findIndex(o => o.t === 'exit' && o.e === e && !o.off); if (i >= 0) return take(i, 'to ' + k); }
  const d = O.findIndex(o => o.t === 'act' && o.n.k === 'down' && !o.n.locked); if (d >= 0) return take(d, 'down');
  const e = dgFirst(F, at.room, F.downRoom, ok), i = e ? O.findIndex(o => o.t === 'exit' && o.e === e) : -1; if (i >= 0) return take(i, 'to the stairs');
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
        C.ok(r['gstairs'] == 0 and r['graph'] == 0, f"every room can be walked to room by room, and the stairs down without passing a blocker ({r['gstairs']}, {r['graph']})")
        C.ok(r['floors'] * 0.25 <= r['hidden'] <= r['floors'] * 0.55 and r['relicBad'] == 0, f"about one floor in three has a hidden room, each with a relic ({r['hidden']} of {r['floors']})")
        C.ok(r['traps'] >= r['floors'] and r['gates'] > 0 and r['leverBad'] == 0, f"every floor has traps, and a gate over the stairs always has its lever where the team can reach it ({r['traps']}, {r['gates']}, {r['leverBad']})")
        C.ok(all(r['designs'].get(k, 0) > 0 for k in ('plain', 'pillars', 'pool', 'rubble', 'garden')), f"every room design turns up ({r['designs']})")
        e = await pg.evaluate("()=>{ const s=RS, sta=playerFighter(s).base.sta; return [deepEnergyMax(s, sta*2), deepEnergyMax(s, sta), deepEnergyMax(s, sta/2), deepRegen(s, sta*2), deepRegen(s, sta), deepRegen(s, sta/2)]; }")
        C.ok(e == [13, 16, 22, 72, 36, 18], f"Stamina sets a Snabit's energy, 13 to 22, and how fast it comes back behind the leader, every 72 to 18 steps ({e})")
        j = await pg.evaluate("()=>{ const s=RS, f=playerFighter(s).base; return { hp:[deepHpMax(s, f.grd*2), deepHpMax(s, f.grd/2)], slots:[deepSlots([s,s,s], f.pow*3), deepSlots([s,s,s], f.pow/2)], life:[deepLife('C'), deepLife('B'), deepLife('S'), deepLife('S', true)] }; }")
        C.ok(j['hp'] == [28, 50] and j['slots'] == [3, 7] and j['life'] == [4, 8, 12, 16], f"Constitution sets HP, Power how much the pack holds, and a Snabit that can't go on loses more of its prime in harder places ({j})")
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
        pk = await pg.evaluate("""([reg, ids, el])=>{ const all=rosterStates(), T=ids.map(id=>all.find(s=>s.id===id));
          for (const s of T) { s.level = 60; s.tp = [400, 400, 400, 400, 400, 400]; s.m.stats = s.m.stats.map(v => v * 3); s.fatigue = 0; s.stress = 0; }
          T[1].m.el1 = el; window.__went=false; PLAYER.bag['Trail mix']=3; PLAYER.bag['Rope']=2; PLAYER.bag['Bandage']=1;
          openDeepPack(REGIONS.find(r=>r.n===reg), T); const txt=document.getElementById('r-panel').innerText;
          document.querySelector('.pk-row[data-k="Trail mix"]').click(); document.querySelector('.pk-row[data-k="Rope"]').click(); document.querySelector('.pk-row[data-k="Rope"]').click();
          const left={mix:PLAYER.bag['Trail mix'], rope:PLAYER.bag['Rope']||0}; document.getElementById('pk-go').click(); const after={mix:PLAYER.bag['Trail mix'], rope:PLAYER.bag['Rope']||0}; return {txt, left, after}; }""", [reg, ids, plan['el']])
        print('pack', pk['left'], pk['after'], pk['txt'][:120])
        C.ok('can carry' in pk['txt'] and pk['after'] == {'mix': 2, 'rope': 0}, f"the pack takes things out of the bag for the trip ({pk['after']})")
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/deep-start.png')
        picked = await drive(pg, ['shrine', 'seal', 'cache', 'rival', 'lever', 'relic', 'spring', 'chest', 'guard'], pick=1)
        await settle(pg, max_s=60, label='home')
        r = await pg.evaluate("reg=>({said:__said, bits:PLAYER.bits, got:deepState(REGIONS.find(x=>x.n===reg)).got, rope:PLAYER.bag['Rope']||0})", reg)
        said = ' | '.join(r['said'])
        print(json.dumps(r['said'][-24:], indent=1))
        C.ok(picked and 'see the whole way' in said, 'picking the map at the waystone shows the whole floor')
        C.ok('League cache' in said, 'a team with the right element opens the sealed way and finds the cache inside')
        C.ok('You beat all three' in said, "beating Rook's three Snabits pays out")
        C.ok('caught up with us' in said, 'Snabits on patrol catch up with the team and start fights')
        C.ok(r['rope'] <= 2, f"rope the trip didn't use comes back to the bag ({r['rope']})")
        C.ok("That's " in said and 'guard' in r['got'], 'the team gets all the way down and beats the guardian')
        C.ok(r['bits'] > b0, f'the trip pays ({b0} -> {r["bits"]})')
        C.ok(not any(x in said for x in ('undefined', 'NaN', '[object')), 'the lines along the way read cleanly')
        # a weak team: fights cost it HP, Walt warns it, and when all three can't go on it runs home hurt and leaves things behind
        await settle(pg, max_s=60, label='after')
        await pg.evaluate(SAY)
        w0 = await pg.evaluate("""([reg, ids])=>{ const all=rosterStates(), T=ids.map(id=>all.find(s=>s.id===id)); PLAYER.week += 12;
          for (const s of T) { s.level = 1; s.tp = [0, 0, 0, 0, 0, 0]; s.m.stats = s.m.stats.map(v => 8); s.fatigue = 0; s.stress = 0; s.injured = false; }
          deepState(REGIONS.find(r=>r.n===reg)).season = -1; window.__went=false; window.__done=new Set(); runDeep(REGIONS.find(r=>r.n===reg), T); return T.map(s=>s.used||0); }""", [reg, ids])
        for k in range(4000):
            await pg.evaluate("o=>__pump(o)", {'control': True})
            if await pg.evaluate("()=>!!DEEP_LIVE.pick"):
                # walks at any patrol it can see, never camps, and never goes home
                await pg.evaluate("""()=>{ const P=DEEP_LIVE.pick, F=P.M.floors[P.at.f], p=F.pats.find(q=>!q.dead&&q.spotted);
                  if (p) { const e=dgFirst(F,P.at.room,p.room), i=e?P.opts.findIndex(o=>o.t==='exit'&&o.e===e&&!o.off):-1; if (i>=0) { P.take(i); return; } }
                  const i=P.opts.findIndex(o=>o.t==='exit'&&!o.off&&!F.rooms[o.to].been); if (i>=0) { P.take(i); return; } const j=P.opts.findIndex(o=>o.t==='exit'&&!o.off); if (j>=0) P.take(j); }""")
            if await pg.evaluate("()=>__said.some(t=>t.includes('everyone down')) && !document.getElementById('ex-map') && !RS.busy"): break
            await pg.wait_for_timeout(40)
        await settle(pg, max_s=60, label='home2')
        wr = await pg.evaluate("ids=>({said:__said, used:rosterStates().filter(s=>ids.includes(s.id)).map(s=>s.used||0), hurt:rosterStates().filter(s=>ids.includes(s.id)).map(s=>!!s.injured)})", ids)
        ws = ' | '.join(wr['said']); print(json.dumps(wr['said'][-8:], indent=1), wr['used'], w0)
        C.ok('running low' in ws, 'Walt warns the team to head back when it runs low')
        C.ok('everyone down' in ws and all(wr['hurt']), 'when all three can\'t go on, the team runs home and all three are hurt')
        C.ok(all(u - v >= 4 for u, v in zip(wr['used'], w0)), f"each one loses months of its prime for it ({w0} -> {wr['used']})")
        await pg.screenshot(path='/tmp/deep-lost.png')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
