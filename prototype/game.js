/* Snabits shared game state: the save, the roster and Freezer, levels, grades, fight stats, items and fight habits.
   Needs monster.js, skills.js and battle.js. */
const SAVE_KEY="snabits.save.v1";
const GRADES=["E","D","C","B","A","S"];
const GRADE_INFO={E:{lv:[1,10],earned:[0,40],purse:200},D:{lv:[8,18],earned:[40,120],purse:500},C:{lv:[15,28],earned:[100,220],purse:1200},
  B:{lv:[25,38],earned:[200,320],purse:3000},A:{lv:[35,48],earned:[300,420],purse:7000},S:{lv:[45,60],earned:[400,520],purse:15000}};
const expNeed=L=>10+6*L;
const freezerMax=()=>PLAYER&&PLAYER.upgrades&&PLAYER.upgrades["Big Freezer"]?30:20;
const tierOf=n=>{ const l=SKILLS[n].lv; return l<=8?1:l<=20?2:3; };

/* Items the bag can hold. Snacks are in ranch.js; these are the finds. */
const ITEMS={
  "Medicine":{rarity:1,desc:"Cures a cold or an injury"},
  "Ball":{rarity:1,desc:"A toy. Play takes 5 more stress off that week"},
  "Stat seed":{rarity:2,desc:"Fusion catalyst: +20 to one start stat"},
  "Element stone":{rarity:2,desc:"Fusion catalyst: sets the child's element"},
  "Lucky bit":{rarity:2,desc:"Fusion catalyst: more part mutations"},
  "Life fruit":{rarity:3,desc:"+3 months of lifespan, once per monster"},
  "Rebirth seed":{rarity:3,desc:"Rebirths an old monster as a fresh Bit"},
};
const COMMON_FINDS=["Berry","Cool leaf","Candy","Energy nut"];
const UNCOMMON_FINDS=["Medicine","Ball","Honey cake","Bitter root","Slim tea","chip1"];
const RARE_FINDS=["Stat seed","Element stone","Lucky bit","chip2"];
const VERY_RARE=["Life fruit","Rebirth seed"];

let PLAYER=null;
function newPlayer(){ return {bits:600,week:0,bag:{"Cool leaf":2,"Energy nut":2,"Berry":3,"Candy":2,"Honey cake":2,"Bitter root":2,"Slim tea":1,"Medicine":1},roster:[],active:null,nextId:1,archive:[]}; }
function loadGame(){
  try{ const t=localStorage.getItem(SAVE_KEY); PLAYER=t?JSON.parse(t):newPlayer(); }catch(e){ PLAYER=newPlayer(); }
  for(const e of PLAYER.roster) if(e.m.hybridOf) registerHybrid(...e.m.hybridOf);
  return PLAYER;
}
/* A hybrid family: the first family's body on the second family's legs. */
function registerHybrid(a,b){
  const name=a.slice(0,3)+b.slice(-3).toLowerCase(), A=FAMILY[a], Bf=FAMILY[b];
  if(!FAMILY[name]) FAMILY[name]={of:[a,b],body:A.body,legs:Bf.legs,eyes:A.eyes,mouth:A.mouth,top:A.top,arms:Bf.legs==="spider"?0:Bf.arms,base:A.base.map((v,i)=>Math.round((v+Bf.base[i])/2)),ability:A.ability};
  if(!EVO_TOTAL[name]) EVO_TOTAL[name]=EVO_TOTAL[a].map((v,i)=>Math.round((v+EVO_TOTAL[b][i])/2));
  return name;
}
function saveGame(){
  if(!PLAYER) return;
  if(RS&&RS.id){ const e=PLAYER.roster.find(r=>r.id===RS.id); if(e) e.st=packRanch(RS); }
  try{ localStorage.setItem(SAVE_KEY,JSON.stringify(PLAYER)); }catch(e){}
  askPersist();
}
const hasSave=()=>{ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } };
/* The save file. The game lives in this browser's storage, which survives refreshes and closing the tab but not
   "Clear site data", so the player can keep a copy as a .json file and load it back on any phone or computer. */
let PERSIST_ASKED=false;
/* Installing it as an app: Chrome offers it once the page qualifies, and the Install buttons show only then. */
let INSTALL=null;
const installShow=()=>document.querySelectorAll(".install-btn").forEach(b=>b.hidden=!INSTALL);
addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); INSTALL=e; installShow(); });
addEventListener("appinstalled",()=>{ INSTALL=null; installShow(); });
function installApp(){ if(!INSTALL) return; const p=INSTALL; INSTALL=null; p.prompt(); p.userChoice.finally(installShow); }
function askPersist(){ if(PERSIST_ASKED) return; PERSIST_ASKED=true; try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist(); }catch(e){} }
/* the file is JSON with the save squeezed by gzip into one base64 line: about 4 KB for 20 Snabits */
const b64=buf=>{ let s=""; const u=new Uint8Array(buf); for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); };
const unb64=t=>Uint8Array.from(atob(t),ch=>ch.charCodeAt(0));
const squeeze=async(txt,how)=>new Response(new Blob([txt]).stream().pipeThrough(how)).arrayBuffer();
async function exportSave(){
  saveGame(); const d=new Date(); PLAYER.lastExport=d.toISOString(); saveGame();
  const txt=JSON.stringify(PLAYER); let body;
  try{ body=JSON.stringify({game:"snabits",v:2,saved:d.toISOString(),gz:b64(await squeeze(txt,new CompressionStream("gzip")))}); }
  catch(e){ body=JSON.stringify({game:"snabits",v:1,saved:d.toISOString(),save:PLAYER}); }
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([body],{type:"application/json"})); a.download="snabits-save.json"; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },2000);
}
async function readSaveFile(file){
  const bad=()=>new Error("That file isn't a Snabits save.");
  let o; try{ o=JSON.parse(await file.text()); }catch(e){ throw bad(); }
  let p=o;
  if(o&&o.game==="snabits"){ if(o.gz){ try{ p=JSON.parse(new TextDecoder().decode(await squeeze(unb64(o.gz),new DecompressionStream("gzip")))); }catch(e){ throw bad(); } } else p=o.save; }
  if(!p||!Array.isArray(p.roster)||typeof p.week!=="number") throw bad();
  return {p,saved:o.saved?new Date(o.saved):null};
}
function applySave(p){ localStorage.setItem(SAVE_KEY,JSON.stringify(p)); location.hash=location.hash.replace(/(^#|&)test(&|$)/,"$1"); location.reload(); }
const saveSummary=(p,saved)=>`${p.roster.length} Snabit${p.roster.length===1?"":"s"} and ${p.bits} bits${saved?`, saved ${saved.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}`:""}`;

/* Ranch state fields that persist. Everything else (puppet, particles, props) is rebuilt. */
const KEEP=["worn","held","weather","weatherBonus","majorInvite","master","stage","mark","mark2","variant","wanderEl","stageRegions","stageCups","neglect","cleanRun","uses","book","grid","tp","lastTrained","used","spoil","fear","fatigue","stress","weight","like","dis","known","mess","messKind","messSpots",
  "learned","injured","sick","strainRun","petWeek","playWeek","snackWeek","mealMonth","hinted","toldEvo","slackBonus","dead","level","exp","grade",
  "wins","losses","habits","fightNo","equip","skillsKnown","away","fruitUsed","cups","majors","born","likeT","disT","found","log"];
function packRanch(s){ const o={}; for(const k of KEEP) if(s[k]!==undefined) o[k]=s[k]; return o; }

function addToRoster(m){
  const have=PLAYER.roster.find(r=>r.m.name===m.name&&r.m.stats.join()===m.stats.join());
  if(have) return have;
  if(PLAYER.roster.length>=freezerMax()+1) return null;
  const e={id:"m"+(PLAYER.nextId++),m,st:null};
  PLAYER.roster.push(e); return e;
}
const activeEntry=()=>PLAYER.roster.find(r=>r.id===PLAYER.active);
const displayName=s=>s.stage==="Bit"?s.m.name:`${s.m.name}, ${s.variant&&s.variant!=="Scruffy"?s.variant+" ":""}${MARK[s.mark][0]} ${s.stage}`;
const slotsFor=()=>4;     // every stage fights with the 4 skills picked on its info page

/* Fight stats: the scan's stats plus 1 for every 4 earned points, and the mark's bonus. */
/* Fight stats: the scan's stats run through the level formula, then earned points add on top at 1 for every 3,
   so training counts the same at every level. The mark adds 5% (Mega: 10% and 5%). */
const EARN_DIV=3;
function fightMon(s){
  const bonus=i=>(s.stage!=="Bit"&&s.mark===i?(s.stage==="Mega"?1.10:1.05):1)*(s.stage==="Mega"&&s.mark2===i?1.05:1);
  const stats=s.m.stats.map((v,i)=>Math.round(v*bonus(i)));
  const flat=s.tp.map((v,i)=>Math.round(v/EARN_DIV*bonus(i)));
  if(s.variant==="Lean") stats[5]=Math.round(stats[5]*1.05);
  return {...s.m,name:displayName(s),stats,flat,grid:s.grid||s.m.grid,pal:s.pal||s.m.pal,stage:s.stage,mark:s.mark,mark2:s.mark2,worn:s.worn};
}
function knownSkills(s){
  const k=new Set(s.skillsKnown||[]);
  for(const n of s.m.pool) if(SKILLS[n].lv<=s.level) k.add(n);
  for(const n of s.learned||[]) k.add(n);
  if(typeof sigSkills==="function") for(const n of sigSkills(s)) k.add(n);
  return [...k];
}
function fixEquip(s){
  const known=knownSkills(s), n=slotsFor(s);
  s.equip=(s.equip||s.m.skills).filter(x=>known.includes(x)).slice(0,n);
  for(const x of known){ if(s.equip.length>=n) break; if(!s.equip.includes(x)) s.equip.push(x); }
}
/* Exp and levels. Returns lines for the report. */
function giveExp(s,amt){
  const lines=[]; if(s.worn&&s.worn.head==="Crown") amt=Math.round(amt*1.1); s.exp=(s.exp||0)+amt;
  while(s.exp>=expNeed(s.level)){ s.exp-=expNeed(s.level); s.level++; lines.push(`It reached level ${s.level}.`);
    for(const n of s.m.pool) if(SKILLS[n].lv===s.level) lines.push(`It learned ${n}.`); }
  fixEquip(s); return lines;
}

/* A computer monster for a grade: a random scan, levelled and trained, and evolved if its training has reached its species' total. */
function gradedOpponent(grade,level,rand,wantEl,earned){
  let m=randomOpponent(rand);
  if(wantEl) for(let k=0;k<300&&m.el1!==wantEl;k++) m=randomOpponent(rand);
  const G=GRADE_INFO[grade], roll=Math.round(G.earned[0]+rand()*(G.earned[1]-G.earned[0])), total=earned!=null?earned:roll;
  const focus=Math.floor(rand()*6), second=(focus+1+Math.floor(rand()*5))%6, tp=[0,0,0,0,0,0];
  for(let k=0;k<total;k++){ const r=rand(); tp[r<0.4?focus:r<0.6?second:Math.floor(rand()*6)]++; }
  const s={m,tp,stage:"Bit",mark:-1,level,grid:m.grid};
  const evo=(EVO_TOTAL[m.family]||[110,250]);
  if(total>=evo[0]){ s.stage="Byte"; s.mark=focus; s.grid=scale2x(addMark(m.grid,focus)); }
  const fm=fightMon(s), open=m.pool.filter(n=>SKILLS[n].lv<=level);
  const lo=aiLoadout(m,level,rand); while(lo.length<slotsFor(s)&&open.some(n=>!lo.includes(n))) lo.push(open.find(n=>!lo.includes(n)));
  return {m,fm,level,skills:lo.filter(Boolean),stage:s.stage,mark:s.mark,earned:total};
}

/* Fight habits: the player's choices in tournament fights, saved with the situation. */
function sitKey(me,foe){ const h=me.hp/me.maxhp; return (h>0.6?"H":h>0.3?"M":"L")+(me.energy>=5?"+":"-")+(foe.status?"s":"")+(foe.charging?"c":""); }
function recordHabit(s,fight,id){
  const me=fight.p[0], foe=fight.p[1];
  const n=id===BASIC?"Attack":id===GUARD?"Guard":id>=0?me.skills[id].name:null; if(!n) return;
  s.habits=s.habits||[]; s.habits.push({k:sitKey(me,foe),n,o:fight.turn===0?1:0,f:s.fightNo||0});
  const cut=(s.fightNo||0)-50; s.habits=s.habits.filter(h=>h.f>cut);
}
function habitPick(fight,i,s){
  const me=fight.p[i], foe=fight.p[1-i], R=fight.rand;
  if(me.charging) return RELEASE;
  const low=s.lowLoyalty!==undefined?s.lowLoyalty:(RS===s&&hearts()<2), r0=R();
  if(low&&r0<0.2) return fight.aiPick(me,foe);
  const H=s.habits||[], key=sitKey(me,foe);
  let pool=fight.turn===0?H.filter(h=>h.o):[];
  if(pool.length<3) pool=H.filter(h=>h.k===key);
  if(pool.length<3) pool=H.filter(h=>h.k.slice(0,2)===key.slice(0,2));
  if(pool.length<3) return fight.aiPick(me,foe);
  const ids={}; for(const o of fight.options(me)) ids[o.id===BASIC?"Attack":o.id===GUARD?"Guard":me.skills[o.id].name]=o.id;
  const cnt={}; for(const h of pool) if(h.n in ids) cnt[h.n]=(cnt[h.n]||0)+1;
  const names=Object.keys(cnt); if(!names.length) return fight.aiPick(me,foe);
  const w=names.map(n=>Math.pow(cnt[n],1.5)), tot=w.reduce((a,b)=>a+b,0); let r=R()*tot;
  for(let k=0;k<names.length;k++){ r-=w[k]; if(r<=0) return ids[names[k]]; }
  return ids[names[0]];
}
function styleText(s){
  const H=s.habits||[]; if(H.length<6) return "It hasn't fought enough tournament matches to have a style yet, so it fights on the game's own sense.";
  const top=list=>{ const c={}; list.forEach(h=>c[h.n]=(c[h.n]||0)+1); const e=Object.entries(c).sort((a,b)=>b[1]-a[1])[0]; return e?[e[0],e[1]/list.length]:null; };
  const lines=[], op=top(H.filter(h=>h.o)), low=top(H.filter(h=>h.k[0]==="L")), all=top(H);
  if(op) lines.push(`Opens with ${op[0]} ${op[1]>0.7?"almost every time":op[1]>0.45?"most of the time":"now and then"}.`);
  if(low) lines.push(low[0]==="Guard"?"Guards when its HP is low.":`Goes for ${low[0]} when its HP is low.`);
  if(all&&(!op||all[0]!==op[0])) lines.push(`Its favourite move is ${all[0]}.`);
  return lines.join(" ");
}

/* Plays a whole fight with no animation. Side 0 uses habits when given a ranch state. */
function judge(f,noDraw){
  const a=f.p[0].hp/f.p[0].maxhp, b=f.p[1].hp/f.p[1].maxhp;
  f.over=true; f.judged=true;
  if(Math.abs(a-b)<0.05&&!noDraw) f.winner=null;
  else if(a!==b) f.winner=a>b?0:1;
  else f.winner=f.eff(f.p[0],"spd")>=f.eff(f.p[1],"spd")?0:1;
  f.say(`Time. The judges give it to ${f.winner===null?"nobody, it's a draw":f.p[f.winner].name}.`);
}
function simFight(a,b,rand,habitsOf,limit=15,noDraw=false){
  const f=new Fight(a,b,rand);
  while(!f.over&&f.turn<limit){ f.play(habitsOf?habitPick(f,0,habitsOf):f.aiPick(f.p[0],f.p[1]),f.aiPick(f.p[1],f.p[0])); }
  if(!f.over) judge(f,noDraw);
  return f;
}
function rollFind(rand,boost=1){
  const r=rand()*100;
  let pick;
  if(r<0.5*boost) pick=VERY_RARE[Math.floor(rand()*VERY_RARE.length)];
  else if(r<(0.5+4.5)*boost) pick=RARE_FINDS[Math.floor(rand()*RARE_FINDS.length)];
  else if(r<30) pick=UNCOMMON_FINDS[Math.floor(rand()*UNCOMMON_FINDS.length)];
  else return {bits:Math.round(10+rand()*40)};
  if(pick==="chip1"||pick==="chip2"){
    const tier=pick==="chip1"?[1,8]:[14,20];
    const all=Object.entries(SKILLS).filter(([n,s])=>s.el&&s.lv>=tier[0]&&s.lv<=tier[1]&&s.el!=="Void");
    const [n]=all[Math.floor(rand()*all.length)]; return {item:"Skill chip: "+n};
  }
  return {item:pick};
}
function addItem(name,n=1){ PLAYER.bag[name]=(PLAYER.bag[name]||0)+n; }

/* A frozen copy of a monster for fights that must replay exactly. */
function fightSnapshot(s){ return {worn:{...(s.worn||{})},held:s.held,m:s.m,variant:s.variant,pal:s.pal,mark2:s.mark2,uses:{...(s.uses||{})},tp:s.tp.slice(),stage:s.stage,mark:s.mark,grid:s.grid,level:s.level,equip:s.equip.slice(),habits:s.habits.slice(),lowLoyalty:RS===s&&hearts()<2}; }

/* Skill use counts, mastery, the Skill book and learning a skill by being hit with it. */
const MASTERY=60, CHAIN_USES=30;
function playerFighter(s){
  const f=makeFighter(fightMon(s),s.equip,s.level), u=s.uses||{};
  if(s.variant==="Bulky"){ f.maxhp=Math.round(f.maxhp*1.1); f.hp=f.maxhp; }
  if(s.variant==="Feral") f.critBonus=0.05;
  if(typeof applyGear==="function") applyGear(s,f);
  f.skills=f.skills.map(k=>u[k.name]>=MASTERY&&k.power?{...k,power:Math.round(k.power*1.1),mastered:true}:k);
  return f;
}
function bookMark(s,name,how){ s.book=s.book||{}; const rank={seen:1,hit:2,learned:3}; if(!s.book[name]||rank[how]>rank[s.book[name]]) s.book[name]=how; }
function canLearnOutside(s,n,route){ // route: "trip" | "chip" | "hit"
  const sk=SKILLS[n], own=!sk.el||sk.el===s.m.el1||sk.el===s.m.el2, t=tierOf(n);
  if(sk.fromStat!==undefined||sk.sig) return false;
  if(t===1) return true;
  if(own) return t===2||route==="trip";
  return t===2&&route==="trip";
}
function afterFight(s,fighter,learn){
  const lines=[];
  s.uses=s.uses||{};
  for(const [n,c] of Object.entries(fighter.used||{})) s.uses[n]=(s.uses[n]||0)+c;
  for(const n of Object.keys(fighter.seen||{})) bookMark(s,n,"seen");
  for(const n of Object.keys(fighter.hitBy||{})) bookMark(s,n,"hit");
  if(learn){
    const known=knownSkills(s), chance=(RS===s&&hearts()>=4)?0.2:0.1;
    for(const n of Object.keys(fighter.hitBy||{})){
      if(known.includes(n)||!canLearnOutside(s,n,"hit")) continue;
      if(Math.random()<chance){ s.skillsKnown=(s.skillsKnown||[]).concat(n); bookMark(s,n,"learned"); fixEquip(s); lines.push(`It picked up ${n} from being hit by it.`); break; }
    }
  }
  for(const n of knownSkills(s)) bookMark(s,n,"learned");
  return lines;
}
