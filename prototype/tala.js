/* Onboarding: Tala, the ranch assistant, teaches a few buttons at a time and opens the rest as the player goes. Needs ranch.js and game.js. */
const TIPS=[
  ["welcome",()=>true,s=>`${PLAYER.onboarded?`Welcome home, ${s.m.name}.`:`I'm Tala, and I help run the ranch. This is ${s.m.name}.`} Train builds its stats, Rest clears tiredness, Feed sets its meals, and Care is for petting, cleaning and its things. Each drill or rest takes one week.`],
  ["drill",s=>s.tp.some(v=>v>0),()=>"After each drill you can praise or scold it. Praise good work and scold slacking, and it learns what you expect."],
  ["tired",s=>s.fatigue>=50,()=>"It's getting tired. A rest week clears it, and pushing on risks an injury."],
  ["month",()=>PLAYER.week>=4,()=>"The first month's done, so Out is open. Tournaments are how it climbs from grade E, and missions bring back bits and items."],
  ["cup",s=>s.wins+s.losses>0,()=>"The fights you play by hand teach it how to fight. In missions and Auto fights it copies what you did."],
  ["heart1",()=>hearts()>=1,()=>"One heart. Skill trips are open now: 4 weeks in a region to learn its skills."],
  ["heart2",()=>hearts()>=2,()=>"Two hearts. Heavy drills are open. They're hard work, and they push a stat much faster."],
  ["second",()=>PLAYER.roster.length>=2,()=>"You've got two monsters now. The one not at the ranch waits in the Freezer without aging, and two can be fused in the lab."],
  ["evo",s=>s.stage!=="Mega"&&tpTotal()>=evoTotal()-10,()=>"It's close to changing. Whatever it trains next decides how it looks."],
];
const tutDone=()=>!!(PLAYER&&PLAYER.tutorialDone);
const outLocked=()=>!tutDone()&&PLAYER.week<4;
const tripsLocked=()=>!tutDone()&&hearts()<1;
function checkTips(){
  const s=RS; if(!s||!s.id) return;
  if(s.busy||tutDone()){ const b=el("r-tip"); if(b) b.style.display="none"; el("r-say").style.display=""; return; }
  PLAYER.tips=PLAYER.tips||{};
  const t=TIPS.find(([id,cond])=>!PLAYER.tips[id]&&cond(s));
  let box=el("r-tip");
  if(!box){ box=document.createElement("div"); box.id="r-tip"; box.className="tipbox"; box.style.display="none";
    el("r-say").after(box); }
  if(!t){ box.style.display="none"; el("r-say").style.display=""; return; }
  box.style.display="block"; el("r-say").style.display="none";
  box.innerHTML=`<div class="tip-who">Tala</div><div>${t[2](s)}</div><div class="tip-acts"><button class="big" id="tip-ok">Got it</button>${t[0]==="welcome"?`<button class="btn2" id="tip-skip">I know how to play</button>`:""}</div>`;
  if(typeof talaFace==="function") talaFace(box,t[2](s));
  el("tip-ok").onclick=()=>{ PLAYER.tips[t[0]]=true; saveGame(); checkTips(); drawUI(); };
  if(el("tip-skip")) el("tip-skip").onclick=()=>{ PLAYER.tutorialDone=true; saveGame(); box.style.display="none"; el("r-say").style.display=""; drawUI(); };
}
