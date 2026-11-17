/* The ten horrors' moves (17 Nov 2026). Each horror has two signatures, both played as the full special with the long wind-up and close-up:
   the first comes by level, the second from an errantry to its myth's region. Needs arena-sigs.js (SG) and arena-moves.js (MV). */
const HR={};
HR.bone=(c,x,y,z,rot,a=1)=>{ c.save(); c.globalAlpha*=a; c.translate(x,y); c.rotate(rot); c.fillStyle="#f4eedd"; c.strokeStyle="rgba(120,100,80,.8)"; c.lineWidth=1;
  c.fillRect(-z,-z*0.18,z*2,z*0.36); for(const sx of [-1,1]) for(const sy of [-1,1]){ c.beginPath(); c.arc(sx*z,sy*z*0.2,z*0.26,0,7); c.fill(); } c.restore(); };
HR.eye=(c,x,y,r,open,look=0)=>{ if(open<=0.02) return; c.save(); c.translate(x,y); c.scale(1,open); c.fillStyle="#fffdf4"; c.strokeStyle="rgba(60,20,60,.9)"; c.lineWidth=1.4;
  c.beginPath(); c.ellipse(0,0,r,r*0.75,0,0,7); c.fill(); c.stroke(); c.fillStyle="#c23a6e"; c.beginPath(); c.arc(look*r*0.3,0,r*0.45,0,7); c.fill(); c.fillStyle="#1a0f1e"; c.beginPath(); c.arc(look*r*0.3,0,r*0.22,0,7); c.fill(); c.restore(); };
HR.jaw=(c,x,y,h,w,open,side,col)=>{ c.save(); c.translate(x,y); c.scale(side,1); c.fillStyle=atRgba(col,0.96); c.beginPath(); c.moveTo(0,-h/2); c.quadraticCurveTo(w*(0.4+open),0,0,h/2); c.closePath(); c.fill();
  c.fillStyle="#fffbe8"; for(let i=0;i<6;i++){ const yy=-h/2+h*(i+0.5)/6, bx=w*(0.4+open)*Math.cos((yy/(h/2))*Math.PI/2)*0.92; c.beginPath(); c.moveTo(bx*0.5,yy-h*0.06); c.lineTo(bx*0.5-w*0.32,yy); c.lineTo(bx*0.5,yy+h*0.06); c.closePath(); c.fill(); } c.restore(); };
const hrBats=(c,t,x0,y0,n,spread,a)=>{ for(let i=0;i<n;i++){ const q=((t/700)+i/n)%1, px=x0+(i-(n-1)/2)*spread*0.3+Math.sin(t/90+i)*8, py=y0-q*spread; c.fillStyle=`rgba(30,14,40,${a*(1-q)})`; c.beginPath(); c.moveTo(px,py); c.quadraticCurveTo(px-6,py-6,px-12,py-1); c.quadraticCurveTo(px-6,py-2,px,py+3); c.quadraticCurveTo(px+6,py-2,px+12,py-1); c.quadraticCurveTo(px+6,py-6,px,py); c.fill(); } };

Object.assign(ANIM,{
  /* Ghoul's Grave Dig: it digs into the ground, a mound runs under the arena, and it bursts up under the target in a spray of dirt and old bones */
  sg_gravedig:{...ANIM.burstup,sig:true,fx(c,t,x){ ANIM.burstup.fx(c,t,x); const tg=x.target, R=tg.r; if(t>=620&&t<1300){ const k=(t-620)/680; for(let i=0;i<5;i++){ const a=-Math.PI*(0.2+0.6*atH(i*5+1)), sp=R*(0.5+1.8*eo(k)); HR.bone(c,tg.x+Math.cos(a)*sp,tg.foot+Math.sin(a)*sp+k*k*R*2.2,R*0.16,t/70+i*1.3,1-k*0.6); } }
    if(t<300) for(let i=0;i<3;i++) HR.bone(c,x.self.x+(i-1)*x.self.r*0.6,x.self.foot-x.self.r*0.5*Math.sin((t/300)*Math.PI)-i*4,x.self.r*0.12,t/50+i,1-t/300); }},
  /* Ghoul's Feast: it leaps onto the target and gnaws four times, pulling a red glow back into itself */
  sg_feast:{C:560,D:1600,contact:true,marks:true,sig:true,
    atk:t=>{ if(t<300){ const k=eo(t/300); return {f:0.55*k,arc:-40*Math.sin(k*Math.PI*0.7),sy:t<120?0.9:1,pose:t<120?"crouch":"jump"}; }
      if(t<560){ const k=(t-300)/260; return {f:0.55+0.25*k,arc:-26*(1-k),pose:"bitewide"}; }
      if(t<1180){ const p=((t-560)%155)/155; return {f:0.8,rot:(p<0.4?-0.18:0.1)*(Math.floor((t-560)/155)%2?1:-1),pose:p<0.4?"chomp":"bitewide",sy:p<0.4?0.92:1.02}; }
      const k=(t-1180)/420; return {f:0.8*(1-eio(k)),arc:-30*Math.sin(Math.min(1,k)*Math.PI),pose:"idle"}; },
    def:t=>{ if(t<560||t>1240) return null; const p=((t-560)%155)/155; return {off:[(1-p)*5,0],sy:p<0.35?0.92:1,pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r; for(let j=0;j<4;j++){ const k=(t-560-j*155)/240; if(k>=0&&k<1) chompMarks(c,{x:tg.x+((j%2)*2-1)*R*0.25,y:tg.y-R*0.2+(j-1.5)*R*0.12},k); }
      if(t>560&&t<1400) for(let i=0;i<8;i++){ const ph=((t/400)+i/8)%1, px=tg.x+(s.x-tg.x)*ph, py=tg.y-R*0.3+(s.y-tg.y)*ph-Math.sin(ph*Math.PI)*R*0.8+Math.sin(i*2)*R*0.2; c.fillStyle=`rgba(220,40,70,${0.8*(1-ph)})`; c.beginPath(); c.arc(px,py,R*0.07*(1-ph*0.5),0,7); c.fill(); }
      for(let j=0;j<4;j++) atImpact(t,560+j*155,0.22,0); }},
  /* Nightgaunt's Carry Off: it swoops in, grabs the target, carries it high out of sight, then drops it */
  sg_carryoff:{C:1250,D:1900,
    atk:t=>{ if(t<380){ const k=ei(t/380); return {f:0.7*k,arc:-30*Math.sin(k*Math.PI),pose:"tackle"}; }
      if(t<900){ const k=ei((t-380)/520); return {f:0.7,arc:-220*k,pose:"push"}; }
      if(t<1250) return {f:0.7,arc:-220,pose:"cast",alpha:0.6};
      const k=(t-1250)/650; return {f:0.7*(1-eio(k)),arc:-220*(1-eo(k)),pose:"idle",alpha:0.6+0.4*k}; },
    def(t){ if(t<380) return null; if(t<900){ const k=ei((t-380)/520); return {arc:-210*k,rot:0.3*Math.sin(t/90),pose:"hurt"}; }
      if(t<1050) return {arc:-210,rot:0.3*Math.sin(t/90),pose:"hurt"};
      if(t<1250){ const k=ei((t-1050)/200); return {arc:-210*(1-k),rot:k*0.5,pose:"hurt"}; }   // dropped
      const k=(t-1250)/500; return k<1?{arc:-30*Math.sin(Math.min(1,k*2)*Math.PI)*(k<0.5?1:0),sy:k<0.15?0.75:1,pose:"hurt"}:null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r; if(t>380&&t<1050) for(let i=0;i<3;i++){ c.strokeStyle=`rgba(255,255,255,${0.4})`; c.lineWidth=2; c.beginPath(); c.moveTo(tg.x+(i-1)*R*0.4,tg.y+R*0.6); c.lineTo(tg.x+(i-1)*R*0.4,tg.y+R*(1.2+i*0.2)); c.stroke(); }
      if(t>=1250&&t<1700){ const k=(t-1250)/450; SG.dust(c,tg.x,tg.foot,R*1.2,k,10); SG.cracks(c,tg.x,tg.foot,R*1.1,6,2,1-k); atStar4(c,tg.x,tg.y-R*0.4,R*0.8*(1-k),"rgba(255,255,240,.9)"); }
      atImpact(t,1250,0.7,0.12); }},
  /* Nightgaunt's Tickle Storm: its claws and barbed tail tickle the target six times in a blur; it shakes with helpless giggles */
  sg_ticklestorm:{...atFlurry(6,["attack","tackle"],(c,x,k,j)=>{ const tg=x.target, R=tg.r, a=1-k; c.strokeStyle=`rgba(255,210,240,${0.95*a})`; c.lineWidth=2.4; c.beginPath();
      for(let i=0;i<=16;i++){ const u=i/16, px=tg.x-R*0.6+u*R*1.2, py=tg.y-R*(0.4-0.25*(j%3))+Math.sin(u*Math.PI*4+j)*R*0.12; i?c.lineTo(px,py):c.moveTo(px,py); } c.stroke();
      for(let i=0;i<2;i++) atStar4(c,tg.x+(i?1:-1)*R*(0.6+k*0.4),tg.y-R*(0.6+k*0.5),R*0.15*a,`rgba(255,220,120,${a})`); },0.62),sig:true},
  /* Mi-Go's Pink Lights: pink lights rise off its head, drift over and pulse round the target until it reels */
  sg_pinklights:{C:760,D:1500,
    atk:t=>({pose:t<1100?"cast":"idle",arc:t<1100?-6*Math.sin(Math.min(1,t/300)*Math.PI/2):0,off:[t<1100?Math.sin(t/20)*1.2:0,0]}),
    def:t=>t>=760&&t<1400?{rot:0.15*Math.sin(t/110),pose:"hurt",flash:Math.floor(t/120)%2?2:0}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r; c.save(); c.globalCompositeOperation="lighter";
      for(let i=0;i<5;i++){ const k=Math.max(0,Math.min(1,(t-100-i*80)/600)), an=t/300+i*1.26, px=s.x+(tg.x+Math.cos(an)*R*0.9-s.x)*eo(k), py=s.y-s.r*1.2+(tg.y-R*0.3+Math.sin(an)*R*0.6-(s.y-s.r*1.2))*eo(k)-Math.sin(k*Math.PI)*R, a=t<1250?1:Math.max(0,1-(t-1250)/250);
        atGlowA(c,px,py,R*(0.35+0.1*Math.sin(t/60+i)),[255,110,200],0.85*a); atGlowA(c,px,py,R*0.12,[255,240,250],a); }
      if(t>760&&t<1300){ const k=(t-760)/540; for(let i=0;i<3;i++) SG.ring(c,tg.x,tg.y-R*0.3,R*(0.4+1.4*((k+i/3)%1)),R*(0.3+1.0*((k+i/3)%1)),[255,130,210],3,0.7*(1-(k+i/3)%1)); }
      c.restore(); atImpact(t,760,0.3,0.1); }},
  /* Mi-Go's Jar Harvest: a glass jar appears over the target, draws a glowing wisp out of it, seals, and floats back to the Mi-Go */
  sg_jarharvest:{C:820,D:1700,
    atk:t=>({pose:t<1400?"cast":"idle",off:[t<1400?Math.sin(t/25)*1:0,0]}),
    def:t=>t>=500&&t<1300?{sy:1-0.06*Math.sin((t-500)/800*Math.PI),pose:"hurt",alpha:t<1100?0.85:1}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r; if(t<200||t>1650) return;
      const jx=t<1150?tg.x:tg.x+(s.x-tg.x)*eio(Math.min(1,(t-1150)/400)), jy=t<1150?tg.y-R*1.7:tg.y-R*1.7+(s.y-s.r*1.4-(tg.y-R*1.7))*eio(Math.min(1,(t-1150)/400)), ja=t<350?(t-200)/150:t>1550?1-(t-1550)/100:1, z=R*0.55;
      if(t>=450&&t<900){ const k=(t-450)/450; for(let i=0;i<10;i++){ const q=((k*1.5)+i/10)%1, px=tg.x+Math.sin(i*2+t/80)*R*0.3*(1-q), py=tg.y-R*0.2+(jy-tg.y+R*0.2)*q; atGlowA(c,px,py,R*0.12,[255,140,220],0.8*(1-q)); } }
      c.save(); c.globalAlpha*=ja; c.fillStyle="rgba(210,235,255,.35)"; c.strokeStyle="rgba(230,245,255,.9)"; c.lineWidth=2; c.beginPath(); c.moveTo(jx-z*0.7,jy-z*0.6); c.lineTo(jx-z*0.75,jy+z*0.8); c.quadraticCurveTo(jx,jy+z*1.05,jx+z*0.75,jy+z*0.8); c.lineTo(jx+z*0.7,jy-z*0.6); c.closePath(); c.fill(); c.stroke();
      if(t>620){ const g=Math.min(1,(t-620)/300); atGlowA(c,jx,jy+z*0.25,z*0.6*g,[255,120,210],0.9); }   // the harvested glow inside
      c.fillStyle=t>820?"#9aa3ad":"rgba(154,163,173,.0)"; c.fillRect(jx-z*0.78,jy-z*0.8,z*1.56,z*0.25); c.restore(); atImpact(t,820,0.3,0.08); }},
  /* Gug's Gate Knock: it raises its fists and pounds the ground three times, knocking like a giant at a door; the last knock heaves the target up */
  sg_gateknock:{C:1000,D:1700,
    atk:t=>{ const beats=[300,650,1000]; let r={pose:"cast"}; for(const b of beats){ if(t>=b-260&&t<b){ const k=(t-b+260)/260; r={pose:"slamup",sy:1+0.06*k,arc:-10*k}; } if(t>=b&&t<b+120){ r={pose:"slam",sy:0.88,arc:0}; } } if(t>1250) r={pose:"idle"}; return r; },
    def(t){ if(t<300||t>1500) return null; if(t<1000) return {off:[Math.sin(t/12)*2,0],pose:"hurt"}; const k=(t-1000)/500; return {arc:-50*Math.sin(Math.min(1,k*1.5)*Math.PI)*(k<0.67?1:0),rot:0.3*Math.sin(k*Math.PI),pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); for(const [b,big] of [[300,0.6],[650,0.8],[1000,1.3]]){ const k=(t-b)/450; if(k<0||k>1) continue;
        for(let i=0;i<2;i++){ const px=s.x+d*(Math.abs(tg.x-s.x)+R)*k*(i?0.6:1); SG.ring(c,px,tg.foot,R*big*(0.4+k),R*big*0.2*(0.4+k),[90,60,40],3*big,0.8*(1-k)); }
        SG.cracks(c,s.x+d*s.r*0.6,s.foot,s.r*1.2*big,6,b,1-k); SG.dust(c,s.x+d*s.r*0.6,s.foot,s.r*big,k,6); }
      if(t>=1000&&t<1500){ const k=(t-1000)/500; for(let i=0;i<10;i++){ const a=-Math.PI*(0.15+0.7*atH(i*3)), sp=R*(0.5+2*eo(k)); SG.shard(c,tg.x+Math.cos(a)*sp,tg.foot+Math.sin(a)*sp+k*k*R*2.4,R*0.1,t/80+i,i%2?"#6a5240":"#8a6e54"); } }
      atImpact(t,300,0.3,0); atImpact(t,650,0.4,0); atImpact(t,1000,0.75,0.12); }},
  /* Gug's Split Maw: its head splits open from crown to chin and two huge jaws bite the target from both sides */
  sg_splitmaw:{C:720,D:1500,contact:true,marks:true,
    atk:t=>({f:t<500?0.62*eio(t/500):t<1150?0.62:0.62*(1-eio((t-1150)/350)),pose:t<500?"walk":t<1150?"bitewide":"idle",sy:t>=500&&t<720?1.06:1}),
    def:t=>t>=720&&t<1200?{sx:0.82,off:[Math.sin(t/14)*2,0],pose:"hurt"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r, col=(x.body||[120,80,90]).map(v=>v*0.5+30); if(t<420||t>1250) return; const open=t<720?eo((t-420)/300):t<900?0.05:0.05+eo((t-900)/250), a=t<1100?1:1-(t-1100)/150, w=R*1.3*(0.2+open);
      c.save(); c.globalAlpha*=a; c.fillStyle="rgba(120,20,40,.85)"; c.beginPath(); c.ellipse(tg.x,tg.y-R*0.3,w*0.6,R*1.4,0,0,7); c.fill();
      HR.jaw(c,tg.x-w*0.55,tg.y-R*0.3,R*2.8,R*0.9,open*0.6,-1,col); HR.jaw(c,tg.x+w*0.55,tg.y-R*0.3,R*2.8,R*0.9,open*0.6,1,col); c.restore();
      if(t>=720&&t<1000){ const k=(t-720)/280; chompMarks(c,{x:tg.x,y:tg.y-R*0.3},k); } atImpact(t,720,0.7,0.12); }},
  /* Shoggoth's Many Eyes: eyes open all through the air round the target, all staring, and the stare lands as dread */
  sg_manyeyes:{C:820,D:1600,
    atk:t=>({pose:t<1300?"cast":"idle",sx:1+0.04*Math.sin(t/80),sy:1-0.04*Math.sin(t/80)}),
    def:t=>t>=820&&t<1450?{off:[Math.sin(t/16)*1.5,0],pose:"hurt",sy:0.96}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t<200||t>1550) return; const fade=t<1350?1:1-(t-1350)/200;
      c.save(); c.globalAlpha*=fade; SG.fog(c,tg.x,tg.y-R*0.3,R*2.4,[30,10,40],0.5*Math.min(1,(t-200)/400));
      for(let i=0;i<11;i++){ const an=atH(i*13)*Math.PI*2, rr=R*(1.2+0.9*atH(i*7)), px=tg.x+Math.cos(an)*rr, py=tg.y-R*0.3+Math.sin(an)*rr*0.7, o=Math.max(0,Math.min(1,(t-250-i*45)/160)), blink=Math.abs(Math.sin(t/260+i))>0.97?0.1:1;
        HR.eye(c,px,py,R*(0.16+0.1*atH(i*3)),o*blink,Math.max(-1,Math.min(1,(tg.x-px)/R))); }
      if(t>820&&t<1350){ const k=(t-820)/530; SG.ring(c,tg.x,tg.y-R*0.3,R*(0.5+k),R*(0.4+0.8*k),[160,60,200],4,0.8*(1-k)); } c.restore(); atImpact(t,820,0.35,0.1); }}
});
/* Gid's notes on the horror preview (17 Nov 2026): Tidal Grasp is a clawed hand of water that closes round the target, Fisher's Song brings a real
   tsunami, Kid Stampede has more and better kids, Black Grove has thorny trees and spikes, Shoggoth devours the target and spits it out, Hastur's
   curtains are its own colour and its cloak rags are torn cloth, and Yog and Cthulhu get more detail all round. These replace the first versions. */
HR.floor=(K,t,tg)=>{ let a=0; try{ const d=K.def&&K.def(t,{foeH:60,perp:[0,-1]}); if(d) a=(d.arc||0)+((d.off&&d.off[1])||0); }catch(err){} return tg.foot-a; };
const HRC=(col,k)=>col.map(v=>Math.max(0,Math.min(255,Math.round(v*k))));
const HRL=(col,a)=>col.map(v=>Math.round(v+(255-v)*a));
// a tapered limb along a list of points: outline, body and a light streak, each pass over the whole limb so joints don't show
HR.limb=(c,pts,w0,w1,col,edge,hi)=>{ c.lineCap="round"; c.lineJoin="round"; for(let pass=0;pass<3;pass++) for(let i=0;i<pts.length-1;i++){ const u=i/Math.max(1,pts.length-2), w=w0+(w1-w0)*u;
  c.strokeStyle=pass===0?edge:pass===1?col:hi; c.lineWidth=pass===0?w+3:pass===1?w:Math.max(1,w*0.2); const o=pass===2?-w*0.2:0; c.beginPath(); c.moveTo(pts[i][0]+o,pts[i][1]+o*0.6); c.lineTo(pts[i+1][0]+o,pts[i+1][1]+o*0.6); c.stroke(); } };
HR.smooth=pts=>{ let P=pts; for(let r=0;r<2;r++){ const Q=[P[0]]; for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1]; Q.push([a[0]*0.75+b[0]*0.25,a[1]*0.75+b[1]*0.25],[a[0]*0.25+b[0]*0.75,a[1]*0.25+b[1]*0.75]); } Q.push(P[P.length-1]); P=Q; } return P; };
HR.claw=(c,p,q,L,fill,edge)=>{ const dx=q[0]-p[0], dy=q[1]-p[1], n=Math.hypot(dx,dy)||1, ux=dx/n, uy=dy/n, px=-uy, py=ux;
  c.fillStyle=fill; c.strokeStyle=edge; c.lineWidth=1.5; c.beginPath(); c.moveTo(q[0]+px*L*0.3,q[1]+py*L*0.3); c.quadraticCurveTo(q[0]+ux*L*0.7+px*L*0.35,q[1]+uy*L*0.7+py*L*0.35,q[0]+ux*L+px*L*0.12,q[1]+uy*L+py*L*0.12);
  c.quadraticCurveTo(q[0]+ux*L*0.45,q[1]+uy*L*0.45,q[0]-px*L*0.3,q[1]-py*L*0.3); c.closePath(); c.fill(); c.stroke(); };
HR.drop=(c,x,y,r,col,a)=>{ if(a<=0) return; c.fillStyle=atRgba(col,a); c.beginPath(); c.moveTo(x,y-r*1.8); c.quadraticCurveTo(x+r,y-r*0.2,x,y+r); c.quadraticCurveTo(x-r,y-r*0.2,x,y-r*1.8); c.fill(); };
HR.splash=(c,x,y,R,k,n,col)=>{ if(k<0||k>1) return; for(let i=0;i<n;i++){ const a=-Math.PI*(0.06+0.88*atH(i*7+3)), v=R*(0.8+2.4*atH(i*5+1)); HR.drop(c,x+Math.cos(a)*v*eo(k),y+Math.sin(a)*v*eo(k)+k*k*R*2.6,R*(0.07+0.05*atH(i)),i%3?col:[240,250,255],0.95*(1-k)); }
  SG.ring(c,x,y,R*(0.6+2*k),R*(0.15+0.45*k),[230,248,255],3,0.8*(1-k)); };
// a sphere with a light side, a dark rim and a shine; Yog's globes from Byte have an eye in them
HR.globe=(c,x,y,r,col,eye,look=0,a=1)=>{ if(r<=0.5||a<=0) return; c.save(); c.globalAlpha*=a; const g=c.createRadialGradient(x-r*0.35,y-r*0.4,r*0.1,x,y,r); g.addColorStop(0,atRgba(HRL(col,0.75),1)); g.addColorStop(0.55,atRgba(col,1)); g.addColorStop(1,atRgba(HRC(col,0.45),1));
  c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.strokeStyle=atRgba(HRC(col,0.35),0.8); c.lineWidth=1.2; c.stroke();
  if(eye){ c.fillStyle="#fffdf6"; c.beginPath(); c.ellipse(x+look*r*0.15,y,r*0.55,r*0.42,0,0,7); c.fill(); c.fillStyle=atRgba(HRC(col,0.7),1); c.beginPath(); c.arc(x+look*r*0.3,y,r*0.28,0,7); c.fill(); c.fillStyle="#140a1c"; c.beginPath(); c.arc(x+look*r*0.3,y,r*0.13,0,7); c.fill(); }
  c.fillStyle="rgba(255,255,255,.75)"; c.beginPath(); c.ellipse(x-r*0.38,y-r*0.45,r*0.22,r*0.13,-0.6,0,7); c.fill(); c.restore(); };

/* ---- Dagon's Tidal Grasp: a pool opens under the target, a clawed hand of seawater rises out of it behind the target with its fingers spread,
   closes round it from the top, lifts and squeezes it, then bursts back into water and drops it. The palm and arm are drawn behind the target
   and the fingers in front once they start to close. */
const TG={ lift:t=>t<560?0:t<940?-62*eio((t-560)/380):t<1200?-62:t<1380?-62*(1-ei((t-1200)/180)):0,
  curl:t=>t<560?0:t<940?eio((t-560)/380):t<1200?1+0.05*Math.sin((t-940)/28):1-0.5*Math.min(1,(t-1200)/200),
  rise:t=>t<240?0:t<560?eo((t-240)/320):1, melt:t=>t<1200?0:Math.min(1,(t-1200)/260),
  WATER:{fill:"rgba(86,172,238,.92)",edge:"rgba(22,86,166,.95)",hi:"rgba(232,250,255,.85)"},
  geo(t,x){ const tg=x.target, R=tg.r*1.6, lift=TG.lift(t), ground=tg.foot-lift, drop=(1-TG.rise(t))*R*3.8+TG.melt(t)*R*1.6, cx=tg.x, py=tg.foot-tg.r*0.85+drop, curl=TG.curl(t), sd=x.self&&x.self.x<tg.x?-1:1;
    const fingers=[[-0.62,-0.34,1.15],[-0.21,-0.11,1.3],[0.21,0.11,1.25],[0.62,0.3,1.05]].map(([bx,sp,L],i)=>{ let X=cx+bx*R, Y=py-R*0.7; const pts=[[X,Y]], seg=[0.4,0.35,0.25], bend=[1.45,1.2,0.45]; let th=0;
      for(let j=0;j<3;j++){ th+=curl*bend[j]; const len=L*R*seg[j]*(1+0.1*(1-curl)); X+=Math.sin(sp)*len*(1-curl*0.75)-bx*R*0.22*curl*(j?0.5:0.15)+Math.sin(t/130+i+j)*R*0.02*(1-curl); Y+=-Math.cos(th)*len; pts.push([X,Y]); } return pts; });
    const ta=-0.85-curl*2.45, tb=ta-0.55*curl, t0=[cx+sd*R*0.86,py-R*0.05], t1=[t0[0]+sd*Math.cos(ta)*R*0.5,t0[1]+Math.sin(ta)*R*0.5], t2=[t1[0]+sd*Math.cos(tb)*R*0.42,t1[1]+Math.sin(tb)*R*0.42];
    return {R,TR:tg.r,ground,cx,py,curl,fingers,thumb:[t0,t1,t2],a:1-TG.melt(t)}; },
  hand(c,g,t,front){ const {R,cx,py,fingers,thumb}=g, W=TG.WATER;
    for(let i=0;i<3;i++){ const A=fingers[i], B=fingers[i+1]; c.fillStyle="rgba(110,195,245,.5)"; c.beginPath(); c.moveTo(A[0][0],A[0][1]); c.lineTo(A[1][0],A[1][1]); c.quadraticCurveTo((A[1][0]+B[1][0])/2,(A[1][1]+B[1][1])/2+R*0.12,B[1][0],B[1][1]); c.lineTo(B[0][0],B[0][1]); c.closePath(); c.fill(); }
    for(const f of [...fingers,thumb]){ HR.limb(c,HR.smooth(f),R*0.34,R*0.2,W.fill,W.edge,W.hi);
      c.strokeStyle="rgba(235,252,255,.45)"; c.lineWidth=1.2; c.beginPath(); f.forEach((p,j)=>{ const o=Math.sin(t/60+j*2)*R*0.05; j?c.lineTo(p[0]+o,p[1]+R*0.06):c.moveTo(p[0]+o,p[1]+R*0.06); }); c.stroke(); for(let j=1;j<f.length-1;j++){ c.strokeStyle="rgba(230,250,255,.5)"; c.lineWidth=1.2; c.beginPath(); c.arc(f[j][0],f[j][1],R*0.09,0.6,2.4); c.stroke(); }
      HR.claw(c,f[f.length-2],f[f.length-1],R*0.28,"#f2fcff","rgba(30,100,170,.95)"); }
    if(front) for(let i=0;i<5;i++){ const f=i<4?fingers[i]:thumb, tip=f[f.length-1], q=((t/380)+i*0.37)%1; HR.drop(c,tip[0],tip[1]+q*R*1.2,R*0.06,[150,215,250],0.85*(1-q)); } },
  arm(c,g,t){ const {R,ground,cx,py}=g, top=py+R*0.35; c.save(); const gr=c.createLinearGradient(0,py-R,0,ground); gr.addColorStop(0,"rgba(150,220,252,.94)"); gr.addColorStop(0.5,"rgba(64,150,226,.92)"); gr.addColorStop(1,"rgba(24,86,170,.95)"); c.fillStyle=gr;
    c.beginPath(); c.moveTo(cx-R*0.6,top); for(let i=0;i<=10;i++){ const y=top+(ground-top)*i/10; c.lineTo(cx-R*(0.6+0.22*i/10)+Math.sin(i*1.3+t/90)*R*0.05,y); } c.lineTo(cx+R*0.82,ground); for(let i=10;i>=0;i--){ const y=top+(ground-top)*i/10; c.lineTo(cx+R*(0.6+0.22*i/10)+Math.sin(i*1.1-t/80)*R*0.05,y); } c.closePath(); c.fill();
    c.beginPath(); c.ellipse(cx,py,R*1.0,R*0.84,0,0,7); c.fill(); c.strokeStyle="rgba(225,247,255,.9)"; c.lineWidth=2; c.stroke();
    c.strokeStyle="rgba(230,250,255,.55)"; c.lineWidth=2; for(let i=0;i<3;i++){ c.beginPath(); c.arc(cx-R*0.15+i*R*0.12,py+R*0.05,R*(0.35+i*0.15),3.6,4.6); c.stroke(); }   // palm lines
    for(let i=0;i<7;i++){ const q=((t/700)+i/7)%1; c.strokeStyle=`rgba(235,250,255,${0.7*(1-q)})`; c.lineWidth=1.3; c.beginPath(); c.arc(cx+Math.sin(i*2.1)*R*0.45,ground-(ground-py+R*0.5)*q,R*(0.04+0.03*(i%3)),0,7); c.stroke(); }   // bubbles rising inside
    c.restore(); },
  pool(c,x,t){ const tg=x.target, R=tg.r, ground=tg.foot-TG.lift(t), grow=Math.min(1,Math.max(0,(t-150)/250)), a=t<1400?1:Math.max(0,1-(t-1400)/250); if(grow<=0||a<=0) return;
    c.save(); c.globalAlpha*=a; const g=c.createRadialGradient(tg.x,ground,R*0.2,tg.x,ground,R*2*grow); g.addColorStop(0,"rgba(20,70,150,.85)"); g.addColorStop(0.7,"rgba(50,130,210,.7)"); g.addColorStop(1,"rgba(120,200,245,0)"); c.fillStyle=g; c.beginPath(); c.ellipse(tg.x,ground,R*2*grow,R*0.42*grow,0,0,7); c.fill();
    for(let i=0;i<3;i++){ const q=((t/600)+i/3)%1; SG.ring(c,tg.x,ground,R*(0.6+1.4*q)*grow,R*(0.13+0.28*q)*grow,[220,245,255],2,0.7*(1-q)); } c.restore(); } };
const sgTidalGrasp={C:940,D:1750,sig:true,
  atk:t=>({pose:t<300?"cast":t<1200?"push":"idle",sy:t<300?1-0.08*eo(t/300):1,arc:t>=560&&t<1200?-8*Math.sin((t-560)/640*Math.PI):0}),
  def(t){ if(t<560||t>1550) return null; const lift=TG.lift(t); if(t<940) return {arc:lift,sx:1-0.1*eio((t-560)/380),pose:"hurt"}; if(t<1200) return {arc:lift,sx:0.86+0.03*Math.sin(t/25),sy:1.04,pose:"hurt"};
    return {arc:lift,sy:t>1380&&t<1450?0.8:1,pose:"hurt"}; },
  back(c,t,x){ if(t<150||t>1650) return; TG.pool(c,x,t); if(t<260) return; const g=TG.geo(t,x); c.save(); c.globalAlpha*=g.a; c.beginPath(); c.rect(g.cx-g.R*8,g.ground-g.R*12,g.R*16,g.R*12+1); c.clip();
    TG.arm(c,g,t); if(g.curl<0.35) TG.hand(c,g,t,false); c.restore(); },
  fx(c,t,x){ const tg=x.target, R=tg.r; if(t<260||t>1700) return; const g=TG.geo(t,x);
    if(g.curl>=0.35&&g.a>0){ c.save(); c.globalAlpha*=g.a; c.beginPath(); c.rect(g.cx-R*8,g.ground-R*12,R*16,R*12+1); c.clip(); TG.hand(c,g,t,true); c.restore(); }
    else if(t<560) for(let i=0;i<4;i++){ const tip=g.fingers[i][3], q=((t/300)+i*0.4)%1; HR.drop(c,tip[0],tip[1]+q*R,R*0.06,[150,215,250],0.8*(1-q)); }
    if(t>=940&&t<1200){ const k=(t-940)/260; for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, v=R*(0.9+1.3*eo(k)); HR.drop(c,tg.x+Math.cos(a)*v,tg.y-R*0.1+Math.sin(a)*v*0.8+k*k*R,R*0.07,[160,220,252],0.9*(1-k)); } }
    HR.splash(c,tg.x,g.ground,R,(t-1200)/400,14,[120,200,245]); HR.splash(c,tg.x,g.ground,R*0.8,(t-1380)/350,10,[150,215,250]);
    atImpact(t,940,0.5,0.1); atImpact(t,1380,0.4,0); }};

/* ---- Dagon's Fisher's Song: it sings, the notes drift out over the arena, water spreads across the floor, and a great curling wave full of fish
   rises between them, rolls forward, pitches over and crashes down on the target, leaving whitewater and foam as it drains away. */
function hrWave(c,o){ const {back,front:f,ground:g,H,dir,t,R}=o, p=Math.max(0,Math.min(1,o.pitch)); if(H<2) return;
  // a plunging wave: a rounded top that rolls forward over a hollow, and a lip that curls down in front of it
  const X=v=>f+dir*R*v, Y=v=>g-H*v;
  const T=[X(-0.4+0.3*p),Y(1)], L=[X(0.75+2.0*p),Y(0.88-0.6*p*p)], k1=[X(0.35+1.3*p),Y(1.05)], k2=[L[0]+dir*R*(0.45+0.25*p),L[1]-H*(0.12+0.3*p)],
    E=[X(0.25+1.25*p),g], f1=[L[0]-dir*R*(0.05+0.25*p),L[1]+H*0.12], f2=[E[0]+dir*R*0.05,g-H*(0.35-0.1*p)];
  const slope=j=>{ const q=j/16; return [back+(T[0]-back)*q,g-H*(0.1+0.9*Math.pow(q,1.7))+Math.sin(q*11+t/90)*R*0.05*q]; };
  const top=()=>c.bezierCurveTo(k1[0],k1[1],k2[0],k2[1],L[0],L[1]);
  const path=()=>{ c.beginPath(); c.moveTo(back,g); for(let j=0;j<=16;j++){ const q=slope(j); c.lineTo(q[0],q[1]); } top(); c.bezierCurveTo(f1[0],f1[1],f2[0],f2[1],E[0],E[1]); c.closePath(); };
  c.save(); path(); const gr=c.createLinearGradient(0,g-H,0,g); gr.addColorStop(0,"#9be6f4"); gr.addColorStop(0.25,"#46a8de"); gr.addColorStop(0.65,"#1d64b4"); gr.addColorStop(1,"#0f3a7c"); c.fillStyle=gr; c.fill(); c.clip();
  const lg=c.createLinearGradient(T[0],0,L[0]+dir*R*0.3,0); lg.addColorStop(0,"rgba(120,235,230,0)"); lg.addColorStop(1,"rgba(150,245,235,.6)"); c.fillStyle=lg; c.fillRect(Math.min(back,L[0])-R,g-H*1.1,Math.abs(L[0]-back)+R*2,H*0.5);   // light through the lip
  const fg=c.createLinearGradient(L[0]-dir*R*1.2,0,L[0]+dir*R*0.4,0); fg.addColorStop(0,"rgba(10,40,100,0)"); fg.addColorStop(1,"rgba(10,40,100,.35)"); c.fillStyle=fg; c.fillRect(Math.min(L[0],E[0])-R*2,g-H*1.1,R*4,H*1.1);   // the face under the curl is deeper and darker
  c.strokeStyle="rgba(210,245,255,.35)"; c.lineWidth=2; for(let i=0;i<9;i++){ const xx=back+(f-back)*(0.25+i*0.08), sh=Math.sin(i*2.3+t/120)*R*0.1; c.beginPath(); c.moveTo(xx,g-H*0.15); c.quadraticCurveTo(xx+sh,g-H*0.45,xx-dir*R*0.15,g-H*(0.7+0.05*(i%3))); c.stroke(); }
  for(let i=0;i<5;i++){ const fx=back+(f-back)*(0.3+0.13*i)+Math.sin(t/200+i)*R*0.2, fy=g-H*(0.25+0.11*((i*3)%5))+Math.sin(t/150+i*2)*R*0.08, z=R*(0.16+0.05*(i%2)); c.save(); c.translate(fx,fy); c.scale(dir,1); c.rotate(-0.25+0.1*Math.sin(t/90+i));
    c.fillStyle="rgba(12,40,90,.55)"; c.beginPath(); c.ellipse(0,0,z,z*0.42,0,0,7); c.fill(); c.beginPath(); c.moveTo(-z*0.8,0); c.lineTo(-z*1.45,-z*0.4); c.lineTo(-z*1.45,z*0.4); c.closePath(); c.fill(); c.fillStyle="rgba(200,240,255,.6)"; c.beginPath(); c.arc(z*0.5,-z*0.1,z*0.09,0,7); c.fill(); c.restore(); }   // fish carried in the wave
  for(let i=0;i<10;i++){ const q=((t/900)+i/10)%1; c.strokeStyle=`rgba(230,250,255,${0.6*(1-q)})`; c.lineWidth=1.2; c.beginPath(); c.arc(back+(f-back)*(0.2+0.7*atH(i*3)),g-H*0.9*q,R*(0.03+0.03*(i%3)),0,7); c.stroke(); }
  c.restore();
  c.save(); c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=R*0.15; c.lineCap="round"; c.lineJoin="round"; c.beginPath(); { const q=slope(10); c.moveTo(q[0],q[1]); } for(let j=11;j<=16;j++){ const q=slope(j); c.lineTo(q[0],q[1]); } top(); c.stroke();
  const bz=u=>{ const v=1-u; return [v*v*v*T[0]+3*v*v*u*k1[0]+3*v*u*u*k2[0]+u*u*u*L[0],v*v*v*T[1]+3*v*v*u*k1[1]+3*v*u*u*k2[1]+u*u*u*L[1]]; };
  c.fillStyle="#ffffff"; for(let i=0;i<16;i++){ const P=bz(i/15); c.beginPath(); c.arc(P[0]+Math.sin(t/70+i)*R*0.03,P[1]-R*0.02,R*(0.08+0.05*atH(i)),0,7); c.fill(); }   // foam along the crest
  c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=R*0.08; c.beginPath(); c.moveTo(L[0],L[1]); c.bezierCurveTo(f1[0],f1[1],f2[0],f2[1],E[0],E[1]); c.stroke();   // white water running down the front
  for(let i=0;i<18;i++){ const q=((t/500)+i*0.13)%1, P=bz(atH(i)*0.6), sx=P[0]-dir*q*R*1.5, sy=P[1]-R*0.15-q*R*0.8+q*q*R*1.3; c.fillStyle=`rgba(240,252,255,${0.85*(1-q)})`; c.beginPath(); c.arc(sx,sy,R*(0.04+0.04*atH(i*2))*(1-q*0.4),0,7); c.fill(); }   // spray blown back off the crest
  for(let i=0;i<22;i++){ const u=atH(i*5+2), xx=back+(E[0]+dir*R*0.4-back)*u, z=R*(0.08+0.12*atH(i*3)); c.fillStyle=`rgba(250,255,255,${0.55+0.4*atH(i*9)})`; c.beginPath(); c.ellipse(xx+Math.sin(t/110+i)*R*0.05,g-z*0.5,z*1.6,z*0.7,0,0,7); c.fill(); }
  c.restore(); }
const sgFishersSong={C:1000,D:1900,tail:900,sig:true,
  atk:t=>({pose:atPose(t<1300?"cast":"idle",{open:t<850?0.6+0.25*Math.sin(t/60):0,eyes:t<850?"shut":undefined}),arc:t<850?-5*Math.sin(t/200):0}),
  def:t=>{ if(t<1000||t>1700) return null; const k=(t-1000)/700; return {off:[30*Math.sin(Math.min(1,k*1.6)*Math.PI/2)*(1-k),0],arc:-34*Math.sin(Math.min(1,k*1.5)*Math.PI),rot:0.9*Math.sin(Math.min(1,k*1.5)*Math.PI),pose:"hurt"}; },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), ground=Math.max(s.foot,HR.floor(sgFishersSong,t,tg));
    if(t<900) for(let i=0;i<7;i++){ const q=((t/800)+i/7)%1, px=s.x+d*R*(0.4+q*2.6), py=s.y-s.r*1.1-q*R*1.4+Math.sin(q*9+i)*8, a=Math.min(1,(1-q)*2)*(t<700?1:(900-t)/200); c.fillStyle=`rgba(210,240,255,${a})`; c.strokeStyle=`rgba(40,90,150,${a*0.6})`; c.lineWidth=1;
      c.beginPath(); c.ellipse(px,py,5.5,4,-0.4,0,7); c.fill(); c.stroke(); c.fillRect(px+4,py-15,2,15); if(i%2){ c.beginPath(); c.moveTo(px+6,py-15); c.quadraticCurveTo(px+12,py-11,px+10,py-5); c.lineWidth=2; c.strokeStyle=`rgba(210,240,255,${a})`; c.stroke(); } }
    const sheet=t<350?0:t<1500?Math.min(1,(t-350)/300):Math.max(0,1-(t-1500)/350); if(sheet>0){ const L=Math.min(s.x,tg.x)-R*1.6, Rr=Math.max(s.x,tg.x)+R*1.6; c.save(); c.globalAlpha*=sheet*0.7; const g=c.createLinearGradient(0,ground-R*0.3,0,ground+R*0.3); g.addColorStop(0,"#7fd0f2"); g.addColorStop(1,"#2a6ab0");
      c.fillStyle=g; c.beginPath(); c.ellipse((L+Rr)/2,ground+2,(Rr-L)/2,R*0.32,0,0,7); c.fill(); c.strokeStyle="rgba(240,252,255,.7)"; c.lineWidth=1.5; for(let i=0;i<5;i++){ const xx=L+(Rr-L)*(0.1+0.2*i)+Math.sin(t/200+i)*R*0.3; c.beginPath(); c.moveTo(xx-R*0.3,ground+R*0.05*(i%3)); c.lineTo(xx+R*0.3,ground+R*0.05*(i%3)); c.stroke(); } c.restore(); }
    if(t>=450&&t<1300){ const k=Math.min(1,(t-450)/550), cr=t<1000?0:eio(Math.min(1,(t-1000)/300)), H=R*4.2*eo(Math.min(1,(t-450)/350))*(1-0.85*cr), pitch=t<520?0:eio(Math.min(1,(t-520)/480)),
        front=s.x+d*R*1.3+(tg.x-d*R*1.1-(s.x+d*R*1.3))*eio(k)+d*R*1.6*cr, back=front-d*Math.min(R*3.2,Math.abs(front-(s.x+d*R*0.3)));
      c.save(); c.globalAlpha*=t<1180?1:Math.max(0,1-(t-1180)/120); hrWave(c,{back,front,ground,H,pitch,dir:d,t,R}); c.restore(); if(typeof AT!=="undefined"&&AT) AT.trauma=Math.max(AT.trauma||0,0.12*k); }
    if(t>=960&&t<1700){ const k=(t-960)/740, lx=tg.x+d*R*(0.2+1.4*eo(k));   // whitewater rolls on from where the lip came down
      for(let i=0;i<9;i++){ const u=i/8, px=lx-d*R*2.2*u+Math.sin(t/160+i)*R*0.08, r=R*(0.55+0.45*Math.sin(u*Math.PI))*(0.6+0.6*eo(Math.min(1,k*2))), a=(1-k)*(0.9-0.3*u)*Math.min(1,(t-960)/80);
        SG.puff(c,px,ground-r*0.55,r,a,i%3?[244,251,255]:[180,226,250]); }
      HR.splash(c,tg.x+d*R*0.4,ground,R*1.4,Math.min(1,k*1.25),22,[110,195,245]); }
    if(t>=1250&&t<1900){ const k=(t-1250)/650; c.strokeStyle=`rgba(255,255,255,${0.75*(1-k)})`; c.lineWidth=2; for(let i=0;i<4;i++){ c.beginPath(); c.ellipse(tg.x+d*R*(0.8+i*0.5)*eo(k),ground+2,R*(1.2+i*0.5),R*(0.12+i*0.05),0,Math.PI*0.05,Math.PI*0.95); c.stroke(); }
      for(let i=0;i<6;i++){ const q=(k*1.4+i/6)%1; HR.drop(c,tg.x+(i-2.5)*R*0.28,tg.y-R*0.6+q*R*1.1,R*0.05,[150,210,245],0.8*(1-q)*(1-k)); } }
    atImpact(t,1000,0.7,0.12); }};

/* ---- Shub-Niggurath's Kid Stampede: nine of her little black kids burst out of the woods behind her in two rows and gallop through the target.
   Each kid has a woolly coat, curled horn nubs, floppy ears, a pale muzzle, a goat's yellow eye and hooves; some have a little feeler on their back. */
HR.kid=(c,x,y,z,ph,col,feeler)=>{ c.save(); c.translate(x,y); const bob=Math.abs(Math.sin(ph))*z*0.16; c.translate(0,-bob); c.rotate(Math.sin(ph)*0.07);
  const dark=atRgba(HRC(col,0.62),1), mid=atRgba(col,1), light=atRgba(HRL(col,0.28),1);
  const leg=(lx,a,near)=>{ const fx=lx+Math.sin(a)*z*0.16, fy=z*0.42+bob*0.6-Math.max(0,Math.cos(a))*z*0.06; c.strokeStyle=near?mid:dark; c.lineWidth=z*0.14; c.lineCap="round"; c.beginPath(); c.moveTo(lx,z*0.12); c.lineTo(fx,fy); c.stroke();
    c.fillStyle="#2a1c16"; c.beginPath(); c.ellipse(fx,fy+z*0.03,z*0.08,z*0.055,0,0,7); c.fill(); };
  leg(-z*0.28,ph+Math.PI,false); leg(z*0.2,ph,false);
  c.strokeStyle=mid; c.lineWidth=z*0.1; c.lineCap="round"; c.beginPath(); c.moveTo(-z*0.42,-z*0.12); c.quadraticCurveTo(-z*0.58,-z*0.28,-z*0.5,-z*0.38-Math.sin(ph*2)*z*0.05); c.stroke();
  if(feeler){ c.strokeStyle=dark; c.lineWidth=z*0.07; c.beginPath(); c.moveTo(-z*0.12,-z*0.3); c.quadraticCurveTo(-z*0.3+Math.sin(ph*1.5)*z*0.12,-z*0.55,-z*0.12+Math.sin(ph)*z*0.1,-z*0.72); c.stroke(); c.fillStyle=dark; c.beginPath(); c.arc(-z*0.12+Math.sin(ph)*z*0.1,-z*0.74,z*0.05,0,7); c.fill(); }
  c.fillStyle=mid; c.beginPath(); c.ellipse(-z*0.04,0,z*0.47,z*0.34,0,0,7); c.fill();
  for(let i=0;i<9;i++){ const an=Math.PI*(1.05+0.9*i/8); c.beginPath(); c.arc(-z*0.04+Math.cos(an)*z*0.44,Math.sin(an)*z*0.31,z*0.12,0,7); c.fill(); }   // woolly bumps along the back
  c.strokeStyle=light; c.lineWidth=z*0.045; c.beginPath(); c.ellipse(-z*0.06,-z*0.02,z*0.32,z*0.2,0,Math.PI*1.15,Math.PI*1.75); c.stroke();
  leg(-z*0.14,ph,true); leg(z*0.32,ph+Math.PI,true);
  const hx=z*0.42, hy=-z*0.3; c.fillStyle=dark; c.beginPath(); c.ellipse(hx-z*0.24,hy+z*0.12,z*0.08,z*0.2,0.5+Math.sin(ph)*0.2,0,7); c.fill();   // floppy ear, hanging behind the head
  c.fillStyle=mid; c.beginPath(); c.arc(hx,hy,z*0.3,0,7); c.fill();
  c.strokeStyle="#efe2c8"; c.lineWidth=z*0.065; c.lineCap="round"; for(const ox of [-0.12,0.06]){ c.beginPath(); c.arc(hx+ox*z,hy-z*0.3,z*0.08,Math.PI*0.95,Math.PI*1.95); c.stroke(); }   // curled horn nubs
  c.fillStyle="#8a7a86"; c.beginPath(); c.ellipse(hx+z*0.24,hy+z*0.1,z*0.15,z*0.12,0.15,0,7); c.fill(); c.fillStyle="#3a2a32"; c.beginPath(); c.arc(hx+z*0.33,hy+z*0.06,z*0.025,0,7); c.fill();
  c.fillStyle="#ffcf3a"; c.beginPath(); c.ellipse(hx+z*0.08,hy-z*0.05,z*0.095,z*0.085,0,0,7); c.fill(); c.fillStyle="#1a0f14"; c.beginPath(); c.ellipse(hx+z*0.09,hy-z*0.05,z*0.06,z*0.022,0,0,7); c.fill();   // a goat's eye
  c.fillStyle="#fff"; c.beginPath(); c.arc(hx+z*0.05,hy-z*0.09,z*0.025,0,7); c.fill();
  c.fillStyle="rgba(255,140,170,.45)"; c.beginPath(); c.ellipse(hx+z*0.14,hy+z*0.1,z*0.06,z*0.035,0,0,7); c.fill();
  c.strokeStyle=mid; c.lineWidth=z*0.05; c.beginPath(); c.moveTo(hx+z*0.22,hy+z*0.2); c.lineTo(hx+z*0.2,hy+z*0.3); c.stroke(); c.restore(); };   // little beard
const KIDS=[...Array(9)].map((_,i)=>({t0:200+i*90,row:i%3===1?0:1,z:i%3===1?0.62:0.78+0.1*atH(i*5),feel:i%3===2,shade:0.75+0.25*atH(i*7)}));
const kidPos=(t,x,k)=>{ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), q=(t-k.t0)/560; if(q<0||q>1) return null; const ground=k.row?tg.foot:tg.foot-R*0.32;
  return {x:s.x-d*R*0.4+d*(Math.abs(tg.x-s.x)+R*3.4)*q, y:ground-R*k.z*0.5, q, d}; };
const kidCol=()=>[46,36,52];   // her kids are black, whatever colour she is
const sgKidStampede={C:560,D:1700,sig:true,
  atk:t=>({pose:t<300?"crouch":t<1100?"push":"idle",sy:t<300?1-0.1*eo(t/300):1,sx:t<300?1+0.08*eo(t/300):1}),
  def(t){ if(t<540||t>1320) return null; const p=((t-540)%90)/90; return {off:[(1-p)*6,0],arc:-8*Math.sin(p*Math.PI),rot:0.12*Math.sin(t/40),pose:"hurt"}; },
  back(c,t,x){ const col=kidCol(x); for(let i=0;i<KIDS.length;i++){ const k=KIDS[i]; if(k.row) continue; const p=kidPos(t,x,k); if(!p) continue; c.save(); c.translate(p.x,p.y); c.scale(p.d,1); HR.kid(c,0,0,x.target.r*k.z,t/38+i,HRC(col,0.8*k.shade),k.feel); c.restore(); } },
  fx(c,t,x){ const tg=x.target, R=tg.r, col=kidCol(x);
    for(let i=0;i<KIDS.length;i++){ const k=KIDS[i], p=kidPos(t,x,k); if(!p) continue; SG.dust(c,p.x-p.d*R*0.5,k.row?tg.foot:tg.foot-R*0.32,R*0.35,(t/180+i*0.3)%1,3); if(!k.row) continue; c.save(); c.translate(p.x,p.y); c.scale(p.d,1); HR.kid(c,0,0,R*k.z,t/38+i,HRC(col,k.shade),k.feel); c.restore(); }
    for(let i=0;i<8;i++) atImpact(t,560+i*90,0.18,0); }};

/* ---- Shub-Niggurath's Black Grove: the ground cracks in a ring round the target and black trees tear up out of it, gnarled and covered in thorns,
   with goat eyes opening in the dark between them. Black thorn spikes burst up under the target and thorny roots bind it. */
HR.thorn=(c,x,y,ang,L,col)=>{ const ux=Math.sin(ang), uy=-Math.cos(ang), px=-uy, py=ux; c.fillStyle=col; c.beginPath(); c.moveTo(x+px*L*0.18,y+py*L*0.18); c.quadraticCurveTo(x+ux*L*0.6+px*L*0.12,y+uy*L*0.6+py*L*0.12,x+ux*L,y+uy*L); c.lineTo(x-px*L*0.18,y-py*L*0.18); c.closePath(); c.fill(); };
HR.tree=(c,x,y,h,g,seed,t,dark)=>{ if(g<=0) return; const H=h*eo(Math.min(1,g*1.25)), col=dark?"#140d18":"#1f1526", rim=dark?"rgba(120,70,160,.35)":"rgba(170,110,210,.6)", lean=(atH(seed)-0.5)*h*0.22+Math.sin(t/500+seed)*h*0.015, bw=h*0.085;
  const tx=x+lean, ty=y-H; c.fillStyle=col; c.beginPath(); c.moveTo(x-bw*2.2,y+bw*0.2); c.quadraticCurveTo(x-bw*0.9,y-bw*0.2,x-bw,y-H*0.2); c.quadraticCurveTo(x-bw*0.6+lean*0.3,y-H*0.6,tx-bw*0.25,ty); c.lineTo(tx+bw*0.25,ty);
  c.quadraticCurveTo(x+bw*0.6+lean*0.3,y-H*0.6,x+bw,y-H*0.2); c.quadraticCurveTo(x+bw*0.9,y-bw*0.2,x+bw*2.2,y+bw*0.2); c.closePath(); c.fill();
  c.strokeStyle=rim; c.lineWidth=1.6; c.beginPath(); c.moveTo(x+bw*0.95,y-H*0.15); c.quadraticCurveTo(x+bw*0.55+lean*0.3,y-H*0.6,tx+bw*0.2,ty+H*0.05); c.stroke();
  c.strokeStyle="rgba(0,0,0,.45)"; c.lineWidth=1; for(let i=0;i<4;i++){ const yy=y-H*(0.15+0.18*i); c.beginPath(); c.moveTo(x+lean*(0.15+0.18*i)*0.5-bw*0.4,yy); c.quadraticCurveTo(x+lean*(0.15+0.18*i)*0.5,yy-H*0.06,x+lean*(0.15+0.18*i)*0.5+bw*0.3,yy-H*0.1); c.stroke(); }   // bark
  for(let i=0;i<5;i++){ const u=0.15+0.15*i, sd=i%2?1:-1; HR.thorn(c,x+lean*u*0.6+sd*bw*(1-u*0.5),y-H*u,sd*(1.2+0.3*atH(seed+i)),h*0.07,col); }
  const bg=Math.max(0,Math.min(1,(g-0.45)/0.55)); if(bg<=0) return;
  const br=(px,py,ang,len,w,dpt)=>{ if(dpt>3) return; const L=len*eo(bg), ex=px+Math.sin(ang)*L, ey=py-Math.cos(ang)*L, bend=(atH(seed+dpt*13+ang)-0.5)*0.8;
    c.strokeStyle=col; c.lineWidth=w; c.lineCap="round"; c.beginPath(); c.moveTo(px,py); c.quadraticCurveTo(px+Math.sin(ang+bend)*L*0.55,py-Math.cos(ang+bend)*L*0.55,ex,ey); c.stroke();
    for(let k=1;k<3;k++){ const u=k/3; HR.thorn(c,px+(ex-px)*u,py+(ey-py)*u,ang+(k%2?1.2:-1.2),w*1.3+h*0.025,col); }
    if(dpt>=2) HR.thorn(c,ex,ey,ang,h*0.09,col);
    br(ex,ey,ang-0.42-atH(seed+dpt*7)*0.35,len*0.66,w*0.6,dpt+1); br(ex,ey,ang+0.38+atH(seed+dpt*11)*0.35,len*0.6,w*0.58,dpt+1); };
  br(tx,ty+H*0.02,-0.15+(atH(seed+3)-0.5)*0.5,h*0.3,bw*0.9,1); br(x+lean*0.5,y-H*0.62,-1.0,h*0.28,bw*0.7,1); br(x+lean*0.5,y-H*0.7,0.95,h*0.26,bw*0.65,1); };
HR.spike=(c,x,y,h,ang,k)=>{ if(k<=0) return; const L=h*eo(Math.min(1,k)), ux=Math.sin(ang), uy=-Math.cos(ang), px=-uy, py=ux, w=h*0.14;
  c.fillStyle="#130c17"; c.beginPath(); c.moveTo(x-px*w,y-py*w); c.quadraticCurveTo(x+ux*L*0.5-px*w*0.6,y+uy*L*0.5-py*w*0.6,x+ux*L,y+uy*L); c.quadraticCurveTo(x+ux*L*0.5+px*w*0.6,y+uy*L*0.5+py*w*0.6,x+px*w,y+py*w); c.closePath(); c.fill();
  c.strokeStyle="rgba(190,120,230,.75)"; c.lineWidth=1.5; c.beginPath(); c.moveTo(x+px*w*0.7,y+py*w*0.7); c.quadraticCurveTo(x+ux*L*0.5+px*w*0.4,y+uy*L*0.5+py*w*0.4,x+ux*L,y+uy*L); c.stroke(); };
const BG_TREES=[[-2.6,0.9],[-1.95,1.2],[-1.3,1.05],[-0.6,1.25],[0.6,1.3],[1.3,1.0],[1.95,1.15],[2.6,0.85]];
const BG_FRONT=[[-1.9,0.75,0.55],[1.85,0.8,0.5]];
const BG_SPIKES=[[-1.05,1.0,0.35],[-0.7,1.35,0.22],[-0.35,0.9,0.12],[0.3,1.1,-0.15],[0.65,1.4,-0.25],[1.0,0.95,-0.38]];
const sgBlackGrove={C:900,D:1800,sig:true,
  atk:t=>({pose:t<1300?"cast":"idle",sy:t<500?1-0.06*eo(t/500):1}),
  def:t=>t>=900&&t<1550?{off:[Math.sin(t/20)*1.5,0],sy:0.94,pose:"hurt"}:null,
  back(c,t,x){ const tg=x.target, R=tg.r; if(t<200||t>1750) return; const a=t<1450?1:1-(t-1450)/300, ground=tg.foot;
    c.save(); c.globalAlpha*=a; SG.fog(c,tg.x,ground-R*0.4,R*3.4,[40,14,50],0.55*Math.min(1,(t-200)/300)); SG.cracks(c,tg.x,ground,R*2.6,9,4,Math.min(1,(t-200)/200));
    BG_TREES.forEach(([ox,hs],i)=>{ const g=Math.max(0,Math.min(1,(t-300-i*45)/420)); HR.tree(c,tg.x+ox*R,ground-R*0.35,R*2.3*hs,g,i*3+1,t,true); if(g>0.6&&i%3!==2){ const e=Math.min(1,(t-650-i*40)/120)*(Math.abs(Math.sin(t/300+i))>0.96?0.1:1); if(e>0){ c.fillStyle=`rgba(255,215,80,${e})`; for(const sd of [-1,1]){ c.beginPath(); c.ellipse(tg.x+ox*R+sd*R*0.09,ground-R*(0.9+0.5*hs),R*0.05,R*0.03*e,0,0,7); c.fill(); } } }
      if(g>0&&g<0.7){ const k=g/0.7; for(let j=0;j<4;j++) SG.shard(c,tg.x+ox*R+(j-1.5)*R*0.2,ground-R*0.35-k*R*0.6*atH(i*4+j)+k*k*R*0.6,R*0.07,t/80+j,"#4a3428"); } });
    c.restore(); },
  fx(c,t,x){ const tg=x.target, R=tg.r; if(t<300||t>1750) return; const a=t<1450?1:1-(t-1450)/300, ground=tg.foot; c.save(); c.globalAlpha*=a;
    BG_FRONT.forEach(([ox,hs,dl],i)=>{ HR.tree(c,tg.x+ox*R,ground+R*0.25,R*2.3*hs,Math.max(0,Math.min(1,(t-300-dl*400)/420)),20+i*5,t,false); });
    BG_SPIKES.forEach(([ox,hs,ang],i)=>{ const k=(t-880-i*25)/90; HR.spike(c,tg.x+ox*R,ground+R*0.1,R*hs,ang,k); });
    if(t>=880&&t<1250){ const k=(t-880)/370; SG.dust(c,tg.x,ground,R*1.2,k,10); for(let j=0;j<8;j++) SG.shard(c,tg.x+(j-3.5)*R*0.3,ground-k*R*1.2*atH(j*5)+k*k*R*1.3,R*0.08,t/70+j,"#3a2a22"); }
    if(t>=950){ const k=Math.min(1,(t-950)/300); for(let i=0;i<3;i++){ const yy=tg.y-R*(0.5-i*0.38), rx=R*(1.15-0.25*k), ry=R*0.2; c.strokeStyle="#1a1120"; c.lineWidth=R*0.12; c.beginPath(); c.ellipse(tg.x,yy,rx,ry,0.12*(i-1),0,Math.PI*k); c.stroke();
      c.strokeStyle="rgba(170,110,210,.6)"; c.lineWidth=1.4; c.beginPath(); c.ellipse(tg.x,yy-R*0.04,rx,ry,0.12*(i-1),0.2,Math.PI*k*0.9); c.stroke();
      for(let j=0;j<5;j++){ const an=(j+0.5)/5*Math.PI*k, px=tg.x+Math.cos(an)*rx, py=yy+Math.sin(an)*ry; HR.thorn(c,px,py,Math.PI+(j%2?0.6:-0.6),R*0.16,"#1a1120"); } } }
    c.restore(); atImpact(t,900,0.5,0.08); }};

/* ---- Shoggoth's Swallow Whole: it rears up and its front splits into a huge mouth ringed with teeth and eyes, the mouth stretches out round the
   target and snaps shut, the bulge is dragged back into its body where the target tumbles about, dazed, then it heaves and spits the target back out
   covered in goo. */
const SW={ lerp:(a,b,k)=>a+(b-a)*k,
  maw(t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t<760){ const k0=eo(Math.min(1,t/380)), k1=t<380?0:eio(Math.min(1,(t-380)/320)), k2=t<700?0:(t-700)/60;
      const mx=SW.lerp(s.x+d*s.r*0.55,tg.x,k1), my=SW.lerp(s.y-s.r*0.05,tg.y-R*0.15,k1), rx=SW.lerp(s.r*0.62*k0,R*1.3,k1), ry=SW.lerp(s.r*0.72*k0,R*1.45,k1)*(1-0.8*Math.max(0,k2));
      return {mx,my,rx,ry,open:true}; } return null; },
  ring(c,m,col,t,x){ const {mx,my,rx,ry}=m, w=Math.max(4,Math.min(rx,ry)*0.32); c.save(); c.lineWidth=w; c.strokeStyle=atRgba(col,0.97); c.beginPath(); c.ellipse(mx,my,rx,ry,0,0,7); c.stroke();
    c.lineWidth=w*0.25; c.strokeStyle=atRgba(HRL(col,0.35),0.8); c.beginPath(); c.ellipse(mx,my,rx,ry,0,3.5,5.6); c.stroke();
    c.fillStyle="#fff8ec"; for(let i=0;i<18;i++){ const an=i/18*Math.PI*2, ex=mx+Math.cos(an)*rx, ey=my+Math.sin(an)*ry, ix=mx+Math.cos(an)*(rx-w*1.25), iy=my+Math.sin(an)*(ry-w*1.25), px=-Math.sin(an)*w*0.32, py=Math.cos(an)*w*0.32;
      c.beginPath(); c.moveTo(ex+px-(ex-mx)*0.06,ey+py-(ey-my)*0.06); c.lineTo(ix,iy); c.lineTo(ex-px-(ex-mx)*0.06,ey-py-(ey-my)*0.06); c.closePath(); c.fill(); }
    for(let i=0;i<5;i++){ const an=-2.6+i*0.55, ex=mx+Math.cos(an)*(rx+w*0.15), ey=my+Math.sin(an)*(ry+w*0.15); HR.eye(c,ex,ey,w*(0.32+0.1*(i%2)),1,Math.sin(t/250+i)); }
    c.strokeStyle=atRgba(HRL(col,0.2),0.45); c.lineWidth=2; for(let i=0;i<3;i++){ const xx=mx+(i-1)*rx*0.45, sag=Math.sin(t/120+i)*ry*0.08; c.beginPath(); c.moveTo(xx,my-ry+w*0.6); c.quadraticCurveTo(xx+rx*0.05,my+sag,xx,my+ry-w*0.6); c.stroke(); } c.restore(); },
  neck(c,m,s,col,d){ const fx=s.x+d*s.r*0.35; c.fillStyle=atRgba(col,0.96); c.beginPath(); c.moveTo(fx,s.y-s.r*0.6); c.quadraticCurveTo((fx+m.mx)/2,Math.min(s.y-s.r*0.7,m.my-m.ry*0.9),m.mx-d*m.rx*0.5,m.my-m.ry*0.85);
    c.lineTo(m.mx-d*m.rx*0.5,m.my+m.ry*0.85); c.quadraticCurveTo((fx+m.mx)/2,s.foot,fx,s.foot-2); c.closePath(); c.fill(); },
  bulb(t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t<700||t>=1000) return null; const k=t<780?0:eio((t-780)/220), sh=t<780?eo((t-700)/80):1;
    return {bx:SW.lerp(tg.x,s.x+d*s.r*0.2,k),by:SW.lerp(tg.y-R*0.1,s.y,k),br:SW.lerp(R*1.35,s.r*0.75,k)*(0.7+0.3*sh),k}; },
  lump(c,x,y,r,t,a){ c.save(); c.globalAlpha*=a; c.fillStyle="rgba(20,8,26,.55)"; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.strokeStyle="rgba(255,255,255,.85)"; c.lineWidth=Math.max(1.2,r*0.09); c.lineCap="round";
    for(const sd of [-1,1]){ const ex=x+sd*r*0.32, ey=y-r*0.12, e=r*0.13; c.beginPath(); c.moveTo(ex-e,ey-e); c.lineTo(ex+e,ey+e); c.moveTo(ex+e,ey-e); c.lineTo(ex-e,ey+e); c.stroke(); }
    for(let i=0;i<3;i++){ const an=t/160+i*2.1; atStar4(c,x+Math.cos(an)*r*0.8,y-r*0.7+Math.sin(an)*r*0.25,r*0.18,"rgba(255,230,120,.9)"); } c.restore(); } };
const sgSwallowWhole={C:760,D:2300,tail:1500,sig:true,
  atk:t=>{ if(t<380){ const k=eo(t/380); return {f:0,sx:1-0.06*k,sy:1+0.28*k,pose:"bitewide"}; } if(t<760){ const k=ei((t-380)/380); return {f:0.6*k,sx:0.94+0.36*k,sy:1.28-0.2*k,pose:"bitewide"}; }
    if(t<1000){ const k=eio((t-760)/240); return {f:0.6-0.35*k,sx:1.3,sy:1.08+0.12*k,pose:"chomp"}; }
    if(t<1550) return {f:0.25,sx:1.32+0.07*Math.sin(t/70),sy:1.2-0.07*Math.sin(t/70),rot:0.05*Math.sin(t/110),pose:Math.floor(t/180)%2?"chomp":"idle"};
    if(t<1690){ const k=(t-1550)/140; return {f:0.25,sx:1.32+0.12*k,sy:1.2-0.35*k,pose:"chomp"}; }
    if(t<1800) return {f:0.3,sx:1.15,sy:1.18,pose:"bitewide"};
    const k=Math.min(1,(t-1800)/450); return {f:0.3*(1-eio(k)),sx:1.15-0.15*eo(k),sy:1.18-0.18*eo(k),pose:"idle"}; },
  def(t,x){ const gap=(x&&x.gap)||220, dir=(x&&x.dir)||1; if(t<600) return null; if(t<760){ const k=(t-600)/160; return {off:[dir*gap*0.05*k,0],sx:1-0.08*k,pose:"hurt"}; }
    if(t<1690) return {alpha:0,pose:"hurt"};
    if(t<2050){ const k=(t-1690)/360; return {off:[dir*gap*0.5*(1-eo(k)),0],arc:-70*Math.sin(k*Math.PI),rot:-dir*5.5*(1-eo(k)),pose:"hurt"}; }
    if(t<2250){ const k=(t-2050)/200; return {sy:0.78+0.22*eo(k),sx:1.12-0.12*eo(k),pose:"hurt"}; } return null; },
  back(c,t,x){ const m=SW.maw(t,{...x,target:x.target}); if(!m||m.rx<2) return; c.save(); const g=c.createRadialGradient(m.mx,m.my,2,m.mx,m.my,Math.max(m.rx,m.ry)); g.addColorStop(0,"#16040e"); g.addColorStop(0.6,"#4c0c26"); g.addColorStop(1,"#8a2442");
    c.fillStyle=g; c.beginPath(); c.ellipse(m.mx,m.my,m.rx,m.ry,0,0,7); c.fill(); c.fillStyle="rgba(200,70,110,.6)"; c.beginPath(); c.ellipse(m.mx,m.my+m.ry*0.55,m.rx*0.55,m.ry*0.22,0,0,7); c.fill(); c.restore(); },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=x.body||[100,120,90]; if(t>2300) return;
    const m=SW.maw(t,x); if(m&&m.rx>2){ if(t>380) SW.neck(c,m,s,col,d); SW.ring(c,m,col,t,x); }
    const b=SW.bulb(t,x); if(b){ SW.neck(c,{mx:b.bx,my:b.by,rx:b.br,ry:b.br},s,col,d); c.fillStyle=atRgba(col,0.97); c.beginPath(); c.arc(b.bx,b.by,b.br,0,7); c.fill(); c.strokeStyle=atRgba(HRL(col,0.3),0.7); c.lineWidth=2; c.beginPath(); c.arc(b.bx,b.by,b.br*0.85,3.6,5.4); c.stroke();
      SW.lump(c,b.bx,b.by,b.br*0.6,t,0.8); for(let i=0;i<3;i++) HR.eye(c,b.bx+Math.cos(i*2.2+1)*b.br*0.75,b.by+Math.sin(i*2.2+1)*b.br*0.7,b.br*0.16,1,-d); }
    if(t>=1000&&t<1690){ const k=t<1550?0:(t-1550)/140, lx=s.x+Math.sin(t/120)*s.r*0.25+d*s.r*0.5*k, ly=s.y+s.r*0.2+Math.cos(t/150)*s.r*0.12-k*s.r*0.3; SW.lump(c,lx,ly,s.r*0.4,t,0.65);
      c.strokeStyle=atRgba(HRL(col,0.4),0.5); c.lineWidth=1.5; for(let i=0;i<5;i++){ const q=((t/400)+i/5)%1; c.beginPath(); c.arc(s.x+(i-2)*s.r*0.3,s.y-s.r*(0.2+q*0.9),s.r*0.05,0,7); c.stroke(); }
      if(t<1150){ const k2=(t-1000)/150; SG.ring(c,s.x,s.y,s.r*(0.6+0.8*k2),s.r*(0.5+0.6*k2),HRL(col,0.4),3,0.7*(1-k2)); } }
    if(t>=1690&&t<2100){ const k=(t-1690)/410; for(let i=0;i<12;i++){ const a=(atH(i*3)-0.5)*1.4, v=R*(1+2.5*atH(i*7)), px=s.x+d*s.r*0.6+d*Math.cos(a)*v*eo(k), py=s.y-s.r*0.1+Math.sin(a)*v*0.6*eo(k)+k*k*R*1.5;
        c.fillStyle=atRgba(col,0.9*(1-k)); c.beginPath(); c.arc(px,py,R*(0.08+0.07*atH(i)),0,7); c.fill(); } }
    if(t>=1750&&t<2300){ const k=(t-1750)/550; for(let i=0;i<5;i++){ const q=(k*1.6+i/5)%1; HR.drop(c,tg.x+(i-2)*R*0.3,tg.y-R*0.5+q*R*1.1,R*0.07,col,0.85*(1-q)*(1-k)); }
      if(t>2050){ const k2=(t-2050)/250; c.fillStyle=atRgba(col,0.6*(1-k2)); c.beginPath(); c.ellipse(tg.x,tg.foot+2,R*(0.9+0.4*k2),R*0.18,0,0,7); c.fill(); } }
    atImpact(t,760,0.45,0.08); atImpact(t,1690,0.4,0); }};

/* ---- Hastur's Curtain Call: a spotlight finds the target and two heavy stage curtains in Hastur's own colour drop and close over it, with a
   scalloped valance and gold fringe on top; it falls asleep behind them. */
const sgCurtainCall={C:820,D:1700,sig:true,
  atk:t=>({pose:t<1300?"cast":"idle",arc:t<1300?-4*Math.sin(t/200):0}),
  def:t=>t>=820&&t<1500?{pose:atPose("hurt",{eyes:"shut"}),rot:0.1*Math.sin(t/200)}:null,
  fx(c,t,x){ const tg=x.target, R=tg.r, col=x.body||[220,180,60]; if(t<200||t>1650) return; const top=tg.y-R*2.6, floor=tg.foot+4, w=R*1.45, close=t<820?eio(Math.max(0,(t-400)/420)):t<1350?1:1-eio((t-1350)/250), sp=Math.max(0,Math.min(1,(t-200)/200))*(t>1500?1-(t-1500)/150:1), drop=Math.min(1,Math.max(0,(t-250)/220));
    c.save(); c.globalCompositeOperation="lighter"; const g=c.createRadialGradient(tg.x,tg.y-R*0.4,R*0.2,tg.x,tg.y-R*0.4,R*1.8); g.addColorStop(0,`rgba(255,240,170,${0.45*sp})`); g.addColorStop(1,"rgba(255,240,170,0)"); c.fillStyle=g; c.beginPath(); c.moveTo(tg.x-R*0.3,top-R); c.lineTo(tg.x+R*0.3,top-R); c.lineTo(tg.x+R*1.6,floor); c.lineTo(tg.x-R*1.6,floor); c.closePath(); c.fill(); c.restore();
    const ty=top-(1-drop)*R*3; c.save(); c.beginPath(); c.rect(tg.x-w*2,ty-R,w*4,floor-ty+R); c.clip();
    if(close>0) for(const sd of [-1,1]){ const inner=tg.x+sd*w*(1-close), outer=tg.x+sd*w*1.3, N=4, bot=SW.lerp(ty,floor,drop);
      for(let f=0;f<N;f++){ const x0=inner+(outer-inner)*f/N, x1=inner+(outer-inner)*(f+1)/N, gl=c.createLinearGradient(x0,0,x1,0); gl.addColorStop(0,atRgba(HRC(col,0.62),1)); gl.addColorStop(0.3,atRgba(HRC(col,0.92),1)); gl.addColorStop(0.55,atRgba(HRL(col,0.18),1)); gl.addColorStop(0.8,atRgba(HRC(col,0.85),1)); gl.addColorStop(1,atRgba(HRC(col,0.6),1));
        c.fillStyle=gl; c.beginPath(); c.moveTo(x0,ty); c.lineTo(x1,ty); for(let i=0;i<=8;i++){ const y=ty+(bot-ty)*i/8; c.lineTo(x1+Math.sin(i*1.3+t/220+f)*R*0.04,y); } c.quadraticCurveTo((x0+x1)/2,bot+R*0.12,x0,bot+Math.sin(t/200+f)*R*0.03); c.closePath(); c.fill(); }
      c.strokeStyle=atRgba(HRC(col,0.3),0.6); c.lineWidth=1.5; c.beginPath(); c.moveTo(inner,ty); for(let i=0;i<=8;i++) c.lineTo(inner+sd*Math.sin(i*1.4+t/200)*R*0.06,ty+(bot-ty)*i/8); c.stroke();
      c.fillStyle="#e9b23a"; c.beginPath(); c.ellipse(outer-sd*w*0.32,ty+(bot-ty)*0.55,R*0.12,R*0.07,0,0,7); c.fill(); }   // a gold tie-back on each side
    c.restore();
    const vy=ty-R*0.05; c.fillStyle=atRgba(HRC(col,0.7),1); c.fillRect(tg.x-w*1.32,vy-R*0.12,w*2.64,R*0.42); c.beginPath(); for(let i=0;i<=8;i++){ const xx=tg.x-w*1.32+w*2.64*i/8; c.arc(xx-w*0.165,vy+R*0.3,w*0.165,0,Math.PI); } c.fill();
    c.fillStyle="#e9b23a"; c.fillRect(tg.x-w*1.36,vy-R*0.18,w*2.72,R*0.08); c.strokeStyle="#e9b23a"; c.lineWidth=1.3; for(let i=0;i<32;i++){ const xx=tg.x-w*1.3+w*2.6*i/31; c.beginPath(); c.moveTo(xx,vy+R*0.3); c.lineTo(xx+Math.sin(t/150+i)*1.5,vy+R*0.42); c.stroke(); }
    if(t>900&&t<1500) for(let i=0;i<3;i++){ const ph=((t/500)+i/3)%1; c.fillStyle=`rgba(240,235,255,${1-ph})`; c.font=`bold ${Math.round(R*(0.35+ph*0.3))}px sans-serif`; c.fillText("z",tg.x+R*(0.3+ph*0.6),tg.y-R*(1+ph)); }
    atImpact(t,820,0.3,0.05); }};

/* ---- Hastur's Tattered Cloak: long torn strips of its cloak stream out from under it, rippling, with frayed ends and holes, wrap round the target
   in bands, and the yellow sign burns on it. */
HR.rag=(c,pts0,w0,w1,col,t,seed)=>{ const pts=HR.smooth(pts0), n=pts.length; if(n<3) return; const L=[], Rt=[], N=[], W=[];
  for(let i=0;i<n;i++){ const p=pts[i], q=pts[Math.min(n-1,i+1)], o=pts[Math.max(0,i-1)], dx=q[0]-o[0], dy=q[1]-o[1], m=Math.hypot(dx,dy)||1, nx=-dy/m, ny=dx/m, u=i/(n-1), w=(w0+(w1-w0)*u)*(1+0.06*Math.sin(u*9+seed))/2;
    N.push([nx,ny]); W.push(w); L.push([p[0]+nx*w,p[1]+ny*w]); Rt.push([p[0]-nx*w,p[1]-ny*w]); }
  const e=pts[n-1], pr=pts[n-3], dx=e[0]-pr[0], dy=e[1]-pr[1], m=Math.hypot(dx,dy)||1, ux=dx/m, uy=dy/m, tips=[];
  c.fillStyle=atRgba(col,0.98); c.beginPath(); c.moveTo(L[0][0],L[0][1]); for(const p of L) c.lineTo(p[0],p[1]);
  for(let j=0;j<4;j++){ const u=(j+0.5)/4, bx=L[n-1][0]+(Rt[n-1][0]-L[n-1][0])*u, by=L[n-1][1]+(Rt[n-1][1]-L[n-1][1])*u, len=w1*(0.8+1.1*atH(seed+j)), wob=Math.sin(t/90+j+seed)*w1*0.25, tx=bx+ux*len-uy*wob, ty=by+uy*len+ux*wob; tips.push([tx,ty]);
    c.quadraticCurveTo(bx+ux*len*0.4,by+uy*len*0.4,tx,ty); c.quadraticCurveTo(bx+ux*len*0.2,by+uy*len*0.2,L[n-1][0]+(Rt[n-1][0]-L[n-1][0])*(j+1)/4,L[n-1][1]+(Rt[n-1][1]-L[n-1][1])*(j+1)/4); }
  for(let i=n-1;i>=0;i--) c.lineTo(Rt[i][0],Rt[i][1]); c.closePath(); c.fill();
  const along=(off,a0,a1,str,lw)=>{ c.strokeStyle=str; c.lineWidth=lw; c.beginPath(); for(let i=Math.floor(a0*(n-1));i<=Math.floor(a1*(n-1));i++){ const x=pts[i][0]+N[i][0]*W[i]*off, y=pts[i][1]+N[i][1]*W[i]*off; i===Math.floor(a0*(n-1))?c.moveTo(x,y):c.lineTo(x,y); } c.stroke(); };
  c.lineCap="round"; c.lineJoin="round";
  along(-0.55,0,0.97,atRgba(HRC(col,0.55),0.45),Math.max(2,w0*0.28));   // the shaded underside
  along(0.5,0,0.95,atRgba(HRL(col,0.45),0.5),Math.max(1.5,w0*0.18));    // sheen along the top edge
  along(0.05,0.08,0.8,atRgba(HRC(col,0.45),0.45),1);                     // creases running down the cloth
  along(-0.25,0.2,0.65,atRgba(HRC(col,0.45),0.35),1);
  c.strokeStyle=atRgba(HRC(col,0.4),0.95); c.lineWidth=1.2; c.beginPath(); c.moveTo(L[0][0],L[0][1]); for(const p of L) c.lineTo(p[0],p[1]); c.stroke(); c.beginPath(); c.moveTo(Rt[0][0],Rt[0][1]); for(const p of Rt) c.lineTo(p[0],p[1]); c.stroke();
  c.fillStyle=atRgba(HRC(col,0.35),0.9); for(const [u,sd] of [[0.32,1],[0.58,-1],[0.78,1]]){ const i=Math.floor(u*(n-1)), E=sd>0?L[i]:Rt[i], p=pts[i]; c.beginPath(); c.moveTo(E[0]-N[i][1]*W[i]*0.5,E[1]+N[i][0]*W[i]*0.5); c.lineTo(E[0]+(p[0]-E[0])*0.45,E[1]+(p[1]-E[1])*0.45); c.lineTo(E[0]+N[i][1]*W[i]*0.5,E[1]-N[i][0]*W[i]*0.5); c.closePath(); c.fill(); }   // small tears in the edges
  c.fillStyle=atRgba(HRC(col,0.3),0.85); for(const u of [0.42,0.68]){ const i=Math.floor(u*(n-1)), p=pts[i]; c.beginPath(); c.ellipse(p[0]+N[i][0]*W[i]*0.15,p[1]+N[i][1]*W[i]*0.15,W[i]*0.22,W[i]*0.13,Math.atan2(N[i][1],N[i][0]),0,7); c.fill(); }   // moth holes
  c.strokeStyle=atRgba(HRC(col,0.8),0.8); c.lineWidth=0.9; for(const [tx,ty] of tips) for(let k=0;k<2;k++){ const a=Math.sin(t/70+k*2+tx)*0.6; c.beginPath(); c.moveTo(tx,ty); c.quadraticCurveTo(tx+ux*w1*0.5,ty+uy*w1*0.5,tx+ux*w1*(0.9+0.3*k)-uy*w1*a,ty+uy*w1*(0.9+0.3*k)+ux*w1*a); c.stroke(); } };   // loose threads at the torn end
const sgTatteredCloak={C:900,D:1750,sig:true,
  atk:t=>({pose:t<1300?"cast":"idle",sx:1+0.06*Math.sin(Math.min(1,t/600)*Math.PI)}),
  def:t=>t>=900&&t<1500?{off:[Math.sin(t/18)*1.5,0],pose:"hurt",sy:0.96}:null,
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=x.body||[200,170,60]; if(t<200||t>1700) return; const reach=t<900?eio((t-200)/700):t<1350?1:1-eio((t-1350)/300);
    const RG=[[-0.5,0.55,1.5,0.0],[0.4,0.25,-0.6,0.9],[-0.1,0.0,2.3,1.9],[0.55,-0.25,0.4,2.8],[-0.35,-0.5,1.1,3.7]];
    RG.forEach(([ox0,band,arch,ph],i)=>{ const delay=i*60, rr=t<900?eio(Math.max(0,Math.min(1,(t-200-delay)/(700-delay)))):reach, ox=s.x+ox0*s.r*0.9, oy=s.foot-s.r*(0.12+0.06*(i%2)), ex=tg.x-d*R*0.95, ey=tg.y-R*band, N=16, pts=[];
      for(let j=0;j<=N;j++){ const u=j/N*rr, bx=ox+(ex-ox)*u, sw=Math.sin(u*Math.PI); pts.push([bx+Math.sin(u*3.5-t/150+ph)*R*0.1*sw,oy+(ey-oy)*u-sw*R*arch+Math.sin(u*4-t/110+ph)*R*0.2*sw]); }
      if(rr>0.02) HR.rag(c,pts,R*0.4,R*0.22,HRC(col,[0.72,0.86,0.8,0.92,0.76][i]),t,i*1.7+ph); });
    if(reach>0.85){ const k=Math.min(1,(reach-0.85)/0.15); [[0.55,-0.25],[0.15,0.2],[-0.3,-0.15]].forEach(([yy0,tilt],i)=>{ const yy=tg.y-R*yy0, pts=[]; for(let j=0;j<=14;j++){ const an=Math.PI+j/14*Math.PI*k*1.1; pts.push([tg.x+Math.cos(an)*R*1.05*-d,yy+Math.sin(an)*-R*0.24+Math.cos(an)*R*tilt]); }
      HR.rag(c,pts,R*0.34,R*0.22,HRC(col,0.88-i*0.05),t,i*2.3+5); }); }
    if(t>=900&&t<1500){ const k=(t-900)/600, a=k<0.8?1:1-(k-0.8)*5; c.save(); c.translate(tg.x,tg.y-R*0.3); c.globalAlpha*=a; c.strokeStyle="#ffd84a"; c.lineWidth=3.5; c.shadowColor="#ffd84a"; c.shadowBlur=14; c.lineCap="round";
      const z=R*(0.5+0.08*Math.sin(t/60)); c.beginPath(); c.arc(0,0,z,0.3,Math.PI*1.6); c.stroke(); c.beginPath(); c.moveTo(0,-z); c.lineTo(0,z*1.1); c.moveTo(-z*0.8,z*0.3); c.quadraticCurveTo(0,-z*0.1,z*0.9,z*0.6); c.moveTo(-z*0.5,-z*0.4); c.quadraticCurveTo(-z*0.1,-z*0.7,z*0.3,-z*0.35); c.stroke();
      c.shadowBlur=0; for(let i=0;i<8;i++){ const an=i/8*Math.PI*2+t/400; c.strokeStyle=`rgba(255,216,74,${0.5*a})`; c.lineWidth=2; c.beginPath(); c.moveTo(Math.cos(an)*z*1.3,Math.sin(an)*z*1.3); c.lineTo(Math.cos(an)*z*(1.6+0.2*Math.sin(t/80+i)),Math.sin(an)*z*(1.6+0.2*Math.sin(t/80+i))); c.stroke(); } c.restore(); }
    atImpact(t,900,0.4,0.1); }};

/* ---- Yog-Sothoth's Gate Open: a stone gate carved with runes rises behind the target, its double doors swing open on a spiralling sky of stars
   and eyed globes, light floods out over the floor, the target is stretched and pulled through, the doors slam, then open once more to throw it
   back out, and the gate breaks apart into globes that fly back to Yog. */
const YG={ open:t=>t<450?0:t<720?eo((t-450)/270):t<930?1:t<1060?1-eio((t-930)/130):t<1650?0:t<1800?eo((t-1650)/150):t<1920?1:1-eio(Math.min(1,(t-1920)/180)),
  rise:t=>t<150?0:t<450?eo((t-150)/300):t<2050?1:Math.max(0,1-(t-2050)/180),
  thump:t=>{ for(const b of [1250,1450,1580]) if(t>=b&&t<b+140) return Math.sin((t-b)/140*Math.PI)*(b===1580?1.3:1); return 0; },
  geo(x,t){ const tg=x.target, R=tg.r, d=atDir(x); if(t==null||t<600||YG.ax==null) YG.ax=tg.x+d*R*0.55;   // the gate is set where the target stood, so the hit's knockback can't push it
    return {gx:YG.ax,gy:(t==null?tg.foot:HR.floor(sgGateOpen,t,tg))-R*0.1,h:R*3.1,w:R*1.6,R,d}; },
  draw(c,t,x){ const {gx,gy,h,w,R}=YG.geo(x,t), rise=YG.rise(t), op=YG.open(t); if(rise<=0) return; const top=gy-h*rise, fw=R*0.32; c.save(); c.beginPath(); c.rect(gx-w*2,gy-h*1.4,w*4,h*1.4); c.clip();
    c.fillStyle="#0a0614"; c.fillRect(gx-w/2,top,w,gy-top);
    if(op>0){ const v=c.createRadialGradient(gx,top+h*0.5,2,gx,top+h*0.5,h*0.75); v.addColorStop(0,"#fff2c4"); v.addColorStop(0.18,"#c79bff"); v.addColorStop(0.55,"#3a1f78"); v.addColorStop(1,"#0c0620"); c.fillStyle=v; c.fillRect(gx-w/2,top,w,gy-top);
      c.save(); c.beginPath(); c.rect(gx-w/2,top,w,gy-top); c.clip(); c.translate(gx,top+h*0.5); for(let arm=0;arm<3;arm++) for(let i=0;i<22;i++){ const u=i/22, an=arm*2.09+u*4.5+t/500, rr=u*h*0.55; c.fillStyle=`rgba(255,250,235,${0.9*(1-u)})`; c.beginPath(); c.arc(Math.cos(an)*rr,Math.sin(an)*rr*0.8,1+2*(1-u),0,7); c.fill(); }
      const GC=[[255,140,200],[150,240,230],[255,230,140],[190,150,255]]; for(let i=0;i<4;i++){ const an=t/700+i*1.6, rr=h*(0.18+0.08*i); HR.globe(c,Math.cos(an)*rr*0.6,Math.sin(an)*rr,R*(0.14+0.03*i),GC[i],true,Math.cos(an)); } c.restore(); }
    for(const sd of [-1,1]){ const hx=gx+sd*w/2, fx=hx-sd*(w/2)*Math.max(0.05,1-op), sk=op*h*0.07; c.fillStyle="#2a1846"; c.beginPath(); c.moveTo(hx,top); c.lineTo(fx,top-sk); c.lineTo(fx,gy+sk*0.3); c.lineTo(hx,gy); c.closePath(); c.fill();
      c.strokeStyle="rgba(230,190,90,.85)"; c.lineWidth=1.6; for(let i=0;i<3;i++){ const u=0.2+0.3*i; c.beginPath(); c.moveTo(hx+(fx-hx)*0.18,top+(gy-top)*u); c.lineTo(hx+(fx-hx)*0.82,top+(gy-top)*u-sk*(0.5-u)); c.stroke(); }
      c.fillStyle="#e2b94f"; for(let i=0;i<4;i++){ c.beginPath(); c.arc(hx+(fx-hx)*0.85,top+(gy-top)*(0.12+0.25*i),R*0.035,0,7); c.fill(); } }
    for(const sd of [-1,1]){ const px=gx+sd*(w/2+fw/2); const pg=c.createLinearGradient(px-fw/2,0,px+fw/2,0); pg.addColorStop(0,"#4a3c5c"); pg.addColorStop(0.5,"#7a6890"); pg.addColorStop(1,"#3a2e4a"); c.fillStyle=pg; c.fillRect(px-fw/2,top-R*0.15,fw,gy-top+R*0.15);
      for(let i=0;i<6;i++){ const on=Math.max(0,Math.min(1,(t-300-i*60)/120))*(0.7+0.3*Math.sin(t/90+i)); const ry=top+(gy-top)*(0.1+0.15*i); c.strokeStyle=`rgba(255,220,120,${on})`; c.shadowColor="#ffd77a"; c.shadowBlur=on*8; c.lineWidth=1.8; c.beginPath();
        if(i%3===0){ c.arc(px,ry,fw*0.2,0,7); } else if(i%3===1){ c.moveTo(px-fw*0.22,ry-fw*0.2); c.lineTo(px+fw*0.22,ry+fw*0.2); c.moveTo(px+fw*0.22,ry-fw*0.2); c.lineTo(px-fw*0.22,ry+fw*0.2); } else { c.moveTo(px,ry-fw*0.25); c.lineTo(px,ry+fw*0.25); c.moveTo(px-fw*0.2,ry); c.lineTo(px+fw*0.2,ry); } c.stroke(); } c.shadowBlur=0; }
    c.fillStyle="#5a4870"; c.fillRect(gx-w/2-fw*1.2,top-R*0.45,w+fw*2.4,R*0.32); c.fillStyle="#e2b94f"; c.fillRect(gx-w/2-fw*1.2,top-R*0.16,w+fw*2.4,R*0.05);
    HR.globe(c,gx,top-R*0.3,R*0.22,[200,160,255],true,Math.sin(t/300)); c.restore(); } };
const R0=24;   // how far up the pulled target drifts toward the middle of the gate, in arena units
const sgGateOpen={C:1060,D:2400,tail:1300,sig:true,
  atk:t=>({pose:t<1950?"cast":"idle",arc:t<1950?-8*Math.sin(Math.min(1,t/300)*Math.PI/2):0}),
  def(t){ if(t<620||t>2050) return null; if(t<880){ const k=ei((t-620)/260); return {sx:1-0.55*k,sy:1+0.25*k,alpha:1-0.95*k,off:[14*k,-R0*k],rot:0.4*k,pose:"hurt"}; } if(t<1680) return {alpha:0,pose:"hurt"};
    const k=(t-1680)/370; return {alpha:Math.min(1,k*4),sx:0.7+0.3*eo(k),off:[20*(1-eo(k)),0],arc:-40*Math.sin(Math.min(1,k)*Math.PI),rot:-1.2*(1-eo(k)),pose:"hurt"}; },
  back(c,t,x){ if(t<150||t>2250) return; YG.draw(c,t,x); const {gx,gy,w,R}=YG.geo(x,t), op=YG.open(t); if(op>0){ c.save(); c.globalCompositeOperation="lighter"; const g=c.createLinearGradient(gx,gy,gx-x.target.r*3*atDir(x),gy); g.addColorStop(0,`rgba(230,200,255,${0.45*op})`); g.addColorStop(1,"rgba(230,200,255,0)"); c.fillStyle=g;
      c.beginPath(); c.moveTo(gx-w/2,gy); c.lineTo(gx+w/2,gy); c.lineTo(gx+w*1.6,gy+R*0.45); c.lineTo(gx-w*1.6,gy+R*0.45); c.closePath(); c.fill(); c.restore(); } },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, {gx,gy,h,w}=YG.geo(x,t), op=YG.open(t);
    if(t<1800){ for(let i=0;i<5;i++){ const an=t/350+i*1.26, k=Math.min(1,t/300); HR.globe(c,s.x+Math.cos(an)*s.r*1.4,s.y-s.r*0.5+Math.sin(an)*s.r*0.5,s.r*0.18,[[255,140,200],[150,240,230],[255,230,140],[190,150,255],[255,170,140]][i],true,Math.cos(an),k); } }
    if(op>0.3&&t>500&&t<930){ c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<16;i++){ const q=((t/420)+i/16)%1, sx=tg.x+(atH(i*3)-0.5)*R*2.4, sy=tg.y-R*0.3+(atH(i*7)-0.5)*R*2, px=sx+(gx-sx)*q, py=sy+(gy-h*0.5-sy)*q; atGlowA(c,px,py,R*0.08,[220,190,255],0.9*(1-q)); } c.restore(); }
    for(const b of [1250,1450,1580]) if(t>=b&&t<b+260){ const k=(t-b)/260; SG.ring(c,gx,gy-h*0.5,w*(0.55+0.5*k),h*(0.5+0.3*k),[255,220,140],3,0.7*(1-k)); for(let i=0;i<3;i++) atStar4(c,gx+(i-1)*w*0.4,gy-h*(0.3+0.2*i)-k*R*0.5,R*0.13*(1-k),"rgba(255,235,170,.9)"); }   // it bangs about inside and the doors shake
    if(t>=1060&&t<1450){ const k=(t-1060)/390; SG.ring(c,gx,gy-h*0.5,R*(0.6+2.4*k),R*(0.8+2*k),[220,190,255],4,0.8*(1-k)); SG.dust(c,gx,gy,R*1.2,k,8); }
    if(t>=1680&&t<2050){ const k=(t-1680)/370; for(let i=0;i<10;i++){ const a=atH(i*5)*Math.PI*2, v=R*(0.4+1.4*eo(k)); atStar4(c,tg.x+Math.cos(a)*v,tg.y-R*0.3+Math.sin(a)*v,R*0.14*(1-k),"rgba(255,240,200,.95)"); } }
    if(t>=2050&&t<2400){ const k=(t-2050)/350; for(let i=0;i<4;i++){ const sx0=gx+(i-1.5)*w*0.4, sy0=gy-h*(0.3+0.15*i), px=sx0+(s.x-sx0)*eio(k), py=sy0+(s.y-s.r*0.5-sy0)*eio(k)-Math.sin(k*Math.PI)*R; HR.globe(c,px,py,R*0.17,[[255,140,200],[150,240,230],[255,230,140],[190,150,255]][i],true,0,1-k*0.3); } }
    atImpact(t,880,0.3,0.15); atImpact(t,1060,0.55,0.1); atImpact(t,1250,0.15,0); atImpact(t,1450,0.15,0); atImpact(t,1580,0.25,0); atImpact(t,1680,0.35,0.05); }};

/* ---- Yog-Sothoth's Globe Storm: its globes swing out into a wide orbit, each one with an eye that turns to the target, then fly in one after another
   on curving paths, trailing light, and burst on the target in rings and sparks of their own colour. */
const GS_COL=[[255,140,200],[150,220,255],[255,230,140],[190,150,255],[150,240,210],[255,170,140]];
const sgGlobeStorm={C:500,D:1700,sig:true,
  atk:t=>({pose:t<1250?"cast":"idle",off:[t<1250?Math.sin(t/30):0,0],arc:t<1250?-6*Math.sin(Math.min(1,t/250)*Math.PI/2):0}),
  def(t){ if(t<500||t>1300) return null; const p=((t-500)%125)/125; return {off:[(1-p)*7,0],pose:"hurt",flash:p<0.3?2:0,rot:0.08*Math.sin(t/30)}; },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
    if(t<1250){ const a=Math.min(1,t/200)*(t<1100?1:(1250-t)/150); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,s.x,s.y-s.r*0.5,s.r*2.2,[150,110,255],0.35*a); SG.ring(c,s.x,s.y-s.r*0.5,s.r*1.5,s.r*0.55,[220,200,255],1.5,0.6*a); c.restore(); }
    for(let i=0;i<6;i++){ const t0=200+i*125, k=(t-t0)/300, col=GS_COL[i];
      if(t<t0&&t<1250){ const an=t/380+i*1.05, sp=Math.min(1,t/250), ox=s.x+Math.cos(an)*s.r*1.9*sp, oy=s.y-s.r*0.5+Math.sin(an)*s.r*0.7*sp; HR.globe(c,ox,oy,s.r*0.3,col,true,d,1); continue; }
      if(k<0||k>1.5) continue;
      if(k<=1){ const path=q=>{ const e=ei(q); return [s.x+(tg.x-s.x)*e+Math.sin(q*Math.PI)*R*0.6*(i%2?1:-1)*0.5, s.y-s.r*0.6+(tg.y-R*0.3-(s.y-s.r*0.6))*e-Math.sin(q*Math.PI)*R*1.3*(i%2?1:-0.6)]; };
        c.save(); c.globalCompositeOperation="lighter"; for(let j=6;j>=1;j--){ const p=path(Math.max(0,k-j*0.05)); atGlowA(c,p[0],p[1],R*0.42*(1-j/8),col,0.5*(1-j/7)); } c.restore();
        const p=path(k); HR.globe(c,p[0],p[1],R*0.4,col,true,d,1); }
      else { const q=(k-1)/0.5; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tg.x,tg.y-R*0.3,R*(0.6+0.6*q),col,0.8*(1-q)); c.restore(); SG.ring(c,tg.x,tg.y-R*0.3,R*(0.3+1.1*q),R*(0.3+0.9*q),col,3,1-q);
        for(let j=0;j<7;j++){ const a=j/7*Math.PI*2+i, v=R*(0.4+1.1*eo(q)); atStar4(c,tg.x+Math.cos(a)*v,tg.y-R*0.3+Math.sin(a)*v,R*0.12*(1-q),atRgba(HRL(col,0.5),1-q)); } } }
    for(let i=0;i<6;i++) atImpact(t,500+i*125,0.2,0.03); }};

/* ---- Cthulhu's Dream Call: the arena sinks into a dark dream with drifting motes, rings ripple out, and a vast shadow of Cthulhu rises behind the
   target with ribbed bat wings spread, a ridged head and a beard of feelers with suckers. Its eyes open as red slits and the dread lands. */
HR.dreamShade=(c,hx,hy,hr,t,eye)=>{ const body="rgba(24,14,48,.96)", rim="rgba(150,110,230,.55)";
  for(const sd of [-1,1]){ c.fillStyle="rgba(18,10,38,.92)"; c.beginPath(); c.moveTo(hx+sd*hr*0.5,hy+hr*0.5); c.quadraticCurveTo(hx+sd*hr*1.6,hy-hr*1.4,hx+sd*hr*2.5,hy-hr*0.9);
    for(let i=0;i<4;i++){ const u=i/3, ex=hx+sd*hr*(2.5-0.55*u), ey=hy-hr*(0.9-1.5*u); c.quadraticCurveTo(hx+sd*hr*(2.1-0.55*u),ey+hr*0.15,ex-sd*hr*0.3,ey+hr*0.45); } c.lineTo(hx+sd*hr*0.6,hy+hr*1.1); c.closePath(); c.fill();
    c.strokeStyle=rim; c.lineWidth=1.5; for(let i=0;i<4;i++){ const u=i/3; c.beginPath(); c.moveTo(hx+sd*hr*0.55,hy+hr*0.5); c.quadraticCurveTo(hx+sd*hr*(1.4-0.2*u),hy-hr*(0.6-0.6*u),hx+sd*hr*(2.5-0.55*u),hy-hr*(0.9-1.5*u)); c.stroke(); } }   // ribbed bat wings
  c.fillStyle=body; c.beginPath(); c.ellipse(hx,hy+hr*1.4,hr*0.85,hr*0.9,0,0,7); c.fill();
  c.beginPath(); c.moveTo(hx-hr*0.85,hy+hr*0.2); c.quadraticCurveTo(hx-hr*0.95,hy-hr*1.15,hx,hy-hr*1.25); c.quadraticCurveTo(hx+hr*0.95,hy-hr*1.15,hx+hr*0.85,hy+hr*0.2); c.quadraticCurveTo(hx,hy+hr*0.55,hx-hr*0.85,hy+hr*0.2); c.fill();
  c.strokeStyle=rim; c.lineWidth=2; c.beginPath(); c.moveTo(hx-hr*0.82,hy); c.quadraticCurveTo(hx-hr*0.9,hy-hr*1.1,hx,hy-hr*1.22); c.quadraticCurveTo(hx+hr*0.9,hy-hr*1.1,hx+hr*0.82,hy); c.stroke();
  c.strokeStyle="rgba(120,90,200,.35)"; c.lineWidth=1.4; for(let i=0;i<3;i++){ c.beginPath(); c.arc(hx,hy-hr*0.2,hr*(0.5+0.18*i),Math.PI*1.2,Math.PI*1.8); c.stroke(); }   // ridges on the head
  for(let i=0;i<8;i++){ const u=(i-3.5)/3.5, sx=hx+u*hr*0.62, L=hr*(1.3+0.5*(1-Math.abs(u))), pts=[]; for(let j=0;j<=10;j++){ const v=j/10; pts.push([sx+Math.sin(t/240+i+v*3)*hr*0.18*v+u*hr*0.2*v,hy+hr*0.3+L*v]); }
    c.strokeStyle=body; c.lineCap="round"; for(let j=0;j<10;j++){ c.lineWidth=hr*0.17*(1-j/12); c.beginPath(); c.moveTo(pts[j][0],pts[j][1]); c.lineTo(pts[j+1][0],pts[j+1][1]); c.stroke(); }
    c.fillStyle="rgba(170,130,240,.45)"; for(let j=2;j<9;j+=2){ c.beginPath(); c.arc(pts[j][0]+hr*0.03,pts[j][1],hr*0.025*(1-j/12),0,7); c.fill(); } }
  if(eye>0) for(const sd of [-1,1]){ const ex=hx+sd*hr*0.36, ey=hy-hr*0.18; atGlowA(c,ex,ey,hr*0.45*eye,[255,40,70],0.7); c.fillStyle="#ffe3e8"; c.beginPath(); c.ellipse(ex,ey,hr*0.17,hr*0.1*eye,sd*0.25,0,7); c.fill(); c.fillStyle="#d01838"; c.beginPath(); c.ellipse(ex,ey,hr*0.045,hr*0.095*eye,0,0,7); c.fill(); } };
const sgDreamCall={C:1000,D:1900,sig:true,
  atk:t=>({pose:atPose(t<1400?"cast":"idle",{eyes:t<900?"shut":undefined}),arc:t<1400?-6*Math.sin(t/250):0}),
  def:t=>t>=1000&&t<1650?{off:[Math.sin(t/14)*2,0],pose:"hurt",sy:0.94}:null,
  back(c,t,x){ const tg=x.target, R=tg.r, W=1e4; if(t<150||t>1850) return; const dim=t<500?(t-150)/350:t<1450?1:Math.max(0,1-(t-1450)/400), rise=t<950?eio(Math.max(0,(t-300)/650)):1;
    c.save(); c.fillStyle=`rgba(8,4,22,${0.55*dim})`; c.fillRect(-W,-W,W*2,W*2); const v=c.createRadialGradient(tg.x,tg.y,R,tg.x,tg.y,R*6); v.addColorStop(0,"rgba(60,30,110,0)"); v.addColorStop(1,`rgba(10,4,26,${0.5*dim})`); c.fillStyle=v; c.fillRect(tg.x-R*8,tg.y-R*8,R*16,R*16);
    for(let i=0;i<24;i++){ const q=((t/2400)+atH(i*3))%1, px=tg.x+(atH(i*7)-0.5)*R*9, py=tg.y+R*2-q*R*7; atGlowA(c,px,py,R*0.06,[190,170,255],dim*Math.sin(q*Math.PI)); }
    const hr=R*1.25, hx=tg.x, hy=tg.foot-R*(0.6+2.3*rise); c.globalAlpha*=dim*Math.min(1,rise*1.5); HR.dreamShade(c,hx,hy,hr,t,t<900?0:Math.min(1,(t-900)/160)); c.restore(); },
  fx(c,t,x){ const tg=x.target, R=tg.r; if(t<150||t>1850) return; const dim=t<500?(t-150)/350:t<1450?1:Math.max(0,1-(t-1450)/400);
    for(let i=0;i<3;i++){ const q=((t/1100)+i/3)%1; SG.ring(c,tg.x,tg.y-R*0.3,R*(0.5+3*q),R*(0.35+2.1*q),[150,110,230],2,0.5*(1-q)*dim); }
    if(t>=1000&&t<1500){ const k=(t-1000)/500; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tg.x,tg.y-R*0.3,R*(1+1.5*k),[220,40,80],0.6*(1-k)); c.restore(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, v=R*(0.6+1.6*eo(k)); c.strokeStyle=`rgba(40,10,60,${0.9*(1-k)})`; c.lineWidth=3; c.beginPath(); c.moveTo(tg.x+Math.cos(a)*v*0.6,tg.y-R*0.3+Math.sin(a)*v*0.6); c.lineTo(tg.x+Math.cos(a)*v,tg.y-R*0.3+Math.sin(a)*v); c.stroke(); } }
    atImpact(t,1000,0.5,0.12); }};

/* ---- Cthulhu's Sunken Rise: seawater floods the floor between them with drowned ruins under it. Cthulhu hops up and dives in, its shadow
   swims under the surface to the target, the water swells, and it bursts up out of a tall column of water right under the target, claws first,
   throwing it into the air. Then it drops back into the sea and comes up again at its own spot as the flood drains. */
const SR={ home:null,
  atk(t,x){ const g=(x&&x.gap)||220, d=(x&&x.dir)||1, at=k=>[d*g*0.84*k,0];   // it comes up just in front of the target, so it isn't hidden behind it
    if(t<250){ const k=eo(t/250); return {sy:1-0.12*k,sx:1+0.08*k,pose:"crouch"}; }
    if(t<420){ const k=(t-250)/170; return {arc:-70*Math.sin(k*Math.PI*0.5),sy:1.06,pose:"slamup"}; }
    if(t<580){ const k=ei((t-420)/160), ac=-70+170*k; return {arc:ac,alpha:ac<-10?1:Math.max(0,1-(ac+10)/35),sy:1.1,sx:0.9,rot:0.25*d*k,pose:"slam"}; }
    if(t<720) return {alpha:0,off:at(eio((t-580)/140)),arc:100,pose:"slam"};
    if(t<950){ const k=ei((t-720)/230), ac=100-150*k; return {off:at(1),arc:ac,alpha:ac>60?0:ac>20?1-(ac-20)/40:1,sy:1.12,sx:0.92,rot:0.05*Math.sin(t/40),pose:"slamup"}; }
    if(t<1120){ const k=eo((t-950)/170); return {off:at(1),arc:-50-25*k,sy:1.08,pose:"slamup"}; }
    if(t<1380){ const k=ei((t-1120)/260), ac=-75+175*k; return {off:at(1),arc:ac,alpha:ac<-10?1:Math.max(0,1-(ac+10)/35),rot:-0.2*d*k,pose:"slam"}; }
    if(t<1620) return {alpha:0,off:at(1-eio((t-1380)/240)),arc:100,pose:"idle"};
    if(t<1850){ const k=eo((t-1620)/230), ac=100*(1-k); return {arc:ac,alpha:ac>40?0:1-ac/40,sy:1+0.1*(1-k),pose:"idle"}; }
    return {pose:"idle"}; },
  def(t,x){ const d=-((x&&x.dir)||1); if(t<700||t>1600) return null;
    if(t<950) return {off:[Math.sin(t/18)*1.5,0],sy:1-0.04*Math.sin((t-700)/250*Math.PI),pose:"hurt"};
    if(t<1420){ const k=(t-950)/470; return {arc:-190*Math.sin(k*Math.PI),rot:d*Math.PI*2*eo(k),off:[d*20*k,0],pose:"hurt"}; }
    const k=(t-1420)/180; return {sy:0.75+0.25*eo(k),sx:1.15-0.15*eo(k),off:[d*20,0],pose:"hurt"}; },
  flood(t){ return t<120?0:t<420?eo((t-120)/300):t<1800?1:Math.max(0,1-(t-1800)/250); } };
const sgSunkenRise={C:950,D:2050,tail:1100,sig:true,
  atk:(t,x)=>SR.atk(t,x), def:(t,x)=>SR.def(t,x),
  back(c,t,x){ const s=x.self, tg=x.target, R=tg.r, f=SR.flood(t); if(t<250) SR.home=s.x; if(f<=0) return; const hx=SR.home==null?s.x:SR.home, ground=HR.floor(sgSunkenRise,t,tg)+2, cx=(hx+tg.x)/2, rx=(Math.abs(tg.x-hx)*0.5+R*2.2)*f, ry=R*0.5*f;
    c.save(); c.beginPath(); c.ellipse(cx,ground,rx,ry,0,0,7); c.clip(); const g=c.createLinearGradient(0,ground-ry,0,ground+ry); g.addColorStop(0,"#6cb8e6"); g.addColorStop(0.5,"#2f78c0"); g.addColorStop(1,"#123a78"); c.fillStyle=g; c.fillRect(cx-rx,ground-ry,rx*2,ry*2);
    c.fillStyle="rgba(8,26,58,.5)"; for(let i=0;i<7;i++){ const px=cx+(i-3)*rx*0.27, w=R*0.16, h=R*(0.25+0.12*(i%3)); c.fillRect(px-w/2,ground-h*0.25,w,h); c.fillRect(px-w*0.85,ground-h*0.25-R*0.05,w*1.7,R*0.05); if(i%2){ c.beginPath(); c.arc(px,ground-h*0.25-R*0.05,w*0.85,Math.PI,0); c.fill(); } }   // drowned ruins
    c.strokeStyle="rgba(150,230,255,.35)"; c.lineWidth=1.2; for(let i=0;i<10;i++){ const xx=cx-rx+rx*2*atH(i*3), yy=ground+(atH(i*7)-0.5)*ry*1.2; c.beginPath(); c.moveTo(xx,yy); c.quadraticCurveTo(xx+R*0.2,yy-R*0.06+Math.sin(t/200+i)*R*0.04,xx+R*0.45,yy); c.stroke(); }   // light rippling on the water
    c.strokeStyle="rgba(240,252,255,.7)"; c.lineWidth=1.6; for(let i=0;i<6;i++){ const xx=cx+(i-2.5)*rx*0.3+Math.sin(t/250+i)*R*0.4, yy=ground+(i%3-1)*ry*0.45; c.beginPath(); c.moveTo(xx-R*0.35,yy); c.lineTo(xx+R*0.35,yy); c.stroke(); }
    c.restore(); c.strokeStyle=`rgba(230,248,255,${0.8*f})`; c.lineWidth=2; c.beginPath(); c.ellipse(cx,ground,rx,ry,0,Math.PI*1.02,Math.PI*1.98); c.stroke();
    for(let i=0;i<3;i++){ const ph=((t/800)+i/3)%1; SG.ring(c,cx,ground,rx*(0.3+0.7*ph),ry*(0.3+0.7*ph),[210,240,255],1.5,0.5*(1-ph)*f); }
    if(t>=580&&t<840){ const k=(t-580)/260, sx=hx+(tg.x-hx)*eio(Math.min(1,k*1.08)), d=tg.x>hx?1:-1; c.save(); c.globalAlpha*=Math.sin(k*Math.PI)*0.85+0.15;   // its shadow swimming under the surface
      c.fillStyle="rgba(4,10,30,.82)"; c.beginPath(); c.ellipse(sx,ground+ry*0.1,R*0.95,R*0.26,0,0,7); c.fill(); for(const sd of [-1,1]){ c.beginPath(); c.moveTo(sx,ground); c.quadraticCurveTo(sx-d*R*0.3,ground+sd*R*0.4,sx-d*R*0.9,ground+sd*R*0.28); c.lineTo(sx-d*R*0.3,ground); c.fill(); }
      c.strokeStyle="rgba(245,253,255,.95)"; c.lineWidth=2.4; for(const sd of [-1,1]){ c.beginPath(); c.moveTo(sx+d*R*0.8,ground); c.lineTo(sx-d*R*2.0,ground+sd*R*0.36); c.stroke(); } for(let i=0;i<5;i++){ const q=((t/250)+i/5)%1; c.strokeStyle=`rgba(240,252,255,${0.8*(1-q)})`; c.lineWidth=1.3; c.beginPath(); c.arc(sx-d*R*q*1.5,ground-q*R*0.5,R*0.06,0,7); c.stroke(); } c.restore(); } },
  fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, ground=HR.floor(sgSunkenRise,t,tg)+2, hx=SR.home==null?s.x:SR.home;
    HR.splash(c,hx,ground,R,(t-540)/450,14,[120,200,245]);   // the dive
    if(t>=620&&t<960){ const k=(t-620)/340, h=R*1.1*eo(k), sx0=t<720?tg.x:s.x; const g=c.createRadialGradient(sx0,ground-h*0.5,2,sx0,ground,R*1.6); g.addColorStop(0,"rgba(200,240,255,.9)"); g.addColorStop(1,"rgba(60,140,215,.85)"); c.fillStyle=g; c.beginPath(); c.ellipse(sx0,ground,R*1.5,Math.max(1,h),0,Math.PI,0); c.fill();
      for(let i=0;i<8;i++){ const q=(k*2+i/8)%1; c.strokeStyle=`rgba(240,252,255,${0.8*(1-q)})`; c.lineWidth=1.3; c.beginPath(); c.arc(sx0+(i-3.5)*R*0.3,ground-q*h*1.4,R*0.05,0,7); c.stroke(); } }   // the water swells under the target
    if(t>=720&&t<1300){ const top=Math.min(ground,s.foot), wl=ground, body=Math.max(0,wl-(s.y-s.r*1.1)), k=(t-720)/580;   // water pouring off it as it comes up through the surface
      if(top<wl-2){ const drain=Math.min(1,Math.max(0,(t-900)/350)), h=(wl-top)*(1-drain), w=s.r*0.95; if(h>2){ const g=c.createLinearGradient(0,wl-h,0,wl); g.addColorStop(0,"rgba(190,235,255,.55)"); g.addColorStop(1,"rgba(60,140,215,.8)"); c.fillStyle=g;
          c.beginPath(); c.moveTo(s.x-w*1.3,wl); c.quadraticCurveTo(s.x-w,wl-h*0.5,s.x-w*0.8,wl-h); c.lineTo(s.x+w*0.8,wl-h); c.quadraticCurveTo(s.x+w,wl-h*0.5,s.x+w*1.3,wl); c.closePath(); c.fill(); } }
      for(let i=0;i<10;i++){ const ph=((t/320)+i/10)%1, px=s.x+(i-4.5)*s.r*0.2, py=s.y-s.r*(0.7-0.2*(i%3))+ph*(wl-(s.y-s.r*0.7)); if(py<wl) HR.drop(c,px,py,s.r*0.06,[170,220,255],0.9*(1-ph)*(1-Math.max(0,k-0.7)/0.3)); }
      if(t<1050){ const q=Math.min(1,(t-720)/330); SG.ring(c,s.x,wl,s.r*(1.0+0.9*q),s.r*(0.22+0.15*q),[255,255,255],3,0.9*(1-q*0.6)); c.fillStyle="rgba(255,255,255,.85)"; for(let i=0;i<9;i++){ const an=i/9*Math.PI*2+t/200; c.beginPath(); c.arc(s.x+Math.cos(an)*s.r*1.05,wl+Math.sin(an)*s.r*0.22,s.r*0.12,0,7); c.fill(); } } }   // foam round it at the waterline
    if(t>=930&&t<1500){ const k=(t-930)/570, up=t<1010?eo((t-930)/80):1-ei(Math.min(1,(t-1010)/380)), H=R*1.9*up, w=R*1.1;   // the water bursts up as it breaks the surface and falls straight back
      if(H>2){ c.save(); c.globalAlpha*=0.9; for(let i=0;i<9;i++){ const u=(i-4)/4, px=tg.x+u*w*(1+0.5*k), hh=H*(0.55+0.45*Math.cos(u*1.4))*(0.85+0.3*atH(i*7)), lean=u*R*0.35*k; const gr=c.createLinearGradient(0,ground-hh,0,ground); gr.addColorStop(0,"rgba(240,252,255,.95)"); gr.addColorStop(1,"rgba(70,155,225,.9)"); c.fillStyle=gr;
          c.beginPath(); c.moveTo(px-R*0.16,ground); c.quadraticCurveTo(px-R*0.08+lean*0.5,ground-hh*0.6,px+lean,ground-hh); c.quadraticCurveTo(px+R*0.08+lean*0.5,ground-hh*0.6,px+R*0.16,ground); c.closePath(); c.fill(); HR.drop(c,px+lean*1.2,ground-hh-R*0.15+k*k*R*0.6,R*0.08,[235,250,255],0.9*(1-k)); }
        c.restore(); }
      HR.splash(c,tg.x,ground,R*1.6,Math.min(1,Math.max(0,(t-950)/520)*1.15),26,[110,195,245]); SG.ring(c,tg.x,ground,R*(1+3*k),R*(0.25+0.6*k),[255,255,255],3,0.9*(1-k)); }
    if(t>=950&&t<1180){ const k=(t-950)/230; c.save(); c.globalCompositeOperation="lighter"; c.strokeStyle=`rgba(140,255,220,${1-k})`; c.lineWidth=4.5; c.lineCap="round";   // claw marks raking upward
      for(let j=0;j<3;j++){ const xx=tg.x+(j-1)*R*0.32; c.beginPath(); c.moveTo(xx-R*0.1,tg.y+R*0.5); c.quadraticCurveTo(xx+R*0.15,tg.y-R*0.3,xx+R*0.05,tg.y-R*(0.9+0.6*k)); c.stroke(); } c.restore(); }
    HR.splash(c,tg.x,ground,R*0.9,(t-1340)/400,12,[130,205,248]); SG.ring(c,hx,ground,R*(0.6+1.4*Math.max(0,(t-1620)/400)),R*(0.15+0.3*Math.max(0,(t-1620)/400)),[230,248,255],2,t>=1620&&t<2020?0.8*(1-(t-1620)/400):0);
    if(t>=1620&&t<1850){ const k=(t-1620)/230; for(let i=0;i<6;i++){ const ph=(k+i/6)%1; HR.drop(c,hx+(i-2.5)*s.r*0.25,s.y-s.r*0.3+ph*s.r*1.2,s.r*0.06,[170,220,255],0.85*(1-ph)); } }
    atImpact(t,950,0.85,0.15); atImpact(t,1340,0.3,0); }};

Object.assign(ANIM,{sg_tidalgrasp:sgTidalGrasp,sg_fishersong:sgFishersSong,sg_kidstampede:sgKidStampede,sg_blackgrove:sgBlackGrove,sg_swallowwhole:sgSwallowWhole,
  sg_curtaincall:sgCurtainCall,sg_tatteredcloak:sgTatteredCloak,sg_gateopen:sgGateOpen,sg_globestorm:sgGlobeStorm,sg_dreamcall:sgDreamCall,sg_sunkenrise:sgSunkenRise});

for(const k of ["sg_carryoff","sg_pinklights","sg_jarharvest","sg_tidalgrasp","sg_fishersong","sg_kidstampede","sg_blackgrove","sg_gateknock","sg_splitmaw","sg_manyeyes","sg_swallowwhole","sg_curtaincall","sg_tatteredcloak","sg_gateopen","sg_globestorm","sg_dreamcall","sg_sunkenrise","sg_feast"]) ANIM[k].sig=true;
Object.assign(AR_KIND,{"Grave Dig":"sg_gravedig","Feast":"sg_feast","Carry Off":"sg_carryoff","Tickle Storm":"sg_ticklestorm","Pink Lights":"sg_pinklights","Jar Harvest":"sg_jarharvest",
  "Tidal Grasp":"sg_tidalgrasp","Fisher's Song":"sg_fishersong","Kid Stampede":"sg_kidstampede","Black Grove":"sg_blackgrove","Gate Knock":"sg_gateknock","Split Maw":"sg_splitmaw",
  "Many Eyes":"sg_manyeyes","Swallow Whole":"sg_swallowwhole","Curtain Call":"sg_curtaincall","Tattered Cloak":"sg_tatteredcloak","Gate Open":"sg_gateopen","Globe Storm":"sg_globestorm",
  "Dream Call":"sg_dreamcall","Sunken Rise":"sg_sunkenrise"});
/* the wind-up each horror plays before its signatures */
if(typeof AT_WIND!=="undefined") Object.assign(AT_WIND,{Ghoul:"quake",Nightgaunt:"shadow",Migo:"signal",Dagon:"tide",Shub:"bloom",Gug:"quake",Shoggoth:"toxic",Hastur:"sigil",Yog:"sigil",Cthulhu:"moon"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  sg_gravedig:(d,t)=>{ dNoise(d,t+0.05,0.3,0.14,'lowpass',400); dNoise(d,t+0.3,0.3,0.08,'lowpass',300); dKick(d,t+0.62,0.9); dNoise(d,t+0.62,0.4,0.25,'lowpass',600); [0.7,0.8,0.9].forEach(x=>sTone(d,t+x,'triangle',900,600,0.05,0.03)); },
  sg_feast:(d,t)=>{ dNoise(d,t+0.1,0.2,0.1,'bandpass',800,0.8); for(let j=0;j<4;j++){ dNoise(d,t+0.56+j*0.155,0.06,0.3,'bandpass',1800,2); dKick(d,t+0.56+j*0.155,0.25); } sTone(d,t+0.6,'sine',300,120,0.7,0.04); },
  sg_carryoff:(d,t)=>{ dNoise(d,t+0.1,0.3,0.12,'bandpass',900,0.6); for(let i=0;i<6;i++) dNoise(d,t+0.4+i*0.09,0.06,0.1,'bandpass',600,1); sTone(d,t+1.05,'sine',900,200,0.2,0.05); dKick(d,t+1.25,1); dNoise(d,t+1.25,0.4,0.25,'lowpass',400); },
  sg_ticklestorm:(d,t)=>{ for(let j=0;j<6;j++){ dNoise(d,t+0.28+j*0.105,0.05,0.12,'highpass',3500,2); sTone(d,t+0.28+j*0.105,'triangle',1500+(j%3)*300,1900,0.06,0.04); } },
  sg_pinklights:(d,t)=>{ sTone(d,t+0.1,'sine',600,1200,0.6,0.04); sTone(d,t+0.1,'sine',903,1800,0.6,0.025); [0.76,0.95,1.14].forEach(x=>sTone(d,t+x,'sine',1400,700,0.2,0.04)); },
  sg_jarharvest:(d,t)=>{ sTone(d,t+0.2,'triangle',2000,2000,0.1,0.04); sTone(d,t+0.45,'sine',400,1600,0.4,0.04); dNoise(d,t+0.82,0.05,0.3,'highpass',3000,2); sTone(d,t+0.84,'triangle',2400,2400,0.2,0.05); },
  sg_tidalgrasp:(d,t)=>{ dNoise(d,t+0.2,0.6,0.14,"lowpass",600); dNoise(d,t+0.56,0.38,0.1,"bandpass",500,0.6); dKick(d,t+0.94,1); dNoise(d,t+0.94,0.3,0.3,"lowpass",900); dNoise(d,t+1.38,0.5,0.25,"lowpass",900); },
  sg_fishersong:(d,t)=>{ [392,440,494,523,494,440].forEach((f,i)=>sTone(d,t+0.05+i*0.14,'sine',f,f,0.2,0.06)); dNoise(d,t+0.5,0.6,0.16,'lowpass',700); dKick(d,t+1.0,0.7); dNoise(d,t+1.0,0.6,0.25,'lowpass',900); },
  sg_kidstampede:(d,t)=>{ for(let i=0;i<22;i++) dKick(d,t+0.22+i*0.045,0.1); for(let j=0;j<8;j++){ sTone(d,t+0.56+j*0.09,'sawtooth',560+(j%3)*70,440,0.1,0.025); dNoise(d,t+0.56+j*0.09,0.05,0.12,'bandpass',900,1); } },
  sg_blackgrove:(d,t)=>{ for(let i=0;i<7;i++) dNoise(d,t+0.3+i*0.06,0.2,0.12,'lowpass',300+i*30); dNoise(d,t+0.9,0.3,0.14,'bandpass',500,0.8); sTone(d,t+0.9,'sine',120,80,0.6,0.06); },
  sg_gateknock:(d,t)=>{ [0.3,0.65,1.0].forEach((x,i)=>{ dKick(d,t+x,0.6+i*0.25); dNoise(d,t+x,0.3,0.2+i*0.06,'lowpass',300); }); },
  sg_splitmaw:(d,t)=>{ dNoise(d,t+0.42,0.3,0.12,'bandpass',300,0.6); sTone(d,t+0.42,'sawtooth',80,60,0.3,0.05); dKick(d,t+0.72,0.9); dNoise(d,t+0.72,0.12,0.4,'bandpass',1500,1.5); },
  sg_manyeyes:(d,t)=>{ for(let i=0;i<11;i++) dNoise(d,t+0.25+i*0.045,0.03,0.08,'bandpass',2500,3); sTone(d,t+0.82,'sine',220,110,0.6,0.07); sTone(d,t+0.82,'sine',233,117,0.6,0.05); },
  sg_swallowwhole:(d,t)=>{ dNoise(d,t+0.05,0.5,0.14,'lowpass',500); sTone(d,t+0.4,'sawtooth',90,60,0.35,0.04); dKick(d,t+0.76,0.8); sTone(d,t+0.78,'sine',300,90,0.4,0.06); for(let i=0;i<6;i++) sTone(d,t+1.0+i*0.11,'sine',260+i*40,420+i*40,0.07,0.03); sTone(d,t+1.55,'sine',120,300,0.14,0.05); dNoise(d,t+1.69,0.25,0.25,'bandpass',700,0.8); dKick(d,t+2.05,0.4); },
  sg_curtaincall:(d,t)=>{ dNoise(d,t+0.4,0.4,0.1,'bandpass',800,0.5); dKick(d,t+0.82,0.3); [0.9,1.1,1.3].forEach((x,i)=>sTone(d,t+x,'sine',600-i*100,500-i*100,0.25,0.04)); },
  sg_tatteredcloak:(d,t)=>{ dNoise(d,t+0.2,0.7,0.1,'bandpass',600,0.5); sTone(d,t+0.9,'sawtooth',110,104,0.6,0.04); sTone(d,t+0.9,'triangle',880,860,0.5,0.03); },
  sg_gateopen:(d,t)=>{ dNoise(d,t+0.15,0.3,0.1,'lowpass',300); sTone(d,t+0.45,'sine',200,800,0.4,0.05); sTone(d,t+0.62,'sine',300,1200,0.3,0.03); dKick(d,t+1.06,0.7); dNoise(d,t+1.06,0.2,0.3,'lowpass',500); [1.25,1.45,1.58].forEach((x,i)=>{ dKick(d,t+x,0.3+i*0.1); dNoise(d,t+x,0.1,0.12,'lowpass',400); }); sTone(d,t+1.68,'sine',900,300,0.3,0.05); for(let i=0;i<4;i++) sTone(d,t+2.05+i*0.06,'triangle',1200+i*200,1600,0.08,0.03); },
  sg_globestorm:(d,t)=>{ for(let i=0;i<6;i++){ sTone(d,t+0.2+i*0.125,'sine',800+i*120,500,0.15,0.04); dKick(d,t+0.5+i*0.125,0.2); } },
  sg_dreamcall:(d,t)=>{ sTone(d,t+0.15,'sine',55,50,1.4,0.1); sTone(d,t+0.15,'sine',82,78,1.4,0.06); dNoise(d,t+0.3,1.0,0.06,'lowpass',200); sTone(d,t+1.0,'sawtooth',110,90,0.5,0.05); },
  sg_sunkenrise:(d,t)=>{ dNoise(d,t+0.05,0.5,0.12,'lowpass',500); dNoise(d,t+0.54,0.35,0.22,'lowpass',800); sTone(d,t+0.6,'sine',70,55,0.3,0.06); dNoise(d,t+0.76,0.2,0.12,'lowpass',400); dKick(d,t+0.95,1.1); dNoise(d,t+0.95,0.8,0.3,'lowpass',900); sTone(d,t+0.95,'sawtooth',90,180,0.3,0.04); dNoise(d,t+1.34,0.4,0.2,'lowpass',800); dNoise(d,t+1.62,0.3,0.12,'lowpass',700); }
});

/* the horrors' other moves use the closest animations made so far */
Object.assign(AR_KIND,{"Dirt Claw": "claw", "Dirt Fling": "sandspray", "Dig In": "flash", "Hole Hop": "tackle", "Long Reach": "punch", "Grit Throw": "sandspray", "Grave Dust": "sandspray", "Roof Drop": "overheadsmash", "Rotten Breath": "steam", "Long Slash": "claw", "Grave Sweep": "sweep", "Grim Grip": "jawlock", "Tunnel Rush": "chargeram", "Bury Deep": "dragunder", "Claw Flick": "claw", "Leather Wing": "wingstorm", "Fade Away": "flash", "Flit Away": "tackle", "Barb Flick": "lash", "Silent Swoop": "talondive", "Light Tickle": "push", "Black Gust": "gust", "Chill Draft": "gust", "Barb Stab": "thrust", "Hook Drop": "talondive", "Horn Ram": "tackle", "Night Dive": "talondive", "Long Fall": "talondive", "Pincer Nip": "pinch", "Wing Buzz": "wingstorm", "Calibrate": "flash", "Side Skitter": "tackle", "Quick Snip": "pinch", "Buzz Dive": "tackle", "Pink Mist": "sandspray", "Cold Storage": "icefall", "Mind Probe": "beam", "Clean Cut": "vicegrip", "Steel Needle": "spear", "Stone Haul": "lift", "Swarm Pass": "chargeram", "Pink Storm": "volley", "Webbed Slap": "lash", "Gill Spray": "beam", "Bubble Shield": "flash", "Slip Away": "tackle", "Fin Sweep": "sweep", "Brine Shot": "volley", "Cast Net": "web", "Deep Hymn": "lullaby", "Drowned Moan": "trumpet", "Fin Slice": "sweep", "Ice Fin": "sweep", "Fin Crash": "hammer", "Deep Pressure": "wave", "Sea Drag": "dragunder", "Horn Bump": "tackle", "Dark Flick": "lash", "Plant Hooves": "flash", "Kid Swap": "tackle", "Horn Charge": "chargeram", "Root Whip": "lash", "Sap Spit": "drool", "Dark Bleat": "chatter", "Bramble Wrap": "venomcoil", "Thorn Spike": "spear", "Horn Sweep": "sweep", "Great Horns": "hornjab", "Trample": "stampede", "Wild Rush": "stampede", "Shaggy Swipe": "claw", "Lumber In": "tackle", "Fist Drop": "hammer", "Hairy Shuffle": "kick", "Planted Feet": "flash", "Ground Thump": "stomp", "Door Pound": "overheadsmash", "Gum Tear": "bite", "Hot Breath": "steam", "Giant Barge": "chargeram", "Tight Grip": "vicegrip", "Rock Hurl": "boulder", "Dread Growl": "trumpet", "Ground Pound": "stampede", "Goo Slap": "lash", "Ooze Lunge": "tackle", "Lash Out": "lash", "Ooze Away": "sweep", "Stare Back": "flash", "Sprout Arm": "punch", "Gulp Down": "biggulp", "Copy Blade": "spear", "Rust Ooze": "drool", "Slime Roll": "bigroll", "Black Slime": "drool", "Staring Eyes": "flash", "Mirror Shape": "bodyslam", "Tentacle Thrash": "punchflurry", "Cloak Flick": "sweep", "Sweep In": "tackle", "Staff Rap": "thrust", "Stage Exit": "flash", "Cloak Wrap": "flash", "Stage Whisper": "chatter", "Staff Jab": "thrust", "Lull Chant": "lullaby", "Scepter Smash": "overheadsmash", "Hollow Laugh": "trumpet", "Fading Light": "flash", "Yellow Mark": "flash", "Rag Storm": "wingstorm", "Final Act": "beam", "Globe Bump": "bodyslam", "Drift In": "tackle", "Spark Globe": "beam", "Step Through": "flash", "Slip Between": "flash", "Ring Around": "volley", "Door Slam": "hammer", "Gate Edge": "gust", "Warp Pull": "wave", "Tentacle Prick": "thrust", "Void Stare": "inkfog", "Tentacle Squeeze": "venomcoil", "Globe Crash": "chargeram", "Orbit Barrage": "volley", "Deep Claw": "claw", "Great Wing": "tackle", "Arm Slam": "punch", "Dive Past": "sweep", "Sea Veil": "flash", "Feeler Lash": "lash", "Tidal Crush": "hammer", "Reef Claw": "shadowclaw", "Sea Dread": "wave", "Foot Crush": "stomp", "Night Terror": "lullaby", "Night Wings": "wingstorm", "Claw Combo": "punchflurry", "Feeler Grip": "venomcoil"});
