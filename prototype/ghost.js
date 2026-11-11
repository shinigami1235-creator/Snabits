/* Ghost battles: a monster packed into a code with its stats, gear and habits, fought on those habits by a friend. Needs game.js, ranch.js and town.js. */
function ghostCode(s){
  const m=s.m;
  const o={v:1,n:m.name,f:m.family,hy:m.hybridOf||null,p:m.parts,e:[m.el1,m.el2,m.mono],pal:m.pal,st:m.stats,ab:m.ability,ps:m.pers,ls:m.lifespan,
    lv:s.level,tp:s.tp,sg:s.stage,mk:s.mark,m2:s.mark2,va:s.variant,we:s.wanderEl,eq:s.equip,wo:s.worn||{},he:s.held||null,u:s.uses||{},
    h:(s.habits||[]).slice(-80).map(x=>[x.k,x.n,x.o]),gr:s.grade};
  return "SNB1:"+btoa(unescape(encodeURIComponent(JSON.stringify(o))));
}
function readGhost(code){
  const t=code.trim(); if(!t.startsWith("SNB1:")) throw new Error("That isn't a Snabits code.");
  const o=JSON.parse(decodeURIComponent(escape(atob(t.slice(5)))));
  if(o.hy) registerHybrid(...o.hy);
  if(!FAMILY[o.f]) throw new Error("This code is from a newer version of the game.");
  const m={name:o.n,family:o.f,hybridOf:o.hy,parts:o.p,el1:o.e[0],el2:o.e[1],mono:o.e[2],pal:o.pal,stats:o.st,ability:o.ab,pers:o.ps,lifespan:o.ls,grid:buildGrid(o.f,o.p),pool:o.eq.slice(),skills:o.eq.slice(),talent:[0,0,0,0,0,0]};
  const s={m,tp:o.tp,level:o.lv,stage:o.sg,mark:o.mk,mark2:o.m2,variant:o.va,wanderEl:o.we,equip:o.eq.filter(n=>SKILLS[n]),worn:o.wo,held:o.he,uses:o.u||{},
    habits:(o.h||[]).map(([k,n,op])=>({k,n,o:op,f:0})),fightNo:0,lowLoyalty:false,grade:o.gr};
  s.grid=s.stage==="Bit"?m.grid:stageGrid(s); s.pal=variantPal(s);
  return s;
}
function openGhost(){
  panel(`<div style="flex-basis:100%;font-size:13px">A ghost fights on the habits its owner taught it in tournaments. Ghost battles use no week and teach nothing.</div>
    <button class="rb" id="g-share">Share my monster<small>Make a code to send</small></button><button class="rb" id="g-fight">Fight a friend's code<small>Paste their code</small></button><button class="rb" id="g-back">Back</button>`);
  el("g-share").onclick=()=>{ const code=ghostCode(RS);
    panel(`<div style="flex-basis:100%;font-size:13px">Send this code to a friend. It's ${displayName(RS)} as it is today.</div><textarea id="g-code" readonly style="flex-basis:100%;height:90px;font-size:11px;background:#1e1e26;color:#ddd;border-radius:8px;border:1px solid #444">${code}</textarea><button class="rb" id="g-copy">Copy</button><button class="rb" id="g-back2">Back</button>`);
    el("g-copy").onclick=async()=>{ try{ await navigator.clipboard.writeText(code); say("Code copied."); }catch(e){ el("g-code").select(); document.execCommand("copy"); say("Code copied."); } };
    el("g-back2").onclick=openGhost; };
  el("g-fight").onclick=()=>{
    panel(`<div style="flex-basis:100%;font-size:13px">Paste the code your friend sent.</div><textarea id="g-in" style="flex-basis:100%;height:90px;font-size:11px;background:#1e1e26;color:#ddd;border-radius:8px;border:1px solid #444"></textarea><button class="rb" id="g-go">Fight<small>You give the commands</small></button><button class="rb" id="g-auto">Auto<small>Both fight on habits</small></button><button class="rb" id="g-back3">Back</button>`);
    const go=mode=>{ let g; try{ g=readGhost(el("g-in").value); }catch(e){ say(e.message); return; }
      const foe={fm:fightMon(g),skills:g.equip,level:g.level,fighter:playerFighter(g),m:g.m};
      arenaFight({s:RS,foe,mode,title:"Ghost battle",foeHabits:g,onEnd:r=>{ say(r.winner===0?`It beat ${displayName(g)}'s ghost.`:r.winner===1?`${displayName(g)}'s ghost won.`:"A draw with the ghost."); saveGame(); }}); };
    el("g-go").onclick=()=>go("control"); el("g-auto").onclick=()=>go("auto"); el("g-back3").onclick=openGhost; };
  el("g-back").onclick=()=>openRooms();
}
