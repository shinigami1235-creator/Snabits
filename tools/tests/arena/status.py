import asyncio, sys
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
import os
NAMES=os.environ.get("NAMES","Burn,Poison,Root,Freeze,Shock,Soak,Daze,Crack,Blind,Curse,Dread").split(",")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844),device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#arena'); await pg.wait_for_timeout(900)
        await pg.click('#at-me [data-f="Chomp"]'); await pg.click('#at-foe [data-f="'+(sys.argv[1] if len(sys.argv)>1 else "Moko")+'"]'); await pg.click('#at-go'); await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{ const ar=AT.ar; for(const q of ar.p){ q.ai='human'; q.hp=q.maxhp=5000; } ar.p[0].x=34; ar.p[1].x=56; }"); await pg.wait_for_timeout(1500)
        shots=[]
        for n in NAMES:
            await pg.evaluate("n=>{ const ar=AT.ar, q=ar.p[1]; q.st={name:n,t:AR_STATUS[n].d*0.7,from:0,tick:0}; q.stun=0; ar.ev.push({t:'status',i:1,name:n}); }", n)
            await pg.wait_for_timeout(1100 if n!="Freeze" else 600)
            box=await pg.evaluate("()=>{ const P=AT.lastPlaced[1], z=AT.zoom; return [(P.x-AT.cam)*z, (P.top.y-AT.FY)*z+AT.floorS, (P.foot-AT.FY)*z+AT.floorS]; }")
            x,y0,y1=box; cx=max(0,min(390-200,x-100)); cy=max(0,y0-80)
            f=f'st_{n}.png'; await pg.screenshot(path=f, clip=dict(x=cx,y=cy,width=200,height=min(844-cy,(y1-y0)+120))); shots.append((n,f))
            await pg.evaluate("()=>{ const q=AT.ar.p[1]; q.st=null; }"); await pg.wait_for_timeout(250)
        print('errors',errs); await b.close()
    ims=[Image.open(f) for _,f in shots]; W=max(i.width for i in ims); H=max(i.height for i in ims); cols=4; rows=(len(ims)+cols-1)//cols
    sheet=Image.new('RGB',(W*cols,(H+44)*rows),(20,21,29)); d=ImageDraw.Draw(sheet)
    try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
    except: font=None
    for k,((n,_),im) in enumerate(zip(shots,ims)):
        x=(k%cols)*W; y=(k//cols)*(H+44); sheet.paste(im,(x,y+44)); d.text((x+12,y+8),n,fill=(255,255,255),font=font)
    sheet.save('status_sheet.png'); print(sheet.size)
asyncio.run(main())
