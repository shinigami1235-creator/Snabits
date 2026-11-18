/* Onboarding: Josie, the ranch assistant, teaches a few buttons at a time and opens the rest as the player goes. Needs ranch.js and game.js. */
const TIPS=[
  ["welcome",()=>true,s=>`${PLAYER.onboarded?`Welcome home, ${s.m.name}.`:`I'm Josie and I help run the ranch. This is ${s.m.name}.`} Keep it trained, rested and fed and it'll do well.`],
  ["drill",s=>s.tp.some(v=>v>0),()=>"Let it know how it did after each drill. It learns from what you praise and scold."],
  ["tired",s=>s.fatigue>=50,()=>"It's getting tired. Give it a rest before it gets hurt."],
  ["month",()=>PLAYER.week>=4,()=>"We made it through the first month. It's ready for its first cup."],
  ["cup",s=>s.wins+s.losses>0,()=>"It watches how you fight. When it fights on its own it does what you did."],
  ["heart1",()=>hearts()>=1,()=>"It trusts you now. Walt can take it on a skill trip."],
  ["heart2",()=>hearts()>=2,()=>"It trusts you a lot more now. It's ready for heavy drills."],
  ["second",()=>PLAYER.roster.length>=2,()=>"Now we have two. The other one can wait in the Freezer."],
  ["evo",s=>s.stage!=="Mega"&&tpTotal()>=evoTotal()-10,()=>"It's close to changing. What we train next will shape how it looks."],
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
