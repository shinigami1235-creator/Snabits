import asyncio, json
from playwright.async_api import async_playwright
SIM=r"""
()=>{
const R=rng(42), FAMS=Object.keys(FAM_MOVES);
const make=(fam,lv,scale=1)=>{ let o; for(let k=0;k<400;k++){ o=gradedOpponent("B",lv,R,null,260); if(o.m.family===fam) break; }
  const f=makeFighter(o.fm,o.skills,o.level); for(const k in f.base) f.base[k]=Math.max(1,Math.round(f.base[k]*scale)); f.maxhp=Math.round(f.maxhp*(0.5+0.5*scale)); f.hp=f.maxhp;
  f.family=fam; f.moves=arMoves(fam,lv,o.m.pool.filter(n=>SKILLS[n].lv<=lv)); return {f,o}; };
const out={fam:{},len:[],ko:0,n:0};
const W={}, G={}; for(const a of FAMS){ W[a]=0; G[a]=0; }
for(const a of FAMS) for(const b of FAMS){ if(a===b) continue; for(let k=0;k<14;k++){ const A=make(a,30), B=make(b,30); const ar=new Arena(A.f,B.f,R).run();
  G[a]++; G[b]++; if(ar.winner===0) W[a]++; else if(ar.winner===1) W[b]++; out.len.push(ar.t); out.n++; if(!ar.judged) out.ko++; } }
for(const a of FAMS) out.fam[a]=Math.round(100*W[a]/G[a])+"%";
out.len.sort((x,y)=>x-y); out.medianSec=out.len[out.len.length>>1].toFixed(1); out.koPct=Math.round(100*out.ko/out.n)+"%"; delete out.len;
const H=[]; for(let k=0;k<300;k++){ const a=FAMS[k%FAMS.length], b=FAMS[(k*5+3)%FAMS.length]; const A=make(a,30), B=make(b,30), ar=new Arena(A.f,B.f,R); const mv=A.f.moves.filter(m=>m.dmg&&m.acc); for(const m of mv.slice(0,3)) H.push(ar.hitChance(ar.p[0],m)); }
H.sort((x,y)=>x-y); out.hit={p10:+H[Math.floor(H.length*0.1)].toFixed(2),median:+H[H.length>>1].toFixed(2),p90:+H[Math.floor(H.length*0.9)].toFixed(2)};
return out; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/prototype/index.html'); await pg.wait_for_timeout(800)
        print(json.dumps(await pg.evaluate(SIM))); print('errors',errs); await b.close()
asyncio.run(main())
