/* The ten horrors' moves (17 Nov 2026). Each horror has two signatures, both played as the full special with the long wind-up and close-up:
   the first comes by level, the second from an errantry to its myth's region. Needs arena-sigs.js (SG) and arena-moves.js (MV). */
const HR={};
HR.bone=(c,x,y,z,rot,a=1)=>{ c.save(); c.globalAlpha*=a; c.translate(x,y); c.rotate(rot); c.fillStyle="#f4eedd"; c.strokeStyle="rgba(120,100,80,.8)"; c.lineWidth=1;
  c.fillRect(-z,-z*0.18,z*2,z*0.36); for(const sx of [-1,1]) for(const sy of [-1,1]){ c.beginPath(); c.arc(sx*z,sy*z*0.2,z*0.26,0,7); c.fill(); } c.restore(); };
HR.eye=(c,x,y,r,open,look=0)=>{ if(open<=0.02) return; c.save(); c.translate(x,y); c.scale(1,open); c.fillStyle="#fffdf4"; c.strokeStyle="rgba(60,20,60,.9)"; c.lineWidth=1.4;
  c.beginPath(); c.ellipse(0,0,r,r*0.75,0,0,7); c.fill(); c.stroke(); c.fillStyle="#c23a6e"; c.beginPath(); c.arc(look*r*0.3,0,r*0.45,0,7); c.fill(); c.fillStyle="#1a0f1e"; c.beginPath(); c.arc(look*r*0.3,0,r*0.22,0,7); c.fill(); c.restore(); };
HR.kid=(c,x,y,z,ph,col)=>{ c.save(); c.translate(x,y); const b=Math.abs(Math.sin(ph))*z*0.25; c.translate(0,-b);
  c.strokeStyle="#2a2026"; c.lineWidth=z*0.14; c.lineCap="round"; for(const lx of [-0.4,-0.15,0.15,0.4]){ c.beginPath(); c.moveTo(lx*z,z*0.2); c.lineTo(lx*z+Math.sin(ph+lx*6)*z*0.15,z*0.62); c.stroke(); }
  c.fillStyle=atRgba(col,1); for(let i=0;i<5;i++){ c.beginPath(); c.arc((i-2)*z*0.22,Math.sin(i)*z*0.06,z*0.3,0,7); c.fill(); }   // a woolly little body
  c.beginPath(); c.arc(-z*0.62,-z*0.18,z*0.24,0,7); c.fill(); c.strokeStyle="#d8cdb8"; c.lineWidth=z*0.08; c.beginPath(); c.arc(-z*0.55,-z*0.42,z*0.14,Math.PI,Math.PI*1.8); c.stroke();
  c.fillStyle="#ffe08a"; c.beginPath(); c.arc(-z*0.7,-z*0.2,z*0.05,0,7); c.fill(); c.restore(); };
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
  /* Dagon's Tidal Grasp: a huge webbed hand of seawater rises under the target, closes round it and slams it down */
  sg_tidalgrasp:{C:880,D:1600,
    atk:t=>({pose:t<300?"cast":t<1200?"push":"idle",sy:t<300?1-0.08*eo(t/300):1}),
    def(t){ if(t<500||t>1400) return null; if(t<880){ const k=eio((t-500)/380); return {arc:-50*k,pose:"hurt",sx:0.9}; } const k=(t-880)/520; return {arc:-50*(1-ei(Math.min(1,k*3))),sy:k<0.15?0.8:1,pose:"hurt"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t<200||t>1450) return; const rise=t<500?eo((t-200)/300):1, grip=t<500?0:t<760?eo((t-500)/260):1, slam=t<880?0:Math.min(1,(t-880)/120), fade=t<1150?1:1-(t-1150)/300;
      const base=tg.foot, top=base-R*3.2*rise+(t>=500&&t<880?-R*0.7*eio((t-500)/380):0)+R*1.6*slam, cx=tg.x;
      c.save(); c.globalAlpha*=fade; const g=c.createLinearGradient(0,top,0,base); g.addColorStop(0,"rgba(150,215,255,.85)"); g.addColorStop(1,"rgba(40,110,190,.85)"); c.fillStyle=g;
      c.beginPath(); c.moveTo(cx-R*0.7,base); c.lineTo(cx-R*0.6,top+R*1.0); for(let i=0;i<5;i++){ const fx=cx-R*0.75+i*R*0.38, bend=grip*R*0.5*(i<4?1:-0.6); c.lineTo(fx+bend*(i<4?0.6:1),top-R*0.4*(i===4?0.4:1)+bend*0.4); c.lineTo(fx+R*0.18+bend*0.5,top+R*0.25); }
      c.lineTo(cx+R*0.7,top+R*1.0); c.lineTo(cx+R*0.75,base); c.closePath(); c.fill(); c.strokeStyle="rgba(230,248,255,.8)"; c.lineWidth=2; c.stroke(); c.restore();
      if(t>=880&&t<1300){ const k=(t-880)/420; for(let i=0;i<12;i++){ const a=-Math.PI*(0.1+0.8*atH(i*7)), sp=R*(0.5+2*eo(k)); c.fillStyle=`rgba(170,220,255,${0.9*(1-k)})`; c.beginPath(); c.arc(cx+Math.cos(a)*sp,base+Math.sin(a)*sp+k*k*R*2,R*0.08,0,7); c.fill(); } }
      atImpact(t,880,0.65,0.12); }},
  /* Dagon's Fisher's Song: it sings, the notes ring out over the water, and the sea answers with a great wave over the target */
  sg_fishersong:{C:1000,D:1700,
    atk:t=>({pose:atPose(t<1300?"cast":"idle",{open:t<900?0.6+0.2*Math.sin(t/60):0,eyes:t<900?"shut":undefined}),arc:t<900?-5*Math.sin(t/200):0}),
    def:t=>{ if(t<1000) return null; const k=(t-1000)/600; return k<1?{off:[22*Math.sin(Math.min(1,k*2)*Math.PI),0],arc:-26*Math.sin(Math.min(1,k*1.6)*Math.PI),pose:"hurt"}:null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x); if(t<900) for(let i=0;i<6;i++){ const q=((t/700)+i/6)%1, px=s.x+d*R*(0.5+q*2.5), py=s.y-s.r*1.1-q*R*1.2+Math.sin(q*9+i)*8; c.fillStyle=`rgba(200,235,255,${1-q})`; c.beginPath(); c.ellipse(px,py,5,3.6,-0.4,0,7); c.fill(); c.fillRect(px+3.6,py-14,1.8,14); }
      if(t>500){ const W=ANIM.wave.fx; c.save(); c.translate(tg.x,tg.foot); c.scale(1.7,1.7); c.translate(-tg.x,-tg.foot); W(c,(t-500)*1.0,{...x,pw:1.4}); c.restore(); }
      atImpact(t,1000,0.6,0.1); }},
  /* Shub-Niggurath's Kid Stampede: a herd of little black goat kids bursts out of her and stampedes through the target */
  sg_kidstampede:{C:560,D:1500,
    atk:t=>({pose:t<300?"crouch":t<1000?"push":"idle",sy:t<300?1-0.1*eo(t/300):1,sx:t<300?1+0.08*eo(t/300):1}),
    def(t){ if(t<560||t>1200) return null; const p=((t-560)%150)/150; return {off:[(1-p)*7,0],arc:-6*Math.sin(p*Math.PI),pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=(x.body||[60,40,60]).map(v=>v*0.35+20);
      for(let i=0;i<4;i++){ const t0=260+i*150, k=(t-t0)/600; if(k<0||k>1) continue; const px=s.x+d*(Math.abs(tg.x-s.x)+R*2.4)*k, py=tg.foot-R*0.3-(i%2)*R*0.25; c.save(); c.translate(px,py); c.scale(d>0?-1:1,1); HR.kid(c,0,0,R*0.42,t/40+i,col); c.restore(); SG.dust(c,px-d*R*0.4,tg.foot,R*0.4,(t/200+i*0.3)%1,3); }
      for(let i=0;i<4;i++) atImpact(t,560+i*150,0.2,0); }},
  /* Shub-Niggurath's Black Grove: black trees burst out of the ground in a ring round the target and their roots close on it */
  sg_blackgrove:{C:900,D:1700,
    atk:t=>({pose:t<1300?"cast":"idle",sy:t<500?1-0.06*eo(t/500):1}),
    def:t=>t>=900&&t<1500?{off:[Math.sin(t/20)*1.5,0],sy:0.95,pose:"hurt"}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t<300||t>1650) return; const a=t<1400?1:1-(t-1400)/250;
      for(let i=0;i<7;i++){ const an=i/7*Math.PI*2, dx=Math.cos(an)*R*1.6, dz=Math.sin(an), g=Math.max(0,Math.min(1,(t-300-i*60)/360)), h=R*(1.6+0.6*atH(i))*eo(g), bx=tg.x+dx, by=tg.foot+dz*R*0.3;
        c.save(); c.globalAlpha*=a*(dz<0?0.75:1); c.strokeStyle="#1e1622"; c.lineCap="round"; c.lineWidth=R*0.18; c.beginPath(); c.moveTo(bx,by); c.quadraticCurveTo(bx-dx*0.15,by-h*0.6,bx-dx*0.3,by-h); c.stroke();
        c.lineWidth=R*0.07; for(let b=0;b<3;b++){ const yy=by-h*(0.45+b*0.18); c.beginPath(); c.moveTo(bx-dx*0.15*(0.45+b*0.18)*2,yy); c.lineTo(bx-dx*0.15*(0.45+b*0.18)*2+(b%2?1:-1)*R*0.35,yy-R*0.3); c.stroke(); } c.restore(); }
      if(t>=900){ const k=Math.min(1,(t-900)/300); c.save(); c.globalAlpha*=a; c.strokeStyle="#2c1f2a"; c.lineWidth=R*0.12; for(let i=0;i<4;i++){ const yy=tg.y-R*(0.6-i*0.3); c.beginPath(); c.ellipse(tg.x,yy,R*(1.2-0.3*k),R*0.18,0.1*(i-1.5),0,Math.PI*2*k); c.stroke(); } c.restore(); }
      atImpact(t,900,0.45,0.08); }},
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
      if(t>820&&t<1350){ const k=(t-820)/530; SG.ring(c,tg.x,tg.y-R*0.3,R*(0.5+k),R*(0.4+0.8*k),[160,60,200],4,0.8*(1-k)); } c.restore(); atImpact(t,820,0.35,0.1); }},
  /* Shoggoth's Swallow Whole: it surges forward as a wave of goo, swallows the target into a bubble of itself, holds it, then spits it out */
  sg_swallowwhole:{C:640,D:1900,contact:true,marks:true,
    atk:t=>{ if(t<640){ const k=ei(t/640); return {f:0.85*k,sx:1+0.35*k,sy:1-0.2*k,pose:"tackle"}; } if(t<1500) return {f:0.85,sx:1.35+0.05*Math.sin(t/60),sy:0.8+0.04*Math.sin(t/60),pose:"push"}; const k=(t-1500)/400; return {f:0.85*(1-eio(k)),sx:1.35-0.35*eo(k),sy:0.8+0.2*eo(k),pose:"idle"}; },
    def(t){ if(t<640||t>1750) return null; if(t<1500) return {alpha:0.55,sx:0.8,sy:0.85,off:[Math.sin(t/40)*3,-Math.cos(t/50)*3],pose:"hurt"}; const k=(t-1500)/250; return {off:[30*(1-k),0],arc:-30*Math.sin(Math.min(1,k)*Math.PI),pose:"hurt"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, col=x.body||[100,120,90]; if(t<560||t>1560) return; const k=Math.min(1,(t-560)/200), a=t<1450?1:1-(t-1450)/110;
      c.save(); c.globalAlpha*=a*0.75; const g=c.createRadialGradient(tg.x-R*0.3,tg.y-R*0.6,R*0.2,tg.x,tg.y-R*0.2,R*1.5*k); g.addColorStop(0,atRgba(col.map(v=>Math.min(255,v+60)),0.6)); g.addColorStop(1,atRgba(col,0.85)); c.fillStyle=g;
      c.beginPath(); for(let i=0;i<=24;i++){ const an=i/24*Math.PI*2, rr=R*1.45*k*(1+0.06*Math.sin(an*5+t/80)); c.lineTo(tg.x+Math.cos(an)*rr,tg.y-R*0.2+Math.sin(an)*rr*0.95); } c.closePath(); c.fill(); c.restore();
      if(t>700) for(let i=0;i<4;i++){ const an=i*1.7+0.4; HR.eye(c,tg.x+Math.cos(an)*R*1.0,tg.y-R*0.2+Math.sin(an)*R*0.9,R*0.13,Math.min(1,(t-700-i*60)/120)*a,Math.sin(t/300+i)); }
      for(let i=0;i<5;i++){ const ph=((t/500)+i/5)%1; c.strokeStyle=`rgba(255,255,255,${0.5*(1-ph)*a})`; c.lineWidth=1.5; c.beginPath(); c.arc(tg.x+(i-2)*R*0.3,tg.y-R*(0.2+ph*1.1),R*0.06,0,7); c.stroke(); }
      atImpact(t,640,0.45,0.08); atImpact(t,1500,0.4,0); }},
  /* Hastur's Curtain Call: two red theatre curtains drop over the target in a spotlight, and it falls asleep behind them */
  sg_curtaincall:{C:820,D:1700,
    atk:t=>({pose:t<1300?"cast":"idle",arc:t<1300?-4*Math.sin(t/200):0}),
    def:t=>t>=820&&t<1500?{pose:atPose("hurt",{eyes:"shut"}),rot:0.1*Math.sin(t/200)}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r; if(t<200||t>1650) return; const top=tg.y-R*2.6, floor=tg.foot+4, w=R*1.4, close=t<820?eio((t-400)/420):t<1350?1:1-eio((t-1350)/250), sp=Math.max(0,Math.min(1,(t-200)/200))*(t>1500?1-(t-1500)/150:1);
      c.save(); c.globalCompositeOperation="lighter"; const g=c.createRadialGradient(tg.x,tg.y-R*0.4,R*0.2,tg.x,tg.y-R*0.4,R*1.8); g.addColorStop(0,`rgba(255,240,170,${0.45*sp})`); g.addColorStop(1,"rgba(255,240,170,0)"); c.fillStyle=g; c.beginPath(); c.moveTo(tg.x-R*0.3,top-R); c.lineTo(tg.x+R*0.3,top-R); c.lineTo(tg.x+R*1.6,floor); c.lineTo(tg.x-R*1.6,floor); c.closePath(); c.fill(); c.restore();
      if(close>0) for(const sd of [-1,1]){ const inner=tg.x+sd*w*(1-Math.max(0,close))*1.0, outer=tg.x+sd*w*1.25; c.fillStyle="#9c1c2c"; c.beginPath(); c.moveTo(outer,top); c.lineTo(inner,top); for(let i=0;i<=8;i++){ const y=top+(floor-top)*i/8; c.lineTo(inner+sd*Math.sin(i*1.4+t/200)*R*0.06,y); } c.lineTo(outer,floor); c.closePath(); c.fill();
        c.strokeStyle="rgba(60,0,10,.5)"; c.lineWidth=1.5; for(let k=1;k<4;k++){ const xx=inner+(outer-inner)*k/4; c.beginPath(); c.moveTo(xx,top); c.lineTo(xx,floor); c.stroke(); } }
      c.fillStyle="#e9b23a"; c.fillRect(tg.x-w*1.3,top-6,w*2.6,6);
      if(t>900&&t<1500) for(let i=0;i<3;i++){ const ph=((t/500)+i/3)%1; c.fillStyle=`rgba(240,235,255,${1-ph})`; c.font=`bold ${Math.round(R*(0.35+ph*0.3))}px sans-serif`; c.fillText("z",tg.x+R*(0.3+ph*0.6),tg.y-R*(1+ph))}
      atImpact(t,820,0.3,0.05); }},
  /* Hastur's Tattered Cloak: the tatters of its cloak stream out, wrap the target, and a yellow sign burns on it */
  sg_tatteredcloak:{C:900,D:1700,
    atk:t=>({pose:t<1300?"cast":"idle",sx:1+0.06*Math.sin(Math.min(1,t/600)*Math.PI)}),
    def:t=>t>=900&&t<1500?{off:[Math.sin(t/18)*1.5,0],pose:"hurt",sy:0.96}:null,
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, col=(x.body||[120,80,150]).map(v=>v*0.6); if(t<200||t>1650) return; const reach=t<900?eio((t-200)/700):t<1350?1:1-eio((t-1350)/300);
      for(let i=0;i<6;i++){ const ox=s.x, oy=s.y+s.r*(0.2+i*0.12), ex=tg.x+Math.cos(i*1.1+t/300)*R*0.6, ey=tg.y-R*(0.6-i*0.22), mx=(ox+ex)/2, my=Math.min(oy,ey)-R*(0.6+0.3*Math.sin(t/120+i));
        const px=ox+(ex-ox)*reach, py=oy+(ey-oy)*reach; c.strokeStyle=atRgba(col,0.9); c.lineWidth=R*0.14*(1-i*0.08); c.lineCap="round"; c.beginPath(); c.moveTo(ox,oy); c.quadraticCurveTo(ox+(mx-ox)*reach*1.2,oy+(my-oy)*reach,px,py); c.stroke(); }
      if(t>=900&&t<1500){ const k=(t-900)/600, a=k<0.8?1:1-(k-0.8)*5; c.save(); c.translate(tg.x,tg.y-R*0.3); c.globalAlpha*=a; c.strokeStyle="#ffd84a"; c.lineWidth=3; c.shadowColor="#ffd84a"; c.shadowBlur=10;
        c.beginPath(); c.arc(0,0,R*0.5,0.3,Math.PI*1.6); c.stroke(); c.beginPath(); c.moveTo(0,-R*0.5); c.lineTo(0,R*0.55); c.moveTo(-R*0.4,R*0.15); c.quadraticCurveTo(0,-R*0.05,R*0.45,R*0.3); c.stroke(); c.restore(); }   // the yellow sign
      atImpact(t,900,0.4,0.1); }},
  /* Yog-Sothoth's Gate Open: a glowing door opens behind the target, pulls it through, slams, and spits it back out dazed */
  sg_gateopen:{C:1150,D:1800,
    atk:t=>({pose:t<1350?"cast":"idle",arc:t<1350?-8*Math.sin(Math.min(1,t/300)*Math.PI/2):0}),
    def(t){ if(t<500||t>1500) return null; if(t<800){ const k=ei((t-500)/300); return {sx:1-0.6*k,sy:1-0.3*k,alpha:1-0.9*k,off:[-12*k,0],pose:"hurt"}; } if(t<1150) return {alpha:0,pose:"hurt"}; const k=(t-1150)/350; return {alpha:Math.min(1,k*3),sx:0.6+0.4*eo(k),off:[20*(1-k),0],rot:0.5*(1-k),pose:"hurt"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x); if(t<150||t>1650) return; const gx=tg.x+d*R*0.4, gy=tg.foot, h=R*2.6, w=R*1.3, open=t<500?eo((t-150)/350):t<900?1:t<1100?1-eio((t-900)/200):t<1300?eo((t-1100)/200):1-eio(Math.min(1,(t-1450)/200)), fade=t<1450?1:1-(t-1450)/200;
      c.save(); c.globalAlpha*=fade; c.strokeStyle="#ffe7a0"; c.lineWidth=4; c.shadowColor="#c9a0ff"; c.shadowBlur=14; c.strokeRect(gx-w/2,gy-h,w,h);
      const g=c.createLinearGradient(gx,gy-h,gx,gy); g.addColorStop(0,"rgba(200,160,255,.9)"); g.addColorStop(1,"rgba(255,240,200,.9)"); c.fillStyle=g; c.fillRect(gx-w/2*open,gy-h,w*open,h);
      c.shadowBlur=0; for(let i=0;i<3;i++){ const q=((t/400)+i/3)%1; atGlowA(c,gx+(i-1)*w*0.2,gy-h*(0.2+q*0.7),R*0.12,[255,250,220],open*(1-q)); }
      c.fillStyle="#6b4fa0"; c.fillRect(gx-w/2-4,gy-h-6,w+8,6); c.restore(); atImpact(t,800,0.3,0.15); atImpact(t,1150,0.5,0.1); }},
  /* Yog-Sothoth's Globe Storm: the glowing globes that orbit it fly out one after another and crash into the target */
  sg_globestorm:{C:500,D:1600,
    atk:t=>({pose:t<1200?"cast":"idle",off:[t<1200?Math.sin(t/30):0,0]}),
    def(t){ if(t<500||t>1250) return null; const p=((t-500)%125)/125; return {off:[(1-p)*6,0],pose:"hurt",flash:p<0.3?2:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, cols=[[255,140,200],[200,220,255],[255,240,160],[190,150,255],[150,240,230],[255,170,140]];
      for(let i=0;i<6;i++){ const t0=200+i*125, k=(t-t0)/300; const orb=t<t0; if(orb&&t<1250){ const an=t/400+i*1.05; atGlowA(c,s.x+Math.cos(an)*s.r*1.3,s.y-s.r*0.6+Math.sin(an)*s.r*0.5,s.r*0.25,cols[i],0.9); continue; }
        if(k<0||k>1.4) continue; if(k<=1){ const px=s.x+(tg.x-s.x)*ei(k), py=s.y-s.r*0.6+(tg.y-R*0.3-(s.y-s.r*0.6))*ei(k)-Math.sin(k*Math.PI)*R*1.2*(i%2?1:-0.6); atGlowA(c,px,py,R*0.32,cols[i],0.95); atGlowA(c,px,py,R*0.12,[255,255,255],1); }
        else { const q=(k-1)/0.4; SG.ring(c,tg.x,tg.y-R*0.3,R*(0.3+0.9*q),R*(0.3+0.9*q),cols[i],3,1-q); } }
      for(let i=0;i<6;i++) atImpact(t,500+i*125,0.18,0.03); }},
  /* Cthulhu's Dream Call: the arena dims, a vast shadow of its own head rises behind the target, its eyes open, and the dread lands */
  sg_dreamcall:{C:1000,D:1800,
    atk:t=>({pose:atPose(t<1400?"cast":"idle",{eyes:t<900?"shut":undefined}),arc:t<1400?-6*Math.sin(t/250):0}),
    def:t=>t>=1000&&t<1600?{off:[Math.sin(t/14)*2,0],pose:"hurt",sy:0.95}:null,
    fx(c,t,x){ const tg=x.target, R=tg.r, W=x.W||1000, H=x.H||800; if(t<150||t>1750) return; const dim=t<500?(t-150)/350:t<1400?1:1-(t-1400)/350, rise=t<900?eio(Math.max(0,(t-300)/600)):1;
      c.save(); c.fillStyle=`rgba(10,6,24,${0.45*dim})`; c.fillRect(0,0,W,H);
      const hx=tg.x, hy=tg.foot-R*(1+3.2*rise), hr=R*2.1; c.globalAlpha*=dim*0.85; c.fillStyle="rgba(30,20,60,.95)"; c.beginPath(); c.ellipse(hx,hy,hr*0.9,hr*1.1,0,0,7); c.fill();
      c.strokeStyle="rgba(30,20,60,.95)"; c.lineCap="round"; for(let i=0;i<6;i++){ const sx=hx+(i-2.5)*hr*0.28; c.lineWidth=hr*0.16*(1-Math.abs(i-2.5)*0.12); c.beginPath(); c.moveTo(sx,hy+hr*0.6); c.quadraticCurveTo(sx+Math.sin(t/200+i)*hr*0.3,hy+hr*1.4,sx+Math.sin(t/150+i)*hr*0.2,hy+hr*2.1); c.stroke(); }
      if(t>900){ const e=Math.min(1,(t-900)/150); for(const sd of [-1,1]) atGlowA(c,hx+sd*hr*0.32,hy-hr*0.1,hr*0.22*e,[255,60,80],1); }
      c.restore(); atImpact(t,1000,0.5,0.12); }},
  /* Cthulhu's Sunken Rise: the ground floods, it rises high out of the water and comes down claws first on the target in a huge splash */
  sg_sunkenrise:{C:1050,D:1800,
    atk:t=>{ if(t<350){ const k=eo(t/350); return {sy:1-0.12*k,sx:1+0.06*k,arc:10*k,pose:"crouch",alpha:1-0.3*k}; } if(t<800){ const k=eo((t-350)/450); return {f:0.4*k,arc:10-150*k,pose:"slamup",alpha:0.7+0.3*k}; }
      if(t<1050){ const k=ei((t-800)/250); return {f:0.4+0.38*k,arc:-140+140*k,pose:"slam"}; } if(t<1250) return {f:0.78,pose:"slam",sy:0.9}; const k=(t-1250)/550; return {f:0.78*(1-eio(k)),arc:-30*Math.sin(Math.min(1,k)*Math.PI),pose:"idle"}; },
    def:t=>SG.knock(t,1050,1,50,600),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r; if(t<1600){ const a=t<200?t/200:t<1300?1:1-(t-1300)/300; c.save(); c.globalAlpha*=a*0.6; c.fillStyle="#2a6ab0"; c.beginPath(); c.ellipse((s.x+tg.x)/2,Math.max(s.foot,tg.foot)+2,Math.abs(tg.x-s.x)*0.9+R*1.5,R*0.35,0,0,7); c.fill(); c.restore();
        for(let i=0;i<4;i++){ const ph=((t/600)+i/4)%1; SG.ring(c,(s.x+tg.x)/2,Math.max(s.foot,tg.foot)+2,Math.abs(tg.x-s.x)*0.5*ph+R,R*0.25*ph+3,[200,235,255],2,0.7*(1-ph)*a); } }
      if(t>=350&&t<800){ const k=(t-350)/450; for(let i=0;i<8;i++){ const ph=(k+i/8)%1; c.fillStyle=`rgba(170,220,255,${1-ph})`; c.beginPath(); c.arc(s.x+(i-3.5)*s.r*0.25,s.foot-ph*s.r*2.5,s.r*0.07,0,7); c.fill(); } }
      if(t>=1050&&t<1600){ const k=(t-1050)/550; for(let i=0;i<16;i++){ const a=-Math.PI*(0.08+0.84*atH(i*5)), sp=R*(0.6+2.6*eo(k)); c.fillStyle=`rgba(170,225,255,${0.9*(1-k)})`; c.beginPath(); c.arc(tg.x+Math.cos(a)*sp,tg.foot+Math.sin(a)*sp+k*k*R*2.4,R*0.1,0,7); c.fill(); } for(const sd of [-1,1]){ c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=3; for(let j=0;j<3;j++){ c.beginPath(); c.moveTo(tg.x+sd*R*(0.2+j*0.2),tg.y-R*0.9); c.lineTo(tg.x+sd*R*(0.05+j*0.2),tg.y+R*0.1); c.stroke(); } } }
      atImpact(t,1050,0.8,0.15); }}
});
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
  sg_tidalgrasp:(d,t)=>{ dNoise(d,t+0.2,0.6,0.14,'lowpass',600); dNoise(d,t+0.5,0.3,0.1,'bandpass',500,0.6); dKick(d,t+0.88,1); dNoise(d,t+0.88,0.6,0.3,'lowpass',900); },
  sg_fishersong:(d,t)=>{ [392,440,494,523,494,440].forEach((f,i)=>sTone(d,t+0.05+i*0.14,'sine',f,f,0.2,0.06)); dNoise(d,t+0.5,0.6,0.16,'lowpass',700); dKick(d,t+1.0,0.7); dNoise(d,t+1.0,0.6,0.25,'lowpass',900); },
  sg_kidstampede:(d,t)=>{ for(let i=0;i<14;i++) dKick(d,t+0.26+i*0.06,0.12); for(let j=0;j<4;j++) sTone(d,t+0.56+j*0.15,'sawtooth',520,420,0.12,0.03); },
  sg_blackgrove:(d,t)=>{ for(let i=0;i<7;i++) dNoise(d,t+0.3+i*0.06,0.2,0.12,'lowpass',300+i*30); dNoise(d,t+0.9,0.3,0.14,'bandpass',500,0.8); sTone(d,t+0.9,'sine',120,80,0.6,0.06); },
  sg_gateknock:(d,t)=>{ [0.3,0.65,1.0].forEach((x,i)=>{ dKick(d,t+x,0.6+i*0.25); dNoise(d,t+x,0.3,0.2+i*0.06,'lowpass',300); }); },
  sg_splitmaw:(d,t)=>{ dNoise(d,t+0.42,0.3,0.12,'bandpass',300,0.6); sTone(d,t+0.42,'sawtooth',80,60,0.3,0.05); dKick(d,t+0.72,0.9); dNoise(d,t+0.72,0.12,0.4,'bandpass',1500,1.5); },
  sg_manyeyes:(d,t)=>{ for(let i=0;i<11;i++) dNoise(d,t+0.25+i*0.045,0.03,0.08,'bandpass',2500,3); sTone(d,t+0.82,'sine',220,110,0.6,0.07); sTone(d,t+0.82,'sine',233,117,0.6,0.05); },
  sg_swallowwhole:(d,t)=>{ dNoise(d,t+0.1,0.5,0.14,'lowpass',500); sTone(d,t+0.64,'sine',300,90,0.5,0.06); for(let i=0;i<5;i++) sTone(d,t+0.8+i*0.15,'sine',300+i*80,500+i*80,0.06,0.03); dNoise(d,t+1.5,0.2,0.2,'bandpass',700,0.8); },
  sg_curtaincall:(d,t)=>{ dNoise(d,t+0.4,0.4,0.1,'bandpass',800,0.5); dKick(d,t+0.82,0.3); [0.9,1.1,1.3].forEach((x,i)=>sTone(d,t+x,'sine',600-i*100,500-i*100,0.25,0.04)); },
  sg_tatteredcloak:(d,t)=>{ dNoise(d,t+0.2,0.7,0.1,'bandpass',600,0.5); sTone(d,t+0.9,'sawtooth',110,104,0.6,0.04); sTone(d,t+0.9,'triangle',880,860,0.5,0.03); },
  sg_gateopen:(d,t)=>{ sTone(d,t+0.15,'sine',200,800,0.4,0.05); dNoise(d,t+0.8,0.1,0.25,'lowpass',500); dKick(d,t+0.8,0.5); sTone(d,t+1.15,'sine',800,300,0.3,0.05); dKick(d,t+1.15,0.6); },
  sg_globestorm:(d,t)=>{ for(let i=0;i<6;i++){ sTone(d,t+0.2+i*0.125,'sine',800+i*120,500,0.15,0.04); dKick(d,t+0.5+i*0.125,0.2); } },
  sg_dreamcall:(d,t)=>{ sTone(d,t+0.15,'sine',55,50,1.4,0.1); sTone(d,t+0.15,'sine',82,78,1.4,0.06); dNoise(d,t+0.3,1.0,0.06,'lowpass',200); sTone(d,t+1.0,'sawtooth',110,90,0.5,0.05); },
  sg_sunkenrise:(d,t)=>{ dNoise(d,t+0.05,0.4,0.12,'lowpass',500); sTone(d,t+0.35,'sine',100,300,0.45,0.05); dKick(d,t+1.05,1.1); dNoise(d,t+1.05,0.8,0.3,'lowpass',900); }
});
