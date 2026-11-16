/* Signature attacks for every family (16 Nov 2026). Each signature plays after its wind-up (AT_WINDS in arena-fx.js)
   as its own animation, with its own sound and its own reaction on the target. Timings: C is the frame the move lands,
   and the fight moves on at most 700 ms after it, so everything here settles by C+700. */
const SG={};
/* shared pieces */
SG.jaws=(c,x,y,W,open,col,a=1)=>{ const H=W*0.5, gap=W*0.6*open; c.save(); c.globalAlpha*=a;
  for(const s of [-1,1]){ c.save(); c.translate(x,y+s*gap); const a0=s<0?Math.PI:0, a1=s<0?Math.PI*2:Math.PI;
    c.fillStyle=atRgba(col,1); c.strokeStyle="rgba(60,20,30,.7)"; c.lineWidth=3; c.beginPath(); c.ellipse(0,0,W,H,0,a0,a1); c.closePath(); c.fill(); c.stroke();
    c.fillStyle="rgba(255,255,255,.35)"; c.beginPath(); c.ellipse(-W*0.35,s*H*0.6,W*0.3,H*0.12,0,0,7); c.fill();
    c.fillStyle="#c23a52"; c.beginPath(); c.ellipse(0,0,W*0.88,H*0.3,0,a0,a1); c.closePath(); c.fill();
    c.fillStyle="#fffdf6"; c.strokeStyle="rgba(120,90,100,.7)"; c.lineWidth=1.3;
    for(let i=0;i<7;i++){ const tx=-W*0.78+i*W*1.56/6, tw=W*0.12, th=H*(i===1||i===5?0.75:0.45); c.beginPath(); c.moveTo(tx-tw,0); c.lineTo(tx,-s*th); c.lineTo(tx+tw,0); c.closePath(); c.fill(); c.stroke(); }
    c.restore(); } c.restore(); };
SG.shard=(c,x,y,z,rot,col)=>{ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=col; c.beginPath(); c.moveTo(-z,-z*0.4); c.lineTo(z*0.2,-z); c.lineTo(z,z*0.3); c.lineTo(-z*0.3,z*0.8); c.closePath(); c.fill();
  c.strokeStyle="rgba(255,255,255,.6)"; c.lineWidth=1; c.stroke(); c.restore(); };
SG.puff=(c,x,y,r,a,col=[250,250,252])=>{ if(a<=0||r<=0) return; c.save(); c.globalAlpha*=a; const g=c.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r); g.addColorStop(0,atRgba(col,1)); g.addColorStop(1,atRgba(col.map(v=>v-30),0.85));
  c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.restore(); };
SG.ring=(c,x,y,rx,ry,col,w,a)=>{ if(a<=0) return; c.strokeStyle=atRgba(col,a); c.lineWidth=w; c.beginPath(); c.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,7); c.stroke(); };
SG.cracks=(c,x,y,L,n,seed,a)=>{ if(a<=0) return; c.save(); c.lineCap="round"; c.lineJoin="round"; for(let i=0;i<n;i++){ const an=i/n*Math.PI*2+seed; c.strokeStyle=`rgba(50,32,22,${0.8*a})`; c.lineWidth=3;
    c.beginPath(); c.moveTo(x,y); for(let j=1;j<=3;j++){ const dd=L*j/3*(0.7+0.3*atH(i*7+j+seed)), w=(atH(i*3+j)-0.5)*0.6; c.lineTo(x+Math.cos(an+w)*dd,y+Math.sin(an+w)*dd*0.3); } c.stroke(); } c.restore(); };
SG.dust=(c,x,y,R,k,n=8)=>{ if(k<0||k>1) return; for(let i=0;i<n;i++){ const sd=i%2?1:-1, r=R*(0.5+k*1.4)*(0.7+0.3*atH(i)); SG.puff(c,x+sd*r,y-R*0.15-k*R*0.4*atH(i*3),R*(0.2+0.25*k),(1-k)*0.8,[226,212,190]); } };
SG.stars=(c,x,y,R,t,n=3,col="#ffe25a")=>{ for(let i=0;i<n;i++){ const a=t/260+i*Math.PI*2/n; atStar4(c,x+Math.cos(a)*R,y+Math.sin(a)*R*0.35,R*0.22,col); } };
SG.glove=(c,x,y,z,d,col,a=1)=>{ c.save(); c.translate(x,y); c.scale(d,1); c.globalAlpha*=a; c.fillStyle=atRgba(col,1); c.strokeStyle="rgba(70,20,20,.7)"; c.lineWidth=2;
  c.beginPath(); c.ellipse(0,0,z,z*0.82,0,0,7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(-z*0.2,-z*0.62,z*0.42,z*0.3,-0.4,0,7); c.fill(); c.stroke();
  c.fillStyle="#f4f0ea"; c.fillRect(-z*1.45,-z*0.45,z*0.5,z*0.9); c.strokeRect(-z*1.45,-z*0.45,z*0.5,z*0.9);
  c.fillStyle="rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(z*0.25,-z*0.25,z*0.35,z*0.2,-0.5,0,7); c.fill(); c.restore(); };
SG.bottle=(c,x,y,z,rot,liq,cork=true)=>{ c.save(); c.translate(x,y); c.rotate(rot);
  c.fillStyle=atRgba(liq,0.9); c.beginPath(); c.arc(0,z*0.3,z*0.75,0,7); c.fill(); c.fillStyle="rgba(220,240,255,.35)"; c.beginPath(); c.arc(0,z*0.3,z*0.8,0,7); c.fill();
  c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=1.6; c.beginPath(); c.arc(0,z*0.3,z*0.8,0,7); c.stroke(); c.fillStyle="rgba(220,240,255,.5)"; c.fillRect(-z*0.22,-z*0.75,z*0.44,z*0.5); c.strokeRect(-z*0.22,-z*0.75,z*0.44,z*0.5);
  if(cork){ c.fillStyle="#b07a48"; c.fillRect(-z*0.26,-z*1.0,z*0.52,z*0.3); } c.fillStyle="rgba(255,255,255,.8)"; c.beginPath(); c.ellipse(-z*0.35,z*0.05,z*0.14,z*0.26,-0.4,0,7); c.fill(); c.restore(); };
SG.down=(c,x,y,z,col,a)=>{ if(a<=0) return; c.save(); c.globalAlpha*=a; c.fillStyle=col; c.beginPath(); c.moveTo(x-z*0.35,y-z); c.lineTo(x+z*0.35,y-z); c.lineTo(x+z*0.35,y-z*0.2); c.lineTo(x+z*0.7,y-z*0.2); c.lineTo(x,y+z*0.6); c.lineTo(x-z*0.7,y-z*0.2); c.lineTo(x-z*0.35,y-z*0.2); c.closePath(); c.fill();
  c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=1.5; c.stroke(); c.restore(); };
SG.sweat=(c,x,y,z,a)=>{ if(a<=0) return; c.save(); c.globalAlpha*=a; c.fillStyle="#8fd3ff"; c.beginPath(); c.moveTo(x,y-z); c.quadraticCurveTo(x+z*0.7,y,x,y+z*0.5); c.quadraticCurveTo(x-z*0.7,y,x,y-z); c.fill(); c.restore(); };
/* how a hit target reacts: squashed by a blow from above, knocked back, or shaking */
SG.squash=(t,C,amt=0.3,len=500)=>{ if(t<C||t>C+len) return null; const a=1-eo((t-C)/len); return {sx:1+amt*0.6*a,sy:1-amt*a,pose:"hurt",off:[Math.sin(t/14)*3*a,0]}; };
SG.knock=(t,C,d,amt=22,len=480)=>{ if(t<C||t>C+len) return null; const a=1-eo((t-C)/len); return {off:[d*amt*a,0],rot:d*0.18*a,pose:"hit"}; };
SG.shake=(t,C,len=600,amt=3)=>{ if(t<C||t>C+len) return null; return {off:[Math.sin(t/13)*amt,0],pose:"hurt",flash:Math.floor(t/90)%2?2:0}; };

/* an irregular ink or paint blot: a lumpy ring with a few spikes and drops flung round it; flat squashes it onto the floor */
SG.splat=(c,x,y,r,seed,col,a=1,flat=1)=>{ if(a<=0||r<=0.5) return; c.save(); c.globalAlpha*=a; c.translate(x,y); c.scale(1,flat); c.fillStyle=atRgba(col,1); c.beginPath();
  const N=18; for(let j=0;j<=N;j++){ const q=j/N*Math.PI*2, sp=atH(seed*31+j)>0.8?1.55:1, rr=r*(0.7+0.35*atH(seed*17+j))*sp; c[j?"lineTo":"moveTo"](Math.cos(q)*rr,Math.sin(q)*rr); } c.closePath(); c.fill();
  for(let j=0;j<5;j++){ const q=atH(seed*7+j)*Math.PI*2, d2=r*(1.3+0.6*atH(seed+j*3)); c.beginPath(); c.arc(Math.cos(q)*d2,Math.sin(q)*d2,r*(0.08+0.1*atH(seed*5+j)),0,7); c.fill(); }
  c.fillStyle="rgba(180,160,230,.35)"; c.beginPath(); c.ellipse(-r*0.25,-r*0.3,r*0.3,r*0.14,-0.5,0,7); c.fill(); c.restore(); };
/* a soft see-through blob of fog or genie smoke, brightest in the middle and fading to nothing at the edge */
SG.fog=(c,x,y,r,col,a)=>{ if(a<=0||r<=0.5) return; const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,atRgba(col,a)); g.addColorStop(0.55,atRgba(col,a*0.55)); g.addColorStop(1,atRgba(col,0)); c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); };
Object.assign(ANIM,{
  /* Chomp: it springs at the target and a pair of jaws ten times its size closes over it, grinds twice and lets go */
  sg_crunch:{C:780,D:1460,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      if(t<300){ const k=eo(t/300); return {f:-0.08*k,sx:1+0.16*k,sy:1-0.22*k,pose:"crouch"}; }
      if(t<780){ const k=(t-300)/480, g=eo(k); return {f:-0.08+0.66*eio(k),arc:-50*Math.sin(k*Math.PI),sx:1+0.55*g,sy:1+0.6*g,rot:d*0.15*k,pose:"bitewide"}; }
      if(t<1120){ const k=(t-780)/340, gr=Math.sin(k*Math.PI*3); return {f:0.58,sx:1.5+0.08*gr,sy:1.42-0.1*gr,off:[Math.sin(t/14)*3,0],pose:"chomp"}; }
      const k=(t-1120)/340; return {f:0.58*(1-eio(k)),sx:1.5-0.5*eo(k),sy:1.42-0.42*eo(k),arc:-26*Math.sin(Math.min(1,k)*Math.PI),pose:k<0.4?"bitewide":"happy"}; },
    def(t){ if(t<780||t>1350) return null; const g=t<1080?1:1-(t-1080)/270, gr=Math.floor((t-780)/120)%2; return {sx:1+0.12*g,sy:1-0.24*g-(gr?0.05:0),off:[Math.sin(t/12)*3*g,0],pose:"hurt"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, cy=tg.y-R*0.05, col=(x.col||[240,200,90]).map(v=>Math.min(255,v*0.55+110));
      if(t>500&&t<780){ const k=(t-500)/280; c.strokeStyle=`rgba(255,255,255,${0.6*k})`; c.lineWidth=3; for(let i=0;i<5;i++){ const yy=cy+(i-2)*R*0.3; c.beginPath(); c.moveTo(tg.x-R*(1.8-0.4*k),yy); c.lineTo(tg.x-R*(2.6-0.4*k),yy); c.stroke(); } }
      atImpact(t,780,0.8,0.35); atImpact(t,900,0.35,0); atImpact(t,1020,0.35,0);
      for(const T0 of [780,900,1020]){ const k=(t-T0)/260; if(k>=0&&k<1) chompMarks(c,{x:tg.x+(T0-900)/120*R*0.25,y:cy+(T0===900?-R*0.2:R*0.1)},k); }
      if(t>=780&&t<1400){ const k=(t-780)/620;
        for(let i=0;i<12;i++){ const a=-Math.PI*(0.1+0.8*atH(i*5)), sp=R*(0.6+1.6*k)*(0.7+0.5*atH(i)); SG.shard(c,tg.x+Math.cos(a)*sp*(i%2?1:-1),cy+Math.sin(a)*sp+k*k*R*1.6,R*0.09*(1-k*0.4),t/80+i,i%3?"#fff6e0":atRgba(col,1)); }
        atPow(c,{x:tg.x,y:cy-R*0.9},Math.min(1,(t-780)/420),R/24); } }},
  /* Squib: it puffs up to twice its size and sprays a wide fan of ink, ragged gobs and droplets that splatter the target and the floor in irregular blots */
  sg_inkjet:{C:700,D:1400,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<380){ const k=eo(t/380); return {sx:1+0.22*k,sy:1+0.16*k,rot:-d*0.15*k,pose:"cast"}; }
      if(t<1150) return {sx:1.12-0.06*Math.sin(t/22),sy:0.96+0.03*Math.sin(t/22),off:[-d*5,0],rot:-d*0.05+Math.sin(t/30)*0.06,pose:"push"}; const k=(t-1150)/250; return {sx:1.12-0.12*k,sy:0.96+0.04*k,pose:"idle"}; },
    def(t){ if(t<700||t>1400) return null; const a=1-eo((t-700)/700); return {off:[16*a+Math.sin(t/25)*2,0],pose:"hurt",sx:1+0.06*a,sy:1-0.06*a}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), INK=[38,28,64], HI=[150,120,220], src={x:s.x+d*s.r*0.85,y:s.y+s.r*0.05}, L=Math.abs(tg.x-src.x)+R*1.4;
      if(t<380){ for(let i=0;i<6;i++){ const ph=((t/260)+i/6)%1; c.fillStyle=atRgba(INK,1-ph); c.beginPath(); c.arc(src.x+d*ph*R*0.4,src.y-ph*R*0.3+(atH(i)-0.5)*R*0.3,R*0.05*(1+ph),0,7); c.fill(); } return; }
      /* the spray: each gob leaves the mouth at its own angle inside a 50 degree fan and flies straight, stretched along its path */
      const fan=0.62, out=t<1150?1:Math.max(0,1-(t-1150)/250);
      for(let i=0;i<96;i++){ const born=380+i*7.5, age=(t-born)/340; if(age<0||age>1.05||born>1150) continue; const a=(atH(i*3)-0.5)*2*fan+(atH(i*7)-0.5)*0.15, sp=L*age*(0.85+0.3*atH(i*5)), px=src.x+d*Math.cos(a)*sp, py=src.y+Math.sin(a)*sp+age*age*R*0.6;
        const z=R*(0.06+0.17*Math.pow(atH(i*11),2))*(0.7+0.7*age), str=1.6+atH(i*13)*1.6; c.save(); c.translate(px,py); c.rotate(d>0?a:Math.PI-a); c.globalAlpha=out;
        c.fillStyle=atRgba(INK,1); c.beginPath(); c.ellipse(0,0,z*str,z,0,0,7); c.fill(); c.beginPath(); c.ellipse(-z*str*0.9,0,z*str*0.5,z*0.45,0,0,7); c.fill();
        if(i%4===0){ c.fillStyle=atRgba(HI,0.6); c.beginPath(); c.ellipse(z*0.2,-z*0.35,z*str*0.35,z*0.2,0,0,7); c.fill(); } c.restore(); }
      /* floor splatter along the spray */
      const fl=Math.min(1,Math.max(0,(t-450)/500)); for(let i=0;i<9;i++){ const q=0.3+0.65*atH(i*17); if(q>fl) continue; SG.splat(c,src.x+d*(L*q),tg.foot+(atH(i*5)-0.5)*R*0.3,R*(0.12+0.15*atH(i)),i+3,INK,0.85*(t>1250?Math.max(0,1-(t-1250)/150):1),0.35); }
      if(t>=700){ const k=Math.min(1,(t-700)/700); atImpact(t,700,0.55,0); const fade=t>1250?Math.max(0,1-(t-1250)/150):1;
        for(let i=0;i<8;i++){ const bx=tg.x+(atH(i*3)-0.5)*R*1.5, by=tg.y+(atH(i*7)-0.5)*R*1.3, br=R*(0.16+0.18*atH(i)); const g=Math.min(1,(t-700-i*25)/120); if(g<=0) continue;
          SG.splat(c,bx,by,br*eo(g),i,INK,0.95*fade,1); const dr=Math.min(1,k*1.6)*R*(0.3+0.5*atH(i*11)); c.fillStyle=atRgba(INK,0.95*fade); c.fillRect(bx-br*0.12,by,br*0.24,dr); c.beginPath(); c.arc(bx,by+dr,br*0.17,0,7); c.fill(); }
        for(let i=0;i<16;i++){ const a=atH(i*9)*Math.PI*2, sp=R*(0.8+1.4*eo(k))*(0.6+0.6*atH(i)); c.fillStyle=atRgba(INK,(1-k)*0.9); c.beginPath(); c.arc(tg.x+Math.cos(a)*sp,tg.y+Math.sin(a)*sp*0.8+k*k*R,R*(0.03+0.05*atH(i*2)),0,7); c.fill(); } } }},
  /* Antik: its screen floods with static, it beams the picture onto the target, the target is trapped in a TV of static and colour bars, then the set switches off */
  sg_static:{C:760,D:1460,sig:true,
    atk:t=>({pose:t<760?"cast":t<1300?"push":"idle",off:[t<760?(atH(Math.floor(t/40))-0.5)*5:0,0],flash:0,sx:1+0.04*Math.sin(t/25)}),
    def(t){ if(t<760||t>1400) return null; return {off:[(atH(Math.floor(t/35))-0.5)*8,0],pose:"hurt",flash:Math.floor(t/70)%2?3:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, W=R*1.5, H=R*1.25, fr=Math.floor(t/45), cy=tg.y-R*0.05;
      if(t<760){ const k=eo(t/760); c.save(); c.globalCompositeOperation="lighter"; c.fillStyle=`rgba(200,230,255,${0.18*k})`; c.beginPath(); c.moveTo(s.x,s.y-s.r*0.5); c.lineTo(s.x,s.y+s.r*0.3);
          c.lineTo(s.x+(tg.x-s.x)*k,cy+H*k); c.lineTo(s.x+(tg.x-s.x)*k,cy-H*k); c.closePath(); c.fill(); c.restore();
        for(let i=0;i<10;i++){ const q=((t/300)+i/10)%1; c.fillStyle=`rgba(255,255,255,${0.6*(1-q)})`; c.fillRect(s.x+(tg.x-s.x)*q*k,cy+(atH(i*9+fr)-0.5)*H*2*q,4,2); } return; }
      atImpact(t,760,0.5,0.3);
      const open=Math.min(1,(t-760)/120), off=t>1240?Math.min(1,(t-1240)/180):0, sy=off<0.6?1-off/0.6:0.02, sx=off<0.6?1:1-(off-0.6)/0.4; if(sx<=0) return;
      const w=W*open*sx, h=H*open*sy; c.save();
      c.fillStyle="#2a2630"; c.strokeStyle="#8c7a62"; c.lineWidth=5; c.beginPath(); c.roundRect?c.roundRect(tg.x-w-6,cy-h-6,(w+6)*2,(h+6)*2,10):c.rect(tg.x-w-6,cy-h-6,(w+6)*2,(h+6)*2); c.fill(); c.stroke();
      c.beginPath(); c.rect(tg.x-w,cy-h,w*2,h*2); c.clip();
      const bars=t>900&&t<1050&&Math.floor(t/50)%2===0;
      if(bars){ const cs=["#fff","#ff0","#0ff","#0f0","#f0f","#f00","#00f"]; cs.forEach((cc,i)=>{ c.fillStyle=cc; c.fillRect(tg.x-w+i*w*2/7,cy-h,w*2/7+1,h*2); }); }
      else { const cell=Math.max(3,R*0.09); for(let yy=cy-h;yy<cy+h;yy+=cell) for(let xx=tg.x-w;xx<tg.x+w;xx+=cell){ const v=Math.floor(atH(xx*0.37+yy*1.71+fr*13.1)*255); c.fillStyle=`rgba(${v},${v},${v},0.62)`; c.fillRect(xx,yy,cell,cell); } }
      c.fillStyle="rgba(0,0,0,.25)"; for(let yy=cy-h;yy<cy+h;yy+=4) c.fillRect(tg.x-w,yy,w*2,1.5);
      for(let b=0;b<2;b++){ const by=cy-h+((t/3+b*h)%(h*2)); c.fillStyle="rgba(255,255,255,.22)"; c.fillRect(tg.x-w,by,w*2,h*0.12); }
      c.restore(); c.strokeStyle="#5a4a3a"; c.lineWidth=2; c.strokeRect(tg.x-w,cy-h,w*2,h*2);
      if(off>0.6){ c.save(); c.globalCompositeOperation="lighter"; atWisp(c,tg.x,cy,R*0.3*(1-(off-0.6)/0.4),[220,240,255]); c.restore(); }
      if(t>800&&t<1240){ c.save(); c.globalCompositeOperation="lighter"; c.strokeStyle="rgba(170,220,255,.9)"; c.lineWidth=2.5; for(let i=0;i<2;i++){ const a={x:tg.x-w-6,y:cy-h*0.5+i*h}, b={x:tg.x+w+6,y:cy-h*0.3+i*h*0.7}; atZig(c,a,b,6,R*0.3,fr+i*5); } c.restore(); } }},
  /* Moko: its eye narrows, a giant copy of the eye opens over the target and stares it down, the target shrinks and its stats drop */
  sg_glare:{C:700,D:1380,sig:true,
    atk:t=>({pose:"cast",sx:1+0.08*Math.min(1,t/300),sy:1+0.06*Math.min(1,t/300)-(t>700&&t<1100?0.04*Math.sin((t-700)/50):0),off:[0,0]}),
    def(t){ if(t<700||t>1380) return null; const a=Math.min(1,(t-700)/200)*(t>1200?1-(t-1200)/180:1); return {sx:1-0.1*a,sy:1-0.12*a,off:[Math.sin(t/20)*2*a,3*a],pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, ex=tg.x-atDir(x)*R*1.35, ey=tg.y-R*0.35, ER=R*0.85, open=t<380?0:t<700?eo((t-380)/320):t<1180?1:1-eo((t-1180)/200);
      if(t<700){ c.save(); c.globalCompositeOperation="lighter"; c.strokeStyle=`rgba(255,80,80,${0.5*Math.min(1,t/400)})`; c.lineWidth=2; for(const o of [-1,1]){ c.beginPath(); c.moveTo(s.x,s.y-s.r*0.2); c.lineTo(ex,ey+o*ER*0.15*open); c.stroke(); } c.restore(); }
      if(open>0.01){ c.save(); c.fillStyle="rgba(30,10,30,.35)"; c.beginPath(); c.ellipse(ex,ey,ER*1.3,ER*0.75*Math.max(0.2,open),0,0,7); c.fill();
        c.beginPath(); c.ellipse(ex,ey,ER,ER*0.62*open,0,0,7); c.clip(); c.fillStyle="#fffaf4"; c.fillRect(ex-ER,ey-ER,ER*2,ER*2);
        c.strokeStyle="rgba(220,60,70,.55)"; c.lineWidth=1.3; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; c.beginPath(); c.moveTo(ex+Math.cos(a)*ER,ey+Math.sin(a)*ER*0.6); c.quadraticCurveTo(ex+Math.cos(a+0.3)*ER*0.7,ey+Math.sin(a+0.3)*ER*0.45,ex+Math.cos(a)*ER*0.45,ey+Math.sin(a)*ER*0.3); c.stroke(); }
        const lk=(atDir(x)<0?1:-1)*ER*0.12, ir=ER*0.45; const g=c.createRadialGradient(ex+lk,ey,ir*0.2,ex+lk,ey,ir); g.addColorStop(0,"#ffb03a"); g.addColorStop(1,"#c2272d"); c.fillStyle=g; c.beginPath(); c.arc(ex+lk,ey,ir,0,7); c.fill();
        c.fillStyle="#140810"; c.beginPath(); c.ellipse(ex+lk,ey,ir*0.18,ir*0.8,0,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.9)"; c.beginPath(); c.arc(ex+lk-ir*0.4,ey-ir*0.4,ir*0.18,0,7); c.fill(); c.restore();
        c.strokeStyle="#3a1a2a"; c.lineWidth=4; c.beginPath(); c.ellipse(ex,ey,ER,ER*0.62*open,0,0,7); c.stroke();
        c.lineWidth=3; c.beginPath(); c.moveTo(ex-ER*1.05,ey-ER*0.55*open-4); c.quadraticCurveTo(ex,ey-ER*0.95*open-6,ex+ER*1.05,ey-ER*0.4*open-8); c.stroke(); }
      if(t>=700&&t<1300){ const k=(t-700)/600; c.save(); c.strokeStyle=`rgba(120,20,60,${0.6*(1-k)})`; c.lineWidth=2.5; for(let i=0;i<10;i++){ const a=Math.PI*0.15+i/9*Math.PI*0.7, r0=ER*0.7, r1=ER*(1.1+k*0.8); c.beginPath(); c.moveTo(ex+Math.cos(a)*r0,ey+Math.sin(a)*r0); c.lineTo(ex+Math.cos(a)*r1,ey+Math.sin(a)*r1); c.stroke(); } c.restore();
        for(let i=0;i<3;i++){ const kk=Math.min(1,Math.max(0,(t-760-i*120)/400)); SG.down(c,tg.x+(i-1)*R*0.7,tg.y-R*0.3+kk*R*0.6,R*0.22,"#5b6cff",kk>0?1-kk*kk:0); }
        SG.sweat(c,tg.x+R*0.6,tg.top.y+R*0.2+k*R*0.3,R*0.12,1-k); } }},
  /* Pinch: it digs into the sand, armour plates fly in and lock into a dome over it, and the dome flashes */
  sg_bunker:{C:520,D:1150,sig:true,
    atk:t=>{ const k=eo(Math.min(1,t/300)), un=t>950?eo((t-950)/200):0; return {sx:1+0.2*k*(1-un),sy:1-0.3*k*(1-un),pose:"crouch",off:[Math.sin(t/18)*(t<300?2:0),0]}; },
    def:()=>null,
    fx(c,t,x){ const s=x.self, R=s.r, cx=s.x, cy=s.foot-R*0.15, DR=R*1.35, out=t>1000?1-(t-1000)/150:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      SG.dust(c,cx,s.foot,R,Math.min(1,t/500),10);
      for(let i=0;i<9;i++){ const a=Math.PI+(i+0.5)/9*Math.PI, land=Math.min(1,Math.max(0,(t-60-i*35)/260)), fx2=cx+Math.cos(a)*DR, fy=cy+Math.sin(a)*DR*0.95, from={x:cx+Math.cos(a)*DR*3.2,y:cy+Math.sin(a)*DR*2.4};
        if(land<=0) continue; const p=lerpP(from,{x:fx2,y:fy},eo(land),0); c.save(); c.translate(p.x,p.y); c.rotate(a+Math.PI/2+(1-land)*3);
        const w=DR*0.36, h=DR*0.24; c.fillStyle="#d9c08a"; c.strokeStyle="#7a5a2e"; c.lineWidth=2; c.beginPath(); for(let j=0;j<6;j++){ const q=j/6*Math.PI*2; c.lineTo(Math.cos(q)*w*0.6,Math.sin(q)*h*0.8); } c.closePath(); c.fill(); c.stroke();
        c.fillStyle="rgba(255,255,255,.45)"; c.beginPath(); c.ellipse(-w*0.15,-h*0.25,w*0.25,h*0.18,0,0,7); c.fill(); c.restore(); }
      if(t>=520){ const k=Math.min(1,(t-520)/300); atImpact(t,520,0.3,0); c.save(); c.globalCompositeOperation="lighter"; c.strokeStyle=`rgba(255,240,190,${0.9*(1-k*0.6)})`; c.lineWidth=3; c.beginPath(); c.ellipse(cx,cy,DR,DR*0.95,0,Math.PI,Math.PI*2); c.stroke();
        c.fillStyle=`rgba(255,230,160,${0.15*(1-k)})`; c.beginPath(); c.ellipse(cx,cy,DR,DR*0.95,0,Math.PI,Math.PI*2); c.fill();
        const gx=cx+Math.cos(-2.2+k*1.4)*DR, gy=cy+Math.sin(-2.2+k*1.4)*DR*0.95; atStar4(c,gx,gy,R*0.35*Math.sin(k*Math.PI),"rgba(255,255,255,.95)"); c.restore(); }
      c.restore(); }},
  /* Stilt: it crouches, springs high into the air spinning, and drops an axe kick on the target's head that cracks the floor */
  sg_highkick:{C:840,D:1480,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      if(t<260){ const k=eo(t/260); return {sx:1+0.15*k,sy:1-0.25*k,pose:"crouch"}; }
      if(t<640){ const k=(t-260)/380; return {f:0.55*eio(k),arc:-110*Math.sin(Math.min(1,k*1.2)*Math.PI/2),rot:d*Math.PI*2*eio(k),sx:0.9,sy:1.12,pose:"jump"}; }
      if(t<840){ const k=ei((t-640)/200); return {f:0.55+0.05*k,arc:-110*(1-k),rot:d*0.55*k,sx:0.92,sy:1.1,pose:"punch"}; }
      const k=(t-840)/640; return {f:0.6*(1-eio(k)),arc:-20*Math.sin(Math.min(1,k*1.6)*Math.PI),rot:d*0.55*(1-eo(k)),pose:k<0.4?"land":"idle"}; },
    def:t=>SG.squash(t,840,0.34,560),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t>260&&t<640){ const k=(t-260)/380; c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<3;i++) atCrescent(c,s.x,s.y-s.r*0.2,s.r*(1.1+i*0.15),d*k*Math.PI*2-i*0.5,Math.min(0.95,k*0.9+i*0.03),x.col||[255,230,160]); c.restore(); }
      if(t>600&&t<860){ c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=2; for(let i=0;i<5;i++){ const lx=s.x+(i-2)*s.r*0.25; c.beginPath(); c.moveTo(lx,s.y-s.r*(1.4+0.3*(i%2))); c.lineTo(lx,s.y-s.r*0.6); c.stroke(); } }
      atImpact(t,840,0.9,0.4);
      if(t>=840){ const k=(t-840)/640; SG.cracks(c,tg.x,tg.foot,R*2.2,9,1.3,1-k*k); SG.ring(c,tg.x,tg.foot,R*(0.6+2*eo(k)),R*(0.18+0.5*eo(k)),[255,240,200],5*(1-k),1-k); SG.dust(c,tg.x,tg.foot,R,k*1.1,10);
        atPow(c,{x:tg.x,y:tg.top.y},Math.min(1,k*1.4),R/22); SG.stars(c,tg.x,tg.top.y-R*0.3,R*0.7,t,3); } }},
  /* Skit: it rears up and shoots a line of silk, a whole web blooms around the target, and the threads pull tight while it struggles */
  sg_web:{C:640,D:1340,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return t<380?{rot:-d*0.22*eo(t/380),arc:-8*eo(t/380),pose:"cast"}:t<1000?{rot:-d*0.1,off:[-d*3,0],pose:"push"}:{rot:-d*0.1*(1-(t-1000)/340),pose:"idle"}; },
    def(t){ if(t<640||t>1340) return null; return {rot:Math.sin(t/60)*0.12,off:[Math.sin(t/45)*3,0],sx:1-0.06,sy:1-0.04,pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, src={x:s.x,y:s.y-s.r*0.1}, cen={x:tg.x,y:tg.y-R*0.1}, WR=R*1.55;
      if(t>300&&t<760){ const k=Math.min(1,(t-300)/340), p=lerpP(src,cen,eo(k),R*0.8); c.strokeStyle="rgba(250,250,255,.95)"; c.lineWidth=2.5; c.beginPath(); c.moveTo(src.x,src.y);
        for(let j=1;j<=12;j++){ const q=lerpP(src,cen,eo(k)*j/12,R*0.8); c.lineTo(q.x,q.y); } c.stroke(); c.fillStyle="#fff"; c.beginPath(); c.arc(p.x,p.y,R*0.12*(k<1?1:0),0,7); c.fill(); }
      if(t<640) return; atImpact(t,640,0.4,0.15);
      const g=eo(Math.min(1,(t-640)/260)), tight=t>900?eo(Math.min(1,(t-900)/250)):0, out=t>1200?1-(t-1200)/140:1; if(out<=0) return; c.save(); c.globalAlpha=out; const rad=WR*g*(1-0.25*tight);
      c.strokeStyle="rgba(250,250,255,.9)"; c.lineWidth=2; const N=12;
      for(let i=0;i<N;i++){ const a=i/N*Math.PI*2; c.beginPath(); c.moveTo(cen.x,cen.y); c.lineTo(cen.x+Math.cos(a)*rad,cen.y+Math.sin(a)*rad*0.9); c.stroke(); }
      for(let r=1;r<=4;r++){ const rr=rad*r/4.2; c.lineWidth=1.6; c.beginPath(); for(let i=0;i<=N;i++){ const a=i/N*Math.PI*2, sag=i%1===0?0.92:1; const px=cen.x+Math.cos(a)*rr, py=cen.y+Math.sin(a)*rr*0.9;
          if(i){ const pa=(i-1)/N*Math.PI*2, mx=(cen.x+Math.cos(pa)*rr+px)/2, my=(cen.y+Math.sin(pa)*rr*0.9+py)/2; c.quadraticCurveTo(cen.x+(mx-cen.x)*sag*0.95,cen.y+(my-cen.y)*sag*0.95,px,py); } else c.moveTo(px,py); } c.stroke(); }
      for(let i=0;i<14;i++){ const a=atH(i*3)*7, rr=rad*(0.3+0.65*atH(i*5)); c.fillStyle="rgba(220,240,255,.9)"; c.beginPath(); c.arc(cen.x+Math.cos(a)*rr,cen.y+Math.sin(a)*rr*0.9,1.8,0,7); c.fill(); }
      if(tight>0){ c.strokeStyle="rgba(255,255,255,.85)"; c.lineWidth=2.4; for(let w=0;w<4;w++){ const yy=tg.top.y+(tg.foot-tg.top.y)*(0.25+w*0.18); c.beginPath(); c.ellipse(tg.x,yy,R*1.05*tight+1,R*0.18,0.12*(w%2?1:-1),0,7); c.stroke(); } }
      c.restore(); }},
  /* Booly: it goes see-through, wisps swirl round it and a ripple passes over it as it slips half out of the world */
  sg_phase:{C:460,D:1150,sig:true,
    atk:t=>({arc:-10*eo(Math.min(1,t/400))-Math.sin(t/160)*3,rot:Math.sin(t/200)*0.08,sx:1+0.05*Math.sin(t/90),sy:1-0.05*Math.sin(t/90),pose:"float",flash:t>440&&t<520?3:0}),
    def:()=>null,
    fx(c,t,x){ const s=x.self, R=s.r, cx=s.x, cy=s.y-R*0.1, out=t>1000?1-(t-1000)/150:1; if(out<=0) return; c.save(); c.globalAlpha=out; c.globalCompositeOperation="lighter";
      const veil=Math.min(1,t/460); const g=c.createLinearGradient(0,cy-R*1.8,0,s.foot+R*0.2); g.addColorStop(0,"rgba(170,140,255,0)"); g.addColorStop(0.5,`rgba(170,140,255,${0.28*veil})`); g.addColorStop(1,"rgba(170,140,255,0)");
      c.fillStyle=g; c.beginPath(); c.ellipse(cx,cy,R*1.4,R*1.9,0,0,7); c.fill();
      for(let i=0;i<7;i++){ const a=t/260+i/7*Math.PI*2, rr=R*(1.2+0.15*Math.sin(t/150+i)), py=cy+Math.sin(a)*R*0.35-((t/900+i/7)%1)*R*0.8;
        atWisp(c,cx+Math.cos(a)*rr,py,R*0.08,[200,180,255]); }
      for(let k=0;k<2;k++){ const ph=Math.min(1,Math.max(0,(t-460-k*180)/500)); if(ph>0&&ph<1) SG.ring(c,cx,cy,R*(0.8+ph*1.6),R*(1.0+ph*1.8),[220,210,255],3*(1-ph),0.8*(1-ph)); }
      c.globalCompositeOperation="source-over"; for(let i=0;i<3;i++){ const k=Math.min(1,Math.max(0,(t-200-i*120)/400)); if(k>0&&k<1){ c.globalAlpha=out*(1-k)*0.35; c.fillStyle="#efeaff"; c.beginPath(); c.ellipse(cx-(i+1)*R*0.35*k,cy,R*0.95,R*1.05,0,0,7); c.fill(); } }
      c.restore(); }},
  /* Plod: it rears up on its back legs with its trunk high, then slams down on the target with a shockwave that throws up rocks */
  sg_trunkslam:{C:880,D:1560,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      // Plod's own trunk goes up high, then comes down on the target like a hammer
      if(t<520){ const k=eo(t/520); return {f:0.3*k,rot:-d*0.15*k,arc:-10*k,sy:1+0.06*k,pose:atPose("effort",{trunk:0.25*k,trunkUp:1.6*k})}; }
      if(t<880){ const k=ei((t-520)/360); return {f:0.3+0.25*k,rot:-d*0.15+d*0.3*k,arc:-10*(1-k),sy:1.06-0.16*k,sx:1+0.08*k,pose:atPose("attack",{trunk:0.25+1.15*k,trunkUp:1.6-2.3*k,eyes:"fierce"})}; }
      const k=(t-880)/680; return {f:0.55*(1-eio(k)),rot:d*0.15*(1-eo(k)),sy:0.9+0.1*eo(k),sx:1.08-0.08*eo(k),pose:k<0.5?atPose("land",{trunk:1.4*(1-k*1.6),trunkUp:-0.7*(1-k*1.6)}):"idle"}; },
    def:t=>SG.squash(t,880,0.4,620),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t>520&&t<900){ const k=(t-520)/360; c.save(); c.strokeStyle=`rgba(255,255,255,${0.6*(1-k*0.5)})`; c.lineWidth=R*0.18; c.lineCap="round"; c.beginPath(); c.arc(s.x+d*s.r*0.3,s.y,s.r*1.5,-Math.PI/2-d*0.6,-Math.PI/2-d*0.6+d*2.2*k,d<0); c.stroke(); c.restore(); }
      atImpact(t,880,1,0.45);
      if(t>=880){ const k=(t-880)/680; SG.cracks(c,tg.x,tg.foot,R*3,11,0.4,1-k*k); for(let i=0;i<3;i++){ const kk=Math.min(1,Math.max(0,k*1.3-i*0.12)); SG.ring(c,tg.x,tg.foot,R*(0.5+3*eo(kk)),R*(0.15+0.7*eo(kk)),[255,236,200],6*(1-kk),1-kk); }
        for(let i=0;i<10;i++){ const sd=i%2?1:-1, up=Math.sin(Math.min(1,k*1.6)*Math.PI)*R*(0.6+0.8*atH(i)), px=tg.x+sd*R*(0.8+1.6*atH(i*3))*Math.min(1,k*2); SG.shard(c,px,tg.foot-up,R*(0.1+0.08*atH(i*7)),t/120+i,i%3?"#a08870":"#c8b090"); }
        SG.dust(c,tg.x,tg.foot,R*1.3,k,12); SG.stars(c,tg.x,tg.top.y-R*0.2,R*0.7,t,3); } }},
  /* Bipped: it bounces on its toes, dashes in with a jab and follows with a big straight that knocks the target back */
  sg_onetwo:{C:400,D:1060,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1, bob=Math.abs(Math.sin(t/70))*4;
      if(t<180) return {f:-0.05,arc:-bob,pose:"crouch",sx:1.05,sy:0.95};
      if(t<400){ const k=eo((t-180)/220); return {f:-0.05+0.62*k,rot:d*0.12*k,pose:"punch",sx:1.08,sy:0.94}; }
      if(t<520) return {f:0.5,rot:0,pose:"crouch"};
      if(t<640){ const k=eo((t-520)/120); return {f:0.5+0.18*k,rot:d*0.3*k,pose:"punch",sx:1.15,sy:0.9}; }
      const k=(t-640)/420; return {f:0.68*(1-eio(k)),rot:d*0.3*(1-eo(k)),arc:-bob*(1-k),pose:k<0.6?"idle":"happy"}; },
    def(t){ if(t<400||t>1060) return null; if(t<640){ const a=1-eo((t-400)/240); return {off:[10*a*Math.sign(1),0],rot:0.08*a,pose:"hit"}; } const a=1-eo((t-640)/420); return {off:[30*a,-6*a],rot:0.22*a,pose:"hurt",sx:1-0.1*a,sy:1+0.06*a}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x), gc=[226,48,58]; atImpact(t,400,0.35,0); atImpact(t,640,0.8,0.3);
      for(const [T0,big,yo] of [[400,0.7,-0.25],[640,1.1,0]]){ const k=(t-T0)/360; if(k<0||k>1) continue; const p={x:tg.x-d*R*0.55,y:tg.y+R*yo};
        c.save(); c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=3; for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, r0=R*0.5*big*(1+k), r1=r0+R*0.35*big*(1-k); c.beginPath(); c.moveTo(p.x+Math.cos(a)*r0,p.y+Math.sin(a)*r0); c.lineTo(p.x+Math.cos(a)*r1,p.y+Math.sin(a)*r1); c.stroke(); } c.restore();
        if(big>1) atPow(c,{x:p.x+d*R*0.4,y:p.y-R*0.6},k,R/26); }
      if(t>180&&t<660){ c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=2; for(let i=0;i<6;i++){ const yy=tg.y+(i-2.5)*R*0.25, len=R*(1.2+atH(i)*0.8); c.beginPath(); c.moveTo(tg.x-d*R*(1.4+len/R*0.5),yy); c.lineTo(tg.x-d*R*0.9,yy); c.stroke(); } } }},
  /* Fizz: it pops its cork, lobs a spinning bottle that shatters on the target, and a cloud of bubbling poison rises off it */
  sg_potion:{C:820,D:1500,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return t<380?{rot:-d*0.3*eo(t/380),pose:"cast",sy:1-0.06*eo(t/380)}:t<560?{rot:-d*0.3+d*0.55*eo((t-380)/180),pose:"push"}:{rot:d*0.25*(1-eo((t-560)/500)),pose:"idle"}; },
    def(t){ if(t<820||t>1500) return null; const a=1-eo((t-820)/680); return {pose:"hurt",off:[Math.sin(t/30)*3*a,0],sx:1+0.06*a,sy:1-0.08*a,flash:Math.floor(t/120)%2?0:2}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), LQ=(x.col&&x.el)?x.col:[150,220,90], hand={x:s.x+d*s.r*0.4,y:s.top.y-s.r*0.35}, head={x:tg.x,y:tg.top.y+R*0.2};
      if(t<200){ const k=t/200; c.fillStyle="#b07a48"; c.save(); c.translate(hand.x,hand.y-R*0.6-k*R*1.5); c.rotate(k*8); c.fillRect(-R*0.1,-R*0.07,R*0.2,R*0.14); c.restore(); }
      if(t<560){ const k=eo(Math.min(1,t/250)); SG.bottle(c,hand.x,hand.y,R*0.3*k,-d*0.3,LQ,false); for(let i=0;i<4;i++){ const ph=((t/260)+i/4)%1; atBubble(c,hand.x+(i-1.5)*R*0.08,hand.y-R*0.3-ph*R*0.6,R*0.05,1-ph); } return void 0; }
      if(t<820){ const k=(t-560)/260, p=lerpP(hand,head,k,R*1.8); SG.bottle(c,p.x,p.y,R*0.3,d*k*9,LQ,false); for(let j=1;j<5;j++){ const q=lerpP(hand,head,Math.max(0,k-j*0.06),R*1.8); c.fillStyle=atRgba(LQ,0.7-j*0.12); c.beginPath(); c.arc(q.x,q.y+j*2,R*0.05,0,7); c.fill(); } return; }
      atImpact(t,820,0.55,0.25); const k=(t-820)/680;
      for(let i=0;i<12;i++){ const a=-Math.PI*(atH(i*3)), sp=R*(0.4+1.6*eo(k))*(0.6+0.6*atH(i)); SG.shard(c,head.x+Math.cos(a)*sp*(i%2?1:-1),head.y+Math.sin(a)*sp+k*k*R*1.4,R*0.07,t/70+i,"rgba(220,245,255,.85)"); }
      for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, sp=R*(0.3+1.1*eo(Math.min(1,k*2))); c.fillStyle=atRgba(LQ,0.9*(1-k)); c.beginPath(); c.arc(head.x+Math.cos(a)*sp,head.y+Math.sin(a)*sp*0.6+k*k*R*0.8,R*0.08,0,7); c.fill(); }
      for(let i=0;i<9;i++){ const ph=Math.min(1,k*1.3+i*0.04), px=tg.x+(atH(i*5)-0.5)*R*1.8, py=tg.y-ph*R*1.6; SG.puff(c,px,py,R*(0.22+0.2*ph),(1-ph)*0.75,LQ.map((v,j)=>j===1?Math.min(255,v+20):v)); }
      for(let i=0;i<7;i++){ const ph=((t-820)/500+i/7)%1, z=R*(0.08+0.06*(i%3)); if(ph>0.85){ atPop(c,tg.x+(atH(i)-0.5)*R*1.6,tg.y-ph*R*1.3,z,(ph-0.85)/0.15); continue; } c.fillStyle=atRgba(i%2?LQ:[160,90,210],0.85*(1-k*0.5)); c.beginPath(); c.arc(tg.x+(atH(i)-0.5)*R*1.6,tg.y-ph*R*1.3,z,0,7); c.fill(); } }},
  /* Teep: its lid rattles and the whistle shrieks, then the spout fires a jet of steam that wraps the target in a scalding cloud */
  sg_steam:{C:760,D:1460,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<500){ const k=t/500; return {rot:Math.sin(t/22)*0.06*k-d*0.1*k,off:[Math.sin(t/17)*2*k,0],sy:1-0.05*k,sx:1+0.05*k,pose:"effort",flash:k>0.7&&Math.floor(t/50)%2?2:0}; }
      return t<1250?{rot:d*0.2,off:[-d*4,0],pose:"push"}:{rot:d*0.2*(1-(t-1250)/210),pose:"idle"}; },
    def(t){ if(t<760||t>1460) return null; const a=t<1200?1:1-(t-1200)/260; return {pose:"hurt",off:[Math.sin(t/20)*3*a,0],flash:Math.floor(t/100)%2?2:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), spout={x:s.x+d*s.r*1.05,y:s.y-s.r*0.2}, dst={x:tg.x,y:tg.y-R*0.1};
      if(t<500){ for(let i=0;i<6;i++){ const ph=((t/220)+i/6)%1; SG.puff(c,s.x+(atH(i)-0.5)*s.r*0.6,s.top.y-ph*s.r*0.9,s.r*(0.1+0.12*ph),(1-ph)*0.7); }
        c.strokeStyle=`rgba(255,255,255,${0.5+0.5*Math.sin(t/30)})`; c.lineWidth=2; for(let i=0;i<3;i++){ c.beginPath(); c.arc(spout.x,spout.y,s.r*(0.2+i*0.15),-0.6,0.6); c.stroke(); } return; }
      const head=Math.min(1,(t-500)/260), tail=t>1180?Math.min(1,(t-1180)/260):0;
      for(let j=0;j<22;j++){ const q=j/22; if(q>head||q<tail) continue; const p=lerpP(spout,dst,q,-R*0.2), wob=Math.sin(q*12-t/40)*R*0.08, r=R*(0.12+0.38*q)*(0.8+0.3*atH(j+Math.floor(t/60)));
        SG.puff(c,p.x,p.y+wob,r,0.8*(1-q*0.2)); }
      if(t>=760){ atImpact(t,760,0.5,0.2); const k=Math.min(1,(t-760)/700);
        for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+k, rr=R*(0.6+0.7*eo(k)); SG.puff(c,dst.x+Math.cos(a)*rr,dst.y+Math.sin(a)*rr*0.7-k*R*0.5,R*(0.35+0.25*k),(1-k)*0.85); }
        for(let i=0;i<8;i++){ const ph=Math.min(1,k*1.4); c.fillStyle=`rgba(180,220,255,${0.8*(1-ph)})`; c.beginPath(); c.ellipse(dst.x+(atH(i*3)-0.5)*R*1.6,dst.y+ph*R*0.9+(atH(i)-0.5)*R,2,3,0,0,7); c.fill(); } } }},
  /* Lern: its light dims to nothing, then bursts in a flash that whites out the arena, with flare rings toward the target and stars round its head */
  sg_flash:{C:640,D:1300,sig:true,
    atk:t=>({pose:t<560?"cast":"push",sx:t<560?1-0.06*eo(t/560):1.12-0.12*Math.min(1,(t-640)/400),sy:t<560?1-0.08*eo(t/560):1.1-0.1*Math.min(1,(t-640)/400),flash:t>600&&t<760?3:0}),
    def(t){ if(t<640||t>1300) return null; const a=Math.min(1,(t-640)/120); return {pose:"hurt",off:[Math.sin(t/25)*2,0],sx:1-0.05*a,sy:1-0.05*a}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, L={x:s.x,y:s.y-s.r*0.2}, d=atDir(x);
      if(t<600){ const k=t/600; c.save(); c.fillStyle=`rgba(10,10,30,${0.35*k})`; c.fillRect(0,0,x.W||2000,x.H||2000); c.globalCompositeOperation="lighter"; atWisp(c,L.x,L.y,s.r*0.25*(1-k*0.7),[255,240,180]); c.restore(); return; }
      atImpact(t,640,0.35,1); const k=Math.min(1,(t-620)/680); c.save(); c.globalCompositeOperation="lighter";
      const G=c.createRadialGradient(L.x,L.y,0,L.x,L.y,s.r*(2+6*eo(k))); G.addColorStop(0,`rgba(255,255,240,${1-k})`); G.addColorStop(0.4,`rgba(255,240,170,${0.6*(1-k)})`); G.addColorStop(1,"rgba(255,240,170,0)"); c.fillStyle=G; c.beginPath(); c.arc(L.x,L.y,s.r*(2+6*eo(k)),0,7); c.fill();
      for(let i=0;i<16;i++){ const a=i/16*Math.PI*2+t/900, len=s.r*(2+4*eo(k))*(i%2?0.6:1); c.strokeStyle=`rgba(255,250,220,${0.7*(1-k)})`; c.lineWidth=i%2?2:4; c.beginPath(); c.moveTo(L.x+Math.cos(a)*s.r*0.5,L.y+Math.sin(a)*s.r*0.5); c.lineTo(L.x+Math.cos(a)*len,L.y+Math.sin(a)*len); c.stroke(); }
      for(let i=1;i<=4;i++){ const q=i/4.5, p={x:L.x+(tg.x-L.x)*q,y:L.y+(tg.y-L.y)*q}, rr=R*(0.15+0.12*(i%2)); c.strokeStyle=`rgba(${i%2?"180,220,255":"255,200,160"},${0.7*(1-k)})`; c.lineWidth=2; c.beginPath(); for(let j=0;j<6;j++){ const a=j/6*Math.PI*2; c.lineTo(p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr); } c.closePath(); c.stroke(); }
      c.restore(); if(t>700) SG.stars(c,tg.x,tg.top.y-R*0.15,R*0.6,t,4,"#fff4b0"); }}
});
Object.assign(AR_KIND,{"Crunch":"sg_crunch","Ink Jet":"sg_inkjet","Static Screen":"sg_static","Glare":"sg_glare","Bunker Down":"sg_bunker","High Kick":"sg_highkick","Web":"sg_web",
  "Phase Shift":"sg_phase","Trunk Slam":"sg_trunkslam","One-Two":"sg_onetwo","Potion Toss":"sg_potion","Steam Jet":"sg_steam","Flash":"sg_flash"});
/* sounds, timed to the animations above (t is when the move is released) */
if(typeof KSND!=="undefined") Object.assign(KSND,{
  sg_crunch:(d,t)=>{ dNoise(d,t+0.05,0.25,0.12,'bandpass',800,1); sTone(d,t+0.3,'sawtooth',90,160,0.45,0.035); dKick(d,t+0.78,0.8); [0.78,0.9,1.02].forEach((x,k)=>{ dNoise(d,t+x,0.09,0.3-k*0.06,'bandpass',2200+k*400,1.2); sTone(d,t+x,'square',700,250,0.05,0.05); }); },   // a spring, jaws creaking open, three crunching bites
  sg_inkjet:(d,t)=>{ sTone(d,t,'sine',180,90,0.38,0.06); dNoise(d,t+0.38,0.8,0.18,'lowpass',700); dNoise(d,t+0.38,0.8,0.1,'bandpass',2500,0.8); for(let i=0;i<14;i++) dNoise(d,t+0.4+i*0.05,0.04,0.06,'bandpass',900+(i%4)*500,2); dKick(d,t+0.7,0.4); for(let i=0;i<6;i++) dNoise(d,t+0.7+i*0.04,0.08,0.18,'lowpass',1100); [0.9,1.02,1.15].forEach(x=>sTone(d,t+x,'sine',600,200,0.08,0.03)); },   // puffing up, a sputtering spray, splats and drips
  sg_static:(d,t)=>{ dNoise(d,t,0.76,0.12,'highpass',3000,0.5); sTone(d,t,'sine',7800,7800,0.76,0.012); dNoise(d,t+0.76,0.5,0.22,'bandpass',4000,0.4); [0.9,0.95,1.0].forEach(x=>sTone(d,t+x,'square',1000,1000,0.04,0.03)); sTone(d,t+1.24,'sine',2400,60,0.2,0.05); },   // static and a whine, the screen roaring, a test-tone beep, the set switching off
  sg_glare:(d,t)=>{ sTone(d,t,'sawtooth',110,105,0.7,0.04); sTone(d,t,'sawtooth',117,112,0.7,0.04); sTone(d,t+0.38,'sine',300,200,0.3,0.04); sTone(d,t+0.7,'sawtooth',1400,1200,0.4,0.03); [0.76,0.88,1.0].forEach((x,k)=>sTone(d,t+x,'triangle',900-k*180,500-k*120,0.12,0.04)); },   // a low drone, the eye opening, a sting and the stats falling
  sg_bunker:(d,t)=>{ dNoise(d,t,0.3,0.12,'lowpass',600); for(let i=0;i<9;i++) sTone(d,t+0.32+i*0.035,'square',420+i*30,300,0.03,0.03); dKick(d,t+0.52,0.5); sTone(d,t+0.6,'triangle',2400,2600,0.3,0.03); },   // digging in, plates clacking shut, a thud and a glint
  sg_highkick:(d,t)=>{ sTone(d,t+0.2,'sine',200,800,0.2,0.05); for(let i=0;i<3;i++) dNoise(d,t+0.3+i*0.12,0.1,0.12,'bandpass',900+i*300,1); sTone(d,t+0.64,'sine',1200,300,0.2,0.04); dKick(d,t+0.84,1); dNoise(d,t+0.84,0.4,0.28,'lowpass',500); dNoise(d,t+0.88,0.3,0.1,'highpass',2500,1); },   // a spring up, spinning whooshes, a falling whistle, the crack of the kick
  sg_web:(d,t)=>{ dNoise(d,t,0.3,0.06,'lowpass',800); sTone(d,t+0.3,'sine',1600,400,0.3,0.06); dNoise(d,t+0.3,0.3,0.08,'highpass',4000); sTone(d,t+0.64,'triangle',300,600,0.25,0.04); [0.9,1.0,1.1].forEach(x=>sTone(d,t+x,'sawtooth',180,240,0.12,0.02)); },   // a thwip, the web snapping open, the threads creaking tight
  sg_phase:(d,t)=>{ sTone(d,t,'sine',900,300,0.6,0.05); sTone(d,t+0.05,'sine',1350,450,0.6,0.03); dNoise(d,t,0.6,0.05,'highpass',5000); sTone(d,t+0.46,'triangle',600,1800,0.4,0.03); },   // a ghostly fall and a shimmer as it fades out
  sg_trunkslam:(d,t)=>{ sTone(d,t+0.15,'sawtooth',300,620,0.35,0.05); sTone(d,t+0.15,'square',305,630,0.35,0.02); dNoise(d,t+0.55,0.3,0.15,'lowpass',700); dKick(d,t+0.88,1); dNoise(d,t+0.88,0.7,0.3,'lowpass',300); dNoise(d,t+0.95,0.4,0.12,'bandpass',1500,1); },   // a trumpet, the trunk whooshing down, a huge slam and falling rocks
  sg_onetwo:(d,t)=>{ [0,0.08].forEach(x=>dNoise(d,t+x,0.05,0.05,'bandpass',500,1)); dNoise(d,t+0.4,0.08,0.25,'bandpass',1600,1.4); dKick(d,t+0.64,0.7); dNoise(d,t+0.64,0.12,0.32,'bandpass',1200,1.2); sTone(d,t+0.7,'triangle',1800,1800,0.6,0.03); },   // light footsteps, the jab, the big straight, a bell
  sg_potion:(d,t)=>{ sTone(d,t+0.02,'sine',400,1600,0.08,0.06); dNoise(d,t+0.02,0.05,0.12,'highpass',3000); for(let i=0;i<4;i++) sTone(d,t+0.15+i*0.06,'sine',500+i*120,900+i*120,0.05,0.03); sTone(d,t+0.56,'sine',1200,700,0.26,0.03); [0.82,0.84,0.87].forEach(x=>sTone(d,t+x,'triangle',3400,2600,0.08,0.05)); dNoise(d,t+0.82,0.35,0.15,'bandpass',900,1.5); for(let i=0;i<6;i++) sTone(d,t+0.95+i*0.07,'sine',300+i*60,500+i*60,0.06,0.03); },   // the cork pops, bubbling, a whistle through the air, glass shattering, poison fizzing
  sg_steam:(d,t)=>{ for(let i=0;i<6;i++) dNoise(d,t+i*0.08,0.04,0.08,'bandpass',1200,2); sTone(d,t,'sine',1200,2800,0.5,0.04); sTone(d,t+0.02,'sine',1260,2900,0.5,0.03); dNoise(d,t+0.5,0.75,0.22,'highpass',3500,0.6); dNoise(d,t+0.76,0.5,0.15,'bandpass',2000,0.8); },   // the lid rattling, the whistle rising, a long blast of steam
  sg_flash:(d,t)=>{ sTone(d,t,'sine',1200,200,0.55,0.03); sTone(d,t+0.6,'sine',300,3000,0.08,0.06); [1568,2093,2637,3136].forEach((f,k)=>sTone(d,t+0.64+k*0.02,'triangle',f,f,0.6,0.035)); dNoise(d,t+0.64,0.4,0.15,'highpass',6000,0.6); }   // the light dying down, then a bright chord as it bursts
});
if(typeof SWING!=="undefined") ["sg_crunch","sg_highkick","sg_trunkslam","sg_onetwo"].forEach(k=>SWING.add(k));

/* ---------- group B ---------- */
SG.bat=(c,x,y,z,flap,col="#2a1530")=>{ c.save(); c.translate(x,y); c.fillStyle=col; const w=Math.sin(flap)*0.6; c.beginPath(); c.moveTo(0,0);
  for(const sd of [-1,1]){ c.moveTo(0,0); c.quadraticCurveTo(sd*z*0.6,-z*(0.6+w),sd*z*1.3,-z*0.2*w); c.quadraticCurveTo(sd*z*0.9,z*0.15,sd*z*0.7,z*0.35); c.quadraticCurveTo(sd*z*0.45,z*0.1,0,z*0.2); }
  c.fill(); c.beginPath(); c.arc(0,0,z*0.3,0,7); c.fill(); c.fillStyle="#ff4060"; c.fillRect(-z*0.15,-z*0.08,z*0.08,z*0.08); c.fillRect(z*0.07,-z*0.08,z*0.08,z*0.08); c.restore(); };
SG.feather=(c,x,y,z,rot,col,a=1)=>{ if(a<=0) return; c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=a; c.fillStyle=col; c.beginPath(); c.moveTo(0,-z); c.quadraticCurveTo(z*0.45,0,0,z); c.quadraticCurveTo(-z*0.45,0,0,-z); c.fill();
  c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=1; c.beginPath(); c.moveTo(0,-z); c.lineTo(0,z*1.2); c.stroke(); c.restore(); };
SG.claws=(c,x,y,L,k,a0,col,n=3)=>{ if(k<0||k>1) return; c.save(); c.translate(x,y); c.rotate(a0); c.lineCap="round"; const g=Math.min(1,k*3), fade=1-Math.max(0,(k-0.5)/0.5);
  for(let i=0;i<n;i++){ const o=(i-(n-1)/2)*L*0.22; c.strokeStyle=atRgba(col,0.9*fade); c.lineWidth=L*0.09*(1-Math.abs(i-(n-1)/2)*0.25); c.beginPath(); c.moveTo(-L*0.5,o-L*0.1); c.quadraticCurveTo(0,o+L*0.1,-L*0.5+L*g,o-L*0.1+L*0.2*g); c.stroke();
    c.strokeStyle=`rgba(255,255,255,${fade})`; c.lineWidth=L*0.03; c.stroke(); } c.restore(); };
SG.flame=(c,x,y,h,w,t,seed,a=1)=>{ if(a<=0||h<1) return; c.save(); c.globalAlpha*=a; const sw=Math.sin(t/70+seed)*w*0.25; const g=c.createLinearGradient(0,y,0,y-h); g.addColorStop(0,"#ff5a1e"); g.addColorStop(0.5,"#ffb02e"); g.addColorStop(1,"rgba(255,240,150,0)");
  c.fillStyle=g; c.beginPath(); c.moveTo(x-w,y); c.quadraticCurveTo(x-w*0.9,y-h*0.5,x+sw,y-h); c.quadraticCurveTo(x+w*0.9,y-h*0.5,x+w,y); c.closePath(); c.fill();
  c.fillStyle="rgba(255,250,200,.8)"; c.beginPath(); c.moveTo(x-w*0.4,y); c.quadraticCurveTo(x-w*0.3,y-h*0.3,x+sw*0.5,y-h*0.55); c.quadraticCurveTo(x+w*0.3,y-h*0.3,x+w*0.4,y); c.fill(); c.restore(); };
SG.zzz=(c,x,y,z,a)=>{ if(a<=0) return; c.save(); c.globalAlpha*=a; c.strokeStyle="#5a6cff"; c.lineWidth=z*0.22; c.lineJoin="round"; c.beginPath(); c.moveTo(x-z*0.5,y-z*0.5); c.lineTo(x+z*0.5,y-z*0.5); c.lineTo(x-z*0.5,y+z*0.5); c.lineTo(x+z*0.5,y+z*0.5); c.stroke(); c.restore(); };
SG.needle=(c,x,y,L,a,col="#f6f0d0")=>{ c.save(); c.translate(x,y); c.rotate(a); c.strokeStyle="rgba(80,60,30,.8)"; c.lineWidth=2.6; c.beginPath(); c.moveTo(-L,0); c.lineTo(L*0.2,0); c.stroke(); c.strokeStyle=col; c.lineWidth=1.6; c.beginPath(); c.moveTo(-L,0); c.lineTo(L*0.3,0); c.stroke(); c.restore(); };
Object.assign(ANIM,{
  /* Eagle: it shoots straight up out of sight, a glint shows where it is, then it dives like a bolt and rakes the target with its talons */
  sg_talondive:{C:900,D:1560,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      if(t<240){ const k=eo(t/240); return {sy:1-0.2*k,sx:1+0.12*k,pose:"crouch"}; }
      if(t<560){ const k=eo((t-240)/320); return {f:0.15*k,arc:-260*k,sy:1.15,sx:0.88,rot:-d*0.1,pose:"jump"}; }
      if(t<900){ const k=ei((t-560)/340); return {f:0.15+0.48*k,arc:-260*(1-k),rot:d*0.9*k,sy:1.2,sx:0.85,pose:"punch"}; }
      const k=(t-900)/660; return {f:0.63*(1-eio(k)),arc:-40*Math.sin(Math.min(1,k*1.5)*Math.PI),rot:d*0.9*(1-eo(k)),pose:k<0.5?"land":"idle"}; },
    def(t){ const a=SG.squash(t,900,0.3,560); if(a) a.off[0]+=14*(1-eo((t-900)/560)); return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=x.col||[255,220,140], fc=["#fffaf0","#c8a070","#7a5030"];
      if(t>240&&t<620){ const k=(t-240)/380; for(let i=0;i<6;i++){ const q=(k*1.4+i/6)%1; SG.feather(c,s.x+(atH(i)-0.5)*s.r*2,s.foot-q*s.r*2.2,s.r*0.16,t/150+i,fc[i%3],1-q); } }
      if(t>480&&t<640){ const k=(t-480)/160; const gx=s.x+d*(tg.x-s.x)*0.15, gy=Math.max(20,s.y-260); c.save(); c.globalCompositeOperation="lighter"; atStar4(c,gx,gy,s.r*0.6*Math.sin(k*Math.PI),"rgba(255,255,230,1)"); c.restore(); }
      if(t>560&&t<940){ const k=Math.min(1,(t-560)/340), tip={x:s.x+(tg.x-s.x)*(0.15+0.48*ei(k))*1.1,y:s.y-260*(1-ei(k))}; c.save(); c.globalCompositeOperation="lighter";
        const g=c.createLinearGradient(tip.x,tip.y,tip.x-d*R*1.5,tip.y-R*3); g.addColorStop(0,atRgba(col,0.85)); g.addColorStop(1,atRgba(col,0)); c.fillStyle=g; c.beginPath(); c.moveTo(tip.x-R*0.4,tip.y); c.lineTo(tip.x+R*0.4,tip.y); c.lineTo(tip.x-d*R*1.5+R*0.2,tip.y-R*3.2); c.lineTo(tip.x-d*R*1.5-R*0.4,tip.y-R*3); c.closePath(); c.fill();
        c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=2; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(tip.x+(i-1.5)*R*0.2,tip.y-R*0.3); c.lineTo(tip.x-d*R*1.2+(i-1.5)*R*0.25,tip.y-R*2.6); c.stroke(); } c.restore(); }
      atImpact(t,900,0.9,0.35);
      if(t>=900){ const k=(t-900)/600; SG.claws(c,tg.x,tg.y-R*0.1,R*1.5,k,d*0.5+Math.PI/2*0.2,[255,80,70]); SG.claws(c,tg.x+d*R*0.15,tg.y+R*0.1,R*1.2,k-0.08,d*0.65,[255,140,90]);
        for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, sp=R*(0.5+1.4*eo(k)); SG.feather(c,tg.x+Math.cos(a)*sp,tg.y+Math.sin(a)*sp*0.7+k*k*R,R*0.16,a+k*3,fc[i%3],1-k); }
        SG.dust(c,tg.x,tg.foot,R,k,8); } }},
  /* Vampire: it throws its cloak open and turns into a swarm of bats that flies through the target, forms up behind it, bites and drinks its life back home */
  sg_nightbite:{C:780,D:1480,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      if(t<260){ const k=eo(t/260); return {sx:1+0.25*k,sy:1-0.1*k,pose:"cast"}; }
      if(t<520){ const k=(t-260)/260; return {f:0.7*eio(k),arc:-30*Math.sin(k*Math.PI),sx:0.2+0.8*Math.abs(1-2*k),sy:0.2+0.8*Math.abs(1-2*k),pose:"float"}; }
      if(t<780){ const k=eo((t-520)/260); return {f:0.7-0.06*k,rot:d*0.2*k,sx:1+0.1*k,pose:"punch"}; }
      if(t<1100) return {f:0.64,rot:d*0.2,pose:"punch",sx:1+0.04*Math.sin(t/40)};
      const k=(t-1100)/380; return {f:0.64*(1-eio(k)),rot:d*0.2*(1-k),pose:"happy"}; },
    def(t){ if(t<780||t>1440) return null; return {pose:"hurt",off:[Math.sin(t/18)*2,0],sx:1-0.08,sy:1+0.04,flash:Math.floor(t/110)%2?0:2}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t>200&&t<620){ const k=(t-200)/420; for(let i=0;i<12;i++){ const q=Math.min(1,Math.max(0,k*1.4-i*0.03)), p=lerpP({x:s.x,y:s.y-s.r*0.3},{x:tg.x+d*R*1.3,y:tg.y-R*0.6},q,R*1.2*(atH(i)-0.3),(atH(i*3)-0.5)*R*1.4); SG.bat(c,p.x,p.y,s.r*0.22,t/40+i); } }
      if(t>650&&t<900){ const k=(t-650)/250, fx2=tg.x-d*R*0.15, fy=tg.top.y+R*0.45, gap=R*0.55*(1-ei(k)); c.fillStyle="#fffaf4"; c.strokeStyle="rgba(120,40,60,.8)"; c.lineWidth=2;
        for(const sd of [-1,1]){ c.beginPath(); c.moveTo(fx2+sd*R*0.3-R*0.1,fy-gap); c.lineTo(fx2+sd*R*0.3+R*0.1,fy-gap); c.lineTo(fx2+sd*R*0.3,fy-gap+R*0.45); c.closePath(); c.fill(); c.stroke(); } }
      atImpact(t,780,0.6,0.2);
      if(t>=780){ const k=(t-780)/700; c.save(); c.globalCompositeOperation="lighter"; if(k<1) atWisp(c,tg.x-d*R*0.15,tg.top.y+R*0.8,R*0.35*(1-k)+0.5,[255,40,70]); c.restore();
        for(let i=0;i<8;i++){ const q=Math.min(1,Math.max(0,(t-860-i*55)/420)); if(q<=0||q>=1) continue; const p=lerpP({x:tg.x,y:tg.y-R*0.2},{x:s.x+d*s.r*0.2,y:s.y-s.r*0.3},eio(q),R*(0.6+0.5*atH(i)),(atH(i*7)-0.5)*R);
          c.save(); c.globalCompositeOperation="lighter"; atWisp(c,p.x,p.y,R*0.09,[255,60,90]); c.restore(); }
        for(let i=0;i<6;i++){ const a=-Math.PI*(0.15+0.7*atH(i*3)), sp=R*(0.3+0.9*eo(k)); c.fillStyle=`rgba(200,20,50,${1-k})`; c.beginPath(); c.arc(tg.x-d*R*0.15+Math.cos(a)*sp,tg.top.y+R*0.5+Math.sin(a)*sp+k*k*R,R*0.06,0,7); c.fill(); } } }},
  /* Phoenix: it rises on its wings and builds a little sun over its head, throws it, and the sun bursts on the target in a ring of fire that leaves it burning */
  sg_sunflare:{C:860,D:1560,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<480){ const k=eo(t/480); return {arc:-20*k-Math.sin(t/90)*3,pose:"cast",sy:1+0.06*k}; } if(t<660){ const k=eo((t-480)/180); return {arc:-20,rot:d*0.25*k,pose:"push"}; } const k=(t-660)/900; return {arc:-20*(1-eo(k)),rot:d*0.25*(1-eo(k)),pose:"idle"}; },
    def(t){ const a=SG.knock(t,860,1,16,520); if(a){ a.flash=Math.floor(t/80)%2?3:0; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, over={x:s.x,y:s.top.y-s.r*0.9}, dst={x:tg.x,y:tg.y-R*0.1};
      const sun=(p,r,sp)=>{ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,p.x,p.y,r*2.4,[255,150,40],0.6); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+sp, L=r*(1.35+0.25*Math.sin(t/60+i)); c.fillStyle="rgba(255,200,80,.7)"; c.beginPath(); c.moveTo(p.x+Math.cos(a-0.2)*r*0.9,p.y+Math.sin(a-0.2)*r*0.9); c.lineTo(p.x+Math.cos(a)*L,p.y+Math.sin(a)*L); c.lineTo(p.x+Math.cos(a+0.2)*r*0.9,p.y+Math.sin(a+0.2)*r*0.9); c.fill(); } c.restore();
        const g=c.createRadialGradient(p.x-r*0.3,p.y-r*0.3,r*0.1,p.x,p.y,r); g.addColorStop(0,"#fffbe0"); g.addColorStop(0.5,"#ffd04a"); g.addColorStop(1,"#ff7a1e"); c.fillStyle=g; c.beginPath(); c.arc(p.x,p.y,r,0,7); c.fill(); };
      if(t<480){ const k=eo(t/480); atGather(c,over,t/480,[255,180,60],s.r*1.4,2); sun(over,s.r*0.55*k,t/300); return; }
      if(t<860){ const k=(t-480)/380, p=lerpP(over,dst,eio(k),R*1.6); for(let j=1;j<6;j++){ const q=lerpP(over,dst,eio(Math.max(0,k-j*0.05)),R*1.6); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,q.x,q.y,s.r*0.4*(1-j*0.15),[255,140,40],0.5); c.restore(); } sun(p,s.r*0.55,t/150); return; }
      atImpact(t,860,0.85,0.5); const k=(t-860)/700;
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,dst.x,dst.y,R*(1.2+2*eo(k)),[255,170,60],0.9*(1-k)); c.restore();
      SG.ring(c,tg.x,tg.foot,R*(0.6+2.4*eo(k)),R*(0.2+0.6*eo(k)),[255,180,80],6*(1-k),1-k);
      for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, rr=R*(0.6+2.0*eo(Math.min(1,k*1.4))), px=tg.x+Math.cos(a)*rr, py=tg.foot+Math.sin(a)*rr*0.28; SG.flame(c,px,py,R*(0.7+0.4*atH(i))*(1-k),R*0.2,t,i,1-k); }
      for(let i=0;i<3;i++) SG.flame(c,tg.x+(i-1)*R*0.45,tg.foot-R*0.1,R*(1.0+0.3*(i%2))*Math.min(1,k*3)*(1-k),R*0.24,t,i*3,0.9*(1-k));
      for(let i=0;i<10;i++){ const ph=(k*1.3+i/10)%1; c.fillStyle=`rgba(255,${180+i*5},80,${1-ph})`; c.fillRect(tg.x+(atH(i*3)-0.5)*R*2.4,tg.y-ph*R*1.8,3,3); } }},
  /* Kitsune: three blue fox-fires circle it, then fly at the target one after another on curving paths and burst into the shape of a fox's head */
  sg_foxfire:{C:700,D:1400,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return {pose:t<700?"cast":"push",arc:-6*Math.sin(Math.min(1,t/700)*Math.PI),rot:t>420&&t<900?d*0.1*Math.sin((t-420)/480*Math.PI*3):0}; },
    def(t){ for(const T0 of [700,820,940]){ if(t>=T0&&t<T0+120) return {off:[10*(1-(t-T0)/120),0],pose:"hit",flash:3}; } if(t>=1060&&t<1400) return {rot:Math.sin(t/80)*0.12,pose:"hurt"}; return null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), BL=[110,170,255];
      const fire=(p,r,a)=>{ c.save(); c.globalCompositeOperation="lighter"; c.globalAlpha=a; atGlowA(c,p.x,p.y,r*2.2,BL,0.6); c.fillStyle="rgba(170,210,255,.9)"; c.beginPath(); c.moveTo(p.x,p.y-r*1.8); c.quadraticCurveTo(p.x+r,p.y-r*0.3,p.x,p.y+r*0.7); c.quadraticCurveTo(p.x-r,p.y-r*0.3,p.x,p.y-r*1.8); c.fill(); c.fillStyle="#fff"; c.beginPath(); c.arc(p.x,p.y,r*0.35,0,7); c.fill(); c.restore(); };
      for(let i=0;i<3;i++){ const T0=380+i*120, T1=700+i*120, orb={x:s.x+Math.cos(t/180+i*2.1)*s.r*1.2,y:s.y-s.r*0.3+Math.sin(t/180+i*2.1)*s.r*0.45};
        if(t<T0) fire(orb,s.r*0.16*Math.min(1,t/200),1);
        else if(t<T1){ const k=(t-T0)/(T1-T0), p=lerpP(orb,{x:tg.x,y:tg.y-R*0.15},eio(k),R*(1+i*0.6)*(i%2?-1:1),(i-1)*R*0.8); fire(p,s.r*0.18,1); for(let j=1;j<5;j++){ const q=lerpP(orb,{x:tg.x,y:tg.y-R*0.15},eio(Math.max(0,k-j*0.06)),R*(1+i*0.6)*(i%2?-1:1),(i-1)*R*0.8); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,q.x,q.y,s.r*0.12,BL,0.5-j*0.1); c.restore(); } }
        else if(t<T1+420){ const k=(t-T1)/420, p={x:tg.x+(i-1)*R*0.3,y:tg.y-R*0.15}; atImpact(t,T1,0.3+i*0.1,0.1); c.save(); c.globalCompositeOperation="lighter"; c.globalAlpha=1-k; atGlowA(c,p.x,p.y,R*(0.5+0.9*k),BL,0.8);
          const fh=R*(0.5+0.4*k); c.fillStyle="rgba(170,210,255,.7)"; c.beginPath(); c.moveTo(p.x-fh,p.y-fh*0.6); c.lineTo(p.x-fh*0.35,p.y-fh*0.2); c.lineTo(p.x+fh*0.35,p.y-fh*0.2); c.lineTo(p.x+fh,p.y-fh*0.6); c.lineTo(p.x+fh*0.55,p.y+fh*0.3); c.lineTo(p.x,p.y+fh*0.65); c.lineTo(p.x-fh*0.55,p.y+fh*0.3); c.closePath(); c.fill(); c.restore(); } }
      if(t>1000) SG.stars(c,tg.x,tg.top.y-R*0.15,R*0.6,t,3,"#bcd8ff"); }},
  /* Naga: it lunges and wraps its coils round the target, squeezes three times and sinks its fangs in, leaving venom bubbling on it */
  sg_venomcoil:{C:720,D:1420,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<300){ const k=eo(t/300); return {f:-0.06*k,sy:1-0.18*k,sx:1+0.1*k,rot:-d*0.1*k,pose:"crouch"}; }
      if(t<560){ const k=eo((t-300)/260); return {f:-0.06+0.66*k,sy:1.1,sx:0.92,rot:d*0.15*k,pose:"tackle"}; } if(t<1150) return {f:0.6,rot:d*0.15,sx:1+0.04*Math.sin(t/60),pose:"punch"}; const k=(t-1150)/270; return {f:0.6*(1-eio(k)),rot:d*0.15*(1-k),pose:"idle"}; },
    def(t){ if(t<620||t>1420) return null; const sq=Math.abs(Math.sin((t-620)/130*Math.PI/2)); return {sx:1-0.16*sq,sy:1+0.06*sq,pose:"hurt",flash:t>720&&Math.floor(t/120)%2?2:0}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x), SC=[90,170,90], SC2=[60,120,60], top=tg.top.y, h=tg.foot-top;
      if(t<560) return; const wrap=Math.min(1,(t-560)/200), out=t>1250?1-(t-1250)/170:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      for(let w=0;w<3;w++){ const yy=top+h*(0.3+w*0.24), sq=1-0.12*Math.abs(Math.sin((t-620)/130*Math.PI/2)), rx=R*1.15*sq, ry=R*0.28; const a0=-Math.PI*0.95, a1=a0+Math.PI*1.9*wrap;
        c.lineCap="round"; c.strokeStyle=atRgba(SC2,1); c.lineWidth=R*0.34; c.beginPath(); c.ellipse(tg.x,yy,rx,ry,0.1*(w%2?1:-1),a0,a1); c.stroke();
        c.strokeStyle=atRgba(SC,1); c.lineWidth=R*0.26; c.stroke(); c.strokeStyle="rgba(230,220,140,.85)"; c.lineWidth=R*0.07; c.setLineDash([R*0.12,R*0.1]); c.stroke(); c.setLineDash([]);
        c.strokeStyle="rgba(255,255,255,.4)"; c.lineWidth=R*0.05; c.beginPath(); c.ellipse(tg.x,yy-R*0.06,rx,ry,0.1*(w%2?1:-1),a0+0.3,a0+0.3+Math.PI*1.2*wrap); c.stroke(); }
      if(t>=720){ atImpact(t,720,0.5,0.15); const k=Math.min(1,(t-720)/600), fx2=tg.x-d*R*0.4, fy=top+h*0.2; c.fillStyle="#fffaf0";
        for(const sd of [-1,1]){ c.beginPath(); c.moveTo(fx2+sd*R*0.12-R*0.05,fy-R*0.3*(1-Math.min(1,k*4))); c.lineTo(fx2+sd*R*0.12+R*0.05,fy-R*0.3*(1-Math.min(1,k*4))); c.lineTo(fx2+sd*R*0.12,fy+R*0.2); c.fill(); }
        for(let i=0;i<8;i++){ const ph=(k*1.5+i/8)%1; c.fillStyle=atRgba(i%2?[170,90,220]:[130,220,90],0.9*(1-ph)); c.beginPath(); c.arc(tg.x+(atH(i)-0.5)*R*1.6,tg.y-ph*R*1.3,R*(0.06+0.04*(i%3)),0,7); c.fill(); }
        for(let i=0;i<3;i++){ const dr=Math.min(1,k*2-i*0.2); if(dr>0){ c.fillStyle="rgba(150,80,210,.9)"; c.beginPath(); c.ellipse(fx2+(i-1)*R*0.12,fy+R*0.2+dr*R*0.5,R*0.04,R*0.07,0,0,7); c.fill(); } } }
      c.restore(); }},
  /* Puff: it shakes its cap and a lazy river of glowing spores drifts over the target, which nods off with z's floating up */
  sg_spores:{C:860,D:1560,sig:true,
    atk:t=>({rot:t<500?Math.sin(t/35)*0.12*Math.min(1,t/200):0,sy:t<500?1-0.06*Math.abs(Math.sin(t/35)):1,pose:t<500?"effort":t<1100?"push":"idle"}),
    def(t){ if(t<860||t>1560) return null; const a=Math.min(1,(t-860)/400); return {rot:Math.sin(t/260)*0.18*a,sy:1-0.06*a,off:[0,4*a],pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, cap={x:s.x,y:s.top.y+s.r*0.1}, dst={x:tg.x,y:tg.y-R*0.3}, SP=[255,226,140], SP2=[200,170,255];
      if(t<520){ for(let i=0;i<14;i++){ const ph=((t/400)+i/14)%1, a=i*2.4; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,cap.x+Math.cos(a)*s.r*(0.4+ph),cap.y-ph*s.r*0.8+Math.sin(a)*s.r*0.2,3,i%2?SP:SP2,0.9*(1-ph)); c.restore(); } }
      const k=Math.min(1,Math.max(0,(t-380)/700)); if(k>0){ c.save(); c.globalCompositeOperation="lighter";
        for(let i=0;i<40;i++){ const q=((k*1.2-i/40*0.6)); if(q<0||q>1.2) continue; const qq=Math.min(1,q), p=lerpP(cap,dst,qq,R*0.9), sw=Math.sin(i*1.7+t/250)*R*0.5*(1-Math.abs(qq-0.5)), fade=q>1?1-(q-1)/0.2:1;
          atGlowA(c,p.x+sw*0.3,p.y+sw,4+2*(i%3),i%3?SP:SP2,0.8*fade); } c.restore(); }
      if(t>=860){ atImpact(t,860,0.2,0); const kk=(t-860)/700; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tg.x,tg.y-R*0.2,R*1.6,SP,0.35*(1-kk)); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+t/400, rr=R*(1.1+0.2*Math.sin(t/200+i)); atGlowA(c,tg.x+Math.cos(a)*rr,tg.y-R*0.3+Math.sin(a)*rr*0.5,3,SP,0.8*(1-kk)); } c.restore();
        for(let i=0;i<3;i++){ const ph=((t-860)/700+i/3)%1; SG.zzz(c,tg.x+R*(0.5+ph*0.6),tg.top.y-ph*R*1.2,R*(0.18+0.12*i),Math.sin(ph*Math.PI)); } } }},
  /* Flit: it opens its mouth wide and screeches out rings of sound that grow as they travel, and the target shakes and wobbles inside them */
  sg_sonar:{C:640,D:1320,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return {pose:t<300?"cast":t<1100?"push":"idle",sx:1+0.08*Math.sin(t/30)*(t>300&&t<1000?1:0),sy:1-0.05*Math.sin(t/30)*(t>300&&t<1000?1:0),rot:t<300?-d*0.15*eo(t/300):-d*0.15}; },
    def(t){ if(t<640||t>1320) return null; return {off:[Math.sin(t/9)*3,Math.cos(t/11)*1.5],sx:1+0.05*Math.sin(t/20),sy:1-0.05*Math.sin(t/20),pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), mouth={x:s.x+d*s.r*0.7,y:s.y-s.r*0.1}, L=Math.abs(tg.x-mouth.x), col=x.col||[200,160,255];
      c.save(); c.globalCompositeOperation="lighter"; c.lineCap="round";
      for(let i=0;i<7;i++){ const T0=300+i*80, k=(t-T0)/400; if(k<0||k>1) continue; const px=mouth.x+d*L*eo(k), r=R*(0.3+1.1*k); c.strokeStyle=atRgba(i%2?col:[255,255,255],0.85*(1-k*0.6)); c.lineWidth=5*(1-k*0.5);
        c.beginPath(); c.arc(px-d*r,mouth.y+(tg.y-mouth.y)*k,r,d>0?-0.9:Math.PI-0.9,d>0?0.9:Math.PI+0.9); c.stroke(); }
      if(t>=640){ atImpact(t,640,0.35,0); const k=(t-640)/680; for(let i=0;i<4;i++){ const ph=(k*2+i/4)%1; SG.ring(c,tg.x,tg.y-R*0.1,R*(0.8+ph*1.4),R*(0.9+ph*1.5),i%2?col:[255,255,255],3*(1-ph),0.7*(1-ph)*(1-k)); }
        c.restore(); SG.stars(c,tg.x,tg.top.y-R*0.15,R*0.6,t,3,"#d8c8ff"); return; } c.restore(); }},
  /* Glop: it stretches up tall, flops right over the target, swallows it in a wobbling dome of slime, then spits it out */
  sg_engulf:{C:700,D:1400,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<320){ const k=eo(t/320); return {sy:1+0.4*k,sx:1-0.2*k,pose:"cast"}; }
      if(t<700){ const k=eio((t-320)/380); return {f:0.68*k,arc:-40*Math.sin(k*Math.PI),sy:1.4-0.7*k,sx:0.8+0.6*k,rot:d*0.3*Math.sin(k*Math.PI),pose:"tackle"}; }
      if(t<1150) return {f:0.68,sy:0.7+0.05*Math.sin(t/50),sx:1.4-0.05*Math.sin(t/50),pose:"punch",alpha:0.85};
      const k=(t-1150)/250; return {f:0.68*(1-eio(k)),sy:0.7+0.3*eo(k),sx:1.4-0.4*eo(k),pose:"idle"}; },
    def(t){ if(t<700||t>1400) return null; if(t<1150) return {off:[Math.sin(t/60)*3,0],sx:1+0.06*Math.sin(t/70),sy:1-0.06*Math.sin(t/70),pose:"hurt",lift:-4}; const a=1-eo((t-1150)/250); return {off:[28*a,-18*Math.sin(a*Math.PI)],pose:"hit"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, GC=(x.col||[120,220,120]).map((v,j)=>Math.round(v*0.5+[90,220,120][j]*0.5)), top=tg.top.y, h=tg.foot-top;
      if(t<700||t>1300) return; atImpact(t,700,0.45,0); const g=eo(Math.min(1,(t-700)/160)), out=t>1150?1-(t-1150)/150:1, wob=Math.sin(t/60)*R*0.05;
      c.save(); c.globalAlpha=out; const rx=R*1.4*g+wob, ry=h*0.75*g-wob; c.fillStyle=atRgba(GC,0.42); c.strokeStyle=atRgba(GC.map(v=>v-50),0.8); c.lineWidth=3;
      c.beginPath(); c.ellipse(tg.x,tg.foot,rx,ry*1.25,0,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle="rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(tg.x-rx*0.45,tg.foot-ry*0.95,rx*0.16,ry*0.22,-0.5,0,7); c.fill();
      for(let i=0;i<8;i++){ const ph=((t-700)/600+i/8)%1; c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=1.3; c.beginPath(); c.arc(tg.x+(atH(i)-0.5)*rx*1.2,tg.foot-ph*ry*1.1,R*(0.04+0.04*(i%3)),0,7); c.stroke(); }
      for(let i=0;i<5;i++){ const dr=Math.min(1,Math.max(0,(t-760-i*60)/400)); c.fillStyle=atRgba(GC,0.7); c.beginPath(); c.ellipse(tg.x+(i-2)*rx*0.35,tg.foot-ry*0.4+dr*ry*0.35,R*0.06,R*0.1,0,0,7); c.fill(); }
      c.restore(); }},
  /* Tock: a giant clock face rises behind the target and its hands become blades that sweep round and slice it four times, one per tick */
  sg_secondhand:{C:560,D:1260,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return {pose:t<560?"cast":"push",rot:t>560&&t<1050?Math.sin((t-560)/120*Math.PI)*0.12*d:0,sx:1+0.03*Math.sin(t/60)}; },
    def(t){ for(let i=0;i<4;i++){ const T0=560+i*130; if(t>=T0&&t<T0+110) return {off:[(i%2?-1:1)*8*(1-(t-T0)/110),0],pose:"hit",flash:3}; } return t>=1080&&t<1260?{pose:"hurt"}:null; },
    fx(c,t,x){ const tg=x.target, R=tg.r, cx=tg.x, cy=tg.y-R*0.2, CR=R*1.65, show=Math.min(1,t/300)*(t>1100?1-(t-1100)/160:1); if(show<=0) return;
      c.save(); c.globalAlpha=show*0.9; c.fillStyle="rgba(255,248,230,.55)"; c.strokeStyle="#a07a40"; c.lineWidth=5; c.beginPath(); c.arc(cx,cy,CR,0,7); c.fill(); c.stroke();
      c.strokeStyle="#6a5030"; for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; c.lineWidth=i%3?2:4; c.beginPath(); c.moveTo(cx+Math.cos(a)*CR*0.85,cy+Math.sin(a)*CR*0.85); c.lineTo(cx+Math.cos(a)*CR*0.97,cy+Math.sin(a)*CR*0.97); c.stroke(); } c.restore();
      const spin=t<560?(t/560)*Math.PI*0.5:Math.PI*0.5+Math.min(4,(t-560)/130)*Math.PI/2;
      c.save(); c.globalAlpha=show; c.lineCap="round"; for(const [L,w,sp,cc] of [[CR*0.92,5,1,"#d0d8e0"],[CR*0.6,8,0.25,"#8a95a2"]]){ const a=-Math.PI/2+spin*sp; c.strokeStyle="rgba(40,40,50,.7)"; c.lineWidth=w+3; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L); c.stroke(); c.strokeStyle=cc; c.lineWidth=w; c.stroke(); }
      c.fillStyle="#c84a3a"; c.beginPath(); c.arc(cx,cy,R*0.12,0,7); c.fill(); c.restore();
      for(let i=0;i<4;i++){ const T0=560+i*130, k=(t-T0)/300; if(k<0||k>1) continue; atImpact(t,T0,0.3,0); const a=-Math.PI/2+Math.PI/2*(i+1); c.save(); c.globalCompositeOperation="lighter"; atCrescent(c,cx,cy,CR*0.7,a-Math.PI*0.35,k,[255,240,200]); c.restore(); } }},
  /* Mitt: it winds back and spins all the way round, the glove swelling huge, and lands an uppercut that throws the target into the air */
  sg_bigswing:{C:880,D:1580,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      if(t<380){ const k=eo(t/380); return {f:-0.1*k,rot:-d*0.5*k,sx:1+0.1*k,sy:1-0.12*k,pose:"crouch"}; }
      if(t<880){ const k=(t-380)/500; return {f:-0.1+0.72*eio(k),rot:-d*0.5+d*(Math.PI*2+0.7)*eio(k),arc:-14*Math.sin(k*Math.PI),pose:"punch",sx:1.08,sy:0.95}; }
      const k=(t-880)/700; return {f:0.62*(1-eio(k)),rot:d*0.2*(1-eo(k)),arc:-30*Math.sin(Math.min(1,k*2)*Math.PI),pose:k<0.5?"punch":"happy"}; },
    def(t){ if(t<880||t>1580) return null; const k=(t-880)/700, up=Math.sin(Math.min(1,k*1.25)*Math.PI); return {lift:-70*up,off:[24*eo(k),0],rot:0.6*Math.sin(Math.min(1,k*1.2)*Math.PI),pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), gc=x.col||[220,60,60];
      if(t>380&&t<900){ const k=(t-380)/500; c.save(); c.globalCompositeOperation="lighter"; atCrescent(c,s.x,s.y,s.r*1.5,-d*0.5+d*(Math.PI*2+0.7)*eio(k)-Math.PI/2,Math.min(0.95,k),[255,220,170]); c.restore();
        }
      atImpact(t,880,1,0.45);
      if(t>=880){ const k=(t-880)/700; 
        c.save(); c.strokeStyle=`rgba(255,255,255,${0.9*(1-k)})`; c.lineWidth=3; for(let i=0;i<10;i++){ const a=-Math.PI/2+(i-4.5)*0.22; c.beginPath(); c.moveTo(tg.x+Math.cos(a)*R*0.8,tg.y+Math.sin(a)*R*0.8); c.lineTo(tg.x+Math.cos(a)*R*(1.6+k*1.5),tg.y+Math.sin(a)*R*(1.6+k*1.5)); c.stroke(); } c.restore();
        atPow(c,{x:tg.x,y:tg.y-R*0.6},Math.min(1,k*1.3),R/20); SG.ring(c,tg.x,tg.foot,R*(0.5+2*eo(k)),R*(0.15+0.5*eo(k)),[255,230,200],5*(1-k),1-k); } }},
  /* Brolly: it spins open, a raincloud swells over the target and pours down a hard rain, then two big drops burst on it */
  sg_rainshot:{C:720,D:1420,sig:true,
    atk:(t,o)=>({rot:t<500?Math.sin(t/30)*0.15:0,arc:t<500?-10*eo(t/500):-10*(1-Math.min(1,(t-500)/600)),pose:t<500?"cast":t<1200?"push":"idle"}),
    def(t){ const a=SG.shake(t,720,600,2.5); if(a){ a.sy=0.94; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, cy=tg.top.y-R*1.3, cw=R*1.7, show=Math.min(1,Math.max(0,(t-150)/300))*(t>1250?1-(t-1250)/170:1); if(show<=0) return; const WC=[120,180,240];
      atCloud(c,tg.x+Math.sin(t/300)*R*0.1,cy+R*0.45,cw*2.3*(0.6+0.4*show),"#a4adc8","#4e5674","#2c3048",show,0.03*Math.sin(t/150));
      if(t>400){ const dens=Math.min(1,(t-400)/200)*(t>1150?1-(t-1150)/200:1); c.strokeStyle=atRgba(WC,0.85*dens); c.lineWidth=2; c.lineCap="round"; for(let i=0;i<26;i++){ const ph=((t/220)+atH(i*3))%1, px=tg.x+(atH(i)-0.5)*cw*2, py=cy+R*0.2+ph*(tg.foot-cy); c.beginPath(); c.moveTo(px,py); c.lineTo(px-3,py+R*0.25); c.stroke(); }
        for(let i=0;i<6;i++){ const ph=((t/300)+i/6)%1; SG.ring(c,tg.x+(atH(i*5)-0.5)*R*2.4,tg.foot,R*0.15*ph+0.5,R*0.05*ph+0.3,WC,1.5,dens*(1-ph)); } }
      for(const [T0,ox] of [[720,-0.3],[860,0.3]]){ const k=(t-T0+220)/220; if(k>0&&k<1){ const py=cy+R*0.3+(tg.y-cy)*ei(k); c.fillStyle=atRgba(WC,1); c.beginPath(); c.moveTo(tg.x+ox*R,py-R*0.45); c.quadraticCurveTo(tg.x+ox*R+R*0.25,py,tg.x+ox*R,py+R*0.15); c.quadraticCurveTo(tg.x+ox*R-R*0.25,py,tg.x+ox*R,py-R*0.45); c.fill(); }
        const kk=(t-T0)/400; if(kk>=0&&kk<1){ atImpact(t,T0,0.35,0); for(let i=0;i<10;i++){ const a=-Math.PI*(i/9), sp=R*(0.3+1.1*eo(kk)); c.fillStyle=atRgba([200,230,255],1-kk); c.beginPath(); c.arc(tg.x+ox*R+Math.cos(a)*sp,tg.y+Math.sin(a)*sp*0.8+kk*kk*R,R*0.06,0,7); c.fill(); } } } }},
  /* Spine: its arms bristle with spikes, it throws a spiked punch, and a burst of needles flies off and sticks in the target */
  sg_cactuspunch:{C:760,D:1460,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<420){ const k=eo(t/420); return {f:-0.06*k,rot:-d*0.25*k,sx:1+0.12*k,sy:1-0.08*k,pose:"crouch",off:[Math.sin(t/20)*1.5,0]}; }
      if(t<760){ const k=ei((t-420)/340); return {f:-0.06+0.68*k,rot:-d*0.25+d*0.45*k,pose:"punch",sx:1.1,sy:0.93}; } const k=(t-760)/700; return {f:0.62*(1-eio(k)),rot:d*0.2*(1-eo(k)),pose:k<0.5?"punch":"idle"}; },
    def(t){ const a=SG.knock(t,760,1,26,560); if(a) a.flash=t<900?3:0; return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t<760){ const k=Math.min(1,t/420); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, L=s.r*(0.25+0.2*k); SG.needle(c,s.x+Math.cos(a)*s.r*(0.95+0.2*k),s.y+Math.sin(a)*s.r*0.95,L*k,a); } }
      atImpact(t,760,0.75,0.3);
      if(t>=760){ const k=(t-760)/700; atPow(c,{x:tg.x-d*R*0.4,y:tg.y-R*0.1},Math.min(1,k*1.3),R/24);
        for(let i=0;i<14;i++){ const a=(atH(i*3)-0.5)*Math.PI*1.4+(d>0?0:Math.PI), fly=Math.min(1,k*3), stick=atH(i*7)<0.45; const ex=stick?tg.x+(atH(i)-0.5)*R*1.2:tg.x+Math.cos(a)*R*2.4, ey=stick?tg.y+(atH(i*5)-0.5)*R*1.2:tg.y+Math.sin(a)*R*1.6;
          const sx=tg.x-d*R*0.5, sy=tg.y, px=sx+(ex-sx)*fly, py=sy+(ey-sy)*fly; c.globalAlpha=stick?(k<0.8?1:1-(k-0.8)/0.2):1-k; SG.needle(c,px,py,R*0.22,Math.atan2(ey-sy,ex-sx)); c.globalAlpha=1; } } }},
  /* Burr: it dives into the ground, a mound of earth races under the target, and it bursts up with a huge three-claw swipe that throws up dirt */
  sg_clawswipe:{C:900,D:1580,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      if(t<260){ const k=eo(t/260); return {lift:8*k,sy:1-0.94*k,sx:1+0.2*k,rot:d*0.3*k,pose:"crouch"}; }
      if(t<720){ const k=eio((t-260)/460); return {f:0.6*k,lift:8,sy:0.06,sx:1.2,pose:"crouch"}; }
      if(t<900){ const k=eo((t-720)/180); return {f:0.6,lift:8*(1-k),arc:-50*k,rot:-d*0.3*(1-k),pose:"jump",sy:0.06+1.09*k,sx:1.2-0.2*k}; }
      const k=(t-900)/680; return {f:0.6*(1-eio(Math.max(0,k-0.2)/0.8)),arc:-50*(1-eo(Math.min(1,k*2))),rot:d*0.4*Math.sin(Math.min(1,k*3)*Math.PI),pose:k<0.4?"punch":"idle"}; },
    def(t){ if(t>=640&&t<900) return {off:[Math.sin(t/12)*2,0],pose:"hurt"}; return SG.squash(t,900,0.25,520); },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), DIRT=[150,110,70];
      if(t<300) SG.dust(c,s.x,s.foot,s.r,t/300,10);
      if(t>200&&t<900){ const k=Math.min(1,Math.max(0,(t-260)/460)), mx=s.x+(tg.x-s.x)*eio(k), my=s.foot; c.fillStyle=atRgba(DIRT,1); c.beginPath(); c.ellipse(mx,my,s.r*0.75,s.r*0.32,0,Math.PI,Math.PI*2); c.fill();
        c.fillStyle="rgba(120,85,50,.6)"; for(let i=0;i<4;i++){ c.beginPath(); c.arc(mx-d*s.r*(0.6+i*0.4),my-2,s.r*0.12*(1-i*0.2),0,7); c.fill(); } SG.cracks(c,mx,my,s.r*0.8,5,t/300,0.5); }
      atImpact(t,720,0.4,0); atImpact(t,900,0.85,0.3);
      if(t>=720&&t<1300){ const k=(t-720)/580; for(let i=0;i<14;i++){ const a=-Math.PI*(0.1+0.8*atH(i*3)), sp=R*(0.4+1.8*eo(k))*(0.6+0.5*atH(i)); c.fillStyle=atRgba(i%3?DIRT:[110,80,50],1-k); c.beginPath(); c.arc(tg.x+Math.cos(a)*sp*(i%2?1:-1),tg.foot+Math.sin(a)*sp*1.2+k*k*R*2,R*(0.08+0.06*atH(i*7)),0,7); c.fill(); } }
      if(t>=900){ const k=(t-900)/600; SG.claws(c,tg.x,tg.y-R*0.1,R*1.9,k,-d*0.9,[255,255,255]); SG.claws(c,tg.x,tg.y-R*0.1,R*1.9,k-0.02,-d*0.9,[220,160,110]); } }}
});
Object.assign(AR_KIND,{"Talon Dive":"sg_talondive","Night Bite":"sg_nightbite","Sun Flare":"sg_sunflare","Foxfire":"sg_foxfire","Venom Coil":"sg_venomcoil","Drowsy Spores":"sg_spores","Sonar":"sg_sonar",
  "Engulf":"sg_engulf","Second Hand":"sg_secondhand","Big Swing":"sg_bigswing","Rain Shot":"sg_rainshot","Cactus Punch":"sg_cactuspunch","Claw Swipe":"sg_clawswipe"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  sg_talondive:(d,t)=>{ for(let i=0;i<3;i++) dNoise(d,t+i*0.09,0.08,0.12,'lowpass',900); sTone(d,t+0.24,'sine',400,1400,0.32,0.04); sTone(d,t+0.5,'sine',3000,3000,0.1,0.02); sTone(d,t+0.56,'sawtooth',2400,700,0.34,0.035); dNoise(d,t+0.56,0.34,0.14,'bandpass',2200,1.2); dKick(d,t+0.9,0.9); [0.9,0.95,1.0].forEach(x=>dNoise(d,t+x,0.08,0.2,'highpass',3000,2)); },   // wingbeats, a climb, a glint, the screaming dive, talons raking
  sg_nightbite:(d,t)=>{ sTone(d,t,'sawtooth',160,90,0.3,0.04); for(let i=0;i<10;i++) dNoise(d,t+0.22+i*0.035,0.03,0.07,'bandpass',2500+(i%3)*500,3); sTone(d,t+0.7,'sine',1800,2400,0.06,0.03); sTone(d,t+0.78,'square',900,300,0.06,0.05); dNoise(d,t+0.78,0.1,0.2,'bandpass',2800,2); sTone(d,t+0.86,'sine',700,250,0.55,0.05); },   // the cloak, a flutter of bats, the bite and a long drain
  sg_sunflare:(d,t)=>{ sTone(d,t,'sawtooth',90,240,0.48,0.04); dNoise(d,t,0.48,0.08,'bandpass',800,1); dNoise(d,t+0.48,0.38,0.14,'bandpass',1500,1.2); dKick(d,t+0.86,1); dNoise(d,t+0.86,0.7,0.3,'lowpass',700); for(let i=0;i<6;i++) dNoise(d,t+0.9+i*0.06,0.06,0.1,'bandpass',1800+(i%3)*500,2); },   // the sun building, roaring through the air, the burst and crackling fire
  sg_foxfire:(d,t)=>{ dNoise(d,t,0.4,0.04,'highpass',5000); [0.7,0.82,0.94].forEach((x,k)=>{ sTone(d,t+x-0.3,'sine',800+k*200,1600+k*200,0.3,0.03); sTone(d,t+x,'sine',1600+k*200,600,0.18,0.05); dNoise(d,t+x,0.12,0.12,'bandpass',2000,1.5); }); },   // three fox-fires whistling in and bursting
  sg_venomcoil:(d,t)=>{ dNoise(d,t+0.3,0.3,0.1,'highpass',4500,1.2); for(let i=0;i<3;i++) sTone(d,t+0.62+i*0.13,'sawtooth',140,110,0.12,0.05); sTone(d,t+0.72,'square',1200,400,0.05,0.05); for(let i=0;i<5;i++) sTone(d,t+0.85+i*0.08,'sine',300+i*70,520+i*70,0.07,0.03); },   // a hiss, three squeezes, the bite, venom bubbling
  sg_spores:(d,t)=>{ for(let i=0;i<6;i++) dNoise(d,t+i*0.07,0.05,0.06,'bandpass',800,1.5); [784,659,523,440,392].forEach((f,k)=>sTone(d,t+0.4+k*0.12,'sine',f,f*0.99,0.4,0.03)); sTone(d,t+0.86,'sine',400,200,0.7,0.03); },   // a cap shaking, a sleepy falling tune, a yawn
  sg_sonar:(d,t)=>{ for(let i=0;i<7;i++) sTone(d,t+0.3+i*0.08,'sine',2600-i*120,2200-i*120,0.1,0.035); dNoise(d,t+0.64,0.5,0.1,'bandpass',3000,1); sTone(d,t+0.64,'sine',600,640,0.6,0.03); },   // a screech of pulses and a ringing in the ears
  sg_engulf:(d,t)=>{ sTone(d,t,'sine',200,500,0.3,0.05); dNoise(d,t+0.3,0.4,0.08,'lowpass',500); dKick(d,t+0.7,0.4); sTone(d,t+0.7,'sine',300,90,0.3,0.07); for(let i=0;i<6;i++) sTone(d,t+0.8+i*0.06,'sine',220+i*40,400+i*40,0.06,0.03); sTone(d,t+1.15,'sine',150,700,0.12,0.06); },   // stretching, a wet flop, gulping bubbles, a spit
  sg_secondhand:(d,t)=>{ for(let i=0;i<4;i++) sTone(d,t+i*0.14,'square',2000,2000,0.02,0.03); [0.56,0.69,0.82,0.95].forEach(x=>{ sTone(d,t+x,'square',2600,2600,0.025,0.04); dNoise(d,t+x,0.08,0.18,'highpass',3500,1.5); }); sTone(d,t+1.1,'triangle',1800,1800,0.3,0.03); },   // ticking, four slicing ticks, a ding
  sg_bigswing:(d,t)=>{ dNoise(d,t,0.3,0.06,'lowpass',500); for(let i=0;i<4;i++) dNoise(d,t+0.4+i*0.11,0.1,0.08+i*0.03,'bandpass',600+i*200,1); dKick(d,t+0.88,1); dNoise(d,t+0.88,0.15,0.35,'bandpass',1200,1); sTone(d,t+0.95,'sine',400,1400,0.5,0.03); },   // winding up, a whooshing spin, a huge smack, the target flying off
  sg_rainshot:(d,t)=>{ sTone(d,t,'sine',300,700,0.4,0.03); dNoise(d,t+0.2,0.3,0.08,'lowpass',400); dNoise(d,t+0.4,0.8,0.14,'bandpass',4000,0.5); [0.72,0.86].forEach(x=>{ dKick(d,t+x,0.3); dNoise(d,t+x,0.25,0.22,'lowpass',1200); }); },   // an umbrella spinning, thunder, heavy rain, two big splashes
  sg_cactuspunch:(d,t)=>{ for(let i=0;i<6;i++) sTone(d,t+i*0.06,'triangle',2600,2400,0.03,0.02); dNoise(d,t+0.42,0.3,0.12,'bandpass',900,1); dKick(d,t+0.76,0.8); dNoise(d,t+0.76,0.1,0.25,'bandpass',1500,1.2); for(let i=0;i<8;i++) dNoise(d,t+0.8+i*0.025,0.03,0.08,'highpass',5000,3); },   // spikes popping out, the punch, needles thwipping into the target
  sg_clawswipe:(d,t)=>{ dNoise(d,t,0.25,0.2,'lowpass',300); dNoise(d,t+0.26,0.46,0.15,'lowpass',200); dKick(d,t+0.72,0.6); dNoise(d,t+0.72,0.3,0.2,'lowpass',600); [0.9,0.93,0.96].forEach(x=>dNoise(d,t+x,0.1,0.22,'highpass',2800,2)); }   // digging in, rumbling underground, bursting up, three claw rakes
});
if(typeof SWING!=="undefined") ["sg_talondive","sg_bigswing","sg_cactuspunch","sg_clawswipe","sg_venomcoil"].forEach(k=>SWING.add(k));


/* ---------- group C ---------- */
SG.ball=(c,x,y,r,col)=>{ const g=c.createRadialGradient(x-r*0.35,y-r*0.35,r*0.1,x,y,r); g.addColorStop(0,atRgba(col.map(v=>Math.min(255,v+50)),1)); g.addColorStop(1,atRgba(col,1)); c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,7); c.fill();
  c.strokeStyle="rgba(80,50,50,.35)"; c.lineWidth=1.5; c.stroke(); c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(x-r*0.35,y-r*0.4,r*0.25,r*0.15,-0.5,0,7); c.fill(); };
SG.crane=(c,x,y,z,a,col="#fff8f0")=>{ c.save(); c.translate(x,y); c.rotate(a); c.fillStyle=col; c.strokeStyle="rgba(150,120,110,.7)"; c.lineWidth=1;
  c.beginPath(); c.moveTo(-z,0); c.lineTo(0,-z*0.15); c.lineTo(z,-z*0.5); c.lineTo(z*0.3,z*0.1); c.closePath(); c.fill(); c.stroke();
  c.fillStyle="#ffd4d4"; c.beginPath(); c.moveTo(-z*0.2,0); c.lineTo(z*0.1,-z*0.9); c.lineTo(z*0.35,0); c.closePath(); c.fill(); c.stroke(); c.restore(); };
SG.note=(c,x,y,z,col,a)=>{ if(typeof atNote==="function") atNote(c,x,y,z,col,a,false); };
Object.assign(ANIM,{
  /* Wick: its flame shoots up tall and wax pours down its sides, then it flings a wave of burning wax that coats the target and catches */
  sg_meltdown:{C:800,D:1500,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<480){ const k=eo(t/480); return {sy:1+0.1*k-0.04*Math.sin(t/40),sx:1-0.05*k,pose:"cast"}; } if(t<640){ const k=eo((t-480)/160); return {rot:d*0.3*k,sy:0.92,sx:1.08,pose:"push"}; } const k=(t-640)/860; return {rot:d*0.3*(1-eo(k)),sy:0.92+0.08*eo(k),sx:1.08-0.08*eo(k),pose:"idle"}; },
    def(t){ const a=SG.shake(t,800,650,3); if(a){ a.sy=1-0.06; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), WAX=[255,236,200], top={x:s.x,y:s.top.y+s.r*0.1};
      if(t<700){ const k=Math.min(1,t/480); SG.flame(c,top.x,top.y,s.r*(0.6+1.4*k),s.r*(0.2+0.2*k),t,1,1); for(let i=0;i<4;i++){ const dr=Math.min(1,Math.max(0,(t-i*90)/400)); c.fillStyle=atRgba(WAX,1); c.beginPath(); c.ellipse(s.x+(i-1.5)*s.r*0.45,s.top.y+s.r*0.3+dr*s.r*0.8,s.r*0.09,s.r*0.12+dr*s.r*0.12,0,0,7); c.fill(); } }
      if(t>480&&t<820){ const k=(t-480)/320; for(let i=0;i<9;i++){ const q=Math.max(0,Math.min(1,k*1.3-i*0.04)), p=lerpP({x:s.x+d*s.r*0.5,y:s.y-s.r*0.3},{x:tg.x,y:tg.top.y+R*0.3},eio(q),R*(1+0.4*(i%3)),(i-4)*R*0.08);
          c.fillStyle=atRgba(i%3?WAX:[255,170,90],1); c.beginPath(); c.arc(p.x,p.y,R*(0.12+0.05*(i%2)),0,7); c.fill(); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,p.x,p.y,R*0.25,[255,160,60],0.5); c.restore(); } }
      if(t>=800){ atImpact(t,800,0.55,0.25); const k=(t-800)/700, out=k>0.8?1-(k-0.8)/0.2:1; c.save(); c.globalAlpha=out;
        c.fillStyle=atRgba(WAX,1); c.strokeStyle="rgba(200,160,110,.6)"; c.lineWidth=1.5; c.beginPath(); c.ellipse(tg.x,tg.top.y+R*0.25,R*1.05,R*0.32,0,0,7); c.fill(); c.stroke();
        for(let i=0;i<6;i++){ const dr=Math.min(1,Math.max(0,k*1.6-i*0.06)), dx=tg.x+(i-2.5)*R*0.38; c.fillStyle=atRgba(WAX,1); c.fillRect(dx-R*0.07,tg.top.y+R*0.25,R*0.14,dr*R*(0.4+0.4*atH(i))); c.beginPath(); c.arc(dx,tg.top.y+R*0.25+dr*R*(0.4+0.4*atH(i)),R*0.09,0,7); c.fill(); }
        for(let i=0;i<4;i++) SG.flame(c,tg.x+(i-1.5)*R*0.5,tg.top.y+R*0.2,R*(0.5+0.3*(i%2))*Math.min(1,k*3),R*0.16,t,i*2,1); c.restore(); } }},
  /* Lumo: its tail lights up and a swarm of fireflies pours out, circles the target in a ball of light, then they all flash at once */
  sg_lanternflash:{C:820,D:1500,sig:true,
    atk:t=>({pose:t<820?"cast":t<1200?"push":"idle",arc:-6*Math.sin(Math.min(1,t/820)*Math.PI),sx:1+0.05*Math.sin(t/80),flash:t>780&&t<880?3:0}),
    def(t){ if(t<820||t>1500) return null; return {pose:"hurt",off:[Math.sin(t/22)*2,0],sx:0.95,sy:0.95}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, FY=[220,255,120], cen={x:tg.x,y:tg.y-R*0.2}; c.save(); c.globalCompositeOperation="lighter";
      for(let i=0;i<22;i++){ const st=atH(i*3)*250, k=Math.min(1,Math.max(0,(t-st)/520)); if(k<=0) continue; const orbit=t/220+i*0.9, rr=R*(1.0+0.4*atH(i*7)), op={x:cen.x+Math.cos(orbit)*rr,y:cen.y+Math.sin(orbit)*rr*0.75};
        const p=k<1?lerpP({x:s.x,y:s.y},op,eio(k),R*(0.5+atH(i)),(atH(i*5)-0.5)*R*1.5):op, on=0.5+0.5*Math.sin(t/60+i*2), fade=t>1200?1-(t-1200)/300:1; atGlowA(c,p.x,p.y,R*0.12,FY,(0.4+0.6*on)*fade); c.fillStyle=`rgba(255,255,220,${fade})`; c.fillRect(p.x-1,p.y-1,2,2); }
      if(t>=820){ atImpact(t,820,0.4,0.6); const k=(t-820)/600; atGlowA(c,cen.x,cen.y,R*(1.2+1.6*eo(k)),FY,0.9*(1-k)); for(let i=0;i<22;i++){ const a=i/22*Math.PI*2; atStar4(c,cen.x+Math.cos(a)*R*(1+k*0.8),cen.y+Math.sin(a)*R*0.75*(1+k*0.8),R*0.2*(1-k),"rgba(255,255,200,.95)"); } }
      c.restore(); }},
  /* Snooze: it yawns, floats up like a drifting pillow and flops down on the target with a thump that bursts feathers out */
  sg_sleepyslam:{C:880,D:1560,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<300){ const k=eo(t/300); return {sy:1+0.12*k,sx:1-0.06*k,pose:"cast"}; }
      if(t<700){ const k=eio((t-300)/400); return {f:0.6*k,arc:-120*Math.sin(k*Math.PI/2)-Math.sin(t/80)*4,rot:Math.sin(t/120)*0.15,pose:"float"}; }
      if(t<880){ const k=ei((t-700)/180); return {f:0.62,arc:-120*(1-k),rot:d*0.15*k,sx:1+0.25*k,sy:1-0.2*k,pose:"tackle"}; }
      const k=(t-880)/680; return {f:0.62*(1-eio(Math.max(0,k-0.25)/0.75)),sx:1.25-0.25*eo(k),sy:0.8+0.2*eo(k),pose:k<0.4?"land":"happy"}; },
    def:t=>SG.squash(t,880,0.42,600),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r;
      if(t<700) for(let i=0;i<3;i++){ const ph=((t/700)+i/3)%1; SG.zzz(c,s.x+s.r*(0.4+ph*0.5),s.top.y-ph*s.r*1.1,s.r*(0.16+0.08*i),Math.sin(ph*Math.PI)); }
      atImpact(t,880,0.8,0.25);
      if(t>=880){ const k=(t-880)/680; for(let i=0;i<16;i++){ const a=-Math.PI*(atH(i*3)), sp=R*(0.4+1.8*eo(k)), fl=Math.sin(t/120+i)*R*0.2; SG.feather(c,tg.x+Math.cos(a)*sp*(i%2?1:-1)+fl,tg.y+Math.sin(a)*sp+k*R*1.2,R*0.18,t/200+i,"#fbf8ff",1-k); }
        SG.dust(c,tg.x,tg.foot,R*1.2,k,10); for(let i=0;i<3;i++){ const ph=(k+i/3)%1; SG.zzz(c,tg.x+R*(0.4+ph*0.6),tg.top.y-ph*R,R*(0.15+0.1*i),Math.sin(ph*Math.PI)*(1-k*0.5)); } } }},
  /* Inky: it melts into a puddle, the puddle races across, and splashes up round the target into a huge mirrored ink blot that drains away */
  sg_inkblot:{C:760,D:1460,sig:true,
    atk:t=>{ if(t<300){ const k=eo(t/300); return {sy:1-0.85*k,sx:1+0.4*k,pose:"crouch"}; } if(t<1100) return {sy:0.15,sx:1.4,pose:"crouch"}; const k=eo((t-1100)/300); return {sy:0.15+0.85*k,sx:1.4-0.4*k,pose:"idle"}; },
    def(t){ if(t<760||t>1460) return null; return {pose:"hurt",off:[Math.sin(t/30)*2,0],flash:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, INK=[34,26,52];
      if(t>250&&t<800){ const k=Math.min(1,(t-250)/450), px=s.x+(tg.x-s.x)*eio(k); c.fillStyle=atRgba(INK,0.9); c.beginPath(); c.ellipse(px,tg.foot,R*0.8,R*0.18,0,0,7); c.fill(); for(let i=0;i<5;i++){ c.beginPath(); c.arc(px-atDir(x)*R*(0.7+i*0.3),tg.foot,R*0.1*(1-i*0.15),0,7); c.fill(); } }
      if(t<700) return; atImpact(t,760,0.5,0.15);
      const g=eo(Math.min(1,(t-700)/250)), drain=t>1150?Math.min(1,(t-1150)/300):0, cy=tg.y-R*0.15; c.save(); c.fillStyle=atRgba(INK,0.88*(1-drain*0.8));
      for(const sd of [-1,1]){ c.beginPath(); for(let j=0;j<=24;j++){ const a=-Math.PI/2+j/24*Math.PI, rr=R*(0.9+0.5*Math.sin(a*3+1)+0.25*Math.sin(a*7+2))*g*(1-drain*0.3); c.lineTo(tg.x+sd*Math.cos(a)*rr,cy+Math.sin(a)*rr*1.05+drain*R*0.8); } c.closePath(); c.fill(); }
      for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+0.4, rr=R*(1.5+0.3*atH(i))*g; for(const sd of [-1,1]){ c.beginPath(); c.arc(tg.x+sd*Math.abs(Math.cos(a))*rr,cy+Math.sin(a)*rr+drain*R,R*(0.1+0.08*atH(i*3)),0,7); c.fill(); } }
      c.fillStyle=`rgba(160,140,220,${0.4*(1-drain)})`; c.beginPath(); c.ellipse(tg.x-R*0.4,cy-R*0.5,R*0.25,R*0.1,-0.4,0,7); c.fill(); c.restore(); }},
  /* Cobble: it curls into a boulder and rolls across the arena, gathering speed and rubble, and crashes through the target in a spray of stones */
  sg_rubbleroll:{C:780,D:1460,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<280){ const k=eo(t/280); return {sx:1-0.1*k,sy:1-0.18*k,rot:-d*0.6*k,pose:"crouch"}; }
      if(t<780){ const k=ei((t-280)/500), th=-d*0.6+d*Math.PI*4*k, h=SG.half||26; return {f:0.7*k,rot:th,arc:-h*(1-Math.cos(th))-Math.abs(Math.sin(k*Math.PI*3))*8,off:[-h*Math.sin(th),0],sx:0.9,sy:0.82,pose:"crouch"}; }
      const k=(t-780)/680; return {f:0.7-0.7*eio(Math.max(0,k-0.15)/0.85),arc:-40*Math.sin(Math.min(1,k*2)*Math.PI),rot:d*0.4*(1-k),sx:0.9+0.1*eo(k),sy:0.82+0.18*eo(k),pose:k<0.5?"jump":"idle"}; },
    def(t){ const a=SG.knock(t,780,1,30,560); if(a) a.rot=0.3*(1-(t-780)/560); return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t>280&&t<800){ const k=(t-280)/500, px=s.x; for(let i=0;i<6;i++){ const ph=((t/180)+i/6)%1; SG.puff(c,px-d*s.r*(0.5+ph*1.4),s.foot-ph*s.r*0.4,s.r*(0.12+0.2*ph),(1-ph)*0.7*Math.min(1,k*3),[220,205,180]); }
        for(let i=0;i<4;i++){ const ph=((t/150)+i/4)%1; SG.shard(c,px-d*s.r*(0.4+ph),s.foot-Math.sin(ph*Math.PI)*s.r*0.6,s.r*0.1,t/50+i,"#a89a88"); }
        c.strokeStyle="rgba(255,255,255,.5)"; c.lineWidth=2; for(let i=0;i<4;i++){ const yy=s.y+(i-1.5)*s.r*0.35; c.beginPath(); c.moveTo(px-d*s.r*1.1,yy); c.lineTo(px-d*s.r*(1.8+k),yy); c.stroke(); } }
      atImpact(t,780,0.9,0.3);
      if(t>=780){ const k=(t-780)/680; for(let i=0;i<16;i++){ const a=-Math.PI*(0.05+0.9*atH(i*3)), sp=R*(0.5+2.2*eo(k))*(0.6+0.5*atH(i)); SG.shard(c,tg.x+d*Math.abs(Math.cos(a))*sp*(i%3?1:-0.5),tg.y+Math.sin(a)*sp*0.8+k*k*R*2,R*(0.1+0.08*atH(i*5)),t/90+i,i%2?"#9c8e7c":"#c4b6a0"); }
        SG.dust(c,tg.x,tg.foot,R*1.2,k,10); atPow(c,{x:tg.x-d*R*0.3,y:tg.y-R*0.3},Math.min(1,k*1.3),R/24); } }},
  /* Nimbo: it rises up and a column of wind and rain slams straight down on the target, pressing it flat, with a splash ring round its feet */
  sg_downdraft:{C:760,D:1460,sig:true,
    atk:t=>({arc:t<760?-30*eo(t/760):-30*(1-eo((t-760)/700)),pose:t<760?"cast":"push",sx:1+0.06*Math.sin(t/60),sy:1-0.06*Math.sin(t/60)}),
    def(t){ if(t<760||t>1460) return null; const a=t<1150?1:1-(t-1150)/310; return {sx:1+0.25*a,sy:1-0.35*a,pose:"hurt",off:[Math.sin(t/14)*2*a,0]}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, top=Math.max(0,tg.top.y-R*4), WC=[170,210,255], col=x.col||WC, show=t<500?eo(t/500):t>1250?1-(t-1250)/210:1; if(show<=0) return;
      const w=R*(0.6+0.6*Math.min(1,Math.max(0,(t-500)/260))); c.save(); c.globalAlpha=show;
      const g=c.createLinearGradient(tg.x-w,0,tg.x+w,0); g.addColorStop(0,"rgba(200,225,255,0)"); g.addColorStop(0.5,atRgba(WC,0.4)); g.addColorStop(1,"rgba(200,225,255,0)"); c.fillStyle=g; c.fillRect(tg.x-w,top,w*2,tg.foot-top);
      c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=2; c.lineCap="round"; for(let i=0;i<12;i++){ const ph=((t/200)+atH(i*3))%1, px=tg.x+(atH(i)-0.5)*w*1.8, py=top+ph*(tg.foot-top); c.beginPath(); c.moveTo(px,py); c.lineTo(px,py+R*0.5); c.stroke(); }
      for(let i=0;i<5;i++){ const ph=((t/260)+i/5)%1, y=top+ph*(tg.foot-top); c.strokeStyle=atRgba(col,0.5*(1-ph*0.5)); c.lineWidth=2.5; c.beginPath(); c.ellipse(tg.x,y,w*(0.9+0.2*Math.sin(t/80+i)),R*0.15,0,0,Math.PI); c.stroke(); }
      if(t>=760){ atImpact(t,760,0.6,0.15); const k=(t-760)/700; for(let i=0;i<3;i++){ const kk=Math.min(1,Math.max(0,k*1.5-i*0.15)); SG.ring(c,tg.x,tg.foot,R*(0.6+2.2*eo(kk)),R*(0.18+0.5*eo(kk)),[220,240,255],4*(1-kk),1-kk); }
        for(let i=0;i<12;i++){ const a=-Math.PI*(i/11), sp=R*(0.6+1.4*eo(Math.min(1,k*1.5))); c.fillStyle=`rgba(210,235,255,${1-k})`; c.beginPath(); c.arc(tg.x+Math.cos(a)*sp,tg.foot+Math.sin(a)*sp*0.5+k*k*R*0.5,R*0.06,0,7); c.fill(); } }
      c.restore(); }},
  /* Dango: it fires its three dumplings one after another; they bonk the target, bounce, stack on its head, and a skewer spears all three */
  sg_triplestack:{C:600,D:1300,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; for(let i=0;i<3;i++){ const T0=300+i*120; if(t>=T0&&t<T0+120) return {sx:1.12,sy:0.88,rot:d*0.12,pose:"push"}; } return {pose:t<300?"cast":t<1000?"happy":"idle",sy:t<300?1-0.1*eo(t/300):1}; },
    def(t){ for(let i=0;i<3;i++){ const T0=600+i*120; if(t>=T0&&t<T0+110) return {sx:1.1,sy:0.85,off:[6,0],pose:"hit"}; } return t>=960&&t<1300?{pose:"hurt",sy:0.94}:null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), cols=[[255,160,190],[250,245,235],[150,210,120]], head={x:tg.x,y:tg.top.y};
      for(let i=0;i<3;i++){ const T0=300+i*120, T1=600+i*120, br=R*0.32, rest={x:head.x,y:head.y-br*(0.9+1.8*i)};
        if(t<T0) continue; let p;
        if(t<T1){ const k=(t-T0)/(T1-T0); p=lerpP({x:s.x+d*s.r*0.6,y:s.y-s.r*0.3},{x:tg.x-d*R*0.3,y:tg.y-R*0.2},eio(k),R*1.2); }
        else if(t<T1+220){ const k=(t-T1)/220; p=lerpP({x:tg.x-d*R*0.3,y:tg.y-R*0.2},rest,eo(k),R*1.4); if(k<0.4){ atImpact(t,T1,0.3,0); atPow(c,{x:tg.x-d*R*0.3,y:tg.y-R*0.2},k/0.4*0.8,R/34); } }
        else p=rest;
        const out=t>1200?1-(t-1200)/100:1; c.globalAlpha=Math.max(0,out); SG.ball(c,p.x,p.y,br,cols[i]); c.globalAlpha=1; }
      if(t>960&&t<1300){ const k=Math.min(1,(t-960)/160), out=t>1200?1-(t-1200)/100:1; c.globalAlpha=Math.max(0,out); c.strokeStyle="#c89a5a"; c.lineWidth=R*0.08; c.lineCap="round"; c.beginPath(); c.moveTo(head.x,head.y+R*0.1); c.lineTo(head.x,head.y-R*0.32*(0.9+1.8*2)-R*0.5*k); c.stroke(); c.globalAlpha=1; atImpact(t,960,0.2,0); } }},
  /* Oaklet: the ground splits under the target and roots burst up, curl round it and grip, with new leaves sprouting along them */
  sg_rootsnare:{C:700,D:1400,sig:true,
    atk:t=>({pose:t<700?"cast":t<1200?"push":"idle",sy:1-0.08*Math.sin(Math.min(1,t/700)*Math.PI),rot:Math.sin(t/90)*0.04}),
    def(t){ if(t<700||t>1400) return null; return {pose:"hurt",off:[Math.sin(t/35)*2.5,0],rot:Math.sin(t/70)*0.06}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, h=tg.foot-tg.top.y;
      if(t>300&&t<760){ const k=(t-300)/460; SG.cracks(c,tg.x,tg.foot,R*1.6*k,7,0.8,1); SG.dust(c,tg.x,tg.foot,R,k*0.6,6); }
      if(t<560) return; const g=eo(Math.min(1,(t-560)/320)), out=t>1250?1-(t-1250)/150:1; if(out<=0) return; atImpact(t,700,0.45,0); c.save(); c.globalAlpha=out; c.lineCap="round";
      for(let r=0;r<5;r++){ const sd=r%2?1:-1, bx=tg.x+sd*R*(0.5+0.25*(r>>1)), N=20; c.beginPath(); c.moveTo(bx,tg.foot);
        for(let j=1;j<=N*g;j++){ const q=j/N, px=bx-sd*R*0.9*Math.sin(q*Math.PI*1.2)+Math.sin(q*9+r)*R*0.08, py=tg.foot-q*h*(0.75+0.15*(r%3)); c.lineTo(px,py); }
        c.strokeStyle="#5a3a22"; c.lineWidth=R*0.2*(1-0.3*(r%2)); c.stroke(); c.strokeStyle="#8a5c34"; c.lineWidth=R*0.12*(1-0.3*(r%2)); c.stroke();
        for(let j=4;j<=N*g;j+=5){ const q=j/N, px=bx-sd*R*0.9*Math.sin(q*Math.PI*1.2), py=tg.foot-q*h*(0.75+0.15*(r%3)); c.save(); c.translate(px,py); c.rotate(sd*0.8+q); c.fillStyle="#6fbf4a"; c.beginPath(); c.ellipse(R*0.12,0,R*0.14,R*0.06,0,0,7); c.fill(); c.restore(); } }
      c.restore(); }},
  /* Roly: it curls into a ball, its armour bands slide shut one by one and shine, and it rocks in place */
  sg_curlup:{C:480,D:1150,sig:true,
    atk:t=>{ const k=eo(Math.min(1,t/320)), un=t>980?eo((t-980)/170):0; return {sx:1-0.1*k*(1-un),sy:1-0.22*k*(1-un),rot:(t>480&&t<980?Math.sin((t-480)/90)*0.18:0),pose:"crouch"}; },
    def:()=>null,
    fx(c,t,x){ const s=x.self, R=s.r, cx=s.x, cy=s.y+R*0.1, out=t>1000?1-(t-1000)/150:1; if(out<=0) return; c.save(); c.globalAlpha=out; const rot=t>480&&t<980?Math.sin((t-480)/90)*0.18:0;
      for(let i=0;i<5;i++){ const k=Math.min(1,Math.max(0,(t-60-i*70)/200)); if(k<=0) continue; const a0=-Math.PI*0.95+i*0.38+rot; c.strokeStyle="#5a4a3a"; c.lineWidth=R*0.46; c.lineCap="round"; c.beginPath(); c.arc(cx,cy,R*0.92,a0,a0+0.34*eo(k)); c.stroke();
        c.strokeStyle="#b8a284"; c.lineWidth=R*0.34; c.stroke(); c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=R*0.07; c.beginPath(); c.arc(cx,cy,R*1.02,a0,a0+0.34*eo(k)); c.stroke(); }
      if(t>=480){ const k=Math.min(1,(t-480)/420); atImpact(t,480,0.2,0); c.globalCompositeOperation="lighter"; atStar4(c,cx-R*0.7+k*R*1.4,cy-R*1.0,R*0.35*Math.sin(k*Math.PI),"rgba(255,255,255,.95)"); SG.ring(c,cx,cy,R*(1.2+0.5*k),R*(1.2+0.5*k),[255,240,200],3*(1-k),1-k); }
      c.restore(); }},
  /* Trundle: it glides forward leaving a shining trail of slime that races to the target, gloops round its feet and holds it in sticky strands */
  sg_stickytrail:{C:720,D:1420,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return t<720?{f:0.12*eo(t/720),sx:1+0.08*Math.sin(t/70),sy:1-0.05*Math.sin(t/70),pose:"cast"}:{f:0.12*(1-eo((t-720)/700)),pose:t<1150?"push":"idle"}; },
    def(t){ if(t<720||t>1420) return null; return {pose:"hurt",sy:0.92+0.04*Math.sin(t/70),sx:1.06,off:[Math.sin(t/50)*2,0]}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, SL=[170,230,150], fy=tg.foot, out=t>1270?1-(t-1270)/150:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      const k=Math.min(1,t/720), ex=s.x+(tg.x-s.x)*eio(k); c.fillStyle=atRgba(SL,0.55); c.beginPath(); c.moveTo(s.x,fy-R*0.06); for(let j=0;j<=20;j++){ const q=j/20, px=s.x+(ex-s.x)*q; c.lineTo(px,fy-R*(0.06+0.04*Math.sin(q*10+t/90))); } for(let j=20;j>=0;j--){ const q=j/20, px=s.x+(ex-s.x)*q; c.lineTo(px,fy+R*(0.06+0.04*Math.sin(q*12))); } c.closePath(); c.fill();
      c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<8;i++){ const q=((t/500)+i/8)%1; atStar4(c,s.x+(ex-s.x)*q,fy-R*0.03,R*0.08*Math.sin(q*Math.PI),"rgba(230,255,220,.9)"); } c.restore();
      if(t>=720){ atImpact(t,720,0.35,0); const g=eo(Math.min(1,(t-720)/250)); c.fillStyle=atRgba(SL,0.7); c.beginPath(); c.ellipse(tg.x,fy,R*1.3*g,R*0.32*g,0,0,7); c.fill();
        c.strokeStyle=atRgba(SL,0.85); c.lineCap="round"; for(let i=0;i<7;i++){ const bx=tg.x+(i-3)*R*0.3, hh=R*(0.4+0.4*atH(i))*g*(1+0.1*Math.sin(t/80+i)); c.lineWidth=R*(0.06+0.04*(i%2)); c.beginPath(); c.moveTo(bx,fy); c.quadraticCurveTo(bx+Math.sin(t/120+i)*R*0.15,fy-hh*0.6,bx+(i-3)*R*0.05,fy-hh); c.stroke(); }
        c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(tg.x-R*0.5,fy-R*0.05,R*0.25,R*0.05,0,0,7); c.fill(); }
      c.restore(); }},
  /* Clank: the key on its back cranks round, then it lets loose five clockwork punches in a blur, sparks and springs flying off the target */
  sg_windup:{C:560,D:1260,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<360){ const k=eo(t/360); return {f:0.4*k,rot:Math.sin(t/25)*0.05,sy:1-0.06*k,pose:"crouch"}; }
      if(t<1000){ const i=Math.floor((t-360)/128), ph=((t-360)%128)/128, hit=Math.sin(ph*Math.PI); return {f:0.48+0.16*hit,rot:d*(i%2?0.18:-0.05)*hit,off:[Math.sin(t/9)*1.5,0],pose:"punch",sx:1+0.05*hit}; }
      const k=(t-1000)/260; return {f:0.48*(1-eio(k)),pose:"idle"}; },
    def(t){ if(t<480||t>1260) return null; const ph=((t-480)%128)/128; return {off:[8*Math.sin(ph*Math.PI)+(t>1000?0:3),0],pose:"hit",flash:Math.floor(t/64)%2?2:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), MT=[190,200,210];
      if(t<700){ const k=Math.min(1,t/360), kx=s.x-d*s.r*0.95, ky=s.y-s.r*0.2, sp=t/40; c.save(); c.translate(kx,ky); c.scale(Math.cos(sp),1); c.fillStyle="#d8b85a"; c.strokeStyle="#7a5a20"; c.lineWidth=2;
        for(const sd of [-1,1]){ c.beginPath(); c.ellipse(sd*s.r*0.25,0,s.r*0.22,s.r*0.16,0,0,7); c.fill(); c.stroke(); } c.fillRect(-s.r*0.05,-s.r*0.05,s.r*0.1,s.r*0.1); c.restore(); }
      for(let i=0;i<5;i++){ const T0=488+i*128, k=(t-T0)/260; if(k<0||k>1) continue; atImpact(t,T0,0.22+i*0.04,0); const p={x:tg.x-d*R*(0.5+0.1*(i%2)),y:tg.y+(i%2?-1:1)*R*0.25};
        c.save(); c.globalCompositeOperation="lighter"; for(let j=0;j<6;j++){ const a=atH(i*9+j)*Math.PI*2, L=R*(0.3+0.6*k); c.strokeStyle=`rgba(255,220,120,${1-k})`; c.lineWidth=2; c.beginPath(); c.moveTo(p.x+Math.cos(a)*R*0.2,p.y+Math.sin(a)*R*0.2); c.lineTo(p.x+Math.cos(a)*L,p.y+Math.sin(a)*L); c.stroke(); } c.restore(); }
      if(t>1000&&t<1260){ const k=(t-1000)/260; c.strokeStyle=`rgba(150,160,170,${1-k})`; c.lineWidth=2; c.beginPath(); for(let j=0;j<=24;j++){ const q=j/24; c.lineTo(tg.x+R*0.6+Math.cos(q*Math.PI*8)*R*0.12,tg.top.y-k*R*0.8-q*R*0.6); } c.stroke(); } }},
  /* Crease: it unfolds into a flock of paper cranes that swirl up and dive on the target in four waves, leaving paper scraps fluttering */
  sg_cranes:{C:640,D:1340,sig:true,
    atk:t=>({pose:t<640?"cast":t<1100?"push":"idle",sx:t<500?1-0.25*eo(t/500):0.75+0.25*eo((t-500)/600),sy:t<500?1-0.1*eo(t/500):0.9+0.1*eo((t-500)/600),rot:Math.sin(t/70)*0.06}),
    def(t){ for(let i=0;i<4;i++){ const T0=640+i*110; if(t>=T0&&t<T0+100) return {off:[7,0],pose:"hit",flash:2}; } return t>=1080&&t<1340?{pose:"hurt"}:null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), cols=["#fff8f0","#ffd6d6","#d6e8ff","#fff0b8"];
      for(let i=0;i<20;i++){ const wave=i%4, T0=120+i*14, T1=640+wave*110; if(t<T0||t>T1+300) continue;
        let p, a; if(t<T1-260){ const k=(t-T0)/(T1-260-T0), orb=t/180+i*0.8; p={x:s.x+Math.cos(orb)*s.r*(0.9+0.6*k),y:s.y-s.r*(0.5+1.2*k)+Math.sin(orb)*s.r*0.35}; a=orb+Math.PI/2; }
        else if(t<T1){ const k=(t-(T1-260))/260, from={x:s.x+Math.cos((T1-260)/180+i*0.8)*s.r*1.5,y:s.y-s.r*1.7}; p=lerpP(from,{x:tg.x+(atH(i)-0.5)*R*0.8,y:tg.y+(atH(i*3)-0.5)*R*0.8},ei(k),R*0.5); a=Math.atan2(tg.y-from.y,tg.x-from.x); }
        else { const k=(t-T1)/300; p={x:tg.x+(atH(i)-0.5)*R*(0.8+2*k),y:tg.y+(atH(i*3)-0.5)*R+k*R*1.2}; a=t/100+i; c.globalAlpha=1-k; }
        SG.crane(c,p.x,p.y,R*0.22,a,cols[i%4]); c.globalAlpha=1; if(t>=T1&&t<T1+60) atImpact(t,T1,0.2,0); } }},
  /* Twiglet: a pair of giant garden shears opens beside the target and snips shut through it, scattering leaves and twigs */
  sg_snip:{C:760,D:1460,contact:false,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return t<760?{rot:-d*0.15*eo(t/760),pose:"cast",sx:1+0.04*Math.sin(t/60)}:{rot:d*0.15*(1-eo((t-760)/600)),pose:t<1100?"push":"idle"}; },
    def(t){ const a=SG.knock(t,760,1,14,500); if(a){ a.flash=t<850?3:0; } return a; },
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x), piv={x:tg.x-d*R*1.5,y:tg.y-R*0.1}, L=R*2.6, show=Math.min(1,t/200)*(t>1250?1-(t-1250)/200:1); if(show<=0) return;
      const open=t<560?0.55*eo(t/560):t<760?0.55*(1-ei((t-560)/200)):0.0, base=d>0?0:Math.PI; c.save(); c.globalAlpha=show;
      for(const sd of [-1,1]){ const a=base+sd*open; c.save(); c.translate(piv.x,piv.y); c.rotate(a);
        c.fillStyle="#d8dde4"; c.strokeStyle="#5a6068"; c.lineWidth=2; c.beginPath(); c.moveTo(0,0); c.lineTo(L,-sd*R*0.05); c.lineTo(L*0.98,sd*R*0.12); c.quadraticCurveTo(L*0.5,sd*R*0.3,0,sd*R*0.12); c.closePath(); c.fill(); c.stroke();
        c.fillStyle="rgba(255,255,255,.6)"; c.fillRect(L*0.2,-sd*R*0.02-1,L*0.6,2);
        c.fillStyle="#3f8a3a"; c.beginPath(); c.ellipse(-R*0.9,sd*R*0.15,R*0.9,R*0.16,sd*0.15,0,7); c.fill(); c.strokeStyle="#2a5a26"; c.stroke(); c.restore(); }
      c.fillStyle="#8a8f96"; c.beginPath(); c.arc(piv.x,piv.y,R*0.12,0,7); c.fill(); c.restore();
      atImpact(t,760,0.6,0.2);
      if(t>=760){ const k=(t-760)/700; c.save(); c.globalCompositeOperation="lighter"; c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=4*(1-k); c.beginPath(); c.moveTo(tg.x-R*1.1,tg.y-R*0.1); c.lineTo(tg.x+R*1.1,tg.y-R*0.1); c.stroke(); c.restore();
        for(let i=0;i<14;i++){ const a=-Math.PI*(atH(i*3)), sp=R*(0.4+1.6*eo(k)); if(i%3) atLeafBlade(c,tg.x+Math.cos(a)*sp*(i%2?1:-1),tg.y+Math.sin(a)*sp+k*k*R*1.2,R*0.3,t/150+i,i%2?"#6fbf4a":"#4f9a3a"); else SG.shard(c,tg.x+Math.cos(a)*sp,tg.y+Math.sin(a)*sp+k*k*R,R*0.08,t/90+i,"#8a5c34"); } } }},
  /* Swirl: it shakes itself hard, a snow-globe dome drops over the target and a blizzard of snow and glitter whirls round inside it */
  sg_shakeup:{C:760,D:1460,sig:true,
    atk:t=>({off:[t<760?Math.sin(t/14)*6:0,t<760?Math.cos(t/17)*2:0],rot:t<760?Math.sin(t/20)*0.15:0,pose:t<760?"effort":t<1150?"push":"idle"}),
    def(t){ if(t<760||t>1460) return null; return {rot:Math.sin((t-760)/90)*0.25,off:[Math.sin(t/40)*4,0],pose:"hurt"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, cx=tg.x, cy=tg.y-R*0.25, DR=R*1.6, drop=t<560?0:Math.min(1,(t-560)/200), out=t>1300?1-(t-1300)/160:1; if(drop<=0||out<=0) return; c.save(); c.globalAlpha=out;
      const yy=cy-(1-eo(drop))*R*3; c.fillStyle="rgba(200,230,255,.18)"; c.beginPath(); c.arc(cx,yy,DR,0,7); c.fill(); c.strokeStyle="rgba(240,250,255,.9)"; c.lineWidth=3; c.stroke();
      c.fillStyle="rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(cx-DR*0.45,yy-DR*0.45,DR*0.18,DR*0.1,-0.7,0,7); c.fill();
      c.fillStyle="#8a5a34"; c.fillRect(cx-DR*0.8,yy+DR*0.82,DR*1.6,R*0.3); c.fillStyle="#a8744a"; c.fillRect(cx-DR*0.8,yy+DR*0.82,DR*1.6,R*0.08);
      if(drop>=1){ atImpact(t,760,0.4,0.1); c.save(); c.beginPath(); c.arc(cx,cy,DR-2,0,7); c.clip(); for(let i=0;i<30;i++){ const a=t/(200+atH(i)*200)+i*0.7, rr=DR*(0.2+0.75*atH(i*3)), px=cx+Math.cos(a)*rr, py=cy+Math.sin(a)*rr*0.9;
          if(i%3) atFlake(c,px,py,R*0.08,t/300+i); else { c.fillStyle=["#ffd84a","#ff8ac0","#8ad0ff"][i%9/3|0]; c.fillRect(px-2,py-2,4,4); } } c.restore(); }
      c.restore(); if(t>900) SG.stars(c,tg.x,tg.top.y-R*0.15,R*0.6,t,3,"#e8f4ff"); }},
  /* Ditty: a ballerina rises on a little stage and pirouettes while a ribbon of notes spirals round the target, which can't help swaying along */
  sg_waltz:{C:760,D:1460,sig:true,
    atk:t=>({rot:Math.sin(t/150)*0.12,arc:-4*Math.abs(Math.sin(t/150)),pose:t<760?"cast":t<1200?"happy":"idle"}),
    def(t){ if(t<760||t>1460) return null; return {rot:Math.sin((t-760)/160)*0.3,off:[Math.sin((t-760)/160)*8,-Math.abs(Math.sin((t-760)/160))*5],pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, mid={x:(s.x+tg.x)/2,y:Math.min(s.top.y,tg.top.y)-R*0.4}, col=x.col||[255,170,220], show=Math.min(1,t/250)*(t>1300?1-(t-1300)/160:1); if(show<=0) return;
      c.save(); c.globalAlpha=show; c.fillStyle="#c8a46a"; c.beginPath(); c.ellipse(mid.x,mid.y+R*0.6,R*0.6,R*0.14,0,0,7); c.fill(); c.fillStyle="#e8c88a"; c.beginPath(); c.ellipse(mid.x,mid.y+R*0.55,R*0.6,R*0.14,0,0,7); c.fill();
      const sp=Math.cos(t/90); c.save(); c.translate(mid.x,mid.y+R*0.1); c.scale(sp,1); c.fillStyle="#ffd0e6"; c.beginPath(); c.ellipse(0,-R*0.05,R*0.32,R*0.1,0,0,7); c.fill(); c.fillStyle="#fff"; c.beginPath(); c.arc(0,-R*0.38,R*0.1,0,7); c.fill(); c.fillRect(-R*0.05,-R*0.3,R*0.1,R*0.28);
      c.strokeStyle="#fff"; c.lineWidth=R*0.05; c.lineCap="round"; c.beginPath(); c.moveTo(0,-R*0.25); c.lineTo(-R*0.25,-R*0.45); c.moveTo(0,-R*0.25); c.lineTo(R*0.25,-R*0.45); c.moveTo(0,0); c.lineTo(0,R*0.4); c.moveTo(0,R*0.1); c.lineTo(R*0.2,R*0.25); c.stroke(); c.restore(); c.restore();
      const k=Math.min(1,Math.max(0,(t-300)/460)); for(let i=0;i<14;i++){ const q=Math.max(0,k*1.4-i*0.03); if(q<=0) continue; const p=q<1?lerpP(mid,{x:tg.x,y:tg.y-R*0.3},eio(q),R*0.6):{x:tg.x+Math.cos(t/200+i*0.45)*R*1.3,y:tg.y-R*0.3+Math.sin(t/200+i*0.45)*R*0.5};
        SG.note(c,p.x,p.y,R*0.18,atRgba(i%2?col:[255,255,255],1),show*(t>1200?1-(t-1200)/260:1)); }
      if(t>=760){ atImpact(t,760,0.3,0); SG.stars(c,tg.x,tg.top.y-R*0.15,R*0.6,t,3,"#ffd0f0"); } }},
  /* Sizzle: it dashes in, two slices of toast shoot out of its slots, spin high and crash down on the target's head red-hot */
  sg_toastpop:{C:780,D:1480,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<360){ const k=eio(t/360); return {f:0.5*k,rot:d*0.1,pose:"tackle",sy:0.95}; } if(t<440){ const k=(t-360)/80; return {f:0.5,sy:1-0.3*Math.sin(k*Math.PI),sx:1+0.15*Math.sin(k*Math.PI),pose:"crouch"}; }
      if(t<1100) return {f:0.5,pose:"happy",arc:-3*Math.abs(Math.sin(t/60))}; const k=(t-1100)/380; return {f:0.5*(1-eio(k)),pose:"idle"}; },
    def(t){ for(const T0 of [780,880]){ if(t>=T0&&t<T0+200){ const a=1-(t-T0)/200; return {sx:1+0.15*a,sy:1-0.25*a,pose:"hurt",flash:3}; } } return t>=1080&&t<1480?{pose:"hurt",off:[Math.sin(t/20)*2,0]}:null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, slot={x:s.x,y:s.top.y}, head={x:tg.x,y:tg.top.y};
      const toast=(p,a,z)=>{ c.save(); c.translate(p.x,p.y); c.rotate(a); c.fillStyle="#c27a32"; c.beginPath(); c.roundRect?c.roundRect(-z,-z*1.1,z*2,z*2.1,z*0.5):c.rect(-z,-z*1.1,z*2,z*2.1); c.fill(); c.fillStyle="#f0c47a"; c.beginPath(); c.roundRect?c.roundRect(-z*0.78,-z*0.85,z*1.56,z*1.65,z*0.35):c.rect(-z*0.78,-z*0.85,z*1.56,z*1.65); c.fill();
        c.strokeStyle="#7a4416"; c.lineWidth=2; for(let j=-1;j<=1;j++){ c.beginPath(); c.moveTo(-z*0.6,j*z*0.5); c.lineTo(z*0.6,j*z*0.5-z*0.15); c.stroke(); } c.restore(); };
      for(let i=0;i<2;i++){ const T0=380+i*60, T1=780+i*100; if(t<T0||t>T1+500) continue; const z=R*0.28;
        if(t<T1){ const k=(t-T0)/(T1-T0), top={x:(slot.x+head.x)/2+(i-0.5)*R,y:Math.min(slot.y,head.y)-R*3.2}, p=k<0.5?lerpP(slot,top,eo(k*2),0):lerpP(top,{x:head.x+(i-0.5)*R*0.5,y:head.y-z},ei((k-0.5)*2),0); toast(p,t/60*(i?-1:1),z);
          if(k>0.5){ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,p.x,p.y,z*1.6,[255,140,40],0.4); c.restore(); } }
        else { const k=(t-T1)/500; atImpact(t,T1,0.4,0.1); toast({x:head.x+(i-0.5)*R*0.5,y:head.y-z*0.6+k*k*R*2},(i?0.3:-0.3)+k*3*(i?1:-1),z); c.globalAlpha=1; for(let j=0;j<4;j++) SG.puff(c,head.x+(j-1.5)*R*0.4,head.y-R*0.3-k*R*0.8,R*(0.15+0.2*k),(1-k)*0.6,[120,110,100]); } }
      if(t<380) for(let i=0;i<4;i++){ const ph=((t/200)+i/4)%1; SG.puff(c,slot.x+(i-1.5)*s.r*0.2,slot.y-ph*s.r*0.8,s.r*(0.08+0.1*ph),(1-ph)*0.6); } }},
  /* Aero: it dives into the wind, a whirling updraft lifts the target off its feet and spins it up, then drops it with a second gust */
  sg_updraft:{C:620,D:1320,sig:true,
    atk:t=>({arc:-12*Math.sin(Math.min(1,t/1000)*Math.PI)-Math.sin(t/90)*3,rot:Math.sin(t/110)*0.2,pose:t<620?"cast":t<1150?"push":"idle"}),
    def(t){ if(t<620||t>1320) return null; const k=(t-620)/700, up=t<1000?eo(Math.min(1,(t-620)/300)):1-ei((t-1000)/200); return {lift:-60*Math.max(0,up),rot:Math.sin((t-620)/90)*0.45*Math.max(0,up),pose:"hurt",flash:t>1000&&t<1100?3:0}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, col=x.col||[200,230,255], show=t<300?t/300:t>1200?1-(t-1200)/120:1; if(show<=0) return; c.save(); c.globalAlpha=show; c.globalCompositeOperation="lighter"; c.lineCap="round";
      for(let i=0;i<8;i++){ const ph=((t/420)+i/8)%1, y=tg.foot-ph*R*4, rx=R*(0.5+1.1*ph), a0=t/90+i*1.3; c.strokeStyle=atRgba(i%2?col:[255,255,255],0.8*Math.sin(ph*Math.PI)); c.lineWidth=4*(1-ph*0.5); c.beginPath(); c.ellipse(tg.x,y,rx,rx*0.25,0,a0,a0+Math.PI*1.1); c.stroke(); }
      for(let i=0;i<8;i++){ const ph=((t/500)+i/8)%1, a=t/120+i*0.8; atLeafBlade(c,tg.x+Math.cos(a)*R*(0.6+ph),tg.foot-ph*R*3.5,R*0.25,a,"rgba(160,230,140,.9)"); }
      c.restore(); atImpact(t,620,0.35,0); atImpact(t,1000,0.5,0); if(t>=1000) SG.dust(c,tg.x,tg.foot,R,(t-1000)/320,8); }},
  /* Nesta: it pops open and smaller and smaller dolls fly out one after another, each bonking the target, then they all hop back inside */
  sg_nesting:{C:560,D:1280,sig:true,
    atk:t=>({pose:t<560?"cast":t<1100?"happy":"idle",sy:t<400?1+0.08*eo(t/400):1,sx:1+0.04*Math.sin(t/50)}),
    def(t){ for(let i=0;i<4;i++){ const T0=560+i*110; if(t>=T0&&t<T0+100) return {sx:1.08,sy:0.9,off:[6,0],pose:"hit"}; } return null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), cols=[[220,60,70],[250,180,60],[90,160,220],[140,200,110]];
      const doll=(p,z,col,a)=>{ c.save(); c.translate(p.x,p.y); c.rotate(a); c.fillStyle=atRgba(col,1); c.strokeStyle="rgba(80,40,40,.6)"; c.lineWidth=1.5; c.beginPath(); c.ellipse(0,z*0.35,z*0.75,z*0.85,0,0,7); c.fill(); c.stroke(); c.beginPath(); c.arc(0,-z*0.55,z*0.55,0,7); c.fill(); c.stroke();
        c.fillStyle="#ffe8d8"; c.beginPath(); c.arc(0,-z*0.5,z*0.36,0,7); c.fill(); c.fillStyle="#3a2020"; c.fillRect(-z*0.17,-z*0.55,z*0.08,z*0.08); c.fillRect(z*0.09,-z*0.55,z*0.08,z*0.08);
        c.fillStyle="#ffffff"; c.beginPath(); c.arc(0,z*0.4,z*0.25,0,7); c.fill(); c.fillStyle=atRgba(col.map(v=>v-40),1); c.beginPath(); c.arc(0,z*0.4,z*0.12,0,7); c.fill(); c.restore(); };
      for(let i=0;i<4;i++){ const T0=200+i*110, T1=560+i*110, z=s.r*(0.55-i*0.1), home={x:s.x,y:s.y-s.r*0.1}; if(t<T0) continue; let p, a=0;
        if(t<T1){ const k=(t-T0)/(T1-T0); p=lerpP(home,{x:tg.x-d*R*0.4,y:tg.y-R*0.2},eio(k),R*(0.8+i*0.3)); a=d*k*6; }
        else if(t<T1+200){ const k=(t-T1)/200; p=lerpP({x:tg.x-d*R*0.4,y:tg.y-R*0.2},{x:tg.x-d*R*(1+i*0.3),y:tg.foot-z},eo(k),R*0.8); a=-d*k*3; if(k<0.5){ atImpact(t,T1,0.25,0); atPow(c,{x:tg.x-d*R*0.4,y:tg.y-R*0.3},k*1.6,R/40); } }
        else if(t<1100) p={x:tg.x-d*R*(1+i*0.3),y:tg.foot-z+(-Math.abs(Math.sin(t/90+i))*R*0.15)};
        else { const k=(t-1100)/180; if(k>1) continue; p=lerpP({x:tg.x-d*R*(1+i*0.3),y:tg.foot-z},home,eio(k),R*0.8); }
        doll(p,z,cols[i],a); } }},
  /* Magna: magnetic field lines arc out between it and the target, sparks crackle along them and the target is dragged in toward it */
  sg_attract:{C:700,D:1420,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return {rot:-d*0.12*Math.min(1,t/400),pose:t<700?"cast":t<1250?"push":"idle",off:[Math.sin(t/20)*1.2,0],sx:1+0.04*Math.sin(t/40)}; },
    def(t){ if(t<700||t>1420) return null; const k=Math.min(1,(t-700)/350), back=t>1150?1-(t-1150)/270:1; return {off:[-34*eo(k)*back,0],rot:-0.2*eo(k)*back,pose:"hurt",flash:Math.floor(t/80)%2?2:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), show=Math.min(1,t/300)*(t>1250?1-(t-1250)/170:1); if(show<=0) return; const pull=t<700?0:-34*eo(Math.min(1,(t-700)/350))*(t>1150?1-(t-1150)/270:1);
      const A={x:s.x+d*s.r*0.6,y:s.y-s.r*0.1}, B={x:tg.x+d*pull,y:tg.y-R*0.1}; c.save(); c.globalAlpha=show; c.globalCompositeOperation="lighter"; c.lineCap="round";
      for(let i=-3;i<=3;i++){ if(!i) continue; const bow=i*R*0.45; c.strokeStyle=i>0?"rgba(255,90,90,.6)":"rgba(90,140,255,.6)"; c.lineWidth=2; c.setLineDash([R*0.15,R*0.12]); c.lineDashOffset=-t/20; c.beginPath(); c.moveTo(A.x,A.y); c.bezierCurveTo(A.x+(B.x-A.x)*0.3,A.y+bow,A.x+(B.x-A.x)*0.7,B.y+bow,B.x,B.y); c.stroke(); }
      c.setLineDash([]); if(t>500){ const fr=Math.floor(t/50); c.strokeStyle="rgba(200,230,255,.9)"; c.lineWidth=2; atZig(c,A,B,8,R*0.4,fr); }
      for(let i=0;i<8;i++){ const ph=((t/400)+i/8)%1, p=lerpP(B,A,ph,R*0.6*(i%2?1:-1)); SG.shard(c,p.x,p.y,R*0.06,t/40+i,"rgba(200,200,215,.9)"); }
      c.restore(); atImpact(t,700,0.45,0.1); }},
  /* Helm: its air hose kicks and fires a roaring spray of water and bubbles that shoves the target back and leaves it dripping */
  sg_airhose:{C:720,D:1420,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return t<420?{sy:1-0.06*eo(t/420),rot:-d*0.08,pose:"cast"}:t<1150?{off:[-d*6,0],rot:-d*0.12+Math.sin(t/25)*0.03,pose:"push"}:{pose:"idle"}; },
    def(t){ const a=SG.knock(t,720,1,36,650); if(a){ a.pose="hurt"; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), noz={x:s.x+d*s.r*0.9,y:s.y-s.r*0.05}, WC=[150,205,255];
      if(t<420){ const k=t/420; for(let i=0;i<5;i++){ const ph=((t/250)+i/5)%1; atBubble(c,noz.x+d*ph*s.r*0.5,noz.y-ph*s.r*0.5,s.r*0.06,1-ph); } c.save(); c.globalCompositeOperation="lighter"; atWisp(c,noz.x,noz.y,s.r*0.1*k,WC); c.restore(); return; }
      if(t<1200){ const head=Math.min(1,(t-420)/300), tail=t>1100?(t-1100)/100:0; c.save(); for(let j=0;j<28;j++){ const q=j/28; if(q>head||q<tail) continue; const p=lerpP(noz,{x:tg.x,y:tg.y-R*0.1},q,0), spread=R*(0.08+0.5*q), jit=(atH(j*7+Math.floor(t/40))-0.5)*spread;
          c.fillStyle=atRgba(j%3?WC:[230,245,255],0.75); c.beginPath(); c.ellipse(p.x,p.y+jit,R*0.12*(1+q),R*0.07*(1+q),0,0,7); c.fill(); if(j%4===0) atBubble(c,p.x,p.y-jit,R*0.07*(1+q),0.9); } c.restore(); }
      if(t>=720){ atImpact(t,720,0.55,0.1); const k=(t-720)/700; for(let i=0;i<12;i++){ const a=(atH(i*3)-0.5)*Math.PI*0.9+(d>0?0:Math.PI), sp=R*(0.6+1.6*eo(k)); c.fillStyle=`rgba(210,235,255,${1-k})`; c.beginPath(); c.arc(tg.x+Math.cos(a)*sp,tg.y+Math.sin(a)*sp+k*k*R,R*0.07,0,7); c.fill(); }
        for(let i=0;i<4;i++){ const dr=Math.min(1,k*1.5-i*0.1); if(dr>0){ c.fillStyle="rgba(150,205,255,.85)"; c.beginPath(); c.ellipse(tg.x+(i-1.5)*R*0.4,tg.y+dr*R*0.6,R*0.05,R*0.08,0,0,7); c.fill(); } } } }}
});
Object.assign(AR_KIND,{"Melt Down":"sg_meltdown","Lantern Flash":"sg_lanternflash","Sleepy Slam":"sg_sleepyslam","Ink Blot":"sg_inkblot","Rubble Roll":"sg_rubbleroll","Downdraft":"sg_downdraft","Triple Stack":"sg_triplestack",
  "Root Snare":"sg_rootsnare","Curl Up":"sg_curlup","Sticky Trail":"sg_stickytrail","Wind-Up Barrage":"sg_windup","Thousand Cranes":"sg_cranes","Pruning Snip":"sg_snip","Shake Up":"sg_shakeup",
  "Music Box Waltz":"sg_waltz","Toast Pop":"sg_toastpop","Updraft":"sg_updraft","Nesting Stack":"sg_nesting","Attract":"sg_attract","Air Hose":"sg_airhose"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  sg_meltdown:(d,t)=>{ dNoise(d,t,0.48,0.12,'lowpass',700); sTone(d,t,'sawtooth',100,260,0.48,0.03); for(let i=0;i<4;i++) sTone(d,t+0.1+i*0.1,'sine',500,250,0.08,0.03); dNoise(d,t+0.5,0.3,0.14,'bandpass',900,1); dKick(d,t+0.8,0.5); dNoise(d,t+0.8,0.6,0.2,'bandpass',1500,1); for(let i=0;i<5;i++) dNoise(d,t+0.85+i*0.07,0.05,0.1,'bandpass',2000,2); },   // a flame roaring up, wax dripping, a hot splash and crackling
  sg_lanternflash:(d,t)=>{ for(let i=0;i<10;i++) sTone(d,t+i*0.07,'sine',1800+(i%4)*300,1900+(i%4)*300,0.05,0.015); [1319,1760,2349,2637].forEach((f,k)=>sTone(d,t+0.82+k*0.015,'triangle',f,f,0.5,0.035)); dNoise(d,t+0.82,0.4,0.1,'highpass',6000,0.6); },   // fireflies twinkling in, then all flashing at once
  sg_sleepyslam:(d,t)=>{ sTone(d,t,'sine',400,250,0.4,0.04); sTone(d,t+0.05,'sine',420,260,0.4,0.03); sTone(d,t+0.3,'sine',300,600,0.4,0.03); sTone(d,t+0.7,'sine',900,300,0.18,0.04); dKick(d,t+0.88,0.7); dNoise(d,t+0.88,0.3,0.25,'lowpass',800); dNoise(d,t+0.9,0.5,0.06,'bandpass',3000,1); },   // a yawn, floating up, a falling whistle, a soft heavy flop
  sg_inkblot:(d,t)=>{ sTone(d,t,'sine',500,150,0.3,0.05); dNoise(d,t+0.25,0.5,0.1,'lowpass',400); dNoise(d,t+0.7,0.25,0.25,'lowpass',900); sTone(d,t+0.7,'sine',150,450,0.2,0.05); sTone(d,t+1.15,'sine',400,120,0.3,0.04); },   // melting down, sliding across, a splash up and draining
  sg_rubbleroll:(d,t)=>{ dNoise(d,t,0.28,0.1,'lowpass',500); dNoise(d,t+0.28,0.5,0.2,'lowpass',250); for(let i=0;i<6;i++) dKick(d,t+0.3+i*0.08,0.15+i*0.03); dKick(d,t+0.78,1); dNoise(d,t+0.78,0.5,0.28,'lowpass',600); for(let i=0;i<6;i++) dNoise(d,t+0.82+i*0.05,0.05,0.12,'bandpass',1200,2); },   // curling up, a rolling rumble, the crash and stones clattering
  sg_downdraft:(d,t)=>{ dNoise(d,t,0.5,0.1,'bandpass',600,0.7); dNoise(d,t+0.4,0.4,0.18,'lowpass',500); sTone(d,t+0.5,'sine',900,200,0.26,0.04); dKick(d,t+0.76,0.7); dNoise(d,t+0.76,0.5,0.25,'lowpass',1200); dNoise(d,t+0.8,0.5,0.1,'highpass',3000,0.8); },   // wind gathering, a rushing fall, a wet slam and spray
  sg_triplestack:(d,t)=>{ [0.3,0.42,0.54].forEach(x=>sTone(d,t+x,'sine',300,800,0.08,0.05)); [0.6,0.72,0.84].forEach((x,k)=>{ dKick(d,t+x,0.3); sTone(d,t+x,'sine',600+k*120,300+k*80,0.08,0.05); }); sTone(d,t+0.96,'triangle',2400,1800,0.06,0.04); },   // three pops out, three bonks, the skewer
  sg_rootsnare:(d,t)=>{ dNoise(d,t+0.3,0.4,0.15,'lowpass',300); for(let i=0;i<5;i++) dNoise(d,t+0.56+i*0.06,0.08,0.12,'bandpass',600+i*100,2); sTone(d,t+0.7,'sawtooth',90,70,0.5,0.04); for(let i=0;i<4;i++) sTone(d,t+0.8+i*0.08,'sine',1200,1500,0.05,0.02); },   // the ground splitting, roots cracking up, a creaking grip, leaves sprouting
  sg_curlup:(d,t)=>{ for(let i=0;i<5;i++) sTone(d,t+0.06+i*0.07,'square',500-i*30,400-i*30,0.03,0.04); dKick(d,t+0.48,0.4); sTone(d,t+0.55,'triangle',2400,2600,0.3,0.03); },   // armour bands clicking shut, a thud and a glint
  sg_stickytrail:(d,t)=>{ dNoise(d,t,0.72,0.08,'lowpass',400); for(let i=0;i<6;i++) sTone(d,t+i*0.12,'sine',250,400,0.08,0.025); sTone(d,t+0.72,'sine',200,100,0.3,0.06); for(let i=0;i<4;i++) sTone(d,t+0.8+i*0.1,'sawtooth',220,300,0.08,0.015); },   // a wet slide, a gloop round its feet, sticky stretching
  sg_windup:(d,t)=>{ for(let i=0;i<6;i++) sTone(d,t+i*0.055,'square',1400+i*80,1400+i*80,0.02,0.03); for(let i=0;i<5;i++){ dNoise(d,t+0.49+i*0.128,0.05,0.2,'bandpass',1500+i*100,1.4); sTone(d,t+0.49+i*0.128,'square',900,600,0.03,0.025); } sTone(d,t+1.0,'sine',600,1400,0.25,0.03); },   // the key cranking, five clanking punches, a spring boing
  sg_cranes:(d,t)=>{ for(let i=0;i<8;i++) dNoise(d,t+0.1+i*0.05,0.05,0.06,'bandpass',3000,2); [0.64,0.75,0.86,0.97].forEach(x=>{ dNoise(d,t+x,0.06,0.16,'highpass',3500,1.5); sTone(d,t+x,'triangle',1600,1200,0.05,0.025); }); },   // paper fluttering and four waves of cranes diving in
  sg_snip:(d,t)=>{ sTone(d,t+0.1,'sawtooth',800,1100,0.4,0.02); dNoise(d,t+0.56,0.2,0.12,'highpass',3000,1); sTone(d,t+0.76,'square',2200,1800,0.04,0.06); dNoise(d,t+0.76,0.06,0.3,'highpass',4000,2); for(let i=0;i<5;i++) dNoise(d,t+0.82+i*0.05,0.06,0.07,'bandpass',2500,2); },   // shears opening, a big snip, leaves rustling
  sg_shakeup:(d,t)=>{ for(let i=0;i<10;i++) dNoise(d,t+i*0.07,0.05,0.08,'bandpass',1800+(i%2)*600,2); sTone(d,t+0.56,'sine',1200,400,0.2,0.04); sTone(d,t+0.76,'triangle',1800,1800,0.05,0.04); [2093,2637,3136,2637,2093].forEach((f,k)=>sTone(d,t+0.8+k*0.08,'sine',f,f,0.2,0.02)); },   // shaking hard, the dome dropping with a clink, a twinkling swirl
  sg_waltz:(d,t)=>{ [1047,1319,1568,1319,1175,1397,1760,1397].forEach((f,k)=>sTone(d,t+k*0.11,'triangle',f,f,0.25,0.03)); sTone(d,t+0.76,'sine',700,500,0.6,0.02); },   // a music box playing a little waltz
  sg_toastpop:(d,t)=>{ dNoise(d,t,0.35,0.1,'lowpass',600); sTone(d,t+0.36,'square',220,180,0.05,0.05); sTone(d,t+0.38,'sine',500,1500,0.12,0.05); sTone(d,t+0.44,'sine',520,1550,0.12,0.04); [0.78,0.88].forEach(x=>{ dKick(d,t+x,0.4); dNoise(d,t+x,0.2,0.18,'bandpass',900,1); }); dNoise(d,t+0.9,0.4,0.06,'highpass',4000,0.8); },   // rushing in, the toaster ding-pop, two slices thumping down, a sizzle
  sg_updraft:(d,t)=>{ dNoise(d,t,0.6,0.1,'bandpass',500,0.6); for(let i=0;i<6;i++) dNoise(d,t+0.3+i*0.1,0.15,0.08+i*0.015,'bandpass',500+i*150,2); sTone(d,t+0.62,'sine',300,900,0.4,0.04); sTone(d,t+1.0,'sine',900,250,0.2,0.04); dKick(d,t+1.1,0.4); },   // wind whipping up, the target lifted, dropped with a thud
  sg_nesting:(d,t)=>{ sTone(d,t+0.1,'sine',300,900,0.06,0.05); [0.56,0.67,0.78,0.89].forEach((x,k)=>{ sTone(d,t+x-0.3,'sine',400+k*150,900+k*200,0.08,0.03); dKick(d,t+x,0.25-k*0.03); sTone(d,t+x,'triangle',900+k*250,700+k*250,0.06,0.04); }); [1.1,1.15,1.2,1.25].forEach(x=>sTone(d,t+x,'square',1500,1500,0.02,0.02)); },   // a pop open, four little dolls bonking, clicking back together
  sg_attract:(d,t)=>{ sTone(d,t,'sawtooth',60,60,1.1,0.04); sTone(d,t,'sine',120,240,0.7,0.04); for(let i=0;i<8;i++) dNoise(d,t+0.5+i*0.06,0.03,0.08,'highpass',5000,2); sTone(d,t+0.7,'sine',800,200,0.35,0.05); dKick(d,t+1.0,0.3); },   // a magnetic hum, crackling sparks, the target dragged in
  sg_airhose:(d,t)=>{ dNoise(d,t,0.4,0.06,'bandpass',600,1); for(let i=0;i<4;i++) sTone(d,t+i*0.09,'sine',300,700,0.06,0.03); dNoise(d,t+0.42,0.75,0.25,'bandpass',1200,0.5); dNoise(d,t+0.42,0.75,0.1,'highpass',4000,0.6); dKick(d,t+0.72,0.4); }   // pressure building with bubbles, a roaring spray, a splash
});
if(typeof SWING!=="undefined") ["sg_sleepyslam","sg_rubbleroll","sg_windup","sg_toastpop"].forEach(k=>SWING.add(k));


/* ---------- group D: the mythics ---------- */
SG.tentacle=(c,bx,by,h,sw,w,col,k,t,seed)=>{ const N=14, pts=[]; for(let j=0;j<=N*k;j++){ const q=j/N; pts.push([bx+Math.sin(q*3+t/150+seed)*sw*q,by-q*h]); } if(pts.length<2) return;
  c.lineCap="round"; for(let j=1;j<pts.length;j++){ const q=j/N; c.strokeStyle=atRgba(col.map(v=>v-40),1); c.lineWidth=w*(1-q*0.75)+2; c.beginPath(); c.moveTo(pts[j-1][0],pts[j-1][1]); c.lineTo(pts[j][0],pts[j][1]); c.stroke(); c.strokeStyle=atRgba(col,1); c.lineWidth=w*(1-q*0.75); c.stroke(); }
  c.fillStyle="#ffe0e8"; for(let j=2;j<pts.length;j+=2){ const q=j/N; c.beginPath(); c.arc(pts[j][0]+w*0.25*(1-q),pts[j][1],w*0.14*(1-q*0.6),0,7); c.fill(); } };
SG.rainbow=["#ff5a5a","#ffa040","#ffe04a","#6fd06a","#5ab0ff","#6a6aff","#c070ff"];
SG.rock=(c,x,y,z,rot,seed,col=[150,132,110])=>{ c.save(); c.translate(x,y); c.rotate(rot); c.beginPath(); for(let j=0;j<9;j++){ const q=j/9*Math.PI*2, rr=z*(0.75+0.3*atH(seed*13+j)); c[j?"lineTo":"moveTo"](Math.cos(q)*rr,Math.sin(q)*rr); } c.closePath();
  const g=c.createLinearGradient(-z,-z,z,z); g.addColorStop(0,atRgba(col.map(v=>Math.min(255,v+50)),1)); g.addColorStop(1,atRgba(col.map(v=>v-40),1)); c.fillStyle=g; c.fill(); c.strokeStyle="rgba(50,36,26,.7)"; c.lineWidth=2; c.stroke();
  c.strokeStyle="rgba(60,44,30,.5)"; c.lineWidth=1.5; c.beginPath(); c.moveTo(-z*0.4,-z*0.1); c.lineTo(z*0.1,z*0.2); c.lineTo(z*0.3,-z*0.3); c.stroke(); c.restore(); };
Object.assign(ANIM,{
  /* Yeti: it throws its arms up and a wall of snow comes crashing down off the mountain onto the target, burying it in a drift with ice spikes */
  sg_avalanche:{C:880,D:1560,contact:false,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<500){ const k=eo(t/500); return {sy:1+0.1*k,sx:1-0.05*k,arc:-6*k,pose:"cast",rot:-d*0.1*k}; } if(t<700){ const k=eo((t-500)/200); return {sy:1.1-0.2*k,sx:0.95+0.15*k,rot:d*0.2*k,pose:"punch"}; } const k=(t-700)/860; return {sy:0.9+0.1*eo(k),sx:1.1-0.1*eo(k),rot:d*0.2*(1-eo(k)),pose:"idle"}; },
    def(t){ const a=SG.squash(t,880,0.36,620); if(a) a.flash=t<1000?3:0; return a; },
    fx(c,t,x){ const tg=x.target, R=tg.r, top=Math.max(0,tg.top.y-R*4.5), SN=[245,250,255];
      if(t>300&&t<900){ const k=(t-300)/580, fy=top+(tg.foot-top)*ei(k); for(let i=0;i<9;i++){ const px=tg.x+(i-4)*R*0.42, py=fy-R*(0.6+0.5*atH(i))-Math.sin(k*8+i)*R*0.1; SG.puff(c,px,py,R*(0.4+0.2*atH(i*3)),1,SN); }
        for(let i=0;i<6;i++){ const px=tg.x+(atH(i*7)-0.5)*R*3, py=fy-R*(1.2+atH(i)*1.2); SG.puff(c,px,py,R*(0.25+0.15*atH(i)),0.9,[230,240,250]); }
        for(let i=0;i<14;i++){ const ph=((t/300)+i/14)%1; atFlake(c,tg.x+(atH(i*3)-0.5)*R*4,top+ph*(fy-top),R*0.08,t/200+i); } }
      atImpact(t,880,0.9,0.4);
      if(t>=880){ const k=(t-880)/680, out=k>0.8?1-(k-0.8)/0.2:1; c.save(); c.globalAlpha=out;
        c.fillStyle="#f6faff"; c.strokeStyle="rgba(160,190,220,.8)"; c.lineWidth=2; c.beginPath(); c.ellipse(tg.x,tg.foot,R*1.7,R*(1.1-0.3*eo(k)),0,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke();
        for(let i=0;i<7;i++){ const g=Math.min(1,k*3-i*0.15); if(g<=0) continue; const a=Math.PI*(1.1+i*0.13), bx=tg.x+Math.cos(a)*R*1.5, by=tg.foot+Math.sin(a)*R*0.9; atIce(c,bx,by,R*(0.7+0.4*atH(i))*eo(g),R*0.16,(i-3)*0.18); }
        for(let i=0;i<16;i++){ const a=-Math.PI*(atH(i*3)), sp=R*(0.6+2*eo(k)); SG.puff(c,tg.x+Math.cos(a)*sp*(i%2?1:-1),tg.foot-R*0.5+Math.sin(a)*sp*0.6+k*k*R,R*(0.15+0.15*k),1-k,SN); } c.restore(); } }},
  /* Kraken: the ground darkens under the target, four huge tentacles burst up round it, wrap it and squeeze while ink splashes out */
  sg_kraken:{C:720,D:1420,sig:true,
    atk:t=>{ const r=t<300?0.2*eo(t/300):t<720?0.2+1.1*eo((t-300)/420):t<1250?1.3+0.06*Math.sin(t/60):1.3*(1-eio((t-1250)/170)); return {f:t<720?0.32*eo(t/720):t<1250?0.32:0.32*(1-eio((t-1250)/170)),pose:atPose(t<720?"attack":"push",{lash:r,lash2:r*0.92,eyes:"fierce"}),sy:1-0.05*Math.sin(Math.min(1,t/720)*Math.PI)}; },
    def(t){ if(t<620||t>1420) return null; const sq=Math.abs(Math.sin((t-620)/140*Math.PI/2)); return {sx:1-0.18*sq,sy:1+0.08*sq,lift:-10*Math.min(1,(t-620)/300),pose:"hurt",flash:Math.floor(t/120)%2?2:0}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, TC=x.parts||x.col||[200,90,140], h=tg.foot-tg.top.y, out=t>1260?1-(t-1260)/160:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      const pool=Math.min(1,t/400); c.fillStyle=`rgba(20,20,50,${0.6*pool})`; c.beginPath(); c.ellipse(tg.x,tg.foot,R*2*pool,R*0.4*pool,0,0,7); c.fill(); SG.ring(c,tg.x,tg.foot,R*2*pool,R*0.4*pool,[120,160,255],2,0.6*pool);
      const g=Math.min(1,Math.max(0,(t-300)/400));
      for(let i=0;i<2;i++){ const sd=i%2?1:-1, bx=tg.x+sd*R*(1.2+0.45*(i>>1)), wrap=t>620?Math.min(1,(t-620)/200):0;
        
        if(wrap>0){ const yy=tg.top.y+h*(0.3+i*0.17), sq=1-0.1*Math.abs(Math.sin((t-620)/140*Math.PI/2)); c.lineCap="round"; c.strokeStyle=atRgba(TC.map(v=>v-40),1); c.lineWidth=R*0.32; c.beginPath(); c.ellipse(tg.x,yy,R*1.1*sq,R*0.26,0.1*sd,-Math.PI*0.9,-Math.PI*0.9+Math.PI*1.8*wrap); c.stroke();
          c.strokeStyle=atRgba(TC,1); c.lineWidth=R*0.24; c.stroke(); c.fillStyle="#ffe0e8"; for(let j=0;j<5;j++){ const a=-Math.PI*0.9+Math.PI*1.8*wrap*j/5; if(Math.sin(a)<0) continue; c.beginPath(); c.arc(tg.x+Math.cos(a)*R*1.1*sq,yy+Math.sin(a)*R*0.26,R*0.06,0,7); c.fill(); } } }
      if(t>=720){ atImpact(t,720,0.6,0.2); const k=(t-720)/700; for(let i=0;i<10;i++){ const a=-Math.PI*(atH(i*5)), sp=R*(0.4+1.3*eo(k)); c.fillStyle=`rgba(30,24,60,${1-k})`; c.beginPath(); c.arc(tg.x+Math.cos(a)*sp*(i%2?1:-1),tg.y+Math.sin(a)*sp+k*k*R,R*0.09,0,7); c.fill(); } }
      c.restore(); }},
  /* Golem: it tears a boulder out of the floor, hoists it overhead and hurls it down on the target, which shatters it and craters the ground */
  sg_bouldersmash:{C:900,D:1580,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<300){ const k=eo(t/300); return {sy:1-0.2*k,sx:1+0.1*k,pose:"crouch"}; } if(t<620){ const k=eo((t-300)/320); return {sy:0.8+0.32*k,sx:1.1-0.12*k,arc:-10*k,rot:-d*0.15*k,pose:"effort",f:0.2*k}; }
      if(t<900){ const k=ei((t-620)/280); return {f:0.2+0.42*k,rot:-d*0.15+d*0.5*k,sy:1.12-0.22*k,arc:-10*(1-k),pose:"punch"}; } const k=(t-900)/680; return {f:0.62*(1-eio(k)),rot:d*0.35*(1-eo(k)),sy:0.9+0.1*eo(k),pose:k<0.4?"land":"idle"}; },
    def:t=>SG.squash(t,900,0.45,640),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), BR=s.r*0.95;
      if(t<300){ SG.cracks(c,s.x+d*s.r*0.6,s.foot,s.r*1.4*t/300,7,2.1,1); SG.dust(c,s.x+d*s.r*0.6,s.foot,s.r,t/300,6); }
      let bp=null; if(t>=150&&t<620){ const k=eo(Math.min(1,(t-150)/470)); bp={x:s.x+d*s.r*0.6*(1-k),y:s.foot-BR*0.6-k*(s.foot-s.top.y+BR*0.8)}; }
      else if(t>=620&&t<900){ const k=ei((t-620)/280); bp=lerpP({x:s.x,y:s.top.y-BR*0.2},{x:tg.x,y:tg.top.y-BR*0.3},k,R*1.2); }
      if(bp){ SG.rock(c,bp.x,bp.y,BR,t<620?0:(t-620)/200*d,7); for(let i=0;i<4;i++){ const ph=((t/300)+i/4)%1; c.fillStyle=`rgba(150,130,110,${1-ph})`; c.beginPath(); c.arc(bp.x+(i-1.5)*BR*0.4,bp.y+BR*0.8+ph*BR,BR*0.08,0,7); c.fill(); } }
      atImpact(t,900,1,0.5);
      if(t>=900){ const k=(t-900)/680; c.fillStyle=`rgba(60,40,28,${0.5*(1-k*0.6)})`; c.beginPath(); c.ellipse(tg.x,tg.foot,R*1.8,R*0.42,0,0,7); c.fill(); SG.cracks(c,tg.x,tg.foot,R*3.2,12,0.9,1-k*k);
        for(let i=0;i<12;i++){ const a=-Math.PI*(0.08+0.84*atH(i*3)), sp=R*(0.6+2.4*eo(k)); SG.rock(c,tg.x+Math.cos(a)*sp*(i%2?1:-1),tg.top.y+Math.sin(a)*sp*0.7+k*k*R*2.4,BR*(0.22+0.15*atH(i)),k*4+i,i); }
        for(let i=0;i<3;i++){ const kk=Math.min(1,Math.max(0,k*1.3-i*0.12)); SG.ring(c,tg.x,tg.foot,R*(0.6+3.2*eo(kk)),R*(0.16+0.7*eo(kk)),[255,236,200],6*(1-kk),1-kk); } SG.dust(c,tg.x,tg.foot,R*1.4,k,12); } }},
  /* Unicorn: light gathers on its horn, it fires a beam through a crystal prism that hangs in the air, and the beam fans out into a rainbow over the target */
  sg_prism:{C:760,D:1460,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return t<460?{rot:-d*0.15*eo(t/460),pose:"cast",sy:1+0.04*eo(t/460)}:t<1200?{rot:d*0.08,off:[-d*3,0],pose:"push"}:{pose:"idle"}; },
    def(t){ const a=SG.knock(t,760,1,16,600); if(a){ a.flash=Math.floor(t/60)%2?3:0; a.pose="hurt"; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), horn={x:s.x+d*s.r*0.5,y:s.top.y+s.r*0.15}, pr={x:(horn.x+tg.x)/2,y:Math.min(horn.y,tg.y)-R*0.8}, dst={x:tg.x,y:tg.y-R*0.15};
      if(t<460){ atGather(c,horn,t/460,[255,255,255],s.r*1.1,4); }
      const pg=Math.min(1,t/300)*(t>1300?1-(t-1300)/160:1); if(pg>0){ c.save(); c.translate(pr.x,pr.y); c.rotate(t/500); c.globalAlpha=pg; const z=R*0.45; c.fillStyle="rgba(220,240,255,.55)"; c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=2;
        c.beginPath(); c.moveTo(0,-z); c.lineTo(z*0.87,z*0.5); c.lineTo(-z*0.87,z*0.5); c.closePath(); c.fill(); c.stroke(); c.restore(); }
      if(t>=460&&t<1300){ const k=Math.min(1,(t-460)/150), fade=t>1150?1-(t-1150)/150:1; c.save(); c.globalCompositeOperation="lighter"; c.lineCap="round";
        c.strokeStyle=`rgba(255,255,255,${0.95*fade})`; c.lineWidth=R*0.2; c.beginPath(); c.moveTo(horn.x,horn.y); c.lineTo(horn.x+(pr.x-horn.x)*k,horn.y+(pr.y-horn.y)*k); c.stroke();
        if(t>=610){ const k2=Math.min(1,(t-610)/150); SG.rainbow.forEach((col,i)=>{ const off=(i-3)*R*0.16, ex=pr.x+(dst.x-pr.x)*k2, ey=pr.y+(dst.y+off-pr.y)*k2; c.strokeStyle=col; c.globalAlpha=0.85*fade; c.lineWidth=R*0.16; c.beginPath(); c.moveTo(pr.x,pr.y); c.lineTo(ex,ey); c.stroke(); }); }
        c.restore(); }
      if(t>=760){ atImpact(t,760,0.6,0.35); const k=(t-760)/700; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,dst.x,dst.y,R*(1+1.5*k),[255,255,255],0.8*(1-k)); for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, rr=R*(0.6+1.6*eo(k)); atStar4(c,dst.x+Math.cos(a)*rr,dst.y+Math.sin(a)*rr*0.8,R*0.18*(1-k),SG.rainbow[i%7]); } c.restore(); } }},
  /* Jack: a giant carved pumpkin face looms up over the target, its grin and eyes blazing with purple fire, and it cackles until the target shrinks in terror */
  sg_spookygrin:{C:720,D:1440,sig:true,
    atk:t=>({pose:t<720?"cast":t<1250?"happy":"idle",sx:1+0.05*Math.sin(t/50),sy:1-0.05*Math.sin(t/50),rot:Math.sin(t/90)*0.06}),
    def(t){ if(t<720||t>1440) return null; const a=Math.min(1,(t-720)/200)*(t>1250?1-(t-1250)/190:1); return {sx:1-0.12*a,sy:1-0.16*a,off:[16*a+Math.sin(t/12)*2*a,4*a],pose:"hurt"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x), cx=tg.x-d*R*0.3, cy=tg.top.y-R*1.0, PR=R*1.35, rise=eo(Math.min(1,Math.max(0,(t-200)/450))), out=t>1280?1-(t-1280)/160:1; if(out<=0||rise<=0) return; c.save(); c.globalAlpha=out*Math.min(1,rise*1.5);
      const y=cy+(1-rise)*R*1.5, bob=Math.sin(t/120)*R*0.06, fl=0.75+0.25*Math.sin(t/40);
      c.fillStyle="rgba(40,10,60,.35)"; c.beginPath(); c.ellipse(cx,y+bob,PR*1.5,PR*1.15,0,0,7); c.fill();
      for(let i=-2;i<=2;i++){ c.fillStyle=i%2?"#e8781e":"#f28c28"; c.beginPath(); c.ellipse(cx+i*PR*0.36,y+bob,PR*0.46,PR*0.9,0,0,7); c.fill(); }
      c.strokeStyle="rgba(120,50,10,.6)"; c.lineWidth=2; for(let i=-1;i<=1;i++){ c.beginPath(); c.ellipse(cx+i*PR*0.36,y+bob,PR*0.2,PR*0.88,0,0,7); c.stroke(); } c.fillStyle="#4a7a2a"; c.fillRect(cx-PR*0.08,y+bob-PR*1.05,PR*0.16,PR*0.25);
      const glow=(pts)=>{ c.beginPath(); pts.forEach((p,j)=>c[j?"lineTo":"moveTo"](cx+p[0]*PR,y+bob+p[1]*PR)); c.closePath(); c.fillStyle="#2a0c3a"; c.fill(); c.save(); c.globalCompositeOperation="lighter"; c.fillStyle=`rgba(190,90,255,${0.75*fl})`; c.fill(); c.restore(); };
      glow([[-0.55,-0.35],[-0.18,-0.35],[-0.36,-0.02]]); glow([[0.18,-0.35],[0.55,-0.35],[0.36,-0.02]]);
      const op=t<720?0.6:1; glow([[-0.65,0.15],[-0.45,0.25],[-0.3,0.15],[-0.15,0.3],[0,0.15],[0.15,0.3],[0.3,0.15],[0.45,0.25],[0.65,0.15],[0.4,0.15+0.4*op],[0,0.25+0.4*op],[-0.4,0.15+0.4*op]]);
      c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<8;i++){ const ph=((t/500)+i/8)%1; SG.flame(c,cx+(atH(i)-0.5)*PR*2,y+bob+PR*0.9-ph*PR*0.4,PR*0.4*(1-ph),PR*0.08,t,i,0.5*(1-ph)); } c.restore();
      c.restore(); if(t>=720){ atImpact(t,720,0.45,0.1); SG.sweat(c,tg.x+R*0.6,tg.top.y+R*0.25,R*0.13,1); SG.sweat(c,tg.x-R*0.55,tg.top.y+R*0.35,R*0.1,1); } }},
  /* Tengu: it sweeps its great leaf fan, and a gale of wind blades and torn leaves blows the target back across the arena */
  sg_galefan:{C:700,D:1420,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<440){ const k=eo(t/440); return {rot:-d*0.35*k,pose:"cast",arc:-6*k}; } if(t<640){ const k=eo((t-440)/200); return {rot:-d*0.35+d*0.75*k,pose:"push",arc:-6}; } const k=(t-640)/780; return {rot:d*0.4*(1-eo(k)),arc:-6*(1-eo(k)),pose:"idle"}; },
    def(t){ const a=SG.knock(t,700,1,48,700); if(a) a.pose="hurt"; return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), sw=t<440?-0.35*eo(t/440):t<640?-0.35+0.75*eo((t-440)/200):0.4*(1-eo((t-640)/780)), pv={x:s.x+d*s.r*0.7,y:s.y-s.r*0.1};
      if(t<900){ c.save(); c.translate(pv.x,pv.y); c.rotate(d*sw-Math.PI/2+d*0.4); const F=s.r*1.3; for(let i=0;i<9;i++){ const a=-0.6+i*0.15; c.fillStyle=i%2?"#4f9a3a":"#6fbf4a"; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(Math.cos(a-0.07)*F*0.6,Math.sin(a-0.07)*F*0.6,Math.cos(a)*F,Math.sin(a)*F); c.quadraticCurveTo(Math.cos(a+0.07)*F*0.6,Math.sin(a+0.07)*F*0.6,0,0); c.fill(); }
        c.fillStyle="#8a5c34"; c.fillRect(-s.r*0.06,0,s.r*0.12,s.r*0.6); c.restore(); }
      if(t>=480){ const k=Math.min(1,(t-480)/800); c.save(); c.globalCompositeOperation="lighter";
        for(let i=0;i<7;i++){ const q=Math.min(1,Math.max(0,(t-480-i*45)/320)); if(q<=0||q>=1) continue; const px=pv.x+(tg.x-pv.x)*q, py=pv.y+(i-3)*R*0.25; atCrescent(c,px,py,R*(0.5+0.2*(i%2)),d>0?0:Math.PI,Math.min(0.95,q),[220,255,230]); }
        c.restore(); for(let i=0;i<14;i++){ const q=((t-480)/500+atH(i))%1.3; if(q>1) continue; atLeafBlade(c,pv.x+(tg.x+d*R*2-pv.x)*q,pv.y+(atH(i*3)-0.5)*R*2+Math.sin(q*8+i)*R*0.2,R*0.28,t/80+i,i%2?"rgba(110,190,80,.95)":"rgba(80,150,60,.95)"); } }
      atImpact(t,700,0.6,0.1); if(t>=700) SG.dust(c,tg.x+d*R*0.8,tg.foot,R,(t-700)/600,8); }},
  /* Tanuki: it drums its belly three times, each beat sending out a shockwave, then belly-bumps the target with a boom */
  sg_bellydrum:{C:900,D:1580,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<600){ const b=((t)%180)/180, hit=b<0.25?1-b/0.25:0; return {sx:1+0.12*hit,sy:1-0.08*hit,pose:"effort",arc:-4*Math.sin(b*Math.PI)}; }
      if(t<900){ const k=ei((t-600)/300); return {f:0.64*k,sx:1+0.25*k,sy:1-0.12*k,rot:-d*0.1*k,pose:"tackle"}; } const k=(t-900)/680; return {f:0.64*(1-eio(k)),sx:1.25-0.25*eo(k),sy:0.88+0.12*eo(k),pose:k<0.5?"happy":"idle"}; },
    def(t){ if(t>=900&&t<1580){ const k=(t-900)/680; return {off:[44*eo(Math.min(1,k*1.4))*(1-k*0.6),-30*Math.sin(Math.min(1,k*1.2)*Math.PI)],rot:0.3*Math.sin(Math.min(1,k*1.2)*Math.PI),pose:"hurt"}; } if(t>=0&&t<600){ const b=(t%180)/180; return b<0.2?{off:[2,0],pose:"hurt"}:null; } return null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      for(let i=0;i<3;i++){ const k=(t-i*180)/500; if(k<0||k>1) continue; atImpact(t,i*180,0.2,0); SG.ring(c,s.x,s.y,s.r*(0.8+2.6*eo(k)),s.r*(0.7+2.2*eo(k)),[255,230,170],5*(1-k),1-k); c.save(); c.globalCompositeOperation="lighter"; atWisp(c,s.x+d*s.r*0.3,s.y+s.r*0.1,s.r*0.3*(1-k),[255,220,150]); c.restore(); }
      atImpact(t,900,0.95,0.4);
      if(t>=900){ const k=(t-900)/680; for(let i=0;i<3;i++){ const kk=Math.min(1,Math.max(0,k*1.3-i*0.12)); SG.ring(c,tg.x-d*R*0.4,tg.y,R*(0.8+3*eo(kk)),R*(0.7+2.4*eo(kk)),[255,240,200],7*(1-kk),1-kk); } atPow(c,{x:tg.x-d*R*0.5,y:tg.y-R*0.2},Math.min(1,k*1.2),R/18); SG.dust(c,tg.x,tg.foot,R*1.2,k,10); } }},
  /* Mermaid: she sings, rings of shimmering water and floating hearts and notes roll out, and the target sways helplessly with hearts circling its head */
  sg_siren:{C:760,D:1460,sig:true,
    atk:t=>({pose:t<1200?"cast":"idle",arc:-8*Math.sin(Math.min(1,t/1200)*Math.PI),rot:Math.sin(t/160)*0.08}),
    def(t){ if(t<760||t>1460) return null; return {rot:Math.sin((t-760)/170)*0.22,off:[Math.sin((t-760)/170)*6,0],pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), mouth={x:s.x+d*s.r*0.5,y:s.y-s.r*0.3}, WC=[140,210,255], PK=[255,140,200], L=Math.abs(tg.x-mouth.x);
      c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<6;i++){ const k=((t-100)/700-i*0.15); if(k<0||k>1) continue; const px=mouth.x+d*L*k; c.strokeStyle=atRgba(i%2?WC:PK,0.7*(1-k*0.5)); c.lineWidth=3; c.beginPath(); c.ellipse(px,mouth.y+(tg.y-mouth.y)*k,R*0.3+R*0.4*k,R*(0.6+0.8*k),0,0,7); c.stroke(); } c.restore();
      const heart=(x0,y0,z,col,a)=>{ if(a<=0) return; c.save(); c.globalAlpha*=a; c.fillStyle=col; c.beginPath(); c.moveTo(x0,y0+z*0.9); c.bezierCurveTo(x0-z*1.4,y0-z*0.2,x0-z*0.6,y0-z*1.2,x0,y0-z*0.4); c.bezierCurveTo(x0+z*0.6,y0-z*1.2,x0+z*1.4,y0-z*0.2,x0,y0+z*0.9); c.fill(); c.restore(); };
      for(let i=0;i<10;i++){ const k=Math.min(1,Math.max(0,(t-100-i*50)/650)); if(k<=0) continue; const p=lerpP(mouth,{x:tg.x,y:tg.y-R*0.3},eio(k),R*(0.4+0.6*atH(i)),Math.sin(t/150+i)*R*0.3), fade=t>1250?1-(t-1250)/200:1;
        if(i%2) heart(p.x,p.y,R*0.14,"#ff7ab8",fade); else SG.note(c,p.x,p.y,R*0.18,"rgba(150,210,255,1)",fade); }
      if(t>=760){ atImpact(t,760,0.3,0); for(let i=0;i<3;i++){ const a=t/250+i*2.1; heart(tg.x+Math.cos(a)*R*0.7,tg.top.y-R*0.15+Math.sin(a)*R*0.2,R*0.13,"#ff5aa0",t>1300?1-(t-1300)/160:1); } } }},
  /* Diwata: a whirlwind of petals spirals out of her hands and slashes through the target in three waves, then the petals rain down round it */
  sg_petalstorm:{C:640,D:1340,sig:true,
    atk:t=>({pose:t<640?"cast":t<1100?"push":"idle",arc:-10*Math.sin(Math.min(1,t/1100)*Math.PI)-Math.sin(t/100)*2,rot:Math.sin(t/140)*0.1}),
    def(t){ for(let i=0;i<3;i++){ const T0=640+i*120; if(t>=T0&&t<T0+110) return {off:[8,0],pose:"hit",flash:2}; } return t>=1000&&t<1340?{pose:"hurt"}:null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, cols=["#ffb0d0","#ff80b0","#fff0f6","#ffd0e0"], from={x:s.x,y:s.y-s.r*0.3};
      for(let i=0;i<36;i++){ const wave=i%3, T0=200+i*10, T1=640+wave*120; if(t<T0) continue; let p, a=t/90+i;
        if(t<T1){ const k=(t-T0)/(T1-T0), base=lerpP(from,{x:tg.x,y:tg.y-R*0.2},eio(k),R*0.3), sp=t/80+i*0.6, rr=R*(0.3+0.5*(1-Math.abs(k-0.5)*2)); p={x:base.x+Math.cos(sp)*rr,y:base.y+Math.sin(sp)*rr*0.6}; }
        else { const k=(t-T1)/600; if(k>1) continue; p={x:tg.x+(atH(i)-0.5)*R*(1+2*k),y:tg.y-R*0.6+k*R*1.4+Math.sin(t/120+i)*R*0.2}; c.globalAlpha=1-k; }
        c.save(); c.translate(p.x,p.y); c.rotate(a); c.fillStyle=cols[i%4]; c.beginPath(); c.ellipse(0,0,R*0.13,R*0.07,0,0,7); c.fill(); c.strokeStyle="rgba(200,80,130,.4)"; c.lineWidth=1; c.stroke(); c.restore(); c.globalAlpha=1; }
      for(let w=0;w<3;w++){ const T0=640+w*120, k=(t-T0)/280; if(k<0||k>1) continue; atImpact(t,T0,0.25,0); c.save(); c.globalCompositeOperation="lighter"; atCrescent(c,tg.x,tg.y-R*0.2,R*(0.8+0.15*w),(w-1)*0.9,k,[255,190,220]); c.restore(); } }},
  /* Sphinx: a golden eye opens in the air, a spinning cube of riddle glyphs closes round the target, and question marks swirl over its head */
  sg_puzzlegaze:{C:760,D:1460,sig:true,
    atk:t=>({pose:t<760?"cast":t<1250?"push":"idle",sy:1+0.04*Math.sin(Math.min(1,t/760)*Math.PI),sx:1+0.03*Math.sin(t/60)}),
    def(t){ if(t<760||t>1460) return null; return {rot:Math.sin((t-760)/110)*0.18,pose:"hurt",off:[Math.sin(t/40)*3,0]}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, GD=[255,210,90], eye={x:s.x,y:s.top.y-s.r*0.9}, cen={x:tg.x,y:tg.y-R*0.15};
      const eo2=Math.min(1,t/350)*(t>1300?1-(t-1300)/160:1); if(eo2>0){ c.save(); c.globalAlpha=eo2; c.globalCompositeOperation="lighter"; atGlowA(c,eye.x,eye.y,s.r*1.2,GD,0.5); c.restore(); c.save(); c.globalAlpha=eo2; c.strokeStyle="#c8961e"; c.lineWidth=3; const ER=s.r*0.55;
        c.beginPath(); c.moveTo(eye.x-ER,eye.y); c.quadraticCurveTo(eye.x,eye.y-ER*0.75,eye.x+ER,eye.y); c.quadraticCurveTo(eye.x,eye.y+ER*0.75,eye.x-ER,eye.y); c.stroke(); c.fillStyle="#1a2a6a"; c.beginPath(); c.arc(eye.x,eye.y,ER*0.3,0,7); c.fill();
        c.beginPath(); c.moveTo(eye.x-ER*0.2,eye.y+ER*0.3); c.lineTo(eye.x-ER*0.3,eye.y+ER*0.9); c.moveTo(eye.x+ER*0.1,eye.y+ER*0.3); c.quadraticCurveTo(eye.x+ER*0.5,eye.y+ER*0.9,eye.x+ER*0.9,eye.y+ER*0.6); c.stroke(); c.restore(); }
      if(t>300&&t<760){ const k=(t-300)/460; c.save(); c.globalCompositeOperation="lighter"; c.strokeStyle=atRgba(GD,0.6); c.lineWidth=R*0.12*k; c.beginPath(); c.moveTo(eye.x,eye.y); c.lineTo(eye.x+(cen.x-eye.x)*eo(k),eye.y+(cen.y-eye.y)*eo(k)); c.stroke(); c.restore(); }
      if(t>=600){ const g=eo(Math.min(1,(t-600)/250)), out=t>1300?1-(t-1300)/160:1, rot=t/400, S=R*1.25*g; c.save(); c.globalAlpha=out;
        const V=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([a,b,cc])=>{ const x1=a*Math.cos(rot)-cc*Math.sin(rot), z1=a*Math.sin(rot)+cc*Math.cos(rot), y1=b*Math.cos(rot*0.6)-z1*Math.sin(rot*0.6); return {x:cen.x+x1*S,y:cen.y+y1*S*0.9}; });
        c.strokeStyle="rgba(255,220,120,.9)"; c.lineWidth=2.5; [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>{ c.beginPath(); c.moveTo(V[a].x,V[a].y); c.lineTo(V[b].x,V[b].y); c.stroke(); });
        c.fillStyle="rgba(255,220,120,.9)"; c.font=`bold ${Math.round(R*0.32)}px serif`; c.textAlign="center"; c.textBaseline="middle"; ["☥","△","☉","◇","✦","☽"].forEach((g2,i)=>{ const v=V[i]; c.fillText(g2,v.x,v.y); }); c.restore(); }
      if(t>=760){ atImpact(t,760,0.35,0.15); c.fillStyle="#ffe06a"; c.strokeStyle="#7a5a10"; c.lineWidth=2; c.font=`bold ${Math.round(R*0.4)}px sans-serif`; c.textAlign="center"; for(let i=0;i<3;i++){ const a=t/220+i*2.1; const qx=tg.x+Math.cos(a)*R*0.65, qy=tg.top.y-R*0.2+Math.sin(a)*R*0.2; c.globalAlpha=t>1300?1-(t-1300)/160:1; c.strokeText("?",qx,qy); c.fillText("?",qx,qy); } c.globalAlpha=1; } }},
  /* Garuda: it flares its golden wings and dives as a giant bird of flame, crashing into the target in an explosion of fire and gold feathers */
  sg_garudadive:{C:880,D:1560,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<300){ const k=eo(t/300); return {arc:-30*k,sx:1+0.15*k,pose:"cast"}; } if(t<560){ const k=eo((t-300)/260); return {f:-0.05*k,arc:-30-90*k,rot:-d*0.2*k,pose:"jump"}; }
      if(t<880){ const k=ei((t-560)/320); return {f:-0.05+0.68*k,arc:-120*(1-k),rot:-d*0.2+d*0.7*k,pose:"tackle",sx:0.9,sy:1.1}; } const k=(t-880)/680; return {f:0.63*(1-eio(k)),arc:-50*Math.sin(Math.min(1,k*1.4)*Math.PI),rot:d*0.5*(1-eo(k)),pose:k<0.5?"land":"idle"}; },
    def(t){ const a=SG.knock(t,880,1,40,640); if(a){ a.flash=Math.floor(t/70)%2?3:0; a.pose="hurt"; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), GD=[255,200,80];
      const wings=(p,sc,a,ang)=>{ c.save(); c.translate(p.x,p.y); c.rotate(ang); c.globalAlpha=a; c.globalCompositeOperation="lighter"; for(const sd of [-1,1]){ c.fillStyle="rgba(255,170,60,.55)"; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(sd*sc*0.6,-sc*0.9,sd*sc*1.6,-sc*0.5);
          for(let j=0;j<5;j++) c.lineTo(sd*sc*(1.5-j*0.28),-sc*0.5+sc*(0.25+0.1*(j%2))); c.quadraticCurveTo(sd*sc*0.4,sc*0.2,0,0); c.fill(); } atGlowA(c,0,0,sc*0.8,GD,0.8); c.restore(); };
      if(t<560){ const k=Math.min(1,t/300); wings({x:s.x,y:s.y-s.r*0.2},s.r*(0.8+0.6*k),0.8*k,0); }
      else if(t<900){ const k=Math.min(1,(t-560)/320), p={x:s.x+(tg.x-s.x)*ei(k)*0.95,y:s.y-120*(1-ei(k))*1-s.r*0.2}; wings(p,s.r*1.5,0.95,d*0.6*k);
        for(let j=1;j<6;j++){ const q=Math.max(0,k-j*0.06), pp={x:s.x+(tg.x-s.x)*ei(q)*0.95,y:s.y-120*(1-ei(q))-s.r*0.2}; SG.flame(c,pp.x,pp.y+s.r*0.3,s.r*(1-j*0.12),s.r*0.3,t,j,0.7-j*0.1); } }
      atImpact(t,880,1,0.5);
      if(t>=880){ const k=(t-880)/680; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tg.x,tg.y,R*(1.4+2.2*eo(k)),[255,160,60],0.9*(1-k)); c.restore();
        for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, rr=R*(0.4+1.8*eo(Math.min(1,k*1.3))); SG.flame(c,tg.x+Math.cos(a)*rr,tg.foot+Math.sin(a)*rr*0.3,R*0.9*(1-k),R*0.22,t,i,1-k); }
        for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, sp=R*(0.5+2*eo(k)); SG.feather(c,tg.x+Math.cos(a)*sp,tg.y+Math.sin(a)*sp*0.7+k*k*R,R*0.2,a+k*4,i%2?"#ffd45a":"#ff9a3a",1-k); } } }},
  /* Werewolf: it howls as the moon flashes behind it, vanishes in a blur and tears two crossing sets of claw marks through the target */
  sg_feralslash:{C:760,D:1460,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<360){ const k=eo(t/360); return {rot:-d*0.25*k,sy:1+0.08*k,pose:"cast",arc:-6*k}; } if(t<560){ const k=eio((t-360)/200); return {f:0.7*k,rot:d*0.3*k,sx:1+0.4*Math.sin(k*Math.PI),sy:1-0.2*Math.sin(k*Math.PI),pose:"tackle"}; }
      if(t<900) return {f:0.7+0.04*Math.sin((t-560)/50),rot:d*(Math.floor((t-560)/100)%2?0.4:-0.2),pose:"punch"}; const k=(t-900)/560; return {f:0.7*(1-eio(k)),rot:d*0.2*(1-k),pose:"idle"}; },
    def(t){ if(t>=640&&t<1460){ const k=(t-640)/820; return {off:[(Math.floor((t-640)/100)%2?-1:1)*6*(1-k)+20*eo(Math.min(1,k*2))*(1-k),0],pose:"hurt",flash:Math.floor(t/60)%2&&k<0.3?3:0}; } return null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), RD=[255,60,80];
      if(t<400){ const k=Math.min(1,t/300); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,s.x-d*s.r*0.6,s.top.y-s.r*0.6,s.r*1.6,[220,230,255],0.5*k*(1-t/400)); c.restore(); for(let i=0;i<3;i++){ c.strokeStyle=`rgba(255,255,255,${0.6*k})`; c.lineWidth=2; c.beginPath(); c.arc(s.x+d*s.r*0.4,s.top.y,s.r*(0.4+i*0.25+((t/300)%1)*0.3),-Math.PI/2-0.6,-Math.PI/2+0.6); c.stroke(); } }
      if(t>=360&&t<580){ const k=(t-360)/200; for(let i=0;i<4;i++){ c.globalAlpha=0.3*(1-i*0.2); c.fillStyle="#8a8aa0"; c.beginPath(); c.ellipse(s.x+(tg.x-s.x)*Math.max(0,eio(k)-i*0.1)*0.95,s.y,s.r*0.8,s.r*0.9,0,0,7); c.fill(); } c.globalAlpha=1; }
      for(const [T0,a0] of [[640,-d*0.9],[760,d*0.9]]){ const k=(t-T0)/650; if(k<0||k>1) continue; atImpact(t,T0,0.55,0.15); SG.claws(c,tg.x,tg.y-R*0.15,R*2.1,k,a0+Math.PI/2*0.15,[255,255,255]); SG.claws(c,tg.x,tg.y-R*0.15,R*2.1,k-0.03,a0+Math.PI/2*0.15,RD); }
      if(t>=760&&t<1300){ const k=(t-760)/540; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tg.x,tg.y-R*0.15,R*1.4,RD,0.5*(1-k)); c.restore(); } }}
});
Object.assign(AR_KIND,{"Avalanche":"sg_avalanche","Crushing Grip":"sg_kraken","Boulder Smash":"sg_bouldersmash","Prism Beam":"sg_prism","Spooky Grin":"sg_spookygrin","Gale Fan":"sg_galefan",
  "Belly Drum":"sg_bellydrum","Siren Song":"sg_siren","Petal Storm":"sg_petalstorm","Puzzle Gaze":"sg_puzzlegaze","Garuda Dive":"sg_garudadive","Feral Slash":"sg_feralslash"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  sg_avalanche:(d,t)=>{ sTone(d,t,'sawtooth',120,90,0.5,0.04); dNoise(d,t+0.3,0.6,0.15,'lowpass',400); dNoise(d,t+0.5,0.4,0.15,'bandpass',800,0.6); dKick(d,t+0.88,1); dNoise(d,t+0.88,0.8,0.3,'lowpass',500); dNoise(d,t+0.9,0.5,0.1,'highpass',3000,0.8); [2637,3136,2349].forEach((f,k)=>sTone(d,t+1.0+k*0.06,'sine',f,f,0.3,0.02)); },   // a roar, the snow rumbling down, a huge whump, ice ringing
  sg_kraken:(d,t)=>{ sTone(d,t,'sine',60,45,0.6,0.1); dNoise(d,t+0.3,0.4,0.2,'lowpass',300); for(let i=0;i<4;i++) dNoise(d,t+0.35+i*0.08,0.12,0.12,'lowpass',700); for(let i=0;i<3;i++) sTone(d,t+0.62+i*0.14,'sawtooth',110,80,0.12,0.06); dNoise(d,t+0.72,0.3,0.2,'lowpass',900); },   // a deep rumble, tentacles bursting up, three crushing squeezes, an ink splash
  sg_bouldersmash:(d,t)=>{ dNoise(d,t,0.3,0.25,'lowpass',300); for(let i=0;i<4;i++) dKick(d,t+0.05+i*0.06,0.2); sTone(d,t+0.3,'sawtooth',70,110,0.3,0.05); dNoise(d,t+0.62,0.28,0.12,'lowpass',600); dKick(d,t+0.9,1); dNoise(d,t+0.9,0.9,0.35,'lowpass',400); for(let i=0;i<8;i++) dNoise(d,t+0.95+i*0.05,0.06,0.1,'bandpass',1000+(i%3)*400,2); },   // tearing the rock up, a heave, the throw, a crashing boom and rubble
  sg_prism:(d,t)=>{ sTone(d,t,'sine',400,1200,0.46,0.03); sTone(d,t+0.46,'sawtooth',800,780,0.7,0.025); [1047,1175,1319,1397,1568,1760,1976].forEach((f,k)=>sTone(d,t+0.6+k*0.025,'triangle',f,f,0.5,0.025)); dNoise(d,t+0.76,0.3,0.1,'highpass',5000,0.6); },   // light gathering, the beam humming, a rainbow chord
  sg_spookygrin:(d,t)=>{ sTone(d,t+0.2,'sawtooth',90,60,0.6,0.05); [0.72,0.86,1.0,1.12].forEach((x,k)=>sTone(d,t+x,'square',520-k*40,380-k*40,0.08,0.04)); dNoise(d,t+0.72,0.4,0.06,'bandpass',1800,2); },   // a low rising groan, then a cackle
  sg_galefan:(d,t)=>{ dNoise(d,t+0.2,0.3,0.1,'bandpass',600,1); dNoise(d,t+0.44,0.2,0.2,'bandpass',900,1); dNoise(d,t+0.48,0.9,0.25,'bandpass',700,0.5); for(let i=0;i<6;i++) dNoise(d,t+0.6+i*0.08,0.06,0.08,'highpass',3000,2); dKick(d,t+0.7,0.4); },   // a fan sweep, a howling gale, leaves rattling
  sg_bellydrum:(d,t)=>{ [0,0.18,0.36].forEach((x,k)=>{ dKick(d,t+x,0.5+k*0.1); sTone(d,t+x,'sine',140,90,0.18,0.08); }); dNoise(d,t+0.6,0.3,0.1,'lowpass',500); dKick(d,t+0.9,1); sTone(d,t+0.9,'sine',120,60,0.4,0.12); dNoise(d,t+0.9,0.3,0.2,'lowpass',700); },   // three belly drum beats and a booming bump
  sg_siren:(d,t)=>{ [880,988,1175,1319,1175,988,1319,1568].forEach((f,k)=>{ sTone(d,t+k*0.11,'sine',f,f*1.003,0.3,0.035); sTone(d,t+k*0.11,'sine',f*2,f*2,0.3,0.008); }); dNoise(d,t+0.76,0.6,0.04,'highpass',6000,0.5); },   // a wordless, echoing song
  sg_petalstorm:(d,t)=>{ dNoise(d,t+0.1,0.6,0.08,'bandpass',1200,0.7); for(let i=0;i<10;i++) dNoise(d,t+0.2+i*0.04,0.04,0.05,'highpass',4000,2); [0.64,0.76,0.88].forEach(x=>{ dNoise(d,t+x,0.1,0.16,'highpass',3000,1.5); sTone(d,t+x,'triangle',1800,1400,0.06,0.025); }); },   // a whirl of petals and three slicing waves
  sg_puzzlegaze:(d,t)=>{ sTone(d,t,'sine',220,220,0.8,0.03); sTone(d,t,'sine',330,330,0.8,0.02); sTone(d,t+0.3,'sawtooth',600,900,0.4,0.02); for(let i=0;i<6;i++) sTone(d,t+0.6+i*0.07,'triangle',1200+(i%3)*200,1100+(i%3)*200,0.06,0.025); sTone(d,t+0.76,'sine',800,500,0.5,0.03); sTone(d,t+0.8,'sine',600,900,0.4,0.02); },   // an ancient drone, the gaze, glyphs clicking into a cube, a puzzled wobble
  sg_garudadive:(d,t)=>{ dNoise(d,t,0.3,0.1,'lowpass',800); sTone(d,t+0.2,'sawtooth',300,900,0.3,0.03); dNoise(d,t+0.56,0.32,0.2,'bandpass',1200,0.8); sTone(d,t+0.56,'sawtooth',1600,500,0.32,0.03); dKick(d,t+0.88,1); dNoise(d,t+0.88,0.7,0.3,'lowpass',700); for(let i=0;i<6;i++) dNoise(d,t+0.9+i*0.06,0.06,0.1,'bandpass',1800,2); },   // wings flaring, a cry, a roaring fiery dive, the explosion
  sg_feralslash:(d,t)=>{ sTone(d,t,'sawtooth',300,600,0.18,0.04); sTone(d,t+0.18,'sawtooth',600,450,0.2,0.04); dNoise(d,t+0.36,0.2,0.12,'bandpass',900,1); [0.64,0.76].forEach(x=>[0,0.03,0.06].forEach(y=>dNoise(d,t+x+y,0.1,0.18,'highpass',2600,2))); dKick(d,t+0.76,0.5); }   // a howl, a rush, two sets of tearing claws
});
if(typeof SWING!=="undefined") ["sg_bouldersmash","sg_bellydrum","sg_garudadive","sg_feralslash"].forEach(k=>SWING.add(k));


/* ---------- group D: the mythics, part 2 ---------- */
SG.neck=(c,a,b,w,col,k,t,seed,head=true)=>{ const N=16, pts=[]; for(let j=0;j<=N;j++){ const q=j/N*k; const p=lerpP(a,b,q,w*1.5*(seed%2?1:-1)); p.y+=Math.sin(q*7+t/90+seed)*w*0.3; pts.push(p); }
  c.lineCap="round"; c.lineJoin="round"; const line=(lw,st)=>{ c.strokeStyle=st; c.lineWidth=lw; c.beginPath(); pts.forEach((p,j)=>c[j?"lineTo":"moveTo"](p.x,p.y)); c.stroke(); };
  line(w*1.15,atRgba(col.map(v=>v-50),1)); line(w,atRgba(col,1)); line(w*0.3,atRgba(col.map(v=>Math.min(255,v+60)),0.7));
  if(head){ const e=pts[pts.length-1], pr=pts[pts.length-2]||a, ang=Math.atan2(e.y-pr.y,e.x-pr.x); c.save(); c.translate(e.x,e.y); c.rotate(ang); c.fillStyle=atRgba(col,1); c.strokeStyle=atRgba(col.map(v=>v-50),1); c.lineWidth=2;
    c.beginPath(); c.ellipse(0,0,w*1.1,w*0.75,0,0,7); c.fill(); c.stroke(); c.fillStyle="#fff"; c.beginPath(); c.arc(w*0.2,-w*0.35,w*0.22,0,7); c.fill(); c.fillStyle="#200"; c.beginPath(); c.arc(w*0.28,-w*0.35,w*0.1,0,7); c.fill();
    c.fillStyle="#fffaf0"; c.beginPath(); c.moveTo(w*0.8,w*0.1); c.lineTo(w*1.0,w*0.55); c.lineTo(w*0.6,w*0.2); c.fill(); c.restore(); } };
SG.plank=(c,x,y,L,w,a)=>{ c.save(); c.translate(x,y); c.rotate(a); c.fillStyle="#9a6a3a"; c.strokeStyle="#5a3a1a"; c.lineWidth=2; c.fillRect(-L*0.1,-w/2,L,w); c.strokeRect(-L*0.1,-w/2,L,w);
  c.strokeStyle="rgba(70,40,20,.6)"; c.lineWidth=1.2; for(let j=1;j<5;j++){ c.beginPath(); c.moveTo(-L*0.1+j*L/5,-w/2); c.lineTo(-L*0.1+j*L/5,w/2); c.stroke(); } c.fillStyle="#6a6a70"; for(let j=0;j<5;j++){ c.beginPath(); c.arc(-L*0.1+(j+0.5)*L/5,-w*0.28,w*0.07,0,7); c.arc(-L*0.1+(j+0.5)*L/5,w*0.28,w*0.07,0,7); c.fill(); } c.restore(); };
Object.assign(ANIM,{
  /* Minotaur: it paws the ground twice, lowers its horns and charges in a cloud of dust, goring the target and hurling it back */
  sg_bullrush:{C:840,D:1540,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<420){ const paw=Math.abs(Math.sin(t/105*Math.PI)); return {f:-0.08*Math.min(1,t/200),rot:d*0.25+d*0.08*paw,sy:1-0.08*paw,pose:"effort"}; }
      if(t<840){ const k=ei((t-420)/420); return {f:-0.08+0.75*k,rot:d*0.35,sx:1.1,sy:0.9,arc:-Math.abs(Math.sin(k*Math.PI*4))*6,pose:"tackle"}; } const k=(t-840)/700; return {f:0.67*(1-eio(Math.max(0,k-0.1)/0.9)),rot:d*0.35*(1-eo(k)),pose:k<0.4?"punch":"idle"}; },
    def(t){ if(t<840||t>1540) return null; const k=(t-840)/700; return {off:[60*eo(Math.min(1,k*1.5))*(1-k*0.5),-40*Math.sin(Math.min(1,k*1.4)*Math.PI)],rot:0.5*Math.sin(Math.min(1,k*1.4)*Math.PI),pose:"hurt",flash:k<0.1?3:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      for(const T0 of [0,210]){ const k=(t-T0)/400; if(k>=0&&k<1) SG.dust(c,s.x-d*s.r*0.4,s.foot,s.r*0.8,k,6); }
      if(t>=420&&t<880){ const k=(t-420)/420, px=s.x; for(let i=0;i<8;i++){ const ph=((t/160)+i/8)%1; SG.puff(c,px-d*s.r*(0.6+ph*2),s.foot-ph*s.r*0.5,s.r*(0.18+0.3*ph),(1-ph)*0.8,[220,200,170]); }
        c.strokeStyle="rgba(255,255,255,.6)"; c.lineWidth=2.5; for(let i=0;i<5;i++){ const yy=s.y+(i-2)*s.r*0.32; c.beginPath(); c.moveTo(px-d*s.r*1.0,yy); c.lineTo(px-d*s.r*(2+k*1.5),yy); c.stroke(); } }
      atImpact(t,840,1,0.4);
      if(t>=840){ const k=(t-840)/700; for(const o of [-0.3,0.25]){ c.save(); c.globalCompositeOperation="lighter"; c.strokeStyle=`rgba(255,240,200,${1-k})`; c.lineWidth=R*0.14*(1-k); c.lineCap="round"; c.beginPath(); c.moveTo(tg.x-d*R*0.8,tg.y+o*R); c.quadraticCurveTo(tg.x,tg.y+o*R-R*0.5,tg.x+d*R*0.9,tg.y+o*R-R*1.0*eo(Math.min(1,k*3))); c.stroke(); c.restore(); }
        atPow(c,{x:tg.x-d*R*0.4,y:tg.y-R*0.2},Math.min(1,k*1.2),R/20); SG.dust(c,tg.x,tg.foot,R*1.3,k,12); } }},
  /* Dragon: it rears back and breathes in, embers rushing into its mouth, then roars a great cone of fire over the target that scorches the ground */
  sg_wyrmbreath:{C:760,D:1460,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<440){ const k=eo(t/440); return {rot:-d*0.28*k,sx:1+0.1*k,sy:1+0.06*k,pose:"cast"}; } if(t<1250) return {rot:d*0.12+Math.sin(t/30)*0.02,off:[-d*4,0],pose:"push"}; return {rot:d*0.12*(1-(t-1250)/210),pose:"idle"}; },
    def(t){ const a=SG.shake(t,760,680,3.5); if(a){ a.sx=1.05; a.sy=0.94; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), mouth={x:s.x+d*s.r*0.85,y:s.y-s.r*0.25}, dst={x:tg.x,y:tg.y-R*0.1};
      if(t<440){ for(let i=0;i<14;i++){ const ph=((t/300)+i/14)%1, a=(atH(i)-0.5)*1.4+(d>0?0:Math.PI), r=s.r*(2.2-2*ph); c.fillStyle=`rgba(255,${150+(i%3)*30},60,${ph})`; c.fillRect(mouth.x+Math.cos(a)*r,mouth.y+Math.sin(a)*r,3,3); } return; }
      const head=Math.min(1,(t-440)/240), tail=t>1180?Math.min(1,(t-1180)/240):0;
      for(let j=0;j<34;j++){ const q=((j/34)+(t-440)/600)%1; if(q>head||q<tail) continue; const p=lerpP(mouth,dst,q,0), spread=R*(0.1+0.9*q), jy=(atH(j*3+Math.floor(t/80))-0.5)*spread*1.6, r=R*(0.12+0.42*q);
        c.save(); c.globalCompositeOperation="lighter"; const g=c.createRadialGradient(p.x,p.y+jy,0,p.x,p.y+jy,r); g.addColorStop(0,`rgba(255,250,200,${0.9-q*0.4})`); g.addColorStop(0.45,`rgba(255,150,40,${0.75-q*0.3})`); g.addColorStop(1,"rgba(230,60,20,0)"); c.fillStyle=g; c.beginPath(); c.arc(p.x,p.y+jy,r,0,7); c.fill(); c.restore(); }
      if(t>=760){ atImpact(t,760,0.75,0.35); const k=(t-760)/700; c.fillStyle=`rgba(40,26,20,${0.55*(1-k*0.5)})`; c.beginPath(); c.ellipse(tg.x,tg.foot,R*1.5,R*0.3,0,0,7); c.fill();
        for(let i=0;i<6;i++) SG.flame(c,tg.x+(i-2.5)*R*0.42,tg.foot,R*(0.7+0.4*atH(i))*(1-k*0.6),R*0.2,t,i,1-k*0.7);
        for(let i=0;i<10;i++){ const ph=(k*1.4+i/10)%1; c.fillStyle=`rgba(255,${170+i*6},70,${1-ph})`; c.fillRect(tg.x+(atH(i*3)-0.5)*R*2.6,tg.y-ph*R*2,3,3); } } }},
  /* Thunderbird: it spreads its wings, the sky goes dark, and a giant lightning bolt drops on the target while arcs fork out from its wings */
  sg_thunderwing:{C:760,D:1460,sig:true,
    atk:t=>({arc:-20*Math.sin(Math.min(1,t/1100)*Math.PI),sx:t<760?1+0.2*eo(t/760):1.2-0.2*eo((t-760)/600),pose:t<760?"cast":"push",flash:t>740&&t<820?3:0}),
    def(t){ if(t<760||t>1460) return null; return {pose:"hurt",off:[(atH(Math.floor(t/35))-0.5)*8,0],flash:Math.floor(t/50)%2?3:0,sy:0.92}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, YL=[255,240,140], top=Math.max(0,tg.top.y-R*5);
      if(t<760){ const k=t/760; c.save(); c.fillStyle=`rgba(10,10,40,${0.3*k})`; c.fillRect(0,0,x.W||2000,x.H||2000); c.restore(); c.save(); c.globalCompositeOperation="lighter"; c.lineCap="round"; const fr=Math.floor(t/60);
        for(const sd of [-1,1]) for(let i=0;i<2;i++){ const a={x:s.x+sd*s.r*0.8,y:s.y-s.r*0.3}, b={x:s.x+sd*s.r*(1.8+i*0.5),y:s.y-s.r*(1.2+i*0.6)}; c.strokeStyle=atRgba(YL,0.8*k); c.lineWidth=3; atZig(c,a,b,5,s.r*0.3,fr+i*7+sd); } c.restore(); return; }
      atImpact(t,760,0.95,0.7); const k=(t-760)/700, fr=Math.floor(t/45); c.save(); c.globalCompositeOperation="lighter"; c.lineCap="round"; c.lineJoin="round";
      if(k<0.55){ const a={x:tg.x+(atH(fr)-0.5)*R*0.6,y:top}, b={x:tg.x,y:tg.foot-R*0.2}; c.strokeStyle=atRgba(YL,0.5); c.lineWidth=R*0.5; atZig(c,a,b,9,R*0.8,fr); c.strokeStyle=atRgba(YL,0.95); c.lineWidth=R*0.16; atZig(c,a,b,9,R*0.8,fr); c.strokeStyle="#fff"; c.lineWidth=R*0.06; atZig(c,a,b,9,R*0.8,fr);
        for(let i=0;i<3;i++){ const m=lerpP(a,b,0.3+i*0.2,0); c.strokeStyle=atRgba(YL,0.7); c.lineWidth=2.5; atZig(c,m,{x:m.x+(i%2?1:-1)*R*1.4,y:m.y+R*0.8},4,R*0.4,fr+i); } }
      atGlowA(c,tg.x,tg.foot-R*0.3,R*(1.5+1.5*k),YL,0.8*(1-k)); SG.ring(c,tg.x,tg.foot,R*(0.6+2.4*eo(k)),R*(0.18+0.6*eo(k)),YL,5*(1-k),1-k);
      for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+fr*0.3, rr=R*(1+0.5*atH(i+fr)); c.strokeStyle=atRgba(YL,0.8*(1-k)); c.lineWidth=2; atZig(c,{x:tg.x,y:tg.y},{x:tg.x+Math.cos(a)*rr,y:tg.y+Math.sin(a)*rr*0.8},4,R*0.25,fr*3+i); } c.restore(); }},
  /* Hydra: its three heads stretch out on long necks and strike one after another from high, low and straight on, leaving venom dripping */
  sg_manyheads:{C:560,D:1260,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1, st=T0=>t<T0-300?0:t<T0?eio((t-T0+300)/300):t<1050?1:1-eio(Math.min(1,(t-1050)/200)), a=st(560), b=st(680), m=st(800);
      return {f:0.25+0.3*m,rot:t<400?-d*0.12*eo(t/400):d*0.08*m,pose:atPose(m>0.5?"bitewide":"attack",{lash:0.1+1.2*a,lash2:0.1+1.2*b,eyes:"fierce"}),sx:1+0.06*m}; },
    def(t){ for(let i=0;i<3;i++){ const T0=560+i*120; if(t>=T0&&t<T0+110) return {off:[8,(i-1)*3],pose:"hit",flash:2}; } return t>=920&&t<1260?{pose:"hurt",flash:Math.floor(t/120)%2?2:0}:null; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), col=[90,160,110], ys=[-0.5,0.15,-0.15];
      for(let i=0;i<3;i++){ const T0=260+i*120, T1=560+i*120; if(t<T0) continue; const back=t>1050?1-(t-1050)/200:1; if(back<=0) continue;
        const k=Math.min(1,(t-T0)/(T1-T0))*back, a={x:s.x+d*s.r*0.3,y:s.y-s.r*(0.2+0.25*i)}, b={x:tg.x-d*R*0.3,y:tg.y+ys[i]*R};
        
        if(t>=T1&&t<T1+300){ const kk=(t-T1)/300; atImpact(t,T1,0.3+i*0.1,0); atPow(c,b,kk,R/34); for(let j=0;j<4;j++){ c.fillStyle=`rgba(150,90,210,${1-kk})`; c.beginPath(); c.ellipse(b.x+(j-1.5)*R*0.12,b.y+R*0.2+kk*R*0.6,R*0.04,R*0.07,0,0,7); c.fill(); } } } }},
  /* Griffin: it climbs into a full loop high in the sky, then shoots across in a golden spear of wind and rakes the target as it passes */
  sg_skytalon:{C:900,D:1580,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<620){ const k=eio(t/620), a=k*Math.PI*2; return {f:0.12*Math.sin(a)*1,arc:-90*(1-Math.cos(a))*0.5-60*k,rot:-d*a,pose:"jump"}; }
      if(t<900){ const k=ei((t-620)/280); return {f:0.68*k,arc:-60*(1-k),rot:d*0.45,sx:1.2,sy:0.85,pose:"tackle"}; } const k=(t-900)/680; return {f:0.68*(1-eio(k)),arc:-30*Math.sin(Math.min(1,k*1.5)*Math.PI),rot:d*0.45*(1-eo(k)),pose:k<0.4?"land":"idle"}; },
    def(t){ const a=SG.knock(t,900,1,34,600); if(a) a.pose="hurt"; return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), GD=[255,215,110];
      if(t<620){ const k=t/620; c.save(); c.globalCompositeOperation="lighter"; c.strokeStyle=atRgba(GD,0.6); c.lineWidth=s.r*0.2; c.lineCap="round"; c.beginPath(); c.arc(s.x,s.y-s.r*1.4,s.r*1.4,Math.PI/2,Math.PI/2-d*Math.PI*2*eio(k),d>0); c.stroke(); c.restore();
        for(let i=0;i<5;i++){ const ph=((t/200)+i/5)%1; SG.feather(c,s.x+(atH(i)-0.5)*s.r*2,s.y-s.r*(0.5+ph*2),s.r*0.15,t/100+i,"#ffe08a",1-ph); } }
      if(t>=620&&t<920){ const k=(t-620)/280, tip={x:s.x+(tg.x-s.x)*ei(k),y:s.y-60*(1-ei(k))}; c.save(); c.globalCompositeOperation="lighter"; const g=c.createLinearGradient(tip.x,tip.y,tip.x-d*R*3,tip.y); g.addColorStop(0,atRgba(GD,0.9)); g.addColorStop(1,atRgba(GD,0)); c.fillStyle=g;
        c.beginPath(); c.moveTo(tip.x+d*R*0.6,tip.y); c.lineTo(tip.x-d*R*3,tip.y-R*0.6); c.lineTo(tip.x-d*R*3,tip.y+R*0.6); c.closePath(); c.fill(); c.restore(); }
      atImpact(t,900,0.9,0.35);
      if(t>=900){ const k=(t-900)/680; SG.claws(c,tg.x,tg.y-R*0.1,R*1.8,k,Math.PI*0.05,[255,240,190]); SG.ring(c,tg.x,tg.y,R*(0.6+2*eo(k)),R*(0.8+1.8*eo(k)),GD,4*(1-k),1-k);
        for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, sp=R*(0.5+1.7*eo(k)); SG.feather(c,tg.x+Math.cos(a)*sp,tg.y+Math.sin(a)*sp*0.7+k*k*R,R*0.18,a+k*4,i%2?"#ffe08a":"#c89a40",1-k); } } }},
  /* Kirin: it stamps once, and white-gold sacred flames rise in a ring round the target and close into a pillar of holy fire */
  sg_holyflame:{C:800,D:1500,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<360){ const k=eo(t/360); return {rot:-d*0.2*k,arc:-12*k,pose:"cast"}; } if(t<520){ const k=ei((t-360)/160); return {rot:-d*0.2+d*0.3*k,arc:-12*(1-k),pose:"punch",sy:1-0.1*k}; } return {pose:t<1200?"cast":"idle",sy:0.9+0.1*Math.min(1,(t-520)/300)}; },
    def(t){ const a=SG.shake(t,800,700,3); if(a){ a.lift=-8*Math.min(1,(t-800)/300); } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, HW=[255,245,200], GD=[255,210,110];
      if(t>=520&&t<900){ const k=(t-520)/380; SG.ring(c,s.x,s.foot,s.r*(0.5+2*k),s.r*(0.15+0.5*k),GD,4*(1-k),1-k); }
      if(t<520) return; const g=Math.min(1,(t-520)/280), close=t<800?0:Math.min(1,(t-800)/200), out=t>1300?1-(t-1300)/200:1; if(out<=0) return; c.save(); c.globalAlpha=out;
      const RR=R*(1.6-0.9*close); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2+t/900, px=tg.x+Math.cos(a)*RR, py=tg.foot+Math.sin(a)*RR*0.3; if(Math.sin(a)<0){ c.save(); c.globalCompositeOperation="lighter"; SG.flame(c,px,py,R*(0.8+0.3*atH(i))*g,R*0.18,t,i,0.9); c.restore(); } }
      if(close>0){ c.save(); c.globalCompositeOperation="lighter"; const top=tg.top.y-R*2.5*close, gg=c.createLinearGradient(0,tg.foot,0,top); gg.addColorStop(0,atRgba(HW,0.85)); gg.addColorStop(1,atRgba(HW,0)); c.fillStyle=gg; c.fillRect(tg.x-R*1.0,top,R*2.0,tg.foot-top);
        for(let i=0;i<8;i++){ const ph=((t/400)+i/8)%1; atStar4(c,tg.x+(atH(i)-0.5)*R*1.6,tg.foot-ph*(tg.foot-top),R*0.15*(1-ph),"rgba(255,255,230,.95)"); } c.restore(); atImpact(t,800,0.7,0.5); }
      for(let i=0;i<12;i++){ const a=i/12*Math.PI*2+t/900, px=tg.x+Math.cos(a)*RR, py=tg.foot+Math.sin(a)*RR*0.3; if(Math.sin(a)>=0){ c.save(); c.globalCompositeOperation="lighter"; SG.flame(c,px,py,R*(0.8+0.3*atH(i))*g,R*0.18,t,i,0.9); c.restore(); } }
      c.restore(); }},
  /* Salamander: it spins on the spot and whips its blazing tail round in a wide arc of fire that slashes the target and leaves the floor burning */
  sg_flametail:{C:680,D:1380,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<300){ const k=eo(t/300); return {f:0.3*k,rot:-d*0.2*k,pose:"crouch"}; } if(t<760){ const k=eio((t-300)/460); return {f:0.42,rot:-d*0.2*(1-k),sx:1.08*Math.cos(k*Math.PI*2),pose:"punch",arc:-10*Math.sin(k*Math.PI)}; } const k=(t-760)/620; return {f:0.42*(1-eio(k)),rot:0,pose:"idle"}; },
    def(t){ const a=SG.knock(t,680,1,26,560); if(a){ a.flash=Math.floor(t/70)%2?3:0; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x);
      if(t>=300&&t<900){ const k=(t-300)/460, a0=-d*0.2+d*Math.PI*2*eio(Math.min(1,k)), cx=s.x+(tg.x-s.x)*0.42*0.6; c.save(); c.globalCompositeOperation="lighter"; c.lineCap="round";
        for(let j=0;j<10;j++){ const a=a0-d*j*0.12, rr=s.r*1.7, px=cx+Math.cos(a+Math.PI/2)*rr*0, py=0; const fx2=cx+Math.cos(a)*rr*d, fy=s.y+Math.sin(a)*rr*0.45; atGlowA(c,fx2,fy,s.r*(0.45-j*0.035),[255,140,40],0.8-j*0.07); } c.restore(); }
      atImpact(t,680,0.7,0.3);
      if(t>=680){ const k=(t-680)/700; c.save(); c.globalCompositeOperation="lighter"; atCrescent(c,tg.x,tg.y-R*0.1,R*1.5,d>0?Math.PI*0.9:Math.PI*0.1,Math.min(0.99,k*1.2),[255,170,60]); atCrescent(c,tg.x,tg.y-R*0.1,R*1.2,d>0?Math.PI*0.9:Math.PI*0.1,Math.min(0.99,k*1.2+0.05),[255,240,180]); c.restore();
        for(let i=0;i<7;i++) SG.flame(c,tg.x-d*R*1.2+d*i*R*0.4,tg.foot,R*(0.5+0.3*atH(i))*(1-k),R*0.16,t,i,1-k); } }},
  /* Bakunawa: the arena goes dark, a moon rises over the target, and a vast serpent's jaws come up from below and swallow the moon and the target with it */
  sg_swallowmoon:{C:800,D:1500,sig:true,
    atk:t=>({pose:t<800?"cast":t<1200?"push":"idle",arc:-10*Math.sin(Math.min(1,t/1200)*Math.PI),sx:1+0.05*Math.sin(t/80)}),
    def(t){ if(t<800||t>1500) return null; const a=t<1200?1:1-(t-1200)/300; return {sx:1-0.15*a,sy:1-0.1*a,pose:"hurt",off:[Math.sin(t/30)*3*a,0]}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, my=tg.top.y-R*1.3, MR=R*0.9, dark=t<500?t/500:t>1250?1-(t-1250)/250:1, SC=[60,80,150];
      c.save(); c.fillStyle=`rgba(5,8,30,${0.5*dark})`; c.fillRect(0,0,x.W||2000,x.H||2000); c.restore();
      const eat=t<800?0:Math.min(1,(t-800)/250);
      if(t>150&&eat<1){ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tg.x,my,MR*2.2,[230,235,255],0.5*Math.min(1,(t-150)/300)*(1-eat)); c.restore(); c.save(); c.globalAlpha=Math.min(1,(t-150)/300)*(1-eat); c.fillStyle="#f4f4ff"; c.beginPath(); c.arc(tg.x,my,MR,0,7); c.fill(); c.fillStyle="rgba(170,170,200,.5)"; c.beginPath(); c.arc(tg.x-MR*0.3,my+MR*0.2,MR*0.2,0,7); c.arc(tg.x+MR*0.35,my-MR*0.2,MR*0.14,0,7); c.fill(); c.restore(); }
      if(t>450){ const rise=eo(Math.min(1,(t-450)/350)), shut=t<800?0:Math.min(1,(t-800)/150), close=t>1150?Math.min(1,(t-1150)/250):0, H=(tg.foot-my+MR)*1.15, by=tg.foot+R*0.2, W=R*1.55; c.save(); c.globalAlpha=1-close;
        const gap=H*(1-shut)*0.5; for(const sd of [-1,1]){ const jy=sd<0?by-H*rise:by; c.fillStyle=atRgba(SC,1); c.strokeStyle="#1a2440"; c.lineWidth=3; c.beginPath();
          if(sd<0){ c.moveTo(tg.x-W,by-gap); c.quadraticCurveTo(tg.x,by-gap-H*rise*1.1,tg.x+W,by-gap); } else { c.moveTo(tg.x-W,by); c.quadraticCurveTo(tg.x,by+R*0.6,tg.x+W,by); } c.lineTo(tg.x+W,by+(sd<0?-gap+R*0.3:R*0.4)); c.lineTo(tg.x-W,by+(sd<0?-gap+R*0.3:R*0.4)); c.closePath(); c.fill(); c.stroke();
          c.fillStyle="#fffaf0"; for(let j=0;j<7;j++){ const tx=tg.x-W*0.8+j*W*1.6/6, ty=sd<0?by-gap+R*0.3:by; c.beginPath(); c.moveTo(tx-R*0.12,ty); c.lineTo(tx,ty+(sd<0?R*0.35:-R*0.35)); c.lineTo(tx+R*0.12,ty); c.fill(); } }
        c.restore(); if(shut>0) atImpact(t,800,0.85,0.2); } }},
  /* Cerberus: a dark gate opens behind the target and its three heads lunge through in turn, high, low and middle, each bite trailing purple fire */
  sg_gatefang:{C:640,D:1340,contact:true,marks:true,sig:true,
    // three clear bites, one from each head: high, low, then the middle head clamps on (Gid: maybe 3 bites)
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<320){ const k=eo(t/320); return {f:-0.05*k,sy:1-0.12*k,pose:"crouch"}; } if(t<580){ const k=eio((t-320)/260); return {f:-0.05+0.65*k,rot:-d*0.1*k,pose:"bitewide"}; }
      if(t<1120){ const j=Math.floor((t-580)/180), p=((t-580)%180)/180, tilt=[-0.18,0.2,0.04][j]; return {f:0.58+0.07*Math.sin(p*Math.PI),rot:d*tilt*Math.sin(Math.min(1,p*1.6)*Math.PI/2),arc:j===0?-8*Math.sin(p*Math.PI):0,pose:p<0.35?"bitewide":"chomp",sx:1+0.06*Math.sin(p*Math.PI)}; }
      const k=Math.min(1,(t-1120)/220); return {f:0.6*(1-eio(k)),pose:"idle"}; },
    def(t){ for(let i=0;i<3;i++){ const T0=640+i*180; if(t>=T0&&t<T0+120) return {off:[9,[-4,4,0][i]],pose:"hit",flash:3}; } return t>=1100&&t<1340?{pose:"hurt",off:[Math.sin(t/16)*2,0]}:null; },
    fx(c,t,x){ const tg=x.target, R=tg.r, d=atDir(x), PU=[170,80,255], g=Math.min(1,t/400)*(t>1200?1-(t-1200)/140:1); if(g<=0) return;
      c.save(); const gx=tg.x+d*R*1.1, gy=tg.y-R*0.3; c.fillStyle=`rgba(20,8,30,${0.85*g})`; c.beginPath(); c.ellipse(gx,gy,R*0.9*g,R*1.6*g,0,0,7); c.fill(); c.strokeStyle=`rgba(190,110,255,${0.9*g})`; c.lineWidth=4; c.stroke();
      c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+t/400; SG.flame(c,gx+Math.cos(a)*R*0.9*g,gy+Math.sin(a)*R*1.6*g+R*0.2,R*0.4*g,R*0.1,t,i,0.6); } c.restore(); c.restore();
      for(let i=0;i<3;i++){ const T0=640+i*180, k=(t-T0)/300; if(k<0||k>1) continue; const yy=tg.y+[-0.5,0.3,-0.1][i]*R; atImpact(t,T0,0.4+i*0.1,0.1); chompMarks(c,{x:tg.x-d*R*0.1,y:yy},k);
        c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tg.x-d*R*0.1,yy,R*0.6,PU,0.6*(1-k)); c.restore(); } }},
  /* Djinn: it rubs up a giant golden lamp that shakes and glows, smoke roars out of the spout into a towering genie arm, and the fist slams down on the target in a purple and gold explosion */
  sg_lampblast:{C:900,D:1600,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<380) return {arc:-10-Math.sin(t/60)*3,rot:Math.sin(t/45)*0.1,pose:"cast",sx:1+0.04*Math.sin(t/30)};
      if(t<900){ const k=(t-380)/520; return {arc:-10-24*eo(k),rot:-d*0.15*eo(k),pose:"cast",sy:1+0.06*k}; } if(t<1100){ const k=(t-900)/200; return {arc:-34+20*eo(k),rot:-d*0.15+d*0.35*eo(k),pose:"push"}; }
      const k=(t-1100)/500; return {arc:-14*(1-eo(k)),rot:d*0.2*(1-eo(k)),pose:"idle"}; },
    def(t){ if(t<900||t>1600) return null; const k=(t-900)/700; return {sx:1+0.3*(1-eo(Math.min(1,k*2))),sy:1-0.42*(1-eo(Math.min(1,k*2))),pose:"hurt",off:[Math.sin(t/12)*4*(1-k),0],flash:k<0.2&&Math.floor(t/50)%2?3:0}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), SM=[150,90,220], GD=[255,205,90], L=s.r*1.0, lamp={x:s.x+d*s.r*1.25,y:s.foot-L*0.55}, spout={x:lamp.x+d*L*1.25,y:lamp.y-L*0.55};
      const show=Math.min(1,t/220)*(t>1350?1-(t-1350)/200:1), shake=t<900?Math.sin(t/18)*L*0.06*Math.min(1,t/400):0;
      /* the lamp itself, big and gleaming, rattling harder as it builds */
      if(show>0){ c.save(); c.globalAlpha=show; c.translate(lamp.x+shake,lamp.y); c.rotate(d*(t<900?Math.sin(t/25)*0.06:0)); c.scale(d,1);
        c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,0,0,L*2.2,GD,0.45*(t<900?Math.min(1,t/600):1-(t-900)/450)); c.restore();
        const g=c.createLinearGradient(-L,-L,L,L); g.addColorStop(0,"#fff6c0"); g.addColorStop(0.45,"#f2c040"); g.addColorStop(1,"#9a6408"); c.fillStyle=g; c.strokeStyle="#6a4206"; c.lineWidth=2.5;
        c.beginPath(); c.ellipse(0,0,L,L*0.55,0,0,7); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(L*0.75,-L*0.1); c.quadraticCurveTo(L*1.3,-L*0.05,L*1.3,-L*0.55); c.lineTo(L*1.1,-L*0.5); c.quadraticCurveTo(L*1.0,L*0.1,L*0.55,L*0.22); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.ellipse(0,-L*0.55,L*0.42,L*0.16,0,0,7); c.fill(); c.stroke(); c.beginPath(); c.arc(0,-L*0.78,L*0.12,0,7); c.fill(); c.stroke();
        c.lineWidth=L*0.12; c.strokeStyle="#c8961e"; c.beginPath(); c.arc(-L*1.02,0,L*0.33,Math.PI*0.45,Math.PI*1.55); c.stroke();
        c.fillStyle="#d8263c"; c.beginPath(); c.arc(0,0,L*0.12,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(-L*0.35,-L*0.22,L*0.3,L*0.1,-0.3,0,7); c.fill(); c.restore();
        if(t<500) for(let i=0;i<3;i++){ const tw=Math.max(0,Math.sin(t/70+i*2.1)); c.save(); c.globalCompositeOperation="lighter"; atStar4(c,lamp.x+(atH(i)-0.5)*L*2,lamp.y-L*0.3+(atH(i*3)-0.5)*L*0.6,L*0.35*tw,"rgba(255,255,220,.95)"); c.restore(); } }
      /* genie smoke: thin where it leaves the spout, swelling and swirling as it climbs over the target, with curling wisps, until the end of it becomes a fist */
      const top={x:tg.x-d*R*0.2,y:tg.top.y-R*2.3}, rise=Math.min(1,Math.max(0,(t-380)/420)), slam=t<760?0:Math.min(1,(t-760)/140), fist={x:top.x,y:top.y+(tg.top.y-R*0.2-top.y)*ei(slam)}, PAL=[[170,110,235],[230,130,220],[120,150,250]];
      if(t>=380&&t<1300){ const fade=t>1050?Math.max(0,1-(t-1050)/250):1, N=46, end={x:fist.x,y:fist.y+R*0.5};
        for(let j=0;j<N;j++){ const q=j/N; if(q>rise) continue; const p=lerpP(spout,end,q,R*1.6*(1-slam*0.6)), sw=Math.sin(q*10-t/90)*R*0.32*q, r=R*(0.3+0.95*q)*(0.85+0.3*atH(j*7+Math.floor(t/90)));
          SG.fog(c,p.x+sw,p.y,r*1.5,PAL[j%3],0.6*fade); SG.fog(c,p.x+sw+Math.cos(t/150+j)*r*0.5,p.y+Math.sin(t/170+j)*r*0.4,r*1.1,PAL[(j+1)%3],0.45*fade); }
        c.save(); c.globalCompositeOperation="lighter"; for(let j=0;j<N;j+=3){ const q=j/N; if(q>rise) continue; const p=lerpP(spout,end,q,R*1.6*(1-slam*0.6)), sw=Math.sin(q*10-t/90)*R*0.32*q; SG.fog(c,p.x+sw,p.y,R*(0.2+0.5*q),[255,220,255],0.45*fade); } c.restore();
        c.lineCap="round"; for(let w=0;w<6;w++){ c.strokeStyle=atRgba(PAL[w%3].map(v=>Math.min(255,v+50)),0.6*fade); c.lineWidth=2.5+2*(w%2); c.beginPath();
          for(let j=0;j<=24;j++){ const q=j/24*rise, p=lerpP(spout,end,q,R*1.6*(1-slam*0.6)), curl=Math.sin(q*14+w*1.7-t/70)*R*(0.15+0.6*q); c[j?"lineTo":"moveTo"](p.x+curl,p.y+Math.cos(q*9+w-t/80)*R*0.2*q); } c.stroke(); }
        for(let j=0;j<8;j++){ const q=Math.min(rise,atH(j*5)), p=lerpP(spout,end,q,R*1.6*(1-slam*0.6)); c.save(); c.globalCompositeOperation="lighter"; atStar4(c,p.x+(atH(j*3)-0.5)*R*0.8*q,p.y+(atH(j)-0.5)*R*0.5,R*0.2*Math.abs(Math.sin(t/90+j)),atRgba(GD,0.95*fade)); c.restore(); }
        if(rise>=1){ const F=R*(0.95+0.2*Math.sin(Math.min(1,(t-800)/300)*Math.PI)); c.save(); c.translate(fist.x,fist.y);
          for(const [ox,oy,rr] of [[0,0,1],[-0.6,0.55,0.38],[-0.2,0.62,0.38],[0.2,0.62,0.38],[0.6,0.55,0.36],[0.85,-0.1,0.4]]) { SG.fog(c,ox*F,oy*F,rr*F*1.5,PAL[Math.abs(Math.round(ox*3))%3],0.95*fade); SG.fog(c,ox*F,oy*F,rr*F*0.9,[110,60,170],0.6*fade); }
          c.globalCompositeOperation="lighter"; SG.fog(c,0,0,F*0.9,[255,220,255],0.35*fade); c.globalCompositeOperation="source-over";
          c.strokeStyle=`rgba(255,235,255,${0.35*fade})`; c.lineWidth=2; for(let k2=0;k2<4;k2++){ c.beginPath(); c.arc(-F*0.6+k2*F*0.4,F*0.6,F*0.26,Math.PI,Math.PI*2); c.stroke(); }
          c.fillStyle=`rgba(255,216,74,${fade})`; c.strokeStyle=`rgba(154,100,8,${fade})`; c.lineWidth=2; c.beginPath(); c.ellipse(0,-F*0.85,F*0.85,F*0.16,0,0,7); c.fill(); c.stroke(); c.restore();
          if(t<900){ c.save(); c.globalCompositeOperation="lighter"; for(const sd of [-1,1]) atWisp(c,top.x+sd*R*0.35,top.y-R*1.0,R*0.12,[255,240,150]); c.restore(); } } }
      if(t>=900){ atImpact(t,900,1,0.6); const k=(t-900)/700;
        c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tg.x,tg.y-R*0.2,R*(1.6+3*eo(k)),[200,120,255],0.95*(1-k)); atGlowA(c,tg.x,tg.y-R*0.2,R*(0.8+1.6*eo(k)),GD,0.9*(1-k));
        for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, L2=R*(1.2+2.8*eo(k)); c.strokeStyle=atRgba(i%2?GD:[220,170,255],0.9*(1-k)); c.lineWidth=4*(1-k)+1; c.beginPath(); c.moveTo(tg.x+Math.cos(a)*R*0.6,tg.y-R*0.2+Math.sin(a)*R*0.6); c.lineTo(tg.x+Math.cos(a)*L2,tg.y-R*0.2+Math.sin(a)*L2*0.8); c.stroke(); } c.restore();
        for(let i=0;i<18;i++){ const a=i/18*Math.PI*2, sp=R*(0.9+2.6*eo(k)); SG.fog(c,tg.x+Math.cos(a)*sp,tg.foot-R*0.3+Math.sin(a)*sp*0.4-k*R*0.6,R*(0.6+0.7*k),[[170,110,235],[230,130,220],[120,150,250]][i%3],0.6*(1-k)); }
        for(let w=0;w<2;w++){ const kk=Math.min(1,Math.max(0,k*1.3-w*0.15)); SG.ring(c,tg.x,tg.foot,R*(0.6+3.4*eo(kk)),R*(0.18+0.8*eo(kk)),w?GD:[220,170,255],6*(1-kk),1-kk); }
        SG.cracks(c,tg.x,tg.foot,R*2.4,10,2.2,1-k*k);
        for(let i=0;i<10;i++){ const a=-Math.PI*(atH(i*3)), sp=R*(0.6+2*eo(k)); c.save(); c.globalCompositeOperation="lighter"; atStar4(c,tg.x+Math.cos(a)*sp*(i%2?1:-1),tg.y+Math.sin(a)*sp+k*k*R,R*0.22*(1-k),"rgba(255,230,140,.95)"); c.restore(); } } }},
  /* Troll: it wrenches up a whole section of wooden bridge, swings it overhead and smashes it down on the target, sending planks and splinters flying */
  sg_bridgesmash:{C:880,D:1560,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<520){ const k=eo(t/520); return {rot:-d*0.35*k,sy:1+0.08*k,f:0.15*k,pose:"effort"}; } if(t<880){ const k=ei((t-520)/360); return {rot:-d*0.35+d*0.75*k,f:0.15+0.3*k,sy:1.08-0.18*k,pose:"punch"}; } const k=(t-880)/680; return {rot:d*0.4*(1-eo(k)),f:0.45*(1-eio(k)),sy:0.9+0.1*eo(k),pose:k<0.4?"land":"idle"}; },
    def:t=>SG.squash(t,880,0.42,620),
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), L=Math.abs(tg.x-s.x)*0.95, piv={x:s.x+d*s.r*0.3,y:s.y-s.r*0.2};
      const ang=t<520?-Math.PI/2-d*0.9*eo(t/520):t<880?-Math.PI/2-d*0.9+d*(Math.PI/2+0.9)*ei((t-520)/360):0, out=t>1250?1-(t-1250)/300:1;
      if(t<1550&&out>0){ c.save(); c.globalAlpha=out; SG.plank(c,piv.x,piv.y,t<880?L:L*(1-0.15*Math.min(1,(t-880)/300)),s.r*0.55,d>0?ang:Math.PI-ang); c.restore(); }
      if(t>500&&t<900){ c.save(); c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=s.r*0.3; c.lineCap="round"; c.beginPath(); c.arc(piv.x,piv.y,L*0.9,d>0?ang-0.5:Math.PI-ang,d>0?ang:Math.PI-ang+0.5); c.stroke(); c.restore(); }
      atImpact(t,880,1,0.45);
      if(t>=880){ const k=(t-880)/680; for(let i=0;i<14;i++){ const a=-Math.PI*(0.05+0.9*atH(i*3)), sp=R*(0.5+2.2*eo(k)); c.save(); c.translate(tg.x+Math.cos(a)*sp*(i%2?1:-1),tg.top.y+Math.sin(a)*sp*0.8+k*k*R*2); c.rotate(k*6+i); c.globalAlpha=1-k; c.fillStyle=i%3?"#9a6a3a":"#c8955a"; c.fillRect(-R*0.25,-R*0.05,R*0.5,R*0.1); c.restore(); }
        SG.cracks(c,tg.x,tg.foot,R*2.6,10,1.7,1-k*k); SG.dust(c,tg.x,tg.foot,R*1.3,k,12); SG.stars(c,tg.x,tg.top.y-R*0.2,R*0.7,t,3); } }},
  /* Mummy: its bandages whip out across the arena and wind round and round the target until it is wrapped up tight, sand pouring off it */
  sg_mummywrap:{C:720,D:1420,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return t<380?{rot:-d*0.15*eo(t/380),pose:"cast",sx:1+0.05*Math.sin(t/40)}:t<1150?{rot:d*0.1,off:[-d*3,0],pose:"push"}:{pose:"idle"}; },
    def(t){ if(t<620||t>1420) return null; const w=Math.min(1,(t-620)/300); return {sx:1-0.1*w,sy:1+0.02*w,rot:Math.sin(t/60)*0.05,pose:"hurt"}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), BD=[240,228,200], h=tg.foot-tg.top.y, out=t>1260?1-(t-1260)/160:1; if(out<=0) return; c.save(); c.globalAlpha=out; c.lineCap="round";
      for(let i=0;i<3;i++){ const k=Math.min(1,Math.max(0,(t-300-i*60)/320)); if(k<=0) continue; const a={x:s.x+d*s.r*0.5,y:s.y-s.r*(0.3-i*0.25)}, b={x:tg.x,y:tg.top.y+h*(0.3+i*0.22)}, N=16; c.beginPath();
        for(let j=0;j<=N*k;j++){ const q=j/N, p=lerpP(a,b,q,R*0.4*(i-1)); p.y+=Math.sin(q*10+t/60+i)*R*0.12; c[j?"lineTo":"moveTo"](p.x,p.y); } c.strokeStyle="rgba(150,130,100,.8)"; c.lineWidth=R*0.2; c.stroke(); c.strokeStyle=atRgba(BD,1); c.lineWidth=R*0.15; c.stroke(); }
      if(t>=620){ const w=Math.min(1,(t-620)/400); for(let i=0;i<6;i++){ const yy=tg.top.y+h*(0.12+i*0.15), wk=Math.min(1,Math.max(0,w*1.6-i*0.1)); if(wk<=0) continue; c.strokeStyle="rgba(150,130,100,.85)"; c.lineWidth=R*0.2; c.beginPath(); c.ellipse(tg.x,yy,R*1.02,R*0.2,0.15*(i%2?1:-1),-Math.PI,-Math.PI+Math.PI*2*wk); c.stroke(); c.strokeStyle=atRgba(BD,1); c.lineWidth=R*0.15; c.stroke(); }
        c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<5;i++){ const tw=Math.max(0,Math.sin(t/150+i*1.6)); c.fillStyle=`rgba(255,210,100,${0.8*tw})`; c.font=`bold ${Math.round(R*0.25)}px serif`; c.textAlign="center"; c.fillText(["☥","☉","△","◇","☽"][i],tg.x+(atH(i*3)-0.5)*R*1.8,tg.top.y+h*(0.2+0.6*atH(i))); } c.restore();
        for(let i=0;i<8;i++){ const ph=((t/400)+i/8)%1; c.fillStyle=`rgba(220,190,130,${0.8*(1-ph)})`; c.fillRect(tg.x+(atH(i)-0.5)*R*2,tg.foot-h*0.6+ph*h*0.6,2,2); } atImpact(t,720,0.35,0); }
      c.restore(); }},
  /* Sarimanok: it fans out its rainbow tail into a huge fan, then flings a spray of rainbow feathers that pin the target in a burst of colour */
  sg_rainbowfan:{C:760,D:1460,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; return t<480?{rot:-d*0.15*eo(t/480),sy:1+0.06*eo(t/480),pose:"cast"}:t<640?{rot:d*0.25*eo((t-480)/160),pose:"push"}:{rot:d*0.25*(1-eo((t-640)/800)),pose:t<1200?"happy":"idle"}; },
    def(t){ const a=SG.knock(t,760,1,18,560); if(a){ a.flash=Math.floor(t/60)%2?3:0; a.pose="hurt"; } return a; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), base={x:s.x-d*s.r*0.3,y:s.y}, fan=t<480?eo(t/480):t<700?1:1-eo((t-700)/400);
      if(fan>0.01){ c.save(); c.globalAlpha=Math.min(1,fan*1.3); for(let i=0;i<7;i++){ const a=-Math.PI/2+(i-3)*0.32*fan, L=s.r*(1.4+0.6*fan); c.save(); c.translate(base.x,base.y); c.rotate(a); c.fillStyle=SG.rainbow[i]; c.beginPath(); c.ellipse(L*0.55,0,L*0.55,s.r*0.17,0,0,7); c.fill();
          c.fillStyle="rgba(255,255,255,.85)"; c.beginPath(); c.arc(L*0.95,0,s.r*0.09,0,7); c.fill(); c.fillStyle="#2a2a6a"; c.beginPath(); c.arc(L*0.95,0,s.r*0.045,0,7); c.fill(); c.restore(); } c.restore(); }
      if(t>=480&&t<1000){ for(let i=0;i<14;i++){ const k=Math.min(1,Math.max(0,(t-480-i*12)/280)); if(k<=0||k>=1) continue; const p=lerpP({x:base.x,y:base.y-s.r},{x:tg.x+(atH(i)-0.5)*R*1.2,y:tg.y+(atH(i*3)-0.5)*R*1.2},eio(k),R*(0.5+atH(i*5))*(i%2?1:-1)); SG.feather(c,p.x,p.y,R*0.2,Math.atan2(tg.y-p.y,tg.x-p.x)+Math.PI/2,SG.rainbow[i%7],1); } }
      atImpact(t,760,0.65,0.3);
      if(t>=760){ const k=(t-760)/700; for(let i=0;i<14;i++){ const px=tg.x+(atH(i)-0.5)*R*1.2, py=tg.y+(atH(i*3)-0.5)*R*1.2; SG.feather(c,px,py,R*0.2,-d*0.6+Math.PI/2,SG.rainbow[i%7],k<0.7?1:1-(k-0.7)/0.3); }
        c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, rr=R*(0.8+1.4*eo(k)); atStar4(c,tg.x+Math.cos(a)*rr,tg.y+Math.sin(a)*rr*0.8,R*0.16*(1-k),SG.rainbow[i%7]); } c.restore(); } }}
});
Object.assign(AR_KIND,{"Bull Rush":"sg_bullrush","Wyrm Breath":"sg_wyrmbreath","Thunder Wing":"sg_thunderwing","Many Heads":"sg_manyheads","Sky Talon":"sg_skytalon","Holy Flame":"sg_holyflame","Flame Tail":"sg_flametail",
  "Swallow the Moon":"sg_swallowmoon","Gate Fang":"sg_gatefang","Lamp Blast":"sg_lampblast","Bridge Smash":"sg_bridgesmash","Mummy Wrap":"sg_mummywrap","Rainbow Fan":"sg_rainbowfan"});
if(typeof KSND!=="undefined") Object.assign(KSND,{
  sg_bullrush:(d,t)=>{ [0.05,0.26].forEach(x=>{ dNoise(d,t+x,0.15,0.15,'lowpass',500); dKick(d,t+x,0.3); }); sTone(d,t+0.35,'sawtooth',110,70,0.35,0.06); for(let i=0;i<6;i++) dKick(d,t+0.42+i*0.07,0.3); dKick(d,t+0.84,1); dNoise(d,t+0.84,0.5,0.3,'lowpass',600); sTone(d,t+0.9,'sine',500,1200,0.4,0.03); },   // hooves pawing, a snort, a thundering charge, the ram, the target flying
  sg_wyrmbreath:(d,t)=>{ dNoise(d,t,0.44,0.1,'bandpass',400,1); sTone(d,t,'sine',200,90,0.44,0.04); sTone(d,t+0.44,'sawtooth',90,60,0.8,0.06); dNoise(d,t+0.44,0.85,0.3,'lowpass',900); for(let i=0;i<10;i++) dNoise(d,t+0.5+i*0.07,0.07,0.12,'bandpass',1500+(i%3)*500,2); },   // a deep breath in, a roar and a long rush of flame
  sg_thunderwing:(d,t)=>{ dNoise(d,t,0.6,0.08,'lowpass',300); for(let i=0;i<4;i++) dNoise(d,t+0.2+i*0.12,0.06,0.1,'highpass',5000,2); dNoise(d,t+0.76,0.12,0.5,'highpass',2500); dNoise(d,t+0.78,1.0,0.35,'lowpass',250); dKick(d,t+0.76,1); },   // wings rustling, crackles, a blinding crack of thunder and a long rumble
  sg_manyheads:(d,t)=>{ dNoise(d,t,0.3,0.1,'highpass',4500,1.2); [0.56,0.68,0.8].forEach((x,k)=>{ sTone(d,t+x-0.25,'sawtooth',200+k*40,320+k*40,0.2,0.025); sTone(d,t+x,'square',1000-k*100,300,0.05,0.05); dNoise(d,t+x,0.08,0.2,'bandpass',2600,2); }); },   // hissing, three necks lunging, three bites
  sg_skytalon:(d,t)=>{ sTone(d,t,'sine',400,900,0.62,0.04); for(let i=0;i<4;i++) dNoise(d,t+i*0.15,0.08,0.12,'lowpass',1000); sTone(d,t+0.6,'sawtooth',2200,800,0.3,0.035); dNoise(d,t+0.62,0.28,0.2,'bandpass',2000,1); dKick(d,t+0.9,0.8); [0.9,0.94,0.98].forEach(x=>dNoise(d,t+x,0.08,0.2,'highpass',3000,2)); },   // a looping climb, the scream of the dive, a raking strike
  sg_holyflame:(d,t)=>{ sTone(d,t,'sine',300,600,0.36,0.04); dKick(d,t+0.5,0.6); [523,659,784,1047].forEach((f,k)=>sTone(d,t+0.55+k*0.05,'triangle',f,f,0.9,0.03)); dNoise(d,t+0.55,0.6,0.12,'bandpass',1500,1); dNoise(d,t+0.8,0.6,0.2,'bandpass',1000,0.7); sTone(d,t+0.8,'sine',1568,1568,0.7,0.025); },   // a stamp, a choir of fire rising, the pillar roaring
  sg_flametail:(d,t)=>{ dNoise(d,t+0.3,0.4,0.15,'bandpass',800,1); sTone(d,t+0.3,'sawtooth',200,600,0.4,0.03); dNoise(d,t+0.68,0.2,0.25,'bandpass',1500,1); dKick(d,t+0.68,0.6); for(let i=0;i<6;i++) dNoise(d,t+0.72+i*0.06,0.06,0.1,'bandpass',1800,2); },   // a spinning whoosh of fire, the lash, crackling
  sg_swallowmoon:(d,t)=>{ sTone(d,t,'sine',80,60,0.8,0.08); [1319,1568,1976].forEach((f,k)=>sTone(d,t+0.2+k*0.05,'sine',f,f,0.6,0.015)); dNoise(d,t+0.45,0.35,0.2,'lowpass',300); sTone(d,t+0.8,'square',500,150,0.08,0.06); dKick(d,t+0.8,0.9); sTone(d,t+0.82,'sawtooth',70,45,0.6,0.08); },   // darkness, the moon chiming, the jaws rising, a huge snapping gulp
  sg_gatefang:(d,t)=>{ sTone(d,t,'sawtooth',70,140,0.4,0.05); dNoise(d,t,0.4,0.1,'lowpass',400); [0.76,0.87,0.98].forEach((x,k)=>{ sTone(d,t+x-0.15,'sawtooth',180-k*20,110-k*20,0.15,0.05); sTone(d,t+x,'square',800,250,0.05,0.06); dNoise(d,t+x,0.1,0.2,'bandpass',2200,2); }); },   // the gate groaning open, three snarling bites
  sg_lampblast:(d,t)=>{ for(let i=0;i<6;i++) sTone(d,t+i*0.06,'square',700+i*60,700+i*60,0.03,0.02); [1568,2093,2637,3136].forEach((f,k)=>sTone(d,t+0.05+k*0.07,'sine',f,f,0.35,0.03)); sTone(d,t+0.38,'sawtooth',80,240,0.5,0.06); dNoise(d,t+0.38,0.5,0.25,'lowpass',500); dNoise(d,t+0.5,0.4,0.1,'bandpass',1500,0.7); sTone(d,t+0.76,'sine',900,200,0.14,0.05); dKick(d,t+0.9,1); dNoise(d,t+0.9,0.8,0.35,'lowpass',400); sTone(d,t+0.9,'sawtooth',60,40,0.6,0.08); [1047,1319,1568].forEach((f,k)=>sTone(d,t+0.95+k*0.04,'triangle',f,f,0.5,0.03)); },   // the lamp rattling and chiming, smoke roaring out, the fist dropping, a booming slam with a magic ring
  sg_bridgesmash:(d,t)=>{ for(let i=0;i<4;i++) sTone(d,t+0.05+i*0.09,'sawtooth',90+i*15,70+i*15,0.08,0.04); sTone(d,t+0.2,'sawtooth',80,60,0.4,0.05); dNoise(d,t+0.52,0.36,0.15,'lowpass',500); dKick(d,t+0.88,1); dNoise(d,t+0.88,0.5,0.3,'lowpass',500); for(let i=0;i<8;i++) dNoise(d,t+0.9+i*0.04,0.05,0.12,'bandpass',1100+(i%3)*300,2); },   // wood creaking free, a grunt, a whooshing swing, a crash of splintering planks
  sg_mummywrap:(d,t)=>{ dNoise(d,t,0.38,0.06,'highpass',3000,0.6); for(let i=0;i<3;i++) sTone(d,t+0.3+i*0.06,'sawtooth',1500,400,0.15,0.03); for(let i=0;i<6;i++) dNoise(d,t+0.62+i*0.07,0.08,0.08,'bandpass',1200,2); sTone(d,t+0.72,'sine',220,220,0.6,0.03); sTone(d,t+0.72,'sine',233,233,0.6,0.02); },   // dry sand, bandages lashing out, winding tight, an old drone
  sg_rainbowfan:(d,t)=>{ for(let i=0;i<7;i++) sTone(d,t+i*0.06,'triangle',800+i*150,900+i*150,0.08,0.02); dNoise(d,t+0.48,0.25,0.15,'bandpass',1200,1); for(let i=0;i<10;i++) dNoise(d,t+0.55+i*0.022,0.04,0.08,'highpass',4000,2); [1047,1319,1568,2093].forEach((f,k)=>sTone(d,t+0.76+k*0.02,'triangle',f,f,0.4,0.03)); }   // the fan opening in a rising run, a flurry of feathers, a bright chord
});
if(typeof SWING!=="undefined") ["sg_bullrush","sg_skytalon","sg_flametail","sg_gatefang","sg_bridgesmash"].forEach(k=>SWING.add(k));

/* an error inside one of these effects is logged once instead of silently cutting the animation */
for(const [k,v] of Object.entries(ANIM)) if(k.startsWith("sg_")&&v.fx&&!v._w){ const f=v.fx; v.fx=function(c,t,x){ c.save(); try{ f.call(this,c,t,x); }catch(err){ if(!SG.err) console.error(SG.err=k+": "+err.message); } c.restore(); }; v._w=1; }
