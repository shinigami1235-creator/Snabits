"""Every story scene, played on the ranch the way the game plays it at the end of a week: the intro, the four loan scenes,
the five grade scenes, the Master scene and the Legend Cup ending. Each is set up by its own condition (a grade, a loan payment
at the Town Hall, the flags a cup win sets), then a rest week lets the game notice it. Also a contest of each kind and a mission
of each length. Usage: story.py"""
import asyncio, sys, json
from playwright.async_api import async_playwright
from common import launch, settle, Checks
SETUP = open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', 'game.py')).read().split('SETUP = """')[1].split('"""')[0]
async def click(pg, sel, wait=150):
    ok = await pg.evaluate("s=>{ const e=document.querySelector(s); if(__vis(e)){ e.click(); return true; } return false; }", sel)
    await pg.wait_for_timeout(wait); return ok
async def rest(pg, label):
    await pg.evaluate("()=>{ RS.fatigue=0; RS.stress=0; menu('Rest'); }"); await click(pg, '#r-rest'); return await settle(pg, max_s=240, label=label)
async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        await pg.evaluate(SETUP, 'Chomp'); await pg.evaluate("()=>{ PLAYER.tutorialDone=true; RS.noScenes=true; RS.level=20; drawUI(); }"); await settle(pg, label='start')
        said = []
        await pg.evaluate("()=>{ window.__said=[]; const s0=say; say=(t,who)=>{ if(t) __said.push((who||'tala')+': '+t); s0(t,who); }; }")
        async def beat(name, setup, label):
            await pg.evaluate(setup); ok = await rest(pg, label)
            seen = await pg.evaluate("n=>story().seen[n]", name); lines = await pg.evaluate("()=>__said.splice(0)")
            bad = [l for l in lines if 'undefined' in l or 'NaN' in l or '[object' in l or 'null' in l.split(': ', 1)[1].split()]
            C.ok(ok and seen is not None and seen >= 0 and not bad, f'the {name} scene plays to the end ({len(lines)} lines) {bad[:2]}')
        await beat('intro', "()=>{}", 'intro')
        await beat('gradeD', "()=>{ RS.grade='D'; }", 'gradeD')
        await beat('gradeC', "()=>{ RS.grade='C'; }", 'gradeC')
        await beat('gradeB', "()=>{ RS.grade='B'; }", 'gradeB')
        await beat('gradeA', "()=>{ RS.grade='A'; }", 'gradeA')
        await beat('gradeS', "()=>{ RS.grade='S'; }", 'gradeS')
        await beat('master', "()=>{ RS.master=true; RS.majors=['Spring','Summer','Autumn','Winter']; }", 'master')
        # the loan, paid at the Town Hall in the game's own steps; each quarter plays its scene there and then
        await pg.evaluate("()=>{ PLAYER.bits=40000; menu('Out'); openTown(); }"); await click(pg, '#tw-hall', 300)
        for k in range(8):
            if not await click(pg, '#r-panel [data-pay="5000"]', 300): await click(pg, '#r-panel [data-pay]', 300)
            C.ok(await settle(pg, max_s=120, label=f'pay{k}'), f'loan payment {k + 1} goes through')
            if await pg.evaluate("()=>loanLeft()") == 0: break
        st = await pg.evaluate("()=>({paid:story().paid,seen:['loan25','loan50','loan75','loan100'].map(k=>story().seen[k]!=null),bag:PLAYER.bag['Life fruit']||0,bits:PLAYER.bits})")
        C.ok(st['paid'] == 30000 and all(st['seen']) and st['bag'] >= 1 and st['bits'] == 10000, f'the loan is paid in full with all four scenes and the Life fruit ({st})')
        await pg.evaluate("()=>{ __said.splice(0); menu(); }")
        await beat('legend', "()=>{ story().legendWon=true; }", 'legend')
        C.ok(await pg.evaluate("()=>dueBeat()") is None, 'no scene is left waiting')
        # a contest of each kind (they rotate by month) and a mission of each length
        for mo in range(4):
            await pg.evaluate("mo=>{ PLAYER.week=48+mo*4; RS.fatigue=0; RS.stress=0; drawUI(); menu('Out'); openContests(); }", mo); await pg.wait_for_timeout(200)
            kind = await pg.evaluate("()=>contestOf(PLAYER.week).kind"); w = await pg.evaluate("()=>PLAYER.week")
            C.ok(await click(pg, '#ct-go') and await settle(pg, max_s=200, label='contest' + kind) and await pg.evaluate("w=>PLAYER.week===w+1", w), f'the {kind} contest runs and takes the week')
        # the record page's week log: a contest week has to be readable (light text on its dark chip)
        await pg.evaluate("()=>openInfo('record')"); await pg.wait_for_timeout(200)
        chip = await pg.evaluate("()=>{ const e=[...document.querySelectorAll('.i-log span')].find(e=>e.textContent==='Contest'); if(!e) return null; const c=getComputedStyle(e), n=t=>t.match(/\\d+/g).slice(0,3).map(Number), lum=v=>(0.299*v[0]+0.587*v[1]+0.114*v[2]); return Math.abs(lum(n(c.color))-lum(n(c.backgroundColor))); }")
        C.ok(chip is not None and chip > 100, f'a contest week in the log is readable (text and chip differ by {chip} in brightness)'); await pg.evaluate("()=>closeInfo()")
        for i in range(3):
            await pg.evaluate("()=>{ RS.fatigue=0; RS.stress=0; RS.injured=false; drawUI(); menu('Out'); openBoard(); }"); await pg.wait_for_timeout(200); w = await pg.evaluate("()=>PLAYER.week")
            info = await pg.evaluate("i=>{ const b=board(RS)[i]; return [b.kind,KINDS[b.kind].weeks]; }", i)
            ok = await click(pg, f'#r-panel [data-b="{i}"]') and await settle(pg, {'keepReport': True}, max_s=300, label='mission' + info[0])
            rep = await pg.evaluate("()=>!!document.getElementById('r-rok')"); bt = await pg.evaluate("()=>__badText()")
            end = await pg.evaluate("()=>({shown:__audit.lastRes,report:[...document.querySelectorAll('#r-panel .trip-row')].pop().textContent})")
            C.ok((end['shown'] == 'Win') == (' beat ' in end['report']), f'the mission report agrees with the fight that played ({end})')
            C.ok(ok and rep and not bt and await pg.evaluate("([w,n])=>PLAYER.week===w+n", [w, info[1]]), f'a {info[0]} mission runs, shows its report and takes {info[1]} week(s) ({bt})')
            await pg.evaluate("()=>{ __audit.lastRes=null; }")
            C.ok(await click(pg, '#r-watch', 500) and await settle(pg, {'keepReport': True}, max_s=200, label='watch'), 'the last fight can be watched again')
            again = await pg.evaluate("()=>__audit.lastRes"); C.ok(again == end['shown'], f'watching it again shows the same result ({again}, first {end["shown"]})'); await click(pg, '#r-rok', 300)
        # 120 mission endings off screen: the result the report uses is the one the fight screen's own stepping gives
        mm = await pg.evaluate("""()=>{ let n=0, same=0; const s=RS, real=runMission;
          for(let k=0;k<120;k++){ const a={reg:REGIONS[k%12].n,kind:['Scout','Gather','Hunt'][k%3],level:s.level+(k%4)-1,seed:7000+k}, tp=s.tp.slice(), res=resolveMission(s,a); s.tp=tp; const foe=endFoe(s,res), snap=fightSnapshot(s);
            const used=arSim(arPlayer(snap),arFoe(foe),rng(res.endSeed+1),true,true), ar=new Arena(arPlayer(snap),arFoe(foe),rng(res.endSeed+1),['smart','smart']); ar.live=true; ar.noDraw=true; while(!ar.over){ ar.step(); if(ar.turn){ ar.land(); ar.endTurn(); } }
            n++; if(used.winner===ar.winner&&used.p[0].hp===ar.p[0].hp) same++; }
          return {n,same,usesArena:real.toString().includes('arSim(arPlayer(snap)')}; }""")
        C.ok(mm['same'] == mm['n'] and mm['usesArena'], f'mission results come from the arena fight that is shown ({mm})')
        sn = await pg.evaluate("()=>{ RS.arPresets=[['Dash In'],[],[]]; RS.arPreset=0; RS.arHabit={Bite:5}; const f=arPlayer(fightSnapshot(RS)); return {off:!f.moves.some(m=>m.name==='Dash In'),habit:f.habit}; }")
        C.ok(sn['off'] and sn['habit'] == {'Bite': 5}, f'a mission or trip fight uses the move preset and the habits ({sn})')
        bt = await pg.evaluate("()=>__audit.bad"); C.ok(not bt, f'no NaN or undefined on screen ({bt})')
        snd = await pg.evaluate("()=>__snd"); C.ok(not snd, f'no sound threw ({snd[:3]})')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
