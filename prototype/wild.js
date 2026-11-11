/* Wild battles: point the camera at something and a wild Snabit comes out of its colours.
   The photo's main colour always sets the main element. Everything else can shift per scan:
   family (a cousin of the photo's family), parts, talent, personality, the second element,
   and now and then rare colours. It's scaled to the monster you're raising. */
let WILD=null;
const WILD_PER_WEEK=3;
const FAM_COUSINS={Squib:["Booly","Moko","Skit"],Booly:["Squib","Moko","Stilt"],Moko:["Squib","Booly","Antik"],
  Skit:["Stilt","Antik","Pinch"],Stilt:["Skit","Antik","Booly"],Antik:["Skit","Stilt","Chomp"],
  Pinch:["Chomp","Skit","Squib"],Chomp:["Pinch","Antik","Moko"]};

function wildLeft(s){ return s.wildWeek===PLAYER.week?WILD_PER_WEEK-(s.wildCount||0):WILD_PER_WEEK; }
function wildBlock(s){
  if(s.away) return "It's out on a mission.";
  if(s.dead) return "";
  if(s.injured) return "It's hurt. Rest it or give it medicine first.";
  if(s.sick) return "It has a cold. No wild fights until it's better.";
  if(s.fatigue>=90) return "It's worn out. Let it rest first.";
  if(wildLeft(s)<=0) return `That's ${WILD_PER_WEEK} wild fights this week. They come back next week.`;
  return null;
}
function startWild(){
  const s=RS, why=wildBlock(s); if(why){ say(why); return; }
  WILD={s,seen:0}; closeRanch();
  if(typeof setWildUI==="function") setWildUI(true);
}
function endWild(){ WILD=null; if(typeof setWildUI==="function") setWildUI(false); }

/* The enemy. res is the scan, s the player's monster, R a fresh random source per scan. */
function wildFrom(res,s,R){
  let r2=res;
  const third=res.ranked.find(x=>x!==res.main&&x!==res.second&&x.w>=6);
  const roll=R();
  if(res.second&&third&&roll<0.3) r2={...res,second:third};          // the third colour takes the second element
  else if(res.second&&roll<0.42) r2={...res,second:null,mono:true};  // the second colour drops out
  else if(!res.second&&third&&roll<0.25) r2={...res,second:third,mono:false};
  const base=pickFamily(res.cells).family, fam=R()<0.45?FAM_COUSINS[base][Math.floor(R()*3)]:base;
  const jig=(v,n)=>R()<0.5?v:(v+(R()<0.5?n-1:1))%n;
  const m=hatch(r2,new Date(Math.floor(R()*4e12)),{family:fam,parts:p=>({eyes:jig(p.eyes,7),mouth:jig(p.mouth,5),top:jig(p.top,5),arms:jig(p.arms,5)})});
  // stats wobble a little on top of the new talent roll
  m.stats=m.stats.map(v=>Math.max(10,Math.round(v*(0.92+R()*0.16))));
  const shiny=R()<1/40;
  if(shiny){ const sh=c=>{const [h,sa,v]=rgbToHsv(c);return hsvToRgb([(h+150)%360,sa,v]);}; m.pal={...m.pal,body:sh(m.pal.body),parts:sh(m.pal.parts),accent:sh(m.pal.accent)}; }
  // scaled to the player's monster
  const level=Math.max(1,s.level+[-1,0,0,1][Math.floor(R()*4)]);
  const mine=s.tp.reduce((a,b)=>a+b,0), total=Math.round(mine*(0.7+R()*0.4));
  const focus=Math.floor(R()*6), second=(focus+1+Math.floor(R()*5))%6, tp=[0,0,0,0,0,0];
  for(let k=0;k<total;k++){ const r=R(); tp[r<0.4?focus:r<0.6?second:Math.floor(R()*6)]++; }
  const st={m,tp,stage:s.stage,mark:-1,level,grid:m.grid,pal:m.pal};
  if(s.stage!=="Bit"){ st.mark=focus; let G=addMark(m.grid,focus); if(s.stage==="Mega"){ st.mark2=second; G=addMark(G,second,true); } st.grid=scale2x(G); }
  const fm=fightMon(st), open=m.pool.filter(n=>SKILLS[n].lv<=level);
  const lo=aiLoadout(m,level,R); while(lo.length<slotsFor(st)&&open.some(n=>!lo.includes(n))) lo.push(open.find(n=>!lo.includes(n)));
  return {m,fm,level,skills:lo.filter(Boolean),stage:st.stage,mark:st.mark,earned:total,shiny,famShift:fam!==base,elShift:r2!==res};
}

/* Called by the scan screen when a photo is taken in wild mode. */
function wildCard(res,card){
  const s=WILD.s, R=rng(hashStr(res.photoKey+"|"+Date.now()+"|"+(WILD.seen++)));
  const o=wildFrom(res,s,R); WILD.foe=o;
  const el=o.m.el2?`${o.m.el1} / ${o.m.el2}`:o.m.el1;
  const notes=[o.shiny?"<b style=\"color:#ffd23f\">Rare colours!</b> It pays double.":"",
    o.famShift?"Same colours, but a different family showed up this time.":"", o.elShift?"Its second element shifted with the light.":""].filter(Boolean).join(" ");
  card.innerHTML=`<div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
    <canvas id="wild-spr" style="width:120px;height:120px;image-rendering:pixelated;background:#24242c;border-radius:10px"></canvas>
    <div style="flex:1;min-width:180px"><div style="font-size:12px;opacity:.7">A wild one jumped out</div><h2 style="font-size:22px">${o.fm.name}</h2>
      <div style="font-size:13px;opacity:.75">${el} ${o.m.family}, Lv ${o.level}${o.stage!=="Bit"?", "+o.stage:""}</div>
      <p style="margin-top:4px">${o.m.ability[0]}: ${o.m.ability[1]}.</p>
      <p style="font-size:12px;opacity:.75">Skills: ${o.skills.join(", ")}. ${notes}</p></div></div>
    <p style="font-size:12px;opacity:.7">Scan the same spot again and something else may come out. ${wildLeft(s)} wild fight${wildLeft(s)===1?"":"s"} left this week.</p>
    <div class="brow" style="margin-top:10px"><button class="big" id="wild-go">Fight</button><button class="small" id="wild-run">Run</button><button class="small" id="wild-home">Back to the ranch</button></div>`;
  paint(document.getElementById("wild-spr"),o.fm.grid,o.fm.pal,1);
  document.getElementById("wild-go").onclick=()=>wildFight();
  document.getElementById("wild-run").onclick=()=>{ WILD.foe=null; if(typeof wildRescan==="function") wildRescan(); };
  document.getElementById("wild-home").onclick=()=>{ endWild(); openRanch(); };
  if(typeof musWant==="function") musWant();
}

function wildFight(){
  const s=WILD.s, o=WILD.foe; if(!o) return;
  const why=wildBlock(s); if(why){ endWild(); openRanch(); say(why); return; }
  if(s.wildWeek!==PLAYER.week){ s.wildWeek=PLAYER.week; s.wildCount=0; }
  s.wildCount++;
  WILD.fighting=true;
  arenaFight({s,foe:o,mode:"control",title:o.shiny?"Wild, rare colours":"Wild",learn:true,onEnd:r=>{
    WILD.fighting=false;
    const won=r.winner===0, lines=[];
    s.fatigue=Math.min(100,s.fatigue+(won?6:10));
    if(won){
      const exp=Math.round(3+1.5*o.level), bits=Math.round((5+2*o.level)*(o.shiny?2:1));
      PLAYER.bits+=bits; lines.push(`It beat the wild ${o.fm.name}. ${exp} exp and ${bits} bits.`);
      const lv=giveExp(s,exp); lines.push(...lv);
      if(Math.random()<0.4){ const fd=rollFind(Math.random,o.shiny?2:1); if(fd.item){ addItem(fd.item); lines.push(`It dropped ${/^[AEIOU]/.test(fd.item)?"an":"a"} ${fd.item}.`); } else if(fd.bits){ PLAYER.bits+=fd.bits; lines.push(`It dropped ${fd.bits} more bits.`); } }
    } else lines.push(r.winner===null?"A draw. The wild one wandered off.":"The wild one won and ran off. No harm done, just tired.");
    if(r.learned.length) lines.push(...r.learned);
    WILD.foe=null; endWild(); openRanch(); say(lines.join(" ")); saveGame();
  }});
}
