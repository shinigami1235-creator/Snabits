/* The test arena: open the game with #arena at the end of the address to try the new real-time fight on a phone.
   Pick your family and the opponent's, then walk with the arrows, scroll the move list, and tap the gold move to use it.
   Needs arena.js and the game's art (chibi.js, chibi-hook.js). Nothing here touches the save. */
let AT=null;
const AT_RC={Close:"#ff8a7a",Near:"#ffb35c",Mid:"#8fd3ff",Far:"#c7a6ff",Any:"#c9cbd6"};

function atStyle(){
  if(document.getElementById("at-style")) return;
  const st=document.createElement("style"); st.id="at-style";
  st.textContent=`#atest{position:fixed;inset:0;background:#14151d;z-index:120;color:#e8e9f2;font-family:var(--pix),system-ui;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none;touch-action:manipulation}
#atest .btn{background:#262836;border:2px solid #3a3d52;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#e8e9f2;font:inherit;font-weight:700}
#atest .btn:active,#atest .btn.on{background:#3a3d52}
#atest .pick{padding:20px 14px;overflow:auto}#atest .pick h2{font-size:20px;margin:6px 0 4px}#atest .pick p{color:#8b8fa8;font-size:13px;margin:0 0 10px}
#atest .fams{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}#atest .fams .btn{height:44px;font-size:13px}#atest .fams .btn.on{border-color:#ffc93c;color:#ffc93c}
#atest .go{height:54px;width:100%;font-size:17px;background:#ffc93c;color:#14151d;border-color:#ffc93c;margin-top:6px}
#atest .scr{position:relative;flex:1 1 auto;min-height:260px;padding-top:var(--safe-t,0px);background:#1b1630;overflow:hidden}
#atest .scr canvas{position:absolute;left:0;right:0;top:var(--safe-t,0px);width:100%;display:block}
#atest .scr::after{content:"";position:absolute;left:0;right:0;top:0;height:calc(var(--safe-t,0px) + 56px);background:linear-gradient(rgba(20,21,29,.7),transparent);pointer-events:none}
#atest .htop{position:absolute;z-index:1;left:50%;width:54px;margin-left:-27px;top:calc(var(--safe-t,0px) + 8px);pointer-events:none}
#atest .hb .nm{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #14151d}#atest .hb.r{text-align:right}
#atest .hpb{height:16px;border-radius:5px;background:rgba(20,21,29,.85);border:2px solid #3a3d52;margin-top:3px;position:relative;overflow:hidden}
#atest .hpb i{position:absolute;top:0;bottom:0;left:0;background:linear-gradient(#7be3a3,#41b872)}#atest .r .hpb i{left:auto;right:0}
#atest .hpb b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;text-shadow:0 1px 2px #14151d,0 0 3px #14151d}
#atest .clock2{font:700 22px var(--pix),system-ui;color:#ffc93c;background:rgba(20,21,29,.85);border:2px solid #ffc93c;border-radius:10px;text-align:center;padding:4px 0}
#atest .hbot{position:absolute;left:4px;right:4px;bottom:4px;display:grid;grid-template-columns:1fr 62px 1fr;gap:4px;pointer-events:none}
#atest .side{background:rgba(20,21,29,.88);border:2px solid #3a3d52;border-radius:10px;padding:4px}
#atest .mv{font-size:12px;font-weight:700;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:16px}#atest .foe .mv{color:#ffb4a8}
#atest .strip{display:flex;gap:3px;margin-top:3px}#atest .strip .sc{flex:1}
#atest .hbot.atsw .me{order:3}#atest .hbot.atsw .mid{order:2}#atest .hbot.atsw .foe{order:1}#atest .hbot.atsw .strip{flex-direction:row-reverse}#atest .hbot.atsw .mid b{flex-direction:row-reverse}
#atest .hbot.atsw .me .fob i{left:auto;right:0}#atest .hbot.atsw .foe .fob i{right:auto;left:0}#atest .hbot.flash{animation:atsw .35s}@keyframes atsw{0%{opacity:.2}100%{opacity:1}}
#atest .sc{position:relative;height:38px;border-radius:7px;background:#232533;border-top:3px solid var(--rc);display:flex;align-items:center;justify-content:center;color:#7d8199}
#atest .sc svg{width:20px;height:20px}#atest .sc i{position:absolute;right:2px;bottom:0;font-style:normal;font-size:8px;color:#ffc93c;font-weight:700}#atest .sc.none{opacity:.35}
#atest .sc.lit{background:#ffc93c;color:#14151d}#atest .sc.lit i{color:#14151d}#atest .sc.foe.lit{background:#ff8a7a}
#atest .sc.lit::after{content:"";position:absolute;left:50%;bottom:-8px;margin-left:-5px;border:5px solid transparent;border-top-color:#fff}
#atest .fob{height:7px;border-radius:4px;background:#262836;margin-top:6px;position:relative;overflow:hidden}
#atest .fob i{position:absolute;top:0;bottom:0;left:0;background:linear-gradient(#ffd75a,#f2a92c)}#atest .foe .fob i{left:auto;right:0}
#atest .fob .need{position:absolute;top:0;bottom:0;width:2px;background:#fff}
#atest .mid{background:rgba(20,21,29,.88);border:2px solid #3a3d52;border-radius:10px;display:flex;flex-direction:column;justify-content:center;gap:4px;padding:3px 2px}
#atest .mid div{display:flex;flex-direction:column;align-items:center;line-height:1.05}#atest .mid span{font-size:9px;color:#8b8fa8;font-weight:700}
#atest .mid b{display:flex;gap:6px;font-size:13px}#atest .mid b em{font-style:normal;color:#ffb4a8}#atest .mid .ok{color:#ffc93c}
#atest .ctl3{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:56px 64px;gap:6px;padding:8px 12px calc(env(safe-area-inset-bottom,0px) + 10px);background:#14151d}
#atest .ctl3 .btn{font-size:20px}#atest .ctl3 .walk{font-size:26px}#atest .ctl3 svg{width:24px;height:24px}#atest .ctl3 .off{opacity:.35}#atest .ctl3 .on{border-color:#ffc93c;color:#ffc93c}
#atest .atk{grid-column:2/4;flex-direction:column;gap:1px;background:#ffc93c;color:#14151d;border-color:#ffc93c;font-size:16px}#atest .atk small{font-size:10px;font-weight:600;opacity:.8}
#atest .atk.poor{background:#3a3d52;color:#ff8a7a;border-color:#ff8a7a}#atest .atk.wait{filter:saturate(.4) brightness(.75)}
#atest .atk.no{animation:atno .3s}@keyframes atno{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
#atest .res{position:absolute;left:16px;right:16px;top:30%;background:#1d1f2b;border:2px solid #ffc93c;border-radius:14px;padding:16px;text-align:center}
#atest .res h2{margin:0 0 6px;color:#ffc93c}#atest .res .row{display:flex;gap:8px;margin-top:12px}#atest .res .btn{flex:1;height:46px}`;
  document.head.appendChild(st);
}

/* Practice battle, from the title screen or #arena. Your side can be a family preset, a Snabit from your ranch as it is now,
   or a fresh scan trained up to level 30. Nothing here touches the save. */
let AT_PICK={me:{kind:"fam",fam:"Chomp"},foe:"Random"};
function openArenaTest(){
  atStyle();
  let d=document.getElementById("atest"); if(!d){ d=document.createElement("div"); d.id="atest"; document.body.appendChild(d); }
  d.style.display="flex"; window.PRACTICE=false;
  const fams=Object.keys(FAM_MOVES), pick=AT_PICK, roster=(typeof PLAYER!=="undefined"&&PLAYER&&PLAYER.roster?PLAYER.roster:[]).map(atRanchOf);
  const on=q=>JSON.stringify(q)===JSON.stringify(pick.me)?"on":"";
  const draw=()=>{ d.innerHTML=`<div class="pick"><h2>Practice battle</h2><p>Pick who fights. Presets and scans fight at level 30 with every family move learned, and your own Snabits fight as they are now. Nothing here touches your save.</p>
    ${roster.length?`<h2 style="font-size:15px">Your Snabits</h2><div class="fams" id="at-ros">${roster.map((s,k)=>`<button class="btn ${on({kind:"ros",k})}" data-k="${k}" style="font-size:12px">${typeof displayName==="function"?displayName(s):s.m.name}<br>Lv ${s.level}</button>`).join("")}</div>`:""}
    <h2 style="font-size:15px">A new scan</h2><div class="fams"><button class="btn ${pick.me.kind==="scan"?"on":""}" id="at-scan" style="grid-column:1/5">${pick.me.kind==="scan"?`${pick.me.m.name} at level 30 · scan again`:"Scan a photo"}</button></div>
    <h2 style="font-size:15px">Presets</h2><div class="fams" id="at-me">${fams.map(f=>`<button class="btn ${on({kind:"fam",fam:f})}" data-f="${f}">${f}</button>`).join("")}</div>
    <h2 style="font-size:15px">Opponent</h2><div class="fams" id="at-foe">${["Random",...fams].map(f=>`<button class="btn ${f===pick.foe?"on":""}" data-f="${f}">${f}</button>`).join("")}</div>
    <button class="btn go" id="at-go">Fight</button><button class="btn" id="at-quit" style="width:100%;height:44px;margin-top:8px">Back to the title</button></div>`;
    d.querySelectorAll("#at-ros [data-k]").forEach(b=>b.onclick=()=>{ pick.me={kind:"ros",k:+b.dataset.k}; draw(); });
    d.querySelectorAll("#at-me [data-f]").forEach(b=>b.onclick=()=>{ pick.me={kind:"fam",fam:b.dataset.f}; draw(); });
    d.querySelectorAll("#at-foe [data-f]").forEach(b=>b.onclick=()=>{ pick.foe=b.dataset.f; draw(); });
    document.getElementById("at-scan").onclick=()=>{ window.PRACTICE=true; d.style.display="none"; if(typeof obShow==="function") obShow(false); openScope(); };
    document.getElementById("at-go").onclick=()=>atStart(pick.me,pick.foe);
    document.getElementById("at-quit").onclick=()=>{ atStop(); d.style.display="none"; if(/arena/.test(location.hash)) history.replaceState(null,"",location.pathname); if(typeof showTitle==="function") showTitle(); }; };
  atStop(); draw();
}
/* a roster entry as a full ranch state: the one open now, or rebuilt from its save */
const atRanchOf=e=>typeof RS!=="undefined"&&RS&&RS.id===e.id?RS:newRanch(e);
/* the scan card's button for practice: back to the picker with this Snabit chosen */
function atFromScan(m){ window.PRACTICE=false; AT_PICK.me={kind:"scan",m}; if(typeof camStop==="function") try{ camStop(); }catch(e){} openArenaTest(); }
/* a fighter from a pick: a family preset, a ranch Snabit as it is, or a monster trained up to level 30 */
function atMake(src,R,level,grade){
  if(typeof src==="string") src=src==="Random"?{kind:"fam",fam:Object.keys(FAM_MOVES)[Math.floor(R()*8)]}:{kind:"fam",fam:src};
  if(src.kind==="ros"){ const s=PLAYER.roster[src.k]&&atRanchOf(PLAYER.roster[src.k]); if(s){ const fm=fightMon(s), f=makeFighter(fm,s.equip,s.level); f.family=s.m.family;
    f.moves=arMoves(s.m.family,s.level,(s.skillsKnown||s.equip||[]).filter(n=>SKILLS[n]),s.m.el1); f.name=typeof displayName==="function"?displayName(s):f.name; return {f,spec:chibiSpec(fm),level:s.level,grade:s.grade}; } src={kind:"fam",fam:"Chomp"}; }
  // a ranch Snabit's opponent matches its level and grade; presets and scans fight at level 30 with grade B training
  const lv=level||30, g=grade||"B", earned=grade?undefined:260; let o;
  if(src.kind==="scan") o=gradedOpponent(g,lv,R,null,earned,src.m);
  else for(let k=0;k<500;k++){ o=gradedOpponent(g,lv,R,null,earned); if(o.m.family===src.fam) break; }
  const f=makeFighter(o.fm,o.skills,lv); f.family=o.m.family; f.moves=arMoves(o.m.family,lv,o.m.pool.filter(n=>SKILLS[n].lv<=lv),o.m.el1);
  if(src.kind==="scan") f.name=src.m.name;
  return {f,o,spec:typeof chibiSpec==="function"?chibiSpec(o.fm):null,level:lv};
}
function atStop(){ if(AT){ cancelAnimationFrame(AT.raf); AT=null; } }
function atStart(meFam,foeFam){   // picks: see atMake
  atStop();
  const R=Math.random, A=atMake(meFam,R), B=atMake(foeFam,R,A.level,A.grade), ar=new Arena(A.f,B.f,R,["human","smart"]); ar.live=true;   // each move pauses the fight while it plays
  const order=["Close","Near","Mid","Far","Any"];
  const moves=A.f.moves.slice().sort((a,b)=>order.indexOf(a.range)-order.indexOf(b.range)||a.cost-b.cost);
  AT={ar,A,B,moves,sel:0,top:0,auto:false,last:performance.now(),acc:0,te:0,freeze:0,trauma:0,raf:0,side:[A.spec,B.spec].map(spec=>({spec,x:null,shown:"idle",from:"idle",t0:0,dir:1})),fx:[],done:false,me:meFam,foe:foeFam};
  CB.parts=[]; CB.puffs=[];
  AT.special=[A,B].map(X=>{ const t=X.f.moves.filter(m=>m.dmg>=70).sort((a,b)=>b.dmg-a.dmg)[0]; return t?t.name:null; });
  AT.rings=[]; AT.stars=[]; AT.strikes=[];
  // each range has its own box; ▲ ▼ swap which of that range's moves sits in the selected box. Moves usable at any range join every box's list
  AT.lists={}; AT.idx={}; for(const b of AR.BANDS){ AT.lists[b]=moves.filter(m=>m.range===b).concat(moves.filter(m=>m.range==="Any")); AT.idx[b]=0; }
  // the opponent's strongest move at each range, so you can see where it's dangerous
  AT.foeBest={}; for(const b of AR.BANDS){ const c=B.f.moves.filter(m=>m.range===b&&m.dmg).sort((x,y)=>y.dmg*(y.hits||1)*y.acc-x.dmg*(x.hits||1)*x.acc); AT.foeBest[b]=c[0]||null; }
  const d=document.getElementById("atest");
  // MR2's way: each Snabit's four range cells sit on the fight screen and meet in the middle, Close at the centre.
  // ◀ ▶ walk left and right on screen. After a swap the two really trade places, and your row and numbers move to your side.
  const cells=side=>(side?AR.BANDS:AR.BANDS.slice().reverse()).map(b=>`<div class="sc${side?" foe":""}" style="--rc:${AT_RC[b]}" id="at-${side?"f":"y"}-${b}"></div>`).join("");
  d.innerHTML=`<div class="scr"><canvas id="at-cv"></canvas>
      <div class="htop"><div class="clock2" id="at-clock">60</div></div>
      <div class="hbot" id="at-hbot"><div class="side me"><div class="mv" id="at-mv0"></div><div class="strip">${cells(0)}</div><div class="fob" id="at-fb0"><i id="at-fo0"></i><span class="need" id="at-need"></span></div></div>
        <div class="mid"><div><span>Hit</span><b><i id="at-hit0"></i><em id="at-hit1"></em></b></div><div><span>Focus</span><b><i id="at-fn0"></i><em id="at-fn1"></em></b></div></div>
        <div class="side foe"><div class="mv" id="at-mv1"></div><div class="strip">${cells(1)}</div><div class="fob"><i id="at-fo1"></i></div></div></div></div>
    <div class="ctl3"><button class="btn walk" id="at-l" aria-label="Walk left">◀</button>
      <button class="btn arr" id="at-up" aria-label="Previous move for this range">▲</button><button class="btn arr" id="at-dn" aria-label="Next move for this range">▼</button><button class="btn walk" id="at-r" aria-label="Walk right">▶</button>
      <button class="btn ico" id="at-shove" aria-label="Shove">${AT_ICON.shove}</button><button class="btn atk" id="at-atk"><span id="at-atk-n">Attack</span><small id="at-atk-c"></small></button><button class="btn ico" id="at-auto" aria-label="Auto">${AT_ICON.auto}</button></div>`;
  const hold=(id,dir)=>{ const b=document.getElementById(id), on=e=>{ e.preventDefault(); ar.p[0].wantDir=dir; b.classList.add("on"); }, off=()=>{ if(ar.p[0].wantDir===dir) ar.p[0].wantDir=0; b.classList.remove("on"); };
    b.addEventListener("pointerdown",on); b.addEventListener("pointerup",off); b.addEventListener("pointercancel",off); b.addEventListener("pointerleave",off); };
  hold("at-l",-1); hold("at-r",1);
  document.getElementById("at-shove").onclick=()=>ar.shove(ar.p[0]);
  document.getElementById("at-auto").onclick=e=>{ AT.auto=!AT.auto; ar.p[0].ai=AT.auto?"smart":"human"; e.currentTarget.classList.toggle("on",AT.auto); };
  // ▲ ▼ change the move for the range you're standing in; Attack uses it
  const cyc=dirn=>{ const b=ar.band(), n=AT.lists[b].length; if(!n) return; AT.idx[b]=((AT.idx[b]+dirn)%n+n)%n; AT.rowsHtml=null; atRows(); };
  document.getElementById("at-up").onclick=()=>cyc(-1); document.getElementById("at-dn").onclick=()=>cyc(1);
  document.getElementById("at-atk").onclick=()=>{ const b=ar.band(), m=AT.lists[b][AT.idx[b]]; if(!m) return;
    if(!ar.start(ar.p[0],m)){ const k=document.getElementById("at-atk"); k.classList.remove("no"); void k.offsetWidth; k.classList.add("no"); } };
  atRows(); atSize();
  AT.raf=requestAnimationFrame(atLoop);
}
function atSize(){ const cv=document.getElementById("at-cv"), scr=cv.parentElement, W=scr.clientWidth||390;
  const pad=parseFloat(getComputedStyle(scr).paddingTop)||0, H=Math.round(Math.max(200,Math.min(700,scr.clientHeight-pad-6))), dpr=Math.min(2,devicePixelRatio||1);
  cv.style.height=H+"px"; cv.width=W*dpr; cv.height=H*dpr; AT.W=W; AT.H=H; AT.dpr=dpr; AT.WW=Math.round(W*1.6); AT.bg=null;
  // feet a little below the middle, so the fight sits in the centre of the screen with the clock in view.
  // the arena is drawn tall enough to fill the screen when the camera pulls all the way back
  const hb=document.getElementById("at-hbot"); AT.floorS=Math.round(Math.min(H-(hb?hb.offsetHeight:90)-22,H*0.6)); AT.zMin=W/AT.WW; AT.HH=Math.ceil(H/AT.zMin); AT.FY=Math.round(AT.floorS/AT.zMin); }
window.addEventListener("resize",()=>{ if(AT&&document.getElementById("at-cv")) atSize(); });
/* the range cells on the fight screen: yours and the opponent's, lit where the two of you stand now */
function atRows(){
  const ar=AT.ar, p=ar.p[0], band=ar.band(), key=band+"|"+AR.BANDS.map(b=>AT.idx[b]).join(",")+"|"+(p.focus>=((AT.lists[band][AT.idx[band]]||{}).cost||0))+"|"+!!(ar.turn||p.cool>0);
  if(key===AT.rowsHtml) return; AT.rowsHtml=key;
  for(const b of AR.BANDS){ const m=AT.lists[b][AT.idx[b]], c=document.getElementById("at-y-"+b), f=document.getElementById("at-f-"+b), fm=AT.foeBest[b];
    if(c){ c.className="sc"+(b===band?" lit":"")+(m?"":" none"); c.innerHTML=m?atIcon(m)+`<i>${m.cost}</i>`:""; }
    if(f){ f.className="sc foe"+(b===band?" lit":"")+(fm?"":" none"); f.innerHTML=fm?atIcon(fm):""; } }
  const fm=AT.foeBest[band]; document.getElementById("at-mv0").textContent=(AT.lists[band][AT.idx[band]]||{name:"Nothing in reach"}).name;
  document.getElementById("at-mv1").textContent=fm?fm.name:"Nothing in reach";
  const m=AT.lists[band][AT.idx[band]], atk=document.getElementById("at-atk");
  document.getElementById("at-atk-n").textContent=m?m.name:"Nothing in reach"; document.getElementById("at-atk-c").textContent=m?`${band} · ${m.cost} focus`:"";
  atk.classList.toggle("poor",!!m&&p.focus<m.cost); atk.classList.toggle("wait",!!(ar.turn||p.cool>0));
}
const AT_ICON=(()=>{ const sv=b=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
  return { bite:sv('<path d="M3 8h18l-3 4-3-3-3 3-3-3-3 3z"/><path d="M3 16h18l-3-3-3 3-3-3-3 3-3-3z" opacity=".55"/>'),
    strike:sv('<path d="M12 2l2.4 6.6L21 9l-5.2 4.3L17.5 21 12 17l-5.5 4 1.7-7.7L3 9l6.6-.4z"/>'),
    kick:sv('<path d="M7 3v9l-3 5v3h9l2-3h5v-3l-6-2-3-9z"/>'),
    orb:sv('<circle cx="14" cy="12" r="5"/><path d="M2 9h5M1 12h6M2 15h5"/>'),
    beam:sv('<circle cx="5" cy="12" r="3"/><path d="M8 12h14M10 8l10-2M10 16l10 2"/>'),
    burst:sv('<path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19"/>'),
    shield:sv('<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/>'),
    "in":sv('<path d="M4 6l6 6-6 6M12 6l6 6-6 6"/>'), out:sv('<path d="M20 6l-6 6 6 6M12 6l-6 6 6 6"/>'),
    swap:sv('<path d="M4 8h14l-4-4M20 16H6l4 4"/>'), web:sv('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>'),
    eye:sv('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    shove:sv('<path d="M9 11V5a2 2 0 014 0v6M13 10V4a2 2 0 014 0v8M9 10a2 2 0 00-4 0v4c0 4 3 7 7 7h1c3 0 6-3 6-6v-4"/><path d="M1 12h2" />'),
    auto:sv('<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V4M9 13h.01M15 13h.01M9 17h6M2 12v3M22 12v3"/>') }; })();
function atIcon(m){
  const n=m.name, k=m.skill&&typeof MOVE_KIND!=="undefined"?MOVE_KIND[n]:null;
  if(m.swap) return AT_ICON.swap; if(m.buff||m.support) return AT_ICON.shield;
  if(m.step||m.dash==="in"&&!m.dmg) return m.step<0?AT_ICON.out:AT_ICON["in"];
  if(/Web|Silk|Cocoon|Trap|Reel/.test(n)) return AT_ICON.web; if(/Stare|Glare|Eye|Hypno|Mind|Dread/.test(n)) return AT_ICON.eye;
  if(/Bite|Chomp|Crunch|Gnash|Jaw|Fang/.test(n)||k==="bite") return AT_ICON.bite;
  if(/Kick|Stride|Stampede|Sweep|Stomp/.test(n)||k==="stomp") return AT_ICON.kick;
  if(k==="beam"||k==="lightning"||/Beam|Lance|Broadcast|Ray/.test(n)) return AT_ICON.beam;
  if(k==="pillar"||k==="tornado"||k==="meteor"||k==="icefall"||k==="wave"||k==="lift") return AT_ICON.burst;
  if(m.cast||m.range==="Mid"||m.range==="Far") return AT_ICON.orb;
  return AT_ICON.strike;
}
function atLoop(now){
  if(!AT) return; const ar=AT.ar, real=Math.min(0.25,(now-AT.last)/1000); AT.last=now;
  // a tap on Attack or Shove queues its start event between frames; play everything queued before moving on
  const flush=()=>{ const ev=ar.ev; ar.ev=[]; for(const e of ev) atEvent(e,now); }; flush();
  // hitstop: the fight and its animations pause for a moment when a hit lands
  const frozen=now<AT.freeze, slow=AT.slow&&now>=AT.slow.from&&now<AT.slow.until?AT.slow.k:1, step=real*slow;
  if(!frozen){ AT.te+=step*1000; if(!ar.turn) AT.acc+=step; }
  // a move in progress: it lands at its contact frame and the fight carries on once its animation ends
  if(ar.turn&&!AT.turn) AT.turn={t0:AT.te,C:200,D:500};   // never leave a turn hanging
  if(ar.turn&&AT.turn){ const t=AT.te-AT.turn.t0, run=f=>{ flush(); f(); flush(); };
    if(!ar.turn.done&&t>=AT.turn.C) run(()=>ar.land());
    if(ar.turn&&t>=AT.turn.D){ run(()=>ar.endTurn()); AT.turn=null; } }
  while(AT.acc>=AR.DT&&!ar.over&&!ar.turn){ AT.acc-=AR.DT; ar.step(); flush(); }
  if(ar.over) for(const i of [0,1]) if(ar.winner===1-i&&AT.side[i].ko==null) AT.side[i].ko=AT.te;
  atHud(); atRows(); atDraw(now,frozen?0:step*1000);
  if(ar.over&&!AT.done){ AT.done=true; setTimeout(atResult,1300); }
  AT.raf=requestAnimationFrame(atLoop);
}
const AT_TIER={light:{stop:45,trauma:0.14,sparks:6,flash:50,punch:0.035,ring:0.7},medium:{stop:80,trauma:0.32,sparks:10,flash:70,punch:0.07,ring:1,screen:0.18},
  heavy:{stop:120,trauma:0.6,sparks:18,flash:100,white:1,punch:0.11,ring:1.4,screen:0.35},special:{stop:190,trauma:0.95,sparks:28,flash:140,white:1,punch:0.16,ring:2,screen:0.8,slow:420}};
const atMoveTier=(i,m)=>m.dmg>=70&&AT.special&&AT.special[i]===m.name?"special":m.dmg>=40||m.cost>=24?"heavy":"light";
const AT_CHARGE={light:0,heavy:430,special:1250};
/* what the engine reports becomes the game's own battle animation */
function atEvent(e,now){
  const S=AT.side[e.i], m=e.m, te=AT.te, sp=S.spec;
  if(e.t==="start"){
    if(m.swap){ S.pose={p:"crouch",until:te+220}; AT.turn={t0:te,C:220,D:560}; return; }
    if(m.step||m.dash&&!m.dmg){ S.pose={p:"crouch",until:te+140}; AT.turn={t0:te,C:140,D:420}; return; }
    let kind;
    if(m.buff) kind={bunker:"bunker",phase:"phase",brace:"shield",riposte:"shield",bubble:"shield",feedback:"shield",unblink:"buff"}[m.buff]||"buff";
    else if(m.lower) kind="glare";
    else if(m.shove) kind="tackle";
    else kind=typeof animFor==="function"?animFor({name:m.name,kind:m.cast?"Cast":"Strike",el:m.el},sp):"tackle";
    if(!ANIM[kind]) kind="tackle";
    // the whole animation plays at its own pace now; a slow, heavy move gets a little longer windup on top
    const K=ANIM[kind], rate=Math.max(0.75,Math.min(1.25,K.C/Math.max(300,m.wind*900))), tier=m.dmg?atMoveTier(e.i,m):"light", ch=AT_CHARGE[tier];
    AT.turn={t0:te,C:ch+K.C/rate,D:ch+Math.min(K.D/rate,K.C/rate+700)};
    const col=m.el&&typeof ELC==="function"?hexRgb(ELC(m.el)):AT_FAMCOL[AT.ar.p[e.i].f.family]||[255,214,90];
    S.anim={kind,t0:te+ch,tier,rate,el:m.el||null,name:m.name,src:typeof sourceFor==="function"?sourceFor({name:m.name,kind:m.cast?"Cast":"Strike"},sp):"mouth",col,pw:m.dmg>=70?1.35:m.dmg>=40?1.05:0.8,contact:/^(tackle|bite|stomp|punch|claw|shadowstrike|shadowclaw|fly)$/.test(kind)};
    if(tier==="special"&&!S.anim.contact&&!m.lower) S.anim.mega=/^(beam|bolt|spear|volley|drain|gust)$/.test(kind)?"beam":kind==="lightning"?"bolt":/^(meteor|icefall|boulder|rockpath)$/.test(kind)?"fall":/^(pillar|tornado|firespin|wave|mist|mistcast)$/.test(kind)?"rise":null;
    if(ch){ S.charge={t0:te,d:ch,tier,col:S.anim.col}; if(tier==="special") AT.cine={t0:te,d:ch,i:e.i,name:m.name,col:S.anim.col}; }
    try{ sfx(ch?"charge":m.cast?"charge":"whoosh"); if(typeof elSfx==="function") elSfx(m.el,"cast"); if(typeof kindSfx==="function"&&!ch) kindSfx(kind); }catch(err){}
  }
  if(e.t==="step"){ S.hop={t0:te,h:16}; }
  if(e.t==="swap"){ AT.side[e.i].hop={t0:te,h:78,d:480}; AT.side[1-e.i].hop={t0:te,h:8,d:480};   // the swapper leaps over, the other ducks
    try{ sfx("whoosh"); }catch(err){} }
  if(e.t==="hit"){ const o=AT.side[1-e.i], mt=S.anim&&S.anim.tier||"light", tier=e.crit?(mt==="special"?"special":mt==="heavy"?"special":"heavy"):mt==="light"&&e.dmg>=25?"medium":mt, T=AT_TIER[tier];
    if(e.h===0||!o.react||te-o.react.t0>120){ o.react={kind:"hit",t0:te,tier}; AT.freeze=Math.max(AT.freeze,now+T.stop); AT.trauma=Math.min(1,AT.trauma+T.trauma);
      AT.hitJuice={i:1-e.i,t0:te,tier,col:S.anim?S.anim.col:[255,236,160]};
      if(S.anim) AT.strikes.push({t0:/bite/.test(S.anim.kind)?te-0.16*560:te,d:/bite/.test(S.anim.kind)?560:340,kind:/bite/.test(S.anim.kind)?"jaws":/claw/.test(S.anim.kind)?"slash":"lines",i:1-e.i,col:S.anim.col,big:{light:1,medium:1.15,heavy:1.4,special:1.9}[tier],dir:S.dir,ranged:!S.anim.contact}); AT.punch={t0:te,amt:T.punch,i:1-e.i};
      if(T.screen) AT.flash={t0:now+T.stop*0.4,a:T.screen};
      if(T.slow) AT.slow={from:now+T.stop,until:now+T.stop+T.slow*(AT.ar.over?2.2:1),k:AT.ar.over?0.22:0.32};
      if(tier==="heavy"||tier==="special") AT.dust={i:1-e.i,t0:te,n:tier==="special"?14:8};
      AT.spark={i:1-e.i,n:T.sparks,col:S.anim?S.anim.col:[255,236,160]}; if(S.anim&&S.anim.contact) S.recoil={t0:te,amt:tier==="heavy"?10:6};
      try{ sfx(tier==="heavy"?"heavy":tier==="medium"?"hit":"tap"); if(S.anim) elSfx(S.anim.el,"hit"); }catch(err){} }
    AT.fx.push({i:1-e.i,t0:now+e.h*90,txt:String(e.dmg),crit:e.crit,size:{light:16,medium:19,heavy:24,special:32}[tier]}); if(e.crit&&e.h===0) AT.fx.push({i:1-e.i,t0:now,txt:"Critical!",crit:true,size:13,lift:30}); }
  if(e.t==="miss"){ const o=AT.side[1-e.i]; if(e.why!=="out") o.react={kind:"dodge",t0:te};
    AT.fx.push({i:1-e.i,t0:now,txt:e.why==="out"?"Out of reach":e.why==="block"?"Blocked":"Miss"}); }
  if(e.t==="slam"){ S.react={kind:"hit",t0:te,tier:"heavy"}; AT.trauma=Math.min(1,AT.trauma+0.5); AT.fx.push({i:e.i,t0:now,txt:`Wall ${e.dmg}`,crit:true});
    try{ sfx("heavy"); }catch(err){} }
  if(e.t==="buff") AT.fx.push({i:e.i,t0:now,txt:m.name,buff:true});
}
/* hit marks drawn over the target, k runs 0 to 1 over 340 ms */
function atStrike(c,S,k,p,s){
  const col=S.col, a=1-Math.max(0,(k-0.45)/0.55); c.save(); c.translate(p.x,p.y); c.lineJoin="round";
  if(S.kind==="jaws"){ atJaws(c,k,s,col,S.dir); c.restore(); return; }
  else if(S.kind==="slash"){ const grow=Math.min(1,k/0.3), L=150*s;
    for(let n=-1;n<=1;n++){ const ox=n*26*s, x0=ox-L/2*S.dir, y0=-L/2, x1=ox+L/2*S.dir, y1=L/2, xm=x0+(x1-x0)*grow, ym=y0+(y1-y0)*grow;
      c.globalCompositeOperation="lighter"; c.strokeStyle=`rgba(${col},${0.7*a})`; c.lineWidth=18*s; c.lineCap="round"; c.beginPath(); c.moveTo(x0,y0); c.lineTo(xm,ym); c.stroke();
      c.globalCompositeOperation="source-over"; c.strokeStyle=`rgba(255,255,255,${a})`; c.lineWidth=6*s; c.beginPath(); c.moveTo(x0,y0); c.lineTo(xm,ym); c.stroke(); } }
  else { const grow=eo(Math.min(1,k/0.35)), R0=26*s*(S.ranged?0.7:1), n=14;
    for(let j=0;j<n;j++){ const ang=j/n*Math.PI*2+((j*7)%5)*0.05, lean=Math.cos(ang)*S.dir>0?1.5:0.8, r1=R0+grow*(70+((j*13)%30))*s*lean;
      c.strokeStyle=j%2?`rgba(${col},${a})`:`rgba(255,255,255,${a})`; c.lineWidth=(j%2?5:3.5)*s; c.lineCap="round";
      c.beginPath(); c.moveTo(Math.cos(ang)*(R0+grow*30*s),Math.sin(ang)*(R0+grow*30*s)*0.8); c.lineTo(Math.cos(ang)*r1,Math.sin(ang)*r1*0.8); c.stroke(); } }
  c.restore();
}
/* the bite: a dark maw with a coloured edge snaps shut over the target, fangs interlocking, then leaves bite marks for a moment.
   k runs 0 to 1 over 560 ms: open and closing to 0.16, a hard snap and squeeze to 0.3, then the jaws fade and the marks stay */
function atJaws(c,k,s,col,dir){
  const W=60*s, H=36*s, n=6, shut=Math.min(1,k/0.16), snap=k>0.16&&k<0.3?Math.sin((k-0.16)/0.14*Math.PI):0;
  const gap=(1-Math.pow(shut,2.2))*40*s-snap*6*s, open=(1-shut)*0.16, fade=k<0.32?1:Math.max(0,1-(k-0.32)/0.18);
  if(fade>0){
    if(shut<1){ c.strokeStyle=`rgba(255,255,255,${0.7*shut})`; c.lineWidth=4*s; c.lineCap="round";
      for(const sg of [-1,1]) for(let j=0;j<2;j++){ c.beginPath(); c.arc(0,sg*(gap+H*1.2+j*14*s),W*(0.7-j*0.15),sg<0?Math.PI*1.15:Math.PI*0.15,sg<0?Math.PI*1.85:Math.PI*0.85); c.stroke(); } }
    for(const sg of [-1,1]){ c.save(); c.globalAlpha=fade*(shut>=1?0.88:1)*Math.min(1,k/0.035); c.translate(-dir*W*0.95,sg*gap); c.rotate(sg*open*dir); c.translate(dir*W*0.95,0); c.scale(1,-sg);
      const g=c.createLinearGradient(0,-H*1.2,0,0); g.addColorStop(0,"#2a1430"); g.addColorStop(1,"#4a1f3e");
      c.beginPath(); c.moveTo(-W*1.05,-2*s); c.quadraticCurveTo(-W*0.3,-H*1.35,W*1.05,-H*0.45); c.quadraticCurveTo(W*1.12,-H*0.1,W*0.95,0); c.closePath();
      c.fillStyle=g; c.fill(); c.lineWidth=6*s; c.strokeStyle=`rgb(${col})`; c.stroke(); c.lineWidth=2*s; c.strokeStyle="rgba(255,255,255,.35)"; c.stroke();
      c.fillStyle="#d9577a"; c.beginPath(); c.moveTo(-W*0.98,-1*s); c.quadraticCurveTo(0,-9*s,W*0.95,-1*s); c.lineTo(W*0.95,2*s); c.lineTo(-W*0.98,2*s); c.closePath(); c.fill();
      const off=sg<0?0:0.5, tw=1.9*W/(n+0.5);
      for(let t=0;t<n;t++){ const x=-W*0.92+tw*(t+0.5+off), big=t===0||t===n-1, th=(big?34:21)*s, bw=tw*(big?0.62:0.5);
        const tg=c.createLinearGradient(x,0,x,th); tg.addColorStop(0,"#ffffff"); tg.addColorStop(1,"#dcd6e8");
        c.beginPath(); c.moveTo(x-bw,1*s); c.quadraticCurveTo(x-bw*0.35,th*0.55,x+bw*0.12,th); c.quadraticCurveTo(x+bw*0.45,th*0.5,x+bw,1*s); c.closePath();
        c.fillStyle=tg; c.fill(); c.lineWidth=2.4*s; c.strokeStyle="#1a1428"; c.stroke(); }
      c.restore(); }
    if(snap){ c.save(); c.globalCompositeOperation="lighter"; const g=c.createRadialGradient(0,0,0,0,0,W*1.3); g.addColorStop(0,`rgba(255,255,255,${0.9*snap})`); g.addColorStop(0.4,`rgba(${col},${0.6*snap})`); g.addColorStop(1,`rgba(${col},0)`);
      c.fillStyle=g; c.beginPath(); c.ellipse(0,0,W*1.4,H*0.9,0,0,7); c.fill(); c.restore(); } }
  if(k>0.24){ const a=Math.min(1,(k-0.24)/0.06)*Math.max(0,1-(k-0.55)/0.45); c.fillStyle=`rgba(60,10,30,${0.75*a})`;
    for(const sg of [-1,1]) for(let t=0;t<5;t++){ const x=-W*0.55+t*W*0.27+(sg>0?W*0.13:0); c.beginPath(); c.moveTo(x-5*s,sg*10*s); c.lineTo(x+5*s,sg*10*s); c.lineTo(x,sg*2*s); c.closePath(); c.fill(); } }
}
/* lightning specials: a jagged bolt cracks down from the sky onto the target three times, with a scorch glow on the ground */
function atMegaBolt(c,t,C,tg,col,s,te){
  const hits=[C-130,C,C+150], on=hits.find(h=>t>=h-30&&t<h+110); const foot=tg.foot||tg.y+40*s;
  if(t>C-260&&t<C+420){ const g=c.createRadialGradient(tg.x,foot,0,tg.x,foot,90*s); g.addColorStop(0,`rgba(${col},${t<C?0.35:0.6})`); g.addColorStop(1,`rgba(${col},0)`);
    c.save(); c.globalCompositeOperation="lighter"; c.fillStyle=g; c.beginPath(); c.ellipse(tg.x,foot,110*s,30*s,0,0,7); c.fill(); c.restore(); }
  if(on==null) return;
  const k=(t-(on-30))/140, a=k<0.25?1:Math.max(0,1-(k-0.25)/0.75), top=foot-900*s, seed=Math.floor(on/7)+Math.floor(te/55);
  const pts=[[tg.x+((seed*37)%40-20)*s,top]]; let x=pts[0][0];
  for(let i=1;i<=9;i++){ const y=top+(foot-top)*i/9; x+=(((seed*131+i*977)%100)/100-0.5)*70*s; if(i===9) x=tg.x; pts.push([x,y]); }
  if(k<0.2) AT.flash={t0:performance.now(),a:0.35};
  AT.trauma=Math.max(AT.trauma,0.55*a);
  c.save(); c.globalCompositeOperation="lighter"; c.lineJoin="round"; c.lineCap="round";
  const path=()=>{ c.beginPath(); pts.forEach((p,i)=>c[i?"lineTo":"moveTo"](p[0],p[1])); };
  c.strokeStyle=`rgba(${col},${0.35*a})`; c.lineWidth=90*s; path(); c.stroke();
  c.strokeStyle=`rgba(${col},${0.85*a})`; c.lineWidth=36*s; path(); c.stroke();
  c.strokeStyle=`rgba(255,255,255,${a})`; c.lineWidth=14*s; path(); c.stroke();
  for(let f=2;f<8;f+=2){ const p=pts[f], q=[p[0]+(((seed+f)*53)%2?1:-1)*60*s,p[1]+50*s]; c.strokeStyle=`rgba(255,255,255,${0.7*a})`; c.lineWidth=3*s; c.beginPath(); c.moveTo(p[0],p[1]); c.lineTo((p[0]+q[0])/2+12*s,(p[1]+q[1])/2); c.lineTo(q[0],q[1]); c.stroke(); }
  const g=c.createRadialGradient(tg.x,foot,0,tg.x,foot,80*s); g.addColorStop(0,`rgba(255,255,255,${a})`); g.addColorStop(1,`rgba(${col},0)`); c.fillStyle=g; c.beginPath(); c.arc(tg.x,foot-10*s,80*s,0,7); c.fill();
  c.restore();
}
/* meteors, ice falls and boulders: a huge rock or ice chunk drops from the sky with a trail and craters the ground */
function atMegaFall(c,t,C,tg,col,s,kind,dir){
  const foot=tg.foot||tg.y+40*s, start=0; if(t<start||t>C+520) return;
  const ice=kind==="icefall", R=82*s;
  if(t<C){ const k=(t-start)/C, e=Math.pow(k,1.6), x=tg.x-dir*(220*s)*(1-e), y=foot-R*0.7-(620*s)*(1-e), ang=Math.atan2(900,-dir*260);
    const sh=c.createRadialGradient(tg.x,foot,0,tg.x,foot,R*1.6); sh.addColorStop(0,`rgba(0,0,0,${0.35*k})`); sh.addColorStop(1,"rgba(0,0,0,0)"); c.fillStyle=sh; c.beginPath(); c.ellipse(tg.x,foot,R*1.6*(0.5+k*0.5),R*0.4,0,0,7); c.fill();
    c.save(); c.globalCompositeOperation="lighter";
    for(let j=0;j<10;j++){ const b=j/10, tx=x-dir*b*180*s, ty=y-b*620*s; c.fillStyle=`rgba(${col},${0.5*(1-b)})`; c.beginPath(); c.arc(tx,ty,R*(1-b*0.7),0,7); c.fill(); }
    c.restore();
    c.save(); c.translate(x,y); c.rotate(t/140*dir);
    c.beginPath(); for(let j=0;j<(ice?6:9);j++){ const a=j/(ice?6:9)*Math.PI*2, r=ice?(j%2?R*0.65:R*1.15):R*(0.82+((j*37)%10)/40); c[j?"lineTo":"moveTo"](Math.cos(a)*r,Math.sin(a)*r); } c.closePath();
    const g=c.createRadialGradient(-R*0.3,-R*0.3,2,0,0,R*1.2); g.addColorStop(0,ice?"#f2fbff":"#fff2c4"); g.addColorStop(0.5,`rgb(${col})`); g.addColorStop(1,ice?"#3d6e9e":"#4a2a1e");
    c.fillStyle=g; c.fill(); c.lineWidth=5*s; c.strokeStyle="#1a1428"; c.stroke(); c.restore(); return; }
  const k=(t-C)/520, a=1-k;
  if(k<0.05) { AT.flash={t0:performance.now(),a:0.5}; AT.trauma=1; if(typeof spawnPuff==="function") spawnPuff(tg.x,foot,22,-Math.PI/2,3,0.22,10*s,"rgba(235,224,200,1)",700); }
  c.save(); c.fillStyle=`rgba(40,24,18,${0.45*a})`; c.beginPath(); c.ellipse(tg.x,foot+4*s,(90+40*k)*s,(22+8*k)*s,0,0,7); c.fill();
  c.strokeStyle=`rgba(40,24,18,${0.6*a})`; c.lineWidth=4*s; for(let j=0;j<7;j++){ const an=j/7*Math.PI*2; c.beginPath(); c.moveTo(tg.x+Math.cos(an)*60*s,foot+Math.sin(an)*15*s); c.lineTo(tg.x+Math.cos(an)*(110+30*k)*s,foot+Math.sin(an)*(28+8*k)*s); c.stroke(); }
  c.globalCompositeOperation="lighter"; const g=c.createRadialGradient(tg.x,foot-20*s,0,tg.x,foot-20*s,140*s); g.addColorStop(0,`rgba(255,255,255,${a*a})`); g.addColorStop(0.4,`rgba(${col},${0.7*a})`); g.addColorStop(1,`rgba(${col},0)`);
  c.fillStyle=g; c.beginPath(); c.arc(tg.x,foot-20*s,140*s,0,7); c.fill(); c.restore();
}
/* pillars, fire spins, whirlpools and mists: the ground under the target glows, then a column erupts up through it */
function atMegaRise(c,t,C,tg,col,s,kind,te){
  const foot=tg.foot||tg.y+40*s, warn=C-300, end=C+480; if(t<warn||t>end) return;
  c.save(); c.globalCompositeOperation="lighter";
  if(t<C){ const k=(t-warn)/300, g=c.createRadialGradient(tg.x,foot,0,tg.x,foot,100*s); g.addColorStop(0,`rgba(${col},${0.7*k})`); g.addColorStop(1,`rgba(${col},0)`);
    c.fillStyle=g; c.beginPath(); c.ellipse(tg.x,foot,(60+50*k)*s,(16+12*k)*s,0,0,7); c.fill();
    c.strokeStyle=`rgba(255,255,255,${0.6*k})`; c.lineWidth=3*s; c.beginPath(); c.ellipse(tg.x,foot,(100-40*k)*s,(26-10*k)*s,0,0,7); c.stroke(); c.restore(); return; }
  const k=(t-C)/(end-C), up=Math.min(1,k/0.12), env=Math.min(1,(1-k)/0.3), w=(64+10*Math.sin(te/40))*s*env, h=900*s*up, x=tg.x, swirl=/tornado|firespin|wave/.test(kind);
  if(k<0.04){ AT.flash={t0:performance.now(),a:0.4}; AT.trauma=Math.max(AT.trauma,0.8); }
  AT.trauma=Math.max(AT.trauma,0.3*env);
  const band=(ww,fill)=>{ c.fillStyle=fill; c.beginPath(); c.moveTo(x-ww,foot); for(let y=0;y<=h;y+=24) c.lineTo(x-ww*(1+0.12*Math.sin(y/30+te/50))-(swirl?Math.sin(y/90-te/120)*20*s:0),foot-y); for(let y=h;y>=0;y-=24) c.lineTo(x+ww*(1+0.12*Math.sin(y/26-te/45))-(swirl?Math.sin(y/90-te/120)*20*s:0),foot-y); c.closePath(); c.fill(); };
  band(w*1.8,`rgba(${col},${0.3*env})`); band(w,`rgba(${col},${0.8*env})`); band(w*0.4,`rgba(255,255,255,${0.95*env})`);
  if(swirl){ c.strokeStyle=`rgba(255,255,255,${0.55*env})`; c.lineWidth=4*s; for(let j=0;j<8;j++){ const y=foot-((te/3+j*120)%h); c.beginPath(); c.ellipse(x,y,w*1.2,w*0.3,0,Math.PI*0.1,Math.PI*0.9); c.stroke(); } }
  for(let j=0;j<10;j++){ const ph=((te/700+j*0.37)%1); c.fillStyle=`rgba(255,255,255,${0.8*(1-ph)*env})`; c.beginPath(); c.arc(x+((j*41)%60-30)*s*1.4,foot-ph*h*0.8,(3+(j%3))*s,0,7); c.fill(); }
  const g=c.createRadialGradient(x,foot,0,x,foot,130*s); g.addColorStop(0,`rgba(255,255,255,${env})`); g.addColorStop(1,`rgba(${col},0)`); c.fillStyle=g; c.beginPath(); c.ellipse(x,foot,130*s,36*s,0,0,7); c.fill();
  c.restore();
}
/* a special fired from range: an orb gathers at the source, then a thick beam with a white core holds on the target */
function atMegaBeam(c,t,C,o,tg,col,s){
  if(!o) return; const on=C-170, off=C+430;
  if(t<on){ const k=Math.max(0,(t-(on-300))/300); c.save(); c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(o.x,o.y,0,o.x,o.y,40*s*k+4); g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(0.4,`rgba(${col},.8)`); g.addColorStop(1,`rgba(${col},0)`);
    c.fillStyle=g; c.beginPath(); c.arc(o.x,o.y,40*s*k+4,0,7); c.fill(); c.restore(); return; }
  if(t>off) return;
  const env=Math.min(1,(t-on)/80)*Math.min(1,(off-t)/160), dx=tg.x-o.x, dy=tg.y-o.y, L=Math.hypot(dx,dy)+30*s, w=38*s*env*(1+0.08*Math.sin(t/22));
  AT.trauma=Math.max(AT.trauma,0.3*env);
  c.save(); c.translate(o.x,o.y); c.rotate(Math.atan2(dy,dx)); c.globalCompositeOperation="lighter";
  const band=(h,fill)=>{ c.fillStyle=fill; c.beginPath(); c.moveTo(0,-h*0.6); for(let x=0;x<=L;x+=14){ c.lineTo(x,-h+Math.sin(x/9+t/30)*h*0.08); } c.lineTo(L,h); for(let x=L;x>=0;x-=14){ c.lineTo(x,h+Math.sin(x/11-t/26)*h*0.08); } c.lineTo(0,h*0.6); c.closePath(); c.fill(); };
  band(w*1.9,`rgba(${col},${0.28*env})`); band(w,`rgba(${col},${0.85*env})`); band(w*0.42,`rgba(255,255,255,${env})`);
  for(let r=0;r<5;r++){ const x=((t*0.9+r*L/5)%L); c.strokeStyle=`rgba(255,255,255,${0.5*env})`; c.lineWidth=3*s; c.beginPath(); c.ellipse(x,0,6*s,w*1.25,0,0,7); c.stroke(); }
  for(const [x,R] of [[0,w*1.25],[L-30*s,w*1.7]]){ const g=c.createRadialGradient(x,0,0,x,0,R); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(0.45,`rgba(${col},.85)`); g.addColorStop(1,`rgba(${col},0)`);
    c.fillStyle=g; c.beginPath(); c.arc(x,0,R,0,7); c.fill(); }
  c.restore();
  if(Math.random()<0.5&&typeof spawnSparks==="function") spawnSparks(tg,Math.atan2(dy,dx)+Math.PI,2,col);
}
const AT_FAMCOL={Antik:[255,224,122],Squib:[127,211,242],Moko:[255,154,214],Booly:[159,184,255],Skit:[244,239,228],Chomp:[255,214,90],Pinch:[255,138,122],Stilt:[255,179,92]};
/* one side's pose and offset this frame, the way the battle's sideState works */
function atSideState(S,te){
  const out={f:0,arc:0,lift:0,rot:0,sx:1,sy:1,pose:null,flash:0,off:[0,0],alpha:1};
  const A=S.anim; if(A&&te<A.t0){ const ch=S.charge, k=ch?(te-ch.t0)/ch.d:1, sp=ch&&ch.tier==="special";
      out.pose=sp?(k<0.55?"determined":"cast"):"effort"; out.off[0]+=Math.sin(te/16)*(1+2.5*k); out.sy=1-0.07*k; out.sx=1+0.05*k; out.flash=k>0.82&&Math.floor(te/45)%2?3:0; }
  else if(A){ const t=(te-A.t0)*A.rate, K=ANIM[A.kind]; if(t>K.D) S.anim=null; else Object.assign(out,K.atk(t,{foeH:60,perp:[0,-1]})); }
  const O=S.foe.anim; if(O&&!S.anim){ const t=(te-O.t0)*O.rate, K=ANIM[O.kind]; if(t<=K.D&&K.def){ const d=K.def(t,{foeH:60,perp:[0,-1]}); if(d) Object.assign(out,d); } }
  if(S.pose&&te<S.pose.until&&!S.anim) out.pose=S.pose.p;
  if(S.recoil){ const k=(te-S.recoil.t0)/170; if(k>1) S.recoil=null; else out.off[0]-=S.dir*S.recoil.amt*Math.sin(k*Math.PI); }
  const R=S.react;
  if(R){ const dur=R.kind==="hit"?(R.tier==="heavy"?560:420):380, k=(te-R.t0)/dur;
    if(k>1) S.react=null;
    else if(R.kind==="hit"){ const T=AT_TIER[R.tier], dt=te-R.t0; out.pose="hit"; out.flash=T.white?(dt<18?2:dt<T.flash?1:0):dt<T.flash?3:0;
      out.off[0]-=S.dir*({light:14,medium:20,heavy:30,special:46}[R.tier]||14)*(k<0.25?eo(k/0.25):1-eo((k-0.25)/0.75)); out.rot-=S.dir*0.12*(R.tier==="heavy"?1.6:1)*Math.sin(Math.min(1,k*1.5)*Math.PI);
      const q=Math.max(0,1-dt/180), big=R.tier==="special"?1.8:R.tier==="heavy"?1.3:1; out.sx*=1+0.16*big*q; out.sy*=1-0.13*big*q; }
    else { const s2=Math.sin(k*Math.PI); out.pose="dodge"; out.off[0]-=S.dir*22*s2; out.off[1]-=12*s2; } }
  if(S.hop){ const k=(te-S.hop.t0)/(S.hop.d||380); if(k>1) S.hop=null; else { out.arc-=Math.sin(k*Math.PI)*S.hop.h; if(!out.pose) out.pose="jump"; } }
  if(S.ko!=null){ out.pose="ko"; const k=(te-S.ko-500)/220; if(k>0){ out.alpha=Math.max(0,1-k); } }
  return out;
}
function atDraw(now,dte){
  const cv=document.getElementById("at-cv"); if(!cv) return; const c=cv.getContext("2d"), W=AT.W, H=AT.H, dpr=AT.dpr, ar=AT.ar, te=AT.te;
  CB.te=te;   // the battle helpers (sparks, dust, bursts) run on this clock
  const WW=AT.WW||W;   // the arena is wider than the screen and the camera follows the fight
  const HH=AT.HH, FY=AT.FY;
  if(!AT.bg){ const b=document.createElement("canvas"); b.width=WW*dpr; b.height=HH*dpr; const x=b.getContext("2d"); x.scale(dpr,dpr); atStage(x,WW,HH,FY); AT.bg=b; }
  const shake=AT.trauma*AT.trauma*7; AT.trauma=Math.max(0,AT.trauma-dte/700); const cine=AT.cine&&te-AT.cine.t0<AT.cine.d?AT.cine:null, ck=cine?(te-cine.t0)/cine.d:0;
  const sx=shake?Math.sin(te/23)*shake:0, sy=shake?Math.cos(te/31)*shake*0.6:0;
  const floor=FY, scale=2.3, SEP=(58*scale-AR.BODY/AR.LEN*(WW-140))/(1-AR.BODY/AR.LEN), K=(WW-140-SEP)/AR.LEN, X=(x,right)=>70+x*K+(right?SEP:0), alpha=Math.min(1,AT.acc/AR.DT);
  // glide between engine steps, then ease toward that so pushes and swaps slide instead of jumping
  // while a move plays the clock is stopped, so swaps and knockback show at once instead of waiting for the next step
  const shown=ar.p.map(p=>ar.turn||p.px==null?p.x:p.px+(p.x-p.px)*alpha);
  ar.p.forEach((p,i)=>{ const S=AT.side[i], want=X(shown[i],shown[i]>shown[1-i]||shown[i]===shown[1-i]&&i===1);
    const hop=S.hop&&te-S.hop.t0<520; S.x=S.x==null?want:S.x+(want-S.x)*(1-Math.exp(-dte/(hop?95:45))); });
  AT.side.forEach(S=>{ S.dx=S.x; });
  // the camera zooms with the gap, MR2 style: in close when they're face to face, pulled back to both walls when they're far apart
  { const a=AT.side[0].dx, b=AT.side[1].dx, V=Math.max(W/1.35,Math.min(WW,Math.abs(b-a)+110*scale));
    let z=W/V, mid=(a+b)/2, fast=false;
    const hv=[0,1].find(i=>AT.side[i].charge&&te-AT.side[i].charge.t0<AT.side[i].charge.d&&AT.side[i].charge.tier==="heavy");
    if(hv!=null){ z*=1.12; mid=mid*0.6+AT.side[hv].dx*0.4; }
    if(cine&&ck<0.86){ z=Math.min(2.2,z*1.75); mid=AT.side[cine.i].dx; fast=true; } else if(cine) fast=true;
    AT.zoom=AT.zoom==null?z:AT.zoom+(z-AT.zoom)*(1-Math.exp(-dte/(fast?90:260)));
    const v=W/AT.zoom, want=Math.max(0,Math.min(WW-v,mid-v/2)); AT.cam=AT.cam==null?want:AT.cam+(want-AT.cam)*(1-Math.exp(-dte/(fast?70:140))); AT.cam=Math.max(0,Math.min(WW-v,AT.cam)); }
  const pk=AT.punch?Math.max(0,1-(te-AT.punch.t0)/260):0, z=AT.zoom*(1+(AT.punch?AT.punch.amt:0)*Math.sin(Math.min(1,pk)*Math.PI*0.5)*pk), zc=W/2;
  const tilt=cine?0.06*Math.sin(Math.min(1,ck/0.2)*Math.PI/2)*(ck<0.86?1:Math.max(0,1-(ck-0.86)/0.14)):0;
  c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,W,H);
  if(tilt){ c.translate(W/2,AT.floorS); c.rotate(-tilt*(AT.side[cine.i].dir||1)); c.translate(-W/2,-AT.floorS); }
  c.translate(sx,AT.floorS+sy); c.translate(zc,0); c.scale(z/AT.zoom,z/AT.zoom); c.translate(-zc,0); c.scale(AT.zoom,AT.zoom); c.translate(-AT.cam,-FY); c.drawImage(AT.bg,0,0,WW,HH);
  // a special's charge dims the arena and throws speed lines out from the attacker
  if(cine){ const fade=Math.min(1,ck/0.15)*(ck<0.86?1:Math.max(0,1-(ck-0.86)/0.14)), P=AT.lastPlaced&&AT.lastPlaced[cine.i];
    c.fillStyle=`rgba(10,8,22,${0.72*fade})`; c.fillRect(0,0,WW,HH);
    if(P){ const cx=P.center?P.center.x:P.x, cy=P.center?P.center.y:P.y, col=cine.col; c.save(); c.lineCap="round";
      for(let k=0;k<28;k++){ const a=k/28*Math.PI*2+((k*37)%11)*0.03, ph=((te/260+k*0.37)%1), r0=90+ph*260, r1=r0+60+((k*53)%40);
        c.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${0.55*fade*(1-ph)})`; c.lineWidth=(3+((k*7)%4))/AT.zoom*1.4;
        c.beginPath(); c.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); c.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1); c.stroke(); } c.restore(); } }
  const toWorld=c.getTransform().inverse();   // the drawing records its eyes, hands and head in canvas pixels; this turns them back into arena units
  // the gap between them on the floor
  { const a=Math.min(AT.side[0].dx,AT.side[1].dx), b=Math.max(AT.side[0].dx,AT.side[1].dx), y=floor+16, band=arBand(ar.gap());
    c.strokeStyle=AT_RC[band]; c.lineWidth=3; c.setLineDash([6,5]); c.beginPath(); c.moveTo(a,y); c.lineTo(b,y); c.stroke(); c.setLineDash([]);
  }
  const placed=[null,null];
  const lunging=i=>{ const A=AT.side[i].anim; return A&&A.contact&&te>=A.t0; };
  (lunging(0)?[1,0]:[0,1]).forEach(i=>{ const S=AT.side[i], O=AT.side[1-i], sp=S.spec; if(!sp) return;
    S.dir=O.dx>S.dx?1:-1; S.foe=O;
    const h=CHIBI.height(sp.stage,sp.marks,sp.family), u=Math.min(0.5,96/(h+20))*scale;
    // walking comes from the engine, so the pose doesn't flicker between walk and idle on fast screens
    const st=atSideState(S,te), moving=!ar.turn&&ar.p[i].walkT!=null&&ar.t-ar.p[i].walkT<0.25;
    let pose=st.pose||(moving?"walk":"idle");
    if(pose!==S.shown){ S.from=S.shown||"idle"; S.shown=pose; S.t0=te; }
    const k=(te-S.t0)/110, P=k>=0&&k<1&&CHIBI.POSES.includes(S.from)&&CHIBI.POSES.includes(pose)?CHIBI.blend(S.from,pose,k):pose;
    // a contact move reaches the opponent, but never further than a short lunge when it's out of reach
    const reach=Math.max(-(SEP+40),Math.min(SEP+40,(O.dx-S.dx)-S.dir*SEP*0.42));
    const x=S.dx+reach*st.f+st.off[0], y=floor+st.arc+st.lift+st.off[1], mir=S.dir>0?-1:1;
    if(moving!==!!S.moving&&S.ko==null&&typeof spawnPuff==="function") spawnPuff(x-S.dir*10,y-2,moving?5:7,S.dir>0?Math.PI:0,1.2,0.08,5*scale,"rgba(235,228,214,1)",320);
    S.moving=moving;
    c.fillStyle="rgba(0,0,0,.2)"; c.beginPath(); c.ellipse(x,floor+2,24*scale*(st.alpha),6*scale,0,0,7); c.fill();
    S.trail=(S.trail||[]).filter(g=>te-g.t<120);
    if(lunging(i)&&S.lastX!=null&&Math.abs(x-S.lastX)>3) S.trail.push({x,y,P,t:te,rot:st.rot,sx:st.sx,sy:st.sy});
    S.lastX=x;
    for(const g of S.trail){ c.save(); c.globalAlpha=0.32*(1-(te-g.t)/120); c.filter="brightness(1.9) saturate(.5)";
      c.translate(g.x,g.y); c.rotate(g.rot); c.scale(mir*u*g.sx,u*g.sy); c.translate(-100,-188); CHIBI.draw(c,sp,g.P,te,[0.6*S.dir*mir,0]); c.restore(); }
    c.save(); c.globalAlpha=st.alpha; if(st.flash===2) c.filter="brightness(0) invert(1)"; else if(st.flash===1) c.filter="brightness(1.5)"; else if(st.flash===3) c.filter="brightness(1.18)";
    c.translate(x,y); c.rotate(st.rot); c.scale(mir*u*st.sx,u*st.sy); c.translate(-100,-188);
    CHIBI.draw(c,{...sp,capture:(S.cap={})},P,te,[0.6*S.dir*mir,0]); c.restore();
    const cp=S.cap||{}, d=q=>q?toWorld.transformPoint(q):null;
    placed[i]={x,y:y-h*u*0.45,foot:y,lift:st.lift,back:false,r:CHIBI.width(sp.stage,sp.family)*u*0.55,eyes:cp.eyes&&cp.eyes.map(d),mouth:d(cp.mouth),hands:(cp.hands||[]).map(d),top:d(cp.top)||{x,y:y-50},center:d(cp.center)};
  });
  // the game's own attack effects, from the attacker's eyes, mouth or hands to the target
  [0,1].forEach(i=>{ const A=AT.side[i].anim; if(!A||te<A.t0||!placed[i]||!placed[1-i]||!ANIM[A.kind].fx) return;
    const T0=placed[1-i], tgt={...T0,x:T0.center?T0.center.x:T0.x,y:T0.center?T0.center.y:T0.y};
    if(/bite/.test(A.kind)&&!A.mega){ const t=(te-A.t0)*A.rate, C=ANIM[A.kind].C;
      if(t>=C-200&&t<C){ c.save(); c.translate(tgt.x,tgt.y); atJaws(c,(t-(C-200))/200*0.159,({light:1,heavy:1.4,special:1.9}[A.tier]||1)*scale/2.3,A.col,AT.side[i].dir); c.restore(); } }
    if(A.mega){ const t=(te-A.t0)*A.rate, C=ANIM[A.kind].C, s2=scale/2.3;
      if(A.mega==="beam") atMegaBeam(c,t,C,originOf(placed[i],A.src,tgt)[0],tgt,A.col,s2);
      else if(A.mega==="bolt") atMegaBolt(c,t,C,{...tgt,foot:T0.foot},A.col,s2,te);
      else if(A.mega==="fall") atMegaFall(c,t,C,{...tgt,foot:T0.foot},A.col,s2,A.kind,AT.side[i].dir);
      else atMegaRise(c,t,C,{...tgt,foot:T0.foot},A.col,s2,A.kind,te);
      return; }
    try{ ANIM[A.kind].fx(c,(te-A.t0)*A.rate,{self:placed[i],target:tgt,targetLift:tgt.lift||0,col:A.col,el:A.el,name:A.name,from:originOf(placed[i],A.src,tgt),pw:A.pw,W:WW,H:HH}); }catch(err){ AT.side[i].anim=null; } });
  if(AT.spark&&placed[AT.spark.i]){ const p=placed[AT.spark.i], src=placed[1-AT.spark.i], c0=p.center||p;
    spawnSparks(c0,Math.atan2(c0.y-src.y,c0.x-src.x),AT.spark.n,AT.spark.col); AT.burst={i:AT.spark.i,t0:te,col:AT.spark.col}; AT.spark=null; }
  if(AT.burst&&placed[AT.burst.i]&&te-AT.burst.t0<260){ const p=placed[AT.burst.i]; burst(c,p.center||p,(te-AT.burst.t0)/260,AT.burst.col); }
  AT.lastPlaced=placed;
  c.save(); c.globalCompositeOperation="lighter";
  [0,1].forEach(i=>{ const S=AT.side[i], ch=S.charge, P=placed[i]; if(!ch||!P) return; const k=(te-ch.t0)/ch.d; if(k>1.15){ S.charge=null; return; }
    const cx=P.center?P.center.x:P.x, cy=P.center?P.center.y:P.y, col=ch.col, sp=ch.tier==="special", R=(sp?95:70)*scale/2.3, kk=Math.min(1,k);
    const g=c.createRadialGradient(cx,cy,4,cx,cy,R*(1.1+0.25*Math.sin(te/60))); g.addColorStop(0,`rgba(${col},${0.5*kk})`); g.addColorStop(1,`rgba(${col},0)`);
    c.fillStyle=g; c.beginPath(); c.arc(cx,cy,R*1.5,0,7); c.fill();
    for(let n=0;n<(sp?22:12);n++){ const ph=((te/(sp?520:380))+n*0.618)%1, a=n*2.399+te/900, r=R*1.9*(1-ph);
      c.fillStyle=`rgba(${col},${0.85*ph})`; c.beginPath(); c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.8,(2+3*ph)*scale/2.3,0,7); c.fill(); }
    if(k>0.92&&k<1.08){ const f=1-Math.abs(k-1)/0.08; c.fillStyle=`rgba(255,255,255,${0.6*f})`; c.beginPath(); c.arc(cx,cy,R*0.9,0,7); c.fill(); } });
  c.restore();
  if(AT.hitJuice&&placed[AT.hitJuice.i]){ const J=AT.hitJuice, P=placed[J.i], T=AT_TIER[J.tier], cx=P.center?P.center.x:P.x, cy=P.center?P.center.y:P.y;
    AT.rings.push({x:cx,y:cy,t0:te,col:J.col,s:T.ring,d:J.tier==="special"?520:340}); if(J.tier==="special") AT.rings.push({x:cx,y:cy,t0:te+90,col:[255,255,255],s:T.ring*1.3,d:600});
    AT.stars.push({x:cx,y:cy,t0:te,s:T.ring,col:J.col,rot:te%6}); AT.hitJuice=null; }
  if(AT.dust&&placed[AT.dust.i]){ const P=placed[AT.dust.i], S=AT.side[AT.dust.i]; spawnPuff(P.x-S.dir*12,P.foot-2,AT.dust.n,S.dir>0?Math.PI:0,1.4,0.12,7*scale/2,"rgba(235,224,200,1)",420); AT.dust=null; }
  AT.rings=AT.rings.filter(r=>te-r.t0<r.d); for(const r of AT.rings){ const k=(te-r.t0)/r.d; if(k<0) continue; const e2=1-Math.pow(1-k,3);
    c.strokeStyle=`rgba(${r.col},${0.9*(1-k)})`; c.lineWidth=(10*(1-k)+1.5)*r.s; c.beginPath(); c.ellipse(r.x,r.y,(20+110*e2)*r.s,(16+80*e2)*r.s,0,0,7); c.stroke(); }
  AT.stars=AT.stars.filter(r=>te-r.t0<150); for(const r of AT.stars){ const k=(te-r.t0)/150, R0=(46+30*k)*r.s, R1=R0*0.38;
    c.fillStyle=`rgba(255,255,255,${1-k})`; c.beginPath(); for(let n=0;n<16;n++){ const a=r.rot+n*Math.PI/8, rr=n%2?R1:R0*(0.8+0.4*((n*7)%3)/2); c[n?"lineTo":"moveTo"](r.x+Math.cos(a)*rr,r.y+Math.sin(a)*rr); } c.closePath(); c.fill();
    c.fillStyle=`rgba(${r.col},${0.9*(1-k)})`; c.beginPath(); c.arc(r.x,r.y,R1*0.9,0,7); c.fill(); }
  AT.strikes=AT.strikes.filter(k=>te-k.t0<k.d); for(const k of AT.strikes){ const P=placed[k.i]; if(!P) continue;
    atStrike(c,k,(te-k.t0)/k.d,P.center||P,k.big*scale/2.3); }
  drawSparks(c,dte); drawPuffs(c);
  // damage numbers and words over the head
  AT.fx=AT.fx.filter(f=>now-f.t0<900); c.textAlign="center"; for(const f of AT.fx){ if(now<f.t0) continue; const k=(now-f.t0)/900, p=placed[f.i]; if(!p) continue;
    const pop=1+0.7*Math.max(0,1-(now-f.t0)/170); c.font=`800 ${Math.round((f.size||(f.crit?19:15))*pop/z)}px system-ui`; c.globalAlpha=1-k*k; c.lineWidth=4; c.strokeStyle="#14151d"; c.fillStyle=f.buff?"#8fd3ff":f.crit?"#ffc93c":"#ffffff";
    const y=p.top.y-(52+(f.lift||0)+k*26)/z; c.strokeText(f.txt,p.x,y); c.fillText(f.txt,p.x,y); c.globalAlpha=1; }
  // name and HP over each head, so your eyes stay on the fight; the white part is the damage just taken, draining after a moment
  c.setTransform(dpr,0,0,dpr,0,0);
  [0,1].forEach(i=>{ const P=placed[i], p=ar.p[i], S=AT.side[i]; if(!P) return;
    const f=p.hp/p.maxhp; S.hpLag=S.hpLag==null?f:f>S.hpLag?f:S.hpLag+(f-S.hpLag)*(1-Math.exp(-Math.max(0,dte)/380));
    const bw=104, bh=13, x=Math.max(6,Math.min(W-bw-6,(P.x-AT.cam)*z+sx-bw/2)), y=Math.max(52,(P.top.y-FY)*z+AT.floorS+sy-38);
    c.fillStyle="rgba(20,21,29,.85)"; c.beginPath(); c.roundRect(x-2,y-2,bw+4,bh+4,6); c.fill();
    c.fillStyle="#fff"; c.beginPath(); c.roundRect(x,y,bw*S.hpLag,bh,4); c.fill();
    const g=c.createLinearGradient(0,y,0,y+bh), col=f>0.5?["#7be3a3","#41b872"]:f>0.25?["#ffd75a","#f2a92c"]:["#ff9a8a","#e2483f"]; g.addColorStop(0,col[0]); g.addColorStop(1,col[1]);
    c.fillStyle=g; c.beginPath(); c.roundRect(x,y,Math.max(0,bw*f),bh,4); c.fill();
    c.font="700 10px system-ui"; c.textAlign="center"; c.lineWidth=3; c.strokeStyle="#14151d"; c.fillStyle="#fff";
    c.strokeText(`${p.hp}/${p.maxhp}`,x+bw/2,y+bh-2.5); c.fillText(`${p.hp}/${p.maxhp}`,x+bw/2,y+bh-2.5);
    const nm=p.f.name.split(",")[0]; c.font="700 11px system-ui"; c.fillStyle=i?"#ffb4a8":"#ffe07a"; c.strokeText(nm,x+bw/2,y-6); c.fillText(nm,x+bw/2,y-6); });
  { const chg=[0,1].map(i=>AT.side[i].charge).find(ch=>ch&&te-ch.t0<ch.d); if(chg){ const k=Math.min(1,(te-chg.t0)/chg.d), g=c.createRadialGradient(W/2,H*0.45,H*0.25,W/2,H*0.45,H*0.75);
      g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,`rgba(8,6,20,${(chg.tier==="special"?0.75:0.45)*k})`); c.fillStyle=g; c.fillRect(0,0,W,H); } }
  if(cine){ const inn=Math.min(1,ck/0.14), out=ck>0.74?Math.min(1,(ck-0.74)/0.12):0, x=-W*(1-eo(inn))+W*1.1*out*out, y=H*0.2, col=cine.col;
    c.save(); c.translate(x,0); c.fillStyle="rgba(10,8,22,.92)"; c.beginPath(); c.moveTo(-20,y); c.lineTo(W+40,y-26); c.lineTo(W+40,y+48); c.lineTo(-20,y+74); c.closePath(); c.fill();
    c.fillStyle=`rgb(${col})`; c.beginPath(); c.moveTo(-20,y+66); c.lineTo(W+40,y+40); c.lineTo(W+40,y+48); c.lineTo(-20,y+74); c.closePath(); c.fill();
    c.font="900 30px system-ui"; c.textAlign="center"; c.lineWidth=6; c.strokeStyle="#0a0816"; c.fillStyle="#fff"; c.save(); c.translate(W/2,y+34); c.rotate(-0.08);
    c.strokeText(cine.name,0,0); c.fillText(cine.name,0,0); c.font="700 11px system-ui"; c.fillStyle=`rgb(${col})`; c.fillText(ar.p[cine.i].f.name.split(",")[0]+"'s special",0,-27); c.restore(); c.restore(); }
  if(AT.flash&&now>=AT.flash.t0){ const k=(now-AT.flash.t0)/150; if(k>1) AT.flash=null; else { c.fillStyle=`rgba(255,255,255,${AT.flash.a*(1-k)})`; c.fillRect(0,0,W,H); } }
}

function atHud(){
  const ar=AT.ar, g=ar.gap(), m=AT.lists[ar.band()][AT.idx[ar.band()]]||{cost:0,range:"Any"};
  const fm=AT.foeBest[ar.band()], pc=(p,mv)=>mv&&mv.acc?Math.round(100*ar.hitChance(p,mv))+"%":"-";
  ar.p.forEach((p,i)=>{ document.getElementById("at-fo"+i).style.width=(100*p.focus/99)+"%";
    document.getElementById("at-fn"+i).textContent=Math.floor(p.focus); });
  document.getElementById("at-hit0").textContent=pc(ar.p[0],m.name?m:null); document.getElementById("at-hit1").textContent=pc(ar.p[1],fm);
  document.getElementById("at-fn0").classList.toggle("ok",ar.p[0].focus>=m.cost);
  // a white line on your focus bar shows what the selected move costs, and the bar lights up once you can afford it
  const sw=ar.p[0].x>ar.p[1].x, hb=document.getElementById("at-hbot");
  if(hb.classList.contains("atsw")!==sw){ hb.classList.toggle("atsw",sw); hb.classList.remove("flash"); void hb.offsetWidth; hb.classList.add("flash"); }
  const nd=document.getElementById("at-need"), at=`calc(${100*Math.min(99,m.cost)/99}% - 1px)`; nd.style.left=sw?"auto":at; nd.style.right=sw?at:"auto";
  document.getElementById("at-fb0").classList.toggle("ok",ar.p[0].focus>=m.cost&&ar.inRange(m));
  document.getElementById("at-clock").textContent=Math.max(0,Math.ceil(AR.TIME-ar.t));
  const sh=document.getElementById("at-shove"), can=arBand(g)==="Close"&&!(ar.p[0].shoveCool>0); sh.classList.toggle("off",!can);

}
const min58=scale=>58*scale*0.92;
function atStage(c,W,H,FY){
  const sand=FY-230, crowd=sand-12, ctop=Math.max(0,crowd-380);
  const sky=c.createLinearGradient(0,0,0,ctop+40); sky.addColorStop(0,"#140f26"); sky.addColorStop(1,"#2a1f4a"); c.fillStyle=sky; c.fillRect(0,0,W,ctop+40);
  for(let k=0;k<W;k+=W/7){ c.fillStyle="rgba(255,236,170,.9)"; c.beginPath(); c.arc(k+W/14,ctop-60,5,0,7); c.fill(); c.fillStyle="rgba(255,236,170,.08)"; c.beginPath(); c.arc(k+W/14,ctop-60,26,0,7); c.fill(); }
  c.fillStyle="#3a2b5e"; c.fillRect(0,ctop,W,crowd-ctop);
  const cols=["#ffb35c","#8fd3ff","#ff8a7a","#c7a6ff","#5ad18a","#ffe07a","#f4efe4"];
  for(let r=0,y=crowd-8;y>ctop+6;r++,y-=15) for(let x=0;x<W;x+=13){ c.fillStyle=cols[((x*131+r*977)>>3)%cols.length]; c.beginPath(); c.arc(x+(r%2?6:0),y,4.5,0,7); c.fill(); }
  for(let k=0;k<6;k++){ c.fillStyle=["#e2483f","#3b6fb8","#f2c14e","#4caf6a","#c08cff","#ff8a3d"][k]; c.fillRect(6+k*(W-12)/6,crowd,(W-12)/6-5,12); }
  const fl=c.createLinearGradient(0,sand,0,H); fl.addColorStop(0,"#d9a866"); fl.addColorStop(1,"#b98245"); c.fillStyle=fl; c.fillRect(0,sand,W,H-sand);
  // sand grain, and a painted ring line in front of the fighters
  for(let k=0;k<W*(H-sand)/700;k++){ const x=(k*7919)%W, y=sand+((k*104729)%(H-sand)); c.fillStyle=k%3?"rgba(120,78,36,.18)":"rgba(255,240,210,.22)"; c.fillRect(x,y,3,2); }
  c.strokeStyle="rgba(255,248,232,.55)"; c.lineWidth=5; c.beginPath(); c.moveTo(12,FY+120); c.lineTo(W-12,FY+120); c.stroke();
  c.strokeStyle="rgba(255,248,232,.3)"; c.beginPath(); c.ellipse(W/2,FY+120,90,26,0,0,Math.PI); c.stroke();
  for(const x of [0,W-12]){ c.fillStyle="#6b5a8a"; c.fillRect(x,sand-30,12,H-sand+30); c.fillStyle="#8a78ab"; c.fillRect(x,sand-30,12,5); for(let y=sand-18;y<H;y+=14){ c.fillStyle="rgba(0,0,0,.18)"; c.fillRect(x,y,12,2);} }
}
function atResult(){
  if(!AT) return; const ar=AT.ar, d=document.getElementById("atest"), w=ar.winner;
  const div=document.createElement("div"); div.className="res";
  div.innerHTML=`<h2>${w===0?"You win":w===1?"You lose":"Draw"}</h2><div>${ar.judged?"Judges' call after 60 seconds":`Knockout at ${Math.round(ar.t)} seconds`}. You dealt ${ar.p[0].dealt} and took ${ar.p[1].dealt}.</div>
    <div class="row"><button class="btn" id="at-again">Again</button><button class="btn" id="at-pick">Pick Snabits</button></div>`;
  d.appendChild(div);
  document.getElementById("at-again").onclick=()=>atStart(AT.me,AT.foe); document.getElementById("at-pick").onclick=openArenaTest;
}
