/* Family moves past the signature (16 Nov 2026), Chomp first. Each plays after its tier's wind-up: a Basic or Hit move only
   rears back, a Heavy, Sharp or Withering move gathers its colour, and a Special winds up in the family's style at a smaller size.
   Same rules as arena-sigs.js: C is the frame it lands, and everything settles by C+700. Needs arena-sigs.js (SG). */
const MV={};
/* a spinning tooth */
MV.tooth=(c,x,y,z,rot,a=1)=>{ c.save(); c.globalAlpha*=a; c.translate(x,y); c.rotate(rot); c.fillStyle="#fffdf4"; c.strokeStyle="rgba(120,96,90,.9)"; c.lineWidth=1.4;
  c.beginPath(); c.moveTo(-z*0.6,-z*0.5); c.quadraticCurveTo(0,-z*0.85,z*0.6,-z*0.5); c.lineTo(z*0.45,z*0.2); c.lineTo(z*0.15,z*0.9); c.lineTo(0,z*0.35); c.lineTo(-z*0.15,z*0.9); c.lineTo(-z*0.45,z*0.2); c.closePath(); c.fill(); c.stroke();
  c.fillStyle="rgba(255,255,255,.9)"; c.beginPath(); c.ellipse(-z*0.25,-z*0.35,z*0.14,z*0.1,0,0,7); c.fill(); c.restore(); };
/* speed lines trailing behind a body moving in direction d */
MV.lines=(c,x,y,R,d,n,a)=>{ if(a<=0) return; c.strokeStyle=`rgba(255,255,255,${0.55*a})`; c.lineWidth=2; c.lineCap="round"; for(let i=0;i<n;i++){ const yy=y+(i-(n-1)/2)*R*0.32, L=R*(0.8+0.6*atH(i*7)); c.beginPath(); c.moveTo(x-d*R*0.9,yy); c.lineTo(x-d*(R*0.9+L),yy); c.stroke(); } };
/* a little bite mark that snaps shut on a point */
MV.nip=(c,x,y,z,k,col)=>{ if(k<0||k>1) return; const open=k<0.35?1-k/0.35:0, a=k<0.7?1:1-(k-0.7)/0.3; SG.jaws(c,x,y,z,open*0.6+0.05,col,a); };
/* the rotation for a body rolling along the floor on its rim instead of its feet (rotation pivots at the feet) */
MV.roll=(th,h=26)=>({rot:th,arc:-h*(1-Math.cos(th)),off:[-h*Math.sin(th),0]});
const mvCol=x=>(x.col||[240,200,90]).map(v=>Math.min(255,Math.round(v*0.55+110)));

Object.assign(ANIM,{
  /* Nibble: two quick hops in, a small snap on each */
  nibble:{C:300,D:860,contact:true,marks:true,
    atk:t=>{ if(t<300) return {f:0.72*eo(t/300),arc:-14*Math.sin(t/300*Math.PI),pose:t<120?"crouch":"bitewide"};
      if(t<440) return {f:0.72+0.06*Math.sin((t-300)/140*Math.PI),arc:-8*Math.sin((t-300)/140*Math.PI),pose:t<370?"chomp":"bitewide"};
      const k=(t-440)/420; return {f:0.78*(1-eio(k)),arc:-12*Math.sin(Math.min(1,k)*Math.PI),pose:k<0.2?"chomp":"idle"}; },
    def:t=>t>=300&&t<560?{off:[Math.sin(t/16)*2.5,0],pose:"hit"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r, col=mvCol(x); MV.nip(c,tg.x-R*0.2,tg.y-R*0.15,R*0.45,(t-250)/260,col); MV.nip(c,tg.x+R*0.25,tg.y+R*0.1,R*0.45,(t-390)/260,col); }},
  /* Rolling Bite: it tucks into a ball, rolls in and opens into a bite */
  rollbite:{C:460,D:1100,contact:true,marks:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<120){ const k=eo(t/120); return {sx:1+0.08*k,sy:1-0.16*k,pose:"crouch"}; }
      if(t<460){ const k=(t-120)/340, th=d*Math.PI*2*ei(k); return {f:0.74*eo(k),...MV.roll(th),sx:0.92,sy:0.86,pose:"crouch"}; }
      if(t<600) return {f:0.76,pose:"chomp",sx:1.08,sy:0.94};
      const k=(t-600)/500; return {f:0.76*(1-eio(k)),arc:-16*Math.sin(Math.min(1,k)*Math.PI),pose:"idle"}; },
    def:t=>SG.knock(t,460,1,14,360),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t>120&&t<480){ const k=(t-120)/340; for(let i=0;i<4;i++){ const ph=((t/130)+i/4)%1; SG.puff(c,s.x-d*s.r*(0.4+ph),s.foot-ph*s.r*0.3,s.r*(0.1+0.16*ph),(1-ph)*0.6*Math.min(1,k*3),[226,212,190]); } MV.lines(c,s.x,s.y,s.r,d,3,k); }
      if(t>400&&t<700) MV.nip(c,tg.x,tg.y-R*0.05,R*0.8,(t-400)/300,mvCol(x)); atImpact(t,460,0.35,0); }},
  /* Tooth Shot: it rears back and spits one of its teeth, which spins across and bounces off the target */
  toothshot:{C:520,D:1100,
    atk:t=>t<200?{sx:1+0.06*eo(t/200),sy:1-0.1*eo(t/200),pose:"bitewide"}:t<300?{f:0.05,pose:"chomp",sy:1.06}:{f:0.05*(1-eo((t-300)/300)),pose:t<700?"bitewide":"idle"},
    def:t=>SG.knock(t,520,1,10,300),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), a={x:s.x+d*s.r*0.6,y:s.y-s.r*0.1}, b={x:tg.x-d*R*0.3,y:tg.y-R*0.1};
      if(t>=220&&t<520){ const k=(t-220)/300, p=lerpP(a,b,eo(k),R*0.7); MV.tooth(c,p.x,p.y,R*0.22,t/40*d); for(let i=1;i<4;i++){ const q=lerpP(a,b,Math.max(0,eo(k)-i*0.06),R*0.7); SG.puff(c,q.x,q.y,R*0.06*(4-i),0.35); } }
      if(t>=520&&t<1000){ const k=(t-520)/480; MV.tooth(c,b.x-d*R*0.9*k,b.y-R*1.2*Math.sin(k*Math.PI)+k*R*1.0,R*0.2,t/60,1-k*0.6); atStar4(c,b.x,b.y,R*0.5*(1-k),"rgba(255,255,240,.95)"); }
      atImpact(t,520,0.2,0); }},
  /* Chatter: its teeth chatter so fast the air shakes, and rings of noise roll out and shove the target back */
  chatter:{C:420,D:1060,
    atk:t=>({sx:1+0.05*Math.sin(t/14)*(t<800?1:0),sy:1-0.05*Math.sin(t/14)*(t<800?1:0),off:[Math.sin(t/9)*2*(t<800?1:0),0],pose:t<800?(Math.floor(t/45)%2?"chomp":"bitewide"):"idle"}),
    def:t=>{ const a=SG.knock(t,420,1,30,520); if(a) a.off[1]=Math.sin(t/11)*2; return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), mx=s.x+d*s.r*0.7;
      for(let i=0;i<5;i++){ const k=(t-60-i*110)/520; if(k<0||k>1) continue; const px=mx+(tg.x-mx)*eo(k), rr=s.r*(0.35+0.7*k);
        c.strokeStyle=`rgba(255,250,235,${0.85*(1-k)})`; c.lineWidth=3; c.beginPath(); for(let j=0;j<=12;j++){ const q=-0.9+j/12*1.8, w=j%2?0.88:1; c.lineTo(px+d*Math.cos(q)*rr*0.5*w,s.y+Math.sin(q)*rr*w); } c.stroke(); }
      if(t>200&&t<800) for(let i=0;i<3;i++){ const ph=((t/90)+i/3)%1; atStar4(c,mx+d*s.r*0.2*ph,s.y-s.r*(0.5+0.4*ph),s.r*0.12*(1-ph),"rgba(255,255,255,.9)"); }
      atImpact(t,420,0.25,0); }},
  /* Body Slam: a big jump and it lands its whole weight on the target */
  bodyslam:{C:560,D:1220,contact:true,marks:true,
    atk:t=>{ if(t<180){ const k=eo(t/180); return {sx:1+0.14*k,sy:1-0.22*k,pose:"crouch"}; }
      if(t<560){ const k=(t-180)/380; return {f:0.7*eio(k),arc:-70*Math.sin(k*Math.PI*0.92)-6,sx:1-0.08*Math.sin(k*Math.PI),sy:1+0.12*Math.sin(k*Math.PI),pose:"jump"}; }
      if(t<760){ const k=(t-560)/200; return {f:0.7,arc:-6*(1-k),sx:1+0.24*(1-eo(k)),sy:1-0.2*(1-eo(k)),pose:"tackle"}; }
      const k=(t-760)/460; return {f:0.7*(1-eio(k)),arc:-20*Math.sin(Math.min(1,k)*Math.PI),pose:"idle"}; },
    def:t=>SG.squash(t,560,0.42,560),
    fx(c,t,x){ const tg=x.target, R=tg.r; atImpact(t,560,0.6,0.15); if(t>=560){ const k=(t-560)/640; SG.dust(c,tg.x,tg.foot,R*1.2,k,10); SG.cracks(c,tg.x,tg.foot,R*1.4,6,2,1-k); atPow(c,{x:tg.x,y:tg.y-R*0.9},Math.min(1,k*1.4),R/24); } }},
  /* Big Gulp: it opens wide and sucks in a stream of the target's focus, then swallows with a gulp */
  biggulp:{C:560,D:1220,
    atk:t=>t<760?{sx:1+0.1*eo(Math.min(1,t/300)),sy:1-0.04*Math.sin(t/40),pose:"bitewide",off:[Math.sin(t/30)*1.2,0]}:t<900?{sy:1+0.12*Math.sin((t-760)/140*Math.PI),sx:1-0.06*Math.sin((t-760)/140*Math.PI),pose:"chomp"}:{pose:"happy"},
    def:t=>t>=200&&t<800?{off:[-Math.sin(t/20)*3,0],sx:1-0.05*Math.sin(t/30),pose:"hurt"}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), mouth={x:s.x+d*s.r*0.65,y:s.y-s.r*0.05};
      if(t>120&&t<820){ const on=Math.min(1,(t-120)/200)*(t>700?1-(t-700)/120:1);
        c.strokeStyle=`rgba(200,230,255,${0.35*on})`; c.lineWidth=2; for(let i=0;i<5;i++){ const ph=((t/260)+i/5)%1, yy=(i-2)*R*0.22; c.beginPath(); c.moveTo(tg.x+(mouth.x-tg.x)*ph,tg.y+yy*(1-ph)); c.lineTo(tg.x+(mouth.x-tg.x)*Math.min(1,ph+0.15),tg.y+yy*(1-ph-0.15)); c.stroke(); }
        for(let i=0;i<9;i++){ const ph=((t/420)+i/9)%1, p=lerpP({x:tg.x,y:tg.y+(atH(i)-0.5)*R},mouth,ei(ph),(atH(i*3)-0.5)*R*0.8); atGlowA(c,p.x,p.y,R*0.18*(1-ph*0.5),[140,200,255],0.8*on); c.fillStyle=`rgba(235,248,255,${on})`; c.beginPath(); c.arc(p.x,p.y,R*0.05,0,7); c.fill(); } }
      if(t>760&&t<1000){ const k=(t-760)/240; SG.ring(c,s.x,s.y,s.r*(0.6+0.5*k),s.r*(0.5+0.4*k),[160,210,255],3,1-k); } }},
  /* Drool: a big glob of drool lobbed high, which lands on the target with a splat and drips */
  drool:{C:620,D:1300,
    atk:t=>t<220?{sx:1-0.04*eo(t/220),sy:1+0.06*eo(t/220),pose:"bitewide",arc:-4*eo(t/220)}:t<320?{pose:"chomp",sy:0.94}:{pose:t<800?"happy":"idle"},
    def:t=>{ if(t<620||t>1300) return null; const a=1-(t-620)/680; return {sy:1-0.1*a,sx:1+0.06*a,pose:"hurt",off:[Math.sin(t/20)*2*a,0]}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), a={x:s.x+d*s.r*0.6,y:s.y}, b={x:tg.x,y:tg.y-R*0.4}, G=[176,112,226];
      if(t>=150&&t<300){ const k=(t-150)/150; c.fillStyle=atRgba(G,0.9); c.beginPath(); c.ellipse(a.x,a.y+k*s.r*0.2,s.r*0.1,s.r*(0.1+0.25*k),0,0,7); c.fill(); }
      if(t>=300&&t<620){ const k=(t-300)/320, p=lerpP(a,b,k,R*2.4), w=R*0.32; c.fillStyle=atRgba(G,0.95); c.beginPath(); c.ellipse(p.x,p.y,w*(1+0.15*Math.sin(t/30)),w*(1-0.12*Math.sin(t/30)),0,0,7); c.fill();
        c.fillStyle="rgba(255,240,255,.6)"; c.beginPath(); c.arc(p.x-w*0.3,p.y-w*0.3,w*0.25,0,7); c.fill(); const q=lerpP(a,b,Math.max(0,k-0.1),R*2.4); c.strokeStyle=atRgba(G,0.6); c.lineWidth=w*0.4; c.beginPath(); c.moveTo(q.x,q.y); c.lineTo(p.x,p.y); c.stroke(); }
      if(t>=620){ const k=(t-620)/680; SG.splat(c,tg.x,tg.y-R*0.45,R*(0.7+0.15*eo(k)),3,G,1-ei(k),0.7);
        for(let i=0;i<4;i++){ const dx=(i-1.5)*R*0.35, L=R*(0.2+0.8*eo(k))*(0.6+0.5*atH(i)); c.fillStyle=atRgba(G,0.9*(1-ei(k))); c.fillRect(tg.x+dx-2.5,tg.y-R*0.4,5,L); c.beginPath(); c.arc(tg.x+dx,tg.y-R*0.4+L,3.5,0,7); c.fill(); }
        for(let i=0;i<3;i++){ const ph=((t/300)+i/3)%1; atBubble(c,tg.x+(i-1)*R*0.5,tg.y-R*(0.6+0.8*ph),R*0.08,1-ph); } }
      atImpact(t,620,0.2,0); }},
  /* Belly Flop: a high jump and it comes down flat on its belly */
  bellyflop:{C:600,D:1260,contact:true,marks:true,
    atk:t=>{ if(t<160) return {sx:1+0.1*eo(t/160),sy:1-0.18*eo(t/160),pose:"crouch"};
      if(t<600){ const k=(t-160)/440, flat=eo(Math.max(0,(k-0.45)/0.55)); return {f:0.68*eio(k),arc:-95*Math.sin(k*Math.PI*0.95),sx:1+0.35*flat,sy:1-0.3*flat,pose:k<0.5?"jump":"tackle"}; }
      if(t<780){ const k=(t-600)/180; return {f:0.68,sx:1.42-0.1*k,sy:0.62+0.08*k,pose:"tackle"}; }
      const k=(t-780)/480; return {f:0.68*(1-eio(k)),sx:1.32-0.32*eo(k),sy:0.7+0.3*eo(k),arc:-18*Math.sin(Math.min(1,k)*Math.PI),pose:"happy"}; },
    def:t=>SG.squash(t,600,0.5,520),
    fx(c,t,x){ const tg=x.target, R=tg.r; atImpact(t,600,0.55,0.2);
      if(t>=600&&t<1260){ const k=(t-600)/660; SG.ring(c,tg.x,tg.foot,R*(0.8+1.6*eo(k)),R*(0.2+0.4*eo(k)),[255,255,255],4*(1-k),1-k); SG.dust(c,tg.x,tg.foot,R,k,8);
        for(let i=0;i<5;i++){ const a=-Math.PI*(0.15+0.7*i/4), r2=R*(0.9+1.0*eo(k)); atStar4(c,tg.x+Math.cos(a)*r2,tg.y-R*0.3+Math.sin(a)*r2*0.7,R*0.22*(1-k),"#ffe25a"); } } }},
  /* Jaw Drop: it leaps up out of sight and drops jaws-first onto the target from above */
  jawdrop:{C:720,D:1380,contact:true,marks:true,
    atk:(t,o)=>{ if(t<160) return {sx:1+0.12*eo(t/160),sy:1-0.2*eo(t/160),pose:"crouch"};
      if(t<460){ const k=(t-160)/300; return {f:0.35*k,arc:-260*eo(k),sy:1+0.15*k,sx:1-0.08*k,pose:"jump"}; }
      if(t<720){ const k=(t-460)/260; return {f:0.35+0.4*eo(k),arc:-260*(1-ei(k)),rot:((o&&o.dir)||1)*0.3,sy:1.12,sx:0.92,pose:"bitewide"}; }
      if(t<880) return {f:0.75,pose:"chomp",sx:1.15,sy:0.88};
      const k=(t-880)/500; return {f:0.75*(1-eio(k)),arc:-22*Math.sin(Math.min(1,k)*Math.PI),pose:"idle"}; },
    def:t=>SG.squash(t,720,0.4,520),
    fx(c,t,x){ const tg=x.target, R=tg.r, col=mvCol(x);
      if(t>460&&t<720){ const k=(t-460)/260; c.fillStyle=`rgba(0,0,0,${0.25*k})`; c.beginPath(); c.ellipse(tg.x,tg.foot+2,R*(0.5+0.6*k),R*0.18,0,0,7); c.fill();
        c.strokeStyle=`rgba(255,255,255,${0.5*k})`; c.lineWidth=2; for(let i=0;i<4;i++){ const xx=tg.x+(i-1.5)*R*0.3; c.beginPath(); c.moveTo(xx,tg.top.y-R*(2.2-1.2*k)); c.lineTo(xx,tg.top.y-R*(1.4-1.0*k)); c.stroke(); } }
      if(t>650&&t<1100){ const op=t<720?1-(t-650)/70:0.12+0.6*eo((t-880)/220)*(t>880?1:0), a=t<1000?1:1-(t-1000)/100; SG.jaws(c,tg.x,tg.y-R*0.1,R*1.15,Math.max(0.05,op),col,a); }
      atImpact(t,720,0.6,0.15); if(t>=720) atPow(c,{x:tg.x,y:tg.y-R*1.0},Math.min(1,(t-720)/420),R/24); }},
  /* Charge: it digs in, kicking up dust, then barrels across the arena head first */
  chargeram:{C:560,D:1220,contact:true,marks:true,
    atk:t=>{ if(t<240) return {f:-0.06*eo(t/240),sy:1-0.12*eo(t/240),sx:1+0.08*eo(t/240),off:[Math.sin(t/12)*2,0],pose:"crouch"};
      if(t<560){ const k=(t-240)/320; return {f:-0.06+0.84*ei(k),arc:-Math.abs(Math.sin(k*Math.PI*3))*5,sx:1.1,sy:0.9,pose:"tackle"}; }
      const k=(t-560)/660; return {f:0.78*(1-eio(Math.max(0,k-0.1)/0.9)),sx:1.1-0.1*k,sy:0.9+0.1*k,pose:k<0.3?"tackle":"idle"}; },
    def:t=>SG.knock(t,560,1,38,560),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t<300) for(let i=0;i<3;i++){ const ph=((t/110)+i/3)%1; SG.puff(c,s.x-d*s.r*(0.5+0.7*ph),s.foot-ph*s.r*0.3,s.r*(0.1+0.2*ph),(1-ph)*0.7,[226,212,190]); }
      if(t>=240&&t<580){ const k=(t-240)/320; MV.lines(c,s.x,s.y,s.r,d,5,k); }
      atImpact(t,560,0.55,0.1); if(t>=560){ const k=(t-560)/640; atPow(c,{x:tg.x-d*R*0.2,y:tg.y-R*0.3},Math.min(1,k*1.3),R/24); SG.dust(c,tg.x,tg.foot,R,k,8); } }},
  /* Chomp Combo: three snapping bites as it closes in, then a leap into one huge bite */
  chompcombo:{C:760,D:1440,contact:true,marks:true,
    atk:t=>{ if(t<480){ const j=Math.floor(t/160), p=(t%160)/160; return {f:0.25+j*0.17+0.08*Math.sin(p*Math.PI),arc:-8*Math.sin(p*Math.PI),pose:p<0.5?"bitewide":"chomp"}; }
      if(t<760){ const k=(t-480)/280; return {f:0.6+0.15*eo(k),arc:-48*Math.sin(k*Math.PI),sx:1-0.08*Math.sin(k*Math.PI),sy:1+0.12*Math.sin(k*Math.PI),pose:"bitewide"}; }
      if(t<940) return {f:0.75,pose:"chomp",sx:1.15,sy:0.9,off:[Math.sin(t/14)*2,0]};
      const k=(t-940)/500; return {f:0.75*(1-eio(k)),arc:-20*Math.sin(Math.min(1,k)*Math.PI),pose:"happy"}; },
    def(t){ if(t>=120&&t<480){ const p=(t%160)/160; return {off:[(1-p)*5,0],pose:"hit"}; } return SG.squash(t,760,0.35,560); },
    fx(c,t,x){ const tg=x.target, R=tg.r, col=mvCol(x);
      for(let j=0;j<3;j++) MV.nip(c,tg.x+(j-1)*R*0.35,tg.y+(j%2?-1:1)*R*0.2,R*0.5,(t-80-j*160)/240,col);
      if(t>560&&t<1300){ const open=t<760?eo((t-560)/200):t<940?0.06:0.06+eo((t-940)/200)*0.7, a=t<620?(t-560)/60:t>1200?1-(t-1200)/100:1; SG.jaws(c,tg.x,tg.y-R*0.05,R*1.3,open,col,a); }
      atImpact(t,760,0.7,0.2); if(t>=760){ const k=(t-760)/620; atPow(c,{x:tg.x,y:tg.y-R*1.0},Math.min(1,k*1.4),R/24); for(let i=0;i<8;i++){ const a=-Math.PI*(0.1+0.8*atH(i*5)), sp=R*(0.6+1.4*k); SG.shard(c,tg.x+Math.cos(a)*sp*(i%2?1:-1),tg.y+Math.sin(a)*sp+k*k*R,R*0.08,t/80+i,"#fff6e0"); } } }}
});
Object.assign(AR_KIND,{Nibble:"nibble","Rolling Bite":"rollbite","Tooth Shot":"toothshot",Chatter:"chatter","Body Slam":"bodyslam","Big Gulp":"biggulp",Drool:"drool",
  "Belly Flop":"bellyflop","Jaw Drop":"jawdrop",Charge:"chargeram","Chomp Combo":"chompcombo"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  nibble:(d,t)=>{ [0.3,0.42].forEach(x=>{ sTone(d,t+x,'square',1000,400,0.04,0.04); dNoise(d,t+x,0.05,0.18,'bandpass',3000,2); }); },
  rollbite:(d,t)=>{ dNoise(d,t+0.12,0.34,0.14,'lowpass',400); for(let i=0;i<4;i++) dKick(d,t+0.15+i*0.08,0.08); sTone(d,t+0.46,'square',800,260,0.06,0.06); dNoise(d,t+0.46,0.08,0.25,'bandpass',2400,2); },
  toothshot:(d,t)=>{ sTone(d,t+0.2,'sine',300,900,0.08,0.06); dNoise(d,t+0.22,0.3,0.06,'highpass',4000,1); sTone(d,t+0.52,'triangle',2200,1400,0.12,0.08); sTone(d,t+0.6,'triangle',1800,1200,0.08,0.04); },
  chatter:(d,t)=>{ for(let i=0;i<16;i++) dNoise(d,t+0.05+i*0.045,0.025,0.16,'bandpass',2800+(i%2)*600,3); dNoise(d,t+0.42,0.3,0.15,'lowpass',600); },
  bodyslam:(d,t)=>{ sTone(d,t+0.18,'sine',200,500,0.3,0.05); dKick(d,t+0.56,1); dNoise(d,t+0.56,0.45,0.25,'lowpass',260); dNoise(d,t+0.58,0.2,0.12,'bandpass',900,1); },
  biggulp:(d,t)=>{ dNoise(d,t+0.1,0.65,0.16,'bandpass',700,0.7); sTone(d,t+0.1,'sine',600,200,0.65,0.04); sTone(d,t+0.76,'sine',220,90,0.18,0.18); dKick(d,t+0.8,0.25); },
  drool:(d,t)=>{ sTone(d,t+0.18,'sine',500,180,0.15,0.06); dNoise(d,t+0.3,0.3,0.05,'bandpass',500,1); dNoise(d,t+0.62,0.25,0.25,'lowpass',700); sTone(d,t+0.62,'sine',300,120,0.2,0.08); },
  bellyflop:(d,t)=>{ sTone(d,t+0.15,'sine',250,700,0.3,0.05); dNoise(d,t+0.6,0.12,0.4,'highpass',1500,0.7); dKick(d,t+0.6,0.8); dNoise(d,t+0.62,0.35,0.2,'lowpass',400); },
  jawdrop:(d,t)=>{ sTone(d,t+0.16,'sine',300,1100,0.3,0.05); sTone(d,t+0.46,'sine',1200,300,0.26,0.05); dKick(d,t+0.72,0.9); sTone(d,t+0.72,'square',800,200,0.08,0.07); dNoise(d,t+0.72,0.12,0.3,'bandpass',2400,1.5); },
  chargeram:(d,t)=>{ for(let i=0;i<4;i++) dNoise(d,t+i*0.06,0.05,0.12,'lowpass',500); dNoise(d,t+0.24,0.32,0.14,'bandpass',800,0.6); dKick(d,t+0.56,0.9); dNoise(d,t+0.56,0.3,0.25,'lowpass',350); },
  chompcombo:(d,t)=>{ [0.12,0.28,0.44].forEach(x=>{ sTone(d,t+x,'square',900,350,0.04,0.05); dNoise(d,t+x,0.05,0.2,'bandpass',2600,2); }); sTone(d,t+0.5,'sine',300,800,0.25,0.05); dKick(d,t+0.76,0.9); dNoise(d,t+0.76,0.12,0.3,'bandpass',2000,1.2); sTone(d,t+0.76,'sawtooth',120,60,0.3,0.05); }
});
if(typeof SWING!=="undefined") ["rollbite","bodyslam","bellyflop","jawdrop","chargeram","chompcombo"].forEach(k=>SWING.add(k));

/* group 1 (16 Nov 2026): the moves the drafts asked a new look for */
MV.fist=(c,x,y,z,d)=>{ c.save(); c.translate(x,y); c.scale(d,1); c.fillStyle="#9aa3ad"; c.strokeStyle="#4a5058"; c.lineWidth=2; c.beginPath(); c.roundRect(-z*0.7,-z*0.6,z*1.4,z*1.2,z*0.3); c.fill(); c.stroke();
  c.strokeStyle="#5d646c"; c.lineWidth=1.4; for(let i=-1;i<=1;i++){ c.beginPath(); c.moveTo(z*0.2,i*z*0.32); c.lineTo(z*0.6,i*z*0.32); c.stroke(); } c.fillStyle="rgba(255,255,255,.5)"; c.fillRect(-z*0.5,-z*0.45,z*0.5,z*0.18); c.restore(); };
MV.crescent=(c,x,y,R,d,a,col=[235,248,255])=>{ if(a<=0) return; c.save(); c.translate(x,y); c.scale(d,1); c.fillStyle=atRgba(col,0.85*a); c.beginPath(); c.arc(0,0,R,-1.2,1.2); c.arc(-R*0.35,0,R*0.85,1.1,-1.1,true); c.closePath(); c.fill();
  c.strokeStyle=`rgba(255,255,255,${a})`; c.lineWidth=2; c.beginPath(); c.arc(0,0,R,-1.2,1.2); c.stroke(); c.restore(); };
const mvSpin=(t,n,len)=>Math.cos(Math.min(1,t/len)*Math.PI*2*n);   // a turntable spin: the body's width as it turns
Object.assign(ANIM,{
  /* Antik's Rocket Arm: its arm fires off on a cable, punches and reels back in */
  rocketarm:{C:380,D:1000,
    atk:t=>({f:t<160?-0.04*eo(t/160):0,sx:t<160?1+0.06*eo(t/160):1,pose:t<160?"determined":t<700?"push":"idle",off:[t>380&&t<460?-3:0,0]}),
    def:t=>SG.knock(t,380,1,16,360),
    fx(c,t,x){ const s=x.self, tg=x.target, d=atDir(x), a={x:s.x+d*s.r*0.7,y:s.y}, b={x:tg.x-d*tg.r*0.5,y:tg.y}, k=t<160?0:t<380?ei((t-160)/220):t<520?1:1-eio((t-520)/360);
      if(k<=0) return; const px=a.x+(b.x-a.x)*k, py=a.y+(b.y-a.y)*k; c.strokeStyle="#3f444b"; c.lineWidth=3; c.beginPath(); c.moveTo(a.x,a.y);
      for(let i=1;i<=10;i++){ const q=i/10; c.lineTo(a.x+(px-a.x)*q,a.y+(py-a.y)*q+Math.sin(q*12+t/30)*3*(1-k*0.5)); } c.stroke();
      if(t<380&&t>160){ for(let i=0;i<4;i++) SG.puff(c,px-d*s.r*(0.2+i*0.18),py+(atH(i)-0.5)*6,s.r*0.08*(4-i)/4,0.6); }
      MV.fist(c,px,py,s.r*0.32,d); atImpact(t,380,0.25,0); if(t>=380&&t<700) atPow(c,{x:b.x,y:b.y-tg.r*0.5},(t-380)/320,tg.r/30); }},
  /* Bipped's Knee Strike: it steps in and drives a knee up into the target, folding it over */
  kneestrike:{C:420,D:1060,contact:true,marks:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<180) return {f:0.3*eo(t/180),pose:AT_P.kickWind}; if(t<420){ const k=(t-180)/240; return {f:0.3+0.4*eo(k),arc:-22*Math.sin(k*Math.PI*0.6),rot:-d*0.12*k,pose:AT_P.kickMid}; }
      if(t<560) return {f:0.7,arc:-12,rot:-d*0.12,pose:AT_P.kick}; const k=(t-560)/500; return {f:0.7*(1-eio(k)),arc:-12*(1-k),rot:-d*0.12*(1-k),pose:"idle"}; },
    def(t){ if(t<420||t>980) return null; const a=1-eo((t-420)/560); return {sx:1-0.12*a,sy:1+0.06*a,arc:-14*a,rot:0.2*a,pose:"hurt",off:[6*a,0]}; },
    fx(c,t,x){ const tg=x.target, R=tg.r; atImpact(t,420,0.5,0.1); if(t>=420){ const k=(t-420)/520; atPow(c,{x:tg.x,y:tg.y+R*0.2},Math.min(1,k*1.4),R/26);
      for(let i=0;i<3;i++){ const yy=tg.y+R*(0.5-i*0.25); c.strokeStyle=`rgba(255,255,255,${0.7*(1-k)})`; c.lineWidth=2.5; c.beginPath(); c.moveTo(tg.x-R*(0.6+k*0.5),yy+R*0.4); c.lineTo(tg.x-R*(0.2+k*0.3),yy); c.stroke(); } } }},
  /* Pinch's Sand Spray: it digs both claws in and flings a fan of sand into the target's eyes */
  sandspray:{C:480,D:1120,
    atk:t=>t<260?{sy:1-0.12*eo(t/260),sx:1+0.06*eo(t/260),pose:"crouch",f:-0.03*eo(t/260)}:t<420?{pose:"push",sy:1.05,arc:-4}:{pose:t<900?"push":"idle"},
    def:t=>t>=480&&t<1100?{off:[Math.sin(t/16)*3,0],pose:"hurt",sy:1-0.04*Math.sin(t/30)}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), SAND=[222,196,140];
      if(t<300) for(let i=0;i<3;i++){ const ph=((t/120)+i/3)%1; SG.puff(c,s.x+d*s.r*(0.3+0.3*ph),s.foot-ph*s.r*0.3,s.r*0.12*(1-ph),0.7,SAND); }
      if(t>=260&&t<900) for(let i=0;i<26;i++){ const st=260+atH(i)*160, k=(t-st)/(420+atH(i*3)*160); if(k<0||k>1) continue;
        const ex=tg.x+(atH(i*5)-0.5)*R*1.6, ey=tg.y-R*0.4+(atH(i*7)-0.5)*R*1.2, p=lerpP({x:s.x+d*s.r*0.5,y:s.foot-s.r*0.3},{x:ex,y:ey},eo(k),R*(0.5+atH(i)*0.6));
        c.fillStyle=atRgba(SAND.map(v=>v-(i%3)*20),1-k*0.4); c.fillRect(p.x-1.5,p.y-1.5,3,3); }
      if(t>=480&&t<1100){ const k=(t-480)/620; SG.puff(c,tg.x,tg.y-R*0.4,R*(0.5+0.4*k),0.55*(1-k),SAND); } }},
  /* Pinch's Claw Spin: it spins in place with both claws out, clipping the target on each turn */
  clawspin:{C:420,D:1080,contact:true,marks:true,
    atk:t=>{ const sp=t<820?mvSpin(t-80,3,740):1; return {f:t<200?0.65*eo(t/200):t<820?0.65:0.65*(1-eio((t-820)/260)),sx:t>80&&t<820?Math.max(0.15,Math.abs(sp))*(sp<0?-1:1):1,pose:"attack",arc:t>80&&t<820?-6:0}; },
    def(t){ if(t<420||t>900) return null; const p=((t-420)%160)/160; return {off:[(1-p)*6,0],pose:"hit"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, col=mvCol(x); for(let j=0;j<3;j++){ const k=(t-380-j*160)/220; if(k<0||k>1) continue; c.strokeStyle=`rgba(255,255,255,${0.9*(1-k)})`; c.lineWidth=4*(1-k)+1;
        c.beginPath(); c.arc(tg.x,tg.y-R*0.1,R*(0.7+0.2*j),-0.8+j*0.4+k*1.6,0.4+j*0.4+k*1.6); c.stroke(); c.strokeStyle=atRgba(col,0.7*(1-k)); c.lineWidth=2; c.beginPath(); c.arc(tg.x,tg.y-R*0.1,R*(0.6+0.2*j),-0.8+j*0.4+k*1.6,0.4+j*0.4+k*1.6); c.stroke(); }
      if(t>80&&t<820) SG.dust(c,x.self.x,x.self.foot,x.self.r*0.8,((t-80)%300)/300,4); }},
  /* Skit's Dread Crawl: the shadow of a huge spider creeps over the target, legs first, with pale eyes */
  dreadcrawl:{C:460,D:1150,
    atk:t=>({pose:t<900?"cast":"idle",sy:1-0.05*Math.sin(Math.min(1,t/400)*Math.PI),off:[Math.sin(t/40)*1.5,0]}),
    def:t=>t>=300&&t<1100?{off:[Math.sin(t/12)*2.5,0],pose:"hurt",alpha:1}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r, k=Math.min(1,t/460), fade=t<850?1:Math.max(0,1-(t-850)/300); if(fade<=0) return; const cx=tg.x, cy=tg.y-R*0.4;
      c.save(); c.globalAlpha*=fade; SG.fog(c,cx,cy,R*1.6*k,[20,12,34],0.55); c.strokeStyle="rgba(28,16,44,.85)"; c.lineCap="round"; c.lineWidth=R*0.09;
      for(let i=0;i<8;i++){ const sd=i<4?-1:1, j=i%4, a0=(sd<0?Math.PI:0)+sd*(-0.9+j*0.55), L=R*(1.2+0.3*(j%2))*eo(k), wig=Math.sin(t/90+i)*0.12;
        c.beginPath(); c.moveTo(cx,cy); c.quadraticCurveTo(cx+Math.cos(a0-sd*0.6+wig)*L*0.6,cy+Math.sin(a0-0.6+wig)*L*0.6-R*0.3,cx+Math.cos(a0+wig)*L,cy+Math.sin(a0+wig)*L*0.7); c.stroke(); }
      c.fillStyle="rgba(28,16,44,.9)"; c.beginPath(); c.ellipse(cx,cy,R*0.5*k,R*0.36*k,0,0,7); c.fill();
      if(k>0.6) for(const [ex,ey] of [[-0.18,-0.06],[0.18,-0.06],[-0.08,-0.16],[0.08,-0.16]]){ c.fillStyle=`rgba(230,220,255,${(k-0.6)/0.4})`; c.beginPath(); c.arc(cx+ex*R,cy+ey*R,R*0.05,0,7); c.fill(); }
      c.restore(); }},
  /* Squib's Ink Fog: it puffs out a cloud of ink that rolls over the target and hangs round it */
  inkfog:{C:520,D:1200,
    atk:t=>t<240?{sx:1+0.14*eo(t/240),sy:1-0.08*eo(t/240),pose:"bitewide"}:t<380?{sx:0.9,sy:1.08,pose:"push"}:{pose:t<900?"push":"idle"},
    def:t=>t>=520&&t<1180?{off:[Math.sin(t/22)*2,0],pose:"hurt",flash:0}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), INK=[26,22,40];
      for(let i=0;i<9;i++){ const st=240+i*30, k=(t-st)/520; if(k<0) continue; const end=t>900?1-(t-900)/300:1; if(end<=0) continue;
        const kk=Math.min(1,k), p=lerpP({x:s.x+d*s.r*0.6,y:s.y},{x:tg.x+(atH(i)-0.5)*R*1.4,y:tg.y-R*0.3+(atH(i*3)-0.5)*R},eo(kk),R*0.3);
        SG.fog(c,p.x+Math.sin(t/200+i)*4,p.y,R*(0.3+0.5*kk)*(0.8+0.4*atH(i*5)),INK,0.7*end); }
      if(t>520&&t<1200) for(let i=0;i<4;i++){ const ph=((t/400)+i/4)%1; c.fillStyle=`rgba(20,16,30,${0.8*(1-ph)})`; c.beginPath(); c.arc(tg.x+(i-1.5)*R*0.4,tg.y+R*0.1+ph*R*0.7,R*0.06,0,7); c.fill(); } }},
  /* Squib's Jet Spin: it spins like a drill on a jet of water and bores into the target */
  jetspin:{C:420,D:1100,contact:true,marks:true,
    atk:t=>{ const sp=t<860?mvSpin(t,5,860):1; return {f:t<420?0.72*ei(t/420):t<860?0.72:0.72*(1-eio((t-860)/240)),sx:t<860?Math.max(0.2,Math.abs(sp)):1,arc:t<860?-14:0,rot:0,pose:"tackle"}; },
    def(t){ if(t<420||t>880) return null; const p=((t-420)%150)/150; return {off:[(1-p)*7,0],pose:"hit"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, d=atDir(x), W=[120,190,250]; if(t>860) return;
      for(let i=0;i<10;i++){ const ph=((t/160)+i/10)%1, ang=ph*Math.PI*4, px=s.x-d*s.r*(0.5+ph*1.4), py=s.y-14+Math.sin(ang)*s.r*0.5*(1-ph*0.5); c.fillStyle=atRgba(W,0.8*(1-ph)); c.beginPath(); c.arc(px,py,s.r*0.09*(1-ph*0.5),0,7); c.fill(); }
      c.strokeStyle="rgba(220,240,255,.7)"; c.lineWidth=2; for(let i=0;i<3;i++){ const a=t/40+i*2.1; c.beginPath(); c.ellipse(s.x,s.y-14,s.r*0.9,s.r*0.35,0,a,a+1.6); c.stroke(); }
      if(t>=420) for(let j=0;j<3;j++){ const k=(t-420-j*150)/250; if(k>=0&&k<1) atSplash(c,{x:tg.x-d*tg.r*0.3,y:tg.y},k,W,0.9); } }},
  /* Stilt's Wind Kick: a high kick so fast it throws a crescent of wind across the arena */
  windkick:{C:560,D:1200,
    atk:t=>t<220?{pose:AT_P.kickWind,f:-0.03*eo(t/220)}:t<360?{pose:AT_P.highKick,arc:-6}:t<800?{pose:AT_P.kick}:{pose:"idle"},
    def:t=>SG.knock(t,560,1,24,460),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t>=220&&t<380){ const k=(t-220)/160; c.strokeStyle=`rgba(255,255,255,${0.8*(1-k)})`; c.lineWidth=4; c.beginPath(); c.arc(s.x+d*s.r*0.3,s.y-s.r*0.3,s.r*1.1,d>0?-1.6:Math.PI-1.4+3.0,d>0?0.2+1.2*k:Math.PI+1.6,d<0); c.stroke(); }
      if(t>=300&&t<620){ const k=(t-300)/260, px=s.x+(tg.x-s.x)*eo(Math.min(1,k)); MV.crescent(c,px,tg.y-R*0.3,R*0.9,d,Math.min(1,k*3));
        c.strokeStyle="rgba(255,255,255,.4)"; c.lineWidth=2; for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(px-d*R*(0.4+i*0.3),tg.y-R*(0.6-i*0.3)); c.lineTo(px-d*R*(1.4+i*0.3),tg.y-R*(0.6-i*0.3)); c.stroke(); } }
      atImpact(t,560,0.4,0.1); if(t>=560&&t<900){ const k=(t-560)/340; MV.crescent(c,tg.x+d*R*k,tg.y-R*0.3,R*(0.9+0.4*k),d,1-k); for(let i=0;i<6;i++) SG.shard(c,tg.x+d*R*(0.3+k)*(0.5+atH(i)),tg.y-R*(0.8-atH(i*3)*1.2),R*0.06,t/60+i,"rgba(220,240,255,.8)"); } }}
});
Object.assign(AR_KIND,{"Rocket Arm":"rocketarm","Knee Strike":"kneestrike","Sand Spray":"sandspray","Claw Spin":"clawspin","Dread Crawl":"dreadcrawl","Ink Fog":"inkfog","Jet Spin":"jetspin","Wind Kick":"windkick"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  rocketarm:(d,t)=>{ dNoise(d,t+0.16,0.22,0.16,'bandpass',1400,1); sTone(d,t+0.16,'sawtooth',200,500,0.2,0.03); dKick(d,t+0.38,0.5); dNoise(d,t+0.38,0.1,0.2,'bandpass',2200,1); for(let i=0;i<5;i++) dNoise(d,t+0.52+i*0.06,0.03,0.06,'highpass',3000,2); },
  kneestrike:(d,t)=>{ dNoise(d,t+0.18,0.2,0.1,'bandpass',900,0.8); dKick(d,t+0.42,0.8); sTone(d,t+0.42,'sine',160,70,0.2,0.12); },
  sandspray:(d,t)=>{ dNoise(d,t+0.05,0.25,0.12,'lowpass',800); dNoise(d,t+0.26,0.6,0.2,'highpass',2500,0.6); },
  clawspin:(d,t)=>{ dNoise(d,t+0.08,0.75,0.1,'bandpass',600,0.5); [0.42,0.58,0.74].forEach(x=>{ dNoise(d,t+x,0.07,0.22,'highpass',3500,2); sTone(d,t+x,'square',1200,600,0.04,0.04); }); },
  dreadcrawl:(d,t)=>{ for(let i=0;i<10;i++) dNoise(d,t+i*0.05,0.03,0.07,'bandpass',4000-i*200,4); sTone(d,t+0.2,'sine',180,120,0.8,0.05); sTone(d,t+0.46,'triangle',600,560,0.5,0.03); },
  inkfog:(d,t)=>{ sTone(d,t+0.2,'sine',300,120,0.2,0.08); dNoise(d,t+0.24,0.7,0.16,'lowpass',500); },
  jetspin:(d,t)=>{ dNoise(d,t,0.86,0.14,'bandpass',1800,0.6); sTone(d,t,'sawtooth',200,700,0.8,0.02); [0.42,0.57,0.72].forEach(x=>dNoise(d,t+x,0.12,0.22,'lowpass',900)); },
  windkick:(d,t)=>{ dNoise(d,t+0.22,0.16,0.2,'highpass',2000,0.8); dNoise(d,t+0.3,0.3,0.18,'bandpass',1200,1); dNoise(d,t+0.56,0.25,0.22,'highpass',1500,0.7); dKick(d,t+0.56,0.3); }
});
if(typeof SWING!=="undefined") ["kneestrike","clawspin","jetspin","windkick"].forEach(k=>SWING.add(k));
/* group 2 (16 Nov 2026) */
/* a body spinning in place on its way in, flinging bits of its own colour, for Goo Spin and Spin Crash */
function mvSpinIn(C,hits,flingCol){ const end=C+hits*150+40;
  return {C,D:end+300,contact:true,marks:true,
    atk:t=>{ const sp=t<end?mvSpin(t,Math.round(end/170),end):1; return {f:t<C?0.72*ei(t/C):t<end?0.72:0.72*(1-eio((t-end)/280)),sx:t<end?Math.max(0.2,Math.abs(sp)):1,arc:t<end?-8:0,pose:"tackle"}; },
    def(t){ if(t<C||t>end+40) return null; const p=((t-C)%150)/150; return {off:[(1-p)*7,0],pose:"hit"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, d=atDir(x), col=flingCol||mvCol(x); if(t>end) return;
      for(let i=0;i<10;i++){ const ph=((t/150)+i/10)%1, a=ph*Math.PI*4+i, px=s.x+Math.cos(a)*s.r*(0.6+ph*0.9), py=s.y-10+Math.sin(a)*s.r*0.3-ph*s.r*0.3; c.fillStyle=atRgba(col,0.85*(1-ph)); c.beginPath(); c.arc(px,py,s.r*0.08*(1-ph*0.4),0,7); c.fill(); }
      c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=2; for(let i=0;i<3;i++){ const a=t/38+i*2.1; c.beginPath(); c.ellipse(s.x,s.y-10,s.r*0.95,s.r*0.3,0,a,a+1.5); c.stroke(); }
      SG.dust(c,s.x,s.foot,s.r*0.7,((t)%280)/280,4);
      for(let j=0;j<hits;j++){ const k=(t-C-j*150)/240; if(k>=0&&k<1) atSplash(c,{x:tg.x-d*tg.r*0.3,y:tg.y},k,col,0.8); } }}; }
MV.glove=(c,x,y,z,d,col)=>SG.glove(c,x,y,z,d,col);
Object.assign(ANIM,{
  goospin:mvSpinIn(420,3,[120,210,110]),
  spincrash:mvSpinIn(460,1,[200,210,230]),
  /* Mitt's Rocket Glove: the glove fires off on a trail of smoke and slams into the target */
  rocketglove:{C:480,D:1120,
    atk:t=>({sx:t<180?1+0.08*eo(t/180):1,sy:t<180?1-0.1*eo(t/180):1,pose:t<180?"determined":t<800?"push":"idle",off:[t>180&&t<260?-6:0,0]}),
    def:t=>SG.knock(t,480,1,34,500),
    fx(c,t,x){ const s=x.self, tg=x.target, d=atDir(x), a={x:s.x+d*s.r*0.6,y:s.y-4}, b={x:tg.x-d*tg.r*0.4,y:tg.y-4};
      if(t>=180&&t<480){ const k=ei((t-180)/300), px=a.x+(b.x-a.x)*k; for(let i=0;i<8;i++){ const q=Math.max(0,k-i*0.04), qx=a.x+(b.x-a.x)*q; SG.puff(c,qx,a.y+Math.sin(i*1.7)*4,s.r*(0.1+0.04*i),0.55*(1-i/8),[230,226,220]); }
        atGlowA(c,px-d*s.r*0.35,a.y,s.r*0.3,[255,170,60],0.8); MV.glove(c,px,a.y,s.r*0.34,d,x.col||[220,60,60]); }
      if(t>=480&&t<1000){ const k=(t-480)/520; MV.glove(c,b.x-d*tg.r*0.8*eo(k),b.y-tg.r*1.2*Math.sin(k*Math.PI),s.r*0.34,d,x.col||[220,60,60]); atPow(c,{x:b.x,y:b.y-tg.r*0.4},Math.min(1,k*1.4),tg.r/24); }
      atImpact(t,480,0.5,0.1); }},
  /* Brolly's Snap Shut: it leans over the target and its canopy snaps shut round it like a clam */
  snapshut:{C:440,D:1180,contact:true,
    atk:t=>({f:t<440?0.6*eo(t/440):t<900?0.6:0.6*(1-eio((t-900)/280)),pose:t<440?"attack":"push",rot:0}),
    def:t=>t>=440&&t<940?{sx:0.86,sy:0.92,off:[Math.sin(t/14)*2,0],pose:"hurt"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r, col=x.col||[90,140,220]; if(t<200||t>1000) return; const close=t<440?1-eo((t-200)/240):t<900?0.08+0.04*Math.sin(t/40):0.08+eo((t-900)/100), a=t>940?1-(t-940)/60:1;
      c.save(); c.globalAlpha*=a; for(const sd of [-1,1]){ c.save(); c.translate(tg.x,tg.y-R*0.3); c.rotate(sd*(0.25+1.1*close)); c.fillStyle=atRgba(col,0.92); c.strokeStyle=atRgba(col.map(v=>v*0.6),1); c.lineWidth=2;
        c.beginPath(); c.moveTo(0,-R*1.3*sd*0); for(let j=0;j<=6;j++){ const q=j/6, ang=-Math.PI/2+q*Math.PI; c.lineTo(Math.cos(ang)*R*1.25*sd,Math.sin(ang)*R*1.25+(j%2?R*0.08:0)); } c.closePath(); c.fill(); c.stroke();
        c.strokeStyle="rgba(255,255,255,.35)"; for(let j=1;j<6;j++){ const ang=-Math.PI/2+j/6*Math.PI; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(ang)*R*1.2*sd,Math.sin(ang)*R*1.2); c.stroke(); } c.restore(); } c.restore();
      atImpact(t,440,0.3,0); }},
  /* Brolly's Rainbow: a rainbow arcs out of the open canopy and sweeps down over the target */
  rainbow:{C:620,D:1300,
    atk:t=>({arc:-10*Math.sin(Math.min(1,t/400)*Math.PI/2)*(t<1000?1:1-(t-1000)/300),pose:t<1000?"cast":"idle"}),
    def:t=>t>=620&&t<1250?{off:[Math.sin(t/16)*2.5,0],pose:"hurt",flash:Math.floor(t/80)%2?2:0}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, k=Math.min(1,(t-120)/500), a=t<1000?1:1-(t-1000)/300; if(k<=0||a<=0) return;
      const cx=(s.x+tg.x)/2, cy=Math.max(s.foot,tg.foot), rx=Math.abs(tg.x-s.x)/2, ry=Math.max(R*2.4,rx*0.7), d=atDir(x), C=[[255,90,90],[255,170,60],[255,230,90],[110,210,110],[90,170,255],[160,110,240]];
      c.save(); c.globalAlpha*=a; c.lineCap="round"; for(let i=0;i<6;i++){ c.strokeStyle=atRgba(C[i],0.8); c.lineWidth=R*0.13; c.beginPath();
        const a0=d>0?Math.PI:0, sweep=Math.PI*eo(k)*d; c.ellipse(cx,cy,rx+(i-2.5)*R*0.14,ry+(i-2.5)*R*0.14,0,a0,a0+sweep,d<0); c.stroke(); }
      if(t>620){ const q=(t-620)/600; for(let i=0;i<8;i++){ const an=i/8*Math.PI*2+q*3; atStar4(c,tg.x+Math.cos(an)*R*(0.6+q),tg.y-R*0.4+Math.sin(an)*R*0.6*(0.6+q),R*0.18*(1-q),atRgba(C[i%6],1)); } }
      c.restore(); atImpact(t,620,0.3,0.1); }},
  /* Burr's Burst Up: it dives into the ground and bursts up under the target, throwing it into the air */
  burstup:{C:620,D:1320,
    atk:t=>{ if(t<260){ const k=eo(t/260); return {arc:-10*Math.sin(k*Math.PI),sy:1-0.2*k,alpha:1-k*0.9,pose:"crouch"}; } if(t<620) return {alpha:0.05,f:0.4,arc:30}; if(t<900){ const k=(t-620)/280; return {f:0.7,arc:-40*Math.sin(k*Math.PI),alpha:Math.min(1,k*3),pose:"jump"}; } const k=(t-900)/400; return {f:0.7*(1-eio(k)),pose:"idle"}; },
    def(t){ if(t<620||t>1300) return null; const k=(t-620)/680; return {arc:-70*Math.sin(Math.min(1,k*1.4)*Math.PI)*(k<0.72?1:0),rot:0.6*Math.sin(k*Math.PI),pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, DIRT=[150,110,70];
      if(t<300){ const k=t/300; SG.dust(c,s.x,s.foot,s.r,k,8); }
      if(t>=260&&t<620){ const k=(t-260)/360, px=s.x+(tg.x-s.x)*k; c.fillStyle="rgba(90,62,40,.6)"; c.beginPath(); c.ellipse(px,s.foot+2,s.r*0.5,s.r*0.12,0,0,7); c.fill(); for(let i=0;i<3;i++) SG.puff(c,px-(i-1)*8,s.foot-2,4+i*2,0.5,DIRT); }
      if(t>=520&&t<620){ const k=(t-520)/100; SG.cracks(c,tg.x,tg.foot,R*1.2*k,6,4,1); }
      if(t>=620){ const k=(t-620)/680; SG.cracks(c,tg.x,tg.foot,R*1.2,6,4,1-k); for(let i=0;i<14;i++){ const a=-Math.PI*(0.15+0.7*atH(i*3)), sp=R*(0.4+2*eo(k))*(0.6+0.5*atH(i)); SG.shard(c,tg.x+Math.cos(a)*sp,tg.foot+Math.sin(a)*sp+k*k*R*2.4,R*0.09,t/80+i,i%2?"#8a6a48":"#a8845c"); } SG.dust(c,tg.x,tg.foot,R*1.3,k,10); }
      atImpact(t,620,0.55,0.1); }},
  /* Flit's Wing Storm: its wings blur and six slashes rake the target */
  wingstorm:atFlurry(6,["attack","tackle"],(c,x,k,j)=>{ const tg=x.target, R=tg.r, a=1-k; c.strokeStyle=`rgba(255,255,255,${0.9*a})`; c.lineWidth=3*a+1; const yy=tg.y+(j%3-1)*R*0.3, sd=j%2?1:-1;
    c.beginPath(); c.moveTo(tg.x-R*0.8*sd,yy-R*0.5); c.quadraticCurveTo(tg.x,yy,tg.x+R*0.8*sd,yy+R*0.4); c.stroke(); SG.feather&&SG.feather(c,tg.x+sd*R*(0.6+k),yy-R*k,R*0.25,j+k*3,x.col||[120,90,160],a); },0.62),
  /* Lern's Dim Light: its glow sinks to a cold blue and the dark closes over the target */
  dimlight:{C:520,D:1200,
    atk:t=>({pose:t<1000?"cast":"idle",alpha:t<520?1-0.3*eo(t/520):t<1000?0.7:0.7+0.3*eo((t-1000)/200)}),
    def:t=>t>=520&&t<1150?{off:[Math.sin(t/18)*2,0],pose:"hurt",alpha:0.8}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, k=Math.min(1,t/520), a=t<900?1:Math.max(0,1-(t-900)/300); if(a<=0) return;
      SG.fog(c,s.x,s.y,s.r*(1.4-0.6*k),[120,170,255],0.4*(1-k*0.5)*a); SG.fog(c,tg.x,tg.y-R*0.3,R*(0.6+1.2*k),[10,14,36],0.75*k*a);
      for(let i=0;i<6;i++){ const ph=((t/500)+i/6)%1, an=i*1.05; c.fillStyle=`rgba(150,190,255,${0.7*(1-ph)*a})`; c.beginPath(); c.arc(tg.x+Math.cos(an)*R*(1.3-ph),tg.y-R*0.3+Math.sin(an)*R*(0.9-ph*0.6),R*0.05,0,7); c.fill(); } }},
  /* Lern's Firecracker: it tosses a lit firecracker that pops with a bang in front of the target */
  firecracker:{C:560,D:1200,
    atk:t=>({pose:t<200?"determined":t<500?"push":"idle",sy:t<200?1-0.08*eo(t/200):1}),
    def:t=>SG.knock(t,560,1,26,460),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), a={x:s.x+d*s.r*0.5,y:s.y-s.r*0.3}, b={x:tg.x-d*R*0.4,y:tg.y-R*0.2};
      if(t>=200&&t<560){ const k=(t-200)/360, p=lerpP(a,b,k,R*1.4); c.save(); c.translate(p.x,p.y); c.rotate(t/60); c.fillStyle="#d8342c"; c.fillRect(-R*0.08,-R*0.22,R*0.16,R*0.44); c.fillStyle="#f4e9d0"; c.fillRect(-R*0.08,-R*0.24,R*0.16,R*0.06); c.restore();
        for(let i=0;i<3;i++) atStar4(c,p.x+(atH(i+t)-0.5)*8,p.y-R*0.25+(atH(i*3+t)-0.5)*8,3,"#ffe08a"); }
      atImpact(t,560,0.45,0.25); if(t>=560&&t<1150){ const k=(t-560)/590; atGlowA(c,b.x,b.y,R*(0.6+1.4*k),[255,200,90],0.9*(1-k)); atPow(c,{x:b.x,y:b.y-R*0.4},Math.min(1,k*1.5),R/22);
        for(let i=0;i<12;i++){ const an=i/12*Math.PI*2, r2=R*(0.3+1.6*eo(k)); c.fillStyle=atRgba(i%2?[255,220,90]:[255,120,60],1-k); c.beginPath(); c.arc(b.x+Math.cos(an)*r2,b.y+Math.sin(an)*r2*0.8+k*k*R,R*0.06,0,7); c.fill(); } } }},
  /* Lern's Fireworks: rockets streak up from it and burst over the target in coloured sparks, one per hit */
  fireworks:{C:520,D:1420,
    atk:t=>({pose:t<1100?"cast":"idle",arc:-6*Math.sin(Math.min(1,t/300)*Math.PI/2)}),
    def(t){ if(t<520||t>1180) return null; const p=((t-520)%130)/130; return {off:[(1-p)*4,0],pose:"hit",flash:p<0.3?2:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, C=[[255,90,120],[120,200,255],[255,220,90],[150,255,140],[220,140,255]];
      for(let j=0;j<5;j++){ const t0=j*130, launch=(t-t0)/(520-60), burst=(t-t0-520)/520, bx=tg.x+(j-2)*R*0.35, by=tg.y-R*(1.2+0.3*(j%2));
        if(launch>=0&&launch<1){ const p=lerpP({x:s.x,y:s.y-s.r*0.6},{x:bx,y:by},eo(launch),R*1.5); atGlowA(c,p.x,p.y,R*0.15,C[j],1); c.strokeStyle=atRgba(C[j],0.6); c.lineWidth=2; const q=lerpP({x:s.x,y:s.y-s.r*0.6},{x:bx,y:by},Math.max(0,eo(launch)-0.12),R*1.5); c.beginPath(); c.moveTo(q.x,q.y); c.lineTo(p.x,p.y); c.stroke(); }
        if(burst>=0&&burst<1){ atGlowA(c,bx,by,R*0.6*(1-burst),C[j],0.7); for(let i=0;i<14;i++){ const an=i/14*Math.PI*2, r2=R*0.9*eo(burst); c.fillStyle=atRgba(C[j],1-burst); c.beginPath(); c.arc(bx+Math.cos(an)*r2,by+Math.sin(an)*r2+burst*burst*R*0.6,R*0.05,0,7); c.fill(); } } } }},
  /* Teep's Iced Tea: it pours a stream of icy tea that freezes into a block round the target's feet */
  icedtea:{C:560,D:1260,
    atk:(t,o)=>({pose:t<1000?"push":"idle",rot:Math.max(0,t<1000?Math.min(1,t/300):1-(t-1000)/260)*0.35*((o&&o.dir)||1),f:0}),
    def:t=>t>=560&&t<1200?{off:[Math.sin(t/12)*1.5,0],pose:"hurt",sx:1.02,sy:0.98}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), T=[200,150,90], I=[190,235,255], a={x:s.x+d*s.r*0.9,y:s.y-s.r*0.3}, b={x:tg.x,y:tg.y-R*0.2};
      if(t>=180&&t<760){ const k=Math.min(1,(t-180)/300), end=t>620?(t-620)/140:0; c.strokeStyle=atRgba(T,0.9); c.lineWidth=R*0.16; c.lineCap="round"; c.beginPath();
        for(let i=0;i<=16;i++){ const q=end+(k-end)*i/16, p=lerpP(a,b,q,R*0.9); c[i?"lineTo":"moveTo"](p.x,p.y+Math.sin(i+t/40)*1.5); } c.stroke(); for(let i=0;i<4;i++){ const ph=((t/120)+i/4)%1; SG.puff(c,a.x+(b.x-a.x)*ph,a.y-R*0.3-ph*R*0.4,R*0.12,0.25*(1-ph)); } }
      if(t>=480){ const k=Math.min(1,(t-480)/200), a2=t<1100?1:1-(t-1100)/160; c.save(); c.globalAlpha*=a2; c.fillStyle=atRgba(I,0.55); c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=2;
        const w=R*1.1, h=R*1.1*k; c.beginPath(); c.moveTo(tg.x-w,tg.foot); c.lineTo(tg.x-w*0.9,tg.foot-h); c.lineTo(tg.x-w*0.2,tg.foot-h*1.15); c.lineTo(tg.x+w*0.6,tg.foot-h); c.lineTo(tg.x+w,tg.foot); c.closePath(); c.fill(); c.stroke();
        c.fillStyle="rgba(255,255,255,.6)"; c.fillRect(tg.x-w*0.6,tg.foot-h*0.8,w*0.12,h*0.5); c.restore(); }
      if(t>=1100&&t<1260) for(let i=0;i<8;i++) SG.shard(c,tg.x+(atH(i)-0.5)*R*2*(1+(t-1100)/160),tg.foot-R*0.5*atH(i*3)-(t-1100)/160*R*0.6,R*0.08,t/50+i,"rgba(220,245,255,.9)"); }},
  /* Teep's Lid Toss: its lid spins off like a disc, clips the target and flies back on */
  lidtoss:{C:440,D:1100,
    atk:t=>({pose:t<180?"crouch":t<900?"push":"idle",sy:t<180?1-0.08*eo(t/180):1}),
    def:t=>SG.knock(t,440,1,14,320),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), a={x:s.x,y:s.top?s.top.y+4:s.y-s.r}, b={x:tg.x-d*R*0.2,y:tg.y-R*0.3}, col=x.col||[230,200,170];
      let k=t<160?0:t<440?eo((t-160)/280):t<900?1-eio((t-440)/460):0; if(k<=0) return; const p=lerpP(a,b,k,t<440?R*0.6:-R*0.6);
      c.save(); c.translate(p.x,p.y); c.scale(1,0.4+0.3*Math.abs(Math.sin(t/40))); c.fillStyle=atRgba(col,1); c.strokeStyle=atRgba(col.map(v=>v*0.6),1); c.lineWidth=2; c.beginPath(); c.arc(0,0,R*0.42,0,7); c.fill(); c.stroke();
      c.fillStyle=atRgba(col.map(v=>v*0.75),1); c.beginPath(); c.arc(0,0,R*0.12,0,7); c.fill(); c.restore(); c.strokeStyle="rgba(255,255,255,.5)"; c.lineWidth=2; c.beginPath(); c.arc(p.x,p.y,R*0.55,t/30,t/30+2); c.stroke();
      atImpact(t,440,0.25,0); if(t>=440&&t<700) atStar4(c,b.x,b.y,R*0.5*(1-(t-440)/260),"rgba(255,255,240,.95)"); }}
});
Object.assign(AR_KIND,{"Goo Spin":"goospin","Spin Crash":"spincrash","Rocket Glove":"rocketglove","Snap Shut":"snapshut","Rainbow":"rainbow","Burst Up":"burstup","Wing Storm":"wingstorm",
  "Dim Light":"dimlight","Firecracker":"firecracker","Fireworks":"fireworks","Iced Tea":"icedtea","Lid Toss":"lidtoss","Twister":"tornado"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  goospin:(d,t)=>{ dNoise(d,t,0.9,0.12,'lowpass',700); sTone(d,t,'sine',200,500,0.8,0.03); [0.42,0.57,0.72].forEach(x=>{ dNoise(d,t+x,0.1,0.22,'lowpass',500); sTone(d,t+x,'sine',400,160,0.1,0.06); }); },
  spincrash:(d,t)=>{ dNoise(d,t,0.6,0.12,'bandpass',900,0.6); sTone(d,t,'sawtooth',150,400,0.5,0.02); dKick(d,t+0.46,0.8); dNoise(d,t+0.46,0.25,0.2,'lowpass',400); },
  rocketglove:(d,t)=>{ dNoise(d,t+0.18,0.35,0.2,'bandpass',600,0.6); sTone(d,t+0.18,'sawtooth',120,300,0.3,0.03); dKick(d,t+0.48,0.9); dNoise(d,t+0.48,0.15,0.25,'bandpass',1800,1); },
  snapshut:(d,t)=>{ dNoise(d,t+0.2,0.24,0.12,'highpass',1500,0.7); dNoise(d,t+0.44,0.06,0.35,'bandpass',1200,1.5); dKick(d,t+0.44,0.3); for(let i=0;i<4;i++) sTone(d,t+0.55+i*0.1,'triangle',300,260,0.06,0.03); },
  rainbow:(d,t)=>{ [523,659,784,1047,1319].forEach((f,i)=>sTone(d,t+0.12+i*0.08,'sine',f,f,0.5,0.04)); dNoise(d,t+0.62,0.4,0.1,'highpass',5000,0.8); },
  burstup:(d,t)=>{ dNoise(d,t,0.3,0.15,'lowpass',400); dNoise(d,t+0.26,0.36,0.1,'lowpass',200); dKick(d,t+0.62,1); dNoise(d,t+0.62,0.5,0.3,'lowpass',500); },
  wingstorm:(d,t)=>{ for(let i=0;i<6;i++){ dNoise(d,t+0.28+i*0.105,0.07,0.18,'highpass',2500+i*200,1.5); dNoise(d,t+i*0.1,0.06,0.1,'bandpass',500,1); } },
  dimlight:(d,t)=>{ sTone(d,t,'sine',660,220,0.5,0.05); sTone(d,t+0.2,'sine',110,90,0.8,0.06); },
  firecracker:(d,t)=>{ dNoise(d,t+0.2,0.36,0.06,'highpass',4500,1); dKick(d,t+0.56,0.6); dNoise(d,t+0.56,0.2,0.4,'bandpass',2500,0.7); for(let i=0;i<5;i++) dNoise(d,t+0.6+i*0.05,0.02,0.1,'highpass',5000,2); },
  fireworks:(d,t)=>{ for(let j=0;j<5;j++){ sTone(d,t+j*0.13,'sine',400,1600,0.4,0.03); dNoise(d,t+j*0.13+0.52,0.3,0.2,'bandpass',1500+j*300,0.5); } },
  icedtea:(d,t)=>{ dNoise(d,t+0.18,0.5,0.12,'bandpass',900,1); sTone(d,t+0.5,'triangle',1800,2400,0.2,0.05); dNoise(d,t+0.5,0.3,0.12,'highpass',4000,1); },
  lidtoss:(d,t)=>{ sTone(d,t+0.16,'triangle',800,1200,0.25,0.04); sTone(d,t+0.44,'triangle',2200,1800,0.15,0.08); sTone(d,t+0.86,'triangle',1500,1000,0.08,0.05); }
});
if(typeof SWING!=="undefined") ["goospin","spincrash","wingstorm","snapshut"].forEach(k=>SWING.add(k));
/* family move kinds from the drafts: start */
Object.assign(AR_KIND,{"Absorb":"biggulp","Acid Beam":"beam","Acid Dart":"spear","Ambush Strike":"tackle","Ankle Kick":"kick","Antenna Spike":"spear","Arm Hammer":"hammer","Arm Knock":"punch","Bat Song":"chatter","Bell Toss":"boulder","Big Boo":"wave","Big Pinch":"vicegrip","Bitter Sap":"drool","Blinding Flash":"sunflare","Boulder Shove":"push","Bright Ray":"beam","Bubble Burst":"volley","Bubble Stream":"steam","Cable Whip":"lash","Candle Flame":"foxfire","Cap Smash":"hammer","Chime":"chatter","Claw Slice":"claw","Claw Swing":"lash","Coil Hop":"tackle","Cold Goo":"wave","Cold Swipe":"claw","Cork Shot":"toothshot","Corkscrew":"spear","Crane Kick":"highkick","Cross":"punch","Dirt Kick":"kick","Dissolve":"venomcoil","Dive Press":"talondive","Double Jab":"onetwo","Double Nip":"gnash","Double Pinch":"pinch","Double Prick":"onetwo","Double Scratch":"claw","Double Stomp":"stomp","Dread Cry":"wave","Drip Flick":"volley","Drizzle":"volley","Echo Burst":"chatter","Fang Pierce":"bite","Fang Stab":"bite","Flask Bump":"tackle","Flask Roll":"chargeram","Flying Kick":"highkick","Frost Spin":"sweep","Frost Tusk":"spear","Ghost Image":"foxfire","Glass Shard":"volley","Glow":"beam","Goo Barrage":"volley","Goo Block":"bellyflop","Goo Press":"bodyslam","Goo Shot":"drool","Goo Spike":"spear","Gunk Cannon":"boulder","Gust Cut":"lash","Hail Volley":"meteor","Handle Bash":"hammer","Head Bump":"tackle","Heel Drop":"stomp","Hook":"punch","Hop Kick":"highkick","Hot Pour":"potion","Hour Hand":"sweep","Ice Needle":"spear","Ice Pinch":"vicegrip","Ink Cannon":"volley","Ink Splat":"drool","Jab Barrage":"punchflurry5","Karate Chop":"claw","Kick Combo":"kickflurry","Lantern Fire":"foxfire","Laser Line":"beam","Leap Snip":"talondive","Leg Hop":"kick","Leg Rush":"stampede","Leg Slam":"stomp","Leg Spike":"spear","Lid Slam":"hammer","Light Ray":"beam","Lightning Rod":"pillar","Liver Shot":"punch","Long Jab":"punch","Mind Push":"push","Minute Hand":"spear","Mud Spit":"drool","Needle Burst":"volley","Night Cut":"nightbite","Overhead Smash":"hammer","Overheat":"sunflare","Pillar Press":"hammer","Pin Beam":"spear","Pincer Snip":"pinch","Pixel Shot":"volley","Poison Bite":"venomcoil","Pot Drop":"jawdrop","Rain Gust":"wave","Razor Thread":"lash","Rocket Arms":"punchflurry","Root Jab":"spear","Root Spike":"pillar","Root Whack":"tackle","Rope Drop":"jawdrop","Round Kick":"kick","Shell Butt":"tackle","Shell Roll":"rollbite","Shriek":"chatter","Silk Cannon":"web","Silk Spit":"drool","Sleep Mist":"steam","Snout Bump":"tackle","Soft Light":"potion","Spark Needle":"lightning","Spider Leap":"bodyslam","Spoke Stab":"spear","Spore Needle":"spear","Spore Shot":"toothshot","Spout Stab":"spear","Spring Punch":"punch","Squeeze":"vicegrip","Stomp Down":"stomp","Stone Fling":"boulder","Sucker Grip":"biggulp","Tea Party":"volley","Tentacle Frenzy":"punchflurry5","Tentacle Poke":"spear","Tentacle Slam":"hammer","Tentacle Whip":"lash","Thorn Smash":"hammer","Tide Slam":"hammer","Tiny Kick":"kick","Tip Dive":"talondive","Tip Flurry":"punchflurry","Tip Over":"bodyslam","Trash Talk":"chatter","Trunk Flurry":"punchflurry","Tunnel Slash":"claw","Tusk Thrust":"spear","Twin Wisps":"foxfire","Twirl":"sweep","Twister":"tornado","Venom Frenzy":"chompcombo","Water Blade":"claw","Water Dart":"spear","Water Jet":"beam","Water Spray":"wave","Wing Cut":"claw","Wing Whack":"lash"});
/* family move kinds from the drafts: end */

/* Gid's notes on groups 1 and 2 (16 Nov 2026): Sand Spray and Iced Tea read too small, Blinding Flash comes from the eye,
   Trunk Flurry, Tentacle Frenzy, Overhead Smash and Shriek needed their own clear effect, and Bell Toss threw a rock */
/* a tapered limb (trunk or tentacle) reaching from a to b; k is how far out it is (0 to 1), bend curls it */
MV.limb=(c,a,b,k,col,w,bend,suck)=>{ if(k<=0) return; const N=14, pts=[]; for(let j=0;j<=N;j++){ const q=j/N*k, x=a.x+(b.x-a.x)*q, y=a.y+(b.y-a.y)*q-Math.sin(q*Math.PI)*bend; pts.push([x,y]); }
  for(let pass=0;pass<2;pass++){ for(let j=0;j<N;j++){ const ww=w*(1-0.65*j/N)+(pass?0:3); c.strokeStyle=pass?atRgba(col,1):atRgba(col.map(v=>v*0.55),1); c.lineWidth=ww; c.lineCap="round"; c.beginPath(); c.moveTo(pts[j][0],pts[j][1]); c.lineTo(pts[j+1][0],pts[j+1][1]); c.stroke(); } }
  c.strokeStyle="rgba(255,255,255,.35)"; c.lineWidth=w*0.18; c.beginPath(); pts.forEach((p,j)=>c[j?"lineTo":"moveTo"](p[0],p[1]-w*0.25)); c.stroke();
  if(suck){ c.fillStyle=atRgba(col.map(v=>Math.min(255,v+70)),1); for(let j=2;j<N;j+=2){ c.beginPath(); c.ellipse(pts[j][0],pts[j][1]+w*0.2,w*0.16*(1-0.5*j/N),w*0.12*(1-0.5*j/N),0,0,7); c.fill(); } } };
MV.bell=(c,x,y,z,rot,a=1)=>{ c.save(); c.globalAlpha*=a; c.translate(x,y); c.rotate(rot); const g=c.createLinearGradient(-z,0,z,0); g.addColorStop(0,"#c98a1c"); g.addColorStop(0.45,"#ffe08a"); g.addColorStop(1,"#b0731a"); c.fillStyle=g; c.strokeStyle="#7a4c10"; c.lineWidth=2;
  c.beginPath(); c.moveTo(-z*0.35,-z*0.9); c.quadraticCurveTo(-z*0.45,-z*0.2,-z,z*0.55); c.lineTo(z,z*0.55); c.quadraticCurveTo(z*0.45,-z*0.2,z*0.35,-z*0.9); c.quadraticCurveTo(0,-z*1.1,-z*0.35,-z*0.9); c.closePath(); c.fill(); c.stroke();
  c.fillStyle="#7a4c10"; c.beginPath(); c.ellipse(0,z*0.55,z,z*0.18,0,0,7); c.fill(); c.fillStyle="#5a3a0e"; c.beginPath(); c.arc(0,z*0.72,z*0.18,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.6)"; c.fillRect(-z*0.5,-z*0.5,z*0.14,z*0.7);
  c.strokeStyle="#7a4c10"; c.lineWidth=2.5; c.beginPath(); c.arc(0,-z*1.05,z*0.2,Math.PI,0); c.stroke(); c.restore(); };
/* a limb flurry: n whips out from the body, each landing in turn with a slap mark */
function mvLimbFlurry(n,suck,gap=125){ const C=300, end=C+n*gap;
  return {C,D:end+340,contact:true,marks:true,
    atk:t=>({f:t<C?0.4*eo(t/C):t<end?0.4+0.03*Math.sin((t-C)/gap*Math.PI*2):0.4*(1-eio(Math.min(1,(t-end)/320))),pose:t<C?"determined":t<end?"attack":"idle",off:[t>C&&t<end?Math.sin(t/20)*2:0,0],sy:t>C&&t<end?1+0.04*Math.sin((t-C)/gap*Math.PI*2):1}),
    def(t){ if(t<C||t>end+80) return null; const p=((t-C)%gap)/gap; return {off:[(1-p)*7,0],pose:"hit",sx:1-0.06*(1-p)}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=(x.body||x.col||[200,120,150]);
      for(let j=0;j<n;j++){ const t0=C-170+j*gap, k=(t-t0)/300; if(k<0||k>1) continue; const ext=k<0.55?eo(k/0.55):1-eio((k-0.55)/0.45), yy=(j%3-1)*R*0.35, a={x:s.x+d*s.r*0.55,y:s.y+(j%2?-s.r*0.15:s.r*0.2)}, b={x:tg.x-d*R*0.1,y:tg.y-R*0.2+yy};
        MV.limb(c,a,b,ext,col,s.r*0.3,(j%2?1:-1)*R*0.6,suck);
        const hk=(k-0.5)/0.4; if(hk>=0&&hk<1){ c.strokeStyle=`rgba(255,255,255,${0.95*(1-hk)})`; c.lineWidth=3; for(let i=0;i<6;i++){ const an=i/6*Math.PI*2+j; c.beginPath(); c.moveTo(b.x+Math.cos(an)*R*0.2,b.y+Math.sin(an)*R*0.2); c.lineTo(b.x+Math.cos(an)*R*(0.35+0.4*hk),b.y+Math.sin(an)*R*(0.35+0.4*hk)); c.stroke(); } atGlowA(c,b.x,b.y,R*0.5*(1-hk),[255,250,220],0.7); } } }}; }
Object.assign(ANIM,{
  trunkflurry:mvLimbFlurry(4,false,135),
  tentaclefrenzy:mvLimbFlurry(5,true,110),
  /* Sand Spray, bigger: it scoops twice, then a thick fan of sand blasts across and a cloud of grit hangs over the target */
  sandspray:{C:500,D:1180,
    atk:t=>t<300?{sy:1-0.14*eo(t/300),sx:1+0.08*eo(t/300),pose:"crouch",f:-0.04*eo(t/300),off:[Math.sin(t/25)*2,0]}:t<460?{pose:"push",sy:1.06,arc:-6}:{pose:t<950?"push":"idle"},
    def:t=>t>=500&&t<1160?{off:[Math.sin(t/14)*3.5,0],pose:"hurt",sy:1-0.05*Math.sin(t/30)}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), SAND=[226,196,132], o={x:s.x+d*s.r*0.5,y:s.foot-s.r*0.35};
      if(t<320) for(let i=0;i<6;i++){ const ph=((t/110)+i/6)%1; SG.puff(c,s.x+d*s.r*(0.2+0.5*ph)+(i%2?6:-6),s.foot-ph*s.r*0.5,s.r*(0.12+0.12*ph),0.8*(1-ph),SAND); }
      if(t>=280&&t<820){ const k=Math.min(1,(t-280)/260); c.fillStyle=atRgba(SAND,0.45*(t<700?1:1-(t-700)/120)); c.beginPath(); c.moveTo(o.x,o.y); c.lineTo(tg.x+d*R*0.4,tg.y-R*(1.1)*k); c.lineTo(tg.x+d*R*0.4,tg.y+R*0.6*k); c.closePath(); c.fill(); }
      if(t>=280&&t<950) for(let i=0;i<110;i++){ const st=280+atH(i)*200, k=(t-st)/(380+atH(i*3)*200); if(k<0||k>1) continue;
        const ex=tg.x+(atH(i*5)-0.3)*R*1.8*d, ey=tg.y-R*0.3+(atH(i*7)-0.5)*R*1.8, p=lerpP(o,{x:ex,y:ey},eo(k),R*(0.2+atH(i)*0.8)), z=3.5+atH(i*11)*4.5;
        c.fillStyle=atRgba(SAND.map(v=>v-(i%4)*22),1-k*0.3); c.beginPath(); c.arc(p.x,p.y,z,0,7); c.fill(); }
      if(t>=480&&t<1180){ const k=(t-480)/700, a=k<0.6?1:1-(k-0.6)/0.4; for(let i=0;i<7;i++){ const an=i/7*Math.PI*2+k*2; SG.puff(c,tg.x+Math.cos(an)*R*(0.3+0.6*k),tg.y-R*0.4+Math.sin(an)*R*0.45,R*(0.42+0.25*k),0.9*a,SAND); }
        for(let i=0;i<3;i++){ const ph=((t/260)+i/3)%1; atStar4(c,tg.x+(i-1)*R*0.45,tg.y-R*(0.9+0.4*ph),R*0.14*(1-ph),"rgba(255,250,220,.9)"); } }
      atImpact(t,500,0.2,0); }},
  /* Blinding Flash: the eye glows brighter and brighter, then lets off a flash that whites out the target */
  blindingflash:{C:600,D:1240,
    atk:t=>({pose:t<600?"determined":t<1000?"cast":"idle",sy:t<600?1+0.05*eo(t/600):1,flash:t>=540&&t<620?3:0}),
    def:t=>t>=600&&t<1220?{off:[Math.sin(t/16)*2.5,0],pose:"hurt",flash:t<760?3:Math.floor(t/90)%2?2:0}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), e={x:s.x+d*s.r*0.1,y:s.y-s.r*0.15};
      c.save(); c.globalCompositeOperation="lighter";
      if(t<640){ const k=t/600; atGlowA(c,e.x,e.y,s.r*(0.35+0.9*ei(k)),[255,250,200],0.5+0.5*k); atGlowA(c,e.x,e.y,s.r*0.3,[255,255,255],0.4+0.6*k);
        for(let i=0;i<10;i++){ const an=i/10*Math.PI*2+t/300, L=s.r*(0.5+1.4*ei(k)); c.strokeStyle=`rgba(255,250,210,${0.6*k})`; c.lineWidth=2; c.beginPath(); c.moveTo(e.x+Math.cos(an)*s.r*0.3,e.y+Math.sin(an)*s.r*0.3); c.lineTo(e.x+Math.cos(an)*L,e.y+Math.sin(an)*L); c.stroke(); }
        for(let i=0;i<8;i++){ const ph=((t/260)+i/8)%1, an=i*0.8; const px=e.x+Math.cos(an)*s.r*1.5*(1-ph), py=e.y+Math.sin(an)*s.r*1.5*(1-ph); c.fillStyle=`rgba(255,250,220,${ph})`; c.beginPath(); c.arc(px,py,2.5,0,7); c.fill(); } }
      if(t>=580&&t<900){ const k=(t-580)/320, a=1-k; c.fillStyle=`rgba(255,252,230,${0.75*a})`; c.beginPath(); c.moveTo(e.x,e.y-s.r*0.15); c.lineTo(tg.x+d*R*0.4,tg.y-R*(1.2+k)); c.lineTo(tg.x+d*R*0.4,tg.y+R*(0.6+k)); c.lineTo(e.x,e.y+s.r*0.15); c.closePath(); c.fill();
        atGlowA(c,e.x,e.y,s.r*(1.2+2*k),[255,255,240],a); atGlowA(c,tg.x,tg.y-R*0.3,R*(1+1.5*k),[255,255,230],0.9*a); }
      c.restore(); atImpact(t,600,0.35,0.9);
      if(t>=700&&t<1240){ const k=(t-700)/540; for(let i=0;i<4;i++){ const an=t/200+i*Math.PI/2; atStar4(c,tg.x+Math.cos(an)*R*0.6,tg.y-R*1.0+Math.sin(an)*R*0.2,R*0.16*(1-k*0.5),"#fff6b0"); } } }},
  /* Overhead Smash: a running leap with both arms up, then it brings them down on the target and the ground splits */
  overheadsmash:{C:600,D:1260,contact:true,marks:true,
    atk:t=>{ if(t<200) return {f:0.25*eo(t/200),pose:"crouch",sy:1-0.12*eo(t/200)}; if(t<600){ const k=(t-200)/400; return {f:0.25+0.45*eo(k),arc:-60*Math.sin(k*Math.PI*0.85),pose:k<0.6?"slamup":"punch",sy:1+0.1*Math.sin(k*Math.PI),sx:1-0.06*Math.sin(k*Math.PI)}; }
      if(t<760) return {f:0.7,pose:"punch",sy:0.86,sx:1.12}; const k=(t-760)/500; return {f:0.7*(1-eio(k)),pose:"idle"}; },
    def:t=>SG.squash(t,600,0.5,560),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r;
      if(t>=300&&t<600){ const k=(t-300)/300; c.strokeStyle=`rgba(255,255,255,${0.7*k})`; c.lineWidth=3; for(let i=0;i<4;i++){ const xx=tg.x+(i-1.5)*R*0.4; c.beginPath(); c.moveTo(xx,tg.top.y-R*(1.6-0.6*k)); c.lineTo(xx,tg.top.y-R*(0.9-0.6*k)); c.stroke(); } }
      atImpact(t,600,0.7,0.2);
      if(t>=600){ const k=(t-600)/660; SG.ring(c,tg.x,tg.foot,R*(0.6+2.2*eo(k)),R*(0.18+0.5*eo(k)),[255,240,200],6*(1-k),1-k); SG.cracks(c,tg.x,tg.foot,R*1.8,8,5,1-k*0.8); SG.dust(c,tg.x,tg.foot,R*1.3,k,12);
        for(let i=0;i<10;i++){ const a=-Math.PI*(0.1+0.8*atH(i*3)), sp=R*(0.5+1.8*eo(k)); SG.shard(c,tg.x+Math.cos(a)*sp,tg.foot+Math.sin(a)*sp*0.7+k*k*R*1.6,R*0.08,t/70+i,"#b8a080"); }
        atPow(c,{x:tg.x,y:tg.y-R*1.0},Math.min(1,k*1.5),R/20); } }},
  /* Shriek: its mouth stretches wide and jagged rings of sound tear across to the target, which rattles */
  shriek:{C:420,D:1100,
    atk:t=>({pose:t<900?"bitewide":"idle",sx:t<900?1+0.06*Math.sin(t/18):1,sy:t<900?1+0.1*Math.min(1,t/200):1,off:[t<900?Math.sin(t/9)*1.5:0,0]}),
    def:t=>t>=420&&t<1080?{off:[Math.sin(t/7)*4,0],pose:"hurt",sx:1+0.05*Math.sin(t/11),sy:1-0.05*Math.sin(t/11)}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), m={x:s.x+d*s.r*0.6,y:s.y}, L=Math.abs(tg.x-m.x);
      for(let i=0;i<7;i++){ const k=(t-40-i*100)/460; if(k<0||k>1) continue; const px=m.x+d*L*eo(k), rr=s.r*(0.4+1.1*k);
        c.strokeStyle=`rgba(230,215,255,${0.95*(1-k)})`; c.lineWidth=4*(1-k)+1.5; c.beginPath();
        for(let j=0;j<=16;j++){ const q=-1+j/8, w=j%2?0.8:1.05; c.lineTo(px+d*Math.cos(q)*rr*0.45*w,s.y+Math.sin(q)*rr*w); } c.stroke(); }
      if(t<900) for(let i=0;i<3;i++){ const ph=((t/120)+i/3)%1; c.strokeStyle=`rgba(255,255,255,${0.8*(1-ph)})`; c.lineWidth=2; c.beginPath(); c.moveTo(m.x+d*s.r*0.2,m.y-s.r*(0.5+ph*0.4)); c.lineTo(m.x+d*s.r*(0.5+ph*0.4),m.y-s.r*(0.8+ph*0.5)); c.stroke(); }
      if(t>=420&&t<1100){ const k=(t-420)/680; for(let i=0;i<6;i++){ const an=i/6*Math.PI*2; c.strokeStyle=`rgba(200,170,255,${0.8*(1-k)})`; c.lineWidth=2.5; c.beginPath(); c.moveTo(tg.x+Math.cos(an)*R*0.7,tg.y-R*0.3+Math.sin(an)*R*0.7); for(let j=1;j<=3;j++) c.lineTo(tg.x+Math.cos(an+(j%2?0.12:-0.12))*R*(0.7+0.2*j+0.4*k),tg.y-R*0.3+Math.sin(an+(j%2?0.12:-0.12))*R*(0.7+0.2*j+0.4*k)); c.stroke(); } }
      atImpact(t,420,0.3,0); }},
  /* Bell Toss: it swings a big brass bell overhead and throws it; the bell lands with a clang and rings */
  belltoss:{C:600,D:1280,
    atk:t=>({pose:t<260?"slamup":t<420?"push":t<1000?"push":"idle",sy:t<260?1-0.06*eo(t/260):1,arc:t>260&&t<420?-6:0}),
    def:t=>{ const a=SG.squash(t,600,0.35,420); if(a) a.off=[Math.sin(t/10)*3,0]; return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, a={x:s.x,y:s.top?s.top.y-R*0.2:s.y-s.r*1.2}, b={x:tg.x,y:tg.top.y-R*0.3};
      if(t<300) MV.bell(c,s.x+Math.sin(t/60)*s.r*0.3,a.y,R*0.72,Math.sin(t/60)*0.5);
      else if(t<600){ const k=(t-300)/300, p=lerpP(a,b,eo(k),R*0.9); MV.bell(c,p.x,p.y,R*0.72,t/90); }
      else if(t<1240){ const k=(t-600)/640; MV.bell(c,b.x,b.y-R*0.6*Math.sin(Math.min(1,k*2)*Math.PI)*(k<0.5?1:0)+(k>0.5?R*0.4*eo((k-0.5)/0.5):0),R*0.72,Math.sin(t/30)*0.4*(1-k),1-Math.max(0,k-0.8)/0.2);
        for(let i=0;i<3;i++){ const q=(k*1.6-i*0.22); if(q<0||q>1) continue; SG.ring(c,b.x,b.y,R*(0.7+2*q),R*(0.4+1.1*q),[255,226,140],5*(1-q),1-q); }
        for(let i=0;i<2;i++){ const ph=((t/400)+i/2)%1; SG.note(c,b.x+(i?1:-1)*R*(0.6+ph*0.4),b.y-R*(0.3+ph*0.8),R*0.3,[255,226,140],1-ph); } }
      atImpact(t,600,0.35,0); }},
  /* Iced Tea, bigger: a thick stream of tea arcs over, frosting as it falls; ice spikes shoot up round the target and lock it in a block */
  icedtea:{C:600,D:1280,
    atk:(t,o)=>({pose:t<1040?"push":"idle",rot:Math.max(0,t<1040?Math.min(1,t/260):1-(t-1040)/220)*0.45*((o&&o.dir)||1),f:0}),
    def:t=>t>=600&&t<1240?{off:[Math.sin(t/12)*1.5,0],pose:"hurt",sx:1.02,sy:0.98,flash:t<700?2:0}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), T=[196,132,70], I=[190,235,255], a={x:s.x+d*s.r*0.95,y:s.y-s.r*0.35}, b={x:tg.x,y:tg.y-R*0.5};
      if(t>=160&&t<820){ const k=Math.min(1,(t-160)/320), end=t>660?(t-660)/160:0;
        for(let pass=0;pass<2;pass++){ c.strokeStyle=pass?"rgba(255,235,200,.5)":atRgba(T,0.95); c.lineWidth=pass?R*0.07:R*0.26; c.lineCap="round"; c.beginPath();
          for(let i=0;i<=20;i++){ const q=end+(k-end)*i/20, p=lerpP(a,b,q,R*1.4); c[i?"lineTo":"moveTo"](p.x,p.y+Math.sin(i*0.9+t/35)*2-(pass?R*0.06:0)); } c.stroke(); }
        for(let i=0;i<14;i++){ const q=(i/14)*k, p=lerpP(a,b,q,R*1.4); if(q<0.35) SG.puff(c,p.x,p.y-R*0.25-Math.sin(t/100+i)*4,R*0.14,0.3,[255,255,255]); else { const fz=(q-0.35)/0.65; c.fillStyle=atRgba(I,0.9*fz); c.beginPath(); c.arc(p.x+(atH(i)-0.5)*R*0.4,p.y+(atH(i*3)-0.5)*R*0.4,2+fz*2,0,7); c.fill(); if(i%3===0) atStar4(c,p.x,p.y-R*0.2,R*0.1*fz,"rgba(230,248,255,.95)"); } } }
      if(t>=520&&t<1280){ const k=Math.min(1,(t-520)/160), a2=t<1120?1:1-(t-1120)/160;
        c.save(); c.globalAlpha*=a2; SG.fog(c,tg.x,tg.foot-R*0.2,R*2.2,[200,236,255],0.35);
        for(let i=0;i<7;i++){ const xx=tg.x+(i-3)*R*0.38, h=R*(0.5+0.9*atH(i*5))*eo(Math.min(1,(t-520-i*20)/150)); if(h<=0) continue; c.fillStyle=atRgba(I,0.85); c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=1.5;
          c.beginPath(); c.moveTo(xx-R*0.16,tg.foot+2); c.lineTo(xx+(atH(i)-0.5)*R*0.2,tg.foot-h); c.lineTo(xx+R*0.16,tg.foot+2); c.closePath(); c.fill(); c.stroke(); }
        const w=R*1.15, h=R*1.25*k; c.fillStyle=atRgba(I,0.45); c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=2.5; c.beginPath(); c.moveTo(tg.x-w,tg.foot); c.lineTo(tg.x-w*0.95,tg.foot-h*0.85); c.lineTo(tg.x-w*0.3,tg.foot-h*1.1); c.lineTo(tg.x+w*0.5,tg.foot-h*0.95); c.lineTo(tg.x+w,tg.foot-h*0.7); c.lineTo(tg.x+w,tg.foot); c.closePath(); c.fill(); c.stroke();
        c.fillStyle="rgba(255,255,255,.7)"; c.fillRect(tg.x-w*0.7,tg.foot-h*0.85,w*0.14,h*0.6); c.fillRect(tg.x-w*0.45,tg.foot-h*0.75,w*0.06,h*0.35);
        for(let i=0;i<4;i++){ const an=t/300+i*1.6; atStar4(c,tg.x+Math.cos(an)*w*0.7,tg.foot-h*0.5+Math.sin(an)*h*0.4,R*0.14,"rgba(255,255,255,.95)"); } c.restore(); }
      if(t>=1120&&t<1280) for(let i=0;i<10;i++) SG.shard(c,tg.x+(atH(i)-0.5)*R*2.2*(1+(t-1120)/160),tg.foot-R*0.8*atH(i*3)-(t-1120)/160*R*0.8,R*0.1,t/50+i,"rgba(220,245,255,.9)");
      atImpact(t,600,0.3,0.15); }}
});
Object.assign(AR_KIND,{"Trunk Flurry":"trunkflurry","Tentacle Frenzy":"tentaclefrenzy","Blinding Flash":"blindingflash","Overhead Smash":"overheadsmash","Shriek":"shriek","Bell Toss":"belltoss"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  trunkflurry:(d,t)=>{ for(let i=0;i<4;i++){ dNoise(d,t+0.13+i*0.135,0.08,0.12,'bandpass',600,1); dNoise(d,t+0.3+i*0.135,0.06,0.25,'bandpass',1400,1.2); dKick(d,t+0.3+i*0.135,0.2); } },
  tentaclefrenzy:(d,t)=>{ for(let i=0;i<5;i++){ dNoise(d,t+0.13+i*0.11,0.06,0.1,'bandpass',800,1); dNoise(d,t+0.3+i*0.11,0.06,0.25,'lowpass',1200); sTone(d,t+0.3+i*0.11,'sine',300,150,0.05,0.05); } },
  sandspray:(d,t)=>{ dNoise(d,t+0.02,0.3,0.15,'lowpass',700); dNoise(d,t+0.28,0.7,0.26,'highpass',2200,0.5); dNoise(d,t+0.5,0.5,0.1,'bandpass',4000,0.6); },
  blindingflash:(d,t)=>{ sTone(d,t,'sine',300,1800,0.6,0.05); sTone(d,t+0.1,'triangle',600,2400,0.5,0.03); dNoise(d,t+0.6,0.4,0.3,'highpass',3000,0.5); sTone(d,t+0.6,'sine',2600,2000,0.4,0.06); },
  overheadsmash:(d,t)=>{ sTone(d,t+0.2,'sine',250,700,0.35,0.05); dKick(d,t+0.6,1); dNoise(d,t+0.6,0.5,0.3,'lowpass',400); dNoise(d,t+0.62,0.3,0.15,'bandpass',1200,0.8); },
  shriek:(d,t)=>{ sTone(d,t+0.02,'sawtooth',900,1600,0.8,0.05); sTone(d,t+0.04,'square',1300,2100,0.75,0.025); dNoise(d,t+0.02,0.8,0.08,'highpass',5000,0.5); },
  belltoss:(d,t)=>{ dNoise(d,t+0.26,0.25,0.1,'bandpass',800,1); [0,0.02].forEach(o=>{ sTone(d,t+0.6+o,'triangle',880,880,1.0,0.12); sTone(d,t+0.6+o,'sine',1320,1310,1.0,0.06); sTone(d,t+0.6+o,'sine',2210,2200,0.6,0.03); }); dKick(d,t+0.6,0.3); },
  icedtea:(d,t)=>{ dNoise(d,t+0.16,0.55,0.16,'bandpass',800,0.9); sTone(d,t+0.5,'triangle',1800,2600,0.25,0.06); dNoise(d,t+0.52,0.35,0.16,'highpass',4500,0.8); for(let i=0;i<6;i++) sTone(d,t+0.52+i*0.03,'triangle',2400+i*200,2600+i*200,0.08,0.03); dNoise(d,t+1.12,0.16,0.2,'highpass',3500,1); }
});
if(typeof SWING!=="undefined") ["trunkflurry","tentaclefrenzy","overheadsmash"].forEach(k=>SWING.add(k));
