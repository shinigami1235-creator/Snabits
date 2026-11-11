/* The stadium: tournaments happen here, away from the ranch, the way Monster Rancher 2 does it.
   Lobby with this week's cups and the season's official dates, entry, the board (round robin grid or knockout bracket),
   the match card with Fight, Auto, Info, Withdraw and Drop out, then the prize ceremony. Logic lives in tourney.js. */
const BREEDERS=["Coach Rosa","Old Pim","Dara Vell","Kit and Bo","Mister Okon","Lani Reyes","Sergei","Auntie Mae","Jun Park","the Hill twins","Marco","Nadia Fox","Pepper","Ines","Captain Lu","Tomas"];
let VEN=null;

function openVenue(){
  injectVenue();
  if(RS) RS.inTown=false;
  el("ranch").style.display="none"; if(RS) RS.open=false;
  el("venue").style.display="flex"; el("venue").scrollTop=0;
  VEN={t:0,raf:0,crowd:null}; vLoop();
}
function closeVenue(){
  if(VEN) cancelAnimationFrame(VEN.raf); VEN=null;
  el("venue").style.display="none";
  el("ranch").style.display="flex"; if(RS) RS.open=true; drawUI();
}
function injectVenue(){
  if(el("venue")) return;
  const d=document.createElement("div"); d.id="venue";
  d.innerHTML=`<div id="v-stage"><canvas id="v-canvas" width="195" height="119"></canvas><div id="v-title"><h2 id="v-name"></h2><div id="v-sub"></div></div></div><div id="v-body"></div>`;
  document.body.appendChild(d);
}
function venueSay(t){ const a=el("v-ann"); if(a) a.innerHTML=`<span class="who">Announcer</span>${t}`; }
const vBody=h=>{ el("v-body").innerHTML=h; };
const gradeTag=g=>`<span class="g g${g}">${g}</span>`;

/* ---------- lobby ---------- */
function venueLobby(){
  const s=RS, list=cupsThisWeek(s);
  VEN.show={me:true};
  el("v-name").textContent="Snabits Stadium"; el("v-sub").textContent=dateShort();
  const next=list.some(c=>c.official)?"This is official cup week.":nextCupText();
  vBody(`<div class="v-card v-ann" id="v-ann"></div>
    <div class="v-card"><h3>This week</h3><div class="v-list">${list.map((c,i)=>`<button class="v-cup" data-c="${i}">${gradeTag(c.major||c.legend?"S":c.small?"F":c.grade)}
      <span><b>${c.name.replace(/ \([A-S]\)$/,"")}</b><small>${cupFormat(c)}${c.official&&c.grade===s.grade&&s.grade!=="S"?". Winning moves it up a grade":""}${c.prize?`. Prize: ${c.prize}`:""}</small></span>
      <span class="pr">${cupPurse(c).toLocaleString()} bits${cupFee(c)?`<small>${cupFee(c)} to enter</small>`:""}</span></button>`).join("")}</div></div>
    <div class="v-card"><h3>${displayName(s)}</h3><div style="font:500 14px var(--pix);color:var(--mute)">Grade ${s.grade} · ${s.wins} wins · ${s.losses} losses${(s.cups||[]).length?` · ${(s.cups||[]).length} cups`:""}</div></div>
    <div class="v-row"><button class="btn2" id="v-cal">Calendar</button><button class="btn2" id="v-home">Back to the ranch</button></div>`);
  venueSay(`These are the cups ${displayName(s)} can enter this week. ${next}`);
  el("v-cal").onclick=()=>venueCalendar(0);
  el("v-body").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>venueEntry(list[+b.dataset.c]));
  el("v-home").onclick=closeVenue;
}
function venueEntry(c){
  const s=RS, fee=cupFee(c), purse=cupPurse(c);
  el("v-name").textContent=c.name.replace(/ \([A-S]\)$/,""); el("v-sub").textContent=`Grade ${c.major||c.legend?"S":c.grade} · ${cupFormat(c)}`;
  vBody(`<div class="v-card v-ann" id="v-ann"></div>
    <div class="v-card"><h3>Prizes</h3><div class="v-podium">
      <div><i>${c.format==="team5"?"Team win":"1st"}</i><span></span><em>${purse.toLocaleString()} bits${c.prize?` and ${/^[AEIOU]/.test(c.prize)?"an":"a"} ${c.prize}`:""}</em></div>
      ${c.format==="team5"?`<div><i>Own bout</i><span></span><em>${Math.round(purse/2).toLocaleString()} bits more</em></div>`:c.small?"":`<div><i>2nd</i><span></span><em>${Math.round(purse/2).toLocaleString()} bits</em></div><div><i>3rd</i><span></span><em>${Math.round(purse/4).toLocaleString()} bits</em></div>`}
    </div></div>
    <div class="v-row"><button class="btn2" id="v-back">Back</button><button class="big" id="v-enter">Enter${fee?` · ${fee} bits`:""}</button></div>`);
  venueSay(`${c.official?"An official cup. ":""}${c.official&&c.grade===s.grade&&s.grade!=="S"?`Win it and ${displayName(s)} moves up to grade ${GRADES[GRADES.indexOf(s.grade)+1]}. `:""}The cup takes the week.${fee&&PLAYER.bits<fee?` We have ${PLAYER.bits} bits, short of the ${fee} entry.`:""}`);
  el("v-enter").onclick=()=>startCup(c);
  el("v-back").onclick=venueLobby;
}

/* ---------- the calendar: a month of cups, week by week. Only this week's can be entered ---------- */
function venueCalendar(off){
  const s=RS, start=Math.floor(PLAYER.week/4)*4+off*4, mo=Math.floor(start/4)%12;
  el("v-name").textContent="Calendar"; el("v-sub").textContent=`${SEASON[Math.floor(mo/3)]} · Month ${mo%3+1}`;
  const weeks=[0,1,2,3].map(k=>{ const w=start+k, list=cupsOfWeek(w), now=w===PLAYER.week, past=w<PLAYER.week;
    return `<div class="wk ${now?"now":""}"><h4>Week ${k+1}${now?" · this week":past?" · done":""}</h4>${list.length?list.map(c=>{ const why=cupBlock(c,s);
      return `<div class="cu ${why?"no":""}">${gradeTag(c.major||c.legend?"S":c.grade)}<span><b>${c.name.replace(/ \([A-SF]\)$/,"")}</b><br><small style="margin:0">${cupFormat(c)}${c.prize?` · ${c.prize}`:""}</small></span><small>${cupPurse(c).toLocaleString()} bits${why?`<br>${why}`:""}</small></div>`; }).join(""):'<div class="none">No cups this week.</div>'}</div>`; }).join("");
  vBody(`<div class="v-card"><div class="v-calnav"><button class="btn2" id="c-prev" ${off<=0?"disabled":""}>◂ Month</button><b>${SEASON[Math.floor(mo/3)]} · Month ${mo%3+1}</b><button class="btn2" id="c-next" ${off>=11?"disabled":""}>Month ▸</button></div></div>
    <div class="v-card v-cal">${weeks}</div><button class="btn2 v-end" id="c-back">Back</button>`);
  el("c-prev").onclick=()=>venueCalendar(off-1); el("c-next").onclick=()=>venueCalendar(off+1); el("c-back").onclick=venueLobby;
}

/* ---------- the board ---------- */
function boardHtml(){
  const c=CUP.c, F=CUP.field;
  if(c.format==="robin"){
    const mark=r=>r==="w"?["w","○"]:r==="l"?["l","✕"]:r==="d"?["d","△"]:["",""];
    return `<table class="rr"><tr><th></th>${F.map((e,i)=>`<th>${i+1}</th>`).join("")}<th>Pts</th></tr>
      ${F.map((e,i)=>`<tr><td class="nm ${e.me?"self":""}"><span class="sd">${i+1}</span>${e.name}</td>${F.map((e2,j)=>i===j?'<td class="x"></td>':`<td class="${mark(CUP.res[i][j])[0]}">${mark(CUP.res[i][j])[1]}</td>`).join("")}<td class="pt">${CUP.pts[i]}</td></tr>`).join("")}</table>`;
  }
  if(c.format==="single") return "";
  if(c.format==="team5") return `<div class="team5">${CUP.bouts.map((b,k)=>`<div class="t5row"><span class="${F[b.a].me?"self":""} ${b.res==="w"?"win":b.res==="l"?"out":""}">${F[b.a].name}</span><i>${b.res?b.res==="w"?"◀":"▶":"vs"}</i><span class="${b.res==="l"?"win":b.res==="w"?"out":""}">${F[b.b].name}</span></div>`).join("")}</div>
    <div style="margin-top:6px;font-size:13px;color:var(--mute)">${CUP.teams[0]} on the left, ${CUP.teams[1]} on the right.</div>`;
  const H=CUP.hist, cols=[H[0]||[],H[1]||[],H[2]||[]], champ=H[3]&&H[3][0];
  const slot=(i,r)=>{ const won=H[r+1]&&H[r+1].includes(i), lost=H[r+1]&&!won; return `<div class="slot ${F[i].me?"self":""} ${won?"win":""} ${lost?"out":""}">${F[i].name}</div>`; };
  return `<div class="bracket">${cols.map((col,r)=>`<div class="col">${col.length?col.map(i=>slot(i,r)).join(""):Array.from({length:[8,4,2][r]},()=>'<div class="slot">&nbsp;</div>').join("")}</div>`).join("")}</div>
    ${champ!=null?`<div style="margin-top:8px;font:700 14px var(--pix);color:var(--gold)">Champion: ${F[champ].name}</div>`:""}`;
}
const roundName=()=>{ const c=CUP.c; return (c.format==="robin"?`Round ${CUP.round+1} of ${CUP.rounds.length}`:c.format==="single"?"The match":c.format==="team5"?"Bout 1 of 5":["Quarter-final","Semi-final","Final"][CUP.round]||"Final")+(c.format==="bo3"&&CUP.series&&CUP.series.opp!=null?`, game ${CUP.series.me+CUP.series.them+1} (${CUP.series.me}-${CUP.series.them})`:""); };

/* ---------- match card ---------- */
function venueMatch(){
  const s=RS, c=CUP.c, opp=CUP.opp, e=CUP.field[opp], o=e.o;
  VEN.show={me:true,foe:o};
  el("v-name").textContent=c.name.replace(/ \([A-S]\)$/,""); el("v-sub").textContent=roundName();
  const els=m=>`<span class="elc" style="${chipStyle(ELC(m.el1))}">${m.el1}</span>${m.el2?`<span class="elc" style="${chipStyle(ELC(m.el2))}">${m.el2}</span>`:""}`;
  const st=o.fm.stats.map((v,i)=>Math.floor(v*o.level/50+5+(o.fm.flat?o.fm.flat[i]:0)));
  vBody(`<div class="v-card v-ann" id="v-ann"></div>
    <div class="v-card"><div class="v-vs">
      <div><b>${displayName(s)}</b><small>Lv ${s.level} · ${s.wins}-${s.losses}</small><div class="sheet-kind" style="justify-content:center">${els(s.m)}</div></div>
      <div class="vs">VS</div>
      <div><b>${e.name}</b><small>Lv ${o.level} · ${e.breeder}</small><div class="sheet-kind" style="justify-content:center">${els(o.m)}</div></div>
    </div></div>
    <div class="v-acts"><button class="big" id="t-fight">Fight</button><button class="btn2" id="t-auto">Auto</button><button class="btn2" id="t-info">Info</button></div>
    <div class="v-card" id="v-info" style="display:none"><h3>${e.name}</h3><div class="statgrid">${STATS.map((n,i)=>`<div class="sg"><span>${n}</span><b>${st[i]}</b><i><u style="width:${Math.min(100,st[i]/2)}%;background:${ELC(o.m.el1)}"></u></i><em></em></div>`).join("")}</div>
      <p style="margin-top:8px;font-size:13px;color:var(--mute)">${o.m.ability[0]}: ${o.m.ability[1]}. Skills: ${o.skills.join(", ")}.</p></div>
    ${c.format==="single"?"":`<div class="v-card"><h3>${c.format==="robin"?"Standings":c.format==="team5"?"Bouts":"Bracket"}</h3>${boardHtml()}</div>`}
    <div class="v-quit"><button class="btn2" id="t-forfeit">Forfeit match</button><button class="btn2" id="t-drop">Leave cup</button></div>`);
  venueSay(CUP.ann||`${roundName()}: ${displayName(s)} against ${e.name}, raised by ${e.breeder}.`); CUP.ann=null;
  const go=mode=>arenaFight({s,foe:o,mode,title:c.name,noDraw:c.format!=="robin",record:mode==="control",learn:true,rand:CUP.R,onEnd:res=>afterMatch(opp,res)});
  el("t-fight").onclick=()=>go("control"); el("t-auto").onclick=()=>go("auto");
  el("t-info").onclick=()=>{ const i=el("v-info"); i.style.display=i.style.display==="none"?"block":"none"; if(i.style.display==="block") i.scrollIntoView({behavior:"smooth",block:"nearest"}); };
  el("t-forfeit").onclick=()=>afterMatch(opp,{winner:1,forfeit:true,hpLeft:0,foeHpLeft:1});
  el("t-drop").onclick=()=>{ CUP.dropped=true; finishCup(); };
}

/* ---------- prize ceremony ---------- */
function venueCeremony(done){
  const s=RS, c=CUP.c, F=CUP.field, purse=cupPurse(c);
  VEN.show={me:true,podium:CUP.place};
  el("v-name").textContent=c.name.replace(/ \([A-S]\)$/,""); el("v-sub").textContent="Results";
  let order;
  if(c.format==="robin") order=F.map((e,i)=>i).sort((x,y)=>CUP.pts[y]-CUP.pts[x]||CUP.hp[y]-CUP.hp[x]);
  else if(c.format==="single") order=CUP.singleWon?[0,1]:[1,0];
  else if(c.format==="team5") order=CUP.place===1?[0,5]:[5,0];
  else { const H=CUP.hist, last=H[H.length-1]||[], fin=H[H.length-2]||[], semi=H[H.length-3]||[]; order=[...last,...fin.filter(i=>!last.includes(i)),...semi.filter(i=>!fin.includes(i))]; }
  if(CUP.place==null) order=order.filter(i=>!F[i].me).concat(order.filter(i=>F[i].me));
  VEN.show={podium:1,me:true,champ:F[order[0]].me?null:F[order[0]].o};
  const prizeOf=k=>c.format==="team5"?(k===0?CUP.prize:0):k===0?purse:k===1&&!c.small?Math.round(purse/2):k===2&&!c.small?Math.round(purse/4):0;
  const up=CUP.lines.find(l=>/moves up to grade|invited|Master now/.test(l));
  vBody(`<div class="v-card v-ann" id="v-ann"></div>
    ${up?`<div class="v-card v-up">${up}</div>`:""}
    <div class="v-card"><h3>Final placings</h3><div class="v-podium">${order.slice(0,c.format==="robin"?F.length:4).map((i,k)=>`<div class="${F[i].me?"self":""}"><i>${F[i].me&&CUP.place==null?"Out":["1st","2nd","3rd","4th","5th","6th"][k]||""}</i><span>${F[i].name}</span><em>${prizeOf(k)?prizeOf(k).toLocaleString():""}</em></div>`).join("")}</div></div>
    ${CUP.lines.slice(1).filter(l=>l!==up).length?`<div class="v-card" style="font-size:14px;color:#d6d2c4">${CUP.lines.slice(1).filter(l=>l!==up).join(" ")}</div>`:""}
    <button class="big v-end" id="v-done">Head home</button>`);
  venueSay(CUP.place===1?`And the ${c.name} goes to ${displayName(s)}!`:CUP.place==null?`${displayName(s)} dropped out.`:`${displayName(s)} finishes ${["","first","second","third","fourth","fifth","sixth"][CUP.place]||"out of the prizes"}. Better luck next time.`);
  if(CUP.place===1&&typeof musJingle==="function") musJingle(true);
  el("v-done").onclick=done;
}

/* ---------- the stadium picture ---------- */
const STAND_COLS=["#ff8f8f","#ffd166","#8fd6ff","#b8f28f","#e0a8ff","#ffb38a","#f5f0e2"], BANNER_COLS=["#9ad28a","#7cc7e8","#c9a7f2","#f2b36b","#ff8f8f","#ffc93c"];
/* Stands and banners for the battle backdrop at a cup. */
function stadiumBg(cv){
  const x=cv.getContext("2d"), W=cv.width, H=cv.height, R=rng(11);
  x.fillStyle="#241a3f"; x.fillRect(0,0,W,H); x.fillStyle="#2c2140"; x.fillRect(0,14,W,H-14);
  for(let r=0;r<6;r++) for(let c=0;c<W/5;c++){ const cx=c*5+(r%2?2:0), cy=16+r*8; x.fillStyle="#1c1530"; x.fillRect(cx,cy+3,4,4); x.fillStyle=STAND_COLS[Math.floor(R()*STAND_COLS.length)]; x.fillRect(cx+1,cy,2,3); }
  for(let k=0;k<6;k++){ const bx=4+k*(W-8)/6; x.fillStyle=BANNER_COLS[k]; x.fillRect(bx,H-8,(W-8)/6-3,6); }
  x.fillStyle="#fff6c8"; x.fillRect(10,2,12,5); x.fillRect(W-22,2,12,5);
}
function vLoop(){
  if(!VEN) return; VEN.t++;
  const cv=el("v-canvas"); if(!cv){ VEN.raf=requestAnimationFrame(vLoop); return; }
  const sr=el("v-stage").getBoundingClientRect(), wantH=sr.width>0?Math.max(105,Math.round(195*sr.height/sr.width)):119;
  if(cv.height!==wantH) cv.height=wantH;
  const x=cv.getContext("2d"), W=cv.width, H=cv.height, extra=H-119, fy=0, big=false; x.imageSmoothingEnabled=false;
  const smooth=typeof CHIBI_ART!=="undefined"&&CHIBI_ART&&typeof chibiVenueScene==="function";   // smooth art: the stage draws on its own layer underneath
  if(smooth){ x.clearRect(0,0,W,H); chibiVenueScene(cv,VEN.show||{},performance.now()); } else {
  const g=x.createLinearGradient(0,0,0,52); g.addColorStop(0,"#241a3f"); g.addColorStop(1,"#5b3d6e"); x.fillStyle=g; x.fillRect(0,0,W,66);
  // stands with a bobbing crowd
  if(!VEN.crowd){ const R=rng(7); VEN.crowd=[]; for(let r=0;r<4;r++) for(let c2=0;c2<W/5;c2++) VEN.crowd.push([c2*5+(r%2?2:0)+R()*2,30+r*7,STAND_COLS[Math.floor(R()*STAND_COLS.length)],R()*6.28]); }
  x.fillStyle="#2c2140"; x.fillRect(0,28,W,32); x.fillStyle="#3a2f55"; x.fillRect(0,26,W,2);
  for(const [cx,cy,cc,ph] of VEN.crowd){ const b=Math.sin(VEN.t/9+ph)>.6?1:0; x.fillStyle="#1c1530"; x.fillRect(cx,cy+3-b,4,4); x.fillStyle=cc; x.fillRect(cx+1,cy-b,2,3); }
  // banners in grade colours
  for(let k=0;k<6;k++){ const bx=8+k*(W-16)/6; x.fillStyle=BANNER_COLS[k]; x.fillRect(bx,58,(W-16)/6-3,7); x.fillStyle="rgba(0,0,0,.25)"; x.fillRect(bx,63,(W-16)/6-3,2); }
  // arena floor, deeper on a taller stage
  x.fillStyle="#c79a5c"; x.fillRect(0,66,W,H-66); x.fillStyle="#b48647"; for(let k=0;k<W;k+=6) for(let r=0;r<H-70;r+=31) x.fillRect(k+(r%2)*3,70+r+((k*7)%30)%Math.max(1,H-72-r),2,1);
  x.strokeStyle="#e9c98f"; x.lineWidth=1; x.beginPath(); x.ellipse(W/2,94+fy,big?86:70,big?20:16,0,0,6.29); x.stroke(); }
  const show=VEN.show||{};
  // feet sit on the ground line, whatever the sprite's height
  const footRow=grid=>{ for(let r=grid.length-1;r>=0;r--) if(grid[r].some(v=>v)) return r+1; return grid.length; };
  const drawMon=(grid,pal,cx,flip,base,onPod,fm)=>{ if(typeof chibiVenue==="function"&&chibiVenue(fm,cx,flip,base)) return; if(!VEN.cache) VEN.cache=new Map(); let c=VEN.cache.get(grid); if(!c){ c=document.createElement("canvas"); paint(c,grid,pal,1); VEN.cache.set(grid,c); }
    const sz=big?80:40, feet=footRow(grid)*sz/grid.length, by=Math.round(Math.sin(VEN.t/14+cx)*1);
    if(!onPod){ x.fillStyle="rgba(0,0,0,.3)"; x.beginPath(); x.ellipse(cx,base,big?26:14,big?4:2.5,0,0,6.29); x.fill(); }
    x.save(); if(flip){ x.translate(cx*2,0); x.scale(-1,1); } x.drawImage(c,cx-sz/2,Math.round(base-feet+1-Math.max(0,by)),sz,sz); x.restore(); };
  const gap=big?52:40, ground=102, podTop=Math.min(H-16,104);
  if(show.podium!=null&&!smooth){ x.fillStyle="#e9e4d4"; x.fillRect(W/2-22,podTop,44,14); x.fillStyle="#bdb6a0"; x.fillRect(W/2-22,podTop+10,44,4); x.fillStyle="#7a5a1a"; x.fillRect(W/2-1,podTop+3,2,6);
    for(let k=0;k<16;k++){ x.fillStyle=BANNER_COLS[k%6]; x.fillRect((k*37+VEN.t*(1+k%3))%W,(k*23+VEN.t*1.5)%H,2,3); } }
  const s=RS;
  if(show.champ) drawMon(show.champ.fm.grid,show.champ.fm.pal,W/2,false,podTop,true,show.champ.fm);
  else if(s&&show.me){ const fm=fightMon(s); drawMon(fm.grid,fm.pal,show.foe?W/2-gap:W/2,false,show.podium!=null?podTop:ground,show.podium!=null,fm); }
  if(show.foe) drawMon(show.foe.fm.grid,show.foe.fm.pal,W/2+gap,true,ground,false,show.foe.fm);
  if(typeof chibiVenueFlush==="function") chibiVenueFlush(cv);
  VEN.raf=requestAnimationFrame(vLoop);
}
