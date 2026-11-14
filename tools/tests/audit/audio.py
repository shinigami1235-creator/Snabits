"""Every sound the game can make, played once with the swallowed errors caught: move sounds (KSND), ability and status sounds
(atSfx), ranch sounds (rsfx), element sounds, cries for every family and stage, hit sounds, jingles, the summon score and every tune.
It also lists move animations that have no sound of their own."""
import asyncio, sys, json
from playwright.async_api import async_playwright
from common import launch, Checks
JS = r"""async()=>{ const out={played:0,silent:[],errs:[]}; let nodes=0;
  if(!AC) audioInit(); if(!AC) return {noAudio:true};
  MUS.on=true; const cg=AC.createGain.bind(AC), co=AC.createOscillator.bind(AC), cb=AC.createBufferSource.bind(AC);
  AC.createGain=()=>{ nodes++; return cg(); }; AC.createOscillator=()=>{ nodes++; return co(); }; AC.createBufferSource=()=>{ nodes++; return cb(); };
  const play=(label,fn)=>{ const n0=nodes, e0=__snd.length; try{ fn(); }catch(e){ out.errs.push(label+': '+e); } if(__snd.length>e0) out.errs.push(label+' -> '+__snd.slice(e0).join('; ')); if(nodes===n0) out.silent.push(label); else out.played++; };
  if(!sfxBus()) return {noBus:true, on:MUS.on, nb:!!MUS.nb};
  const atKinds=[...new Set([...atSfx.toString().matchAll(/kind===\"([^\"]+)\"/g)].map(m=>m[1]))];
  for(const k of atKinds) play('atSfx '+k,()=>atSfx(k,'Blaze'));
  for(const a of Object.values(FAMILY).map(f=>f.ability[0]).concat(Object.values(EL_ABILITY).flat().map(a=>a[0]))) play('ability '+a,()=>atSfx('ab:'+a));
  const rs=[...new Set([...rsfx.toString().matchAll(/[{,]\s*(\w+):\s*\(\)\s*=>/g)].map(m=>m[1]))];
  for(const k of rs){ for(const key in RSFX_T) delete RSFX_T[key]; play('rsfx '+k,()=>rsfx(k)); }
  for(const k of Object.keys(KSND)) play('kindSfx '+k,()=>kindSfx(k,0.1));
  for(const e of Object.values(EL).concat(['Void'])) for(const ph of ['cast','hit']) play('elSfx '+e+' '+ph,()=>elSfx(e,ph));
  for(const f of Object.keys(FAMILY)) for(const st of ['Bit','Byte','Mega']) play('cry '+f+' '+st,()=>cry(f,st));
  for(const k of ['tap','hit','heavy','ko','whoosh','charge']) play('sfx '+k,()=>sfx(k));
  for(const k of [true,false,'vs','evo']) play('jingle '+k,()=>{ if(!musJingle(k)) throw new Error('returned false'); });
  for(const k of ['summon','fusion']) play('cue '+k,()=>{ const c=musCue(k,2800,4900); if(!c) throw new Error('no cue'); c.skip(500); });
  out.tracks=[]; for(const key of Object.keys(TRACKS)){ try{ const d=await musRender(key,2); let pk=0; for(let i=0;i<d.length;i+=50) pk=Math.max(pk,Math.abs(d[i])); if(!(pk>0.001)||!Number.isFinite(pk)) out.errs.push('tune '+key+' is silent or broken: '+pk); out.tracks.push(key); }catch(e){ out.errs.push('tune '+key+': '+e); } }
  // every animation a move can play, and whether it has a sound of its own
  const kinds=new Set(), sp={family:'Chomp',stage:'Byte',marks:[],worn:{}};
  const kindOf=m=>{ let k; if(m.buff) k=({bunker:'bunker',phase:'phase',brace:'shield',riposte:'shield',bubble:'shield',feedback:'shield',unblink:'buff'})[m.buff]||'buff'; else if(m.support){ k=typeof supportKind==='function'?supportKind(m.name):'buff'; } else if(m.lower&&!m.dmg) k='glare';
    else k=typeof AR_KIND!=='undefined'&&AR_KIND[m.base||m.name]&&ANIM[AR_KIND[m.base||m.name]]?AR_KIND[m.base||m.name]:animFor({name:m.name,kind:m.cast?'Cast':'Strike',el:m.el},sp); return ANIM[k]?k:'tackle'; };
  const noSound={}; for(const fam of Object.keys(FAM_MOVES)){ sp.family=fam; for(const m of arMoves(fam,60,Object.keys(SKILLS).filter(n=>!SKILLS[n].field),'Blaze')){ if(m.step&&!m.dmg||m.swap) continue; const k=kindOf(m); kinds.add(k); if(!KSND[k]) (noSound[k]=noSound[k]||new Set()).add(m.name); } }
  out.kinds=kinds.size; out.noSound=Object.fromEntries(Object.entries(noSound).map(([k,v])=>[k,[...v].slice(0,4)])); return out; }"""
async def main():
    C = Checks()
    async with async_playwright() as p:
        b, pg, errs = await launch(p)
        await pg.mouse.click(5, 5); await pg.wait_for_timeout(300)   # a real tap, which is what starts the audio
        r = await pg.evaluate(JS)
        if r.get('noAudio') or r.get('noBus'): print('no audio in this browser, nothing tested', r); await b.close(); sys.exit(2)
        print(f"{r['played']} sounds played, {len(r['tracks'])} tunes rendered, {r['kinds']} move animations in use")
        C.ok(not r['errs'], f"no sound throws ({r['errs'][:6]})")
        C.ok(not r['silent'], f"every named sound makes a sound ({r['silent'][:12]})")
        print('move animations with no sound of their own (they still get the whoosh, the hit and the element sound):', json.dumps(r['noSound']))
        await b.close()
    sys.exit(C.done(errs))
asyncio.run(main())
