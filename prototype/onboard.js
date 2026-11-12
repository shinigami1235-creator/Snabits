/* Title screen, intro and the first Snaboscope trip: Tala, who needs help on her ranch, offers the player the job in
   town, the player scans as many things as they like, keeps 1 and walks it to the ranch. A returning player taps Continue and lands back at the ranch.
   Needs monster.js, battle.js, game.js and ranch.js, plus the scan code in index.html. */
let ONB=null;
const OB_W=96, OB_H=64;

/* ---------- small pixel scene kit ---------- */
const obSmooth=()=>typeof CHIBI_ART!=="undefined"&&CHIBI_ART&&typeof OB_SMOOTH!=="undefined";
function obCtx(cv){
  if(obSmooth()){ const d=devicePixelRatio||1, w=Math.round((cv.clientWidth||288)*d); cv.width=w; cv.height=Math.round(w*OB_H/OB_W); cv.style.imageRendering="auto"; return cv.getContext("2d"); }
  cv.width=OB_W; cv.height=OB_H; const c=cv.getContext("2d"); c.imageSmoothingEnabled=false; return c; }
const obR=(c,x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(Math.round(x),Math.round(y),w,h); };
function obSky(c,cols,ground){ const band=Math.ceil(ground/cols.length); cols.forEach((k,i)=>obR(c,0,i*band,OB_W,band,k)); }
function obGround(c,y,col,dots){ obR(c,0,y,OB_W,OB_H-y,col); for(let i=0;i<40;i++){ const x=(i*37)%OB_W, yy=y+2+((i*13)%(OB_H-y-2)); obR(c,x,yy,1,1,dots); } }
function obSun(c,x,y){ obR(c,x-3,y-2,7,5,"#ffe08a"); obR(c,x-2,y-3,5,7,"#ffe08a"); obR(c,x-1,y-1,3,3,"#fff3c4"); }
function obCloud(c,x,y){ obR(c,x,y,12,3,"#ffffff"); obR(c,x+3,y-2,6,2,"#ffffff"); obR(c,x+1,y+3,10,1,"#dfe8f5"); }
/* A pair of eyes peeking out of something. They blink shut now and then. */
function obEyes(c,x,y,t,phase){ if(Math.floor(t/400+phase)%7===0) { obR(c,x,y+1,2,1,"#222"); obR(c,x+3,y+1,2,1,"#222"); return; }
  obR(c,x,y,2,2,"#fff"); obR(c,x+3,y,2,2,"#fff"); obR(c,x+1,y+1,1,1,"#1b1b1f"); obR(c,x+4,y+1,1,1,"#1b1b1f"); }
function obMailbox(c,x,g){ obR(c,x+3,g-10,2,10,"#6b4226"); obR(c,x,g-16,8,6,"#d8432f"); obR(c,x,g-11,8,1,"#9c2a1d"); obR(c,x+7,g-19,1,5,"#3a3a44"); obR(c,x+7,g-19,3,2,"#f2cf2b"); obR(c,x+1,g-14,6,1,"#3b1510"); }
function obTree(c,x,g){ obR(c,x+5,g-12,4,12,"#6b4226"); obR(c,x,g-24,14,10,"#3f9a46"); obR(c,x+2,g-28,10,4,"#3f9a46"); obR(c,x+1,g-23,4,3,"#5cbf5a"); obR(c,x,g-15,14,2,"#2f7a38"); }
function obBush(c,x,g){ obR(c,x,g-7,14,7,"#3f9a46"); obR(c,x+2,g-9,10,2,"#3f9a46"); [[2,-6],[7,-8],[11,-5],[4,-3],[9,-3]].forEach(([dx,dy])=>{ obR(c,x+dx,g+dy,2,2,"#f07ab4"); obR(c,x+dx,g+dy,1,1,"#ffd0e6"); }); }
function obHouse(c,x,g,wall,roof){ obR(c,x,g-14,18,14,wall); obR(c,x-2,g-17,22,3,roof); obR(c,x+1,g-20,16,3,roof); obR(c,x+4,g-23,10,3,roof);
  obR(c,x+3,g-11,4,4,"#ffe9a8"); obR(c,x+11,g-11,4,4,"#ffe9a8"); obR(c,x+7,g-7,4,7,"#6b4226"); obR(c,x+10,g-4,1,1,"#f2cf2b"); }
function obBarn(c,x,g){ obR(c,x,g-16,22,16,"#c0392b"); obR(c,x-2,g-19,26,3,"#7a2418"); obR(c,x+2,g-22,18,3,"#7a2418"); obR(c,x+6,g-25,10,3,"#7a2418");
  obR(c,x+7,g-11,8,11,"#f4ead2"); obR(c,x+8,g-10,6,10,"#8a3324"); obR(c,x+8,g-10,6,1,"#f4ead2"); obR(c,x+9,g-21,4,3,"#f4ead2"); }
function obFence(c,x0,x1,g){ for(let x=x0;x<x1;x+=5) obR(c,x,g-6,2,6,"#e8d5a8"); obR(c,x0,g-5,x1-x0,1,"#e8d5a8"); obR(c,x0,g-3,x1-x0,1,"#e8d5a8"); }
/* Tala, the ranch assistant. y is her feet. */
function obTala(c,x,y,s,t,phone){
  const P=(dx,dy,w,h,col)=>obR(c,x+dx*s,y-20*s+dy*s,w*s,h*s,col), bob=Math.floor(t/500)%2;
  P(2,18,3,2,"#6b4226"); P(7,18,3,2,"#6b4226"); P(3,16,2,2,"#3b6fb5"); P(7,16,2,2,"#3b6fb5");
  P(2,8,8,4,"#4da86a"); P(3,10,6,6,"#3b6fb5"); P(3,8,1,2,"#3b6fb5"); P(8,8,1,2,"#3b6fb5"); P(5,11,2,1,"#2f5a96");
  P(1,8,1,5,"#4da86a"); P(1,13,1,1,"#f1c27d");
  if(phone){ P(10,7,1,4,"#4da86a"); P(10,5,2,2,"#f1c27d"); P(11,1,3,5,"#1d1f2a"); P(12,2,1,3,bob?"#ffc93c":"#5ab0ff"); }
  else { P(10,8,1,5,"#4da86a"); P(10,13,1,1,"#f1c27d"); }
  P(3,3,6,5,"#f1c27d"); P(2,3,8,1,"#5a3420"); P(2,4,1,4,"#5a3420"); P(9,4,1,4,"#5a3420");
  if(Math.floor(t/300)%13===0){ P(4,5,1,1,"#c99a60"); P(7,5,1,1,"#c99a60"); } else { P(4,5,1,1,"#2a1a10"); P(7,5,1,1,"#2a1a10"); }
  P(5,7,2,1,"#c0705a"); P(3,0,6,2,"#e8c35a"); P(3,1,6,1,"#c0392b"); P(1,2,10,1,"#c9a23e");
}
function obPhone(c,x,y,t){ obR(c,x,y,26,42,"#1d1f2a"); obR(c,x+2,y+4,22,32,"#2b3a55"); obR(c,x+10,y+38,6,2,"#3a3f55");
  obR(c,x+11,y+22,2,8,"#3f9a46"); obR(c,x+8,y+17,8,6,"#f07ab4"); obR(c,x+10,y+19,4,2,"#f2cf2b");
  const r=7+Math.floor(t/250)%2; c.strokeStyle="#ffc93c"; c.lineWidth=1; c.beginPath(); c.arc(x+13,y+20,r,0,Math.PI*2); c.stroke(); }
const obSpriteCache=new Map();
function obSprite(m,big){ const k=m.name+(big?"2":""); if(obSpriteCache.has(k)) return obSpriteCache.get(k);
  const cv=document.createElement("canvas"); paint(cv,big?scale2x(m.grid):m.grid,m.pal,1); obSpriteCache.set(k,cv); return cv; }
function obMon(c,m,x,y,t,big){ const b=Math.floor(t/500+x)%2; c.drawImage(obSprite(m,big),Math.round(x),Math.round(y-b)); }
function obSpark(c,x,y,t){ if(Math.floor(t/200)%3===0) return; obR(c,x,y-2,1,5,"#fff3c4"); obR(c,x-2,y,5,1,"#fff3c4"); }

/* ---------- scenes ---------- */
const OB_SCENES={
  title(c,t,mons){ obSky(c,["#3b4a8a","#5867a8","#7a86c2","#a9a3cf"],44); obSun(c,78,12); obCloud(c,10,10);
    obGround(c,44,"#4f9a4a","#3f7f3b"); obR(c,0,44,OB_W,2,"#6dbb62"); obBarn(c,6,44); obFence(c,30,96,44);
    mons.slice(0,3).forEach((m,i)=>obMon(c,m,32+i*20,40-18,t)); },
  hidden(c,t){ obSky(c,["#6fb3f0","#8ec6f5","#b2d8f8","#d3e9fb"],46); obSun(c,82,10); obCloud(c,8,8); obCloud(c,48,14);
    obGround(c,46,"#5cae54","#4a9444"); obR(c,0,46,OB_W,2,"#77c76a");
    obMailbox(c,10,52); obTree(c,38,52); obBush(c,70,54);
    obEyes(c,12,40,t,0); obEyes(c,43,32,t,2.5); obEyes(c,74,48,t,5); },
  scope(c,t,mons){ obSky(c,["#2a2f4a","#323859","#3b4268","#454d78"],OB_H); obR(c,0,52,OB_W,12,"#2a2f4a");
    obPhone(c,34,12,t);
    if(mons[0]) obMon(c,mons[0],64,10+Math.floor(t/600)%2,t); obSpark(c,62,8,t); obSpark(c,86,26,t+300); obSpark(c,58,30,t+600); },
  town(c,t){ obSky(c,["#f2a65a","#f5bc78","#f8d29a","#fbe6c2"],44); obSun(c,14,14); obCloud(c,60,8);
    obGround(c,44,"#b08a5a","#9a7548"); obR(c,0,44,OB_W,2,"#c9a372"); obR(c,0,54,OB_W,3,"#9a7548");
    obHouse(c,2,44,"#e8d5a8","#5a6fb5"); obHouse(c,28,44,"#f4ead2","#c0392b"); obHouse(c,70,44,"#d8e4c8","#3f7f3b");
    obTala(c,54,58,1,t,false); },
  handover(c,t){ obSky(c,["#f2a65a","#f5bc78","#f8d29a","#fbe6c2"],40); obGround(c,40,"#b08a5a","#9a7548");
    obHouse(c,-8,40,"#e8d5a8","#5a6fb5"); obHouse(c,76,40,"#d8e4c8","#3f7f3b"); obTala(c,36,62,2.5,t,true); },
  home(c,t,mons){ obSky(c,["#6fb3f0","#8ec6f5","#b2d8f8","#d3e9fb"],40); obSun(c,80,10); obCloud(c,14,8);
    obR(c,0,40,OB_W,24,"#5cae54"); obR(c,40,30,56,12,"#5cae54"); obR(c,40,30,56,1,"#77c76a"); obBarn(c,66,31); obFence(c,40,64,31);
    for(let i=0;i<12;i++) obR(c,10+i*4,62-i*2,6,2,"#c9a372");
    obTala(c,22,60,1,t,true); if(mons[0]) obMon(c,mons[0],32,42,t); },
};

/* ---------- screens ---------- */
function obRoot(){ let d=document.getElementById("ob"); if(!d){ d=document.createElement("div"); d.id="ob"; document.body.appendChild(d); } return d; }
let OB_LOOP=false;
function obLoop(){
  const cv=document.getElementById("ob-cv");
  if(!ONB||!ONB.scene||!cv||!shownOb()){ OB_LOOP=false; return; }
  if(obSmooth()&&OB_SMOOTH[ONB.scene]){ const d=devicePixelRatio||1; if(Math.abs(cv.width-Math.round(cv.clientWidth*d))>2) obCtx(cv);
    const c=cv.getContext("2d"), u=cv.width/OB_W; c.setTransform(u,0,0,u,0,0); c.clearRect(0,0,OB_W,OB_H); OB_SMOOTH[ONB.scene](c,performance.now(),ONB.mons||[]); }
  else { const c=cv.getContext("2d"); c.clearRect(0,0,OB_W,OB_H); OB_SCENES[ONB.scene](c,performance.now(),ONB.mons||[]); }
  requestAnimationFrame(obLoop);
}
const shownOb=()=>{ const d=document.getElementById("ob"); return !!d&&d.style.display!=="none"; };
function obScene(name){ ONB.scene=name; const cv=document.getElementById("ob-cv"); if(cv) obCtx(cv); if(!OB_LOOP){ OB_LOOP=true; requestAnimationFrame(obLoop); } }
function obShow(on){ obRoot().style.display=on?"flex":"none"; }

function showTitle(){
  if(!PLAYER) loadGame();
  const save=hasSave()&&PLAYER.roster.length>0;
  ONB={mons:[0,1,2].map(()=>randomOpponent(Math.random)),scene:null,picks:[],step:0};
  const ver=typeof APP_VER!=="undefined"&&APP_VER!=="__VER__"?APP_VER:"dev";
  obRoot().innerHTML=`<div class="ob-title"><div class="ob-frame"><canvas id="ob-cv"></canvas></div><h1>Snabits</h1>
    <p class="ob-tag">Monsters hide in colour. Your phone can find them.</p>
    <div class="ob-acts">${save?`<button class="big" id="ob-cont">Continue</button>`:""}<button class="${save?"btn2":"big"}" id="ob-new">New game</button></div>
    <button class="btn2 install-btn" hidden onclick="installApp()">Install Snabits on this phone</button>
    <label class="ob-load" for="ob-file">Load a save file</label><input type="file" id="ob-file" accept=".json,application/json" hidden>
    <div class="ob-ver">Version ${ver}</div></div>`;
  obShow(true); obScene("title"); installShow();
  if(save) document.getElementById("ob-cont").onclick=obContinue;
  document.getElementById("ob-new").onclick=()=>save?obConfirmNew():obIntro();
  document.getElementById("ob-file").onchange=async e=>{ const f=e.target.files[0]; e.target.value=""; if(!f) return; const acts=obRoot().querySelector(".ob-acts");
    try{ const {p,saved}=await readSaveFile(f);
      acts.innerHTML=`<p class="${save?"ob-warn":"ob-ask"}">Load ${saveSummary(p,saved)}?${save?" It replaces the game on this device.":""}</p><button class="btn2" id="ob-fileno">Cancel</button><button class="big" id="ob-fileyes">Load it</button>`;
      document.getElementById("ob-fileno").onclick=showTitle; document.getElementById("ob-fileyes").onclick=()=>applySave(p);
    }catch(err){ acts.insertAdjacentHTML("afterbegin",`<p class="ob-warn">${err.message}</p>`); } };
}
function obContinue(){
  ONB=null; obShow(false);
  if(PLAYER.roster.length) openRanch(); else openScope();
}
function obConfirmNew(){
  const n=PLAYER.roster.length;
  obRoot().querySelector(".ob-acts").innerHTML=`<p class="ob-warn">A new game deletes your ranch, your ${n} Snabit${n===1?"":"s"} and ${PLAYER.bits} bits. This can't be undone.</p>
    <button class="btn2" id="ob-keep">Keep my ranch</button><button class="big danger" id="ob-wipe">Delete and start over</button>`;
  document.getElementById("ob-keep").onclick=showTitle;
  document.getElementById("ob-wipe").onclick=()=>{ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} PLAYER=newPlayer(); RS=null; obIntro(); };
}

const OB_INTRO=[
  ["hidden",null,"Snabits live everywhere, camouflaged in the colour of whatever they hide in, like a red mailbox, a green leaf or the blue sky."],
  ["scope",null,"Only a Snaboscope can uncover them. It reads the colours of whatever it's pointed at and shows the Snabit hiding there."],
  ["town","Tala","Hi, I'm Tala. I run a ranch up the hill, and I was just putting up this job request for someone to help me with it."],
  ["town","Tala","You look like you'd be a good fit. The job is raising Snabits, training them and taking them to cups. The ranch is empty right now, so we'd start by finding your first one."],
  ["handover","Tala","Your phone can work as a Snaboscope. Scan as many things as you like, see what comes out of each, and bring your favourite home."],
];
function obIntro(){
  if(!PLAYER) PLAYER=newPlayer();
  ONB=ONB||{mons:[randomOpponent(Math.random)]}; ONB.step=0; ONB.picks=[];
  obRoot().innerHTML=`<div class="ob-story"><div class="ob-bar"><span id="ob-count"></span><button class="small" id="ob-skip">Skip intro</button></div>
    <div class="ob-frame" id="ob-tap"><canvas id="ob-cv"></canvas></div>
    <div class="ob-text"><div class="tip-who" id="ob-who"></div><p id="ob-line"></p></div>
    <button class="big" id="ob-next">Next</button></div>`;
  obShow(true);
  document.getElementById("ob-skip").onclick=obStartScope;
  document.getElementById("ob-next").onclick=obNext; document.getElementById("ob-tap").onclick=obNext;
  obDrawStep();
}
function obDrawStep(){
  const [scene,who,line]=OB_INTRO[ONB.step];
  obScene(scene);
  document.getElementById("ob-who").textContent=who||""; document.getElementById("ob-who").style.display=who?"":"none";
  document.getElementById("ob-line").textContent=line;
  document.getElementById("ob-count").textContent=`${ONB.step+1} of ${OB_INTRO.length}`;
  document.getElementById("ob-next").textContent=ONB.step===OB_INTRO.length-1?"Open the Snaboscope":"Next";
}
function obNext(){ if(ONB.step<OB_INTRO.length-1){ ONB.step++; obDrawStep(); } else obStartScope(); }

/* ---------- the first Snaboscope trip: scan as many things as you like, then keep one ---------- */
const OB_SHOW=6;   // the choosing screen shows the last 6 scans
function obStartScope(){
  ONB.scene=null; ONB.tut=true; ONB.picks=[]; obShow(false);
  document.body.classList.add("ob-tut");
  obCoach(); openScope();
}
function obCoachText(){
  if(!ONB||!ONB.tut) return "";
  if(mode==="aim") return "Drag the circle onto what you want scanned, then tap Scan.";
  if(!stream) return "The Snaboscope needs your camera. Allow it when your browser asks, or use a photo from your gallery.";
  if(ONB.picks.length===0) return "Point it at something with strong colour, like a toy, a fruit or a shirt. The circle looks hardest at what's inside it. Tap the round button to scan.";
  return `You've scanned ${ONB.picks.length} so far. Try something a different colour, since the main colour decides its element.`;
}
function obCoach(){
  let d=document.getElementById("ob-coach");
  if(!d){ d=document.createElement("div"); d.id="ob-coach"; d.className="tipbox"; document.body.appendChild(d); }
  const on=!!(ONB&&ONB.tut);
  d.style.display=on?"block":"none";
  if(on) d.innerHTML=`<div class="tip-who">Tala</div><div>${obCoachText()}</div>`;
  const mt=document.getElementById("msgtext"); if(mt&&on) mt.textContent=obCoachText();
}
/* Called by render() in index.html once the result sheet is drawn. Returns true when it took over the buttons. */
function obSheet(m){
  if(!ONB||!ONB.tut) return false;
  const acts=card.querySelector(".sheet-actions"); if(!acts) return false;
  const n=ONB.picks.length+1;
  acts.innerHTML=`<p class="ob-note">This one's ${/^[AEIOU]/.test(m.el1)?"an":"a"} ${m.el1} ${m.family}. Keep it, or scan something else to see what else is out there.</p>
    <button class="big" id="ob-keepme">Keep this one</button><button class="btn2" id="ob-again">Scan again</button>
    ${n>1?`<button class="btn2" id="ob-choose">${n<=OB_SHOW?`Choose from all ${n}`:`Choose from the last ${OB_SHOW}`}</button>`:""}`;
  const cur=lastMon;
  document.getElementById("ob-keepme").onclick=()=>obHome(cur);
  document.getElementById("ob-again").onclick=()=>{ ONB.picks.push(cur); obCoach(); openScope(true); };
  if(n>1) document.getElementById("ob-choose").onclick=()=>{ ONB.picks.push(cur); ONB.picks=ONB.picks.slice(-OB_SHOW); obChoose(); };
  return true;
}
function obChoose(){
  ONB.tut=false; obCoach(); ONB.sel=0;
  obRoot().innerHTML=`<div class="ob-story"><div class="ob-text"><div class="tip-who">Tala</div><p>Which one comes home? The others go back into hiding.</p></div>
    <div class="ob-picks">${ONB.picks.map((m,i)=>`<button class="ob-pick" data-i="${i}"><canvas class="mon-tile sm" id="ob-p${i}"></canvas>
      <b>${m.name}</b><span class="sheet-kind"><span class="elc" style="${chipStyle(ELC(m.el1))}">${m.el1}</span>${m.el2?`<span class="elc" style="${chipStyle(ELC(m.el2))}">${m.el2}</span>`:""}<span class="fam">${m.family}</span></span>
      <small>${obBest(m)}</small></button>`).join("")}</div>
    <button class="big" id="ob-take"></button></div>`;
  ONB.picks.forEach((m,i)=>paintMon(document.getElementById("ob-p"+i),m,{stage:"Bit"}));
  obRoot().querySelectorAll(".ob-pick").forEach(b=>b.onclick=()=>{ ONB.sel=+b.dataset.i; obMark(); });
  document.getElementById("ob-take").onclick=()=>obHome(ONB.picks[ONB.sel]);
  obMark(); obShow(true);
}
function obBest(m){ const i=m.stats.indexOf(Math.max(...m.stats)); return `Best at ${STATS[i]} · ${m.ability[0]}`; }
function obMark(){ obRoot().querySelectorAll(".ob-pick").forEach(b=>b.classList.toggle("on",+b.dataset.i===ONB.sel));
  document.getElementById("ob-take").textContent=`Take ${ONB.picks[ONB.sel].name} home`; }
function obHome(m){
  ONB.tut=false; ONB.mons=[m]; obCoach(); document.body.classList.remove("ob-tut");
  obRoot().innerHTML=`<div class="ob-story"><div class="ob-frame"><canvas id="ob-cv"></canvas></div>
    <div class="ob-text"><div class="tip-who">Tala</div><p>Good pick. ${m.name} is ${/^[AEIOU]/.test(m.el1)?"an":"a"} ${m.el1} ${m.family}. Let's walk it up to the ranch.</p></div>
    <button class="big" id="ob-go">Go to the ranch</button></div>`;
  obShow(true); obScene("home");
  document.getElementById("ob-go").onclick=()=>{ PLAYER.onboarded=true; ONB=null; obShow(false); openRanch(m); saveGame(); };
}
