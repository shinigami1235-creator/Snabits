/* Battle screen for the fight prototype. */
let B=null;
const $=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const STATUS_COL={Burn:"#e2483f",Crack:"#8a5a2b",Shock:"#f2cf2b",Root:"#4da83c",Freeze:"#6fd6d0",Soak:"#2f6fd8",Poison:"#8a4fe0",Daze:"#f07ab4",Blind:"#f4f4f4",Curse:"#55556a"};
const ELC=e=>COL[Object.keys(EL).find(k=>EL[k]===e)]||"#888";

function openBattle(mon,opp){
  opp=opp||randomOpponent();
  const fight=new Fight(makeFighter(mon),makeFighter(opp));
  B={fight,mon,opp,busy:false,shown:fight.p.map(f=>f.hp)};
  paint($("b-me-sprite"),mon.grid,mon.pal,1);
  paint($("b-foe-sprite"),opp.grid,opp.pal,1);
  ["me","foe"].forEach(k=>{$("b-"+k+"-sprite").className="bsprite";});
  $("b-log").innerHTML=""; $("b-result").style.display="none";
  logLine(`A wild ${opp.name} appears.`);
  $("battle").style.display="flex";
  drawPanels(); drawButtons();
}
function closeBattle(){ $("battle").style.display="none"; B=null; }

function chips(f){ return `<span class="bchip" style="background:${ELC(f.el1)}">${f.el1}</span>`+(f.el2?`<span class="bchip" style="background:${ELC(f.el2)}">${f.el2}</span>`:""); }
function drawPanels(){
  B.fight.p.forEach((f,i)=>{
    const k=i===0?"me":"foe", hp=B.shown[i], pct=Math.max(0,100*hp/f.maxhp);
    $("b-"+k+"-name").innerHTML=`${f.name} <small>Lv ${LEVEL}</small> ${chips(f)}`;
    $("b-"+k+"-hp").style.width=pct+"%";
    $("b-"+k+"-hp").style.background=pct>50?"#4dd36a":pct>20?"#f2c12b":"#e2483f";
    $("b-"+k+"-hpt").textContent=`${Math.max(0,Math.round(hp))} / ${f.maxhp}`;
    $("b-"+k+"-en").innerHTML=Array.from({length:10},(_,j)=>`<i class="${j<f.energy?"on":""}"></i>`).join("");
    const st=f.status; $("b-"+k+"-st").innerHTML=st?`<span class="bchip" style="background:${STATUS_COL[st.name]};color:${["Shock","Blind","Freeze"].includes(st.name)?"#111":"#fff"}">${st.name}</span>`:"";
    const stages=Object.entries(f.stage).filter(([,v])=>v).map(([k2,v])=>`${({pow:"Pow",grd:"Grd",mnd:"Mnd",spr:"Spr",spd:"Spd"})[k2]} ${v>0?"+":""}${v}`).join(" ");
    $("b-"+k+"-st").innerHTML+=stages?` <small>${stages}</small>`:"";
  });
  const fd=B.fight.field; $("b-field").textContent=fd?`${fd.name} field, ${fd.turns} turns left`:"";
}
function drawButtons(){
  const me=B.fight.p[0], foe=B.fight.p[1];
  const btn=(id,label,sub,color,ok,arrow)=>`<button class="bbtn" data-id="${id}" ${ok?"":"disabled"} style="border-color:${color}"><b>${label}${arrow}</b><small>${sub}</small></button>`;
  let h=btn(-1,"Attack","Free, +1 energy","#888",true,"");
  me.skills.forEach((s,i)=>{
    const c=costOf(me,s), m=s.power?effect(s.el,foe):1;
    const arrow=!s.power?"":m===0?' <span style="color:#999">✕</span>':m>1?' <span style="color:#4dd36a">▲</span>':m<1?' <span style="color:#e2483f">▼</span>':"";
    h+=btn(i,s.name,`${s.el} ${s.kind}, ${c} energy`,ELC(s.el),c<=me.energy,arrow);
  });
  h+=btn(-2,"Guard","Half damage, +2 energy","#888",true,"");
  $("b-btns").innerHTML=h;
  $("b-btns").querySelectorAll("button").forEach(b=>b.onclick=()=>pick(+b.dataset.id));
}
function logLine(t){ const d=document.createElement("div"); d.textContent=t; $("b-log").appendChild(d); while($("b-log").children.length>4) $("b-log").firstChild.remove(); }
function popup(who,text,color){
  const s=$(who===0?"b-me-sprite":"b-foe-sprite"), r=s.getBoundingClientRect(), a=$("arena").getBoundingClientRect();
  const p=document.createElement("div"); p.className="bpop"; p.textContent=text; p.style.color=color;
  p.style.left=(r.left-a.left+r.width/2)+"px"; p.style.top=(r.top-a.top+10)+"px"; $("arena").appendChild(p);
  requestAnimationFrame(()=>{p.style.transform="translate(-50%,-40px)";p.style.opacity="0";});
  setTimeout(()=>p.remove(),900);
}
function bump(who,cls){ const s=$(who===0?"b-me-sprite":"b-foe-sprite"); s.classList.remove(cls); void s.offsetWidth; s.classList.add(cls); }

async function pick(id){
  if(!B||B.busy||B.fight.over) return;
  B.busy=true; $("b-btns").classList.add("busy");
  const f=B.fight, ai=f.aiPick(f.p[1],f.p[0]);
  const ev=f.play(id,ai);
  for(const e of ev){
    if(e.t==="log"){ logLine(e.text); await wait(260); }
    if(e.t==="hit"){ B.shown[e.who]-=e.dmg; bump(e.who,"bhit"); popup(e.who,`-${e.dmg}${e.eff>1?"!":""}`,e.crit?"#ffd23f":e.eff>1?"#ffd23f":e.eff<1?"#9aa":"#fff"); drawPanels(); await wait(420); }
    if(e.t==="heal"){ B.shown[e.who]+=e.amt; popup(e.who,`+${e.amt}`,"#4dd36a"); drawPanels(); await wait(300); }
    if(e.t==="miss"){ popup(e.who,"miss","#9aa"); await wait(300); }
    if(e.t==="guard"){ bump(e.who,"bguard"); await wait(200); }
    if(e.t==="cast"){ bump(e.who,"bcast"); await wait(250); }
    if(e.t==="status"){ popup(e.who,e.name,STATUS_COL[e.name]); await wait(300); }
    if(e.t==="ko"){ $(e.who===0?"b-me-sprite":"b-foe-sprite").classList.add("bko"); await wait(700); }
  }
  B.shown=f.p.map(x=>x.hp); drawPanels(); drawButtons();
  $("b-btns").classList.remove("busy"); B.busy=false;
  if(f.over){
    const won=f.winner===0;
    $("b-result").innerHTML=`<h2>${won?"You win":"You lose"}</h2><p>${won?`${f.p[1].name} broke into pixels`:`${f.p[0].name} broke into pixels and rebuilds after the fight`} in ${f.turn} turns.</p>
      <div class="brow"><button class="big" id="b-again">Rematch</button><button class="small" id="b-new">New opponent</button><button class="small" id="b-back">Back to scan</button></div>`;
    $("b-result").style.display="block";
    $("b-again").onclick=()=>openBattle(B.mon,B.opp);
    $("b-new").onclick=()=>openBattle(B.mon);
    $("b-back").onclick=closeBattle;
  }
}
