/* Snabits fight prototype, build step 2: basic attack, 2 skills, Guard, energy and the element chart. */
const HARD={Blaze:["Wild","Frost","Steel"],Brawl:["Stone","Steel","Frost"],Spark:["Tide","Steel"],Wild:["Tide","Stone"],Frost:["Wild","Stone"],Tide:["Blaze","Stone","Steel"],Venom:["Wild","Light","Brawl"],Charm:["Brawl","Venom","Void"],Stone:["Spark","Blaze","Venom"],Light:["Shade","Venom","Void"],Steel:["Frost","Charm","Shade"],Shade:["Charm","Spark","Shade"],Void:["Charm","Light"]};
const SOFT={Blaze:["Tide","Stone","Blaze","Void"],Brawl:["Charm","Venom"],Spark:["Wild","Spark","Void"],Wild:["Blaze","Steel","Venom","Wild","Void"],Frost:["Blaze","Tide","Steel","Frost"],Tide:["Wild","Tide","Frost","Void"],Venom:["Stone","Venom","Shade"],Charm:["Steel","Stone","Charm"],Stone:["Wild","Steel","Brawl","Stone"],Light:["Wild","Steel","Light"],Steel:["Blaze","Tide","Steel"],Shade:["Light","Steel"],Void:["Void"]};
const IMMUNE={Brawl:["Shade"],Spark:["Stone"],Venom:["Steel"]};
function vs(a,d){ if(!a||!d) return 1; if((IMMUNE[a]||[]).includes(d)) return 0; if(HARD[a].includes(d)) return 1.5; if(SOFT[a].includes(d)) return 0.67; return 1; }
function effect(el,def){ return el?vs(el,def.el1)*(def.el2?vs(el,def.el2):1):1; }

const SKILLS={
  "Ember Bite":{el:"Blaze",kind:"Strike",cost:2,power:45,acc:100,status:["Burn",20]},
  "Jab":{el:"Brawl",kind:"Strike",cost:2,power:55,acc:100},
  "Zap":{el:"Spark",kind:"Cast",cost:2,power:40,acc:100,first:true},
  "Vine Lash":{el:"Wild",kind:"Strike",cost:2,power:45,acc:100,status:["Root",20]},
  "Frost Nip":{el:"Frost",kind:"Cast",cost:2,power:45,acc:100,status:["Freeze",10]},
  "Splash Fang":{el:"Tide",kind:"Strike",cost:2,power:45,acc:100,status:["Soak",20]},
  "Toxic Spit":{el:"Venom",kind:"Cast",cost:2,power:45,acc:100,status:["Poison",30]},
  "Hypno Ray":{el:"Charm",kind:"Cast",cost:3,power:50,acc:100,status:["Daze",25]},
  "Rock Slam":{el:"Stone",kind:"Strike",cost:3,power:65,acc:95,status:["Crack",20]},
  "Glint":{el:"Light",kind:"Cast",cost:2,power:45,acc:100,status:["Blind",20]},
  "Iron Ram":{el:"Steel",kind:"Strike",cost:3,power:70,acc:95},
  "Shadow Bolt":{el:"Shade",kind:"Cast",cost:3,power:55,acc:100,status:["Curse",20]},
  "Heat Haze":{el:"Blaze",kind:"Field",cost:3,field:"Sunlit"},
  "Bulk Up":{el:"Brawl",kind:"Support",cost:3,raise:{pow:1,grd:1}},
  "Charge Up":{el:"Spark",kind:"Field",cost:3,field:"Static"},
  "Overgrowth":{el:"Wild",kind:"Support",cost:4,regen:3},
  "Blizzard":{el:"Frost",kind:"Field",cost:3,field:"Snow"},
  "Monsoon":{el:"Tide",kind:"Field",cost:3,field:"Rain"},
  "Toxic Mist":{el:"Venom",kind:"Support",cost:3,inflict:"Poison",acc:100},
  "Mirror Charm":{el:"Charm",kind:"Support",cost:4,mirror:true},
  "Shard Wall":{el:"Stone",kind:"Support",cost:3,raise:{grd:2}},
  "Purify":{el:"Light",kind:"Support",cost:4,cleanse:true},
  "Polish":{el:"Steel",kind:"Support",cost:3,raise:{grd:1,spd:1}},
  "Moonrise":{el:"Shade",kind:"Field",cost:3,field:"Moonlit"},
};
const FIELD_FX={Sunlit:{Blaze:1.3,Tide:0.8},Rain:{Tide:1.3,Blaze:0.8},Static:{Spark:1.3},Snow:{Frost:1.3,Blaze:0.8},Moonlit:{Shade:1.3,Void:1.3}};
const LEVEL=20;

function makeFighter(m){
  const L=LEVEL, s=m.stats;
  const st=i=>Math.floor(s[i]*L/50+5);
  const maxhp=Math.floor(s[0]*2*L/50+3*L+30);
  return {m, name:m.name, el1:m.el1, el2:m.el2, mono:m.mono, maxhp, hp:maxhp, energy:3,
    base:{pow:st(1),grd:st(2),mnd:st(3),spr:st(4),spd:st(5)}, stage:{pow:0,grd:0,mnd:0,spr:0,spd:0},
    status:null, guard:false, regen:0, mirror:false, skills:m.skills.map(n=>({name:n,...SKILLS[n]}))};
}
function stageMul(n){ return n>=0?1+0.25*n:[1,0.8,0.67,0.57][-n]; }
function eff(f,k){
  let v=f.base[k]*stageMul(f.stage[k]);
  if(k==="pow"&&f.status&&f.status.name==="Burn") v*=0.75;
  if(k==="grd"&&f.status&&f.status.name==="Crack") v*=0.75;
  if(k==="spd"&&f.status&&f.status.name==="Soak") v*=0.75;
  return v;
}
function costOf(f,sk){ return sk.cost+(f.status&&f.status.name==="Curse"?1:0); }

class Fight{
  constructor(a,b,rand=Math.random){ this.p=[a,b]; this.field=null; this.turn=0; this.log=[]; this.rand=rand; this.events=[]; this.over=false; this.winner=null; }
  say(t){ this.log.push(t); this.events.push({t:"log",text:t}); }
  options(f){ // what this fighter can do: index -1 basic, -2 guard, 0..n skills
    const o=[{id:-1,label:"Attack"},{id:-2,label:"Guard"}];
    f.skills.forEach((s,i)=>{ if(costOf(f,s)<=f.energy) o.push({id:i,label:s.name}); });
    return o;
  }
  aiPick(me,foe){
    const R=this.rand, opts=this.options(me);
    let best={id:-1,score:40*eff(me,"pow")/eff(foe,"grd")};
    for(const o of opts){ if(o.id<0) continue; const s=me.skills[o.id];
      let score=0;
      if(s.power){ const atk=s.kind==="Cast"?eff(me,"mnd")/eff(foe,"spr"):eff(me,"pow")/eff(foe,"grd");
        const stab=(s.el===me.el1||s.el===me.el2)?(me.mono?1.4:1.2):1;
        score=s.power*atk*stab*effect(s.el,foe)*(s.acc/100)*(FIELD_FX[this.field?.name]?.[s.el]||1) - costOf(me,s)*3; }
      else if(s.field){ score=this.field&&this.field.name===s.field?0:30*(me.hp/me.maxhp); }
      else if(s.raise){ score=me.hp>me.maxhp*0.6?28:5; if(Object.keys(s.raise).some(k=>me.stage[k]>=2)) score=0; }
      else if(s.regen){ score=me.hp<me.maxhp*0.6&&!me.regen?45:0; }
      else if(s.inflict){ score=foe.status?0:34; }
      else if(s.mirror){ score=me.mirror?0:18; }
      else if(s.cleanse){ score=(me.status||Object.values(me.stage).some(v=>v<0))?40:0; }
      score*=0.85+R()*0.3;
      if(score>best.score) best={id:o.id,score};
    }
    if(me.energy<2&&R()<0.3) return -2;
    if(me.hp<me.maxhp*0.3&&R()<0.2) return -2;
    return best.id;
  }
  // run one turn with both picks; returns events for animation
  play(pickA,pickB){
    if(this.over) return [];
    this.events=[]; this.turn++;
    if(this.turn>1) this.p.forEach(f=>f.energy=Math.min(10,f.energy+2));
    const picks=[pickA,pickB];
    // daze: a dazed monster using a skill picks at random from what it can afford
    picks.forEach((id,i)=>{ const f=this.p[i]; if(f.status&&f.status.name==="Daze"&&id>=0){ const o=this.options(f).filter(x=>x.id!==-2); picks[i]=o[Math.floor(this.rand()*o.length)].id; this.say(`${f.name} is dazed and does something else.`); f.status=null; }});
    picks.forEach((id,i)=>{ this.p[i].guard=id===-2; });
    const prio=i=>{const id=picks[i]; if(id===-2) return 2; const s=id>=0?this.p[i].skills[id]:null; return s&&s.first?1:0;};
    let order=[0,1];
    order.sort((x,y)=>prio(y)-prio(x)||eff(this.p[y],"spd")-eff(this.p[x],"spd")||(this.rand()<0.5?-1:1));
    for(const i of order){
      if(this.over) break;
      this.act(i,picks[i]);
    }
    if(!this.over) this.endTurn();
    return this.events;
  }
  act(i,id){
    const me=this.p[i], foe=this.p[1-i], R=this.rand;
    if(me.hp<=0) return;
    if(me.status&&me.status.name==="Freeze"){ this.say(`${me.name} is frozen solid.`); me.status=null; me.thawed=true; return; }
    if(me.status&&me.status.name==="Shock"&&R()<0.25){ this.say(`${me.name} is shocked and can't move.`); return; }
    if(id===-2){ me.energy=Math.min(10,me.energy+2); this.say(`${me.name} guards.`); this.events.push({t:"guard",who:i}); return; }
    if(id===-1){ this.hit(i,{name:"Attack",kind:"Strike",power:40,acc:100,basic:true}); me.energy=Math.min(10,me.energy+1); return; }
    const s=me.skills[id], c=costOf(me,s);
    if(c>me.energy){ this.hit(i,{name:"Attack",kind:"Strike",power:40,acc:100,basic:true}); me.energy=Math.min(10,me.energy+1); return; }
    me.energy-=c;
    if(s.power){ this.hit(i,s); return; }
    this.events.push({t:"cast",who:i,el:s.el});
    if(s.field){ this.field={name:s.field,turns:5}; this.say(`${me.name} uses ${s.name}. The field turns ${s.field}.`); this.events.push({t:"field"}); }
    if(s.raise){ for(const k in s.raise) me.stage[k]=Math.min(3,me.stage[k]+s.raise[k]); this.say(`${me.name} uses ${s.name}. ${Object.keys(s.raise).map(k=>({pow:"Power",grd:"Guard",spd:"Speed"})[k]).join(" and ")} up.`); }
    if(s.regen){ me.regen=3; this.say(`${me.name} uses ${s.name} and starts healing.`); }
    if(s.mirror){ me.mirror=true; this.say(`${me.name} raises a Mirror Charm.`); }
    if(s.cleanse){ me.status=null; for(const k in me.stage) me.stage[k]=Math.max(0,me.stage[k]); this.say(`${me.name} is purified.`); }
    if(s.inflict){ if(foe.status) this.say(`${s.name} does nothing, since ${foe.name} already has a status.`); else this.inflict(foe,s.inflict,i); }
  }
  inflict(f,name,from){ if(f.status||f.hp<=0) return false; if(name==="Freeze"&&f.thawed){f.thawed=false;return false;} f.status={name,turns:name==="Freeze"?1:3,from}; this.say(`${f.name} is hit with ${name}.`); this.events.push({t:"status",who:this.p.indexOf(f),name}); return true; }
  hit(i,s){
    const me=this.p[i]; let foe=this.p[1-i]; const R=this.rand;
    let target=1-i, power=s.power;
    if(s.kind==="Cast"&&foe.mirror){ foe.mirror=false; target=i; power=power/2; this.say(`${foe.name}'s Mirror Charm bounces ${s.name} back.`); }
    const def=this.p[target];
    this.say(`${me.name} uses ${s.name}.`);
    if(!s.basic){
      let acc=s.acc/100; if(me.status&&me.status.name==="Blind") acc-=0.2;
      const fs=eff(def,"spd"), ms=eff(me,"spd"); if(target!==i&&fs>ms) acc-=Math.min(0.10,(fs-ms)/ms*0.25);
      if(R()>acc){ this.say("It misses."); this.events.push({t:"miss",who:target}); return; }
    }
    const m=effect(s.basic?null:s.el,def);
    if(m===0){ this.say(`It has no effect on ${def.name}.`); this.events.push({t:"miss",who:target}); return; }
    const atk=s.kind==="Cast"?eff(me,"mnd"):eff(me,"pow"), dfs=s.kind==="Cast"?eff(def,"spr"):eff(def,"grd");
    let d=power*atk/dfs*(LEVEL/50+0.4)/2;
    const stab=!s.basic&&(s.el===me.el1||s.el===me.el2)?(me.mono?1.4:1.2):1;
    const crit=R()<0.05;
    d*=m*stab*(crit?1.5:1)*(0.9+R()*0.1);
    if(this.field&&!s.basic) d*=(FIELD_FX[this.field.name][s.el]||1);
    if(def.guard) d*=0.5;
    if(def.status&&def.status.name==="Soak"&&s.el==="Spark") d*=1.25;
    d=Math.max(1,Math.round(d));
    def.hp=Math.max(0,def.hp-d);
    this.events.push({t:"hit",who:target,dmg:d,eff:m,crit});
    if(crit) this.say("A critical hit.");
    if(m>1) this.say(m>2?"Doubly super effective.":"Super effective."); else if(m<1) this.say("Not very effective.");
    if(def.hp<=0){ this.ko(target); return; }
    let shockRoll=this.field&&this.field.name==="Static"&&R()<0.1;
    if(s.status&&target!==i){ let ch=s.status[1]; if(s.status[0]==="Freeze"&&this.field&&this.field.name==="Snow") ch*=2; if(R()*100<ch) this.inflict(def,s.status[0],i); }
    if(shockRoll) this.inflict(def,"Shock",i);
  }
  ko(i){ this.over=true; this.winner=1-i; this.say(`${this.p[i].name} breaks into pixels.`); this.events.push({t:"ko",who:i}); }
  endTurn(){
    for(let i=0;i<2;i++){
      const f=this.p[i]; if(this.over) return;
      f.guard=false;
      if(f.regen){ const h=Math.round(f.maxhp*0.1); f.hp=Math.min(f.maxhp,f.hp+h); f.regen--; this.events.push({t:"heal",who:i,amt:h}); }
      if(f.status){
        const st=f.status.name;
        if(st==="Burn"||st==="Poison"||st==="Root"){
          const d=Math.max(1,Math.round(f.maxhp*(st==="Poison"?1/8:1/16)));
          f.hp=Math.max(0,f.hp-d); this.say(`${f.name} takes ${d} from ${st}.`); this.events.push({t:"hit",who:i,dmg:d,eff:1,dot:true});
          if(st==="Root"){ const src=this.p[f.status.from]; src.hp=Math.min(src.maxhp,src.hp+d); }
          if(f.hp<=0){ this.ko(i); return; }
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
  return hatch({ranked,main:ranked[0],second:mono?null:ranked[1],mono,tie:false,colours:3+Math.floor(rand()*4),pool:8,cells,
    sat:0.2+rand()*0.6,bright:0.3+rand()*0.6,contrast:0.1+rand()*0.25,photoKey:"cpu"+Math.floor(rand()*1e9)});
}
