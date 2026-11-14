import asyncio
from playwright.async_api import async_playwright
S=open('game.py').read().split('SETUP = """')[1].split('"""')[0]
B=open('game.py').read().split('BATTLE = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844),device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#art=pixel'); await pg.wait_for_timeout(800)
        await pg.evaluate(S,'Chomp'); await pg.wait_for_timeout(800); await pg.locator('#r-frame').screenshot(path='px-ranch.png')
        await pg.evaluate("()=>{RS.stage='Mega';RS.mark=1;RS.mark2=0;}"); await pg.evaluate(B); await pg.wait_for_timeout(800)
        await pg.click('#b-btns button >> nth=0'); await pg.wait_for_timeout(3000); await pg.screenshot(path='px-battle.png')
        print('chibi layer:', await pg.evaluate("()=>!!document.getElementById('r-chibi')"), 'errors', errs)
        await b.close()
asyncio.run(main())
