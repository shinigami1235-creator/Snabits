import asyncio
from playwright.async_api import async_playwright
SETUP=open('game.py').read().split('SETUP = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844)); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html'); await pg.wait_for_timeout(900)
        await pg.evaluate(SETUP,'Booly'); await pg.evaluate("()=>{ story().seen.intro=1; RS.level=14; }")
        # the stray fight a trip ends with, and a mission's end fight, both on Auto with the snapshot the game uses
        r=await pg.evaluate("""()=>new Promise(res=>{ const o=gradedOpponent('E',12,Math.random); const snap=fightSnapshot(RS);
            arenaFight({s:snap,foe:o,mode:'auto',title:'Wild',noDraw:true,onEnd:r=>res([r.winner,r.secs,r.judged])});
            setTimeout(()=>{ const b=document.getElementById('at-shove'); if(b) b.click(); },400);
            const t=setInterval(()=>{ const c=document.getElementById('at-cont'); if(c){ clearInterval(t); c.click(); } },300); })""")
        print('stray on a snapshot', r)
        print('errors',errs); await b.close()
asyncio.run(main())
