import asyncio, json
from playwright.async_api import async_playwright
SETUP=open('game.py').read().split('SETUP = """')[1].split('"""')[0]
async def tapthrough(pg, n=60):
    for k in range(n):
        if not await pg.evaluate("()=>!!document.querySelector('canvas.summon-cv')"): break
        await pg.mouse.click(200,400); await pg.wait_for_timeout(260)
async def wait_result(pg, skip=False, label=''):
    for k in range(200):
        await pg.wait_for_timeout(400)
        if skip and k==1: await pg.evaluate("()=>{ const b=document.getElementById('at-shove'); if(b&&/Skip/.test(b.textContent)) b.click(); }")
        if await pg.evaluate("()=>!!document.getElementById('at-cont')"): return True
    return False
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        pg=await b.new_page(viewport=dict(width=390,height=844),device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html'); await pg.wait_for_timeout(900)
        await pg.evaluate(SETUP,'Chomp'); await pg.evaluate("()=>{ story().seen.intro=1; RS.level=12; PLAYER.bits=5000; }")
        print('cup odds', await pg.evaluate("()=>cupOdds({name:'Sprout Cup',grade:'E',format:'elim',size:8,official:false,open:true},RS)"))
        await pg.evaluate("()=>{ openVenue(); startCup({name:'Sprout Cup',grade:'E',format:'elim',size:8,official:false,open:true}); }")
        await pg.wait_for_timeout(2500)
        for rnd in range(4):
            await tapthrough(pg)
            if not await pg.evaluate("()=>!!document.getElementById('t-auto')"): break
            if rnd==0:
                await pg.click('#t-fight'); await pg.wait_for_timeout(500)
                await pg.screenshot(path='arena/gf_preset.png')
                await pg.click('#atest [data-m] >> nth=1'); await pg.wait_for_timeout(200)
                print('preset after one tap', await pg.evaluate("()=>JSON.stringify(RS.arPresets)"))
                await pg.click('#at-fight'); await pg.wait_for_timeout(1500)
                await pg.screenshot(path='arena/gf_cupfight.png')
                print('music', await pg.evaluate("()=>[musWant(), AT.opts.mus, AT.ar.p[0].f.moves.length]"))
                await pg.click('#at-auto')
                ok=await wait_result(pg)
            else:
                await pg.click('#t-auto'); await pg.wait_for_timeout(600)
                ok=await wait_result(pg, skip=True)
            await pg.screenshot(path=f'arena/gf_res{rnd}.png')
            print('round',rnd,'result shown',ok, await pg.evaluate("()=>document.querySelector('#atest .res')&&document.querySelector('#atest .res').innerText.replace(/\\s+/g,' ').slice(0,140)"))
            await pg.click('#at-cont'); await pg.wait_for_timeout(1800)
            await tapthrough(pg)
            if await pg.evaluate("()=>!!document.getElementById('v-done')"): break
        print('cup done', await pg.evaluate("()=>[!!document.getElementById('v-done'), CUP&&CUP.place, Object.keys(RS.uses||{}).length, RS.fightNo]"))
        # a wild fight and a boss on Auto
        r=await pg.evaluate("""()=>new Promise(res=>{ const o=gradedOpponent('E',10,Math.random); arenaFight({s:RS,foe:o,mode:'auto',title:'Wild',learn:true,onEnd:r=>res(r)}); setTimeout(()=>{ const b=document.getElementById('at-shove'); if(b) b.click(); },500);
            const t=setInterval(()=>{ const c=document.getElementById('at-cont'); if(c){ clearInterval(t); window.__wildBg=AT.opts.wild; c.click(); } },300); })""")
        print('wild', json.dumps(r), 'grass field', await pg.evaluate("()=>window.__wildBg"))
        r=await pg.evaluate("""()=>new Promise(res=>{ const o=gradedOpponent('D',14,Math.random); o.boss='Thicket King'; arenaFight({s:RS,foe:o,mode:'auto',title:'Boss',noDraw:true,onEnd:r=>res(r)}); setTimeout(()=>{ const b=document.getElementById('at-shove'); if(b) b.click(); },500);
            const t=setInterval(()=>{ const c=document.getElementById('at-cont'); if(c){ clearInterval(t); c.click(); } },300); })""")
        print('boss', json.dumps(r))
        print('mission-style sim', await pg.evaluate("()=>{ const o=gradedOpponent('E',10,Math.random), f=arSim(arPlayer(RS),arFoe(o),Math.random); return [f.winner,f.secs,f.p[0].hp,Object.keys(f.p[0].used||{}).length]; }"))
        print('errors',errs); await b.close()
asyncio.run(main())
