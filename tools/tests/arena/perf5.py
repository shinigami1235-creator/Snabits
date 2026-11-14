import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport=dict(width=390,height=844),device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html#arena'); await pg.wait_for_timeout(800)
        await pg.click('#at-me [data-f="Stilt"]'); await pg.click('#at-foe [data-f="Skit"]'); await pg.click('#at-go'); await pg.wait_for_timeout(500)
        await pg.evaluate("""()=>{ const L=atLoop; window.__f=[]; let last=0; atLoop=function(now){ const t0=performance.now(); L(now); __f.push([now-last, performance.now()-t0, (AT.ar.turn?"T":"")+(AT.ar.over?"O":"")+(now<AT.freeze?"F":"")]); last=now; }; for(const q of AT.ar.p){ q.hp=q.maxhp=2500; } }""")
        await pg.click('#at-auto'); await pg.wait_for_timeout(20000)
        r=await pg.evaluate("""()=>{ const f=__f.slice(5), g=f.map(x=>x[0]).sort((a,b)=>a-b), w=f.map(x=>x[1]).sort((a,b)=>a-b);
          const big=f.map((x,i)=>[i,Math.round(x[0]),x[2]]).filter(x=>x[1]>50).slice(0,40); return {big, frames:f.length, gapMedian:+g[g.length>>1].toFixed(1), gapsOver25:f.filter(x=>x[0]>25).length, gapsOver50:f.filter(x=>x[0]>50).length, workMedian:+w[w.length>>1].toFixed(1), workP99:+w[Math.floor(w.length*0.99)].toFixed(1), workWorst:+w[w.length-1].toFixed(1), moves:AT.ar.log.length}; }""")
        print(json.dumps(r)); print(errs); await b.close()
asyncio.run(main())
