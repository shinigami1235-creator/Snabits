/* Snabits ranch prototype. The monster lives in a 2D yard and every animation is cut from its label grid as puppet parts.
   Needs monster.js. Light drills, meals, snacks, care, rest, weekly events and the Byte evolution are in; heavy drills and trips aren't yet. */
const RW=240, RH=180, GROUND=150, BOWLX=64, HELPX=52;
const RANK_PTS={S:8,A:6,B:5,C:4,D:3,E:2};
const rankOf=b=>b>=70?"S":b>=60?"A":b>=55?"B":b>=45?"C":b>=40?"D":"E";
const DRILLS=["Laps","Boulder push","Brace","Puzzle box","Meditate","Dodgeball"];
const HEAVY_DRILLS=["Marathon","Quarry","Fortress","Library","Shrine","Obstacle course"];
const DRILL_MESS=["mud","dust","dust",null,null,"mud"];
// name, bits, stress, spoil, fear, weight, bowl colour
const MEALS=[["Rice ball",10,3,-3,0,0,"#f4f1e6"],["Milk",30,-2,1,0,2,"#ffffff"],["Fish",60,-4,2,0,3,"#8fb7d9"],["Jelly",80,-5,1,0,-5,"#e86aa8"],["Meat",150,-6,4,0,8,"#a5432f"],["Vitamin pack",250,-13,1,2,3,"#f2c94c"]];
const SNACKS={
  "Cool leaf":{c:"#5fc46a",say:"It munches the leaf and loosens up.",fx:s=>{s.stress=Math.round(s.stress/2);s.spoil-=2;},react:"calm"},
  "Energy nut":{c:"#c08a4a",say:"It's bouncing off the walls.",fx:s=>{s.fatigue-=25;s.spoil+=1;s.fear+=1;},react:"bounce"},
  "Berry":{c:"#c43b6a",say:"Down in one bite.",fx:s=>{s.fatigue-=10;s.spoil+=1;s.fear+=1;},react:"happy"},
  "Candy":{c:"#ff8fd0",say:"It loves the sugar a little too much.",fx:s=>{s.weight+=5;s.stress-=2;s.spoil+=1;},react:"happy"},
  "Honey cake":{c:"#f2b134",say:"It spins with joy.",fx:s=>{s.spoil+=10;s.fear-=5;s.weight+=5;},react:"spin"},
  "Bitter root":{c:"#6b4a2b",say:"It shudders, but it's listening now.",fx:s=>{s.fear+=20;s.spoil-=10;s.weight-=5;},react:"shudder"},
  "Slim tea":{c:"#9bd16b",say:"A little lighter on its feet.",fx:s=>{s.weight-=15;s.fatigue+=5;},react:"calm"},
};
const SNACK_FX={"Cool leaf":"stress halved","Energy nut":"fatigue -25","Berry":"fatigue -10","Candy":"weight +5, stress -2","Honey cake":"spoil +10, fear -5, weight +5","Bitter root":"fear +20, spoil -10, weight -5","Slim tea":"weight -15, fatigue +5"};
const MARK=[["Stout","a wider body and a pale belly"],["Horned","horns"],["Shelled","a spiked shell"],["Sage","antennae"],["Haloed","a gold halo"],["Winged","small wings"]];
const MARK_HINT=["It's been running a lot. I think it'll fill out.","It's been working those muscles. I bet it grows horns.","All that bracing is toughening its shoulders.","It's been thinking hard. Something might sprout up top.","Its spirit's been glowing lately.","It's so quick now. I wonder if it'll grow wings."];
const SEASON=["Spring","Summer","Autumn","Winter"];
/* Likes and dislikes, the Monster Rancher 2 way: one thing it loves and one it can't stand. Either can be a meal, a drill,
   a snack, something to wear, or battles, and neither shows on its info page until it happens the first time. */
const TASTE_KINDS=[["meal",30],["drill",30],["snack",15],["item",10],["battle",15]];
function tastePick(r,avoid){
  for(let n=0;n<50;n++){ let x=r()*100, k="meal"; for(const [nm,w] of TASTE_KINDS){ if(x<w){ k=nm; break; } x-=w; }
    const pick=a=>a[Math.floor(r()*a.length)];
    const v=k==="meal"?Math.floor(r()*MEALS.length):k==="drill"?Math.floor(r()*DRILLS.length):k==="snack"?pick(Object.keys(SNACKS)):k==="item"?pick(Object.keys(WORN)):null;
    if(!avoid||avoid.k!==k||(k!=="battle"&&avoid.v!==v)) return {k,v}; }
  return {k:"meal",v:0};
}
const taste=(k,v,s=RS)=>{ const hit=T=>T&&T.k===k&&(k==="battle"||T.v===v); return hit(s.likeT)?"like":hit(s.disT)?"dis":null; };
function tasteFound(t,s=RS){ s.found=s.found||{}; const first=!s.found[t]; s.found[t]=true; return first; }
const tasteName=T=>!T?"":T.k==="meal"?MEALS[T.v][0]:T.k==="drill"?DRILLS[T.v]:T.k==="battle"?"Battles":T.v;
const EVO_TOTAL={Squib:[90,220],Stilt:[90,220],Skit:[100,240],Antik:[110,250],Chomp:[110,250],Pinch:[120,260],Moko:[130,280],Booly:[130,280]};
const STAT_SKILLS=[[["Second Wind",30],["Endure",80],["Body Slam",150],["Regrow",240]],[["Haymaker",30],["Pump Up",80],["Crush",150],["Rampage",240]],[["Harden",30],["Shield Bash",80],["Retaliate",150],["Bulwark",240]],[["Concentrate",30],["Mind Spike",80],["Foresight",150],["Brainstorm",240]],[["Calm",30],["Still Water",80],["Spirit Ward",150],["Soul Flare",240]],[["Dart",30],["Agility",80],["Barrage",150],["Afterimage",240]]];
const CONDITION=[[20,"It's full of energy!"],[50,"It's in good shape."],[70,"It seems a little tired."],[90,"It's really tired. It needs a rest."],[999,"It's exhausted!"]];
const condition=()=>CONDITION.find(c=>RS.fatigue<c[0])[1];
const CONDITION_SHORT=[[20,"Fresh"],[50,"Fine"],[70,"Tired"],[90,"Worn out"],[999,"Exhausted"]];
const conditionShort=()=>CONDITION_SHORT.find(c=>RS.fatigue<c[0])[1];
const SEASON_COL={ground:["#78c556","#5fb043","#c49a45","#e9eef3"],hill:["#4f9a45","#3f8a38","#9c7a3a","#c5d3de"],leaf:["#58b45a","#3d9a3d","#d9822b",null]};
const SHAPES=[["Thin",-31,0.86],["Slim",-11,0.93],["Normal",10,1],["Chubby",30,1.08],["Heavy",99,1.16]];
const shapeOf=w=>SHAPES.find(s=>w<=s[1]);

let RS=null, RACT=0, RLOOP=false, RIDLE=null;
const RSTOP={stop:1};
const rk=()=>RS&&RS.skip?(RS.noScenes?25:5):1;
const rsleep=ms=>new Promise(r=>setTimeout(r,ms));
async function rwait(ms,id=RS.cur){ await rsleep(ms/rk()); if(id!==RACT) throw RSTOP; }
const rnd=(a,b)=>a+Math.random()*(b-a);
/* the smooth art draws the ranch as three screens: barn, yard, training ground. Hybrids still use the pixel yard. */
const smoothRanch=()=>!!(RS&&typeof CHIBI_ART!=="undefined"&&CHIBI_ART&&typeof chibiYard==="function"&&typeof chibiSpec==="function"&&chibiSpec(null,RS));
const HUTX=()=>smoothRanch()?-RW/2:26;
/* the barn: tap its door to go in, tap the doorway inside to come out. Inside is one screen (barnRoom in scenes.js). */
const inBarn=()=>!!(RS&&RS.room==="barn"&&smoothRanch());
async function enterBarn(id){ const s=RS; s.idling=true;   // idling blocks the idle wander from taking over mid-walk
  try{ await walkTo(HUTX(),110,"walk",id); s.room="barn"; s.x=24; s.camJump=true; await walkTo(96,60,"walk",id); s.pose="happy"; } finally { s.idling=false; } }
function leaveBarn(){ const s=RS; s.room=null; s.x=HUTX(); s.camJump=true; s.pose="idle"; }
function barnTap(x,y){   // a tap that wasn't on the monster, in yard coords; true if it hit something
  const s=RS; if(s.busy) return false; const S=BARN_SPOTS, inX=r=>x>=r[0]&&x<=r[1];
  if(!s.room){ if(Math.abs(x-HUTX())<40&&y>GROUND-104&&y<GROUND+4){ const id=s.cur=++RACT; enterBarn(id).then(()=>say("Its room in the barn. Tap the toys, the bed or the wardrobe.")).catch(()=>{}); return true; } return false; }
  const id=s.cur=++RACT; s.idling=false;
  if(inX(S.door)&&y>GROUND-104){ leaveBarn(); return true; }
  if(inX(S.trophies)&&y>GROUND-108&&y<GROUND-86){ const c=s.cups||[]; say(c.length?`${c.length} cup${c.length>1?"s":""} on the shelf: ${c.join(", ")}.`:"The shelf is empty until it wins its first tournament."); return true; }
  if(inX(S.shelf)&&y>GROUND-50){ runCare("play"); return true; }
  if(inX(S.stove)&&y>GROUND-40&&has("Kitchen")){ menu("Feed"); return true; }
  if(inX(S.wardrobe)&&y>GROUND-60){ openWear(); return true; }
  if(inX(S.bed)&&y>GROUND-24){ s.idling=true; (async()=>{ try{ await walkTo(202,50,"walk",id); s.pose="sleep"; for(let k=0;k<4;k++){ spark(s.x+8,headY(),"z"); await rwait(600,id);} s.pose="happy"; }catch(e){} s.idling=false; })(); return true; }
  return false;
}
/* back from a trip: on the new ranch it walks in along the road past the training ground, on the pixel one from the left */
async function homeArrive(x){ const s=RS; if(smoothRanch()){ s.x=2*RW-10; s.camJump=true; await walkTo(x,120,"walk"); } else { s.x=-30; await walkTo(x,55,"walk"); } }
const el=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- puppet: cut the label grid into parts once, then build each frame from them ---------- */
function makePuppet(G,big,fam,scaleOverride){
  const N=G.length, f=big?2:1, F=FAMILY[fam];
  const yt=F.body[0]*f, yb=(F.body[0]+F.body[1].length)*f-1;
  const px=[]; let topY=N, base=0;
  const rowSpan=y=>{let a=-1,b=-1;for(let x=0;x<N;x++)if(G[y][x]===1||G[y][x]===8){if(a<0)a=x;b=x;}return [a,b];};
  for(let y=0;y<N;y++){const [a,b]=rowSpan(y);for(let x=0;x<N;x++){const l=G[y][x];if(!l)continue;
    let g="body";
    if(l===3||l===6)g="eye"; else if(l===4||l===7)g="mouth";
    else if(y>yb)g="legs"; else if(y<yt)g="top";
    else if((l===2||l===5||l>=10)&&(a<0||x<a||x>b))g="arms";
    px.push({x,y,l,g}); topY=Math.min(topY,y); base=Math.max(base,y);}}
  const order={legs:0,body:1,arms:2,top:3,eye:4,mouth:5};
  px.sort((p,q)=>order[p.g]-order[q.g]);
  const eyeCol={};
  for(const p of px) if(p.g==="eye"){(eyeCol[p.x]=eyeCol[p.x]||[]).push(p.y);}
  for(const k in eyeCol){const ys=eyeCol[k];eyeCol[k]={top:Math.min(...ys),bot:Math.max(...ys),n:ys.length};}
  const bodyPx=px.filter(p=>p.g==="body"&&p.l===1);
  const pad=big?6:3;
  return {N,pad,W:N+pad*2,px,eyeCol,topY,base,big,f,bodyPx,scale:scaleOverride||(big?2:3)};
}
function eyeLabel(p,face,P){
  const c=P.eyeCol[p.x]; if(!c||face==="open") return p.l;
  if(face==="shut") return p.y===c.bot?4:1;
  if(face==="happy") return p.y===c.top?4:1;
  if(face==="tired") return (p.y===c.top&&c.n>1)?1:p.l;
  if(face==="dizzy") return p.l===6?5:p.l;
  return p.l;
}
function buildFrame(P,o){
  const W=P.W, F=Array.from({length:W},()=>Array(W).fill(0)), half=P.N/2, pad=P.pad;
  const put=(x,y,l)=>{x+=pad;y+=pad;if(x>=0&&y>=0&&x<W&&y<W)F[y][x]=l;};
  for(const p of P.px){
    let x=p.x,y=p.y,l=p.l;
    if(p.g==="legs") y+=x<half?o.legL:o.legR;
    else if(p.g==="arms") y+=x<half?o.armL:o.armR;
    else if(p.g==="top") x+=o.topX;
    else if(p.g==="eye") l=eyeLabel(p,o.face,P);
    put(x,y,l);
    if(p.g==="mouth"&&o.mouth){ for(let k=1;k<=P.f;k++) put(x,y+k,4); }
  }
  if(RS&&RS.mess>0){ const n=Math.min(RS.messSpots.length,Math.ceil(RS.mess/20)); for(let i=0;i<n;i++){const s=RS.messSpots[i];put(s.x,s.y,9);} }
  const kx=o.kx||1, ky=o.ky||1;
  if(kx===1&&ky===1) return F;
  const O=Array.from({length:W},()=>Array(W).fill(0)), cx=(W-1)/2, by=P.base+pad;
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){
    const sx=Math.round(cx+(x-cx)/kx), sy=Math.round(by-(by-y)/ky);
    if(sx>=0&&sy>=0&&sx<W&&sy<W&&sy<=by) O[y][x]=F[sy][sx];
    else if(y>by&&sx>=0&&sx<W) O[y][x]=F[y][sx];
  }
  return O;
}
function paintFrame(canvas,G,pal,scale,big,flash){
  const H=G.length,W=G[0].length; if(canvas.width!==W*scale){canvas.width=W*scale;canvas.height=H*scale;}
  const x=canvas.getContext("2d"); x.imageSmoothingEnabled=false; x.clearRect(0,0,canvas.width,canvas.height);
  const filled=(i,j)=>j>=0&&j<H&&i>=0&&i<W&&G[j][i]!==0;
  const messCol=RS&&RS.messKind==="mud"?[110,74,40]:RS&&RS.messKind==="ink"?[40,46,90]:[150,140,128];
  const dot=(i,j,c)=>{x.fillStyle=flash?"#fff":css(c);x.fillRect(i*scale,j*scale,scale,scale);};
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){
    const l=G[j][i];
    if(!l){ if(filled(i-1,j)||filled(i+1,j)||filled(i,j-1)||filled(i,j+1)) dot(i,j,pal.outline); continue; }
    let c={1:pal.body,2:pal.parts,3:pal.eye,4:pal.dark,5:pal.accent,6:pal.pupil,7:pal.eye,8:tone(pal.body,0.22,-0.15),9:messCol,10:[240,228,196],11:[255,214,74],12:tone(pal.body,0.32,-0.2)}[l];
    if(l===1||l===2||l===12){ if(!filled(i,j-1)) c=tone(c,0.12,-0.05); else if(!filled(i,j+1)||(big&&!filled(i,j+2))) c=tone(c,-0.16,0.05); }
    dot(i,j,c);
    if(big&&l===6&&G[j-1]&&G[j-1][i]!==6&&G[j][i-1]!==6) dot(i,j,pal.glint);
  }
}

/* ---------- evolution: add the mark on the Bit grid, then double it ---------- */
function addMark(G0,mark,mega){
  const G=G0.map(r=>r.slice()), N=G.length;
  let ty=N,yb=0; for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(G[y][x]===1){ty=Math.min(ty,y);yb=Math.max(yb,y);}
  const edge=y=>{for(let x=0;x<10;x++)if(G[y]&&G[y][x]===1)return x;return 9;};
  const set=(x,y,l)=>{if(x>=0&&x<10&&y>=0&&y<N){G[y][x]=l;G[y][19-x]=l;}};
  const lx=edge(ty);
  if(mark===0){ for(let y=yb-3;y<=yb-1;y++) for(let x=7;x<=9;x++) if(G[y][x]===1) set(x,y,8); }
  if(mark===1){ set(lx+1,ty-1,10); set(lx,ty-2,10); set(lx,ty-3,10); set(lx+1,ty-4,10); }
  if(mark===2){ const e0=edge(ty); for(let y=ty;y<=ty+1;y++) for(let x=0;x<10;x++) if(G[y][x]===1) set(x,y,2); for(let x=e0+1;x<=9;x+=2){ set(x,ty-1,10); set(x,ty-2,10); } }
  if(mark===3&&mega){ set(9,ty+1,3); set(9,ty+2,6); }
  if(mark===3){ set(lx,ty-1,12); set(lx,ty-2,12); set(lx-1,ty-3,12); set(lx-1,ty-4,11); set(lx-2,ty-4,11); set(lx-1,ty-5,11); }
  if(mark===4){ for(let x=6;x<=9;x++) set(x,ty-3,11); set(5,ty-2,11); }
  if(mark===5){ const e=edge(ty+1); set(e-1,ty,12); set(e-2,ty-1,12); set(e-2,ty,12); set(e-3,ty-1,12); set(e-3,ty-2,10); set(e-4,ty-2,10); set(e-1,ty+1,12); }
  return G;
}

/* ---------- state ---------- */
function newRanch(entry){
  const m=entry.m;
  const r=rng(hashStr(m.name+m.stats.join(",")));
  const like=Math.floor(r()*6); let dis=Math.floor(r()*5); if(dis>=like) dis++;
  const s={id:entry.id,m,grid:m.grid,stage:"Bit",mark:-1,tp:[0,0,0,0,0,0],lastTrained:-1,used:0,level:1,exp:0,grade:"E",wins:0,losses:0,habits:[],fightNo:0,equip:m.skills.slice(),skillsKnown:m.skills.slice(),cups:[],majors:[],born:PLAYER.week,
    spoil:15,fear:15,fatigue:0,stress:0,weight:0,like,dis,known:{},mess:0,messKind:"mud",messSpots:[],
    learned:[],injured:false,hinted:false,petWeek:-1,playWeek:-1,snackWeek:-1,mealMonth:-1,strainRun:0,sick:0,    x:150,dir:1,pose:"idle",jy:0,bx:0,upside:false,hidden:false,behind:false,flash:0,shake:0,ghosts:false,trail:[],props:[],parts:[],
    busy:false,cur:0,skip:false,noScenes:false,showNums:false,ptrX:null,ptrT:0,rub:null,bbox:null,ready:false,dead:false};
  if(entry.st) Object.assign(s,JSON.parse(JSON.stringify(entry.st)));
  if(!s.likeT){ if(entry.st){ s.likeT={k:"meal",v:s.like}; s.disT={k:"meal",v:s.dis}; s.found={like:s.known[s.like]==="like",dis:s.known[s.dis]==="dis"}; }
    else { s.likeT=tastePick(r); s.disT=tastePick(r,s.likeT); s.found={}; } }
  if(s.stage!=="Bit"||s.variant) rebuildLook(s); else s.P=makePuppet(m.grid,false,m.family);
  fixEquip(s);
  const body=s.P.bodyPx.filter(p=>p.x<10); if(!entry.st) for(let i=0;i<6&&body.length;i++){const p=body[Math.floor(r()*body.length)];s.messSpots.push({x:p.x,y:p.y},{x:19-p.x,y:p.y+1});}
  return s;
}
const loyalty=()=>{ const v=clamp(Math.round((RS.spoil+RS.fear)/2-Math.max(0,Math.abs(RS.spoil-RS.fear)-20)),0,100); return RS.variant==="Devoted"?Math.max(80,v):v; };
const hearts=()=>Math.floor(loyalty()/20);
const spoiled=()=>RS.spoil-RS.fear>=30, scared=()=>RS.fear-RS.spoil>=30;
const tpTotal=()=>RS.tp.reduce((a,b)=>a+b,0);
const evoTotal=()=>(EVO_TOTAL[RS.m.family]||[110,250])[RS.stage==="Bit"?0:1];
const evoReady=()=>RS.stage!=="Mega"&&tpTotal()>=evoTotal();
const lifeWeeks=()=>RS.m.lifespan*4;
/* Training by age. Nothing dies of old age: past its lifespan it's a veteran that still fights, but training barely moves it. */
const AGE_PHASES=[[0.2,0.8,"Young"],[0.7,1.2,"Prime"],[1,0.8,"Elder"],[Infinity,0.25,"Veteran"]];
function agePhase(s=RS){ const f=s.used/(s.m.lifespan*4); return AGE_PHASES.find(p=>f<p[0]); }
function ageMult(s=RS){ return agePhase(s)[1]; }
function dateShort(){const w=PLAYER.week, y=Math.floor(w/48)+1, mo=Math.floor(w/4)%12;return `${SEASON[Math.floor(mo/3)]} · Month ${mo%3+1} · Week ${w%4+1}${y>1?` · Year ${y}`:""}`;}
function dateText(){const w=PLAYER.week, y=Math.floor(w/48)+1, mo=Math.floor(w/4)%12, s=Math.floor(mo/3);return `Year ${y}, ${SEASON[s]}, month ${mo%3+1}, week ${w%4+1}`;}

/* ---------- open and close ---------- */
function openRanch(m){
  if(!PLAYER) loadGame();
  injectRanch();
  if(m){ if(RS&&RS.id) saveGame(); const e=addToRoster(m); if(!e){ alert("The Freezer is full."); return; } PLAYER.active=e.id; }
  const e=activeEntry(); if(!e){ el("ranch").style.display="flex"; RS=null; panel(""); openFreezer(); return; }
  if(!RS||RS.id!==e.id){ RS=newRanch(e); RS.say=e.st?"Welcome back.":"This is the ranch. Train it, feed it, and watch how it takes it."; }
  el("ranch").style.display="flex"; RS.open=true;
  checkReturn(); { const hungry=hungerCheck(); if(hungry&&!RS.busy) say(hungry); } drawUI(); menu(RS.away?"Out":undefined); saveGame();
  if(!RLOOP){RLOOP=true;requestAnimationFrame(rLoop);}
  if(!RIDLE) RIDLE=setInterval(()=>{ idleTick(); if(RS&&RS.away) checkReturn(); },700);
}
function closeRanch(){ saveGame(); el("ranch").style.display="none"; if(RS){RS.open=false;} }

function injectRanch(){
  if(el("ranch")) return;
  const d=document.createElement("div"); d.id="ranch";
  d.innerHTML=`<div id="r-top"><div class="r-id"><b id="r-name"></b><span id="r-lv"></span></div><div class="r-right"><span id="r-coins"></span><button class="small" id="r-info">Info</button><button class="iconbtn" id="r-gear" aria-label="Settings">☰</button></div></div>
<div id="r-sub"><span class="ht" id="r-hearts"></span><span id="r-form"></span><span id="r-shape"></span></div>
<div id="r-view"><div id="r-frame"><canvas id="r-canvas" width="${RW}" height="${RH}"></canvas><div id="r-dusk"></div><span id="r-date"></span><div id="r-banner"></div><button class="small" id="r-skip">Skip ▸▸</button><button class="small" id="r-goout">◂ Outside</button></div></div>
<div id="r-say"></div><div id="r-stats"></div><div id="r-learned"></div><div id="r-panel"></div><div id="r-week"></div><div id="r-nums"></div>
<div id="r-menu">${["Train","Rest","Feed","Care","Out"].map(n=>`<button class="rb" data-m="${n}">${n}</button>`).join("")}</div>
<div id="r-foot"><div class="set-card"><div class="lab-head"><b>Settings</b><button class="small" id="r-setx">Close</button></div>
<label class="set-row">Music<input type="checkbox" class="sw" id="r-mus" ${typeof MUS==="undefined"||MUS.on?"checked":""}></label>
<label class="set-row">Skip scenes<input type="checkbox" class="sw" id="r-off"></label>
<label class="set-row">Show hidden numbers<input type="checkbox" class="sw" id="r-numsbox"></label>
<div class="set-file"><span id="r-filewhen"></span><div class="brow"><button class="small" id="r-export">Save to a file</button><label class="small" for="r-import">Load a save file</label><button class="small install-btn" hidden onclick="installApp()">Install Snabits</button><input type="file" id="r-import" accept=".json,application/json" hidden></div><div id="r-fileask"></div></div>
<button class="btn2" id="r-back">Open the Snaboscope</button><span class="ver">Version ${typeof APP_VER!=="undefined"&&APP_VER!=="__VER__"?APP_VER:"dev"}</span></div></div>`;
  document.body.appendChild(d);
  el("r-back").onclick=()=>{ el("r-foot").classList.remove("open"); openScope(); };
  const fileWhen=()=>{ el("r-filewhen").textContent=PLAYER.lastExport?`Last saved to a file on ${new Date(PLAYER.lastExport).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}.`:"Clearing this site's data in the browser deletes the game, so keep a save file."; };
  el("r-gear").onclick=()=>{ installShow(); fileWhen(); el("r-fileask").innerHTML=""; el("r-foot").classList.toggle("open"); };
  el("r-export").onclick=async()=>{ await exportSave(); fileWhen(); };
  el("r-import").onchange=async e=>{ const f=e.target.files[0]; e.target.value=""; if(!f) return; const box=el("r-fileask");
    try{ const {p,saved}=await readSaveFile(f);
      box.innerHTML=`<p>Load ${saveSummary(p,saved)}? It replaces the game on this device.</p><div class="brow"><button class="small" id="r-fileno">Cancel</button><button class="small danger" id="r-fileyes">Load it</button></div>`;
      el("r-fileno").onclick=()=>box.innerHTML=""; el("r-fileyes").onclick=()=>applySave(p);
    }catch(err){ box.innerHTML=`<p>${err.message}</p>`; } };
  el("r-info").onclick=()=>openInfo("status"); el("r-name").onclick=()=>openInfo("status");
  el("r-setx").onclick=()=>el("r-foot").classList.remove("open");
  el("r-foot").onclick=e=>{ if(e.target.id==="r-foot") el("r-foot").classList.remove("open"); };
  el("r-mus").onchange=()=>{ if(typeof musToggle==="function") musToggle(); };
  el("r-skip").onclick=()=>{RS.skip=true;};
  el("r-goout").onclick=()=>{ if(RS&&!RS.busy){ RS.cur=++RACT; RS.idling=false; leaveBarn(); } };
  el("r-off").onchange=e=>{RS.noScenes=e.target.checked;};
  el("r-numsbox").onchange=e=>{RS.showNums=e.target.checked;drawUI();};
  d.querySelectorAll("#r-menu .rb").forEach(b=>b.onclick=()=>menu(b.dataset.m));
  const cv=el("r-canvas"); RS_bindPointer(cv);
}

/* ---------- UI ---------- */
function drawUI(){
  const s=RS, m=s.m;
  el("r-name").textContent=displayName(s);
  el("r-date").textContent=s.tripLabel||dateShort();
  const h=hearts(); el("r-hearts").textContent="♥".repeat(h)+"♡".repeat(5-h);
  el("r-shape").textContent=shapeOf(s.weight)[0]+(smoothRanch()&&typeof heightCm==="function"?" · "+heightText(heightCm(s.m,s.stage)):"");
  el("r-coins").textContent=PLAYER.bits+" bits";
  el("r-lv").textContent=`${s.stage} · Lv ${s.level} · Grade ${s.grade}`;
  el("r-form").textContent=conditionShort()+" · "+agePhase(s)[2];
  el("r-stats").innerHTML=STATS.map((st,i)=>{const fam=FAMILY[m.family].base[i], v=shownStat(i);
    return `<div class="rs" id="rs${i}"><span>${st} <small class="gr r${rankOf(fam)}">${rankOf(fam)}</small></span><span class="bg"><i style="width:${Math.min(100,v/2)}%"></i></span><span>${v}${s.tp[i]?` <small style="opacity:.6">(+${s.tp[i]})</small>`:""}</span></div>`;}).join("");
  sayBox(s.say,s.sayWho);
  const n=el("r-nums"); n.style.display=s.showNums?"block":"none";
  n.textContent=`Fatigue ${s.fatigue}, stress ${s.stress}, Strain ${s.fatigue+2*s.stress}. Spoil ${s.spoil}, Fear ${s.fear}, loyalty ${loyalty()}. Weight ${s.weight}. Weeks lived ${s.used} of ${lifeWeeks()} (${s.m.lifespan} months). Earned points ${tpTotal()}${s.stage==="Bit"?` of ${evoTotal()} for Byte`:""}.`;
  el("r-learned").textContent=s.learned.length?"Stat skills: "+s.learned.join(", "):"";
  el("r-menu").querySelectorAll(".rb").forEach(b=>{ b.disabled=s.busy||s.dead||(!!s.away&&b.dataset.m!=="Out")||(b.dataset.m==="Out"&&!s.away&&typeof outLocked==="function"&&outLocked()); b.title=b.disabled&&b.dataset.m==="Out"?"Opens after the first month":""; });
  if(!el("r-panel").innerHTML) weekCard();
  if(typeof checkTips==="function") checkTips();
}
function shownStat(i){ const s=RS; let v=s.m.stats[i]+s.tp[i]; if(s.stage!=="Bit"&&s.mark===i) v=Math.round(v*1.05); return v; }
function popStat(i,txt,neg){ const r=el("rs"+i); if(!r) return; const p=document.createElement("span"); p.className="pop"+(neg?" neg":""); p.textContent=txt; r.appendChild(p); setTimeout(()=>p.remove(),1500); }
/* the speech box: Tala by default, or one of the other people (npcs.js) when who is given */
function sayBox(t,who){ const b=el("r-say"), N=who&&typeof NPC!=="undefined"&&NPC[who];
  b.innerHTML=`<span class="who"${N?` style="background:${N.tag}"`:""}>${N?N.name:"Tala"}</span>${t||""}`;
  if(N){ if(typeof npcFace==="function") npcFace(b,who,t); } else if(typeof talaFace==="function") talaFace(b,t); }
function say(t,who){ RS.say=t; RS.sayWho=who||null; sayBox(t,who); }
function banner(t,col){ const b=el("r-banner"); b.textContent=t; b.style.color=col||"#fff"; b.classList.toggle("on",!!t); }
function panel(html){ el("r-panel").innerHTML=html; el("ranch").classList.toggle("menu-open",!!html); if(!html&&RS&&RS.id) weekCard(); }
/* With no menu open, the space under the stats shows what's coming up. */
function weekCard(){
  const s=RS, w=el("r-week"); if(!w) return;
  const ph=agePhase(s), mo=Math.floor(s.used/4);
  const rows=[["Next official cup",nextCupText().replace(/^The next official cup is in /,"").replace(/\.$/,"")||"This week"],
    ["Age",`${ph[2]} · ${mo} of ${s.m.lifespan} months`],
    s.stage!=="Mega"?["Evolves at",`${evoTotal()} earned points · has ${tpTotal()}`]:null,
    ["Wild fights",`${typeof wildLeft==="function"?wildLeft(s):3} left this week`],
    s.away?["Out on a mission","Back when it's done"]:null].filter(Boolean);
  w.innerHTML=rows.map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");
}

function menu(which){
  if(RS) RS.inTown=false;
  if(RS&&RS.visit&&typeof leaveVisit==="function") leaveVisit();
  const s=RS; if(s.busy) return;
  el("r-menu").querySelectorAll(".rb").forEach(b=>b.classList.toggle("on",b.dataset.m===which));
  if(!which){ panel(""); return; }
  s.lastMenu=which;
  if(which==="Train"){
    const heavy=hearts()>=2, noTrain=s.sick||s.injured, noHeavy=!heavy||s.fatigue>=90||s.fatigue+2*s.stress>=90;
    panel(DRILLS.map((d,i)=>`<button class="rb" data-d="${i}" ${noTrain?"disabled":""}>${d}<small>${STATS[i]}, rank ${rankOf(FAMILY[s.m.family].base[i])}</small></button>`).join("")+
      `<div style="flex-basis:100%;font-size:12px;opacity:.7">${s.injured?"It's hurt. A rest week or medicine fixes it.":s.sick?"It's sick this week, so it can't train. Rest or medicine fixes it.":!heavy?"Heavy drills open at 2 hearts.":noHeavy?"It's too worn out for heavy drills.":"Heavy drills push one stat hard, raise a second and lower a third."}</div>`+
      HEAVY.map((h,k)=>`<button class="rb" data-d="${6+k}" ${noTrain||noHeavy?"disabled":""}>${h[0]}<small class="fx"><span>${STATS[h[1]]} ↑</span><span>${STATS[h[2]]} +</span><span>${STATS[h[3]]} −2</span></small></button>`).join(""));
    el("r-panel").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>runDrill(+b.dataset.d));
  }
  if(which==="Rest"){ panel(`<button class="rb" id="r-rest">Rest this week<small>Fatigue −35, stress −7. Uses the week.</small></button><div style="flex-basis:100%;font-size:12px;opacity:.7">${condition()}</div>`); el("r-rest").onclick=runRest; }
  if(which==="Feed"){
    const fed=fedToday(s), snacked=s.snackWeek===PLAYER.week;
    panel(`<div class="full sec">Today's meal${fed?"<small>Fed today</small>":"<small>1 a day</small>"}</div>`+MEALS.map((ml,i)=>`<button class="rb" data-ml="${i}" ${fed||PLAYER.bits<ml[1]?"disabled":""}>${ml[0]}${s.known[i]==="like"?" ♥":s.known[i]==="dis"?" ✕":""}<small>${ml[1]} bits · ${itemDesc(ml[0])}</small></button>`).join("")+
      `<div class="full sec">Snacks<small>${snacked?"Had one this week":"1 a week"}</small></div>`+
      Object.keys(SNACKS).map(n=>`<button class="rb" data-sn="${n}" ${snacked||!PLAYER.bag[n]?"disabled":""}>${n}<small>${PLAYER.bag[n]||0} in the bag · ${itemDesc(n)}</small></button>`).join(""));
    el("r-panel").querySelectorAll("[data-ml]").forEach(b=>b.onclick=()=>runMeal(+b.dataset.ml));
    el("r-panel").querySelectorAll("[data-sn]").forEach(b=>b.onclick=()=>runSnack(b.dataset.sn));
  }
  if(which==="Care"){
    panel(`<button class="rb" id="r-skills">Skills<small>${s.equip.length} of 4 picked for battle</small></button><button class="rb" id="r-items">Items<small>${Object.values(PLAYER.bag).reduce((a,b)=>a+b,0)} in the bag</small></button><button class="rb" id="r-wear">Wear<small>${Object.values(s.worn||{}).filter(Boolean).length+(s.held?1:0)} on</small></button><button class="rb" id="r-pet">Pet<small>${s.petWeek===PLAYER.week?"Done this week":"Once a week"}</small></button><button class="rb" id="r-clean" ${s.mess?"":"disabled"}>Clean<small>${s.mess?"It's dirty":"It's clean"}</small></button><button class="rb" id="r-play">Play<small>${s.playWeek===PLAYER.week?"Done this week":"Once a week"}</small></button>`+
      (s.sick||s.injured?`<button class="rb" id="r-med">Medicine<small>${s.injured?"Heals the injury":"Cures the cold"}, 80 bits</small></button>`:"")+
      "");
    el("r-skills").onclick=()=>openInfo("skills"); el("r-items").onclick=openItems; el("r-wear").onclick=openWear;
    el("r-pet").onclick=()=>runCare("pet"); el("r-play").onclick=()=>runCare("play");
    if(s.mess) el("r-clean").onclick=()=>runCare("clean");
    if(el("r-med")) el("r-med").onclick=()=>{ if(PLAYER.bag.Medicine) PLAYER.bag.Medicine--; else if(PLAYER.bits<80){say("We can't afford medicine right now.");return;} else PLAYER.bits-=80; s.sick=0; s.injured=false; say("Medicine's in. It's well enough to train."); drawUI(); menu("Care"); };
  }
  if(which==="Out"){
    if(s.away){ missionStatus(); return; }
    panel(`<button class="rb full feat" id="r-wild">Wild battle<small>${typeof wildLeft==="function"?wildLeft(s):3} left this week</small></button><button class="rb" id="r-mis">Missions<small>1 to 3 weeks away</small></button><button class="rb" id="r-cup">Tournaments<small>Grade ${s.grade}</small></button><button class="rb" id="r-lab">Fusion lab<small>Fusion and rebirth</small></button><button class="rb" id="r-town">Town<small>Shops and upgrades</small></button><button class="rb" id="r-frz">Freezer<small>${PLAYER.roster.length-1} frozen</small></button><button class="rb" id="r-ghost">Friend battle<small>Room or ghost code</small></button><button class="rb" id="r-prac">Practice fight<small>Won't shape its habits</small></button><button class="rb" id="r-trip">Skill trip<small>4 weeks in a region</small></button><button class="rb full" id="r-team">Team battle<small>6 on 6 · ${typeof teamReady==="function"?Math.min(6,teamReady().length):0} of 6 ready</small></button>`);
    // anything that can't go ahead says why on the button itself, since the speech box is hidden behind this panel on a phone
    const ill=s.sick?"It has a cold. Rest it or give it medicine first.":s.injured?"It's hurt. Rest it or give it medicine first.":null;
    const block=(id,why)=>{ const bt=el(id); if(!why||!bt) return; bt.disabled=true; bt.classList.add("blocked"); const sm=bt.querySelector("small"); if(sm) sm.textContent=why; };
    block("r-wild",typeof wildBlock==="function"?wildBlock(s):null); block("r-mis",ill); block("r-cup",ill); block("r-trip",ill||(tripsLocked()?"Opens at 1 heart.":null));
    el("r-wild").onclick=startWild; el("r-mis").onclick=openBoard; el("r-cup").onclick=openCups; el("r-lab").onclick=openLab; el("r-frz").onclick=openFreezer; el("r-trip").onclick=()=>{ if(tripsLocked()){ say("Skill trips open at 1 heart."); return; } openTrips(); }; el("r-town").onclick=openTown; el("r-ghost").onclick=()=>openRooms(); el("r-team").onclick=openTeam;
    el("r-prac").onclick=()=>{ const o=gradedOpponent(s.grade,Math.max(1,s.level+Math.floor(rnd(-1,2))),Math.random); arenaFight({s,foe:o,mode:"control",title:"Practice",learn:true,onEnd:r=>{ if(r.learned.length) say(r.learned.join(" ")); saveGame(); }}); };
  }
}

/* ---------- a scene runs as the one owner of the monster ---------- */
async function scene(fn,keepRoom){
  const s=RS; if(s.busy||s.dead) return;
  if(s.room&&!keepRoom) leaveBarn();
  s.busy=true; s.cur=++RACT; s.skip=s.noScenes; s.behind=false; s.hidden=false; s.upside=false; s.rub=null;
  panel(""); el("r-menu").querySelectorAll(".rb").forEach(b=>b.classList.remove("on")); drawUI(); el("r-skip").style.display="block";
  try{ await fn(); }catch(e){ if(e!==RSTOP) console.error(e); }
  if(s.zx){ s.x+=s.zx; s.zx=0; }
  const dk=el("r-dusk"); if(dk){ dk.style.transition="none"; dk.style.backgroundColor="transparent"; } s.dayHour=null; if(s.training) backHome();
  if(s.visit){ s.props=s.propsHome||s.props; s.propsHome=null; s.visit=null; } s.trip=false; s.night=0; s.dusk=0; s.guide=null;
  s.busy=false; s.skip=false; s.bg=null; s.tripLabel=null; s.props=s.props.filter(p=>p.k==="bowl"); el("r-skip").style.display="none"; s.pose="idle"; s.jy=0; s.bx=0; s.upside=false; s.ghosts=false;
  drawUI(); if(s.lastMenu&&!s.dead) menu(s.lastMenu); saveGame();
}
function walkTo(x,speed=45,pose="walk",id=RS.cur){
  return new Promise((res,rej)=>{ const s=RS; s.pose=pose; s.dir=x<s.x?-1:1;
    const step=()=>{ if(id!==RACT) return rej(RSTOP); const d=x-s.x, v=speed*rk()/60;
      if(Math.abs(d)<=v){s.x=x;return res();} s.x+=Math.sign(d)*v;
      if(pose==="run"&&Math.random()<0.25) spark(s.x-s.dir*8,GROUND-1,"dust");
      setTimeout(step,16);}; step(); });
}
function hop(h,ms,id=RS.cur){
  return new Promise((res,rej)=>{ const t0=performance.now(), k=rk();
    const f=()=>{ if(id!==RACT){RS.jy=0;return rej(RSTOP);} const p=Math.min(1,(performance.now()-t0)*k/ms); RS.jy=Math.sin(p*Math.PI)*h; if(p<1) requestAnimationFrame(f); else {RS.jy=0;res();} }; f(); });
}
async function until(cond,max=5000,id=RS.cur){ const t0=performance.now(); while(!cond()&&performance.now()-t0<max){ await rwait(16,id); } }
function prop(o){ RS.props.push(o); return o; }
function unprop(o){ RS.props=RS.props.filter(p=>p!==o); }
function spark(x,y,kind,n=1){ for(let i=0;i<n;i++){ const p={x,y,kind,life:0,max:40,vx:rnd(-.4,.4),vy:-rnd(.3,.8),g:0};
  if(kind==="dust"){p.vy=-rnd(.1,.4);p.vx=rnd(-.6,.6);p.max=24;}
  if(kind==="star"){p.vx=rnd(-1,1);p.vy=-rnd(.6,1.4);p.g=0.04;p.max=50;}
  if(kind==="crumb"){p.vx=rnd(-.6,.6);p.vy=-rnd(.2,.8);p.g=.08;p.max=30;}
  if(kind==="sweat"){p.vx=rnd(-.8,.8);p.vy=-rnd(.5,1);p.g=.06;p.max=30;}
  if(kind==="sparkle"){p.vx=rnd(-.6,.6);p.vy=rnd(-.6,.6);p.max=30;}
  RS.parts.push(p);} }
/* The ranch keeps its own day: each week starts in the morning and stays bright while you plan it, and night only
   falls at the end of a training or rest week (dayFade). dayHour is the hour the yard is drawn at while that plays. */
const ranchHour=()=>RS&&RS.dayHour!=null?RS.dayHour:10;
/* Where each drill happens: the six everyday drills each have a place near the ranch, and the heavy ones go further out.
   Picking a drill fades to black and opens on its place; the week then ends there with nightfall, and morning comes up at home. */
const DRILL_PLACE=["pool","trail","cage","study","pond","court"], HEAVY_PLACE=["road","quarry","gate","library","shrine","course"];
const PLACE_NAME={pool:"the pool",trail:"the rocky trail",cage:"the batting cage",study:"the study room",pond:"the lotus pond",court:"the court",
  road:"the long road",quarry:"the quarry",gate:"the old fortress",library:"the library",shrine:"the waterfall shrine",course:"the obstacle course"};
const PLACE_START={pool:60,trail:60,cage:140,study:110,pond:196,court:100,road:110,quarry:90,gate:150,library:110,shrine:130,course:20};
async function sceneFade(dark,ms=700){ const d=el("r-dusk"); if(!d) return; d.style.transition=`background-color ${Math.round(ms/rk())}ms ease`; d.style.backgroundColor=dark?"rgba(3,4,9,1)":"rgba(3,4,9,0)"; await rwait(ms); }
async function goPlace(place){ const s=RS; await sceneFade(true); s.propsHome=s.props; s.props=[]; s.bg=place; s.training=true; s.x=PLACE_START[place]||110; s.jy=0; s.pose="idle"; s.camJump=true; await rwait(300); await sceneFade(false); }
function backHome(){ const s=RS; s.bg=null; s.training=false; s.waterY=null; s.lotus=false; s.koiPull=0; s.jy=0; s.x=150; s.upside=false; s.parted=false; s.props=s.propsHome||s.props.filter(p=>p.k==="bowl"); s.propsHome=null; s.camJump=true; }
/* Meals follow the phone's calendar: one a day, and every day it goes without one makes it hungrier. */
const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const daysBetween=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
const fedToday=(s=RS)=>s.mealDay===dayKey();
function hungerCheck(){ const s=RS, today=dayKey(); if(!s||s.hungerDay===today) return null;
  if(!s.mealDay){ s.mealDay=dayKey(new Date(Date.now()-864e5)); s.hungerDay=today; return null; }
  const missed=Math.min(4,daysBetween(s.mealDay,today)-1); s.hungerDay=today; if(missed<=0) return null;
  s.stress+=5*missed; s.weight-=3*missed; s.spoil-=missed; clampAll();
  return missed===1?"It went a whole day without a meal yesterday, and it's cranky about it.":`It went ${missed} days without a meal. It's hungry and thinner.`; }
async function dayFade(kind,atBlack){
  const s=RS, d=el("r-dusk"); if(!d) return;
  const to=async(col,ms,hold=0)=>{ d.style.transition=`background-color ${Math.round(ms/rk())}ms ease`; d.style.backgroundColor=col; await rwait(ms+hold); };
  if(kind==="night"){ await to("rgba(170,80,70,.3)",1000); await to("rgba(12,14,38,.85)",800); s.dayHour=21; await to("rgba(12,14,38,.15)",800,1000); }
  await to("rgba(3,4,9,1)",kind==="sleep"?2200:1000,600);
  if(atBlack) atBlack();
  s.dayHour=6; await to("rgba(255,196,130,.42)",1000); s.dayHour=null; await to("rgba(255,196,130,0)",1000);
}
const headY=()=>{ const h=RS.cam&&typeof chibiHeadY==="function"?chibiHeadY(RS):null; return h!=null?h:GROUND-(RS.P.base-RS.P.topY+1)*RS.P.scale-RS.jy; };

/* ---------- drills ---------- */
function rollDrill(){
  const s=RS, h=hearts();
  if(spoiled()&&Math.random()<0.2+(s.slackBonus||0)) return "slack";
  const great=10+2*h+(s.fatigue<20?5:0)+(s.weatherBonus?10:0)+(has("Training gear")?5:0), fail=Math.max(5,25-5*h)+(s.fatigue>50?15:0)-(s.stress<10&&s.fatigue<30?5:0);
  const r=Math.random()*100; return r<great?"great":r<great+fail?"fail":"success";
}
// heavy drills: [name, main stat, minor stat, dropped stat, mess]
const HEAVY=[["Marathon",0,5,1,"mud"],["Quarry",1,0,5,"dust"],["Fortress",2,1,3,"dust"],["Library",3,4,2,"ink"],["Shrine",4,2,0,null],["Obstacle course",5,3,4,"mud"]];
async function runDrill(i){
  await scene(async()=>{
    const s=RS, res=rollDrill(), heavy=i>=6, H=heavy?HEAVY[i-6]:null, main=heavy?H[1]:i, name=heavy?H[0]:DRILLS[i];
    s.lastTrained=main; s.weekAct=STATS[main];
    const place=heavy?HEAVY_PLACE[i-6]:smoothRanch()?DRILL_PLACE[i]:null;
    say(place?`${name} at ${PLACE_NAME[place]}. Let's see how it does.`:`${name}. Let's see how it does.`);
    if(place) await goPlace(place);
    if(res==="slack") await SLACK(i); else await (heavy?HEAVY_FN[i-6]:SCENE_FN[i])(res);
    if(place){ s.props=[]; s.upside=false; s.parted=false; if(s.waterY==null) s.jy=0; } else { s.bg=null; s.x=150; s.props=s.props.filter(p=>p.k==="bowl"); s.upside=false; s.parted=false; s.jy=0; }
    const age=ageMult(s), vet=age<0.5, base=FAMILY[s.m.family].base;
    const rp=k=>RANK_PTS[rankOf(base[k])], mult=res==="great"?2:res==="slack"?0.5:1;
    const gains={};
    if(res==="fail") gains[main]=1;
    else { gains[main]=Math.max(vet?0:1,Math.round(rp(main)*(heavy?1.5:1)*mult*age)); if(heavy) gains[H[2]]=Math.max(vet?0:1,Math.round(rp(H[2])/2*mult*age)); }
    if(heavy) gains[H[3]]=(gains[H[3]]||0)-2;
    const shp=shapeOf(s.weight)[0], fm=shp==="Thin"?1.25:shp==="Chubby"?1.25:shp==="Heavy"?1.5:1, sm=shp==="Thin"?1.5:shp==="Slim"?1.25:shp==="Chubby"?0.75:shp==="Heavy"?0.5:1, hv=heavy?2:1;
    s.fatigue+=Math.round((res==="great"||res==="slack"?5:10)*fm*hv); s.stress+=Math.round(((res==="great"?9:5)*hv)*sm*(s.variant==="Pampered"?0.75:1)); s.weight-=hv;
    const tz=heavy?null:taste("drill",i), tFirst=tz?tasteFound(tz):false;
    if(tz==="like"){ s.stress-=4; s.spoil+=2; spark(s.x,headY()-4,"heart",3); } if(tz==="dis"){ s.stress+=8; s.spoil-=2; spark(s.x,headY()-6,"q"); }
    const tLine=!tz?"":tz==="like"?(tFirst?`It loves ${name}. I'll remember that.`:`${name} is its favourite.`):(tFirst?`It really doesn't like ${name}. I'll remember that.`:`It grumbled through ${name} again.`);
    for(const k in gains) s.tp[k]=Math.max(0,s.tp[k]+gains[k]);
    const hurtP=s.fatigue>=90?0.3:s.fatigue>=70?0.15:0;
    const col={great:"#ffd23f",success:"#ffffff",fail:"#ff8a8a",slack:"#c9a6ff"}[res];
    banner({great:"Great!",success:"Success",fail:"Fail",slack:"Slacked off"}[res],col);
    const mess=heavy?H[4]:DRILL_MESS[i];
    if(mess&&res!=="slack"){ s.mess=Math.min(100,s.mess+35); s.messKind=mess; }
    if(heavy&&H[0]==="Shrine"&&res!=="slack") s.mess=0;
    drawUI(); for(const k in gains) popStat(+k,(gains[k]>0?"+":"")+gains[k],gains[k]<0);
    await rwait(900); banner("");
    for(const k in gains) for(const [nm,need] of STAT_SKILLS[k]) if(s.tp[k]>=need&&!s.learned.includes(nm)){ s.learned.push(nm); fixEquip(s); banner("Learned "+nm+"!","#7dff9a"); s.pose="happy"; spark(s.x,headY()-6,"sparkle",8); drawUI(); await rwait(1300); banner(""); s.pose="idle"; }
    if(Math.random()<hurtP){ s.injured=true; s.used+=2; s.pose="hurt"; spark(s.x,headY()-4,"star",4); say("It pushed too hard and got hurt."); await rwait(1200); s.pose="tired"; }
    await praiseOrScold(res);
    await dayFade("night",place?backHome:null);
    await endWeek(1, tLine+" "+(s.injured?"It pushed too hard and got hurt. That's 2 weeks off its prime, and it needs a rest or medicine.":{great:"That was its best yet.",success:"Solid work.",fail:"It'll get it next time.",slack:"It wandered off halfway. It's getting a bit spoiled."}[res]));
  });
}
/* How you react after a drill, the Monster Rancher 2 way: praise is for a great result, scolding is for when it ignored
   the drill, and after a fail you can console it or leave it. An ordinary success gets no prompt.
   Numbers follow MR2: praising a great builds affection and eases stress; holding back hurts it. Scolding a slacker builds
   respect and it slacks less; letting it go spoils it and it slacks more. Consoling a fail eases stress. */
const REACT={
  great:{q:"A great result. Praise it?",yes:["Praise","spoil",3,"fear",2,"stress",-5],no:["Say nothing","spoil",-7,"fear",3,"stress",3]},
  slack:{q:"It ignored the drill. Scold it?",yes:["Scold","fear",5,"spoil",-2,"stress",3],no:["Let it go","spoil",3,"fear",-2,"stress",0]},
  fail:{q:"It failed. Console it?",yes:["Console","spoil",3,"fear",0,"stress",-2],no:["Leave it","spoil",0,"fear",1,"stress",1]},
};
function praiseOrScold(res){
  const R=REACT[res]; if(!R) return Promise.resolve();
  return new Promise(done=>{
    panel(`<div class="full sec">${R.q}</div><button class="rb" id="r-pr">${R.yes[0]}</button><button class="rb" id="r-sc">${R.no[0]}</button>`);
    el("r-skip").style.display="none";
    const go=async yes=>{ panel(""); const s=RS; s.skip=s.noScenes; el("r-skip").style.display="block";
      const T=yes?R.yes:R.no; for(let k=1;k<T.length;k+=2) s[T[k]]+=T[k+1];
      if(res==="slack") s.slackBonus=Math.max(-0.1,(s.slackBonus||0)+(yes?-0.05:0.05));
      try{
        if(res==="great"&&yes){ s.pose="happy"; spark(s.x,headY()-4,"heart",3); await hop(10,300); say("It's beaming since it knows it did well."); }
        else if(res==="great"){ s.pose="sad"; say("It looks up at you, waiting for something."); }
        else if(res==="slack"&&yes){ s.pose="sad"; spark(s.x,headY()-6,"sweat",2); say("It hangs its head. It'll think twice next time."); }
        else if(res==="slack"){ s.pose="happy"; say("It trots off, pleased with itself."); }
        else if(yes){ s.pose="happy"; spark(s.x,headY()-4,"heart",1); say("It perks up a little."); }
        else { s.pose="tired"; say("It sits with it for a while."); }
        await rwait(1100);
      }catch(e){}
      clampAll(); s.pose="idle"; done(); };
    el("r-pr").onclick=()=>go(true); el("r-sc").onclick=()=>go(false);
  });
}
async function SLACK(i){ const s=RS; s.pose="idle"; await rwait(700); spark(s.x,headY()-6,"q"); await rwait(500); await walkTo(36,30); s.pose="sleep"; for(let k=0;k<3;k++){ spark(s.x+6,headY(),"z"); await rwait(450);} }

const SCENE_FN=[
  async r=>{ // Laps
    const s=RS, laps=r==="great"?3:2;
    if(s.bg==="pool"){ const tall=GROUND-headY(), sink=tall*0.6-24, surf=GROUND-24;
      const swim=async tx=>{ const d=Math.sign(tx-s.x); s.dir=d; s.pose="walk"; while(Math.abs(tx-s.x)>1.5){ s.x+=d*1.5; if(Math.random()<0.18) spark(s.x-d*10,surf-1,"drip"); await rwait(r==="great"?16:22); } };
      if(r==="great"){ s.x=226; s.jy=30; s.pose="crouch"; await rwait(450); s.pose="jump";
        for(let f=0;f<=36;f++){ const k=f/36; s.x-=1.2; s.jy=30+Math.sin(k*Math.PI)*24-k*(30+sink); await rwait(18); }
        s.waterY=surf; spark(s.x,surf-2,"drip",14); s.shake=6; await rwait(300); }
      else { s.waterY=surf; s.jy=-sink; spark(s.x,surf-2,"drip",6); await rwait(400); }
      for(let k=0;k<laps;k++){
        await swim(205);
        if(r==="fail"&&k===1){ await swim(140); s.pose="tired"; spark(s.x,headY(),"sweat",3); const fl=prop({k:"floatie",x:s.x,y:surf,w:tall*0.55});
          for(let j=0;j<20;j++){ s.jy=-sink+Math.sin(j/2)*1.5; await rwait(90);} s.pose="sad"; await rwait(700); return; }
        await swim(45);
      }
      s.pose="happy"; spark(s.x,surf-3,"drip",8); if(r==="great") spark(s.x,headY()-4,"heart",3); await rwait(900); return; }
    for(let k=0;k<laps;k++){
      await walkTo(222,95,"run");
      if(r==="fail"&&k===1){ await walkTo(150,95,"run"); s.pose="hurt"; s.upside=true; spark(s.x,GROUND-2,"dust",6); await rwait(600); s.upside=false; s.pose="dizzy"; spark(s.x,headY()-4,"star",4); await rwait(1300); return; }
      await walkTo(90,95,"run");
    }
    if(r==="great"){ s.pose="happy"; await hop(22,500); spark(s.x,headY()-4,"heart",3); await rwait(800); }
    else { s.pose="tired"; spark(s.x,headY(),"sweat",3); await rwait(900); }
  },
  async r=>{ // Boulder push
    const s=RS; await walkTo(80,50);
    const b=prop({k:"boulder",x:80+16+RS.P.scale*4,y:GROUND,r:11,rot:0}); s.pose="effort"; await rwait(700);
    if(r==="fail"){ for(let k=0;k<25;k++){ s.x-=0.5; if(k%5===0) spark(s.x,GROUND-1,"dust"); await rwait(40);} s.pose="tired"; spark(s.x,headY(),"sweat",3); await rwait(1000); unprop(b); return; }
    while(b.x<185){ b.x+=1; s.x+=1; b.rot+=0.09; if(b.x%6===0) spark(s.x-8,GROUND-1,"dust"); await rwait(r==="great"?22:40); }
    if(r==="great"){ b.vx=3.2; s.pose="happy"; await until(()=>b.x>RW+20); unprop(b); s.shake=14; spark(RW-6,GROUND-6,"dust",10); await hop(14,420); await rwait(600); }
    else { s.pose="tired"; spark(s.x,headY(),"sweat",2); await rwait(800); unprop(b); }
  },
  async r=>{ // Brace
    const s=RS; await walkTo(140,50); s.pose="guard"; await rwait(400);
    for(let k=0;k<4;k++){
      // aim each throw at its chest, whatever its size: the arc lands where the body is, not at a fixed height
      const top=headY(), tall=GROUND-top, tx=s.x-tall*0.32, ty=top+tall*0.42, x0=HELPX+6, y0=GROUND-26, vx=3.4, g=0.08, T=Math.max(8,(tx-x0)/vx);
      const ball=prop({k:"ball",x:x0,y:y0,vx,vy:(ty-y0-g*T*(T-1)/2)/T,g,c:"#e8453c"});
      await until(()=>ball.x>=tx);
      if(r==="fail"&&k===2){ unprop(ball); s.upside=true; s.pose="walk"; spark(s.x,GROUND-3,"dust",5); await rwait(1300); s.upside=false; s.pose="dizzy"; await rwait(600); return; }
      ball.vx=-2.2; ball.vy=-2; s.flash=4; if(r==="success") s.x+=3;
      await rwait(380); unprop(ball);
    }
    if(r==="great"){ s.pose="happy"; spark(s.x,headY()-4,"heart",2); await rwait(900);} else { s.pose="idle"; await rwait(500); }
  },
  async r=>{ // Puzzle box
    const s=RS; await walkTo(118,50); const b=prop({k:"box",x:s.x+RS.P.scale*7+4,y:GROUND,open:false}); s.pose="idle";
    spark(s.x,headY()-6,"q"); await rwait(r==="great"?600:1200); if(r!=="great"){ spark(s.x,headY()-6,"q"); await rwait(700); }
    if(r==="fail"){ s.pose="hurt"; for(let k=0;k<6;k++){ spark(s.x+rnd(-4,4),headY()-2,"smoke"); await rwait(120);} b.vx=2.6; b.vy=-3.2; b.g=0.18; s.pose="tired"; await rwait(1200); unprop(b); return; }
    if(r==="great") spark(s.x,headY()-10,"bulb");
    b.open=true; s.pose="happy"; spark(b.x,GROUND-12,"sparkle",6); await rwait(r==="great"?1200:800); unprop(b);
  },
  async r=>{ // Meditate
    const s=RS;
    if(s.bg==="pond"){ s.x=196; s.jy=5; s.pose="sit"; await rwait(500);
      const pulses=r==="fail"?1:3;
      for(let k=0;k<pulses;k++){ s.koiPull=Math.min(1,(k+1)/3); const ring=prop({k:"ring",x:s.x,y:GROUND-1,r:4}); for(let j=0;j<24;j++){ ring.r+=1.4; await rwait(34);} unprop(ring); }
      if(r==="fail"){ s.pose="sleep"; for(let k=0;k<3;k++){ spark(s.x+6,headY(),"z"); await rwait(420);}
        const fr=prop({k:"frog",x:s.x+44,y:GROUND+6}); await rwait(400); const hx=s.x, hy=headY()+2;
        for(let f=0;f<=24;f++){ const k=f/24; fr.x=s.x+44+(hx-s.x-44)*k; fr.y=GROUND+6+(hy-GROUND-6)*k-Math.sin(k*Math.PI)*26; await rwait(22); }
        fr.on=true; await rwait(500); s.pose="hurt"; spark(s.x,headY()-8,"q"); await rwait(700);
        for(let f=0;f<=20;f++){ const k=f/20; fr.x=hx-k*60; fr.y=hy+(GROUND+8-hy)*k-Math.sin(k*Math.PI)*20; await rwait(22); } unprop(fr); s.pose="dizzy"; await rwait(700); return; }
      if(r==="great"){ s.lotus=true; s.pose="float"; for(let k=0;k<14;k++){ s.jy=5+Math.min(10,k); spark(s.x+rnd(-14,14),headY()+rnd(0,20),"sparkle"); await rwait(110);} await rwait(400); s.jy=5; s.pose="sit"; }
      else { s.pose="happy"; await rwait(600); }
      return; }
    await walkTo(196,45); s.pose="sit";
    const pulses=r==="fail"?1:3;
    for(let k=0;k<pulses;k++){ const ring=prop({k:"ring",x:s.x,y:GROUND-18,r:3}); for(let j=0;j<20;j++){ ring.r+=1.2; await rwait(30);} unprop(ring); }
    if(r==="fail"){ s.pose="sleep"; for(let k=0;k<4;k++){ spark(s.x+6,headY(),"z"); await rwait(420);} return; }
    if(r==="great"){ s.pose="float"; for(let k=0;k<12;k++){ spark(s.x+rnd(-14,14),headY()+rnd(0,20),"sparkle"); await rwait(110);} }
    else { s.pose="idle"; await rwait(400); }
  },
  async r=>{ // Dodgeball
    const s=RS; await walkTo(100,50); s.pose="idle"; if(r==="great") s.ghosts=true;
    for(let k=0;k<4;k++){
      const ball=prop({k:"ball",x:RW+6,y:GROUND-7,vx:-4.2,vy:0,g:0,c:"#3c8ce8"});
      await until(()=>ball.x<s.x+RS.P.scale*7);
      if(r==="fail"&&k===2){ ball.vx=2; ball.vy=-2.6; ball.g=0.15; s.pose="dizzy"; s.flash=4; spark(s.x,headY()-4,"star",5); await rwait(1400); unprop(ball); return; }
      s.pose="walk"; await hop(26,420); s.pose="idle"; await until(()=>ball.x<-10,1500); unprop(ball);
    }
    s.ghosts=false; s.pose=r==="great"?"happy":"idle"; await rwait(700);
  },
];

/* ---------- other week actions ---------- */
async function runRest(){
  await scene(async()=>{ const s=RS; say(smoothRanch()?"A quiet week in the barn.":"A quiet week in the hut.");
    if(smoothRanch()){ if(!s.room){ await walkTo(HUTX(),110); s.room="barn"; s.x=24; s.camJump=true; } await walkTo(202,60); s.pose="sleep"; for(let k=0;k<3;k++){ spark(s.x+8,headY(),"z"); await rwait(500);} await dayFade("sleep"); s.pose="happy"; await rwait(500); }
    else { await walkTo(HUTX(),40); s.hidden=true; for(let k=0;k<3;k++){ spark(HUTX()+4,GROUND-34,"z"); await rwait(450);} await dayFade("sleep"); s.hidden=false; s.pose="happy"; await rwait(500); }
    s.fatigue-=has("Better hut")?45:35; s.stress-=7; s.weight+=1; const wasHurt=s.injured; s.injured=false; await endWeek(1,wasHurt?"The rest healed it up.":"It looks rested.");
  },true);
}
async function runMeal(i){
  const s=RS, ml=MEALS[i]; if(PLAYER.bits<ml[1]) return;
  await scene(async()=>{
    PLAYER.bits-=ml[1]; s.mealDay=dayKey(); drawUI();
    const bowl=s.props.find(p=>p.k==="bowl")||prop({k:"bowl",x:BOWLX,y:GROUND}); bowl.food=ml[6];
    say(`${ml[0]} in the bowl.`); await walkTo(BOWLX+RS.P.scale*7,40);
    const like=taste("meal",i)||"neutral";
    if(like==="dis"){ s.pose="idle"; spark(s.x,headY()-6,"q"); await rwait(600); await walkTo(s.x+14,30); await rwait(500); await walkTo(BOWLX+RS.P.scale*7,30); s.pose="eat"; for(let k=0;k<6;k++){ if(k%2) spark(BOWLX+6,GROUND-6,"crumb"); await rwait(330);} s.pose="sad"; await rwait(800); }
    else { s.pose="eat"; for(let k=0;k<(like==="like"?6:8);k++){ spark(BOWLX+6,GROUND-6,"crumb"); await rwait(like==="like"?140:220);} if(like==="like"){ s.pose="happy"; spark(s.x,headY()-4,"heart",3); await hop(14,420); await rwait(500);} else { s.pose="idle"; await rwait(600);} }
    bowl.food=null;
    let [ , , st,sp,fe,wt]=ml; s.stress+=st; s.spoil+=sp; s.fear+=fe; s.weight+=wt;
    if(like==="like"){ s.stress-=3; s.spoil+=2; if(has("Kitchen")) s.fatigue-=5; } if(like==="dis"){ s.stress+=12; s.spoil-=6; s.fear+=2; }
    const first=!s.known[i]; s.known[i]=like; if(like!=="neutral") tasteFound(like);
    say(like==="like"?(first?"It loves this! I'll mark it with a heart.":"It loves this and finished it in seconds."):like==="dis"?(first?"It hates this one. I'll mark it so we remember.":"It ate it, but it wasn't happy."):"It ate all of it.");
    clampAll();
  });
}
async function runSnack(n){
  const s=RS, sn=SNACKS[n]; if(!PLAYER.bag[n]) return;
  await scene(async()=>{
    PLAYER.bag[n]--; s.snackWeek=PLAYER.week; s.pose="idle";
    const p=prop({k:"snack",x:HELPX+6,y:GROUND-26,c:sn.c}); const tx=s.x, ty=headY()+10, T=36;
    p.vx=(tx-p.x)/T; p.vy=(ty-p.y)/T-0.05*T/2; p.g=0.05;
    await until(()=>Math.abs(p.x-tx)<3,2000); unprop(p); s.pose="eat"; await rwait(450);
    if(sn.react==="shudder"){ s.pose="hurt"; await rwait(700); }
    else if(sn.react==="spin"){ s.pose="happy"; for(let k=0;k<6;k++){ s.dir*=-1; s.bx=s.dir; await rwait(120);} s.bx=0; spark(s.x,headY()-4,"heart",2); }
    else if(sn.react==="bounce"){ s.pose="happy"; await hop(18,350); await walkTo(s.x+30>215?s.x-30:s.x+30,90,"run"); await hop(18,350); }
    else if(sn.react==="happy"){ s.pose="happy"; spark(s.x,headY()-4,"heart",1); await rwait(700); }
    else { s.pose="idle"; spark(s.x,headY()-4,"sparkle",3); await rwait(600); }
    sn.fx(s); const tz=taste("snack",n), tFirst=tz?tasteFound(tz):false;
    if(tz==="like"){ s.stress-=5; s.spoil+=3; spark(s.x,headY()-4,"heart",3); } if(tz==="dis"){ s.stress+=8; s.spoil-=3; }
    clampAll(); say(!tz?sn.say:tz==="like"?(tFirst?`It loves ${n}! I'll remember that.`:`Its favourite snack.`):(tFirst?`It spat half the ${n} out. It doesn't like those.`:`It ate the ${n}, but it wasn't happy.`));
  });
}
async function runCare(kind){
  await scene(async()=>{ const s=RS;
    if(kind==="pet"){ if(scared()){ s.pose="hurt"; await rwait(300);} s.pose="lean"; for(let k=0;k<5;k++){ spark(s.x+rnd(-8,8),headY()-2,"heart"); await rwait(260);} petOnce(); }
    if(kind==="clean"){ s.pose="idle"; while(s.mess>0){ s.mess-=20; spark(s.x+rnd(-12,12),headY()+rnd(4,24),"sparkle"); await rwait(160);} s.mess=0; s.pose="happy"; await rwait(500); say("Squeaky clean."); }
    if(kind==="play"){
      for(let k=0;k<2;k++){ const tx=rnd(110,215), b=prop({k:"ball",x:HELPX+6,y:GROUND-26,vx:(tx-HELPX)/50,vy:-2.6,g:0.1,c:"#ffd23f",bounce:true});
        await walkTo(tx,85,"run"); await until(()=>Math.abs(b.x-s.x)<6&&b.y>GROUND-12,1200); unprop(b); s.pose="happy"; await hop(16,380); }
      if(s.playWeek!==PLAYER.week){ s.playWeek=PLAYER.week; s.stress-=5; say("That took the edge off."); } else say("It had fun, though it's played enough for this week.");
    }
    clampAll();
  },true);
}
function petOnce(){ const s=RS; if(s.petWeek!==PLAYER.week){ s.petWeek=PLAYER.week; s.spoil+=2; s.stress-=2; say(scared()?"It flinched at first, then leaned in.":"It leans right into it."); } else say("It likes that, though it's had its fuss this week."); clampAll(); drawUI(); }
function clampAll(){ const s=RS; s.fatigue=clamp(s.fatigue,0,100); s.stress=clamp(s.stress,0,100); s.spoil=clamp(s.spoil,0,100); s.fear=clamp(s.fear,0,100); s.weight=clamp(s.weight,-50,50); }

function moonFull(){ const d=(Date.now()-Date.UTC(2000,0,6,18,14))/864e5, ph=((d%29.530589)+29.530589)%29.530589; return Math.abs(ph-14.77)<1.1; }
function variantsMet(s){
  const v=[], shp=shapeOf(s.weight)[0];
  if(hearts()===5&&!spoiled()&&!scared()) v.push("Devoted");
  if(spoiled()) v.push("Pampered");
  if(scared()) v.push("Feral");
  if(shp==="Heavy") v.push("Bulky");
  if(shp==="Thin") v.push("Lean");
  const wr=Object.entries(s.stageRegions||{}).find(([r,w])=>w>=12&&REGIONS.concat([{n:"The Rift",el:"Void"}]).find(x=>x.n===r).el!==s.m.el1&&REGIONS.concat([{n:"The Rift",el:"Void"}]).find(x=>x.n===r).el!==s.m.el2);
  if(wr) v.push("Wanderer:"+wr[0]);
  if((s.stageCups||0)>0) v.push("Champion");
  if(moonFull()) v.push("Moonlit");
  if((s.neglect||0)>=5) v.push("Scruffy");
  return v;
}
const VARIANT_TEXT={Devoted:"a soft glow, and its loyalty never drops below 4 hearts",Pampered:"a rounder body and sparkly eyes, and drills stress it less",Feral:"sharp teeth and a dark outline, and +5% crits",
  Bulky:"a wider body and +10% HP",Lean:"longer legs and +5% Speed",Wanderer:"the colours of the region it roamed",Champion:"a champion's crest",Moonlit:"a night palette and silver eyes",Scruffy:"messy fur until it gets 4 weeks of care"};
function pickVariant(list){
  if(list.length<=1) return Promise.resolve(list[0]||null);
  return new Promise(done=>{
    panel(`<div style="flex-basis:100%;font-size:13px">Its life left a mark. Pick one variant.</div>`+list.map((v,i)=>`<button class="rb" data-v="${i}">${v.split(":")[0]}<small>${VARIANT_TEXT[v.split(":")[0]]}${v.includes(":")?" ("+v.split(":")[1]+")":""}</small></button>`).join(""));
    el("r-skip").style.display="none";
    el("r-panel").querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{ panel(""); el("r-skip").style.display="block"; done(list[+b.dataset.v]); });
  });
}
function askYesNo(q,yes,no){ return new Promise(done=>{ panel(`<div style="flex-basis:100%;font-size:13px">${q}</div><button class="rb" id="yn-y">${yes}</button><button class="rb" id="yn-n">${no}</button>`); el("r-skip").style.display="none";
  el("yn-y").onclick=()=>{ panel(""); el("r-skip").style.display="block"; done(true); }; el("yn-n").onclick=()=>{ panel(""); el("r-skip").style.display="block"; done(false); }; }); }
function stageGrid(s){
  if(s.stage==="Bit") return s.m.grid;
  let G=addMark(s.m.grid,s.mark);
  if(s.stage==="Mega"){ G=addMark(G,s.mark2,true); }
  if(s.variant==="Champion"){ let ty=20; for(let y=0;y<20;y++) for(let x=0;x<20;x++) if(G[y][x]===1) ty=Math.min(ty,y); if(ty>=2){ G[ty-1][9]=G[ty-1][10]=11; G[ty-2][8]=G[ty-2][11]=11; } }
  return scale2x(G);
}
function variantPal(s){
  const p={...s.m.pal}, v=s.variant;
  if(v==="Feral"){ p.outline=[0,0,0]; p.dark=[20,10,10]; }
  if(v==="Devoted") p.outline=tone(p.body,0.45,-0.3);
  if(v==="Moonlit"){ p.body=mix(p.body,[60,70,140],0.45); p.parts=mix(p.parts,[90,100,170],0.4); p.pupil=[210,220,240]; }
  if(v&&v.startsWith("Wanderer")&&s.wanderEl){ const c=hexOf(COL[Object.keys(EL).find(k=>EL[k]===s.wanderEl)]||"#ffffff"); p.accent=c; p.parts=mix(p.parts,c,0.5); }
  if(v==="Pampered") p.glint=[255,255,255];
  return p;
}
const hexOf=h=>[1,3,5].map(k=>parseInt(h.slice(k,k+2),16));
function rebuildLook(s){ s.grid=stageGrid(s); s.pal=variantPal(s); s.P=makePuppet(s.grid,s.stage!=="Bit",s.m.family,s.stage==="Mega"?3:null); }
async function evolveNow(){
  const s=RS, to=s.stage==="Bit"?"Byte":"Mega";
  banner("");
  say("Something's happening to it!"); s.pose="idle"; await walkTo(130,40); s.pose="idle"; await rwait(600);
  const order=s.tp.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]||(b[1]===s.lastTrained)-(a[1]===s.lastTrained));
  const vs=variantsMet(s); let variant=await pickVariant(vs);
  const oldP=s.P, old={stage:s.stage,mark:s.mark,mark2:s.mark2,variant:s.variant};
  if(to==="Byte") s.mark=topMark(); else s.mark2=order.find(x=>x[1]!==s.mark)[1];
  s.stage=to; if(typeof musJingle==="function") musJingle("evo");
  if(variant){ s.variant=variant.split(":")[0];
    if(variant.startsWith("Wanderer")){ const reg=REGIONS.concat([{n:"The Rift",el:"Void"}]).find(r=>r.n===variant.split(":")[1]); s.wanderEl=reg.el;
      if(s.m.mono&&await askYesNo(`It roamed ${reg.n} so long it could take ${reg.el} as its second element. Should it?`,`Take ${reg.el}`,"Stay mono")){ s.m.el2=reg.el; s.m.mono=false; s.m.name=speciesName(s.m.family,s.m.el1,s.m.el2); } } }
  rebuildLook(s); const newP=s.P;
  for(let k=0;k<10;k++){ s.flash=99; s.P=k%2?newP:oldP; await rwait(Math.max(60,260-k*22)); }
  s.P=newP; s.flash=0; fixEquip(s); s.messSpots=s.messSpots.map(p=>({x:Math.min(39,p.x*(old.stage==="Bit"?2:1)),y:Math.min(39,p.y*(old.stage==="Bit"?2:1))}));
  s.stageRegions={}; s.stageCups=0; s.neglect=0; s.hinted=false;
  spark(s.x,headY()+10,"sparkle",16); s.pose="happy"; await hop(16,450); await rwait(600);
  banner(`${MARK[s.mark][0]} ${to}!`,"#ffd23f"); await rwait(1200); banner("");
  const markLine=to==="Byte"?`with ${MARK[s.mark][1]}. ${STATS[s.mark]} +5%.`:`adding ${MARK[s.mark2][1]}. ${STATS[s.mark]} +10% and ${STATS[s.mark2]} +5%.`;
  return `It evolved into ${displayName(s)}, ${markLine}${s.variant&&s.variant!==old.variant?` As a ${s.variant} it has ${VARIANT_TEXT[s.variant]}.`:""}`;
}
const topMark=()=>{const s=RS, top=s.tp.indexOf(Math.max(...s.tp)); return s.tp.filter(v=>v===s.tp[top]).length>1&&s.tp[s.lastTrained]===s.tp[top]?s.lastTrained:top;};

/* ---------- the end of a week ---------- */
async function endWeek(weeks,line){
  const s=RS; PLAYER.week+=Math.max(1,weeks); s.used+=weeks; clampAll();
  s.log=(s.log||[]).concat(Array(Math.max(1,weeks)).fill(s.weekAct||"Rest")).slice(-8); s.weekAct=null;
  let notes=[line];
  const strain=s.fatigue+2*s.stress;
  if(strain>=90){ s.used+=2; notes.push("It's under a lot of strain. That cost it 2 weeks of its prime."); }
  else if(strain>=70){ s.used+=1; notes.push("The strain cost it a week of its prime."); }
  s.strainRun=strain>=70?s.strainRun+1:0;
  if(s.sick) s.sick--;
  if(s.strainRun>=2&&!s.sick){ s.sick=1; s.strainRun=0; notes.push("It's caught a cold. No training next week unless it gets medicine."); }
  for(const it of Object.values(s.worn||{})){ const tz=it&&taste("item",it); if(!tz) continue; s.stress+=tz==="like"?-3:4;
    if(tasteFound(tz)) notes.push(tz==="like"?`It keeps admiring its ${it}. It loves wearing that.`:`It keeps tugging at the ${it}. It doesn't like wearing it.`); }
  const findP=(s.m.el1==="Wild"||s.m.el1==="Stone")?0.12:0.06;
  if(!s.sick&&Math.random()<findP){ const coins=Math.round(rnd(30,90)); PLAYER.bits+=coins; notes.push(`It dug up ${coins} bits in the yard.`); try{ s.pose="effort"; spark(s.x,GROUND-2,"dust",6); await rwait(500); spark(s.x,GROUND-10,"sparkle",5); }catch(e){} }
  // the week's events
  const season=Math.floor((PLAYER.week%48)/12), W=[["Rain",["Tide","Wild"]],["A heatwave",["Blaze","Light"]],["Wind",["Spark","Charm"]],["Snow",["Frost","Steel"]]][season];
  s.weather=Math.random()<0.3?W[0]:null; s.weatherBonus=!!s.weather&&W[1].includes(s.m.el1);
  if(s.weatherBonus) notes.push(`${W[0]} is coming, and ${s.m.el1} monsters love it, so drills will go better next week.`);
  if(Math.random()<0.05){ const v=randomOpponent(Math.random); s.visitor={m:v,x:RW+20,until:performance.now()+9000}; s.stress-=10; notes.push(`A wild ${v.name} wandered in, and they played until sundown.`); }
  if(PLAYER.week>s.born&&(PLAYER.week-s.born)%52===0){ const g=COMMON_FINDS[Math.floor(Math.random()*COMMON_FINDS.length)]; addItem(g); s.spoil+=5; notes.push(`It's its birthday! There was cake, and a ${g} as a present.`); }
  { const mo=Math.floor(PLAYER.week/4)%12, wk=PLAYER.week%4; if(mo%3===2&&wk===2){ const r=gradedOpponent(s.grade,s.level+1,Math.random); notes.push(`Your rival dropped by with a ${r.m.name} to show off before the official cup. It's a ${r.m.el1} monster, so plan for that.`); } }
  notes.push(condition());
  if(s.stress>50) notes.push("It seems tense lately, maybe give it a rest.");
  if(s.petWeek!==PLAYER.week-1&&s.playWeek!==PLAYER.week-1) s.neglect=(s.neglect||0)+1;
  if(s.variant==="Scruffy"){ s.cleanRun=(s.petWeek===PLAYER.week-1||s.playWeek===PLAYER.week-1)?(s.cleanRun||0)+1:0; if(s.cleanRun>=4){ s.variant=null; notes.push("It's groomed itself back to looking smart."); } }
  if(s.stage!=="Mega"){
    if(evoReady()){ say(notes.filter(Boolean).join(" ")); drawUI(); await rwait(1400); notes=[await evolveNow()]; }
    else if(!s.hinted&&tpTotal()>=evoTotal()-10){ s.hinted=true; notes.push(MARK_HINT[s.stage==="Bit"?topMark():s.tp.map((v,i)=>[v,i]).filter(x=>x[1]!==s.mark).sort((a,b)=>b[0]-a[0])[0][1]]); }
  }
  const past=s.used-lifeWeeks();
  if(past>=0&&past<weeks) notes.push("It's reached the end of its lifespan. It's a veteran now. It still fights as hard as ever, but training barely changes it.");
  say(notes.filter(Boolean).join(" ")); drawUI(); saveGame();
}
/* ---------- ordinary life: what it does on its own ---------- */
async function idleTick(){
  const s=RS; if(!s||!s.open||s.busy||s.idling||s.rub||s.dead||s.away||s.visit) return;
  s.idling=true; const id=s.cur=++RACT;
  try{
    if(s.injured){ s.pose="tired"; await rwait(2500,id); }
    else if(s.fatigue>75){ s.pose="sleep"; for(let k=0;k<4;k++){ spark(s.x+6,headY(),"z"); await rwait(700,id);} }
    else if(s.fatigue>50){ s.pose="tired"; await rwait(2500,id); }
    else if(s.stress>45){ for(let k=0;k<2;k++){ await walkTo(clamp(s.x+40,95,215),55,"walk",id); await walkTo(clamp(s.x-40,95,215),55,"walk",id);} }
    else if(scared()&&!inBarn()){ s.behind=true; await walkTo(smoothRanch()?HUTX()+70:40,40,"walk",id); s.pose="idle"; await rwait(3000,id); }
    else if(spoiled()&&s.ptrX!=null&&performance.now()-s.ptrT<4000){ await walkTo(clamp(s.ptrX,90,220),60,"walk",id); s.pose="happy"; await rwait(600,id); }
    else if(inBarn()){ const r=Math.random();
      if(r<0.4){ await walkTo(rnd(90,160),35,"walk",id); s.pose="idle"; await rwait(rnd(1500,3000),id); }
      else if(r<0.6){ await walkTo(118,35,"walk",id); s.pose="sit"; await rwait(2500,id); }
      else if(r<0.8){ await walkTo(84,40,"walk",id); s.pose="happy"; await hop(12,360,id); await rwait(600,id); }
      else { await walkTo(202,35,"walk",id); s.pose="sleep"; for(let k=0;k<3;k++){ spark(s.x+8,headY(),"z"); await rwait(700,id);} } }
    else { s.behind=false; const r=Math.random();
      if(r<0.45){ await walkTo(rnd(70,185),35,"walk",id); s.pose="idle"; await rwait(rnd(1500,3000),id); }
      else if(r<0.6){ await walkTo(BOWLX+RS.P.scale*7,35,"walk",id); s.pose="sit"; await rwait(2200,id); }
      else if(r<0.8){ const bug={k:"bug",x:rnd(110,210),y:GROUND-rnd(14,26),t:0}; prop(bug); await walkTo(bug.x,70,"run",id); s.pose="happy"; await hop(14,380,id); unprop(bug); await rwait(500,id); }
      else { s.pose="effort"; for(let k=0;k<5;k++){ spark(s.x+s.dir*6,GROUND-1,"dust"); await rwait(200,id);} s.pose="idle"; await rwait(800,id); }
    }
    if(id===RACT) s.pose="idle";
  }catch(e){ s.props=s.props.filter(p=>p.k!=="bug"); }
  s.idling=false;
}

/* ---------- touch: rub to pet, wipe to clean, and a Spoiled monster follows the finger ---------- */
function RS_bindPointer(cv){
  const raw=e=>{const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height];};
  const pos=e=>{ const [sx,sy]=raw(e); if(RS.cam){ const {L,Z,extra}=RS.cam; return [sx/Z+L-(RS.zx||0),(sy-GROUND-extra)/Z+GROUND]; }
    const camX=Math.round(clamp(RS.camX||0,0,RW-cv.width)); return [sx+camX,sy-(cv.height-RH)]; };
  cv.addEventListener("pointerdown",e=>{ const s=RS; if(!s) return; const [x,y]=pos(e); s.ptrX=x; s.ptrT=performance.now();
    const b=s.bbox, onMon=!s.busy&&b&&x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3];
    if(!onMon&&s.cam){ s.pan={x0:raw(e)[0],L0:s.camL,x,y,moved:0}; s.panL=s.camL; cv.setPointerCapture(e.pointerId); return; }
    if(!onMon) return;
    s.cur=++RACT; s.idling=false; s.rub={x,y,d:0,beats:0}; s.pose=scared()?"hurt":"lean"; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove",e=>{ const s=RS; if(!s) return;
    if(s.pan&&s.cam){ const dx=raw(e)[0]-s.pan.x0; s.pan.moved=Math.max(s.pan.moved,Math.abs(dx)); s.panL=s.pan.L0-dx/s.cam.Z; return; }
    const [x,y]=pos(e); s.ptrX=x; s.ptrT=performance.now(); if(!s.rub) return;
    s.rub.d+=Math.hypot(x-s.rub.x,y-s.rub.y); s.rub.x=x; s.rub.y=y; s.pose="lean";
    while(s.rub.d>28){ s.rub.d-=28; s.rub.beats++;
      if(s.mess>0){ s.mess=Math.max(0,s.mess-12); spark(x,y,"sparkle"); if(!s.mess){ say("Squeaky clean."); drawUI(); } }
      else { spark(x,y-4,"heart"); if(s.rub.beats===5) petOnce(); } } });
  const up=()=>{ const s=RS; if(s&&s.pan){ const P=s.pan; s.pan=null;
      if(P.moved<4&&typeof barnTap==="function"&&smoothRanch()&&barnTap(P.x,P.y)) s.panUntil=0; else s.panUntil=performance.now()+2500; } if(s&&s.rub){ s.rub=null; s.pose="idle"; } };
  cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
}

/* ---------- drawing ---------- */
const FC=document.createElement("canvas");
const BMP={heart:["01010","11111","11111","01110","00100"],z:["1111","0010","0100","1111"],star:["010","111","010"],q:["0110","1001","0010","0100","0000","0100"],bulb:["0110","1111","1111","0110","0110"]};
const BMP_COL={heart:"#ff5d82",z:"#dfe8ff",star:"#ffe14d",q:"#ffffff",bulb:"#fff27a"};
function bmp(c,b,x,y,col){ c.fillStyle=col; b.forEach((row,j)=>{for(let i=0;i<row.length;i++) if(row[i]==="1") c.fillRect(Math.round(x)+i,Math.round(y)+j,1,1);}); }
function poseOf(t){
  const s=RS, o={legL:0,legR:0,armL:0,armR:0,topX:0,face:"open",mouth:false,bx:s.bx,by:0,kx:shapeOf(s.weight)[2]*(s.stage!=="Bit"&&s.mark===0?1.08:1)*({Bulky:1.12,Lean:0.9,Pampered:1.05}[s.variant]||1),ky:1};
  const blink=(t%3800)<150, tiredFace=s.fatigue>50;
  switch(s.pose){
    case "idle": o.by=Math.floor(t/520)%2; o.topX=Math.round(Math.sin(t/700)*0.7); o.face=blink?"shut":tiredFace?"tired":"open"; break;
    case "walk": case "run": { const ph=Math.floor(t/(s.pose==="run"?90:170))%2; o.legL=ph?-1:0; o.legR=ph?0:-1; o.armL=ph?-1:0; o.armR=ph?0:-1; o.by=ph?-1:0; o.bx+=s.dir; o.face=blink?"shut":"open"; break; }
    case "happy": { const ph=Math.sin((t%500)/500*Math.PI); o.by=s.jy?0:-Math.round(ph*3); o.ky=ph<0.2?0.88:1; o.face="happy"; o.armL=o.armR=-1; break; }
    case "tired": o.by=1; o.ky=0.92; o.face="tired"; break;
    case "sad": o.by=1; o.ky=0.86; o.face="tired"; break;
    case "sit": o.by=1; o.ky=0.9; o.face=blink?"shut":"open"; break;
    case "effort": o.ky=0.88; o.bx+=Math.floor(t/60)%2?1:-1; o.face="shut"; o.armL=o.armR=-1;
      if(Math.random()<0.04) spark(s.x+rnd(-10,10),headY()+4,elFx()); break;
    case "guard": o.ky=0.9; o.armL=o.armR=-1; o.face=blink?"shut":"open"; break;
    case "sleep": o.face="shut"; o.by=1; o.ky=Math.floor(t/900)%2?0.92:0.97; break;
    case "eat": o.mouth=Math.floor(t/150)%2===0; o.by=o.mouth?1:0; o.face="happy"; break;
    case "hurt": o.bx+=Math.floor(t/50)%2?2:-2; o.face="shut"; break;
    case "dizzy": o.face="dizzy"; o.bx+=Math.round(Math.sin(t/110)*2); if(Math.random()<0.05) spark(s.x,headY()-4,"star"); break;
    case "float": o.by=-4+Math.round(Math.sin(t/300)*1.5); o.face="shut"; break;
    case "lean": o.bx+=Math.round(Math.sin(t/200)*1.5); o.ky=0.94; o.face="happy"; break;
  }
  return o;
}
function elFx(){ const e=RS.m.el1; return e==="Blaze"?"smoke":e==="Tide"?"drip":e==="Spark"?"zap":e==="Frost"?"flake":e==="Wild"?"leaf":"sweat"; }
function rLoop(t){
  if(!RS||!RS.open){ requestAnimationFrame(rLoop); return; }
  const s=RS, cv=el("r-canvas");
  // the scene keeps its width and gets taller or shorter with the room it has: extra height is sky, less height trims the sky
  // the scene fills its box: a short box trims sky, a tall box zooms in and follows the monster
  const vr=el("r-view").getBoundingClientRect(), asp=vr.width>0&&vr.height>0?vr.width/vr.height:RW/RH;
  const tall=RW/asp>RH+40, wantH=tall?RH+24:Math.max(100,Math.round(RW/asp)), wantW=tall?Math.min(RW,Math.round(wantH*asp)):RW;
  if(cv.height!==wantH) cv.height=wantH; if(cv.width!==wantW) cv.width=wantW;
  const c=cv.getContext("2d"); c.imageSmoothingEnabled=false;
  const k=rk(), extra=cv.height-RH, room=RW-cv.width; s.vExtra=extra;
  // with the smooth art on, the yard draws on its own layer underneath and this canvas only carries props and effects
  const smooth=smoothRanch(); if(smooth) c.clearRect(0,0,cv.width,cv.height);
  else { s.cam=null; const sc=el("r-scene"); if(sc) sc.style.display="none"; const ch=el("r-chibi"); if(ch) ch.style.filter=""; }
  { const go=el("r-goout"); if(go){ const on=smooth&&s.room==="barn"&&!s.busy; if(go.style.display!==(on?"block":"none")) go.style.display=on?"block":"none"; } }
  if(smooth){   // the side-scrolling ranch: the camera follows the monster, zooms in on small ones, and can be dragged to look around
    const sp=chibiSpec(null,s), hpx=sp?sp.cm/100*RANCH_PX_M:60, wide=s.bg==='shop'||s.bg==='lab'||s.props.some(p=>p.k==='npc'), Zt=wide?1:clamp(66/hpx,1,s.bg?1.3:1.8);   /* away scenes stay wide so their props show */ s.zoom=s.zoom?s.zoom+(Zt-s.zoom)*0.05:Zt;
    const Z=s.zoom, vw=cv.width/Z, wx=s.x+(s.zx||0), panning=s.pan||(s.panUntil&&performance.now()<s.panUntil);
    const one=s.room||s.bg, lo=one?0:-RW, hi=Math.max(lo,(one?RW:2*RW)-vw), Lt=clamp(panning?s.panL:wx-vw/2,lo,hi); s.camL=s.camL==null||s.camJump?Lt:s.camL+(Lt-s.camL)*(s.pan?1:0.08); s.camJump=false;
    s.cam={L:s.camL,Z,extra}; }
  const camT=clamp(s.x-cv.width/2,0,room); s.camX=s.camX==null?camT:s.camX+(camT-s.camX)*0.08; const camX=Math.round(clamp(s.camX,0,room));
  c.save(); if(smooth) c.setTransform(s.zoom,0,0,s.zoom,(-s.camL+(s.zx||0))*s.zoom,GROUND+extra-GROUND*s.zoom); else c.translate(-camX,extra); if(s.shake>0){ c.translate(Math.round(rnd(-2,2)),Math.round(rnd(-2,2))); s.shake--; }
  if(!(smooth&&chibiYard(s,t,cv))) drawYard(c,t);
  // props physics
  for(const p of s.props){ if(p.vx!==undefined){ p.x+=p.vx*k; p.y+=(p.vy||0)*k; p.vy=(p.vy||0)+(p.g||0)*k;
      if(p.bounce&&p.y>GROUND-3){ p.y=GROUND-3; p.vy*=-0.45; p.vx*=0.7; } if(p.k==="boulder") p.rot+=p.vx*0.09*k; }
    if(p.k==="bug"){ p.t+=k; p.x+=Math.sin(p.t/9)*0.6; p.y+=Math.cos(p.t/7)*0.4; } }
  if(s.behind) drawMonster(c,t);
  if(!s.bg&&!smooth) drawHut(c);
  if(!smooth) drawProps(c,t,false);
  if(s.visitor){ const v=s.visitor; if(performance.now()>v.until){ v.x+=0.6; if(v.x>RW+40) s.visitor=null; } else v.x=Math.max(RW-22,v.x-0.6);
    if(s.visitor&&!smooth){ if(!v.cv){ v.cv=document.createElement("canvas"); paint(v.cv,v.m.grid,v.m.pal,2); } c.drawImage(v.cv,Math.round(v.x-20),GROUND-40+(Math.floor(t/300)%2)); } }
  if(!s.behind) drawMonster(c,t);
  if(smooth){ c.save(); c.setTransform(1,0,0,1,0,extra); if(s.room||s.bg) c.globalAlpha=0; }
  if(s.weather==="Rain"&&!s.bg){ c.fillStyle="rgba(170,200,255,.7)"; for(let i=0;i<40;i++){ const x=(i*29+t/3)%RW, y=(i*47+t/2)%GROUND; c.fillRect(Math.round(x),Math.round(y),1,3);} }
  if(s.weather==="Wind"&&!s.bg){ c.fillStyle="#d9822b"; for(let i=0;i<8;i++){ const x=(i*61+t/8)%RW, y=60+(i*23)%70+Math.sin(t/300+i)*6; c.fillRect(Math.round(x),Math.round(y),2,1);} }
  if(s.weather==="A heatwave"&&!s.bg){ c.fillStyle="rgba(255,180,60,.12)"; c.fillRect(0,0,RW,RH); }
  if(smooth) c.restore();
  if(!smooth) drawProps(c,t,true);
  // particles
  s.parts=s.parts.filter(p=>p.life<p.max);
  for(const p of s.parts){ p.life+=k; p.x+=p.vx*k; p.y+=p.vy*k; p.vy+=p.g*k; if(p.kind==="z"){p.vx=Math.sin(p.life/8)*0.3;p.vy=-0.4;} if(p.kind==="heart") p.vy=-0.5; if(p.kind==="smoke") p.vy=-0.4; if(smooth) continue;
    const a=1-p.life/p.max; c.globalAlpha=Math.max(0,Math.min(1,a*1.6));
    if(BMP[p.kind]){ if(p.kind==="z"){p.vx=Math.sin(p.life/8)*0.3;p.vy=-0.4;} if(p.kind==="heart"){p.vy=-0.5;} bmp(c,BMP[p.kind],p.x-2,p.y-2,BMP_COL[p.kind]); }
    else { const col={dust:"#d9c8a8",crumb:"#e8c070",sweat:"#9fd8ff",sparkle:"#ffffff",smoke:"#7a7a80",drip:"#4aa3ff",zap:"#ffe14d",flake:"#ffffff",leaf:"#5fc46a"}[p.kind]||"#fff";
      c.fillStyle=col; const sz=p.kind==="smoke"?3:p.kind==="dust"?2:1; if(p.kind==="smoke"){p.vy=-0.4;} c.fillRect(Math.round(p.x),Math.round(p.y),sz,sz); if(p.kind==="sparkle"&&p.life%8<4){c.fillRect(Math.round(p.x)-1,Math.round(p.y),3,1);c.fillRect(Math.round(p.x),Math.round(p.y)-1,1,3);} }
    c.globalAlpha=1; }
  const h=ranchHour(); if(!smooth&&(h<6||h>=19)){ c.fillStyle="rgba(20,24,70,.28)"; c.fillRect(0,-Math.max(0,extra),RW,RH+Math.max(0,extra)); }
  c.restore();
  if(extra>0&&!smooth) c.drawImage(cv,0,extra,cv.width,1,0,0,cv.width,extra);
  requestAnimationFrame(rLoop);
}
function drawMonster(c,t){
  const s=RS; if(typeof chibiRanch==="function"&&chibiRanch(s,t)) return; if(s.hidden) return;
  if(!s.busy){ const half=s.P.N*0.42*s.P.scale; s.x=clamp(s.x,half+10,RW-half-12); }
  const o=poseOf(t), P=s.P, sc=P.scale, F=buildFrame(P,o);
  paintFrame(FC,F,s.pal||s.m.pal,sc,P.big,s.flash>0); if(s.flash>0&&s.flash<99) s.flash--;
  const w=FC.width, hgt=FC.height, baseY=(P.base+P.pad+1)*sc;
  const dx=Math.round(s.x-w/2+o.bx*sc), dy=Math.round(GROUND-baseY+o.by*sc-s.jy);
  // shadow
  const bw=(P.N*0.6)*sc*(o.kx||1); c.fillStyle="rgba(0,0,0,.22)"; c.fillRect(Math.round(s.x-bw/2),GROUND-1,Math.round(bw),3);
  if(s.ghosts){ s.trail.push([dx,dy]); if(s.trail.length>4) s.trail.shift(); c.globalAlpha=0.25; for(const [gx,gy] of s.trail.slice(0,-1)) c.drawImage(FC,gx-6,gy); c.globalAlpha=1; } else s.trail=[];
  if(s.upside){ c.save(); const vis=(P.base-P.topY+1)*sc; c.translate(dx+w/2,GROUND-vis/2); c.scale(1,-1); c.drawImage(FC,-w/2,-(P.base+P.pad+1)*sc+vis/2); c.restore(); }
  else { c.drawImage(FC,dx,dy); if(typeof drawWorn==="function") drawWorn(c,s,dx,dy,o); }
  if(s.injured&&!s.upside){ const hx=Math.round(s.x+P.N*sc*0.15), hy=Math.round(dy+(P.topY+P.pad+1)*sc+o.by*0); c.fillStyle="#fff"; c.fillRect(hx-3,hy,7,3); c.fillRect(hx-1,hy-2,3,7); c.fillStyle="#e2483f"; c.fillRect(hx,hy+1,1,1); }
  s.bbox=[dx+P.pad*sc,dy+(P.topY+P.pad)*sc,dx+w-P.pad*sc,dy+baseY];
}
function drawYard(c,t){
  if(RS.bg&&typeof drawBg==="function"){ drawBg(c,t); return; }
  const s=RS, season=Math.floor((PLAYER.week%48)/12), h=ranchHour();
  const night=h<6||h>=19, dusk=h>=17&&h<19;
  const sky=night?["#0f1430","#1a2150","#27306a"]:dusk?["#f08a5d","#f6b07a","#ffd6a5"]:["#6fbbef","#97d0f5","#c4e7ff"];
  for(let i=0;i<3;i++){ c.fillStyle=sky[i]; c.fillRect(0,i*30,RW,i===2?100:30); }
  if(night){ c.fillStyle="#fff"; for(let i=0;i<24;i++){ const x=(i*53)%RW, y=(i*29)%70; if((t/600+i)%7>0.6) c.fillRect(x,y,1,1);} const sy=Math.max(14,8-(RS.vExtra||0)); if(sy<60){ c.fillStyle="#f4f1d0"; c.fillRect(200,sy,9,9); } c.fillStyle="#0f1430"; c.fillRect(204,13,7,7); }
  else { const sy=Math.max(14,8-(RS.vExtra||0)); if(sy<60){ c.fillStyle=dusk?"#ffb347":"#fff3a0"; c.fillRect(196,sy,12,12); } }
  // hills
  c.fillStyle=SEASON_COL.hill[season]; for(let x=0;x<RW;x++){ const y=Math.round(104+Math.sin(x/23)*6+Math.sin(x/9)*2); c.fillRect(x,y,1,GROUND-y); }
  // ground
  c.fillStyle=SEASON_COL.ground[season]; c.fillRect(0,GROUND-14,RW,RH-GROUND+14);
  c.fillStyle="rgba(0,0,0,.08)"; for(let i=0;i<30;i++){ const x=(i*37)%RW, y=GROUND-10+(i*13)%34; c.fillRect(x,y,2,1); c.fillRect(x+1,y-1,1,1); }
  // fence
  c.fillStyle="#b88b5a"; c.fillRect(80,GROUND-30,160,2); c.fillRect(80,GROUND-22,160,2); for(let x=84;x<RW;x+=16) c.fillRect(x,GROUND-34,3,22);
  // tree
  c.fillStyle="#6b4428"; c.fillRect(214,GROUND-48,6,38);
  const leaf=SEASON_COL.leaf[season];
  if(leaf){ c.fillStyle=leaf; for(let j=-10;j<=10;j++){ const w=Math.round(Math.sqrt(100-j*j)*1.4); c.fillRect(217-w,GROUND-62+j,w*2,1);} if(season===0){ c.fillStyle="#ffc2dc"; for(const [bx,by] of [[205,-68],[212,-60],[221,-69],[228,-58],[208,-55],[217,-64],[225,-52],[203,-60],[214,-71],[230,-63]]) c.fillRect(bx,GROUND+by,2,2);} }
  else { c.fillStyle="#6b4428"; c.fillRect(206,GROUND-60,10,2); c.fillRect(218,GROUND-66,10,2); c.fillStyle="#fff"; c.fillRect(206,GROUND-61,10,1); c.fillRect(218,GROUND-67,10,1); }
  if(season===3){ c.fillStyle="#fff"; for(let i=0;i<20;i++){ const x=(i*41+t/40)%RW, y=(i*23+t/25)%GROUND; c.fillRect(Math.round(x),Math.round(y),1,1);} }
  // assistant
  const ax=HELPX, ay=GROUND; c.fillStyle="#2b2b33"; c.fillRect(ax+1,ay-7,2,7); c.fillRect(ax+5,ay-7,2,7);
  c.fillStyle="#3a7bd5"; c.fillRect(ax,ay-16,8,9); c.fillStyle="#f1c27d"; c.fillRect(ax+1,ay-23,6,7); c.fillStyle="#4a2c1a"; c.fillRect(ax+1,ay-24,6,2); c.fillRect(ax,ay-23,1,3);
  c.fillStyle="#222"; c.fillRect(ax+4,ay-20,1,1); c.fillRect(ax+6,ay-20,1,1);
}
function drawHut(c){
  const x=4,w=40,top=GROUND-40;
  c.fillStyle="#a0663b"; c.fillRect(x,top+12,w,28);
  c.fillStyle="#8a5532"; for(let y=top+16;y<GROUND;y+=6) c.fillRect(x,y,w,1);
  c.fillStyle="#7a3b2a"; for(let j=0;j<14;j++) c.fillRect(x-3+j,top+12-j,w+6-j*2,1);
  c.fillStyle="#3a2418"; c.fillRect(x+14,top+22,12,18);
  if(RS.hidden){ c.fillStyle="#5a3a28"; c.fillRect(x+16,top+26,8,6); }
  // bowl
  c.fillStyle="#d14f3c"; c.fillRect(BOWLX,GROUND-4,12,4); c.fillRect(BOWLX+1,GROUND-1,10,1);
  const bowl=RS.props.find(p=>p.k==="bowl"); if(bowl&&bowl.food){ c.fillStyle=bowl.food; c.fillRect(BOWLX+1,GROUND-6,10,2); }
}
function drawProps(c,t,front){
  for(const p of RS.props){
    if(typeof drawProp2==="function"&&drawProp2(c,p,t,front)) continue;
    if(p.k==="boulder"&&!front){ const r=p.r; for(let j=-r;j<=r;j++){ const w=Math.round(Math.sqrt(r*r-j*j)); for(let i=-w;i<=w;i++){ const sh=((i*Math.cos(p.rot)-j*Math.sin(p.rot))>3)?"#6f6a64":(j<-4?"#b8b2aa":"#958f88"); c.fillStyle=sh; c.fillRect(Math.round(p.x)+i,Math.round(p.y)-r+j,1,1);} } }
    if(p.k==="box"&&!front){ c.fillStyle="#b07a45"; c.fillRect(Math.round(p.x)-6,Math.round(p.y)-10,12,10); c.fillStyle="#7a5230"; c.fillRect(Math.round(p.x)-6,Math.round(p.y)-10,12,1); c.fillRect(Math.round(p.x)-1,Math.round(p.y)-9,2,9);
      if(p.open){ c.fillStyle="#b07a45"; c.fillRect(Math.round(p.x)-7,Math.round(p.y)-16,3,7); } else { c.fillStyle="#d79a5a"; c.fillRect(Math.round(p.x)-7,Math.round(p.y)-12,14,2);} }
    if(front&&(p.k==="ball"||p.k==="snack")){ c.fillStyle=p.c; c.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,4,4); c.fillStyle="rgba(255,255,255,.6)"; c.fillRect(Math.round(p.x)-1,Math.round(p.y)-2,1,1); }
    if(front&&p.k==="ring"){ c.strokeStyle="rgba(255,240,160,"+(1-p.r/28)+")"; c.lineWidth=1; for(let a=0;a<64;a++){ const x=Math.round(p.x+Math.cos(a/64*6.283)*p.r), y=Math.round(p.y+Math.sin(a/64*6.283)*p.r*0.5); c.fillStyle=c.strokeStyle; c.fillRect(x,y,1,1);} }
    if(front&&p.k==="bug"){ c.fillStyle="#2a2a2a"; c.fillRect(Math.round(p.x),Math.round(p.y),2,1); c.fillStyle=(Math.floor(t/80)%2)?"#ffffff":"#cfe8ff"; c.fillRect(Math.round(p.x)-1,Math.round(p.y)-1,1,1); c.fillRect(Math.round(p.x)+2,Math.round(p.y)-1,1,1); }
  }
}
