/* The test arena: open the game with #arena at the end of the address to try the new real-time fight on a phone.
   Pick your family and the opponent's, then walk with the arrows, scroll the move list, and tap the gold move to use it.
   Needs arena.js and the game's art (chibi.js, chibi-hook.js). Nothing here touches the save. */
let AT=null;
const AT_RC={Close:"#ff8a7a",Near:"#ffb35c",Mid:"#8fd3ff",Far:"#c7a6ff",Any:"#c9cbd6"};

function atStyle(){
  if(document.getElementById("at-style")) return;
  const st=document.createElement("style"); st.id="at-style";
  st.textContent=`#atest{position:fixed;inset:0;background:#14151d;z-index:120;color:#e8e9f2;font-family:var(--pix),system-ui;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none;touch-action:manipulation}
#atest .top{display:grid;grid-template-columns:1fr 54px 1fr;gap:6px;padding:calc(var(--safe-t,0px) + 10px) 10px 6px;align-items:center}
#atest .who b{font-size:14px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#atest .who.r{text-align:right}
#atest .bar{height:9px;border-radius:5px;background:#262836;margin-top:4px;overflow:hidden;position:relative}#atest .bar i{position:absolute;top:0;bottom:0;border-radius:5px;transition:width .15s}
#atest .who .bar i{left:0}#atest .who.r .bar i{right:0}
#atest .hp i{background:#5ad18a}#atest .fo i{background:#ffc93c}#atest .lbl{font-size:10px;color:#8b8fa8;margin-top:2px}
#atest .clock{font-size:26px;font-weight:700;text-align:center;color:#ffc93c}
#atest .track{margin:2px 10px 6px;position:relative;height:30px;background:#1d1f2b;border-radius:8px}
#atest .track .wall{position:absolute;top:0;bottom:0;width:6px;background:#6b5a8a;border-radius:3px}
#atest .track .dot{position:absolute;top:7px;width:16px;height:16px;margin-left:-8px;border-radius:50%;border:2px solid #14151d}
#atest .track .gap{position:absolute;top:13px;height:4px;background:repeating-linear-gradient(90deg,#ffc93c 0 6px,transparent 6px 10px)}
#atest .track .tag{position:absolute;top:-2px;font-size:11px;font-weight:700;color:#ffc93c;transform:translateX(-50%);background:#1d1f2b;padding:0 6px;border-radius:6px}
#atest canvas{width:100%;display:block;flex:none}
#atest .ctl{flex:1;min-height:0;display:grid;grid-template-columns:118px 1fr;gap:10px;padding:10px}
#atest .moveb{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-content:start}
#atest .btn{background:#262836;border:2px solid #3a3d52;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#e8e9f2;font:inherit;font-weight:700}
#atest .btn:active,#atest .btn.on{background:#3a3d52}
#atest .walk{height:84px;font-size:30px}#atest .shove{grid-column:1/3;height:60px;flex-direction:column;font-size:15px}#atest .shove small{font-size:10px;font-weight:500;color:#8b8fa8}
#atest .shove.off{opacity:.4}#atest .auto{grid-column:1/3;height:40px;font-size:13px}#atest .auto.on{border-color:#ffc93c;color:#ffc93c}
#atest .list{display:flex;flex-direction:column;gap:6px;min-height:0}#atest .arrow{height:34px;font-size:16px;flex:none}
#atest .rows{display:flex;flex-direction:column;gap:6px;overflow:hidden}
#atest .sk{display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;background:#1d1f2b;border:2px solid #2c2f40;border-radius:10px;padding:8px 10px;font-size:14px}
#atest .sk.off{opacity:.38}#atest .sk.sel{border-color:#ffc93c;background:#2a2617}#atest .sk.poor .co{color:#ff8a7a}
#atest .sk .rg{font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;color:#14151d}
#atest .sk .co{font-size:12px;color:#ffc93c;min-width:22px;text-align:right}
#atest .pick{padding:20px 14px;overflow:auto}#atest .pick h2{font-size:20px;margin:6px 0 4px}#atest .pick p{color:#8b8fa8;font-size:13px;margin:0 0 10px}
#atest .fams{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}#atest .fams .btn{height:44px;font-size:13px}#atest .fams .btn.on{border-color:#ffc93c;color:#ffc93c}
#atest .go{height:54px;width:100%;font-size:17px;background:#ffc93c;color:#14151d;border-color:#ffc93c;margin-top:6px}
#atest .res{position:absolute;left:16px;right:16px;top:38%;background:#1d1f2b;border:2px solid #ffc93c;border-radius:14px;padding:16px;text-align:center}
#atest .res h2{margin:0 0 6px;color:#ffc93c}#atest .res .row{display:flex;gap:8px;margin-top:12px}#atest .res .btn{flex:1;height:46px}`;
  document.head.appendChild(st);
}

function openArenaTest(){
  atStyle();
  let d=document.getElementById("atest"); if(!d){ d=document.createElement("div"); d.id="atest"; document.body.appendChild(d); }
  d.style.display="flex";
  const fams=Object.keys(FAM_MOVES), pick={me:"Chomp",foe:"Booly"};
  const draw=()=>{ d.innerHTML=`<div class="pick"><h2>Test arena</h2><p>Both Snabits are level 30 at grade B, so every family move is learned. Nothing here touches your save.</p>
    <h2 style="font-size:15px">Your Snabit</h2><div class="fams" id="at-me">${fams.map(f=>`<button class="btn ${f===pick.me?"on":""}" data-f="${f}">${f}</button>`).join("")}</div>
    <h2 style="font-size:15px">Opponent</h2><div class="fams" id="at-foe">${fams.map(f=>`<button class="btn ${f===pick.foe?"on":""}" data-f="${f}">${f}</button>`).join("")}</div>
    <button class="btn go" id="at-go">Fight</button><button class="btn" id="at-quit" style="width:100%;height:44px;margin-top:8px">Back to the title</button></div>`;
    d.querySelectorAll("#at-me [data-f]").forEach(b=>b.onclick=()=>{ pick.me=b.dataset.f; draw(); });
    d.querySelectorAll("#at-foe [data-f]").forEach(b=>b.onclick=()=>{ pick.foe=b.dataset.f; draw(); });
    document.getElementById("at-go").onclick=()=>atStart(pick.me,pick.foe);
    document.getElementById("at-quit").onclick=()=>{ atStop(); d.style.display="none"; location.hash=""; if(typeof showTitle==="function") showTitle(); }; };
  atStop(); draw();
}
function atMake(fam,R){
  let o; for(let k=0;k<500;k++){ o=gradedOpponent("B",30,R,null,260); if(o.m.family===fam) break; }
  const f=makeFighter(o.fm,o.skills,30); f.family=fam; f.moves=arMoves(fam,30,o.m.pool.filter(n=>SKILLS[n].lv<=30),o.m.el1);
  return {f,o,spec:typeof chibiSpec==="function"?chibiSpec(o.fm):null};
}
function atStop(){ if(AT){ cancelAnimationFrame(AT.raf); AT=null; } }
function atStart(meFam,foeFam){
  atStop();
  const R=Math.random, A=atMake(meFam,R), B=atMake(foeFam,R), ar=new Arena(A.f,B.f,R,["human","smart"]);
  const order=["Close","Near","Mid","Far","Any"];
  const moves=A.f.moves.slice().sort((a,b)=>order.indexOf(a.range)-order.indexOf(b.range)||a.cost-b.cost);
  AT={ar,A,B,moves,sel:0,top:0,auto:false,last:performance.now(),acc:0,raf:0,side:[{},{}].map(()=>({x:null,pose:"idle",until:0,lunge:0,flash:0,jump:0})),fx:[],shots:[],done:false,me:meFam,foe:foeFam};
  const d=document.getElementById("atest");
  d.innerHTML=`<div class="top"><div class="who"><b>${A.f.name}</b><div class="bar hp"><i id="at-hp0"></i></div><div class="bar fo"><i id="at-fo0"></i></div><div class="lbl" id="at-l0"></div></div>
    <div class="clock" id="at-clock">60</div><div class="who r"><b>${B.f.name}</b><div class="bar hp"><i id="at-hp1"></i></div><div class="bar fo"><i id="at-fo1"></i></div><div class="lbl" id="at-l1"></div></div></div>
    <div class="track"><div class="wall" style="left:0"></div><div class="wall" style="right:0"></div><div class="gap" id="at-gap"></div><div class="tag" id="at-tag"></div><div class="dot" id="at-d0" style="background:#ffb35c"></div><div class="dot" id="at-d1" style="background:#c7a6ff"></div></div>
    <canvas id="at-cv"></canvas>
    <div class="ctl"><div class="moveb"><button class="btn walk" id="at-l">◀</button><button class="btn walk" id="at-r">▶</button><button class="btn shove" id="at-shove">Shove<small>Close only</small></button><button class="btn auto" id="at-auto">Auto</button></div>
    <div class="list"><button class="btn arrow" id="at-up">▲</button><div class="rows" id="at-rows"></div><button class="btn arrow" id="at-dn">▼</button></div></div>`;
  const hold=(id,dir)=>{ const b=document.getElementById(id), on=e=>{ e.preventDefault(); ar.p[0].wantDir=dir; b.classList.add("on"); }, off=()=>{ if(ar.p[0].wantDir===dir) ar.p[0].wantDir=0; b.classList.remove("on"); };
    b.addEventListener("pointerdown",on); b.addEventListener("pointerup",off); b.addEventListener("pointercancel",off); b.addEventListener("pointerleave",off); };
  hold("at-l",-1); hold("at-r",1);
  document.getElementById("at-shove").onclick=()=>ar.shove(ar.p[0]);
  document.getElementById("at-auto").onclick=e=>{ AT.auto=!AT.auto; ar.p[0].ai=AT.auto?"smart":"human"; e.currentTarget.classList.toggle("on",AT.auto); };
  document.getElementById("at-up").onclick=()=>{ AT.sel=Math.max(0,AT.sel-1); atRows(true); };
  document.getElementById("at-dn").onclick=()=>{ AT.sel=Math.min(moves.length-1,AT.sel+1); atRows(true); };
  document.getElementById("at-rows").onclick=e=>{ const r=e.target.closest("[data-k]"); if(!r) return; const k=+r.dataset.k;
    if(k!==AT.sel){ AT.sel=k; atRows(true); return; } ar.start(ar.p[0],moves[k]); };
  atRows(true); atSize();
  AT.raf=requestAnimationFrame(atLoop);
}
function atSize(){ const cv=document.getElementById("at-cv"), W=cv.clientWidth||390, H=Math.round(Math.min(260,Math.max(190,W*0.62))), dpr=Math.min(2,devicePixelRatio||1);
  cv.width=W*dpr; cv.height=H*dpr; cv.style.height=H+"px"; AT.W=W; AT.H=H; AT.dpr=dpr; }
/* the move list: six rows round the selected move; moves that reach from here light up */
function atRows(scroll){
  const ar=AT.ar, p=ar.p[0], n=6, rows=document.getElementById("at-rows"); if(!rows) return;
  if(scroll){ if(AT.sel<AT.top) AT.top=AT.sel; if(AT.sel>AT.top+n-1) AT.top=AT.sel-n+1; }
  const html=AT.moves.slice(AT.top,AT.top+n).map((m,j)=>{ const k=AT.top+j, on=ar.inRange(m);
    return `<div class="sk ${on?"":"off"} ${k===AT.sel?"sel":""} ${on&&p.focus<m.cost?"poor":""}" data-k="${k}"><span>${m.name}</span><span class="rg" style="background:${AT_RC[m.range]}">${m.range}</span><span class="co">${m.cost}</span></div>`; }).join("");
  if(html!==AT.rowsHtml){ rows.innerHTML=html; AT.rowsHtml=html; }
}
function atLoop(now){
  if(!AT) return; const ar=AT.ar;
  AT.acc+=Math.min(0.25,(now-AT.last)/1000); AT.last=now;
  while(AT.acc>=AR.DT&&!ar.over){ AT.acc-=AR.DT; ar.ev=[]; ar.step(); for(const e of ar.ev) atEvent(e,now); }
  atHud(); atRows(false); atDraw(now);
  if(ar.over&&!AT.done){ AT.done=true; setTimeout(atResult,900); }
  AT.raf=requestAnimationFrame(atLoop);
}
function atEvent(e,now){
  const S=AT.side, m=e.m, cast=m&&(m.cast||m.range==="Mid"||m.range==="Far");
  if(e.t==="start"){ S[e.i].pose=m&&m.dmg?(cast?"cast":"crouch"):"jump"; S[e.i].until=now+Math.max(200,m.wind*1000); }
  if(e.t==="hit"||e.t==="miss"){ const o=1-e.i;
    if(e.t==="hit"&&e.h>0){} else if(cast) AT.shots.push({from:e.i,t0:now,dur:260,col:atCol(m),big:m.dmg>=60});
    else { S[e.i].lunge=now; S[e.i].pose=m.dmg>=50?"slam":"attack"; S[e.i].until=now+260; }
    if(e.t==="hit"){ S[o].pose="hit"; S[o].until=now+320; S[o].flash=now; AT.fx.push({i:o,t0:now,txt:String(e.dmg),crit:e.crit}); if(typeof sfx==="function") try{ sfx(e.crit?"crit":"hit"); }catch(err){} }
    else AT.fx.push({i:o,t0:now,txt:e.why==="out"?"Out of reach":e.why==="block"?"Blocked":"Miss"}); }
  if(e.t==="swap"){ S[0].jump=now; S[1].jump=now; }
  if(e.t==="slam"){ S[e.i].pose="hit"; S[e.i].until=now+500; AT.fx.push({i:e.i,t0:now,txt:`Wall ${e.dmg}`,crit:true}); }
  if(e.t==="buff"){ AT.fx.push({i:e.i,t0:now,txt:m.name,buff:true}); }
}
function atCol(m){ const c=m.el&&typeof ELC==="function"?ELC(m.el):null; return c&&c!=="#888"?c:({Antik:"#ffe07a",Squib:"#7fd3f2",Moko:"#ff9ad6",Booly:"#9fb8ff",Skit:"#f4efe4"}[AT.ar.p[0].f.family]||"#ffffff"); }
function atHud(){
  const ar=AT.ar, g=ar.gap(), X=x=>3+x/AR.LEN*94;
  ar.p.forEach((p,i)=>{ document.getElementById("at-hp"+i).style.width=(100*p.hp/p.maxhp)+"%"; document.getElementById("at-fo"+i).style.width=(100*p.focus/99)+"%";
    document.getElementById("at-l"+i).textContent=`HP ${p.hp} · Focus ${Math.floor(p.focus)}`; document.getElementById("at-d"+i).style.left=X(p.x)+"%"; });
  const a=Math.min(ar.p[0].x,ar.p[1].x), b=Math.max(ar.p[0].x,ar.p[1].x);
  const gp=document.getElementById("at-gap"); gp.style.left=X(a)+"%"; gp.style.width=(X(b)-X(a))+"%";
  const tg=document.getElementById("at-tag"); tg.style.left=X((a+b)/2)+"%"; tg.textContent=arBand(g);
  document.getElementById("at-clock").textContent=Math.max(0,Math.ceil(AR.TIME-ar.t));
  const sh=document.getElementById("at-shove"), can=arBand(g)==="Close"&&!(ar.p[0].shoveCool>0);
  sh.classList.toggle("off",!can); sh.querySelector("small").textContent=arBand(g)!=="Close"?"Close only":ar.p[0].shoveCool>0?"Ready soon":"Free";
}
function atDraw(now){
  const cv=document.getElementById("at-cv"); if(!cv) return; const c=cv.getContext("2d"), W=AT.W, H=AT.H, dpr=AT.dpr, ar=AT.ar;
  c.setTransform(dpr,0,0,dpr,0,0);
  if(!AT.bg){ const b=document.createElement("canvas"); b.width=W*dpr; b.height=H*dpr; const x=b.getContext("2d"); x.scale(dpr,dpr); atStage(x,W,H); AT.bg=b; }
  c.drawImage(AT.bg,0,0,W,H);
  const floor=H-38, X=x=>34+x/AR.LEN*(W-68);
  ar.p.forEach((p,i)=>{ const S=AT.side[i]; S.x=S.x==null?X(p.x):S.x+(X(p.x)-S.x)*0.25; });
  { // the steps are smaller than the drawings, so at Close the two are drawn just touching rather than overlapping
    const a=AT.side[0], b=AT.side[1], min=58, gap=Math.abs(b.x-a.x); if(gap<min){ const mid=Math.max(34+min/2,Math.min(W-34-min/2,(a.x+b.x)/2)), s=b.x>=a.x?1:-1; a.dx=mid-s*min/2; b.dx=mid+s*min/2; } else { a.dx=a.x; b.dx=b.x; } }
  [0,1].forEach(i=>{ const p=ar.p[i], S=AT.side[i], sp=i?AT.B.spec:AT.A.spec, foe=AT.side[1-i], dir=foe.dx>S.dx?1:-1;
    let pose=now<S.until?S.pose:(p.wantDir||Math.abs(S.x-X(p.x))>1.5?"walk":"idle"); if(ar.over&&ar.winner===1-i) pose="ko";
    let x=S.dx; if(now-S.lunge<260) x+=dir*Math.sin((now-S.lunge)/260*Math.PI)*16;
    let y=floor; if(now-S.jump<420) y-=Math.sin((now-S.jump)/420*Math.PI)*34;
    c.fillStyle="rgba(0,0,0,.2)"; c.beginPath(); c.ellipse(S.dx,floor+2,24,6,0,0,7); c.fill();
    if(sp&&typeof CHIBI!=="undefined"){ const h=CHIBI.height(sp.stage,sp.marks,sp.family), u=Math.min(0.5,96/(h+20));
      c.save(); c.setTransform(dpr*u,0,0,dpr*u,dpr*(x-100*u),dpr*(y-188*u)); CHIBI.draw(c,sp,pose,now,[dir,0]); c.restore(); }
    if(now-S.flash<120){ c.fillStyle="rgba(255,255,255,.35)"; c.beginPath(); c.ellipse(x,y-34,30,34,0,0,7); c.fill(); } });
  // shots fly from one Snabit to the other
  AT.shots=AT.shots.filter(s=>now-s.t0<s.dur); for(const s of AT.shots){ const k=(now-s.t0)/s.dur, a=AT.side[s.from], b=AT.side[1-s.from], x=a.dx+(b.dx-a.dx)*k, y=floor-40;
    if(s.big){ c.strokeStyle=s.col; c.lineWidth=6; c.globalAlpha=0.8; c.beginPath(); c.moveTo(a.dx,y); c.lineTo(x,y); c.stroke(); c.globalAlpha=1; }
    c.fillStyle=s.col; c.beginPath(); c.arc(x,y,s.big?9:6,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.arc(x-2,y-2,2.4,0,7); c.fill(); }
  // damage numbers and words
  AT.fx=AT.fx.filter(f=>now-f.t0<900); c.textAlign="center"; for(const f of AT.fx){ const k=(now-f.t0)/900, S=AT.side[f.i];
    c.font=`700 ${f.crit?17:14}px system-ui`; c.globalAlpha=1-k*k; c.lineWidth=4; c.strokeStyle="#14151d"; c.fillStyle=f.buff?"#8fd3ff":f.crit?"#ffc93c":"#ffffff";
    const y=floor-84-k*26; c.strokeText(f.txt,S.dx,y); c.fillText(f.txt,S.dx,y); c.globalAlpha=1; }
}
function atStage(c,W,H){
  const sky=c.createLinearGradient(0,0,0,H*0.45); sky.addColorStop(0,"#2a1f4a"); sky.addColorStop(1,"#3a2b5e"); c.fillStyle=sky; c.fillRect(0,0,W,H);
  const cols=["#ffb35c","#8fd3ff","#ff8a7a","#c7a6ff","#5ad18a","#ffe07a","#f4efe4"], top=H*0.42;
  for(let r=0;r<5;r++) for(let x=0;x<W;x+=13){ const cx=x+(r%2?6:0), cy=12+r*(top-20)/5; c.fillStyle=cols[((x*131+r*977)>>3)%cols.length]; c.beginPath(); c.arc(cx,cy,4.5,0,7); c.fill(); }
  for(let k=0;k<6;k++){ c.fillStyle=["#e2483f","#3b6fb8","#f2c14e","#4caf6a","#c08cff","#ff8a3d"][k]; c.fillRect(6+k*(W-12)/6,top-8,(W-12)/6-5,8); }
  const fl=c.createLinearGradient(0,top,0,H); fl.addColorStop(0,"#d9a866"); fl.addColorStop(1,"#c08b4c"); c.fillStyle=fl; c.fillRect(0,top,W,H-top);
  c.strokeStyle="rgba(255,255,255,.35)"; c.lineWidth=2; c.beginPath(); c.moveTo(14,H-36); c.lineTo(W-14,H-36); c.stroke();
  for(const x of [0,W-12]){ c.fillStyle="#6b5a8a"; c.fillRect(x,top-20,12,H-top+20); c.fillStyle="#8a78ab"; c.fillRect(x,top-20,12,5); for(let y=top-8;y<H;y+=14){ c.fillStyle="rgba(0,0,0,.18)"; c.fillRect(x,y,12,2);} }
}
function atResult(){
  if(!AT) return; const ar=AT.ar, d=document.getElementById("atest"), w=ar.winner;
  const div=document.createElement("div"); div.className="res";
  div.innerHTML=`<h2>${w===0?"You win":w===1?"You lose":"Draw"}</h2><div>${ar.judged?"Judges' call after 60 seconds":`Knockout at ${Math.round(ar.t)} seconds`}. You dealt ${ar.p[0].dealt} and took ${ar.p[1].dealt}.</div>
    <div class="row"><button class="btn" id="at-again">Again</button><button class="btn" id="at-pick">Pick Snabits</button></div>`;
  d.appendChild(div);
  document.getElementById("at-again").onclick=()=>atStart(AT.me,AT.foe); document.getElementById("at-pick").onclick=openArenaTest;
}
