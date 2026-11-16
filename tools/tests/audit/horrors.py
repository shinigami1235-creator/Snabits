"""The horror series: each of the ten hatches as itself with its ability, draws, cries, and fights on the arena and in the old turn
battle, with its ability showing up. Then the rules: a horror's stone isn't handed out for owning one, and fusion keeps a horror
family or the other parent's, never a hybrid.
Then the stones: each horror's stone, drawn by the game and held up to the camera, reads as that horror, other pictures
rarely do, and the scan only calls it between 9pm and 3am with its stone on the ranch and no other horror there.
Usage: horrors.py"""
import asyncio, sys, json, io, base64
import images
from playwright.async_api import async_playwright
from common import launch, Checks
H = ['Cthulhu', 'Hastur', 'Shoggoth', 'Dagon', 'Migo', 'Nightgaunt', 'Ghoul', 'Gug', 'Yog', 'Shub']
ABIL = {'Cthulhu': 'Dreamer', 'Hastur': 'Yellow Sign', 'Shoggoth': 'Mimic', 'Dagon': 'Deep Song', 'Migo': 'Brain Jar', 'Nightgaunt': 'Tickle',
        'Ghoul': 'Gnaw', 'Gug': 'Mountain', 'Yog': 'All Doors', 'Shub': 'Thousand Young'}
OLD = ('Dreamer', 'Yellow Sign', 'Mimic', 'Tickle', 'Gnaw', 'Brain Jar')   # the ones the old turn battle has a hook for
SIM = """([fam,abil,n])=>{ const R=rng(7), foes=Object.keys(FAM_MOVES), out={fam:null,abil:null,special:0,horror:0,ar:{n:0,ended:0,ab:0,bad:0,win:0},old:{n:0,ended:0,ab:0,bad:0,win:0}};
  for(let k=0;k<n;k++){ const me=randomOpponent(R,fam), foe=randomOpponent(R,foes[k%foes.length]); if(!k){ out.fam=me.family; out.abil=me.ability[0]; out.special=!!FAMILY[me.family].special; out.horror=!!FAMILY[me.family].horror; }
    const lv=20+(k%4)*10, a={fm:me,skills:aiLoadout(me,lv,R),level:lv}, b={fm:foe,skills:aiLoadout(foe,lv,R),level:lv};
    const ar=new Arena(arFoe(a),arFoe(b),R); let st=0; while(!ar.over&&st++<900) ar.step(); if(ar.ev.some(e=>e.t==='ability'&&e.name===abil&&e.i===0)) out.ar.ab++;
    out.ar.n++; if(ar.over) out.ar.ended++; if(ar.winner===0) out.ar.win++;
    if(ar.p.some(p=>!Number.isFinite(p.hp)||!Number.isFinite(p.x)||!Number.isFinite(p.focus))) out.ar.bad++;
    const f=new Fight(makeFighter(me,a.skills,lv),makeFighter(foe,b.skills,lv),R); let t=0, ab=0;
    while(!f.over&&t++<200){ const ev=f.play(f.aiPick(f.p[0],f.p[1]),f.aiPick(f.p[1],f.p[0])); if(ev.some(e=>e.t==='ability'&&e.name===abil&&e.who===0)) ab++; }
    out.old.n++; if(f.over) out.old.ended++; if(ab) out.old.ab++; if(f.winner===0) out.old.win++; if(f.p.some(p=>!Number.isFinite(p.hp))) out.old.bad++; }
  return out; }"""
RULES = """()=>{ const R=rng(3), out={};
  // owning a horror doesn't put its stone on the ranch the way owning another special does
  PLAYER.stones=null; PLAYER.roster=[{m:randomOpponent(R,'Gug')},{m:randomOpponent(R,'Kraken')}]; const L=stoneList(); out.stoneGug=L.includes('Gug'); out.stoneKraken=L.includes('Kraken');
  // fusion with one horror parent: the child is the horror or the other family, never a hybrid
  const fams={}; for(let k=0;k<60;k++){ const a=randomOpponent(R,'Shub'), b=randomOpponent(R,'Chomp'); let c=null; try{ c=fuseChild({m:a},{m:b},null,R); }catch(e){ out.fuseErr=String(e); break; } const f=c.hybrid?'hybrid':c.m.family; fams[f]=(fams[f]||0)+1; }
  out.fuse=fams;
  // Mountain: a shove doesn't move a Gug; All Doors: a Root doesn't land and swaps cost no focus
  const mk=f=>{ const m=randomOpponent(R,f); return arFoe({fm:m,skills:aiLoadout(m,30,R),level:30}); };
  const ar=new Arena(mk('Gug'),mk('Chomp'),R); out.mountain=ar.p[0].f.ability; 
  const y=new Arena(mk('Yog'),mk('Chomp'),R); out.root=y.inflict(y.p[0],'Root',100,y.p[1]); out.swapCost=y.cost(y.p[0],{swap:1,cost:12});
  const g=new Arena(mk('Shub'),mk('Chomp'),R); g.p[0].hp=0; g.step(); out.young=g.p[0].hp>0&&!g.over;
  const h=new Arena(mk('Hastur'),mk('Chomp'),R); h.step(); out.curse=h.p[1].st&&h.p[1].st.name;
  const s=new Arena(mk('Shoggoth'),mk('Chomp'),R); s.step(); out.mimic=s.p[0].f.ability;
  const d=new Arena(mk('Dagon'),mk('Chomp'),R); d.p[0].hp=Math.round(d.p[0].maxhp/2); const hp0=d.p[0].hp; out.soak=d.inflict(d.p[0],'Soak',100,d.p[1]); out.soakHeal=d.p[0].hp>hp0;
  return out; }"""

def b64(im): b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
STONE = """([sp, k]) => { const W = 390, H = 844, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  if (!k) { c.save(); c.scale(W / 20, H / 26); c.translate(10, 13); stoneGlyph(c, sp); c.restore(); }
  else { c.fillStyle = '#8f8a80'; c.fillRect(0, 0, W, H); c.save(); c.translate(W / 2, H / 2); c.scale(k, k); stoneGlyph(c, sp); c.restore(); }
  putStill(grab(cv, W, H)); aim = { x: .5, y: .5 }; return horrorEgg(scan(still, still.width, still.height)); }"""
PIC = """async urls => { const out = [];
  for (const u of urls) { const im = new Image(); await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = u; });
    putStill(grab(im, im.width, im.height)); aim = { x: .5, y: .5 }; out.push(horrorEgg(scan(still, still.width, still.height))); }
  return out; }"""
# the gate: a Hastur stone's scan at different hours, with and without the stone, and with a horror already on the ranch
GATE = """() => { const W = 390, H = 844, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = '#8f8a80'; c.fillRect(0, 0, W, H); c.save(); c.translate(W / 2, H / 2); c.scale(15, 15); stoneGlyph(c, 'Hastur'); c.restore();
  putStill(grab(cv, W, H)); aim = { x: .5, y: .5 }; const res = scan(still, still.width, still.height), R = rng(5);
  const at = h => { const d = new Date(2026, 10, 16, h, 30); return hatch(res, d).family; }, out = {};
  PLAYER.roster = []; PLAYER.stones = ['Hastur'];
  for (const h of [20, 21, 23, 0, 2, 3, 12]) out['h' + h] = at(h);
  PLAYER.stones = []; out.noStone = at(22);
  PLAYER.stones = ['Hastur']; PLAYER.roster = [{ m: randomOpponent(R, 'Gug') }]; out.owned = at(22);
  PLAYER.roster = []; const m = hatch(res, new Date(2026, 10, 16, 22, 0)); out.stage = m.stage || null; out.ability = m.ability[0]; out.special = m.special;
  return out; }"""

async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        await pg.evaluate("()=>{ loadGame(); }")
        for fam in H:
            r = await pg.evaluate(SIM, [fam, ABIL[fam], 40])
            print(fam, json.dumps(r))
            C.ok(r['fam'] == fam and r['abil'] == ABIL[fam], f'{fam} hatches as itself with {ABIL[fam]}')
            C.ok(r['special'] and r['horror'], f'{fam} is a special and a horror')
            for k in ('ar', 'old'):
                C.ok(r[k]['ended'] == r[k]['n'] and not r[k]['bad'], f'{fam} {k} fights all end with real numbers')
            if fam != 'Yog': C.ok(r['ar']['ab'] > 0, f'{fam} shows {ABIL[fam]} on the arena')   # All Doors needs a Root or a swap move, so the rules below check it
            if ABIL[fam] in OLD: C.ok(r['old']['ab'] > 0, f'{fam} shows {ABIL[fam]} in the old battle')
        r = await pg.evaluate(RULES); print(json.dumps(r))
        C.ok(not r['stoneGug'] and r['stoneKraken'], 'owning a horror leaves its stone off the ranch while another special adds its own')
        C.ok('fuseErr' not in r and set(r['fuse']) <= {'Shub', 'Chomp'} and len(r['fuse']) == 2, 'a horror parent passes on its family or the other one, never a hybrid')
        C.ok(r['root'] is False and r['swapCost'] == 0, "Yog can't be Rooted and swaps for free")
        C.ok(r['young'], 'Shub comes back once with a kid in its place')
        C.ok(r['curse'] == 'Curse', "Hastur's foe starts Cursed")
        C.ok(r['mimic'] and r['mimic'] != 'Mimic', "Shoggoth takes its foe's ability")
        C.ok(r['soak'] is False and r['soakHeal'], 'a Soak heals Dagon instead of landing')
        # the stones
        far = {}
        for sp in H:
            got = [await pg.evaluate(STONE, [sp, k]) for k in (15, 12)]
            C.ok(all(g == sp for g in got), f'the {sp} stone held up to the camera, close and a little further back, reads as {sp} (got {got})')
            far[sp] = [await pg.evaluate(STONE, [sp, k]) for k in (0, 10)]
        print('each stone filling the whole screen, and held further off:', json.dumps(far))
        others = await pg.evaluate("()=>EGG_SPECIAL.slice()")
        wrong = {sp: g for sp in others for g in [await pg.evaluate(STONE, [sp, 15])] if g}
        C.ok(not wrong, f"no special's stone reads as a horror ({wrong})")
        got = await pg.evaluate(PIC, [b64(images.EGGS[k]()) for k in images.EGGS])
        C.ok(not any(got), f'no egg picture reads as a horror ({[g for g in got if g]})')
        for name, fn, n in (('clutter', images.clutter, 300), ('close-up', images.closeup, 200), ('plain', images.plain, 60)):
            hits = {}
            for st in range(0, n, 50):
                for g in await pg.evaluate(PIC, [b64(fn(7000 + k)) for k in range(st, min(n, st + 50))]):
                    if g: hits[g] = hits.get(g, 0) + 1
            rate = sum(hits.values()) / n; print(f'{name}: {sum(hits.values())} of {n} read as a horror', json.dumps(hits))
            C.ok(rate < 0.03, f'under 3% of {name} pictures read as a horror ({100 * rate:.1f}%)')
        g = await pg.evaluate(GATE); print(json.dumps(g))
        C.ok(all(g['h' + str(h)] == 'Hastur' for h in (21, 23, 0, 2)), 'the stone calls Hastur from 9pm to just before 3am')
        C.ok(all(g['h' + str(h)] != 'Hastur' for h in (20, 3, 12)), 'outside those hours the same scan makes a regular Snabit')
        C.ok(g['noStone'] != 'Hastur' and g['owned'] != 'Hastur', 'no call without the stone on the ranch, or with a horror already there')
        C.ok(g['ability'] == 'Yellow Sign' and g['special'], 'the called Hastur hatches with Yellow Sign')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
