import asyncio, json
from playwright.async_api import async_playwright
SETUP = """(fam) => {
 const hex=h=>[1,3,5].map(k=>parseInt(COL[h].slice(k,k+2),16));
 const r=(g,w)=>({g,w,raw:w,cd:0.3,rgb:hex(g)});
 const mk=(a,b,c,key)=>{const ranked=[r(a,60),r(b,25),r(c,10)];
   return hatch({ranked,main:ranked[0],second:ranked[1],mono:false,tie:false,colours:5,pool:9,cells:Array(9).fill(.5),sat:.5,bright:.6,contrast:.2,photoKey:key},new Date(),{family:fam});};
 window.MINE=mk('orange','brown','white','chompdemo'); window.FOE=mk('cyan','blue','yellow','chompfoe');
 const o=obRoot(); o.style.display='none'; o.innerHTML='';
 openRanch(MINE); return [MINE.name, MINE.el1, FOE.name, FOE.el1];
}"""
FORCE = """([stage,mark,mark2,pose,x,worn]) => {
 RS.stage=stage; RS.mark=mark; RS.mark2=mark2; RS.worn=worn||{}; RS.say=''; 
 clearInterval(window.FI); window.FI=setInterval(()=>{RS.pose=pose; RS.busy=true; RS.x=x; RS.jy=0; RS.hidden=false;},16);
 document.querySelectorAll('#ranch button').forEach(b=>{ if(/Got it/.test(b.textContent)) b.click(); });
}"""
BATTLE = """() => {
 clearInterval(window.FI); RS.busy=false;
 FOE.stage='Byte'; FOE.mark=1;
 arenaFight({s:RS,foe:{fm:FOE,skills:aiLoadout(FOE,20),level:20},title:'Cup',mode:'control'});
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport=dict(width=390, height=844), device_scale_factor=2)
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#art=chibi'); await pg.wait_for_timeout(800)
        print(await pg.evaluate(SETUP, 'Chomp')); await pg.wait_for_timeout(500)
        shots = [('Bit',None,None,'idle',120,None),('Bit',None,None,'happy',120,None),('Byte',1,None,'walk',110,None),('Byte',1,None,'eat',120,None),
                 ('Mega',1,0,'idle',125,None),('Mega',1,0,'happy',125,None),('Mega',1,0,'sleep',125,None),('Mega',1,0,'hurt',125,{'head':'Cap'})]
        fr = pg.locator('#r-frame')
        for i,sh in enumerate(shots):
            await pg.evaluate(FORCE, list(sh)); await pg.wait_for_timeout(700)
            await fr.screenshot(path=f'r{i}.png')
            if i==4: await pg.screenshot(path='ranch-full-mega.png')
        await pg.evaluate(FORCE, ['Mega',1,0,'idle',125,None]); await pg.wait_for_timeout(400)
        await pg.evaluate(BATTLE); await pg.wait_for_timeout(900)
        await pg.screenshot(path='battle-idle.png')
        await pg.evaluate("()=>{chibiPose(0,'attack'); chibiPose(1,'hit');}"); await pg.wait_for_timeout(300)
        await pg.screenshot(path='battle-hit.png')
        await pg.evaluate("()=>{chibiPose(0,'happy'); chibiPose(1,'ko');}"); await pg.wait_for_timeout(300)
        await pg.screenshot(path='battle-ko.png')
        # laptop
        pl = await b.new_page(viewport=dict(width=1366, height=768))
        await pl.goto('http://localhost:8765/prototype/index.html#art=chibi'); await pl.wait_for_timeout(800)
        await pl.evaluate(SETUP, 'Chomp'); await pl.evaluate(FORCE, ['Mega',1,0,'idle',125,None]); await pl.wait_for_timeout(700)
        await pl.screenshot(path='laptop-ranch.png')
        await pl.evaluate(BATTLE); await pl.wait_for_timeout(900); await pl.screenshot(path='laptop-battle.png')
        print('errors', errs)
        await b.close()
asyncio.run(main())
