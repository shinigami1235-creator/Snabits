import asyncio, glob, os, sys, time
from playwright.async_api import async_playwright
FOE=sys.argv[1] if len(sys.argv)>1 else "Squib"
JS_SETUP="""()=>{ const ar=AT.ar; for(const q of ar.p){ q.ai='human'; q.maxhp=900; q.hp=900; q.focus=99; } ar.p[0].x=38; ar.p[1].x=50;
  const d=document.createElement('div'); d.id='cap'; d.style.cssText='position:fixed;left:0;right:0;top:64px;text-align:center;font:800 20px system-ui;color:#fff;text-shadow:0 2px 6px #000;z-index:99;pointer-events:none'; document.body.appendChild(d);
  window.MV=(name,extra)=>Object.assign(arFromSkill(name)||{name,range:'Close',dmg:30,acc:100,sharp:0,wither:0,push:0,cost:10,wind:0.4,hits:1},extra||{});
  window.USE=(i,m,miss)=>{ const ar=AT.ar, p=ar.p[i]; p.focus=99; p.cool=0; p.think=0; const R=ar.rand; if(miss) ar.rand=()=>0.995; const ok=ar.start(p,m); ar.rand=R; return ok; };
  window.CAP=t=>{ document.getElementById('cap').textContent=t; };
  window.POS=(a,b)=>{ const ar=AT.ar; ar.p[0].x=a; ar.p[1].x=b; ar.p[0].px=a; ar.p[1].px=b; }; }"""
SCENES=[
 ("Dodge: hop back", "()=>{ POS(38,50); USE(0,MV('Bite',{name:'Bite',range:'Close',dmg:24,acc:85}),1); }", "back", 1500),
 ("Dodge: duck under a shot", "()=>{ POS(30,64); USE(0,MV('Squirt',{name:'Squirt',range:'Mid',dmg:31,acc:90,cast:true,el:'Tide'}),1); }", "duck", 1700),
 ("Dodge: jump over a shot", "()=>{ POS(30,64); USE(0,MV('Zap',{range:'Mid'}),1); }", "leap", 1700),
 ("Dodge: lean away", "()=>{ POS(30,64); USE(0,MV('Thunderclap',{range:'Mid'}),1); }", "sway", 1900),
 ("Phase Shift: it passes through", "()=>{ POS(38,50); AT.ar.p[1].buff.phase=3; USE(0,MV('Bite',{name:'Bite',range:'Close',dmg:24,acc:85}),1); }", "phase", 2000),
 ("Burn", "()=>{ POS(38,50); USE(0,MV('Ember Bite',{status:['Burn',400]})); }", None, 3200),
 ("Freeze, then a hit shatters it", "()=>{ AT.ar.p[1].st=null; POS(30,64); USE(0,MV('Frost Nip',{range:'Mid',status:['Freeze',400]})); setTimeout(()=>{ POS(38,50); USE(0,MV('Bite',{name:'Bite',range:'Close',dmg:24,acc:100})); },1300); }", None, 3400),
 ("Heal", "()=>{ const q=AT.ar.p[1]; q.st=null; q.thawT=0; q.hp=330; POS(38,56); USE(1,MV('Soothing Tide')); }", None, 2400),
 ("Drain", "()=>{ AT.ar.p[0].hp=420; POS(30,62); USE(0,MV('Sap Drain')); }", None, 2600),
 ("Protect, then a hit on the shield", "()=>{ POS(38,50); USE(1,MV('Protect')); setTimeout(()=>USE(0,MV('Bite',{name:'Bite',range:'Close',dmg:24,acc:100})),1400); }", None, 3000),
 ("Counter", "()=>{ POS(38,50); USE(1,MV('Counter')); setTimeout(()=>USE(0,MV('Bite',{name:'Bite',range:'Close',dmg:40,acc:100})),1300); }", None, 2900),
 ("Mirror Charm bounces a Cast back", "()=>{ POS(30,64); USE(1,MV('Mirror Charm')); setTimeout(()=>USE(0,MV('Zap',{range:'Mid'})),1300); }", None, 3000),
 ("Stats up and down", "()=>{ POS(36,56); USE(0,MV('Bulk Up')); setTimeout(()=>USE(1,MV('Allure')),1300); }", None, 2900),
 ("Regrowth over time", "()=>{ const q=AT.ar.p[1]; q.hp=420; POS(36,56); USE(1,MV('Overgrowth')); }", None, 4000),
 ("Rest: heals, then sleeps until hit", "()=>{ const q=AT.ar.p[1]; q.hp=400; q.heals=0; POS(38,50); USE(1,MV('Rest')); }", None, 3000),
 ("Root and Blind", "()=>{ const q=AT.ar.p[1]; q.sleep=0; q.st=null; POS(36,56); USE(0,MV('Vine Lash',{range:'Near',status:['Root',400]})); setTimeout(()=>{ q.st=null; USE(0,MV('Glint',{range:'Near',status:['Blind',400]})); },2600); }", None, 5000),
 ("Poison, Shock, Daze", "()=>{ const q=AT.ar.p[1]; q.sleep=0; q.st=null; POS(36,56); USE(0,MV('Toxic Spit',{range:'Near',status:['Poison',400]})); setTimeout(()=>{ q.st=null; USE(0,MV('Thunder Fang',{range:'Near',status:['Shock',400]})); },1600); setTimeout(()=>{ q.st=null; USE(0,MV('Hypno Ray',{range:'Near',status:['Daze',400]})); },3400); }", None, 5200),
]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for f in glob.glob('vf/*'): os.remove(f)
        ctx=await b.new_context(viewport=dict(width=390,height=844),record_video_dir='vf',record_video_size=dict(width=390,height=844))
        T0=time.monotonic(); pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
        await pg.goto('http://localhost:8765/prototype/index.html#arena'); await pg.wait_for_timeout(700)
        await pg.click('#at-me [data-f="Chomp"]'); await pg.click(f'#at-foe [data-f="{FOE}"]'); await pg.click('#at-go'); await pg.wait_for_timeout(300)
        await pg.evaluate(JS_SETUP); await pg.wait_for_timeout(900)
        for cap,js,style,ms in SCENES:
            print(round(time.monotonic()-T0,2),cap); await pg.evaluate("t=>CAP(t)",cap); await pg.evaluate(js)
            if style: await pg.wait_for_timeout(25); await pg.evaluate("s=>{ const S=AT.side[1]; if(S.dodgeAt) S.dodgeAt.style=s; if(S.react&&S.react.kind==='dodge') S.react.style=s; }",style)
            await pg.wait_for_timeout(ms)
        print('errors',errs[:5]); await ctx.close(); await b.close()
asyncio.run(main())
