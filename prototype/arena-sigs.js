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

Object.assign(ANIM,{
  /* Chomp: it springs at the target and a pair of jaws ten times its size closes over it, grinds twice and lets go */
  sg_crunch:{C:780,D:1460,contact:true,marks:true,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1;
      if(t<300){ const k=eo(t/300); return {f:-0.08*k,sx:1+0.16*k,sy:1-0.22*k,pose:"crouch"}; }
      if(t<780){ const k=(t-300)/480; return {f:-0.08+0.7*eio(k),arc:-50*Math.sin(k*Math.PI),sx:1-0.1*Math.sin(k*Math.PI),sy:1+0.14*Math.sin(k*Math.PI),rot:d*0.25*k,pose:"tackle"}; }
      const k=(t-780)/680; return {f:0.62*(1-eio(k)),sx:1+0.14*Math.sin(k*9)*(1-k),sy:1-0.14*Math.sin(k*9)*(1-k),rot:d*0.25*(1-eio(k)),pose:k<0.5?"punch":"happy"}; },
    def(t){ if(t<780||t>1350) return null; const g=t<1080?1:1-(t-1080)/270, gr=Math.floor((t-780)/120)%2; return {sx:1+0.12*g,sy:1-0.24*g-(gr?0.05:0),off:[Math.sin(t/12)*3*g,0],pose:"hurt"}; },
    fx(c,t,x){ const tg=x.target, R=tg.r, cy=tg.y-R*0.05, col=(x.col||[240,200,90]).map(v=>Math.min(255,v*0.55+110));
      if(t>260&&t<1400){ const open=t<780?eo((t-260)/420):t<1100?Math.abs(Math.sin((t-780)/120*Math.PI/2))*0.12:0.12+eo((t-1100)/200)*0.8, fade=t<1200?1:1-(t-1200)/200;
        SG.jaws(c,tg.x,cy,R*1.4,open,col,Math.max(0,Math.min(1,(t-260)/150))*fade); }
      atImpact(t,780,0.8,0.35); atImpact(t,900,0.35,0); atImpact(t,1020,0.35,0);
      if(t>=780&&t<1400){ const k=(t-780)/620;
        for(let i=0;i<12;i++){ const a=-Math.PI*(0.1+0.8*atH(i*5)), sp=R*(0.6+1.6*k)*(0.7+0.5*atH(i)); SG.shard(c,tg.x+Math.cos(a)*sp*(i%2?1:-1),cy+Math.sin(a)*sp+k*k*R*1.6,R*0.09*(1-k*0.4),t/80+i,i%3?"#fff6e0":atRgba(col,1)); }
        atPow(c,{x:tg.x,y:cy-R*0.9},Math.min(1,(t-780)/420),R/24); } }},
  /* Squib: it puffs up to twice its size and blasts a thick jet of ink that splatters the target and drips off it */
  sg_inkjet:{C:700,D:1380,sig:true,
    atk:(t,o)=>{ const d=(o&&o.dir)||1; if(t<380){ const k=eo(t/380); return {sx:1+0.22*k,sy:1+0.16*k,rot:-d*0.15*k,pose:"cast"}; }
      if(t<1150) return {sx:1.12-0.04*Math.sin(t/30),sy:0.96,off:[-d*5,0],rot:-d*0.05,pose:"push"}; const k=(t-1150)/230; return {sx:1.12-0.12*k,sy:0.96+0.04*k,pose:"idle"}; },
    def(t){ if(t<700||t>1350) return null; const a=1-eo((t-700)/650); return {off:[18*a*(Math.sin(t/40)>0?1:0.8),0],pose:"hurt",sx:1+0.08*a,sy:1-0.08*a}; },
    fx(c,t,x){ const s=x.self, tg=x.target, R=tg.r, d=atDir(x), INK=[46,34,74], HI=[150,120,220], src={x:s.x+d*s.r*0.85,y:s.y+s.r*0.1}, dst={x:tg.x-d*R*0.2,y:tg.y-R*0.1};
      if(t<380){ for(let i=0;i<5;i++){ const ph=((t/300)+i/5)%1; SG.puff(c,src.x+d*ph*R*0.3,src.y-ph*R*0.4,R*0.06*(1+ph),1-ph,INK); } return; }
      const head=Math.min(1,(t-380)/320), tail=t<1150?0:Math.min(1,(t-1150)/220);
      if(tail<1){ const N=26, pts=[]; for(let j=Math.floor(tail*N);j<=Math.floor(head*N);j++){ const q=j/N, p=lerpP(src,dst,q,R*0.35); p.w=R*(0.38-0.16*q)*(1+0.12*Math.sin(q*14-t/30)); p.y+=Math.sin(q*9-t/45)*R*0.06; pts.push(p); }
        if(pts.length>1){ c.lineCap="round"; c.lineJoin="round"; const line=(w,st)=>{ c.strokeStyle=st; for(let j=1;j<pts.length;j++){ c.lineWidth=pts[j].w*w; c.beginPath(); c.moveTo(pts[j-1].x,pts[j-1].y); c.lineTo(pts[j].x,pts[j].y); c.stroke(); } };
          line(1.15,"rgba(20,12,36,.85)"); line(1,atRgba(INK,1)); line(0.3,atRgba(HI,0.7)); line(0.08,"rgba(255,255,255,.6)"); } }
      if(t>=700){ const k=Math.min(1,(t-700)/600); atImpact(t,700,0.55,0);
        for(let i=0;i<14;i++){ const a=(i/14)*Math.PI*2, sp=R*(0.5+1.5*eo(k))*(0.6+0.6*atH(i)); c.fillStyle=atRgba(INK,1-k*0.7); c.beginPath(); c.ellipse(dst.x+Math.cos(a)*sp,dst.y+Math.sin(a)*sp*0.8+k*k*R,R*0.12*(1-k*0.5),R*0.08,a,0,7); c.fill(); }
        const stain=t<1250?1:1-(t-1250)/150; c.globalAlpha=Math.max(0,stain); for(let i=0;i<6;i++){ const bx=tg.x+(atH(i*3)-0.5)*R*1.4, by=tg.y+(atH(i*7)-0.5)*R*1.1, br=R*(0.14+0.12*atH(i)); c.fillStyle=atRgba(INK,0.9); c.beginPath(); c.arc(bx,by,br*Math.min(1,k*4),0,7); c.fill();
          const dr=Math.min(1,k*1.5)*R*0.4*atH(i*11); c.fillRect(bx-br*0.25,by,br*0.5,dr); c.beginPath(); c.arc(bx,by+dr,br*0.28,0,7); c.fill(); c.fillStyle="rgba(200,180,255,.5)"; c.beginPath(); c.arc(bx-br*0.3,by-br*0.3,br*0.25,0,7); c.fill(); } c.globalAlpha=1;
        c.fillStyle=atRgba(INK,0.6*(1-k)); c.beginPath(); c.ellipse(tg.x,tg.foot,R*(0.8+0.6*k),R*0.2,0,0,7); c.fill(); } }},
  /* Antik: its screen floods with static, it beams the picture onto the target, the target is trapped in a TV of static and colour bars, then the set switches off */
  sg_static:{C:760,D:1460,sig:true,
    atk:t=>({pose:t<760?"cast":t<1300?"push":"idle",off:[t<760?(atH(Math.floor(t/40))-0.5)*5:0,0],flash:t<760&&Math.floor(t/60)%3===0?2:0,sx:1+0.04*Math.sin(t/25)}),
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
      if(t<520){ const k=eo(t/520); return {f:0.25*k,rot:-d*0.42*k,arc:-16*k,sy:1+0.08*k,pose:"effort"}; }
      if(t<880){ const k=ei((t-520)/360); return {f:0.25+0.37*k,rot:-d*0.42+d*0.9*k,arc:-16*(1-k),sy:1.08-0.2*k,sx:1+0.1*k,pose:"punch"}; }
      const k=(t-880)/680; return {f:0.62*(1-eio(k)),rot:d*0.48*(1-eo(k)),sy:0.88+0.12*eo(k),sx:1.1-0.1*eo(k),pose:k<0.5?"land":"idle"}; },
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
        SG.glove(c,p.x-d*R*0.2*(1-k),p.y,R*0.42*big,d,gc,1-ei(k)); c.save(); c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=3; for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, r0=R*0.5*big*(1+k), r1=r0+R*0.35*big*(1-k); c.beginPath(); c.moveTo(p.x+Math.cos(a)*r0,p.y+Math.sin(a)*r0); c.lineTo(p.x+Math.cos(a)*r1,p.y+Math.sin(a)*r1); c.stroke(); } c.restore();
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
  sg_inkjet:(d,t)=>{ sTone(d,t,'sine',180,90,0.38,0.06); dNoise(d,t+0.38,0.8,0.22,'lowpass',500); dNoise(d,t+0.4,0.7,0.08,'bandpass',1200,1.5); dKick(d,t+0.7,0.4); dNoise(d,t+0.7,0.25,0.25,'lowpass',900); [0.82,0.95,1.1].forEach(x=>sTone(d,t+x,'sine',600,200,0.08,0.03)); },   // puffing up, a gushing jet, the splat and drips
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
/* an error inside one of these effects is logged once instead of silently cutting the animation */
for(const [k,v] of Object.entries(ANIM)) if(k.startsWith("sg_")&&v.fx&&!v._w){ const f=v.fx; v.fx=function(c,t,x){ c.save(); try{ f.call(this,c,t,x); }catch(err){ if(!SG.err) console.error(SG.err=k+": "+err.message); } c.restore(); }; v._w=1; }
