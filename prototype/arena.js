/* The new arena, first pass: a real-time fight on a line between two walls, run in fixed steps of a tenth of a second
   so cup fights between computer monsters can be simulated instantly. Not hooked into the game yet.
   Needs battle.js (edge, vs, makeFighter) and skills.js (SKILLS). The numbers follow the "Snabits arena and movesets" doc. */
const AR={ LEN:100, BODY:6, DT:0.1, TIME:60, BANDS:["Close","Near","Mid","Far"] };
const AR_SHOVE={name:"Shove",range:"Close",dmg:0,acc:95,sharp:0,wither:0,push:18,cost:0,wind:0.2,shove:true};
const arBand=gap=>gap<10?"Close":gap<25?"Near":gap<45?"Mid":"Far";
/* hitting from further away is harder to set up, so it pays a little more */
const AR_BAND_DMG={Close:0.8,Near:0.95,Mid:1.2,Far:1.5,Any:1};
/* a family's damage, tuned so every family wins about half its fights in the balance sim */
const AR_FAM_DMG={Chomp:0.86,Pinch:0.94,Stilt:0.92,Skit:1.08,Antik:0.95,Squib:1.1,Moko:1.28,Booly:1.23,Plod:0.87,Bipped:0.93,Fizz:1.2,Teep:0.95,Lern:1.4};

/* [name, learned at, range, damage, accuracy, sharpness, wither, push, cost, windup, extras] */
const FAM_MOVES={
  Chomp:[["Bite",1,"Close",24,85,10,2,4,10,0.3],["Lunge",3,"Near",35,75,8,0,0,16,0.5,{dash:"in"}],["Crunch",5,"Close",64,70,12,0,6,30,0.8],["Leapfrog Bite",8,"Close",20,70,5,0,0,14,0.4,{swap:1}],
    ["Body Slam",14,"Close",46,70,5,5,25,26,0.7],["Jaw Lock",20,"Close",25,80,0,12,0,20,0.4,{hold:2}],["Charge",30,"Mid",60,65,10,0,20,34,1.0,{dash:"in"}],["Gnash",40,"Close",15,80,20,1,0,38,0.6,{hits:4}]],
  Pinch:[["Pinch",1,"Close",25,88,10,0,4,10,0.3],["Claw Jab",3,"Near",32,80,8,0,6,14,0.4],["Bunker Down",5,"Any",0,100,0,0,0,20,0.2,{buff:"bunker"}],["Scuttle Under",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Riposte",14,"Close",0,100,0,0,0,18,0.1,{buff:"riposte"}],["Shell Ram",20,"Near",45,70,5,0,20,24,0.6],["Vice Grip",30,"Close",36,75,5,15,0,28,0.5,{hold:1.5}],["Crab Hammer",40,"Close",72,60,20,0,15,40,1.0]],
  Stilt:[["Kick",1,"Near",30,85,8,0,8,10,0.3],["Kick Off",3,"Close",20,85,8,0,0,12,0.3,{step:-25}],["High Kick",5,"Near",74,65,15,0,12,32,0.8],["Vault",8,"Close",18,75,5,0,0,12,0.3,{swap:1}],
    ["Sweep",14,"Close",30,80,5,0,0,16,0.4,{slow:3}],["Long Stride",20,"Mid",40,70,10,0,0,22,0.6,{dash:"near"}],["Axe Kick",30,"Near",75,70,20,0,10,36,0.9],["Stampede",40,"Near",20,75,10,0,10,38,0.6,{hits:3}]],
  Skit:[["Nip",1,"Close",24,90,10,0,0,8,0.2],["Skitter Bite",3,"Near",18,85,8,0,0,12,0.25,{dash:"in"}],["Web",5,"Mid",42,80,5,0,0,18,0.5,{slow:3}],["Web Swing",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Reel In",14,"Mid",20,75,0,0,-25,18,0.5],["Trap Line",20,"Mid",0,100,0,0,0,20,0.4,{slow:4}],["Leg Flurry",30,"Close",14,80,10,0,0,30,0.5,{hits:4}],["Cocoon",40,"Mid",30,60,0,0,0,34,0.9,{hold:2}]],
  Antik:[["Zap",1,"Mid",25,85,5,6,0,10,0.3,{cast:1}],["Static Screen",5,"Mid",45,75,5,8,0,22,0.6,{cast:1}],["Static Hop",8,"Close",15,75,0,8,0,12,0.3,{swap:1}],["Signal Jam",12,"Far",15,80,0,25,0,18,0.5,{cast:1}],
    ["Scan Beam",18,"Far",46,70,10,0,0,28,1.0,{cast:1}],["Feedback",24,"Any",0,100,0,0,0,16,0.2,{buff:"feedback"}],["Short Circuit",30,"Close",50,75,5,15,30,30,0.6,{cast:1}],["Broadcast",40,"Far",80,60,10,15,0,42,1.4,{cast:1}]],
  Squib:[["Squirt",1,"Mid",31,90,5,0,4,8,0.3,{cast:1}],["Jet Back",3,"Any",0,100,0,0,0,14,0.15,{step:-30,selfHeal:0.06}],["Ink Jet",5,"Far",52,75,5,0,0,18,0.5,{cast:1}],["Slip Past",8,"Close",10,85,0,0,0,10,0.2,{swap:1}],
    ["Tentacle Lash",14,"Near",48,75,10,0,10,20,0.5],["Bubble Wall",20,"Any",0,100,0,0,0,22,0.3,{buff:"bubble"}],["Undertow",30,"Far",35,70,0,0,-30,26,0.7,{cast:1}],["Riptide",40,"Mid",90,65,10,10,15,38,1.0,{cast:1}]],
  Moko:[["Stare",1,"Far",36,90,5,10,0,10,0.3,{cast:1}],["Glare",5,"Far",0,85,0,6,0,16,0.4,{cast:1,lower:1}],["Blink",8,"Close",16,90,0,6,0,14,0.2,{swap:1,cast:1}],["Mind Prick",12,"Far",56,80,10,18,0,20,0.4,{cast:1}],
    ["Dread",18,"Near",28,80,0,20,35,24,0.5,{cast:1}],["Unblinking",24,"Any",0,100,0,0,0,18,0.2,{buff:"unblink"}],["Eye Beam",30,"Far",96,70,12,10,0,36,1.1,{cast:1}],["Hypnotize",40,"Mid",0,65,0,15,0,34,0.8,{cast:1,hold:2}]],
  Booly:[["Wisp Shot",1,"Far",36,85,5,0,0,10,0.3,{cast:1}],["Boo!",3,"Close",5,90,0,5,35,10,0.2,{cast:1}],["Phase Shift",5,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Soul Pass",8,"Close",14,95,0,0,0,14,0.2,{swap:1,cast:1,drain:1}],
    ["Haunt",14,"Near",30,80,0,20,20,18,0.4,{cast:1}],["Will-o'-Wisp",20,"Far",56,75,5,0,0,24,0.6,{cast:1}],["Poltergeist",30,"Mid",60,70,5,0,15,30,0.7,{cast:1}],["Spirit Lance",40,"Far",92,70,15,0,0,38,1.2,{cast:1}]],
  /* the five families added 14 Nov 2026: Plod the slow tank, Bipped the boxer, Fizz the potion thrower, Teep the steady caster, Lern the quick caster */
  Plod:[["Trunk Swat",1,"Close",25,88,8,0,8,10,0.3],["Stomp",3,"Near",32,80,5,0,6,14,0.5,{slow:2}],["Trunk Slam",5,"Close",66,70,12,0,25,30,0.8],["Trunk Toss",8,"Close",15,80,0,0,0,12,0.35,{swap:1}],
    ["Trumpet",14,"Mid",18,85,0,15,30,20,0.5,{cast:1}],["Thick Hide",20,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Quake Stomp",30,"Mid",58,70,8,0,15,32,0.9],["Mammoth Charge",40,"Far",80,65,10,0,30,40,1.1,{dash:"in"}]],
  Bipped:[["Jab",1,"Close",22,92,10,0,4,8,0.2],["Dash Punch",3,"Near",30,80,8,0,6,14,0.4,{dash:"in"}],["One-Two",5,"Close",28,85,10,0,6,22,0.4,{hits:2}],["Hip Toss",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Uppercut",14,"Close",48,75,15,0,15,24,0.6],["Guard Up",20,"Any",0,100,0,0,0,16,0.1,{buff:"riposte"}],["Haymaker",30,"Close",78,65,15,0,20,36,0.9],["Flurry Punch",40,"Close",14,85,10,0,0,38,0.6,{hits:5}]],
  Fizz:[["Bubble",1,"Mid",28,90,5,0,0,10,0.3,{cast:1}],["Cork Pop",3,"Close",22,85,5,0,30,12,0.3,{cast:1}],["Potion Toss",5,"Mid",40,85,5,0,0,22,0.6,{cast:1,status:["Poison",45]}],["Cork Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Brew Up",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.18}],["Acid Splash",20,"Near",44,80,8,0,0,22,0.5,{cast:1,status:["Crack",25]}],["Boil Over",30,"Mid",66,75,8,0,10,32,0.8,{cast:1,status:["Burn",25]}],["Explosive Brew",40,"Far",94,65,10,0,20,40,1.2,{cast:1}]],
  Teep:[["Splash",1,"Near",26,90,5,0,4,10,0.3,{cast:1}],["Lid Bonk",3,"Close",28,85,8,0,8,12,0.3],["Steam Jet",5,"Far",50,80,8,0,0,24,0.7,{cast:1,status:["Blind",30]}],["Spin Pour",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cast:1}],
    ["Tea Time",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Scald",20,"Mid",46,80,8,0,6,24,0.6,{cast:1,status:["Burn",25]}],["Whistle",30,"Far",22,85,0,25,0,24,0.5,{cast:1,status:["Daze",35]}],["Boiling Point",40,"Mid",92,65,12,0,15,40,1.2,{cast:1}]],
  Lern:[["Ember",1,"Far",32,88,5,0,0,10,0.3,{cast:1}],["Float Back",3,"Any",0,100,0,0,0,10,0.15,{step:-28}],["Flash",5,"Mid",34,95,5,8,0,20,0.4,{cast:1,status:["Blind",50]}],["Lantern Swing",8,"Close",16,85,0,0,0,12,0.3,{swap:1}],
    ["Paper Fold",14,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Spark Shower",20,"Mid",16,80,5,0,0,24,0.6,{cast:1,hits:3}],["Beacon",30,"Far",68,75,10,8,0,32,0.9,{cast:1}],["Sky Lantern",40,"Far",94,65,12,0,0,40,1.3,{cast:1}]],
};
const SHARED_MOVES=[["Dash In",1,"Any",0,100,0,0,0,10,0.2,{step:20}],["Leap Back",1,"Any",0,100,0,0,0,10,0.2,{step:-20}],["Brace",1,"Any",0,100,0,0,0,6,0.1,{buff:"brace"}]];
/* how fast each family gets around: Booly floats and Squib jets, while Chomp and Pinch plod */
const FAM_WALK={Chomp:0.8,Pinch:0.85,Stilt:1.05,Skit:1.15,Antik:1,Squib:1.15,Moko:1.05,Booly:1.25,Plod:0.75,Bipped:1.05,Fizz:1,Teep:0.85,Lern:1.15};
/* a family's first move takes its element, the way Skit's Web already does: a Blaze Chomp bites with Flame Bite */
const EL_PREFIX={Blaze:"Flame",Frost:"Frost",Tide:"Aqua",Spark:"Volt",Wild:"Leaf",Venom:"Toxic",Charm:"Heart",Stone:"Rock",Light:"Shine",Steel:"Iron",Shade:"Shadow",Void:"Void"};
const arMove=r=>({name:r[0],lv:r[1],range:r[2],dmg:r[3],acc:r[4],sharp:r[5]/100,wither:r[6],push:r[7],cost:r[8],wind:r[9],...(r[10]||{})});

/* an element skill turned into an arena move: its range comes from the animation it plays.
   Support skills come in too, aimed at any range, and their focus cost comes from their old energy cost. Field skills stay out for now. */
const AR_RANGE={bite:"Close",punch:"Close",claw:"Close",shadowstrike:"Close",shadowclaw:"Close",stomp:"Close",
  tackle:"Near",push:"Near",spear:"Near",rockpath:"Near",fly:"Near",
  bolt:"Mid",volley:"Mid",drain:"Mid",mist:"Mid",gust:"Mid",boulder:"Mid",firespin:"Mid",
  beam:"Far",lightning:"Far",pillar:"Far",tornado:"Far",meteor:"Far",icefall:"Far",wave:"Far",lift:"Far"};
const AR_SKILL_KEYS=["drain","recoil","steal","lower","lowerChance","selfLower","sure","noDodge","pierce","ifPoison","ifStatus","hitsRange","atkStat","hpScale",
  "heal","regen","rest","raise","protect","counter","counterMul","mirror","castWard","bulwark","endure","statusBlock","cleanse","afterimage","inflict","taunt","erase","foresight"];
function arFromSkill(n){
  const s=SKILLS[n]; if(!s||s.field) return null;
  const k=typeof MOVE_KIND!=="undefined"?MOVE_KIND[n]:null, support=!s.power;
  const range=support?"Any":AR_RANGE[k]||(s.kind==="Strike"?"Close":"Mid"), X={};
  for(const q of AR_SKILL_KEYS) if(s[q]!=null) X[q]=s[q];
  return {name:n,range,dmg:s.power||0,acc:s.acc||100,sharp:0.05+(s.crit||0),wither:0,push:k==="push"?25:0,
    cost:support?Math.min(45,8+s.cost*7):Math.min(45,Math.round((s.power||0)/2.6)+4),
    wind:support?0.3:Math.min(1.4,0.25+(s.power||0)/140)*(s.first?0.5:1),el:s.el,cast:s.kind==="Cast",hits:s.hits||1,status:s.status,support,skill:s,...X};
}
/* every move a Snabit can use in the arena: its family's up to its level, the shared moves, and its element skills */
function arMoves(fam,level,known,el){
  const fm=(FAM_MOVES[fam]||[]).map(arMove).filter(m=>m.lv<=level), sh=SHARED_MOVES.map(arMove);
  if(el&&EL_PREFIX[el]&&fm[0]){ fm[0].base=fm[0].name; fm[0].name=`${EL_PREFIX[el]} ${fm[0].name}`; fm[0].el=el; }
  for(const m of fm) if(m.name==="Potion Toss"&&el&&typeof POTION_BY_EL!=="undefined"&&POTION_BY_EL[el]) m.status=[POTION_BY_EL[el],45];   // the bottle holds its element's status
  const elm=(known||[]).map(arFromSkill).filter(Boolean), seen=new Set();
  // a skill with the same name as a family move (Crunch, High Kick) shows once, as the family move
  return fm.concat(sh,elm).filter(m=>!seen.has(m.name)&&seen.add(m.name));
}

/* Statuses run on the clock in seconds, one at a time, the way the old battle had them.
   d: how long it lasts. dot: share of max HP lost each second. stat: a stat multiplied while it lasts.
   Root drains into whoever rooted it and stops walking. Freeze stops everything until it thaws or a hit breaks the ice.
   Shock has a chance each second to lock it up for a moment. Daze makes it use the wrong move half the time, once.
   Blind costs hit chance. Curse makes moves cost more and focus come back slower. Dread stops it using the same move twice in a row. */
const AR_STATUS={Burn:{d:7,dot:0.016,stat:{pow:0.8}},Poison:{d:8,dot:0.02},Root:{d:6,dot:0.012,leech:1},Freeze:{d:2.5},Shock:{d:7,jolt:0.3},
  Soak:{d:8,stat:{spd:0.75}},Daze:{d:5},Crack:{d:9,stat:{grd:0.75}},Blind:{d:6},Curse:{d:8},Dread:{d:7}};
const AR_STAGE_T=12, AR_STATS=["pow","grd","mnd","spr","spd"];
const arStageMul=n=>n>0?1+0.25*n:1/(1-0.25*n);
/* family buffs, in seconds */
const AR_BUFF_T={bunker:4,unblink:3,feedback:2,phase:3,bubble:6,riposte:1.5,brace:1.5};

class Arena{
  /* a and b: fighters from makeFighter, each with .moves (arMoves) and .family; ai: "smart" or "naive" per side */
  constructor(a,b,rand,ai=["smart","smart"]){
    this.rand=rand; this.t=0; this.over=false; this.winner=null; this.log=[]; this.ev=[];   // ev: what happened this step, for the screen to animate
    this.p=[a,b].map((f,i)=>({f,i,x:i?70:30,focus:30,act:null,cool:0,think:0.6,hold:0,slow:0,stun:0,sleep:0,thawT:0,shoveCool:0,buff:{},hp:f.maxhp,maxhp:f.maxhp,ai:ai[i],dealt:0,
      st:null,stg:{pow:0,grd:0,mnd:0,spr:0,spd:0},stgT:{},heals:0,uses:{},last:null,regenT:0,counterMul:1.5}));
  }
  gap(){ return Math.abs(this.p[0].x-this.p[1].x)-AR.BODY; }
  band(){ return arBand(this.gap()); }
  has(p,name){ return !!(p.st&&p.st.name===name); }
  // a stat right now: its base, its raised or lowered stages, and any status that weakens it
  eff(p,k){ let v=p.f.base[k]; const n=p.stg&&p.stg[k]; if(n) v*=arStageMul(n); const S=p.st&&AR_STATUS[p.st.name]; if(S&&S.stat&&S.stat[k]) v*=S.stat[k]; return v; }
  cost(p,m){ return this.has(p,"Curse")?Math.round(m.cost*1.25):m.cost; }
  // asleep, frozen or locked up by a shock or a wall slam: it can't act or walk
  canAct(p){ return !(p.stun>0||p.sleep>0||this.has(p,"Freeze")); }
  dirTo(p){ const o=this.p[1-p.i]; return o.x>p.x?1:-1; }
  inRange(m){ return m.range==="Any"||m.range===this.band(); }
  speed(p){ const o=this.p[1-p.i]; return 12*(FAM_WALK[p.f.family]||1)*(1+edge(this.eff(p,"spd"),this.eff(o,"spd"),0.6,-0.35,0.45))*(p.slow>0?0.5:1)*(this.has(p,"Soak")?0.85:1); }
  /* the chance a move lands right now: its accuracy, a little more with focus held, Insight against the target's Speed,
     less if the target is on the move or phased out, less again when blinded, and more against a target that can't get away */
  hitChance(p,m){ const o=this.p[1-p.i]; if(m.sure||p.buff.foresight&&m.cast) return 1;
    const moving=o.walkT!=null&&this.t-o.walkT<0.3, stuck=!this.canAct(o)||o.hold>0, nd=!!m.noDodge;
    return Math.max(0.05,Math.min(0.97,m.acc/100+p.focus/99*0.06+edge(this.eff(p,"spr"),this.eff(o,"spd"),0.4,-0.25,0.12)-(moving&&!nd?0.08:0)-(o.buff.phase&&!nd?0.3:0)
      +(p.buff.unblink?0.1:0)-(this.has(p,"Blind")?0.2:0)+(stuck?0.25:0))); }
  statusOdds(p,o){ return Math.max(0.5,Math.min(1.5,1+edge(this.eff(p,"mnd"),this.eff(o,"spr"),0.6,-0.5,0.5))); }
  regen(p){ const o=this.p[1-p.i]; return 5.5*(1+edge(this.eff(p,"sta"),this.eff(o,"sta"),0.5,-0.3,0.4))*(this.has(p,"Curse")?0.7:1); }
  walk(p,dir){ if(p.hold>0||!this.canAct(p)||this.has(p,"Root")) return; const o=this.p[1-p.i], nx=p.x+dir*this.speed(p)*AR.DT;
    const lo=o.x<p.x?o.x+AR.BODY:0, hi=o.x>p.x?o.x-AR.BODY:AR.LEN, x0=p.x; p.x=Math.max(lo,Math.min(hi,nx)); if(Math.abs(p.x-x0)>0.01) p.walkT=this.t; }
  // whether a status or a taunt stops this move: Dread bars the same move twice, Taunt bars support, Root bars stepping
  allowed(p,m){ if(m.shove) return true;
    if(this.has(p,"Dread")&&m.name===p.last) return false;
    if(p.buff.taunt&&(m.support||m.buff)) return false;
    if(this.has(p,"Root")&&(m.step||m.dash||m.swap)) return false;
    return true; }
  /* Using a move takes a turn, the way MR2 does it: whoever acts first goes, the fight and the clock stop while the move plays out,
     then both carry on from where they stand. On screen (live) the turn waits for the animation; in a simulation it resolves at once.
     The computer needs a moment to react before it can act, and a Snabit can't act again until a short recovery has passed.
     Whether it lands is rolled here, so the screen knows at the start whether the target will get out of the way. */
  start(p,m){ if(this.turn||this.over||p.cool>0||!this.canAct(p)||p.ai!=="human"&&p.think>0||!this.allowed(p,m)||p.focus<this.cost(p,m)) return false;
    // dazed: half the time it does something else, and the daze wears off once it has
    if(this.has(p,"Daze")&&!m.shove&&this.rand()<0.5){ const alt=p.f.moves.filter(x=>x!==m&&!x.step&&this.cost(p,x)<=p.focus&&this.allowed(p,x));
      if(alt.length){ const to=alt[Math.floor(this.rand()*alt.length)]; this.ev.push({t:"daze",i:p.i,from:m.name,to:to.name}); m=to; }
      this.ev.push({t:"cure",i:p.i,name:"Daze"}); p.st=null; }
    p.focus-=this.cost(p,m); p.last=m.name; p.uses[m.name]=(p.uses[m.name]||0)+1;
    const roll=this.rand(); this.ev.push({t:"start",i:p.i,m,pred:this.predict(p,m,roll)});
    if(SKILLS[m.name]){ const o=this.p[1-p.i]; (p.f.used=p.f.used||{})[m.name]=(p.f.used[m.name]||0)+1; (o.f.seen=o.f.seen||{})[m.name]=1; }
    if(p.f.habit&&p.ai==="human") p.f.habit[m.name]=(p.f.habit[m.name]||0)+1;
    if(this.live) this.turn={i:p.i,m,roll}; else { this.resolve(p,m,roll); this.afterTurn(p); }
    return true; }
  /* what the move will do when it lands, worked out the same way resolve does, so the screen can start a dodge or raise a shield in time */
  predict(p,m,roll){ const o=this.p[1-p.i];
    if(m.buff||m.step&&!m.dmg) return "self";
    if(m.support) return m.inflict||m.lower||m.taunt||m.erase?(o.buff.protect?"block":roll>(m.acc||100)/100*(m.inflict?this.statusOdds(p,o):1)?"resist":"hit"):"self";
    if(!m.dash&&!this.inRange(m)) return "out";
    if(o.buff.bubble&&(m.range==="Mid"||m.range==="Far")) return "block";
    if(o.buff.protect&&(m.dmg||m.status)) return "block";
    if(roll>this.hitChance(p,m)) return o.buff.phase&&!m.noDodge?"phase":"dodge";
    return o.buff.mirror&&m.cast&&m.dmg?"mirror":"hit"; }
  /* on screen: the move lands at its contact frame, then the turn ends when the animation finishes */
  land(){ if(!this.turn||this.turn.done) return; this.turn.done=true; this.resolve(this.p[this.turn.i],this.turn.m,this.turn.roll); }
  endTurn(){ if(!this.turn) return; const p=this.p[this.turn.i]; if(!this.turn.done) this.land(); this.turn=null; this.afterTurn(p); }
  afterTurn(p){ p.cool=0.6; for(const q of this.p) q.think=Math.max(q.think,0.35+this.rand()*0.35); }
  checkEnd(){ const [a,b]=this.p; if(a.hp<=0||b.hp<=0){ this.over=true; this.winner=a.hp<=0&&b.hp<=0?null:a.hp<=0?1:0; } }
  heal(f,amt,src,from){ const n=Math.max(0,Math.min(Math.round(amt),f.maxhp-f.hp)); if(f.hp<=0) return 0; f.hp+=n; this.ev.push({t:"heal",i:f.i,amt:n,src,from}); return n; }
  inflict(f,name,pct,from){
    if(f.hp<=0||f.st||f.buff.ward||!AR_STATUS[name]) return false;
    if(name==="Freeze"&&f.thawT>0) return false;
    if(name==="Poison"&&(f.f.el1==="Steel"||f.f.el2==="Steel")) return false;
    if(name==="Blind"&&f.f.ability==="Bright") return false;   // Lern's Bright
    if(this.rand()*100>=pct) return false;
    f.st={name,t:AR_STATUS[name].d*(from&&from.f.ability==="Volatile"?1.3:1),from:from?from.i:null,tick:0}; this.ev.push({t:"status",i:f.i,name}); return true; }   // Volatile: Fizz's statuses last 30% longer
  // raise (sign 1) or lower (sign -1) stats for a while; Bulwark keeps its stats from being lowered
  stage(f,what,sign){ if(typeof what==="number") what={pow:what};
    for(const [k,n] of Object.entries(what)){ if(!AR_STATS.includes(k)) continue;
      if(sign<0&&(f.buff.bulwark||k==="spr"&&f.f.ability==="Bright")){ this.ev.push({t:"stage",i:f.i,k,n:0}); continue; }
      const was=f.stg[k]; f.stg[k]=Math.max(-3,Math.min(3,was+sign*n)); f.stgT[k]=AR_STAGE_T; this.ev.push({t:"stage",i:f.i,k,n:f.stg[k]-was}); } }
  step(){
    if(this.over||this.turn) return;
    for(const p of this.p) p.px=p.x;   // where it stood last step, so the screen can glide between steps
    for(const p of this.p){ if(!p.buff.brace) p.focus=Math.min(99,p.focus+this.regen(p)*AR.DT*(p.f.ability==="Steeping"&&(p.walkT==null||this.t-p.walkT>0.5)?1.1:1));   // Teep's Steeping
      for(const k of ["cool","hold","slow","stun","sleep","thawT","shoveCool","think"]) p[k]=Math.max(0,p[k]-AR.DT);
      for(const k in p.buff){ p.buff[k]-=AR.DT; if(p.buff[k]<=0){ delete p.buff[k]; this.ev.push({t:"unbuff",i:p.i,k}); } }
      for(const k in p.stgT){ p.stgT[k]-=AR.DT; if(p.stgT[k]<=0){ delete p.stgT[k]; p.stg[k]=0; this.ev.push({t:"stage",i:p.i,k,n:0,end:1}); } }
      if(p.buff.regen){ p.regenT+=AR.DT; if(p.regenT>=1){ p.regenT-=1; this.heal(p,p.maxhp*0.025,"regen"); } } else p.regenT=0;
      // a status ticks once a second: damage over time, Root's drain back to the rooter, Shock's jolts
      const st=p.st; if(st){ const S=AR_STATUS[st.name]; st.t-=AR.DT; st.tick+=AR.DT;
        if(st.tick>=1){ st.tick-=1; const src=st.from!=null?this.p[st.from]:null;
          if(S.dot){ const d=Math.max(1,Math.round(p.maxhp*S.dot)); p.hp=Math.max(0,p.hp-d); if(src) src.dealt+=d; this.ev.push({t:"tick",i:p.i,name:st.name,dmg:d}); if(S.leech&&src) this.heal(src,d,"leech",p.i); }
          if(S.jolt&&this.rand()<S.jolt){ p.stun=Math.max(p.stun,0.7); this.ev.push({t:"jolt",i:p.i}); } }
        if(st.t<=0&&p.st===st){ this.ev.push({t:"cure",i:p.i,name:st.name}); if(st.name==="Freeze") p.thawT=5; p.st=null; } } }
    this.checkEnd(); if(this.over) return;
    // the two sides decide in a random order each step, so neither always gets the first move
    for(const p of this.rand()<0.5?this.p:[this.p[1],this.p[0]]){ if(this.turn||this.over) break; if(!this.canAct(p)) continue;
      if(p.ai==="human"){ if(p.wantDir&&!p.hold) this.walk(p,p.wantDir); } else (p.ai==="naive"?this.naive(p):this.smart(p)); }
    if(this.turn||this.over) return;
    this.t+=AR.DT;
    if(this.t>=AR.TIME){ this.over=true; const r=this.p.map(p=>p.hp/p.maxhp); this.winner=r[0]===r[1]?null:r[0]>r[1]?0:1; this.judged=true; if(this.winner===null&&this.noDraw) this.winner=this.p[0].dealt>=this.p[1].dealt?0:1; }
  }
  /* a support skill: it works on the user, or on the target for the ones that lower, inflict, taunt or erase */
  support(p,m,roll){ const o=this.p[1-p.i];
    this.ev.push({t:"buff",i:p.i,m});
    if(m.inflict||m.lower||m.taunt||m.erase){
      if(o.buff.protect){ delete o.buff.protect; this.ev.push({t:"block",i:p.i,m}); return; }
      if(roll>(m.acc||100)/100*(m.inflict?this.statusOdds(p,o):1)){ this.ev.push({t:"miss",i:p.i,m,why:"resist"}); return; }
      if(m.inflict&&!this.inflict(o,m.inflict,100,p)) this.ev.push({t:"miss",i:p.i,m,why:"resist"});
      if(m.lower) this.stage(o,m.lower,-1);
      if(m.taunt){ o.buff.taunt=6; this.ev.push({t:"taunt",i:o.i}); }
      if(m.erase){ for(const k in o.buff) if(k!=="taunt") delete o.buff[k]; for(const k of AR_STATS) if(o.stg[k]>0){ o.stg[k]=0; delete o.stgT[k]; } this.ev.push({t:"erase",i:o.i}); }
      return; }
    // each heal in a fight is a quarter weaker than the one before, so a Snabit can't heal its way through a whole fight
    if(m.heal){ this.heal(p,p.maxhp*m.heal*0.7*Math.pow(0.75,p.heals),"heal"); p.heals++; }
    if(m.rest){ p.sleep=2.5; this.ev.push({t:"sleep",i:p.i}); }
    if(m.regen) p.buff.regen=m.regen*2;
    if(m.cleanse){ if(p.st){ this.ev.push({t:"cure",i:p.i,name:p.st.name,why:"cleanse"}); p.st=null; } for(const k of AR_STATS) if(p.stg[k]<0){ p.stg[k]=0; delete p.stgT[k]; } }
    if(m.statusBlock) p.buff.ward=m.statusBlock*2.5;
    if(m.raise) this.stage(p,m.raise,1);
    if(m.protect) p.buff.protect=3;
    if(m.counter){ p.buff.counter=2.5; p.counterMul=m.counterMul||1.5; }
    if(m.mirror) p.buff.mirror=5;
    if(m.castWard) p.buff.castWard=8;
    if(m.bulwark) p.buff.bulwark=10;
    if(m.endure) p.buff.endure=3;
    if(m.afterimage) p.buff.phase=4;
    if(m.foresight) p.buff.foresight=8;
  }
  resolve(p,m,roll=this.rand()){
    const o=this.p[1-p.i], d=this.dirTo(p), R=this.rand;
    if(m.buff){ this.ev.push({t:"buff",i:p.i,m}); p.buff[m.buff]=AR_BUFF_T[m.buff]||1.5; return; }
    if(m.support){ this.support(p,m,roll); return; }
    if(m.step&&!m.dmg){ this.stepMove(p,m); if(m.selfHeal) this.heal(p,p.maxhp*m.selfHeal,"heal"); return; }
    if(m.step){ this.strike(p,m,roll); if(!this.over) this.stepMove(p,m); return; }   // hit, then hop back
    this.strike(p,m,roll);
  }
  stepMove(p,m){ const o=this.p[1-p.i], d=this.dirTo(p); this.ev.push({t:"step",i:p.i,m}); const s=m.step*d, lo=o.x<p.x?o.x+AR.BODY:0, hi=o.x>p.x?o.x-AR.BODY:AR.LEN; p.x=Math.max(lo,Math.min(hi,p.x+s)); }
  strike(p,m,roll){
    const o=this.p[1-p.i], d=this.dirTo(p), R=this.rand;
    if(m.dash){ const want=m.dash==="near"?14:AR.BODY+2; p.x=o.x-d*want; p.x=Math.max(0,Math.min(AR.LEN,p.x)); }
    else if(!this.inRange(m)){ this.ev.push({t:"miss",i:p.i,m,why:"out"}); return; }   // it stepped out of reach during the windup
    if(o.buff.bubble&&(m.range==="Mid"||m.range==="Far")){ delete o.buff.bubble; this.ev.push({t:"miss",i:p.i,m,why:"block"}); return; }
    if(o.buff.protect&&(m.dmg||m.status)){ delete o.buff.protect; this.ev.push({t:"block",i:p.i,m}); return; }
    if(roll>this.hitChance(p,m)){ this.ev.push({t:"miss",i:p.i,m,why:o.buff.phase&&!m.noDodge?"phase":"dodge"}); if(o.f.ability==="Counterpunch") o.cpunch=1; return; }   // Bipped's Counterpunch
    // a mirror sends a Cast back at whoever threw it
    let tg=o; if(o.buff.mirror&&m.cast&&m.dmg){ delete o.buff.mirror; this.ev.push({t:"mirror",i:o.i,m}); tg=p; }
    const hitBy=tg===p?o:p;   // whose hit it counts as on screen
    if(m.swap){ const x=p.x; p.x=o.x; o.x=x; this.ev.push({t:"swap",i:p.i,m}); }
    const nh=m.hitsRange?m.hitsRange[0]+Math.floor(R()*(m.hitsRange[1]-m.hitsRange[0]+1)):(m.hits||1);
    let total=0, sure=p.buff.foresight&&m.cast; if(sure) delete p.buff.foresight;
    for(let h=0;h<nh&&tg.hp>0;h++) if(m.dmg){
      const atk=this.eff(p,m.atkStat||(m.cast?"mnd":"pow")), con=m.pierce&&tg.stg.grd>0?tg.f.base.grd:this.eff(tg,"grd"), dfs=m.cast?(con+3*(tg.f.level+5))/4:(con+tg.f.level+5)/2;
      let dmg=m.dmg*atk/dfs*(p.f.level/50+0.4)/2*0.55*AR_BAND_DMG[m.range]*(AR_FAM_DMG[p.f.family]||1);
      if(m.el&&typeof vs==="function"){ const mm=vs(m.el,tg.f.el1)*(tg.f.el2?vs(m.el,tg.f.el2):1); dmg*=mm; if(m.el===p.f.el1||m.el===p.f.el2) dmg*=1.2; }
      if(m.hpScale) dmg*=0.4+0.6*p.hp/p.maxhp;
      if(m.ifPoison&&this.has(tg,"Poison")||m.ifStatus&&tg.st) dmg*=2;
      if(m.el==="Spark"&&this.has(tg,"Soak")) dmg*=1.25;
      let shatter=false; if(this.has(tg,"Freeze")){ dmg*=1.25; shatter=true; }
      const crit=sure||!tg.buff.bulwark&&R()<m.sharp+edge(this.eff(p,"pow"),con,0.2,0,0.12); if(crit) dmg*=1.5;
      if(p.cpunch&&!m.cast&&tg===o) dmg*=1.2;
      if(tg.buff.brace) dmg*=0.6; if(tg.buff.bunker) dmg*=0.8; if(tg.buff.castWard&&m.cast) dmg*=0.5;
      dmg=Math.max(1,Math.round(dmg*(0.9+R()*0.1)));
      if(tg.buff.endure&&dmg>=tg.hp){ dmg=Math.max(0,tg.hp-1); delete tg.buff.endure; this.ev.push({t:"endure",i:tg.i}); }
      tg.hp=Math.max(0,tg.hp-dmg); hitBy.dealt+=dmg; total+=dmg; this.ev.push({t:"hit",i:hitBy.i,m,dmg,crit,h}); if(SKILLS[m.name]) (tg.f.hitBy=tg.f.hitBy||{})[m.name]=1;
      if(shatter){ this.ev.push({t:"cure",i:tg.i,name:"Freeze",why:"shatter"}); tg.st=null; tg.thawT=5; }
      if(tg.sleep>0){ tg.sleep=0; this.ev.push({t:"wake",i:tg.i}); }
      if(tg===o&&!m.cast){ const ct=o.buff.counter?o.counterMul:o.buff.riposte?1.5:0;
        if(ct){ const back=Math.round(dmg*ct); p.hp=Math.max(0,p.hp-back); o.dealt+=back; this.ev.push({t:"counter",i:o.i,dmg:back}); if(o.buff.counter) delete o.buff.counter; } }
    }
    if(p.cpunch&&!m.cast&&m.dmg) p.cpunch=0;
    if(m.drain&&total&&tg===o) this.heal(p,total*m.drain,"drain",o.i);
    if(m.recoil&&total){ const r=Math.max(1,Math.round(total*m.recoil)); p.hp=Math.max(0,p.hp-r); this.ev.push({t:"recoil",i:p.i,dmg:r}); }
    if(m.steal&&tg===o){ const f=Math.min(o.focus,m.steal*6); o.focus-=f; p.focus=Math.min(99,p.focus+f); this.ev.push({t:"steal",i:p.i,amt:Math.round(f)}); }
    if(m.status&&tg.hp>0) this.inflict(tg,m.status[0],m.status[1]*this.statusOdds(p,tg),hitBy===p?p:o);
    if(m.lower&&tg.hp>0&&R()*100<(m.lowerChance||100)) this.stage(tg,m.lower,-1);
    if(m.selfLower) this.stage(p,m.selfLower,-1);
    if(m.wither){ const w=m.wither*(1+edge(this.eff(p,"mnd"),this.eff(o,"spr"),0.5,-0.3,0.5)); if(o.buff.unblink){} else if(o.buff.feedback) p.focus=Math.max(0,p.focus-w); else o.focus=Math.max(0,o.focus-w); }
    if(m.push&&tg===o&&!o.buff.brace&&!o.buff.bunker){
      const k=1+edge(this.eff(p,m.cast?"mnd":"pow"),this.eff(o,"grd"),0.5,-0.4,0.4), s=m.push*k*(this.has(o,"Root")?0.5:1)*(o.f.ability==="Steady"&&m.push>0?0.5:1);   // Plod's Steady
      if(s>0){ const want=o.x+d*s, wall=d>0?AR.LEN:0, past=Math.abs(want-wall)*(d>0?want>wall:want<wall); o.x=Math.max(0,Math.min(AR.LEN,want));
        if(past>5){ const slam=Math.round(o.maxhp*0.03); o.hp=Math.max(0,o.hp-slam); p.dealt+=slam; o.stun=0.5; this.ev.push({t:"slam",i:o.i,dmg:slam}); } }
      else o.x=p.x+d*Math.max(AR.BODY,Math.abs(o.x-p.x)+s);   // a pull drags it in, but never through the puller
    }
    if(tg===o){ if(m.hold) o.hold=m.hold; if(m.slow) o.slow=m.slow; }
    if(m.selfHeal) this.heal(p,p.maxhp*m.selfHeal,"heal");
    this.checkEnd();
  }
  // Shove is free, with a 1.5 second wait between shoves
  shove(p){ if(this.band()!=="Close"||p.shoveCool>0) return false; const ok=this.start(p,AR_SHOVE); if(ok) p.shoveCool=1.5; return ok; }
  /* the range a Snabit fights best at: the band where its moves do the most damage for their focus */
  prefer(p){ if(p.pref) return p.pref; const sc={Close:0,Near:0,Mid:0,Far:0};
    for(const m of p.f.moves) if(m.range!=="Any"&&m.dmg) sc[m.range]+=m.dmg*(m.hits||1)*m.acc/100*(m.cast?this.eff(p,"mnd"):this.eff(p,"pow"))/m.cost;
    return p.pref=Object.keys(sc).sort((a,b)=>sc[b]-sc[a])[0]; }
  /* how much a support or buff is worth right now, on the same scale as an attack's value: heals when it's hurt,
     cleanses when it has a status, shields when the opponent can hit hard where they stand, and each one less the more it's been used */
  supValue(p,m){ const o=this.p[1-p.i], miss=1-p.hp/p.maxhp, ob=o.f.moves.filter(x=>x.dmg&&(x.range===this.band())).sort((a,b)=>b.dmg-a.dmg)[0];
    const threat=ob&&o.focus>=this.cost(o,ob)*0.7&&ob.dmg>=40;
    let v=0;
    if(m.buff){ if(p.buff[m.buff]) return 0;
      if(m.buff==="bubble") v=ob&&(ob.range==="Mid"||ob.range==="Far")&&threat?24:0;
      else if(m.buff==="unblink") v=p.f.moves.some(x=>x.dmg>=60&&x.acc<80)?12:0;
      else if(m.buff!=="brace") v=threat?14:0; }   // Brace lasts too short for the computer to time it
    if(m.heal) v+=miss>0.35?180*Math.min(m.heal*0.7*Math.pow(0.75,p.heals),miss):0;
    if(m.regen&&!p.buff.regen) v+=miss>0.2?m.regen*7:0;
    if(m.cleanse&&p.st) v+=40;
    if(m.raise&&!Object.keys(m.raise).some(k=>p.stg[k]>0)) v+=14*Object.values(m.raise).reduce((a,b)=>a+b,0);
    if((m.protect||m.counter||m.castWard||m.endure||m.afterimage)&&threat&&!p.buff.protect&&!p.buff.counter) v+=22;
    if(m.mirror&&threat&&ob.cast) v+=26;
    if(m.inflict&&!o.st&&!o.buff.ward) v+=30*(m.acc||100)/100;
    if(m.lower&&!Object.keys(typeof m.lower==="number"?{pow:1}:m.lower).some(k=>o.stg[k]<0)) v+=16;
    if(m.taunt&&!o.buff.taunt&&o.f.moves.some(x=>x.support||x.buff)) v+=12;
    if(m.erase) v+=8*(Object.keys(o.buff).length+AR_STATS.filter(k=>o.stg[k]>0).length);
    if(m.foresight&&!p.buff.foresight&&p.f.moves.some(x=>x.cast&&x.dmg>=60)) v+=14;
    if(m.statusBlock&&!p.buff.ward) v+=p.st?25:6;
    return v*Math.pow(0.7,p.uses[m.name]||0); }
  value(p,m){ const o=this.p[1-p.i]; if(m.buff||m.support) return this.supValue(p,m);
    if(!m.dmg&&m.selfHeal){ const miss=1-p.hp/p.maxhp, wi=AR.BANDS.indexOf(this.prefer(p)), bi=AR.BANDS.indexOf(this.band()); return (miss>0.3?60*m.selfHeal/0.06*miss:0)+(wi>bi?8:0); } if(!m.dmg&&!m.wither&&!m.push&&!m.hold) return 0;
    const atk=m.cast?this.eff(p,"mnd"):this.eff(p,"pow"); let v=m.dmg*(m.hits||1)*atk/50+m.wither*1.2+(m.hold?8:0);
    if(m.status&&!o.st) v+=m.status[1]*0.25; if((m.ifPoison&&this.has(o,"Poison"))||(m.ifStatus&&o.st)) v*=1.8;
    if(m.drain) v*=1+m.drain*(1-p.hp/p.maxhp); if(m.recoil) v*=1-m.recoil*(1-p.hp/p.maxhp)*1.5;
    const want=AR.BANDS.indexOf(this.prefer(p)), now=AR.BANDS.indexOf(this.band());
    if(m.push>0&&want>now) v+=m.push*0.6; if(m.push<0&&want<now) v+=-m.push*0.6;
    const hb=p.f.habit&&p.ai!=="human"?p.f.habit[m.name]||0:0; if(hb) v*=1+0.5*Math.min(1,hb/12);
    return v*Math.min(1,this.hitChance(p,m)+0.1); }
  smart(p){
    const o=this.p[1-p.i], band=this.band(), want=this.prefer(p), wi=AR.BANDS.indexOf(want), bi=AR.BANDS.indexOf(band), d=this.dirTo(p);
    const ready=p.f.moves.filter(m=>this.inRange(m)&&!(m.step&&!m.dmg&&!m.selfHeal)&&this.allowed(p,m));
    const back=d>0?p.x:AR.LEN-p.x;   // room behind it
    // pinned against a wall at Close when it wants space: swap out, or shove
    if(band==="Close"&&wi>0&&back<8){ const sw=ready.find(m=>m.swap&&p.focus>=this.cost(p,m)); if(sw&&this.start(p,sw)) return; if(this.shove(p)) return; }
    if(band==="Close"&&wi>1&&this.rand()<0.3&&this.shove(p)) return;
    const best=ready.filter(m=>!m.swap).map(m=>[m,this.value(p,m)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
    const ob=AR.BANDS.indexOf(this.prefer(o));
    if(best.length){
      const top=best[0][0], afford=best.find(x=>this.cost(p,x[0])<=p.focus);
      if(this.cost(p,top)<=p.focus){ if(this.start(p,top)) return; }
      else if(afford&&(this.cost(p,top)-p.focus)/this.regen(p)>1.5){ if(this.start(p,afford[0])) return; }   // a long wait for the big one: take the smaller hit now
      // waiting for focus: drift toward the band it likes, or away from a chaser if it has room
      if(bi<wi&&back>18){ this.walk(p,-d); return; }
      if(bi>wi){ this.walk(p,d); return; }
      return;
    }
    // nothing reaches from here: move toward the band it likes
    const away=wi>bi||(wi===bi&&ob<wi);
    const mv=p.f.moves.find(m=>m.step&&(away?m.step<0:m.step>0)&&p.focus>=m.cost+15&&this.allowed(p,m));
    if(mv&&(away?bi<=1&&back>15:Math.abs(bi-wi)>1)&&this.start(p,mv)) return;
    this.walk(p,away?-d:d);
  }
  /* no plan: walks in and throws whatever reaches */
  naive(p){ const ready=p.f.moves.filter(m=>this.inRange(m)&&m.dmg&&this.cost(p,m)<=p.focus&&this.allowed(p,m)).sort((a,b)=>b.dmg*(b.hits||1)-a.dmg*(a.hits||1));
    if(ready.length&&this.start(p,ready[0])) return; this.walk(p,this.dirTo(p)); }
  run(){ while(!this.over) this.step(); return this; }
}

/* ---------- the game's fights on the arena ----------
   arFamily: the family whose moves a Snabit uses (a hybrid fights with its body's family).
   arFighter: an arena fighter from a battle fighter: its family's moves up to its level, the shared moves and its skills,
   mastered skills 10% stronger, and any moves the player switched off in the preset left out. */
const arFamily=fam=>typeof FAMILY!=="undefined"&&FAMILY[fam]&&FAMILY[fam].of?FAMILY[fam].of[0]:fam;
function arFighter(f,fam,level,known,el,o={}){
  f.family=arFamily(fam); let mv=arMoves(f.family,level,(known||[]).filter(n=>SKILLS[n]),el);
  if(o.uses) mv=mv.map(m=>SKILLS[m.name]&&(o.uses[m.name]||0)>=(typeof MASTERY!=="undefined"?MASTERY:20)&&m.dmg?{...m,dmg:Math.round(m.dmg*1.1),mastered:true}:m);
  if(o.off&&o.off.length){ const keep=mv.filter(m=>!o.off.includes(m.name)); if(keep.some(m=>m.dmg)) mv=keep; }
  f.moves=mv; if(o.habit) f.habit=o.habit; return f;
}
/* the player's Snabit as an arena fighter, with its fight-day shape, gear, mastery and chosen preset */
function arPlayer(s){
  const f=playerFighter(s), pre=s.arPresets&&s.arPresets[s.arPreset||0];
  s.arHabit=s.arHabit||{};
  return arFighter(f,s.m.family,s.level,typeof knownSkills==="function"?knownSkills(s):(s.skillsKnown||s.equip||[]),s.m.el1,{uses:s.uses,off:pre,habit:s.arHabit});
}
/* a computer Snabit: its family moves and every skill in its pool it has reached */
function arFoe(o){
  const f=o.fighter||makeFighter(o.fm,o.skills,o.level), m=o.m||o.fm;
  const known=m.pool?m.pool.filter(n=>SKILLS[n]&&SKILLS[n].lv<=o.level).concat(o.skills||[]):(o.skills||[]);
  arFighter(f,m.family,o.level,[...new Set(known)],m.el1);
  if(o.boss){ f.maxhp=Math.round(f.maxhp*1.25); f.hp=f.maxhp; f.name=o.boss; }
  return f;
}
/* a fight worked out off screen, in the shape the old simFight gave: winner, judged, how long it ran, and both sides' HP */
function arSim(a,b,rand,noDraw){
  const ar=new Arena(a,b,rand); ar.noDraw=!!noDraw; ar.run();
  return {winner:ar.winner,judged:!!ar.judged,turn:Math.round(ar.t),secs:Math.round(ar.t),ar,p:ar.p.map(x=>Object.assign(x.f,{hp:x.hp,maxhp:x.maxhp}))};
}
