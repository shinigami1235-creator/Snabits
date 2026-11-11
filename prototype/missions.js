/* Missions: a board of 3 a week, real-time trips through a region, stops on the way, finds, bosses and an auto-fight at the end.
   Needs game.js, ranch.js and battle-ui.js. */
const REGIONS=[
  {n:"Cinder Peak",el:"Blaze",st:1,boss:"Ember Warden"},{n:"Saffron Dojo",el:"Brawl",st:0,boss:"Old Master"},
  {n:"Static Plains",el:"Spark",st:5,boss:"Storm Herder"},{n:"Tanglewood",el:"Wild",st:0,boss:"Briar King"},
  {n:"Glacier Rim",el:"Frost",st:2,boss:"Frost Matron"},{n:"Coral Shallows",el:"Tide",st:4,boss:"Reef Keeper"},
  {n:"Nightshade Marsh",el:"Venom",st:3,boss:"Bog Witch"},{n:"Dream Garden",el:"Charm",st:3,boss:"Dream Queen"},
  {n:"Granite Steps",el:"Stone",st:2,boss:"Stone Sentinel"},{n:"Dawn Temple",el:"Light",st:4,boss:"Dawn Guardian"},
  {n:"Iron Foundry",el:"Steel",st:1,boss:"The Foreman"},{n:"Hollow Moor",el:"Shade",st:5,boss:"Moor Shade"},
];
const KINDS={Scout:{h:1,stops:3,weeks:1,up:0,boss:0.1,inj:2,exp:[8,1],bits:20},Gather:{h:4,stops:5,weeks:2,up:2,boss:0.1,inj:5,exp:[16,2],bits:60},Hunt:{h:8,stops:8,weeks:3,up:4,boss:0.25,inj:8,exp:[30,3],bits:140}};

function board(s){
  const r=rng(hashStr(s.id+"|"+PLAYER.week)), home=REGIONS.find(x=>x.el===s.m.el1)||REGIONS[0];
  const others=REGIONS.filter(x=>x!==home), pick=[home];
  while(pick.length<3){ const x=others[Math.floor(r()*others.length)]; if(!pick.includes(x)) pick.push(x); }
  const kinds=["Scout","Gather","Hunt"];
  return pick.map((reg,i)=>{ const kind=kinds[(i+Math.floor(r()*3))%3]; return {reg:reg.n,kind,level:Math.max(1,s.level+Math.floor(r()*4)-1),seed:Math.floor(r()*1e9)}; });
}
function openBoard(){
  const s=RS;
  if(s.sick||s.injured){ say("It isn't well enough to go out. Rest it or give it medicine first."); return; }
  panel(`<div style="flex-basis:100%;font-size:13px">This week's board. Missions run in real time and use game weeks when it gets back.</div>`+
    board(s).map((b,i)=>{ const K=KINDS[b.kind], reg=REGIONS.find(x=>x.n===b.reg);
      return `<button class="rb" data-b="${i}">${b.kind} at ${b.reg}<small>${K.h} hour${K.h>1?"s":""}, ${K.weeks} week${K.weeks>1?"s":""}, Lv ${b.level}, ${reg.el}</small></button>`; }).join("")+
    `<button class="rb" id="r-bback">Back</button>`);
  const bs=board(s);
  el("r-panel").querySelectorAll("[data-b]").forEach(x=>x.onclick=()=>depart(bs[+x.dataset.b]));
  el("r-bback").onclick=()=>menu("Out");
}
async function depart(b){
  await scene(async()=>{ const s=RS, K=KINDS[b.kind];
    say(`Off to ${b.reg} for a ${b.kind}.`); s.pose="happy"; await hop(12,380);
    await walkTo(-30,60,"walk"); s.hidden=true;
    s.away={...b,start:Date.now(),ms:K.h*3600e3};
  });
  s_after();
}
function s_after(){ RS.x=150; drawUI(); menu("Out"); saveGame(); }
function missionStatus(){
  const s=RS, a=s.away, left=Math.max(0,a.start+a.ms-Date.now());
  const mins=Math.ceil(left/60000), txt=mins>=60?`${Math.floor(mins/60)} h ${mins%60} min`:`${mins} min`;
  panel(`<div style="flex-basis:100%;font-size:13px">Out on a ${a.kind} at ${a.reg}. Back in ${txt}.</div><button class="rb" id="r-now">Bring it back now<small>Prototype only, to test without waiting</small></button>`);
  el("r-now").onclick=()=>{ a.ms=0; checkReturn(true); };
}
function checkReturn(force){
  const s=RS; if(!s||!s.away) { if(s) s.hidden=false; return; }
  s.hidden=true;
  if(!force&&Date.now()<s.away.start+s.away.ms) return;
  if(s.busy) return;
  returnFromMission();
}

/* Works out the whole trip from the mission's seed, so the end fight can be watched again exactly. */
function resolveMission(s,a){
  const R=rng(a.seed), K=KINDS[a.kind], reg=REGIONS.find(x=>x.n===a.reg), grade=s.grade;
  const stops=[], finds=[], learnt=[]; let fat=0, bits=0, exp=0, injured=false;
  const boost=a.kind==="Hunt"?2:1;
  for(let i=0;i<K.stops;i++){
    const r=R()*100;
    if(r<40){ const f=rollFind(R,boost); if(f.bits){ bits+=f.bits; stops.push(`Found ${f.bits} bits.`); } else { finds.push(f.item); stops.push(`Found ${/^[AEIOU]/.test(f.item)?"an":"a"} ${f.item}.`); } }
    else if(r<60){ const o=gradedOpponent(grade,Math.max(1,a.level-1),R,reg.el), me=fightMon(s);
      const f=simFight(playerFighter(s),makeFighter(o.fm,o.skills,o.level),R,s); learnt.push(...afterFight(s,f.p[0],true));
      if(f.winner===0){ const e=2+o.level; exp+=e; let t=`Beat a wild ${o.m.name}.`; if(R()<0.3){ const fd=rollFind(R,boost); if(fd.item){ finds.push(fd.item); t+=` It dropped ${/^[AEIOU]/.test(fd.item)?"an":"a"} ${fd.item}.`; } else bits+=fd.bits; } stops.push(t); }
      else { fat+=10; stops.push(`Lost to a wild ${o.m.name} and limped on.`); } }
    else if(r<75){ s.tp[reg.st]+=2; stops.push(`Trained at a quiet spot. ${STATS[reg.st]} +2.`); }
    else if(r<85){ fat-=5; stops.push("Rested by a stream."); }
    else if(r<95){ fat+=10; if(R()*100<K.inj){ injured=true; stops.push("Took a bad fall and got hurt."); } else stops.push("Got lost for a while."); }
    else stops.push(R()<0.5?"Saw strange tracks. Something rare lives around here.":"Heard about a photo that hatches something special at dusk.");
  }
  const boss=R()<K.boss;
  const endLv=a.level+(boss?2:K.up), endSeed=Math.floor(R()*1e9);
  return {stops,finds,learnt,fat,bits,exp,injured,boss:boss?reg.boss:null,endLv,endSeed,regEl:reg.el};
}
function endFoe(s,res){
  const R=rng(res.endSeed), G=GRADE_INFO[s.grade], o=gradedOpponent(s.grade,res.endLv,R,res.regEl,res.boss?G.earned[1]:null);
  if(res.boss){ o.boss=res.boss; const open=o.m.pool.filter(n=>SKILLS[n].lv<=o.level); o.skills=open.slice(-4);
    const G=o.m.grid.map(r=>r.slice()); let ty=20; for(let y=0;y<20;y++) for(let x=0;x<20;x++) if(G[y][x]===1) ty=Math.min(ty,y);
    const cy=Math.max(2,ty); for(let x=7;x<=12;x++){ G[cy-1][x]=11; } G[cy-2][7]=G[cy-2][9]=G[cy-2][10]=G[cy-2][12]=11; G[cy-1][9]=G[cy-1][10]=5;
    o.fm={...o.fm,grid:scale2x(G),name:res.boss}; }
  return o;
}
async function returnFromMission(){
  const s=RS, a=s.away, K=KINDS[a.kind];
  const res=resolveMission(s,a), foe=endFoe(s,res), snap=fightSnapshot(s);
  const me=fightMon(snap), fr=rng(res.endSeed+1);
  const f=new Fight(playerFighter(snap),makeFighter(foe.fm,foe.skills,foe.level),fr);
  if(foe.boss){ const b=f.p[1]; b.maxhp=Math.round(b.maxhp*1.25); b.hp=b.maxhp; b.name=foe.boss; }
  while(!f.over&&f.turn<15) f.play(habitPick(f,0,snap),f.aiPick(f.p[1],f.p[0]));
  if(!f.over) judge(f,true);
  const won=f.winner===0;
  res.learnt.push(...afterFight(s,f.p[0],true));
  if(won){ const e=4+2*foe.level; res.exp+=e;
    if(foe.boss){ const R=rng(res.endSeed+2); let fd=rollFind(R,10); while(!fd.item) fd=rollFind(R,10); res.finds.push(fd.item);
      if(R()<0.05){ const vr=VERY_RARE[Math.floor(R()*2)]; res.finds.push(vr); } } }
  else res.fat+=10;
  res.exp+=K.exp[0]+K.exp[1]*s.level; res.bits+=Math.round(K.bits*(1+s.level/10));
  s.away=null; s.hidden=false; s.stageRegions=s.stageRegions||{}; s.stageRegions[a.reg]=(s.stageRegions[a.reg]||0)+K.weeks;
  // apply
  PLAYER.bits+=res.bits; res.finds.forEach(x=>addItem(x));
  s.fatigue+=Math.max(0,res.fat)+12*K.weeks; s.stress+=3*K.weeks; if(res.injured){ s.injured=true; s.used+=2; }
  const lv=giveExp(s,res.exp);
  res.snap=snap;
  await scene(async()=>{
    s.x=-30; s.hidden=false; await walkTo(130,55,"walk"); s.pose=won?"happy":"tired"; await rwait(600);
    await endWeek(K.weeks,`Back from ${a.reg}.`);
  });
  showReport(s,a,res,foe,won,lv);
}
function showReport(s,a,res,foe,won,lv){
  const rows=res.stops.map((t,i)=>`<div style="flex-basis:100%;font-size:13px">${i+1}. ${t}</div>`).join("");
  const end=`${res.stops.length+1}. ${foe.boss?`The boss, ${foe.boss}, was waiting at the end.`:`A wild ${foe.m.name} blocked the way home.`} ${won?"It won.":"It lost."}`;
  panel(`<div style="flex-basis:100%;font-weight:700">${a.kind} at ${a.reg}</div>${rows}<div style="flex-basis:100%;font-size:13px">${end}</div>
    <div style="flex-basis:100%;font-size:13px;opacity:.85">${res.bits} bits, ${res.exp} exp${res.finds.length?", "+res.finds.join(", "):""}. ${res.learnt.concat(lv).join(" ")}</div>
    <button class="rb" id="r-watch">Watch the last fight<small>As it happened</small></button><button class="rb" id="r-rok">Done</button>`);
  el("r-watch").onclick=()=>arenaFight({s:res.snap,foe,mode:"auto",title:foe.boss?"Boss":"Wild",noDraw:true,rand:rng(res.endSeed+1),onEnd:()=>showReport(s,a,res,foe,won,lv)});
  el("r-rok").onclick=()=>menu("Out");
  saveGame();
}
