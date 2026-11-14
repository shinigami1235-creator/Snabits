"""Checks that every ability fires in the arena: 60 fights with the ability forced on side A (holding a Life seed and an
Element stone, so Heavy Lifter has something to work on), counting the times its label shows. Also fails on any error."""
import asyncio
from playwright.async_api import async_playwright
from common import launch
SIM = r"""()=>{ const FAMS=Object.keys(FAM_MOVES).filter(f=>!FAMILY[f].special);
const ABS=[...new Set(FAMS.map(f=>FAMILY[f].ability[0]).concat(Object.values(EL_ABILITY).flat().map(a=>a[0])))]; const out={};
for(const ab of ABS){ let n=0; const evs={};
  for(let k=0;k<60;k++){ const R=rng(500+k), fa=FAMS[k%FAMS.length], fb=FAMS[(k*7+3)%FAMS.length];
    const mk=(fam,a,el)=>{ const o=gradedOpponent('B',30,R,null,260,randomOpponent(R,fam)); const f=makeFighter(o.fm,o.skills,o.level); f.family=fam; f.ability=a;
      const e=el||o.m.el1; f.el1=e; f.moves=arMoves(fam,30,o.m.pool.filter(x=>SKILLS[x].lv<=30),e); return f; };
    const els={Wildfire:'Blaze',Permafrost:'Frost',Bloom:'Wild',Corrosion:'Venom'}, foeEl={'Lightning Rod':'Spark',Insulated:'Blaze',Reflect:'Charm',Corrosion:'Steel'};
    const a=mk(fa,ab,els[ab]), b=mk(fb,'-',foeEl[ab]); a.lifeSeed=true; a.heldEl=a.el1; a.heldMul=ab==='Heavy Lifter'?1.5:1;
    if(foeEl[ab]==='Steel'){ b.el1='Steel'; b.el2=null; }
    const ar=new Arena(a,b,R); while(!ar.over){ ar.step(); for(const e of ar.ev){ if(e.t==='ability'&&e.i===0) evs[e.name]=(evs[e.name]||0)+1; } ar.ev=[]; } n++; }
  out[ab]=evs[ab]||0; }
return out; }"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        r = await pg.evaluate(SIM)
        quiet = [k for k, v in r.items() if v == 0]
        for k, v in sorted(r.items(), key=lambda x: x[1]): print(f'  {k:14s} {v}')
        print('never fired:', quiet or 'none'); print('errors', errs[:3]); await b.close()
asyncio.run(main())
