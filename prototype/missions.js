/* Missions: a board of 3 a week. You watch the trip the way Monster Rancher 2 shows errantry: stop by stop, the monster
   tries a task and succeeds or fails, then a wild monster or the region's boss waits at the end and it fights on its habits.
   The trip costs game weeks. Needs game.js, ranch.js, battle-ui.js and errantry.js. */
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
  panel(`<div class="full lab-head"><b>Missions</b><button class="small" id="r-bback">Back</button></div><div class="full lab-info">You watch each stop. The weeks pass when your monster gets home.</div>`+
    board(s).map((b,i)=>{ const K=KINDS[b.kind], reg=REGIONS.find(x=>x.n===b.reg);
      return `<button class="rb mis" data-b="${i}"><span class="mis-t">${b.kind}<span class="elc" style="${chipStyle(ELC(reg.el))}">${reg.el}</span></span><span class="mis-r">${b.reg}</span><small>${K.stops} stops · ${K.weeks} wk · Lv ${b.level}</small></button>`; }).join(""));
  const bs=board(s);
  el("r-panel").querySelectorAll("[data-b]").forEach(x=>x.onclick=()=>depart(bs[+x.dataset.b]));
  el("r-bback").onclick=()=>menu("Out");
}
function depart(b){ runMission(b); }
function missionStatus(){ menu("Out"); }
function checkReturn(){ const s=RS; if(s&&s.away){ s.away=null; s.hidden=false; } }

/* Works out the whole trip from the mission's seed, so the end fight can be watched again exactly. */
function resolveMission(s,a){
  const R=rng(a.seed), K=KINDS[a.kind], reg=REGIONS.find(x=>x.n===a.reg), grade=s.grade;
  const stops=[], finds=[], learnt=[]; let fat=0, bits=0, exp=0, injured=false;
  const boost=a.kind==="Hunt"?2:1, gap=a.level-s.level;
  for(let i=0;i<K.stops;i++){
    const r=R()*100, task=r<24?"forage":r<36?"climb":r<48?"river":r<58?"tracks":r<66?"haul":r<84?"fight":r<91?"rest":"drill";
    const st={task,ok:true,text:""};
    if(task==="fight"){
      const o=gradedOpponent(grade,Math.max(1,a.level-1),R,reg.el);
      const f=simFight(playerFighter(s),makeFighter(o.fm,o.skills,o.level),R,s); learnt.push(...afterFight(s,f.p[0],true));
      st.ok=f.winner===0; st.foe=o;
      if(st.ok){ const e=2+o.level; exp+=e; st.text=`Beat a wild ${o.m.name}. ${e} exp.`; if(R()<0.3){ const fd=rollFind(R,boost); if(fd.item){ finds.push(fd.item); st.text+=` It dropped ${/^[AEIOU]/.test(fd.item)?"an":"a"} ${fd.item}.`; } else { bits+=fd.bits; st.text+=` It dropped ${fd.bits} bits.`; } } }
      else { fat+=10; st.text=`Lost to a wild ${o.m.name} and limped on.`; }
    } else if(task==="rest"){ fat-=6; st.text="Rested by the fire."; }
    else if(task==="drill"){ st.ok=R()<taskChance(s,reg.st,gap); const g=st.ok?2:1; s.tp[reg.st]+=g; st.text=`Trained on its own. ${STATS[reg.st]} +${g}.`; }
    else {
      st.ok=R()<taskChance(s,TASKS[task].stat,gap);
      if(task==="forage"){ if(st.ok){ const fd=rollFind(R,boost); if(fd.item){ finds.push(fd.item); st.text=`Found ${/^[AEIOU]/.test(fd.item)?"an":"a"} ${fd.item}.`; } else { bits+=fd.bits; st.text=`Found ${fd.bits} bits.`; } } else st.text="Searched the bushes and came up empty."; }
      if(task==="climb"){ if(st.ok){ exp+=3; s.tp[1]+=1; st.text="Climbed the ledge. Power +1, 3 exp."; } else { fat+=8; if(R()*100<K.inj*2){ injured=true; st.text="Slipped off the ledge and got hurt."; } else st.text="Slipped off the ledge."; } }
      if(task==="river"){ if(st.ok){ fat-=3; st.text="Hopped the stones across. A shortcut."; } else { fat+=8; st.text="Fell in and got washed back."; } }
      if(task==="tracks"){ if(st.ok){ s.tp[reg.st]+=2; st.text=`Followed the tracks to a quiet training spot. ${STATS[reg.st]} +2.`; } else { fat+=5; st.text="Lost the trail."; } }
      if(task==="haul"){ if(st.ok){ const b2=Math.round(10+R()*30); bits+=b2; st.text=`Hauled a crate for a trader. ${b2} bits.`; } else { fat+=6; st.text="Couldn't shift the crate."; } }
    }
    stops.push(st);
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
async function runMission(b){
  const s=RS, K=KINDS[b.kind], reg=REGIONS.find(x=>x.n===b.reg);
  if(s.busy) return;
  const res=resolveMission(s,b), foe=endFoe(s,res), snap=fightSnapshot(s);
  // the end fight, worked out now so the scene can show it and it can be watched again
  const f=new Fight(playerFighter(snap),makeFighter(foe.fm,foe.skills,foe.level),rng(res.endSeed+1));
  if(foe.boss){ const bb=f.p[1]; bb.maxhp=Math.round(bb.maxhp*1.25); bb.hp=bb.maxhp; bb.name=foe.boss; }
  while(!f.over&&f.turn<15) f.play(habitPick(f,0,snap),f.aiPick(f.p[1],f.p[0]));
  if(!f.over) judge(f,true);
  const won=f.winner===0;
  res.learnt.push(...afterFight(s,f.p[0],true));
  if(won){ res.exp+=4+2*foe.level;
    if(foe.boss){ const R=rng(res.endSeed+2); let fd=rollFind(R,10); while(!fd.item) fd=rollFind(R,10); res.finds.push(fd.item);
      if(R()<0.05){ const vr=VERY_RARE[Math.floor(R()*2)]; res.finds.push(vr); } } }
  else res.fat+=10;
  res.exp+=K.exp[0]+K.exp[1]*s.level; res.bits+=Math.round(K.bits*(1+s.level/10));
  res.snap=snap;
  await scene(async()=>{
    say(`Off to ${b.reg} for a ${b.kind}.`); s.pose="happy"; await hop(12,380); await walkTo(RW+30,60,"walk");
    s.bg="reg:"+reg.el; s.x=-30;
    await stageCard(b.reg,`${b.kind}: ${K.stops} stops, then the way home.`);
    for(let i=0;i<res.stops.length;i++){
      const st=res.stops[i]; s.tripLabel=`${b.reg} · Stop ${i+1} of ${res.stops.length}`; drawUI();
      banner(`Stop ${i+1} of ${res.stops.length} · ${TASKS[st.task].name}`,"#fff"); await rwait(700); banner("");
      await playTask(st.task,st.ok,{foe:st.foe});
      if(st.task==="rest") { say(st.text); await rwait(900); } else await stageResult(st.ok,st.text);
      if(st.task!=="rest") drawUI();
    }
    s.props=s.props.filter(p=>p.k==="bowl"); s.x=60; s.pose="idle"; s.tripLabel=`${b.reg} · The way home`; drawUI();
    const fp=prop({k:"foe",x:196,y:GROUND,grid:foe.fm.grid,pal:foe.fm.pal});
    banner(foe.boss?foe.boss:"On the way home","#ffd23f"); say(foe.boss?`The boss of ${b.reg} blocks the way.`:`A wild ${foe.m.name} blocks the way home.`); await rwait(1400); banner(""); unprop(fp);
  });
  // the end fight, played out on its habits
  await new Promise(done=>arenaFight({s:snap,foe,mode:"auto",title:foe.boss?"Boss":"Wild",noDraw:true,rand:rng(res.endSeed+1),onEnd:done}));
  s.stageRegions=s.stageRegions||{}; s.stageRegions[b.reg]=(s.stageRegions[b.reg]||0)+K.weeks;
  PLAYER.bits+=res.bits; res.finds.forEach(x=>addItem(x));
  s.fatigue+=Math.max(0,res.fat)+12*K.weeks; s.stress+=3*K.weeks; if(res.injured){ s.injured=true; s.used+=2; }
  const lv=giveExp(s,res.exp);
  await scene(async()=>{
    s.bg="reg:"+reg.el; s.x=60; s.pose=won?"happy":"tired"; if(won){ spark(s.x,headY()-6,"sparkle",8); await hop(14,360); } await rwait(700);
    await walkTo(RW+30,60,"walk"); s.bg=null; s.tripLabel=null; await homeArrive(130); s.pose=won?"happy":"tired"; await rwait(500);
    await endWeek(K.weeks,`Back from ${b.reg}.`);
  });
  showReport(s,b,res,foe,won,lv);
}
function showReport(s,a,res,foe,won,lv){
  const rows=res.stops.map((t,i)=>`<div class="trip-row ${t.ok?"ok":"no"}"><i>${t.task==="rest"?"·":t.ok?"✓":"✕"}</i><span><b>${TASKS[t.task].name}</b> ${t.text}</span></div>`).join("");
  const end=`<div class="trip-row ${won?"ok":"no"}"><i>${won?"✓":"✕"}</i><span><b>${foe.boss||"Way home"}</b> ${foe.boss?"The boss":"A wild "+foe.m.name} ${won?"lost to it.":"beat it."}</span></div>`;
  panel(`<div class="full lab-head"><b>${a.kind} at ${a.reg}</b><button class="small" id="r-rok">Done</button></div><div class="full trip-log">${rows}${end}</div>
    <div class="full lab-info">${res.bits} bits, ${res.exp} exp${res.finds.length?", "+res.finds.join(", "):""}. ${res.learnt.concat(lv).join(" ")}</div>
    <button class="rb full" id="r-watch">Watch the last fight again<small>As it happened</small></button>`);
  el("r-watch").onclick=()=>arenaFight({s:res.snap,foe,mode:"auto",title:foe.boss?"Boss":"Wild",noDraw:true,rand:rng(res.endSeed+1),onEnd:()=>showReport(s,a,res,foe,won,lv)});
  el("r-rok").onclick=()=>menu("Out");
  saveGame();
}
