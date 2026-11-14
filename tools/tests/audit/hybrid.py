"""Hybrids, which fusion makes about 1 time in 7: the first parent's body on the second parent's legs. Their body family may have
no smooth drawing for the mix, and then the ranch falls back to the pixel yard and fights to the old turn battle, so this is the
path that still runs the old battle inside the game. Three hybrids: two ordinary families, a special with an ordinary one, and
two specials. Each one drills, fights a cup on Auto and by hand, goes on a mission and survives a reload. Usage: hybrid.py"""
import asyncio, sys, json, os
from playwright.async_api import async_playwright
from common import launch, reinject, settle, Checks
PAIRS = [('Chomp', 'Stilt'), ('Eagle', 'Skit'), ('Phoenix', 'Yeti')]
MAKE = """([a,b])=>{ if(!PLAYER) loadGame(); const hex=h=>[1,3,5].map(k=>parseInt(COL[h].slice(k,k+2),16)), r=(g,w)=>({g,w,raw:w,cd:0.3,rgb:hex(g)});
  const mk=(fam,key)=>{ const ranked=[r('orange',60),r('blue',25),r('white',10)]; return hatch({ranked,main:ranked[0],second:ranked[1],mono:false,tie:false,colours:5,pool:9,cells:[.2,.9,.3,.5,.8,.4,.1,.6,.7],sat:.5,bright:.6,contrast:.2,photoKey:key},new Date(),{family:fam}); };
  if(RS&&RS.id) saveGame(); const e1=addToRoster(mk(a,'hy'+a)), e2=addToRoster(mk(b,'hy'+b)); e1.st={tp:[20,40,20,10,10,20],level:10}; e2.st={tp:[10,10,10,40,20,30],level:10};
  let child=null; for(let k=0;k<400&&!child;k++){ const c=fuseChild(e1,e2,null,rng(k)); if(c.hybrid) child=c; }
  if(!child) return null; PLAYER.roster=PLAYER.roster.filter(e=>e.id!==e1.id&&e.id!==e2.id); const e={id:'m'+(PLAYER.nextId++),m:child.m,st:child.st}; PLAYER.roster.push(e); PLAYER.active=e.id; RS=null; saveGame(); openRanch();
  PLAYER.tutorialDone=true; PLAYER.bits=Math.max(PLAYER.bits,3000); RS.noScenes=true; story().seen.intro=story().seen.intro||1; giveExp(RS,500); drawUI();
  return {name:RS.m.name,fam:RS.m.family,of:FAMILY[RS.m.family].of,smooth:smoothRanch(),ability:RS.m.ability[0],level:RS.level,moves:arPlayer(RS).moves.length}; }"""
async def click(pg, sel, wait=200):
    ok = await pg.evaluate("s=>{ const e=document.querySelector(s); if(__vis(e)){ e.click(); return true; } return false; }", sel)
    await pg.wait_for_timeout(wait); return ok
async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        for a, bb in PAIRS:
            h = await pg.evaluate(MAKE, [a, bb]); label = f'{a}+{bb}'
            if not C.ok(h and h['of'] == [a, bb], f'{label}: fusion makes a hybrid ({h})'): continue
            print(f'  {label}: {h}', flush=True); await settle(pg, label=label)
            await click(pg, '#r-menu [data-m="Train"]'); await click(pg, '#r-panel [data-d="1"]'); C.ok(await settle(pg, label=label + '-drill'), f'{label}: a drill week runs')
            await click(pg, '#r-menu [data-m="Rest"]'); await click(pg, '#r-rest'); C.ok(await settle(pg, label=label + '-rest'), f'{label}: a rest week runs')
            for mode in ['auto', 'control']:   # a regular E cup, on Auto and then by hand
                await pg.evaluate("()=>{ PLAYER.week=Math.ceil((PLAYER.week+1)/4)*4; RS.fatigue=0; RS.stress=0; drawUI(); openVenue(); venueLobby(); }"); await pg.wait_for_timeout(300)
                idx = await pg.evaluate("()=>cupsThisWeek(RS).findIndex(c=>!c.official&&!c.open&&c.grade==='E')"); w = await pg.evaluate("()=>PLAYER.week")
                await click(pg, f'#v-body [data-c="{idx}"]', 300); await click(pg, '#v-enter', 300); await click(pg, '#v-enter', 400)
                ok = await settle(pg, {'fight': mode == 'control', 'control': True}, max_s=500, label=f'{label}-cup-{mode}')
                r = await pg.evaluate("()=>({done:CUP&&CUP.done,place:CUP&&CUP.place,fights:CUP&&CUP.fights,week:PLAYER.week,open:RS.open})")
                C.ok(ok and r['done'] and r['open'] and r['week'] == w + 1, f'{label}: a cup ({mode}) runs to the end, place {r["place"]} after {r["fights"]} fights')
            await pg.evaluate("()=>{ RS.fatigue=0; RS.stress=0; RS.injured=false; drawUI(); menu('Out'); openBoard(); }"); await pg.wait_for_timeout(200)
            ok = await click(pg, '#r-panel [data-b="0"]') and await settle(pg, {'keepReport': True}, max_s=300, label=label + '-mission')
            C.ok(ok and await pg.evaluate("()=>!!document.getElementById('r-rok')"), f'{label}: a mission runs and shows its report'); await click(pg, '#r-rok', 300)
            for tab in ['status', 'skills', 'record']:
                await pg.evaluate("t=>openInfo(t)", tab); await pg.wait_for_timeout(200); bt = await pg.evaluate("()=>__badText()"); C.ok(not bt, f'{label}: info page {tab} has no broken values ({bt})'); await pg.evaluate("()=>closeInfo()")
            g = await pg.evaluate("()=>{ const back=readGhost(ghostCode(RS)); return [back.m.family,!!FAMILY[back.m.family].of]; }"); C.ok(g[1], f'{label}: its ghost code reads back as the hybrid ({g})')
            before = await pg.evaluate("()=>{ saveGame(); return JSON.stringify([RS.m.family,RS.m.hybridOf,packRanch(RS)]); }")
            await pg.reload(); await pg.wait_for_timeout(900); await reinject(pg)
            await pg.evaluate("()=>{ const o=document.getElementById('ob'); if(o){ o.style.display='none'; o.innerHTML=''; } loadGame(); openRanch(); RS.noScenes=true; }"); await settle(pg, label=label + '-reload')
            after = await pg.evaluate("()=>JSON.stringify([RS.m.family,RS.m.hybridOf,packRanch(RS)])")
            A = json.loads(before); Bq = json.loads(after); A[2].pop('hungerDay', None); Bq[2].pop('hungerDay', None)
            C.ok(A == Bq and await pg.evaluate("()=>!!FAMILY[RS.m.family]&&!!FAMILY[RS.m.family].of"), f'{label}: after a reload the hybrid is back as it was')
            bt = await pg.evaluate("()=>__audit.bad.splice(0)"); C.ok(not bt, f'{label}: no NaN or undefined on screen ({bt})')
            C.ok(not errs, f'{label}: no console or page errors ({errs[:2]})'); errs.clear()
        snd = await pg.evaluate("()=>__snd"); C.ok(not snd, f'no sound threw ({snd[:3]})')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
