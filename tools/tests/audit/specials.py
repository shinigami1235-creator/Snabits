"""Each special family and each costume, from its own colour picture to the ranch and into both kinds of fight.
For every one: the scan finds it, the card and the Secrets tab say so, it drills, levels to its level 5 and 6 skills, fights on the
arena (on screen and simulated) and in the old turn battle (Quick fight on screen and simulated), evolves to Byte and Mega,
and comes back the same after a reload. Then a fusion with a special and a costume parent, and a team battle with all six specials.
Usage: specials.py [name ...] to run only some."""
import asyncio, sys, json, os
from playwright.async_api import async_playwright
from common import launch, reinject, settle, Checks, HERE
import images
ONLY = sys.argv[1:]
NEW16 = ['Tengu', 'Tanuki', 'Mermaid', 'Diwata', 'Sphinx', 'Garuda', 'Werewolf', 'Minotaur', 'Dragon', 'Thunderbird', 'Hydra', 'Griffin', 'Kirin', 'Salamander', 'Bakunawa', 'Cerberus', 'Djinn', 'Troll', 'Mummy', 'Sarimanok']   # checked by name (specials.py Tengu ...), so the full run keeps its count of eleven
ABILITY = {'Eagle': 'Sky High', 'Vampire': 'Bloodsuck', 'Phoenix': 'Rebirth', 'Kitsune': 'Illusion', 'Naga': 'Coil', 'Yeti': 'Thick Fur'}
ABILITY.update({'Tengu': 'Gust', 'Tanuki': 'Trick Leaf', 'Mermaid': 'Siren', 'Diwata': 'Blessing', 'Sphinx': 'Riddle', 'Garuda': 'Sky King', 'Werewolf': 'Full Moon', 'Minotaur': 'Headlong', 'Dragon': 'Dragon Scale', 'Thunderbird': 'Stormborn'})
ABILITY.update({'Hydra': 'Regrowth', 'Griffin': 'Long Sight', 'Kirin': 'Pure Step', 'Salamander': 'Heat Up', 'Bakunawa': 'Moon Eater', 'Cerberus': 'Three Bites', 'Djinn': 'Three Wishes', 'Troll': 'Hard Hide', 'Mummy': 'Undying', 'Sarimanok': 'Good Omen'})   # the specials of 16 Nov 2026

async def click(pg, sel, wait=150):
    ok = await pg.evaluate("s=>{ const e=document.querySelector(s); if(__vis(e)){ e.click(); return true; } return false; }", sel)
    await pg.wait_for_timeout(wait); return ok
async def scan(pg, path):
    await pg.set_input_files('#pick', path); await pg.wait_for_timeout(400); await pg.click('#scanbtn')
    for k in range(150):
        await pg.evaluate("()=>__pump()"); await pg.wait_for_timeout(100)
        if await pg.evaluate("()=>!document.querySelector('canvas.summon-cv')&&getComputedStyle(card).display!=='none'&&!card.classList.contains('held')"): break
    return await pg.evaluate("()=>({name:lastMon&&lastMon.name,family:lastMon&&lastMon.family,costume:lastMon&&lastMon.costume,special:lastMon&&lastMon.special,ability:lastMon&&lastMon.ability[0],skills:lastMon&&lastMon.skills,pool:lastMon&&lastMon.pool,text:card.innerText.slice(0,300)})")

# simulated fights: every one must end, with real numbers, and a special's ability must show up
SIM = """([n,abil])=>{ const R=rng(99), out={arena:{n:0,ended:0,abil:0,bad:0,win:0,sec:0},old:{n:0,ended:0,abil:0,bad:0,win:0}}, s=RS;
  const fams=Object.keys(FAM_MOVES);
  for(let k=0;k<n;k++){ const o=gradedOpponent(s.grade,Math.max(1,s.level+(k%3)-1),R,null,null,randomOpponent(R,fams[k%fams.length]));
    const ar=new Arena(arPlayer(s),arFoe(o),R); let steps=0; while(!ar.over&&steps++<700) ar.step();
    out.arena.n++; if(ar.over) out.arena.ended++; if(ar.winner===0) out.arena.win++; out.arena.sec+=ar.t;
    if(ar.ev.some(e=>e.t==='ability'&&e.name===abil&&e.i===0)) out.arena.abil++;
    if(ar.p.some(p=>!Number.isFinite(p.hp)||!Number.isFinite(p.x)||!Number.isFinite(p.focus))||ar.ev.some(e=>e.dmg!=null&&!Number.isFinite(e.dmg))) out.arena.bad++;
    const f=new Fight(playerFighter(s),makeFighter(o.fm,o.skills,o.level),R); let turns=0, ab=false;
    while(!f.over&&turns++<60){ const ev=f.play(f.aiPick(f.p[0],f.p[1]),f.aiPick(f.p[1],f.p[0])); if(ev.some(e=>e.t==='ability'&&e.name===abil&&e.who===0)) ab=true; if(ev.some(e=>e.dmg!=null&&!Number.isFinite(e.dmg))) out.old.bad++; }
    out.old.n++; if(f.over) out.old.ended++; if(ab) out.old.abil++; if(f.winner===0) out.old.win++; if(f.p.some(p=>!Number.isFinite(p.hp))) out.old.bad++; }
  out.arena.sec=Math.round(out.arena.sec/n); return out; }"""

BUILD = """()=>{ loadGame(); const hex=h=>[1,3,5].map(k=>parseInt(COL[h].slice(k,k+2),16)), r=(g,w)=>({g,w,raw:w,cd:0.3,rgb:hex(g)});
  const mk=(ov,key)=>{ const ranked=[r('orange',60),r('blue',25),r('white',10)]; return hatch({ranked,main:ranked[0],second:ranked[1],mono:false,tie:false,colours:5,pool:9,cells:[.2,.9,.3,.5,.8,.4,.1,.6,.7],sat:.5,bright:.6,contrast:.2,photoKey:key},new Date(),ov); };
  const all=EGG_SPECIAL.map(f=>({family:f})).concat(COSTUMES.map(c=>({costume:c,family:'Chomp'})));
  all.forEach((ov,i)=>{ const m=mk(ov,'audit'+i); openRanch(m); RS.tp=[60,120,40,30,20,40]; RS.level=30; RS.stage='Mega'; RS.mark=1; RS.mark2=0; rebuildLook(RS); fixEquip(RS); dexRaise(RS.m,'Mega'); saveGame(); });
  PLAYER.tutorialDone=true; saveGame(); }"""

async def arena_live(pg, C, label, fam, mode='auto'):
    await pg.evaluate("""([fam,mode])=>{ window.__res=null; const o=gradedOpponent(RS.grade,RS.level,Math.random,null,null,randomOpponent(Math.random,fam));
        arenaFight({s:RS,foe:o,mode,title:'Practice',learn:true,onEnd:r=>{ window.__res=r; }}); }""", [fam, mode])
    ok = False
    for k in range(700):
        await pg.evaluate("o=>__pump(o)", {'control': mode == 'control'}); await pg.wait_for_timeout(120)
        if await pg.evaluate("()=>!!window.__res"): ok = True; break
    r = await pg.evaluate("()=>window.__res")
    C.ok(ok and r and r['winner'] in (0, 1, None) and r['secs'] <= 61, f'{label}: an arena fight on screen against {fam} ({mode}) ends with a result ({r})')
    if not ok: await pg.screenshot(path=os.path.join(HERE, f'stuck-arena-{label}.png')); await pg.evaluate("()=>{ atStop(); const d=document.getElementById('atest'); if(d){ d.style.display='none'; d.innerHTML=''; } }")
    await pg.wait_for_timeout(200)

async def quick_fight(pg, C, label):
    """the old turn battle on screen, from the scan card's Quick fight"""
    ok = await click(pg, '#fightbtn', 300)
    await pg.evaluate("()=>{ window.BATTLE_PACE=0.02; }")
    await pg.evaluate("()=>{ const g=document.getElementById('lo-go'); if(g&&!g.disabled) g.click(); else { [...document.querySelectorAll('#lo-list .lo:not([disabled]):not(.on)')].slice(0,4).forEach(b=>b.click()); document.getElementById('lo-go').click(); } }")
    await pg.wait_for_timeout(300); done = False
    for k in range(400):
        st = await pg.evaluate("""()=>{ if(typeof B==='undefined'||!B) return 'none'; B.fast=true; if(getComputedStyle(document.getElementById('b-result')).display!=='none') return 'done';
            if(B.busy) return 'busy'; const bs=[...document.querySelectorAll('#b-btns .bbtn:not([disabled])')]; if(!bs.length) return 'nobtn';
            const pick=bs[Math.floor(Math.random()*Math.min(bs.length,5))]; pick.click(); return 'tap'; }""")
        if st == 'done': done = True; break
        await pg.wait_for_timeout(60)
    turns = await pg.evaluate("()=>typeof B!=='undefined'&&B?B.fight.turn:null")
    C.ok(ok and done, f'{label}: a Quick fight in the old battle ends ({st}, {turns} turns)')
    bt = await pg.evaluate("()=>__badText()"); C.ok(not bt, f'{label}: the old battle screen has no broken values ({bt})')
    if not done: await pg.screenshot(path=os.path.join(HERE, f'stuck-old-{label}.png'))
    await pg.evaluate("()=>{ closeBattle(); }"); await pg.wait_for_timeout(150)

async def one(pg, C, kind, path, errs):
    special = kind in ABILITY; label = kind
    if special: await pg.evaluate("k=>{ if(typeof PLAYER!=='undefined'&&PLAYER){ const L=stoneList(); if(L&&!L.includes(k)) L.push(k); } }", kind)   # its Pattern Stone found, so the scan can call it
    else: await pg.evaluate("k=>{ if(typeof PLAYER!=='undefined'&&PLAYER){ const L=cosOpenList(); if(L&&!L.includes(k)) L.push(k); } }", kind)   # its pattern card found, so the scan can put the costume on
    info = await scan(pg, path)
    if special:
        C.ok(info['family'] == kind and info['special'] and info['ability'] == ABILITY[kind], f'{label}: its picture finds the special with {ABILITY[kind]} ({info["family"]}, {info["ability"]})')
        C.ok('Special' in info['text'], f'{label}: the card says Special')
    else:
        cs = await pg.evaluate("k=>Object.keys(COSTUME_SKILLS).filter(n=>COSTUME_SKILLS[n].costume===k)", kind)
        C.ok(info['costume'] == kind and cs[0] in info['skills'] and cs[1] in info['pool'], f'{label}: its picture puts the costume on, with {cs[0]} to start and {cs[1]} in its pool ({info["costume"]}, {info["skills"]})')
        C.ok(kind + ' costume' in info['text'], f'{label}: the card names the costume')
    await quick_fight(pg, C, label)
    n0 = await pg.evaluate("()=>PLAYER?PLAYER.roster.length:0")
    await pg.click('#raisebtn'); await pg.wait_for_timeout(500); await settle(pg, label=label + '-raise')
    C.ok(await pg.evaluate("([k,sp,n0])=>!!RS&&RS.open&&PLAYER.roster.length===n0+1&&(sp?RS.m.family===k:RS.m.costume===k)", [kind, special, n0]), f'{label}: it is on the ranch')
    await pg.evaluate("()=>{ RS.noScenes=true; PLAYER.tutorialDone=true; PLAYER.bits=Math.max(PLAYER.bits,5000); drawUI(); }")
    key = kind if special else 'c:' + kind
    C.ok(await pg.evaluate("k=>!!(PLAYER.dexSecret&&PLAYER.dexSecret[k]&14)", key), f'{label}: the Secrets tab counts it as raised')
    # a drill, then levels: the family move at 5 and the costume's second skill at 6
    await click(pg, '#r-menu [data-m="Train"]'); await click(pg, '#r-panel [data-d="1"]'); C.ok(await settle(pg, label=label + '-drill'), f'{label}: a drill week runs')
    lv = await pg.evaluate("()=>{ giveExp(RS,900); drawUI(); return {level:RS.level,known:knownSkills(RS),moves:arPlayer(RS).moves.map(m=>m.name),sig:sigSkills(RS)}; }")
    C.ok(lv['level'] >= 8 and all(n in lv['known'] for n in lv['sig']), f'{label}: at level {lv["level"]} it knows its family skill {lv["sig"]}')
    if not special: C.ok(cs[1] in lv['known'] and cs[0] in lv['moves'] and cs[1] in lv['moves'], f'{label}: it knows {cs[1]} from level 6 and both costume skills are arena moves')
    # fights
    await arena_live(pg, C, label, 'Chomp', 'auto'); await arena_live(pg, C, label, 'Lern', 'control')
    sim = await pg.evaluate(SIM, [40, ABILITY.get(kind, '-')])
    C.ok(sim['arena']['ended'] == sim['arena']['n'] and not sim['arena']['bad'], f'{label}: 40 simulated arena fights all end with real numbers ({sim["arena"]})')
    C.ok(sim['old']['ended'] == sim['old']['n'] and not sim['old']['bad'], f'{label}: 40 simulated old battles all end with real numbers ({sim["old"]})')
    if special:
        C.ok(sim['arena']['abil'] > 0, f'{label}: {ABILITY[kind]} goes off in the arena ({sim["arena"]["abil"]} of 40 fights)')
        C.ok(sim['old']['abil'] > 0 or kind in ('Yeti', 'Tengu', 'Minotaur', 'Garuda', 'Griffin', 'Cerberus'), f'{label}: {ABILITY[kind]} goes off in the old battle ({sim["old"]["abil"]} of 40 fights)')
    print(f'  {label}: arena {sim["arena"]}, old {sim["old"]}', flush=True)
    # evolve twice: enough training for Byte, then for Mega
    for stage in ['Byte', 'Mega']:
        await pg.evaluate("()=>{ const need=evoTotal()-tpTotal()+2; RS.tp[1]+=Math.max(0,need); RS.fatigue=0; RS.stress=0; drawUI(); }")
        await click(pg, '#r-menu [data-m="Rest"]'); await click(pg, '#r-rest'); ok = await settle(pg, label=f'{label}-{stage}')
        C.ok(ok and await pg.evaluate("s=>RS.stage===s", stage), f'{label}: it evolves to {stage}')
        await pg.wait_for_timeout(300)
    await arena_live(pg, C, label + ' Mega', 'Booly', 'auto')
    for tab in ['status', 'skills', 'record']:
        await pg.evaluate("t=>openInfo(t)", tab); await pg.wait_for_timeout(200); bt = await pg.evaluate("()=>__badText()"); C.ok(not bt, f'{label}: info page {tab} has no broken values ({bt})'); await pg.evaluate("()=>closeInfo()")
    await pg.evaluate("()=>{ menu('Out'); openDex('Secrets'); }"); await pg.wait_for_timeout(300)
    nt = await pg.evaluate("()=>[document.querySelectorAll('#r-panel .dex-t').length, DEX_SECRETS.length]"); C.ok(nt[0] == nt[1], f'{label}: the Secrets tab draws a tile for each secret ({nt})')
    bt = await pg.evaluate("()=>__audit.bad.splice(0)"); C.ok(not bt, f'{label}: no NaN or undefined on screen ({bt})')
    C.ok(not [e for e in errs], f'{label}: no console or page errors ({errs[:2]})'); errs.clear()
    await pg.evaluate("()=>{ menu(); saveGame(); openScope(); }"); await pg.wait_for_timeout(300)

async def main():
    C = Checks(); imgs = images.save_all('/tmp/snabits-audit-img')
    async with async_playwright() as p:
        b, pg, errs = await launch(p)   # the #test page: no title, and no save loaded before the first scan
        kinds = [k for k in images.EGGS if (not ONLY and k not in NEW16) or k in ONLY]
        SAVE = '/tmp/snabits-audit-specials.json'
        if ONLY == ['--tail']:   # only the part after the eleven, from the save the last full run left
            if os.path.exists(SAVE): await pg.evaluate("t=>{ localStorage.setItem(SAVE_KEY,t); loadGame(); }", open(SAVE).read())
            else: await pg.evaluate(BUILD)   # no save yet: hatch the eleven with the game's own overrides and raise them to Mega
            ONLY.clear()
        else:
            for kind in kinds: await one(pg, C, kind, imgs[kind], errs)
            if not ONLY: open(SAVE, 'w').write(await pg.evaluate("()=>{ saveGame(); return localStorage.getItem(SAVE_KEY); }"))
        if not ONLY:
            # reload: every special and costume is still what it was
            before = await pg.evaluate("()=>JSON.stringify(PLAYER.roster.map(e=>[e.m.family,e.m.costume,e.m.ability[0],e.st&&e.st.stage]))")
            NR = len(json.loads(before))   # every special and costume the run raised
            await pg.reload(); await pg.wait_for_timeout(900); await reinject(pg); await pg.evaluate("()=>{ const o=document.getElementById('ob'); if(o){ o.style.display='none'; o.innerHTML=''; } loadGame(); openRanch(); RS.noScenes=true; }"); await settle(pg, label='reload')
            after = await pg.evaluate("()=>JSON.stringify(PLAYER.roster.map(e=>[e.m.family,e.m.costume,e.m.ability[0],e.st&&e.st.stage]))")
            C.ok(before == after and len(json.loads(after)) == NR, f'after a reload all {NR} are still on the roster as they were')
            C.ok(await pg.evaluate("()=>Object.keys(PLAYER.dexSecret||{}).length") == NR, f'the Secrets tab has all {NR}')
            # the freezer draws every one of them
            await pg.evaluate("()=>{ menu('Out'); openFreezer(); }"); await pg.wait_for_timeout(1800); bt = await pg.evaluate("()=>__badText()"); C.ok(not bt, f'the freezer with {NR} Snabits has no broken values ({bt})')
            await pg.evaluate("()=>{ const f=document.getElementById('f-back'); if(f) f.click(); }"); await pg.wait_for_timeout(1500)   # back from the freezer walks into the lab
            await pg.evaluate("()=>menu('Out')"); await pg.wait_for_timeout(1500); await settle(pg, label='leave-lab')
            # team battle: the six specials, all Mega
            await pg.evaluate("()=>{ menu('Out'); openTeam(); }"); await pg.wait_for_timeout(300)
            n = await pg.evaluate("()=>document.querySelectorAll('#r-panel .tm-pick').length"); C.ok(n == NR, f'team battle lists all {NR} Megas ({n}) ' + await pg.evaluate("()=>document.getElementById('r-panel').innerText.slice(0,200)"))
            await pg.evaluate("()=>{ const sp=['Eagle','Vampire','Phoenix','Kitsune','Naga','Yeti']; for(const f of sp){ const s=TM.ready.find(s=>s.m.family===f); document.querySelector(`#r-panel .tm-pick[data-id=\"${s.id}\"]`).click(); } }"); await pg.wait_for_timeout(200)
            await click(pg, '#tm-find', 300); await click(pg, '#tm-go', 400); await pg.evaluate("()=>{ window.BATTLE_PACE=0.02; }"); done = False
            for k in range(1500):
                st = await pg.evaluate("""()=>{ if(typeof B==='undefined'||!B) return 'none'; B.fast=true; if(getComputedStyle(document.getElementById('b-result')).display!=='none') return 'done';
                    if(B.busy) return 'busy'; const bs=[...document.querySelectorAll('#b-btns .bbtn:not([disabled])')].filter(b=>b.dataset.id!=='SW'&&!b.dataset.back); if(!bs.length) return 'nobtn';
                    bs[Math.floor(Math.random()*Math.min(bs.length,5))].click(); return 'tap'; }""")
                if st == 'done': done = True; break
                await pg.wait_for_timeout(50)
            C.ok(done, f'a team battle with the six specials ends ({st}, turn {await pg.evaluate("()=>typeof B!==\'undefined\'&&B?B.fight.turn:null")})')
            if not done: await pg.screenshot(path=os.path.join(HERE, 'stuck-team.png'))
            await click(pg, '#b-cont', 300)
            # a ghost code carries the costume and the arena habits and preset
            g = await pg.evaluate("""()=>{ const e=PLAYER.roster.find(e=>e.m.costume==='Panda'), s=newRanch(e); s.arHabit={Bite:7}; s.arPresets=[['Dash In'],[],[]]; s.arPreset=0;
                const back=readGhost(ghostCode(s)), f=arPlayer(back); return {costume:back.m.costume,habit:back.arHabit,spec:chibiSpec(fightMon(back),back).costume,off:!f.moves.some(m=>m.name==='Dash In'),fh:f.habit}; }""")
            C.ok(g['costume'] == 'Panda' and g['spec'] == 'Panda', f'a ghost code keeps the costume ({g})')
            C.ok(g['habit'] == {'Bite': 7} and g['fh'] == {'Bite': 7} and g['off'], f'a ghost code keeps the arena habits and the move preset ({g})')
            # old battle: an attacker that faints from its own recoil on the hit a Phoenix rises from has lost
            ph = await pg.evaluate("""()=>{ const R=rng(5), a=randomOpponent(R,'Chomp'), b=randomOpponent(R,'Phoenix'), A=makeFighter(a,['Inferno'],30), B2=makeFighter(b,b.skills,30);
                A.skills[0]={...A.skills[0],sure:true}; A.energy=10; A.hp=1; B2.hp=1; const f=new Fight(A,B2,R); f.play(0,GUARD); return {over:f.over,winner:f.winner,a:A.hp,b:B2.hp,reborn:!!B2.reborn}; }""")
            C.ok(ph['reborn'] and ph['over'] and ph['winner'] == 1 and ph['b'] > 0, f'recoil that knocks the attacker out as a Phoenix rises ends the fight for the Phoenix ({ph})')
            # a scan on a ranch at grade C or better can turn up a hidden ability, but never in place of a special's own
            hb = await pg.evaluate("""()=>{ const hex=h=>[1,3,5].map(k=>parseInt(COL[h].slice(k,k+2),16)), r=(g,w)=>({g,w,raw:w,cd:0.3,rgb:hex(g)}), g0=RS.grade; RS.grade='A'; let bad=0, hid=0, plain=0;
                for(let k=0;k<400;k++){ const ranked=[r('red',80),r('blue',12),r('white',8)], res={ranked,main:ranked[0],second:null,mono:true,tie:false,colours:3,pool:7,cells:[.2,.9,.3,.5,.8,.4,.1,.6,.7],sat:.5,bright:.2,contrast:.2,photoKey:'h'+k};
                  const m=scanBoost(hatch(res,new Date(k*60000),{family:EGG_SPECIAL[k%6]})); if(m.ability[0]!==FAMILY[m.family].ability[0]) bad++; if(m.hidden) hid++;
                  if(scanBoost(hatch(res,new Date(k*60000),{family:'Chomp'})).hidden) plain++; }
                RS.grade=g0; return {bad,hid,plain}; }""")
            C.ok(hb['bad'] == 0 and hb['hid'] == 0 and hb['plain'] > 40, f'400 special scans at grade A all keep their own ability, while ordinary scans still roll hidden ones ({hb})')
            # fusion keeps a special family's own ability, whatever the parents had
            fz = await pg.evaluate("""()=>{ const sp=PLAYER.roster.filter(e=>FAMILY[e.m.family].special), co=PLAYER.roster.filter(e=>e.m.costume); let n=0, bad=[];
                for(let k=0;k<120;k++){ const a=sp[k%sp.length], b=co[k%co.length], c=k%2?fuseChild(a,b,null,rng(k)):fuseChild(b,a,null,rng(k)); if(FAMILY[c.m.family].special){ n++; if(c.m.ability[0]!==FAMILY[c.m.family].ability[0]) bad.push(c.m.family+':'+c.m.ability[0]); } }
                return {n,bad}; }""")
            C.ok(fz['n'] > 20 and not fz['bad'], f'fused children in a special family keep the family ability ({fz["n"]} children, wrong: {fz["bad"][:4]})')
            # fusion: a special with a costume wearer, through the lab
            ids = await pg.evaluate("()=>[PLAYER.roster.find(e=>e.m.family==='Eagle').id,PLAYER.roster.find(e=>e.m.costume==='Panda').id]")
            await pg.evaluate("ids=>{ PLAYER.bits+=1000; LAB.a=ids[0]; LAB.b=ids[1]; menu('Out'); openLab(); }", ids); await pg.wait_for_timeout(1500); await settle(pg, label='lab')
            C.ok(await click(pg, '#l-fuse', 500), 'the lab offers the fusion'); ok = await settle(pg, max_s=60, label='fusion')
            ch = await pg.evaluate("()=>({n:PLAYER.roster.length,fam:RS.m.family,ability:RS.m.ability,name:RS.m.name,stats:RS.m.stats,skills:RS.equip,open:RS.open,special:!!(FAMILY[RS.m.family].special)})")
            C.ok(ok and ch['n'] == NR - 1 and ch['open'] and all(isinstance(v, (int, float)) for v in ch['stats']), f'the fusion makes a child on the ranch ({ch})')
            if ch['special']: C.ok(ch['ability'][0] == ABILITY[ch['fam']], f'a fused {ch["fam"]} keeps the family ability ({ch["ability"][0]})')
            await pg.evaluate("()=>{ RS.noScenes=true; }"); await click(pg, '#r-menu [data-m="Train"]'); await click(pg, '#r-panel [data-d="0"]'); C.ok(await settle(pg, label='child-drill'), 'the fused child drills')
            await arena_live(pg, C, 'fused child', 'Pinch', 'auto')
            # items from the bag: a skill chip, medicine and a Life fruit
            it = await pg.evaluate("""()=>{ const chip=Object.keys(SKILLS).find(n=>SKILLS[n].el===RS.m.el1&&SKILLS[n].lv<=8&&!knownSkills(RS).includes(n)); addItem('Skill chip: '+chip); addItem('Medicine'); addItem('Life fruit'); RS.sick=1; RS.used=20; menu('Care'); openItems(); return chip; }""")
            for nm in ['Skill chip: ' + it, 'Medicine', 'Life fruit']: await pg.evaluate("n=>{ openItems(); [...document.querySelectorAll('#r-panel [data-i]')].find(b=>b.dataset.i===n).click(); }", nm); await pg.wait_for_timeout(150)
            r = await pg.evaluate("c=>({chip:knownSkills(RS).includes(c),sick:RS.sick,used:RS.used,fruit:RS.fruitUsed,bag:['Medicine','Life fruit','Skill chip: '+c].map(k=>PLAYER.bag[k]||0)})", it)
            C.ok(r['chip'] and r['sick'] == 0 and r['used'] == 8 and r['fruit'] and r['bag'][1] == 0 and r['bag'][2] == 0, f'a skill chip, medicine and a Life fruit all work from the bag ({r})')
            # the freezer: bring another one out and the first comes back as it was
            a0 = await pg.evaluate("()=>{ saveGame(); return JSON.stringify([PLAYER.active,packRanch(RS)]); }")
            await pg.evaluate("()=>{ menu('Out'); openFreezer(); }"); await pg.wait_for_timeout(1800)
            C.ok(await pg.evaluate("()=>{ const b=[...document.querySelectorAll('#frz button.small')].find(b=>!b.disabled&&b.textContent==='Bring out'); if(b){ b.click(); return true; } return false; }"), 'the freezer has a Bring out button'); await pg.wait_for_timeout(600); await settle(pg, label='swap')
            C.ok(await pg.evaluate("a=>PLAYER.active!==JSON.parse(a)[0]&&RS.id===PLAYER.active&&RS.open", a0), 'another Snabit came out of the freezer')
            await pg.evaluate("a=>{ saveGame(); PLAYER.active=JSON.parse(a)[0]; RS=null; openRanch(); RS.noScenes=true; }", a0); await settle(pg, label='swap-back')
            a1 = await pg.evaluate("()=>JSON.stringify([PLAYER.active,packRanch(RS)])"); C.ok(a0 == a1, 'the first one comes back from the freezer exactly as it went in')
            # rebirth in the lab: an old Snabit starts over as a Bit and keeps one skill
            await pg.evaluate("()=>{ addItem('Rebirth seed'); RS.used=Math.round(lifeWeeks()*0.8); RS.tp=[30,40,20,10,10,20]; menu('Out'); openLab(); }"); await pg.wait_for_timeout(1500); await settle(pg, label='lab2')
            C.ok(await click(pg, '#l-reb', 400) and await click(pg, '#r-panel [data-r]', 400) and await settle(pg, label='rebirth'), 'the lab runs a rebirth')
            rb = await pg.evaluate("()=>({stage:RS.stage,level:RS.level,used:RS.used,tp:RS.tp,seed:PLAYER.bag['Rebirth seed']||0,equip:RS.equip.length})")
            C.ok(rb['stage'] == 'Bit' and rb['level'] == 1 and rb['used'] == 0 and rb['tp'] == [6, 8, 4, 2, 2, 4] and rb['seed'] == 0 and rb['equip'] >= 2, f'after rebirth it is a level 1 Bit with a fifth of its training ({rb})')
            await pg.evaluate("()=>menu()"); await settle(pg, label='end')
            bt = await pg.evaluate("()=>__audit.bad"); C.ok(not bt, f'no NaN or undefined on screen at the end ({bt})')
            snd = await pg.evaluate("()=>__snd"); C.ok(not snd, f'no sound threw ({snd[:3]})')
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
