"""Camera hunts: today's colour, the notice board's scan requests and the colour atlas, through real scans of drawn pictures.
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
  putStill(grab(cv, W, H)); aim = { x: .5, y: .5 }; const m = render(true); return { text: card.innerText, stats: m ? m.stats : null, today: m ? !!m.today : null }; }"""

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
        # the board: two requests to start, then one more a week up to three, never two from the same person
        r = await pg.evaluate("""()=>{ PLAYER.hunts=null; huntRefresh(); const a=huntState().open.length; PLAYER.week++; huntRefresh(); const b=huntState().open.length; PLAYER.week++; huntRefresh(); PLAYER.week++; huntRefresh();
          const H=huntState(); return {a,b,c:H.open.length,who:H.open.map(q=>q.who),lines:H.open.map(huntFill)}; }""")
        print(json.dumps(r, indent=1))
        C.ok(r['a'] == 2 and r['b'] == 3 and r['c'] == 3, f"the board starts with 2 requests and fills to 3 ({r['a']}, {r['b']}, {r['c']})")
        C.ok(len(set(r['who'])) == len(r['who']), 'one request per person at a time')
        C.ok(all('{' not in l and 'undefined' not in l for l in r['lines']), 'the request lines read cleanly')
        # a pair request done by a matching scan
        await pg.evaluate("()=>{ const H=huntState(); H.open=[{id:99,kind:'pair',who:'shop',line:HUNT_ASK.pair[0][1],a:'pink',b:'green',bits:300,item:'Berry',week:PLAYER.week}]; H.nextWeek=PLAYER.week+99; }")
        fpg = await dual(pg, 'pink', 'green'); print('pink with green at', fpg)
        before = await pg.evaluate("()=>({bits:PLAYER.bits, berry:PLAYER.bag['Berry']||0})")
        c = await pg.evaluate(CARD, ['pink', 'green', fpg])
        after = await pg.evaluate("()=>({bits:PLAYER.bits, berry:PLAYER.bag['Berry']||0, open:huntState().open.length})")
        C.ok(after['open'] == 0 and after['berry'] == before['berry'] + 1 and after['bits'] >= before['bits'] + 300, f"a pink-with-green scan finishes Nora's request and pays ({before} -> {after})")
        C.ok("Nora's request is done" in c['text'], "the scan's card says the request is done")
        C.ok('colour atlas' in c['text'], 'the first pink-with-green scan goes in the atlas')
        # a mono request and a family request
        await pg.evaluate("()=>{ const H=huntState(); H.open=[{id:98,kind:'mono',who:'guide',line:HUNT_ASK.mono[0][1],a:'blue',bits:200,item:'Fish'}]; }")
        await pg.evaluate(CARD, ['blue', None, 0])
        C.ok(await pg.evaluate("()=>huntState().open.length") == 0, 'an all-blue scan finishes an all-blue request')
        fam = await pg.evaluate("()=>{ const W=390,H=844,cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); c.fillStyle=COL.yellow; c.fillRect(0,0,W,H); putStill(grab(cv,W,H)); aim={x:.5,y:.5}; const res=scan(still,still.width,still.height); return pickFamily(res.cells,res).family; }")
        await pg.evaluate("f=>{ const H=huntState(); H.open=[{id:97,kind:'fam',who:'doc',line:HUNT_ASK.fam[0][1],f,bits:400,item:'Stat seed'}]; }", fam)
        await pg.evaluate(CARD, ['red', None, 0])
        left = await pg.evaluate("()=>huntState().open.length")
        await pg.evaluate(CARD, ['yellow', None, 0])
        C.ok(left == 1 and await pg.evaluate("()=>huntState().open.length") == 0, f'a family request ({fam}) waits through a scan that makes another family, then a scan that makes it finishes it')
        # the atlas: 12 squares pay out, and the crops stay in their own storage key
        a = await pg.evaluate("""async ()=>{ const H=huntState(), b0=PLAYER.bits; const G=HUNT_G.filter(g=>!H.atlas[g+'|'+g]);
          return {n:Object.keys(H.atlas).length, paid:H.paid}; }""")
        for g in ['red', 'orange', 'yellow', 'green', 'cyan', 'violet', 'brown', 'white', 'silver', 'black', 'pink']:
            await pg.evaluate(CARD, [g, None, 0])
        for g, h in [['brown', 'green'], ['white', 'red']]:
            await pg.evaluate(CARD, [g, h, await dual(pg, g, h)])
        a2 = await pg.evaluate("()=>{ const H=huntState(), T=atlasThumbs(); return {n:Object.keys(H.atlas).length, paid:H.paid, thumbs:Object.keys(T).length, inSave:JSON.stringify(PLAYER).includes('data:image')}; }")
        print('atlas', a, a2)
        C.ok(a2['n'] >= 12 and a2['paid'] == 1, f"12 squares in the atlas pay out once ({a2})")
        C.ok(a2['thumbs'] >= 12 and not a2['inSave'], 'each square keeps its photo crop outside the save')
        # today's colour: a hatch from it is 3 stronger in every stat
        tg = await pg.evaluate("()=>todayColour()")
        x = await pg.evaluate(CARD, [tg, None, 0]); y = await pg.evaluate("()=>{ const m=hatch(scan(still,still.width,still.height)); return scanBoost(m).stats; }")
        C.ok(x['today'] and [u - v for u, v in zip(x['stats'], y)] == [3] * 6, f"a hatch from today's colour ({tg}) gets 3 more in every stat")
        C.ok("Today's colour" in x['text'], "the card says it's today's colour")
        # the screens
        await pg.evaluate("()=>{ openRanch(); openTown(); }"); await pg.wait_for_timeout(300)
        C.ok(await pg.evaluate("()=>!!document.getElementById('tw-nb')"), 'the town has a notice board')
        await pg.evaluate("()=>openBoard()"); await pg.wait_for_timeout(300)
        nb = await pg.evaluate("()=>document.getElementById('r-panel').innerText")
        C.ok("Today's colour is" in nb, 'the notice board shows today\'s colour')
        await pg.evaluate("()=>openDex('Atlas')"); await pg.wait_for_timeout(300)
        n = await pg.evaluate("()=>document.querySelectorAll('#r-panel .atl-c').length")
        C.ok(n == 169, f'the Bestiary has an Atlas tab with a 12 by 12 grid and its colour headings ({n} squares)')
        await pg.screenshot(path='/tmp/atlas.png')
        await pg.evaluate("()=>openBoard()"); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/board.png')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
