import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844),device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#arena'); await pg.wait_for_timeout(900)
        await pg.click('#at-me [data-f="Chomp"]'); await pg.click('#at-foe [data-f="Booly"]'); await pg.click('#at-go'); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{ const ar=AT.ar; ar.p[1].ai='human'; ar.p[0].x=40; ar.p[1].x=70; }"); await pg.wait_for_timeout(1200)
        st="()=>[AT.ar.p[0].x.toFixed(1),AT.ar.p[1].x.toFixed(1),Math.round(AT.side[0].dx),Math.round(AT.side[1].dx),AT.ar.band()]"
        print('before', await pg.evaluate(st))
        await pg.dispatch_event('#at-r','pointerdown'); await pg.wait_for_timeout(3000); print('held ▶ 3s', await pg.evaluate(st))
        await pg.screenshot(path='arena/np.png')
        await pg.dispatch_event('#at-r','pointerup')
        await pg.dispatch_event('#at-l','pointerdown'); await pg.wait_for_timeout(1500); await pg.dispatch_event('#at-l','pointerup'); print('held ◀ 1.5s', await pg.evaluate(st))
        print('buttons', await pg.evaluate("()=>[...document.querySelectorAll('.ctl3 .btn')].map(b=>b.id+':'+Math.round(b.getBoundingClientRect().x))"))
        print('errors',errs); await b.close()
asyncio.run(main())
