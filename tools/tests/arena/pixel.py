import asyncio
from playwright.async_api import async_playwright
SETUP=open('game.py').read().split('SETUP = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844)); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#art=pixel'); await pg.wait_for_timeout(900)
        await pg.evaluate(SETUP,'Chomp'); await pg.wait_for_timeout(500)
        await pg.evaluate("()=>{ const o=gradedOpponent('E',5,Math.random); arenaFight({s:RS,foe:o,mode:'control',title:'Wild',onEnd:()=>{}}); }"); await pg.wait_for_timeout(800)
        print('pixel mode uses the old battle:', await pg.evaluate("()=>[getComputedStyle(document.getElementById('battle')).display, !!(document.getElementById('atest')&&document.getElementById('atest').style.display==='flex')]"))
        print('moves deduped:', await pg.evaluate("()=>{ const n=arMoves('Chomp',30,['Crunch','High Kick'],null).map(m=>m.name); return n.length===new Set(n).size; }"))
        print('errors',errs); await b.close()
asyncio.run(main())
