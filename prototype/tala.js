/* Onboarding: Josie, the ranch assistant, teaches a few buttons at a time and opens the rest as the player goes. Needs ranch.js and game.js. */
const TIPS=[
  ["welcome",()=>true,s=>`${PLAYER.onboarded?`Welcome home, ${s.m.name}.`:`I am Josie and I help run the ranch. This is ${s.m.name}.`} We train it to make it stronger and let it rest when it gets tired. It needs a meal every day and some petting and cleaning too. Whatever we do takes up the whole week.`],
  ["drill",s=>s.tp.some(v=>v>0),()=>"After each drill, let it know how it did. Praise it when it works hard and scold it when it slacks off so it learns what you expect."],
  ["tired",s=>s.fatigue>=50,()=>"It is getting tired. A week of rest will fix that and pushing it now could get it hurt."],
  ["month",()=>PLAYER.week>=4,()=>"We made it through the first month so we can start heading out. Cups are how it moves up from grade E and missions bring home bits and items."],
  ["cup",s=>s.wins+s.losses>0,()=>"It watches how you fight when you take control. On missions and in Auto fights it does what it saw you do."],
  ["heart1",()=>hearts()>=1,()=>"It trusts you now so we can take it on skill trips. A trip is four weeks away in one region learning new moves."],
  ["heart2",()=>hearts()>=2,()=>"It trusts you a lot more now so it is ready for heavy drills. They are hard work but they build a stat much faster."],
  ["second",()=>PLAYER.roster.length>=2,()=>"Now we have two. The one we are not raising waits in the Freezer and does not get older there. Dr. Ines can fuse two of them in her lab."],
  ["evo",s=>s.stage!=="Mega"&&tpTotal()>=evoTotal()-10,()=>"It is close to changing. Whatever we train next will decide how it looks."],
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
  box.innerHTML=`<div class="tip-who">Josie</div><div>${t[2](s)}</div><div class="tip-acts"><button class="big" id="tip-ok">Got it</button>${t[0]==="welcome"?`<button class="btn2" id="tip-skip">I know how to play</button>`:""}</div>`;
  if(typeof talaFace==="function") talaFace(box,t[2](s));
  el("tip-ok").onclick=()=>{ PLAYER.tips[t[0]]=true; saveGame(); checkTips(); drawUI(); };
  if(el("tip-skip")) el("tip-skip").onclick=()=>{ PLAYER.tutorialDone=true; saveGame(); box.style.display="none"; el("r-say").style.display=""; drawUI(); };
}
