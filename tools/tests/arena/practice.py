import asyncio
from playwright.async_api import async_playwright
SETUP=open('game.py').read().split('SETUP = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844),device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html'); await pg.wait_for_timeout(900)
        await pg.evaluate(SETUP,'Pinch'); await pg.evaluate("()=>{ RS.level=6; saveGame(); showTitle(); }"); await pg.wait_for_timeout(500)
        await pg.screenshot(path='arena/title.png')
        await pg.click('#ob-practice'); await pg.wait_for_timeout(400); await pg.screenshot(path='arena/picker.png')
        # a ranch Snabit
        await pg.click('#at-ros [data-k="0"]'); await pg.click('#at-go'); await pg.wait_for_timeout(1200)
        print('ranch fight', await pg.evaluate("()=>[AT.A.f.name, AT.A.level, AT.B.level, AT.B.f.family]"))
        await pg.evaluate("()=>openArenaTest()"); await pg.wait_for_timeout(300)
        # a scan: open the camera flow, then pretend the scan card button was pressed with a hatched monster
        await pg.evaluate("()=>{ const m=randomOpponent(Math.random); window.PRACTICE=true; atFromScan(m); }"); await pg.wait_for_timeout(300)
        await pg.click('#at-go'); await pg.wait_for_timeout(1200)
        print('scan fight', await pg.evaluate("()=>[AT.A.f.name, AT.A.level, AT.A.f.moves.length, AT.B.f.family]"))
        await pg.screenshot(path='arena/scanfight.png')
        print('errors',errs); await b.close()
asyncio.run(main())
