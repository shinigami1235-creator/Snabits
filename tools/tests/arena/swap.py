import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844),device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#arena'); await pg.wait_for_timeout(900)
        await pg.click('#at-me [data-f="Booly"]'); await pg.click('#at-foe [data-f="Chomp"]'); await pg.click('#at-go'); await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{ const ar=AT.ar; ar.p[1].ai='human'; ar.p[0].x=20; ar.p[1].x=27; ar.p[0].focus=60; ar.rand=()=>0; }"); await pg.wait_for_timeout(900)
        await pg.screenshot(path='arena/sw0.png')
        print(await pg.evaluate("()=>{ const ar=AT.ar, m=ar.p[0].f.moves.find(m=>m.swap); return [m&&m.name, ar.start(ar.p[0],m)]; }"))
        shots=[]
        for k in range(5):
            await pg.wait_for_timeout(130); await pg.screenshot(path=f'arena/sw{k+1}.png')
        await pg.wait_for_timeout(700); await pg.screenshot(path='arena/sw6.png')
        print(await pg.evaluate("()=>[AT.ar.p[0].x.toFixed(1),AT.ar.p[1].x.toFixed(1),AT.side[0].dx>AT.side[1].dx,document.getElementById('at-hbot').className+' '+document.getElementById('at-hbot').offsetWidth]"))
        await pg.dispatch_event('#at-r','pointerdown'); await pg.wait_for_timeout(800); await pg.dispatch_event('#at-r','pointerup')
        print('after ▶', await pg.evaluate("()=>[AT.ar.p[0].x.toFixed(1),AT.ar.p[1].x.toFixed(1)]"))
        print('errors',errs); await b.close()
asyncio.run(main())
