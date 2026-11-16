/* How statuses, heals, drains, shields, buffs and dodges look in the arena. arena-ui.js calls into this file:
   atFx(e,now) for each engine event, atPlanDodge when a move that will miss starts, atBody to draw a Snabit with its status tint,
   atFxBack and atFxFront around each Snabit, atStreams for drain orbs, atParts for the little particles, and atChips under each HP bar.
   Everything is in arena units and runs on the fight's clock (AT.te), so it all holds still during hitstop. */
const AT_ST={Burn:{c:[255,112,40],el:"Blaze"},Poison:{c:[164,92,232],el:"Venom"},Root:{c:[96,180,72],el:"Wild"},Freeze:{c:[150,222,255],el:"Frost"},
  Shock:{c:[255,224,60],el:"Spark"},Soak:{c:[74,146,240],el:"Tide"},Daze:{c:[255,132,192],el:"Charm"},Crack:{c:[170,118,66],el:"Stone"},
  Blind:{c:[150,146,170],el:"Light"},Curse:{c:[140,86,190],el:"Shade"},Dread:{c:[110,80,190],el:"Void"}};
const AT_STAT_SHORT={pow:"Pow",grd:"Con",mnd:"Mind",spr:"Ins",spd:"Spd"};
const atRgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;
const atH=n=>{ const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };   // a steady random number from a seed

/* ---------- sounds ---------- */
function atSfx(kind,el){
  try{ const d=typeof sfxBus==="function"?sfxBus():null; if(!d) return; MC=AC; const t=AC.currentTime+0.01;
    if(kind==="heal") [523,659,784,1047].forEach((f,k)=>sTone(d,t+k*0.06,"triangle",f,f*1.01,0.22,0.07));
    else if(kind==="shield") { sTone(d,t,"sine",1250,1600,0.25,0.09); sTone(d,t+0.03,"triangle",1870,1900,0.3,0.04); }
    else if(kind==="shatter"){ for(let k=0;k<6;k++) dNoise(d,t+k*0.025,0.06,0.2,"highpass",3500+k*400,1.5); sTone(d,t,"triangle",2400,900,0.3,0.06); }
    else if(kind==="dodge") dNoise(d,t,0.14,0.12,"bandpass",1400,0.9);
    else if(kind==="status"&&typeof elSfx==="function"){ elSfx(el,"hit"); sTone(d,t,"sine",420,260,0.3,0.06); }
    else if(kind==="tick"&&typeof elSfx==="function") elSfx(el,"cast");
    else if(kind==="up") [440,554,659].forEach((f,k)=>sTone(d,t+k*0.05,"square",f,f,0.1,0.03));
    else if(kind==="down") [659,523,392].forEach((f,k)=>sTone(d,t+k*0.05,"square",f,f,0.1,0.03));
    else if(kind==="cleanse") [1047,1319,1568,2093].forEach((f,k)=>sTone(d,t+k*0.04,"sine",f,f,0.25,0.05));
    else if(kind==="thaw") for(let k=0;k<5;k++) sTone(d,t+k*0.09,"sine",1800-k*120,900,0.06,0.05);
    else if(kind==="endure"){ sTone(d,t,"triangle",196,190,0.9,0.1); sTone(d,t,"triangle",392,388,0.7,0.05); }
    else if(kind==="recoil"){ dKick(d,t,0.35); dNoise(d,t,0.08,0.15,"lowpass",600); }
    else if(kind==="steal") [880,660,440].forEach((f,k)=>sTone(d,t+k*0.05,"sine",f,f*0.9,0.08,0.05));
    else if(kind==="sleep") [523,392].forEach((f,k)=>sTone(d,t+k*0.25,"sine",f,f,0.4,0.05));
    else if(kind==="wake"){ sTone(d,t,"sine",400,900,0.1,0.07); }
    else if(kind==="step") dNoise(d,t,0.12,0.12,"lowpass",900);
    else if(kind==="ko"){ dKick(d,t,1); dNoise(d,t,0.5,0.4,"lowpass",500); sTone(d,t+0.1,"triangle",440,110,0.8,0.08); }
    else if(kind==="ab:Sky High"){ sTone(d,t,"sawtooth",2400,1400,0.35,0.035); dNoise(d,t,0.3,0.1,"bandpass",2200,2); }
    else if(kind==="ab:Bloodsuck"){ sTone(d,t,"sine",500,180,0.4,0.08); dKick(d,t+0.15,0.35); dKick(d,t+0.32,0.3); }
    else if(kind==="ab:Rebirth"){ dNoise(d,t,0.9,0.18,"lowpass",900); [392,523,659,784,1047].forEach((f,k)=>sTone(d,t+0.2+k*0.08,"triangle",f,f,0.6,0.06)); }
    else if(kind==="ab:Illusion"){ [1568,1318,1046,1318,1568].forEach((f,k)=>sTone(d,t+k*0.05,"sine",f,f*1.02,0.25,0.05)); dNoise(d,t,0.4,0.06,"highpass",6000); }
    else if(kind==="ab:Coil"){ dNoise(d,t,0.5,0.14,"highpass",5200,1.2); sTone(d,t+0.05,"sine",260,200,0.4,0.05); }
    else if(kind==="ab:Thick Fur"){ dNoise(d,t,0.18,0.25,"lowpass",500); sTone(d,t,"sine",180,120,0.2,0.08); }
    else if(kind==="ab:Bright") [1318,1760].forEach((f,k)=>sTone(d,t+k*0.07,"triangle",f,f,0.3,0.06));
    else if(kind==="ab:Wobble"){ const o=mo("sine",330,t),l=mo("sine",11,t),lg=MC.createGain(),g=MC.createGain(); lg.gain.value=60; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.08,t+0.03); g.gain.exponentialRampToValueAtTime(0.0001,t+0.45); o.connect(g); g.connect(d); o.start(t); l.start(t); o.stop(t+0.5); l.stop(t+0.5); }   // a jelly wobble
    else if(kind==="ab:Big Bite"){ sTone(d,t,"square",700,250,0.06,0.06); dKick(d,t+0.02,0.4); dNoise(d,t+0.02,0.07,0.2,"bandpass",2400,2); }   // a snap of jaws
    else if(kind==="ab:Keen Eye"){ sTone(d,t,"sine",2637,2700,0.18,0.05); sTone(d,t+0.06,"sine",3520,3600,0.25,0.035); }   // a glint
    else if(kind==="ab:Long Stride"){ sTone(d,t,"sine",400,1200,0.18,0.06); dNoise(d,t,0.2,0.1,"bandpass",1600,1); }   // off the mark
    else if(kind==="ab:Web"){ sTone(d,t,"sine",1200,250,0.2,0.07); dNoise(d,t+0.05,0.25,0.08,"lowpass",900); }   // a sticky thwip
    else if(kind==="ab:Gust") dNoise(d,t,0.35,0.16,"bandpass",1400,0.8);   // a rush of wind
    else if(kind==="ab:Trick Leaf"){ sTone(d,t,"sine",900,1500,0.12,0.06); dNoise(d,t+0.05,0.2,0.08,"highpass",3000); }   // a pop and a rustle
    else if(kind==="ab:Siren") [988,1319,1175].forEach((f,k)=>sTone(d,t+k*0.12,"sine",f,f,0.3,0.05));   // three notes of a song
    else if(kind==="ab:Blessing") [1568,2093].forEach((f,k)=>sTone(d,t+k*0.06,"triangle",f,f,0.2,0.03));
    else if(kind==="ab:Riddle"){ sTone(d,t,"triangle",440,660,0.2,0.06); sTone(d,t+0.15,"triangle",660,440,0.25,0.05); }
    else if(kind==="ab:Sky King"){ sTone(d,t,"sawtooth",1600,2400,0.25,0.035); }
    else if(kind==="ab:Full Moon"){ sTone(d,t,"sawtooth",300,600,0.5,0.05); sTone(d,t+0.1,"triangle",600,900,0.6,0.05); }   // a howl
    else if(kind==="ab:Headlong"){ dKick(d,t,0.5); dNoise(d,t,0.15,0.2,"lowpass",700); }
    else if(kind==="ab:Dragon Scale"){ sTone(d,t,"triangle",500,300,0.15,0.06); dNoise(d,t,0.1,0.1,"highpass",3000); }
    else if(kind==="ab:Regrowth"){ sTone(d,t,"triangle",400,800,0.4,0.05); sTone(d,t+0.15,"sine",800,1200,0.3,0.04); }
    else if(kind==="ab:Long Sight"){ sTone(d,t,"sine",1800,2600,0.15,0.04); }
    else if(kind==="ab:Pure Step"){ sTone(d,t,"sine",1200,1600,0.3,0.05); sTone(d,t+0.08,"sine",1600,2000,0.3,0.04); }
    else if(kind==="ab:Heat Up"){ dNoise(d,t,0.3,0.15,"lowpass",1500); sTone(d,t,"sawtooth",200,400,0.3,0.04); }
    else if(kind==="ab:Moon Eater"){ sTone(d,t,"sine",500,250,0.4,0.06); }
    else if(kind==="ab:Three Bites"){ dKick(d,t,0.3); dKick(d,t+0.09,0.3); }
    else if(kind==="ab:Three Wishes"){ sTone(d,t,"triangle",900,1800,0.3,0.05); dNoise(d,t,0.2,0.08,"highpass",4000); }
    else if(kind==="ab:Hard Hide"){ dKick(d,t,0.4); sTone(d,t,"triangle",300,200,0.12,0.06); }
    else if(kind==="ab:Undying"){ sTone(d,t,"sawtooth",150,90,0.6,0.05); dNoise(d,t+0.2,0.4,0.1,"lowpass",900); }
    else if(kind==="ab:Dreamer"){ sTone(d,t,"sine",220,180,0.6,0.05); sTone(d,t+0.1,"sine",330,260,0.5,0.03); }
    else if(kind==="ab:Yellow Sign"){ sTone(d,t,"triangle",440,415,0.5,0.05); sTone(d,t,"triangle",466,440,0.5,0.04); }
    else if(kind==="ab:Mimic"){ sTone(d,t,"sine",300,600,0.2,0.05); sTone(d,t+0.2,"sine",600,300,0.2,0.05); }
    else if(kind==="ab:Deep Song"){ sTone(d,t,"sine",392,392,0.4,0.05); sTone(d,t+0.2,"sine",523,523,0.4,0.04); }
    else if(kind==="ab:Brain Jar"){ sTone(d,t,"square",800,1400,0.15,0.03); }
    else if(kind==="ab:Tickle"){ for(let k=0;k<4;k++) sTone(d,t+k*0.05,"sine",1200+k*200,1500+k*200,0.05,0.03); }
    else if(kind==="ab:Gnaw"){ dKick(d,t,0.2); dKick(d,t+0.08,0.2); }
    else if(kind==="ab:Mountain"){ dKick(d,t,0.5); dNoise(d,t,0.3,0.1,"lowpass",400); }
    else if(kind==="ab:All Doors"){ sTone(d,t,"sine",600,1200,0.3,0.04); sTone(d,t+0.15,"sine",900,1800,0.3,0.03); }
    else if(kind==="ab:Thousand Young"){ sTone(d,t,"triangle",500,700,0.2,0.05); sTone(d,t+0.2,"triangle",700,900,0.2,0.05); }
    else if(kind==="ab:Good Omen"){ sTone(d,t,"square",1000,1500,0.12,0.03); sTone(d,t+0.1,"square",1500,2000,0.12,0.03); }
    else if(kind==="ab:Stormborn"){ dNoise(d,t,0.2,0.2,"highpass",2000,1); sTone(d,t,"square",1800,600,0.15,0.04); }
    else if(kind==="ab:Slippery"){ sTone(d,t,"sine",500,1400,0.22,0.07); }   // a slide whistle
    else if(kind==="ab:Shell"||kind==="ab:Unbreakable"||kind==="ab:Bedrock"||kind==="ab:Plated"||kind==="ab:Steady"){ dKick(d,t,0.4); [523,1250,2100].forEach(f=>sTone(d,t,"square",f,f*0.98,0.18,0.025)); }   // a hard clank
    else if(kind==="ab:Hothead"||kind==="ab:Wildfire"){ for(let k=0;k<4;k++) dNoise(d,t+k*0.03,0.05,0.18,"bandpass",1800+k*500,2); dNoise(d,t,0.35,0.12,"lowpass",700); }   // a flare of fire
    else if(kind==="ab:Static Skin"){ sTone(d,t,"square",2400,200,0.1,0.05); dNoise(d,t,0.06,0.18,"highpass",5000); }   // a zap
    else if(kind==="ab:Lightning Rod"){ sTone(d,t,"square",2400,200,0.1,0.04); [784,1047,1319].forEach((f,k)=>sTone(d,t+0.1+k*0.05,"triangle",f,f,0.25,0.05)); }   // a zap, then it charges up
    else if(kind==="ab:Sunbather") [659,880].forEach((f,k)=>sTone(d,t+k*0.08,"sine",f,f,0.35,0.035));   // a warm two-note chime
    else if(kind==="ab:Bloom"){ for(let k=0;k<3;k++) dNoise(d,t+k*0.05,0.06,0.1,"highpass",3000,0.8); [523,659,784].forEach((f,k)=>sTone(d,t+0.1+k*0.05,"triangle",f,f,0.25,0.04)); }   // leaves, then a lift
    else if(kind==="ab:Permafrost") [2093,2637,3136].forEach((f,k)=>sTone(d,t+k*0.04,"sine",f,0,0.3,0.05));   // an icy chime
    else if(kind==="ab:Undertow"){ dNoise(d,t,0.5,0.16,"lowpass",600); sTone(d,t,"sine",300,140,0.4,0.05); }   // a pull of water
    else if(kind==="ab:Insulated"){ dNoise(d,t,0.3,0.12,"highpass",4000,0.8); sTone(d,t,"sine",300,250,0.25,0.05); }   // a hiss as the fire dies
    else if(kind==="ab:Defiant") [392,523,659].forEach((f,k)=>sTone(d,t+k*0.06,"sawtooth",f,f,0.14,0.04));   // a power-up
    else if(kind==="ab:Last Stand"){ dKick(d,t,0.6); dKick(d,t+0.22,0.5); [523,659,784,1047].forEach((f,k)=>sTone(d,t+0.35+k*0.06,"triangle",f,f,0.3,0.05)); }   // a heartbeat, then a second wind
    else if(kind==="ab:Toxic Touch"||kind==="ab:Corrosion"||kind==="ab:Volatile") [0,1,2].forEach(k=>sTone(d,t+k*0.07,"sine",280+k*90,500+k*90,0.08,0.07));   // bubbles
    else if(kind==="ab:Beguile"||kind==="ab:Mirror Mind") [1319,1047,1568,1319].forEach((f,k)=>sTone(d,t+k*0.06,"triangle",kind==="ab:Mirror Mind"?f*1.5:f,0,0.25,0.04));   // a little charm run
    else if(kind==="ab:Halo"||kind==="ab:Sanctuary") [1047,1319,1568].forEach(f=>sTone(d,t,"triangle",f,0,0.6,0.04));   // a bell chord
    else if(kind==="ab:Reflect"){ sTone(d,t,"triangle",2093,2093,0.3,0.05); sTone(d,t+0.05,"triangle",3136,3136,0.3,0.03); }   // a mirror ring
    else if(kind==="ab:Haunt"){ const o=mo("sine",260,t),l=mo("sine",5,t),lg=MC.createGain(),g=MC.createGain(); lg.gain.value=25; l.connect(lg); lg.connect(o.frequency); o.frequency.exponentialRampToValueAtTime(150,t+0.8);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.07,t+0.1); g.gain.exponentialRampToValueAtTime(0.0001,t+0.9); o.connect(g); g.connect(d); o.start(t); l.start(t); o.stop(t+0.95); l.stop(t+0.95); }   // a ghostly wail
    else if(kind==="ab:Life seed") [784,988,1175,1568].forEach((f,k)=>sTone(d,t+k*0.07,"sine",f,f,0.3,0.05));   // a sprouting chime
    else if(kind.slice(0,3)==="ab:"){ sTone(d,t,"triangle",660,990,0.2,0.06); }
  }catch(err){}
}

/* ---------- particles ---------- */
function atPart(o){ (AT.sp=AT.sp||[]).push({t0:AT.te,vx:0,vy:0,g:0,...o}); }
function atParts(c,dte){
  const te=AT.te; if(!AT.sp) return; AT.sp=AT.sp.filter(q=>te-q.t0<q.life&&!q.dead);
  for(const q of AT.sp){ if(te<q.t0) continue; const k=(te-q.t0)/q.life; q.x+=q.vx*dte; q.y+=q.vy*dte; q.vy+=q.g*dte; if(q.wob) q.x+=Math.sin((te-q.t0)/120+q.seed)*q.wob*dte;
    c.save(); c.translate(q.x,q.y);
    if(q.k==="ember"){ const r=q.s*(1-k*0.6); c.fillStyle=atRgba(k<0.4?[255,236,150]:[255,120,40],1-k); c.beginPath(); c.arc(0,0,r,0,7); c.fill(); }
    else if(q.k==="smoke"){ c.fillStyle=atRgba(q.c||[90,84,96],0.4*(1-k)); c.beginPath(); c.arc(0,0,q.s*(0.6+k),0,7); c.fill(); }
    else if(q.k==="bubble"){ const r=q.s*(0.7+0.3*k), pop=k>0.88;
      if(pop){ c.strokeStyle=atRgba(q.c,1-(k-0.88)/0.12); c.lineWidth=2; c.beginPath(); for(let n=0;n<6;n++){ const a=n*Math.PI/3; c.moveTo(Math.cos(a)*r,Math.sin(a)*r); c.lineTo(Math.cos(a)*r*1.7,Math.sin(a)*r*1.7); } c.stroke(); }
      else { c.fillStyle=atRgba(q.c,0.45); c.strokeStyle=atRgba(q.c.map(v=>Math.max(0,v-60)),0.9); c.lineWidth=2; c.beginPath(); c.arc(0,0,r,0,7); c.fill(); c.stroke();
        c.fillStyle="rgba(255,255,255,.75)"; c.beginPath(); c.arc(-r*0.35,-r*0.35,r*0.28,0,7); c.fill(); } }
    else if(q.k==="drop"){ if(q.floor!=null&&q.y>=q.floor){ q.dead=true; atPart({k:"ring",x:q.x,y:q.floor,life:420,s:q.s*2.2,c:q.c}); }
      c.fillStyle=atRgba(q.c,0.9); c.beginPath(); c.moveTo(0,-q.s*1.6); c.quadraticCurveTo(q.s,0,0,q.s); c.quadraticCurveTo(-q.s,0,0,-q.s*1.6); c.fill();
      c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.arc(-q.s*0.3,-q.s*0.1,q.s*0.25,0,7); c.fill(); }
    else if(q.k==="ring"){ c.strokeStyle=atRgba(q.c,0.8*(1-k)); c.lineWidth=2; c.beginPath(); c.ellipse(0,0,q.s*(0.4+k),q.s*0.3*(0.4+k),0,0,7); c.stroke(); }
    else if(q.k==="el"){ c.globalAlpha=k<0.2?k/0.2:1-(k-0.2)/0.8; if(typeof ePart==="function") ePart(c,q.el,0,0,q.s,te,q.seed|0); }
    else if(q.k==="shard"){ c.rotate(q.rot+(te-q.t0)*q.spin); c.globalAlpha=1-k*k; c.fillStyle=atRgba(q.c,0.85); c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(0,-q.s); c.lineTo(q.s*0.55,q.s*0.4); c.lineTo(-q.s*0.4,q.s*0.7); c.closePath(); c.fill(); c.stroke(); }
    else if(q.k==="pebble"){ c.rotate(q.seed+(te-q.t0)/90); c.fillStyle=atRgba(q.c||[150,110,70],1-k*k); c.beginPath(); c.moveTo(q.s,0); c.lineTo(0,-q.s*0.8); c.lineTo(-q.s,-q.s*0.2); c.lineTo(-q.s*0.5,q.s*0.8); c.lineTo(q.s*0.6,q.s*0.7); c.closePath(); c.fill(); }
    else if(q.k==="z"){ c.globalAlpha=k<0.2?k/0.2:1-(k-0.2)/0.8; c.font=`900 ${q.s}px system-ui`; c.textAlign="center"; c.lineWidth=4; c.strokeStyle="#1d2340"; c.fillStyle="#cfe0ff"; c.strokeText("z",0,0); c.fillText("z",0,0); }
    else if(q.k==="leaf"){ c.rotate(q.seed+(te-q.t0)/260); c.globalAlpha=k<0.15?k/0.15:1-(k-0.15)/0.85; c.fillStyle=q.seed%2>1?"#7ccf5a":"#9ee07a"; c.beginPath(); c.ellipse(0,0,q.s,q.s*0.45,0,0,7); c.fill(); c.strokeStyle="#4f9a3a"; c.lineWidth=1; c.beginPath(); c.moveTo(-q.s,0); c.lineTo(q.s,0); c.stroke(); }
    else if(q.k==="plus"){ c.globalAlpha=k<0.2?k/0.2:1-(k-0.2)/0.8; c.fillStyle=atRgba(q.c||[150,255,160],1); c.shadowColor=atRgba(q.c||[150,255,160],0.9); c.shadowBlur=8; const a=q.s, b=q.s*0.34; c.fillRect(-b,-a,b*2,a*2); c.fillRect(-a,-b,a*2,b*2); }
    else if(q.k==="arrow"){ c.globalAlpha=Math.sin(Math.min(1,k)*Math.PI); c.fillStyle=atRgba(q.c,0.95); c.strokeStyle="rgba(20,21,29,.8)"; c.lineWidth=2; if(q.down) c.scale(1,-1); const s=q.s;
      c.beginPath(); c.moveTo(0,-s); c.lineTo(s*0.8,0); c.lineTo(s*0.3,0); c.lineTo(s*0.3,s); c.lineTo(-s*0.3,s); c.lineTo(-s*0.3,0); c.lineTo(-s*0.8,0); c.closePath(); c.stroke(); c.fill(); }
    else if(q.k==="spark"){ c.globalAlpha=1-k; c.strokeStyle=atRgba(q.c,1); c.lineWidth=2.2; c.lineCap="round"; c.beginPath(); c.moveTo(0,0); c.lineTo(-q.vx*30,-q.vy*30); c.stroke(); }
    c.restore(); }
}
/* a burst of a status's own particles over the body, when it takes hold */
function atBurstEl(P,el,n,s){ for(let k=0;k<n;k++){ const a=k/n*Math.PI*2, v=0.05+atH(k+AT.te)*0.09;
  atPart({k:"el",el,x:P.cx+Math.cos(a)*P.r*0.4,y:P.cy+Math.sin(a)*P.r*0.4,vx:Math.cos(a)*v,vy:Math.sin(a)*v-0.03,life:520+k*12,s:s||2.4,seed:k}); } }
function atShards(x,y,col,n,big){ for(let k=0;k<n;k++){ const a=-Math.PI*0.95+k/(n-1)*Math.PI*0.9+(atH(k+x)-0.5)*0.5, v=0.18+atH(k*3+y)*0.22;
  atPart({k:"shard",x:x+(atH(k)-0.5)*30,y:y+(atH(k+9)-0.5)*40,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:0.0011,life:650+atH(k*7)*300,s:(big?12:8)*(0.6+atH(k*5)),c:col,rot:atH(k*2)*6,spin:(atH(k*11)-0.5)*0.03}); } }

/* where a side stands this frame, for effects that need it between draws */
const atP=i=>{ const P=AT.lastPlaced&&AT.lastPlaced[i]; if(!P) return null; const c=P.center||P; return {x:P.x,cx:c.x,cy:c.y,foot:P.foot,top:P.top.y,r:P.r,H:P.foot-P.top.y,eyes:P.eyes}; };

/* ---------- events from the engine ---------- */
function atFx(e,now){
  const te=AT.te, S=AT.side[e.i], P=atP(e.i), name=e.name, D=AT_ST[name], say=(i,txt,o={})=>AT.fx.push({i,t0:now,txt,...o});
  if(e.t==="ability"){ atAbility(e,now); return; }
  if(e.t==="status"){ S.stOn={name,t0:te}; S.frz=null; say(e.i,name,{col:atRgba(D.c,1),size:17,lift:12}); atSfx("status",D.el); if(P) atBurstEl(P,D.el,14,2.6);
    if(name==="Freeze"&&P) atShards(P.cx,P.cy,[200,240,255],6,false); }
  if(e.t==="cure"){ S.stOff={name,t0:te,why:e.why}; S.frz=null;
    if(e.why==="shatter"&&P){ atShards(P.cx,P.cy,[190,235,255],16,true); atSfx("shatter"); say(e.i,"Shattered",{col:"#bfeaff",size:14,lift:30}); AT.trauma=Math.min(1,AT.trauma+0.25); }
    else if(name==="Freeze"&&P){ atSfx("thaw"); for(let k=0;k<8;k++) atPart({k:"drop",x:P.cx+(atH(k)-0.5)*P.r*1.6,y:P.cy+(atH(k+3)-0.5)*P.H*0.5,vy:0.05,g:0.0007,life:900,s:4,c:[160,215,255],floor:P.foot}); }
    else if(e.why==="cleanse"&&P){ atSfx("cleanse"); for(let k=0;k<10;k++) atPart({k:"plus",x:P.cx+(atH(k)-0.5)*P.r*2,y:P.cy+(atH(k+4)-0.5)*P.H*0.6,vy:-0.05,life:700,s:5,c:[255,255,255]}); say(e.i,"Cured",{col:"#ffffff",size:14,lift:20}); }
    else if(P&&D){ for(let k=0;k<6;k++) atPart({k:"smoke",x:P.cx+(atH(k)-0.5)*P.r,y:P.cy,vy:-0.04,life:600,s:9,c:D.c}); } }
  if(e.t==="tick"){ S.tickAt=te; S.tickName=name; say(e.i,String(e.dmg),{col:atRgba(D.c,1),size:15,side:1}); atSfx("tick",D.el); }
  if(e.t==="jolt"){ S.joltAt=te; if(typeof elSfx==="function") try{ elSfx("Spark","hit"); }catch(err){} if(P) for(let k=0;k<8;k++){ const a=k*0.8; atPart({k:"spark",x:P.cx,y:P.cy,vx:Math.cos(a)*0.25,vy:Math.sin(a)*0.25,life:260,c:[255,240,120]}); } }
  if(e.t==="heal"){ const fromP=e.from!=null?atP(e.from):null, delay=fromP?480:0;
    if(fromP) AT.streams.push({from:e.from,to:e.i,t0:te,d:520,col:e.src==="leech"?[120,220,90]:[255,110,120],n:e.src==="leech"?5:9});
    const small=e.src==="regen"||e.src==="sun";   // the slow trickles (Regen, Sunbather) get a small number and a lighter glow
    if(e.amt>0){ AT.fx.push({i:e.i,t0:now+delay,txt:"+"+e.amt,col:"#7dffa0",size:small?15:20,side:small?1:0,lift:4}); S.healAt=te+delay; S.healA=small?0.16:0.4; if((!fromP||e.src!=="leech")&&!(e.src==="sun"&&S.sunSnd>te-6000)){ if(e.src==="sun") S.sunSnd=te; setTimeout(()=>atSfx("heal"),delay); } }
    if(P&&e.src!=="leech") for(let k=0;k<(small?3:10);k++) atPart({k:k%3?"el":"plus",el:"Light",x:P.cx+(atH(k+te)-0.5)*P.r*1.8,y:P.foot-10-atH(k*3+te)*P.H*0.5,vy:-0.06-atH(k)*0.04,life:900,s:k%3?2:6,c:[150,255,160],seed:k,t0:te+delay}); }
  if(e.t==="block"){ const D2=AT.side[1-e.i]; D2.blockAt=te; const Q=atP(1-e.i); if(Q) atShards(Q.cx+(D2.dir||1)*Q.r*0.8,Q.cy,[150,210,255],12,false);
    atSfx("shatter"); say(1-e.i,"Blocked",{col:"#9fd8ff",size:17}); AT.trauma=Math.min(1,AT.trauma+0.2); }
  if(e.t==="mirror"){ S.mirrorAt=te; say(e.i,"Reflected",{col:"#ffc8f0",size:16}); atSfx("shield"); }
  if(e.t==="counter"){ say(e.i,"Counter",{col:"#ffb35c",size:14,lift:26}); say(1-e.i,String(e.dmg),{col:"#ffb35c",size:19}); AT.side[1-e.i].react={kind:"hit",t0:te+60,tier:"medium"}; AT.trauma=Math.min(1,AT.trauma+0.3); try{ sfx("hit"); }catch(err){} }
  if(e.t==="endure"){ atSfx("endure"); say(e.i,"Endured",{col:"#ffd75a",size:18,lift:24}); AT.flash={t0:now,a:0.35}; }
  if(e.t==="recoil"){ atSfx("recoil"); say(e.i,String(e.dmg),{col:"#ffb070",size:15,side:1}); S.recoilAt=te; }
  if(e.t==="steal"){ atSfx("steal"); const o=1-e.i; say(o,`Focus −${e.amt}`,{col:"#8fd3ff",size:13,lift:10}); AT.streams.push({from:o,to:e.i,t0:te,d:480,col:[120,190,255],n:6}); }
  if(e.t==="stage"&&!e.end){ if(e.n===0){ say(e.i,"No effect",{col:"#c9cbd6",size:12,lift:16}); return; }
    const up=e.n>0; say(e.i,`${AT_STAT_SHORT[e.k]} ${up?"▲":"▼"}${Math.abs(e.n)>1?Math.abs(e.n):""}`,{col:up?"#ff9a70":"#8fb8ff",size:14,lift:16}); atSfx(up?"up":"down");
    if(P) for(let k=0;k<6;k++) atPart({k:"arrow",x:P.cx-P.r*0.8+k*P.r*0.32,y:up?P.foot-10:P.top+10,vy:up?-0.09:0.09,life:800,s:7,c:up?[255,110,80]:[90,150,255],down:!up,t0:te+k*40}); }
  if(e.t==="sleep"){ atSfx("sleep"); say(e.i,"Asleep",{col:"#cfe0ff",size:14,lift:16}); }
  if(e.t==="wake"){ atSfx("wake"); say(e.i,"Woke up",{col:"#cfe0ff",size:13,lift:30}); }
  if(e.t==="taunt") say(e.i,"Taunted",{col:"#ff8a7a",size:15,lift:16});
  if(e.t==="erase"){ say(e.i,"Buffs gone",{col:"#c7a6ff",size:14,lift:16}); if(P) for(let k=0;k<10;k++) atPart({k:"smoke",x:P.cx+(atH(k)-0.5)*P.r*2,y:P.cy+(atH(k+2)-0.5)*P.H*0.5,vy:-0.03,life:700,s:10,c:[150,110,210]}); }
  if(e.t==="daze") say(e.i,"Dazed",{col:"#ff9ccc",size:15,lift:30});
  if(e.t==="sulk") say(e.i,"Not listening",{col:"#ffb86b",size:15,lift:30});
  if(e.t==="wilful") say(e.i,"Has its own idea",{col:"#ffb86b",size:15,lift:30});
  if(e.t==="buff"&&(e.m.protect||e.m.buff==="bubble"||e.m.buff==="bunker")) atSfx("shield");
}
/* a move that will miss: the target starts getting out of the way just before it arrives. How depends on what's coming:
   a bite or a punch up close gets ducked or hopped back from, a shot gets jumped over or leaned away from, something from above gets
   sidestepped, and a phased Snabit lets it pass straight through */
function atPlanDodge(i,at,kind,why){
  const S=AT.side[1-i], r=atH(at), contact=!!(ANIM[kind]&&ANIM[kind].contact)||/^(tackle|bite|punch|claw|shadowstrike|shadowclaw|stomp|fly)$/.test(kind);
  let style=why==="phase"?"phase":contact?(r<0.7?"back":"leap"):/^(meteor|icefall|boulder|rockpath|pillar|lift)$/.test(kind)?"back":/^(beam|lightning|wave|tornado|firespin|push)$/.test(kind)?(r<0.5?"leap":"sway"):(r<0.55?"leap":"duck");
  // backed against a wall there's no room to hop back, so it jumps instead
  if(style==="back"){ const q=AT.ar.p[1-i], o=AT.ar.p[i], room=q.x>o.x?AR.LEN-q.x:q.x; if(room<14) style="leap"; }
  const lead={back:300,duck:260,leap:300,sway:260,phase:200}[style];
  S.dodgeAt={at:at-lead,style};
}
const AT_DODGE_D={back:820,duck:540,leap:640,sway:540,phase:700};
/* how a dodge moves the body this frame: [x offset back from the attacker, y offset, rotation, squash x, squash y, pose, alpha] */
function atDodge(S,te){
  if(S.dodgeAt&&te>=S.dodgeAt.at){ S.react={kind:"dodge",style:S.dodgeAt.style,t0:S.dodgeAt.at}; S.dodgeAt=null; atSfx("dodge"); }
  const R=S.react; if(!R||R.kind!=="dodge") return null;
  const d=AT_DODGE_D[R.style]||420, k=(te-R.t0)/d; if(k>1){ S.react=null; return null; }
  const out=(a,b)=>k<a?eo(k/a):k<b?1:1-eo((k-b)/(1-b));   // quick out, hold, ease back
  if(R.style==="back"){ const q=out(0.16,0.74); if(k<0.22) S.ghost=te; return {dx:-104*q,dy:-24*Math.sin(Math.min(1,k/0.3)*Math.PI),rot:-0.12*q,sx:1,sy:1,pose:"dodge"}; }
  if(R.style==="duck"){ const q=out(0.2,0.64); return {dx:-16*q,dy:0,rot:-0.06*q,sx:1+0.2*q,sy:1-0.4*q,pose:"crouch"}; }
  if(R.style==="leap"){ const q=Math.sin(Math.min(1,k/0.85)*Math.PI); return {dx:-10*q,dy:-84*q,rot:-0.5*Math.sin(Math.min(1,k/0.85)*Math.PI*2)*0.35,sx:1-0.06*q,sy:1+0.08*q,pose:k<0.75?"jump":"land"}; }
  if(R.style==="sway"){ const q=out(0.25,0.6); return {dx:-18*q,dy:4*q,rot:-0.38*q,sx:1,sy:1,pose:"dodge"}; }
  const q=out(0.15,0.7); S.ghost=te; return {dx:6*Math.sin(te/30)*q,dy:0,rot:0,sx:1,sy:1,pose:"float",alpha:1-0.7*q};
}

/* ---------- the body, tinted by its status ---------- */
function atTintOf(i,te){
  const p=AT.ar.p[i], S=AT.side[i], st=p.st; let col=null, a=0;
  if(st){ col=st.name==="Dread"?[18,10,36]:AT_ST[st.name].c;
    a={Poison:0.32,Freeze:0.45,Soak:0.26,Curse:0.3,Dread:0.36,Crack:0.16,Burn:0.1,Shock:0.1,Root:0.08,Daze:0.08,Blind:0.1}[st.name]||0;
    if(S.tickAt!=null) a+=0.4*Math.max(0,1-(te-S.tickAt)/320);
    if(st.name==="Burn") a+=0.06*Math.sin(te/70);
    if(st.name==="Shock"){ col=[255,236,90]; a+=0.22*atH(Math.floor(te/55)); } }
  if(S.joltAt!=null&&te-S.joltAt<700){ col=[255,250,170]; a=Math.floor(te/55)%2?0.65:0.2; }
  if(S.healAt!=null&&te>=S.healAt&&te-S.healAt<520){ const k=(1-(te-S.healAt)/520)*(S.healA||0.4); if(k>a){ col=[150,255,170]; a=k; } }
  return a>0.01||st&&AT_DECO[st.name]?{col,a,deco:st&&st.name}:null;
}
/* drawn on the body only, in its own drawing units (feet at 100,188): cracks, the shine of ice, wet gloss, poison blotches */
const AT_DECO={
  Crack:(o,h)=>{ const y0=188-h; o.lineCap="round"; o.lineJoin="round";
    for(const [w,col] of [[5,"rgba(255,226,180,.35)"],[3,"rgba(58,32,14,.9)"]]){ o.lineWidth=w; o.strokeStyle=col; o.beginPath();
      o.moveTo(118,y0+h*0.18); o.lineTo(108,y0+h*0.34); o.lineTo(116,y0+h*0.42); o.lineTo(100,y0+h*0.6); o.lineTo(106,y0+h*0.7);
      o.moveTo(108,y0+h*0.34); o.lineTo(88,y0+h*0.4); o.lineTo(80,y0+h*0.52);
      o.moveTo(100,y0+h*0.6); o.lineTo(84,y0+h*0.66);
      o.moveTo(70,y0+h*0.22); o.lineTo(78,y0+h*0.3); o.lineTo(72,y0+h*0.36); o.stroke(); } },
  Freeze:(o,h)=>{ const y0=188-h; o.strokeStyle="rgba(255,255,255,.55)"; o.lineCap="round";
    for(let k=0;k<3;k++){ o.lineWidth=k===1?10:5; o.beginPath(); o.moveTo(40+k*26,y0+h*0.9); o.lineTo(120+k*26,y0+h*0.05); o.stroke(); } },
  Soak:(o,h)=>{ const y0=188-h, g=o.createLinearGradient(0,y0,0,188); g.addColorStop(0,"rgba(255,255,255,.28)"); g.addColorStop(0.35,"rgba(255,255,255,0)"); g.addColorStop(1,"rgba(20,60,140,.3)"); o.fillStyle=g; o.fillRect(-40,y0-20,280,h+40);
    o.strokeStyle="rgba(255,255,255,.6)"; o.lineWidth=5; o.lineCap="round"; o.beginPath(); o.arc(88,y0+h*0.36,h*0.24,-2.6,-1.9); o.stroke(); },
  Poison:(o,h)=>{ const y0=188-h; o.fillStyle="rgba(70,20,110,.32)"; for(const [x,y,r] of [[76,0.4,9],[122,0.55,12],[96,0.72,8],[134,0.3,7]]){ o.beginPath(); o.arc(x,y0+h*y,r,0,7); o.fill(); } },
  Curse:(o,h)=>{ const y0=188-h, g=o.createLinearGradient(0,188,0,y0); g.addColorStop(0,"rgba(30,10,50,.6)"); g.addColorStop(0.55,"rgba(30,10,50,0)"); o.fillStyle=g; o.fillRect(-40,y0-20,280,h+40); },
  Burn:(o,h)=>{ const y0=188-h; o.fillStyle="rgba(40,20,10,.3)"; for(const [x,y,r] of [[84,0.78,8],[116,0.66,6],[128,0.84,7]]){ o.beginPath(); o.arc(x,y0+h*y,r,0,7); o.fill(); } } };
/* draws a Snabit onto a spare canvas, colours it there with source-atop (only its own pixels change) and copies it back.
   This replaces canvas filters, which stalled the fight for hundreds of milliseconds a frame on phones and in Chrome. */
function atLayer(c,draw,col,a,deco){
  const cv=c.canvas, off=AT.off||(AT.off=document.createElement("canvas"));
  if(off.width!==cv.width||off.height!==cv.height){ off.width=cv.width; off.height=cv.height; }
  const o=off.getContext("2d"), M=c.getTransform(), pts=[[-70,-140],[270,-140],[-70,225],[270,225]].map(([x,y])=>M.transformPoint({x,y}));
  const bx=Math.max(0,Math.floor(Math.min(...pts.map(q=>q.x)))), by=Math.max(0,Math.floor(Math.min(...pts.map(q=>q.y)))),
    bx2=Math.min(cv.width,Math.ceil(Math.max(...pts.map(q=>q.x)))), by2=Math.min(cv.height,Math.ceil(Math.max(...pts.map(q=>q.y))));
  if(bx2<=bx||by2<=by){ draw(c); return; }
  o.setTransform(1,0,0,1,0,0); o.globalCompositeOperation="source-over"; o.globalAlpha=1; o.clearRect(bx,by,bx2-bx,by2-by);
  o.setTransform(M); draw(o);
  o.globalCompositeOperation="source-atop";
  if(deco){ o.save(); deco(o); o.restore(); }
  if(col&&a>0){ o.setTransform(1,0,0,1,0,0); o.fillStyle=atRgba(col,Math.min(1,a)); o.fillRect(bx,by,bx2-bx,by2-by); }
  o.globalCompositeOperation="source-over";
  c.save(); c.setTransform(1,0,0,1,0,0); c.drawImage(off,bx,by,bx2-bx,by2-by,bx,by,bx2-bx,by2-by); c.restore();
}
/* a Snabit with its status tint, or flashing white when hit (flash 2 is solid white, 1 bright, 3 a little bright) */
function atBody(c,i,spec,P,te,look,flash){
  let T=atTintOf(i,te); const draw=o=>CHIBI.draw(o,spec,P,te,look);
  if(flash){ const a=flash===2?1:flash===1?0.42:0.18; T={col:[255,255,255],a,deco:T&&T.deco}; }
  if(!T){ draw(c); return; }
  const deco=T.deco&&AT_DECO[T.deco]?o=>AT_DECO[T.deco](o,Math.min(200,CHIBI.height(spec.stage,spec.marks,spec.family))):null;
  atLayer(c,draw,T.col,T.a,deco);
}
/* the faint copy left behind a fast move, drawn see-through */
function atGhost(c,spec,P,te,look){ CHIBI.draw(c,spec,P,te,look); }
/* a status can shake or sway the body: Shock jolts, Dread shivers, Poison sways queasily, Daze wobbles */
function atStatusMove(i,te){
  const p=AT.ar.p[i], S=AT.side[i], n=p.st&&p.st.name; let dx=0, dy=0, rot=0;
  if(S.joltAt!=null&&te-S.joltAt<700){ dx+=(atH(Math.floor(te/30))-0.5)*9; dy+=(atH(Math.floor(te/30)+5)-0.5)*5; }
  if(n==="Dread") dx+=Math.sin(te/22)*1.6;
  if(n==="Poison") rot+=Math.sin(te/380)*0.05;
  if(n==="Daze") rot+=Math.sin(te/260)*0.08;
  if(p.stun>0&&!(S.joltAt!=null&&te-S.joltAt<800)) rot+=Math.sin(te/150)*0.05;
  return [dx,dy,rot];
}
/* Blind screws its eyes shut whatever pose it's in */
function atStatusEyes(i,P){ const p=AT.ar.p[i]; if(!AT.ar.has(p,"Blind")) return P; const o=typeof P==="string"?CHIBI.blend(P,P,0):P; return {...o,eyes:o.eyes==="ko"?"ko":"hurt"}; }
/* the pose a status holds it in when it isn't doing anything else */
function atStatusPose(i,pose){
  const ar=AT.ar, p=ar.p[i]; if(pose!=="idle"&&pose!=="walk") return pose;
  if(p.sleep>0) return "sleep";
  if(ar.has(p,"Daze")||p.stun>0) return "dizzy";
  if(p.buff.brace||p.buff.bunker||p.buff.protect) return "guard";
  if(ar.has(p,"Dread")) return "hurt";
  if(ar.has(p,"Curse")) return "tired";
  if(p.hold>0) return "effort";
  return pose;
}

/* ---------- behind the body ---------- */
/* the wind-up aura of a signature move: a flame of light behind the body in its own colour, tongues licking up its sides,
   energy drawn in toward it and rings pulsing out from its feet, all building as the charge fills */
function atSigCol(ch){ const b=Array.isArray(ch.body)?ch.body:null, m=ch.col||[255,214,90]; return b?b.map((v,j)=>Math.round(v*0.55+m[j]*0.45)):m; }
function atSigAuraBack(c,ch,x,foot,H,r,te,k){ const col=atSigCol(ch), lt=col.map(v=>Math.min(255,v+90)), e=eo(k), fl=0.92+0.08*Math.sin(te/45);
  c.save(); c.globalCompositeOperation="lighter";
  const top=foot-H*(1.15+0.35*e)*fl, w=r*(1.15+0.35*e);
  const shape=(sc)=>{ c.beginPath(); c.moveTo(x-w*sc,foot); c.bezierCurveTo(x-w*1.25*sc,foot-H*0.55,x-w*0.55*sc,foot-H*0.9,x+Math.sin(te/90)*w*0.12,top-(1-sc)*H*0.2); c.bezierCurveTo(x+w*0.55*sc,foot-H*0.9,x+w*1.25*sc,foot-H*0.55,x+w*sc,foot); c.closePath(); };
  let g=c.createLinearGradient(0,foot,0,top); g.addColorStop(0,atRgba(col,0.55*e)); g.addColorStop(0.6,atRgba(col,0.35*e)); g.addColorStop(1,atRgba(col,0)); c.fillStyle=g; shape(1); c.fill();
  g=c.createLinearGradient(0,foot,0,top); g.addColorStop(0,atRgba(lt,0.6*e)); g.addColorStop(0.7,atRgba(lt,0.15*e)); g.addColorStop(1,atRgba(lt,0)); c.fillStyle=g; shape(0.62); c.fill();
  for(let n=0;n<3;n++){ const ph=((te-ch.t0)/420+n/3)%1; c.strokeStyle=atRgba(lt,0.7*e*(1-ph)); c.lineWidth=3*(1-ph)+1; c.beginPath(); c.ellipse(x,foot,r*(0.6+ph*1.6),r*(0.14+ph*0.34),0,0,7); c.stroke(); }
  g=c.createRadialGradient(x,foot,0,x,foot,r*1.6); g.addColorStop(0,atRgba(lt,0.5*e)); g.addColorStop(1,atRgba(col,0)); c.fillStyle=g; c.beginPath(); c.ellipse(x,foot,r*1.6,r*0.38,0,0,7); c.fill();
  c.restore(); }
function atSigAuraFront(c,ch,cx,cy,foot,R,te,k,s){ const col=atSigCol(ch), lt=col.map(v=>Math.min(255,v+90)), e=eo(k);
  c.save(); c.globalCompositeOperation="lighter";
  for(let n=0;n<10;n++){ const sd=n%2?1:-1, ph=((te/520)+n*0.137)%1, f=0.75+0.25*Math.sin(te/38+n*2.1), bx=cx+sd*R*(0.78+0.12*Math.sin(n*1.3)), by=foot-ph*R*1.9, h=R*(0.35+0.3*f)*(1-ph*0.6)*e, w=R*0.11*(1-ph*0.5);
    c.fillStyle=atRgba(n%3?col:lt,0.42*(1-ph)*e); c.beginPath(); c.moveTo(bx-w,by); c.quadraticCurveTo(bx-w*0.2,by-h*0.6,bx+sd*w*0.6,by-h); c.quadraticCurveTo(bx+w*0.5,by-h*0.5,bx+w,by); c.closePath(); c.fill(); }
  for(let n=0;n<12;n++){ const ph=((te-ch.t0)/700+n/12)%1, a=n*2.399, r=R*(2.4-2.1*ph), px=cx+Math.cos(a)*r, py=cy+Math.sin(a)*r*0.7, tx=cx+Math.cos(a)*(r+R*0.22), ty=cy+Math.sin(a)*(r+R*0.22)*0.7, sz=R*0.035*(0.5+ph);
    if(r<R*0.9) continue; c.fillStyle=atRgba(lt,0.7*ph*e); c.beginPath(); c.moveTo(tx,ty); c.lineTo(px+Math.sin(a)*sz,py-Math.cos(a)*sz); c.arc(px,py,sz,a-Math.PI/2,a+Math.PI/2,true); c.closePath(); c.fill(); }
  for(let n=0;n<6;n++){ const ph=((te/900)+n/6)%1, px=cx+Math.sin(n*2.7+te/400)*R*0.8, py=foot-ph*R*2.4, z=R*0.06*(1-ph);
    c.fillStyle=`rgba(255,255,255,${0.9*(1-ph)*e})`; c.beginPath(); for(let j=0;j<8;j++){ const q=j/8*Math.PI*2, rr=j%2?z*0.35:z; c[j?"lineTo":"moveTo"](px+Math.cos(q)*rr,py+Math.sin(q)*rr); } c.closePath(); c.fill(); }
  const g=c.createRadialGradient(cx,cy,0,cx,cy,R*(0.7+0.3*e)); g.addColorStop(0,atRgba(lt,0.06*e*(0.8+0.2*Math.sin(te/70)))); g.addColorStop(1,atRgba(col,0)); c.fillStyle=g; c.beginPath(); c.arc(cx,cy,R*(0.7+0.3*e),0,7); c.fill();
  c.restore(); }
function atFxBack(c,i,Q,te){
  const p=AT.ar.p[i], n=p.st&&p.st.name, {x,foot,H,r}=Q;
  { const ch=AT.side[i].charge; if(ch&&ch.sig&&te>=ch.t0) atSigAuraBack(c,ch,x,foot,H,r,te,Math.min(1,(te-ch.t0)/ch.d)); }
  if(n==="Soak"){ c.fillStyle="rgba(70,140,240,.32)"; c.beginPath(); c.ellipse(x,foot+3,r*1.15,11,0,0,7); c.fill(); c.strokeStyle="rgba(200,230,255,.5)"; c.lineWidth=2; c.beginPath(); c.ellipse(x-r*0.3,foot+1,r*0.35,3,0,0,7); c.stroke(); }
  if(n==="Freeze"){ const g=c.createRadialGradient(x,foot,4,x,foot,r*1.4); g.addColorStop(0,"rgba(230,248,255,.75)"); g.addColorStop(1,"rgba(200,236,255,0)"); c.fillStyle=g; c.beginPath(); c.ellipse(x,foot+2,r*1.4,16,0,0,7); c.fill(); }
  if(n==="Curse"||n==="Dread"){ const g=c.createRadialGradient(x,foot,4,x,foot,r*1.5), dk=n==="Dread"; g.addColorStop(0,dk?"rgba(20,8,40,.75)":"rgba(60,20,90,.6)"); g.addColorStop(1,"rgba(20,8,40,0)"); c.fillStyle=g; c.beginPath(); c.ellipse(x,foot+2,r*1.5,18,0,0,7); c.fill(); }
  if(n==="Dread"){ // a pair of eyes in the dark behind it, opening and closing
    const k=(te%3200)/3200, open=k<0.75?Math.min(1,k/0.12)*Math.min(1,(0.75-k)/0.12):0, ey=foot-H*0.82, sp=r*1.12;
    if(open>0) for(const sd of [-1,1]){ c.save(); c.translate(x+sd*sp,ey); c.rotate(sd*0.25); const g=c.createRadialGradient(0,0,2,0,0,34); g.addColorStop(0,"rgba(120,60,230,.55)"); g.addColorStop(1,"rgba(40,10,80,0)"); c.fillStyle=g; c.beginPath(); c.arc(0,0,34,0,7); c.fill();
      c.fillStyle="rgba(215,170,255,.95)"; c.beginPath(); c.ellipse(0,0,17,10*open,0,0,7); c.fill(); c.fillStyle="#12081f"; c.beginPath(); c.ellipse(0,0,4,9*open,0,0,7); c.fill(); c.restore(); } }
  if(n==="Root") atVines(c,Q,te,true);
  if(n==="Burn"){ const by=Q.by!=null?Q.by:foot, ccy=by-H*0.55; for(let k=0;k<7;k++){ const a=Math.PI*(1.12+k*0.127), fx=x+Math.cos(a)*r*0.9, fy=ccy+Math.sin(a)*H*0.42+10;
    atFlame(c,fx,fy,1.05+0.25*Math.sin(k*1.7),te,k*3.1,Math.cos(a)*0.35); } }
  if(p.buff.castWard||p.buff.ward){ const col=p.buff.castWard?[190,140,255]:[230,240,255], rot=te/1400; c.save(); c.translate(x,foot+4); c.scale(1,0.28); c.strokeStyle=atRgba(col,0.75); c.lineWidth=4;
    c.beginPath(); c.arc(0,0,r*1.3,0,7); c.stroke(); c.lineWidth=2; c.beginPath(); c.arc(0,0,r*1.05,0,7); c.stroke();
    for(let k=0;k<6;k++){ const a=rot+k*Math.PI/3; c.beginPath(); c.moveTo(Math.cos(a)*r*1.05,Math.sin(a)*r*1.05); c.lineTo(Math.cos(a+2.1)*r*1.05,Math.sin(a+2.1)*r*1.05); c.stroke(); } c.restore(); }
  if(p.buff.regen){ const g=c.createRadialGradient(x,foot,4,x,foot,r*1.3); g.addColorStop(0,`rgba(130,240,140,${0.35+0.15*Math.sin(te/200)})`); g.addColorStop(1,"rgba(130,240,140,0)"); c.fillStyle=g; c.beginPath(); c.ellipse(x,foot+2,r*1.3,14,0,0,7); c.fill(); }
  if(p.buff.endure){ c.strokeStyle=`rgba(255,200,80,${0.5+0.3*Math.sin(te/90)})`; c.lineWidth=3; c.beginPath(); c.ellipse(x,foot+3,r*1.1,9,0,0,7); c.stroke(); }
}
/* one tongue of fire standing at x,y: red outside, orange, then a yellow core, flickering on its own rhythm */
function atFlame(c,fx,base,sz,te,seed,lean){
  const hh=(38+22*atH(seed+3))*sz*(0.78+0.22*Math.sin(te/(60+atH(seed)*40)+seed)+0.08*Math.sin(te/23+seed*2)), w=(15+5*atH(seed+7))*sz, tip=(lean||0)*hh+Math.sin(te/150+seed)*5*sz;
  for(const [sc,col] of [[1,"rgba(225,60,20,.9)"],[0.7,"rgba(255,145,35,.95)"],[0.4,"rgba(255,238,150,.97)"]]){ c.fillStyle=col; c.beginPath(); c.moveTo(fx-w*sc,base);
    c.bezierCurveTo(fx-w*sc*1.2,base-hh*sc*0.45,fx+tip*0.4-w*sc*0.3,base-hh*sc*0.7,fx+tip,base-hh*sc); c.bezierCurveTo(fx+tip*0.4+w*sc*0.3,base-hh*sc*0.7,fx+w*sc*1.2,base-hh*sc*0.45,fx+w*sc,base);
    c.quadraticCurveTo(fx,base+w*sc*0.7,fx-w*sc,base); c.fill(); }
}
/* vines that come up out of the floor and wrap round its legs; back is the half behind the body */
function atVines(c,Q,te,back){
  const {x,foot,H,r}=Q, S=AT.side[Q.i], grow=S&&S.stOn&&S.stOn.name==="Root"?Math.min(1,(te-S.stOn.t0)/420):1;
  c.save(); c.lineCap="round"; c.lineJoin="round";
  const vine=(pts,w)=>{ for(const [lw,col] of [[w+4,back?"#24491b":"#2f6324"],[w,back?"#4a8236":"#69bb48"]]){ c.strokeStyle=col; c.lineWidth=lw; c.beginPath(); pts.forEach((q,k)=>c[k?"lineTo":"moveTo"](q[0],q[1])); c.stroke(); } };
  const leaf=(lx,ly,a,s)=>{ c.save(); c.translate(lx,ly); c.rotate(a); c.fillStyle="#8fd36a"; c.strokeStyle="#3f7d2e"; c.lineWidth=1.2; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(s*0.6,-s*0.55,s*1.3,0); c.quadraticCurveTo(s*0.6,s*0.55,0,0); c.fill(); c.stroke(); c.restore(); };
  // two bands wound round the legs: the front half of each loop in front of the body, the back half behind it
  for(let b=0;b<2;b++){ const yy=foot-H*(0.1+0.2*b)*grow, rx=r*(1.02-0.08*b), ry=9+3*b, tilt=(b?-1:1)*0.12+Math.sin(te/600+b)*0.03, pts=[];
    for(let k=0;k<=20;k++){ const a=back?Math.PI+k/20*Math.PI:k/20*Math.PI; pts.push([x+Math.cos(a)*rx,yy+Math.sin(a)*ry+Math.cos(a)*rx*tilt]); }
    vine(pts,5); if(!back) for(const t of [0.25,0.6,0.85]){ const a=t*Math.PI; leaf(x+Math.cos(a)*rx,yy+Math.sin(a)*ry+Math.cos(a)*rx*tilt,(b?-1:1)*(0.6+t)-0.4,9); } }
  // sprouts curling up out of the floor either side
  if(back) for(let v=0;v<4;v++){ const sd=v<2?-1:1, x0=x+sd*r*(0.75+0.35*(v%2)), hh=H*(0.32+0.14*(v%2))*grow, sw=Math.sin(te/450+v)*4, pts=[];
    for(let k=0;k<=10;k++){ const t=k/10; pts.push([x0+sd*Math.sin(t*2.6)*14+sw*t,foot+2-hh*t]); }
    vine(pts,4); leaf(pts[6][0],pts[6][1],sd>0?-0.4:Math.PI+0.4,10); leaf(pts[10][0],pts[10][1],-Math.PI/2+sd*0.5,8); }
  c.restore();
}

/* ---------- in front of the body ---------- */
function atFxFront(c,i,Q,te,dte){
  const ar=AT.ar, p=ar.p[i], S=AT.side[i], n=p.st&&p.st.name, {x,cx,cy,foot,H,r}=Q, top=foot-H, sp=dte>0, chance=f=>sp&&Math.random()<f*dte/16;
  if(n==="Burn"){ // small flames lick up from its lower edges in front; the big ones burn behind it (atFxBack), with sparks and smoke off the top
    for(const a of [2.5,0.64]) atFlame(c,cx+Math.cos(a)*r*0.92,cy+Math.sin(a)*H*0.4,0.55,te,a*7,a>1.5?-0.35:0.35);
    if(chance(0.5)) atPart({k:"ember",x:cx+(Math.random()-0.5)*r*1.6,y:foot-H*(0.3+Math.random()*0.5),vx:(Math.random()-0.5)*0.03,vy:-0.09-Math.random()*0.06,life:700,s:2.5});
    if(chance(0.12)) atPart({k:"smoke",x:cx+(Math.random()-0.5)*r,y:top+10,vy:-0.05,life:900,s:10,wob:0.01,seed:Math.random()*6}); }
  if(n==="Poison"){ if(chance(0.16)) atPart({k:"bubble",x:cx+(Math.random()-0.5)*r*1.4,y:top+H*0.3,vy:-0.05-Math.random()*0.03,wob:0.02,seed:Math.random()*6,life:1100,s:5+Math.random()*5,c:Math.random()<0.6?[170,100,235]:[150,220,90]});
    if(chance(0.05)) atPart({k:"drop",x:cx+(Math.random()-0.5)*r,y:foot-H*0.2,vy:0.02,g:0.0006,life:900,s:3.5,c:[150,80,210],floor:foot}); }
  if(n==="Root") atVines(c,Q,te,false);
  if(n==="Freeze"){ // a block of ice around it
    const k=S.stOn&&S.stOn.name==="Freeze"?Math.min(1,(te-S.stOn.t0)/260):1, left=p.st.t, melt=left<0.6?left/0.6:1, w=r*1.25, hh=(H+22)*k, y1=foot+6, y0=y1-hh;
    c.save(); c.globalAlpha=0.35+0.65*melt; c.fillStyle="rgba(175,228,255,.36)"; c.strokeStyle="rgba(235,250,255,.95)"; c.lineWidth=3; c.lineJoin="round";
    c.beginPath(); c.moveTo(x-w,y1); c.lineTo(x-w-6,y0+hh*0.3); c.lineTo(x-w*0.55,y0); c.lineTo(x+w*0.4,y0-8); c.lineTo(x+w+6,y0+hh*0.25); c.lineTo(x+w,y1); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=6; c.beginPath(); c.moveTo(x-w*0.6,y0+hh*0.35); c.lineTo(x-w*0.2,y0+hh*0.08); c.stroke(); c.lineWidth=3; c.beginPath(); c.moveTo(x-w*0.5,y0+hh*0.55); c.lineTo(x-w*0.05,y0+hh*0.25); c.stroke();
    c.strokeStyle="rgba(120,190,230,.7)"; c.lineWidth=1.6; c.beginPath(); c.moveTo(x+w*0.5,y0+hh*0.2); c.lineTo(x+w*0.25,y0+hh*0.42); c.lineTo(x+w*0.45,y0+hh*0.6); c.moveTo(x+w*0.25,y0+hh*0.42); c.lineTo(x,y0+hh*0.5); c.stroke(); c.restore();
    if(chance(0.06)) atPart({k:"el",el:"Frost",x:x+(Math.random()-0.5)*w*2,y:y0+Math.random()*hh,vy:-0.01,life:700,s:2.2,seed:Math.random()*9});
    if(melt<1&&chance(0.3)) atPart({k:"drop",x:x+(Math.random()-0.5)*w*1.8,y:y0+hh*0.6,vy:0.03,g:0.0007,life:700,s:3.5,c:[170,220,255],floor:foot}); }
  if(n==="Shock"){ // a crackling field: arcs snap round the outside of the body and forks jump off it, redrawn every few frames
    const seed=Math.floor(te/55), ry=H*0.52, rx=r*1.08, ecy=foot-H*0.5, pulse=0.6+0.4*atH(seed*5);
    const g=c.createRadialGradient(cx,ecy,r*0.4,cx,ecy,r*1.6); g.addColorStop(0,"rgba(255,240,120,0)"); g.addColorStop(0.7,`rgba(255,226,70,${0.18*pulse})`); g.addColorStop(1,"rgba(255,226,70,0)");
    c.fillStyle=g; c.beginPath(); c.ellipse(cx,ecy,rx*1.5,ry*1.4,0,0,7); c.fill();
    const bolt=(pts,w)=>{ for(const [lw,col] of [[w*3.2,`rgba(255,214,60,${0.35*pulse})`],[w*1.6,"rgba(255,238,110,.95)"],[w*0.7,"rgba(255,255,255,1)"]]){ c.strokeStyle=col; c.lineWidth=lw; c.beginPath(); pts.forEach((q,k)=>c[k?"lineTo":"moveTo"](q[0],q[1])); c.stroke(); } };
    c.save(); c.lineCap="round"; c.lineJoin="round";
    for(let b=0;b<5;b++){ const a0=atH(seed*7+b)*Math.PI*2, span=0.7+atH(seed+b*3)*0.9, pts=[];
      for(let k=0;k<=7;k++){ const a=a0+span*k/7, out=1+0.08*Math.sin(k/7*Math.PI)+(k%2?0.1:-0.04)*(atH(seed*13+k+b)+0.3); pts.push([cx+Math.cos(a)*rx*out,ecy+Math.sin(a)*ry*out]); }
      bolt(pts,1.8); }
    for(let b=0;b<3;b++){ if(atH(seed*3+b+40)<0.35) continue; const a=atH(seed*9+b)*Math.PI*2, x0=cx+Math.cos(a)*rx, y0=ecy+Math.sin(a)*ry, L=16+atH(seed+b)*18, pts=[[x0,y0]];
      for(let k=1;k<=3;k++) pts.push([x0+Math.cos(a)*L*k/3+(atH(seed+k*b)-0.5)*10,y0+Math.sin(a)*L*k/3+(atH(seed*2+k)-0.5)*10]); bolt(pts,1.3);
      bolt([pts[1],[pts[1][0]+Math.cos(a+0.9)*L*0.45,pts[1][1]+Math.sin(a+0.9)*L*0.45]],0.9); }
    c.restore();
    if(chance(0.35)){ const a=Math.random()*Math.PI*2, v=0.15+Math.random()*0.15; atPart({k:"spark",x:cx+Math.cos(a)*rx,y:ecy+Math.sin(a)*ry,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:220,c:[255,240,140]}); } }
  if(n==="Soak"){ if(chance(0.14)) atPart({k:"drop",x:cx+(Math.random()-0.5)*r*1.5,y:foot-H*(0.2+Math.random()*0.4),vy:0.02,g:0.0008,life:900,s:3.6,c:[110,170,255],floor:foot}); }
  if(n==="Daze"){ // stars and little circles spinning round its head on a ring, the cartoon way of seeing stars
    const ey=Q.eyes&&Q.eyes.length?Math.min(...Q.eyes.map(q=>q.y)):top+20, hy=Math.min(top-4,ey-24), rx=r*0.85, ry=10, spin=te/380;
    c.save(); c.strokeStyle="rgba(255,255,255,.45)"; c.lineWidth=2; c.setLineDash([5,6]); c.lineDashOffset=-te/30; c.beginPath(); c.ellipse(x,hy,rx,ry,0,0,7); c.stroke(); c.setLineDash([]); c.restore();
    const items=[]; for(let k=0;k<6;k++){ const a=spin+k*Math.PI/3; items.push([Math.sin(a),Math.cos(a),k]); } items.sort((p,q)=>p[0]-q[0]);
    for(const [z,cs,k] of items){ const ix=x+cs*rx, iy=hy+z*ry, sc=0.75+0.3*(z+1)/2; c.save(); c.globalAlpha=0.55+0.45*(z+1)/2; c.translate(ix,iy);
      if(k%2===0){ c.rotate(te/160+k); c.fillStyle="#ffd94a"; c.strokeStyle="#7a4a10"; c.lineWidth=1.6; c.beginPath(); for(let j=0;j<10;j++){ const rr=(j%2?3.4:8)*sc, b=j*Math.PI/5-Math.PI/2; c.lineTo(Math.cos(b)*rr,Math.sin(b)*rr); } c.closePath(); c.fill(); c.stroke(); }
      else { c.fillStyle="#bfe6ff"; c.strokeStyle="#2f5f8a"; c.lineWidth=1.6; c.beginPath(); c.arc(0,0,4.2*sc,0,7); c.fill(); c.stroke(); c.fillStyle="rgba(255,255,255,.9)"; c.beginPath(); c.arc(-1.3*sc,-1.3*sc,1.3*sc,0,7); c.fill(); }
      c.restore(); } }
  if(p.stun>0&&!(S.joltAt!=null&&te-S.joltAt<900)&&n!=="Daze"&&!p.sleep){ for(let k=0;k<3;k++){ const a=te/300+k*2.1, sx=x+Math.cos(a)*r*0.6, sy=top-4+Math.sin(a)*6;
      c.save(); c.translate(sx,sy); c.rotate(te/200+k); c.fillStyle="#ffd94a"; c.strokeStyle="#7a4a10"; c.lineWidth=1.5; c.beginPath();
      for(let j=0;j<10;j++){ const rr=j%2?3:7, b=j*Math.PI/5; c.lineTo(Math.cos(b)*rr,Math.sin(b)*rr); } c.closePath(); c.fill(); c.stroke(); c.restore(); } }
  if(n==="Crack"&&chance(0.05)) atPart({k:"pebble",x:cx+(Math.random()-0.5)*r*1.4,y:cy,vx:(Math.random()-0.5)*0.05,vy:-0.02,g:0.0012,life:700,s:3+Math.random()*2,seed:Math.random()*6});
  if(n==="Blind"){ // its eyes are screwed shut (atStatusEyes); a grey haze drifts across them and it looks round for its target
    const E=Q.eyes&&Q.eyes.length?Q.eyes:[{x:cx,y:top+H*0.3}], ex=E.reduce((a,q)=>a+q.x,0)/E.length, ey=E.reduce((a,q)=>a+q.y,0)/E.length;
    c.save(); for(let k=0;k<5;k++){ const ph=te/900+k*1.3, hx=ex+Math.sin(ph)*r*0.55, hy=ey+Math.cos(ph*1.3)*5, R=r*(0.32+0.08*Math.sin(ph*2));
      const g=c.createRadialGradient(hx,hy,1,hx,hy,R); g.addColorStop(0,"rgba(70,66,84,.55)"); g.addColorStop(1,"rgba(70,66,84,0)"); c.fillStyle=g; c.beginPath(); c.arc(hx,hy,R,0,7); c.fill(); } c.restore();
    const qk=(te%1600)/1600, sd=Math.floor(te/1600)%2?1:-1; c.save(); c.globalAlpha=Math.sin(qk*Math.PI); c.font="900 22px system-ui"; c.textAlign="center"; c.lineWidth=4; c.strokeStyle="#14151d"; c.fillStyle="#fff7d0";
    c.translate(x+sd*r*1.05,top+H*0.18-qk*18); c.rotate(sd*0.2); c.strokeText("?",0,0); c.fillText("?",0,0); c.restore(); }
  if(n==="Curse"){ if(chance(0.2)) atPart({k:"smoke",x:cx+(Math.random()-0.5)*r*1.4,y:foot-H*Math.random()*0.6,vy:-0.04,wob:0.012,seed:Math.random()*6,life:1000,s:9,c:[50,24,80]});
    c.save(); c.translate(x-(S.dir||1)*r*0.95,top+H*0.12+Math.sin(te/400)*4); c.rotate(te/1500); c.strokeStyle=`rgba(190,120,255,${0.75+0.2*Math.sin(te/180)})`; c.shadowColor="rgba(170,90,255,.9)"; c.shadowBlur=10; c.lineWidth=2.5;
    c.beginPath(); c.arc(0,0,15,0,7); c.stroke(); c.beginPath(); for(let k=0;k<=3;k++){ const a=k*Math.PI*2/3-Math.PI/2; c.lineTo(Math.cos(a)*15,Math.sin(a)*15); } c.stroke();
    c.beginPath(); for(let k=0;k<=3;k++){ const a=k*Math.PI*2/3+Math.PI/2; c.lineTo(Math.cos(a)*15,Math.sin(a)*15); } c.stroke(); c.restore(); }
  if(n==="Dread"){ c.save(); c.translate(x+r*0.55,top+H*0.18+((te/12)%30)); c.globalAlpha=1-((te/12)%30)/30; c.fillStyle="#8fd3ff"; c.beginPath(); c.moveTo(0,-7); c.quadraticCurveTo(5,1,0,5); c.quadraticCurveTo(-5,1,0,-7); c.fill(); c.restore();
    if(chance(0.12)) atPart({k:"smoke",x:cx+(Math.random()-0.5)*r*1.6,y:foot-6,vy:-0.035,life:900,s:8,c:[30,14,60]}); }
  if(p.sleep>0&&chance(0.04)) atPart({k:"z",x:x+r*0.4,y:top,vx:0.02,vy:-0.04,life:1200,s:14+Math.random()*8});
  if(p.hold>0){ for(let k=0;k<2;k++){ const yy=foot-H*(0.35+0.25*k), sq=1-0.06*Math.sin(te/90+k); c.strokeStyle="rgba(255,236,170,.85)"; c.lineWidth=4; c.beginPath(); c.ellipse(x,yy,r*0.95*sq,10,0,0.15,Math.PI-0.15); c.stroke(); } }
  if(p.slow>0){ c.save(); c.strokeStyle="rgba(250,248,240,.8)"; c.lineWidth=1.4; for(let k=0;k<5;k++){ const a=x-r*0.9+k*r*0.45, b=foot-H*(0.1+0.25*atH(k)); c.beginPath(); c.moveTo(a,foot+2); c.quadraticCurveTo(a+12,b+10,a+r*0.4,b); c.stroke(); }
    c.beginPath(); c.moveTo(x-r,foot-H*0.2); c.quadraticCurveTo(x,foot-H*0.12,x+r,foot-H*0.24); c.stroke(); c.restore(); }
  // shields and guards
  const left=k=>Math.min(1,(p.buff[k]||0)/0.6), sh=(st,a)=>{ if(typeof shieldFx==="function") shieldFx(c,{x,foot,top:{y:top},r:r*0.95},te,a,st); };
  if(p.buff.protect) sh(S.protName&&/Iron/.test(S.protName)?"steel":"bubble",0.55*left("protect"));
  if(p.buff.bubble) sh("bubble",0.5*left("bubble"));
  if(p.buff.bunker) sh("shell",0.45*left("bunker"));
  if(S.blockAt!=null&&te-S.blockAt<300){ const k=(te-S.blockAt)/300; sh("bubble",1-k); }
  if(p.buff.counter||p.buff.riposte){ // a spiky guard on the side facing the opponent, flaring like a coiled spring
    const d=S.dir||1, a=0.6+0.35*Math.sin(te/70); c.save(); c.lineJoin="round"; c.shadowColor="rgba(255,140,50,.95)"; c.shadowBlur=14;
    for(const [w,col] of [[7,`rgba(255,120,40,${a*0.6})`],[3,`rgba(255,230,160,${a})`]]){ c.strokeStyle=col; c.lineWidth=w; c.beginPath();
      for(let k=0;k<=10;k++){ const t=-1+k/5, rr=(k%2?r*1.0:r*1.32)*(1+0.05*Math.sin(te/60+k)); c.lineTo(x+d*Math.cos(t*0.95)*rr,cy+Math.sin(t*0.95)*rr*1.15); } c.stroke(); } c.restore(); }
  if(p.buff.mirror||S.mirrorAt!=null&&te-S.mirrorAt<350){ const d=S.dir||1, mx=x+d*r*1.15, flash=S.mirrorAt!=null?Math.max(0,1-(te-S.mirrorAt)/350):0, a=p.buff.mirror?0.55*left("mirror"):0;
    c.save(); c.translate(mx,cy); c.scale(0.35,1); const g=c.createLinearGradient(0,-H*0.6,0,H*0.6); g.addColorStop(0,`rgba(255,220,250,${a+flash})`); g.addColorStop(1,`rgba(200,170,255,${(a+flash)*0.6})`);
    c.fillStyle=g; c.strokeStyle=`rgba(255,255,255,${Math.min(1,a*1.5+flash)})`; c.lineWidth=3; c.beginPath(); c.ellipse(0,0,r*0.7,H*0.6,0,0,7); c.fill(); c.stroke();
    const sw=((te/700)%1)*2-1; c.strokeStyle=`rgba(255,255,255,${0.8*(a+flash)})`; c.lineWidth=6; c.beginPath(); c.moveTo(-r*0.5,H*0.5*sw-14); c.lineTo(r*0.5,H*0.5*sw+14); c.stroke(); c.restore(); }
  if(p.buff.unblink&&Q.eyes) for(const E of Q.eyes){ const g=c.createRadialGradient(E.x,E.y,1,E.x,E.y,12); g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(1,"rgba(255,90,140,0)"); c.fillStyle=g; c.beginPath(); c.arc(E.x,E.y,12,0,7); c.fill(); }
  if(p.buff.feedback){ const seed=Math.floor(te/80); c.strokeStyle="rgba(255,230,90,.8)"; c.lineWidth=2; c.beginPath(); for(let k=0;k<=16;k++){ const a=k/16*Math.PI*2, rr=r*1.15+(atH(seed+k)-0.5)*10; c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*1.15); } c.stroke(); }
  if(p.buff.foresight){ c.save(); c.translate(x,top-14); c.scale(1,1+0.1*Math.sin(te/150)); c.fillStyle="rgba(255,230,140,.9)"; c.shadowColor="rgba(255,210,90,1)"; c.shadowBlur=12;
    c.beginPath(); c.moveTo(0,-8); c.lineTo(6,0); c.lineTo(0,8); c.lineTo(-6,0); c.closePath(); c.fill(); c.fillStyle="#3a2050"; c.beginPath(); c.arc(0,0,2.4,0,7); c.fill(); c.restore(); }
  if(p.buff.taunt){ const a=0.7+0.3*Math.sin(te/90); c.save(); c.translate(x+r*0.6,top+4); c.scale(1+0.1*Math.sin(te/90),1+0.1*Math.sin(te/90)); c.strokeStyle=`rgba(230,50,50,${a})`; c.lineWidth=3.5; c.lineCap="round";
    for(let k=0;k<4;k++){ c.rotate(Math.PI/2); c.beginPath(); c.moveTo(3,-9); c.quadraticCurveTo(3,-3,9,-3); c.stroke(); } c.restore(); }
  if(p.buff.regen&&chance(0.05)) atPart({k:k5(),x:cx+(Math.random()-0.5)*r*1.6,y:foot-H*Math.random()*0.5,vy:-0.04,life:900,s:5,seed:Math.random()*6,c:[150,255,160]});
  if(p.buff.ward&&chance(0.06)) atPart({k:"el",el:"Light",x:cx+(Math.random()-0.5)*r*2,y:cy+(Math.random()-0.5)*H*0.6,vy:-0.02,life:700,s:1.8,seed:Math.random()*9});
}
const k5=()=>Math.random()<0.5?"leaf":"plus";

/* ---------- orbs that carry life or focus from one Snabit to the other ---------- */
function atStreams(c,placed,te){
  AT.streams=AT.streams.filter(s=>te-s.t0<s.d+400);
  for(const s of AT.streams){ const A=placed[s.from], B=placed[s.to]; if(!A||!B) continue; const a=A.center||A, b=B.center||B;
    for(let j=0;j<s.n;j++){ const k=(te-s.t0-j*40)/s.d; if(k<0||k>1) continue; const q=lerpP(a,b,eo(k),55+12*Math.sin(j*1.7),Math.sin(j*2.3+k*4)*16), R=5+3*(1-k);
      const g=c.createRadialGradient(q.x,q.y,0.5,q.x,q.y,R*2.4); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(0.35,atRgba(s.col,0.95)); g.addColorStop(1,atRgba(s.col,0)); c.fillStyle=g; c.beginPath(); c.arc(q.x,q.y,R*2.4,0,7); c.fill(); }
    if(!s.landed&&te-s.t0>s.d){ s.landed=true; const Q=atP(s.to); if(Q) for(let k=0;k<6;k++) atPart({k:"el",el:"Light",x:Q.cx+(atH(k)-0.5)*Q.r,y:Q.cy+(atH(k+1)-0.5)*Q.H*0.4,vy:-0.05,life:600,s:2,seed:k}); } }
}

/* ---------- under each HP bar: its status with seconds left, raised and lowered stats, and its guards ---------- */
function atChips(c,i,x,y,bw){
  const p=AT.ar.p[i], items=[];
  if(p.st){ const D=AT_ST[p.st.name]; items.push({t:`${p.st.name} ${Math.ceil(p.st.t)}`,bg:atRgba(D.c,1),fg:["Shock","Blind","Freeze","Daze"].includes(p.st.name)?"#14151d":"#fff",k:p.st.t/AR_STATUS[p.st.name].d}); }
  if(p.sleep>0) items.push({t:"Asleep",bg:"#5a6aa8",fg:"#fff"});
  for(const k of AR_STATS) if(p.stg[k]) items.push({t:`${AT_STAT_SHORT[k]}${p.stg[k]>0?"▲":"▼"}${Math.abs(p.stg[k])>1?Math.abs(p.stg[k]):""}`,bg:p.stg[k]>0?"#c4563a":"#3a5fa8",fg:"#fff"});
  const B=p.buff, guard=[["protect","Shield"],["counter","Counter"],["riposte","Counter"],["mirror","Mirror"],["castWard","Ward"],["ward","Calm"],["bulwark","Bulwark"],["endure","Endure"],["phase","Phase"],["regen","Regen"],["foresight","Foresight"],["bubble","Bubble"],["bunker","Bunker"],["taunt","Taunted"]];
  for(const [k,t] of guard) if(B[k]) items.push({t,bg:k==="taunt"?"#a33":k==="regen"?"#3f9a5a":"#3a3f58",fg:"#fff"});
  if(!items.length) return;
  c.font="800 9px system-ui"; c.textAlign="center"; let row=[], rows=[], w=0;
  for(const it of items){ it.w=c.measureText(it.t).width+10; if(w+it.w>bw+20&&row.length){ rows.push(row); row=[]; w=0; } row.push(it); w+=it.w+3; } rows.push(row);
  rows.slice(0,2).forEach((r,ri)=>{ const tw=r.reduce((a,it)=>a+it.w+3,-3); let cx=x+bw/2-tw/2; const yy=y-ri*15;
    for(const it of r){ c.fillStyle="rgba(20,21,29,.85)"; c.beginPath(); c.roundRect(cx-1,yy-1,it.w+2,14,5); c.fill(); c.fillStyle=it.bg; c.beginPath(); c.roundRect(cx,yy,it.w,12,4); c.fill();
      if(it.k!=null){ c.fillStyle="rgba(0,0,0,.28)"; c.beginPath(); c.roundRect(cx+it.w*it.k,yy,it.w*(1-it.k),12,[0,4,4,0]); c.fill(); }
      c.fillStyle=it.fg; c.fillText(it.t,cx+it.w/2,yy+9); cx+=it.w+3; } });
}

/* ---------- physical attacks with their own limbs ----------
   Kicks lift a real foot (Stilt's long legs, any family's feet), Skit stabs with a spider leg, Squib lashes a tentacle,
   Pinch snaps its claws, hammers come down from overhead, sweeps go in low, and moves that hit several times play every hit.
   Each kind draws its own hit marks, so the arena's generic marks are skipped for them (marks:true). Forward is local -x. */
const atPose=(base,o)=>({...CHIBI.blend(base,base,0),...o});
const AT_P={
  kickWind:atPose("idle",{feet:[6,-4,-2,0],tilt:7,lean:-5,eyes:"fierce",open:0.2}),
  kickMid:atPose("idle",{feet:[-30,-46,4,0],tilt:-6,lean:-2,eyes:"fierce",open:0.4}),
  kick:atPose("idle",{feet:[-62,-92,8,0],tilt:-18,lean:-9,eyes:"fierce",open:0.6}),
  highKick:atPose("idle",{feet:[-54,-124,10,0],tilt:-24,lean:-10,eyes:"fierce",open:0.7}),
  kickR:atPose("idle",{feet:[2,0,-58,-84],tilt:-12,lean:-6,eyes:"fierce",open:0.6}),
  axeUp:atPose("idle",{feet:[-26,-118,8,0],tilt:-26,lean:-12,eyes:"fierce",open:0.4}),
  axeDown:atPose("idle",{feet:[-50,-26,10,0],tilt:14,lean:10,eyes:"fierce",open:0.8,sx:1.06,sy:0.92}),
  sweep:atPose("crouch",{feet:[-58,6,12,0],sx:1.14,sy:0.8,tilt:-10,eyes:"fierce",open:0.5}),
  jabA:atPose("tackle",{jab:1,jabK:0,tilt:4,lean:4}), jabB:atPose("tackle",{jab:1,jabK:1,tilt:6,lean:5}), jabC:atPose("tackle",{jab:1,jabK:2,tilt:3,lean:3}), jabRest:atPose("tackle",{jab:0.25,jabK:0}),
  lashWind:atPose("idle",{lash:-0.3,tilt:6,lean:-3,eyes:"fierce"}), lash:atPose("attack",{lash:1,tilt:-6,lean:4}),
  clawOpen:atPose("attack",{arm:[[22,-14,40,-22],[22,-14,40,-22]],open:0.5}), clawSnap:atPose("attack",{arm:[[22,-2,36,-4],[22,-2,36,-4]],open:0.9})
};
// reach: lunge out to f, hold, ease home. pose(t) picks the frame
const atReach=(t,C,f,hold,back)=>t<C?f*eo(t/C):t<C+hold?f:f*(1-eio(Math.min(1,(t-C-hold)/back)));
const atDir=x=>x.target.x>x.self.x?1:-1;
function atKickMark(c,P,k,col,big,d,hi){
  const cx=P.x-d*10, cy=P.y+(hi?-26:0), R=(48+20*eo(Math.min(1,k*1.6)))*big, a0=hi?-2.6:-2.2, a1=a0+2.2*eo(Math.min(1,k*2.2));
  c.save(); c.translate(cx,cy); if(d<0) c.scale(-1,1); c.globalAlpha=1-Math.max(0,(k-0.4)/0.6); c.lineCap="round";
  c.strokeStyle=atRgba(col,0.85); c.lineWidth=18*big*(1-k*0.5); c.beginPath(); c.arc(0,0,R,a0,a1); c.stroke();
  c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=7*big*(1-k*0.5); c.beginPath(); c.arc(0,0,R,a0+0.15,a1); c.stroke();
  if(k<0.5){ const s=(1-k*2)*big; c.fillStyle="#fff"; c.beginPath(); for(let n=0;n<10;n++){ const a=n*Math.PI/5, r=n%2?10*s:30*s; c.lineTo(Math.cos(a)*r+18*big,Math.sin(a)*r); } c.closePath(); c.fill(); }
  c.restore();
}
function atStab(c,P,k,d,j,big){ // a spider leg's tip driven into the target
  const y=P.y-14+((j*37)%3-1)*14, tip={x:P.x-d*(6+(j%2)*8),y}, base={x:tip.x-d*70*big,y:y-30*big+((j*13)%2)*16};
  c.save(); c.globalAlpha=1-Math.max(0,(k-0.45)/0.55); const g=Math.min(1,k*4), tx=base.x+(tip.x-base.x)*g, ty=base.y+(tip.y-base.y)*g;
  c.fillStyle="#2a2433"; c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=1.5; c.beginPath(); c.moveTo(base.x,base.y-6*big); c.lineTo(tx,ty); c.lineTo(base.x,base.y+6*big); c.closePath(); c.fill(); c.stroke();
  if(k>0.2&&k<0.6){ const s=(0.6-k)/0.4*big; c.fillStyle="#fff"; c.beginPath(); for(let n=0;n<8;n++){ const a=n*Math.PI/4, r=n%2?5*s:18*s; c.lineTo(tip.x+Math.cos(a)*r,tip.y+Math.sin(a)*r); } c.closePath(); c.fill(); }
  c.restore();
}
function atPincer(c,P,k,col,d,big){ // two curved claw blades close on the target and snap
  const close=Math.min(1,k/0.4), open=1-eo(close), x=P.x-d*8, y=P.y-6;
  c.save(); c.globalAlpha=k<0.7?1:1-(k-0.7)/0.3;
  for(const sd of [-1,1]){ c.save(); c.translate(x-d*36*big,y); c.rotate(sd*(0.15+0.75*open)*d); c.scale(d*big,big);
    c.fillStyle=atRgba(col,1); c.strokeStyle=atRgba(col.map(v=>v*0.55),1); c.lineWidth=3; c.beginPath(); c.moveTo(-6,0); c.quadraticCurveTo(26,sd*-30,58,sd*-4); c.quadraticCurveTo(30,sd*-10,-6,sd*10); c.closePath(); c.fill(); c.stroke();
    c.fillStyle="rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(24,sd*-14,9,3,sd*-0.4,0,7); c.fill(); c.restore(); }
  if(close>=1&&k<0.75){ const s=(0.75-k)/0.35*big; c.fillStyle="#fff"; c.beginPath(); for(let n=0;n<10;n++){ const a=n*Math.PI/5, r=n%2?8*s:26*s; c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r); } c.closePath(); c.fill(); }
  c.restore();
}
function atLash(c,P,k,col,d,big){ // a whip trail across the target with a crack where it ends
  const g=eo(Math.min(1,k*2.4)), n=24, pts=[];
  for(let i=0;i<=n;i++){ const t=i/n*g; pts.push([P.x-d*(70-140*t)*big,P.y-60*big+Math.sin(t*Math.PI)*-28*big+t*90*big]); }
  c.save(); c.globalAlpha=1-Math.max(0,(k-0.5)/0.5); c.lineCap="round";
  for(let i=1;i<pts.length;i++){ const w=(3+12*(i/n))*big; c.strokeStyle=atRgba(col,0.9); c.lineWidth=w; c.beginPath(); c.moveTo(pts[i-1][0],pts[i-1][1]); c.lineTo(pts[i][0],pts[i][1]); c.stroke(); }
  c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=3*big; c.beginPath(); pts.forEach((q,i)=>c[i?"lineTo":"moveTo"](q[0],q[1])); c.stroke();
  if(g>0.9&&k<0.7){ const e=pts[pts.length-1], s=(0.7-k)/0.3*big; c.fillStyle="#fff"; c.beginPath(); for(let m=0;m<10;m++){ const a=m*Math.PI/5, r=m%2?6*s:22*s; c.lineTo(e[0]+Math.cos(a)*r,e[1]+Math.sin(a)*r); } c.closePath(); c.fill(); }
  c.restore();
}
function atSmash(c,P,k,col,big){ // streaks coming down on it, then cracks in the floor and dust
  c.save(); c.globalAlpha=1-Math.max(0,(k-0.5)/0.5); c.lineCap="round";
  if(k<0.45) for(let i=0;i<5;i++){ const x=P.x+(i-2)*16*big, y0=P.y-110*big, y1=y0+(80+i%2*20)*big*eo(k/0.45); c.strokeStyle=i%2?"rgba(255,255,255,.9)":atRgba(col,0.9); c.lineWidth=(5-Math.abs(i-2))*big; c.beginPath(); c.moveTo(x,y0); c.lineTo(x,y1); c.stroke(); }
  if(k>0.3){ c.strokeStyle="rgba(70,40,20,.75)"; c.lineWidth=3*big; for(const a of [-2.7,-2.2,-0.9,-0.4,Math.PI]){ c.beginPath(); c.moveTo(P.x,P.foot); c.lineTo(P.x+Math.cos(a)*60*big,P.foot+Math.sin(a)*8+6); c.stroke(); } if(k<0.4) dust(c,{x:P.x,foot:P.foot},Math.min(1,(k-0.3)/0.4)); }
  c.restore();
}
function atSweepMark(c,P,k,col,d,big){ const g=eo(Math.min(1,k*2.2)); c.save(); c.globalAlpha=1-Math.max(0,(k-0.45)/0.55); c.lineCap="round"; c.translate(P.x,P.foot-10); c.scale(d,0.32);
  c.strokeStyle=atRgba(col,0.85); c.lineWidth=22*big; c.beginPath(); c.arc(0,0,70*big,Math.PI*0.9,Math.PI*0.9+g*Math.PI*1.2); c.stroke();
  c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=8*big; c.beginPath(); c.arc(0,0,70*big,Math.PI*0.95,Math.PI*0.9+g*Math.PI*1.2); c.stroke(); c.restore(); }
const atBig=x=>(x.pw||1)*0.9;
Object.assign(ANIM,{
  kick:{C:300,D:900,contact:true,marks:true,
    atk:t=>({f:atReach(t,300,0.5,260,380),pose:t<140?AT_P.kickWind:t<300?AT_P.kickMid:t<580?AT_P.kick:"idle"}),
    fx(c,t,x){ if(t>=280&&t<620) atKickMark(c,x.target,(t-280)/340,x.col,atBig(x),atDir(x),false); }},
  highkick:{C:340,D:960,contact:true,marks:true,
    atk:t=>({f:atReach(t,340,0.5,260,380),pose:t<150?AT_P.kickWind:t<340?AT_P.kickMid:t<620?AT_P.highKick:"idle",arc:t<340?-18*Math.sin(t/340*Math.PI):0}),
    fx(c,t,x){ if(t>=320&&t<680) atKickMark(c,x.target,(t-320)/360,x.col,atBig(x)*1.2,atDir(x),true); }},
  axekick:{C:440,D:1020,contact:true,marks:true,
    atk:t=>({f:atReach(t,440,0.56,240,340),pose:t<300?AT_P.axeUp:t<680?AT_P.axeDown:"idle",arc:t<300?-22*eo(t/300):t<440?-22*(1-ei((t-300)/140)):0}),
    def(t){ if(t<440||t>700) return null; const a=1-eo((t-440)/260); return {sx:1+0.3*a,sy:1-0.35*a}; },
    fx(c,t,x){ if(t>=300&&t<760) atSmash(c,x.target,(t-300)/460,x.col,atBig(x)); }},
  sweep:{C:300,D:880,contact:true,marks:true,
    atk:t=>({f:atReach(t,300,0.56,240,340),pose:t<120?"crouch":t<540?AT_P.sweep:"idle",rot:t>=180&&t<540?-0.08:0}),
    def(t){ if(t<300||t>700) return null; const k=(t-300)/400; return {rot:-0.35*Math.sin(k*Math.PI),arc:-30*Math.sin(k*Math.PI),pose:"hit"}; },
    fx(c,t,x){ if(t>=240&&t<600) atSweepMark(c,x.target,(t-240)/360,x.col,atBig(x),atDir(x)); }},
  pinch:{C:380,D:920,contact:true,marks:true,
    atk:t=>({f:atReach(t,380,0.66,220,320),pose:t<380?AT_P.clawOpen:t<600?AT_P.clawSnap:"idle"}),
    fx(c,t,x){ if(t>=230&&t<700) atPincer(c,x.target,(t-230)/470,x.col,atDir(x),atBig(x)); }},
  vicegrip:{C:380,D:1250,contact:true,marks:true,
    atk:t=>({f:atReach(t,380,0.7,560,300),pose:t<380?AT_P.clawOpen:t<940?AT_P.clawSnap:"idle",off:[t>380&&t<940?Math.sin(t/30)*2:0,0]}),
    def(t){ if(t<380||t>940) return null; return {sx:0.9+0.03*Math.sin(t/40),sy:1.06,pose:"hurt",off:[Math.sin(t/25)*2,0]}; },
    fx(c,t,x){ if(t>=230&&t<1100) atPincer(c,x.target,Math.min(0.55,(t-230)/470)+(t>940?(t-940)/320:0),x.col,atDir(x),atBig(x)); }},
  hammer:{C:440,D:1000,contact:true,marks:true,
    atk:t=>({f:atReach(t,440,0.7,220,340),pose:t<300?"slamup":t<660?"slam":"idle",arc:t<300?-30*eo(t/300):t<440?-30*(1-ei((t-300)/140)):0}),
    def(t){ if(t<440||t>720) return null; const a=1-eo((t-440)/280); return {sx:1+0.45*a,sy:1-0.5*a}; },
    fx(c,t,x){ if(t>=300&&t<780) atSmash(c,x.target,(t-300)/480,x.col,atBig(x)*1.2); }},
  lash:{C:340,D:880,contact:true,marks:true,
    atk:t=>({f:atReach(t,340,0.5,220,320),pose:t<200?AT_P.lashWind:t<560?AT_P.lash:"idle"}),
    fx(c,t,x){ if(t>=240&&t<640) atLash(c,x.target,(t-240)/400,x.col,atDir(x),atBig(x)); }},
  jawlock:{C:300,D:1200,contact:true,
    atk:t=>({f:atReach(t,300,0.78,580,300),pose:t<150?"crouch":t<300?"bitewide":t<880?"chomp":"idle",off:[t>300&&t<880?Math.sin(t/28)*3:0,0]}),
    def(t){ if(t<300||t>880) return null; return {pose:"hurt",off:[Math.sin(t/24)*3,0]}; },
    fx(c,t,x){ if(t>300&&t<880&&Math.floor(t/120)%2===0) chompMarks(c,x.target,((t-300)%240)/240); }}
});
/* moves that hit several times: lunge in, then one strike per hit 105 ms apart, each with its own mark */
function atFlurry(n,frames,mark,F=0.7){ const C=280, gap=105, end=C+n*gap;
  return {C,D:end+380,contact:true,marks:true,
    atk:t=>{ const j=Math.floor((t-C)/gap); return {f:t<C?F*eo(t/C):t<end?F+0.06*Math.sin(((t-C)%gap)/gap*Math.PI):F*(1-eio(Math.min(1,(t-end)/340))),pose:t<C*0.6?"crouch":t<end?frames[((j%frames.length)+frames.length)%frames.length]:"idle"}; },
    def(t){ if(t<C||t>end+60) return null; const p=((t-C)%gap)/gap; return {off:[(1-p)*6,0],pose:"hit"}; },
    fx(c,t,x){ for(let j=0;j<n;j++){ const t0=C+j*gap-30, k=(t-t0)/300; if(k>=0&&k<1) mark(c,x,k,j); } }}; }
Object.assign(ANIM,{
  legflurry:atFlurry(4,[AT_P.jabA,AT_P.jabRest,AT_P.jabB,AT_P.jabRest,AT_P.jabC],(c,x,k,j)=>atStab(c,x.target,k,atDir(x),j,atBig(x)*1.3),0.48),
  gnash:atFlurry(4,["bitewide","chomp"],(c,x,k,j)=>chompMarks(c,{x:x.target.x+((j%2)*2-1)*8,y:x.target.y+(j-1.5)*6},k)),
  stampede:atFlurry(3,[AT_P.kick,AT_P.kickR],(c,x,k,j)=>atKickMark(c,x.target,k,x.col,atBig(x)*0.8,atDir(x),j%2===1),0.5),
  kickflurry:atFlurry(4,[AT_P.kick,AT_P.kickR],(c,x,k,j)=>atKickMark(c,x.target,k,x.col,atBig(x)*0.75,atDir(x),j%2===1),0.5),
  punchflurry:atFlurry(3,["punchwind","punch"],(c,x,k,j)=>{ if(typeof burst==="function") burst(c,{x:x.target.x+((j%2)*2-1)*10,y:x.target.y+(j-1)*12},k,x.col); })
});
/* the signature moves of the five families added 14 Nov 2026 */
function atBottle(c,p,rot,col,s=1){ c.save(); c.translate(p.x,p.y); c.rotate(rot); c.scale(s,s);
  c.fillStyle="rgba(235,245,255,.85)"; c.beginPath(); c.arc(0,3,7,0,7); c.fill(); c.fillRect(-2.5,-8,5,7);
  c.fillStyle=rgbS(col,0.95); c.beginPath(); c.arc(0,4,5.4,0,Math.PI); c.lineTo(-5.4,4); c.fill(); c.fillRect(-5.2,2,10.4,2.5);
  c.fillStyle="#8a5a32"; c.fillRect(-3,-11,6,4); c.fillStyle="rgba(255,255,255,.8)"; c.fillRect(-4.5,0,1.6,4); c.restore(); }
function atSplash(c,p,k,col,big=1){ c.save(); c.translate(p.x,p.y); c.globalAlpha=1-k;
  for(let i=0;i<9;i++){ const a=-Math.PI*0.15-i*Math.PI*0.7/8-Math.PI*0.08, r=(8+k*30)*big; c.fillStyle=rgbS(col.map(v=>Math.min(255,v+40)),1);
    c.beginPath(); c.arc(Math.cos(a)*r,Math.sin(a)*r+k*k*20,(4-k*2.5)*big,0,7); c.fill(); }
  c.fillStyle=rgbS(col,0.5); c.beginPath(); c.ellipse(0,6,(14+k*16)*big,(5+k*3)*big,0,0,7); c.fill(); c.restore(); }
Object.assign(ANIM,{
  onetwo:atFlurry(2,["punchwind","punch"],(c,x,k,j)=>{ if(typeof burst==="function") burst(c,{x:x.target.x+(j?8:-8),y:x.target.y+(j?6:-6)},k,x.col); },0.66),
  punchflurry5:atFlurry(5,["punchwind","punch"],(c,x,k,j)=>{ if(typeof burst==="function") burst(c,{x:x.target.x+((j%2)*2-1)*10,y:x.target.y+(j-2)*7},k,x.col); }),
  /* Fizz throws a bottle of its own colour in an arc; it bursts in a splash with bubbles */
  potion:{C:640,D:1000,
    atk:t=>({f:0,pose:t<240?"slamup":t<700?"push":"idle"}),
    fx(c,t,x){ const o=x.from[0], tg=x.target; if(t<240) atBottle(c,{x:o.x,y:o.y-10*eo(t/240)},-0.4*eo(t/240),x.col);
      else if(t<640){ const k=(t-240)/400, p=lerpP({x:o.x,y:o.y-10},tg,k,60*atBig(x)); atBottle(c,p,(t-240)/70,x.col); }
      else if(t<1000) atSplash(c,tg,(t-640)/360,x.col,atBig(x)); }},
  /* Teep: a jet of steam from the spout, puffs that grow and drift as they go */
  steam:{C:420,D:1020,
    atk:t=>({f:0,pose:t<180?"cast":t<860?"push":"idle"}),
    fx(c,t,x){ const o=x.from[0], tg=x.target; if(t<180){ c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.arc(o.x,o.y,3+t/30,0,7); c.fill(); return; }
      const w=Math.min(1,(t-180)/120)*Math.min(1,(900-t)/160); if(w<=0) return;
      for(let i=0;i<14;i++){ const k=((t-180)/520+i/14)%1, p=lerpP(o,tg,k,0,Math.sin(i*2.1+t/90)*6*k), r=(4+k*14)*atBig(x);
        c.fillStyle=`rgba(255,255,255,${0.75*w*(1-k*0.6)})`; c.beginPath(); c.arc(p.x,p.y-k*8,r,0,7); c.fill(); }
      c.fillStyle=rgbS(x.col,0.25*w); c.beginPath(); c.arc(tg.x,tg.y,18*atBig(x),0,7); c.fill(); }},
  /* Lern: it glows brighter and brighter, then bursts in rays that wash over the target */
  flash:{C:380,D:900,
    atk:t=>({f:0,pose:t<300?"cast":t<700?"push":"idle"}),
    fx(c,t,x){ const s=x.self, tg=x.target;
      if(t<380){ const k=t/380, g=c.createRadialGradient(s.x,s.y,1,s.x,s.y,20+50*k); g.addColorStop(0,`rgba(255,250,220,${0.9*k})`); g.addColorStop(1,"rgba(255,240,180,0)"); c.fillStyle=g; c.fillRect(s.x-80,s.y-80,160,160); return; }
      const k=(t-380)/520; if(k>1) return; c.save(); c.globalAlpha=1-k; c.strokeStyle="rgba(255,248,200,.9)"; c.lineCap="round";
      for(let i=0;i<12;i++){ const a=i*Math.PI/6+0.2, r0=10+k*30, r1=r0+40*(1-k*0.5); c.lineWidth=5*(1-k)+1; c.beginPath(); c.moveTo(s.x+Math.cos(a)*r0,s.y+Math.sin(a)*r0); c.lineTo(s.x+Math.cos(a)*r1,s.y+Math.sin(a)*r1); c.stroke(); }
      const g=c.createRadialGradient(tg.x,tg.y,2,tg.x,tg.y,60*atBig(x)); g.addColorStop(0,"rgba(255,255,235,.85)"); g.addColorStop(1,"rgba(255,255,235,0)"); c.fillStyle=g; c.fillRect(tg.x-70,tg.y-70,140,140); c.restore(); }}
});
/* which animation a family move plays in the arena, by its own name (a Blaze Snabit's "Flame Kick" is still Kick) */
const AR_KIND={Lunge:"bite","Jaw Lock":"jawlock",Gnash:"gnash",
  Pinch:"pinch","Claw Jab":"claw","Vice Grip":"vicegrip","Crab Hammer":"hammer",
  Kick:"kick","High Kick":"highkick","Axe Kick":"axekick",Sweep:"sweep","Long Stride":"kick",Stampede:"stampede","Kick Off":"kick","Jump Kick":"kick",Rush:"tackle",Dive:"talondive",
  Nip:"bite","Skitter Bite":"bite",Web:"web","Reel In":"web","Trap Line":"web",Cocoon:"web","Leg Flurry":"legflurry",
  "Tentacle Lash":"lash",Riptide:"wave","Eye Beam":"beam","Scan Beam":"beam",Stare:"beam","Spirit Lance":"spear",Poltergeist:"push","Boo!":"push",Dread:"push",
  "Flurry Kick":"kickflurry","Comet Punch":"punchflurry",Barrage:"punchflurry",
  "Trunk Swat":"lash",Stomp:"stomp","Trunk Slam":"hammer",Trumpet:"push","Quake Stomp":"rockpath","Mammoth Charge":"tackle",
  Jab:"punch","Dash Punch":"punch","One-Two":"onetwo",Uppercut:"punch",Haymaker:"punch","Flurry Punch":"punchflurry5",
  Bubble:"bolt","Cork Pop":"push","Potion Toss":"potion","Beaker Splash":"volley","Boil Over":"pillar","Explosive Brew":"meteor",
  Splash:"bolt","Lid Bonk":"tackle","Steam Jet":"steam",Scald:"bolt",Whistle:"push","Boiling Point":"pillar",
  Ember:"bolt",Flash:"flash","Spark Shower":"volley",Beacon:"beam","Sky Lantern":"meteor",
  // the twelve families of 15 Nov 2026
  "Spore Puff":"bolt","Cap Bonk":"tackle","Drowsy Spores":"steam","Toxic Cloud":"steam","Fairy Ring":"volley","Bloom Burst":"pillar",
  "Wing Clip":"claw","Dive Bite":"talondive",Sonar:"push","Fang Flurry":"gnash","Leech Bite":"nightbite",Screech:"push",
  Glob:"bolt","Slime Slap":"lash",Engulf:"jawlock","Sticky Trap":"web","Body Splash":"tackle","Acid Flood":"wave",
  Tick:"punch","Alarm Ring":"push","Second Hand":"punchflurry",Pendulum:"hammer","Time Stop":"flash",Midnight:"pillar",
  "Mitt Jab":"punch","Step In":"punch","Big Swing":"punch","Body Blow":"punch",Knockout:"hammer","Combo Rush":"punchflurry5",
  Poke:"spear","Spin Open":"push","Rain Shot":"volley","Hook Pull":"lash","Thunder Clap":"lightning",Downpour:"volley",
  Prick:"claw","Needle Shot":"spear","Cactus Punch":"punch","Needle Spray":"volley","Saguaro Slam":"hammer",
  Scratch:"claw","Dig Under":"tackle","Claw Swipe":"claw","Mud Fling":"bolt","Drill Claw":"claw","Cave In":"boulder",
  "Tentacle Slap":"lash","Ink Cloud":"steam","Crushing Grip":"vicegrip",Reach:"lash",Whirlpool:"wave","Eight Arms":"legflurry","Deep Vortex":"wave",
  "Rock Fist":"punch","Pebble Toss":"bolt","Boulder Smash":"hammer",Tremor:"rockpath","Rune Pulse":"beam","Mountain Fall":"avalanche",
  "Horn Jab":"spear",Gallop:"tackle","Prism Beam":"beam",Starlight:"volley","Rainbow Charge":"tackle",Wish:"meteor",
  "Vine Slap":"lash","Candle Flick":"bolt","Spooky Grin":"push","Pip Spit":"volley","Hollow Howl":"push","Pumpkin Bomb":"meteor",
  // batch 3, 16 Nov 2026
  "Hot Wax":"bolt","Wick Whip":"lash","Melt Down":"foxfire","Candle Burst":"volley",Blowtorch:"beam",Bonfire:"pillar",
  "Glow Bump":"tackle","Light Dart":"bolt","Lantern Flash":"flash","Firefly Swarm":"volley","Lamp Beam":"beam","Swarm Light":"sunflare",
  "Pillow Bop":"tackle",Yawn:"push","Sleepy Slam":"stomp","Feather Burst":"volley","Big Snore":"wave",
  "Ink Flick":"bolt",Splotch:"tackle","Ink Blot":"steam",Scribble:"punchflurry","Pen Stab":"spear","Ink Flood":"wave",
  "Rock Bump":"tackle","Skip Stone":"bolt","Rubble Roll":"boulder","Gravel Spray":"volley","Crystal Shard":"spear","Geode Crash":"hammer",
  Drip:"bolt","Puff Push":"push",Downdraft:"wave",Hailstones:"volley",Thunderclap:"lightning",Cloudburst:"wave",
  "Skewer Poke":"spear",Bounce:"tackle","Triple Stack":"punchflurry","Mochi Smack":"punch","Sakura Cut":"claw","Skewer Thrust":"spear",
  "Nut Bonk":"tackle","Acorn Drop":"meteor","Root Snare":"web","Leaf Storm":"volley","Branch Whip":"lash","Old Growth":"hammer",
  "Plate Bash":"tackle",Skitter:"tackle","Hundred Legs":"legflurry","Pill Roll":"boulder","Wrecking Ball":"boulder",
  "Slime Spit":"bolt","Shell Bump":"tackle","Sticky Trail":"web","Feeler Flick":"lash","House Slam":"hammer",
  "Tin Punch":"punch","Spring Hop":"tackle","Wind-Up Barrage":"punchflurry5","Rivet Shot":"volley","Rocket Fist":"punch","Steam Blast":"beam",
  "Paper Cut":"claw","Fold Dart":"spear","Thousand Cranes":"volley","Paper Gust":"push","Wing Slice":"claw","Phoenix Fold":"sunflare",
  "Twig Poke":"spear","Leaf Shot":"bolt","Pruning Snip":"pinch","Blossom Flurry":"volley","Trunk Twist":"lash","Blossom Burst":"pillar",
  "Snow Pellet":"bolt","Frost Bump":"tackle","Shake Up":"steam","Blizzard Spin":"volley",Whiteout:"avalanche",
  "Clasp Snap":"bite","Note Toss":"bolt","Music Box Waltz":"push",Pirouette:"kickflurry",Crescendo:"wave","Grand Finale":"sunflare",
  "Crumb Toss":"volley","Toast Slap":"tackle","Toast Pop":"tackle","Hot Coals":"foxfire","Kettle Steam":"steam","Full Breakfast":"meteor",
  "Wind Nudge":"push","Pinwheel Spin":"kickflurry",Updraft:"wave","Tail Lash":"lash","Dive Bomb":"talondive","Jet Stream":"beam",
  "Doll Bonk":"tackle","Little Sister":"bolt","Nesting Stack":"punchflurry","Lid Clap":"hammer","Sister Parade":"volley","Russian Roll":"boulder",
  Clink:"punch","Bolt Toss":"spear",Attract:"lash",Repel:"push","Scrap Storm":"volley",Overcharge:"lightning","Field Crush":"pillar",
  "Jelly Bump":"tackle","Sting Shot":"bolt","Jelly Zap":"lightning","Tentacle Flurry":"legflurry","Bubble Net":"web","Bloom Pulse":"wave",
  "Toe Poke":"punch","Lint Ball":"bolt","Sock It":"punch","Thread Whip":"lash","Yarn Snare":"web","Woolly Roar":"push",
  "Sprinkle Toss":"volley","Cake Bump":"tackle","Frosting Splat":"web","Cherry Bomb":"meteor","Birthday Blaze":"foxfire","Layer Cake":"hammer",
  "Bubble Pop":"bolt","Soap Slide":"tackle","Foam Burst":"volley","Suds Slam":"stomp","Bath Flood":"wave",
  "Cone Jab":"spear","Sprinkle Shot":"volley","Brain Freeze":"avalanche","Melt Drip":"web","Sundae Slam":"hammer","Gelato Glacier":"avalanche",
  "Page Cut":"claw","Word Bolt":"bolt","Read Aloud":"push","Paper Storm":"volley","Spell Rune":"beam","Grand Grimoire":"pillar",
  "Gum Shot":"bolt",Chew:"bite","Gumball Rain":"volley","Sticky Gum":"web",Jawbreaker:"hammer","Candy Crash":"boulder",
  "Leaf Slice":"claw","Pineapple Toss":"bolt","Crown Spin":"kickflurry","Spiky Roll":"boulder","Tiki Torch":"foxfire","Luau Blast":"sunflare",
  "Coin Toss":"bolt","Piggy Charge":"tackle","Pay Day":"volley","Gold Rush":"punchflurry","Treasure Trap":"jawlock",Jackpot:"meteor",
  "Wand Tap":"punch","Card Throw":"volley","Rabbit Out":"flash","Dove Flight":"volley","Saw in Half":"claw","Grand Illusion":"flash",
  Bumper:"tackle","Dust Cloud":"steam",Suction:"lash","Brush Spin":"legflurry","Full Power":"tackle","Deep Clean":"wave",
  Snap:"bite","Film Lash":"lash","Photo Flash":"flash","Burst Mode":"volley","Zoom Lens":"beam","Grand Exposure":"sunflare",
  "String Whip":"lash","Spin Bump":"tackle","Around the World":"kickflurry","Cat's Cradle":"web","Top Grind":"sweep","Tornado Spin":"boulder",
  "Hot Blob":"bolt","Magma Bump":"tackle",Eruption:"pillar","Molten Rain":"volley","Magma Wave":"wave","Volcano Blast":"meteor",
  Boing:"stomp","Bounce Shot":"bolt","Pogo Stomp":"stomp","Jack Pop":"push","Spring Kick":"kickflurry","Mega Boing":"stomp",
  "Brass Bonk":"tackle","Bubble Shot":"bolt","Air Hose":"wave","Lead Boots":"stomp","Sonar Ping":"push","Depth Charge":"meteor",
  // the specials of 16 Nov 2026
  "Nose Poke":"spear","Fan Gust":"gust","Gale Fan":"tornado","Mountain Wind":"gust","Diving Kick":"talondive","Great Tempest":"tornado",
  "Belly Bump":"tackle","Leaf Toss":"volley","Belly Drum":"hammer","Straw Hat Toss":"bolt","Big Belly Slam":"avalanche",
  "Tail Flick":"lash","Pearl Shot":"bolt","Siren Song":"push","Rip Current":"wave","Fin Slap":"lash","Tidal Aria":"wave",
  "Petal Pat":"punch","Pollen Puff":"bolt","Petal Storm":"volley","Thorn Whip":"lash","Fairy Lights":"volley","Grove Bloom":"pillar",
  "Paw Swipe":"claw","Lion Leap":"tackle","Puzzle Gaze":"beam","Desert Roar":"push","Sun Disc":"bolt","Great Pounce":"talondive",
  "Crown Peck":"punch","Wing Rush":"tackle","Garuda Dive":"talondive","Feather Storm":"volley","Serpent Snatch":"vicegrip","Heaven Dive":"talondive",
  "Wolf Claw":"claw","Moon Howl":"push","Feral Slash":"shadowclaw","Lunar Leap":"tackle","Fang Frenzy":"gnash","Midnight Maul":"shadowclaw",
  "Horn Butt":"tackle","Hoof Stamp":"stomp","Bull Rush":"tackle","Axe Swing":"hammer","Labyrinth Charge":"tackle","Great Axe":"hammer",
  "Claw Rake":"claw","Ember Breath":"bolt","Wyrm Breath":"firespin","Tail Smash":"lash","Wing Buffet":"gust","Dragon Fury":"meteor",
  "Storm Peck":"punch","Static Feather":"bolt","Thunder Wing":"lightning","Wing Clap":"push","Chain Bolt":"volley","Storm Bringer":"lightning",
  "Twin Fang":"bite","Bog Spit":"potion","Many Heads":"gnash","Neck Lash":"lash","Swamp Gas":"steam","Hydra Rage":"gnash",
  "Beak Jab":"punch","Swoop Down":"tackle","Sky Talon":"talondive","Wing Gale":"gust","Lion Pounce":"talondive","Royal Dive":"talondive",
  "Hoof Kick":"kick","Ember Step":"bolt","Holy Flame":"firespin","Horn Thrust":"spear","Frost Mane":"beam","Heaven Gallop":"stampede",
  "Tongue Flick":"lash","Cinder Spit":"bolt","Flame Tail":"lash","Ember Roll":"tackle","Lava Splash":"meteor","Inferno Tail":"lash",
  "Moon Bite":"bite","Tide Splash":"wave","Swallow the Moon":"jawlock","Whisker Lash":"lash","Eclipse Wave":"wave","Serpent Tide":"wave",
  "Guard Bite":"bite","Triple Bark":"push","Gate Fang":"nightbite","Chain Lash":"lash","Ember Howl":"firespin","Triple Maul":"gnash",
  "Smoke Puff":"steam","Wish Spark":"bolt","Lamp Blast":"beam","Sand Whirl":"tornado","Genie Grip":"web","Third Wish":"beam",
  "Club Bonk":"hammer","Rock Toss":"boulder","Bridge Smash":"hammer","Troll Stomp":"stomp","Boulder Hurl":"boulder","Mountain Club":"hammer",
  "Wrap Slap":"punch","Bandage Lash":"lash","Mummy Wrap":"web","Tomb Dust":"steam","Tomb Curse":"flash","Sand Tomb":"pillar",
  "Comb Peck":"punch","Fish Toss":"boulder","Rainbow Fan":"volley","Spur Kick":"kick","Lucky Feathers":"volley","Sunrise Strike":"talondive"};

/* ---------- the special Snabits' signature moves ---------- */
function atBat(c,x,y,s,flap){ c.save(); c.translate(x,y); c.scale(s,s); c.fillStyle="#2a1d33"; const w=Math.sin(flap)*0.5+0.6;
  c.beginPath(); c.ellipse(0,0,4,5,0,0,7); c.fill();
  for(const sd of [-1,1]){ c.beginPath(); c.moveTo(0,-1); c.quadraticCurveTo(sd*7,-8*w,sd*14,-3*w); c.quadraticCurveTo(sd*10,0,sd*12,3); c.quadraticCurveTo(sd*7,1,sd*4,4); c.closePath(); c.fill(); }
  c.fillStyle="#ff4a5c"; c.fillRect(-2,-2,1.4,1.4); c.fillRect(0.8,-2,1.4,1.4); c.restore(); }
function atWisp(c,x,y,r,col){ const g=c.createRadialGradient(x,y,1,x,y,r*2.2); g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(0.35,atRgba(col,0.85)); g.addColorStop(1,atRgba(col,0)); c.fillStyle=g; c.beginPath(); c.arc(x,y,r*2.2,0,7); c.fill(); }
Object.assign(ANIM,{
  /* Eagle: it climbs out of sight, then dives on the target talons first */
  talondive:{C:560,D:1150,contact:true,marks:true,
    atk:t=>t<300?{f:-0.05*eo(t/300),arc:-90*eo(t/300),pose:"jump"}:t<560?{f:0.85*ei((t-300)/260),arc:-90*(1-ei((t-300)/260)),pose:"tackle"}:{f:0.85*(1-eio(Math.min(1,(t-560-180)/400))),arc:0,pose:t<800?"land":"idle"},
    def(t){ if(t<560||t>820) return null; const a=1-eo((t-560)/260); return {sx:1+0.3*a,sy:1-0.3*a,pose:"hit"}; },
    fx(c,t,x){ if(t>320&&t<560){ const k=(t-320)/240; c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=3; c.lineCap="round"; for(let i=0;i<4;i++){ const px=x.target.x-(1-k)*40+(i-1.5)*8, py=x.target.y-80*(1-k)-30; c.beginPath(); c.moveTo(px,py); c.lineTo(px-6,py-26); c.stroke(); } }
      if(t>=540&&t<860){ const k=(t-540)/320; for(let i=0;i<3;i++) slash(c,{x:x.target.x+(i-1)*9,y:x.target.y+(i-1)*4},k,x.col,0.9); } }},
  /* Vampire: a bite, then little bats carry the stolen life back to it */
  nightbite:{C:320,D:1150,contact:true,
    atk:t=>({f:atReach(t,320,0.74,200,320),pose:t<160?"crouch":t<320?"bitewide":t<520?"chomp":"idle"}),
    fx(c,t,x){ if(t>320&&t<520) chompMarks(c,x.target,(t-320)/200);
      for(let i=0;i<5;i++){ const k=(t-460-i*70)/520; if(k<0||k>1) continue; const p=lerpP(x.target,x.self,eio(k),40+i*8,Math.sin(i*1.7)*12); atBat(c,p.x,p.y,0.9,t/40+i); } }},
  /* Phoenix: a ball of flame gathers, flies in an arc with a fiery tail and bursts in a ring of fire */
  sunflare:{C:640,D:1200,
    atk:t=>({f:0,pose:t<380?"cast":t<900?"push":"idle"}),
    fx(c,t,x){ const s=x.self, tg=x.target;
      if(t<380){ const k=t/380; atWisp(c,s.x,s.y-6,6+10*k,[255,150,40]); return; }
      if(t<640){ const k=(t-380)/260; for(let j=0;j<8;j++){ const kk=Math.max(0,k-j*0.04), p=lerpP(s,tg,eio(kk),70); atWisp(c,p.x,p.y,(12-j)*0.9*atBig(x),j<3?[255,220,90]:[255,110,40]); } return; }
      const k=(t-640)/560; if(k>1) return; c.save(); c.globalAlpha=1-k;
      for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, r=(10+k*46)*atBig(x), px=tg.x+Math.cos(a)*r, py=tg.y+Math.sin(a)*r*0.5;
        c.fillStyle=i%2?"#ffd45e":"#ff7a2e"; c.beginPath(); c.moveTo(px-5,py+4); c.quadraticCurveTo(px,py-14*(1-k),px+5,py+4); c.closePath(); c.fill(); }
      atWisp(c,tg.x,tg.y,16*(1-k)*atBig(x)+4,[255,190,80]); c.restore(); }},
  /* Kitsune: three fox-fires circle it, then fly at the target one after another */
  foxfire:{C:560,D:1150,
    atk:t=>({f:0,pose:t<420?"cast":t<900?"push":"idle"}),
    fx(c,t,x){ const s=x.self, tg=x.target, col=[150,200,255];
      for(let i=0;i<3;i++){ const go=420+i*105, a=t/160+i*2.1;
        if(t<go){ atWisp(c,s.x+Math.cos(a)*26,s.y-8+Math.sin(a)*12,6,col); continue; }
        const k=(t-go)/240; if(k<1){ const p=lerpP({x:s.x+Math.cos(a)*26,y:s.y-8},tg,eio(k),30,Math.sin(i*2)*14); atWisp(c,p.x,p.y,6,col); }
        else if(k<2.2){ c.save(); c.globalAlpha=1-(k-1)/1.2; atWisp(c,tg.x+(i-1)*8,tg.y+(i-1)*5,6+(k-1)*14,col); c.restore(); } } }},
  /* Naga: it lunges and its coils wrap the target and squeeze */
  venomcoil:{C:360,D:1250,contact:true,
    atk:t=>({f:atReach(t,360,0.72,520,320),pose:t<180?"crouch":t<880?"push":"idle",off:[t>360&&t<880?Math.sin(t/35)*2:0,0]}),
    def(t){ if(t<360||t>880) return null; return {sx:0.88+0.04*Math.sin(t/45),sy:1.05,pose:"hurt"}; },
    fx(c,t,x){ if(t<300||t>960) return; const tg=x.target, k=Math.min(1,(t-300)/200), out=t>880?1-(t-880)/80:1;
      c.save(); c.globalAlpha=out; c.lineCap="round";
      for(let i=0;i<3;i++){ const y=tg.y-14+i*14, w=(30-i*2)*atBig(x)*(1.25-0.25*k);
        c.strokeStyle=atRgba(x.col.map(v=>Math.max(0,v-50)),1); c.lineWidth=9; c.beginPath(); c.ellipse(tg.x,y+2,w,7,0,0.2,Math.PI*2*k); c.stroke();
        c.strokeStyle=atRgba(x.col,1); c.lineWidth=6; c.beginPath(); c.ellipse(tg.x,y,w,7,0,0.2,Math.PI*2*k); c.stroke(); }
      if(t>500) for(let i=0;i<3;i++){ const ph=((t-500)/400+i/3)%1; c.fillStyle=`rgba(170,90,230,${1-ph})`; c.beginPath(); c.arc(tg.x+(i-1)*14,tg.y-30-ph*24,3+ph*3,0,7); c.fill(); }
      c.restore(); }},
  /* Yeti: it leaps and slams down, snow chunks fly and a white cloud bursts out */
  avalanche:{C:560,D:1200,contact:true,marks:true,
    atk:t=>({f:atReach(t,560,0.72,240,360),arc:t<560?-60*Math.sin(t/560*Math.PI):0,pose:t<200?"crouch":t<560?"slamup":t<800?"slam":"idle"}),
    def(t){ if(t<560||t>860) return null; const a=1-eo((t-560)/300); return {sx:1+0.4*a,sy:1-0.45*a,pose:"hit"}; },
    fx(c,t,x){ if(t<520) return; const k=(t-520)/680; if(k>1) return; const tg=x.target, B=atBig(x);
      c.save(); c.globalAlpha=1-k; for(let i=0;i<10;i++){ const a=-Math.PI*(0.1+0.8*i/9), r=(14+k*60)*B; c.fillStyle=i%3?"#f4f8ff":"#cfe4f5";
        c.beginPath(); c.arc(tg.x+Math.cos(a)*r,tg.foot!=null?tg.y+Math.sin(a)*r*0.7+k*k*30:tg.y+Math.sin(a)*r*0.7+k*k*30,(6-k*3)*B,0,7); c.fill(); }
      c.fillStyle="rgba(240,248,255,.7)"; c.beginPath(); c.ellipse(tg.x,tg.y+24,(30+k*50)*B,(10+k*8)*B,0,0,7); c.fill(); c.restore(); }}
});
Object.assign(AR_KIND,{Peck:"punch",Swoop:"tackle","Talon Dive":"talondive","Wing Gust":"push","Feather Volley":"volley","Sky Strike":"talondive",
  Nip:"bite","Bat Swarm":"volley","Night Bite":"nightbite","Hypnotic Gaze":"glare","Blood Moon":"beam","Crimson Feast":"nightbite",
  "Ember Peck":"punch","Flame Wing":"tackle","Sun Flare":"sunflare","Fire Ring":"firespin","Ash Storm":"volley",Supernova:"meteor",
  "Fox Swipe":"claw",Foxfire:"foxfire","Spirit Lantern":"bolt","Nine Tails":"lash",Kitsunebi:"foxfire",
  Fang:"bite","Tail Whip":"lash","Venom Coil":"venomcoil","Hood Flare":"glare","Acid Spit":"bolt","Serpent King":"jawlock",
  "Snow Paw":"punch",Snowball:"bolt",Avalanche:"avalanche","Frost Breath":"steam","Glacier Slam":"hammer","Blizzard Roar":"icefall",
  "Bamboo Smack":"hammer",Stinger:"punch",Swarm:"volley","Shell Bash":"tackle","Seed Spit":"volley","Melon Smash":"hammer","Cane Hook":"lash",
  "Tiger Swipe":"claw",Pounce:"tackle","Stripe Dash":"tackle","Dazzle Stripes":"glare","Moo Rush":"tackle","Belly Slide":"tackle","Flipper Slap":"lash",
  "Berry Toss":"bolt",Squeak:"push","Anemone Sting":"punch","Reef Dart":"tackle"});
if(typeof MOVE_KIND!=="undefined") Object.assign(MOVE_KIND,{"Talon Dive":"fly","Night Bite":"bite","Sun Flare":"bolt",Foxfire:"volley","Venom Coil":"bite",Avalanche:"stomp",
  "Bamboo Smack":"stomp","Roly-Poly":"heal",Stinger:"punch",Swarm:"volley","Shell Bash":"tackle","Lucky Spots":"buff","Seed Spit":"volley","Melon Smash":"stomp","Cane Hook":"claw","Sugar Rush":"buff",
  "Tiger Swipe":"claw",Pounce:"tackle","Stripe Dash":"tackle","Dazzle Stripes":"glare","Moo Rush":"tackle","Milk Break":"heal","Belly Slide":"tackle","Flipper Slap":"claw",
  "Berry Toss":"volley","Sweet Scent":"heal",Squeak:"glare","Bubble Bath":"heal","Anemone Sting":"punch","Reef Dart":"tackle",
  "Gale Fan":"gust","Belly Drum":"stomp","Siren Song":"glare","Petal Storm":"volley","Puzzle Gaze":"glare",
  "Garuda Dive":"fly","Feral Slash":"claw","Bull Rush":"tackle","Wyrm Breath":"bolt","Thunder Wing":"bolt",
  "Many Heads":"bite","Sky Talon":"fly","Holy Flame":"bolt","Flame Tail":"lash","Swallow the Moon":"bite","Gate Fang":"bite","Lamp Blast":"bolt","Bridge Smash":"hammer","Mummy Wrap":"lash","Rainbow Fan":"volley"});

/* ---------- batch 4 signature moves, each drawn from what the family is (16 Nov 2026) ---------- */
function atJelly(c,s,t,col,k){ // a glowing bell over the attacker that swells as it charges
  const B=8+k*6; c.save(); c.globalAlpha=0.55+0.45*k; const g=c.createRadialGradient(s.x,s.top.y,1,s.x,s.top.y,B*2.6); g.addColorStop(0,"rgba(255,255,255,.9)"); g.addColorStop(0.4,atRgba(col,0.7)); g.addColorStop(1,atRgba(col,0));
  c.fillStyle=g; c.beginPath(); c.arc(s.x,s.top.y,B*2.6,0,7); c.fill(); c.restore(); }
function atZig(c,a,b,n,amp,seed){ c.beginPath(); c.moveTo(a.x,a.y); for(let i=1;i<n;i++){ const k=i/n; c.lineTo(a.x+(b.x-a.x)*k+(atH(seed+i)-0.5)*amp,a.y+(b.y-a.y)*k+(atH(seed+i*7)-0.5)*amp); } c.lineTo(b.x,b.y); c.stroke(); }
function atSock(c,a,b,col,s){ // a striped sock stretched from a to b, toe at b
  const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy); if(L<2) return; c.save(); c.translate(a.x,a.y); c.rotate(Math.atan2(dy,dx));
  const w=11*s; for(let x=0;x<L-10*s;x+=8*s){ c.fillStyle=Math.floor(x/(8*s))%2?"#fff6ee":atRgba(col,1); c.fillRect(x,-w,8.5*s,w*2); }
  c.fillStyle="#fff6ee"; c.beginPath(); c.ellipse(L-6*s,2*s,15*s,w*1.15,0,0,7); c.fill();
  c.fillStyle=atRgba(col.map(v=>Math.max(0,v-40)),1); c.beginPath(); c.ellipse(L+2*s,3*s,8*s,w*0.95,0,-Math.PI/2,Math.PI/2); c.fill();
  c.strokeStyle="rgba(60,40,40,.35)"; c.lineWidth=1.5; c.strokeRect(0,-w,L-10*s,w*2); c.restore(); }
function atPow(c,p,k,s){ if(k<0||k>1) return; c.save(); c.translate(p.x,p.y); c.globalAlpha=1-ei(k); const R=(16+30*eo(k))*s;
  c.fillStyle="#ffe25a"; c.strokeStyle="#ff7a2e"; c.lineWidth=3; c.beginPath(); for(let i=0;i<20;i++){ const a=i/20*Math.PI*2, r=i%2?R*0.55:R; c[i?"lineTo":"moveTo"](Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); c.stroke();
  c.fillStyle="#fff"; c.beginPath(); c.arc(0,0,R*0.3,0,7); c.fill(); c.restore(); }
function atFluff(c,p,k,i,s){ const a=-Math.PI*0.9+i*0.55, r=(10+k*44)*s; c.fillStyle=`rgba(250,244,236,${1-k})`; for(const [ox,oy,rr] of [[0,0,4],[3,-2,3],[-3,-1,3]]){ c.beginPath(); c.arc(p.x+Math.cos(a)*r+ox*s,p.y+Math.sin(a)*r+k*k*26+oy*s,rr*s,0,7); c.fill(); } }
function atBubble(c,x,y,r,a=1){ c.save(); c.globalAlpha=a; c.fillStyle="rgba(200,235,255,.22)"; c.strokeStyle="rgba(235,250,255,.95)"; c.lineWidth=Math.max(1,r*0.14); c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.stroke();
  const g=c.createLinearGradient(x-r,y-r,x+r,y+r); g.addColorStop(0,"rgba(255,170,230,.5)"); g.addColorStop(0.5,"rgba(170,240,255,.0)"); g.addColorStop(1,"rgba(180,255,190,.45)"); c.strokeStyle=g; c.lineWidth=Math.max(1,r*0.22); c.beginPath(); c.arc(x,y,r*0.86,0,7); c.stroke();
  c.fillStyle="rgba(255,255,255,.9)"; c.beginPath(); c.ellipse(x-r*0.38,y-r*0.42,r*0.22,r*0.12,-0.7,0,7); c.fill(); c.restore(); }
function atPop(c,x,y,r,k){ c.save(); c.globalAlpha=1-k; c.strokeStyle="rgba(235,250,255,1)"; c.lineWidth=2; c.lineCap="round"; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, r0=r*(0.8+k*0.6), r1=r*(1.1+k*0.9); c.beginPath(); c.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0); c.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1); c.stroke(); } c.restore(); }
function atScoopBall(c,p,s,col,squash=0){ c.save(); c.translate(p.x,p.y); c.scale(s*(1+squash*0.5),s*(1-squash*0.45));
  c.fillStyle=atRgba(col,1); c.beginPath(); c.arc(0,0,12,Math.PI*0.92,Math.PI*2.08); for(let i=0;i<=6;i++){ const x=12-i*4; c.quadraticCurveTo(x-1,i%2?9:5,x-2,i%2?5:8); } c.closePath(); c.fill();
  c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-4,-5,4,2.4,-0.5,0,7); c.fill();
  c.fillStyle="#d8263c"; c.beginPath(); c.arc(1,-12,3.6,0,7); c.fill(); c.strokeStyle="#4a7a2a"; c.lineWidth=1.4; c.beginPath(); c.moveTo(1,-15); c.quadraticCurveTo(3,-19,6,-20); c.stroke();
  for(const [x,y,cc] of [[-6,-2,"#ff6fa0"],[5,-4,"#7fd0ff"],[0,2,"#ffe066"],[7,2,"#9be37a"]]){ c.fillStyle=cc; c.save(); c.translate(x,y); c.rotate(x); c.fillRect(-2,-0.7,4,1.4); c.restore(); } c.restore(); }
function atFlake(c,x,y,r,a){ c.save(); c.translate(x,y); c.rotate(a); c.strokeStyle="rgba(235,250,255,.95)"; c.lineWidth=1.6; c.lineCap="round";
  for(let i=0;i<3;i++){ c.rotate(Math.PI/3); c.beginPath(); c.moveTo(-r,0); c.lineTo(r,0); c.moveTo(r*0.55,0); c.lineTo(r*0.8,-r*0.25); c.moveTo(r*0.55,0); c.lineTo(r*0.8,r*0.25); c.stroke(); } c.restore(); }
/* shared pieces for the batch 4 signatures: energy drawn in toward a point, and the hit that shakes the screen */
function atGather(c,p,k,col,R,seed=0){ if(k<=0) return; c.save(); c.globalCompositeOperation="lighter";
  for(let i=0;i<14;i++){ const ph=(k*1.6+i/14)%1, a=i*2.4+seed, r=R*(1.6-ph*1.5); c.fillStyle=atRgba(col,0.9*(ph)); c.beginPath(); c.arc(p.x+Math.cos(a+ph*2)*r,p.y+Math.sin(a+ph*2)*r*0.8,Math.max(0.5,R*0.05*(1-ph*0.5)),0,7); c.fill(); }
  atWisp(c,p.x,p.y,R*0.12+R*0.32*k,col); c.restore(); }
function atStar4(c,x,y,r,col){ c.save(); c.translate(x,y); c.fillStyle=col; c.beginPath(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, rr=i%2?r*0.32:r; c[i?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); c.restore(); }
function atImpact(t,C,shake,flash){ if(typeof AT==='undefined'||!AT||t<C||t>C+70) return; AT.trauma=Math.max(AT.trauma||0,shake); if(flash&&(!AT.flash||performance.now()-AT.flash.t0>400)) AT.flash={t0:performance.now(),a:flash}; }
Object.assign(ANIM,{
  /* Bloop: it lights up and floats over the target, lets its own tentacles hang over it, and pulses light down them three times */
  jellyzap:{C:900,D:2000,contact:true,sig:true,
    atk:t=>{ const up=t<420?eo(t/420):t<1500?1:1-eio((t-1500)/450), go=t<420?0:t<880?eio((t-420)/460):t<1500?1:1-eio((t-1500)/450);
      return {f:1.15*go,arc:-14*up-22*go+3*Math.sin(t/90),pose:t<420?"cast":t<1550?"hover":"idle",sx:1+0.06*Math.sin(t/110),sy:1-0.06*Math.sin(t/110),flash:t>=900&&t<1500&&Math.floor((t-900)/100)%2===0?3:0}; },
    def(t){ if(t<900||t>1550) return null; const z=Math.floor((t-900)/100)%2; return {pose:"hurt",off:[Math.sin(t/16)*3,0],flash:z?0:3}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, Y=[255,236,140];
      if(t<900){ const k=Math.min(1,t/420); c.save(); c.globalCompositeOperation="lighter"; c.globalAlpha=0.75; atWisp(c,s.x,s.y-s.r*0.35,s.r*(0.12+0.16*k),Y); c.globalAlpha=1;
        for(let i=0;i<6;i++){ const ph=((t/500)+i/6)%1, a=i*1.05; c.fillStyle=atRgba(Y,0.8*ph); c.beginPath(); c.arc(s.x+Math.cos(a)*s.r*1.3*(1-ph),s.y-s.r*0.2+Math.sin(a)*s.r*1.1*(1-ph),s.r*0.06,0,7); c.fill(); } c.restore(); return; }
      if(t>1600) return;
      for(let p=0;p<3;p++){ const T0=900+p*200, k=(t-T0)/380; atImpact(t,T0,p?0.3:0.5,p?0:0.3); if(k<0||k>1) continue;
        c.save(); c.globalCompositeOperation="lighter"; c.globalAlpha=0.6*(1-k); atWisp(c,tg.x,tg.y-R*0.1,R*0.32,Y);
        c.globalAlpha=1-k; c.fillStyle="rgba(255,248,200,.18)"; c.beginPath(); c.ellipse(tg.x,tg.y,R*(0.8+k*0.9),R*(0.6+k*0.7),0,0,7); c.fill();
        for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+p*0.4, r=R*(0.7+k*1.1); atStar4(c,tg.x+Math.cos(a)*r,tg.y+Math.sin(a)*r*0.75,R*0.13*(1-k*0.5),"rgba(255,244,170,1)"); }
        c.restore(); } }},
  /* Sox: it squashes down like a coiled spring, then its whole body flings forward and slaps the target, and it bounces back into shape */
  sockit:{C:620,D:1300,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      if(t<420){ const k=eo(t/420); return {f:-0.06*k,sx:1+0.18*k,sy:1-0.28*k,rot:-d*0.12*k,pose:"crouch"}; }
      if(t<620){ const k=ei((t-420)/200); return {f:0.62*k,sx:1.18-0.38*k,sy:0.72+0.6*k,rot:-d*0.12+d*0.62*k,pose:"punch"}; }
      if(t<820){ const k=(t-620)/200; return {f:0.62,sx:0.8+0.06*Math.sin(k*12),sy:1.32-0.05*Math.sin(k*12),rot:d*0.5,pose:"punch"}; }
      const k=(t-820)/480, sp=Math.sin(k*Math.PI*3)*(1-k); return {f:0.62*(1-eio(k)),sx:1+0.2*sp,sy:1-0.2*sp,rot:d*0.5*(1-eio(k))-d*0.08*sp,pose:k<0.6?"idle":"happy"}; },
    def(t){ if(t<620||t>1050) return null; const a=1-eo((t-620)/430); return {sx:1-0.28*a,sy:1+0.14*a,off:[26*a,-4*a],pose:"hit"}; },
    fx(c,t,x){ const tg=x.target, s=x.self, R=tg.r, d=atDir(x);
      if(t>=420&&t<640){ const k=(t-420)/220; c.fillStyle=`rgba(235,228,214,${0.8*(1-k)})`; for(let i=0;i<3;i++){ c.beginPath(); c.arc(s.x-d*s.r*(0.4+k*0.8+i*0.2),s.foot-4-i*3,s.r*(0.12+k*0.1),0,7); c.fill(); } }
      atImpact(t,620,0.65,0.3);
      if(t>=610){ const k=(t-610)/420; atPow(c,{x:tg.x-d*R*0.45,y:tg.y-R*0.15},k,R/26); for(let i=0;i<7;i++) atFluff(c,{x:tg.x-d*R*0.3,y:tg.y},Math.min(1,(t-610)/700),i*0.8,R/30); } }},
  /* Cuppy: a big piping bag swells as it squeezes, fires a thick rope of frosting, and buries the target's head in a swirl with a cherry on top */
  frostingsplat:{C:920,D:2300,sig:true,
    atk:t=>({f:0,rot:t<560?-0.1*Math.sin(t/90):0,pose:t<560?"cast":t<1100?"push":"idle",sx:t<560?1+0.05*t/560:1,sy:t<560?1-0.05*t/560:1}),
    def(t){ if(t<920||t>2000) return null; const a=1-eo((t-920)/260); return {sx:1+0.16*a,sy:1-0.2*a-0.04,off:[0,4*a],pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, cream=[255,250,238], pink=[255,140,185], d=atDir(x), out=t>1950?1-(t-1950)/350:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      const bag={x:s.x+d*s.r*1.0,y:s.y-s.r*0.75}, swell=t<560?eo(t/560):t<920?1-0.4*eo((t-560)/360):0.6;
      if(t<1000){ c.save(); c.translate(bag.x,bag.y); c.rotate(d*(1.1+0.15*Math.sin(t/70))); const W=s.r*(0.45+0.25*swell), H=s.r*1.1;
        c.fillStyle="#f6f3ec"; c.beginPath(); c.moveTo(0,H*0.5); c.quadraticCurveTo(-W*1.2,-H*0.1,-W,-H*0.55); c.quadraticCurveTo(0,-H*0.75,W,-H*0.55); c.quadraticCurveTo(W*1.2,-H*0.1,0,H*0.5); c.fill(); c.strokeStyle="rgba(150,120,110,.6)"; c.lineWidth=1.5; c.stroke();
        c.fillStyle=atRgba(pink,0.35); c.beginPath(); c.ellipse(0,-H*0.15,W*0.6,H*0.28,0,0,7); c.fill(); c.fillStyle="#c9ccd2"; c.beginPath(); c.moveTo(-W*0.2,H*0.45); c.lineTo(W*0.2,H*0.45); c.lineTo(0,H*0.68); c.fill();
        c.restore(); if(t<560) atGather(c,{x:bag.x+d*s.r*0.6,y:bag.y+s.r*0.5},t/560,pink,s.r*0.6,3); }
      const tip={x:bag.x+d*s.r*0.62,y:bag.y+s.r*0.55}, head={x:tg.x,y:tg.top.y+R*0.1};
      const k=Math.min(1,Math.max(0,(t-560)/360)), gone=t>980?Math.min(1,(t-980)/250):0;
      if(k>0&&gone<1){ const pts=[]; for(let j=Math.floor(gone*40);j<=Math.floor(k*40);j++) pts.push(lerpP(tip,head,j/40,R*1.2)); if(pts.length>1){ c.lineCap="round"; c.lineJoin="round";
        const line=(w,st,dash)=>{ c.setLineDash(dash||[]); c.strokeStyle=st; c.lineWidth=w; c.beginPath(); pts.forEach((p,j)=>c[j?"lineTo":"moveTo"](p.x,p.y)); c.stroke(); };
        line(R*0.3,"rgba(200,150,140,.7)"); line(R*0.26,atRgba(cream,1)); line(R*0.08,atRgba(pink,0.9)); line(R*0.26,"rgba(230,215,205,.6)",[R*0.04,R*0.14]); line(R*0.05,"rgba(255,255,255,.8)"); c.setLineDash([]); } }
      atImpact(t,920,0.45,0.25);
      if(t>=900){ const g=eo(Math.min(1,(t-900)/240));
        if(t<1300){ const sk=(t-900)/400; for(let i=0;i<10;i++){ const a=-Math.PI*(0.05+0.9*i/9), r=R*(0.5+sk*1.3); c.fillStyle=atRgba(i%2?cream:pink,1-sk); c.beginPath(); c.arc(head.x+Math.cos(a)*r,head.y+Math.sin(a)*r*0.7+sk*sk*R,R*0.09*(1-sk*0.5),0,7); c.fill(); } }
        for(let r=0;r<4;r++){ const w=R*(1.15-r*0.25)*g, y=head.y-r*R*0.26*g; c.fillStyle=atRgba(r%2?pink:cream,1); c.strokeStyle="rgba(190,140,130,.6)"; c.lineWidth=1.5; c.beginPath(); c.ellipse(head.x,y,w,R*0.2*g+1,0,0,7); c.fill(); c.stroke(); c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(head.x-w*0.4,y-R*0.05,w*0.22,R*0.05,0,0,7); c.fill(); }
        for(let i=0;i<5;i++){ const drip=Math.min(1,(t-980-i*70)/500); if(drip>0){ const dx=head.x+(i-2)*R*0.42; c.fillStyle=atRgba(i%2?pink:cream,1); c.fillRect(dx-R*0.05,head.y,R*0.1,drip*R*0.55); c.beginPath(); c.arc(dx,head.y+drip*R*0.55,R*0.07,0,7); c.fill(); } }
        const ch=Math.min(1,(t-1100)/220); if(ch>0){ const cy=head.y-R*0.95*g-(1-eo(ch))*R*1.5; c.strokeStyle="#4a7a2a"; c.lineWidth=2; c.beginPath(); c.moveTo(head.x,cy-R*0.12); c.quadraticCurveTo(head.x+R*0.1,cy-R*0.35,head.x+R*0.25,cy-R*0.4); c.stroke(); c.fillStyle="#d8203a"; c.beginPath(); c.arc(head.x,cy,R*0.16,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.arc(head.x-R*0.05,cy-R*0.05,R*0.05,0,7); c.fill(); }
        const rr=rng(7); for(let i=0;i<22;i++){ const land=t-950-i*22; if(land<0) continue; const f=Math.min(1,land/150), sx=head.x+(rr()-0.5)*R*2, sy=head.y-rr()*R*0.8*g;
          c.save(); c.translate(sx,sy-(1-f)*R*1.2); c.rotate(rr()*3); c.fillStyle=["#ff3f7f","#3fa8ff","#ffc61a","#4cc94c","#9b5cff"][i%5]; c.fillRect(-R*0.09,-R*0.03,R*0.18,R*0.06); c.restore(); } }
      c.restore(); }},
  /* Suds: it blows one giant bubble that floats over and swallows the target, smaller bubbles burst inside it, then the big one pops */
  foamburst:{C:820,D:2150,sig:true,
    atk:t=>({f:0,pose:t<560?"cast":t<1600?"push":"idle",sx:t<560?1+0.1*eo(t/560):1,sy:t<560?1-0.08*eo(t/560):1}),
    def(t){ if(t<820||t>1750) return null; return {pose:"hurt",lift:t<1550?10*Math.sin(Math.min(1,(t-820)/300)*Math.PI/2):10*(1-(t-1550)/200),off:[Math.sin(t/40)*3,0]}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), mouth={x:s.x+d*s.r*0.9,y:s.y-s.r*0.1};
      if(t<560){ const g=eo(t/560); atBubble(c,mouth.x+d*R*0.5*g,mouth.y-R*0.1*g,R*(0.15+0.75*g)*(1+0.04*Math.sin(t/40)),1); for(let i=0;i<4;i++){ const ph=((t/400)+i/4)%1; atBubble(c,mouth.x+d*ph*R,mouth.y-ph*R*1.2,R*0.08,1-ph); } return; }
      const Big=R*1.35, fly=Math.min(1,(t-560)/260), pos=fly<1?lerpP({x:mouth.x+d*R*0.5,y:mouth.y-R*0.1},{x:tg.x,y:tg.y-R*0.1},eio(fly),R*0.8):{x:tg.x,y:tg.y-R*0.1-(t<1550?10*Math.sin(Math.min(1,(t-820)/300)*Math.PI/2):0)};
      const rad=fly<1?R*0.9+(Big-R*0.9)*fly:Big*(1+0.03*Math.sin(t/50));
      if(t<1560) atBubble(c,pos.x,pos.y,rad,0.95);
      const r=rng(13); for(let w=0;w<3;w++){ const T0=900+w*220; for(let i=0;i<6;i++){ const a=r()*7, rr=r()*Big*0.6, bx=pos.x+Math.cos(a+t/400)*rr, by=pos.y+Math.sin(a+t/400)*rr*0.8, br=R*(0.12+r()*0.1);
          if(t>820&&t<T0) atBubble(c,bx,by,br,0.9); else if(t>=T0&&t<T0+260) atPop(c,bx,by,br*1.4,(t-T0)/260); } atImpact(t,T0,0.3,0); }
      atImpact(t,1560,0.6,0.35);
      if(t>=1560&&t<2150){ const k=(t-1560)/590; atPop(c,pos.x,pos.y,Big,k); for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, rr=Big*(1+k*0.9); c.fillStyle=`rgba(235,250,255,${1-k})`; c.beginPath(); c.arc(pos.x+Math.cos(a)*rr,pos.y+Math.sin(a)*rr*0.8+k*k*R*0.8,R*0.1*(1-k*0.6),0,7); c.fill(); }
        c.fillStyle=`rgba(255,255,255,${0.7*(1-k)})`; c.beginPath(); c.ellipse(tg.x,tg.foot-2,R*1.4*(0.6+k*0.6),R*0.22,0,0,7); c.fill(); } }},
  /* Scoop: cold mist gathers into a huge scoop over its head, it flicks the scoop across, the scoop lands on the target and freezes it solid */
  brainfreeze:{C:950,D:2300,sig:true,
    atk:t=>({f:0,rot:t<600?-0.15*eo(t/600):t<760?-0.15+0.4*eo((t-600)/160):0.25*(1-eo((t-760)/400)),pose:t<600?"cast":t<1100?"push":"idle"}),
    def(t){ if(t<950||t>2050) return null; const a=1-eo((t-950)/240); return {sx:1+0.22*a,sy:1-0.28*a,off:[Math.sin(t/12)*(t>1150?2.5:0),0],pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, col=x.col.map(v=>Math.min(255,v*0.35+180)), ICE=[200,235,255], over={x:s.x+atDir(x)*s.r*1.05,y:s.y-s.r*0.55}, head={x:tg.x,y:tg.top.y+R*0.05}, S=R/12*0.55;
      const out=t>2000?1-(t-2000)/300:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      if(t<640){ const g=eo(t/600); atGather(c,over,t/600,ICE,s.r*1.2,5); for(let i=0;i<6;i++){ const ph=((t/700)+i/6)%1; c.fillStyle=`rgba(230,245,255,${0.5*(1-ph)})`; c.beginPath(); c.arc(over.x+(i-2.5)*s.r*0.3,over.y+s.r*0.6-ph*s.r,s.r*0.15*(1+ph),0,7); c.fill(); }
        atScoopBall(c,over,S*Math.max(0.05,g),col); c.restore(); return; }
      if(t<950){ const k=(t-640)/310, p=lerpP(over,{x:head.x,y:head.y-R*0.4},eio(k),R*2.4); atScoopBall(c,p,S,col); c.strokeStyle="rgba(220,240,255,.5)"; c.lineWidth=2; for(let j=1;j<5;j++){ const q=lerpP(over,{x:head.x,y:head.y-R*0.4},eio(Math.max(0,k-j*0.05)),R*2.4); atFlake(c,q.x,q.y,R*0.06,j); } c.restore(); return; }
      atImpact(t,950,0.55,0.4);
      const sq=1-eo(Math.min(1,(t-950)/220)); atScoopBall(c,{x:head.x,y:head.y-R*0.35+sq*R*0.15},S,col,sq);
      const fr=Math.max(0.001,eo(Math.min(1,(t-980)/280))), bh=(tg.foot-tg.top.y)*0.6+R*0.2, cy=tg.foot-bh;
      c.fillStyle=`rgba(190,230,255,${0.45*fr})`; c.strokeStyle=`rgba(245,252,255,${0.95*fr})`; c.lineWidth=3; c.beginPath(); c.ellipse(tg.x,cy,R*1.25,bh*fr,0,0,7); c.fill(); c.stroke();
      c.fillStyle=`rgba(255,255,255,${0.75*fr})`; c.beginPath(); c.ellipse(tg.x-R*0.7,cy-bh*0.5,R*0.14,bh*0.28,-0.35,0,7); c.fill();
      for(let i=0;i<7;i++){ const L=Math.min(1,(t-1050-i*40)/250); if(L<=0) continue; const ix=tg.x+(i-3)*R*0.32; c.fillStyle="rgba(225,245,255,.95)"; c.beginPath(); c.moveTo(ix-R*0.08,tg.foot-R*0.15); c.lineTo(ix+R*0.08,tg.foot-R*0.15); c.lineTo(ix,tg.foot-R*0.15+R*0.35*L*(0.6+(i%3)*0.2)); c.fill(); }
      for(let i=0;i<8;i++){ const k=Math.min(1,(t-1000-i*45)/300); if(k>0) atFlake(c,tg.x+Math.cos(i*0.8)*R*1.05,cy+Math.sin(i*0.8)*bh*0.85,R*0.13*k,t/500+i); }
      if(t>1150){ const k=((t-1150)%380)/380; c.strokeStyle=`rgba(110,180,255,${1-k*0.5})`; c.lineWidth=3; c.lineCap="round";
        for(const sd of [-1,1]){ const bx=tg.x+sd*R*0.8, by=head.y-R*0.6-k*R*0.2; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+sd*R*0.15,by-R*0.15); c.lineTo(bx,by-R*0.3); c.lineTo(bx+sd*R*0.15,by-R*0.45); c.stroke(); } }
      c.restore(); }}
});
Object.assign(AR_KIND,{"Jelly Zap":"jellyzap","Sock It":"sockit","Frosting Splat":"frostingsplat","Foam Burst":"foamburst","Brain Freeze":"brainfreeze"});

/* ---------- batch 4 signatures, second group (16 Nov 2026) ---------- */
function atBall(c,x,y,r,col){ c.fillStyle=col; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.strokeStyle="rgba(60,30,50,.35)"; c.lineWidth=Math.max(1,r*0.12); c.stroke();
  c.fillStyle="rgba(255,255,255,.75)"; c.beginPath(); c.ellipse(x-r*0.35,y-r*0.38,r*0.28,r*0.18,-0.6,0,7); c.fill(); }
function atCoin(c,x,y,r,spin,a=1){ const w=Math.max(r*0.12,r*Math.abs(Math.cos(spin))); c.save(); c.globalAlpha*=a;
  c.fillStyle="#c98a12"; c.beginPath(); c.ellipse(x+r*0.08,y,w,r,0,0,7); c.fill(); c.fillStyle="#ffd23f"; c.beginPath(); c.ellipse(x,y,w,r,0,0,7); c.fill();
  c.strokeStyle="#e6a514"; c.lineWidth=Math.max(1,r*0.16); c.beginPath(); c.ellipse(x,y,w*0.68,r*0.68,0,0,7); c.stroke();
  c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(x-w*0.35,y-r*0.4,w*0.18,r*0.22,0,0,7); c.fill(); c.restore(); }
function atPuff(c,x,y,R,k){ if(k<0||k>1) return; c.save(); c.globalAlpha=1-k; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, r=R*(0.3+k*0.9);
    c.fillStyle=i%2?"#f4f1f6":"#dcd6e2"; c.beginPath(); c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r*0.7-k*R*0.3,R*(0.32-k*0.15),0,7); c.fill(); }
  c.fillStyle="#ffffff"; c.beginPath(); c.arc(x,y-k*R*0.3,R*0.35*(1-k),0,7); c.fill(); c.restore(); }
function atRabbit(c,x,y,S,d,sq=0,ear=0){ c.save(); c.translate(x,y); c.scale(d*S*(1+sq*0.3),S*(1-sq*0.3));
  c.strokeStyle="#4a3a48"; c.lineWidth=2.4/S; c.lineJoin="round";
  for(const [ex,ang] of [[-4,-0.25-ear],[4,0.18-ear*0.6]]){ c.save(); c.translate(ex+6,-30); c.rotate(ang); c.fillStyle="#ffffff"; c.beginPath(); c.ellipse(0,-13,5.5,15,0,0,7); c.fill(); c.stroke(); c.fillStyle="#ffb4c8"; c.beginPath(); c.ellipse(0,-12,2.6,10,0,0,7); c.fill(); c.restore(); }
  c.fillStyle="#ffffff"; c.beginPath(); c.ellipse(-4,0,18,14,0,0,7); c.fill(); c.stroke(); c.beginPath(); c.arc(-21,-2,6,0,7); c.fill(); c.stroke();
  c.beginPath(); c.arc(8,-18,13,0,7); c.fill(); c.stroke();
  c.fillStyle="#2a2030"; c.beginPath(); c.arc(13,-20,2.6,0,7); c.fill(); c.fillStyle="#fff"; c.beginPath(); c.arc(13.8,-21,0.9,0,7); c.fill();
  c.fillStyle="#ff8fb0"; c.beginPath(); c.arc(20,-15,2.2,0,7); c.fill(); c.fillStyle="rgba(255,150,180,.55)"; c.beginPath(); c.ellipse(9,-12,3.4,2,0,0,7); c.fill();
  c.fillStyle="#ffffff"; c.beginPath(); c.ellipse(4,12,7,4,0,0,7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(-12,12,7,4,0,0,7); c.fill(); c.stroke(); c.restore(); }
function atLeafBlade(c,x,y,L,a,col){ c.save(); c.translate(x,y); c.rotate(a); c.fillStyle=col; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(L*0.5,-L*0.28,L,0); c.quadraticCurveTo(L*0.5,L*0.16,0,0); c.fill();
  c.strokeStyle="rgba(40,90,30,.5)"; c.lineWidth=1.2; c.beginPath(); c.moveTo(L*0.1,0); c.lineTo(L*0.85,-L*0.02); c.stroke(); c.restore(); }
function atCrescent(c,x,y,R,a,k,col){ if(k<0||k>1) return; c.save(); c.translate(x,y); c.rotate(a); c.globalAlpha=1-ei(k); const sw=Math.PI*(0.3+0.9*eo(k));
  c.fillStyle=col; c.beginPath(); c.arc(0,0,R,-sw/2,sw/2); c.arc(R*0.22,0,R*0.86,sw/2,-sw/2,true); c.closePath(); c.fill();
  c.fillStyle="rgba(255,255,255,.8)"; c.beginPath(); c.arc(0,0,R,-sw/2*0.7,sw/2*0.7); c.arc(R*0.1,0,R*0.93,sw/2*0.7,-sw/2*0.7,true); c.closePath(); c.fill(); c.restore(); }
const AT_GUMS=["#ff4f7b","#ffd23f","#3fb8ff","#5ad35a","#b46bff","#ff8a3d"];
Object.assign(ANIM,{
  /* Tome: its pages flap open, then big bold letters fly out of it, circle the target's head and leave it dizzy */
  readaloud:{C:900,D:2100,sig:true,
    atk:t=>t<560?{f:0,arc:-10*eo(t/560),sx:1+0.1*Math.sin(t/28),sy:1-0.06*Math.sin(t/28),pose:"cast"}:t<1300?{f:0.05,arc:-10+10*eo((t-560)/300),pose:"push",sx:1.06,sy:0.96}:{f:0,pose:"idle"},
    def(t){ if(t<900||t>1850) return null; const w=Math.sin((t-900)/120); return {pose:"hurt",rot:0.12*w,off:[w*5,0]}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), out=t>1800?1-(t-1800)/300:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      if(t<700) for(let i=0;i<6;i++){ const a=t/220+i*1.05, px=s.x+Math.cos(a)*s.r*0.9, py=s.y-s.r*0.3+Math.sin(a)*s.r*0.35-Math.min(1,t/400)*s.r*0.3;
        c.save(); c.translate(px,py); c.rotate(Math.sin(t/90+i)*0.6); c.fillStyle="#fbf6e8"; c.strokeStyle="rgba(120,100,70,.6)"; c.lineWidth=1.2; c.beginPath(); c.rect(-s.r*0.13,-s.r*0.17,s.r*0.26,s.r*0.34); c.fill(); c.stroke();
        c.fillStyle="rgba(120,100,70,.45)"; for(let j=0;j<3;j++) c.fillRect(-s.r*0.08,-s.r*0.1+j*s.r*0.08,s.r*0.16,s.r*0.025); c.restore(); }
      const L=["A","B","C","!","?","Z"], cols=[x.col.map(v=>Math.min(255,v+40)),[255,214,90],[120,200,255],[255,120,170],[150,230,120],[200,150,255]], head={x:tg.x,y:tg.top.y-R*0.15};
      atImpact(t,900,0.4,0.2);
      for(let i=0;i<6;i++){ const t0=560+i*55, k=(t-t0)/340; if(k<0) continue; let px,py,sz=R*0.85;
        if(k<1){ const p=lerpP({x:s.x+d*s.r*0.7,y:s.y-s.r*0.3},head,eio(k),R*1.4,(i-2.5)*R*0.12); px=p.x; py=p.y; sz*=0.6+0.4*k; }
        else { const a=(t-t0-340)/260+i*1.047; px=head.x+Math.cos(a)*R*1.05; py=head.y+Math.sin(a)*R*0.35; if(t>1550){ const pk=(t-1550-i*30)/220; if(pk>1) continue; if(pk>0){ atStar4(c,px,py,R*0.35*pk+R*0.1,`rgba(255,240,170,${1-pk})`); continue; } } }
        c.save(); c.font=`900 ${Math.round(sz)}px system-ui,Arial Black,sans-serif`; c.textAlign="center"; c.textBaseline="middle"; c.lineJoin="round";
        c.strokeStyle="#3a2a40"; c.lineWidth=sz*0.16; c.strokeText(L[i],px,py); c.fillStyle=atRgba(cols[i],1); c.fillText(L[i],px,py);
        c.fillStyle="rgba(255,255,255,.55)"; c.fillText(L[i],px-sz*0.04,py-sz*0.05); c.fillStyle=atRgba(cols[i],1); c.fillText(L[i],px,py+sz*0.02); c.restore(); }
      c.restore(); }},
  /* Gumball: it rattles like a machine, its lid pops, and a fountain of gumballs arcs over and rains down on the target, bouncing off */
  gumballrain:{C:900,D:2000,sig:true,
    atk:t=>{ if(t<560){ const k=t/560; return {off:[Math.sin(t/14)*3*k,Math.cos(t/19)*1.5*k],sx:1+0.06*k,sy:1-0.1*k,pose:"crouch"}; }
      if(t<700){ const k=(t-560)/140; return {sx:1-0.15*Math.sin(k*Math.PI),sy:1+0.28*Math.sin(k*Math.PI),pose:"cast"}; }
      const sp=Math.sin((t-700)/50)*Math.max(0,1-(t-700)/400); return {sx:1+0.08*sp,sy:1-0.08*sp,pose:t<1300?"push":"idle"}; },
    def(t){ if(t<880||t>1450) return null; const h=Math.floor((t-880)/160)%2; return {pose:"hurt",sy:h?0.92:1,sx:h?1.06:1,off:[0,h?3:0]}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, src={x:s.x,y:s.top.y-s.r*0.1}, rr=R*0.23;
      for(let i=0;i<14;i++){ const t0=560+i*28, fly=360, k=(t-t0)/fly; if(k<0) continue; const tx=tg.x+((i*37)%9-4)*R*0.16, ty=tg.y-R*0.15-((i*13)%5)*R*0.1, col=AT_GUMS[i%6];
        if(k<1){ const p=lerpP(src,{x:tx,y:ty},k,R*2.6,0); atBall(c,p.x,p.y,rr*(0.7+0.3*k),col); continue; }
        const b=(t-t0-fly)/700; if(b>1) continue; const dirx=(i%2?1:-1)*(0.6+((i*7)%5)*0.15), bx=tx+dirx*R*1.4*b, fy=tg.foot-rr, y0=ty, by=b<0.45?y0+(fy-y0)*(b/0.45)*(b/0.45):fy-Math.sin((b-0.45)/0.55*Math.PI)*R*0.45*(1-b);
        c.save(); c.globalAlpha=b>0.7?1-(b-0.7)/0.3:1; atBall(c,bx,by,rr,col); c.restore(); }
      for(let h=0;h<3;h++){ const T0=900+h*150; atImpact(t,T0,0.35+0.1*h,h===2?0.2:0); const k=(t-T0)/200; if(k>=0&&k<1) atStar4(c,tg.x+(h-1)*R*0.35,tg.y-R*0.3,R*0.45*(1-k)+R*0.1,`rgba(255,255,255,${1-k})`); } }},
  /* Pina: it crouches, spins up like a top with its crown whirling, drills into the target three times and hops back */
  crownspin:{C:520,D:1550,contact:true,marks:true,sig:true,
    atk:t=>{ if(t<380){ const k=eo(t/380); return {f:-0.05*k,sx:1+0.12*k,sy:1-0.16*k,pose:"crouch"}; }
      const spin=Math.cos((t-380)/32);
      if(t<520){ const k=eo((t-380)/140); return {f:0.72*k,arc:-12*Math.sin(k*Math.PI),sx:0.35+0.65*Math.abs(spin),pose:"jump"}; }
      if(t<1130) return {f:0.72+0.04*Math.sin((t-520)/40),arc:-4*Math.abs(Math.sin((t-520)/60)),sx:(0.35+0.65*Math.abs(spin))*(spin<0?-1:1),pose:"hover"};
      const k=(t-1130)/420; return {f:0.72*(1-eio(k)),arc:-40*Math.sin(Math.min(1,k)*Math.PI),pose:k<0.8?"jump":"land",sx:1}; },
    def(t){ if(t<520||t>1250) return null; const p=((t-520)%200)/200; return {pose:"hit",off:[(1-p)*8,0],rot:0.06*Math.sin(t/30)}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), crown={x:s.x,y:s.top.y+s.r*0.05};
      if(t>300&&t<1180){ const n=6, rot=(t-300)/50; for(let i=0;i<n;i++){ const a=rot+i/n*Math.PI*2; c.save(); c.globalAlpha=0.9; atLeafBlade(c,crown.x+Math.cos(a)*s.r*0.15,crown.y+Math.sin(a)*s.r*0.05,s.r*1.15,a*0.999,i%2?"#7cc84e":"#4fa83a"); c.restore(); }
        c.fillStyle="rgba(255,255,255,.35)"; c.beginPath(); c.ellipse(crown.x,crown.y,s.r*0.85,s.r*0.2,0,0,7); c.fill(); }
      for(let h=0;h<3;h++){ const T0=520+h*200; atImpact(t,T0,0.3+h*0.12,h===2?0.25:0); const k=(t-T0)/280;
        atCrescent(c,tg.x-d*R*0.1,tg.y-R*0.1+(h-1)*R*0.25,R*0.95,(d>0?Math.PI:0)+(h-1)*0.5,k,h===2?"#ffd23f":"#7cc84e");
        if(k>0&&k<1) for(let j=0;j<4;j++){ const a=-Math.PI*(0.2+0.6*j/3)+h, r=R*(0.4+k*1.2); atLeafBlade(c,tg.x+Math.cos(a)*r,tg.y+Math.sin(a)*r*0.7+k*k*R*0.5,R*0.3*(1-k*0.5),a+t/100,"#5fb844"); } } }},
  /* Jingle: it rattles like a piggy bank with coins circling it, then fires three fans of spinning coins that clink off the target and scatter */
  payday:{C:880,D:2100,sig:true,
    atk:t=>{ if(t<560){ const k=t/560; return {off:[Math.sin(t/16)*3*k,0],arc:-Math.abs(Math.sin(t/90))*8*k,pose:"crouch",sx:1+0.05*k,sy:1-0.07*k}; }
      const v=Math.floor((t-560)/160), q=((t-560)%160)/160; return t<1050?{pose:"push",sx:1-0.1*Math.sin(q*Math.PI),sy:1+0.1*Math.sin(q*Math.PI),f:-0.02*v}:{pose:t<1500?"happy":"idle"}; },
    def(t){ if(t<880||t>1450) return null; const p=((t-880)%160)/160; return {pose:"hurt",off:[(1-p)*6,0]}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), cr=R*0.27;
      if(t<620) for(let i=0;i<5;i++){ const a=t/160+i*1.2566, k=Math.min(1,t/300); atCoin(c,s.x+Math.cos(a)*s.r*1.05*k,s.y-s.r*0.2+Math.sin(a)*s.r*0.45*k,cr*0.8,t/60+i,k); }
      const mouth={x:s.x+d*s.r*0.7,y:s.y-s.r*0.25};
      for(let v=0;v<3;v++) for(let i=0;i<4;i++){ const t0=560+v*160+i*20, k=(t-t0)/320; if(k<0) continue; const off=(i-1.5)*R*0.32, hit={x:tg.x-d*R*0.2,y:tg.y-R*0.2+off*0.6};
        if(k<1){ const p=lerpP(mouth,hit,k,R*0.5*(i-1.5),0); atCoin(c,p.x,p.y,cr,t/40+i); continue; }
        const b=(t-t0-320)/800; if(b>1) continue; const fx2=hit.x-d*R*(0.3+i*0.25)*b*1.6+off*0.4*b, fl=tg.foot-cr*0.3-i*2, fy=b<0.35?hit.y-R*0.7*Math.sin(b/0.35*Math.PI*0.5)+(fl-hit.y)*0*b:hit.y-R*0.7+(fl-hit.y+R*0.7)*Math.min(1,ei((b-0.35)/0.4));
        if(b<0.75) atCoin(c,fx2,fy,cr,t/30+i*2,1); else { c.save(); c.globalAlpha=1-(b-0.75)/0.25; c.fillStyle="#e6a514"; c.beginPath(); c.ellipse(fx2,fl,cr,cr*0.35,0,0,7); c.fill(); c.fillStyle="#ffd23f"; c.beginPath(); c.ellipse(fx2,fl-1,cr*0.92,cr*0.3,0,0,7); c.fill(); c.restore(); } }
      for(let v=0;v<3;v++){ const T0=880+v*160; atImpact(t,T0,0.3+v*0.1,v===2?0.2:0); const k=(t-T0)/240; if(k>=0&&k<1) for(let j=0;j<5;j++){ const a=j*1.26+v, r=R*(0.3+k*0.9); atStar4(c,tg.x-d*R*0.2+Math.cos(a)*r,tg.y-R*0.2+Math.sin(a)*r*0.8,R*0.16*(1-k),"#fff3b0"); } } }},
  /* Presto: it hops and flips, a puff of smoke bursts from its brim, a rabbit leaps out, bounds across and headbutts the target, then vanishes in smoke */
  rabbitout:{C:1000,D:2100,sig:true,
    atk:t=>{ if(t<480){ const k=t/480; return {arc:-30*Math.sin(k*Math.PI),rot:0.0,sx:1,sy:1+0.08*Math.sin(k*Math.PI),pose:"jump"}; }
      if(t<700){ const k=(t-480)/220; return {sx:1+0.2*Math.sin(k*Math.PI),sy:1-0.22*Math.sin(k*Math.PI),pose:"land"}; } return {pose:t<1500?"cast":"happy"}; },
    def(t){ if(t<1000||t>1750) return null; const a=1-eo((t-1000)/300), w=Math.sin((t-1000)/110); return {pose:"hurt",sx:1-0.15*a,sy:1+0.1*a,off:[20*a,0],rot:0.1*w*(1-a)}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), brim={x:s.x,y:s.top.y-s.r*0.1}, S=R/32;
      if(t<520){ for(let i=0;i<3;i++){ const ph=((t/300)+i/3)%1; atStar4(c,s.x+Math.cos(i*2.1+t/200)*s.r*0.9,s.y-s.r*0.4-ph*s.r*0.6,R*0.12*(1-ph),`rgba(255,240,170,${1-ph})`); } return; }
      atPuff(c,brim.x,brim.y,R*0.75,(t-500)/420);
      const land={x:tg.x-d*R*0.9,y:tg.y-R*0.1};
      if(t<640){ const k=(t-520)/120; atRabbit(c,brim.x,brim.y-R*0.3*k,S*(0.4+0.6*k),d,0,0.3*(1-k)); return; }
      if(t<1000){ const k=(t-640)/360, mid={x:(brim.x+land.x)/2,y:tg.foot-R*0.25}, hop=k<0.5?k*2:(k-0.5)*2, a=k<0.5?{x:brim.x,y:brim.y-R*0.3}:mid, b=k<0.5?mid:land, p=lerpP(a,b,hop,R*1.1);
        atRabbit(c,p.x,p.y,S,d,hop<0.1?0.4:0,0.5*Math.sin(hop*Math.PI)); return; }
      atImpact(t,1000,0.55,0.3);
      if(t<1380){ const k=(t-1000)/380, p={x:land.x+d*R*0.25-d*R*1.1*eo(k),y:land.y-R*0.7*Math.sin(Math.min(1,k*1.4)*Math.PI*0.9)}; atRabbit(c,p.x,p.y,S,d,k<0.2?0.6*(1-k*5):0,-0.3);
        if(k<0.6) atPow(c,{x:tg.x-d*R*0.3,y:tg.y-R*0.15},k/0.6,R/34); }
      else { const k=(t-1380)/420; atPuff(c,land.x-d*R*0.85,land.y-R*0.6,R*0.6,k); if(k<1) for(let i=0;i<4;i++) atStar4(c,land.x-d*R*0.85+Math.cos(i*1.6)*R*0.7*k,land.y-R*0.6+Math.sin(i*1.6)*R*0.5*k,R*0.14*(1-k),"#fff3b0"); }
      if(t>1100&&t<1800){ const k=(t-1100)/700; for(let i=0;i<3;i++){ const a=t/180+i*2.09; atStar4(c,tg.x+Math.cos(a)*R*0.7,tg.top.y-R*0.25+Math.sin(a)*R*0.2,R*0.13,`rgba(255,226,90,${1-k})`); } } }}
});
Object.assign(AR_KIND,{"Read Aloud":"readaloud","Gumball Rain":"gumballrain","Crown Spin":"crownspin","Pay Day":"payday","Rabbit Out":"rabbitout"});

/* ---------- batch 4 signatures, third group (16 Nov 2026) ---------- */
function atGlob(c,x,y,r,heat=1){ const g=c.createRadialGradient(x-r*0.2,y-r*0.2,0,x,y,r); g.addColorStop(0,`rgba(255,250,190,${heat})`); g.addColorStop(0.45,"rgba(255,170,40,1)"); g.addColorStop(1,"rgba(220,60,20,1)");
  c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); }
function atCorner(c,x,y,s,a,col){ c.save(); c.translate(x,y); c.rotate(a); c.fillStyle=col; c.fillRect(0,0,s,s*0.22); c.fillRect(0,0,s*0.22,s); c.restore(); }
Object.assign(ANIM,{
  /* Vroom: it revs up, opens a whirling funnel of air and drags the target in, bits of dust flying, until the target slams into its bumper */
  suction:{C:880,D:1900,sig:true,
    atk:t=>{ if(t<560){ const k=t/560; return {off:[Math.sin(t/12)*2.5*k,0],sx:1+0.05*k,sy:1-0.07*k,pose:"crouch"}; }
      return t<1300?{f:0.08,sx:1.04+0.02*Math.sin(t/20),sy:0.97,pose:"push"}:{pose:"idle"}; },
    def(t){ if(t<560||t>1250) return null; const k=Math.min(1,(t-560)/320); return t<880?{off:[-34*ei(k),0],rot:-0.1*k,pose:"hurt"}:{off:[-34+34*eo(Math.min(1,(t-880)/360)),0],sx:1-0.2*Math.max(0,1-(t-880)/200),pose:"hit"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), mouth={x:s.x+d*s.r*0.85,y:s.y-s.r*0.05};
      if(t<600){ const k=t/560; for(let i=0;i<4;i++){ const a=t/30+i*Math.PI/2; c.fillStyle=`rgba(200,205,215,${0.8*k})`; c.beginPath(); c.ellipse(s.x+Math.cos(a)*s.r*0.5,s.foot-3,s.r*0.12,s.r*0.05,a,0,7); c.fill(); }
        if(t>200) for(let i=0;i<3;i++){ const ph=((t/180)+i/3)%1; c.fillStyle=`rgba(225,220,205,${0.6*(1-ph)})`; c.beginPath(); c.arc(s.x-d*s.r*(0.7+ph*0.8),s.foot-4-ph*8,s.r*(0.12+ph*0.15),0,7); c.fill(); } return; }
      if(t>1300) return; const op=Math.min(1,(t-560)/120)*(t>1150?1-(t-1150)/150:1), far={x:tg.x+d*R*0.6,y:tg.y-R*0.1};
      c.save(); c.globalAlpha=op;
      c.fillStyle="rgba(210,235,255,.28)"; c.beginPath(); c.moveTo(mouth.x,mouth.y-s.r*0.25); c.lineTo(far.x,far.y-R*1.0); c.lineTo(far.x,far.y+R*0.9); c.lineTo(mouth.x,mouth.y+s.r*0.25); c.closePath(); c.fill();
      for(let i=0;i<5;i++){ const ph=1-(((t-560)/260+i/5)%1), px=mouth.x+(far.x-mouth.x)*ph, w=(s.r*0.25+(R*0.95-s.r*0.25)*ph); c.fillStyle=`rgba(240,250,255,${0.55*(1-Math.abs(ph-0.5)*1.6)})`; c.beginPath(); c.ellipse(px,mouth.y+(far.y-mouth.y)*ph,w*0.18,w,0,0,7); c.fill(); }
      for(let i=0;i<9;i++){ const ph=((t-560)/420+i*0.137)%1, k=ei(ph), a=i*2.1+t/120, rad=(1-k)*R*0.8, px=far.x+(mouth.x-far.x)*k+Math.cos(a)*rad*0.3, py=far.y+(mouth.y-far.y)*k+Math.sin(a)*rad;
        if(i%3===0){ c.fillStyle="#cfc6b4"; c.beginPath(); c.arc(px,py,R*0.09*(1-k*0.6),0,7); c.fill(); c.fillStyle="#e8e1d2"; c.beginPath(); c.arc(px-R*0.03,py-R*0.03,R*0.05*(1-k*0.6),0,7); c.fill(); }
        else atLeafBlade(c,px,py,R*0.22*(1-k*0.5),a,i%2?"#8fbf5a":"#d4a24a"); }
      c.restore(); atImpact(t,880,0.5,0.25); if(t>=870) atPow(c,{x:mouth.x+d*R*0.25,y:mouth.y},(t-870)/380,R/34); }},
  /* Shutter: viewfinder brackets close in on the target, then its lens fires a huge flash, the target is left seeing stars and a photo slides out */
  photoflash:{C:880,D:2100,sig:true,
    atk:t=>t<620?{sx:1+0.06*Math.sin(t/60),sy:1-0.04*Math.sin(t/60),f:-0.04*eo(t/620),pose:"cast"}:t<900?{sx:0.9,sy:1.1,pose:"cast"}:{sx:1+0.12*Math.max(0,1-(t-900)/200),sy:1-0.1*Math.max(0,1-(t-900)/200),pose:t<1500?"push":"happy"},
    def(t){ if(t<880||t>1800) return null; const w=Math.sin((t-880)/140); return {pose:"hurt",rot:0.08*w,flash:t<1000?3:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), lens={x:s.x+d*s.r*0.55,y:s.y-s.r*0.15};
      if(t<900){ const k=eo(Math.min(1,t/620)), gap=R*(2.2-1.0*k), cx=tg.x, cy=tg.y-R*0.15, col=`rgba(255,255,255,${0.95})`;
        atCorner(c,cx-gap,cy-gap*0.8,R*0.45,0,col); atCorner(c,cx+gap,cy-gap*0.8,R*0.45,Math.PI/2,col); atCorner(c,cx+gap,cy+gap*0.8,R*0.45,Math.PI,col); atCorner(c,cx-gap,cy+gap*0.8,R*0.45,-Math.PI/2,col);
        if(t>620){ const b=Math.floor(t/90)%2; c.fillStyle=b?"#ff4040":"#ffffff"; c.beginPath(); c.arc(cx+gap-R*0.15,cy-gap*0.8+R*0.15,R*0.09,0,7); c.fill(); }
        c.fillStyle=`rgba(255,250,210,${0.4+0.4*k})`; c.beginPath(); c.arc(lens.x,lens.y,s.r*0.12*(1+k),0,7); c.fill(); return; }
      atImpact(t,880,0.4,0.85);
      const k=(t-880)/500; if(k<1){ c.save(); c.globalCompositeOperation="lighter"; atWisp(c,lens.x,lens.y,R*(1.2+1.5*eo(k))*(1-k*0.5),[255,250,220]);
        c.fillStyle=`rgba(255,252,230,${0.7*(1-k)})`; for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, L=R*(1.5+2.5*eo(k)); c.beginPath(); c.moveTo(lens.x,lens.y); c.lineTo(lens.x+Math.cos(a-0.06)*L,lens.y+Math.sin(a-0.06)*L); c.lineTo(lens.x+Math.cos(a+0.06)*L,lens.y+Math.sin(a+0.06)*L); c.closePath(); c.fill(); } c.restore(); }
      if(t>950&&t<1850){ const q=(t-950)/900; for(let i=0;i<4;i++){ const a=t/160+i*Math.PI/2; atStar4(c,tg.x+Math.cos(a)*R*0.75,tg.top.y-R*0.1+Math.sin(a)*R*0.22,R*0.15,`rgba(255,240,120,${1-q*q})`); } }
      if(t>1000&&t<2050){ const q=(t-1000)/1050, out=Math.min(1,q*2.2), px=lens.x+d*R*0.2+Math.sin(q*9)*R*0.2*q, py=lens.y+R*0.1+out*R*0.2+Math.max(0,q-0.45)*R*1.2*0.9, rot=d*(0.2+Math.sin(q*7)*0.25*q);
        c.save(); c.globalAlpha=q>0.85?1-(q-0.85)/0.15:1; c.translate(px,py); c.rotate(rot); const W=R*0.62, H=R*0.72; c.fillStyle="#fbfbf6"; c.fillRect(-W/2,-H/2,W,H); c.strokeStyle="rgba(80,70,80,.5)"; c.lineWidth=1.5; c.strokeRect(-W/2,-H/2,W,H);
        const g=c.createLinearGradient(0,-H/2,0,H*0.2); g.addColorStop(0,atRgba(x.col,1)); g.addColorStop(1,atRgba(x.col.map(v=>v*0.6),1)); c.fillStyle=g; c.fillRect(-W*0.4,-H*0.4,W*0.8,W*0.8); c.restore(); } }},
  /* Yoyo: it winds up spinning, shoots out and swings round the target in three big loops, striking it at the bottom of each, then zips back */
  aroundworld:{C:600,D:1650,contact:true,marks:true,sig:true,
    atk:t=>{ const spin=Math.cos(t/26); if(t<420){ const k=t/420; return {sx:(0.4+0.6*Math.abs(spin))*(1+0.0*k),arc:-6*k,pose:"crouch"}; }
      if(t<600){ const k=eo((t-420)/180); return {f:0.95*k,arc:-10*Math.sin(k*Math.PI),sx:0.4+0.6*Math.abs(spin),pose:"jump"}; }
      if(t<1260){ const th=(t-600)/220*Math.PI*2; return {f:0.95+0.32*Math.sin(th),arc:-36+36*Math.cos(th)-4,sx:0.4+0.6*Math.abs(spin),pose:"hover"}; }
      const k=(t-1260)/390; return {f:0.95*(1-eio(k)),arc:-20*Math.sin(Math.min(1,k)*Math.PI),sx:k<0.9?0.4+0.6*Math.abs(spin):1,pose:k<0.9?"jump":"land"}; },
    def(t){ if(t<600||t>1300) return null; const p=((t-600)%220)/220; return {pose:"hit",off:[(1-p)*7,-(1-p)*4],rot:0.05*Math.sin(t/30)}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t>600&&t<1280){ c.save(); c.globalAlpha=0.35; c.strokeStyle=atRgba(x.col.map(v=>Math.min(255,v+60)),1); c.lineWidth=R*0.22; c.lineCap="round"; const th=(t-600)/220*Math.PI*2;
        c.beginPath(); c.arc(tg.x,tg.y-R*0.5,R*1.1,th-1.6,th-0.2); c.stroke(); c.restore(); }
      for(let h=0;h<3;h++){ const T0=600+h*220; atImpact(t,T0,0.3+h*0.12,h===2?0.25:0); const k=(t-T0)/260; if(k>=0&&k<1){ atStar4(c,tg.x-d*R*0.2,tg.y-R*0.1,R*(0.4+0.5*k)*(1-k),"rgba(255,255,255,1)");
        for(let j=0;j<5;j++){ const a=j*1.26+h, r=R*(0.3+k); c.fillStyle=atRgba(x.col.map(v=>Math.min(255,v+80)),1-k); c.beginPath(); c.arc(tg.x+Math.cos(a)*r,tg.y-R*0.1+Math.sin(a)*r*0.7,R*0.07*(1-k),0,7); c.fill(); } } } }},
  /* Lava: it swells and glows white-hot, a fountain of molten globs bursts from it and rains on the target, then the ground under the target erupts */
  eruption:{C:960,D:2200,sig:true,
    atk:t=>{ if(t<560){ const k=eo(t/560); return {sx:1+0.12*k,sy:1+0.1*k,off:[Math.sin(t/16)*2*k,0],pose:"effort",flash:t>300&&Math.floor(t/80)%2?3:0}; }
      if(t<760){ const k=(t-560)/200; return {sx:1.12-0.3*Math.sin(k*Math.PI),sy:1.1+0.35*Math.sin(k*Math.PI),pose:"cast"}; } return {sx:1,sy:1,pose:t<1500?"push":"idle"}; },
    def(t){ if(t<800||t>1700) return null; const a=t>960?1-eo(Math.min(1,(t-960)/300)):0.3; return {pose:"hurt",sy:1-0.15*a,sx:1+0.1*a,lift:t>960&&t<1200?-14*Math.sin((t-960)/240*Math.PI):0,off:[Math.sin(t/20)*2,0]}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, top={x:s.x,y:s.top.y}, out=t>1950?1-(t-1950)/250:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      if(t<620){ c.save(); c.globalCompositeOperation="lighter"; atWisp(c,s.x,s.y-s.r*0.1,s.r*(0.4+0.5*t/560),[255,140,40]); c.restore();
        for(let i=0;i<4;i++){ const ph=((t/260)+i/4)%1; c.fillStyle=`rgba(90,80,80,${0.5*(1-ph)})`; c.beginPath(); c.arc(top.x+(i-1.5)*s.r*0.2,top.y-ph*s.r*1.2,s.r*(0.1+ph*0.15),0,7); c.fill(); } }
      for(let i=0;i<9;i++){ const t0=560+i*30, k=(t-t0)/380; if(k<0||k>1) continue; const tx=tg.x+((i*37)%7-3)*R*0.22, p=lerpP(top,{x:tx,y:tg.y-R*0.3},k,R*2.8,0); atGlob(c,p.x,p.y,R*(0.16+(i%3)*0.04)); }
      if(t>=900){ const k=Math.min(1,(t-900)/700); for(let i=0;i<4;i++){ const px=tg.x+(i-1.5)*R*0.5; c.fillStyle=`rgba(230,80,20,${0.85*(1-k*0.5)})`; c.beginPath(); c.ellipse(px,tg.foot,R*0.3,R*0.09,0,0,7); c.fill(); c.fillStyle=`rgba(255,210,90,${0.8*(1-k)})`; c.beginPath(); c.ellipse(px,tg.foot-1,R*0.16,R*0.05,0,0,7); c.fill(); } }
      if(t>=880&&t<960){ const k=(t-880)/80; c.strokeStyle="#5a2a18"; c.lineWidth=3; c.beginPath(); for(let j=0;j<5;j++){ const a=Math.PI+j/4*Math.PI; c.moveTo(tg.x,tg.foot); c.lineTo(tg.x+Math.cos(a)*R*1.2*k,tg.foot+Math.abs(Math.sin(a))*R*0.15*k); } c.stroke(); }
      atImpact(t,960,0.7,0.3);
      if(t>=960&&t<1600){ const k=(t-960)/640, H=R*3.2*eo(Math.min(1,k*3))*(1-ei(Math.max(0,(k-0.6)/0.4))), W=R*(0.75-0.25*k);
        const g=c.createLinearGradient(0,tg.foot,0,tg.foot-H); g.addColorStop(0,"rgba(255,240,170,1)"); g.addColorStop(0.3,"rgba(255,160,40,1)"); g.addColorStop(1,"rgba(220,60,20,0.2)");
        c.fillStyle=g; c.beginPath(); c.moveTo(tg.x-W,tg.foot); c.quadraticCurveTo(tg.x-W*0.8,tg.foot-H*0.7,tg.x-W*0.3+Math.sin(t/40)*W*0.2,tg.foot-H); c.quadraticCurveTo(tg.x,tg.foot-H*1.08,tg.x+W*0.3+Math.sin(t/35)*W*0.2,tg.foot-H); c.quadraticCurveTo(tg.x+W*0.8,tg.foot-H*0.7,tg.x+W,tg.foot); c.closePath(); c.fill();
        for(let i=0;i<8;i++){ const a=-Math.PI*(0.15+0.7*i/7), r=R*(0.6+k*1.8); atGlob(c,tg.x+Math.cos(a)*r,tg.foot-H*0.8+Math.sin(a)*r*0.6+k*k*R*2,R*0.12*(1-k*0.5),1-k); } }
      c.restore(); }},
  /* Pogo: it bounces in place, higher each time, then springs into a huge leap, stomps down on the target and bounces back home */
  pogostomp:{C:900,D:1900,contact:true,marks:true,sig:true,
    atk:t=>{ if(t<560){ const ph=(t%280)/280, n=Math.floor(t/280), hgt=10+n*12; return ph<0.2?{sy:1-0.35*Math.sin(ph/0.2*Math.PI),sx:1+0.2*Math.sin(ph/0.2*Math.PI),pose:"crouch"}:{arc:-hgt*Math.sin((ph-0.2)/0.8*Math.PI),sy:1.08,sx:0.94,pose:"jump"}; }
      if(t<640){ const k=(t-560)/80; return {sy:1-0.4*Math.sin(k*Math.PI*0.5),sx:1+0.22*Math.sin(k*Math.PI*0.5),pose:"crouch"}; }
      if(t<900){ const k=(t-640)/260; return {f:0.92*eio(k),arc:-110*Math.sin(k*Math.PI)-(k>0.85?0:0),sy:1.18-0.1*k,sx:0.88,pose:"jump",rot:0}; }
      if(t<1050){ const k=(t-900)/150; return {f:0.92,sy:0.62+0.38*eo(k),sx:1.3-0.3*eo(k),pose:"land"}; }
      const k=(t-1050)/850, hop=Math.abs(Math.sin(k*Math.PI*2))*(1-k); return {f:0.92*(1-eio(Math.min(1,k*1.2))),arc:-45*hop,pose:k<0.9?"jump":"land",sx:1,sy:1}; },
    def(t){ if(t<900||t>1350) return null; const a=1-eo((t-900)/450); return {sy:1-0.5*a,sx:1+0.3*a,off:[0,4*a],pose:"hit"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r;
      for(const T0 of [56,336,600]){ const k=(t-T0)/300; if(k<0||k>1) continue; for(let i=0;i<4;i++){ const sd=i%2?1:-1; c.fillStyle=`rgba(235,224,200,${0.8*(1-k)})`; c.beginPath(); c.arc(s.x+sd*s.r*(0.4+k*0.7)+(i>1?sd*s.r*0.2:0),s.foot-3-k*6,s.r*(0.12+k*0.12),0,7); c.fill(); } }
      atImpact(t,900,0.8,0.3);
      if(t>=900&&t<1500){ const k=(t-900)/600; atPow(c,{x:tg.x,y:tg.top.y+R*0.1},k*1.3,R/30);
        c.strokeStyle=`rgba(255,255,255,${0.9*(1-k)})`; c.lineWidth=5*(1-k)+1; c.beginPath(); c.ellipse(tg.x,tg.foot,R*(0.6+k*1.8),R*(0.15+k*0.35),0,0,7); c.stroke();
        for(let i=0;i<8;i++){ const sd=i%2?1:-1, a=i*0.4; c.fillStyle=`rgba(235,224,200,${0.85*(1-k)})`; c.beginPath(); c.arc(tg.x+sd*R*(0.6+k*1.4+a*0.2),tg.foot-4-k*10-a*3,R*(0.14+k*0.12),0,7); c.fill(); }
        if(k<0.5){ c.strokeStyle="#6a4a30"; c.lineWidth=3; c.beginPath(); for(let j=0;j<6;j++){ const a=Math.PI+j/5*Math.PI; c.moveTo(tg.x,tg.foot); c.lineTo(tg.x+Math.cos(a)*R*1.3,tg.foot+Math.abs(Math.sin(a))*R*0.2); } c.stroke(); } } }}
});
Object.assign(AR_KIND,{Suction:"suction","Photo Flash":"photoflash","Around the World":"aroundworld",Eruption:"eruption","Pogo Stomp":"pogostomp"});

/* ---------- abilities: when one works, its name shows over the Snabit with its own colour, particles and sound ---------- */
const AT_ABIL={ "Sky High":{c:[255,236,170],k:"feather"}, Bloodsuck:{c:[230,50,70],k:"suck"}, Rebirth:{c:[255,170,60],k:"flame"}, Illusion:{c:[160,200,255],k:"wisp"},
  Coil:{c:[120,200,90],k:"ring"}, "Thick Fur":{c:[220,236,255],k:"snow"}, Bright:{c:[255,246,190],k:"shine"}, Counterpunch:{c:[255,160,80],k:"ring"}, Steady:{c:[200,170,130],k:"ring"},
  Wobble:{c:[74,146,240],k:"ring"}, "Big Bite":{c:[230,120,70],k:"ring"}, "Keen Eye":{c:[255,246,190],k:"shine"}, Shell:{c:[170,118,66],k:"ring"}, "Long Stride":{c:[255,224,60],k:"ring"},
  Web:{c:[164,92,232],k:"ring"}, Slippery:{c:[140,86,190],k:"ring"}, Hothead:{c:[255,112,40],k:"flame"}, "Static Skin":{c:[255,224,60],k:"ring"}, "Lightning Rod":{c:[255,224,60],k:"shine"},
  Sunbather:{c:[255,214,120],k:"shine"}, Bloom:{c:[96,180,72],k:"ring"}, Insulated:{c:[150,222,255],k:"snow"}, Defiant:{c:[230,90,60],k:"ring"}, "Last Stand":{c:[230,90,60],k:"flame"},
  "Toxic Touch":{c:[164,92,232],k:"ring"}, Beguile:{c:[255,132,192],k:"ring"}, "Mirror Mind":{c:[255,132,192],k:"shine"}, Bedrock:{c:[170,118,66],k:"ring"}, Unbreakable:{c:[170,118,66],k:"ring"},
  Halo:{c:[255,246,190],k:"shine"}, Sanctuary:{c:[255,246,190],k:"shine"}, Reflect:{c:[200,210,225],k:"shine"}, Haunt:{c:[140,86,190],k:"ring"}, "Life seed":{c:[120,210,110],k:"ring"},
  Wildfire:{c:[255,112,40],k:"flame"}, Volatile:{c:[164,92,232],k:"ring"}, Permafrost:{c:[150,222,255],k:"snow"}, Corrosion:{c:[164,92,232],k:"ring"}, Plated:{c:[200,210,225],k:"ring"}, Undertow:{c:[74,146,240],k:"ring"},
  Gust:{c:[170,230,160],k:"feather"}, "Trick Leaf":{c:[110,190,80],k:"ring"}, Siren:{c:[240,140,190],k:"shine"}, Blessing:{c:[255,190,220],k:"shine"}, Riddle:{c:[240,200,80],k:"ring"},
  "Sky King":{c:[255,214,90],k:"feather"}, "Full Moon":{c:[250,246,220],k:"shine"}, Headlong:{c:[200,150,100],k:"ring"}, "Dragon Scale":{c:[110,190,90],k:"ring"}, Stormborn:{c:[255,224,60],k:"ring"},
  Regrowth:{c:[120,200,90],k:"shine"}, "Long Sight":{c:[255,180,90],k:"feather"}, "Pure Step":{c:[150,230,230],k:"shine"}, "Heat Up":{c:[255,140,50],k:"ring"}, "Moon Eater":{c:[230,236,255],k:"ring"},
  "Three Bites":{c:[220,70,60],k:"ring"}, "Three Wishes":{c:[255,214,90],k:"shine"}, "Hard Hide":{c:[120,170,90],k:"ring"}, Undying:{c:[240,232,210],k:"shine"}, "Good Omen":{c:[255,120,90],k:"feather"},
  Dreamer:{c:[120,200,140],k:"ring"}, "Yellow Sign":{c:[240,210,70],k:"ring"}, Mimic:{c:[150,150,170],k:"shine"}, "Deep Song":{c:[90,200,210],k:"ring"}, "Brain Jar":{c:[240,150,190],k:"shine"},
  Tickle:{c:[170,120,230],k:"feather"}, Gnaw:{c:[200,190,170],k:"ring"}, Mountain:{c:[200,140,170],k:"ring"}, "All Doors":{c:[170,110,240],k:"shine"}, "Thousand Young":{c:[120,160,90],k:"shine"} };
function atAbility(e,now){ const A=AT_ABIL[e.name]||{c:[255,214,90],k:"ring"}, P=atP(e.i);
  AT.fx.push({i:e.i,t0:now,txt:e.name,col:atRgba(A.c,1),size:15,lift:44});
  if(P){ atPart({k:"ring",x:P.cx,y:P.foot,life:520,s:P.r*2.4,c:A.c}); atPart({k:"ring",x:P.cx,y:P.foot,life:700,s:P.r*3.2,c:A.c,t0:AT.te+90});
    for(let k=0;k<10;k++){ const a=k/10*Math.PI*2, v=0.05+atH(k+AT.te)*0.06;
      if(A.k==="flame") atPart({k:"el",el:"Blaze",x:P.cx+Math.cos(a)*P.r*0.6,y:P.foot-4,vx:Math.cos(a)*0.02,vy:-0.09-v,life:700,s:3,seed:k});
      else if(A.k==="snow"||A.k==="feather"||A.k==="shine") atPart({k:"el",el:A.k==="snow"?"Frost":"Light",x:P.cx+Math.cos(a)*P.r*0.5,y:P.top+10,vx:Math.cos(a)*v,vy:0.03,life:800,s:2.6,seed:k});
      else atPart({k:"spark",x:P.cx,y:P.cy,vx:Math.cos(a)*v*1.6,vy:Math.sin(a)*v*1.6,life:420,c:A.c}); } }
  atSfx("ab:"+e.name); }
