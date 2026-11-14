"""Arena win rates per family, the way tools/tests/arena/sim2.py measures them (grade B training, level 30, every family against
every other), with more fights and several seeds so a 2 point difference means something. Draws count as half a win in "score".
Usage: arena_balance.py [fights per pair, default 30] [seeds, default 2]"""
import asyncio, sys, json
from playwright.async_api import async_playwright
from common import launch
PER = int(sys.argv[1]) if len(sys.argv) > 1 else 30
SEEDS = int(sys.argv[2]) if len(sys.argv) > 2 else 2
SIM = r"""([per,seed,lv,grade,earned])=>{ const R=rng(seed), FAMS=Object.keys(FAM_MOVES);
const make=fam=>{ const o=gradedOpponent(grade,lv,R,null,earned,randomOpponent(R,fam)); const f=makeFighter(o.fm,o.skills,o.level); f.family=fam; f.moves=arMoves(fam,lv,o.m.pool.filter(n=>SKILLS[n].lv<=lv)); return f; };
const W={},D={},G={}; for(const a of FAMS){ W[a]=0; D[a]=0; G[a]=0; } let ko=0,n=0,secs=0;
for(const a of FAMS) for(const b of FAMS){ if(a===b) continue; for(let k=0;k<per;k++){ const ar=new Arena(make(a),make(b),R).run(); G[a]++; G[b]++; if(ar.winner===0) W[a]++; else if(ar.winner===1) W[b]++; else { D[a]++; D[b]++; } n++; secs+=ar.t; if(!ar.judged) ko++; } }
return {W,D,G,ko,n,secs:secs/n}; }"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        for lv, grade, earned, label in [(30, 'B', 260, 'level 30, grade B training (the sim2 setting)')] + ([(10, 'E', 30, 'level 10, grade E training'), (50, 'S', 460, 'level 50, grade S training')] if len(sys.argv) > 3 else []):
            W = {}; D = {}; G = {}; ko = n = 0
            for s in range(SEEDS):
                r = await pg.evaluate(SIM, [PER, 42 + s * 1000, lv, grade, earned])
                for k in r['W']: W[k] = W.get(k, 0) + r['W'][k]; D[k] = D.get(k, 0) + r['D'][k]; G[k] = G.get(k, 0) + r['G'][k]
                ko += r['ko']; n += r['n']
            print(f'== {label}: {n} fights, {round(100 * ko / n)}% knockouts, {round(100 * sum(D.values()) / 2 / n, 1)}% draws')
            rows = sorted(W, key=lambda k: -(W[k] + D[k] / 2) / G[k])
            for k in rows: print(f'  {k:8s} wins {100 * W[k] / G[k]:5.1f}%  score {100 * (W[k] + D[k] / 2) / G[k]:5.1f}%  ({G[k]} fights, +-{196 * (0.25 / G[k]) ** 0.5:.1f})')
        print('errors', errs[:3]); await b.close()
asyncio.run(main())
