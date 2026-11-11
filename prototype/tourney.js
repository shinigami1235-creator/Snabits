/* Tournaments the Monster Rancher 2 way: grades E to S, a regular cup each month, official cups in months 3, 6, 9 and 12,
   round robin and elimination formats, a 15-turn limit with judges, and Fight, Auto, Forfeit or Drop out before each match.
   Needs game.js, ranch.js and battle-ui.js. */
const CUP_NAMES={E:["Sprout Cup","Pebble Cup","Puddle Cup"],D:["Ember Cup","Breeze Cup","Clover Cup"],C:["Thunder Cup","Coral Cup","Granite Cup"],
  B:["Iron Cup","Moonlit Cup","Glacier Cup"],A:["Queen's Cup","King's Cup","Sun Cup"],S:["Masters Cup","Monsters Cup","Star Cup"]};
let CUP=null;

function cupsThisWeek(s){
  const mo=Math.floor(PLAYER.week/4)%12, wk=PLAYER.week%4, gi=GRADES.indexOf(s.grade), out=[];
  for(let g=gi;g>=Math.max(0,gi-1);g--){
    const gr=GRADES[g];
    if(wk===0||wk===2) out.push({grade:gr,name:CUP_NAMES[gr][(mo+wk)%3]+` (${gr})`,format:"robin",size:4,official:false});
    if(wk===3&&mo%3===2) out.push({grade:gr,name:`Official ${gr} Cup`,format:"elim",size:8,official:true});
  }
  out.push({grade:s.grade,name:"Exhibition match",format:"single",size:2,official:false,small:true});
  return out;
}
function nextCupText(){
  const w=PLAYER.week; for(let k=1;k<16;k++){ const x=w+k, mo=Math.floor(x/4)%12, wk=x%4; if(wk===3&&mo%3===2) return `The next official cup is in ${k} week${k>1?"s":""}.`; }
  return "";
}
function openCups(){
  const s=RS;
  if(s.sick||s.injured){ say("It isn't fit to fight. Rest it or give it medicine first."); return; }
  const list=cupsThisWeek(s);
  panel(`<div style="flex-basis:100%;font-size:13px">Grade ${s.grade}. ${s.wins} wins, ${s.losses} losses. ${nextCupText()}</div>`+
    list.map((c,i)=>`<button class="rb" data-c="${i}">${c.name}<small>${c.format==="robin"?"Round robin of 4":c.format==="elim"?"Elimination of 8":"One match"}, ${c.small?"small purse":GRADE_INFO[c.grade].purse+" bits for first"}${c.official&&c.grade===s.grade&&s.grade!=="S"?", winning moves it up a grade":""}</small></button>`).join("")+
    `<button class="rb" id="r-cback">Back</button>`);
  el("r-panel").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>startCup(list[+b.dataset.c]));
  el("r-cback").onclick=()=>menu("Out");
}
function startCup(c){
  const s=RS, R=rng(hashStr(s.id+"|cup|"+PLAYER.week+"|"+c.name)), G=GRADE_INFO[c.grade];
  const lvl=()=>clamp(s.level+Math.floor(R()*4)-1,G.lv[0],G.lv[1]);
  const field=[{me:true,name:displayName(s)}];
  while(field.length<c.size){ const o=gradedOpponent(c.grade,lvl(),R); field.push({o,name:o.stage==="Bit"?o.m.name:`${o.m.name}, ${MARK[o.mark][0]} Byte`}); }
  CUP={c,field,R,pts:field.map(()=>0),hp:field.map(()=>0),log:[],round:0,alive:field.map((_,i)=>i),done:false,myWins:0,fights:0,out:false};
  if(c.format==="robin"){ // circle method, 4 entrants, 3 rounds
    const n=c.size, ids=[...Array(n).keys()], rounds=[];
    for(let r=0;r<n-1;r++){ const pairs=[]; for(let k=0;k<n/2;k++) pairs.push([ids[k],ids[n-1-k]]); rounds.push(pairs); ids.splice(1,0,ids.pop()); }
    CUP.rounds=rounds;
  }
  say(`${c.name}. ${field.length} entrants.`);
  nextMatch();
}
function fighterOf(e){ return e.me?null:e.o; }
function simPair(a,b){ // two computer entrants
  const A=CUP.field[a].o, Bo=CUP.field[b].o;
  const f=simFight(makeFighter(A.fm,A.skills,A.level),makeFighter(Bo.fm,Bo.skills,Bo.level),CUP.R,null,15,CUP.c.format!=="robin");
  return f;
}
function nextMatch(){
  const c=CUP.c;
  if(c.format==="robin"){
    if(CUP.round>=CUP.rounds.length) return finishCup();
    const pairs=CUP.rounds[CUP.round], mine=pairs.find(p=>p.includes(0)), opp=mine[0]===0?mine[1]:mine[0];
    for(const [a,b] of pairs){ if(a===0||b===0) continue; const f=simPair(a,b); scoreRobin(a,b,f); }
    return matchCard(opp);
  }
  if(c.format==="single") return CUP.round>0?finishCup():matchCard(1);
  // elimination
  if(CUP.out||CUP.alive.length===1) return finishCup();
  const al=CUP.alive, pairs=[]; for(let k=0;k<al.length;k+=2) pairs.push([al[k],al[k+1]]);
  CUP.pairs=pairs;
  const mine=pairs.find(p=>p.includes(0));
  if(!mine){ // already out: sim the rest
    const next=[]; for(const [a,b] of pairs){ const f=simPair(a,b); next.push(f.winner===0?a:b); } CUP.alive=next; return nextMatch(); }
  return matchCard(mine[0]===0?mine[1]:mine[0]);
}
function scoreRobin(a,b,f){
  if(f.winner===null){ CUP.pts[a]+=1; CUP.pts[b]+=1; } else CUP.pts[f.winner===0?a:b]+=3;
  CUP.hp[a]+=f.p[0].hp/f.p[0].maxhp; CUP.hp[b]+=f.p[1].hp/f.p[1].maxhp;
}
function standings(){
  if(CUP.c.format!=="robin") return "";
  const order=CUP.field.map((e,i)=>i).sort((x,y)=>CUP.pts[y]-CUP.pts[x]||CUP.hp[y]-CUP.hp[x]);
  return `<div style="flex-basis:100%;font-size:12px;opacity:.85">${order.map((i,k)=>`${k+1}. ${CUP.field[i].name} ${CUP.pts[i]} pts`).join(" &nbsp; ")}</div>`;
}
function matchCard(opp){
  const s=RS, e=CUP.field[opp], c=CUP.c;
  const roundName=c.format==="robin"?`Round ${CUP.round+1} of ${CUP.rounds.length}`:c.format==="single"?"The match":["Quarter-final","Semi-final","Final"][CUP.round]||"Final";
  panel(`<div style="flex-basis:100%;font-weight:700">${c.name}: ${roundName}</div>${standings()}
    <div style="flex-basis:100%;font-size:13px">Next: ${e.name}, Lv ${e.o.level}, ${e.o.m.el2?e.o.m.el1+" / "+e.o.m.el2:e.o.m.el1}.</div>
    <button class="rb" id="t-fight">Fight<small>You give the commands</small></button><button class="rb" id="t-auto">Auto<small>It fights on its habits</small></button>
    <button class="rb" id="t-forfeit">Forfeit<small>${c.format==="elim"?"Ends your run":"Gives up this match"}</small></button><button class="rb" id="t-drop">Drop out<small>No prize</small></button>`);
  const go=mode=>arenaFight({s,foe:e.o,mode,title:c.name,noDraw:c.format!=="robin",record:mode==="control",rand:CUP.R,onEnd:res=>afterMatch(opp,res)});
  el("t-fight").onclick=()=>go("control"); el("t-auto").onclick=()=>go("auto");
  el("t-forfeit").onclick=()=>afterMatch(opp,{winner:1,forfeit:true,hpLeft:0,foeHpLeft:1});
  el("t-drop").onclick=()=>{ CUP.dropped=true; finishCup(); };
}
function afterMatch(opp,res){
  const s=RS, c=CUP.c;
  CUP.fights++; if(!res.forfeit){ s.fatigue+=6; s.stress+=2; }
  const won=res.winner===0;
  if(won){ CUP.myWins++; s.wins++; } else if(res.winner===1) s.losses++;
  if(won) CUP.expGain=(CUP.expGain||0)+4+2*CUP.field[opp].o.level;
  if(c.format==="robin"){ const f={winner:res.winner,p:[{hp:res.hpLeft,maxhp:1},{hp:res.foeHpLeft,maxhp:1}]}; scoreRobin(0,opp,f); CUP.round++; }
  else if(c.format==="single"){ CUP.round++; CUP.singleWon=won; }
  else {
    const next=[]; for(const [a,b] of CUP.pairs){ if(a===0||b===0){ next.push(won?0:opp); if(!won) CUP.out=true; } else { const f=simPair(a,b); next.push(f.winner===0?a:b); } }
    CUP.alive=next; CUP.round++;
    if(CUP.out){ while(CUP.alive.length>1){ const al=CUP.alive, nx=[]; for(let k=0;k<al.length;k+=2){ const f=simPair(al[k],al[k+1]); nx.push(f.winner===0?al[k]:al[k+1]); } CUP.alive=nx; } }
  }
  clampAll(); drawUI(); nextMatch();
}
function finishCup(){
  const s=RS, c=CUP.c; let place;
  if(CUP.dropped) place=null;
  else if(c.format==="robin"){ const order=CUP.field.map((e,i)=>i).sort((x,y)=>CUP.pts[y]-CUP.pts[x]||CUP.hp[y]-CUP.hp[x]); place=order.indexOf(0)+1; }
  else if(c.format==="single") place=CUP.singleWon?1:2;
  else place=CUP.alive[0]===0?1:CUP.round>=3?2:CUP.round===2?3:5;
  const purse=c.small?Math.round(GRADE_INFO[c.grade].purse/10):GRADE_INFO[c.grade].purse;
  const prize=place===1?purse:place===2?Math.round(purse/2):place===3?Math.round(purse/4):0;
  const lines=[];
  if(place===null) lines.push(`It dropped out of the ${c.name}.`);
  else if(c.format==="elim"&&place>1) lines.push(`It went out in the ${place===2?"final":place===3?"semi-final":"quarter-final"} of the ${c.name}.`);
  else lines.push(`${place===1?"It won":"It finished "+["","first","second","third","fourth","fifth"][Math.min(place,5)]+" in"} the ${c.name}.`);
  if(prize){ PLAYER.bits+=prize; lines.push(`${prize} bits.`); }
  if(place===1&&!c.small){ s.cups=(s.cups||[]).concat(c.name);
    if(c.official&&c.grade===s.grade&&s.grade!=="S"){ s.grade=GRADES[GRADES.indexOf(s.grade)+1]; lines.push(`It moves up to grade ${s.grade}.`); }
    if((c.grade==="A"||c.grade==="S")&&CUP.R()<0.3){ addItem("Rebirth seed"); lines.push("The prize table had a Rebirth seed."); }
    if(c.grade==="A"&&c.official){ addItem("Life fruit"); lines.push("And a Life fruit."); } }
  const lv=giveExp(s,(CUP.expGain||0)+(place===1?10:3));
  CUP.done=true;
  scene(async()=>{ s.pose=place===1?"happy":"idle"; if(place===1){ spark(s.x,headY()-6,"sparkle",12); await hop(16,420); } await rwait(500); await endWeek(1,lines.concat(lv).join(" ")); });
}
