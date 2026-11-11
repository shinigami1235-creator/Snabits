/* Snabits skills. Each element has 8, learned by level, the last two at 34 and 42; Void has 7; neutral skills fill out a pool.
   Fields: el, kind (Strike/Cast/Support/Field), cost (energy), power, acc, lv (learn level), plus mechanics:
   status [name, %], first (priority), hits (multi-hit), drain (share healed), recoil (share taken),
   charge (fires next turn), focus (charge that fails if hit), sunInstant, protect, counter, raise/lower {stat:steps},
   selfLower (after use), heal (share of max HP), rest, taunt, steal (energy), crit (chance), noDodge, sure,
   ifStatus / ifPoison (double power), field, inflict, cleanse, mirror, erase, regen. */
const SKILLS={
  // Blaze
  "Ember Bite":{el:"Blaze",kind:"Strike",cost:2,power:45,acc:100,lv:1,status:["Burn",20]},
  "Heat Haze":{el:"Blaze",kind:"Field",cost:3,lv:1,field:"Sunlit"},
  "Fire Wheel":{el:"Blaze",kind:"Strike",cost:3,power:25,hits:2,acc:95,lv:8,status:["Burn",15]},
  "Flame Pillar":{el:"Blaze",kind:"Cast",cost:5,power:90,acc:90,lv:14},
  "Flare Charge":{el:"Blaze",kind:"Cast",cost:6,power:130,acc:100,lv:20,charge:true},
  "Inferno":{el:"Blaze",kind:"Strike",cost:7,power:120,acc:85,lv:28,recoil:0.25},
  "Fire Spin":{el:"Blaze",kind:"Cast",cost:4,power:25,hits:3,acc:90,lv:12,status:["Burn",20]},
  // Brawl
  "Jab":{el:"Brawl",kind:"Strike",cost:2,power:55,acc:100,lv:1},
  "Bulk Up":{el:"Brawl",kind:"Support",cost:3,lv:1,raise:{pow:1,grd:1}},
  "Counter":{el:"Brawl",kind:"Support",cost:2,lv:8,counter:true},
  "Iron Palm":{el:"Brawl",kind:"Strike",cost:5,power:100,acc:90,lv:14,pierce:true},
  "Flurry Kick":{el:"Brawl",kind:"Strike",cost:4,power:20,hits:4,acc:90,lv:20},
  "Focus Punch":{el:"Brawl",kind:"Strike",cost:6,power:160,acc:100,lv:28,charge:true,focus:true},
  // Spark
  "Zap":{el:"Spark",kind:"Cast",cost:2,power:40,acc:100,lv:1,first:true},
  "Charge Up":{el:"Spark",kind:"Field",cost:3,lv:1,field:"Static"},
  "Thunder Fang":{el:"Spark",kind:"Strike",cost:3,power:55,acc:95,lv:8,status:["Shock",30]},
  "Thunderclap":{el:"Spark",kind:"Cast",cost:5,power:85,acc:90,lv:14,status:["Shock",30]},
  "Overload":{el:"Spark",kind:"Cast",cost:5,power:120,acc:90,lv:20,selfLower:{mnd:2}},
  "Bolt Strike":{el:"Spark",kind:"Cast",cost:7,power:160,acc:95,lv:28,charge:true},
  // Wild
  "Vine Lash":{el:"Wild",kind:"Strike",cost:2,power:45,acc:100,lv:1,status:["Root",20]},
  "Overgrowth":{el:"Wild",kind:"Support",cost:4,lv:1,regen:3},
  "Sap Drain":{el:"Wild",kind:"Cast",cost:4,power:60,acc:100,lv:8,drain:0.5},
  "Seed Volley":{el:"Wild",kind:"Strike",cost:4,power:30,hits:3,acc:95,lv:14},
  "Leaf Storm":{el:"Wild",kind:"Cast",cost:5,power:95,acc:90,lv:20},
  "Solar Beam":{el:"Wild",kind:"Cast",cost:6,power:140,acc:100,lv:28,charge:true,sunInstant:true},
  // Frost
  "Frost Nip":{el:"Frost",kind:"Cast",cost:2,power:45,acc:100,lv:1,status:["Freeze",10]},
  "Blizzard":{el:"Frost",kind:"Field",cost:3,lv:1,field:"Snow"},
  "Ice Shard":{el:"Frost",kind:"Strike",cost:2,power:35,acc:100,lv:8,first:true},
  "Glacier Fall":{el:"Frost",kind:"Strike",cost:6,power:100,acc:85,lv:14,status:["Freeze",10]},
  "Frost Armor":{el:"Frost",kind:"Support",cost:3,lv:20,raise:{grd:1,spr:1}},
  "Absolute Zero":{el:"Frost",kind:"Cast",cost:7,power:130,acc:80,lv:28,status:["Freeze",30]},
  // Tide
  "Splash Fang":{el:"Tide",kind:"Strike",cost:2,power:45,acc:100,lv:1,status:["Soak",20]},
  "Monsoon":{el:"Tide",kind:"Field",cost:3,lv:1,field:"Rain"},
  "Aqua Jet":{el:"Tide",kind:"Strike",cost:2,power:40,acc:100,lv:8,first:true},
  "Tidal Crash":{el:"Tide",kind:"Strike",cost:6,power:100,acc:85,lv:14},
  "Soothing Tide":{el:"Tide",kind:"Support",cost:4,lv:20,heal:0.35},
  "Maelstrom":{el:"Tide",kind:"Cast",cost:6,power:110,acc:90,lv:28,status:["Soak",30]},
  // Venom
  "Toxic Spit":{el:"Venom",kind:"Cast",cost:2,power:45,acc:100,lv:1,status:["Poison",30]},
  "Toxic Mist":{el:"Venom",kind:"Support",cost:3,lv:1,inflict:"Poison",acc:100},
  "Venom Fang":{el:"Venom",kind:"Strike",cost:4,power:70,acc:95,lv:8,ifPoison:true},
  "Acid Splash":{el:"Venom",kind:"Cast",cost:3,power:55,acc:100,lv:14,lower:{spr:1},lowerChance:50},
  "Leech Sting":{el:"Venom",kind:"Strike",cost:4,power:65,acc:95,lv:20,drain:0.5},
  "Plague":{el:"Venom",kind:"Cast",cost:6,power:100,acc:90,lv:28,status:["Poison",50]},
  // Charm
  "Hypno Ray":{el:"Charm",kind:"Cast",cost:3,power:50,acc:100,lv:1,status:["Daze",25]},
  "Mirror Charm":{el:"Charm",kind:"Support",cost:4,lv:1,mirror:true},
  "Lullaby":{el:"Charm",kind:"Support",cost:3,lv:8,inflict:"Daze",acc:85},
  "Heart Burst":{el:"Charm",kind:"Cast",cost:6,power:100,acc:85,lv:14},
  "Allure":{el:"Charm",kind:"Support",cost:2,lv:20,lower:{pow:2},acc:100},
  "Starfall":{el:"Charm",kind:"Cast",cost:6,power:25,hits:5,acc:90,lv:28},
  // Stone
  "Rock Slam":{el:"Stone",kind:"Strike",cost:3,power:65,acc:95,lv:1,status:["Crack",20]},
  "Shard Wall":{el:"Stone",kind:"Support",cost:3,lv:1,raise:{grd:2}},
  "Stone Edge":{el:"Stone",kind:"Strike",cost:4,power:75,acc:85,lv:8,crit:0.25},
  "Quake":{el:"Stone",kind:"Strike",cost:6,power:100,acc:85,lv:14,noDodge:true},
  "Landslide":{el:"Stone",kind:"Strike",cost:5,power:30,hits:3,acc:90,lv:20,noDodge:true},
  "Meteor Drop":{el:"Stone",kind:"Strike",cost:7,power:160,acc:90,lv:28,charge:true},
  // Light
  "Glint":{el:"Light",kind:"Cast",cost:2,power:45,acc:100,lv:1,status:["Blind",20]},
  "Purify":{el:"Light",kind:"Support",cost:4,lv:1,cleanse:true},
  "Prism Ray":{el:"Light",kind:"Cast",cost:3,power:60,acc:100,lv:8,sure:true},
  "Holy Ray":{el:"Light",kind:"Cast",cost:6,power:100,acc:85,lv:14},
  "Sanctum":{el:"Light",kind:"Support",cost:5,lv:20,heal:0.5,cleanse:true},
  "Radiance":{el:"Light",kind:"Cast",cost:7,power:120,acc:100,lv:28,status:["Blind",30]},
  // Steel
  "Iron Ram":{el:"Steel",kind:"Strike",cost:3,power:70,acc:95,lv:1},
  "Polish":{el:"Steel",kind:"Support",cost:3,lv:1,raise:{grd:1,spd:1}},
  "Bitstorm":{el:"Steel",kind:"Strike",cost:5,power:20,hits:4,acc:90,lv:8},
  "Iron Wall":{el:"Steel",kind:"Support",cost:3,lv:14,protect:true},
  "Gear Grind":{el:"Steel",kind:"Strike",cost:4,power:40,hits:2,acc:100,lv:20,sure:true},
  "Steel Comet":{el:"Steel",kind:"Strike",cost:7,power:130,acc:90,lv:28,recoil:0.25},
  // Shade
  "Shadow Bolt":{el:"Shade",kind:"Cast",cost:3,power:55,acc:100,lv:1,status:["Curse",20]},
  "Moonrise":{el:"Shade",kind:"Field",cost:3,lv:1,field:"Moonlit"},
  "Shadow Sneak":{el:"Shade",kind:"Strike",cost:2,power:40,acc:100,lv:8,first:true},
  "Night Claw":{el:"Shade",kind:"Strike",cost:4,power:70,acc:95,lv:14,crit:0.25},
  "Soul Sap":{el:"Shade",kind:"Cast",cost:4,power:50,acc:100,lv:20,steal:2},
  "Nightmare":{el:"Shade",kind:"Cast",cost:6,power:110,acc:90,lv:28,ifStatus:true},
  "Shadow Strike":{el:"Shade",kind:"Strike",cost:5,power:85,acc:100,lv:16,noDodge:true,crit:0.2},
  // Void
  "Abyss Gaze":{el:"Void",kind:"Cast",cost:4,power:70,acc:100,lv:1,status:["Dread",20]},
  "Erase":{el:"Void",kind:"Support",cost:5,lv:1,erase:true},
  "Rift Maw":{el:"Void",kind:"Strike",cost:7,power:120,acc:80,lv:20,recoil:0.1},
  // Late skills: level 34 and 42 for every element, so a grade A or S monster still has new skills to learn,
  // each drawn with an effect the element didn't use yet. Void gets three more to fill out its chain.
  "Heat Wave":{el:"Blaze",kind:"Cast",cost:6,power:95,acc:90,lv:34,status:["Burn",30]},
  "Blaze Rush":{el:"Blaze",kind:"Strike",cost:8,power:150,acc:90,lv:42,recoil:0.33},
  "Comet Punch":{el:"Brawl",kind:"Strike",cost:5,power:35,hits:3,acc:95,lv:34},
  "Final Blow":{el:"Brawl",kind:"Strike",cost:8,power:150,acc:90,lv:42,selfLower:{grd:1}},
  "Ion Beam":{el:"Spark",kind:"Cast",cost:6,power:110,acc:90,lv:34,lower:{spr:1},lowerChance:30},
  "Storm Call":{el:"Spark",kind:"Cast",cost:8,power:150,acc:80,lv:42,status:["Shock",30]},
  "Thorn Spear":{el:"Wild",kind:"Strike",cost:6,power:95,acc:95,lv:34,crit:0.2},
  "Gaia Crash":{el:"Wild",kind:"Strike",cost:8,power:150,acc:90,lv:42,recoil:0.25},
  "Hail Storm":{el:"Frost",kind:"Cast",cost:6,power:105,acc:90,lv:34,status:["Freeze",15]},
  "Ice Age":{el:"Frost",kind:"Strike",cost:8,power:160,acc:90,lv:42,charge:true},
  "Bubble Beam":{el:"Tide",kind:"Cast",cost:5,power:30,hits:3,acc:95,lv:34,status:["Soak",20]},
  "Tsunami":{el:"Tide",kind:"Strike",cost:8,power:150,acc:85,lv:42},
  "Venom Storm":{el:"Venom",kind:"Cast",cost:6,power:100,acc:90,lv:34,status:["Poison",30]},
  "Miasma":{el:"Venom",kind:"Cast",cost:8,power:140,acc:80,lv:42,status:["Poison",50]},
  "Dream Lift":{el:"Charm",kind:"Cast",cost:6,power:95,acc:90,lv:34,status:["Daze",30]},
  "Heartbreak":{el:"Charm",kind:"Cast",cost:8,power:145,acc:85,lv:42},
  "Sand Storm":{el:"Stone",kind:"Cast",cost:6,power:95,acc:90,lv:34,status:["Blind",20]},
  "Titan Fall":{el:"Stone",kind:"Strike",cost:8,power:170,acc:85,lv:42,charge:true},
  "Sun Pillar":{el:"Light",kind:"Cast",cost:6,power:110,acc:90,lv:34,status:["Blind",20]},
  "Judgement":{el:"Light",kind:"Cast",cost:8,power:30,hits:5,acc:100,lv:42,sure:true},
  "Steel Beam":{el:"Steel",kind:"Cast",cost:6,power:115,acc:90,lv:34,recoil:0.2},
  "Drill Spear":{el:"Steel",kind:"Strike",cost:8,power:130,acc:90,lv:42,crit:0.25,pierce:true},
  "Dark Pulse":{el:"Shade",kind:"Cast",cost:6,power:95,acc:100,lv:34,status:["Curse",20]},
  "Eclipse":{el:"Shade",kind:"Cast",cost:8,power:155,acc:90,lv:42,charge:true},
  "Void Pulse":{el:"Void",kind:"Cast",cost:3,power:55,acc:100,lv:8,status:["Dread",10]},
  "Rift Spear":{el:"Void",kind:"Strike",cost:5,power:85,acc:95,lv:14,crit:0.2},
  "Null Storm":{el:"Void",kind:"Cast",cost:6,power:110,acc:90,lv:28},
  "Event Horizon":{el:"Void",kind:"Cast",cost:9,power:170,acc:90,lv:42,charge:true},
  // Neutral, any monster can learn these
  "Quick Strike":{el:null,kind:"Strike",cost:1,power:30,acc:100,lv:5,first:true},
  "Focus":{el:null,kind:"Support",cost:2,lv:10,raise:{pow:1,mnd:1}},
  "Protect":{el:null,kind:"Support",cost:2,lv:12,protect:true},
  "Rest":{el:null,kind:"Support",cost:3,lv:16,heal:0.5,rest:true},
  "Taunt":{el:null,kind:"Support",cost:2,lv:22,taunt:3},
  // Wind: neutral, taught by skill chips
  "Gust":{el:null,kind:"Cast",cost:2,power:40,acc:100,lv:4,chip:true,first:true},
  "Tornado":{el:null,kind:"Cast",cost:6,power:90,acc:80,lv:24,chip:true,lower:{spd:1},lowerChance:30},
};
/* Signature skills: a family's own move, learned at level 5, and Fly from worn wings. Never in a scan pool, a shop or a trip.
   Skit spins a web in its own element, so a Blaze Skit gets Fire Web and a Frost Skit Ice Web. */
const WEB_BY_EL={Blaze:["Fire Web","Burn"],Frost:["Ice Web","Freeze"],Tide:["Water Web","Soak"],Venom:["Venom Web","Poison"],Spark:["Spark Web","Shock"],Wild:["Vine Web","Root"],
  Stone:["Stone Web","Crack"],Light:["Light Web","Blind"],Shade:["Shadow Web","Curse"],Charm:["Silk Web","Daze"],Steel:["Wire Web",null],Brawl:["Sticky Web",null],Void:["Rift Web","Dread"]};
const SIG_SKILLS={
  "Bunker Down":{el:null,kind:"Support",cost:3,raise:{grd:2,spr:1}},
  "Crunch":{el:null,kind:"Strike",cost:4,power:80,acc:100,lower:{grd:1},lowerChance:30},
  "Ink Jet":{el:null,kind:"Cast",cost:3,power:40,acc:100,status:["Blind",40]},
  "Static Screen":{el:null,kind:"Cast",cost:3,power:45,acc:100,status:["Daze",30]},
  "Glare":{el:null,kind:"Support",cost:2,acc:100,lower:{pow:1,spd:1}},
  "High Kick":{el:null,kind:"Strike",cost:5,power:90,acc:90},
  "Phase Shift":{el:null,kind:"Support",cost:3,afterimage:true},
  "Fly":{el:null,kind:"Strike",cost:5,power:90,acc:95,charge:true},
};
for(const [el,[n,st]] of Object.entries(WEB_BY_EL)) SIG_SKILLS[n]={el,kind:"Cast",cost:3,power:40,acc:95,lower:{spd:1},lowerChance:100,...(st?{status:[st,30]}:{})};
const FAMILY_SIG={Pinch:"Bunker Down",Chomp:"Crunch",Squib:"Ink Jet",Antik:"Static Screen",Moko:"Glare",Stilt:"High Kick",Booly:"Phase Shift"};
function sigSkills(s){
  const out=[], fam=FAMILY[s.m.family]&&FAMILY[s.m.family].of?FAMILY[s.m.family].of[0]:s.m.family; if((s.level||1)>=5){ if(fam==="Skit") out.push(WEB_BY_EL[s.m.el1][0]); else if(FAMILY_SIG[fam]) out.push(FAMILY_SIG[fam]); }
  const w=s.worn||{}; if(w.back==="Bat wings"||w.back==="Angel wings") out.push("Fly");
  return out;
}
const POOLS={};
for(const [n,s] of Object.entries(SKILLS)){ const k=s.el||"Neutral"; (POOLS[k]=POOLS[k]||[]).push(n); }

/* Stat skills: learned from training one stat, never part of a scan pool. */
const STAT_SKILL_DATA={
  "Second Wind":{kind:"Support",cost:3,heal:0.3,fromStat:0},
  "Endure":{kind:"Support",cost:2,endure:true,fromStat:0},
  "Body Slam":{kind:"Strike",cost:4,power:80,acc:100,hpScale:true,fromStat:0},
  "Regrow":{kind:"Support",cost:4,regen:5,fromStat:0},
  "Haymaker":{kind:"Strike",cost:3,power:80,acc:80,fromStat:1},
  "Pump Up":{kind:"Support",cost:2,raise:{pow:2},fromStat:1},
  "Crush":{kind:"Strike",cost:5,power:85,acc:95,pierce:true,fromStat:1},
  "Rampage":{kind:"Strike",cost:7,power:130,acc:90,recoil:0.25,fromStat:1},
  "Harden":{kind:"Support",cost:2,raise:{grd:2},fromStat:2},
  "Shield Bash":{kind:"Strike",cost:3,power:65,acc:100,atkStat:"grd",fromStat:2},
  "Retaliate":{kind:"Support",cost:3,counter:true,counterMul:2,fromStat:2},
  "Bulwark":{kind:"Support",cost:4,bulwark:true,fromStat:2},
  "Concentrate":{kind:"Support",cost:2,raise:{mnd:2},fromStat:3},
  "Mind Spike":{kind:"Cast",cost:3,power:65,acc:100,crit:0.2,fromStat:3},
  "Foresight":{kind:"Support",cost:2,foresight:true,fromStat:3},
  "Brainstorm":{kind:"Cast",cost:6,power:120,acc:95,selfLower:{mnd:1},fromStat:3},
  "Calm":{kind:"Support",cost:2,raise:{mnd:1,spr:1},fromStat:4},
  "Still Water":{kind:"Support",cost:2,cleanse:true,statusBlock:3,fromStat:4},
  "Spirit Ward":{kind:"Support",cost:3,castWard:true,fromStat:4},
  "Soul Flare":{kind:"Cast",cost:5,power:90,acc:100,atkStat:"spr",fromStat:4},
  "Dart":{kind:"Strike",cost:1,power:35,acc:100,first:true,fromStat:5},
  "Agility":{kind:"Support",cost:2,raise:{spd:2},fromStat:5},
  "Barrage":{kind:"Strike",cost:4,power:20,acc:95,hitsRange:[2,5],fromStat:5},
  "Afterimage":{kind:"Support",cost:3,afterimage:true,fromStat:5},
};
for(const [n,d] of Object.entries(STAT_SKILL_DATA)) SKILLS[n]={el:null,lv:0,...d};
for(const [n,d] of Object.entries(SIG_SKILLS)) SKILLS[n]={lv:0,sig:true,...d};

/* Pool order: the scan's pool size (6 to 12) takes skills from the front of this list. */
function buildPool(el1,el2,size){
  const A=POOLS[el1], B=el2?POOLS[el2]:[], N=POOLS.Neutral;
  const order=el2
    ?[A[0],B[0],A[1],A[2],B[2],A[3],N[0],B[3],A[4],N[2],A[5],B[4],N[1],B[5],N[3],N[4]]
    :[A[0],A[1],A[2],A[3],N[0],A[4],N[2],A[5],N[1],N[3],N[4]];
  const pool=[]; for(const n of order){ if(n&&!pool.includes(n)) pool.push(n); if(pool.length>=size) break; }
  return pool;
}

/* One short line describing what a skill does, for buttons and the loadout list. */
function describe(n){
  const s=SKILLS[n], p=[];
  if(s.power) p.push(s.hits?`${s.power} power x ${s.hits}`:`${s.power} power`);
  if(s.first) p.push("goes first");
  if(s.charge) p.push(s.sunInstant?"charges a turn, instant in sun":s.focus?"charges a turn, fails if hit":"charges a turn");
  if(s.status) p.push(`${s.status[1]}% ${s.status[0]}`);
  if(s.drain) p.push("heals half the damage");
  if(s.recoil) p.push(`user takes ${s.recoil*100}% back`);
  if(s.crit) p.push("high crit");
  if(s.noDodge) p.push("can't be dodged");
  if(s.sure) p.push("never misses");
  if(s.pierce) p.push("ignores Guard buffs");
  if(s.ifPoison) p.push("double on Poisoned");
  if(s.ifStatus) p.push("double on any status");
  if(s.steal) p.push(`steals ${s.steal} energy`);
  if(s.selfLower) p.push(`lowers user's ${Object.entries(s.selfLower).map(([k,v])=>STAT_NAME[k]+" "+v).join(", ")}`);
  if(s.lower) p.push(`${s.lowerChance?s.lowerChance+"% ":""}lowers ${Object.entries(s.lower).map(([k,v])=>STAT_NAME[k]+" "+v).join(", ")}`);
  if(s.raise) p.push(`raises ${Object.entries(s.raise).map(([k,v])=>STAT_NAME[k]+" "+v).join(", ")}`);
  if(s.field) p.push(`sets ${s.field}`);
  if(s.heal) p.push(`heals ${s.heal*100}%`);
  if(s.rest) p.push("then sleeps a turn");
  if(s.regen) p.push(`heals 10% a turn for ${s.regen} turns`);
  if(s.inflict) p.push(`${s.inflict}s the target`);
  if(s.cleanse) p.push("clears status and drops");
  if(s.mirror) p.push("bounces the next Cast");
  if(s.protect) p.push("blocks all damage this turn");
  if(s.counter) p.push(`returns ${s.counterMul||1.5}x the next Strike`);
  if(s.hitsRange) p.push(`${s.power} x ${s.hitsRange[0]} to ${s.hitsRange[1]}`);
  if(s.hpScale) p.push("weaker as its HP drops");
  if(s.atkStat) p.push(`uses ${STAT_NAME[s.atkStat]}`);
  if(s.endure) p.push("goes first, survives any hit this turn");
  if(s.bulwark) p.push("no stat drops or crits against it for 5 turns");
  if(s.foresight) p.push("next Cast can't miss and always crits");
  if(s.castWard) p.push("halves Cast damage for 3 turns");
  if(s.afterimage) p.push("+30% dodge for 3 turns");
  if(s.statusBlock) p.push(`blocks new statuses for ${s.statusBlock} turns`);
  if(s.taunt) p.push("target can't use Support or Field for 3 turns");
  if(s.erase) p.push("removes target's buffs and the field");
  return p.join(", ");
}
const STAT_NAME={pow:"Power",grd:"Guard",mnd:"Mind",spr:"Spirit",spd:"Speed"};

/* Arm skills on a form with no arms keep their numbers and take a body name, since a Bit with no arms can't jab.
   The punch name and animation come back once it grows arms. */
const ARMLESS_NAME={"Jab":"Headbutt","Iron Palm":"Shoulder Ram","Focus Punch":"Focus Ram","Haymaker":"Big Headbutt"};
function hasArms(fam,stage){
  const of=typeof FAMILY!=="undefined"&&FAMILY[fam]&&FAMILY[fam].of;
  if(of){ if(of.includes("Squib")||of[1]==="Skit") return false; fam=of[1]; }
  if(fam==="Squib"||fam==="Skit") return false;
  if(fam==="Pinch"||fam==="Bipped") return true;
  return !!stage&&stage!=="Bit";
}
function skillLabel(n,fam,stage){ return ARMLESS_NAME[n]&&!hasArms(fam,stage)?ARMLESS_NAME[n]:n; }
const skillLabelOf=(s,n)=>s&&s.m?skillLabel(n,s.m.family,s.stage):n;
