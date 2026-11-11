/* Skill trips: 4 game weeks in one region, training two stats a week and learning that region's element skills,
   the way errantry worked in Monster Rancher 2. Needs game.js, ranch.js and missions.js. */
const TRIP_STATS={"Cinder Peak":[1,0],"Saffron Dojo":[0,1],"Static Plains":[5,3],"Tanglewood":[0,4],"Glacier Rim":[2,4],"Coral Shallows":[4,2],
  "Nightshade Marsh":[3,5],"Dream Garden":[3,4],"Granite Steps":[2,0],"Dawn Temple":[4,3],"Iron Foundry":[1,2],"Hollow Moor":[5,1],"The Rift":[3,1]};
const TRIP_REGIONS=()=>REGIONS.concat([{n:"The Rift",el:"Void",boss:"Rift Lord"}]);
const NEED=[0,20,80,140];
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
  if(o.some(x=>x.chainOk&&x.score>=x.need)) return "\"It's ready to learn.\"";
  if(o.some(x=>!x.chainOk&&x.score>=x.need)) return "\"There's a technique it can't reach yet.\"";
  if(o.some(x=>x.chainOk&&x.score>=x.need-20)) return "\"Hard work might earn it something.\"";
  return "\"It isn't ready for anything new here.\"";
}
function openTrips(){
  const s=RS;
  if(s.sick||s.injured){ say("It isn't well enough to travel. Rest it or give it medicine first."); return; }
  const regs=TRIP_REGIONS().filter(r=>r.n!=="The Rift"||s.grade==="A"||s.grade==="S");
  panel(`<div style="flex-basis:100%;font-size:13px">A trip takes 4 game weeks and trains two stats each week. The tutor's line says what it might learn.</div>`+
    regs.map((r,i)=>{ const [a,b]=TRIP_STATS[r.n]; return `<button class="rb" data-t="${i}">${r.n}<small>${r.el}, ${STATS[a]} and ${STATS[b]}. ${tutorLine(s,r)}</small></button>`; }).join("")+
    `<button class="rb" id="tr-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>runTrip(regs[+b.dataset.t]));
  el("tr-back").onclick=()=>menu("Out");
}
async function runTrip(reg){
  const s=RS, [main,second]=TRIP_STATS[reg.n], weeks=[], learned=[];
  const max=hearts()>=4?2:1, base=FAMILY[s.m.family].base, rp=k=>RANK_PTS[rankOf(base[k])];
  await scene(async()=>{
    say(`Off to ${reg.n} for 4 weeks.`); s.pose="happy"; await hop(12,380); await walkTo(RW+30,60,"walk");
    s.bg="reg:"+reg.el; s.x=-30;
    await stageCard(reg.n,`Four weeks of training here. ${STATS[main]} first, ${STATS[second]} second.`);
    for(let w=0;w<4;w++){
      const age=ageMult(s);
      const ok=Math.random()*100<Math.min(95,60+8*hearts()-(s.fatigue>50?15:0));
      const a=Math.max(1,Math.round(rp(main)*age*(ok?1:0.5))), b=Math.max(1,Math.round(rp(second)/2*age*(ok?1:0.5)));
      s.tripLabel=`${reg.n} · Week ${w+1} of 4`; drawUI(); banner(`Week ${w+1}`,"#fff"); await rwait(700); banner("");
      await playTask("drill",ok);
      s.tp[main]+=a; s.tp[second]+=b; s.fatigue+=16; s.stress+=8;
      drawUI(); popStat(main,"+"+a); popStat(second,"+"+b);
      let line=`Week ${w+1}: ${STATS[main]} +${a}, ${STATS[second]} +${b}.${ok?"":" A rough week."}`;
      await stageResult(ok,line);
      if(ok){
        s.uses=s.uses||{}; for(const n of knownSkills(s)) if(SKILLS[n].el===reg.el) s.uses[n]=(s.uses[n]||0)+5;
        if(learned.length<max){
          const opts=tripOptions(s,reg).filter(x=>x.chainOk&&x.score>=x.need);
          if(opts.length){ const x=opts[Math.floor(Math.random()*opts.length)], p=Math.min(50,25+Math.floor((x.score-x.need)/4)), got=Math.random()*100<p;
            banner("Special training","#ffd23f"); say(`It's trying ${x.n}.`); await rwait(800); banner("");
            for(let k=0;k<3;k++){ s.pose="effort"; await hop(8,240); spark(s.x+14,headY()+6,k===2&&got?"sparkle":"dust",k===2&&got?8:3); s.pose="idle"; await rwait(260); }
            if(got){ learned.push(x.n); s.skillsKnown=(s.skillsKnown||[]).concat(x.n); bookMark(s,x.n,"learned"); line+=` It learned ${x.n}!`; banner(`Learned ${x.n}!`,"#7dff9a"); s.pose="happy"; await rwait(1300); banner(""); }
            else { line+=` It tried ${x.n} but didn't get it yet.`; banner("Not yet","#ff8a8a"); s.pose="sad"; await rwait(1000); banner(""); }
          }
        }
      }
      weeks.push(line);
      for(const k of [main,second]) for(const [nm,need] of STAT_SKILLS[k]) if(s.tp[k]>=need&&!s.learned.includes(nm)){ s.learned.push(nm); weeks.push(`It learned the stat skill ${nm}.`); }
    }
    s.props=s.props.filter(p=>p.k==="bowl"); await walkTo(RW+30,60,"walk"); s.bg=null; s.tripLabel=null;
    s.stageRegions=s.stageRegions||{}; s.stageRegions[reg.n]=(s.stageRegions[reg.n]||0)+4;
    fixEquip(s); clampAll();
    await homeArrive(140); s.pose=learned.length?"happy":"idle"; if(learned.length) spark(s.x,headY()-6,"sparkle",10); await rwait(600);
    RS.weekAct="Trip"; await endWeek(4,`Back from ${reg.n}.`);
  });
  panel(`<div class="full lab-head"><b>Trip to ${reg.n}</b><button class="small" id="tr-ok">Done</button></div><div class="full trip-log">`+weeks.map(t=>`<div class="trip-row ${/rough/.test(t)?"no":"ok"}"><i>${/rough/.test(t)?"✕":"✓"}</i><span>${t}</span></div>`).join("")+
    `</div><div class="full lab-info">${learned.length?"It learned "+learned.join(" and ")+".":"No new skill this time."}</div>`);
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
      return `<div class="rb" style="text-align:left"><b>${n}${u>=MASTERY?" ★":""}</b><small>${st==="learned"?`Learned. Used ${u} times${u>=MASTERY?", mastered":""}.`:st==="hit"?"It's been hit by this.":"It's seen this used."} ${describe(n)}</small></div>`; }).join("")+
    `<button class="rb" id="bk-back">Back</button>`);
  el("bk-f").onchange=e=>openBook(e.target.value);
  el("bk-back").onclick=()=>{ panel(""); openInfo("skills"); };
}
