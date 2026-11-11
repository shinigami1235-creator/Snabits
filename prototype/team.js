/* Team battle: a special 6 on 6 mode, Pokémon style, for fully trained Snabits (Mega form, or past their prime).
   Switching takes your turn; a knocked-out monster is replaced for free. Needs battle.js, battle-ui.js, game.js and ranch.js. */
const TEAM_SIZE=6;

class TeamFight extends Fight{
  constructor(ta,tb,rand){ super(ta[0],tb[0],rand); this.teams=[ta,tb]; this.team=true; this.need=[]; }
  bench(i){ return this.teams[i].map((f,j)=>({f,j})).filter(x=>x.f!==this.p[i]&&x.f.hp>0); }
  left(i){ return this.teams[i].filter(f=>f.hp>0).length; }
  /* Undertow: while the opponent is above half HP, the monster facing it can't switch out. */
  canSwitch(i){ const me=this.p[i], foe=this.p[1-i];
    if(me.charging||!this.bench(i).length) return false;
    return !(foe.ability==="Undertow"&&foe.hp>foe.maxhp/2&&me.hp>0); }
  swapIn(i,j){
    const out=this.p[i], inn=this.teams[i][j];
    if(out.hp>0){
      for(const k in out.stage) out.stage[k]=0; out.charging=null; out.taunt=0; out.guard=false;
      if(out.ability==="Halo"&&out.hp<out.maxhp){ const h=Math.round(out.maxhp/8); out.hp=Math.min(out.maxhp,out.hp+h); this.pop(i,"Halo"); this.events.push({t:"heal",who:i,amt:h}); }
      this.say(`${out.name} comes back.`);
    }
    this.p[i]=inn; inn.freshIn=true;
    this.events.push({t:"switch",who:i,j,hp:inn.hp}); this.say(`${inn.name} goes in.`);
    if(inn.ability==="Beguile"&&this.p[1-i].hp>0){ this.pop(i,"Beguile"); this.say(`${inn.name}'s Beguile charms ${this.p[1-i].name}.`); this.stageChange(this.p[1-i],{pow:-1},true); }
  }
  play(a,b){ const ev=super.play(a,b); this.settle(); return ev; }
  /* A knockout only ends the fight when that side has nobody left. */
  settle(){
    if(!this.over) return;
    const down=[0,1].filter(k=>this.p[k].hp<=0), out=down.filter(k=>!this.bench(k).length);
    if(out.length){ this.winner=out.length===2?null:1-out[0]; return; }
    this.over=false; this.winner=null; this.need=down;
  }
  replace(i,j){ this.events=[]; this.swapIn(i,j); this.need=this.need.filter(k=>k!==i); return this.events; }
  /* The computer sends in whoever hits the monster in front of it hardest, weighted by how much HP it has left. */
  aiNext(i){
    const foe=this.p[1-i]; let best=null, bs=-1;
    for(const {f,j} of this.bench(i)){
      const sc=Math.max(1,...f.skills.filter(s=>s.power).map(s=>effect(s.el,foe)))*(0.5+f.hp/f.maxhp);
      if(sc>bs){ bs=sc; best=j; }
    }
    return best;
  }
}

/* Every roster monster as a ranch state, so fights use its trained stats, gear and skills. */
function rosterStates(){ return PLAYER.roster.filter(e=>e.st||(RS&&RS.id===e.id)).map(e=>RS&&RS.id===e.id?RS:newRanch(e)); }
const fullyTrained=s=>s.stage==="Mega"||agePhase(s)[2]==="Veteran";
function teamReady(){ return rosterStates().filter(fullyTrained); }

function openTeam(){
  const ready=teamReady();
  if(ready.length<TEAM_SIZE){
    panel(`<div class="full lab-head"><b>Team battle</b><button class="small" id="tm-back">Back</button></div>
      <div class="full lab-info">Team battle is 6 on 6 and opens once you have 6 fully trained Snabits, which means Mega form or past their prime. You have ${ready.length}.</div>
      ${ready.map(s=>`<div class="rb full tm-row"><b>${displayName(s)}</b><small>Lv ${s.level} · ${s.stage==="Mega"?"Mega":"Veteran"}</small></div>`).join("")}`);
    el("tm-back").onclick=()=>menu("Out"); return;
  }
  const ids=new Set(ready.map(s=>s.id));
  TM.pick=(PLAYER.team||[]).filter(id=>ids.has(id)).slice(0,TEAM_SIZE); TM.ready=ready;
  drawTeamPick();
}
const TM={pick:[],ready:[],foes:null};
function drawTeamPick(){
  const n=TM.pick.length;
  panel(`<div class="full lab-head"><b>Team battle · ${n} of ${TEAM_SIZE}</b><button class="small" id="tm-back">Back</button></div>
    <div class="full lab-info">Pick 6. The first one you pick leads. Switching takes a turn, and a knocked-out monster is replaced for free.</div>
    ${TM.ready.map(s=>{ const k=TM.pick.indexOf(s.id); return `<button class="rb tm-pick ${k>=0?"on":""}" data-id="${s.id}"><span class="tm-n">${k>=0?k+1:""}</span><b>${displayName(s)}</b><small>Lv ${s.level} · ${s.m.el1}${s.m.el2?" / "+s.m.el2:""} · ${s.stage==="Mega"?"Mega":"Veteran"}</small></button>`; }).join("")}
    <button class="big full" id="tm-find" ${n===TEAM_SIZE?"":"disabled"}>Find a team</button>`);
  el("tm-back").onclick=()=>menu("Out");
  el("r-panel").querySelectorAll(".tm-pick").forEach(b=>b.onclick=()=>{ const id=b.dataset.id, k=TM.pick.indexOf(id);
    if(k>=0) TM.pick.splice(k,1); else if(TM.pick.length<TEAM_SIZE) TM.pick.push(id); drawTeamPick(); });
  el("tm-find").onclick=findTeam;
}
function teamOf(ids){ return ids.map(id=>TM.ready.find(s=>s.id===id)); }
function findTeam(){
  PLAYER.team=TM.pick.slice(); saveGame();
  const mine=teamOf(TM.pick), lv=Math.round(mine.reduce((a,s)=>a+s.level,0)/mine.length);
  const grade=GRADES[Math.max(...mine.map(s=>GRADES.indexOf(s.grade)))], R=Math.random;
  TM.foes=Array.from({length:TEAM_SIZE},()=>gradedOpponent(grade,Math.max(1,lv+Math.floor(R()*3)-1),R));
  TM.grade=grade; TM.lv=lv;
  const prize=teamPrize();
  panel(`<div class="full lab-head"><b>Their team</b><button class="small" id="tm-back">Back</button></div>
    <div class="full lab-info">A grade ${grade} team at about Lv ${lv}. ${prize?`Your first win this week pays ${prize} bits.`:"You've had this week's prize, so this one's for practice."}</div>
    ${TM.foes.map(o=>`<div class="rb tm-row"><b>${o.fm.name}</b><small>Lv ${o.level} · ${o.m.el1}${o.m.el2?" / "+o.m.el2:""} · ${o.m.family}</small></div>`).join("")}
    <button class="btn2" id="tm-other">Another team</button><button class="big" id="tm-go">Fight</button>`);
  el("tm-back").onclick=drawTeamPick; el("tm-other").onclick=findTeam; el("tm-go").onclick=()=>teamFight(mine,TM.foes);
}
const teamPrize=()=>PLAYER.teamWeek===PLAYER.week?0:500*(GRADES.indexOf(TM.grade||"E")+1);

function teamFight(mine,foes){
  const ta=mine.map(playerFighter), tb=foes.map(o=>makeFighter(o.fm,o.skills,o.level));
  const fight=new TeamFight(ta,tb);
  B={fight,team:true,busy:false,fast:false,shown:fight.p.map(f=>f.hp),cur:fight.p.slice(),mus:"cup",opts:{team:true}};
  $("arena").className="cup"; if(typeof stadiumBg==="function") stadiumBg($("b-bg"));
  $("battle").style.display="flex"; $("loadout").style.display="none"; $("b-fight").style.display="flex"; $("b-fight").classList.remove("done");
  teamSprite(0); teamSprite(1);
  $("b-log").innerHTML=""; $("b-result").style.display="none";
  logLine(`Team battle, 6 on 6. ${ta[0].name} leads for you and ${tb[0].name} for them.`);
  drawPanels(); drawButtons();
}
function teamSprite(who,f){ f=f||B.fight.p[who]; const c=$(who===0?"b-me-sprite":"b-foe-sprite"); paintSprite(c,f.m); c.className="bsprite"; }

/* Called from afterTurn: replacements after a knockout, then the end of the fight. */
async function teamAfter(){
  const f=B.fight;
  if(f.over){ endTeam(); return; }
  if(f.need.includes(1)){ B.busy=true; await playEvents(f,f.replace(1,f.aiNext(1))); B.busy=false; B.shown=f.p.map(x=>x.hp); B.cur=f.p.slice(); drawPanels(); }
  if(f.need.includes(0)){ benchMenu(true); return; }
  drawButtons();
}
/* The bench: forced after a knockout, or chosen as this turn's move. */
function benchMenu(forced){
  const f=B.fight;
  $("b-btns").innerHTML=`<div class="tm-ask">${forced?`${f.p[0].name} is down. Who goes in?`:"Switch takes this turn."}</div>`+
    f.bench(0).map(({f:x,j})=>`<button class="bbtn" data-j="${j}" style="--c:${ELC(x.el1)}"><b>${x.name}</b><small>${x.hp}/${x.maxhp} HP · ${x.el1}${x.el2?" / "+x.el2:""}${x.status?" · "+x.status.name:""}</small></button>`).join("")+
    (forced?"":`<button class="bbtn" data-back="1" style="--c:#888"><b>Back</b><small>Pick a move instead</small></button>`);
  $("b-btns").querySelectorAll("[data-j]").forEach(b=>b.onclick=async()=>{
    const j=+b.dataset.j;
    if(!forced){ pick(SWITCH0-j); return; }
    B.busy=true; await playEvents(f,f.replace(0,j)); B.busy=false; B.shown=f.p.map(x=>x.hp); B.cur=f.p.slice(); drawPanels(); drawButtons();
  });
  const bk=$("b-btns").querySelector("[data-back]"); if(bk) bk.onclick=drawButtons;
}
function endTeam(){
  const f=B.fight, won=f.winner===0, draw=f.winner===null, prize=won?teamPrize():0;
  if(prize){ PLAYER.bits+=prize; PLAYER.teamWeek=PLAYER.week; }
  PLAYER.teamWins=(PLAYER.teamWins||0)+(won?1:0); saveGame();
  $("b-btns").innerHTML="";
  $("b-result").innerHTML=`<h2>${draw?"Draw":won?"You win":"You lose"}</h2><p>${won?`${f.left(0)} of your 6 still standing after ${f.turn} turns.`:draw?`Both teams went down in ${f.turn} turns.`:`They had ${f.left(1)} left after ${f.turn} turns.`}${prize?` ${prize} bits.`:""}</p><div class="brow"><button class="big" id="b-cont">Continue</button></div>`;
  $("b-result").style.display="block"; $("b-fight").classList.add("done");
  if(typeof musJingle==="function"&&!draw) musJingle(won);
  $("b-cont").onclick=()=>{ $("battle").style.display="none"; B=null; if(typeof drawUI==="function") drawUI(); openTeam(); };
}
