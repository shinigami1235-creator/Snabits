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
#atest .scr{position:relative;flex:none;padding-top:var(--safe-t,0px);background:#2a1f4a}#atest .clock2{position:absolute;top:calc(var(--safe-t,0px) + 6px);left:50%;transform:translateX(-50%);font:700 24px var(--pix),system-ui;color:#ffc93c;background:rgba(20,21,29,.75);padding:2px 12px;border-radius:10px}
#atest .stat{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:10px 12px 4px}
#atest .stat .nm{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#atest .stat .r{text-align:right}
#atest .hpb{height:8px;border-radius:4px;background:#262836;margin-top:5px;position:relative;overflow:hidden}#atest .hpb i{position:absolute;top:0;bottom:0;left:0;background:#5ad18a;border-radius:4px}
#atest .r .hpb i{left:auto;right:0}
#atest .fob{height:26px;border-radius:7px;background:#262836;margin-top:6px;position:relative;overflow:hidden;border:2px solid #3a3d52}
#atest .fob i{position:absolute;top:0;bottom:0;left:0;background:linear-gradient(#ffd75a,#f2a92c);border-radius:4px}#atest .r .fob i{left:auto;right:0}
#atest .fob b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;text-shadow:0 1px 2px #14151d,0 0 4px #14151d}
#atest .fob .need{position:absolute;top:-2px;bottom:-2px;width:3px;background:#fff;box-shadow:0 0 0 1px #14151d}
#atest .fob.ok{border-color:#ffc93c}
#atest .hpt{font-size:10px;color:#8b8fa8;margin-top:2px}
#atest .pad{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1.25fr;gap:10px;padding:6px 12px calc(env(safe-area-inset-bottom,0px) + 12px);align-items:end}
#atest .lpad{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#atest .ico{height:54px;padding:0}#atest .ico svg{width:26px;height:26px}
#atest .ico.walk{height:78px;font-size:30px}
#atest .ico.off{opacity:.35}#atest .ico.on{border-color:#ffc93c;color:#ffc93c}
#atest .rpad{display:flex;flex-direction:column;gap:6px}
#atest .cur{font-size:13px;font-weight:700;text-align:center;min-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#atest .cur small{color:#8b8fa8;font-weight:500}
#atest .slots{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#atest .slot{position:relative;height:70px;border-radius:12px;background:#1d1f2b;border:3px solid #2c2f40;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:0 4px}
#atest .slot .n{font-size:11px;font-weight:700;line-height:1.1;text-align:center;max-width:100%;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
#atest .slot svg{width:24px;height:24px;flex:none}#atest .slot .c{position:absolute;right:5px;bottom:2px;font-size:11px;font-weight:700;color:#ffc93c}
#atest .slot .rd{position:absolute;left:5px;top:5px;width:9px;height:9px;border-radius:50%}
#atest .slot.out{opacity:.32}#atest .slot.wait{filter:saturate(.4) brightness(.8)}#atest .slot.poor .c{color:#ff8a7a}#atest .slot.sel{border-color:#ffc93c;background:#2a2617}
#atest .arr{height:36px;font-size:15px}
#atest .res{position:absolute;left:16px;right:16px;top:38%;background:#1d1f2b;border:2px solid #ffc93c;border-radius:14px;padding:16px;text-align:center}
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
  const d=document.getElementById("atest");
  d.innerHTML=`<div class="scr"><canvas id="at-cv"></canvas><div class="clock2" id="at-clock">60</div></div>
    <div class="stat"><div><div class="nm">${A.f.name}</div><div class="hpb"><i id="at-hp0"></i></div><div class="hpt" id="at-l0"></div><div class="fob" id="at-fb0"><i id="at-fo0"></i><span class="need" id="at-need"></span><b id="at-fn0"></b></div></div>
      <div class="r"><div class="nm">${B.f.name}</div><div class="hpb"><i id="at-hp1"></i></div><div class="hpt" id="at-l1"></div><div class="fob" id="at-fb1"><i id="at-fo1"></i><b id="at-fn1"></b></div></div></div>
    <div class="pad"><div class="lpad"><button class="btn ico" id="at-shove" aria-label="Shove">${AT_ICON.shove}</button><button class="btn ico" id="at-auto" aria-label="Auto">${AT_ICON.auto}</button>
      <button class="btn ico walk" id="at-l" aria-label="Walk left">◀</button><button class="btn ico walk" id="at-r" aria-label="Walk right">▶</button></div>
      <div class="rpad"><button class="btn arr" id="at-up" aria-label="Previous moves">▲</button><div class="slots" id="at-rows"></div><button class="btn arr" id="at-dn" aria-label="Next moves">▼</button></div></div>`;
  const hold=(id,dir)=>{ const b=document.getElementById(id), on=e=>{ e.preventDefault(); ar.p[0].wantDir=dir; b.classList.add("on"); }, off=()=>{ if(ar.p[0].wantDir===dir) ar.p[0].wantDir=0; b.classList.remove("on"); };
    b.addEventListener("pointerdown",on); b.addEventListener("pointerup",off); b.addEventListener("pointercancel",off); b.addEventListener("pointerleave",off); };
  hold("at-l",-1); hold("at-r",1);
  document.getElementById("at-shove").onclick=()=>ar.shove(ar.p[0]);
  document.getElementById("at-auto").onclick=e=>{ AT.auto=!AT.auto; ar.p[0].ai=AT.auto?"smart":"human"; e.currentTarget.classList.toggle("on",AT.auto); };
  const n=moves.length, cyc=k=>(k%n+n)%n;
  document.getElementById("at-up").onclick=()=>{ AT.top=cyc(AT.top-2); AT.sel=AT.top; atRows(); };
  document.getElementById("at-dn").onclick=()=>{ AT.top=cyc(AT.top+2); AT.sel=AT.top; atRows(); };
  document.getElementById("at-rows").onclick=e=>{ const r=e.target.closest("[data-k]"); if(!r) return; const k=+r.dataset.k;
    if(k!==AT.sel){ AT.sel=k; atRows(); return; } ar.start(ar.p[0],moves[k]); };
  atRows(); atSize();
  AT.raf=requestAnimationFrame(atLoop);
}
function atSize(){ const cv=document.getElementById("at-cv"), W=cv.clientWidth||390, H=Math.round(Math.max(220,Math.min(520,(window.innerHeight||844)-375))), dpr=Math.min(2,devicePixelRatio||1);
  cv.width=W*dpr; cv.height=H*dpr; cv.style.height=H+"px"; AT.W=W; AT.H=H; AT.dpr=dpr; }
/* four move slots at a time, each with its icon, name, range dot and cost; ▲ ▼ cycle through the rest */
function atRows(){
  const ar=AT.ar, p=ar.p[0], M=AT.moves, n=M.length, rows=document.getElementById("at-rows"); if(!rows) return;
  const ks=[0,1,2,3].map(j=>(AT.top+j)%n);
  const html=ks.map(k=>{ const m=M[k], on=ar.inRange(m);
    return `<div class="slot ${on?"":"out"} ${k===AT.sel?"sel":""} ${p.focus<m.cost?"poor":""} ${ar.turn||p.cool>0?"wait":""}" data-k="${k}"><span class="rd" style="background:${AT_RC[m.range]}"></span>${atIcon(m)}<span class="c">${m.cost}</span><span class="n">${m.name}</span></div>`; }).join("");
  if(html!==AT.rowsHtml){ rows.innerHTML=html; AT.rowsHtml=html; }
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
  // hitstop: the fight and its animations pause for a moment when a hit lands
  const frozen=now<AT.freeze; if(!frozen){ AT.te+=real*1000; if(!ar.turn) AT.acc+=real; }
  // a move in progress: it lands at its contact frame and the fight carries on once its animation ends
  if(ar.turn&&!AT.turn) AT.turn={t0:AT.te,C:200,D:500};   // never leave a turn hanging
  if(ar.turn&&AT.turn){ const t=AT.te-AT.turn.t0, run=f=>{ ar.ev=[]; f(); for(const e of ar.ev) atEvent(e,now); };
    if(!ar.turn.done&&t>=AT.turn.C) run(()=>ar.land());
    if(ar.turn&&t>=AT.turn.D){ run(()=>ar.endTurn()); AT.turn=null; } }
  while(AT.acc>=AR.DT&&!ar.over&&!ar.turn){ AT.acc-=AR.DT; ar.ev=[]; ar.step(); for(const e of ar.ev) atEvent(e,now); }
  if(ar.over) for(const i of [0,1]) if(ar.winner===1-i&&AT.side[i].ko==null) AT.side[i].ko=AT.te;
  atHud(); atRows(); atDraw(now,frozen?0:real*1000);
  if(ar.over&&!AT.done){ AT.done=true; setTimeout(atResult,1300); }
  AT.raf=requestAnimationFrame(atLoop);
}
const AT_TIER={light:{stop:30,trauma:0.1,sparks:4,flash:45},medium:{stop:55,trauma:0.22,sparks:7,flash:55},heavy:{stop:100,trauma:0.6,sparks:18,flash:100,white:1}};
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
    const K=ANIM[kind], rate=Math.max(0.75,Math.min(1.25,K.C/Math.max(300,m.wind*900)));
    AT.turn={t0:te,C:K.C/rate,D:Math.min(K.D/rate,K.C/rate+700)};
    const col=m.el&&typeof ELC==="function"?hexRgb(ELC(m.el)):AT_FAMCOL[AT.ar.p[e.i].f.family]||[255,214,90];
    S.anim={kind,t0:te,rate,el:m.el||null,name:m.name,src:typeof sourceFor==="function"?sourceFor({name:m.name,kind:m.cast?"Cast":"Strike"},sp):"mouth",col,pw:m.dmg>=70?1.35:m.dmg>=40?1.05:0.8,contact:/^(tackle|bite|stomp|punch|claw|shadowstrike|fly)$/.test(kind)};
    try{ sfx(m.cast?"charge":"whoosh"); if(typeof elSfx==="function") elSfx(m.el,"cast"); if(typeof kindSfx==="function") kindSfx(kind); }catch(err){}
  }
  if(e.t==="step"){ S.hop={t0:te,h:16}; }
  if(e.t==="swap"){ AT.side[0].hop={t0:te,h:46}; AT.side[1].hop={t0:te,h:30}; try{ sfx("whoosh"); }catch(err){} }
  if(e.t==="hit"){ const o=AT.side[1-e.i], tier=e.crit?"heavy":e.dmg>=25?"medium":"light", T=AT_TIER[tier];
    if(e.h===0||!o.react||te-o.react.t0>120){ o.react={kind:"hit",t0:te,tier}; AT.freeze=Math.max(AT.freeze,now+T.stop); AT.trauma=Math.min(1,AT.trauma+T.trauma);
      AT.spark={i:1-e.i,n:T.sparks,col:S.anim?S.anim.col:[255,236,160]}; if(S.anim&&S.anim.contact) S.recoil={t0:te,amt:tier==="heavy"?10:6};
      try{ sfx(tier==="heavy"?"heavy":tier==="medium"?"hit":"tap"); if(S.anim) elSfx(S.anim.el,"hit"); }catch(err){} }
    AT.fx.push({i:1-e.i,t0:now+e.h*90,txt:String(e.dmg),crit:e.crit}); }
  if(e.t==="miss"){ const o=AT.side[1-e.i]; if(e.why!=="out") o.react={kind:"dodge",t0:te};
    AT.fx.push({i:1-e.i,t0:now,txt:e.why==="out"?"Out of reach":e.why==="block"?"Blocked":"Miss"}); }
  if(e.t==="slam"){ S.react={kind:"hit",t0:te,tier:"heavy"}; AT.trauma=Math.min(1,AT.trauma+0.5); AT.fx.push({i:e.i,t0:now,txt:`Wall ${e.dmg}`,crit:true});
    try{ sfx("heavy"); }catch(err){} }
  if(e.t==="buff") AT.fx.push({i:e.i,t0:now,txt:m.name,buff:true});
}
const AT_FAMCOL={Antik:[255,224,122],Squib:[127,211,242],Moko:[255,154,214],Booly:[159,184,255],Skit:[244,239,228],Chomp:[255,214,90],Pinch:[255,138,122],Stilt:[255,179,92]};
/* one side's pose and offset this frame, the way the battle's sideState works */
function atSideState(S,te){
  const out={f:0,arc:0,lift:0,rot:0,sx:1,sy:1,pose:null,flash:0,off:[0,0],alpha:1};
  const A=S.anim; if(A){ const t=(te-A.t0)*A.rate, K=ANIM[A.kind]; if(t>K.D) S.anim=null; else Object.assign(out,K.atk(t,{foeH:60,perp:[0,-1]})); }
  const O=S.foe.anim; if(O&&!S.anim){ const t=(te-O.t0)*O.rate, K=ANIM[O.kind]; if(t<=K.D&&K.def){ const d=K.def(t,{foeH:60,perp:[0,-1]}); if(d) Object.assign(out,d); } }
  if(S.pose&&te<S.pose.until&&!S.anim) out.pose=S.pose.p;
  if(S.recoil){ const k=(te-S.recoil.t0)/170; if(k>1) S.recoil=null; else out.off[0]-=S.dir*S.recoil.amt*Math.sin(k*Math.PI); }
  const R=S.react;
  if(R){ const dur=R.kind==="hit"?(R.tier==="heavy"?560:420):380, k=(te-R.t0)/dur;
    if(k>1) S.react=null;
    else if(R.kind==="hit"){ const T=AT_TIER[R.tier], dt=te-R.t0; out.pose="hit"; out.flash=T.white?(dt<18?2:dt<T.flash?1:0):dt<T.flash?3:0;
      out.off[0]-=S.dir*(R.tier==="heavy"?16:9)*(k<0.25?eo(k/0.25):1-eo((k-0.25)/0.75)); out.rot-=S.dir*0.12*(R.tier==="heavy"?1.6:1)*Math.sin(Math.min(1,k*1.5)*Math.PI); }
    else { const s2=Math.sin(k*Math.PI); out.pose="dodge"; out.off[0]-=S.dir*22*s2; out.off[1]-=12*s2; } }
  if(S.hop){ const k=(te-S.hop.t0)/380; if(k>1) S.hop=null; else { out.arc-=Math.sin(k*Math.PI)*S.hop.h; if(!out.pose) out.pose="jump"; } }
  if(S.ko!=null){ out.pose="ko"; const k=(te-S.ko-500)/220; if(k>0){ out.alpha=Math.max(0,1-k); } }
  return out;
}
function atDraw(now,dte){
  const cv=document.getElementById("at-cv"); if(!cv) return; const c=cv.getContext("2d"), W=AT.W, H=AT.H, dpr=AT.dpr, ar=AT.ar, te=AT.te;
  CB.te=te;   // the battle helpers (sparks, dust, bursts) run on this clock
  if(!AT.bg){ const b=document.createElement("canvas"); b.width=W*dpr; b.height=H*dpr; const x=b.getContext("2d"); x.scale(dpr,dpr); atStage(x,W,H); AT.bg=b; }
  const shake=AT.trauma*AT.trauma*7; AT.trauma=Math.max(0,AT.trauma-dte/700);
  const sx=shake?Math.sin(te/23)*shake:0, sy=shake?Math.cos(te/31)*shake*0.6:0;
  c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,W,H); c.drawImage(AT.bg,sx,sy,W,H);
  const floor=H-44, X=x=>34+x/AR.LEN*(W-68), scale=Math.min(1.5,Math.max(1,H/300)), alpha=Math.min(1,AT.acc/AR.DT);
  // glide between engine steps, then ease toward that so pushes and swaps slide instead of jumping
  ar.p.forEach((p,i)=>{ const S=AT.side[i], want=X(p.px==null?p.x:p.px+(p.x-p.px)*alpha);
    S.x=S.x==null?want:S.x+(want-S.x)*(1-Math.exp(-dte/45)); });
  { const a=AT.side[0], b=AT.side[1], min=58*scale, gap=Math.abs(b.x-a.x);
    if(gap<min){ const mid=Math.max(34+min/2,Math.min(W-34-min/2,(a.x+b.x)/2)), s=b.x>=a.x?1:-1; a.dx=mid-s*min/2; b.dx=mid+s*min/2; } else { a.dx=a.x; b.dx=b.x; } }
  // the gap between them on the floor
  { const a=Math.min(AT.side[0].dx,AT.side[1].dx), b=Math.max(AT.side[0].dx,AT.side[1].dx), y=floor+16, band=arBand(ar.gap());
    c.strokeStyle=AT_RC[band]; c.lineWidth=3; c.setLineDash([6,5]); c.beginPath(); c.moveTo(a,y); c.lineTo(b,y); c.stroke(); c.setLineDash([]);
    c.font="700 12px system-ui"; c.textAlign="center"; c.lineWidth=4; c.strokeStyle="#14151d"; c.fillStyle=AT_RC[band]; c.strokeText(band,(a+b)/2,y+15); c.fillText(band,(a+b)/2,y+15); }
  const placed=[null,null];
  [0,1].forEach(i=>{ const S=AT.side[i], O=AT.side[1-i], sp=S.spec; if(!sp) return;
    S.dir=O.dx>S.dx?1:-1; S.foe=O;
    const h=CHIBI.height(sp.stage,sp.marks,sp.family), u=Math.min(0.5,96/(h+20))*scale;
    // walking comes from the engine, so the pose doesn't flicker between walk and idle on fast screens
    const st=atSideState(S,te), moving=!ar.turn&&ar.p[i].walkT!=null&&ar.t-ar.p[i].walkT<0.25;
    let pose=st.pose||(moving?"walk":"idle");
    if(pose!==S.shown){ S.from=S.shown||"idle"; S.shown=pose; S.t0=te; }
    const k=(te-S.t0)/110, P=k>=0&&k<1&&CHIBI.POSES.includes(S.from)&&CHIBI.POSES.includes(pose)?CHIBI.blend(S.from,pose,k):pose;
    // a contact move reaches the opponent, but never further than a short lunge when it's out of reach
    const reach=Math.max(-70,Math.min(70,(O.dx-S.dx)-S.dir*min58(scale)));
    const x=S.dx+reach*st.f+st.off[0], y=floor+st.arc+st.lift+st.off[1], mir=S.dir>0?-1:1;
    if(moving!==!!S.moving&&S.ko==null&&typeof spawnPuff==="function") spawnPuff(x-S.dir*10,y-2,moving?5:7,S.dir>0?Math.PI:0,1.2,0.08,5*scale,"rgba(235,228,214,1)",320);
    S.moving=moving;
    c.fillStyle="rgba(0,0,0,.2)"; c.beginPath(); c.ellipse(x,floor+2,24*scale*(st.alpha),6*scale,0,0,7); c.fill();
    c.save(); c.globalAlpha=st.alpha; if(st.flash===2) c.filter="brightness(0) invert(1)"; else if(st.flash===1) c.filter="brightness(1.5)"; else if(st.flash===3) c.filter="brightness(1.18)";
    c.translate(x,y); c.rotate(st.rot); c.scale(mir*u*st.sx,u*st.sy); c.translate(-100,-188);
    CHIBI.draw(c,{...sp,capture:(S.cap={})},P,te,[0.6*S.dir*mir,0]); c.restore();
    const cp=S.cap||{}, d=q=>q?{x:q.x/dpr,y:q.y/dpr}:null;
    placed[i]={x,y:y-h*u*0.45,foot:y,lift:st.lift,back:false,r:CHIBI.width(sp.stage,sp.family)*u*0.55,eyes:cp.eyes&&cp.eyes.map(d),mouth:d(cp.mouth),hands:(cp.hands||[]).map(d),top:d(cp.top)||{x,y:y-50},center:d(cp.center)};
  });
  // the game's own attack effects, from the attacker's eyes, mouth or hands to the target
  [0,1].forEach(i=>{ const A=AT.side[i].anim; if(!A||!placed[i]||!placed[1-i]||!ANIM[A.kind].fx) return;
    const T0=placed[1-i], tgt={...T0,x:T0.center?T0.center.x:T0.x,y:T0.center?T0.center.y:T0.y};
    try{ ANIM[A.kind].fx(c,(te-A.t0)*A.rate,{self:placed[i],target:tgt,targetLift:tgt.lift||0,col:A.col,el:A.el,name:A.name,from:originOf(placed[i],A.src,tgt),pw:A.pw,W,H}); }catch(err){ AT.side[i].anim=null; } });
  if(AT.spark&&placed[AT.spark.i]){ const p=placed[AT.spark.i], src=placed[1-AT.spark.i], c0=p.center||p;
    spawnSparks(c0,Math.atan2(c0.y-src.y,c0.x-src.x),AT.spark.n,AT.spark.col); AT.burst={i:AT.spark.i,t0:te,col:AT.spark.col}; AT.spark=null; }
  if(AT.burst&&placed[AT.burst.i]&&te-AT.burst.t0<260){ const p=placed[AT.burst.i]; burst(c,p.center||p,(te-AT.burst.t0)/260,AT.burst.col); }
  drawSparks(c,dte); drawPuffs(c);
  // damage numbers and words over the head
  AT.fx=AT.fx.filter(f=>now-f.t0<900); c.textAlign="center"; for(const f of AT.fx){ if(now<f.t0) continue; const k=(now-f.t0)/900, p=placed[f.i]; if(!p) continue;
    c.font=`700 ${f.crit?19:15}px system-ui`; c.globalAlpha=1-k*k; c.lineWidth=4; c.strokeStyle="#14151d"; c.fillStyle=f.buff?"#8fd3ff":f.crit?"#ffc93c":"#ffffff";
    const y=p.top.y-14-k*26; c.strokeText(f.txt,p.x,y); c.fillText(f.txt,p.x,y); c.globalAlpha=1; }
}

function atHud(){
  const ar=AT.ar, g=ar.gap(), m=AT.moves[AT.sel];
  ar.p.forEach((p,i)=>{ document.getElementById("at-hp"+i).style.width=(100*p.hp/p.maxhp)+"%"; document.getElementById("at-fo"+i).style.width=(100*p.focus/99)+"%";
    document.getElementById("at-l"+i).textContent=`HP ${p.hp} of ${p.maxhp}`; document.getElementById("at-fn"+i).textContent=`Focus ${Math.floor(p.focus)}`; });
  // a white line on your focus bar shows what the selected move costs, and the bar lights up once you can afford it
  document.getElementById("at-need").style.left=`calc(${100*Math.min(99,m.cost)/99}% - 1px)`;
  document.getElementById("at-fb0").classList.toggle("ok",ar.p[0].focus>=m.cost&&ar.inRange(m));
  document.getElementById("at-clock").textContent=Math.max(0,Math.ceil(AR.TIME-ar.t));
  const sh=document.getElementById("at-shove"), can=arBand(g)==="Close"&&!(ar.p[0].shoveCool>0); sh.classList.toggle("off",!can);
}
const min58=scale=>58*scale*0.92;
function atStage(c,W,H){
  const sky=c.createLinearGradient(0,0,0,H*0.45); sky.addColorStop(0,"#2a1f4a"); sky.addColorStop(1,"#3a2b5e"); c.fillStyle=sky; c.fillRect(0,0,W,H);
  const cols=["#ffb35c","#8fd3ff","#ff8a7a","#c7a6ff","#5ad18a","#ffe07a","#f4efe4"], top=Math.round(H*0.36);
  const rows=Math.max(5,Math.floor((top-14)/15)); for(let r=0;r<rows;r++) for(let x=0;x<W;x+=13){ const cx=x+(r%2?6:0), cy=14+r*15; c.fillStyle=cols[((x*131+r*977)>>3)%cols.length]; c.beginPath(); c.arc(cx,cy,4.5,0,7); c.fill(); }
  for(let k=0;k<6;k++){ c.fillStyle=["#e2483f","#3b6fb8","#f2c14e","#4caf6a","#c08cff","#ff8a3d"][k]; c.fillRect(6+k*(W-12)/6,top-8,(W-12)/6-5,8); }
  const fl=c.createLinearGradient(0,top,0,H); fl.addColorStop(0,"#d9a866"); fl.addColorStop(1,"#c08b4c"); c.fillStyle=fl; c.fillRect(0,top,W,H-top);
  
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
