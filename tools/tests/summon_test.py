import asyncio, subprocess, glob, os
from playwright.async_api import async_playwright
SETUP = open('game.py').read().split('SETUP = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport=dict(width=390, height=844), device_scale_factor=2, record_video_dir='/tmp/vid', record_video_size=dict(width=390,height=844))
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#test'); await pg.wait_for_timeout(1000)
        print('manifest', await pg.evaluate("fetch('manifest.webmanifest').then(r=>r.json()).then(j=>j.icons.length)"))
        await pg.evaluate("()=>{ const o=document.getElementById('ob'); if(o) o.style.display='none'; }")
        await pg.set_input_files('#pick', '/tmp/photo.png'); await pg.wait_for_timeout(600)
        print('mode', await pg.evaluate("mode"), 'bars shown', await pg.evaluate("getComputedStyle(bars).display"))
        await pg.screenshot(path='sm-aim.png')
        await pg.click('#scanbtn')
        prev=0
        for t in [300, 1000, 1700, 2600, 3300, 3700, 4700]:
            await pg.wait_for_timeout(t - (0 if t==300 else prev)); prev=t
            await pg.screenshot(path=f'sm-{t}.png')
        await pg.wait_for_timeout(1300)
        print('card visible', await pg.evaluate("[getComputedStyle(card).display, card.classList.contains('held'), !!document.querySelector('.summon-cv'), lastMon&&lastMon.name]"))
        await pg.screenshot(path='sm-card.png')
        print('errors', errs); vp = await pg.video.path(); await ctx.close(); await b.close(); print(vp)

asyncio.run(main())
