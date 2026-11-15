/* The new arena, first pass: a real-time fight on a line between two walls, run in fixed steps of a tenth of a second
   so cup fights between computer monsters can be simulated instantly. Not hooked into the game yet.
   Needs battle.js (edge, vs, makeFighter) and skills.js (SKILLS). The numbers follow the "Snabits arena and movesets" doc. */
const AR={ LEN:100, BODY:6, DT:0.1, TIME:60, BANDS:["Close","Near","Mid","Far"] };
const AR_SHOVE={name:"Shove",range:"Close",dmg:0,acc:95,sharp:0,wither:0,push:18,cost:0,wind:0.2,shove:true};
const arBand=gap=>gap<10?"Close":gap<25?"Near":gap<45?"Mid":"Far";
/* hitting from further away is harder to set up, so it pays a little more */
const AR_BAND_DMG={Close:0.8,Near:0.95,Mid:1.2,Far:1.5,Any:1};
/* a family's damage, tuned so every family wins about half its fights in the balance sim */
const AR_FAM_DMG={Chomp:0.88,Pinch:1.03,Stilt:0.97,Skit:1.18,Antik:0.89,Squib:1.02,Moko:1.27,Booly:1.16,Plod:0.9,Bipped:0.99,Fizz:1.19,Teep:0.95,Lern:1.48,Eagle:0.96,Vampire:1.0,Phoenix:0.83,Kitsune:1.03,Naga:0.78,Yeti:0.72,Puff:1.2,Flit:1.22,Glop:0.78,Tock:1.24,Mitt:0.82,Brolly:0.98,Spine:0.83,Burr:0.99,Kraken:0.95,Golem:0.84,Unicorn:1.03,Jack:1.1,Wick:1,Lumo:1.17,Snooze:1.06,Inky:1.42,Cobble:0.97,Nimbo:1.35,Dango:1,Oaklet:1.14,Roly:0.98,Trundle:1.2,Clank:0.92,Crease:1.04,Twiglet:1,Swirl:1,Ditty:1.14};   // retuned 15 Nov 2026 after melee lost Leap Back

/* [name, learned at, range, damage, accuracy, sharpness, wither, push, cost, windup, extras] */
const FAM_MOVES={
  Chomp:[["Bite",1,"Close",24,85,10,2,4,10,0.3],["Lunge",3,"Near",35,75,8,0,0,16,0.5,{dash:"in"}],["Crunch",5,"Close",64,70,12,0,6,30,0.8],["Leapfrog Bite",8,"Close",20,70,5,0,0,14,0.4,{swap:1}],
    ["Body Slam",14,"Close",46,70,5,5,25,26,0.7],["Jaw Lock",20,"Close",25,80,0,12,0,20,0.4,{hold:2}],["Charge",30,"Mid",60,65,10,0,20,34,1.0,{dash:"in"}],["Gnash",40,"Close",15,80,20,1,0,38,0.6,{hits:4}]],
  Pinch:[["Pinch",1,"Close",25,88,10,0,4,10,0.3],["Claw Jab",3,"Near",32,80,8,0,6,14,0.4],["Bunker Down",5,"Any",0,100,0,0,0,20,0.2,{buff:"bunker"}],["Scuttle Under",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Riposte",14,"Close",0,100,0,0,0,18,0.1,{buff:"riposte"}],["Shell Ram",20,"Mid",45,70,5,0,20,24,0.6,{dash:"in"}],["Vice Grip",30,"Close",36,75,5,15,0,28,0.5,{hold:1.5}],["Crab Hammer",40,"Close",72,60,20,0,15,40,1.0]],
  Stilt:[["Kick",1,"Near",30,85,8,0,8,10,0.3],["Jump Kick",3,"Near",24,85,8,0,6,12,0.35,{dash:"in"}],["High Kick",5,"Near",74,65,15,0,12,32,0.8],["Vault",8,"Close",18,75,5,0,0,12,0.3,{swap:1}],
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
  Plod:[["Trunk Swat",1,"Close",25,88,8,0,8,10,0.3],["Stomp",3,"Mid",32,80,5,0,6,14,0.5,{slow:2,dash:"in"}],["Trunk Slam",5,"Close",66,70,12,0,25,30,0.8],["Trunk Toss",8,"Close",15,80,0,0,0,12,0.35,{swap:1}],
    ["Trumpet",14,"Mid",18,85,0,15,30,20,0.5,{cast:1}],["Thick Hide",20,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Quake Stomp",30,"Mid",58,70,8,0,15,32,0.9],["Mammoth Charge",40,"Far",80,65,10,0,30,40,1.1,{dash:"in"}]],
  Bipped:[["Jab",1,"Close",22,92,10,0,4,8,0.2],["Dash Punch",3,"Near",30,80,8,0,6,14,0.4,{dash:"in"}],["One-Two",5,"Close",28,85,10,0,6,22,0.4,{hits:2}],["Hip Toss",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Uppercut",14,"Close",48,75,15,0,15,24,0.6],["Guard Up",20,"Any",0,100,0,0,0,16,0.1,{buff:"riposte"}],["Haymaker",30,"Close",78,65,15,0,20,36,0.9],["Flurry Punch",40,"Close",14,85,10,0,0,38,0.6,{hits:5}]],
  Fizz:[["Bubble",1,"Mid",28,90,5,0,0,10,0.3,{cast:1}],["Cork Pop",3,"Close",22,85,5,0,30,12,0.3,{cast:1}],["Potion Toss",5,"Mid",40,85,5,0,0,22,0.6,{cast:1,status:["Poison",45]}],["Cork Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Brew Up",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.18}],["Beaker Splash",20,"Near",44,80,8,0,0,22,0.5,{cast:1,status:["Crack",25]}],["Boil Over",30,"Mid",66,75,8,0,10,32,0.8,{cast:1,status:["Burn",25]}],["Explosive Brew",40,"Far",94,65,10,0,20,40,1.2,{cast:1}]],
  Teep:[["Splash",1,"Near",26,90,5,0,4,10,0.3,{cast:1}],["Lid Bonk",3,"Close",28,85,8,0,8,12,0.3],["Steam Jet",5,"Far",50,80,8,0,0,24,0.7,{cast:1,status:["Blind",30]}],["Spin Pour",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cast:1}],
    ["Tea Time",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Scald",20,"Mid",46,80,8,0,6,24,0.6,{cast:1,status:["Burn",25]}],["Whistle",30,"Far",22,85,0,25,0,24,0.5,{cast:1,status:["Daze",35]}],["Boiling Point",40,"Mid",92,65,12,0,15,40,1.2,{cast:1}]],
  Lern:[["Ember",1,"Far",32,88,5,0,0,10,0.3,{cast:1}],["Float Back",3,"Close",14,90,5,0,0,10,0.2,{step:-28,cast:1}],["Flash",5,"Mid",34,95,5,8,0,20,0.4,{cast:1,status:["Blind",50]}],["Lantern Swing",8,"Close",16,85,0,0,0,12,0.3,{swap:1}],
    ["Paper Fold",14,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Spark Shower",20,"Mid",16,80,5,0,0,24,0.6,{cast:1,hits:3}],["Beacon",30,"Far",68,75,10,8,0,32,0.9,{cast:1}],["Sky Lantern",40,"Far",94,65,12,0,0,40,1.3,{cast:1}]],
  /* the twelve families added 15 Nov 2026 */
  Puff:[["Spore Puff",1,"Mid",26,90,5,0,0,10,0.3,{cast:1}],["Cap Bonk",3,"Close",24,85,8,0,8,12,0.3],["Drowsy Spores",5,"Mid",22,85,0,0,0,22,0.6,{cast:1,status:["Daze",45]}],["Spore Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cast:1}],
    ["Mycelium",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.18}],["Toxic Cloud",20,"Mid",36,80,5,0,0,24,0.6,{cast:1,status:["Poison",40]}],["Fairy Ring",30,"Near",22,85,5,10,0,28,0.6,{cast:1,hits:3}],["Bloom Burst",40,"Far",90,65,10,0,15,40,1.2,{cast:1}]],
  Flit:[["Wing Clip",1,"Close",22,92,10,0,4,8,0.2],["Dive Bite",3,"Near",28,85,8,0,6,12,0.35,{dash:"in"}],["Sonar",5,"Mid",30,90,5,10,0,20,0.5,{cast:1,status:["Daze",30]}],["Loop Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Fang Flurry",14,"Close",14,85,10,0,0,24,0.5,{hits:3}],["Night Veil",20,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Leech Bite",30,"Close",50,80,10,0,6,30,0.7,{drain:0.4}],["Screech",40,"Far",70,75,8,15,20,38,1.0,{cast:1}]],
  Glop:[["Glob",1,"Near",26,88,5,0,6,10,0.3,{cast:1}],["Slime Slap",3,"Close",30,85,8,0,10,12,0.3],["Engulf",5,"Close",40,80,5,0,0,24,0.6,{hold:1.5}],["Ooze Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Reform",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Sticky Trap",20,"Mid",20,85,0,0,0,20,0.5,{cast:1,slow:3}],["Body Splash",30,"Mid",60,75,8,0,20,32,0.9,{dash:"in"}],["Acid Flood",40,"Near",84,70,10,0,15,40,1.1,{cast:1,status:["Poison",30]}]],
  Tock:[["Tick",1,"Close",22,92,8,0,4,8,0.2],["Alarm Ring",3,"Mid",26,88,5,10,0,14,0.4,{cast:1,status:["Daze",20]}],["Second Hand",5,"Near",14,90,8,0,0,22,0.4,{hits:4}],["Clock Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Rewind",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.18}],["Pendulum",20,"Near",44,85,8,0,15,24,0.6],["Time Stop",30,"Mid",10,75,0,0,0,30,0.7,{cast:1,hold:2}],["Midnight",40,"Far",88,70,12,10,10,40,1.2,{cast:1}]],
  Mitt:[["Mitt Jab",1,"Close",24,90,10,0,8,9,0.25],["Step In",3,"Near",28,82,8,0,8,14,0.4,{dash:"in"}],["Big Swing",5,"Close",68,68,15,0,22,30,0.85],["Clinch Swap",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Cover Up",14,"Any",0,100,0,0,0,16,0.1,{buff:"riposte"}],["Body Blow",20,"Close",44,80,10,10,10,24,0.5],["Knockout",30,"Close",86,62,25,0,30,38,1.0],["Combo Rush",40,"Close",16,85,10,0,4,38,0.6,{hits:5}]],
  Brolly:[["Poke",1,"Near",26,90,8,0,8,10,0.3],["Spin Open",3,"Close",22,85,5,0,25,12,0.3],["Rain Shot",5,"Mid",20,85,5,0,0,22,0.6,{cast:1,hits:2}],["Hook Swap",8,"Close",15,85,0,0,0,12,0.3,{swap:1}],
    ["Canopy",14,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],["Hook Pull",20,"Mid",22,85,0,0,-25,20,0.5],["Thunder Clap",30,"Near",58,75,8,0,15,32,0.8,{cast:1,status:["Shock",25]}],["Downpour",40,"Far",22,80,5,0,0,40,0.9,{cast:1,hits:4}]],
  Spine:[["Prick",1,"Close",24,90,10,0,4,9,0.25],["Needle Shot",3,"Mid",26,88,8,0,0,14,0.4,{cast:1}],["Cactus Punch",5,"Close",60,72,12,0,18,28,0.8],["Pot Swap",8,"Close",14,80,0,0,0,12,0.35,{swap:1}],
    ["Thorn Wall",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Needle Spray",20,"Near",14,85,8,0,0,24,0.5,{hits:3}],["Desert Bloom",30,"Any",0,100,0,0,0,26,0.5,{support:1,heal:0.25}],["Saguaro Slam",40,"Close",88,68,15,0,25,40,1.0]],
  Burr:[["Scratch",1,"Close",24,90,10,0,4,9,0.25],["Dig Under",3,"Mid",30,82,8,0,0,14,0.45,{dash:"in"}],["Claw Swipe",5,"Close",58,75,15,0,10,28,0.7],["Tunnel Swap",8,"Close",15,85,0,0,0,12,0.3,{swap:1}],
    ["Mud Fling",14,"Mid",28,85,5,0,0,20,0.5,{status:["Blind",35]}],["Burrow",20,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Drill Claw",30,"Close",20,80,10,0,0,30,0.6,{hits:3}],["Cave In",40,"Mid",86,70,10,0,20,40,1.1,{dash:"in"}]],
  /* batch 3, 16 Nov 2026: the commons from dark photos */
  Wick:[["Hot Wax",1,"Near",26,88,5,0,6,10,0.3,{cast:1}],["Wick Whip",3,"Close",26,88,8,0,8,12,0.3],["Melt Down",5,"Mid",30,85,5,0,0,22,0.6,{cast:1,status:["Burn",35]}],["Wax Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Relight",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Candle Burst",20,"Near",16,85,8,0,0,24,0.5,{cast:1,hits:3}],["Blowtorch",30,"Mid",58,75,10,0,10,32,0.8,{cast:1,status:["Burn",20]}],["Bonfire",40,"Far",90,68,12,0,15,40,1.2,{cast:1}]],
  Lumo:[["Glow Bump",1,"Close",22,92,8,0,6,8,0.2],["Light Dart",3,"Mid",26,90,8,0,0,12,0.35,{cast:1}],["Lantern Flash",5,"Mid",22,88,0,10,0,22,0.6,{cast:1,status:["Blind",40]}],["Blink Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Firefly Swarm",14,"Near",13,88,8,0,0,24,0.5,{cast:1,hits:4}],["Afterglow",20,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Lamp Beam",30,"Far",58,80,8,0,0,32,0.8,{cast:1}],["Swarm Light",40,"Far",90,68,12,10,10,40,1.2,{cast:1}]],
  Snooze:[["Pillow Bop",1,"Close",26,88,6,0,10,10,0.3],["Yawn",3,"Mid",10,90,0,10,0,12,0.4,{cast:1,status:["Daze",35]}],["Sleepy Slam",5,"Close",54,75,8,0,20,26,0.8,{status:["Daze",25]}],["Fluff Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Nap Time",14,"Any",0,100,0,0,0,24,0.5,{support:1,heal:0.25}],["Feather Burst",20,"Near",15,85,5,0,0,24,0.5,{cast:1,hits:3}],["Dream Drift",30,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],["Big Snore",40,"Far",86,70,10,10,20,40,1.2,{cast:1}]],
  Inky:[["Ink Flick",1,"Mid",26,90,5,0,0,10,0.3,{cast:1}],["Splotch",3,"Close",26,88,8,0,8,12,0.3],["Ink Blot",5,"Mid",26,88,5,0,0,22,0.6,{cast:1,status:["Blind",40]}],["Smear Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Redraw",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Scribble",20,"Close",14,85,8,0,0,26,0.5,{hits:4}],["Pen Stab",30,"Near",58,78,15,0,10,30,0.8],["Ink Flood",40,"Far",86,70,10,0,15,40,1.2,{cast:1,status:["Blind",20]}]],
  Cobble:[["Rock Bump",1,"Close",26,88,8,0,10,10,0.3],["Skip Stone",3,"Mid",26,88,5,0,6,12,0.4],["Rubble Roll",5,"Mid",56,75,10,0,20,26,0.8,{dash:"in"}],["Stack Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1}],
    ["Hunker",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Gravel Spray",20,"Near",15,85,8,0,0,24,0.5,{hits:3}],["Crystal Shard",30,"Far",56,78,15,0,0,32,0.9,{cast:1}],["Geode Crash",40,"Close",90,66,15,0,28,40,1.1]],
  Nimbo:[["Drip",1,"Mid",24,90,5,0,0,10,0.3,{cast:1}],["Puff Push",3,"Close",22,88,5,0,18,12,0.3],["Downdraft",5,"Mid",30,85,5,0,10,22,0.6,{cast:1,status:["Soak",45]}],["Fog Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Silver Lining",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Hailstones",20,"Mid",15,85,8,0,0,24,0.5,{cast:1,hits:3}],["Thunderclap",30,"Near",58,75,8,0,15,32,0.8,{cast:1,status:["Shock",25]}],["Cloudburst",40,"Far",90,68,12,0,15,40,1.2,{cast:1}]],
  Dango:[["Skewer Poke",1,"Near",26,88,8,0,8,10,0.3],["Bounce",3,"Mid",28,85,8,0,10,14,0.4,{dash:"in"}],["Triple Stack",5,"Close",18,85,8,0,0,24,0.6,{hits:3}],["Roll Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Sweet Glaze",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Mochi Smack",20,"Close",44,82,10,0,18,24,0.6],["Sakura Cut",30,"Near",60,78,15,0,10,32,0.8],["Skewer Thrust",40,"Mid",90,66,15,0,25,40,1.1,{dash:"in"}]],
  Oaklet:[["Nut Bonk",1,"Close",26,88,8,0,8,10,0.3],["Acorn Drop",3,"Mid",26,88,5,0,6,12,0.4,{cast:1}],["Root Snare",5,"Mid",22,85,0,0,0,22,0.6,{cast:1,hold:1.5}],["Leaf Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Photosynth",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Leaf Storm",20,"Near",15,85,5,0,0,24,0.5,{cast:1,hits:3}],["Branch Whip",30,"Near",58,78,10,0,15,30,0.8],["Old Growth",40,"Close",90,66,15,0,28,40,1.1]],
  Roly:[["Plate Bash",1,"Close",26,88,8,0,10,10,0.3],["Skitter",3,"Mid",26,85,8,0,8,12,0.35,{dash:"in"}],["Curl Up",5,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Shell Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1}],
    ["Hundred Legs",14,"Close",14,85,8,0,0,24,0.5,{hits:4}],["Pill Roll",20,"Mid",56,75,10,0,22,28,0.8,{dash:"in"}],["Armour Up",30,"Any",0,100,0,0,0,20,0.2,{buff:"brace"}],["Wrecking Ball",40,"Mid",92,66,12,0,30,42,1.2,{dash:"in"}]],
  Trundle:[["Slime Spit",1,"Mid",24,90,5,0,0,10,0.3,{cast:1}],["Shell Bump",3,"Close",26,88,8,0,10,12,0.3],["Sticky Trail",5,"Mid",20,88,0,0,0,22,0.6,{cast:1,slow:3}],["Snail Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1}],
    ["Hide Away",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Feeler Flick",20,"Near",15,85,8,0,0,24,0.5,{hits:3}],["Home Comfort",30,"Any",0,100,0,0,0,24,0.5,{support:1,heal:0.25}],["House Slam",40,"Close",92,64,15,0,30,42,1.2]],
  /* batch 3 uncommons */
  Clank:[["Tin Punch",1,"Close",24,90,10,0,8,9,0.25],["Spring Hop",3,"Mid",28,85,8,0,8,14,0.4,{dash:"in"}],["Wind-Up Barrage",5,"Close",13,85,8,0,0,26,0.6,{hits:5}],["Gear Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1}],
    ["Oil Up",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Rivet Shot",20,"Mid",15,85,8,0,0,24,0.5,{hits:3}],["Rocket Fist",30,"Mid",64,75,12,0,22,32,0.9,{dash:"in"}],["Steam Blast",40,"Far",90,68,12,0,15,40,1.2,{cast:1}]],
  Crease:[["Paper Cut",1,"Close",22,92,15,0,4,8,0.2],["Fold Dart",3,"Mid",26,90,10,0,0,12,0.35],["Thousand Cranes",5,"Near",13,88,8,0,0,24,0.6,{cast:1,hits:4}],["Origami Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Refold",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Paper Gust",20,"Mid",30,85,5,0,25,22,0.5,{cast:1}],["Wing Slice",30,"Near",58,78,15,0,10,30,0.8],["Phoenix Fold",40,"Far",90,68,12,10,10,40,1.2,{cast:1}]],
  Twiglet:[["Twig Poke",1,"Near",26,88,8,0,8,10,0.3],["Leaf Shot",3,"Mid",26,88,5,0,0,12,0.35,{cast:1}],["Pruning Snip",5,"Close",58,78,20,0,10,26,0.7],["Graft Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1}],
    ["Deep Water",14,"Any",0,100,0,0,0,24,0.5,{support:1,heal:0.25}],["Petal Storm",20,"Near",15,85,5,0,0,24,0.5,{cast:1,hits:3}],["Trunk Twist",30,"Near",58,78,10,0,18,30,0.8],["Blossom Burst",40,"Far",90,68,12,0,15,40,1.2,{cast:1}]],
  Swirl:[["Snow Pellet",1,"Mid",26,90,5,0,6,10,0.3],["Frost Bump",3,"Close",26,88,8,0,10,12,0.3],["Shake Up",5,"Mid",22,88,0,10,0,22,0.6,{cast:1,status:["Daze",40]}],["Glass Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Hot Cocoa",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Blizzard Spin",20,"Near",13,88,8,0,0,24,0.5,{cast:1,hits:4}],["Glass Dome",30,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],["Whiteout",40,"Far",88,68,10,0,15,40,1.2,{cast:1,status:["Freeze",20]}]],
  Ditty:[["Clasp Snap",1,"Close",24,90,8,0,4,9,0.25],["Note Toss",3,"Mid",26,90,5,0,0,12,0.35,{cast:1}],["Music Box Waltz",5,"Mid",24,88,0,10,0,22,0.6,{cast:1,status:["Daze",35]}],["Wind Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Encore",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Pirouette",20,"Close",14,85,8,0,0,24,0.5,{hits:3}],["Crescendo",30,"Near",58,78,8,10,15,30,0.8,{cast:1}],["Grand Finale",40,"Far",92,66,12,0,15,42,1.2,{cast:1}]],
  /* the special Snabits */
  Eagle:[["Peck",1,"Close",24,92,10,0,4,9,0.2],["Swoop",3,"Near",32,85,10,0,8,14,0.4,{dash:"in"}],["Talon Dive",5,"Close",62,80,18,0,18,28,0.7],["Dive",8,"Mid",30,85,10,0,8,16,0.4,{dash:"in"}],
    ["Wing Gust",14,"Mid",36,85,5,0,28,22,0.5,{cast:1}],["Keen Sight",20,"Any",0,100,0,0,0,16,0.2,{buff:"unblink"}],["Feather Volley",30,"Far",18,85,8,0,0,28,0.6,{cast:1,hits:3}],["Sky Strike",40,"Far",88,70,15,0,20,40,1.0,{dash:"in"}]],
  Vampire:[["Nip",1,"Close",22,92,8,0,0,9,0.2,{drain:0.3}],["Bat Swarm",3,"Mid",26,85,5,0,0,14,0.4,{cast:1}],["Night Bite",5,"Near",50,85,10,0,6,26,0.6,{drain:0.5,dash:"in"}],["Mist Step",8,"Close",12,85,0,0,0,12,0.3,{swap:1}],
    ["Hypnotic Gaze",14,"Mid",18,85,0,12,0,20,0.5,{cast:1,status:["Daze",40]}],["Cloak",20,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Blood Moon",30,"Far",62,75,8,8,0,32,0.9,{cast:1,drain:0.3}],["Crimson Feast",40,"Close",80,75,12,0,10,40,1.0,{drain:0.6}]],
  Phoenix:[["Ember Peck",1,"Close",24,90,8,0,4,9,0.2,{status:["Burn",15]}],["Flame Wing",3,"Near",32,85,8,0,10,14,0.4],["Sun Flare",5,"Mid",54,80,8,0,0,26,0.7,{cast:1,status:["Burn",35]}],["Blaze Swap",8,"Close",12,85,0,0,0,12,0.3,{swap:1}],
    ["Warm Glow",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Fire Ring",20,"Near",44,80,8,0,20,24,0.5,{cast:1}],["Ash Storm",30,"Far",20,80,5,0,0,30,0.7,{cast:1,hits:3,status:["Blind",20]}],["Supernova",40,"Far",92,70,10,0,15,42,1.1,{cast:1}]],
  Kitsune:[["Fox Swipe",1,"Close",22,92,10,0,4,9,0.2],["Foxfire",3,"Mid",18,90,5,0,0,16,0.5,{cast:1,hits:3,status:["Daze",20]}],["Trick Step",5,"Close",14,90,5,0,0,12,0.2,{step:-26,cast:1}],["Tail Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Mirage",14,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Spirit Lantern",20,"Far",46,85,5,10,0,24,0.6,{cast:1}],["Nine Tails",30,"Near",14,85,8,0,0,30,0.7,{hits:5}],["Kitsunebi",40,"Far",86,75,10,8,0,40,1.0,{cast:1,status:["Daze",30]}]],
  Naga:[["Fang",1,"Close",26,90,8,0,4,10,0.25],["Tail Whip",3,"Mid",26,85,5,0,-20,14,0.4],["Venom Coil",5,"Close",44,85,8,0,0,24,0.6,{status:["Poison",50],hold:1.2}],["Slither Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Hood Flare",14,"Mid",14,90,0,14,0,18,0.4,{cast:1,status:["Dread",35]}],["Shed Skin",20,"Any",0,100,0,0,0,20,0.3,{support:1,cleanse:1,heal:0.1}],["Acid Spit",30,"Far",56,80,8,0,0,30,0.8,{cast:1,status:["Poison",40]}],["Serpent King",40,"Close",88,70,12,0,25,40,1.0]],
  Yeti:[["Snow Paw",1,"Close",28,88,8,0,10,10,0.3],["Snowball",3,"Mid",26,88,5,0,8,14,0.4,{cast:1}],["Avalanche",5,"Close",66,75,10,0,22,30,0.9],["Big Toss",8,"Close",16,80,0,0,0,12,0.35,{swap:1}],
    ["Frost Breath",14,"Near",34,85,5,0,0,22,0.5,{cast:1,status:["Freeze",20]}],["Thick Coat",20,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Glacier Slam",30,"Mid",62,75,10,0,20,34,0.9,{dash:"in"}],["Blizzard Roar",40,"Far",84,70,8,10,15,42,1.1,{cast:1,status:["Freeze",25]}]],
  Kraken:[["Tentacle Slap",1,"Near",26,88,8,0,8,10,0.3],["Ink Cloud",3,"Mid",20,90,0,0,0,14,0.4,{cast:1,status:["Blind",35]}],["Crushing Grip",5,"Close",44,80,8,0,0,26,0.6,{hold:1.5}],["Deep Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Reach",14,"Mid",34,85,5,0,-25,20,0.5],["Whirlpool",20,"Mid",40,80,5,0,0,26,0.6,{cast:1,slow:3}],["Eight Arms",30,"Near",14,85,8,0,0,30,0.6,{hits:5}],["Deep Vortex",40,"Far",94,65,12,0,20,42,1.2,{cast:1}]],
  Golem:[["Rock Fist",1,"Close",28,85,8,0,10,10,0.35],["Pebble Toss",3,"Mid",26,85,5,0,6,14,0.45],["Boulder Smash",5,"Close",70,68,12,0,25,32,0.9],["Heave",8,"Close",16,80,0,0,0,12,0.35,{swap:1}],
    ["Stone Wall",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Tremor",20,"Mid",40,80,5,0,10,26,0.7,{slow:2}],["Rune Pulse",30,"Far",58,75,8,10,0,32,0.9,{cast:1}],["Mountain Fall",40,"Mid",92,68,12,0,30,44,1.2,{dash:"in"}]],
  Unicorn:[["Horn Jab",1,"Close",24,90,10,0,6,9,0.25],["Gallop",3,"Mid",30,85,8,0,10,14,0.4,{dash:"in"}],["Prism Beam",5,"Far",50,85,8,0,0,26,0.7,{cast:1}],["Hoof Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Mending Light",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22,cleanse:1}],["Starlight",20,"Mid",18,85,5,0,0,24,0.6,{cast:1,hits:3}],["Rainbow Charge",30,"Mid",66,75,10,0,20,34,0.9,{dash:"in"}],["Wish",40,"Far",92,70,12,0,10,42,1.2,{cast:1}]],
  Jack:[["Vine Slap",1,"Near",24,88,8,0,6,10,0.3],["Candle Flick",3,"Mid",28,88,5,0,0,14,0.4,{cast:1,status:["Burn",20]}],["Spooky Grin",5,"Mid",16,85,0,15,20,20,0.5,{cast:1,status:["Dread",35]}],["Patch Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],
    ["Lantern Glow",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.18}],["Pip Spit",20,"Far",16,85,5,0,0,24,0.6,{cast:1,hits:3}],["Hollow Howl",30,"Near",56,75,8,10,25,32,0.8,{cast:1}],["Pumpkin Bomb",40,"Mid",94,65,12,0,25,42,1.2,{cast:1,status:["Burn",30]}]]
};
/* every Snabit has Brace. Melee families get Rush, which closes the gap and hits; the casters get Leap Back to keep their distance
   (Gid, 15 Nov 2026: fewer moves that only move, and melee fighters closing in rather than backing off) */
const SHARED_MOVES=[["Rush",1,"Any",14,85,5,0,0,10,0.25,{dash:"in",melee:1}],["Leap Back",1,"Any",0,100,0,0,0,10,0.2,{step:-20,ranged:1}],["Brace",1,"Any",0,100,0,0,0,10,0.1,{buff:"brace"}]];
const arMelee=fam=>{ const d=(FAM_MOVES[fam]||[]).map(arMove).filter(m=>m.dmg); return d.filter(m=>!m.cast&&(m.range==="Close"||m.range==="Near"||m.dash)).length>=d.length/2; };
/* how fast each family gets around: Booly floats and Squib jets, while Chomp and Pinch plod */
const FAM_WALK={Chomp:0.8,Pinch:0.85,Stilt:1.05,Skit:1.15,Antik:1,Squib:1.15,Moko:1.05,Booly:1.25,Plod:0.75,Bipped:1.05,Fizz:1,Teep:0.85,Lern:1.15,Eagle:1.2,Vampire:1,Phoenix:1.05,Kitsune:1.15,Naga:0.95,Yeti:0.8,Puff:0.9,Flit:1.3,Glop:0.85,Tock:1.05,Mitt:0.95,Brolly:1,Spine:0.7,Burr:0.95,Kraken:0.9,Golem:0.7,Unicorn:1.15,Jack:0.9,Wick:1.05,Lumo:1.1,Snooze:0.85,Inky:1,Cobble:0.8,Nimbo:1.1,Dango:1.05,Oaklet:0.9,Roly:1.2,Trundle:0.55,Clank:0.9,Crease:1.25,Twiglet:0.75,Swirl:0.95,Ditty:1};
/* a family's first move takes its element, the way Skit's Web already does: a Blaze Chomp bites with Flame Bite */
const EL_PREFIX={Blaze:"Flame",Frost:"Frost",Tide:"Aqua",Spark:"Volt",Wild:"Leaf",Venom:"Toxic",Charm:"Heart",Stone:"Rock",Light:"Shine",Steel:"Iron",Shade:"Shadow",Void:"Void"};
const arMove=r=>({name:r[0],lv:r[1],range:r[2],dmg:r[3],acc:r[4],sharp:r[5]/100,wither:r[6],push:r[7],cost:r[8],wind:r[9],...(r[10]||{})});

/* an element skill turned into an arena move: its range comes from the animation it plays.
   Support skills come in too, aimed at any range, and their focus cost comes from their old energy cost. Field skills stay out for now. */
const AR_RANGE={bite:"Close",punch:"Close",claw:"Close",shadowstrike:"Close",shadowclaw:"Close",stomp:"Close",
  tackle:"Near",push:"Near",spear:"Near",rockpath:"Near",fly:"Near",
  bolt:"Mid",volley:"Mid",drain:"Mid",mist:"Mid",gust:"Mid",boulder:"Mid",firespin:"Mid",
  beam:"Far",lightning:"Far",pillar:"Far",tornado:"Far",meteor:"Far",icefall:"Far",wave:"Far",lift:"Far"};
const AR_SKILL_KEYS=["push","drain","recoil","steal","lower","lowerChance","selfLower","sure","noDodge","pierce","ifPoison","ifStatus","hitsRange","atkStat","hpScale",
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
  const fm=(FAM_MOVES[fam]||[]).map(arMove).filter(m=>m.lv<=level), mel=arMelee(fam), sh=SHARED_MOVES.map(arMove).filter(m=>!(m.melee&&!mel)&&!(m.ranged&&mel));
  if(fm[0]) fm[0].basic=true;
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
/* a guard lasts a few seconds and then needs a rest before it can go up again, so it can't be spammed (Gid, 15 Nov 2026) */
const AR_BUFF_T={bunker:6,unblink:4,feedback:3,phase:3,bubble:6,riposte:3,brace:5}, AR_BUFF_REST=5;

class Arena{
  /* a and b: fighters from makeFighter, each with .moves (arMoves) and .family; ai: "smart" or "naive" per side */
  constructor(a,b,rand,ai=["smart","smart"]){
    this.rand=rand; this.t=0; this.over=false; this.winner=null; this.log=[]; this.ev=[];   // ev: what happened this step, for the screen to animate
    this.p=[a,b].map((f,i)=>({f,i,x:i?70:30,focus:30,act:null,cool:0,think:0.6,hold:0,slow:0,stun:0,sleep:0,thawT:0,shoveCool:0,buff:{},hp:f.maxhp,maxhp:f.maxhp,ai:ai[i],dealt:0,
      st:null,stg:{pow:0,grd:0,mnd:0,spr:0,spd:0},stgT:{},heals:0,uses:{},last:null,regenT:0,counterMul:1.5,halo:0,sunT:0,abSeen:{}}));
    for(const q of this.p){ const e0=q.f.ability==="Steeping"?4:3; if(q.f.energy>e0) q.focus+=10*(q.f.energy-e0);   // a Party hat starts it with more focus
      if(q.f.ability==="Long Stride"){ q.think=0; q.stride=1; } }   // Stilt's Long Stride: it's ready to act the moment the fight starts
    this.opened=false;
  }
  // an ability showing on screen; once: only the first time it works in this fight
  ab(q,name,once){ if(once){ if(q.abSeen[name]) return; q.abSeen[name]=1; } this.ev.push({t:"ability",i:q.i,name}); }
  // how much stronger held items work: Antik's Heavy Lifter makes them 50% stronger
  hm(q){ return q.f.ability==="Heavy Lifter"?1.5:1; }
  gap(){ return Math.abs(this.p[0].x-this.p[1].x)-AR.BODY; }
  band(){ return arBand(this.gap()); }
  has(p,name){ return !!(p.st&&p.st.name===name); }
  // a stat right now: its base, its raised or lowered stages, and any status that weakens it
  eff(p,k){ let v=p.f.base[k]; if(k==="spd"&&p.f.ability==="Rain Dancer") v*=1.15; if(k==="mnd"&&p.f.ability==="Night-born") v*=1.1; const n=p.stg&&p.stg[k]; if(n) v*=arStageMul(n); const S=p.st&&AR_STATUS[p.st.name]; if(S&&S.stat&&S.stat[k]) v*=S.stat[k]; return v; }
  cost(p,m){ return this.has(p,"Curse")?Math.round(m.cost*1.25):m.cost; }
  // asleep, frozen or locked up by a shock or a wall slam: it can't act or walk
  canAct(p){ return !(p.stun>0||p.sleep>0||this.has(p,"Freeze")); }
  dirTo(p){ const o=this.p[1-p.i]; return o.x>p.x?1:-1; }
  // Tide's Undertow: while it's above half HP, the other one backs away from it a quarter slower
  undertow(p){ const o=this.p[1-p.i]; return o.f.ability==="Undertow"&&o.hp>o.maxhp/2; }
  inRange(m){ return m.range==="Any"||m.range===this.band(); }
  speed(p){ const o=this.p[1-p.i]; return 12*(FAM_WALK[p.f.family]||1)*(1+edge(this.eff(p,"spd"),this.eff(o,"spd"),0.6,-0.35,0.45))*(p.slow>0?0.5:1)*(this.has(p,"Soak")?0.85:1); }
  /* the chance a move lands right now: its accuracy, a little more with focus held, Insight against the target's Speed,
     less if the target is on the move or phased out, less again when blinded, and more against a target that can't get away */
  hitChance(p,m){ const o=this.p[1-p.i]; if(m.sure||p.buff.foresight&&m.cast) return 1;
    const ke=p.f.ability==="Keen Eye", moving=o.walkT!=null&&this.t-o.walkT<0.3, stuck=!this.canAct(o)||o.hold>0, nd=!!m.noDodge||ke;   // Moko's Keen Eye: dodging, phasing and Blind don't work against it
    const ed=edge(this.eff(p,"spr"),this.eff(o,"spd"),0.4,-0.25,0.12);
    return Math.max(0.05,Math.min(0.97,m.acc/100+p.focus/99*0.06+(ke?Math.max(0,ed):ed)-(moving&&!nd?0.08:0)-(o.buff.phase&&!nd?0.3:0)
      +(p.buff.unblink?0.1:0)-(this.has(p,"Blind")&&!ke?0.2:0)+(stuck?0.25:0)+(p.f.accMod||0))); }
  // Booly's Slippery: a tenth of the Strikes that would land on it slip past instead (worked out from the same roll, so the screen knows in time)
  slips(p,m,roll){ const o=this.p[1-p.i]; return !m.cast&&!!m.dmg&&o.f.ability==="Slippery"&&p.f.ability!=="Keen Eye"&&roll<=this.hitChance(p,m)&&roll>this.hitChance(p,m)*0.9; }
  statusOdds(p,o){ return Math.max(0.5,Math.min(1.5,1+edge(this.eff(p,"mnd"),this.eff(o,"spr"),0.6,-0.5,0.5))); }
  regen(p){ const o=this.p[1-p.i]; return 5.5*(1+edge(this.eff(p,"sta"),this.eff(o,"sta"),0.5,-0.3,0.4))*(this.has(p,"Curse")?0.7:1)*(p.f.energyBonus?1+0.5*this.hm(p):1); }   // an Energy cell fills focus 50% faster
  walk(p,dir){ if(p.hold>0||!this.canAct(p)||this.has(p,"Root")) return; const o=this.p[1-p.i], ut=this.undertow(p)&&dir!==this.dirTo(p), nx=p.x+dir*this.speed(p)*AR.DT*(ut?0.75:1); if(ut) this.ab(o,"Undertow",true);
    const lo=o.x<p.x?o.x+AR.BODY:0, hi=o.x>p.x?o.x-AR.BODY:AR.LEN, x0=p.x; p.x=Math.max(lo,Math.min(hi,nx)); if(Math.abs(p.x-x0)>0.01) p.walkT=this.t; }
  // whether a status or a taunt stops this move: Dread bars the same move twice, Taunt bars support, Root bars stepping
  allowed(p,m){ if(m.shove) return true;
    if(this.has(p,"Dread")&&m.name===p.last) return false;
    if(p.buff.taunt&&(m.support||m.buff)) return false;
    if(this.has(p,"Root")&&(m.step||m.dash||m.swap)) return false;
    if(m.buff&&(p.buff[m.buff]||(p.bcd&&p.bcd[m.buff]>this.t))) return false;   // still up, or resting before it can go up again
    return true; }
  /* Using a move takes a turn, the way MR2 does it: whoever acts first goes, the fight and the clock stop while the move plays out,
     then both carry on from where they stand. On screen (live) the turn waits for the animation; in a simulation it resolves at once.
     The computer needs a moment to react before it can act, and a Snabit can't act again until a short recovery has passed.
     Whether it lands is rolled here, so the screen knows at the start whether the target will get out of the way. */
  start(p,m){ if(this.turn||this.over||p.cool>0||!this.canAct(p)||p.ai!=="human"&&p.think>0||!this.allowed(p,m)||p.focus<this.cost(p,m)) return false;
    // a Snabit that doesn't trust you yet sometimes sulks and ignores the call, or does something else
    if(p.ai==="human"&&p.f.wilful&&!m.shove&&this.rand()<p.f.wilful){
      const alt=p.f.moves.filter(x=>x!==m&&x.dmg&&this.cost(p,x)<=p.focus&&this.allowed(p,x));
      if(alt.length&&this.rand()<0.5){ const to=alt[Math.floor(this.rand()*alt.length)]; this.ev.push({t:"wilful",i:p.i,from:m.name,to:to.name}); m=to; }
      else { p.cool=Math.max(p.cool,0.9); this.ev.push({t:"sulk",i:p.i}); return true; } }
    // dazed: half the time it does something else, and the daze wears off once it has
    if(this.has(p,"Daze")&&!m.shove&&this.rand()<0.5){ const alt=p.f.moves.filter(x=>x!==m&&!x.step&&this.cost(p,x)<=p.focus&&this.allowed(p,x));
      if(alt.length){ const to=alt[Math.floor(this.rand()*alt.length)]; this.ev.push({t:"daze",i:p.i,from:m.name,to:to.name}); m=to; }
      this.ev.push({t:"cure",i:p.i,name:"Daze"}); p.st=null; }
    if(p.stride){ p.stride=0; this.ab(p,"Long Stride"); }
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
    if(o.f.ability==="Illusion"&&!o.illusion&&m.dmg) return "phase";   // Kitsune's Illusion: a fox-fire copy takes the first attack
    if(roll>this.hitChance(p,m)) return o.buff.phase&&!m.noDodge?"phase":"dodge";
    if(this.slips(p,m,roll)) return "dodge";
    return o.buff.mirror&&m.cast&&m.dmg?"mirror":"hit"; }
  /* on screen: the move lands at its contact frame, then the turn ends when the animation finishes */
  land(){ if(!this.turn||this.turn.done) return; this.turn.done=true; this.resolve(this.p[this.turn.i],this.turn.m,this.turn.roll); }
  endTurn(){ if(!this.turn) return; const p=this.p[this.turn.i]; if(!this.turn.done) this.land(); this.turn=null; this.afterTurn(p); }
  afterTurn(p){ p.cool=0.6; for(const q of this.p) q.think=Math.max(q.think,0.35+this.rand()*0.35); }
  checkEnd(){
    for(const q of this.p){ if(q.hp<=0) continue;
      if(q.f.lifeSeed&&!q.seed&&q.hp<q.maxhp/2){ q.seed=1; this.ab(q,"Life seed"); this.heal(q,q.maxhp*0.25*this.hm(q),"seed"); }   // the held Life seed
      if(q.f.ability==="Short Fuse"&&!q.fuse&&q.hp>0&&q.hp<q.maxhp/2){ q.fuse=1; this.ab(q,"Short Fuse"); this.stage(q,{pow:1},1,q); }   // Wick
      if(q.f.ability==="Rock Shed"&&!q.shed&&q.hp>0&&q.hp<q.maxhp/2){ q.shed=1; this.ab(q,"Rock Shed"); this.stage(q,{grd:2},1,q); }   // Cobble
      if(q.f.ability==="Sprout"&&!q.sprout&&q.hp>0&&q.hp<q.maxhp*0.3){ q.sprout=1; this.ab(q,"Sprout"); this.heal(q,q.maxhp*0.2,"heal"); }   // Oaklet
      if(q.f.ability==="Healing Horn"&&!q.horn&&q.hp>0&&q.hp<q.maxhp*0.4){ q.horn=1; this.ab(q,"Healing Horn"); this.heal(q,q.maxhp*0.3,"heal"); }   // Unicorn
      if(q.f.ability==="Last Stand"&&!q.lastStand&&q.hp<q.maxhp/4){ q.lastStand=1; this.ab(q,"Last Stand"); this.heal(q,q.maxhp*0.2,"stand"); } }   // Brawl's Last Stand
    for(const q of this.p){ const o=this.p[1-q.i]; if(q.hp<=0&&q.f.ability==="Haunt"&&!q.haunted&&o.hp>0){ q.haunted=1; this.ab(q,"Haunt"); const d=Math.round(o.maxhp/4); o.hp=Math.max(0,o.hp-d); q.dealt+=d; this.ev.push({t:"recoil",i:o.i,dmg:d}); } }   // Shade's Haunt
    for(const q of this.p) if(q.hp<=0&&q.f.ability==="Rebirth"&&!q.reborn){ q.reborn=1; q.hp=Math.round(q.maxhp*0.25); q.st=null; this.ev.push({t:"ability",i:q.i,name:"Rebirth"}); this.ev.push({t:"heal",i:q.i,amt:q.hp,src:"rebirth"}); }   // Phoenix
    const [a,b]=this.p; if(a.hp<=0||b.hp<=0){ this.over=true; this.winner=a.hp<=0&&b.hp<=0?null:a.hp<=0?1:0; } }
  heal(f,amt,src,from){ const n=Math.max(0,Math.min(Math.round(amt),f.maxhp-f.hp)); if(f.hp<=0) return 0; f.hp+=n; this.ev.push({t:"heal",i:f.i,amt:n,src,from}); return n; }
  inflict(f,name,pct,from){
    if(f.hp<=0||f.st||f.buff.ward||!AR_STATUS[name]) return false;
    if(name==="Freeze"&&(f.thawT>0||f.f.ability==="Thick Fur")) return false;
    if(name==="Poison"&&(f.f.el1==="Steel"||f.f.el2==="Steel")&&!(from&&from.f.ability==="Corrosion")) return false;   // Venom's Corrosion can Poison metal
    if(name==="Freeze"&&from&&from.f.ability==="Permafrost") pct*=2;
    if(name==="Root"&&f.f.ability==="Slow and Sure"){ this.ab(f,"Slow and Sure"); return false; }   // Trundle
    if(name==="Blind"&&f.f.ability==="Bright"){ this.ev.push({t:"ability",i:f.i,name:"Bright"}); return false; }   // Lern's Bright
    if(this.rand()*100>=pct) return false;
    if(f.f.ability==="Sanctuary"&&f.hp>=f.maxhp){ this.ab(f,"Sanctuary"); return false; }   // Light's Sanctuary: nothing lands while its HP is full
    if(name==="Crack"&&f.f.ability==="Unbreakable"){ this.ab(f,"Unbreakable"); return false; }
    if(from&&from!==f){ if(name==="Burn"&&from.f.ability==="Wildfire") this.ab(from,"Wildfire",true); if(from.f.ability==="Volatile") this.ab(from,"Volatile",true); }
    f.st={name,wild:name==="Burn"&&!!from&&from.f.ability==="Wildfire",t:AR_STATUS[name].d*(from&&from.f.ability==="Volatile"?1.3:1),from:from?from.i:null,tick:0}; this.ev.push({t:"status",i:f.i,name}); return true; }   // Volatile: Fizz's statuses last 30% longer
  // raise (sign 1) or lower (sign -1) stats for a while; Bulwark keeps its stats from being lowered
  // src: whoever caused it, so Defiant only answers the opponent's drops
  stage(f,what,sign,src){ if(typeof what==="number") what={pow:what};
    for(const [k,n] of Object.entries(what)){ if(!AR_STATS.includes(k)) continue;
      const keep=k==="spr"&&(f.f.ability==="Bright"||f.f.ability==="Keen Eye"||f.f.ability==="Slow and Sure")?f.f.ability:k==="grd"&&f.f.ability==="Unbreakable"?"Unbreakable":null;
      if(sign<0&&(f.buff.bulwark||keep)){ if(keep&&keep!=="Bright") this.ab(f,keep); this.ev.push({t:"stage",i:f.i,k,n:0}); continue; }
      const was=f.stg[k]; f.stg[k]=Math.max(-3,Math.min(3,was+sign*n)); f.stgT[k]=AR_STAGE_T; this.ev.push({t:"stage",i:f.i,k,n:f.stg[k]-was});
      if(sign<0&&src&&src!==f&&f.f.ability==="Defiant"&&f.stg[k]<was&&f.stg.pow<3&&f.hp>0){ this.ab(f,"Defiant"); this.stage(f,{pow:1},1); }   // Brawl's Defiant
      const o=this.p[1-f.i];
      if(sign>0&&f.stg[k]>was&&o.f.ability==="Mirror Mind"&&o.hp>0&&!this.mirroring){ this.mirroring=1; this.ab(o,"Mirror Mind"); this.stage(o,{[k]:f.stg[k]-was},1); this.mirroring=0; } } }   // Charm's Mirror Mind
  step(){
    if(this.over||this.turn) return;
    for(const p of this.p) p.px=p.x;   // where it stood last step, so the screen can glide between steps
    if(!this.opened){ this.opened=true; for(const q of this.p) if(q.f.ability==="Beguile"){ this.ab(q,"Beguile"); this.stage(this.p[1-q.i],{pow:1},-1,q); }
      for(const q of this.p) if(q.f.ability==="Fright"){ this.ab(q,"Fright"); this.stage(this.p[1-q.i],{spd:1},-1,q); } }   // Jack's Fright   // Charm's Beguile
    for(const p of this.p){ if(!p.buff.brace) p.focus=Math.min(99,p.focus+this.regen(p)*AR.DT*(p.f.ability==="Steeping"&&(p.walkT==null||this.t-p.walkT>0.5)?1.1:1)*(p.f.ability==="Wind Up"?1.15:1)*(this.p[1-p.i].f.ability==="Lullaby"?0.9:1));   // Ditty's Lullaby   // Tock's Wind Up   // Teep's Steeping
      for(const k of ["cool","hold","slow","stun","sleep","thawT","shoveCool","think"]) p[k]=Math.max(0,p[k]-AR.DT);
      for(const k in p.buff){ p.buff[k]-=AR.DT; if(p.buff[k]<=0){ delete p.buff[k]; this.ev.push({t:"unbuff",i:p.i,k}); } }
      for(const k in p.stgT){ p.stgT[k]-=AR.DT; if(p.stgT[k]<=0){ delete p.stgT[k]; p.stg[k]=0; this.ev.push({t:"stage",i:p.i,k,n:0,end:1}); } }
      if(p.f.ability==="Nap"&&p.hp>0){ if(p.walkT!=null&&this.t-p.walkT<0.3) p.napT=0; else { p.napT=(p.napT||0)+AR.DT; if(p.napT>=2){ p.napT-=2; if(p.hp<p.maxhp){ this.ab(p,"Nap",true); this.heal(p,p.maxhp*0.03,"heal"); } } } }   // Snooze
      if(p.f.ability==="Wind-Up Key"&&p.hp>0){ p.keyT=(p.keyT||0)+AR.DT; if(p.keyT>=10){ p.keyT-=10; this.ab(p,"Wind-Up Key"); this.stage(p,{spd:1},1,p); } }   // Clank
      if(p.f.ability==="Regrow"&&p.hp>0){ p.regT=(p.regT||0)+AR.DT; if(p.regT>=3){ p.regT-=3; if(p.hp<p.maxhp){ this.ab(p,"Regrow",true); this.heal(p,p.maxhp*0.02,"heal"); } } }   // Glop's Regrow
      if(p.f.ability==="Sunbather"&&p.hp>0){ p.sunT+=AR.DT; if(p.sunT>=4){ p.sunT-=4; if(p.hp<p.maxhp){ this.ab(p,"Sunbather",true); this.heal(p,p.maxhp*0.01,"sun"); } } }   // Wild's Sunbather: 1% every 4 seconds
      if(p.buff.regen){ p.regenT+=AR.DT; if(p.regenT>=1){ p.regenT-=1; this.heal(p,p.maxhp*0.025,"regen"); } } else p.regenT=0;
      // a status ticks once a second: damage over time, Root's drain back to the rooter, Shock's jolts
      const st=p.st; if(st){ const S=AR_STATUS[st.name]; st.t-=AR.DT; st.tick+=AR.DT;
        if(st.tick>=1){ st.tick-=1; const src=st.from!=null?this.p[st.from]:null;
          if(S.dot){ const d=Math.max(1,Math.round(p.maxhp*S.dot*(st.wild?2:1))); p.hp=Math.max(0,p.hp-d); if(src) src.dealt+=d; this.ev.push({t:"tick",i:p.i,name:st.name,dmg:d}); if(S.leech&&src) this.heal(src,d,"leech",p.i); }   // a Wildfire burn (st.wild) hurts twice as much
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
      if(m.lower) this.stage(o,m.lower,-1,p);
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
    if(m.buff){ this.ev.push({t:"buff",i:p.i,m}); p.buff[m.buff]=AR_BUFF_T[m.buff]||1.5; (p.bcd=p.bcd||{})[m.buff]=this.t+(AR_BUFF_T[m.buff]||1.5)+AR_BUFF_REST;
      if(m.buff==="brace"&&p.f.ability==="Halo"&&p.hp<p.maxhp){ this.ab(p,"Halo"); this.heal(p,p.maxhp/8*Math.pow(0.75,p.halo++),"halo"); }   // Light's Halo, a quarter weaker each time
      return; }
    if(m.support){ this.support(p,m,roll); return; }
    if(m.step&&!m.dmg){ this.stepMove(p,m); if(m.selfHeal) this.heal(p,p.maxhp*m.selfHeal,"heal"); return; }
    if(m.step){ this.strike(p,m,roll); if(!this.over) this.stepMove(p,m); return; }   // hit, then hop back
    this.strike(p,m,roll);
  }
  stepMove(p,m){ const o=this.p[1-p.i], d=this.dirTo(p); this.ev.push({t:"step",i:p.i,m}); const s=m.step*d*(m.step<0&&this.undertow(p)?0.75:1), lo=o.x<p.x?o.x+AR.BODY:0, hi=o.x>p.x?o.x-AR.BODY:AR.LEN; p.x=Math.max(lo,Math.min(hi,p.x+s)); }
  strike(p,m,roll){
    const o=this.p[1-p.i], d=this.dirTo(p), R=this.rand;
    if(m.dash){ const want=m.dash==="near"?14:AR.BODY+2; p.x=o.x-d*want; p.x=Math.max(0,Math.min(AR.LEN,p.x)); }
    else if(!this.inRange(m)){ this.ev.push({t:"miss",i:p.i,m,why:"out"}); return; }   // it stepped out of reach during the windup
    if(o.buff.bubble&&(m.range==="Mid"||m.range==="Far")){ delete o.buff.bubble; this.ev.push({t:"miss",i:p.i,m,why:"block"}); return; }
    if(o.buff.protect&&(m.dmg||m.status)){ delete o.buff.protect; this.ev.push({t:"block",i:p.i,m}); return; }
    if(o.f.ability==="Illusion"&&!o.illusion&&m.dmg){ o.illusion=1; this.ev.push({t:"ability",i:o.i,name:"Illusion"}); this.ev.push({t:"miss",i:p.i,m,why:"phase"}); return; }
    if(o.f.ability==="Flicker"&&m.dmg&&R()<0.1){ this.ab(o,"Flicker"); this.ev.push({t:"miss",i:p.i,m,why:"phase"}); return; }   // Lumo
    const slip=this.slips(p,m,roll); if(slip) this.ab(o,"Slippery");
    if(slip||roll>this.hitChance(p,m)){ this.ev.push({t:"miss",i:p.i,m,why:o.buff.phase&&!m.noDodge&&!slip?"phase":"dodge"}); if(o.f.ability==="Counterpunch"){ o.cpunch=1; this.ev.push({t:"ability",i:o.i,name:"Counterpunch"}); } return; }   // Bipped's Counterpunch
    if(m.el==="Spark"&&m.dmg&&o.f.ability==="Lightning Rod"){ this.ab(o,"Lightning Rod"); this.heal(o,o.maxhp*0.25,"rod"); return; }   // Spark's Lightning Rod soaks it up
    // a mirror sends a Cast back at whoever threw it
    let tg=o; if(o.buff.mirror&&m.cast&&m.dmg){ delete o.buff.mirror; this.ev.push({t:"mirror",i:o.i,m}); tg=p; }
    const hitBy=tg===p?o:p;   // whose hit it counts as on screen
    if(m.swap){ const x=p.x; p.x=o.x; o.x=x; this.ev.push({t:"swap",i:p.i,m}); }
    const nh=m.hitsRange?m.hitsRange[0]+Math.floor(R()*(m.hitsRange[1]-m.hitsRange[0]+1)):(m.hits||1);
    let total=0, sure=p.buff.foresight&&m.cast, lastMul=1; if(sure) delete p.buff.foresight;
    for(let h=0;h<nh&&tg.hp>0;h++) if(m.dmg){
      const atk=this.eff(p,m.atkStat||(m.cast?"mnd":"pow")), con=m.pierce&&tg.stg.grd>0?tg.f.base.grd:this.eff(tg,"grd"), dfs=m.cast?(con+3*(tg.f.level+5))/4:(con+tg.f.level+5)/2;
      let dmg=m.dmg*atk/dfs*(p.f.level/50+0.4)/2*0.55*AR_BAND_DMG[m.range]*(AR_FAM_DMG[p.f.family]||1);
      if(m.el&&typeof vs==="function"){ const part=e=>{ if(!e) return 1; let v=vs(m.el,e); if(m.el==="Venom"&&e==="Steel"&&p.f.ability==="Corrosion"){ v=Math.max(1,v); if(h===0) this.ab(p,"Corrosion",true); } return v; };   // Venom's Corrosion
        let mm=part(tg.f.el1)*part(tg.f.el2); if(m.el==="Blaze"&&mm>1&&tg.f.ability==="Insulated"){ mm=1; if(h===0) this.ab(tg,"Insulated"); }   // Frost's Insulated
        lastMul=mm; dmg*=mm; if(m.el===p.f.el1||m.el===p.f.el2) dmg*=1.2; if(p.f.heldEl&&m.el===p.f.heldEl) dmg*=1+0.2*this.hm(p); }   // the held Element stone
      if(p.f.ability==="Big Bite"&&!m.cast&&m.dmg<=50){ dmg*=1.2; if(h===0) this.ab(p,"Big Bite",true); }   // Chomp's Big Bite
      if(p.f.ability==="Bloom"&&m.el==="Wild"&&p.hp<p.maxhp/3){ dmg*=1.5; if(h===0) this.ab(p,"Bloom",true); }   // Wild's Bloom
      if(tg.f.ability==="Plated"&&!m.cast){ dmg*=0.9; if(h===0) this.ab(tg,"Plated",true); }   // Steel's Plated
      if(tg.f.ability==="Parasol"&&m.cast){ dmg*=0.8; if(h===0) this.ab(tg,"Parasol",true); }   // Brolly
      if(tg.f.ability==="Stack"&&tg.stack){ dmg*=1-0.03*Math.min(3,tg.stack); if(h===0) this.ab(tg,"Stack",true); }   // Dango
      if(tg.f.ability==="Roll Up"&&!m.cast&&m.range==="Close"&&tg.hp<tg.maxhp/2){ dmg*=0.75; if(h===0) this.ab(tg,"Roll Up",true); }   // Roly
      if(tg.f.ability==="Paper Fold"&&!m.cast&&m.range==="Close"){ dmg*=0.85; if(h===0) this.ab(tg,"Paper Fold",true); }   // Crease
      if(tg.f.ability==="Stone Skin"){ dmg*=0.9; if(h===0) this.ab(tg,"Stone Skin",true); }   // Golem
      if(tg.f.ability==="Wobble"&&!tg.wob){ tg.wob=1; dmg*=0.7; this.ab(tg,"Wobble"); }   // Squib's Wobble
      if(m.hpScale) dmg*=0.4+0.6*p.hp/p.maxhp;
      if(tg.f.ability==="Thick Fur"&&(m.el==="Blaze"||m.el==="Frost")){ dmg*=0.75; if(h===0) this.ev.push({t:"ability",i:tg.i,name:"Thick Fur"}); }   // Yeti
      if(m.ifPoison&&this.has(tg,"Poison")||m.ifStatus&&tg.st) dmg*=2;
      if(m.el==="Spark"&&this.has(tg,"Soak")) dmg*=1.25;
      let shatter=false; if(this.has(tg,"Freeze")){ dmg*=1.25*(p.f.ability==="Permafrost"?1.2:1); shatter=true; if(p.f.ability==="Permafrost") this.ab(p,"Permafrost",true); }
      const sky=p.f.ability==="Sky High"&&!p.sky&&tg===o; if(sky){ p.sky=1; this.ev.push({t:"ability",i:p.i,name:"Sky High"}); }   // Eagle's Sky High
      const rolled=!tg.buff.bulwark&&R()<m.sharp+edge(this.eff(p,"pow"),con,0.2,0,0.12)+(p.f.critBonus||0), shell=(tg.f.ability==="Shell"||tg.f.ability==="Stone Skin")&&rolled&&!sky&&!sure;
      const crit=sky||sure||rolled&&!shell; if(crit) dmg*=1.5; if(shell) this.ab(tg,"Shell",true);   // Pinch's Shell stops crits; Lucky bit and Sunglasses add to them
      if(p.cpunch&&!m.cast&&tg===o) dmg*=1.2;
      if(tg.buff.brace) dmg*=0.6; if(tg.buff.bunker) dmg*=0.8; if(tg.buff.castWard&&m.cast) dmg*=0.5;
      dmg=Math.max(1,Math.round(dmg*(0.9+R()*0.1)));
      if(tg.f.ability==="Bedrock"&&tg.hp>=tg.maxhp&&dmg>=tg.hp){ dmg=tg.hp-1; this.ab(tg,"Bedrock"); }   // Stone's Bedrock
      if(tg.buff.endure&&dmg>=tg.hp){ dmg=Math.max(0,tg.hp-1); delete tg.buff.endure; this.ev.push({t:"endure",i:tg.i}); }
      tg.hp=Math.max(0,tg.hp-dmg); hitBy.dealt+=dmg; total+=dmg; this.ev.push({t:"hit",i:hitBy.i,m,dmg,crit,h}); if(SKILLS[m.name]) (tg.f.hitBy=tg.f.hitBy||{})[m.name]=1;
      if(shatter){ this.ev.push({t:"cure",i:tg.i,name:"Freeze",why:"shatter"}); tg.st=null; tg.thawT=5; }
      if(tg.sleep>0){ tg.sleep=0; this.ev.push({t:"wake",i:tg.i}); }
      if(tg===o&&!m.cast){ const ct=o.buff.counter?o.counterMul:o.buff.riposte?1.5:0;
        if(ct){ const back=Math.round(dmg*ct); p.hp=Math.max(0,p.hp-back); o.dealt+=back; this.ev.push({t:"counter",i:o.i,dmg:back}); if(o.buff.counter) delete o.buff.counter; } }
    }
    if(p.cpunch&&!m.cast&&m.dmg) p.cpunch=0;
    if(m.drain&&total&&tg===o) this.heal(p,total*m.drain,"drain",o.i);
    if(p.f.ability==="Bloodsuck"&&!m.cast&&total&&tg===o&&p.hp<p.maxhp){ this.ev.push({t:"ability",i:p.i,name:"Bloodsuck"}); this.heal(p,total*0.15,"drain",o.i); }   // Vampire
    if(tg===o&&total) o.stack=(o.stack||0)+1;   // Dango's Stack counts the hits it has taken
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Drizzle"&&!o.st&&R()<0.15&&this.inflict(o,"Soak",100,p)) this.ab(p,"Drizzle");   // Nimbo
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Shaken"&&!o.st&&R()<0.15&&this.inflict(o,"Daze",100,p)) this.ab(p,"Shaken");   // Swirl
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Smudge"&&!o.st&&R()<0.15&&this.inflict(o,"Blind",100,p)) this.ab(p,"Smudge");   // Inky
    if(tg===o&&!m.cast&&m.range==="Close"&&total&&o.hp>0){
      if(o.f.ability==="Spores"&&!p.st&&R()<0.2&&this.inflict(p,"Daze",100,o)) this.ab(o,"Spores");   // Puff
      if(o.f.ability==="Prickly"&&p.hp>0){ const back=Math.max(1,Math.round(p.maxhp/16)); p.hp=Math.max(0,p.hp-back); o.dealt+=back; this.ab(o,"Prickly",true); this.ev.push({t:"recoil",i:p.i,dmg:back}); }   // Spine
      if(p.f.ability==="Dirt Kick"&&!o.st&&R()<0.15&&this.inflict(o,"Blind",100,p)) this.ab(p,"Dirt Kick");   // Burr
      if(p.f.ability==="Grapple"&&!o.st&&R()<0.25&&this.inflict(o,"Root",100,p)) this.ab(p,"Grapple");   // Kraken
      if(p.f.ability==="Hit and Run"&&p.hp>0&&!this.over){ this.ab(p,"Hit and Run",true); this.stepMove(p,{step:-18}); } }   // Flit
    if(tg===o&&o.f.ability==="Coil"&&!m.cast&&m.range==="Close"&&total&&o.hp>0&&R()<0.25&&!p.st){ this.ev.push({t:"ability",i:o.i,name:"Coil"}); this.inflict(p,"Root",100,o); }   // Naga
    if(tg===o&&total&&!m.cast&&o.hp>0&&p.hp>0){   // abilities that answer a Strike that landed
      if(o.f.ability==="Hothead"&&!p.st&&R()<0.1&&this.inflict(p,"Burn",100,o)) this.ab(o,"Hothead");
      if(o.f.ability==="Static Skin"&&!p.st&&R()<0.2&&this.inflict(p,"Shock",100,o)) this.ab(o,"Static Skin");
      if(p.f.ability==="Toxic Touch"&&!o.st&&R()<0.1&&this.inflict(o,"Poison",100,p)) this.ab(p,"Toxic Touch"); }
    if(m.basic&&tg===o&&total&&o.hp>0&&p.f.ability==="Web"&&R()<0.3){ this.ab(p,"Web"); this.stage(o,{spd:1},-1,p); }   // Skit's Web
    if(tg===o&&m.cast&&total&&lastMul<1&&o.f.ability==="Reflect"&&p.hp>0){ const back=Math.max(1,Math.round(total*0.3)); p.hp=Math.max(0,p.hp-back); o.dealt+=back; this.ab(o,"Reflect"); this.ev.push({t:"recoil",i:p.i,dmg:back}); }   // Steel's Reflect
    if(m.recoil&&total){ const r=Math.max(1,Math.round(total*m.recoil)); p.hp=Math.max(0,p.hp-r); this.ev.push({t:"recoil",i:p.i,dmg:r}); }
    if(m.steal&&tg===o){ const f=Math.min(o.focus,m.steal*6); o.focus-=f; p.focus=Math.min(99,p.focus+f); this.ev.push({t:"steal",i:p.i,amt:Math.round(f)}); }
    if(m.status&&tg.hp>0) this.inflict(tg,m.status[0],m.status[1]*this.statusOdds(p,tg),hitBy===p?p:o);
    if(m.lower&&tg.hp>0&&R()*100<(m.lowerChance||100)) this.stage(tg,m.lower,-1,hitBy);
    if(m.selfLower) this.stage(p,m.selfLower,-1);
    if(m.wither){ const w=m.wither*(1+edge(this.eff(p,"mnd"),this.eff(o,"spr"),0.5,-0.3,0.5)); if(o.buff.unblink){} else if(o.buff.feedback) p.focus=Math.max(0,p.focus-w); else o.focus=Math.max(0,o.focus-w); }
    if(m.push&&tg===o&&!o.buff.brace&&!o.buff.bunker){
      const k=(1+edge(this.eff(p,m.cast?"mnd":"pow"),this.eff(o,"grd"),0.5,-0.4,0.4))*(p.f.ability==="Heavy Hands"&&!m.cast&&m.push>0?1.5:1), s=m.push*k*(this.has(o,"Root")?0.5:1)*(o.f.ability==="Steady"&&m.push>0?0.5:1)*(o.f.ability==="Deep Roots"&&m.push>0?0:1);   // Plod's Steady, Twiglet's Deep Roots
      if(o.f.ability==="Steady"&&m.push>0) this.ab(o,"Steady",true);
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
      else if(m.buff!=="brace") v=threat?14:0;   // Brace lasts too short for the computer to time it
      else if(p.f.ability==="Halo"&&miss>0.3&&p.halo<3) v=120*Math.min(0.125*Math.pow(0.75,p.halo),miss); }   // unless it heals with Halo, up to 3 times a fight
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
function arSim(a,b,rand,noDraw,shown){
  const ar=new Arena(a,b,rand); ar.noDraw=!!noDraw;
  // shown: stepped the way the fight screen steps it (one move at a time, the clock stopped while it plays), so the same seed gives the fight the screen will show
  if(shown){ ar.live=true; while(!ar.over){ ar.step(); if(ar.turn) ar.endTurn(); } } else ar.run();
  return {winner:ar.winner,judged:!!ar.judged,turn:Math.round(ar.t),secs:Math.round(ar.t),ar,p:ar.p.map(x=>Object.assign(x.f,{hp:x.hp,maxhp:x.maxhp}))};
}
