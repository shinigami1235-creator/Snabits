/* Live friend rooms, built the way Crater Kings does online play: PeerJS links the two phones directly over a 5-letter room code,
   the host's game runs the fight, and the guest sends its pick and plays back the turn the host sends. A version check keeps
   different builds apart, a heartbeat spots dropouts, and the guest rejoins on its own for 45 seconds.
   Needs peer.js, game.js, ghost.js, ranch.js and battle-ui.js. */
const NET_PFX="snabits-r1-", NET_CODES="ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const NET_VER=(()=>{ let t=String(Fight)+JSON.stringify(SKILLS)+Object.keys(FAMILY).join(); let h=2166136261; for(let i=0;i<t.length;i+=3) h=Math.imul(h^t.charCodeAt(i),16777619); return (h>>>0).toString(36).slice(0,5).toUpperCase(); })();
const LN={on:false,host:false,peer:null,conn:null,code:"",opp:null,oppCode:"",seed:0,mine:null,theirs:null,lastRx:0,lastHb:0,away:false,reconn:null,inFight:false,parts:{},log:[]};
function nl(t){ LN.log.push(new Date().toTimeString().slice(0,8)+" "+t); if(LN.log.length>200) LN.log.shift(); }
function netPeerOpts(){ const m=location.hash.match(/peer=([^&]+)/); if(!m) return {}; const [h,p]=decodeURIComponent(m[1]).split(":"); return {host:h,port:+p||9000,path:"/",secure:false,key:"peerjs"}; }

function nSend(o){ const c=LN.conn; if(!c||!c.open) return; const s=JSON.stringify(o);
  if(s.length<6000){ c.send(o); return; }
  const id=Math.random().toString(36).slice(2,8), n=Math.ceil(s.length/6000); for(let i=0;i<n;i++) c.send({t:"part",id,i,n,s:s.slice(i*6000,(i+1)*6000)}); }
function nRecv(raw){
  LN.lastRx=performance.now(); let m; try{ m=typeof raw==="string"?JSON.parse(raw):raw; }catch(e){ return; }
  if(m.t==="hb") return;
  if(m.t==="part"){ const p=LN.parts[m.id]=LN.parts[m.id]||[]; p[m.i]=m.s; if(p.filter(x=>x!=null).length===m.n){ delete LN.parts[m.id]; nRecv(p.join("")); } return; }
  nHandle(m);
}
function nWire(c){ LN.conn=c; LN.lastRx=performance.now();
  c.on("data",nRecv); c.on("close",()=>{ if(LN.conn===c){ nl("link closed"); nDrop(); } }); c.on("error",e=>nl("link error "+(e&&e.type||e))); }
setInterval(()=>{ const now=performance.now();
  if(LN.conn&&LN.conn.open){ if(now-LN.lastHb>2000){ LN.lastHb=now; nSend({t:"hb"}); }
    if(LN.lastRx&&now-LN.lastRx>(LN.away?120000:25000)){ nl("no answer for "+Math.round((now-LN.lastRx)/1000)+"s"); nDrop(); } }
  if(!LN.host&&LN.reconn) nRejoin();
},1000);
document.addEventListener("visibilitychange",()=>{ if(!LN.on) return; const away=document.visibilityState==="hidden"; nl(away?"switched away":"came back"); nSend({t:away?"away":"back"}); if(!away) LN.lastRx=Math.max(LN.lastRx,performance.now()-5000); });
addEventListener("pagehide",()=>{ if(LN.on) nSend({t:"bye"}); });
let nWake=null;
async function nWakeLock(on){ try{ if(on&&!nWake&&navigator.wakeLock&&document.visibilityState==="visible"){ nWake=await navigator.wakeLock.request("screen"); nWake.addEventListener("release",()=>{nWake=null;}); } else if(!on&&nWake){ await nWake.release(); nWake=null; } }catch(e){} }

/* ---------- rooms ---------- */
function nStatus(t){ const e=el("nr-msg"); if(e) e.textContent=t||""; }
function openRooms(msg){
  if(LN.on){ LN.host?hostWait():guestWait(); return; }
  panel(`<div style="flex-basis:100%;font-size:13px">One of you hosts a room and sends the 5-letter code, and the other types it in. You both need the internet while you fight. Friend fights use no week and teach nothing.</div>
    <button class="rb" id="nr-host">Host a room</button>
    <div style="flex-basis:100%;display:flex;gap:8px;align-items:center"><input id="nr-code" maxlength="5" placeholder="K7QPX" style="width:120px;font-size:20px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:6px 10px;border-radius:10px;border:0"><button class="rb" id="nr-join" style="flex:0 0 auto">Join</button></div>
    <div id="nr-msg" style="flex-basis:100%;font-size:13px;color:#ffd23f"></div>
    <button class="rb" id="nr-ghost">Ghost codes<small>Fight without being online together</small></button><button class="rb" id="nr-back">Back</button>
    <div style="flex-basis:100%;font-size:11px;opacity:.6">Game version ${NET_VER}${LN.log.length?` <button class="small" id="nr-log">Copy online log</button>`:""}</div>`);
  nStatus(msg);
  el("nr-host").onclick=netHost; el("nr-join").onclick=()=>netJoin(el("nr-code").value);
  el("nr-ghost").onclick=openGhost; el("nr-back").onclick=()=>menu("Out");
  if(el("nr-log")) el("nr-log").onclick=()=>{ const t=["Snabits online log","Version "+NET_VER,"Role "+(LN.host?"host":"guest")+", room "+(LN.code||"none"),navigator.userAgent,"",...LN.log].join("\n"); navigator.clipboard&&navigator.clipboard.writeText(t); say("Online log copied."); };
}
function netClose(){ nWakeLock(false); LN.reconn=null; try{ LN.conn&&LN.conn.close(); }catch(e){} try{ LN.peer&&LN.peer.destroy(); }catch(e){}
  Object.assign(LN,{on:false,conn:null,peer:null,opp:null,oppCode:"",mine:null,theirs:null,inFight:false,away:false}); }
function netLeave(){ nSend({t:"bye"}); setTimeout(netClose,150); LN.on=false; }
function netHost(){
  if(typeof Peer==="undefined"){ nStatus("Online play could not load"); return; }
  netClose(); LN.host=true; let c=""; for(let i=0;i<5;i++) c+=NET_CODES[Math.floor(Math.random()*NET_CODES.length)]; LN.code=c; nStatus("Opening a room…");
  const p=LN.peer=new Peer(NET_PFX+c,netPeerOpts());
  p.on("open",()=>{ if(LN.on){ nl("room server back"); return; } LN.on=true; nl("hosting "+c); hostWait(); });
  p.on("disconnected",()=>{ nl("lost the room server"); setTimeout(()=>{ if(LN.peer===p&&!p.destroyed&&p.disconnected) try{ p.reconnect(); }catch(e){} },2000); });
  p.on("connection",cn=>{
    if(LN.conn&&LN.conn.open){ cn.on("data",raw=>{ if(cn._ok) return; let m=typeof raw==="string"?JSON.parse(raw):raw;
        if(m&&m.t==="hello"&&m.rejoin&&LN.opp&&m.name===LN.oppName){ cn._ok=true; const old=LN.conn; LN.conn=null; try{ old.close(); }catch(e){} nWire(cn); nHandle(m); nl("replaced a stale link"); }
        else { cn._ok=true; cn.send({t:"deny",why:"This room already has two players."}); setTimeout(()=>cn.close(),300); } }); return; }
    nWire(cn); });
  p.on("error",e=>{ nl("error "+e.type); if(e.type==="unavailable-id"&&!LN.on){ netHost(); return; } if(LN.on) return; nStatus(/network|server|socket/.test(e.type)?"Could not reach the room server. Check your internet connection.":"Online error: "+e.type); });
}
function netJoin(code){
  code=(code||"").toUpperCase().replace(/[^A-Z0-9]/g,""); if(code.length!==5){ nStatus("Room codes have 5 letters and numbers, like K7QPX"); return; }
  if(typeof Peer==="undefined"){ nStatus("Online play could not load"); return; }
  netClose(); LN.host=false; LN.code=code; nStatus("Joining "+code+"…");
  const p=LN.peer=new Peer(netPeerOpts());
  const to=setTimeout(()=>{ if(!LN.on&&LN.peer===p){ nStatus("No answer from room "+code+". Check the code and your internet connection."); netClose(); } },15000);
  p.on("open",()=>{ const cn=p.connect(NET_PFX+code,{reliable:true,serialization:"json"}); nWire(cn);
    cn.on("open",()=>{ clearTimeout(to); LN.on=true; LN.lastRx=performance.now(); nl("joined "+code); nSend({t:"hello",ver:NET_VER,app:APP_VER,name:displayName(RS),mon:ghostCode(RS)}); guestWait(); }); });
  p.on("error",e=>{ nl("error "+e.type); if(LN.reconn) return; clearTimeout(to); nStatus(e.type==="peer-unavailable"?"There is no open room with code "+code:/network|server|socket/.test(e.type)?"Could not reach the room server. Check your internet connection.":"Online error: "+e.type); netClose(); });
}
function nDrop(){
  if(!LN.on) return;
  if(LN.host){ say(`${LN.oppName||"Your friend"} lost the connection. The room stays open for them to come back.`); LN.conn=null; return; }
  if(!LN.reconn){ LN.reconn={t0:performance.now(),next:0,n:0}; say("Lost the connection to the host. Reconnecting…"); }
}
function nRejoin(){
  const R0=LN.reconn, now=performance.now();
  if(now-R0.t0>45000){ LN.reconn=null; say("Could not reconnect to the host."); if(B&&B.net){ $("battle").style.display="none"; B=null; } netClose(); openRooms("Lost the room"); return; }
  if(now<R0.next||(LN.conn&&LN.conn.open)) return; R0.next=now+3000; R0.n++;
  const p=LN.peer; if(!p||p.destroyed){ LN.reconn=null; netClose(); return; }
  if(p.disconnected){ try{ p.reconnect(); }catch(e){} return; }
  nl("rejoin try "+R0.n);
  const cn=p.connect(NET_PFX+LN.code,{reliable:true,serialization:"json"});
  cn.on("open",()=>{ if(LN.conn&&LN.conn.open){ cn.close(); return; } nWire(cn); LN.reconn=null; nl("rejoined"); nSend({t:"hello",ver:NET_VER,app:APP_VER,name:displayName(RS),mon:ghostCode(RS),rejoin:true}); say("Back in the room."); });
}

/* ---------- lobby ---------- */
function lobbyCard(name,code){ return `<div style="flex:1 1 45%;background:#1e1e26;border-radius:10px;padding:8px;font-size:13px;text-align:center" data-code="${code?1:0}"><b>${name}</b></div>`; }
function hostWait(){
  if(!LN.opp){ panel(`<div style="flex-basis:100%;text-align:center"><div style="font-size:13px">Room code</div><div style="font-size:44px;font-weight:900;letter-spacing:8px;color:#ffd23f">${LN.code}</div><div style="font-size:13px">Send this to your friend. Waiting for them to join…</div></div><button class="rb" id="nr-leave">Close the room</button>`);
    el("nr-leave").onclick=()=>{ netLeave(); openRooms(); }; return; }
  panel(`<div style="flex-basis:100%;font-size:13px">Room ${LN.code}. Your friend is here.</div>${lobbyCard(displayName(RS))}${lobbyCard(LN.oppName)}
    <button class="rb" id="nr-start">Start the fight</button><button class="rb" id="nr-leave">Close the room</button>`);
  el("nr-start").onclick=()=>{ LN.seed=Math.floor(Math.random()*1e9); nSend({t:"start",seed:LN.seed}); startNetFight(); };
  el("nr-leave").onclick=()=>{ netLeave(); openRooms(); };
}
function guestWait(){
  panel(`<div style="flex-basis:100%;font-size:13px">In room ${LN.code}. ${LN.opp?"Waiting for the host to start.":"Waiting for the host…"}</div>${LN.opp?lobbyCard(displayName(RS))+lobbyCard(LN.oppName):""}<button class="rb" id="nr-leave">Leave the room</button>`);
  el("nr-leave").onclick=()=>{ netLeave(); openRooms(); };
}

/* ---------- messages ---------- */
function nHandle(m){
  const t=m.t;
  if(t==="away"){ LN.away=true; return; } if(t==="back"){ LN.away=false; return; }
  if(t==="deny"){ say(m.why); netClose(); openRooms(m.why); if(m.old) verCheck().then(j=>{ if(!VER_NEW) { VER_NEW=j||{v:Date.now()}; verBar(); } }); return; }
  if(t==="bye"){ say(`${LN.oppName||"The other player"} left the room.`); const wasHost=LN.host; if(B&&B.net){ $("battle").style.display="none"; B=null; }
    if(wasHost){ LN.opp=null; LN.oppName=""; LN.conn=null; LN.inFight=false; hostWait(); } else { netClose(); openRooms(); } return; }
  if(LN.host){
    if(t==="hello"){
      if(m.ver!==NET_VER){ const mine=appVerNum(APP_VER), theirs=appVerNum(m.app);
        if(mine<theirs){ nSend({t:"deny",why:`Your friend's game is on version ${APP_VER} and yours is on ${m.app}. They need to tap Update, then you can join again.`}); say(`Your friend is on version ${m.app}. Tap Update, then host again.`); verCheck(); }
        else nSend({t:"deny",old:true,why:`Your game is on version ${m.app||"an older build"} and your friend's is on ${APP_VER}. Tap Update, then join again.`});
        return; }
      try{ LN.opp=readGhost(m.mon); }catch(e){ nSend({t:"deny",why:"The host couldn't read your monster."}); return; }
      LN.oppName=m.name; LN.oppCode=m.mon;
      nSend({t:"room",name:displayName(RS),mon:ghostCode(RS)});
      if(m.rejoin&&LN.inFight&&B&&B.net){ nSend({t:"sync",st:nSnap(B.fight),log:B.fight.log.slice(-6)}); nl(m.name+" rejoined"); say(`${m.name} is back.`); return; }
      nl(m.name+" joined"); hostWait(); return; }
    if(t==="pick"&&B&&B.net&&!B.fight.over){ LN.theirs=m.id; if(LN.mine!=null) hostResolve(); return; }
    return;
  }
  if(t==="room"){ try{ LN.opp=readGhost(m.mon); }catch(e){} LN.oppName=m.name; if(!LN.inFight) guestWait(); return; }
  if(t==="start"){ LN.seed=m.seed; startNetFight(); return; }
  if(t==="turn"){ guestTurn(m); return; }
  if(t==="sync"&&B&&B.net){ nApply(B.fight,m.st); B.shown=B.fight.p.map(x=>x.hp); drawPanels(); LN.mine=null; drawButtons(); return; }
}

/* ---------- the fight ---------- */
const SKIPF=new Set(["m","skills","used","seen","hitBy"]);
function nFighter(f){ const o={}; for(const k of Object.keys(f)){ if(SKIPF.has(k)) continue; o[k]=k==="charging"?(f.charging?f.charging.name:null):f[k]; } return JSON.parse(JSON.stringify(o)); }
function nSnap(f){ return {p:[nFighter(f.p[0]),nFighter(f.p[1])],turn:f.turn,over:f.over,winner:f.winner,judged:!!f.judged,field:f.field?JSON.parse(JSON.stringify(f.field)):null}; }
function nApply(f,st){ // the guest sees the fight from its own side, so sides swap
  [0,1].forEach(i=>{ const d=st.p[1-i], x=f.p[i]; for(const k of Object.keys(d)){ x[k]=k==="charging"?(d.charging?x.skills.find(s=>s.name===d.charging)||null:null):d[k]; } });
  f.turn=st.turn; f.over=st.over; f.winner=st.winner===null||st.winner===undefined?null:1-st.winner; f.judged=st.judged; f.field=st.field;
}
function startNetFight(){
  LN.inFight=true; LN.mine=null; LN.theirs=null; nWakeLock(true);
  const me=fightMon(RS), opp=LN.opp, foe={fm:fightMon(opp),skills:opp.equip,level:opp.level,fighter:playerFighter(opp),m:opp.m};
  const fight=new Fight(playerFighter(RS),foe.fighter,rng(LN.seed));
  B={fight,mon:me,opp:foe.fm,busy:false,fast:false,net:true,shown:fight.p.map(f=>f.hp),opts:null};
  $("battle").style.display="flex"; $("loadout").style.display="none"; $("b-fight").style.display="flex"; $("b-fight").classList.remove("done");
  paint($("b-me-sprite"),me.grid,me.pal,1); paint($("b-foe-sprite"),foe.fm.grid,foe.fm.pal,1);
  ["me","foe"].forEach(k=>{ $("b-"+k+"-sprite").className="bsprite"; });
  $("b-log").innerHTML=""; $("b-result").style.display="none";
  logLine(`Friend room ${LN.code}. ${fight.p[1].name}, Lv ${opp.level}. Its skills are ${fight.p[1].skills.map(x=>x.name).join(", ")}.`);
  drawPanels(); drawButtons();
}
function waitingFor(){ $("b-btns").innerHTML=`<div style="grid-column:1/-1;opacity:.8;padding:10px 0">Waiting for ${LN.oppName}…</div>`; }
function netPick(id){
  if(LN.mine!=null) return;
  LN.mine=id; waitingFor();
  if(LN.host){ if(LN.theirs!=null) hostResolve(); }
  else nSend({t:"pick",id,turn:B.fight.turn});
}
async function hostResolve(){
  const f=B.fight, a=LN.mine, b=LN.theirs; LN.mine=null; LN.theirs=null;
  B.busy=true; $("b-btns").classList.add("busy");
  const ev=f.play(a,b);
  if(!f.over&&f.turn>=15){ judge(f,false); ev.push({t:"log",text:f.log[f.log.length-1]}); }
  nSend({t:"turn",ev,st:nSnap(f)});
  await playEvents(f,ev); afterTurn();
}
async function guestTurn(m){
  const f=B&&B.net?B.fight:null; if(!f) return;
  LN.mine=null; B.busy=true; $("b-btns").classList.add("busy");
  const ev=m.ev.map(e=>e.who===undefined?e:{...e,who:1-e.who});
  nApply(f,m.st);
  await playEvents(f,ev); afterTurn();
}
function netEnd(){
  const f=B.fight, won=f.winner===0, draw=f.winner===null; LN.inFight=false; nWakeLock(false);
  $("b-btns").innerHTML="";
  $("b-result").innerHTML=`<h2>${draw?"Draw":won?"You win":"You lose"}</h2><p>${f.judged?"The judges called it after "+f.turn+" turns.":`${won?f.p[1].name:f.p[0].name} broke into pixels in ${f.turn} turns.`}</p><div class="brow"><button class="big" id="b-room">Back to the room</button><button class="small" id="b-leave">Leave</button></div>`;
  $("b-result").style.display="block"; $("b-fight").classList.add("done");
  el("b-room").onclick=()=>{ $("battle").style.display="none"; B=null; LN.host?hostWait():guestWait(); };
  el("b-leave").onclick=()=>{ $("battle").style.display="none"; B=null; netLeave(); openRooms(); };
}
