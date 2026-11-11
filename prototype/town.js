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
const UPGRADES={"Kitchen":[1500,"A liked meal also takes 5 fatigue off"],"Better hut":[2000,"A rest week takes 45 fatigue off instead of 35"],"Training gear":[3000,"Great drills +5%"],"Big Freezer":[5000,"Holds 30 monsters instead of 20"]};
const has=u=>!!(PLAYER.upgrades&&PLAYER.upgrades[u]);
const priceOf=k=>MARKET[k]||(WORN[k]&&WORN[k].price)||(HELD[k]&&HELD[k].price)||(k.startsWith("Skill chip: ")?300:ITEMS[k]&&ITEMS[k].rarity===2?1500:0);
const wornText=k=>{ const w=WORN[k], p=[];
  if(w.up) p.push(`${STATS[w.up[1]]} +${w.up[0]}`); if(w.exp) p.push("Exp +10%"); if(w.energy) p.push("Starts fights with 1 more energy");
  if(w.crit) p.push("Crit +10%"); if(w.acc) p.push("Accuracy -5%"); if(w.monocle) p.push("Shows the opponent's exact stats");
  if(w.down) p.push(`${STATS[w.down[1]]} ${w.down[0]}`); return p.join(", "); };

function weekStock(){
  const R=rng(hashStr("stock|"+PLAYER.week)), wk=Object.keys(WORN), hd=Object.keys(HELD), worn=[];
  while(worn.length<4){ const k=wk[Math.floor(R()*wk.length)]; if(!worn.includes(k)) worn.push(k); }
  const chips=Object.entries(SKILLS).filter(([n,s])=>s.el&&s.el!=="Void"&&s.lv<=8&&s.fromStat===undefined).map(([n])=>n), ch=[];
  while(ch.length<3){ const n=chips[Math.floor(R()*chips.length)]; if(!ch.includes(n)) ch.push(n); }
  return {worn,held:hd[Math.floor(R()*hd.length)],chips:ch};
}
function buy(k,price,then){
  if(PLAYER.bits<price){ say("We can't afford that yet."); return; }
  PLAYER.bits-=price;
  if(WORN[k]||HELD[k]) addItem(k); else if(k.startsWith("Skill chip: ")) addItem(k); else addItem(k);
  say(`Bought ${/^[AEIOU]/.test(k)?"an":"a"} ${k} for ${price} bits.`); drawUI(); saveGame(); if(then) then();
}
function openTown(){
  if(RS) RS.inTown=true;
  panel(`<div class="full lab-head"><b>Town</b><button class="small" id="tw-back">Back</button></div><div class="full lab-info">The Item shop and Skill shop restock every week.</div>
    <button class="rb" id="tw-m">Market<small>Snacks, medicine, toys</small></button><button class="rb" id="tw-i">Item shop<small>Hats, charms, gear</small></button>
    <button class="rb" id="tw-s">Skill shop<small>Tier 1 chips</small></button><button class="rb" id="tw-w">Workshop<small>Ranch upgrades</small></button>
    <button class="rb" id="tw-sell">Sell<small>Half price back</small></button>`);
  el("tw-m").onclick=openMarket; el("tw-i").onclick=openItemShop; el("tw-s").onclick=openSkillShop; el("tw-w").onclick=openWorkshop; el("tw-sell").onclick=openSell; el("tw-back").onclick=()=>menu("Out");
}
function shopList(title,rows,back){
  panel(`<div style="flex-basis:100%;font-size:13px">${title} ${PLAYER.bits} bits.</div>`+rows.map((r,i)=>`<button class="rb" data-s="${i}" ${PLAYER.bits<r.price||r.off?"disabled":""}>${r.name} · ${r.price}<small>${r.desc}</small></button>`).join("")+`<button class="rb" id="sh-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{ const r=rows[+b.dataset.s]; r.buy?r.buy():buy(r.name,r.price,back); });
  el("sh-back").onclick=openTown;
}
function openMarket(){ shopList("Market.",Object.entries(MARKET).map(([k,p])=>({name:k,price:p,desc:`You have ${PLAYER.bag[k]||0}`})),openMarket); }
function openItemShop(){ const st=weekStock();
  shopList("Item shop, this week.",st.worn.map(k=>({name:k,price:WORN[k].price,desc:`${WORN[k].slot}: ${wornText(k)}`})).concat([{name:st.held,price:HELD[st.held].price,desc:"Held: "+HELD[st.held].desc}]),openItemShop); }
function openSkillShop(){ const st=weekStock();
  shopList("Skill shop, this week.",st.chips.map(n=>({name:"Skill chip: "+n,price:300,desc:`${SKILLS[n].el} ${SKILLS[n].kind}. ${describe(n)}`})),openSkillShop); }
function openWorkshop(){
  PLAYER.upgrades=PLAYER.upgrades||{};
  shopList("Workshop. Each upgrade is bought once.",Object.entries(UPGRADES).map(([k,[p,d]])=>({name:k,price:p,desc:has(k)?"Built":d,off:has(k),
    buy:()=>{ if(PLAYER.bits<p) return; PLAYER.bits-=p; PLAYER.upgrades[k]=true; say(`The ${k} is built.`); drawUI(); saveGame(); openWorkshop(); }})),openWorkshop);
}
function openSell(){
  const bag=PLAYER.bag, names=Object.keys(bag).filter(k=>bag[k]>0&&priceOf(k)>0);
  panel(`<div style="flex-basis:100%;font-size:13px">Sell for half price. ${PLAYER.bits} bits.</div>`+names.map(k=>`<button class="rb" data-x="${k}">${k} ×${bag[k]}<small>${Math.floor(priceOf(k)/2)} bits</small></button>`).join("")+`<button class="rb" id="sl-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{ const k=b.dataset.x; bag[k]--; if(bag[k]<=0) delete bag[k]; PLAYER.bits+=Math.floor(priceOf(k)/2); drawUI(); saveGame(); openSell(); });
  el("sl-back").onclick=openTown;
}

/* ---------- wearing and holding ---------- */
function openWear(){
  const s=RS; s.worn=s.worn||{}; const bag=PLAYER.bag;
  const slots=["head","face","mouth","back","feet"];
  const owned=Object.keys(WORN).filter(k=>bag[k]>0), heldOwned=Object.keys(HELD).filter(k=>bag[k]>0);
  panel(`<div style="flex-basis:100%;font-size:13px">Worn items show on it and change two stats. One per socket, plus one held item for fights.</div>`+
    slots.map(sl=>`<div style="flex-basis:100%;font-size:13px"><b>${sl[0].toUpperCase()+sl.slice(1)}:</b> ${s.worn[sl]?`${s.worn[sl]} (${wornText(s.worn[sl])}) <button class="small" data-off="${sl}">Take off</button>`:"empty"}</div>`).join("")+
    `<div style="flex-basis:100%;font-size:13px"><b>Held:</b> ${s.held?`${s.held} (${HELD[s.held].desc}) <button class="small" data-off="held">Take off</button>`:"nothing"}</div>`+
    owned.map(k=>`<button class="rb" data-w="${k}">${k} ×${bag[k]}<small>${WORN[k].slot}: ${wornText(k)}</small></button>`).join("")+
    heldOwned.map(k=>`<button class="rb" data-h="${k}">${k} ×${bag[k]}<small>Hold: ${HELD[k].desc}</small></button>`).join("")+`<button class="rb" id="wr-back">Back</button>`);
  el("r-panel").querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{ const k=b.dataset.w, sl=WORN[k].slot; if(s.worn[sl]) addItem(s.worn[sl]); bag[k]--; if(bag[k]<=0) delete bag[k]; s.worn[sl]=k; saveGame(); openWear(); });
  el("r-panel").querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{ const k=b.dataset.h; if(s.held) addItem(s.held); bag[k]--; if(bag[k]<=0) delete bag[k]; s.held=k; saveGame(); openWear(); });
  el("r-panel").querySelectorAll("[data-off]").forEach(b=>b.onclick=()=>{ const sl=b.dataset.off; if(sl==="held"){ addItem(s.held); s.held=null; } else { addItem(s.worn[sl]); delete s.worn[sl]; } saveGame(); openWear(); });
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
