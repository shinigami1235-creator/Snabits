/* The Freezer, the fusion lab, rebirth, the skills page and the bag. Needs game.js and ranch.js. */
const CATALYSTS=["Stat seed","Element stone","Lucky bit","Life fruit"];
const ASSIST=["It's all up to you.","This doesn't look so good.","I'm not sure about this one.","This should be fine.","This looks good.","This looks good.","These two look great together."];

function sprite(m,grid,size=56){ const c=document.createElement("canvas"); paint(c,grid||m.grid,m.pal,1); c.style.cssText=`width:${size}px;height:${size}px;image-rendering:pixelated;background:#24242c;border-radius:8px`; return c; }
function entryState(e){ if(RS&&RS.id===e.id) return RS; return e.st||{stage:"Bit",tp:[0,0,0,0,0,0],level:1,grade:"E",used:0}; }
function entryName(e){ const st=entryState(e); return st.stage&&st.stage!=="Bit"?`${e.m.name}, ${MARK[st.mark][0]} ${st.stage}`:e.m.name; }

/* ---------- Freezer ---------- */
function openFreezer(){
  if(RS&&RS.id) saveGame();
  const list=PLAYER.roster;
  panel(`<div style="flex-basis:100%;font-size:13px">The Freezer holds up to ${freezerMax()} monsters, and a frozen monster uses none of its lifespan.</div><div id="frz" style="flex-basis:100%;display:flex;flex-direction:column;gap:6px"></div><button class="rb" id="f-back">Back</button>`);
  const box=el("frz");
  if(!list.length) box.innerHTML="<div style='font-size:13px;opacity:.7'>Nothing here yet. Scan a photo and tap Raise it.</div>";
  list.forEach(e=>{ const st=entryState(e), row=document.createElement("div");
    row.style.cssText="display:flex;gap:10px;align-items:center;background:#1e1e26;border-radius:10px;padding:6px 8px";
    row.appendChild(sprite(e.m,st.grid,48));
    const t=document.createElement("div"); t.style.cssText="flex:1;font-size:13px";
    t.innerHTML=`<b>${entryName(e)}</b><br><span style="opacity:.7">Lv ${st.level||1}, grade ${st.grade||"E"}, ${Math.floor((st.used||0)/4)} of ${e.m.lifespan} months</span>`;
    row.appendChild(t);
    const b=document.createElement("button"); b.className="small";
    b.textContent=PLAYER.active===e.id?"At the ranch":"Bring out"; b.disabled=PLAYER.active===e.id;
    b.onclick=()=>{ saveGame(); PLAYER.active=e.id; RS=null; openRanch(); };
    row.appendChild(b); box.appendChild(row); });
  el("f-back").onclick=()=>{ if(RS) menu("Out"); else closeRanch(); };
}

/* ---------- Skills page ---------- */
function openSkills(){
  const s=RS, known=knownSkills(s), n=slotsFor(s);
  panel(`<div style="flex-basis:100%;font-size:13px">Tap to equip. A ${s.stage} has ${n} slots.</div>`+
    known.map(k=>`<button class="rb ${s.equip.includes(k)?"on":""}" data-k="${k}">${k}${((s.uses||{})[k]||0)>=MASTERY?" ★":""}<small>${SKILLS[k].el||"Neutral"} ${SKILLS[k].kind}, ${SKILLS[k].cost} energy</small></button>`).join("")+
    `<div style="flex-basis:100%;font-size:12px;opacity:.85"><b>Fight style.</b> ${styleText(s)}</div><button class="rb" id="k-book">Skill book</button><button class="rb" id="k-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{ const k=b.dataset.k, i=s.equip.indexOf(k);
    if(i>=0) s.equip.splice(i,1); else { if(s.equip.length>=n) s.equip.shift(); s.equip.push(k); } saveGame(); openSkills(); });
  el("k-back").onclick=()=>menu("Care"); el("k-book").onclick=()=>openBook();
}

/* ---------- The bag ---------- */
function openItems(){
  const s=RS, bag=PLAYER.bag, names=Object.keys(bag).filter(k=>bag[k]>0);
  const what=k=>k.startsWith("Skill chip: ")?"Teaches "+k.slice(12):SNACKS[k]?"Snack, use it from Feed":ITEMS[k]?ITEMS[k].desc:"";
  panel(names.map(k=>`<button class="rb" data-i="${k}">${k} ×${bag[k]}<small>${what(k)}</small></button>`).join("")+`<button class="rb" id="i-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>useItem(b.dataset.i));
  el("i-back").onclick=()=>menu("Care");
}
function useItem(k){
  const s=RS, bag=PLAYER.bag;
  if(k==="Life fruit"){ if(s.fruitUsed){ say("It's already had a Life fruit. They only work once."); return; } bag[k]--; s.fruitUsed=true; s.used=Math.max(0,s.used-12); say("It ate the Life fruit. That's 3 more months."); }
  else if(k==="Medicine"){ if(!s.sick&&!s.injured){ say("It's healthy, so medicine would be wasted."); return; } bag[k]--; s.sick=0; s.injured=false; say("Medicine's in. It's well enough to train."); }
  else if(k.startsWith("Skill chip: ")){ const n=k.slice(12), sk=SKILLS[n], own=sk.el===s.m.el1||sk.el===s.m.el2;
    if(knownSkills(s).includes(n)){ say(`It already knows ${n}.`); return; }
    if(tierOf(n)>=2&&!own){ say(`${n} is a Tier 2 ${sk.el} skill, and a skill like that from another element has to be learned on a trip.`); return; }
    bag[k]--; s.skillsKnown=(s.skillsKnown||[]).concat(n); fixEquip(s); say(`It learned ${n} from the chip.`); }
  else if(SNACKS[k]){ menu("Feed"); return; }
  else if(k==="Rebirth seed"||CATALYSTS.includes(k)){ say(`The ${k} is used in the Fusion lab.`); return; }
  else return;
  if(bag[k]<=0) delete bag[k];
  clampAll(); drawUI(); saveGame(); openItems();
}

/* ---------- Fusion ---------- */
let LAB={a:null,b:null,cat:null};
function compat(e1,e2){
  const fam=FAMILY[e1.m.family]||FAMILY.Squib, famTop=fam.base.map((v,i)=>[v,i]).sort((x,y)=>y[0]-x[0]).slice(0,3).map(x=>x[1]);
  let match=0;
  for(const e of [e1,e2]){ const st=entryState(e), base=(FAMILY[e.m.family]||fam).base;
    const top=st.tp.map((v,i)=>[v*RANK_PTS[rankOf(base[i])],i]).sort((x,y)=>y[0]-x[0]).slice(0,3).map(x=>x[1]);
    match+=top.filter(i=>famTop.includes(i)).length; }
  if(e1.m.family===e2.m.family) match=0;
  return match;
}
function openLab(){
  if(RS&&RS.id) saveGame();
  const R=PLAYER.roster;
  if(!LAB.a||!R.find(e=>e.id===LAB.a)) LAB.a=PLAYER.active;
  if(LAB.b&&!R.find(e=>e.id===LAB.b)) LAB.b=null;
  const opt=(sel,ex)=>R.filter(e=>e.id!==ex).map(e=>`<option value="${e.id}" ${e.id===sel?"selected":""}>${entryName(e)}</option>`).join("");
  const cats=CATALYSTS.filter(c=>PLAYER.bag[c]>0);
  let info="";
  const e1=R.find(e=>e.id===LAB.a), e2=R.find(e=>e.id===LAB.b);
  if(e1&&e2){ const m=compat(e1,e2), carry=Math.min(40,10+5*m);
    const fam=e1.m.family===e2.m.family?`${e1.m.family} 100%`:`${e1.m.family} 55%, ${e2.m.family} 30%, a hybrid 15%`;
    info=`<div style="flex-basis:100%;font-size:13px"><b>Assistant:</b> "${ASSIST[m]}" The child will be ${fam}, and it keeps about ${carry}% of the parents' training. Both parents are used up, and it costs 500 bits.</div>`; }
  const st=RS&&RS.id?RS:null, elder=st&&st.used>=lifeWeeks()*0.7;
  panel(`<div class="full lab-head"><b>Fusion lab</b><button class="small" id="l-back">Back</button></div>
    <label class="fld">First parent<select id="l-a">${opt(LAB.a,LAB.b)}</select><small>Counts twice as much</small></label>
    <label class="fld">Second parent<select id="l-b"><option value="">Pick one</option>${opt(LAB.b,LAB.a)}</select></label>
    <label class="fld full">Catalyst<select id="l-c"><option value="">None</option>${cats.map(c=>`<option ${c===LAB.cat?"selected":""}>${c}</option>`).join("")}</select></label>
    ${info.replace('style="flex-basis:100%;font-size:13px"','class="full lab-info"')}<button class="big full" id="l-fuse" ${e1&&e2?"":"disabled"}>Fuse · 500 bits</button>
    <button class="rb full" id="l-reb" ${PLAYER.bag["Rebirth seed"]&&st?"":"disabled"}>Rebirth ${st?displayName(st):""}<small>${PLAYER.bag["Rebirth seed"]?(elder?"Uses the Rebirth seed":"Only an Elder or Veteran can be reborn"):"Needs a Rebirth seed"}</small></button>`);
  el("l-a").onchange=e=>{LAB.a=e.target.value;openLab();}; el("l-b").onchange=e=>{LAB.b=e.target.value||null;openLab();}; el("l-c").onchange=e=>{LAB.cat=e.target.value||null;};
  el("l-fuse").onclick=()=>doFuse(e1,e2,LAB.cat);
  el("l-reb").onclick=()=>{ if(!elder){ say("Rebirth only works on an Elder, in the last 30% of its lifespan."); return; } rebirthPick(); };
  el("l-back").onclick=()=>{ if(RS) menu("Out"); else closeRanch(); };
}
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v*(1-t)+b[i]*t));
function fuseChild(e1,e2,cat,R){
  const m1=e1.m, m2=e2.m, s1=entryState(e1), s2=entryState(e2);
  let fam, hybrid=false;
  const r=R();
  if(m1.family===m2.family||r<0.55) fam=m1.family; else if(r<0.85) fam=m2.family; else {
    hybrid=true; fam=registerHybrid(m1.family,m2.family);
  }
  const mut=cat==="Lucky bit"?0.3:0.1, parts={};
  for(const k of ["eyes","mouth","top","arms"]) parts[k]=R()<mut?Math.floor(R()*(k==="eyes"?7:5)):(R()<0.6?m1.parts[k]:m2.parts[k]);
  const body=mix(m1.pal.body,m2.pal.body,1/3);
  let el1=m1.el1; try{ const g=group(...body); if(EL[g]) el1=EL[g]; }catch(e){}
  if(cat==="Element stone") el1=m2.el1;
  let el2=m1.el2||(m2.el1!==el1?m2.el1:m2.el2); if(el2===el1) el2=null; const mono=!el2&&!(m1.el2||m2.el2);
  const pal={...m1.pal,body,parts:mix(m1.pal.parts,m2.pal.parts,1/3),accent:mix(m1.pal.accent,m2.pal.accent,1/2),dark:tone(body,-0.45),outline:(()=>{const [h,s,v]=rgbToHsv(body);return hsvToRgb([h,Math.min(1,s+0.2),Math.min(0.2,v*0.3)]);})()};
  const talent=m1.talent.map((t,i)=>Math.min(15,Math.max(0,Math.round((t+m2.talent[i])/2)+Math.floor(R()*6)-2)));
  const pr=R(), pers=pr<0.5?m1.pers:pr<0.8?m2.pers:PERSONALITY[Math.floor(R()*PERSONALITY.length)];
  const ar=R(), ability=ar<0.5?m1.ability:ar<0.8?m2.ability:(R()<0.5?FAMILY[fam].ability:EL_ABILITY[el1][0]);
  const lean=FAMILY[fam].base.slice(), mag=mono?15:10; lean[LEAN[el1][0]]+=mag; lean[LEAN[el1][1]]-=mag; if(el2){lean[LEAN[el2][0]]+=5; lean[LEAN[el2][1]]-=5;}
  const stats=lean.map((b,i)=>Math.round((b+talent[i])*(i===pers[1]?1.1:i===pers[2]?0.9:1)));
  if(cat==="Stat seed"){ const k=stats.indexOf(Math.max(...stats)); stats[k]+=20; }
  const match=compat(e1,e2), carry=(Math.min(40,10+5*match)+(hybrid||cat?10:0))/100;
  const tp=s1.tp.map((v,i)=>Math.round(carry*(2*v+s2.tp[i])/3));
  const known1=[...new Set((s1.skillsKnown||[]).concat(s1.learned||[]).concat(m1.pool.filter(n=>SKILLS[n].lv<=(s1.level||1))))];
  const known2=[...new Set((s2.skillsKnown||[]).concat(s2.learned||[]).concat(m2.pool.filter(n=>SKILLS[n].lv<=(s2.level||1))))];
  let inherit=fam===m1.family?known1.slice(0,Math.floor(known1.length*2/3)):[];
  if(!inherit.length){ for(const n of known1.concat(known2)){ const e=SKILLS[n].el||"Neutral"; if(!inherit.some(x=>(SKILLS[x].el||"Neutral")===e)) inherit.push(n); if(inherit.length>=4) break; } }
  const pool=buildPool(el1,el2,Math.round((m1.pool.length+m2.pool.length)/2));
  const grid=buildGrid(fam,parts);
  const m={pool,name:speciesName(fam,el1,el2),family:fam,band:m1.band,shape:m1.shape,el1,el2,mono,parts,grid,pal,stats,talent,pers,ability,hidden:false,skills:pool.slice(0,2),
    lifespan:Math.round((2*m1.lifespan+m2.lifespan)/3)+(cat==="Life fruit"?3:0),hybridOf:hybrid?[m1.family,m2.family]:null};
  const st={tp,weight:Math.round((2*(s1.weight||0)+(s2.weight||0))/3*0.7),skillsKnown:[...new Set(pool.slice(0,2).concat(inherit))],equip:pool.slice(0,2),level:1,grade:"E",used:0};
  return {m,st,hybrid,carry:Math.round(carry*100),inherit};
}
async function doFuse(e1,e2,cat){
  if(PLAYER.bits<500){ say("A fusion costs 500 bits."); return; }
  PLAYER.bits-=500; saveGame();
  const R=rng(hashStr(e1.id+e2.id+PLAYER.week));
  if(cat){ PLAYER.bag[cat]--; if(PLAYER.bag[cat]<=0) delete PLAYER.bag[cat]; }
  const child=fuseChild(e1,e2,cat,R);
  // the fusion scene: both parents slide together and flash into the child
  panel(`<div id="fuse" style="flex-basis:100%;position:relative;height:120px;background:#1b1b24;border-radius:12px;overflow:hidden"></div><div id="fuse-t" style="flex-basis:100%;font-size:13px"></div>`);
  const box=el("fuse"), a=sprite(e1.m,entryState(e1).grid,96), b=sprite(e2.m,entryState(e2).grid,96), c=sprite(child.m,null,104);
  [a,b,c].forEach(x=>{ x.style.position="absolute"; x.style.top="12px"; x.style.transition="left .9s ease-in,opacity .4s,filter .4s"; box.appendChild(x); });
  a.style.left="8%"; b.style.left="calc(92% - 96px)"; c.style.left="calc(50% - 52px)"; c.style.opacity=0;
  await rsleep(200); a.style.left=b.style.left="calc(50% - 48px)"; await rsleep(950);
  a.style.filter=b.style.filter="brightness(4)"; await rsleep(350); a.style.opacity=b.style.opacity=0; c.style.opacity=1; c.style.filter="brightness(3)"; await rsleep(300); c.style.filter="none";
  // the parents are used up and the child takes the ranch
  PLAYER.roster=PLAYER.roster.filter(e=>e.id!==e1.id&&e.id!==e2.id);
  const e={id:"m"+(PLAYER.nextId++),m:child.m,st:child.st}; PLAYER.roster.push(e); PLAYER.active=e.id; RS=null; LAB={a:null,b:null,cat:null};
  saveGame();
  el("fuse-t").innerHTML=`It's a ${child.m.name}${child.hybrid?", a hybrid":""}. It keeps ${child.carry}% of its parents' training and knows ${child.st.skillsKnown.join(", ")}. <button class="small" id="fuse-go">To the ranch</button>`;
  el("fuse-go").onclick=()=>openRanch();
}

/* ---------- Rebirth ---------- */
function rebirthPick(){
  const s=RS, known=knownSkills(s);
  panel(`<div style="flex-basis:100%;font-size:13px">It goes back to a Bit at level 1 with its full lifespan, keeps 20% of its training and +1 talent on every stat, and keeps one skill. Which one?</div>`+
    known.map(k=>`<button class="rb" data-r="${k}">${k}</button>`).join("")+`<button class="rb" id="rb-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>doRebirth(b.dataset.r));
  el("rb-back").onclick=openLab;
}
async function doRebirth(keep){
  const s=RS;
  PLAYER.bag["Rebirth seed"]--; if(PLAYER.bag["Rebirth seed"]<=0) delete PLAYER.bag["Rebirth seed"];
  await scene(async()=>{
    say("The seed takes root..."); s.pose="sleep"; await rwait(800);
    for(let k=0;k<10;k++){ s.flash=99; await rwait(Math.max(60,240-k*20)); s.flash=0; await rwait(60); }
    s.stage="Bit"; s.mark=-1; s.mark2=undefined; s.variant=null; s.pal=null; s.grid=s.m.grid; s.P=makePuppet(s.m.grid,false,s.m.family); s.stageRegions={}; s.stageCups=0; s.neglect=0;
    s.messSpots=s.messSpots.map(p=>({x:Math.floor(p.x/2),y:Math.floor(p.y/2)}));
    s.tp=s.tp.map(v=>Math.round(v*0.2)); s.m.talent=s.m.talent.map(t=>Math.min(15,t+1)); s.m.stats=s.m.stats.map(v=>v+1);
    s.level=1; s.exp=0; s.used=0; s.grade="E"; s.fatigue=0; s.stress=0; s.hinted=false; s.toldEvo=false; s.fruitUsed=false;
    s.learned=(s.learned||[]).filter(n=>n===keep); s.skillsKnown=s.m.skills.concat(keep); s.equip=s.m.skills.slice(); fixEquip(s);
    spark(s.x,headY()+10,"sparkle",16); s.pose="happy"; await hop(14,420);
    say(`Reborn as a fresh Bit. It kept ${keep}, 20% of its training and a little more talent.`);
  });
}
