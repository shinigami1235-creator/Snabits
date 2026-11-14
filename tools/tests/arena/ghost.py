import asyncio
from playwright.async_api import async_playwright
SETUP=open('game.py').read().split('SETUP = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844)); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html'); await pg.wait_for_timeout(900)
        await pg.evaluate(SETUP,'Moko'); await pg.evaluate("()=>{ story().seen.intro=1; RS.level=14; }")
        r=await pg.evaluate("""()=>new Promise(res=>{ const g=readGhost(ghostCode(RS)); const foe={fm:fightMon(g),skills:g.equip,level:g.level,fighter:playerFighter(g),m:g.m};
            arenaFight({s:RS,foe,mode:'auto',title:'Ghost battle',foeHabits:g,onEnd:r=>res([r.winner,r.secs,AT?null:'closed'])});
            setTimeout(()=>{ window.__gn=AT&&AT.B.f.name; const b=document.getElementById('at-shove'); if(b) b.click(); },500);
            const t=setInterval(()=>{ const c=document.getElementById('at-cont'); if(c){ clearInterval(t); c.click(); } },300); })""")
        print('ghost', r, await pg.evaluate("()=>window.__gn"))
        print('errors',errs); await b.close()
asyncio.run(main())
