/* The town: Market, Item shop, Skill shop and Workshop, plus worn and held items. Needs game.js, ranch.js and lab.js. */
const WORN={
  "Cap":{slot:"head",up:[5,4],down:[-3,2],price:400},
  "Top hat":{slot:"head",up:[8,3],down:[-5,5],price:700},
  "Crown":{slot:"head",exp:0.1,down:[-5,2],price:1500},
  "Party hat":{slot:"head",energy:1,down:[-5,0],price:900},
  "Bow":{slot:"head",up:[5,4],down:[-3,1],price:400},
  "Sunglasses":{slot:"face",crit:0.1,acc:-0.05,price:1000},
  "Monocle":{slot:"face",monocle:true,down:[-3,4],price:800},
  "Mustache":{slot:"mouth",up:[5,1],down:[-3,5],price:400},
  "Bat wings":{slot:"back",up:[8,5],down:[-5,2],price:1200},
  "Angel wings":{slot:"back",up:[8,4],down:[-5,1],price:1200},
  "Boots":{slot:"feet",up:[5,2],down:[-3,5],price:500},
};
const HELD={
  "Element stone":{price:2000,desc:"Skills of its main element deal 20% more"},
  "Energy cell":{price:2500,desc:"Refills 3 energy a turn instead of 2, max HP -10%"},
  "Life seed":{price:1800,desc:"Heals 25% once when HP drops under half"},
  "Lucky bit":{price:1200,desc:"Crit chance goes from 5% to 10%"},
};
const MARKET={"Berry":15,"Cool leaf":20,"Candy":15,"Energy nut":30,"Honey cake":40,"Bitter root":25,"Slim tea":30,"Medicine":80,"Ball":60};
const UP_NAME={"Better hut":"Better barn"};   // shown name; the save key stays "Better hut"
const UPGRADES={"Kitchen":[1500,"A liked meal also takes 5 fatigue off"],"Better hut":[2000,"A bigger bed in the barn, so a rest week takes 45 fatigue off instead of 35"],"Training gear":[3000,"Great drills +5%"],"Big Freezer":[5000,"Holds 30 monsters instead of 20"]};
const has=u=>!!(PLAYER.upgrades&&PLAYER.upgrades[u]);
const priceOf=k=>MARKET[k]||(WORN[k]&&WORN[k].price)||(HELD[k]&&HELD[k].price)||(k.startsWith("Skill chip: ")?300:ITEMS[k]&&ITEMS[k].rarity===2?1500:0);
const wornText=k=>{ const w=WORN[k], p=[];
  if(w.up) p.push(`${STATS[w.up[1]]} +${w.up[0]}`); if(w.exp) p.push("Exp +10%"); if(w.energy) p.push("Starts fights with 1 more energy");
  if(w.crit) p.push("Crit +10%"); if(w.acc) p.push("Accuracy -5%"); if(w.monocle) p.push("Shows the opponent's exact stats");
  if(w.down) p.push(`${STATS[w.down[1]]} ${w.down[0]}`); return p.join(", "); };

function weekStock(){
  const R=rng(hashStr("stock|"+PLAYER.week)), wk=Object.keys(WORN), hd=Object.keys(HELD), worn=[];
  while(worn.length<4){ const k=wk[Math.floor(R()*wk.length)]; if(!worn.includes(k)) worn.push(k); }
  const chips=Object.entries(SKILLS).filter(([n,s])=>(s.el&&s.el!=="Void"&&s.lv<=8||s.chip)&&s.fromStat===undefined&&!s.sig).map(([n])=>n), ch=[];
  while(ch.length<3){ const n=chips[Math.floor(R()*chips.length)]; if(!ch.includes(n)) ch.push(n); }
  const held=hd[Math.floor(R()*hd.length)], held2=GRADES.indexOf(bestGrade())>=2?hd.filter(k=>k!==held)[Math.floor(R()*(hd.length-1))]:null;
  return {worn,held,held2,chips:ch};
}
/* Nena's shop: the Market, the week's things to wear and hold, skill chips and selling, all from her counter.
   With the smooth art it's a place you walk into; she talks in the box at the top of the panel. */
let SHOP_SAY=null;
function buy(k,price,then){
  if(PLAYER.bits<price){ SHOP_SAY="You don't have enough bits for that one."; if(then) then(); return; }
  PLAYER.bits-=price; addItem(k);
  SHOP_SAY=`Here's your ${k}. Thank you!`; drawUI(); saveGame(); if(then) then();
}
function openTown(){
  if(RS) RS.inTown=true;
  if(RS&&RS.visit==="shop"){ leaveVisit().then(openTown); return; }
  panel(`<div class="full lab-head"><b>Town</b><button class="small" id="tw-back">Back</button></div><div class="full lab-info">Nena's things to wear and her skill chips change every week.</div>
    <button class="rb" id="tw-shop">Nena's shop<small>Snacks, medicine, things to wear, skill chips</small></button><button class="rb" id="tw-w">Workshop<small>Ranch upgrades</small></button><button class="rb" id="tw-hall">Town Hall<small>${loanLeft()?`Pay the loan, ${loanLeft().toLocaleString()} bits left`:"The loan is paid"}</small></button>`);
  el("tw-shop").onclick=()=>openShop(); el("tw-w").onclick=openWorkshop; el("tw-hall").onclick=()=>openHall(); el("tw-back").onclick=()=>menu("Out");
}
async function openShop(line){
  if(RS&&RS.visit!=="shop") await visitPlace("shop");
  if(RS) RS.inTown=true;
  const say0=SHOP_SAY||line||"Welcome! Feel free to look around. The skill chips are in the glass case."; SHOP_SAY=null;
  npcPanel(npcBox("shop",say0)+`<button class="rb" id="sh-m">Snacks and medicine<small>Food, medicine and toys</small></button><button class="rb" id="sh-i">Things to wear<small>New every week</small></button>
    <button class="rb" id="sh-s">Skill chips<small>New every week</small></button><button class="rb" id="sh-sell">Sell<small>Half price back</small></button><button class="rb full" id="sh-out">Leave the shop</button>`);
  el("sh-m").onclick=openMarket; el("sh-i").onclick=openItemShop; el("sh-s").onclick=openSkillShop; el("sh-sell").onclick=openSell;
  el("sh-out").onclick=async()=>{ await leaveVisit(); openTown(); };
}
function shopList(line,rows,back,exit=()=>openShop("Anything else?")){
  const say0=SHOP_SAY||line; SHOP_SAY=null;
  npcPanel(npcBox("shop",say0)+`<div class="full lab-info">You have ${PLAYER.bits} bits.</div>`+rows.map((r,i)=>`<button class="rb" data-s="${i}" ${PLAYER.bits<r.price||r.off?"disabled":""}>${r.name} · ${r.price}<small>${r.desc}</small></button>`).join("")+`<button class="rb" id="sh-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{ const r=rows[+b.dataset.s]; r.buy?r.buy():buy(r.name,r.price,back); });
  el("sh-back").onclick=exit;
}
const RANK_STOCK=()=>Object.assign({},rankIdx()>=3?{"Stat seed":2500,"Element stone":2500,"Lucky bit":2000}:{},rankIdx()>=5?{"Life seed":6000}:{});   // fusion catalysts from grade B, Life seeds at S
function openMarket(){ shopList("Snacks, medicine and toys are on these shelves.",Object.entries(Object.assign({},MARKET,RANK_STOCK())).map(([k,p])=>({name:k,price:p,desc:`${itemDesc(k)} You have ${PLAYER.bag[k]||0}.`})),openMarket); }
function openItemShop(){ const st=weekStock();
  shopList("These are the things to wear this week. I get new ones every week.",st.worn.map(k=>({name:k,price:WORN[k].price,desc:`Worn on the ${WORN[k].slot}. ${itemDesc(k)}`})).concat([st.held,st.held2].filter(Boolean).map(h=>({name:h,price:HELD[h].price,desc:"Held. "+itemDesc(h)}))),openItemShop); }
function openSkillShop(){ const st=weekStock();
  shopList("These chips are in the case this week. Each one teaches a skill.",st.chips.map(n=>({name:"Skill chip: "+n,price:300,desc:`${SKILLS[n].el} ${SKILLS[n].kind}. ${describe(n)}`})),openSkillShop); }
/* The Workshop: ranch upgrades from the start, home upgrades once a quarter of the loan is paid, and two levels for
   each training place at half and three quarters paid. A training place upgrade makes drills there give more. */
const HOME_UP={"Cozy rug":[1200,"A big round rug in the barn. Petting takes 3 more stress off"],"Toy chest":[1800,"A chest of toys by the shelf. Playing takes 5 more stress off"],"Potted plants":[900,"Plants on the beams and the wardrobe. Stress -2 every week"]};
const PLACE_UP={pool:["Lane ropes and a slide","Lights and a scoreboard"],trail:["Rope rails","A boulder rack"],cage:["A faster pitching machine","A second cage"],
  study:["A bigger chalkboard","A puzzle shelf"],pond:["Stepping stones","Stone lanterns"],court:["New nets","Lights and a scoreboard"]};
const PLACE_COST=[2500,6000];
const placeLv=p=>(PLAYER.upgrades&&PLAYER.upgrades["place:"+p])||0;
function openWorkshop(){
  PLAYER.upgrades=PLAYER.upgrades||{}; const step=typeof loanStep==="function"?loanStep():4;
  const btn=(k,p,name,d,built,lock)=>`<button class="rb" data-u="${k}" data-p="${p}" ${PLAYER.bits<p||built||lock?"disabled":""}>${name} · ${p.toLocaleString()}<small>${built?"Built":lock||d}</small></button>`;
  const places=DRILL_PLACE.map((pl,i)=>{ const lv=placeLv(pl); if(lv>=2) return `<button class="rb" disabled>${PLACE_NAME[pl].replace(/^the /,"").replace(/^./,c=>c.toUpperCase())} ★★<small>Fully upgraded. ${DRILLS[i]} gives 30% more</small></button>`;
    const need=lv===0?2:3, lock=step<need?`Opens at ${["","","half","three quarters"][need]} of the loan paid`:null;
    return btn("place:"+pl,PLACE_COST[lv],`${PLACE_NAME[pl].replace(/^the /,"").replace(/^./,c=>c.toUpperCase())} ${"★".repeat(lv)}${"☆".repeat(2-lv)}`,`${PLACE_UP[pl][lv]}. ${DRILLS[i]} +${15*(lv+1)}%, great drills +4%`,false,lock); }).join("");
  panel(`<div class="full lab-head"><b>Workshop</b><button class="small" id="ws-back">Back</button></div><div class="full lab-info">You have ${PLAYER.bits.toLocaleString()} bits.</div>
    <div class="full sec">The ranch</div>`+Object.entries(UPGRADES).map(([k,[p,d]])=>btn(k,p,UP_NAME[k]||k,d,has(k))).join("")+
    `<div class="full sec">The barn<small>${step<1?"Opens at a quarter of the loan paid":"Home upgrades"}</small></div>`+Object.entries(HOME_UP).map(([k,[p,d]])=>btn(k,p,k,d,has(k),step<1?"Opens at a quarter of the loan paid":null)).join("")+
    `<div class="full sec">Training places<small>${step<2?"Opens at half the loan paid":"Two levels each"}</small></div>`+places);
  el("r-panel").querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>{ const k=b.dataset.u, p=+b.dataset.p; if(PLAYER.bits<p) return; PLAYER.bits-=p;
    if(k.startsWith("place:")){ PLAYER.upgrades[k]=(PLAYER.upgrades[k]||0)+1; say(`${PLACE_NAME[k.slice(6)].replace(/^./,c=>c.toUpperCase())} is upgraded, so ${DRILLS[DRILL_PLACE.indexOf(k.slice(6))]} gives ${15*PLAYER.upgrades[k]}% more.`); }
    else { PLAYER.upgrades[k]=true; say(`The ${UP_NAME[k]||k} is built.`); }
    drawUI(); saveGame(); openWorkshop(); });
  el("ws-back").onclick=openTown;
}
function openSell(){
  const bag=PLAYER.bag, names=Object.keys(bag).filter(k=>bag[k]>0&&priceOf(k)>0), say0=SHOP_SAY||"I'll buy anything back for half what it cost."; SHOP_SAY=null;
  npcPanel(npcBox("shop",say0)+`<div class="full lab-info">You have ${PLAYER.bits} bits.</div>`+names.map(k=>`<button class="rb" data-x="${k}">${k} ×${bag[k]}<small>${Math.floor(priceOf(k)/2)} bits</small></button>`).join("")+`<button class="rb" id="sl-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{ const k=b.dataset.x, got=Math.floor(priceOf(k)/2); bag[k]--; if(bag[k]<=0) delete bag[k]; PLAYER.bits+=got; SHOP_SAY=`Thanks! Here's ${got} bits for the ${k}.`; drawUI(); saveGame(); openSell(); });
  el("sl-back").onclick=()=>openShop("Anything else?");
}

/* ---------- wearing and holding ---------- */
function openWear(){
  const s=RS; s.worn=s.worn||{}; const bag=PLAYER.bag;
  const slots=["head","face","mouth","back","feet"];
  const owned=Object.keys(WORN).filter(k=>bag[k]>0), heldOwned=Object.keys(HELD).filter(k=>bag[k]>0);
  panel(`<div style="flex-basis:100%;font-size:13px">Worn items show on it and change how it grows. One per spot, plus one held item for fights.</div>`+
    slots.map(sl=>`<div style="flex-basis:100%;font-size:13px"><b>${sl[0].toUpperCase()+sl.slice(1)}:</b> ${s.worn[sl]?`${s.worn[sl]}. ${itemDesc(s.worn[sl])} <button class="small" data-off="${sl}">Take off</button>`:"empty"}</div>`).join("")+
    `<div style="flex-basis:100%;font-size:13px"><b>Held:</b> ${s.held?`${s.held}. ${itemDesc(s.held)} <button class="small" data-off="held">Take off</button>`:"nothing"}</div>`+
    owned.map(k=>`<button class="rb" data-w="${k}">${k} ×${bag[k]}<small>${WORN[k].slot[0].toUpperCase()+WORN[k].slot.slice(1)}. ${itemDesc(k)}</small></button>`).join("")+
    heldOwned.map(k=>`<button class="rb" data-h="${k}">${k} ×${bag[k]}<small>Held. ${itemDesc(k)}</small></button>`).join("")+`<button class="rb" id="wr-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{ const k=b.dataset.w, sl=WORN[k].slot; if(s.worn[sl]) addItem(s.worn[sl]); bag[k]--; if(bag[k]<=0) delete bag[k]; s.worn[sl]=k; fixEquip(s); saveGame(); openWear(); });
  el("r-panel").querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{ const k=b.dataset.h; if(s.held) addItem(s.held); bag[k]--; if(bag[k]<=0) delete bag[k]; s.held=k; saveGame(); openWear(); });
  el("r-panel").querySelectorAll("[data-off]").forEach(b=>b.onclick=()=>{ const sl=b.dataset.off; if(sl==="held"){ addItem(s.held); s.held=null; } else { addItem(s.worn[sl]); delete s.worn[sl]; } fixEquip(s); saveGame(); openWear(); });
  el("wr-back").onclick=()=>menu("Care");
}
/* Worn items drawn over the sprite, placed from the puppet's eyes, mouth, top and feet. */
function drawWorn(c,s,dx,dy,o){
  const w=s.worn||{}, P=s.P, sc=P.scale, pad=P.pad; if(!Object.keys(w).length) return;
  const eyes=P.px.filter(p=>p.g==="eye"), mouth=P.px.filter(p=>p.g==="mouth"), body=P.px.filter(p=>p.g==="body");
  const cx=dx+(P.N/2+pad+o.bx)*sc, Y=y=>dy+(y+pad)*sc;
  const ey=eyes.length?Math.min(...eyes.map(p=>p.y)):P.topY+3, my=mouth.length?Math.min(...mouth.map(p=>p.y)):ey+3;
  const by=body.length?Math.min(...body.map(p=>p.y)):P.topY, half=(body.length?Math.max(...body.map(p=>Math.abs(p.x-P.N/2+0.5))):4)*sc;
  const u=Math.max(2,Math.round(sc*P.f/1.5)), R=(x,y,w2,h,col)=>{ c.fillStyle=col; c.fillRect(Math.round(x),Math.round(y),Math.round(w2),Math.round(h)); };
  if(w.head==="Cap"){ R(cx-4*u,Y(by)-2*u,8*u,2*u,"#e2483f"); R(cx,Y(by)-u,5*u,u,"#b8352e"); }
  if(w.head==="Top hat"){ R(cx-3*u,Y(by)-6*u,6*u,6*u,"#1b1b1f"); R(cx-5*u,Y(by)-u,10*u,u,"#1b1b1f"); R(cx-3*u,Y(by)-2*u,6*u,u,"#c43b6a"); }
  if(w.head==="Crown"){ R(cx-4*u,Y(by)-2*u,8*u,2*u,"#ffd23f"); for(const k of [-4,-1,2]) R(cx+k*u,Y(by)-4*u,2*u,2*u,"#ffd23f"); }
  if(w.head==="Party hat"){ for(let k=0;k<5;k++) R(cx-(5-k)*u/1.2,Y(by)-(k+1)*u,(10-2*k)*u/1.2,u,k%2?"#3b6fb8":"#f2c94c"); }
  if(w.head==="Bow"){ R(cx-4*u,Y(by)-2*u,3*u,3*u,"#ff6fae"); R(cx+u,Y(by)-2*u,3*u,3*u,"#ff6fae"); R(cx-u,Y(by)-u,2*u,2*u,"#d94a8c"); }
  if(w.face==="Sunglasses"){ R(cx-5*u,Y(ey)-u/2,10*u,2*u,"#111"); }
  if(w.face==="Monocle"){ c.strokeStyle="#ffd23f"; c.lineWidth=Math.max(1,u/2); c.strokeRect(Math.round(cx+u),Math.round(Y(ey)-u),3*u,3*u); }
  if(w.mouth==="Mustache"){ R(cx-4*u,Y(my)-u,8*u,u,"#3a2418"); R(cx-5*u,Y(my),2*u,u,"#3a2418"); R(cx+3*u,Y(my),2*u,u,"#3a2418"); }
  if(w.back==="Bat wings"||w.back==="Angel wings"){ const col=w.back==="Bat wings"?"#2b2233":"#f4f4f4"; for(let k=0;k<4;k++){ R(cx-half-(k+2)*u,Y(by+2)-k*u,u*2,u*(4-k),col); R(cx+half+k*u,Y(by+2)-k*u,u*2,u*(4-k),col);} }
  if(w.feet==="Boots"){ R(cx-half/1.5-2*u,Y(P.base)-u,4*u,2*u,"#7a4a26"); R(cx+half/1.5-2*u,Y(P.base)-u,4*u,2*u,"#7a4a26"); }
}
/* What worn and held items do in a fight. */
function applyGear(s,f){
  const w=s.worn||{};
  for(const k of Object.values(w)){ const g=WORN[k]; if(!g) continue;
    const add=([n,i])=>{ if(i===0){ f.maxhp=Math.max(10,f.maxhp+n*2); f.hp=f.maxhp; } else { const key=["","pow","grd","mnd","spr","spd"][i]; f.base[key]=Math.max(1,f.base[key]+n); } };
    if(g.up) add(g.up); if(g.down) add(g.down);
    if(g.energy) f.energy+=1; if(g.crit) f.critBonus=(f.critBonus||0)+g.crit; if(g.acc) f.accMod=(f.accMod||0)+g.acc; if(g.monocle) f.monocle=true; }
  if(s.held==="Element stone") f.heldEl=s.m.el1;
  if(s.held==="Energy cell"){ f.energyBonus=1; f.maxhp=Math.round(f.maxhp*0.9); f.hp=f.maxhp; }
  if(s.held==="Life seed") f.lifeSeed=true;
  if(s.held==="Lucky bit") f.critBonus=(f.critBonus||0)+0.05;
  return f;
}
