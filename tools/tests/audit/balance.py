"""Balance numbers from the game's own code (see sim.js): whole lives on a plain sensible plan, grade by grade.
Usage: balance.py lives [per family, default 2] [options as JSON] | cups | drills | quick"""
import asyncio, sys, json, os, statistics as st
from playwright.async_api import async_playwright
from common import launch, HERE
FAMS = ['Chomp', 'Pinch', 'Stilt', 'Skit', 'Antik', 'Squib', 'Moko', 'Booly', 'Plod', 'Bipped', 'Fizz', 'Teep', 'Lern']
SPECIAL = ['Eagle', 'Vampire', 'Phoenix', 'Kitsune', 'Naga', 'Yeti']
async def page(p):
    b, pg, errs = await launch(p); await pg.evaluate(open(os.path.join(HERE, 'sim.js')).read()); return b, pg, errs
def med(v): return round(st.median(v), 1) if v else None
async def lives(pg, per, fams, opts=None, label=''):
    rows = []
    for fi, fam in enumerate(fams):
        for k in range(per):
            try: r = await pg.evaluate("([f,s,o])=>SIM.life(f,s,o)", [fam, 1000 + fi * 37 + k * 101, opts or {}])
            except Exception as e: print('  sim error', fam, k, str(e)[:300]); continue
            rows.append(r)
            print(f"  {fam:8s} life {r['lifeWeeks']}wk ended wk {r['weeks']} grade {r['grade']} lv {r['level']} earned {r['tp']} {r['stage']} bits {r['bits']} grades {r['grades']} W-L {r['wl']} cups {r['counts']['cupWon']}/{r['counts']['cup']} off {r['counts']['officialWon']}/{r['counts']['official']} rest {r['counts']['rest']} drill {r['counts']['drill']} hurt {r['counts']['hurt']} cold {r['counts']['cold']} strain {r['counts']['strain']} money {r['money']}", flush=True)
    return rows
def summary(rows, label):
    G = ['E', 'D', 'C', 'B', 'A', 'S']; n = len(rows)
    print(f'== {label}: {n} lives')
    print('  final grade:', {g: sum(1 for r in rows if r['grade'] == g) for g in G})
    for g in G[1:]:
        w = [r['grades'][g] for r in rows if g in r['grades']]; print(f'  reached {g}: {len(w)} of {n}, median week {med(w)}')
    print('  lifespan weeks: median', med([r['lifeWeeks'] for r in rows]), 'min', min(r['lifeWeeks'] for r in rows), 'max', max(r['lifeWeeks'] for r in rows), '| calendar weeks actually lived: median', med([r['weeks'] for r in rows]))
    print('  level at the end: median', med([r['level'] for r in rows]), '| earned points: median', med([r['tp'] for r in rows]))
    for k in ['drill', 'heavy', 'rest', 'cup', 'wild', 'great', 'fail', 'slack', 'hurt', 'cold', 'strain']: print(f'  {k} per life: median', med([r['counts'][k] for r in rows]))
    tot = {}
    for r in rows:
        for k, v in r['money'].items(): tot.setdefault(k, []).append(v)
    print('  bits per life by source (median):', {k: med(v) for k, v in tot.items()}, '| bits in hand at the end: median', med([r['bits'] for r in rows]), 'min', min(r['bits'] for r in rows))
    print('  lowest bits at any week: median', med([r['minBits'] for r in rows]), 'min', min(r['minBits'] for r in rows), '| bits after the first year: median', med([r.get('bitsYear1', 0) for r in rows]))
    cups = {}
    for r in rows:
        for k, v in r['cups'].items(): c = cups.setdefault(k, [0, 0, 0]); c[0] += v['n']; c[1] += v['won']; c[2] += v['odds']
    print('  cups entered -> won (Tala\'s odds at entry):', {k: f"{v[1]}/{v[0]} ({round(100 * v[2] / max(1, v[0]))}%)" for k, v in sorted(cups.items(), key=lambda x: 'EDCBAS'.index(x[0][-1]))})
async def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'quick'
    async with async_playwright() as p:
        b, pg, errs = await page(p)
        if mode == 'cups': print(json.dumps(await pg.evaluate("()=>SIM.cupTable(8)"), indent=1))
        elif mode == 'drills':
            for r in await pg.evaluate("()=>SIM.drillTable('Chomp')"): print(f"  {r['stat']:22s} {r['drill']:5s} {r['result']:8s} gain {r['gain']:10s} fatigue +{r['fatigue']} stress +{r['stress']}")
        elif mode == 'quick': rows = await lives(pg, 1, FAMS[:3]); summary(rows, 'quick')
        else:
            per = int(sys.argv[2]) if len(sys.argv) > 2 else 2
            opts = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
            rows = await lives(pg, per, FAMS, opts); summary(rows, f'13 families x {per}, options {opts}')
            json.dump(rows, open('/tmp/balance-lives.json', 'w'))
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
