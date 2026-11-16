/* The new arena, first pass: a real-time fight on a line between two walls, run in fixed steps of a tenth of a second
   so cup fights between computer monsters can be simulated instantly. Not hooked into the game yet.
   Needs battle.js (edge, vs, makeFighter) and skills.js (SKILLS). The numbers follow the "Snabits arena and movesets" doc. */
const AR={ LEN:100, BODY:6, DT:0.1, TIME:60, BANDS:["Close","Near","Mid","Far"] };
const AR_SHOVE={name:"Shove",range:"Close",dmg:0,acc:95,sharp:0,wither:0,push:18,cost:0,wind:0.2,shove:true};
const arBand=gap=>gap<10?"Close":gap<25?"Near":gap<45?"Mid":"Far";
/* hitting from further away is harder to set up, so it pays a little more */
const AR_BAND_DMG={Close:0.8,Near:0.95,Mid:1.2,Far:1.5,Any:1};
/* a family's damage, tuned so every family wins about half its fights in the balance sim */
const AR_FAM_DMG={Chomp:0.88,Pinch:1.03,Stilt:0.97,Skit:1.18,Antik:0.89,Squib:0.99,Moko:1.27,Booly:1.07,Plod:0.9,Bipped:1.11,Fizz:1.19,Teep:0.93,Lern:1.48,Eagle:1.01,Vampire:1.03,Phoenix:0.83,Kitsune:1.28,Naga:0.78,Yeti:0.72,Puff:1.2,Flit:1.29,Glop:0.81,Tock:1.24,Mitt:0.8,Brolly:0.98,Spine:0.83,Burr:0.99,Kraken:0.73,Golem:0.76,Unicorn:1.03,Jack:1.1,Wick:1,Lumo:1.28,Snooze:0.82,Inky:1.42,Cobble:0.97,Nimbo:1.15,Dango:1,Oaklet:1.14,Roly:1.11,Trundle:1.24,Clank:0.92,Crease:1.36,Twiglet:1,Swirl:1.25,Ditty:1.14,Sizzle:1.2,Aero:1.12,Nesta:1.16,Magna:1,Helm:0.95,Bloop:1.2,Sox:0.98,Cuppy:1,Suds:1.14,Scoop:0.98,Tome:1.06,Gumball:1.08,Pina:0.97,Jingle:1.18,Presto:1.13,Vroom:0.97,Shutter:1.17,Yoyo:0.96,Lava:1.0,Pogo:1.16,Tengu:1.16,Tanuki:0.86,Mermaid:1.14,Diwata:0.95,Sphinx:1,Garuda:1.22,Werewolf:0.85,Minotaur:0.82,Dragon:1.06,Thunderbird:1.2,Hydra:0.92,Griffin:1,Kirin:1.32,Salamander:1.2,Bakunawa:1.25,Cerberus:0.83,Djinn:1.14,Troll:0.86,Mummy:1,Sarimanok:1.12,Cthulhu:1.05,Hastur:1.2,Shoggoth:0.85,Dagon:0.92,Migo:1.35,Nightgaunt:1.08,Ghoul:0.82,Gug:0.72,Yog:1.2,Shub:0.72};   // retuned 15 Nov 2026 after melee lost Leap Back

/* [name, learned at, range, damage, accuracy, sharpness, wither, push, cost, windup, extras] */
const FAM_MOVES={
  /* Chomp, the first family written out in full (16 Nov 2026): MR2's Gaboo move for move. lv is the level it comes by growth;
     for an errantry move it's the level a computer Snabit has it by. err: the region whose errantry teaches it. from: the move whose
     use in fights can teach it early. after: the move it needs first. need: the stat it leans on. share: the body parts another
     family needs to learn it on that errantry. cat: Basic, Hit, Heavy, Sharp, Withering or Special */
  Chomp:[["Bite",1,"Close",24,85,10,2,4,10,0.3,{cat:"Basic"}],["Nibble",2,"Near",22,88,8,1,0,11,0.3,{cat:"Basic",dash:"in"}],["Lunge",3,"Near",35,75,8,0,0,16,0.5,{dash:"in",cat:"Hit"}],
    ["Crunch",5,"Close",64,70,12,0,6,30,0.8,{status:["Crack",30],cat:"Special"}],["Rolling Bite",6,"Near",34,80,10,0,8,19,0.5,{dash:"in",cat:"Basic",from:"Bite"}],
    ["Leapfrog Bite",8,"Close",20,70,5,0,0,14,0.4,{swap:1,cat:"Basic"}],["Tooth Shot",10,"Far",26,92,8,0,0,18,0.4,{cast:1,cat:"Hit",share:["fangs"]}],["Chatter",12,"Near",24,94,5,2,22,17,0.4,{cast:1,cat:"Hit"}],
    ["Body Slam",14,"Close",46,70,5,5,25,26,0.7,{cat:"Heavy",err:"Granite Steps"}],["Jaw Lock",18,"Close",25,80,0,12,0,20,0.4,{hold:2,cat:"Withering",err:"Hollow Moor",share:["fangs"]}],
    ["Big Gulp",20,"Mid",18,82,5,14,0,16,0.5,{cast:1,cat:"Withering",err:"Dream Garden",need:"mnd"}],["Drool",22,"Far",26,72,5,8,0,24,0.6,{cast:1,status:["Poison",35],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],
    ["Belly Flop",24,"Close",34,80,30,0,10,18,0.6,{cat:"Sharp",err:"Saffron Dojo",after:"Body Slam",share:["round"]}],["Jaw Drop",26,"Far",40,72,28,0,6,28,0.8,{dash:"in",cat:"Sharp",err:"Granite Steps"}],
    ["Charge",30,"Mid",60,65,10,0,20,34,1.0,{dash:"in",cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Lunge"}],["Gnash",34,"Close",15,80,20,1,0,38,0.6,{hits:4,cat:"Special",err:"Hollow Moor"}],
    ["Chomp Combo",40,"Close",70,86,12,0,12,40,1.0,{cat:"Special",err:"Saffron Dojo",need:"pow",after:"Rolling Bite"}]],
  Pinch:[["Pinch",1,"Close",25,88,10,0,4,10,0.3,{cat:"Basic"}],["Shell Butt",2,"Near",22,86,5,0,8,11,0.3,{dash:"in",cat:"Basic"}],["Claw Jab",3,"Near",32,80,8,0,6,14,0.4,{cat:"Hit"}],
    ["Bunker Down",5,"Any",0,100,0,0,0,20,0.2,{buff:"bunker"}],["Double Pinch",6,"Close",16,84,6,0,4,16,0.4,{hits:2,cat:"Hit",from:"Pinch"}],["Scuttle Under",8,"Close",15,80,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Long Jab",10,"Mid",28,86,8,0,8,17,0.4,{cat:"Hit",from:"Claw Jab"}],["Riposte",14,"Close",0,100,0,0,0,18,0.1,{buff:"riposte"}],["Sand Spray",18,"Mid",20,84,0,10,0,16,0.4,{status:["Blind",25],cat:"Withering",err:"Granite Steps"}],
    ["Claw Swing",18,"Near",52,68,5,0,15,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow"}],["Shell Ram",20,"Mid",45,70,5,0,20,24,0.6,{dash:"in",cat:"Heavy",err:"Granite Steps",after:"Shell Butt",need:"pow"}],["Pincer Snip",21,"Close",36,78,26,0,0,20,0.6,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],
    ["Big Pinch",22,"Close",60,66,5,0,12,30,0.9,{cat:"Heavy",err:"Saffron Dojo",after:"Double Pinch",need:"pow",share:["claws"]}],["Claw Slice",24,"Near",38,76,27,0,0,22,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow"}],["Leap Snip",25,"Mid",36,74,28,0,0,24,0.7,{dash:"in",cat:"Sharp",err:"Saffron Dojo",need:"pow"}],
    ["Tide Slam",26,"Close",54,68,5,0,20,30,0.9,{cat:"Heavy",err:"Coral Shallows",need:"pow"}],["Water Dart",27,"Far",30,74,26,0,0,24,0.8,{cast:1,cat:"Sharp",err:"Coral Shallows",need:"mnd"}],["Ice Pinch",29,"Close",36,76,28,0,0,24,0.7,{status:["Freeze",20],cat:"Sharp",err:"Glacier Rim",need:"pow"}],
    ["Vice Grip",30,"Close",36,75,5,15,0,28,0.5,{hold:1.5,cat:"Withering",err:"Iron Foundry",share:["claws"]}],["Jab Barrage",32,"Near",14,80,6,0,0,40,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",after:"Long Jab",need:"pow"}],["Shell Roll",34,"Mid",68,70,5,0,20,38,1.0,{dash:"in",cat:"Special",err:"Granite Steps",after:"Shell Ram",need:"pow",share:["shell"]}],
    ["Bubble Burst",36,"Mid",70,72,0,0,10,38,1.0,{cast:1,cat:"Special",err:"Coral Shallows",need:"mnd"}],["Claw Spin",38,"Close",26,72,12,0,0,38,0.9,{hits:3,cat:"Special",err:"Iron Foundry",need:"pow"}],["Crab Hammer",40,"Close",72,60,20,0,15,40,1.0,{cat:"Special",err:"Iron Foundry",need:"pow"}]],
  Stilt:[["Kick",1,"Near",30,85,8,0,8,10,0.3,{cat:"Basic"}],["Jump Kick",3,"Near",24,85,8,0,6,12,0.35,{dash:"in",cat:"Basic",from:"Kick"}],["High Kick",5,"Near",74,65,15,0,12,32,0.8,{status:["Daze",25],cat:"Special"}],
    ["Vault",8,"Close",18,75,5,0,0,12,0.3,{swap:1,cat:"Basic"}],["Sweep",14,"Close",30,80,5,0,0,16,0.4,{slow:3,cat:"Hit"}],["Heel Drop",18,"Close",34,76,27,0,6,22,0.7,{cat:"Sharp",err:"Granite Steps",need:"pow"}],
    ["Long Stride",20,"Mid",40,70,10,0,0,22,0.6,{dash:"near",cat:"Hit",from:"Sweep"}],["Ankle Kick",22,"Near",22,82,5,12,0,18,0.5,{cat:"Withering",err:"Saffron Dojo",share:["legs"]}],["Crane Kick",25,"Close",38,76,28,0,8,24,0.7,{cat:"Sharp",err:"Dawn Temple",need:"pow"}],
    ["Axe Kick",30,"Near",75,70,20,0,10,36,0.9,{cat:"Special",err:"Saffron Dojo",after:"Jump Kick",need:"pow",share:["legs"]}],["Kick Combo",34,"Near",16,78,8,0,0,38,0.9,{hits:4,cat:"Special",err:"Saffron Dojo",need:"pow"}],["Wind Kick",36,"Far",56,70,10,0,0,38,1.0,{cast:1,cat:"Special",err:"Static Plains",need:"mnd"}],
    ["Stampede",40,"Near",20,75,10,0,10,38,0.6,{hits:3,cat:"Special",err:"Granite Steps",after:"Long Stride",need:"pow"}]],
  Skit:[["Nip",1,"Close",24,90,10,0,0,8,0.2,{cat:"Basic"}],["Skitter Bite",3,"Near",18,85,8,0,0,12,0.25,{dash:"in",cat:"Basic"}],["Web",5,"Mid",42,80,5,0,0,18,0.5,{slow:3,cat:"Special"}],
    ["Double Nip",6,"Close",18,85,8,0,0,14,0.4,{hits:2,cat:"Hit",from:"Nip"}],["Silk Spit",7,"Far",26,88,5,0,0,16,0.4,{cat:"Hit"}],["Web Swing",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],
    ["Spider Leap",12,"Mid",30,80,5,0,6,15,0.45,{dash:"in",cat:"Hit",from:"Skitter Bite"}],["Reel In",14,"Mid",20,75,0,0,-25,18,0.5,{cat:"Basic"}],["Poison Bite",16,"Close",22,80,0,10,0,18,0.4,{status:["Poison",35],cat:"Withering",err:"Nightshade Marsh",share:["fangs"]}],
    ["Fang Stab",18,"Close",36,76,28,0,0,22,0.7,{cat:"Sharp",err:"Nightshade Marsh",share:["fangs"]}],["Trap Line",20,"Mid",0,100,0,0,0,20,0.4,{slow:4}],["Dread Crawl",22,"Near",22,76,0,12,0,20,0.5,{status:["Dread",30],cat:"Withering",err:"Hollow Moor"}],
    ["Leg Slam",24,"Close",54,70,6,0,8,28,0.8,{cat:"Heavy",err:"Saffron Dojo"}],["Leg Spike",26,"Near",38,76,28,0,0,24,0.7,{cat:"Sharp",err:"Saffron Dojo"}],["Ambush Strike",28,"Near",56,68,8,0,10,30,0.9,{dash:"in",cat:"Heavy",err:"Hollow Moor",after:"Spider Leap"}],
    ["Leg Flurry",30,"Close",14,80,10,0,0,30,0.5,{hits:4,cat:"Special",err:"Static Plains",share:["legs"]}],["Leg Rush",32,"Mid",52,68,6,0,14,32,0.9,{dash:"in",cat:"Heavy",err:"Static Plains"}],["Rope Drop",34,"Far",46,66,6,0,6,30,0.9,{dash:"in",cat:"Heavy",err:"Tanglewood"}],
    ["Razor Thread",34,"Far",34,72,26,0,0,22,0.7,{cat:"Sharp",err:"Static Plains"}],["Venom Frenzy",36,"Near",24,78,6,0,0,38,1.0,{hits:3,status:["Poison",30],cat:"Special",err:"Nightshade Marsh",need:"pow",after:"Double Nip"}],["Silk Cannon",38,"Far",48,66,5,0,20,32,1.0,{cat:"Heavy",err:"Tanglewood",after:"Silk Spit"}],
    ["Cocoon",40,"Mid",30,60,0,6,0,34,0.9,{hold:2,cat:"Withering",err:"Tanglewood"}]],
  Antik:[["Zap",1,"Mid",25,85,5,6,0,10,0.3,{cast:1,cat:"Basic"}],["Arm Knock",2,"Close",26,88,8,0,4,10,0.3,{cat:"Basic"}],["Static Screen",5,"Mid",45,75,5,8,0,22,0.6,{cast:1,status:["Shock",30],cat:"Special"}],
    ["Static Hop",8,"Close",15,75,0,8,0,12,0.3,{swap:1,cat:"Basic"}],["Rocket Arm",9,"Near",32,80,8,0,8,16,0.4,{cat:"Hit",from:"Arm Knock"}],["Pixel Shot",11,"Far",24,90,5,0,0,16,0.4,{cast:1,cat:"Hit",from:"Zap"}],
    ["Signal Jam",12,"Far",15,80,0,25,0,18,0.5,{cast:1,cat:"Withering",err:"Static Plains",need:"mnd"}],["Scan Beam",18,"Far",46,70,10,0,0,28,1.0,{cast:1,cat:"Heavy",err:"Dawn Temple",after:"Pixel Shot",need:"mnd"}],["Arm Hammer",20,"Near",54,68,5,0,18,28,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow",share:["arms"]}],
    ["Pin Beam",22,"Mid",38,76,28,0,0,22,0.6,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd"}],["Antenna Spike",22,"Near",38,76,26,0,6,20,0.6,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],["Feedback",24,"Any",0,100,0,0,0,16,0.2,{buff:"feedback"}],
    ["Cable Whip",26,"Near",22,80,5,10,0,17,0.5,{cat:"Withering",err:"Iron Foundry",share:["arms"]}],["Tip Over",26,"Mid",56,66,5,0,30,30,1.0,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow"}],["Ghost Image",28,"Mid",20,80,0,13,0,17,0.5,{cast:1,status:["Dread",20],cat:"Withering",err:"Hollow Moor",need:"mnd"}],
    ["Laser Line",28,"Far",34,74,27,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd"}],["Short Circuit",30,"Close",50,75,5,15,30,30,0.6,{cast:1,cat:"Heavy",err:"Static Plains"}],["Overheat",34,"Mid",70,72,5,0,5,38,1.0,{cast:1,status:["Burn",30],cat:"Special",err:"Static Plains",need:"mnd"}],
    ["Rocket Arms",36,"Near",24,74,8,0,0,38,0.9,{hits:3,cat:"Special",err:"Iron Foundry",after:"Rocket Arm",need:"pow",share:["arms"]}],["Broadcast",40,"Far",80,60,10,15,0,42,1.4,{cast:1,cat:"Special",err:"Static Plains",after:"Signal Jam",need:"mnd"}]],
  Squib:[["Squirt",1,"Mid",31,90,5,0,4,8,0.3,{cast:1,cat:"Basic"}],["Tentacle Poke",2,"Close",24,88,8,0,4,10,0.3,{cat:"Basic"}],["Jet Back",3,"Any",0,100,0,0,0,14,0.15,{step:-30,selfHeal:0.06}],
    ["Ink Jet",5,"Far",52,75,5,0,0,18,0.5,{cast:1,status:["Blind",30],cat:"Special"}],["Slip Past",8,"Close",10,85,0,0,0,10,0.2,{swap:1,cat:"Basic"}],["Tentacle Whip",10,"Near",30,86,8,0,6,15,0.4,{cat:"Hit",from:"Tentacle Poke"}],
    ["Ink Splat",12,"Far",24,90,5,0,0,17,0.4,{cast:1,cat:"Hit",from:"Squirt"}],["Tentacle Lash",14,"Near",48,75,10,0,10,20,0.5,{cat:"Heavy",err:"Saffron Dojo",need:"pow"}],["Sucker Grip",18,"Close",22,80,0,12,0,20,0.5,{hold:1.5,cat:"Withering",err:"Granite Steps"}],
    ["Bubble Wall",20,"Any",0,100,0,0,0,22,0.3,{buff:"bubble"}],["Squeeze",20,"Close",36,78,26,0,0,20,0.6,{cat:"Sharp",err:"Saffron Dojo",after:"Tentacle Lash",share:["tentacles"]}],["Tentacle Slam",22,"Close",56,68,5,0,22,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow"}],
    ["Ink Fog",24,"Mid",20,82,0,14,0,18,0.5,{cast:1,status:["Blind",20],cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Ink Cannon",26,"Far",45,66,8,0,12,30,0.9,{cast:1,cat:"Heavy",err:"Hollow Moor",after:"Ink Splat",need:"mnd"}],["Water Blade",28,"Mid",38,76,28,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Coral Shallows",need:"mnd"}],
    ["Undertow",30,"Far",35,70,0,0,-30,26,0.7,{cast:1,cat:"Hit",err:"Coral Shallows",need:"mnd"}],["Ice Needle",32,"Far",34,72,26,0,0,26,0.8,{cast:1,status:["Freeze",15],cat:"Sharp",err:"Glacier Rim",need:"mnd"}],["Jet Spin",34,"Near",24,72,8,0,0,38,0.9,{hits:3,dash:"in",cat:"Special",err:"Coral Shallows",need:"pow"}],
    ["Tentacle Frenzy",36,"Close",14,78,8,0,0,40,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",after:"Tentacle Whip",need:"pow",share:["tentacles"]}],["Riptide",40,"Mid",90,65,10,10,15,38,1.0,{cast:1,cat:"Special",err:"Coral Shallows",after:"Undertow",need:"mnd"}]],
  Moko:[["Stare",1,"Far",36,90,5,10,0,10,0.3,{cast:1,cat:"Hit"}],["Root Whack",2,"Close",24,88,8,0,4,10,0.3,{cat:"Basic"}],["Glare",5,"Far",0,85,0,6,0,16,0.4,{cast:1,lower:1}],
    ["Blink",8,"Close",16,90,0,6,0,14,0.2,{swap:1,cast:1,cat:"Basic"}],["Mind Push",10,"Mid",28,92,5,0,14,16,0.4,{cast:1,cat:"Hit",from:"Stare"}],["Mind Prick",12,"Far",56,80,10,18,0,20,0.4,{cast:1,cat:"Heavy",err:"Dream Garden",after:"Mind Push",need:"mnd"}],
    ["Dread",18,"Near",28,80,0,20,35,24,0.5,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Root Spike",22,"Close",38,76,28,0,0,22,0.7,{cat:"Sharp",err:"Tanglewood",after:"Root Whack",need:"pow",share:["tentacles"]}],["Unblinking",24,"Any",0,100,0,0,0,18,0.2,{buff:"unblink"}],
    ["Eye Beam",30,"Far",96,70,12,10,0,36,1.1,{cast:1,cat:"Special",err:"Dawn Temple",after:"Mind Prick",need:"mnd"}],["Blinding Flash",36,"Mid",66,72,0,0,0,38,1.0,{cast:1,status:["Blind",40],cat:"Special",err:"Dawn Temple",need:"mnd"}],["Hypnotize",40,"Mid",0,65,0,15,0,34,0.8,{cast:1,hold:2,cat:"Withering",err:"Dream Garden",after:"Dread",need:"mnd"}]],
  Booly:[["Wisp Shot",1,"Far",36,85,5,0,0,10,0.3,{cast:1,cat:"Hit"}],["Boo!",3,"Close",5,90,0,5,35,10,0.2,{cast:1,cat:"Basic"}],["Phase Shift",5,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],
    ["Big Boo",7,"Close",26,86,0,3,22,14,0.4,{cast:1,cat:"Basic",from:"Boo!"}],["Soul Pass",8,"Close",14,95,0,0,0,14,0.2,{swap:1,cast:1,drain:1}],["Twin Wisps",10,"Mid",18,85,5,0,0,16,0.4,{hits:2,cast:1,cat:"Hit",from:"Wisp Shot"}],
    ["Haunt",14,"Near",30,80,0,20,20,18,0.4,{cast:1,cat:"Withering",err:"Hollow Moor"}],["Cold Swipe",18,"Close",36,76,26,0,0,20,0.6,{cat:"Sharp",err:"Glacier Rim",share:["arms"]}],["Will-o'-Wisp",20,"Far",56,75,5,0,0,24,0.6,{cast:1,cat:"Heavy",err:"Cinder Peak",after:"Twin Wisps"}],
    ["Shriek",24,"Near",38,74,25,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Hollow Moor",need:"mnd",after:"Big Boo",share:["mouth"]}],["Poltergeist",30,"Mid",60,70,5,0,15,30,0.7,{cast:1,cat:"Special",err:"Granite Steps"}],["Spirit Lance",40,"Far",92,70,15,0,0,38,1.2,{cast:1,cat:"Special",err:"Dawn Temple"}]],
  /* the five families added 14 Nov 2026: Plod the slow tank, Bipped the boxer, Fizz the potion thrower, Teep the steady caster, Lern the quick caster */
  Plod:[["Trunk Swat",1,"Close",25,88,8,0,8,10,0.3,{cat:"Basic"}],["Stomp",3,"Mid",32,80,5,0,6,14,0.5,{slow:2,dash:"in",cat:"Hit"}],["Trunk Slam",5,"Close",66,70,12,0,25,30,0.8,{status:["Daze",25],cat:"Special"}],
    ["Head Bump",6,"Near",28,84,5,0,10,14,0.4,{dash:"in",cat:"Basic",from:"Trunk Swat"}],["Trunk Toss",8,"Close",15,80,0,0,0,12,0.35,{swap:1}],["Double Stomp",10,"Mid",17,80,5,0,4,17,0.5,{hits:2,cat:"Hit",from:"Stomp"}],
    ["Stone Fling",12,"Far",26,86,5,0,4,17,0.5,{cat:"Hit"}],["Trumpet",14,"Mid",18,85,0,15,30,20,0.5,{cast:1,cat:"Withering",err:"Static Plains"}],["Water Spray",18,"Near",20,80,0,10,0,18,0.5,{status:["Soak",35],cat:"Withering",err:"Coral Shallows",share:["trunk"]}],
    ["Thick Hide",20,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Tusk Thrust",22,"Close",36,74,28,0,0,22,0.7,{cat:"Sharp",err:"Saffron Dojo",share:["horn"]}],["Frost Tusk",24,"Near",36,74,26,0,0,22,0.7,{cat:"Sharp",err:"Glacier Rim"}],
    ["Pillar Press",26,"Close",52,68,6,0,12,28,0.9,{cat:"Heavy",err:"Granite Steps"}],["Quake Stomp",30,"Mid",58,70,8,0,15,32,0.9,{cat:"Heavy",err:"Granite Steps",after:"Double Stomp"}],["Trunk Flurry",34,"Near",17,80,5,0,0,38,1.0,{hits:4,cat:"Special",err:"Saffron Dojo",need:"pow"}],
    ["Mammoth Charge",40,"Far",80,65,10,0,30,40,1.1,{dash:"in",cat:"Special",err:"Saffron Dojo",after:"Head Bump"}]],
  Bipped:[["Jab",1,"Close",22,92,10,0,4,8,0.2,{cat:"Basic"}],["Dash Punch",3,"Near",30,80,8,0,6,14,0.4,{dash:"in",cat:"Hit"}],["One-Two",5,"Close",28,85,10,0,6,22,0.4,{hits:2,cat:"Special"}],
    ["Cross",6,"Close",28,88,8,0,6,12,0.35,{cat:"Basic",from:"Jab"}],["Hip Toss",8,"Close",15,80,0,0,0,12,0.3,{swap:1}],["Hook",10,"Near",32,80,8,0,8,15,0.45,{cat:"Hit",from:"Dash Punch"}],
    ["Uppercut",14,"Close",48,75,15,0,15,24,0.6,{cat:"Heavy",err:"Saffron Dojo"}],["Liver Shot",16,"Close",24,80,0,12,0,18,0.45,{cat:"Withering",err:"Hollow Moor",share:["arms"]}],["Karate Chop",18,"Near",38,76,28,0,0,22,0.7,{cat:"Sharp",err:"Saffron Dojo",share:["arms"]}],
    ["Guard Up",20,"Any",0,100,0,0,0,16,0.1,{buff:"riposte"}],["Round Kick",22,"Near",36,74,26,0,0,22,0.7,{cat:"Sharp",err:"Static Plains",share:["legs"]}],["Knee Strike",24,"Near",54,68,8,0,10,28,0.8,{cat:"Heavy",err:"Granite Steps"}],
    ["Trash Talk",26,"Far",18,82,0,10,0,18,0.5,{cast:1,status:["Dread",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Flying Kick",28,"Mid",38,74,28,0,6,24,0.7,{dash:"in",cat:"Sharp",err:"Static Plains"}],["Haymaker",30,"Close",78,65,15,0,20,36,0.9,{cat:"Special",err:"Saffron Dojo",need:"pow",after:"Hook"}],
    ["Overhead Smash",34,"Mid",58,66,8,0,12,32,0.9,{dash:"in",cat:"Heavy",err:"Iron Foundry"}],["Flurry Punch",40,"Close",14,85,10,0,0,38,0.6,{hits:5,cat:"Special",err:"Static Plains",after:"Cross"}]],
  Fizz:[["Bubble",1,"Mid",28,90,5,0,0,10,0.3,{cast:1,cat:"Basic"}],["Cork Pop",3,"Close",22,85,5,0,30,12,0.3,{cast:1,cat:"Basic"}],["Potion Toss",5,"Mid",40,85,5,0,0,22,0.6,{cast:1,status:["Poison",45],cat:"Special"}],
    ["Flask Bump",6,"Near",26,86,5,0,8,12,0.35,{dash:"in",cat:"Basic"}],["Cork Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1}],["Bubble Stream",10,"Near",28,88,5,0,4,15,0.4,{cast:1,cat:"Hit",from:"Bubble"}],
    ["Cork Shot",12,"Far",24,90,5,0,0,17,0.4,{cast:1,cat:"Hit",from:"Cork Pop"}],["Brew Up",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.18}],["Beaker Splash",20,"Near",44,80,8,0,0,22,0.5,{cast:1,status:["Crack",25],cat:"Heavy",err:"Coral Shallows"}],
    ["Glass Shard",22,"Far",34,76,26,0,0,22,0.7,{cat:"Sharp",err:"Cinder Peak",share:["arms"]}],["Flask Roll",24,"Near",52,68,8,0,14,28,0.9,{dash:"in",cat:"Heavy",err:"Iron Foundry",share:["round"]}],["Acid Dart",26,"Far",34,78,25,0,0,20,0.6,{cat:"Sharp",err:"Nightshade Marsh",status:["Poison",20]}],
    ["Sleep Mist",28,"Far",20,78,0,12,0,20,0.6,{cast:1,status:["Daze",30],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Boil Over",30,"Mid",66,75,8,0,10,32,0.8,{cast:1,status:["Burn",25],cat:"Special",err:"Cinder Peak",after:"Bubble Stream"}],["Explosive Brew",40,"Far",94,65,10,0,20,40,1.2,{cast:1,cat:"Special",err:"Iron Foundry",after:"Cork Shot"}]],
  Teep:[["Splash",1,"Near",26,90,5,0,4,10,0.3,{cast:1,cat:"Basic"}],["Lid Bonk",3,"Close",28,85,8,0,8,12,0.3,{cat:"Basic"}],["Steam Jet",5,"Far",50,80,8,0,0,24,0.7,{cast:1,status:["Blind",30],cat:"Special"}],
    ["Hot Pour",6,"Mid",28,86,5,0,0,16,0.4,{cast:1,cat:"Hit",from:"Splash"}],["Spin Pour",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cast:1,cat:"Basic"}],["Lid Slam",10,"Close",32,84,5,0,8,15,0.45,{cat:"Hit",from:"Lid Bonk"}],
    ["Tea Time",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Scald",20,"Mid",46,80,8,0,6,24,0.6,{cast:1,status:["Burn",25],cat:"Heavy",err:"Cinder Peak",after:"Hot Pour",need:"mnd"}],["Spout Stab",22,"Near",38,76,27,0,0,22,0.7,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],
    ["Pot Drop",24,"Close",54,68,5,0,22,30,0.9,{cat:"Heavy",err:"Granite Steps",after:"Lid Slam",need:"pow",share:["round"]}],["Iced Tea",26,"Near",50,70,5,0,8,28,0.8,{cast:1,status:["Freeze",20],cat:"Heavy",err:"Glacier Rim",need:"mnd"}],["Lid Toss",28,"Far",34,72,26,0,0,24,0.8,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],
    ["Whistle",30,"Far",22,85,0,25,0,24,0.5,{cast:1,status:["Daze",35],cat:"Withering",err:"Dream Garden",need:"mnd",share:["mouth"]}],["Tea Party",34,"Near",18,78,6,0,0,38,1.0,{cast:1,hits:4,cat:"Special",err:"Dream Garden",need:"mnd"}],["Boiling Point",40,"Mid",92,65,12,0,15,40,1.2,{cast:1,cat:"Special",err:"Cinder Peak",need:"mnd"}]],
  Lern:[["Ember",1,"Far",32,88,5,0,0,10,0.3,{cast:1,cat:"Basic"}],["Tiny Kick",2,"Close",24,90,5,0,4,9,0.3,{cat:"Basic"}],["Float Back",3,"Close",14,90,5,0,0,10,0.2,{step:-28,cast:1,cat:"Basic"}],
    ["Flash",5,"Mid",34,95,5,8,0,20,0.4,{cast:1,status:["Blind",50],cat:"Special"}],["Glow",7,"Far",26,92,5,0,0,15,0.4,{cast:1,cat:"Hit"}],["Lantern Swing",8,"Close",16,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Candle Flame",9,"Mid",30,85,5,0,0,16,0.45,{cast:1,cat:"Hit",from:"Ember"}],["Hop Kick",11,"Near",30,82,8,0,6,14,0.4,{dash:"in",cat:"Basic",from:"Tiny Kick"}],["Paper Fold",14,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],
    ["Soft Light",16,"Any",0,100,0,0,0,28,0.5,{support:1,heal:0.25}],["Lantern Fire",18,"Mid",46,70,6,0,6,26,0.8,{cast:1,status:["Burn",25],cat:"Heavy",err:"Cinder Peak",after:"Candle Flame",need:"mnd"}],["Spark Shower",20,"Mid",16,80,5,0,0,24,0.6,{cast:1,hits:3,cat:"Hit",err:"Static Plains",need:"mnd"}],
    ["Stomp Down",22,"Close",52,70,6,0,16,28,0.8,{cat:"Heavy",err:"Saffron Dojo",after:"Hop Kick",need:"pow",share:["legs"]}],["Light Ray",24,"Far",34,76,26,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Dawn Temple",after:"Glow",need:"mnd"}],["Dim Light",26,"Mid",22,84,0,12,0,18,0.5,{cast:1,status:["Dread",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],
    ["Spark Needle",28,"Mid",38,76,28,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Static Plains",need:"mnd"}],["Firecracker",30,"Near",66,74,8,0,10,36,0.9,{cat:"Special",err:"Cinder Peak",after:"Spark Shower",need:"pow",share:["arms"]}],["Beacon",30,"Far",68,75,10,8,0,32,0.9,{cast:1,cat:"Special",err:"Dawn Temple",need:"mnd"}],
    ["Bright Ray",34,"Far",38,74,28,0,0,28,0.8,{cast:1,cat:"Sharp",err:"Dawn Temple",after:"Light Ray",need:"mnd"}],["Fireworks",36,"Near",16,78,8,0,0,40,1.1,{cast:1,hits:5,cat:"Special",err:"Cinder Peak",after:"Firecracker",need:"mnd"}],["Sky Lantern",40,"Far",94,65,12,0,0,40,1.3,{cast:1,cat:"Special",err:"Cinder Peak",after:"Lantern Fire",need:"mnd"}]],
  /* the twelve families added 15 Nov 2026 */
  Puff:[["Spore Puff",1,"Mid",26,90,5,0,0,10,0.3,{cast:1,cat:"Basic"}],["Cap Bonk",3,"Close",24,85,8,0,8,12,0.3,{cat:"Basic"}],["Drowsy Spores",5,"Mid",22,85,0,0,0,22,0.6,{cast:1,status:["Daze",45],cat:"Special"}],
    ["Root Jab",6,"Close",28,92,8,0,4,13,0.35,{cat:"Hit",from:"Cap Bonk"}],["Spore Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cast:1,cat:"Basic"}],["Spore Shot",10,"Far",24,90,5,0,0,16,0.4,{cast:1,cat:"Hit",from:"Spore Puff"}],
    ["Mycelium",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.18}],["Toxic Cloud",20,"Mid",36,80,5,0,0,24,0.6,{cast:1,status:["Poison",40],cat:"Hit",err:"Nightshade Marsh",need:"mnd"}],["Cap Smash",24,"Close",52,68,5,0,20,28,0.85,{cat:"Heavy",err:"Granite Steps",after:"Root Jab",need:"pow",share:["round"]}],
    ["Spore Needle",28,"Far",32,74,26,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Tanglewood",after:"Spore Shot",need:"mnd"}],["Fairy Ring",30,"Near",22,85,5,10,0,28,0.6,{cast:1,hits:3,cat:"Withering",err:"Dream Garden",need:"mnd",share:["legs"]}],["Bloom Burst",40,"Far",90,65,10,0,15,40,1.2,{cast:1,cat:"Special",err:"Tanglewood",need:"mnd"}]],
  Flit:[["Wing Clip",1,"Close",22,92,10,0,4,8,0.2,{cat:"Basic"}],["Dive Bite",3,"Near",28,85,8,0,6,12,0.35,{dash:"in",cat:"Basic"}],["Sonar",5,"Mid",30,90,5,10,0,20,0.5,{cast:1,status:["Daze",30],cat:"Special"}],
    ["Loop Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Wing Whack",9,"Near",28,88,8,0,6,14,0.4,{cat:"Hit",from:"Wing Clip"}],["Fang Flurry",14,"Close",14,85,10,0,0,24,0.5,{hits:3,cat:"Hit",from:"Dive Bite"}],
    ["Wing Cut",18,"Near",36,76,27,0,0,22,0.7,{cat:"Sharp",err:"Static Plains",need:"pow",share:["wings"]}],["Fang Pierce",20,"Close",38,76,28,0,0,22,0.7,{cat:"Sharp",err:"Hollow Moor",after:"Fang Flurry",need:"pow",share:["fangs"]}],["Night Veil",20,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],
    ["Night Cut",22,"Near",36,76,26,0,0,22,0.7,{dash:"in",cat:"Sharp",err:"Hollow Moor",need:"pow"}],["Dive Press",24,"Near",56,66,6,0,18,30,0.9,{dash:"in",cat:"Heavy",err:"Saffron Dojo",after:"Dive Bite",need:"pow",share:["wings"]}],["Bat Song",26,"Far",20,86,0,12,0,22,0.5,{cast:1,status:["Daze",30],cat:"Withering",err:"Dream Garden",need:"mnd"}],
    ["Gust Cut",27,"Mid",34,74,27,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Static Plains",after:"Wing Cut",need:"mnd"}],["Dread Cry",28,"Far",20,80,0,12,0,24,0.6,{cast:1,status:["Dread",30],cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Leech Bite",30,"Close",50,80,10,0,6,30,0.7,{drain:0.4,cat:"Heavy",err:"Hollow Moor",need:"pow",share:["fangs"]}],
    ["Wing Storm",34,"Near",14,80,8,0,0,38,1.0,{hits:6,cat:"Special",err:"Static Plains",after:"Wing Whack",need:"pow"}],["Echo Burst",36,"Mid",66,76,8,0,10,38,0.9,{cast:1,cat:"Special",err:"Dream Garden",need:"mnd"}],["Screech",40,"Far",70,75,8,15,20,38,1.0,{cast:1,cat:"Special",err:"Static Plains",need:"mnd"}]],
  Glop:[["Glob",1,"Near",26,88,5,0,6,10,0.3,{cast:1,cat:"Basic"}],["Slime Slap",3,"Close",30,85,8,0,10,12,0.3,{cat:"Basic"}],["Engulf",5,"Close",40,80,5,0,0,24,0.6,{hold:1.5,cat:"Special"}],
    ["Ooze Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Goo Shot",10,"Mid",26,90,5,0,0,16,0.4,{cast:1,cat:"Hit",from:"Glob"}],["Goo Press",12,"Close",32,82,5,0,8,16,0.45,{cat:"Hit",from:"Slime Slap"}],
    ["Reform",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Sticky Trap",20,"Mid",20,85,0,0,0,20,0.5,{cast:1,slow:3,cat:"Basic"}],["Goo Block",22,"Close",54,68,5,0,18,30,0.85,{cat:"Heavy",err:"Granite Steps",after:"Goo Press",need:"pow"}],
    ["Goo Spike",24,"Near",38,76,27,0,0,22,0.7,{cat:"Sharp",err:"Granite Steps",need:"pow"}],["Water Jet",26,"Mid",36,76,26,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Coral Shallows",need:"mnd"}],["Dissolve",28,"Close",24,80,0,12,0,20,0.5,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],
    ["Cold Goo",29,"Mid",22,82,0,10,0,20,0.5,{cast:1,status:["Freeze",20],cat:"Withering",err:"Glacier Rim",need:"mnd"}],["Body Splash",30,"Mid",60,75,8,0,20,32,0.9,{dash:"in",cat:"Heavy",err:"Coral Shallows",need:"pow",share:["round"]}],["Gunk Cannon",32,"Far",44,66,8,0,12,30,0.9,{cast:1,cat:"Heavy",err:"Iron Foundry",after:"Goo Shot",need:"mnd"}],
    ["Acid Beam",34,"Far",34,72,26,0,0,26,0.8,{cast:1,status:["Poison",20],cat:"Sharp",err:"Nightshade Marsh",need:"mnd"}],["Goo Spin",35,"Near",22,72,8,0,0,38,0.9,{hits:3,dash:"in",cat:"Special",err:"Coral Shallows",need:"pow"}],["Absorb",36,"Close",60,78,8,0,0,38,0.9,{drain:0.4,cat:"Special",err:"Nightshade Marsh",after:"Engulf",need:"pow",share:["mouth"]}],
    ["Goo Barrage",38,"Far",14,80,5,0,0,40,1.0,{cast:1,hits:6,cat:"Special",err:"Iron Foundry",need:"mnd"}],["Acid Flood",40,"Near",84,70,10,0,15,40,1.1,{cast:1,status:["Poison",30],cat:"Special",err:"Nightshade Marsh",need:"mnd"}]],
  Tock:[["Tick",1,"Close",22,92,8,0,4,8,0.2,{cat:"Basic"}],["Coil Hop",2,"Near",24,88,6,0,6,12,0.3,{dash:"in",cat:"Basic",from:"Tick"}],["Alarm Ring",3,"Mid",26,88,5,10,0,14,0.4,{cast:1,status:["Daze",20],cat:"Hit"}],
    ["Second Hand",5,"Near",14,90,8,0,0,22,0.4,{hits:4,cat:"Special"}],["Clock Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Chime",10,"Mid",30,90,5,3,0,16,0.4,{cast:1,cat:"Hit",from:"Alarm Ring"}],
    ["Rewind",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.18}],["Pendulum",20,"Near",44,85,8,0,15,24,0.6,{cat:"Heavy",err:"Iron Foundry",need:"pow"}],["Hour Hand",24,"Close",36,78,28,0,0,22,0.6,{cat:"Sharp",err:"Dawn Temple",need:"pow",after:"Coil Hop"}],
    ["Minute Hand",28,"Near",38,76,26,0,0,24,0.7,{cat:"Sharp",err:"Static Plains",need:"pow"}],["Time Stop",30,"Mid",10,75,0,0,0,30,0.7,{cast:1,hold:2,cat:"Hit",err:"Dream Garden",need:"mnd"}],["Bell Toss",32,"Far",44,66,5,0,12,30,0.9,{cat:"Heavy",err:"Iron Foundry",need:"pow",share:["arms"]}],
    ["Midnight",40,"Far",88,70,12,10,10,40,1.2,{cast:1,cat:"Special",err:"Hollow Moor",need:"mnd",after:"Chime"}]],
  Mitt:[["Mitt Jab",1,"Close",24,90,10,0,8,9,0.25,{cat:"Basic"}],["Step In",3,"Near",28,82,8,0,8,14,0.4,{dash:"in",cat:"Basic"}],["Big Swing",5,"Close",68,68,15,0,22,30,0.85,{status:["Daze",25],cat:"Special"}],
    ["Double Jab",6,"Close",15,90,8,0,4,14,0.3,{hits:2,cat:"Hit",from:"Mitt Jab"}],["Clinch Swap",8,"Close",15,80,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Spring Punch",10,"Mid",30,88,8,0,8,16,0.4,{cat:"Hit",from:"Step In"}],
    ["Cover Up",14,"Any",0,100,0,0,0,16,0.1,{buff:"riposte"}],["Body Blow",20,"Close",44,80,10,10,10,24,0.5,{cat:"Withering",err:"Saffron Dojo",need:"pow",share:["arms"]}],["Corkscrew",24,"Mid",36,76,28,0,6,22,0.7,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow"}],
    ["Rocket Glove",28,"Far",48,66,5,0,18,30,0.9,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Spring Punch"}],["Knockout",30,"Close",86,62,25,0,30,38,1.0,{cat:"Special",err:"Saffron Dojo",need:"pow",after:"Double Jab"}],["Combo Rush",40,"Close",16,85,10,0,4,38,0.6,{hits:5,cat:"Special",err:"Static Plains",need:"pow",share:["arms"]}]],
  Brolly:[["Poke",1,"Near",26,90,8,0,8,10,0.3,{cat:"Basic"}],["Drip Flick",2,"Mid",24,90,5,0,0,12,0.3,{cast:1,cat:"Basic"}],["Spin Open",3,"Close",22,85,5,0,25,12,0.3,{cat:"Basic"}],
    ["Leg Hop",4,"Close",28,86,6,0,10,15,0.4,{cat:"Hit"}],["Rain Shot",5,"Mid",20,85,5,0,0,22,0.6,{cast:1,hits:2,status:["Soak",35],cat:"Special"}],["Twirl",6,"Close",16,88,5,0,6,16,0.4,{hits:2,cat:"Hit",from:"Spin Open"}],
    ["Hook Swap",8,"Close",15,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Tip Flurry",9,"Near",10,90,8,0,0,14,0.4,{hits:3,cat:"Basic",from:"Poke"}],["Rain Gust",10,"Far",26,90,5,0,6,16,0.4,{cast:1,cat:"Hit",from:"Drip Flick"}],
    ["Canopy",14,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],["Drizzle",16,"Mid",20,82,0,10,0,18,0.5,{cast:1,status:["Soak",35],cat:"Withering",err:"Coral Shallows",need:"mnd"}],["Handle Bash",18,"Close",52,70,5,0,15,28,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow"}],
    ["Hook Pull",20,"Mid",22,85,0,0,-25,20,0.5,{cat:"Hit"}],["Spoke Stab",22,"Near",38,76,28,0,0,22,0.7,{cat:"Sharp",err:"Iron Foundry",need:"pow",after:"Tip Flurry"}],["Spin Crash",24,"Mid",54,68,5,0,18,30,0.9,{dash:"in",cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Twirl",share:["round"]}],
    ["Tip Dive",26,"Near",36,74,26,0,0,24,0.8,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow"}],["Snap Shut",28,"Near",24,78,0,12,0,22,0.5,{hold:1.5,cat:"Withering",err:"Coral Shallows",need:"pow"}],["Thunder Clap",30,"Near",58,75,8,0,15,32,0.8,{cast:1,status:["Shock",25],cat:"Heavy",err:"Static Plains",need:"mnd"}],
    ["Frost Spin",32,"Near",18,74,5,0,0,36,1.0,{hits:4,status:["Freeze",25],cat:"Special",err:"Glacier Rim"}],["Hail Volley",34,"Far",16,68,5,0,0,32,1.0,{cast:1,hits:3,cat:"Heavy",err:"Glacier Rim",need:"mnd"}],["Rainbow",36,"Mid",70,80,5,0,0,38,1.0,{cast:1,cat:"Special",err:"Dawn Temple",need:"mnd"}],
    ["Lightning Rod",38,"Mid",80,72,8,0,10,40,1.1,{cast:1,status:["Shock",30],cat:"Special",err:"Static Plains",need:"mnd"}],["Downpour",40,"Far",22,80,5,0,0,40,0.9,{cast:1,hits:4,cat:"Special",err:"Coral Shallows"}],["Twister",40,"Far",60,68,5,0,20,42,1.2,{cast:1,cat:"Special",err:"Static Plains",need:"mnd",after:"Rain Gust"}]],
  Spine:[["Prick",1,"Close",24,90,10,0,4,9,0.25,{cat:"Basic"}],["Needle Shot",3,"Mid",26,88,8,0,0,14,0.4,{cast:1,cat:"Hit"}],["Cactus Punch",5,"Close",60,72,12,0,18,28,0.8,{cat:"Special"}],
    ["Double Prick",6,"Close",14,90,8,0,2,13,0.3,{hits:2,cat:"Basic",from:"Prick"}],["Pot Swap",8,"Close",14,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Thorn Wall",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],
    ["Needle Spray",20,"Near",14,85,8,0,0,24,0.5,{hits:3,cat:"Hit",from:"Needle Shot"}],["Bitter Sap",24,"Mid",22,80,0,10,0,18,0.5,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],["Needle Burst",26,"Far",34,74,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Tanglewood",need:"mnd",after:"Needle Spray"}],
    ["Desert Bloom",30,"Any",0,100,0,0,0,26,0.5,{support:1,heal:0.25}],["Thorn Smash",30,"Near",52,68,8,0,15,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Double Prick"}],["Saguaro Slam",40,"Close",88,68,15,0,25,40,1.0,{cat:"Special",err:"Saffron Dojo",need:"pow"}]],
  Burr:[["Scratch",1,"Close",24,90,10,0,4,9,0.25,{cat:"Basic"}],["Snout Bump",2,"Near",24,88,5,0,6,11,0.3,{dash:"in",cat:"Basic"}],["Dig Under",3,"Mid",30,82,8,0,0,14,0.45,{dash:"in",cat:"Hit"}],
    ["Claw Swipe",5,"Close",58,75,15,0,10,28,0.7,{status:["Crack",25],cat:"Special"}],["Double Scratch",7,"Close",15,90,10,0,3,16,0.35,{hits:2,cat:"Hit",from:"Scratch"}],["Tunnel Swap",8,"Close",15,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Dirt Kick",11,"Near",28,86,5,0,6,15,0.4,{cat:"Hit",from:"Dig Under"}],["Mud Fling",14,"Mid",28,85,5,0,0,20,0.5,{status:["Blind",35],cat:"Hit"}],["Mud Spit",18,"Mid",22,82,0,10,0,18,0.5,{status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"pow"}],
    ["Burrow",20,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Boulder Shove",22,"Close",52,68,5,0,22,28,0.85,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["claws"]}],["Tunnel Slash",24,"Mid",36,76,27,0,0,22,0.7,{dash:"in",cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Double Scratch",share:["claws"]}],
    ["Burst Up",26,"Mid",50,68,6,0,15,30,0.9,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Dirt Kick"}],["Drill Claw",30,"Close",20,80,10,0,0,30,0.6,{hits:3,cat:"Special",err:"Iron Foundry",need:"pow",share:["claws"]}],["Cave In",40,"Mid",86,70,10,0,20,40,1.1,{dash:"in",cat:"Special",err:"Granite Steps"}]],
  /* batch 3, 16 Nov 2026: the commons from dark photos */
  Wick:[["Hot Wax",1,"Near",26,88,5,0,6,10,0.3,{cast:1,cat:"Basic"}],["Wick Whip",3,"Close",26,88,8,0,8,12,0.3,{cat:"Basic"}],["Melt Down",5,"Mid",30,85,5,0,0,22,0.6,{cast:1,status:["Burn",35],cat:"Special"}],
    ["Wax Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Wax Slap",10,"Close",30,86,5,0,8,15,0.4,{cat:"Hit",from:"Wick Whip"}],["Flame Wall",12,"Close",28,88,5,0,6,16,0.4,{cast:1,cat:"Hit",status:["Burn",15],from:"Hot Wax"}],
    ["Relight",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Candle Burst",20,"Near",16,85,8,0,0,24,0.5,{cast:1,hits:3,cat:"Hit",from:"Hot Wax"}],["Candle Slam",22,"Near",52,70,5,0,15,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Wax Slap",share:["arms"]}],
    ["Wax Drip",23,"Mid",20,82,0,10,0,18,0.5,{cast:1,cat:"Withering",err:"Cinder Peak",need:"mnd",slow:2}],["Spark Flick",24,"Mid",36,76,26,0,0,22,0.65,{cast:1,cat:"Sharp",err:"Iron Foundry",need:"mnd"}],["Soot Cloud",25,"Mid",20,82,0,10,0,18,0.5,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd",status:["Blind",30]}],
    ["Smoke Whirl",26,"Near",50,68,5,0,12,28,0.8,{cast:1,cat:"Heavy",err:"Hollow Moor",need:"mnd"}],["Sticky Fire",27,"Close",66,72,5,0,6,36,0.9,{cat:"Special",err:"Cinder Peak",need:"pow",after:"Flame Wall",share:["arms"],status:["Burn",40]}],["Wax Flood",28,"Mid",48,68,5,0,10,30,0.85,{cast:1,cat:"Heavy",err:"Cinder Peak",need:"mnd"}],
    ["Candle Ray",29,"Far",34,76,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd"}],["Blowtorch",30,"Mid",58,75,10,0,10,32,0.8,{cast:1,status:["Burn",20],cat:"Heavy",err:"Iron Foundry",need:"mnd"}],["Soot Choke",33,"Far",60,66,5,15,0,36,1.0,{cast:1,cat:"Special",err:"Hollow Moor",need:"mnd"}],
    ["Ghost Flame",35,"Mid",70,70,5,0,0,38,1.0,{cast:1,cat:"Special",err:"Hollow Moor",need:"mnd",status:["Dread",25]}],["Fire Pillar",36,"Far",62,66,8,0,10,38,1.0,{cast:1,cat:"Special",err:"Cinder Peak",need:"mnd",status:["Burn",35]}],["Flash Fire",38,"Near",18,82,8,0,0,38,1.0,{cast:1,hits:4,cat:"Special",err:"Dawn Temple",need:"mnd",after:"Candle Burst",status:["Blind",20]}],
    ["Bonfire",40,"Far",90,68,12,0,15,40,1.2,{cast:1,cat:"Special",err:"Cinder Peak",need:"mnd"}]],
  Lumo:[["Glow Bump",1,"Close",22,92,8,0,6,8,0.2,{cat:"Basic"}],["Light Dart",3,"Mid",26,90,8,0,0,12,0.35,{cast:1,cat:"Basic"}],["Lantern Flash",5,"Mid",22,88,0,10,0,22,0.6,{cast:1,status:["Blind",40],cat:"Special"}],
    ["Wing Flick",6,"Close",24,90,6,0,6,10,0.3,{cat:"Basic",from:"Glow Bump"}],["Blink Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Flash Bolt",10,"Mid",30,88,5,0,0,16,0.4,{cast:1,cat:"Hit",from:"Light Dart"}],
    ["Firefly Swarm",14,"Near",13,88,8,0,0,24,0.5,{cast:1,hits:4,cat:"Hit",from:"Light Dart"}],["Afterglow",20,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Zip Dive",21,"Close",52,70,5,0,15,28,0.8,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",after:"Wing Flick",share:["wings"]}],
    ["Sleepy Glow",22,"Mid",20,82,0,10,0,18,0.5,{cast:1,cat:"Withering",err:"Dream Garden",need:"mnd",status:["Daze",25]}],["Thin Beam",23,"Far",34,78,28,0,0,20,0.6,{cast:1,cat:"Sharp",err:"Static Plains",need:"mnd"}],["Glow Wing",24,"Near",36,78,26,0,0,20,0.65,{cat:"Sharp",err:"Tanglewood",need:"pow",share:["wings"]}],
    ["Fade Out",25,"Mid",22,80,0,12,0,20,0.5,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd",status:["Blind",25]}],["Light Bomb",26,"Mid",50,68,5,0,10,28,0.8,{cast:1,cat:"Heavy",err:"Static Plains",need:"mnd"}],["Sweet Glow",27,"Mid",60,72,5,0,0,38,1.0,{cast:1,selfHeal:0.2,cat:"Special",err:"Dream Garden",need:"mnd"}],
    ["Life Sap",28,"Mid",60,72,5,8,0,38,1.0,{cast:1,drain:0.3,cat:"Special",err:"Hollow Moor",need:"mnd"}],["Lamp Beam",30,"Far",58,80,8,0,0,32,0.8,{cast:1,cat:"Heavy",err:"Dawn Temple",need:"mnd"}],["Light Line",31,"Far",36,76,30,0,0,26,0.75,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd",after:"Flash Bolt"}],
    ["Firefly Storm",33,"Near",14,80,8,0,0,38,1.0,{cast:1,hits:5,cat:"Special",err:"Tanglewood",need:"mnd"}],["Last Flash",36,"Near",68,66,5,15,0,40,1.1,{cast:1,cat:"Special",err:"Hollow Moor",need:"mnd"}],["Swarm Light",40,"Far",90,68,12,10,10,40,1.2,{cast:1,cat:"Special",err:"Dawn Temple",need:"mnd",after:"Firefly Swarm"}]],
  Snooze:[["Pillow Bop",1,"Close",26,88,6,0,10,10,0.3,{cat:"Basic"}],["Yawn",3,"Mid",10,90,0,10,0,12,0.4,{cast:1,status:["Daze",35],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Sleepy Slam",5,"Close",54,75,8,0,20,26,0.8,{status:["Daze",25],cat:"Special"}],
    ["Fluff Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Double Bop",10,"Close",16,86,6,0,4,16,0.4,{hits:2,cat:"Hit",from:"Pillow Bop"}],["Dream Puff",12,"Far",22,90,5,0,0,17,0.4,{cast:1,cat:"Hit"}],
    ["Nap Time",14,"Any",0,100,0,0,0,24,0.5,{support:1,heal:0.25}],["Flop Down",18,"Mid",50,68,5,0,18,28,0.9,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",after:"Pillow Bop",share:["round"]}],["Feather Burst",20,"Near",15,85,5,0,0,24,0.5,{cast:1,hits:3,cat:"Hit",from:"Dream Puff"}],
    ["Lullaby",26,"Far",28,72,0,10,0,26,0.8,{cast:1,status:["Daze",30],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Bad Dream",28,"Near",38,76,27,0,6,22,0.7,{cast:1,cat:"Sharp",err:"Hollow Moor",need:"mnd"}],["Dream Drift",30,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],
    ["Dream Drain",32,"Mid",20,80,0,10,0,20,0.5,{cast:1,drain:0.5,cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Bop Barrage",34,"Close",16,84,8,0,0,38,1.0,{hits:5,cat:"Special",err:"Granite Steps",need:"pow",after:"Double Bop",share:["round"]}],["Fluff Storm",38,"Mid",16,78,6,0,0,38,1.0,{cast:1,hits:5,cat:"Special",err:"Dawn Temple",after:"Feather Burst"}],
    ["Big Snore",40,"Far",86,70,10,10,20,40,1.2,{cast:1,cat:"Special",err:"Dream Garden"}]],
  Inky:[["Ink Flick",1,"Mid",26,90,5,0,0,10,0.3,{cast:1,cat:"Basic"}],["Splotch",3,"Close",26,88,8,0,8,12,0.3,{cat:"Basic"}],["Ink Blot",5,"Mid",26,88,5,0,0,22,0.6,{cast:1,status:["Blind",40],cat:"Special"}],
    ["Smear Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Redraw",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Scribble",20,"Close",14,85,8,0,0,26,0.5,{hits:4,cat:"Hit",from:"Splotch"}],
    ["Pen Stab",30,"Near",58,78,15,0,10,30,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Scribble"}],["Ink Flood",40,"Far",86,70,10,0,15,40,1.2,{cast:1,status:["Blind",20],cat:"Special",err:"Hollow Moor",after:"Ink Flick"}]],
  Cobble:[["Rock Bump",1,"Close",26,88,8,0,10,10,0.3,{cat:"Basic"}],["Stone Punch",2,"Near",26,88,6,0,8,11,0.3,{cat:"Basic"}],["Skip Stone",3,"Mid",26,88,5,0,6,12,0.4,{cat:"Basic"}],
    ["Rubble Roll",5,"Mid",56,75,10,0,20,26,0.8,{dash:"in",cat:"Special"}],["Stack Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Stone Slap",10,"Close",30,86,5,0,10,15,0.4,{cat:"Hit",from:"Rock Bump"}],
    ["Hunker",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Boulder Toss",16,"Mid",26,82,5,0,8,16,0.5,{cat:"Hit",from:"Skip Stone"}],["Big Stomp",18,"Close",52,68,5,0,14,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["legs"]}],
    ["Hot Gravel",18,"Close",20,80,0,8,0,16,0.4,{status:["Burn",30],cat:"Withering",err:"Cinder Peak"}],["Gravel Spray",20,"Near",15,85,8,0,0,24,0.5,{hits:3,cat:"Hit"}],["Double Smash",22,"Near",26,70,6,0,16,30,0.9,{hits:2,cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Stone Slap",share:["arms"]}],
    ["Moss Smear",22,"Near",22,80,0,10,0,18,0.5,{cat:"Withering",err:"Tanglewood"}],["Ground Shake",24,"Far",14,78,0,12,0,22,0.6,{cat:"Withering",err:"Granite Steps",share:["legs"]}],["Rumble Charge",24,"Mid",28,80,5,0,12,17,0.5,{dash:"in",cat:"Hit"}],
    ["Pile Drop",26,"Mid",46,66,5,0,18,30,1.0,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow"}],["Edge Chop",28,"Near",38,76,27,0,6,22,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow"}],["Crystal Shard",30,"Far",56,78,15,0,0,32,0.9,{cast:1,cat:"Special",err:"Dawn Temple"}],
    ["Crystal Dart",32,"Far",30,72,26,0,0,24,0.8,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd"}],["Boulder Barrage",34,"Far",15,70,6,0,0,40,1.1,{hits:4,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Boulder Toss",share:["arms"]}],["Gravel Storm",36,"Mid",14,74,8,0,0,38,1.0,{hits:5,cat:"Special",err:"Granite Steps",after:"Gravel Spray"}],
    ["Geode Crash",40,"Close",90,66,15,0,28,40,1.1,{cat:"Special",err:"Granite Steps"}]],
  Nimbo:[["Drip",1,"Mid",24,90,5,0,0,10,0.3,{cast:1,cat:"Basic"}],["Mist",2,"Near",24,88,5,0,6,11,0.3,{cast:1,cat:"Basic"}],["Puff Push",3,"Close",22,88,5,0,18,12,0.3,{cat:"Basic"}],
    ["Downdraft",5,"Mid",30,85,5,0,10,22,0.6,{cast:1,status:["Soak",45],cat:"Special"}],["Fog Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Light Shower",10,"Mid",26,88,5,0,0,16,0.4,{cast:1,cat:"Hit",from:"Drip"}],
    ["Fog Roll",12,"Near",30,84,5,0,8,15,0.4,{dash:"in",cat:"Hit",from:"Mist"}],["Silver Lining",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Water Splat",16,"Close",20,82,0,8,0,16,0.4,{cast:1,cat:"Withering",err:"Coral Shallows"}],
    ["Storm Slam",18,"Close",50,68,5,0,22,28,0.8,{cat:"Heavy",err:"Static Plains",need:"pow",after:"Puff Push",share:["round"]}],["Hailstones",20,"Mid",15,85,8,0,0,24,0.5,{cast:1,hits:3,cat:"Hit",from:"Light Shower"}],["Wet Fog",22,"Near",18,84,0,10,0,16,0.5,{cast:1,status:["Soak",30],cat:"Withering",err:"Coral Shallows",need:"mnd",after:"Fog Roll"}],
    ["Icicle Drop",24,"Mid",36,76,26,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Glacier Rim",need:"mnd"}],["Hail Storm",26,"Far",30,70,27,0,0,26,0.8,{cast:1,cat:"Sharp",err:"Glacier Rim",need:"mnd",after:"Hailstones"}],["Wind Cut",28,"Near",38,78,27,0,6,22,0.6,{cast:1,cat:"Sharp",err:"Static Plains",need:"mnd"}],
    ["Thunderclap",30,"Near",58,75,8,0,15,32,0.8,{cast:1,status:["Shock",25],cat:"Special",err:"Static Plains"}],["Colour Beam",32,"Far",56,74,0,0,0,38,1.0,{cast:1,cat:"Special",err:"Dawn Temple",need:"mnd"}],["Lightning Bolt",34,"Far",54,72,0,0,0,40,1.0,{cast:1,status:["Shock",25],cat:"Special",err:"Static Plains",need:"mnd"}],
    ["Heavy Shower",36,"Mid",16,76,5,0,0,38,1.0,{cast:1,hits:5,cat:"Special",err:"Coral Shallows",after:"Light Shower"}],["Blizzard",38,"Far",56,70,0,0,0,40,1.1,{cast:1,status:["Freeze",20],cat:"Special",err:"Glacier Rim",need:"mnd"}],["Cloudburst",40,"Far",90,68,12,0,15,40,1.2,{cast:1,cat:"Special",err:"Coral Shallows"}]],
  Dango:[["Skewer Poke",1,"Near",26,88,8,0,8,10,0.3,{cat:"Basic"}],["Squish",2,"Close",24,88,6,0,6,10,0.3,{cat:"Basic"}],["Bounce",3,"Mid",28,85,8,0,10,14,0.4,{dash:"in",cat:"Basic"}],
    ["Triple Stack",5,"Close",18,85,8,0,0,24,0.6,{hits:3,cat:"Special"}],["Roll Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Double Poke",10,"Close",16,86,8,0,4,16,0.4,{hits:2,cat:"Hit",from:"Skewer Poke"}],
    ["Syrup Dab",12,"Close",30,84,5,0,6,15,0.4,{cat:"Hit",from:"Squish"}],["Sweet Glaze",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Mochi Smack",20,"Close",44,82,10,0,18,24,0.6,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Syrup Dab"}],
    ["Hop Press",22,"Near",48,68,5,0,16,26,0.8,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",after:"Bounce",share:["legs"]}],["Hot Syrup",23,"Near",20,82,0,10,0,18,0.5,{cast:1,status:["Burn",25],cat:"Withering",err:"Cinder Peak"}],["Spin Skewer",24,"Mid",34,76,26,0,6,22,0.7,{dash:"in",cat:"Sharp",err:"Saffron Dojo",need:"pow"}],
    ["Skewer Toss",26,"Mid",34,78,25,0,0,20,0.6,{cat:"Sharp",err:"Static Plains"}],["Big Roll",26,"Far",44,64,5,0,18,30,1.0,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",share:["round"]}],["Petal Swirl",28,"Mid",32,74,26,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Tanglewood",need:"mnd"}],
    ["Stack Drop",30,"Near",52,66,5,0,20,30,0.9,{cat:"Heavy",err:"Granite Steps",after:"Hop Press",share:["legs"]}],["Sakura Cut",30,"Near",60,78,15,0,10,32,0.8,{cat:"Special",err:"Tanglewood"}],["Poke Flurry",34,"Close",15,84,8,0,0,38,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Double Poke"}],
    ["Grill Flame",36,"Far",58,72,0,0,0,40,1.0,{cast:1,status:["Burn",30],cat:"Special",err:"Cinder Peak",need:"mnd"}],["Skewer Thrust",40,"Mid",90,66,15,0,25,40,1.1,{dash:"in",cat:"Special",err:"Saffron Dojo",after:"Skewer Poke"}]],
  Oaklet:[["Nut Bonk",1,"Close",26,88,8,0,8,10,0.3,{cat:"Basic"}],["Acorn Drop",3,"Mid",26,88,5,0,6,12,0.4,{cast:1,cat:"Hit",from:"Nut Bonk"}],["Root Snare",5,"Mid",22,85,0,0,0,22,0.6,{cast:1,hold:1.5,cat:"Special"}],
    ["Leaf Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Photosynth",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Leaf Storm",20,"Near",15,85,5,0,0,24,0.5,{cast:1,hits:3,cat:"Heavy",err:"Tanglewood",after:"Acorn Drop"}],
    ["Root Quake",24,"Mid",20,80,0,10,0,20,0.5,{cat:"Withering",err:"Granite Steps",share:["legs"],need:"pow"}],["Branch Whip",30,"Near",58,78,10,0,15,30,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow"}],["Old Growth",40,"Close",90,66,15,0,28,40,1.1,{cat:"Special",err:"Tanglewood",after:"Branch Whip"}]],
  Roly:[["Plate Bash",1,"Close",26,88,8,0,10,10,0.3,{cat:"Basic"}],["Skitter",3,"Mid",26,85,8,0,8,12,0.35,{dash:"in",cat:"Basic"}],["Curl Up",5,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],
    ["Roll Bump",6,"Near",24,86,6,0,10,12,0.35,{dash:"in",cat:"Basic",from:"Plate Bash"}],["Shell Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Long Roll",10,"Far",24,90,5,0,6,18,0.4,{dash:"in",cat:"Hit",from:"Skitter"}],
    ["Hundred Legs",14,"Close",14,85,8,0,0,24,0.5,{hits:4,cat:"Hit"}],["Feeler Tickle",18,"Near",20,82,0,9,0,18,0.45,{cat:"Withering",err:"Static Plains",need:"mnd"}],["Pill Roll",20,"Mid",56,75,10,0,22,28,0.8,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",share:["round"]}],
    ["Plate Slice",21,"Near",36,78,26,0,0,20,0.6,{dash:"in",cat:"Sharp",err:"Iron Foundry",need:"pow"}],["Dust Kick",22,"Mid",20,80,0,10,0,18,0.5,{status:["Blind",30],cat:"Withering",err:"Granite Steps",share:["legs"]}],["Ball Drop",24,"Far",42,68,5,0,12,28,0.9,{cat:"Heavy",err:"Saffron Dojo",need:"pow"}],
    ["Crawl Over",26,"Near",24,80,0,12,0,22,0.5,{cat:"Withering",err:"Nightshade Marsh"}],["Saw Roll",27,"Mid",36,76,28,0,6,24,0.7,{dash:"in",cat:"Sharp",err:"Iron Foundry",need:"pow",share:["shell"]}],["Spin Dive",28,"Mid",50,70,5,0,18,30,0.8,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow"}],
    ["Armour Up",30,"Any",0,100,0,0,0,20,0.2,{buff:"brace"}],["Thousand Legs",30,"Near",12,80,8,0,0,38,0.9,{hits:6,cat:"Special",err:"Static Plains",share:["legs"]}],["Edge Roll",32,"Far",34,72,30,0,6,28,0.8,{dash:"in",cat:"Sharp",err:"Static Plains",after:"Long Roll"}],
    ["Rumble Roll",34,"Mid",66,70,6,0,18,38,1.0,{dash:"in",cat:"Special",err:"Granite Steps",need:"pow"}],["Roly Combo",36,"Near",70,82,12,0,14,40,1.0,{cat:"Special",err:"Saffron Dojo",need:"pow",after:"Roll Bump"}],["Wrecking Ball",40,"Mid",92,66,12,0,30,42,1.2,{dash:"in",cat:"Special",err:"Granite Steps",after:"Pill Roll"}]],
  Trundle:[["Slime Spit",1,"Mid",24,90,5,0,0,10,0.3,{cast:1,cat:"Basic"}],["Mouth Nip",2,"Close",22,86,8,0,0,11,0.3,{cat:"Basic"}],["Shell Bump",3,"Close",26,88,8,0,10,12,0.3,{cat:"Basic"}],
    ["Sticky Trail",5,"Mid",20,88,0,0,0,22,0.6,{cast:1,slow:3,cat:"Special"}],["Snail Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Slime Ball",12,"Mid",28,86,5,0,0,16,0.4,{cast:1,cat:"Hit",from:"Slime Spit"}],
    ["Hide Away",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Feeler Flick",20,"Near",15,85,8,0,0,24,0.5,{hits:3,cat:"Hit"}],["Tongue Rasp",20,"Near",36,78,26,0,0,20,0.6,{cat:"Sharp",err:"Tanglewood",need:"pow",after:"Mouth Nip",share:["mouth"]}],
    ["Acid Drip",22,"Mid",20,80,0,10,0,18,0.5,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd",share:["mouth"]}],["Slime Slide",24,"Near",52,68,5,0,16,28,0.8,{dash:"in",cat:"Heavy",err:"Coral Shallows",need:"pow",after:"Shell Bump"}],["Slime Wave",26,"Mid",46,70,5,0,12,28,0.8,{cast:1,cat:"Heavy",err:"Coral Shallows",need:"mnd",after:"Slime Ball"}],
    ["Stalk Lash",28,"Near",36,76,28,0,0,22,0.6,{cat:"Sharp",err:"Tanglewood",need:"pow"}],["Home Comfort",30,"Any",0,100,0,0,0,24,0.5,{support:1,heal:0.25}],["Shell Smoke",32,"Mid",44,70,5,0,0,28,0.8,{cast:1,status:["Blind",25],cat:"Heavy",err:"Cinder Peak",need:"mnd"}],
    ["Smoke Ring",36,"Far",76,68,8,0,10,38,1.1,{cast:1,cat:"Special",err:"Cinder Peak",after:"Shell Smoke"}],["House Slam",40,"Close",92,64,15,0,30,42,1.2,{cat:"Special",err:"Granite Steps",after:"Slime Slide",share:["shell"]}]],
  /* batch 3 uncommons */
  Clank:[["Tin Punch",1,"Close",24,90,10,0,8,9,0.25,{cat:"Basic"}],["Wrench Poke",2,"Near",22,88,8,0,4,11,0.3,{cat:"Basic"}],["Spring Hop",3,"Mid",28,85,8,0,8,14,0.4,{dash:"in",cat:"Basic"}],
    ["Wind-Up Barrage",5,"Close",13,85,8,0,0,26,0.6,{hits:5,cat:"Special"}],["Gear Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Rapid Poke",10,"Near",12,86,6,0,0,16,0.4,{hits:3,cat:"Hit",from:"Tin Punch"}],
    ["Wrench Toss",12,"Far",26,86,8,0,0,18,0.45,{cat:"Hit",from:"Wrench Poke"}],["Steam Puff",14,"Mid",28,86,0,0,6,16,0.4,{cast:1,cat:"Hit"}],["Oil Up",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],
    ["Spark Shot",16,"Far",26,88,5,0,0,18,0.45,{cast:1,cat:"Hit"}],["Rivet Shot",20,"Mid",15,85,8,0,0,24,0.5,{hits:3,cat:"Hit"}],["Wrench Smash",20,"Close",56,70,6,0,18,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Wrench Poke",share:["arms"]}],
    ["Tin Snip",21,"Close",36,78,26,0,0,20,0.6,{cat:"Sharp",err:"Saffron Dojo",need:"pow"}],["Shock Slam",22,"Close",54,68,5,0,14,28,0.8,{cat:"Heavy",err:"Static Plains",need:"pow"}],["Spring Stab",24,"Mid",36,74,28,0,0,24,0.7,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow",after:"Spring Hop",share:["legs"]}],
    ["Piston Punch",26,"Near",50,70,5,0,18,28,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow",share:["arms"]}],["Static Zap",28,"Far",40,68,5,0,0,28,0.8,{cast:1,cat:"Heavy",err:"Static Plains",need:"mnd"}],["Rocket Fist",30,"Mid",64,75,12,0,22,32,0.9,{dash:"in",cat:"Heavy",err:"Iron Foundry",after:"Spring Stab",share:["arms"]}],
    ["Gear Throw",32,"Far",42,68,5,0,10,28,0.9,{cat:"Heavy",err:"Iron Foundry",need:"pow"}],["Saw Throw",34,"Far",34,72,30,0,0,26,0.8,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],["Clank Combo",36,"Near",70,82,12,0,14,40,1.0,{cat:"Special",err:"Saffron Dojo",need:"pow",after:"Rapid Poke"}],
    ["Steam Blast",40,"Far",90,68,12,0,15,40,1.2,{cast:1,cat:"Special",err:"Cinder Peak",after:"Steam Puff"}]],
  Crease:[["Paper Cut",1,"Close",22,92,15,0,4,8,0.2,{cat:"Basic"}],["Fold Dart",3,"Mid",26,90,10,0,0,12,0.35,{cat:"Hit"}],["Thousand Cranes",5,"Near",13,88,8,0,0,24,0.6,{cast:1,hits:4,cat:"Special"}],
    ["Origami Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Beak Peck",9,"Near",30,84,10,0,4,14,0.4,{cat:"Hit",from:"Paper Cut"}],["Paper Hop",11,"Near",28,88,8,0,6,16,0.4,{dash:"in",cat:"Hit",from:"Fold Dart"}],
    ["Refold",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Flap Dance",18,"Near",20,82,0,10,0,18,0.45,{cast:1,status:["Daze",25],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Paper Gust",20,"Mid",30,85,5,0,25,22,0.5,{cast:1,cat:"Hit"}],
    ["Thin Cut",22,"Near",22,80,10,9,0,18,0.45,{cat:"Withering",err:"Saffron Dojo",need:"pow"}],["Beak Dive",24,"Mid",52,70,5,0,14,28,0.8,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",after:"Beak Peck",share:["beak"]}],["Paper Bomb",26,"Mid",50,68,5,0,12,30,0.8,{cast:1,cat:"Heavy",err:"Cinder Peak",need:"mnd"}],
    ["Beak Spear",28,"Near",38,76,28,0,0,22,0.7,{dash:"in",cat:"Sharp",err:"Saffron Dojo",need:"pow",share:["beak"]}],["Wing Slice",30,"Near",58,78,15,0,10,30,0.8,{cat:"Heavy",err:"Static Plains",share:["wings"]}],["Star Throw",32,"Far",34,72,28,0,0,26,0.8,{cast:1,cat:"Sharp",err:"Static Plains",after:"Fold Dart"}],
    ["Paper Boomerang",34,"Mid",36,74,26,0,4,24,0.7,{cast:1,cat:"Sharp",err:"Static Plains",need:"mnd"}],["Wing Barrage",36,"Near",14,82,10,0,0,40,1.0,{hits:5,cat:"Special",err:"Static Plains",need:"pow",after:"Wing Slice",share:["wings"]}],["Phoenix Fold",40,"Far",90,68,12,10,10,40,1.2,{cast:1,cat:"Special",err:"Cinder Peak"}]],
  Twiglet:[["Twig Poke",1,"Near",26,88,8,0,8,10,0.3,{cat:"Basic"}],["Leaf Shot",3,"Mid",26,88,5,0,0,12,0.35,{cast:1,cat:"Basic"}],["Pruning Snip",5,"Close",58,78,20,0,10,26,0.7,{cat:"Special"}],
    ["Graft Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Deep Water",14,"Any",0,100,0,0,0,24,0.5,{support:1,heal:0.25}],["Blossom Flurry",20,"Near",15,85,5,0,0,24,0.5,{cast:1,hits:3,cat:"Hit",from:"Leaf Shot"}],
    ["Root Grip",25,"Close",22,80,0,12,0,20,0.5,{hold:1.5,cat:"Withering",err:"Tanglewood",after:"Twig Poke",share:["legs"]}],["Trunk Twist",30,"Near",58,78,10,0,18,30,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Root Grip",share:["arms"]}],["Blossom Burst",40,"Far",90,68,12,0,15,40,1.2,{cast:1,cat:"Special",err:"Dream Garden",need:"mnd",after:"Blossom Flurry"}]],
  Swirl:[["Snow Pellet",1,"Mid",26,90,5,0,6,10,0.3,{cast:1,cat:"Basic"}],["Frost Bump",3,"Close",26,88,8,0,10,12,0.3,{cat:"Basic"}],["Shake Up",5,"Mid",22,88,0,10,0,22,0.6,{cast:1,status:["Daze",40],cat:"Special"}],
    ["Glass Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Snow Roll",10,"Near",30,86,8,0,6,16,0.45,{dash:"in",cat:"Hit",from:"Frost Bump"}],["Hot Cocoa",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],
    ["Blizzard Spin",20,"Near",13,88,8,0,0,24,0.5,{cast:1,hits:4,cat:"Heavy",err:"Static Plains",need:"mnd",after:"Cold Draft",share:["round"]}],["Cold Draft",22,"Mid",20,80,0,12,0,18,0.5,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Snow Kick",26,"Near",36,76,26,0,0,20,0.6,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Snow Roll",share:["legs"]}],
    ["Snow Slam",28,"Close",54,68,5,0,22,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Snow Roll",share:["round"]}],["Glass Dome",30,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],["Whiteout",40,"Far",88,68,10,0,15,40,1.2,{cast:1,status:["Freeze",20],cat:"Special",err:"Glacier Rim",need:"mnd",after:"Blizzard Spin"}]],
  Ditty:[["Clasp Snap",1,"Close",24,90,8,0,4,9,0.25,{cat:"Basic"}],["Note Toss",3,"Mid",26,90,5,0,0,12,0.35,{cast:1,cat:"Basic"}],["Toe Tap",4,"Close",30,92,5,0,6,15,0.4,{cat:"Hit",from:"Clasp Snap"}],
    ["Music Box Waltz",5,"Mid",24,88,0,10,0,22,0.6,{cast:1,status:["Daze",35],cat:"Special"}],["Wind Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Sour Note",10,"Far",26,92,5,0,0,18,0.4,{cast:1,cat:"Hit",from:"Note Toss"}],
    ["Encore",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Loud Note",16,"Far",32,88,5,0,12,18,0.5,{cast:1,cat:"Hit",from:"Sour Note"}],["Pirouette",20,"Close",14,85,8,0,0,24,0.5,{hits:3,cat:"Hit",from:"Toe Tap"}],
    ["Heel Stomp",22,"Close",54,68,5,0,20,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Toe Tap",share:["legs"]}],["Pin Prick",24,"Close",34,78,26,0,0,20,0.6,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],["Sleepy Tune",26,"Mid",20,82,0,12,0,18,0.5,{cast:1,status:["Daze",25],cat:"Withering",err:"Dream Garden",need:"mnd"}],
    ["Sad Song",28,"Near",22,80,0,14,0,20,0.5,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Dance Combo",29,"Near",14,82,6,0,0,38,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Pirouette",share:["legs"]}],["Crescendo",30,"Near",58,78,8,10,15,30,0.8,{cast:1,cat:"Heavy",err:"Static Plains",need:"mnd"}],
    ["Drum Roll",31,"Mid",52,66,5,0,12,30,0.8,{cat:"Heavy",err:"Static Plains",need:"pow",share:["arms"]}],["Comb Slash",32,"Near",38,76,28,0,0,24,0.7,{cat:"Sharp",err:"Iron Foundry",need:"pow",after:"Pin Prick"}],["Bass Boom",33,"Far",42,66,5,0,18,30,0.9,{cast:1,cat:"Heavy",err:"Static Plains",need:"mnd",after:"Loud Note"}],
    ["Dream Waltz",34,"Mid",70,70,5,0,0,38,1.0,{cast:1,status:["Daze",30],cat:"Special",err:"Dream Garden",need:"mnd",after:"Sleepy Tune"}],["Gear Grind",36,"Mid",76,72,10,0,0,38,1.0,{cat:"Special",err:"Iron Foundry",need:"pow",after:"Comb Slash"}],["Haunted Tune",37,"Far",66,70,8,0,0,40,1.1,{cast:1,status:["Dread",30],cat:"Special",err:"Hollow Moor",need:"mnd",after:"Sad Song"}],
    ["Bass Drop",38,"Mid",80,68,5,0,18,40,1.1,{cast:1,cat:"Special",err:"Static Plains",need:"mnd",after:"Drum Roll"}],["Sound Wave",39,"Far",62,76,8,0,15,38,1.0,{cast:1,cat:"Special",err:"Static Plains",need:"mnd"}],["Grand Finale",40,"Far",92,66,12,0,15,42,1.2,{cast:1,cat:"Special",err:"Static Plains",need:"mnd",after:"Crescendo"}]],
  Sizzle:[["Crumb Toss",1,"Mid",26,90,5,0,0,10,0.3,{cast:1,cat:"Basic"}],["Toast Slap",3,"Close",26,88,8,0,10,12,0.3,{cat:"Basic"}],["Toast Pop",5,"Near",30,95,12,0,0,22,0.4,{dash:"in",status:["Burn",20],cat:"Special"}],
    ["Plate Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Crust Jab",10,"Near",30,86,8,0,6,16,0.4,{cat:"Hit",from:"Toast Slap"}],["Butter Up",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],
    ["Hot Coals",20,"Mid",30,85,5,0,0,24,0.6,{cast:1,status:["Burn",35],cat:"Hit",from:"Crumb Toss"}],["Hot Stomp",22,"Close",54,68,5,0,20,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Crust Jab",share:["legs"]}],["Black Smoke",24,"Mid",20,82,0,12,0,18,0.5,{cast:1,status:["Blind",25],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],
    ["Crust Chop",27,"Close",36,78,26,0,0,20,0.6,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Crust Jab",share:["arms"]}],["Hot Wire",29,"Near",38,76,28,0,0,24,0.7,{status:["Burn",15],cat:"Sharp",err:"Iron Foundry",need:"pow"}],["Kettle Steam",30,"Near",58,78,8,0,15,30,0.8,{cast:1,cat:"Heavy",err:"Cinder Peak",need:"mnd",after:"Hot Coals"}],
    ["Full Breakfast",40,"Far",90,66,12,0,15,40,1.2,{cast:1,status:["Burn",20],cat:"Special",err:"Cinder Peak",need:"mnd",after:"Kettle Steam"}]],
  Aero:[["Wind Nudge",1,"Mid",24,90,5,0,18,10,0.3,{cast:1,cat:"Basic"}],["Pinwheel Spin",3,"Close",22,88,8,0,8,12,0.3,{cat:"Basic"}],["Updraft",5,"Mid",26,88,5,0,0,22,0.5,{cast:1,hits:2,cat:"Special"}],
    ["Breeze Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Ride the Wind",14,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Tail Lash",20,"Near",15,85,8,0,0,24,0.5,{hits:3,cat:"Hit",from:"Pinwheel Spin"}],
    ["Grit Blast",24,"Mid",20,82,0,12,0,18,0.5,{cast:1,status:["Blind",25],cat:"Withering",err:"Granite Steps",need:"mnd",after:"Wind Nudge"}],["Air Slice",28,"Mid",36,76,27,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Glacier Rim",need:"mnd",after:"Wind Nudge",share:["wings"]}],["Dive Bomb",30,"Mid",60,75,10,0,20,32,0.9,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",after:"Tail Lash",share:["wings"]}],
    ["Jet Stream",40,"Far",88,68,12,0,25,40,1.2,{cast:1,cat:"Special",err:"Dawn Temple",need:"mnd",after:"Air Slice"}]],
  Nesta:[["Doll Bonk",1,"Close",26,88,8,0,10,10,0.3,{cat:"Basic"}],["Wobble",2,"Near",24,88,5,0,4,11,0.3,{cat:"Basic",dash:"in",from:"Doll Bonk"}],["Little Sister",3,"Mid",24,88,5,0,0,12,0.4,{cast:1,cat:"Hit"}],
    ["Nesting Stack",5,"Close",14,85,8,0,0,24,0.6,{hits:4,cat:"Special"}],["Double Bonk",7,"Close",16,85,8,0,6,15,0.4,{hits:2,cat:"Hit",from:"Doll Bonk"}],["Doll Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Double Wobble",9,"Near",15,88,5,0,4,14,0.4,{hits:2,cat:"Basic",from:"Wobble"}],["Big Sister",11,"Far",22,90,5,0,0,17,0.4,{cast:1,cat:"Hit",from:"Little Sister"}],["Paint Over",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22,cleanse:1}],
    ["Lid Clap",20,"Near",44,82,8,0,15,24,0.6,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Double Bonk"}],["Rolling Doll",24,"Far",44,66,0,0,15,30,0.9,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",after:"Double Wobble",share:["round"]}],["Chip Paint",26,"Mid",22,80,0,10,0,18,0.5,{cast:1,status:["Blind",25],cat:"Withering",err:"Dream Garden",need:"mnd"}],
    ["Splinter Shot",28,"Mid",13,78,28,0,0,22,0.7,{hits:3,cat:"Sharp",err:"Tanglewood"}],["Sister Parade",30,"Mid",15,85,5,0,0,30,0.7,{cast:1,hits:4,cat:"Special",err:"Dream Garden",need:"mnd",after:"Big Sister"}],["Russian Roll",40,"Mid",90,66,12,0,25,40,1.1,{dash:"in",cat:"Special",err:"Saffron Dojo",need:"pow",share:["round"]}]],
  Magna:[["Clink",1,"Close",24,90,8,0,4,9,0.25,{cat:"Basic"}],["Shove",2,"Close",25,88,5,0,12,11,0.3,{cat:"Basic"}],["Bolt Toss",3,"Mid",26,88,8,0,0,12,0.35,{cat:"Hit"}],
    ["Attract",5,"Mid",26,88,5,0,-30,22,0.5,{cast:1,status:["Shock",25],cat:"Special"}],["Double Clink",6,"Close",14,90,6,0,4,14,0.35,{hits:2,cat:"Basic",from:"Clink"}],["Pole Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Zap Shot",9,"Mid",28,88,5,0,0,15,0.4,{cast:1,cat:"Hit",from:"Bolt Toss"}],["Repel",14,"Near",30,85,5,0,30,20,0.5,{cast:1,cat:"Hit"}],["Scrap Storm",20,"Near",14,85,8,0,0,26,0.5,{cast:1,hits:4,cat:"Heavy",err:"Iron Foundry"}],
    ["Static Cling",21,"Near",22,80,0,10,-10,18,0.5,{cast:1,hold:1.5,cat:"Withering",err:"Static Plains",need:"mnd"}],["Iron Press",23,"Near",54,70,0,0,18,28,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Double Clink",share:["arms"]}],["Hum",24,"Far",20,78,0,12,0,20,0.5,{cast:1,cat:"Withering",err:"Static Plains",need:"mnd"}],
    ["Nail Shot",26,"Far",26,74,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Iron Foundry"}],["Heavy Stomp",27,"Mid",52,68,0,0,22,30,0.9,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["legs"]}],["Double Cling",28,"Near",13,78,0,12,-10,24,0.6,{cast:1,hits:2,cat:"Withering",err:"Static Plains",need:"mnd",after:"Static Cling"}],
    ["Overcharge",30,"Mid",56,75,8,0,0,32,0.8,{cast:1,status:["Shock",30],cat:"Heavy",err:"Static Plains",after:"Zap Shot"}],["Bolt Missile",32,"Far",27,76,26,0,5,26,0.8,{cat:"Sharp",err:"Iron Foundry"}],["Coil Spin",34,"Near",14,80,6,0,0,40,1.0,{cast:1,hits:5,status:["Shock",30],cat:"Special",err:"Static Plains"}],
    ["Pole Smash",36,"Near",76,72,10,0,20,38,1.0,{cat:"Special",err:"Saffron Dojo",need:"pow",share:["arms"]}],["Field Crush",40,"Far",90,66,12,0,-20,42,1.2,{cast:1,cat:"Special",err:"Iron Foundry"}]],
  Helm:[["Brass Bonk",1,"Close",26,88,8,0,10,10,0.3,{cat:"Basic"}],["Dive Roll",2,"Near",24,88,5,0,6,11,0.3,{dash:"in",cat:"Basic"}],["Bubble Shot",3,"Mid",24,90,5,0,0,12,0.35,{cast:1,cat:"Hit"}],
    ["Air Puff",4,"Mid",22,88,0,0,10,13,0.35,{cast:1,cat:"Basic"}],["Air Hose",5,"Near",30,85,5,0,0,22,0.6,{cast:1,status:["Soak",40],cat:"Special"}],["Clang",6,"Near",30,86,5,0,16,16,0.45,{cat:"Hit",from:"Brass Bonk"}],
    ["Dive Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Bubble Jet",9,"Far",22,88,5,0,0,17,0.4,{cast:1,cat:"Hit",from:"Bubble Shot"}],["Tank Roll",11,"Mid",30,80,5,0,12,17,0.45,{dash:"in",cat:"Hit",from:"Dive Roll"}],
    ["Valve Blast",13,"Far",24,86,0,0,6,18,0.4,{cast:1,cat:"Hit"}],["Seal Up",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Lead Boots",20,"Close",48,80,10,0,22,26,0.6,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["legs"]}],
    ["Pressure Jet",22,"Far",26,74,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Static Plains"}],["Hull Smash",24,"Close",56,68,0,0,24,30,0.9,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Clang"}],["Rivet Spray",25,"Mid",13,76,28,0,0,22,0.7,{cast:1,hits:3,cat:"Sharp",err:"Iron Foundry"}],
    ["Ballast Drop",26,"Near",52,70,0,0,20,28,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow"}],["Rim Spin",27,"Close",36,76,26,0,6,22,0.65,{cat:"Sharp",err:"Iron Foundry",share:["round"]}],["Deep Swirl",28,"Far",42,66,0,0,18,30,0.9,{cast:1,cat:"Heavy",err:"Coral Shallows",need:"mnd",after:"Bubble Jet"}],
    ["Deep Roll",30,"Mid",54,66,0,0,22,32,0.9,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",after:"Tank Roll",share:["round"]}],["Sonar Ping",30,"Far",50,82,5,10,0,30,0.8,{cast:1,cat:"Withering",err:"Coral Shallows"}],["Big Bell",34,"Close",25,84,8,0,6,38,1.0,{hits:3,cat:"Special",err:"Dawn Temple"}],
    ["Depth Charge",40,"Mid",92,64,12,0,28,42,1.2,{cast:1,cat:"Special",err:"Coral Shallows"}]],
  /* batch 4 */
  Bloop:[["Jelly Bump",1,"Close",24,90,8,0,8,9,0.25,{cat:"Basic"}],["Tentacle Flick",2,"Near",24,88,5,0,4,11,0.3,{cat:"Basic"}],["Sting Shot",3,"Mid",26,90,5,0,0,12,0.35,{cast:1,cat:"Hit"}],
    ["Jelly Zap",5,"Near",48,82,8,0,6,26,0.75,{cast:1,status:["Shock",35],cat:"Special"}],["Drift Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Double Flick",9,"Near",14,88,5,0,0,14,0.4,{hits:2,cat:"Basic",from:"Tentacle Flick"}],
    ["Jelly Press",11,"Near",32,85,5,0,8,16,0.45,{cat:"Hit",from:"Jelly Bump"}],["Glow Soak",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Tentacle Flurry",20,"Near",14,85,8,0,0,24,0.5,{hits:4,cat:"Heavy",err:"Coral Shallows",after:"Double Flick",share:["tentacles"]}],
    ["Water Cannon",22,"Far",40,66,5,0,12,30,0.9,{cast:1,cat:"Heavy",err:"Coral Shallows",need:"mnd"}],["Swat",24,"Mid",22,80,0,10,0,18,0.5,{cat:"Withering",err:"Coral Shallows"}],["Stinger",25,"Close",36,78,28,0,0,22,0.65,{cat:"Sharp",err:"Nightshade Marsh",share:["tentacles"]}],
    ["Stinging Rain",26,"Far",22,76,0,8,0,22,0.6,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],["Bell Slam",27,"Near",52,70,0,0,18,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Jelly Press"}],["Big Swat",28,"Mid",24,76,0,14,0,24,0.6,{cat:"Withering",err:"Coral Shallows",after:"Swat"}],
    ["Bubble Net",30,"Mid",24,85,0,0,0,24,0.6,{cast:1,slow:3,cat:"Hit"}],["Spark Dart",30,"Mid",36,76,26,0,0,24,0.7,{cast:1,status:["Shock",20],cat:"Sharp",err:"Static Plains"}],["Life Drain",32,"Close",30,78,0,0,0,38,0.9,{drain:0.5,cat:"Special",err:"Nightshade Marsh",need:"pow",share:["tentacles"]}],
    ["Sting Barrage",34,"Far",14,78,6,0,0,40,1.0,{cast:1,hits:5,status:["Shock",25],cat:"Special",err:"Static Plains"}],["Bloom Pulse",40,"Far",88,68,12,0,15,40,1.2,{cast:1,cat:"Special",err:"Dream Garden"}]],
  Sox:[["Toe Poke",1,"Close",24,90,10,0,8,9,0.25,{cat:"Basic"}],["Sock Kick",2,"Near",24,88,6,0,6,11,0.3,{dash:"in",cat:"Basic",from:"Toe Poke"}],["Lint Ball",3,"Mid",26,88,5,0,0,12,0.35,{cat:"Hit"}],
    ["Sock It",5,"Close",62,76,12,0,22,26,0.8,{cat:"Special"}],["Laundry Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Darn It",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],
    ["Thread Whip",20,"Near",44,82,10,0,10,24,0.6,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Sock Kick"}],["Sour Whiff",22,"Far",20,76,0,12,0,22,0.5,{cast:1,cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],["Dive Flop",24,"Mid",54,68,0,0,18,30,0.9,{dash:"in",cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["legs"]}],
    ["Spin Cycle",25,"Near",38,76,26,0,6,22,0.65,{dash:"in",cat:"Sharp",err:"Static Plains"}],["Toe Drill",26,"Close",36,78,28,0,4,20,0.6,{cat:"Sharp",err:"Saffron Dojo",share:["legs"]}],["Needle Toss",27,"Mid",26,76,28,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Tanglewood"}],
    ["Yarn Snare",30,"Mid",24,85,0,0,0,26,0.6,{cast:1,hold:1.5,cat:"Hit",from:"Lint Ball"}],["Tangle Up",31,"Mid",22,80,0,10,0,20,0.5,{cast:1,cat:"Withering",err:"Tanglewood",need:"mnd",after:"Yarn Snare"}],["Hundred Flings",33,"Mid",13,82,6,0,0,40,1.0,{hits:6,cat:"Special",err:"Saffron Dojo",need:"pow",share:["legs"]}],
    ["Static Shock",35,"Far",64,74,8,0,0,38,1.0,{cast:1,status:["Shock",30],cat:"Special",err:"Static Plains"}],["Stink Bomb",37,"Mid",44,76,5,8,0,36,1.0,{cast:1,status:["Poison",40],cat:"Special",err:"Nightshade Marsh"}],["Woolly Roar",40,"Far",88,68,10,10,20,40,1.2,{cast:1,cat:"Special",err:"Dream Garden"}]],
  Cuppy:[["Sprinkle Toss",1,"Mid",14,90,5,0,0,10,0.3,{cast:1,hits:2,cat:"Basic"}],["Crumb Flick",2,"Near",22,88,6,0,0,11,0.3,{cast:1,cat:"Basic"}],["Cake Bump",3,"Close",26,88,8,0,10,12,0.3,{cat:"Basic"}],
    ["Frosting Splat",5,"Mid",46,82,6,0,4,26,0.75,{cast:1,slow:3,cat:"Special"}],["Sugar Roll",6,"Near",30,82,8,0,8,16,0.4,{dash:"in",cat:"Hit",from:"Cake Bump"}],["Cupcake Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Sprinkle Rain",11,"Mid",10,86,5,0,0,16,0.5,{cast:1,hits:3,cat:"Hit",from:"Sprinkle Toss"}],["Bake",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Cherry Bomb",20,"Mid",48,80,8,0,15,26,0.7,{cast:1,cat:"Heavy",err:"Cinder Peak",need:"mnd"}],
    ["Sugar Rush",22,"Mid",48,68,5,0,15,30,0.8,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",share:["legs"]}],["Wrapper Slash",23,"Near",36,76,26,0,0,20,0.6,{cat:"Sharp",err:"Static Plains",need:"pow"}],["Cake Roll",24,"Near",54,68,5,0,20,30,0.9,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",after:"Sugar Roll",share:["round"]}],
    ["Sugar Crash",25,"Near",22,80,0,12,0,20,0.5,{cast:1,cat:"Withering",err:"Dream Garden",need:"mnd"}],["Sugar Shards",26,"Mid",34,74,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Granite Steps",need:"mnd"}],["Cherry Pit",28,"Mid",36,74,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Tanglewood",need:"mnd"}],
    ["Birthday Blaze",30,"Near",58,78,8,0,10,30,0.8,{cast:1,status:["Burn",20],cat:"Heavy",err:"Cinder Peak",need:"mnd"}],["Cake Drop",32,"Far",45,66,5,0,12,30,0.9,{cat:"Heavy",err:"Granite Steps",need:"pow"}],["Cherry Shower",34,"Mid",14,70,6,0,0,38,1.0,{cast:1,hits:5,cat:"Special",err:"Tanglewood",need:"mnd"}],
    ["Candy Storm",36,"Far",60,66,8,0,0,40,1.1,{cast:1,cat:"Special",err:"Dream Garden",need:"mnd",after:"Sprinkle Rain"}],["Layer Cake",40,"Close",88,66,15,0,28,40,1.1,{cat:"Special",err:"Granite Steps",need:"pow",share:["round"]}]],
  Suds:[["Bubble Pop",1,"Mid",24,90,5,0,0,10,0.3,{cast:1,cat:"Basic"}],["Bubble Bump",2,"Close",24,90,6,0,6,10,0.3,{cat:"Basic"}],["Soap Slide",3,"Mid",28,85,8,0,8,14,0.4,{dash:"in",cat:"Hit"}],
    ["Foam Burst",5,"Near",17,85,6,0,0,26,0.75,{cast:1,hits:3,status:["Soak",30],cat:"Special"}],["Foam Bump",6,"Close",30,84,5,0,8,15,0.4,{cat:"Hit",from:"Bubble Bump"}],["Rinse Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Soap Stream",10,"Mid",26,88,5,0,0,15,0.4,{cast:1,cat:"Hit",from:"Bubble Pop"}],["Lather Up",14,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],["Scrub",20,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2,cleanse:1}],
    ["Foam Rush",21,"Mid",48,68,5,0,15,28,0.8,{dash:"in",cat:"Heavy",err:"Coral Shallows",need:"pow",share:["legs"]}],["Spout Jet",22,"Far",34,76,26,0,0,22,0.6,{cast:1,cat:"Sharp",err:"Coral Shallows",need:"mnd",share:["mouth"]}],["Soap Shard",24,"Near",36,76,26,0,0,20,0.6,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],
    ["Warm Soak",26,"Near",20,82,0,12,0,18,0.5,{cast:1,status:["Soak",40],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Cold Jet",28,"Far",36,74,28,0,0,26,0.7,{cast:1,cat:"Sharp",err:"Glacier Rim",need:"mnd",share:["mouth"]}],["Suds Slam",30,"Close",56,78,10,0,20,30,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Foam Bump"}],
    ["Foam Smother",32,"Close",25,80,0,14,0,22,0.5,{cast:1,hold:1.5,cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],["Rinse Cycle",34,"Mid",16,72,6,0,0,38,1.0,{hits:4,cat:"Special",err:"Iron Foundry",need:"pow"}],["Bubble Barrage",36,"Far",60,68,5,0,0,40,1.1,{cast:1,cat:"Special",err:"Dream Garden",need:"mnd",after:"Soap Stream"}],
    ["Swirl Pool",37,"Mid",62,72,5,0,-25,40,1.1,{cast:1,cat:"Special",err:"Coral Shallows",need:"mnd"}],["Tidal Wave",38,"Far",62,66,5,0,20,40,1.1,{cast:1,cat:"Special",err:"Coral Shallows",need:"mnd"}],["Bath Flood",40,"Far",88,68,10,0,20,40,1.2,{cast:1,cat:"Special",err:"Coral Shallows",need:"mnd"}]],
  Scoop:[["Cone Jab",1,"Near",26,88,10,0,8,10,0.3,{cat:"Basic"}],["Sprinkle Shot",3,"Mid",14,88,5,0,0,12,0.35,{hits:2,cat:"Basic"}],["Brain Freeze",5,"Mid",46,80,6,0,4,26,0.75,{cast:1,status:["Freeze",30],cat:"Special"}],
    ["Cone Lunge",6,"Near",32,82,8,0,6,16,0.4,{dash:"in",cat:"Hit",from:"Cone Jab"}],["Scoop Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Sweet Treat",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],
    ["Melt Drip",20,"Mid",22,85,0,0,0,22,0.5,{cast:1,slow:2,cat:"Hit",from:"Sprinkle Shot"}],["Slush Spray",22,"Mid",24,80,0,11,0,20,0.5,{cast:1,cat:"Withering",err:"Coral Shallows",need:"mnd",after:"Melt Drip"}],["Cone Thrust",24,"Near",38,76,27,0,6,22,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Cone Lunge",share:["legs"]}],
    ["Freezer Burn",28,"Close",24,82,0,13,0,20,0.5,{cast:1,status:["Freeze",25],cat:"Withering",err:"Glacier Rim",need:"mnd"}],["Sundae Slam",30,"Close",60,76,12,0,22,30,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["round"]}],["Gelato Glacier",40,"Far",88,68,12,0,15,40,1.2,{cast:1,status:["Freeze",15],cat:"Special",err:"Glacier Rim",need:"mnd"}]],
  Tome:[["Page Cut",1,"Close",22,92,15,0,4,8,0.2,{cat:"Basic"}],["Page Flick",2,"Near",22,88,8,0,0,11,0.3,{cast:1,cat:"Basic"}],["Word Bolt",3,"Mid",26,90,5,0,0,12,0.35,{cast:1,cat:"Basic"}],
    ["Read Aloud",5,"Mid",46,82,6,10,4,26,0.75,{cast:1,status:["Daze",40],cat:"Special"}],["Cover Slap",6,"Close",30,86,5,0,8,15,0.4,{cat:"Hit",from:"Page Cut"}],["Chapter Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Word Volley",12,"Far",16,86,5,0,0,17,0.5,{cast:1,hits:2,cat:"Hit",from:"Word Bolt"}],["Bookmark",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Paper Storm",20,"Near",13,88,8,0,0,24,0.5,{cast:1,hits:4,cat:"Hit",from:"Page Flick"}],
    ["Spine Bash",22,"Close",55,68,5,0,14,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Cover Slap",share:["legs"]}],["Paper Dart",23,"Far",34,76,26,0,0,22,0.6,{cast:1,cat:"Sharp",err:"Static Plains",need:"mnd"}],["Razor Page",24,"Mid",38,76,28,0,0,24,0.7,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],
    ["Book Rush",26,"Near",52,68,5,0,18,30,0.8,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",share:["legs"]}],["Sleepy Story",28,"Near",20,80,0,12,0,18,0.5,{cast:1,status:["Daze",25],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Spell Rune",30,"Far",58,78,8,10,0,30,0.8,{cast:1,cat:"Withering",err:"Dream Garden",need:"mnd"}],
    ["Verse Beam",31,"Far",40,74,28,0,0,28,0.8,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd"}],["Slam Shut",32,"Close",72,78,10,0,25,38,1.0,{cat:"Special",err:"Granite Steps",need:"pow"}],["Page Flurry",34,"Close",14,80,8,0,0,38,0.9,{hits:5,cat:"Special",err:"Static Plains",need:"pow"}],
    ["Word Barrage",36,"Near",64,74,5,0,0,40,1.0,{cast:1,cat:"Special",err:"Dream Garden",need:"mnd",after:"Word Volley"}],["Page Cyclone",38,"Near",70,72,8,0,10,40,1.1,{cast:1,cat:"Special",err:"Static Plains",need:"mnd",after:"Paper Storm"}],["Grand Grimoire",40,"Far",92,66,12,0,15,42,1.2,{cast:1,cat:"Special",err:"Dawn Temple",need:"mnd"}]],
  Gumball:[["Gum Shot",1,"Mid",24,90,5,0,6,10,0.3,{cat:"Basic"}],["Gumball Roll",2,"Close",24,88,6,0,6,10,0.3,{cat:"Basic"}],["Chew",3,"Close",28,88,8,0,6,12,0.3,{cat:"Basic"}],
    ["Gumball Rain",5,"Mid",17,85,6,0,0,26,0.75,{cast:1,hits:3,cat:"Special"}],["Twist Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Gum Volley",9,"Mid",12,86,5,0,0,16,0.5,{hits:2,cat:"Hit",from:"Gum Shot"}],
    ["Candy Roll",11,"Near",32,82,8,0,8,16,0.4,{dash:"in",cat:"Hit",from:"Gumball Roll"}],["Bubblegum Bubble",14,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],["Sticky Gum",20,"Mid",22,85,0,0,0,22,0.5,{cast:1,slow:3,cat:"Hit",from:"Chew"}],
    ["Gum Trap",22,"Near",22,80,0,12,0,20,0.5,{cast:1,slow:2,cat:"Withering",err:"Nightshade Marsh",need:"mnd",after:"Sticky Gum"}],["Hard Candy",23,"Far",34,76,26,0,0,22,0.6,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],["Crank Smash",24,"Near",50,68,5,0,16,28,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow"}],
    ["Peppermint Dart",26,"Far",36,74,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Glacier Rim",need:"mnd"}],["Roll Over",27,"Near",52,68,5,0,20,30,0.9,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",share:["round"]}],["Sour Spray",28,"Far",22,76,0,10,0,22,0.6,{cast:1,cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],
    ["Jawbreaker",30,"Close",64,74,12,0,24,32,0.9,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Candy Roll",share:["round"]}],["Rock Candy",32,"Far",38,72,30,0,0,26,0.8,{cat:"Sharp",err:"Granite Steps",need:"pow"}],["Gumball Barrage",34,"Mid",12,76,6,0,0,38,1.0,{cast:1,hits:6,cat:"Special",err:"Static Plains",need:"pow",after:"Gum Volley"}],
    ["Gumball Cannon",36,"Far",62,66,8,0,15,40,1.1,{cast:1,cat:"Special",err:"Iron Foundry",need:"mnd"}],["Candy Crash",40,"Mid",90,66,12,0,28,42,1.2,{dash:"in",cat:"Special",err:"Iron Foundry",need:"pow",share:["legs"]}]],
  Pina:[["Leaf Slice",1,"Close",24,90,15,0,4,9,0.25,{cat:"Basic"}],["Pineapple Toss",3,"Mid",26,88,5,0,6,12,0.4,{cat:"Hit"}],["Crown Spin",5,"Near",18,85,10,0,4,26,0.75,{hits:3,cat:"Special"}],
    ["Tiki Swap",8,"Close",15,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Double Slice",10,"Close",15,88,12,0,2,14,0.4,{hits:2,cat:"Hit",from:"Leaf Slice"}],["Thorn Flick",12,"Mid",28,86,10,0,4,15,0.4,{cat:"Hit",from:"Pineapple Toss"}],
    ["Juice Up",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Spiky Roll",20,"Mid",56,76,10,0,20,28,0.8,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",after:"Thorn Flick",share:["round"]}],["Sour Squirt",22,"Far",22,76,0,12,0,22,0.5,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],
    ["Leaf Whirl",26,"Near",38,76,27,0,4,22,0.7,{dash:"in",cat:"Sharp",err:"Tanglewood",after:"Double Slice",share:["legs"]}],["Tiki Torch",30,"Near",58,78,8,0,10,30,0.8,{cast:1,status:["Burn",25],cat:"Special",err:"Cinder Peak"}],["Luau Blast",40,"Far",90,68,12,0,15,40,1.2,{cast:1,cat:"Special",err:"Coral Shallows"}]],
  Jingle:[["Coin Toss",1,"Mid",26,88,8,0,0,10,0.3,{cat:"Basic"}],["Piggy Charge",3,"Mid",28,85,8,0,10,14,0.4,{dash:"in",cat:"Hit"}],["Pay Day",5,"Mid",17,85,10,0,0,26,0.75,{cast:1,hits:3,cat:"Special"}],
    ["Coin Roll",6,"Near",30,84,8,0,8,15,0.4,{dash:"in",cat:"Basic",from:"Piggy Charge"}],["Change Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Coin Flick",10,"Far",22,90,5,0,0,16,0.4,{cat:"Hit",from:"Coin Toss"}],
    ["Save Up",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Gold Rush",20,"Close",14,85,10,0,0,26,0.5,{hits:4,cat:"Special",err:"Saffron Dojo"}],["Heavy Roll",22,"Mid",58,66,8,0,22,30,0.9,{dash:"in",cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Coin Roll",share:["round"]}],
    ["Penny Pinch",24,"Close",22,82,0,10,0,20,0.4,{drain:0.3,cat:"Withering",err:"Hollow Moor"}],["Gold Bite",26,"Close",36,78,28,0,0,20,0.6,{cat:"Sharp",err:"Granite Steps",share:["mouth"]}],["Tarnish",27,"Mid",22,80,0,10,0,20,0.5,{cast:1,cat:"Withering",err:"Coral Shallows",need:"mnd"}],
    ["Coin Slice",28,"Far",34,74,26,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Saffron Dojo"}],["Gold Drop",30,"Mid",56,66,6,0,20,30,0.9,{dash:"in",cat:"Heavy",err:"Granite Steps",share:["round"]}],["Treasure Trap",30,"Close",44,80,8,0,0,28,0.7,{hold:1.5,cat:"Heavy",err:"Hollow Moor"}],
    ["Coin Shower",34,"Far",12,78,6,0,0,38,1.0,{hits:5,cast:1,cat:"Special",err:"Dawn Temple",need:"mnd",after:"Coin Flick"}],["Jackpot",40,"Far",92,66,15,0,15,42,1.2,{cast:1,cat:"Special",err:"Dawn Temple"}]],
  Presto:[["Wand Tap",1,"Close",22,92,8,0,4,8,0.2,{cat:"Basic"}],["Card Throw",3,"Mid",14,90,10,0,0,12,0.35,{hits:2,cat:"Hit"}],["Rabbit Out",5,"Mid",46,82,8,10,10,26,0.75,{cast:1,status:["Daze",35],cat:"Special"}],
    ["Vanishing Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Hat Bonk",9,"Close",26,88,6,0,8,12,0.3,{cat:"Basic",from:"Wand Tap"}],["Card Fan",12,"Mid",11,88,10,0,0,16,0.4,{hits:3,cat:"Hit",from:"Card Throw"}],
    ["Disappear",14,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],["Dove Flight",20,"Near",15,85,5,0,0,24,0.5,{cast:1,hits:3,cat:"Hit"}],["Hat Slam",24,"Close",52,70,6,0,18,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Hat Bonk",share:["legs"]}],
    ["Card Slice",26,"Far",34,76,27,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Iron Foundry"}],["Brim Spin",27,"Near",38,76,26,0,6,22,0.65,{dash:"in",cat:"Sharp",err:"Static Plains",share:["legs"]}],["Smoke Bomb",28,"Mid",64,74,0,0,6,36,0.9,{cast:1,status:["Blind",30],cat:"Special",err:"Dream Garden",need:"mnd"}],
    ["Saw in Half",30,"Close",58,78,15,0,10,30,0.8,{cat:"Heavy",err:"Iron Foundry"}],["Card Storm",34,"Far",12,80,10,0,0,38,1.0,{hits:6,cast:1,cat:"Special",err:"Static Plains",after:"Card Fan"}],["Grand Illusion",40,"Far",90,66,12,10,10,42,1.2,{cast:1,cat:"Special",err:"Dream Garden"}]],
  Vroom:[["Bumper",1,"Close",26,88,8,0,12,10,0.3,{cat:"Basic"}],["Dust Cloud",3,"Mid",18,90,0,0,0,12,0.4,{cast:1,status:["Blind",30],cat:"Hit"}],["Suction",5,"Mid",44,82,6,0,-30,26,0.75,{cast:1,cat:"Special"}],
    ["Dock Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Sweep Up",10,"Near",30,86,6,0,6,15,0.4,{dash:"in",cat:"Hit",from:"Bumper"}],["Dust Jet",12,"Mid",30,90,0,0,8,16,0.4,{cast:1,cat:"Hit",from:"Dust Cloud"}],
    ["Recharge",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Brush Spin",20,"Close",14,85,8,0,0,24,0.5,{hits:4,cat:"Special",err:"Iron Foundry",share:["round"]}],["Spike Spin",24,"Near",38,76,27,0,6,22,0.7,{dash:"in",cat:"Sharp",err:"Granite Steps",after:"Sweep Up",share:["round"]}],
    ["Air Blade",26,"Far",30,74,28,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Static Plains"}],["Dust Storm",28,"Far",22,76,0,12,0,22,0.5,{cast:1,status:["Blind",25],cat:"Withering",err:"Nightshade Marsh",need:"mnd",after:"Dust Jet"}],["Full Power",30,"Mid",60,75,10,0,22,32,0.9,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",share:["round"]}],
    ["Deep Clean",40,"Far",90,66,12,0,20,40,1.2,{cast:1,cat:"Special",err:"Dawn Temple"}]],
  Shutter:[["Snap",1,"Close",24,90,10,0,4,9,0.25,{cat:"Basic"}],["Film Lash",3,"Near",26,88,8,0,8,12,0.3,{cat:"Basic"}],["Photo Flash",5,"Mid",44,85,6,10,4,26,0.75,{cast:1,status:["Blind",40],cat:"Special"}],
    ["Long Lash",6,"Mid",24,88,6,0,4,13,0.4,{cat:"Basic",from:"Film Lash"}],["Reel Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Double Snap",10,"Close",15,88,8,0,2,14,0.4,{hits:2,cat:"Hit",from:"Snap"}],
    ["Develop",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Burst Mode",20,"Mid",13,88,8,0,0,24,0.5,{cast:1,hits:4,cat:"Hit"}],["Reel Smash",22,"Near",52,68,6,0,18,28,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Long Lash"}],
    ["Red Eye",23,"Mid",20,80,0,10,0,20,0.5,{cast:1,status:["Blind",35],cat:"Withering",err:"Dawn Temple",need:"mnd"}],["Long Exposure",24,"Mid",22,78,0,12,0,22,0.5,{cast:1,slow:3,cat:"Withering",err:"Dream Garden",need:"mnd"}],["Sharp Kick",25,"Close",36,78,28,0,4,20,0.6,{dash:"in",cat:"Sharp",err:"Static Plains",share:["legs"]}],
    ["Chemical Spray",26,"Far",22,74,0,10,0,22,0.5,{cast:1,status:["Poison",35],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],["Lens Clamp",27,"Close",38,76,27,0,0,22,0.7,{cat:"Sharp",err:"Iron Foundry"}],["Lens Beam",28,"Far",34,74,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Dawn Temple"}],
    ["Heavy Foot",29,"Close",56,66,6,0,22,30,0.9,{cat:"Heavy",err:"Static Plains",need:"pow",share:["legs"]}],["Zoom Lens",30,"Far",58,80,10,0,0,30,0.8,{cast:1,cat:"Heavy",err:"Static Plains"}],["Freeze Frame",32,"Mid",66,70,6,0,4,38,1.0,{cast:1,status:["Freeze",30],cat:"Special",err:"Dream Garden"}],
    ["Snap Combo",36,"Close",70,86,12,0,12,40,1.0,{cat:"Special",err:"Static Plains",need:"pow",after:"Double Snap"}],["Grand Exposure",40,"Far",90,66,12,10,10,42,1.2,{cast:1,cat:"Special",err:"Dawn Temple"}]],
  Yoyo:[["String Whip",1,"Near",26,88,8,0,8,10,0.3,{cat:"Basic"}],["Spin Bump",3,"Close",26,88,8,0,10,12,0.3,{cat:"Basic"}],["Around the World",5,"Near",18,85,10,0,4,26,0.75,{hits:3,cat:"Special"}],
    ["Sleeper Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Long Throw",10,"Far",22,88,5,0,4,16,0.4,{cat:"Hit",from:"String Whip"}],["Rolling Spin",12,"Near",30,84,8,0,10,16,0.45,{cat:"Basic",dash:"in",from:"Spin Bump"}],
    ["Wind Back",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],["Cat's Cradle",20,"Mid",22,85,0,0,0,24,0.6,{cast:1,hold:1.5,cat:"Hit"}],["Dizzy Spin",22,"Mid",22,82,0,10,0,20,0.5,{cast:1,cat:"Withering",err:"Dream Garden",need:"mnd",status:["Daze",25]}],
    ["Loop the Loop",24,"Near",36,78,26,0,0,22,0.65,{cat:"Sharp",err:"Static Plains",need:"pow"}],["Walk the Dog",26,"Close",38,74,27,0,6,24,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Long Throw",share:["round"]}],["Top Grind",30,"Close",58,78,15,0,15,30,0.8,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Rolling Spin",share:["round"]}],
    ["Tornado Spin",40,"Mid",90,66,12,0,28,42,1.2,{dash:"in",cat:"Special",err:"Static Plains",need:"pow",share:["round"]}]],
  Lava:[["Hot Blob",1,"Mid",26,88,5,0,0,10,0.3,{cast:1,status:["Burn",15],cat:"Basic"}],["Magma Bump",3,"Close",26,88,8,0,10,12,0.3,{cat:"Basic"}],["Eruption",5,"Mid",48,80,8,0,12,26,0.75,{cast:1,status:["Burn",35],cat:"Special"}],
    ["Glow Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Hot Foot",9,"Close",28,88,5,0,6,14,0.4,{cat:"Hit",status:["Burn",15],from:"Magma Bump"}],["Big Blob",11,"Mid",28,86,5,0,4,16,0.45,{cast:1,cat:"Hit",from:"Hot Blob"}],
    ["Cool Down",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22}],["Lava Flow",17,"Mid",50,68,5,0,10,28,0.8,{cast:1,cat:"Heavy",err:"Cinder Peak",need:"mnd"}],["Steam Burst",19,"Mid",48,70,5,0,0,26,0.75,{cast:1,cat:"Heavy",err:"Cinder Peak",need:"mnd"}],
    ["Molten Rain",20,"Mid",15,85,5,0,0,24,0.5,{cast:1,hits:3,cat:"Hit"}],["Cinder Dart",22,"Mid",36,76,26,0,0,22,0.65,{cast:1,cat:"Sharp",err:"Cinder Peak",need:"mnd",status:["Burn",20]}],["Heat Shimmer",23,"Mid",22,80,0,12,0,20,0.5,{cast:1,cat:"Withering",err:"Dream Garden",need:"mnd",status:["Daze",25]}],
    ["Lava Stomp",24,"Close",54,68,5,0,22,30,0.85,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Hot Foot",share:["legs"]}],["Smoke Cloud",25,"Mid",20,82,0,10,0,18,0.5,{cast:1,cat:"Withering",err:"Nightshade Marsh",need:"mnd",status:["Blind",30]}],["Obsidian Shard",26,"Far",36,74,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Granite Steps",need:"mnd"}],
    ["Lava Quake",28,"Close",70,70,8,0,20,38,1.0,{cat:"Special",err:"Granite Steps",need:"pow",share:["legs"]}],["Magma Wave",30,"Near",58,78,8,0,15,30,0.8,{cast:1,cat:"Heavy",err:"Cinder Peak",need:"mnd"}],["Bubble Over",31,"Near",66,76,5,0,10,38,0.9,{cast:1,cat:"Special",err:"Cinder Peak",need:"mnd",status:["Burn",30]}],
    ["Rock Shower",33,"Far",16,78,5,0,0,40,1.0,{cast:1,hits:4,cat:"Special",err:"Granite Steps",after:"Molten Rain"}],["Lava Bomb",35,"Far",78,70,10,0,14,38,1.0,{cast:1,cat:"Special",err:"Cinder Peak",need:"mnd",after:"Big Blob",status:["Burn",25]}],["Magma Geyser",37,"Mid",76,72,5,0,18,40,1.0,{cast:1,cat:"Special",err:"Granite Steps",need:"mnd"}],
    ["Volcano Blast",40,"Far",92,66,12,0,20,42,1.2,{cast:1,status:["Burn",25],cat:"Special",err:"Cinder Peak",need:"mnd"}]],
  Pogo:[["Boing",1,"Close",24,90,8,0,12,9,0.25,{cat:"Basic"}],["Bounce Shot",3,"Mid",26,88,5,0,6,12,0.35,{cat:"Basic"}],["Pogo Stomp",5,"Mid",60,76,12,0,22,28,0.8,{dash:"in",cat:"Special"}],
    ["Spring Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Bounce Kick",10,"Near",30,86,8,0,8,15,0.4,{cat:"Hit",from:"Boing"}],["Rebound",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.2}],
    ["Jack Pop",20,"Near",46,82,8,10,15,26,0.6,{cast:1,status:["Daze",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Heel Slam",22,"Close",38,76,27,0,8,24,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Bounce Kick",share:["legs"]}],["Pogo Spike",24,"Close",36,74,28,0,0,24,0.7,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],
    ["Spring Kick",30,"Close",15,85,10,0,0,28,0.6,{hits:3,cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["legs"]}],["Triple Bounce",34,"Close",24,80,12,0,6,38,0.9,{hits:3,cat:"Special",err:"Static Plains",need:"pow",share:["legs"]}],["Ball Barrage",36,"Far",18,80,5,0,4,38,0.9,{cast:1,hits:4,cat:"Special",err:"Tanglewood"}],
    ["Mega Boing",40,"Mid",92,66,12,0,30,42,1.2,{dash:"in",cat:"Special",err:"Static Plains",need:"pow",after:"Bounce Shot"}]],
  /* the special Snabits */
  Eagle:[["Peck",1,"Close",24,92,10,0,4,9,0.2,{cat:"Basic"}],["Wing Slap",2,"Close",24,90,6,0,8,10,0.3,{cat:"Basic"}],["Swoop",3,"Near",32,85,10,0,8,14,0.4,{dash:"in",cat:"Hit"}],
    ["Talon Dive",5,"Close",62,80,18,0,18,28,0.7,{cat:"Special"}],["Dive",8,"Mid",30,85,10,0,8,16,0.4,{dash:"in",cat:"Hit",from:"Swoop"}],["Talon Swipe",10,"Near",30,86,10,0,6,15,0.4,{cat:"Hit",from:"Wing Slap"}],
    ["Wing Gust",14,"Mid",36,85,5,0,28,22,0.5,{cast:1,cat:"Hit"}],["Hawk Cry",17,"Mid",20,84,0,12,0,18,0.5,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd",status:["Dread",30]}],["Wing Smash",18,"Near",50,68,5,0,26,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Wing Gust",share:["wings"]}],
    ["Keen Sight",20,"Any",0,100,0,0,0,16,0.2,{buff:"unblink"}],["Talon Grab",21,"Close",52,68,8,0,0,30,0.8,{hold:1.0,cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["claws"]}],["Talon Rake",22,"Near",38,78,28,0,0,24,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Talon Swipe",share:["claws"]}],
    ["Circle Back",24,"Mid",36,74,26,0,0,26,0.75,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow"}],["Razor Feather",26,"Far",28,76,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Static Plains",need:"mnd"}],["Feather Volley",30,"Far",18,85,8,0,0,28,0.6,{cast:1,hits:3,cat:"Heavy",err:"Static Plains",need:"mnd"}],
    ["Beak Barrage",32,"Close",14,82,10,0,0,38,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",need:"pow",share:["beak"]}],["Rock Drop",34,"Mid",78,70,10,0,20,38,1.0,{cat:"Special",err:"Granite Steps",need:"pow"}],["Sky Strike",40,"Far",88,70,15,0,20,40,1.0,{dash:"in",cat:"Special",err:"Dawn Temple",need:"pow",after:"Dive"}]],
  Vampire:[["Nip",1,"Close",22,92,8,0,0,9,0.2,{drain:0.3,cat:"Basic"}],["Cape Flick",2,"Close",22,90,5,0,6,10,0.25,{cat:"Basic"}],["Bat Swarm",3,"Mid",26,85,5,0,0,14,0.4,{cast:1,cat:"Hit"}],
    ["Night Bite",5,"Near",50,85,10,0,6,26,0.6,{drain:0.5,dash:"in",cat:"Special"}],["Twin Nip",7,"Close",15,86,6,0,0,15,0.4,{hits:2,drain:0.25,cat:"Hit",from:"Nip"}],["Mist Step",8,"Close",12,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Wing Flap",10,"Near",24,88,0,0,10,12,0.35,{cat:"Basic"}],["Shadow Bolt",11,"Mid",30,86,5,0,0,16,0.45,{cast:1,cat:"Hit",from:"Bat Swarm"}],["Hypnotic Gaze",14,"Mid",18,85,0,12,0,20,0.5,{cast:1,status:["Daze",40],cat:"Withering",err:"Dream Garden",need:"mnd"}],
    ["Fang Strike",18,"Close",38,76,27,0,0,22,0.65,{drain:0.2,cat:"Sharp",err:"Saffron Dojo",need:"pow",share:["fangs"]}],["Swamp Mist",19,"Mid",50,70,5,0,6,26,0.75,{cast:1,cat:"Heavy",err:"Nightshade Marsh",need:"mnd",status:["Poison",25]}],["Cloak",20,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],
    ["Wing Slash",21,"Near",36,76,26,0,0,22,0.65,{cat:"Sharp",err:"Saffron Dojo",need:"pow",share:["wings"]}],["Blood Drain",23,"Mid",66,76,5,0,0,38,0.9,{cast:1,drain:0.4,cat:"Special",err:"Hollow Moor",need:"mnd",after:"Shadow Bolt"}],["Moon Beam",24,"Far",32,76,26,0,0,22,0.65,{cast:1,cat:"Sharp",err:"Dream Garden",need:"mnd"}],
    ["Wing Wrap",26,"Close",50,68,5,0,8,28,0.8,{hold:1.0,cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["wings"]}],["Plague Bats",28,"Far",16,80,5,0,0,38,0.9,{cast:1,hits:4,cat:"Special",err:"Nightshade Marsh",need:"mnd",status:["Poison",35]}],["Blood Moon",30,"Far",62,75,8,8,0,32,0.9,{cast:1,drain:0.3,cat:"Heavy",err:"Hollow Moor",need:"mnd"}],
    ["Nightmare",33,"Mid",74,72,5,6,0,38,1.0,{cast:1,cat:"Special",err:"Dream Garden",need:"mnd",after:"Hypnotic Gaze",status:["Dread",30]}],["Bat Dive",35,"Mid",76,70,8,0,16,38,1.0,{dash:"in",cat:"Special",err:"Static Plains",need:"pow"}],["Crimson Feast",40,"Close",80,75,12,0,10,40,1.0,{drain:0.6,cat:"Special",err:"Hollow Moor",need:"pow",after:"Twin Nip",share:["fangs"]}]],
  Phoenix:[["Ember Peck",1,"Close",24,90,8,0,4,9,0.2,{status:["Burn",15],cat:"Basic"}],["Flame Wing",3,"Near",32,85,8,0,10,14,0.4,{cat:"Hit",from:"Ember Peck"}],["Sun Flare",5,"Mid",54,80,8,0,0,26,0.7,{cast:1,status:["Burn",35],cat:"Special"}],
    ["Blaze Swap",8,"Close",12,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Warm Glow",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Fire Ring",20,"Near",44,80,8,0,20,24,0.5,{cast:1,cat:"Heavy",err:"Cinder Peak",after:"Flame Wing",need:"mnd"}],
    ["Heat Haze",22,"Mid",20,78,0,10,0,20,0.5,{cast:1,status:["Blind",25],cat:"Withering",err:"Cinder Peak",need:"mnd"}],["Feather Slash",24,"Mid",36,76,26,0,6,22,0.7,{dash:"in",cat:"Sharp",err:"Static Plains",after:"Flame Wing",share:["wings"]}],["Ash Storm",30,"Far",20,80,5,0,0,30,0.7,{cast:1,hits:3,status:["Blind",20],cat:"Special",err:"Hollow Moor",after:"Heat Haze",share:["wings"]}],
    ["Supernova",40,"Far",92,70,10,0,15,42,1.1,{cast:1,cat:"Special",err:"Dawn Temple",after:"Sun Flare"}]],
  Kitsune:[["Fox Swipe",1,"Close",22,92,10,0,4,9,0.2,{cat:"Basic"}],["Quick Bite",2,"Close",24,90,8,0,2,9,0.25,{cat:"Basic"}],["Foxfire",3,"Mid",18,90,5,0,0,16,0.5,{cast:1,hits:3,status:["Daze",20],cat:"Hit"}],
    ["Tail Tap",4,"Near",22,88,5,0,6,11,0.3,{cat:"Basic"}],["Trick Step",5,"Close",14,90,5,0,0,12,0.2,{step:-26,cast:1,cat:"Special"}],["Tail Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Snap Bite",9,"Mid",30,84,8,0,6,16,0.4,{dash:"in",cat:"Hit",from:"Quick Bite"}],["Wisp Throw",12,"Far",24,88,5,0,0,17,0.4,{cast:1,cat:"Hit",from:"Foxfire"}],["Mirage",14,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],
    ["Tail Tickle",16,"Close",20,82,0,9,0,16,0.4,{status:["Daze",20],cat:"Withering",err:"Dream Garden"}],["Sparkle Dust",18,"Near",22,80,0,10,0,18,0.5,{cast:1,status:["Blind",30],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Cursed Bite",19,"Close",24,78,0,12,0,20,0.5,{status:["Curse",20],cat:"Withering",err:"Hollow Moor",share:["fangs"]}],
    ["Spirit Lantern",20,"Far",46,85,5,10,0,24,0.6,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Tail Slam",22,"Close",50,70,5,0,20,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Tail Tap",share:["tail"]}],["Jaw Snap",23,"Near",36,76,26,0,0,22,0.6,{cat:"Sharp",err:"Hollow Moor",share:["fangs"]}],
    ["Tail Cut",25,"Near",38,76,28,0,0,22,0.7,{cat:"Sharp",err:"Static Plains",need:"pow"}],["Pounce",26,"Mid",52,68,8,0,14,30,0.8,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow"}],["Wind Slice",28,"Mid",34,78,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Static Plains",need:"mnd"}],
    ["Big Bite",29,"Mid",58,66,10,0,12,32,0.9,{dash:"in",cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Snap Bite"}],["Nine Tails",30,"Near",14,85,8,0,0,30,0.7,{hits:5,cat:"Special",err:"Saffron Dojo",share:["tail"]}],["Fireball",32,"Far",46,66,5,0,12,30,0.9,{cast:1,cat:"Heavy",err:"Cinder Peak"}],
    ["Kitsunebi",40,"Far",86,75,10,8,0,40,1.0,{cast:1,status:["Daze",30],cat:"Special",err:"Cinder Peak",after:"Wisp Throw",need:"mnd"}]],
  Naga:[["Fang",1,"Close",26,90,8,0,4,10,0.25,{cat:"Basic"}],["Tail Whip",3,"Mid",26,85,5,0,-20,14,0.4,{cat:"Hit"}],["Venom Coil",5,"Close",44,85,8,0,0,24,0.6,{status:["Poison",50],hold:1.2,cat:"Special"}],
    ["Slither Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Snake Bite",10,"Near",32,84,8,0,6,15,0.4,{dash:"in",cat:"Hit",from:"Fang"}],["Hood Flare",14,"Mid",14,90,0,14,0,18,0.4,{cast:1,status:["Dread",35],cat:"Withering",err:"Hollow Moor",need:"mnd"}],
    ["Shed Skin",20,"Any",0,100,0,0,0,20,0.3,{support:1,cleanse:1,heal:0.1}],["Tail Crack",24,"Mid",36,76,26,0,6,22,0.7,{cat:"Sharp",err:"Saffron Dojo",after:"Tail Whip",share:["tail"]}],["Coil Crush",26,"Near",54,68,5,0,18,30,0.9,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Venom Coil",share:["tail"]}],
    ["Acid Spit",30,"Far",56,80,8,0,0,30,0.8,{cast:1,status:["Poison",40],cat:"Heavy",err:"Nightshade Marsh",share:["mouth"]}],["Venom Dart",34,"Far",34,74,26,0,0,26,0.7,{cast:1,status:["Poison",30],cat:"Sharp",err:"Nightshade Marsh"}],["Serpent King",40,"Close",88,70,12,0,25,40,1.0,{cat:"Special",err:"Saffron Dojo",need:"pow",after:"Snake Bite"}]],
  Yeti:[["Snow Paw",1,"Close",28,88,8,0,10,10,0.3,{cat:"Basic"}],["Snowball",3,"Mid",26,88,5,0,8,14,0.4,{cast:1,cat:"Hit"}],["Avalanche",5,"Close",66,75,10,0,22,30,0.9,{status:["Freeze",25],cat:"Special"}],
    ["Big Toss",8,"Close",16,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],["Double Fist",10,"Close",16,86,6,0,4,16,0.4,{hits:2,cat:"Hit",from:"Snow Paw"}],["Frost Breath",14,"Near",34,85,5,0,0,22,0.5,{cast:1,status:["Freeze",20],cat:"Hit",from:"Snowball"}],
    ["Thick Coat",20,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Scary Roar",22,"Near",20,80,0,10,0,20,0.5,{cast:1,status:["Dread",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Foot Slam",24,"Near",52,68,5,0,16,30,0.9,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Double Fist",share:["legs"]}],
    ["Ice Shards",26,"Mid",36,76,26,0,6,24,0.7,{cast:1,cat:"Sharp",err:"Glacier Rim",share:["arms"]}],["Glacier Slam",30,"Mid",62,75,10,0,20,34,0.9,{dash:"in",cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["arms"]}],["Blizzard Roar",40,"Far",84,70,8,10,15,42,1.1,{cast:1,status:["Freeze",25],cat:"Special",err:"Glacier Rim",after:"Frost Breath",need:"mnd"}]],
  Kraken:[["Tentacle Slap",1,"Near",26,88,8,0,8,10,0.3,{cat:"Basic"}],["Sucker Poke",2,"Close",24,90,8,0,2,9,0.25,{cat:"Basic"}],["Ink Cloud",3,"Mid",20,90,0,0,0,14,0.4,{cast:1,status:["Blind",35],cat:"Hit"}],
    ["Crushing Grip",5,"Close",44,80,8,0,0,26,0.6,{hold:1.5,cat:"Special"}],["Arm Whip",6,"Near",28,86,6,0,6,12,0.35,{cat:"Basic",from:"Sucker Poke"}],["Deep Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Tentacle Grab",10,"Near",28,84,5,0,-10,16,0.4,{cat:"Hit",from:"Tentacle Slap"}],["Reach",14,"Mid",34,85,5,0,-25,20,0.5,{cat:"Hit"}],["Ink Spray",18,"Mid",20,80,0,9,0,18,0.5,{cast:1,status:["Blind",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],
    ["Drench",19,"Mid",20,82,0,10,0,18,0.5,{cast:1,status:["Soak",30],cat:"Withering",err:"Coral Shallows",need:"mnd"}],["Whirlpool",20,"Mid",40,80,5,0,0,26,0.6,{cast:1,slow:3,cat:"Heavy",err:"Coral Shallows",need:"mnd"}],["Tight Squeeze",22,"Near",52,68,0,0,6,30,0.9,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Tentacle Grab",share:["tentacles"]}],
    ["Water Spout",24,"Far",46,66,5,0,18,30,0.9,{cast:1,cat:"Heavy",err:"Coral Shallows"}],["Jet Jab",25,"Close",36,78,28,0,6,20,0.6,{dash:"in",cat:"Sharp",err:"Coral Shallows"}],["Ink Needle",26,"Mid",34,76,25,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Nightshade Marsh",after:"Ink Cloud",need:"mnd"}],
    ["Arm Smash",28,"Near",54,66,5,0,20,30,0.9,{cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["tentacles"]}],["Eight Arms",30,"Near",14,85,8,0,0,30,0.6,{hits:5,cat:"Special",err:"Saffron Dojo",after:"Arm Whip",share:["tentacles"]}],["Big Wave",34,"Far",62,70,5,0,15,38,1.0,{cast:1,cat:"Special",err:"Coral Shallows"}],
    ["Drag Under",36,"Far",64,70,8,0,-20,38,1.0,{cat:"Special",err:"Hollow Moor",share:["tentacles"]}],["Deep Vortex",40,"Far",94,65,12,0,20,42,1.2,{cast:1,cat:"Special",err:"Hollow Moor",after:"Whirlpool",need:"mnd"}]],
  Golem:[["Rock Fist",1,"Close",28,85,8,0,10,10,0.35,{cat:"Basic"}],["Pebble Toss",3,"Mid",26,85,5,0,6,14,0.45,{cat:"Basic"}],["Slab Slap",4,"Near",30,85,6,0,8,15,0.4,{cat:"Hit"}],
    ["Boulder Smash",5,"Close",70,68,12,0,25,32,0.9,{cat:"Special"}],["Twin Fists",6,"Close",16,84,6,0,4,16,0.4,{hits:2,cat:"Hit",from:"Rock Fist"}],["Heave",8,"Close",16,80,0,0,0,12,0.35,{swap:1,cat:"Basic"}],
    ["Rock Charge",10,"Mid",30,80,5,0,14,17,0.45,{dash:"in",cat:"Hit",from:"Slab Slap"}],["Stone Wall",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Grit Cloud",16,"Mid",20,84,0,10,0,16,0.45,{status:["Blind",25],cat:"Withering",err:"Granite Steps"}],
    ["Rock Chop",17,"Near",38,76,27,0,0,22,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow"}],["Stone Hug",18,"Close",24,80,0,12,0,20,0.5,{hold:2,cat:"Withering",err:"Saffron Dojo",need:"pow"}],["Rock Uppercut",19,"Close",54,68,5,0,12,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["arms"]}],
    ["Tremor",20,"Mid",40,80,5,0,10,26,0.7,{slow:2,cat:"Heavy",err:"Granite Steps",need:"pow"}],["Flint Kick",22,"Close",36,76,28,0,6,22,0.65,{cat:"Sharp",err:"Granite Steps",need:"pow",share:["legs"]}],["Shard Throw",24,"Far",26,76,28,0,0,24,0.7,{cat:"Sharp",err:"Granite Steps",need:"pow"}],
    ["Anvil Drop",26,"Close",58,66,5,0,14,30,0.9,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Rock Charge"}],["Pick Strike",28,"Near",38,76,28,0,0,24,0.7,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],["Rune Pulse",30,"Far",58,75,8,10,0,32,0.9,{cast:1,cat:"Heavy",err:"Dawn Temple",need:"mnd"}],
    ["Rune Drain",32,"Mid",20,82,0,12,0,20,0.5,{cast:1,cat:"Withering",err:"Dream Garden",need:"mnd"}],["Fist Barrage",34,"Close",15,84,8,0,0,38,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Twin Fists",share:["arms"]}],["Fist Launch",36,"Far",66,70,8,0,12,38,1.0,{cat:"Special",err:"Iron Foundry",need:"pow",share:["arms"]}],
    ["Mountain Fall",40,"Mid",92,68,12,0,30,44,1.2,{dash:"in",cat:"Special",err:"Granite Steps",need:"pow",after:"Tremor"}]],
  Unicorn:[["Horn Jab",1,"Close",24,90,10,0,6,9,0.25,{cat:"Basic"}],["Back Kick",2,"Close",26,86,8,0,8,12,0.35,{cat:"Basic"}],["Gallop",3,"Mid",30,85,8,0,10,14,0.4,{dash:"in",cat:"Hit",from:"Back Kick"}],
    ["Prism Beam",5,"Far",50,85,8,0,0,26,0.7,{cast:1,status:["Blind",25],cat:"Special"}],["Triple Jab",6,"Close",12,90,8,0,0,17,0.4,{hits:3,cat:"Hit",from:"Horn Jab"}],["Hoof Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Mending Light",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.22,cleanse:1}],["Horn Slash",16,"Near",36,78,26,0,0,20,0.65,{cat:"Sharp",err:"Saffron Dojo",need:"pow",share:["horn"]}],["Sleepy Song",17,"Mid",18,84,0,10,0,16,0.5,{cast:1,status:["Daze",30],cat:"Withering",err:"Dream Garden",need:"mnd"}],
    ["Hoof Smash",18,"Close",52,68,5,0,14,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["legs"]}],["Starlight",20,"Mid",18,85,5,0,0,24,0.6,{cast:1,hits:3,cat:"Heavy",err:"Dawn Temple",need:"mnd"}],["Horn Glow",22,"Mid",22,84,0,10,0,18,0.5,{cast:1,cat:"Withering",err:"Dawn Temple",need:"mnd"}],
    ["Spiral Thrust",24,"Mid",38,76,28,0,0,24,0.7,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow",after:"Triple Jab",share:["horn"]}],["Sparkle Cloud",26,"Mid",20,84,0,10,0,18,0.5,{cast:1,status:["Blind",25],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Rainbow Charge",30,"Mid",66,75,10,0,20,34,0.9,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",after:"Gallop"}],
    ["Hoof Storm",34,"Close",14,82,8,0,0,38,1.0,{hits:5,cat:"Special",err:"Static Plains",need:"pow",share:["legs"]}],["Wish",40,"Far",92,70,12,0,10,42,1.2,{cast:1,cat:"Special",err:"Dawn Temple",need:"mnd",after:"Starlight"}]],
  Jack:[["Vine Slap",1,"Near",24,88,8,0,6,10,0.3,{cat:"Basic"}],["Candle Flick",3,"Mid",28,88,5,0,0,14,0.4,{cast:1,status:["Burn",20],cat:"Hit",from:"Vine Slap"}],["Spooky Grin",5,"Mid",16,85,0,15,20,20,0.5,{cast:1,status:["Dread",35],cat:"Special"}],
    ["Patch Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Lantern Glow",14,"Any",0,100,0,0,0,20,0.3,{support:1,heal:0.18}],["Pip Spit",20,"Far",16,85,5,0,0,24,0.6,{cast:1,hits:3,cat:"Heavy",err:"Tanglewood",need:"mnd",share:["mouth"]}],
    ["Hollow Howl",30,"Near",56,75,8,10,25,32,0.8,{cast:1,cat:"Heavy",err:"Hollow Moor",need:"mnd",after:"Pip Spit",share:["mouth"]}],["Pumpkin Bomb",40,"Mid",94,65,12,0,25,42,1.2,{cast:1,status:["Burn",30],cat:"Special",err:"Cinder Peak",need:"mnd",after:"Candle Flick"}]],
  // the specials of 16 Nov 2026
  Tengu:[["Nose Poke",1,"Close",24,90,10,0,6,9,0.25,{cat:"Basic"}],["Staff Whack",2,"Close",30,85,8,0,8,15,0.4,{cat:"Hit",from:"Nose Poke"}],["Fan Gust",3,"Mid",22,90,5,0,24,14,0.4,{cast:1,cat:"Basic"}],
    ["Breeze Cut",4,"Near",30,86,8,0,6,15,0.4,{cast:1,cat:"Hit",from:"Fan Gust"}],["Gale Fan",5,"Mid",48,85,8,0,30,26,0.7,{cast:1,cat:"Special"}],["Skip Kick",7,"Mid",32,82,6,0,10,16,0.45,{dash:"in",cat:"Hit"}],
    ["Feather Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Wing Shove",10,"Near",30,86,6,0,14,16,0.4,{cat:"Hit",from:"Skip Kick"}],["Fan Parry",14,"Close",0,100,0,0,0,18,0.1,{buff:"riposte"}],
    ["Staff Smash",16,"Close",54,68,5,0,14,28,0.85,{cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["arms"]}],["Leaf Cut",17,"Mid",30,78,26,0,0,20,0.6,{cast:1,cat:"Sharp",err:"Tanglewood",need:"mnd"}],["Dust Whirl",18,"Mid",20,84,0,10,0,16,0.45,{cast:1,status:["Blind",25],cat:"Withering",err:"Granite Steps",need:"mnd"}],
    ["Mountain Wind",20,"Far",40,80,5,0,20,26,0.6,{cast:1,cat:"Heavy",err:"Granite Steps",need:"mnd",after:"Breeze Cut"}],["Fan Slash",21,"Near",36,78,27,0,0,22,0.65,{cast:1,cat:"Sharp",err:"Static Plains",need:"mnd"}],["Whirlwind",22,"Near",50,70,5,0,20,28,0.8,{cast:1,cat:"Heavy",err:"Static Plains",need:"mnd"}],
    ["Spirit Chill",24,"Mid",20,82,0,12,0,18,0.5,{cast:1,status:["Dread",30],cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Staff Flurry",26,"Close",14,84,8,0,0,38,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Staff Whack",share:["arms"]}],["Hurricane Kick",28,"Close",18,80,8,0,0,38,1.0,{hits:4,cat:"Special",err:"Saffron Dojo",need:"pow",share:["legs"]}],
    ["Diving Kick",30,"Mid",64,75,10,0,15,34,0.9,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",after:"Skip Kick"}],["Leaf Swirl",32,"Far",16,80,8,0,0,38,1.0,{cast:1,hits:4,cat:"Special",err:"Tanglewood",need:"mnd"}],["Wing Flurry",34,"Near",18,78,10,0,8,38,1.0,{hits:4,cat:"Special",err:"Static Plains",need:"pow",after:"Wing Shove",share:["wings"]}],
    ["Great Tempest",40,"Far",88,70,10,0,30,42,1.2,{cast:1,cat:"Special",err:"Static Plains",need:"mnd"}]],
  Tanuki:[["Belly Bump",1,"Close",26,88,8,0,10,10,0.3,{cat:"Basic"}],["Tail Bop",2,"Near",24,88,8,0,6,11,0.3,{cat:"Basic"}],["Leaf Toss",3,"Mid",22,88,5,0,0,14,0.4,{cast:1,status:["Daze",20],cat:"Basic"}],
    ["Belly Drum",5,"Close",62,78,10,0,22,28,0.8,{status:["Daze",25],cat:"Special"}],["Double Bump",6,"Close",16,86,6,0,6,16,0.4,{hits:2,cat:"Hit",from:"Belly Bump"}],["Hat Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Rolling Bump",10,"Near",32,80,6,0,10,16,0.45,{dash:"in",cat:"Hit",from:"Tail Bop"}],["Leaf Flurry",12,"Mid",10,88,4,0,0,17,0.45,{cast:1,hits:3,cat:"Hit",from:"Leaf Toss"}],["Decoy",14,"Any",0,100,0,0,0,18,0.2,{buff:"phase"}],
    ["Leaf Snip",15,"Mid",30,78,26,0,0,20,0.6,{cast:1,cat:"Sharp",err:"Tanglewood",need:"mnd"}],["Tail Tease",16,"Close",20,86,0,10,0,16,0.4,{status:["Daze",25],cat:"Withering",err:"Dream Garden",share:["tail"]}],["Belly Press",18,"Close",52,68,5,0,14,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow"}],
    ["Straw Hat Toss",20,"Mid",40,82,8,0,0,24,0.6,{cat:"Heavy",err:"Tanglewood",need:"pow"}],["Fog Trick",22,"Mid",20,84,0,10,0,16,0.45,{cast:1,status:["Blind",30],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Spin Roll",24,"Near",36,76,26,0,8,22,0.65,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow",share:["round"]}],
    ["Belly Roll",26,"Far",46,66,5,0,16,30,0.9,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",after:"Rolling Bump",share:["round"]}],["Gourd Swig",30,"Any",0,100,0,0,0,24,0.4,{support:1,heal:0.2}],["Belly Barrage",32,"Close",14,82,8,0,0,38,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Double Bump",share:["round"]}],
    ["Leaf Parade",34,"Far",16,80,8,0,0,38,1.0,{cast:1,hits:4,cat:"Special",err:"Dream Garden",need:"mnd",after:"Leaf Flurry"}],["Big Belly Slam",40,"Close",92,68,12,0,30,42,1.1,{cat:"Special",err:"Granite Steps",need:"pow"}]],
  Mermaid:[["Tail Flick",1,"Near",24,88,8,0,8,10,0.3,{cat:"Basic"}],["Pearl Shot",3,"Mid",26,88,5,0,0,14,0.4,{cast:1,cat:"Hit"}],["Siren Song",5,"Mid",30,85,0,12,0,24,0.6,{cast:1,status:["Daze",40],cat:"Special"}],
    ["Tide Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Tail Sweep",10,"Near",30,82,6,0,10,15,0.4,{cat:"Hit",from:"Tail Flick"}],["Salt Spray",12,"Close",20,82,0,9,0,16,0.4,{status:["Blind",25],cat:"Withering",err:"Coral Shallows"}],
    ["Shell Ward",14,"Any",0,100,0,0,0,18,0.2,{buff:"bubble"}],["Tide Blade",16,"Near",36,78,26,0,0,20,0.6,{cast:1,cat:"Sharp",err:"Coral Shallows",need:"mnd"}],["Drowsy Hum",18,"Near",20,80,0,10,0,18,0.5,{cast:1,status:["Daze",30],cat:"Withering",err:"Dream Garden",need:"mnd"}],
    ["Rip Current",20,"Mid",40,80,5,0,-20,26,0.6,{cast:1,cat:"Hit",from:"Tide Swap"}],["Bubble Trap",22,"Near",22,78,0,8,0,20,0.5,{cast:1,status:["Soak",40],cat:"Withering",err:"Coral Shallows",need:"mnd"}],["Pearl Dart",24,"Mid",38,76,26,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Dawn Temple",after:"Pearl Shot"}],
    ["Tail Hammer",26,"Mid",54,66,5,0,18,30,0.9,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow",share:["tail"]}],["Tide Whirl",28,"Mid",70,78,5,0,0,38,1.0,{cast:1,status:["Soak",40],cat:"Special",err:"Coral Shallows",need:"mnd",after:"Rip Current"}],["Fin Slap",30,"Near",62,78,10,0,20,32,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Tail Sweep",share:["tail"]}],
    ["Shrill Note",32,"Far",34,76,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Dream Garden",need:"mnd"}],["Tide Cutter",34,"Far",34,74,28,0,0,26,0.7,{cast:1,cat:"Sharp",err:"Coral Shallows",need:"mnd"}],["Pearl Barrage",36,"Far",14,80,5,0,0,38,1.0,{hits:5,cast:1,cat:"Special",err:"Dawn Temple",need:"mnd",after:"Pearl Dart",share:["arms"]}],
    ["Swell Crash",38,"Far",66,68,5,0,22,40,1.1,{cast:1,cat:"Special",err:"Coral Shallows",need:"mnd"}],["Tidal Aria",40,"Far",88,70,10,10,15,42,1.2,{cast:1,status:["Daze",25],cat:"Special",err:"Coral Shallows",need:"mnd",after:"Siren Song"}],["Sea Hymn",42,"Far",64,72,5,0,0,40,1.1,{cast:1,status:["Blind",30],cat:"Special",err:"Dawn Temple",need:"mnd"}]],
  Diwata:[["Petal Pat",1,"Near",22,90,8,0,6,9,0.25,{cat:"Basic"}],["Petal Clap",2,"Close",24,88,6,0,8,10,0.3,{cat:"Basic"}],["Pollen Puff",3,"Mid",22,90,5,0,0,14,0.4,{cast:1,status:["Daze",20],cat:"Hit"}],
    ["Stick Poke",4,"Close",26,88,10,0,4,11,0.3,{cat:"Basic"}],["Petal Storm",5,"Mid",18,88,5,0,0,24,0.6,{cast:1,hits:3,cat:"Special"}],["Flutter Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Vine Lash",10,"Near",30,84,6,0,6,15,0.4,{cat:"Hit",from:"Petal Pat"}],["Seed Spit",12,"Mid",28,86,6,0,0,16,0.4,{cast:1,cat:"Hit",from:"Pollen Puff"}],["Nectar",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],
    ["Leaf Cutter",16,"Far",34,76,28,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Tanglewood",need:"mnd"}],["Sleep Dust",18,"Mid",20,82,0,10,0,18,0.5,{cast:1,status:["Daze",35],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Thorn Whip",20,"Near",44,82,8,0,0,24,0.6,{slow:2,cat:"Heavy",err:"Tanglewood",need:"pow",after:"Vine Lash",share:["arms"]}],
    ["Thorn Burst",22,"Near",20,80,8,0,0,36,0.8,{hits:3,cat:"Special",err:"Tanglewood",need:"pow"}],["Glow Ray",24,"Far",36,74,28,0,0,26,0.7,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd"}],["Wing Whirl",26,"Near",16,80,8,0,0,38,0.8,{hits:4,cat:"Special",err:"Dawn Temple",after:"Petal Clap",share:["wings"]}],
    ["Sap Drain",28,"Mid",62,76,5,0,0,40,1.0,{cast:1,drain:0.5,cat:"Special",err:"Nightshade Marsh",need:"mnd"}],["Thorn Dart",29,"Far",34,74,28,0,0,26,0.7,{cat:"Sharp",err:"Tanglewood",need:"pow",share:["arms"]}],["Fairy Lights",30,"Far",56,80,8,0,0,30,0.8,{cast:1,status:["Blind",25],cat:"Heavy",err:"Dawn Temple",need:"mnd"}],
    ["Forest Curse",34,"Near",62,72,5,0,0,38,1.0,{cast:1,status:["Curse",40],cat:"Special",err:"Hollow Moor",need:"mnd"}],["Blossom Blast",36,"Far",48,66,5,0,12,32,0.9,{cast:1,cat:"Heavy",err:"Dream Garden",need:"mnd",after:"Seed Spit"}],["Grove Bloom",40,"Far",88,70,10,8,10,42,1.2,{cast:1,cat:"Special",err:"Tanglewood",need:"mnd",after:"Petal Storm"}]],
  Sphinx:[["Paw Swipe",1,"Close",26,88,10,0,6,10,0.3,{cat:"Basic"}],["Lion Leap",3,"Mid",30,85,8,0,10,14,0.4,{dash:"in",cat:"Hit",from:"Paw Swipe"}],["Puzzle Gaze",5,"Mid",24,90,0,18,0,24,0.6,{cast:1,status:["Daze",35],cat:"Special"}],
    ["Sand Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic",from:"Paw Swipe"}],["Sand Puff",12,"Close",18,80,0,9,0,16,0.4,{status:["Blind",30],cat:"Withering",err:"Granite Steps",after:"Sand Swap"}],["Guardian Pose",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],
    ["Claw Crush",16,"Near",50,68,5,0,10,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["claws"]}],["Desert Roar",20,"Near",40,82,5,10,20,26,0.6,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Pounce Slash",24,"Mid",38,75,27,0,0,24,0.7,{dash:"in",cat:"Sharp",err:"Saffron Dojo",need:"pow",share:["claws"]}],
    ["Sun Ray",26,"Far",34,74,28,0,0,26,0.7,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd"}],["Sun Disc",30,"Far",58,78,8,0,0,32,0.9,{cast:1,cat:"Heavy",err:"Dawn Temple",need:"mnd"}],["Great Pounce",40,"Mid",92,68,12,0,25,42,1.2,{dash:"in",cat:"Special",err:"Saffron Dojo",need:"pow",after:"Lion Leap",share:["legs"]}]],
  Garuda:[["Crown Peck",1,"Close",24,90,10,0,4,9,0.25,{cat:"Basic"}],["Wing Rush",3,"Mid",30,85,8,0,10,14,0.4,{dash:"in",cat:"Hit",from:"Crown Peck"}],["Garuda Dive",5,"Far",56,85,10,0,15,28,0.8,{dash:"in",status:["Burn",25],cat:"Special"}],
    ["Gold Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic",from:"Crown Peck"}],["Sun Crown",14,"Any",0,100,0,0,0,18,0.2,{buff:"unblink"}],["Feather Storm",20,"Far",18,85,8,0,0,26,0.6,{cast:1,hits:3,cat:"Special",err:"Dawn Temple",need:"mnd",share:["wings"]}],
    ["Sky Gale",24,"Mid",22,80,0,10,12,20,0.5,{cast:1,cat:"Withering",err:"Static Plains",need:"mnd"}],["Talon Slash",26,"Near",38,78,28,0,0,22,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Gold Swap",share:["claws"]}],["Serpent Snatch",30,"Near",60,78,10,0,0,32,0.8,{hold:1.2,cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Wing Rush",share:["claws"]}],
    ["Heaven Dive",40,"Far",92,70,12,0,25,42,1.2,{dash:"in",cat:"Special",err:"Cinder Peak",need:"pow",after:"Garuda Dive"}]],
  Werewolf:[["Wolf Claw",1,"Close",26,88,10,0,4,10,0.3,{cat:"Basic"}],["Moon Howl",3,"Mid",16,90,0,12,0,14,0.4,{cast:1,status:["Dread",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],["Feral Slash",5,"Close",64,80,15,0,10,28,0.7,{status:["Crack",25],cat:"Special"}],
    ["Pack Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Wolf Bite",10,"Close",32,84,8,0,6,16,0.4,{cat:"Hit",from:"Wolf Claw"}],["Thick Pelt",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],
    ["Rabid Bite",16,"Close",22,78,0,10,0,20,0.5,{status:["Poison",35],cat:"Withering",err:"Nightshade Marsh",share:["fangs"]}],["Lunar Leap",20,"Mid",44,80,8,0,10,24,0.6,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow"}],["Moon Slash",24,"Mid",38,76,27,0,0,24,0.7,{cast:1,cat:"Sharp",err:"Dawn Temple",need:"mnd"}],
    ["Claw Smash",26,"Near",54,68,5,0,14,30,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Wolf Claw",share:["claws"]}],["Fang Frenzy",30,"Close",16,82,10,0,0,32,0.7,{hits:4,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Wolf Bite",share:["fangs"]}],["Midnight Maul",40,"Close",92,70,15,0,20,42,1.1,{cat:"Special",err:"Hollow Moor",need:"pow",after:"Feral Slash"}]],
  Minotaur:[["Horn Butt",1,"Close",28,86,8,0,12,10,0.3,{cat:"Basic"}],["Shoulder Barge",2,"Near",22,88,5,0,10,11,0.3,{dash:"in",cat:"Basic"}],["Hoof Stamp",3,"Near",30,85,5,0,6,14,0.4,{cat:"Hit"}],
    ["Bull Rush",5,"Mid",58,78,10,0,30,28,0.8,{dash:"in",cat:"Special"}],["Maze Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Horn Flurry",9,"Near",12,86,8,0,2,16,0.4,{hits:3,cat:"Hit",from:"Horn Butt"}],
    ["Dash Chop",10,"Mid",28,86,8,0,6,17,0.4,{dash:"in",cat:"Basic"}],["Head Charge",12,"Mid",30,90,5,0,16,16,0.4,{dash:"in",cat:"Hit",from:"Shoulder Barge"}],["Snort",14,"Any",0,90,0,0,0,16,0.3,{support:1,lower:{pow:1}}],
    ["Hoof Dust",16,"Mid",24,90,0,0,0,15,0.4,{status:["Blind",25],cat:"Hit",from:"Hoof Stamp"}],["Bellow",18,"Far",24,92,5,0,18,18,0.4,{cast:1,cat:"Hit"}],["Axe Swing",20,"Near",50,80,10,0,15,26,0.6,{cat:"Heavy",err:"Saffron Dojo",need:"pow"}],
    ["Hoof Rush",22,"Near",20,70,5,0,8,26,0.7,{hits:3,cat:"Heavy",err:"Granite Steps",after:"Hoof Stamp",need:"pow",share:["legs"]}],["Head Smash",24,"Close",56,68,5,0,14,30,0.8,{cat:"Heavy",err:"Granite Steps",after:"Horn Flurry",need:"pow",share:["horn"]}],["Quick Chop",25,"Close",36,78,26,0,0,20,0.6,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],
    ["Spin Chop",26,"Close",52,68,10,0,12,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow"}],["Leaping Gore",27,"Mid",38,74,26,0,6,24,0.7,{dash:"in",cat:"Sharp",err:"Saffron Dojo",need:"pow"}],["Axe Throw",28,"Far",36,72,26,0,0,26,0.8,{cat:"Sharp",err:"Iron Foundry",need:"pow",share:["arms"]}],
    ["Labyrinth Charge",30,"Far",66,72,10,0,25,34,0.9,{dash:"in",cat:"Heavy",err:"Hollow Moor",need:"pow",after:"Head Charge"}],["Ground Shock",32,"Far",40,70,5,0,12,30,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Hoof Dust"}],["Axe Storm",34,"Near",20,80,15,0,2,38,1.0,{hits:4,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Axe Swing",share:["arms"]}],
    ["Great Axe",40,"Close",96,66,15,0,30,44,1.2,{cat:"Special",err:"Hollow Moor",need:"pow",after:"Axe Storm"}]],
  Dragon:[["Claw Rake",1,"Close",26,88,10,0,4,10,0.3,{cat:"Basic"}],["Tail Whack",2,"Close",24,88,5,0,4,10,0.3,{cat:"Basic"}],["Ember Breath",3,"Mid",26,88,5,0,0,14,0.4,{cast:1,status:["Burn",20],cat:"Hit"}],
    ["Wyrm Breath",5,"Mid",54,85,8,0,10,28,0.7,{cast:1,status:["Burn",35],cat:"Special"}],["Quick Claws",6,"Near",12,86,8,0,2,15,0.4,{hits:2,cat:"Basic",from:"Claw Rake"}],["Scale Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Wing Bash",9,"Near",30,86,5,0,10,15,0.4,{cat:"Hit"}],["Wing Beat",12,"Near",16,88,5,0,6,17,0.4,{hits:2,cat:"Hit",from:"Wing Bash"}],["Scale Guard",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],
    ["Tail Smash",20,"Near",46,80,8,0,20,24,0.6,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Tail Whack"}],["Scorch",22,"Mid",24,80,0,10,0,20,0.5,{cast:1,status:["Burn",30],cat:"Withering",err:"Cinder Peak",need:"mnd",after:"Ember Breath"}],["Spin Claw",24,"Near",38,76,27,0,6,24,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Quick Claws",share:["claws"]}],
    ["Earth Stomp",25,"Mid",54,66,5,0,18,30,0.9,{cat:"Heavy",err:"Granite Steps",need:"pow"}],["Sky Slam",26,"Far",50,66,5,0,20,30,0.9,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",after:"Wing Beat",share:["wings"]}],["Deep Bite",27,"Close",40,76,28,0,0,22,0.6,{cat:"Sharp",err:"Hollow Moor",need:"pow",share:["fangs"]}],
    ["Glide Strike",28,"Far",36,74,26,0,4,26,0.8,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow",share:["wings"]}],["Wing Buffet",30,"Mid",40,82,5,0,30,30,0.7,{cast:1,cat:"Hit"}],["Flame Stream",32,"Far",22,76,0,12,0,26,0.6,{cast:1,status:["Burn",35],cat:"Withering",err:"Cinder Peak",need:"mnd",after:"Scorch"}],
    ["Dragon Fury",40,"Far",94,68,12,0,20,44,1.2,{cast:1,status:["Burn",30],cat:"Special",err:"Cinder Peak",need:"mnd",after:"Flame Stream"}]],
  Thunderbird:[["Storm Peck",1,"Close",24,90,10,0,4,9,0.25,{cat:"Basic"}],["Static Feather",3,"Mid",24,88,5,0,0,14,0.4,{cast:1,status:["Shock",20],cat:"Hit",from:"Storm Peck"}],["Thunder Wing",5,"Far",54,85,8,0,10,28,0.7,{cast:1,status:["Shock",35],cat:"Special"}],
    ["Gale Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Rain Cloud",14,"Any",0,100,0,0,0,22,0.4,{support:1,regen:4}],["Wing Clap",20,"Near",42,82,5,0,25,24,0.6,{cast:1,cat:"Heavy",err:"Glacier Rim",need:"mnd",after:"Static Feather",share:["wings"]}],
    ["Storm Dive",24,"Mid",38,76,27,0,12,24,0.7,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow",after:"Storm Peck",share:["claws"]}],["Thunder Roll",26,"Mid",22,78,0,10,0,20,0.5,{cast:1,status:["Daze",25],cat:"Withering",err:"Static Plains",need:"mnd",after:"Static Feather"}],["Chain Bolt",30,"Far",18,82,8,0,0,30,0.7,{cast:1,hits:3,status:["Shock",15],cat:"Heavy",err:"Iron Foundry",need:"mnd",after:"Static Feather",share:["wings"]}],
    ["Storm Bringer",40,"Far",94,68,12,0,20,44,1.2,{cast:1,cat:"Special",err:"Dawn Temple",need:"mnd",after:"Chain Bolt"}]],
  Hydra:[["Twin Fang",1,"Close",14,90,8,0,4,10,0.3,{hits:2,cat:"Basic"}],["Bog Spit",3,"Mid",24,88,5,0,0,14,0.4,{cast:1,status:["Poison",30],cat:"Hit"}],["Many Heads",5,"Near",20,85,8,0,6,28,0.7,{hits:3,status:["Poison",25],cat:"Special"}],
    ["Coil Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Reach Bite",11,"Mid",28,88,5,0,6,15,0.4,{dash:"in",cat:"Hit",from:"Twin Fang"}],["Marsh Mend",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.18}],
    ["Neck Lash",20,"Mid",46,82,8,0,20,24,0.6,{cat:"Heavy",err:"Tanglewood",need:"pow"}],["Sour Spit",22,"Far",30,74,26,0,0,24,0.8,{cast:1,cat:"Sharp",err:"Nightshade Marsh",need:"mnd",share:["mouth"]}],["Tail Crash",25,"Near",48,68,5,0,18,26,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["tail"]}],
    ["Swamp Gas",30,"Mid",40,80,5,0,0,30,0.7,{cast:1,status:["Poison",40],cat:"Hit",from:"Bog Spit"}],["Poison Fog",34,"Mid",20,78,0,10,0,22,0.5,{cast:1,status:["Poison",40],cat:"Withering",err:"Nightshade Marsh",need:"mnd",after:"Swamp Gas"}],["Hydra Rage",40,"Close",24,75,10,0,10,42,1.1,{hits:4,cat:"Special",err:"Coral Shallows",need:"pow",after:"Reach Bite",share:["fangs"]}]],
  Griffin:[["Beak Jab",1,"Close",24,90,10,0,4,9,0.25,{cat:"Basic"}],["Talon Scratch",2,"Near",24,88,8,0,4,11,0.3,{cat:"Basic",from:"Beak Jab"}],["Swoop Down",3,"Mid",30,85,8,0,10,14,0.4,{dash:"in",cat:"Hit"}],
    ["Sky Talon",5,"Far",56,85,10,0,15,28,0.8,{dash:"in",cat:"Special"}],["Talon Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Hawk Sight",14,"Any",0,100,0,0,0,18,0.2,{buff:"unblink"}],
    ["Grit Storm",16,"Mid",20,80,0,9,0,18,0.5,{status:["Blind",30],cat:"Withering",err:"Granite Steps",need:"pow"}],["Wing Gale",20,"Far",40,82,5,0,30,26,0.6,{cast:1,cat:"Hit",from:"Swoop Down"}],["Piercing Cry",21,"Near",22,82,0,10,0,20,0.5,{cast:1,status:["Daze",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],
    ["Dive Crash",22,"Far",52,66,5,0,20,32,0.9,{dash:"in",cat:"Heavy",err:"Static Plains",need:"pow",after:"Wing Gale"}],["Razor Wing",24,"Mid",36,76,27,0,6,22,0.7,{cat:"Sharp",err:"Static Plains",need:"pow",share:["wings"]}],["Lion Maul",26,"Close",56,68,5,0,12,30,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["claws"]}],
    ["Feather Dart",27,"Far",30,74,26,0,0,24,0.8,{cat:"Sharp",err:"Dawn Temple",need:"pow",share:["wings"]}],["Sky Screech",28,"Far",18,80,0,12,0,24,0.6,{cast:1,status:["Daze",30],cat:"Withering",err:"Dawn Temple",need:"mnd",after:"Piercing Cry"}],["Lion Pounce",30,"Mid",62,78,10,0,20,32,0.8,{dash:"in",cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Talon Scratch"}],
    ["Talon Storm",34,"Close",16,82,10,0,2,38,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Talon Scratch",share:["claws"]}],["Royal Dive",40,"Far",92,70,12,0,25,42,1.2,{dash:"in",cat:"Special",err:"Dawn Temple",need:"pow",after:"Dive Crash"}]],
  Kirin:[["Hoof Kick",1,"Close",24,90,8,0,8,10,0.3,{cat:"Basic"}],["Ember Step",3,"Mid",24,88,5,0,0,14,0.4,{cast:1,status:["Burn",20],cat:"Hit"}],["Holy Flame",5,"Mid",54,85,8,0,10,28,0.7,{cast:1,status:["Burn",30],cat:"Special"}],
    ["Hoof Combo",6,"Close",16,88,6,0,4,13,0.4,{hits:2,cat:"Basic",from:"Hoof Kick"}],["Cloud Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Trot Charge",12,"Near",32,82,6,0,10,15,0.45,{dash:"in",cat:"Hit",from:"Ember Step"}],
    ["Calm Aura",14,"Any",0,100,0,0,0,22,0.4,{support:1,cleanse:1,heal:0.12}],["Holy Glow",16,"Near",20,86,0,10,0,18,0.5,{cast:1,status:["Blind",25],cat:"Withering",err:"Dawn Temple",need:"mnd"}],["Thunder Zap",18,"Mid",22,80,5,9,0,18,0.5,{cast:1,status:["Shock",25],cat:"Withering",err:"Static Plains",need:"mnd"}],
    ["Horn Thrust",20,"Near",46,82,10,0,15,24,0.6,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Trot Charge",share:["horn"]}],["Flame Lance",21,"Mid",38,76,28,0,6,22,0.7,{status:["Burn",20],cat:"Sharp",err:"Cinder Peak",need:"pow",share:["horn"]}],["Hail Shower",22,"Far",18,74,5,8,0,22,0.6,{cast:1,status:["Freeze",20],cat:"Withering",err:"Glacier Rim",need:"mnd"}],
    ["Blessed Trample",24,"Close",72,74,8,0,18,38,1.0,{cat:"Special",err:"Dawn Temple",need:"pow",after:"Hoof Combo",share:["legs"]}],["Thunder Stomp",26,"Close",56,68,5,0,14,30,0.9,{cat:"Heavy",err:"Static Plains",need:"pow",share:["legs"]}],["Leap Lance",28,"Far",34,72,28,0,4,26,0.8,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow"}],
    ["Frost Mane",30,"Far",56,80,8,0,0,30,0.8,{cast:1,status:["Freeze",15],cat:"Heavy",err:"Glacier Rim",need:"mnd"}],["Heaven Gallop",40,"Far",90,70,12,0,25,42,1.2,{dash:"in",cat:"Special",err:"Dawn Temple",need:"pow",after:"Trot Charge"}]],
  Salamander:[["Tongue Flick",1,"Close",22,92,8,0,4,9,0.25,{cat:"Basic"}],["Tail Swat",2,"Near",24,90,6,0,6,11,0.3,{cat:"Basic"}],["Cinder Spit",3,"Mid",24,88,5,0,0,14,0.4,{cast:1,status:["Burn",25],cat:"Hit"}],
    ["Flame Tail",5,"Near",50,85,10,0,12,26,0.7,{status:["Burn",30],cat:"Special"}],["Quick Snap",6,"Close",26,86,8,0,4,12,0.3,{cat:"Basic",from:"Tongue Flick"}],["Double Whip",7,"Near",16,86,5,0,4,15,0.4,{hits:2,cat:"Basic",from:"Tail Swat"}],
    ["Ash Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Flame Ball",11,"Mid",30,84,5,0,0,17,0.45,{cast:1,status:["Burn",20],cat:"Hit",from:"Cinder Spit"}],["Warm Up",14,"Any",0,100,0,0,0,18,0.3,{support:1,raise:{pow:1}}],
    ["Hard Bite",16,"Close",54,70,5,0,8,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Quick Snap",share:["fangs"]}],["Ash Cloud",18,"Near",20,84,0,10,0,18,0.5,{cast:1,status:["Blind",30],cat:"Withering",err:"Cinder Peak",need:"mnd"}],["Ember Roll",20,"Mid",48,80,8,0,20,24,0.6,{dash:"in",cat:"Heavy",err:"Granite Steps",need:"pow"}],
    ["Toss Bite",22,"Close",60,66,5,0,20,32,0.9,{cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["fangs"]}],["Fire Dance",22,"Near",18,78,0,12,0,22,0.6,{cast:1,status:["Daze",25],cat:"Withering",err:"Dream Garden",need:"mnd"}],["Fire Pounce",24,"Mid",36,76,26,0,6,22,0.7,{dash:"in",cat:"Sharp",err:"Static Plains",need:"pow",share:["legs"]}],
    ["Fire Dash",25,"Far",30,76,28,0,6,24,0.7,{dash:"in",status:["Burn",15],cat:"Sharp",err:"Static Plains",need:"pow"}],["Tail Storm",26,"Near",16,84,5,0,3,36,1.0,{hits:5,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Double Whip",share:["tail"]}],["Fang Leap",28,"Mid",38,74,28,0,4,24,0.7,{dash:"in",cat:"Sharp",err:"Granite Steps",need:"pow"}],
    ["Flame Breath",30,"Mid",70,70,5,0,10,38,1.0,{cast:1,status:["Burn",30],cat:"Special",err:"Cinder Peak",need:"mnd"}],["Lava Splash",30,"Mid",60,78,8,0,10,32,0.8,{cast:1,status:["Burn",30],cat:"Heavy",err:"Cinder Peak",need:"mnd"}],["Fireball Volley",32,"Far",16,80,5,0,0,38,1.0,{cast:1,hits:5,status:["Burn",20],cat:"Special",err:"Cinder Peak",need:"mnd",after:"Flame Ball"}],
    ["Magma Bomb",36,"Far",76,64,8,0,15,40,1.2,{cast:1,status:["Burn",35],cat:"Special",err:"Cinder Peak",need:"mnd"}],["Burning Roll",38,"Far",70,72,8,0,20,38,1.0,{dash:"in",status:["Burn",30],cat:"Special",err:"Granite Steps",need:"pow"}],["Inferno Tail",40,"Close",94,68,15,0,25,44,1.2,{cat:"Special",err:"Saffron Dojo",need:"pow"}]],
  Bakunawa:[["Moon Bite",1,"Close",26,88,10,0,4,10,0.3,{cat:"Basic"}],["Tail Slap",2,"Near",24,88,6,0,8,11,0.35,{cat:"Basic"}],["Tide Splash",3,"Mid",26,88,5,0,10,14,0.4,{cast:1,status:["Soak",30],cat:"Hit"}],
    ["Swallow the Moon",5,"Close",56,82,10,0,0,28,0.7,{hold:1.2,cat:"Special"}],["Sea Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Tail Whips",9,"Near",15,88,5,0,4,16,0.4,{hits:2,cat:"Hit",from:"Tail Slap"}],
    ["Moon Veil",14,"Any",0,100,0,0,0,18,0.2,{buff:"bunker"}],["Foam Spray",16,"Mid",20,82,0,9,0,17,0.5,{cast:1,status:["Soak",30],cat:"Withering",err:"Coral Shallows",need:"mnd"}],["Whisker Lash",20,"Mid",44,82,8,0,-20,24,0.6,{cat:"Hit",from:"Tide Splash"}],
    ["Fang Rip",22,"Close",38,78,28,0,0,22,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow",share:["fangs"]}],["Body Coil",26,"Near",70,76,5,0,10,38,1.0,{cat:"Special",err:"Granite Steps",need:"pow",after:"Tail Whips",share:["tail"]}],["Wave Rush",28,"Mid",38,74,27,0,10,24,0.7,{dash:"in",cat:"Sharp",err:"Coral Shallows",need:"pow"}],
    ["Eclipse Wave",30,"Far",58,80,8,0,0,30,0.8,{cast:1,status:["Blind",25],cat:"Heavy",err:"Hollow Moor",need:"mnd"}],["Serpent Tide",40,"Mid",92,68,12,0,30,44,1.2,{cast:1,cat:"Special",err:"Coral Shallows",need:"mnd",after:"Whisker Lash"}]],
  Cerberus:[["Guard Bite",1,"Close",26,88,10,0,4,10,0.3,{cat:"Basic"}],["Paw Swat",2,"Near",24,90,8,0,6,11,0.35,{cat:"Basic"}],["Triple Bark",3,"Mid",14,90,0,12,0,14,0.4,{cast:1,status:["Dread",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],
    ["Gate Fang",5,"Close",62,80,12,0,10,28,0.7,{status:["Dread",25],cat:"Special"}],["Gate Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Hound Rush",10,"Mid",32,84,6,0,8,16,0.45,{dash:"in",cat:"Hit",from:"Guard Bite"}],
    ["Watchdog",14,"Any",0,100,0,0,0,18,0.2,{buff:"unblink"}],["Long Howl",18,"Far",18,80,0,12,0,22,0.6,{cast:1,status:["Dread",30],cat:"Withering",err:"Hollow Moor",need:"mnd",after:"Triple Bark",share:["mouth"]}],["Chain Lash",20,"Mid",44,82,8,0,-20,24,0.6,{cat:"Hit"}],
    ["Paw Rake",24,"Near",38,78,28,0,0,22,0.7,{cat:"Sharp",err:"Static Plains",need:"pow",after:"Paw Swat",share:["claws"]}],["Ember Howl",30,"Mid",50,80,5,0,10,30,0.7,{cast:1,status:["Burn",30],cat:"Heavy",err:"Cinder Peak",need:"mnd"}],["Triple Maul",40,"Close",32,72,12,0,10,42,1.1,{hits:3,cat:"Special",err:"Saffron Dojo",need:"pow",after:"Hound Rush",share:["fangs"]}]],
  Djinn:[["Smoke Puff",1,"Mid",24,90,5,0,0,10,0.3,{cast:1,cat:"Hit"}],["Quick Jab",2,"Near",24,90,6,0,6,11,0.3,{cat:"Basic"}],["Wish Spark",3,"Mid",26,88,5,0,0,14,0.4,{cast:1,status:["Daze",20],cat:"Hit",from:"Smoke Puff"}],
    ["Lamp Blast",5,"Far",54,85,8,0,10,28,0.7,{cast:1,status:["Curse",20],cat:"Special"}],["Cross Punch",6,"Near",30,86,8,0,8,14,0.4,{cat:"Basic",from:"Quick Jab"}],["Lamp Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Granted Wish",14,"Any",0,100,0,0,0,22,0.4,{support:1,heal:0.2}],["Choking Smoke",16,"Mid",22,82,0,10,0,18,0.5,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],["Big Hook",18,"Close",56,68,5,0,16,30,0.9,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Cross Punch",share:["arms"]}],
    ["Sand Whirl",20,"Near",18,85,5,0,0,24,0.6,{cast:1,hits:3,cat:"Hit"}],["Rising Fist",21,"Near",38,78,28,0,10,22,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow",after:"Cross Punch",share:["arms"]}],["Flying Fist",28,"Mid",52,68,5,0,14,30,0.9,{cat:"Heavy",err:"Iron Foundry",need:"pow",after:"Big Hook",share:["arms"]}],
    ["Genie Grip",30,"Mid",50,78,8,0,-25,30,0.8,{cast:1,slow:3,cat:"Heavy",err:"Hollow Moor",need:"mnd"}],["Genie Beam",34,"Far",62,80,5,0,0,38,1.0,{cast:1,cat:"Special",err:"Dream Garden",need:"mnd",after:"Wish Spark"}],["Third Wish",40,"Far",96,66,12,0,20,44,1.2,{cast:1,cat:"Special",err:"Dream Garden",need:"mnd"}]],
  Troll:[["Club Bonk",1,"Close",28,86,8,0,12,10,0.3,{cat:"Basic"}],["Rock Toss",3,"Mid",30,82,5,0,10,14,0.4,{cat:"Hit"}],["Bridge Smash",5,"Near",58,80,10,0,20,28,0.8,{status:["Daze",20],cat:"Special"}],
    ["Bridge Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Club Swing",10,"Near",32,84,6,0,10,16,0.45,{cat:"Hit",from:"Club Bonk"}],["Moss Wrap",14,"Any",0,100,0,0,0,22,0.4,{support:1,regen:4}],
    ["Troll Stomp",20,"Near",48,80,8,0,15,26,0.6,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["legs"]}],["Mushroom Puff",22,"Mid",22,80,0,10,0,18,0.5,{cast:1,cat:"Withering",err:"Nightshade Marsh",need:"mnd",status:["Poison",25]}],["Tusk Gore",24,"Close",38,76,27,0,6,22,0.65,{cat:"Sharp",err:"Saffron Dojo",need:"pow",share:["fangs"]}],
    ["Log Throw",26,"Far",34,74,28,0,0,24,0.7,{cat:"Sharp",err:"Tanglewood",need:"pow",share:["arms"]}],["Boulder Hurl",30,"Far",64,72,10,0,20,34,0.9,{cat:"Heavy",err:"Saffron Dojo",need:"pow",after:"Rock Toss"}],["Mountain Club",40,"Close",98,64,15,0,30,46,1.2,{cat:"Special",err:"Granite Steps",need:"pow",after:"Club Swing"}]],
  Mummy:[["Wrap Slap",1,"Close",24,90,8,0,6,10,0.3,{cat:"Basic"}],["Bandage Lash",3,"Mid",26,85,5,0,-20,14,0.4,{cat:"Hit",from:"Wrap Slap"}],["Mummy Wrap",5,"Mid",44,82,8,0,0,26,0.7,{hold:1.2,cat:"Special"}],
    ["Tomb Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Rewrap",14,"Any",0,100,0,0,0,22,0.4,{support:1,cleanse:1,heal:0.15}],["Tomb Dust",20,"Mid",20,85,0,0,0,20,0.5,{cast:1,cat:"Hit",status:["Blind",35]}],
    ["Coffin Bash",22,"Near",54,68,5,0,22,30,0.85,{cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["arms"]}],["Razor Wrap",24,"Mid",36,76,28,0,0,22,0.65,{cat:"Sharp",err:"Static Plains",need:"pow",after:"Bandage Lash",share:["arms"]}],["Dread Stare",26,"Mid",20,82,0,12,0,18,0.5,{cast:1,cat:"Withering",err:"Hollow Moor",need:"mnd",status:["Dread",30]}],
    ["Rot Breath",28,"Near",22,80,0,10,0,20,0.5,{cast:1,cat:"Withering",err:"Nightshade Marsh",need:"mnd",status:["Poison",25]}],["Tomb Curse",30,"Mid",36,80,5,0,0,30,0.7,{cast:1,cat:"Hit",status:["Curse",40],from:"Tomb Dust"}],["Sand Tomb",40,"Near",90,68,12,0,15,44,1.2,{cast:1,cat:"Special",err:"Granite Steps",need:"mnd",after:"Tomb Curse"}]],
  Sarimanok:[["Comb Peck",1,"Close",24,90,10,0,4,9,0.25,{cat:"Basic"}],["Fish Toss",3,"Mid",28,86,8,0,10,14,0.4,{cat:"Hit",from:"Comb Peck"}],["Rainbow Fan",5,"Mid",52,85,10,0,15,28,0.7,{cast:1,cat:"Special"}],
    ["Plume Swap",8,"Close",14,85,0,0,0,12,0.3,{swap:1,cat:"Basic"}],["Dawn Crow",14,"Any",0,100,0,0,0,18,0.2,{buff:"unblink"}],["Spur Kick",20,"Close",50,82,15,0,10,24,0.6,{cat:"Heavy",err:"Saffron Dojo",need:"pow",share:["legs"]}],
    ["Dazzle",24,"Mid",22,82,0,12,0,18,0.5,{cast:1,cat:"Withering",err:"Dawn Temple",need:"mnd",after:"Rainbow Fan",status:["Blind",30]}],["Tail Slash",26,"Near",36,78,28,0,6,22,0.65,{cat:"Sharp",err:"Static Plains",need:"pow",share:["tail"]}],["Lucky Feathers",30,"Far",18,85,10,0,0,30,0.7,{cast:1,hits:3,cat:"Heavy",err:"Dream Garden",need:"mnd",after:"Fish Toss"}],
    ["Sunrise Strike",40,"Mid",92,70,15,0,25,42,1.2,{dash:"in",cat:"Special",err:"Dawn Temple",need:"pow",after:"Spur Kick",share:["wings"]}]],
  /* the ten horrors (17 Nov 2026): two signatures each, the first by level and the second from an errantry to its myth region */
  Ghoul:[["Dirt Claw",1,"Close",24,86,8,0,4,10,0.3,{cat:"Basic"}],
    ["Dirt Fling",2,"Near",22,88,5,0,6,11,0.3,{cat:"Basic"}],
    ["Grave Dig",5,"Mid",62,74,10,0,15,30,0.9,{cat:"Special",dash:"in"}],
    ["Dig In",6,"Any",0,100,0,0,0,20,0.2,{buff:"bunker"}],
    ["Hole Hop",8,"Close",15,78,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Long Reach",10,"Near",30,80,8,0,6,15,0.4,{cat:"Hit",from:"Dirt Claw"}],
    ["Grit Throw",12,"Mid",26,84,5,0,0,16,0.4,{cat:"Hit",from:"Dirt Fling"}],
    ["Grave Dust",18,"Mid",20,84,0,10,0,16,0.4,{status:["Blind",25],cat:"Withering",err:"Granite Steps"}],
    ["Roof Drop",22,"Close",58,66,5,0,18,30,0.9,{cat:"Heavy",err:"Granite Steps",need:"pow",after:"Grit Throw",share:["arms"]}],
    ["Rotten Breath",24,"Near",22,78,0,10,0,18,0.5,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],
    ["Long Slash",26,"Near",38,76,27,0,0,22,0.7,{cat:"Sharp",err:"Saffron Dojo",need:"pow"}],
    ["Grave Sweep",28,"Near",40,76,28,0,6,24,0.7,{cat:"Sharp",err:"Hollow Moor",after:"Long Reach",need:"pow",share:["claws"]}],
    ["Grim Grip",30,"Close",24,80,0,12,0,20,0.4,{hold:2,cat:"Withering",err:"Hollow Moor",share:["fangs"]}],
    ["Tunnel Rush",32,"Mid",56,66,5,0,20,32,1.0,{dash:"in",cat:"Heavy",err:"Hollow Moor",need:"pow"}],
    ["Bury Deep",36,"Close",76,66,8,0,10,38,1.1,{hold:2,cat:"Special",err:"Hollow Moor",need:"pow"}],
    ["Feast",40,"Close",20,82,10,0,0,40,1.0,{cat:"Special",hits:4,drain:0.35,err:"Hollow Moor",need:"pow"}]],
  Nightgaunt:[["Claw Flick",1,"Close",24,87,8,0,4,10,0.3,{cat:"Basic"}],
    ["Leather Wing",2,"Near",22,88,5,0,8,11,0.3,{cat:"Basic"}],
    ["Carry Off",5,"Near",58,74,8,0,20,30,0.9,{cat:"Special",status:["Daze",30]}],
    ["Fade Away",6,"Any",0,100,0,0,0,20,0.2,{buff:"phase"}],
    ["Flit Away",8,"Close",15,78,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Barb Flick",10,"Near",30,82,8,0,6,15,0.4,{cat:"Hit",from:"Claw Flick"}],
    ["Silent Swoop",12,"Near",32,78,8,0,8,16,0.4,{dash:"in",cat:"Hit",from:"Leather Wing"}],
    ["Light Tickle",16,"Close",20,84,0,10,0,17,0.4,{status:["Daze",25],cat:"Withering",err:"Dream Garden"}],
    ["Black Gust",18,"Mid",20,82,0,11,6,18,0.5,{cat:"Withering",err:"Hollow Moor",share:["wings"]}],
    ["Chill Draft",20,"Mid",20,80,0,10,0,17,0.5,{status:["Freeze",20],cat:"Withering",err:"Glacier Rim"}],
    ["Barb Stab",22,"Near",38,76,27,0,6,22,0.6,{cat:"Sharp",err:"Dream Garden",after:"Barb Flick",need:"pow",share:["tail"]}],
    ["Hook Drop",26,"Mid",36,74,28,0,0,24,0.7,{dash:"in",cat:"Sharp",err:"Hollow Moor",need:"pow"}],
    ["Horn Ram",28,"Close",54,68,5,0,22,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow"}],
    ["Night Dive",30,"Mid",58,66,5,0,20,32,1.0,{dash:"in",cat:"Heavy",err:"Dream Garden",after:"Silent Swoop",need:"pow"}],
    ["Long Fall",34,"Mid",74,66,8,0,25,38,1.1,{dash:"in",cat:"Special",err:"Hollow Moor",need:"pow"}],
    ["Tickle Storm",40,"Close",14,86,5,8,0,40,1.0,{cat:"Special",hits:6,status:["Daze",40],err:"Dream Garden",need:"pow"}]],
  Migo:[["Pincer Nip",1,"Close",25,86,8,0,4,10,0.3,{cat:"Basic"}],
    ["Wing Buzz",2,"Near",22,88,5,0,6,11,0.3,{cat:"Basic"}],
    ["Pink Lights",5,"Far",48,82,5,8,0,30,0.9,{cast:1,cat:"Special",status:["Daze",30]}],
    ["Calibrate",6,"Any",0,100,0,0,0,20,0.2,{buff:"unblink"}],
    ["Side Skitter",8,"Close",15,78,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Quick Snip",10,"Close",16,84,6,0,4,16,0.4,{hits:2,cat:"Hit",from:"Pincer Nip"}],
    ["Buzz Dive",12,"Near",32,78,8,0,8,16,0.4,{dash:"in",cat:"Hit",from:"Wing Buzz"}],
    ["Pink Mist",16,"Mid",22,80,0,9,0,18,0.5,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],
    ["Cold Storage",20,"Near",20,80,0,10,0,17,0.5,{cast:1,status:["Freeze",20],cat:"Withering",err:"Glacier Rim",need:"mnd"}],
    ["Mind Probe",22,"Far",18,82,0,13,0,20,0.6,{cast:1,status:["Daze",20],cat:"Withering",err:"Granite Steps",need:"mnd"}],
    ["Clean Cut",24,"Close",38,76,28,0,0,22,0.6,{cat:"Sharp",err:"Granite Steps",after:"Quick Snip",need:"pow",share:["claws"]}],
    ["Steel Needle",26,"Mid",36,76,27,0,0,22,0.7,{cast:1,cat:"Sharp",err:"Iron Foundry",need:"mnd"}],
    ["Stone Haul",28,"Near",54,68,5,0,18,28,0.8,{cat:"Heavy",err:"Granite Steps",need:"pow"}],
    ["Swarm Pass",30,"Mid",56,66,5,0,20,32,1.0,{dash:"in",cat:"Heavy",err:"Granite Steps",after:"Buzz Dive",need:"pow",share:["wings"]}],
    ["Pink Storm",34,"Far",18,80,5,0,0,38,1.0,{hits:4,cast:1,cat:"Special",err:"Static Plains",need:"mnd"}],
    ["Jar Harvest",40,"Mid",70,76,5,0,0,40,1.1,{cast:1,cat:"Special",drain:0.4,err:"Granite Steps",need:"mnd"}]],
  Dagon:[["Webbed Slap",1,"Close",25,86,8,0,6,10,0.3,{cat:"Basic"}],
    ["Gill Spray",3,"Mid",28,82,5,0,0,16,0.4,{cast:1,cat:"Hit"}],
    ["Tidal Grasp",5,"Mid",60,74,8,0,18,30,0.9,{cast:1,cat:"Special",status:["Soak",40]}],
    ["Bubble Shield",6,"Any",0,100,0,0,0,20,0.2,{buff:"bubble"}],
    ["Slip Away",8,"Close",15,78,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Fin Sweep",10,"Near",30,82,8,0,8,15,0.4,{cat:"Hit",from:"Webbed Slap"}],
    ["Brine Shot",12,"Far",26,86,5,0,0,17,0.4,{cast:1,cat:"Hit",from:"Gill Spray"}],
    ["Cast Net",16,"Mid",20,80,0,10,0,18,0.5,{status:["Soak",25],cat:"Withering",err:"Coral Shallows",share:["arms"]}],
    ["Deep Hymn",18,"Far",18,82,0,12,0,18,0.6,{cast:1,status:["Daze",25],cat:"Withering",err:"Dream Garden",need:"mnd"}],
    ["Drowned Moan",20,"Far",20,80,0,11,0,18,0.6,{cast:1,status:["Dread",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],
    ["Fin Slice",22,"Near",38,76,28,0,0,22,0.6,{cat:"Sharp",err:"Coral Shallows",after:"Fin Sweep",need:"pow",share:["tail"]}],
    ["Ice Fin",24,"Close",36,78,26,0,0,20,0.6,{cat:"Sharp",err:"Glacier Rim",need:"pow"}],
    ["Fin Crash",26,"Close",54,68,5,0,22,28,0.8,{cat:"Heavy",err:"Saffron Dojo",need:"pow"}],
    ["Deep Pressure",30,"Mid",56,66,5,0,12,32,1.0,{cast:1,cat:"Heavy",err:"Coral Shallows",after:"Brine Shot",need:"mnd"}],
    ["Sea Drag",34,"Near",72,68,8,0,30,38,1.1,{dash:"in",status:["Soak",30],cat:"Special",err:"Coral Shallows",need:"pow"}],
    ["Fisher's Song",40,"Far",86,70,5,10,10,40,1.2,{cast:1,cat:"Special",status:["Soak",50],err:"Coral Shallows",need:"mnd"}]],
  Shub:[["Horn Bump",1,"Close",26,86,8,0,6,10,0.3,{cat:"Basic"}],
    ["Dark Flick",2,"Near",22,88,5,0,6,11,0.3,{cat:"Basic"}],
    ["Kid Stampede",5,"Mid",15,82,5,0,10,30,0.9,{cat:"Special",hits:4}],
    ["Plant Hooves",6,"Any",0,100,0,0,0,20,0.2,{buff:"brace"}],
    ["Kid Swap",8,"Close",15,78,0,0,0,12,0.3,{swap:1,cat:"Basic"}],
    ["Horn Charge",10,"Near",34,78,8,0,10,16,0.5,{dash:"in",cat:"Hit",from:"Horn Bump"}],
    ["Root Whip",12,"Mid",28,82,5,0,4,16,0.4,{cat:"Hit",from:"Dark Flick"}],
    ["Sap Spit",16,"Mid",22,78,5,9,0,18,0.5,{cast:1,status:["Poison",30],cat:"Withering",err:"Nightshade Marsh",need:"mnd"}],
    ["Dark Bleat",18,"Far",20,82,0,11,0,18,0.5,{cast:1,status:["Dread",25],cat:"Withering",err:"Hollow Moor",need:"mnd"}],
    ["Bramble Wrap",20,"Close",22,80,0,12,0,20,0.5,{hold:2,cat:"Withering",err:"Tanglewood",after:"Root Whip",share:["tentacles"]}],
    ["Thorn Spike",22,"Mid",38,75,28,0,0,24,0.7,{cat:"Sharp",err:"Tanglewood",need:"pow"}],
    ["Horn Sweep",24,"Close",38,76,27,0,8,22,0.6,{cat:"Sharp",err:"Saffron Dojo",need:"pow"}],
    ["Great Horns",28,"Close",60,66,5,0,22,32,0.9,{cat:"Heavy",err:"Tanglewood",after:"Horn Charge",need:"pow",share:["horn"]}],
    ["Trample",30,"Near",56,66,5,0,25,30,0.9,{dash:"in",cat:"Heavy",err:"Saffron Dojo",need:"pow"}],
    ["Wild Rush",34,"Mid",26,76,8,0,8,38,1.0,{dash:"in",hits:3,cat:"Special",err:"Saffron Dojo",need:"pow"}],
    ["Black Grove",40,"Mid",80,72,5,10,0,40,1.2,{cast:1,cat:"Special",status:["Root",40],err:"Tanglewood",need:"mnd"}]],
  Gug:[["Shaggy Swipe",1,"Close",26,86,8,0,4,10,0.3,{cat:"Basic"}],
    ["Lumber In",3,"Near",23,86,6,0,6,12,0.35,{cat:"Basic",dash:"in",from:"Shaggy Swipe"}],
    ["Fist Drop",4,"Near",32,80,8,0,6,15,0.45,{cat:"Hit"}],
    ["Gate Knock",5,"Near",64,70,10,0,25,30,1.0,{cat:"Special",status:["Daze",25]}],
    ["Hairy Shuffle",8,"Close",18,72,5,0,0,13,0.4,{cat:"Basic",swap:1}],
    ["Planted Feet",10,"Any",0,100,0,0,0,20,0.2,{buff:"brace"}],
    ["Ground Thump",12,"Near",30,82,6,0,10,16,0.45,{cat:"Hit",from:"Fist Drop"}],
    ["Door Pound",18,"Close",58,66,8,0,22,30,0.9,{cat:"Heavy",err:"Cinder Peak",after:"Lumber In",need:"pow",share:["arms"]}],
    ["Gum Tear",20,"Close",38,76,27,0,0,22,0.7,{cat:"Sharp",err:"Cinder Peak",need:"pow",share:["fangs"]}],
    ["Hot Breath",22,"Mid",22,80,5,11,0,20,0.5,{cat:"Withering",err:"Cinder Peak",cast:1,status:["Burn",30],need:"mnd"}],
    ["Giant Barge",24,"Near",50,68,5,0,20,28,0.8,{cat:"Heavy",err:"Saffron Dojo",dash:"in",need:"pow"}],
    ["Tight Grip",26,"Close",34,76,0,14,0,24,0.5,{cat:"Withering",err:"Saffron Dojo",hold:1.5,share:["claws"]}],
    ["Rock Hurl",28,"Far",36,72,26,0,6,26,0.8,{cat:"Sharp",err:"Granite Steps",need:"pow"}],
    ["Dread Growl",30,"Mid",20,82,5,12,0,18,0.5,{cat:"Withering",err:"Hollow Moor",cast:1,status:["Dread",25],need:"mnd"}],
    ["Ground Pound",34,"Near",24,74,10,0,10,38,1.0,{cat:"Special",err:"Cinder Peak",hits:3,after:"Ground Thump",need:"pow"}],
    ["Split Maw",40,"Close",92,66,15,0,20,42,1.2,{cat:"Special",err:"Cinder Peak",need:"pow"}]],
  Shoggoth:[["Goo Slap",1,"Close",26,86,6,0,4,10,0.3,{cat:"Basic"}],
    ["Ooze Lunge",3,"Near",22,87,5,0,4,12,0.3,{cat:"Basic",dash:"in",from:"Goo Slap"}],
    ["Lash Out",4,"Near",30,82,8,0,6,14,0.4,{cat:"Hit"}],
    ["Many Eyes",5,"Mid",50,80,5,10,0,30,0.9,{cast:1,cat:"Special",status:["Dread",30]}],
    ["Ooze Away",8,"Close",16,74,0,0,0,12,0.3,{cat:"Basic",swap:1}],
    ["Stare Back",10,"Any",0,100,0,0,0,18,0.2,{buff:"unblink"}],
    ["Sprout Arm",12,"Near",31,80,8,0,6,15,0.4,{cat:"Hit",from:"Lash Out"}],
    ["Gulp Down",18,"Close",52,68,5,0,0,28,0.8,{cat:"Heavy",err:"Iron Foundry",after:"Ooze Lunge",need:"pow",share:["mouth"]}],
    ["Copy Blade",20,"Near",38,76,28,0,0,22,0.7,{cat:"Sharp",err:"Iron Foundry",need:"pow"}],
    ["Rust Ooze",22,"Close",24,80,5,12,0,20,0.5,{cat:"Withering",err:"Iron Foundry"}],
    ["Slime Roll",24,"Mid",50,68,5,0,20,28,0.8,{cat:"Heavy",err:"Granite Steps",dash:"in",need:"pow",share:["round"]}],
    ["Black Slime",26,"Mid",20,80,5,10,0,18,0.5,{cat:"Withering",err:"Nightshade Marsh",cast:1,status:["Poison",35],need:"mnd"}],
    ["Staring Eyes",28,"Mid",18,84,0,12,0,17,0.5,{cat:"Withering",err:"Hollow Moor",cast:1,status:["Dread",25],need:"mnd"}],
    ["Mirror Shape",30,"Mid",70,72,5,0,0,38,1.0,{cat:"Special",err:"Dream Garden",cast:1,need:"mnd"}],
    ["Tentacle Thrash",34,"Close",15,80,10,0,0,40,1.0,{cat:"Special",err:"Iron Foundry",hits:5,after:"Sprout Arm",need:"pow",share:["tentacles"]}],
    ["Swallow Whole",40,"Near",88,68,10,0,0,42,1.2,{cat:"Special",hold:2,err:"Iron Foundry",need:"pow"}]],
  Hastur:[["Cloak Flick",1,"Close",25,86,8,0,4,10,0.3,{cat:"Basic"}],
    ["Sweep In",3,"Near",22,87,6,0,4,12,0.35,{cat:"Basic",dash:"in",from:"Cloak Flick"}],
    ["Staff Rap",4,"Near",32,82,8,0,6,14,0.4,{cat:"Hit"}],
    ["Curtain Call",5,"Far",50,80,5,10,0,30,0.9,{cast:1,cat:"Special",status:["Daze",35]}],
    ["Stage Exit",8,"Close",16,74,0,0,0,12,0.3,{cat:"Basic",swap:1}],
    ["Cloak Wrap",10,"Any",0,100,0,0,0,18,0.2,{buff:"riposte"}],
    ["Stage Whisper",12,"Mid",28,90,5,0,0,16,0.4,{cat:"Hit",cast:1,from:"Staff Rap"}],
    ["Staff Jab",18,"Near",38,76,28,0,6,22,0.7,{cat:"Sharp",err:"Static Plains",need:"pow"}],
    ["Lull Chant",20,"Mid",18,82,0,12,0,18,0.5,{cat:"Withering",err:"Dream Garden",cast:1,status:["Daze",25],need:"mnd"}],
    ["Scepter Smash",22,"Close",54,68,8,0,18,30,0.9,{cat:"Heavy",err:"Hollow Moor",need:"pow",share:["arms"]}],
    ["Hollow Laugh",24,"Mid",20,82,0,12,0,18,0.5,{cat:"Withering",err:"Hollow Moor",cast:1,status:["Dread",30],need:"mnd"}],
    ["Fading Light",26,"Mid",18,84,0,11,0,17,0.5,{cat:"Withering",err:"Dawn Temple",cast:1,status:["Blind",30],need:"mnd"}],
    ["Yellow Mark",30,"Mid",66,74,5,0,0,38,1.0,{cat:"Special",err:"Static Plains",cast:1,status:["Curse",35],need:"mnd"}],
    ["Rag Storm",34,"Near",17,80,8,0,6,38,1.0,{cat:"Special",err:"Static Plains",hits:4,after:"Sweep In",need:"pow",share:["arms"]}],
    ["Final Act",36,"Far",50,72,5,8,0,40,1.1,{cat:"Special",err:"Static Plains",cast:1,status:["Curse",30],after:"Stage Whisper",need:"mnd"}],
    ["Tattered Cloak",40,"Mid",84,70,8,10,10,40,1.2,{cast:1,cat:"Special",status:["Curse",40],err:"Static Plains",need:"mnd"}]],
  Yog:[["Globe Bump",1,"Close",25,86,6,0,4,10,0.3,{cat:"Basic"}],
    ["Drift In",3,"Near",22,87,5,0,4,12,0.3,{cat:"Basic",dash:"in",from:"Globe Bump"}],
    ["Spark Globe",4,"Mid",26,88,5,0,0,15,0.4,{cat:"Hit",cast:1}],
    ["Gate Open",5,"Mid",58,76,5,0,0,30,1.0,{cast:1,cat:"Special",status:["Daze",30]}],
    ["Step Through",8,"Close",16,74,0,0,0,12,0.3,{cat:"Basic",swap:1}],
    ["Slip Between",10,"Any",0,100,0,0,0,20,0.2,{buff:"phase"}],
    ["Ring Around",12,"Mid",27,84,5,0,0,16,0.4,{cat:"Hit",cast:1,from:"Spark Globe"}],
    ["Door Slam",18,"Close",54,68,5,0,25,30,0.9,{cat:"Heavy",err:"Dream Garden",need:"pow"}],
    ["Gate Edge",20,"Near",38,76,28,0,0,22,0.7,{cat:"Sharp",err:"Dream Garden",cast:1,need:"mnd"}],
    ["Warp Pull",22,"Mid",20,80,0,12,0,18,0.5,{cat:"Withering",err:"Dream Garden",cast:1,need:"mnd"}],
    ["Tentacle Prick",24,"Near",36,76,27,0,0,20,0.6,{cat:"Sharp",err:"Iron Foundry",need:"pow",share:["tentacles"]}],
    ["Void Stare",26,"Far",18,82,0,10,0,20,0.6,{cat:"Withering",err:"Hollow Moor",cast:1,status:["Dread",30],need:"mnd"}],
    ["Tentacle Squeeze",28,"Close",30,78,0,13,0,22,0.5,{cat:"Withering",err:"Hollow Moor",hold:1.5,share:["tentacles"]}],
    ["Globe Crash",32,"Near",74,70,5,0,15,38,1.0,{cat:"Special",err:"Dream Garden",dash:"in",after:"Drift In",need:"pow",share:["round"]}],
    ["Orbit Barrage",36,"Mid",18,80,5,0,0,40,1.1,{cat:"Special",err:"Static Plains",cast:1,hits:4,after:"Ring Around",need:"mnd"}],
    ["Globe Storm",40,"Far",16,80,5,0,0,42,1.2,{cast:1,cat:"Special",hits:6,err:"Dream Garden",need:"mnd"}]],
  Cthulhu:[["Deep Claw",1,"Close",26,86,8,0,4,10,0.3,{cat:"Basic"}],
    ["Great Wing",3,"Near",23,86,5,0,6,12,0.35,{cat:"Basic",dash:"in",from:"Deep Claw"}],
    ["Arm Slam",4,"Near",32,80,6,0,8,15,0.45,{cat:"Hit"}],
    ["Dream Call",5,"Far",54,80,5,10,0,30,1.0,{cast:1,cat:"Special",status:["Dread",35]}],
    ["Dive Past",8,"Close",17,72,0,0,0,13,0.4,{cat:"Basic",swap:1}],
    ["Sea Veil",10,"Any",0,100,0,0,0,22,0.3,{buff:"bubble"}],
    ["Feeler Lash",12,"Near",30,82,6,0,6,16,0.45,{cat:"Hit",from:"Arm Slam"}],
    ["Tidal Crush",18,"Close",58,66,5,0,22,32,0.9,{cat:"Heavy",err:"Coral Shallows",need:"pow"}],
    ["Reef Claw",20,"Close",38,76,28,0,0,22,0.7,{cat:"Sharp",err:"Coral Shallows",need:"pow"}],
    ["Sea Dread",22,"Mid",20,82,0,12,0,18,0.5,{cat:"Withering",err:"Coral Shallows",cast:1,status:["Dread",30],need:"mnd"}],
    ["Foot Crush",24,"Close",52,68,5,0,24,30,0.9,{cat:"Heavy",err:"Granite Steps",need:"pow",share:["legs"]}],
    ["Night Terror",26,"Mid",18,84,0,11,0,17,0.5,{cat:"Withering",err:"Dream Garden",cast:1,status:["Daze",25],need:"mnd"}],
    ["Night Wings",30,"Near",14,78,8,0,6,38,1.0,{cat:"Special",err:"Hollow Moor",hits:5,after:"Great Wing",need:"pow",share:["wings"]}],
    ["Claw Combo",32,"Close",18,80,10,0,0,40,1.0,{cat:"Special",err:"Saffron Dojo",hits:4,need:"pow"}],
    ["Feeler Grip",34,"Close",32,76,0,15,0,26,0.6,{cat:"Withering",err:"Coral Shallows",hold:2,after:"Feeler Lash",share:["tentacles"]}],
    ["Sunken Rise",40,"Near",94,66,12,0,25,44,1.3,{cat:"Special",status:["Soak",40],err:"Coral Shallows",need:"pow"}]]
};
/* every Snabit has Brace. Melee families get Rush, which closes the gap and hits; the casters get Leap Back to keep their distance
   (Gid, 15 Nov 2026: fewer moves that only move, and melee fighters closing in rather than backing off) */
const SHARED_MOVES=[["Rush",1,"Any",14,85,5,0,0,10,0.25,{dash:"in",melee:1}],["Leap Back",1,"Any",0,100,0,0,0,10,0.2,{step:-20,ranged:1}],["Brace",1,"Any",0,100,0,0,0,10,0.1,{buff:"brace"}]];
const arMelee=fam=>{ const d=(FAM_MOVES[fam]||[]).map(arMove).filter(m=>m.dmg); return d.filter(m=>!m.cast&&(m.range==="Close"||m.range==="Near"||m.dash)).length>=d.length/2; };
/* how fast each family gets around: Booly floats and Squib jets, while Chomp and Pinch plod */
const FAM_WALK={Chomp:0.8,Pinch:0.85,Stilt:1.05,Skit:1.15,Antik:1,Squib:1.15,Moko:1.05,Booly:1.25,Plod:0.75,Bipped:1.05,Fizz:1,Teep:0.85,Lern:1.15,Eagle:1.2,Vampire:1,Phoenix:1.05,Kitsune:1.15,Naga:0.95,Yeti:0.8,Puff:0.9,Flit:1.3,Glop:0.85,Tock:1.05,Mitt:0.95,Brolly:1,Spine:0.7,Burr:0.95,Kraken:0.9,Golem:0.7,Unicorn:1.15,Jack:0.9,Wick:1.05,Lumo:1.1,Snooze:0.85,Inky:1,Cobble:0.8,Nimbo:1.1,Dango:1.05,Oaklet:0.9,Roly:1.2,Trundle:0.55,Clank:0.9,Crease:1.25,Twiglet:0.75,Swirl:0.95,Ditty:1,Sizzle:1.05,Aero:1.35,Nesta:0.85,Magna:0.9,Helm:0.8,Bloop:1.05,Sox:1,Cuppy:0.95,Suds:0.95,Scoop:1,Tome:0.9,Gumball:0.9,Pina:0.95,Jingle:0.95,Presto:1.05,Vroom:1.25,Shutter:1,Yoyo:1.25,Lava:0.85,Pogo:1.2,Tengu:1.05,Tanuki:0.85,Mermaid:0.95,Diwata:1.2,Sphinx:1,Garuda:1.2,Werewolf:1.1,Minotaur:0.85,Dragon:0.9,Thunderbird:1.15,Hydra:0.9,Griffin:1.2,Kirin:1.15,Salamander:1.15,Bakunawa:0.95,Cerberus:1.1,Djinn:1.05,Troll:0.8,Mummy:0.85,Sarimanok:1.15,Cthulhu:0.85,Hastur:0.9,Shoggoth:0.8,Dagon:1,Migo:1,Nightgaunt:1.15,Ghoul:1.05,Gug:0.7,Yog:0.9,Shub:0.9};
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
/* a move's MR2 category, from its numbers when the family's row doesn't name one. It sets how big the wind-up is */
function arCat(m){ if(m.cat) return m.cat; if(!m.dmg) return null;
  if(m.skill){ const lv=m.skill.lv||1; return lv>=28||m.dmg>=120?"Special":lv>=14?"Heavy":"Basic"; }
  const tot=m.dmg*(m.hits||1); return tot>=60?"Special":m.wither>=10?"Withering":m.sharp>=0.2?"Sharp":tot>=40?"Heavy":m.range==="Far"||m.range==="Mid"?"Hit":"Basic"; }
/* the body parts each family has, for the family moves another family can learn on an errantry (share in the row) */
const FAM_BODY={Chomp:"mouth fangs legs round",Squib:"mouth tentacles",Antik:"arms legs",Moko:"tentacles",Pinch:"claws shell arms legs",Stilt:"legs",Skit:"fangs legs",
  Booly:"mouth arms",Plod:"trunk legs round",Bipped:"arms legs",Fizz:"arms legs",Teep:"mouth legs round",Lern:"arms legs",Puff:"legs round",Flit:"mouth fangs wings",
  Glop:"mouth round",Tock:"arms legs",Mitt:"arms legs",Brolly:"legs",Spine:"arms legs",Burr:"mouth claws legs",Wick:"arms legs",Lumo:"wings",Snooze:"legs round",
  Inky:"arms legs",Nimbo:"round",Dango:"legs round",Oaklet:"legs round",Roly:"shell legs round",Trundle:"mouth shell",Clank:"arms legs",Crease:"beak wings",
  Twiglet:"arms legs",Swirl:"legs round",Ditty:"arms legs",Sizzle:"arms legs",Aero:"wings tail",Nesta:"legs round",Magna:"arms legs",Helm:"arms legs",Bloop:"tentacles",
  Sox:"legs",Cuppy:"legs round",Suds:"mouth legs",Scoop:"legs round",Tome:"legs",Gumball:"legs round",Pina:"legs",Jingle:"mouth legs round",Presto:"legs",Vroom:"round",
  Shutter:"legs",Yoyo:"round",Lava:"legs",Pogo:"legs",Cobble:"arms legs round",Eagle:"beak wings claws legs",Vampire:"mouth fangs wings arms",Phoenix:"beak wings legs tail",
  Kitsune:"mouth fangs legs tail",Naga:"mouth fangs tail",Yeti:"mouth arms legs claws",Kraken:"mouth tentacles",Golem:"arms legs",Unicorn:"mouth horn legs",
  Jack:"mouth arms legs",Tengu:"wings arms legs",Tanuki:"mouth legs tail round",Mermaid:"arms tail",Diwata:"arms wings",Sphinx:"mouth fangs claws wings legs",
  Garuda:"beak wings claws arms legs",Werewolf:"mouth fangs claws arms legs",Minotaur:"horn arms legs",Dragon:"mouth fangs claws wings tail legs",
  Thunderbird:"beak wings claws legs",Hydra:"mouth fangs tail legs",Griffin:"beak claws wings legs",Kirin:"mouth horn legs tail",Salamander:"mouth fangs tail legs",
  Bakunawa:"mouth fangs tail",Cerberus:"mouth fangs claws legs",Djinn:"arms",Troll:"mouth fangs arms legs",Mummy:"arms legs",Sarimanok:"beak wings legs tail",Ghoul:"mouth fangs claws arms legs",Nightgaunt:"wings claws arms legs tail",Migo:"claws wings legs",Dagon:"mouth arms legs tail",Shub:"mouth legs horn tentacles",Gug:"mouth fangs claws arms legs",Shoggoth:"mouth tentacles round",Hastur:"arms",Yog:"tentacles round",Cthulhu:"tentacles wings claws arms legs"};
function famParts(fam){ const F=typeof FAMILY!=="undefined"&&FAMILY[fam], of=F&&F.of||[fam]; return new Set(of.flatMap(f=>(FAM_BODY[f]||"").split(" ").filter(Boolean))); }
/* every family move a Snabit of this family can still learn on the errantry to this region: its own, and the shared ones its body fits */
function famErrantry(fam,region){ const F=typeof FAMILY!=="undefined"&&FAMILY[fam], own=F&&F.of||[fam], parts=famParts(fam), out=[];
  for(const [f,rows] of Object.entries(FAM_MOVES)) for(const r of rows){ const m=arMove(r); if(m.err!==region) continue;
    if(own.includes(f)||m.share&&m.share.every(q=>parts.has(q))) out.push({...m,fam:f,ownFam:own.includes(f)}); }
  return out; }
/* learned: the family moves a player's Snabit has picked up on errantries and in fights. A computer Snabit leaves it out
   and has every move up to its level */
function arMoves(fam,level,known,el,learned){
  const lrn=learned||null, mine=FAM_MOVES[fam]||[], extra=lrn?Object.values(FAM_MOVES).flat().filter(r=>lrn.includes(r[0])&&!mine.some(q=>q[0]===r[0])):[];
  const fm=mine.concat(extra).map(arMove).filter(m=>lrn?(lrn.includes(m.name)||!m.err&&m.lv<=level):m.lv<=level), mel=arMelee(fam), sh=SHARED_MOVES.map(arMove).filter(m=>!(m.melee&&!mel)&&!(m.ranged&&mel));
  if(fm[0]) fm[0].basic=true;
  for(const m of fm) m.cat=arCat(m);
  if(el&&EL_PREFIX[el]&&fm[0]){ fm[0].base=fm[0].name; fm[0].name=`${EL_PREFIX[el]} ${fm[0].name}`; fm[0].el=el; }
  for(const m of fm) if(m.name==="Potion Toss"&&el&&typeof POTION_BY_EL!=="undefined"&&POTION_BY_EL[el]) m.status=[POTION_BY_EL[el],45];   // the bottle holds its element's status
  const elm=(known||[]).map(arFromSkill).filter(Boolean), seen=new Set();
  // a skill with the same name as a family move (Crunch, High Kick) shows once, as the family move
  for(const m of elm) m.cat=arCat(m);
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
  cost(p,m){ if(m.swap&&p.f.ability==="All Doors") return 0; return this.has(p,"Curse")?Math.round(m.cost*1.25):m.cost; }   // Yog's swaps are free
  // asleep, frozen or locked up by a shock or a wall slam: it can't act or walk
  canAct(p){ return !(p.stun>0||p.sleep>0||this.has(p,"Freeze")); }
  dirTo(p){ const o=this.p[1-p.i]; return o.x>p.x?1:-1; }
  // Tide's Undertow: while it's above half HP, the other one backs away from it a quarter slower
  undertow(p){ const o=this.p[1-p.i]; return o.f.ability==="Undertow"&&o.hp>o.maxhp/2; }
  inRange(m){ return m.range==="Any"||m.range===this.band(); }
  speed(p){ const o=this.p[1-p.i]; return 12*(FAM_WALK[p.f.family]||1)*(p.f.ability==="Tailwind"?1.2:1)*(1+edge(this.eff(p,"spd"),this.eff(o,"spd"),0.6,-0.35,0.45))*(p.slow>0?0.5:1)*(this.has(p,"Soak")?0.85:1); }
  /* the chance a move lands right now: its accuracy, a little more with focus held, Insight against the target's Speed,
     less if the target is on the move or phased out, less again when blinded, and more against a target that can't get away */
  hitChance(p,m){ const o=this.p[1-p.i]; if(m.sure||p.buff.foresight&&m.cast) return 1;
    const ke=p.f.ability==="Keen Eye", moving=o.walkT!=null&&this.t-o.walkT<0.3, stuck=!this.canAct(o)||o.hold>0, nd=!!m.noDodge||ke;   // Moko's Keen Eye: dodging, phasing and Blind don't work against it
    const ed=edge(this.eff(p,"spr"),this.eff(o,"spd"),0.4,-0.25,0.12);
    return Math.max(0.05,Math.min(0.97,m.acc/100+p.focus/99*0.06+(ke?Math.max(0,ed):ed)-(moving&&!nd?0.08:0)-(o.buff.phase&&!nd?0.3:0)
      +(p.buff.unblink?0.1:0)+(m.dash&&p.f.ability==="Sky King"?0.1:0)-(this.has(p,"Blind")&&!ke?0.2:0)+(stuck?0.25:0)+(p.f.accMod||0))); }
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
    if(o.f.ability==="Trick Leaf"&&!o.trick&&m.dmg) return "phase";   // Tanuki's Trick Leaf
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
      if(q.f.ability==="Sugar Rush"&&!q.rush&&q.hp>0&&q.hp<q.maxhp/2){ q.rush=1; this.ab(q,"Sugar Rush"); this.stage(q,{spd:1},1,q); }   // Cuppy
      if(q.f.ability==="Bubble Up"&&!q.bubbled&&q.hp>0&&q.hp<q.maxhp/2){ q.bubbled=1; q.buff.bubble=true; this.ab(q,"Bubble Up"); }   // Suds
      if(q.f.ability==="Healing Horn"&&!q.horn&&q.hp>0&&q.hp<q.maxhp*0.4){ q.horn=1; this.ab(q,"Healing Horn"); this.heal(q,q.maxhp*0.3,"heal"); }   // Unicorn
      if(q.f.ability==="Full Moon"&&!q.moon&&q.hp<q.maxhp*0.4){ q.moon=1; this.ab(q,"Full Moon"); this.stage(q,{pow:2},1); }   // Werewolf
      if(q.f.ability==="Regrowth"&&!q.regrown&&q.hp<q.maxhp/2){ q.regrown=1; this.ab(q,"Regrowth"); this.heal(q,q.maxhp*0.25,"regrowth"); }   // Hydra
      if(q.f.ability==="Last Stand"&&!q.lastStand&&q.hp<q.maxhp/4){ q.lastStand=1; this.ab(q,"Last Stand"); this.heal(q,q.maxhp*0.2,"stand"); } }   // Brawl's Last Stand
    for(const q of this.p){ const o=this.p[1-q.i]; if(q.hp<=0&&q.f.ability==="Haunt"&&!q.haunted&&o.hp>0){ q.haunted=1; this.ab(q,"Haunt"); const d=Math.round(o.maxhp/4); o.hp=Math.max(0,o.hp-d); q.dealt+=d; this.ev.push({t:"recoil",i:o.i,dmg:d}); } }   // Shade's Haunt
    for(const q of this.p) if(q.hp<=0&&q.f.ability==="Rebirth"&&!q.reborn){ q.reborn=1; q.hp=Math.round(q.maxhp*0.25); q.st=null; this.ev.push({t:"ability",i:q.i,name:"Rebirth"}); this.ev.push({t:"heal",i:q.i,amt:q.hp,src:"rebirth"}); }   // Phoenix
    for(const q of this.p) if(q.hp<=0&&q.f.ability==="Thousand Young"&&!q.young){ q.young=1; q.hp=Math.max(1,Math.round(q.maxhp*0.25)); q.st=null; this.ev.push({t:"ability",i:q.i,name:"Thousand Young"}); this.ev.push({t:"heal",i:q.i,amt:q.hp,src:"young"}); }   // Shub
    for(const q of this.p) if(q.hp<=0&&q.f.ability==="Undying"&&!q.undying){ q.undying=1; q.hp=Math.max(1,Math.round(q.maxhp*0.1)); q.st=null; this.ev.push({t:"ability",i:q.i,name:"Undying"}); this.ev.push({t:"heal",i:q.i,amt:q.hp,src:"undying"}); }   // Mummy
    const [a,b]=this.p; if(a.hp<=0||b.hp<=0){ this.over=true; this.winner=a.hp<=0&&b.hp<=0?null:a.hp<=0?1:0; } }
  heal(f,amt,src,from){ const n=Math.max(0,Math.min(Math.round(amt),f.maxhp-f.hp)); if(f.hp<=0) return 0; f.hp+=n; this.ev.push({t:"heal",i:f.i,amt:n,src,from}); return n; }
  inflict(f,name,pct,from){
    if(f.hp<=0||f.st||f.buff.ward||!AR_STATUS[name]) return false;
    if(name==="Freeze"&&(f.thawT>0||f.f.ability==="Thick Fur"||f.f.ability==="Cosy")) return false;
    if(name==="Poison"&&(f.f.el1==="Steel"||f.f.el2==="Steel")&&!(from&&from.f.ability==="Corrosion")) return false;   // Venom's Corrosion can Poison metal
    if(name==="Freeze"&&from&&from.f.ability==="Permafrost") pct*=2;
    if(name==="Root"&&f.f.ability==="Slow and Sure"){ this.ab(f,"Slow and Sure"); return false; }   // Trundle
    if((name==="Poison"||name==="Curse"||name==="Burn")&&f.f.ability==="Pure Step"){ this.ev.push({t:"ability",i:f.i,name:"Pure Step"}); return false; }   // Kirin
    if(name==="Root"&&f.f.ability==="All Doors"){ this.ev.push({t:"ability",i:f.i,name:"All Doors"}); return false; }   // Yog
    if(name==="Soak"&&f.f.ability==="Deep Song"){ this.ab(f,"Deep Song"); this.heal(f,f.maxhp*0.05,"deepsong"); return false; }   // Dagon: a Soak heals it instead
    if(name==="Root"&&f.f.ability==="Sky King"){ this.ev.push({t:"ability",i:f.i,name:"Sky King"}); return false; }   // Garuda
    if(name==="Blind"&&f.f.ability==="Bright"){ this.ev.push({t:"ability",i:f.i,name:"Bright"}); return false; }   // Lern's Bright
    if(this.rand()*100>=pct) return false;
    if(f.f.ability==="Sanctuary"&&f.hp>=f.maxhp){ this.ab(f,"Sanctuary"); return false; }   // Light's Sanctuary: nothing lands while its HP is full
    if(name==="Crack"&&f.f.ability==="Unbreakable"){ this.ab(f,"Unbreakable"); return false; }
    if(from&&from!==f){ if(name==="Burn"&&from.f.ability==="Wildfire") this.ab(from,"Wildfire",true); if(from.f.ability==="Volatile") this.ab(from,"Volatile",true); }
    f.st={name,wild:name==="Burn"&&!!from&&from.f.ability==="Wildfire",t:AR_STATUS[name].d*(from&&from.f.ability==="Volatile"?1.3:1)*(name==="Dread"&&from&&from.f.ability==="Dreamer"?2:1),from:from?from.i:null,tick:0}; this.ev.push({t:"status",i:f.i,name}); return true; }   // Volatile: Fizz's statuses last 30% longer
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
    if(!this.opened){ for(const q of this.p) if(q.f.ability==="Mimic"){ const o=this.p[1-q.i]; if(o.f.ability&&o.f.ability!=="Mimic"){ q.f={...q.f,ability:o.f.ability,abilityText:null}; q.mimic=1; this.ev.push({t:"ability",i:q.i,name:"Mimic"}); } }   // Shoggoth copies its foe's ability before anything else opens
      for(const q of this.p) if(q.f.ability==="Yellow Sign"){ const o=this.p[1-q.i]; this.ab(q,"Yellow Sign"); if(this.inflict(o,"Curse",100,q)) o.st.t=6; }   // Hastur
    }
    if(!this.opened){ this.opened=true; for(const q of this.p) if(q.f.ability==="Beguile"){ this.ab(q,"Beguile"); this.stage(this.p[1-q.i],{pow:1},-1,q); }
      for(const q of this.p) if(q.f.ability==="Fright"){ this.ab(q,"Fright"); this.stage(this.p[1-q.i],{spd:1},-1,q); } }   // Jack's Fright   // Charm's Beguile
    for(const p of this.p){ if(!p.buff.brace) p.focus=Math.min(99,p.focus+this.regen(p)*AR.DT*(p.f.ability==="Steeping"&&(p.walkT==null||this.t-p.walkT>0.5)?1.1:1)*(p.f.ability==="Wind Up"?1.15:1)*(this.p[1-p.i].f.ability==="Lullaby"?0.9:1));   // Ditty's Lullaby   // Tock's Wind Up   // Teep's Steeping
      for(const k of ["cool","hold","slow","stun","sleep","thawT","shoveCool","think"]) p[k]=Math.max(0,p[k]-AR.DT);
      for(const k in p.buff){ p.buff[k]-=AR.DT; if(p.buff[k]<=0){ delete p.buff[k]; this.ev.push({t:"unbuff",i:p.i,k}); } }
      for(const k in p.stgT){ p.stgT[k]-=AR.DT; if(p.stgT[k]<=0){ delete p.stgT[k]; p.stg[k]=0; this.ev.push({t:"stage",i:p.i,k,n:0,end:1}); } }
      if(p.f.ability==="Nap"&&p.hp>0){ if(p.walkT!=null&&this.t-p.walkT<0.3) p.napT=0; else { p.napT=(p.napT||0)+AR.DT; if(p.napT>=2){ p.napT-=2; if(p.hp<p.maxhp){ this.ab(p,"Nap",true); this.heal(p,p.maxhp*0.03,"heal"); } } } }   // Snooze
      if(p.f.ability==="Wind-Up Key"&&p.hp>0){ p.keyT=(p.keyT||0)+AR.DT; if(p.keyT>=10){ p.keyT-=10; this.ab(p,"Wind-Up Key"); this.stage(p,{spd:1},1,p); } }   // Clank
      if(p.f.ability==="Study"&&p.hp>0){ p.studyT=(p.studyT||0)+AR.DT; if(p.studyT>=12){ p.studyT-=12; this.ab(p,"Study"); this.stage(p,{mnd:1},1,p); } }   // Tome
      if(p.f.ability==="Clean Sweep"&&p.hp>0){ p.sweepCD=Math.max(0,(p.sweepCD||0)-AR.DT); p.sweepHeld=p.st&&!p.sweepCD?(p.sweepHeld||0)+AR.DT:0;
        if(p.sweepHeld>=1.5){ this.ev.push({t:"cure",i:p.i,name:p.st.name}); p.st=null; p.sweepHeld=0; p.sweepCD=10; this.ab(p,"Clean Sweep"); } }   // Vroom
      if(p.f.ability==="Regrow"&&p.hp>0){ p.regT=(p.regT||0)+AR.DT; if(p.regT>=3){ p.regT-=3; if(p.hp<p.maxhp){ this.ab(p,"Regrow",true); this.heal(p,p.maxhp*0.02,"heal"); } } }   // Glop's Regrow
      if(p.f.ability==="Blessing"&&p.hp>0){ p.blessT=(p.blessT||0)+AR.DT; if(p.blessT>=2){ p.blessT-=2; if(p.hp<p.maxhp){ this.ab(p,"Blessing",true); this.heal(p,p.maxhp*0.01,"heal"); } } }   // Diwata
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
    const popHit=p.f.ability==="Pop Up"&&!p.popped&&m.dmg; if(popHit){ p.popped=1; this.ab(p,"Pop Up"); }   // Sizzle's first hit can't miss
    if(!popHit&&!slip&&roll<=this.hitChance(p,m)&&o.f.ability==="Trick Leaf"&&!o.trick&&m.dmg){ o.trick=1; this.ab(o,"Trick Leaf"); this.ev.push({t:"miss",i:p.i,m,why:"phase"}); return; }   // Tanuki
    if(!popHit&&(slip||roll>this.hitChance(p,m))){ this.ev.push({t:"miss",i:p.i,m,why:o.buff.phase&&!m.noDodge&&!slip?"phase":"dodge"}); if(o.f.ability==="Counterpunch"){ o.cpunch=1; this.ev.push({t:"ability",i:o.i,name:"Counterpunch"}); } return; }   // Bipped's Counterpunch
    if(m.el==="Spark"&&m.dmg&&o.f.ability==="Lightning Rod"){ this.ab(o,"Lightning Rod"); this.heal(o,o.maxhp*0.25,"rod"); return; }   // Spark's Lightning Rod soaks it up
    // a mirror sends a Cast back at whoever threw it
    let tg=o; if(o.buff.mirror&&m.cast&&m.dmg){ delete o.buff.mirror; this.ev.push({t:"mirror",i:o.i,m}); tg=p; }
    const hitBy=tg===p?o:p;   // whose hit it counts as on screen
    if(m.swap){ const x=p.x; p.x=o.x; o.x=x; this.ev.push({t:"swap",i:p.i,m}); }
    const bite=p.f.ability==="Three Bites"&&!m.cast&&m.range==="Close"&&m.dmg&&!m.hitsRange&&(m.hits||1)===1&&tg===o; if(bite) this.ab(p,"Three Bites",true);   // Cerberus
    const nh=bite?2:m.hitsRange?m.hitsRange[0]+Math.floor(R()*(m.hitsRange[1]-m.hitsRange[0]+1)):(m.hits||1);
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
      if(tg.f.ability==="Pressure"&&m.el==="Tide"){ dmg*=0.75; if(h===0) this.ab(tg,"Pressure",true); }   // Helm
      if(tg.f.ability==="Cosy"&&m.el==="Frost"){ dmg*=0.85; if(h===0) this.ab(tg,"Cosy",true); }   // Sox
      if(p.f.ability==="Headlong"&&m.dash){ dmg*=1.2; if(h===0) this.ab(p,"Headlong",true); }   // Minotaur
      if(tg.f.ability==="Dragon Scale"&&(m.el==="Blaze"||m.el==="Frost")){ dmg*=0.8; if(h===0) this.ab(tg,"Dragon Scale",true); }   // Dragon
      if(bite) dmg*=0.6;
      if(p.f.ability==="Deep Song"&&m.el==="Tide"){ dmg*=1.2; if(h===0) this.ab(p,"Deep Song",true); }   // Dagon
      if(p.f.ability==="Long Sight"&&(m.range==="Far"||m.range==="Mid")){ dmg*=1.15; if(h===0) this.ab(p,"Long Sight",true); }   // Griffin
      if(tg.f.ability==="Moon Eater"&&m.el==="Light"){ dmg*=0.7; if(h===0) this.ab(tg,"Moon Eater",true); }   // Bakunawa
      if(tg.f.ability==="Three Wishes"&&m.cast){ if(h===0){ tg.wishNow=(tg.wishes||0)<3; if(tg.wishNow){ tg.wishes=(tg.wishes||0)+1; this.ab(tg,"Three Wishes"); } } if(tg.wishNow) dmg*=0.5; }   // Djinn
      if(tg.f.ability==="Riddle"&&m.cast){ dmg*=0.8; if(h===0) this.ab(tg,"Riddle",true); }   // Sphinx
      if(tg.f.ability==="Stone Skin"){ dmg*=0.9; if(h===0) this.ab(tg,"Stone Skin",true); }   // Golem
      if(tg.f.ability==="Wobble"&&!tg.wob){ tg.wob=1; dmg*=0.7; this.ab(tg,"Wobble"); }   // Squib's Wobble
      if(m.hpScale) dmg*=0.4+0.6*p.hp/p.maxhp;
      if(tg.f.ability==="Thick Fur"&&(m.el==="Blaze"||m.el==="Frost")){ dmg*=0.75; if(h===0) this.ev.push({t:"ability",i:tg.i,name:"Thick Fur"}); }   // Yeti
      if(m.ifPoison&&this.has(tg,"Poison")||m.ifStatus&&tg.st) dmg*=2;
      if(m.el==="Spark"&&this.has(tg,"Soak")) dmg*=1.25;
      let shatter=false; if(this.has(tg,"Freeze")){ dmg*=1.25*(p.f.ability==="Permafrost"?1.2:1); shatter=true; if(p.f.ability==="Permafrost") this.ab(p,"Permafrost",true); }
      const sky=p.f.ability==="Sky High"&&!p.sky&&tg===o; if(sky){ p.sky=1; this.ev.push({t:"ability",i:p.i,name:"Sky High"}); }   // Eagle's Sky High
      const rolled=!tg.buff.bulwark&&R()<m.sharp+edge(this.eff(p,"pow"),con,0.2,0,0.12)+(p.f.critBonus||0)+(p.f.ability==="Lucky Coin"?0.12:0)+(p.f.ability==="Good Omen"?0.1:0), shell=(tg.f.ability==="Shell"||tg.f.ability==="Stone Skin"||tg.f.ability==="Hard Hide")&&rolled&&!sky&&!sure;
      const crit=sky||sure||rolled&&!shell; if(crit) dmg*=1.5; if(shell) this.ab(tg,tg.f.ability==="Hard Hide"?"Hard Hide":"Shell",true); if(crit&&rolled&&p.f.ability==="Lucky Coin") this.ab(p,"Lucky Coin",true); if(crit&&rolled&&p.f.ability==="Good Omen") this.ab(p,"Good Omen",true);   // Pinch's Shell stops crits; Lucky bit and Sunglasses add to them
      if(p.cpunch&&!m.cast&&tg===o) dmg*=1.2;
      if(tg.buff.brace) dmg*=0.6; if(tg.buff.bunker) dmg*=0.8; if(tg.buff.castWard&&m.cast) dmg*=0.5;
      dmg=Math.max(1,Math.round(dmg*(0.9+R()*0.1)));
      if(tg.f.ability==="Bedrock"&&tg.hp>=tg.maxhp&&dmg>=tg.hp){ dmg=tg.hp-1; this.ab(tg,"Bedrock"); }   // Stone's Bedrock
      if(tg.buff.endure&&dmg>=tg.hp){ dmg=Math.max(0,tg.hp-1); delete tg.buff.endure; this.ev.push({t:"endure",i:tg.i}); }
      if(tg.f.ability==="Inner Doll"&&!tg.innerDoll&&dmg>=tg.hp&&tg.hp>1){ tg.innerDoll=1; dmg=tg.hp-1; this.ab(tg,"Inner Doll"); }   // Nesta
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
    if(tg===o&&total&&p.hp>0){ if(p.f.ability==="Tropical"&&p.hp<p.maxhp){ this.ab(p,"Tropical",true); this.heal(p,p.maxhp*0.02,"heal"); }   // Pina
      if(p.f.ability==="Spin Up"){ p.spinHits=(p.spinHits||0)+1; if(p.spinHits%3===0){ this.ab(p,"Spin Up"); this.stage(p,{spd:1},1,p); } } }   // Yoyo
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Misdirect"&&R()<0.2){ this.ab(p,"Misdirect"); this.stage(o,{spr:1},-1,p); }   // Presto
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Flash Bulb"&&!p.flashed){ p.flashed=1; if(!o.st&&this.inflict(o,"Blind",100,p)) this.ab(p,"Flash Bulb"); }   // Shutter
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Drizzle"&&!o.st&&R()<0.15&&this.inflict(o,"Soak",100,p)) this.ab(p,"Drizzle");   // Nimbo
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Shaken"&&!o.st&&R()<0.15&&this.inflict(o,"Daze",100,p)) this.ab(p,"Shaken");   // Swirl
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Smudge"&&!o.st&&R()<0.15&&this.inflict(o,"Blind",100,p)) this.ab(p,"Smudge");   // Inky
    if(tg===o&&!m.cast&&m.range==="Close"&&total&&o.hp>0){
      if(o.f.ability==="Spores"&&!p.st&&R()<0.2&&this.inflict(p,"Daze",100,o)) this.ab(o,"Spores");   // Puff
      if(o.f.ability==="Sting"&&!p.st&&R()<0.2&&this.inflict(p,"Shock",100,o)) this.ab(o,"Sting");   // Bloop
      if(o.f.ability==="Molten"&&!p.st&&R()<0.2&&this.inflict(p,"Burn",100,o)) this.ab(o,"Molten");   // Lava
      if(p.f.ability==="Chill Touch"&&!o.st&&R()<0.1&&this.inflict(o,"Freeze",100,p)) this.ab(p,"Chill Touch");   // Scoop
      if(o.f.ability==="Bouncy"&&p.hp>0&&!this.over){ this.ab(o,"Bouncy",true); this.stepMove(p,{step:-14}); }   // Gumball
      if(o.f.ability==="Spring Step"&&o.hp>0&&!this.over){ this.ab(o,"Spring Step",true); this.stepMove(o,{step:-18}); }   // Pogo
      if(o.f.ability==="Prickly"&&p.hp>0){ const back=Math.max(1,Math.round(p.maxhp/16)); p.hp=Math.max(0,p.hp-back); o.dealt+=back; this.ab(o,"Prickly",true); this.ev.push({t:"recoil",i:p.i,dmg:back}); }   // Spine
      if(p.f.ability==="Dirt Kick"&&!o.st&&R()<0.15&&this.inflict(o,"Blind",100,p)) this.ab(p,"Dirt Kick");   // Burr
      if(p.f.ability==="Grapple"&&!o.st&&R()<0.25&&this.inflict(o,"Root",100,p)) this.ab(p,"Grapple");   // Kraken
      if(p.f.ability==="Hit and Run"&&p.hp>0&&!this.over){ this.ab(p,"Hit and Run",true); this.stepMove(p,{step:-18}); } }   // Flit
    if(tg===o&&o.f.ability==="Coil"&&!m.cast&&m.range==="Close"&&total&&o.hp>0&&R()<0.25&&!p.st){ this.ev.push({t:"ability",i:o.i,name:"Coil"}); this.inflict(p,"Root",100,o); }   // Naga
    if(tg===o&&total&&!m.cast&&o.hp>0&&p.hp>0){   // abilities that answer a Strike that landed
      if(o.f.ability==="Hothead"&&!p.st&&R()<0.1&&this.inflict(p,"Burn",100,o)) this.ab(o,"Hothead");
      if(o.f.ability==="Static Skin"&&!p.st&&R()<0.2&&this.inflict(p,"Shock",100,o)) this.ab(o,"Static Skin");
      if(p.f.ability==="Toxic Touch"&&!o.st&&R()<0.1&&this.inflict(o,"Poison",100,p)) this.ab(p,"Toxic Touch"); }
    if(tg===o&&total&&p.f.ability==="Gnaw"&&!m.cast&&m.range==="Close"&&p.hp>0){ this.ab(p,"Gnaw",true); this.heal(p,total*0.1,"gnaw"); }   // Ghoul
    if(tg===o&&total&&o.hp>0&&p.f.ability==="Tickle"&&this.rand()<0.2&&this.inflict(o,"Daze",100,p)) this.ab(p,"Tickle");   // Nightgaunt
    if(tg===o&&total&&o.hp>0&&p.f.ability==="Dreamer"&&this.rand()<0.15&&this.inflict(o,"Dread",100,p)) this.ab(p,"Dreamer");   // Cthulhu
    if(tg===o&&total&&o.hp>0&&o.f.ability==="Brain Jar"&&m.cast&&(o.jars||0)<3){ o.jars=(o.jars||0)+1; this.ab(o,"Brain Jar"); this.stage(o,{mnd:1},1); }   // Migo
    if(tg===o&&total&&o.hp>0&&o.f.ability==="Heat Up"&&m.el==="Blaze"){ this.ab(o,"Heat Up"); this.stage(o,{pow:1},1); }   // Salamander
    if(tg===o&&total&&o.hp>0&&p.f.ability==="Stormborn"&&!o.st&&R()<0.15&&this.inflict(o,"Shock",100,p)) this.ab(p,"Stormborn");   // Thunderbird
    if(tg===o&&m.cast&&total&&o.hp>0&&p.f.ability==="Siren"&&!o.st&&R()<0.2&&this.inflict(o,"Daze",100,p)) this.ab(p,"Siren");   // Mermaid
    if(m.basic&&tg===o&&total&&o.hp>0&&p.f.ability==="Web"&&R()<0.3){ this.ab(p,"Web"); this.stage(o,{spd:1},-1,p); }   // Skit's Web
    if(tg===o&&m.cast&&total&&lastMul<1&&o.f.ability==="Reflect"&&p.hp>0){ const back=Math.max(1,Math.round(total*0.3)); p.hp=Math.max(0,p.hp-back); o.dealt+=back; this.ab(o,"Reflect"); this.ev.push({t:"recoil",i:p.i,dmg:back}); }   // Steel's Reflect
    if(m.recoil&&total){ const r=Math.max(1,Math.round(total*m.recoil)); p.hp=Math.max(0,p.hp-r); this.ev.push({t:"recoil",i:p.i,dmg:r}); }
    if(m.steal&&tg===o){ const f=Math.min(o.focus,m.steal*6); o.focus-=f; p.focus=Math.min(99,p.focus+f); this.ev.push({t:"steal",i:p.i,amt:Math.round(f)}); }
    if(m.status&&tg.hp>0) this.inflict(tg,m.status[0],m.status[1]*this.statusOdds(p,tg),hitBy===p?p:o);
    if(m.lower&&tg.hp>0&&R()*100<(m.lowerChance||100)) this.stage(tg,m.lower,-1,hitBy);
    if(m.selfLower) this.stage(p,m.selfLower,-1);
    if(m.wither){ const w=m.wither*(1+edge(this.eff(p,"mnd"),this.eff(o,"spr"),0.5,-0.3,0.5)); if(o.buff.unblink){} else if(o.buff.feedback) p.focus=Math.max(0,p.focus-w); else o.focus=Math.max(0,o.focus-w); }
    if(m.push&&tg===o&&!o.buff.brace&&!o.buff.bunker){
      const k=(1+edge(this.eff(p,m.cast?"mnd":"pow"),this.eff(o,"grd"),0.5,-0.4,0.4))*(p.f.ability==="Heavy Hands"&&!m.cast&&m.push>0?1.5:1)*(p.f.ability==="Gust"&&m.cast&&m.push>0?1.3:1), s=m.push*k*(this.has(o,"Root")?0.5:1)*(o.f.ability==="Steady"&&m.push>0?0.5:1)*(o.f.ability==="Deep Roots"&&m.push>0?0:1)*(p.f.ability==="Pull"&&!m.cast&&m.push>0?-1:1);   // Plod's Steady, Twiglet's Deep Roots, Magna's Pull turns a shove into a pull
      if(o.f.ability==="Steady"&&m.push>0) this.ab(o,"Steady",true);
      if(o.f.ability==="Mountain"&&m.push>0) this.ab(o,"Mountain",true);   // Gug
      if(p.f.ability==="Gust"&&m.cast&&m.push>0) this.ab(p,"Gust",true);   // Tengu
      const s2=o.f.ability==="Mountain"&&s>0?0:s;
      if(s2>0){ const want=o.x+d*s2, wall=d>0?AR.LEN:0, past=Math.abs(want-wall)*(d>0?want>wall:want<wall); o.x=Math.max(0,Math.min(AR.LEN,want));
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
  f.family=arFamily(fam); let mv=arMoves(f.family,level,(known||[]).filter(n=>SKILLS[n]),el,o.learned);
  if(o.uses) mv=mv.map(m=>SKILLS[m.name]&&(o.uses[m.name]||0)>=(typeof MASTERY!=="undefined"?MASTERY:20)&&m.dmg?{...m,dmg:Math.round(m.dmg*1.1),mastered:true}:m);
  if(o.off&&o.off.length){ const keep=mv.filter(m=>!o.off.includes(m.name)); if(keep.some(m=>m.dmg)) mv=keep; }
  f.moves=mv; if(o.habit) f.habit=o.habit; return f;
}
/* the player's Snabit as an arena fighter, with its fight-day shape, gear, mastery and chosen preset */
function arPlayer(s){
  const f=playerFighter(s), pre=s.arPresets&&s.arPresets[s.arPreset||0];
  s.arHabit=s.arHabit||{};
  return arFighter(f,s.m.family,s.level,typeof knownSkills==="function"?knownSkills(s):(s.skillsKnown||s.equip||[]),s.m.el1,{uses:s.uses,off:pre,habit:s.arHabit,learned:s.famMoves||[]});
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
