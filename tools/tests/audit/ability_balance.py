"""Arena win rate for each ability on its own: the same random Snabits fight twice, once with the ability forced on side A and
once with no ability, and the difference is what the ability is worth. Level 30, grade B training, the sim2 setting.
Usage: ability_balance.py [fights per ability, default 600]"""
import asyncio, sys
from playwright.async_api import async_playwright
from common import launch
N = int(sys.argv[1]) if len(sys.argv) > 1 else 600
SIM = r"""([n])=>{ const FAMS=Object.keys(FAM_MOVES).filter(f=>!FAMILY[f].special);
const ABS=[...new Set(FAMS.map(f=>FAMILY[f].ability[0]).concat(Object.values(EL_ABILITY).flat().map(a=>a[0])))];
const out={};
const make=(R,fam,ab,held)=>{ const o=gradedOpponent('B',30,R,null,260,randomOpponent(R,fam)); const f=makeFighter(o.fm,o.skills,o.level); f.family=fam; f.ability=ab; f.moves=arMoves(fam,30,o.m.pool.filter(k=>SKILLS[k].lv<=30),o.m.el1); return f; };
for(const ab of ABS){ let w=0,w0=0;
  for(let k=0;k<n;k++){ const seed=7000+k, pick=rng(seed), fa=FAMS[Math.floor(pick()*FAMS.length)], fb=FAMS[Math.floor(pick()*FAMS.length)];
    for(const on of [1,0]){ const R=rng(seed*3+1); const a=make(R,fa,on?ab:'-'), b=make(R,fb,'-'); const ar=new Arena(a,b,R).run();
      const s=ar.winner===0?1:ar.winner===null?0.5:0; if(on) w+=s; else w0+=s; } }
  out[ab]=[w/n,w0/n]; }
return out; }"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        r = await pg.evaluate(SIM, [N])
        for k, (w, w0) in sorted(r.items(), key=lambda x: -(x[1][0] - x[1][1])):
            print(f'  {k:14s} {100*w:5.1f}% with it, {100*w0:5.1f}% without, {100*(w-w0):+5.1f}')
        print('errors', errs[:3]); await b.close()
asyncio.run(main())
