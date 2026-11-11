/* Heavy drill scenes. Each one swaps the yard for its own place, set by RS.bg, and uses its own props. Needs ranch.js. */
function drawBg(c,t){
  const s=RS, bg=s.bg, off=s.bgOff||0;
  const sky=bg==="library"?["#3a2a22","#3a2a22","#3a2a22"]:bg==="quarry"?["#9fb6c8","#b9cbd8","#d3dee6"]:["#6fbbef","#97d0f5","#c4e7ff"];
  for(let i=0;i<3;i++){ c.fillStyle=sky[i]; c.fillRect(0,i*30,RW,i===2?100:30); }
  if(bg==="road"){
    c.fillStyle="#4f9a45"; for(let x=0;x<RW;x++){ const y=Math.round(100+Math.sin((x+off*0.4)/23)*8+Math.sin((x+off*0.4)/9)*3); c.fillRect(x,y,1,GROUND-y); }
    c.fillStyle="#78c556"; c.fillRect(0,GROUND-14,RW,RH);
    c.fillStyle="#c9a66b"; c.fillRect(0,GROUND-6,RW,10);
    c.fillStyle="#fff"; for(let x=-((off*1.2)%30);x<RW;x+=30) c.fillRect(Math.round(x),GROUND+1,12,1);
  }
  if(bg==="quarry"){
    c.fillStyle="#8d8378"; for(let x=0;x<RW;x++){ const y=Math.round(60+Math.abs(Math.sin(x/17))*25); c.fillRect(x,y,1,GROUND-y); }
    c.fillStyle="#a99d8f"; for(let i=0;i<14;i++) c.fillRect((i*37)%RW,70+(i*19)%60,10,4);
    c.fillStyle="#b8ab97"; c.fillRect(0,GROUND-14,RW,RH);
  }
  if(bg==="gate"){
    c.fillStyle="#78c556"; c.fillRect(0,GROUND-14,RW,RH);
    c.fillStyle="#7b5a3a"; c.fillRect(150,30,80,GROUND-30); c.fillStyle="#5e4129"; for(let x=150;x<230;x+=10) c.fillRect(x,30,1,GROUND-30);
    c.fillStyle="#3b2a1c"; c.fillRect(176,90,28,GROUND-90);
    c.fillStyle="#555"; c.fillRect(100,18,140,4);
  }
  if(bg==="library"){
    for(let y=10;y<GROUND-10;y+=24){ c.fillStyle="#5a3b28"; c.fillRect(0,y+20,RW,3);
      for(let x=4;x<RW;x+=7){ c.fillStyle=["#b8463b","#3b6fb8","#3f8f4a","#c9a33b","#7a4fb0"][(x+y)%5]; c.fillRect(x,y+4+((x*7)%5),5,16-((x*7)%5)); } }
    c.fillStyle="#6b4a35"; c.fillRect(0,GROUND-14,RW,RH);
  }
  if(bg==="shrine"){
    c.fillStyle="#6f7d86"; c.fillRect(0,20,RW,GROUND-20);
    const wx=Math.round(s.x)-18, gap=s.parted?14:0;
    c.fillStyle="#8fd3ff"; c.fillRect(wx,0,36,GROUND-4);
    if(gap){ c.fillStyle="#6f7d86"; c.fillRect(wx+18-gap/2,0,gap,GROUND-4); }
    c.fillStyle="#cfeeff"; for(let i=0;i<12;i++){ const y=(t/6+i*13)%GROUND; c.fillRect(wx+(i*7)%36,Math.round(y),1,4); }
    c.fillStyle="#4aa3d8"; c.fillRect(0,GROUND-6,RW,RH); c.fillStyle="#b0e0ff"; for(let x=(t/20)%10;x<RW;x+=10) c.fillRect(Math.round(x),GROUND-4,4,1);
  }
  if(bg==="course"){
    c.fillStyle="#78c556"; c.fillRect(0,GROUND-14,RW,RH);
    c.fillStyle="#b88b5a"; c.fillRect(0,GROUND-30,RW,2);
    c.fillStyle="#6b4428"; c.fillRect(150,20,3,50); c.fillRect(150,20,40,3);
  }
}
function drawProp2(c,p,t,front){
  const X=Math.round(p.x), Y=Math.round(p.y);
  if(p.k==="ribbon"){ if(!front) return true; c.fillStyle="#666"; c.fillRect(X-1,Y-30,2,30); c.fillRect(X+26,Y-30,2,30); if(!p.broken){ c.fillStyle="#e2483f"; c.fillRect(X,Y-22,27,2);} else { c.fillStyle="#e2483f"; c.fillRect(X,Y-22,4,6); c.fillRect(X+23,Y-22,4,6);} return true; }
  if(p.k==="rock"){ if(front) return true; const r=p.r; for(let j=-r;j<=r;j++){ const w=Math.round(Math.sqrt(r*r-j*j)*(p.half?0.5:1)); c.fillStyle=j<-r/3?"#a8a29a":"#7f7a73"; c.fillRect(X-w,Y-r+j,w*2,1);} return true; }
  if(p.k==="log"){ if(!front) return true; const a=Math.sin(p.t||0)*0.9; const ax=150+Math.round(Math.sin(a)*60), ay=22+Math.round(Math.cos(a)*60);
    c.strokeStyle="#555"; c.fillStyle="#555"; for(let k=0;k<20;k++){ c.fillRect(Math.round(150+(ax-150)*k/20),Math.round(22+(ay-22)*k/20),1,1);} c.fillStyle=p.broken?"#a0663b":"#8a5532"; c.fillRect(ax-(p.broken?4:12),ay-4,p.broken?8:24,8); p.ax=ax; return true; }
  if(p.k==="books"){ if(!front) return true; for(let k=0;k<p.n;k++){ c.fillStyle=["#b8463b","#3b6fb8","#3f8f4a","#c9a33b"][k%4]; c.fillRect(X-7+(k%2),Y-4-k*4+(p.fall?k*k*0.7:0),14,4);} return true; }
  if(p.k==="hurdle"){ if(front) return true; c.fillStyle="#fff"; c.fillRect(X-8,Y-14,16,3); c.fillStyle="#999"; c.fillRect(X-8,Y-14,2,14); c.fillRect(X+6,Y-14,2,14); return true; }
  if(p.k==="rope"){ if(!front) return true; const a=Math.sin(t/300)*0.6, ex=170+Math.round(Math.sin(a)*50), ey=23+Math.round(Math.cos(a)*50);
    c.fillStyle="#c9a66b"; for(let k=0;k<25;k++) c.fillRect(Math.round(170+(ex-170)*k/25),Math.round(23+(ey-23)*k/25),1,1); return true; }
  return false;
}
const HEAVY_FN=[
  async r=>{ // Marathon
    const s=RS; s.bg="road"; s.x=110; s.pose="run";
    for(let k=0;k<70;k++){ s.bgOff=(s.bgOff||0)+3; if(k%4===0) spark(s.x-10,GROUND-1,"dust"); if(k%9===0) spark(s.x,headY()+2,"sweat"); await rwait(30); }
    if(r==="fail"){ s.pose="tired"; await rwait(500); s.upside=true; s.pose="sleep"; await rwait(900); s.upside=false; banner("The assistant carries it home","#ffffff"); await rwait(900); banner(""); return; }
    if(r==="great"){ const rb=prop({k:"ribbon",x:RW+10,y:GROUND}); while(rb.x>s.x-10){ rb.x-=2.5; s.bgOff+=3; await rwait(25);} rb.broken=true; s.pose="happy"; await hop(18,420); await rwait(500); return; }
    s.pose="tired"; spark(s.x,headY(),"sweat",4); await rwait(900);
  },
  async r=>{ // Quarry
    const s=RS; s.bg="quarry"; s.x=90; const rock=prop({k:"rock",x:150,y:GROUND,r:16});
    for(let k=0;k<3;k++){ await walkTo(118-RS.P.scale*3,90,"run"); s.flash=4; s.shake=6; spark(150-14,GROUND-14,"dust",4); s.x-=8; await rwait(260);
      if(r==="fail"&&k===2){ s.pose="dizzy"; spark(s.x,headY()-4,"star",5); await rwait(1400); return; } await walkTo(90,60,"walk"); }
    if(r==="great"){ rock.half=true; const h2=prop({k:"rock",x:150,y:GROUND,r:16,half:true}); rock.vx=-1.2; h2.vx=1.4; s.shake=12; spark(150,GROUND-16,"dust",12); s.pose="happy"; await hop(16,420); await rwait(600); return; }
    s.pose="tired"; await rwait(800);
  },
  async r=>{ // Fortress
    const s=RS; s.bg="gate"; s.x=150; s.pose="guard"; const log=prop({k:"log",x:0,y:0,t:-1.2});
    for(let k=0;k<3;k++){ for(let j=0;j<24;j++){ log.t+=0.1; await rwait(25);} s.flash=4; s.shake=6; spark(s.x-16,headY()+8,"dust",4);
      if(r==="fail"&&k===1){ s.upside=true; s.pose="walk"; await rwait(1200); s.upside=false; s.pose="dizzy"; await rwait(500); return; }
      if(r==="great"&&k===2){ log.broken=true; spark(s.x-20,headY()+8,"sparkle",8); s.pose="happy"; await rwait(900); return; }
      for(let j=0;j<24;j++){ log.t-=0.1; await rwait(25);} }
    s.pose="idle"; await rwait(500);
  },
  async r=>{ // Library
    const s=RS; s.bg="library"; s.x=110; s.pose="sit"; const bk=prop({k:"books",x:150,y:GROUND,n:1});
    for(let k=0;k<(r==="great"?8:5);k++){ spark(s.x+rnd(-6,6),headY()-4,k%3?"sparkle":"q"); bk.n++; await rwait(320); }
    if(r==="fail"){ bk.fall=true; bk.x=s.x+4; s.pose="hurt"; await rwait(900); s.pose="dizzy"; await rwait(700); return; }
    if(r==="great") spark(s.x,headY()-10,"bulb");
    s.pose="happy"; await rwait(900);
  },
  async r=>{ // Shrine
    const s=RS; s.bg="shrine"; s.x=130; s.pose="sit";
    for(let k=0;k<12;k++){ spark(s.x+rnd(-12,12),headY()+rnd(0,10),"drip"); await rwait(130); }
    if(r==="fail"){ s.pose="hurt"; await walkTo(RW+40,120,"walk"); await rwait(500); s.x=-40; await walkTo(130,70,"walk"); s.pose="tired"; await rwait(500); return; }
    if(r==="great"){ s.parted=true; s.pose="float"; for(let k=0;k<12;k++){ spark(s.x+rnd(-12,12),headY()+rnd(0,20),"sparkle"); await rwait(110);} s.parted=false; return; }
    s.pose="idle"; await rwait(500);
  },
  async r=>{ // Obstacle course
    const s=RS; s.bg="course"; s.x=20; prop({k:"rope"}); const hs=[70,120,210].map(x=>prop({k:"hurdle",x,y:GROUND}));
    for(let k=0;k<hs.length;k++){ await walkTo(hs[k].x-RS.P.scale*7,90,"run");
      if(r==="fail"&&k===1){ s.x=hs[k].x; s.jy=10; s.pose="hurt"; await rwait(1300); s.jy=0; s.pose="dizzy"; await rwait(500); return; }
      s.pose="walk"; await hop(24,380); s.x=hs[k].x+RS.P.scale*4; }
    await walkTo(226,90,"run");
    if(r==="great"){ s.pose="happy"; for(let k=0;k<6;k++){ s.dir*=-1; s.bx=s.dir; await rwait(110);} s.bx=0; await hop(14,380); return; }
    s.pose="tired"; await rwait(600);
  },
];
