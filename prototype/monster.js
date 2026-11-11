/* Snabits Bit monster generator: label grid, photo colours, stats from the design doc. */
const FAMILY = {
  Squib:{body:[3,[3,5,6,6,7,7,7,7]], legs:"tentacles", base:[55,40,40,65,50,50], ability:["Wobble","The first hit it takes each fight deals 30% less"]},
  Antik:  {body:[4,[3,5,6,6,6,6,6,5,3]], legs:"twolegs", top:1, base:[50,65,55,35,40,55], ability:["Heavy Lifter","Held item bonuses +50%"]},
  Chomp:  {body:[3,[4,5,6,6,6,6,6,6,6,6,5]], legs:"stubby", mouth:3, base:[55,60,50,35,40,60], ability:["Big Bite","Strikes of 50 power or less, its basic attack included, hit 20% harder"]},
  Moko:  {body:[3,[3,5,6,7,7,7,7,6,5,3]], legs:"tentacles", eyes:"cyclops", base:[55,35,40,75,50,45], ability:["Keen Eye","Its accuracy can't be lowered and dodge doesn't work against it"]},
  Pinch:  {body:[5,[5,6,6,6,6,6,6,5]], legs:"twolegs", arms:3, base:[50,55,65,35,50,45], ability:["Shell","Crits can't land on it"]},
  Stilt:  {body:[2,[2,3,3,3,3,3,3,3,2]], legs:"longlegs", base:[55,50,35,50,45,65], ability:["Long Stride","Acts first on the turn it switches in"]},
  Skit: {body:[7,[3,5,6,6,6,6,5]], legs:"spider", eyes:"spider", arms:0, base:[45,55,45,45,45,65], ability:["Web","Its basic attack has a 30% chance to drop the target's Speed 1 step"]},
  Booly:  {body:[3,[2,3,4,4,5,5,6,6,6,7,7,7]], legs:"ghost", base:[60,35,40,70,55,40], ability:["Slippery","10% chance to dodge any Strike"]},
};
const STATS = ["HP","Power","Guard","Mind","Spirit","Speed"];
const LEAN = {Blaze:[1,2],Brawl:[0,3],Spark:[5,0],Wild:[0,5],Frost:[2,0],Tide:[4,1],Venom:[3,4],Charm:[3,1],Stone:[2,3],Light:[4,2],Steel:[1,5],Shade:[5,4]};
const EL_ABILITY = {
  Blaze:[["Hothead","Strike hits on it have a 20% chance to Burn the attacker"],["Wildfire","Burns it causes take 1/8 HP a turn instead of 1/16"]],
  Brawl:[["Defiant","Each stat drop on it raises its Power 1 step"],["Last Stand","Once a fight, dropping under 25% HP heals it 30%"]],
  Spark:[["Static Skin","Strike hits on it have a 20% chance to Shock the attacker"],["Lightning Rod","Spark skills aimed at it heal it 25% instead"]],
  Wild:[["Sunbather","Heals 1/16 HP a turn under Sunlit"],["Bloom","Wild skills +50% under a third of its HP"]],
  Frost:[["Insulated","Blaze hits on it count as neutral"],["Permafrost","Frozen targets take 20% more, and its Freeze chances double"]],
  Tide:[["Rain Dancer","Speed +50% under Rain"],["Undertow","The opponent can't switch out while it's above half HP"]],
  Venom:[["Toxic Touch","Its Strike hits have a 20% chance to Poison"],["Corrosion","Its Venom skills hit Steel for normal damage and can Poison it"]],
  Charm:[["Beguile","Drops the opponent's Power 1 step when it switches in"],["Mirror Mind","Copies any stat raise the opponent gets"]],
  Stone:[["Bedrock","Can't be knocked out in one hit from full HP"],["Unbreakable","Its Guard can't be lowered and Crack doesn't affect it"]],
  Light:[["Halo","Heals 1/8 HP when it guards or switches out"],["Sanctuary","No status can land on it while its HP is full"]],
  Steel:[["Plated","Takes 10% less from Strike skills"],["Reflect","A Cast skill it resists bounces 30% of the damage back"]],
  Shade:[["Night-born","Mind +20% under Moonlit, with glowing eyes"],["Haunt","When it's knocked out, the attacker loses a quarter of its max HP"]],
};
const PERSONALITY = [["Bold",1,2],["Calm",4,1],["Hasty",5,4],["Careful",2,5],["Cheerful",3,2],["Gloomy",4,5],["Proud",1,4],["Timid",5,1]];

/* Dark or light text for a coloured chip. */
function textOn(hex){ const h=String(hex).replace("#",""); if(h.length<6) return "#fff"; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return (0.299*r+0.587*g+0.114*b)>150?"#10131c":"#fff"; }
function chipStyle(hex){ const dark=(0.299*parseInt(String(hex).slice(1,3),16)+0.587*parseInt(String(hex).slice(3,5),16)+0.114*parseInt(String(hex).slice(5,7),16))<45; return dark?"--c:#5b4a7e;color:#fff":`--c:${hex};color:${textOn(hex)}`; }
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

/* Family from where the main colour sits in the 3x3 grid. */
function pickFamily(cells){
  let t=0,cx=0,cy=0; cells.forEach((v,i)=>{t+=v;cx+=v*((i%3)+0.5)/3;cy+=v*(Math.floor(i/3)+0.5)/3;});
  if(t<=0) return "Antik";
  cx/=t; cy/=t; let vx=0,vy=0;
  cells.forEach((v,i)=>{vx+=v*(((i%3)+0.5)/3-cx)**2; vy+=v*((Math.floor(i/3)+0.5)/3-cy)**2;});
  vx/=t; vy/=t;
  const band = cy<0.45?"top":cy>0.53?"bottom":"middle";
  const lr=Math.log((vx+1e-6)/(vy+1e-6));
  const shape = lr>0.42?"wide":lr<0.02?"tall":"compact";
  const map = {top:{wide:"Squib",tall:"Booly",compact:"Moko"},middle:{wide:"Skit",tall:"Stilt",compact:"Antik"},bottom:{wide:"Pinch",tall:"Chomp",compact:cx<0.5?"Chomp":"Skit"}};
  return {family:map[band][shape], band, shape};
}

/* Build the 20x20 label grid. Labels: 1 body, 2 parts, 3 eye white, 4 dark (mouth, brow), 5 accent tip, 6 pupil, 7 teeth. */
function buildGrid(famName, parts){
  const F=FAMILY[famName], N=20, G=Array.from({length:N},()=>Array(N).fill(0));
  const [yt,hws]=F.body, yb=yt+hws.length-1, hw=y=>(y>=yt&&y<=yb)?hws[y-yt]:0;
  const set=(x,y,l)=>{if(x>=0&&x<10&&y>=0&&y<N&&(l!==2&&l!==5||G[y][x]===0||G[y][x]===2))G[y][x]=l;};
  const put=(x,y,l)=>{if(x>=0&&x<10&&y>=0&&y<N)G[y][x]=l;};
  for(let y=yt;y<=yb;y++) for(let x=10-hw(y);x<10;x++) G[y][x]=1;
  // legs: each leg is a list of points drawn in parts colour with an accent tip, on the left half only, then mirrored
  const legLine=pts=>pts.forEach(([x,y],i)=>set(x,y,i===pts.length-1?5:2));
  const L=F.legs;
  if(L==="tentacles"){ for(let k=0;k<3;k++){const x0=10-hw(yb)+1+k*2; if(x0>9)break; for(let r=1;r<=5-k%2;r++){const x=x0+((Math.floor(r/2)+k)%2?-1:0); set(x,yb+r,r===5-k%2?5:2);} } }
  if(L==="twolegs"){ for(let r=1;r<=2;r++){set(6,yb+r,2);set(7,yb+r,2);} set(5,yb+3,2);set(6,yb+3,2);set(7,yb+3,2); }
  if(L==="stubby"){ set(5,yb+1,2);set(6,yb+1,2);set(7,yb+1,2);set(5,yb+2,2);set(6,yb+2,2); }
  if(L==="longlegs"){ for(let y=yb+1;y<=18;y++)set(8,y,2); set(7,18,2);set(6,18,5); }
  if(L==="spider"){ // three jointed legs a side: one arching off the shoulder, one off the flank, one under the body
    const rA=yt+2, eA=10-hw(rA), rB=yb-2, eB=10-hw(rB), eC=10-hw(yb);
    legLine([[eA-1,rA],[eA-2,rA-1],[eA-3,rA-1],[eA-4,rA],[eA-4,rA+1]]);
    legLine([[eB-1,rB],[eB-2,rB],[eB-3,rB+1],[eB-3,rB+2],[eB-3,rB+3]]);
    legLine([[eC+1,yb+1],[eC,yb+2],[eC,yb+3],[eC-1,yb+4]]);
  }
  if(L==="ghost"){ const w=hw(yb); for(let x=10-w;x<10;x++){ if((x+1)%3!==0) put(x,yb+1,1); if((x+1)%3===1) put(x,yb+2,1); } }
  // eyes
  const tall=yb-yt>=9, ey=Math.min(yb-3,yt+Math.max(2,Math.floor((yb-yt)*0.32)));
  if(F.eyes==="spider"){ const x=9-Math.min(3,hw(ey)-2); put(x-1,ey,3);put(x,ey,6);put(x-1,ey-1,3);put(x,ey-1,3); put(x-2,ey-2,6); put(x,ey-2,6); }
  else if(F.eyes==="cyclops"){ for(let y=ey-1;y<=ey+1;y++)for(let x=8;x<10;x++)put(x,y,3); put(7,ey,3); put(9,ey,6); put(9,ey+1,6); }
  else{
    const room=Math.min(hw(ey),hw(ey-1)||hw(ey))-2, ex=Math.max(1,Math.min(room,parts.eyes===5?4:3)), x=9-ex;
    switch(parts.eyes){
      case 0: put(x,ey-1,3);put(x,ey,6); break;
      case 1: case 5: put(x-1,ey-1,3);put(x,ey-1,3);put(x-1,ey,3);put(x,ey,6); break;
      case 2: put(x-1,ey,3);put(x,ey,6); break;
      case 3: put(x-1,ey,3);put(x,ey,6);put(x-1,ey-1,6);put(x,ey-1,1); break;
      case 4: put(x,ey-1,3);put(x,ey,6); put(x-1,ey,3); break;
      case 6: put(x-1,ey,3);put(x,ey,6); put(9,ey-2,3); put(9,ey-1,6); break;
    }
  }
  // mouth
  const my=Math.min(yb-1,ey+(tall?3:2)), mouth=F.mouth??parts.mouth;
  switch(mouth){
    case 0: put(9,my,4);put(8,my-1,4); break;
    case 1: put(8,my,4);put(9,my,4);put(8,my+1,7); break;
    case 2: put(9,my,4);put(9,my+1,4); break;
    case 3: { const x0=Math.max(10-hw(my)+1,4); for(let x=x0;x<10;x++){put(x,my,(x-x0)%2?4:7);put(x,my+1,4);} put(x0,my+2,7); break; }
    case 4: put(9,my,4); break;
  }
  // top piece
  const top=F.top??parts.top;
  if(top===1){ const x=Math.min(9,10-Math.max(2,hw(yt)-1)); set(x,yt-1,2);set(x-1,yt-2,2);set(x-1,yt-3,5); }
  if(top===2){ const x=10-hw(yt); set(x,yt-1,2);set(x-1,yt-2,5); }
  if(top===3){ for(let x=10-hw(yt);x<10;x+=2) set(x,yt-1,5); }
  if(top===4){ set(9,yt-1,2);set(9,yt-2,2);set(8,yt-3,5); }
  // arms
  const arms=F.arms??parts.arms, ay=Math.min(yb-1,Math.floor((yt+yb)/2)+1), ax=10-hw(ay)-1;
  const armPts=[], under={};
  const arm=(x,y,l)=>{ if(x<0||x>=10||y<0||y>=N) return; under[x+","+y]=G[y][x]; set(x,y,l); if(G[y][x]===l) armPts.push([x,y]); };
  if(arms===1||arms===4){ arm(ax,ay,2);arm(ax-1,ay-1,2);arm(ax-1,ay-2,5); }
  if(arms===2){ arm(ax,ay,2);arm(ax-1,ay+1,2);arm(ax-1,ay+2,5); }
  if(arms===3){ arm(ax,ay,2);arm(ax-1,ay-1,2);arm(ax-2,ay-2,5);arm(ax-1,ay-3,5); }
  // mirror
  for(let y=0;y<N;y++) for(let x=0;x<10;x++) G[y][19-x]=G[y][x];
  if(arms===4){ // wave: only the right arm's own pixels go, then it hangs down instead, so legs and top pieces are never touched
    for(const [x,y] of armPts) G[y][19-x]=under[x+","+y]||0;
    const bx=19-ax, put2=(x,y,l)=>{ if(x<N&&y<N&&(G[y][x]===0||G[y][x]===2)) G[y][x]=l; };
    put2(bx,ay,2); put2(bx+1,ay+1,2); put2(bx+1,ay+2,5);
  }
  return G;
}

/* Scale2x on the label grid, used for the Byte preview. */
function scale2x(G){
  const H=G.length,W=G[0].length,O=Array.from({length:H*2},()=>Array(W*2).fill(0));
  const at=(x,y)=>G[Math.max(0,Math.min(H-1,y))][Math.max(0,Math.min(W-1,x))];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const P=at(x,y),A=at(x,y-1),B=at(x+1,y),C=at(x-1,y),D=at(x,y+1);
    let e0=P,e1=P,e2=P,e3=P;
    const eye=l=>l===3||l===6;
    if(eye(P)||eye(A)||eye(B)||eye(C)||eye(D)){O[2*y][2*x]=O[2*y][2*x+1]=O[2*y+1][2*x]=O[2*y+1][2*x+1]=P;continue;}
    if(C===A&&C!==D&&A!==B)e0=A; if(A===B&&A!==C&&B!==D)e1=B; if(D===C&&D!==B&&C!==A)e2=C; if(B===D&&B!==A&&D!==C)e3=D;
    O[2*y][2*x]=e0;O[2*y][2*x+1]=e1;O[2*y+1][2*x]=e2;O[2*y+1][2*x+1]=e3;
  }
  return O;
}

function rgbToHsv([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;
  if(d){if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;} return [h*60,mx?d/mx:0,mx];}
function hsvToRgb([h,s,v]){const f=n=>{const k=(n+h/60)%6;return Math.round(255*(v-v*s*Math.max(0,Math.min(k,4-k,1))));};return [f(5),f(3),f(1)];}
function tone(rgb,dv,ds=0){const [h,s,v]=rgbToHsv(rgb);return hsvToRgb([h,Math.max(0,Math.min(1,s+ds)),Math.max(0,Math.min(1,v+dv))]);}
function vivid(rgb,group){
  let [h,s,v]=rgbToHsv(rgb);
  if(group==="white"){s=Math.min(s,0.08);v=Math.max(v,0.9);}
  else if(group==="silver"){s=Math.min(s,0.1);v=Math.min(Math.max(v,0.62),0.78);}
  else if(group==="black"){s=Math.min(s,0.25);v=0.22;}
  else {s=Math.max(s,0.45);v=Math.min(Math.max(v,0.55),0.95);}
  return hsvToRgb([h,s,v]);
}
const css=c=>`rgb(${c[0]},${c[1]},${c[2]})`;

function paint(canvas,G,pal,scale){
  const H=G.length,W=G[0].length; canvas.width=W*scale; canvas.height=H*scale;
  const x=canvas.getContext("2d"); x.imageSmoothingEnabled=false; x.clearRect(0,0,canvas.width,canvas.height);
  const filled=(i,j)=>j>=0&&j<H&&i>=0&&i<W&&G[j][i]!==0;
  const dot=(i,j,c)=>{x.fillStyle=css(c);x.fillRect(i*scale,j*scale,scale,scale);};
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){
    const l=G[j][i];
    if(!l){ if(filled(i-1,j)||filled(i+1,j)||filled(i,j-1)||filled(i,j+1)) dot(i,j,pal.outline); continue; }
    let c={1:pal.body,2:pal.parts,3:pal.eye,4:pal.dark,5:pal.accent,6:pal.pupil,7:pal.eye,8:tone(pal.body,0.22,-0.15),10:[240,228,196],11:[255,214,74],12:tone(pal.body,0.32,-0.2)}[l]||pal.body;
    if(l===1||l===2||l===12){ if(!filled(i,j-1)) c=tone(c,0.12,-0.05); else if(!filled(i,j+1)||(W>20&&!filled(i,j+2))) c=tone(c,-0.16,0.05); }
    dot(i,j,c);
    if(W>20&&l===6&&G[j-1]&&G[j-1][i]!==6&&G[j][i-1]!==6) dot(i,j,pal.glint);
  }
}


/* Names: a mono monster is its element prefix + family; a dual monster is the pair's combo word + family. */
const PREFIX={Blaze:"Pyro",Brawl:"Kara",Spark:"Volt",Wild:"Fern",Frost:"Cryo",Tide:"Aqua",Venom:"Toxi",Charm:"Pixi",Stone:"Geo",Light:"Lumi",Steel:"Iron",Shade:"Dusk",Void:"Nyx"};
const COMBO={"Blaze|Brawl":"Fury","Blaze|Spark":"Flash","Blaze|Wild":"Ash","Blaze|Frost":"Thaw","Blaze|Tide":"Steam","Blaze|Venom":"Smog","Blaze|Charm":"Blush","Blaze|Stone":"Lava","Blaze|Light":"Sol","Blaze|Steel":"Forge","Blaze|Shade":"Coal","Brawl|Spark":"Jolt","Brawl|Wild":"Feral","Brawl|Frost":"Yeti","Brawl|Tide":"Rip","Brawl|Venom":"Sting","Brawl|Charm":"Hero","Brawl|Stone":"Brick","Brawl|Light":"Valor","Brawl|Steel":"Brass","Brawl|Shade":"Ninja","Spark|Wild":"Buzz","Frost|Spark":"Sleet","Spark|Tide":"Storm","Spark|Venom":"Acid","Charm|Spark":"Crush","Spark|Stone":"Flint","Light|Spark":"Neon","Spark|Steel":"Robo","Shade|Spark":"Glitch","Frost|Wild":"Pine","Tide|Wild":"Bog","Venom|Wild":"Thorn","Charm|Wild":"Bloom","Stone|Wild":"Moss","Light|Wild":"Glade","Steel|Wild":"Shear","Shade|Wild":"Shroom","Frost|Tide":"Floe","Frost|Venom":"Bite","Charm|Frost":"Flurry","Frost|Stone":"Berg","Frost|Light":"Aura","Frost|Steel":"Skate","Frost|Shade":"Chill","Tide|Venom":"Jelly","Charm|Tide":"Siren","Stone|Tide":"Reef","Light|Tide":"Pearl","Steel|Tide":"Rust","Shade|Tide":"Deep","Charm|Venom":"Potion","Stone|Venom":"Tar","Light|Venom":"Rad","Steel|Venom":"Lead","Shade|Venom":"Blight","Charm|Stone":"Gem","Charm|Light":"Fae","Charm|Steel":"Locket","Charm|Shade":"Vamp","Light|Stone":"Opal","Steel|Stone":"Ore","Shade|Stone":"Crypt","Light|Steel":"Chrome","Light|Shade":"Moon","Shade|Steel":"Grim"};
function speciesName(family,el1,el2){
  let pre=el2?COMBO[[el1,el2].sort().join("|")]:PREFIX[el1], body=family.toLowerCase();
  if(/^[aeiou]/.test(body)&&/[aeiou]$/.test(pre)){pre=pre.slice(0,-1); if(pre.slice(-1)===body[0]) pre=pre.slice(0,-1);}
  return pre+body;
}

/* Main entry: res is the scan result with colours, cells and photo numbers. */
function hatch(res,now=new Date(),ov={}){
  const el1=EL[res.main.g], el2=res.second?EL[res.second.g]:null;
  const pf=pickFamily(res.cells), family=ov.family||pf.family, band=pf.band, shape=pf.shape;
  const F=FAMILY[family];
  const sat=res.sat, con=res.contrast, bri=res.bright;
  const parts={
    eyes: Math.floor(((rgbToHsv((res.second||res.ranked[1]||res.main).rgb)[0])/360)*7)%7,
    mouth: Math.max(0,Math.min(4,Math.floor((con-0.08)/0.05))),
    top: Math.floor(sat*10)%5,
    arms: Math.floor(bri*10)%5,
  };
  if(ov.parts) Object.assign(parts,ov.parts(parts));
  const seed=hashStr(res.photoKey+"|"+Math.floor(now.getTime()/60000));
  const R=rng(seed);
  // colours
  const third=res.ranked.find(r=>r!==res.main&&r!==res.second&&r!==(res.mono?res.ranked[1]:null));
  const body=vivid(res.main.rgb,res.main.g);
  const parts2=res.second?vivid(res.second.rgb,res.second.g):tone(body,-0.22,0.05);
  const accent=third?vivid(third.rgb,third.g):tone(body,0.25,-0.1);
  const dark=res.main.g==="black";
  const pal={body,parts:parts2,accent,eye:[244,244,240],pupil:dark?[255,214,74]:[22,20,28],dark:dark?[8,8,12]:tone(body,-0.45),outline:dark?[2,2,6]:(()=>{const [h,s2,v]=rgbToHsv(body);return hsvToRgb([h,Math.min(1,s2+0.2),Math.min(0.2,v*0.3)]);})(),glint:[255,255,255]};
  const grid=buildGrid(family,parts);
  // stats
  const lean=(F.base).slice();
  const mag=res.mono?15:10;
  lean[LEAN[el1][0]]+=mag; lean[LEAN[el1][1]]-=mag;
  if(el2){lean[LEAN[el2][0]]+=5; lean[LEAN[el2][1]]-=5;}
  const talent=STATS.map(()=>Math.floor(R()*16));
  const pers=PERSONALITY[Math.floor(R()*PERSONALITY.length)];
  const mult=STATS.map(()=>1);
  if(sat>0.4){mult[1]*=1.1;mult[2]*=0.9;}else{mult[2]*=1.1;mult[1]*=0.9;}
  if(con>0.2){mult[5]*=1.1;mult[0]*=0.9;}else{mult[0]*=1.1;mult[5]*=0.9;}
  mult[pers[1]]*=1.1; mult[pers[2]]*=0.9;
  const stats=lean.map((b,i)=>Math.round((b+talent[i])*mult[i]));
  // ability
  let hiddenChance=(res.mono?0.12:0.03)*(bri<0.3?2:1);
  const hidden=R()<hiddenChance;
  const ability=hidden?EL_ABILITY[el1][1]:(R()<0.5?F.ability:EL_ABILITY[el1][0]);
  const pool=buildPool(el1,el2,res.pool), skills=pool.slice(0,2);
  const lifespan=Math.round(15+10*bri); // months
  return {pool,name:speciesName(family,el1,el2),family,band,shape,el1,el2,mono:res.mono,parts,grid,pal,stats,talent,pers,ability,hidden,hiddenChance,skills,lifespan};
}
