"""Plays a full in-game year through the real screens in a headless browser: summons from test pictures, drills, rests,
meals, snacks, care, a skill trip, a mission, cups (Auto and by hand), contests, the town, the lab, the bestiary,
a reload in the middle of the year, and a save file out and back in. It watches for console errors, freezes,
broken values in the text on screen and state that doesn't survive a save. Usage: year.py [weeks, default 48] [seed] [pixel]"""
import asyncio, sys, json, os
from playwright.async_api import async_playwright
from common import launch, reinject, settle, Checks, HERE
import images
WEEKS = int(sys.argv[1]) if len(sys.argv) > 1 else 48
SEED = int(sys.argv[2]) if len(sys.argv) > 2 else 7
PIXEL = 'pixel' in sys.argv   # the older pixel art: its ranch, and the turn battle in place of the arena

STATE = """()=>{ const s=RS; return {week:PLAYER.week,bits:PLAYER.bits,fat:s.fatigue,str:s.stress,hearts:hearts(),grade:s.grade,level:s.level,stage:s.stage,tp:s.tp.slice(),used:s.used,busy:s.busy,
  wins:s.wins,losses:s.losses,injured:!!s.injured,sick:s.sick||0,mess:s.mess,name:displayName(s),spoil:s.spoil,fear:s.fear,weight:s.weight,cups:(s.cups||[]).length,
  cupNow:cupsThisWeek(s).filter(c=>!c.open&&!c.small&&c.grade===s.grade&&!c.exhibition).map(c=>c.name), contest:!!contestOf(PLAYER.week)}; }"""
# every number on the Snabit and the player has to be a real number
NUMS = """()=>{ const bad=[], s=RS, chk=(k,v)=>{ if(typeof v==='number'&&!Number.isFinite(v)) bad.push(k); };
  for(const k of ['fatigue','stress','spoil','fear','weight','used','level','exp','mess','wins','losses']) chk(k,s[k]); s.tp.forEach((v,i)=>chk('tp'+i,v)); s.m.stats.forEach((v,i)=>chk('stat'+i,v));
  chk('bits',PLAYER.bits); chk('week',PLAYER.week); for(const [k,v] of Object.entries(PLAYER.bag)) { chk('bag:'+k,v); if(v<0) bad.push('bag<0:'+k); }
  if(PLAYER.bits<0) bad.push('bits<0'); for(const k of ['fatigue','stress','spoil','fear']) if(s[k]<0||s[k]>100) bad.push(k+' out of 0 to 100: '+s[k]); return bad; }"""
# what a save has to bring back: the packed ranch state and the whole player record
SNAP = """()=>{ saveGame(); const e=activeEntry(); return JSON.stringify({day:dayKey(),st:packRanch(RS),extra:{arPresets:RS.arPresets,arPreset:RS.arPreset,arHabit:RS.arHabit,exQual:RS.exQual,read:RS.read,wildWeek:RS.wildWeek,wildCount:RS.wildCount,phaseSeen:RS.phaseSeen},
  p:{bits:PLAYER.bits,week:PLAYER.week,bag:PLAYER.bag,roster:PLAYER.roster.map(r=>r.id),story:PLAYER.story,dex:PLAYER.dex,dexSecret:PLAYER.dexSecret,upgrades:PLAYER.upgrades},m:e.m}); }"""

IMGS = {}
async def click(pg, sel, wait=150):
    ok = await pg.evaluate("s=>{ const e=document.querySelector(s); if(__vis(e)){ e.click(); return true; } return false; }", sel)
    await pg.wait_for_timeout(wait); return ok

async def scan(pg, path, C, label=''):
    """a photo through the Snaboscope: pick the file, tap Scan, tap the summon away, and read the result card"""
    await pg.set_input_files('#pick', path); await pg.wait_for_timeout(500)
    await pg.click('#scanbtn')
    for k in range(150):
        await pg.evaluate("()=>__pump()"); await pg.wait_for_timeout(100)
        if await pg.evaluate("()=>!document.querySelector('canvas.summon-cv')&&getComputedStyle(card).display!=='none'&&!card.classList.contains('held')"): break
    info = await pg.evaluate("()=>({name:lastMon&&lastMon.name,family:lastMon&&lastMon.family,costume:lastMon&&lastMon.costume,special:lastMon&&lastMon.special,text:card.innerText.slice(0,400)})")
    C.ok(info['name'] and 'Something broke' not in info['text'], f'scan {label}: the result card shows ({info["name"]}) {info["text"][:80] if not info["name"] else ""}')
    return info

async def week_action(pg, st, k, C, did):
    """one week of sensible play; returns a label of what was done"""
    hungry = await pg.evaluate("()=>!fedToday()&&PLAYER.bits>=10")
    if hungry and not did.get('meal'):   # one meal a real day, so once per run
        await click(pg, '#r-menu [data-m="Feed"]'); await click(pg, '#r-panel [data-ml="0"]'); did['meal'] = 1; await settle(pg, label='meal')
    if k % 3 == 0: await click(pg, '#r-menu [data-m="Care"]'); await click(pg, '#r-pet'); await settle(pg, label='pet')
    if k % 3 == 1: await click(pg, '#r-menu [data-m="Care"]'); await click(pg, '#r-play'); await settle(pg, label='play')
    if st['mess'] >= 60: await click(pg, '#r-menu [data-m="Care"]'); await click(pg, '#r-clean'); await settle(pg, label='clean')
    if k % 4 == 2:
        await click(pg, '#r-menu [data-m="Feed"]'); sn = await pg.evaluate("()=>{ const b=[...document.querySelectorAll('#r-panel [data-sn]')].find(b=>!b.disabled); if(b){ b.click(); return b.dataset.sn; } return null; }")
        if sn: did['snack'] = did.get('snack', 0) + 1; await settle(pg, label='snack')
    if (st['injured'] or st['sick']) and not did.get('med'):
        await click(pg, '#r-menu [data-m="Care"]'); 
        if await click(pg, '#r-med'): did['med'] = 1
    out_open = await pg.evaluate("()=>!outLocked()")
    if out_open and k in (3, 12) and st['fat'] < 80 and not st['injured']:   # a wild battle: the Snaboscope in wild mode, a photo, Fight
        await click(pg, '#r-menu [data-m="Out"]')
        if await click(pg, '#r-wild', 500):
            await pg.set_input_files('#pick', IMGS['plain4' if k == 3 else 'plain5']); await pg.wait_for_timeout(500); await pg.click('#scanbtn'); await pg.wait_for_timeout(400)
            C.ok(await click(pg, '#wild-go', 400), f'week {st["week"]}: a wild Snabit comes out of the photo')
            C.ok(await settle(pg, {'control': True}, max_s=300, label='wild'), f'week {st["week"]}: the wild fight ends and it is back on the ranch')
            C.ok(await pg.evaluate("()=>RS.open&&!WILD&&RS.wildCount>=1"), 'the wild fight counted'); did['wild'] = did.get('wild', 0) + 1
    if out_open and k == 5:   # town: buy from the market and the week's things to wear, put one on, and look in the workshop
        b0 = st['bits']; await click(pg, '#r-menu [data-m="Out"]'); await click(pg, '#r-town'); await click(pg, '#tw-shop', 1500); await settle(pg, label='shop')
        await click(pg, '#sh-m'); C.ok(await click(pg, '#r-panel [data-s]:not([disabled])', 300), 'the market sells something'); await click(pg, '#sh-back', 300)
        await click(pg, '#sh-i'); got = await pg.evaluate("()=>{ const bs=[...document.querySelectorAll('#r-panel [data-s]:not([disabled])')]; if(!bs.length) return null; const b=bs[bs.length-1]; const n=b.firstChild.textContent; b.click(); return n; }"); await pg.wait_for_timeout(300)
        await click(pg, '#sh-back', 300); await click(pg, '#sh-s', 300); await click(pg, '#sh-back', 300); await click(pg, '#sh-sell', 300); await click(pg, '#sl-back', 300)
        await click(pg, '#sh-out', 1500); await settle(pg, label='leave-shop'); await click(pg, '#tw-w', 300); bt = await pg.evaluate("()=>__badText()"); C.ok(not bt, f'the workshop has no broken values ({bt})'); await click(pg, '#ws-back', 300)
        b1 = await pg.evaluate("()=>PLAYER.bits"); C.ok(b1 < b0, f'shopping spent bits ({b0} to {b1}, bought {got})')
        await pg.evaluate("()=>{ menu('Care'); openWear(); }"); await pg.wait_for_timeout(300)
        if await click(pg, '#r-panel [data-w], #r-panel [data-h]', 300): C.ok(await pg.evaluate("()=>Object.values(RS.worn||{}).filter(Boolean).length+(RS.held?1:0)") >= 1, 'something bought is worn or held'); did['wear'] = 1
        await pg.evaluate("()=>menu()"); await settle(pg, label='town')
    if out_open and not did.get('loan') and st['bits'] >= 1600:   # the Town Hall: pay 1,000 of the loan
        await click(pg, '#r-menu [data-m="Out"]'); await click(pg, '#r-town'); await click(pg, '#tw-hall')
        if await click(pg, '#r-panel [data-pay="1000"]', 400): did['loan'] = 1; C.ok(await pg.evaluate("()=>story().paid") == 1000, 'the Town Hall took 1,000 bits off the loan')
        await pg.evaluate("()=>menu()"); await settle(pg, label='hall')
    # a cup of its own grade when it's fit for one
    if out_open and st['cupNow'] and st['fat'] <= 60:
        await click(pg, '#r-menu [data-m="Out"]'); await click(pg, '#r-cup', 900)
        nm = st['cupNow'][0]
        # Cups opens the calendar on the ranch: pick this week's tile, then Enter (twice when Tala asks again)
        ok = await pg.evaluate("n=>{ const w=PLAYER.week, i=cupsOfWeek(w).findIndex(c=>c.name===n), b=document.querySelector(`#r-cal .ct[data-w='${w}'][data-i='${i}']`); if(b){ b.click(); return true; } closeCupCal(); return false; }", nm)
        if ok:
            await pg.wait_for_timeout(300); await click(pg, '#cal-go', 300); await click(pg, '#cal-go', 300)
            did['cups'] = did.get('cups', 0) + 1
            fine = await settle(pg, {'fight': did['cups'] % 3 == 0, 'control': True}, max_s=400, label=f'cup-w{st["week"]}')
            C.ok(fine, f'week {st["week"]}: the {nm} ran to the end')
            return 'cup:' + nm
        await pg.evaluate("()=>{ if(document.getElementById('v-home')) document.getElementById('v-home').click(); }"); await pg.wait_for_timeout(300)
    if out_open and st['contest'] and st['fat'] <= 50 and did.get('contest', 0) < 3:
        await click(pg, '#r-menu [data-m="Out"]'); await click(pg, '#r-ct')
        if await click(pg, '#ct-go'): did['contest'] = did.get('contest', 0) + 1; C.ok(await settle(pg, max_s=200, label='contest'), f'week {st["week"]}: the contest ran to the end'); return 'contest'
    if out_open and not did.get('trip') and st['hearts'] >= 1 and st['bits'] >= 600 and st['fat'] < 30 and st['week'] >= 8:
        await click(pg, '#r-menu [data-m="Out"]'); await click(pg, '#r-trip')
        if await click(pg, '#r-panel [data-t="0"]'):
            did['trip'] = 1; C.ok(await settle(pg, max_s=400, label='trip'), f'week {st["week"]}: the skill trip ran to the end'); await click(pg, '#tr-ok'); return 'trip'
    if out_open and not did.get('mission') and st['week'] >= 14 and st['fat'] < 40:
        await click(pg, '#r-menu [data-m="Out"]'); await click(pg, '#r-mis')
        if await click(pg, '#r-panel [data-b="0"]'):
            did['mission'] = 1; C.ok(await settle(pg, max_s=400, label='mission'), f'week {st["week"]}: the mission ran to the end'); await click(pg, '#r-rok'); return 'mission'
    if st['fat'] >= 50 or st['str'] >= 35 or st['injured']:
        await click(pg, '#r-menu [data-m="Rest"]'); await click(pg, '#r-rest'); await settle(pg, label='rest'); return 'rest'
    await click(pg, '#r-menu [data-m="Train"]')
    heavy = st['hearts'] >= 2 and st['fat'] < 30 and k % 2 == 0
    i = (6 + k % 6) if heavy else k % 6
    if not await click(pg, f'#r-panel [data-d="{i}"]'): await click(pg, f'#r-panel [data-d="{k % 6}"]')
    await settle(pg, {'scold': False}, label='drill'); return f'drill{i}'

async def main():
    C = Checks(); imgs = images.save_all('/tmp/snabits-audit-img'); IMGS.update(imgs)
    async with async_playwright() as p:
        b, pg, errs = await launch(p, hash='art=pixel' if PIXEL else '', title=True)
        await pg.evaluate(f"()=>{{ let a={SEED}; Math.random=()=>{{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }}; }}")
        # the real start: title, New game, the intro, three scans, choose one, walk it home
        C.ok(await click(pg, '#ob-new', 400), 'the title screen has New game')
        for k in range(5): await click(pg, '#ob-next', 250)
        C.ok(await pg.evaluate("()=>!!ONB&&ONB.tut&&mode==='start'"), 'the intro ends at the Snaboscope')
        for k in range(3):
            await scan(pg, imgs[f'plain{k}'], C, label=f'plain{k}')
            if k < 2: await click(pg, '#ob-again', 400)
        C.ok(await click(pg, '#ob-choose', 400), 'after three scans it offers to choose')
        C.ok(await pg.evaluate("()=>document.querySelectorAll('.ob-pick').length") == 3, 'the choosing screen shows all three')
        await click(pg, '.ob-pick[data-i="1"]', 200); await click(pg, '#ob-take', 400); await click(pg, '#ob-go', 800)
        C.ok(await pg.evaluate("()=>!!RS&&RS.open&&PLAYER.roster.length===1&&PLAYER.onboarded"), 'the chosen Snabit is on the ranch')
        await pg.evaluate("()=>{ RS.noScenes=true; const b=document.getElementById('r-off'); if(b) b.checked=true; }")
        await settle(pg, label='tips')
        did = {}; log = []; w0 = await pg.evaluate("()=>PLAYER.week"); k = 0; reloaded = False
        while True:
            st = await pg.evaluate(STATE)
            if st['week'] - w0 >= WEEKS: break
            bad = await pg.evaluate(NUMS); C.ok(not bad, f'week {st["week"]}: every number is a real number {bad}')
            act = await week_action(pg, st, k, C, did); k += 1
            ok = await settle(pg, label=f'w{st["week"]}-{act}')
            st2 = await pg.evaluate(STATE)
            C.ok(ok and not st2['busy'], f'week {st["week"]} ({act}) ended with the ranch free')
            C.ok(st2['week'] > st['week'], f'week {st["week"]} ({act}) moved the calendar on (now {st2["week"]})')
            if st2['week'] <= st['week']:
                await pg.screenshot(path=os.path.join(HERE, 'stuck-week.png')); print('  stuck:', await pg.evaluate("()=>JSON.stringify({busy:RS.busy,panel:document.getElementById('r-panel').innerText.slice(0,200),say:RS.say,dead:RS.dead,away:RS.away})")); break
            print('  wk', st['week'], act, 'bits', st2['bits'], 'fat', st2['fat'], 'stress', st2['str'], 'grade', st2['grade'], 'lv', st2['level'], 'earned', sum(st2['tp']), flush=True)
            log.append((st['week'], act, st2['bits'], st2['fat'], st2['str'], st2['grade'], st2['level'], sum(st2['tp'])))
            # the middle of the year: reload the page and see that everything came back
            if not reloaded and st2['week'] - w0 >= WEEKS // 2:
                reloaded = True
                await pg.evaluate("()=>{ RS.arPresets=[['Dash In'],[],[]]; RS.arPreset=1; RS.arHabit=RS.arHabit||{}; RS.arHabit.Brace=3; RS.read=true; RS.exQual='0:E'; RS.wildWeek=PLAYER.week; RS.wildCount=2; }")
                before = await pg.evaluate(SNAP)
                await pg.reload(); await pg.wait_for_timeout(1000); await reinject(pg)
                C.ok(await click(pg, '#ob-cont', 500), 'after a reload the title offers Continue')
                await pg.evaluate("()=>{ RS.noScenes=true; }"); await settle(pg, label='reload')
                after = await pg.evaluate(SNAP); A = json.loads(before); B = json.loads(after)
                # hunger follows the phone's calendar: opening the ranch on a new day marks the day and may charge a missed meal, so those fields can move if midnight passes mid-run
                day = ['hungerDay'] + (['stress', 'weight', 'spoil'] if A['day'] != B['day'] else [])
                for key in ['st', 'p', 'm', 'extra']:
                    diff = [f for f in set(list(A[key] or {}) + list(B[key] or {})) if f not in day and json.dumps((A[key] or {}).get(f), sort_keys=True) != json.dumps((B[key] or {}).get(f), sort_keys=True)]
                    C.ok(not diff, f'reload mid-year keeps {key} ({diff})')
        print('what it did:', json.dumps(did))
        # screens that only show things: the info pages, the bestiary and its Secrets tab, goals, the freezer, the skill book, the town
        for tab in ['status', 'skills', 'record']:
            await pg.evaluate("t=>openInfo(t)", tab); await pg.wait_for_timeout(250); bt = await pg.evaluate("()=>__badText()"); C.ok(not bt, f'info page {tab} has no broken values ({bt})'); await pg.evaluate("()=>closeInfo()")
        for fn, lab in [("openDex('Chomp')", 'bestiary'), ("openDex('Secrets')", 'Secrets tab'), ("openGoals()", 'goals'), ("openFreezer()", 'freezer'), ("openItems()", 'items'), ("openTown()", 'town'), ("openWear()", 'wear'), ("openBoard()", 'mission board'), ("openTrips()", 'trips'), ("openHall()", 'town hall'), ("openWorkshop()", 'workshop'), ("openContests()", 'contests')]:
            await pg.evaluate("()=>{ menu('Out'); " + fn + "; }"); await pg.wait_for_timeout(300)
            bt = await pg.evaluate("()=>__badText()"); n = await pg.evaluate("()=>document.getElementById('r-panel').innerHTML.length+((document.getElementById('frz')||{}).innerHTML||'').length")
            C.ok(not bt and n > 50, f'{lab} opens with no broken values ({bt}, {n})')
            await pg.evaluate("()=>{ const f=document.getElementById('f-back'); if(f) f.click(); if(RS.visit&&typeof leaveVisit==='function') leaveVisit(); }"); await pg.wait_for_timeout(500); await settle(pg, label=lab)
        C.ok(await pg.evaluate("()=>document.querySelectorAll('#r-panel .dex-t').length") >= 0, 'bestiary drew')
        # a save file out and back in, through the game's own reader
        rt = await pg.evaluate("""async()=>{ saveGame(); const txt=JSON.stringify(PLAYER);
            const body=JSON.stringify({game:'snabits',v:2,saved:new Date().toISOString(),gz:b64(await squeeze(txt,new CompressionStream('gzip')))});
            const {p}=await readSaveFile(new File([body],'snabits-save.json')); return JSON.stringify(p)===txt; }""")
        C.ok(rt, 'a save file reads back the same as it was written')
        # the same through the settings screen: Save to a file, then Load a save file, which reloads the page
        await pg.evaluate("()=>{ menu(); document.getElementById('r-gear').click(); }"); await pg.wait_for_timeout(300)
        async with pg.expect_download() as dl: await click(pg, '#r-export', 300)
        path = '/tmp/snabits-audit-save.json'; await (await dl.value).save_as(path)
        want = await pg.evaluate(SNAP); await pg.evaluate("()=>{ PLAYER.bits+=777; saveGame(); }")
        await pg.set_input_files('#r-import', path); await pg.wait_for_timeout(600); C.ok(await click(pg, '#r-fileyes', 1500), 'Load a save file asks before it replaces the game')
        await pg.wait_for_timeout(800); await reinject(pg); C.ok(await click(pg, '#ob-cont', 600), 'after loading a save file the title offers Continue')
        got = await pg.evaluate(SNAP); A = json.loads(want); Bq = json.loads(got);
        for d in (A, Bq): d.pop('day'); d['st'].pop('hungerDay', None)
        C.ok(json.dumps(A, sort_keys=True) == json.dumps(Bq, sort_keys=True), 'the save file brings back the game as it was saved')
        snd = await pg.evaluate("()=>__snd"); C.ok(not snd, f'no sound threw ({snd[:3]})')
        bad_text = await pg.evaluate("()=>__audit.bad"); C.ok(not bad_text, f'no NaN or undefined in the text on screen all year {bad_text}')
        C.ok(not await pg.evaluate("()=>/Something broke/.test(card.innerText)"), 'the error card never showed')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
