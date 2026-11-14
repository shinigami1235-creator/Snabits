"""Short paths the other drivers don't take: the title's Practice battle with a scanned photo, the practice arena with every
family once, and the game opened at laptop size. Usage: smoke.py"""
import asyncio, sys, json
from playwright.async_api import async_playwright
from common import launch, settle, Checks
import images
async def click(pg, sel, wait=200):
    ok = await pg.evaluate("s=>{ const e=document.querySelector(s); if(__vis(e)){ e.click(); return true; } return false; }", sel)
    await pg.wait_for_timeout(wait); return ok
async def fight_out(pg, max_ticks=900):
    for k in range(max_ticks):
        st = await pg.evaluate("()=>{ if(typeof AT==='undefined'||!AT) return 'none'; if(!AT.auto){ const a=document.getElementById('at-auto'); if(a) a.click(); } AT.fast=true; return document.getElementById('at-again')?'done':'run'; }")
        if st == 'done': return True
        await pg.wait_for_timeout(100)
    return False
async def main():
    C = Checks(); imgs = images.save_all('/tmp/snabits-audit-img')
    async with async_playwright() as p:
        # the title's Practice battle, with a scan as your side
        b, pg, errs = await launch(p, hash='')
        C.ok(await click(pg, '#ob-practice', 500), 'the title has Practice battle')
        C.ok(await click(pg, '#at-scan', 600), 'the practice arena offers a scan')
        await pg.set_input_files('#pick', imgs['Eagle']); await pg.wait_for_timeout(500); await pg.click('#scanbtn')
        for k in range(120):
            await pg.evaluate("()=>__pump()"); await pg.wait_for_timeout(100)
            if await pg.evaluate("()=>!!document.getElementById('practicebtn')&&!document.querySelector('canvas.summon-cv')&&!card.classList.contains('held')"): break
        C.ok(await click(pg, '#practicebtn', 600), 'the scan result offers Practice with it')
        C.ok(await pg.evaluate("()=>/at level 30/.test(document.getElementById('at-scan').textContent)"), 'the practice arena shows the scanned Snabit')
        await click(pg, '#at-foe [data-f="Yeti"]'); await click(pg, '#at-go', 600)
        C.ok(await fight_out(pg), 'a practice fight with a scanned special ends'); C.ok(await click(pg, '#at-pick', 400), 'and goes back to the picker')
        # every family once on the practice arena, each against the next one along
        fams = await pg.evaluate("()=>Object.keys(FAM_MOVES)")
        for i, f in enumerate(fams):
            g = fams[(i + 7) % len(fams)]
            await pg.evaluate("([a,b])=>atStart(a,b)", [f, g]); ok = await fight_out(pg)
            r = await pg.evaluate("()=>AT&&AT.ar?[AT.ar.winner,Math.round(AT.ar.t),AT.ar.p.map(p=>p.hp)]:null")
            C.ok(ok and r and all(isinstance(v, (int, float)) for v in r[2]), f'{f} against {g} on the practice arena ends ({r})')
        bt = await pg.evaluate("()=>__audit.bad.concat(__badText()||[])"); C.ok(not bt, f'no NaN or undefined on the arena screens ({bt})')
        snd = await pg.evaluate("()=>__snd"); C.ok(not snd, f'no sound threw ({snd[:3]})')
        C.ok(not errs, f'no console or page errors on the practice arena ({errs[:3]})'); await b.close()
        # laptop size: the ranch and a fight open without errors
        b, pg, errs2 = await launch(p, viewport=(1366, 768))
        SETUP = open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', 'game.py')).read().split('SETUP = """')[1].split('"""')[0]
        await pg.evaluate(SETUP, 'Kitsune'); await pg.evaluate("()=>{ PLAYER.tutorialDone=true; RS.noScenes=true; RS.level=8; drawUI(); }"); await settle(pg, label='laptop')
        await click(pg, '#r-menu [data-m="Train"]'); await click(pg, '#r-panel [data-d="3"]'); C.ok(await settle(pg, label='laptop-drill'), 'a drill runs at laptop size')
        await pg.evaluate("()=>{ window.__res=null; arenaFight({s:RS,foe:gradedOpponent('E',8,Math.random),mode:'auto',title:'Practice',onEnd:r=>{ window.__res=r; }}); }")
        C.ok(await settle(pg, max_s=200, label='laptop-fight') and await pg.evaluate("()=>!!window.__res"), 'a fight runs at laptop size')
        C.ok(not errs2, f'no console or page errors at laptop size ({errs2[:3]})'); await b.close()
    sys.exit(C.done())
asyncio.run(main())
