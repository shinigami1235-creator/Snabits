/* Tournaments the Monster Rancher 2 way: grades E to S, a regular cup each month, official cups in months 3, 6, 9 and 12,
   round robin and elimination formats, a 15-turn limit with judges, and Fight, Auto, Forfeit or Drop out before each match.
   Needs game.js, ranch.js and battle-ui.js. */
const CUP_NAMES={E:["Sprout Cup","Pebble Cup","Puddle Cup"],D:["Ember Cup","Breeze Cup","Clover Cup"],C:["Thunder Cup","Coral Cup","Granite Cup"],
  B:["Iron Cup","Moonlit Cup","Glacier Cup"],A:["Queen's Cup","King's Cup","Sun Cup"],S:["Masters Cup","Monsters Cup","Star Cup"]};
let CUP=null;

/* The year's calendar, the same every year the way MR2's is: 48 weeks, a few cups most weeks.
   Official cups for every grade in the last week of each season, the Major 4 in each season's middle month,
   the Summer qualifier and the Summer exhibition, the Legend Cup, an open cup each month and regular prize cups. */
const PRIZE_POOL={E:["Berry","Candy","Cool leaf"],D:["Honey cake","Energy nut","Medicine"],C:["Ball","Slim tea","Medicine"],B:["Lucky bit","Element stone","Stat seed"],A:["Stat seed","Life seed","Element stone"],S:["Energy cell","Life seed","Life fruit"],F:["Berry","Candy","Energy nut"]};
const weekParts=w=>({mo:Math.floor(w/4)%12,wk:w%4,yr:Math.floor(w/48)});
function cupsOfWeek(w){
  const {mo,wk}=weekParts(w), out=[], season=SEASON[Math.floor(mo/3)], add=c=>out.push(c);
  const prize=(g,name)=>{ const P=PRIZE_POOL[g]; return P[hashStr(name)%P.length]; };
  if(mo%3===1&&wk===1) add({grade:"S",name:`${season} Major`,format:"bo3",size:8,major:true,season});
  if(mo===3&&wk===3) add({grade:"S",name:"Legend Cup",format:"robin",size:6,legend:true});
  if(mo%3===2&&wk===3){ for(const g of GRADES) add({grade:g,name:`Official ${g} Cup`,format:"elim",size:8,official:true}); return out; }
  if(mo===3&&wk===3){ for(const g of GRADES.slice(1)) add({grade:g,name:`Summer Qualifier (${g})`,format:"elim",size:8,qualifier:true}); return out; }
  if(mo===4&&wk===3){ for(const g of GRADES.slice(1)) add({grade:g,name:`Summer Exhibition (${g})`,format:"team5",size:10,exhibition:true}); return out; }
  if(wk===1) add({grade:"F",name:"Open Cup",format:"robin",size:4,open:true,prize:prize("F","Open"+mo)});
  const grades=wk===0?["E","C","A"]:wk===1?["D","B"]:wk===2?["E","C","A","S"]:["D","B","S"];
  for(const g of grades){ const name=CUP_NAMES[g][(mo+wk)%3]+` (${g})`, elim=(mo+wk)%4===0; add({grade:g,name,format:elim?"elim":"robin",size:elim?8:4,official:false,prize:prize(g,name+mo)}); }
  return out;
}
/* who can enter what, as in MR2: its own grade, one grade up and everything below, the open cups, and the
   official cup and Summer qualifier of its own grade only. The Majors, the Legend Cup and the exhibition need an invite. */
function cupBlock(c,s){
  const gi=GRADES.indexOf(s.grade), ci=GRADES.indexOf(c.grade), yr=weekParts(PLAYER.week).yr;
  if(c.major) return s.majorInvite?null:"Needs an invite, which comes with winning the Official S Cup";
  if(c.legend) return s.master?null:"Needs all four Majors";
  if(c.exhibition) return s.exQual===`${yr}:${c.grade}`?null:`Needs a win in this year's Summer Qualifier (${c.grade})`;
  if(c.official||c.qualifier) return c.grade===s.grade?null:`Grade ${c.grade} only`;
  if(c.open) return null;
  return ci<=gi+1?null:`Needs grade ${GRADES[ci-1]}`;
}
function cupsThisWeek(s){
  const out=cupsOfWeek(PLAYER.week).filter(c=>!cupBlock(c,s));
  out.push({grade:s.grade,name:"Friendly match",format:"single",size:2,official:false,small:true});
  if(weekParts(PLAYER.week).wk===2&&typeof story==="function"&&story().seen.gradeD) out.push({grade:s.grade,name:"Rival match: Rook",format:"single",size:2,official:false,small:true,rival:true});
  return out;
}
function nextCupText(){
  const w=PLAYER.week; for(let k=1;k<16;k++){ const x=w+k, {mo,wk}=weekParts(x); if(wk===3&&mo%3===2) return `The next official cup is in ${k} week${k>1?"s":""}.`; }
  return "";
}
function cupPurse(c){ if(c.rival) return Math.round(GRADE_INFO[c.grade].purse/4); return c.legend?60000:c.major?30000:c.open?400:c.small?Math.round(GRADE_INFO[c.grade].purse/10):c.exhibition?Math.round(GRADE_INFO[c.grade].purse*1.5):GRADE_INFO[c.grade].purse; }
function cupFee(c){ return c.exhibition?2000:c.grade!=="E"&&!c.small&&!c.open?Math.round(cupPurse(c)/10):0; }
function cupFormat(c){ return c.format==="team5"?"Team exhibition, 5 bouts":c.format==="robin"?`Round robin, ${c.size} monsters`:c.format==="elim"?"Knockout, 8 monsters":c.format==="bo3"?"Knockout of 8, best of 3":"One match"; }
function openCups(){
  const s=RS;
  if(s.sick||s.injured){ say("It isn't fit to fight. Rest it or give it medicine first."); return; }
  CUP=null;
  const go=()=>{ openVenue(); venueLobby(); const d=el("r-dusk"); if(d){ d.style.transition="none"; d.style.backgroundColor="transparent"; } };
  if(typeof smoothRanch==="function"&&smoothRanch()&&!s.busy) sceneFade(true,500).then(go,go); else go();
}
function startCup(c){
  const fee=cupFee(c);
  if(fee&&PLAYER.bits<fee){ venueSay(`The ${c.name} costs ${fee} bits to enter, and we have ${PLAYER.bits}.`); return; } PLAYER.bits-=fee; drawUI();
  const s=RS, R=rng(hashStr(s.id+"|cup|"+PLAYER.week+"|"+c.name)), cg=c.grade==="F"?s.grade:c.grade, G=GRADE_INFO[cg];
  const lvl=()=>clamp(s.level+Math.floor(R()*4)-1,G.lv[0],G.lv[1]);
  const field=[{me:true,name:displayName(s)}];
  const big=c.major||c.legend, bigLv=()=>clamp(s.level+Math.floor(R()*5)-1,50,70);
  while(field.length<c.size){ const o=big?gradedOpponent("S",bigLv(),R,null,Math.round(c.legend?560+R()*80:480+R()*120)):gradedOpponent(cg,lvl(),R); field.push({o,name:o.stage==="Bit"?o.m.name:`${o.m.name}, ${MARK[o.mark][0]} Byte`,breeder:BREEDERS[Math.floor(R()*BREEDERS.length)]}); }
  if(typeof rookEntrant==="function"&&story().seen.intro&&(c.official||c.major||c.legend||c.rival)) field[c.format==="single"?1:field.length-1]=rookEntrant(big?"S":cg);   // in a knockout he waits in the other half, for the final
  CUP={c,field,R,pts:field.map(()=>0),hp:field.map(()=>0),res:field.map(()=>field.map(()=>null)),log:[],round:0,alive:field.map((_,i)=>i),done:false,myWins:0,fights:0,out:false};
  CUP.hist=[CUP.alive.slice()];
  if(c.format==="robin"){ // circle method, 4 entrants, 3 rounds
    const n=c.size, ids=[...Array(n).keys()], rounds=[];
    for(let r=0;r<n-1;r++){ const pairs=[]; for(let k=0;k<n/2;k++) pairs.push([ids[k],ids[n-1-k]]); rounds.push(pairs); ids.splice(1,0,ids.pop()); }
    CUP.rounds=rounds;
  }
  if(c.format==="team5"){ CUP.teams=["Hill League","Bay League"]; CUP.bouts=[0,1,2,3,4].map(k=>({a:k,b:k+5,res:null})); }
  CUP.ann=c.format==="team5"?`Five bouts, Hill League against Bay League. ${displayName(s)} fights the first bout, and three bout wins take the exhibition.`:`${c.name.replace(/ \([A-S]\)$/,"")}, ${field.length} monsters. ${c.format==="robin"?"3 points for a win, 1&nbsp;for&nbsp;a&nbsp;draw.":c.format==="single"?"One match, winner takes the purse.":"Lose once and you're out."}`;
  nextMatch();
}
function fighterOf(e){ return e.me?null:e.o; }
function simPair(a,b){ // two computer entrants
  const A=CUP.field[a].o, Bo=CUP.field[b].o;
  const f=simFight(makeFighter(A.fm,A.skills,A.level),makeFighter(Bo.fm,Bo.skills,Bo.level),CUP.R,null,15,CUP.c.format!=="robin");
  return f;
}
function nextMatch(){
  const c=CUP.c;
  if(c.format==="robin"){
    if(CUP.round>=CUP.rounds.length) return finishCup();
    const pairs=CUP.rounds[CUP.round], mine=pairs.find(p=>p.includes(0)), opp=mine[0]===0?mine[1]:mine[0];
    for(const [a,b] of pairs){ if(a===0||b===0) continue; const f=simPair(a,b); scoreRobin(a,b,f); }
    return matchCard(opp);
  }
  if(c.format==="single") return CUP.round>0?finishCup():matchCard(1);
  if(c.format==="team5") return CUP.round>0?finishCup():matchCard(5);
  // elimination, and best of 3 for the Major 4
  if(CUP.out||CUP.alive.length===1) return finishCup();
  if(c.format==="bo3"&&CUP.series&&CUP.series.opp!=null) return matchCard(CUP.series.opp);
  const al=CUP.alive, pairs=[]; for(let k=0;k<al.length;k+=2) pairs.push([al[k],al[k+1]]);
  CUP.pairs=pairs;
  const mine=pairs.find(p=>p.includes(0));
  if(!mine){ // already out: sim the rest
    const next=[]; for(const [a,b] of pairs){ const f=simPair(a,b); next.push(f.winner===0?a:b); } CUP.alive=next; CUP.hist.push(next.slice()); return nextMatch(); }
  return matchCard(mine[0]===0?mine[1]:mine[0]);
}
function scoreRobin(a,b,f){
  if(f.winner===null){ CUP.pts[a]+=1; CUP.pts[b]+=1; CUP.res[a][b]=CUP.res[b][a]="d"; } else { const w=f.winner===0?a:b, l=w===a?b:a; CUP.pts[w]+=3; CUP.res[w][l]="w"; CUP.res[l][w]="l"; }
  CUP.hp[a]+=f.p[0].hp/f.p[0].maxhp; CUP.hp[b]+=f.p[1].hp/f.p[1].maxhp;
}
function matchCard(opp){ CUP.opp=opp; CUP.view="match"; venueMatch(); }
function afterMatch(opp,res){
  const s=RS, c=CUP.c;
  CUP.fights++;
  const won=res.winner===0;
  if(res.learned&&res.learned.length) (CUP.learned=CUP.learned||[]).push(...res.learned);
  if(won){ CUP.myWins++; s.wins++; } else if(res.winner===1) s.losses++;
  if(CUP.field[opp].rook&&!res.forfeit&&typeof rookResult==="function"){ rookResult(won); CUP.rookLine=won?`${displayName(s)} beat ${CUP.field[opp].name}. That makes ${story().rookW} win${story().rookW===1?"":"s"} against Rook.`:`${CUP.field[opp].name} beat ${displayName(s)}, so Rook is ${story().rookL} up against us.`; }
  const on=CUP.field[opp].name;
  CUP.ann=res.forfeit?`${displayName(s)} withdrew from the match with ${on}.`:won?`${displayName(s)} beats ${on}${res.judged?" on the judges' call":""}!`:res.winner===null?`${displayName(s)} and ${on} fight to a draw.`:`${on} takes it${res.judged?" on the judges' call":""}.`;
  if(won) CUP.expGain=(CUP.expGain||0)+4+2*CUP.field[opp].o.level;
  if(c.format==="robin"){ const f={winner:res.winner,p:[{hp:res.hpLeft,maxhp:1},{hp:res.foeHpLeft,maxhp:1}]}; scoreRobin(0,opp,f); CUP.round++; }
  else if(c.format==="single"){ CUP.round++; CUP.singleWon=won; }
  else if(c.format==="team5"){ CUP.round++; CUP.bouts[0].res=won?"w":"l"; for(const b of CUP.bouts.slice(1)){ const f=simPair(b.a,b.b); b.res=f.winner===0?"w":"l"; } }
  else {
    if(c.format==="bo3"&&!res.forfeit){ CUP.series=CUP.series&&CUP.series.opp===opp?CUP.series:{opp,me:0,them:0}; if(won) CUP.series.me++; else CUP.series.them++;
      if(CUP.series.me<2&&CUP.series.them<2){ clampAll(); drawUI(); return nextMatch(); }
      CUP.series.opp=null; }
    const next=[]; for(const [a,b] of CUP.pairs){ if(a===0||b===0){ next.push(won?0:opp); if(!won) CUP.out=true; } else { const f=simPair(a,b); next.push(f.winner===0?a:b); } }
    CUP.alive=next; CUP.hist.push(next.slice()); CUP.round++;
    if(CUP.out){ while(CUP.alive.length>1){ const al=CUP.alive, nx=[]; for(let k=0;k<al.length;k+=2){ const f=simPair(al[k],al[k+1]); nx.push(f.winner===0?al[k]:al[k+1]); } CUP.alive=nx; CUP.hist.push(nx.slice()); } }
  }
  clampAll(); drawUI(); nextMatch();
}
function finishCup(){
  const s=RS, c=CUP.c; let place;
  if(CUP.dropped) place=null;
  else if(c.format==="robin"){ const order=CUP.field.map((e,i)=>i).sort((x,y)=>CUP.pts[y]-CUP.pts[x]||CUP.hp[y]-CUP.hp[x]); place=order.indexOf(0)+1; }
  else if(c.format==="single") place=CUP.singleWon?1:2;
  else if(c.format==="team5") place=CUP.bouts.filter(b=>b.res==="w").length>=3?1:2;
  else place=CUP.alive[0]===0?1:CUP.round>=3?2:CUP.round===2?3:5;
  const purse=cupPurse(c);
  const own=c.format==="team5"&&CUP.bouts[0].res==="w";
  const prize=c.format==="team5"?(place===1?purse+(own?Math.round(purse/2):0):0):place===1?purse:place===2?Math.round(purse/2):place===3?Math.round(purse/4):0;
  const lines=[];
  if(place===null) lines.push(`It dropped out of the ${c.name}.`);
  else if(c.format==="elim"&&place>1) lines.push(`It went out in the ${place===2?"final":place===3?"semi-final":"quarter-final"} of the ${c.name}.`);
  else if(c.format==="team5"){ const n=CUP.bouts.filter(b=>b.res==="w").length; lines.push(`The Hill League ${place===1?"won":"lost"} the exhibition ${Math.max(n,5-n)} bouts to ${Math.min(n,5-n)}, and ${displayName(s)} ${own?"won":"lost"} its own bout.`); }
  else lines.push(`${place===1?"It won":"It finished "+["","first","second","third","fourth","fifth"][Math.min(place,5)]+" in"} the ${c.name}.`);
  if(prize){ PLAYER.bits+=prize; lines.push(`It brings home ${prize} bits.`); }
  if(place===1&&c.prize){ addItem(c.prize); lines.push(`The prize table also had ${/^[AEIOU]/.test(c.prize)?"an":"a"} ${c.prize}.`); }
  if(place===1&&c.qualifier){ s.exQual=`${weekParts(PLAYER.week).yr}:${c.grade}`; lines.push("It's in this year's Summer Exhibition, next month."); }
  // MR2's numbers: a cup wears it out but takes a lot of stress off, most of all with a win
  const last=place===null||(c.format==="robin"&&place===c.size)||(c.format==="elim"&&place===5)||((c.format==="single"||c.format==="team5")&&place===2);
  if(CUP.fights){ if(place===1){ s.stress-=45; s.fatigue+=30; } else if(last){ s.stress-=30; s.fatigue+=50; } else { s.stress-=38; s.fatigue+=40; } clampAll(); }
  if(place===1&&!c.small){ s.cups=(s.cups||[]).concat(c.name); s.stageCups=(s.stageCups||0)+1;
    if(c.official&&c.grade===s.grade&&s.grade!=="S"){ s.grade=GRADES[GRADES.indexOf(s.grade)+1]; lines.push(`It moves up to grade ${s.grade}.`); }
    if(c.official&&c.grade==="S"&&!s.majorInvite){ s.majorInvite=true; lines.push("It's been invited to the Major 4, one big cup each season."); }
    if(c.major){ s.majors=[...new Set((s.majors||[]).concat(c.season))]; lines.push(`That's ${s.majors.length} of the Major 4.`);
      if(s.majors.length===4&&!s.master){ s.master=true; lines.push("It's won all four. It's a Master now, and the Legend Cup opens in the first month of each Summer."); } }
    if(c.legend){ lines.push("A Legend Cup champion. Its name goes on the wall in town."); story().legendWon=true; }
    if((c.grade==="A"||c.grade==="S")&&CUP.R()<0.3){ addItem("Rebirth seed"); lines.push("The prize table had a Rebirth seed."); }
    if(c.grade==="A"&&c.official){ addItem("Life fruit"); lines.push("It also won a Life fruit."); } }
  if(CUP.rookLine) lines.push(CUP.rookLine);
  if(CUP.learned) lines.push(...CUP.learned);
  const lv=giveExp(s,(CUP.expGain||0)+(place===1?10:3));
  CUP.done=true; CUP.place=place; CUP.prize=prize; CUP.lines=lines.concat(lv);
  venueCeremony(()=>{ closeVenue(); scene(async()=>{ const mood=place===1?"happy":"idle";
    if(smoothRanch()){ const d=el("r-dusk"); if(d){ d.style.transition="none"; d.style.backgroundColor="rgba(3,4,9,1)"; } if(s.room) leaveBarn(); say(`${s.m.name} is home from the stadium.`); s.dayHour=21; s.x=2*RW-14; s.camJump=true; await sceneFade(false,700);
      await walkTo(300,60,"walk"); s.pose=mood; if(place===1){ spark(s.x,headY()-6,"sparkle",12); await hop(16,420); } await rwait(900);
      await dayFade("home",()=>{ s.x=150; s.camJump=true; s.pose=mood; }); }
    else { s.pose=mood; if(place===1){ spark(s.x,headY()-6,"sparkle",12); await hop(16,420); } await rwait(500); }
    RS.weekAct="Cup"; await endWeek(1,CUP.lines.join(" ")); }); });
}
