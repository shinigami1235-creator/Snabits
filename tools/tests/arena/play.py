import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844),device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#arena'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path='arena/pick.png')
        await pg.click('#at-me [data-f="Chomp"]'); await pg.click('#at-foe [data-f="Booly"]'); await pg.click('#at-go'); await pg.wait_for_timeout(400)
        # walk right for a bit, then try moves
        await pg.dispatch_event('#at-r','pointerdown'); await pg.wait_for_timeout(1500); await pg.dispatch_event('#at-r','pointerup'); print('after closing in', await pg.evaluate('()=>[AT.ar.p[0].x.toFixed(1),AT.ar.p[1].x.toFixed(1),AT.ar.band()]'))
        await pg.screenshot(path='arena/play1.png')
        for k in range(30):
            await pg.evaluate("()=>{ const ar=AT.ar, k=AT.moves.findIndex(m=>ar.inRange(m)&&m.dmg&&m.cost<=ar.p[0].focus); if(k>=0){ AT.sel=k; atRows(true); ar.start(ar.p[0],AT.moves[k]); } else ar.p[0].wantDir=ar.p[1].x>ar.p[0].x?1:-1; }")
            await pg.wait_for_timeout(350)
            if k==8: await pg.screenshot(path='arena/play2.png')
            if await pg.evaluate("()=>AT.ar.over"): break
        await pg.wait_for_timeout(1500); await pg.screenshot(path='arena/play3.png')
        print(await pg.evaluate("()=>[AT.ar.winner, Math.round(AT.ar.t), AT.ar.p.map(p=>p.hp)]"),'errors',errs); await b.close()
asyncio.run(main())
