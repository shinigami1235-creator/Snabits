"""Camera hunts: today's colour, the notice board's hunts with their clues, and the colour atlas, through real scans of drawn pictures.
Run the server first (tools/tests/serve.sh). Usage: hunts.py"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
from common import launch, settle, Checks
SETUP = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game.py')).read().split('SETUP = """')[1].split('"""')[0]

# draws a picture of colour a (most of it) with a band of colour b and scans it the way the shutter does
SCAN = """([a, b, frac]) => { const W = 390, H = 844, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = COL[a]; c.fillRect(0, 0, W, H); if (b) { c.fillStyle = COL[b]; c.fillRect(0, H * (1 - frac), W, H * frac); }
  putStill(grab(cv, W, H)); aim = { x: .5, y: .5 }; const res = scan(still, still.width, still.height);
  return { main: res.main.g, second: res.second ? res.second.g : null, mono: res.mono, colours: res.colours }; }"""
# the same, then the real card the shutter shows
CARD = """([a, b, frac]) => { const W = 390, H = 844, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = COL[a]; c.fillRect(0, 0, W, H); if (b) { c.fillStyle = COL[b]; c.fillRect(0, H * (1 - frac), W, H * frac); }
  putStill(grab(cv, W, H)); aim = { x: .5, y: .5 }; const m = render(true); const o = typeof WILD !== 'undefined' && WILD ? WILD.foe : null;
  return { text: card.innerText, stats: m ? m.stats : null, today: m ? !!m.today : null, hunt: o ? o.hunt || null : null, fam: o ? o.m.family : null, el: o ? o.m.el1 : null, close: WILD ? WILD.close : null }; }"""

async def dual(pg, a, b):
    """the share of colour b that makes a scan read as mostly a with some b, since rarer colours weigh more in a scan"""
    for f in [x / 20 for x in range(1, 20)]:
        r = await pg.evaluate(SCAN, [a, b, f])
        if r['main'] == a and r['second'] == b: return f
    return None

async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        await pg.evaluate(SETUP, 'Chomp'); await pg.evaluate("()=>{ PLAYER.tutorialDone = true; RS.noScenes = true; }"); await settle(pg, label='start')
        # today's colour: all 12 once in each block of 12 days
        t = await pg.evaluate("""()=>{ const B={}; for(let k=0;k<60;k++){ const d=new Date(2026,10,17+k), day=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5); (B[Math.floor(day/12)]=B[Math.floor(day/12)]||[]).push(todayColour(d)); }
          return Object.values(B).filter(L=>L.length===12); }""")
        C.ok(len(t) >= 3 and all(len(set(L)) == 12 for L in t), f'each 12-day block deals all 12 colours once ({t[0]})')
        # the board: two hunts to start, then one more a week up to three, never two from the same person
        r = await pg.evaluate("""()=>{ PLAYER.hunts=null; huntRefresh(); const a=huntState().open.length; PLAYER.week++; huntRefresh(); const b=huntState().open.length; PLAYER.week++; huntRefresh(); PLAYER.week++; huntRefresh();
          const H=huntState(); return {a,b,c:H.open.length,who:H.open.map(q=>q.who),lines:H.open.map(q=>q.clues[0][1]),fams:H.open.map(q=>q.fam)}; }""")
        print(json.dumps(r, indent=1))
        C.ok(r['a'] == 2 and r['b'] == 3 and r['c'] == 3, f"the board starts with 2 hunts and fills to 3 ({r['a']}, {r['b']}, {r['c']})")
        C.ok(len(set(r['who'])) == len(r['who']), 'one hunt per person at a time')
        C.ok(all('{' not in l and 'undefined' not in l for l in r['lines']) and all(r['fams']), 'each hunt has a family and a first clue that reads cleanly')
        # an old save's colour requests become hunts, and the rest come down
        o = await pg.evaluate("""()=>{ const H=huntState(); H.open=[{id:90,kind:'pair',who:'shop',a:'red',b:'white'},{id:91,kind:'fam',who:'doc',f:'Chomp'},{id:92,kind:'many',who:'mc'}]; const L=huntState().open; return L.map(q=>[q.id,q.fam,q.clues&&q.clues.length]); }""")
        C.ok(len(o) == 1 and o[0][0] == 90 and o[0][1] and o[0][2] == 1, f"an old save keeps its colour request as a hunt ({o})")
        # a hatch scan has nothing to do with hunts: no stat boost, no atlas square
        tg = await pg.evaluate("()=>todayColour()")
        await pg.evaluate("()=>{ huntState().atlas={}; }")
        x = await pg.evaluate(CARD, [tg, None, 0]); y = await pg.evaluate("()=>{ const m=hatch(scan(still,still.width,still.height)); return scanBoost(m).stats; }")
        C.ok(x['stats'] == y and not x['today'], f"a hatch from today's colour ({tg}) is no stronger")
        C.ok(await pg.evaluate("()=>Object.keys(huntState().atlas).length") == 0, 'a hatch scan leaves the atlas alone')
        # a pink-with-green hunt: first a cold miss, then a hot one, then the right colours
        fpg = await dual(pg, 'pink', 'green'); print('pink with green at', fpg)
        await pg.evaluate("""()=>{ const H=huntState(); H.open=[huntDress({id:99,kind:'pair',who:'shop',a:'pink',b:'green',bits:300,item:'Berry',week:PLAYER.week}, rng(5))]; H.active=99; H.nextWeek=PLAYER.week+99;
          WILD={s:RS,seen:0,hunt:99}; window.__said=[]; }""")
        fam = await pg.evaluate("()=>huntActive().fam")
        c1 = await pg.evaluate(CARD, ['blue', None, 0])
        C.ok(c1['hunt'] is None and c1['close'] == 'cold', f"an all-blue scan brings out some other wild Snabit ({c1['close']})")
        a1 = await pg.evaluate("()=>{ const o=WILD.foe, r=huntAfter(o,true); return {r, q:huntActive()}; }")
        print(json.dumps(a1['r']))
        C.ok(a1['q']['misses'] == 1 and a1['r']['after'][0] == 'shop' and 'nothing like it' in a1['r']['after'][1] and 'green' in a1['r']['after'][1],
             'after that fight Nora says it was nothing like it and remembers the green')
        c2 = await pg.evaluate("()=>{ let n=0, hot=0; for (let k=0;k<1;k++) {} return 0; }")
        # the hot scan: all pink. With one miss it brings the hunted Snabit out half the time, so the test rolls until it doesn't
        for k in range(20):
            c2 = await pg.evaluate(CARD, ['pink', None, 0])
            if c2['hunt'] is None: break
        C.ok(c2['close'] == 'hot', f"an all-pink scan is close ({c2['close']})")
        a2 = await pg.evaluate("()=>{ const r=huntAfter(WILD.foe,true); return {r, q:huntActive()}; }")
        print(json.dumps(a2['r']))
        C.ok(a2['q']['misses'] == 2 and a2['r']['after'][0] == 'doc' and 'apple' not in a2['r']['after'][1] and 'pink eraser' in a2['r']['after'][1] and 'a leaf' in a2['r']['after'][1],
             'after the second miss Dr. Ines gives the clearest clue, with everyday things in both colours')
        C.ok(len(a2['q']['clues']) == 3, 'the hunt keeps all three clues for the board')
        odds = await pg.evaluate("()=>[0,1,2,3,5].map(m=>['fit','hot','warm','cold'].map(c=>huntOdds(c,m)))")
        C.ok(all(o[0] == 1 and o[3] == 0 for o in odds) and all(odds[i][1] <= odds[i + 1][1] and odds[i][2] <= odds[i + 1][2] for i in range(4)) and odds[0][2] == 0,
             f'a close scan brings it out more often after each miss, a cold one never ({odds})')
        # the right colours always bring it out, with its own family and colour
        c3 = await pg.evaluate(CARD, ['pink', 'green', fpg])
        C.ok(c3['hunt'] == 99 and c3['fam'] == fam and c3['el'] == await pg.evaluate("()=>EL.pink"), f"a pink-with-green scan brings out the {fam} Nora saw ({c3['fam']}, {c3['el']})")
        C.ok("That's the one Nora saw" in c3['text'], 'its card says so')
        # the real fight, with a strong Snabit
        bb = await pg.evaluate("()=>({bits:PLAYER.bits, berry:PLAYER.bag['Berry']||0})")
        await pg.evaluate("()=>{ RS.level=60; RS.tp=[500,500,500,500,500,500]; RS.m.stats=RS.m.stats.map(v=>v*4); RS.fatigue=0; RS.wildCount=0; window.__said=[]; const s0=say; say=(t,who)=>{ if(t) __said.push((who||'tala')+': '+t); s0(t,who); }; document.getElementById('wild-go').click(); }")
        await settle(pg, {'control': True}, max_s=90, label='fight')
        f = await pg.evaluate("()=>({said:__said, open:huntState().open.length, bits:PLAYER.bits, berry:PLAYER.bag['Berry']||0, active:huntState().active, done:huntState().done})")
        print(json.dumps(f, indent=1))
        C.ok(f['open'] == 0 and f['berry'] == bb['berry'] + 1 and f['bits'] >= bb['bits'] + 300 and f['active'] is None and f['done'] >= 1, 'beating it finishes the hunt and pays')
        C.ok(any('Nora was after' in t for t in f['said']), 'the result says it was the one Nora was after')
        # the atlas fills from wild scans: 12 squares pay out, and the crops stay in their own storage key
        await pg.evaluate("()=>{ WILD={s:RS,seen:0,hunt:null}; huntState().active=null; }")
        for g in ['red', 'orange', 'yellow', 'green', 'cyan', 'violet', 'brown', 'white', 'silver', 'black', 'pink', 'blue']:
            await pg.evaluate(CARD, [g, None, 0])
        a3 = await pg.evaluate("()=>{ const H=huntState(), T=atlasThumbs(); return {n:Object.keys(H.atlas).length, paid:H.paid, thumbs:Object.keys(T).length, inSave:JSON.stringify(PLAYER).includes('data:image')}; }")
        print('atlas', a3)
        C.ok(a3['n'] >= 12 and a3['paid'] >= 1, f"12 squares in the atlas pay out ({a3})")
        C.ok(a3['thumbs'] >= 12 and not a3['inSave'], 'each square keeps its photo crop outside the save')
        x = await pg.evaluate(CARD, [tg, None, 0])
        C.ok("Today's colour" in x['text'], "a wild card says when it's today's colour")
        await pg.evaluate("()=>endWild()")
        # the screens
        await pg.evaluate("()=>{ PLAYER.week+=3; huntState().nextWeek=0; huntRefresh(); const q=huntState().open[0]; q.misses=2; q.clues.push(['shop', huntFill(HUNT_MORE[q.kind], q)], ['doc', huntFill(HUNT_BEST.doc+' '+HUNT_BEST[q.kind], q)]); openRanch(); openTown(); }"); await pg.wait_for_timeout(300)
        C.ok(await pg.evaluate("()=>!!document.getElementById('tw-nb')"), 'the town has a notice board')
        await pg.evaluate("()=>document.getElementById('tw-nb').click()"); await pg.wait_for_timeout(300)
        nb = await pg.evaluate("()=>document.getElementById('r-panel').innerText")
        C.ok("Today's colour is" in nb and 'Hunt it' in nb, 'the notice board shows today\'s colour and a Hunt button per Snabit')
        await pg.screenshot(path='/tmp/board.png')
        await pg.evaluate("()=>{ openRanch(); openBoard(); }"); await pg.wait_for_timeout(300)
        C.ok('Missions' in await pg.evaluate("()=>document.getElementById('r-panel').innerText"), 'the ranch Missions button still opens the missions')
        await pg.evaluate("()=>{ openRanch(); openTown(); document.getElementById('tw-nb').click(); }"); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>document.querySelector('.nb-go').click()"); await pg.wait_for_timeout(500)
        sc = await pg.evaluate("()=>({wild:!!WILD, hunt:WILD&&WILD.hunt, main:document.getElementById('main').textContent, msg:document.getElementById('msgtext').textContent})")
        print(sc)
        C.ok(sc['wild'] and sc['hunt'] and sc['main'].startswith('Hunt:') and 'notes' in sc['msg'], 'Hunt it opens the Snaboscope with the latest clue')
        await pg.screenshot(path='/tmp/huntscope.png')
        await pg.evaluate("()=>{ endWild(); openDex('Atlas'); }"); await pg.wait_for_timeout(300)
        n = await pg.evaluate("()=>document.querySelectorAll('#r-panel .atl-c').length")
        C.ok(n == 169, f'the Bestiary has an Atlas tab with a 12 by 12 grid and its colour headings ({n} squares)')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
