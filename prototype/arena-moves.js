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
