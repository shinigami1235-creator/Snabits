"""Colour eggs: each drawn flag or pattern must find its special or costume through the game's own scan and eggOf,
and cluttered photo-like pictures must set an egg off less than 5% of the time. Usage: eggs.py [how many clutter pictures]"""
import asyncio, sys, io, base64, json
from playwright.async_api import async_playwright
from common import launch, Checks
import images
N = int(sys.argv[1]) if len(sys.argv) > 1 else 400
def b64(im): b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
JS = """async urls => { const out = [];
  for (const u of urls) { const im = new Image(); await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = u; });
    putStill(grab(im, im.width, im.height)); aim = { x: .5, y: .5 }; const res = scan(still, still.width, still.height), e = eggOf(res);
    out.push(e ? (e.special || e.costume) : null); }
  return out; }"""
async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        names = list(images.EGGS); got = await pg.evaluate(JS, [b64(images.EGGS[k]()) for k in names])
        for k, g in zip(names, got): C.ok(g == k, f'the {k} picture finds {k} (got {g})')
        # the same patterns turned on their side still count where the hint doesn't name a direction
        for k in ['Eagle', 'Bee', 'Candy cane', 'Panda']:
            g = (await pg.evaluate(JS, [b64(images.EGGS[k]().rotate(90, expand=True).resize((390, 844)))]))[0]
            C.ok(g == k, f'the {k} picture on its side finds {k} (got {g})')
        hits = {}; n = 0
        for s in range(0, N, 50):
            got = await pg.evaluate(JS, [b64(images.clutter(1000 + k)) for k in range(s, min(N, s + 50))])
            for g in got:
                n += 1
                if g: hits[g] = hits.get(g, 0) + 1
        rate = sum(hits.values()) / n
        print(f'clutter: {sum(hits.values())} of {n} set an egg off ({100 * rate:.1f}%)', json.dumps(hits))
        C.ok(rate < 0.05, f'eggs fire on under 5% of cluttered pictures (got {100 * rate:.1f}%)')
        # one bright object held up to the camera: a match here is often the egg doing its job (a red ball on a white table is a red sun on snow), so this is counted, not judged
        close = {}; m = 0
        for s in range(0, N // 2, 50):
            for g in await pg.evaluate(JS, [b64(images.closeup(5000 + k)) for k in range(s, min(N // 2, s + 50))]):
                m += 1
                if g: close[g] = close.get(g, 0) + 1
        print(f'one object close up: {sum(close.values())} of {m} set an egg off ({100 * sum(close.values()) / m:.1f}%)', json.dumps(close))
        plain = await pg.evaluate(JS, [b64(images.plain(k)) for k in range(40)])
        print('plain two-tone pictures with an object:', sum(1 for g in plain if g), 'of 40', [g for g in plain if g])
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
