"""The Deep Rift and the horrors' myths: which rings open when, how often a tear shows on a deep map, a team walking the
Outer Ring to the Ghoul's lair with two parts of its myth, finding the third at the door, beating it and bringing a little
one home. Then the second parts that turn up in a week, the Tower's floor 60, and the Journal's Myths tab.
Run the server first (tools/tests/serve.sh). Usage: rift.py"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
from common import launch, settle, Checks
SETUP = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game.py')).read().split('SETUP = """')[1].split('"""')[0]

# a team of three far stronger than the Rift needs, so the walk is about the wiring and never the odds
TEAM = """() => { PLAYER.tutorialDone = true; RS.noScenes = true; RS.grade = 'A';
  const R = rng(11); for (const f of ['Chomp', 'Booly']) { const e = addToRoster(randomOpponent(R, f)); e.st = packRanch(newRanch(e)); }
  exState({ n: 'The Rift' }).got.push('6:1'); saveGame();
  return rosterStates().length; }"""
STRONG = """() => { const T = rosterStates().slice(0, 3); for (const s of T) { s.level = 70; s.tp = [400, 400, 400, 400, 400, 400]; s.m.stats = s.m.stats.map(v => v * 3); s.fatigue = 0; s.stress = 0; } return T.map(s => s.id); }"""
# the deep maps' autopilot (deep.py): heads for the wanted things on a floor, else explores, else takes the stairs down
AUTO = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'deep.py')).read().split('AUTO = """')[1].split('"""')[0]

async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        await pg.evaluate(SETUP, 'Chomp'); n = await pg.evaluate(TEAM); await settle(pg, label='start')
        C.ok(n >= 3, f'the ranch has three Snabits for a team ({n})')
        rings = await pg.evaluate("()=>{ const out=[riftRings().length]; for(const e of PLAYER.roster) if(e.st) e.st.grade='A'; RS.grade='S'; out.push(riftRings().length); story().legendWon=true; out.push(riftRings().length); const G=g=>{ RS.grade=g; for(const e of PLAYER.roster) if(e.st) e.st.grade=g; }; G('B'); out.push(riftRings().length); G('A'); story().legendWon=false; return out; }")
        C.ok(rings == [1, 2, 3, 0], f'the Outer Ring opens at A, the Middle at S, the Heart after the Legend Cup, and none below A ({rings})')
        # tears: about one season in four on each of the eight regions, on a different circle each time
        t = await pg.evaluate("""()=>{ const out={}; const w0=PLAYER.week;
          for(const name of Object.keys(HORROR_REGION)){ const reg=REGIONS.find(r=>r.n===name); let n=0; const spots=new Set();
            for(let k=0;k<80;k++){ PLAYER.week=w0+k*12; const M=deepMap(reg); horrorTear(reg,M); const t=deepFeats(M).find(x=>x.k==='tear'); if(t){ n++; spots.add(t.f+':'+t.x+':'+t.y); if(t.fam!==HORROR_REGION[name]) n=-999; } }
            out[name]=[n,spots.size]; }
          PLAYER.week=w0; myth('Ghoul')[0]=1; const reg=REGIONS.find(r=>r.n==='Hollow Moor'); let after=0; for(let k=0;k<40;k++){ PLAYER.week=w0+k*12; const M=deepMap(reg); horrorTear(reg,M); if(deepFeats(M).some(x=>x.k==='tear')) after++; }
          PLAYER.week=w0; myth('Ghoul')[0]=0; const G=g=>{ RS.grade=g; for(const e of PLAYER.roster) if(e.st) e.st.grade=g; }; G('B'); let low=0; for(let k=0;k<40;k++){ PLAYER.week=w0+k*12; const M=deepMap(reg); horrorTear(reg,M); if(deepFeats(M).some(x=>x.k==='tear')) low++; }
          PLAYER.week=w0; G('A'); return {out,after,low}; }""")
        print('tears in 80 seasons:', json.dumps(t))
        C.ok(all(10 <= v[0] <= 32 and v[1] >= 3 for v in t['out'].values()), f'each region shows its own horror\'s tear about one season in four, in different places ({t["out"]})')
        C.ok(t['after'] == 0 and t['low'] == 0, 'no tear once the first part is found, and none below grade A')
        # the Outer Ring with two parts of the Ghoul's myth: the third is on the door, then the fight, then a little one comes home
        await pg.evaluate("()=>{ const P=myth('Ghoul'); P[0]=1; P[1]=1; P[2]=0; }")
        ids = await pg.evaluate(STRONG)
        await pg.evaluate("ids=>{ window.__said=[]; const s0=say; say=(t,who)=>{ if(t) __said.push((who||'tala')+': '+t); s0(t,who); }; const all=rosterStates(); runDeep(riftRings()[0], ids.map(id=>all.find(s=>s.id===id))); }", ids)
        for k in range(6000):
            await pg.evaluate("o=>__pump(o)", {'control': True})
            if await pg.evaluate("()=>!!DEEP_LIVE.pick"): await pg.evaluate(AUTO, ['lair:Ghoul', 'camp', 'spring'])
            if await pg.evaluate("()=>!!lairState('Ghoul').won && !document.getElementById('ex-map') && !RS.busy"): break
            await pg.wait_for_timeout(60)
        await settle(pg, label='home')
        r = await pg.evaluate("()=>({myth:myth('Ghoul'),won:lairState('Ghoul').won,season:lairState('Ghoul').season,ghouls:PLAYER.roster.filter(e=>e.m.family==='Ghoul').length,stage:PLAYER.roster.filter(e=>e.m.family==='Ghoul').map(e=>(e.st&&e.st.stage)||'Bit'),said:__said.slice(-12)})")
        print(json.dumps(r, indent=1))
        C.ok(all(r['myth']), 'the door of the Burrows gives the third part of the Ghoul myth')
        C.ok(r['won'] and r['ghouls'] == 1, 'beating the Ghoul in its lair sends one little Ghoul home')
        bad = [l for l in r['said'] if 'undefined' in l or 'NaN' in l or '[object' in l]
        C.ok(not bad, f'the lines along the way read cleanly {bad[:2]}')
        # one horror at a time: with the Ghoul on the ranch, a second lair win sends nobody home and the stone scan stays shut
        own = await pg.evaluate("()=>({owned:horrorOwned(), call:(PLAYER.stones=['Gug'], horrorCall({g12:null}))})")
        C.ok(own['owned'], 'the ranch counts its horror')
        # the second parts in a week
        w = await pg.evaluate("""()=>{ const out={}; const s=RS, w0=PLAYER.week;
          myth('Gug')[0]=1; s.weather='A heatwave'; out.gug=mythWeek(s,null).join(' '); s.weather='Sunny';
          myth('Dagon')[0]=1; out.dagon=mythWeek(s,['Harvest Fair','Berry']).join(' ');
          myth('Ghoul')[1]=0; myth('Ghoul')[0]=1; let k=0; for(;k<12&&!myth('Ghoul')[1];k++){ PLAYER.week=w0+k; mythWeek(s,null); } out.ghoulWeeks=k; PLAYER.week=w0; myth('Ghoul')[1]=1;
          PLAYER.dexSecret=PLAYER.dexSecret||{}; EGG_SPECIAL.slice(0,15).forEach(f=>PLAYER.dexSecret[f]=1); out.cth1=mythWeek(s,null).join(' '); out.cth=myth('Cthulhu').slice();
          EGG_SPECIAL.slice(0,30).forEach(f=>PLAYER.dexSecret[f]=1); out.cth2=mythWeek(s,null).join(' '); out.cthB=myth('Cthulhu').slice();
          return out; }""")
        print(json.dumps(w, indent=1))
        C.ok('knocked' in w['gug'] and 'Myths' in w['gug'], "the Gug's second part comes in a heatwave week")
        C.ok('Harvest Fair' in w['dagon'], "Dagon's second part comes at the Harvest Fair")
        C.ok(w['ghoulWeeks'] <= 12, f"the Ghoul's bone turns up within a few weeks ({w['ghoulWeeks']})")
        C.ok(w['cth'][0] and not w['cth'][1] and w['cthB'][1], "Cthulhu's nightmare weeks come at 15 and 30 specials called")
        # the Tower's floor 60
        y = await pg.evaluate("()=>{ myth('Yog')[0]=0; TOWER={n:60,won:[],bits:0,R:rng(1),foe:null}; towerAfter({winner:0}); const out=[myth('Yog')[0], TOWER.won.slice()]; panel(''); TOWER=null; return out; }")
        C.ok(y[0] and 'page of a myth' in y[1], f'winning floor 60 of the Tower gives the first part of the Yog myth ({y})')
        # the Myths tab, and Hastur's name blanked the third time
        j = await pg.evaluate("()=>{ myth('Hastur').splice(0,3,1,1,1); openJournal('myths'); const t=document.getElementById('r-panel').innerText; panel(''); return {n:(t.match(/Hastur/g)||[]).length, blank:t.includes('_____'), ghoul:t.includes('The Diggers'), q:t.includes('???')}; }")
        C.ok(j['ghoul'] and j['q'], 'the Myths tab lists each myth found, with ??? for the parts still missing')
        C.ok(j['n'] == 2 and j['blank'], f"Hastur's name shows twice and is blank the third time ({j})")
        # leaving: the Ghoul at the end of its lifespan on the ranch leaves in the night and its stone stays
        await pg.evaluate("()=>{ const e=PLAYER.roster.find(r=>r.m.family==='Ghoul'); saveGame(); PLAYER.active=e.id; openRanch(); }"); await settle(pg, label='ghoul')
        await pg.evaluate("()=>{ __said.splice(0); RS.used=RS.m.lifespan*4-1; RS.noScenes=true; scene(async()=>{ await endWeek(1,'A quiet week.'); }); }")
        await settle(pg, max_s=60, label='leave')
        g = await pg.evaluate("()=>({ghouls:PLAYER.roster.filter(e=>e.m.family==='Ghoul').length, stone:(PLAYER.stones||[]).includes('Ghoul'), rs:RS&&RS.m.family, said:__said.slice(-3)})")
        print(json.dumps(g))
        C.ok(g['ghouls'] == 0 and g['stone'] and g['rs'] != 'Ghoul', 'a horror at the end of its lifespan leaves in the night and its stone stays on the ranch')
        C.ok(any('Last night' in l for l in g['said']), 'the leaving is told as a week event')
        # a retired horror's statue goes after 4 weeks
        h = await pg.evaluate("()=>{ PLAYER.hall=PLAYER.hall||[]; PLAYER.hall.push({id:'x',name:'Shubby, the test',m:randomOpponent(rng(4),'Shub'),st:{stage:'Mega'},week:PLAYER.week-3,wins:0,losses:0}); const a=horrorHallWeek().length; PLAYER.week++; const b=horrorHallWeek(); PLAYER.week--; return [a,b,(PLAYER.stones||[]).includes('Shub')]; }")
        C.ok(h[0] == 0 and len(h[1]) == 1 and h[2], f"a retired horror's statue is gone after 4 weeks and leaves its stone ({h})")
        sec = await pg.evaluate("()=>{ openSecrets(); const t=document.getElementById('r-panel').innerText; panel(''); return t; }")
        C.ok('Horrors' in sec and 'near midnight' in sec, "the Secrets tab has a Horrors row, with the Ghoul's stone clue now its stone is here")
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
