"""Pattern Stones: every stone drawn by the game's own stoneGlyph, filling the phone screen, must scan to its own special
through scan and eggOf, and the same stone held at arm's length (smaller, on a grey table) is reported.
Then the costume and clutter pictures from images.py must still find what they found before.
Run the server first (tools/tests/serve.sh). Usage: stones.py"""
import asyncio, sys, io, base64, json
from playwright.async_api import async_playwright
from common import launch, Checks
import images

def b64(im): b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

# draws one stone on a phone-sized canvas and scans it the way a photo is scanned
STONE = """([sp, mode]) => { const W = 390, H = 844, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  if (mode === 'full') { c.save(); c.scale(W / 20, H / 26); c.translate(10, 13); stoneGlyph(c, sp); c.restore(); }
  else { c.fillStyle = '#8f8a80'; c.fillRect(0, 0, W, H); const k = mode === 'near' ? 15 : 10; c.save(); c.translate(W / 2, H / 2); c.scale(k, k); stoneGlyph(c, sp); c.restore(); }
  putStill(grab(cv, W, H)); aim = { x: .5, y: .5 }; const res = scan(still, still.width, still.height), e = eggOf(res);
  return { got: e ? (e.special || e.costume) : null, main: res.main.g, raw: Object.fromEntries(Object.entries(res.raw).filter(([k, v]) => v >= 1).map(([k, v]) => [k, Math.round(v)])) }; }"""
PIC = """async urls => { const out = [];
  for (const u of urls) { const im = new Image(); await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = u; });
    putStill(grab(im, im.width, im.height)); aim = { x: .5, y: .5 }; const res = scan(still, still.width, still.height), e = eggOf(res);
    out.push(e ? (e.special || e.costume) : null); }
  return out; }"""

async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        specials = await pg.evaluate("()=>EGG_SPECIAL.slice()")
        for sp in specials:
            r = await pg.evaluate(STONE, [sp, 'full'])
            C.ok(r['got'] == sp, f'the {sp} stone on the full screen scans to {sp} (got {r["got"]}, main {r["main"]}, {json.dumps(r["raw"])})')
        near = {}
        for sp in specials:
            r = await pg.evaluate(STONE, [sp, 'near']); near[sp] = r['got']
        print('each stone held close on a grey table:', json.dumps(near))
        names = list(images.EGGS); got = await pg.evaluate(PIC, [b64(images.EGGS[k]()) for k in names])
        for k, g in zip(names, got): C.ok(g == k, f'the {k} picture still finds {k} (got {g})')
        hits = {}; n = 0
        for s in range(0, 300, 50):
            for g in await pg.evaluate(PIC, [b64(images.clutter(1000 + k)) for k in range(s, s + 50)]):
                n += 1
                if g: hits[g] = hits.get(g, 0) + 1
        rate = sum(hits.values()) / n
        C.ok(rate < 0.05, f'eggs fire on under 5% of cluttered pictures ({100 * rate:.1f}%, {json.dumps(hits)})')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
