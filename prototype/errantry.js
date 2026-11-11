/* Trips you watch, the way Monster Rancher 2 shows errantry: the monster arrives in the region, and each stop or week
   plays out on screen. It tries a task, and you see it succeed or fail before it moves on. Used by missions and skill trips.
   Needs ranch.js and heavy.js. */
const REGION_ART={
  Blaze:{sky:["#6b2a2a","#a8452f","#e2814a"],far:"#4a2420",mid:"#6e3326",ground:"#5b4033",top:"#8a5a3c",deco:"volcano"},
  Brawl:{sky:["#7fb3d9","#a9cde6","#d6e8f2"],far:"#7d8f6a",mid:"#5f7a48",ground:"#b58a5a",top:"#d1a56d",deco:"dojo"},
  Spark:{sky:["#3b4a7a","#5d6fa3","#8ea0c8"],far:"#4c5a6e",mid:"#9aa36a",ground:"#b8b06a",top:"#d8cf86",deco:"pylons"},
  Wild:{sky:["#7fc3e8","#a6d8ef","#d0ecf6"],far:"#2f6b3a",mid:"#3f8a44",ground:"#4f8a3a",top:"#6cab48",deco:"forest"},
  Frost:{sky:["#a9c8e6","#c6dcef","#e4eff8"],far:"#9cb6cf",mid:"#d4e3ef",ground:"#e8f1f8",top:"#ffffff",deco:"ice"},
  Tide:{sky:["#5ab4e0","#86cbea","#bfe3f3"],far:"#2f7fb3",mid:"#3a9bc9",ground:"#e3d39a",top:"#f1e5b6",deco:"sea"},
  Venom:{sky:["#4a4a5e","#5e5a6e","#7a6f80"],far:"#3c4a3a",mid:"#4f5e3c",ground:"#4a4a32",top:"#6a7040",deco:"marsh"},
  Charm:{sky:["#f2b6d2","#f6cde0","#fbe4ef"],far:"#c98fb8",mid:"#9fcf8a",ground:"#8cc47a",top:"#acdc96",deco:"garden"},
  Stone:{sky:["#9fb6c8","#b9cbd8","#d3dee6"],far:"#8d8378",mid:"#a99d8f",ground:"#9c907f",top:"#b8ab97",deco:"cliffs"},
  Light:{sky:["#ffd98a","#ffe8b0","#fff5dc"],far:"#e8d6a8",mid:"#d9c48c",ground:"#e9dcb5",top:"#f6eed2",deco:"temple"},
  Steel:{sky:["#6f7a86","#8a949e","#a9b1b8"],far:"#4c535c",mid:"#5f666e",ground:"#55595e",top:"#7a7f85",deco:"factory"},
  Shade:{sky:["#141a33","#222a4a","#343c63"],far:"#1c2238",mid:"#2c3350",ground:"#2f3a2c",top:"#45523e",deco:"moor"},
  Void:{sky:["#120a24","#22113e","#3a1d5e"],far:"#2a1646",mid:"#3d2066",ground:"#2b1b40",top:"#5b3a8a",deco:"rift"},
};
function drawRegion(c,t,elName){
  const A=REGION_ART[elName]||REGION_ART.Wild, s=RS;
  for(let i=0;i<3;i++){ c.fillStyle=A.sky[i]; c.fillRect(0,i*30,RW,i===2?100:30); }
  const off=s.bgOff||0;
  // far layer
  c.fillStyle=A.far; for(let x=0;x<RW;x++){ const y=Math.round(78+Math.sin((x+off*0.2)/31)*10+Math.sin((x+off*0.2)/11)*4); c.fillRect(x,y,1,GROUND-y); }
  // signature shapes
  const D=A.deco;
  if(D==="volcano"){ c.fillStyle="#3a1c18"; for(let y=40;y<100;y++){ const w=(y-40)*1.2; c.fillRect(Math.round(60-w),y,Math.round(w*2),1);} c.fillStyle="#ff8a3d"; c.fillRect(56,40,8,3); for(let i=0;i<5;i++){ const yy=40-((t/20+i*9)%30); c.fillStyle="rgba(120,110,110,.7)"; c.fillRect(56+((i*3)%7),Math.round(yy),4,3);} }
  if(D==="dojo"){ c.fillStyle="#7b3b2a"; c.fillRect(150,58,70,6); c.fillRect(156,52,58,6); c.fillStyle="#efe3c8"; c.fillRect(160,64,50,34); c.fillStyle="#5a2a1e"; c.fillRect(181,74,8,24); }
  if(D==="pylons"){ c.fillStyle="#2b3242"; for(const x of [40,130,210]){ c.fillRect(x,40,2,60); c.fillRect(x-6,44,14,2); } c.fillStyle="#2b3242"; for(let x=40;x<210;x++) c.fillRect(x,46+Math.round(Math.sin((x-40)/40*Math.PI)*4),1,1);
    if((t/400|0)%5===0){ c.fillStyle="#ffe14d"; c.fillRect(90+((t/40|0)%60),30,2,10); } }
  if(D==="forest"){ for(let i=0;i<9;i++){ const x=(i*29+7)%RW; c.fillStyle="#5e3b23"; c.fillRect(x+6,88,4,30); c.fillStyle=i%2?"#2f7a3a":"#3b8f44"; for(let j=0;j<18;j++){ const w=Math.round(10-Math.abs(j-9)); c.fillRect(x+8-w,70+j,w*2,1);} } }
  if(D==="ice"){ c.fillStyle="#ffffff"; for(const [x,h] of [[30,50],[90,34],[170,58],[215,40]]){ for(let j=0;j<h;j++){ const w=Math.round(j*0.5); c.fillRect(x-w,100-h+j,w*2,1);} } c.fillStyle="#cfe7ff"; for(let i=0;i<14;i++) c.fillRect((i*37+t/30)%RW,(i*13+t/12)%110,1,1); }
  if(D==="sea"){ c.fillStyle="#2f8fc4"; c.fillRect(0,96,RW,26); c.fillStyle="#bfe9ff"; for(let x=(t/25)%14;x<RW;x+=14) c.fillRect(Math.round(x),100+((x/14|0)%3)*7,6,1); }
  if(D==="marsh"){ c.fillStyle="#3f5a3a"; c.fillRect(0,108,RW,10); c.fillStyle="#7a8f4a"; for(let i=0;i<10;i++){ c.fillRect((i*23)%RW,100,2,12); c.fillRect((i*23)%RW+1,98,1,3);} c.fillStyle="rgba(170,220,120,.35)"; for(let i=0;i<6;i++) c.fillRect((i*41+t/40)%RW,90+(i*7)%20,3,3); }
  if(D==="garden"){ for(let i=0;i<22;i++){ const x=(i*11+3)%RW, y=104+(i*7)%12; c.fillStyle=["#ff7aa2","#ffd166","#c9a7f2","#ffffff"][i%4]; c.fillRect(x,y,3,3); c.fillStyle="#3f8a44"; c.fillRect(x+1,y+3,1,4);} }
  if(D==="cliffs"){ c.fillStyle="#7d7368"; for(let x=0;x<RW;x++){ const y=Math.round(60+Math.abs(Math.sin(x/21))*30); c.fillRect(x,y,1,GROUND-y);} c.fillStyle="#a99d8f"; for(let i=0;i<10;i++) c.fillRect((i*31)%RW,80+(i*17)%30,9,3); }
  if(D==="temple"){ c.fillStyle="#f6eed2"; for(const x of [120,150,180,210]){ c.fillRect(x,58,8,46);} c.fillRect(112,52,112,6); c.fillStyle="#e2c46a"; c.fillRect(160,40,16,12); c.fillStyle="rgba(255,240,180,.25)"; c.fillRect(0,0,RW,100); }
  if(D==="factory"){ c.fillStyle="#3e444b"; c.fillRect(30,56,60,46); c.fillRect(50,30,8,30); c.fillRect(70,38,8,22); c.fillStyle="#ffb347"; for(let y=62;y<96;y+=10) for(let x=36;x<86;x+=12) c.fillRect(x,y,6,4);
    for(let i=0;i<4;i++){ c.fillStyle="rgba(200,200,200,.5)"; c.fillRect(52+(i%2)*20,Math.round(28-((t/30+i*7)%24)),5,4);} }
  if(D==="moor"){ c.fillStyle="#f4f1d0"; c.fillRect(190,20,9,9); c.fillStyle="#141a33"; c.fillRect(193,19,8,8); c.fillStyle="rgba(180,190,220,.18)"; for(let i=0;i<5;i++) c.fillRect((i*60+t/25)%(RW+40)-40,96+(i%3)*6,46,4); }
  if(D==="rift"){ for(let i=0;i<12;i++){ const x=(i*43)%RW, y=20+(i*29)%70+Math.sin(t/500+i)*4; c.fillStyle=i%2?"#b38cff":"#6be4ff"; c.fillRect(Math.round(x),Math.round(y),3,6);} c.fillStyle="#000"; c.fillRect(150,40,4,60); c.fillStyle="#d9b8ff"; c.fillRect(151,40,1,60); }
  // ground
  c.fillStyle=A.mid; c.fillRect(0,GROUND-22,RW,8);
  c.fillStyle=A.top; c.fillRect(0,GROUND-14,RW,4); c.fillStyle=A.ground; c.fillRect(0,GROUND-10,RW,RH);
}

/* Props for trip tasks. */
function drawProp3(c,p,t,front){
  const X=Math.round(p.x), Y=Math.round(p.y);
  if(p.k==="bush"){ if(front) return true; const sh=p.shake?Math.round(Math.sin(t/40)*1.5):0; for(let j=0;j<24;j++){ const w=Math.round(Math.sqrt(144-(j-12)*(j-12))*1.5); c.fillStyle=j<8?"#3f8a44":"#2f6b3a"; c.fillRect(X-w+sh,Y-24+j,w*2,1);} c.fillStyle="#d9425a"; if(!p.picked){ c.fillRect(X-7+sh,Y-17,3,3); c.fillRect(X+5+sh,Y-12,3,3); c.fillRect(X-1+sh,Y-8,3,3);} return true; }
  if(p.k==="ledge"){ if(front) return true; c.fillStyle="#7f7a73"; c.fillRect(X,Y-p.h,60,p.h); c.fillStyle="#a8a29a"; c.fillRect(X,Y-p.h,60,3); c.fillStyle="#6a655f"; for(let k=0;k<4;k++) c.fillRect(X+8+k*13,Y-p.h+8+(k%2)*9,6,2); return true; }
  if(p.k==="stream"){ if(front) return true; c.fillStyle="#3a9bc9"; c.fillRect(X,Y-3,70,10); c.fillStyle="#bfe9ff"; for(let x=X+(t/30)%10;x<X+70;x+=10) c.fillRect(Math.round(x),Y,4,1); c.fillStyle="#8d8378"; for(const k of [12,34,56]) c.fillRect(X+k-4,Y-3,9,3); return true; }
  if(p.k==="tracks"){ if(front) return true; c.fillStyle="rgba(40,30,20,.55)"; for(let k=0;k<7;k++) c.fillRect(X+k*16,Y+2+(k%2)*3,3,2); return true; }
  if(p.k==="crate"){ if(front) return true; c.fillStyle="#b07a45"; c.fillRect(X-14,Y-26,28,26); c.fillStyle="#7a5230"; c.fillRect(X-14,Y-26,28,3); c.fillRect(X-14,Y-14,28,2); c.fillRect(X-2,Y-26,4,26); return true; }
  if(p.k==="fire"){ if(front) return true; c.fillStyle="#5e3b23"; c.fillRect(X-7,Y-2,14,2); const f=(t/90|0)%2; c.fillStyle="#ff8a3d"; c.fillRect(X-3,Y-8-f,6,6+f); c.fillStyle="#ffe14d"; c.fillRect(X-1,Y-6,2,4); return true; }
  if(p.k==="post"){ if(front) return true; c.fillStyle="#8a5532"; c.fillRect(X-3,Y-30,6,30); c.fillStyle="#c9a66b"; c.fillRect(X-6,Y-26,12,4); c.fillRect(X-6,Y-16,12,4); return true; }
  if(p.k==="foe"){ if(!front) return true; if(!p.cv){ p.cv=document.createElement("canvas"); paint(p.cv,p.grid,p.pal,2); }
    c.globalAlpha=p.fade==null?1:p.fade; c.save(); c.translate(X*2,0); c.scale(-1,1); c.drawImage(p.cv,X-20,GROUND-40+(p.jy||0)); c.restore(); c.globalAlpha=1; return true; }
  if(p.k==="item"){ if(!front) return true; c.fillStyle="#ffd23f"; c.fillRect(X-3,Y-3,6,6); c.fillStyle="#fff"; c.fillRect(X-2,Y-2,2,2); return true; }
  return false;
}

/* How likely a task is to work: the task's stat against the monster's own average, so its strengths show. */
function taskChance(s,stat,lvGap=0){
  const f=playerFighter(s), b=f.base, v=[f.maxhp/2,b.pow,b.grd,b.mnd,b.spr,b.spd], avg=v.reduce((x,y)=>x+y,0)/6;
  return clamp(0.62+(v[stat]/avg-1)*0.9-lvGap*0.04+(hearts()-2)*0.03-(s.fatigue>60?0.12:0),0.12,0.93);
}
const TASKS={
  forage:{name:"Forage",stat:3},climb:{name:"Climb",stat:1},river:{name:"Cross the stream",stat:5},tracks:{name:"Follow tracks",stat:4},
  haul:{name:"Haul a load",stat:2},fight:{name:"Wild monster",stat:-1},rest:{name:"Rest stop",stat:-1},drill:{name:"Train",stat:-1},
};

/* Plays one task. ok is decided before; the scene shows it. */
async function playTask(k,ok,extra={}){
  const s=RS; s.props=s.props.filter(p=>p.k==="bowl"); s.x=40; s.hidden=false; s.pose="walk";
  if(k==="forage"){ const b=prop({k:"bush",x:175,y:GROUND}); await walkTo(140,40); s.pose="effort"; b.shake=true; await rwait(900); b.shake=false;
    if(ok){ b.picked=true; const it=prop({k:"item",x:160,y:GROUND-16}); s.pose="happy"; await hop(10,300); await rwait(300); unprop(it); }
    else { spark(160,GROUND-14,"leaf",5); s.pose="sad"; await rwait(700); } }
  if(k==="climb"){ prop({k:"ledge",x:150,y:GROUND,h:24}); await walkTo(130,45); s.pose="effort"; await rwait(400);
    if(ok){ await hop(40,520); s.jy=24; s.x=170; s.pose="happy"; await rwait(600); s.jy=0; }
    else { await hop(18,380); spark(s.x,GROUND-2,"dust",6); s.pose="hurt"; s.shake=6; await rwait(700); } }
  if(k==="river"){ prop({k:"stream",x:110,y:GROUND-2}); await walkTo(104,45); s.pose="walk";
    if(ok){ for(const x of [122,144,166]){ await hop(12,260); s.x=x; } await hop(10,240); s.x=196; s.pose="happy"; await rwait(400); }
    else { await hop(12,260); s.x=122; await hop(8,220); s.x=140; spark(140,GROUND-4,"drip",8); s.pose="dizzy"; await rwait(500); await walkTo(96,30,"walk"); s.pose="tired"; await rwait(400); } }
  if(k==="tracks"){ prop({k:"tracks",x:60,y:GROUND-6}); s.pose="walk"; await walkTo(ok?200:120,30,"walk");
    if(ok){ spark(s.x,headY()-6,"star",2); s.pose="happy"; await rwait(600); } else { spark(s.x,headY()-6,"q"); s.pose="idle"; await rwait(800); } }
  if(k==="haul"){ const cr=prop({k:"crate",x:160,y:GROUND}); await walkTo(128,40); s.pose="effort";
    if(ok){ for(let i=0;i<30;i++){ cr.x+=1.2; s.x+=1.2; await rwait(30); } s.pose="happy"; await rwait(400); }
    else { for(let i=0;i<3;i++){ s.bx=-1; await rwait(160); s.bx=0; await rwait(160);} spark(s.x,headY()-4,"sweat",3); s.pose="tired"; await rwait(500); } }
  if(k==="rest"){ prop({k:"fire",x:120,y:GROUND}); await walkTo(100,40); s.pose="sleep"; for(let i=0;i<3;i++){ spark(s.x+6,headY(),"z"); await rwait(400);} s.pose="idle"; }
  if(k==="drill"){ prop({k:"post",x:150,y:GROUND}); await walkTo(132,40);
    for(let i=0;i<3;i++){ s.pose="effort"; s.bx=2; spark(146,GROUND-20,"dust",2); await rwait(220); s.bx=0; s.pose="idle"; await rwait(160); }
    s.pose=ok?"happy":"tired"; if(ok) spark(s.x,headY()-6,"sparkle",6); await rwait(500); }
  if(k==="fight"){ const o=extra.foe, fp=prop({k:"foe",x:196,y:GROUND,grid:o.fm.grid,pal:o.fm.pal,fm:o.fm}); await walkTo(118,45);
    for(let i=0;i<3;i++){ s.bx=3; fp.x-=4; spark(156,GROUND-22,"star",2); await rwait(200); s.bx=0; fp.x+=4; await rwait(220); }
    if(ok){ for(let a=1;a>=0;a-=0.1){ fp.fade=a; await rwait(40);} s.pose="happy"; await hop(10,300); }
    else { s.pose="hurt"; s.x-=10; s.shake=6; await rwait(700); s.pose="tired"; }
    unprop(fp); }
  s.bx=0; s.jy=0;
}

/* A trip header and result shown on the scene. */
async function stageCard(title,sub){ banner(title,"#fff"); if(sub) say(sub); await rwait(900); banner(""); }
async function stageResult(ok,line){ banner(ok?"Success":"Failed",ok?"#7dff9a":"#ff8a8a"); say(line); await rwait(1300); banner(""); }
