/* The new arena, first pass: a real-time fight on a line between two walls, run in fixed steps of a tenth of a second
   so cup fights between computer monsters can be simulated instantly. Not hooked into the game yet.
   Needs battle.js (edge, vs, makeFighter) and skills.js (SKILLS). The numbers follow the "Snabits arena and movesets" doc. */
const AR={ LEN:100, BODY:6, DT:0.1, TIME:60, BANDS:["Close","Near","Mid","Far"] };
const arBand=gap=>gap<10?"Close":gap<25?"Near":gap<45?"Mid":"Far";
/* hitting from further away is harder to set up, so it pays a little more */
const AR_BAND_DMG={Close:0.8,Near:0.95,Mid:1.2,Far:1.5,Any:1};

/* [name, learned at, range, damage, accuracy, sharpness, wither, push, cost, windup, extras] */
const FAM_MOVES={
  Chomp:[["Bite",1,"Close",27,85,10,2,4,10,0.3],["Lunge",3,"Near",35,75,8,0,0,16,0.5,{dash:"in"}],["Crunch",5,"Close",70,70,12,0,6,30,0.8],["Leapfrog Bite",8,"Close",20,70,5,0,0,14,0.4,{swap:1}],
    ["Body Slam",14,"Close",50,70,5,5,25,26,0.7],["Jaw Lock",20,"Close",25,80,0,12,0,20,0.4,{hold:2}],["Charge",30,"Mid",60,65,10,0,20,34,1.0,{dash:"in"}],["Gnash",40,"Close",15,80,20,1,0,38,0.6,{hits:4}]],
  Pinch:[["Pinch",1,"Close",25,88,10,0,4,10,0.3],["Claw Jab",3,"Near",32,80,8,0,6,14,0.4],["Bunker Down",5,"Any",0,100,0,0,0,20,0.2,{buff:"bunker"}],["Scuttle Under",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Riposte",14,"Close",0,100,0,0,0,18,0.1,{buff:"riposte"}],["Shell Ram",20,"Near",45,70,5,0,20,24,0.6],["Vice Grip",30,"Close",40,75,5,15,0,28,0.5,{hold:1.5}],["Crab Hammer",40,"Close",80,60,20,0,15,40,1.0]],
  Stilt:[["Kick",1,"Near",30,85,8,0,8,10,0.3],["Hop Back",3,"Any",0,100,0,0,0,8,0.2,{step:-25}],["High Kick",5,"Near",80,65,15,0,12,32,0.8],["Vault",8,"Close",18,75,5,0,0,12,0.3,{swap:1}],
    ["Sweep",14,"Close",30,80,5,0,0,16,0.4,{slow:3}],["Long Stride",20,"Mid",40,70,10,0,0,22,0.6,{dash:"near"}],["Axe Kick",30,"Near",75,70,20,0,10,36,0.9],["Stampede",40,"Near",20,75,10,0,10,38,0.6,{hits:3}]],
  Skit:[["Nip",1,"Close",22,90,10,0,0,8,0.2],["Skitter",3,"Any",0,100,0,0,0,6,0.1,{step:15}],["Web",5,"Mid",40,80,5,0,0,18,0.5,{slow:3}],["Web Swing",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Reel In",14,"Mid",20,75,0,0,-25,18,0.5],["Trap Line",20,"Mid",0,100,0,0,0,20,0.4,{slow:4}],["Leg Flurry",30,"Close",14,80,10,0,0,30,0.5,{hits:4}],["Cocoon",40,"Mid",30,60,0,0,0,34,0.9,{hold:2}]],
  Antik:[["Zap",1,"Mid",25,85,5,6,0,10,0.3,{cast:1}],["Static Screen",5,"Mid",45,75,5,8,0,22,0.6,{cast:1}],["Static Hop",8,"Close",15,75,0,8,0,12,0.3,{swap:1}],["Signal Jam",12,"Far",15,80,0,25,0,18,0.5,{cast:1}],
    ["Scan Beam",18,"Far",50,70,10,0,0,28,1.0,{cast:1}],["Feedback",24,"Any",0,100,0,0,0,16,0.2,{buff:"feedback"}],["Short Circuit",30,"Close",50,75,5,15,30,30,0.6,{cast:1}],["Broadcast",40,"Far",80,60,10,15,0,42,1.4,{cast:1}]],
  Squib:[["Squirt",1,"Mid",28,90,5,0,4,8,0.3,{cast:1}],["Jet Back",3,"Any",0,100,0,0,0,10,0.1,{step:-30}],["Ink Jet",5,"Far",48,75,5,0,0,18,0.5,{cast:1}],["Slip Past",8,"Close",10,85,0,0,0,10,0.2,{swap:1}],
    ["Tentacle Lash",14,"Near",45,75,10,0,10,20,0.5],["Bubble Wall",20,"Any",0,100,0,0,0,22,0.3,{buff:"bubble"}],["Undertow",30,"Far",35,70,0,0,-30,26,0.7,{cast:1}],["Riptide",40,"Mid",85,65,10,10,15,38,1.0,{cast:1}]],
  Moko:[["Stare",1,"Far",32,90,5,10,0,10,0.3,{cast:1}],["Glare",5,"Far",0,85,0,6,0,16,0.4,{cast:1,lower:1}],["Blink",8,"Close",0,90,0,0,0,12,0.2,{swap:1}],["Mind Prick",12,"Far",50,80,10,18,0,20,0.4,{cast:1}],
    ["Dread",18,"Near",25,80,0,20,35,24,0.5,{cast:1}],["Unblinking",24,"Any",0,100,0,0,0,18,0.2,{buff:"unblink"}],["Eye Beam",30,"Far",92,70,12,10,0,36,1.1,{cast:1}],["Hypnotize",40,"Mid",0,65,0,15,0,34,0.8,{cast:1,hold:2}]],
  Booly:[["Wisp Shot",1,"Far",32,85,5,0,0,10,0.3,{cast:1}],["Boo!",3,"Close",5,90,0,5,35,10,0.2,{cast:1}],["Phase Shift",5,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Phase Through",8,"Close",0,95,0,0,0,10,0.2,{swap:1}],
    ["Haunt",14,"Near",26,80,0,20,20,18,0.4,{cast:1}],["Will-o'-Wisp",20,"Far",50,75,5,0,0,24,0.6,{cast:1}],["Poltergeist",30,"Mid",55,70,5,0,15,30,0.7,{cast:1}],["Spirit Lance",40,"Far",88,70,15,0,0,38,1.2,{cast:1}]],
};
const SHARED_MOVES=[["Dash In",1,"Any",0,100,0,0,0,10,0.2,{step:20}],["Leap Back",1,"Any",0,100,0,0,0,10,0.2,{step:-20}],["Brace",1,"Any",0,100,0,0,0,6,0.1,{buff:"brace"}]];
/* how fast each family gets around: Booly floats and Squib jets, while Chomp and Pinch plod */
const FAM_WALK={Chomp:0.85,Pinch:0.85,Stilt:1.05,Skit:1.15,Antik:1,Squib:1.15,Moko:1,Booly:1.25};
/* a family's first move takes its element, the way Skit's Web already does: a Blaze Chomp bites with Flame Bite */
const EL_PREFIX={Blaze:"Flame",Frost:"Frost",Tide:"Aqua",Spark:"Volt",Wild:"Leaf",Venom:"Toxic",Charm:"Heart",Stone:"Rock",Light:"Shine",Steel:"Iron",Shade:"Shadow",Void:"Void"};
const arMove=r=>({name:r[0],lv:r[1],range:r[2],dmg:r[3],acc:r[4],sharp:r[5]/100,wither:r[6],push:r[7],cost:r[8],wind:r[9],...(r[10]||{})});

/* an element skill turned into an arena move: its range comes from the animation it plays */
const AR_RANGE={bite:"Close",punch:"Close",claw:"Close",shadowstrike:"Close",shadowclaw:"Close",stomp:"Close",
  tackle:"Near",push:"Near",spear:"Near",rockpath:"Near",fly:"Near",
  bolt:"Mid",volley:"Mid",drain:"Mid",mist:"Mid",gust:"Mid",boulder:"Mid",firespin:"Mid",
  beam:"Far",lightning:"Far",pillar:"Far",tornado:"Far",meteor:"Far",icefall:"Far",wave:"Far",lift:"Far"};
function arFromSkill(n){
  const s=SKILLS[n]; if(!s) return null;
  const k=typeof MOVE_KIND!=="undefined"?MOVE_KIND[n]:null, support=!s.power;
  const range=support?"Any":AR_RANGE[k]||(s.kind==="Strike"?"Close":"Mid");
  return {name:n,range,dmg:s.power||0,acc:s.acc||100,sharp:0.05+(s.crit||0),wither:0,push:k==="push"?25:0,cost:Math.min(45,Math.round((s.power||0)/2.6)+4),
    wind:Math.min(1.4,0.25+(s.power||0)/140),el:s.el,cast:s.kind==="Cast",hits:s.hits||1,status:s.status,support,skill:s};
}
/* every move a Snabit can use in the arena: its family's up to its level, the shared moves, and its element skills */
function arMoves(fam,level,known,el){
  const fm=(FAM_MOVES[fam]||[]).map(arMove).filter(m=>m.lv<=level), sh=SHARED_MOVES.map(arMove);
  if(el&&EL_PREFIX[el]&&fm[0]){ fm[0].name=`${EL_PREFIX[el]} ${fm[0].name}`; fm[0].el=el; }
  const elm=(known||[]).map(arFromSkill).filter(m=>m&&!m.support);
  return fm.concat(sh,elm);
}

class Arena{
  /* a and b: fighters from makeFighter, each with .moves (arMoves) and .family; ai: "smart" or "naive" per side */
  constructor(a,b,rand,ai=["smart","smart"]){
    this.rand=rand; this.t=0; this.over=false; this.winner=null; this.log=[]; this.ev=[];   // ev: what happened this step, for the screen to animate
    this.p=[a,b].map((f,i)=>({f,i,x:i?70:30,focus:30,act:null,cool:0,hold:0,slow:0,stun:0,shoveCool:0,buff:{},hp:f.maxhp,maxhp:f.maxhp,ai:ai[i],dealt:0}));
  }
  gap(){ return Math.abs(this.p[0].x-this.p[1].x)-AR.BODY; }
  band(){ return arBand(this.gap()); }
  eff(p,k){ return p.f.base[k]; }
  dirTo(p){ const o=this.p[1-p.i]; return o.x>p.x?1:-1; }
  inRange(m){ return m.range==="Any"||m.range===this.band(); }
  speed(p){ const o=this.p[1-p.i]; return 12*(FAM_WALK[p.f.family]||1)*(1+edge(this.eff(p,"spd"),this.eff(o,"spd"),0.6,-0.35,0.45))*(p.slow>0?0.5:1); }
  regen(p){ const o=this.p[1-p.i]; return 5.5*(1+edge(this.eff(p,"sta"),this.eff(o,"sta"),0.5,-0.3,0.4)); }
  walk(p,dir){ if(p.hold>0||p.stun>0) return; const o=this.p[1-p.i], nx=p.x+dir*this.speed(p)*AR.DT;
    const lo=o.x<p.x?o.x+AR.BODY:0, hi=o.x>p.x?o.x-AR.BODY:AR.LEN; p.x=Math.max(lo,Math.min(hi,nx)); }
  start(p,m){ if(p.focus<m.cost||p.act||p.cool>0||p.stun>0) return false; p.focus-=m.cost; p.act={m,left:m.wind}; this.ev.push({t:"start",i:p.i,m}); return true; }
  step(){
    if(this.over) return;
    for(const p of this.p){ if(!p.buff.brace) p.focus=Math.min(99,p.focus+this.regen(p)*AR.DT);
      for(const k of ["cool","hold","slow","stun","shoveCool"]) p[k]=Math.max(0,p[k]-AR.DT);
      for(const k in p.buff){ p.buff[k]-=AR.DT; if(p.buff[k]<=0) delete p.buff[k]; } }
    for(const p of this.p) if(!p.act&&!p.stun){ if(p.ai==="human"){ if(p.wantDir&&!p.hold) this.walk(p,p.wantDir); } else (p.ai==="naive"?this.naive(p):this.smart(p)); }
    for(const p of this.p) if(p.act){ p.act.left-=AR.DT; if(p.act.left<=0){ const m=p.act.m; p.act=null; p.cool=0.3; this.resolve(p,m); if(this.over) return; } }
    this.t+=AR.DT;
    if(this.t>=AR.TIME){ this.over=true; const r=this.p.map(p=>p.hp/p.maxhp); this.winner=r[0]===r[1]?null:r[0]>r[1]?0:1; this.judged=true; }
  }
  resolve(p,m){
    const o=this.p[1-p.i], d=this.dirTo(p), R=this.rand;
    if(m.buff){ this.ev.push({t:"buff",i:p.i,m}); p.buff[m.buff]=m.buff==="bunker"?4:m.buff==="unblink"?3:m.buff==="feedback"?2:m.buff==="phase"?3:m.buff==="bubble"?6:m.buff==="riposte"?1.5:1.5; return; }
    if(m.step&&!m.dmg){ this.ev.push({t:"step",i:p.i,m}); const s=m.step*d, lo=o.x<p.x?o.x+AR.BODY:0, hi=o.x>p.x?o.x-AR.BODY:AR.LEN; p.x=Math.max(lo,Math.min(hi,p.x+s)); return; }
    if(m.dash){ const want=m.dash==="near"?14:AR.BODY+2; p.x=o.x-d*want; p.x=Math.max(0,Math.min(AR.LEN,p.x)); }
    else if(!this.inRange(m)){ this.ev.push({t:"miss",i:p.i,m,why:"out"}); return; }   // it stepped out of reach during the windup
    if(o.buff.bubble&&(m.range==="Mid"||m.range==="Far")){ delete o.buff.bubble; this.ev.push({t:"miss",i:p.i,m,why:"block"}); return; }
    let acc=m.acc/100+p.focus/99*0.15+edge(this.eff(p,"spr"),this.eff(o,"spd"),0.4,-0.2,0.1)-(o.buff.phase?0.3:0)+(p.buff.unblink?0.1:0);
    if(R()>acc){ this.ev.push({t:"miss",i:p.i,m}); return; }
    if(m.swap){ const x=p.x; p.x=o.x; o.x=x; this.ev.push({t:"swap",i:p.i,m}); }
    for(let h=0;h<(m.hits||1);h++) if(m.dmg){
      const atk=this.eff(p,m.cast?"mnd":"pow"), con=this.eff(o,"grd"), dfs=m.cast?(con+3*(o.f.level+5))/4:(con+o.f.level+5)/2;
      let dmg=m.dmg*atk/dfs*(p.f.level/50+0.4)/2*0.55*AR_BAND_DMG[m.range];
      if(m.el&&typeof vs==="function"){ const mm=vs(m.el,o.f.el1)*(o.f.el2?vs(m.el,o.f.el2):1); dmg*=mm; if(m.el===p.f.el1||m.el===p.f.el2) dmg*=1.2; }
      const crit=R()<m.sharp+edge(this.eff(p,"pow"),con,0.2,0,0.12); if(crit) dmg*=1.5;
      if(o.buff.brace) dmg*=0.6; if(o.buff.bunker) dmg*=0.8;
      dmg=Math.max(1,Math.round(dmg*(0.9+R()*0.1))); o.hp=Math.max(0,o.hp-dmg); p.dealt+=dmg; this.ev.push({t:"hit",i:p.i,m,dmg,crit,h});
      if(o.buff.riposte&&!m.cast){ const back=Math.round(dmg*1.5); p.hp=Math.max(0,p.hp-back); o.dealt+=back; }
    }
    if(m.wither){ const w=m.wither*(1+edge(this.eff(p,"mnd"),this.eff(o,"spr"),0.5,-0.3,0.5)); if(o.buff.unblink){} else if(o.buff.feedback) p.focus=Math.max(0,p.focus-w); else o.focus=Math.max(0,o.focus-w); }
    if(m.push&&!o.buff.brace&&!o.buff.bunker){
      const k=1+edge(this.eff(p,m.cast?"mnd":"pow"),this.eff(o,"grd"),0.5,-0.4,0.4), s=m.push*k;
      if(s>0){ const want=o.x+d*s, wall=d>0?AR.LEN:0, past=Math.abs(want-wall)*(d>0?want>wall:want<wall); o.x=Math.max(0,Math.min(AR.LEN,want));
        if(past>5){ const slam=Math.round(o.maxhp*0.03); o.hp=Math.max(0,o.hp-slam); p.dealt+=slam; o.stun=0.5; this.ev.push({t:"slam",i:o.i,dmg:slam}); } }
      else o.x=p.x+d*Math.max(AR.BODY,Math.abs(o.x-p.x)+s);   // a pull drags it in, but never through the puller
    }
    if(m.hold) o.hold=m.hold; if(m.slow) o.slow=m.slow;
    if(o.hp<=0||p.hp<=0){ this.over=true; this.winner=o.hp<=0&&p.hp<=0?null:o.hp<=0?p.i:o.i; }
  }
  // Shove is free, with a 1.5 second wait between shoves
  shove(p){ const o=this.p[1-p.i]; if(this.band()!=="Close"||p.shoveCool>0) return false; p.shoveCool=1.5; p.cool=0.4; this.resolve(p,{name:"Shove",range:"Close",dmg:0,acc:95,sharp:0,wither:0,push:18,cost:0}); return true; }
  /* the range a Snabit fights best at: the band where its moves do the most damage for their focus */
  prefer(p){ if(p.pref) return p.pref; const sc={Close:0,Near:0,Mid:0,Far:0};
    for(const m of p.f.moves) if(m.range!=="Any"&&m.dmg) sc[m.range]+=m.dmg*(m.hits||1)*m.acc/100*(m.cast?this.eff(p,"mnd"):this.eff(p,"pow"))/m.cost;
    return p.pref=Object.keys(sc).sort((a,b)=>sc[b]-sc[a])[0]; }
  value(p,m){ const o=this.p[1-p.i]; if(!m.dmg&&!m.wither&&!m.push&&!m.hold) return 0;
    const atk=m.cast?this.eff(p,"mnd"):this.eff(p,"pow"); let v=m.dmg*(m.hits||1)*atk/50+m.wither*1.2+(m.hold?8:0);
    const want=AR.BANDS.indexOf(this.prefer(p)), now=AR.BANDS.indexOf(this.band());
    if(m.push>0&&want>now) v+=m.push*0.6; if(m.push<0&&want<now) v+=-m.push*0.6;
    return v*m.acc/100; }
  smart(p){
    const o=this.p[1-p.i], band=this.band(), want=this.prefer(p), wi=AR.BANDS.indexOf(want), bi=AR.BANDS.indexOf(band), d=this.dirTo(p);
    const ready=p.f.moves.filter(m=>this.inRange(m)&&!m.step&&!m.buff);
    const back=d>0?p.x:AR.LEN-p.x;   // room behind it
    // pinned against a wall at Close when it wants space: swap out, or shove
    if(band==="Close"&&wi>0&&back<8){ const sw=ready.find(m=>m.swap&&p.focus>=m.cost); if(sw&&this.start(p,sw)) return; if(this.shove(p)) return; }
    if(band==="Close"&&wi>1&&this.rand()<0.3&&this.shove(p)) return;
    const best=ready.filter(m=>!m.swap).map(m=>[m,this.value(p,m)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
    const ob=AR.BANDS.indexOf(this.prefer(o));
    if(best.length){
      const top=best[0][0], afford=best.find(x=>x[0].cost<=p.focus);
      if(top.cost<=p.focus){ if(this.start(p,top)) return; }
      else if(afford&&(top.cost-p.focus)/this.regen(p)>1.5){ if(this.start(p,afford[0])) return; }   // a long wait for the big one: take the smaller hit now
      // waiting for focus: drift toward the band it likes, or away from a chaser if it has room
      if(bi<wi&&back>18){ this.walk(p,-d); return; }
      if(bi>wi){ this.walk(p,d); return; }
      return;
    }
    // nothing reaches from here: move toward the band it likes
    const away=wi>bi||(wi===bi&&ob<wi);
    const mv=p.f.moves.find(m=>m.step&&(away?m.step<0:m.step>0)&&p.focus>=m.cost+15);
    if(mv&&(away?bi<=1&&back>15:Math.abs(bi-wi)>1)&&this.start(p,mv)) return;
    this.walk(p,away?-d:d);
  }
  /* no plan: walks in and throws whatever reaches */
  naive(p){ const ready=p.f.moves.filter(m=>this.inRange(m)&&m.dmg&&m.cost<=p.focus).sort((a,b)=>b.dmg*(b.hits||1)-a.dmg*(a.hits||1));
    if(ready.length&&this.start(p,ready[0])) return; this.walk(p,this.dirTo(p)); }
  run(){ while(!this.over) this.step(); return this; }
}
