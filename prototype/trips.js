/* Skill trips: 4 game weeks in one region, training two stats a week and learning that region's element skills,
   the way errantry worked in Monster Rancher 2. Needs game.js, ranch.js and missions.js. */
const TRIP_STATS={"Cinder Peak":[1,0],"Saffron Dojo":[0,1],"Static Plains":[5,3],"Tanglewood":[0,4],"Glacier Rim":[2,4],"Coral Shallows":[4,2],
  "Nightshade Marsh":[3,5],"Dream Garden":[3,4],"Granite Steps":[2,0],"Dawn Temple":[4,3],"Iron Foundry":[1,2],"Hollow Moor":[5,1],"The Rift":[3,1]};
const TRIP_REGIONS=()=>REGIONS.concat([{n:"The Rift",el:"Void",boss:"Rift Lord"}]);
const NEED=[0,20,80,140];
/* Kiko's fee, the way MR2's errantries cost 2,000G: about four E cup purses, and The Rift costs more */
const tripCost=reg=>reg.n==="The Rift"?3000:800;
const atkStatOf=n=>{ const k=SKILLS[n].kind; return k==="Strike"?1:k==="Cast"?3:4; };
function chainBefore(n){ // the skill before this one in its element's chain
  const sk=SKILLS[n]; if(tierOf(n)<2) return null;
  const line=Object.keys(SKILLS).filter(k=>SKILLS[k].el===sk.el&&SKILLS[k].fromStat===undefined).sort((a,b)=>SKILLS[a].lv-SKILLS[b].lv);
  const i=line.indexOf(n); return i>0?line[i-1]:null;
}
function tripOptions(s,reg){
  const [main]=TRIP_STATS[reg.n], known=knownSkills(s), loy=loyalty();
  const out=[];
  for(const n of Object.keys(SKILLS)){
    const sk=SKILLS[n]; if(sk.el!==reg.el||sk.fromStat!==undefined||known.includes(n)) continue;
    const inPool=s.m.pool.includes(n);
    if(!inPool&&!canLearnOutside(s,n,"trip")) continue;
    const own=sk.el===s.m.el1||sk.el===s.m.el2, t=tierOf(n);
    const need=NEED[t]+(!own&&t===2?40:0), score=s.tp[atkStatOf(n)]+s.tp[main]+loy;
    const prev=chainBefore(n), chainOk=!prev||(known.includes(prev)&&((s.uses||{})[prev]||0)>=CHAIN_USES);
    out.push({n,need,score,chainOk,t});
  }
  return out;
}
function tutorLine(s,reg){
  const o=tripOptions(s,reg);
  if(o.some(x=>x.chainOk&&x.score>=x.need)) return "Kiko: \"It's ready to learn a skill here.\"";
  if(o.some(x=>!x.chainOk&&x.score>=x.need)) return "Kiko: \"There's a skill here it can't reach until it masters an easier one.\"";
  if(o.some(x=>x.chainOk&&x.score>=x.need-20)) return "Kiko: \"It could learn something here if it trains hard.\"";
  return "Kiko: \"It isn't ready to learn anything new here.\"";
}
function openTrips(){
  const s=RS;
  if(s.sick||s.injured){ say("It isn't well enough to travel. Rest it or give it medicine first."); return; }
  const regs=TRIP_REGIONS().filter((r,i)=>r.n==="The Rift"?(s.grade==="A"||s.grade==="S"):i<tripRegionCount());   // more regions open as the ranch climbs the grades
  panel(`<div style="flex-basis:100%;font-size:13px">Kiko takes it to one region for 4 weeks and trains two stats each week, for ${tripCost({}).toLocaleString()} bits a trip. Under each region he says whether it can learn a skill there.</div>`+
    regs.map((r,i)=>{ const [a,b]=TRIP_STATS[r.n]; return `<button class="rb" data-t="${i}">${r.n} · ${tripCost(r).toLocaleString()} bits<small>${r.el}, ${STATS[a]} and ${STATS[b]}. ${tutorLine(s,r)}</small></button>`; }).join("")+
    `<button class="rb" id="tr-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{ const r=regs[+b.dataset.t], cost=tripCost(r);
    if(PLAYER.bits<cost){ say(`I charge ${cost.toLocaleString()} bits for ${r.n}, and you have ${PLAYER.bits.toLocaleString()}.`,"guide"); return; }
    PLAYER.bits-=cost; drawUI(); runTrip(r); });
  el("tr-back").onclick=()=>menu("Out");
}
const NIGHT_LINES=["{n} is fast asleep. We'll start training again in the morning.","{n} fell asleep by the fire. We start again at sunrise.","{n} is tired out from today. Tomorrow starts the last week."];
async function runTrip(reg){
  const s=RS, [main,second]=TRIP_STATS[reg.n], weeks=[], learned=[];
  const max=hearts()>=4?2:1, base=FAMILY[s.m.family].base, rp=k=>RANK_PTS[rankOf(base[k])], gain=[0,0];
  await scene(async()=>{
    const nm=s.m.name, K=n=>say(n,"guide");
    await tripLeave(`Kiko is here to take ${nm} to ${reg.n}. They'll train there for four weeks.`);
    await tripArrive(reg.el);
    s.tripLabel=`${reg.n} · Week 1 of 4`; drawUI();
    await stageCard(reg.n,`We'll train ${STATS[main]} the most here, and ${STATS[second]} a little too.`,"guide");
    const areas=TRIP_AREAS[reg.el], tName=TEACHER[reg.el][0], tThe=/^The /.test(tName)?tName:"the "+tName, Cap=t=>t[0].toUpperCase()+t.slice(1), lc=t=>t[0].toLowerCase()+t.slice(1);
    let teacher=null, okWeeks=0;
    for(let w=0;w<4;w++){
      const age=ageMult(s), A=areas[w], [tn,kind,stat]=A.tasks[Math.floor(Math.random()*A.tasks.length)];
      let pc=Math.min(95,60+8*hearts()-(s.fatigue>50?15:0))/100; if(stat>=0) pc=(pc+taskChance(s,stat))/2;
      const ok=Math.random()<pc; if(ok) okWeeks++;
      const a=Math.max(1,Math.round(rp(main)*age*(ok?1:0.5))), b=Math.max(1,Math.round(rp(second)/2*age*(ok?1:0.5)));
      s.tripLabel=`${A.name} · Week ${w+1} of 4`; drawUI(); banner(A.name,"#fff");
      if(kind==="lesson"){ teacher=prop({k:"teacher",el:reg.el,x:186,y:GROUND,keep:true}); K(`${Cap(tThe)} lives up here and will train ${nm} this week.`); }
      else K(`${nm}, ${lc(tn)}.`);
      await rwait(900); banner("");
      await playTask(kind,ok,{look:A.look,fall:FALLER[reg.el],teacher});
      s.tp[main]+=a; s.tp[second]+=b; gain[0]+=a; gain[1]+=b; s.fatigue+=Math.round(14*tireMul(s)); s.stress+=6;   // four weeks of this brings it home worn out, and one full rest puts it right
      drawUI(); popStat(main,"+"+a); popStat(second,"+"+b);
      let line=`Week ${w+1}, ${A.name}: ${STATS[main]} +${a}, ${STATS[second]} +${b}.${ok?"":" It was a rough week."}`;
      await stageResult(ok,ok?`That was a good week. ${STATS[main]} went up by ${a} and ${STATS[second]} by ${b}.`:`That was a rough week, so ${STATS[main]} only went up by ${a} and ${STATS[second]} by ${b}.`,"guide");
      if(ok){
        s.uses=s.uses||{}; for(const n of knownSkills(s)) if(SKILLS[n].el===reg.el) s.uses[n]=(s.uses[n]||0)+5;
        if(learned.length<max){
          const opts=tripOptions(s,reg).filter(x=>x.chainOk&&x.score>=x.need);
          if(opts.length){ const x=opts[Math.floor(Math.random()*opts.length)], p=Math.min(60,25+Math.floor((x.score-x.need)/4)+(teacher?10:0)), got=Math.random()*100<p;
            banner("Special training","#ffd23f"); K(teacher?`${Cap(tThe)} will show ${nm} how to do ${x.n}.`:`Let's try ${x.n} this week.`); if(s.guide) s.guide.pose="point"; await rwait(900); banner("");
            for(let k=0;k<3;k++){ s.pose="effort"; await hop(8,240); spark(s.x+14,headY()+6,k===2&&got?"sparkle":"dust",k===2&&got?8:3); s.pose="idle"; await rwait(260); }
            if(s.guide) s.guide.pose="stand";
            if(got){ learned.push(x.n); s.skillsKnown=(s.skillsKnown||[]).concat(x.n); bookMark(s,x.n,"learned"); line+=` It learned ${x.n}.`; banner(`Learned ${x.n}!`,"#7dff9a"); if(s.guide) s.guide.face="surprised"; K(`Well done! ${nm} has learned ${x.n}.`); s.pose="happy"; await rwait(1500); banner(""); if(s.guide) s.guide.face="talk"; }
            else { line+=` It tried ${x.n} and couldn't get it yet.`; banner("Not yet","#ff8a8a"); K(`${nm} couldn't get ${x.n} this time.`); s.pose="sad"; await rwait(1200); banner(""); }
          }
        }
      }
      weeks.push(line);
      for(const k of [main,second]) for(const [nm2,need] of STAT_SKILLS[k]) if(s.tp[k]>=need&&!s.learned.includes(nm2)){ s.learned.push(nm2); weeks.push(`It learned the stat skill ${nm2}.`); }
      if(w<3){ const next=async()=>{ await showRoute(reg.el,w+1); s.bg=`area:${reg.el}:${areas[w+1].key}`; s.camJump=true; };
        if(kikoOn()) await campNight(`${A.name} · Night ${w+1}`,NIGHT_LINES[w].replace("{n}",nm),next);
        else { await sceneFade(true,500); await next(); await sceneFade(false,500); } }
    }
    s.stageRegions=s.stageRegions||{}; s.stageRegions[reg.n]=(s.stageRegions[reg.n]||0)+4;
    fixEquip(s); clampAll();
    /* MR2's strays: after a good trip a wild Snabit of the region may pick a fight on the last day. It fights on its own,
       and a win brings home a reward. Now and then it's the region's champion, tougher and worth twice as much. */
    if(okWeeks>=3&&Math.random()<0.6){
      const champ=Math.random()<0.15, foe=gradedOpponent(s.grade,Math.max(1,s.level||1),Math.random,reg.el),
        prize=Math.round(Math.max(300,GRADE_INFO[s.grade].purse*0.75)*(champ?2:1));
      if(champ) foe.boss=`${reg.n} Champion`;
      const fp=prop({k:"foe",x:196,y:GROUND,grid:foe.fm.grid,pal:foe.fm.pal,fm:foe.fm});
      banner(champ?foe.boss:"A stray","#ffd23f");
      K(champ?`That's the strongest Snabit in ${reg.n}. Beat it and there's ${prize.toLocaleString()} bits in it.`:`A stray ${foe.m.name} wants a fight. Strays carry a ${prize.toLocaleString()} bit reward.`);
      await rwait(1800); banner("");
      await sceneFade(true,400); let won=false;
      await new Promise(done=>arenaFight({s:fightSnapshot(s),foe,mode:"auto",title:champ?"Boss":"Wild",noDraw:true,onEnd:r=>{ won=!!(r&&r.winner===0); done(); }}));
      unprop(fp); s.trip=true; s.camJump=true; s.pose=won?"happy":"tired"; await sceneFade(false,500);
      if(won){ PLAYER.bits+=prize; drawUI(); spark(s.x,headY()-6,"sparkle",8); await hop(14,360); K(`${nm} won, and that's ${prize.toLocaleString()} bits.`); weeks.push(`On the last day it beat ${champ?`the ${foe.boss}`:`a stray ${foe.m.name}`} and brought home ${prize.toLocaleString()} bits.`); }
      else { K(`The stray was too much for ${nm} this time.`); weeks.push(`On the last day a stray ${foe.m.name} beat it.`); }
      await rwait(1200);
    }
    await tripHome(`That's the end of the four weeks. Time to take ${nm} home.`,`We're back at the ranch. ${nm} worked hard, so give it a good rest.`,learned.length?"happy":"idle");
    if(learned.length) spark(s.x,headY()-6,"sparkle",10); await rwait(400);
    RS.weekAct="Trip"; await endWeek(4,`Welcome back, ${nm}! Its ${STATS[main]} went up by ${gain[0]} and its ${STATS[second]} by ${gain[1]}${learned.length?`, and it learned ${learned.join(" and ")}`:""}.`);
  });
  panel(`<div class="full lab-head"><b>Trip to ${reg.n}</b><button class="small" id="tr-ok">Done</button></div><div class="full trip-log">`+weeks.map(t=>`<div class="trip-row ${/rough/.test(t)?"no":"ok"}"><i>${/rough/.test(t)?"✕":"✓"}</i><span>${t}</span></div>`).join("")+
    `</div><div class="full lab-info">${learned.length?"It learned "+learned.join(" and ")+".":"It didn't learn a new skill this time."}</div>`);
  el("tr-ok").onclick=()=>menu("Out"); saveGame();
}

/* The Skill book: every skill this monster has learned, seen or been hit by, with a hint for the rest. */
function bookHint(n){
  const sk=SKILLS[n];
  if(sk.fromStat!==undefined){ const need=STAT_SKILLS[sk.fromStat].find(x=>x[0]===n)[1]; return `A monster with a lot of ${STATS[sk.fromStat]} training knows this one (${need}).`; }
  if(sk.el==="Void") return "Only the Rift teaches this one.";
  const reg=TRIP_REGIONS().find(r=>r.el===sk.el), t=tierOf(n);
  return `${sk.el} monsters learn it at level ${sk.lv}${reg?`, and the tutor at ${reg.n} teaches it`:""}${t===1?". Anyone can learn it.":"."}`;
}
function openBook(filter){
  const s=RS, book=s.book||{}; for(const n of knownSkills(s)) book[n]="learned"; s.book=book;
  const els=["Stat","Neutral","Blaze","Brawl","Spark","Wild","Frost","Tide","Venom","Charm","Stone","Light","Steel","Shade","Void"];
  const f=filter||"Stat";
  const list=Object.keys(SKILLS).filter(n=>{ const sk=SKILLS[n]; return f==="Stat"?sk.fromStat!==undefined:f==="Neutral"?!sk.el&&sk.fromStat===undefined:sk.el===f; });
  const got=Object.keys(book).length, total=Object.keys(SKILLS).length;
  panel(`<div style="flex-basis:100%;font-size:13px">Skill book: ${got} of ${total} found. <select id="bk-f">${els.map(e=>`<option ${e===f?"selected":""}>${e}</option>`).join("")}</select></div>`+
    list.map(n=>{ const st=book[n], u=(s.uses||{})[n]||0;
      if(!st) return `<div class="rb" style="text-align:left;opacity:.7"><b>???</b><small>${bookHint(n)}</small></div>`;
      return `<div class="rb" style="text-align:left"><b>${skillLabelOf(s,n)}${u>=MASTERY?" ★":""}</b><small>${st==="learned"?`Learned. Used ${u} times${u>=MASTERY?", mastered":""}.`:st==="hit"?"It's been hit by this.":"It's seen this used."} ${describe(n)}</small></div>`; }).join("")+
    `<button class="rb" id="bk-back">Back</button>`);
  el("bk-f").onchange=e=>openBook(e.target.value);
  el("bk-back").onclick=()=>{ panel(""); openInfo("skills"); };
}
