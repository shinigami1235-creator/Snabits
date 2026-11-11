/* Snabits fight engine: skills, abilities, energy, statuses, fields and the element chart. Needs skills.js. */
const HARD={Blaze:["Wild","Frost","Steel"],Brawl:["Stone","Steel","Frost"],Spark:["Tide","Steel"],Wild:["Tide","Stone"],Frost:["Wild","Stone"],Tide:["Blaze","Stone","Steel"],Venom:["Wild","Light","Brawl"],Charm:["Brawl","Venom","Void"],Stone:["Spark","Blaze","Venom"],Light:["Shade","Venom","Void"],Steel:["Frost","Charm","Shade"],Shade:["Charm","Spark","Shade"],Void:["Charm","Light"]};
const SOFT={Blaze:["Tide","Stone","Blaze","Void"],Brawl:["Charm","Venom"],Spark:["Wild","Spark","Void"],Wild:["Blaze","Steel","Venom","Wild","Void"],Frost:["Blaze","Tide","Steel","Frost"],Tide:["Wild","Tide","Frost","Void"],Venom:["Stone","Venom","Shade"],Charm:["Steel","Stone","Charm"],Stone:["Wild","Steel","Brawl","Stone"],Light:["Wild","Steel","Light"],Steel:["Blaze","Tide","Steel"],Shade:["Light","Steel"],Void:["Void"]};
const IMMUNE={Brawl:["Shade"],Spark:["Stone"],Venom:["Steel"]};
function vs(a,d){ if(!a||!d) return 1; if((IMMUNE[a]||[]).includes(d)) return 0; if(HARD[a].includes(d)) return 1.5; if(SOFT[a].includes(d)) return 0.67; return 1; }
function effect(el,def){ return el?vs(el,def.el1)*(def.el2?vs(el,def.el2):1):1; }
const FIELD_FX={Sunlit:{Blaze:1.3,Tide:0.8},Rain:{Tide:1.3,Blaze:0.8},Static:{Spark:1.3},Snow:{Frost:1.3,Blaze:0.8},Moonlit:{Shade:1.3,Void:1.3}};
let LEVEL=20;
const GUARD=-2, BASIC=-1, RELEASE=-3, SWITCH0=-10; // SWITCH0-j sends in team slot j (team fights only)
const BASIC_SKILL={name:"Attack",el:null,kind:"Strike",power:40,acc:100,basic:true};
/* The basic attack uses whichever of Power or Mind is higher, so Mind monsters aren't stuck with weak basics. */
function basicFor(f){ return f.base.mnd>f.base.pow?{...BASIC_SKILL,kind:"Cast"}:BASIC_SKILL; }

function makeFighter(m,loadout,level=LEVEL){
  const s=m.stats, fl=m.flat||[0,0,0,0,0,0], st=i=>Math.floor(s[i]*level/50+5+fl[i]);
  const maxhp=Math.floor(s[0]*2*level/50+3*level+30+fl[0]*2);
  const names=(loadout||m.skills);
  return {m,name:m.name,el1:m.el1,el2:m.el2,mono:m.mono,ability:m.ability[0],level,maxhp,hp:maxhp,energy:3,
    base:{pow:st(1),grd:st(2),mnd:st(3),spr:st(4),spd:st(5)},stage:{pow:0,grd:0,mnd:0,spr:0,spd:0},
    status:null,guard:false,protect:false,protectLast:false,counter:false,charging:null,hitWhileCharging:false,
    regen:0,mirror:false,sleep:false,taunt:0,lastSkill:null,thawed:false,firstHitTaken:false,lastStand:false,unseen:false,
    skills:names.map(n=>({name:n,...SKILLS[n]}))};
}
function stageMul(n){ return n>=0?1+0.25*n:[1,0.8,0.67,0.57][-n]; }
function costOf(f,sk){ return sk.cost+(f.status&&f.status.name==="Curse"?1:0); }

class Fight{
  constructor(a,b,rand=Math.random){ this.p=[a,b]; this.field=null; this.turn=0; this.rand=rand; this.events=[]; this.over=false; this.winner=null; this.log=[]; }
  say(t){ this.log.push(t); this.events.push({t:"log",text:t}); }
  pop(i,name){ this.events.push({t:"ability",who:i,name}); }
  idx(f){ return this.p.indexOf(f); }
  eff(f,k,opts={}){
    let st=f.stage[k]; if(opts.pierce&&st>0) st=0;
    let v=f.base[k]*stageMul(st);
    if(k==="pow"&&f.status&&f.status.name==="Burn") v*=0.75;
    if(k==="grd"&&f.status&&f.status.name==="Crack") v*=0.75;
    if(k==="spd"&&f.status&&f.status.name==="Soak") v*=0.75;
    if(k==="spd"&&f.ability==="Rain Dancer"&&this.field&&this.field.name==="Rain") v*=1.5;
    if(k==="mnd"&&f.ability==="Night-born"&&this.field&&this.field.name==="Moonlit") v*=1.2;
    return v;
  }
  options(f){
    const o=[{id:BASIC,label:"Attack"},{id:GUARD,label:"Guard"}];
    f.skills.forEach((s,i)=>{ if(costOf(f,s)<=f.energy) o.push({id:i,label:s.name}); });
    return o;
  }
  /* stat stages with Defiant, Unbreakable and Mirror Mind */
  stageChange(f,changes,fromFoe){
    const i=this.idx(f), foe=this.p[1-i];
    for(const [k,n] of Object.entries(changes)){
      if(n<0&&fromFoe&&f.bulwark){ this.say(`${f.name}'s Bulwark holds.`); continue; }
      if(n<0&&k==="grd"&&f.ability==="Unbreakable"){ this.pop(i,"Unbreakable"); this.say(`${f.name}'s Guard can't be lowered.`); continue; }
      const before=f.stage[k]; f.stage[k]=Math.max(-3,Math.min(3,f.stage[k]+n));
      if(f.stage[k]===before) continue;
      this.say(`${f.name}'s ${STAT_NAME[k]} ${n>0?"rises":"falls"}${Math.abs(n)>1?" sharply":""}.`);
      if(n<0&&fromFoe&&f.ability==="Defiant"&&f.stage.pow<3){ f.stage.pow++; this.pop(i,"Defiant"); this.say(`Defiant raises ${f.name}'s Power.`); }
      if(n>0&&foe.ability==="Mirror Mind"&&foe.hp>0){ foe.stage[k]=Math.min(3,foe.stage[k]+n); this.pop(1-i,"Mirror Mind"); this.say(`${foe.name} copies the boost.`); }
    }
  }
  inflict(f,name,fromIdx){
    const i=this.idx(f);
    if(f.hp<=0||f.status) return false;
    if(f.statusBlock){ this.say(`${f.name} stays calm and shrugs it off.`); return false; }
    if(f.ability==="Sanctuary"&&f.hp===f.maxhp){ this.pop(i,"Sanctuary"); return false; }
    if(name==="Crack"&&f.ability==="Unbreakable"){ this.pop(i,"Unbreakable"); return false; }
    if(name==="Freeze"&&f.thawed) return false;
    if(name==="Poison"&&(f.el1==="Steel"||f.el2==="Steel")&&!(fromIdx!=null&&this.p[fromIdx].ability==="Corrosion")){ this.say(`${f.name} is made of metal and can't be poisoned.`); return false; }
    const wild=fromIdx!=null&&this.p[fromIdx].ability==="Wildfire";
    f.status={name,turns:name==="Freeze"?1:3,from:fromIdx,wild};
    this.say(`${f.name} is hit with ${name}.`); this.events.push({t:"status",who:i,name}); return true;
  }
  aiPick(me,foe){
    if(me.charging) return RELEASE;
    const R=this.rand; const bk=basicFor(me), bs=bk.kind==="Cast"?this.eff(me,"mnd")/this.eff(foe,"spr"):this.eff(me,"pow")/this.eff(foe,"grd"); let best={id:BASIC,score:40*bs+(me.energy<4?12:0)};
    for(const o of this.options(me)){ if(o.id<0) continue; const s=me.skills[o.id]; let sc=0;
      if(me.taunt&&(s.kind==="Support"||s.kind==="Field")) continue;
      if(me.status&&me.status.name==="Dread"&&me.lastSkill===s.name) continue;
      if(s.power){ const atk=s.kind==="Cast"?this.eff(me,"mnd")/this.eff(foe,"spr"):this.eff(me,"pow")/this.eff(foe,"grd");
        const stab=(s.el&&(s.el===me.el1||s.el===me.el2))?(me.mono?1.4:1.2):1;
        let pw=s.power*(s.hits||1); if(s.ifPoison&&foe.status&&foe.status.name==="Poison") pw*=2; if(s.ifStatus&&foe.status) pw*=2;
        sc=pw*atk*stab*effect(s.el,foe)*(s.acc/100)*(FIELD_FX[this.field?.name]?.[s.el]||1)-costOf(me,s)*3;
        if(s.charge&&!(s.sunInstant&&this.field?.name==="Sunlit")) sc*=0.6;
        if(s.drain&&me.hp<me.maxhp*0.6) sc*=1.25; if(s.recoil&&me.hp<me.maxhp*0.35) sc*=0.5;
        if(s.status&&!foe.status) sc+=s.status[1]*0.15; if(s.steal) sc+=10;
        if(s.lower&&s.lowerChance) sc+=6; }
      else if(s.field) sc=this.field&&this.field.name===s.field?0:28*(me.hp/me.maxhp);
      else if(s.raise) sc=Object.keys(s.raise).some(k=>me.stage[k]>=2)?0:me.hp>me.maxhp*0.55?26:4;
      else if(s.lower) sc=Object.keys(s.lower).some(k=>foe.stage[k]<=-2)?0:24;
      else if(s.regen) sc=me.hp<me.maxhp*0.6&&!me.regen?45:0;
      else if(s.heal) sc=me.hp<me.maxhp*(s.rest?0.35:0.5)?50:0;
      else if(s.inflict) sc=foe.status?0:34;
      else if(s.mirror) sc=me.mirror?0:16;
      else if(s.cleanse) sc=(me.status||Object.values(me.stage).some(v=>v<0))?40:0;
      else if(s.protect) sc=me.protectLast?0:foe.charging?70:6;
      else if(s.endure) sc=me.hp<me.maxhp*0.3?38:0;
      else if(s.bulwark) sc=me.bulwark?0:16;
      else if(s.foresight) sc=!me.foresight&&me.skills.some(x=>x.kind==="Cast"&&x.power)?22:0;
      else if(s.castWard) sc=!me.castWard&&this.eff(foe,"mnd")>this.eff(foe,"pow")?26:0;
      else if(s.afterimage) sc=me.afterimage?0:20;
      else if(s.counter) sc=this.eff(foe,"pow")>this.eff(foe,"mnd")?20:2;
      else if(s.taunt) sc=foe.taunt?0:foe.skills.some(x=>x.kind==="Support"||x.kind==="Field")?16:0;
      else if(s.erase) sc=(this.field||Object.values(foe.stage).some(v=>v>0))?32:0;
      sc*=0.85+R()*0.3;
      if(sc>best.score) best={id:o.id,score:sc};
    }
    if(me.energy<2&&R()<0.3) return GUARD;
    if(me.hp<me.maxhp*0.3&&R()<0.15) return GUARD;
    return best.id;
  }
  play(pickA,pickB){
    if(this.over) return [];
    this.events=[]; this.turn++;
    if(this.turn===1) this.start();
    else this.p.forEach((f,i)=>{ const gain=(this.p[1-i].ability==="Abyss"?1:2)+(f.energyBonus||0); f.energy=Math.min(10,f.energy+gain); });
    const picks=[pickA,pickB];
    picks.forEach((id,i)=>{
      const f=this.p[i];
      if(f.charging){ picks[i]=RELEASE; return; }
      if(id<=SWITCH0) return;
      if(id>=0&&costOf(f,f.skills[id])>f.energy) picks[i]=BASIC;
      if(f.status&&f.status.name==="Daze"&&picks[i]>=0){ const o=this.options(f).filter(x=>x.id!==GUARD); picks[i]=o[Math.floor(this.rand()*o.length)].id; this.say(`${f.name} is dazed and does something else.`); f.status=null; }
      const s=picks[i]>=0?f.skills[picks[i]]:null;
      if(s&&f.taunt&&(s.kind==="Support"||s.kind==="Field")){ this.say(`${f.name} is taunted and attacks instead.`); picks[i]=BASIC; }
      if(s&&f.status&&f.status.name==="Dread"&&f.lastSkill===s.name){ this.say(`${f.name} can't use ${s.name} twice in a row.`); picks[i]=BASIC; }
    });
    picks.forEach((id,i)=>{ const f=this.p[i], s=id>=0?f.skills[id]:null; f.guard=id===GUARD; f.usedProtect=false;
      if(s&&s.protect&&!f.protectLast&&f.energy>=costOf(f,s)) { f.protect=true; f.usedProtect=true; }
      if(s&&s.counter&&f.energy>=costOf(f,s)){ f.counter=true; f.counterMul=s.counterMul||1.5; }
      if(s&&s.endure&&f.energy>=costOf(f,s)) f.endure=true; });
    const prio=i=>{ const id=picks[i], f=this.p[i], s=id>=0?f.skills[id]:null;
      if(id===GUARD||(s&&(s.protect||s.counter||s.endure))) return 3;
      let p=s&&s.first?1:0; if((this.turn===1||f.freshIn)&&f.ability==="Long Stride") p+=1; return p; };
    const order=[0,1].sort((x,y)=>prio(y)-prio(x)||this.eff(this.p[y],"spd")-this.eff(this.p[x],"spd")||(this.rand()<0.5?-1:1));
    order.forEach(i=>{ const f=this.p[i]; if(f.ability==="Long Stride"&&(this.turn===1||f.freshIn)&&picks[i]>SWITCH0&&prio(i)>0) this.pop(i,"Long Stride"); });
    picks.forEach((id,i)=>{ if(id<=SWITCH0) this.swapIn(i,SWITCH0-id); });
    for(const i of order){ if(this.over) break; if(picks[i]<=SWITCH0) continue; this.act(i,picks[i]); }
    if(!this.over) this.endTurn();
    return this.events;
  }
  start(){
    this.p.forEach((f,i)=>{ if(f.ability==="Beguile"){ this.pop(i,"Beguile"); this.say(`${f.name}'s Beguile charms ${this.p[1-i].name}.`); this.stageChange(this.p[1-i],{pow:-1},true); } });
  }
  act(i,id){
    const me=this.p[i], foe=this.p[1-i], R=this.rand;
    if(me.hp<=0) return;
    me.freshIn=false;
    if(me.sleep){ me.sleep=false; this.say(`${me.name} is fast asleep.`); return; }
    if(me.status&&me.status.name==="Freeze"){ this.say(`${me.name} is frozen solid.`); me.status=null; me.thawed=true; if(me.charging) me.charging=null; return; }
    if(me.status&&me.status.name==="Shock"&&R()<0.25){ this.say(`${me.name} is shocked and can't move.`); return; }
    if(id===GUARD){ me.energy=Math.min(10,me.energy+2); this.say(`${me.name} guards.`); this.events.push({t:"guard",who:i});
      if(me.ability==="Halo"&&me.hp<me.maxhp){ const h=Math.round(me.maxhp/8); me.hp=Math.min(me.maxhp,me.hp+h); this.pop(i,"Halo"); this.events.push({t:"heal",who:i,amt:h}); }
      return; }
    if(id===BASIC){ this.hit(i,basicFor(me)); me.energy=Math.min(10,me.energy+1); return; }
    if(id===RELEASE){ const s=me.charging; me.charging=null;
      if(s.focus&&me.hitWhileCharging){ this.say(`${me.name} lost its focus. ${s.name} fails.`); me.hitWhileCharging=false; return; }
      me.hitWhileCharging=false; this.hit(i,s); return; }
    const s=me.skills[id], c=costOf(me,s);
    me.energy-=c; me.lastSkill=s.name;
    if(s.charge&&!(s.sunInstant&&this.field&&this.field.name==="Sunlit")){ me.charging=s; me.hitWhileCharging=false; this.say(`${me.name} gathers power for ${s.name}.`); this.events.push({t:"cast",who:i,el:s.el,name:s.name,charge:true}); return; }
    if(s.power){ this.hit(i,s); return; }
    this.events.push({t:"cast",who:i,el:s.el,name:s.name});
    this.say(`${me.name} uses ${s.name}.`); if(!s.basic){ me.used=me.used||{}; me.used[s.name]=(me.used[s.name]||0)+1; this.p[1-i].seen=this.p[1-i].seen||{}; this.p[1-i].seen[s.name]=1; }
    if(s.protect){ if(me.usedProtect) this.say(`${me.name} braces for anything.`); else this.say("It fails, since it was used last turn."); }
    if(s.counter) this.say(`${me.name} waits to counter.`);
    if(s.field){ this.field={name:s.field,turns:5}; this.say(`The field turns ${s.field}.`); this.events.push({t:"field"}); }
    if(s.raise) this.stageChange(me,s.raise,false);
    if(s.lower){ if(foe.protect) this.say(`${foe.name} is protected.`); else this.stageChange(foe,s.lower,true); }
    if(s.regen){ me.regen=s.regen; this.say(`${me.name} starts healing.`); }
    if(s.heal){ const h=Math.round(me.maxhp*s.heal); me.hp=Math.min(me.maxhp,me.hp+h); this.events.push({t:"heal",who:i,amt:h}); }
    if(s.rest){ me.sleep=true; me.status=null; this.say(`${me.name} falls asleep.`); }
    if(s.cleanse){ me.status=null; for(const k in me.stage) me.stage[k]=Math.max(0,me.stage[k]); this.say(`${me.name} is purified.`); }
    if(s.endure) this.say(`${me.name} digs in.`);
    if(s.bulwark){ me.bulwark=5; this.say(`${me.name} braces behind a Bulwark.`); }
    if(s.foresight){ me.foresight=true; this.say(`${me.name} sees the next move coming.`); }
    if(s.castWard){ me.castWard=3; this.say(`${me.name} raises a Spirit Ward.`); }
    if(s.afterimage){ me.afterimage=3; this.say(`${me.name} blurs into afterimages.`); }
    if(s.statusBlock){ me.statusBlock=s.statusBlock; }
    if(s.mirror){ me.mirror=true; this.say(`${me.name} raises a Mirror Charm.`); }
    if(s.taunt){ foe.taunt=s.taunt; this.say(`${foe.name} is taunted.`); }
    if(s.erase){ for(const k in foe.stage) foe.stage[k]=Math.min(0,foe.stage[k]); if(this.field){ this.say(`The ${this.field.name} field is erased.`); this.field=null; } this.say(`${foe.name}'s boosts are erased.`); }
    if(s.inflict){ if(foe.protect) this.say(`${foe.name} is protected.`); else if(R()*100>(s.acc||100)) this.say("It misses."); else if(foe.status) this.say(`It does nothing, since ${foe.name} already has a status.`); else this.inflict(foe,s.inflict,i); }
  }
  hit(i,s){
    const me=this.p[i], R=this.rand;
    this.events.push({t:"use",who:i,name:s.name,kind:s.kind,el:s.el});
    let tgt=1-i, power=s.power;
    if(s.kind==="Cast"&&this.p[tgt].mirror){ this.p[tgt].mirror=false; this.say(`${this.p[tgt].name}'s Mirror Charm bounces ${s.name} back.`); tgt=i; power/=2; }
    const def=this.p[tgt];
    this.say(`${me.name} uses ${s.name}.`); if(!s.basic){ me.used=me.used||{}; me.used[s.name]=(me.used[s.name]||0)+1; this.p[1-i].seen=this.p[1-i].seen||{}; this.p[1-i].seen[s.name]=1; }
    if(def.protect&&tgt!==i){ this.say(`${def.name} blocks it.`); this.events.push({t:"miss",who:tgt}); return; }
    const seen=s.kind==="Cast"&&me.foresight&&tgt!==i; if(seen) me.foresight=false;
    if(!s.basic&&!s.sure&&!seen&&tgt!==i){
      let acc=s.acc/100+(me.accMod||0); if(def.afterimage) acc-=0.3;
      if(me.status&&me.status.name==="Blind"&&me.ability!=="Keen Eye") acc-=0.2;
      const fs=this.eff(def,"spd"), ms=this.eff(me,"spd");
      if(!s.noDodge&&me.ability!=="Keen Eye"&&fs>ms) acc-=Math.min(0.15,(fs-ms)/ms*0.5);
      if(def.ability==="Unseen"&&!def.unseen){ def.unseen=true; if(R()<0.3){ this.pop(tgt,"Unseen"); this.say("It misses."); this.events.push({t:"miss",who:tgt}); return; } }
      if(R()>acc){ this.say("It misses."); this.events.push({t:"miss",who:tgt}); return; }
    }
    if(s.kind==="Strike"&&def.ability==="Slippery"&&me.ability!=="Keen Eye"&&tgt!==i&&R()<0.1){ this.pop(tgt,"Slippery"); this.say(`${def.name} slips away.`); this.events.push({t:"miss",who:tgt}); return; }
    // element
    const el=s.basic?null:s.el;
    if(el==="Spark"&&def.ability==="Lightning Rod"){ const h=Math.round(def.maxhp/4); def.hp=Math.min(def.maxhp,def.hp+h); this.pop(tgt,"Lightning Rod"); this.say(`${def.name} soaks up the lightning.`); this.events.push({t:"heal",who:tgt,amt:h}); return; }
    const part=d=>{ if(!d) return 1; let v=vs(el,d); if(el==="Blaze"&&def.ability==="Insulated"&&v>1) v=1; if(el==="Venom"&&d==="Steel"&&me.ability==="Corrosion") v=1; return v; };
    const m=el?part(def.el1)*(def.el2?part(def.el2):1):1;
    if(el==="Blaze"&&def.ability==="Insulated"&&vs(el,def.el1)*(def.el2?vs(el,def.el2):1)>1) this.pop(tgt,"Insulated");
    if(m===0){ this.say(`It has no effect on ${def.name}.`); this.events.push({t:"miss",who:tgt}); return; }
    const hits=s.hitsRange?s.hitsRange[0]+Math.floor(R()*(s.hitsRange[1]-s.hitsRange[0]+1)):(s.hits||1); let total=0, landed=0;
    for(let h=0;h<hits;h++){
      if(def.hp<=0||me.hp<=0) break;
      let pw=power;
      if(s.ifPoison&&def.status&&def.status.name==="Poison") pw*=2;
      if(s.ifStatus&&def.status) pw*=2;
      if(s.hpScale) pw=Math.max(20,pw-10*Math.floor((1-me.hp/me.maxhp)*10));
      if(s.kind==="Strike"&&pw<=50&&me.ability==="Big Bite") pw*=1.2;
      if(el==="Wild"&&me.ability==="Bloom"&&me.hp<me.maxhp/3) pw*=1.5;
      const atk=s.atkStat?this.eff(me,s.atkStat):s.kind==="Cast"?this.eff(me,"mnd"):this.eff(me,"pow");
      const dfs=s.kind==="Cast"?this.eff(def,"spr",{pierce:s.pierce}):this.eff(def,"grd",{pierce:s.pierce});
      let d=pw*atk/dfs*(me.level/50+0.4)/2;
      const stab=el&&(el===me.el1||el===me.el2)?(me.mono?1.4:1.2):1;
      const spdEdge=Math.max(0,Math.min(0.10,(this.eff(me,"spd")-this.eff(def,"spd"))/this.eff(def,"spd")*0.25));
      const crit=seen||(def.ability!=="Shell"&&!def.bulwark&&R()<(0.05+(s.crit||0)+(me.critBonus||0)+spdEdge));
      d*=m*stab*(crit?1.5:1)*(0.9+R()*0.1);
      if(this.field&&el) d*=(FIELD_FX[this.field.name][el]||1);
      if(def.guard) d*=0.5;
      if(def.castWard&&s.kind==="Cast") d*=0.5;
      if(def.status&&def.status.name==="Soak"&&el==="Spark") d*=1.25;
      if(def.ability==="Plated"&&s.kind==="Strike") d*=0.9;
      if(def.status&&def.status.name==="Freeze"&&me.ability==="Permafrost") d*=1.2;
      if(def.ability==="Wobble"&&!def.firstHitTaken){ d*=0.7; this.pop(tgt,"Wobble"); }
      def.firstHitTaken=true;
      if(me.heldEl&&s.el&&s.el===me.heldEl) d*=1.2;
      d=Math.max(1,Math.round(d));
      if(def.endure&&d>=def.hp&&tgt!==i){ d=def.hp-1; this.say(`${def.name} endures the hit.`); }
      if(def.ability==="Bedrock"&&def.hp===def.maxhp&&d>=def.hp){ d=def.hp-1; this.pop(tgt,"Bedrock"); this.say(`${def.name} hangs on.`); }
      def.hp=Math.max(0,def.hp-d); total+=d; landed++;
      if(def.lifeSeed&&def.hp>0&&def.hp<def.maxhp/2){ def.lifeSeed=false; const h=Math.round(def.maxhp/4); def.hp=Math.min(def.maxhp,def.hp+h); this.say(`${def.name}'s Life seed heals ${h}.`); } if(!s.basic&&tgt!==i){ def.hitBy=def.hitBy||{}; def.hitBy[s.name]=1; }
      if(def.charging) def.hitWhileCharging=true;
      this.events.push({t:"hit",who:tgt,dmg:d,eff:m,crit});
      if(crit) this.say("A critical hit.");
      if(def.hp<=0) break;
      // contact reactions
      if(s.kind==="Strike"&&tgt!==i){
        if(def.ability==="Hothead"&&R()<0.2){ this.pop(tgt,"Hothead"); this.inflict(me,"Burn",tgt); }
        if(def.ability==="Static Skin"&&R()<0.2){ this.pop(tgt,"Static Skin"); this.inflict(me,"Shock",tgt); }
        if(me.ability==="Toxic Touch"&&R()<0.2){ this.pop(i,"Toxic Touch"); this.inflict(def,"Poison",i); }
      }
    }
    if(hits>1) this.say(`Hit ${landed} time${landed>1?"s":""}.`);
    if(m>1) this.say(m>2?"Doubly super effective.":"Super effective."); else if(m<1) this.say("Not very effective.");
    // after-hit effects on the user
    if(s.drain&&total){ const h=Math.round(total*s.drain); me.hp=Math.min(me.maxhp,me.hp+h); this.events.push({t:"heal",who:i,amt:h}); }
    if(s.recoil&&total){ const r=Math.max(1,Math.round(total*s.recoil)); me.hp=Math.max(0,me.hp-r); this.say(`${me.name} is hurt by the recoil.`); this.events.push({t:"hit",who:i,dmg:r,eff:1,dot:true}); }
    if(def.counter&&s.kind==="Strike"&&tgt!==i&&total&&def.hp>0){ def.counter=false; const back=Math.round(total*(def.counterMul||1.5)); me.hp=Math.max(0,me.hp-back); this.say(`${def.name} counters.`); this.events.push({t:"hit",who:i,dmg:back,eff:1}); }
    if(def.ability==="Reflect"&&s.kind==="Cast"&&m<1&&total&&tgt!==i){ const back=Math.round(total*0.3); me.hp=Math.max(0,me.hp-back); this.pop(tgt,"Reflect"); this.events.push({t:"hit",who:i,dmg:back,eff:1}); }
    if(s.steal&&def.hp>0){ const g=Math.min(s.steal,def.energy); def.energy-=g; me.energy=Math.min(10,me.energy+g); this.say(`${me.name} steals ${g} energy.`); }
    if(s.selfLower) this.stageChange(me,Object.fromEntries(Object.entries(s.selfLower).map(([k,v])=>[k,-v])),false);
    if(def.hp<=0){ this.ko(tgt,i); return; }
    if(me.hp<=0){ this.ko(i,tgt); return; }
    this.lastStand(tgt);
    if(s.basic&&me.ability==="Web"&&tgt!==i&&R()<0.3){ this.pop(i,"Web"); this.stageChange(def,{spd:-1},true); }
    if(s.status&&tgt!==i){ let ch=s.status[1]; if(s.status[0]==="Freeze"&&((this.field&&this.field.name==="Snow")||me.ability==="Permafrost")) ch*=2; if(R()*100<ch) this.inflict(def,s.status[0],i); }
    if(s.lower&&s.lowerChance&&tgt!==i&&R()*100<s.lowerChance) this.stageChange(def,s.lower,true);
    if(this.field&&this.field.name==="Static"&&R()<0.1) this.inflict(def,"Shock",i);
  }
  lastStand(i){ const f=this.p[i]; if(f.ability==="Last Stand"&&!f.lastStand&&f.hp>0&&f.hp<f.maxhp/4){ f.lastStand=true; const h=Math.round(f.maxhp*0.3); f.hp=Math.min(f.maxhp,f.hp+h); this.pop(i,"Last Stand"); this.say(`${f.name} gets a second wind.`); this.events.push({t:"heal",who:i,amt:h}); } }
  ko(i,by){
    const f=this.p[i];
    if(f.ability==="Haunt"&&by!=null&&by!==i&&this.p[by].hp>0){ const d=Math.round(this.p[by].maxhp/4); this.p[by].hp=Math.max(0,this.p[by].hp-d); this.pop(i,"Haunt"); this.say(`${f.name}'s Haunt drains ${this.p[by].name}.`); this.events.push({t:"hit",who:by,dmg:d,eff:1,dot:true}); }
    this.over=true; this.winner=1-i;
    if(by!=null&&this.p[by].hp<=0){ this.winner=null; this.say("Both monsters faint."); this.events.push({t:"ko",who:by}); }
    this.say(`${f.name} faints.`); this.events.push({t:"ko",who:i});
  }
  endTurn(){
    for(let i=0;i<2;i++){
      const f=this.p[i]; if(this.over) return;
      f.guard=false; f.protect=false; f.counter=false; f.endure=false; f.protectLast=!!f.usedProtect;
      for(const k of ["bulwark","castWard","afterimage","statusBlock"]) if(f[k]) f[k]--;
      if(f.thawed&&!(f.status&&f.status.name==="Freeze")) f.thawedTurn=(f.thawedTurn||0)+1; if(f.thawedTurn>1){ f.thawed=false; f.thawedTurn=0; }
      if(f.taunt) f.taunt--;
      if(f.ability==="Sunbather"&&this.field&&this.field.name==="Sunlit"&&f.hp<f.maxhp){ const h=Math.round(f.maxhp/16); f.hp=Math.min(f.maxhp,f.hp+h); this.pop(i,"Sunbather"); this.events.push({t:"heal",who:i,amt:h}); }
      if(f.regen){ const h=Math.round(f.maxhp*0.1); f.hp=Math.min(f.maxhp,f.hp+h); f.regen--; this.events.push({t:"heal",who:i,amt:h}); }
      if(f.status){
        const st=f.status.name;
        if(st==="Burn"||st==="Poison"||st==="Root"){
          const share=st==="Poison"||(st==="Burn"&&f.status.wild)?1/8:1/16;
          const d=Math.max(1,Math.round(f.maxhp*share));
          f.hp=Math.max(0,f.hp-d); this.say(`${f.name} takes ${d} from ${st}.`); this.events.push({t:"hit",who:i,dmg:d,eff:1,dot:true});
          if(st==="Root"&&f.status.from!=null){ const src=this.p[f.status.from]; src.hp=Math.min(src.maxhp,src.hp+d); }
          if(f.hp<=0){ this.ko(i,null); return; }
          this.lastStand(i);
        }
        if(f.status&&st!=="Freeze"){ f.status.turns--; if(f.status.turns<=0){ this.say(`${f.name}'s ${st} wears off.`); f.status=null; } }
      }
    }
    if(this.field){ this.field.turns--; if(this.field.turns<=0){ this.say(`The ${this.field.name} field fades.`); this.field=null; } }
  }
}

/* A random computer opponent, built the same way a scan builds one. */
function randomOpponent(rand=Math.random){
  const g=["red","orange","yellow","green","cyan","blue","violet","pink","brown","white","silver","black"];
  const pick=()=>g[Math.floor(rand()*g.length)];
  const main=pick(); let second=pick(); while(second===main) second=pick(); let third=pick(); while(third===main||third===second) third=pick();
  const mono=rand()<0.35;
  const hex=h=>[1,3,5].map(k=>parseInt(COL[h].slice(k,k+2),16));
  const r=(gname,w)=>({g:gname,w,raw:w,cd:0.3,rgb:hex(gname)});
  const ranked=[r(main,mono?70:45),r(second,mono?15:30),r(third,10)];
  const cells=Array.from({length:9},()=>rand());
  const colours=3+Math.floor(rand()*6);
  return hatch({ranked,main:ranked[0],second:mono?null:ranked[1],mono,tie:false,colours,pool:colours+4,cells,
    sat:0.2+rand()*0.6,bright:0.3+rand()*0.6,contrast:0.1+rand()*0.25,photoKey:"cpu"+Math.floor(rand()*1e9)},new Date(),rand);
}
/* The computer's loadout: its best unlocked damaging skill plus one more. */
function aiLoadout(m,level=LEVEL,rand=Math.random){
  const open=m.pool.filter(n=>SKILLS[n].lv<=level);
  const dmg=open.filter(n=>SKILLS[n].power).sort((a,b)=>SKILLS[b].power*(SKILLS[b].hits||1)-SKILLS[a].power*(SKILLS[a].hits||1));
  const first=dmg.length?dmg[Math.floor(rand()*Math.min(2,dmg.length))]:open[0];
  const rest=open.filter(n=>n!==first);
  return [first,rest[Math.floor(rand()*rest.length)]||open[0]];
}
