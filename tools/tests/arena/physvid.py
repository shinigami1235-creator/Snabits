import asyncio, glob, os, sys, time
from playwright.async_api import async_playwright
PLAN=[("Stilt",["Kick","Kick Off","High Kick","Sweep","Axe Kick","Stampede"]),("Skit",["Nip","Skitter Bite","Leg Flurry","Web"]),
      ("Pinch",["Pinch","Claw Jab","Vice Grip","Crab Hammer"]),("Squib",["Tentacle Lash","Jet Back"]),("Chomp",["Lunge","Jaw Lock","Gnash"]),("Booly",["Soul Pass"]),("Moko",["Blink"])]
GAP={'Close':6,'Near':18,'Mid':34,'Far':56,'Any':12}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for f in glob.glob('vp/*'): os.remove(f)
        ctx=await b.new_context(viewport=dict(width=390,height=844),record_video_dir='vp',record_video_size=dict(width=390,height=844))
        T0=time.monotonic(); log=[]; errs=[]
        for fam,moves in PLAN:
            pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto('http://localhost:8765/prototype/index.html#arena'); await pg.wait_for_timeout(600)
            await pg.click(f'#at-me [data-f="{fam}"]'); await pg.click('#at-foe [data-f="Moko"]'); await pg.click('#at-go'); await pg.wait_for_timeout(300)
            await pg.evaluate("""()=>{ const ar=AT.ar; for(const q of ar.p){ q.ai='human'; q.hp=q.maxhp=3000; }
              const d=document.createElement('div'); d.id='cap'; d.style.cssText='position:fixed;left:0;right:0;top:64px;text-align:center;font:800 20px system-ui;color:#fff;text-shadow:0 2px 6px #000;z-index:99'; document.body.appendChild(d); }""")
            for mv in moves:
                r=await pg.evaluate("""([name,GAP])=>{ const ar=AT.ar, p=ar.p[0], m=p.f.moves.find(x=>(x.base||x.name)===name); if(!m) return 'missing '+name;
                  const g=GAP[m.range]; ar.p[0].x=30; ar.p[1].x=30+6+g; ar.p[0].px=ar.p[0].x; ar.p[1].px=ar.p[1].x; return 'ok'; }""",[mv,GAP])
                if r!='ok': log.append((fam,mv,r, await pg.evaluate("()=>AT.ar.p[0].f.moves.map(x=>x.name+'/'+(x.base||'')).join(',')"))); continue
                await pg.wait_for_timeout(700)
                r2=await pg.evaluate("""name=>{ const ar=AT.ar, p=ar.p[0], m=p.f.moves.find(x=>(x.base||x.name)===name); document.getElementById('cap').textContent=m.name; p.focus=99; p.cool=0; p.hp=Math.min(p.hp,1800); const R=ar.rand; ar.rand=()=>0.01; const ok=ar.start(p,m); ar.rand=R; return [ok, AT.side[0].anim&&AT.side[0].anim.kind]; }""",mv)
                await pg.wait_for_timeout(50)
                k=await pg.evaluate("()=>AT.side[0].anim&&AT.side[0].anim.kind")
                log.append((round(time.monotonic()-T0,2),fam,mv,r,r2,k)); await pg.wait_for_timeout(1700)
            await pg.close()
        for l in log: print(l)
        print('errors',errs[:4]); await ctx.close(); await b.close()
asyncio.run(main())
