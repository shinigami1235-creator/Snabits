import asyncio, json
from playwright.async_api import async_playwright
SIM=r"""
()=>{
const R=rng(7), FAMS=Object.keys(FAM_MOVES);
const make=(fam,lv)=>{ let o; for(let k=0;k<400;k++){ o=gradedOpponent("B",lv,R,null,260); if(o.m.family===fam) break; }
  const f=makeFighter(o.fm,o.skills,o.level); f.family=fam; f.moves=arMoves(fam,lv,o.m.pool.filter(n=>SKILLS[n].lv<=lv),o.m.el1); return f; };
const C={}, ST={}, SUP={}, moves={}; let n=0;
for(let k=0;k<200;k++){ const a=FAMS[k%8], b=FAMS[(k*3+1)%8]; const ar=new Arena(make(a,30),make(b,30),R); const push=ar.ev.push.bind(ar.ev);
  ar.ev.push=e=>{ C[e.t]=(C[e.t]||0)+1; if(e.t==="status") ST[e.name]=(ST[e.name]||0)+1; if(e.t==="start"&&(e.m.support||e.m.buff)) SUP[e.m.name]=(SUP[e.m.name]||0)+1; return push(e); };
  while(!ar.over){ ar.step(); ar.ev.length=0; } n++; }
return {n,C,ST,SUP}; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html'); await pg.wait_for_timeout(800)
        print(json.dumps(await pg.evaluate(SIM))); print('errors',errs); await b.close()
asyncio.run(main())
