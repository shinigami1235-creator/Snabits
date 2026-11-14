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
  if(e.t==="status"){ S.stOn={name,t0:te}; S.frz=null; say(e.i,name,{col:atRgba(D.c,1),size:17,lift:12}); atSfx("status",D.el); if(P) atBurstEl(P,D.el,14,2.6);
    if(name==="Freeze"&&P) atShards(P.cx,P.cy,[200,240,255],6,false); }
  if(e.t==="cure"){ S.stOff={name,t0:te,why:e.why}; S.frz=null;
    if(e.why==="shatter"&&P){ atShards(P.cx,P.cy,[190,235,255],16,true); atSfx("shatter"); say(e.i,"Shattered",{col:"#bfeaff",size:14,lift:30}); AT.trauma=Math.min(1,AT.trauma+0.25); }
    else if(name==="Freeze"&&P){ for(let k=0;k<8;k++) atPart({k:"drop",x:P.cx+(atH(k)-0.5)*P.r*1.6,y:P.cy+(atH(k+3)-0.5)*P.H*0.5,vy:0.05,g:0.0007,life:900,s:4,c:[160,215,255],floor:P.foot}); }
    else if(e.why==="cleanse"&&P){ for(let k=0;k<10;k++) atPart({k:"plus",x:P.cx+(atH(k)-0.5)*P.r*2,y:P.cy+(atH(k+4)-0.5)*P.H*0.6,vy:-0.05,life:700,s:5,c:[255,255,255]}); say(e.i,"Cured",{col:"#ffffff",size:14,lift:20}); }
    else if(P&&D){ for(let k=0;k<6;k++) atPart({k:"smoke",x:P.cx+(atH(k)-0.5)*P.r,y:P.cy,vy:-0.04,life:600,s:9,c:D.c}); } }
  if(e.t==="tick"){ S.tickAt=te; S.tickName=name; say(e.i,String(e.dmg),{col:atRgba(D.c,1),size:15,side:1}); atSfx("tick",D.el); }
  if(e.t==="jolt"){ S.joltAt=te; if(typeof elSfx==="function") try{ elSfx("Spark","hit"); }catch(err){} if(P) for(let k=0;k<8;k++){ const a=k*0.8; atPart({k:"spark",x:P.cx,y:P.cy,vx:Math.cos(a)*0.25,vy:Math.sin(a)*0.25,life:260,c:[255,240,120]}); } }
  if(e.t==="heal"){ const fromP=e.from!=null?atP(e.from):null, delay=fromP?480:0;
    if(fromP) AT.streams.push({from:e.from,to:e.i,t0:te,d:520,col:e.src==="leech"?[120,220,90]:[255,110,120],n:e.src==="leech"?5:9});
    if(e.amt>0){ AT.fx.push({i:e.i,t0:now+delay,txt:"+"+e.amt,col:"#7dffa0",size:e.src==="regen"?15:20,side:e.src==="regen"?1:0,lift:4}); S.healAt=te+delay; S.healA=e.src==="regen"?0.16:0.4; if(!fromP||e.src!=="leech") setTimeout(()=>atSfx("heal"),delay); }
    if(P&&e.src!=="leech") for(let k=0;k<(e.src==="regen"?3:10);k++) atPart({k:k%3?"el":"plus",el:"Light",x:P.cx+(atH(k+te)-0.5)*P.r*1.8,y:P.foot-10-atH(k*3+te)*P.H*0.5,vy:-0.06-atH(k)*0.04,life:900,s:k%3?2:6,c:[150,255,160],seed:k,t0:te+delay}); }
  if(e.t==="block"){ const D2=AT.side[1-e.i]; D2.blockAt=te; const Q=atP(1-e.i); if(Q) atShards(Q.cx+(D2.dir||1)*Q.r*0.8,Q.cy,[150,210,255],12,false);
    atSfx("shatter"); say(1-e.i,"Blocked",{col:"#9fd8ff",size:17}); AT.trauma=Math.min(1,AT.trauma+0.2); }
  if(e.t==="mirror"){ S.mirrorAt=te; say(e.i,"Reflected",{col:"#ffc8f0",size:16}); atSfx("shield"); }
  if(e.t==="counter"){ say(e.i,"Counter",{col:"#ffb35c",size:14,lift:26}); say(1-e.i,String(e.dmg),{col:"#ffb35c",size:19}); AT.side[1-e.i].react={kind:"hit",t0:te+60,tier:"medium"}; AT.trauma=Math.min(1,AT.trauma+0.3); try{ sfx("hit"); }catch(err){} }
  if(e.t==="endure"){ say(e.i,"Endured",{col:"#ffd75a",size:18,lift:24}); AT.flash={t0:now,a:0.35}; }
  if(e.t==="recoil"){ say(e.i,String(e.dmg),{col:"#ffb070",size:15,side:1}); S.recoilAt=te; }
  if(e.t==="steal"){ const o=1-e.i; say(o,`Focus −${e.amt}`,{col:"#8fd3ff",size:13,lift:10}); AT.streams.push({from:o,to:e.i,t0:te,d:480,col:[120,190,255],n:6}); }
  if(e.t==="stage"&&!e.end){ if(e.n===0){ say(e.i,"No effect",{col:"#c9cbd6",size:12,lift:16}); return; }
    const up=e.n>0; say(e.i,`${AT_STAT_SHORT[e.k]} ${up?"▲":"▼"}${Math.abs(e.n)>1?Math.abs(e.n):""}`,{col:up?"#ff9a70":"#8fb8ff",size:14,lift:16}); atSfx(up?"up":"down");
    if(P) for(let k=0;k<6;k++) atPart({k:"arrow",x:P.cx-P.r*0.8+k*P.r*0.32,y:up?P.foot-10:P.top+10,vy:up?-0.09:0.09,life:800,s:7,c:up?[255,110,80]:[90,150,255],down:!up,t0:te+k*40}); }
  if(e.t==="sleep") say(e.i,"Asleep",{col:"#cfe0ff",size:14,lift:16});
  if(e.t==="wake") say(e.i,"Woke up",{col:"#cfe0ff",size:13,lift:30});
  if(e.t==="taunt") say(e.i,"Taunted",{col:"#ff8a7a",size:15,lift:16});
  if(e.t==="erase"){ say(e.i,"Buffs gone",{col:"#c7a6ff",size:14,lift:16}); if(P) for(let k=0;k<10;k++) atPart({k:"smoke",x:P.cx+(atH(k)-0.5)*P.r*2,y:P.cy+(atH(k+2)-0.5)*P.H*0.5,vy:-0.03,life:700,s:10,c:[150,110,210]}); }
  if(e.t==="daze") say(e.i,"Dazed",{col:"#ff9ccc",size:15,lift:30});
  if(e.t==="buff"&&(e.m.protect||e.m.buff==="bubble"||e.m.buff==="bunker")) atSfx("shield");
}
/* a move that will miss: the target starts getting out of the way just before it arrives. How depends on what's coming:
   a bite or a punch up close gets ducked or hopped back from, a shot gets jumped over or leaned away from, something from above gets
   sidestepped, and a phased Snabit lets it pass straight through */
function atPlanDodge(i,at,kind,why){
  const S=AT.side[1-i], r=atH(at), contact=/^(tackle|bite|punch|claw|shadowstrike|shadowclaw|stomp|fly)$/.test(kind);
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
function atBody(c,i,spec,P,te,look){
  const T=atTintOf(i,te);
  if(!T){ CHIBI.draw(c,spec,P,te,look); return; }
  const cv=c.canvas, off=AT.off||(AT.off=document.createElement("canvas"));
  if(off.width!==cv.width||off.height!==cv.height){ off.width=cv.width; off.height=cv.height; }
  const o=off.getContext("2d"), M=c.getTransform(), pts=[[-70,-140],[270,-140],[-70,225],[270,225]].map(([x,y])=>M.transformPoint({x,y}));
  const bx=Math.max(0,Math.floor(Math.min(...pts.map(q=>q.x)))), by=Math.max(0,Math.floor(Math.min(...pts.map(q=>q.y)))),
    bx2=Math.min(cv.width,Math.ceil(Math.max(...pts.map(q=>q.x)))), by2=Math.min(cv.height,Math.ceil(Math.max(...pts.map(q=>q.y))));
  if(bx2<=bx||by2<=by){ CHIBI.draw(c,spec,P,te,look); return; }
  o.setTransform(1,0,0,1,0,0); o.globalCompositeOperation="source-over"; o.globalAlpha=1; o.clearRect(bx,by,bx2-bx,by2-by);
  o.setTransform(M); CHIBI.draw(o,spec,P,te,look);
  o.globalCompositeOperation="source-atop";
  if(T.deco&&AT_DECO[T.deco]){ o.save(); AT_DECO[T.deco](o,Math.min(200,CHIBI.height(spec.stage,spec.marks,spec.family))); o.restore(); }
  if(T.col&&T.a>0){ o.setTransform(1,0,0,1,0,0); o.fillStyle=atRgba(T.col,Math.min(0.85,T.a)); o.fillRect(bx,by,bx2-bx,by2-by); }
  o.globalCompositeOperation="source-over";
  c.save(); c.setTransform(1,0,0,1,0,0); c.drawImage(off,bx,by,bx2-bx,by2-by,bx,by,bx2-bx,by2-by); c.restore();
}
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
function atFxBack(c,i,Q,te){
  const p=AT.ar.p[i], n=p.st&&p.st.name, {x,foot,H,r}=Q;
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
