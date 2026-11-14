"""Every cup format through the stadium screens, on Auto: round robin, knockout, a single match (the friendly and Rook's rival
match), the Summer Qualifier and the team exhibition it opens, a Major (best of 3) and the Legend Cup. Once with a Snabit strong
enough to go all the way and once with a weak one, so the losing paths run too. Also Forfeit and Leave cup. Usage: cups.py"""
import asyncio, sys, json, os
from playwright.async_api import async_playwright
from common import launch, settle, Checks
SETUP = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game.py')).read().split('SETUP = """')[1].split('"""')[0]
CUPS = [  # week it falls on, how to find it in cupsOfWeek / cupsThisWeek, grade to be
    ('regular round robin', 4, "c=>!c.official&&c.grade==='E'&&c.format==='robin'", 'E', {}),
    ('regular knockout', 0, "c=>!c.official&&c.grade==='E'&&c.format==='elim'", 'E', {}),
    ('official cup with Rook', 11, "c=>c.official&&c.grade==='D'", 'D', {}),
    ('friendly match', 7, "c=>c.name==='Friendly match'", 'D', {}),
    ('rival match with Rook', 6, "c=>c.rival", 'D', {}),
    ('Summer Qualifier', 15, "c=>c.qualifier&&c.grade==='C'", 'C', {}),
    ('Summer Exhibition', 19, "c=>c.exhibition&&c.grade==='C'", 'C', {}),
    ('Major, best of 3', 5, "c=>c.major", 'S', {'majorInvite': True}),
    ('Legend Cup', 15, "c=>c.legend", 'S', {'master': True}),
]
async def click(pg, sel, wait=200):
    ok = await pg.evaluate("s=>{ const e=document.querySelector(s); if(__vis(e)){ e.click(); return true; } return false; }", sel)
    await pg.wait_for_timeout(wait); return ok
async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        await pg.evaluate(SETUP, 'Chomp'); await pg.evaluate("()=>{ PLAYER.tutorialDone=true; PLAYER.bits=50000; RS.noScenes=true; story().seen.intro=1; story().seen.gradeD=1; drawUI(); }"); await settle(pg, label='start')
        for strong in [True, False]:
            for name, week, find, grade, flags in CUPS:
                if name == 'Summer Exhibition' and not await pg.evaluate("()=>!!RS.exQual"): 
                    C.ok(not strong, f'the Summer Exhibition opens after a Qualifier win'); continue
                await pg.evaluate("""([week,grade,flags,strong])=>{ const yr=Math.floor(PLAYER.week/48)+1; PLAYER.week=yr*48+week; RS.grade=grade; Object.assign(RS,flags); RS.fatigue=0; RS.stress=0; RS.injured=false;
                    RS.level=strong?75:GRADE_INFO[grade].lv[0]; RS.tp=strong?[200,260,200,200,200,200]:[2,2,2,2,2,2]; fixEquip(RS); if(RS.exQual) RS.exQual=RS.exQual.replace(/^\\d+/,String(yr)); drawUI(); openVenue(); venueLobby(); }""", [week, grade, flags, strong])
                await pg.wait_for_timeout(300)
                idx = await pg.evaluate("f=>cupsThisWeek(RS).findIndex(eval(f))", find)
                if not C.ok(idx >= 0, f'{name}: it is on the stadium list in week {week} for grade {grade}'): await pg.evaluate("()=>closeVenue()"); continue
                w0 = await pg.evaluate("()=>[PLAYER.week,PLAYER.bits,RS.wins+RS.losses]")
                await click(pg, f'#v-body [data-c="{idx}"]', 300); await click(pg, '#v-enter', 300); await click(pg, '#v-enter', 400)
                ok = await settle(pg, max_s=600, label=name.replace(' ', '-').replace(',', ''))
                r = await pg.evaluate("()=>({week:PLAYER.week,bits:PLAYER.bits,place:CUP&&CUP.place,done:CUP&&CUP.done,fights:CUP&&CUP.fights,lines:CUP&&CUP.lines.join(' '),grade:RS.grade,played:RS.wins+RS.losses,open:RS.open})")
                C.ok(ok and r['done'] and r['open'] and r['week'] == w0[0] + 1 and r['fights'] >= 1, f'{name} ({"strong" if strong else "weak"}): runs to the ceremony and home, place {r["place"]}, {r["fights"]} fights, grade {r["grade"]}')
                print(f'  {name} ({"strong" if strong else "weak"}): place {r["place"]}, {r["fights"]} fights. {(r["lines"] or "")[:160]}', flush=True)
                bad = [w for w in ['undefined', 'NaN', '[object'] if w in (r['lines'] or '')]; C.ok(not bad, f'{name}: its report reads right ({r["lines"][:120]})')
                if strong and name in ('official cup with Rook',): C.ok(r['grade'] == 'C', f'winning the Official D Cup moves it up to C ({r["grade"]}, place {r["place"]})')
                if not strong and r['place'] is not None and r['place'] > 1:
                    C.ok('finished fifth' not in r['lines'] or r['place'] == 5, f'{name}: place {r["place"]} is not reported as fifth')
                    if name in ('friendly match', 'rival match with Rook'): C.ok(r['bits'] == w0[1], f'{name}: losing a one-match cup pays nothing ({w0[1]} to {r["bits"]})')
                    if name == 'Major, best of 3': C.ok('went out in the' in r['lines'], f'{name}: a knockout loss says which round ({r["lines"][:60]})')
                if strong and name == 'Summer Qualifier': C.ok(await pg.evaluate("()=>!!RS.exQual") == (r['place'] == 1), 'a Qualifier win gives the Exhibition place')
        # Forfeit a match, then Leave the cup
        await pg.evaluate("()=>{ PLAYER.week=48*9+4; RS.grade='E'; RS.fatigue=0; drawUI(); openVenue(); venueLobby(); }"); await pg.wait_for_timeout(300)
        idx = await pg.evaluate("()=>cupsThisWeek(RS).findIndex(c=>!c.official&&c.grade==='E'&&c.format==='robin')")
        await click(pg, f'#v-body [data-c="{idx}"]', 300); await click(pg, '#v-enter', 300); await click(pg, '#v-enter', 400)
        for k in range(60):
            await pg.evaluate("()=>{ const c=document.querySelector('canvas.summon-cv'); if(c){ c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); c.click(); } }"); await pg.wait_for_timeout(150)
            if await pg.evaluate("()=>!!document.getElementById('t-forfeit')&&__vis(document.getElementById('t-forfeit'))"): break
        C.ok(await click(pg, '#t-forfeit', 600), 'a match can be forfeited')
        for k in range(60):
            await pg.evaluate("()=>{ const c=document.querySelector('canvas.summon-cv'); if(c){ c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); c.click(); } }"); await pg.wait_for_timeout(150)
            if await pg.evaluate("()=>!!document.getElementById('t-drop')&&__vis(document.getElementById('t-drop'))"): break
        C.ok(await click(pg, '#t-drop', 600), 'the cup can be left'); ok = await settle(pg, max_s=200, label='drop')
        C.ok(ok and await pg.evaluate("()=>CUP.done&&CUP.place===null&&RS.open"), 'leaving the cup goes home with no placing')
        bt = await pg.evaluate("()=>__audit.bad"); C.ok(not bt, f'no NaN or undefined on the stadium screens ({bt})')
        snd = await pg.evaluate("()=>__snd"); C.ok(not snd, f'no sound threw ({snd[:3]})')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
