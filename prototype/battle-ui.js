/* Loadout and fight screens for the prototype. Needs skills.js, monster.js and battle.js. */
let B=null, LO=null;
const $=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const STATUS_COL={Burn:"#e2483f",Crack:"#8a5a2b",Shock:"#f2cf2b",Root:"#4da83c",Freeze:"#6fd6d0",Soak:"#2f6fd8",Poison:"#8a4fe0",Daze:"#f07ab4",Blind:"#f4f4f4",Curse:"#55556a",Dread:"#26215c"};
const ELC=e=>e?(COL[Object.keys(EL).find(k=>EL[k]===e)]||"#888"):"#888";
const SLOTS=2;

/* Loadout: pick 2 skills from the monster's pool before the fight. */
function openBattle(mon){
  const level=LO&&LO.mon===mon?LO.level:20;
  const open=mon.pool.filter(n=>SKILLS[n].lv<=level);
  LO={mon,level,picked:(LO&&LO.mon===mon?LO.picked:mon.skills).filter(n=>open.includes(n)).slice(0,SLOTS)};
  $("battle").style.display="flex"; $("b-fight").style.display="none"; $("loadout").style.display="flex";
  drawLoadout();
}
function drawLoadout(){
  const {mon,level,picked}=LO;
  $("lo-head").innerHTML=`<h2>${mon.name}</h2><div style="font-size:13px;opacity:.75">${mon.el2?mon.el1+" / "+mon.el2:mon.el1} ${mon.family}. Ability: ${mon.ability[0]}.</div>
    <div class="brow" style="margin-top:8px">${[10,20,30].map(l=>`<button class="lvl ${l===level?"on":""}" data-l="${l}">Lv ${l}</button>`).join("")}<span style="font-size:12px;opacity:.7">Pick ${SLOTS} skills. Bit forms have ${SLOTS} slots.</span></div>`;
  $("lo-list").innerHTML=mon.pool.map(n=>{const s=SKILLS[n], locked=s.lv>level, on=picked.includes(n);
    return `<button class="lo ${on?"on":""}" data-n="${n}" ${locked?"disabled":""} style="border-color:${on?ELC(s.el):"#333"}">
      <b>${n}</b> <span class="bchip" style="background:${ELC(s.el)}">${s.el||"Neutral"}</span> <small>${s.kind}, ${s.cost} energy${locked?`, learns at Lv ${s.lv}`:""}</small><br><small>${(d=>d[0].toUpperCase()+d.slice(1))(describe(n))}</small></button>`;}).join("");
  $("lo-go").disabled=picked.length!==SLOTS;
  $("lo-head").querySelectorAll(".lvl").forEach(b=>b.onclick=()=>{LO.level=+b.dataset.l; LO.picked=LO.picked.filter(n=>SKILLS[n].lv<=LO.level); drawLoadout();});
  $("lo-list").querySelectorAll(".lo").forEach(b=>b.onclick=()=>{const n=b.dataset.n, i=LO.picked.indexOf(n);
    if(i>=0) LO.picked.splice(i,1); else { if(LO.picked.length>=SLOTS) LO.picked.shift(); LO.picked.push(n); } drawLoadout();});
}
function startFight(opp){
  const {mon,level,picked}=LO; LEVEL=level;
  opp=opp||randomOpponent();
  const fight=new Fight(makeFighter(mon,picked,level),makeFighter(opp,aiLoadout(opp,level),level));
  B={fight,mon,opp,busy:false,shown:fight.p.map(f=>f.hp)};
  paint($("b-me-sprite"),mon.grid,mon.pal,1); paint($("b-foe-sprite"),opp.grid,opp.pal,1);
  ["me","foe"].forEach(k=>{$("b-"+k+"-sprite").className="bsprite";});
  $("b-log").innerHTML=""; $("b-result").style.display="none";
  $("loadout").style.display="none"; $("b-fight").style.display="flex";
  logLine(`A wild ${opp.name} appears. Its skills are ${fight.p[1].skills.map(s=>s.name).join(" and ")}.`);
  drawPanels(); drawButtons();
}
function closeBattle(){ $("battle").style.display="none"; B=null; }

function chips(f){ return `<span class="bchip" style="background:${ELC(f.el1)}">${f.el1}</span>`+(f.el2?`<span class="bchip" style="background:${ELC(f.el2)}">${f.el2}</span>`:""); }
function drawPanels(){
  B.fight.p.forEach((f,i)=>{
    const k=i===0?"me":"foe", hp=B.shown[i], pct=Math.max(0,100*hp/f.maxhp);
    $("b-"+k+"-name").innerHTML=`${f.name} <small>Lv ${f.level}</small> ${chips(f)}<div class="abl">${f.ability}</div>`;
    $("b-"+k+"-hp").style.width=pct+"%";
    $("b-"+k+"-hp").style.background=pct>50?"#4dd36a":pct>20?"#f2c12b":"#e2483f";
    $("b-"+k+"-hpt").textContent=`${Math.max(0,Math.round(hp))} / ${f.maxhp}`;
    $("b-"+k+"-en").innerHTML=Array.from({length:10},(_,j)=>`<i class="${j<f.energy?"on":""}"></i>`).join("");
    const st=f.status;
    let tags=st?`<span class="bchip" style="background:${STATUS_COL[st.name]};color:${["Shock","Blind","Freeze"].includes(st.name)?"#111":"#fff"}">${st.name}</span>`:"";
    if(f.charging) tags+=` <span class="bchip" style="background:#5ab0ff;color:#111">Charging</span>`;
    if(f.taunt) tags+=` <span class="bchip" style="background:#a33">Taunted</span>`;
    const stages=Object.entries(f.stage).filter(([,v])=>v).map(([k2,v])=>`${({pow:"Pow",grd:"Grd",mnd:"Mnd",spr:"Spr",spd:"Spd"})[k2]} ${v>0?"+":""}${v}`).join(" ");
    $("b-"+k+"-st").innerHTML=tags+(stages?` <small>${stages}</small>`:"");
  });
  const fd=B.fight.field; $("b-field").textContent=fd?`${fd.name} field, ${fd.turns} turns left`:"";
}
function drawButtons(){
  const me=B.fight.p[0], foe=B.fight.p[1];
  const btn=(id,label,sub,color,ok,arrow)=>`<button class="bbtn" data-id="${id}" ${ok?"":"disabled"} style="border-color:${color}"><b>${label}${arrow}</b><small>${sub}</small></button>`;
  let h;
  if(me.charging){ h=btn(RELEASE,`Release ${me.charging.name}`,"It fires this turn","#5ab0ff",true,""); $("b-btns").innerHTML=h; }
  else{
    const bk=basicFor(me);
    h=btn(BASIC,"Attack",`Free, +1 energy, uses ${bk.kind==="Cast"?"Mind":"Power"}`,"#888",true,"");
    me.skills.forEach((s,i)=>{
      const c=costOf(me,s), m=s.power?effect(s.el,foe):1;
      const arrow=!s.power?"":m===0?' <span style="color:#999">✕</span>':m>1?' <span style="color:#4dd36a">▲</span>':m<1?' <span style="color:#e2483f">▼</span>':"";
      const blocked=(me.taunt&&(s.kind==="Support"||s.kind==="Field"))||(s.protect&&me.protectLast);
      h+=btn(i,s.name,`${c} energy. ${(d=>d?d[0].toUpperCase()+d.slice(1):"")(describe(s.name))}`,ELC(s.el),c<=me.energy&&!blocked,arrow);
    });
    h+=btn(GUARD,"Guard","Half damage, +2 energy","#888",true,"");
    $("b-btns").innerHTML=h;
  }
  $("b-btns").querySelectorAll("button").forEach(b=>b.onclick=()=>pick(+b.dataset.id));
}
function logLine(t){ const d=document.createElement("div"); d.textContent=t; $("b-log").appendChild(d); while($("b-log").children.length>4) $("b-log").firstChild.remove(); }
function popup(who,text,color,big){
  const s=$(who===0?"b-me-sprite":"b-foe-sprite"), r=s.getBoundingClientRect(), a=$("arena").getBoundingClientRect();
  const p=document.createElement("div"); p.className="bpop"+(big?" ab":""); p.textContent=text; p.style.color=color;
  p.style.left=(r.left-a.left+r.width/2)+"px"; p.style.top=(r.top-a.top+(big?-6:10))+"px"; $("arena").appendChild(p);
  requestAnimationFrame(()=>{p.style.transform="translate(-50%,-40px)";p.style.opacity="0";});
  setTimeout(()=>p.remove(),1000);
}
function bump(who,cls){ const s=$(who===0?"b-me-sprite":"b-foe-sprite"); s.classList.remove(cls); void s.offsetWidth; s.classList.add(cls); }

const bw=ms=>B&&B.fast?Promise.resolve():wait(ms);
async function pick(id){
  if(!B||B.busy||B.fight.over) return;
  if(B.net){ netPick(id); return; }
  B.busy=true; if(!(B.opts&&B.opts.auto)) $("b-btns").classList.add("busy");
  const f=B.fight, ai=B.opts&&B.opts.foeHabits?habitPick(f,1,B.opts.foeHabits):f.aiPick(f.p[1],f.p[0]);
  if(B.opts&&B.opts.record) recordHabit(B.opts.record,f,id);
  const ev=f.play(id,ai);
  if(B.opts&&!f.over&&f.turn>=B.opts.turnLimit){ judge(f,B.opts.noDraw); ev.push({t:"log",text:f.log[f.log.length-1]}); }
  await playEvents(f,ev);
  afterTurn();
}
/* Plays a turn's events on screen. Live friend rooms call this with the events the host sent. */
async function playEvents(f,ev){
  for(const e of ev){
    if(e.t==="log"){ logLine(e.text); await bw(260); }
    if(e.t==="ability"){ popup(e.who,e.name,"#ffd23f",true); await bw(380); }
    if(e.t==="hit"){ B.shown[e.who]=Math.max(0,B.shown[e.who]-e.dmg); bump(e.who,"bhit"); popup(e.who,`-${e.dmg}${e.eff>1?"!":""}`,e.crit||e.eff>1?"#ffd23f":e.eff<1?"#9aa":"#fff"); drawPanels(); await bw(380); }
    if(e.t==="heal"){ B.shown[e.who]=Math.min(f.p[e.who].maxhp,B.shown[e.who]+e.amt); popup(e.who,`+${e.amt}`,"#4dd36a"); drawPanels(); await bw(300); }
    if(e.t==="miss"){ popup(e.who,"miss","#9aa"); await bw(300); }
    if(e.t==="guard"){ bump(e.who,"bguard"); await bw(200); }
    if(e.t==="cast"){ bump(e.who,"bcast"); await bw(250); }
    if(e.t==="status"){ popup(e.who,e.name,STATUS_COL[e.name]); await bw(300); }
    if(e.t==="ko"){ $(e.who===0?"b-me-sprite":"b-foe-sprite").classList.add("bko"); await bw(700); }
  }
}
function afterTurn(){
  const f=B.fight;
  B.shown=f.p.map(x=>x.hp); drawPanels(); if(!(B.opts&&B.opts.auto)) drawButtons();
  $("b-btns").classList.remove("busy"); B.busy=false;
  if(f.over&&B.net){ netEnd(); return; }
  if(B.net){ return; }
  if(f.over&&B.opts){ endArena(); return; }
  if(B.opts&&B.opts.auto){ autoStep(); return; }
  if(f.over){
    const won=f.winner===0, draw=f.winner===null;
    $("b-result").innerHTML=`<h2>${draw?"Draw":won?"You win":"You lose"}</h2><p>${draw?"Both monsters broke into pixels":won?`${f.p[1].name} broke into pixels`:`${f.p[0].name} broke into pixels and rebuilds after the fight`} in ${f.turn} turns.</p>
      <div class="brow"><button class="big" id="b-again">Rematch</button><button class="small" id="b-new">New opponent</button><button class="small" id="b-skills">Change skills</button><button class="small" id="b-back">Back to scan</button></div>`;
    $("b-result").style.display="block";
    $("b-again").onclick=()=>startFight(B.opp);
    $("b-new").onclick=()=>startFight();
    $("b-skills").onclick=()=>openBattle(B.mon);
    $("b-back").onclick=closeBattle;
  }
}

/* Arena fights for the ranch: tournaments, missions and practice. mode "control" gives the player the buttons, "auto" plays on the monster's habits. */
function arenaFight({s,foe,mode="control",title="",turnLimit=15,noDraw=false,record=false,learn=false,foeHabits=null,rand=Math.random,onEnd}){
  const me=fightMon(s); if(record) s.fightNo=(s.fightNo||0)+1;
  const fight=new Fight(playerFighter(s),foe.fighter||makeFighter(foe.fm,foe.skills,foe.level),rand);
  if(foe.boss){ const b=fight.p[1]; b.maxhp=Math.round(b.maxhp*1.25); b.hp=b.maxhp; b.name=foe.boss; }
  B={fight,mon:me,opp:foe.fm,busy:false,fast:false,shown:fight.p.map(f=>f.hp),opts:{s,turnLimit,noDraw,learn,foeHabits,record:record?s:null,auto:mode==="auto",onEnd}};
  $("battle").style.display="flex"; $("loadout").style.display="none"; $("b-fight").style.display="flex";
  paint($("b-me-sprite"),me.grid,me.pal,1); paint($("b-foe-sprite"),foe.fm.grid,foe.fm.pal,1);
  ["me","foe"].forEach(k=>{$("b-"+k+"-sprite").className="bsprite";});
  $("b-log").innerHTML=""; $("b-result").style.display="none";
  logLine(`${title?title+". ":""}${fight.p[1].name}, Lv ${foe.level}. Its skills are ${fight.p[1].skills.map(x=>x.name).join(", ")}.`);
  if(fight.p[0].monocle){ const o=fight.p[1]; logLine(`Monocle: HP ${o.maxhp}, Power ${o.base.pow}, Guard ${o.base.grd}, Mind ${o.base.mnd}, Spirit ${o.base.spr}, Speed ${o.base.spd}.`); }
  drawPanels();
  if(B.opts.auto) autoStep(); else drawButtons();
}
function autoStep(){
  const f=B.fight;
  if(!$("b-fast")){ $("b-btns").innerHTML=`<div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center"><span style="opacity:.8">Auto. It fights on its habits.</span><button class="small" id="b-fast">Skip ▸▸</button></div>`;
    $("b-fast").onclick=()=>{ B.fast=true; }; }
  $("b-btns").classList.remove("busy");
  setTimeout(()=>{ if(B&&!B.fight.over) pick(habitPick(f,0,B.opts.s)); }, B.fast?0:450);
}
function endArena(){
  const f=B.fight, o=B.opts, won=f.winner===0, draw=f.winner===null;
  $("b-btns").innerHTML="";
  $("b-result").innerHTML=`<h2>${draw?"Draw":won?"Win":"Loss"}</h2><p>${f.judged?"The judges called it after "+f.turn+" turns.":`${won?f.p[1].name:f.p[0].name} broke into pixels in ${f.turn} turns.`}</p><div class="brow"><button class="big" id="b-cont">Continue</button></div>`;
  $("b-result").style.display="block";
  const learned=o.learn?afterFight(o.s,f.p[0],true):[]; if(learned.length) $("b-result").querySelector("p").textContent+=" "+learned.join(" ");
  $("b-cont").onclick=()=>{ const res={winner:f.winner,turns:f.turn,judged:!!f.judged,hpLeft:f.p[0].hp/f.p[0].maxhp,foeHpLeft:f.p[1].hp/f.p[1].maxhp,learned};
    $("battle").style.display="none"; B=null; if(o.onEnd) o.onEnd(res); };
}
