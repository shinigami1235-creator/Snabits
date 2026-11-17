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
MV.nip=(c,x,y,z,k,col)=>{ if(k<0.3||k>1) return; chompMarks(c,{x,y},(k-0.3)/0.7); };   // the bite comes from its own mouth; this only marks where it lands
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
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), a={x:s.x+d*s.r*0.6,y:s.y}, b={x:tg.x,y:tg.y-R*0.4}, nm=x.name||"", G=/Ink/.test(nm)?[36,26,52]:/Silk|Web/.test(nm)?[240,240,245]:/Goo|Slime|Gloop/.test(nm)?(x.body||[120,200,120]):/Mud/.test(nm)?[120,90,60]:[176,112,226];   // 17 Nov 2026 audit: goo is its own colour, ink is black, silk is white
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
      if(t<720){ const k=(t-460)/260; return {f:0.35+0.4*eo(k),arc:-260*(1-ei(k)),rot:((o&&o.dir)||1)*0.3,sy:1.12+0.3*k,sx:0.92+0.4*k,pose:"bitewide"}; }
      if(t<880) return {f:0.75,pose:"chomp",sx:1.3,sy:1.05};
      const k=(t-880)/500; return {f:0.75*(1-eio(k)),arc:-22*Math.sin(Math.min(1,k)*Math.PI),pose:"idle"}; },
    def:t=>SG.squash(t,720,0.4,520),
    fx(c,t,x){ const tg=x.target, R=tg.r, col=mvCol(x);
      if(t>460&&t<720){ const k=(t-460)/260; c.fillStyle=`rgba(0,0,0,${0.25*k})`; c.beginPath(); c.ellipse(tg.x,tg.foot+2,R*(0.5+0.6*k),R*0.18,0,0,7); c.fill();
        c.strokeStyle=`rgba(255,255,255,${0.5*k})`; c.lineWidth=2; for(let i=0;i<4;i++){ const xx=tg.x+(i-1.5)*R*0.3; c.beginPath(); c.moveTo(xx,tg.top.y-R*(2.2-1.2*k)); c.lineTo(xx,tg.top.y-R*(1.4-1.0*k)); c.stroke(); } }
      if(t>=720&&t<1000) chompMarks(c,{x:tg.x,y:tg.y-R*0.1},(t-720)/280);
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
    atk:(t,o)=>{ if(t<480){ const j=Math.floor(t/160), p=(t%160)/160, d=(o&&o.dir)||1; return {f:0.25+j*0.17+0.08*Math.sin(p*Math.PI),arc:-8*Math.sin(p*Math.PI),rot:d*(p<0.5?-0.12:0.22),pose:p<0.5?"bitewide":"chomp"}; }
      if(t<760){ const k=(t-480)/280; return {f:0.6+0.15*eo(k),arc:-48*Math.sin(k*Math.PI),rot:-0.25*eo(k)*((o&&o.dir)||1),pose:"bitewide"}; }
      if(t<940) return {f:0.75,pose:"chomp",rot:0.32*((o&&o.dir)||1),sx:1.06,sy:0.96,off:[Math.sin(t/14)*2,0]};
      const k=(t-940)/500; return {f:0.75*(1-eio(k)),arc:-20*Math.sin(Math.min(1,k)*Math.PI),pose:"happy"}; },
    def(t){ if(t>=120&&t<480){ const p=(t%160)/160; return {off:[(1-p)*5,0],pose:"hit"}; } return SG.squash(t,760,0.35,560); },
    fx(c,t,x){ const tg=x.target, R=tg.r, col=mvCol(x);
      for(let j=0;j<3;j++) MV.nip(c,tg.x+(j-1)*R*0.35,tg.y+(j%2?-1:1)*R*0.2,R*0.5,(t-80-j*160)/240,col);
      if(t>=760&&t<1040) chompMarks(c,{x:tg.x,y:tg.y-R*0.05},(t-760)/280);
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
MV.fist=(c,x,y,z,d,col=[154,163,173])=>{ c.save(); c.translate(x,y); c.scale(d,1); c.fillStyle=atRgba(col,1); c.strokeStyle=atRgba(col.map(v=>v*0.5),1); c.lineWidth=2; c.beginPath(); c.roundRect(-z*0.7,-z*0.6,z*1.4,z*1.2,z*0.3); c.fill(); c.stroke();
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
      MV.fist(c,px,py,s.r*0.32,d,x.parts||undefined); atImpact(t,380,0.25,0); if(t>=380&&t<700) atPow(c,{x:b.x,y:b.y-tg.r*0.5},(t-380)/320,tg.r/30); }},
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
        atGlowA(c,px-d*s.r*0.35,a.y,s.r*0.3,[255,170,60],0.8); MV.glove(c,px,a.y,s.r*0.34,d,x.parts||x.body||[220,60,60]); }
      if(t>=480&&t<1000){ const k=(t-480)/520; MV.glove(c,b.x-d*tg.r*0.8*eo(k),b.y-tg.r*1.2*Math.sin(k*Math.PI),s.r*0.34,d,x.parts||x.body||[220,60,60]); atPow(c,{x:b.x,y:b.y-tg.r*0.4},Math.min(1,k*1.4),tg.r/24); }
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
Object.assign(AR_KIND,{"Absorb":"biggulp","Acid Beam":"beam","Acid Dart":"spear","Acid Drip":"drool","Air Blade":"beam","Air Puff":"wave","Air Slice":"gust","Ambush Strike":"tackle","Ankle Kick":"kick","Antenna Spike":"spear","Anvil Drop":"overheadsmash","Arm Hammer":"hammer","Arm Knock":"punch","Arm Smash":"lash","Arm Whip":"lash","Ash Cloud":"sandspray","Axe Storm":"punchflurry5","Axe Throw":"sawthrow","Back Kick":"kick","Bad Dream":"wave","Ball Barrage":"volley","Ball Drop":"bellyflop","Ballast Drop":"hammer","Bass Boom":"trumpet","Bass Drop":"chatter","Bat Dive":"talondive","Bat Song":"chatter","Beak Barrage":"nibble","Beak Dive":"talondive","Beak Peck":"nibble","Beak Spear":"spear","Bell Slam":"bellyflop","Bell Toss":"boulder","Bellow":"trumpet","Belly Barrage":"bopbarrage","Belly Press":"bodyslam","Belly Roll":"bigroll","Big Bell":"bodyslam","Big Bite":"jawlock","Big Blob":"drool","Big Boo":"wave","Big Hook":"overheadsmash","Big Pinch":"vicegrip","Big Roll":"rollbite","Big Stomp":"stomp","Big Swat":"lash","Big Wave":"wave","Bitter Sap":"drool","Black Smoke":"steam","Blessed Trample":"stampede","Blinding Flash":"sunflare","Blizzard":"wave","Blood Drain":"biggulp","Blossom Blast":"meteor","Body Coil":"venomcoil","Bolt Missile":"spear","Book Rush":"chargeram","Boulder Barrage":"volley","Boulder Shove":"push","Boulder Toss":"boulder","Bounce Kick":"kick","Breeze Cut":"gust","Bright Ray":"beam","Brim Spin":"spincrash","Bubble Barrage":"volley","Bubble Bump":"tackle","Bubble Burst":"volley","Bubble Jet":"beam","Bubble Over":"wave","Bubble Stream":"steam","Bubble Trap":"web","Burning Roll":"edgeroll","Cable Whip":"lash","Cake Drop":"jawdrop","Cake Roll":"bigroll","Candle Flame":"foxfire","Candle Ray":"beam","Candle Slam":"overheadsmash","Candy Roll":"rollbump","Candy Storm":"volley","Cap Smash":"hammer","Cape Flick":"lash","Card Fan":"volley","Card Slice":"spear","Card Storm":"volley","Chemical Spray":"steam","Cherry Pit":"volley","Cherry Shower":"volley","Chime":"chatter","Chip Paint":"drool","Choking Smoke":"inkfog","Cinder Dart":"spear","Circle Back":"talondive","Clang":"hammer","Clank Combo":"onetwo","Claw Crush":"overheadsmash","Claw Slice":"claw","Claw Smash":"overheadsmash","Claw Swing":"lash","Club Swing":"hammer","Coffin Bash":"hammer","Coil Crush":"venomcoil","Coil Hop":"tackle","Coil Spin":"jetspin","Coin Flick":"coinflick","Coin Roll":"rollbump","Coin Shower":"volley","Coin Slice":"spear","Cold Draft":"wave","Cold Goo":"wave","Cold Jet":"beam","Cold Swipe":"claw","Colour Beam":"rainbow","Comb Slash":"claw","Cone Lunge":"tackle","Cone Thrust":"spear","Cork Shot":"toothshot","Corkscrew":"spear","Cover Slap":"punch","Crane Kick":"highkick","Crank Smash":"bodyslam","Crawl Over":"bodyslam","Cross":"punch","Cross Punch":"onetwo","Crumb Flick":"volley","Crust Chop":"axekick","Crust Jab":"spear","Crystal Dart":"spear","Cursed Bite":"nightbite","Dance Combo":"kickflurry","Dash Chop":"sweep","Dazzle":"flash","Deep Bite":"bite","Deep Roll":"chargeram","Deep Swirl":"wave","Dirt Kick":"kick","Dissolve":"venomcoil","Dive Crash":"talondive","Dive Flop":"bellyflop","Dive Press":"talondive","Dive Roll":"tackle","Dizzy Spin":"wave","Double Bonk":"onetwo","Double Bop":"nibble","Double Bump":"bopbarrage","Double Cling":"web","Double Clink":"onetwo","Double Fist":"onetwo","Double Flick":"lash","Double Jab":"onetwo","Double Nip":"gnash","Double Pinch":"pinch","Double Poke":"skewerpoke","Double Prick":"onetwo","Double Scratch":"claw","Double Slice":"claw","Double Smash":"onetwo","Double Snap":"snapshot2","Double Stomp":"stomp","Double Whip":"lash","Double Wobble":"kickflurry","Drag Under":"dragunder","Dread Cry":"wave","Dread Stare":"flash","Dream Drain":"biggulp","Dream Puff":"volley","Dream Waltz":"lullaby","Drench":"wave","Drip Flick":"volley","Drizzle":"volley","Drowsy Hum":"lullaby","Drum Roll":"punchflurry","Dust Jet":"gust","Dust Kick":"kick","Dust Storm":"tornado","Dust Whirl":"sandspray","Earth Stomp":"stomp","Echo Burst":"chatter","Edge Chop":"hammer","Fade Out":"inkfog","Fan Slash":"gust","Fang Leap":"jawdrop","Fang Pierce":"bite","Fang Rip":"bite","Fang Stab":"bite","Fang Strike":"bite","Feather Dart":"volley","Feather Slash":"wingstorm","Feeler Tickle":"nibble","Fire Dance":"flash","Fire Dash":"chargeram","Fire Pillar":"pillar","Fire Pounce":"bodyslam","Fireball":"meteor","Fireball Volley":"volley","Firefly Storm":"wingstorm","Fist Barrage":"punchflurry5","Fist Launch":"rocketglove","Flame Ball":"foxfire","Flame Breath":"beam","Flame Lance":"hornjab","Flame Stream":"beam","Flame Wall":"pillar","Flap Dance":"wave","Flash Bolt":"lightning","Flash Fire":"flash","Flask Bump":"tackle","Flask Roll":"chargeram","Flint Kick":"kick","Flop Down":"bellyflop","Fluff Storm":"avalanche","Flying Fist":"rocketglove","Flying Kick":"highkick","Foam Bump":"bodyslam","Foam Rush":"chargeram","Foam Smother":"web","Foam Spray":"steam","Fog Roll":"tackle","Fog Trick":"inkfog","Foot Slam":"stomp","Forest Curse":"inkfog","Freeze Frame":"freezeframe","Freezer Burn":"wave","Frost Spin":"sweep","Frost Tusk":"spear","Gear Grind":"sawthrow","Gear Throw":"boulder","Genie Beam":"beam","Ghost Flame":"foxfire","Ghost Image":"foxfire","Glass Shard":"volley","Glide Strike":"talondive","Glow":"beam","Glow Ray":"beam","Glow Wing":"wingstorm","Gold Bite":"bite","Gold Drop":"bellyflop","Goo Barrage":"volley","Goo Block":"bellyflop","Goo Press":"bodyslam","Goo Shot":"drool","Goo Spike":"spear","Gravel Storm":"avalanche","Grill Flame":"foxfire","Grit Blast":"sandspray","Grit Cloud":"sandspray","Grit Storm":"sandspray","Ground Shake":"avalanche","Ground Shock":"rockpath","Gum Trap":"web","Gum Volley":"volley","Gumball Barrage":"volley","Gumball Cannon":"beam","Gumball Roll":"tackle","Gunk Cannon":"boulder","Gust Cut":"lash","Hail Shower":"icefall","Hail Storm":"avalanche","Hail Volley":"meteor","Handle Bash":"hammer","Hard Bite":"bite","Hard Candy":"boulder","Hat Bonk":"tackle","Hat Slam":"stomp","Haunted Tune":"nightbite","Hawk Cry":"chatter","Head Bump":"tackle","Head Charge":"chargeram","Head Smash":"overheadsmash","Heat Haze":"steam","Heat Shimmer":"flash","Heavy Foot":"stomp","Heavy Roll":"chargeram","Heavy Shower":"pillar","Heavy Stomp":"stomp","Heel Drop":"stomp","Heel Slam":"axekick","Heel Stomp":"stomp","Holy Glow":"flash","Hoof Combo":"kickflurry","Hoof Dust":"sandspray","Hoof Rush":"legflurry","Hoof Smash":"stomp","Hoof Storm":"legflurry","Hook":"punch","Hop Kick":"highkick","Hop Press":"stomp","Horn Flurry":"hornjab","Horn Glow":"flash","Horn Slash":"hornjab","Hot Foot":"stomp","Hot Gravel":"steam","Hot Pour":"potion","Hot Stomp":"stomp","Hot Syrup":"drool","Hot Wire":"lash","Hound Rush":"tackle","Hour Hand":"sweep","Hull Smash":"bodyslam","Hum":"chatter","Hundred Flings":"kickflurry","Hurricane Kick":"kickflurry","Ice Needle":"spear","Ice Pinch":"vicegrip","Ice Shards":"spear","Icicle Drop":"spear","Ink Cannon":"volley","Ink Needle":"volley","Ink Splat":"drool","Ink Spray":"steam","Iron Press":"hammer","Jab Barrage":"punchflurry5","Jaw Snap":"gnash","Jelly Press":"bodyslam","Jet Jab":"thrust","Karate Chop":"claw","Kick Combo":"kickflurry","Lantern Fire":"foxfire","Laser Line":"beam","Last Flash":"blindingflash","Lava Bomb":"boulder","Lava Flow":"rockpath","Lava Quake":"pillar","Lava Stomp":"stomp","Leaf Cut":"petalswirl","Leaf Cutter":"sawthrow","Leaf Flurry":"volley","Leaf Parade":"petalswirl","Leaf Snip":"petalswirl","Leaf Swirl":"petalswirl","Leaf Whirl":"spincrash","Leap Lance":"hornjab","Leap Snip":"talondive","Leaping Gore":"hornjab","Leg Hop":"kick","Leg Rush":"stampede","Leg Slam":"stomp","Leg Spike":"spear","Lens Beam":"beam","Lens Clamp":"vicegrip","Lid Slam":"hammer","Life Drain":"biggulp","Life Sap":"biggulp","Light Bomb":"meteor","Light Line":"beam","Light Ray":"beam","Light Shower":"volley","Lightning Bolt":"lightning","Lightning Rod":"pillar","Lion Maul":"shadowclaw","Liver Shot":"punch","Log Throw":"spear","Long Exposure":"dimlight","Long Howl":"trumpet","Long Jab":"punch","Long Lash":"lash","Long Roll":"stampede","Long Throw":"yoyothrow","Loop the Loop":"yoyoloop","Loud Note":"volley","Magma Bomb":"meteor","Magma Geyser":"pillar","Mind Push":"push","Minute Hand":"spear","Mist":"steam","Moon Beam":"beam","Moon Slash":"shadowclaw","Mouth Nip":"bite","Mud Spit":"drool","Mushroom Puff":"sandspray","Nail Shot":"spear","Needle Burst":"volley","Needle Toss":"spear","Night Cut":"nightbite","Nightmare":"wave","Obsidian Shard":"spear","Overhead Smash":"hammer","Overheat":"sunflare","Page Cyclone":"pageswirl","Page Flick":"volley","Page Flurry":"wingstorm","Paper Bomb":"meteor","Paper Dart":"spear","Paper Hop":"tackle","Paw Rake":"claw","Paw Swat":"claw","Pearl Barrage":"volley","Pearl Dart":"spear","Penny Pinch":"biggulp","Peppermint Dart":"spear","Petal Clap":"push","Pick Strike":"punch","Piercing Cry":"trumpet","Pile Drop":"bellyflop","Pillar Press":"hammer","Pin Beam":"spear","Pin Prick":"spear","Pincer Snip":"pinch","Piston Punch":"punch","Pixel Shot":"volley","Plague Bats":"volley","Plate Slice":"sweep","Pogo Spike":"jawdrop","Poison Bite":"venomcoil","Poison Fog":"inkfog","Pole Smash":"hammer","Pot Drop":"jawdrop","Pounce":"bodyslam","Pounce Slash":"shadowclaw","Pressure Jet":"beam","Quick Bite":"bite","Quick Chop":"sweep","Quick Claws":"claw","Quick Jab":"punch","Quick Snap":"bite","Rabid Bite":"jawlock","Rain Gust":"wave","Rapid Poke":"punchflurry","Razor Feather":"spear","Razor Page":"sweep","Razor Thread":"lash","Razor Wing":"wingstorm","Razor Wrap":"lash","Reach Bite":"lash","Red Eye":"blindingflash","Reel Smash":"overheadsmash","Rim Spin":"spincrash","Rinse Cycle":"spincrash","Rising Fist":"lift","Rivet Spray":"volley","Rock Candy":"boulder","Rock Charge":"tackle","Rock Chop":"hammer","Rock Drop":"boulder","Rock Shower":"meteor","Rock Uppercut":"punch","Rocket Arms":"punchflurry","Roll Over":"bigroll","Rolling Bump":"rollbump","Rolling Doll":"rollbump","Rolling Spin":"rollbump","Roly Combo":"chompcombo","Root Grip":"vicegrip","Root Jab":"spear","Root Quake":"rockpath","Root Spike":"pillar","Root Whack":"tackle","Rope Drop":"jawdrop","Rot Breath":"gust","Round Kick":"kick","Rumble Charge":"chargeram","Rumble Roll":"avalanche","Rune Drain":"wave","Sad Song":"wave","Salt Spray":"steam","Sand Puff":"sandspray","Sap Drain":"biggulp","Saw Roll":"tackle","Scary Roar":"chatter","Scorch":"steam","Sea Hymn":"beam","Seed Spit":"volley","Shadow Bolt":"bolt","Shard Throw":"spear","Sharp Kick":"kick","Shell Butt":"tackle","Shell Roll":"rollbite","Shell Smoke":"steam","Shock Slam":"lightning","Shoulder Barge":"tackle","Shove":"push","Shriek":"chatter","Shrill Note":"chatter","Silk Cannon":"web","Silk Spit":"drool","Skewer Toss":"spear","Skip Kick":"kick","Sky Gale":"gust","Sky Screech":"chatter","Sky Slam":"talondive","Slab Slap":"push","Slam Shut":"snapshut","Sleep Dust":"lullaby","Sleep Mist":"steam","Sleepy Glow":"lullaby","Sleepy Song":"lullaby","Sleepy Story":"wave","Sleepy Tune":"lullaby","Slime Ball":"drool","Slime Wave":"wave","Slush Spray":"steam","Smoke Bomb":"inkfog","Smoke Cloud":"inkfog","Smoke Ring":"steam","Smoke Whirl":"gust","Snake Bite":"bite","Snap Bite":"bite","Snap Combo":"snapshot4","Snout Bump":"tackle","Snow Kick":"kick","Snow Roll":"rollbump","Snow Slam":"bodyslam","Soap Shard":"spear","Soap Stream":"beam","Sock Kick":"kick","Soft Light":"potion","Soot Choke":"steam","Soot Cloud":"inkfog","Sound Wave":"trumpet","Sour Note":"chatter","Sour Spit":"drool","Sour Spray":"steam","Sour Squirt":"drool","Sour Whiff":"steam","Spark Dart":"bolt","Spark Flick":"volley","Spark Needle":"lightning","Spark Shot":"bolt","Sparkle Cloud":"petalswirl","Sparkle Dust":"wave","Spider Leap":"bodyslam","Spike Spin":"spincrash","Spin Chop":"spincrash","Spin Claw":"shadowclaw","Spin Cycle":"spincrash","Spin Dive":"talondive","Spin Roll":"edgeroll","Spine Bash":"bodyslam","Spiral Thrust":"hornjab","Spirit Chill":"wave","Splinter Shot":"volley","Spoke Stab":"spear","Spore Needle":"spear","Spore Shot":"toothshot","Spout Jet":"beam","Spout Stab":"spear","Spring Punch":"punch","Spring Stab":"spear","Sprinkle Rain":"volley","Squeeze":"vicegrip","Squish":"tackle","Stack Drop":"bellyflop","Staff Flurry":"punchflurry5","Staff Smash":"overheadsmash","Staff Whack":"hammer","Stalk Lash":"lash","Star Throw":"volley","Static Cling":"web","Static Shock":"bolt","Static Zap":"bolt","Steam Burst":"steam","Steam Puff":"steam","Stick Poke":"thrust","Sticky Fire":"drool","Sting Barrage":"volley","Stinger":"spear","Stinging Rain":"venomcoil","Stink Bomb":"drool","Stomp Down":"stomp","Stone Fling":"boulder","Stone Hug":"vicegrip","Stone Punch":"punch","Stone Slap":"punch","Storm Dive":"talondive","Storm Slam":"bodyslam","Sucker Grip":"biggulp","Sucker Poke":"thrust","Sugar Crash":"wave","Sugar Roll":"rollbump","Sugar Rush":"chargeram","Sugar Shards":"spear","Sun Ray":"beam","Swamp Mist":"steam","Swat":"lash","Sweep Up":"tackle","Sweet Glow":"petalswirl","Swell Crash":"wave","Swirl Pool":"biggulp","Syrup Dab":"drool","Tail Bop":"lash","Tail Crack":"lash","Tail Crash":"sweep","Tail Cut":"sweep","Tail Hammer":"overheadsmash","Tail Slam":"hammer","Tail Slap":"lash","Tail Slash":"sweep","Tail Storm":"lash","Tail Swat":"lash","Tail Sweep":"lash","Tail Tap":"lash","Tail Tease":"lash","Tail Tickle":"lash","Tail Whack":"lash","Tail Whips":"lash","Talon Grab":"lift","Talon Rake":"shadowclaw","Talon Scratch":"claw","Talon Slash":"claw","Talon Storm":"punchflurry5","Talon Swipe":"claw","Tangle Up":"web","Tank Roll":"rollbump","Tarnish":"steam","Tea Party":"volley","Tentacle Flick":"lash","Tentacle Frenzy":"punchflurry5","Tentacle Grab":"vicegrip","Tentacle Poke":"spear","Tentacle Slam":"hammer","Tentacle Whip":"lash","Thin Beam":"beam","Thin Cut":"lash","Thorn Burst":"spear","Thorn Dart":"spear","Thorn Flick":"volley","Thorn Smash":"hammer","Thousand Legs":"legflurry","Thunder Roll":"wave","Thunder Stomp":"stomp","Thunder Zap":"bolt","Tidal Wave":"wave","Tide Blade":"gust","Tide Cutter":"gust","Tide Slam":"hammer","Tide Whirl":"wave","Tight Squeeze":"vicegrip","Tin Snip":"pinch","Tiny Kick":"kick","Tip Dive":"talondive","Tip Flurry":"punchflurry","Tip Over":"bodyslam","Toe Drill":"kick","Toe Tap":"kick","Tongue Rasp":"lash","Toss Bite":"bite","Trash Talk":"chatter","Triple Bounce":"bopbarrage","Triple Jab":"hornjab","Trot Charge":"tackle","Trunk Flurry":"punchflurry","Tunnel Slash":"claw","Tusk Gore":"thrust","Tusk Thrust":"spear","Twin Fists":"onetwo","Twin Nip":"nibble","Twin Wisps":"foxfire","Twirl":"sweep","Twister":"tornado","Valve Blast":"steam","Venom Dart":"spear","Venom Frenzy":"chompcombo","Verse Beam":"beam","Vine Lash":"lash","Walk the Dog":"edgeroll","Warm Soak":"steam","Water Blade":"claw","Water Cannon":"beam","Water Dart":"spear","Water Jet":"beam","Water Splat":"drool","Water Spout":"beam","Water Spray":"wave","Wave Rush":"chargeram","Wax Drip":"drool","Wax Flood":"wave","Wax Slap":"punch","Wet Fog":"steam","Whirlwind":"tornado","Wind Cut":"sweep","Wind Slice":"wave","Wing Barrage":"kickflurry","Wing Bash":"push","Wing Beat":"wingstorm","Wing Cut":"claw","Wing Flap":"push","Wing Flick":"push","Wing Flurry":"wingstorm","Wing Shove":"push","Wing Slap":"claw","Wing Slash":"shadowclaw","Wing Smash":"push","Wing Whack":"lash","Wing Whirl":"wingstorm","Wing Wrap":"snapshut","Wisp Throw":"foxfire","Wobble":"tackle","Wolf Bite":"bite","Word Barrage":"volley","Word Volley":"volley","Wrapper Slash":"sweep","Wrench Poke":"spear","Wrench Smash":"hammer","Wrench Toss":"spear","Zap Shot":"bolt","Zip Dive":"talondive"});
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

/* Trunk Flurry and Tentacle Frenzy, third pass (Gid: use its own trunk, and its own front tentacles while two stand).
   The sprite's real trunk and tentacles reach out through pose values (trunk, trunkUp, lash, lash2 in chibi.js),
   so they keep the monster's own colours; the effects only mark where each swat lands */
const mvSlap=(c,b,R,k,col)=>{ if(k<0||k>1) return; SG.puff(c,b.x,b.y,R*(0.2+0.35*k),0.65*(1-k),[236,226,206]); c.strokeStyle=`rgba(255,255,255,${0.9*(1-k)})`; c.lineWidth=3;
  for(let i=0;i<5;i++){ const an=i/5*Math.PI*2+0.4; c.beginPath(); c.moveTo(b.x+Math.cos(an)*R*0.25,b.y+Math.sin(an)*R*0.25); c.lineTo(b.x+Math.cos(an)*R*(0.4+0.35*k),b.y+Math.sin(an)*R*(0.4+0.35*k)); c.stroke(); }
  atStar4(c,b.x,b.y-R*0.45*k,R*0.2*(1-k),"#fff3b0"); };
Object.assign(ANIM,{
  /* Plod swings its own trunk at the target, high, low, high, low */
  trunkflurry:(()=>{ const C=320, gap=140, n=4, end=C+n*gap;
    return {C,D:end+340,contact:true,marks:true,
      atk:t=>{ if(t<C){ const k=eo(t/C); return {f:0.5*k,pose:atPose("attack",{trunk:0.3*k,trunkUp:1.0*k,eyes:"fierce"})}; }
        if(t<end){ const j=Math.floor((t-C)/gap), p=((t-C)%gap)/gap, hit=Math.sin(p*Math.PI); return {f:0.5,pose:atPose("attack",{trunk:0.55+0.75*hit,trunkUp:(j%2?-0.4:0.9)*(1-hit)+(j%2?0.4:-0.2)*hit,eyes:"fierce"}),off:[0,0],sy:1-0.03*hit}; }
        const k=eio(Math.min(1,(t-end)/320)); return {f:0.5*(1-k),pose:k<0.6?atPose("idle",{trunk:0.55*(1-k)}):"idle"}; },
      def(t){ if(t<C||t>end+80) return null; const j=Math.floor((t-C)/gap), p=((t-C)%gap)/gap; return {off:[(1-p)*6,(j%2?2:-2)*(1-p)],rot:(j%2?-0.1:0.1)*(1-p),pose:"hit"}; },
      fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x); for(let q=0;q<n;q++){ const k=(t-C-q*gap-gap*0.35)/300; mvSlap(c,{x:tg.x-d*R*0.4,y:tg.y+(q%2?R*0.15:-R*0.35)},R,k); }
        if(t>=C&&t<end){ const p=((t-C)%gap)/gap, j=Math.floor((t-C)/gap); c.strokeStyle=`rgba(255,255,255,${0.5*Math.sin(p*Math.PI)})`; c.lineWidth=3; c.beginPath(); c.arc(tg.x-d*R*0.9,tg.y-R*0.1,R*0.8,j%2?0.1:-1.2,j%2?1.2:-0.1); c.stroke(); } }}; })(),
  /* Squib stands on its back tentacles and whips the two front ones at the target in turn */
  tentaclefrenzy:(()=>{ const C=300, gap=115, n=5, end=C+n*gap;
    return {C,D:end+340,contact:true,marks:true,
      atk:t=>{ if(t<C){ const k=eo(t/C); return {f:0.45*k,arc:-6*k,pose:atPose("attack",{lash:0.3*k,lash2:0.3*k,eyes:"fierce"})}; }
        if(t<end){ const j=Math.floor((t-C)/gap), p=((t-C)%gap)/gap, hit=Math.sin(p*Math.PI), a=j%2?0.25:0.25+1.15*hit, b=j%2?0.25+1.15*hit:0.25; return {f:0.45,arc:-6,pose:atPose("attack",{lash:a,lash2:b,eyes:"fierce"}),rot:(j%2?0.04:-0.04)*hit}; }
        const k=eio(Math.min(1,(t-end)/320)); return {f:0.45*(1-k),arc:-6*(1-k),pose:k<0.6?atPose("idle",{lash:0.25*(1-k),lash2:0.25*(1-k)}):"idle"}; },
      def(t){ if(t<C||t>end+80) return null; const p=((t-C)%gap)/gap; return {off:[(1-p)*7,0],pose:"hit"}; },
      fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x); for(let q=0;q<n;q++){ const k=(t-C-q*gap-gap*0.45)/280; mvSlap(c,{x:tg.x-d*R*0.4,y:tg.y+(q%2?-R*0.3:R*0.1)},R*0.85,k);
          if(k>=0&&k<0.6) for(let i=0;i<3;i++){ c.fillStyle=`rgba(160,210,255,${0.8*(1-k/0.6)})`; c.beginPath(); c.arc(tg.x-d*R*(0.3+k)+i*6,tg.y-R*0.2+(i-1)*R*0.25-k*R*0.3,2.5,0,7); c.fill(); } } }}; })()
});
if(typeof KSND!=="undefined") KSND.trunkflurry=(d,t)=>{ for(let i=0;i<4;i++){ dNoise(d,t+0.33+i*0.14,0.09,0.14,'bandpass',500,0.8); dNoise(d,t+0.39+i*0.14,0.07,0.28,'lowpass',900); dKick(d,t+0.39+i*0.14,0.25); } sTone(d,t+0.1,'sawtooth',180,240,0.2,0.04); };

/* ===== Own-body pass (Gid, 16 Nov 2026): a contact move uses the Snabit's own body. Arms swing and push, Squib, Kraken and Hydra
   reach with their own tentacles, arms or heads (lash, lash2), Plod with its own trunk, and anything else leads with its body.
   Projectiles come out of the part that makes them, like water from Plod's trunk. Drawn stand-in limbs are gone. ===== */
const MV_REACH={Squib:"tent",Kraken:"tent",Hydra:"tent",Plod:"trunk",Naga:"tail"};
const mvMode=o=>{ const f=o&&o.fam; if(f&&MV_REACH[f]) return MV_REACH[f]; return f&&typeof hasArms==="function"&&hasArms(f,o.stage)?"arms":"body"; };
/* the pose for reaching a part out by k (0 to 1); two:1 reaches both tentacles */
function mvReach(o,k,two){ const m=mvMode(o);
  if(m==="tent") return atPose("attack",{lash:0.2+1.2*k,lash2:two?0.2+1.2*k:0.2+0.2*k,eyes:"fierce"});
  if(m==="trunk") return atPose("attack",{trunk:0.25+1.1*k,trunkUp:0.7*(1-k),eyes:"fierce"});
  if(m==="arms") return k<0.4?"punchwind":"push";
  return k<0.4?"crouch":"tackle"; }
Object.assign(ANIM,{
  /* a whip or swat with whatever the body has: tentacles, trunk, an arm, or a spin that swings its tail or body round */
  lash:{C:340,D:900,contact:true,marks:true,
    atk:(t,o)=>{ const m=mvMode(o), d=(o&&o.dir)||1, f=atReach(t,340,0.5,220,320);
      if(m==="tent"||m==="trunk"){ const k=t<200?0.3*eo(t/200):t<340?0.3+0.7*eo((t-200)/140):t<560?1:1-eio(Math.min(1,(t-560)/300)); return {f,pose:mvReach(o,k)}; }
      if(m==="arms") return {f,pose:t<200?"swipeup":t<560?"swipedown":"idle",rot:t<200?-d*0.1*eo(t/200):t<560?d*0.12:0};
      if(m==="tail"){ const T=t<200?eo(t/200):t<560?1:1-eio(Math.min(1,(t-560)/300)), sw=t<200?-1:t<340?-1+2*eo((t-200)/140):1; return {f:f*0.5,pose:atPose("attack",{tail:T,tailSw:sw,eyes:"fierce"}),rot:t>200&&t<480?-d*0.06:0}; }   // Naga stretches its tail out long and swings it over
      const sp=t>160&&t<480?Math.cos((t-160)/320*Math.PI*2):1; return {f,pose:t<160?"crouch":t<480?"tackle":"idle",sx:t>160&&t<480?Math.max(0.2,Math.abs(sp))*(sp<0?-1:1):1}; },
    fx(c,t,x){ if(t>=240&&t<640) atLash(c,x.target,(t-240)/400,x.col,atDir(x),atBig(x)); }},
  /* a stab with its own point: a reached tentacle or trunk, a pushed arm, or the whole body leading with a horn, nose or spout */
  thrust:{C:360,D:900,contact:true,marks:true,
    atk:(t,o)=>{ const m=mvMode(o), d=(o&&o.dir)||1, f=atReach(t,360,m==="body"?0.66:0.55,200,320), k=t<360?eo(t/360):t<560?1:1-eio(Math.min(1,(t-560)/300));
      return m==="body"?{f,pose:t<160?"crouch":t<560?"tackle":"idle",rot:d*0.3*Math.sin(Math.min(1,t/560)*Math.PI),sx:t<360?1-0.06*k:1}:{f,pose:mvReach(o,k)}; },
    def:t=>SG.knock(t,360,1,14,320),
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x);
      if(t>=200&&t<380){ const k=(t-200)/180; c.strokeStyle=`rgba(255,255,255,${0.7*k})`; c.lineWidth=2.5; for(let i=0;i<3;i++){ const yy=tg.y-R*0.2+(i-1)*R*0.18; c.beginPath(); c.moveTo(tg.x-d*R*(0.8+0.6*(1-k)),yy); c.lineTo(tg.x-d*R*(1.6+0.6*(1-k)),yy); c.stroke(); } }
      if(t>=360&&t<700){ const k=(t-360)/340; atStar4(c,tg.x-d*R*0.3,tg.y-R*0.2,R*(0.6-0.4*k),`rgba(255,255,240,${1-k})`); c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=2;
        for(let i=0;i<6;i++){ const a=(i/6-0.5)*1.4+(d>0?0:Math.PI); c.beginPath(); c.moveTo(tg.x+Math.cos(a)*R*0.3,tg.y-R*0.2+Math.sin(a)*R*0.3); c.lineTo(tg.x+Math.cos(a)*R*(0.5+0.6*k),tg.y-R*0.2+Math.sin(a)*R*(0.5+0.6*k)); c.stroke(); } } }},
  /* pincer moves keep the arm poses that open and snap its own claws; the effect is only the snap */
  pinch:{C:380,D:920,contact:true,marks:true,
    atk:t=>({f:atReach(t,380,0.66,220,320),pose:t<380?AT_P.clawOpen:t<600?AT_P.clawSnap:"idle"}),
    fx(c,t,x){ const tg=x.target, R=tg.r; for(const T0 of [380]){ const k=(t-T0)/300; if(k<0||k>1) continue; atStar4(c,tg.x,tg.y-R*0.2,R*0.5*(1-k),`rgba(255,255,255,${1-k})`); SG.ring(c,tg.x,tg.y-R*0.2,R*(0.3+0.6*k),R*(0.3+0.6*k),[255,255,255],3*(1-k),1-k); } }},
  vicegrip:{C:380,D:1250,contact:true,marks:true,
    atk:(t,o)=>{ const m=mvMode(o), f=atReach(t,380,0.7,560,300); if(m==="tent"){ const k=t<380?eo(t/380):t<940?1:1-eio(Math.min(1,(t-940)/300)); return {f,pose:mvReach(o,k,true),off:[t>380&&t<940?Math.sin(t/30)*2:0,0]}; }
      return {f,pose:t<380?AT_P.clawOpen:t<940?AT_P.clawSnap:"idle",off:[t>380&&t<940?Math.sin(t/30)*2:0,0]}; },
    def(t){ if(t<380||t>940) return null; return {sx:0.9+0.03*Math.sin(t/40),sy:1.06,pose:"hurt",off:[Math.sin(t/25)*2,0]}; },
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t>=380&&t<940){ const ph=Math.floor((t-380)/140); for(let i=0;i<3;i++){ c.strokeStyle=`rgba(255,255,255,${0.5+0.3*Math.sin(t/40+i)})`; c.lineWidth=2; c.beginPath(); c.arc(tg.x,tg.y-R*0.2,R*(0.8+0.1*i),-0.6+i*0.4+ph*0.2,0.2+i*0.4+ph*0.2); c.stroke(); } }
      const k=(t-380)/300; if(k>=0&&k<1) atStar4(c,tg.x,tg.y-R*0.2,R*0.5*(1-k),`rgba(255,255,255,${1-k})`); }},
  /* Plod's Water Spray: it lifts its own trunk and sprays a jet of water out of the end */
  trunkspray:{C:480,D:1120,
    atk:t=>{ const k=t<260?eo(t/260):t<900?1:1-eio(Math.min(1,(t-900)/220)); return {pose:atPose("push",{trunk:0.55*k,trunkUp:1.1*k,eyes:"fierce"}),sy:1-0.04*k}; },
    def:t=>t>=480&&t<1100?{off:[Math.sin(t/14)*2.5,0],pose:"hurt"}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), W=[110,180,255], tip={x:s.x+d*s.r*1.05,y:s.y-s.r*0.15};
      if(t>=260&&t<900){ const k=Math.min(1,(t-260)/220), end=t>780?(t-780)/120:0;
        for(let i=0;i<34;i++){ const ph=((t/260)+i/34)%1; if(ph>k||ph<end) continue; const p=lerpP(tip,{x:tg.x-d*R*0.2,y:tg.y-R*0.3},ph,R*0.5,(atH(i)-0.5)*R*0.3*ph); c.fillStyle=atRgba(i%3?W:[230,245,255],0.85); c.beginPath(); c.arc(p.x,p.y,2.5+3*ph,0,7); c.fill(); }
        atGlowA(c,tip.x,tip.y,s.r*0.25,[200,230,255],0.6); }
      if(t>=480&&t<1100){ const k=(t-480)/620; atSplash(c,{x:tg.x-d*R*0.3,y:tg.y-R*0.2},(k*2)%1,W,1.1); for(let i=0;i<4;i++){ const ph=((t/300)+i/4)%1; c.fillStyle=`rgba(150,200,255,${0.8*(1-ph)})`; c.beginPath(); c.arc(tg.x+(i-1.5)*R*0.4,tg.y+ph*R,3,0,7); c.fill(); } } }},
  /* Plod's Stone Fling: it curls its own trunk round a stone and flings it */
  trunktoss:{C:560,D:1160,
    atk:t=>{ const k=t<300?eo(t/300):t<420?1-eo((t-300)/120)*0.4:t<800?0.6:0.6*(1-eio(Math.min(1,(t-800)/300))); return {pose:atPose("attack",{trunk:t<300?0.2:0.9*k,trunkUp:t<300?1.2*k:-0.3,eyes:"fierce"}),rot:t<300?0:0}; },
    def:t=>SG.knock(t,560,1,18,380),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), tip={x:s.x+d*s.r*0.85,y:s.y-s.r*(t<300?0.55*eo(t/300):0.2)}, b={x:tg.x-d*R*0.2,y:tg.y-R*0.2};
      const rock=(px,py,rot)=>{ c.save(); c.translate(px,py); c.rotate(rot); c.fillStyle="#9c8a74"; c.strokeStyle="#5e5244"; c.lineWidth=2; c.beginPath(); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, rr=R*0.26*(0.8+0.3*atH(i)); c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); c.stroke(); c.restore(); };
      if(t<360) rock(tip.x,tip.y,0); else if(t<560){ const p=lerpP(tip,b,eo((t-360)/200),R*0.7); rock(p.x,p.y,t/60); }
      atImpact(t,560,0.3,0); if(t>=560&&t<1000){ const k=(t-560)/440; for(let i=0;i<8;i++){ const a=-Math.PI*(0.1+0.8*atH(i*3)); SG.shard(c,b.x+Math.cos(a)*R*(0.3+1.2*k),b.y+Math.sin(a)*R*(0.3+1.2*k)+k*k*R*1.4,R*0.09,t/60+i,"#a8957d"); } SG.dust(c,b.x,b.y+R*0.3,R*0.8,k,6); } }}
});
Object.assign(AR_KIND,{"Water Spray":"trunkspray","Stone Fling":"trunktoss"});
["Leg Spike","Antenna Spike","Tentacle Poke","Tusk Thrust","Frost Tusk","Spout Stab","Root Jab","Goo Spike","Minute Hand","Corkscrew","Poke","Spoke Stab","Pen Stab","Skewer Poke","Skewer Thrust","Twig Poke","Cone Jab","Horn Jab","Nose Poke","Horn Thrust"].forEach(n=>AR_KIND[n]="thrust");
if(typeof KSND!=="undefined") Object.assign(KSND,{
  thrust:(d,t)=>{ dNoise(d,t+0.18,0.18,0.1,'bandpass',1400,1); sTone(d,t+0.34,'triangle',1600,900,0.08,0.06); dNoise(d,t+0.36,0.06,0.2,'highpass',3000,1.5); },
  trunkspray:(d,t)=>{ sTone(d,t+0.1,'sawtooth',220,300,0.18,0.03); dNoise(d,t+0.26,0.65,0.22,'bandpass',1600,0.5); dNoise(d,t+0.48,0.4,0.15,'lowpass',900); },
  trunktoss:(d,t)=>{ dNoise(d,t+0.3,0.26,0.12,'bandpass',800,0.8); dKick(d,t+0.56,0.5); dNoise(d,t+0.56,0.25,0.2,'lowpass',600); }
});

/* Plod trumpets through its own raised trunk, and Kraken's Eight Arms whips its own two long arms in turn */
{ const ch=ANIM.chatter, base=ch.atk; ch.atk=(t,o)=>{ const r=base(t,o); if(o&&o.fam==="Plod"&&t<800){ r.pose=atPose("push",{trunk:0.3,trunkUp:1.4,eyes:"fierce"}); } return r; }; }
AR_KIND["Eight Arms"]="tentaclefrenzy";

/* Gid's notes (16 Nov 2026, evening): Pinch's claws open and snap shut, Unicorn and Kirin dip their heads and run the horn in,
   Dango tips over and pokes with the point of its skewer, three clear bites in Gate Fang, and real sound waves for Trumpet */
const mvClaw=(open,lean=0)=>({...AT_P.clawOpen,clawOpen:open,clawAng:-0.15+lean,eyes:"fierce",open:0.6});
Object.assign(ANIM,{
  pinch:{C:380,D:920,contact:true,marks:true,
    atk:t=>({f:atReach(t,380,0.66,220,320),pose:t<300?mvClaw(1*eo(t/300)):t<380?mvClaw(1):t<640?mvClaw(-0.3,0.1):"idle",off:[t>=380&&t<460?Math.sin(t/8)*2:0,0]}),
    fx(c,t,x){ const tg=x.target, R=tg.r, k=(t-380)/300; if(k>=0&&k<1){ atStar4(c,tg.x,tg.y-R*0.2,R*0.45*(1-k),`rgba(255,255,255,${1-k})`); for(const sd of [-1,1]){ c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=3; c.beginPath(); c.moveTo(tg.x-R*0.3,tg.y-R*0.2+sd*R*(0.5-0.3*k)); c.lineTo(tg.x+R*0.1,tg.y-R*0.2+sd*R*0.1); c.stroke(); } } }},
  vicegrip:{C:380,D:1250,contact:true,marks:true,
    atk:(t,o)=>{ const m=mvMode(o), f=atReach(t,380,0.7,560,300); if(m==="tent"){ const k=t<380?eo(t/380):t<940?1:1-eio(Math.min(1,(t-940)/300)); return {f,pose:mvReach(o,k,true),off:[t>380&&t<940?Math.sin(t/30)*2:0,0]}; }
      return {f,pose:t<300?mvClaw(eo(t/300)):t<380?mvClaw(1):t<940?mvClaw(-0.3+0.08*Math.sin(t/35),0.1):"idle",off:[t>380&&t<940?Math.sin(t/30)*2:0,0]}; },
    def(t){ if(t<380||t>940) return null; return {sx:0.88+0.03*Math.sin(t/40),sy:1.07,pose:"hurt",off:[Math.sin(t/25)*2,0]}; },
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t>=380&&t<940) for(let i=0;i<4;i++){ const ph=((t/160)+i/4)%1; atStar4(c,tg.x+(i%2?1:-1)*R*0.5,tg.y-R*(0.5+0.4*ph),R*0.14*(1-ph),"#fff6c4"); }
      const k=(t-380)/300; if(k>=0&&k<1) atStar4(c,tg.x,tg.y-R*0.2,R*0.5*(1-k),`rgba(255,255,255,${1-k})`); }},
  /* the horn goes in first: it rears back, dips its head so the horn points at the target, and drives in */
  hornjab:{C:380,D:960,contact:true,marks:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<200){ const k=eo(t/200); return {f:-0.06*k,rot:-d*0.12*k,sy:1-0.06*k,pose:"crouch"}; }
      if(t<380){ const k=ei((t-200)/180); return {f:-0.06+0.66*k,rot:-d*0.12+d*0.6*k,pose:"tackle",sx:1.04}; }
      if(t<560) return {f:0.6,rot:d*0.48,pose:"tackle",off:[Math.sin(t/12)*1.5,0]};
      const k=(t-560)/400; return {f:0.6*(1-eio(k)),rot:d*0.48*(1-eo(k)),pose:"idle"}; },
    def:t=>SG.knock(t,380,1,22,420),
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x); if(t>=220&&t<400){ const k=(t-220)/180; c.strokeStyle=`rgba(255,255,255,${0.7*k})`; c.lineWidth=2.5; for(let i=0;i<4;i++){ const yy=tg.y-R*(0.6-i*0.2); c.beginPath(); c.moveTo(tg.x-d*R*(1.2+0.8*(1-k)),yy); c.lineTo(tg.x-d*R*(2.2+0.8*(1-k)),yy); c.stroke(); } }
      if(t>=380&&t<760){ const k=(t-380)/380; atGlowA(c,tg.x-d*R*0.3,tg.y-R*0.45,R*(0.5+0.6*k),[255,240,170],0.8*(1-k)); atStar4(c,tg.x-d*R*0.3,tg.y-R*0.45,R*0.6*(1-k),"rgba(255,255,230,.95)"); } }},
  /* Dango tips forward so the point of its skewer leads, hops in and pokes */
  skewerpoke:{C:400,D:980,contact:true,marks:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1, h=26; if(t<180){ const k=eo(t/180); return {f:-0.04*k,sy:1-0.1*k,pose:"crouch",...MV.roll(-d*0.15*k,h)}; }
      if(t<400){ const k=eio((t-180)/220); return {...MV.roll(d*1.3*k,h),f:-0.04+0.66*k,arc:-h*(1-Math.cos(d*1.3*k))-14*Math.sin(k*Math.PI),pose:"attack"}; }
      if(t<560) return {...MV.roll(d*1.3,h),f:0.62,pose:"attack"};
      const k=(t-560)/420; return {...MV.roll(d*1.3*(1-eo(k)),h),f:0.62*(1-eio(k)),pose:"idle"}; },
    def:t=>SG.knock(t,400,1,20,400),
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x); if(t>=400&&t<760){ const k=(t-400)/360; atStar4(c,tg.x-d*R*0.35,tg.y-R*0.2,R*0.55*(1-k),"rgba(255,255,235,.95)"); c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=2.5;
        for(let i=0;i<6;i++){ const a=(i/6-0.5)*1.4+(d>0?0:Math.PI); c.beginPath(); c.moveTo(tg.x+Math.cos(a)*R*0.3,tg.y-R*0.2+Math.sin(a)*R*0.3); c.lineTo(tg.x+Math.cos(a)*R*(0.5+0.6*k),tg.y-R*0.2+Math.sin(a)*R*(0.5+0.6*k)); c.stroke(); } } }},
  /* Plod's Trumpet: its own trunk goes up and a blast of sound rolls out of it in thick rings that shove the target back */
  trumpet:{C:440,D:1120,
    atk:t=>{ const k=t<220?eo(t/220):t<860?1:1-eio(Math.min(1,(t-860)/240)); return {pose:atPose("push",{trunk:0.45*k,trunkUp:1.5*k,eyes:"shut",open:0.2}),sy:1+0.05*k*(t>220&&t<860?Math.abs(Math.sin(t/30)):1),off:[t>220&&t<860?Math.sin(t/11)*1.2:0,0]}; },
    def:t=>{ const a=SG.knock(t,440,1,34,520); if(a) a.off[1]=Math.sin(t/9)*2; return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), tip={x:s.x+d*s.r*0.95,y:s.y-s.r*0.95}, L=Math.abs(tg.x-tip.x)+R;
      if(t>200&&t<860){ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tip.x,tip.y,s.r*0.4,[255,230,170],0.7); c.restore(); }
      for(let i=0;i<6;i++){ const k=(t-200-i*95)/520; if(k<0||k>1) continue; const rr=s.r*0.3+L*eo(k), a=1-k, wob=Math.sin(t/25+i)*0.04;
        for(const [w,col] of [[9,`rgba(255,200,120,${0.45*a})`],[4,`rgba(255,250,225,${0.95*a})`]]){ c.strokeStyle=col; c.lineWidth=w*(1-k*0.5); c.beginPath();
          for(let j=0;j<=24;j++){ const q=-0.55+j/24*1.1, rad=rr*(1+0.03*Math.sin(j*1.6+t/30)); c.lineTo(tip.x+d*Math.cos(q+wob)*rad,tip.y+R*0.5*k+Math.sin(q+wob)*rad*0.85); } c.stroke(); } }
      if(t>260&&t<860) for(let i=0;i<5;i++){ const ph=((t/300)+i/5)%1; c.strokeStyle=`rgba(255,240,200,${0.7*(1-ph)})`; c.lineWidth=2; const px=tip.x+d*L*ph, py=tip.y+R*0.5*ph+(i-2)*R*0.35; c.beginPath(); c.moveTo(px,py); c.lineTo(px+d*R*0.5,py+Math.sin(t/20+i)*3); c.stroke(); }
      atImpact(t,440,0.4,0); }}
});
Object.assign(AR_KIND,{"Horn Jab":"hornjab","Horn Thrust":"hornjab","Skewer Poke":"skewerpoke","Skewer Thrust":"skewerpoke","Trumpet":"trumpet"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  pinch:(d,t)=>{ dNoise(d,t+0.1,0.06,0.08,'bandpass',2000,2); sTone(d,t+0.38,'square',1400,700,0.04,0.06); dNoise(d,t+0.38,0.05,0.25,'highpass',3500,2); },
  hornjab:(d,t)=>{ dNoise(d,t+0.2,0.18,0.12,'bandpass',900,0.8); sTone(d,t+0.38,'triangle',2200,1400,0.15,0.07); dKick(d,t+0.38,0.4); },
  skewerpoke:(d,t)=>{ dNoise(d,t+0.18,0.2,0.1,'bandpass',1200,1); sTone(d,t+0.4,'triangle',1800,1000,0.08,0.06); dNoise(d,t+0.4,0.05,0.2,'highpass',3000,1.5); },
  trumpet:(d,t)=>{ [0,0.004].forEach(o=>{ sTone(d,t+0.2+o,'sawtooth',233,247,0.6,0.09); sTone(d,t+0.2+o,'square',466,494,0.6,0.035); }); sTone(d,t+0.2,'sawtooth',349,370,0.6,0.05); dNoise(d,t+0.2,0.6,0.08,'bandpass',900,0.6); }
});

/* Reaching limbs land on the target's edge (Gid: the hit as soon as the edge of the tentacle touches the body). Each limb's tip sits
   base + perL * L drawing units in front of the body's middle at reach L, by stage; L is worked out from the gap so the tip meets the edge
   at the contact frame. The body stays put while the limb does the reaching */
const MV_TIP={Squib:{Bit:[25,70],Byte:[37,70],Mega:[47,70]},Kraken:{Bit:[43,52],Byte:[55,40],Mega:[66,29]},Hydra:{Bit:[42,48],Byte:[49,41],Mega:[56,34]},Plod:{Bit:[0,78],Byte:[0,78],Mega:[0,78]}};
function mvLimbHit(o){ const T=o&&MV_TIP[o.fam], tp=T&&(T[o.stage]||T.Byte); if(!tp||o.gapU==null) return 1.3; return Math.max(0.35,Math.min(2.2,(o.gapU-tp[0])/tp[1])); }
/* k runs from about -0.3 (pulled back) through 1 (just touching the target at the contact frame) */
mvReach=function(o,k,two){ const m=mvMode(o), L=mvLimbHit(o), r=k<0?k*0.5:L*k;
  if(m==="tent") return atPose("attack",{lash:r,lash2:two?r:Math.min(r,0.2),eyes:"fierce"});
  if(m==="trunk") return atPose("attack",{trunk:Math.max(0,r),trunkUp:k<0?0.8:0.7*(1-k),eyes:"fierce"});
  if(m==="arms") return k<0.4?"punchwind":"push";
  return k<0.4?"crouch":"tackle"; };
const mvLimb=o=>{ const m=mvMode(o); return m==="tent"||m==="trunk"; };
/* the reach curve every limb strike shares: pull back, shoot out to land at C, hold, draw back in */
const mvStrikeK=(t,C,hold=220,back=300,pull=0.3)=>{ const w=C*0.55; return t<w?-pull*eo(t/w):t<C?-pull+(1+pull)*ei((t-w)/(C-w)):t<C+hold?1+0.03*Math.sin((t-C)/40):1-eio(Math.min(1,(t-C-hold)/back)); };
{ const L0=ANIM.lash.atk; ANIM.lash.atk=(t,o)=>mvLimb(o)?{f:0,pose:mvReach(o,mvStrikeK(t,340))}:L0(t,o); }
{ const T0=ANIM.thrust.atk; ANIM.thrust.atk=(t,o)=>mvLimb(o)?{f:0,pose:mvReach(o,mvStrikeK(t,360))}:T0(t,o); }
{ const V0=ANIM.vicegrip.atk; ANIM.vicegrip.atk=(t,o)=>mvMode(o)==="tent"?{f:0,pose:mvReach(o,mvStrikeK(t,380,560),true),off:[t>380&&t<940?Math.sin(t/30)*2:0,0]}:V0(t,o); }
/* the flurries: every strike is its own pull back and stab, landing on the beat */
ANIM.tentaclefrenzy.atk=(t,o)=>{ const C=300, gap=115, n=5, end=C+n*gap;
  if(t<C) return {f:0,pose:atPose("attack",{lash:-0.15*eo(t/C),lash2:-0.15*eo(t/C),eyes:"fierce"}),arc:-6*eo(t/C)};
  const L=mvLimbHit(o);
  if(t<end){ const j=Math.floor((t-C)/gap), p=((t-C)%gap)/gap, hit=p<0.35?eo(p/0.35):1-eio((p-0.35)/0.65)*0.85, a=j%2?0.1:L*hit, b=j%2?L*hit:0.1; return {f:0,arc:-6,pose:atPose("attack",{lash:a,lash2:b,eyes:"fierce"})}; }
  const k=eio(Math.min(1,(t-end)/320)); return {f:0,arc:-6*(1-k),pose:"idle"}; };
ANIM.trunkflurry.atk=(t,o)=>{ const C=320, gap=140, n=4, end=C+n*gap, L=mvLimbHit(o);
  if(t<C){ const k=eo(t/C); return {f:0,pose:atPose("attack",{trunk:0,trunkUp:1.0*k,eyes:"fierce"})}; }
  if(t<end){ const j=Math.floor((t-C)/gap), p=((t-C)%gap)/gap, hit=p<0.35?eo(p/0.35):1-eio((p-0.35)/0.65)*0.7; return {f:0,pose:atPose("attack",{trunk:L*hit,trunkUp:(j%2?-0.4:0.9)*(1-hit),eyes:"fierce"}),sy:1-0.03*hit}; }
  const k=eio(Math.min(1,(t-end)/320)); return {f:0,pose:k<0.6?atPose("idle",{trunk:L*0.3*(1-k)}):"idle"}; };

/* Gid's notes (16 Nov 2026, late): the whip mark follows a limb that swings up from below, Unicorn charges with its own head lowered
   so the horn leads while its body runs, and Cerberus walks in and tilts its body into each bite */
{ const fx0=ANIM.lash.fx; ANIM.lash.fx=(c,t,x)=>{ if(t<240||t>=640) return; const m=mvMode({fam:x.fam,stage:x.stage}); if(m==="tent"||m==="trunk"||m==="tail"){ const P=x.target; c.save(); c.translate(0,2*(P.y-8)); c.scale(1,-1); atLash(c,P,(t-240)/400,x.col,atDir(x),atBig(x)); c.restore(); } else fx0(c,t,x); }; }
{ const H0=ANIM.hornjab, a0=H0.atk;
  H0.tipU=(fam,st)=>fam==="Unicorn"?{Bit:26,Byte:36,Mega:46}[st]||36:fam==="Kirin"?20:0;
  H0.atk=(t,o)=>{ if(!o||o.fam!=="Unicorn") return a0(t,o); const d=o.dir||1;
    if(t<160){ const k=eo(t/160); return {f:-0.05*k,pose:atPose("crouch",{headRot:0.25*k,eyes:"fierce"}),sy:1-0.05*k}; }   // rears its head up and back
    if(t<380){ const k=ei((t-160)/220); return {f:-0.05+0.62*k,pose:atPose("run",{headRot:0.25-1.3*k,eyes:"fierce",open:0.3}),arc:-Math.abs(Math.sin(k*Math.PI*2))*5}; }   // gallops in with the horn coming down level
    if(t<560) return {f:0.57,pose:atPose("tackle",{headRot:-1.05+0.06*Math.sin(t/25),eyes:"fierce"}),off:[Math.sin(t/12)*1.5,0]};
    const k=(t-560)/400; return {f:0.57*(1-eio(k)),pose:atPose("idle",{headRot:-1.05*(1-eo(k))})}; }; }

/* group 3 (16 Nov 2026): Snooze, Inky, Cobble, Nimbo, Dango, Oaklet, Roly, Trundle, Clank, Crease */
/* a thrown thing that curves out over the gap, hits at C and curves back home under it, for Saw Throw and Paper Boomerang */
function mvBoomer(draw){ const C=520;
  return {C,D:1180,
    atk:t=>({pose:t<200?"determined":t<1000?"push":"idle",sy:t<200?1-0.08*eo(t/200):1,off:[t>200&&t<280?-5:0,0]}),
    def:t=>SG.knock(t,C,1,24,440),
    fx(c,t,x){ const s=x.self, tg=x.target, d=atDir(x), a={x:s.x+d*s.r*0.6,y:s.y-s.r*0.2}, b={x:tg.x-d*tg.r*0.2,y:tg.y-tg.r*0.3}, L=Math.abs(b.x-a.x);
      let p=null, spin=t/30;
      if(t>=200&&t<C){ const k=ei((t-200)/(C-200)); p={x:a.x+(b.x-a.x)*k,y:a.y-L*0.35*Math.sin(k*Math.PI)}; }
      else if(t>=C&&t<1060){ const k=eio((t-C)/(1060-C)); p={x:b.x+(a.x-b.x)*k,y:b.y+L*0.25*Math.sin(k*Math.PI)}; }
      if(p){ for(let i=1;i<5;i++){ c.globalAlpha=0.25*(1-i/5); draw(c,p.x-d*i*6*(t<C?1:-1),p.y+i*2,s.r,spin-i*0.4,x); } c.globalAlpha=1; draw(c,p.x,p.y,s.r,spin,x); }
      if(t>=C&&t<C+360){ const k=(t-C)/360; atStar4(c,b.x,b.y,tg.r*0.6*(1-k),"rgba(255,255,240,.95)"); for(let i=0;i<8;i++){ const an=i/8*Math.PI*2; c.strokeStyle=`rgba(255,${200+i*6},120,${1-k})`; c.lineWidth=2; c.beginPath(); c.moveTo(b.x+Math.cos(an)*tg.r*0.3,b.y+Math.sin(an)*tg.r*0.3); c.lineTo(b.x+Math.cos(an)*tg.r*(0.4+0.8*k),b.y+Math.sin(an)*tg.r*(0.4+0.8*k)); c.stroke(); } }
      atImpact(t,C,0.35,0); }}; }
MV.saw=(c,x,y,R,rot)=>{ const z=R*0.32; c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle="#c9ced6"; c.strokeStyle="#6b7280"; c.lineWidth=1.5; c.beginPath();
  for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, rr=i%2?z:z*1.22; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); c.stroke();
  c.fillStyle="#8b929c"; c.beginPath(); c.arc(0,0,z*0.3,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(-z*0.35,-z*0.4,z*0.3,z*0.12,-0.6,0,7); c.fill(); c.restore(); };
MV.boomer=(c,x,y,R,rot,X)=>{ const z=R*1.05, col=X.body||[230,230,240]; c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=atRgba(col.map(v=>Math.min(255,v+30)),1); c.strokeStyle=atRgba(col.map(v=>v*0.45),1); c.lineWidth=2.4;
  c.beginPath(); c.moveTo(-z,-z*0.5); c.lineTo(0,z*0.35); c.lineTo(z,-z*0.5); c.lineTo(z*0.7,-z*0.62); c.lineTo(0,-z*0.05); c.lineTo(-z*0.7,-z*0.62); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle=atRgba(col.map(v=>v*0.7),0.8); c.beginPath(); c.moveTo(0,z*0.35); c.lineTo(0,-z*0.05); c.stroke(); c.restore(); };
/* a ball rolling in along the floor: tuck, roll, bump (Roll Bump, Big Roll, Rumble Roll), and the long fast roll with sparks (Edge Roll) */
function mvRollIn(C,F,turns,sparks,big){ return {C,D:C+640,contact:true,marks:true,
  atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<140){ const k=eo(t/140); return {sx:1+0.1*k,sy:1-0.18*k,pose:"crouch"}; }
    if(t<C){ const k=(t-140)/(C-140), th=d*Math.PI*2*turns*ei(k); return {f:F*ei(k),...MV.roll(th),sx:0.94,sy:0.88,pose:"crouch"}; }
    if(t<C+120){ const k=(t-C)/120; return {f:F-0.08*Math.sin(k*Math.PI),arc:-(big?22:10)*Math.sin(k*Math.PI),sx:1+0.12*(1-k),sy:1-0.12*(1-k),pose:"tackle"}; }
    const k=(t-C-120)/520; return {f:(F-0.04)*(1-eio(k)),arc:-12*Math.sin(Math.min(1,k)*Math.PI),pose:"idle"}; },
  def:t=>SG.knock(t,C,1,big?40:24,big?560:420),
  fx(c,t,x){ const s=x.self, tg=x.target, d=atDir(x); if(t>140&&t<C){ SG.dust(c,s.x-d*s.r*0.6,s.foot,s.r*0.5,((t-140)%220)/220,4); MV.lines(c,s.x,s.y-s.r*0.4,s.r,d,4,1);
      if(sparks) for(let i=0;i<9;i++){ const ph=((t/120)+i/9)%1; c.fillStyle=`rgba(255,${210+i*4},90,${1-ph})`; c.beginPath(); c.arc(s.x-d*s.r*(0.5+ph*1.6),s.foot-2-ph*s.r*0.8*atH(i),2.4*(1-ph)+0.6,0,7); c.fill(); } }
    if(t>=C&&t<C+400){ const k=(t-C)/400; atPow(c,{x:tg.x-d*tg.r*0.4,y:tg.y-tg.r*0.2},k,tg.r/(big?20:26)); if(big) SG.cracks&&SG.cracks(c,tg.x,tg.foot,tg.r*1.1,6,4,1-k); }
    atImpact(t,C,big?0.6:0.35,big?0.1:0); }}; }
Object.assign(ANIM,{
  sawthrow:mvBoomer(MV.saw),
  paperboomer:mvBoomer(MV.boomer),
  rollbump:mvRollIn(440,0.74,1,false,false),
  edgeroll:mvRollIn(520,0.8,2,true,false),
  bigroll:mvRollIn(560,0.8,1.5,false,true),
  /* Cobble's Moss Smear: it walks up, presses a hand on the target and green moss spreads over it */
  mosssmear:{C:460,D:1250,contact:true,marks:true,
    atk:t=>({f:t<460?0.62*eio(t/460):t<880?0.62:0.62*(1-eio((t-880)/340)),pose:t<300?"walk":t<880?"push":"idle",off:[t>460&&t<880?Math.sin(t/30)*1.5:0,0]}),
    def:t=>t>=460&&t<1150?{off:[Math.sin(t/20)*1.5,0],pose:"hurt"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t<460) return; const k=Math.min(1,(t-460)/500), a=t<1000?1:Math.max(0,1-(t-1000)/250); if(a<=0) return;
      for(let i=0;i<11;i++){ const an=atH(i*5)*Math.PI*2, rr=R*0.75*Math.sqrt(atH(i*11)), g=Math.max(0,Math.min(1,k*1.6-i*0.06)), px=tg.x+Math.cos(an)*rr, py=tg.y-R*0.25+Math.sin(an)*rr*0.85;
        c.fillStyle=`rgba(${70+i*3},${140+i*4},70,${0.85*a})`; c.beginPath(); c.arc(px,py,R*0.18*g,0,7); c.fill(); c.fillStyle=`rgba(160,215,110,${0.7*a})`; c.beginPath(); c.arc(px-R*0.05,py-R*0.05,R*0.07*g,0,7); c.fill(); }
      for(let i=0;i<4;i++){ const ph=((t/400)+i/4)%1; SG.feather(c,tg.x+(i-1.5)*R*0.4,tg.y-R*(0.6+ph*0.7),R*0.12,ph*3+i,`rgba(120,190,90,${(1-ph)*a})`); } }},
  /* Dango's Spin Skewer: it tips its point forward and spins like a drill into the target */
  spinskewer:{C:440,D:1260,contact:true,marks:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1, h=26; if(t<160){ const k=eo(t/160); return {...MV.roll(-d*0.15*k,h),f:-0.04*k,pose:"crouch"}; }
      const spin=Math.cos(t/22); if(t<440){ const k=ei((t-160)/280); return {...MV.roll(d*1.35*k,h),f:-0.04+0.66*k,sy:0.85+0.15*Math.abs(spin),pose:"attack"}; }
      if(t<820) return {...MV.roll(d*1.35,h),f:0.62+0.02*Math.sin(t/18),sy:0.85+0.15*Math.abs(spin),pose:"attack"};
      const k=(t-820)/440; return {...MV.roll(d*1.35*(1-eo(k)),h),f:0.62*(1-eio(k)),pose:"idle"}; },
    def:t=>t>=440&&t<820?{off:[Math.sin(t/10)*3,0],pose:"hit"}:SG.knock(t,820,1,24,420),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t>160&&t<820) for(let i=0;i<3;i++){ const a=t/30+i*2.1; c.strokeStyle="rgba(255,255,255,.6)"; c.lineWidth=2; c.beginPath(); c.ellipse(s.x+d*s.r*0.4,s.y-s.r*0.3,s.r*0.35,s.r*0.85,0,a,a+1.8); c.stroke(); }
      if(t>=440&&t<820){ const p={x:tg.x-d*R*0.4,y:tg.y-R*0.25}; for(let i=0;i<7;i++){ const ph=((t/90)+i/7)%1, an=(d>0?Math.PI:0)+(atH(i*3)-0.5)*1.6; c.fillStyle=`rgba(255,${220+i*4},140,${1-ph})`; c.beginPath(); c.arc(p.x+Math.cos(an)*R*ph,p.y+Math.sin(an)*R*ph,2.2*(1-ph)+0.5,0,7); c.fill(); }
        atStar4(c,p.x,p.y,R*(0.25+0.1*Math.sin(t/20)),"rgba(255,255,235,.9)"); }
      atImpact(t,440,0.3,0); atImpact(t,820,0.4,0); }},
  /* Dango's Poke Flurry: five quick jabs with the point of its skewer */
  pokeflurry:{C:360,D:1220,contact:true,marks:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1, h=26; if(t<160){ const k=eo(t/160); return {...MV.roll(-d*0.12*k,h),f:-0.04*k,pose:"crouch"}; }
      if(t<360){ const k=eio((t-160)/200); return {...MV.roll(d*1.25*k,h),f:-0.04+0.6*k,pose:"attack"}; }
      if(t<360+5*110){ const p=((t-360)%110)/110; return {...MV.roll(d*1.25,h),f:0.56-0.14*Math.sin(p*Math.PI),pose:"attack"}; }
      const k=(t-910)/310; return {...MV.roll(d*1.25*(1-eo(k)),h),f:0.56*(1-eio(Math.min(1,k))),pose:"idle"}; },
    def(t){ if(t<360||t>960) return null; const p=((t-360)%110)/110; return {off:[(1-p)*6,0],pose:"hit"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x); for(let j=0;j<5;j++){ const k=(t-360-j*110)/220; if(k<0||k>=1) continue; const y=tg.y-R*(0.5-0.22*((j*3)%5)/2); atStar4(c,tg.x-d*R*0.35,y,R*0.4*(1-k),"rgba(255,255,235,.95)"); }
      for(let j=0;j<5;j++) atImpact(t,360+j*110,0.18,0); }},
  /* Dango's Petal Swirl: pink petals blow out of it, ring the target and close in, cutting */
  petalswirl:{C:640,D:1300,
    atk:t=>({pose:t<1000?"cast":"idle",rot:Math.sin(t/120)*0.06,arc:t<1000?-4:0}),
    def:t=>t>=640&&t<1200?{off:[Math.sin(t/15)*2.5,0],pose:"hurt",flash:Math.floor(t/90)%2?2:0}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r; if(t>1200) return;
      for(let i=0;i<14;i++){ const k=Math.max(0,Math.min(1,(t-60-i*18)/520)); if(k<=0) continue; const an=i/14*Math.PI*2+t/170, ring=t<640?R*1.4:R*(1.4-0.9*Math.min(1,(t-640)/300)),
        px=s.x+(tg.x+Math.cos(an)*ring-s.x)*eo(k), py=(s.y-s.r*0.3)+(tg.y-R*0.3+Math.sin(an)*ring*0.5-(s.y-s.r*0.3))*eo(k), a=t<1000?1:1-(t-1000)/200;
        SG.feather(c,px,py,R*0.13,an*2+t/90,`rgba(255,${150+(i%3)*25},${190+(i%2)*30},${0.95*a})`); }
      for(let j=0;j<3;j++){ const k=(t-640-j*120)/220; if(k<0||k>=1) continue; c.strokeStyle=`rgba(255,235,245,${1-k})`; c.lineWidth=3*(1-k)+1; const sd=j%2?1:-1; c.beginPath(); c.moveTo(tg.x-R*0.8*sd,tg.y-R*(0.8-j*0.2)); c.quadraticCurveTo(tg.x,tg.y-R*0.3,tg.x+R*0.8*sd,tg.y+R*(0.1-j*0.1)); c.stroke(); }
      atImpact(t,640,0.25,0); }},
  /* Snooze's Lullaby: sleepy notes drift out of it to the target, which sways and droops */
  lullaby:{C:700,D:1360,
    atk:t=>({pose:atPose(t<1100?"cast":"idle",{eyes:"shut"}),rot:Math.sin(t/180)*0.08,arc:-3*Math.sin(t/180)}),
    def(t){ if(t<700||t>1300) return null; const k=(t-700)/600; return {rot:Math.sin(t/160)*0.14*(1-k*0.5),sy:1-0.08*Math.sin(Math.min(1,k*2)*Math.PI/2),pose:atPose("hurt",{eyes:"shut"})}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r; if(t>1300) return;
      for(let i=0;i<6;i++){ const k=(t-80-i*90)/620; if(k<0||k>1.05) continue; const q=Math.min(1,k), px=s.x+(tg.x-s.x)*q, py=s.y-s.r*0.8+(tg.y-R*0.6-(s.y-s.r*0.8))*q+Math.sin(q*Math.PI*3+i)*12, a=k>0.9?Math.max(0,1-(k-0.9)/0.15):1;
        c.save(); c.globalAlpha*=a; c.translate(px,py); c.rotate(Math.sin(t/150+i)*0.25); c.fillStyle=i%2?"#c9b8ff":"#ffe08a"; c.strokeStyle=c.fillStyle; c.lineWidth=2.2; const z=R*0.16;
        c.beginPath(); c.ellipse(0,0,z*0.75,z*0.55,-0.4,0,7); c.fill(); c.beginPath(); c.moveTo(z*0.65,-z*0.1); c.lineTo(z*0.65,-z*2); if(i%3===0){ c.lineTo(z*1.6,-z*1.6); } c.stroke(); c.restore(); }
      if(t>=700){ const k=(t-700)/600; for(let i=0;i<3;i++){ const ph=((t/500)+i/3)%1; c.fillStyle=`rgba(230,225,255,${(1-ph)*(1-k*0.5)})`; c.font=`bold ${Math.round(R*(0.35+ph*0.3))}px sans-serif`; c.fillText("z",tg.x+R*(0.4+ph*0.5),tg.y-R*(0.9+ph*0.8)); } } }},
  /* Snooze's Bop Barrage: it hops onto the target and bounces on it again and again, with fluff flying out */
  bopbarrage:{C:420,D:1420,contact:true,marks:true,
    atk:t=>{ if(t<160){ const k=eo(t/160); return {sy:1-0.15*k,sx:1+0.1*k,pose:"crouch"}; } if(t<420){ const k=(t-160)/260; return {f:0.72*eo(k),arc:-46*Math.sin(k*Math.PI*0.5),pose:"jump"}; }
      if(t<420+5*130){ const p=((t-420)%130)/130; return {f:0.72,arc:-46+(Math.abs(Math.cos(p*Math.PI))*30)-0,sy:p<0.15?0.82:1.04,sx:p<0.15?1.16:0.97,pose:p<0.2?"hit":"jump"}; }
      const k=(t-1070)/350; return {f:0.72*(1-eio(Math.min(1,k))),arc:-46*(1-eo(Math.min(1,k))),pose:"idle"}; },
    def(t){ if(t<420||t>1100) return null; const p=((t-420)%130)/130; return {sy:p<0.25?0.86:1,sx:p<0.25?1.1:1,off:[Math.sin(t/14)*1.5,0],pose:"hurt"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r; for(let j=0;j<5;j++){ const k=(t-420-j*130)/360; if(k<0||k>=1) continue; for(let i=0;i<5;i++){ const an=-Math.PI*(0.1+0.8*atH(i+j*5)), sp=R*(0.5+1.2*eo(k)); SG.feather(c,tg.x+Math.cos(an)*sp,tg.y-R*0.9+Math.sin(an)*sp+k*k*R,R*0.12,i+k*4,`rgba(255,255,255,${0.95*(1-k)})`); } }
      for(let j=0;j<5;j++) atImpact(t,420+j*130,0.2,0); }},
  /* Trundle's Slime Slide: it leans back, then shoots forward on a shiny slime trail and rams the target */
  slimeslide:{C:440,D:1180,contact:true,marks:true,
    atk:t=>{ if(t<180){ const k=eo(t/180); return {f:-0.05*k,sx:1-0.06*k,sy:1+0.04*k,pose:"crouch"}; } if(t<440){ const k=ei((t-180)/260); return {f:-0.05+0.78*k,sx:1.12,sy:0.9,pose:"tackle"}; }
      if(t<600) return {f:0.73-0.05*Math.sin((t-440)/160*Math.PI),sx:1-0.08*Math.sin((t-440)/160*Math.PI),pose:"tackle"}; const k=(t-600)/580; return {f:0.7*(1-eio(k)),pose:"idle"}; },
    def:t=>SG.knock(t,440,1,36,520),
    fx(c,t,x){ const s=x.self, tg=x.target, d=atDir(x), a=t<900?1:Math.max(0,1-(t-900)/280); if(t>180&&a>0){ const x0=s.x-d*s.r*0.2-d*(t<440?(t-180)/260:1)*Math.abs(tg.x-s.x)*0.75;
        c.fillStyle=`rgba(190,230,255,${0.45*a})`; c.beginPath(); c.ellipse((x0+s.x)/2,s.foot+1,Math.abs(s.x-x0)/2+s.r*0.4,s.r*0.12,0,0,7); c.fill(); c.fillStyle=`rgba(255,255,255,${0.6*a})`; c.beginPath(); c.ellipse((x0+s.x)/2,s.foot,Math.abs(s.x-x0)/2*0.7,s.r*0.035,0,0,7); c.fill(); }
      if(t>180&&t<440) MV.lines(c,s.x,s.y-s.r*0.3,s.r,d,4,1);
      if(t>=440&&t<800){ const k=(t-440)/360; atPow(c,{x:tg.x-d*tg.r*0.4,y:tg.y-tg.r*0.2},k,tg.r/22); for(let i=0;i<6;i++){ const an=-Math.PI*(0.2+0.6*atH(i*7)), sp=tg.r*(0.3+1.1*eo(k)); c.fillStyle=`rgba(180,225,255,${0.9*(1-k)})`; c.beginPath(); c.arc(tg.x-d*tg.r*0.4+Math.cos(an)*sp*-d,tg.y+Math.sin(an)*sp+k*k*tg.r,tg.r*0.07,0,7); c.fill(); } }
      atImpact(t,440,0.45,0.05); }}
});
Object.assign(AR_KIND,{"Saw Throw":"sawthrow","Paper Boomerang":"paperboomer","Roll Bump":"rollbump","Edge Roll":"edgeroll","Big Roll":"bigroll","Rumble Roll":"bigroll",
  "Moss Smear":"mosssmear","Spin Skewer":"spinskewer","Poke Flurry":"pokeflurry","Petal Swirl":"petalswirl","Lullaby":"lullaby","Bop Barrage":"bopbarrage","Slime Slide":"slimeslide",
  "Skip Stone":"boulder","Double Bop":"tackle","Fluff Storm":"volley","Wind Cut":"gust","Gravel Storm":"volley","Icicle Drop":"icefall","Feeler Tickle":"push","Wing Barrage":"wingstorm"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  sawthrow:(d,t)=>{ dNoise(d,t+0.2,0.85,0.08,'bandpass',3200,3); sTone(d,t+0.2,'sawtooth',900,1300,0.3,0.03); dNoise(d,t+0.52,0.08,0.25,'highpass',4000,2); sTone(d,t+0.52,'square',2400,1600,0.06,0.05); },
  paperboomer:(d,t)=>{ dNoise(d,t+0.2,0.85,0.07,'bandpass',1800,1.5); dNoise(d,t+0.52,0.06,0.2,'highpass',3000,1.5); },
  rollbump:(d,t)=>{ dNoise(d,t+0.14,0.3,0.1,'lowpass',500); dKick(d,t+0.44,0.4); },
  edgeroll:(d,t)=>{ dNoise(d,t+0.14,0.38,0.1,'lowpass',500); dNoise(d,t+0.2,0.3,0.06,'highpass',4500,2); dKick(d,t+0.52,0.4); },
  bigroll:(d,t)=>{ dNoise(d,t+0.14,0.42,0.14,'lowpass',380); dKick(d,t+0.56,0.7); dNoise(d,t+0.56,0.4,0.18,'lowpass',300); },
  mosssmear:(d,t)=>{ dNoise(d,t+0.46,0.5,0.12,'lowpass',700); sTone(d,t+0.5,'sine',220,160,0.4,0.05); },
  spinskewer:(d,t)=>{ dNoise(d,t+0.16,0.66,0.08,'bandpass',2400,2); sTone(d,t+0.44,'sawtooth',300,500,0.38,0.035); dKick(d,t+0.82,0.3); },
  pokeflurry:(d,t)=>{ for(let j=0;j<5;j++){ dNoise(d,t+0.36+j*0.11,0.04,0.2,'highpass',3000,1.5); sTone(d,t+0.36+j*0.11,'triangle',1800-j*100,1100,0.05,0.04); } },
  petalswirl:(d,t)=>{ dNoise(d,t+0.06,0.9,0.08,'bandpass',2600,0.6); [0.64,0.76,0.88].forEach(x=>dNoise(d,t+x,0.06,0.16,'highpass',4000,2)); },
  lullaby:(d,t)=>{ [523,659,784,659,523,392].forEach((f,i)=>sTone(d,t+0.1+i*0.16,'sine',f,f,0.22,0.06)); },
  bopbarrage:(d,t)=>{ for(let j=0;j<5;j++) { dKick(d,t+0.42+j*0.13,0.18); dNoise(d,t+0.42+j*0.13,0.08,0.1,'lowpass',900); } },
  slimeslide:(d,t)=>{ dNoise(d,t+0.18,0.26,0.1,'bandpass',600,0.8); sTone(d,t+0.18,'sine',400,200,0.26,0.04); dKick(d,t+0.44,0.5); }
});
if(typeof SWING!=="undefined") ["pokeflurry","spinskewer","bopbarrage"].forEach(k=>SWING.add(k));
/* Trundle's smoke comes out of the top of its shell (the chimney on the Mega), so the steam starts there instead of its mouth */
{ const S0=ANIM.steam.fx; ANIM.steam.fx=(c,t,x)=>{ if(x.fam==="Trundle"&&/Smoke/.test(x.name||"")){ const s=x.self, d=atDir(x); x={...x,from:[{x:s.x+d*s.r*(x.stage==="Mega"?0.3:0.55),y:s.y-s.r*(x.stage==="Mega"?1.35:0.95)}]}; } S0(c,t,x); }; }
/* Gid's notes (16 Nov 2026, night): Dango's Big Roll lies down on its side and rolls in like a rolling pin, and Moss Smear wipes a green streak across the target */
{ const B0=ANIM.bigroll, a0=B0.atk, H={Bit:22,Byte:30,Mega:36};
  B0.atk=(t,o)=>{ if(!o||o.fam!=="Dango") return a0(t,o); const d=o.dir||1, h=H[o.stage]||30, lie=th=>({rot:th,arc:-h*Math.sin(Math.abs(th))*0.55,off:[-h*Math.sin(th)*0.9,0]});
    if(t<200){ const k=eio(t/200); return {...lie(-d*Math.PI/2*k),pose:"crouch"}; }   // tips over onto its side, skewer lying flat
    if(t<560){ const k=ei((t-200)/360), spin=Math.cos(t/26); return {...lie(-d*Math.PI/2),f:0.8*k,sx:0.86+0.14*Math.abs(spin),arc:-h*0.55-2*Math.abs(Math.sin(t/26)),pose:"tackle"}; }   // rolls along its length like a rolling pin
    if(t<700){ const k=(t-560)/140; return {...lie(-d*Math.PI/2),f:0.8-0.08*Math.sin(k*Math.PI),arc:-h*0.55-16*Math.sin(k*Math.PI),pose:"tackle"}; }
    if(t<900){ const k=eio((t-700)/200); return {...lie(-d*Math.PI/2*(1-k)),f:0.76,pose:"idle"}; }
    const k=(t-900)/300; return {f:0.76*(1-eio(Math.min(1,k))),pose:"idle"}; };
  B0.D=1220; }
ANIM.mosssmear={C:420,D:1300,contact:true,marks:true,
  atk:t=>{ if(t<420) return {f:0.6*eio(t/420),pose:t<250?"walk":"attack"}; if(t<820){ const k=(t-420)/400; return {f:0.6+0.05*Math.sin(k*Math.PI),rot:0.16*Math.sin(k*Math.PI*2),pose:"push",off:[0,-6*Math.sin(k*Math.PI)]}; }
    const k=(t-820)/480; return {f:0.6*(1-eio(Math.min(1,k))),pose:"idle"}; },
  def:t=>t>=420&&t<1200?{off:[Math.sin(t/20)*1.5,0],rot:t<820?-0.05*Math.sin((t-420)/400*Math.PI):0,pose:"hurt"}:null,
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), a=t<1050?1:Math.max(0,1-(t-1050)/250); if(a<=0) return;
    if(t<420){ const k=t/420; atGlowA(c,s.x+d*s.r*0.7,s.y-s.r*0.1,s.r*0.35,[110,180,80],0.8*k); c.fillStyle=`rgba(90,150,70,${0.9*k})`; c.beginPath(); c.arc(s.x+d*s.r*0.72,s.y-s.r*0.1,s.r*0.14*k,0,7); c.fill(); return; }   // a handful of moss
    const P=(u,j)=>{ const sx=tg.x-d*R*0.95, sy=tg.y-R*(j?0.15:0.75), ex=tg.x+d*R*0.85, ey=tg.y+R*(j?0.15:-0.2); return {x:sx+(ex-sx)*u,y:sy+(ey-sy)*u+R*0.18*Math.sin(u*Math.PI)}; };
    c.save(); c.globalAlpha*=a; c.lineCap="round"; c.lineJoin="round";
    for(let j=0;j<2;j++){ const k=Math.min(1,Math.max(0,(t-420-j*190)/210)); if(k<=0) continue; const n=Math.ceil(16*k);
      const W=R*(j?0.42:0.55); for(let b=0;b<11;b++){ const o=(b/10-0.5)*W, u0=0.04*atH(b*3+j), u1=k*(0.9+0.1*atH(b*5+j)); if(u1<=u0) continue; c.strokeStyle=`rgba(${60+((b*37)%50)},${115+((b*53)%60)},${45+((b*29)%30)},${0.45+0.4*atH(b*7+j)})`; c.lineWidth=W*(0.1+0.08*atH(b+j*11));
        c.beginPath(); for(let i=0;i<=14;i++){ const u=u0+(u1-u0)*i/14, p=P(u,j); c.lineTo(p.x,p.y+o+Math.sin(u*9+b)*R*0.02); } c.stroke(); }   // brush streaks, ragged at both ends
      for(let i=0;i<5;i++){ const u=i/4*k, p=P(u,j); c.fillStyle="rgba(60,110,50,.75)"; c.beginPath(); c.moveTo(p.x,p.y+R*0.18); c.lineTo(p.x+R*0.05,p.y+R*(0.3+0.12*atH(i+j*5))); c.lineTo(p.x+R*0.1,p.y+R*0.18); c.fill(); }   // drips off the bottom of the streak
      if(k<1){ const p=P(k,j); c.fillStyle="rgba(150,205,110,.9)"; c.beginPath(); c.arc(p.x,p.y,R*0.12,0,7); c.fill(); } }
    if(t>820) for(let i=0;i<6;i++){ const g=Math.min(1,(t-820-i*40)/200); if(g<=0) continue; const p=P(atH(i*7),i%2); c.fillStyle="rgba(120,185,80,.95)"; c.beginPath(); c.arc(p.x,p.y-R*0.1,R*0.09*g,0,7); c.fill(); SG.feather(c,p.x+R*0.06,p.y-R*0.22*g,R*0.08*g,i,"rgba(140,200,90,.95)"); }
    c.restore(); atImpact(t,420,0.25,0); }};

/* Gid (16 Nov 2026, night): the rolling pin roll has Dango's long body pointing at the camera, rolling sideways. The sprite can't turn end-on,
   so for the roll it is drawn end-on here: the front dumpling as a spinning wheel with the skewer's point in the middle and the others peeking out behind */
{ const B0=ANIM.bigroll, a0=B0.atk;
  B0.atk=(t,o)=>{ if(!o||o.fam!=="Dango") return a0(t,o);
    if(t<160){ const k=eio(t/160); return {sy:1-0.65*k,sx:1+0.1*k,alpha:1-k,pose:"crouch"}; }   // tips over toward the camera
    if(t<560){ const k=ei((t-160)/400); return {f:0.8*k,alpha:0,pose:"tackle"}; }
    if(t<700){ const k=(t-560)/140; return {f:0.8-0.08*Math.sin(k*Math.PI),arc:-16*Math.sin(k*Math.PI),alpha:0,pose:"tackle"}; }
    if(t<860){ const k=eio((t-700)/160); return {f:0.72,sy:0.35+0.65*k,alpha:k,pose:"idle"}; }
    const k=(t-860)/360; return {f:0.72*(1-eio(Math.min(1,k))),pose:"idle"}; };
  const f0=B0.fx; B0.fx=(c,t,x)=>{ if(x.fam!=="Dango") return f0(c,t,x); const s=x.self, d=atDir(x), rr=s.r*0.95, a=t<160?eo(t/160):t<700?1:t<860?1-(t-700)/160:0;
    if(a>0){ const n=x.stage==="Bit"?1:3, body=x.body||[220,180,220], mix=(q,w)=>body.map((v,j)=>Math.round(v*(1-w)+q[j]*w)), cols=n===1?[body]:[mix([255,175,195],0.6),body,mix([150,210,120],0.7)], lift=t>=560&&t<700?16*Math.sin((t-560)/140*Math.PI):0,
        cx=s.x, cy=s.foot-rr-lift, th=t<160?0:d*Math.min(t-160,540)/55;
      c.save(); c.globalAlpha*=a;
      c.fillStyle="rgba(0,0,0,.18)"; c.beginPath(); c.ellipse(cx,s.foot,rr*0.9,rr*0.2,0,0,7); c.fill();
      for(let i=n-1;i>=1;i--){ const z=rr*(1-0.1*i), oy=-rr*0.2*i, col=cols[i%3]; c.fillStyle=atRgba(col.map(v=>v*0.85),1); c.strokeStyle=atRgba(col.map(v=>v*0.55),1); c.lineWidth=2; c.beginPath(); c.arc(cx,cy+oy,z,0,7); c.fill(); c.stroke(); }   // the dumplings further back peek out above
      c.translate(cx,cy); const g=c.createRadialGradient(-rr*0.35,-rr*0.35,rr*0.1,0,0,rr); g.addColorStop(0,atRgba(cols[0].map(v=>Math.min(255,v+50)),1)); g.addColorStop(1,atRgba(cols[0],1));
      c.fillStyle=g; c.strokeStyle=atRgba(cols[0].map(v=>v*0.55),1); c.lineWidth=2.4; c.beginPath(); c.arc(0,0,rr,0,7); c.fill(); c.stroke();
      c.save(); c.rotate(th); c.fillStyle=atRgba(cols[0].map(v=>v*0.78),0.9); for(let i=0;i<3;i++){ const an=i/3*Math.PI*2; c.beginPath(); c.ellipse(Math.cos(an)*rr*0.6,Math.sin(an)*rr*0.6,rr*0.13,rr*0.08,an,0,7); c.fill(); }
      c.strokeStyle=atRgba(cols[0].map(v=>v*0.7),0.7); c.lineWidth=1.6; c.beginPath(); c.arc(0,0,rr*0.78,0.3,1.6); c.stroke(); c.beginPath(); c.arc(0,0,rr*0.78,3.4,4.7); c.stroke(); c.restore();
      c.fillStyle="#b08850"; c.beginPath(); c.arc(0,0,rr*0.16,0,7); c.fill(); c.fillStyle="#f2dcae"; c.beginPath(); c.arc(-rr*0.04,-rr*0.04,rr*0.07,0,7); c.fill();   // the skewer's point facing the camera
      c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-rr*0.4,-rr*0.5,rr*0.22,rr*0.1,-0.6,0,7); c.fill(); c.restore();
      if(t>160&&t<560){ SG.dust(c,cx-d*rr*0.8,s.foot,rr*0.6,((t-160)%200)/200,4); MV.lines(c,cx,cy,rr*1.2,d,4,1); } }
    const tg=x.target; if(t>=560&&t<960){ const k=(t-560)/400; atPow(c,{x:tg.x-d*tg.r*0.4,y:tg.y-tg.r*0.2},k,tg.r/20); }
    atImpact(t,560,0.6,0.1); }; }

/* group 4 (16 Nov 2026): Twiglet, Swirl, Ditty, Sizzle, Aero, Nesta, Magna, Helm, Bloop, Sox */
/* Nesta's sisters: the top half of the doll lifts, a smaller doll pops out and hops across to bonk the target, and Sister Parade sends four in a row */
MV.doll=(c,x,y,z,col,rot=0)=>{ c.save(); c.translate(x,y); c.rotate(rot); const dk=col.map(v=>v*0.6), lt=col.map(v=>Math.min(255,v+45));
  c.fillStyle=atRgba(col,1); c.strokeStyle=atRgba(dk,1); c.lineWidth=1.6; c.beginPath(); c.ellipse(0,z*0.35,z*0.62,z*0.62,0,0,7); c.fill(); c.stroke();   // body
  c.beginPath(); c.arc(0,-z*0.45,z*0.42,0,7); c.fill(); c.stroke(); c.fillStyle="#ffe9d6"; c.beginPath(); c.arc(0,-z*0.42,z*0.28,0,7); c.fill();   // head and face
  c.fillStyle="#3a2a2a"; c.beginPath(); c.arc(-z*0.1,-z*0.44,z*0.045,0,7); c.arc(z*0.1,-z*0.44,z*0.045,0,7); c.fill(); c.fillStyle="rgba(255,120,140,.6)"; c.beginPath(); c.arc(-z*0.17,-z*0.34,z*0.05,0,7); c.arc(z*0.17,-z*0.34,z*0.05,0,7); c.fill();
  c.fillStyle=atRgba(lt,1); c.beginPath(); c.arc(0,z*0.4,z*0.22,0,7); c.fill(); c.fillStyle="rgba(255,160,180,.9)"; c.beginPath(); c.arc(0,z*0.4,z*0.1,0,7); c.fill(); c.restore(); };   // a flower on the apron
function mvSisters(n){ const C=560, gap=110, end=C+(n-1)*gap;
  return {C,D:end+620,
    atk:t=>{ const open=t<200?eo(t/200):t<end+200?1:1-eo(Math.min(1,(t-end-200)/200)); return {pose:t<end+200?"cast":"idle",sy:1+0.06*open,arc:-4*open}; },
    def(t){ if(t<C||t>end+420) return null; const p=((t-C)%gap)/gap; return {off:[(1-p)*6,0],pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, d=atDir(x), col=x.parts||x.body||[200,120,200], top=s.top?{x:s.x,y:s.top.y+s.r*0.2}:{x:s.x,y:s.y-s.r*1.3}, open=t<200?eo(t/200):t<end+200?1:Math.max(0,1-(t-end-200)/200);
      if(open>0){ c.save(); c.translate(top.x,top.y-14*open); c.rotate(-d*0.5*open); c.globalAlpha*=Math.min(1,open*2); c.fillStyle=atRgba(col,0.95); c.strokeStyle=atRgba(col.map(v=>v*0.55),1); c.lineWidth=1.6; c.beginPath(); c.ellipse(0,0,s.r*0.8,s.r*0.5,0,Math.PI,0); c.closePath(); c.fill(); c.stroke(); c.restore(); }   // the lid half of the doll lifts off
      for(let j=0;j<n;j++){ const t0=180+j*gap, k=(t-t0)/(C-180); if(k<0) continue; const z=s.r*(0.8-0.06*j);
        if(k<1){ const q=ei(k), px=top.x+(tg.x-d*tg.r*0.5-top.x)*q, py=top.y+(tg.y-tg.r*0.2-top.y)*q-Math.abs(Math.sin(q*Math.PI*2))*s.r*0.9*(1-q*0.4); MV.doll(c,px,py,z,col,d*q*Math.PI*2*0.25*Math.sin(q*Math.PI*2)); }
        else { const b=(t-t0-(C-180))/360; if(b<1){ const px=tg.x-d*tg.r*(0.5+0.9*eo(b)), py=tg.y-tg.r*0.2-Math.sin(b*Math.PI)*tg.r*0.8; c.globalAlpha=1-b*b; MV.doll(c,px,py,z,col,-d*b*2); c.globalAlpha=1; if(b<0.5) atStar4(c,tg.x-d*tg.r*0.35,tg.y-tg.r*0.3,tg.r*0.5*(1-b*2),"rgba(255,255,235,.95)"); } } }
      for(let j=0;j<n;j++) atImpact(t,C+j*gap,0.2,0); }}; }
Object.assign(ANIM,{dolltoss:mvSisters(1),dollparade:mvSisters(4)});
Object.assign(AR_KIND,{"Little Sister":"dolltoss","Big Sister":"dolltoss","Sister Parade":"dollparade"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  dolltoss:(d,t)=>{ sTone(d,t+0.05,'triangle',500,900,0.12,0.05); [0.3,0.42].forEach(x=>sTone(d,t+x,'sine',700,500,0.08,0.04)); dNoise(d,t+0.56,0.05,0.2,'bandpass',1500,1.5); dKick(d,t+0.56,0.2); },
  dollparade:(d,t)=>{ sTone(d,t+0.05,'triangle',500,900,0.12,0.05); for(let j=0;j<4;j++){ sTone(d,t+0.2+j*0.11,'sine',900-j*80,600,0.07,0.04); dNoise(d,t+0.56+j*0.11,0.05,0.18,'bandpass',1500,1.5); dKick(d,t+0.56+j*0.11,0.15); } }
});

/* Bloop's Big Swat: it rears up, then its tentacles sweep sideways across the target in one big slap that knocks it spinning */
ANIM.bigswat={C:440,D:1120,contact:true,marks:true,
  atk:(t,o)=>{ const d=(o&&o.dir)||1, len={Bit:16,Byte:48,Mega:78}[o&&o.stage]||48, reach=Math.max(0.3,Math.min(2.4,(((o&&o.gapU)||90)-len+14)/100));
    if(o&&o.fam==="Bloop"){   // Gid: swat with its own tentacles
      if(t<220){ const k=eo(t/220); return {f:0.12*k,arc:-10*k,rot:d*0.12*k,pose:atPose("attack",{lash:reach*0.55*k+0.01,swat:-1.2*k})}; }
      if(t<620){ const k=(t-220)/220; return {f:0.12,arc:-10,rot:d*(0.12-0.2*Math.min(1,k)),pose:atPose("attack",{lash:reach*(k<1?0.55+0.45*ei(k):1),swat:-1.2+1.2*ei(Math.min(1,k))+(k>1?0.9*eo((k-1)/0.8):0)})}; }
      const k=(t-620)/500; return {f:0.12*(1-eio(k)),arc:-10*(1-k),rot:-d*0.08*(1-eo(k)),pose:atPose("idle",{lash:reach*(1-eo(Math.min(1,k*1.4)))+0.001,swat:0.9*(1-k)})}; }
    if(t<220){ const k=eo(t/220); return {f:0.2*k,rot:-d*0.35*k,arc:-12*k,sy:1+0.06*k,pose:"crouch"}; }
    if(t<440){ const k=ei((t-220)/220); return {f:0.2+0.38*k,rot:-d*0.35+d*0.85*k,arc:-12+6*k,pose:"attack"}; }
    if(t<620) return {f:0.58,rot:d*0.5,arc:-6,pose:"attack"};
    const k=(t-620)/500; return {f:0.58*(1-eio(k)),rot:d*0.5*(1-eo(k)),arc:-6*(1-k),pose:"idle"}; },
  def:t=>{ if(t<440||t>1000) return null; const k=(t-440)/560; return {off:[34*(1-eo(k)),-10*Math.sin(Math.min(1,k*2)*Math.PI)],rot:0.5*Math.sin(Math.min(1,k*1.5)*Math.PI),pose:"hit"}; },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=x.parts||x.body||[200,170,230];
    if(x.fam!=="Bloop"&&t>=140&&t<760){ const k=t<440?eio((t-140)/300):1, fade=t<580?1:1-(t-580)/180, base={x:s.x+d*s.r*0.2,y:s.y+s.r*0.15}, tc=col.map(v=>Math.min(255,v+30));
      c.save(); c.globalAlpha*=fade; c.lineCap="round";
      for(let i=0;i<4;i++){ const sw=-1.3+2.1*k+i*0.12, L=Math.abs(tg.x-base.x)+R*(0.4-i*0.08), tip={x:base.x+d*Math.cos(sw)*L,y:base.y+Math.sin(sw)*L*0.75}, mid={x:base.x+d*L*0.45,y:base.y-R*0.6*(1-k)+(i-1.5)*R*0.12};   // each tentacle swings from high over the target down across it
        for(let j=0;j<12;j++){ const u0=j/12, u1=(j+1)/12, P=u=>({x:(1-u)*(1-u)*base.x+2*(1-u)*u*mid.x+u*u*tip.x,y:(1-u)*(1-u)*base.y+2*(1-u)*u*mid.y+u*u*tip.y+Math.sin(u*6+t/50+i)*R*0.05}), a=P(u0), b=P(u1);
          c.strokeStyle=atRgba(j%3?tc:tc.map(v=>v*0.85),0.95); c.lineWidth=R*0.17*(1-u0*0.75); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); } }
      if(t>300&&t<560) for(let i=0;i<3;i++){ const sw=-1.3+2.1*k-0.25-i*0.12, L=Math.abs(tg.x-base.x)+R*0.5; c.strokeStyle=`rgba(255,255,255,${0.55-i*0.15})`; c.lineWidth=3; c.beginPath(); c.arc(base.x,base.y,L,d>0?sw-0.2:Math.PI-sw,d>0?sw:Math.PI-sw+0.2); c.stroke(); }
      c.restore(); }
    if(t>=440&&t<800){ const k=(t-440)/360; atStar4(c,tg.x-d*R*0.2,tg.y-R*0.3,R*0.9*(1-k),"rgba(255,255,240,.95)"); for(let i=0;i<8;i++){ const an=(d>0?0:Math.PI)+(atH(i*3)-0.5)*1.4, sp=R*(0.4+1.4*eo(k)); c.fillStyle=`rgba(190,230,255,${0.9*(1-k)})`; c.beginPath(); c.arc(tg.x+Math.cos(an)*sp,tg.y-R*0.3+Math.sin(an)*sp*0.6,R*0.08,0,7); c.fill(); } }
    atImpact(t,440,0.55,0.08); }};
Object.assign(AR_KIND,{"Big Swat":"bigswat"});
if(typeof KSND!=="undefined") KSND.bigswat=(d,t)=>{ dNoise(d,t+0.22,0.22,0.12,'bandpass',900,0.7); dNoise(d,t+0.44,0.12,0.35,'highpass',1800,0.8); dKick(d,t+0.44,0.5); dNoise(d,t+0.46,0.3,0.1,'lowpass',600); };

/* group 5 (16 Nov 2026): Cuppy, Suds, Scoop, Tome, Gumball, Pina, Jingle, Presto, Vroom, Shutter */
/* Tome's Page Cyclone: loose pages blow out of the book, ring the target and close in, cutting (Petal Swirl with pages) */
MV.page=(c,x,y,z,rot,a)=>{ if(a<=0) return; c.save(); c.globalAlpha*=a; c.translate(x,y); c.rotate(rot); c.fillStyle="#fbf7ec"; c.strokeStyle="rgba(120,100,80,.8)"; c.lineWidth=1; c.fillRect(-z*0.7,-z,z*1.4,z*2); c.strokeRect(-z*0.7,-z,z*1.4,z*2);
  c.strokeStyle="rgba(90,90,110,.55)"; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-z*0.45,-z*0.6+i*z*0.38); c.lineTo(z*0.45,-z*0.6+i*z*0.38); c.stroke(); } c.restore(); };
{ const P=ANIM.petalswirl; ANIM.pageswirl={...P,fx(c,t,x){ const F=SG.feather; SG.feather=(cc,px,py,z,rot,col)=>{ const m=/,([\d.]+)\)$/.exec(col); MV.page(cc,px,py,z*1.5,rot*0.4,m?+m[1]:1); }; try{ P.fx(c,t,x); } finally { SG.feather=F; } }}; }
/* Jingle's Coin Flick and Coin Toss: a gold coin flies out spinning instead of a tooth */
MV.coin=(c,x,y,z,rot,a=1)=>{ c.save(); c.globalAlpha*=a; c.translate(x,y); const w=Math.abs(Math.cos(rot)); c.scale(Math.max(0.15,w),1); c.fillStyle="#f4c542"; c.strokeStyle="#b8860b"; c.lineWidth=2; c.beginPath(); c.arc(0,0,z*1.1,0,7); c.fill(); c.stroke();
  c.strokeStyle="rgba(184,134,11,.8)"; c.lineWidth=1.4; c.beginPath(); c.arc(0,0,z*0.75,0,7); c.stroke(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(-z*0.35,-z*0.4,z*0.3,z*0.14,-0.6,0,7); c.fill(); c.restore(); };
{ const T=ANIM.toothshot; ANIM.coinflick={...T,atk:t=>({pose:t<200?"determined":t<700?"push":"idle",sy:t<200?1-0.08*eo(t/200):1}),fx(c,t,x){ const M=MV.tooth; MV.tooth=MV.coin; try{ T.fx(c,t,x); } finally { MV.tooth=M; } if(t>=520&&t<900) for(let i=0;i<5;i++){ const k=(t-520)/380; atStar4(c,x.target.x+Math.cos(i*1.3)*x.target.r*(0.4+k),x.target.y-x.target.r*0.3+Math.sin(i*1.3)*x.target.r*0.5*(0.4+k),x.target.r*0.14*(1-k),"#ffe27a"); } }}; }
/* Shutter's snapshots: the lens flashes and a photo frame snaps shut over the target, once, twice or four times; Freeze Frame's photo frosts over */
function mvSnaps(n,frost){ const C=420, gap=150, end=C+(n-1)*gap;
  return {C,D:end+620,
    atk:t=>({pose:t<end+200?"cast":"idle",sy:1-0.04*Math.max(0,Math.sin(((t-C+60)%gap)/gap*Math.PI))*(t>C-60&&t<end+60?1:0)}),
    def(t){ if(t<C) return null; if(frost&&t<end+900) return {pose:"hurt",flash:t<C+80?3:0,alpha:1,off:[0,0]}; if(t>end+380) return null; const p=((t-C)%gap)/gap; return {off:[(1-p)*5,0],pose:"hurt",flash:p<0.25?2:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), lens={x:s.x+d*s.r*0.75,y:s.y-s.r*0.1};
      if(t<C+(n-1)*gap+60){ const p=((t-C+80)%gap)/gap; if(t>C-80){ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,lens.x,lens.y,s.r*(0.4+0.8*(1-p)),[255,255,240],0.9*(1-p)); c.restore(); } }
      for(let j=0;j<n;j++){ const k=(t-C-j*gap)/(frost?700:300); if(k<0||k>=1) continue; const w=R*2.3, h=R*2, cx=tg.x, cy=tg.y-R*0.3, a=1-k*k;
        c.save(); c.globalAlpha*=a; c.fillStyle=`rgba(255,255,255,${0.55*(1-Math.min(1,k*3))})`; c.fillRect(cx-w/2,cy-h/2,w,h);
        c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=R*0.12; c.strokeRect(cx-w/2,cy-h/2,w,h); c.lineWidth=2.4; c.strokeStyle="rgba(30,30,40,.7)";   // the photo's white border and the focus corners
        for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ c.beginPath(); c.moveTo(cx+sx*w*0.36,cy+sy*h*0.42); c.lineTo(cx+sx*w*0.42,cy+sy*h*0.42); c.lineTo(cx+sx*w*0.42,cy+sy*h*0.3); c.stroke(); }
        if(frost){ c.fillStyle=`rgba(190,230,255,${0.45*Math.min(1,k*3)})`; c.fillRect(cx-w/2,cy-h/2,w,h); c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=1.5; for(let i=0;i<6;i++){ const an=i/6*Math.PI*2; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.cos(an)*R*0.9*Math.min(1,k*2.5),cy+Math.sin(an)*R*0.9*Math.min(1,k*2.5)); c.stroke(); } }
        c.restore(); }
      for(let j=0;j<n;j++) atImpact(t,C+j*gap,0.15,j===0?0.15:0.05); }}; }
Object.assign(ANIM,{snapshot2:mvSnaps(2),snapshot4:mvSnaps(4),freezeframe:mvSnaps(1,true)});
Object.assign(AR_KIND,{"Coin Toss":"coinflick"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  pageswirl:(d,t)=>{ dNoise(d,t+0.06,0.9,0.1,'bandpass',1800,0.5); [0.64,0.76,0.88].forEach(x=>dNoise(d,t+x,0.05,0.18,'highpass',3500,2)); },
  coinflick:(d,t)=>{ sTone(d,t+0.22,'square',1800,2400,0.05,0.03); [0.52,0.6].forEach(x=>{ sTone(d,t+x,'triangle',2637,2637,0.18,0.06); sTone(d,t+x,'triangle',3951,3951,0.14,0.03); }); },
  snapshot2:(d,t)=>{ [0.42,0.57].forEach(x=>{ dNoise(d,t+x-0.02,0.03,0.25,'highpass',4000,2); dNoise(d,t+x+0.03,0.04,0.2,'bandpass',1500,2); }); },
  snapshot4:(d,t)=>{ [0.42,0.57,0.72,0.87].forEach(x=>{ dNoise(d,t+x-0.02,0.03,0.25,'highpass',4000,2); dNoise(d,t+x+0.03,0.04,0.2,'bandpass',1500,2); }); },
  freezeframe:(d,t)=>{ dNoise(d,t+0.4,0.03,0.3,'highpass',4000,2); dNoise(d,t+0.45,0.04,0.2,'bandpass',1500,2); sTone(d,t+0.46,'sine',2400,1200,0.5,0.04); dNoise(d,t+0.5,0.5,0.06,'highpass',6000,1); }
});
/* Gid (16 Nov 2026, night): Tome's Slam Shut hops onto the target, opens its own covers wide and claps shut on it;
   Scoop's Freezer Burn presses its cold scoop onto the target and frost spreads over it instead of launching a wave */
ANIM.bookslam={C:520,D:1240,
  atk:t=>{ if(t<260){ const k=eio(t/260); return {f:1.0*k,arc:-95*Math.sin(k*Math.PI*0.5),pose:"jump"}; }   // leaps up over the target
    if(t<460){ const k=eo((t-260)/200); return {f:1.0,arc:-95-6*k,sx:1+0.6*k,sy:1+0.1*k,pose:"cast"}; }   // the covers swing open wide above it
    if(t<520){ const k=ei((t-460)/60); return {f:1.0,arc:-101+60*k,sx:1.6-1.5*k,sy:1.1,pose:"determined"}; }   // and slam shut down onto it
    if(t<760) return {f:1.0,arc:-41,sx:0.1+0.03*Math.sin(t/12),sy:1.1,pose:"determined"};
    if(t<900){ const k=eo((t-760)/140); return {f:1.0,arc:-41-30*Math.sin(k*Math.PI),sx:0.13+0.87*k,pose:"jump"}; }
    const k=(t-900)/340; return {f:1.0*(1-eio(k)),arc:-50*Math.sin(Math.min(1,k)*Math.PI)*(1-k*0.3),pose:"idle"}; },
  def:t=>{ if(t<520||t>900) return null; return {sx:t<760?0.82:1,sy:t<760?1.04:1,off:[Math.sin(t/14)*2,0],pose:"hurt"}; },
  fx(c,t,x){ const tg=x.target, R=tg.r;
    if(t>=280&&t<520) for(let i=0;i<6;i++){ const ph=((t/180)+i/6)%1; MV.page(c,tg.x+(i-2.5)*R*0.45,tg.y-R*(1.4+ph*0.8),R*0.16,(i-2.5)*0.5+ph,1-ph); }   // pages flutter as it opens
    if(t>=520&&t<900){ const k=(t-520)/380; atPow(c,{x:tg.x,y:tg.y-R*0.3},Math.min(1,k*1.4),R/20); SG.dust(c,tg.x,tg.foot,R*0.9,k,8); for(let i=0;i<5;i++) MV.page(c,tg.x+(i-2)*R*0.5*(1+k),tg.y-R*0.4-R*1.2*k*(1+0.2*i),R*0.15,i+k*4,1-k); }
    atImpact(t,520,0.6,0.12); }};
ANIM.frostpress={C:420,D:1300,contact:true,marks:true,
  atk:t=>({f:t<420?0.62*eio(t/420):t<860?0.62:0.62*(1-eio((t-860)/360)),pose:t<260?"walk":t<860?"push":"idle",sy:t>420&&t<860?0.95:1}),
  def:t=>t>=420&&t<1200?{off:[Math.sin(t/12)*1.5,0],pose:"hurt",sx:0.97}:null,
  fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x); if(t<420) return; const k=Math.min(1,(t-420)/520), a=t<1000?1:Math.max(0,1-(t-1000)/280); if(a<=0) return;
    const p={x:tg.x-d*R*0.55,y:tg.y-R*0.25};
    c.save(); c.globalAlpha*=a; const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,R*(0.3+1.1*k)); g.addColorStop(0,"rgba(235,248,255,.85)"); g.addColorStop(0.7,"rgba(170,215,250,.45)"); g.addColorStop(1,"rgba(170,215,250,0)"); c.fillStyle=g; c.beginPath(); c.arc(p.x,p.y,R*(0.3+1.1*k),0,7); c.fill();   // frost spreading from where it touched
    c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=1.6; for(let i=0;i<9;i++){ const an=i/9*Math.PI*2+0.3, L=R*(0.25+0.85*k)*(0.7+0.3*atH(i*5)); c.beginPath(); c.moveTo(p.x,p.y); c.lineTo(p.x+Math.cos(an)*L,p.y+Math.sin(an)*L); c.stroke();
      c.beginPath(); c.moveTo(p.x+Math.cos(an)*L*0.6,p.y+Math.sin(an)*L*0.6); c.lineTo(p.x+Math.cos(an+0.5)*L*0.8,p.y+Math.sin(an+0.5)*L*0.8); c.stroke(); }   // ice crystals branch out
    for(let i=0;i<5;i++){ const ph=((t/500)+i/5)%1; SG.puff(c,tg.x+(i-2)*R*0.4,tg.y-R*(0.5+ph*0.9),R*(0.15+0.15*ph),0.6*(1-ph),[225,240,255]); }   // cold mist rising
    for(let i=0;i<4;i++){ const ph=((t/700)+i/4)%1; atStar4(c,tg.x+Math.cos(i*1.6)*R*0.7,tg.y-R*0.3+Math.sin(i*1.6)*R*0.6,R*0.12*(1-ph),"rgba(255,255,255,.95)"); }
    c.restore(); atImpact(t,420,0.25,0.05); }};
Object.assign(AR_KIND,{"Slam Shut":"bookslam","Freezer Burn":"frostpress"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  bookslam:(d,t)=>{ dNoise(d,t+0.26,0.2,0.08,'bandpass',2500,0.8); dKick(d,t+0.52,0.8); dNoise(d,t+0.52,0.12,0.4,'bandpass',900,1.2); dNoise(d,t+0.54,0.3,0.12,'lowpass',500); },
  frostpress:(d,t)=>{ dNoise(d,t+0.42,0.6,0.1,'highpass',5000,0.8); sTone(d,t+0.42,'sine',2200,1800,0.5,0.03); [0.5,0.62,0.74].forEach(x=>sTone(d,t+x,'triangle',3200,2800,0.06,0.03)); }
});

/* group 6 (16 Nov 2026): Yoyo, Lava, Pogo, Eagle, Vampire, Phoenix, Kitsune, Naga, Yeti, Kraken */
/* Yoyo's own body flies out on its string: Long Throw shoots straight at the target and snaps back, Loop the Loop swings a full loop first.
   The string runs from where it was standing, kept per target so two fights never share one */
const MV_YO=new Map();
function mvYoString(c,t,x){ const s=x.self, key=Math.round(x.target.x)+"|"+Math.round(x.target.foot); if(t<70||!MV_YO.has(key)) MV_YO.set(key,{x:s.x,y:s.y-s.r*1.4});
  const a=MV_YO.get(key); c.strokeStyle="rgba(250,250,250,.9)"; c.lineWidth=1.6; c.beginPath(); c.moveTo(a.x,a.y); c.quadraticCurveTo((a.x+s.x)/2,Math.min(a.y,s.y)-8,s.x,s.y-s.r*0.1); c.stroke();
  c.fillStyle="#c9ced6"; c.beginPath(); c.arc(a.x,a.y,3,0,7); c.fill(); }
ANIM.yoyothrow={C:380,D:1000,contact:true,marks:true,
  atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<140){ const k=eo(t/140); return {f:-0.06*k,sx:Math.max(0.25,Math.abs(Math.cos(t/40))),pose:"crouch"}; }
    if(t<380){ const k=ei((t-140)/240); return {f:-0.06+0.78*k,sx:Math.max(0.25,Math.abs(Math.cos(k*Math.PI*6))),arc:-6*Math.sin(k*Math.PI),pose:"tackle"}; }
    if(t<540) return {f:0.72,sx:Math.max(0.25,Math.abs(Math.cos(t/40))),pose:"tackle"};   // hangs at the end of the string, still spinning
    const k=(t-540)/460; return {f:0.72*(1-eio(Math.min(1,k*1.3))),sx:Math.max(0.25,Math.abs(Math.cos(t/40))),pose:"idle"}; },
  def:t=>SG.knock(t,380,1,26,440),
  fx(c,t,x){ if(t<1000) mvYoString(c,t,x); const tg=x.target, d=atDir(x); if(t>=380&&t<720){ const k=(t-380)/340; atStar4(c,tg.x-d*tg.r*0.4,tg.y-tg.r*0.2,tg.r*0.55*(1-k),"rgba(255,255,240,.95)"); } atImpact(t,380,0.3,0); }};
ANIM.yoyoloop={C:640,D:1260,contact:true,marks:true,
  atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<140){ const k=eo(t/140); return {f:-0.05*k,pose:"crouch"}; }
    if(t<640){ const k=ei((t-140)/500), ph=k*(Math.PI*2.5); return {f:0.4+0.32*Math.sin(ph),sx:Math.max(0.25,Math.abs(Math.cos(k*Math.PI*8))),arc:-46*(1-Math.cos(ph)),pose:"tackle"}; }   // a full vertical loop on the string, then in at the middle
    if(t<760) return {f:0.72,sx:Math.max(0.25,Math.abs(Math.cos(t/40))),arc:-46,pose:"tackle"};
    const k=(t-760)/500; return {f:0.72*(1-eio(Math.min(1,k*1.2))),arc:-46*(1-eo(Math.min(1,k*1.4))),pose:"idle"}; },
  def:t=>SG.knock(t,640,1,30,460),
  fx(c,t,x){ if(t<1260) mvYoString(c,t,x); const s=x.self, tg=x.target, d=atDir(x);
    if(t>200&&t<640){ c.strokeStyle="rgba(255,255,255,.5)"; c.lineWidth=3; c.beginPath(); c.arc(s.x,s.y,s.r*1.1,t/40,t/40+1.6); c.stroke(); }
    if(t>=640&&t<1000){ const k=(t-640)/360; atStar4(c,tg.x-d*tg.r*0.4,tg.y-tg.r*0.5,tg.r*0.6*(1-k),"rgba(255,255,240,.95)"); c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=3; c.beginPath(); c.arc(tg.x-d*tg.r*0.4,tg.y-tg.r*0.5,tg.r*(0.4+0.9*k),0,7); c.stroke(); }
    atImpact(t,640,0.4,0.05); }};
/* Kraken's Drag Under: both long arms reach out and wrap the target, then haul it down under a splash of water and drop it back */
ANIM.dragunder={C:420,D:1600,contact:true,marks:true,
  atk:(t,o)=>{ if(mvMode(o)!=="tent") return ANIM.vicegrip.atk(t,o); const k=t<420?mvStrikeK(t,420,1,1):t<1240?1+0.04*Math.sin(t/30):1-eio(Math.min(1,(t-1240)/320)); return {f:0,pose:mvReach(o,k,true),arc:t>500&&t<1240?6*Math.sin((t-500)/740*Math.PI):0,off:[t>420&&t<1240?Math.sin(t/25)*2:0,0]}; },
  def(t){ if(t<420||t>1400) return null; if(t<560) return {off:[Math.sin(t/12)*2,0],pose:"hurt"}; if(t<1000){ const k=eio((t-560)/440); return {arc:60*k,alpha:1-0.9*k,sy:1-0.2*k,pose:"hurt"}; }
    if(t<1200){ const k=eo((t-1000)/200); return {arc:60-110*k,alpha:0.1+0.9*k,pose:"hurt"}; } const k=(t-1200)/200; return {arc:-50*(1-ei(k)),pose:"hurt"}; },
  fx(c,t,x){ const tg=x.target, R=tg.r;
    if(t>=520&&t<1300){ const k=Math.min(1,(t-520)/400), fade=t<1150?1:1-(t-1150)/150; c.save(); c.globalAlpha*=fade; c.fillStyle="rgba(40,90,160,.55)"; c.beginPath(); c.ellipse(tg.x,tg.foot,R*(0.6+0.9*k),R*0.28*(0.6+0.9*k),0,0,7); c.fill();   // a dark pool opens under it
      c.strokeStyle="rgba(200,235,255,.8)"; c.lineWidth=2.4; for(let i=0;i<3;i++){ const ph=((t/500)+i/3)%1; c.beginPath(); c.ellipse(tg.x,tg.foot,R*(0.5+1.1*ph),R*0.24*(0.5+1.1*ph),0,0,7); c.stroke(); } c.restore(); }
    for(const [t0,up] of [[560,0],[1000,1]]){ const k=(t-t0)/380; if(k<0||k>1) continue; for(let i=0;i<10;i++){ const an=-Math.PI*(0.15+0.7*atH(i*3+up)), sp=R*(0.4+1.6*eo(k)); c.fillStyle=`rgba(170,215,255,${0.9*(1-k)})`; c.beginPath(); c.arc(tg.x+Math.cos(an)*sp,tg.foot-R*0.1+Math.sin(an)*sp+k*k*R*1.6,R*0.08,0,7); c.fill(); } }
    atImpact(t,420,0.3,0); atImpact(t,1200,0.4,0); }};
Object.assign(AR_KIND,{"Heat Shimmer":"flash"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  yoyothrow:(d,t)=>{ dNoise(d,t+0.14,0.24,0.08,'bandpass',2200,1.5); sTone(d,t+0.14,'sine',500,900,0.24,0.03); dKick(d,t+0.38,0.3); dNoise(d,t+0.54,0.3,0.06,'bandpass',2000,1.5); },
  yoyoloop:(d,t)=>{ dNoise(d,t+0.14,0.5,0.08,'bandpass',2000,1.2); sTone(d,t+0.14,'sine',400,1000,0.5,0.03); dKick(d,t+0.64,0.4); },
  dragunder:(d,t)=>{ dNoise(d,t+0.3,0.12,0.12,'bandpass',900,1); sTone(d,t+0.56,'sine',300,90,0.45,0.08); dNoise(d,t+0.56,0.5,0.14,'lowpass',500); dNoise(d,t+1.0,0.3,0.18,'lowpass',700); dKick(d,t+1.2,0.5); }
});
/* Gid (17 Nov 2026): Vampire's Wing Wrap drapes its cape round the target and squeezes, instead of a pair of wings */
ANIM.capewrap={C:460,D:1360,contact:true,marks:true,
  atk:t=>({f:t<460?0.55*eio(t/460):t<1050?0.55:0.55*(1-eio((t-1050)/300)),pose:t<300?"walk":t<1050?"push":"idle",sx:t>460&&t<1050?1.04:1}),
  def(t){ if(t<460||t>1150) return null; const sq=t<1050?0.1*Math.min(1,(t-460)/200):0; return {sx:1-sq,sy:1+sq*0.4,off:[Math.sin(t/14)*1.5,0],pose:"hurt"}; },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t<200||t>1200) return;
    const k=t<460?eio((t-200)/260):t<1050?1:1-eio((t-1050)/150), S={x:s.x+d*s.r*0.15,y:s.y-s.r*0.75}, cx=tg.x, cy=tg.y-R*0.25, rr=R*1.18, a0=-Math.PI/2, sweep=d*Math.PI*1.25*k;
    const red=[178,28,48], lining=[90,10,30], wob=t<1050?Math.sin(t/60)*R*0.04:0;
    const flap=()=>{ c.beginPath(); c.moveTo(S.x,S.y); c.quadraticCurveTo((S.x+cx)/2,cy-rr*1.1,cx,cy-rr);
      const n=20; for(let i=1;i<=n;i++){ const a=a0+sweep*i/n, r2=rr*(i%2?1.1:0.96)+wob*Math.sin(i); c.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2); }   // the bat-wing points along its edge
      const e={x:cx+Math.cos(a0+sweep)*rr,y:cy+Math.sin(a0+sweep)*rr}, hem=Math.max(e.y,tg.foot); for(let i=0;i<=8;i++){ const q=i/8; c.lineTo(e.x+(S.x-e.x)*q,hem+Math.sin(q*Math.PI*4+t/80)*R*0.06-(hem-S.y-s.r*0.9)*q*q); } c.closePath(); };
    c.save(); flap(); c.fillStyle=atRgba(lining,0.96); c.fill(); c.save(); c.clip(); c.fillStyle=atRgba(red,0.95); c.beginPath(); c.arc(cx-d*R*0.2,cy-R*0.2,rr*1.15,0,7); c.fill();
    c.strokeStyle=atRgba(red.map(v=>v*0.6),0.7); c.lineWidth=2; for(let i=0;i<5;i++){ const a=a0+sweep*(0.2+i*0.17); c.beginPath(); c.moveTo(cx+Math.cos(a)*rr*0.2,cy+Math.sin(a)*rr*0.2); c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); c.stroke(); } c.restore();   // folds in the cloth
    flap(); c.strokeStyle=atRgba(lining,1); c.lineWidth=2.4; c.stroke(); c.restore();
    c.fillStyle="#e9b23a"; c.beginPath(); c.arc(S.x,S.y,s.r*0.12,0,7); c.fill(); c.fillStyle="#fff3c4"; c.beginPath(); c.arc(S.x-1,S.y-1,s.r*0.05,0,7); c.fill();   // the gold clasp it hangs from
    if(t>=460&&t<1050) for(let i=0;i<3;i++){ const ph=((t/300)+i/3)%1; c.strokeStyle=`rgba(255,220,230,${0.6*(1-ph)})`; c.lineWidth=2; c.beginPath(); c.arc(cx,cy,rr*(1.05+0.25*ph),0,7); c.stroke(); }
    atImpact(t,460,0.3,0); }};
Object.assign(AR_KIND,{"Wing Wrap":"capewrap"});
/* Lava's Bubble Over floods the target with boiling lava rather than water */
/* the same rolling wave as Tide's, in molten lava with embers, so Lava's Bubble Over isn't water */
ANIM.lavaflood = { C: 560, D: 1060,
  atk: t => ({ f: 0, pose: t < 220 ? 'slamup' : t < 760 ? 'push' : 'idle' }),
  def(t) { if (t < 560) return null; const k = (t - 560) / 500; return { f: -0.14 * Math.sin(Math.min(1, k * 1.5) * Math.PI), lift: -20 * Math.sin(Math.min(1, k * 2) * Math.PI), pose: k < 0.6 ? 'hit' : 'idle' }; },
  fx(c, t, x) { if (t < 160 || t > 1000) return; const a = x.self, b = x.target, k = Math.min(1.1, (t - 160) / 420), p = lerpP(a, b, Math.min(1, k)), h = 70 * (x.pw || 1) * Math.min(1, (t - 160) / 200), A = Math.min(1, (1000 - t) / 200);
    const dir = Math.sign(b.x - a.x) || 1, base = p.y + 30 + (b.foot - b.y - 30) * Math.min(1, k);
    c.save(); c.globalAlpha = A; c.translate(p.x, base); c.scale(dir, 1);
    const g = c.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#ffe08a'); g.addColorStop(0.4, '#ff7a1a'); g.addColorStop(1, '#b8260f'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-80, 0); c.bezierCurveTo(-50, -h * 0.2, -30, -h * 0.95, 6, -h); c.bezierCurveTo(30, -h * 1.02, 40, -h * 0.7, 26, -h * 0.55);
    c.bezierCurveTo(16, -h * 0.45, 10, -h * 0.62, 18, -h * 0.68); c.bezierCurveTo(8, -h * 0.5, 30, -h * 0.25, 40, 0); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-60, -4); c.bezierCurveTo(-40, -h * 0.2, -26, -h * 0.7, 0, -h * 0.86); c.lineTo(-6, -h * 0.7); c.bezierCurveTo(-28, -h * 0.5, -40, -h * 0.15, -60, -4); c.fill();
    c.fillStyle = '#ffd25a'; for (let i = 0; i < 9; i++) { const a2 = i / 8 * 2.4 - 0.4; c.beginPath(); c.arc(8 + Math.cos(a2) * 20 + Math.sin(t / 50 + i) * 2, -h * 0.8 + Math.sin(a2) * 14, 4.5 - i * 0.3, 0, 7); c.fill(); }
    c.restore(); for (let i = 0; i < 8; i++) { c.globalAlpha = A; ePart(c, 'Blaze', p.x + dir * (20 + i * 4), base - h * 0.9 - Math.abs(Math.sin(t / 80 + i)) * 20, 1.5, t, i); } c.globalAlpha = 1; } };
Object.assign(AR_KIND,{"Bubble Over":"lavaflood"});
if(typeof KSND!=="undefined"){ KSND.capewrap=(d,t)=>{ dNoise(d,t+0.2,0.3,0.12,'bandpass',700,0.6); dNoise(d,t+0.46,0.12,0.18,'lowpass',500); sTone(d,t+0.5,'sine',180,140,0.5,0.05); }; if(KSND.wave) KSND.lavaflood=(d,t)=>{ KSND.wave(d,t); dNoise(d,t+0.4,0.5,0.1,'bandpass',300,0.6); }; }
/* Gid (17 Nov 2026), from his reference picture: a vampire cape, black outside and red inside, with a tall stand-up collar,
   a gold chain across it and a bat-wing hem. It spreads wide behind Vampire, then both sides swing forward and close round the target like a hug */
ANIM.capewrap={C:720,D:1560,contact:false,marks:true,
  atk:t=>({f:t<300?0.42*eio(t/300):t<1250?0.42:0.42*(1-eio((t-1250)/310)),pose:t<300?"walk":t<720?"cast":t<1250?"push":"idle",arc:t>300&&t<720?-6*Math.sin((t-300)/420*Math.PI):0}),
  def(t){ if(t<720||t>1300) return null; const sq=t<1200?0.12*Math.min(1,(t-720)/160):0; return {sx:1-sq,sy:1+sq*0.3,off:[Math.sin(t/16)*1.2,0],pose:"hurt"}; },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t<140||t>1520) return;
    const P={x:s.x+d*s.r*0.1,y:s.y-s.r*0.6}, L=Math.abs(tg.x-P.x)+R*1.25, r0=s.r*0.75;
    const open=t<520?eo((t-140)/380):1, close=t<520?0:t<720?eio((t-520)/200):t<1180?1:t<1340?1-eio((t-1180)/160):0, gone=t<1340?1:1-eo((t-1340)/180);
    const lerp=(a,b,k)=>a+(b-a)*k, deg=Math.PI/180, T={x:tg.x,y:tg.y-R*0.25};
    // open: two wings spread behind it round its shoulders; closed: each side wraps half way round the target and they meet on its far side
    const panels=[[[-175,-100],[-178,-6]],[[100,175],[178,6]]], black=[26,18,30], red=[176,24,40];
    const C0={x:lerp(P.x,T.x,close),y:lerp(P.y,T.y,close)}, rad=lerp(L*0.55,R*1.28,close)*Math.max(0.05,open*gone), sq=t>720&&t<1180?1-0.05*Math.abs(Math.sin((t-720)/90)):1;
    for(const [opn,cls] of panels){ const a0=lerp(opn[0],cls[0],close)*deg, a1=lerp(opn[1],cls[1],close)*deg, side=close>0.5?C0:P;
      const ang=a=>d>0?(close>0.5?a:a):Math.PI-a, pt=(a,r)=>({x:C0.x+Math.cos(ang(a))*r,y:C0.y+Math.sin(ang(a))*r*0.92});
      const shape=()=>{ c.beginPath(); c.moveTo(P.x,P.y); const n=18; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n, q=pt(a,rad*sq*(i%2?1.07:0.95)); c.lineTo(q.x,q.y); } c.closePath(); };
      shape(); c.fillStyle=atRgba(red.map((v,j)=>v+(black[j]-v)*close),0.97); c.fill();
      c.save(); c.clip(); c.strokeStyle=atRgba(close>0.5?red:black,0.95); c.lineWidth=Math.max(3,R*0.12); shape(); c.stroke(); c.restore();   // the lining showing at the edge
      c.strokeStyle="rgba(0,0,0,.14)"; c.lineWidth=1.2; for(let i=1;i<4;i++){ const a=a0+(a1-a0)*i/4, q=pt(a,rad*0.9); c.beginPath(); c.moveTo(lerp(P.x,C0.x,0.6),lerp(P.y,C0.y,0.6)); c.lineTo(q.x,q.y); c.stroke(); } }   // soft folds
    if(gone>0){ c.save(); c.globalAlpha*=gone*open; for(const sd of [-1,1]){ c.fillStyle=atRgba(black,1); c.beginPath(); c.moveTo(P.x+sd*s.r*0.08,P.y-s.r*0.1); c.lineTo(P.x+sd*s.r*0.62,P.y-s.r*0.95); c.lineTo(P.x+sd*s.r*0.5,P.y+s.r*0.1); c.closePath(); c.fill();
        c.fillStyle=atRgba(red,1); c.beginPath(); c.moveTo(P.x+sd*s.r*0.14,P.y-s.r*0.05); c.lineTo(P.x+sd*s.r*0.52,P.y-s.r*0.78); c.lineTo(P.x+sd*s.r*0.42,P.y+s.r*0.06); c.closePath(); c.fill(); }   // the tall stand-up collar, red inside
      c.strokeStyle="#e9b23a"; c.lineWidth=2; c.beginPath(); c.moveTo(P.x-s.r*0.32,P.y); c.quadraticCurveTo(P.x,P.y+s.r*0.18,P.x+s.r*0.32,P.y); c.stroke(); for(const sd of [-1,1]){ c.fillStyle="#e9b23a"; c.beginPath(); c.arc(P.x+sd*s.r*0.32,P.y,s.r*0.08,0,7); c.fill(); } c.restore(); }   // the gold chain clasp
    if(t>=720&&t<1180) for(let i=0;i<3;i++){ const ph=((t/320)+i/3)%1; c.strokeStyle=`rgba(255,200,215,${0.5*(1-ph)})`; c.lineWidth=2; c.beginPath(); c.ellipse(tg.x,tg.y-R*0.25,R*(1.15+0.35*ph),R*(1+0.3*ph),0,0,7); c.stroke(); }
    atImpact(t,720,0.35,0.05); }};
if(typeof KSND!=="undefined") KSND.capewrap=(d,t)=>{ dNoise(d,t+0.15,0.35,0.1,'bandpass',600,0.6); dNoise(d,t+0.55,0.18,0.16,'bandpass',500,0.8); dNoise(d,t+0.72,0.14,0.2,'lowpass',400); sTone(d,t+0.74,'sine',160,110,0.5,0.05); };

/* Gid (17 Nov 2026): Wing Wrap uses Vampire's own cape. It breaks into bats, appears behind the target facing it, takes the cape off its back,
   swings it open and wraps it round the target, there's an impact, then it turns back to bats and returns */
ANIM.capewrap={C:780,D:1560,contact:false,marks:true,
  atk:(t,o)=>{ const d=(o&&o.dir)||1;
    if(t<220){ const k=eo(t/220); return {alpha:1-k,sy:1-0.3*k,pose:"cast"}; }   // breaks into bats
    if(t<1180){ const k=t<380?eo((t-220)/160):1; return {f:1.8,sx:-1,alpha:k,pose:atPose(t<620?"cast":"push",{noCape:t>=440?1:0})}; }   // behind the target, turned to face it
    if(t<1320){ const k=eo((t-1180)/140); return {f:1.8,sx:-1,alpha:1-k,pose:"cast"}; }
    const k=eo((t-1320)/240); return {f:0,alpha:k,pose:"idle"}; },
  def(t){ if(t<780||t>1250) return null; const sq=t<1150?0.12:0; return {sx:1-sq,sy:1+sq*0.3,off:[Math.sin(t/14)*2,0],pose:"hurt",flash:t<840?3:0}; },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
    if(t<420||(t>1150&&t<1560)){ const k=t<420?t/420:(t-1150)/410; for(let i=0;i<7;i++){ const q=((k*1.3)+i/7)%1; const fx0=t<420?s.x:s.x, px=t<420?tg.x+(fx0-tg.x)*(1-q)*0.3+(i-3)*R*0.2:s.x+(i-3)*R*0.2, py=s.y-s.r*(0.4+q*1.2)+Math.sin(t/60+i)*6;
        c.fillStyle=`rgba(40,20,50,${0.85*(1-q)})`; c.beginPath(); c.moveTo(px,py); c.quadraticCurveTo(px-8,py-7,px-14,py-1); c.quadraticCurveTo(px-8,py-2,px,py+3); c.quadraticCurveTo(px+8,py-2,px+14,py-1); c.quadraticCurveTo(px+8,py-7,px,py); c.fill(); } }   // little bats
    if(t<440||t>1180) return;
    const parts=x.parts||[120,40,140], outer=parts.map(v=>Math.max(0,v*0.85*0.7)), red=[184,36,58], A={x:s.x,y:s.y-s.r*0.55}, T={x:tg.x,y:tg.y-R*0.25}, dt=Math.sign(tg.x-s.x)||-d;
    const open=t<620?eo((t-440)/180):1, close=t<620?0:t<780?eio((t-620)/160):t<1080?1:1-eio((t-1080)/100), lerp=(a,b,k)=>a+(b-a)*k, deg=Math.PI/180;
    const C0={x:lerp(A.x,T.x,close),y:lerp(A.y,T.y,close)}, L=Math.abs(T.x-A.x)+R, rad=lerp(L*0.5,R*1.3,close)*Math.max(0.08,open), sq=t>780&&t<1080?1-0.05*Math.abs(Math.sin((t-780)/80)):1;
    for(const [opn,cls] of [[[-170,-100],[-178,-6]],[[100,170],[178,6]]]){ const a0=lerp(opn[0],cls[0],close)*deg, a1=lerp(opn[1],cls[1],close)*deg;
      const ang=a=>dt>0?a:Math.PI-a, pt=(a,r)=>({x:C0.x+Math.cos(ang(a))*r,y:C0.y+Math.sin(ang(a))*r*0.92});
      const shape=()=>{ c.beginPath(); c.moveTo(A.x,A.y); for(let i=0;i<=14;i++){ const a=a0+(a1-a0)*i/14, q=pt(a,rad*sq*(i%2?1.06:0.95)); c.lineTo(q.x,q.y); } c.closePath(); };
      shape(); c.fillStyle=atRgba(red.map((v,j)=>v+(outer[j]-v)*close),0.98); c.fill();
      c.save(); c.clip(); c.strokeStyle=atRgba(close>0.5?red:outer,0.95); c.lineWidth=Math.max(3,R*0.12); shape(); c.stroke(); c.restore(); }
    if(t>=780&&t<1080){ const k=(t-780)/300; atPow(c,T,Math.min(1,k*1.5),R/20); }
    atImpact(t,780,0.6,0.15); }};
if(typeof KSND!=="undefined") KSND.capewrap=(d,t)=>{ for(let i=0;i<6;i++) dNoise(d,t+0.02+i*0.035,0.03,0.06,'bandpass',3000+i*200,3); dNoise(d,t+0.46,0.2,0.1,'bandpass',600,0.6); dNoise(d,t+0.64,0.14,0.14,'bandpass',500,0.8); dKick(d,t+0.78,0.8); dNoise(d,t+0.78,0.3,0.25,'lowpass',500); for(let i=0;i<5;i++) dNoise(d,t+1.16+i*0.04,0.03,0.05,'bandpass',3200,3); };
/* Gid (17 Nov 2026): the cape hangs vertical, shoulders to floor with the bat-wing hem at the bottom, and closes round the target slowly, a wrap rather than a slap */
ANIM.capewrap={C:1800,D:2600,contact:false,marks:true,behind:true,
  atk:(t,o)=>{ if(t<220){ const k=eo(t/220); return {alpha:1-k,sy:1-0.3*k,pose:"cast"}; }
    if(t<2180){ const k=t<380?eo((t-220)/160):1; return {f:1.8,sx:-1,alpha:k,pose:atPose(t<640?"cast":"push",{noCape:t>=440?1:0})}; }
    if(t<2320){ const k=eo((t-2180)/140); return {f:1.8,sx:-1,alpha:1-k,pose:"cast"}; }
    const k=eo((t-2320)/260); return {f:0,alpha:k,pose:"idle"}; },
  def(t){ if(t<760||t>2250) return null; const pull=t<1800?eio((t-760)/1040):t<2060?1:1-eio((t-2060)/190), sq=t>=1800&&t<2060?0.1:0; return {sx:1-sq,sy:1+sq*0.25,off:[22*pull+(t>=1800&&t<2060?Math.sin(t/16)*1.5:0),0],rot:0.12*pull,pose:"hurt",flash:t>=1800&&t<1860?3:0}; },   // drawn in toward Vampire as the cape closes
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
    if(t<420||(t>2140&&t<2600)){ const k=t<420?t/420:(t-2140)/460; for(let i=0;i<7;i++){ const q=((k*1.3)+i/7)%1, px=s.x+(i-3)*R*0.2, py=s.y-s.r*(0.4+q*1.2)+Math.sin(t/60+i)*6;
        c.fillStyle=`rgba(40,20,50,${0.85*(1-q)})`; c.beginPath(); c.moveTo(px,py); c.quadraticCurveTo(px-8,py-7,px-14,py-1); c.quadraticCurveTo(px-8,py-2,px,py+3); c.quadraticCurveTo(px+8,py-2,px+14,py-1); c.quadraticCurveTo(px+8,py-7,px,py); c.fill(); } }
    if(t<440||t>2180) return;
    const g=mvCapeGeo(t,x); if(!g||g.front<=0) return;
    mvCapePanel(c,g,g.edge,g.xe,g.front,true);   // round the front: from the far side back toward Vampire, closing the hug
    if(t>=1800&&t<2100){ const k=(t-1800)/300; atPow(c,{x:x.target.x,y:x.target.y-x.target.r*0.3},Math.min(1,k*1.5),x.target.r/20); }
    atImpact(t,1800,0.55,0.12); },
  back(c,t,x){ if(t<440||t>2180) return; const g=mvCapeGeo(t,x); if(!g) return; mvCapePanel(c,g,g.x0,g.xb,1,false); }};   // first the cape reaches round behind the target
/* the cape's shape, shared by the part behind the target and the part in front: it lifts off Vampire's back, reaches round behind the target
   to its far side (0 to 0.5 of the wrap), then comes round the front back toward Vampire (0.5 to 1), slow, over about 1.2 s */
function mvCapeGeo(t,x){ const s=x.self, tg=x.target, R=tg.r, dt=Math.sign(tg.x-s.x)||1;
  const lift=t<640?eo((t-440)/200):1, wrap=t<640?0:t<1800?eio((t-640)/1160):t<2060?1:1-eio((t-2060)/120);
  const x0=s.x, edge=tg.x+dt*R*1.3, near=tg.x-dt*R*0.9, back=Math.min(1,wrap*2), front=Math.max(0,wrap*2-1);
  const parts=x.parts||[120,40,140];
  return {s,tg,R,dt,lift,wrap,x0,edge,xb:x0+(edge-x0)*back+dt*s.r*0.4*lift*(1-back),xe:edge+(near-edge)*front,front,top:s.y-s.r*0.6-R*0.25*lift,floor:Math.max(s.foot,tg.foot)+2,outer:parts.map(v=>Math.max(0,v*0.6)),red:[184,36,58]}; }
function mvCapePanel(c,g,xa,xb,k,front){ const {tg,R,dt,top,floor,outer,red}=g; if(Math.abs(xb-xa)<2) return;
  const head=tg.y-R*1.35, topY=u=>front?head:top+(head-top)*Math.sin(Math.min(1,u)*Math.PI/2)*Math.min(1,g.wrap*2), bulge=R*0.5*(front?1:Math.min(1,g.wrap*2)), sgn=Math.sign(xb-xa);
  const shape=()=>{ c.beginPath(); c.moveTo(xa,topY(0)); for(let i=1;i<=14;i++){ const u=i/14; c.lineTo(xa+(xb-xa)*u,topY(u)); }
    for(let i=0;i<=10;i++){ const v=i/10, y=topY(1)+(floor-topY(1))*v; c.lineTo(xb+sgn*bulge*Math.sin(v*Math.PI),y); }
    for(let i=0;i<=12;i++){ const u=1-i/12; c.lineTo(xa+(xb-xa)*u,floor+(i%2?-R*0.22:R*0.05)); } c.closePath(); };   // the bat-wing hem along the floor
  shape(); c.fillStyle=atRgba(front?outer:outer.map(v=>v*0.8),0.97); c.fill();
  c.save(); c.clip(); c.strokeStyle=atRgba(red,0.95); c.lineWidth=Math.max(4,R*0.14); shape(); c.stroke();
  c.strokeStyle="rgba(0,0,0,.18)"; c.lineWidth=1.5; for(let i=1;i<5;i++){ const xx=xa+(xb-xa)*i/5; c.beginPath(); c.moveTo(xx,topY(i/5)+4); c.lineTo(xx+sgn*bulge*0.3,floor-4); c.stroke(); } c.restore(); }
if(typeof KSND!=="undefined") KSND.capewrap=(d,t)=>{ for(let i=0;i<6;i++) dNoise(d,t+0.02+i*0.035,0.03,0.06,'bandpass',3000+i*200,3); dNoise(d,t+0.64,1.1,0.06,'bandpass',500,0.5); dKick(d,t+1.8,0.8); dNoise(d,t+1.8,0.3,0.25,'lowpass',500); for(let i=0;i<5;i++) dNoise(d,t+2.16+i*0.04,0.03,0.05,'bandpass',3200,3); };

/* group 7 (17 Nov 2026), the last 25 families: the new moves use the closest animations made so far; these few needed a better fit than the drafts gave */
Object.assign(AR_KIND,{"Rune Drain":"biggulp","Spirit Chill":"dimlight","Thunder Roll":"trumpet","Wax Flood":"lavaflood"});

/* 17 Nov 2026 audit against docs/ANIM-BENCHMARK.md: moves whose animation showed a different action from their name move to the existing kind that shows it, such as roars to trumpet rings and beak pecks to nibble */
Object.assign(AR_KIND,{"Air Blade":"gust","Air Puff":"gust","Alarm Ring":"trumpet","Ash Storm":"sandspray","Axe Storm":"hammer","Bad Dream":"lullaby","Beak Jab":"nibble","Beak Spear":"nibble","Belly Roll":"rollbump","Big Belly Slam":"bodyslam","Big Boo":"trumpet","Big Hook":"punch","Big Snore":"trumpet","Blizzard":"avalanche","Blizzard Roar":"steam","Bloom Pulse":"flash","Blossom Blast":"petalswirl","Blossom Flurry":"petalswirl","Body Splash":"bodyslam","Bog Spit":"drool","Boo!":"shriek","Boulder Barrage":"boulder","Boulder Shove":"boulder","Bounce":"bodyslam","Brush Spin":"spincrash","Burning Roll":"rollbump","Burst Mode":"snapshot4","Cake Drop":"bellyflop","Candy Crash":"rollbump","Cap Smash":"bodyslam","Cave In":"meteor","Chain Bolt":"lightning","Chew":"bodyslam","Claw Swing":"claw","Coil Spin":"spincrash","Coin Slice":"coinflick","Cold Draft":"gust","Comb Peck":"nibble","Cone Lunge":"thrust","Cone Thrust":"thrust","Cork Pop":"toothshot","Corkscrew":"jetspin","Crank Smash":"hammer","Crescendo":"trumpet","Crown Peck":"nibble","Crust Chop":"hammer","Crust Jab":"thrust","Cursed Bite":"bite","Dash Chop":"hammer","Deep Clean":"steam","Deep Roll":"rollbump","Desert Roar":"trumpet","Dig Under":"burstup","Dirt Kick":"sandspray","Dissolve":"drool","Dive Roll":"rollbump","Dizzy Spin":"spincrash","Double Bonk":"bopbarrage","Double Bop":"bopbarrage","Double Cling":"lightning","Double Flick":"bigswat","Double Wobble":"bopbarrage","Dread":"dimlight","Dread Cry":"trumpet","Dread Stare":"dimlight","Dust Kick":"sandspray","Dust Whirl":"tornado","Eclipse Wave":"dimlight","Ember Breath":"beam","Ember Howl":"trumpet","Ember Peck":"nibble","Ember Roll":"rollbump","Fade Out":"dimlight","Feather Dart":"spear","Feeler Tickle":"lash","Field Crush":"push","Fire Dance":"firespin","Fireball":"bolt","Fireball Volley":"foxfire","Flask Roll":"rollbump","Fog Roll":"rollbump","Forest Curse":"dimlight","Fox Swipe":"kick","Frost Mane":"steam","Frost Spin":"spincrash","Frost Tusk":"hornjab","Gear Grind":"spincrash","Genie Grip":"vicegrip","Glass Shard":"spear","Glow":"flash","Gold Rush":"bopbarrage","Grand Exposure":"flash","Grand Finale":"fireworks","Grand Illusion":"phase","Ground Shake":"rockpath","Gumball Roll":"rollbump","Gunk Cannon":"drool","Gust Cut":"gust","Hail Storm":"icefall","Handle Bash":"bodyslam","Hat Slam":"bodyslam","Haunt":"dimlight","Haunted Tune":"lullaby","Head Smash":"chargeram","Heat Shimmer":"steam","Heavy Roll":"rollbump","Hollow Howl":"trumpet","Horn Butt":"hornjab","Hot Gravel":"sandspray","Hot Pour":"icedtea","House Slam":"bodyslam","Hundred Flings":"bopbarrage","Hypnotize":"dimlight","Ink Cloud":"inkfog","Ink Needle":"spear","Ink Spray":"inkfog","Jack Pop":"burstup","Jawbreaker":"bodyslam","Knockout":"punch","Labyrinth Charge":"chargeram","Lava Bomb":"meteor","Lava Flow":"lavaflood","Lava Quake":"rockpath","Lava Splash":"lavaflood","Layer Cake":"bodyslam","Leap Snip":"pinch","Leg Spike":"legflurry","Lightning Rod":"lightning","Lion Maul":"claw","Log Throw":"boulder","Long Roll":"bigroll","Magma Wave":"lavaflood","Mammoth Charge":"chargeram","Melt Drip":"drool","Mind Prick":"push","Mochi Smack":"bodyslam","Moon Howl":"trumpet","Mountain Fall":"meteor","Mushroom Puff":"steam","Needle Burst":"spear","Needle Spray":"spear","Nightmare":"lift","Old Growth":"bodyslam","Page Flurry":"pageswirl","Paper Gust":"gust","Paper Storm":"pageswirl","Peck":"nibble","Pendulum":"sweep","Petal Clap":"petalswirl","Phoenix Fold":"fireworks","Piggy Charge":"chargeram","Pill Roll":"rollbump","Pillar Press":"stomp","Pin Prick":"thrust","Pinwheel Spin":"spincrash","Pirouette":"spincrash","Pogo Spike":"stomp","Poison Bite":"bite","Poison Fog":"steam","Pot Drop":"bellyflop","Pounce Slash":"claw","Prick":"thrust","Puff Push":"gust","Quick Chop":"hammer","Rain Gust":"gust","Rainbow Charge":"chargeram","Razor Wrap":"capewrap","Reach Bite":"bite","Reel Smash":"bodyslam","Rising Fist":"rocketglove","Rivet Shot":"spear","Rivet Spray":"spear","Rock Charge":"chargeram","Rock Drop":"meteor","Roll Over":"rollbump","Roly Combo":"legflurry","Root Quake":"pillar","Root Whack":"lash","Rot Breath":"steam","Rumble Roll":"rollbump","Russian Roll":"rollbump","Sad Song":"trumpet","Sakura Cut":"petalswirl","Saw Roll":"rollbump","Scorch":"beam","Screech":"shriek","Scribble":"pokeflurry","Sea Hymn":"lullaby","Shell Roll":"rollbump","Shock Slam":"hammer","Short Circuit":"lightning","Slab Slap":"punch","Sleep Dust":"steam","Sleepy Glow":"flash","Sleepy Story":"lullaby","Slime Slap":"bodyslam","Smoke Whirl":"steam","Snap":"snapshot2","Snow Paw":"claw","Sonar Ping":"trumpet","Sparkle Dust":"petalswirl","Spiky Roll":"rollbump","Spin Claw":"clawspin","Spin Dive":"spincrash","Splinter Shot":"spear","Splotch":"drool","Spore Shot":"bolt","Spring Stab":"thrust","Squish":"bodyslam","Static Cling":"lightning","Sticky Fire":"foxfire","Sting Barrage":"spear","Stink Bomb":"steam","Storm Peck":"nibble","Sucker Grip":"vicegrip","Suds Slam":"bodyslam","Sugar Crash":"lullaby","Sundae Slam":"bodyslam","Swarm Light":"flash","Swat":"bigswat","Sweet Glow":"flash","Swoop":"talondive","Swoop Down":"talondive","Talon Grab":"vicegrip","Talon Rake":"claw","Talon Storm":"claw","Tentacle Flick":"bigswat","Tentacle Flurry":"tentaclefrenzy","Tentacle Slam":"bigswat","Thin Cut":"claw","Thorn Flick":"spear","Thunder Zap":"lightning","Tidal Aria":"lullaby","Time Stop":"freezeframe","Tin Snip":"thrust","Tip Flurry":"legflurry","Toast Slap":"punch","Toe Drill":"jetspin","Toe Poke":"kick","Tomb Curse":"dimlight","Top Grind":"spincrash","Tornado Spin":"spincrash","Triple Bark":"trumpet","Trot Charge":"chargeram","Trunk Twist":"vicegrip","Tusk Gore":"hornjab","Tusk Thrust":"hornjab","Undertow":"wave","Warm Soak":"wave","Whistle":"trumpet","Wind Nudge":"gust","Wind Slice":"gust","Wing Flap":"gust","Wing Gust":"gust","Woolly Roar":"trumpet","Wrecking Ball":"rollbump","Wrench Poke":"thrust","Yawn":"trumpet"});

/* ---- 17 Nov 2026 audit: kinds for moves that had no animation showing what their name says (docs/ANIM-BENCHMARK.md) ---- */
/* a tail move: it runs in and spins round so its own tail sweeps through the target, with the sweep drawn in its colour */
MV.sweep=(c,cx,cy,R,a0,a1,w,col,a)=>{ if(a<=0) return; c.save(); c.globalAlpha*=a; const n=14; c.fillStyle=atRgba(col,0.9); c.strokeStyle=atRgba(col.map(v=>v*0.55),0.9); c.lineWidth=2; c.beginPath();
  for(let i=0;i<=n;i++){ const u=i/n, an=a0+(a1-a0)*u, r=R+w*Math.sin(u*Math.PI)*0.5; c.lineTo(Math.cos(an)*r+cx,Math.sin(an)*r*0.55+cy); }
  for(let i=n;i>=0;i--){ const u=i/n, an=a0+(a1-a0)*u, r=R-w*Math.sin(u*Math.PI)*0.5*u; c.lineTo(Math.cos(an)*r+cx,Math.sin(an)*r*0.55+cy); } c.closePath(); c.fill(); c.stroke();
  c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=2; c.beginPath(); for(let i=0;i<=n;i++){ const u=i/n, an=a0+(a1-a0)*u, r=R+w*Math.sin(u*Math.PI)*0.35; c.lineTo(Math.cos(an)*r+cx,Math.sin(an)*r*0.55+cy); } c.stroke(); c.restore(); };
/* a wing move: a big feathered wing smear in its feather colour sweeps down across the target */
MV.wingSmear=(c,x,y,R,d,k,col,a)=>{ if(a<=0) return; c.save(); c.translate(x,y); c.scale(d,1); c.globalAlpha*=a; const base=-2.2+2.6*eio(Math.min(1,k));
  for(let i=0;i<7;i++){ const an=base+i*0.16, L=R*(1.9-i*0.12); c.save(); c.rotate(an); c.fillStyle=atRgba(col.map(v=>v*(0.8+0.04*i)),0.92); c.beginPath(); c.moveTo(0,-R*0.12); c.quadraticCurveTo(L*0.6,-R*0.3,L,0); c.quadraticCurveTo(L*0.6,R*0.22,0,R*0.12); c.closePath(); c.fill();
    c.strokeStyle=atRgba(col.map(v=>v*0.55),0.8); c.lineWidth=1.2; c.stroke(); c.strokeStyle="rgba(255,255,255,.55)"; c.beginPath(); c.moveTo(R*0.1,0); c.lineTo(L*0.95,0); c.stroke(); c.restore(); }
  for(let i=0;i<4;i++){ c.strokeStyle=`rgba(255,255,255,${0.6*(1-k)})`; c.lineWidth=2; c.beginPath(); c.arc(0,0,R*(1.2+i*0.2),base-0.6,base+0.2); c.stroke(); } c.restore(); };
Object.assign(ANIM,{
  tailswing:{C:520,D:1000,contact:true,marks:true,
    atk:t=>{ if(t<280){ const k=eo(t/280); return {f:0.7*k,pose:"walk"}; } if(t<760){ const k=(t-280)/480; return {f:0.7,sx:Math.cos(k*Math.PI*2),rot:0.08*Math.sin(k*Math.PI*2),sy:1-0.06*Math.sin(k*Math.PI),pose:k<0.5?"tackle":"idle"}; }
      const k=(t-760)/240; return {f:0.7*(1-eio(Math.min(1,k))),pose:"idle"}; },
    def:t=>SG.knock(t,520,1,30,420),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=x.parts||x.body||[200,160,120]; if(t>=380&&t<700){ const k=(t-380)/320; MV.sweep(c,s.x,s.y+s.r*0.2,s.r*1.6,Math.PI*(d>0?0.95:0.05)-d*k*Math.PI*0.9,Math.PI*(d>0?0.95:0.05)-d*(k*Math.PI*0.9+0.9),s.r*0.75,col,1-Math.max(0,(k-0.7)/0.3)); }
      if(t>=520&&t<820){ const k=(t-520)/300; for(let i=0;i<4;i++) atStar4(c,tg.x+(i-1.5)*R*0.5,tg.y-R*(0.6+0.3*(i%2))-k*R*0.4,R*0.2*(1-k),"rgba(255,240,170,.95)"); MV.lines(c,tg.x,tg.y-R*0.2,R,-d,5,1-k); }
      atImpact(t,520,0.3,0.05); }},
  wingslap:{C:460,D:950,contact:true,marks:true,
    atk:t=>{ if(t<260){ const k=eo(t/260); return {f:0.66*k,arc:-10*Math.sin(k*Math.PI),pose:"walk"}; } if(t<400) return {f:0.66,rot:-0.12,arc:-14,pose:"swipeup"}; if(t<560){ const k=(t-400)/160; return {f:0.7,rot:0.1*k,arc:-14*(1-k),pose:"swipedown"}; }
      const k=(t-560)/390; return {f:0.7*(1-eio(Math.min(1,k))),pose:"idle"}; },
    def:t=>SG.knock(t,460,1,26,380),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=x.parts||x.body||[220,220,230]; if(t>=300&&t<640){ const k=(t-300)/300; MV.wingSmear(c,s.x+d*s.r*0.3,s.y-s.r*0.4,Math.max(R,s.r)*1.1,d,k,col,1-Math.max(0,(k-0.75)/0.25)); }
      if(t>=460&&t<760){ const k=(t-460)/300; for(let i=0;i<6;i++){ const a=-0.4+i*0.5, v=R*(0.4+1.2*eo(k)); c.save(); c.translate(tg.x+Math.cos(a)*v*d,tg.y-R*0.3+Math.sin(a)*v*0.6+k*k*R); c.rotate(t/90+i); c.scale(1.1,1.1); vbDraw(c,"feather",i,t,x); c.restore(); } }
      atImpact(t,460,0.28,0.05); }}
});
/* a thrown prop: one item, the one its name says, spins over in a high arc and lands on the target */
const PT_PROPS=[[/Cork/,"cork"],[/Page|Razor Page|Word Bolt/,"page"],[/Leaf|Slice/,"leaf"],[/Wrench/,"wrench"],[/Gear/,"gear"],[/Bolt Toss/,"scrap"],[/Card/,"card"],[/Wrapper/,"wrapper"],[/Note/,"note"],[/Pineapple/,"pineapple"],
  [/Ball|Bounce/,"ball"],[/Pebble/,"gravel"],[/Hat/,"hat"],[/Pearl/,"pearl"],[/Disc|Sun/,"disc"],[/Candy/,"candy"],[/Fish/,"fish"],[/Poltergeist/,"chair"]];
const ptProp=n=>{ for(const [re,k] of PT_PROPS) if(re.test(n)) return k; return "ball"; };
MV.prop=(c,k,i,t,x)=>{ switch(k){
  case "cork": c.fillStyle="#c9955a"; c.fillRect(-7,-10,14,20); c.strokeStyle="#7a5530"; c.lineWidth=1.4; c.strokeRect(-7,-10,14,20); c.fillStyle="rgba(90,60,30,.5)"; for(let j=0;j<5;j++){ c.beginPath(); c.arc(-3+(j%3)*3,-6+j*3,1,0,7); c.fill(); } break;
  case "wrench": c.fillStyle="#9aa3ad"; c.fillRect(-16,-3,24,6); c.beginPath(); c.arc(12,0,8,0.6,5.7); c.lineTo(12,0); c.closePath(); c.fill(); c.strokeStyle="#4a525a"; c.lineWidth=1.3; c.stroke(); c.strokeRect(-16,-3,24,6); break;
  case "gear": c.fillStyle="#b7a27a"; c.beginPath(); for(let j=0;j<16;j++){ const a=j/16*Math.PI*2, r=j%2?11:15; c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); c.strokeStyle="#6a5a3a"; c.lineWidth=1.4; c.stroke(); c.fillStyle="#6a5a3a"; c.beginPath(); c.arc(0,0,4,0,7); c.fill(); break;
  case "wrapper": c.fillStyle="#ff9ac0"; c.beginPath(); c.moveTo(-14,-8); c.lineTo(14,-10); c.lineTo(12,8); c.lineTo(-12,10); c.closePath(); c.fill(); c.strokeStyle="#ffffff"; c.lineWidth=2; c.beginPath(); c.moveTo(-10,0); c.lineTo(10,-1); c.stroke(); break;
  case "pineapple": c.fillStyle="#f2b33a"; c.beginPath(); c.ellipse(0,3,10,13,0,0,7); c.fill(); c.strokeStyle="#a8701a"; c.lineWidth=1; for(let j=-2;j<=2;j++){ c.beginPath(); c.moveTo(j*4-6,-8); c.lineTo(j*4+6,14); c.stroke(); c.beginPath(); c.moveTo(j*4+6,-8); c.lineTo(j*4-6,14); c.stroke(); }
    c.fillStyle="#4f9a3a"; for(let j=-1;j<=1;j++){ c.beginPath(); c.moveTo(j*4,-9); c.lineTo(j*7,-22); c.lineTo(j*4+3,-9); c.fill(); } break;
  case "hat": c.fillStyle="#d8b46a"; c.beginPath(); c.ellipse(0,4,18,6,0,0,7); c.fill(); c.beginPath(); c.moveTo(-10,4); c.quadraticCurveTo(0,-14,10,4); c.fill(); c.strokeStyle="#8a6a2a"; c.lineWidth=1.3; c.stroke(); break;
  case "disc": { const g=c.createRadialGradient(-3,-3,1,0,0,15); g.addColorStop(0,"#fff6c0"); g.addColorStop(1,"#f2b830"); c.fillStyle=g; c.beginPath(); c.arc(0,0,14,0,7); c.fill(); c.strokeStyle="#b07d10"; c.lineWidth=2; c.stroke(); c.beginPath(); c.arc(0,0,8,0,7); c.stroke(); break; }
  case "fish": c.fillStyle="#7ab8d8"; c.beginPath(); c.ellipse(0,0,13,7,0,0,7); c.fill(); c.beginPath(); c.moveTo(-10,0); c.lineTo(-19,-7); c.lineTo(-19,7); c.closePath(); c.fill(); c.strokeStyle="#3a6a8a"; c.lineWidth=1.2; c.stroke(); c.fillStyle="#1a2a3a"; c.beginPath(); c.arc(7,-2,1.6,0,7); c.fill(); break;
  case "chair": c.strokeStyle="#8a5a30"; c.lineWidth=3; c.lineCap="round"; c.beginPath(); c.moveTo(-8,-14); c.lineTo(-8,12); c.moveTo(-8,0); c.lineTo(10,0); c.lineTo(10,12); c.stroke(); break;
  default: vbDraw(c,k,i,t,x); } };
/* rain, sparks, coins, sprinkles or molten drops falling from a cloud over the target, named by the move */
const RS_KIND=n=>/Spark/.test(n)?"spark":/Hail|Icicle/.test(n)?"ice":/Coin/.test(n)?"coin":/Sprinkle/.test(n)?"sprinkle":/Cherry/.test(n)?"cherry":/Molten|Lava/.test(n)?"molten":/Sting/.test(n)?"sting":/Light/.test(n)?"light":"rain";
/* a swarm of small flyers, named by the move */
const SW_KIND=n=>/Bat|Plague/.test(n)?"bat":/Dove/.test(n)?"dove":/Firefly|Fairy|Light/.test(n)?"firefly":"firefly";
MV.flyer=(c,k,i,t)=>{ if(k==="bat") return vbDraw(c,"bat",i,t,{}); if(k==="dove"){ const fl=Math.sin(t/35+i)*6; c.fillStyle="#ffffff"; c.beginPath(); c.ellipse(0,0,8,5,0,0,7); c.fill(); for(const sd of [-1,1]){ c.beginPath(); c.moveTo(0,-2); c.quadraticCurveTo(sd*6,-10-fl,sd*15,-6-fl); c.quadraticCurveTo(sd*8,-2,0,2); c.fill(); }
  c.strokeStyle="rgba(140,150,170,.7)"; c.lineWidth=1; c.stroke(); c.fillStyle="#f2a33a"; c.beginPath(); c.moveTo(8,0); c.lineTo(12,1); c.lineTo(8,2); c.fill(); return; }
  atGlowA(c,0,0,9,[255,240,140],0.9); c.fillStyle="#3a3020"; c.beginPath(); c.ellipse(-2,0,3.5,2.5,0,0,7); c.fill(); c.fillStyle="rgba(230,240,255,.7)"; c.beginPath(); c.ellipse(-2,-3,3,1.6,-0.5+Math.sin(t/20+i)*0.4,0,7); c.fill(); };
Object.assign(ANIM,{
  propthrow:{C:620,D:1000,
    atk:t=>({pose:t<200?"punchwind":t<420?"punch":"idle",rot:t<200?-0.12*eo(t/200):0}),
    def:t=>SG.knock(t,620,1,20,380),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, k0=(t-200)/420, kind=ptProp(x.name||""); if(k0<0) { const z=Math.min(1,t/200); c.save(); c.translate(s.x+atDir(x)*s.r*0.6,s.y-s.r*0.9); c.scale(1.5*z,1.5*z); MV.prop(c,kind,0,t,x); c.restore(); return; }
      if(k0<=1){ const p=lerpP({x:s.x+atDir(x)*s.r*0.6,y:s.y-s.r*0.9},tg,k0,R*1.6); for(let j=3;j>=1;j--){ const q=lerpP({x:s.x+atDir(x)*s.r*0.6,y:s.y-s.r*0.9},tg,Math.max(0,k0-j*0.06),R*1.6); c.save(); c.globalAlpha=0.15*(4-j); c.translate(q.x,q.y); c.rotate(t/60-j); c.scale(1.5,1.5); MV.prop(c,kind,0,t,x); c.restore(); }
        c.save(); c.translate(p.x,p.y); c.rotate(t/60); c.scale(1.5,1.5); MV.prop(c,kind,0,t,x); c.restore(); }
      else if(k0<1.5){ const q=(k0-1)/0.5; for(let j=0;j<6;j++){ const a=j*1.05, v=R*(0.4+0.9*eo(q)); atStar4(c,tg.x+Math.cos(a)*v,tg.y+Math.sin(a)*v*0.7,R*0.16*(1-q),"rgba(255,245,200,.95)"); } c.save(); c.translate(tg.x+R*0.8*q*atDir(x),tg.foot-R*0.3+q*q*R*0.2); c.rotate(t/40); c.globalAlpha=1-q; c.scale(1.5,1.5); MV.prop(c,kind,0,t,x); c.restore(); }
      atImpact(t,620,0.25,0.04); }},
  rainshower:{C:700,D:1200,
    atk:t=>({pose:t<300?"slamup":t<1000?"cast":"idle",arc:t<1000?-5*Math.sin(Math.min(1,t/300)*Math.PI/2):0}),
    def:t=>t>=700&&t<1100?{off:[Math.sin(t/16)*1.5,0],sy:0.96,pose:"hurt"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r, k=RS_KIND(x.name||""), cy=tg.y-R*2.6, a=t<200?t/200:t<1050?1:Math.max(0,1-(t-1050)/150); if(a<=0) return;
      c.save(); c.globalAlpha*=a; const cc=k==="molten"?[90,60,60]:k==="light"||k==="spark"?[255,240,190]:[120,130,150]; for(const [ox,oy,r] of [[-0.9,0.1,0.55],[-0.3,-0.15,0.7],[0.4,-0.05,0.65],[0.95,0.12,0.5],[0,0.2,0.6]]){ c.fillStyle=atRgba(cc,0.92); c.beginPath(); c.arc(tg.x+ox*R,cy+oy*R,r*R,0,7); c.fill(); }
      c.fillStyle=atRgba(cc.map(v=>v*0.75),0.9); c.fillRect(tg.x-R*1.3,cy+R*0.1,R*2.6,R*0.3); c.restore();
      if(t>=250&&t<1100) for(let i=0;i<30;i++){ const q=((t-250)/340+atH(i*5))%1, px=tg.x+(atH(i*3)-0.5)*R*2.4, py=cy+R*0.4+q*(tg.foot-cy-R*0.4); c.save(); c.globalAlpha*=a*(q<0.9?1:(1-q)*10); c.translate(px,py);
        if(k==="rain"){ c.strokeStyle="rgba(170,215,250,.6)"; c.lineWidth=2; c.beginPath(); c.moveTo(0,-R*0.35); c.lineTo(0,-R*0.1); c.stroke(); HR_DROP(c,0,0,R*0.11,[110,180,245],1); } else if(k==="ice"){ c.fillStyle="#bfe6ff"; c.beginPath(); c.moveTo(0,R*0.18); c.lineTo(-R*0.06,-R*0.08); c.lineTo(R*0.06,-R*0.08); c.closePath(); c.fill(); }
        else if(k==="molten"){ atGlowA(c,0,0,R*0.12,[255,140,40],0.9); c.fillStyle="#ffd060"; c.beginPath(); c.arc(0,0,R*0.05,0,7); c.fill(); }
        else if(k==="light") atGlowA(c,0,0,R*0.12,[255,250,200],0.95); else if(k==="sting"){ c.strokeStyle="#c9a0ff"; c.lineWidth=2; c.beginPath(); c.moveTo(0,-R*0.1); c.lineTo(0,R*0.1); c.stroke(); }
        else { c.scale(1.1,1.1); vbDraw(c,k,i,t,x); } c.restore(); }
      if(t>=700) for(let i=0;i<3;i++){ const q=((t-700)/400+i/3)%1; SG.ring(c,tg.x+(i-1)*R*0.6,tg.foot,R*0.3*q+2,R*0.08*q+1,[220,240,255],1.5,0.7*(1-q)*a); } }},
  consume:{C:700,D:1150,
    atk:t=>({pose:t<250?"cast":t<700?atPose("cast",{eyes:"shut",open:0.5}):"idle",arc:t>=700&&t<950?-10*Math.sin((t-700)/250*Math.PI):0,sy:t>=250&&t<700?1+0.04*Math.sin(t/60):1}),
    fx(c,t,x){ const s=x.self, R=s.r, cup=/Gourd/.test(x.name)?"gourd":/Juice|Nectar/.test(x.name)?"glass":/Treat|Cocoa/.test(x.name)?"mug":/Brew/.test(x.name)?"flask":"teacup";
      if(t<760){ const tilt=t<250?0:Math.min(1,(t-250)/200)*0.9, hx=s.x+atDir(x)*R*0.55, hy=s.y-R*0.3; c.save(); c.translate(hx,hy); c.rotate(-atDir(x)*tilt); const sc=R/18; c.scale(sc,sc);
        const liquid=cup==="glass"?"#ffb43a":cup==="flask"?"#9be27a":cup==="gourd"?"#e8dcb0":"#a8642a";
        if(cup==="gourd"){ c.fillStyle="#c99a4a"; c.beginPath(); c.arc(0,6,9,0,7); c.fill(); c.beginPath(); c.arc(0,-6,6,0,7); c.fill(); c.fillStyle="#a03030"; c.fillRect(-2,-14,4,4); }
        else if(cup==="flask"){ c.fillStyle="rgba(220,240,255,.8)"; c.beginPath(); c.moveTo(-3,-12); c.lineTo(3,-12); c.lineTo(3,-4); c.lineTo(9,10); c.lineTo(-9,10); c.lineTo(-3,-4); c.closePath(); c.fill(); c.fillStyle=liquid; c.fillRect(-7,2,14,7); }
        else { c.fillStyle="#ffffff"; c.beginPath(); c.moveTo(-9,-8); c.lineTo(9,-8); c.lineTo(7,8); c.lineTo(-7,8); c.closePath(); c.fill(); c.strokeStyle="rgba(120,100,90,.7)"; c.lineWidth=1.2; c.stroke(); c.fillStyle=liquid; c.fillRect(-8,-6,16,3); if(cup!=="glass"){ c.beginPath(); c.arc(10,0,4,-1.4,1.4); c.stroke(); } }
        c.restore(); if(t<500) for(let i=0;i<3;i++){ const q=((t/500)+i/3)%1; c.strokeStyle=`rgba(255,255,255,${0.6*(1-q)})`; c.lineWidth=1.5; c.beginPath(); c.moveTo(hx+(i-1)*4,hy-R*0.3-q*R*0.6); c.quadraticCurveTo(hx+(i-1)*4+5,hy-R*0.5-q*R*0.6,hx+(i-1)*4,hy-R*0.7-q*R*0.6); c.stroke(); } }
      if(t>=650&&t<1100){ const k=(t-650)/450; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,s.x,s.y-R*0.3,R*(1.2+0.6*k),x.col||[255,220,140],0.6*(1-k)); c.restore(); for(let i=0;i<6;i++){ const a=i*1.05+t/300; atStar4(c,s.x+Math.cos(a)*R*1.1,s.y-R*0.4+Math.sin(a)*R*0.6-k*R*0.6,R*0.15*(1-k),"rgba(255,250,210,.95)"); } } }},
  swarm:{C:700,D:1200,
    atk:t=>({pose:t<300?"cast":t<900?"push":"idle"}),
    def:t=>t>=600&&t<1050?{off:[Math.sin(t/14)*2,0],pose:"hurt"}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, k=SW_KIND(x.name||""); for(let i=0;i<12;i++){ const t0=80+i*40, q=(t-t0)/560; if(q<0||q>1.15) continue; const qq=Math.min(1,q), sp={x:s.x,y:s.y-s.r*0.8},
        p=lerpP(sp,{x:tg.x+(atH(i*3)-0.5)*R*1.2,y:tg.y-R*0.3+(atH(i*7)-0.5)*R},ei(qq),R*(0.8+0.8*atH(i)),(atH(i*5)-0.5)*R*1.5), orb=q>1?(q-1)/0.15:0; c.save(); c.translate(p.x+Math.cos(t/60+i)*R*0.3*orb,p.y+Math.sin(t/60+i)*R*0.2*orb); c.scale(atDir(x)*1.2,1.2); c.globalAlpha=q>1?1-orb:1; MV.flyer(c,k,i,t); c.restore(); }
      atImpact(t,700,0.25,0.04); }},
  drainstream:{C:600,D:1200,
    atk:t=>({pose:t<1000?"cast":"idle",sy:t>=600&&t<1000?1+0.05*Math.sin((t-600)/400*Math.PI):1}),
    def:t=>t>=500&&t<1000?{sy:1-0.06*Math.sin((t-500)/500*Math.PI),alpha:0.85,pose:"hurt"}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, col=/Dream/.test(x.name)?[200,170,255]:/Rune/.test(x.name)?[255,210,120]:[140,255,170]; if(t<250||t>1100) return; const a=t<400?(t-250)/150:t<950?1:(1100-t)/150;
      c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<14;i++){ const q=((t/420)+i/14)%1, p=lerpP(tg,s,q,R*0.9*Math.sin(i*1.7),R*0.3*Math.sin(i*2.3+t/120)); atGlowA(c,p.x,p.y,R*(0.16-0.06*q),col,0.85*a*(1-q*0.3)); }
      atGlowA(c,s.x,s.y-s.r*0.3,s.r*1.3,col,0.35*a); atGlowA(c,tg.x,tg.y-R*0.3,R*0.9,col,0.3*a); c.restore(); }},
  selfrestore:{C:500,D:1000,
    atk:t=>({pose:t<800?"cast":"idle",sx:t>=300&&t<600?1+0.05*Math.sin((t-300)/300*Math.PI):1}),
    fx(c,t,x){ const s=x.self, R=s.r; if(t<150||t>950) return; const k=Math.min(1,(t-150)/500), y=s.foot-(s.foot-(s.y-R*1.3))*k, a=t<800?1:1-(t-800)/150;
      c.save(); c.globalAlpha*=a; const g=c.createLinearGradient(0,y-R*0.25,0,y+R*0.25); g.addColorStop(0,"rgba(255,255,255,0)"); g.addColorStop(0.5,"rgba(255,255,255,.85)"); g.addColorStop(1,"rgba(255,255,255,0)"); c.fillStyle=g; c.fillRect(s.x-R*1.2,y-R*0.25,R*2.4,R*0.5);
      if(/Rewind/.test(x.name)){ c.strokeStyle="rgba(255,240,180,.9)"; c.lineWidth=3; c.beginPath(); c.arc(s.x,s.y-R*0.3,R*1.2,-t/120,-t/120+4.5); c.stroke(); c.beginPath(); c.moveTo(s.x+Math.cos(-t/120)*R*1.2,s.y-R*0.3+Math.sin(-t/120)*R*1.2); c.lineTo(s.x+Math.cos(-t/120-0.3)*R*1.35,s.y-R*0.3+Math.sin(-t/120-0.3)*R*1.35); c.stroke(); }
      for(let i=0;i<8;i++){ const q=((t/500)+i/8)%1; atStar4(c,s.x+(atH(i*3)-0.5)*R*2,s.foot-q*R*2.4,R*0.12*(1-q),"rgba(255,255,255,.9)"); } c.restore(); }},
  whirlpool:{C:700,D:1250,
    atk:t=>({pose:t<1000?"cast":"idle",off:[t<1000?Math.sin(t/40)*1:0,0]}),
    def:t=>t>=400&&t<1100?{rot:((t-400)/700)*Math.PI*2*(t<900?1:1),sy:0.9,arc:6,pose:"hurt"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r, ground=tg.foot+2, a=t<250?t/250:t<1050?1:Math.max(0,1-(t-1050)/200); if(a<=0) return; c.save(); c.globalAlpha*=a;
      const g=c.createRadialGradient(tg.x,ground,R*0.1,tg.x,ground,R*1.9); g.addColorStop(0,"#0e3470"); g.addColorStop(0.6,"#2a78c8"); g.addColorStop(1,"rgba(120,200,245,0)"); c.fillStyle=g; c.beginPath(); c.ellipse(tg.x,ground,R*1.9,R*0.5,0,0,7); c.fill();
      c.strokeStyle="rgba(235,250,255,.85)"; c.lineWidth=2.4; for(let i=0;i<4;i++){ c.beginPath(); for(let j=0;j<=30;j++){ const u=j/30, an=u*Math.PI*3+i*Math.PI/2+t/110, r=R*1.8*(1-u*0.9); c.lineTo(tg.x+Math.cos(an)*r,ground+Math.sin(an)*r*0.27); } c.stroke(); }
      for(let i=0;i<10;i++){ const an=t/90+i*0.63, r=R*(0.6+0.5*atH(i)), h=R*(0.3+0.9*((t/700+atH(i*3))%1)); HR_DROP(c,tg.x+Math.cos(an)*r,ground-h,R*0.06,[180,225,250],0.8); } c.restore(); atImpact(t,700,0.3,0.05); }},
  toss:{C:620,D:1200,contact:true,marks:true,
    atk:t=>{ if(t<300){ const k=eo(t/300); return {f:0.72*k,pose:"walk"}; } if(t<620) return {f:0.72,pose:t<450?"push":"slamup",sy:t<450?0.92:1.06,arc:t<450?0:-8}; if(t<760) return {f:0.72,pose:"slam"}; const k=(t-760)/440; return {f:0.72*(1-eio(Math.min(1,k))),pose:"idle"}; },
    def(t){ if(t<380) return null; if(t<620){ const k=(t-380)/240; return {arc:-60*eo(k),rot:-0.6*k,pose:"hurt"}; } if(t<1000){ const k=(t-620)/380; return {arc:-60-60*Math.sin(k*Math.PI)+60*k,off:[60*eo(k),0],rot:-0.6-Math.PI*1.5*k,pose:"hurt"}; } if(t<1160){ const k=(t-1000)/160; return {off:[60,0],sy:0.75+0.25*k,pose:"hurt"}; } return null; },
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t>=990&&t<1300){ const k=(t-990)/310; SG.dust(c,tg.x,tg.foot,R,k,8); SG.cracks(c,tg.x,tg.foot,R*0.9,5,3,1-k); } atImpact(t,1000,0.45,0.08); }},
  clothwhip:{C:460,D:950,
    atk:t=>({pose:t<200?"swipeup":t<560?"swipedown":"idle",rot:t<200?-0.1:0}),
    def:t=>SG.knock(t,460,1,18,360),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=/Film/.test(x.name)?[40,36,44]:/Paper/.test(x.name)?(x.body||[240,240,230]).map(v=>v+(255-v)*0.5):(x.body||[120,60,90]); if(t<150||t>800) return; const reach=t<460?eio((t-150)/310):1-eio((t-460)/340);
      const ox=s.x+d*s.r*0.5, oy=s.y-s.r*0.4, ex=ox+(tg.x-ox)*reach, pts=[]; for(let j=0;j<=16;j++){ const u=j/16, bx=ox+(ex-ox)*u; pts.push([bx,oy+(tg.y-R*0.2-oy)*u*reach-Math.sin(u*Math.PI)*R*0.9+Math.sin(u*8-t/50)*R*0.12*u]); }
      c.lineCap="round"; c.lineJoin="round"; c.strokeStyle=atRgba(col.map(v=>v*0.6),0.95); c.lineWidth=R*0.34; c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.stroke(); c.strokeStyle=atRgba(col,1); c.lineWidth=R*0.28; c.stroke();
      if(/Film/.test(x.name)){ c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=2; c.setLineDash([3,5]); c.stroke(); c.setLineDash([]); } else { c.strokeStyle="rgba(255,255,255,.4)"; c.lineWidth=R*0.06; c.stroke(); }
      if(t>=440&&t<640) MV.lines(c,tg.x,tg.y-R*0.2,R,-d,5,1-(t-440)/200); atImpact(t,460,0.25,0.04); }},
  tongue:{C:420,D:880,
    atk:t=>({pose:t<150?"crouch":t<620?atPose("bitewide",{open:1}):"idle"}),
    def:t=>t>=420&&t<640?{off:[Math.sin(t/12)*2,0],pose:"hurt"}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t<150||t>720) return; const reach=t<420?eo((t-150)/270):1-eio((t-420)/300), o=s.mouth||{x:s.x+d*s.r*0.4,y:s.y-s.r*0.1}, ex=o.x+(tg.x-o.x)*reach, ey=o.y+(tg.y-R*0.2-o.y)*reach;
      c.lineCap="round"; c.strokeStyle="#c8406a"; c.lineWidth=R*0.2; c.beginPath(); c.moveTo(o.x,o.y); c.quadraticCurveTo((o.x+ex)/2,Math.min(o.y,ey)-R*0.4*reach,ex,ey); c.stroke(); c.strokeStyle="#f07a9a"; c.lineWidth=R*0.09; c.stroke();
      c.fillStyle="#e05a80"; c.beginPath(); c.arc(ex,ey,R*0.14,0,7); c.fill(); if(t>=420&&t<600) for(let i=0;i<3;i++) HR_DROP(c,tg.x+(i-1)*R*0.3,tg.y-R*0.2+(t-420)/180*R*0.6,R*0.05,[200,230,255],1-(t-420)/180); atImpact(t,420,0.2,0.03); }},
  waterblade:{C:520,D:900,
    atk:t=>({pose:t<200?"swipeup":t<600?"swipedown":"idle"}),
    def:t=>SG.knock(t,520,1,22,380),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), k=(t-200)/320; if(k<0||k>1.4) return; if(k<=1){ const p=lerpP({x:s.x+d*s.r*0.5,y:s.y-s.r*0.3},tg,ei(k),R*0.3); c.save(); c.translate(p.x,p.y); c.scale(d,1);
        const g=c.createLinearGradient(-R,0,R,0); g.addColorStop(0,"rgba(120,200,245,0)"); g.addColorStop(1,"rgba(200,240,255,.95)"); c.fillStyle=g; c.beginPath(); c.arc(0,0,R*0.9,-1.3,1.3); c.arc(-R*0.45,0,R*0.75,1.15,-1.15,true); c.closePath(); c.fill(); c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=2; c.beginPath(); c.arc(0,0,R*0.9,-1.2,1.2); c.stroke();
        for(let i=0;i<5;i++) HR_DROP(c,-R*0.5-i*R*0.2,(i-2)*R*0.25,R*0.05,[150,215,250],0.8-i*0.12); c.restore(); }
      else { const q=(k-1)/0.4; c.strokeStyle=`rgba(255,255,255,${1-q})`; c.lineWidth=3; c.beginPath(); c.moveTo(tg.x-R*0.8,tg.y-R*0.7); c.lineTo(tg.x+R*0.8,tg.y+R*0.2); c.stroke(); for(let i=0;i<8;i++){ const a=-Math.PI*(0.1+0.8*atH(i)), v=R*(0.5+1.2*eo(q)); HR_DROP(c,tg.x+Math.cos(a)*v,tg.y-R*0.2+Math.sin(a)*v+q*q*R,R*0.06,[150,215,250],1-q); } }
      atImpact(t,520,0.3,0.05); }}
});
function HR_DROP(c,x,y,r,col,a){ if(a<=0) return; c.fillStyle=atRgba(col,a); c.beginPath(); c.moveTo(x,y-r*1.8); c.quadraticCurveTo(x+r,y-r*0.2,x,y+r); c.quadraticCurveTo(x-r,y-r*0.2,x,y-r*1.8); c.fill(); }
if(typeof KSND!=="undefined") Object.assign(KSND,{
  tailswing:(d,t)=>{ dNoise(d,t+0.28,0.3,0.12,'bandpass',900,0.8); dKick(d,t+0.52,0.4); dNoise(d,t+0.52,0.1,0.2,'bandpass',1500,1.5); },
  wingslap:(d,t)=>{ dNoise(d,t+0.3,0.18,0.14,'bandpass',1200,0.7); dNoise(d,t+0.46,0.08,0.25,'bandpass',2200,1.5); dKick(d,t+0.46,0.3); },
  propthrow:(d,t)=>{ dNoise(d,t+0.2,0.35,0.08,'bandpass',1600,1); dKick(d,t+0.62,0.35); sTone(d,t+0.62,'triangle',900,500,0.1,0.04); },
  rainshower:(d,t)=>{ dNoise(d,t+0.25,0.85,0.08,'highpass',3000,0.6); for(let i=0;i<6;i++) dNoise(d,t+0.7+i*0.06,0.04,0.08,'bandpass',2500,3); },
  consume:(d,t)=>{ for(let i=0;i<3;i++) sTone(d,t+0.3+i*0.14,'sine',300,240,0.1,0.05); sTone(d,t+0.7,'sine',600,1200,0.3,0.04); },
  swarm:(d,t)=>{ for(let i=0;i<10;i++) dNoise(d,t+0.1+i*0.05,0.06,0.06,'bandpass',1800+i*80,2); dKick(d,t+0.7,0.3); },
  drainstream:(d,t)=>{ sTone(d,t+0.25,'sine',700,300,0.8,0.04); sTone(d,t+0.25,'sine',1050,450,0.8,0.02); },
  selfrestore:(d,t)=>{ sTone(d,t+0.15,'sine',400,900,0.5,0.04); sTone(d,t+0.6,'triangle',1200,1200,0.15,0.03); },
  whirlpool:(d,t)=>{ dNoise(d,t+0.1,0.9,0.12,'lowpass',600); sTone(d,t+0.3,'sine',200,120,0.6,0.04); dKick(d,t+0.7,0.4); },
  toss:(d,t)=>{ dNoise(d,t+0.4,0.2,0.1,'bandpass',600,0.8); dKick(d,t+1.0,0.8); dNoise(d,t+1.0,0.3,0.2,'lowpass',500); },
  clothwhip:(d,t)=>{ dNoise(d,t+0.2,0.2,0.1,'bandpass',1400,0.8); dNoise(d,t+0.46,0.06,0.3,'highpass',3000,1.5); },
  tongue:(d,t)=>{ sTone(d,t+0.15,'sine',300,900,0.25,0.04); dNoise(d,t+0.42,0.08,0.15,'bandpass',800,1); },
  waterblade:(d,t)=>{ dNoise(d,t+0.2,0.3,0.12,'bandpass',1500,0.8); dNoise(d,t+0.52,0.25,0.25,'lowpass',900); }
});

/* the moves the audit found with no fitting animation move onto the kinds above */
Object.assign(AR_KIND,{"Acid Dart":"spear","Acorn Drop":"meteor","Ball Barrage":"volley","Bat Swarm":"swarm","Big Bell":"meteor","Big Toss":"toss","Blizzard Spin":"volley","Bolt Toss":"propthrow","Bounce Shot":"propthrow","Brew Up":"consume","Bubble Barrage":"volley","Bubble Burst":"volley","Candle Burst":"volley","Candy Storm":"volley","Cape Flick":"clothwhip","Card Fan":"volley","Card Slice":"propthrow","Card Storm":"volley","Card Throw":"volley","Cherry Bomb":"meteor","Cherry Pit":"volley","Cherry Shower":"rainshower","Cinder Dart":"spear","Cloudburst":"rainshower","Coin Shower":"rainshower","Cork Shot":"propthrow","Crumb Flick":"volley","Crumb Toss":"volley","Deep Vortex":"whirlpool","Depth Charge":"meteor","Double Slice":"propthrow","Dove Flight":"swarm","Downpour":"rainshower","Dream Drain":"drainstream","Dream Puff":"volley","Drip Flick":"rainshower","Drizzle":"rainshower","Fairy Lights":"swarm","Fairy Ring":"swarm","Feather Burst":"volley","Feather Storm":"volley","Feather Volley":"volley","Feeler Flick":"tongue","Film Lash":"clothwhip","Fin Slap":"tailswing","Firefly Swarm":"swarm","Fish Toss":"propthrow","Flame Wing":"wingslap","Fluff Storm":"volley","Fold Dart":"spear","Full Breakfast":"meteor","Gear Throw":"propthrow","Goo Barrage":"volley","Gourd Swig":"consume","Gravel Spray":"volley","Gravel Storm":"volley","Gum Volley":"volley","Gumball Barrage":"volley","Gumball Cannon":"volley","Hail Shower":"rainshower","Hail Volley":"rainshower","Hailstones":"rainshower","Hard Candy":"propthrow","Heave":"toss","Heavy Shower":"rainshower","Hip Toss":"toss","Hot Cocoa":"consume","Icicle Drop":"rainshower","Inferno Tail":"tailswing","Ink Cannon":"volley","Jackpot":"meteor","Juice Up":"consume","Leaf Cutter":"propthrow","Leaf Shot":"propthrow","Leaf Slice":"propthrow","Life Drain":"drainstream","Life Sap":"drainstream","Light Bomb":"meteor","Light Shower":"rainshower","Long Lash":"clothwhip","Loud Note":"volley","Lucky Feathers":"volley","Molten Rain":"rainshower","Nectar":"consume","Nine Tails":"tailswing","Note Toss":"propthrow","Page Cut":"propthrow","Page Flick":"volley","Paint Over":"selfrestore","Paper Bomb":"meteor","Paper Cut":"clothwhip","Paper Dart":"spear","Pearl Barrage":"volley","Pearl Shot":"propthrow","Pebble Toss":"propthrow","Peppermint Dart":"spear","Pineapple Toss":"propthrow","Pip Spit":"volley","Pixel Shot":"volley","Plague Bats":"swarm","Poltergeist":"propthrow","Pumpkin Bomb":"meteor","Razor Feather":"spear","Razor Page":"propthrow","Rewind":"selfrestore","Rewrap":"selfrestore","Rock Candy":"propthrow","Rune Drain":"drainstream","Sap Drain":"drainstream","Scrap Storm":"volley","Scrub":"selfrestore","Seed Spit":"volley","Shed Skin":"selfrestore","Sky Lantern":"meteor","Spark Flick":"volley","Spark Shower":"rainshower","Sprinkle Rain":"rainshower","Sprinkle Shot":"volley","Sprinkle Toss":"volley","Stalk Lash":"tongue","Stinging Rain":"rainshower","Straw Hat Toss":"propthrow","Sugar Shards":"spear","Sun Disc":"propthrow","Sweet Treat":"consume","Swirl Pool":"whirlpool","Tail Bop":"tailswing","Tail Crash":"tailswing","Tail Cut":"tailswing","Tail Flick":"tailswing","Tail Hammer":"tailswing","Tail Lash":"tailswing","Tail Slam":"tailswing","Tail Slap":"tailswing","Tail Slash":"tailswing","Tail Smash":"tailswing","Tail Storm":"tailswing","Tail Swat":"tailswing","Tail Sweep":"tailswing","Tail Tap":"tailswing","Tail Tease":"tailswing","Tail Tickle":"tailswing","Tail Whack":"tailswing","Tail Whips":"tailswing","Tea Party":"volley","Tea Time":"consume","Thorn Burst":"spear","Thorn Dart":"spear","Tide Blade":"waterblade","Tide Cutter":"waterblade","Tide Whirl":"whirlpool","Tongue Flick":"tongue","Tongue Rasp":"tongue","Trunk Toss":"toss","Venom Dart":"spear","Water Blade":"waterblade","Whirlpool":"whirlpool","Whisker Lash":"tailswing","Wing Bash":"wingslap","Wing Clap":"wingslap","Wing Clip":"wingslap","Wing Cut":"wingslap","Wing Flick":"wingslap","Wing Shove":"wingslap","Wing Slap":"wingslap","Wing Slice":"wingslap","Wing Smash":"wingslap","Wing Whack":"wingslap","Wish":"meteor","Word Barrage":"volley","Word Bolt":"propthrow","Word Volley":"volley","Wrapper Slash":"propthrow","Wrench Toss":"propthrow"});

/* ---- 17 Nov 2026 audit, the last one-off moves that had nothing showing their name ---- */
Object.assign(ANIM,{
  /* Riposte and Fan Parry: it guards, the blow glances off with a ring of sparks, and it snaps a counter back */
  parry:{C:520,D:950,
    atk:t=>({pose:t<380?"guard":t<640?"swipedown":"idle",off:[t>=380&&t<640?6*Math.sin((t-380)/260*Math.PI):0,0]}),
    def:t=>SG.knock(t,520,1,16,320),
    fx(c,t,x){ const s=x.self, tg=x.target, R=s.r, d=atDir(x); if(t>=120&&t<420){ const k=(t-120)/300; c.save(); c.strokeStyle=`rgba(255,240,180,${0.9*(1-k*0.5)})`; c.lineWidth=6; c.beginPath(); c.arc(s.x+d*R*0.7,s.y-R*0.3,R*1.3,-1.1,1.1); c.stroke(); c.restore();
        for(let i=0;i<6;i++){ const a=-1+i*0.4, v=R*(1.3+0.9*k); atStar4(c,s.x+d*(R*0.7+Math.cos(a)*v),s.y-R*0.3+Math.sin(a)*v,R*0.24*(1-k),"rgba(255,245,190,.95)"); } }
      if(t>=440&&t<700){ const k=(t-440)/260; MV.crescent(c,tg.x-d*tg.r*0.3,tg.y-tg.r*0.2,tg.r*1.1,d,1-k); } atImpact(t,520,0.2,0.03); }},
  /* Signal Jam and Tarnish: a burst of TV static fills the air round the target in flickering squares */
  static:{C:560,D:1000,
    atk:t=>({pose:t<800?"cast":"idle",off:[t<800?(atH(Math.floor(t/40))-0.5)*3:0,0]}),
    def:t=>t>=560&&t<900?{off:[(atH(Math.floor(t/30))-0.5)*6,0],pose:"hurt",flash:Math.floor(t/50)%2?3:0}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r, tarnish=/Tarnish/.test(x.name||""), a=t<300?t/300:t<850?1:Math.max(0,1-(t-850)/150); if(t<120||a<=0) return;
      for(let i=0;i<70;i++){ const sd=Math.floor(t/45)*97+i*13, px=tg.x+(atH(sd)-0.5)*R*2.6, py=tg.y-R*0.3+(atH(sd+7)-0.5)*R*2.2, z=R*(0.07+0.07*atH(sd+3)), v=atH(sd+5);
        c.fillStyle=tarnish?`rgba(${70+v*60},${60+v*50},${40+v*30},${0.85*a})`:`rgba(${v*255},${v*255},${v*255},${0.85*a})`; c.fillRect(px,py,z,z); }
      if(!tarnish){ c.save(); c.globalAlpha=0.5*a; c.strokeStyle="#ffffff"; c.lineWidth=2; for(let i=0;i<3;i++){ const y=tg.y-R*1.2+((t/4+i*40)%(R*2.2)); c.beginPath(); c.moveTo(tg.x-R*1.3,y); c.lineTo(tg.x+R*1.3,y); c.stroke(); } c.restore(); } }},
  /* Saw in Half: a magician's box drops over the target, a big saw cuts across it, and the box opens to show it's fine but dizzy */
  sawcut:{C:900,D:1500,
    atk:t=>({pose:t<1300?"cast":"idle",arc:t<1300?-4*Math.sin(t/180):0}),
    def:t=>t>=300&&t<1250?{alpha:t<1050?0.35:1,pose:"hurt"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t<200||t>1400) return; const drop=Math.min(1,(t-200)/180), a=t<1200?1:1-(t-1200)/200, bx=tg.x, by=tg.y-R*0.3-(1-drop)*R*3, w=R*2.2, h=R*1.6;
      c.save(); c.globalAlpha*=a; c.fillStyle="#2a1a3a"; c.fillRect(bx-w/2,by-h/2,w,h); c.strokeStyle="#e8c25a"; c.lineWidth=3; c.strokeRect(bx-w/2,by-h/2,w,h); c.beginPath(); c.moveTo(bx,by-h/2); c.lineTo(bx,by+h/2); c.stroke();
      for(let i=0;i<5;i++){ atStar4(c,bx-w/2+w*(i+0.5)/5,by-h/2+R*0.15,R*0.08,"#e8c25a"); }
      if(t>=480&&t<1000){ const k=(t-480)/520, sy=by-h/2-R*0.2+k*(h+R*0.4), sx=bx+Math.sin(t/35)*R*0.4; c.fillStyle="#c9d2dc"; c.fillRect(sx-R*1.4,sy-R*0.12,R*2.4,R*0.24); c.fillStyle="#8a5a30"; c.fillRect(sx+R*1.0,sy-R*0.2,R*0.5,R*0.4);
        c.fillStyle="#6a737c"; for(let i=0;i<12;i++){ c.beginPath(); c.moveTo(sx-R*1.4+i*R*0.2,sy+R*0.12); c.lineTo(sx-R*1.3+i*R*0.2,sy+R*0.22); c.lineTo(sx-R*1.2+i*R*0.2,sy+R*0.12); c.fill(); }
        for(let i=0;i<4;i++){ const q=((t/90)+i/4)%1; c.fillStyle=`rgba(230,200,150,${1-q})`; c.fillRect(bx+w/2+q*R*0.6,sy+q*R*0.4,3,3); } } c.restore(); atImpact(t,900,0.3,0.05); }},
  /* Wand Tap: a wand pokes out of the hat and taps the target, a pop of stars on the tip */
  wandtap:{C:420,D:820,
    atk:t=>({pose:t<200?"slamup":t<560?"push":"idle"}),
    def:t=>SG.knock(t,420,1,12,300),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t<120||t>700) return; const reach=t<420?eo((t-120)/300):1-eio((t-420)/280), ox=s.x+d*s.r*0.2, oy=s.y-s.r*1.0, ex=ox+(tg.x-d*R*0.6-ox)*reach, ey=oy+(tg.y-R*0.4-oy)*reach;
      c.lineCap="round"; c.strokeStyle="#1a1a22"; c.lineWidth=R*0.16; c.beginPath(); c.moveTo(ox,oy); c.lineTo(ex,ey); c.stroke(); c.strokeStyle="#ffffff"; c.lineWidth=R*0.17; c.beginPath(); const L=Math.hypot(ex-ox,ey-oy)||1; c.moveTo(ex-(ex-ox)/L*R*0.35,ey-(ey-oy)/L*R*0.35); c.lineTo(ex,ey); c.stroke();
      if(t>=420&&t<640){ const k=(t-420)/220; for(let i=0;i<6;i++){ const a=i*1.05, v=R*(0.2+0.9*k); atStar4(c,ex+Math.cos(a)*v,ey+Math.sin(a)*v,R*0.18*(1-k),i%2?"rgba(255,230,120,.95)":"rgba(200,170,255,.95)"); } } atImpact(t,420,0.15,0.03); }},
  /* Hook Pull: the umbrella's crook hooks the target and yanks it across toward Brolly */
  hookyank:{C:440,D:1000,
    atk:t=>({pose:t<240?"push":t<700?"slamup":"idle",rot:t>=440&&t<700?-0.1:0}),
    def(t,x){ const d=-((x&&x.dir)||1); if(t<440||t>900) return null; const k=(t-440)/460; return {off:[d*50*Math.sin(Math.min(1,k*1.4)*Math.PI*0.5)*(1-Math.max(0,(k-0.7)/0.3)),0],rot:d*0.2*(1-k),pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t<100||t>900) return; const reach=t<440?eo((t-100)/340):1-eio(Math.min(1,(t-440)/460)), ox=s.x+d*s.r*0.4, oy=s.y-s.r*0.2, ex=ox+(tg.x+d*R*0.5-ox)*reach, ey=oy+(tg.y-R*0.3-oy)*reach;
      c.lineCap="round"; c.strokeStyle="#5a3a22"; c.lineWidth=R*0.13; c.beginPath(); c.moveTo(ox,oy); c.lineTo(ex,ey); c.arc(ex-d*R*0.25,ey,R*0.25,0,Math.PI,d<0); c.stroke(); c.strokeStyle="#8a6040"; c.lineWidth=R*0.05; c.beginPath(); c.moveTo(ox,oy); c.lineTo(ex,ey); c.stroke();
      if(t>=440&&t<600) MV.lines(c,tg.x,tg.y-R*0.2,R,d,4,1-(t-440)/160); atImpact(t,440,0.2,0.03); }},
  /* Foam Smother: foam heaps up over the target until it's buried, then pops in a shower of bubbles */
  foamheap:{C:800,D:1350,
    atk:t=>({pose:t<1000?"cast":"idle"}),
    def:t=>t>=300&&t<1100?{alpha:t<800?1-0.7*Math.min(1,(t-300)/400):1,sy:0.92,pose:"hurt"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t<200||t>1250) return; const g=t<800?eo((t-200)/600):1, pop=t<800?0:(t-800)/450;
      if(pop<0.15){ for(let i=0;i<18;i++){ const an=i/18*Math.PI, rr=R*1.2*g, px=tg.x+Math.cos(an)*rr*(0.4+0.6*atH(i)), py=tg.foot-Math.sin(an)*rr*1.3*(0.6+0.4*atH(i*3)); SG.puff(c,px,py,R*(0.35+0.2*atH(i*5))*g,0.95,[250,252,255]); } }
      if(pop>0) for(let i=0;i<16;i++){ const a=atH(i*3)*Math.PI*2, v=R*(0.5+1.8*eo(pop)); c.save(); c.translate(tg.x+Math.cos(a)*v,tg.y-R*0.3+Math.sin(a)*v*0.8-pop*R); c.globalAlpha=1-pop; c.scale(1.2,1.2); vbDraw(c,"bubble",i,t,x); c.restore(); }
      atImpact(t,800,0.3,0.05); }},
  /* Ghost Image: three see-through copies of it flicker into place round the target and strike in turn */
  afterimage:{C:500,D:1200,
    atk:t=>({pose:t<1000?"cast":"idle",alpha:t<1000?0.55+0.2*Math.sin(t/40):1}),
    def:t=>{ if(t<500||t>1050) return null; const p=((t-500)%180)/180; return {off:[(1-p)*6,0],pose:"hurt"}; },
    back(c,t,x){ const s=x.self, tg=x.target, R=tg.r, spr=x.self&&x.self.r; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r; for(let i=0;i<3;i++){ const t0=200+i*180, k=(t-t0)/300; if(k<0||k>1) continue; const an=-Math.PI*0.5+(i-1)*1.1, px=tg.x+Math.cos(an)*R*1.4, py=tg.y-R*0.2+Math.sin(an)*R*1.1;
        c.save(); c.globalAlpha=(k<0.3?k/0.3:1-(k-0.3)/0.7)*0.7; c.fillStyle=atRgba(x.body||[180,180,200],1); c.beginPath(); c.ellipse(px,py,s.r*0.7,s.r*0.85,0,0,7); c.fill(); c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=2; for(let j=0;j<3;j++){ c.beginPath(); c.moveTo(px-s.r*0.7,py-s.r*0.4+j*s.r*0.4); c.lineTo(px+s.r*0.7,py-s.r*0.4+j*s.r*0.4); c.stroke(); } c.restore();
        if(k>0.3&&k<0.6) MV.lines(c,tg.x,tg.y-R*0.2,R,px>tg.x?-1:1,4,1-(k-0.3)/0.3); }
      for(let i=0;i<3;i++) atImpact(t,500+i*180,0.15,0); }},
  /* Midnight: a huge clock face rises behind the target, the hands sweep to twelve and it strikes, each chime a ring of sound */
  clockstrike:{C:900,D:1600,
    atk:t=>({pose:t<1300?"cast":"idle"}),
    def:t=>t>=900&&t<1400?{off:[Math.sin(t/14)*2,0],pose:"hurt"}:null,
    back(c,t,x){ const tg=x.target, R=tg.r; if(t<150||t>1550) return; const a=t<400?(t-150)/250:t<1350?1:1-(t-1350)/200, cx=tg.x, cy=tg.y-R*1.6, rr=R*1.8; c.save(); c.globalAlpha*=a;
      c.fillStyle="#f6efd8"; c.beginPath(); c.arc(cx,cy,rr,0,7); c.fill(); c.strokeStyle="#5a4630"; c.lineWidth=R*0.14; c.stroke(); c.fillStyle="#5a4630"; for(let i=0;i<12;i++){ const an=i/12*Math.PI*2; c.beginPath(); c.arc(cx+Math.sin(an)*rr*0.82,cy-Math.cos(an)*rr*0.82,R*(i%3?0.05:0.1),0,7); c.fill(); }
      const k=Math.min(1,Math.max(0,(t-300)/600)), mh=-Math.PI*0.6*(1-eio(k)), hh=-Math.PI*0.3*(1-eio(k)); c.lineCap="round"; c.strokeStyle="#2a2018"; c.lineWidth=R*0.12; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.sin(hh)*rr*0.5,cy-Math.cos(hh)*rr*0.5); c.stroke();
      c.lineWidth=R*0.07; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.sin(mh)*rr*0.75,cy-Math.cos(mh)*rr*0.75); c.stroke(); c.fillStyle="#c9a040"; c.beginPath(); c.arc(cx,cy,R*0.1,0,7); c.fill(); c.restore(); },
    fx(c,t,x){ const tg=x.target, R=tg.r; for(let j=0;j<3;j++){ const k=(t-900-j*150)/400; if(k>=0&&k<1) SG.ring(c,tg.x,tg.y-R*1.6,R*(1.9+1.5*k),R*(1.9+1.5*k),[255,230,150],4*(1-k),1-k); } atImpact(t,900,0.4,0.05); }},
  /* Save Up: coins drop out of the air and stack up, then slide into its coin slot one by one */
  coinsave:{C:700,D:1200,
    atk:t=>({pose:t<1000?atPose("cast",{eyes:"happy"}):"idle",sy:t>=700&&t<1000?1+0.04*Math.sin((t-700)/50):1}),
    fx(c,t,x){ const s=x.self, R=s.r; for(let i=0;i<6;i++){ const t0=100+i*90, k=(t-t0)/300; if(k<0) continue; const slot={x:s.x,y:s.y-R*0.9}; let px,py;
        if(k<1){ px=s.x+(i-2.5)*R*0.22; py=s.y-R*3.4+k*R*2.0; } else { const q=Math.min(1,(k-1)/0.5); if(q>=1) continue; px=s.x+(i-2.5)*R*0.22*(1-q); py=s.y-R*1.4+(slot.y-(s.y-R*1.4))*q; }
        c.save(); c.translate(px,py); c.scale(1.6,1.6); vbDraw(c,"coin",i,t,x); c.restore(); }
      if(t>=700&&t<1100){ const k=(t-700)/400; for(let i=0;i<5;i++) atStar4(c,s.x+Math.cos(i*1.26)*R*1.1,s.y-R*0.5+Math.sin(i*1.26)*R*0.6-k*R*0.4,R*0.13*(1-k),"rgba(255,230,120,.95)"); } }},
  /* Burrow: it digs in and vanishes, a mound of dirt runs along under the floor, and it pops back up where it started */
  burrow:{C:500,D:1200,
    atk:t=>{ if(t<300){ const k=eo(t/300); return {sy:1-0.5*k,arc:30*k,alpha:1-k,pose:"crouch"}; } if(t<900) return {alpha:0,pose:"crouch"}; const k=eo(Math.min(1,(t-900)/250)); return {arc:30*(1-k),alpha:k,sy:0.8+0.2*k,pose:"idle"}; },
    fx(c,t,x){ const s=x.self, R=s.r, d=atDir(x); if(t<100||t>1200) return; if(t<350) SG.dust(c,s.x,s.foot,R,(t-100)/250,8);
      if(t>=300&&t<900){ const k=(t-300)/600, mx=s.x+d*R*1.8*Math.sin(k*Math.PI); c.fillStyle="#8a6a48"; c.beginPath(); c.ellipse(mx,s.foot,R*0.6,R*0.25,0,Math.PI,0); c.fill(); c.fillStyle="#a8865e"; for(let i=0;i<4;i++){ c.beginPath(); c.arc(mx+(i-1.5)*R*0.25,s.foot-R*0.18-Math.abs(Math.sin(t/60+i))*R*0.1,R*0.07,0,7); c.fill(); } }
      if(t>=900&&t<1200) SG.dust(c,s.x,s.foot,R,(t-900)/300,8); }}
});
delete ANIM.afterimage.back;
if(typeof KSND!=="undefined") Object.assign(KSND,{
  parry:(d,t)=>{ sTone(d,t+0.15,'triangle',2200,1800,0.12,0.05); sTone(d,t+0.3,'triangle',2600,2000,0.1,0.04); dNoise(d,t+0.5,0.08,0.2,'highpass',2500,1.5); },
  static:(d,t)=>{ dNoise(d,t+0.12,0.8,0.12,'highpass',2000,0.3); },
  sawcut:(d,t)=>{ dKick(d,t+0.38,0.3); for(let i=0;i<8;i++) dNoise(d,t+0.48+i*0.065,0.05,0.12,'bandpass',2200,2); },
  wandtap:(d,t)=>{ sTone(d,t+0.4,'sine',1600,2400,0.15,0.05); sTone(d,t+0.45,'sine',2400,3200,0.15,0.03); },
  hookyank:(d,t)=>{ dNoise(d,t+0.15,0.25,0.08,'bandpass',900,0.8); dKick(d,t+0.44,0.35); sTone(d,t+0.44,'sawtooth',300,150,0.2,0.03); },
  foamheap:(d,t)=>{ for(let i=0;i<8;i++) sTone(d,t+0.2+i*0.07,'sine',500+i*60,700+i*60,0.06,0.03); dNoise(d,t+0.8,0.25,0.2,'highpass',2000,1); },
  afterimage:(d,t)=>{ for(let i=0;i<3;i++){ sTone(d,t+0.2+i*0.18,'sine',900,500,0.12,0.04); dNoise(d,t+0.5+i*0.18,0.05,0.14,'bandpass',1500,2); } },
  clockstrike:(d,t)=>{ dNoise(d,t+0.3,0.5,0.05,'bandpass',3000,4); for(let i=0;i<3;i++) sTone(d,t+0.9+i*0.15,'sine',660,650,0.5,0.06); },
  coinsave:(d,t)=>{ for(let i=0;i<6;i++) sTone(d,t+0.35+i*0.09,'triangle',1800+i*120,1800+i*120,0.08,0.04); },
  burrow:(d,t)=>{ dNoise(d,t+0.05,0.35,0.15,'lowpass',500); dNoise(d,t+0.3,0.6,0.06,'lowpass',300); dNoise(d,t+0.9,0.3,0.15,'lowpass',500); }
});
Object.assign(AR_KIND,{"Riposte":"parry","Fan Parry":"parry","Signal Jam":"static","Tarnish":"static","Saw in Half":"sawcut","Wand Tap":"wandtap","Hook Pull":"hookyank","Foam Smother":"foamheap","Broadcast":"trumpet","Ghost Image":"afterimage","Midnight":"clockstrike","Save Up":"coinsave","Burrow":"burrow"});

/* ---- 17 Nov 2026, Gid's notes on the review video ---- */
/* a nicer bat: a furry body with ears, scalloped membrane wings on finger bones that flap, red eyes and two little fangs */
MV.bat=(c,x,y,z,ph,dir=1)=>{ c.save(); c.translate(x,y); c.scale(dir*z/14,z/14); const fl=Math.sin(ph); const wing=sd=>{ c.save(); c.scale(sd,1); c.rotate(-0.5*fl);
    const g=c.createLinearGradient(0,-12,0,6); g.addColorStop(0,"#4a2a5c"); g.addColorStop(1,"#22122e"); c.fillStyle=g; c.beginPath(); c.moveTo(3,-3); c.quadraticCurveTo(10,-14,24,-10); c.quadraticCurveTo(22,-4,25,1); c.quadraticCurveTo(20,-1,17,4); c.quadraticCurveTo(13,0,10,5); c.quadraticCurveTo(7,1,3,4); c.closePath(); c.fill();
    c.strokeStyle="rgba(150,100,180,.6)"; c.lineWidth=0.8; for(const [ex,ey] of [[24,-10],[25,1],[17,4],[10,5]]){ c.beginPath(); c.moveTo(4,-2); c.lineTo(ex,ey); c.stroke(); } c.restore(); };
  wing(-1); wing(1); c.fillStyle="#2e1a3a"; c.beginPath(); c.ellipse(0,0,6,7.5,0,0,7); c.fill(); for(const sd of [-1,1]){ c.beginPath(); c.moveTo(sd*2,-6); c.lineTo(sd*5.5,-12); c.lineTo(sd*5.5,-5); c.fill(); }
  c.fillStyle="rgba(120,80,140,.6)"; c.beginPath(); c.ellipse(0,1.5,3.5,4,0,0,7); c.fill(); c.fillStyle="#ff3a55"; for(const sd of [-1,1]){ c.beginPath(); c.arc(sd*2.4,-2,1.4,0,7); c.fill(); } c.fillStyle="#fff"; for(const sd of [-1,1]){ c.beginPath(); c.moveTo(sd*0.6,2.5); c.lineTo(sd*1.6,2.5); c.lineTo(sd*1.1,4.6); c.fill(); } c.restore(); };
/* a textured storm cloud: lumps shaded light on top and dark underneath, a flat dark base, rim light and a slow drift */
MV.cloud=(c,cx,cy,R,t,base=[120,130,150])=>{ const lumps=[[-1.05,0.12,0.5],[-0.55,-0.2,0.62],[0.05,-0.38,0.7],[0.6,-0.18,0.6],[1.05,0.1,0.48],[-0.25,0.12,0.55],[0.35,0.15,0.55]];
  c.save(); for(const [ox,oy,r] of lumps){ const x0=cx+ox*R+Math.sin(t/700+ox*3)*R*0.04, y0=cy+oy*R, rr=r*R, g=c.createRadialGradient(x0-rr*0.3,y0-rr*0.45,rr*0.1,x0,y0,rr); g.addColorStop(0,atRgba(base.map(v=>Math.min(255,v+70)),1)); g.addColorStop(0.6,atRgba(base,1)); g.addColorStop(1,atRgba(base.map(v=>v*0.6),1));
    c.fillStyle=g; c.beginPath(); c.arc(x0,y0,rr,0,7); c.fill(); }
  c.fillStyle=atRgba(base.map(v=>v*0.55),1); c.beginPath(); c.ellipse(cx,cy+R*0.3,R*1.3,R*0.22,0,0,7); c.fill();
  c.strokeStyle="rgba(255,255,255,.45)"; c.lineWidth=2; for(const [ox,oy,r] of lumps.slice(1,4)){ c.beginPath(); c.arc(cx+ox*R,cy+oy*R,r*R*0.92,3.6,5.2); c.stroke(); }
  c.strokeStyle=atRgba(base.map(v=>v*0.45),0.5); c.lineWidth=1.2; for(let i=0;i<5;i++){ const xx=cx+(i-2)*R*0.42+Math.sin(t/300+i)*R*0.05; c.beginPath(); c.arc(xx,cy+R*0.05,R*0.18,0.2,2.6); c.stroke(); } c.restore(); };
Object.assign(ANIM,{
  /* Riposte is now a ready stance: it braces, its claw glints, and a gold ring holds round it while the stance is up. The counter itself is counterslash, played when a strike comes in */
  parry:{C:420,D:900,
    atk:t=>({pose:t<760?"guard":"idle",sy:t<760?0.94:1,sx:t<760?1.04:1}),
    fx(c,t,x){ const s=x.self, R=s.r, d=atDir(x); const a=t<150?t/150:t<760?1:Math.max(0,1-(t-760)/140); if(a<=0) return; c.save(); c.globalAlpha*=a;
      c.strokeStyle="rgba(255,215,110,.9)"; c.lineWidth=3; c.setLineDash([10,7]); c.lineDashOffset=-t/20; c.beginPath(); c.ellipse(s.x,s.foot-2,R*1.3,R*0.32,0,0,7); c.stroke(); c.setLineDash([]);
      if(t>=200&&t<520){ const k=(t-200)/320, gx=s.x+d*R*0.9, gy=s.y-R*0.4; c.globalCompositeOperation="lighter"; atStar4(c,gx,gy,R*0.5*Math.sin(k*Math.PI),"rgba(255,250,220,1)"); atGlowA(c,gx,gy,R*0.6*Math.sin(k*Math.PI),[255,230,150],0.6); }
      c.restore(); }},
  counterslash:{C:450,D:850,contact:true,marks:true,
    atk:t=>{ if(t<300) return {f:0,pose:"guard"}; if(t<450){ const k=ei((t-300)/150); return {f:0.75*k,pose:"swipeup",rot:-0.1}; } if(t<580) return {f:0.78,pose:"swipedown",rot:0.12}; const k=(t-580)/270; return {f:0.78*(1-eio(Math.min(1,k))),pose:"idle"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x); if(t>=430&&t<720){ const k=(t-430)/290; MV.crescent(c,tg.x-d*R*0.2,tg.y-R*0.25,R*1.35,d,1-k,[255,236,170]); for(let i=0;i<7;i++){ const a=-1.2+i*0.4, v=R*(0.5+1.1*eo(k)); atStar4(c,tg.x+d*Math.cos(a)*v,tg.y-R*0.25+Math.sin(a)*v,R*0.2*(1-k),"rgba(255,240,180,.95)"); } }
      atImpact(t,450,0.4,0.08); }},
  /* Ghost Image: Antik's picture flickers and three see-through copies of its own body step out of it in a blink of static, surround the target and rush it one after another */
  afterimage:{C:760,D:1600,tail:900,
    atk:t=>({pose:t<1350?"cast":"idle",alpha:t<1350?0.55+0.25*Math.sin(t/28)+(atH(Math.floor(t/50))<0.15?-0.3:0):1,off:[t<1350&&atH(Math.floor(t/60))<0.2?(atH(t)-0.5)*8:0,0]}),
    copies(t,o){ const g=o.gap||200, d=o.dir||1, out=[]; const spots=[[g-70,-6],[g*0.62,-74],[g+62,-4]];
      for(let i=0;i<3;i++){ const t0=120+i*140, hit=760+i*170, [tx,ty]=spots[i]; if(t<t0||t>hit+260) continue; let dx,dy,a,P="attack",flip=i===2;
        if(t<t0+220){ const k=eo((t-t0)/220); dx=d*tx*k; dy=ty*k-Math.sin(k*Math.PI)*30; a=0.6*k; P="jump"; }
        else if(t<hit-90){ dx=d*tx; dy=ty+Math.sin(t/90+i)*3; a=0.6+0.1*Math.sin(t/40+i); P="determined"; }
        else if(t<hit){ const k=ei((t-(hit-90))/90); dx=d*(tx+(g-tx)*k); dy=ty*(1-k); a=0.75; P="tackle"; }
        else { const k=(t-hit)/260; dx=d*(g+(flip?-1:1)*20*k); dy=0; a=0.75*(1-k); P="tackle"; }
        if(atH(Math.floor(t/45)+i*7)<0.12) a*=0.3; out.push({dx,dy,a,P,flip}); }
      return out; },
    def:t=>{ for(let i=0;i<3;i++){ const h=760+i*170; if(t>=h&&t<h+150) return {off:[(i===2?-1:1)*10*(1-(t-h)/150),0],pose:"hurt",flash:t-h<40?2:0}; } return null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), gap=Math.abs(tg.x-s.x), spots=[[gap-70,-6],[gap*0.62,-74],[gap+62,-4]];
      for(let i=0;i<3;i++){ const t0=120+i*140, k=(t-t0)/240; if(k>=0&&k<1){ const px=s.x+d*spots[i][0]*eo(k), py=s.y+spots[i][1]*eo(k); for(let j=0;j<26;j++){ const v=atH(Math.floor(t/40)*31+j*7+i); c.fillStyle=`rgba(${v*255},${v*255},${v*255},${0.8*(1-k)})`; c.fillRect(px+(atH(j*3+i)-0.5)*s.r*2,py+(atH(j*5+i)-0.5)*s.r*2,s.r*0.12,s.r*0.12); } }
        const h=760+i*170; if(t>=h&&t<h+260){ const q=(t-h)/260; MV.lines(c,tg.x,tg.y-R*0.2,R,i===2?1:-1,5,1-q); for(let j=0;j<5;j++) atStar4(c,tg.x+(atH(j+i*9)-0.5)*R*1.6,tg.y-R*0.3+(atH(j*3+i)-0.5)*R*1.2,R*0.16*(1-q),"rgba(200,240,255,.95)"); } }
      for(let i=0;i<3;i++) atImpact(t,760+i*170,0.22,0.03); }},
  /* Burrow: it spins down into the ground in a spray of dirt clods, a big mound with cracks and pebbles races out and back under the floor, and it bursts up in a ring of dirt */
  burrow:{C:500,D:1350,
    atk:t=>{ if(t<320){ const k=eo(t/320); return {sy:1-0.6*k,arc:34*k,alpha:1-k,rot:Math.sin(t/25)*0.2*k,pose:"crouch"}; } if(t<1000) return {alpha:0,pose:"crouch"}; if(t<1180){ const k=eo((t-1000)/180); return {arc:34-70*k,alpha:Math.min(1,k*2),sy:1.15,pose:"jump"}; } const k=(t-1180)/170; return {arc:-36*(1-eio(Math.min(1,k))),sy:k<0.4?0.85:1,pose:"idle"}; },
    fx(c,t,x){ const s=x.self, R=s.r, d=atDir(x), ground=s.foot;
      const clods=(k,cx,n,seed)=>{ for(let i=0;i<n;i++){ const a=-Math.PI*(0.12+0.76*atH(i*3+seed)), v=R*(0.6+1.6*atH(i*7+seed)), px=cx+Math.cos(a)*v*eo(k), py=ground+Math.sin(a)*v*eo(k)+k*k*R*2.2; c.fillStyle=i%3?"#8a6644":"#6a4a30"; c.beginPath(); c.ellipse(px,py,R*(0.09+0.06*atH(i)),R*(0.07+0.04*atH(i*2)),i,0,7); c.fill(); } };
      if(t>=60&&t<520){ const k=(t-60)/460; clods(k,s.x,16,1); SG.dust(c,s.x,ground,R*1.2,k,10); }
      if(t>=300&&t<1060){ const k=(t-300)/760, mx=s.x+d*R*2.6*Math.sin(k*Math.PI), w=R*0.95, h=R*0.48; c.save(); const g=c.createLinearGradient(0,ground-h,0,ground); g.addColorStop(0,"#b08a60"); g.addColorStop(1,"#6a4a30"); c.fillStyle=g; c.beginPath(); c.ellipse(mx,ground,w,h,0,Math.PI,0); c.fill();
        c.strokeStyle="rgba(60,40,24,.8)"; c.lineWidth=1.8; for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(mx+(i-1)*w*0.4,ground-h*0.9); c.lineTo(mx+(i-1)*w*0.5+R*0.1,ground-h*0.4); c.lineTo(mx+(i-1)*w*0.45,ground-h*0.1); c.stroke(); }
        for(let i=0;i<5;i++){ c.fillStyle="#9a9088"; c.beginPath(); c.arc(mx+(atH(i*3+Math.floor(t/80))-0.5)*w*1.6,ground-h*(0.6+0.6*Math.abs(Math.sin(t/70+i))),R*0.07,0,7); c.fill(); } c.restore();
        SG.dust(c,mx-d*R*0.9,ground,R*0.6,(t/220)%1,4); c.strokeStyle="rgba(80,55,35,.6)"; c.lineWidth=2; c.beginPath(); c.moveTo(s.x,ground+2); c.lineTo(mx,ground+2); c.stroke(); }
      if(t>=980&&t<1350){ const k=(t-980)/370; clods(k,s.x,20,5); SG.ring(c,s.x,ground,R*(0.5+1.8*k),R*(0.14+0.4*k),[140,100,70],4*(1-k),1-k); SG.dust(c,s.x,ground,R*1.4,k,12); SG.cracks(c,s.x,ground,R*1.1,6,2,1-k); } }},
  /* Squirt and other water jets: a wobbling stream of water pours from its mouth to the target, with drops breaking off and a splash where it lands */
  waterjet:{C:420,D:950,
    atk:t=>({pose:t<200?"cast":t<760?atPose("bitewide",{open:0.8}):"idle"}),
    def:t=>t>=420&&t<800?{off:[Math.sin(t/15)*2,0],pose:"hurt"}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), o=s.mouth||{x:s.x+d*s.r*0.5,y:s.y-s.r*0.1}, hot=/Scald/.test(x.name||""); if(t<180||t>860) return;
      const grow=Math.min(1,(t-180)/220), shrink=t<640?0:Math.min(1,(t-640)/200), n=28, a0=shrink, a1=grow, pts=[];
      for(let j=0;j<=n;j++){ const u=a0+(a1-a0)*j/n, p=lerpP(o,{x:tg.x,y:tg.y-R*0.2},u,R*0.7); pts.push([p.x,p.y+Math.sin(u*14-t/30)*R*0.06*u,u]); }
      c.save(); c.lineCap="round"; c.lineJoin="round"; for(const [w,col] of [[R*0.34,"rgba(40,110,200,.75)"],[R*0.24,hot?"rgba(170,215,250,.95)":"rgba(90,170,240,.95)"],[R*0.08,"rgba(240,252,255,.95)"]]){ c.strokeStyle=col; c.lineWidth=w; c.beginPath(); pts.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.stroke(); } c.restore();
      for(let i=0;i<10;i++){ const q=((t/260)+i/10)%1, u=a0+(a1-a0)*q, p=lerpP(o,{x:tg.x,y:tg.y-R*0.2},u,R*0.7); HR_DROP(c,p.x+Math.sin(i*2.3)*R*0.25,p.y+R*0.2+q*R*0.3,R*0.06,[150,210,250],0.8*(1-q)); }
      if(hot) for(let i=0;i<4;i++){ const q=((t/500)+i/4)%1; SG.puff(c,tg.x+(i-1.5)*R*0.4,tg.y-R*0.6-q*R,R*(0.2+0.2*q),0.5*(1-q)); }
      if(grow>=1&&t<760){ const q=((t-400)/360)%1; for(let i=0;i<8;i++){ const a=-Math.PI*(0.1+0.8*atH(i*3)), v=R*(0.4+0.9*((q+i/8)%1)); HR_DROP(c,tg.x-d*R*0.3+Math.cos(a)*v*-d,tg.y-R*0.2+Math.sin(a)*v,R*0.07,[160,220,252],0.9); } SG.ring(c,tg.x,tg.foot,R*(0.5+0.6*q),R*0.15,[220,240,255],2,0.7*(1-q)); }
      atImpact(t,420,0.2,0.03); }},
  /* Signal Jam: a wall of TV static floods the target for well over a second, with rolling bars, colour tears and a dead-channel hiss */
  static:{C:560,D:1900,tail:1300,
    atk:t=>({pose:t<1500?"cast":"idle",off:[t<1500?(atH(Math.floor(t/40))-0.5)*3:0,0]}),
    def:t=>t>=560&&t<1700?{off:[(atH(Math.floor(t/30))-0.5)*7,(atH(Math.floor(t/30)+3)-0.5)*3],pose:"hurt",flash:Math.floor(t/50)%3===0?3:0}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, tarnish=/Tarnish/.test(x.name||""), a=t<300?t/300:t<1550?1:Math.max(0,1-(t-1550)/250); if(t<100||a<=0) return;
      if(!tarnish&&t<600){ const k=(t-100)/500; for(let i=0;i<4;i++) SG.ring(c,s.x+(tg.x-s.x)*((k+i/4)%1),s.y-s.r*0.6+(tg.y-s.y)*((k+i/4)%1),R*0.5,R*0.6,[230,230,230],2,0.6*a); }
      const W=R*3.2, H=R*2.8, x0=tg.x-W/2, y0=tg.y-R*0.3-H/2, cell=R*0.11, fr=Math.floor(t/40); c.save(); c.globalAlpha*=a*0.92; c.beginPath(); c.ellipse(tg.x,tg.y-R*0.3,W/2,H/2,0,0,7); c.clip();
      for(let yy=0;yy<H;yy+=cell) for(let xx=0;xx<W;xx+=cell){ const v=atH(fr*977+Math.floor(xx/cell)*31+Math.floor(yy/cell)*7); c.fillStyle=tarnish?`rgb(${60+v*80},${50+v*60},${30+v*40})`:`rgb(${v*255|0},${v*255|0},${v*255|0})`; c.fillRect(x0+xx,y0+yy,cell+0.5,cell+0.5); }
      if(!tarnish){ for(let i=0;i<2;i++){ const by=y0+((t/3+i*H/2)%H); c.fillStyle="rgba(255,255,255,.35)"; c.fillRect(x0,by,W,R*0.18); c.fillStyle="rgba(0,0,0,.35)"; c.fillRect(x0,by+R*0.18,W,R*0.08); }
        if(atH(fr*3)<0.35){ const ty=y0+atH(fr*5)*H; c.fillStyle="rgba(255,40,80,.45)"; c.fillRect(x0,ty,W,R*0.1); c.fillStyle="rgba(40,220,255,.45)"; c.fillRect(x0+R*0.15,ty+R*0.1,W,R*0.1); } }
      c.restore(); c.save(); c.globalAlpha*=a; c.strokeStyle="rgba(255,255,255,.6)"; c.lineWidth=2; c.beginPath(); c.ellipse(tg.x,tg.y-R*0.3,W/2,H/2,0,0,7); c.stroke(); c.restore(); atImpact(t,560,0.25,0.05); }}
});
/* a better cup, a pour from Teep's own spout for Tea Time, and bigger thrown props with a spin blur */
{ const C0=ANIM.consume; ANIM.consume={...C0,D:1300,
  fx(c,t,x){ const s=x.self, R=s.r, d=atDir(x), tea=/Tea Time/.test(x.name||""), n=x.name||""; const cup=/Gourd/.test(n)?"gourd":/Juice|Nectar/.test(n)?"glass":/Cocoa|Treat/.test(n)?"mug":/Brew/.test(n)?"flask":"teacup", liquid=cup==="glass"?[255,180,58]:cup==="flask"?[155,226,122]:cup==="gourd"?[232,220,176]:cup==="mug"?[110,62,36]:[184,110,48];
    const cx=s.x+d*R*1.15, cy=s.y+R*0.1, sc=R/14, fill=tea?Math.min(1,Math.max(0,(t-260)/380)):1, lift=t<700?0:Math.min(1,(t-700)/200), tip=t<760?0:Math.min(1,(t-760)/180), ox=cx-d*R*0.55*lift, oy=cy-R*0.55*lift;
    if(t<1050){ c.save(); c.translate(ox,oy); c.rotate(-d*0.7*tip); c.scale(sc,sc);
      if(cup==="teacup"){ c.fillStyle="#f6f1ea"; c.beginPath(); c.ellipse(0,9,13,3.5,0,0,7); c.fill(); c.strokeStyle="#b8a898"; c.lineWidth=1; c.stroke(); const g=c.createLinearGradient(-9,0,9,0); g.addColorStop(0,"#ffffff"); g.addColorStop(1,"#e4dccf"); c.fillStyle=g; c.beginPath(); c.moveTo(-9,-4); c.quadraticCurveTo(-8,8,0,8); c.quadraticCurveTo(8,8,9,-4); c.closePath(); c.fill(); c.stroke();
        c.fillStyle="#d86a7a"; c.fillRect(-8,-1,16,1.6); c.beginPath(); c.arc(10,1.5,3.2,-1.4,1.4); c.lineWidth=1.8; c.strokeStyle="#e4dccf"; c.stroke(); c.fillStyle=atRgba(liquid,1); c.beginPath(); c.ellipse(0,-4+ (1-fill)*4,8.6*(0.7+0.3*fill),2,0,0,7); if(fill>0.05) c.fill(); c.strokeStyle="#b8a898"; c.lineWidth=1; c.beginPath(); c.ellipse(0,-4,9,2.2,0,0,7); c.stroke(); }
      else if(cup==="mug"){ c.fillStyle="#e8f0ff"; c.fillRect(-8,-8,16,17); c.strokeStyle="#9aa8c0"; c.lineWidth=1.2; c.strokeRect(-8,-8,16,17); c.beginPath(); c.arc(9,0,4,-1.4,1.4); c.lineWidth=2; c.stroke(); c.fillStyle=atRgba(liquid,1); c.fillRect(-7,-7,14,3); c.fillStyle="#fff"; for(let i=0;i<3;i++){ c.beginPath(); c.arc(-4+i*4,-8,2,0,7); c.fill(); } }
      else if(cup==="gourd"){ c.fillStyle="#c99a4a"; c.beginPath(); c.arc(0,5,9,0,7); c.fill(); c.beginPath(); c.arc(0,-6,6,0,7); c.fill(); c.strokeStyle="#8a6420"; c.lineWidth=1.2; c.stroke(); c.fillStyle="#a03030"; c.fillRect(-2,-14,4,4); c.strokeStyle="#a03030"; c.beginPath(); c.moveTo(-6,0); c.lineTo(6,0); c.stroke(); }
      else if(cup==="flask"){ c.fillStyle="rgba(220,240,255,.85)"; c.beginPath(); c.moveTo(-3,-12); c.lineTo(3,-12); c.lineTo(3,-4); c.lineTo(9,9); c.lineTo(-9,9); c.lineTo(-3,-4); c.closePath(); c.fill(); c.strokeStyle="#8aa0b8"; c.lineWidth=1.2; c.stroke(); c.fillStyle=atRgba(liquid,1); c.beginPath(); c.moveTo(-6,2); c.lineTo(6,2); c.lineTo(8.5,8.5); c.lineTo(-8.5,8.5); c.closePath(); c.fill(); for(let i=0;i<3;i++){ const q=((t/300)+i/3)%1; c.beginPath(); c.arc(-2+i*2,6-q*16,1.2,0,7); c.strokeStyle="rgba(255,255,255,.8)"; c.stroke(); } }
      else { c.fillStyle="rgba(230,245,255,.8)"; c.beginPath(); c.moveTo(-7,-10); c.lineTo(7,-10); c.lineTo(5.5,9); c.lineTo(-5.5,9); c.closePath(); c.fill(); c.strokeStyle="#8aa0b8"; c.lineWidth=1.2; c.stroke(); c.fillStyle=atRgba(liquid,1); c.fillRect(-6,-4,12,12); c.strokeStyle="#ff6a8a"; c.lineWidth=1.6; c.beginPath(); c.moveTo(3,-14); c.lineTo(1,4); c.stroke(); }
      c.restore();
      if(fill>0&&t<760) for(let i=0;i<3;i++){ const q=((t/600)+i/3)%1; c.strokeStyle=`rgba(255,255,255,${0.7*(1-q)})`; c.lineWidth=2; c.beginPath(); c.moveTo(ox+(i-1)*R*0.25,oy-R*0.4-q*R*0.8); c.quadraticCurveTo(ox+(i-1)*R*0.25+R*0.2,oy-R*0.6-q*R*0.8,ox+(i-1)*R*0.25,oy-R*0.85-q*R*0.8); c.stroke(); } }
    if(tea&&t>=180&&t<700){ const sp={x:s.x+d*R*0.95,y:s.y-R*0.15}, k=Math.min(1,(t-180)/120)*(t>620?1-(t-620)/80:1), tgt={x:cx,y:cy-R*0.3}; c.save(); c.lineCap="round"; c.strokeStyle=atRgba(liquid,0.95*k); c.lineWidth=R*0.13; c.beginPath(); c.moveTo(sp.x,sp.y); c.quadraticCurveTo(sp.x+d*R*0.35,sp.y-R*0.1,tgt.x,tgt.y); c.stroke(); c.strokeStyle=`rgba(255,240,210,${0.6*k})`; c.lineWidth=R*0.04; c.stroke(); c.restore(); }
    if(t>=900&&t<1300){ const k=(t-900)/400; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,s.x,s.y-R*0.3,R*(1.3+0.6*k),[255,220,150],0.55*(1-k)); c.restore(); for(let i=0;i<6;i++){ const a=i*1.05+t/300; heartShape(c,s.x+Math.cos(a)*R*1.2,s.y-R*0.4+Math.sin(a)*R*0.5-k*R*0.8,0.8*(1-k)*R/18,"#ff8fb0"); } } }}; }
MV.prop=(base=>(c,k,i,t,x)=>{ if(k==="wrench"){ const g=c.createLinearGradient(0,-4,0,4); g.addColorStop(0,"#e4e9ef"); g.addColorStop(0.5,"#a8b2bc"); g.addColorStop(1,"#6a737c"); c.fillStyle=g; c.strokeStyle="#3a4248"; c.lineWidth=1.3;
    c.beginPath(); c.moveTo(-12,-2.5); c.lineTo(10,-2.5); c.lineTo(10,2.5); c.lineTo(-12,2.5); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(9,-2.5); c.lineTo(13,-7); c.lineTo(19,-7); c.lineTo(16,-2.5); c.lineTo(16,2.5); c.lineTo(19,7); c.lineTo(13,7); c.lineTo(9,2.5); c.closePath(); c.fill(); c.stroke();   // open-end jaw
    c.beginPath(); c.arc(-14,0,6,0,7); c.fill(); c.stroke(); c.fillStyle="#2a3036"; c.beginPath(); for(let j=0;j<6;j++){ const a=j*Math.PI/3; c.lineTo(-14+Math.cos(a)*2.8,Math.sin(a)*2.8); } c.closePath(); c.fill();   // ring end
    c.fillStyle="rgba(255,255,255,.7)"; c.fillRect(-10,-1.8,16,1); return; }
  if(k==="gear"){ const g=c.createRadialGradient(-3,-3,1,0,0,15); g.addColorStop(0,"#f2e2b0"); g.addColorStop(1,"#a8884a"); c.fillStyle=g; c.beginPath(); for(let j=0;j<20;j++){ const a=j/20*Math.PI*2, r=j%2?11:15; c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); c.strokeStyle="#6a5a3a"; c.lineWidth=1.4; c.stroke(); c.fillStyle="#6a5a3a"; c.beginPath(); c.arc(0,0,4,0,7); c.fill(); for(let j=0;j<4;j++){ c.beginPath(); c.arc(Math.cos(j*1.57)*7.5,Math.sin(j*1.57)*7.5,1.6,0,7); c.fill(); } return; }
  base(c,k,i,t,x); })(MV.prop);
{ const P0=ANIM.propthrow; ANIM.propthrow={...P0, fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, k0=(t-200)/420, kind=ptProp(x.name||""), d=atDir(x), sc=2.2, from={x:s.x+d*s.r*0.6,y:s.y-s.r*0.9};
    const draw=(px,py,rot,a)=>{ c.save(); c.translate(px,py); c.rotate(rot); c.globalAlpha*=a; c.scale(sc,sc); MV.prop(c,kind,0,t,x); c.restore(); };
    if(k0<0){ draw(from.x,from.y,-d*0.6*Math.min(1,t/200),Math.min(1,t/120)); return; }
    if(k0<=1){ const p=lerpP(from,tg,k0,R*1.6), rot=d*t/45; c.save(); c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=3; c.beginPath(); c.arc(p.x,p.y,R*0.55,rot-1.4,rot); c.stroke(); c.beginPath(); c.arc(p.x,p.y,R*0.55,rot+Math.PI-1.4,rot+Math.PI); c.stroke(); c.restore();
      for(let j=3;j>=1;j--){ const q=lerpP(from,tg,Math.max(0,k0-j*0.05),R*1.6); draw(q.x,q.y,rot-j*0.5,0.14*(4-j)); } draw(p.x,p.y,rot,1); }
    else if(k0<1.6){ const q=(k0-1)/0.6; for(let j=0;j<8;j++){ const a=j*0.785, v=R*(0.4+1.0*eo(q)); atStar4(c,tg.x+Math.cos(a)*v,tg.y+Math.sin(a)*v*0.7,R*0.2*(1-q),j%2?"rgba(255,245,200,.95)":"rgba(255,200,120,.95)"); } draw(tg.x+d*R*1.4*q,tg.foot-R*0.4-Math.sin(q*Math.PI)*R*0.9,d*t/40,1-q); }
    atImpact(t,620,0.3,0.05); }}; }
/* Downpour's cloud gets texture; Bat Swarm flies flat across in a flock and swirls round the target */
{ const RS=ANIM.rainshower; ANIM.rainshower={...RS, fx(c,t,x){ const tg=x.target, R=tg.r, a=t<200?t/200:t<1050?1:Math.max(0,1-(t-1050)/150); if(a<=0) return; const k=RS_KIND(x.name||""), cy=tg.y-R*2.6;
    c.save(); c.globalAlpha*=a; MV.cloud(c,tg.x,cy,R*1.15,t,k==="molten"?[100,70,66]:k==="light"||k==="spark"?[235,225,190]:k==="coin"?[220,200,140]:[118,128,150]); c.restore();
    if(t>=250&&t<1100) for(let i=0;i<34;i++){ const q=((t-250)/330+atH(i*5))%1, px=tg.x+(atH(i*3)-0.5)*R*2.4, py=cy+R*0.45+q*(tg.foot-cy-R*0.45); c.save(); c.globalAlpha*=a*(q<0.9?1:(1-q)*10); c.translate(px,py);
      if(k==="rain"){ c.strokeStyle="rgba(170,215,250,.6)"; c.lineWidth=2; c.beginPath(); c.moveTo(0,-R*0.35); c.lineTo(0,-R*0.1); c.stroke(); HR_DROP(c,0,0,R*0.11,[110,180,245],1); }
      else if(k==="ice"){ c.fillStyle="#bfe6ff"; c.beginPath(); c.moveTo(0,R*0.18); c.lineTo(-R*0.06,-R*0.08); c.lineTo(R*0.06,-R*0.08); c.closePath(); c.fill(); }
      else if(k==="molten"){ atGlowA(c,0,0,R*0.12,[255,140,40],0.9); c.fillStyle="#ffd060"; c.beginPath(); c.arc(0,0,R*0.05,0,7); c.fill(); }
      else if(k==="light") atGlowA(c,0,0,R*0.12,[255,250,200],0.95); else if(k==="sting"){ c.strokeStyle="#c9a0ff"; c.lineWidth=2; c.beginPath(); c.moveTo(0,-R*0.1); c.lineTo(0,R*0.1); c.stroke(); }
      else { c.scale(1.1,1.1); vbDraw(c,k,i,t,x); } c.restore(); }
    if(t>=700) for(let i=0;i<3;i++){ const q=((t-700)/400+i/3)%1; SG.ring(c,tg.x+(i-1)*R*0.6,tg.foot,R*0.3*q+2,R*0.08*q+1,[220,240,255],1.5,0.7*(1-q)*a); } }}; }
{ const SW0=ANIM.swarm; ANIM.swarm={...SW0, D:1400,
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), kind=SW_KIND(x.name||""); if(kind!=="bat") return SW0.fx(c,t,x);
    const N=16, gap=Math.abs(tg.x-s.x); for(let i=0;i<N;i++){ const t0=60+i*25, q=(t-t0)/900; if(q<0||q>1) continue; const lane=(atH(i*7)-0.5)*R*1.5, band=tg.y-R*0.35+lane, sx=s.x+d*s.r*0.4;
      let px,py; if(q<0.55){ const u=q/0.55; px=sx+d*(gap+R*1.6)*u; py=band+Math.sin(u*9+i)*R*0.12; } else { const u=(q-0.55)/0.45, an=u*Math.PI*1.4+i; px=tg.x+d*R*1.6*Math.cos(an*0.9)*(1-u*0.3)+d*R*u*2.5; py=band+Math.sin(an)*R*0.5-u*R*1.6; }
      const dirx=q<0.55?d:(Math.cos((q-0.55)/0.45*Math.PI*1.4+i)>0?-d:d); MV.bat(c,px,py,R*(0.36+0.1*atH(i*3)),t/32+i*1.3,dirx); }
    if(t>=420&&t<900){ const q=(t-420)/480; for(let i=0;i<4;i++) MV.lines(c,tg.x,tg.y-R*0.3,R,-d,3,1-q); } atImpact(t,520,0.2,0.03); atImpact(t,700,0.2,0.03); }}; }
Object.assign(AR_KIND,{"Squirt":"waterjet","Splash":"waterjet","Scald":"waterjet"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  waterjet:(d,t)=>{ dNoise(d,t+0.18,0.6,0.16,'bandpass',900,0.6); dNoise(d,t+0.42,0.35,0.12,'highpass',2500,0.8); },
  static:(d,t)=>{ dNoise(d,t+0.1,1.6,0.2,'highpass',1800,0.25); for(let i=0;i<10;i++) dNoise(d,t+0.2+i*0.13,0.04,0.25,'bandpass',3000+i*200,2); sTone(d,t+0.12,'square',1000,1000,0.25,0.03); sTone(d,t+1.2,'sawtooth',120,90,0.4,0.03); },
  afterimage:(d,t)=>{ for(let i=0;i<3;i++){ dNoise(d,t+0.12+i*0.14,0.12,0.12,'highpass',2500,0.5); sTone(d,t+0.7+i*0.17,'sine',900,450,0.1,0.05); dKick(d,t+0.76+i*0.17,0.35); } },
  burrow:(d,t)=>{ dNoise(d,t+0.05,0.45,0.2,'lowpass',500); dNoise(d,t+0.3,0.7,0.08,'lowpass',260); dKick(d,t+0.98,0.6); dNoise(d,t+0.98,0.35,0.22,'lowpass',600); },
  parry:(d,t)=>{ sTone(d,t+0.2,'triangle',2400,2400,0.25,0.04); sTone(d,t+0.24,'sine',3600,3600,0.2,0.02); },
  counterslash:(d,t)=>{ dNoise(d,t+0.18,0.15,0.12,'bandpass',1400,0.8); dKick(d,t+0.33,0.6); dNoise(d,t+0.33,0.12,0.3,'highpass',2500,1.5); },
  consume:(d,t)=>{ dNoise(d,t+0.18,0.45,0.08,'bandpass',700,1.2); for(let i=0;i<3;i++) sTone(d,t+0.78+i*0.12,'sine',320,260,0.09,0.05); sTone(d,t+0.95,'sine',600,1200,0.3,0.04); },
  swarm:(d,t)=>{ for(let i=0;i<16;i++) dNoise(d,t+0.06+i*0.04,0.07,0.06,'bandpass',1600+((i*37)%600),2); sTone(d,t+0.3,'sine',3800,3200,0.3,0.015); dKick(d,t+0.52,0.25); dKick(d,t+0.7,0.25); },
  propthrow:(d,t)=>{ for(let i=0;i<4;i++) dNoise(d,t+0.22+i*0.1,0.06,0.07,'bandpass',1400,1.5); dKick(d,t+0.62,0.4); sTone(d,t+0.62,'triangle',1800,1500,0.15,0.05); }
});
