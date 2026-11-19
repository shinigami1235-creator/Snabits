/* Each family's own version of the shared shot, cloud and sound moves (Gid, 18 Nov 2026).
   bolt, steam and trumpet used to draw the same thing for every family. Now each family has a spot on its own body the move
   comes out of (OWN_AT, given as [u, v] in the body's box: u runs from its back (0) to the side facing the foe (1), v from the
   top of the body (0) to its feet (1), so the spot stays on the part at Bit, Byte and Mega), and its own look for what comes out.
   A family that isn't listed keeps the old shared look. Needs arena-fx.js, arena-sigs.js (SG) and arena-moves.js. */
const OWN={};
/* a spot on the body in arena pixels */
OWN.pt=(s,tg,uv)=>{ const b=s&&s.box; if(!b||!b[0]||!b[1]) return s&&(s.mouth||s.top)||{x:0,y:0};
  const l=Math.min(b[0].x,b[1].x), r=Math.max(b[0].x,b[1].x), top=Math.min(b[0].y,b[1].y), bot=Math.max(b[0].y,b[1].y), fwd=tg.x>=s.x;
  const back=fwd?l:r, front=fwd?r:l; return {x:back+(front-back)*uv[0],y:top+(bot-top)*uv[1]}; };
OWN.size=x=>Math.max(7,(x.self.r||30)*0.38)*atBig(x);
OWN.rgb=(c,a)=>atRgba(c,a==null?1:a);
OWN.mix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k));

/* ---------- shapes ---------- */
OWN.flame=(c,x,y,s,ang,outer,inner,t)=>{ c.save(); c.translate(x,y); c.rotate(ang); const w=Math.sin((t||0)/40)*0.12;
  for(const [k,col] of [[1,outer],[0.6,inner]]){ c.fillStyle=col; c.beginPath(); c.moveTo(s*k,0); c.bezierCurveTo(s*k,s*0.7*k,-s*0.6*k,s*0.55*k,-s*(1.9+w)*k,0); c.bezierCurveTo(-s*0.6*k,-s*0.55*k,s*k,-s*0.7*k,s*k,0); c.fill(); }
  c.restore(); };
OWN.blob=(c,x,y,s,ang,col,sq,hi=true)=>{ c.save(); c.translate(x,y); c.rotate(ang); c.fillStyle=OWN.rgb(col,1); c.beginPath(); c.ellipse(0,0,s*(1+sq),s*(1-sq*0.5),0,0,7); c.fill();
  if(hi){ c.fillStyle="rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(s*0.25,-s*0.35,s*0.32,s*0.2,-0.4,0,7); c.fill(); } c.restore(); };
OWN.drop=(c,x,y,s,ang,col)=>{ c.save(); c.translate(x,y); c.rotate(ang); c.fillStyle=OWN.rgb(col,0.95); c.beginPath(); c.moveTo(s*1.1,0); c.quadraticCurveTo(s*0.2,-s*0.95,-s*0.9,0); c.quadraticCurveTo(s*0.2,s*0.95,s*1.1,0); c.fill();
  c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-s*0.1,-s*0.3,s*0.28,s*0.14,0,0,7); c.fill(); c.restore(); };
OWN.bubble=(c,x,y,s,col,sheen)=>{ c.save(); c.fillStyle=OWN.rgb(col,0.38); c.beginPath(); c.arc(x,y,s,0,7); c.fill();
  if(sheen){ const g=c.createLinearGradient(x-s,y-s,x+s,y+s); g.addColorStop(0,"rgba(255,140,220,.8)"); g.addColorStop(0.5,"rgba(140,230,255,.8)"); g.addColorStop(1,"rgba(255,240,140,.8)"); c.strokeStyle=g; }
  else c.strokeStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.5),0.9);
  c.lineWidth=Math.max(1.2,s*0.14); c.beginPath(); c.arc(x,y,s,0,7); c.stroke(); c.fillStyle="rgba(255,255,255,.85)"; c.beginPath(); c.ellipse(x-s*0.35,y-s*0.4,s*0.25,s*0.15,-0.6,0,7); c.fill(); c.restore(); };
OWN.zig=(c,x0,y0,x1,y1,n,amp,seed,col,w)=>{ c.strokeStyle=col; c.lineWidth=w; c.lineCap="round"; c.lineJoin="round"; c.beginPath(); c.moveTo(x0,y0);
  for(let i=1;i<n;i++){ const k=i/n, j=(atH(seed+i)-0.5)*2*amp; c.lineTo(x0+(x1-x0)*k-(y1-y0)/Math.hypot(x1-x0,y1-y0||1)*j,y0+(y1-y0)*k+(x1-x0)/Math.hypot(x1-x0,y1-y0||1)*j); } c.lineTo(x1,y1); c.stroke(); };
OWN.star=(c,x,y,r,col,rot=0)=>{ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=col; c.beginPath(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, rr=i%2?r*0.3:r; c[i?"lineTo":"moveTo"](Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); c.restore(); };

/* what one shot looks like at point p, heading ang, scale s */
OWN.shot=(c,o,p,ang,s,t,a=1)=>{ c.save(); c.globalAlpha*=a; const C=o.col, C2=o.col2||OWN.mix(o.col,[255,255,255],0.6);
  switch(o.shot){
    case "wisp": case "foxfire": atGlowA(c,p.x,p.y,s*2.6,C,0.55); OWN.flame(c,p.x,p.y,s*1.1,ang,OWN.rgb(C,0.9),OWN.rgb(C2,0.95),t);
      if(o.shot==="wisp"){ c.fillStyle="#2a1630"; c.beginPath(); c.arc(p.x+Math.cos(ang)*s*0.1-Math.sin(ang)*s*0.25,p.y+Math.sin(ang)*s*0.1-s*0.15,s*0.13,0,7); c.arc(p.x+Math.cos(ang)*s*0.1+Math.sin(ang)*s*0.25,p.y+Math.sin(ang)*s*0.1+s*0.05,s*0.13,0,7); c.fill(); } break;
    case "ember": case "candle": atGlowA(c,p.x,p.y,s*2.2,[255,170,60],0.6); OWN.flame(c,p.x,p.y,s*(o.shot==="candle"?0.8:1),ang,OWN.rgb(C,0.95),"rgba(255,240,170,.95)",t); break;
    case "cinder": atGlowA(c,p.x,p.y,s*2,[255,120,40],0.6); OWN.flame(c,p.x-Math.cos(ang)*s*0.6,p.y-Math.sin(ang)*s*0.6,s*0.9,ang,"rgba(255,110,40,.85)","rgba(255,210,90,.9)",t);
      c.fillStyle="#3a2824"; c.beginPath(); for(let i=0;i<6;i++){ const aa=i/6*7+t/90, rr=s*(0.65+0.2*atH(i)); c[i?"lineTo":"moveTo"](p.x+Math.cos(aa)*rr,p.y+Math.sin(aa)*rr); } c.fill();
      c.strokeStyle="rgba(255,150,60,.95)"; c.lineWidth=1.4; c.beginPath(); c.moveTo(p.x-s*0.3,p.y-s*0.1); c.lineTo(p.x+s*0.1,p.y+s*0.2); c.lineTo(p.x+s*0.3,p.y-s*0.2); c.stroke(); break;
    case "bubble": OWN.bubble(c,p.x,p.y,s*1.1,C,false); break;
    case "soap": OWN.bubble(c,p.x,p.y,s*1.25,C,true); break;
    case "spores": for(let i=0;i<7;i++){ const aa=i*0.9+t/150, rr=s*(0.3+0.7*atH(i)); SG.puff(c,p.x+Math.cos(aa)*rr,p.y+Math.sin(aa)*rr,s*(0.35+0.25*atH(i*3)),0.8,i%2?C:C2); } break;
    case "pollen": SG.puff(c,p.x,p.y,s*1.2,0.85,C); for(let i=0;i<6;i++){ const aa=i+t/120; c.fillStyle=OWN.rgb(C2,0.95); c.beginPath(); c.arc(p.x+Math.cos(aa)*s*0.9,p.y+Math.sin(aa)*s*0.9,s*0.16,0,7); c.fill(); } break;
    case "glob": case "mud": case "wax": case "slime": case "acid": case "lava": case "gum": case "ink": {
      const sq=o.shot==="gum"?0:0.25, glow=o.shot==="lava"||o.shot==="acid";
      if(glow) atGlowA(c,p.x,p.y,s*2.2,C,0.45);
      OWN.blob(c,p.x,p.y,s*(o.shot==="gum"?1:1.05),ang,C,sq,o.shot!=="mud");
      if(o.shot==="mud"){ c.fillStyle=OWN.rgb(OWN.mix(C,[0,0,0],0.3),1); for(let i=0;i<3;i++){ c.beginPath(); c.arc(p.x+(atH(i)-0.5)*s,p.y+(atH(i+4)-0.5)*s,s*0.18,0,7); c.fill(); } }
      if(o.shot==="gum"){ c.strokeStyle="rgba(255,255,255,.6)"; c.lineWidth=1; c.beginPath(); c.arc(p.x,p.y,s*0.65,-2.4,-1.2); c.stroke(); }
      break; }
    case "drop": OWN.drop(c,p.x,p.y,s*1.05,ang,C); break;
    case "dart": case "sting": { c.save(); c.translate(p.x,p.y); c.rotate(ang); if(o.shot==="dart"){ atGlowA(c,0,0,s*2,C,0.6); c.fillStyle=OWN.rgb(C2,1); c.beginPath(); c.moveTo(s*1.8,0); c.lineTo(-s*1.4,-s*0.22); c.lineTo(-s*1.4,s*0.22); c.closePath(); c.fill(); }
      else { c.fillStyle=OWN.rgb(C,1); c.beginPath(); c.moveTo(s*1.6,0); c.lineTo(-s*0.9,-s*0.35); c.lineTo(-s*0.6,0); c.lineTo(-s*0.9,s*0.35); c.closePath(); c.fill(); atGlowA(c,s*1.4,0,s*0.9,C2,0.9); } c.restore(); break; }
    case "spark": case "zap": { const cols=o.shot==="zap"?["rgba(255,90,90,.95)","rgba(90,150,255,.95)"]:["rgba(255,240,140,.95)","rgba(255,255,255,1)"]; atGlowA(c,p.x,p.y,s*2,C,0.55);
      c.fillStyle=OWN.rgb(C2,1); c.beginPath(); c.arc(p.x,p.y,s*0.5,0,7); c.fill();
      for(let i=0;i<4;i++){ const aa=i/4*7+Math.floor(t/45); OWN.zig(c,p.x,p.y,p.x+Math.cos(aa)*s*1.6,p.y+Math.sin(aa)*s*1.6,3,s*0.35,i+Math.floor(t/45)*7,cols[i%2],1.4); } break; }
    case "snow": c.fillStyle="#f6fbff"; c.beginPath(); c.arc(p.x,p.y,s*1.05,0,7); c.fill(); c.fillStyle="rgba(170,205,235,.8)"; c.beginPath(); c.arc(p.x+s*0.3,p.y+s*0.3,s*0.6,0,7); c.fill();
      c.fillStyle="#ffffff"; c.beginPath(); c.arc(p.x-s*0.25,p.y-s*0.3,s*0.4,0,7); c.fill(); break;
    case "lint": for(let i=0;i<9;i++){ const aa=i/9*7; c.strokeStyle=OWN.rgb(i%2?C:C2,0.95); c.lineWidth=1.6; c.beginPath(); c.arc(p.x+Math.cos(aa)*s*0.4,p.y+Math.sin(aa)*s*0.4,s*0.55,aa+t/200,aa+2+t/200); c.stroke(); } break;
    case "shadow": atGlowA(c,p.x,p.y,s*2.4,[150,70,200],0.6); c.fillStyle="#1c1024"; c.beginPath(); c.arc(p.x,p.y,s*0.95,0,7); c.fill();
      c.strokeStyle="rgba(200,120,255,.9)"; c.lineWidth=1.5; c.beginPath(); c.arc(p.x,p.y,s*0.95,0,7); c.stroke();
      for(const sd of [-1,1]){ c.fillStyle="#1c1024"; c.beginPath(); const wx=p.x+sd*s*0.9, wy=p.y-s*0.3+Math.sin(t/40)*s*0.2; c.moveTo(p.x+sd*s*0.5,p.y-s*0.2); c.quadraticCurveTo(wx+sd*s*0.4,wy-s*0.8,wx+sd*s*0.9,wy); c.quadraticCurveTo(wx+sd*s*0.3,wy-s*0.1,wx,wy+s*0.3); c.quadraticCurveTo(p.x+sd*s*0.6,p.y,p.x+sd*s*0.5,p.y-s*0.2); c.fill(); } break;
    case "feather": { c.save(); c.translate(p.x,p.y); c.rotate(ang+Math.sin(t/60)*0.3); c.fillStyle=OWN.rgb(C,1); c.beginPath(); c.moveTo(s*1.5,0); c.quadraticCurveTo(0,-s*0.7,-s*1.3,0); c.quadraticCurveTo(0,s*0.7,s*1.5,0); c.fill();
      c.strokeStyle=OWN.rgb(OWN.mix(C,[0,0,0],0.4),1); c.lineWidth=1; c.beginPath(); c.moveTo(-s*1.6,0); c.lineTo(s*1.4,0); c.stroke(); c.restore();
      if(Math.floor(t/50)%2) OWN.zig(c,p.x-s,p.y-s*0.6,p.x+s,p.y+s*0.6,3,s*0.3,Math.floor(t/50),"rgba(255,240,120,.95)",1.4); break; }
    case "star": atGlowA(c,p.x,p.y,s*2.2,C,0.6); OWN.star(c,p.x,p.y,s*1.3,OWN.rgb(C2,1),t/150); OWN.star(c,p.x,p.y,s*0.6,"#fff",-t/150); break;
    default: OWN.blob(c,p.x,p.y,s,ang,C,0.2); }
  c.restore(); };

/* what the shot does when it lands */
OWN.hit=(c,o,tg,k,S,t)=>{ if(k<0||k>1) return; const C=o.col, C2=o.col2||OWN.mix(C,[255,255,255],0.6), R=tg.r||30, a=1-k;
  switch(o.hit){
    case "splat": for(let i=0;i<9;i++){ const aa=(i/9-0.5)*2.6+Math.PI*(o.dirSign<0?0:1)+(atH(i)-0.5)*0.4, d=R*(0.3+0.9*eo(k))*(0.6+0.4*atH(i*3));
        c.fillStyle=OWN.rgb(C,a); c.beginPath(); c.arc(tg.x+Math.cos(aa)*d,tg.y+Math.sin(aa)*d*0.8+k*k*R*0.3,S*(0.45-0.25*k),0,7); c.fill(); }
      c.fillStyle=OWN.rgb(C,0.7*a); c.beginPath(); c.ellipse(tg.x,tg.y,S*1.6*(1+k),S*1.1*(1+k*0.6),0,0,7); c.fill(); break;
    case "pop": c.strokeStyle=OWN.rgb(C2,a); c.lineWidth=2; c.beginPath(); c.arc(tg.x,tg.y,S*(1.2+3*eo(k)),0,7); c.stroke();
      for(let i=0;i<8;i++){ const aa=i/8*7; c.fillStyle=OWN.rgb(C2,a); c.beginPath(); c.arc(tg.x+Math.cos(aa)*S*(1.5+3*k),tg.y+Math.sin(aa)*S*(1.5+3*k),S*0.18,0,7); c.fill(); } break;
    case "burst": atGlowA(c,tg.x,tg.y,R*(0.6+0.6*k),C,0.7*a); c.strokeStyle=OWN.rgb(C2,a); c.lineWidth=2.4*(1-k)+0.6;
      for(let i=0;i<8;i++){ const aa=i/8*7+0.3, r0=R*0.2+k*R*0.4, r1=r0+R*0.45*(1-k*0.5); c.beginPath(); c.moveTo(tg.x+Math.cos(aa)*r0,tg.y+Math.sin(aa)*r0); c.lineTo(tg.x+Math.cos(aa)*r1,tg.y+Math.sin(aa)*r1); c.stroke(); } break;
    case "puff": for(let i=0;i<7;i++){ const aa=i/7*7, d=R*(0.2+0.7*eo(k)); SG.puff(c,tg.x+Math.cos(aa)*d,tg.y+Math.sin(aa)*d*0.7-k*R*0.3,R*(0.18+0.2*k),a*0.85,i%2?C:C2); } break;
    case "shatter": for(let i=0;i<8;i++){ const aa=(i/8)*7, d=R*(0.2+1.0*eo(k)); c.fillStyle=i%2?"rgba(255,255,255,"+a+")":"rgba(200,225,245,"+a+")"; c.beginPath(); c.arc(tg.x+Math.cos(aa)*d,tg.y+Math.sin(aa)*d*0.7+k*k*R*0.6,S*(0.35-0.15*k),0,7); c.fill(); }
      SG.puff(c,tg.x,tg.y,R*0.5*(1+k),a*0.6,[240,248,255]); break;
    case "zap": for(let i=0;i<5;i++){ const aa=i/5*7+t/60; OWN.zig(c,tg.x,tg.y,tg.x+Math.cos(aa)*R*0.9,tg.y+Math.sin(aa)*R*0.9,4,R*0.15,i*11+Math.floor(t/40),OWN.rgb(C2,a),1.8); } atGlowA(c,tg.x,tg.y,R*0.8,C,0.5*a); break;
    case "flame": for(let i=0;i<6;i++){ const xx=tg.x+(i-2.5)*R*0.28, hh=R*(0.5+0.4*atH(i))*(1-k*0.6); OWN.fire(c,xx,tg.y+R*0.3,hh,OWN.rgb(C,0.85*a),OWN.rgb(C2,0.9*a),t+i*90); } break;
    case "star": for(let i=0;i<6;i++){ const aa=i/6*7+k, d=R*(0.3+0.8*eo(k)); OWN.star(c,tg.x+Math.cos(aa)*d,tg.y+Math.sin(aa)*d,S*(0.9-0.5*k),OWN.rgb(i%2?C:C2,a),k*3); } atGlowA(c,tg.x,tg.y,R*0.7,C,0.5*a); break;
    case "shadow": for(let i=0;i<8;i++){ const aa=i/8*7, d=R*(0.2+0.8*eo(k)); SG.puff(c,tg.x+Math.cos(aa)*d,tg.y+Math.sin(aa)*d*0.7,R*(0.2+0.15*k),a*0.8,[40,20,60]); } atGlowA(c,tg.x,tg.y,R*0.6,[170,90,230],0.5*a); break; }
};

/* the way a shot travels from a to b at k (0..1) */
OWN.path=(o,a,b,k,S,t)=>{ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L; let x=a.x+dx*k, y=a.y+dy*k;
  switch(o.path){
    case "arc": y-=L*0.28*Math.sin(Math.PI*k); break;
    case "high": y-=L*0.55*Math.sin(Math.PI*k); break;
    case "wave": x+=nx*Math.sin(k*Math.PI*3)*S*1.4; y+=ny*Math.sin(k*Math.PI*3)*S*1.4; break;
    case "float": { const kk=Math.pow(k,1.25); x=a.x+dx*kk; y=a.y+dy*kk-L*0.12*Math.sin(Math.PI*kk)+Math.sin(t/90)*S*0.3; break; }
    case "zig": { const j=(atH(Math.floor(k*6)+3)-0.5)*S*1.8*Math.sin(Math.PI*k); x+=nx*j; y+=ny*j; break; }
    case "over": y-=L*0.42*Math.sin(Math.PI*k); x+=Math.sin(Math.PI*k)*S*0.5; break; }
  return {x,y}; };

/* ---------- bolt: one shot from its own part ---------- */
const OWN_BOLT={
  Booly:{at:[0.02,0.02],shot:"wisp",col:[110,180,255],col2:[220,245,255],path:"wave",hit:"burst"},
  Fizz:{at:[0.5,-0.22],shot:"bubble",col:[255,170,230],path:"float",hit:"pop"},
  Lern:{at:[0.6,0.5],shot:"ember",col:[255,140,50],path:"arc",hit:"flame",col2:[255,220,120]},
  Puff:{at:[0.75,0.15],shot:"spores",col:[200,160,240],col2:[245,220,255],path:"float",hit:"puff"},
  Glop:{at:[0.85,0.25],shot:"glob",col:[110,215,215],path:"arc",hit:"splat"},
  Burr:{at:[1.05,0.6],shot:"mud",col:[120,82,52],path:"arc",hit:"splat"},
  Wick:{at:[0.5,-0.18],shot:"wax",col:[250,240,225],path:"arc",hit:"splat"},
  Lumo:{at:[0.55,1.25],shot:"dart",col:[230,255,120],col2:[255,255,220],path:"line",hit:"burst"},
  Inky:{at:[1.0,0.45],shot:"ink",col:[40,40,70],path:"arc",hit:"splat"},
  Nimbo:{at:[0.75,0.95],shot:"drop",col:[120,180,255],path:"arc",hit:"splat"},
  Trundle:{at:[1.0,0.6],shot:"slime",col:[170,225,120],path:"arc",hit:"splat"},
  Clank:{at:[0.55,-0.25],shot:"spark",col:[255,230,90],col2:[255,255,230],path:"zig",hit:"zap"},
  Swirl:{at:[0.5,0.0],shot:"snow",col:[240,248,255],path:"arc",hit:"shatter"},
  Magna:{at:[1.0,0.95],shot:"zap",col:[255,120,120],col2:[255,255,255],path:"zig",hit:"zap"},
  Helm:{at:[1.0,0.45],shot:"bubble",col:[150,210,255],path:"line",hit:"pop"},
  Bloop:{at:[0.7,1.05],shot:"sting",col:[90,120,200],col2:[200,240,255],path:"line",hit:"zap"},
  Sox:{at:[0.55,0.02],shot:"lint",col:[230,140,200],col2:[245,235,240],path:"arc",hit:"puff"},
  Suds:{at:[0.55,-0.1],shot:"soap",col:[220,240,255],path:"float",hit:"pop"},
  Gumball:{at:[0.85,0.85],shot:"gum",col:[255,90,140],path:"arc",hit:"pop",col2:[255,200,220]},
  Lava:{at:[0.5,-0.12],shot:"lava",col:[255,110,40],path:"high",hit:"splat"},
  Vampire:{at:[1.05,0.45],shot:"shadow",col:[120,60,170],path:"wave",hit:"shadow"},
  Kitsune:{at:[0.05,0.1],shot:"foxfire",col:[90,230,200],col2:[220,255,245],path:"over",hit:"burst"},
  Naga:{at:[0.95,0.4],shot:"acid",col:[150,230,70],path:"arc",hit:"splat"},
  Yeti:{at:[1.08,0.55],shot:"snow",col:[240,248,255],path:"arc",hit:"shatter"},
  Jack:{at:[0.9,0.6],shot:"candle",col:[255,170,50],col2:[255,240,170],path:"line",hit:"flame"},
  Diwata:{at:[1.05,0.5],shot:"pollen",col:[255,230,120],col2:[255,250,210],path:"float",hit:"puff"},
  Thunderbird:{at:[1.1,0.35],shot:"feather",col:[255,170,60],path:"line",hit:"zap",col2:[255,245,150]},
  Kirin:{at:[0.85,1.0],shot:"ember",col:[255,150,60],col2:[255,230,140],path:"arc",hit:"flame"},
  Salamander:{at:[1.02,0.45],shot:"cinder",col:[255,120,40],col2:[255,220,120],path:"arc",hit:"flame"},
  Djinn:{at:[1.05,0.35],shot:"star",col:[150,180,255],col2:[255,250,210],path:"wave",hit:"star"}
};

/* ---------- bolt, second pass (Gid, 18 Nov 2026): the first pass was coloured balls, so each family now gets its own wind-up,
   its own thing flying and its own landing. The bolt's timing stays: wind-up to 220 ms, contact at 560, done at 860. ---------- */
OWN.k=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
OWN.cx=(x,o)=>{ const tg=x.target, s=x.self, R=tg.r||30, d=tg.x>=s.x?1:-1;
  return {tg,s,R,d,S:Math.max(9,(s.r||30)*0.6)*atBig(x)*(o.sz||1),big:atBig(x),body:x.body,parts:x.parts,o0:OWN.pt(s,tg,o.at),gnd:tg.foot!=null?tg.foot:tg.y+R,sg:s.foot!=null?s.foot:s.y+(s.r||30),head:tg.top||{x:tg.x,y:tg.y-R}}; };
/* an upright flame with its base on y, swaying */
OWN.fire=(c,x,by,h,outer,inner,t,seed=0)=>{ if(h<=0.5) return; const sw=Math.sin(t/70+seed)*h*0.14;
  for(const [k,col] of [[1,outer],[0.6,inner]]){ const hh=h*k, w=h*0.3*k; c.fillStyle=col; c.beginPath(); c.moveTo(x-w,by);
    c.bezierCurveTo(x-w*1.15,by-hh*0.45,x-w*0.25+sw*0.5,by-hh*0.7,x+sw,by-hh); c.bezierCurveTo(x+w*0.45+sw*0.5,by-hh*0.62,x+w*1.15,by-hh*0.42,x+w,by);
    c.quadraticCurveTo(x,by+w*0.4,x-w,by); c.fill(); } };
/* a small ghost: round head, a wavy hem that ripples, two eyes and a mouth that can open */
OWN.ghost=(c,x,y,s,d,t,mouth,col,a=1)=>{ c.save(); c.globalAlpha*=a; c.translate(x,y); c.scale(d,1);
  atGlowA(c,0,0,s*2.4,col,0.45);
  c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.55),0.95); c.beginPath(); c.arc(0,-s*0.2,s,Math.PI,0);
  c.lineTo(s*0.95,s*0.55); for(let i=0;i<=6;i++){ const xx=s*0.95-i*s*1.9/6, yy=s*0.55+(i%2?s*0.32:0)+Math.sin(t/55+i)*s*0.12; c.lineTo(xx-s*0.35*Math.sin(t/90)*(i/6),yy); }
  c.closePath(); c.fill();
  c.fillStyle="#2a2440"; for(const ex of [0.05,0.5]){ c.beginPath(); c.ellipse(s*ex,-s*0.3,s*0.13,s*0.19,0,0,7); c.fill(); }
  if(mouth>0){ c.beginPath(); c.ellipse(s*0.3,s*0.12,s*0.14*mouth+s*0.04,s*0.2*mouth+s*0.03,0,0,7); c.fill(); }
  c.restore(); };
OWN.gum=(c,x,y,r,col,spin,sq=0)=>{ c.save(); c.translate(x,y); c.scale(1+sq,1-sq); c.fillStyle=OWN.rgb(col,1); c.beginPath(); c.arc(0,0,r,0,7); c.fill();
  c.fillStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.18),1); c.beginPath(); c.arc(r*0.18,r*0.22,r*0.78,0.2,2.6); c.fill();
  c.fillStyle="rgba(255,255,255,.8)"; c.beginPath(); c.ellipse(Math.cos(spin)*r*0.35,-r*0.35+Math.sin(spin)*r*0.12,r*0.28,r*0.17,-0.5,0,7); c.fill(); c.restore(); };
OWN.cloud=(c,x,y,s,col,a=1)=>{ for(const [dx,dy,rr] of [[-0.6,0.1,0.55],[0,-0.2,0.75],[0.6,0.05,0.6],[0.25,0.3,0.5],[-0.3,0.32,0.5]]) SG.puff(c,x+dx*s,y+dy*s,rr*s,a,col); };
OWN.hoof=(c,x,y,s,col,a)=>{ c.save(); c.translate(x,y); c.scale(1,0.38); c.strokeStyle=OWN.rgb(col,a); c.lineWidth=s*0.32; c.lineCap="round"; c.beginPath(); c.arc(0,0,s*0.55,0.35,Math.PI-0.35,true); c.stroke(); c.restore(); };

const OWN_BOLT2={
  /* Booly: a little ghost pinches off its head flame, swims over in a wave with its tail wagging, says boo through the foe and the foe shivers */
  Booly:{at:[0.3,0.0],col:[150,200,255],
    atk:(t,pos)=>t<220?{pose:"cast",sy:1+0.06*Math.sin(Math.PI*t/220),sx:1-0.03*Math.sin(Math.PI*t/220)}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P;
      if(t<220){ const k=eo(t/220), gx=o0.x+d*S*0.6*k, gy=o0.y-S*1.4*k; c.strokeStyle=OWN.rgb([220,235,255],0.7*(1-k*0.6)); c.lineWidth=S*0.5*(1-k); c.lineCap="round"; c.beginPath(); c.moveTo(o0.x,o0.y); c.quadraticCurveTo(o0.x,gy,gx,gy); c.stroke();
        OWN.ghost(c,gx,gy,S*(0.35+0.55*k),d,t,0,P.body?OWN.mix(P.body,o.col,0.6):o.col); return; }
      if(t<620){ const k=OWN.k(t,220,620), st={x:o0.x+d*S*0.6,y:o0.y-S*1.4}, end={x:tg.x+d*R*0.9,y:tg.y-R*0.1};
        for(let i=3;i>=1;i--){ const q=Math.max(0,k-i*0.05), p=lerpP(st,end,q,0,Math.sin(q*Math.PI*3)*S*1.3); SG.puff(c,p.x,p.y+S*0.5,S*(0.5-i*0.1),0.25,[220,235,255]); }
        const p=lerpP(st,end,k,0,Math.sin(k*Math.PI*3)*S*1.3), near=OWN.k(t,470,540), through=OWN.k(t,560,620);
        OWN.ghost(c,p.x,p.y,S*1.1,d,t,near,P.body?OWN.mix(P.body,o.col,0.6):o.col,1-through); return; }
      const k=OWN.k(t,560,860), a=1-k; for(const sd of [-1,1]) for(let j=0;j<3;j++){ const xx=tg.x+sd*(R*0.95+j*4)+Math.sin(t/12+j)*2, y0=tg.y-R*0.5+j*R*0.35;
        c.strokeStyle=OWN.rgb([170,215,255],0.9*a); c.lineWidth=2; c.beginPath(); c.moveTo(xx,y0); c.lineTo(xx+sd*5,y0+4); c.lineTo(xx,y0+8); c.stroke(); }
      for(let i=0;i<5;i++) SG.puff(c,tg.x+(atH(i)-0.5)*R*1.6,tg.y-R*0.6-k*R*0.6+atH(i*3)*R*0.5,R*0.14*(1+k),0.6*a,[225,240,255]); } },
  /* Gumball: the machine rattles, a gumball drops out of the chute, bounces along the ground into the foe and sticks there as gum that blows a bubble */
  Gumball:{at:[0.85,0.85],col:[255,95,150],
    atk:(t,pos)=>t<220?{pose:"effort",rot:Math.sin(t/22)*0.05,off:[Math.sin(t/15)*1.5,0]}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg}=P, r=S*0.95, col=o.col;
      if(t<220){ if(t<90) return; const k=OWN.k(t,90,220), y=o0.y+(sg-r-o0.y)*ei(k); OWN.gum(c,o0.x+d*S*0.4*k,y,r,col,t/40,k>0.9?0.2:0); return; }
      if(t<560){ const k=OWN.k(t,220,560), x0=o0.x+d*S*0.4, x1=tg.x-d*R*0.55, px=x0+(x1-x0)*k, hops=[0.42,0.32,0.26], hk=k<0.42?k/0.42:k<0.74?(k-0.42)/0.32:(k-0.74)/0.26, hi=k<0.42?0:k<0.74?1:2;
        const h=[S*2.6,S*1.6,0][hi], gy=sg-r, tgy=tg.y, y=hi<2?gy-Math.sin(Math.PI*hk)*h:gy+(tgy-gy)*eo(hk)-Math.sin(Math.PI*hk)*S*1.2;
        const sq=hi<2&&(hk<0.08||hk>0.92)?0.22:0; if(hi<2&&hk<0.15) SG.dust(c,px,sg,S*0.9,hk/0.15,4);
        OWN.gum(c,px,y,r,col,t/30*d,sq); return; }
      const k=OWN.k(t,560,860), sx=tg.x-d*R*0.45, sy=tg.y, a=k<0.75?1:1-(k-0.75)/0.25;
      c.save(); c.globalAlpha*=a; c.fillStyle=OWN.rgb(col,1); c.beginPath(); for(let i=0;i<10;i++){ const aa=i/10*7, rr=r*(1.25+0.35*atH(i))*(0.6+0.4*eo(Math.min(1,k*5))); c[i?"lineTo":"moveTo"](sx+Math.cos(aa)*rr,sy+Math.sin(aa)*rr*1.1); } c.fill();
      c.strokeStyle=OWN.rgb(col,1); c.lineWidth=2; for(let i=0;i<3;i++){ const xx=sx+(i-1)*r*0.6; c.beginPath(); c.moveTo(xx,sy+r); c.lineTo(xx+Math.sin(i)*2,sy+r+k*R*0.45*(0.5+atH(i))); c.stroke(); }
      const bk=OWN.k(t,620,820); if(bk>0&&bk<1){ const br=r*(0.4+1.4*bk); c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.35),0.85); c.beginPath(); c.arc(sx-d*br*0.6,sy-r*0.2,br,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(sx-d*br*0.8,sy-r*0.2-br*0.4,br*0.25,br*0.15,-0.5,0,7); c.fill(); }
      if(bk>=1){ const pk=OWN.k(t,820,860); for(let i=0;i<6;i++){ const aa=i/6*7; c.fillStyle=OWN.rgb(col,1-pk); c.beginPath(); c.arc(sx-d*r*1.2+Math.cos(aa)*r*2*(0.6+pk),sy+Math.sin(aa)*r*2*(0.6+pk),2,0,7); c.fill(); } }
      c.restore(); } },
  /* Nimbo: it squeezes off a little rain cloud that floats over the foe's head and rains three drops on it */
  Nimbo:{at:[0.85,0.3],col:[225,235,250],
    atk:(t,pos)=>t<220?{pose:"effort",sx:1+0.07*Math.sin(Math.PI*t/220),sy:1-0.07*Math.sin(Math.PI*t/220)}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,head}=P, cs=S*0.95, cc=P.body?OWN.mix(P.body,[255,255,255],0.25):[230,238,252];
      const over={x:tg.x-d*R*0.15,y:head.y-cs*0.15};
      let cp, ca=1, dark=0;
      if(t<220){ const k=eo(t/220); cp={x:o0.x+d*S*0.8*k,y:o0.y-S*0.3*k}; OWN.cloud(c,cp.x,cp.y,cs*(0.3+0.7*k),cc,0.95); return; }
      if(t<460){ const k=eio(OWN.k(t,220,460)), st={x:o0.x+d*S*0.8,y:o0.y-S*0.3}; cp=lerpP(st,over,k,0,-S*1.5*Math.sin(Math.PI*k)); cp.y+=Math.sin(t/70)*2; }
      else { cp={x:over.x+Math.sin(t/120)*2,y:over.y+Math.sin(t/90)*1.5}; dark=OWN.k(t,460,520); ca=1-OWN.k(t,760,860); }
      OWN.cloud(c,cp.x,cp.y,cs,OWN.mix(cc,[110,120,150],dark*0.45),0.95*ca);
      for(const [t0,dx] of [[460,-0.3],[560,0.25],[650,-0.05]]){ const k=OWN.k(t,t0,t0+100); if(k<=0) continue;
        const yy=cp.y+cs*0.4+(head.y+R*0.15-cp.y-cs*0.4)*ei(k), xx=cp.x+dx*cs;
        if(k<1) OWN.drop(c,xx,yy,S*0.42,Math.PI/2,[120,175,255]);
        const sk=OWN.k(t,t0+100,t0+220); if(sk>0&&sk<1) for(const sd of [-1,1]) for(const j of [0.6,1]){ c.fillStyle=OWN.rgb([150,200,255],1-sk); c.beginPath(); c.arc(xx+sd*S*0.8*j*eo(sk),head.y+R*0.15-S*0.7*j*Math.sin(Math.PI*sk),S*0.12,0,7); c.fill(); } } } },
  /* Sox: it pulls fuzz off itself and rolls it into a ball, throws it so it bounces once on the ground, and it bursts into fluff on the foe */
  Sox:{at:[0.55,0.02],col:[240,150,205],
    atk:(t,pos)=>t<220?{pose:"effort",off:[Math.sin(t/12)*1.6,0]}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg}=P, col=P.body||o.col, wh=P.parts?OWN.mix(P.parts,[255,255,255],0.5):[250,240,246], r=S*1.0;
      const ball=(px,py,rr,spin,a=1)=>{ c.save(); c.globalAlpha*=a; SG.puff(c,px,py,rr,0.95,OWN.mix(col,wh,0.45));
        for(let i=0;i<7;i++){ const aa=i/7*7+spin; c.strokeStyle=OWN.rgb(i%2?col:wh,0.95); c.lineWidth=1.6; c.beginPath(); c.arc(px+Math.cos(aa)*rr*0.35,py+Math.sin(aa)*rr*0.35,rr*0.6,aa,aa+2.2); c.stroke(); }
        for(let i=0;i<5;i++){ const aa=i/5*7+spin*0.5; c.strokeStyle=OWN.rgb(wh,0.9); c.lineWidth=1; c.beginPath(); c.moveTo(px+Math.cos(aa)*rr,py+Math.sin(aa)*rr); c.lineTo(px+Math.cos(aa+0.3)*rr*1.35,py+Math.sin(aa+0.3)*rr*1.35); c.stroke(); } c.restore(); };
      const hold={x:o0.x+d*S*0.5,y:o0.y-S*1.2};
      if(t<220){ const k=t/220; for(let i=0;i<6;i++){ const q=Math.min(1,k*1.4-i*0.06); if(q<=0) continue; const st={x:o0.x+(atH(i)-0.5)*S*3,y:o0.y+atH(i*3)*S*1.5}, p=lerpP(st,hold,eo(q),0,0);
          c.strokeStyle=OWN.rgb(i%2?col:wh,0.9*(1-q*0.7)); c.lineWidth=2; c.beginPath(); c.moveTo(st.x,st.y); c.quadraticCurveTo((st.x+p.x)/2,p.y-S,p.x,p.y); c.stroke(); }
        ball(hold.x,hold.y,r*(0.3+0.7*eo(k)),t/40); return; }
      if(t<560){ const k=OWN.k(t,220,560), x1=tg.x-d*R*0.4, bx=hold.x+(x1-hold.x)*0.55, gy=sg-r;
        let p, sq=0; if(k<0.55){ const q=k/0.55; p={x:hold.x+(bx-hold.x)*q,y:hold.y+(gy-hold.y)*ei(q)-Math.sin(Math.PI*q)*S*0.8}; }
        else { const q=(k-0.55)/0.45; p={x:bx+(x1-bx)*q,y:gy+(tg.y-gy)*q-Math.sin(Math.PI*q)*S*1.8}; if(q<0.2) SG.dust(c,bx,sg,S*0.8,q/0.2,4); }
        ball(p.x,p.y,r,t/25*d); return; }
      const k=OWN.k(t,560,860), a=1-k*0.85;
      for(let i=0;i<9;i++){ const aa=i/9*7, dd=R*(0.2+0.75*eo(Math.min(1,k*2))), px=tg.x-d*R*0.3+Math.cos(aa)*dd+Math.sin(t/120+i)*4, py=tg.y+Math.sin(aa)*dd*0.6+k*k*R*0.9;
        SG.puff(c,px,py,S*(0.32+0.1*atH(i)),a,i%3?OWN.mix(col,wh,0.5):wh);
        if(i%3===0){ c.strokeStyle=OWN.rgb(col,a); c.lineWidth=1.3; c.beginPath(); c.moveTo(px-4,py); c.quadraticCurveTo(px,py-5,px+4,py+Math.sin(t/60+i)*3); c.stroke(); } } } },
  /* Kirin: it rears and stamps, and flaming hoofprints walk across the ground to the foe, the last one bursting under it */
  /* Kirin: its hooves catch fire as it rears, the stamp throws a ring of fire, burning hoofprints gallop across the ground
     and the last one erupts into a ring of flames around the foe */
  Kirin:{at:[0.85,1.0],col:[255,135,45],
    atk:(t,pos)=>t<150?{pose:"crouch",arc:-14*eo(t/150),rot:-0.16*(pos.dir||1)*eo(t/150)}:t<230?{pose:"slam",arc:-14*(1-ei(OWN.k(t,150,195))),rot:-0.16*(pos.dir||1)*(1-OWN.k(t,150,195)),sy:t>195?0.88:1,sx:t>195?1.1:1}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd}=P, col=o.col, inner=[255,232,150], hot=OWN.rgb(col,0.92), core=OWN.rgb(inner,0.95);
      const ring=(cx,cy,rr,a,w)=>{ c.save(); c.translate(cx,cy); c.scale(1,0.3); c.strokeStyle=OWN.rgb([255,170,70],a); c.lineWidth=w; c.beginPath(); c.arc(0,0,rr,0,7); c.stroke(); c.restore(); };
      const ember=(px,py,i,k)=>{ c.fillStyle=OWN.rgb([255,200,110],Math.max(0,1-k)); c.beginPath(); c.arc(px+Math.sin(t/90+i)*3,py,1.4+atH(i)*1.4,0,7); c.fill(); };
      /* the hooves catch fire while it rears */
      if(t<230){ const h=S*1.3*eo(Math.min(1,t/150))*(t>195?1.25:1); OWN.fire(c,o0.x,sg,h,hot,core,t,1); OWN.fire(c,o0.x-d*S*0.5,sg,h*0.75,hot,core,t,2); }
      /* the stamp throws a ring of fire along the ground */
      const sk=OWN.k(t,195,470); if(sk>0&&sk<1){ ring(o0.x,sg,S*(0.8+4*eo(sk)),1-sk,4*(1-sk)+1); SG.dust(c,o0.x,sg,S*1.2,sk,8); }
      /* burning hoofprints gallop to the foe in pairs, with a fuse of fire running between them */
      const x0=o0.x+d*S*1.4, x1=tg.x-d*R*0.15, n=6;
      const head=OWN.k(t,210,540); if(head>0){ const hx=x0+(x1-x0)*head, tail=Math.max(0,head-0.35), tx=x0+(x1-x0)*tail, gy=(q)=>sg+(gnd-sg)*q;
        c.save(); c.globalAlpha*=t<620?1:1-OWN.k(t,620,760); c.strokeStyle=OWN.rgb([255,160,60],0.85); c.lineWidth=3; c.lineCap="round"; c.beginPath(); c.moveTo(tx,gy(tail)); c.lineTo(hx,gy(head)); c.stroke();
        c.strokeStyle=OWN.rgb(inner,0.9); c.lineWidth=1.2; c.stroke(); c.restore(); }
      for(let i=0;i<n;i++){ const q=i/(n-1), t0=210+q*300, k=OWN.k(t,t0,t0+380); if(k<=0||k>=1) continue;
        const px=x0+(x1-x0)*q+(i%2?d*S*0.35:0), py=sg+(gnd-sg)*q+(i%2?2:-2), leap=k<0.18?eo(k/0.18):1-eo((k-0.18)/0.82);
        OWN.hoof(c,px,py,S*1.5,OWN.mix([255,120,40],[90,40,20],k),0.95*(1-k*0.6));
        OWN.fire(c,px,py,S*(1.5+0.6*(i===n-1))*leap,hot,core,t,i*1.7);
        for(let j=0;j<2;j++) ember(px+(atH(i*5+j)-0.5)*S,py-S*(0.6+1.8*k)*(0.6+atH(i+j*3)),i*3+j,k); }
      /* the last print erupts: flames round the foe and a ring of fire on the ground */
      const bk=OWN.k(t,545,860); if(bk>0&&bk<1){ const grow=bk<0.2?eo(bk/0.2):1-ei((bk-0.2)/0.8);
        ring(tg.x,gnd,R*(0.6+0.9*eo(bk)),0.9*(1-bk),5*(1-bk)+1);
        for(let j=0;j<7;j++){ const ang=j/7*Math.PI, xx=tg.x+Math.cos(ang)*R*0.85, yy=gnd-Math.sin(ang)*R*0.12, hh=R*(0.9+0.7*atH(j))*grow*(j===3?1.35:1);
          OWN.fire(c,xx,yy,hh,hot,core,t,j*2.3); }
        for(let j=0;j<10;j++) ember(tg.x+(atH(j)-0.5)*R*1.8,gnd-R*(0.3+2.2*bk)*(0.5+atH(j*2)),j,bk); } } }
};

/* ---------- steam: a cloud from its own part ---------- */
const OWN_STEAM={
  Fizz:{at:[[0.5,-0.22]],style:"bubbles",col:[240,190,250]},
  Puff:{at:[[0.7,0.35]],style:"spores",col:[190,140,230]},
  Wick:{at:[[0.5,-0.25]],style:"smoke",col:[120,115,125]},
  Nimbo:{at:[[0.97,0.55]],style:"fog",col:[220,232,250]},
  Trundle:{at:[[0.2,-0.05]],style:"rings",col:[150,145,150]},
  Clank:{at:[[0.3,-0.05],[0.7,-0.05]],style:"jet",col:[248,250,255]},
  Sizzle:{at:[[0.4,-0.02],[0.6,-0.02]],style:"smoke",col:[95,85,85]},
  Helm:{at:[[1.0,0.3]],style:"jet",col:[245,250,255]},
  Sox:{at:[[0.55,0.0]],style:"stink",col:[170,200,90]},
  Scoop:{at:[[0.6,-0.05]],style:"spray",col:[210,235,255]},
  Gumball:{at:[[0.85,0.85]],style:"spray",col:[220,240,120]},
  Vroom:{at:[[1.02,0.9]],style:"dust",col:[175,150,120]},
  Shutter:{at:[[1.02,0.5]],style:"jet",col:[150,235,215]},
  Lava:{at:[[0.5,-0.12]],style:"haze",col:[255,190,150]},
  Vampire:{at:[[0.93,0.42]],style:"fog",col:[90,120,90]},
  Phoenix:{at:[[0.6,0.0]],style:"haze",col:[255,170,90]},
  Yeti:{at:[[0.95,0.45]],style:"frost",col:[140,200,255]},
  Mermaid:{at:[[0.95,0.48]],style:"spray",col:[200,235,245]},
  Diwata:{at:[[1.0,0.45]],style:"sparkle",col:[230,215,255]},
  Hydra:{at:[[0.2,-0.1],[0.5,-0.25],[0.8,-0.1]],style:"stink",col:[150,200,110]},
  Kirin:{at:[[0.35,0.1]],style:"frost",col:[220,240,255]},
  Bakunawa:{at:[[0.95,0.35]],style:"spray",col:[235,250,250]},
  Djinn:{at:[[0.7,1.1]],style:"smoke",col:[170,140,230]},
  Troll:{at:[[0.55,0.0]],style:"spores",col:[230,210,150]},
  Mummy:{at:[[0.95,0.45]],style:"dust",col:[200,180,140]},
  Ghoul:{at:[[0.95,0.35]],style:"stink",col:[150,190,120]},
  Gug:{at:[[0.5,-0.1]],style:"hot",col:[255,150,110]}
};
/* ---------- trumpet: a sound from its own part ---------- */
const OWN_HORN={
  Antik:{at:[[0.5,-0.25]],style:"arc",col:[140,230,255],extra:"static"},
  Booly:{at:[[0.95,0.5]],style:"wobble",col:[200,220,255],extra:null},
  Teep:{at:[[1.08,0.35]],style:"thin",col:[255,255,255],extra:"steam"},
  Flit:{at:[[1.0,0.45]],style:"jag",col:[180,140,220],extra:"bats"},
  Tock:{at:[[0.3,-0.05],[0.7,-0.05]],style:"arc",col:[255,220,120],extra:"shake"},
  Snooze:{at:[[0.95,0.45]],style:"wobble",col:[200,200,255],extra:"zs"},
  Ditty:{at:[[0.6,-0.3]],style:"arc",col:[255,230,140],extra:"notes"},
  Helm:{at:[[1.0,0.45]],style:"ping",col:[130,230,200],extra:null},
  Sox:{at:[[0.55,0.0]],style:"wobble",col:[245,180,220],extra:"fluff"},
  Jack:{at:[[0.95,0.6]],style:"arc",col:[255,170,60],extra:"glow"},
  Sphinx:{at:[[0.95,0.45]],style:"arc",col:[230,200,140],extra:"sand"},
  Werewolf:{at:[[0.9,0.25]],style:"arc",col:[210,215,255],extra:null,up:-0.45},
  Minotaur:{at:[[0.95,0.45]],style:"arc",col:[230,200,180],extra:"steam"},
  Thunderbird:{at:[[1.0,0.35]],style:"jag",col:[255,230,110],extra:"sparks"},
  Griffin:{at:[[1.02,0.35]],style:"wedge",col:[255,240,210],extra:null},
  Cerberus:{at:[[0.6,0.2],[0.95,0.4],[0.35,0.15]],style:"arc",col:[140,190,255],extra:null},
  Dagon:{at:[[0.95,0.45]],style:"wobble",col:[120,200,210],extra:"bubbles"},
  Gug:{at:[[0.5,-0.15]],style:"arc",col:[160,60,80],extra:null,heavy:true},
  Hastur:{at:[[0.9,0.3]],style:"tatter",col:[240,210,90],extra:null}
};

/* ---------- the three animations ---------- */
OWN.boltFx=(c,t,x,o)=>{ const tg=x.target, o0=OWN.pt(x.self,tg,o.at), S=OWN.size(x); o.dirSign=tg.x>o0.x?1:-1;
  if(t<220){ const k=t/220; atGlowA(c,o0.x,o0.y,S*(1.5+1.5*k),o.col,0.35+0.3*k); OWN.shot(c,o,o0,o.dirSign>0?0:Math.PI,S*(0.3+0.7*eo(k)),t); return; }
  if(t<560){ const k=(t-220)/340, kk=o.path==="float"?k:eo(k*0.85+0.15*k);
    for(let i=4;i>=0;i--){ const q=kk-i*0.045; if(q<=0) continue; const p=OWN.path(o,o0,tg,q,S,t), p2=OWN.path(o,o0,tg,Math.min(1,q+0.02),S,t), ang=Math.atan2(p2.y-p.y,p2.x-p.x);
      OWN.shot(c,o,p,ang,S*(i?1-i*0.12:1),t,i?0.35-i*0.06:1); }
    return; }
  OWN.hit(c,o,tg,(t-560)/300,S,t); };
/* soft smoke (Gid, 18 Nov 2026: the clouds read as stacked circles). Puffs are soft gradients drawn into their own layer and blurred,
   then the crisp bits (drops, bubbles, flakes, flies) go on top in a second pass over the same moves. */
OWN.NOOP=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:k==="canvas"?null:OWN.NOOP,apply:()=>OWN.NOOP,set:()=>true});
OWN.sp=(l,x,y,r,a,col=[250,250,252])=>{ if(a<=0||r<=0) return; a=Math.min(1,a*1.45); const R=r*1.55;
  const sh=l.createRadialGradient(x+r*0.2,y+r*0.3,0,x+r*0.2,y+r*0.3,R); sh.addColorStop(0,atRgba(col.map(v=>Math.max(0,v*0.7)),a*0.55)); sh.addColorStop(1,atRgba(col.map(v=>Math.max(0,v*0.7)),0)); l.fillStyle=sh; l.beginPath(); l.arc(x+r*0.2,y+r*0.3,R,0,7); l.fill();
  const g=l.createRadialGradient(x-r*0.3,y-r*0.35,0,x,y,R); g.addColorStop(0,atRgba(col.map(v=>Math.min(255,v+30)),a)); g.addColorStop(0.45,atRgba(col,a*0.85)); g.addColorStop(1,atRgba(col,0)); l.fillStyle=g; l.beginPath(); l.arc(x,y,R,0,7); l.fill(); };
OWN.layerCv=null;
/* a cartoon cloud as one shape: bumps along the top, a flatter base, lit from above */
OWN.cloudShape=(c,x,y,w,col,a,seed=0)=>{ if(a<=0||w<=0) return; const h=w*0.55, n=5; c.save(); c.globalAlpha*=a; c.beginPath(); c.moveTo(x-w*0.5,y+h*0.25);
  for(let i=0;i<n;i++){ const cx=x-w*0.5+w*(i+0.5)/n, r=w/n*(0.75+0.35*atH(seed+i))*(i===1||i===2?1.35:1); c.arc(cx,y-h*0.05-(i===1||i===2?h*0.15:0),r,Math.PI,0); }
  c.quadraticCurveTo(x+w*0.62,y+h*0.3,x+w*0.4,y+h*0.38); c.lineTo(x-w*0.4,y+h*0.38); c.quadraticCurveTo(x-w*0.62,y+h*0.3,x-w*0.5,y+h*0.25); c.closePath();
  const g=c.createLinearGradient(0,y-h*0.7,0,y+h*0.4); g.addColorStop(0,atRgba(col.map(v=>Math.min(255,v+45)),1)); g.addColorStop(1,atRgba(col.map(v=>Math.max(0,v-35)),1)); c.fillStyle=g; c.fill();
  c.strokeStyle=atRgba(col.map(v=>Math.min(255,v+70)),0.6); c.lineWidth=Math.max(1.2,w*0.025); c.stroke(); c.restore(); };
/* soft finish (Gid, 19 Nov 2026: the effects looked like they came from a different game than the glossy Snabits). Everything a move draws
   crisply goes into its own layer first; each shape then gets a lit top-left rim and a shaded bottom-right rim, plus a broad soft
   gradient across it, and the layer lands with a soft drop shadow, the way the Snabits themselves are drawn. */
OWN.ol=(c,al=0.35)=>{ c.save(); c.globalAlpha*=al; c.stroke(); c.restore(); };   /* outlines kept faint, since the Snabits have none */
OWN.cv=(k,W,H)=>{ let L=OWN[k]; if(!L) L=OWN[k]=document.createElement("canvas"); if(L.width!==W||L.height!==H){ L.width=W; L.height=H; } return L; };
OWN.bevel=(C,x0,y0,w,h,sc)=>{ const T=OWN.cv("bevCv",C.width,C.height), t=T.getContext("2d"), cl=C.getContext("2d");
  const pass=(col,dx,dy,b,al)=>{ t.setTransform(1,0,0,1,0,0); t.globalCompositeOperation="source-over"; t.filter="none"; t.globalAlpha=1; t.clearRect(x0,y0,w,h); t.fillStyle=col; t.fillRect(x0,y0,w,h);
    t.globalCompositeOperation="destination-out"; t.filter="blur("+b.toFixed(1)+"px)"; t.drawImage(C,x0,y0,w,h,x0+dx,y0+dy,w,h); t.filter="none"; t.globalCompositeOperation="source-over";
    cl.save(); cl.setTransform(1,0,0,1,0,0); cl.globalCompositeOperation="source-atop"; cl.globalAlpha=al; cl.drawImage(T,x0,y0,w,h,x0,y0,w,h); cl.restore(); };
  const d=Math.max(1,2*sc), D=Math.max(2,7*sc);
  pass("rgb(60,30,80)",-D,-D,D*1.3,0.16); pass("rgb(255,255,255)",D,D,D*1.3,0.18);
  pass("rgb(60,30,80)",-d,-d,d*1.2,0.2); pass("rgb(255,255,255)",d,d,d*1.2,0.4); };
OWN.softLayer=(c,x,draw)=>{ if(OWN.inSoft||OWN.noSoft||typeof document==="undefined"||!c||!c.canvas||!c.getTransform||!x||!x.self||!x.target) return draw(c);
  const W=c.canvas.width, H=c.canvas.height, m=c.getTransform(), sc=Math.hypot(m.a,m.b)||1, s=x.self, tg=x.target, R=Math.max(s.r||30,tg.r||30);
  const yb=Math.max(s.foot||s.y+R,tg.foot||tg.y+R)+R*1.5, y1=Math.min(H,Math.ceil(m.d*yb+m.f)); if(y1<=4) return draw(c);
  const C=OWN.cv("softCv",W,H), cl=C.getContext("2d"); cl.setTransform(1,0,0,1,0,0); cl.globalCompositeOperation="source-over"; cl.globalAlpha=1; cl.filter="none"; cl.clearRect(0,0,W,y1); cl.setTransform(m);
  let r; OWN.inSoft=true; try{ r=draw(cl); } finally { OWN.inSoft=false; cl.setTransform(1,0,0,1,0,0); }
  OWN.bevel(C,0,0,W,y1,sc);
  c.save(); c.setTransform(1,0,0,1,0,0); c.shadowColor="rgba(50,28,70,.26)"; c.shadowBlur=6*sc; c.shadowOffsetY=3*sc; c.drawImage(C,0,0,W,y1,0,0,W,y1); c.restore(); return r; };
OWN.twoPass=(c,x,body,blur=1.6)=>{ const s=x.self, tg=x.target, R=Math.max(s.r||30,tg.r||30);
  let ok=typeof document!=="undefined"&&c&&c.canvas&&c.getTransform;
  if(ok){ const W=c.canvas.width, H=c.canvas.height; let L=OWN.layerCv; if(!L) L=OWN.layerCv=document.createElement("canvas"); if(L.width!==W||L.height!==H){ L.width=W; L.height=H; }
    const l=L.getContext("2d"), m=c.getTransform(), sc=Math.hypot(m.a,m.b)||1;
    const xs=[s.x,tg.x], ys=[(s.top?s.top.y:s.y-R),(tg.top?tg.top.y:tg.y-R),(s.foot||s.y+R),(tg.foot||tg.y+R)];
    const ux0=Math.min(...xs)-R*3, ux1=Math.max(...xs)+R*3, uy0=Math.min(...ys)-R*3, uy1=Math.max(...ys)+R*1.5;
    const dx0=Math.max(0,Math.floor(Math.min(m.a*ux0+m.c*uy0+m.e,m.a*ux1+m.c*uy1+m.e))), dy0=Math.max(0,Math.floor(Math.min(m.b*ux0+m.d*uy0+m.f,m.b*ux1+m.d*uy1+m.f)));
    const dx1=Math.min(W,Math.ceil(Math.max(m.a*ux0+m.c*uy0+m.e,m.a*ux1+m.c*uy1+m.e))), dy1=Math.min(H,Math.ceil(Math.max(m.b*ux0+m.d*uy0+m.f,m.b*ux1+m.d*uy1+m.f)));
    if(dx1>dx0&&dy1>dy0){ l.setTransform(1,0,0,1,0,0); l.clearRect(dx0,dy0,dx1-dx0,dy1-dy0); l.setTransform(m); l.globalAlpha=1;
      body(OWN.NOOP,(...a)=>OWN.sp(l,...a));
      c.save(); c.setTransform(1,0,0,1,0,0); try{ c.filter="blur("+(blur*sc).toFixed(1)+"px)"; }catch(e){} c.drawImage(L,dx0,dy0,dx1-dx0,dy1-dy0,dx0,dy0,dx1-dx0,dy1-dy0); try{ c.filter="none"; }catch(e){} c.restore(); }
    else ok=false; }
  if(ok&&!x.noSoft) OWN.softLayer(c,x,cc=>body(cc,()=>{})); else body(c,ok?()=>{}:(...a)=>OWN.sp(c,...a)); };
OWN.steamFx=(c,t,x,o0x)=>{ const mv=typeof OWN_STEAM_MOVE!=='undefined'&&x&&OWN_STEAM_MOVE[x.name]; const o=mv?{...o0x,...mv}:o0x;
  OWN.twoPass(c,x,(cc,PF)=>o.fx?o.fx(cc,t,x,o,PF):OWN.steamBody(cc,t,x,o,(px,py,r,al,col)=>PF(px,py,r*1.35,al,col))); };
OWN.steamBody=(c,t,x,o,PF)=>{ const tg=x.target, S=OWN.size(x), pts=o.at.map(uv=>OWN.pt(x.self,tg,uv)), C=o.col;
  if(t<180){ for(const p of pts) PF(p.x,p.y-t/40,S*(0.4+t/300),0.7,C); return; }
  const w=Math.min(1,(t-180)/120)*Math.min(1,(900-t)/160); if(w<=0) return; const big=atBig(x);
  pts.forEach((o0,j)=>{ const n=o.style==="jet"?14:18;
    for(let i=0;i<n;i++){ const k=((t-180)/520+i/n)%1; let p, r;
      switch(o.style){
        case "smoke": { p=lerpP(o0,tg,k,0,0); p={x:p.x+Math.sin(k*7+i)*S*0.8,y:p.y-Math.sin(Math.PI*k)*S*4}; r=(6+k*22)*big; PF(p.x,p.y,r,0.8*w*(1-k*0.5),OWN.mix(C,[60,55,60],atH(i)*0.4)); break; }
        case "fog": { const gy=x.self.foot!=null?x.self.foot:(o0.y+S*3); const low=gy-S*(0.8+0.6*atH(i)); p={x:o0.x+(tg.x-o0.x)*k,y:o0.y+(low-o0.y)*Math.min(1,k*2.2)-Math.sin(k*5+i)*S*0.3}; r=(6+k*24)*big; PF(p.x,p.y,r,0.75*w*(1-k*0.4),C); break; }
        case "rings": { if(i%3) break; p=lerpP(o0,tg,k,0,0); p={x:p.x,y:p.y-Math.sin(Math.PI*k)*S*2}; r=(12+k*30)*big; const ra=w*(1-k*0.55);   /* smoky rings (Gid, 19 Nov 2026: bigger and smokier) */
          for(let q=0;q<16;q++){ const aa=q/16*Math.PI*2+t/260+i; PF(p.x+Math.cos(aa)*r*0.55,p.y+Math.sin(aa)*r,(5+k*9)*big,0.7*ra,OWN.mix(C,[255,255,255],0.15+0.2*atH(q+i))); }
          c.strokeStyle=OWN.rgb(OWN.mix(C,[255,255,255],0.5),0.3*ra); c.lineWidth=4*big; c.beginPath(); c.ellipse(p.x,p.y,r*0.55,r,0,0,7); c.stroke(); break; }
        case "jet": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/60)*6*k); r=(3+k*28)*big; PF(p.x,p.y,r,0.9*w*(1-k*0.6),C); break; }
        case "stink": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*10*k); r=(7+k*20)*big; PF(p.x,p.y-k*6,r,0.7*w*(1-k*0.5),OWN.mix(C,[120,90,60],atH(i)*0.3));
          if(i%4===0){ c.strokeStyle=OWN.rgb(OWN.mix(C,[60,90,30],0.4),0.8*w*(1-k)); c.lineWidth=2; c.beginPath(); for(let q=0;q<=8;q++){ const yy=p.y-r-q*3; c.lineTo(p.x+Math.sin(q*1.3+t/80)*4,yy); } c.stroke(); } break; }
        case "spray": { p=lerpP(o0,tg,k,0,(atH(i*7)-0.5)*S*4*k); for(let q=0;q<4;q++){ c.fillStyle=OWN.rgb(OWN.mix(C,[255,255,255],q*0.25),0.95*w*(1-k*0.4)); c.beginPath(); c.arc(p.x+(atH(i+q*9)-0.5)*S*2.4*k,p.y+(atH(i*3+q)-0.5)*S*2.4*k,(2.2+2.8*(1-k))*big,0,7); c.fill(); }
          PF(p.x,p.y,(5+k*18)*big,0.55*w*(1-k*0.6),C); break; }
        case "dust": { const gy=x.self.foot!=null?x.self.foot:(o0.y+S*2); p={x:o0.x+(tg.x-o0.x)*k,y:o0.y+(gy-S-o0.y)*Math.min(1,k*2)-Math.sin(k*6+i)*S*0.6}; r=(6+k*22)*big; PF(p.x,p.y,r,0.75*w*(1-k*0.4),OWN.mix(C,[90,70,50],atH(i)*0.35));
          if(i%2) { c.fillStyle=OWN.rgb(OWN.mix(C,[60,45,30],0.5),0.8*w*(1-k)); c.beginPath(); c.arc(p.x+(atH(i*5)-0.5)*r*2,p.y+(atH(i)-0.5)*r,1.6*big,0,7); c.fill(); } break; }
        case "haze": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*8*k); if(i%2===0) atGlowA(c,p.x,p.y,(8+k*20)*big,C,0.3*w*(1-k*0.6));
          c.strokeStyle=OWN.rgb(OWN.mix(C,[255,255,255],0.3),0.8*w*(1-k)); c.lineWidth=2.5*big; c.beginPath(); for(let q=-4;q<=4;q++){ c.lineTo(p.x+Math.sin(q*1.4+t/50+i)*S*0.5*(1+k),p.y+q*S*0.45*(1+k)); } c.stroke();
          if(i%2===0) PF(p.x,p.y,(5+k*16)*big,0.45*w*(1-k),OWN.mix(C,[255,255,255],0.55));
          if(i%5===0){ c.fillStyle=OWN.rgb([255,200,90],0.95*w*(1-k)); c.beginPath(); c.arc(p.x+(atH(i)-0.5)*S*2,p.y-(1-k)*S,1.8*big,0,7); c.fill(); } break; }
        case "frost": { p=lerpP(o0,tg,k,0,Math.sin(i*2.3+t/80)*8*k); r=(5+k*22)*big; PF(p.x,p.y,r,0.75*w*(1-k*0.5),C);
          if(i%3===0) OWN.star(c,p.x+(atH(i)-0.5)*r,p.y+(atH(i*3)-0.5)*r,(2+2*k)*big,OWN.rgb([255,255,255],0.9*w*(1-k)),t/200+i);
          if(i%3===1&&OWN.GU&&OWN.GU.shard) OWN.GU.shard(c,p.x+(atH(i*5)-0.5)*r,p.y+(atH(i*7)-0.5)*r,(2.5+3*k)*big,t/150+i,0.9*w*(1-k)); break; }
        case "hot": { p=lerpP(o0,tg,k,0,Math.sin(i*2.3+t/80)*8*k); r=(5+k*20)*big; PF(p.x,p.y,r,0.7*w*(1-k*0.5),OWN.mix(C,[255,230,200],atH(i)*0.5));
          if(i%2===0){ c.fillStyle=OWN.rgb([255,190,80],0.95*w*(1-k)); c.beginPath(); c.arc(p.x+(atH(i)-0.5)*r,p.y+(atH(i*3)-0.5)*r-(1-k)*4,1.8*big,0,7); c.fill(); } break; }
        case "toxic": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*10*k); r=(11+k*30)*big; PF(p.x,p.y-Math.sin(Math.PI*k)*S,r,0.7*w*(1-k*0.45),i%2?C:(o.col2||[150,90,190]));
          if(i%3===0) OWN.bubble(c,p.x+(atH(i)-0.5)*r,p.y-r*0.4-k*6,(2+3*k)*big,o.col2||[170,110,210],false); break; }
        case "whirl": { const base=lerpP(o0,tg,k,0,0), aa=k*14+i*0.7, rr=S*(0.6+1.8*k); p={x:base.x+Math.cos(aa)*rr*0.5,y:base.y+Math.sin(aa)*rr-S*1.2*Math.sin(Math.PI*k)}; r=(5+k*16)*big; PF(p.x,p.y,r,0.75*w*(1-k*0.5),OWN.mix(C,[60,55,60],atH(i)*0.4)); break; }
        case "burst": { const up=Math.min(1,k*3); p=lerpP(o0,tg,Math.max(0,k-0.25)/0.75,0,0); p={x:k<0.25?o0.x+Math.sin(i)*S*0.6*up:p.x,y:k<0.25?o0.y-S*3*up:p.y-S*3*(1-Math.max(0,k-0.25)/0.75)}; r=(8+k*26)*big; PF(p.x,p.y,r,0.85*w*(1-k*0.5),[250,252,255]); break; }
        case "foam": { p=lerpP(o0,tg,k,0,(atH(i*7)-0.5)*S*4*k); PF(p.x,p.y,(8+k*24)*big,0.6*w*(1-k*0.6),C); for(let q=0;q<3;q++) OWN.bubble(c,p.x+(atH(i+q*9)-0.5)*S*2.4*k,p.y+(atH(i*3+q)-0.5)*S*2.4*k,(3+3.5*atH(i+q))*big,[245,252,255],false); break; }
        case "slush": { p=lerpP(o0,tg,k,0,(atH(i*7)-0.5)*S*4*k); PF(p.x,p.y,(8+k*24)*big,0.6*w*(1-k*0.6),C);
          for(let q=0;q<3;q++){ c.save(); c.translate(p.x+(atH(i+q*9)-0.5)*S*2.6*k,p.y+(atH(i*3+q)-0.5)*S*2.6*k); c.rotate(t/90+i+q); c.fillStyle=OWN.rgb([235,248,255],0.95*w*(1-k*0.3)); c.fillRect(-3.2*big,-3.2*big,6.4*big,6.4*big); c.restore(); } break; }
        case "bubbles": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*10*k); if(i%2) OWN.bubble(c,p.x,p.y-Math.sin(Math.PI*k)*S*2,(4+8*k)*big,OWN.mix(C,[120,60,140],0.3),false); else PF(p.x,p.y,(5+k*18)*big,0.55*w*(1-k*0.5),C); break; }
        case "spores": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*12*k); r=(5+k*20)*big; PF(p.x,p.y-Math.sin(Math.PI*k)*S,r,0.65*w*(1-k*0.5),C);
          c.fillStyle=OWN.rgb(OWN.mix(C,[255,255,255],0.5),0.9*w*(1-k)); for(let q=0;q<3;q++){ c.beginPath(); c.arc(p.x+(atH(i*3+q)-0.5)*r*1.6,p.y+(atH(i+q*5)-0.5)*r*1.6,1.6*big,0,7); c.fill(); } break; }
        case "sparkle": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*12*k); PF(p.x,p.y,(4+k*16)*big,0.45*w*(1-k*0.5),C); if(i%2) OWN.star(c,p.x+(atH(i)-0.5)*S*2,p.y+(atH(i*2)-0.5)*S*2,(2+2*(1-k))*big,OWN.rgb([255,250,220],0.95*w*(1-k)),t/120+i); break; }
        default: { p=lerpP(o0,tg,k,0,0); PF(p.x,p.y,(8+k*26)*big,0.85*w*(1-k*0.55),C); } } } });
  if(o.flies) for(let i=0;i<5;i++){ const ph=t/90+i*1.7, k=Math.min(1,(t-180)/600), cx=pts[0].x+(tg.x-pts[0].x)*k*(0.4+0.6*atH(i)), cy=pts[0].y+(tg.y-pts[0].y)*k-S;
    const fx=cx+Math.cos(ph*2.3)*S*1.2, fy=cy+Math.sin(ph*3.1)*S*0.8; c.fillStyle=OWN.rgb([30,30,30],0.9*w); c.beginPath(); c.arc(fx,fy,2.8*big,0,7); c.fill();
    c.fillStyle=OWN.rgb([230,240,255],0.7*w); const fl=Math.sin(t/8+i)>0?1:0.4; c.beginPath(); c.ellipse(fx-2.2*big,fy-2.6*big,2.4*big,1.4*big*fl,-0.5,0,7); c.ellipse(fx+2.2*big,fy-2.6*big,2.4*big,1.4*big*fl,0.5,0,7); c.fill(); }
  PF(tg.x,tg.y,22*atBig(x),0.25*w,o.col); };
OWN.hornFx=(c,t,x,o)=>{ const s=x.self, tg=x.target, R=tg.r||30, S=OWN.size(x), d=atDir(x), C=o.col, pts=o.at.map(uv=>OWN.pt(s,tg,uv));
  pts.forEach((tip,j)=>{ const L=Math.abs(tg.x-tip.x)+R, up=o.up||0, ta=up||Math.atan2(tg.y-tip.y,Math.abs(tg.x-tip.x)||1)*0.8;   // aimed at the target, or up for a howl
    if(t>200&&t<860){ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tip.x,tip.y,s.r*0.3,C,0.6); c.restore(); }
    for(let i=0;i<6;i++){ const k=(t-200-i*95-j*40)/520; if(k<0||k>1) continue; const rr=s.r*0.25+L*eo(k)*(up?0.75:1), a=1-k, wob=Math.sin(t/25+i)*0.04;
      const ws=o.heavy?[[13,OWN.rgb(OWN.mix(C,[0,0,0],0.3),0.55*a)],[6,OWN.rgb(C,0.95*a)]]:[[9,OWN.rgb(C,0.4*a)],[4,OWN.rgb(OWN.mix(C,[255,255,255],0.65),0.95*a)]];
      const hs=Math.min(o.style==="wedge"?0.32:0.6,R*(o.style==="wedge"?0.7:1.15)/Math.max(rr,1));   // the ring never gets much taller than the target
      for(const [w,col] of ws){ c.strokeStyle=col; c.lineWidth=w*(1-k*0.5)*(o.style==="thin"?0.5:1); c.lineCap="round"; c.beginPath(); let pen=false;
        for(let q=0;q<=24;q++){ const qa=-hs+q/24*hs*2+ta; let rad=rr;
          if(o.style==="wobble") rad+=4*Math.sin(q*0.45+t/60+i);
          else if(o.style==="jag") rad+=q%2?3:-3;
          if(o.style==="tatter"&&atH(q*7+i)<0.2){ pen=false; continue; }
          const px=tip.x+d*Math.cos(qa+wob)*rad, py=tip.y+Math.sin(qa+wob)*rad*0.85;
          if(pen) c.lineTo(px,py); else { c.moveTo(px,py); pen=true; } }
        c.stroke(); }
      if(o.style==="ping"&&i%2===0){ c.fillStyle=OWN.rgb([255,255,255],0.9*a); c.beginPath(); c.arc(tip.x+d*rr,tip.y+R*0.4*k,3,0,7); c.fill(); } }
    if(t>260&&t<880){ for(let i=0;i<5;i++){ const ph=((t/320)+i/5+j*0.13)%1, px=tip.x+d*L*ph*(up?0.7:1), py=tip.y+R*0.45*ph*(up?0:1)+(i-2)*R*0.32+(up?up*L*ph*0.6:0), a=0.85*(1-ph);
        switch(o.extra){
          case "notes": c.fillStyle=OWN.rgb([60,40,30],a); c.beginPath(); c.ellipse(px,py,4,3,-0.4,0,7); c.fill(); c.fillRect(px+3,py-11,1.6,11); if(i%2) c.fillRect(px+3,py-11,6,2); break;
          case "zs": c.fillStyle=OWN.rgb([90,90,170],a); c.font=`bold ${10+ph*8}px sans-serif`; c.fillText("z",px,py-ph*12); break;
          case "static": c.fillStyle=OWN.rgb([255,255,255],a); for(let q=0;q<3;q++) c.fillRect(px+(atH(i*5+q+Math.floor(t/50))-0.5)*14,py+(atH(i+q*3+Math.floor(t/50))-0.5)*14,3,2); break;
          case "steam": SG.puff(c,px,py-ph*8,4+ph*10,a*0.7); break;
          case "bats": c.fillStyle=OWN.rgb([40,25,55],a); c.beginPath(); c.moveTo(px,py); c.quadraticCurveTo(px-6,py-6,px-10,py-1); c.quadraticCurveTo(px-5,py-1,px,py+3); c.quadraticCurveTo(px+5,py-1,px+10,py-1); c.quadraticCurveTo(px+6,py-6,px,py); c.fill(); break;
          case "sand": c.fillStyle=OWN.rgb([215,180,120],a); for(let q=0;q<4;q++){ c.beginPath(); c.arc(px+(atH(i*4+q)-0.5)*16,py+(atH(i+q*7)-0.5)*14,1.6,0,7); c.fill(); } break;
          case "sparks": OWN.zig(c,px,py,px+d*12,py+(atH(i)-0.5)*10,3,3,i+Math.floor(t/40),OWN.rgb([255,250,180],a),1.4); break;
          case "bubbles": OWN.bubble(c,px,py-ph*10,3+ph*4,C,false); break;
          case "fluff": SG.puff(c,px,py,3+ph*5,a*0.8,[250,220,240]); break;
          case "glow": atGlowA(c,px,py,6+ph*6,[255,170,60],a*0.6); break;
          case "shake": c.strokeStyle=OWN.rgb([255,240,200],a); c.lineWidth=1.6; c.beginPath(); c.arc(tip.x,tip.y,6+ph*10,-2.6,-0.5); c.stroke(); break;
          default: c.strokeStyle=OWN.rgb([255,240,200],0.7*(1-ph)); c.lineWidth=2; c.beginPath(); c.moveTo(px,py); c.lineTo(px+d*R*0.5,py+Math.sin(t/20+i)*3); c.stroke(); } } } });
  atImpact(t,440,o.heavy?0.6:0.4,0); };

/* hook them in: a listed family gets its own version, everyone else keeps the shared one */
(()=>{ if(typeof ANIM==="undefined") return;
  const wrap=(kind,TABLE,fn,atk)=>{ const K=ANIM[kind]; if(!K) return; const fx0=K.fx, atk0=K.atk;
    K.fx=function(c,t,x){ const o=x&&TABLE[x.fam]; if(!o) return fx0.call(this,c,t,x); return OWN.softLayer(c,x,cc=>fn(cc,t,x,o)); };
    if(atk) K.atk=function(t,pos){ const o=pos&&TABLE[pos.fam]; return o?atk(t,pos,o):atk0.call(this,t,pos); }; };
  wrap("bolt",OWN_BOLT,OWN.boltFx);
  { const K=ANIM.bolt; if(K){ const fx1=K.fx, atk1=K.atk;   // the second pass wins where a family has one
    K.fx=function(c,t,x){ const o=x&&OWN_BOLT2[x.fam]; return o?OWN.softLayer(c,x,cc=>o.fx(cc,t,x,o)):fx1.call(this,c,t,x); };
    K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&OWN_BOLT2[pos.fam], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; }; } }
  wrap("steam",OWN_STEAM,OWN.steamFx);
  wrap("trumpet",OWN_HORN,OWN.hornFx,(t,pos,o)=>{ const k=t<220?eo(t/220):t<860?1:1-eio(Math.min(1,(t-860)/240)), loud=t>220&&t<860;
    const P=atPose("push",k>0.5&&/zs|steam/.test(o.extra||"")?{open:0.75*k,eyes:"shut"}:{open:0.75*k});
    return {pose:P,sy:1+0.05*k*(loud?Math.abs(Math.sin(t/30)):1),rot:(o.up||0)*0.35*k*(pos.dir||1)*-1,off:[loud?Math.sin(t/11)*1.2:0,0]}; });
})();

/* a family with its own bolt draws its own landing, so the stock hit lines stay off and the burst stays small */
function OWN_OWNS(S){ if(!(S&&S.anim&&S.spec)) return false; const k=S.anim.kind, f=S.spec.family; return !!(k==="bolt"&&OWN_BOLT2[f]||k==="steam"&&OWN_STEAM[f]||k==="trumpet"&&typeof OWN_HORN2!=="undefined"&&OWN_HORN2[f]||k==="propthrow"&&typeof OWN_PROP!=="undefined"&&OWN_PROP[f]||(k==="meteor"||k==="icefall")&&typeof OWN_METEOR!=="undefined"&&OWN_METEOR[S.anim.name]||k==="drool"&&typeof OWN_DROOL!=="undefined"&&OWN_DROOL[S.anim.name]||k==="gust"&&typeof OWN_GUST!=="undefined"&&OWN_GUST[S.anim.name]||k==="wave"&&typeof OWN_WAVE!=="undefined"&&OWN_WAVE[S.anim.name]||k==="sandspray"&&typeof OWN_SAND!=="undefined"&&OWN_SAND[S.anim.name]||k==="chatter"&&typeof OWN_CHAT!=="undefined"&&OWN_CHAT[S.anim.name]||k==="wingstorm"&&typeof OWN_WING!=="undefined"&&OWN_WING[S.anim.name]||k==="flash"&&typeof OWN_FLASH!=="undefined"&&OWN_FLASH[S.anim.name]||k==="beam"&&typeof OWN_BEAM!=="undefined"&&OWN_BEAM[S.anim.name]); }

/* ---------- bolt, second pass continued: the other 25 families ---------- */
OWN.go=(a,b,k,arc=0,off=0)=>lerpP(a,b,k,arc,off);
OWN.splat=(c,x,y,r,col,k,seed,drips=3)=>{ const g=Math.min(1,k*6), a=k<0.7?1:1-(k-0.7)/0.3; if(a<=0) return; c.save(); c.globalAlpha*=a; c.fillStyle=OWN.rgb(col,0.95); c.beginPath();
  for(let i=0;i<14;i++){ const aa=i/14*Math.PI*2, rr=r*g*(i%2?0.75+0.2*atH(seed+i):1.05+0.35*atH(seed+i*3)); c[i?"lineTo":"moveTo"](x+Math.cos(aa)*rr,y+Math.sin(aa)*rr); } c.closePath(); c.fill();
  for(let i=0;i<drips;i++){ const dx=x+(i-(drips-1)/2)*r*0.6, L=r*(0.3+1.2*k)*(0.6+0.5*atH(seed+i*7)); c.fillStyle=OWN.rgb(col,0.95); c.beginPath(); c.moveTo(dx-r*0.14,y+r*0.5); c.lineTo(dx+r*0.14,y+r*0.5); c.lineTo(dx+r*0.1,y+r*0.5+L); c.arc(dx,y+r*0.5+L,r*0.12,0,Math.PI); c.fill(); }
  c.fillStyle="rgba(255,255,255,.4)"; c.beginPath(); c.ellipse(x-r*0.3,y-r*0.35,r*0.25,r*0.12,-0.4,0,7); c.fill(); c.restore(); };
OWN.pop=(c,x,y,r,col,k,n=8)=>{ if(k<=0||k>=1) return; c.strokeStyle=OWN.rgb(col,1-k); c.lineWidth=2*(1-k)+0.5; c.beginPath(); c.arc(x,y,r*(0.6+1.1*eo(k)),0,7); c.stroke();
  for(let i=0;i<n;i++){ const aa=i/n*Math.PI*2+0.3, dd=r*(0.8+1.6*eo(k)); c.fillStyle=OWN.rgb(col,1-k); c.beginPath(); c.arc(x+Math.cos(aa)*dd,y+Math.sin(aa)*dd+k*k*r*1.2,Math.max(0.8,r*0.18*(1-k)),0,7); c.fill(); } };
OWN.smoke=(c,x,y,s,k,col=[150,150,160],n=3)=>{ for(let i=0;i<n;i++){ const q=Math.max(0,k-i*0.12); if(q<=0||q>=1) continue; SG.puff(c,x+Math.sin(q*5+i)*s*0.5,y-q*s*3,s*(0.4+q*0.8),0.6*(1-q),col); } };
OWN.trail=(c,pts,col,w)=>{ if(pts.length<2) return; c.lineCap="round"; for(let i=1;i<pts.length;i++){ c.strokeStyle=OWN.rgb(col,0.8*i/pts.length); c.lineWidth=w*i/pts.length; c.beginPath(); c.moveTo(pts[i-1].x,pts[i-1].y); c.lineTo(pts[i].x,pts[i].y); c.stroke(); } };
OWN.path=(n,f)=>{ const out=[]; for(let i=0;i<=n;i++) out.push(f(i/n)); return out; };
OWN.at=(fam)=>OWN_BOLT[fam]&&OWN_BOLT[fam].at;

Object.assign(OWN_BOLT2,{
  /* Fizz: the cork pops off and spins away, and one big bubble with potion swirling inside floats over and pops in a splash */
  Fizz:{at:OWN.at("Fizz"),col:[150,235,170],
    atk:(t)=>t<120?{sy:1-0.08*eo(t/120),sx:1+0.05*eo(t/120)}:t<200?{sy:1.08,sx:0.95}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, liq=P.parts||o.col, r=S*1.15;
      if(t<520){ const k=OWN.k(t,110,520), cx=o0.x-d*S*2.2*k, cy=o0.y-S*3*Math.sin(Math.PI*Math.min(1,k*1.3))+k*k*S*2; if(k>0){ c.save(); c.translate(cx,cy); c.rotate(k*12); c.fillStyle="#b07a48"; c.fillRect(-S*0.32,-S*0.42,S*0.64,S*0.84); c.fillStyle="#d29a62"; c.fillRect(-S*0.32,-S*0.42,S*0.64,S*0.2); c.restore(); } }
      const top={x:o0.x+d*S*0.3,y:o0.y-r*1.1}, end={x:tg.x-d*R*0.2,y:tg.y-R*0.1};
      const ball=(p,rr)=>{ OWN.bubble(c,p.x,p.y,rr,OWN.mix(liq,[255,255,255],0.3),true); c.save(); c.beginPath(); c.arc(p.x,p.y,rr*0.92,0,7); c.clip(); c.strokeStyle=OWN.rgb(liq,0.8); c.lineWidth=rr*0.18;
        for(let i=0;i<2;i++){ c.beginPath(); c.arc(p.x,p.y+rr*0.1,rr*(0.35+i*0.25),t/150+i*2,t/150+i*2+2.4); c.stroke(); } c.fillStyle=OWN.rgb(liq,0.55); c.fillRect(p.x-rr,p.y+rr*0.35+Math.sin(t/80)*rr*0.08,rr*2,rr); c.restore(); };
      if(t<220){ if(t>110){ const k=eo(OWN.k(t,110,220)); ball({x:o0.x+(top.x-o0.x)*k,y:o0.y+(top.y-o0.y)*k},r*(0.2+0.8*k)); } return; }
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(top,end,eo(k),S*1.4,Math.sin(k*Math.PI*2)*S*0.5); p.y+=Math.sin(t/60)*1.5; ball(p,r*(1+0.06*Math.sin(t/45))); return; }
      const k=OWN.k(t,560,860); OWN.pop(c,end.x,end.y,r,OWN.mix(liq,[255,255,255],0.4),Math.min(1,k*2),10);
      for(let i=0;i<9;i++){ const aa=-Math.PI*0.95+i/8*Math.PI*0.9, v=R*(0.6+0.7*atH(i)); c.fillStyle=OWN.rgb(liq,1-k); c.beginPath(); c.arc(end.x+Math.cos(aa)*v*eo(k),end.y+Math.sin(aa)*v*eo(k)+k*k*R*1.6,S*0.2,0,7); c.fill(); } } },
  /* Lern: the lantern glows brighter, an ember slips out of the paper, tumbles over like a falling leaf and catches on the foe */
  Lern:{at:OWN.at("Lern"),col:[255,150,60],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, hot=OWN.rgb([255,140,50],0.95), core=OWN.rgb([255,235,160],0.95);
      const ember=(p,rot,sz)=>{ atGlowA(c,p.x,p.y,sz*3,[255,160,60],0.6); c.save(); c.translate(p.x,p.y); c.rotate(rot); c.fillStyle="#ff9a3c"; c.beginPath(); c.moveTo(0,-sz); c.lineTo(sz*0.6,0); c.lineTo(0,sz); c.lineTo(-sz*0.6,0); c.closePath(); c.fill(); c.fillStyle="#fff1b0"; c.beginPath(); c.arc(0,0,sz*0.32,0,7); c.fill(); c.restore(); };
      if(t<240) atGlowA(c,o0.x,o0.y,S*(1.5+2*eo(Math.min(1,t/200))),[255,190,90],0.55);
      if(t<220){ if(t>140){ const k=OWN.k(t,140,220); ember({x:o0.x+d*S*0.7*k,y:o0.y},k*3,S*0.8*k); } return; }
      const st={x:o0.x+d*S*0.7,y:o0.y}, hit={x:tg.x-d*R*0.3,y:tg.y-R*0.1};
      if(t<560){ const k=OWN.k(t,220,560), sway=Math.sin(k*Math.PI*3)*S*1.4, p=OWN.go(st,hit,k,S*2.4,0); p.x+=sway*0.3*d; p.y+=Math.abs(sway)*0.4;
        ember(p,Math.sin(k*Math.PI*3)*1.2,S*0.9);
        for(let i=0;i<4;i++){ const q=Math.max(0,k-i*0.06), sp=OWN.go(st,hit,q,S*2.4,0); c.fillStyle=OWN.rgb([255,200,110],0.8*(1-i/4)); c.beginPath(); c.arc(sp.x,sp.y+(k-q)*S*6,1.6,0,7); c.fill(); } return; }
      const k=OWN.k(t,560,860), h=S*1.9*(k<0.25?eo(k/0.25):1-ei((k-0.25)/0.75));
      OWN.fire(c,hit.x,hit.y+S*0.6,h,hot,core,t,1); OWN.fire(c,hit.x+S*0.45,hit.y+S*0.6,h*0.65,hot,core,t,2);
      if(k>0.55) OWN.smoke(c,hit.x,hit.y-S*0.4,S*0.7,(k-0.55)/0.45); } },
  /* Puff: the cap squashes like a bellows, five spores drift over in a loose cluster, stick to the foe and make it sneeze */
  Puff:{at:OWN.at("Puff"),col:[220,190,255],
    atk:(t)=>t<180?{sy:1-0.14*eo(t/180),sx:1+0.08*eo(t/180),pose:"effort"}:t<260?{sy:1.06,sx:0.97}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=P.parts?OWN.mix(P.parts,[255,255,255],0.2):o.col;
      const spore=(px,py,r,a=1)=>{ c.save(); c.globalAlpha*=a; c.fillStyle=OWN.rgb(col,0.95); c.beginPath(); c.arc(px,py,r,0,7); c.fill(); c.fillStyle=OWN.rgb(OWN.mix(col,[60,30,80],0.4),0.9); for(let j=0;j<3;j++){ c.beginPath(); c.arc(px+Math.cos(j*2.1)*r*0.45,py+Math.sin(j*2.1)*r*0.45,r*0.18,0,7); c.fill(); } c.restore(); };
      const end={x:tg.x-d*R*0.15,y:tg.y-R*0.15};
      for(let i=0;i<5;i++){ const off={x:Math.cos(i*1.26)*S*1.1,y:Math.sin(i*1.26)*S*0.8}, wob=Math.sin(t/90+i*2)*S*0.35;
        if(t<180) continue;
        if(t<600){ const k=OWN.k(t,180+i*12,580), p=OWN.go(o0,end,eio(k),S*1.2,0), spread=Math.min(1,k*1.6)*(1-k*0.4);
          if(t<240) SG.puff(c,o0.x,o0.y,S*(0.6+(t-180)/30),0.5*(1-(t-180)/60),col);
          spore(p.x+off.x*spread+wob,p.y+off.y*spread,S*0.42); }
        else { const k=OWN.k(t,600,860), sx=tg.x+(atH(i*4)-0.5)*R*1.3, sy=tg.y-R*0.6+atH(i*7)*R*1.0; spore(sx,sy,S*0.32,1-k*0.7); } }
      const sn=OWN.k(t,650,860); if(sn>0&&sn<1){ const fx0=tg.x+(-d)*R*0.1, fy=tg.y; for(let j=0;j<5;j++){ const aa=(j-2)*0.35, dd=R*(0.6+1.1*eo(sn)); SG.puff(c,fx0-d*Math.cos(aa)*dd*0.2,fy+Math.sin(aa)*dd*0.5-sn*R*0.2,S*(0.5+sn),0.55*(1-sn),[245,240,250]); } } } },
  /* Glop: a lump bulges out of its side and snaps free, the glob squashes and stretches as it flies, then splats and runs down the foe */
  Glop:{at:OWN.at("Glop"),col:[150,220,120],
    atk:(t,pos)=>t<220?{sx:1+0.1*Math.sin(Math.PI*t/220),sy:1-0.06*Math.sin(Math.PI*t/220),off:[(pos.dir||1)*3*Math.sin(Math.PI*t/220),0]}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=P.body||o.col, r=S*0.95;
      const glob=(p,ang,sq)=>{ OWN.blob(c,p.x,p.y,r,ang,col,sq); };
      const out={x:o0.x+d*S*1.6,y:o0.y-S*0.2};
      if(t<230){ const k=eo(Math.min(1,t/220)), p={x:o0.x+(out.x-o0.x)*k,y:o0.y+(out.y-o0.y)*k}, neck=Math.max(0.15,1-k*0.9);
        c.strokeStyle=OWN.rgb(col,1); c.lineCap="round"; c.lineWidth=r*1.3*neck; c.beginPath(); c.moveTo(o0.x,o0.y); c.lineTo(p.x,p.y); c.stroke(); glob(p,0,0.15*k); return; }
      const end={x:tg.x-d*R*0.35,y:tg.y-R*0.05};
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(out,end,k,S*2,0), q=OWN.go(out,end,Math.min(1,k+0.02),S*2,0), ang=Math.atan2(q.y-p.y,q.x-p.x), sq=0.25*Math.sin(k*Math.PI*4);
        if(k<0.12){ c.fillStyle=OWN.rgb(col,1-k/0.12); c.beginPath(); c.arc(out.x-d*S*0.4,out.y,r*0.35,0,7); c.fill(); }
        glob(p,ang,sq); return; }
      OWN.splat(c,end.x,end.y,r*1.25,col,OWN.k(t,560,900),11,4); } },
  /* Burr: it digs its paws into the ground and flings a clump of mud overhead that breaks into clods mid-air */
  Burr:{at:OWN.at("Burr"),col:[140,95,60],
    atk:(t,pos)=>t<200?{pose:"crouch",rot:0.12*(pos.dir||1)*Math.sin(t/25),off:[0,2]}:t<300?{pose:"slamup",arc:-6}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg}=P, mud=[125,85,55], dark=[95,62,40];
      if(t<220){ for(let i=0;i<5;i++){ const q=((t/220)*2+i*0.2)%1; c.fillStyle=OWN.rgb(i%2?mud:dark,1-q); c.beginPath(); c.arc(o0.x-d*S*(0.3+q*1.2)+(atH(i)-0.5)*S,sg-S*1.6*Math.sin(Math.PI*q),S*0.2,0,7); c.fill(); } return; }
      const st={x:o0.x,y:sg-S}, end={x:tg.x-d*R*0.2,y:tg.y-R*0.1};
      if(t<560){ const k=OWN.k(t,220,560);
        if(k<0.4){ const p=OWN.go(st,end,k,R*1.5,0); OWN.blob(c,p.x,p.y,S*1.0,k*8,mud,0.1,false); return; }
        for(let i=0;i<4;i++){ const q=Math.min(1,k+(i-1.5)*0.03), p=OWN.go(st,end,q,R*1.5,(i-1.5)*S*0.9*(k-0.4)); OWN.blob(c,p.x,p.y,S*(0.55-0.05*i),q*8+i,i%2?mud:dark,0.1,false); } return; }
      for(let i=0;i<4;i++){ const k=OWN.k(t,560+i*45,900); if(k<=0) continue; OWN.splat(c,end.x+(i-1.5)*R*0.35,end.y+(atH(i)-0.5)*R*0.6,S*0.6,i%2?mud:dark,k,i*5,1);
        if(k<0.4) for(let j=0;j<3;j++){ c.fillStyle=OWN.rgb(dark,1-k/0.4); c.beginPath(); c.arc(end.x+(i-1.5)*R*0.35+Math.cos(j*2.1)*S*(0.5+k*3),end.y+Math.sin(j*2.1)*S*(0.5+k*2),1.6,0,7); c.fill(); } } } },
  /* Wick: its flame flares and the rim melts, three wax drops flick over in a quick arc and harden on the foe */
  Wick:{at:OWN.at("Wick"),col:[255,240,210],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, wax=P.body?OWN.mix(P.body,[255,250,235],0.55):o.col;
      if(t<260){ const k=Math.min(1,t/200); OWN.fire(c,o0.x,o0.y+S*0.3,S*(1.2+1.4*eo(k)),OWN.rgb([255,150,50],0.9),OWN.rgb([255,240,170],0.95),t,0); }
      const end={x:tg.x-d*R*0.3,y:tg.y-R*0.2};
      for(let i=0;i<3;i++){ const st={x:o0.x+d*S*(0.4+i*0.25),y:o0.y+S*0.4}, t0=180+i*40;
        if(t<t0) continue;
        if(t<t0+340){ const k=OWN.k(t,t0,t0+340), p=OWN.go(st,{x:end.x,y:end.y+(i-1)*R*0.35},k,S*2.4,0), q=OWN.go(st,{x:end.x,y:end.y+(i-1)*R*0.35},Math.min(1,k+0.03),S*2.4,0);
          atGlowA(c,p.x,p.y,S*1.4,[255,190,110],0.35*(1-k)); OWN.drop(c,p.x,p.y,S*0.5,Math.atan2(q.y-p.y,q.x-p.x)+Math.PI,OWN.mix(wax,[255,200,120],(1-k)*0.4)); continue; }
        const k=OWN.k(t,t0+340,900), bx=end.x, by=end.y+(i-1)*R*0.35, a=k<0.8?1:1-(k-0.8)/0.2; c.save(); c.globalAlpha*=a;
        c.fillStyle=OWN.rgb(OWN.mix(wax,[200,180,150],Math.min(1,k*2)*0.3),1); c.beginPath(); c.ellipse(bx,by,S*0.55,S*0.42,0,0,7); c.fill(); c.beginPath(); c.ellipse(bx,by+S*0.35,S*0.15,S*0.35*Math.min(1,k*3),0,0,7); c.fill();
        c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(bx-S*0.15,by-S*0.15,S*0.17,S*0.09,-0.4,0,7); c.fill(); c.restore();
        if(k<0.5) OWN.smoke(c,bx,by-S*0.3,S*0.4,k*2,[230,230,235],2); } } },
  /* Lumo: its tail pulses three times, then a thin needle of light zips straight across and pops in a star */
  Lumo:{at:OWN.at("Lumo"),col:[255,240,140],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, end={x:tg.x-d*R*0.2,y:tg.y-R*0.1};
      if(t<420){ const pulse=Math.max(0,Math.sin(Math.PI*((t%140)/140))), n=Math.floor(t/140); atGlowA(c,o0.x,o0.y,S*(1.4+1.2*pulse+n*0.4),col,0.5+0.4*pulse);
        if(t>300){ const k=OWN.k(t,300,420); for(let i=0;i<6;i++){ const aa=i/6*7+t/60, rr=S*2.4*(1-k); c.fillStyle=OWN.rgb(col,k); c.beginPath(); c.arc(o0.x+Math.cos(aa)*rr,o0.y+Math.sin(aa)*rr,1.6,0,7); c.fill(); } } return; }
      if(t<560){ const k=ei(OWN.k(t,420,560)), hx=o0.x+(end.x-o0.x)*k, hy=o0.y+(end.y-o0.y)*k, tl=Math.max(0,k-0.45), tx=o0.x+(end.x-o0.x)*tl, ty=o0.y+(end.y-o0.y)*tl;
        const g=c.createLinearGradient(tx,ty,hx,hy); g.addColorStop(0,OWN.rgb(col,0)); g.addColorStop(1,OWN.rgb(col,0.95)); c.strokeStyle=g; c.lineCap="round"; c.lineWidth=S*0.32; c.beginPath(); c.moveTo(tx,ty); c.lineTo(hx,hy); c.stroke();
        c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=S*0.12; c.beginPath(); c.moveTo((tx+hx)/2,(ty+hy)/2); c.lineTo(hx,hy); c.stroke(); atGlowA(c,hx,hy,S*1.2,col,0.8); return; }
      const k=OWN.k(t,560,820); if(k>=1) return; OWN.star(c,end.x,end.y,S*(1+2.2*eo(k)),OWN.rgb(col,1-k),k*1.5); OWN.star(c,end.x,end.y,S*(0.5+1*eo(k)),OWN.rgb([255,255,255],1-k),-k);
      for(let i=0;i<5;i++){ const aa=i/5*7+0.5, dd=R*(0.4+0.9*eo(k)); OWN.star(c,end.x+Math.cos(aa)*dd,end.y+Math.sin(aa)*dd,S*0.35*(1-k),OWN.rgb(col,1-k),k*4); } } },
  /* Inky: the nib flicks like a pen stroke, a brush stroke of ink droplets fans across and leaves a dripping splatter */
  Inky:{at:OWN.at("Inky"),col:[40,40,70],
    atk:(t,pos)=>t<140?{rot:-0.2*(pos.dir||1)*eo(t/140)}:t<260?{rot:0.18*(pos.dir||1)*(1-OWN.k(t,140,260))}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, ink=P.parts&&Math.max(...P.parts)<140?P.parts:[35,35,70], end={x:tg.x-d*R*0.25,y:tg.y-R*0.1};
      if(t<200){ const k=t/200; c.fillStyle=OWN.rgb(ink,1); c.beginPath(); c.arc(o0.x,o0.y+S*0.2,S*0.35*eo(k),0,7); c.fill(); return; }
      const curve=(q)=>OWN.go(o0,end,q,S*1.6,Math.sin(q*Math.PI)*-S*0.8);
      if(t<600){ const k=OWN.k(t,180,560), head=eo(Math.min(1,k)), tail=Math.max(0,head-0.55)*(t>520?1+OWN.k(t,520,600)*2:1);
        c.lineCap="round"; for(let i=0;i<24;i++){ const q=tail+(head-tail)*i/23, p=curve(q), w=S*0.55*Math.sin(Math.PI*i/23)+0.8; c.fillStyle=OWN.rgb(ink,0.95); c.beginPath(); c.arc(p.x,p.y,w,0,7); c.fill(); }
        for(let i=0;i<6;i++){ const q=Math.max(0,head-0.08*i), p=curve(q); c.fillStyle=OWN.rgb(ink,0.85); c.beginPath(); c.arc(p.x+(atH(i)-0.5)*S*1.2,p.y+(atH(i*3)-0.5)*S*1.2,S*0.14,0,7); c.fill(); }
        if(t<560) return; }
      const k=OWN.k(t,560,900); OWN.splat(c,end.x,end.y,S*1.15,ink,k,23,3);
      for(let i=0;i<7;i++){ const aa=i/7*7, dd=S*(1.4+0.8*atH(i))*Math.min(1,k*5); c.fillStyle=OWN.rgb(ink,(1-k)*0.9); c.beginPath(); c.arc(end.x+Math.cos(aa)*dd,end.y+Math.sin(aa)*dd,S*0.12,0,7); c.fill(); } } },
  /* Trundle: it spits slime that stays joined to its mouth by a stretching strand, the strand snaps and the slime sticks */
  Trundle:{at:OWN.at("Trundle"),col:[170,230,120],
    atk:(t,pos)=>t<160?{rot:-0.08*(pos.dir||1)*eo(t/160),sy:0.95}:t<260?{rot:0.06*(pos.dir||1),sy:1.04}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=[160,225,110], end={x:tg.x-d*R*0.3,y:tg.y-R*0.05};
      if(t<220){ const k=OWN.k(t,80,220); if(k>0) OWN.blob(c,o0.x+d*S*0.3,o0.y,S*0.5*eo(k),0,col,0.1); return; }
      const snap=OWN.k(t,470,560);
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(o0,end,eo(k),S*1.2,0);
        if(snap<=0){ c.strokeStyle=OWN.rgb(col,0.9); c.lineWidth=Math.max(1,S*0.35*(1-k)); c.beginPath(); c.moveTo(o0.x,o0.y); const m=OWN.go(o0,p,0.5,S*0.6+k*S,0); c.quadraticCurveTo(m.x,m.y,p.x,p.y); c.stroke(); }
        else { for(const [a,b,sd] of [[o0,0.25,1],[p,0.25,-1]]){ const L=S*3*(1-snap); c.strokeStyle=OWN.rgb(col,0.9*(1-snap)); c.lineWidth=1.4; c.beginPath(); c.moveTo(a.x,a.y); c.quadraticCurveTo(a.x-d*sd*L*0.5,a.y+L*0.4,a.x-d*sd*L,a.y+L*0.2); c.stroke(); } }
        OWN.blob(c,p.x,p.y,S*0.75,p.ang||0,col,0.15); return; }
      const k=OWN.k(t,560,900); OWN.splat(c,end.x,end.y,S*1.0,col,k,31,3);
      for(let i=0;i<3;i++){ const L=R*0.5*Math.min(1,k*2)*(0.6+atH(i)); c.strokeStyle=OWN.rgb(col,0.9*(1-k)); c.lineWidth=1.3; c.beginPath(); c.moveTo(end.x+(i-1)*S*0.5,end.y); c.quadraticCurveTo(end.x+(i-1)*S*0.9,end.y+L*0.6,end.x+(i-1)*S*0.6,end.y+L); c.stroke(); } } },
  /* Clank: its wind-up key spins fast, a crackling spark ball flies over and bursts, throwing off a bolt and a nut */
  Clank:{at:OWN.at("Clank"),col:[255,225,90],
    atk:(t)=>t<220?{off:[Math.sin(t/9)*1.2,Math.cos(t/11)*0.8],pose:"effort"}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, end={x:tg.x-d*R*0.2,y:tg.y-R*0.1}, key=OWN.pt(P.s,tg,[0.0,0.35]);
      if(t<240){ for(let i=0;i<3;i++){ const a0=t/30+i*2.1; c.strokeStyle=OWN.rgb([230,230,240],0.8); c.lineWidth=2; c.beginPath(); c.arc(key.x,key.y,S*(1+i*0.25),a0,a0+1.2); c.stroke(); }
        for(let i=0;i<4;i++){ const q=((t/90)+i*0.25)%1; OWN.zig(c,o0.x,o0.y,o0.x+Math.cos(i*1.6)*S*1.6*q,o0.y-S*1.4*q,3,S*0.25,i+Math.floor(t/50),OWN.rgb(col,1-q),1.4); } return; }
      const ballAt=(p)=>{ atGlowA(c,p.x,p.y,S*2,col,0.6); c.fillStyle="#fff7c8"; c.beginPath(); c.arc(p.x,p.y,S*0.45,0,7); c.fill();
        for(let i=0;i<4;i++){ const aa=i/4*7+t/40, r1=S*0.5, r2=S*(1.1+0.3*atH(i+Math.floor(t/40))); OWN.zig(c,p.x+Math.cos(aa)*r1,p.y+Math.sin(aa)*r1,p.x+Math.cos(aa+0.4)*r2,p.y+Math.sin(aa+0.4)*r2,3,S*0.2,i+Math.floor(t/35),OWN.rgb(col,0.95),1.5); } };
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(o0,end,eio(k),S*1.6,Math.sin(k*Math.PI*4)*S*0.3); ballAt(p); return; }
      const k=OWN.k(t,560,860); if(k<0.5){ atGlowA(c,end.x,end.y,R*(0.6+k*1.2),col,0.9*(1-k*2)); for(let i=0;i<6;i++){ const aa=i/6*7; OWN.zig(c,end.x,end.y,end.x+Math.cos(aa)*R*(0.6+k*1.4),end.y+Math.sin(aa)*R*(0.6+k*1.4),4,S*0.3,i*3,OWN.rgb(col,1-k*2),2); } }
      const part=(i,draw)=>{ const vx=(i?1:-0.6)*-d*R*1.1, px=end.x+vx*k, py=end.y-R*1.4*Math.sin(Math.PI*Math.min(1,k*1.2))+k*k*R*1.2; c.save(); c.translate(px,py); c.rotate(k*9*(i?1:-1)); c.globalAlpha*=k<0.8?1:1-(k-0.8)/0.2; draw(); c.restore(); };
      part(0,()=>{ c.fillStyle="#9aa3b5"; c.beginPath(); for(let j=0;j<6;j++){ const aa=j/6*7; c[j?"lineTo":"moveTo"](Math.cos(aa)*S*0.5,Math.sin(aa)*S*0.5); } c.fill(); c.fillStyle="#3b4050"; c.beginPath(); c.arc(0,0,S*0.2,0,7); c.fill(); });
      part(1,()=>{ c.fillStyle="#b9c0cf"; c.fillRect(-S*0.12,-S*0.6,S*0.24,S*1.1); c.fillStyle="#8d95a8"; c.fillRect(-S*0.32,-S*0.75,S*0.64,S*0.25); }); } },
  /* Swirl: the globe shakes and the snow inside swirls, a snowball pops out of the top trailing flakes and bursts in a puff of snow */
  Swirl:{at:OWN.at("Swirl"),col:[235,245,255],
    atk:(t)=>t<220?{rot:Math.sin(t/18)*0.12}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, mid=OWN.pt(P.s,tg,[0.5,0.4]), end={x:tg.x-d*R*0.2,y:tg.y-R*0.15}, top={x:o0.x,y:o0.y-S*0.6};
      const flake=(px,py,r,a)=>{ c.strokeStyle=OWN.rgb([255,255,255],a); c.lineWidth=1.2; for(let j=0;j<3;j++){ const aa=j*Math.PI/3+t/200; c.beginPath(); c.moveTo(px-Math.cos(aa)*r,py-Math.sin(aa)*r); c.lineTo(px+Math.cos(aa)*r,py+Math.sin(aa)*r); c.stroke(); } };
      if(t<260) for(let i=0;i<10;i++){ const aa=i/10*7+t/50, rr=S*(0.6+0.9*atH(i)); flake(mid.x+Math.cos(aa)*rr,mid.y+Math.sin(aa)*rr*0.7,S*0.18,0.9); }
      const sb=(p,r,rot)=>{ c.fillStyle="#ffffff"; c.beginPath(); c.arc(p.x,p.y,r,0,7); c.fill(); c.fillStyle="rgba(170,200,235,.6)"; c.beginPath(); c.arc(p.x+r*0.25,p.y+r*0.25,r*0.7,0.3,2.6); c.fill(); c.strokeStyle="rgba(170,200,235,.7)"; c.lineWidth=1; c.beginPath(); c.arc(p.x,p.y,r*0.55,rot,rot+1.5); c.stroke(); };
      if(t<220){ if(t>150){ const k=OWN.k(t,150,220); sb({x:top.x,y:o0.y-S*0.6*k},S*0.75*k,0); } return; }
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(top,end,k,S*2.6,0); for(let i=1;i<5;i++){ const q=OWN.go(top,end,Math.max(0,k-i*0.05),S*2.6,0); flake(q.x,q.y+Math.sin(t/60+i)*3,S*0.2,0.8*(1-i/5)); } sb(p,S*0.8,k*10); return; }
      const k=OWN.k(t,560,900); SG.puff(c,end.x,end.y,S*(1+2*eo(k)),0.9*(1-k),[245,250,255]); for(let i=0;i<10;i++) flake(end.x+(atH(i)-0.5)*R*1.8+Math.sin(t/90+i)*4,end.y-R*0.6+atH(i*3)*R*0.4+k*R*1.1,S*0.2,1-k); } },
  /* Magna: a zap jumps between its two poles, then a red and a blue bolt twist round each other across to the foe and crackle over it */
  Magna:{at:OWN.at("Magna"),col:[255,90,90],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, red=[255,85,85], blue=[90,150,255], p1=OWN.pt(P.s,tg,[0.15,0.95]), p2=OWN.pt(P.s,tg,[0.95,0.95]), end={x:tg.x-d*R*0.2,y:tg.y-R*0.1};
      const st={x:(p1.x+p2.x)/2+d*S*0.6,y:(p1.y+p2.y)/2};
      if(t<240){ OWN.zig(c,p1.x,p1.y,p2.x,p2.y,7,S*0.5,Math.floor(t/40),OWN.rgb([255,255,255],0.95),2.2); OWN.zig(c,p1.x,p1.y,p2.x,p2.y,7,S*0.7,Math.floor(t/40)+9,OWN.rgb(t%80<40?red:blue,0.9),1.4);
        atGlowA(c,st.x,st.y,S*(0.8+t/120),[230,200,255],0.6); return; }
      if(t<560){ const k=OWN.k(t,220,560), head=eo(k), tail=Math.max(0,head-0.4);
        for(const [col,ph] of [[red,0],[blue,Math.PI]]){ c.strokeStyle=OWN.rgb(col,0.95); c.lineWidth=S*0.22; c.lineCap="round"; c.beginPath();
          for(let i=0;i<=20;i++){ const q=tail+(head-tail)*i/20, p=OWN.go(st,end,q,0,Math.sin(q*Math.PI*6+ph-t/40)*S*0.7); c[i?"lineTo":"moveTo"](p.x,p.y); } c.stroke(); }
        const hp=OWN.go(st,end,head,0,0); atGlowA(c,hp.x,hp.y,S*1.4,[255,255,255],0.7); return; }
      const k=OWN.k(t,560,860); for(let i=0;i<5;i++){ const aa=i/5*7+Math.floor(t/45), r1=R*0.4, r2=R*(0.9+0.3*atH(i+Math.floor(t/45)));
        OWN.zig(c,tg.x+Math.cos(aa)*r1,tg.y+Math.sin(aa)*r1,tg.x+Math.cos(aa+0.5)*r2,tg.y+Math.sin(aa+0.5)*r2,4,S*0.3,i+Math.floor(t/45)*3,OWN.rgb(i%2?red:blue,1-k),1.8); } } }
});

Object.assign(OWN_BOLT2,{
  /* Helm: the porthole fogs up, then a chain of three bubbles, each bigger than the last, floats over and pops in a row */
  Helm:{at:OWN.at("Helm"),col:[170,225,255],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, end={x:tg.x-d*R*0.2,y:tg.y-R*0.1};
      if(t<260) SG.puff(c,o0.x,o0.y,S*(0.5+0.7*eo(Math.min(1,t/200))),0.7*(1-OWN.k(t,200,260)),[235,245,250]);
      for(let i=0;i<3;i++){ const r=S*(0.4+i*0.22), t0=200+i*55, t1=500+i*25;
        if(t<t0) continue;
        if(t<t1+40){ const k=OWN.k(t,t0,t1), p=OWN.go({x:o0.x+d*S*0.5,y:o0.y},end,eo(k),S*1.1,Math.sin(t/70+i)*S*0.25); OWN.bubble(c,p.x,p.y,r*(k<0.15?k/0.15:1),col,false); continue; }
        OWN.pop(c,end.x+(i-1)*S*0.4,end.y,r,col,OWN.k(t,t1+40,t1+260),7); } } },
  /* Bloop: its tentacles whip forward, a stinger flies over trailing a thin tentacle thread, and the foe twitches with a small shock */
  Bloop:{at:OWN.at("Bloop"),col:[255,170,230],
    atk:(t,pos)=>t<200?{rot:-0.1*(pos.dir||1)*eo(t/200)}:t<300?{rot:0.08*(pos.dir||1)}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=P.parts||o.col, end={x:tg.x-d*R*0.35,y:tg.y-R*0.05};
      const tent=(x0,y0,x1,y1,ph,a,w)=>{ c.strokeStyle=OWN.rgb(col,a); c.lineWidth=w; c.lineCap="round"; c.beginPath(); for(let i=0;i<=14;i++){ const q=i/14, p=OWN.go({x:x0,y:y0},{x:x1,y:y1},q,0,Math.sin(q*9+ph)*S*0.3*q); c[i?"lineTo":"moveTo"](p.x,p.y); } c.stroke(); };
      if(t<240){ const k=eo(Math.min(1,t/200)); for(let j=0;j<3;j++) tent(o0.x+(j-1)*S*0.35,o0.y-S*0.3,o0.x+d*S*(0.8+1.6*k),o0.y+S*(0.2+0.4*j)-S*k*0.6,t/40+j,0.9,S*0.18); return; }
      const sting=(p,ang)=>{ c.save(); c.translate(p.x,p.y); c.rotate(ang); c.fillStyle="#fff2fb"; c.beginPath(); c.moveTo(S*0.9,0); c.lineTo(-S*0.3,-S*0.28); c.lineTo(-S*0.15,0); c.lineTo(-S*0.3,S*0.28); c.closePath(); c.fill(); c.strokeStyle=OWN.rgb(col,1); c.lineWidth=1.4; c.stroke(); c.restore(); };
      if(t<560){ const k=eo(OWN.k(t,220,560)), p=OWN.go(o0,end,k,S*0.6,0); tent(o0.x,o0.y,p.x,p.y,t/30,0.75,1.6); sting(p,Math.atan2(end.y-o0.y,end.x-o0.x)); return; }
      const k=OWN.k(t,560,860); if(k<0.3) tent(o0.x,o0.y,end.x,end.y,t/30,0.75*(1-k/0.3),1.4);
      for(let i=0;i<4;i++){ const aa=i/4*7+Math.floor(t/50), xx=tg.x+Math.cos(aa)*R*0.9, yy=tg.y+Math.sin(aa)*R*0.7; OWN.zig(c,xx,yy,xx+Math.cos(aa)*S*0.9,yy+Math.sin(aa)*S*0.9,3,S*0.25,i+Math.floor(t/50),OWN.rgb([255,240,120],1-k),1.6); } } },
  /* Suds: it rubs itself into lather, blows a ring of small bubbles that floats over slowly, turning, and they pop one by one */
  Suds:{at:OWN.at("Suds"),col:[200,235,255],
    atk:(t)=>t<220?{rot:Math.sin(t/20)*0.08,sx:1+0.03*Math.sin(t/15)}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, end={x:tg.x-d*R*0.1,y:tg.y-R*0.15};
      if(t<260){ const k=Math.min(1,t/200), a=1-OWN.k(t,200,260); for(let i=0;i<9;i++){ const aa=i/9*7, rr=S*0.7*k*(0.5+atH(i)*0.5); OWN.bubble(c,o0.x+Math.cos(aa)*rr,o0.y+Math.sin(aa)*rr*0.5,S*(0.18+0.12*atH(i*2))*k*a+0.1,[250,252,255],false); } }
      if(t<200) return;
      const n=6, cen=t<560?OWN.go(o0,end,eio(OWN.k(t,200,560)),S*1.2,0):end, ringR=S*(t<560?0.4+0.8*OWN.k(t,200,320):1.2), spin=t/260;
      for(let i=0;i<n;i++){ const aa=i/n*7+spin, bx=cen.x+Math.cos(aa)*ringR, by=cen.y+Math.sin(aa)*ringR*0.8, pt=560+i*45;
        if(t<pt) OWN.bubble(c,bx,by+Math.sin(t/80+i)*1.5,S*0.32,col,true); else OWN.pop(c,bx,by,S*0.32,[220,240,255],OWN.k(t,pt,pt+180),6); } } },
  /* Lava: a blob rises inside the lamp, pops out of the top in a high smoking arc, splats on the foe and steams */
  Lava:{at:OWN.at("Lava"),col:[255,110,60],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=P.parts||o.col, mid=OWN.pt(P.s,tg,[0.5,0.7]), end={x:tg.x-d*R*0.25,y:tg.y-R*0.15};
      const blob=(p,r,ang,sq)=>{ atGlowA(c,p.x,p.y,r*2.6,col,0.5); OWN.blob(c,p.x,p.y,r,ang,OWN.mix(col,[255,220,120],0.25),sq); };
      if(t<220){ const k=eio(Math.min(1,t/220)); blob({x:mid.x+(o0.x-mid.x)*k,y:mid.y+(o0.y-S*0.4-mid.y)*k},S*0.55*(0.7+0.3*k),-Math.PI/2,0.25*Math.sin(t/40)); return; }
      const top={x:o0.x,y:o0.y-S*0.6};
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(top,end,k,R*2.4,0), q=OWN.go(top,end,Math.min(1,k+0.03),R*2.4,0);
        for(let i=1;i<6;i++){ const s0=OWN.go(top,end,Math.max(0,k-i*0.06),R*2.4,0); SG.puff(c,s0.x,s0.y-i*2,S*(0.25+i*0.08),0.45*(1-i/6),[120,110,110]); }
        blob(p,S*0.7,Math.atan2(q.y-p.y,q.x-p.x),0.2); return; }
      const k=OWN.k(t,560,900); atGlowA(c,end.x,end.y,R*(1-k*0.5),col,0.5*(1-k)); OWN.splat(c,end.x,end.y,S*1.0,OWN.mix(col,[255,220,120],0.2*(1-k)),k,41,3); OWN.smoke(c,end.x,end.y-S*0.5,S*0.8,k,[235,235,240],4); } },
  /* Vampire: its cape sweeps across, a shadow bat flaps over to the foe and breaks into dark mist */
  Vampire:{at:OWN.at("Vampire"),col:[90,40,110],
    atk:(t,pos)=>t<220?{rot:0.15*(pos.dir||1)*Math.sin(Math.PI*t/220),pose:"cast"}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=[70,30,90], end={x:tg.x-d*R*0.2,y:tg.y-R*0.15};
      const bat=(p,s,flap,a=1)=>{ c.save(); c.globalAlpha*=a; c.translate(p.x,p.y); c.scale(d,1); atGlowA(c,0,0,s*2.4,[150,60,170],0.35); c.fillStyle=OWN.rgb(col,0.95);
        const w=Math.sin(flap)*0.7; c.beginPath(); c.moveTo(0,-s*0.2); c.quadraticCurveTo(-s*0.9,-s*(0.7+w),-s*1.8,-s*w); c.quadraticCurveTo(-s*1.3,s*0.1,-s*1.0,s*0.15); c.quadraticCurveTo(-s*0.7,s*0.05,-s*0.5,s*0.3); c.quadraticCurveTo(-s*0.3,s*0.1,0,s*0.35);
        c.quadraticCurveTo(s*0.3,s*0.1,s*0.5,s*0.3); c.quadraticCurveTo(s*0.7,s*0.05,s*1.0,s*0.15); c.quadraticCurveTo(s*1.3,s*0.1,s*1.8,-s*w); c.quadraticCurveTo(s*0.9,-s*(0.7+w),0,-s*0.2); c.fill();
        c.beginPath(); c.arc(0,0,s*0.35,0,7); c.fill(); c.fillStyle="#ff5a7a"; c.beginPath(); c.arc(s*0.12,-s*0.05,s*0.07,0,7); c.arc(-s*0.08,-s*0.05,s*0.07,0,7); c.fill(); c.restore(); };
      if(t<220){ const k=Math.min(1,t/220); for(let i=0;i<5;i++){ const aa=i/5*7+t/60, rr=S*1.6*(1-k); SG.puff(c,o0.x+d*S*0.6+Math.cos(aa)*rr,o0.y+Math.sin(aa)*rr,S*0.4,0.6*k,[80,40,100]); } if(k>0.6) bat({x:o0.x+d*S*0.6,y:o0.y},S*0.8*(k-0.6)/0.4,t/35); return; }
      if(t<560){ const k=OWN.k(t,220,560), st={x:o0.x+d*S*0.6,y:o0.y}, p=OWN.go(st,end,k,S*1.6,Math.sin(k*Math.PI*3)*S*0.6);
        for(let i=1;i<5;i++){ const q=OWN.go(st,end,Math.max(0,k-i*0.05),S*1.6,Math.sin(Math.max(0,k-i*0.05)*Math.PI*3)*S*0.6); SG.puff(c,q.x,q.y,S*(0.35-i*0.05),0.35*(1-i/5),[90,50,110]); }
        bat(p,S*0.8,t/35); return; }
      const k=OWN.k(t,560,880); if(k<0.25) bat(end,S*0.8*(1+k),t/35,1-k/0.25);
      for(let i=0;i<8;i++){ const aa=i/8*7, dd=R*(0.2+0.9*eo(k)); SG.puff(c,end.x+Math.cos(aa)*dd,end.y+Math.sin(aa)*dd*0.7-k*R*0.3,S*(0.5+0.6*k),0.7*(1-k),[70,35,90]); } } },
  /* Kitsune: three blue flames circle its tails, fly out one after another in a spiral and burst on the foe one by one */
  Kitsune:{at:OWN.at("Kitsune"),col:[120,190,255],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, outer=OWN.rgb([110,170,255],0.9), inner=OWN.rgb([225,245,255],0.95), end={x:tg.x-d*R*0.15,y:tg.y-R*0.1};
      const wisp=(p,s,ang)=>{ atGlowA(c,p.x,p.y,s*2.4,[120,180,255],0.55); OWN.flame(c,p.x,p.y,s,ang,outer,inner,t); };
      for(let i=0;i<3;i++){ const ph=i/3*Math.PI*2, t0=220+i*70, t1=t0+300;
        if(t<t0){ const k=Math.min(1,t/160), aa=ph+t/90, p={x:o0.x+Math.cos(aa)*S*1.1,y:o0.y+Math.sin(aa)*S*0.6-S*0.2}; wisp(p,S*0.75*k,aa+Math.PI/2); continue; }
        if(t<t1){ const k=OWN.k(t,t0,t1), st={x:o0.x+Math.cos(ph+t0/90)*S*1.1,y:o0.y+Math.sin(ph+t0/90)*S*0.6-S*0.2}, base=OWN.go(st,end,eo(k),S*(1.5+i*0.6),0), sp=(1-k)*S*1.2, aa=k*12+ph;
          const p={x:base.x+Math.cos(aa)*sp,y:base.y+Math.sin(aa)*sp*0.7}, q=OWN.go(st,end,Math.min(1,eo(k)+0.04),S*(1.5+i*0.6),0); wisp(p,S*0.85,Math.atan2(q.y-p.y,q.x-p.x)+Math.PI); continue; }
        const k=OWN.k(t,t1,t1+220), hx=end.x+(i-1)*R*0.35, hy=end.y+(i===1?-R*0.25:R*0.1); if(k<1){ atGlowA(c,hx,hy,S*(1+2*k),[130,190,255],0.8*(1-k)); for(let j=0;j<5;j++){ const aa=j/5*7, dd=S*(0.4+1.4*eo(k)); OWN.flame(c,hx+Math.cos(aa)*dd,hy+Math.sin(aa)*dd,S*0.3*(1-k),aa+Math.PI,outer,inner,t); } } } } },
  /* Naga: its hood flares, a green bubbling spit arcs over and the acid sizzles on the foe with smoke rising */
  Naga:{at:OWN.at("Naga"),col:[150,235,90],
    atk:(t)=>t<220?{sx:1+0.1*eo(Math.min(1,t/140)),sy:1+0.04*eo(Math.min(1,t/140)),pose:"cast"}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=[150,230,80], end={x:tg.x-d*R*0.3,y:tg.y-R*0.05};
      const bub=(px,py,r)=>{ c.strokeStyle=OWN.rgb([220,255,180],0.9); c.lineWidth=1; c.beginPath(); c.arc(px,py,r,0,7); c.stroke(); };
      if(t<220){ const k=OWN.k(t,60,220); if(k>0){ OWN.blob(c,o0.x+d*S*0.3,o0.y,S*0.45*k,0,col,0.1); bub(o0.x+d*S*0.4,o0.y-S*0.3*k,S*0.12); } return; }
      if(t<560){ const k=OWN.k(t,220,560);
        for(let i=0;i<4;i++){ const q=Math.max(0,k-i*0.07), p=OWN.go(o0,end,q,S*1.8,0), r=S*(0.55-i*0.11); OWN.blob(c,p.x,p.y,r,0,col,0.12,i===0); if(i===0) for(let j=0;j<3;j++) bub(p.x+Math.cos(t/40+j*2)*r*0.5,p.y+Math.sin(t/40+j*2)*r*0.5,r*0.22); } return; }
      const k=OWN.k(t,560,900); OWN.splat(c,end.x,end.y,S*0.9,col,k,51,3);
      for(let i=0;i<4;i++){ const q=((k*2.2)+i*0.25)%1; bub(end.x+(atH(i)-0.5)*S*1.4,end.y-S*0.2-q*S*0.8,S*0.15*(1-q)+0.5); }
      OWN.smoke(c,end.x,end.y-S*0.5,S*0.7,k,[205,225,190],4); } },
  /* Yeti: it scoops snow off the ground and packs it, throws a big spinning snowball overhand, and it breaks into chunks, leaving snow on the foe's head */
  Yeti:{at:OWN.at("Yeti"),col:[240,248,255],
    atk:(t,pos)=>t<120?{pose:"crouch",rot:0.12*(pos.dir||1)*eo(t/120),off:[0,3]}:t<220?{pose:"slamup",rot:-0.15*(pos.dir||1),arc:-4}:t<320?{pose:"push",rot:0.1*(pos.dir||1)}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,head}=P, end={x:tg.x-d*R*0.1,y:tg.y-R*0.25}, r=S*0.85;
      const sb=(p,rr,rot)=>{ c.fillStyle="#ffffff"; c.beginPath(); c.arc(p.x,p.y,rr,0,7); c.fill(); c.fillStyle="rgba(165,195,235,.55)"; c.beginPath(); c.arc(p.x+rr*0.22,p.y+rr*0.22,rr*0.75,0.2,2.7); c.fill();
        c.strokeStyle="rgba(150,180,225,.7)"; c.lineWidth=1.2; c.beginPath(); c.arc(p.x,p.y,rr*0.6,rot,rot+1.6); c.stroke(); c.beginPath(); c.arc(p.x,p.y,rr*0.35,rot+3,rot+4.2); c.stroke(); };
      const low={x:o0.x+d*S*0.4,y:sg-r*0.6}, high={x:o0.x-d*S*0.3,y:o0.y-S*1.6};
      if(t<120){ const k=t/120; for(let i=0;i<4;i++){ c.fillStyle=OWN.rgb([250,252,255],0.9); c.beginPath(); c.arc(low.x+(atH(i)-0.5)*S*1.4*(1-k),sg-S*0.3*atH(i*2),S*0.25,0,7); c.fill(); } sb(low,r*0.6*k,0); return; }
      if(t<220){ const k=eo(OWN.k(t,120,220)); sb({x:low.x+(high.x-low.x)*k,y:low.y+(high.y-low.y)*k},r*(0.6+0.4*k),k*3); return; }
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(high,end,k,S*1.5,0); sb(p,r,t/40*d); return; }
      const k=OWN.k(t,560,900);
      for(let i=0;i<7;i++){ const aa=-Math.PI+i/6*Math.PI, v=R*(0.5+0.6*atH(i)); c.fillStyle=OWN.rgb([255,255,255],1-k); c.beginPath(); c.arc(end.x+Math.cos(aa)*v*eo(k),end.y+Math.sin(aa)*v*eo(k)*0.8+k*k*R*1.4,S*(0.3+0.2*atH(i*3)),0,7); c.fill(); }
      const cap=Math.min(1,k*4), a=k<0.8?1:1-(k-0.8)/0.2; c.save(); c.globalAlpha*=a; c.fillStyle="#ffffff"; c.beginPath(); c.ellipse(head.x,head.y+S*0.15,R*0.55*cap,S*0.5*cap,0,Math.PI,0); c.fill();
      for(let i=0;i<3;i++){ c.beginPath(); c.arc(head.x+(i-1)*R*0.35,head.y+S*0.2,S*0.22*cap,0,Math.PI); c.fill(); } c.restore(); } },
  /* Jack: its carved face glows bright, the candle flame flicks out of its mouth and bobs across, and lands in a scorch puff with a curl of smoke */
  Jack:{at:OWN.at("Jack"),col:[255,170,60],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, face=OWN.pt(P.s,tg,[0.7,0.45]), end={x:tg.x-d*R*0.25,y:tg.y-R*0.1}, hot=OWN.rgb([255,150,50],0.95), core=OWN.rgb([255,240,170],0.95);
      if(t<260) atGlowA(c,face.x,face.y,S*(1.2+1.8*eo(Math.min(1,t/200))),[255,190,80],0.7*(1-OWN.k(t,220,260)));
      const flame=(p,h)=>{ atGlowA(c,p.x,p.y-h*0.4,h*1.4,[255,170,60],0.5); OWN.fire(c,p.x,p.y,h,hot,core,t,3); };
      if(t<220){ if(t>140) flame({x:o0.x+d*S*0.3,y:o0.y+S*0.3},S*1.1*OWN.k(t,140,220)); return; }
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go({x:o0.x+d*S*0.3,y:o0.y+S*0.3},{x:end.x,y:end.y+S*0.5},k,S*0.8,0); p.y+=Math.sin(k*Math.PI*4)*S*0.5;
        for(let i=0;i<3;i++){ const q=((t/120)+i/3)%1; c.fillStyle=OWN.rgb([255,210,120],1-q); c.beginPath(); c.arc(p.x-d*q*S*1.2,p.y-S*0.5+q*S*0.8,1.5,0,7); c.fill(); }
        flame(p,S*1.15); return; }
      const k=OWN.k(t,560,900); if(k<0.4){ atGlowA(c,end.x,end.y,R*0.9,[255,160,60],0.8*(1-k/0.4)); SG.puff(c,end.x,end.y,S*(0.8+1.5*k),0.85*(1-k/0.4),[70,55,50]); }
      c.strokeStyle=OWN.rgb([170,170,180],0.8*(1-k)); c.lineWidth=2.2; c.lineCap="round"; c.beginPath(); for(let i=0;i<=12;i++){ const q=i/12; c[i?"lineTo":"moveTo"](end.x+Math.sin(q*6+t/120)*S*0.5,end.y-S*0.3-q*R*1.2*Math.min(1,k*1.6)); } c.stroke(); } },
  /* Diwata: its flower wings flutter, a swirl of gold pollen and a few petals drifts over, and the foe sneezes in a puff of sparkles */
  Diwata:{at:OWN.at("Diwata"),col:[255,220,100],
    atk:(t)=>t<220?{arc:-3*Math.abs(Math.sin(t/40)),pose:"cast"}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, gold=[255,215,90], pet=P.parts||[255,150,190], end={x:tg.x-d*R*0.1,y:tg.y-R*0.15};
      const petal=(px,py,s,rot)=>{ c.save(); c.translate(px,py); c.rotate(rot); c.fillStyle=OWN.rgb(pet,0.95); c.beginPath(); c.ellipse(0,0,s,s*0.5,0,0,7); c.fill(); c.restore(); };
      const cen=t<220?{x:o0.x+d*S*0.5,y:o0.y}:t<560?OWN.go({x:o0.x+d*S*0.5,y:o0.y},end,eio(OWN.k(t,220,560)),S*1.4,Math.sin(t/120)*S*0.4):end;
      const gather=t<220?Math.min(1,t/220):1, spread=t<560?1:1+OWN.k(t,560,860)*1.5, a=t<560?1:1-OWN.k(t,560,860);
      for(let i=0;i<14;i++){ const aa=i/14*7+t/110*(i%2?1:-1), rr=S*(0.4+0.9*atH(i))*(t<220?(2.2-1.2*gather):1)*spread;
        c.fillStyle=OWN.rgb(gold,0.95*a*gather); c.beginPath(); c.arc(cen.x+Math.cos(aa)*rr,cen.y+Math.sin(aa)*rr*0.7,S*0.12+atH(i*3)*S*0.08,0,7); c.fill(); }
      if(t>180) for(let i=0;i<3;i++){ const aa=i*2.1+t/150, rr=S*1.2*spread; petal(cen.x+Math.cos(aa)*rr,cen.y+Math.sin(aa)*rr*0.6,S*0.35,t/90+i,); }
      atGlowA(c,cen.x,cen.y,S*1.8,gold,0.3*a);
      const sn=OWN.k(t,640,880); if(sn>0&&sn<1) for(let j=0;j<6;j++){ const aa=(j/5-0.5)*1.4, dd=R*(0.4+1*eo(sn)); OWN.star(c,tg.x-d*Math.cos(aa)*dd*0.2+(-d)*dd*0.5,tg.y+Math.sin(aa)*dd*0.6,S*0.4*(1-sn),OWN.rgb([255,240,160],1-sn),sn*3); } } },
  /* Thunderbird: one wing flaps hard, a feather rocks side to side as it glides over, crackling, and zaps the foe */
  Thunderbird:{at:OWN.at("Thunderbird"),col:[120,200,255],
    atk:(t,pos)=>t<120?{rot:-0.12*(pos.dir||1)*eo(t/120),arc:-4}:t<220?{rot:0.1*(pos.dir||1),pose:"push"}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=P.parts||o.col, end={x:tg.x-d*R*0.2,y:tg.y-R*0.25}, bolt=[255,240,120];
      const feather=(p,rot,s)=>{ c.save(); c.translate(p.x,p.y); c.rotate(rot); c.fillStyle=OWN.rgb(col,0.95); c.beginPath(); c.moveTo(-s,0); c.quadraticCurveTo(-s*0.2,-s*0.42,s,0); c.quadraticCurveTo(-s*0.2,s*0.42,-s,0); c.fill();
        c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=1.2; c.beginPath(); c.moveTo(-s*1.25,0); c.lineTo(s*0.95,0); c.stroke(); for(let j=-2;j<=2;j++){ c.beginPath(); c.moveTo(j*s*0.3,0); c.lineTo(j*s*0.3-s*0.22,(j%2?1:-1)*s*0.25); c.stroke(); } c.restore(); };
      if(t<220){ if(t>100){ const k=OWN.k(t,100,220); feather({x:o0.x+d*S*0.4*k,y:o0.y},0.4*k,S*1.3*k); } return; }
      const st={x:o0.x+d*S*0.4,y:o0.y-S*0.4};
      if(t<560){ const k=OWN.k(t,220,560), rock=Math.sin(k*Math.PI*3), p=OWN.go(st,end,k,S*0.6,0); p.x+=rock*S*0.5*d; p.y+=Math.abs(rock)*S*0.6;
        feather(p,rock*0.6,S*1.4); if(Math.floor(t/45)%2===0) OWN.zig(c,p.x-S,p.y,p.x+S,p.y-S*0.4,4,S*0.3,Math.floor(t/45),OWN.rgb(bolt,0.9),1.4); return; }
      const k=OWN.k(t,560,860); if(k<0.35){ OWN.zig(c,end.x,end.y-R*0.9,end.x,end.y+R*0.4,6,S*0.6,Math.floor(t/40),OWN.rgb([255,255,255],1-k/0.35),3); OWN.zig(c,end.x,end.y-R*0.9,end.x,end.y+R*0.4,6,S*0.9,Math.floor(t/40)+5,OWN.rgb(bolt,1-k/0.35),1.6); atGlowA(c,end.x,end.y,R*0.9,bolt,0.7*(1-k/0.35)); }
      feather({x:end.x+d*S*k*2,y:end.y+k*R*1.2},k*4,S*1.3*(1-k)); } },
  /* Salamander: its tail flame flares, then it spits three cinders in a spread that land as three small spark hits */
  Salamander:{at:OWN.at("Salamander"),col:[255,120,40],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, tail=OWN.pt(P.s,tg,[0.0,0.55]), hot=OWN.rgb([255,120,40],0.92), core=OWN.rgb([255,225,140],0.95);
      if(t<300){ const h=S*(1+1.6*eo(Math.min(1,t/180)))*(1-OWN.k(t,240,300)*0.6); OWN.fire(c,tail.x,tail.y,h,hot,core,t,4); }
      if(t<200){ if(t>120) atGlowA(c,o0.x,o0.y,S*1.4*OWN.k(t,120,200),[255,150,60],0.7); return; }
      for(let i=0;i<3;i++){ const tgt={x:tg.x-d*R*0.3,y:tg.y+(i-1)*R*0.5}, t0=200+i*25, t1=t0+330;
        if(t<t1){ const k=OWN.k(t,t0,t1); if(k<=0) continue; const p=OWN.go(o0,tgt,eo(k),S*(0.5+i*0.4),0); atGlowA(c,p.x,p.y,S*1.3,[255,130,50],0.6); OWN.flame(c,p.x,p.y,S*0.55,Math.atan2(tgt.y-o0.y,tgt.x-o0.x),hot,core,t+i*40);
          c.fillStyle="#fff0b0"; c.beginPath(); c.arc(p.x,p.y,S*0.2,0,7); c.fill(); continue; }
        const k=OWN.k(t,t1,t1+240); if(k<1){ atGlowA(c,tgt.x,tgt.y,S*(0.8+k*1.4),[255,150,60],0.7*(1-k)); for(let j=0;j<6;j++){ const aa=j/6*7+i, dd=S*(0.4+1.6*eo(k)); c.fillStyle=OWN.rgb([255,210,110],1-k); c.beginPath(); c.arc(tgt.x+Math.cos(aa)*dd,tgt.y+Math.sin(aa)*dd+k*k*S,1.6,0,7); c.fill(); } } } } },
  /* Djinn: the lamp glows, a four-pointed star spins across leaving glitter, bursts in sparkles and leaves little stars circling the foe's head */
  Djinn:{at:OWN.at("Djinn"),col:[255,225,120],
    atk:(t)=>t<220?{pose:"cast"}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,head}=P, lamp=OWN.pt(P.s,tg,[0.7,1.1]), gold=[255,225,120], pink=P.parts||[255,150,230], end={x:tg.x-d*R*0.2,y:tg.y-R*0.15};
      const star4=(px,py,r,rot,col,a)=>{ c.save(); c.translate(px,py); c.rotate(rot); c.fillStyle=OWN.rgb(col,a); c.beginPath(); for(let i=0;i<8;i++){ const aa=i/8*Math.PI*2, rr=i%2?r*0.28:r; c[i?"lineTo":"moveTo"](Math.cos(aa)*rr,Math.sin(aa)*rr); } c.closePath(); c.fill(); c.restore(); };
      if(t<260) atGlowA(c,lamp.x,lamp.y,S*(0.8+1.2*Math.min(1,t/180)),gold,0.7*(1-OWN.k(t,220,260)));
      if(t<220){ const k=OWN.k(t,80,220); if(k>0){ atGlowA(c,o0.x,o0.y,S*1.6*k,gold,0.6); star4(o0.x,o0.y,S*0.8*k,t/60,[255,250,220],1); } return; }
      if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(o0,end,eio(k),S*1.6,0);
        for(let i=0;i<8;i++){ const q=Math.max(0,k-i*0.035), g=OWN.go(o0,end,eio(q),S*1.6,0); star4(g.x+(atH(i+Math.floor(t/60))-0.5)*S,g.y+(atH(i*3)-0.5)*S+i*1.5,S*0.2,t/50,i%2?gold:pink,0.9*(1-i/8)); }
        atGlowA(c,p.x,p.y,S*2,gold,0.55); star4(p.x,p.y,S*1.0,t/40,[255,250,225],1); star4(p.x,p.y,S*0.55,-t/40,gold,1); return; }
      const k=OWN.k(t,560,900);
      if(k<0.5) for(let i=0;i<8;i++){ const aa=i/8*7, dd=R*(0.3+1.1*eo(k*2)); star4(end.x+Math.cos(aa)*dd,end.y+Math.sin(aa)*dd,S*0.4*(1-k*2),aa,i%2?gold:pink,1-k*2); }
      const a=k<0.8?1:1-(k-0.8)/0.2; for(let i=0;i<3;i++){ const aa=i/3*7+t/110; star4(head.x+Math.cos(aa)*R*0.6,head.y-S*0.4+Math.sin(aa)*S*0.35,S*0.38,t/70,gold,a*Math.min(1,k*4)); } } }
});

/* the first five were sized and approved on 18 Nov; the rest draw half again as big, since they read too small on a phone */
for(const f in OWN_BOLT2) if(!["Booly","Gumball","Nimbo","Sox","Kirin"].includes(f)&&!OWN_BOLT2[f].sz) OWN_BOLT2[f].sz=1.5;

/* steam, second pass (Gid, 18 Nov 2026): some clouds had the wrong colour or didn't match the move, so these moves override their family's cloud */
const OWN_STEAM_MOVE={
  "Toxic Cloud":{style:"toxic",col:[150,210,90],col2:[160,100,200]},
  "Smoke Whirl":{style:"whirl"},
  "Kettle Steam":{style:"jet",col:[250,252,255]},
  "Sour Spray":{col:[200,240,60]},
  "Chemical Spray":{style:"spray",col:[190,120,240]},

  "Frost Mane":{at:[[0.2,0.15],[0.35,0.0],[0.5,-0.05]],style:"frost"},
  "Foam Spray":{style:"foam",col:[225,245,250]},
  "Slush Spray":{style:"slush",col:[170,215,255]},
  "Rotten Breath":{col:[140,160,80],flies:true},
  "Poison Fog":{style:"toxic",col:[140,200,100],col2:[150,90,190]},
  /* Sox balls up a sock, throws it and it bursts into a green stink cloud on the foe */
  "Stink Bomb":{fx(c,t,x,o,PF){ const P=OWN.cx(x,{at:[0.6,0.3],sz:1.4}), {o0,tg,d,S,R}=P, sock=P.body||[240,150,205], end={x:tg.x-d*R*0.1,y:tg.y-R*0.1}, C=[160,200,80];
    const ball=(p,rot)=>{ c.save(); c.translate(p.x,p.y); c.rotate(rot); c.fillStyle=OWN.rgb(sock,1); c.beginPath(); c.arc(0,0,S*0.6,0,7); c.fill(); c.strokeStyle=OWN.rgb(OWN.mix(sock,[255,255,255],0.5),1); c.lineWidth=2; c.beginPath(); c.arc(0,0,S*0.4,0.3,2.6); c.stroke(); c.beginPath(); c.arc(0,0,S*0.6,4,5.2); c.stroke(); c.restore();
      for(let q=0;q<3;q++){ c.strokeStyle=OWN.rgb(C,0.8); c.lineWidth=1.6; c.beginPath(); for(let j=0;j<=6;j++) c.lineTo(p.x+(q-1)*S*0.4+Math.sin(j*1.3+t/70)*3,p.y-S*0.7-j*3); c.stroke(); } };
    if(t<180){ ball({x:o0.x,y:o0.y-S*0.8*eo(t/180)},t/60); return; }
    if(t<420){ const k=OWN.k(t,180,420), p=OWN.go({x:o0.x,y:o0.y-S*0.8},end,k,R*1.2,0); ball(p,k*9); return; }
    const k=OWN.k(t,420,1000), a=k<0.7?1:1-(k-0.7)/0.3;
    for(let i=0;i<12;i++){ const aa=i/12*7, dd=R*(0.2+1.1*eo(Math.min(1,k*1.5)))*(0.6+0.4*atH(i)); PF(end.x+Math.cos(aa)*dd,end.y+Math.sin(aa)*dd*0.7-k*R*0.3,S*(0.8+k*1.2),0.75*a,i%3?C:[130,170,60]); }
    for(let q=0;q<4;q++){ c.strokeStyle=OWN.rgb([110,150,50],0.8*a); c.lineWidth=2; c.beginPath(); for(let j=0;j<=8;j++) c.lineTo(end.x+(q-1.5)*R*0.5+Math.sin(j*1.2+t/80+q)*4,end.y-R*0.6-j*4-k*R*0.4); c.stroke(); } } },
  /* Lava: the lamp's top pops, a column of white steam shoots up and mushrooms, then rolls down onto the foe glowing hot with lava spitting in it */
  "Steam Burst":{fx(c,t,x,o,PF){ const P=OWN.cx(x,{at:[0.5,-0.1],sz:1.4}), {o0,tg,d,S,R,head}=P, hot=[255,150,80];
    const top={x:o0.x,y:o0.y-R*1.3}, a=t<880?1:1-OWN.k(t,880,1020);
    if(t<120){ const k=t/120; atGlowA(c,o0.x,o0.y,S*(0.8+k),hot,0.7); for(let i=0;i<3;i++) PF(o0.x+(i-1)*S*0.3,o0.y-S*0.3*k,S*0.3,0.6,[250,250,252]); return; }
    const up=OWN.k(t,120,300); for(let i=0;i<12;i++){ const q=i/11; if(q>up) break; const yy=o0.y+(top.y-o0.y)*q; PF(o0.x+Math.sin(t/40+i)*S*0.25,yy,S*(0.35+0.5*q),0.9*a*(t<520?1:1-OWN.k(t,520,700)),[250,250,252]); }
    if(t>=260){ const k=OWN.k(t,260,620), cen=OWN.go(top,{x:tg.x,y:head.y-R*0.1},eio(k),R*0.4,0), w=R*(0.9+0.6*k);
      for(let i=0;i<9;i++){ const aa=i/9*7+t/300, rr=w*0.45*(0.5+0.5*atH(i)); PF(cen.x+Math.cos(aa)*rr,cen.y+Math.sin(aa)*rr*0.55,w*0.32,0.8*a,i%3?[248,248,252]:[255,215,190]); }
      atGlowA(c,cen.x,cen.y+w*0.2,w*0.8,hot,0.35*a);
      for(let i=0;i<6;i++){ const q=((t/260)+i/6)%1; c.fillStyle=OWN.rgb([255,140,60],a*(1-q)); c.beginPath(); c.arc(cen.x+(atH(i)-0.5)*w,cen.y+q*R*0.9,S*0.16,0,7); c.fill(); }
      if(k>=1){ const dk=OWN.k(t,620,1020); for(let i=0;i<6;i++) PF(tg.x+(atH(i*2)-0.5)*R*1.6,tg.y-R*0.3+dk*R*0.5+atH(i)*R*0.6,S*0.5,0.5*a,[250,250,252]); } } } },
  /* Phoenix: a glowing cone of heat pours from its chest, shimmer bands roll through it with embers, and the foe glows hot and sweats */
  "Heat Haze":{fx(c,t,x,o,PF){ const P=OWN.cx(x,{at:[0.75,0.45],sz:1.4}), {o0,tg,d,S,R}=P, a=t<860?Math.min(1,t/180):1-OWN.k(t,860,1020), L=Math.abs(tg.x-o0.x)+R*0.6;
    if(a<=0) return; c.save(); c.globalAlpha*=a; const g=c.createLinearGradient(o0.x,0,o0.x+d*L,0); g.addColorStop(0,"rgba(255,170,60,.55)"); g.addColorStop(0.6,"rgba(255,120,40,.3)"); g.addColorStop(1,"rgba(255,90,40,.08)");
    c.fillStyle=g; c.beginPath(); c.moveTo(o0.x,o0.y-S*0.4); c.lineTo(o0.x+d*L,o0.y-R*1.0); c.quadraticCurveTo(o0.x+d*(L+R*0.4),o0.y,o0.x+d*L,o0.y+R*0.9); c.lineTo(o0.x,o0.y+S*0.4); c.closePath(); c.fill(); c.restore();
    for(let i=0;i<4;i++){ const q=((t/420)+i/4)%1, xx=o0.x+d*L*q, hh=S*0.4+R*0.9*q; c.save(); c.globalAlpha*=a*(1-q)*0.8; const gg=c.createLinearGradient(xx-d*S,0,xx+d*S,0); gg.addColorStop(0,"rgba(255,240,200,0)"); gg.addColorStop(0.5,"rgba(255,245,215,.85)"); gg.addColorStop(1,"rgba(255,240,200,0)"); c.fillStyle=gg;
      c.beginPath(); for(let j=0;j<=10;j++){ const yy=o0.y-hh+j/10*hh*2; c.lineTo(xx+d*Math.sin(j*1.1+t/60)*S*0.35,yy); } for(let j=10;j>=0;j--){ const yy=o0.y-hh+j/10*hh*2; c.lineTo(xx+d*(S*0.5+Math.sin(j*1.1+t/60)*S*0.35),yy); } c.closePath(); c.fill(); c.restore(); }
    for(let i=0;i<14;i++){ const q=((t/500)+i/14)%1, xx=o0.x+d*L*q, yy=o0.y+(atH(i)-0.5)*R*1.4*q-q*S; atGlowA(c,xx,yy,S*0.45,[255,150,50],0.6*a*(1-q)); c.fillStyle=OWN.rgb([255,225,130],a*(1-q*0.6)); c.beginPath(); c.arc(xx,yy,S*0.1+1,0,7); c.fill(); }
    const fk=OWN.k(t,420,1020); if(fk>0){ atGlowA(c,tg.x,tg.y,R*1.2,[255,110,50],0.45*a*(0.7+0.3*Math.sin(t/40))); OWN.drop(c,tg.x+R*0.7,tg.y-R*0.6+((t/300)%1)*R*0.6,S*0.28,Math.PI/2,[150,200,255]); OWN.drop(c,tg.x-R*0.6,tg.y-R*0.4+((t/260+0.5)%1)*R*0.6,S*0.24,Math.PI/2,[150,200,255]); } } },
  /* Djinn: purple smoke curls up out of the lamp and gathers into a puffy cloud that sails over and settles on the foe */
  "Smoke Puff":{fx(c,t,x,o,PF){ const P=OWN.cx(x,{at:[0.7,1.1],sz:1.4}), {o0,tg,d,S,R,head}=P, col=[170,130,225], a=t<880?1:1-OWN.k(t,880,1020);
    const stem=OWN.k(t,0,300); for(let i=0;i<14;i++){ const q=i/13; if(q>stem) break; const yy=o0.y-q*R*1.3, xx=o0.x+Math.sin(q*5+t/120)*S*0.6*q; PF(xx,yy,S*(0.25+0.45*q),0.8*a*(t<600?1:1-OWN.k(t,600,800)),col); }
    const st={x:o0.x+d*S*0.4,y:o0.y-R*1.4}, end={x:tg.x,y:head.y-R*0.15}, k=OWN.k(t,240,560), cen=OWN.go(st,end,eio(k),R*0.5,0), w=R*(0.7+0.9*eo(Math.min(1,t/400)));
    if(t>200){ PF(cen.x,cen.y+w*0.1,w*0.45,0.5*a,col); OWN.cloudShape(c,cen.x+Math.sin(t/90)*2,cen.y,w,col,0.92*a,3);
      for(let i=0;i<4;i++){ const aa=t/160+i*1.6; OWN.star(c,cen.x+Math.cos(aa)*w*0.55,cen.y-w*0.15+Math.sin(aa)*w*0.2,S*0.22,OWN.rgb([255,240,190],0.9*a),t/90); } }
    if(t>560){ const dk=OWN.k(t,560,1020); for(let i=0;i<7;i++){ const aa=i/7*7; PF(tg.x+Math.cos(aa)*R*(0.4+0.6*dk),tg.y+Math.sin(aa)*R*0.5,S*0.6,0.55*a*(1-dk*0.5),col); } } } },
  /* the dust falls over the foe's head, sparkling, and the foe nods off */
  "Sleep Dust":{fx(c,t,x,o,PF){ const P=OWN.cx(x,{at:[1.0,0.45],sz:1.3}), {o0,tg,d,S,R,head}=P, C=[225,205,255];
    const over={x:tg.x,y:head.y-R*0.7};
    const cen=t<180?{x:o0.x+d*S*0.6,y:o0.y}:t<520?OWN.go({x:o0.x+d*S*0.6,y:o0.y},over,eio(OWN.k(t,180,520)),S*1.6,0):over;
    const a=t<900?1:1-OWN.k(t,900,1020);
    for(let i=0;i<16;i++){ let px, py; if(t<520){ const aa=i/16*7+t/120; px=cen.x+Math.cos(aa)*S*1.1*atH(i+2); py=cen.y+Math.sin(aa)*S*0.6*atH(i+5); }
      else { const k=((t-520)/500+atH(i))%1; px=over.x+(atH(i*3)-0.5)*R*1.6+Math.sin(t/120+i)*3; py=over.y+k*R*1.4; }
      const tw=0.55+0.45*Math.sin(t/45+i*1.9); if(i%2){ atGlowA(c,px,py,S*0.7,C,0.5*a*tw); OWN.star(c,px,py,S*(0.22+0.22*tw),OWN.rgb([255,252,235],0.98*a),t/300+i); } else { atGlowA(c,px,py,S*0.45,[255,240,200],0.6*a*tw); c.fillStyle=OWN.rgb([255,255,255],0.95*a); c.beginPath(); c.arc(px,py,S*0.09+1,0,7); c.fill(); } }
    atGlowA(c,cen.x,cen.y,S*1.6,C,0.3*a);
    const zk=OWN.k(t,620,1020); if(zk>0) for(let i=0;i<3;i++){ const q=(zk*1.3-i*0.25); if(q<=0||q>=1) continue; const zx=tg.x+d*R*0.5+q*R*0.6, zy=head.y-q*R*0.9, zs=S*(0.5+0.4*q);
      c.save(); c.strokeStyle=OWN.rgb([90,80,150],1-q); c.lineWidth=2.4; c.lineJoin="round"; c.beginPath(); c.moveTo(zx-zs/2,zy-zs/2); c.lineTo(zx+zs/2,zy-zs/2); c.lineTo(zx-zs/2,zy+zs/2); c.lineTo(zx+zs/2,zy+zs/2); c.stroke(); c.restore(); } } }
};

/* ---------- trumpet, second pass (Gid, 18 Nov 2026): the first pass was coloured lines, so every family's cry now shows what it
   sounds like and what it does to the foe. Wind-up to 220 ms, contact at 440, done by 1120. ---------- */
OWN.note=(c,x,y,s,col,rot=0,two=false)=>{ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=col; c.strokeStyle=col; c.lineWidth=Math.max(1.4,s*0.18); c.lineCap="round";
  c.beginPath(); c.ellipse(0,0,s*0.5,s*0.36,-0.4,0,7); c.fill(); c.beginPath(); c.moveTo(s*0.42,-s*0.1); c.lineTo(s*0.42,-s*1.5); c.stroke();
  if(two){ c.beginPath(); c.ellipse(s*1.2,-s*0.25,s*0.5,s*0.36,-0.4,0,7); c.fill(); c.beginPath(); c.moveTo(s*1.62,-s*0.35); c.lineTo(s*1.62,-s*1.75); c.stroke(); c.lineWidth=s*0.35; c.beginPath(); c.moveTo(s*0.42,-s*1.5); c.lineTo(s*1.62,-s*1.75); c.stroke(); }
  else { c.beginPath(); c.moveTo(s*0.42,-s*1.5); c.quadraticCurveTo(s*1.1,-s*1.1,s*0.9,-s*0.6); c.stroke(); }
  for(const [hx,hy] of two?[[0,0],[s*1.2,-s*0.25]]:[[0,0]]){ const g=c.createRadialGradient(hx-s*0.18,hy-s*0.14,0,hx,hy,s*0.55); g.addColorStop(0,"rgba(255,255,255,.55)"); g.addColorStop(0.5,"rgba(255,255,255,0)"); g.addColorStop(1,"rgba(40,20,60,.25)");
    c.fillStyle=g; c.beginPath(); c.ellipse(hx,hy,s*0.5,s*0.36,-0.4,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.75)"; c.beginPath(); c.ellipse(hx-s*0.2,hy-s*0.1,s*0.14,s*0.06,-0.5,0,7); c.fill(); }
  c.restore(); };
OWN.zee=(c,x,y,s,col,lw=2.4)=>{ c.strokeStyle=col; c.lineWidth=lw; c.lineJoin="round"; c.lineCap="round"; c.beginPath(); c.moveTo(x-s/2,y-s/2); c.lineTo(x+s/2,y-s/2); c.lineTo(x-s/2,y+s/2); c.lineTo(x+s/2,y+s/2); c.stroke(); };
OWN.burstShape=(c,x,y,r,col,edge,rot=0)=>{ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=col; c.beginPath(); for(let i=0;i<20;i++){ const a=i/20*Math.PI*2, rr=i%2?r*0.68:r*(0.95+0.12*Math.sin(i*3)); c[i?"lineTo":"moveTo"](Math.cos(a)*rr,Math.sin(a)*rr*0.8); } c.closePath(); c.fill(); if(edge){ c.strokeStyle=edge; c.lineWidth=2; c.stroke(); } c.restore(); };
OWN.tremble=(c,tg,R,t,col,a)=>{ for(const sd of [-1,1]) for(let j=0;j<2;j++){ const xx=tg.x+sd*(R*1.0+j*5)+Math.sin(t/10+j)*1.5; c.strokeStyle=OWN.rgb(col,a); c.lineWidth=2; c.beginPath(); c.moveTo(xx,tg.y-R*0.4); c.quadraticCurveTo(xx+sd*4,tg.y-R*0.15,xx,tg.y+R*0.1); c.stroke(); } };
const HN=(fam)=>OWN_HORN[fam]&&OWN_HORN[fam].at[0];

const OWN_HORN2={
  /* Antik: its screen shows a jumping sound bar, then thick bands of static roll out and fuzz the foe */
  Antik:{at:[0.5,0.45],col:[140,230,255],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col;
      if(t<900){ const a=t<820?1:1-OWN.k(t,820,900); for(let i=0;i<5;i++){ const h=S*(0.15+0.55*Math.abs(Math.sin(t/(60+i*13)+i*1.7))); c.fillStyle=OWN.rgb(i%2?col:[255,255,255],0.95*a); c.fillRect(o0.x+(i-2)*S*0.2-S*0.07,o0.y+S*0.35-h,S*0.14,h); } }
      for(let i=0;i<3;i++){ const k=OWN.k(t,200+i*140,200+i*140+560); if(k<=0||k>=1) continue; const rr=S*1.2+(Math.abs(tg.x-o0.x)+R)*eo(k), band=S*(0.5+0.4*k), hs=Math.min(0.6,R*1.1/rr);
        c.save(); c.globalAlpha*=0.9*(1-k*0.7); c.beginPath(); c.arc(o0.x,o0.y,rr+band/2,d>0?-hs:Math.PI-hs,d>0?hs:Math.PI+hs); c.arc(o0.x,o0.y,Math.max(1,rr-band/2),d>0?hs:Math.PI+hs,d>0?-hs:Math.PI-hs,true); c.closePath(); c.clip();
        c.fillStyle=OWN.rgb([60,70,90],0.55); c.fill(); const cell=Math.max(2.5,S*0.16), fr=Math.floor(t/45);
        for(let yy=o0.y-rr-band;yy<o0.y+rr+band;yy+=cell) for(let xx=o0.x-rr-band;xx<o0.x+rr+band;xx+=cell){ const h=atH(Math.floor(xx/cell)*31+Math.floor(yy/cell)*17+fr*7); if(h<0.45) continue; c.fillStyle=h>0.8?"#ffffff":OWN.rgb(col,1); c.fillRect(xx,yy,cell*0.9,cell*0.9); }
        c.restore(); }
      const fk=OWN.k(t,440,1100); if(fk>0&&fk<1){ const a=1-fk, fr=Math.floor(t/35), cell=Math.max(2.5,S*0.16); c.save(); c.globalAlpha*=0.8*a; c.beginPath(); c.ellipse(tg.x,tg.y,R*1.05,R*0.95,0,0,7); c.clip();
        for(let yy=tg.y-R;yy<tg.y+R;yy+=cell) for(let xx=tg.x-R*1.1;xx<tg.x+R*1.1;xx+=cell){ const h=atH(Math.floor(xx/cell)*13+Math.floor(yy/cell)*29+fr*5); c.fillStyle=h>0.7?"#ffffff":h>0.4?"#8a90a0":"#2a2e38"; c.fillRect(xx,yy,cell,cell); }
        for(let j=0;j<2;j++){ const yy=tg.y-R+((t/5+j*50)%(R*2)); c.fillStyle="rgba(255,255,255,.6)"; c.fillRect(tg.x-R*1.1,yy,R*2.2,cell*0.8); } c.restore(); } } },
  /* Booly: it puffs up huge with its mouth wide, a spooky face flies at the foe and the foe jumps with fright */
  Booly:{at:HN("Booly"),col:[220,230,255],
    atk:(t)=>t<200?{sx:1+0.3*eo(t/200),sy:1+0.3*eo(t/200)}:t<700?{sx:1.3,sy:1.3}:t<900?{sx:1+0.3*(1-OWN.k(t,700,900)),sy:1+0.3*(1-OWN.k(t,700,900))}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.2};
      if(t<200) return;
      const face=(p,s,a)=>{ c.save(); c.globalAlpha*=a; atGlowA(c,p.x,p.y,s*2,[200,220,255],0.4); c.fillStyle="rgba(240,245,255,.85)"; c.beginPath(); c.arc(p.x,p.y-s*0.1,s,Math.PI,0); c.lineTo(p.x+s,p.y+s*0.7);
        for(let i=0;i<=4;i++) c.lineTo(p.x+s-i*s/2,p.y+s*0.7+(i%2?s*0.25:0)+Math.sin(t/50+i)*s*0.08); c.closePath(); c.fill();
        c.fillStyle="#2a2440"; for(const ex of [-0.38,0.38]){ c.beginPath(); c.ellipse(p.x+ex*s,p.y-s*0.25,s*0.2,s*0.3,0,0,7); c.fill(); } c.beginPath(); c.ellipse(p.x,p.y+s*0.3,s*0.3,s*0.38,0,0,7); c.fill(); c.restore(); };
      if(t<460){ const k=OWN.k(t,200,460), p=OWN.go(o0,end,eo(k),S*0.6,0); face(p,S*(0.7+1.3*k),0.9); return; }
      const k=OWN.k(t,460,800); if(k<1) face(end,S*2*(1+0.4*k),0.9*(1-k));
      const fk=OWN.k(t,440,1100); if(fk<1){ const a=1-fk; for(let i=0;i<5;i++){ const aa=-Math.PI/2+(i-2)*0.45, r1=R*1.05, r2=R*(1.3+0.15*Math.sin(t/40)); c.strokeStyle=OWN.rgb([60,60,80],a); c.lineWidth=2.4; c.beginPath(); c.moveTo(tg.x+Math.cos(aa)*r1,tg.y-R*0.1+Math.sin(aa)*r1); c.lineTo(tg.x+Math.cos(aa)*r2,tg.y-R*0.1+Math.sin(aa)*r2); c.stroke(); }
        OWN.drop(c,tg.x+R*0.75,tg.y-R*0.5+fk*R*0.5,S*0.3,Math.PI/2,[150,200,255]); } } },
  /* Plod: the trunk swings up and blasts a cone of sound with music notes tumbling in it */
  Plod:{at:[1.05,0.55],col:[255,230,150],
    atk:(t,pos)=>t<220?{rot:-0.12*(pos.dir||1)*eo(t/220)}:t<860?{rot:-0.08*(pos.dir||1)}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, L=Math.abs(tg.x-o0.x)+R*0.6;
      if(t<220) return; const k=OWN.k(t,220,520), a=t<820?1:1-OWN.k(t,820,1000); if(a<=0) return;
      c.save(); c.globalAlpha*=a; const g=c.createLinearGradient(o0.x,o0.y,o0.x+d*L,o0.y); g.addColorStop(0,OWN.rgb(col,0.55)); g.addColorStop(1,OWN.rgb(col,0.05)); c.fillStyle=g;
      const half=R*0.9*eo(k), len=L*eo(k); c.beginPath(); c.moveTo(o0.x,o0.y-S*0.3); c.lineTo(o0.x+d*len,o0.y-half); c.quadraticCurveTo(o0.x+d*(len+R*0.3),o0.y,o0.x+d*len,o0.y+half); c.lineTo(o0.x,o0.y+S*0.3); c.closePath(); c.fill();
      for(let i=0;i<3;i++){ const q=((t-220)/300+i/3)%1; c.strokeStyle=OWN.rgb([255,255,255],0.8*(1-q)); c.lineWidth=3; c.beginPath(); const xx=o0.x+d*L*q*eo(k), hh=half*q*1.0+S*0.3; c.moveTo(xx,o0.y-hh); c.quadraticCurveTo(xx+d*R*0.25,o0.y,xx,o0.y+hh); c.stroke(); }
      for(let i=0;i<6;i++){ const q=((t-220)/420+i/6)%1, xx=o0.x+d*L*q*eo(k), yy=o0.y+Math.sin(q*9+i)*half*0.6*q; OWN.note(c,xx,yy,S*(0.5+0.3*atH(i)),OWN.rgb(i%2?[90,70,160]:[220,90,120],0.95*(1-q*0.6)),q*6*(i%2?1:-1),i%3===0); } c.restore(); } },
  /* Teep: its lid rattles and puffs, and a jet of steam whistles out of the spout carrying high little notes to the foe */
  Teep:{at:HN("Teep"),col:[255,255,255],
    fx(c,t,x,o){ OWN.twoPass(c,x,(cc,PF)=>{ const c0=cc; { const c=c0; const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, lid=OWN.pt(P.s,tg,[0.5,-0.02]), end={x:tg.x,y:tg.y-R*0.3};
      if(t<950){ const hop=Math.abs(Math.sin(t/35))*S*0.25; for(const sd of [-1,1]){ c.strokeStyle=OWN.rgb([90,90,110],0.8); c.lineWidth=2; c.beginPath(); c.arc(lid.x+sd*S*1.1,lid.y-hop,S*0.5,sd>0?-0.6:Math.PI-0.6,sd>0?0.6:Math.PI+0.6); c.stroke(); }
        for(let i=0;i<4;i++){ const q=((t/260)+i/4)%1; PF(lid.x+(i%2?1:-1)*S*(0.6+q*0.8),lid.y-S*0.2-q*S*1.4,S*(0.25+0.45*q),0.7*(1-q),[250,252,255]); } }
      if(t<120) return; const head=Math.min(1,OWN.k(t,120,440)), tail=OWN.k(t,820,1100), a=1-tail;
      for(let i=0;i<22;i++){ const q=tail+(head-tail)*((i/22+t/500)%1), p=OWN.go(o0,end,q,S*0.6,Math.sin(q*30+t/25)*S*0.12*q); PF(p.x,p.y,S*(0.22+0.6*q),0.85*a,[250,252,255]); }
      for(let i=0;i<4;i++){ const q=tail+(head-tail)*((i/4+t/420)%1); if(q<0.12) continue; const p=OWN.go(o0,end,q,S*0.6,0); OWN.note(c,p.x,p.y-S*(0.7+0.5*Math.sin(t/50+i)),S*0.42,OWN.rgb([90,130,220],0.95*a*(1-q*0.3)),Math.sin(t/40+i)*0.3,i%2===1); }
      if(t>440&&t<1100){ const fk=OWN.k(t,440,1100); for(let i=0;i<5;i++){ const aa=-Math.PI/2+(i-2)*0.5, r1=R*1.05, r2=R*(1.35+0.15*Math.sin(t/20+i)); c.strokeStyle=OWN.rgb([90,130,220],0.9*(1-fk)); c.lineWidth=2.4; c.beginPath(); c.moveTo(tg.x+Math.cos(aa)*r1,tg.y-R*0.1+Math.sin(aa)*r1); c.lineTo(tg.x+Math.cos(aa)*r2,tg.y-R*0.1+Math.sin(aa)*r2); c.stroke(); } } } }); } },
  /* Flit: curved echo waves fly out one after another with small bats circling them, and a shadow of dread falls on the foe */
  Flit:{at:HN("Flit"),col:[190,150,235],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, end={x:tg.x,y:tg.y-R*0.1};
      for(let i=0;i<5;i++){ const k=OWN.k(t,180+i*80,180+i*80+380); if(k<=0||k>=1) continue; const p=OWN.go(o0,end,k,0,0), h=S*(0.7+1.0*k), a=0.95*(1-k*0.5), sp=1.1;
        c.save(); c.translate(p.x,p.y); c.scale(d,1); const g=c.createLinearGradient(-h*0.5,0,h*0.3,0); g.addColorStop(0,OWN.rgb(col,0)); g.addColorStop(1,OWN.rgb(col,a)); c.fillStyle=g;
        c.beginPath(); c.arc(-h*0.6,0,h,-sp,sp); c.arc(-h*0.85,0,h*0.92,sp*0.97,-sp*0.97,true); c.closePath(); c.fill(); c.strokeStyle=OWN.rgb([255,255,255],a*0.8); c.lineWidth=1.6; c.beginPath(); c.arc(-h*0.6,0,h,-sp,sp); c.stroke(); c.restore(); }
      if(t>200&&t<900){ const k=OWN.k(t,200,900); for(let i=0;i<3;i++){ const cen=OWN.go(o0,end,Math.min(1,k*1.3),0,0), aa=t/90+i*2.1, px=cen.x+Math.cos(aa)*S*1.6, py=cen.y+Math.sin(aa)*S*1.0, fl=Math.sin(t/25+i);
        c.fillStyle=OWN.rgb([60,40,80],0.95); c.beginPath(); c.moveTo(px,py); c.quadraticCurveTo(px-S*0.6,py-S*(0.5+fl*0.3),px-S*1.0,py-fl*S*0.2); c.quadraticCurveTo(px-S*0.5,py+S*0.1,px,py+S*0.2); c.quadraticCurveTo(px+S*0.5,py+S*0.1,px+S*1.0,py-fl*S*0.2); c.quadraticCurveTo(px+S*0.6,py-S*(0.5+fl*0.3),px,py); c.fill(); } }
      const fk=OWN.k(t,440,1100); if(fk>0&&fk<1) SG.puff(c,tg.x,tg.y-R*0.6,R*(0.8+0.3*Math.sin(t/60)),0.35*(1-fk),[70,40,90]); } },
  /* Tock: the clapper hammers between its bells, Tock hops in place and little bells shake off toward the foe */
  Tock:{at:[0.5,-0.05],col:[255,220,120],
    atk:(t)=>t>150&&t<900?{arc:-3*Math.abs(Math.sin(t/35)),off:[Math.sin(t/9)*1.5,0]}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, b1=OWN.pt(P.s,tg,[0.25,-0.05]), b2=OWN.pt(P.s,tg,[0.75,-0.05]), col=o.col;
      if(t<950){ const sw=Math.sin(t/28), hx=(b1.x+b2.x)/2+sw*(b2.x-b1.x)*0.38, hy=b1.y-S*0.2; c.strokeStyle="#7a6a50"; c.lineWidth=2.4; c.beginPath(); c.moveTo((b1.x+b2.x)/2,b1.y+S*0.5); c.lineTo(hx,hy); c.stroke(); c.fillStyle="#e8c060"; c.beginPath(); c.arc(hx,hy,S*0.32,0,7); c.fill();
        for(const b of [b1,b2]) for(let j=0;j<2;j++){ c.strokeStyle=OWN.rgb(col,0.9); c.lineWidth=2; c.beginPath(); c.arc(b.x,b.y,S*(0.9+j*0.45)+Math.sin(t/20)*1.5,-2.4,-0.7); c.stroke(); } }
      for(let i=0;i<5;i++){ const t0=200+i*90, k=OWN.k(t,t0,t0+420); if(k<=0||k>=1) continue; const st=i%2?b2:b1, end={x:tg.x+(atH(i)-0.5)*R*1.2,y:tg.y-R*0.3}, p=OWN.go(st,end,k,R*0.9,0);
        c.save(); c.translate(p.x,p.y); c.rotate(Math.sin(t/30+i)*0.5); c.fillStyle="#f0c850"; c.beginPath(); c.moveTo(-S*0.45,S*0.3); c.quadraticCurveTo(-S*0.45,-S*0.5,0,-S*0.5); c.quadraticCurveTo(S*0.45,-S*0.5,S*0.45,S*0.3); c.closePath(); c.fill(); c.fillStyle="#a07830"; c.beginPath(); c.arc(0,S*0.38,S*0.13,0,7); c.fill(); c.restore();
        if(k>0.9){ c.strokeStyle=OWN.rgb(col,(1-k)*8); c.lineWidth=2; c.beginPath(); c.arc(end.x,end.y,S*(0.8+(k-0.9)*12),0,7); c.stroke(); } } } },
  /* Snooze: a bubble swells from its nose and pops, a big Z cloud rolls over to the foe and the foe gets drowsy */
  Snooze:{at:HN("Snooze"),col:[200,200,255],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,head}=P, end={x:tg.x,y:tg.y-R*0.3};
      if(t<330){ const k=Math.min(1,t/280), r=S*(0.2+0.6*eo(k)); if(t<290) OWN.bubble(c,o0.x+d*r*0.8,o0.y+S*0.2,r,[200,220,255],false); else OWN.pop(c,o0.x+d*r*0.8,o0.y+S*0.2,S*0.8,[210,225,255],OWN.k(t,290,330)*0.9+0.05,6); }
      if(t>260&&t<760){ const k=OWN.k(t,260,520), p=OWN.go({x:o0.x+d*S,y:o0.y-S*0.5},end,eo(k),S*1.5,0), s=S*(0.9+0.8*eo(k)), a=t<640?1:1-OWN.k(t,640,760);
        OWN.cloud(c,p.x,p.y,s,[225,225,250],0.95*a); OWN.zee(c,p.x,p.y,s*0.9,OWN.rgb([110,100,180],a),3.2); }
      const zk=OWN.k(t,520,1120); if(zk>0&&zk<1) for(let i=0;i<3;i++){ const q=(zk*1.6-i*0.3); if(q<=0||q>=1) continue; OWN.zee(c,tg.x+R*0.4+q*R*0.6,head.y-q*R*0.8,S*(0.5+0.4*q),OWN.rgb([110,100,180],1-q),2.6); }
      if(zk>0&&zk<1){ c.fillStyle=OWN.rgb([120,110,170],0.18*(1-zk)); c.beginPath(); c.arc(tg.x,tg.y,R*1.05,0,7); c.fill(); } } },
  /* Ditty: notes fly out growing bigger and bigger, and the last one slams down on the foe */
  Ditty:{at:HN("Ditty"),col:[255,230,140],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,head}=P, cols=[[255,120,150],[120,170,255],[255,200,80],[150,220,130]];
      for(let i=0;i<4;i++){ const t0=180+i*60, k=OWN.k(t,t0,t0+360); if(k<=0||k>=1) continue; const end={x:tg.x+(i-1.5)*R*0.4,y:tg.y-R*0.3}, p=OWN.go(o0,end,k,S*(1+i*0.4),Math.sin(k*8+i)*S*0.4);
        OWN.note(c,p.x,p.y,S*(0.45+i*0.15),OWN.rgb(cols[i],0.95),Math.sin(t/60+i)*0.4,i%2===1); }
      const k=OWN.k(t,240,440), big=S*1.6; if(t>=240&&t<1100){ const top={x:tg.x,y:head.y-R*0.9}, p=t<440?{x:o0.x+(top.x-o0.x)*eo(k),y:o0.y-R*1.2*Math.sin(Math.PI*k*0.9)+(top.y-o0.y)*k}:{x:tg.x,y:head.y-big*0.4};
        const a=t<900?1:1-OWN.k(t,900,1100); if(t<440) OWN.note(c,p.x,p.y,big,OWN.rgb([200,90,200],0.95),0,true);
        else { const sk=OWN.k(t,440,560); c.save(); c.translate(tg.x,head.y); c.scale(1+0.25*(1-sk),1-0.25*(1-sk)); c.globalAlpha*=a; OWN.note(c,0,-big*0.2,big,"#c85ac8",0,true); c.restore(); if(sk<1){ c.strokeStyle=OWN.rgb([255,230,140],1-sk); c.lineWidth=3; c.beginPath(); c.ellipse(tg.x,head.y,R*(0.6+sk*1),R*0.25*(0.6+sk),0,0,7); c.stroke(); } } } } },
  /* Helm: a bright sonar ping sweeps out, a target mark locks on the foe and a second, harder ping hits */
  Helm:{at:HN("Helm"),col:[130,230,200],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, L=Math.abs(tg.x-o0.x)+R;
      const ring=(k,w,hard)=>{ if(k<=0||k>=1) return; const rr=S+L*eo(k), hs=Math.min(0.9,R*1.6/rr), a0=d>0?-hs:Math.PI-hs, a1=d>0?hs:Math.PI+hs;
        const g=c.createRadialGradient(o0.x,o0.y,Math.max(0,rr-w*3),o0.x,o0.y,rr+w); g.addColorStop(0,OWN.rgb(col,0)); g.addColorStop(0.75,OWN.rgb(col,0.55*(1-k))); g.addColorStop(1,OWN.rgb([255,255,255],0.95*(1-k)));
        c.fillStyle=g; c.beginPath(); c.arc(o0.x,o0.y,rr+w,a0,a1); c.arc(o0.x,o0.y,Math.max(0,rr-w*3),a1,a0,true); c.closePath(); c.fill(); if(hard){ c.strokeStyle=OWN.rgb([255,255,255],0.9*(1-k)); c.lineWidth=3; c.beginPath(); c.arc(o0.x,o0.y,rr,a0,a1); c.stroke(); } };
      if(t<300){ const pk=t/300; atGlowA(c,o0.x,o0.y,S*(0.8+0.8*Math.abs(Math.sin(t/50))),col,0.8); }
      ring(OWN.k(t,150,560),S*0.5,false); ring(OWN.k(t,360,720),S*0.8,true);
      const mk=OWN.k(t,330,1100); if(mk>0&&mk<1){ const a=mk<0.8?1:1-(mk-0.8)/0.2, rr=R*(1.5-0.45*Math.min(1,mk*4)), red=mk>0.2; c.strokeStyle=OWN.rgb(red?[255,90,90]:col,a); c.lineWidth=3; c.beginPath(); c.arc(tg.x,tg.y,rr,0,7); c.stroke();
        for(let i=0;i<4;i++){ const aa=i*Math.PI/2+mk*1.5; c.beginPath(); c.moveTo(tg.x+Math.cos(aa)*rr*0.7,tg.y+Math.sin(aa)*rr*0.7); c.lineTo(tg.x+Math.cos(aa)*rr*1.25,tg.y+Math.sin(aa)*rr*1.25); c.stroke(); }
        if(red&&Math.floor(t/90)%2===0){ atGlowA(c,tg.x,tg.y,S*0.9,[255,90,90],0.8*a); } } } },
  /* Sox: a lint cloud bursts out of its mouth, then a ball of yarn hops across, trailing a loopy thread, and the thread winds round the foe */
  Sox:{at:[0.55,0.45],col:[245,180,220],
    fx(c,t,x,o){ OWN.twoPass(c,x,(cc,PF)=>{ const c0=cc; { const c=c0; const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd}=P, body=P.body||o.col, yarn=OWN.mix(body,[255,255,255],0.3), dark=OWN.mix(body,[0,0,0],0.3);
      if(t>150&&t<700) for(let i=0;i<10;i++){ const k=OWN.k(t,150+i*20,450+i*20); if(k<=0||k>=1) continue; const aa=(i/10-0.5)*1.4; PF(o0.x+d*Math.cos(aa)*R*1.1*eo(k),o0.y+Math.sin(aa)*R*0.8*eo(k),S*(0.3+0.5*k),0.85*(1-k),i%2?[252,248,250]:OWN.mix(body,[255,255,255],0.6)); }
      const a=1-OWN.k(t,980,1120); if(t<220||a<=0) return;
      const st={x:o0.x+d*S*0.5,y:o0.y}, x1=tg.x-d*R*0.9; const ballAt=(k)=>{ const px=st.x+(x1-st.x)*k, gy=sg+(gnd-sg)*k-S*0.7, hop=Math.abs(Math.sin(k*Math.PI*2.5))*R*0.6*(1-k*0.4); return {x:px,y:Math.min(gy,st.y+(gy-st.y)*Math.min(1,k*4))-hop}; };
      const k=OWN.k(t,220,520), thread=(q0,q1)=>{ c.strokeStyle=OWN.rgb(yarn,a); c.lineWidth=Math.max(1.8,S*0.13); c.lineCap="round"; c.beginPath(); for(let i=0;i<=60;i++){ const q=q0+(q1-q0)*i/60, b=ballAt(q), lp=S*0.35; c[i?"lineTo":"moveTo"](b.x+Math.cos(q*40)*lp*d,b.y+S*0.5+Math.sin(q*40)*lp); } c.stroke(); };
      if(t<520){ thread(0,k); const b=ballAt(k); c.save(); c.translate(b.x,b.y); c.rotate(t/45*d); c.fillStyle=OWN.rgb(yarn,1); c.beginPath(); c.arc(0,0,S*0.75,0,7); c.fill(); c.strokeStyle=OWN.rgb(dark,0.8); c.lineWidth=1.4;
        for(let j=0;j<5;j++){ c.beginPath(); c.ellipse(0,0,S*0.75,S*0.3,j*0.63,0,Math.PI); c.stroke(); } c.restore(); return; }
      const wk=OWN.k(t,520,820); thread(Math.min(1,wk),1);
      for(let i=0;i<3;i++){ const yy=tg.y-R*0.45+i*R*0.42, sp=Math.min(1,wk*1.7-i*0.25); if(sp<=0) continue; c.strokeStyle=OWN.rgb(yarn,a); c.lineWidth=Math.max(2,S*0.16); c.beginPath(); c.ellipse(tg.x,yy,R*1.04,R*0.2,0.12*(i-1),Math.PI*(d>0?1:0),Math.PI*(d>0?1:0)+Math.PI*2*sp); c.stroke();
        c.strokeStyle=OWN.rgb(dark,0.5*a); c.lineWidth=1; c.stroke(); } } }); } },
  /* Jack: wind howls through its carved face, the candle flickers, and ghostly wisps pour out of its eye holes and swirl round the foe */
  Jack:{at:[0.7,0.38],col:[255,170,60],
    fx(c,t,x,o){ OWN.twoPass(c,x,(cc,PF)=>{ const c0=cc; { const c=c0; const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, eyes=[OWN.pt(P.s,tg,[0.55,0.38]),OWN.pt(P.s,tg,[0.85,0.38])], face=OWN.pt(P.s,tg,[0.7,0.5]);
      if(t<1000) atGlowA(c,face.x,face.y,S*(1.6+0.6*Math.sin(t/23)),[255,170,60],0.55*(t<800?1:1-OWN.k(t,800,1000)));
      const wisp=(p,ang,s,a)=>{ for(let j=0;j<6;j++){ const q=j/6; PF(p.x-Math.cos(ang)*s*1.6*q,p.y-Math.sin(ang)*s*1.6*q+Math.sin(t/60+j)*s*0.2,s*(0.75-0.55*q),a*(1-q*0.6),[255,250,238]); }
        atGlowA(c,p.x,p.y,s*1.6,[255,200,120],0.45*a);
        c.fillStyle=OWN.rgb([60,40,30],0.8*a); c.beginPath(); c.arc(p.x+Math.cos(ang)*s*0.2-Math.sin(ang)*s*0.25,p.y+Math.sin(ang)*s*0.2+Math.cos(ang)*s*0.25,s*0.12,0,7); c.arc(p.x+Math.cos(ang)*s*0.2+Math.sin(ang)*s*0.25,p.y+Math.sin(ang)*s*0.2-Math.cos(ang)*s*0.25,s*0.12,0,7); c.fill(); };
      for(let i=0;i<6;i++){ const t0=150+i*70, k=OWN.k(t,t0,t0+430); if(k<=0) continue; const e=eyes[i%2];
        if(k<1){ const end={x:tg.x+(atH(i)-0.5)*R*0.8,y:tg.y-R*0.2}, p=OWN.go(e,end,eo(k),S*0.8,Math.sin(k*6+i)*S*0.8), q=OWN.go(e,end,Math.min(1,eo(k)+0.05),S*0.8,Math.sin((k+0.05)*6+i)*S*0.8); wisp(p,Math.atan2(q.y-p.y,q.x-p.x),S*0.7,0.85); continue; }
        const ok=OWN.k(t,t0+430,1120); if(ok>=1) continue; const aa=t/150+i*1.05, p={x:tg.x+Math.cos(aa)*R*1.0,y:tg.y-R*0.1+Math.sin(aa)*R*0.45}; wisp(p,aa+Math.PI/2,S*0.6,0.8*(1-ok)); }
      const fk=OWN.k(t,440,1100); if(fk>0&&fk<1) OWN.tremble(c,tg,P.R,t,[90,70,50],0.8*(1-fk)); } }); } },
  /* Sphinx: it roars and a dune of sand rolls along the ground, spraying grains, and buries the foe's feet */
  Sphinx:{at:HN("Sphinx"),col:[230,200,140],
    fx(c,t,x,o){ OWN.twoPass(c,x,(cc,PF)=>{ const c0=cc; { const c=c0; const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd}=P, sand=[228,190,120], shade=[190,145,85];
      if(t>150&&t<500){ const k=OWN.k(t,150,500); c.strokeStyle=OWN.rgb([245,225,170],0.9*(1-k)); c.lineWidth=3; c.beginPath(); c.arc(o0.x,o0.y,S*(0.8+2*k),d>0?-0.7:Math.PI-0.7,d>0?0.7:Math.PI+0.7); c.stroke(); }
      const wk=OWN.k(t,200,560); if(wk<=0||t>1100) return; const a=t<850?1:1-OWN.k(t,850,1100), fx=o0.x+(tg.x+d*R*0.3-o0.x)*eo(wk), gy=(px)=>sg+(gnd-sg)*Math.min(1,Math.max(0,(px-o0.x)/((tg.x-o0.x)||1)));
      for(let i=0;i<10;i++){ const q=i/9, px=o0.x+(fx-o0.x)*q; PF(px,gy(px)-S*0.4,S*(0.4+0.7*q),0.55*a*q,[220,195,150]); }
      const h=R*(0.45+0.5*wk); c.save(); c.globalAlpha*=a; const g=c.createLinearGradient(0,gy(fx)-h,0,gy(fx)); g.addColorStop(0,OWN.rgb([245,215,150],1)); g.addColorStop(1,OWN.rgb(shade,1)); c.fillStyle=g; c.beginPath();
      const back=o0.x+(fx-o0.x)*0.35; c.moveTo(back,gy(back)); for(let i=0;i<=16;i++){ const q=i/16, px=back+(fx-back)*q; c.lineTo(px,gy(px)-h*Math.pow(q,1.8)*(1+0.05*Math.sin(t/50+i))); } c.quadraticCurveTo(fx+d*R*0.35,gy(fx)-h*0.95,fx+d*R*0.3,gy(fx)); c.closePath(); c.fill();
      c.fillStyle="rgba(255,240,200,.5)"; for(let i=0;i<5;i++){ const q=0.5+i*0.1, px=back+(fx-back)*q; c.fillRect(px,gy(px)-h*Math.pow(q,1.8)*0.6,S*0.5,1.5); } c.restore();
      for(let i=0;i<70;i++){ const q=((t/280)+atH(i))%1, sx=fx+d*R*0.2, px=sx+d*q*R*0.9*(0.3+atH(i*3))-(1-q)*0, py=gy(fx)-h*0.9-R*0.9*Math.sin(Math.PI*q)*atH(i*5)+q*q*h*0.8; c.fillStyle=OWN.rgb(i%3?sand:shade,a*(1-q*0.5)); c.fillRect(px,py,1.2+atH(i)*1.8,1.2+atH(i)*1.8); }
      const bk=OWN.k(t,520,1100); if(bk>0){ c.save(); c.globalAlpha*=a; c.fillStyle=OWN.rgb(sand,1); c.beginPath(); c.ellipse(tg.x,gnd,R*1.1,R*0.25*Math.min(1,bk*3),0,Math.PI,0); c.fill(); c.restore(); } } }); } },
  /* Werewolf: a pale moon rises behind it while it howls, then jagged walls of sound tear across the ground and slam the foe */
  Werewolf:{at:HN("Werewolf"),col:[220,225,255],
    atk:(t,pos)=>t<220?{rot:0.15*(pos.dir||1),arc:-3}:t<700?{rot:-0.05*(pos.dir||1),off:[Math.sin(t/8)*1.5,0]}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,head,sg,gnd}=P, moon={x:P.s.x-d*R*0.4,y:(P.s.top?P.s.top.y:P.s.y-R)-R*1.0};
      const ma=t<200?eo(t/200):t<900?1:1-OWN.k(t,900,1120); if(ma>0){ const my=moon.y+R*0.6*(1-ma); atGlowA(c,moon.x,my,R*1.6,[220,225,255],0.5*ma); c.fillStyle=OWN.rgb([240,242,255],0.9*ma); c.beginPath(); c.arc(moon.x,my,R*0.75,0,7); c.fill();
        c.fillStyle=OWN.rgb([205,210,235],0.8*ma); for(const [dx,dy,r] of [[-0.25,-0.2,0.16],[0.2,0.15,0.12],[0.05,-0.35,0.08]]){ c.beginPath(); c.arc(moon.x+dx*R,my+dy*R,r*R,0,7); c.fill(); } }
      const L=Math.abs(tg.x-o0.x)+R*0.4;
      for(let i=0;i<3;i++){ const k=OWN.k(t,200+i*110,200+i*110+420); if(k<=0||k>=1) continue; const cx=o0.x+d*(S*1.2+L*eo(k)), hh=R*(0.5+0.75*k), a=1-k*0.6, teeth=9;
        c.save(); c.globalAlpha*=a; c.beginPath(); for(let j=0;j<=teeth*2;j++){ const q=j/(teeth*2), yy=o0.y-hh+q*hh*2, bulge=Math.sin(q*Math.PI)*S*1.2, spike=(j%2?S*0.75:0)*(0.7+0.5*atH(i*20+j)); c.lineTo(cx+d*(bulge+spike),yy); }
        for(let j=teeth*2;j>=0;j--){ const q=j/(teeth*2), yy=o0.y-hh+q*hh*2, bulge=Math.sin(q*Math.PI)*S*1.2; c.lineTo(cx+d*(bulge-S*0.55),yy); } c.closePath();
        const g=c.createLinearGradient(cx-d*S*0.6,0,cx+d*S*1.8,0); g.addColorStop(0,"rgba(120,30,40,.0)"); g.addColorStop(0.45,"rgba(170,40,50,.65)"); g.addColorStop(1,"rgba(240,240,255,.95)"); c.fillStyle=g; c.fill(); c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=1.5; c.stroke(); c.restore();
        for(let j=0;j<4;j++){ const yy=o0.y+(atH(i*7+j)-0.5)*hh*1.6; c.strokeStyle=OWN.rgb([230,230,245],0.7*a); c.lineWidth=2; c.beginPath(); c.moveTo(cx-d*S*(1.5+atH(j)*1.5),yy); c.lineTo(cx-d*S*0.6,yy); c.stroke(); }
        SG.dust(c,cx,sg+(gnd-sg)*k,S*1.0,Math.min(1,k*1.5),4); }
      const hk=OWN.k(t,440,820); if(hk>0&&hk<1){ for(let j=0;j<7;j++){ const aa=(j/6-0.5)*2.4+(d>0?0:Math.PI), v=R*(0.6+1.2*eo(hk)); c.save(); c.translate(tg.x+Math.cos(aa)*v,tg.y+Math.sin(aa)*v*0.7); c.rotate(aa+hk*4); c.fillStyle=OWN.rgb([235,235,250],1-hk); c.beginPath(); c.moveTo(S*0.5,0); c.lineTo(-S*0.3,-S*0.18); c.lineTo(-S*0.3,S*0.18); c.closePath(); c.fill(); c.restore(); }
        for(let j=0;j<3;j++){ c.strokeStyle=OWN.rgb([200,40,60],0.9*(1-hk)); c.lineWidth=3; c.beginPath(); const yy=tg.y-R*0.4+j*R*0.35; c.moveTo(tg.x-R*0.5,yy-R*0.15); c.lineTo(tg.x+R*0.5,yy+R*0.15); c.stroke(); } } } },
  /* Minotaur: its nose ring rattles, steam blasts from its nostrils and the ground cracks toward the foe */
  Minotaur:{at:HN("Minotaur"),col:[230,200,180],
    atk:(t,pos)=>t<200?{pose:"crouch",rot:0.08*(pos.dir||1)}:t<300?{arc:-6}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd}=P;
      if(t<300) for(const sd of [-1,1]){ c.strokeStyle=OWN.rgb([200,180,120],0.9); c.lineWidth=1.8; c.beginPath(); c.arc(o0.x+sd*Math.sin(t/12)*2,o0.y+S*0.4,S*0.45,0.2,Math.PI-0.2); c.stroke(); }
      if(t>180&&t<800) for(let j=0;j<2;j++) for(let i=0;i<6;i++){ const k=((t-180)/340+i/6)%1; SG.puff(c,o0.x+d*S*(0.4+2.6*k),o0.y+(j-0.5)*S*0.5+k*S*0.6,S*(0.3+0.7*k),0.8*(1-k)*(t<650?1:1-OWN.k(t,650,800)),[245,245,250]); }
      const ck=OWN.k(t,240,480); if(ck>0&&t<1100){ const a=t<900?1:1-OWN.k(t,900,1100), x0=o0.x+d*S, x1=tg.x; c.strokeStyle=OWN.rgb([70,45,30],0.95*a); c.lineWidth=3; c.lineJoin="round"; c.beginPath();
        for(let i=0;i<=16;i++){ const q=i/16; if(q>ck) break; const px=x0+(x1-x0)*q, py=sg+(gnd-sg)*q+(i%2?3:-3); c[i?"lineTo":"moveTo"](px,py); } c.stroke();
        for(let i=0;i<5;i++){ const q=i/5; if(q>ck) continue; const k=Math.min(1,(ck-q)*3), px=x0+(x1-x0)*q; c.fillStyle=OWN.rgb([120,90,60],a*(1-k)); c.beginPath(); c.arc(px+Math.sin(i)*4,sg+(gnd-sg)*q-R*0.6*Math.sin(Math.PI*k),2.5,0,7); c.fill(); }
        if(ck>=1){ const bk=OWN.k(t,440,800); if(bk<1) SG.dust(c,tg.x,gnd,R*0.8,bk,8); } } } },
  /* Thunderbird: a dark cloud gathers over the foe and rumbles, then a bolt flashes down */
  Thunderbird:{at:HN("Thunderbird"),col:[255,230,110],
    atk:(t)=>t<220?{arc:-4*eo(t/220),pose:"cast"}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,head}=P, cy=head.y-R*0.45, a=t<950?1:1-OWN.k(t,950,1120);
      if(t>120){ const g=eo(OWN.k(t,120,380)), sh=t>380&&t<900?Math.sin(t/14)*2:0; OWN.cloud(c,tg.x+sh,cy,R*0.75*g,[95,95,115],0.95*a); OWN.cloud(c,tg.x-R*0.4+sh,cy+R*0.1,R*0.5*g,[80,80,100],0.9*a);
        for(let i=0;i<3;i++){ const q=((t/200)+i/3)%1; if(t<380) break; c.strokeStyle=OWN.rgb([150,150,175],0.6*(1-q)*a); c.lineWidth=2; c.beginPath(); c.arc(tg.x,cy,R*(0.9+q*0.6),0.3,Math.PI-0.3); c.stroke(); } }
      if(t>140&&t<380) for(let i=0;i<3;i++){ const k=OWN.k(t,140+i*60,300+i*60); if(k<=0||k>=1) continue; OWN.zig(c,o0.x,o0.y,o0.x+(tg.x-o0.x)*k,o0.y+(cy-o0.y)*k,5,S*0.4,i+Math.floor(t/40),OWN.rgb(o.col,0.8),1.6); }
      const bk=OWN.k(t,440,640); if(bk>0&&bk<1){ OWN.zig(c,tg.x,cy+R*0.3,tg.x,tg.y+R*0.3,7,S*0.6,Math.floor(t/35),OWN.rgb([255,255,255],1-bk),4); OWN.zig(c,tg.x,cy+R*0.3,tg.x,tg.y+R*0.3,7,S*0.9,Math.floor(t/35)+4,OWN.rgb(o.col,1-bk),2); atGlowA(c,tg.x,tg.y,R*1.2,o.col,0.6*(1-bk)); } } },
  /* Griffin: a sharp cry drills out as a narrow spear of sound wrapped in spinning rings, bursts through the foe and leaves its head ringing */
  Griffin:{at:HN("Griffin"),col:[255,240,210],
    atk:(t,pos)=>t<220?{rot:0.12*(pos.dir||1),pose:"cast"}:t<500?{rot:-0.06*(pos.dir||1)}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,head}=P, end={x:tg.x,y:tg.y-R*0.3}, gold=[255,215,120];
      if(t<260&&t>60){ const q=OWN.k(t,60,260); atGlowA(c,o0.x,o0.y,S*1.6*q,[255,250,230],0.7); for(let i=0;i<6;i++){ const aa=i/6*7+t/40; c.strokeStyle=OWN.rgb(gold,q); c.lineWidth=2; c.beginPath(); c.moveTo(o0.x+Math.cos(aa)*S*2*(1-q),o0.y+Math.sin(aa)*S*2*(1-q)); c.lineTo(o0.x+Math.cos(aa)*S*2.4*(1-q)+Math.cos(aa)*3,o0.y+Math.sin(aa)*S*2.4*(1-q)); c.stroke(); } }
      const k=OWN.k(t,260,440), fade=OWN.k(t,440,700); if(k>0&&fade<1){ const hx=o0.x+(end.x-o0.x)*ei(k), hy=o0.y+(end.y-o0.y)*ei(k), a=1-fade, w=S*0.55;
        const g=c.createLinearGradient(o0.x,o0.y,hx,hy); g.addColorStop(0,OWN.rgb(gold,0.15*a)); g.addColorStop(1,OWN.rgb([255,255,255],0.95*a)); c.fillStyle=g; c.beginPath(); c.moveTo(o0.x,o0.y-w); c.lineTo(hx,hy); c.lineTo(o0.x,o0.y+w); c.closePath(); c.fill();
        const len=Math.hypot(hx-o0.x,hy-o0.y), ang=Math.atan2(hy-o0.y,hx-o0.x); for(let i=0;i<6;i++){ const q=((t/90)+i/6)%1, px=o0.x+(hx-o0.x)*q, py=o0.y+(hy-o0.y)*q, rr=w*(1-q)*1.6+3;
          c.save(); c.translate(px,py); c.rotate(ang); c.strokeStyle=OWN.rgb(i%2?gold:[255,255,255],0.85*a); c.lineWidth=2; c.beginPath(); c.ellipse(0,0,rr*0.3,rr,0,0,7); c.stroke(); c.restore(); }
        atGlowA(c,hx,hy,S*1.4,[255,250,230],0.9*a); OWN.star(c,hx,hy,S*(0.6+0.4*Math.sin(t/20)),OWN.rgb([255,255,255],a),t/60); }
      const bk=OWN.k(t,440,700); if(bk>0&&bk<1){ for(let i=0;i<8;i++){ const aa=i/8*7+0.4; c.strokeStyle=OWN.rgb(gold,1-bk); c.lineWidth=2.5; c.beginPath(); c.moveTo(end.x+Math.cos(aa)*R*0.5*(1+bk),end.y+Math.sin(aa)*R*0.5*(1+bk)); c.lineTo(end.x+Math.cos(aa)*R*(0.9+bk),end.y+Math.sin(aa)*R*(0.9+bk)); c.stroke(); } }
      const sk=OWN.k(t,460,1120); if(sk>0&&sk<1){ const a=sk<0.8?1:1-(sk-0.8)/0.2; for(let i=0;i<4;i++){ const aa=t/110+i/4*7; OWN.star(c,head.x+Math.cos(aa)*R*0.65,head.y-S*0.3+Math.sin(aa)*S*0.45,S*0.45,OWN.rgb([255,230,110],a),t/80); } } } },
  /* Cerberus: the three heads bark one after another, each sending its own burst */
  Cerberus:{at:[0.6,0.2],col:[140,190,255],
    atk:(t)=>t>150&&t<800?{off:[0,-2*Math.abs(Math.sin(t/(120/Math.PI)))]}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {tg,d,S,R}=P, heads=OWN_HORN.Cerberus.at.map(uv=>OWN.pt(P.s,tg,uv)), cols=[[255,140,90],[140,190,255],[255,210,100]];
      heads.forEach((h,i)=>{ const t0=160+i*120, k=OWN.k(t,t0,t0+300); if(k<=0) return; const end={x:tg.x+(i-1)*R*0.35,y:tg.y-R*0.3+(i-1)*R*0.2};
        if(k<0.25){ c.strokeStyle=OWN.rgb(cols[i],0.9); c.lineWidth=2.4; for(let j=-1;j<=1;j++){ c.beginPath(); c.moveTo(h.x+d*S*0.6,h.y+j*S*0.5); c.lineTo(h.x+d*S*(1+k*3),h.y+j*S*(0.7+k*2)); c.stroke(); } }
        if(k<1){ const p=OWN.go(h,end,eo(k),S*0.4,0); OWN.burstShape(c,p.x,p.y,S*(0.9+0.9*k),OWN.rgb(cols[i],0.95),OWN.rgb([255,255,255],0.9),t/200); return; }
        const hk=OWN.k(t,t0+300,t0+520); if(hk<1) OWN.burstShape(c,end.x,end.y,S*(1.8+1.2*hk),OWN.rgb(cols[i],0.9*(1-hk)),null,hk); }); } },
  /* Dagon: a dark wall of water rises and rolls over the foe with bubbles churning in it, and leaves the foe dripping */
  Dagon:{at:HN("Dagon"),col:[120,200,210],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd}=P, col=o.col, deep=[30,70,90];
      const wk=OWN.k(t,160,600), fade=OWN.k(t,760,1060); if(wk>0&&fade<1){ const front=o0.x+d*(Math.abs(tg.x-o0.x)+R*1.3)*eo(wk), back=o0.x-d*S*0.5, h=R*(0.6+1.4*eo(Math.min(1,wk*1.4)))*(1-fade*0.6), a=1-fade;
        const base=(px)=>sg+(gnd-sg)*Math.min(1,Math.max(0,(px-o0.x)/((tg.x-o0.x)||1)))+S*0.2;
        c.save(); c.globalAlpha*=0.78*a; const g=c.createLinearGradient(0,base(front)-h,0,base(front)); g.addColorStop(0,OWN.rgb(OWN.mix(col,[255,255,255],0.2),1)); g.addColorStop(1,OWN.rgb(deep,1)); c.fillStyle=g; c.beginPath(); c.moveTo(back,base(back));
        const N=24; for(let i=0;i<=N;i++){ const q=i/N, px=back+(front-back)*q, crest=h*Math.pow(q,1.6)*(1+0.08*Math.sin(t/60+i)); c.lineTo(px,base(px)-crest); }
        c.quadraticCurveTo(front+d*R*0.5,base(front)-h*1.05,front+d*R*0.25,base(front)-h*0.55); c.lineTo(front,base(front)); c.closePath(); c.fill(); c.restore();
        for(let i=0;i<10;i++){ const q=0.55+i*0.045, px=back+(front-back)*Math.min(1,q), py=base(px)-h*Math.pow(Math.min(1,q),1.6); c.fillStyle=OWN.rgb([240,250,252],0.9*a); c.beginPath(); c.arc(px+Math.sin(t/40+i)*2,py-S*0.15,S*(0.18+0.12*atH(i)),0,7); c.fill(); }
        for(let i=0;i<12;i++){ const k=((t/400)+i/12)%1, px=back+(front-back)*(0.25+0.7*atH(i*3)), py=base(px)-h*0.3*(0.2+0.8*k); OWN.bubble(c,px+Math.sin(t/50+i)*3,py-k*h*0.4,S*(0.12+0.2*atH(i)),[200,240,245],false); } }
      const dk=OWN.k(t,620,1120); if(dk>0&&dk<1){ c.fillStyle=OWN.rgb(deep,0.25*(1-dk)); c.beginPath(); c.ellipse(tg.x,tg.y,R*1.05,R*1.0,0,0,7); c.fill(); for(let i=0;i<5;i++){ const q=(dk*1.5+atH(i))%1; OWN.drop(c,tg.x+(i-2)*R*0.38,tg.y+R*0.2+q*R*0.8,S*0.32,Math.PI/2,OWN.mix(col,[255,255,255],0.2)); } } } },
  /* Gug: its huge mouth opens and a dark growl rolls out along the ground in heavy jagged rings, cracking the earth, as a shadow of jaws looms over the trembling foe */
  Gug:{at:HN("Gug"),col:[160,60,80],
    atk:(t)=>t>200&&t<900?{off:[Math.sin(t/7)*2,0],sy:1.05,sx:1.04}:null,
    fx(c,t,x,o){ OWN.twoPass(c,x,(cc,PF)=>{ const c0=cc; { const c=c0; const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd,head}=P, a=t<900?1:1-OWN.k(t,900,1120), dark=[70,20,50];
      if(t>150&&t<900) PF(o0.x+d*S*0.5,o0.y,S*(1+0.3*Math.sin(t/30)),0.7*a,[60,20,40]);
      for(let i=0;i<4;i++){ const k=OWN.k(t,200+i*120,200+i*120+600); if(k<=0||k>=1) continue; const cx=o0.x+d*(tg.x-o0.x)*k*0.55, cy=sg+(gnd-sg)*k*0.55, rx=R*(0.6+2.3*k), ry=rx*0.26;
        c.save(); c.globalAlpha*=a*(1-k); c.beginPath(); for(let j=0;j<=36;j++){ const aa=Math.PI+j/36*Math.PI, jag=(j%2?1:0.82); c.lineTo(cx+Math.cos(aa)*rx*jag,cy+Math.sin(aa)*ry*jag); } c.lineWidth=8*(1-k*0.5); c.strokeStyle=OWN.rgb(dark,0.85); c.stroke(); c.lineWidth=2.5; c.strokeStyle=OWN.rgb([200,80,120],0.9); c.stroke(); c.restore(); }
      const ck=OWN.k(t,260,520); if(ck>0){ c.strokeStyle=OWN.rgb([50,30,30],0.9*a); c.lineWidth=3; c.lineJoin="round"; for(const off of [-1,1]){ c.beginPath(); for(let i=0;i<=14;i++){ const q=i/14; if(q>ck) break; const px=o0.x+d*S+(tg.x-o0.x-d*S)*q, py=sg+(gnd-sg)*q+off*S*0.25*q+(i%2?2.5:-2.5); c[i?"lineTo":"moveTo"](px,py); } c.stroke(); }
        for(let i=0;i<8;i++){ const q=i/8; if(q>ck) continue; const kk=Math.min(1,(ck-q)*3+OWN.k(t,520,900)), px=o0.x+(tg.x-o0.x)*q; c.fillStyle=OWN.rgb([110,80,60],a*(1-kk*0.6)); c.beginPath(); c.arc(px+Math.sin(i)*5,sg+(gnd-sg)*q-R*0.5*Math.sin(Math.PI*Math.min(1,kk)),2.5+atH(i)*2,0,7); c.fill(); } }
      const jk=OWN.k(t,380,1000); if(jk>0&&jk<1){ const ja=Math.sin(Math.PI*jk)*0.55*a, jy=head.y-R*0.4, gap=R*0.35*(1-Math.min(1,jk*1.8)); c.save(); c.globalAlpha*=ja; c.fillStyle=OWN.rgb([40,10,30],1);
        for(const sd of [-1,1]){ c.beginPath(); c.ellipse(tg.x,jy+sd*(gap+R*0.25),R*1.3,R*0.32,0,sd<0?Math.PI:0,sd<0?Math.PI*2:Math.PI); c.fill(); c.fillStyle="#f4ecd8"; for(let j=0;j<6;j++){ const tx=tg.x-R*1.0+j*R*0.4; c.beginPath(); c.moveTo(tx-R*0.12,jy+sd*gap); c.lineTo(tx+R*0.12,jy+sd*gap); c.lineTo(tx,jy+sd*(gap-R*0.3)); c.closePath(); c.fill(); } c.fillStyle=OWN.rgb([40,10,30],1); } c.restore(); }
      const fk=OWN.k(t,440,1120); if(fk>0&&fk<1){ OWN.tremble(c,tg,R,t,[90,30,50],0.9*(1-fk)); OWN.drop(c,tg.x+R*0.7,tg.y-R*0.5+fk*R*0.4,S*0.28,Math.PI/2,[150,200,255]); } } }); } },
  /* Hastur: its rags flutter and pale theatre masks float over to the foe, laughing */
  Hastur:{at:HN("Hastur"),col:[240,210,90],
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P;
      const mask=(px,py,s,rot,a)=>{ c.save(); c.globalAlpha*=a; c.translate(px,py); c.rotate(rot); c.fillStyle="#f4eedc"; c.beginPath(); c.moveTo(-s,-s*0.7); c.quadraticCurveTo(0,-s*1.1,s,-s*0.7); c.quadraticCurveTo(s*1.05,s*0.4,0,s*1.05); c.quadraticCurveTo(-s*1.05,s*0.4,-s,-s*0.7); c.fill();
        c.strokeStyle="#b49a40"; c.lineWidth=1.4; c.stroke(); c.fillStyle="#2a2018"; for(const sd of [-1,1]){ c.beginPath(); c.moveTo(sd*s*0.6,-s*0.25); c.quadraticCurveTo(sd*s*0.35,-s*0.5,sd*s*0.12,-s*0.25); c.quadraticCurveTo(sd*s*0.35,-s*0.1,sd*s*0.6,-s*0.25); c.fill(); }
        c.beginPath(); c.moveTo(-s*0.5,s*0.25); c.quadraticCurveTo(0,s*(0.75+0.15*Math.sin(t/40)),s*0.5,s*0.25); c.quadraticCurveTo(0,s*0.45,-s*0.5,s*0.25); c.fill(); c.restore(); };
      if(t<900) for(let i=0;i<3;i++){ const sw=Math.sin(t/50+i)*S*0.4; c.strokeStyle=OWN.rgb([200,170,70],0.8); c.lineWidth=2; c.beginPath(); c.moveTo(o0.x-d*S*0.3,o0.y+S*(0.6+i*0.5)); c.quadraticCurveTo(o0.x-d*S*1.2,o0.y+S*(0.8+i*0.5)+sw,o0.x-d*S*1.8,o0.y+S*(1+i*0.5)+sw*1.5); c.stroke(); }
      for(let i=0;i<3;i++){ const t0=160+i*90, k=OWN.k(t,t0,t0+420); if(k<=0) continue; const end={x:tg.x+(i-1)*R*0.55,y:tg.y-R*0.5+(i%2)*R*0.4};
        if(k<1){ const p=OWN.go(o0,end,eio(k),S*(1+i*0.5),Math.sin(k*7+i)*S*0.5); mask(p.x,p.y,S*0.8,Math.sin(t/70+i)*0.4,0.95); continue; }
        const hk=OWN.k(t,t0+420,1120); if(hk<1) mask(end.x+Math.sin(t/30+i)*3,end.y-hk*R*0.5,S*0.8*(1+hk*0.4),Math.sin(t/25+i)*0.5,0.95*(1-hk)); } } }
};
for(const f in OWN_HORN2) if(!OWN_HORN2[f].sz) OWN_HORN2[f].sz=1.4;
(()=>{ if(typeof ANIM==="undefined"||!ANIM.trumpet) return; const K=ANIM.trumpet, fx1=K.fx, atk1=K.atk;
  K.fx=function(c,t,x){ const o=x&&OWN_HORN2[x.fam]; if(!o) return fx1.call(this,c,t,x); try{ return OWN.softLayer(c,x,cc=>o.fx(cc,t,x,o)); }catch(e){ if(!OWN.err){ OWN.err=1; console.error('OWN trumpet',x.fam,e&&e.message); } } };
  K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&OWN_HORN2[pos.fam], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; }; })();

/* ---------- propthrow, own versions (18 Nov 2026): every family threw its prop with the same punch and arc, so each now throws
   in its own way. The prop still comes from the move name. Wind-up to 200 ms, contact at 620, done by 1000. ---------- */
OWN.prop=(c,x,kind,px,py,rot,sc,a=1)=>{ if(a<=0) return; c.save(); c.translate(px,py); c.rotate(rot); c.globalAlpha*=a; c.scale(sc,sc); MV.prop(c,kind,0,0,x); c.restore(); };
OWN.pk=(x)=>typeof ptProp==="function"?ptProp(x.name||""):"ball";
OWN.streak=(c,pts,col,w)=>{ c.lineCap="round"; for(let i=1;i<pts.length;i++){ c.strokeStyle=OWN.rgb(col,0.5*i/pts.length); c.lineWidth=w*i/pts.length; c.beginPath(); c.moveTo(pts[i-1].x,pts[i-1].y); c.lineTo(pts[i].x,pts[i].y); c.stroke(); } };
OWN.bonk=(c,x,y,R,k,col=[255,240,190])=>{ if(k<=0||k>=1) return; for(let j=0;j<6;j++){ const a=j/6*7+0.3, v=R*(0.35+0.8*eo(k)); OWN.star(c,x+Math.cos(a)*v,y+Math.sin(a)*v*0.7,R*0.18*(1-k),OWN.rgb(col,1-k),k*3); } };
const OWN_PROP={
  /* Booly: a chair lifts off the ground in a ghostly glow, wobbles eerily, then hurls itself at the foe and breaks */
  Booly:{at:[0.9,0.5],sz:1.4,atk:(t)=>t<620?{pose:"cast",arc:-3*Math.sin(t/60)}:null,
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd}=P, k=OWN.pk(x), sc=2.6, rise={x:o0.x+d*S*1.7,y:sg-R*1.3}, wisp=[200,190,235];
      const tendrils=(p,a)=>{ for(let i=0;i<3;i++){ const ph=t/120+i*2.1; c.strokeStyle=OWN.rgb(wisp,0.55*a); c.lineWidth=S*(0.32-i*0.07); c.lineCap="round"; c.beginPath(); c.moveTo(o0.x+d*S*0.3,o0.y-S*0.2);
          c.bezierCurveTo(o0.x+d*S*(1.2+Math.sin(ph)*0.5),o0.y-S*(1.4+i*0.3),p.x-d*S*(1.0+Math.cos(ph)*0.4),p.y+S*(0.8+i*0.2),p.x+Math.sin(ph*1.3)*S*0.6,p.y+S*0.5*(i-1)); c.stroke(); }
        for(let i=0;i<4;i++){ const q=((t/300)+i/4)%1; c.fillStyle=OWN.rgb([230,225,250],0.7*a*(1-q)); c.beginPath(); c.arc(p.x+Math.sin(i*2+t/80)*S,p.y-S*0.3-q*S*1.4,S*0.12,0,7); c.fill(); } };
      if(t<200){ const q=eo(t/200), p={x:rise.x,y:sg-S*0.9+(rise.y-sg+S*0.9)*q}; c.fillStyle=OWN.rgb([60,40,70],0.25*q); c.beginPath(); c.ellipse(rise.x,sg,S*1.1*(1-q*0.4),S*0.25,0,0,7); c.fill();
        tendrils(p,q); for(let i=0;i<5;i++){ const dq=((t/150)+i/5)%1; c.fillStyle=OWN.rgb([170,140,110],0.8*(1-dq)); c.beginPath(); c.arc(p.x+(atH(i)-0.5)*S*1.4,p.y+S*0.9+dq*S*1.2,1.6,0,7); c.fill(); }
        OWN.prop(c,x,k,p.x+Math.sin(t/14)*2*q,p.y,Math.sin(t/35)*0.25,sc); return; }
      if(t<620){ const q=OWN.k(t,200,620), p=q<0.3?{x:rise.x+Math.sin(t/12)*3,y:rise.y+Math.sin(t/40)*3}:OWN.go(rise,{x:tg.x,y:tg.y},ei((q-0.3)/0.7),R*0.5,0), rot=q<0.3?Math.sin(t/30)*0.35:d*(q-0.3)*14;
        if(q<0.3) tendrils(p,1); else for(let i=1;i<4;i++){ const b=OWN.go(rise,{x:tg.x,y:tg.y},ei(Math.max(0,(q-0.3)/0.7-i*0.06)),R*0.5,0); SG.puff(c,b.x,b.y,S*(0.5-i*0.08),0.3*(1-i/4),wisp); }
        OWN.prop(c,x,k,p.x,p.y,rot,sc); return; }
      const q=OWN.k(t,620,1000);
      for(let i=0;i<7;i++){ const a=-Math.PI*0.9+i/6*Math.PI*0.8, v=R*(0.5+0.9*eo(q)); c.save(); c.translate(tg.x+Math.cos(a)*v,tg.y+Math.sin(a)*v+q*q*R*1.2); c.rotate(q*7+i); c.fillStyle=OWN.rgb(i%2?[176,120,70]:[140,95,55],1-q*0.7); c.strokeStyle=OWN.rgb([74,44,20],1-q*0.7); c.lineWidth=1; c.fillRect(-S*0.45,-S*0.1,S*0.9,S*0.2); c.strokeRect(-S*0.45,-S*0.1,S*0.9,S*0.2); c.restore(); }
      for(let i=0;i<10;i++){ const a=i/10*7, v=R*(0.3+0.7*eo(q)); c.strokeStyle=OWN.rgb([200,160,110],1-q); c.lineWidth=1.4; c.beginPath(); c.moveTo(tg.x+Math.cos(a)*v,tg.y+Math.sin(a)*v); c.lineTo(tg.x+Math.cos(a)*(v+S*0.4),tg.y+Math.sin(a)*(v+S*0.4)); c.stroke(); }
      SG.dust(c,tg.x,gnd,R,q,8); OWN.bonk(c,tg.x,tg.y-R*0.3,R*0.8,q); } },
  /* Fizz: the cork rockets off the top on a spray of foam and bonks the foe in a burst of bubbles */
  Fizz:{at:[0.5,-0.2],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, liq=P.parts||[150,235,170];
      if(t<200){ const q=t/200; OWN.prop(c,x,"cork",o0.x+Math.sin(t/12)*1.5,o0.y-S*0.2*q,0,2.2); for(let i=0;i<4;i++) OWN.bubble(c,o0.x+(i-1.5)*S*0.3,o0.y-S*0.3*q-i*2,S*0.15*q,liq,false); return; }
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go(o0,{x:tg.x,y:tg.y-R*0.3},eo(q),R*1.4,0);
        for(let i=0;i<8;i++){ const qq=Math.max(0,eo(q)-i*0.04), b=OWN.go(o0,{x:tg.x,y:tg.y-R*0.3},qq,R*1.4,0); OWN.bubble(c,b.x+(atH(i)-0.5)*S,b.y+(atH(i*3)-0.5)*S,S*(0.12+0.15*atH(i))*(1-i/9),liq,false); }
        if(q<0.25) for(let i=0;i<6;i++){ const a=-Math.PI/2+(i-2.5)*0.25, v=S*3*q/0.25; c.fillStyle=OWN.rgb(OWN.mix(liq,[255,255,255],0.4),1-q*4); c.beginPath(); c.arc(o0.x+Math.cos(a)*v,o0.y+Math.sin(a)*v,S*0.18,0,7); c.fill(); }
        OWN.prop(c,x,"cork",p.x,p.y,d*q*16,2.2); return; }
      const q=OWN.k(t,620,1000); OWN.pop(c,tg.x,tg.y-R*0.3,R*0.5,OWN.mix(liq,[255,255,255],0.3),q,10); OWN.prop(c,x,"cork",tg.x-d*R*q*1.2,tg.y-R*0.3-Math.sin(Math.PI*q)*R,-d*q*10,2.2,1-q); } },
  /* Clank: the wrench boomerangs round in a curve, cracks the foe and spins back to Clank; a gear rolls along the ground throwing sparks */
  Clank:{at:[1.0,0.55],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd}=P, k=OWN.pk(x);
      if(k==="gear"){ const r=S*0.9;
        if(t<200){ OWN.prop(c,x,k,o0.x+d*S*0.4,o0.y,t/30,2.4); return; }
        const q=OWN.k(t,200,620), gx=t<620?o0.x+(tg.x-d*R*0.4-o0.x)*eo(q):tg.x-d*R*0.4, gy=t<620?o0.y+(sg-r-o0.y)*Math.min(1,q*4)+(gnd-sg)*q:gnd-r, spin=d*t/25;
        if(t<1000){ const back=t<620?0:OWN.k(t,620,1000); OWN.prop(c,x,k,gx-d*back*R*0.8,gy-Math.sin(Math.PI*back)*R*0.5,spin,2.4,1-back*0.8);
          if(t<620) for(let i=0;i<3;i++){ const a=-Math.PI/2-d*(0.5+atH(i+Math.floor(t/40))); c.strokeStyle=OWN.rgb([255,210,90],0.9); c.lineWidth=1.6; c.beginPath(); c.moveTo(gx-d*r,gnd); c.lineTo(gx-d*r+Math.cos(a)*S*0.8,gnd+Math.sin(a)*S*0.8); c.stroke(); } }
        OWN.bonk(c,tg.x,tg.y,R,OWN.k(t,620,900)); return; }
      const st={x:o0.x+d*S*0.4,y:o0.y-S*0.3}, end={x:tg.x,y:tg.y-R*0.2};
      if(t<200){ OWN.prop(c,x,k,st.x,st.y,-d*1.2*eo(t/200),2.4); return; }
      const out=OWN.k(t,200,620), back=OWN.k(t,620,1000), curve=(q)=>{ const p=OWN.go(st,end,q,0,0); return {x:p.x,y:p.y+Math.sin(q*Math.PI)*R*0.9}; };
      const p=t<620?curve(eo(out)):(()=>{ const r=OWN.go(end,st,eio(back),0,0); return {x:r.x,y:r.y-Math.sin(back*Math.PI)*R*0.9}; })();
      OWN.prop(c,x,k,p.x,p.y,d*t/35,2.4); c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=2.5; c.beginPath(); c.arc(p.x,p.y,S*1.1,d*t/35-1.2,d*t/35); c.stroke();
      OWN.bonk(c,end.x,end.y,R,OWN.k(t,620,900),[255,230,150]); } },
  /* Twiglet: a leaf grows on its twig arm and gets flicked off, fluttering in a fast zigzag, and sticks in the foe */
  Twiglet:{at:[1.0,0.45],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x-d*R*0.3,y:tg.y-R*0.1};
      if(t<200){ const q=eo(t/200); OWN.prop(c,x,"leaf",o0.x+d*S*0.3,o0.y-S*0.3,-d*0.6,2.4*q); return; }
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go(o0,end,q,S*0.6,Math.sin(q*Math.PI*5)*S*1.2); for(let i=1;i<4;i++){ const qq=Math.max(0,q-i*0.04), b=OWN.go(o0,end,qq,S*0.6,Math.sin(qq*Math.PI*5)*S*1.2); OWN.prop(c,x,"leaf",b.x,b.y,Math.cos(qq*Math.PI*5)*0.8,2.4,0.25*(4-i)/3); } OWN.prop(c,x,"leaf",p.x,p.y,Math.cos(q*Math.PI*5)*0.8,2.4); return; }
      const q=OWN.k(t,620,1000); OWN.prop(c,x,"leaf",end.x,end.y,d*0.3+Math.sin(t/30)*0.15*(1-q),2.4,q<0.8?1:1-(q-0.8)/0.2); for(let i=0;i<4;i++){ const a=i/4*7+0.4; c.strokeStyle=OWN.rgb([150,220,110],1-q); c.lineWidth=2; c.beginPath(); c.moveTo(end.x+Math.cos(a)*R*0.3,end.y+Math.sin(a)*R*0.3); c.lineTo(end.x+Math.cos(a)*R*(0.5+0.4*q),end.y+Math.sin(a)*R*(0.5+0.4*q)); c.stroke(); } } },
  /* Ditty: it plucks a note out of the air and flings it like a dart, trailing sound rings, and the note rings out on the foe */
  Ditty:{at:[0.8,0.2],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.3}, col=[200,90,200];
      if(t<200){ const q=t/200; OWN.note(c,o0.x+d*S*(1.2-0.8*q),o0.y-S*(1.4-1.0*q),S*0.7,OWN.rgb(col,0.6+0.4*q),Math.sin(t/40)*0.5,true); return; }
      if(t<620){ const q=ei(OWN.k(t,200,620)), p=OWN.go(o0,end,q,S*0.5,0); for(let i=0;i<4;i++){ const qq=Math.max(0,q-i*0.07), b=OWN.go(o0,end,qq,S*0.5,0); c.strokeStyle=OWN.rgb([255,230,140],0.8*(1-i/4)); c.lineWidth=2; c.beginPath(); c.ellipse(b.x,b.y,S*0.25,S*(0.6+i*0.2),0,0,7); c.stroke(); }
        OWN.note(c,p.x,p.y,S*0.75,OWN.rgb(col,1),d*0.3,true); return; }
      const q=OWN.k(t,620,1000); for(let i=0;i<3;i++){ const qq=Math.max(0,q-i*0.15); if(qq>=1) continue; c.strokeStyle=OWN.rgb([255,230,140],1-qq); c.lineWidth=3; c.beginPath(); c.arc(end.x,end.y,R*(0.3+qq*1.0),0,7); c.stroke(); }
      for(let i=0;i<3;i++){ const a=-Math.PI/2+(i-1)*0.8; OWN.note(c,end.x+Math.cos(a)*R*(0.5+q),end.y+Math.sin(a)*R*(0.5+q),S*0.4,OWN.rgb(i%2?[120,170,255]:[255,140,170],1-q),0,i===1); } } },
  /* Magna: a scrap of metal drags across the ground to it, sticks, then gets flung away hard along the field lines */
  Magna:{at:[1.0,0.95],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg}=P, k=OWN.pk(x), far={x:o0.x-d*R*1.2,y:sg-S*0.3}, hold={x:o0.x+d*S*0.8,y:o0.y-S*0.3}, end={x:tg.x,y:tg.y-R*0.1};
      const field=(a)=>{ for(let i=0;i<3;i++){ c.strokeStyle=OWN.rgb(i%2?[255,90,90]:[90,150,255],a); c.lineWidth=1.6; c.beginPath(); c.ellipse(o0.x+d*S*0.6,o0.y-S*0.2,S*(1+i*0.5),S*(0.6+i*0.3),0,0,7); c.stroke(); } };
      if(t<200){ const q=ei(t/200); field(0.6); OWN.prop(c,x,k,far.x+(hold.x-far.x)*q,far.y+(hold.y-far.y)*q,t/40,2.4); return; }
      if(t<620){ const q=OWN.k(t,200,620); if(q<0.2){ field(0.8*(1-q*5)); OWN.prop(c,x,k,hold.x+Math.sin(t/8)*1.5,hold.y,0,2.4); return; } const qq=ei((q-0.2)/0.8), p=OWN.go(hold,end,qq,0,0);
        for(let i=0;i<4;i++){ const b=OWN.go(hold,end,Math.max(0,qq-i*0.05),0,0); c.strokeStyle=OWN.rgb(i%2?[255,90,90]:[90,150,255],0.6*(1-i/4)); c.lineWidth=2; c.beginPath(); c.arc(b.x,b.y,S*(0.5+i*0.3),0,7); c.stroke(); } OWN.prop(c,x,k,p.x,p.y,d*t/25,2.4); return; }
      const q=OWN.k(t,620,1000); OWN.bonk(c,end.x,end.y,R,q,[200,220,255]); for(let i=0;i<4;i++){ const a=i/4*7+Math.floor(t/50); OWN.zig(c,end.x,end.y,end.x+Math.cos(a)*R*0.9,end.y+Math.sin(a)*R*0.9,4,S*0.3,i+Math.floor(t/50),OWN.rgb(i%2?[255,90,90]:[90,150,255],1-q),1.6); } } },
  /* Cuppy: a wrapper unfurls off it and spins across like a throwing star, leaving a slash */
  Cuppy:{at:[0.9,0.5],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.1};
      if(t<200){ const q=eo(t/200); OWN.prop(c,x,"wrapper",o0.x+d*S*0.5*q,o0.y,q*3,2.4*(0.5+0.5*q)); return; }
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go(o0,end,ei(q),S*0.4,0); c.strokeStyle="rgba(255,255,255,.6)"; c.lineWidth=2; for(let i=0;i<2;i++){ c.beginPath(); c.arc(p.x,p.y,S*1.1,t/20+i*Math.PI,t/20+i*Math.PI+1.4); c.stroke(); } OWN.prop(c,x,"wrapper",p.x,p.y,t/18,2.4); return; }
      const q=OWN.k(t,620,900); if(q<1){ c.strokeStyle=OWN.rgb([255,255,255],1-q); c.lineWidth=4*(1-q)+1; c.beginPath(); c.moveTo(end.x-R*0.9,end.y-R*0.6); c.lineTo(end.x+R*0.9,end.y+R*0.6); c.stroke(); c.strokeStyle=OWN.rgb([255,150,190],1-q); c.lineWidth=2; c.stroke(); } } },
  /* Tome: its pages riffle, one tears out and spins edge-on like a blade, then slices across the foe */
  Tome:{at:[0.9,0.4],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.15}, two=/Razor/.test(x.name||"");
      if(t<200){ for(let i=0;i<4;i++){ const q=((t/80)+i/4)%1; c.save(); c.translate(o0.x,o0.y); c.scale(Math.cos(q*Math.PI),1); c.fillStyle="#fbf6e8"; c.fillRect(0,-S*0.5,S*0.7,S); c.strokeStyle="#c8bca0"; c.strokeRect(0,-S*0.5,S*0.7,S); c.restore(); } return; }
      for(let n=0;n<(two?2:1);n++){ const t0=200+n*90; if(t<t0) continue;
        if(t<t0+420){ const q=OWN.k(t,t0,t0+420), p=OWN.go(o0,{x:end.x,y:end.y+(n-0.5)*R*0.4*(two?1:0)},ei(q),S*(0.4+n*0.6),0); OWN.prop(c,x,"page",p.x,p.y,t/22+n,2.3); c.strokeStyle="rgba(255,255,255,.6)"; c.lineWidth=2; c.beginPath(); c.arc(p.x,p.y,S*1.0,t/22,t/22+1.3); c.stroke(); continue; }
        const q=OWN.k(t,t0+420,t0+700); if(q<1){ c.strokeStyle=OWN.rgb([255,255,255],1-q); c.lineWidth=3; c.beginPath(); c.moveTo(end.x-R*0.9,end.y+(n?R*0.5:-R*0.5)); c.lineTo(end.x+R*0.9,end.y+(n?-R*0.3:R*0.3)); c.stroke(); } } } },
  /* Gumball: the crank turns, a candy pops out of the chute, ricochets off the ground and bonks the foe on the head */
  Gumball:{at:[0.85,0.85],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,head}=P, k=OWN.pk(x), end={x:tg.x,y:head.y+S*0.2};
      if(t<200){ if(t>100){ const q=OWN.k(t,100,200); OWN.prop(c,x,k,o0.x+d*S*0.4*q,o0.y+S*0.2*q,0,2.2*q); } return; }
      const mid={x:(o0.x+tg.x)/2,y:sg-S*0.4};
      if(t<620){ const q=OWN.k(t,200,620), p=q<0.45?OWN.go(o0,mid,q/0.45,0,0):OWN.go(mid,end,(q-0.45)/0.55,R*0.8,0); if(q>0.43&&q<0.5) SG.dust(c,mid.x,sg,S*0.7,(q-0.43)/0.07,4); OWN.prop(c,x,k,p.x,p.y,d*t/30,2.2); return; }
      const q=OWN.k(t,620,1000); OWN.bonk(c,end.x,end.y,R*0.8,q); OWN.prop(c,x,k,end.x-d*R*1.2*q,end.y-R*Math.sin(Math.PI*q)+q*R*0.8,-d*t/30,2.2,1-q); } },
  /* Pina: crown leaves spin off its head like blades (two for Double Slice), or it lobs a small pineapple that bursts in juice */
  Pina:{at:[0.5,-0.1],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, k=OWN.pk(x), end={x:tg.x,y:tg.y-R*0.15}, n=/Double/.test(x.name||"")?2:1;
      if(k==="pineapple"){ if(t<200){ OWN.prop(c,x,k,o0.x+d*S*0.5,o0.y-S*0.8*eo(t/200),0,2.2); return; }
        if(t<620){ const q=OWN.k(t,200,620), p=OWN.go({x:o0.x+d*S*0.5,y:o0.y-S*0.8},end,q,R*1.6,0); OWN.prop(c,x,k,p.x,p.y,d*q*6,2.2); return; }
        const q=OWN.k(t,620,1000); OWN.splat(c,end.x,end.y,S*1.2,[255,215,80],q,61,3); for(let i=0;i<8;i++){ const a=-Math.PI+i/7*Math.PI, v=R*(0.5+0.8*eo(q)); c.fillStyle=OWN.rgb([255,225,90],1-q); c.beginPath(); c.arc(end.x+Math.cos(a)*v,end.y+Math.sin(a)*v+q*q*R,S*0.18,0,7); c.fill(); } return; }
      for(let i=0;i<n;i++){ const t0=200+i*80, st={x:o0.x+(i-0.5)*S*0.6,y:o0.y-S*0.2}; if(t<t0){ OWN.prop(c,x,"leaf",st.x,st.y-S*0.3,-Math.PI/2+(i-0.5)*0.6,2.2); continue; }
        if(t<t0+420){ const q=OWN.k(t,t0,t0+420), p=OWN.go(st,{x:end.x,y:end.y+(i-0.5)*R*0.5},q,S*(1+i),0); OWN.prop(c,x,"leaf",p.x,p.y,t/20*d,2.4); continue; }
        const q=OWN.k(t,t0+420,t0+700); if(q<1){ c.strokeStyle=OWN.rgb([200,255,150],1-q); c.lineWidth=3; c.beginPath(); c.moveTo(end.x-R*0.8,end.y-R*0.5+i*R*0.5); c.lineTo(end.x+R*0.8,end.y+R*0.2+i*R*0.3); c.stroke(); } } } },
  /* Presto: a fan of cards snaps open in its hand, one card is flicked spinning across and sticks in the foe */
  Presto:{at:[1.0,0.5],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, n=7;   /* seven cards (Gid, 19 Nov 2026: more cards): the fan snaps open and the cards are flicked out one after another, spinning, and stick in the foe in a spread */
      const endOf=i=>({x:tg.x-d*R*(0.35+0.15*atH(i*3))+(atH(i*7)-0.5)*R*0.5,y:tg.y-R*0.55+i/(n-1)*R*0.9}), t0=i=>200+i*35;
      if(t<200){ const q=eo(Math.min(1,t/180)); for(let i=0;i<n;i++) OWN.prop(c,x,"card",o0.x,o0.y,-d*0.6+(i-(n-1)/2)*0.2*q,2.1); return; }
      for(let i=0;i<n;i++){ const ts=t0(i), e=endOf(i);
        if(t<ts){ OWN.prop(c,x,"card",o0.x,o0.y,-d*0.6+(i-(n-1)/2)*0.2,2.1); continue; }
        if(t<ts+260){ const q=OWN.k(t,ts,ts+260), p=OWN.go(o0,e,ei(q),S*0.25*(i%2?1:-1),0); for(let j=1;j<3;j++){ const pq=OWN.go(o0,e,ei(Math.max(0,q-j*0.08)),S*0.25*(i%2?1:-1),0); OWN.prop(c,x,"card",pq.x,pq.y,d*(t-j*20)/16,2.0,0.25/j); } OWN.prop(c,x,"card",p.x,p.y,d*t/16,2.1); continue; }
        const q=OWN.k(t,ts+260,1000); OWN.prop(c,x,"card",e.x,e.y,d*(0.5+(atH(i)-0.5)*0.8),2.0,q<0.75?1:1-(q-0.75)/0.25); if(q<0.3) OWN.star(c,e.x,e.y,S*0.5*(1-q/0.3),"rgba(255,255,255,.9)",q*4); }
      if(t>620) OWN.bonk(c,tg.x,tg.y-R*0.3,R*0.7,Math.min(0.99,OWN.k(t,620,1000)*1.4)); } },
  /* Sarimanok: a fish flops in its beak, it tosses it flapping end over end, and the fish slaps the foe with a splash */
  Sarimanok:{at:[1.0,0.35],sz:1.4,   /* the fish it throws is the one in its beak (Gid, 19 Nov 2026): it flings it, turns away while the fish flies and turns back with a new one */
    /* after the toss it turns its head right round, away off the screen, and turns back with a new fish, so the new fish has somewhere to come from */
    atk:(t,pos)=>{ const dir=pos.dir||1;
      if(t<200) return {rot:-0.14*dir*eo(t/200)}; if(t<300) return {rot:0.12*dir*(1-OWN.k(t,200,300)),pose:"push"};
      if(t<380){ const k=OWN.k(t,300,380); return {look:[-0.6+1.5*k,-0.1*k],sx:1-0.35*Math.sin(Math.PI*k),rot:0.06*dir*k}; }
      if(t<540) return {sx:1,rot:0.06*dir,off:[-dir*2*Math.sin(t/35),-2*Math.abs(Math.sin(t/45))]};
      if(t<620){ const k=OWN.k(t,540,620); return {look:[0.9-1.5*k,-0.1*(1-k)],sx:1-0.35*Math.sin(Math.PI*k),rot:0.06*dir*(1-k)}; } return null; },
    fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.2}, sea=[150,215,240], st={x:o0.x+d*S*0.3,y:o0.y+S*0.2};
      if(typeof AT!=="undefined"&&AT.side) for(const sd of AT.side){ if(sd&&sd.spec&&sd.spec.family==="Sarimanok"&&sd.anim&&sd.anim.kind==="propthrow") sd.spec.noFishTe=t>=200&&t<580?AT.te:-1e9; sd.spec.backTe=t>=340&&t<580?AT.te:-1e9; }
      if(t<200) return;
      if(t>=580&&t<700){ const q=OWN.k(t,580,700); for(let i=0;i<5;i++){ const aa=i/5*7; OWN.star(c,st.x+Math.cos(aa)*S*(0.4+0.6*q),st.y+Math.sin(aa)*S*(0.4+0.6*q),S*0.22*(1-q),"rgba(255,250,210,.95)",q*4); } }
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go(st,end,q,R*1.3,0); OWN.prop(c,x,"fish",p.x,p.y,d*q*10+Math.sin(t/20)*0.4,2.4); for(let i=0;i<2;i++){ c.fillStyle=OWN.rgb(sea,0.8); c.beginPath(); c.arc(p.x-d*S*(0.8+i*0.6),p.y+S*0.3+i*3,S*0.15,0,7); c.fill(); } return; }
      const q=OWN.k(t,620,1000); OWN.pop(c,end.x,end.y,R*0.6,sea,q,10); OWN.prop(c,x,"fish",end.x-d*R*q,end.y-Math.sin(Math.PI*q)*R+q*q*R*1.3,-d*q*6,2.4,1-q*0.8); } }
};
(()=>{ if(typeof ANIM==="undefined"||!ANIM.propthrow) return; const K=ANIM.propthrow, fx1=K.fx;
  K.fx=function(c,t,x){ const o=x&&OWN_PROP[x.fam]; if(!o) return fx1.call(this,c,t,x); try{ OWN.softLayer(c,x,cc=>o.fx(cc,t,x,o)); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN propthrow",x.fam,e&&e.message); } } if(typeof atImpact==="function") atImpact(t,620,0.3,0.05); };
  const atk1=K.atk; K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&OWN_PROP[pos.fam], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; }; })();


/* ---------- detailed props (Gid, 18 Nov 2026: the stock props were flat shapes) ---------- */
OWN.lg=(c,x0,y0,x1,y1,stops)=>{ const g=c.createLinearGradient(x0,y0,x1,y1); stops.forEach(([o,col])=>g.addColorStop(o,col)); return g; };
OWN.rg=(c,x,y,r0,r1,stops,ox=0,oy=0)=>{ const g=c.createRadialGradient(x+ox,y+oy,r0,x,y,r1); stops.forEach(([o,col])=>g.addColorStop(o,col)); return g; };
OWN.rr=(c,x,y,w,h,r)=>{ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); };
OWN.PROPS={
  chair(c,s,t){ const wood=OWN.lg(c,-s,0,s,0,[[0,"#9c6a3c"],[0.5,"#c08850"],[1,"#7a4e2a"]]); c.lineJoin="round"; c.strokeStyle="#4a2c14"; c.lineWidth=Math.max(1,s*0.07);
    for(const [x0,x1] of [[-0.75,-0.6],[0.55,0.7],[-0.45,-0.32],[0.82,0.95]]){ c.fillStyle=wood; c.beginPath(); c.rect(s*x0,s*0.1,s*(x1-x0),s*1.0); c.fill(); OWN.ol(c); }
    c.fillStyle=OWN.lg(c,0,-s*0.1,0,s*0.25,[[0,"#d8a066"],[1,"#9a6234"]]); c.beginPath(); c.moveTo(-s*0.85,s*0.1); c.lineTo(s*0.75,s*0.1); c.lineTo(s*1.0,-s*0.12); c.lineTo(-s*0.55,-s*0.12); c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle=wood; for(const x0 of [-0.85,0.45]){ c.beginPath(); c.rect(s*x0,-s*1.25,s*0.17,s*1.37); c.fill(); OWN.ol(c); }
    for(let i=0;i<3;i++){ c.fillStyle=i%2?"#b47c46":"#c48a52"; c.beginPath(); c.rect(-s*0.7,-s*(1.1-i*0.33),s*1.17,s*0.16); c.fill(); OWN.ol(c); }
    c.strokeStyle="rgba(80,45,20,.45)"; c.lineWidth=0.8; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-s*0.5+i*s*0.3,-s*0.08); c.quadraticCurveTo(-s*0.4+i*s*0.3,0,-s*0.55+i*s*0.3,s*0.06); c.stroke(); }
    c.fillStyle="rgba(255,235,200,.35)"; c.fillRect(-s*0.83,-s*1.2,s*0.05,s*1.2); },
  cork(c,s){ c.strokeStyle="#5a3a1c"; c.lineWidth=Math.max(1,s*0.07); c.fillStyle=OWN.lg(c,-s*0.5,0,s*0.5,0,[[0,"#a8743e"],[0.45,"#d9a66a"],[1,"#8a5a2c"]]);
    c.beginPath(); c.moveTo(-s*0.55,-s*0.6); c.lineTo(s*0.55,-s*0.6); c.lineTo(s*0.45,s*0.7); c.lineTo(-s*0.45,s*0.7); c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle="#e2b67a"; c.beginPath(); c.ellipse(0,-s*0.6,s*0.55,s*0.18,0,0,7); c.fill(); OWN.ol(c); c.fillStyle="#9a6634"; for(let i=0;i<14;i++){ c.beginPath(); c.arc((atH(i)-0.5)*s*0.85,-s*0.4+atH(i*3)*s*1.0,s*(0.04+0.04*atH(i*7)),0,7); c.fill(); }
    for(let i=0;i<5;i++){ c.beginPath(); c.arc((atH(i+20)-0.5)*s*0.8,-s*0.6+(atH(i*5)-0.5)*s*0.18,s*0.035,0,7); c.fill(); } c.fillStyle="rgba(255,255,255,.3)"; c.fillRect(-s*0.3,-s*0.45,s*0.1,s*1.0); },
  leaf(c,s,t){ c.save(); c.rotate(-0.2); c.fillStyle=OWN.lg(c,0,-s*0.5,0,s*0.5,[[0,"#8ad86a"],[0.6,"#4fae46"],[1,"#2f7a34"]]); c.strokeStyle="#22582a"; c.lineWidth=Math.max(1,s*0.06);
    c.beginPath(); c.moveTo(-s*1.1,0); c.bezierCurveTo(-s*0.5,-s*0.75,s*0.6,-s*0.65,s*1.2,0); c.bezierCurveTo(s*0.6,s*0.55,-s*0.5,s*0.7,-s*1.1,0); c.fill(); OWN.ol(c);
    c.strokeStyle="#2e6e30"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); c.moveTo(-s*1.35,s*0.12); c.quadraticCurveTo(0,s*0.02,s*1.1,0); c.stroke(); c.lineWidth=Math.max(0.8,s*0.04);
    for(let i=0;i<5;i++){ const x0=-s*0.7+i*s*0.38; c.beginPath(); c.moveTo(x0,0); c.quadraticCurveTo(x0+s*0.15,-s*0.2,x0+s*0.32,-s*0.36); c.moveTo(x0,0); c.quadraticCurveTo(x0+s*0.15,s*0.18,x0+s*0.3,s*0.32); c.stroke(); }
    c.fillStyle="rgba(255,255,255,.3)"; c.beginPath(); c.ellipse(-s*0.1,-s*0.28,s*0.5,s*0.1,-0.15,0,7); c.fill(); c.restore(); },
  note(c,s){ c.save(); c.fillStyle=OWN.lg(c,-s*0.5,-s,s*0.6,s*0.5,[[0,"#e070e0"],[1,"#8a2aa0"]]); c.strokeStyle="#4a1258"; c.lineWidth=Math.max(1,s*0.07);
    c.beginPath(); c.ellipse(-s*0.25,s*0.55,s*0.5,s*0.36,-0.4,0,7); c.fill(); OWN.ol(c); c.fillRect(s*0.14,-s*1.05,s*0.16,s*1.6); c.strokeRect(s*0.14,-s*1.05,s*0.16,s*1.6);
    c.beginPath(); c.moveTo(s*0.3,-s*1.05); c.bezierCurveTo(s*0.9,-s*0.8,s*1.0,-s*0.35,s*0.7,-s*0.1); c.bezierCurveTo(s*0.8,-s*0.45,s*0.6,-s*0.6,s*0.3,-s*0.65); c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-s*0.38,s*0.42,s*0.16,s*0.08,-0.4,0,7); c.fill(); c.restore(); },
  scrap(c,s){ c.strokeStyle="#2e3440"; c.lineWidth=Math.max(1,s*0.06); c.fillStyle=OWN.lg(c,0,-s*0.25,0,s*0.25,[[0,"#d8dde6"],[0.5,"#9aa3b2"],[1,"#5e6676"]]); c.beginPath(); c.rect(-s*0.2,-s*0.22,s*1.25,s*0.44); c.fill(); OWN.ol(c);
    c.strokeStyle="rgba(40,46,56,.7)"; c.lineWidth=1; for(let i=0;i<7;i++){ const xx=s*0.02+i*s*0.15; c.beginPath(); c.moveTo(xx,-s*0.22); c.lineTo(xx+s*0.08,s*0.22); c.stroke(); }
    c.fillStyle=OWN.lg(c,-s*0.8,-s*0.5,-s*0.2,s*0.5,[[0,"#e8ecf2"],[1,"#6e7686"]]); c.strokeStyle="#2e3440"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); for(let i=0;i<6;i++){ const a=i*Math.PI/3+Math.PI/6; c.lineTo(-s*0.5+Math.cos(a)*s*0.32,Math.sin(a)*s*0.55); } c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle="rgba(255,255,255,.55)"; c.fillRect(-s*0.62,-s*0.38,s*0.08,s*0.5); },
  wrapper(c,s){ const col=["#ff7ab0","#ffd2e4"]; c.strokeStyle="#a83a6a"; c.lineWidth=Math.max(1,s*0.06);
    for(const sd of [-1,1]){ c.fillStyle=col[0]; c.beginPath(); c.moveTo(sd*s*0.5,-s*0.18); c.lineTo(sd*s*1.15,-s*0.5); c.lineTo(sd*s*1.05,-s*0.12); c.lineTo(sd*s*1.2,0); c.lineTo(sd*s*1.05,s*0.15); c.lineTo(sd*s*1.15,s*0.5); c.lineTo(sd*s*0.5,s*0.18); c.closePath(); c.fill(); OWN.ol(c);
      c.beginPath(); c.moveTo(sd*s*0.6,-s*0.1); c.lineTo(sd*s*1.0,-s*0.32); c.moveTo(sd*s*0.6,s*0.1); c.lineTo(sd*s*1.0,s*0.32); c.stroke(); }
    c.fillStyle=OWN.lg(c,0,-s*0.5,0,s*0.5,[[0,"#ffa6cc"],[1,"#e0508e"]]); OWN.rr(c,-s*0.58,-s*0.42,s*1.16,s*0.84,s*0.3); c.fill(); OWN.ol(c);
    c.save(); OWN.rr(c,-s*0.58,-s*0.42,s*1.16,s*0.84,s*0.3); c.clip(); c.fillStyle="#fff2f8"; for(let i=-3;i<4;i++){ c.beginPath(); c.moveTo(i*s*0.3,-s*0.5); c.lineTo(i*s*0.3+s*0.12,-s*0.5); c.lineTo(i*s*0.3+s*0.42,s*0.5); c.lineTo(i*s*0.3+s*0.3,s*0.5); c.fill(); } c.restore();
    c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-s*0.15,-s*0.25,s*0.3,s*0.07,0,0,7); c.fill(); },
  page(c,s){ c.save(); c.fillStyle=OWN.lg(c,-s,-s,s,s,[[0,"#fffdf4"],[1,"#e8dfc6"]]); c.strokeStyle="#9a8a62"; c.lineWidth=Math.max(1,s*0.05);
    c.beginPath(); c.moveTo(-s*0.75,-s*1.0); c.lineTo(s*0.75,-s*1.0); c.lineTo(s*0.75,s*0.75); c.quadraticCurveTo(s*0.6,s*0.95,s*0.35,s*1.0); for(let i=0;i<6;i++) c.lineTo(s*0.35-i*s*0.2,s*(1.0+(i%2?-0.06:0.04))); c.closePath(); c.fill(); OWN.ol(c);
    c.strokeStyle="rgba(60,60,90,.55)"; c.lineWidth=Math.max(0.8,s*0.05); for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(-s*0.55,-s*0.72+i*s*0.27); c.lineTo(s*(0.55-(i===5?0.4:atH(i)*0.25)),-s*0.72+i*s*0.27); c.stroke(); }
    c.fillStyle="#c03a3a"; c.beginPath(); c.arc(-s*0.45,-s*0.72,s*0.09,0,7); c.fill(); c.fillStyle="rgba(0,0,0,.08)"; c.beginPath(); c.moveTo(s*0.75,s*0.75); c.quadraticCurveTo(s*0.55,s*0.65,s*0.35,s*1.0); c.quadraticCurveTo(s*0.6,s*0.95,s*0.75,s*0.75); c.fill(); c.restore(); },
  candy(c,s,t,x){ const rock=/Rock/.test(x&&x.name||""); if(rock){ c.strokeStyle="#7a5a3a"; c.lineWidth=Math.max(1.2,s*0.1); c.beginPath(); c.moveTo(0,s*0.2); c.lineTo(0,s*1.2); c.stroke();
        const cols=["#b9e4ff","#ffc6e8","#d8c6ff"]; for(let i=0;i<7;i++){ const a=-Math.PI/2+(i-3)*0.42, L=s*(0.6+0.35*atH(i)); c.save(); c.rotate(a+Math.PI/2); c.fillStyle=cols[i%3]; c.strokeStyle="rgba(90,90,140,.6)"; c.lineWidth=1; c.beginPath(); c.moveTo(-s*0.18,0); c.lineTo(0,-L); c.lineTo(s*0.18,0); c.lineTo(0,s*0.18); c.closePath(); c.fill(); OWN.ol(c); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.moveTo(-s*0.06,-s*0.05); c.lineTo(0,-L*0.8); c.lineTo(s*0.02,-s*0.05); c.fill(); c.restore(); } return; }
      c.fillStyle="#fff"; c.strokeStyle="#b02a3a"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.arc(0,0,s*0.7,0,7); c.fill(); OWN.ol(c); c.save(); c.beginPath(); c.arc(0,0,s*0.66,0,7); c.clip(); c.fillStyle="#e83a4a";
      for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(0,0); c.arc(0,0,s*0.7,i/6*Math.PI*2,i/6*Math.PI*2+0.45); c.closePath(); c.fill(); } c.restore(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(-s*0.22,-s*0.28,s*0.2,s*0.1,-0.6,0,7); c.fill(); },
  pineapple(c,s){ c.strokeStyle="#7a4e10"; c.lineWidth=Math.max(1,s*0.06);
    for(let i=0;i<5;i++){ const a=-Math.PI/2+(i-2)*0.35, L=s*(0.8-Math.abs(i-2)*0.12); c.fillStyle=i%2?"#4ea84a":"#6cc85a"; c.save(); c.translate(0,-s*0.6); c.rotate(a+Math.PI/2); c.beginPath(); c.moveTo(-s*0.12,0); c.quadraticCurveTo(-s*0.08,-L*0.6,0,-L); c.quadraticCurveTo(s*0.08,-L*0.6,s*0.12,0); c.fill(); c.strokeStyle="#2e6a2a"; c.stroke(); c.restore(); }
    c.fillStyle=OWN.rg(c,0,s*0.1,s*0.1,s*0.8,[[0,"#ffd84a"],[1,"#d08a1a"]],-s*0.2,-s*0.2); c.beginPath(); c.ellipse(0,s*0.15,s*0.6,s*0.8,0,0,7); c.fill(); c.strokeStyle="#7a4e10"; c.stroke();
    c.save(); c.beginPath(); c.ellipse(0,s*0.15,s*0.6,s*0.8,0,0,7); c.clip(); c.strokeStyle="rgba(140,90,20,.7)"; c.lineWidth=1; for(let i=-4;i<5;i++){ c.beginPath(); c.moveTo(i*s*0.3-s,-s); c.lineTo(i*s*0.3+s,s*1.2); c.stroke(); c.beginPath(); c.moveTo(i*s*0.3+s,-s); c.lineTo(i*s*0.3-s,s*1.2); c.stroke(); }
    c.fillStyle="#8a5a10"; for(let i=-3;i<4;i++) for(let j=-3;j<4;j++){ c.beginPath(); c.arc(i*s*0.3+(j%2)*s*0.15,s*0.15+j*s*0.25,s*0.035,0,7); c.fill(); } c.restore(); },
  card(c,s0,t,x){ const s=s0*1.3, red=atH(Math.floor((x&&x.self?x.self.x:0)/7))>0.5; c.save(); c.fillStyle="rgba(0,0,0,.18)"; OWN.rr(c,-s*0.52,-s*0.68,s*1.1,s*1.44,s*0.14); c.fill(); c.fillStyle=OWN.lg(c,-s,-s,s,s,[[0,"#ffffff"],[1,"#eceae2"]]); c.strokeStyle="#6a6a7a"; c.lineWidth=Math.max(1,s*0.05);
    OWN.rr(c,-s*0.55,-s*0.72,s*1.1,s*1.44,s*0.14); c.fill(); OWN.ol(c); c.strokeStyle=red?"#e04a5a":"#2a2a3a"; c.lineWidth=Math.max(0.8,s*0.03); OWN.rr(c,-s*0.45,-s*0.62,s*0.9,s*1.24,s*0.1); c.stroke();
    const ink=red?"#e04a5a":"#22223a"; c.fillStyle=ink; if(red){ c.beginPath(); c.moveTo(0,s*0.3); c.bezierCurveTo(-s*0.55,-s*0.1,-s*0.25,-s*0.5,0,-s*0.2); c.bezierCurveTo(s*0.25,-s*0.5,s*0.55,-s*0.1,0,s*0.3); c.fill(); }
    else { c.beginPath(); c.moveTo(0,-s*0.38); c.bezierCurveTo(s*0.55,0,s*0.25,s*0.32,0,s*0.12); c.bezierCurveTo(-s*0.25,s*0.32,-s*0.55,0,0,-s*0.38); c.fill(); c.fillRect(-s*0.05,s*0.05,s*0.1,s*0.28); }
    c.font="bold "+Math.max(6,s*0.32)+"px system-ui"; c.fillText("A",-s*0.42,-s*0.38); c.save(); c.rotate(Math.PI); c.fillText("A",-s*0.42,-s*0.38); c.restore(); c.restore(); },
  ball(c,s,t){ c.save(); c.beginPath(); c.arc(0,0,s*0.75,0,7); c.clip(); const cols=["#ff5a5a","#ffffff","#4aa0ff","#ffffff","#ffd23a","#ffffff"]; for(let i=0;i<6;i++){ c.fillStyle=cols[i]; c.beginPath(); c.moveTo(0,0); c.arc(0,0,s,i/6*Math.PI*2,(i+1)/6*Math.PI*2); c.closePath(); c.fill(); }
    c.fillStyle=OWN.rg(c,0,0,s*0.1,s*0.8,[[0,"rgba(255,255,255,0)"],[1,"rgba(0,0,0,.28)"]],-s*0.25,-s*0.25); c.fillRect(-s,-s,s*2,s*2); c.restore(); c.strokeStyle="#5a4a4a"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.arc(0,0,s*0.75,0,7); c.stroke();
    c.fillStyle="#fff"; c.beginPath(); c.arc(0,0,s*0.14,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.75)"; c.beginPath(); c.ellipse(-s*0.3,-s*0.35,s*0.2,s*0.1,-0.6,0,7); c.fill(); },
  hat(c,s){ c.strokeStyle="#7a5a20"; c.lineWidth=Math.max(1,s*0.06); c.fillStyle=OWN.lg(c,0,-s*0.2,0,s*0.4,[[0,"#f0d48a"],[1,"#c09a48"]]); c.beginPath(); c.ellipse(0,s*0.2,s*1.3,s*0.42,0,0,7); c.fill(); OWN.ol(c);
    c.strokeStyle="rgba(140,100,40,.6)"; c.lineWidth=0.9; for(let i=1;i<4;i++){ c.beginPath(); c.ellipse(0,s*0.2,s*(0.5+i*0.25),s*(0.16+i*0.08),0,0,7); c.stroke(); }
    c.fillStyle=OWN.lg(c,-s*0.6,0,s*0.6,0,[[0,"#d8b464"],[0.5,"#f4dc9a"],[1,"#b88e40"]]); c.strokeStyle="#7a5a20"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.moveTo(-s*0.6,s*0.15); c.bezierCurveTo(-s*0.6,-s*0.75,s*0.6,-s*0.75,s*0.6,s*0.15); c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle="#c83a3a"; c.beginPath(); c.moveTo(-s*0.6,s*0.05); c.quadraticCurveTo(0,s*0.2,s*0.6,s*0.05); c.lineTo(s*0.6,-s*0.12); c.quadraticCurveTo(0,0,-s*0.6,-s*0.12); c.closePath(); c.fill();
    c.strokeStyle="rgba(140,100,40,.55)"; c.lineWidth=0.9; for(let i=0;i<5;i++){ c.beginPath(); c.moveTo(-s*0.45+i*s*0.22,-s*0.15); c.quadraticCurveTo(-s*0.4+i*s*0.2,-s*0.4,-s*0.3+i*s*0.15,-s*0.52); c.stroke(); } },
  pearl(c,s,t){ c.fillStyle=OWN.rg(c,0,0,s*0.05,s*0.7,[[0,"#ffffff"],[0.4,"#f4ecf6"],[0.75,"#dcd2ec"],[1,"#b4a8cc"]],-s*0.25,-s*0.25); c.beginPath(); c.arc(0,0,s*0.68,0,7); c.fill();
    c.save(); c.globalAlpha*=0.45; c.fillStyle=OWN.lg(c,-s*0.7,s*0.7,s*0.7,-s*0.7,[[0,"rgba(255,170,210,.9)"],[0.5,"rgba(160,230,255,.6)"],[1,"rgba(255,250,200,.0)"]]); c.beginPath(); c.arc(0,0,s*0.68,0,7); c.fill(); c.restore();
    c.fillStyle="#fff"; c.beginPath(); c.ellipse(-s*0.25,-s*0.28,s*0.18,s*0.1,-0.7,0,7); c.fill(); OWN.star(c,s*0.3,-s*0.4,s*0.25,"rgba(255,255,255,.9)",(t||0)/200); },
  disc(c,s,t){ c.fillStyle=OWN.rg(c,0,0,s*0.1,s*0.9,[[0,"#fff2b0"],[0.6,"#f4c040"],[1,"#b07818"]],-s*0.2,-s*0.2); c.strokeStyle="#7a5010"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); c.arc(0,0,s*0.85,0,7); c.fill(); OWN.ol(c);
    c.strokeStyle="rgba(140,90,20,.8)"; c.lineWidth=Math.max(1,s*0.05); c.beginPath(); c.arc(0,0,s*0.55,0,7); c.stroke(); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; c.beginPath(); c.moveTo(Math.cos(a)*s*0.58,Math.sin(a)*s*0.58); c.lineTo(Math.cos(a)*s*0.8,Math.sin(a)*s*0.8); c.stroke(); }
    c.fillStyle=OWN.rg(c,0,0,s*0.02,s*0.3,[[0,"#7af0ff"],[1,"#1a7ab0"]],-s*0.08,-s*0.08); c.beginPath(); c.arc(0,0,s*0.25,0,7); c.fill(); c.strokeStyle="#0a4a70"; c.lineWidth=1; c.stroke(); c.fillStyle="rgba(255,255,255,.8)"; c.beginPath(); c.arc(-s*0.08,-s*0.08,s*0.07,0,7); c.fill(); },
  fish(c,s,t){ const flop=Math.sin((t||0)/45)*0.35; c.save(); c.strokeStyle="#1e4a7a"; c.lineWidth=Math.max(1,s*0.06);
    c.fillStyle="#5aa0e0"; c.save(); c.translate(-s*0.75,0); c.rotate(flop); c.beginPath(); c.moveTo(0,0); c.lineTo(-s*0.55,-s*0.45); c.quadraticCurveTo(-s*0.4,0,-s*0.55,s*0.45); c.closePath(); c.fill(); OWN.ol(c); c.strokeStyle="rgba(30,74,122,.5)"; c.lineWidth=0.8; for(let i=-1;i<=1;i++){ c.beginPath(); c.moveTo(-s*0.05,0); c.lineTo(-s*0.48,i*s*0.3); c.stroke(); } c.restore();
    c.fillStyle="#7ab8ec"; c.strokeStyle="#1e4a7a"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.moveTo(-s*0.1,-s*0.35); c.quadraticCurveTo(s*0.15,-s*0.7,s*0.35,-s*0.3); c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle=OWN.lg(c,0,-s*0.45,0,s*0.45,[[0,"#4a86d0"],[0.55,"#9ad0f4"],[1,"#eef8ff"]]); c.beginPath(); c.ellipse(0,0,s*0.85,s*0.42,0,0,7); c.fill(); OWN.ol(c);
    c.save(); c.beginPath(); c.ellipse(0,0,s*0.85,s*0.42,0,0,7); c.clip(); c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=0.9; for(let i=0;i<4;i++) for(let j=-1;j<=1;j++){ c.beginPath(); c.arc(-s*0.35+i*s*0.25,j*s*0.22,s*0.13,-1.2,1.2); c.stroke(); } c.restore();
    c.fillStyle="#fff"; c.beginPath(); c.arc(s*0.5,-s*0.08,s*0.13,0,7); c.fill(); c.fillStyle="#1a1a2a"; c.beginPath(); c.arc(s*0.53,-s*0.08,s*0.07,0,7); c.fill(); c.strokeStyle="#1e4a7a"; c.beginPath(); c.arc(s*0.82,s*0.08,s*0.08,-1.2,1.2); c.stroke(); c.restore(); },
  gravel(c,s){ c.fillStyle=OWN.lg(c,-s,-s,s,s,[[0,"#a8a29a"],[1,"#5e5852"]]); c.strokeStyle="#3a3632"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, r=s*(0.6+0.25*atH(i+5)); c.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.85); } c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle="rgba(255,255,255,.3)"; c.beginPath(); c.moveTo(-s*0.4,-s*0.4); c.lineTo(s*0.1,-s*0.55); c.lineTo(-s*0.05,-s*0.15); c.closePath(); c.fill(); c.strokeStyle="rgba(40,36,32,.6)"; c.lineWidth=1; c.beginPath(); c.moveTo(-s*0.1,-s*0.1); c.lineTo(s*0.25,s*0.2); c.lineTo(s*0.15,s*0.45); c.stroke();
    c.fillStyle="#6a9a4a"; for(let i=0;i<3;i++){ c.beginPath(); c.arc(-s*0.3+i*s*0.18,s*0.35,s*0.07,0,7); c.fill(); } }
};
OWN.drawProp=(c,x,kind,px,py,rot,s,a=1,t=0)=>{ if(a<=0) return; const f=OWN.PROPS[kind]; c.save(); c.translate(px,py); c.rotate(rot); c.globalAlpha*=a; if(f) f(c,s,t,x); else { c.scale(s/13,s/13); MV.prop(c,kind,0,t,x); } c.restore(); };
/* swap the stock props in the propthrow families for the detailed ones: OWN.prop(c,x,kind,px,py,rot,sc,a) where sc 2.2-2.4 was the old scale */
OWN.prop=(c,x,kind,px,py,rot,sc,a=1)=>{ const S=Math.max(9,((x.self&&x.self.r)||30)*0.6)*atBig(x)*1.4; OWN.drawProp(c,x,kind,px,py,rot,S*0.95*(sc/2.3),a,AT&&AT.te||0); };
/* speed lines behind a prop that's moving fast, from where it was last frame */
OWN._pl={};
{ const P0=OWN.prop; OWN.prop=(c,x,kind,px,py,rot,sc,a=1)=>{ const key=(x&&x.fam||"")+kind, L=OWN._pl[key], te=(typeof AT!=="undefined"&&AT.te)||0, S=Math.max(9,((x.self&&x.self.r)||30)*0.6)*atBig(x)*1.4;
    if(L&&te-L.te>0&&te-L.te<60&&a>0.5){ const dx=px-L.x, dy=py-L.y, dist=Math.hypot(dx,dy); if(dist>S*0.35){ const ux=dx/dist, uy=dy/dist; c.lineCap="round";
      for(let i=-1;i<=1;i++){ const ox=-uy*i*S*0.35, oy=ux*i*S*0.35, len=Math.min(S*3,dist*2.2)*(i?0.7:1); const g=c.createLinearGradient(px-ux*len,py-uy*len,px,py); g.addColorStop(0,"rgba(255,255,255,0)"); g.addColorStop(1,"rgba(255,255,255,.7)"); c.strokeStyle=g; c.lineWidth=i?1.5:2.5; c.beginPath(); c.moveTo(px-ux*len+ox,py-uy*len+oy); c.lineTo(px-ux*S*0.6+ox,py-uy*S*0.6+oy); c.stroke(); } } }
    OWN._pl[key]={x:px,y:py,te}; P0(c,x,kind,px,py,rot,sc,a); }; }
/* each family's own wind-up and follow-through for its throw */
Object.entries({
  Fizz:(t)=>t<180?{sy:1-0.1*eo(t/180),sx:1+0.06*eo(t/180),off:[Math.sin(t/10)*1.2,0]}:t<280?{sy:1.12,sx:0.94}:null,
  Twiglet:(t,p)=>t<200?{rot:-0.25*(p.dir||1)*eo(t/200)}:t<320?{rot:0.15*(p.dir||1)}:null,
  Ditty:(t)=>t<200?{pose:"cast",arc:-3}:null,
  Magna:(t)=>t<300?{pose:"effort",off:[Math.sin(t/8)*1.5,0]}:null,
  Cuppy:(t,p)=>t<200?{rot:-0.3*(p.dir||1)*eo(t/200)}:t<320?{rot:0.2*(p.dir||1)}:null,
  Tome:(t)=>t<200?{off:[Math.sin(t/15)*1.5,0],sx:1.04}:null,
  Gumball:(t)=>t<200?{rot:Math.sin(t/20)*0.06,pose:"effort"}:null,
  Pina:(t)=>t<200?{arc:-6*Math.sin(Math.PI*t/200)}:null,
  Presto:(t,p)=>t<240?{pose:"cast",rot:-0.1*(p.dir||1)}:t<360?{pose:"push",rot:0.08*(p.dir||1)}:null,
  Pogo:(t)=>t<200?{arc:-8*Math.abs(Math.sin(t/32)),sy:t%64<10?0.9:1.05}:null,
  Golem:(t,p)=>t<150?{pose:"crouch",rot:0.08*(p.dir||1)}:t<300?{pose:"slamup",arc:-4}:null,
  Tanuki:(t,p)=>t<200?{rot:-0.35*(p.dir||1)*eo(t/200)}:t<330?{rot:0.25*(p.dir||1)}:null,
  Mermaid:(t,p)=>t<200?{rot:0.15*(p.dir||1)*Math.sin(t/40)}:null,
  Diwata:(t)=>t<450?{pose:"cast",arc:-4*Math.abs(Math.sin(t/60))}:null,
  Sphinx:(t)=>t<300?{pose:"cast",arc:-2}:null,
  Sarimanok:(t,p)=>t<200?{rot:-0.15*(p.dir||1)*Math.sin(t/25)}:t<320?{rot:0.15*(p.dir||1)}:null
}).forEach(([f,a])=>{ if(OWN_PROP[f]&&!OWN_PROP[f].atk) OWN_PROP[f].atk=a; });

/* ---------- meteor, own versions (18 Nov 2026): every drop fell straight down and burst the same way, so each move now gets up
   into the sky its own way, falls its own way and lands its own way. Launch to 220 ms, fall 330-560, impact at 560, done by 1000. ---------- */
OWN.MT={
  item(c,x,kind,px,py,s,rot,t){ c.save(); c.translate(px,py); c.rotate(rot);
    if(OWN.MT.items[kind]) OWN.MT.items[kind](c,s,t,x); else if(typeof fallProp==="function"){ c.scale(s/24,s/24); fallProp(c,kind,t,x); } c.restore(); },
  items:{
    flask(c,s,t,x){ const liq=(x&&x.parts)||[150,235,170]; c.fillStyle="rgba(225,245,255,.85)"; c.strokeStyle="#5a7a90"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); c.moveTo(-s*0.18,-s*0.9); c.lineTo(s*0.18,-s*0.9); c.lineTo(s*0.18,-s*0.35); c.quadraticCurveTo(s*0.85,0,s*0.6,s*0.6); c.quadraticCurveTo(0,s*0.95,-s*0.6,s*0.6); c.quadraticCurveTo(-s*0.85,0,-s*0.18,-s*0.35); c.closePath(); c.fill(); OWN.ol(c);
      c.save(); c.clip(); c.fillStyle=OWN.rgb(liq,0.95); c.fillRect(-s,-s*0.05+Math.sin(t/60)*s*0.05,s*2,s); c.restore(); c.fillStyle="#b07a48"; c.fillRect(-s*0.22,-s*1.12,s*0.44,s*0.26); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(-s*0.3,s*0.15,s*0.08,s*0.25,0.3,0,7); c.fill();
      for(let i=0;i<3;i++){ c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=1; c.beginPath(); c.arc((i-1)*s*0.25,s*0.3-((t/200+i/3)%1)*s*0.3,s*0.07,0,7); c.stroke(); } },
    bomb(c,s,t,x,paper){ const col=paper?"#f4ecdc":"#2a2a34"; c.fillStyle=OWN.rg(c,0,0,s*0.1,s*0.8,[[0,paper?"#ffffff":"#5a5a6a"],[1,col]],-s*0.25,-s*0.25); c.strokeStyle=paper?"#9a8a6a":"#111"; c.lineWidth=Math.max(1,s*0.07);
      if(paper){ c.beginPath(); for(let j=0;j<12;j++){ const a=j/12*7, r=s*(j%2?0.62:0.78); c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); OWN.ol(c); c.strokeStyle="rgba(120,100,70,.6)"; c.lineWidth=1; for(let j=0;j<5;j++){ c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(j*1.3)*s*0.6,Math.sin(j*1.3)*s*0.6); c.stroke(); } }
      else { c.beginPath(); c.arc(0,0,s*0.75,0,7); c.fill(); OWN.ol(c); c.fillStyle="rgba(255,255,255,.35)"; c.beginPath(); c.ellipse(-s*0.28,-s*0.3,s*0.18,s*0.1,-0.6,0,7); c.fill(); }
      c.strokeStyle="#7a5a3a"; c.lineWidth=Math.max(1.4,s*0.1); c.beginPath(); c.moveTo(0,-s*0.7); c.quadraticCurveTo(s*0.2,-s*1.05,s*0.45,-s*1.05); c.stroke();
      c.fillStyle=Math.floor(t/50)%2?"#ffe14a":"#ff8a2a"; c.beginPath(); c.arc(s*0.48,-s*1.07,s*0.13,0,7); c.fill(); atGlowA(c,s*0.48,-s*1.07,s*0.4,[255,200,80],0.8); },
    rock(c,s,t,x){ c.scale(s/24,s/24); c.fillStyle=OWN.lg(c,-20,-20,20,20,[[0,"#a8a29a"],[1,"#5e5852"]]); c.strokeStyle="#3a3632"; c.lineWidth=2; c.beginPath(); for(let i=0;i<9;i++){ const a=i/9*7, r=20*(0.75+0.3*atH(i+11)); c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); OWN.ol(c);
      c.fillStyle="rgba(255,255,255,.25)"; c.beginPath(); c.moveTo(-12,-12); c.lineTo(4,-17); c.lineTo(-2,-4); c.closePath(); c.fill(); c.strokeStyle="rgba(40,36,32,.6)"; c.lineWidth=1.2; c.beginPath(); c.moveTo(-3,-2); c.lineTo(8,6); c.lineTo(5,14); c.stroke(); },
    magma(c,s,t){ atGlowA(c,0,0,s*1.8,[255,120,40],0.6); c.fillStyle=OWN.rg(c,0,0,s*0.1,s*0.85,[[0,"#fff2a0"],[0.4,"#ff9a30"],[1,"#b02a10"]],-s*0.2,-s*0.2); c.beginPath(); for(let i=0;i<10;i++){ const a=i/10*7, r=s*(0.75+0.12*Math.sin(t/40+i*2)); c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill();
      c.strokeStyle="rgba(60,20,10,.6)"; c.lineWidth=Math.max(1,s*0.06); for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(Math.cos(i*2)*s*0.2,Math.sin(i*2)*s*0.2); c.lineTo(Math.cos(i*2+0.4)*s*0.6,Math.sin(i*2+0.4)*s*0.6); c.stroke(); } },
    fireball(c,s,t){ atGlowA(c,0,0,s*2,[255,140,50],0.7); OWN.flame(c,0,0,s*0.9,-Math.PI/2,OWN.rgb([255,110,40],0.95),OWN.rgb([255,235,150],0.95),t); c.fillStyle="#fff6c8"; c.beginPath(); c.arc(0,0,s*0.35,0,7); c.fill(); },
    mountain(c,s,t){ c.fillStyle=OWN.lg(c,0,-s,0,s,[[0,"#9a948c"],[1,"#5a544c"]]); c.strokeStyle="#2e2a26"; c.lineWidth=Math.max(1.5,s*0.05); c.beginPath(); c.moveTo(-s*1.2,s*0.6); c.lineTo(-s*0.5,-s*0.4); c.lineTo(-s*0.2,-s*0.15); c.lineTo(s*0.15,-s*0.9); c.lineTo(s*0.6,-s*0.2); c.lineTo(s*1.2,s*0.6); c.quadraticCurveTo(0,s*0.9,-s*1.2,s*0.6); c.fill(); OWN.ol(c);
      c.fillStyle="#f4f6fa"; c.beginPath(); c.moveTo(s*0.15,-s*0.9); c.lineTo(s*0.35,-s*0.55); c.lineTo(s*0.2,-s*0.6); c.lineTo(s*0.05,-s*0.45); c.lineTo(-s*0.05,-s*0.6); c.closePath(); c.fill();
      c.strokeStyle="rgba(30,26,22,.5)"; c.lineWidth=1; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-s*0.8+i*s*0.5,s*0.5); c.lineTo(-s*0.6+i*s*0.45,s*0.1); c.stroke(); } },
    toast(c,s){ c.fillStyle="#e0a050"; c.strokeStyle="#8a5a20"; c.lineWidth=Math.max(1,s*0.06); OWN.rr(c,-s*0.6,-s*0.55,s*1.2,s*1.1,s*0.25); c.fill(); OWN.ol(c); c.fillStyle="#f4d290"; OWN.rr(c,-s*0.45,-s*0.4,s*0.9,s*0.85,s*0.15); c.fill(); c.fillStyle="#f6e6a0"; c.fillRect(-s*0.2,-s*0.15,s*0.35,s*0.3); },
    egg(c,s){ c.fillStyle="#ffffff"; c.strokeStyle="#c8c0b0"; c.lineWidth=1; c.beginPath(); for(let i=0;i<10;i++){ const a=i/10*7, r=s*(0.7+0.15*atH(i+3)); c.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.75); } c.closePath(); c.fill(); OWN.ol(c); c.fillStyle=OWN.rg(c,0,0,1,s*0.32,[[0,"#ffe680"],[1,"#ffb020"]],-s*0.08,-s*0.08); c.beginPath(); c.arc(s*0.05,0,s*0.3,0,7); c.fill(); },
    bacon(c,s,t){ c.strokeStyle="#b8402a"; c.lineWidth=s*0.3; c.lineCap="round"; c.beginPath(); for(let i=0;i<=8;i++){ const xx=-s+i*s*0.25; c.lineTo(xx,Math.sin(i*1.4+(t||0)/60)*s*0.15); } c.stroke(); c.strokeStyle="#f4c0a0"; c.lineWidth=s*0.08; c.stroke(); }
  },
  shadow(c,tg,gnd,k,R){ c.fillStyle=`rgba(0,0,0,${0.12+0.3*k})`; c.beginPath(); c.ellipse(tg.x,gnd,R*(0.4+0.7*k),R*(0.12+0.15*k),0,0,7); c.fill(); },
  fall(tg,R,d,k){ const top={x:tg.x-d*R*0.7,y:tg.y-R*7}; return {x:top.x+(tg.x-top.x)*k,y:top.y+(tg.y-R*0.2-top.y)*k}; },
  boom(c,PF,p,R,k,cols=[[255,240,170],[255,150,60],[200,70,40]],smoke=[120,110,110]){ if(k<=0||k>=1) return; const g=eo(Math.min(1,k*2.2));
    for(let i=0;i<10;i++){ const a=i/10*7, v=R*0.9*g*(0.5+0.5*atH(i)); PF(p.x+Math.cos(a)*v,p.y+Math.sin(a)*v*0.7-k*R*0.3,R*(0.35+0.3*g)*(1-k*0.4),0.9*(1-k),cols[i%3]); }
    if(k>0.3) for(let i=0;i<6;i++){ const q=(k-0.3)/0.7; PF(p.x+(atH(i*3)-0.5)*R*1.4,p.y-R*(0.4+1.6*q)*(0.6+0.4*atH(i)),R*(0.4+0.5*q),0.6*(1-q),smoke); }
    c.strokeStyle=OWN.rgb([255,240,200],1-k); c.lineWidth=4*(1-k)+1; c.beginPath(); c.ellipse(p.x,p.y+R*0.5,R*(0.6+1.8*eo(k)),R*(0.18+0.5*eo(k)),0,0,7); c.stroke(); },
  debris(c,p,R,k,col,n=8,sz=0.18,seed=0){ if(k<=0||k>=1) return; for(let i=0;i<n;i++){ const a=-Math.PI+i/(n-1)*Math.PI+(atH(i+seed)-0.5)*0.4, v=R*(0.8+1.0*atH(i*3+seed)); c.save(); c.translate(p.x+Math.cos(a)*v*eo(k),p.y+Math.sin(a)*v*eo(k)*0.9+k*k*R*1.6); c.rotate(k*8+i); c.fillStyle=OWN.rgb(col,1-k*0.8); c.fillRect(-R*sz,-R*sz*0.6,R*sz*2,R*sz*1.2); c.restore(); } }
};
/* Flight (18 Nov 2026, second pass): every item now flies one unbroken path. It leaves the body, rises to a peak, hangs there for a
   moment and drops onto the foe, keeping its size and spin the whole way, so nothing jumps between the launch and the fall.
   Items called down from the sky enter from above the top of the screen. Each item lands with its own squash and puff. */
OWN.MT.bez=(a,b,c2,e,u)=>{ const v=1-u; return {x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c2.x+u*u*u*e.x, y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c2.y+u*u*u*e.y}; };
OWN.MT.plan=(P,o,i,n)=>{ const {o0,tg,d,R,S}=P, sp=(o.spread!=null?o.spread:1.8)*R, s=S*(o.sz||(n>1?0.95:1.5))*(o.big?o.big*0.75:1);
  const off=n>1?(i/(n-1)-0.5)*sp+(atH(i*5+1)-0.5)*R*0.25:0;
  const end=o.end?o.end(P,i,s):{x:P.hit.x+off,y:n>1?P.hit.y+atH(i*7+2)*(P.gnd-P.hit.y-s*0.5)*0.8:P.hit.y};
  const st=o.stagger!=null?o.stagger:35, dl=i*st, t2=560-(n-1-i)*st*0.6, t1=Math.min(330+dl*0.5,t2-120);   /* every item is down by contact, since the game slows time on the hit */
  if(o.from==="sky"){ const a={x:end.x-d*R*(0.5+0.3*atH(i)),y:tg.y-R*11.5-s*1.2-atH(i*3)*R}; return {s,end,t0:t1,t1,t2,sky:true,a}; }
  const a0={x:o0.x+(n>1?(i-(n-1)/2)*S*0.25:0),y:o0.y}, L=o.lead, a=L?{x:a0.x+L[0]*d*R,y:a0.y+L[1]*R}:a0;
  const A={x:a.x+(end.x-a.x)*(o.apexAt||0.5)+(n>1?(atH(i*9)-0.5)*R*0.6:0),y:tg.y-R*(o.apex||5.6)-atH(i*3)*R*0.5};
  const ex=o.exit?{x:a.x+o.exit[0]*d*R,y:a.y+o.exit[1]*R}:null;
  let b,c2; if(ex){ b=ex; c2={x:(8*A.x-a.x-3*b.x-end.x)/3,y:(8*A.y-a.y-3*b.y-end.y)/3}; }
  else { const C={x:2*A.x-0.5*(a.x+end.x),y:2*A.y-0.5*(a.y+end.y)}; b={x:a.x+(C.x-a.x)*2/3,y:a.y+(C.y-a.y)*2/3}; c2={x:end.x+(C.x-end.x)*2/3,y:end.y+(C.y-end.y)*2/3}; }
  return {s,end,t0:dl,t1,t2,a,b,c2,a0:L?a0:null,tl:L?dl+L[2]:dl}; };
/* where an item is at time t (null before it leaves or after it lands) */
OWN.MT.at=(F,t)=>{ if(t<F.t0||t>F.t2) return null; if(F.a0&&t<F.tl){ const k=Math.sin(Math.PI/2*(t-F.t0)/(F.tl-F.t0)); return {x:F.a0.x+(F.a.x-F.a0.x)*k,y:F.a0.y+(F.a.y-F.a0.y)*k,u:0}; }
  if(F.sky){ const k=ei((t-F.t1)/(F.t2-F.t1)); return {x:F.a.x+(F.end.x-F.a.x)*k,y:F.a.y+(F.end.y-F.a.y)*k,u:0.5+0.5*k}; }
  const u=t<F.t1?0.5*eo((t-F.tl)/(F.t1-F.tl)):0.5+0.5*ei((t-F.t1)/(F.t2-F.t1)); const p=OWN.MT.bez(F.a,F.b,F.c2,F.end,u); p.u=u; return p; };
OWN.MT.trail=(c,PF,F,t,s,type,i=0)=>{ const pts=[]; for(let j=1;j<=6;j++){ const q=OWN.MT.at(F,t-j*24); if(!q) break; pts.push(q); } if(!pts.length) return;
  const p=OWN.MT.at(F,t);
  if(type==="fire") pts.forEach((q,j)=>{ PF(q.x,q.y,s*(0.62-j*0.07),0.75*(1-j/7),j<2?[255,215,110]:j<4?[255,130,50]:[150,90,80]); });
  else if(type==="smoke") pts.forEach((q,j)=>{ PF(q.x+Math.sin(t/60+j)*3,q.y,s*(0.3+j*0.07),0.42*(1-j/7),[205,205,210]); });
  else if(type==="fizz") pts.forEach((q,j)=>{ OWN.bubble(c,q.x+(atH(j+i*7+Math.floor(t/90))-0.5)*s*0.6,q.y,s*(0.16-j*0.015),[200,240,255],true); });
  else if(type==="spark") pts.forEach((q,j)=>{ OWN.star(c,q.x+(atH(j+i)-0.5)*s*0.5,q.y+(atH(j*3+i)-0.5)*s*0.5,s*0.28*(1-j/7),OWN.rgb(j%2?[255,250,210]:[255,210,120],1-j/7),t/70+j); });
  else if(type==="embers") pts.forEach((q,j)=>{ c.fillStyle=OWN.rgb([255,190,90],1-j/7); c.beginPath(); c.arc(q.x+Math.sin(t/50+j*2)*s*0.35,q.y+s*0.5,1.6+1.4*(1-j/7),0,7); c.fill(); });
  else if(type==="speed"&&p&&p.u>0.5){ const q=pts[Math.min(3,pts.length-1)], dx=p.x-q.x, dy=p.y-q.y, L=Math.hypot(dx,dy)||1; c.strokeStyle="rgba(255,255,255,.75)"; c.lineCap="round";
    for(let j=-1;j<=1;j++){ const nx=-dy/L*j*s*0.45, ny=dx/L*j*s*0.45; c.lineWidth=j?1.6:2.4; c.beginPath(); c.moveTo(p.x+nx-dx/L*s*0.9,p.y+ny-dy/L*s*0.9); c.lineTo(p.x+nx-dx/L*s*(2.2+0.6*Math.abs(j)),p.y+ny-dy/L*s*(2.2+0.6*Math.abs(j))); c.stroke(); } }
  else if(type==="rainbow"&&p){ const all=[p,...pts], cols=[[255,120,150],[255,200,100],[150,225,140],[130,180,255],[190,150,255]]; c.lineCap="round"; c.lineJoin="round";
    cols.forEach((cl,j)=>{ c.strokeStyle=OWN.rgb(cl,0.85); c.lineWidth=s*0.16; c.beginPath(); all.forEach((q,m)=>{ const r=all[Math.min(m+1,all.length-1)], dx=q.x-r.x, dy=q.y-r.y, L=Math.hypot(dx,dy)||1, w=(j-2)*s*0.15*(1-m/(all.length+1)); c.lineTo(q.x-dy/L*w,q.y+dx/L*w); }); c.stroke(); });
    for(let j=0;j<4;j++){ const q=all[Math.min(all.length-1,1+j)]; OWN.star(c,q.x+(atH(j+Math.floor(t/60))-0.5)*s,q.y+(atH(j*5)-0.5)*s,s*0.16,"rgba(255,255,255,.9)",t/40+j); } } };
OWN.MT.puff=(c,PF,p,s,k,col=[225,212,192])=>{ if(k<=0||k>=1) return; for(let j=0;j<6;j++){ const a=Math.PI+j/5*Math.PI; PF(p.x+Math.cos(a)*s*(0.4+1.1*eo(k)),p.y+s*0.3+Math.sin(a)*s*0.5*eo(k),s*(0.35+0.35*k),0.7*(1-k),col); } };
OWN.MT.scorch=(c,P,k,w=1)=>{ const a=k<0.15?k/0.15:1-Math.max(0,k-0.6)/0.4; c.fillStyle=`rgba(40,28,20,${0.4*a})`; c.beginPath(); c.ellipse(P.tg.x,P.gnd+2,P.R*0.9*w,P.R*0.2*w,0,0,7); c.fill();
  c.fillStyle=`rgba(255,140,50,${0.5*a*(1-k)})`; for(let j=0;j<5;j++){ c.beginPath(); c.arc(P.tg.x+(atH(j*4)-0.5)*P.R*1.4*w,P.gnd+(atH(j*6)-0.5)*P.R*0.2,2,0,7); c.fill(); } };
Object.assign(OWN.MT.items,{
  orb(c,s,t){ atGlowA(c,0,0,s*2.2,[255,240,150],0.55); c.save(); c.rotate(t/300); for(let j=0;j<8;j++){ const L=s*(j%2?0.95:1.45)*(0.9+0.1*Math.sin(t/50+j)); c.strokeStyle=`rgba(255,248,200,${j%2?0.5:0.8})`; c.lineWidth=j%2?1.4:2.4; c.beginPath(); c.moveTo(Math.cos(j/8*7)*s*0.55,Math.sin(j/8*7)*s*0.55); c.lineTo(Math.cos(j/8*7)*L,Math.sin(j/8*7)*L); c.stroke(); } c.restore();
    c.fillStyle=OWN.rg(c,0,0,s*0.05,s*0.6,[[0,"#ffffff"],[0.5,"#fff6b8"],[1,"rgba(255,215,90,0.9)"]],-s*0.15,-s*0.15); c.beginPath(); c.arc(0,0,s*0.6,0,7); c.fill();
    for(let j=0;j<3;j++){ const a=t/120+j*2.1; c.fillStyle="#fffbe0"; c.beginPath(); c.arc(Math.cos(a)*s*0.95,Math.sin(a)*s*0.6,1.8,0,7); c.fill(); } },
  hotrock(c,s,t,x){ atGlowA(c,0,0,s*1.6,[255,120,40],0.45); OWN.MT.items.rock(c,s,t,x); c.save(); c.scale(s/24,s/24); c.strokeStyle=`rgba(255,${150+Math.round(60*Math.sin(t/40))},60,.95)`; c.lineWidth=2.2; c.lineCap="round";
    c.beginPath(); c.moveTo(-10,-6); c.lineTo(-2,0); c.lineTo(-6,9); c.moveTo(-2,0); c.lineTo(9,-4); c.lineTo(13,4); c.stroke(); c.restore(); },
  wishstar(c,s,t){ atGlowA(c,0,0,s*2,[255,245,200],0.6); c.save(); c.rotate(Math.sin(t/120)*0.25); c.fillStyle=OWN.lg(c,0,-s,0,s,[[0,"#fffbe0"],[1,"#ffd64a"]]); c.strokeStyle="#d9a81a"; c.lineWidth=Math.max(1.5,s*0.08); c.lineJoin="round";
    c.beginPath(); for(let j=0;j<10;j++){ const a=j*Math.PI/5-Math.PI/2, r=s*(j%2?0.45:1); c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle="#5a4020"; c.beginPath(); c.arc(-s*0.18,-s*0.02,s*0.07,0,7); c.arc(s*0.18,-s*0.02,s*0.07,0,7); c.fill(); c.strokeStyle="#5a4020"; c.lineWidth=Math.max(1,s*0.05); c.beginPath(); c.arc(0,s*0.08,s*0.12,0.2,Math.PI-0.2); c.stroke();
    c.fillStyle="rgba(255,150,170,.6)"; c.beginPath(); c.arc(-s*0.32,s*0.12,s*0.08,0,7); c.arc(s*0.32,s*0.12,s*0.08,0,7); c.fill(); c.restore(); },
  nova(c,s,t){ const g=1+0.5*Math.max(0,Math.min(1,(t-180)/160)), r=s*g; atGlowA(c,0,0,r*2.6,[255,180,80],0.5); atGlowA(c,0,0,r*1.5,[255,235,170],0.8);
    c.save(); c.rotate(t/200); for(let j=0;j<12;j++){ const a=j/12*Math.PI*2, L=r*(j%3?0.9:1.6)*(0.85+0.15*Math.sin(t/40+j)); c.fillStyle=j%3?"rgba(255,220,140,.75)":"rgba(255,250,225,.95)"; c.beginPath(); c.moveTo(Math.cos(a-0.12)*r*0.35,Math.sin(a-0.12)*r*0.35); c.lineTo(Math.cos(a)*L,Math.sin(a)*L); c.lineTo(Math.cos(a+0.12)*r*0.35,Math.sin(a+0.12)*r*0.35); c.fill(); } c.restore();
    c.fillStyle=OWN.rg(c,0,0,1,r*0.45,[[0,"#ffffff"],[0.6,"#fff4c0"],[1,"#ffb040"]]); c.beginPath(); c.arc(0,0,r*0.45,0,7); c.fill(); },
  mine(c,s,t){ c.strokeStyle="#2a323a"; c.lineWidth=Math.max(2,s*0.12); c.lineCap="round"; for(let j=0;j<8;j++){ const a=j/8*Math.PI*2; c.beginPath(); c.moveTo(Math.cos(a)*s*0.6,Math.sin(a)*s*0.6); c.lineTo(Math.cos(a)*s*0.95,Math.sin(a)*s*0.95); c.stroke(); c.fillStyle="#8a9aaa"; c.beginPath(); c.arc(Math.cos(a)*s*0.97,Math.sin(a)*s*0.97,s*0.09,0,7); c.fill(); }
    c.fillStyle=OWN.rg(c,0,0,s*0.05,s*0.72,[[0,"#7a8a9a"],[1,"#2e3a46"]],-s*0.22,-s*0.22); c.strokeStyle="#1a2028"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.arc(0,0,s*0.7,0,7); c.fill(); OWN.ol(c);
    c.strokeStyle="rgba(150,170,190,.7)"; c.lineWidth=Math.max(1,s*0.05); c.beginPath(); c.ellipse(0,0,s*0.7,s*0.22,0,0,7); c.stroke(); for(let j=0;j<5;j++){ c.fillStyle="#9aaaba"; c.beginPath(); c.arc(-s*0.5+j*s*0.25,Math.sin(j)*s*0.05,s*0.04,0,7); c.fill(); }
    const on=Math.floor(t/90)%2; c.fillStyle=on?"#ff4040":"#7a1a1a"; c.beginPath(); c.arc(0,-s*0.38,s*0.11,0,7); c.fill(); if(on) atGlowA(c,0,-s*0.38,s*0.5,[255,60,60],0.7);
    c.fillStyle="rgba(255,255,255,.35)"; c.beginPath(); c.ellipse(-s*0.28,-s*0.28,s*0.16,s*0.08,-0.7,0,7); c.fill(); },
  cbomb(c,s,t,x){ c.save(); c.scale(s/24,s/24); fallProp(c,"cherry",t,x); c.restore(); c.fillStyle="rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(-s*0.3,-s*0.05,s*0.12,s*0.2,0.5,0,7); c.fill();
    c.strokeStyle="#5a4a2a"; c.lineWidth=Math.max(1.2,s*0.07); c.beginPath(); c.moveTo(-s*0.3,-s*0.6); c.quadraticCurveTo(-s*0.55,-s*1.0,-s*0.75,-s*0.95); c.stroke(); const on=Math.floor(t/50)%2; c.fillStyle=on?"#ffe14a":"#ff8a2a"; c.beginPath(); c.arc(-s*0.77,-s*0.96,s*0.11,0,7); c.fill(); atGlowA(c,-s*0.77,-s*0.96,s*0.42,[255,200,80],0.85);
    for(let j=0;j<3;j++){ const a=t/40+j*2; c.strokeStyle="rgba(255,230,120,.9)"; c.lineWidth=1.2; c.beginPath(); c.moveTo(-s*0.77,-s*0.96); c.lineTo(-s*0.77+Math.cos(a)*s*0.3,-s*0.96+Math.sin(a)*s*0.3); c.stroke(); } },
  lantern2(c,s,t,x){ atGlowA(c,0,0,s*2.4,[255,190,90],0.45); c.save(); c.scale(s/24,s/24); fallProp(c,"lantern",t,x); c.restore();
    c.strokeStyle="rgba(120,60,20,.55)"; c.lineWidth=1; for(let j=-1;j<=1;j++){ c.beginPath(); c.moveTo(j*s*0.3,-s*0.8); c.quadraticCurveTo(j*s*0.42,0,j*s*0.3,s*0.8); c.stroke(); } c.fillStyle="rgba(255,250,210,.8)"; c.beginPath(); c.arc(0,s*0.1,s*0.18+Math.sin(t/30)*s*0.03,0,7); c.fill(); },
  acorn2(c,s,t,x){ c.save(); c.scale(s/24,s/24); fallProp(c,"acorn",t,x); c.restore(); c.strokeStyle="rgba(60,35,15,.6)"; c.lineWidth=1; for(let j=-2;j<=2;j++){ c.beginPath(); c.moveTo(j*s*0.15-s*0.08,-s*0.48); c.lineTo(j*s*0.15+s*0.08,-s*0.2); c.stroke(); } c.fillStyle="rgba(255,255,255,.35)"; c.beginPath(); c.ellipse(-s*0.28,s*0.25,s*0.08,s*0.22,0.3,0,7); c.fill();
    c.fillStyle="#4a7a2a"; c.beginPath(); c.ellipse(s*0.3,-s*0.72,s*0.3,s*0.13,-0.5,0,7); c.fill(); },
  bell2(c,s,t,x){ c.save(); c.scale(s/24,s/24); fallProp(c,"bell",t,x); c.restore(); c.fillStyle="#a87810"; c.beginPath(); c.arc(Math.sin(t/45)*s*0.15,s*0.72,s*0.16,0,7); c.fill(); c.strokeStyle="rgba(255,255,230,.7)"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); c.moveTo(-s*0.45,-s*0.2); c.quadraticCurveTo(-s*0.55,s*0.2,-s*0.62,s*0.4); c.stroke();
    c.strokeStyle="#7a5a10"; c.lineWidth=Math.max(1.4,s*0.08); c.beginPath(); c.arc(0,-s*1.05,s*0.16,0,7); c.stroke(); }
});
Object.assign(OWN.MT.items,{ pbomb:(c,s,t,x)=>OWN.MT.items.bomb(c,s,t,x,true),
  coin1(c,s,t){ const w=Math.abs(Math.cos((t||0)/60)); c.fillStyle=OWN.lg(c,-s,0,s,0,[[0,"#f2c23a"],[0.5,"#fff0a0"],[1,"#c8901a"]]); c.strokeStyle="#8a6010"; c.lineWidth=Math.max(1,s*0.1); c.beginPath(); c.ellipse(0,0,s*(0.25+0.75*w),s,0,0,7); c.fill(); OWN.ol(c); if(w>0.4){ c.fillStyle="#a87810"; c.font="bold "+Math.max(6,s*1.1)+"px system-ui"; c.textAlign="center"; c.textBaseline="middle"; c.fillText("$",0,1); } },
  pumpkinb(c,s,t,x){ c.save(); c.scale(s/24,s/24); fallProp(c,"pumpkin",t,x); c.restore(); c.strokeStyle="#5a4a2a"; c.lineWidth=Math.max(1.4,s*0.08); c.beginPath(); c.moveTo(s*0.1,-s*0.9); c.quadraticCurveTo(s*0.4,-s*1.3,s*0.7,-s*1.2); c.stroke(); c.fillStyle=Math.floor(t/50)%2?"#ffe14a":"#ff8a2a"; c.beginPath(); c.arc(s*0.72,-s*1.22,s*0.12,0,7); c.fill(); atGlowA(c,s*0.72,-s*1.22,s*0.4,[255,200,80],0.8); } });
/* glass shards: thin triangles that tumble out and fall */
OWN.MT.shards=(c,p,R,k,col,n=8,seed=0)=>{ if(k<=0||k>=1) return; for(let i=0;i<n;i++){ const a=-Math.PI+i/(n-1)*Math.PI+(atH(i+seed)-0.5)*0.5, v=R*(0.7+1.1*atH(i*3+seed)); c.save(); c.translate(p.x+Math.cos(a)*v*eo(k),p.y+Math.sin(a)*v*eo(k)*0.9+k*k*R*1.6); c.rotate(k*9+i);
  c.fillStyle=OWN.rgb(col,0.85*(1-k)); c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=1; const z=R*(0.08+0.06*atH(i+seed*2)); c.beginPath(); c.moveTo(-z,z*0.6); c.lineTo(z*0.2,-z*1.2); c.lineTo(z,z*0.8); c.closePath(); c.fill(); OWN.ol(c); c.restore(); } };
const OWN_METEOR={
  "Explosive Brew":{at:[0.5,-0.2],item:"flask",trail:"fizz",spin:0.7,
    launch(c,PF,t,P,x){ if(t>200) return; const liq=x.parts||[150,235,170]; for(let i=0;i<4;i++){ const q=((t/160)+i/4)%1; OWN.bubble(c,P.o0.x+(atH(i)-0.5)*P.S*0.8,P.o0.y-q*P.S*1.2,P.S*0.12,liq,true); } },
    impact(c,PF,k,P,x){ const liq=x.parts||[150,235,170]; OWN.MT.boom(c,PF,P.hit,P.R,k,[OWN.mix(liq,[255,255,255],0.6),liq,OWN.mix(liq,[60,40,80],0.4)],OWN.mix(liq,[200,200,200],0.5));
      OWN.splat(c,P.tg.x,P.gnd-2,P.S*1.3,liq,k,61,4); OWN.MT.shards(c,P.hit,P.R,k,[220,240,255],10,3);
      for(let i=0;i<8;i++){ const q=((k*1.4)+i/8)%1; OWN.bubble(c,P.hit.x+(atH(i)-0.5)*P.R*1.8,P.hit.y-q*P.R*1.8,P.S*(0.12+0.15*atH(i*2))*(1-k*0.5),liq,true); } } },
  "Sky Lantern":{at:[0.6,0.15],item:"lantern2",trail:"embers",upright:true,apex:6,
    launch(c,PF,t,P){ if(t<160) atGlowA(c,P.o0.x,P.o0.y,P.S*1.6,[255,200,100],0.6*(1-t/160)); },
    impact(c,PF,k,P){ OWN.MT.boom(c,PF,P.hit,P.R,k,[[255,245,200],[255,180,90],[230,110,50]]); OWN.MT.scorch(c,P,k,0.8);
      for(let i=0;i<10;i++){ const a=i/10*7, v=P.R*(0.5+1.0*eo(k)); c.save(); c.translate(P.hit.x+Math.cos(a)*v,P.hit.y+Math.sin(a)*v*0.6+k*k*P.R*1.2); c.rotate(k*6+i); c.fillStyle=OWN.rgb(i%2?[255,150,80]:[240,90,60],1-k); c.fillRect(-P.S*0.2,-P.S*0.12,P.S*0.4,P.S*0.24); c.strokeStyle=OWN.rgb([140,60,20],1-k); c.lineWidth=1; c.strokeRect(-P.S*0.2,-P.S*0.12,P.S*0.4,P.S*0.24); c.restore(); }
      for(let i=0;i<8;i++){ const q=((k*1.3)+i/8)%1; c.fillStyle=OWN.rgb([255,200,110],(1-k)*(1-q)); c.beginPath(); c.arc(P.hit.x+(atH(i*3)-0.5)*P.R*2+Math.sin(k*9+i)*6,P.hit.y-q*P.R*1.6,1.8,0,7); c.fill(); } } },
  "Cave In":{at:[1.0,0.9],item:"rock",n:5,from:"sky",trail:"speed",spread:1.6,stagger:30,land:"dust",
    launch(c,PF,t,P){ const {o0,sg,tg,R,gnd}=P; SG.dust(c,o0.x,sg,P.S,Math.min(1,t/330),6);
      for(let i=0;i<7;i++){ const st=i*40, q=(t-st)/260; if(q<0||q>1) continue; c.fillStyle=OWN.rgb([130,110,90],0.9); c.beginPath(); c.arc(tg.x+(atH(i)-0.5)*R*2,(tg.y-R*11)+(gnd-tg.y+R*11)*q*q,2+atH(i*2)*1.5,0,7); c.fill(); }
      c.strokeStyle=`rgba(90,70,55,${0.6*Math.min(1,t/200)})`; c.lineWidth=2; for(const sd of [-1,1]){ c.beginPath(); for(let i=0;i<=6;i++) c.lineTo(o0.x+sd*i*P.S*0.3*Math.min(1,t/250),P.gnd+(i%2?2:-2)); c.stroke(); } },
    impact(c,PF,k,P){ for(let i=0;i<6;i++) PF(P.tg.x+(i-2.5)*P.R*0.5,P.gnd-P.R*(0.3+0.8*eo(k))*(0.6+0.4*atH(i)),P.R*(0.5+0.5*k),0.7*(1-k),[205,190,165]); OWN.MT.debris(c,P.hit,P.R,k,[120,110,100],10,0.14,5); } },
  "Light Bomb":{at:[0.5,0.85],item:"orb",trail:"spark",lead:[1.5,0.15,130],sz:1.6,
    launch(c,PF,t,P){ const g=t<120?t/120:Math.max(0,1-(t-120)/120); atGlowA(c,P.o0.x,P.o0.y,P.S*(1.2+1.2*g),[255,240,150],0.85*g);
      for(let i=0;i<6;i++){ const q=((t/140)+i/6)%1, a=i/6*7; if(t>140) break; c.fillStyle=OWN.rgb([255,250,200],q); c.beginPath(); c.arc(P.o0.x+Math.cos(a)*P.S*1.4*(1-q),P.o0.y+Math.sin(a)*P.S*0.9*(1-q),1.8,0,7); c.fill(); } },
    impact(c,PF,k,P){ if(k>=1) return; atGlowA(c,P.hit.x,P.hit.y,P.R*(1+2.2*k),[255,250,200],0.9*(1-k)); for(let i=0;i<14;i++){ const a=i/14*Math.PI*2+0.1, L=P.R*(0.8+(i%2?1.4:2.4)*eo(k)); c.strokeStyle=OWN.rgb(i%2?[255,235,150]:[255,255,230],1-k); c.lineWidth=(i%2?2:3.5)*(1-k)+0.8; c.beginPath(); c.moveTo(P.hit.x+Math.cos(a)*P.R*0.45,P.hit.y+Math.sin(a)*P.R*0.45); c.lineTo(P.hit.x+Math.cos(a)*L,P.hit.y+Math.sin(a)*L); c.stroke(); }
      for(let i=0;i<3;i++){ const q=Math.max(0,k-i*0.1); if(q<=0||q>=1) continue; c.strokeStyle=OWN.rgb([255,250,210],1-q); c.lineWidth=3*(1-q)+0.5; c.beginPath(); c.arc(P.hit.x,P.hit.y,P.R*(0.4+1.8*eo(q)),0,7); c.stroke(); } } },
  "Acorn Drop":{at:[0.5,-0.05],item:"acorn2",keep:true,spin:0.8,
    launch(c,PF,t,P,x){ for(let i=0;i<5;i++){ const q=Math.min(1,Math.max(0,(t-i*30)/330)); if(q<=0||q>=1) continue; OWN.drawProp(c,x,"leaf",P.o0.x+(atH(i)-0.5)*P.R*1.4+Math.sin(t/70+i)*P.S*0.4,P.o0.y+q*(P.gnd-P.o0.y),q*5+i,P.S*0.42,1-q*0.6,t); } },
    impact(c,PF,k,P,x){ OWN.bonk(c,P.end.x,P.end.y-P.R*0.3,P.R,k); const p={x:P.end.x-P.d*P.R*1.4*k,y:P.end.y-P.R*1.3*Math.sin(Math.PI*k)+k*k*(P.gnd-P.end.y-P.s*0.5)}; OWN.MT.item(c,x,"acorn2",p.x,p.y,P.s,P.rot-P.d*k*8,0);
      for(let i=0;i<4;i++) OWN.drawProp(c,x,"leaf",P.hit.x+(atH(i)-0.5)*P.R*2,P.hit.y-P.R+k*P.R*1.5,k*3+i,P.S*0.45,1-k,0); } },
  "Paper Bomb":{at:[0.8,0.4],item:"pbomb",trail:"smoke",spin:0.6,
    impact(c,PF,k,P){ OWN.MT.boom(c,PF,P.hit,P.R,k,[[255,250,220],[255,190,90],[240,120,60]]); OWN.MT.scorch(c,P,k,0.9);
      for(let i=0;i<18;i++){ const a=i/18*7, v=P.R*(0.5+1.3*eo(k))*(0.6+0.4*atH(i)); c.save(); c.translate(P.hit.x+Math.cos(a)*v+Math.sin(k*10+i)*P.S*0.2*k,P.hit.y+Math.sin(a)*v*0.7+k*k*P.R*1.4); c.rotate(k*10+i); c.scale(1,Math.cos(k*14+i)); c.fillStyle=OWN.rgb(i%3?[250,245,230]:[255,170,190],1-k*0.7); c.fillRect(-P.S*0.2,-P.S*0.14,P.S*0.4,P.S*0.28); c.strokeStyle=OWN.rgb([150,130,100],1-k); c.lineWidth=0.8; c.beginPath(); c.moveTo(-P.S*0.15,-P.S*0.04); c.lineTo(P.S*0.15,-P.S*0.04); c.moveTo(-P.S*0.15,P.S*0.05); c.lineTo(P.S*0.1,P.S*0.05); c.stroke(); c.restore(); } } },
  "Full Breakfast":{at:[0.5,-0.05],n:3,items:["toast","egg","bacon"],sz:1.05,spread:0.7,stagger:60,keep:true,end:(P,i)=>({x:P.head.x+(i-1)*P.S*0.5,y:P.head.y-P.S*0.2}),
    land(c,PF,k,P,x,F,i){ const it=["toast","egg","bacon"][i];
      if(it==="egg"){ OWN.splat(c,F.end.x,F.end.y+P.S*0.3,P.S*0.9,[255,255,250],k,71,2); c.fillStyle=OWN.rgb([255,200,40],k<0.7?1:1-(k-0.7)/0.3); c.beginPath(); c.arc(F.end.x,F.end.y+P.S*0.3+k*P.S*0.3,P.S*0.38,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.arc(F.end.x-P.S*0.1,F.end.y+P.S*0.2+k*P.S*0.3,P.S*0.1,0,7); c.fill(); return; }
      const sd=it==="toast"?P.d:-P.d, p={x:F.end.x+sd*P.R*1.1*k,y:F.end.y-P.R*0.9*Math.sin(Math.PI*k)+k*k*(P.gnd-F.end.y-F.s*0.4)}; OWN.MT.item(c,x,it,p.x,p.y,F.s,sd*k*7,k*300);
      for(let j=0;j<4;j++){ c.fillStyle=OWN.rgb([200,140,60],1-k); c.beginPath(); c.arc(F.end.x+(atH(j+i*5)-0.5)*P.R*1.6*k,F.end.y-P.R*0.4*Math.sin(Math.PI*k)+k*P.R,1.8,0,7); c.fill(); } },
    impact(c,PF,k,P){ OWN.bonk(c,P.head.x,P.head.y,P.R*0.8,k); } },
  "Big Bell":{at:[0.5,0.0],item:"bell2",swing:true,keep:true,sz:1.4,apex:4.6,end:P=>({x:P.tg.x,y:P.head.y-P.S*0.6}),
    impact(c,PF,k,P,x){ const bp={x:P.end.x,y:P.end.y-P.R*0.6*Math.sin(Math.PI*Math.min(1,k*1.6))+(k>0.62?(k-0.62)/0.38*(P.gnd-P.end.y-P.s*0.6):0)}; OWN.MT.item(c,x,"bell2",bp.x,bp.y,P.s,Math.sin(k*25)*0.3*(1-k),k*1000);
      for(let i=0;i<3;i++){ const q=Math.max(0,k-i*0.12); if(q<=0||q>=1) continue; c.strokeStyle=OWN.rgb([255,225,120],1-q); c.lineWidth=4*(1-q); c.beginPath(); c.arc(P.tg.x,P.tg.y-P.R*0.3,P.R*(0.6+1.4*q),0,7); c.stroke(); }
      for(let i=0;i<4;i++) OWN.note(c,P.tg.x+(i-1.5)*P.R*0.8,P.tg.y-P.R*(0.8+k*1.2)+Math.sin(k*9+i)*4,P.S*0.4,OWN.rgb([255,210,90],1-k),Math.sin(k*8+i)*0.4,i%2===1); OWN.bonk(c,P.head.x,P.head.y,P.R*0.7,k); } },
  "Depth Charge":{at:[1.0,0.5],item:"mine",upright:true,end:P=>({x:P.tg.x,y:P.gnd-P.S*1.1}),
    impact(c,PF,k,P){ const sea=[140,200,240]; for(let i=0;i<10;i++){ const h=P.R*(1.2+1.4*eo(Math.min(1,k*2.5)))*(k<0.5?1:1-(k-0.5)*1.4), xx=P.tg.x+(i-4.5)*P.R*0.16; PF(xx,P.gnd-h*(i%2?0.8:1)*Math.max(0,1-Math.abs(i-4.5)/6),P.S*0.7,0.8*(1-k*0.6),i%3?[230,245,255]:sea); }
      for(let i=0;i<14;i++){ const a=-Math.PI+i/13*Math.PI, v=P.R*(0.8+1.2*atH(i)); c.fillStyle=OWN.rgb(i%3?sea:[235,248,255],1-k); c.beginPath(); c.ellipse(P.tg.x+Math.cos(a)*v*eo(k),P.gnd-P.R*1.2+Math.sin(a)*v*eo(k)+k*k*P.R*2,P.S*0.14,P.S*0.2,a,0,7); c.fill(); }
      OWN.MT.boom(c,PF,{x:P.tg.x,y:P.gnd-P.R*0.3},P.R*0.7,k,[[240,250,255],[180,220,250],[120,170,220]],[220,230,240]); c.fillStyle=OWN.rgb([120,180,230],0.5*(1-k)); c.beginPath(); c.ellipse(P.tg.x,P.gnd+2,P.R*(0.6+0.8*eo(k)),P.R*0.16,0,0,7); c.fill(); } },
  "Cherry Bomb":{at:[0.5,-0.1],item:"cbomb",trail:"spark",spin:0.5,
    impact(c,PF,k,P){ OWN.MT.boom(c,PF,P.hit,P.R,k,[[255,220,200],[240,60,80],[150,20,40]]); OWN.splat(c,P.hit.x,P.hit.y,P.S*1.1,[200,30,50],k,81,3); OWN.MT.scorch(c,P,k,0.8);
      c.fillStyle=OWN.rgb([150,90,60],1-k); c.beginPath(); c.ellipse(P.hit.x+P.d*P.R*k,P.hit.y-P.R*Math.sin(Math.PI*k),P.S*0.18,P.S*0.25,k*8,0,7); c.fill(); c.strokeStyle=OWN.rgb([74,122,42],1-k); c.lineWidth=2; c.beginPath(); c.moveTo(P.hit.x-P.d*P.R*k,P.hit.y-P.R*1.2*Math.sin(Math.PI*k)); c.lineTo(P.hit.x-P.d*P.R*k+6,P.hit.y-P.R*1.2*Math.sin(Math.PI*k)-10); c.stroke(); } },
  "Jackpot":{at:[0.5,0.3],n:8,item:"coin1",sz:0.6,spread:2.4,stagger:22,keep:true,spin:0,
    launch(c,PF,t,P){ atGlowA(c,P.o0.x,P.o0.y,P.S*2,[255,220,100],0.6*Math.max(0,1-t/300)); if(t<200) for(let i=0;i<4;i++) OWN.star(c,P.o0.x+(atH(i)-0.5)*P.S*2,P.o0.y-(t/200)*P.S*(1+atH(i*2)),P.S*0.25*(1-t/200),"rgba(255,250,210,.95)",t/50+i); },
    land(c,PF,k,P,x,F,i){ const sd=atH(i*3)>0.5?1:-1, h=P.R*(0.3+0.4*atH(i*5)), p={x:F.end.x+sd*P.R*0.5*k,y:Math.min(P.gnd-F.s*0.6,F.end.y-h*Math.sin(Math.PI*Math.min(1,k*1.6))+k*k*(P.gnd-F.end.y))}; c.globalAlpha=k<0.7?1:(1-k)/0.3; OWN.MT.item(c,x,"coin1",p.x,p.y,F.s,0,k*600+i*40); c.globalAlpha=1;
      if(k<0.4) OWN.star(c,F.end.x,F.end.y-F.s*0.6,F.s*0.6*(1-k/0.4),"rgba(255,255,230,.95)",k*6); },
    impact(c,PF,k,P){ if(k<0.6) for(let i=0;i<3;i++) OWN.star(c,P.tg.x+(i-1)*P.R*0.7,P.tg.y-P.R*(0.9+k),P.S*0.3*(1-k/0.6),"rgba(255,240,150,.95)",k*5+i); } },
  "Rock Shower":{at:[0.5,-0.1],n:6,item:"hotrock",sz:1.25,trail:"fire",stagger:40,land:"boom",
    launch(c,PF,t,P){ const {o0}=P; PF(o0.x,o0.y-P.S*0.4,P.S*(0.5+t/350),0.6*Math.max(0,1-t/330),[120,100,100]); if(t<220) atGlowA(c,o0.x,o0.y,P.S*1.4,[255,130,50],0.7*(1-t/220)); },
    impact(c,PF,k,P){ OWN.MT.scorch(c,P,k,1.3); OWN.MT.debris(c,P.hit,P.R,k,[90,80,75],9,0.12,7); } },
  "Lava Bomb":{at:[0.5,-0.1],item:"magma",trail:"fire",
    impact(c,PF,k,P){ OWN.MT.boom(c,PF,P.hit,P.R,k); OWN.splat(c,P.hit.x,P.hit.y,P.S*1.2,[255,110,40],k,91,4); OWN.MT.scorch(c,P,k,1.1); for(let j=0;j<4;j++) OWN.fire(c,P.tg.x+(j-1.5)*P.R*0.5,P.gnd,P.R*0.7*(k<0.3?k/0.3:1-k),OWN.rgb([255,110,40],0.9),OWN.rgb([255,230,140],0.9),k*1000,j); } },
  "Volcano Blast":{at:[0.5,-0.1],item:"magma",n:4,sz:1.0,trail:"fire",stagger:45,land:"boom",
    launch(c,PF,t,P){ const {o0,R}=P, k=Math.min(1,t/250), fade=t<300?1:Math.max(0,1-(t-300)/150), top=P.tg.y-R*5.6; if(fade<=0) return;
      for(let i=0;i<12;i++){ const q=i/11; if(q>k) break; PF(o0.x+Math.sin(t/40+i)*P.S*0.4*q,o0.y-(o0.y-top)*q,P.S*(0.6+0.7*q),0.85*fade,i%3?[255,120,40]:[255,210,90]); }
      atGlowA(c,o0.x,o0.y,P.S*1.8,[255,140,50],0.7*fade); },
    impact(c,PF,k,P){ OWN.MT.boom(c,PF,P.hit,P.R*1.3,k); OWN.MT.scorch(c,P,k,1.4); OWN.MT.debris(c,P.hit,P.R*1.2,k,[80,60,55],10,0.15,9); } },
  "Rock Drop":{at:[1.0,0.6],item:"rock",trail:"speed",keep:true,sz:1.3,spin:0.3,end:P=>({x:P.head.x,y:P.head.y-P.S*0.3}),
    launch(c,PF,t,P,x){ for(let i=0;i<4;i++){ const q=Math.min(1,t/330); c.save(); c.translate(P.o0.x+(atH(i)-0.5)*P.R+Math.sin(t/60+i)*P.S*0.3,P.o0.y+q*P.R*(0.4+0.6*atH(i*2))); c.rotate(Math.sin(t/80+i)*0.8); c.globalAlpha=1-q; c.fillStyle="#f4ece0"; c.strokeStyle="#8a6a4a"; c.lineWidth=1; c.beginPath(); c.ellipse(0,0,P.S*0.32,P.S*0.1,0,0,7); c.fill(); OWN.ol(c); c.beginPath(); c.moveTo(-P.S*0.4,0); c.lineTo(P.S*0.3,0); c.stroke(); c.restore(); } },
    impact(c,PF,k,P,x){ SG.dust(c,P.tg.x,P.gnd,P.R,k,8); OWN.MT.debris(c,P.end,P.R,k,[120,112,104],7,0.12,11); OWN.bonk(c,P.end.x,P.end.y,P.R,k); OWN.MT.item(c,x,"rock",P.end.x+P.d*P.R*1.2*k,P.end.y-P.R*0.8*Math.sin(Math.PI*k)+k*k*(P.gnd-P.end.y-P.s*0.7),P.s,P.rot+P.d*k*5,0); } },
  "Supernova":{at:[0.6,0.4],item:"nova",upright:true,sz:1.3,
    launch(c,PF,t,P){ if(t<200) atGlowA(c,P.o0.x,P.o0.y,P.S*3,[255,170,60],0.7*(1-t/200)); },
    impact(c,PF,k,P){ if(k>=1) return; atGlowA(c,P.hit.x,P.hit.y,P.R*(1.5+3*k),[255,230,170],0.95*(1-k)); for(let i=0;i<3;i++){ const q=Math.max(0,k-i*0.1); c.strokeStyle=OWN.rgb(i===1?[255,150,60]:[255,250,220],1-q); c.lineWidth=6*(1-q)+1; c.beginPath(); c.arc(P.hit.x,P.hit.y,P.R*(0.5+3*eo(q)),0,7); c.stroke(); }
      for(let i=0;i<16;i++){ const a=i/16*7, v=P.R*(0.5+2.5*eo(k)); OWN.star(c,P.hit.x+Math.cos(a)*v,P.hit.y+Math.sin(a)*v*0.8,P.S*0.2*(1-k),OWN.rgb(i%2?[255,200,90]:[255,250,220],1-k),k*6+i); } OWN.MT.scorch(c,P,k,1.2); } },
  "Mountain Fall":{at:[0.5,1.0],item:"mountain",big:2.2,from:"sky",upright:true,end:(P,i,s)=>({x:P.tg.x,y:P.gnd-s*0.74}),
    launch(c,PF,t,P){ const {o0,sg,tg,R}=P; SG.dust(c,o0.x,sg,P.S*1.4,Math.min(1,t/330),8);
      for(let i=0;i<8;i++){ const st=i*35, q=(t-st)/280; if(q<0||q>1) continue; c.fillStyle=OWN.rgb([110,100,90],0.9); c.beginPath(); c.arc(tg.x+(atH(i)-0.5)*R*2.6,(tg.y-R*11)+(P.gnd-tg.y+R*11)*q*q,2.4+atH(i*2)*1.6,0,7); c.fill(); }
      OWN.MT.shadow(c,tg,P.gnd,0.2*Math.min(1,t/330),R*2); },
    impact(c,PF,k,P,x){ const sink=Math.min(1,k*3); if(k<0.55){ c.globalAlpha=1-k/0.55; OWN.MT.item(c,x,"mountain",P.end.x,P.end.y+sink*P.s*0.03,P.s,0,0); c.globalAlpha=1; }
      for(let i=0;i<8;i++) PF(P.tg.x+(i-3.5)*P.R*0.45,P.gnd-P.R*(0.2+1.0*eo(k))*(0.5+0.5*atH(i)),P.R*(0.5+0.6*k),0.8*(1-k),[205,190,165]); OWN.MT.debris(c,P.hit,P.R*1.3,k,[110,100,92],12,0.16,13);
      c.strokeStyle=OWN.rgb([60,45,35],1-k); c.lineWidth=2.5; for(const sd of [-1,1]){ c.beginPath(); for(let i=0;i<=8;i++){ const xx=P.tg.x+sd*i*P.R*0.25; c.lineTo(xx,P.gnd+(i%2?2:-2)); } c.stroke(); } } },
  "Wish":{at:[0.85,-0.05],item:"wishstar",trail:"rainbow",upright:true,sz:1.15,
    launch(c,PF,t,P){ if(t<200) atGlowA(c,P.o0.x,P.o0.y,P.S*1.6,[255,240,200],0.8*(1-t/200)); },
    impact(c,PF,k,P){ if(k>=1) return; for(let i=0;i<12;i++){ const a=i/12*7, v=P.R*(0.4+1.4*eo(k)); OWN.star(c,P.hit.x+Math.cos(a)*v,P.hit.y+Math.sin(a)*v*0.8,P.S*0.45*(1-k),OWN.rgb([[255,150,180],[255,220,120],[150,220,255],[200,170,255]][i%4],1),k*5+i); }
      for(let i=0;i<16;i++){ const q=((k*1.2)+atH(i))%1; c.fillStyle=OWN.rgb([255,250,220],(1-k)*(1-q)); c.beginPath(); c.arc(P.hit.x+(atH(i*3)-0.5)*P.R*2.4,P.hit.y-P.R+q*P.R*2,1.8,0,7); c.fill(); } atGlowA(c,P.hit.x,P.hit.y,P.R*1.2,[255,240,220],0.6*(1-k));
      const cols=[[255,120,150],[255,200,100],[150,225,140],[130,180,255]]; if(k<0.7) cols.forEach((cl,j)=>{ c.strokeStyle=OWN.rgb(cl,0.8*(1-k/0.7)); c.lineWidth=P.S*0.14; c.beginPath(); c.arc(P.hit.x,P.gnd,P.R*(0.9+j*0.16)*eo(Math.min(1,k*2)),Math.PI,0); c.stroke(); }); } },
  "Pumpkin Bomb":{at:[0.7,0.5],item:"pumpkinb",trail:"spark",spin:0.5,
    impact(c,PF,k,P){ OWN.MT.boom(c,PF,P.hit,P.R,k,[[255,240,180],[255,140,40],[200,80,20]]); OWN.MT.debris(c,P.hit,P.R,k,[255,138,42],9,0.18,15); OWN.MT.scorch(c,P,k,0.9);
      for(let i=0;i<10;i++){ const a=-Math.PI+i/9*Math.PI, v=P.R*(0.6+atH(i)); c.fillStyle=OWN.rgb([250,240,200],1-k); c.beginPath(); c.ellipse(P.hit.x+Math.cos(a)*v*eo(k),P.hit.y+Math.sin(a)*v*eo(k)+k*k*P.R*1.5,P.S*0.12,P.S*0.07,a+k*6,0,7); c.fill(); } } },
  "Dragon Fury":{at:[0.95,0.4],   /* the dragon flies up and spits three fireballs down at the foe, which blast one after another (Gid, 19 Nov 2026) */
    atk:(t,pos)=>{ const up=t<260?eo(t/260):t<760?1:1-eio(OWN.k(t,760,1000)); const spit=[240,320,400].some(t0=>t>=t0-30&&t<t0+60); return {lift:-62*up+Math.sin(t/90)*4*up,pose:t>=760?null:spit?"bitewide":"determined",rot:-0.06*(pos.dir||1)*up}; },
    fx(c,PF,t,x,o){ const P=OWN.cx(x,{at:o.at,sz:1.2}), {tg,d,S,R}=P, s=x.self, m=s.mouth?{x:s.mouth.x,y:s.mouth.y}:P.o0, hit={x:tg.x-d*R*0.1,y:tg.y-R*0.15};
      const outer=OWN.rgb([255,110,40],0.95), inner=OWN.rgb([255,235,150],0.98);
      if(t<260){ const k=t/260, f={x:m.x+d*S*0.1,y:m.y}; atGlowA(c,f.x,f.y,S*(0.6+0.9*k),[255,150,60],0.55*k); for(let i=0;i<3;i++){ const a=t/45+i*2.1; OWN.flame(c,f.x+Math.cos(a)*S*0.2*k,f.y+Math.sin(a)*S*0.15*k,S*0.22*k,a,outer,inner,t); } }
      for(let i=0;i<3;i++){ const t0=240+i*80, t1=t0+160, e={x:hit.x+(i-1)*R*0.5,y:hit.y+(i===1?-R*0.25:R*0.2)}, ang=Math.atan2(e.y-m.y,e.x-m.x);
        if(t>=t0&&t<t1){ const k=ei((t-t0)/160), p={x:m.x+(e.x-m.x)*k,y:m.y+(e.y-m.y)*k}; if(k<0.35) atGlowA(c,m.x+d*S*0.1,m.y,S*1.0,[255,170,80],0.6*(1-k/0.35));
          for(let j=1;j<5;j++){ const q=Math.max(0,k-j*0.07); PF(m.x+(e.x-m.x)*q,m.y+(e.y-m.y)*q-j,S*(0.25+j*0.08),0.3*(1-j/5),[120,105,100]); }
          const g=Math.min(1,k/0.3); OWN.comet(c,{x:p.x+Math.cos(ang)*S*0.15*g,y:p.y+Math.sin(ang)*S*0.15*g},S*(0.25+0.55*g),ang,t+i*50,0.15+1.45*g); }
        else if(t>=t1){ const k=OWN.k(t,t1,t1+440); if(k<1){ OWN.MT.boom(c,PF,e,R*0.6,k); if(k<0.4) for(let j=0;j<6;j++){ const aa=j/6*7, dd=R*(0.2+0.7*eo(k/0.4)); OWN.flame(c,e.x+Math.cos(aa)*dd,e.y+Math.sin(aa)*dd*0.8,S*0.35*(1-k/0.4),aa+Math.PI,outer,inner,t+j*20); } } } }
      if(t>400) OWN.MT.scorch(c,P,OWN.k(t,400,1000),1.3); } },
  "Magma Bomb":{at:[1.02,0.45],item:"magma",trail:"fire",
    impact(c,PF,k,P){ OWN.MT.boom(c,PF,P.hit,P.R*0.9,k); OWN.splat(c,P.hit.x,P.hit.y,P.S*1.1,[255,100,40],k,95,4); c.fillStyle=OWN.rgb([200,60,20],0.8*(1-k*0.5)); c.beginPath(); c.ellipse(P.tg.x,P.gnd,P.R*(0.5+0.6*eo(k)),P.R*0.18,0,0,7); c.fill();
      for(let i=0;i<6;i++){ const q=((k*1.5)+i/6)%1; PF(P.tg.x+(atH(i)-0.5)*P.R*1.2,P.gnd-q*P.R*1.4,P.S*(0.3+0.3*q),0.4*(1-k)*(1-q),[110,100,100]); } } }
};
OWN.meteorFx=(c,t,x,o)=>{ const m=c.getTransform?c.getTransform():null, top=m&&m.d?-m.f/m.d:null;
  OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:o.at,sz:1.4}); P.hit={x:P.tg.x,y:P.tg.y-P.R*0.2}; P.top=top!=null?top:P.tg.y-P.R*9;
    const n=o.n||1, F=[]; for(let i=0;i<n;i++) F.push(OWN.MT.plan(P,o,i,n)); P.end=F[0].end; P.s=F[0].s;
    const rotAt=(i,tt)=>o.swing?Math.sin(tt/50)*0.35:o.upright?Math.sin(tt/90)*0.1:P.d*(o.spin!=null?o.spin:1)*tt/60+i; P.rot=rotAt(0,560);
    if(o.launch&&t<560) o.launch(c,PF,t,P,x);
    for(let i=0;i<n;i++){ const f=F[i], it=o.items?o.items[i%o.items.length]:o.item, p=OWN.MT.at(f,t);
      if(p){ if(t>=f.t1) OWN.MT.shadow(c,{x:f.end.x},P.gnd,ei((t-f.t1)/(f.t2-f.t1)),f.s*1.3);
        if(o.trail) OWN.MT.trail(c,PF,f,t,f.s,o.trail,i);
        const age=t-f.t0, pop=f.sky?1:0.7+0.3*eo(Math.min(1,age/80)); if(!f.sky&&age<120) PF((f.a0||f.a).x,(f.a0||f.a).y,f.s*0.7*(1-age/120)+2,0.55*(1-age/120),[245,240,230]);
        let rot=rotAt(i,t); if(o.orient){ const q=OWN.MT.at(f,t-16)||p; if(q!==p) rot=Math.atan2(p.x-q.x,-(p.y-q.y)); } OWN.MT.item(c,x,it,p.x,p.y,f.s*pop,rot,t); continue; }
      if(t<=f.t2) continue; const k=(t-f.t2)/320; if(k>=1) continue;
      if(typeof o.land==="function"){ o.land(c,PF,k,P,x,f,i); continue; }
      if(!o.keep&&k<0.3){ const q=k/0.3; c.save(); c.globalAlpha=1-q; c.translate(f.end.x,f.end.y+f.s*0.3*q); c.scale(1+0.35*q,1-0.4*q); OWN.MT.item(c,x,it,0,0,f.s,rotAt(i,f.t2),f.t2); c.restore(); }
      if(o.land==="boom") OWN.MT.boom(c,PF,f.end,P.R*0.5,k); else if(o.land==="dust"||n>1){ OWN.MT.puff(c,PF,f.end,f.s,k); OWN.MT.debris(c,f.end,f.s*1.5,k,[120,110,100],5,0.1,i*3); } }
    if(t>=560&&o.impact) o.impact(c,PF,Math.min(1,(t-560)/440),P,x); }); };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.meteor) return; const K=ANIM.meteor, fx1=K.fx;
  const atk1=K.atk; K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&pos.name&&OWN_METEOR[pos.name], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; };
  K.fx=function(c,t,x){ const o=x&&OWN_METEOR[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ if(o.fx) OWN.twoPass(c,x,(cc,PF)=>o.fx(cc,PF,t,x,o)); else OWN.meteorFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN meteor",x.name,e&&e.message); } } }; })();

/* ---------- drool, own versions (18 Nov 2026): every family lobbed the same purple glob, so each move now forms out of its own body
   part, flies as its own stuff (silk, ink, mud, wax, syrup, paint, ice cream, juice, lava, slime with eyes) and lands its own way.
   Wind-up to 300 ms, flight 300-620, contact at 620, splat and drips to 1300. ---------- */
OWN.DR={
  src(P,x,o){ const s=x.self, fr=OWN.pt(s,x.target,[1,0.5]).x; if(o.mouth&&s&&s.mouth) return {x:fr+P.d*P.S*0.35,y:s.mouth.y+P.S*0.1};   /* out in front of the mouth, never over the face */
    const at=o.at||[0.8,0.4]; return at[0]>=0.8&&!o.inside?{x:fr+P.d*P.S*0.3,y:P.o0.y}:P.o0; },
  hit(P,o){ return o.hitAt?o.hitAt(P):{x:P.tg.x-P.d*P.R*0.15,y:P.tg.y-P.R*0.3}; },
  pos(a,b,k,R,arc){ const top=Math.min(a.y,b.y)-R*arc, cx=(a.x+b.x)/2, v=1-k; return {x:v*v*a.x+2*v*k*cx+k*k*b.x,y:v*v*a.y+2*v*k*top+k*k*b.y}; },
  blob(c,p,r,col,t,ang,st,type,seed=0){ if(r<=0.5) return; c.save(); c.translate(p.x,p.y); c.rotate(ang); c.scale(1+st,1-st*0.45);
    if(type==="lava"||type==="hot") atGlowA(c,0,0,r*2.2,type==="lava"?[255,140,60]:[255,190,110],0.55);
    const lt=OWN.mix(col,[255,255,255],0.45), dk=OWN.mix(col,[0,0,0],0.4), al=type==="water"?0.6:type==="syrup"?0.88:1;
    c.beginPath(); for(let i=0;i<=16;i++){ const a=i/16*Math.PI*2, rr=r*(1+0.07*Math.sin(t/45+i*1.7+seed)); c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath();
    c.fillStyle=OWN.rg(c,0,0,r*0.05,r*1.05,[[0,OWN.rgb(lt,al)],[0.55,OWN.rgb(col,al)],[1,OWN.rgb(dk,al)]],-r*0.3,-r*0.35); c.fill(); c.strokeStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.55),0.8); c.lineWidth=Math.max(1,r*0.07); c.stroke();
    c.save(); c.clip();
    if(type==="silk"){ c.strokeStyle="rgba(170,170,185,.9)"; c.lineWidth=1.2; for(let i=0;i<5;i++){ c.beginPath(); c.ellipse(0,0,r*(0.95-i*0.05),r*0.35,i*0.7+t/300,0,7); c.stroke(); } }
    if(type==="mud"){ for(let i=0;i<7;i++){ c.fillStyle=i%2?"#4a3626":"#a88a64"; c.beginPath(); c.arc((atH(i+seed)-0.5)*r*1.4,(atH(i*3+seed)-0.5)*r*1.4,r*(0.08+0.07*atH(i*5)),0,7); c.fill(); } }
    if(type==="acid"||type==="goo"){ for(let i=0;i<4;i++){ const q=((t/400)+i/4)%1; c.strokeStyle=OWN.rgb(lt,0.9); c.lineWidth=1; c.beginPath(); c.arc((atH(i+seed)-0.5)*r,r*0.6-q*r*1.2,r*(0.1+0.06*atH(i*2)),0,7); c.stroke(); } }
    if(type==="weeds"){ c.strokeStyle="#3a6a2a"; c.lineWidth=Math.max(1.2,r*0.08); for(let i=0;i<4;i++){ c.beginPath(); c.moveTo((atH(i)-0.5)*r*1.4,r*0.8); c.quadraticCurveTo((atH(i*2)-0.5)*r,0,(atH(i*3)-0.5)*r*1.2+Math.sin(t/60+i)*r*0.15,-r*0.6); c.stroke(); } }
    if(type==="cream"){ const cl=["#ff5a8a","#5ac8ff","#ffe14a","#7ae07a","#ffffff"]; for(let i=0;i<9;i++){ c.save(); c.translate((atH(i+seed)-0.5)*r*1.5,(atH(i*3+seed)-0.5)*r*1.5); c.rotate(atH(i*7)*3); c.fillStyle=cl[i%5]; c.fillRect(-r*0.12,-r*0.035,r*0.24,r*0.07); c.restore(); } }
    if(type==="paint"){ c.strokeStyle="rgba(255,240,200,.9)"; c.lineWidth=r*0.18; c.beginPath(); for(let i=0;i<=12;i++){ const a=i/12*Math.PI*1.6+t/200, rr=r*0.15+i/12*r*0.55; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.stroke(); }
    if(type==="rust"){ for(let i=0;i<6;i++){ c.fillStyle=i%2?"rgba(120,50,20,.8)":"rgba(230,140,70,.8)"; c.beginPath(); c.ellipse((atH(i+seed)-0.5)*r*1.3,(atH(i*3+seed)-0.5)*r*1.3,r*0.16,r*0.09,atH(i)*3,0,7); c.fill(); } }
    if(type==="lava"){ c.strokeStyle="rgba(255,240,170,.85)"; c.lineWidth=r*0.1; for(let i=0;i<3;i++){ c.beginPath(); c.moveTo((atH(i)-0.5)*r,(atH(i*2)-0.5)*r); c.lineTo((atH(i*4)-0.5)*r*1.2,(atH(i*5)-0.5)*r*1.2); c.stroke(); } }
    c.restore();
    if(type==="eyes"){ for(let i=0;i<3;i++){ const ex=(i-1)*r*0.42, ey=(i%2?-0.15:0.2)*r, bl=Math.abs(Math.sin(t/180+i*2))<0.12; c.fillStyle="#fff"; c.beginPath(); c.ellipse(ex,ey,r*0.17,bl?r*0.03:r*0.17,0,0,7); c.fill(); if(!bl){ c.fillStyle="#1a0a1a"; c.beginPath(); c.arc(ex+r*0.05,ey,r*0.08,0,7); c.fill(); } } }
    if(type!=="mud"&&type!=="silk"){ c.fillStyle=type==="water"?"rgba(255,255,255,.85)":"rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-r*0.35,-r*0.38,r*0.22,r*0.12,-0.6,0,7); c.fill(); c.beginPath(); c.arc(r*0.3,r*0.32,r*0.06,0,7); c.fill(); }
    if(type==="water"){ c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=1.2; c.beginPath(); c.arc(0,0,r*0.75,0.3,1.4); c.stroke(); }
    c.restore(); },
  strand(c,a,p,r,col,al=0.85){ const mx=(a.x+p.x)/2, my=Math.max(a.y,p.y)+r*0.6; c.strokeStyle=OWN.rgb(col,al); c.lineCap="round";
    for(const [w,o] of [[r*0.42,0],[r*0.2,0.3]]){ c.lineWidth=w; c.beginPath(); c.moveTo(a.x,a.y); c.quadraticCurveTo(mx,my+o*r,p.x,p.y); c.stroke(); } },
  drips(c,h,R,k,col,n=4,seed=0){ for(let i=0;i<n;i++){ const dx=(i-(n-1)/2)*R*0.32+(atH(i+seed)-0.5)*R*0.1, L=R*(0.2+0.75*eo(Math.min(1,k*1.4)))*(0.6+0.5*atH(i+seed)), a=1-ei(k);
    c.fillStyle=OWN.rgb(col,0.92*a); c.beginPath(); c.moveTo(h.x+dx-R*0.06,h.y); c.lineTo(h.x+dx-R*0.035,h.y+L); c.arc(h.x+dx,h.y+L,R*0.05,Math.PI,0,true); c.lineTo(h.x+dx+R*0.06,h.y); c.fill();
    const fq=((k*2.2)+atH(i*7))%1; if(k>0.3){ c.beginPath(); c.arc(h.x+dx,h.y+L+fq*R*0.7,R*0.04*(1-fq),0,7); c.fill(); } } },
  strings(c,h,R,k,col,gnd){ const a=k<0.6?1:1-(k-0.6)/0.4; c.strokeStyle=OWN.rgb(col,0.8*a); c.lineCap="round"; for(let i=0;i<3;i++){ const x0=h.x+(i-1)*R*0.4, sag=R*(0.3+0.9*eo(k))*(0.7+0.3*atH(i)); c.lineWidth=R*0.05*(1-k*0.6); c.beginPath(); c.moveTo(x0,h.y+R*0.1); c.quadraticCurveTo(x0+(i-1)*R*0.2,h.y+sag*1.4,x0+(i-1)*R*0.3,Math.min(gnd,h.y+sag)); c.stroke(); } }
};
/* Shapes for drool, second pass (18 Nov 2026): Gid turned down the first pass because every move flew as a blob. Each move now
   has a shape of its own: ropes and streams, a net, needles, clods, a brush stroke, a sheet of water, an ice cream scoop, a frog
   on a lily pad, crawling tendrils, a slime with a mouth. */
Object.assign(OWN.DR,{
  seg(a,b,arc,R,k0,k1,N=18){ const out=[]; for(let j=0;j<=N;j++) out.push(OWN.DR.pos(a,b,k0+(k1-k0)*j/N,R,arc)); return out; },
  wob(pts,amp,t,fr=2.5){ const n=pts.length; return pts.map((p,j)=>{ const q=pts[Math.min(n-1,j+1)], o=pts[Math.max(0,j-1)], dx=q.x-o.x, dy=q.y-o.y, L=Math.hypot(dx,dy)||1, e=Math.sin(Math.PI*j/(n-1)), w=Math.sin(j/(n-1)*Math.PI*fr-t/60)*amp*e; return {x:p.x-dy/L*w,y:p.y+dx/L*w}; }); },
  rib(c,pts,w0,w1,col,al=1,gloss=true){ if(pts.length<2) return; c.lineCap="round"; c.lineJoin="round"; const dk=OWN.mix(col,[0,0,0],0.4), lt=OWN.mix(col,[255,255,255],0.55);
    const pass=(m,cl,a2,dy)=>{ c.strokeStyle=OWN.rgb(cl,a2); for(let j=1;j<pts.length;j++){ const f=j/(pts.length-1), w=w0+(w1-w0)*f; c.lineWidth=Math.max(0.6,w*m); c.beginPath(); c.moveTo(pts[j-1].x,pts[j-1].y-w*dy); c.lineTo(pts[j].x,pts[j].y-w*dy); c.stroke(); } };
    pass(1.25,dk,al,0); pass(1,col,al,0); if(gloss) pass(0.28,lt,al*0.85,0.22); },
  tear(c,x,y,r,ang,col,al=1){ c.save(); c.translate(x,y); c.rotate(ang); c.fillStyle=OWN.rgb(col,al); c.strokeStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.45),al); c.lineWidth=Math.max(1,r*0.12);
    c.beginPath(); c.moveTo(-r*2.1,0); c.bezierCurveTo(-r*0.8,-r*0.5,-r*0.2,-r,r*0.4,-r*0.85); c.arc(r*0.35,0,r*0.86,-Math.PI/2,Math.PI/2); c.bezierCurveTo(-r*0.2,r,-r*0.8,r*0.5,-r*2.1,0); c.fill(); OWN.ol(c);
    c.fillStyle=`rgba(255,255,255,${0.7*al})`; c.beginPath(); c.ellipse(r*0.4,-r*0.38,r*0.28,r*0.14,0.2,0,7); c.fill(); c.restore(); },
  clod(c,x,y,r,col,rot,seed,al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=OWN.rgb(col,al); c.strokeStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.45),al); c.lineWidth=Math.max(1,r*0.1);
    c.beginPath(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, rr=r*(0.65+0.45*atH(i*3+seed)); c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.3),al); c.beginPath(); c.arc(-r*0.25,-r*0.25,r*0.18,0,7); c.fill(); c.fillStyle=OWN.rgb([70,60,55],al); c.beginPath(); c.arc(r*0.3,r*0.1,r*0.13,0,7); c.fill(); c.restore(); },
  sheet(c,p,ang,w,h,col,t,al=0.8){ c.save(); c.translate(p.x,p.y); c.rotate(ang); c.fillStyle=OWN.rgb(col,al); c.strokeStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.6),al); c.lineWidth=Math.max(1,h*0.12);
    c.beginPath(); c.moveTo(-w*0.5,-h*0.9); c.quadraticCurveTo(w*0.55,-h*0.2,-w*0.5,h*0.9); c.quadraticCurveTo(w*0.05,0,-w*0.5,-h*0.9); c.fill(); c.beginPath(); c.moveTo(-w*0.45,-h*0.75); c.quadraticCurveTo(w*0.45,-h*0.15,-w*0.45,h*0.75); c.stroke();
    for(let i=0;i<7;i++){ const f=((t/120)+i/7)%1, yy=(i/6-0.5)*h*1.7; c.fillStyle=OWN.rgb(col,al*(1-f)); c.beginPath(); c.arc(-w*0.5-f*w*0.9,yy*(1+f*0.3),h*0.09*(1-f*0.5),0,7); c.fill(); } c.restore(); },
  needle(c,x,y,L,ang,sap,al=1){ c.save(); c.translate(x,y); c.rotate(ang); c.strokeStyle=`rgba(110,85,50,${al})`; c.lineWidth=Math.max(1.4,L*0.07); c.lineCap="round"; c.beginPath(); c.moveTo(-L,0); c.lineTo(L*0.3,0); c.stroke();
    c.strokeStyle=`rgba(235,220,180,${al})`; c.lineWidth=Math.max(0.8,L*0.03); c.beginPath(); c.moveTo(-L*0.9,-L*0.02); c.lineTo(L*0.2,-L*0.02); c.stroke(); if(sap) OWN.DR.tear(c,L*0.25,0,L*0.14,Math.PI,sap,al); c.restore(); },
  scoop(c,x,y,r,col,rot,t,melt=0){ c.save(); c.translate(x,y); c.rotate(rot); const dk=OWN.mix(col,[0,0,0],0.3), lt=OWN.mix(col,[255,255,255],0.45);
    c.fillStyle=OWN.rgb(col); c.strokeStyle=OWN.rgb(dk); c.lineWidth=Math.max(1,r*0.07); c.beginPath(); c.moveTo(-r,r*0.2);
    for(let i=0;i<=8;i++){ const xx=-r+i/8*2*r, dl=(i%2?r*0.28:r*0.12)*(1+melt*2.5*atH(i)); c.quadraticCurveTo(xx-r*0.12,r*0.45+dl,xx,r*0.25); } c.lineTo(r,r*0.2); c.arc(0,r*0.15,r,0,Math.PI,true); c.closePath(); c.fill(); OWN.ol(c);
    c.strokeStyle=OWN.rgb(dk,0.55); c.lineWidth=Math.max(1,r*0.05); for(let i=-1;i<=1;i++){ c.beginPath(); c.arc(i*r*0.35,r*0.1,r*0.55,Math.PI*1.15,Math.PI*1.85); c.stroke(); }
    c.fillStyle=OWN.rgb(lt,0.8); c.beginPath(); c.ellipse(-r*0.35,-r*0.45,r*0.25,r*0.12,-0.5,0,7); c.fill();
    const cl=["#ff5a8a","#5ac8ff","#ffe14a","#7ae07a","#ffffff"]; for(let i=0;i<8;i++){ c.save(); c.translate((atH(i)-0.5)*r*1.5,-r*0.65+atH(i*3)*r*0.9); c.rotate(atH(i*7)*3); c.fillStyle=cl[i%5]; c.fillRect(-r*0.13,-r*0.04,r*0.26,r*0.08); c.restore(); } c.restore(); },
  frog(c,x,y,r,t,al=1){ c.save(); c.translate(x,y); c.globalAlpha*=al; c.fillStyle="#5cb848"; c.strokeStyle="#2a6a20"; c.lineWidth=Math.max(1,r*0.08);
    c.beginPath(); c.ellipse(0,0,r,r*0.7,0,0,7); c.fill(); OWN.ol(c); for(const sx of [-1,1]){ c.beginPath(); c.arc(sx*r*0.45,-r*0.6,r*0.32,0,7); c.fill(); OWN.ol(c); c.fillStyle="#fff"; c.beginPath(); c.arc(sx*r*0.45,-r*0.62,r*0.2,0,7); c.fill(); c.fillStyle="#111"; c.beginPath(); c.arc(sx*r*0.45,-r*0.6,r*0.1,0,7); c.fill(); c.fillStyle="#5cb848"; }
    c.strokeStyle="#2a6a20"; c.beginPath(); c.arc(0,r*0.05,r*0.35,0.3,Math.PI-0.3); c.stroke(); c.fillStyle="#8ad070"; c.beginPath(); c.ellipse(0,r*0.35,r*0.5,r*0.22,0,0,7); c.fill(); c.restore(); },
  lily(c,x,y,r,rot){ c.save(); c.translate(x,y); c.rotate(rot); c.scale(1,0.5); c.fillStyle="#4a9a3a"; c.strokeStyle="#2a5a20"; c.lineWidth=1.5; c.beginPath(); c.moveTo(0,0); c.arc(0,0,r,0.35,Math.PI*2-0.05); c.closePath(); c.fill(); OWN.ol(c);
    c.strokeStyle="rgba(140,200,110,.7)"; for(let i=0;i<5;i++){ const a=0.6+i*1.1; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(a)*r*0.85,Math.sin(a)*r*0.85); c.stroke(); } c.restore(); },
  net(c,cx,cy,Rw,rot,squash,al){ c.save(); c.translate(cx,cy); c.rotate(rot); c.scale(1,squash); c.strokeStyle=`rgba(250,250,255,${al})`; c.lineWidth=1.3;
    for(let i=0;i<8;i++){ const an=i/8*Math.PI*2; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(an)*Rw,Math.sin(an)*Rw); c.stroke(); }
    for(let j=1;j<=4;j++){ c.beginPath(); for(let i=0;i<=8;i++){ const an=i/8*Math.PI*2, rr=Rw*j/4.2; const pa=(i-0.5)/8*Math.PI*2; if(i) c.quadraticCurveTo(Math.cos(pa)*rr*0.86,Math.sin(pa)*rr*0.86,Math.cos(an)*rr,Math.sin(an)*rr); else c.moveTo(rr,0); } c.stroke(); }
    c.fillStyle=`rgba(255,255,255,${al})`; for(let i=0;i<8;i++){ const an=i/8*Math.PI*2; c.beginPath(); c.arc(Math.cos(an)*Rw*0.71,Math.sin(an)*Rw*0.71,1.4,0,7); c.fill(); } c.restore(); },
  brush(c,p,ang,L,col,t,al=1){ c.save(); c.translate(p.x,p.y); c.rotate(ang); c.fillStyle=OWN.rgb(col,al); c.beginPath(); c.moveTo(-L,L*0.05); c.quadraticCurveTo(0,-L*0.55,L,-L*0.05); c.quadraticCurveTo(L*0.2,-L*0.15,-L,L*0.05); c.fill();
    c.strokeStyle=OWN.rgb(OWN.mix(col,[120,120,160],0.4),0.7*al); c.lineWidth=1; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-L*0.7,-L*(0.02+i*0.04)); c.quadraticCurveTo(0,-L*(0.25+i*0.04),L*0.6,-L*(0.06+i*0.02)); c.stroke(); }
    c.fillStyle=OWN.rgb(col,0.8*al); for(let i=0;i<6;i++){ const f=((t/90)+i/6)%1; c.beginPath(); c.arc(-L*(1+f*0.8),L*(0.05+(atH(i)-0.5)*0.5*f),L*0.04*(1-f*0.6),0,7); c.fill(); } c.restore(); },
  pud(c,x,gy,w,col,al){ c.fillStyle=OWN.rgb(col,al); c.beginPath(); c.ellipse(x,gy+2,w,w*0.2,0,0,7); c.fill(); c.fillStyle=`rgba(255,255,255,${0.4*al})`; c.beginPath(); c.ellipse(x-w*0.3,gy,w*0.25,w*0.05,0,0,7); c.fill(); },
  pops(c,h,R,k,col,n=5,seed=0){ for(let i=0;i<n;i++){ const q=((k*2.2)+atH(i+seed))%1, x=h.x+(atH(i*3+seed)-0.5)*R*1.3, y=h.y+(atH(i*5+seed)-0.3)*R*0.8, rr=R*0.12*(0.5+atH(i*7));
    if(q<0.75){ c.fillStyle=OWN.rgb(col,0.85*(1-k)); c.strokeStyle=`rgba(255,255,255,${0.7*(1-k)})`; c.lineWidth=1; c.beginPath(); c.arc(x,y,rr*q/0.75,0,7); c.fill(); c.beginPath(); c.arc(x-rr*0.3*q,y-rr*0.3*q,rr*0.2*q,0,7); c.stroke(); }
    else { const f=(q-0.75)/0.25; c.strokeStyle=OWN.rgb(col,(1-f)*(1-k)); c.lineWidth=1.2; c.beginPath(); c.arc(x,y,rr*(1+f),0,7); c.stroke(); } } }
});
Object.assign(OWN.DR,{
  splatStar(c,x,y,r,col,rot,sq,t,al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.scale(1,sq); const n=9, dk=OWN.mix(col,[0,0,0],0.4), lt=OWN.mix(col,[255,255,255],0.5);
    c.beginPath(); for(let i=0;i<n;i++){ const a0=i/n*Math.PI*2, a1=(i+0.5)/n*Math.PI*2, L=r*(0.85+0.45*atH(i*3+7)), w=r*0.55;
      c.lineTo(Math.cos(a0)*w,Math.sin(a0)*w); c.lineTo(Math.cos(a1-0.12)*L*0.8,Math.sin(a1-0.12)*L*0.8); c.arc(Math.cos(a1)*L,Math.sin(a1)*L,r*0.13*(0.7+0.5*atH(i)),a1-Math.PI/2,a1+Math.PI/2); c.lineTo(Math.cos(a1+0.12)*L*0.8,Math.sin(a1+0.12)*L*0.8); }
    c.closePath(); c.fillStyle=OWN.rgb(col,al); c.fill(); c.strokeStyle=OWN.rgb(dk,al); c.lineWidth=Math.max(1,r*0.07); c.stroke();
    c.fillStyle=OWN.rgb(lt,0.7*al); c.beginPath(); c.ellipse(-r*0.2,-r*0.2,r*0.25,r*0.12,-0.5,0,7); c.fill(); c.beginPath(); c.arc(r*0.25,r*0.15,r*0.06,0,7); c.fill(); c.restore(); },
  pool(c,x,gy,w,col,t,al=1){ const dk=OWN.mix(col,[40,60,10],0.45); c.fillStyle=OWN.rgb(dk,0.85*al); c.beginPath(); c.ellipse(x,gy+2,w*1.05,w*0.24,0,0,7); c.fill(); c.fillStyle=OWN.rgb(col,0.92*al); c.beginPath(); c.ellipse(x,gy+1,w,w*0.2,0,0,7); c.fill();
    c.strokeStyle=`rgba(240,255,200,${0.7*al})`; c.lineWidth=1; for(let j=0;j<2;j++){ const q=((t/500)+j/2)%1; c.beginPath(); c.ellipse(x,gy+1,w*q,w*0.2*q,0,0,7); c.stroke(); } },
  curl(c,x,y,h,t,col,al){ if(h<=1||al<=0) return; c.lineCap="round"; for(let s=0;s<2;s++){ c.strokeStyle=OWN.rgb(col,al*(s?0.5:0.85)); c.lineWidth=s?3.5:1.6; c.beginPath(); const ph=((t/700)%1);
      for(let j=0;j<=14;j++){ const f=j/14, yy=y-f*h, xx=x+Math.sin(f*6+t/90)*h*0.12*(0.4+f); if(j) c.lineTo(xx,yy); else c.moveTo(xx,yy); } c.globalAlpha=1; c.stroke(); } },
  spine(c,x,y,L,ang,sap,al){ c.save(); c.translate(x,y); c.rotate(ang); c.globalAlpha*=al; c.fillStyle="#f4ecc8"; c.strokeStyle="#7a6a3a"; c.lineWidth=1.2;
    c.beginPath(); c.moveTo(L*0.5,0); c.lineTo(-L*0.5,-L*0.08); c.quadraticCurveTo(-L*0.6,0,-L*0.5,L*0.08); c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle="#6a4a2a"; c.beginPath(); c.moveTo(L*0.5,0); c.lineTo(L*0.25,-L*0.035); c.lineTo(L*0.25,L*0.035); c.closePath(); c.fill();
    if(sap){ c.fillStyle=OWN.rgb(sap,0.95); c.beginPath(); c.ellipse(L*0.1,L*0.05,L*0.1,L*0.07,0,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.arc(L*0.07,L*0.03,L*0.025,0,7); c.fill(); } c.restore(); },
  candle(c,x,y,w,len,col,al,gloss,n){ const dk=OWN.mix(col,[120,100,70],0.45); c.beginPath(); c.moveTo(x-w,y); c.quadraticCurveTo(x,y-w*0.55,x+w,y);
    for(let i=n-1;i>=0;i--){ const x1=x-w+(i+1)/n*2*w, x0=x-w+i/n*2*w, xm=(x0+x1)/2, L=len*(0.35+0.65*atH(i*5+2)), bw=(x1-x0)*0.32;
      c.lineTo(x1,y+w*0.05); c.quadraticCurveTo(xm+bw*1.1,y+w*0.2,xm+bw,y+L-bw); c.arc(xm,y+L-bw,bw,0,Math.PI); c.quadraticCurveTo(xm-bw*1.1,y+w*0.2,x0,y+w*0.05); }
    c.closePath(); c.fillStyle=OWN.rgb(col,al); c.fill(); c.strokeStyle=OWN.rgb(dk,al); c.lineWidth=1.3; c.stroke();
    if(gloss){ c.strokeStyle=`rgba(255,255,255,${0.75*al})`; c.lineWidth=1.6; for(let i=0;i<n;i++){ const xm=x-w+(i+0.5)/n*2*w, L=len*(0.35+0.65*atH(i*5+2)); c.beginPath(); c.moveTo(xm-w/n*0.25,y+w*0.1); c.lineTo(xm-w/n*0.25,y+L*0.7); c.stroke(); } c.beginPath(); c.ellipse(x-w*0.3,y-w*0.12,w*0.3,w*0.06,0,0,7); c.stroke(); } }
});
Object.assign(OWN.DR,{
  wblob(c,x,y,r,col,t,al=0.75,rot=0,seed=0){ c.save(); c.translate(x,y); c.rotate(rot); const N=10, pts=[]; for(let i=0;i<N;i++){ const a=i/N*Math.PI*2, rr=r*(0.72+0.36*atH(i*7+3+seed)+0.12*Math.sin(t/55+i*2.1)); pts.push({x:Math.cos(a)*rr,y:Math.sin(a)*rr}); }
    c.beginPath(); for(let i=0;i<=N;i++){ const p=pts[i%N], q=pts[(i+1)%N], m={x:(p.x+q.x)/2,y:(p.y+q.y)/2}; if(i) c.quadraticCurveTo(p.x,p.y,m.x,m.y); else c.moveTo(m.x,m.y); } c.closePath();
    c.fillStyle=OWN.rg(c,0,0,r*0.05,r*1.1,[[0,OWN.rgb(OWN.mix(col,[255,255,255],0.6),al)],[0.6,OWN.rgb(col,al)],[1,OWN.rgb(OWN.mix(col,[0,40,90],0.3),al)]],-r*0.25,-r*0.3); c.fill();
    c.strokeStyle=OWN.rgb(OWN.mix(col,[0,40,90],0.45),Math.min(1,al+0.15)); c.lineWidth=Math.max(1.2,r*0.07); c.stroke();
    c.fillStyle=`rgba(255,255,255,${0.85*al})`; c.beginPath(); c.ellipse(-r*0.32,-r*0.36,r*0.24,r*0.11,-0.6,0,7); c.fill(); c.beginPath(); c.arc(r*0.32,r*0.28,r*0.07,0,7); c.fill();
    c.strokeStyle=`rgba(255,255,255,${0.6*al})`; c.lineWidth=1.2; for(let i=0;i<3;i++){ c.beginPath(); c.arc((atH(i+seed)-0.5)*r,(atH(i*3+seed)-0.5)*r,r*0.08,0,7); c.stroke(); } c.restore(); },
  rise(c,cx,gnd,w,hgt,col,al,t){ if(hgt<=1) return; const N=8; c.beginPath(); c.moveTo(cx-w,gnd); c.lineTo(cx-w*0.92,gnd-hgt*0.85);
    for(let i=0;i<=N;i++){ const xx=cx-w*0.92+i/N*w*1.84, yy=gnd-hgt*(0.85+0.15*Math.sin(i*1.7+t/80)); c.quadraticCurveTo(xx-w*0.1,yy-hgt*0.08,xx,yy); } c.lineTo(cx+w,gnd); c.closePath();
    c.fillStyle=OWN.lg(c,0,gnd-hgt,0,gnd,[[0,OWN.rgb(OWN.mix(col,[255,255,255],0.35),al)],[1,OWN.rgb(col,al)]]); c.fill(); c.strokeStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.4),al); c.lineWidth=1.4; c.stroke();
    c.strokeStyle=`rgba(255,255,255,${0.7*al})`; c.lineWidth=2; for(let i=0;i<3;i++){ const xx=cx-w*0.6+i*w*0.6; c.beginPath(); c.moveTo(xx,gnd-hgt*0.75); c.lineTo(xx,gnd-hgt*0.3); c.stroke(); } },
  coat(c,P,k,col,al,gloss,speed=1.6,n=7){ const R=P.R, g=eo(Math.min(1,k*4)); OWN.DR.candle(c,P.tg.x,P.tg.y-R*0.55,R*1.0*g,R*(0.3+1.0*eo(Math.min(1,k*speed))),col,al,gloss,n); }
});
Object.assign(OWN.DR,{
  rustRope(c,pts,w0,w1,t,seed,al){ OWN.DR.rib(c,pts,w0,w1,[150,68,28],al,false); OWN.DR.rib(c,pts,w0*0.55,w1*0.5,[195,100,45],al,false); const n=pts.length;
    for(let j=1;j<n-1;j+=1){ const p=pts[j], f=j/(n-1), w=w0+(w1-w0)*f; const h=atH(j*7+seed*13); if(h<0.45) continue; c.fillStyle=h<0.7?`rgba(90,38,15,${al})`:`rgba(245,160,80,${al})`; c.beginPath(); c.ellipse(p.x+(atH(j*3+seed)-0.5)*w*0.6,p.y+(atH(j*5+seed)-0.5)*w*0.6,w*0.16,w*0.1,h*4,0,7); c.fill(); }
    c.strokeStyle=`rgba(255,220,170,${0.55*al})`; c.lineWidth=1.2; c.beginPath(); for(let j=0;j<n;j++){ const w=w0+(w1-w0)*j/(n-1); c.lineTo(pts[j].x,pts[j].y-w*0.3); } c.stroke(); },
  rustHead(c,x,y,r,d,t,al=1){ c.save(); c.globalAlpha*=al; c.fillStyle="#a24a1e"; c.strokeStyle="#5a2610"; c.lineWidth=1.4; c.beginPath(); c.ellipse(x,y,r*1.15,r,0,0,7); c.fill(); OWN.ol(c);
    const bl=Math.abs(Math.sin(t/170))<0.12; c.fillStyle="#ffe9a8"; c.beginPath(); c.ellipse(x+d*r*0.35,y-r*0.15,r*0.38,bl?r*0.06:r*0.38,0,0,7); c.fill(); if(!bl){ c.fillStyle="#2a0e05"; c.beginPath(); c.arc(x+d*r*0.45,y-r*0.12,r*0.18,0,7); c.fill(); c.fillStyle="#fff"; c.beginPath(); c.arc(x+d*r*0.38,y-r*0.22,r*0.07,0,7); c.fill(); }
    c.fillStyle="#3a1408"; c.beginPath(); c.ellipse(x+d*r*0.6,y+r*0.45,r*0.3,r*0.12,0,0,7); c.fill(); c.restore(); },
  rustFlecks(c,x,gy,w,sz,al,seed){ for(let i=0;i<8;i++){ c.fillStyle=i%2?`rgba(230,140,60,${al})`:`rgba(80,35,12,${al})`; c.beginPath(); c.ellipse(x+(atH(i+seed)-0.5)*w*1.6,gy+(atH(i*3+seed)-0.5)*w*0.25,sz*(0.4+0.6*atH(i*5)),sz*0.3,atH(i)*3,0,7); c.fill(); } },
  bolt(c,x,y,r,rot,al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=al; c.fillStyle="#8a7a6a"; c.strokeStyle="#4a3a2a"; c.lineWidth=1.2; c.beginPath(); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle="#3a2a1a"; c.beginPath(); c.arc(0,0,r*0.4,0,7); c.fill(); c.fillStyle="rgba(190,90,40,.8)"; c.beginPath(); c.arc(r*0.4,r*0.3,r*0.25,0,7); c.fill(); c.restore(); },
  sheen(c,x,y,w,al){ c.strokeStyle=`rgba(160,110,230,${0.5*al})`; c.lineWidth=2; c.beginPath(); c.arc(x-w*0.1,y,w*0.7,Math.PI*1.1,Math.PI*1.45); c.stroke(); c.strokeStyle=`rgba(90,210,200,${0.45*al})`; c.beginPath(); c.arc(x+w*0.1,y+w*0.1,w*0.6,Math.PI*1.55,Math.PI*1.85); c.stroke(); },
  slimeBeast(c,x,y,r,t,ang,st,open,d,col){ if(r<=1) return; c.save(); c.translate(x,y); c.rotate(ang); c.scale(1+st,1-st*0.45); if(Math.cos(ang)<0) c.scale(1,-1);
    for(let i=0;i<6;i++){ const a=Math.PI*0.6+i/5*Math.PI*0.8, L=r*(0.45+0.2*Math.sin(t/70+i*1.3)); c.strokeStyle=OWN.rgb(col,1); c.lineWidth=r*0.16; c.lineCap="round"; c.beginPath(); c.moveTo(Math.cos(a)*r*0.8,Math.sin(a)*r*0.8); c.quadraticCurveTo(Math.cos(a)*(r+L*0.6)+Math.sin(t/60+i)*r*0.15,Math.sin(a)*(r+L*0.6),Math.cos(a+0.2)*(r+L),Math.sin(a+0.2)*(r+L)); c.stroke(); }
    c.beginPath(); for(let i=0;i<=16;i++){ const a=i/16*Math.PI*2, rr=r*(1+0.08*Math.sin(t/45+i*1.9)); c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath();
    c.fillStyle=OWN.rg(c,0,0,r*0.05,r*1.05,[[0,"#4a3a5e"],[0.6,OWN.rgb(col,1)],[1,"#0c0810"]],-r*0.3,-r*0.35); c.fill(); c.strokeStyle="#07040a"; c.lineWidth=Math.max(1.2,r*0.06); c.stroke();
    c.strokeStyle="rgba(170,120,240,.55)"; c.lineWidth=r*0.08; c.beginPath(); c.arc(0,0,r*0.8,Math.PI*1.1,Math.PI*1.45); c.stroke(); c.strokeStyle="rgba(90,220,210,.45)"; c.beginPath(); c.arc(0,0,r*0.75,Math.PI*1.55,Math.PI*1.8); c.stroke();
    const E=[[0.25,-0.3,0.26],[-0.25,-0.38,0.17],[0.55,-0.02,0.13],[-0.05,-0.05,0.1]]; E.forEach(([ex,ey,er],i)=>{ const bl=Math.abs(Math.sin(t/160+i*1.7))<0.12; c.fillStyle="#fff"; c.beginPath(); c.ellipse(ex*r,ey*r,er*r,bl?er*r*0.15:er*r,0,0,7); c.fill(); if(!bl){ c.fillStyle="#d02040"; c.beginPath(); c.arc(ex*r+er*r*0.25,ey*r,er*r*0.55,0,7); c.fill(); c.fillStyle="#0a0006"; c.beginPath(); c.arc(ex*r+er*r*0.3,ey*r,er*r*0.28,0,7); c.fill(); c.fillStyle="#fff"; c.beginPath(); c.arc(ex*r+er*r*0.05,ey*r-er*r*0.3,er*r*0.15,0,7); c.fill(); } });
    const mo=r*(0.08+0.28*open); c.fillStyle="#3a0614"; c.beginPath(); c.ellipse(r*0.2,r*0.38,r*0.48,mo,0,0,7); c.fill(); c.fillStyle="#c03050"; c.beginPath(); c.ellipse(r*0.2,r*0.38+mo*0.45,r*0.25,mo*0.4,0,0,7); c.fill();
    c.fillStyle="#f4eedc"; for(let i=0;i<5;i++){ const tx=r*(-0.18+i*0.19); c.beginPath(); c.moveTo(tx-r*0.06,r*0.38-mo*0.9); c.lineTo(tx,r*0.38-mo*0.9+r*0.14); c.lineTo(tx+r*0.06,r*0.38-mo*0.9); c.fill(); c.beginPath(); c.moveTo(tx-r*0.05,r*0.38+mo*0.9); c.lineTo(tx+r*0.02,r*0.38+mo*0.9-r*0.12); c.lineTo(tx+r*0.08,r*0.38+mo*0.9); c.fill(); }
    c.strokeStyle="rgba(200,190,220,.7)"; c.lineWidth=1.2; c.beginPath(); c.moveTo(r*0.45,r*0.38+mo*0.8); c.quadraticCurveTo(r*0.5,r*0.75,r*0.42,r*0.95+Math.sin(t/50)*r*0.05); c.stroke(); c.restore(); }
});
const OWN_DROOL={
  "Drool":{mouth:true,col:[215,232,245],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300), m=x.self.mouth||a; for(let i=0;i<4;i++){ const sx=m.x+(i-1.5)*P.S*0.22, L=P.S*(0.2+1.0*eo(k))*(0.5+0.5*atH(i*3)), sw=Math.sin(t/110+i)*P.S*0.12*k, tip={x:sx+sw,y:m.y+L};
        OWN.DR.rib(c,[{x:sx,y:m.y},{x:sx+sw*0.5,y:m.y+L*0.55},tip],P.S*0.07,P.S*0.035,o.col,0.85); OWN.DR.tear(c,tip.x,tip.y+P.S*0.06,P.S*0.08*(0.6+0.4*k),Math.PI/2,o.col,0.9); } },
    fly(c,PF,k,P,x,a,h,o,t){ const D=[]; for(let i=0;i<14;i++){ const dst={x:h.x+(atH(i)-0.5)*P.R*1.2,y:h.y+(atH(i*3)-0.5)*P.R*1.1}, kk=Math.min(1,k*(0.85+0.3*atH(i*5))), p=OWN.DR.pos(a,dst,kk,P.R,0.5+atH(i*7)*0.7), q=OWN.DR.pos(a,dst,Math.max(0,kk-0.04),P.R,0.5+atH(i*7)*0.7); D.push(p);
        OWN.DR.tear(c,p.x,p.y,P.S*(0.08+0.11*atH(i*11)),Math.atan2(p.y-q.y,p.x-q.x),o.col,0.9); }
      c.strokeStyle=OWN.rgb(o.col,0.8); c.lineWidth=1.2; for(const [i,j] of [[0,3],[3,7],[5,9],[9,12]]){ const p=D[i], q=D[j], mx=(p.x+q.x)/2, my=Math.max(p.y,q.y)+P.S*0.2; c.beginPath(); c.moveTo(p.x,p.y); c.quadraticCurveTo(mx,my,q.x,q.y); c.stroke(); } },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, al=k<0.8?1:1-(k-0.8)/0.2; OWN.DR.coat(c,P,k,o.col,0.7*al,true,1.4,7);
      c.strokeStyle=OWN.rgb(o.col,0.8*al); c.lineCap="round"; for(const sd of [-1,1]){ const x0=P.tg.x+sd*R*0.75, y0=P.tg.y+R*0.1, sag=Math.min(P.gnd-y0,R*(0.4+0.9*eo(Math.min(1,k*2)))); c.lineWidth=R*0.07; c.beginPath(); c.moveTo(x0,y0); c.quadraticCurveTo(x0+sd*R*0.35,y0+sag,x0+sd*R*0.5,Math.min(P.gnd,y0+sag*1.1)); c.stroke(); OWN.DR.tear(c,x0+sd*R*0.32,y0+sag*0.8,R*0.07,Math.PI/2,o.col,al); }
      OWN.DR.pops(c,{x:P.tg.x,y:P.tg.y-R*0.35},R*1.1,k,[245,252,255],8,3); OWN.DR.pud(c,P.tg.x,P.gnd,R*(0.4+0.6*eo(k)),o.col,0.65*al);
      for(let i=0;i<4;i++){ const q=((k*1.5)+i/4)%1; PF(P.tg.x+(atH(i)-0.5)*R*1.1,P.tg.y-R*0.6-q*R*1.2,P.S*(0.15+0.25*q),0.4*(1-k)*(1-q),[175,215,150]); }
      for(let i=0;i<4;i++) OWN.star(c,P.tg.x+(atH(i*5)-0.5)*R*1.3,P.tg.y-R*0.5+atH(i*7)*R*0.9,R*0.13*al,"rgba(255,255,255,.95)",k*6+i); } },
  "Silk Spit":{at:[0.05,0.55],inside:true,
    wind(c,PF,t,P,x,a){ const k=Math.min(1,t/300); for(let i=0;i<5;i++){ const an=t/50+i*1.26; c.strokeStyle="rgba(245,245,255,.85)"; c.lineWidth=1; c.beginPath(); c.moveTo(a.x,a.y); c.quadraticCurveTo(a.x+Math.cos(an)*P.S*0.9*k,a.y+Math.sin(an)*P.S*0.9*k,a.x+Math.cos(an+1)*P.S*0.3,a.y+Math.sin(an+1)*P.S*0.3); c.stroke(); } OWN.DR.net(c,a.x,a.y,P.S*0.35*eo(k),t/60,1,0.9); },
    fly(c,PF,k,P,x,a,h,o,t){ const p=OWN.DR.pos(a,h,k,P.R,1.2); c.strokeStyle="rgba(245,245,255,.85)"; c.lineWidth=1.2; c.beginPath(); OWN.DR.seg(a,h,1.2,P.R,0,k,14).forEach(q=>c.lineTo(q.x,q.y)); c.stroke();
      const open=eo(Math.max(0,(k-0.35)/0.65)); OWN.DR.net(c,p.x,p.y,P.S*(0.35+1.4*open),t/120,0.35+0.65*open,0.95); for(let i=0;i<3;i++) OWN.star(c,p.x+(atH(i)-0.5)*P.S*2*open,p.y+(atH(i*3)-0.5)*P.S*open,P.S*0.12,"rgba(255,255,255,.9)",t/40+i); },
    land(c,PF,k,P,x,a,h,o,t){ const a2=k<0.75?1:1-(k-0.75)/0.25, Rw=P.R*(1.5-0.4*eo(Math.min(1,k*3))); OWN.DR.net(c,P.tg.x,P.tg.y,Rw,0.2,1,0.9*a2);
      c.strokeStyle=`rgba(245,245,255,${0.7*a2})`; c.lineWidth=1; for(const sd of [-1,-0.4,0.4,1]){ c.beginPath(); c.moveTo(P.tg.x+sd*Rw*0.7,P.tg.y+Rw*0.4); c.quadraticCurveTo(P.tg.x+sd*Rw*0.95,P.gnd-Rw*0.2,P.tg.x+sd*Rw*1.05,P.gnd+2); c.stroke(); }
      if(k<0.45){ const br=1-k/0.45; c.strokeStyle=`rgba(245,245,255,${0.8*br})`; c.lineWidth=1.2; c.beginPath(); c.moveTo(a.x,a.y); c.quadraticCurveTo((a.x+h.x)/2,Math.max(a.y,h.y)+P.R*1.2*k,h.x-P.d*P.R*0.8*k,h.y+P.R*0.4*k); c.stroke(); } } },
  "Ink Splat":{at:[0.6,0.85],inside:true,col:[34,28,50],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); for(let i=0;i<3;i++) PF(a.x+(i-1)*P.S*0.3,a.y+P.S*0.2,P.S*(0.3+0.5*k),0.55*k,[40,34,60]); for(let i=0;i<4;i++){ const q=((t/120)+i/4)%1; OWN.DR.tear(c,a.x+(i-1.5)*P.S*0.3,a.y+P.S*0.3+q*P.S*0.5,P.S*0.06,Math.PI/2,o.col,1-q); } },
    fly(c,PF,k,P,x,a,h,o,t){ const e=OWN.DR.pos(a,h,k,P.R,0.5), dx=e.x-a.x, dy=e.y-a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
      for(let j=0;j<10;j++){ const f=j/9, kk=Math.max(0,k-(1-f)*0.5), p=OWN.DR.pos(a,h,kk,P.R,0.5), wv=Math.sin(f*7-t/50)*P.S*0.25*f; PF(p.x+nx*wv,p.y+ny*wv,P.S*(0.3+0.9*f),0.75,j%3?[40,34,60]:[70,60,95]); }
      for(let i=0;i<12;i++){ const f=((t/80)+i/12)%1, s0=OWN.DR.pos(a,h,k*f,P.R,0.5), w=P.S*(0.2+0.8*f); OWN.DR.tear(c,s0.x+nx*(atH(i)-0.5)*w*2,s0.y+ny*(atH(i)-0.5)*w*2+f*P.S*0.3,P.S*(0.05+0.05*atH(i*3)),Math.atan2(dy,dx),o.col,0.95); } },
    land(c,PF,k,P,x,a,h,o){ const al=k<0.75?1:1-(k-0.75)/0.25;   /* the ink coats the foe and the drips run out of the coat itself (Gid, 19 Nov 2026: the drips hung loose under the cloud) */
      for(let i=0;i<6;i++) PF(h.x+(i-2.5)*P.R*0.35,h.y-P.R*0.15-k*P.R*0.2,P.S*(0.6+0.5*k),0.5*(1-k),[40,34,60]); OWN.DR.coat(c,P,k,o.col,0.92*al,true,1.5,7); OWN.splat(c,h.x,h.y-P.R*0.1,P.S*1.2,o.col,Math.min(k,0.7),40,0);
      for(let i=0;i<12;i++){ const an=i/12*7+0.4, v=P.R*(0.8+0.5*atH(i))*eo(Math.min(1,k*4)); OWN.DR.tear(c,h.x+Math.cos(an)*v,h.y+Math.sin(an)*v*0.8,P.R*0.06,an+Math.PI,o.col,1-k); } } },
  "Goo Shot":{at:[0.5,0.05],inside:true,body:true,
    wind(c,PF,t,P,x,a,o,col){ const k=Math.min(1,t/300); c.fillStyle=OWN.rgb(col); c.beginPath(); c.ellipse(a.x,a.y+P.S*0.1,P.S*0.6*eo(k),P.S*0.45*eo(k),0,Math.PI,0); c.fill(); OWN.DR.pops(c,{x:a.x,y:a.y},P.S*0.8,k,OWN.mix(col,[255,255,255],0.4),3,4); },
    fly(c,PF,k,P,x,a,h,o,t,col){ const p=OWN.DR.pos(a,h,k,P.R,1.5); OWN.DR.splatStar(c,p.x,p.y,P.S*0.75,col,t/70*P.d,0.55,t);
      for(let j=1;j<=3;j++){ const q=OWN.DR.pos(a,h,Math.max(0,k-j*0.08),P.R,1.5); OWN.DR.tear(c,q.x,q.y+j*j*P.S*0.15,P.S*0.08,Math.PI/2,col,1-j/4); } },
    land(c,PF,k,P,x,a,h,o,t,col){ const R=P.R, slide=k<0.55?eo(k/0.55)*R*0.35:R*0.35, fall=k<0.55?0:eo((k-0.55)/0.45);
      if(fall<1) OWN.DR.splatStar(c,h.x,h.y-R*0.15+slide+fall*(P.gnd-h.y),R*(0.9-0.4*fall),col,0.2,1-0.7*fall,t,1-fall*0.3);
      OWN.DR.drips(c,{x:h.x,y:h.y+slide},R,k,col,5,3); OWN.DR.pud(c,P.tg.x,P.gnd,R*0.8*fall,col,0.85); for(let i=0;i<5;i++){ const an=i/5*7, v=R*(0.9+0.4*atH(i))*eo(Math.min(1,k*5)); OWN.DR.tear(c,h.x+Math.cos(an)*v,h.y+Math.sin(an)*v*0.8,R*0.06,an+Math.PI,col,1-k); } } },
  "Dissolve":{at:[0.6,1.0],inside:true,col:[150,235,70],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); OWN.DR.pool(c,a.x,P.sg,P.S*(0.4+0.9*k),o.col,t); for(let i=0;i<3;i++) OWN.DR.curl(c,a.x+(i-1)*P.S*0.5,P.sg-P.S*0.1,P.S*1.2*k,t+i*90,[190,240,150],0.7*k); },
    fly(c,PF,k,P,x,a,h,o,t){ const fx=a.x+(P.tg.x-a.x)*eo(k), N=14, top=[], bot=[]; for(let j=0;j<=N;j++){ const f=j/N, xx=a.x+(fx-a.x)*f, gy=P.sg+(P.gnd-P.sg)*f*k+2, w=P.S*(0.18+0.08*Math.sin(f*9-t/60))*(f<0.9?1:(1-f)*10); top.push({x:xx,y:gy-w}); bot.push({x:xx,y:gy+w*0.5}); }
      c.fillStyle=OWN.rgb(OWN.mix(o.col,[40,60,10],0.35),0.9); c.beginPath(); top.forEach(p=>c.lineTo(p.x,p.y+2)); for(let j=N;j>=0;j--) c.lineTo(bot[j].x,bot[j].y+2); c.fill();
      c.fillStyle=OWN.rgb(o.col,0.95); c.beginPath(); top.forEach(p=>c.lineTo(p.x,p.y)); for(let j=N;j>=0;j--) c.lineTo(bot[j].x,bot[j].y); c.fill();
      c.strokeStyle="rgba(240,255,200,.8)"; c.lineWidth=1.2; c.beginPath(); top.forEach((p,j)=>j<N-1&&c.lineTo(p.x,p.y+P.S*0.06)); c.stroke();
      OWN.DR.pops(c,{x:(a.x+fx)/2,y:(P.sg+P.gnd)/2-P.S*0.1},P.S*1.6,k,OWN.mix(o.col,[255,255,255],0.3),5,9); for(let i=0;i<3;i++) OWN.DR.curl(c,a.x+(fx-a.x)*(i+0.5)/3,P.sg+(P.gnd-P.sg)*k*(i+0.5)/3-P.S*0.1,P.S*1.0,t+i*70,[190,240,150],0.6); },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, al=k<0.8?1:1-(k-0.8)/0.2; OWN.DR.pool(c,P.tg.x,P.gnd,R*(0.8+0.4*eo(Math.min(1,k*3))),o.col,t,al); atGlowA(c,P.tg.x,P.gnd-R*0.3,R*1.2,[170,255,90],0.35*al);
      for(let i=0;i<6;i++) OWN.DR.curl(c,P.tg.x+(i-2.5)*R*0.32,P.gnd-R*0.1,R*(1.2+0.6*atH(i)),t+i*55,[195,245,150],0.8*al);
      for(let i=0;i<6;i++){ const q=((k*1.6)+i/6)%1; PF(P.tg.x+(atH(i)-0.5)*R*1.3,P.gnd-R*0.4-q*R*1.4,P.S*(0.25+0.35*q),0.45*(1-k)*(1-q),[205,240,175]); }
      OWN.DR.pops(c,{x:P.tg.x,y:P.gnd-R*0.35},R*1.1,k,o.col,7,11); for(let i=0;i<5;i++){ const s=atH(i*9); c.fillStyle=`rgba(60,80,20,${0.7*al*Math.min(1,k*3)})`; c.beginPath(); c.ellipse(P.tg.x+(s-0.5)*R*1.2,P.tg.y+R*(0.35+0.3*atH(i*4)),R*0.08,R*0.05,0,0,7); c.fill(); }
      for(let i=0;i<5;i++){ const q=((k*4)+i/5)%1; c.strokeStyle=`rgba(230,255,150,${(1-q)*al})`; c.lineWidth=1.2; const sx=P.tg.x+(atH(i*13+Math.floor(k*6))-0.5)*R*1.2, sy=P.gnd-R*0.15; c.beginPath(); c.moveTo(sx,sy); c.lineTo(sx+(atH(i)-0.5)*R*0.3,sy-q*R*0.3); c.stroke(); } } },
  "Gunk Cannon":{at:[0.6,0.08],inside:true,col:[96,110,60],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300), L=P.S*1.2*eo(k), an=-Math.PI/2+P.d*0.7, bc=OWN.mix(x.body||[120,200,120],[0,0,0],0.25); c.save(); c.translate(a.x,a.y); c.rotate(an); c.fillStyle=OWN.rgb(bc); c.strokeStyle=OWN.rgb(OWN.mix(bc,[0,0,0],0.4)); c.lineWidth=2;
      c.beginPath(); c.roundRect(0,-P.S*0.32,L,P.S*0.64,P.S*0.16); c.fill(); OWN.ol(c); c.fillStyle=OWN.rgb(OWN.mix(bc,[0,0,0],0.4)); c.beginPath(); c.roundRect(L-P.S*0.15,-P.S*0.4,P.S*0.22,P.S*0.8,P.S*0.08); c.fill(); c.fillStyle=OWN.rgb(o.col); c.beginPath(); c.ellipse(L,0,P.S*0.12,P.S*0.3,0,0,7); c.fill(); c.restore(); },
    fly(c,PF,k,P,x,a,h,o,t){ const mz={x:a.x+P.d*P.S*1.0,y:a.y-P.S*0.95}; for(let i=0;i<3;i++){ const kk=k*1.6-i*0.3; if(kk<0) continue;
        if(kk<0.4){ PF(mz.x+P.d*P.S*0.3*kk,mz.y-P.S*0.3*kk,P.S*(0.4+kk),0.6*(1-kk/0.4),[200,200,190]); c.strokeStyle=`rgba(230,230,210,${1-kk/0.4})`; c.lineWidth=2; c.beginPath(); c.ellipse(mz.x,mz.y,P.S*(0.3+kk*1.2),P.S*(0.15+kk*0.6),P.d*0.7,0,7); c.stroke(); }
        if(kk>1) continue; const p=OWN.DR.pos(mz,{x:h.x+(i-1)*P.R*0.3,y:h.y+(i%2)*P.R*0.2},kk,P.R,1.2); OWN.DR.splatStar(c,p.x,p.y,P.S*0.5,o.col,kk*8+i,0.8,t); for(let j=1;j<=2;j++){ const q=OWN.DR.pos(mz,{x:h.x,y:h.y},Math.max(0,kk-j*0.07),P.R,1.2); OWN.DR.tear(c,q.x,q.y+j*P.S*0.25,P.S*0.07,Math.PI/2,o.col,1-j/3); } } },
    land(c,PF,k,P,x,a,h,o,t){ for(let i=0;i<3;i++){ const kk=Math.min(1,k+(2-i)*0.12), al=kk<0.75?1:1-(kk-0.75)/0.25; OWN.DR.splatStar(c,h.x+(i-1)*P.R*0.3,h.y+(i%2)*P.R*0.2+kk*P.R*0.2,P.R*0.55,o.col,i,1,t,al); } OWN.DR.strings(c,{x:h.x,y:h.y+P.R*0.2},P.R,k,o.col,P.gnd); OWN.DR.drips(c,{x:h.x,y:h.y+P.R*0.25},P.R,k,o.col,4,5); } },
  "Bitter Sap":{at:[0.9,0.25],col:[200,180,50],
    wind(c,PF,t,P,x,a,o){ for(let i=0;i<6;i++){ const k=Math.min(1,Math.max(0,(t-i*30)/220)), an=-0.9+i*0.36, p={x:a.x+Math.cos(an)*P.S*0.4*P.d,y:a.y+Math.sin(an)*P.S*0.4}; OWN.DR.spine(c,p.x,p.y,P.S*0.55*(0.3+0.7*k),P.d>0?an:Math.PI-an,o.col,k);
        if(k>0.7&&i%2) OWN.star(c,p.x,p.y,P.S*0.18,"rgba(255,255,230,.95)",t/40+i); } },
    fly(c,PF,k,P,x,a,h,o){ for(let i=0;i<6;i++){ const dst={x:h.x-P.d*P.R*0.25,y:h.y+(i-2.5)*P.R*0.25}, kk=Math.min(1,k*1.15-i*0.03); if(kk<0) continue; const p=OWN.DR.pos(a,dst,kk,P.R,0.2), q=OWN.DR.pos(a,dst,Math.max(0,kk-0.06),P.R,0.2), an=Math.atan2(p.y-q.y,p.x-q.x);
        c.strokeStyle="rgba(255,255,240,.6)"; c.lineWidth=1.5; c.beginPath(); c.moveTo(p.x-Math.cos(an)*P.S*1.6,p.y-Math.sin(an)*P.S*1.6); c.lineTo(p.x-Math.cos(an)*P.S*0.4,p.y-Math.sin(an)*P.S*0.4); c.stroke(); OWN.DR.spine(c,p.x,p.y,P.S*1.15,an,o.col,1); } },
    land(c,PF,k,P,x,a,h,o){ const out=k>0.7?(k-0.7)/0.3:0, R=P.R; for(let i=0;i<6;i++){ const p={x:h.x-P.d*R*0.25,y:h.y+(i-2.5)*R*0.25}, an=(P.d>0?0:Math.PI)+(atH(i)-0.5)*0.4, wob=k<0.15?Math.sin(k*120+i)*0.15*(1-k/0.15):0;
        OWN.DR.spine(c,p.x-Math.cos(an)*out*R*0.5,p.y+out*out*R*1.6,P.S*1.15,an+wob+out*P.d*2,o.col,1-out*0.5); const L=R*(0.15+0.45*eo(Math.min(1,k*1.4)))*(0.6+0.4*atH(i*3)); OWN.DR.rib(c,[{x:p.x,y:p.y},{x:p.x+1,y:p.y+L}],R*0.09,R*0.06,o.col,0.95-out*0.6); OWN.DR.tear(c,p.x+1,p.y+L+2,R*0.05,Math.PI/2,o.col,1-out); }
      if(k<0.3) for(let i=0;i<4;i++){ const an=i/4*7+0.5; c.strokeStyle=`rgba(255,240,150,${1-k/0.3})`; c.lineWidth=2; c.beginPath(); c.moveTo(h.x+Math.cos(an)*R*0.7,h.y+Math.sin(an)*R*0.7); c.lineTo(h.x+Math.cos(an)*R*(0.9+k),h.y+Math.sin(an)*R*(0.9+k)); c.stroke(); } } },
  "Mud Spit":{mouth:true,col:[120,88,58],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); for(let i=0;i<4;i++){ const q=((t/140)+i/4)%1; OWN.DR.tear(c,a.x+P.d*P.S*0.2*q,a.y+q*P.S*0.9,P.S*0.07,Math.PI/2,o.col,1-q); } OWN.DR.clod(c,a.x,a.y,P.S*0.32*eo(k),o.col,t/90,3); },
    fly(c,PF,k,P,x,a,h,o,t){ for(let i=0;i<8;i++){ const dst={x:h.x+(atH(i)-0.5)*P.R*1.3,y:h.y+(atH(i*3)-0.5)*P.R*1.1}, kk=Math.min(1,k*(1+i*0.06)), arc=0.8+atH(i*5)*0.8, p=OWN.DR.pos(a,dst,kk,P.R,arc), q=OWN.DR.pos(a,dst,Math.max(0,kk-0.05),P.R,arc);
        if(i%3===2) OWN.DR.tear(c,p.x,p.y,P.S*0.14,Math.atan2(p.y-q.y,p.x-q.x),[95,70,45]); else OWN.DR.clod(c,p.x,p.y,P.S*(i%3?0.22:0.36),i%3?[100,72,48]:o.col,t/40*(i%2?1:-1)+i,i*7);
        if(i%3===0){ PF(q.x,q.y,P.S*0.3,0.3,[170,140,100]); OWN.DR.tear(c,q.x-P.d*P.S*0.3,q.y+P.S*0.2,P.S*0.06,Math.PI/2,o.col,0.8); } } },
    land(c,PF,k,P,x,a,h,o,t){ for(let i=0;i<4;i++){ const pos={x:h.x+(atH(i*11)-0.5)*P.R*1.0,y:h.y+(atH(i*13)-0.5)*P.R*0.8}; OWN.DR.splatStar(c,pos.x,pos.y+k*P.R*0.15,P.R*0.32,o.col,i,1,t,k<0.7?1:1-(k-0.7)/0.3); }
      OWN.DR.drips(c,{x:h.x,y:h.y+P.R*0.2},P.R,k,o.col,4,14); OWN.MT.debris(c,h,P.R*0.8,k,[110,80,50],9,0.12,21); OWN.MT.puff(c,PF,{x:P.tg.x,y:P.gnd-P.S*0.3},P.S*0.8,k,[160,130,95]); OWN.DR.pud(c,P.tg.x,P.gnd,P.R*0.6*eo(k),[110,80,52],0.8*(1-k*0.5)); } },
  "Wax Drip":{at:[0.5,0.12],inside:true,col:[252,238,205],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); atGlowA(c,a.x,a.y-P.S*0.6,P.S*(1.2+1.2*k),[255,200,100],0.55); OWN.fire(c,a.x,a.y-P.S*0.2,P.S*(0.8+0.6*k),"rgba(255,150,50,.9)","rgba(255,235,150,.95)",t,1);
      OWN.DR.candle(c,a.x,a.y,P.S*0.9,P.S*(0.3+1.0*eo(k)),o.col,1,true,4); },
    fly(c,PF,k,P,x,a,h,o,t){ const hh={x:P.tg.x,y:P.head.y-P.S*0.2}, k0=Math.max(0,k-0.55), pts=OWN.DR.wob(OWN.DR.seg(a,hh,2.2,P.R,k0,k,18),P.S*0.06,t,3);
      for(let j=0;j<pts.length;j+=4) atGlowA(c,pts[j].x,pts[j].y,P.S*0.8,[255,215,140],0.25); OWN.DR.rib(c,pts,P.S*0.32,P.S*0.5,o.col); OWN.DR.rib(c,pts,P.S*0.1,P.S*0.16,[255,250,235],0.9,false);
      const e=pts[pts.length-1]; OWN.DR.tear(c,e.x,e.y,P.S*0.3,Math.PI/2,o.col); for(let i=0;i<3;i++){ const q=pts[Math.floor(atH(i+Math.floor(t/70))*18)]; OWN.DR.tear(c,q.x,q.y+P.S*0.4,P.S*0.08,Math.PI/2,o.col,0.9); } },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, hard=Math.min(1,Math.max(0,(k-0.3)/0.3)), col=OWN.mix(o.col,[230,220,200],hard), crack=k>0.7?(k-0.7)/0.3:0, hd={x:P.tg.x,y:P.head.y+R*0.05};
      if(hard<1) atGlowA(c,hd.x,hd.y+R*0.3,R*1.1,[255,220,150],0.35*(1-hard));
      c.save(); if(crack>0){ c.globalAlpha=1-crack; } OWN.DR.candle(c,hd.x,hd.y,R*1.05,R*(0.35+1.05*eo(Math.min(1,k*2.5))),col,1,hard<0.5,6); c.restore();
      if(hard>0.3){ c.strokeStyle=`rgba(140,120,90,${0.8*hard*(1-crack)})`; c.lineWidth=1.2; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(hd.x+(atH(i)-0.5)*R*1.3,hd.y-R*0.1); c.lineTo(hd.x+(atH(i*3)-0.5)*R*1.3,hd.y+R*0.2); c.lineTo(hd.x+(atH(i*5)-0.5)*R*1.3,hd.y+R*0.35); c.stroke(); } }
      if(crack>0) for(let i=0;i<8;i++){ c.save(); c.translate(hd.x+(atH(i)-0.5)*R*1.6+(atH(i*2)-0.5)*R*crack,hd.y+R*0.3*atH(i*3)+crack*crack*R*2.4); c.rotate(crack*6+i); c.fillStyle=OWN.rgb(col,1-crack*0.5); c.strokeStyle="rgba(150,130,100,.8)"; c.lineWidth=1; c.beginPath(); c.moveTo(-R*0.12,-R*0.06); c.lineTo(R*0.1,-R*0.08); c.lineTo(R*0.13,R*0.07); c.lineTo(-R*0.08,R*0.08); c.closePath(); c.fill(); OWN.ol(c); c.restore(); } } },
  "Splotch":{at:[0.5,0.02],inside:true,col:[30,26,60],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); OWN.DR.tear(c,a.x,a.y-P.S*0.3*k,P.S*0.18*eo(k),-Math.PI/2+Math.sin(t/60)*0.3,o.col); },
    fly(c,PF,k,P,x,a,h,o,t){ const p=OWN.DR.pos(a,h,k,P.R,1.6), q=OWN.DR.pos(a,h,Math.max(0,k-0.05),P.R,1.6); OWN.DR.brush(c,p,Math.atan2(p.y-q.y,p.x-q.x)+Math.sin(t/80)*0.3,P.S*1.1,o.col,t); },
    land(c,PF,k,P,x,a,h,o){ const g=eo(Math.min(1,k*5)), al=k<0.7?1:1-(k-0.7)/0.3; c.fillStyle=OWN.rgb(o.col,0.92*al); for(const sd of [-1,1]) for(let i=0;i<7;i++){ c.beginPath(); c.ellipse(h.x+sd*P.R*(0.1+0.55*atH(i))*g,h.y+(atH(i*3)-0.5)*P.R*1.0*g,P.R*(0.1+0.16*atH(i*5))*g,P.R*(0.08+0.12*atH(i*7))*g,sd*atH(i)*2,0,7); c.fill(); }
      for(let i=0;i<12;i++){ const an=i/12*7, v=P.R*(0.95+0.5*atH(i*2))*g; c.beginPath(); c.arc(h.x+Math.cos(an)*v,h.y+Math.sin(an)*v*0.8,1.5+atH(i)*2.5,0,7); c.fill(); } OWN.DR.drips(c,{x:h.x,y:h.y+P.R*0.3},P.R,k,o.col,4,4); } },
  "Water Splat":{at:[0.55,0.85],inside:true,col:[110,185,250],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); for(let i=0;i<5;i++){ const q=((t/110)+i/5)%1; OWN.DR.tear(c,a.x+(i-2)*P.S*0.3,a.y+q*P.S*0.6,P.S*0.08,Math.PI/2,o.col,0.9*(1-q)); } OWN.DR.wblob(c,a.x,a.y+P.S*0.5,P.S*0.55*eo(k),o.col,t,0.75); },
    fly(c,PF,k,P,x,a,h,o,t){ const p=OWN.DR.pos(a,h,k,P.R,1.2); OWN.DR.wblob(c,p.x,p.y,P.S*0.75,o.col,t,0.75,t/150);
      for(let j=1;j<=4;j++){ const q=OWN.DR.pos(a,h,Math.max(0,k-j*0.06),P.R,1.2); OWN.DR.tear(c,q.x+(atH(j)-0.5)*P.S*0.5,q.y+j*j*P.S*0.08,P.S*(0.12-j*0.015),Math.PI/2,o.col,0.85); } },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R; if(k<0.3){ const q=k/0.3; OWN.DR.wblob(c,h.x,h.y,R*(0.6+0.7*eo(q)),o.col,t,0.7*(1-q),0,5); }
      OWN.DR.coat(c,P,k,o.col,0.55*(k<0.8?1:1-(k-0.8)/0.2),true,2.2,6);
      for(let i=0;i<12;i++){ const an=-Math.PI+i/11*Math.PI, v=R*(0.7+0.9*atH(i)), p={x:h.x+Math.cos(an)*v*eo(k),y:h.y+Math.sin(an)*v*eo(k)*1.3+k*k*R*2.2}; OWN.DR.wblob(c,p.x,p.y,R*0.09*(1-k*0.5),o.col,t,0.85*(1-k),0,i); }
      OWN.DR.pud(c,P.tg.x,P.gnd,R*(0.5+0.8*eo(k)),o.col,0.55*(1-k*0.5)); for(let j=0;j<2;j++){ const q=Math.max(0,k-j*0.2); c.strokeStyle=`rgba(255,255,255,${0.75*(1-q)})`; c.lineWidth=1.5; c.beginPath(); c.ellipse(P.tg.x,P.gnd+2,R*(0.6+1.1*q),R*(0.13+0.13*q),0,0,7); c.stroke(); } } },
  "Syrup Dab":{at:[0.6,0.08],inside:true,col:[230,150,30],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); OWN.DR.rib(c,[a,{x:a.x+P.d*P.S*0.1,y:a.y+P.S*0.5*k},{x:a.x+P.d*P.S*0.15,y:a.y+P.S*1.0*k}],P.S*0.3,P.S*0.16,o.col,0.95); OWN.DR.tear(c,a.x+P.d*P.S*0.15,a.y+P.S*1.0*k+3,P.S*0.18*k+1,Math.PI/2,o.col,0.95); if(k>0.5) OWN.star(c,a.x-P.S*0.1,a.y+P.S*0.3,P.S*0.2,"rgba(255,250,220,.95)",t/40); },
    fly(c,PF,k,P,x,a,h,o,t){ const hd={x:P.tg.x,y:P.head.y-P.R*0.5}, pts=OWN.DR.wob(OWN.DR.seg(a,hd,1.8,P.R,Math.max(0,k-0.65),k,18),P.S*0.05,t,2); OWN.DR.rib(c,pts,P.S*0.22,P.S*0.42,o.col,0.95); OWN.DR.rib(c,pts,P.S*0.05,P.S*0.1,[255,245,200],0.9,false);
      for(let i=0;i<2;i++){ const q=pts[Math.floor(((t/200)+i/2)%1*18)]; OWN.star(c,q.x,q.y-P.S*0.1,P.S*0.2,"rgba(255,252,230,.95)",t/40+i); } },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, hd={x:P.tg.x,y:P.head.y}, al=k<0.82?1:1-(k-0.82)/0.18; OWN.DR.coat(c,P,k,o.col,0.92*al,true,0.9,6);
      if(k<0.35){ const pts=OWN.DR.seg(a,{x:hd.x,y:hd.y-R*0.5},1.8,R,0.65+k,1,10); OWN.DR.rib(c,pts,R*0.16,R*0.26,o.col,0.95); }
      const n=Math.min(5,Math.floor(k*12)+1); for(let i=0;i<n;i++){ const y=hd.y-R*0.15-i*R*0.12, w=R*(0.6-i*0.08); OWN.DR.rib(c,[{x:hd.x-w,y:y},{x:hd.x,y:y-R*0.07},{x:hd.x+w,y:y}],R*0.22,R*0.22,o.col,0.95*al); OWN.DR.rib(c,[{x:hd.x-w*0.7,y:y-R*0.05},{x:hd.x+w*0.5,y:y-R*0.08}],R*0.04,R*0.04,[255,245,200],0.8*al,false); }
      OWN.DR.strings(c,{x:P.tg.x,y:P.tg.y+R*0.3},R,k,o.col,P.gnd); for(let i=0;i<3;i++) OWN.star(c,hd.x+(i-1)*R*0.5,hd.y+R*(0.1+0.3*i),R*0.16*al,"rgba(255,250,220,.95)",k*5+i); } },
  "Hot Syrup":{at:[0.6,0.08],inside:true,col:[165,80,25],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); for(let i=0;i<3;i++){ const q=((t/200)+i/3)%1; PF(a.x+(i-1)*P.S*0.3,a.y-q*P.S*1.2,P.S*(0.25+0.35*q),0.55*(1-q),[245,245,245]); } atGlowA(c,a.x,a.y,P.S*1.4,[255,150,60],0.5*k); OWN.DR.pops(c,a,P.S*0.8,k,[200,110,40],3,5); },
    fly(c,PF,k,P,x,a,h,o,t){ const pts=OWN.DR.wob(OWN.DR.seg(a,h,1.4,P.R,Math.max(0,k-0.55),k,18),P.S*0.1,t,3); for(let j=0;j<pts.length;j+=5) atGlowA(c,pts[j].x,pts[j].y,P.S*0.8,[255,150,60],0.3); OWN.DR.rib(c,pts,P.S*0.22,P.S*0.45,o.col); OWN.DR.rib(c,pts,P.S*0.05,P.S*0.1,[255,200,140],0.8,false);
      for(let i=0;i<4;i++){ const q=pts[Math.floor(i*4.5)]; PF(q.x,q.y-P.S*0.5,P.S*0.35,0.4,[245,245,245]); } },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, al=k<0.82?1:1-(k-0.82)/0.18; OWN.DR.coat(c,P,k,o.col,0.95*al,true,1.2,6); if(k<0.5) atGlowA(c,P.tg.x,P.tg.y-R*0.3,R*1.2,[255,140,50],0.4*(1-k/0.5));
      OWN.DR.pops(c,{x:P.tg.x,y:P.tg.y-R*0.3},R*1.3,k,[205,115,45],8,13); for(let i=0;i<6;i++){ const q=((k*1.5)+i/6)%1; PF(P.tg.x+(atH(i)-0.5)*R*1.3,P.tg.y-R*0.6-q*R*1.5,P.S*(0.35+0.45*q),0.6*(1-k)*(1-q),[245,245,245]); } } },
  "Slime Ball":{at:[0.95,1.0],inside:true,col:[110,225,190],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); OWN.DR.pud(c,a.x,P.sg,P.S*(0.4+0.8*k),o.col,0.85); OWN.DR.rise(c,a.x,P.sg+2,P.S*0.5*k,P.S*0.6*eo(k),o.col,0.85,t); for(let i=0;i<3;i++) OWN.star(c,a.x+(i-1)*P.S*0.5,P.sg-P.S*0.3*k,P.S*0.16*k,"rgba(255,255,255,.95)",t/40+i); },
    fly(c,PF,k,P,x,a,h,o,t){ const fx=a.x+(P.tg.x-a.x)*k, gy=xx=>P.sg+(P.gnd-P.sg)*((xx-a.x)/(P.tg.x-a.x||1)), pts=[]; for(let j=0;j<=14;j++){ const xx=a.x+(fx-a.x)*j/14; pts.push({x:xx,y:gy(xx)}); }
      OWN.DR.rib(c,pts,P.S*0.18,P.S*0.32,o.col,0.9); OWN.DR.rise(c,fx,gy(fx)+2,P.S*0.7,P.S*(0.7+0.15*Math.sin(t/50)),o.col,0.9,t);
      for(let i=0;i<5;i++){ const q=pts[Math.floor(atH(i+Math.floor(t/80))*14)]; OWN.star(c,q.x,q.y-P.S*0.15,P.S*0.16,"rgba(255,255,255,.95)",t/40+i); } },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, al=k<0.8?1:1-(k-0.8)/0.2, up=eo(Math.min(1,k*1.8)); OWN.DR.rib(c,[{x:a.x,y:P.sg},{x:P.tg.x,y:P.gnd}],P.S*0.18,P.S*0.3,o.col,0.75*al);
      OWN.DR.rise(c,P.tg.x,P.gnd+2,R*1.05,R*1.5*up,o.col,0.72*al,t); OWN.DR.pops(c,{x:P.tg.x,y:P.gnd-R*0.8*up},R*1.2,k,[220,255,240],6,7);
      for(let i=0;i<5;i++) OWN.star(c,P.tg.x+(atH(i)-0.5)*R*1.6,P.gnd-R*(0.2+1.2*atH(i*3))*up,R*0.14,`rgba(255,255,255,${0.95*al})`,k*6+i); } },
  "Acid Drip":{at:[0.95,0.3],col:[160,240,60],
    wind(c,PF,t,P,x,a,o){ for(let i=0;i<3;i++){ const q=((t/140)+i/3)%1; OWN.DR.tear(c,a.x,a.y+q*P.S*0.8,P.S*0.08,Math.PI/2,o.col,1-q); } },
    fly(c,PF,k,P,x,a,h,o,t){ for(let i=0;i<3;i++){ const kk=k*1.3-i*0.15; if(kk<0||kk>1) continue; const dst={x:h.x+(i-1)*P.R*0.4,y:h.y+(i%2)*P.R*0.2}, p=OWN.DR.pos(a,dst,kk,P.R,1.3), q=OWN.DR.pos(a,dst,Math.max(0,kk-0.04),P.R,1.3);
        OWN.DR.tear(c,p.x,p.y,P.S*0.22,Math.atan2(p.y-q.y,p.x-q.x),o.col); PF(q.x,q.y-P.S*0.2,P.S*0.2,0.35,[210,240,180]); } },
    land(c,PF,k,P,x,a,h,o){ for(let i=0;i<3;i++){ const p={x:h.x+(i-1)*P.R*0.4,y:h.y+(i%2)*P.R*0.2}, g=eo(Math.min(1,k*3)), al=k<0.7?1:1-(k-0.7)/0.3;
        c.fillStyle=`rgba(60,70,30,${0.85*al})`; c.beginPath(); c.ellipse(p.x,p.y,P.R*0.14*g,P.R*0.1*g,0,0,7); c.fill(); c.strokeStyle=OWN.rgb(o.col,al); c.lineWidth=2; c.beginPath(); c.ellipse(p.x,p.y,P.R*0.17*g,P.R*0.13*g,0,0,7); c.stroke();
        for(let j=0;j<2;j++){ const q=((k*2.5)+j/2+i/3)%1; PF(p.x,p.y-q*P.R*1.2,P.S*(0.15+0.25*q),0.55*(1-k)*(1-q),[210,240,180]); } } OWN.DR.pops(c,h,P.R,k,o.col,5,15); } },
  "Chip Paint":{at:[0.95,0.6],col:[220,50,60],
    wind(c,PF,t,P,x,a,o){ for(let i=0;i<5;i++){ const q=Math.min(1,Math.max(0,(t-i*40)/260)); if(q<=0||q>=1) continue; c.save(); c.translate(P.s.x+(atH(i)-0.5)*P.S*1.2,P.s.y+q*P.S*1.4); c.rotate(q*5+i); c.fillStyle=i%2?"#f6e2b0":"#d83a3a"; c.fillRect(-3,-2,6,4); c.restore(); } },
    fly(c,PF,k,P,x,a,h,o,t){ const p=OWN.DR.pos(a,h,k,P.R,1.2), q=OWN.DR.pos(a,h,Math.max(0,k-0.05),P.R,1.2), an=Math.atan2(p.y-q.y,p.x-q.x); OWN.DR.sheet(c,p,an,P.S*1.1,P.S*1.0,o.col,t,0.95);
      c.save(); c.translate(p.x,p.y); c.rotate(an); c.strokeStyle="#f6e2b0"; c.lineWidth=P.S*0.12; c.beginPath(); c.moveTo(-P.S*0.45,-P.S*0.55); c.quadraticCurveTo(P.S*0.35,-P.S*0.1,-P.S*0.45,P.S*0.55); c.stroke(); c.strokeStyle="#f2c23a"; c.lineWidth=P.S*0.06; c.beginPath(); c.moveTo(-P.S*0.5,-P.S*0.3); c.quadraticCurveTo(P.S*0.1,0,-P.S*0.5,P.S*0.3); c.stroke(); c.restore(); },
    land(c,PF,k,P,x,a,h,o){ const R=P.R, g=eo(Math.min(1,k*4)), al=k<0.75?1:1-(k-0.75)/0.25; c.lineCap="round";
      for(const [w,cl,dy] of [[R*0.3,[220,50,60],-0.2],[R*0.16,[246,226,176],0.12],[R*0.1,[242,194,58],0.32]]){ c.strokeStyle=OWN.rgb(cl,al); c.lineWidth=w; c.beginPath(); c.moveTo(P.tg.x-R*0.8*g,P.tg.y+R*dy); c.quadraticCurveTo(P.tg.x,P.tg.y+R*(dy-0.15),P.tg.x+R*0.8*g,P.tg.y+R*dy); c.stroke(); }
      for(let i=0;i<5;i++){ const an=i/5*Math.PI*2+0.3; c.fillStyle=OWN.rgb([246,226,176],al); c.beginPath(); c.ellipse(P.tg.x+R*0.2+Math.cos(an)*R*0.13*g,P.tg.y-R*0.45+Math.sin(an)*R*0.13*g,R*0.09*g,R*0.05*g,an,0,7); c.fill(); } c.fillStyle=OWN.rgb([242,194,58],al); c.beginPath(); c.arc(P.tg.x+R*0.2,P.tg.y-R*0.45,R*0.06*g,0,7); c.fill();
      OWN.DR.drips(c,{x:P.tg.x,y:P.tg.y},R,k,o.col,4,9); for(let i=0;i<8;i++){ const q=Math.max(0,k-0.4-i*0.04); if(q<=0) continue; c.save(); c.translate(P.tg.x+(atH(i)-0.5)*R*1.4,P.tg.y+(atH(i*2)-0.5)*R*0.6+q*q*R*3); c.rotate(q*8+i); c.fillStyle=OWN.rgb(i%2?[246,226,176]:[220,50,60],1-q); c.fillRect(-R*0.07,-R*0.04,R*0.14,R*0.08); c.restore(); } } },
  "Melt Drip":{at:[0.6,0.15],inside:true,colOf:x=>OWN.mix(x.body||[255,200,220],[255,200,220],0.8),
    wind(c,PF,t,P,x,a,o,col){ const k=Math.min(1,t/300); for(let i=0;i<3;i++){ const L=P.S*(0.15+0.5*k)*(0.6+0.4*atH(i)), xx=a.x+(i-1)*P.S*0.4; OWN.DR.rib(c,[{x:xx,y:a.y+P.S*0.3},{x:xx,y:a.y+P.S*0.3+L}],P.S*0.14,P.S*0.12,col); } },
    fly(c,PF,k,P,x,a,h,o,t,col){ const hd={x:P.tg.x,y:P.head.y-P.S*0.3}, p=OWN.DR.pos(a,hd,k,P.R,1.8); OWN.DR.scoop(c,p.x,p.y,Math.max(P.S*0.9,P.R*0.5),col,P.d*k*6.3,t); },
    land(c,PF,k,P,x,a,h,o,t,col){ const R=P.R, hd={x:P.tg.x,y:P.head.y-P.S*0.3}, m=Math.min(1,k*1.4), al=k<0.8?1:1-(k-0.8)/0.2; c.save(); c.globalAlpha=al; OWN.DR.scoop(c,hd.x,hd.y+m*R*0.25,Math.max(P.S*0.9,R*0.5)*(1-m*0.4),col,0,t,m); c.restore();
      for(let i=0;i<5;i++){ const xx=hd.x+(i-2)*R*0.28, L=R*(0.3+0.9*atH(i+3))*eo(m); OWN.DR.rib(c,[{x:xx,y:hd.y+R*0.2},{x:xx,y:hd.y+R*0.2+L}],R*0.14,R*0.1,col,al); c.fillStyle=OWN.rgb(col,al); c.beginPath(); c.arc(xx,hd.y+R*0.2+L,R*0.08,0,7); c.fill(); }
      const cl=["#ff5a8a","#5ac8ff","#ffe14a","#7ae07a"]; for(let i=0;i<8;i++){ const q=Math.max(0,k-0.2-i*0.05); if(q<=0||q>=1) continue; c.save(); c.translate(hd.x+(atH(i)-0.5)*R*1.3,hd.y+q*q*R*3); c.rotate(q*9+i); c.fillStyle=cl[i%4]; c.fillRect(-R*0.06,-R*0.02,R*0.12,R*0.04); c.restore(); } } },
  "Sour Squirt":{at:[0.9,0.4],col:[250,215,40],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); for(let i=0;i<6;i++){ const q=((t/100)+i/6)%1; OWN.DR.tear(c,a.x+P.d*q*P.S*0.8,a.y-Math.sin(q*3)*P.S*0.4,P.S*0.08*(0.5+k),P.d>0?0:Math.PI,o.col,1-q); } },
    fly(c,PF,k,P,x,a,h,o,t){ const r=P.S*0.75, k0=Math.max(0,k-0.5), pts=OWN.DR.wob(OWN.DR.seg(a,h,1.0,P.R,k0,k,18),P.S*0.08,t,4); OWN.DR.rib(c,pts,r*0.4,r*0.85,o.col,0.95); OWN.DR.rib(c,pts,r*0.08,r*0.2,[255,252,210],0.9,false);
      for(let j=0;j<12;j++){ const q=pts[Math.floor(atH(j*3+Math.floor(t/50))*18)], f=((t/90)+j/12)%1; OWN.DR.tear(c,q.x+(atH(j)-0.5)*r*1.6*f,q.y+f*f*r*1.8,r*0.12,Math.PI/2,o.col,1-f); }
      for(let j=0;j<4;j++){ const q=pts[3+j*4]; c.fillStyle="rgba(255,240,150,.95)"; c.strokeStyle="rgba(200,160,30,.9)"; c.lineWidth=1; c.save(); c.translate(q.x,q.y); c.rotate(t/50+j); c.beginPath(); c.ellipse(0,0,r*0.2,r*0.08,0,0,7); c.fill(); OWN.ol(c); c.restore(); }
      const e=pts[18]; for(let i=0;i<3;i++) OWN.star(c,e.x+(atH(i)-0.5)*r,e.y+(atH(i*3)-0.5)*r,r*0.25,"rgba(255,255,220,.95)",t/30+i); },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R; OWN.DR.coat(c,P,k,o.col,0.7*(k<0.8?1:1-(k-0.8)/0.2),true,2,6);
      for(let i=0;i<14;i++){ const an=-Math.PI+i/13*Math.PI, v=R*(0.6+1.0*atH(i)); OWN.DR.tear(c,h.x+Math.cos(an)*v*eo(k),h.y+Math.sin(an)*v*eo(k)+k*k*R*1.8,R*0.08,an+Math.PI,i%3?o.col:[255,250,190],1-k); }
      if(k<0.85){ const al=1-k/0.85; c.strokeStyle=`rgba(60,40,20,${0.95*al})`; c.lineWidth=2.5; const ey=P.tg.y-R*0.25; for(const sd of [-1,1]){ const ex=P.tg.x+sd*R*0.32; c.beginPath(); c.moveTo(ex-sd*R*0.12,ey-R*0.08); c.lineTo(ex+sd*R*0.06,ey); c.lineTo(ex-sd*R*0.12,ey+R*0.08); c.stroke(); }
        for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(P.tg.x+R*(0.5+i*0.12),P.tg.y-R*(0.9+i*0.1)); c.lineTo(P.tg.x+R*(0.6+i*0.14),P.tg.y-R*(1.1+i*0.12)); c.stroke(); } } } },
  "Big Blob":{at:[0.5,0.05],inside:true,col:[255,110,40],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); atGlowA(c,a.x,a.y,P.S*2,[255,140,60],0.75*k); OWN.DR.blob(c,{x:a.x,y:a.y+P.S*(0.8-0.9*eo(k))},P.S*0.6*(0.5+0.5*k),o.col,t,0,-0.15,"lava"); for(let i=0;i<4;i++){ const q=((t/120)+i/4)%1; c.fillStyle=`rgba(255,220,120,${1-q})`; c.beginPath(); c.arc(a.x+(i-1.5)*P.S*0.3,a.y-q*P.S*1.2,2.5,0,7); c.fill(); } },
    fly(c,PF,k,P,x,a,h,o,t){ const pts=OWN.DR.wob(OWN.DR.seg(a,h,2.0,P.R,Math.max(0,k-0.55),k,20),P.S*0.12,t,2.5); for(let j=0;j<pts.length;j+=4) atGlowA(c,pts[j].x,pts[j].y,P.S*1.4,[255,120,40],0.35);
      OWN.DR.rib(c,pts,P.S*0.35,P.S*0.85,[200,60,20],1,false); OWN.DR.rib(c,pts,P.S*0.28,P.S*0.72,o.col,1,false); OWN.DR.rib(c,pts,P.S*0.1,P.S*0.32,[255,230,140],1,false);
      for(let i=0;i<8;i++){ const q=pts[Math.floor(atH(i+Math.floor(t/60))*20)]; c.fillStyle="rgba(255,210,110,.95)"; c.beginPath(); c.arc(q.x+(atH(i*3)-0.5)*P.S*1.4,q.y+P.S*0.6*atH(i*5),2.5,0,7); c.fill(); } const e=pts[20]; OWN.DR.blob(c,e,P.S*0.75,o.col,t,0,0.1,"lava"); },
    land(c,PF,k,P,x,a,h,o,t){ const cool=Math.min(1,Math.max(0,(k-0.25)/0.45)), R=P.R, al=k<0.85?1:1-(k-0.85)/0.15, col=OWN.mix([255,120,40],[70,55,50],cool); if(cool<1) atGlowA(c,P.tg.x,P.tg.y-R*0.2,R*1.8,[255,120,40],0.6*(1-cool));
      OWN.DR.coat(c,P,k,col,al,cool<0.3,1.6,6); c.strokeStyle=`rgba(255,${150+Math.round(80*(1-cool))},60,${al*(0.35+0.65*cool)})`; c.lineWidth=2.5; for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(P.tg.x+(atH(i)-0.5)*R*1.4,P.tg.y-R*0.5+atH(i*2)*R*0.3); c.lineTo(P.tg.x+(atH(i*3)-0.5)*R*1.6,P.tg.y-R*0.2+atH(i*4)*R*0.4); c.lineTo(P.tg.x+(atH(i*5)-0.5)*R*1.6,P.tg.y+atH(i*6)*R*0.4); c.stroke(); }
      for(let i=0;i<6;i++){ const q=((k*1.4)+i/6)%1; PF(P.tg.x+(atH(i)-0.5)*R*1.4,P.tg.y-R*0.6-q*R*1.6,P.S*(0.35+0.45*q),0.6*(1-k)*(1-q),[235,235,235]); } OWN.MT.scorch(c,P,k,1.1); } },
  "Bog Spit":{at:[0.85,0.15],col:[90,100,50],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); OWN.DR.clod(c,a.x,a.y,P.S*0.4*eo(k),o.col,t/200,5); for(let i=0;i<2;i++){ const q=((t/160)+i/2)%1; c.strokeStyle="rgba(150,170,90,.8)"; c.lineWidth=1; c.beginPath(); c.arc(a.x+(i-0.5)*P.S*0.6,a.y-q*P.S*0.8,3,0,7); c.stroke(); } },
    fly(c,PF,k,P,x,a,h,o,t){ const p=OWN.DR.pos(a,h,k,P.R,1.6), sp=Math.sin(t/60)*0.2; OWN.DR.clod(c,p.x,p.y+P.S*0.2,P.S*0.55,o.col,sp,5); OWN.DR.lily(c,p.x,p.y-P.S*0.25,P.S*0.65,sp); OWN.DR.frog(c,p.x,p.y-P.S*0.55,P.S*0.32,t);
      for(let i=0;i<3;i++){ c.strokeStyle="#3a6a2a"; c.lineWidth=1.5; c.beginPath(); c.moveTo(p.x+(i-1)*P.S*0.3,p.y+P.S*0.5); c.quadraticCurveTo(p.x+(i-1)*P.S*0.4-P.d*P.S*0.3,p.y+P.S*0.8,p.x+(i-1)*P.S*0.3-P.d*P.S*0.6,p.y+P.S*0.9+Math.sin(t/50+i)*3); c.stroke(); } },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, hd={x:P.tg.x,y:P.head.y}; OWN.splat(c,h.x,h.y,P.S*1.2,o.col,k,48,3); OWN.DR.drips(c,{x:h.x,y:h.y+R*0.2},R,k,o.col,4,11); OWN.DR.lily(c,hd.x,hd.y-R*0.05,P.S*0.65,0.2*(1-k));
      const fk=Math.min(1,Math.max(0,(k-0.2)/0.5)); if(fk<1) OWN.DR.frog(c,hd.x-P.d*R*1.6*fk,hd.y-R*0.3-R*1.2*Math.sin(Math.PI*fk)+fk*(P.gnd-hd.y),P.S*0.32,t,fk>0.85?(1-fk)/0.15:1); else OWN.DR.frog(c,hd.x-P.d*R*1.6,P.gnd-P.S*0.25,P.S*0.32,t,Math.max(0,1-(k-0.7)/0.3));
      for(let i=0;i<3;i++){ const ph=k*20+i*2; c.fillStyle=`rgba(30,30,30,${0.9*(1-k)})`; c.beginPath(); c.arc(h.x+Math.cos(ph)*R*0.5,h.y-R*0.4+Math.sin(ph*1.3)*R*0.3,1.8,0,7); c.fill(); } } },
  "Sour Spit":{col:[235,230,60],heads:[[0.2,0.12],[0.5,0.02],[0.82,0.12]],   /* the three streams land on top of the foe's head and run down from there (Gid, 19 Nov 2026) */
    wind(c,PF,t,P,x,a,o){ for(let i=0;i<3;i++){ const k=Math.min(1,Math.max(0,(t-i*50)/250)), p=OWN.pt(x.self,x.target,o.heads[i]); OWN.DR.tear(c,p.x+P.d*P.S*0.25,p.y,P.S*0.1*(0.3+k),P.d>0?0:Math.PI,o.col); } },
    fly(c,PF,k,P,x,a,h,o,t){ for(let i=0;i<3;i++){ const s=OWN.pt(x.self,x.target,o.heads[i]), src={x:s.x+P.d*P.S*0.25,y:s.y}, kk=Math.min(1,k*1.2-i*0.08); if(kk<=0) continue; const dst={x:P.tg.x+(i-1)*P.R*0.3,y:P.tg.y-P.R*0.8};
      const pts=OWN.DR.wob(OWN.DR.seg(src,dst,0.9+i*0.3,P.R,Math.max(0,kk-0.5),kk,12),P.S*0.05,t+i*40,4); OWN.DR.rib(c,pts,P.S*0.06,P.S*0.16,o.col); } },
    land(c,PF,k,P,x,a,h,o){ const R=P.R, al=k<0.75?1:1-(k-0.75)/0.25, top={x:P.tg.x,y:P.tg.y-R*0.78};
      for(let i=0;i<5;i++){ const q=((k*2)+i/5)%1; PF(top.x+(atH(i)-0.5)*R*1.1,top.y-q*R*1.0,P.S*(0.2+0.3*q),0.5*(1-k)*(1-q),[235,240,190]); }
      OWN.DR.coat(c,P,k,o.col,0.8*al,true,1.3,6); c.fillStyle=OWN.rgb(o.col,0.92*al); c.beginPath(); c.ellipse(top.x,top.y+R*0.04,R*0.5*eo(Math.min(1,k*4)),R*0.14,0,0,7); c.fill();
      c.fillStyle=`rgba(255,255,230,${0.7*al})`; c.beginPath(); c.ellipse(top.x-R*0.18,top.y,R*0.14,R*0.04,0,0,7); c.fill(); OWN.DR.pops(c,top,R,k,o.col,6,17); } },
  "Sap Spit":{mouth:true,col:[40,30,25],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); for(let i=0;i<3;i++){ const L=P.S*(0.3+0.9*k)*(0.6+0.4*atH(i)), sw=Math.sin(t/80+i)*P.S*0.15; OWN.DR.rib(c,[{x:a.x+(i-1)*P.S*0.18,y:a.y},{x:a.x+(i-1)*P.S*0.25+sw,y:a.y+L}],P.S*0.1,P.S*0.06,o.col); } },
    fly(c,PF,k,P,x,a,h,o,t){ for(let i=0;i<4;i++){ const dst={x:h.x+(i-1.5)*P.R*0.35,y:h.y+(i%2)*P.R*0.2-P.R*0.2}, kk=Math.min(1,k*1.1-i*0.03); if(kk<=0) continue; const pts=OWN.DR.seg(a,dst,0.9+0.2*i,P.R,Math.max(0,kk-0.6),kk,14).map((p,j)=>({x:p.x,y:p.y+Math.sin(j/14*Math.PI)*P.S*0.4})); OWN.DR.rib(c,pts,P.S*0.05,P.S*0.12,o.col,1,true); } },
    land(c,PF,k,P,x,a,h,o){ const R=P.R, al=k<0.7?1:1-(k-0.7)/0.3; for(let i=0;i<5;i++){ const sd=i-2, x0=P.tg.x+sd*R*0.2, top=P.tg.y-R*0.75, dn=eo(Math.min(1,k*1.8)); OWN.DR.rib(c,OWN.DR.wob([{x:x0,y:top},{x:x0+sd*R*0.06,y:top+R*0.4},{x:x0+sd*R*0.1,y:top+R*(0.4+0.5*dn)},{x:x0+sd*R*0.08,y:top+R*(0.4+0.9*dn)*(0.7+0.3*atH(i))}],R*0.06,k*300+i*50,1.5),R*0.16,R*0.07,o.col,al); OWN.DR.tear(c,x0+sd*R*0.08,top+R*(0.45+0.9*dn)*(0.7+0.3*atH(i)),R*0.07,Math.PI/2,o.col,al); }
      c.fillStyle=OWN.rgb(o.col,0.9*al); c.beginPath(); c.ellipse(P.tg.x,P.tg.y-R*0.72,R*0.55,R*0.16,0,0,7); c.fill(); OWN.DR.pud(c,P.tg.x,P.gnd,R*0.8*eo(Math.min(1,k*2)),o.col,0.8*al); } },
  "Rust Ooze":{at:[0.9,1.0],inside:true,col:[160,72,30],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300); OWN.DR.pud(c,a.x,P.sg,P.S*(0.4+0.8*k),[120,55,25],0.9); OWN.DR.rustFlecks(c,a.x,P.sg,P.S*(0.4+0.8*k),P.S*0.12,k,1);
      for(let i=0;i<3;i++){ const L=P.S*0.7*eo(k)*(0.6+0.4*atH(i)), sx=a.x+(i-1)*P.S*0.4; OWN.DR.rustRope(c,[{x:sx,y:P.sg},{x:sx+Math.sin(t/70+i)*P.S*0.2,y:P.sg-L*0.6},{x:sx+Math.sin(t/60+i*2)*P.S*0.3,y:P.sg-L}],P.S*0.22,P.S*0.1,t,i,1); } },
    fly(c,PF,k,P,x,a,h,o,t){ for(let i=0;i<3;i++){ const tx=P.tg.x+(i-1)*P.R*0.45, fx=a.x+(tx-a.x)*eo(k), pts=[]; for(let j=0;j<=14;j++){ const f=j/14, xx=a.x+(fx-a.x)*f, gy=P.sg+(P.gnd-P.sg)*f*k; pts.push({x:xx,y:gy-Math.abs(Math.sin(f*Math.PI*2.5+i-t/45))*P.S*0.35*f}); }
        OWN.DR.rustRope(c,pts,P.S*0.32,P.S*0.16,t,i,1); const e=pts[14]; OWN.DR.rustHead(c,e.x,e.y-P.S*0.1,P.S*0.22,P.d,t+i*50); }
      OWN.DR.pud(c,a.x,P.sg,P.S*0.9*(1-k*0.5),[120,55,25],0.85); for(let i=0;i<3;i++){ const q=((t/150)+i/3)%1, p=OWN.DR.pos(a,{x:P.tg.x,y:P.gnd},q*k,P.R,0.1); OWN.DR.bolt(c,p.x,p.y-P.S*0.3,P.S*0.15,t/60+i); } },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, up=eo(Math.min(1,k*1.8)), al=k<0.8?1:1-(k-0.8)/0.2;
      OWN.DR.pud(c,P.tg.x,P.gnd,R*1.0,[120,55,25],0.85*al); OWN.DR.rustFlecks(c,P.tg.x,P.gnd,R*1.0,R*0.15,al,7);
      for(let i=0;i<3;i++){ const sd=i-1, pts=[]; for(let j=0;j<=16;j++){ const f=j/16*up, an=f*Math.PI*2.2+i*2.1, rx=R*(0.95-0.15*f); pts.push({x:P.tg.x+Math.cos(an)*rx+sd*R*0.1,y:P.gnd-f*R*1.6+Math.sin(an)*R*0.12}); }
        OWN.DR.rustRope(c,pts,R*0.24,R*0.12,t,i,al); const e=pts[16]; OWN.DR.rustHead(c,e.x,e.y,R*0.16,Math.cos(up*Math.PI*2.2+i*2.1)>0?1:-1,t+i*40,al); }
      const sp=eo(Math.min(1,k*2)); for(let i=0;i<9;i++){ const px=P.tg.x+(atH(i*3)-0.5)*R*1.5, py=P.tg.y+(atH(i*5)-0.5)*R*1.2, rr=R*(0.12+0.12*atH(i*7))*sp; c.fillStyle=`rgba(${150+Math.round(60*atH(i))},${65+Math.round(30*atH(i))},28,${0.85*al})`; c.beginPath(); for(let j=0;j<8;j++){ const an=j/8*7, r2=rr*(0.7+0.5*atH(i*9+j)); c.lineTo(px+Math.cos(an)*r2,py+Math.sin(an)*r2*0.8); } c.fill();
        c.fillStyle=`rgba(80,35,15,${0.8*al})`; c.beginPath(); c.arc(px+rr*0.2,py-rr*0.1,rr*0.22,0,7); c.fill(); c.fillStyle=`rgba(240,150,70,${0.9*al})`; c.beginPath(); c.arc(px-rr*0.3,py+rr*0.2,rr*0.12,0,7); c.fill(); }
      for(let i=0;i<8;i++){ const q=Math.max(0,k-0.25-i*0.05); if(q<=0||q>=1) continue; c.save(); c.translate(P.tg.x+(atH(i*5)-0.5)*R*1.4+Math.sin(q*8+i)*R*0.1,P.tg.y+q*q*R*2.2); c.rotate(q*7+i); c.fillStyle=`rgba(${i%2?205:130},${i%2?105:55},35,${1-q})`; c.beginPath(); c.moveTo(-R*0.08,-R*0.04); c.lineTo(R*0.07,-R*0.06); c.lineTo(R*0.09,R*0.05); c.lineTo(-R*0.05,R*0.06); c.closePath(); c.fill(); c.restore(); }
      if(k>0.4){ const q=Math.min(1,(k-0.4)/0.4); OWN.DR.bolt(c,P.tg.x+P.d*R*0.6+P.d*q*R*0.4,P.tg.y-R*0.2+q*q*(P.gnd-P.tg.y+R*0.1),R*0.13,q*10,1-Math.max(0,q-0.8)*5); } } },
  "Black Slime":{at:[0.85,0.4],col:[30,22,40],
    wind(c,PF,t,P,x,a,o){ const k=Math.min(1,t/300), p={x:a.x+P.d*P.S*0.5*k,y:a.y-P.S*0.35*k}; OWN.DR.rib(c,[a,p],P.S*0.45,P.S*0.35,o.col,1,false); OWN.DR.slimeBeast(c,p.x,p.y,P.S*0.55*eo(k),t,0,0,0.2+0.3*k,P.d,o.col); },
    fly(c,PF,k,P,x,a,h,o,t){ const p=OWN.DR.pos(a,h,k,P.R,1.7), q=OWN.DR.pos(a,h,Math.max(0,k-0.05),P.R,1.7), an=Math.atan2(p.y-q.y,p.x-q.x), r=P.S*0.7;
      if(k<0.35) OWN.DR.rib(c,OWN.DR.seg(a,h,1.7,P.R,0,k,8),r*0.35*(1-k/0.35)+1,r*0.5,o.col,1-k/0.35,false);
      for(let j=1;j<=4;j++){ const qq=OWN.DR.pos(a,h,Math.max(0,k-j*0.06),P.R,1.7); OWN.DR.tear(c,qq.x+(atH(j)-0.5)*r*0.6,qq.y+r*0.5+j*j*r*0.08,r*0.1,Math.PI/2,o.col,0.9); }
      OWN.DR.slimeBeast(c,p.x,p.y,r,t,an,0.3,0.4+0.4*Math.abs(Math.sin(t/60)),P.d,o.col); },
    land(c,PF,k,P,x,a,h,o,t){ const R=P.R, al=k<0.85?1:1-(k-0.85)/0.15, hd={x:P.tg.x,y:P.head.y}, melt=Math.min(1,Math.max(0,(k-0.45)/0.4));
      OWN.DR.coat(c,P,Math.max(0.05,k),o.col,0.95*al,true,1.1,7); OWN.DR.sheen(c,P.tg.x,P.tg.y-R*0.4,R*0.9,al);
      if(melt<1){ const ch=Math.abs(Math.sin(k*16)); c.save(); c.globalAlpha=al*(1-melt); OWN.DR.slimeBeast(c,hd.x,hd.y-R*0.1+melt*R*0.5,R*0.7*(1-melt*0.4),t,0,-0.25,ch,P.d,o.col); c.restore(); }
      OWN.DR.pud(c,P.tg.x,P.gnd,R*(0.4+0.7*eo(k)),o.col,0.9*al); if(k>0.5){ const bl=Math.abs(Math.sin(t/150))<0.15, e2=Math.max(0,1-(k-0.85)/0.15); c.fillStyle=`rgba(255,255,255,${al})`; c.beginPath(); c.ellipse(P.tg.x+P.d*R*0.5,P.gnd-1,R*0.09,bl?1:R*0.07*e2+0.5,0,0,7); c.fill(); if(!bl){ c.fillStyle="#1a0a1a"; c.beginPath(); c.arc(P.tg.x+P.d*R*0.52,P.gnd-1,R*0.04*e2,0,7); c.fill(); } } } }
};
OWN.droolFx=(c,t,x,o)=>{ OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:o.at||[0.8,0.4],sz:1.2}); const col=o.colOf?o.colOf(x):o.body?(x.body||[150,220,150]):o.col, a=OWN.DR.src(P,x,o), h=OWN.DR.hit(P,o); P.S*=1.65;
    if(t<300){ if(o.wind) o.wind(c,PF,t,P,x,a,o,col); return; }
    if(t<620){ o.fly(c,PF,(t-300)/320,P,x,a,h,o,t,col); return; }
    o.land(c,PF,Math.min(1,(t-620)/680),P,x,a,h,o,t,col); }); };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.drool) return; const K=ANIM.drool, fx1=K.fx;
  K.fx=function(c,t,x){ const o=x&&OWN_DROOL[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ OWN.droolFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN drool",x.name,e&&e.message); } } }; })();

/* ---------- gust, own versions (18 Nov 2026): every family blew the same white crescents and lines, so each gust now carries something
   of its own (rain, paper, snow, feathers, petals, dust, bats, fox fire) inside a soft stream of wind, and lands with its own shove or cut.
   Wind-up to 120 ms, travel 120-400, contact at 400, push to 820. ---------- */
OWN.GU={
  path(a,h,k,R,lift=0.3,wave=0,t=0,ph=0){ const v=1-k, cx=(a.x+h.x)/2, cy=Math.min(a.y,h.y)-R*lift; return {x:v*v*a.x+2*v*k*cx+k*k*h.x,y:v*v*a.y+2*v*k*cy+k*k*h.y+Math.sin(k*9+ph-t/60)*wave}; },
  stream(c,PF,a,h,k,t,P,col=[255,255,255],n=3,spread=0.5,al=0.55,w=0.45){ for(let i=0;i<n;i++){ const off=(i-(n-1)/2)*P.R*spread, aa={x:a.x,y:a.y+off*0.3}, hh={x:h.x,y:h.y+off};
      for(let j=0;j<9;j++){ const kk=k-j*0.06; if(kk<0) break; const p=OWN.GU.path(aa,hh,kk,P.R,0.25,P.S*0.25,t,i*2); PF(p.x,p.y,P.S*w*(1-j*0.06),al*(1-j/10),col); }
      const pts=[]; for(let j=0;j<=12;j++){ const kk=k-(12-j)*0.035; if(kk<0) continue; const p=OWN.GU.path(aa,hh,kk,P.R,0.25,P.S*0.25,t,i*2); pts.push({x:p.x,y:p.y+(i%2?-1:1)*P.S*w*0.35}); }
      OWN.GU.streak(c,pts,P.S*0.11,OWN.mix(col,[255,255,255],0.6),0.85); if(pts.length>2){ const e=pts[pts.length-1], q=pts[pts.length-2]; OWN.GU.curl(c,e,P.S*0.32,Math.atan2(e.y-q.y,e.x-q.x),OWN.mix(col,[255,255,255],0.6),0.8,t+i*40); } } },
  curl(c,p,r,ang,col,al,t){ c.save(); c.translate(p.x,p.y); c.rotate(ang); c.strokeStyle=OWN.rgb(col,al); c.lineCap="round";
    for(const [lw,sh] of [[r*0.28,0],[r*0.1,r*0.05]]){ c.lineWidth=lw; c.beginPath(); for(let j=0;j<=22;j++){ const f=j/22, an=f*Math.PI*2.2+t/80, rr=r*(1-f*0.75); c.lineTo(-r*1.4*(1-f)+Math.cos(an)*rr*f,Math.sin(an)*rr*f-sh); } c.stroke(); } c.restore(); },
  crescent(c,p,ang,r,col,al=0.9,th=0.35){ c.save(); c.translate(p.x,p.y); c.rotate(ang); const g=c.createLinearGradient(-r,0,r*0.6,0); g.addColorStop(0,OWN.rgb(col,0)); g.addColorStop(0.7,OWN.rgb(col,al*0.8)); g.addColorStop(1,OWN.rgb(OWN.mix(col,[255,255,255],0.7),al));
    c.fillStyle=g; c.beginPath(); c.moveTo(-r*0.2,-r); c.quadraticCurveTo(r*0.95,0,-r*0.2,r); c.quadraticCurveTo(r*(0.95-th*2),0,-r*0.2,-r); c.fill();
    c.strokeStyle=OWN.rgb([255,255,255],al); c.lineWidth=Math.max(1.2,r*0.05); c.beginPath(); c.moveTo(-r*0.15,-r*0.92); c.quadraticCurveTo(r*0.88,0,-r*0.15,r*0.92); c.stroke(); c.restore(); },
  slash(c,h,R,k,col,ang=-0.6,len=1.3){ if(k>=1) return; const g=k<0.15?k/0.15:1, a=1-Math.max(0,k-0.3)/0.7; c.save(); c.translate(h.x,h.y); c.rotate(ang); c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.5),a); const L=R*len*g;
    c.beginPath(); c.moveTo(-L,0); c.quadraticCurveTo(0,-R*0.16,L,0); c.quadraticCurveTo(0,-R*0.05,-L,0); c.fill(); c.strokeStyle=OWN.rgb(col,a*0.8); c.lineWidth=2; c.beginPath(); c.moveTo(-L*0.9,R*0.02); c.quadraticCurveTo(0,-R*0.12,L*0.9,R*0.02); c.stroke(); c.restore(); },
  burst(c,PF,h,R,k,col,n=8){ if(k>=1) return; for(let i=0;i<n;i++){ const an=-Math.PI*0.5+(i/(n-1)-0.5)*Math.PI*0.9+(OWN.GU.d||1>0?0:Math.PI), v=R*(0.4+1.0*eo(k)); PF(h.x+OWN.GU.d*Math.cos(an)*v*0.4+OWN.GU.d*R*0.8*eo(k),h.y+Math.sin(an)*v*0.6,R*(0.25+0.3*k),0.55*(1-k),col); }
    c.strokeStyle=OWN.rgb(col,0.8*(1-k)); c.lineWidth=3*(1-k)+1; c.beginPath(); c.ellipse(h.x+OWN.GU.d*R*0.3*k,h.y,R*(0.3+0.5*eo(k)),R*(0.6+0.9*eo(k)),0,0,7); c.stroke(); },
  ride(n,a,h,k,t,P,fn,spread=0.6,lag=0.04,lift=0.3,wave=0.35){ n=Math.round(n*1.5); lag*=0.7; for(let i=0;i<n;i++){ const kk=k-i*lag+ (atH(i*3)-0.5)*0.05; if(kk<0||kk>1.05) continue; const off=(atH(i*7)-0.5)*P.R*spread*2, p=OWN.GU.path({x:a.x,y:a.y+off*0.3},{x:h.x,y:h.y+off},Math.min(1,kk),P.R,lift,P.S*wave,t,i*1.7); fn(p,i,kk); } },
  scatter(n,h,R,k,fn,seed=0){ n=Math.round(n*1.4); for(let i=0;i<n;i++){ const an=-Math.PI*0.8+atH(i*3+seed)*Math.PI*1.1, v=R*(0.5+1.2*atH(i*5+seed))*eo(k); fn({x:h.x+OWN.GU.d*Math.abs(Math.cos(an))*v+OWN.GU.d*R*0.4*k,y:h.y+Math.sin(an)*v*0.7+k*k*R*0.8},i); } },
  flake(c,x,y,r,rot,al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.strokeStyle=`rgba(240,250,255,${al})`; c.lineWidth=Math.max(1,r*0.18); c.lineCap="round"; for(let i=0;i<3;i++){ c.rotate(Math.PI/3); c.beginPath(); c.moveTo(-r,0); c.lineTo(r,0); c.moveTo(r*0.55,0); c.lineTo(r*0.8,-r*0.25); c.moveTo(r*0.55,0); c.lineTo(r*0.8,r*0.25); c.moveTo(-r*0.55,0); c.lineTo(-r*0.8,-r*0.25); c.moveTo(-r*0.55,0); c.lineTo(-r*0.8,r*0.25); c.stroke(); } c.restore(); },
  feather(c,x,y,r,rot,col,al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=al; const dk=OWN.mix(col,[0,0,0],0.35), lt=OWN.mix(col,[255,255,255],0.4); c.fillStyle=OWN.lg(c,-r,0,r,0,[[0,OWN.rgb(dk,1)],[0.5,OWN.rgb(col,1)],[1,OWN.rgb(lt,1)]]); c.strokeStyle=OWN.rgb(dk,1); c.lineWidth=1;
    c.beginPath(); c.moveTo(-r,0); c.quadraticCurveTo(-r*0.2,-r*0.45,r,-r*0.05); c.quadraticCurveTo(-r*0.2,r*0.4,-r,0); c.fill(); OWN.ol(c); c.strokeStyle=OWN.rgb(dk,0.6); c.lineWidth=0.8;
    for(let i=0;i<7;i++){ const xx=-r*0.7+i*r*0.25; c.beginPath(); c.moveTo(xx,-r*0.02); c.lineTo(xx-r*0.18,-r*(0.32-Math.abs(i-3)*0.03)); c.moveTo(xx,r*0.02); c.lineTo(xx-r*0.18,r*(0.3-Math.abs(i-3)*0.03)); c.stroke(); }
    c.strokeStyle=OWN.rgb([255,250,240],0.9); c.lineWidth=1.3; c.beginPath(); c.moveTo(-r*1.25,0); c.lineTo(r*0.9,-r*0.03); c.stroke(); c.restore(); },
  petal(c,x,y,r,rot,col=[255,190,210],al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.scale(1,Math.cos(rot*1.7)*0.5+0.6); c.fillStyle=OWN.rgb(col,al); c.strokeStyle=OWN.rgb(OWN.mix(col,[200,80,120],0.4),al); c.lineWidth=1; c.beginPath(); c.moveTo(-r,0); c.quadraticCurveTo(0,-r*0.7,r,-r*0.1); c.lineTo(r*0.75,0.5); c.lineTo(r,r*0.1); c.quadraticCurveTo(0,r*0.7,-r,0); c.fill(); OWN.ol(c); c.restore(); },
  scrap(c,x,y,r,rot,col=[250,245,232],al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.scale(Math.cos(rot*2)*0.4+0.7,1); c.fillStyle=OWN.rgb(col,al); c.strokeStyle=`rgba(150,140,120,${al})`; c.lineWidth=1; c.beginPath(); c.moveTo(-r,-r*0.6); c.lineTo(r*0.9,-r*0.75); c.lineTo(r,r*0.6); c.lineTo(-r*0.8,r*0.7); c.closePath(); c.fill(); OWN.ol(c);
    c.beginPath(); c.moveTo(-r*0.6,-r*0.2); c.lineTo(r*0.6,-r*0.25); c.moveTo(-r*0.6,r*0.15); c.lineTo(r*0.4,r*0.12); c.stroke(); c.restore(); },
  plane(c,x,y,r,rot,col=[250,245,232],al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=OWN.rgb(col,al); c.strokeStyle=`rgba(140,130,110,${al})`; c.lineWidth=1.2; c.beginPath(); c.moveTo(r,0); c.lineTo(-r,-r*0.6); c.lineTo(-r*0.6,0); c.closePath(); c.fill(); OWN.ol(c);
    c.fillStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.12),al); c.beginPath(); c.moveTo(r,0); c.lineTo(-r,r*0.45); c.lineTo(-r*0.6,0); c.closePath(); c.fill(); OWN.ol(c); c.restore(); },
  bat(c,x,y,r,t,col=[50,30,70],al=1){ c.save(); c.translate(x,y); c.globalAlpha*=al; const fl=Math.sin(t/30)*0.6, dk=OWN.mix(col,[0,0,0],0.35), lt=OWN.mix(col,[255,255,255],0.25);
    for(const sd of [-1,1]){ c.fillStyle=OWN.rgb(col,1); c.strokeStyle=OWN.rgb(dk,1); c.lineWidth=1; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(sd*r*0.6,-r*(0.7+fl*0.5),sd*r*1.4,-r*0.25*fl-r*0.1); c.quadraticCurveTo(sd*r*1.1,r*0.1,sd*r*0.95,r*0.32); c.quadraticCurveTo(sd*r*0.7,r*0.08,sd*r*0.5,r*0.34); c.quadraticCurveTo(sd*r*0.3,r*0.08,0,r*0.22); c.fill(); OWN.ol(c);
      c.strokeStyle=OWN.rgb(lt,0.7); for(const f of [0.45,0.75]){ c.beginPath(); c.moveTo(sd*r*0.15,0); c.lineTo(sd*r*1.3*f,r*(0.3-f*0.4)-r*0.25*fl*f); c.stroke(); } }
    c.fillStyle=OWN.rgb(col,1); c.beginPath(); c.ellipse(0,r*0.08,r*0.26,r*0.32,0,0,7); c.fill(); for(const sd of [-1,1]){ c.beginPath(); c.moveTo(sd*r*0.08,-r*0.15); c.lineTo(sd*r*0.22,-r*0.42); c.lineTo(sd*r*0.24,-r*0.12); c.fill(); }
    c.fillStyle="#ff5a6a"; c.beginPath(); c.arc(-r*0.09,r*0.02,r*0.06,0,7); c.arc(r*0.09,r*0.02,r*0.06,0,7); c.fill(); c.fillStyle="#fff"; c.beginPath(); c.moveTo(-r*0.06,r*0.2); c.lineTo(-r*0.03,r*0.28); c.lineTo(0,r*0.2); c.moveTo(r*0.02,r*0.2); c.lineTo(r*0.05,r*0.28); c.lineTo(r*0.08,r*0.2); c.fill(); c.restore(); },
  drop(c,x,y,r,ang,al=1){ OWN.DR.tear(c,x,y,r,ang,[150,200,250],al); },
  dust(c,x,y,r,t,al=1){ c.save(); c.translate(x,y); c.globalAlpha*=al; c.fillStyle="#b8ab98"; c.strokeStyle="#7a6e5e"; c.lineWidth=1; c.beginPath(); for(let i=0;i<16;i++){ const an=i/16*Math.PI*2, rr=r*(i%2?0.72:1.05)*(0.9+0.1*Math.sin(t/40+i)); c.lineTo(Math.cos(an)*rr,Math.sin(an)*rr); } c.closePath(); c.fill(); OWN.ol(c);
    c.strokeStyle="rgba(120,108,92,.8)"; for(let i=0;i<8;i++){ const an=i/8*Math.PI*2+0.2; c.beginPath(); c.moveTo(Math.cos(an)*r*0.9,Math.sin(an)*r*0.9); c.lineTo(Math.cos(an)*r*1.3,Math.sin(an)*r*1.3); c.stroke(); }
    c.fillStyle="#fff"; c.beginPath(); c.arc(-r*0.28,-r*0.12,r*0.2,0,7); c.arc(r*0.28,-r*0.12,r*0.2,0,7); c.fill(); c.fillStyle="#2a2018"; c.beginPath(); c.arc(-r*0.24,-r*0.08,r*0.11,0,7); c.arc(r*0.32,-r*0.08,r*0.11,0,7); c.fill();
    c.strokeStyle="#2a2018"; c.lineWidth=1.4; c.beginPath(); c.moveTo(-r*0.45,-r*0.42); c.lineTo(-r*0.12,-r*0.3); c.moveTo(r*0.45,-r*0.42); c.lineTo(r*0.12,-r*0.3); c.stroke(); c.beginPath(); c.arc(0,r*0.3,r*0.15,Math.PI*1.15,Math.PI*1.85); c.stroke(); c.restore(); },
  ring(c,p,ang,r,col,al){ c.save(); c.translate(p.x,p.y); c.rotate(ang); c.strokeStyle=OWN.rgb(col,al); c.lineWidth=r*0.32; c.beginPath(); c.ellipse(0,0,r*0.35,r,0,0,7); c.stroke(); c.strokeStyle=`rgba(255,255,255,${al*0.8})`; c.lineWidth=r*0.1; c.beginPath(); c.ellipse(-r*0.04,-r*0.04,r*0.33,r*0.95,0,Math.PI*1.1,Math.PI*1.7); c.stroke(); c.restore(); },
  disc(c,p,r,t,col,al=1){ c.save(); c.translate(p.x,p.y); c.scale(1,0.45); c.rotate(t/25); for(let i=0;i<4;i++){ c.rotate(Math.PI/2); c.fillStyle=OWN.rgb(col,al*0.85); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(r*0.5,-r*0.6,r,-r*0.15); c.quadraticCurveTo(r*0.6,r*0.1,0,0); c.fill(); } c.fillStyle=`rgba(255,255,255,${al})`; c.beginPath(); c.arc(0,0,r*0.15,0,7); c.fill(); c.restore(); }
};
const OWN_GUST={
  "Gust Cut":{at:[0.9,0.4],
    wind(c,PF,t,P,x,a){ const k=t/120; PF(a.x,a.y,P.S*(0.4+0.4*k),0.4*k,[120,90,160]); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[150,120,190],2,0.4,0.4,0.4); const p=OWN.GU.path(a,h,k,P.R,0.15); OWN.GU.crescent(c,p,P.d>0?0:Math.PI,P.S*1.2,[120,80,180],0.9);
      OWN.GU.ride(4,a,h,k,t,P,(q,i)=>OWN.GU.bat(c,q.x,q.y,P.S*0.32,t+i*40,[60,40,90]),0.7,0.08); },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.slash(c,h,P.R,k,[150,110,220],-0.5); OWN.GU.slash(c,{x:h.x,y:h.y+P.R*0.2},P.R,Math.max(0,k-0.08),[150,110,220],0.4,1.0);
      OWN.GU.scatter(4,h,P.R,k,(q,i)=>OWN.GU.bat(c,q.x,q.y-k*P.R,P.S*0.3,t+i*50,[60,40,90],1-k)); } },
  "Rain Gust":{at:[0.6,0.2],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<6;i++){ const an=i/6*Math.PI*2+t/30; OWN.GU.drop(c,a.x+Math.cos(an)*P.S*0.9*k,a.y+Math.sin(an)*P.S*0.3,P.S*0.08,an+Math.PI/2); } },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[190,205,220],3,0.55,0.45,0.5); OWN.GU.ride(14,a,h,k,t,P,(q,i)=>OWN.GU.drop(c,q.x,q.y,P.S*0.1,P.d>0?0.25:Math.PI-0.25),0.8,0.03,0.2,0.2);
      const p=OWN.GU.path(a,h,k,P.R,0.2); OWN.GU.curl(c,p,P.S*0.6,P.d>0?0:Math.PI,[220,235,250],0.85,t); },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.burst(c,PF,h,P.R,k,[200,220,240]); OWN.DR.coat(c,P,k,[150,200,250],0.4*(1-k*0.6),true,2.5,6); OWN.GU.scatter(10,h,P.R,k,(q,i)=>OWN.GU.drop(c,q.x,q.y,P.R*0.07,P.d>0?0.3:Math.PI-0.3,1-k));
      OWN.DR.pud(c,P.tg.x,P.gnd,P.R*(0.4+0.6*eo(k)),[150,200,250],0.5*(1-k*0.5)); } },
  "Puff Push":{at:[0.95,0.5],
    wind(c,PF,t,P,x,a){ const k=t/120; PF(a.x,a.y,P.S*(0.4+0.6*k),0.7,x.body||[230,235,245]); },
    fly(c,PF,k,P,x,a,h,t){ const col=OWN.mix(x.body||[230,235,245],[255,255,255],0.5), p=OWN.GU.path(a,h,k,P.R,0.05); for(let i=0;i<7;i++){ const an=i/7*Math.PI*2+t/200; PF(p.x+Math.cos(an)*P.S*0.6,p.y+Math.sin(an)*P.S*0.45,P.S*(0.55+0.15*Math.sin(t/60+i)),0.85,col); }
      OWN.GU.stream(c,PF,a,{x:p.x,y:p.y},1,t,P,col,2,0.3,0.4,0.4); OWN.DR.cloudFace?0:0; c.fillStyle="rgba(60,60,80,.8)"; c.beginPath(); c.arc(p.x+P.d*P.S*0.15,p.y-P.S*0.1,P.S*0.07,0,7); c.arc(p.x+P.d*P.S*0.45,p.y-P.S*0.1,P.S*0.07,0,7); c.fill(); c.strokeStyle="rgba(60,60,80,.8)"; c.lineWidth=1.5; c.beginPath(); c.arc(p.x+P.d*P.S*0.3,p.y+P.S*0.05,P.S*0.1,0,Math.PI); c.stroke(); },
    land(c,PF,k,P,x,a,h,t){ const col=OWN.mix(x.body||[230,235,245],[255,255,255],0.5); for(let i=0;i<8;i++){ const an=i/8*Math.PI*2; PF(h.x+P.d*P.R*0.3*eo(k)+Math.cos(an)*P.R*(0.5+0.6*eo(k)),h.y+Math.sin(an)*P.R*(0.4+0.4*eo(k)),P.S*0.6*(1-k*0.4),0.75*(1-k),col); } OWN.GU.burst(c,PF,h,P.R,k,col,5); } },
  "Wind Cut":{at:[0.95,0.4],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<3;i++) PF(a.x+P.d*P.S*0.3*i*k,a.y,P.S*0.3,0.5*k,[240,245,255]); },
    fly(c,PF,k,P,x,a,h,t){ const col=OWN.mix(x.body||[230,235,245],[255,255,255],0.4), p=OWN.GU.path(a,h,k,P.R,0.1); for(let j=0;j<6;j++){ const q=OWN.GU.path(a,h,Math.max(0,k-j*0.05),P.R,0.1); PF(q.x-P.d*P.S*0.3,q.y,P.S*(0.35-j*0.04),0.6,col); }
      OWN.GU.crescent(c,p,P.d>0?0:Math.PI,P.S*1.3,col,0.95,0.25); OWN.GU.crescent(c,{x:p.x-P.d*P.S*0.5,y:p.y},P.d>0?0:Math.PI,P.S*1.0,col,0.6,0.25); },
    land(c,PF,k,P,x,a,h,t){ const col=OWN.mix(x.body||[230,235,245],[255,255,255],0.4); OWN.GU.slash(c,h,P.R,k,[200,220,255],-0.15,1.5); for(let i=0;i<5;i++) PF(h.x+P.d*P.R*(0.2+1.2*eo(k))+(i-2)*P.R*0.1,h.y+(i-2)*P.R*0.25,P.S*0.35,0.6*(1-k),col); } },
  "Paper Gust":{at:[0.8,0.3],
    wind(c,PF,t,P,x,a){ for(let i=0;i<4;i++){ const an=i/4*Math.PI*2+t/25; OWN.GU.scrap(c,a.x+Math.cos(an)*P.S*0.8,a.y+Math.sin(an)*P.S*0.4,P.S*0.2,an); } },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[240,240,245],3,0.5,0.4,0.45); OWN.GU.ride(10,a,h,k,t,P,(q,i)=>i%3?OWN.GU.scrap(c,q.x,q.y,P.S*0.22,t/40+i):OWN.GU.plane(c,q.x,q.y,P.S*0.32,(P.d>0?0:Math.PI)+Math.sin(t/60+i)*0.3),0.8,0.05,0.3,0.45); },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.burst(c,PF,h,P.R,k,[240,240,245],6); OWN.GU.scatter(10,h,P.R,k,(q,i)=>OWN.GU.scrap(c,q.x,q.y,P.S*0.22,k*8+i,[250,245,232],1-k)); if(k<0.5) for(let i=0;i<3;i++){ c.strokeStyle=`rgba(200,60,60,${1-k/0.5})`; c.lineWidth=1.5; c.beginPath(); c.moveTo(h.x-P.R*0.3+i*P.R*0.3,h.y-P.R*0.2); c.lineTo(h.x-P.R*0.2+i*P.R*0.3,h.y+P.R*0.15); c.stroke(); } } },
  "Cold Draft":{at:[0.5,0.15],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<8;i++){ const an=i/8*Math.PI*2+t/40; OWN.GU.flake(c,a.x+Math.cos(an)*P.S*0.6*k,a.y+Math.sin(an)*P.S*0.6*k,P.S*0.1,t/50+i); } },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[200,230,255],3,0.5,0.5,0.5); const p=OWN.GU.path(a,h,k,P.R,0.3); for(let i=0;i<10;i++){ const an=i/10*Math.PI*2+t/50, rr=P.S*(0.3+0.6*(i%3)/2); OWN.GU.flake(c,p.x+Math.cos(an)*rr,p.y+Math.sin(an)*rr*0.6,P.S*(0.08+0.06*(i%3)),t/30+i); }
      OWN.GU.ride(8,a,h,k,t,P,(q,i)=>OWN.GU.flake(c,q.x,q.y,P.S*0.1,t/40+i),0.8,0.06); OWN.GU.curl(c,p,P.S*0.7,P.d>0?0:Math.PI,[220,240,255],0.8,t); },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.burst(c,PF,h,P.R,k,[210,235,255]); const al=k<0.7?1:1-(k-0.7)/0.3; OWN.DR.coat(c,P,Math.min(1,k*2),[220,240,255],0.55*al,true,3,7);
      for(let i=0;i<6;i++){ const px=P.tg.x+(atH(i*3)-0.5)*P.R*1.5, py=P.tg.y+(atH(i*5)-0.5)*P.R; OWN.GU.flake(c,px,py,P.R*0.12*eo(Math.min(1,k*3)),i,al); } OWN.GU.scatter(6,h,P.R,k,(q,i)=>OWN.GU.flake(c,q.x,q.y,P.R*0.08,k*6+i,1-k)); } },
  "Wind Nudge":{at:[0.7,0.6],
    wind(c,PF,t,P,x,a){ const k=t/120; OWN.GU.ribbonTail(c,a,P,t,k); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[245,245,255],2,0.4,0.35,0.4); const pts=[]; for(let j=0;j<=14;j++){ pts.push(OWN.GU.path(a,h,Math.max(0,k-(14-j)*0.03),P.R,0.25,P.S*0.35,t,0)); }
      c.strokeStyle="rgba(230,70,90,.95)"; c.lineWidth=2; c.beginPath(); pts.forEach(p=>c.lineTo(p.x,p.y)); c.stroke(); for(let j=2;j<14;j+=3){ OWN.GU.bow(c,pts[j].x,pts[j].y,P.S*0.18,["#ffd24a","#4ac8ff","#ff7aa8","#7ae07a"][j%4]); } },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.burst(c,PF,h,P.R,k,[245,245,255],5); for(let i=0;i<4;i++){ const q={x:h.x+P.d*P.R*(0.3+0.8*eo(k))+i*4,y:h.y+(i-1.5)*P.R*0.3-k*P.R*0.4}; OWN.GU.bow(c,q.x,q.y,P.S*0.18*(1-k*0.5),["#ffd24a","#4ac8ff","#ff7aa8","#7ae07a"][i]); } } },
  "Air Slice":{at:[0.8,0.4],
    wind(c,PF,t,P,x,a){ const k=t/120; OWN.GU.crescent(c,{x:a.x,y:a.y-P.S*0.4},-Math.PI/2,P.S*0.6*k,[220,240,255],0.7); },
    fly(c,PF,k,P,x,a,h,t){ for(const sd of [-1,1]){ const hh={x:h.x,y:h.y+sd*P.R*0.1}, aa={x:a.x,y:a.y+sd*P.S*0.5}, p=OWN.GU.path(aa,hh,k,P.R,sd*0.4); OWN.GU.crescent(c,p,(P.d>0?0:Math.PI)+sd*0.5,P.S*1.0,[200,230,255],0.9,0.25);
        for(let j=1;j<5;j++){ const q=OWN.GU.path(aa,hh,Math.max(0,k-j*0.06),P.R,sd*0.4); PF(q.x,q.y,P.S*(0.3-j*0.04),0.5,[230,245,255]); } } },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.slash(c,h,P.R,k,[180,220,255],-0.7,1.3); OWN.GU.slash(c,h,P.R,k,[180,220,255],0.7,1.3); if(k<0.25){ c.fillStyle=`rgba(255,255,255,${1-k/0.25})`; c.beginPath(); c.arc(h.x,h.y,P.R*0.3*(1+k*3),0,7); c.fill(); } } },
  "Air Puff":{at:[0.9,0.45],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<3;i++){ const q=((t/60)+i/3)%1; PF(a.x+P.d*q*P.S*0.5,a.y-q*P.S*0.4,P.S*0.2*(1+q),0.6*(1-q),[230,235,240]); } },
    fly(c,PF,k,P,x,a,h,t){ for(let i=0;i<4;i++){ const kk=k*1.3-i*0.15; if(kk<0||kk>1) continue; const p=OWN.GU.path(a,h,kk,P.R,0.05), r=P.S*(0.45+0.35*kk); OWN.GU.ring(c,p,0,r,[225,235,245],0.85); PF(p.x-P.d*r*0.3,p.y,r*0.5,0.3,[230,240,250]); }
      for(let i=0;i<5;i++){ const q=OWN.GU.path(a,h,Math.max(0,k-0.1-i*0.05),P.R,0.05); OWN.DR.tear(c,q.x,q.y+(atH(i)-0.5)*P.S,P.S*0.08,P.d>0?Math.PI:0,[200,230,255],0.6); } },
    land(c,PF,k,P,x,a,h,t){ for(let j=0;j<3;j++){ const q=Math.max(0,k-j*0.12); if(q<=0||q>=1) continue; OWN.GU.ring(c,{x:h.x+P.d*q*P.R*0.8,y:h.y},0,P.R*(0.6+0.8*q),[225,235,245],0.8*(1-q)); } OWN.GU.burst(c,PF,h,P.R,k,[230,240,250],5); } },
  "Dust Jet":{at:[1.0,0.7],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<3;i++) PF(a.x+P.d*P.S*0.3*i*k,a.y,P.S*(0.3+0.2*i),0.5*k,[190,175,150]); },
    fly(c,PF,k,P,x,a,h,t){ for(let j=0;j<12;j++){ const kk=Math.max(0,k-j*0.04), q=OWN.GU.path(a,h,kk,P.R,0.05,P.S*0.2,t,j); PF(q.x,q.y,P.S*(0.3+0.04*(12-j)),0.65,j%3?[190,175,150]:[160,145,125]); }
      OWN.GU.ride(5,a,h,k,t,P,(q,i)=>OWN.GU.dust(c,q.x,q.y,P.S*0.22,t+i*30),0.6,0.07,0.1,0.3); OWN.GU.ride(6,a,h,k,t,P,(q,i)=>{ c.fillStyle="#6a5a48"; c.fillRect(q.x-2,q.y-2,4,4); },0.9,0.04); },
    land(c,PF,k,P,x,a,h,t){ for(let i=0;i<8;i++) PF(h.x+P.d*P.R*(0.2+1.0*eo(k))+(atH(i)-0.5)*P.R,h.y+(atH(i*3)-0.5)*P.R*1.3,P.S*(0.5+0.4*k),0.6*(1-k),[190,175,150]); OWN.GU.scatter(3,h,P.R,k,(q,i)=>OWN.GU.dust(c,q.x,q.y,P.S*0.2,t+i*40,1-k));
      if(k<0.6) for(let i=0;i<2;i++){ c.fillStyle=`rgba(60,50,40,${0.8*(1-k/0.6)})`; c.beginPath(); c.arc(P.tg.x+(i-0.5)*P.R*0.5,P.tg.y-P.R*0.2,P.R*0.08,0,7); c.fill(); } } },
  "Air Blade":{at:[1.0,0.5],
    wind(c,PF,t,P,x,a){ const k=t/120; OWN.GU.disc(c,a,P.S*0.7*k,t,[210,230,245],0.8); },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.GU.path(a,h,k,P.R,0.1); OWN.GU.disc(c,p,P.S*1.0,t,[200,225,245],0.9); for(let j=1;j<6;j++){ const q=OWN.GU.path(a,h,Math.max(0,k-j*0.05),P.R,0.1); PF(q.x,q.y,P.S*(0.4-j*0.05),0.5,[225,240,250]); }
      for(let i=0;i<4;i++){ const an=t/25+i*1.57; c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=1.5; c.beginPath(); c.ellipse(p.x,p.y,P.S*1.15,P.S*0.5,0,an,an+0.6); c.stroke(); } },
    land(c,PF,k,P,x,a,h,t){ if(k<0.35) OWN.GU.disc(c,{x:h.x+P.d*P.R*0.4*k,y:h.y},P.S*1.0*(1-k),t,[200,225,245],1-k/0.35); OWN.GU.slash(c,h,P.R,k,[200,225,245],0,1.4); for(let i=0;i<8;i++){ const an=i/8*7; c.fillStyle=`rgba(255,255,230,${1-k})`; c.beginPath(); c.arc(h.x+Math.cos(an)*P.R*(0.3+eo(k)*0.8),h.y+Math.sin(an)*P.R*(0.3+eo(k)*0.8),2,0,7); c.fill(); } } },
  "Wing Gust":{at:[0.7,0.35],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<3;i++) OWN.GU.feather(c,a.x-P.d*P.S*0.3*i,a.y+P.S*0.4*k*i,P.S*0.3,(P.d>0?0:Math.PI)+t/60+i,[245,240,230]); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[250,250,245],4,0.55,0.5,0.55); const p=OWN.GU.path(a,h,k,P.R,0.2); OWN.GU.crescent(c,p,P.d>0?0:Math.PI,P.S*1.6,[240,240,235],0.7,0.4);
      OWN.GU.ride(9,a,h,k,t,P,(q,i)=>OWN.GU.feather(c,q.x,q.y,P.S*0.3,(P.d>0?0:Math.PI)+Math.sin(t/50+i)*0.8,i%3?[245,240,230]:[120,85,55]),0.8,0.05); },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.burst(c,PF,h,P.R,k,[250,250,245],8); OWN.GU.scatter(8,h,P.R,k,(q,i)=>OWN.GU.feather(c,q.x,q.y+k*P.R*0.5,P.S*0.28,k*6+i,i%3?[245,240,230]:[120,85,55],1-k)); } },
  "Wing Flap":{at:[0.8,0.35],
    wind(c,PF,t,P,x,a){ const k=t/120; PF(a.x,a.y,P.S*(0.5+0.4*k),0.5*k,[60,30,60]); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[80,40,80],3,0.5,0.55,0.55); OWN.GU.ride(6,a,h,k,t,P,(q,i)=>OWN.GU.bat(c,q.x,q.y,P.S*0.35,t+i*40,[40,15,40]),0.7,0.07);
      for(let i=0;i<5;i++){ const q=OWN.GU.path(a,h,Math.max(0,k-i*0.08),P.R,0.25); c.fillStyle=`rgba(200,30,50,${0.8*(1-i/5)})`; c.beginPath(); c.arc(q.x,q.y+P.S*0.3,P.S*0.05,0,7); c.fill(); } },
    land(c,PF,k,P,x,a,h,t){ for(let i=0;i<6;i++) PF(h.x+P.d*P.R*(0.2+0.8*eo(k))+(atH(i)-0.5)*P.R,h.y+(atH(i*3)-0.5)*P.R,P.S*0.5,0.6*(1-k),[60,25,55]); OWN.GU.scatter(6,h,P.R,k,(q,i)=>OWN.GU.bat(c,q.x,q.y-k*P.R*1.4,P.S*0.32,t+i*30,[40,15,40],1-k)); } },
  "Wind Slice":{at:[0.1,0.3],inside:true,
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<3;i++){ const an=-Math.PI/2+(i-1)*0.6; OWN.fire(c,a.x+Math.cos(an)*P.S*0.6,a.y+Math.sin(an)*P.S*0.6,P.S*0.6*k,"rgba(90,170,255,.85)","rgba(220,240,255,.95)",t,i); } },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.GU.path(a,h,k,P.R,0.5); OWN.GU.stream(c,PF,a,h,k,t,P,[150,200,255],2,0.4,0.4,0.4); OWN.GU.crescent(c,p,P.d>0?0:Math.PI,P.S*1.2,[110,180,255],0.85,0.3);
      OWN.GU.ride(3,a,h,k,t,P,(q,i)=>OWN.fire(c,q.x,q.y+P.S*0.3,P.S*0.5,"rgba(90,170,255,.85)","rgba(220,240,255,.95)",t,i),0.6,0.1,0.5); OWN.GU.ride(5,a,h,k,t,P,(q,i)=>OWN.drawProp(c,x,"leaf",q.x,q.y,t/40+i,P.S*0.35,1,t),0.8,0.06); },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.slash(c,h,P.R,k,[110,180,255],-0.4,1.4); OWN.GU.scatter(3,h,P.R,k,(q,i)=>OWN.fire(c,q.x,q.y,P.S*0.5*(1-k),"rgba(90,170,255,.85)","rgba(220,240,255,.95)",t,i)); OWN.GU.scatter(5,h,P.R,k,(q,i)=>OWN.drawProp(c,x,"leaf",q.x,q.y+k*P.R,k*6+i,P.S*0.3,1-k,t),3); } },
  "Fan Gust":{at:[0.95,0.4],
    wind(c,PF,t,P,x,a){ const k=t/120; OWN.GU.fan(c,a,P.S*0.9,(P.d>0?-0.8:Math.PI+0.8)+k*P.d*1.2); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.fan(c,a,P.S*0.9,(P.d>0?0.4:Math.PI-0.4)); OWN.GU.stream(c,PF,a,h,k,t,P,[235,245,235],5,0.45,0.5,0.55); OWN.GU.ride(10,a,h,k,t,P,(q,i)=>OWN.drawProp(c,x,"leaf",q.x,q.y,t/40+i,P.S*0.38,1,t),0.9,0.04);
      const p=OWN.GU.path(a,h,k,P.R,0.1); c.strokeStyle="rgba(255,255,255,.85)"; c.lineWidth=3; for(let i=-2;i<=2;i++){ c.beginPath(); c.arc(a.x,a.y,Math.abs(p.x-a.x),(P.d>0?0:Math.PI)+i*0.12-0.04,(P.d>0?0:Math.PI)+i*0.12+0.04); c.stroke(); } },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.burst(c,PF,h,P.R,k,[235,245,235],9); OWN.GU.scatter(10,h,P.R,k,(q,i)=>OWN.drawProp(c,x,"leaf",q.x,q.y,k*6+i,P.S*0.35,1-k,t)); } },
  "Breeze Cut":{at:[0.95,0.4],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<5;i++){ const an=i/5*7+t/40; OWN.GU.petal(c,a.x+Math.cos(an)*P.S*0.6*k,a.y+Math.sin(an)*P.S*0.4*k,P.S*0.14,an); } },
    fly(c,PF,k,P,x,a,h,t){ for(let i=0;i<3;i++){ const kk=Math.min(1,k*1.2-i*0.1); if(kk<0) continue; const aa={x:a.x,y:a.y+(i-1)*P.S*0.5}, hh={x:h.x,y:h.y+(i-1)*P.R*0.3}, p=OWN.GU.path(aa,hh,kk,P.R,0.1); OWN.GU.crescent(c,p,P.d>0?0:Math.PI,P.S*0.75,[255,220,235],0.85,0.2); }
      OWN.GU.ride(14,a,h,k,t,P,(q,i)=>OWN.GU.petal(c,q.x,q.y,P.S*0.15,t/30+i),0.8,0.04,0.1); },
    land(c,PF,k,P,x,a,h,t){ for(let i=0;i<3;i++) OWN.GU.slash(c,{x:h.x,y:h.y+(i-1)*P.R*0.3},P.R,Math.max(0,k-i*0.06),[255,180,210],-0.2+i*0.2,1.0); OWN.GU.scatter(12,h,P.R,k,(q,i)=>OWN.GU.petal(c,q.x,q.y+k*P.R*0.6,P.S*0.15,k*8+i,[255,190,210],1-k)); } },
  "Mountain Wind":{at:[0.95,0.4],
    wind(c,PF,t,P,x,a){ const k=t/120; OWN.GU.fan(c,a,P.S*1.0,(P.d>0?-1:Math.PI+1)+k*P.d*1.6); for(let i=0;i<3;i++) PF(a.x,a.y+P.S*0.5,P.S*0.5,0.4*k,[220,225,230]); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[220,228,235],6,0.4,0.6,0.65); const p=OWN.GU.path(a,h,k,P.R,0.2); for(let i=0;i<3;i++) OWN.GU.curl(c,{x:p.x-P.d*P.S*0.6*i,y:p.y+(i-1)*P.R*0.4},P.S*0.7,P.d>0?0:Math.PI,[245,248,250],0.85,t+i*40);
      OWN.GU.ride(8,a,h,k,t,P,(q,i)=>i%2?OWN.GU.needle(c,q.x,q.y,P.S*0.3,t/30+i):OWN.GU.flake(c,q.x,q.y,P.S*0.12,t/40+i),0.9,0.05); OWN.GU.ride(4,a,h,k,t,P,(q,i)=>OWN.DR.clod(c,q.x,q.y+P.S*0.4,P.S*0.12,[130,120,110],t/30+i,i),0.6,0.08,0.05); },
    land(c,PF,k,P,x,a,h,t){ for(let i=0;i<10;i++) PF(h.x+P.d*P.R*(0.2+1.3*eo(k))+(atH(i)-0.5)*P.R*0.8,h.y+(atH(i*3)-0.5)*P.R*1.6,P.S*(0.5+0.4*k),0.6*(1-k),[225,232,238]); OWN.GU.burst(c,PF,h,P.R*1.2,k,[235,240,245],8); OWN.GU.scatter(8,h,P.R,k,(q,i)=>i%2?OWN.GU.needle(c,q.x,q.y,P.S*0.3,k*8+i,1-k):OWN.GU.flake(c,q.x,q.y,P.S*0.12,k*8+i,1-k)); } },
  "Fan Slash":{at:[0.95,0.4],
    wind(c,PF,t,P,x,a){ const k=t/120; OWN.GU.fan(c,{x:a.x,y:a.y-P.S*0.5*k},P.S*0.9,-Math.PI/2+(P.d>0?-0.5:0.5)*(1-k)); },
    fly(c,PF,k,P,x,a,h,t){ const sw=(P.d>0?-1.2:Math.PI+1.2)+P.d*eo(Math.min(1,k*2))*2.4; OWN.GU.fan(c,a,P.S*0.9,sw); const p=OWN.GU.path(a,h,k,P.R,0.05);
      c.save(); c.translate(p.x,p.y); c.rotate(P.d>0?0:Math.PI); c.fillStyle="rgba(235,250,240,.8)"; c.beginPath(); c.moveTo(0,0); c.arc(-P.S*1.2,0,P.S*1.4,-0.5,0.5); c.closePath(); c.fill(); c.strokeStyle="rgba(120,180,140,.9)"; c.lineWidth=1.5; for(let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(-P.S*1.2+Math.cos(i*0.14)*P.S*0.3,Math.sin(i*0.14)*P.S*0.3); c.lineTo(-P.S*1.2+Math.cos(i*0.14)*P.S*1.4,Math.sin(i*0.14)*P.S*1.4); c.stroke(); } c.restore();
      OWN.GU.ride(4,a,h,k,t,P,(q,i)=>OWN.drawProp(c,x,"leaf",q.x,q.y,t/30+i,P.S*0.3,1,t),0.5,0.06); },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.slash(c,h,P.R,k,[140,220,170],-0.9,1.4); OWN.GU.slash(c,{x:h.x,y:h.y+P.R*0.1},P.R,Math.max(0,k-0.1),[140,220,170],0.2,1.2); OWN.GU.scatter(6,h,P.R,k,(q,i)=>OWN.drawProp(c,x,"leaf",q.x,q.y+k*P.R,k*8+i,P.S*0.3,1-k,t)); } },
  "Sky Gale":{at:[0.5,0.3],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<4;i++) OWN.GU.feather(c,a.x+(i-1.5)*P.S*0.5,a.y-P.S*0.6*k,P.S*0.32,-Math.PI/2+(i-1.5)*0.3,[255,205,90]); atGlowA(c,a.x,a.y,P.S*1.4,[255,220,120],0.5*k); },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.GU.path(a,{x:P.tg.x,y:P.gnd},k,P.R,0.05), H=P.R*2.4, W=P.R*0.9; OWN.GU.funnel(c,PF,p.x,p.y,H,W,t,[[245,240,235],[255,230,170],[230,225,220]]);
      for(let j=0;j<12;j++){ const f=j/11, an=t/25+j*1.3, rr=W*(0.3+0.8*f); OWN.GU.feather(c,p.x+Math.cos(an)*rr,p.y-f*H+Math.sin(an)*rr*0.2,P.S*0.25,an,j%2?[255,205,90]:[230,120,50]); }
      OWN.GU.stream(c,PF,a,{x:p.x,y:p.y-H*0.5},1,t,P,[255,240,200],2,0.3,0.35,0.4); },
    land(c,PF,k,P,x,a,h,t){ const al=1-k; OWN.GU.funnel(c,PF,P.tg.x,P.gnd,P.R*2.4*(1+k*0.3),P.R*0.9*(1+k*0.5),t,[[245,240,235],[255,230,170]],al);
      OWN.GU.scatter(10,h,P.R,k,(q,i)=>OWN.GU.feather(c,q.x,q.y-k*P.R,P.S*0.25,k*8+i,i%2?[255,205,90]:[230,120,50],al)); } },
  "Wing Buffet":{at:[0.35,0.3],inside:true,
    wind(c,PF,t,P,x,a){ OWN.GU.beat(c,PF,t,P,x); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.beat(c,PF,t,P,x); for(let i=0;i<3;i++){ const kk=(t-90-i*110)/300; if(kk<0||kk>1) continue; OWN.GU.dustWall(c,PF,P,x,kk,t,i); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, tt=400+k*420; for(let i=0;i<3;i++){ const kk=(tt-90-i*110)/300; if(kk>=0&&kk<=1) OWN.GU.dustWall(c,PF,P,x,kk,t,i); }
      for(let i=0;i<12;i++) PF(P.tg.x+P.d*R*(0.1+1.3*eo(k))+(atH(i)-0.5)*R*1.3,P.gnd-R*(0.1+1.1*atH(i*3))*eo(Math.min(1,k*2)),P.S*(0.5+0.4*k),0.7*(1-k),i%3?[205,190,165]:[175,160,135]);
      OWN.MT.debris(c,{x:P.tg.x,y:P.gnd-R*0.4},R*1.2,k,[130,115,100],12,0.1,5); OWN.GU.scatter(8,h,R,k,(q,i)=>{ c.fillStyle=`rgba(255,180,80,${1-k})`; c.beginPath(); c.arc(q.x,q.y,2.6,0,7); c.fill(); });
      OWN.GU.scatter(6,h,R,k,(q,i)=>OWN.GU.needle(c,q.x,q.y+k*R*0.6,P.S*0.25,k*8+i,1-k),4);
      c.strokeStyle=`rgba(90,70,50,${0.8*(1-k)})`; c.lineWidth=2; for(const sd of [-1,1]){ c.beginPath(); for(let i=0;i<=6;i++) c.lineTo(P.tg.x+sd*i*R*0.22*eo(Math.min(1,k*3)),P.gnd+(i%2?2:-2)); c.stroke(); } } },
  "Wing Gale":{at:[0.6,0.3],
    wind(c,PF,t,P,x,a){ const k=t/120; for(let i=0;i<4;i++) OWN.GU.feather(c,a.x+(i-1.5)*P.S*0.4,a.y-P.S*0.3*k,P.S*0.3,-Math.PI/2+(i-1.5)*0.3,[230,190,90]); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[240,225,190],4,0.55,0.5,0.55); const p=OWN.GU.path(a,h,k,P.R,0.2); OWN.GU.curl(c,p,P.S*0.8,P.d>0?0:Math.PI,[255,240,200],0.85,t); OWN.GU.curl(c,{x:p.x-P.d*P.S*0.7,y:p.y+P.R*0.4},P.S*0.6,P.d>0?0:Math.PI,[255,240,200],0.7,t+60);
      OWN.GU.ride(8,a,h,k,t,P,(q,i)=>OWN.GU.feather(c,q.x,q.y,P.S*0.3,(P.d>0?0:Math.PI)+Math.sin(t/50+i)*0.9,i%2?[230,190,90]:[245,240,225]),0.8,0.05); OWN.GU.ride(10,a,h,k,t,P,(q,i)=>{ c.fillStyle="rgba(210,180,120,.9)"; c.beginPath(); c.arc(q.x,q.y,1.8,0,7); c.fill(); },0.9,0.03); },
    land(c,PF,k,P,x,a,h,t){ OWN.GU.burst(c,PF,h,P.R,k,[240,225,190],8); OWN.GU.scatter(8,h,P.R,k,(q,i)=>OWN.GU.feather(c,q.x,q.y,P.S*0.28,k*8+i,i%2?[230,190,90]:[245,240,225],1-k)); } },
  "Black Gust":{at:[0.8,0.35],
    wind(c,PF,t,P,x,a){ const k=t/120; PF(a.x,a.y,P.S*(0.5+0.5*k),0.6*k,[25,20,35]); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[30,22,45],4,0.5,0.7,0.6); const p=OWN.GU.path(a,h,k,P.R,0.2);
      for(let i=0;i<3;i++){ const q=OWN.GU.path(a,h,Math.max(0,k-i*0.12),P.R,0.2,P.S*0.3,t,i); OWN.GU.ghost(c,q.x,q.y+(i-1)*P.R*0.35,P.S*0.65,t+i*50,1-i*0.2); } },
    land(c,PF,k,P,x,a,h,t){ for(let i=0;i<7;i++) PF(h.x+P.d*P.R*(0.2+0.9*eo(k))+(atH(i)-0.5)*P.R,h.y+(atH(i*3)-0.5)*P.R*1.2,P.S*(0.5+0.3*k),0.7*(1-k),[30,22,45]); OWN.GU.scatter(3,h,P.R,k,(q,i)=>OWN.GU.ghost(c,q.x,q.y-k*P.R,P.S*0.4,t+i*40,1-k)); } },
  "Chill Draft":{at:[0.8,0.35],
    wind(c,PF,t,P,x,a){ const k=t/120; PF(a.x,a.y,P.S*(0.4+0.4*k),0.5*k,[60,80,120]); for(let i=0;i<4;i++) OWN.GU.flake(c,a.x+(i-1.5)*P.S*0.4,a.y-P.S*0.3*k,P.S*0.1,t/40+i); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[70,90,140],3,0.5,0.6,0.55); OWN.GU.stream(c,PF,a,h,k,t,P,[200,225,255],2,0.3,0.4,0.35);
      OWN.GU.ride(10,a,h,k,t,P,(q,i)=>i%3?OWN.GU.flake(c,q.x,q.y,P.S*0.11,t/30+i):OWN.GU.shard(c,q.x,q.y,P.S*0.2,(P.d>0?0:Math.PI)),0.8,0.04); },
    land(c,PF,k,P,x,a,h,t){ for(let i=0;i<6;i++) PF(h.x+P.d*P.R*(0.2+0.8*eo(k))+(atH(i)-0.5)*P.R,h.y+(atH(i*3)-0.5)*P.R,P.S*0.5,0.6*(1-k),[60,80,120]); const al=k<0.7?1:1-(k-0.7)/0.3; OWN.DR.coat(c,P,Math.min(1,k*2),[200,225,255],0.5*al,true,3,7);
      for(let i=0;i<5;i++) OWN.GU.shard(c,P.tg.x+(atH(i*3)-0.5)*P.R*1.4,P.tg.y+(atH(i*5)-0.3)*P.R,P.R*0.18*eo(Math.min(1,k*3)),-Math.PI/2+(atH(i)-0.5),al); } },
  "Gate Edge":{at:[0.9,0.4],
    wind(c,PF,t,P,x,a){ const k=Math.min(1,t/120); OWN.GU.gate(c,{x:a.x+P.d*P.S*0.4,y:a.y},P.S*1.0*eo(k),t,1); },
    fly(c,PF,k,P,x,a,h,t){ const g={x:a.x+P.d*P.S*0.4,y:a.y}; OWN.GU.gate(c,g,P.S*1.0,t,1-k*0.5); const g2={x:h.x-P.d*P.R*0.6,y:h.y}; if(k>0.3) OWN.GU.gate(c,g2,P.R*0.8*eo((k-0.3)/0.7),t,1);
      const p=OWN.GU.path(g,g2,k,P.R,0); OWN.GU.crescent(c,p,P.d>0?0:Math.PI,P.S*1.1,[190,120,255],0.9,0.2); for(let i=0;i<6;i++) OWN.star(c,p.x-P.d*P.S*(0.4+i*0.3),p.y+(atH(i)-0.5)*P.S*1.4,P.S*0.12,"rgba(230,210,255,.9)",t/40+i); },
    land(c,PF,k,P,x,a,h,t){ const g2={x:h.x-P.d*P.R*0.6,y:h.y}; if(k<0.6) OWN.GU.gate(c,g2,P.R*0.8*(1-k/0.6),t,1-k/0.6); OWN.GU.slash(c,h,P.R,k,[200,140,255],-0.3,1.5);
      for(let i=0;i<8;i++){ const an=i/8*7; OWN.star(c,h.x+Math.cos(an)*P.R*(0.4+eo(k)),h.y+Math.sin(an)*P.R*(0.4+eo(k))*0.8,P.R*0.1*(1-k),"rgba(230,210,255,.95)",k*6+i); } } }
};
Object.assign(OWN.GU,{
  /* the dragon's own wings beat three times: swoosh marks sweep down over the real wings and each stroke blasts dust off the ground under it */
  beat(c,PF,t,P,x){ const s=x.self, top=OWN.pt(s,x.target,[0.2,0.1]), sg=P.sg; for(let i=0;i<3;i++){ const q=(t-i*110)/120; if(q<0||q>1) continue;
      for(const sd of [-1,1]){ const cx=top.x+sd*P.S*0.6-P.d*P.S*0.2, cy=top.y+P.S*0.3; c.lineCap="round";
        for(let j=0;j<3;j++){ const a0=-Math.PI/2-0.2+eo(q)*1.6, r=P.S*(0.9+j*0.3); c.strokeStyle=`rgba(255,250,240,${(1-q)*(0.9-j*0.25)})`; c.lineWidth=(4-j)*(1-q*0.5); c.beginPath(); c.arc(cx,cy,r,sd>0?a0-0.9:Math.PI-a0,sd>0?a0:Math.PI-a0+0.9); c.stroke(); } }
      for(let j=0;j<6;j++){ const an=Math.PI+j/5*Math.PI; PF(s.x+Math.cos(an)*P.S*(0.6+1.4*eo(q)),sg-P.S*0.15+Math.sin(an)*P.S*0.3*eo(q),P.S*(0.3+0.35*q),0.6*(1-q),[205,190,165]); } } },
  /* one rolling wall of dust per wing beat, carrying pebbles, grass and embers along the ground to the foe */
  dustWall(c,PF,P,x,kk,t,i){ const s=x.self, x0=s.x+P.d*P.S*0.8, x1=P.tg.x+P.d*P.R*0.4, fx=x0+(x1-x0)*eo(kk), gy=P.sg+(P.gnd-P.sg)*kk, H=P.R*(1.0+0.5*Math.sin(Math.PI*kk))*(1-i*0.12), al=kk<0.85?1:1-(kk-0.85)/0.15;
    for(let j=0;j<7;j++){ const f=j/6; PF(fx-P.d*P.S*0.3*f,gy-H*f,P.S*(0.55-0.2*f),0.7*al*(1-f*0.4),j%2?[205,190,165]:[185,170,145]); }
    for(let j=0;j<4;j++) PF(fx-P.d*P.S*(0.6+j*0.5),gy-H*0.25,P.S*(0.4-j*0.06),0.45*al*(1-j/4),[200,185,160]);
    c.strokeStyle=`rgba(255,250,235,${0.7*al})`; c.lineWidth=2; c.lineCap="round"; for(let j=0;j<3;j++){ const y=gy-H*(0.2+j*0.3); c.beginPath(); c.moveTo(fx-P.d*P.S*1.6,y+3); c.quadraticCurveTo(fx-P.d*P.S*0.5,y-4,fx+P.d*P.S*0.2,y-H*0.08); c.stroke(); }
    for(let j=0;j<5;j++){ const ph=atH(j*7+i*3), up=Math.sin(Math.PI*((kk*2+ph)%1)); OWN.DR.clod(c,fx-P.d*P.S*0.5*ph,gy-H*(0.15+0.7*up*ph),P.S*(0.08+0.06*atH(j+i)),[130,115,100],t/25+j,j+i); }
    for(let j=0;j<3;j++) OWN.GU.needle(c,fx-P.d*P.S*0.4*atH(j+i),gy-H*(0.3+0.5*atH(j*3+i)),P.S*0.25,t/30+j);
    for(let j=0;j<4;j++){ const ex=fx-P.d*P.S*(0.2+0.8*atH(j*5+i)), ey=gy-H*(0.4+0.6*atH(j*9+i)); atGlowA(c,ex,ey,P.S*0.25,[255,150,60],0.55*al); c.fillStyle=`rgba(255,190,90,${al})`; c.beginPath(); c.arc(ex,ey,2.4,0,7); c.fill(); } },
  streak(c,pts,w,col,al){ if(pts.length<2) return; c.lineCap="round"; for(let j=1;j<pts.length;j++){ const f=j/(pts.length-1); c.strokeStyle=OWN.rgb(col,al*f); c.lineWidth=Math.max(0.6,w*f); c.beginPath(); c.moveTo(pts[j-1].x,pts[j-1].y); c.lineTo(pts[j].x,pts[j].y); c.stroke(); } },
  funnel(c,PF,bx,by,H,W,t,cols,al=1){ for(let j=0;j<10;j++){ const f=j/9, w=W*(0.25+0.75*f), y=by-f*H, sw=Math.sin(t/70+f*3)*W*0.15; PF(bx+sw,y,w*0.55,0.55*al,cols[j%cols.length]);
      c.strokeStyle=`rgba(255,255,255,${0.7*al})`; c.lineWidth=1.6; c.beginPath(); c.ellipse(bx+sw,y,w,w*0.22,0,((t/90)+f*2)%(Math.PI*2),((t/90)+f*2)%(Math.PI*2)+2.2); c.stroke(); } },
  bow(c,x,y,r,col){ c.fillStyle=col; c.strokeStyle="rgba(0,0,0,.35)"; c.lineWidth=1; for(const sd of [-1,1]){ c.beginPath(); c.moveTo(x,y); c.lineTo(x+sd*r,y-r*0.6); c.lineTo(x+sd*r,y+r*0.6); c.closePath(); c.fill(); OWN.ol(c); } c.beginPath(); c.arc(x,y,r*0.25,0,7); c.fill(); },
  ribbonTail(c,a,P,t,k){ c.strokeStyle="rgba(230,70,90,.95)"; c.lineWidth=2; c.beginPath(); for(let j=0;j<=10;j++){ const f=j/10; c.lineTo(a.x-P.d*f*P.S*1.4*k,a.y+f*P.S*1.0+Math.sin(f*6+t/40)*P.S*0.2); } c.stroke(); },
  fan(c,a,r,ang){ c.save(); c.translate(a.x,a.y); c.rotate(ang); c.fillStyle="#7ac07a"; c.strokeStyle="#2a6a3a"; c.lineWidth=1.4; c.beginPath(); c.moveTo(0,0); c.arc(0,0,r,-0.6,0.6); c.closePath(); c.fill(); OWN.ol(c);
    for(let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(i*0.17)*r,Math.sin(i*0.17)*r); c.stroke(); } c.fillStyle="#8a5a2a"; c.fillRect(-r*0.45,-r*0.05,r*0.45,r*0.1); c.restore(); },
  needle(c,x,y,r,rot,al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.strokeStyle=`rgba(40,110,60,${al})`; c.lineWidth=1.6; c.lineCap="round"; c.beginPath(); c.moveTo(-r,0); c.lineTo(r,0); c.moveTo(-r*0.6,0); c.lineTo(-r,-r*0.3); c.stroke(); c.restore(); },
  shard(c,x,y,r,rot,al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=`rgba(200,230,255,${0.9*al})`; c.strokeStyle=`rgba(255,255,255,${al})`; c.lineWidth=1; c.beginPath(); c.moveTo(r,0); c.lineTo(-r*0.4,-r*0.3); c.lineTo(-r*0.7,0); c.lineTo(-r*0.4,r*0.3); c.closePath(); c.fill(); OWN.ol(c); c.restore(); },
  ghost(c,x,y,r,t,al=1){ c.save(); c.translate(x,y); c.globalAlpha*=Math.max(0,al); atGlowA(c,0,0,r*1.3,[90,60,140],0.35); c.fillStyle="rgba(15,10,25,.92)"; c.beginPath(); c.arc(0,0,r*0.6,Math.PI,0); for(let i=0;i<=8;i++){ const xx=r*0.6-i/8*r*1.2; c.lineTo(xx,r*0.75+Math.sin(t/40+i*1.5)*r*0.15+(i%2?r*0.18:0)); } c.closePath(); c.fill();
    c.strokeStyle="rgba(170,140,230,.6)"; c.lineWidth=1.4; c.stroke(); for(const sd of [-1,1]){ c.beginPath(); c.moveTo(sd*r*0.55,r*0.1); c.quadraticCurveTo(sd*r*0.95,r*0.2+Math.sin(t/50+sd)*r*0.2,sd*r*0.85,r*0.5); c.stroke(); }
    c.fillStyle="#d8c8ff"; c.shadowColor="#b090ff"; c.shadowBlur=6; c.beginPath(); c.ellipse(-r*0.2,-r*0.05,r*0.1,r*0.14,0,0,7); c.ellipse(r*0.2,-r*0.05,r*0.1,r*0.14,0,0,7); c.fill(); c.shadowBlur=0;
    c.fillStyle="rgba(5,0,10,.9)"; c.beginPath(); c.ellipse(0,r*0.3,r*0.14,r*0.1+Math.abs(Math.sin(t/60))*r*0.08,0,0,7); c.fill(); c.restore(); },
  gate(c,p,r,t,al){ if(r<=1) return; c.save(); c.translate(p.x,p.y); c.scale(0.45,1); c.globalAlpha*=al; const g=c.createRadialGradient(0,0,r*0.1,0,0,r); g.addColorStop(0,"rgba(10,0,30,1)"); g.addColorStop(0.7,"rgba(70,20,130,.95)"); g.addColorStop(1,"rgba(190,120,255,.9)"); c.fillStyle=g; c.beginPath(); c.arc(0,0,r,0,7); c.fill();
    c.strokeStyle="rgba(230,200,255,.95)"; c.lineWidth=3; c.beginPath(); c.arc(0,0,r,0,7); c.stroke(); c.rotate(t/200); c.strokeStyle="rgba(200,160,255,.7)"; c.lineWidth=1.5; for(let i=0;i<3;i++){ c.beginPath(); c.arc(0,0,r*(0.4+i*0.18),i,i+3.5); c.stroke(); } c.restore(); }
});
OWN.gustFx=(c,t,x,o)=>{ OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:o.at||[0.9,0.4],sz:1.2}); P.S*=2.0; OWN.GU.d=P.d;
    const fr=OWN.pt(x.self,x.target,[1,0.5]).x, a=o.inside?P.o0:{x:fr+P.d*P.S*0.2,y:P.o0.y}, h={x:P.tg.x-P.d*P.R*0.2,y:P.tg.y-P.R*0.25};
    if(t<120){ if(o.wind) o.wind(c,PF,t,P,x,a); return; }
    if(t<400){ o.fly(c,PF,(t-120)/280,P,x,a,h,t); return; }
    o.land(c,PF,Math.min(1,(t-400)/420),P,x,a,h,t); }); };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.gust) return; const K=ANIM.gust, fx1=K.fx;
  K.fx=function(c,t,x){ const o=x&&OWN_GUST[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ OWN.gustFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN gust",x.name,e&&e.message); } } }; })();

/* ---------- wave, own versions (19 Nov 2026): every family rolled the same blue wave, so each one now has its own water (bath suds, ink,
   acid, slime, icy goo, paper, deep sea, space water) and its own riders (a rubber duck, fish, shells, tentacles, eyes, a sea serpent).
   Wind-up to 160 ms, the wave rolls 160-560, crashes at 560, drains to 1060. ---------- */
OWN.WV={
  draw(c,fx,gy,H,L,d,col,t,o={}){ if(H<2) return; const top=col[0], mid=col[1], deep=col[2], al=o.al||1; c.save(); c.translate(fx,gy); c.scale(d,1);
    if(o.shape&&o.shape!=='curl'){ OWN.WV.shape(c,o.shape,H,L,t,col,o.foam||[255,255,255],al); c.restore(); return; }
    const g=c.createLinearGradient(0,-H*1.05,0,0); g.addColorStop(0,OWN.rgb(top,al)); g.addColorStop(0.45,OWN.rgb(mid,al)); g.addColorStop(1,OWN.rgb(deep,al));
    c.fillStyle=g; c.beginPath(); c.moveTo(-L,2); c.bezierCurveTo(-L*0.6,-H*0.12,-L*0.28,-H*0.92,0,-H); c.bezierCurveTo(H*0.36,-H*1.03,H*0.52,-H*0.78,H*0.32,-H*0.56);
    c.bezierCurveTo(H*0.2,-H*0.44,H*0.12,-H*0.62,H*0.21,-H*0.67); c.bezierCurveTo(H*0.04,-H*0.52,H*0.28,-H*0.2,H*0.48,2); c.closePath(); c.fill();
    c.fillStyle=OWN.rgb(OWN.mix(deep,[0,0,0],0.25),0.55*al); c.beginPath(); c.moveTo(H*0.21,-H*0.67); c.bezierCurveTo(H*0.04,-H*0.52,H*0.28,-H*0.2,H*0.48,2); c.lineTo(H*0.1,2); c.bezierCurveTo(-H*0.02,-H*0.3,0,-H*0.6,H*0.21,-H*0.67); c.fill();
    c.strokeStyle=OWN.rgb([255,255,255],0.45*al); c.lineWidth=Math.max(1.5,H*0.035); c.lineCap="round"; for(let i=0;i<3;i++){ const f=0.25+i*0.22; c.beginPath(); c.moveTo(-L*(0.85-i*0.15),-H*f*0.3); c.bezierCurveTo(-L*0.5,-H*(f*0.5),-L*0.25,-H*(0.35+f*0.6),-H*0.08,-H*(0.5+f*0.45)); c.stroke(); }
    const fc=o.foam||[255,255,255]; c.fillStyle=OWN.rgb(fc,0.95*al); for(let i=0;i<12;i++){ const a2=i/11*2.5-0.5, rr=H*(0.07-i*0.003)*(1+0.15*Math.sin(t/50+i)); c.beginPath(); c.arc(H*0.12+Math.cos(a2)*H*0.24,-H*0.78+Math.sin(a2)*H*0.2,Math.max(1,rr),0,7); c.fill(); }
    for(let i=0;i<7;i++){ c.beginPath(); c.arc(-L*0.1-i*H*0.12,-H*(0.96-i*0.05)+Math.sin(t/60+i)*2,Math.max(1,H*(0.05-i*0.004)),0,7); c.fill(); }
    for(let i=0;i<8;i++){ const f=((t/150)+i/8)%1; c.fillStyle=OWN.rgb(fc,0.9*al*(1-f)); c.beginPath(); c.arc(H*(0.25+0.5*f)+Math.sin(i)*H*0.1,-H*(0.95+0.3*Math.sin(f*Math.PI))+f*f*H*0.5,Math.max(1,H*0.035*(1-f*0.5)),0,7); c.fill(); }
    c.fillStyle=OWN.rgb(fc,0.75*al); for(let i=0;i<10;i++){ c.beginPath(); c.ellipse(-L*(i/10)+Math.sin(t/70+i)*3,0,H*0.08,H*0.03,0,0,7); c.fill(); } c.restore(); },
  front(P,x,k){ const s=x.self, x0=s.x+P.d*(s.r||30)*0.9, x1=P.tg.x-P.d*P.R*0.55; return {x:x0+(x1-x0)*eo(k),gy:P.sg+(P.gnd-P.sg)*k}; },
  splash(c,PF,P,k,col,foam=[255,255,255],n=16){ const R=P.R, cx=P.tg.x, gy=P.gnd; for(let i=0;i<n;i++){ const an=-Math.PI*(0.1+0.8*atH(i*3)), v=R*(0.8+1.6*atH(i*5)), p={x:cx+Math.cos(an)*v*eo(k)*0.8,y:gy-R*0.4+Math.sin(an)*v*eo(k)*1.3+k*k*R*2.4}; OWN.DR.tear(c,p.x,p.y,R*(0.06+0.05*atH(i)),an+Math.PI,i%3?col:foam,1-k); }
    for(let i=0;i<8;i++) PF(cx+(atH(i)-0.5)*R*2,gy-R*(0.2+1.2*atH(i*3))*eo(Math.min(1,k*2)),P.S*(0.5+0.4*k),0.6*(1-k),foam); },
  pool(c,P,k,col,al=0.6){ const R=P.R; OWN.DR.pud(c,P.tg.x,P.gnd,R*(0.6+0.9*eo(k)),col,al*(1-k*0.5)); for(let j=0;j<2;j++){ const q=Math.max(0,k-j*0.2); c.strokeStyle=`rgba(255,255,255,${0.7*(1-q)})`; c.lineWidth=1.5; c.beginPath(); c.ellipse(P.tg.x,P.gnd+2,R*(0.7+1.1*q),R*(0.14+0.12*q),0,0,7); c.stroke(); } },
  whirl(c,cx,gy,r,t,col,al=1,arms=4){ c.save(); c.translate(cx,gy); c.scale(1,0.32); c.globalAlpha*=al; const g=c.createRadialGradient(0,0,r*0.05,0,0,r); g.addColorStop(0,OWN.rgb(OWN.mix(col,[0,0,0],0.6))); g.addColorStop(0.7,OWN.rgb(col,0.9)); g.addColorStop(1,OWN.rgb(col,0)); c.fillStyle=g; c.beginPath(); c.arc(0,0,r,0,7); c.fill();
    c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=3; c.lineCap="round"; for(let i=0;i<arms;i++){ c.beginPath(); for(let j=0;j<=20;j++){ const f=j/20, an=t/120+i*Math.PI*2/arms+f*4, rr=r*(0.1+0.85*f); c.lineTo(Math.cos(an)*rr,Math.sin(an)*rr); } c.stroke(); } c.restore(); },
  duck(c,x,y,r,rot,t){ c.save(); c.translate(x,y); c.rotate(rot+Math.sin(t/80)*0.15); c.fillStyle="#ffd23a"; c.strokeStyle="#c89a10"; c.lineWidth=1.2; c.beginPath(); c.ellipse(0,0,r,r*0.65,0,0,7); c.fill(); OWN.ol(c); c.beginPath(); c.arc(r*0.55,-r*0.6,r*0.45,0,7); c.fill(); OWN.ol(c);
    c.fillStyle="#ff8a2a"; c.beginPath(); c.moveTo(r*0.95,-r*0.6); c.lineTo(r*1.35,-r*0.5); c.lineTo(r*0.95,-r*0.4); c.fill(); c.fillStyle="#222"; c.beginPath(); c.arc(r*0.7,-r*0.72,r*0.08,0,7); c.fill(); c.strokeStyle="#c89a10"; c.beginPath(); c.arc(-r*0.1,-r*0.05,r*0.4,0.2,Math.PI-0.4); c.stroke(); c.restore(); },
  fish(c,x,y,r,rot,col,t){ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=OWN.rgb(col); c.strokeStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.4)); c.lineWidth=1; c.beginPath(); c.ellipse(0,0,r,r*0.5,0,0,7); c.fill(); OWN.ol(c);
    const w=Math.sin(t/40)*0.3; c.beginPath(); c.moveTo(-r*0.85,0); c.lineTo(-r*1.5,-r*0.5+w*r); c.lineTo(-r*1.5,r*0.5+w*r); c.closePath(); c.fill(); OWN.ol(c); c.fillStyle="#fff"; c.beginPath(); c.arc(r*0.5,-r*0.1,r*0.16,0,7); c.fill(); c.fillStyle="#111"; c.beginPath(); c.arc(r*0.54,-r*0.1,r*0.08,0,7); c.fill();
    c.strokeStyle="rgba(255,255,255,.6)"; c.beginPath(); c.arc(r*0.1,0,r*0.3,-1,1); c.stroke(); c.restore(); },
  shell(c,x,y,r,rot){ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle="#ffd6c8"; c.strokeStyle="#c08070"; c.lineWidth=1; c.beginPath(); c.moveTo(0,r*0.5); c.arc(0,r*0.5,r,Math.PI*1.15,Math.PI*1.85); c.closePath(); c.fill(); OWN.ol(c); for(let i=-2;i<=2;i++){ c.beginPath(); c.moveTo(0,r*0.5); c.lineTo(Math.sin(i*0.28)*r*0.95,r*0.5-Math.cos(i*0.28)*r*0.95); c.stroke(); } c.restore(); },
  pearl(c,x,y,r){ c.fillStyle=OWN.rg(c,x,y,r*0.1,r,[[0,"#ffffff"],[0.6,"#f0e8f8"],[1,"#c8b8d8"]],-r*0.3,-r*0.3); c.beginPath(); c.arc(x,y,r,0,7); c.fill(); },
  tentacle(c,bx,by,L,ang,t,col,al=1,w=0.16){ const pts=[]; for(let j=0;j<=12;j++){ const f=j/12, a=ang+Math.sin(t/90+f*4)*0.5*f; pts.push({x:bx+Math.cos(a)*L*f,y:by+Math.sin(a)*L*f}); } OWN.DR.rib(c,pts,L*w,L*0.03,col,al,true);
    c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.5),al); for(let j=2;j<11;j+=2){ const p=pts[j]; c.beginPath(); c.arc(p.x,p.y,L*w*0.25*(1-j/12),0,7); c.fill(); } },
  eye(c,x,y,r,t,al=1,iris="#e0c030"){ const bl=Math.abs(Math.sin(t/170+x*0.1))<0.1; c.save(); c.globalAlpha*=al; c.fillStyle="#f4f0e0"; c.beginPath(); c.ellipse(x,y,r,bl?r*0.12:r*0.75,0,0,7); c.fill(); if(!bl){ c.fillStyle=iris; c.beginPath(); c.arc(x,y,r*0.5,0,7); c.fill(); c.fillStyle="#111"; c.beginPath(); c.ellipse(x,y,r*0.12,r*0.42,0,0,7); c.fill(); } c.restore(); },
  boat(c,x,y,r,rot){ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle="#faf6ea"; c.strokeStyle="#8a8070"; c.lineWidth=1; c.beginPath(); c.moveTo(-r,0); c.lineTo(r,0); c.lineTo(r*0.6,r*0.4); c.lineTo(-r*0.6,r*0.4); c.closePath(); c.fill(); OWN.ol(c); c.beginPath(); c.moveTo(-r*0.5,0); c.lineTo(0,-r*0.9); c.lineTo(r*0.5,0); c.closePath(); c.fill(); OWN.ol(c); c.restore(); }
};
OWN.WV.std=(o)=>({ ...o,
  fly(c,PF,k,P,x,a,t){ const F=OWN.WV.front(P,x,k), H=P.R*(o.H||1.1)*1.6*(0.45+0.6*eo(k)), L=Math.min(Math.abs(F.x-x.self.x)+P.R*0.4,H*1.7); OWN.WV.trail(c,x.self.x,P.sg,F.x-P.d*L*0.8,F.gy,P,o.col,t); if(o.under) o.under(c,PF,k,P,x,F,H,t);
    OWN.WV.draw(c,F.x,F.gy,H,L,P.d,o.col,t,{foam:o.foam,al:o.al,shape:o.shape}); if(o.riders) o.riders(c,PF,k,P,x,F,H,t); },
  land(c,PF,k,P,x,a,t){ const R=P.R, H=R*(o.H||1.1)*1.7*(1-eo(Math.min(1,k*1.6))), F={x:P.tg.x-P.d*R*0.55+P.d*R*0.9*eo(Math.min(1,k*2)),gy:P.gnd}; if(H>2) OWN.WV.draw(c,F.x,F.gy,H,R*1.6,P.d,o.col,t,{foam:o.foam,al:(o.al||1)*(1-k*0.5),shape:o.shape});
    OWN.WV.splash(c,PF,P,k,o.col[1],o.foam||[255,255,255]); OWN.DR.coat(c,P,k,o.col[1],0.55*(k<0.8?1:1-(k-0.8)/0.2),true,2,6); OWN.WV.pool(c,P,k,o.col[1]); if(o.crash) o.crash(c,PF,k,P,x,t); } });
const OWN_WAVE={
  "Undertow":{at:[0.5,0.85],col:[[110,160,210],[40,80,140],[20,40,80]],
    wind(c,PF,t,P,x,a){ OWN.WV.whirl(c,a.x,P.sg,P.S*1.4*Math.min(1,t/160),t,[40,80,140]); },
    fly(c,PF,k,P,x,a,t){ const fx=a.x+(P.tg.x-a.x)*eo(k), gy=P.sg+(P.gnd-P.sg)*k; OWN.DR.rib(c,[{x:a.x,y:P.sg},{x:fx,y:gy}],P.S*0.4,P.S*0.6,[40,80,140],0.8); OWN.WV.whirl(c,fx,gy,P.S*(1.4+0.6*k),t,[40,80,140]);
      for(let i=0;i<5;i++){ const q=((t/90)+i/5)%1; c.fillStyle=`rgba(220,240,255,${1-q})`; c.beginPath(); c.arc(fx+(atH(i)-0.5)*P.S*2,gy-q*P.S*1.4,2+2*atH(i*3),0,7); c.fill(); } },
    land(c,PF,k,P,x,a,t){ const R=P.R; OWN.WV.whirl(c,P.tg.x,P.gnd,R*(1.5-0.4*k),t*1.5,[40,80,140],1-k*0.5,5); for(let i=0;i<4;i++){ const an=-Math.PI/2+(i-1.5)*0.5; OWN.WV.tentacle(c,P.tg.x+(i-1.5)*R*0.45,P.gnd,R*(0.6+0.8*Math.sin(Math.min(1,k*2)*Math.PI)),an,t+i*60,[60,110,180],0.85*(1-k*0.6),0.14); }
      for(let i=0;i<8;i++){ const q=((k*2)+i/8)%1; c.fillStyle=`rgba(220,240,255,${(1-q)*(1-k)})`; c.beginPath(); c.arc(P.tg.x+(atH(i)-0.5)*R*1.8,P.gnd-q*R*1.6,2.5,0,7); c.fill(); } OWN.DR.coat(c,P,Math.min(1,k*1.5),[60,110,180],0.45*(1-k*0.5),true,2,6); } },
  "Riptide":OWN.WV.std({shape:"chop",at:[0.6,0.85],col:[[150,210,240],[50,130,200],[25,70,130]],H:0.8,
    wind(c,PF,t,P,x,a){ OWN.WV.whirl(c,a.x,P.sg,P.S*1.1*Math.min(1,t/160),t*2,[50,130,200],1,3); },
    riders(c,PF,k,P,x,F,H,t){ for(let i=0;i<3;i++){ const pts=[]; for(let j=0;j<=12;j++){ const f=j/12; pts.push({x:F.x-P.d*(1-f)*H*2.4,y:F.gy-H*0.3-Math.sin(f*Math.PI*2+t/40+i*2)*H*0.25-i*H*0.12}); } OWN.GU.streak(c,pts,H*0.08,[230,250,255],0.9); }
      OWN.WV.whirl(c,F.x-P.d*H*0.6,F.gy,H*0.7,t*2,[50,130,200],0.8,3); } }),
  "Cold Goo":OWN.WV.std({shape:"jag",at:[0.7,0.6],col:[[230,248,255],[160,215,245],[90,150,210]],foam:[245,252,255],H:0.9,
    wind(c,PF,t,P,x,a){ OWN.DR.pud(c,a.x,P.sg,P.S*(0.5+0.8*t/160),[160,215,245],0.85); for(let i=0;i<3;i++) OWN.GU.flake(c,a.x+(i-1)*P.S*0.6,P.sg-P.S*0.4,P.S*0.12,t/40+i); },
    riders(c,PF,k,P,x,F,H,t){ for(let i=0;i<5;i++) OWN.GU.shard(c,F.x-P.d*H*(0.2+i*0.35),F.gy-H*(0.4+0.4*atH(i)),H*0.14,-Math.PI/2+(atH(i*3)-0.5),0.95); for(let i=0;i<4;i++) OWN.GU.flake(c,F.x-P.d*H*i*0.4,F.gy-H*(1.0+0.2*atH(i)),H*0.07,t/40+i); },
    crash(c,PF,k,P,x,t){ const al=k<0.8?1:1-(k-0.8)/0.2; for(let i=0;i<6;i++) OWN.GU.shard(c,P.tg.x+(atH(i*3)-0.5)*P.R*1.6,P.tg.y+(atH(i*5)-0.2)*P.R,P.R*0.22*eo(Math.min(1,k*3)),-Math.PI/2+(atH(i)-0.5),al); } }),
  "Acid Flood":OWN.WV.std({shape:"swell",at:[0.7,0.6],col:[[220,255,150],[140,220,50],[60,120,20]],foam:[230,255,190],
    riders(c,PF,k,P,x,F,H,t){ OWN.DR.pops(c,{x:F.x-P.d*H*0.5,y:F.gy-H*0.5},H*0.9,(t/600)%1,[200,250,120],6,3); for(let i=0;i<3;i++) OWN.DR.curl(c,F.x-P.d*H*(0.3+i*0.5),F.gy-H*0.9,H*0.7,t+i*60,[210,240,170],0.7); },
    crash(c,PF,k,P,x,t){ for(let i=0;i<6;i++) OWN.DR.curl(c,P.tg.x+(i-2.5)*P.R*0.32,P.gnd-P.R*0.1,P.R*(1.1+0.5*atH(i)),t+i*55,[205,245,160],0.8*(1-k)); OWN.DR.pops(c,{x:P.tg.x,y:P.tg.y},P.R,k,[180,240,90],7,11); } }),
  "Ink Flood":OWN.WV.std({shape:"tube",at:[0.5,0.1],col:[[90,80,130],[40,32,70],[15,12,30]],foam:[200,195,230],
    wind(c,PF,t,P,x,a){ for(let i=0;i<3;i++) OWN.DR.tear(c,a.x+(i-1)*P.S*0.4,a.y+P.S*0.5*(t/160),P.S*0.14,Math.PI/2,[34,28,50]); },
    riders(c,PF,k,P,x,F,H,t){ c.save(); c.strokeStyle="rgba(170,160,230,.6)"; c.lineWidth=2; for(let i=0;i<3;i++){ c.beginPath(); for(let j=0;j<=14;j++){ const f=j/14; c.lineTo(F.x-P.d*f*H*1.8,F.gy-H*(0.3+i*0.2)+Math.sin(f*10+t/40+i)*H*0.05); } c.stroke(); } c.restore();
      for(let i=0;i<6;i++){ const q=((t/200)+i/6)%1; OWN.DR.tear(c,F.x+P.d*H*0.3+P.d*q*H*0.6,F.gy-H*(1.0-q*0.6),H*0.05,P.d>0?0.3:Math.PI-0.3,[34,28,50],1-q); } },
    crash(c,PF,k,P,x,t){ const h={x:P.tg.x,y:P.tg.y}, g=eo(Math.min(1,k*5)), al=k<0.7?1:1-(k-0.7)/0.3; c.fillStyle=`rgba(30,26,60,${0.85*al})`; for(const sd of [-1,1]) for(let i=0;i<5;i++){ c.beginPath(); c.ellipse(h.x+sd*P.R*(0.1+0.5*atH(i))*g,h.y+(atH(i*3)-0.5)*P.R*g,P.R*(0.1+0.14*atH(i*5))*g,P.R*(0.08+0.1*atH(i*7))*g,sd,0,7); c.fill(); } } }),
  "Slime Wave":OWN.WV.std({shape:"swell",at:[0.9,0.9],col:[[200,255,235],[110,225,190],[50,150,120]],foam:[230,255,245],H:0.9,
    wind(c,PF,t,P,x,a){ OWN.DR.pud(c,a.x,P.sg,P.S*(0.4+0.9*t/160),[110,225,190],0.85); },
    riders(c,PF,k,P,x,F,H,t){ for(let i=0;i<6;i++) OWN.star(c,F.x-P.d*H*(0.2+atH(i)*1.6),F.gy-H*(0.2+0.7*atH(i*3)),H*0.08,"rgba(255,255,255,.95)",t/40+i); OWN.DR.rib(c,[{x:x.self.x,y:P.sg},{x:F.x,y:F.gy}],P.S*0.18,P.S*0.3,[110,225,190],0.8); },
    crash(c,PF,k,P,x,t){ OWN.DR.rise(c,P.tg.x,P.gnd+2,P.R*1.05,P.R*1.3*eo(Math.min(1,k*1.8)),[110,225,190],0.65*(1-k*0.6),t); } }),
  "Flap Dance":{at:[0.5,0.5],
    wind(c,PF,t,P,x,a){ for(let i=0;i<4;i++){ const an=i/4*Math.PI*2+t/30; OWN.GU.plane(c,a.x+Math.cos(an)*P.S*1.1,a.y+Math.sin(an)*P.S*0.5,P.S*0.3,an+Math.PI/2); } },
    fly(c,PF,k,P,x,a,t){ const F=OWN.WV.front(P,x,k), H=P.R*1.5*(0.5+0.65*eo(k)); for(let j=0;j<9;j++){ const f=j/8, xx=F.x-P.d*f*H*2.2, yy=F.gy-Math.sin((1-f)*Math.PI*0.9)*H*(1-f*0.3); c.save(); c.translate(xx,yy); c.rotate(P.d*(f-0.5)*1.2+Math.sin(t/50+j)*0.15);
        c.fillStyle=j%2?"#f6f1e2":"#dfe9f6"; c.strokeStyle="#8a8478"; c.lineWidth=1.2; c.beginPath(); c.moveTo(-H*0.2,H*0.12); c.lineTo(0,-H*0.22); c.lineTo(H*0.2,H*0.12); c.closePath(); c.fill(); OWN.ol(c); c.beginPath(); c.moveTo(0,-H*0.22); c.lineTo(0,H*0.12); c.stroke(); c.restore(); }
      for(let i=0;i<5;i++) OWN.WV.boat(c,F.x-P.d*H*(0.2+i*0.4),F.gy-H*(0.9-i*0.12)+Math.sin(t/60+i)*3,H*0.13,Math.sin(t/70+i)*0.3); for(let i=0;i<6;i++){ const f=((t/180)+i/6)%1; OWN.GU.scrap(c,F.x+P.d*f*H*0.6,F.gy-H*(1.1-f*0.4),H*0.08,t/30+i); } },
    land(c,PF,k,P,x,a,t){ OWN.GU.burst(c,PF,{x:P.tg.x,y:P.tg.y},P.R,k,[245,240,230],8); OWN.GU.scatter(14,{x:P.tg.x,y:P.tg.y},P.R,k,(q,i)=>i%3?OWN.GU.scrap(c,q.x,q.y,P.S*0.22,k*8+i,[246,241,226],1-k):OWN.WV.boat(c,q.x,q.y,P.S*0.25,k*6+i)); } },
  "Deep Swirl":{at:[0.9,0.4],
    wind(c,PF,t,P,x,a){ for(let i=0;i<4;i++){ const q=((t/80)+i/4)%1; c.strokeStyle=`rgba(220,240,255,${1-q})`; c.lineWidth=1.4; c.beginPath(); c.arc(a.x+P.d*q*P.S,a.y-q*P.S*0.5,2+q*4,0,7); c.stroke(); } },
    fly(c,PF,k,P,x,a,t){ const p=OWN.GU.path(a,{x:P.tg.x,y:P.tg.y},k,P.R,0.2), r=P.S*(0.6+0.8*k); c.save(); c.translate(p.x,p.y); for(let i=0;i<4;i++){ c.strokeStyle=`rgba(${60+i*40},${130+i*30},${210},.85)`; c.lineWidth=r*0.18; c.beginPath(); for(let j=0;j<=24;j++){ const f=j/24, an=t/60+i*1.57+f*5, rr=r*(0.15+0.85*f); c.lineTo(Math.cos(an)*rr,Math.sin(an)*rr*0.8); } c.stroke(); }
      c.fillStyle="rgba(20,50,100,.85)"; c.beginPath(); c.arc(0,0,r*0.2,0,7); c.fill(); c.restore(); for(let i=0;i<8;i++){ const an=t/50+i*0.8; c.strokeStyle="rgba(230,245,255,.9)"; c.lineWidth=1.2; c.beginPath(); c.arc(p.x+Math.cos(an)*r*1.1,p.y+Math.sin(an)*r*0.85,2+2*atH(i),0,7); c.stroke(); } },
    land(c,PF,k,P,x,a,t){ const R=P.R; OWN.WV.whirl(c,P.tg.x,P.tg.y,R*(1.3-0.3*k),t*1.6,[50,110,190],1-k*0.6,4); OWN.DR.coat(c,P,k,[80,150,220],0.5*(1-k*0.5),true,2,6); for(let i=0;i<10;i++){ const q=((k*2)+i/10)%1; c.strokeStyle=`rgba(230,245,255,${(1-q)*(1-k)})`; c.lineWidth=1.3; c.beginPath(); c.arc(P.tg.x+(atH(i)-0.5)*R*1.6,P.tg.y+R*0.4-q*R*1.6,2+2*atH(i*3),0,7); c.stroke(); } } },
  "Warm Soak":OWN.WV.std({shape:"chop",at:[0.6,0.2],col:[[255,240,230],[170,215,240],[100,160,210]],foam:[255,255,255],H:0.9,
    wind(c,PF,t,P,x,a){ for(let i=0;i<4;i++){ const q=((t/90)+i/4)%1; PF(a.x+(i-1.5)*P.S*0.4,a.y-q*P.S,P.S*0.3*(1+q),0.5*(1-q),[245,245,245]); } },
    riders(c,PF,k,P,x,F,H,t){ for(let i=0;i<4;i++){ const q=((t/220)+i/4)%1; PF(F.x-P.d*H*(0.2+i*0.4),F.gy-H*(1.0+q*0.8),H*0.25*(1+q),0.5*(1-q),[248,248,248]); } OWN.WV.duck(c,F.x-P.d*H*0.4,F.gy-H*1.0,H*0.18,0,t);
      for(let i=0;i<6;i++){ const b={x:F.x-P.d*H*(0.1+atH(i)*1.2),y:F.gy-H*(0.3+0.6*atH(i*3))}; OWN.bubble(c,b.x,b.y,H*0.06*(1+atH(i*5)),[230,245,255],true); } },
    crash(c,PF,k,P,x,t){ for(let i=0;i<5;i++){ const q=((k*1.4)+i/5)%1; PF(P.tg.x+(atH(i)-0.5)*P.R*1.4,P.tg.y-P.R*0.6-q*P.R*1.4,P.S*(0.35+0.45*q),0.55*(1-k)*(1-q),[248,248,248]); } const dk=Math.min(1,k*1.5); OWN.WV.duck(c,P.tg.x+P.d*P.R*0.2,P.head.y-P.R*0.15-Math.sin(dk*Math.PI)*P.R*0.4,P.R*0.2,0,t); } }),
  "Tidal Wave":OWN.WV.std({at:[0.6,0.2],col:[[230,245,255],[110,180,235],[40,100,180]],H:1.45,
    riders(c,PF,k,P,x,F,H,t){ for(let i=0;i<10;i++){ const b={x:F.x-P.d*H*(atH(i)*1.4),y:F.gy-H*(0.75+0.35*atH(i*3))}; OWN.bubble(c,b.x,b.y,H*0.05*(1+atH(i*5)),[235,248,255],true); } },
    crash(c,PF,k,P,x,t){ for(let i=0;i<12;i++){ const an=-Math.PI*0.9+i/11*Math.PI*0.8, v=P.R*(0.8+1.4*atH(i)); OWN.bubble(c,P.tg.x+Math.cos(an)*v*eo(k),P.tg.y+Math.sin(an)*v*eo(k),P.R*0.08*(1-k*0.5),[235,248,255],true); } } }),
  "Bath Flood":{at:[0.6,0.2],
    wind(c,PF,t,P,x,a){ const k=t/160; OWN.DR.rib(c,[{x:a.x,y:a.y},{x:a.x+P.d*P.S*0.3,y:a.y+P.S*0.4},{x:a.x+P.d*P.S*0.4,y:P.sg}],P.S*0.3,P.S*0.45,[120,185,240],0.85); OWN.DR.pud(c,a.x+P.d*P.S*0.4,P.sg,P.S*(0.4+0.9*k),[120,185,240],0.8); },
    fly(c,PF,k,P,x,a,t){ const fx=x.self.x+(P.tg.x+P.d*P.R*0.4-x.self.x)*eo(k), gy0=P.sg, gy1=P.gnd, Hh=P.R*0.35; c.fillStyle="rgba(120,185,240,.85)"; c.beginPath(); c.moveTo(x.self.x-P.d*P.S,gy0+2); for(let j=0;j<=14;j++){ const f=j/14, xx=x.self.x-P.d*P.S+(fx-x.self.x+P.d*P.S)*f, gy=gy0+(gy1-gy0)*f*k; c.lineTo(xx,gy-Hh*(0.6+0.4*Math.sin(f*12-t/40))*(f<0.92?1:(1-f)*12)); } c.lineTo(fx,gy0+(gy1-gy0)*k+2); c.closePath(); c.fill();
      for(let i=0;i<8;i++) OWN.bubble(c,x.self.x+(fx-x.self.x)*atH(i),gy0+(gy1-gy0)*k*atH(i)-Hh*(0.8+0.5*atH(i*3)),P.S*0.12*(1+atH(i*5)),[235,248,255],true); OWN.WV.duck(c,fx-P.d*P.S*0.6,gy0+(gy1-gy0)*k-Hh*1.1,P.S*0.35,0,t); OWN.DR.rib(c,[{x:a.x,y:a.y},{x:a.x+P.d*P.S*0.3,y:a.y+P.S*0.4},{x:a.x+P.d*P.S*0.4,y:P.sg}],P.S*0.3,P.S*0.45,[120,185,240],0.85*(1-k)); },
    land(c,PF,k,P,x,a,t){ const R=P.R, up=eo(Math.min(1,k*1.6)); OWN.DR.rise(c,P.tg.x,P.gnd+2,R*1.3,R*1.0*up*(1-k*0.6),[120,185,240],0.7,t); for(let i=0;i<10;i++) OWN.bubble(c,P.tg.x+(atH(i)-0.5)*R*2.2,P.gnd-R*(0.4+1.0*atH(i*3))*up,R*0.08*(1+atH(i*5)),[235,248,255],true);
      OWN.WV.duck(c,P.tg.x-P.d*R*0.3,P.gnd-R*1.0*up*(1-k*0.6)-R*0.15,R*0.22,0,t); OWN.WV.pool(c,P,k,[120,185,240]); } },
  "Drench":{at:[0.5,0.2],
    wind(c,PF,t,P,x,a){ OWN.WV.tentacle(c,a.x,a.y,P.S*1.6*Math.min(1,t/160),-Math.PI/2+P.d*0.3,t,x.body||[200,150,60],1,0.18); },
    fly(c,PF,k,P,x,a,t){ const hd={x:P.tg.x,y:P.head.y-P.R*0.8}, p=OWN.GU.path(a,hd,k,P.R,0.8); OWN.WV.tentacle(c,a.x,a.y,Math.hypot(p.x-a.x,p.y-a.y)+P.S*0.3,Math.atan2(p.y-a.y,p.x-a.x),t,x.body||[200,150,60],1,0.12);
      c.fillStyle="rgba(110,180,240,.9)"; c.beginPath(); c.ellipse(p.x,p.y-P.S*0.3,P.S*0.9,P.S*0.45,0,0,7); c.fill(); OWN.DR.wblob(c,p.x,p.y-P.S*0.45,P.S*0.8,[110,180,240],t,0.8); },
    land(c,PF,k,P,x,a,t){ const R=P.R, hd={x:P.tg.x,y:P.head.y}; if(k<0.35){ const q=k/0.35; for(let i=0;i<5;i++) OWN.DR.rib(c,[{x:hd.x+(i-2)*R*0.25,y:hd.y-R*0.8},{x:hd.x+(i-2)*R*0.3,y:hd.y-R*0.8+R*1.8*eo(q)}],R*0.22,R*0.14,[110,180,240],0.85*(1-q*0.5)); }
      OWN.DR.coat(c,P,k,[110,180,240],0.55*(k<0.8?1:1-(k-0.8)/0.2),true,2.4,7); OWN.WV.splash(c,PF,P,k,[110,180,240]); OWN.WV.pool(c,P,k,[110,180,240]); } },
  "Big Wave":OWN.WV.std({at:[0.5,0.3],col:[[200,235,250],[60,140,210],[20,60,130]],H:1.55,
    riders(c,PF,k,P,x,F,H,t){ for(let i=0;i<3;i++) OWN.WV.tentacle(c,F.x-P.d*H*(0.4+i*0.5),F.gy-H*0.2,H*(0.7+0.2*i),-Math.PI/2+P.d*(0.4-i*0.2),t+i*70,x.body||[200,150,60],0.95,0.14); },
    crash(c,PF,k,P,x,t){ if(k<0.6) for(let i=0;i<2;i++) OWN.WV.tentacle(c,P.tg.x+(i-0.5)*P.R*0.9,P.gnd,P.R*1.5*(1-k/0.6),-Math.PI/2+(i-0.5)*0.6,t+i*80,x.body||[200,150,60],1-k/0.6,0.14); } }),
  "Rip Current":{at:[0.6,0.85],
    wind(c,PF,t,P,x,a){ for(let i=0;i<3;i++) OWN.WV.fish(c,a.x+Math.cos(t/40+i*2)*P.S*0.8,a.y-P.S*0.5+Math.sin(t/40+i*2)*P.S*0.3,P.S*0.18,t/40+i*2+Math.PI/2,[255,150,120],t); },
    fly(c,PF,k,P,x,a,t){ const fx=a.x+(P.tg.x-a.x)*eo(k); for(let s=0;s<3;s++){ const pts=[]; for(let j=0;j<=16;j++){ const f=j/16, xx=a.x+(fx-a.x)*f; pts.push({x:xx,y:P.sg+(P.gnd-P.sg)*f*k-P.R*(0.2+s*0.3)-Math.sin(f*Math.PI*2.5+t/40+s)*P.R*0.15}); } OWN.DR.rib(c,pts,P.S*0.25,P.S*0.45,s===1?[80,170,230]:[120,200,240],0.8,true); }
      for(let i=0;i<5;i++){ const f=((t/300)+i/5)%1, xx=a.x+(fx-a.x)*f; OWN.WV.fish(c,xx,P.sg+(P.gnd-P.sg)*f*k-P.R*(0.3+0.4*atH(i))+Math.sin(t/40+i)*4,P.S*0.2,P.d>0?0:Math.PI,[[255,150,120],[255,210,90],[150,220,255]][i%3],t); }
      for(let i=0;i<6;i++) OWN.star(c,a.x+(fx-a.x)*atH(i*5+Math.floor(t/90)),P.sg-P.R*0.8*atH(i*3),P.S*0.12,"rgba(255,255,255,.9)",t/40+i); },
    land(c,PF,k,P,x,a,t){ const R=P.R; for(let s=0;s<3;s++){ const an=t/80+s*2.1; c.strokeStyle=`rgba(120,200,240,${0.85*(1-k)})`; c.lineWidth=P.S*0.3; c.beginPath(); c.ellipse(P.tg.x,P.tg.y,R*(1.0-0.1*s),R*(0.4+0.2*s),0,an,an+3.5); c.stroke(); }
      for(let i=0;i<5;i++){ const an=t/50+i*1.26; OWN.WV.fish(c,P.tg.x+Math.cos(an)*R*1.0,P.tg.y+Math.sin(an)*R*0.5,P.S*0.2,an+Math.PI/2,[[255,150,120],[255,210,90],[150,220,255]][i%3],t); } OWN.WV.pool(c,P,k,[120,200,240]); } },
  "Swell Crash":OWN.WV.std({shape:"double",at:[0.6,0.6],col:[[210,250,245],[70,190,200],[20,110,140]],H:1.2,
    riders(c,PF,k,P,x,F,H,t){ for(let i=0;i<4;i++) OWN.WV.shell(c,F.x-P.d*H*(0.2+i*0.35),F.gy-H*(0.5+0.35*atH(i)),H*0.1,Math.sin(t/60+i)*0.5); for(let i=0;i<4;i++) OWN.WV.pearl(c,F.x-P.d*H*(0.4+i*0.3),F.gy-H*(0.8+0.15*atH(i*3)),H*0.05); },
    crash(c,PF,k,P,x,t){ OWN.GU.scatter(8,{x:P.tg.x,y:P.tg.y},P.R,k,(q,i)=>i%2?OWN.WV.shell(c,q.x,q.y,P.R*0.12,k*6+i):OWN.WV.pearl(c,q.x,q.y,P.R*0.06)); } }),
  "Tide Splash":{at:[0.2,0.8],
    wind(c,PF,t,P,x,a){ const k=t/160; OWN.WV.moon(c,x.self.x,x.self.top?x.self.top.y-P.S*1.2:a.y-P.S*2.2,P.S*0.85,k); OWN.WV.tail(c,P,x,-k*0.8,t); },
    fly(c,PF,k,P,x,a,t){ const s=x.self, my=(s.top?s.top.y:a.y-P.S*1.4)-P.S*1.2; OWN.WV.moon(c,s.x+(P.tg.x-s.x)*eo(k)*0.5,my-P.S*0.3*eo(k),P.S*0.85,1); OWN.WV.tail(c,P,x,k<0.15?-0.8+k/0.15*1.6:0.8,t);
      for(let i=0;i<3;i++){ const f0=0.05+i*0.27, q=(k-f0)/0.45; if(q<0||q>1) continue; const f=0.3+i*0.22, xx=s.x+(P.tg.x-s.x)*f, gy=P.sg+(P.gnd-P.sg)*f;
        OWN.WV.crown(c,xx,gy,P.S*(1.1+0.35*i),P.R*(1.1+0.45*i)*Math.sin(Math.min(1,q*1.3)*Math.PI),[90,160,220],t+i*40,1-Math.max(0,q-0.75)*4); OWN.WV.pool2(c,xx,gy,P.S*(1.2+0.4*i)*(0.5+q),[90,160,220],1-q*0.6); }
      for(let i=0;i<10;i++){ const f=((t/260)+i/10)%1; if(f>k) continue; const xx=s.x+(P.tg.x-s.x)*f, gy=P.sg+(P.gnd-P.sg)*f; c.fillStyle=`rgba(255,250,215,${0.7*(1-Math.abs(f-k*0.6))})`; c.beginPath(); c.ellipse(xx,gy+2,P.S*0.25,P.S*0.05,0,0,7); c.fill(); } },
    land(c,PF,k,P,x,a,t){ const R=P.R, s=x.self, my=(s.top?s.top.y:a.y-P.S*1.4)-P.S*1.5; OWN.WV.moon(c,s.x+(P.tg.x-s.x)*0.5,my,P.S*0.85,1-k); const up=Math.sin(Math.min(1,k*1.6)*Math.PI);
      OWN.WV.pool2(c,P.tg.x,P.gnd,R*(1.0+0.6*eo(k)),[90,160,220],0.85*(1-k*0.4)); OWN.WV.crown(c,P.tg.x,P.gnd,R*1.4,R*2.3*up,[90,160,220],t,1-Math.max(0,k-0.7)/0.3);
      for(let i=0;i<14;i++){ const f=((k*1.6)+atH(i))%1; if(k<0.3) break; OWN.DR.tear(c,P.tg.x+(atH(i*3)-0.5)*R*2.4,P.tg.y-R*1.4+f*R*2.2,R*0.07,Math.PI/2,[150,200,245],(1-f)*(1-k*0.6)); }
      OWN.DR.coat(c,P,k,[90,160,220],0.5*(k<0.8?1:1-(k-0.8)/0.2),true,2,6); c.fillStyle=`rgba(255,250,215,${0.8*(1-k)})`; c.beginPath(); c.ellipse(P.tg.x-R*0.2,P.gnd+2,R*0.4,R*0.07,0,0,7); c.fill(); } },
  "Serpent Tide":{at:[0.6,0.5],
    fly(c,PF,k,P,x,a,t){ const F=OWN.WV.front(P,x,k), H=P.R*1.5*(0.5+0.8*eo(k)), L=Math.min(Math.abs(F.x-x.self.x)+P.R*0.4,H*1.7); OWN.WV.trail(c,x.self.x,P.sg,F.x-P.d*L*0.8,F.gy,P,[[220,245,255],[70,150,210],[25,70,140]],t); OWN.WV.draw(c,F.x,F.gy,H,L,P.d,[[220,245,255],[70,150,210],[25,70,140]],t,{shape:"humps"}); OWN.WV.serpentHead(c,F.x+P.d*H*0.15,F.gy-H*0.95,H*0.38,P.d,t); },
    land(c,PF,k,P,x,a,t){ const R=P.R; if(k<0.45) OWN.WV.serpentHead(c,P.tg.x,P.tg.y-R*0.5+k*R*0.6,R*0.5*(1-k*0.6),P.d,t,1-k/0.45); OWN.WV.splash(c,PF,P,k,[70,150,210]); OWN.DR.coat(c,P,k,[70,150,210],0.5*(k<0.8?1:1-(k-0.8)/0.2),true,2,6); OWN.WV.pool(c,P,k,[70,150,210]); } },
  "Deep Pressure":{at:[0.6,0.4],
    wind(c,PF,t,P,x,a){ const k=t/160; atGlowA(c,a.x,a.y-P.S*0.8,P.S*0.6,[180,255,230],0.8*k); c.fillStyle="#e0fff4"; c.beginPath(); c.arc(a.x,a.y-P.S*0.8,P.S*0.12,0,7); c.fill(); },
    fly(c,PF,k,P,x,a,t){ const p=OWN.GU.path(a,{x:P.tg.x,y:P.tg.y},k,P.R,0.1), r=P.S*(0.6+0.9*k); c.fillStyle=OWN.rg(c,p.x,p.y,r*0.1,r,[[0,"rgba(30,60,90,.95)"],[0.7,"rgba(15,35,60,.9)"],[1,"rgba(60,140,170,.6)"]]); c.beginPath(); c.arc(p.x,p.y,r,0,7); c.fill();
      c.strokeStyle="rgba(150,230,220,.7)"; c.lineWidth=2; for(let i=0;i<3;i++){ c.beginPath(); c.arc(p.x,p.y,r*(0.5+i*0.2)+Math.sin(t/40+i)*3,0,7); c.stroke(); } atGlowA(c,p.x+P.d*r*0.3,p.y-r*0.3,r*0.4,[180,255,230],0.8); c.fillStyle="#e0fff4"; c.beginPath(); c.arc(p.x+P.d*r*0.3,p.y-r*0.3,r*0.08,0,7); c.fill();
      for(let i=0;i<6;i++){ const q=((t/100)+i/6)%1; c.strokeStyle=`rgba(200,240,255,${1-q})`; c.lineWidth=1.2; c.beginPath(); c.arc(p.x+(atH(i)-0.5)*r*1.6,p.y+r-q*r*2.2,2+2*atH(i*3),0,7); c.stroke(); } },
    land(c,PF,k,P,x,a,t){ const R=P.R, sq=k<0.4?eo(k/0.4):1, r=R*(1.6-0.5*sq); c.fillStyle=OWN.rg(c,P.tg.x,P.tg.y,r*0.2,r,[[0,"rgba(30,60,90,0)"],[0.7,`rgba(20,45,75,${0.6*(1-k)})`],[1,`rgba(60,140,170,${0.5*(1-k)})`]]); c.beginPath(); c.arc(P.tg.x,P.tg.y,r,0,7); c.fill();
      c.strokeStyle=`rgba(150,230,220,${0.8*(1-k)})`; c.lineWidth=3; for(let i=0;i<4;i++){ const an=i*Math.PI/2+0.4; c.beginPath(); c.moveTo(P.tg.x+Math.cos(an)*r,P.tg.y+Math.sin(an)*r); c.lineTo(P.tg.x+Math.cos(an)*r*0.7,P.tg.y+Math.sin(an)*r*0.7); c.stroke(); } for(let i=0;i<10;i++){ const q=((k*2)+i/10)%1; c.strokeStyle=`rgba(200,240,255,${(1-q)*(1-k)})`; c.lineWidth=1.2; c.beginPath(); c.arc(P.tg.x+(atH(i)-0.5)*R*1.6,P.tg.y+R*0.5-q*R*1.8,2+2*atH(i*3),0,7); c.stroke(); } } },
  "Warp Pull":{at:[0.9,0.4],
    wind(c,PF,t,P,x,a){ OWN.GU.gate(c,{x:a.x+P.d*P.S*0.4,y:a.y},P.S*1.1*eo(Math.min(1,t/160)),t,1); },
    fly(c,PF,k,P,x,a,t){ const g={x:a.x+P.d*P.S*0.4,y:a.y}; OWN.GU.gate(c,g,P.S*1.1,t,1); const F=OWN.WV.front(P,x,k), H=P.R*1.5*(0.5+0.6*eo(k)), L=Math.min(Math.abs(F.x-g.x),H*1.7); OWN.WV.trail(c,g.x,P.sg,F.x-P.d*L*0.8,F.gy,P,[[220,190,255],[110,60,190],[40,15,80]],t); OWN.WV.draw(c,F.x,F.gy,H,L,P.d,[[220,190,255],[110,60,190],[40,15,80]],t,{foam:[235,215,255],shape:"tube"});
      for(let i=0;i<8;i++) OWN.star(c,F.x-P.d*L*atH(i*5+Math.floor(t/100)),F.gy-H*(0.2+0.7*atH(i*3)),P.S*0.12,"rgba(240,225,255,.95)",t/40+i); },
    land(c,PF,k,P,x,a,t){ const g={x:a.x+P.d*P.S*0.4,y:a.y}, pull=k<0.5?eo(k/0.5):1-eo((k-0.5)/0.5); OWN.GU.gate(c,g,P.S*1.1*(1-k*0.6),t,1-k*0.5); OWN.WV.splash(c,PF,P,k,[110,60,190],[235,215,255]);
      for(let i=0;i<10;i++){ const f=((t/200)+i/10)%1, xx=P.tg.x+(g.x-P.tg.x)*f*pull; OWN.star(c,xx,P.tg.y+(atH(i)-0.5)*P.R*1.2,P.S*0.12,`rgba(240,225,255,${1-k})`,t/40+i); } OWN.DR.coat(c,P,k,[110,60,190],0.45*(1-k*0.6),true,2,6); } },
  "Sea Dread":OWN.WV.std({shape:"wall",at:[0.5,0.3],col:[[120,170,140],[30,80,70],[10,30,30]],foam:[200,230,210],H:1.5,
    riders(c,PF,k,P,x,F,H,t){ for(let i=0;i<4;i++) OWN.WV.eye(c,F.x-P.d*H*(0.15+i*0.42),F.gy-H*(0.35+0.3*atH(i*3)),H*(0.06+0.03*atH(i)),t+i*50,0.95,"#c8e040"); for(let i=0;i<2;i++) OWN.WV.tentacle(c,F.x-P.d*H*(0.3+i*0.6),F.gy-H*0.4,H*0.8,-Math.PI/2+P.d*0.5,t+i*90,[40,90,70],0.9,0.13); },
    crash(c,PF,k,P,x,t){ if(k<0.7) for(let i=0;i<3;i++) OWN.WV.tentacle(c,P.tg.x+(i-1)*P.R*0.6,P.gnd,P.R*1.4*(1-k/0.7),-Math.PI/2+(i-1)*0.5,t+i*70,[40,90,70],1-k/0.7,0.13); for(let i=0;i<3;i++) OWN.WV.eye(c,P.tg.x+(i-1)*P.R*0.55,P.gnd-P.R*0.1,P.R*0.1,t+i*40,1-k,"#c8e040"); } })
};
OWN.WV.trail=(c,x0,g0,x1,g1,P,col,t)=>{ if(Math.abs(x1-x0)<4) return; const N=16, h=P.R*0.16; c.beginPath(); for(let j=0;j<=N;j++){ const f=j/N, xx=x0+(x1-x0)*f, gy=g0+(g1-g0)*f; c.lineTo(xx,gy-h*(0.5+0.5*Math.sin(f*14-t/45))*(0.4+0.6*f)); } c.lineTo(x1,g1+3); c.lineTo(x0,g0+3); c.closePath();
  c.fillStyle=OWN.rgb(col[1],0.85); c.fill(); c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=2; c.beginPath(); for(let j=0;j<=N;j++){ const f=j/N, xx=x0+(x1-x0)*f, gy=g0+(g1-g0)*f; c.lineTo(xx,gy-h*(0.5+0.5*Math.sin(f*14-t/45))*(0.4+0.6*f)); } c.stroke();
  c.fillStyle="rgba(255,255,255,.85)"; for(let j=0;j<8;j++){ const f=((t/400)+j/8)%1; c.beginPath(); c.arc(x0+(x1-x0)*f,g0+(g1-g0)*f-h*0.8,2+atH(j)*2,0,7); c.fill(); } };
/* other wave shapes, so families differ in silhouette as well as colour (Gid, 19 Nov 2026) */
OWN.WV.shape=(c,sh,H,L,t,col,fc,al)=>{ const g=c.createLinearGradient(0,-H*1.3,0,0); g.addColorStop(0,OWN.rgb(col[0],al)); g.addColorStop(0.45,OWN.rgb(col[1],al)); g.addColorStop(1,OWN.rgb(col[2],al));
  const lt=(w)=>{ c.strokeStyle=OWN.rgb([255,255,255],0.5*al); c.lineWidth=w; c.lineCap="round"; }, foamDot=(x,y,r)=>{ c.fillStyle=OWN.rgb(fc,0.95*al); c.beginPath(); c.arc(x,y,Math.max(1,r),0,7); c.fill(); };
  const dk=OWN.rgb(OWN.mix(col[2],[0,0,0],0.35),0.6*al);
  if(sh==="swell"){ c.fillStyle=g; c.beginPath(); c.moveTo(-L,2); for(let i=0;i<=20;i++){ const f=i/20, xx=-L+(L+H*0.55)*f, hump=Math.sin(Math.min(1,f*1.15)*Math.PI*0.95), lump=Math.sin(f*18+t/60)*H*0.05; c.lineTo(xx,-(H*0.95*Math.pow(hump,0.8)+lump*hump)); } c.lineTo(H*0.55,2); c.closePath(); c.fill();
    lt(H*0.04); for(let j=0;j<3;j++){ c.beginPath(); c.ellipse(-H*0.3-j*H*0.5,-H*0.45,H*0.3,H*0.12,-0.2,Math.PI*1.1,Math.PI*1.8); c.stroke(); }
    for(let i=0;i<10;i++){ const f=0.35+i*0.06, xx=-L+(L+H*0.55)*f; foamDot(xx,-H*0.95*Math.pow(Math.sin(Math.min(1,f*1.15)*Math.PI*0.95),0.8)-2,H*0.05*(1+0.3*Math.sin(t/50+i))); } return; }
  if(sh==="chop"){ const n=6; c.fillStyle=g; c.beginPath(); c.moveTo(-L,2); for(let i=0;i<n;i++){ const f=i/(n-1), x0=-L+(L+H*0.3)*f, hh=H*(0.3+0.7*f)*(1+0.1*Math.sin(t/40+i*2)), w=(L+H*0.3)/n; c.lineTo(x0-w*0.45,-hh*0.25); c.quadraticCurveTo(x0-w*0.1,-hh*0.7,x0+w*0.15,-hh); c.quadraticCurveTo(x0+w*0.1,-hh*0.45,x0+w*0.45,-hh*0.2); } c.lineTo(H*0.4,2); c.closePath(); c.fill();
    for(let i=0;i<n;i++){ const f=i/(n-1), x0=-L+(L+H*0.3)*f, hh=H*(0.3+0.7*f)*(1+0.1*Math.sin(t/40+i*2)); for(let j=0;j<3;j++) foamDot(x0+H*0.1+j*H*0.05,-hh+j*H*0.04,H*0.045); lt(H*0.03); c.beginPath(); c.moveTo(x0-H*0.15,-hh*0.25); c.lineTo(x0+H*0.05,-hh*0.8); c.stroke(); } return; }
  if(sh==="wall"||sh==="jag"){ c.fillStyle=g; c.beginPath(); c.moveTo(-L,2); c.bezierCurveTo(-L*0.7,-H*0.2,-L*0.55,-H*0.95,-L*0.35,-H); const n=8;
    for(let i=1;i<=n;i++){ const f=i/n, xx=-L*0.35+(L*0.35+H*0.05)*f, yy=-H*(1+(sh==="jag"?(i%2?0.18:-0.02):0.04*Math.sin(t/40+i)))*(1+0.05*f); c.lineTo(xx,yy); } c.lineTo(H*0.2,-H*0.6); c.lineTo(H*0.28,2); c.closePath(); c.fill();
    c.fillStyle=dk; c.beginPath(); c.moveTo(H*0.05,-H*1.02); c.lineTo(H*0.2,-H*0.6); c.lineTo(H*0.28,2); c.lineTo(H*0.02,2); c.closePath(); c.fill();
    lt(H*0.035); for(let j=0;j<4;j++){ c.beginPath(); c.moveTo(-L*0.3+j*H*0.25,-H*0.9); c.lineTo(-L*0.45+j*H*0.25,-H*0.2); c.stroke(); }
    if(sh==="wall") for(let i=0;i<14;i++) foamDot(-L*0.35+(L*0.35+H*0.1)*i/13,-H*1.02+Math.sin(t/50+i)*2,H*0.06);
    else { c.fillStyle=OWN.rgb([240,250,255],0.9*al); for(let i=1;i<=8;i+=2){ const xx=-L*0.35+(L*0.35+H*0.05)*i/8; c.beginPath(); c.moveTo(xx-H*0.06,-H*1.05); c.lineTo(xx,-H*1.18); c.lineTo(xx+H*0.06,-H*1.05); c.fill(); } }
    for(let i=0;i<10;i++){ const f=((t/150)+i/10)%1; foamDot(H*(0.2+0.25*f),-H*(1.05-f*0.9),H*0.03*(1-f*0.5)); } return; }
  if(sh==="tube"){ const R=H*0.55; c.fillStyle=g; c.beginPath(); c.moveTo(-L,2); c.bezierCurveTo(-L*0.6,-H*0.15,-R*1.6,-H*0.95,-R*0.2,-R*2); c.arc(0,-R,R,-Math.PI/2-0.2,Math.PI*0.35,false); c.lineTo(R*0.55,2); c.closePath(); c.fill();
    c.fillStyle=dk; c.beginPath(); c.ellipse(-R*0.05,-R*0.85,R*0.55,R*0.62,0,0,7); c.fill(); c.strokeStyle=OWN.rgb(fc,0.9*al); c.lineWidth=H*0.05; c.beginPath(); c.arc(0,-R,R*1.02,-Math.PI*0.9,Math.PI*0.3); c.stroke();
    lt(H*0.03); for(let j=0;j<3;j++){ const an=t/80+j*2.1; c.beginPath(); c.arc(-R*0.05,-R*0.85,R*(0.3+j*0.08),an,an+1.4); c.stroke(); }
    for(let i=0;i<9;i++){ const a2=-Math.PI*0.9+i/8*Math.PI*1.2; foamDot(Math.cos(a2)*R*1.05,-R+Math.sin(a2)*R*1.05,H*0.05); } for(let i=0;i<6;i++){ const f=((t/130)+i/6)%1; foamDot(R*(0.4+0.6*f),-R*(0.4-f*0.4)-Math.sin(f*Math.PI)*R*0.4,H*0.03); } return; }
  if(sh==="double"){ const h2=H*0.62; c.save(); c.translate(-H*0.95,0); OWN.WV.shape(c,"curl2",h2,L*0.6,t+60,col,fc,al*0.9); c.restore(); OWN.WV.shape(c,"curl2",H,H*1.1,t,col,fc,al); return; }
  if(sh==="curl2"){ c.fillStyle=g; c.beginPath(); c.moveTo(-L,2); c.bezierCurveTo(-L*0.6,-H*0.12,-L*0.28,-H*0.92,0,-H); c.bezierCurveTo(H*0.36,-H*1.03,H*0.52,-H*0.78,H*0.32,-H*0.56); c.bezierCurveTo(H*0.2,-H*0.44,H*0.12,-H*0.62,H*0.21,-H*0.67); c.bezierCurveTo(H*0.04,-H*0.52,H*0.28,-H*0.2,H*0.48,2); c.closePath(); c.fill();
    for(let i=0;i<10;i++){ const a2=i/9*2.5-0.5; foamDot(H*0.12+Math.cos(a2)*H*0.24,-H*0.78+Math.sin(a2)*H*0.2,H*0.06); } return; }
  if(sh==="spout"){ const pts=[]; for(let j=0;j<=20;j++){ const f=j/20; pts.push({x:-L+(L+H*0.2)*f,y:-Math.sin(f*Math.PI*0.92)*H*1.35+f*f*H*0.1}); } OWN.DR.rib(c,pts,H*0.45,H*0.22,col[1],al,true);
    for(let j=0;j<14;j++){ const f=((t/160)+j/14)%1, b=pts[Math.min(20,Math.floor(f*20))]; foamDot(b.x+(atH(j)-0.5)*H*0.4,b.y-H*0.12+(atH(j*3)-0.5)*H*0.25,H*0.05); }
    for(let j=0;j<10;j++){ const f=((t/120)+j/10)%1; OWN.DR.tear(c,H*0.2+f*H*0.3,-H*0.1+f*f*H*0.4-H*0.2,H*0.05,Math.PI/2,col[0],al*(1-f)); } return; }
  if(sh==="humps"){ const n=3; for(let i=n-1;i>=0;i--){ const sp=Math.min(H*1.05,L*0.42), w=sp*(0.72-i*0.1), cx=-i*sp-H*0.2, hh=H*(1-i*0.22)*(0.9+0.1*Math.sin(t/60+i)); c.fillStyle=g; c.beginPath(); c.moveTo(cx-w,2); c.bezierCurveTo(cx-w,-hh*1.3,cx+w,-hh*1.3,cx+w,2); c.closePath(); c.fill();
      c.strokeStyle=OWN.rgb([230,250,255],0.6*al); c.lineWidth=1.4; for(let j=0;j<4;j++){ c.beginPath(); c.arc(cx+(j-1.5)*w*0.4,-hh*0.55,w*0.18,Math.PI*1.1,Math.PI*1.9); c.stroke(); } for(let j=0;j<6;j++) foamDot(cx+(j-2.5)*w*0.28,-hh*0.97+Math.abs(j-2.5)*hh*0.04,H*0.045); } return; } };
OWN.WV.moon=(c,x,y,r,al)=>{ if(al<=0) return; atGlowA(c,x,y,r*2.6,[255,245,200],0.55*al); c.save(); c.globalAlpha*=al; c.fillStyle=OWN.rg(c,x,y,r*0.1,r,[[0,"#fffbe8"],[1,"#f2e6b0"]],-r*0.3,-r*0.3); c.beginPath(); c.arc(x,y,r,0,7); c.fill();
  c.fillStyle="rgba(200,185,130,.5)"; for(const [dx,dy,rr] of [[-0.3,-0.2,0.18],[0.25,0.15,0.22],[-0.05,0.4,0.12],[0.35,-0.35,0.1]]){ c.beginPath(); c.arc(x+dx*r,y+dy*r,rr*r,0,7); c.fill(); } c.restore(); };
OWN.WV.tail=(c,P,x,sw,t)=>{ const s=x.self, base={x:s.x-P.d*(s.r||30)*0.5,y:P.sg-P.S*0.25}, tip={x:base.x-P.d*P.S*(1.1-0.5*Math.max(0,sw)),y:base.y-P.S*(0.2-1.2*sw)}; const col=OWN.mix(x.body||[90,170,190],[0,0,0],0.1);
  OWN.DR.rib(c,[base,{x:(base.x+tip.x)/2-P.d*P.S*0.2,y:Math.min(base.y,tip.y)-P.S*0.35},tip],P.S*0.32,P.S*0.1,col,1,true); c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.3)); c.beginPath(); c.moveTo(tip.x,tip.y); c.lineTo(tip.x-P.d*P.S*0.35,tip.y-P.S*0.3); c.lineTo(tip.x-P.d*P.S*0.25,tip.y+P.S*0.2); c.closePath(); c.fill(); };
OWN.WV.pool2=(c,x,gy,w,col,al)=>{ if(al<=0) return; c.fillStyle=OWN.rgb(col,0.75*al); c.beginPath(); c.ellipse(x,gy+2,w,w*0.22,0,0,7); c.fill(); c.strokeStyle=`rgba(255,255,255,${0.75*al})`; c.lineWidth=1.5; c.beginPath(); c.ellipse(x,gy+2,w*0.75,w*0.15,0,0,7); c.stroke(); };
/* a crown splash: a cup of water thrown up from the ground with prongs ending in drops */
OWN.WV.crown=(c,x,gy,w,h,col,t,al=1)=>{ if(h<2||al<=0) return; const lt=OWN.mix(col,[255,255,255],0.55), dk=OWN.mix(col,[0,0,40],0.3), n=9; c.save(); c.globalAlpha*=al;
  const g=c.createLinearGradient(0,gy-h,0,gy); g.addColorStop(0,OWN.rgb(lt,0.95)); g.addColorStop(1,OWN.rgb(col,0.95)); c.fillStyle=g;
  c.beginPath(); c.moveTo(x-w*0.55,gy+2); for(let i=0;i<n;i++){ const f=i/(n-1), sp=(f-0.5)*2, px=x+sp*w*(0.55+0.45*Math.abs(sp)), ph=h*(0.75+0.25*(1-Math.abs(sp)))*(0.9+0.1*Math.sin(t/40+i)), vx=x+sp*w*(0.5+0.3*Math.abs(sp));
    c.lineTo(vx-w*0.07,gy-ph*0.55); c.quadraticCurveTo(px-w*0.04,gy-ph*0.85,px,gy-ph); c.quadraticCurveTo(px+w*0.04,gy-ph*0.85,vx+w*0.07,gy-ph*0.55); } c.lineTo(x+w*0.55,gy+2); c.closePath(); c.fill();
  c.strokeStyle=OWN.rgb(dk,0.6); c.lineWidth=1.2; c.stroke(); c.fillStyle=OWN.rgb(OWN.mix(col,[0,0,40],0.45),0.6); c.beginPath(); c.ellipse(x,gy-h*0.45,w*0.45,h*0.1,0,0,7); c.fill();
  c.strokeStyle="rgba(255,255,255,.75)"; c.lineWidth=2; c.lineCap="round"; for(let i=0;i<3;i++){ const sp=(i-1)*0.6; c.beginPath(); c.moveTo(x+sp*w*0.4,gy-h*0.1); c.lineTo(x+sp*w*0.55,gy-h*0.6); c.stroke(); }
  for(let i=0;i<n;i++){ const f=i/(n-1), sp=(f-0.5)*2, px=x+sp*w*(0.55+0.45*Math.abs(sp)), ph=h*(0.75+0.25*(1-Math.abs(sp)))*(0.9+0.1*Math.sin(t/40+i)); OWN.DR.tear(c,px+sp*w*0.08,gy-ph-h*0.1,Math.max(1.5,w*0.07),-Math.PI/2+sp*0.6,lt,1); }
  for(let i=0;i<8;i++){ const f=((t/180)+i/8)%1, sp=(atH(i)-0.5)*2; OWN.DR.tear(c,x+sp*w*(1+f*0.8),gy-h*(1.1+0.4*Math.sin(f*Math.PI))+f*f*h*0.8,Math.max(1.2,w*0.05),Math.PI/2,lt,1-f); } c.restore(); };
OWN.WV.serpentHead=(c,x,y,r,d,t,al=1)=>{ c.save(); c.translate(x,y); c.scale(d,1); c.globalAlpha*=al; c.fillStyle="rgba(90,170,230,.95)"; c.strokeStyle="rgba(230,250,255,.9)"; c.lineWidth=2;
  c.beginPath(); c.moveTo(-r,r*0.3); c.quadraticCurveTo(-r*0.6,-r*0.6,r*0.2,-r*0.5); c.quadraticCurveTo(r*0.9,-r*0.4,r*1.3,-r*0.05); c.lineTo(r*0.6,r*0.1); c.quadraticCurveTo(r*1.1,r*0.25,r*1.2,r*0.4); c.quadraticCurveTo(r*0.2,r*0.55,-r,r*0.3); c.fill(); OWN.ol(c);
  for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-r*0.6+i*r*0.3,-r*0.45+i*0.02); c.quadraticCurveTo(-r*0.9+i*r*0.3,-r*0.9-Math.sin(t/60+i)*r*0.1,-r*1.0+i*r*0.25,-r*0.7); c.stroke(); }
  c.fillStyle="#fff8c8"; c.beginPath(); c.arc(r*0.35,-r*0.25,r*0.12,0,7); c.fill(); c.fillStyle="#102040"; c.beginPath(); c.arc(r*0.38,-r*0.25,r*0.06,0,7); c.fill(); c.fillStyle="#fff"; for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(r*(0.75+i*0.15),r*0.08); c.lineTo(r*(0.8+i*0.15),r*0.22); c.lineTo(r*(0.85+i*0.15),r*0.08); c.fill(); } c.restore(); };
OWN.waveFx=(c,t,x,o)=>{ OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:o.at||[0.8,0.5],sz:1.2}); P.S*=1.6; OWN.GU.d=P.d; const a=P.o0;
    if(t<160){ if(o.wind) o.wind(c,PF,t,P,x,a); return; }
    if(t<560){ o.fly(c,PF,(t-160)/400,P,x,a,t); return; }
    o.land(c,PF,Math.min(1,(t-560)/500),P,x,a,t); }); };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.wave) return; const K=ANIM.wave, fx1=K.fx;
  K.fx=function(c,t,x){ const o=x&&OWN_WAVE[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ OWN.waveFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN wave",x.name,e&&e.message); } } }; })();

/* ---------- sandspray, own versions (19 Nov 2026): every family threw the same tan fan of dots, so each one now throws its own stuff
   (beach sand, dirt with a worm, red-hot gravel, ash and embers, rock dust, gold sand, grave dirt, pink spores) its own way.
   Wind-up to 280 ms, throw 280-500, contact at 500, settle to 1180. ---------- */
OWN.SS={
  grain(c,x,y,r,col,rot=0,al=1){ c.fillStyle=OWN.rgb(col,al); c.beginPath(); for(let i=0;i<5;i++){ const a=rot+i/5*Math.PI*2, rr=r*(0.7+0.4*((i*37)%5)/5); c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } c.closePath(); c.fill(); },
  /* n grains thrown from a toward a spot near h, each on its own arc; returns nothing */
  fan(c,a,h,k,n,R,cols,sz,seed=0,arc=0.6,spread=1.6,glow=null){ for(let i=0;i<n;i++){ const st=atH(i+seed)*0.35, kk=(k-st)/(1-st); if(kk<0) continue; const kq=Math.min(1,kk), ex=h.x+(atH(i*5+seed)-0.5)*R*spread*0.6, ey=h.y+(atH(i*7+seed)-0.5)*R*spread,
      p=OWN.DR.pos(a,{x:ex,y:ey},eo(kq),R,arc*(0.3+atH(i*3+seed))), z=sz*(0.6+0.8*atH(i*11+seed)), col=cols[i%cols.length]; if(glow) atGlowA(c,p.x,p.y,z*3,glow,0.5); OWN.SS.grain(c,p.x,p.y,z,col,i+kq*4); } },
  cloud(c,PF,x,y,R,k,cols,n=8,al=0.75,rise=0.4){ for(let i=0;i<n;i++){ const an=i/n*Math.PI*2+k*1.5, rr=R*(0.35+0.55*eo(Math.min(1,k*1.5))); PF(x+Math.cos(an)*rr,y-R*rise*k+Math.sin(an)*rr*0.6,R*(0.45+0.3*k),al*(k<0.6?1:1-(k-0.6)/0.4),cols[i%cols.length]); } },
  pile(c,x,gy,w,col,al=1){ if(w<1) return; c.fillStyle=OWN.rgb(col,al); c.beginPath(); c.moveTo(x-w,gy+2); c.quadraticCurveTo(x-w*0.3,gy-w*0.55,x,gy-w*0.5); c.quadraticCurveTo(x+w*0.3,gy-w*0.55,x+w,gy+2); c.closePath(); c.fill();
    c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.35),al); c.beginPath(); c.ellipse(x-w*0.2,gy-w*0.35,w*0.25,w*0.08,-0.3,0,7); c.fill(); for(let i=0;i<6;i++){ c.fillStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.3),al); c.beginPath(); c.arc(x+(atH(i)-0.5)*w*1.4,gy-atH(i*3)*w*0.35,1.2,0,7); c.fill(); } },
  squint(c,P,al){ if(al<=0) return; c.strokeStyle=`rgba(60,40,20,${0.95*al})`; c.lineWidth=2.6; c.lineCap="round"; const ey=P.tg.y-P.R*0.25; for(const sd of [-1,1]){ const ex=P.tg.x+sd*P.R*0.32; c.beginPath(); c.moveTo(ex-sd*P.R*0.13,ey-P.R*0.09); c.lineTo(ex+sd*P.R*0.06,ey); c.lineTo(ex-sd*P.R*0.13,ey+P.R*0.09); c.stroke(); }
    for(let i=0;i<2;i++){ OWN.DR.tear(c,P.tg.x+(i?1:-1)*P.R*0.38,P.tg.y-P.R*0.05+((Date.now()/8)%20),P.R*0.05,Math.PI/2,[170,215,250],al); } },
  worm(c,x,y,r,t,al=1){ c.save(); c.globalAlpha*=al; const pts=[]; for(let j=0;j<=10;j++){ const f=j/10; pts.push({x:x-r+f*r*2,y:y+Math.sin(f*7+t/50)*r*0.25}); } OWN.DR.rib(c,pts,r*0.32,r*0.36,[230,130,140],1,true); const e=pts[10];
    c.fillStyle="#222"; c.beginPath(); c.arc(e.x-r*0.05,e.y-r*0.1,r*0.06,0,7); c.fill(); c.strokeStyle="rgba(180,80,90,.8)"; c.lineWidth=1; for(let j=2;j<9;j+=2){ c.beginPath(); c.moveTo(pts[j].x,pts[j].y-r*0.15); c.lineTo(pts[j].x,pts[j].y+r*0.15); c.stroke(); } c.restore(); },
  bone(c,x,y,r,rot,al=1){ c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=al; c.fillStyle="#f2ead6"; c.strokeStyle="#9a8a6a"; c.lineWidth=1.2; c.beginPath(); c.roundRect(-r,-r*0.16,r*2,r*0.32,r*0.1); c.fill(); OWN.ol(c);
    for(const sx of [-1,1]) for(const sy of [-1,1]){ c.beginPath(); c.arc(sx*r,sy*r*0.2,r*0.25,0,7); c.fill(); OWN.ol(c); } c.restore(); },
  skull(c,x,y,r,t,al=1){ c.save(); c.translate(x,y+Math.sin(t/60)*r*0.2); c.globalAlpha*=al; c.fillStyle="rgba(220,240,215,.85)"; c.beginPath(); c.arc(0,0,r,Math.PI,0); c.lineTo(r*0.7,r*0.6); c.lineTo(-r*0.7,r*0.6); c.closePath(); c.fill();
    c.fillStyle="#2a3a2a"; c.beginPath(); c.ellipse(-r*0.38,-r*0.05,r*0.22,r*0.26,0,0,7); c.ellipse(r*0.38,-r*0.05,r*0.22,r*0.26,0,0,7); c.fill(); c.beginPath(); c.moveTo(0,r*0.15); c.lineTo(-r*0.1,r*0.35); c.lineTo(r*0.1,r*0.35); c.fill(); c.restore(); },
  hand(c,x,gy,h,t,al=1){ if(h<2) return; c.save(); c.globalAlpha*=al; c.fillStyle="rgba(150,175,145,.9)"; c.strokeStyle="rgba(70,90,70,.9)"; c.lineWidth=1.2; c.beginPath(); c.moveTo(x-h*0.12,gy); c.lineTo(x-h*0.1,gy-h*0.6);
    for(let i=0;i<4;i++){ const fx=x-h*0.12+i*h*0.08, L=h*(0.28+0.08*(i%3)); c.lineTo(fx,gy-h*0.6-L+Math.sin(t/60+i)*h*0.03); c.lineTo(fx+h*0.05,gy-h*0.6-L*0.9); c.lineTo(fx+h*0.06,gy-h*0.62); } c.lineTo(x+h*0.18,gy-h*0.45); c.lineTo(x+h*0.12,gy); c.closePath(); c.fill(); OWN.ol(c); c.restore(); },
  ankh(c,x,y,r,col,al){ c.strokeStyle=OWN.rgb(col,al); c.lineWidth=Math.max(1.5,r*0.22); c.lineCap="round"; c.beginPath(); c.ellipse(x,y-r*0.55,r*0.32,r*0.42,0,0,7); c.moveTo(x,y-r*0.13); c.lineTo(x,y+r); c.moveTo(x-r*0.55,y+r*0.1); c.lineTo(x+r*0.55,y+r*0.1); c.stroke(); },
  spore(c,x,y,r,t,al=1){ atGlowA(c,x,y,r*2.4,[255,140,200],0.35*al); c.fillStyle=`rgba(255,160,210,${0.9*al})`; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.strokeStyle=`rgba(255,220,240,${al})`; c.lineWidth=1; for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+t/200; c.beginPath(); c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r); c.lineTo(x+Math.cos(a)*r*1.7,y+Math.sin(a)*r*1.7); c.stroke(); } },
  shell(c,x,y,r,rot){ OWN.WV.shell(c,x,y,r,rot); }
};
const SAND=[226,196,132], SAND2=[200,165,100], DIRT=[120,88,58], DIRT2=[90,64,42], ASH=[150,145,140], ASH2=[95,90,88];
const OWN_SAND={
  "Sand Spray":{at:[0.9,0.85],
    wind(c,PF,t,P,x,a){ for(let i=0;i<6;i++){ const ph=((t/100)+i/6)%1; OWN.SS.grain(c,a.x+P.d*P.S*0.4*ph+(i%2?5:-5),P.sg-ph*P.S*0.8,P.S*0.08,i%2?SAND:SAND2,i); } PF(a.x,P.sg-P.S*0.2,P.S*0.5,0.5*t/280,SAND); },
    fly(c,PF,k,P,x,a,h,t){ OWN.SS.fan(c,a,h,k,90,P.R,[SAND,SAND2,[240,220,170]],P.S*0.13,0,0.5,1.8); for(let i=0;i<4;i++){ const kk=Math.min(1,k*1.2-i*0.1); if(kk<0) continue; const p=OWN.DR.pos(a,{x:h.x,y:h.y+(i-1.5)*P.R*0.3},eo(kk),P.R,0.6); OWN.SS.shell(c,p.x,p.y,P.S*0.3,kk*6+i); }
      c.fillStyle=OWN.rgb(SAND,0.25); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(h.x,h.y-P.R*k); c.lineTo(h.x,h.y+P.R*0.5*k); c.closePath(); c.fill(); },
    land(c,PF,k,P,x,a,h,t){ OWN.SS.cloud(c,PF,P.tg.x,P.tg.y-P.R*0.2,P.R,k,[SAND,[235,215,165]]); OWN.SS.pile(c,P.tg.x,P.gnd,P.R*0.8*eo(Math.min(1,k*2)),SAND); OWN.SS.squint(c,P,k<0.8?1:(1-k)/0.2);
      for(let i=0;i<20;i++){ const f=((k*1.4)+atH(i))%1; OWN.SS.grain(c,P.tg.x+(atH(i*3)-0.5)*P.R*1.6,P.tg.y-P.R*0.6+f*P.R*1.4,P.S*0.06,SAND,i,(1-f)*(1-k*0.5)); } } },
  "Dirt Kick":{at:[0.5,1.0],inside:true,
    wind(c,PF,t,P,x,a){ const k=t/280; for(let i=0;i<5;i++){ const ph=((t/90)+i/5)%1; OWN.DR.clod(c,a.x-P.d*P.S*0.5*ph,P.sg-Math.sin(ph*Math.PI)*P.S*0.6,P.S*0.1,DIRT,t/30+i,i); } PF(a.x,P.sg,P.S*(0.4+0.4*k),0.5,[170,140,100]); },
    fly(c,PF,k,P,x,a,h,t){ const src={x:a.x+P.d*P.S*0.3,y:P.sg-P.S*0.2}; OWN.SS.fan(c,src,h,k,40,P.R,[DIRT,DIRT2,[140,110,80]],P.S*0.1,3,0.9,1.6); for(let i=0;i<5;i++){ const kk=Math.min(1,k*1.15-i*0.06); if(kk<0) continue; const p=OWN.DR.pos(src,{x:h.x+(atH(i)-0.5)*P.R,y:h.y+(atH(i*3)-0.5)*P.R},eo(kk),P.R,1.2); OWN.DR.clod(c,p.x,p.y,P.S*(0.2+0.1*atH(i)),DIRT,kk*8+i,i); }
      const wp=OWN.DR.pos(src,{x:P.tg.x,y:P.head.y-P.R*0.2},eo(k),P.R,1.6); OWN.SS.worm(c,wp.x,wp.y,P.S*0.55,t); for(let i=0;i<3;i++) PF(src.x+P.d*P.S*0.5*i*k,src.y-P.S*0.3*i*k,P.S*0.45,0.5,[170,140,100]); },
    land(c,PF,k,P,x,a,h,t){ OWN.SS.cloud(c,PF,P.tg.x,P.tg.y,P.R,k,[[170,140,100],[150,120,85]],8,0.7); OWN.DR.splatStar(c,h.x,h.y+k*P.R*0.15,P.R*0.55,DIRT,0.3,1,t,k<0.7?1:(1-k)/0.3); OWN.SS.pile(c,P.tg.x,P.gnd,P.R*0.7*eo(Math.min(1,k*2)),DIRT);
      const wk=Math.min(1,k*1.3); OWN.SS.worm(c,P.tg.x+Math.sin(k*12)*P.R*0.1,P.head.y-P.R*0.15,P.S*0.55,t,1-Math.max(0,k-0.8)*5); OWN.MT.debris(c,h,P.R*0.8,k,DIRT2,8,0.1,7); } },
  "Hot Gravel":{at:[0.85,0.6],
    wind(c,PF,t,P,x,a){ const k=t/280; for(let i=0;i<5;i++){ const an=i/5*Math.PI*2+t/60; const p={x:a.x+Math.cos(an)*P.S*0.6,y:a.y+Math.sin(an)*P.S*0.35}; atGlowA(c,p.x,p.y,P.S*0.3,[255,120,40],0.6*k); OWN.DR.clod(c,p.x,p.y,P.S*0.13,[200,80,40],t/40+i,i); } },
    fly(c,PF,k,P,x,a,h,t){ OWN.SS.fan(c,a,h,k,18,P.R,[[230,90,40],[255,150,60],[180,60,30]],P.S*0.16,5,0.7,1.5,[255,120,40]);
      for(let i=0;i<8;i++){ const kk=Math.min(1,k*1.1-i*0.04); if(kk<0) continue; const tgt={x:h.x+(atH(i)-0.5)*P.R,y:h.y+(atH(i*3)-0.5)*P.R}; for(let j=1;j<4;j++){ const q=OWN.DR.pos(a,tgt,eo(Math.max(0,kk-j*0.06)),P.R,0.8); PF(q.x,q.y-P.S*0.1,P.S*0.2,0.35,[120,110,110]); } const p=OWN.DR.pos(a,tgt,eo(kk),P.R,0.8); atGlowA(c,p.x,p.y,P.S*0.45,[255,110,30],0.7); OWN.DR.clod(c,p.x,p.y,P.S*0.18,[220,85,35],kk*7+i,i); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.7?1:1-(k-0.7)/0.3; for(let i=0;i<9;i++){ const px=P.tg.x+(atH(i*3)-0.5)*R*1.4, py=P.tg.y+(atH(i*5)-0.5)*R*1.1; c.fillStyle=`rgba(40,25,20,${0.75*al})`; c.beginPath(); c.arc(px,py,R*0.07,0,7); c.fill(); atGlowA(c,px,py,R*0.18,[255,120,40],0.6*al*(1-k)); }
      for(let i=0;i<6;i++){ const q=((k*1.6)+i/6)%1; PF(P.tg.x+(atH(i)-0.5)*R*1.3,P.tg.y-R*0.3-q*R*1.6,P.S*(0.35+0.4*q),0.5*(1-k)*(1-q),[235,235,235]); } OWN.MT.debris(c,{x:P.tg.x,y:P.tg.y},R*0.8,k,[200,80,40],10,0.1,9); OWN.MT.scorch(c,P,k,0.8); } },
  "Dust Kick":{at:[0.5,0.9],inside:true,
    wind(c,PF,t,P,x,a){ const k=t/280; for(let i=0;i<8;i++){ const an=i/8*Math.PI*2+t/40; PF(x.self.x+Math.cos(an)*P.S*1.1,P.sg-P.S*0.2+Math.sin(an)*P.S*0.3,P.S*0.35,0.6*k,[205,190,165]); } c.strokeStyle=`rgba(255,250,235,${0.8*k})`; c.lineWidth=2.5; c.beginPath(); c.ellipse(x.self.x,P.sg-P.S*0.3,P.S*1.2,P.S*0.35,0,t/40,t/40+4); c.stroke(); },
    fly(c,PF,k,P,x,a,h,t){ const fx=x.self.x+(P.tg.x-x.self.x)*eo(k), gy=P.sg+(P.gnd-P.sg)*k, r=P.S*(0.8+0.5*k); for(let i=0;i<10;i++){ const an=i/10*Math.PI*2+t/30; PF(fx+Math.cos(an)*r,gy-r+Math.sin(an)*r,P.S*0.45,0.7,i%2?[205,190,165]:[180,165,140]); }
      c.strokeStyle="rgba(255,250,235,.85)"; c.lineWidth=3; c.lineCap="round"; for(let j=0;j<3;j++){ const an=t/30+j*2.1; c.beginPath(); c.arc(fx,gy-r,r*0.9,an,an+1.2); c.stroke(); } for(let i=0;i<6;i++){ const an=t/25+i; OWN.SS.grain(c,fx+Math.cos(an)*r*1.1,gy-r+Math.sin(an)*r*1.1,P.S*0.08,[150,130,105],an); }
      for(let i=0;i<5;i++){ const f=i/5; PF(x.self.x+(fx-x.self.x)*f,P.sg+(gy-P.sg)*f-P.S*0.2,P.S*0.35*(0.5+f),0.45*f,[205,190,165]); } },
    land(c,PF,k,P,x,a,h,t){ OWN.SS.cloud(c,PF,P.tg.x,P.tg.y,P.R*1.2,k,[[205,190,165],[180,165,140]],10,0.8); c.strokeStyle=`rgba(255,250,235,${0.8*(1-k)})`; c.lineWidth=3; for(let j=0;j<3;j++){ const an=t/25+j*2.1; c.beginPath(); c.arc(P.tg.x,P.tg.y,P.R*(1.0+0.3*k),an,an+1.2); c.stroke(); }
      OWN.SS.squint(c,P,k<0.8?1:(1-k)/0.2); } },
  "Grit Blast":{at:[0.5,0.9],
    wind(c,PF,t,P,x,a){ const k=t/280; for(let i=0;i<10;i++){ const an=t/25+i*0.63, rr=P.S*(0.3+0.9*k); OWN.SS.grain(c,a.x+Math.cos(an)*rr,a.y+Math.sin(an)*rr*0.45,P.S*0.08,i%2?SAND:SAND2,an); }
      c.strokeStyle=`rgba(255,245,215,${0.8*k})`; c.lineWidth=2.5; c.beginPath(); c.ellipse(a.x,a.y,P.S*(0.4+0.9*k),P.S*(0.2+0.4*k),0,t/30,t/30+4); c.stroke(); atGlowA(c,a.x,a.y,P.S*1.2,[255,240,200],0.4*k); },
    fly(c,PF,k,P,x,a,h,t){ const e=OWN.DR.pos(a,h,eo(Math.min(1,k*1.3)),P.R,0.1), dx=e.x-a.x, dy=e.y-a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, w0=P.S*0.25, w1=P.S*1.0;
      c.fillStyle=OWN.lg(c,a.x,a.y,e.x,e.y,[[0,"rgba(240,225,180,.85)"],[1,"rgba(220,195,140,.6)"]]); c.beginPath(); c.moveTo(a.x+nx*w0,a.y+ny*w0); c.lineTo(e.x+nx*w1,e.y+ny*w1); c.lineTo(e.x-nx*w1,e.y-ny*w1); c.lineTo(a.x-nx*w0,a.y-ny*w0); c.closePath(); c.fill();
      c.strokeStyle="rgba(170,140,90,.85)"; c.lineWidth=2.2; for(let j=0;j<7;j++){ const f=(((t/60)+j/7)%1)*Math.min(1,k*1.3), px=a.x+dx*f, py=a.y+dy*f, w=w0+(w1-w0)*f; c.beginPath(); c.moveTo(px+nx*w,py+ny*w); c.quadraticCurveTo(px+dx/L*w*0.8,py+dy/L*w*0.8,px-nx*w,py-ny*w); c.stroke(); }
      for(let i=0;i<80;i++){ const f=((t/70)+atH(i))%1; if(f>k*1.3) continue; const w=w0+(w1-w0)*f, px=a.x+dx*f+nx*(atH(i*3)-0.5)*2*w, py=a.y+dy*f+ny*(atH(i*3)-0.5)*2*w; OWN.SS.grain(c,px,py,P.S*(0.05+0.04*atH(i*5)),i%3?SAND:[250,240,210],i); }
      c.strokeStyle="rgba(255,255,240,.9)"; c.lineWidth=1.6; for(let i=0;i<5;i++){ const off=(i-2)*0.35; c.beginPath(); c.moveTo(a.x+nx*w0*off,a.y+ny*w0*off); c.lineTo(e.x+nx*w1*off*0.9,e.y+ny*w1*off*0.9); c.stroke(); }
      if(k>0.7){ const q=(k-0.7)/0.3; for(let i=0;i<10;i++){ const an=Math.atan2(-dy,-dx)+(atH(i)-0.5)*2.2, v=P.R*(0.3+0.7*q*atH(i*3)); c.strokeStyle=`rgba(255,${200+Math.round(55*atH(i))},110,1)`; c.lineWidth=2; c.beginPath(); c.moveTo(e.x+Math.cos(an)*v*0.4,e.y+Math.sin(an)*v*0.4); c.lineTo(e.x+Math.cos(an)*v,e.y+Math.sin(an)*v); c.stroke(); } } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.6?1:1-(k-0.6)/0.4, beam=k<0.35?1:Math.max(0,1-(k-0.35)/0.25);
      if(beam>0){ c.fillStyle=`rgba(235,215,165,${0.6*beam})`; c.beginPath(); c.moveTo(a.x,a.y-P.S*0.25); c.lineTo(h.x,h.y-P.S); c.lineTo(h.x,h.y+P.S); c.lineTo(a.x,a.y+P.S*0.25); c.closePath(); c.fill(); }
      for(let i=0;i<16;i++){ const an=(P.d>0?Math.PI:0)+(atH(i)-0.5)*2.6, v=R*(0.3+1.1*eo(k)*atH(i*3)+0.2); c.strokeStyle=`rgba(255,${190+Math.round(60*atH(i))},100,${al})`; c.lineWidth=2.4; c.beginPath(); c.moveTo(h.x+Math.cos(an)*v*0.55,h.y+Math.sin(an)*v*0.55); c.lineTo(h.x+Math.cos(an)*v,h.y+Math.sin(an)*v); c.stroke(); }
      c.strokeStyle=`rgba(255,255,255,${0.9*al})`; c.lineWidth=2; c.lineCap="round"; for(let i=0;i<6;i++){ const x0=P.tg.x-R*0.6+i*R*0.24; c.beginPath(); c.moveTo(x0,P.tg.y-R*0.55); c.lineTo(x0+R*0.18,P.tg.y+R*0.15); c.stroke(); c.strokeStyle=`rgba(120,90,60,${0.6*al})`; c.beginPath(); c.moveTo(x0+2,P.tg.y-R*0.55); c.lineTo(x0+R*0.18+2,P.tg.y+R*0.15); c.stroke(); c.strokeStyle=`rgba(255,255,255,${0.9*al})`; }
      OWN.MT.debris(c,h,R*0.9,k,[200,180,140],10,0.08,17); OWN.SS.cloud(c,PF,h.x,h.y,R*0.9,k,[[230,215,170],[210,190,145]],8,0.65); OWN.SS.squint(c,P,k<0.8?1:(1-k)/0.2); } },
  "Ash Storm":{at:[0.5,0.4],
    wind(c,PF,t,P,x,a){ const k=t/280; for(let i=0;i<6;i++){ const an=i/6*Math.PI*2+t/30; PF(a.x+Math.cos(an)*P.S*0.9*k,a.y+Math.sin(an)*P.S*0.5*k,P.S*0.3,0.5,ASH); } atGlowA(c,a.x,a.y,P.S*1.2,[255,140,50],0.6*k); },
    fly(c,PF,k,P,x,a,h,t){ for(let i=0;i<10;i++){ const kk=Math.max(0,k-i*0.05), p=OWN.GU.path(a,h,kk,P.R,0.3,P.S*0.4,t,i); PF(p.x,p.y,P.S*(0.6-i*0.03),0.6*(1-i/12),i%2?ASH:ASH2); }
      OWN.GU.ride(14,a,h,k,t,P,(q,i)=>i%3?OWN.SS.ashFlake(c,q.x,q.y,P.S*0.14,t/30+i):(atGlowA(c,q.x,q.y,P.S*0.3,[255,140,50],0.7),OWN.SS.grain(c,q.x,q.y,P.S*0.06,[255,180,80],i)),0.8,0.04); },
    land(c,PF,k,P,x,a,h,t){ const R=P.R; for(let j=0;j<12;j++){ const f=j/11, an=t/25+j*0.9, rr=R*(0.5+0.6*f); PF(P.tg.x+Math.cos(an)*rr,P.tg.y+R*0.4-f*R*1.6,P.S*(0.4+0.2*f),0.55*(1-k),j%2?ASH:ASH2); }
      for(let i=0;i<14;i++){ const an=t/20+i*0.9, rr=R*(0.6+0.5*atH(i)); const px=P.tg.x+Math.cos(an)*rr, py=P.tg.y+Math.sin(an)*rr*0.5-R*0.3; if(i%3) OWN.SS.ashFlake(c,px,py,P.S*0.13,an); else { atGlowA(c,px,py,P.S*0.3,[255,140,50],0.7*(1-k)); OWN.SS.grain(c,px,py,P.S*0.06,[255,180,80],i,1-k); } }
      OWN.SS.pile(c,P.tg.x,P.gnd,P.R*0.6*eo(k),ASH,0.9); } },
  "Grit Cloud":{at:[0.5,0.55],
    wind(c,PF,t,P,x,a){ const k=t/280; for(let i=0;i<6;i++){ const q=((t/70)+i/6)%1; OWN.DR.clod(c,a.x+(atH(i)-0.5)*P.S,a.y+q*P.S*0.9,P.S*0.08,[150,140,130],t/30+i,i); } PF(a.x,a.y,P.S*0.6*k,0.5,[170,160,150]); },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.DR.pos(a,h,eo(k),P.R,0.2); for(let i=0;i<9;i++){ const an=i/9*Math.PI*2+t/80; PF(p.x+Math.cos(an)*P.S*1.1,p.y+Math.sin(an)*P.S*0.7,P.S*0.7,0.8,i%2?[170,160,150]:[140,130,122]); }
      for(let i=0;i<10;i++){ const an=t/50+i*0.7, rr=P.S*(0.6+0.8*atH(i)); OWN.DR.clod(c,p.x+Math.cos(an)*rr,p.y+Math.sin(an)*rr*0.6,P.S*(0.1+0.08*atH(i*3)),[150,140,130],an,i); } for(let i=0;i<4;i++){ const q=OWN.DR.pos(a,h,eo(Math.max(0,k-0.1-i*0.08)),P.R,0.2); PF(q.x,q.y,P.S*0.5,0.5,[170,160,150]); } },
    land(c,PF,k,P,x,a,h,t){ OWN.SS.cloud(c,PF,P.tg.x,P.tg.y,P.R*1.2,k,[[170,160,150],[140,130,122]],10,0.85,0.2); OWN.MT.debris(c,{x:P.tg.x,y:P.tg.y},P.R*1.1,k,[130,120,110],12,0.13,13); OWN.SS.pile(c,P.tg.x,P.gnd,P.R*0.75*eo(Math.min(1,k*2)),[150,140,130]); } },
  "Sand Puff":{at:[0.9,0.5],
    wind(c,PF,t,P,x,a){ const k=t/280; PF(a.x,a.y,P.S*(0.3+0.5*k),0.7,[235,205,130]); for(let i=0;i<3;i++){ const an=t/40+i*2.1; OWN.SS.ankh(c,a.x+Math.cos(an)*P.S*0.8,a.y+Math.sin(an)*P.S*0.4,P.S*0.18,[255,215,90],k); } },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.DR.pos(a,h,eo(k),P.R,0.5), r=P.S*(0.7+0.6*k); for(let i=0;i<8;i++){ const an=i/8*Math.PI*2+t/70; PF(p.x+Math.cos(an)*r*0.7,p.y+Math.sin(an)*r*0.5,r*0.6,0.85,i%2?[235,205,130]:[250,225,160]); }
      for(let i=0;i<4;i++){ const an=t/35+i*1.57; OWN.SS.ankh(c,p.x+Math.cos(an)*r*1.2,p.y+Math.sin(an)*r*0.6,P.S*0.2,[255,215,90],0.95); } for(let i=0;i<10;i++){ const an=t/25+i; OWN.star(c,p.x+Math.cos(an)*r*1.3,p.y+Math.sin(an)*r*0.8,P.S*0.08,"rgba(255,245,200,.95)",an); } },
    land(c,PF,k,P,x,a,h,t){ OWN.SS.cloud(c,PF,P.tg.x,P.tg.y,P.R,k,[[235,205,130],[250,225,160]],8,0.8); const g=eo(Math.min(1,k*2)), al=k<0.85?1:(1-k)/0.15; c.fillStyle=`rgba(225,190,110,${al})`; c.beginPath(); c.moveTo(P.tg.x-P.R*0.9*g,P.gnd+2); c.lineTo(P.tg.x,P.gnd-P.R*0.75*g); c.lineTo(P.tg.x+P.R*0.9*g,P.gnd+2); c.closePath(); c.fill();
      c.fillStyle=`rgba(180,140,70,${al})`; c.beginPath(); c.moveTo(P.tg.x,P.gnd-P.R*0.75*g); c.lineTo(P.tg.x+P.R*0.9*g,P.gnd+2); c.lineTo(P.tg.x+P.R*0.15*g,P.gnd+2); c.closePath(); c.fill(); c.strokeStyle=`rgba(150,110,50,${0.6*al})`; c.lineWidth=1; for(let i=1;i<4;i++){ c.beginPath(); c.moveTo(P.tg.x-P.R*0.9*g*i/4,P.gnd-P.R*0.75*g*(1-i/4)); c.lineTo(P.tg.x+P.R*0.9*g*i/4,P.gnd-P.R*0.75*g*(1-i/4)); c.stroke(); }
      for(let i=0;i<3;i++){ const an=t/30+i*2.1; OWN.SS.ankh(c,P.tg.x+Math.cos(an)*P.R*0.8,P.tg.y-P.R*0.5+Math.sin(an)*P.R*0.3,P.S*0.18,[255,215,90],1-k); } } },
  "Hoof Dust":{at:[0.5,1.0],inside:true,
    wind(c,PF,t,P,x,a){ for(let i=0;i<2;i++){ const q=(t-i*130)/130; if(q<0||q>1) continue; OWN.GU.ring(c,{x:x.self.x,y:P.sg},Math.PI/2,P.S*(0.5+1.5*q),[210,195,170],0.8*(1-q)); for(let j=0;j<5;j++){ const an=Math.PI+j/4*Math.PI; PF(x.self.x+Math.cos(an)*P.S*(0.6+1.2*q),P.sg-P.S*0.15+Math.sin(an)*P.S*0.3*q,P.S*0.35,0.6*(1-q),[205,190,165]); } } },
    fly(c,PF,k,P,x,a,h,t){ for(let w=0;w<3;w++){ const kk=k*1.3-w*0.18; if(kk<0||kk>1) continue; const fx=x.self.x+(P.tg.x-x.self.x)*eo(kk), gy=P.sg+(P.gnd-P.sg)*kk, H=P.R*(0.5+0.4*w)*(1-kk*0.2); for(let j=0;j<5;j++) PF(fx-P.d*P.S*0.3*j,gy-H*(0.3+j*0.15),P.S*(0.5-j*0.05),0.7*(1-kk*0.3),j%2?[205,190,165]:[180,165,140]);
        for(let j=0;j<3;j++) OWN.DR.clod(c,fx+(atH(j+w)-0.5)*P.S,gy-H*atH(j*3+w),P.S*0.1,[130,115,100],t/30+j,j);
        c.strokeStyle=`rgba(90,70,50,${0.8*(1-kk)})`; c.lineWidth=2; c.beginPath(); for(let j=0;j<=5;j++) c.lineTo(fx-P.d*P.S*(1.4-j*0.25),gy+(j%2?2:-2)+1); c.stroke(); } },
    land(c,PF,k,P,x,a,h,t){ OWN.SS.cloud(c,PF,P.tg.x,P.gnd-P.R*0.5,P.R*1.3,k,[[205,190,165],[180,165,140]],10,0.8,0.5); OWN.MT.debris(c,{x:P.tg.x,y:P.gnd-P.R*0.3},P.R,k,[130,115,100],10,0.1,5);
      c.strokeStyle=`rgba(90,70,50,${0.8*(1-k)})`; c.lineWidth=2.5; for(const sd of [-1,1]){ c.beginPath(); for(let i=0;i<=7;i++) c.lineTo(P.tg.x+sd*i*P.R*0.22*eo(Math.min(1,k*3)),P.gnd+(i%2?2:-2)); c.stroke(); } } },
  "Grit Storm":{at:[0.6,0.3],
    wind(c,PF,t,P,x,a){ const k=t/280; for(let i=0;i<4;i++) OWN.GU.feather(c,a.x+(i-1.5)*P.S*0.4,a.y-P.S*0.3*k,P.S*0.3,-Math.PI/2+(i-1.5)*0.3,[230,190,90]); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[225,200,150],5,0.45,0.6,0.6); for(let i=0;i<40;i++){ const f=((t/70)+atH(i))%1; if(f>k) continue; const p=OWN.GU.path(a,{x:h.x,y:h.y+(atH(i*3)-0.5)*P.R*1.6},f,P.R,0.2); c.strokeStyle=OWN.rgb(i%2?SAND:SAND2,0.9); c.lineWidth=2; c.beginPath(); c.moveTo(p.x,p.y); c.lineTo(p.x-P.d*P.S*0.3,p.y); c.stroke(); }
      OWN.GU.ride(8,a,h,k,t,P,(q,i)=>OWN.GU.feather(c,q.x,q.y,P.S*0.28,(P.d>0?0:Math.PI)+Math.sin(t/50+i)*0.8,i%2?[230,190,90]:[245,240,225]),0.8,0.05); },
    land(c,PF,k,P,x,a,h,t){ const R=P.R; for(let i=0;i<10;i++) PF(P.tg.x+P.d*R*(0.1+1.2*eo(k))+(atH(i)-0.5)*R,P.tg.y+(atH(i*3)-0.5)*R*1.4,P.S*(0.5+0.4*k),0.65*(1-k),[225,200,150]);
      for(let i=0;i<30;i++){ const f=((t/60)+atH(i))%1; c.strokeStyle=OWN.rgb(SAND,(1-f)*(1-k)); c.lineWidth=2; const yy=P.tg.y+(atH(i*3)-0.5)*R*1.8, xx=P.tg.x-R+f*R*2.2*P.d*0+(P.d>0?f*R*2.2:-f*R*2.2); c.beginPath(); c.moveTo(xx,yy); c.lineTo(xx-P.d*P.S*0.35,yy); c.stroke(); }
      OWN.GU.scatter(6,h,R,k,(q,i)=>OWN.GU.feather(c,q.x,q.y,P.S*0.26,k*8+i,i%2?[230,190,90]:[245,240,225],1-k)); OWN.SS.squint(c,P,k<0.8?1:(1-k)/0.2); } },
  "Ash Cloud":{mouth:true,
    wind(c,PF,t,P,x,a){ const k=t/280; atGlowA(c,a.x,a.y,P.S*(0.6+0.6*k),[255,120,40],0.7*k); for(let i=0;i<3;i++){ const q=((t/90)+i/3)%1; PF(a.x+P.d*q*P.S*0.4,a.y-q*P.S*0.6,P.S*0.25*(1+q),0.6*(1-q),ASH2); } },
    fly(c,PF,k,P,x,a,h,t){ for(let j=0;j<12;j++){ const kk=Math.max(0,k-j*0.05), p=OWN.DR.pos(a,h,eo(kk),P.R,0.15), w=P.S*(0.3+0.06*(12-j))*(1+kk*0.5); PF(p.x,p.y+Math.sin(t/50+j)*P.S*0.2,w,0.75,j%3?ASH2:[70,62,60]); }
      for(let i=0;i<14;i++){ const f=((t/120)+atH(i))%1; if(f>k) continue; const p=OWN.DR.pos(a,h,eo(f),P.R,0.15), px=p.x+(atH(i*3)-0.5)*P.S*1.2, py=p.y+(atH(i*5)-0.5)*P.S; atGlowA(c,px,py,P.S*0.25,[255,140,40],0.7); OWN.SS.grain(c,px,py,P.S*0.06,[255,190,90],i); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R; OWN.SS.cloud(c,PF,P.tg.x,P.tg.y,R*1.2,k,[ASH2,[70,62,60]],10,0.85,0.3); for(let i=0;i<12;i++){ const an=t/30+i*0.9, rr=R*(0.5+0.6*atH(i)); atGlowA(c,P.tg.x+Math.cos(an)*rr,P.tg.y+Math.sin(an)*rr*0.6,P.S*0.22,[255,140,40],0.7*(1-k)); }
      for(let i=0;i<3;i++){ const q=((k*2.5)+i/3)%1; PF(P.tg.x+P.d*R*(0.3+q*0.6),P.tg.y-R*0.1-q*R*0.4,P.S*(0.2+0.25*q),0.7*(1-q)*(1-k),[200,200,200]); } OWN.SS.squint(c,P,k<0.8?1:(1-k)/0.2); } },
  "Dirt Fling":{at:[0.9,0.55],
    wind(c,PF,t,P,x,a){ const k=t/280; OWN.DR.clod(c,a.x,a.y,P.S*0.35*eo(k),[80,70,55],t/80,3); OWN.SS.bone(c,a.x,a.y-P.S*0.15,P.S*0.25*eo(k),0.4); },
    fly(c,PF,k,P,x,a,h,t){ OWN.SS.fan(c,a,h,k,30,P.R,[[85,72,58],[60,52,42],[110,95,75]],P.S*0.1,11,0.9,1.5); const bp=OWN.DR.pos(a,{x:P.tg.x,y:P.head.y},eo(k),P.R,1.4); OWN.SS.bone(c,bp.x,bp.y,P.S*0.55,k*12);
      for(let i=0;i<4;i++){ const kk=Math.min(1,k*1.1-i*0.08); if(kk<0) continue; const p=OWN.DR.pos(a,{x:h.x+(atH(i)-0.5)*P.R,y:h.y+(atH(i*3)-0.5)*P.R},eo(kk),P.R,1.0); OWN.DR.clod(c,p.x,p.y,P.S*0.22,[80,70,55],kk*7+i,i); } },
    land(c,PF,k,P,x,a,h,t){ OWN.SS.cloud(c,PF,P.tg.x,P.tg.y,P.R,k,[[120,110,95],[95,88,75]],8,0.7); OWN.DR.splatStar(c,h.x,h.y+k*P.R*0.15,P.R*0.5,[80,70,55],0.3,1,t,k<0.7?1:(1-k)/0.3); OWN.MT.bonk?0:0; OWN.bonk(c,P.head.x,P.head.y,P.R*0.8,k);
      OWN.SS.bone(c,P.tg.x-P.d*P.R*1.3*k,P.head.y-P.R*1.1*Math.sin(Math.PI*k)+k*k*(P.gnd-P.head.y),P.S*0.55,P.d*k*10); OWN.SS.pile(c,P.tg.x,P.gnd,P.R*0.6*eo(Math.min(1,k*2)),[85,72,58]); } },
  "Grit Throw":{at:[0.95,0.45],
    wind(c,PF,t,P,x,a){ const k=t/280, hp={x:a.x,y:a.y}; c.fillStyle="rgba(80,70,55,.95)"; c.beginPath(); for(let i=0;i<9;i++){ const an=i/9*Math.PI*2, rr=P.S*0.4*eo(k)*(0.8+0.3*atH(i)); c.lineTo(hp.x+Math.cos(an)*rr,hp.y+Math.sin(an)*rr); } c.fill();
      for(let i=0;i<6;i++){ const q=((t/70)+i/6)%1; OWN.SS.grain(c,hp.x+(i-2.5)*P.S*0.12,hp.y+P.S*0.3+q*P.S*0.9,P.S*0.08,[110,100,85],i,1-q); } for(let i=0;i<5;i++){ const an=t/40+i*1.26; OWN.SS.grain(c,hp.x+Math.cos(an)*P.S*0.7*k,hp.y+Math.sin(an)*P.S*0.4*k,P.S*0.07,[140,130,110],an); } },
    fly(c,PF,k,P,x,a,h,t){ const src={x:a.x,y:a.y}, eye={x:P.tg.x,y:P.tg.y-P.R*0.25};
      const kk=eo(Math.min(1,k*1.05)), sp=k<0.3?0.25:0.25+1.3*(k-0.3)/0.7, c0=OWN.DR.pos(src,eye,kk,P.R,0.9);
      if(k<0.3){ c.fillStyle="rgba(80,70,55,.95)"; c.beginPath(); for(let i=0;i<9;i++){ const an=i/9*Math.PI*2, rr=P.S*0.4*(0.8+0.3*atH(i)); c.lineTo(c0.x+Math.cos(an)*rr,c0.y+Math.sin(an)*rr); } c.fill(); }
      for(let i=0;i<90;i++){ const ang=(atH(i)-0.5)*1.6+(P.d>0?0:Math.PI), rr=P.S*2.2*sp*atH(i*3), back=atH(i*7)*P.S*0.8*sp; const gx=c0.x+Math.cos(ang)*rr*0.35-P.d*back, gy=c0.y+Math.sin(ang)*rr*0.6;
        if(sp>0.4){ c.strokeStyle="rgba(90,80,65,.45)"; c.lineWidth=1; c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx-P.d*P.S*0.3,gy); c.stroke(); } OWN.SS.grain(c,gx,gy,P.S*(0.06+0.06*atH(i*5)),i%4?[100,90,75]:i%3?[150,140,120]:[60,55,45],i); }
      for(let i=0;i<5;i++){ const q=OWN.DR.pos(src,eye,eo(Math.max(0,k-0.08-i*0.06)),P.R,0.9); PF(q.x,q.y,P.S*(0.4-i*0.05),0.4,[140,130,110]); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.85?1:(1-k)/0.15, ey=P.tg.y-R*0.25; OWN.SS.cloud(c,PF,P.tg.x,ey,R*0.9,k,[[140,130,110],[110,100,85]],8,0.6);
      for(let i=0;i<16;i++){ c.fillStyle=`rgba(60,52,40,${0.85*al})`; c.beginPath(); c.arc(P.tg.x+(atH(i*3)-0.5)*R*1.3,ey+(atH(i*5)-0.5)*R*0.7,1.5+atH(i)*2,0,7); c.fill(); }
      c.strokeStyle=`rgba(40,30,20,${al})`; c.lineWidth=3.2; c.lineCap="round"; for(const sd of [-1,1]){ const ex=P.tg.x+sd*R*0.32; c.beginPath(); c.moveTo(ex-R*0.12,ey-R*0.12); c.lineTo(ex+R*0.12,ey+R*0.12); c.moveTo(ex+R*0.12,ey-R*0.12); c.lineTo(ex-R*0.12,ey+R*0.12); c.stroke(); OWN.DR.tear(c,ex,ey+R*0.2+((k*60)%1)*R*0.5,R*0.07,Math.PI/2,[170,215,250],al); }
      for(let i=0;i<30;i++){ const f=((k*1.2)+atH(i))%1; OWN.SS.grain(c,P.tg.x+(atH(i*3)-0.5)*R*1.5,ey+f*R*1.4,P.S*0.07,[110,100,85],i,(1-f)*al); }
      for(let i=0;i<3;i++){ const an=t/120+i*2.1; OWN.star(c,P.tg.x+Math.cos(an)*R*0.55,P.head.y-R*0.35+Math.sin(an)*R*0.15,R*0.14,`rgba(255,240,150,${al})`,an); } } },
  "Grave Dust":{at:[0.5,0.6],
    wind(c,PF,t,P,x,a){ const k=t/280; PF(a.x,a.y,P.S*(0.4+0.6*k),0.6,[150,175,145]); OWN.SS.skull(c,a.x,a.y-P.S*0.5,P.S*0.25*k,t,k); },
    fly(c,PF,k,P,x,a,h,t){ for(let j=0;j<12;j++){ const kk=Math.max(0,k-j*0.05), p=OWN.GU.path(a,h,kk,P.R,0.15,P.S*0.3,t,j); PF(p.x,p.y,P.S*(0.6-j*0.025),0.65*(1-j/14),j%2?[150,175,145]:[110,130,110]); }
      for(let i=0;i<3;i++){ const p=OWN.GU.path(a,h,Math.max(0,k-i*0.12),P.R,0.15,P.S*0.3,t,i); OWN.SS.skull(c,p.x,p.y-P.S*0.3,P.S*0.45,t+i*60,0.9); } for(let i=0;i<6;i++){ const f=((t/200)+i/6)%1, p=OWN.GU.path(a,h,k*f,P.R,0.15); OWN.star(c,p.x,p.y+(atH(i)-0.5)*P.S,P.S*0.08,"rgba(200,255,200,.8)",t/40+i); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, up=Math.sin(Math.min(1,k*1.4)*Math.PI); OWN.SS.cloud(c,PF,P.tg.x,P.tg.y,R*1.2,k,[[150,175,145],[110,130,110]],10,0.75); for(let i=0;i<3;i++) OWN.SS.hand(c,P.tg.x+(i-1)*R*0.55,P.gnd+2,R*1.0*up,t+i*50,1-Math.max(0,k-0.75)*4);
      for(let i=0;i<3;i++){ const an=t/40+i*2.1; OWN.SS.skull(c,P.tg.x+Math.cos(an)*R*0.9,P.tg.y-R*0.6+Math.sin(an)*R*0.3,P.S*0.25,t+i*40,1-k); } } },
  "Pink Mist":{at:[0.4,0.3],
    wind(c,PF,t,P,x,a){ const k=t/280; for(let i=0;i<6;i++){ const an=i/6*Math.PI*2+t/40; OWN.SS.spore(c,a.x+Math.cos(an)*P.S*0.8*k,a.y+Math.sin(an)*P.S*0.5*k,P.S*0.08,t,k); } PF(a.x,a.y,P.S*0.6*k,0.5,[255,170,215]); },
    fly(c,PF,k,P,x,a,h,t){ OWN.GU.stream(c,PF,a,h,k,t,P,[255,170,215],4,0.5,0.6,0.6); OWN.GU.ride(14,a,h,k,t,P,(q,i)=>OWN.SS.spore(c,q.x,q.y,P.S*(0.06+0.04*atH(i)),t+i*20),0.9,0.04);
      for(let i=0;i<8;i++){ const f=((t/150)+i/8)%1, p=OWN.GU.path(a,h,k*f,P.R,0.25); OWN.star(c,p.x+(atH(i)-0.5)*P.S,p.y+(atH(i*3)-0.5)*P.S,P.S*0.1,"rgba(255,230,245,.95)",t/30+i); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R; OWN.SS.cloud(c,PF,P.tg.x,P.tg.y,R*1.2,k,[[255,170,215],[240,140,200]],10,0.7); for(let i=0;i<12;i++){ const an=t/40+i*0.6, rr=R*(0.5+0.6*atH(i)); OWN.SS.spore(c,P.tg.x+Math.cos(an)*rr,P.tg.y+Math.sin(an)*rr*0.6-R*0.2,P.S*(0.06+0.04*atH(i)),t,1-k); }
      for(let i=0;i<3;i++){ const an=t/90+i*2.1; c.strokeStyle=`rgba(255,150,210,${0.9*(1-k)})`; c.lineWidth=2; c.beginPath(); for(let j=0;j<=12;j++){ const f=j/12, aa=an+f*5, rr=R*0.15*f; c.lineTo(P.tg.x+(i-1)*R*0.45+Math.cos(aa)*rr,P.head.y-R*0.3+Math.sin(aa)*rr); } c.stroke(); } } }
};
OWN.SS.claw=(c,x,y,r,rot,d,al)=>{ if(al<=0) return; c.save(); c.translate(x,y); c.rotate(rot); c.scale(d,1); c.globalAlpha*=al; c.fillStyle="#5a6a5a"; c.strokeStyle="#2a342a"; c.lineWidth=1.4;
  c.beginPath(); c.ellipse(0,0,r*0.5,r*0.42,0,0,7); c.fill(); OWN.ol(c); for(let i=0;i<4;i++){ const a=-0.9+i*0.45; c.beginPath(); c.moveTo(Math.cos(a)*r*0.35,Math.sin(a)*r*0.35); c.quadraticCurveTo(Math.cos(a)*r*0.75,Math.sin(a)*r*0.75-r*0.1,Math.cos(a+0.25)*r*0.85,Math.sin(a+0.25)*r*0.85); c.lineWidth=r*0.14; c.strokeStyle="#5a6a5a"; c.stroke(); c.lineWidth=1.2; c.strokeStyle="#2a342a"; c.stroke(); }
  c.fillStyle="rgba(80,70,55,.95)"; c.beginPath(); c.arc(r*0.2,r*0.05,r*0.3,0,7); c.fill(); for(let i=0;i<5;i++){ c.fillStyle="#9a8a70"; c.beginPath(); c.arc(r*0.2+(atH(i)-0.5)*r*0.4,r*0.05+(atH(i*3)-0.5)*r*0.4,1.5,0,7); c.fill(); } c.restore(); };
OWN.SS.ashFlake=(c,x,y,r,rot,al=1)=>{ c.save(); c.translate(x,y); c.rotate(rot); c.scale(1,Math.cos(rot*1.3)*0.5+0.6); c.fillStyle=`rgba(120,115,112,${0.9*al})`; c.beginPath(); c.moveTo(-r,-r*0.3); c.lineTo(r*0.8,-r*0.5); c.lineTo(r,r*0.4); c.lineTo(-r*0.6,r*0.5); c.closePath(); c.fill(); c.strokeStyle=`rgba(255,130,50,${0.8*al})`; c.lineWidth=1; c.beginPath(); c.moveTo(r*0.8,-r*0.5); c.lineTo(r,r*0.4); c.stroke(); c.restore(); };
OWN.sandFx=(c,t,x,o)=>{ OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:o.at||[0.9,0.5],sz:1.2}); P.S*=1.8; OWN.GU.d=P.d;
    const fr=OWN.pt(x.self,x.target,[1,0.5]).x, s=x.self, a=o.mouth&&s.mouth?{x:fr+P.d*P.S*0.2,y:s.mouth.y}:o.inside?P.o0:{x:fr+P.d*P.S*0.15,y:P.o0.y}, h={x:P.tg.x-P.d*P.R*0.15,y:P.tg.y-P.R*0.25};
    if(t<280){ if(o.wind) o.wind(c,PF,t,P,x,a); return; }
    if(t<500){ o.fly(c,PF,(t-280)/220,P,x,a,h,t); return; }
    o.land(c,PF,Math.min(1,(t-500)/680),P,x,a,h,t); }); };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.sandspray) return; const K=ANIM.sandspray, fx1=K.fx;
  K.fx=function(c,t,x){ const o=x&&OWN_SAND[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ OWN.sandFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN sand",x.name,e&&e.message); } } }; })();

/* ---------- bolt and steam fixes (Gid, 19 Nov 2026): Slime Spit flies as an uneven globule, Light Dart is a glowing dart, Drip drops one
   big droplet from a cloud overhead, Spark Shot and Zap Shot crackle with real electric currents, Sting Shot is bigger, Hot Blob is a
   large lava blob, Shadow Bolt is a mass of shadow energy, Kitsune's Fireball burns orange, Static Feather crackles, Smoke Ring is
   smokier and bigger, and Frost Breath is ice blue. ---------- */
/* an uneven, wobbling globule of goo lit from the top left */
OWN.glob=(c,x,y,r,t,col,ang=0,stretch=0,seed=0,al=1)=>{ if(r<1||al<=0) return; c.save(); c.translate(x,y); c.rotate(ang); c.scale(1+stretch,1-stretch*0.45); c.globalAlpha*=al;
  const n=9, pts=[]; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, w=1+0.15*Math.sin(t/55+i*2.1+seed)+0.11*Math.sin(t/37+i*3.7+seed*2)+(atH(i+seed*7)-0.5)*0.24; pts.push([Math.cos(a)*r*w,Math.sin(a)*r*w]); }
  c.fillStyle=OWN.CH.grad(c,0,0,r*1.2,col); c.beginPath();
  for(let i=0;i<n;i++){ const p0=pts[i], p1=pts[(i+1)%n]; if(i===0){ const pl=pts[n-1]; c.moveTo((pl[0]+p0[0])/2,(pl[1]+p0[1])/2); } c.quadraticCurveTo(p0[0],p0[1],(p0[0]+p1[0])/2,(p0[1]+p1[1])/2); }
  c.closePath(); c.fill(); OWN.CH.shine(c,-r*0.32,-r*0.42,r*0.3,r*0.13,0.75,-0.4); c.fillStyle="rgba(255,255,255,.55)"; c.beginPath(); c.arc(r*0.35,r*0.28,r*0.07,0,7); c.fill(); c.restore(); };
/* a crackling electric current: a wide glow, a coloured bolt, a white core and one fork */
OWN.zap=(c,x0,y0,x1,y1,seed,col,w,amp,n=6,br=true,al=1)=>{ if(al<=0) return; c.save(); c.globalAlpha*=al; c.shadowColor=OWN.rgb(col,1); c.shadowBlur=w*4;
  OWN.zig(c,x0,y0,x1,y1,n,amp,seed,OWN.rgb(col,0.45),w*2.8); c.shadowBlur=w*2; OWN.zig(c,x0,y0,x1,y1,n,amp,seed,OWN.rgb(OWN.mix(col,[255,255,255],0.3),0.95),w); c.shadowBlur=0;
  OWN.zig(c,x0,y0,x1,y1,n,amp,seed,"rgba(255,255,255,.95)",Math.max(1,w*0.4));
  if(br){ const k=0.4+atH(seed*3)*0.25, mx=x0+(x1-x0)*k, my=y0+(y1-y0)*k, ang=Math.atan2(y1-y0,x1-x0)+(atH(seed*5)>0.5?0.75:-0.75), L=Math.hypot(x1-x0,y1-y0)*0.42;
    OWN.zap(c,mx,my,mx+Math.cos(ang)*L,my+Math.sin(ang)*L,seed+11,col,w*0.6,amp*0.6,4,false); }
  c.restore(); };
OWN.bigDrop=(c,x,y,s,stretch=0,al=1)=>{ if(s<1||al<=0) return; c.save(); c.translate(x,y); c.scale(1-stretch*0.25,1+stretch); c.globalAlpha*=al; c.shadowColor="rgba(70,130,230,.45)"; c.shadowBlur=s*0.5;
  c.fillStyle=OWN.rg(c,0,s*0.2,s*0.05,s*1.3,[[0,"#f4fbff"],[0.45,"#92ccff"],[1,"#3c82de"]],-s*0.35,-s*0.15); c.beginPath(); c.moveTo(0,-s*1.5);
  c.bezierCurveTo(s*0.3,-s*0.9,s*0.95,-s*0.35,s*0.95,s*0.2); c.arc(0,s*0.2,s*0.95,0,Math.PI); c.bezierCurveTo(-s*0.95,-s*0.35,-s*0.3,-s*0.9,0,-s*1.5); c.fill(); c.shadowColor="transparent";
  OWN.CH.shine(c,-s*0.42,-s*0.05,s*0.15,s*0.32,0.85,0.3); c.fillStyle="rgba(255,255,255,.5)"; c.beginPath(); c.arc(s*0.4,s*0.55,s*0.1,0,7); c.fill(); c.restore(); };
Object.assign(OWN_BOLT2.Trundle,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=[150,222,100], end={x:tg.x-d*R*0.3,y:tg.y-R*0.05};
    if(t<220){ const k=OWN.k(t,60,220); if(k>0) OWN.glob(c,o0.x+d*S*0.45,o0.y,S*0.7*eo(k),t,col,0,0,1); return; }
    if(t<560){ const k=OWN.k(t,220,560), e=eo(k), p=OWN.go(o0,end,e,S*1.2,0), q=OWN.go(o0,end,Math.min(1,e+0.03),S*1.2,0), ang=Math.atan2(q.y-p.y,q.x-p.x);
      if(k<0.55){ const a=1-k/0.55; c.strokeStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.15),0.85*a); c.lineCap="round"; c.lineWidth=Math.max(1.5,S*0.32*(1-k)); c.beginPath(); c.moveTo(o0.x,o0.y); const m=OWN.go(o0,p,0.5,S*0.6+k*S,0); c.quadraticCurveTo(m.x,m.y+S*0.3,p.x,p.y); c.stroke(); }
      for(let i=1;i<5;i++){ const pp=OWN.go(o0,end,Math.max(0,e-i*0.07),S*1.2,0); OWN.glob(c,pp.x+(atH(i)-0.5)*S*0.5,pp.y+(atH(i*3)-0.3)*S*0.5+i*S*0.15,S*(0.3-i*0.045),t,col,ang,0.2,i*3); }
      OWN.glob(c,p.x,p.y,S*1.05,t,col,ang,0.12+0.3*Math.sin(Math.PI*k),1); return; }
    const k=OWN.k(t,560,900); OWN.splat(c,end.x,end.y,S*1.35,col,k,31,4);
    for(let i=0;i<3;i++){ const sl=Math.min(1,k*1.3)*R*(0.25+0.35*atH(i)), a=k<0.75?1:1-(k-0.75)/0.25; OWN.glob(c,end.x+(i-1)*S*0.9,end.y+sl,S*(0.42-0.07*i),t,col,Math.PI/2,0.35*Math.min(1,k*2),i*5,a); } } });
Object.assign(OWN_BOLT2.Lumo,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, end={x:tg.x-d*R*0.2,y:tg.y-R*0.1};
    const dart=(p,ang,s,a=1)=>{ c.save(); c.translate(p.x,p.y); c.rotate(ang); c.globalAlpha*=a; atGlowA(c,0,0,s*3,col,0.7); atGlowA(c,s*0.4,0,s*1.3,[255,255,235],0.9);
      c.shadowColor=OWN.rgb(col,1); c.shadowBlur=s*1.4; const g=c.createLinearGradient(-s*1.7,0,s*1.5,0); g.addColorStop(0,OWN.rgb(col,0)); g.addColorStop(0.45,OWN.rgb(col,0.9)); g.addColorStop(1,"rgba(255,255,245,1)"); c.fillStyle=g;
      c.beginPath(); c.moveTo(s*1.6,0); c.quadraticCurveTo(s*0.2,-s*0.45,-s*1.7,0); c.quadraticCurveTo(s*0.2,s*0.45,s*1.6,0); c.fill();
      c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.45),0.9); for(const sd of [-1,1]){ c.beginPath(); c.moveTo(-s*0.45,0); c.quadraticCurveTo(-s*0.85,sd*s*0.65,-s*1.3,sd*s*0.8); c.quadraticCurveTo(-s*0.95,sd*s*0.28,-s*0.85,0); c.fill(); }
      c.shadowBlur=s*0.6; c.fillStyle="#fffef4"; c.beginPath(); c.ellipse(s*0.55,0,s*0.7,s*0.13,0,0,7); c.fill(); c.restore(); OWN.star(c,p.x+Math.cos(ang)*s*1.4,p.y+Math.sin(ang)*s*1.4,s*0.8,"rgba(255,255,240,.95)",t/30); };
    if(t<420){ const pulse=Math.max(0,Math.sin(Math.PI*((t%140)/140))), n=Math.floor(t/140); atGlowA(c,o0.x,o0.y,S*(1.6+1.4*pulse+n*0.5),col,0.55+0.4*pulse);
      if(t>300){ const k=OWN.k(t,300,420); dart({x:o0.x+d*S*0.6*k,y:o0.y},d>0?0:Math.PI,S*1.2*eo(k),k); } return; }
    const ang=Math.atan2(end.y-o0.y,end.x-o0.x), st={x:o0.x+d*S*0.6,y:o0.y};
    if(t<560){ const k=ei(OWN.k(t,420,560)), hx=st.x+(end.x-st.x)*k, hy=st.y+(end.y-st.y)*k, tl=Math.max(0,k-0.5), tx=st.x+(end.x-st.x)*tl, ty=st.y+(end.y-st.y)*tl;
      const g=c.createLinearGradient(tx,ty,hx,hy); g.addColorStop(0,OWN.rgb(col,0)); g.addColorStop(1,OWN.rgb(col,0.6)); c.save(); c.shadowColor=OWN.rgb(col,1); c.shadowBlur=S*0.8; c.strokeStyle=g; c.lineCap="round"; c.lineWidth=S*0.55; c.beginPath(); c.moveTo(tx,ty); c.lineTo(hx,hy); c.stroke(); c.restore();
      for(let i=0;i<7;i++){ const q=tl+(k-tl)*atH(i*3+Math.floor(t/40)); OWN.star(c,st.x+(end.x-st.x)*q+(atH(i)-0.5)*S*0.9,st.y+(end.y-st.y)*q+(atH(i*5)-0.5)*S*0.9,S*0.22,OWN.rgb([255,255,230],0.9),t/40+i); }
      dart({x:hx,y:hy},ang,S*1.3); return; }
    const k=OWN.k(t,560,860); if(k>=1) return; atGlowA(c,end.x,end.y,R*(0.8+0.8*k),col,0.8*(1-k)); OWN.star(c,end.x,end.y,S*(1.3+2.6*eo(k)),OWN.rgb(col,1-k),k*1.5); OWN.star(c,end.x,end.y,S*(0.6+1.2*eo(k)),OWN.rgb([255,255,255],1-k),-k);
    for(let i=0;i<6;i++){ const aa=i/6*7+0.5, dd=R*(0.4+1.0*eo(k)); OWN.star(c,end.x+Math.cos(aa)*dd,end.y+Math.sin(aa)*dd,S*0.4*(1-k),OWN.rgb(col,1-k),k*4); } } });
Object.assign(OWN_BOLT2.Nimbo,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,head}=P, cs=S*1.7, cc=P.body?OWN.mix(P.body,[255,255,255],0.25):[230,238,252], hy=head.y+R*0.08;
    const over={x:tg.x-d*R*0.05,y:head.y-R*2.2-cs*0.3};
    let cp, ca=1, dark=0;
    if(t<220){ const k=eo(t/220); cp={x:o0.x+d*S*0.8*k,y:o0.y-S*0.3*k}; OWN.cloud(c,cp.x,cp.y,cs*(0.3+0.7*k),cc,0.95); return; }
    if(t<400){ const k=eio(OWN.k(t,220,400)), st={x:o0.x+d*S*0.8,y:o0.y-S*0.3}; cp=lerpP(st,over,k,0,-S*1.5*Math.sin(Math.PI*k)); cp.y+=Math.sin(t/70)*2; }
    else { cp={x:over.x+Math.sin(t/120)*2,y:over.y+Math.sin(t/90)*1.5}; dark=OWN.k(t,400,450); ca=1-OWN.k(t,720,860); }
    OWN.cloud(c,cp.x,cp.y,cs,OWN.mix(cc,[100,115,150],dark*0.5),0.95*ca);
    const by=cp.y+cs*0.45, ds=S*1.0;
    if(t>=400&&t<480){ const k=eo(OWN.k(t,400,480)); OWN.bigDrop(c,cp.x,by+ds*0.6*k,ds*(0.3+0.7*k),0.35*k); return; }
    if(t>=480&&t<560){ const k=ei(OWN.k(t,480,560)); OWN.bigDrop(c,cp.x,by+ds*0.6+(hy-ds*0.8-by-ds*0.6)*k,ds,0.35-0.25*k); return; }
    if(t>=560){ const k=OWN.k(t,560,900); if(k>=1) return; const a=k<0.7?1:1-(k-0.7)/0.3;
      if(k<0.18){ const q=k/0.18; c.save(); c.translate(cp.x,hy-ds*0.2); c.scale(1+q*0.9,1-q*0.6); OWN.bigDrop(c,0,0,ds,0,1-q); c.restore(); }
      OWN.DR.coat(c,P,Math.min(1,k*1.6),[120,180,255],0.5*a,true,1.8,6);
      for(let i=0;i<9;i++){ const aa=Math.PI+i/8*Math.PI, v=R*(0.4+0.8*eo(Math.min(1,k*1.6))), px=cp.x+Math.cos(aa)*v, py=hy-Math.sin(Math.PI*Math.min(1,k*1.4))*R*(0.5+0.3*atH(i))+Math.min(1,k*1.4)*R*0.6*(Math.abs(Math.cos(aa)));
        OWN.bigDrop(c,px,py,S*(0.16+0.08*atH(i*3))*(1-k*0.6),0,a); }
      c.strokeStyle=OWN.rgb([170,215,255],0.8*(1-k)); c.lineWidth=3*(1-k)+1; c.beginPath(); c.ellipse(cp.x,hy,R*(0.3+0.9*eo(k)),R*(0.08+0.2*eo(k)),0,0,7); c.stroke(); } } });
Object.assign(OWN_BOLT2.Clank,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=o.col, el=[255,235,110], end={x:tg.x-d*R*0.2,y:tg.y-R*0.1}, key=OWN.pt(P.s,tg,[0.0,0.35]), sd=Math.floor(t/45);
    if(t<240){ for(let i=0;i<3;i++){ const a0=t/30+i*2.1; c.strokeStyle=OWN.rgb([230,230,240],0.8); c.lineWidth=2.4; c.lineCap="round"; c.beginPath(); c.arc(key.x,key.y,S*(1+i*0.25),a0,a0+1.2); c.stroke(); }
      atGlowA(c,o0.x,o0.y,S*(1+t/160),el,0.6); for(let i=0;i<5;i++){ const aa=i/5*7+sd; OWN.zap(c,o0.x,o0.y,o0.x+Math.cos(aa)*S*1.8,o0.y+Math.sin(aa)*S*1.5,i+sd*7,el,S*0.1,S*0.3,4,false,0.9); } return; }
    const ballAt=(p)=>{ atGlowA(c,p.x,p.y,S*3,el,0.65); atGlowA(c,p.x,p.y,S*1.4,[255,255,230],0.9);
      for(let i=0;i<7;i++){ const aa=i/7*7+sd*0.9, r2=S*(1.6+0.6*atH(i+sd)); OWN.zap(c,p.x,p.y,p.x+Math.cos(aa)*r2,p.y+Math.sin(aa)*r2,i+sd*5,el,S*0.11,S*0.35,5,i%2===0); }
      c.save(); c.shadowColor=OWN.rgb(el,1); c.shadowBlur=S*0.8; c.fillStyle=OWN.rg(c,p.x,p.y,0,S*0.65,[[0,"#ffffff"],[0.5,"#fff6b0"],[1,"rgba(255,220,80,.85)"]]); c.beginPath(); c.arc(p.x,p.y,S*0.62,0,7); c.fill(); c.restore(); };
    if(t<560){ const k=OWN.k(t,220,560), e=eio(k), p=OWN.go(o0,end,e,S*1.6,Math.sin(k*Math.PI*4)*S*0.3), pb=OWN.go(o0,end,Math.max(0,e-0.18),S*1.6,0);
      OWN.zap(c,pb.x,pb.y,p.x,p.y,sd*3,el,S*0.12,S*0.5,6,true,0.8); ballAt(p); return; }
    const k=OWN.k(t,560,860);
    if(k<0.55){ const a=1-k/0.55; atGlowA(c,end.x,end.y,R*(0.8+k*1.4),el,0.9*a); for(let i=0;i<8;i++){ const aa=i/8*7; OWN.zap(c,end.x,end.y,end.x+Math.cos(aa)*R*(0.8+k*1.5),end.y+Math.sin(aa)*R*(0.8+k*1.5),i*3+sd,el,S*0.14,S*0.4,5,true,a); }
      OWN.zap(c,end.x,end.y,end.x+d*S*0.4,P.gnd,sd+40,el,S*0.14,S*0.5,6,false,a); }
    const part=(i,draw)=>{ const vx=(i?1:-0.6)*-d*R*1.1, px=end.x+vx*k, py=end.y-R*1.4*Math.sin(Math.PI*Math.min(1,k*1.2))+k*k*R*1.2; c.save(); c.translate(px,py); c.rotate(k*9*(i?1:-1)); c.globalAlpha*=k<0.8?1:1-(k-0.8)/0.2; draw(); c.restore(); };
    part(0,()=>{ c.fillStyle=OWN.rg(c,0,0,0,S*0.55,[[0,"#dfe4ee"],[1,"#8a93a8"]],-S*0.15,-S*0.15); c.beginPath(); for(let j=0;j<6;j++){ const aa=j/6*7; c[j?"lineTo":"moveTo"](Math.cos(aa)*S*0.55,Math.sin(aa)*S*0.55); } c.fill(); c.fillStyle="#4a5062"; c.beginPath(); c.arc(0,0,S*0.22,0,7); c.fill(); });
    part(1,()=>{ c.fillStyle="#c4cad8"; c.beginPath(); c.roundRect(-S*0.13,-S*0.6,S*0.26,S*1.15,S*0.08); c.fill(); c.fillStyle="#9aa2b6"; c.beginPath(); c.roundRect(-S*0.34,-S*0.78,S*0.68,S*0.26,S*0.08); c.fill(); }); } });
Object.assign(OWN_BOLT2.Magna,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, red=[255,95,95], blue=[95,160,255], p1=OWN.pt(P.s,tg,[0.15,0.95]), p2=OWN.pt(P.s,tg,[0.95,0.95]), end={x:tg.x-d*R*0.2,y:tg.y-R*0.1}, sd=Math.floor(t/40);
    const st={x:(p1.x+p2.x)/2+d*S*0.6,y:(p1.y+p2.y)/2};
    if(t<240){ OWN.zap(c,p1.x,p1.y,p2.x,p2.y,sd,t%80<40?red:blue,S*0.12,S*0.5,7,false); atGlowA(c,st.x,st.y,S*(0.9+t/110),[235,210,255],0.65); return; }
    if(t<560){ const k=OWN.k(t,220,560), head=eo(k), hp={x:st.x+(end.x-st.x)*head,y:st.y+(end.y-st.y)*head};
      OWN.zap(c,st.x,st.y-S*0.3,hp.x,hp.y-S*0.15,sd,red,S*0.15,S*0.7,9,true); OWN.zap(c,st.x,st.y+S*0.3,hp.x,hp.y+S*0.15,sd+17,blue,S*0.15,S*0.7,9,true);
      atGlowA(c,hp.x,hp.y,S*1.8,[255,240,255],0.8); return; }
    const k=OWN.k(t,560,860), a=1-k; atGlowA(c,tg.x,tg.y,R*1.2,[230,200,255],0.6*a);
    for(let i=0;i<6;i++){ const aa=i/6*7+sd*0.7, r1=R*0.35, r2=R*(1.0+0.3*atH(i+sd)); OWN.zap(c,tg.x+Math.cos(aa)*r1,tg.y+Math.sin(aa)*r1,tg.x+Math.cos(aa+0.5)*r2,tg.y+Math.sin(aa+0.5)*r2,i+sd*3,i%2?red:blue,S*0.13,S*0.35,5,i%3===0,a); } } });
Object.assign(OWN_BOLT2.Bloop,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=P.parts||o.col, end={x:tg.x-d*R*0.35,y:tg.y-R*0.05}, el=[255,240,120];
    const tent=(x0,y0,x1,y1,ph,a,w)=>{ c.save(); c.globalAlpha*=a; c.lineCap="round"; for(const [ww,cc] of [[w,OWN.rgb(col,0.55)],[w*0.45,OWN.rgb(OWN.mix(col,[255,255,255],0.5),0.85)]]){ c.strokeStyle=cc; c.lineWidth=ww; c.beginPath(); for(let i=0;i<=16;i++){ const q=i/16, p=OWN.go({x:x0,y:y0},{x:x1,y:y1},q,0,Math.sin(q*9+ph)*S*0.35*q); c[i?"lineTo":"moveTo"](p.x,p.y); } c.stroke(); } c.restore(); };
    if(t<240){ const k=eo(Math.min(1,t/200)); for(let j=0;j<3;j++) tent(o0.x+(j-1)*S*0.35,o0.y-S*0.3,o0.x+d*S*(0.9+1.8*k),o0.y+S*(0.2+0.4*j)-S*k*0.6,t/40+j,0.95,S*0.3); return; }
    const sting=(p,ang,s,a=1)=>{ c.save(); c.translate(p.x,p.y); c.rotate(ang); c.globalAlpha*=a; atGlowA(c,0,0,s*2,col,0.5); c.shadowColor=OWN.rgb(col,0.9); c.shadowBlur=s*0.5;
      c.fillStyle=OWN.rg(c,0,0,0,s*1.2,[[0,"#ffffff"],[0.5,OWN.rgb(OWN.mix(col,[255,255,255],0.55))],[1,OWN.rgb(col)]],-s*0.2,-s*0.2);
      c.beginPath(); c.moveTo(s*1.25,0); c.quadraticCurveTo(s*0.2,-s*0.3,-s*0.35,-s*0.45); c.quadraticCurveTo(-s*0.15,-s*0.1,-s*0.55,0); c.quadraticCurveTo(-s*0.15,s*0.1,-s*0.35,s*0.45); c.quadraticCurveTo(s*0.2,s*0.3,s*1.25,0); c.fill();
      c.shadowColor="transparent"; OWN.CH.shine(c,s*0.1,-s*0.12,s*0.4,s*0.06,0.8,0); c.fillStyle="rgba(255,255,255,.95)"; c.beginPath(); c.arc(s*1.15,0,s*0.07,0,7); c.fill(); c.restore(); };
    const ang=Math.atan2(end.y-o0.y,end.x-o0.x);
    if(t<560){ const k=eo(OWN.k(t,220,560)), p=OWN.go(o0,end,k,S*0.6,0); tent(o0.x,o0.y,p.x,p.y,t/30,0.85,S*0.28); sting(p,ang,S*1.25);
      if(Math.floor(t/40)%2===0) OWN.zap(c,p.x-Math.cos(ang)*S,p.y-Math.sin(ang)*S,p.x+Math.cos(ang)*S*0.6,p.y+Math.sin(ang)*S*0.6-S*0.3,Math.floor(t/40),el,S*0.07,S*0.25,4,false,0.8); return; }
    const k=OWN.k(t,560,860); if(k<0.35){ tent(o0.x,o0.y,end.x,end.y,t/30,0.85*(1-k/0.35),S*0.26); sting(end,ang,S*1.25,1-k/0.35); }
    atGlowA(c,tg.x,tg.y,R*1.1,el,0.5*(1-k)); for(let i=0;i<6;i++){ const aa=i/6*7+Math.floor(t/50), xx=tg.x+Math.cos(aa)*R*0.8, yy=tg.y+Math.sin(aa)*R*0.65; OWN.zap(c,xx,yy,xx+Math.cos(aa)*S*1.3,yy+Math.sin(aa)*S*1.3,i+Math.floor(t/50),el,S*0.1,S*0.3,4,false,1-k); } } });
Object.assign(OWN_BOLT2.Lava,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=P.parts||o.col, lava=OWN.mix(col,[255,150,60],0.4), mid=OWN.pt(P.s,tg,[0.5,0.7]), end={x:tg.x-d*R*0.25,y:tg.y-R*0.15};
    const blob=(p,r,ang,st)=>{ atGlowA(c,p.x,p.y,r*2.8,[255,140,60],0.55); OWN.glob(c,p.x,p.y,r,t,lava,ang,st,4);
      c.save(); c.fillStyle="rgba(255,250,200,.85)"; c.beginPath(); c.ellipse(p.x+r*0.15,p.y+r*0.1,r*0.35,r*0.25,0,0,7); c.fill(); c.fillStyle="rgba(120,40,30,.45)"; for(let i=0;i<4;i++){ const aa=i*1.7+0.6; c.beginPath(); c.ellipse(p.x+Math.cos(aa)*r*0.6,p.y+Math.sin(aa)*r*0.55,r*0.16,r*0.1,aa,0,7); c.fill(); } c.restore(); };
    if(t<220){ const k=eio(Math.min(1,t/220)); blob({x:mid.x+(o0.x-mid.x)*k,y:mid.y+(o0.y-S*0.5-mid.y)*k},S*0.65*(0.7+0.3*k),-Math.PI/2,0.1); return; }
    const top={x:o0.x,y:o0.y-S*0.7};
    if(t<560){ const k=OWN.k(t,220,560), p=OWN.go(top,end,k,R*2.4,0), q=OWN.go(top,end,Math.min(1,k+0.03),R*2.4,0);
      for(let i=1;i<6;i++){ const s0=OWN.go(top,end,Math.max(0,k-i*0.06),R*2.4,0); SG.puff(c,s0.x,s0.y-i*2,S*(0.35+i*0.1),0.45*(1-i/6),[120,110,110]); }
      for(let i=1;i<4;i++){ const s0=OWN.go(top,end,Math.max(0,k-i*0.05),R*2.4,0); OWN.glob(c,s0.x,s0.y+S*0.4,S*(0.22-i*0.04),t,lava,0,0,i*9); }
      blob(p,S*1.25,Math.atan2(q.y-p.y,q.x-p.x),0.15); return; }
    const k=OWN.k(t,560,900); atGlowA(c,end.x,end.y,R*(1.2-k*0.5),[255,140,60],0.6*(1-k)); OWN.splat(c,end.x,end.y,S*1.6,OWN.mix(lava,[255,220,120],0.2*(1-k)),k,41,4); OWN.smoke(c,end.x,end.y-S*0.6,S*1.0,k,[235,235,240],5); } });
Object.assign(OWN_BOLT2.Vampire,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x-d*R*0.2,y:tg.y-R*0.15};
    const mass=(p,s,a=1,dir=d)=>{ if(s<1||a<=0) return; c.save(); c.globalAlpha*=a; atGlowA(c,p.x,p.y,s*2.6,[170,60,200],0.45); atGlowA(c,p.x,p.y,s*1.4,[230,90,200],0.35);
      for(let i=0;i<7;i++){ const ph=i/7*Math.PI*2, L=s*(1.6+0.6*atH(i)); c.strokeStyle=OWN.rgb(i%2?[60,22,80]:[110,40,140],0.75); c.lineCap="round"; c.lineWidth=s*(0.32-0.02*i); c.beginPath(); c.moveTo(p.x,p.y);
        for(let j=1;j<=8;j++){ const q=j/8; c.lineTo(p.x-dir*L*q+Math.sin(ph+t/60+q*4)*s*0.45*q,p.y+Math.cos(ph)*s*0.6*q+Math.sin(t/50+i+q*5)*s*0.3*q); } c.stroke(); }
      c.fillStyle=OWN.rg(c,p.x,p.y,s*0.05,s*1.05,[[0,"rgba(255,140,230,.95)"],[0.25,"rgba(150,50,190,.95)"],[0.7,"rgba(55,18,75,.95)"],[1,"rgba(30,8,45,.0)"]]); c.beginPath(); c.arc(p.x,p.y,s*1.05,0,7); c.fill();
      c.strokeStyle="rgba(240,170,255,.7)"; c.lineWidth=Math.max(1.5,s*0.08); for(let i=0;i<3;i++){ const a0=t/70+i*2.1; c.beginPath(); c.arc(p.x,p.y,s*(0.45+0.15*i),a0,a0+1.6); c.stroke(); } c.restore(); };
    if(t<220){ const k=Math.min(1,t/220); for(let i=0;i<6;i++){ const aa=i/6*7+t/60, rr=S*1.8*(1-k); SG.puff(c,o0.x+d*S*0.6+Math.cos(aa)*rr,o0.y+Math.sin(aa)*rr,S*0.45,0.6*k,[80,35,100]); } mass({x:o0.x+d*S*0.6,y:o0.y},S*0.9*eo(k)); return; }
    if(t<560){ const k=OWN.k(t,220,560), st={x:o0.x+d*S*0.6,y:o0.y}, p=OWN.go(st,end,k,S*1.4,Math.sin(k*Math.PI*2)*S*0.5);
      for(let i=1;i<6;i++){ const q=OWN.go(st,end,Math.max(0,k-i*0.05),S*1.4,0); SG.puff(c,q.x,q.y,S*(0.5-i*0.06),0.4*(1-i/6),[70,30,95]); }
      mass(p,S*1.35); return; }
    const k=OWN.k(t,560,880); if(k<0.3) mass(end,S*1.1*(1+k*1.5),1-k/0.3);
    for(let i=0;i<10;i++){ const aa=i/10*7, dd=R*(0.2+1.0*eo(k)); SG.puff(c,end.x+Math.cos(aa)*dd,end.y+Math.sin(aa)*dd*0.7-k*R*0.3,S*(0.55+0.7*k),0.7*(1-k),i%3?[70,30,95]:[150,60,180]); } } });
/* a comet of fire: a round head with flame tongues streaming back, deep red to yellow, and a white-hot core */
OWN.comet=(c,p,s,ang,t,str=1,a=1)=>{ if(s<1||a<=0) return; const glow=[255,150,60]; c.save(); c.globalAlpha*=a; atGlowA(c,p.x,p.y,s*3.4,glow,0.6); c.translate(p.x,p.y); c.rotate(ang);
      /* a round head with long flame tongues streaming back, in three layers from deep red to yellow, then a hot white core */
      const layer=(sc,lenK,n,seed,c0,c1,c2)=>{ const r=s*sc, ys=[]; for(let i=0;i<n;i++) ys.push((-1+2*(i+0.5)/n)*r*0.95);
        c.beginPath(); c.moveTo(0,-r); c.arc(0,0,r,-Math.PI/2,Math.PI/2); let py=r;
        for(let i=n-1;i>=0;i--){ const L=r*lenK*(0.7+0.6*atH(i*5+seed))*str*(1+0.12*Math.sin(t/38+i*1.9+seed)), ty=ys[i]*1.2+Math.sin(t/45+i*2.3+seed)*r*0.2;
          const ny=i>0?(ys[i]+ys[i-1])/2:-r, nx=i>0?-r*0.5*(0.8+0.5*atH(i*3+seed)):0;
          c.quadraticCurveTo(-L*0.45,py+(ty-py)*0.25,-L,ty); c.quadraticCurveTo(-L*0.5,ty+(ny-ty)*0.75,nx,ny); py=ny; }
        c.closePath(); const g=c.createLinearGradient(-r*lenK*1.3*str,0,r,0); g.addColorStop(0,c0); g.addColorStop(0.55,c1); g.addColorStop(1,c2); c.fillStyle=g; c.fill(); };
      c.shadowColor="rgba(255,120,40,.9)"; c.shadowBlur=s*0.7;
      layer(1.0,2.6,6,1,"rgba(190,30,20,0)","rgba(225,55,30,.95)","#ff6a2a"); c.shadowBlur=0;
      layer(0.78,2.1,5,7,"rgba(255,120,30,0)","rgba(255,140,40,.95)","#ffb04a");
      layer(0.55,1.6,4,13,"rgba(255,220,100,0)","rgba(255,215,95,.95)","#fff0a8");
      c.fillStyle=OWN.rg(c,s*0.25,0,0,s*0.55,[[0,"rgba(255,255,245,1)"],[0.6,"rgba(255,248,200,.85)"],[1,"rgba(255,230,140,0)"]]); c.beginPath(); c.ellipse(s*0.2,0,s*0.6,s*0.45,0,0,7); c.fill();
      OWN.CH.shine(c,s*0.25,-s*0.5,s*0.28,s*0.1,0.55,0); c.restore(); };
Object.assign(OWN_BOLT2.Kitsune,{ col:[255,140,60],   /* a real ball of fire (Gid, 19 Nov 2026): wisps of flame gather in front of Kitsune into a fireball that shoots straight at the foe,
                                                       stretched like a comet with its flames trailing, and bursts */
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, outer=OWN.rgb([255,110,40],0.95), inner=OWN.rgb([255,235,150],0.98), end={x:tg.x-d*R*0.15,y:tg.y-R*0.1}, glow=[255,150,60], fp=OWN.pt(P.s,tg,[1.0,0.5]), front={x:fp.x+d*S*1.4,y:fp.y};
    const ang0=Math.atan2(end.y-front.y,end.x-front.x);
    const fball=(p,s,ang,str=1,a=1)=>OWN.comet(c,p,s,ang,t,str,a);
    if(t<240){ const k=Math.min(1,t/240);
      for(let i=0;i<6;i++){ const ph=(t/240*1.2+i/6)%1, aa=i/6*Math.PI*2+t/120, rr=S*(1.9-1.6*ph), p={x:front.x+Math.cos(aa)*rr,y:front.y+Math.sin(aa)*rr*0.7}; atGlowA(c,p.x,p.y,S*0.9,glow,0.45*(1-ph)); OWN.flame(c,p.x,p.y,S*0.35*(1-ph*0.6),aa,outer,inner,t+i*40); }
      fball(front,S*0.95*eo(k),d>0?0:Math.PI,0.6,Math.min(1,k*2)); return; }
    if(t<560){ const k=OWN.k(t,240,560), e=ei(k), p={x:front.x+(end.x-front.x)*e,y:front.y+(end.y-front.y)*e};
      for(let j=1;j<6;j++){ const q=Math.max(0,e-j*0.06), b2={x:front.x+(end.x-front.x)*q,y:front.y+(end.y-front.y)*q}; SG.puff(c,b2.x,b2.y-j*1.5,S*(0.28+j*0.08),0.3*(1-j/6),[120,105,100]); c.fillStyle=OWN.rgb([255,200,90],0.9*(1-j/6)); c.beginPath(); c.arc(b2.x+(atH(j+Math.floor(t/40))-0.5)*S*0.8,b2.y+(atH(j*3+Math.floor(t/40))-0.5)*S*0.8,S*0.08,0,7); c.fill(); }
      fball(p,S*1.0,ang0,1+0.8*Math.min(1,k*3)); return; }
    const k=OWN.k(t,560,880); if(k>=1) return; atGlowA(c,end.x,end.y,R*(0.9+1.4*eo(k)),glow,0.9*(1-k)); if(k<0.2) fball(end,S*(1+k*3),ang0,1,1-k/0.2);
    for(let j=0;j<10;j++){ const aa=j/10*7, dd=R*(0.3+1.2*eo(k)); OWN.flame(c,end.x+Math.cos(aa)*dd,end.y+Math.sin(aa)*dd*0.8,S*0.45*(1-k),aa+Math.PI,outer,inner,t+j*20); }
    for(let j=0;j<6;j++){ const aa=j/6*7+0.3, dd=R*(0.2+0.8*k); SG.puff(c,end.x+Math.cos(aa)*dd,end.y-R*0.3*k+Math.sin(aa)*dd*0.6,S*(0.5+0.8*k),0.45*(1-k)*Math.min(1,k*4),[110,100,100]); }
    for(let j=0;j<8;j++){ const aa=-Math.PI/2+(atH(j)-0.5)*2.6, v=R*(0.6+1.4*k)*(0.6+0.4*atH(j*3)); c.fillStyle=OWN.rgb([255,210,100],1-k); c.beginPath(); c.arc(end.x+Math.cos(aa)*v,end.y+Math.sin(aa)*v+k*k*R,S*0.1,0,7); c.fill(); } } });
Object.assign(OWN_BOLT2.Thunderbird,{
  fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, col=P.parts||o.col, end={x:tg.x-d*R*0.2,y:tg.y-R*0.25}, el=[255,235,110], sd=Math.floor(t/45);
    const feather=(p,rot,s,a=1)=>{ if(s<1) return; c.save(); c.translate(p.x,p.y); c.rotate(rot); c.globalAlpha*=a; atGlowA(c,0,0,s*1.8,el,0.45);
      c.fillStyle=OWN.rg(c,0,0,s*0.05,s*1.1,[[0,OWN.rgb(OWN.mix(col,[255,255,255],0.6))],[0.6,OWN.rgb(col)],[1,OWN.rgb(OWN.mix(col,[40,40,90],0.3))]],-s*0.3,-s*0.15);
      c.beginPath(); c.moveTo(-s,0); c.quadraticCurveTo(-s*0.2,-s*0.46,s,0); c.quadraticCurveTo(-s*0.2,s*0.46,-s,0); c.fill();
      c.strokeStyle="rgba(255,255,255,.85)"; c.lineWidth=Math.max(1.2,s*0.05); c.lineCap="round"; c.beginPath(); c.moveTo(-s*1.25,0); c.lineTo(s*0.95,0); c.stroke();
      c.strokeStyle="rgba(255,255,255,.5)"; for(let j=-3;j<=3;j++){ for(const sg of [-1,1]){ c.beginPath(); c.moveTo(j*s*0.24,0); c.quadraticCurveTo(j*s*0.24-s*0.1,sg*s*0.15,j*s*0.24-s*0.2,sg*s*0.3); c.stroke(); } }
      OWN.CH.shine(c,-s*0.2,-s*0.16,s*0.3,s*0.06,0.6,-0.1); c.restore();
      for(let i=0;i<3;i++){ const aa=rot+i*2.1+sd*0.8, r1=s*0.6, r2=s*(1.3+0.3*atH(i+sd)); OWN.zap(c,p.x+Math.cos(aa)*r1,p.y+Math.sin(aa)*r1*0.5,p.x+Math.cos(aa+0.4)*r2,p.y+Math.sin(aa+0.4)*r2,i+sd*4,el,s*0.06,s*0.18,4,false,a); } };
    if(t<220){ if(t>100){ const k=OWN.k(t,100,220); feather({x:o0.x+d*S*0.4*k,y:o0.y},0.4*k,S*1.5*k); } return; }
    const st={x:o0.x+d*S*0.4,y:o0.y-S*0.4};
    if(t<560){ const k=OWN.k(t,220,560), rock=Math.sin(k*Math.PI*3), p=OWN.go(st,end,k,S*0.6,0); p.x+=rock*S*0.5*d; p.y+=Math.abs(rock)*S*0.6; feather(p,rock*0.6,S*1.6); return; }
    const k=OWN.k(t,560,860); if(k<0.4){ const a=1-k/0.4; atGlowA(c,end.x,end.y,R*1.1,el,0.75*a); OWN.zap(c,end.x,end.y-R*1.0,end.x,end.y+R*0.45,sd,el,S*0.2,S*0.7,7,true,a); OWN.zap(c,end.x-R*0.6,end.y-R*0.6,end.x+R*0.2,end.y+R*0.3,sd+9,el,S*0.12,S*0.4,5,false,a); }
    feather({x:end.x+d*S*k*2,y:end.y+k*R*1.2},k*4,S*1.5*(1-k)); } });

/* ---------- wingstorm, own versions (19 Nov 2026). Gid turned down the first build since every family made the same swipe in its own
   colour, so each one now does its own thing with its own body: Flit spins up a bat whirlwind, Lumo hovers and shines light down or
   sends a firefly swarm, Crease launches paper cranes, Phoenix rains burning feathers, Tengu throws wind blades, Diwata whirls a petal
   tornado, the dragon beats shockwaves, Griffin dashes through leaving gold cuts, Nightgaunt wraps the foe in its wings, Migo buzzes,
   Hastur lashes with its rags and Cthulhu brings the night down with falling stars. The six hits still land every 105 ms from 280 ms. ---------- */
OWN.WS={
  T:j=>280+105*j, N:6,
  firefly(c,x,y,r,t,al=1){ if(al<=0) return; c.save(); c.globalAlpha*=al; atGlowA(c,x,y,r*4,[220,255,120],0.7); c.fillStyle="rgba(255,255,255,.55)"; for(const sd of [-1,1]){ c.beginPath(); c.ellipse(x+sd*r*0.6,y-r*0.6,r*0.7,r*0.35,sd*0.5+Math.sin(t/12)*0.4,0,7); c.fill(); }
    c.fillStyle=OWN.rg(c,x,y,0,r*1.2,[[0,"#ffffe0"],[0.5,"#e8ff70"],[1,"#a8d040"]]); c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.restore(); },
  ember(c,x,y,r,al){ if(al<=0) return; c.save(); c.globalAlpha*=al; atGlowA(c,x,y,r*3,[255,150,50],0.6); c.fillStyle="#ffd36a"; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.restore(); },
  fade:(t,a,b)=>Math.min(1,Math.max(0,(t-a)/120))*Math.min(1,Math.max(0,(b-t)/180)),
  crane(c,x,y,s,rot,flap,col,al=1){ if(s<1||al<=0) return; c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=al; const lt=OWN.mix(col,[255,255,255],0.55), dk=OWN.mix(col,[60,50,40],0.2);
    c.fillStyle=OWN.rgb(dk); c.beginPath(); c.moveTo(-s*0.2,0); c.lineTo(s*0.1,-s*(0.9+flap*0.5)); c.lineTo(s*0.35,0); c.closePath(); c.fill();
    c.fillStyle=OWN.rgb(col); c.beginPath(); c.moveTo(-s*0.9,-s*0.1); c.lineTo(-s*0.2,s*0.25); c.lineTo(s*0.7,-s*0.05); c.lineTo(s*1.0,-s*0.55); c.lineTo(s*0.75,s*0.05); c.lineTo(s*0.1,s*0.35); c.lineTo(-s*0.3,s*0.2); c.closePath(); c.fill();
    c.fillStyle=OWN.rgb(lt); c.beginPath(); c.moveTo(-s*0.15,0); c.lineTo(s*0.05,-s*(0.8+flap*0.6)*0.9); c.lineTo(s*0.4,0); c.closePath(); c.fill();
    c.strokeStyle="rgba(150,140,125,.6)"; c.lineWidth=Math.max(1,s*0.04); c.beginPath(); c.moveTo(-s*0.2,s*0.25); c.lineTo(s*0.7,-s*0.05); c.stroke(); c.restore(); },
  blade(c,x,y,s,rot,al=1){ if(s<1||al<=0) return; c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=al; c.shadowColor="rgba(190,235,255,.9)"; c.shadowBlur=s*0.5;
    const g=c.createLinearGradient(-s,0,s,0); g.addColorStop(0,"rgba(200,240,255,0)"); g.addColorStop(0.6,"rgba(225,248,255,.9)"); g.addColorStop(1,"rgba(255,255,255,1)"); c.fillStyle=g;
    c.beginPath(); c.moveTo(s*0.9,-s*0.9); c.quadraticCurveTo(s*0.15,0,s*0.9,s*0.9); c.quadraticCurveTo(-s*0.05,0,s*0.9,-s*0.9); c.fill(); c.restore(); },
  xcut(c,x,y,s,al,glint){ if(al<=0) return; c.save(); c.globalAlpha*=al; c.lineCap="round"; c.shadowColor="rgba(255,220,120,1)"; c.shadowBlur=s*0.4;
    for(const [w,col] of [[s*0.16,"rgba(230,170,60,.95)"],[s*0.06,"rgba(255,250,220,1)"]]){ c.strokeStyle=col; c.lineWidth=w; c.beginPath(); c.moveTo(x-s,y-s*0.8); c.lineTo(x+s,y+s*0.8); c.moveTo(x+s,y-s*0.8); c.lineTo(x-s,y+s*0.8); c.stroke(); }
    c.restore(); if(glint>0) OWN.star(c,x,y,s*0.9*glint,"rgba(255,255,240,.95)",glint*3); }
};
/* a strip of torn cloth along a path: it twists as it flutters (width swings with a fold), both edges are ragged, shaded folds run across it, and the end frays into threads */
OWN.WS.rag=(c,pts,w,col,t,seed,al=1)=>{ const n=pts.length; if(n<3||al<=0) return; const L=[], Rr=[], dk=OWN.mix(col,[30,20,25],0.35), lt=OWN.mix(col,[255,255,255],0.3);
  for(let i=0;i<n;i++){ const p=pts[i], q=pts[Math.min(n-1,i+1)], o=pts[Math.max(0,i-1)], dx=q.x-o.x, dy=q.y-o.y, l=Math.hypot(dx,dy)||1, nx=-dy/l, ny=dx/l, f=i/(n-1);
    const tw=0.55+0.45*Math.cos(f*7+t/45+seed), ww=w*(1-0.35*f)*tw, tl=1+(atH(i*7+seed)-0.5)*0.55, tr=1+(atH(i*11+seed*3)-0.5)*0.55; L.push({x:p.x+nx*ww*tl,y:p.y+ny*ww*tl,tw}); Rr.push({x:p.x-nx*ww*tr,y:p.y-ny*ww*tr,tw}); }
  const b0=pts[0], b1=pts[Math.max(1,Math.round((n-1)*0.28))], fg=c.createLinearGradient(b0.x,b0.y,b1.x,b1.y); fg.addColorStop(0,OWN.rgb(col,0)); fg.addColorStop(0.55,OWN.rgb(col,0.85)); fg.addColorStop(1,OWN.rgb(col,1));   /* the base fades in out of the body so the strip grows from the cloak (Gid, 19 Nov 2026) */
  c.save(); c.globalAlpha*=al; c.fillStyle=fg; c.beginPath(); L.forEach((p,i)=>c[i?"lineTo":"moveTo"](p.x,p.y)); for(let i=n-1;i>=0;i--) c.lineTo(Rr[i].x,Rr[i].y); c.closePath(); c.fill();
  for(let i=Math.round((n-1)*0.3);i<n-1;i++){ const sh=L[i].tw<0.6?0.45:L[i].tw>0.9?-0.25:0; if(!sh) continue; c.fillStyle=sh>0?OWN.rgb(dk,sh):OWN.rgb(lt,-sh); c.beginPath(); c.moveTo(L[i].x,L[i].y); c.lineTo(L[i+1].x,L[i+1].y); c.lineTo(Rr[i+1].x,Rr[i+1].y); c.lineTo(Rr[i].x,Rr[i].y); c.closePath(); c.fill(); }
  c.strokeStyle=OWN.rgb(dk,0.5); c.lineWidth=Math.max(1,w*0.08); for(let i=Math.max(2,Math.round((n-1)*0.3));i<n-2;i+=3){ c.beginPath(); c.moveTo(L[i].x*0.8+Rr[i].x*0.2,L[i].y*0.8+Rr[i].y*0.2); c.lineTo(L[i+1].x*0.3+Rr[i+1].x*0.7,L[i+1].y*0.3+Rr[i+1].y*0.7); c.stroke(); }
  c.fillStyle="rgba(40,25,30,.55)"; for(let h=0;h<2;h++){ const i=Math.floor((0.3+0.35*h+atH(seed+h)*0.1)*(n-1)), m={x:(L[i].x+Rr[i].x)/2,y:(L[i].y+Rr[i].y)/2}; c.beginPath(); c.ellipse(m.x,m.y,w*0.18,w*0.1,atH(seed*h+3)*3,0,7); c.fill(); }
  const e=pts[n-1], e2=pts[n-2], ang=Math.atan2(e.y-e2.y,e.x-e2.x); c.strokeStyle=OWN.rgb(col); c.lineCap="round"; c.lineWidth=Math.max(1.2,w*0.12);
  for(let m=0;m<5;m++){ const off=(m-2)*w*0.22, len=w*(0.8+0.8*atH(m+seed)), sw=Math.sin(t/30+m)*w*0.3; c.beginPath(); c.moveTo(e.x-Math.sin(ang)*off,e.y+Math.cos(ang)*off); c.quadraticCurveTo(e.x+Math.cos(ang)*len*0.5-Math.sin(ang)*(off+sw),e.y+Math.sin(ang)*len*0.5+Math.cos(ang)*(off+sw),e.x+Math.cos(ang)*len-Math.sin(ang)*off,e.y+Math.sin(ang)*len+Math.cos(ang)*off); c.stroke(); }
  c.restore(); };
const OWN_WING={
  /* Flit spins round and round, and a whirlwind of bats circles the foe, darting in one at a time */
  "Wing Storm":{ atk:(t)=>t>240&&t<980?{sx:Math.cos((t-240)/38),pose:"attack",off:[0,-6*Math.abs(Math.sin((t-240)/76))]}:null,
    draw(c,PF,P,t){ const a=OWN.WS.fade(t,240,1150), col=OWN.mix(P.body||[90,60,120],[50,30,70],0.35), cx=P.tg.x, cy=P.tg.y-P.R*0.1; if(a<=0) return;
      for(let i=0;i<4;i++){ const ph=t/120+i*1.6; c.strokeStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.3),0.45*a); c.lineWidth=P.R*0.08; c.lineCap="round"; c.beginPath(); c.ellipse(cx,cy-P.R*(0.4-i*0.25),P.R*(1.15-i*0.12),P.R*0.28,0,ph,ph+2.2); c.stroke(); }
      for(let i=0;i<5;i++){ const an=t/90+i*1.26, rr=P.R*(1.05+0.15*Math.sin(t/150+i)); OWN.GU.bat(c,cx+Math.cos(an)*rr,cy-P.R*0.3+Math.sin(an)*rr*0.35,P.S*0.38,t+i*30,col,a); }
      for(let j=0;j<6;j++){ const k=(t-OWN.WS.T(j)+60)/220; if(k<0||k>1) continue; const sd=j%2?1:-1, p={x:cx+sd*P.R*1.2*(1-Math.min(1,k*2.5)),y:cy-P.R*0.3+(j%3-1)*P.R*0.25};
        OWN.GU.bat(c,p.x,p.y,P.S*0.5,t,col,1-Math.max(0,k-0.5)*2); if(k>0.4){ const q=(k-0.4)/0.6; c.strokeStyle=OWN.rgb([255,255,255],1-q); c.lineWidth=2.5; for(let m=-1;m<=1;m++){ c.beginPath(); c.moveTo(cx-P.R*0.25+m*P.R*0.12,p.y-P.R*0.2); c.lineTo(cx+P.R*0.05+m*P.R*0.12,p.y+P.R*0.2); c.stroke(); } } } } },
  /* Lumo hovers up over the foe, its wings glowing, and shines six pulses of light straight down on it */
  "Glow Wing":{ atk:(t)=>{ const up=t<260?eo(t/260):t<960?1:1-eio(Math.min(1,(t-960)/300)); return {lift:-48*up,f:0.25*up,pose:t>200&&t<980?"cast":null}; },
    /* the light pours from both wings (Gid, 19 Nov 2026): two wide, bright cones meet on the foe on every pulse */
    draw(c,PF,P,t,x){ const col=[255,238,150], a=OWN.WS.fade(t,200,1150), wings=[OWN.pt(x.self,P.tg,[0.12,0.08]),OWN.pt(x.self,P.tg,[0.88,0.08])];
      for(const w of wings){ atGlowA(c,w.x,w.y,P.S*(1.1+0.3*Math.sin(t/60)),col,0.85*a); atGlowA(c,w.x,w.y,P.S*0.5,[255,255,240],0.9*a); }
      for(let j=0;j<6;j++){ const k=(t-OWN.WS.T(j)+50)/260; if(k<0||k>1) continue; const al=Math.sin(Math.PI*k), fx=P.tg.x+(j%3-1)*P.R*0.15, fy=P.tg.y+P.R*0.2, w=P.R*(0.75+0.25*Math.sin(Math.PI*k));
        c.save(); c.globalCompositeOperation="lighter";
        for(const s0 of wings){ /* see-through light (Gid, 19 Nov 2026): a faint wide haze, a softer cone inside it and thin rays, all adding up where they cross */
          for(const [ww,a0,a1] of [[1.25,0.32,0.08],[0.8,0.45,0.14]]){ const g=c.createLinearGradient(s0.x,s0.y,fx,fy); g.addColorStop(0,`rgba(255,255,235,${a0*al})`); g.addColorStop(0.6,`rgba(255,240,170,${(a0+a1)*0.45*al})`); g.addColorStop(1,`rgba(255,228,130,${a1*al})`); c.fillStyle=g;
            c.beginPath(); c.moveTo(s0.x,s0.y-P.S*0.15*ww); c.lineTo(fx+w*0.2*ww,fy-w*ww); c.quadraticCurveTo(fx+w*1.1*ww,fy,fx+w*0.2*ww,fy+w*ww); c.lineTo(s0.x,s0.y+P.S*0.15*ww); c.closePath(); c.fill(); }
          c.strokeStyle=`rgba(255,255,240,${0.35*al})`; c.lineWidth=P.S*0.05; c.lineCap="round"; for(let r=-2;r<=2;r++){ const ph=Math.sin(t/70+r*1.7)*0.5+0.5; c.globalAlpha=0.4+0.6*ph; c.beginPath(); c.moveTo(s0.x,s0.y); c.lineTo(fx+r*w*0.32,fy+r*w*0.3); c.stroke(); } c.globalAlpha=1;
          for(let i=0;i<4;i++){ const f=((t/300)+i/4+atH(i*3))%1; OWN.star(c,s0.x+(fx-s0.x)*f+(atH(i*7)-0.5)*w*f,s0.y+(fy-s0.y)*f+(atH(i*5)-0.5)*w*f,P.S*0.12*al,"rgba(255,255,230,.9)",t/40+i); } }
        c.restore(); atGlowA(c,fx,fy,P.R*(0.9+0.4*k),[255,240,160],0.8*al);
        OWN.CH.ring(c,fx,P.gnd-2,P.R*(0.5+0.8*k),P.R*0.07,col,al*0.8); for(let i=0;i<5;i++) OWN.star(c,fx+(atH(i+j*3)-0.5)*P.R*1.5,P.tg.y+(atH(i*5+j)-0.6)*P.R*1.1,P.S*0.3*al,"rgba(255,252,215,.95)",t/50+i); } } },
  /* Lumo stays back and sends a river of fireflies over; they swarm round the foe and pop in flashes of light */
  "Firefly Storm":{ atk:(t)=>t<1000?{f:0,pose:t>150?"cast":null,rot:Math.sin(t/60)*0.05}:null,
    draw(c,PF,P,t,x){ const a=OWN.WS.fade(t,150,1180), src=x.self.center||P.o0;
      for(let i=0;i<22;i++){ const ph=((t-150)/700+i/22); if(ph<0) continue; const f=Math.min(1,ph), sw=atH(i*5)*Math.PI*2;
        const along={x:src.x+(P.tg.x-src.x)*eo(f),y:src.y+(P.tg.y-src.y)*eo(f)-Math.sin(Math.PI*f)*P.R*0.8}, orb=ph>1?{x:P.tg.x+Math.cos(t/200+sw)*P.R*(0.8+0.3*atH(i)),y:P.tg.y-P.R*0.1+Math.sin(t/170+sw)*P.R*0.55}:null;
        const p=orb?orb:{x:along.x+Math.sin(t/60+i)*P.S*0.3,y:along.y+Math.cos(t/70+i)*P.S*0.3}; OWN.WS.firefly(c,p.x,p.y,P.S*0.12,t+i*17,a); }
      for(let j=0;j<6;j++){ const k=(t-OWN.WS.T(j))/260; if(k<0||k>1) continue; const p={x:P.tg.x+(atH(j*7)-0.5)*P.R*1.1,y:P.tg.y+(atH(j*3)-0.5)*P.R*0.8};
        atGlowA(c,p.x,p.y,P.R*(0.3+0.6*k),[230,255,140],0.9*(1-k)); OWN.star(c,p.x,p.y,P.S*(0.4+0.6*k),`rgba(250,255,200,${1-k})`,k*3); } } },
  /* Crease stays back and folds paper cranes out of itself, launching one per hit; each crumples into scraps on the foe */
  "Wing Barrage":{ atk:(t)=>t<980?{f:0.2,off:[0,-3*Math.abs(Math.sin(t/52))],rot:Math.sin(t/52)*0.06}:null,
    draw(c,PF,P,t,x){ const col=OWN.mix(P.body||[240,235,220],[255,255,255],0.25), src=OWN.pt(x.self,P.tg,[0.95,0.5]);
      for(let j=0;j<6;j++){ const t1=OWN.WS.T(j), t0=t1-280; if(t<t0) continue;
        if(t<t1){ const k=(t-t0)/280, e=ei(k), p={x:src.x+(P.tg.x-src.x)*e,y:src.y+(P.tg.y-P.R*0.1+(j%3-1)*P.R*0.25-src.y)*e-Math.sin(Math.PI*k)*P.R*(0.5+0.2*(j%2))}; OWN.WS.crane(c,p.x,p.y,P.S*1.5,P.d>0?0:Math.PI,Math.sin(t/25),col); continue; }
        const k=(t-t1)/380; if(k>=1) continue; const hp={x:P.tg.x,y:P.tg.y-P.R*0.1+(j%3-1)*P.R*0.25}; if(k<0.2){ c.save(); c.translate(hp.x,hp.y); c.scale(1-k*3,1-k*3); OWN.WS.crane(c,0,0,P.S*1.5,P.d>0?0:Math.PI,0,col); c.restore(); }
        for(let i=0;i<5;i++){ const an=i/5*7+j, v=P.R*(0.2+0.9*eo(k)); OWN.GU.scrap(c,hp.x+Math.cos(an)*v,hp.y+Math.sin(an)*v*0.7+k*k*P.R*0.6,P.S*0.2,k*8+i,col,1-k); } } } },
  /* Phoenix rises on its burning wings and rains fiery feathers down that stab into the ground round the foe and burn, ending in a flare */
  "Feather Slash":{ atk:(t)=>{ const up=t<260?eo(t/260):t<980?1:1-eio(Math.min(1,(t-980)/280)); return {lift:-56*up,f:0.3*up,pose:t>200&&t<980?"cast":null}; },
    draw(c,PF,P,t,x){ const src=x.self.center||P.o0;
      for(let j=0;j<6;j++){ const t1=OWN.WS.T(j), t0=t1-150, end={x:P.tg.x+(j-2.5)*P.R*0.32,y:j%2?P.gnd-P.R*0.05:P.tg.y+(atH(j)-0.5)*P.R*0.6}, ang=Math.atan2(end.y-src.y,end.x-src.x);
        if(t<t0) continue; if(t<t1){ const k=ei((t-t0)/150), p={x:src.x+(end.x-src.x)*k,y:src.y-P.R*0.8+(end.y-src.y+P.R*0.8)*k}; for(let m=1;m<4;m++) OWN.WS.ember(c,p.x-Math.cos(ang)*m*P.S*0.3,p.y-Math.sin(ang)*m*P.S*0.3,P.S*0.06,1-m/4); OWN.GU.feather(c,p.x,p.y,P.S*0.45,ang+Math.PI,[255,150,60]); atGlowA(c,p.x,p.y,P.S,[255,150,60],0.6); continue; }
        const k=(t-t1)/(1250-t1); if(k>=1) continue; const al=k<0.75?1:1-(k-0.75)/0.25; OWN.GU.feather(c,end.x-Math.cos(ang)*P.S*0.25,end.y-Math.sin(ang)*P.S*0.25,P.S*0.45,ang+Math.PI,[255,150,60],al);
        OWN.flame(c,end.x-Math.cos(ang)*P.S*0.45,end.y-Math.sin(ang)*P.S*0.45,P.S*0.25*al*(1+0.2*Math.sin(t/40+j)),Math.PI/2,OWN.rgb([255,120,40],0.9),OWN.rgb([255,235,150],0.95),t+j*30);
        if(k<0.15) atGlowA(c,end.x,end.y,P.R*0.5,[255,170,70],0.8*(1-k/0.15)); }
      const fk=(t-OWN.WS.T(5))/350; if(fk>0&&fk<1){ atGlowA(c,P.tg.x,P.tg.y,P.R*(0.8+1.2*fk),[255,140,50],0.8*(1-fk)); for(let i=0;i<8;i++){ const an=i/8*7; OWN.flame(c,P.tg.x+Math.cos(an)*P.R*(0.4+0.8*fk),P.tg.y+Math.sin(an)*P.R*0.6*(0.4+0.8*fk),P.S*0.4*(1-fk),an+Math.PI,OWN.rgb([255,120,40],0.9),OWN.rgb([255,235,150],0.95),t+i*20); } } } },
  /* Tengu stays back and swings its wings like fans, throwing crescent wind blades with leaves caught in them */
  "Wing Flurry":{ atk:(t)=>{ if(t<180||t>960) return null; const j=Math.floor((t-130)/105), q=((t-130)%105)/105; return {f:0.15,pose:j%2?"push":"attack",rot:(j%2?1:-1)*0.14*Math.sin(Math.PI*q)}; },
    draw(c,PF,P,t,x){ const src=OWN.pt(x.self,P.tg,[0.95,0.45]);
      for(let j=0;j<6;j++){ const t1=OWN.WS.T(j), t0=t1-150, hy=P.tg.y+(j%3-1)*P.R*0.28, ang=Math.atan2(hy-src.y,P.tg.x-src.x);
        if(t>=t0&&t<t1){ const k=(t-t0)/150, p={x:src.x+(P.tg.x-src.x)*k,y:src.y+(hy-src.y)*k}; for(let m=1;m<4;m++) OWN.WS.blade(c,p.x-Math.cos(ang)*m*P.S*0.6,p.y-Math.sin(ang)*m*P.S*0.6,P.S*1.1,ang+(j%2?0.3:-0.3),0.3/m);
          OWN.WS.blade(c,p.x,p.y,P.S*1.2,ang+(j%2?0.3:-0.3)); OWN.GU.petal(c,p.x-Math.cos(ang)*P.S*0.6,p.y+P.S*0.3,P.S*0.18,t/30+j,[120,170,80]); continue; }
        const k=(t-t1)/320; if(k<0||k>=1) continue; c.strokeStyle=`rgba(255,255,255,${1-k})`; c.lineWidth=2.5; c.lineCap="round"; c.beginPath(); c.moveTo(P.tg.x-P.R*0.6,hy-P.R*0.25*(j%2?1:-1)); c.lineTo(P.tg.x+P.R*0.6,hy+P.R*0.25*(j%2?1:-1)); c.stroke();
        for(let i=0;i<4;i++){ const an=i/4*7+j, v=P.R*(0.3+0.9*eo(k)); OWN.GU.petal(c,P.tg.x+Math.cos(an)*v,hy+Math.sin(an)*v*0.6+k*k*P.R*0.5,P.S*0.17,k*7+i,i%2?[120,170,80]:[200,170,80],1-k); } } } },
  /* Diwata pirouettes next to the foe and whirls up a tornado of petals that lifts round it */
  "Wing Whirl":{ atk:(t)=>t>230&&t<960?{sx:Math.cos((t-230)/55),pose:"cast",off:[0,-4*Math.abs(Math.sin((t-230)/110))]}:null,
    draw(c,PF,P,t){ const a=OWN.WS.fade(t,230,1160), cx=P.tg.x; if(a<=0) return; const pc=OWN.mix(P.body||[255,180,210],[255,200,225],0.5);
      for(let b=0;b<3;b++){ const yy=P.gnd-P.R*(0.2+b*0.6); c.strokeStyle=OWN.rgb(OWN.mix(pc,[255,255,255],0.4),0.5*a); c.lineWidth=P.R*0.07; c.lineCap="round"; c.beginPath(); c.ellipse(cx,yy,P.R*(0.9+b*0.25),P.R*0.22,0,t/80+b,t/80+b+2.6); c.stroke(); }
      for(let i=0;i<26;i++){ const f=((t/700)+i/26)%1, an=t/110+i*2.4, rr=P.R*(0.7+0.6*f), yy=P.gnd-P.R*0.1-f*P.R*2.0, front=Math.sin(an)>0;
        OWN.GU.petal(c,cx+Math.cos(an)*rr,yy+Math.sin(an)*rr*0.22,P.S*(front?0.22:0.15),an,i%3?pc:[255,236,150],a*(front?1:0.55)*(1-f*0.6)); }
      for(let j=0;j<6;j++){ const k=(t-OWN.WS.T(j))/220; if(k<0||k>1) continue; OWN.star(c,cx+(atH(j*5)-0.5)*P.R,P.tg.y+(atH(j*3)-0.5)*P.R*0.8,P.S*0.45*(1-k),"rgba(255,250,235,.95)",k*4); } } },
  /* the dragon stays back and beats its wings, each beat sending a ring of air that slams the foe and throws up dust */
  "Wing Beat":{ atk:(t)=>{ if(t<150||t>960) return null; const q=((t-150)%105)/105; return {f:0.12,pose:"push",sy:1-0.07*Math.sin(Math.PI*q*2),sx:1+0.05*Math.sin(Math.PI*q*2)}; },
    draw(c,PF,P,t,x){ const src=OWN.pt(x.self,P.tg,[1.0,0.45]);
      for(let j=0;j<6;j++){ const t1=OWN.WS.T(j), t0=t1-120;
        if(t>=t0&&t<t1){ const k=(t-t0)/120, p={x:src.x+(P.tg.x-src.x)*k,y:src.y+(P.tg.y-src.y)*k}; c.save(); c.translate(p.x,p.y); c.scale(P.d,1); for(let r=0;r<2;r++){ c.strokeStyle=`rgba(255,255,255,${0.75-r*0.3})`; c.lineWidth=P.R*(0.12-r*0.04); c.lineCap="round"; c.beginPath(); c.ellipse(-r*P.R*0.25,0,P.R*(0.25+0.1*k),P.R*(0.7+0.3*k),0,-1.2,1.2); c.stroke(); } c.restore(); continue; }
        const k=(t-t1)/380; if(k<0||k>=1) continue; for(let i=0;i<4;i++) PF(P.tg.x+(i-1.5)*P.R*0.5+P.d*k*P.R*0.4,P.gnd-P.R*0.15*(1+i%2)-k*P.R*0.3,P.R*(0.3+0.4*k),0.55*(1-k),[205,190,165]);
        OWN.CH.ring(c,P.tg.x,P.tg.y,P.R*(0.6+0.8*k),P.R*0.08,[255,255,255],0.7*(1-k)); } } },
  /* Griffin dashes through the foe and back, again and again, each pass leaving a glinting gold X cut that stays till the end */
  "Razor Wing":{ atk:(t)=>{ if(t<240||t>960) return null; const q=((t-230)%105)/105, j=Math.floor((t-230)/105); return {f:0.62+(j%2?-0.28:0.28)*Math.sin(Math.PI*q),pose:"tackle",rot:(j%2?-1:1)*0.1}; },
    draw(c,PF,P,t){ for(let j=0;j<6;j++){ const t1=OWN.WS.T(j); if(t<t1) continue; const k=(t-t1)/(1200-t1); if(k>=1) continue; const p={x:P.tg.x+(atH(j*7)-0.5)*P.R*0.9,y:P.tg.y+(atH(j*3)-0.5)*P.R*0.8}, gl=Math.max(0,1-(t-t1)/160);
        OWN.WS.xcut(c,p.x,p.y,P.S*0.55*(t-t1<60?(t-t1)/60:1),k<0.8?1:1-(k-0.8)/0.2,gl); }
      const fk=(t-1000)/200; if(fk>0&&fk<1) for(let j=0;j<6;j++) OWN.star(c,P.tg.x+(atH(j*7)-0.5)*P.R*0.9,P.tg.y+(atH(j*3)-0.5)*P.R*0.8,P.S*0.6*Math.sin(Math.PI*fk),"rgba(255,250,215,.95)",fk*4); } },
  /* Nightgaunt wraps the foe in its leather wings and squeezes on every hit, with shadow puffing out of the gaps */
  "Leather Wing":{ atk:(t)=>t>200&&t<960?{f:0.5,pose:"attack"}:null,
    draw(c,PF,P,t){ const close=t<280?eo(Math.max(0,(t-180)/100)):t<940?1:1-eio(Math.min(1,(t-940)/200)); if(close<=0) return; const col=OWN.mix(P.body||[50,40,60],[30,22,40],0.45), cx=P.tg.x, cy=P.tg.y-P.R*0.05;
      let sq=1; for(let j=0;j<6;j++){ const k=(t-OWN.WS.T(j))/105; if(k>=0&&k<1) sq=1-0.1*Math.sin(Math.PI*k); }
      for(const sd of [-1,1]){ const ox=cx+sd*P.R*(1.3-0.95*close)*sq; c.save(); c.translate(ox,cy); c.scale(sd,1);
        c.fillStyle=OWN.rg(c,0,0,P.R*0.1,P.R*1.3,[[0,OWN.rgb(OWN.mix(col,[120,90,140],0.4),0.95)],[1,OWN.rgb(col,0.95)]],-P.R*0.3,-P.R*0.3); c.beginPath(); c.moveTo(0,-P.R*1.0);
        for(let i=0;i<=4;i++){ const yy=-P.R*1.0+i*P.R*0.5, xx=P.R*(0.55-0.12*Math.abs(i-2)); c.quadraticCurveTo(xx+P.R*0.25,yy+P.R*0.25,xx,yy+P.R*0.5); } c.lineTo(-P.R*0.25,P.R*1.05); c.quadraticCurveTo(-P.R*0.4,0,-P.R*0.2,-P.R*1.05); c.closePath(); c.fill();
        c.strokeStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.4),0.8); c.lineWidth=P.R*0.05; c.lineCap="round"; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-P.R*0.2,-P.R*1.0); c.lineTo(P.R*(0.55-0.12*Math.abs(i+0.5-2)),-P.R*1.0+(i+0.5)*P.R*0.5); c.stroke(); } c.restore(); }
      for(let j=0;j<6;j++){ const k=(t-OWN.WS.T(j))/300; if(k<0||k>=1) continue; for(let i=0;i<3;i++) PF(cx+(i-1)*P.R*0.6,cy-P.R*(0.9+0.5*k)+i%2*P.R*0.2,P.R*(0.2+0.3*k),0.5*(1-k),[50,38,65]); }
      if(close>0.8) for(const sd of [-1,1]) OWN.WV.eye(c,cx+sd*P.R*0.25,cy-P.R*0.25,P.R*0.09,t,(close-0.8)*5,"#ff6a8a"); } },
  /* Migo hovers close and buzzes so fast it blurs, sending zigzag buzz rings through the foe, which shakes and puffs pink spores */
  "Wing Buzz":{ atk:(t)=>t>200&&t<970?{f:0.4,off:[Math.sin(t*1.7)*2.5,Math.cos(t*2.3)*2],pose:"cast"}:null,
    draw(c,PF,P,t,x){ const a=OWN.WS.fade(t,200,1100), src=x.self.center||P.o0; if(a<=0) return; const col=OWN.mix(P.body||[220,140,200],[255,170,220],0.4);
      for(let i=0;i<4;i++){ const q=((t/220)+i/4)%1, r=P.R*(0.4+1.6*q), mx=src.x+(P.tg.x-src.x)*q*0.8, my=src.y+(P.tg.y-src.y)*q*0.8; c.strokeStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.4),0.7*a*(1-q)); c.lineWidth=2.4; c.lineJoin="round";
        c.beginPath(); for(let m=0;m<=24;m++){ const an=-0.9+m/24*1.8, rr=r*(m%2?0.9:1); c.lineTo(mx+P.d*Math.cos(an)*rr*0.4,my+Math.sin(an)*rr*0.6); } c.stroke(); }
      for(let j=0;j<6;j++){ const k=(t-OWN.WS.T(j))/300; if(k<0||k>=1) continue; for(let i=0;i<3;i++) OWN.SS.spore(c,P.tg.x+(atH(i+j*3)-0.5)*P.R*1.3,P.tg.y-k*P.R*0.9+(atH(i*7+j)-0.5)*P.R*0.8,P.S*0.15,t+i*40,1-k);
        c.strokeStyle=`rgba(255,255,255,${0.8*(1-k)})`; c.lineWidth=2; for(const sd of [-1,1]){ c.beginPath(); for(let m=0;m<=6;m++) c.lineTo(P.tg.x+sd*P.R*(0.85+(m%2)*0.1),P.tg.y-P.R*0.4+m*P.R*0.13); c.stroke(); } } } },
  /* Hastur stays back and lashes long strips of its rags at the foe, high and low, like whips that crack and draw back */
  "Rag Storm":{ atk:(t)=>t>160&&t<980?{f:0.22,rot:Math.sin(t/70)*0.08,pose:"cast"}:null,
    draw(c,PF,P,t,x){ const hc=P.body||[220,200,90], dk=OWN.mix(hc,[40,30,25],0.3);
      for(let j=0;j<6;j++){ const t1=OWN.WS.T(j); const k=(t-(t1-140))/360; if(k<0||k>=1) continue; const ext=k<0.39?eo(k/0.39):1-ei((k-0.39)/0.61), src=OWN.pt(x.self,P.tg,[0.6,0.45+0.15*(j%3)]), end={x:P.tg.x+P.d*P.R*0.2,y:P.tg.y+(j%3-1)*P.R*0.3};
        const pts=[]; for(let m=0;m<=14;m++){ const f=m/14*ext; pts.push({x:src.x+(end.x-src.x)*f,y:src.y+(end.y-src.y)*f+Math.sin(f*9-t/30+j)*P.R*0.18*f-Math.sin(Math.PI*f)*P.R*0.3}); }
        OWN.WS.rag(c,pts,P.S*0.5,j%2?hc:OWN.mix(hc,[60,45,35],0.25),t,j*13+5);
        if(k>0.36&&k<0.5) OWN.star(c,end.x,end.y,P.S*0.55*(1-(k-0.36)/0.14),"rgba(255,250,220,.95)",k*8); } } },
  /* Cthulhu spreads its wings and night falls round the foe: stars come out, eyes open in the dark, and a shooting star strikes on each hit */
  "Night Wings":{ atk:(t)=>{ const up=t<260?eo(t/260):t<980?1:1-eio(Math.min(1,(t-980)/280)); return {lift:-22*up,f:0.15*up,pose:t>180&&t<980?"cast":null}; },
    draw(c,PF,P,t){ const a=OWN.WS.fade(t,180,1180); if(a<=0) return; const cx=P.tg.x, cy=P.tg.y-P.R*0.3;
      c.fillStyle=OWN.rg(c,cx,cy,P.R*0.2,P.R*2.3,[[0,`rgba(15,18,45,${0.72*a})`],[0.65,`rgba(20,25,60,${0.5*a})`],[1,"rgba(20,25,60,0)"]]); c.beginPath(); c.arc(cx,cy,P.R*2.3,0,7); c.fill();
      for(let i=0;i<16;i++){ const an=atH(i*3)*Math.PI*2, rr=P.R*(0.5+1.5*atH(i*7)); OWN.star(c,cx+Math.cos(an)*rr,cy+Math.sin(an)*rr*0.75,P.S*(0.08+0.07*atH(i*11))*(0.6+0.4*Math.sin(t/90+i)),`rgba(235,240,255,${0.9*a})`,i); }
      for(let i=0;i<3;i++){ const an=i*2.1+0.4, rr=P.R*1.35; OWN.WV.eye(c,cx+Math.cos(an)*rr,cy+Math.sin(an)*rr*0.6,P.R*0.1,t+i*50,a*Math.min(1,Math.max(0,(t-320-i*90)/150)),"#9fe870"); }
      for(let j=0;j<6;j++){ const t1=OWN.WS.T(j), k=(t-(t1-110))/110; if(k<0) continue; const hit={x:cx+(atH(j*5)-0.5)*P.R*0.8,y:P.tg.y+(atH(j*3)-0.5)*P.R*0.5}, from={x:hit.x-P.d*P.R*1.4,y:hit.y-P.R*2.2};
        if(k<1){ const p={x:from.x+(hit.x-from.x)*k,y:from.y+(hit.y-from.y)*k}; const g=c.createLinearGradient(from.x,from.y,p.x,p.y); g.addColorStop(0,"rgba(200,220,255,0)"); g.addColorStop(1,"rgba(235,245,255,.95)"); c.strokeStyle=g; c.lineWidth=P.S*0.18; c.lineCap="round"; c.beginPath(); c.moveTo(from.x+(hit.x-from.x)*Math.max(0,k-0.5),from.y+(hit.y-from.y)*Math.max(0,k-0.5)); c.lineTo(p.x,p.y); c.stroke(); OWN.star(c,p.x,p.y,P.S*0.4,"rgba(255,255,255,1)",t/30); }
        else { const q=(k-1)*110/260; if(q<1){ atGlowA(c,hit.x,hit.y,P.R*0.6,[160,190,255],0.8*(1-q)); OWN.star(c,hit.x,hit.y,P.S*(0.5+0.8*q),`rgba(230,240,255,${1-q})`,q*3); } } } } }
};
OWN.wingFx=(c,t,x,o)=>{ OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:[0.9,0.5]}); P.S*=2.0; OWN.GU.d=P.d; o.draw(c,PF,P,t,x); }); };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.wingstorm) return; const K=ANIM.wingstorm, fx1=K.fx, atk1=K.atk;
  K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&pos.name&&OWN_WING[pos.name], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; };
  K.fx=function(c,t,x){ const o=x&&OWN_WING[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ OWN.wingFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN wing",x.name,e&&e.message); } } }; })();

/* ---------- flash, own versions (19 Nov 2026): every family glowed white and threw the same ring of rays, so each one now lights up its
   own way from its own body: Lern's lantern casts a warm pool, Wick's flame flashes four times, Lumo glows sleepy, sweet or calls a
   swarm, Bloop pulses rings of sea light, Shutter fires a lens flare, the unicorn twists a rainbow from its horn, the kirin calls down
   holy light, Sarimanok fans its rainbow tail, Shoggoth opens staring eyes, and Hastur drains the light or burns its mark on.
   The glow builds to 380 ms, the hit lands at 380 and it all clears by 900. ---------- */
OWN.FL={ up:(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a))), env:(t)=>t<380?eo(t/380):1-Math.max(0,(t-650)/250),
  ray(c,x0,y0,x1,y1,w0,w1,col,al,a0=0.7,a1=0.1){ if(al<=0) return; const dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, g=c.createLinearGradient(x0,y0,x1,y1);
    g.addColorStop(0,OWN.rgb(col,a0*al)); g.addColorStop(1,OWN.rgb(col,a1*al)); c.fillStyle=g; c.beginPath(); c.moveTo(x0+nx*w0,y0+ny*w0); c.lineTo(x1+nx*w1,y1+ny*w1); c.lineTo(x1-nx*w1,y1-ny*w1); c.lineTo(x0-nx*w0,y0-ny*w0); c.closePath(); c.fill(); },
  heart(c,x,y,s,col,al){ if(al<=0||s<1) return; c.save(); c.globalAlpha*=al; c.translate(x,y); c.shadowColor=OWN.rgb(col,1); c.shadowBlur=s; c.fillStyle=OWN.rg(c,0,0,0,s*1.2,[[0,"#fff"],[0.6,OWN.rgb(col)],[1,OWN.rgb(OWN.mix(col,[200,60,120],0.3))]],-s*0.3,-s*0.3);
    c.beginPath(); c.moveTo(0,s*0.9); c.bezierCurveTo(-s*1.2,0,-s*0.7,-s*0.9,0,-s*0.35); c.bezierCurveTo(s*0.7,-s*0.9,s*1.2,0,0,s*0.9); c.fill(); c.restore(); },
  eyeBlob(c,x,y,r,t,open,col,al){ if(al<=0||r<1||open<=0) return; c.save(); c.globalAlpha*=al; c.fillStyle="#fffbe8"; c.beginPath(); c.ellipse(x,y,r,r*0.75*open,0,0,7); c.fill();
    c.fillStyle=OWN.rgb(col); c.beginPath(); c.arc(x+Math.sin(t/200)*r*0.15,y,r*0.48*Math.min(1,open*1.3),0,7); c.fill(); c.fillStyle="#120a14"; c.beginPath(); c.arc(x+Math.sin(t/200)*r*0.15,y,r*0.22*Math.min(1,open*1.3),0,7); c.fill();
    c.fillStyle="rgba(255,255,255,.9)"; c.beginPath(); c.arc(x-r*0.18,y-r*0.2*open,r*0.12,0,7); c.fill(); c.restore(); }
};
const OWN_FLASH={
  /* Lern's paper lantern glows brighter and brighter, then throws a warm pool of lantern light over the foe, with its paper ribs showing as soft bars */
  "Glow":{ col:[255, 200, 120], atk:(t)=>({f:0,pose:t<380?"cast":t<700?"push":null,off:[0,-4*Math.sin(Math.PI*Math.min(1,t/700))]}),
    draw(c,PF,P,t,x){ const L=x.self.center||P.o0, col=[255,190,100], e=OWN.FL.env(t); atGlowA(c,L.x,L.y,P.S*(1.2+1.4*e),col,0.75*e); atGlowA(c,L.x,L.y,P.S*0.7,[255,240,190],0.8*e);
      if(t<380) return; const k=OWN.FL.up(t,380,520), al=1-OWN.FL.up(t,700,900), fx=P.tg.x, fy=P.tg.y;
      c.save(); c.globalCompositeOperation="lighter"; OWN.FL.ray(c,L.x,L.y,fx,fy+P.R*0.2,P.S*0.4,P.R*1.5*k,[255,200,120],0.9*al); c.restore();
      c.fillStyle=OWN.rg(c,fx,P.gnd-2,0,P.R*1.3,[[0,`rgba(255,220,150,${0.5*al})`],[1,"rgba(255,200,120,0)"]]); c.beginPath(); c.ellipse(fx,P.gnd-2,P.R*1.8*k,P.R*0.4*k,0,0,7); c.fill();
      c.fillStyle=`rgba(150,90,40,${0.18*al})`; for(let i=-2;i<=2;i++){ c.beginPath(); c.ellipse(fx+i*P.R*0.45,P.gnd-2,P.R*0.08,P.R*0.25,0,0,7); c.fill(); }
      OWN.SS.squint(c,P,al*k); } },
  /* Wick's head flame flares up tall and throws a fireball, which explodes on the foe into a ring of flame tongues and four fire pops, with flames rising at its feet */
  "Flash Fire":{ col:[255, 150, 70], atk:(t)=>({f:0,pose:t<380?"cast":t<760?"push":null,off:[0,t>380&&t<800?-5*Math.abs(Math.sin(Math.PI*((t-380)%110)/110)):0],lift:t<380?-6*eo(t/380):-6*(1-OWN.FL.up(t,380,700))}),
    draw(c,PF,P,t,x){ const top=OWN.pt(x.self,P.tg,[0.5,0.0]), outer=OWN.rgb([255,110,40],0.95), inner=OWN.rgb([255,240,170],0.98), e=OWN.FL.env(t), fx=P.tg.x, fy=P.tg.y;
      const fs=P.S*(0.25+0.5*e)*(1+0.1*Math.sin(t/30)); OWN.flame(c,top.x,top.y-fs*0.85,fs,Math.PI/2,outer,inner,t); atGlowA(c,top.x,top.y-P.S*0.6,P.S*(0.8+1.4*e),[255,160,60],0.6*e);
      /* embers spiral into the head flame as it builds, then it throws a fireball at the foe */
      if(t<300) for(let i=0;i<8;i++){ const q=((t/300)+i/8)%1, an=i/8*7+t/90, r=P.S*1.6*(1-q); OWN.flame(c,top.x+Math.cos(an)*r,top.y-fs*0.6+Math.sin(an)*r*0.7,P.S*0.14*q,an,outer,inner,t+i*30); }
      if(t>=220&&t<400){ const k=eo(OWN.FL.up(t,220,380)), st={x:top.x,y:top.y-fs*0.6}, p={x:st.x+(fx-st.x)*k,y:st.y+(fy-st.y)*k-Math.sin(Math.PI*k)*P.R*0.3}; OWN.comet(c,p,P.S*(0.35+0.25*k),Math.atan2(fy-st.y,fx-st.x),t,0.3+1.3*k); }
      if(t<380) return; const k=OWN.FL.up(t,380,860), al=1-k;
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1.1+1.6*eo(k)),[255,150,60],0.9*al); atGlowA(c,fx,fy,P.R*0.8,[255,240,200],0.9*(1-OWN.FL.up(t,380,560))); c.restore();
      for(let i=0;i<12;i++){ const an=i/12*Math.PI*2+0.3, v=P.R*(0.3+1.3*eo(k)); OWN.flame(c,fx+Math.cos(an)*v,fy+Math.sin(an)*v*0.8,P.S*(0.75-0.3*k)*al+1,an+Math.PI,outer,inner,t+i*25); }
      for(let j=0;j<4;j++){ const q=(t-380-j*110)/420; if(q<0||q>1) continue; const pp={x:fx+(atH(j*5)-0.5)*P.R*1.4,y:fy+(atH(j*3)-0.5)*P.R*1.1};
        atGlowA(c,pp.x,pp.y,P.R*(0.5+0.8*q),[255,190,90],0.95*(1-q)); OWN.star(c,pp.x,pp.y,P.S*(0.9+1.4*q),`rgba(255,250,220,${1-q})`,q*2+j);
        for(let i=0;i<8;i++){ const an=i/8*7+j, v=P.R*(0.2+0.9*eo(q)); OWN.flame(c,pp.x+Math.cos(an)*v,pp.y+Math.sin(an)*v,P.S*0.3*(1-q),an+Math.PI,outer,inner,t+i*20); } }
      for(let i=0;i<6;i++){ const q=OWN.FL.up(t,400+i*30,880), h=Math.sin(Math.PI*q); OWN.flame(c,fx+(i-2.5)*P.R*0.32,P.gnd-P.S*0.5*h,P.S*(0.5+0.25*atH(i))*h,Math.PI/2,outer,inner,t+i*40); }
      for(let i=0;i<14;i++){ const q=((t-380)/500+atH(i*7))%1; c.fillStyle=OWN.rgb(OWN.mix([255,230,140],[255,90,40],q),0.9*al); c.beginPath(); c.arc(fx+(atH(i*3)-0.5)*P.R*1.6+Math.sin(t/60+i)*P.S*0.1,fy+P.R*0.4-q*P.R*2.2,P.S*0.07*(1-q*0.5),0,7); c.fill(); } } },
  /* Lumo's tail glows a soft lavender and slow rings of sleepy light drift to the foe, which gets swirly eyes and drifting Zs */
  "Sleepy Glow":{ col:[200, 180, 255], atk:(t)=>({f:0,pose:t<380?"cast":null,rot:Math.sin(t/180)*0.07}),
    draw(c,PF,P,t,x){ const tail=OWN.pt(x.self,P.tg,[0.5,0.85]), col=[200,180,255], e=OWN.FL.env(t); atGlowA(c,tail.x,tail.y,P.S*(1+1.2*e)*(1+0.1*Math.sin(t/120)),col,0.7*e);
      for(let i=0;i<4;i++){ const q=((t/700)+i/4)%1; if(t<150) break; const p={x:tail.x+(P.tg.x-tail.x)*q,y:tail.y+(P.tg.y-tail.y)*q-Math.sin(Math.PI*q)*P.R*0.5}; OWN.CH.ring(c,p.x,p.y,P.S*(0.5+0.6*q),P.S*0.14,col,0.75*e*Math.sin(Math.PI*q)); }
      if(t<380) return; const al=1-OWN.FL.up(t,750,900), k=OWN.FL.up(t,380,520); atGlowA(c,P.tg.x,P.tg.y,P.R*1.1,col,0.45*al);
      c.strokeStyle=`rgba(120,90,180,${al*k})`; c.lineWidth=2.4; c.lineCap="round"; for(const sd of [-1,1]){ const ex=P.tg.x+sd*P.R*0.3, ey=P.tg.y-P.R*0.25; c.beginPath(); for(let m=0;m<=14;m++){ const a=m/14*Math.PI*3+t/80, r=P.R*0.11*m/14; c.lineTo(ex+Math.cos(a)*r,ey+Math.sin(a)*r); } c.stroke(); }
      for(let i=0;i<3;i++){ const q=((t-380)/500+i/3)%1; c.save(); c.globalAlpha=al*(1-q); c.font=`900 ${Math.round(P.S*(0.4+0.4*q))}px ui-rounded, system-ui, sans-serif`; c.fillStyle="#b8a4ff"; c.shadowColor="rgba(255,255,255,.9)"; c.shadowBlur=6; c.fillText("z",P.tg.x+P.R*(0.3+0.4*q),P.head.y-P.R*(0.2+0.8*q)); c.restore(); } } },
  /* Lumo glows a warm pink-gold and little hearts of light rise off its tail: some drift over and bathe the foe, the rest sink back into Lumo */
  "Sweet Glow":{ col:[255, 180, 210], atk:(t)=>({f:0,pose:t<380?"cast":t<700?"push":null,off:[0,-5*Math.abs(Math.sin(t/110))]}),
    draw(c,PF,P,t,x){ const tail=OWN.pt(x.self,P.tg,[0.5,0.85]), col=[255,170,200], e=OWN.FL.env(t); atGlowA(c,tail.x,tail.y,P.S*(1.1+1.2*e),[255,200,160],0.7*e);
      for(let i=0;i<9;i++){ const q=((t/650)+i/9)%1, toFoe=i%3!==0, a=e*Math.sin(Math.PI*q);
        const p=toFoe?{x:tail.x+(P.tg.x-tail.x)*q,y:tail.y-Math.sin(Math.PI*q)*P.R*0.9+(P.tg.y-tail.y)*q+Math.sin(t/60+i)*P.S*0.2}:{x:tail.x+Math.sin(t/90+i)*P.S*0.6,y:tail.y-P.S*1.2*Math.sin(Math.PI*q)};
        OWN.FL.heart(c,p.x,p.y,P.S*(0.3+0.12*atH(i)),toFoe?col:[255,215,140],a); }
      if(t<380) return; const al=1-OWN.FL.up(t,700,900); atGlowA(c,P.tg.x,P.tg.y,P.R*1.2,[255,190,200],0.5*al); for(let i=0;i<5;i++) OWN.star(c,P.tg.x+(atH(i*3)-0.5)*P.R*1.4,P.tg.y+(atH(i*7)-0.5)*P.R,P.S*0.25*al,"rgba(255,235,245,.95)",t/50+i); } },
  /* Lumo calls a swarm of fireflies that gathers into a huge glowing ball over the foe and bursts in a blinding flash */
  "Swarm Light":{ col:[220, 255, 140], atk:(t)=>({f:0,pose:t<420?"cast":t<720?"push":null,lift:-14*Math.sin(Math.PI*Math.min(1,t/900))}),
    draw(c,PF,P,t,x){ const src=x.self.center||P.o0, ball={x:P.tg.x,y:P.head.y-P.R*0.9}, e=OWN.FL.env(t);
      for(let i=0;i<28;i++){ const f=Math.min(1,Math.max(0,(t-atH(i)*160)/340)), an=t/150+i*0.9, rr=P.R*0.55*(1-0.4*Math.min(1,Math.max(0,(t-300)/80)));
        const p=f<1?{x:src.x+(ball.x-src.x)*eo(f)+Math.sin(t/50+i)*P.S*0.3,y:src.y+(ball.y-src.y)*eo(f)-Math.sin(Math.PI*f)*P.R*0.8}:{x:ball.x+Math.cos(an)*rr,y:ball.y+Math.sin(an)*rr*0.8};
        if(t<400) OWN.WS.firefly(c,p.x,p.y,P.S*0.11,t+i*13,1); }
      if(t<400) { { const g=OWN.FL.up(t,200,400); atGlowA(c,ball.x,ball.y,P.R*(0.6+0.9*g),[230,255,140],0.8); c.fillStyle=OWN.rg(c,ball.x,ball.y,0,P.R*0.6*g,[[0,'rgba(255,255,235,.95)'],[0.6,'rgba(235,255,150,.7)'],[1,'rgba(200,240,100,0)']],-P.R*0.15*g,-P.R*0.15*g); c.beginPath(); c.arc(ball.x,ball.y,P.R*0.6*g,0,7); c.fill(); } return; }
      const k=OWN.FL.up(t,380,700); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,ball.x,ball.y,P.R*(1+3*eo(k)),[240,255,170],0.95*(1-k)); atGlowA(c,P.tg.x,P.tg.y,P.R*1.6,[255,255,220],0.9*(1-k)); c.restore();
      for(let i=0;i<14;i++){ const an=i/14*7, v=P.R*(0.4+2.0*eo(k)); OWN.WS.firefly(c,ball.x+Math.cos(an)*v,ball.y+Math.sin(an)*v*0.8,P.S*0.1,t+i*20,1-k); }
      for(let i=0;i<10;i++){ const an=i/10*Math.PI*2; c.strokeStyle=`rgba(255,255,220,${0.8*(1-k)})`; c.lineWidth=3; c.beginPath(); c.moveTo(ball.x+Math.cos(an)*P.R*0.5*(1+k),ball.y+Math.sin(an)*P.R*0.5*(1+k)); c.lineTo(ball.x+Math.cos(an)*P.R*(1.2+2*k),ball.y+Math.sin(an)*P.R*(1.2+2*k)); c.stroke(); } } },
  /* Bloop's bell pulses three times, sending rings of glowing sea light through the air with plankton sparkling in them; they bloom into soft glowing jelly lights on the foe */
  "Bloom Pulse":{ col:[120, 230, 255], atk:(t)=>{ const q=(t%130)/130; return t<520?{f:0,pose:"cast",sx:1+0.08*Math.sin(Math.PI*q),sy:1-0.1*Math.sin(Math.PI*q)}:{f:0}; },
    draw(c,PF,P,t,x){ const bell=OWN.pt(x.self,P.tg,[0.5,0.3]), cols=[[110,230,255],[255,140,220]];
      for(let j=0;j<3;j++){ const k=(t-j*130)/420; if(k<0||k>1) continue; const p={x:bell.x+(P.tg.x-bell.x)*k,y:bell.y+(P.tg.y-bell.y)*k}; OWN.CH.ring(c,p.x,p.y,P.R*(0.5+0.9*k),P.S*0.2,cols[j%2],0.85*(1-k*0.6));
        for(let i=0;i<6;i++){ const an=i/6*7+j; c.fillStyle=OWN.rgb([220,255,255],0.9*(1-k)); c.beginPath(); c.arc(p.x+Math.cos(an)*P.R*(0.3+0.6*k),p.y+Math.sin(an)*P.R*(0.3+0.6*k),P.S*0.05,0,7); c.fill(); } }
      if(t<380) return; for(let i=0;i<5;i++){ const k=OWN.FL.up(t,380+i*40,820), p={x:P.tg.x+(atH(i*5)-0.5)*P.R*1.3,y:P.tg.y+(atH(i*3)-0.5)*P.R*0.9-k*P.R*0.4}, al=Math.sin(Math.PI*k), col=cols[i%2];
        atGlowA(c,p.x,p.y,P.S*(0.6+0.8*k),col,0.8*al); c.save(); c.globalAlpha=al; c.fillStyle=OWN.rg(c,p.x,p.y,0,P.S*0.4,[[0,"#fff"],[1,OWN.rgb(col,0.6)]]); c.beginPath(); c.arc(p.x,p.y,P.S*0.35*(0.6+0.6*k),Math.PI,0); c.quadraticCurveTo(p.x,p.y+P.S*0.1,p.x-P.S*0.35*(0.6+0.6*k),p.y); c.fill();
          c.strokeStyle=OWN.rgb(col,0.8); c.lineWidth=1.5; for(let m=-1;m<=1;m++){ c.beginPath(); c.moveTo(p.x+m*P.S*0.12,p.y); c.quadraticCurveTo(p.x+m*P.S*0.12+Math.sin(t/60+m)*P.S*0.1,p.y+P.S*0.3,p.x+m*P.S*0.14,p.y+P.S*0.55); c.stroke(); } c.restore(); } } },
  /* Shutter's lens charges, then fires a huge camera flash with a lens-flare streak and coloured hexagons, and a photo frame snaps round the bleached-out foe */
  "Grand Exposure":{ col:[235, 245, 255], atk:(t)=>({f:0,pose:t<380?"cast":t<640?"push":null,sx:t>360&&t<420?0.92:1}),
    draw(c,PF,P,t,x){ const lens=OWN.pt(x.self,P.tg,[0.62,0.5]), e=OWN.FL.up(t,0,380);
      if(t<380){ atGlowA(c,lens.x,lens.y,P.S*(0.6+0.8*e),[200,230,255],0.8*e); for(let i=0;i<6;i++){ const an=i/6*7+t/80, r=P.S*(1.6-1.2*e); c.fillStyle=`rgba(255,255,255,${0.8*e})`; c.beginPath(); c.arc(lens.x+Math.cos(an)*r,lens.y+Math.sin(an)*r,P.S*0.06,0,7); c.fill(); } return; }
      const k=OWN.FL.up(t,380,880); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,lens.x,lens.y,P.R*(1.5+2*k),[255,255,255],0.95*(1-k)); atGlowA(c,P.tg.x,P.tg.y,P.R*1.4,[255,255,255],0.9*(1-k));
      const dx=P.tg.x-lens.x, dy=P.tg.y-lens.y; c.strokeStyle=`rgba(255,250,240,${0.8*(1-k)})`; c.lineWidth=P.S*0.18; c.lineCap="round"; c.beginPath(); c.moveTo(lens.x-dx*0.6,lens.y-dy*0.6-P.S*0.2); c.lineTo(lens.x+dx*1.6,lens.y+dy*1.6+P.S*0.2); c.stroke();
      [[0.35,[255,170,120]],[0.6,[150,220,255]],[0.85,[200,255,170]],[1.2,[255,150,220]]].forEach(([f,col],i)=>{ const hx=lens.x+dx*f, hy=lens.y+dy*f, r=P.S*(0.3+0.25*i); c.fillStyle=OWN.rgb(col,0.35*(1-k)); c.beginPath(); for(let m=0;m<6;m++){ const a=m/6*Math.PI*2+0.5; c[m?"lineTo":"moveTo"](hx+Math.cos(a)*r,hy+Math.sin(a)*r); } c.closePath(); c.fill(); }); c.restore();
      const fk=OWN.FL.up(t,420,520), fa=1-OWN.FL.up(t,760,880); if(fk>0){ const w=P.R*1.25*(1.3-0.3*fk), h=P.R*1.35*(1.3-0.3*fk); c.save(); c.globalAlpha=fa*fk; c.strokeStyle="#fffdf6"; c.lineWidth=P.S*0.22; c.shadowColor="rgba(60,40,80,.35)"; c.shadowBlur=8; c.strokeRect(P.tg.x-w,P.tg.y-h,w*2,h*2); c.fillStyle="rgba(255,255,250,.25)"; c.fillRect(P.tg.x-w,P.tg.y-h,w*2,h*2); c.restore(); } } },
  /* the unicorn's horn charges with rainbow sparkles and twists a spiral of rainbow light at the foe, which bursts in a rainbow star */
  "Horn Glow":{ col:[255, 210, 255], atk:(t)=>({f:0,pose:t<380?"cast":t<700?"push":null,rot:t<380?-0.08*(eo(t/380)):0}),
    draw(c,PF,P,t,x){ const horn=x.self.top?{x:x.self.top.x+P.d*P.S*0.25,y:x.self.top.y}:OWN.pt(x.self,P.tg,[0.7,-0.05]), rb=[[255,120,120],[255,200,90],[255,245,120],[130,230,140],[120,180,255],[190,140,255]], e=OWN.FL.up(t,0,380);
      if(t<400){ atGlowA(c,horn.x,horn.y,P.S*(0.5+1.2*e),[255,240,255],0.85*e); for(let i=0;i<6;i++){ const an=i/6*7+t/60, r=P.S*(1.4-1.0*e); OWN.star(c,horn.x+Math.cos(an)*r,horn.y+Math.sin(an)*r,P.S*0.22*e,OWN.rgb(rb[i],0.95),t/40+i); } }
      if(t<380) return; const k=OWN.FL.up(t,380,560), al=1-OWN.FL.up(t,700,900), dx=P.tg.x-horn.x, dy=P.tg.y-horn.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
      for(let s=0;s<3;s++){ c.strokeStyle=OWN.rgb(rb[s*2],0.85*al); c.lineWidth=P.S*0.16; c.lineCap="round"; c.beginPath(); for(let m=0;m<=30;m++){ const f=m/30*k, w=Math.sin(f*Math.PI*5+s*2.1-t/40)*P.S*0.5*Math.sin(Math.PI*f); c.lineTo(horn.x+dx*f+nx*w,horn.y+dy*f+ny*w); } c.stroke(); }
      if(k>=1){ const q=OWN.FL.up(t,560,880); for(let i=0;i<6;i++){ const an=i/6*Math.PI*2+q; c.strokeStyle=OWN.rgb(rb[i],0.9*(1-q)); c.lineWidth=P.S*0.2*(1-q); c.beginPath(); c.moveTo(P.tg.x,P.tg.y); c.lineTo(P.tg.x+Math.cos(an)*P.R*(0.5+1.2*q),P.tg.y+Math.sin(an)*P.R*(0.5+1.2*q)); c.stroke(); } OWN.star(c,P.tg.x,P.tg.y,P.S*(0.8+1.4*q),`rgba(255,255,255,${1-q})`,q*3); } } },
  /* a halo rings over the kirin's head as it rears, and a column of holy light falls on the foe with gold motes drifting down */
  "Holy Glow":{ col:[255, 235, 150], atk:(t)=>({f:0,pose:t<380?"cast":t<700?"push":null,rot:t<380?-0.1*eo(t/380):-0.1*(1-OWN.FL.up(t,380,700)),lift:-6*Math.sin(Math.PI*Math.min(1,t/700))}),
    draw(c,PF,P,t,x){ const top=x.self.top||OWN.pt(x.self,P.tg,[0.5,0]), e=OWN.FL.env(t), gold=[255,225,130];
      c.save(); c.globalAlpha=e; c.strokeStyle="rgba(255,235,150,.95)"; c.lineWidth=P.S*0.14; c.shadowColor="rgba(255,220,120,1)"; c.shadowBlur=P.S*0.6; c.beginPath(); c.ellipse(top.x,top.y-P.S*0.6,P.S*0.75,P.S*0.22,0,0,7); c.stroke(); c.restore();
      if(t<300) return; const k=OWN.FL.up(t,300,450), al=1-OWN.FL.up(t,720,900), cx=P.tg.x, w=P.R*1.2*k, topY=P.tg.y-P.R*7;
      c.save(); c.globalCompositeOperation="lighter"; const g=c.createLinearGradient(0,topY,0,P.gnd); g.addColorStop(0,`rgba(255,240,180,0)`); g.addColorStop(0.5,`rgba(255,235,160,${0.45*al})`); g.addColorStop(1,`rgba(255,245,200,${0.7*al})`); c.fillStyle=g;
      c.beginPath(); c.moveTo(cx-w*0.6,topY); c.lineTo(cx+w*0.6,topY); c.lineTo(cx+w,P.gnd); c.lineTo(cx-w,P.gnd); c.closePath(); c.fill(); c.restore();
      c.fillStyle=OWN.rg(c,cx,P.gnd-2,0,w*1.4,[[0,`rgba(255,245,200,${0.6*al})`],[1,"rgba(255,235,160,0)"]]); c.beginPath(); c.ellipse(cx,P.gnd-2,w*1.4,w*0.3,0,0,7); c.fill();
      for(let i=0;i<10;i++){ const f=((t/600)+i/10)%1; OWN.star(c,cx+(atH(i*3)-0.5)*w*1.6,topY+(P.gnd-topY)*(0.4+0.6*f),P.S*0.18*al,OWN.rgb(gold,0.95),t/40+i); }
      OWN.SS.squint(c,P,al*k); } },
  /* Sarimanok puffs up and fans its rainbow tail, the light gathers on its chest, and a wide rainbow fans out from there over the whole foe (Gid, 19 Nov 2026: it read as hitting the wrong way when the rays ran from the tail) */
  "Dazzle":{ col:[255, 215, 160], atk:(t)=>({f:0,pose:t<380?"cast":t<720?"push":null,sx:1+0.08*Math.sin(Math.PI*Math.min(1,t/720)),sy:1+0.06*Math.sin(Math.PI*Math.min(1,t/720))}),
    draw(c,PF,P,t,x){ const tail=OWN.pt(x.self,P.tg,[0.15,0.55]), chest=OWN.pt(x.self,P.tg,[0.85,0.45]), rb=[[228,64,52],[244,150,40],[244,206,60],[80,170,80],[60,120,210],[140,90,200],[240,110,170]], e=OWN.FL.env(t);
      /* the tail fans out behind and every feather lights up, then the light gathers into a prism glow on the chest */
      for(let i=0;i<7;i++){ const an=-Math.PI/2-P.d*(0.4+i*0.28)+Math.sin(t/90+i)*0.05, tip={x:tail.x+Math.cos(an)*P.R*1.1*e,y:tail.y+Math.sin(an)*P.R*1.1*e};
        atGlowA(c,tip.x,tip.y,P.S*0.6*e,rb[i],0.7*e); if(t>200&&t<760&&Math.floor(t/60+i)%3===0) OWN.star(c,tip.x,tip.y,P.S*0.45,OWN.rgb(rb[i],0.95),t/30+i);
        if(t>150&&t<400){ const q=((t-150)/250+i/7)%1; OWN.star(c,tip.x+(chest.x-tip.x)*q,tip.y+(chest.y-tip.y)*q,P.S*0.18*(1-q*0.5),OWN.rgb(rb[i],0.9),t/40+i); } }
      const g=OWN.FL.up(t,150,380)*(1-OWN.FL.up(t,700,900)); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,chest.x,chest.y,P.S*(0.6+1.2*g),[255,250,235],0.9*g); c.restore();
      if(t<380) return; const k=eo(OWN.FL.up(t,380,540)), al=1-OWN.FL.up(t,720,900), d=P.d, endX=P.tg.x+d*P.R*0.9, span=P.R*2.8;
      /* a wide rainbow fans out from the chest toward the foe, brightest where it lands, and covers it top to bottom */
      c.save(); c.globalCompositeOperation="lighter";
      for(let i=0;i<7;i++){ const ty=P.tg.y-span/2+span*(i+0.5)/7, x1=chest.x+(endX-chest.x)*k, y1=chest.y+(ty-chest.y)*k; OWN.FL.ray(c,chest.x,chest.y,x1,y1,P.S*0.08,span/7*0.62*k+1,rb[i],0.95*al,0.25,0.85); if(k<1) OWN.star(c,x1,y1,P.S*0.35,OWN.rgb(rb[i],0.95),t/30+i); }
      atGlowA(c,P.tg.x,P.tg.y,P.R*(1.2+0.6*k),[255,245,230],0.7*al*k); c.restore();
      const q=OWN.FL.up(t,500,900); for(let i=0;i<14;i++){ const an=i/14*Math.PI*2+0.2, v=P.R*(0.4+1.3*eo(q)); OWN.star(c,P.tg.x+Math.cos(an)*v,P.tg.y+Math.sin(an)*v*0.85,P.S*(0.35-0.15*q)*al,OWN.rgb(rb[i%7],0.95),t/40+i); }
      for(let i=0;i<10;i++){ const an=i/10*7+t/200, rr=P.R*(0.5+0.4*Math.sin(t/100+i)); OWN.star(c,P.tg.x+Math.cos(an)*rr,P.tg.y-P.R*0.25+Math.sin(an)*rr*0.5,P.S*0.25*al,OWN.rgb(rb[i%7],0.95),t/40+i); }
      OWN.SS.squint(c,P,al); } },
  /* glowing eyes open all over Shoggoth's body and stare; thin beams of eerie light run from every eye to the foe, which shrinks into a dark shadow of dread */
  "Staring Eyes":{ col:[150, 240, 120], atk:(t)=>({f:0,pose:t<380?"cast":null,off:t<760?[Math.sin(t*1.3)*1.5,Math.cos(t*1.7)*1]:[0,0]}),
    draw(c,PF,P,t,x){ const eyes=[[0.25,0.3],[0.6,0.18],[0.8,0.45],[0.4,0.6],[0.7,0.72],[0.18,0.62]].map(uv=>OWN.pt(x.self,P.tg,uv)), e=OWN.FL.env(t), iris=[150,240,120];
      eyes.forEach((p,i)=>{ const open=Math.min(1,Math.max(0,(t-i*45)/120))*(t>800?1-OWN.FL.up(t,800,900):1); OWN.FL.eyeBlob(c,p.x,p.y,P.S*(0.22+0.06*(i%3)),t+i*40,open,iris,1); atGlowA(c,p.x,p.y,P.S*0.5,iris,0.35*open);
        if(t>=380){ const k=OWN.FL.up(t,380,480), al=1-OWN.FL.up(t,700,900); c.save(); c.globalCompositeOperation="lighter"; OWN.FL.ray(c,p.x,p.y,P.tg.x+(atH(i)-0.5)*P.R*0.5,P.tg.y-P.R*0.2,P.S*0.08,P.S*0.35,iris,0.75*al*k); c.restore(); } });
      if(t<380) return; const al=1-OWN.FL.up(t,720,900); c.fillStyle=OWN.rg(c,P.tg.x,P.tg.y,P.R*0.2,P.R*1.4,[[0,"rgba(20,30,20,0)"],[1,`rgba(15,25,20,${0.45*al})`]]); c.beginPath(); c.arc(P.tg.x,P.tg.y,P.R*1.4,0,7); c.fill();
      c.strokeStyle=`rgba(120,200,110,${0.8*al})`; c.lineWidth=2.2; c.lineCap="round"; for(const sd of [-1,1]) for(let j=0;j<2;j++){ const xx=P.tg.x+sd*P.R*(0.85+j*0.14)+Math.sin(t/14+j)*2; c.beginPath(); c.moveTo(xx,P.tg.y-P.R*0.25); c.quadraticCurveTo(xx+sd*P.R*0.06,P.tg.y,xx,P.tg.y+P.R*0.25); c.stroke(); } } },
  /* the light drains out of the foe: streams of gold curl over to a pale orb above Hastur's hood, the foe's last light shrinks out, and a grey veil, smoke and ash settle on it */
  "Fading Light":{ col:[205, 205, 215], atk:(t)=>({f:0,pose:t<380?"cast":t<720?"push":null,rot:Math.sin(t/120)*0.05,lift:-8*Math.sin(Math.PI*Math.min(1,t/800))}),
    draw(c,PF,P,t,x){ const top=x.self.top||OWN.pt(x.self,P.tg,[0.5,0]), orb={x:top.x+P.d*P.S*0.3,y:top.y-P.R*0.45}, fx=P.tg.x, fy=P.tg.y, gold=[255,220,120], grey=[150,150,165], e=OWN.FL.env(t);
      /* the foe glows warm at first, and streams of its light peel off and curl over to Hastur, greying as they go */
      const lit=1-OWN.FL.up(t,250,620); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1.5+0.2*Math.sin(t/60)),[255,215,120],0.75*lit*Math.min(1,t/120)); c.restore();
      for(let s=0;s<5;s++){ const st={x:fx+(atH(s*5)-0.5)*P.R*1.1,y:fy+(atH(s*7)-0.5)*P.R*1.1}, mid={x:(st.x+orb.x)/2,y:Math.min(st.y,orb.y)-P.R*(0.8+0.5*atH(s*3))}, a=Math.min(1,Math.max(0,(t-60-s*40)/150))*(1-OWN.FL.up(t,620,820));
        if(a<=0) continue; const B=(q)=>({x:(1-q)*(1-q)*st.x+2*q*(1-q)*mid.x+q*q*orb.x,y:(1-q)*(1-q)*st.y+2*q*(1-q)*mid.y+q*q*orb.y});
        c.save(); c.globalCompositeOperation="lighter"; c.lineCap="round"; const gr=c.createLinearGradient(st.x,st.y,orb.x,orb.y); gr.addColorStop(0,OWN.rgb(gold,0.55*a)); gr.addColorStop(1,OWN.rgb(grey,0.15*a)); c.strokeStyle=gr;
          for(const [w,al2] of [[0.42,0.35],[0.16,1]]){ c.globalAlpha=al2; c.lineWidth=P.S*w; c.beginPath(); c.moveTo(st.x,st.y); c.quadraticCurveTo(mid.x,mid.y,orb.x,orb.y); c.stroke(); } c.restore();
        for(let m=0;m<3;m++){ const q=((t/450)+m/3+s*0.13)%1, p=B(q); OWN.star(c,p.x,p.y,P.S*0.3*(1-q*0.6)*a,OWN.rgb(OWN.mix(gold,grey,q),0.95),t/40+m+s); } }
      /* Hastur gathers the stolen light into a pale orb over its hood */
      const og=OWN.FL.up(t,100,560)*(1-OWN.FL.up(t,700,900)); if(og>0){ atGlowA(c,orb.x,orb.y,P.S*(0.6+1.4*og),[230,220,170],0.7*og); c.save(); c.globalAlpha=og; c.fillStyle=OWN.rg(c,orb.x,orb.y,0,P.S*0.6*og+1,[[0,"#fffbea"],[0.6,"rgba(225,215,170,.9)"],[1,"rgba(170,165,150,0)"]],-P.S*0.15,-P.S*0.15); c.beginPath(); c.arc(orb.x,orb.y,P.S*0.6*og+1,0,7); c.fill(); c.restore(); }
      if(t<380) return; const k=OWN.FL.up(t,380,620), al=1-OWN.FL.up(t,780,900);
      /* the last of the foe's light snuffs out in a shrinking ring, a grey veil drops over it and smoke curls up as from a blown-out candle */
      const sn=OWN.FL.up(t,380,560); if(sn<1){ c.strokeStyle=OWN.rgb([255,230,160],0.9*(1-sn)); c.lineWidth=P.S*0.2*(1-sn)+1; c.beginPath(); c.arc(fx,fy,P.R*(1.6-1.4*eo(sn)),0,7); c.stroke(); }
      c.fillStyle=OWN.rg(c,fx,fy,P.R*0.2,P.R*1.4,[[0,`rgba(95,95,110,${0.42*k*al})`],[1,"rgba(80,80,95,0)"]]); c.beginPath(); c.ellipse(fx,fy,P.R*1.4,P.R*1.45,0,0,7); c.fill();
      for(let i=0;i<6;i++){ const q=((t-380)/520+i/6)%1; PF(fx+(atH(i*3)-0.5)*P.R*1.2+Math.sin(t/120+i)*P.S*0.4,fy-P.R*0.2-q*P.R*1.8,P.S*(0.35+0.6*q),0.45*al*Math.sin(Math.PI*q),grey); }
      for(let i=0;i<12;i++){ const q=((t-380)/600+atH(i*5))%1; c.fillStyle=OWN.rgb([175,175,185],0.8*al*(1-q)); c.beginPath(); c.arc(fx+(atH(i*3)-0.5)*P.R*1.8+Math.sin(t/90+i)*P.S*0.2,fy-P.R*0.8+q*P.R*1.6,P.S*0.06,0,7); c.fill(); }
      for(let i=0;i<3;i++){ const q=((t-380)/400+i/3)%1; c.strokeStyle=OWN.rgb([130,130,145],0.6*al*(1-q)); c.lineWidth=2.5; c.beginPath(); c.arc(fx,fy,P.R*(1.4-0.7*q),0,7); c.stroke(); }
      OWN.SS.squint(c,P,al*k); } },
  /* Hastur raises its sigil in burning yellow inside a ring of runes and stamps it on the foe on the hit; the mark flares with rays, shock rings and flames, then smoulders on the foe's body */
  "Yellow Mark":{ col:[255, 220, 60], atk:(t)=>({f:0,pose:t<380?"cast":t<640?"push":null,lift:-10*Math.sin(Math.PI*Math.min(1,t/640))}),
    draw(c,PF,P,t,x){ const top=x.self.top||OWN.pt(x.self,P.tg,[0.5,0]), yel=[255,220,60], outer=OWN.rgb([255,190,40],0.95), inner=OWN.rgb([255,250,200],0.98), home={x:top.x,y:top.y-P.R*0.8}, fx=P.tg.x, fy=P.tg.y-P.R*0.05;
      /* a ring of runes turns round the sigil while it burns into being over Hastur, with yellow sparks spiralling in */
      const runes=(x0,y0,r,al,rot)=>{ if(al<=0) return; c.save(); c.globalAlpha*=al; c.translate(x0,y0); c.rotate(rot); c.strokeStyle=OWN.rgb(yel,0.85); c.lineWidth=P.S*0.06; c.lineCap="round"; c.shadowColor=OWN.rgb(yel,1); c.shadowBlur=P.S*0.3;
        c.beginPath(); c.arc(0,0,r,0,7); c.stroke(); c.beginPath(); c.arc(0,0,r*1.18,0,7); c.stroke();
        for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, m=r*1.09; c.save(); c.rotate(a); c.translate(m,0); c.beginPath(); if(i%3===0){ c.moveTo(-r*0.05,-r*0.05); c.lineTo(r*0.05,r*0.05); c.moveTo(r*0.05,-r*0.05); c.lineTo(-r*0.05,r*0.05); } else if(i%3===1){ c.arc(0,0,r*0.04,0,7); } else { c.moveTo(0,-r*0.06); c.lineTo(0,r*0.06); } c.stroke(); c.restore(); } c.restore(); };
      if(t<300){ const e=eo(t/300); atGlowA(c,home.x,home.y,P.R*(0.6+0.9*e),[255,210,80],0.6*e); runes(home.x,home.y,P.R*0.75*e,e,t/300); OWN.CH.sigil(c,home.x,home.y,P.R*0.55*e,yel,e,t);
        for(let i=0;i<10;i++){ const q=((t/260)+i/10)%1, an=i/10*7+t/120, r=P.R*1.6*(1-q); OWN.star(c,home.x+Math.cos(an)*r,home.y+Math.sin(an)*r,P.S*0.2*q,OWN.rgb(yel,0.95),t/40+i); } return; }
      const k=OWN.FL.up(t,300,380), ek=eo(k), p={x:home.x+(fx-home.x)*ek,y:home.y+(fy-home.y)*ek};
      if(k<1){ for(let g=3;g>=1;g--){ const kq=Math.max(0,ek-g*0.12); OWN.CH.sigil(c,home.x+(fx-home.x)*kq,home.y+(fy-home.y)*kq,P.R*(0.55+0.3*kq),yel,0.25,t); } runes(p.x,p.y,P.R*(0.75+0.3*k),1,t/300); OWN.CH.sigil(c,p.x,p.y,P.R*(0.55+0.3*k),yel,1,t); return; }
      const q=OWN.FL.up(t,380,900), b=OWN.FL.up(t,380,480), al=1-OWN.FL.up(t,800,900);
      /* the stamp lands: a flash, rays and two shock rings, yellow flames lick round the mark, and it shrinks into a brand that smoulders on the foe */
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1+1.2*(1-q)),[255,210,80],0.9*(1-q*0.7)); atGlowA(c,fx,fy,P.R*0.7,[255,250,220],0.9*(1-b));
      for(let i=0;i<12;i++){ const an=i/12*Math.PI*2+0.1; OWN.FL.ray(c,fx,fy,fx+Math.cos(an)*P.R*(1+1.4*b),fy+Math.sin(an)*P.R*(1+1.4*b),P.S*0.12,P.S*0.02,[255,225,90],1-b); } c.restore();
      for(let j=0;j<2;j++){ const r=OWN.FL.up(t,380+j*70,700+j*70); if(r>0&&r<1) OWN.CH.ring(c,fx,fy,P.R*(0.7+1.6*eo(r)),P.S*0.14*(1-r)+1,yel,0.85*(1-r)); }
      for(let i=0;i<9;i++){ const an=i/9*Math.PI*2, h=(0.6+0.4*Math.sin(t/50+i*2))*(1-q*0.7)*al, rr=P.R*(0.85-0.3*q); OWN.flame(c,fx+Math.cos(an)*rr,fy+Math.sin(an)*rr*0.9,P.S*0.38*h+1,an+Math.PI,outer,inner,t+i*30); }
      const sr=P.R*(0.85-0.35*eo(q)); runes(fx,fy,sr*1.25,(1-q)*al,-t/250); OWN.CH.sigil(c,fx,fy,sr,yel,al*(0.75+0.25*Math.sin(t/45)),t);
      for(let i=0;i<10;i++){ const f=((t-380)/450+atH(i*5))%1; c.fillStyle=OWN.rgb(OWN.mix([255,240,150],[255,150,40],f),0.9*al*(1-f)); c.beginPath(); c.arc(fx+(atH(i*3)-0.5)*P.R*1.2+Math.sin(t/70+i)*P.S*0.1,fy-f*P.R*1.6,P.S*0.07,0,7); c.fill(); }
      for(let i=0;i<5;i++){ const f=((t/500)+i/5)%1; PF(fx+(atH(i*3)-0.5)*P.R*0.8,fy-P.R*(0.3+1.1*f),P.S*(0.25+0.4*f),0.35*(1-f)*al,[130,120,110]); } } }
};
OWN.flashFx=(c,t,x,o)=>{ OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:[0.9,0.5]}); P.S*=2.8; OWN.GU.d=P.d; const col=o.col||[255,240,180], src=x.self.center||P.o0;
    /* every flash builds a soft aura of its own colour round the Snabit with motes rising, and lands with a bloom, a burst of sparkles and a soft ring (Gid, 19 Nov 2026: bigger, more effects) */
    if(t<430){ const k=Math.min(1,t/380), fade=t>380?1-(t-380)/50:1; for(let i=0;i<7;i++){ const an=i/7*7+t/220; PF(src.x+Math.cos(an)*P.R*(0.6+0.5*k),src.y+Math.sin(an)*P.R*(0.5+0.4*k),P.R*(0.22+0.12*k),0.22*k*fade,col); }
      for(let i=0;i<7;i++){ const q=((t/420)+i/7)%1; OWN.star(c,src.x+(atH(i*3)-0.5)*P.R*1.6,src.y+P.R*0.7-q*P.R*1.9,P.S*0.07*(1-q)*k,OWN.rgb(OWN.mix(col,[255,255,255],0.5),0.95*fade),t/50+i); } }
    if(t>=380){ const k=OWN.FL.up(t,380,860), al=1-k; for(let i=0;i<8;i++){ const an=i/8*7; PF(P.tg.x+Math.cos(an)*P.R*(0.2+0.6*k),P.tg.y+Math.sin(an)*P.R*0.5*(0.2+0.6*k),P.R*(0.4+0.4*k),0.5*al,col); }
      for(let i=0;i<12;i++){ const an=i/12*Math.PI*2+0.2, v=P.R*(0.4+1.6*eo(k)); OWN.star(c,P.tg.x+Math.cos(an)*v,P.tg.y+Math.sin(an)*v*0.8,P.S*(0.12+0.06*(i%2))*al,OWN.rgb(OWN.mix(col,[255,255,255],0.45),0.95),k*4+i); }
      OWN.CH.ring(c,P.tg.x,P.tg.y,P.R*(0.6+1.3*eo(k)),P.S*0.12*al+1,col,0.8*al); }
    o.draw(c,PF,P,t,x); }); };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.flash) return; const K=ANIM.flash, fx1=K.fx, atk1=K.atk;
  K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&pos.name&&OWN_FLASH[pos.name], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; };
  K.fx=function(c,t,x){ const o=x&&OWN_FLASH[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ OWN.flashFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN flash",x.name,e&&e.message); } } }; })();

/* ---------- beam, own versions (19 Nov 2026): every family fired the same thin coloured line, so each one now shoots from its own body
   part in its own shape: Antik scans and lasers from its screen and antenna, Moko stares and fires from its one eye, Lern's lantern
   pours, sweeps and splits light, Glop squirts water and acid, Wick stretches its flame or turns it into a blowtorch, Lumo's tail
   needles, spotlights or lines up fireflies, Clank blasts steam, Aero rides a jet stream, Helm bubbles and jets, Bloop fires water
   blobs, Suds foams, fountains and freezes, Tome casts runes and words, Shutter zooms and focuses, Vampire calls the moon, Kraken
   twists a spout, Golem pulses runes, Diwata blooms, Sphinx raises the sun, Dragon and Salamander breathe fire four ways, Djinn grants
   wishes, Migo probes minds, Dagon sprays from its gills, Hastur stages its final act and Yog lines up its globes.
   The beam reaches the foe by 330 ms, the hit lands at 380 and everything clears by 900. ---------- */
OWN.BM={ up:(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a))), L:(t)=>eo(Math.max(0,Math.min(1,(t-200)/130))), A:(t)=>1-Math.max(0,Math.min(1,(t-720)/180)),
  lp:(a,b,k)=>({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k}),
  /* a glossy tube of light or liquid: a soft glow, a body that is brightest down the middle, a white core and a round head */
  tube(c,a,b,w,col,al,wob=0,t=0,core=1){ if(al<=0||w<0.5) return; const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, N=28, pts=[];
    for(let s of [1,-1]) for(let i=0;i<=N;i++){ const k=s>0?i/N:1-i/N, ww=w*(0.45+0.55*Math.min(1,k*5))*(1+wob*Math.sin(k*14-t/35+(s>0?0:1.9))); pts.push([a.x+dx*k+nx*ww*s,a.y+dy*k+ny*ww*s]); }
    c.save(); c.globalAlpha*=al; c.shadowColor=OWN.rgb(col,0.9); c.shadowBlur=w*1.6; const mx=(a.x+b.x)/2, my=(a.y+b.y)/2, g=c.createLinearGradient(mx-nx*w*1.2,my-ny*w*1.2,mx+nx*w*1.2,my+ny*w*1.2);
    g.addColorStop(0,OWN.rgb(col,0.25)); g.addColorStop(0.25,OWN.rgb(col,0.85)); g.addColorStop(0.5,OWN.rgb(OWN.mix(col,[255,255,255],0.75),1)); g.addColorStop(0.75,OWN.rgb(col,0.85)); g.addColorStop(1,OWN.rgb(OWN.mix(col,[60,40,90],0.25),0.3));
    c.fillStyle=g; c.beginPath(); pts.forEach((p,i)=>c[i?"lineTo":"moveTo"](p[0],p[1])); c.closePath(); c.fill(); c.shadowBlur=0;
    if(core){ c.strokeStyle=`rgba(255,255,255,${0.85*core})`; c.lineWidth=Math.max(1,w*0.32); c.lineCap="round"; c.beginPath(); c.moveTo(a.x+dx*0.04,a.y+dy*0.04); c.lineTo(b.x,b.y); c.stroke(); }
    c.fillStyle=OWN.rg(c,b.x,b.y,0,w*1.4,[[0,"rgba(255,255,255,.95)"],[0.5,OWN.rgb(col,0.8)],[1,OWN.rgb(col,0)]]); c.beginPath(); c.arc(b.x,b.y,w*1.4,0,7); c.fill(); c.restore(); },
  /* a cone of light from a to the span round b, soft at the edges */
  cone(c,a,b,w0,w1,col,al,a0=0.15,a1=0.55){ if(al<=0) return; const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, g=c.createLinearGradient(a.x,a.y,b.x,b.y);
    g.addColorStop(0,OWN.rgb(col,a1*al)); g.addColorStop(1,OWN.rgb(col,a0*al)); c.save(); c.fillStyle=g; c.beginPath(); c.moveTo(a.x+nx*w0,a.y+ny*w0); c.lineTo(b.x+nx*w1,b.y+ny*w1); c.lineTo(b.x-nx*w1,b.y-ny*w1); c.lineTo(a.x-nx*w0,a.y-ny*w0); c.closePath(); c.fill(); c.restore(); },
  /* a charge gathering at a point: a growing glow with motes drawn in */
  charge(c,p,S,col,k,t){ if(k<=0) return; atGlowA(c,p.x,p.y,S*(0.4+1.0*k),col,0.8*k); for(let i=0;i<8;i++){ const q=((t/220)+i/8)%1, an=i/8*7+t/150, r=S*1.8*(1-q); OWN.star(c,p.x+Math.cos(an)*r,p.y+Math.sin(an)*r,S*0.12*q*k+0.5,OWN.rgb(OWN.mix(col,[255,255,255],0.5),0.95),t/40+i); } },
  hv:(o,tg)=>Math.atan2(tg.y-o.y,tg.x-o.x),
  rune(c,x,y,s,i,col,al){ if(al<=0||s<1) return; c.save(); c.globalAlpha*=al; c.translate(x,y); c.strokeStyle=OWN.rgb(col,1); c.lineWidth=Math.max(1.2,s*0.16); c.lineCap="round"; c.lineJoin="round"; c.shadowColor=OWN.rgb(col,1); c.shadowBlur=s*0.6; c.beginPath();
    const R=[[[0,-1,0,1],[0,-0.4,0.6,-0.9]],[[-0.4,-1,-0.4,1],[-0.4,-1,0.5,0],[0.5,0,-0.4,0.4]],[[0,-1,0,1],[-0.6,-0.3,0.6,0.3],[0.6,-0.3,-0.6,0.3]],[[-0.5,1,0,-1],[0,-1,0.5,1],[-0.3,0.2,0.3,0.2]],[[-0.5,-1,-0.5,1],[0.5,-1,0.5,1],[-0.5,0,0.5,0]],[[0,-1,0.6,0],[0.6,0,0,1],[0,1,-0.6,0],[-0.6,0,0,-1]]][i%6];
    R.forEach(l=>{ c.moveTo(l[0]*s,l[1]*s); c.lineTo(l[2]*s,l[3]*s); }); c.stroke(); c.restore(); },
  moon(c,x,y,r,col,al,crescent){ if(al<=0||r<1) return; c.save(); c.globalAlpha*=al; atGlowA(c,x,y,r*2.4,col,0.6); c.fillStyle=OWN.rg(c,x,y,0,r,[[0,"#fff"],[0.55,OWN.rgb(OWN.mix(col,[255,255,255],0.5))],[1,OWN.rgb(col)]],-r*0.3,-r*0.3);
    c.beginPath(); c.arc(x,y,r,0,7); if(crescent){ c.arc(x+r*0.45,y-r*0.2,r*0.85,0,7,true); } c.fill("evenodd"); if(!crescent){ c.fillStyle=OWN.rgb(OWN.mix(col,[0,0,0],0.25),0.35); for(const [u,v,w] of [[-0.3,0.1,0.18],[0.25,-0.25,0.12],[0.2,0.35,0.15]]){ c.beginPath(); c.arc(x+u*r,y+v*r,w*r,0,7); c.fill(); } } c.restore(); },
  bat(c,x,y,s,t,al){ if(al<=0) return; const f=Math.sin(t/40)*0.6; c.save(); c.globalAlpha*=al; c.translate(x,y); c.fillStyle="#3a2a4a"; for(const sd of [-1,1]){ c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(sd*s*0.8,-s*(0.6+f),sd*s*1.4,-s*0.1*f); c.quadraticCurveTo(sd*s*0.9,s*0.1,sd*s*0.7,s*0.3); c.quadraticCurveTo(sd*s*0.4,s*0.05,0,s*0.2); c.fill(); }
    c.beginPath(); c.ellipse(0,0,s*0.3,s*0.35,0,0,7); c.fill(); c.fillStyle="#ffd84a"; c.beginPath(); c.arc(-s*0.1,-s*0.05,s*0.06,0,7); c.arc(s*0.1,-s*0.05,s*0.06,0,7); c.fill(); c.restore(); },
  fish(c,x,y,s,ang,col,al){ if(al<=0) return; c.save(); c.globalAlpha*=al; c.translate(x,y); c.rotate(ang); c.fillStyle=OWN.rg(c,0,0,0,s,[[0,OWN.rgb(OWN.mix(col,[255,255,255],0.5))],[1,OWN.rgb(col)]],-s*0.3,-s*0.3); c.beginPath(); c.ellipse(0,0,s,s*0.5,0,0,7); c.fill();
    c.beginPath(); c.moveTo(-s*0.8,0); c.lineTo(-s*1.5,-s*0.5); c.lineTo(-s*1.5,s*0.5); c.closePath(); c.fill(); c.fillStyle="#222"; c.beginPath(); c.arc(s*0.5,-s*0.1,s*0.12,0,7); c.fill(); c.restore(); },
  flower(c,x,y,s,col,k,rot=0){ if(k<=0||s<1) return; c.save(); c.translate(x,y); c.rotate(rot); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; c.fillStyle=OWN.rg(c,Math.cos(a)*s*0.5*k,Math.sin(a)*s*0.5*k,0,s*0.5,[[0,"#fff"],[1,OWN.rgb(col)]]); c.beginPath(); c.ellipse(Math.cos(a)*s*0.5*k,Math.sin(a)*s*0.5*k,s*0.42*k,s*0.26*k,a,0,7); c.fill(); }
    c.fillStyle="#ffd84a"; c.beginPath(); c.arc(0,0,s*0.2*k,0,7); c.fill(); c.restore(); },
  curtain(c,x,y0,y1,w,sd,k,al){ if(k<=0||al<=0) return; const cw=w*k; c.save(); c.globalAlpha*=al; const x0=x+sd*w, x1=x0-sd*cw; c.fillStyle=OWN.lg(c,x0,0,x1,0,[[0,"#7a1020"],[0.5,"#c8303e"],[1,"#8a1828"]]); c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y0);
    for(let i=0;i<=8;i++){ const yy=y0+(y1-y0)*i/8; c.lineTo(x1+Math.sin(i*1.3)*w*0.04*sd,yy); } c.lineTo(x0,y1); c.closePath(); c.fill(); c.strokeStyle="rgba(255,255,255,.18)"; c.lineWidth=2; for(let i=1;i<4;i++){ const xx=x0-sd*cw*i/4; c.beginPath(); c.moveTo(xx,y0); c.lineTo(xx,y1); c.stroke(); }
    c.fillStyle="#f2c94c"; c.fillRect(Math.min(x0,x1),y0-4,Math.abs(x1-x0),6); c.restore(); },
  /* a soft ball of fire: white-yellow when hot, orange, then red as it cools */
  fire(c,x,y,r,h,al){ if(r<1||al<=0) return; const inn=h>0.75?[255,252,230]:h>0.5?[255,225,120]:h>0.3?[255,160,60]:[230,90,40], out=h>0.6?[255,150,40]:h>0.35?[245,90,30]:[170,40,30];
    c.fillStyle=OWN.rg(c,x,y,0,r,[[0,OWN.rgb(inn,al)],[0.4,OWN.rgb(out,0.7*al)],[1,OWN.rgb(out,0)]]); c.beginPath(); c.arc(x,y,r,0,7); c.fill(); },
  /* a thick rope of water along pts: a deep body, a light middle, a flowing white highlight to one side, and foam on the edges */
  water(c,pts,w,al,t,col=[110,190,255]){ if(pts.length<2||al<=0) return; const nrm=[]; for(let i=0;i<pts.length;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)], L=Math.hypot(b.x-a.x,b.y-a.y)||1; nrm.push({x:-(b.y-a.y)/L,y:(b.x-a.x)/L}); }
    const path=(off)=>{ c.beginPath(); pts.forEach((p,i)=>c[i?"lineTo":"moveTo"](p.x+nrm[i].x*off,p.y+nrm[i].y*off)); };
    c.save(); c.globalAlpha*=al; c.lineCap="round"; c.lineJoin="round"; c.shadowColor="rgba(60,130,230,.55)"; c.shadowBlur=w*0.6; c.strokeStyle=OWN.rgb(OWN.mix(col,[20,60,150],0.35),0.9); c.lineWidth=w; path(0); c.stroke(); c.shadowBlur=0;
    c.strokeStyle=OWN.rgb(col,0.95); c.lineWidth=w*0.72; path(-w*0.05); c.stroke(); c.strokeStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.55),0.9); c.lineWidth=w*0.32; path(-w*0.18); c.stroke();
    c.strokeStyle="rgba(255,255,255,.95)"; c.lineWidth=w*0.12; c.setLineDash([w*0.9,w*0.5,w*0.3,w*0.6]); c.lineDashOffset=-t/2.5; path(-w*0.24); c.stroke(); c.lineWidth=w*0.06; c.lineDashOffset=-t/2; path(w*0.2); c.stroke(); c.setLineDash([]);
    for(let i=1;i<pts.length-1;i+=2){ for(const sd of [-1,1]){ const p=pts[i], j=Math.sin(t/30+i*1.7+sd)*0.5+0.5; c.fillStyle=`rgba(255,255,255,${0.75*j})`; c.beginPath(); c.arc(p.x+nrm[i].x*sd*w*0.48,p.y+nrm[i].y*sd*w*0.48,w*0.09*(0.5+j),0,7); c.fill(); } } c.restore(); },
  /* an intricate magic circle: rune band, two rings, a hexagram, four small sealed circles and a starred centre; sx, sy squash it to face sideways or lie on the ground */
  sigil(c,x,y,r,col,al,rot,sx=1,sy=1){ if(al<=0||r<2) return; const lt=OWN.mix(col,[255,255,255],0.55); c.save(); c.globalAlpha*=al; atGlowA(c,x,y,r*1.6,col,0.45); c.translate(x,y); c.scale(sx,sy); c.rotate(rot); c.lineCap="round"; c.lineJoin="round";
    c.fillStyle=OWN.rg(c,0,0,0,r,[[0,OWN.rgb(lt,0.25)],[0.7,OWN.rgb(col,0.12)],[1,OWN.rgb(col,0.3)]]); c.beginPath(); c.arc(0,0,r,0,7); c.fill();
    c.shadowColor=OWN.rgb(col,1); c.shadowBlur=r*0.12; c.strokeStyle=OWN.rgb(lt,0.95); c.lineWidth=r*0.035; for(const k of [1,0.86,0.6,0.34]){ c.beginPath(); c.arc(0,0,r*k,0,7); c.stroke(); }
    c.lineWidth=r*0.018; for(let i=0;i<56;i++){ const a=i/56*Math.PI*2, k=atH(i*7); c.save(); c.rotate(a); c.translate(r*0.93,0); c.beginPath(); if(k<0.33){ c.moveTo(-r*0.035,0); c.lineTo(r*0.035,0); c.moveTo(0,-r*0.02); c.lineTo(0,r*0.02); } else if(k<0.66){ c.moveTo(-r*0.035,-r*0.02); c.lineTo(r*0.035,r*0.02); } else { c.arc(0,0,r*0.015,0,7); } c.stroke(); c.restore(); }
    c.lineWidth=r*0.025; for(const o of [0,Math.PI]){ c.beginPath(); for(let i=0;i<3;i++){ const a=o-Math.PI/2+i/3*Math.PI*2; c[i?"lineTo":"moveTo"](Math.cos(a)*r*0.86,Math.sin(a)*r*0.86); } c.closePath(); c.stroke(); }
    c.beginPath(); for(let i=0;i<4;i++){ const a=Math.PI/4+i/4*Math.PI*2; c[i?"lineTo":"moveTo"](Math.cos(a)*r*0.6,Math.sin(a)*r*0.6); } c.closePath(); c.stroke();
    for(let i=0;i<4;i++){ const a=i/4*Math.PI*2, cx=Math.cos(a)*r*0.86, cy=Math.sin(a)*r*0.86, rr=r*0.15; c.fillStyle=OWN.rgb(OWN.mix(col,[20,10,40],0.6),0.85); c.beginPath(); c.arc(cx,cy,rr,0,7); c.fill(); c.stroke(); c.beginPath();
      if(i%2){ c.moveTo(cx,cy-rr*0.55); c.lineTo(cx+rr*0.5,cy+rr*0.35); c.lineTo(cx-rr*0.5,cy+rr*0.35); c.closePath(); } else { c.moveTo(cx-rr*0.5,cy-rr*0.35); c.lineTo(cx+rr*0.5,cy-rr*0.35); c.lineTo(cx,cy+rr*0.55); c.closePath(); } c.stroke(); }
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; c.beginPath(); c.moveTo(Math.cos(a)*r*0.34,Math.sin(a)*r*0.34); c.lineTo(Math.cos(a)*r*0.6,Math.sin(a)*r*0.6); c.stroke(); }
    c.shadowBlur=r*0.2; c.fillStyle=OWN.rgb([255,255,255],0.95); c.beginPath(); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, rr=i%2?r*0.08:r*0.22; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); c.restore(); },
  /* small arcane symbols: crescent, eye, star, triangle, dotted circle and a looped knot */
  sym(c,x,y,s,i,col,al,rot=0){ if(al<=0||s<1) return; c.save(); c.globalAlpha*=al; c.translate(x,y); c.rotate(rot); c.strokeStyle=OWN.rgb(col,1); c.fillStyle=OWN.rgb(col,1); c.lineWidth=Math.max(1.2,s*0.14); c.lineCap="round"; c.shadowColor=OWN.rgb(col,1); c.shadowBlur=s*0.7; c.beginPath();
    switch(i%6){ case 0: c.arc(0,0,s,0.6,Math.PI*2-0.6); c.arc(s*0.45,0,s*0.75,Math.PI*2-0.9,0.9,true); c.closePath(); c.fill(); break;
      case 1: c.moveTo(-s,0); c.quadraticCurveTo(0,-s*0.8,s,0); c.quadraticCurveTo(0,s*0.8,-s,0); c.stroke(); c.beginPath(); c.arc(0,0,s*0.3,0,7); c.fill(); break;
      case 2: c.restore(); OWN.star(c,x,y,s*1.1,OWN.rgb(col,al),rot); return;
      case 3: c.moveTo(0,-s); c.lineTo(s*0.9,s*0.7); c.lineTo(-s*0.9,s*0.7); c.closePath(); c.moveTo(-s*0.55,s*0.1); c.lineTo(s*0.55,s*0.1); c.stroke(); break;
      case 4: c.arc(0,0,s*0.85,0,7); c.stroke(); c.beginPath(); c.arc(0,0,s*0.22,0,7); c.fill(); break;
      default: c.moveTo(0,0); c.bezierCurveTo(-s*1.2,-s*0.9,-s*1.2,s*0.9,0,0); c.bezierCurveTo(s*1.2,-s*0.9,s*1.2,s*0.9,0,0); c.stroke(); }
    c.restore(); },
  /* a detailed moon: shaded disc, darker seas, craters with lit rims; a crescent is cut out with a clip so nothing else is erased */
  moon2(c,x,y,r,base,dark,al,crescent,hi=0.55){ if(al<=0||r<2) return; c.save(); c.globalAlpha*=al; atGlowA(c,x,y,r*2.6,base,0.5); c.beginPath(); c.arc(x,y,r,0,7); if(crescent){ c.arc(x+r*0.5,y-r*0.25,r*0.88,0,7,true); } c.clip("evenodd");
    c.fillStyle=OWN.rg(c,x,y,0,r,[[0,OWN.rgb(OWN.mix(base,[255,255,255],hi))],[0.7,OWN.rgb(base)],[1,OWN.rgb(OWN.mix(base,dark,0.45))]],-r*0.35,-r*0.35); c.fillRect(x-r,y-r,r*2,r*2);
    c.fillStyle=OWN.rgb(dark,0.28); for(const [u,v,w,h,a] of [[-0.3,-0.1,0.38,0.24,0.4],[0.15,0.25,0.3,0.2,-0.3],[0.25,-0.35,0.22,0.14,0.2],[-0.15,0.45,0.2,0.12,0.1]]){ c.beginPath(); c.ellipse(x+u*r,y+v*r,w*r,h*r,a,0,7); c.fill(); }
    for(const [u,v,w] of [[-0.45,0.25,0.13],[0.35,0.05,0.1],[-0.05,-0.5,0.09],[0.5,0.45,0.08],[-0.2,0.05,0.07],[0.05,0.6,0.06]]){ const cx=x+u*r, cy=y+v*r, cr=w*r; c.fillStyle=OWN.rgb(dark,0.35); c.beginPath(); c.arc(cx,cy,cr,0,7); c.fill(); c.strokeStyle=OWN.rgb(OWN.mix(base,[255,255,255],0.6),0.7); c.lineWidth=Math.max(1,cr*0.25); c.beginPath(); c.arc(cx,cy,cr,0.2,Math.PI*0.9); c.stroke(); c.strokeStyle=OWN.rgb(dark,0.5); c.beginPath(); c.arc(cx,cy,cr,Math.PI*1.2,Math.PI*1.9); c.stroke(); }
    OWN.CH.shine(c,x-r*0.45,y-r*0.5,r*0.25,r*0.12,0.55,-0.6); c.restore(); },
  /* a stage curtain with folds, a scalloped hem and a gold tie line, sliding in from side sd */
  curtain2(c,cx,y0,y1,w,sd,k,al,t){ if(k<=0||al<=0) return; const outer=cx+sd*w, inner=outer-sd*w*k, n=7; c.save(); c.globalAlpha*=al; c.shadowColor="rgba(40,0,10,.45)"; c.shadowBlur=10;
    for(let i=0;i<n;i++){ const xa=outer+(inner-outer)*i/n, xb=outer+(inner-outer)*(i+1)/n, sw=Math.sin(t/200+i)*2*(1-k*0.5); c.fillStyle=OWN.lg(c,xa,0,xb,0,[[0,"#6e0c1c"],[0.45,"#d33a48"],[0.6,"#b52a3a"],[1,"#5e0a18"]]);
      c.beginPath(); c.moveTo(xa,y0); c.lineTo(xb,y0); c.lineTo(xb+sw,y1); c.quadraticCurveTo((xa+xb)/2+sw,y1+w*0.06,xa+sw,y1); c.closePath(); c.fill(); }
    c.shadowBlur=0; c.strokeStyle="rgba(255,210,120,.9)"; c.lineWidth=3; c.beginPath(); c.moveTo(inner,y1-w*0.08); c.lineTo(outer,y1-w*0.08); c.stroke(); c.fillStyle="#f2c94c"; for(let i=0;i<=n;i++){ const xx=outer+(inner-outer)*i/n; c.beginPath(); c.arc(xx,y1-w*0.08,2.2,0,7); c.fill(); } c.restore(); }
};
const OWN_BEAM={
  /* Antik's screen fills with scan lines, then a green scan fan sweeps up and down over the foe and a target box locks on */
  "Scan Beam":{ col:[110,255,170], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, scr=x.self.center||OWN.pt(x.self,P.tg,[0.55,0.45]), col=[110,255,170], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      const e=B.up(t,0,200); atGlowA(c,scr.x,scr.y,P.S*(0.6+0.8*e),col,0.6*e*al); c.strokeStyle=OWN.rgb([200,255,220],0.7*e*al); c.lineWidth=1.5; for(let i=0;i<5;i++){ const yy=scr.y-P.S*0.4+((i*P.S*0.2+t/8)%(P.S*0.9)); c.beginPath(); c.moveTo(scr.x-P.S*0.45,yy); c.lineTo(scr.x+P.S*0.45,yy); c.stroke(); }
      if(t<200) return; const end=B.lp(scr,{x:fx+P.d*P.R*0.4,y:fy},L); B.cone(c,scr,end,P.S*0.25,P.R*1.3*L,col,al,0.35,0.15);
      c.save(); c.strokeStyle=OWN.rgb(col,0.35*al); c.lineWidth=1.2; for(let i=0;i<9;i++){ const k=((i/9)+t/700)%1, p=B.lp(scr,end,k), h=P.S*0.25+(P.R*1.3*L-P.S*0.25)*k; c.beginPath(); c.moveTo(p.x,p.y-h); c.lineTo(p.x,p.y+h); c.stroke(); } c.restore();
      const sy=fy+Math.sin((t-200)/110)*P.R*0.9*L; c.save(); c.globalCompositeOperation="lighter"; B.tube(c,scr,{x:fx+P.d*P.R*0.2,y:sy},P.S*0.1,col,al*L,0,t); c.restore(); c.strokeStyle=OWN.rgb([220,255,235],0.95*al*L); c.lineWidth=P.S*0.08; c.beginPath(); c.moveTo(fx-P.R*1.05,sy); c.lineTo(fx+P.R*1.05,sy); c.stroke();
      if(t<330) return; const k=B.up(t,330,520); c.save(); c.globalAlpha=al; c.strokeStyle=OWN.rgb(col,0.35); c.lineWidth=1; for(let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(fx+i*P.R*0.3,fy-P.R); c.lineTo(fx+i*P.R*0.3,fy+P.R); c.moveTo(fx-P.R,fy+i*P.R*0.3); c.lineTo(fx+P.R,fy+i*P.R*0.3); c.stroke(); }
      const bx=P.R*(1.7-0.55*eo(k)), lk=t>560&&Math.floor(t/70)%2===0?[255,90,90]:col; c.strokeStyle=OWN.rgb(lk,0.95); c.lineWidth=P.S*0.12; c.lineCap="round"; for(const [sx,sy2] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ c.beginPath(); c.moveTo(fx+sx*bx,fy+sy2*bx*0.85-sy2*P.R*0.35); c.lineTo(fx+sx*bx,fy+sy2*bx*0.85); c.lineTo(fx+sx*bx-sx*P.R*0.35,fy+sy2*bx*0.85); c.stroke(); } c.restore(); } },
  /* sparks crackle on Antik's antenna, then a red laser traces a zigzag over the foe and the burnt line pops in sparks */
  "Laser Line":{ col:[255,70,90], atk:(t)=>({f:0,pose:t<200?"slamup":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, ant={x:(x.self.top||P.o0).x,y:(x.self.top||P.o0).y-P.S*0.15}, col=[255,70,90], al=B.A(t), fx=P.tg.x, fy=P.tg.y;
      const e=B.up(t,0,200)*al; for(let i=0;i<3;i++){ const a=t/45+i*2.1; OWN.zap(c,ant.x,ant.y,ant.x+Math.cos(a)*P.S*0.7,ant.y+Math.sin(a)*P.S*0.5,i+Math.floor(t/50),[255,120,140],P.S*0.05,P.S*0.12,4,false,e); } atGlowA(c,ant.x,ant.y,P.S*0.8,col,0.8*e);
      if(t<200) return; const zz=[[-0.9,-0.7],[0.9,-0.5],[-0.8,0.05],[0.85,0.25],[-0.7,0.75]], tr=B.up(t,280,640), seg=tr*(zz.length-1), n=Math.floor(seg), f=seg-n, pts=[];
      for(let i=0;i<=n&&i<zz.length;i++) pts.push({x:fx+zz[i][0]*P.R,y:fy+zz[i][1]*P.R}); if(n<zz.length-1) pts.push({x:fx+(zz[n][0]+(zz[n+1][0]-zz[n][0])*f)*P.R,y:fy+(zz[n][1]+(zz[n+1][1]-zz[n][1])*f)*P.R});
      const tip=t<280?B.lp(ant,{x:fx+zz[0][0]*P.R,y:fy+zz[0][1]*P.R},B.up(t,200,280)):pts[pts.length-1], burn=1-B.up(t,700,860);
      if(pts.length>1&&burn>0){ c.save(); c.lineCap="round"; c.lineJoin="round"; c.shadowColor=OWN.rgb(col,1); c.shadowBlur=P.S*0.4; c.strokeStyle=OWN.rgb([255,120,60],0.9*burn); c.lineWidth=P.S*0.2; c.beginPath(); pts.forEach((p,i)=>c[i?"lineTo":"moveTo"](p.x,p.y)); c.stroke(); c.shadowBlur=0; c.strokeStyle=`rgba(255,240,200,${burn})`; c.lineWidth=P.S*0.05; c.stroke(); c.restore(); }
      if(t<660){ c.save(); c.globalCompositeOperation="lighter"; B.tube(c,ant,tip,P.S*0.11,col,al,0,t); c.restore(); atGlowA(c,tip.x,tip.y,P.S*0.6,[255,180,120],0.9); OWN.star(c,tip.x,tip.y,P.S*0.4,"rgba(255,250,220,.95)",t/20); }
      if(t>=660) for(let i=0;i<zz.length;i++){ const q=B.up(t,660+i*30,860+i*30); if(q>0&&q<1){ const p={x:fx+zz[i][0]*P.R,y:fy+zz[i][1]*P.R}; atGlowA(c,p.x,p.y,P.S*(0.5+0.8*q),[255,150,90],0.9*(1-q)); OWN.star(c,p.x,p.y,P.S*(0.4+0.6*q),`rgba(255,240,200,${1-q})`,q*3+i); OWN.pop(c,p.x,p.y,P.S*0.35,[255,190,120],q,6); } } } },
  /* Moko's one eye throws staring rings in the shape of an eye, and a huge see-through eye opens over the trembling foe */
  "Stare":{ col:[230,140,255], atk:(t)=>({f:t<820?0.02:0,pose:t<820?"determined":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, eye=(x.self.eyes&&x.self.eyes[0])||OWN.pt(x.self,P.tg,[0.6,0.4]), col=[230,140,255], al=B.A(t), fx=P.tg.x, fy=P.tg.y;
      atGlowA(c,eye.x,eye.y,P.S*(0.6+0.3*Math.sin(t/60)),col,0.6*al);
      for(let i=0;i<5;i++){ const q=(t-120-i*90)/360; if(q<0||q>1) continue; const p=B.lp(eye,P.tg,eo(q)), w=P.S*(0.6+1.6*q), a=al*Math.sin(Math.PI*Math.min(1,q*1.4)); c.save(); c.globalAlpha=a; c.translate(p.x,p.y); c.strokeStyle=OWN.rgb(col,0.9); c.lineWidth=P.S*0.09; c.shadowColor=OWN.rgb(col,1); c.shadowBlur=P.S*0.4;
        c.beginPath(); c.moveTo(-w,0); c.quadraticCurveTo(0,-w*0.75,w,0); c.quadraticCurveTo(0,w*0.75,-w,0); c.stroke(); c.fillStyle=OWN.rgb(OWN.mix(col,[60,20,80],0.4),0.8); c.beginPath(); c.arc(0,0,w*0.22,0,7); c.fill(); c.restore(); }
      if(t<330) return; const k=B.up(t,330,480), ey={x:fx,y:fy-P.R*0.1}, w=P.R*1.35*eo(k); c.save(); c.globalAlpha=0.6*al; atGlowA(c,ey.x,ey.y,w*1.4,col,0.4); c.fillStyle="rgba(255,250,255,.85)"; c.beginPath(); c.moveTo(ey.x-w,ey.y); c.quadraticCurveTo(ey.x,ey.y-w*0.8*k,ey.x+w,ey.y); c.quadraticCurveTo(ey.x,ey.y+w*0.8*k,ey.x-w,ey.y); c.fill();
      const lx=Math.sin(t/90)*w*0.08; c.fillStyle=OWN.rg(c,ey.x+lx,ey.y+w*0.1,0,w*0.45,[[0,"#ffd0ff"],[0.5,OWN.rgb(col)],[1,OWN.rgb(OWN.mix(col,[60,10,90],0.5))]]); c.beginPath(); c.arc(ey.x+lx,ey.y+w*0.1,w*0.42*k,0,7); c.fill(); c.fillStyle="#1a0c22"; c.beginPath(); c.arc(ey.x+lx,ey.y+w*0.1,w*0.18*k,0,7); c.fill(); c.fillStyle="#fff"; c.beginPath(); c.arc(ey.x+lx-w*0.12,ey.y-w*0.05,w*0.08*k,0,7); c.fill(); c.restore();
      OWN.tremble(c,P.tg,P.R,t,[120,80,160],0.85*al); for(let i=0;i<2;i++){ const q=((t-330)/420+i/2)%1; OWN.drop(c,fx+P.R*(0.55+0.15*i),P.head.y+P.R*(0.1+0.5*q),P.S*0.18,Math.PI/2,[150,210,255]); } } },
  /* the pupil pulls in a charge, then a thick pink beam with rings spiralling round it bursts from the eye */
  "Eye Beam":{ col:[255,110,200], atk:(t)=>({f:0,pose:t<200?"determined":t<820?"push":null,off:t>200&&t<800?[-OWN_PD(t)*2,0]:[0,0]}),
    draw(c,PF,P,t,x){ const B=OWN.BM, eye=(x.self.eyes&&x.self.eyes[0])||OWN.pt(x.self,P.tg,[0.6,0.4]), col=[255,110,200], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      if(t<220){ const k=B.up(t,0,200); B.charge(c,eye,P.S,col,k,t); for(let i=0;i<3;i++){ const q=((t/200)+i/3)%1; OWN.CH.ring(c,eye.x,eye.y,P.S*(1.6-1.3*q),P.S*0.06,col,0.8*q*k); } return; }
      const end=B.lp(eye,{x:fx,y:fy},L); c.save(); c.globalCompositeOperation="lighter"; B.tube(c,eye,end,P.S*0.42,col,al,0.08,t); c.restore();
      const dx=end.x-eye.x, dy=end.y-eye.y, an=Math.atan2(dy,dx); for(let i=0;i<6;i++){ const q=((t/260)+i/6)%1; if(q>L) continue; const p=B.lp(eye,end,q); c.save(); c.translate(p.x,p.y); c.rotate(an); c.strokeStyle=OWN.rgb([255,200,240],0.8*al); c.lineWidth=P.S*0.07; c.beginPath(); c.ellipse(0,0,P.S*0.18,P.S*(0.55+0.15*Math.sin(t/40+i)),0,0,7); c.stroke(); c.restore(); }
      atGlowA(c,eye.x,eye.y,P.S*1.1,[255,220,245],0.9*al); if(t<330) return; const k=B.up(t,330,800);
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1+0.3*Math.sin(t/40)),col,0.7*al); c.restore(); for(let i=0;i<10;i++){ const a2=i/10*Math.PI*2+t/200, v=P.R*(0.5+0.7*((t/300+i*0.37)%1)); OWN.star(c,fx+Math.cos(a2)*v,fy+Math.sin(a2)*v*0.8,P.S*0.22*al,OWN.rgb([255,210,240],0.95),t/40+i); }
      for(let i=0;i<4;i++){ const q=((t-330)/400+i/4)%1; PF(fx+(atH(i*3)-0.5)*P.R,fy-P.R*0.3-q*P.R*1.4,P.S*(0.3+0.5*q),0.35*al*(1-q),[150,120,140]); } OWN.SS.squint(c,P,al); } },
  /* Lern's lantern opens and pours a warm, soft ray of light with dust motes floating in it, and the foe squints in the glow */
  "Light Ray":{ col:[255,215,140], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, L0=x.self.center||P.o0, col=[255,215,140], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      const e=B.up(t,0,200); atGlowA(c,L0.x,L0.y,P.S*(1+1.2*e),[255,200,110],0.75*e*al); if(t<200) return; const end={x:fx+P.d*P.R*0.6,y:fy};
      c.save(); c.globalCompositeOperation="lighter"; B.cone(c,L0,B.lp(L0,end,L),P.S*0.5,P.R*1.5*L,col,al,0.25,0.6); for(let i=0;i<5;i++){ const off=(i-2)*P.R*0.32+Math.sin(t/160+i)*P.R*0.08; B.cone(c,L0,B.lp(L0,{x:end.x,y:end.y+off},L),P.S*0.06,P.R*0.12*L,[255,240,200],al*0.8,0.15,0.6); } c.restore();
      for(let i=0;i<16;i++){ const k=atH(i*3), p=B.lp(L0,end,k*L), v=(atH(i*7)-0.5)*P.R*1.4*k; OWN.star(c,p.x+Math.sin(t/200+i)*P.S*0.2,p.y+v+Math.cos(t/170+i)*P.S*0.2,P.S*0.1*al,"rgba(255,250,225,.95)",t/80+i); }
      if(t<330) return; atGlowA(c,fx,fy,P.R*1.3,[255,220,150],0.6*al); c.fillStyle=OWN.rg(c,fx,P.gnd-2,0,P.R*1.6,[[0,`rgba(255,230,160,${0.5*al})`],[1,"rgba(255,220,140,0)"]]); c.beginPath(); c.ellipse(fx,P.gnd-2,P.R*1.6,P.R*0.35,0,0,7); c.fill(); OWN.SS.squint(c,P,al); } },
  /* Lern floats up and spins like a lighthouse, and its beam sweeps round twice, flaring on the foe each time it passes */
  "Beacon":{ col:[255,235,170], atk:(t)=>({f:0,pose:t<820?"cast":null,lift:-26*Math.sin(Math.PI*Math.min(1,t/900))}),
    draw(c,PF,P,t,x){ const B=OWN.BM, L0=x.self.center||P.o0, col=[255,235,170], al=B.A(t), fx=P.tg.x, fy=P.tg.y, base=B.hv(L0,P.tg), D=Math.hypot(fx-L0.x,fy-L0.y)*1.35;
      const e=B.up(t,0,200); atGlowA(c,L0.x,L0.y,P.S*(1.2+1.4*e),[255,210,120],0.8*e*al); for(let i=0;i<4;i++){ const a=t/80+i*Math.PI/2; c.fillStyle=OWN.rgb([255,250,220],0.8*e*al); c.beginPath(); c.arc(L0.x+Math.cos(a)*P.S*0.7,L0.y+Math.sin(a)*P.S*0.25,P.S*0.08,0,7); c.fill(); }
      if(t<200) return; const sw=B.up(t,200,800), ang=base-Math.PI*0.08+(sw*Math.PI*4), w=0.22; c.save(); c.globalCompositeOperation="lighter"; for(const s of [0,Math.PI]){ const a=ang+s, end={x:L0.x+Math.cos(a)*D,y:L0.y+Math.sin(a)*D*0.6}; B.cone(c,L0,end,P.S*0.3,D*Math.tan(w)*0.6,col,al*(s?0.5:1),0.1,0.7); } c.restore();
      const diff=Math.abs(Math.atan2(Math.sin(ang-base),Math.cos(ang-base))); if(diff<0.5){ const q=1-diff/0.5; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1.2+0.5*q),[255,240,190],0.9*q*al); c.restore(); OWN.star(c,fx,fy,P.R*0.9*q,`rgba(255,255,240,${q*al})`,t/60); OWN.SS.squint(c,P,q*al); }
      if(t>330){ for(let i=0;i<6;i++){ const q=((t-330)/500+i/6)%1; OWN.star(c,fx+(atH(i*5)-0.5)*P.R*1.6,fy-P.R*0.2-q*P.R*1.2,P.S*0.14*(1-q)*al,"rgba(255,245,200,.95)",t/50+i); } } } },
  /* three thin gold rays leave the lantern on bending paths and meet on the foe in a big starburst with a lens flare */
  "Bright Ray":{ col:[255,225,110], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, L0=x.self.center||P.o0, col=[255,225,110], al=B.A(t), fx=P.tg.x, fy=P.tg.y;
      B.charge(c,L0,P.S,col,B.up(t,0,200)*al,t); if(t<200) return;
      for(let j=0;j<3;j++){ const k=eo(B.up(t,200+j*25,330+j*25)), ctl={x:(L0.x+fx)/2,y:(L0.y+fy)/2+(j-1)*P.R*1.6}; c.save(); c.globalCompositeOperation="lighter"; c.lineCap="round"; for(const [w,a2] of [[P.S*0.35,0.25],[P.S*0.14,0.9],[P.S*0.05,1]]){ c.strokeStyle=a2>0.95?`rgba(255,255,240,${al})`:OWN.rgb(col,a2*al); c.lineWidth=w; c.beginPath(); c.moveTo(L0.x,L0.y);
          for(let m=1;m<=20;m++){ const q=m/20*k, u=1-q; c.lineTo(u*u*L0.x+2*u*q*ctl.x+q*q*fx,u*u*L0.y+2*u*q*ctl.y+q*q*fy); } c.stroke(); } c.restore(); }
      if(t<330) return; const k=B.up(t,330,820); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1.1+0.8*eo(k)),[255,230,140],0.95*al); for(let i=0;i<8;i++){ const a2=i/8*Math.PI*2+t/400; OWN.FL.ray(c,fx,fy,fx+Math.cos(a2)*P.R*(1.4+0.8*k),fy+Math.sin(a2)*P.R*(1.4+0.8*k),P.S*0.18,P.S*0.02,[255,240,170],al); }
      const lf=fx-(fx-L0.x)*0.35, lfy=fy-(fy-L0.y)*0.35; [[0.25,[255,200,120]],[0.55,[200,230,255]],[0.8,[255,170,220]]].forEach(([f,cc],i)=>{ c.fillStyle=OWN.rgb(cc,0.3*al); c.beginPath(); c.arc(fx+(L0.x-fx)*f,fy+(L0.y-fy)*f,P.S*(0.35+0.2*i),0,7); c.fill(); }); c.restore();
      OWN.star(c,fx,fy,P.R*(0.9+0.3*Math.sin(t/50)),`rgba(255,255,245,${al})`,t/120); OWN.SS.squint(c,P,al); } },
  /* Glop squashes down like a pump and blasts a thick jet of water from its top in an arc, foaming and spraying as it goes; it splashes over the foe and pools at its feet */
  "Water Jet":{ col:[110,190,255], atk:(t)=>{ const q=(t%140)/140; return t<820?{f:0,pose:"push",sx:1+0.08*Math.sin(Math.PI*q),sy:1-0.1*Math.sin(Math.PI*q)}:{f:0}; },
    draw(c,PF,P,t,x){ const B=OWN.BM, src=x.self.top||P.o0, col=[110,190,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, hd=P.head;
      if(t<200){ const k=B.up(t,0,200); OWN.glob(c,src.x,src.y-P.S*0.3*k,P.S*0.45*k,t,col); for(let i=0;i<6;i++) OWN.drop(c,src.x+(i-2.5)*P.S*0.22,src.y-P.S*0.8*k*Math.sin(Math.PI*((t/150+i/6)%1)),P.S*0.14,-Math.PI/2,col); return; }
      const ex={x:fx,y:fy-P.R*0.3}, ctl={x:(src.x+fx)/2,y:Math.min(src.y,fy)-P.R*1.2}, pts=[]; for(let m=0;m<=26;m++){ const q=m/26*L, u=1-q; pts.push({x:u*u*src.x+2*u*q*ctl.x+q*q*ex.x,y:u*u*src.y+2*u*q*ctl.y+q*q*ex.y}); }
      B.water(c,pts,P.S*0.85,al,t,col); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,src.x,src.y,P.S*0.9,[200,235,255],0.5*al); c.restore();
      for(let i=0;i<16;i++){ const q=atH(i*3), p=pts[Math.min(pts.length-1,Math.round(q*26))], d=((t/3+i*19)%(P.S*2)); OWN.drop(c,p.x+(atH(i*7)-0.5)*P.S*0.9,p.y+P.S*0.45+d,P.S*0.13*(1-d/(P.S*2)),Math.PI/2,col); }
      for(let i=0;i<8;i++){ const q=((t/200)+i/8)%1, p=pts[Math.min(pts.length-1,Math.round(atH(i*5)*26))], a2=-Math.PI/2+(atH(i*11)-0.5)*2.4; OWN.drop(c,p.x+Math.cos(a2)*P.S*1.2*q,p.y+Math.sin(a2)*P.S*1.2*q+q*q*P.S,P.S*0.11*(1-q),a2,col); }
      if(t<330) return; const k=B.up(t,330,880); 
      for(let i=0;i<14;i++){ const g=((t/260)+i*0.31)%1, a2=-Math.PI+i/13*Math.PI, v=P.R*(0.3+1.1*g); OWN.drop(c,ex.x+Math.cos(a2)*v,ex.y+Math.sin(a2)*v*0.75+g*g*P.R*0.8,P.S*0.17*(1-g*0.5)*al,a2,col); }
      for(let i=0;i<5;i++){ const an=i/5*7+t/200; PF(ex.x+Math.cos(an)*P.R*0.5,ex.y+Math.sin(an)*P.R*0.35,P.R*0.38,0.5*al,[235,248,255]); }
      c.fillStyle=OWN.rg(c,fx,P.gnd,0,P.R*1.6*eo(k),[[0,OWN.rgb([150,210,255],0.7*al)],[1,OWN.rgb([90,160,240],0)]]); c.beginPath(); c.ellipse(fx,P.gnd,P.R*1.6*eo(k),P.R*0.3*eo(k),0,0,7); c.fill(); for(let i=0;i<3;i++){ const q=((t-330)/400+i/3)%1; c.strokeStyle=OWN.rgb([220,240,255],0.7*al*(1-q)); c.lineWidth=1.5; c.beginPath(); c.ellipse(fx,P.gnd,P.R*(0.3+1.2*q),P.R*(0.06+0.22*q),0,0,7); c.stroke(); }
      for(let i=0;i<5;i++){ const q=((t-330)/350+i/5)%1; OWN.drop(c,fx+(i-2)*P.R*0.4,hd.y+P.R*(0.3+1.4*q),P.S*0.14,Math.PI/2,col); } OWN.SS.squint(c,P,al); } },
  /* a bubbling green acid beam pours from Glop's mouth, dripping as it goes; the foe fizzes with green spots and acid smoke */
  "Acid Beam":{ col:[150,240,70], atk:(t)=>({f:0,pose:t<200?"bitewide":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, m=x.self.mouth||P.o0, col=[150,240,70], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      if(t<200){ const k=B.up(t,0,200); OWN.glob(c,m.x+P.d*P.S*0.2*k,m.y,P.S*0.3*k,t,col); for(let i=0;i<4;i++) OWN.bubble(c,m.x+Math.sin(t/50+i)*P.S*0.5,m.y-P.S*0.3-((t/5+i*20)%(P.S*1.2)),P.S*0.1*k,col,false); return; }
      const end=B.lp(m,P.tg,L); B.tube(c,m,end,P.S*0.32,col,al,0.18,t,0.4);
      for(let i=0;i<10;i++){ const q=((t/350)+atH(i*3))%1; if(q>L) continue; const p=B.lp(m,P.tg,q); OWN.bubble(c,p.x+(atH(i)-0.5)*P.S*0.3,p.y+(atH(i*5)-0.5)*P.S*0.3,P.S*(0.07+0.07*atH(i*7)),[220,255,170],false); }
      for(let i=0;i<6;i++){ const q=atH(i*11)*L, p=B.lp(m,P.tg,q), d=((t/3+i*31)%(P.S*2.5)); OWN.drop(c,p.x,p.y+P.S*0.3+d,P.S*0.12*(1-d/(P.S*2.5)),Math.PI/2,col); }
      if(t<330) return; const k=B.up(t,330,700); for(let i=0;i<7;i++){ const px=fx+(atH(i*3)-0.5)*P.R*1.4, py=fy+(atH(i*5)-0.5)*P.R*1.3, r=P.S*(0.15+0.12*atH(i))*eo(k); c.fillStyle=OWN.rgb([120,220,60],0.75*al); c.beginPath(); c.arc(px,py,r,0,7); c.fill(); OWN.bubble(c,px,py-r*0.4-((t/6+i*9)%(P.S*0.6)),r*0.45,[200,255,150],false); }
      for(let i=0;i<5;i++){ const q=((t-330)/420+i/5)%1; PF(fx+(atH(i*7)-0.5)*P.R*1.2+Math.sin(t/90+i)*P.S*0.3,fy-P.R*0.4-q*P.R*1.6,P.S*(0.3+0.5*q),0.45*al*(1-q),[170,220,130]); } } },
  /* Wick's flame hair stretches into a long ray of candle flame, licking along its edges, and leaves a small flame on the foe's head */
  "Candle Ray":{ col:[255,190,90], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, top=x.self.top||P.o0, col=[255,190,90], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, outer=OWN.rgb([255,130,40],0.95), inner=OWN.rgb([255,240,170],0.98);
      const e=B.up(t,0,200), fs=P.S*(0.3+0.4*e)*al; OWN.flame(c,top.x,top.y-fs*0.85,fs,Math.PI/2,outer,inner,t); if(t<200) return; const src={x:top.x,y:top.y-fs*0.6}, end=B.lp(src,{x:fx,y:fy-P.R*0.2},L), an=B.hv(src,end);
      c.save(); c.globalCompositeOperation="lighter"; B.tube(c,src,end,P.S*0.3,col,al,0.1,t); c.restore(); for(let i=0;i<12;i++){ const q=((t/320)+i/12)%1; if(q>L) continue; const p=B.lp(src,end,q), sd=i%2?1:-1; OWN.flame(c,p.x-Math.sin(an)*sd*P.S*0.3,p.y+Math.cos(an)*sd*P.S*0.3,P.S*0.32*(1-q*0.4)*al,an+Math.PI+sd*0.9,outer,inner,t+i*30); }
      if(t<330) return; const k=B.up(t,330,600); atGlowA(c,fx,fy,P.R*1.2,[255,190,90],0.6*al); OWN.flame(c,P.head.x,P.head.y-P.S*0.4*k,P.S*0.5*k*al,Math.PI/2,outer,inner,t+77); for(let i=0;i<8;i++){ const q=((t-330)/400+atH(i))%1; c.fillStyle=OWN.rgb([255,220,140],0.9*al*(1-q)); c.beginPath(); c.arc(fx+(atH(i*3)-0.5)*P.R*1.4,fy-q*P.R*1.6,P.S*0.06,0,7); c.fill(); } OWN.SS.squint(c,P,al*k); } },
  /* Wick tips its whole candle body over toward the foe, its wick flame swells and turns blue, and it roars out of the tip as a blowtorch jet
     that hits the foe red hot; Wick shuffles closer so the flame lands on the foe, then the flame drops back to normal and Wick hops back upright (Gid, 19 Nov 2026) */
  "Blowtorch":{ col:[120,180,255], tilt:(t)=>t<200?1.1*eo(t/200):t<700?1.1+0.03*Math.sin(t/9):1.1*(1-eo(Math.min(1,(t-700)/120))),
    atk(t,pos){ const d=(pos&&pos.dir)||1, q=Math.min(1,Math.max(0,(t-700)/180)); const fw=t<200?0.4*eo(t/200):t<700?0.4:0.4*(1-eo(Math.min(1,(t-700)/180))); return {f:fw,pose:t<700?"determined":null,rot:d*OWN_BEAM["Blowtorch"].tilt(t),lift:t>700?-26*Math.sin(Math.PI*q):0,sy:t>860&&t<940?1-0.1*Math.sin(Math.PI*(t-860)/80):1,sx:t>860&&t<940?1+0.08*Math.sin(Math.PI*(t-860)/80):1}; },
    draw(c,PF,P,t,x){ const B=OWN.BM, top=x.self.top||P.o0, base={x:x.self.x,y:x.self.foot}, al=B.A(t), fx=P.tg.x, fy=P.tg.y, ax=Math.atan2(top.y-base.y,top.x-base.x), bl=OWN.rgb([80,130,255],0.95), bi=OWN.rgb([225,245,255],0.98), or=OWN.rgb([255,130,40],0.95), oi=OWN.rgb([255,240,170],0.98);
      const grow=B.up(t,40,220)*(1-B.up(t,690,780)), blue=B.up(t,60,200)*(1-B.up(t,700,760)), tip={x:top.x+Math.cos(ax)*P.S*0.15,y:top.y+Math.sin(ax)*P.S*0.15};
      const fsz=P.S*(0.3+0.55*grow); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,tip.x,tip.y,P.S*(0.5+1.1*grow),blue>0.5?[110,160,255]:[255,170,80],0.8*al); c.restore();
      if(t<200||t>720) return; const L=B.L(t), hit={x:fx-P.d*P.R*0.15,y:fy}, n={x:tip.x+Math.cos(ax)*fsz*0.4,y:tip.y+Math.sin(ax)*fsz*0.4}, D=Math.hypot(hit.x-n.x,hit.y-n.y)*L, an=B.hv(n,hit), ca=Math.cos(an), sa=Math.sin(an), on=1-B.up(t,640,720);
      const shape=(wf,len,jit)=>{ c.beginPath(); const N=30; for(let i=0;i<=N;i++){ const u=i/N, w=wf(u)*(1+jit*Math.sin(u*28-t/12)); c.lineTo(n.x+ca*u*len-sa*w,n.y+sa*u*len+ca*w); } for(let i=N;i>=0;i--){ const u=i/N, w=wf(u)*(1+jit*Math.sin(u*31-t/11+2)); c.lineTo(n.x+ca*u*len+sa*w,n.y+sa*u*len-ca*w); } c.closePath(); };
      /* a torch-lighter flame (Gid's reference, 19 Nov 2026): a slim blue flame with a rounded base and a long sharp point, a lighter blue middle and a near-white core */
      const prof=(u)=>u<0.12?Math.sqrt(Math.max(0,1-Math.pow((0.12-u)/0.12,2))):Math.pow(Math.max(0,1-(u-0.12)/0.88),0.85);
      const layer=(W,len,fill,jit)=>{ c.beginPath(); const N=36; for(let i=0;i<=N;i++){ const u=i/N, w=W*prof(u)*(1+jit*Math.sin(u*24-t/10)); c.lineTo(n.x+ca*u*len-sa*w,n.y+sa*u*len+ca*w); } for(let i=N;i>=0;i--){ const u=i/N, w=W*prof(u)*(1+jit*Math.sin(u*27-t/9+2)); c.lineTo(n.x+ca*u*len+sa*w,n.y+sa*u*len-ca*w); } c.closePath(); c.fillStyle=fill; c.fill(); };
      const Dj=D*1.05; c.save(); c.globalAlpha=al*on; c.shadowColor="rgba(60,150,255,.8)"; c.shadowBlur=P.S*0.5;
      let g=c.createLinearGradient(n.x,n.y,n.x+ca*Dj,n.y+sa*Dj); g.addColorStop(0,"#2f7dff"); g.addColorStop(0.6,"#3fa2ff"); g.addColorStop(1,"#86d4ff"); layer(P.S*0.36,Dj,g,0.05); c.shadowBlur=0;
      g=c.createLinearGradient(n.x,n.y,n.x+ca*Dj,n.y+sa*Dj); g.addColorStop(0,"#8fdcff"); g.addColorStop(1,"#c9f0ff"); layer(P.S*0.24,Dj*0.9,g,0.04);
      layer(P.S*0.13,Dj*0.62,"rgba(242,252,255,.98)",0.02); c.restore();
      if(t<330) return; const k=B.up(t,330,640); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,hit.x,hit.y,P.R*(0.6+0.4*k),[255,90,40],0.9*al); atGlowA(c,hit.x,hit.y,P.R*0.32,[255,240,200],0.95*al*on); atGlowA(c,fx,fy,P.R*1.2,[255,80,40],0.4*al); c.restore();
      for(let i=0;i<22;i++){ const q=((t/240)+atH(i*3))%1, a2=an+Math.PI+(atH(i)-0.5)*2.4, v=P.R*1.5*q, px=hit.x+Math.cos(a2)*v, py=hit.y+Math.sin(a2)*v+q*q*P.R*1.4; c.strokeStyle=OWN.rgb(OWN.mix([255,250,210],[255,110,30],q),al*(1-q)*on); c.lineWidth=P.S*0.06; c.lineCap="round"; c.beginPath(); c.moveTo(px,py); c.lineTo(px-Math.cos(a2)*P.S*0.25,py-Math.sin(a2)*P.S*0.25-q*P.S*0.2); c.stroke(); }
      OWN.SS.squint(c,P,al); } },
  /* Lumo's tail focuses into a needle-thin beam, little lights race along it and it pins the foe with a tight, pulsing star */
  "Thin Beam":{ col:[230,255,120], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, tail=OWN.pt(x.self,P.tg,[0.5,0.85]), col=[230,255,120], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      B.charge(c,tail,P.S*0.8,col,B.up(t,0,200)*al,t); if(t<200) return; const end=B.lp(tail,P.tg,L); c.save(); c.globalCompositeOperation="lighter"; B.tube(c,tail,end,P.S*0.08,col,al,0,t); c.restore();
      for(let i=0;i<5;i++){ const q=((t/180)+i/5)%1; if(q>L) continue; const p=B.lp(tail,P.tg,q); OWN.WS.firefly(c,p.x,p.y,P.S*0.12,t+i*30,al); }
      if(t<330) return; const pu=0.5+0.5*Math.sin(t/35); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(0.5+0.3*pu),col,0.9*al); c.restore(); OWN.star(c,fx,fy,P.S*(0.6+0.5*pu),`rgba(255,255,230,${al})`,t/80); OWN.CH.ring(c,fx,fy,P.R*(0.3+0.9*((t-330)%180)/180),P.S*0.06,col,0.8*al*(1-((t-330)%180)/180)); } },
  /* Lumo's tail becomes a stage spotlight; a crisp cone pins the foe in a bright circle on the ground */
  "Lamp Beam":{ col:[255,250,200], atk:(t)=>({f:0,pose:t<820?"cast":null,lift:-16*Math.sin(Math.PI*Math.min(1,t/900))}),
    draw(c,PF,P,t,x){ const B=OWN.BM, tail=OWN.pt(x.self,P.tg,[0.5,0.85]), col=[255,250,200], al=B.A(t), L=B.L(t), fx=P.tg.x;
      atGlowA(c,tail.x,tail.y,P.S*(0.8+0.8*B.up(t,0,200)),[240,255,150],0.8*al); if(t<200) return; const sw=Math.sin((t-200)/160)*P.R*0.3*(1-B.up(t,330,450)), gx=fx+sw, gy=P.gnd, w=P.R*1.3*L;
      const vx=gx+P.d*P.R*0.3, vt=P.head.y-P.R*0.35, vb=gy, mid={x:vx,y:(vt+vb)/2}; c.save(); c.globalCompositeOperation="lighter"; const g=c.createLinearGradient(tail.x,tail.y,vx,mid.y); g.addColorStop(0,OWN.rgb(col,0.75*al)); g.addColorStop(1,OWN.rgb(col,0.35*al)); c.fillStyle=g;
      const tx=tail.x+(vx-tail.x)*L, tt=tail.y+(vt-tail.y)*L, tb=tail.y+(vb-tail.y)*L; c.beginPath(); c.moveTo(tail.x,tail.y-P.S*0.2); c.lineTo(tx,tt); c.lineTo(tx,tb); c.lineTo(tail.x,tail.y+P.S*0.2); c.closePath(); c.fill();
      c.strokeStyle=OWN.rgb([255,255,240],0.6*al); c.lineWidth=1.5; c.beginPath(); c.moveTo(tail.x,tail.y-P.S*0.2); c.lineTo(tx,tt); c.moveTo(tail.x,tail.y+P.S*0.2); c.lineTo(tx,tb); c.stroke();
      c.fillStyle=OWN.rg(c,gx,gy,0,w,[[0,OWN.rgb([255,255,235],0.8*al)],[0.8,OWN.rgb(col,0.5*al)],[1,OWN.rgb(col,0)]]); c.beginPath(); c.ellipse(gx,gy,w,w*0.22,0,0,7); c.fill(); if(t>=330) atGlowA(c,fx,P.tg.y,P.R*1.2,[255,255,230],0.5*al); c.restore();
      for(let i=0;i<10;i++){ const k=atH(i*3), p=B.lp(tail,{x:gx,y:gy},k); OWN.star(c,p.x+(atH(i*7)-0.5)*w*k+Math.sin(t/150+i)*P.S*0.15,p.y-((t/12+i*17)%(P.S*0.8)),P.S*0.08*al,"rgba(255,255,230,.9)",t/60+i); }
      if(t>=330){ OWN.SS.squint(c,P,al); for(let i=0;i<2;i++) OWN.drop(c,fx+P.R*(0.6+0.2*i),P.head.y+P.R*(0.2+0.5*(((t-330)/400+i/2)%1)),P.S*0.16,Math.PI/2,[150,210,255]); } } },
  /* a dozen fireflies fly out of Lumo's tail and settle in a line to the foe, then light up one after another and flash together on it */
  "Light Line":{ col:[220,255,120], atk:(t)=>({f:0,pose:t<380?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, tail=OWN.pt(x.self,P.tg,[0.5,0.85]), col=[220,255,120], al=B.A(t), fx=P.tg.x, fy=P.tg.y, N=12;
      atGlowA(c,tail.x,tail.y,P.S*1.1,[230,255,140],0.7*al);
      for(let i=0;i<N;i++){ const k=(i+1)/(N+1), home={x:tail.x+(fx-tail.x)*k,y:tail.y+(fy-tail.y)*k+Math.sin(k*Math.PI*2+t/120)*P.S*0.35}, f=eo(B.up(t,i*12,200+i*12)), p={x:tail.x+(home.x-tail.x)*f,y:tail.y+(home.y-tail.y)*f-Math.sin(Math.PI*f)*P.R*0.5};
        const lit=t>=200?Math.max(0,1-Math.abs((t-200)/200*(N+3)-i)/2):0, all=t>=330?1:0, b=Math.max(lit,all)*al; if(b>0){ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,p.x,p.y,P.S*(0.35+0.4*b),col,0.8*b); c.restore(); } OWN.WS.firefly(c,p.x,p.y,P.S*0.13,t+i*23,al); }
      if(t>=330){ c.save(); c.globalCompositeOperation="lighter"; const pts=[tail]; for(let i=0;i<N;i++){ const k=(i+1)/(N+1); pts.push({x:tail.x+(fx-tail.x)*k,y:tail.y+(fy-tail.y)*k+Math.sin(k*Math.PI*2+t/120)*P.S*0.35}); } pts.push(P.tg); c.strokeStyle=OWN.rgb(col,0.6*al); c.lineWidth=P.S*0.12; c.lineCap="round"; c.beginPath(); pts.forEach((p,i)=>c[i?"lineTo":"moveTo"](p.x,p.y)); c.stroke(); c.strokeStyle=`rgba(255,255,230,${al})`; c.lineWidth=P.S*0.04; c.stroke();
        const q=B.up(t,330,700); atGlowA(c,fx,fy,P.R*(1+1.2*eo(q)),col,0.9*(1-q)*al+0.2*al); c.restore(); for(let i=0;i<10;i++){ const a2=i/10*Math.PI*2, v=P.R*(0.4+1.4*eo(q)); OWN.WS.firefly(c,fx+Math.cos(a2)*v,fy+Math.sin(a2)*v*0.8,P.S*0.1,t+i*20,1-q); } OWN.SS.squint(c,P,al); } } },
  /* Clank shakes as steam builds inside it, then blasts a huge billowing column of steam carrying gears and rivets that engulfs the foe */
  "Steam Blast":{ col:[235,240,250], atk:(t)=>({f:0,pose:t<200?"determined":t<820?"push":null,off:t<200?[Math.sin(t/8)*2,0]:[-2,0]}),
    draw(c,PF,P,t,x){ const B=OWN.BM, src=x.self.mouth||x.self.center||P.o0, al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, wh=[240,244,252];
      if(t<220){ const k=B.up(t,0,200); for(let i=0;i<4;i++){ const q=((t/180)+i/4)%1, sd=i%2?1:-1; PF(src.x+sd*P.S*(0.6+q*1.2),src.y-P.S*0.3-q*P.S*1.4,P.S*(0.3+0.5*q),0.5*k*(1-q),wh); } atGlowA(c,src.x,src.y,P.S*1.2*k,[255,255,255],0.5*k); if(t<200) return; }
      const end=B.lp(src,{x:fx+P.d*P.R*0.5,y:fy},L); for(let i=0;i<22;i++){ const q=((t/420)+i/22)%1; if(q>L) continue; const p=B.lp(src,end,q), r=P.S*(0.3+0.65*q)+P.R*0.12*q; PF(p.x+Math.sin(t/60+i)*P.S*0.2,p.y+(atH(i*3)-0.5)*P.R*0.8*q,r,0.6*al,i%3?wh:[210,220,235]); }
      for(let i=0;i<6;i++){ const q=((t/360)+i/6)%1; if(q>L) continue; const p=B.lp(src,end,q), y2=p.y+(atH(i*5)-0.5)*P.R*0.6*q; c.save(); c.translate(p.x,y2); c.rotate(t/80+i); c.fillStyle=OWN.rgb([180,185,200],0.95*al); if(i%2){ c.beginPath(); for(let m=0;m<16;m++){ const a2=m/16*Math.PI*2, rr=m%2?P.S*0.16:P.S*0.22; c.lineTo(Math.cos(a2)*rr,Math.sin(a2)*rr); } c.closePath(); c.fill(); c.fillStyle="rgba(90,95,110,.9)"; c.beginPath(); c.arc(0,0,P.S*0.07,0,7); c.fill(); } else { c.beginPath(); c.arc(0,0,P.S*0.1,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.arc(-P.S*0.03,-P.S*0.03,P.S*0.04,0,7); c.fill(); } c.restore(); }
      if(t<330) return; const k=B.up(t,330,880); OWN.SS.cloud(c,PF,fx,fy,P.R*1.4,k,[wh,[220,228,240]],10,0.75*al,0.2); for(let i=0;i<5;i++){ const q=((t-330)/350+i/5)%1; OWN.drop(c,fx+(i-2)*P.R*0.4,P.head.y+P.R*(0.3+1.3*q),P.S*0.12,Math.PI/2,[190,215,240]); } } },
  /* the kite tilts into the wind and a roaring jet stream spirals out from it, carrying its ribbon colours and leaves, and shoves the foe */
  "Jet Stream":{ col:[170,225,255], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null,rot:t<820?-0.18*eo(Math.min(1,t/200)):0}),
    draw(c,PF,P,t,x){ const B=OWN.BM, src=x.self.center||P.o0, col=[170,225,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      if(t<200){ const k=B.up(t,0,200); for(let i=0;i<5;i++){ const q=((t/160)+i/5)%1, an=i*1.3+t/90; c.strokeStyle=OWN.rgb([230,245,255],0.8*k*(1-q)); c.lineWidth=2; c.beginPath(); c.arc(src.x,src.y,P.S*(1.6-1.2*q),an,an+1.4); c.stroke(); } return; }
      const end=B.lp(src,{x:fx+P.d*P.R*1.2,y:fy},L), dx=end.x-src.x, dy=end.y-src.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln; c.save(); c.globalCompositeOperation="lighter"; B.cone(c,src,end,P.S*0.4,P.R*1.0,col,al,0.25,0.35); c.restore();
      const rib=[[255,120,140],[255,210,90],[120,200,255]]; for(let s=0;s<3;s++){ c.strokeStyle=OWN.rgb(s===1?[255,255,255]:col,(s===1?0.85:0.75)*al); c.lineWidth=P.S*(s===1?0.1:0.16); c.lineCap="round"; c.beginPath(); for(let m=0;m<=40;m++){ const q=m/40, w=(P.S*0.4+P.R*0.75*q)*Math.sin(q*Math.PI*6-t/45+s*2.1); c.lineTo(src.x+dx*q+nx*w,src.y+dy*q+ny*w); } c.stroke(); }
      for(let i=0;i<14;i++){ const q=((t/260)+i/14)%1, p=B.lp(src,end,q), off=(atH(i*3)-0.5)*P.R*1.6*q; c.strokeStyle=OWN.rgb([255,255,255],0.7*al*(1-q*0.5)); c.lineWidth=1.8; c.beginPath(); c.moveTo(p.x+nx*off,p.y+ny*off); c.lineTo(p.x+nx*off-dx/Ln*P.S*0.8,p.y+ny*off-dy/Ln*P.S*0.8); c.stroke(); }
      for(let i=0;i<5;i++){ const q=((t/380)+i/5)%1, p=B.lp(src,end,q), w=(P.R*0.6*q)*Math.sin(q*9+i); if(i%2) OWN.prop(c,x,"leaf",p.x+nx*w,p.y+ny*w,t/60+i,0.8*al); else { c.save(); c.translate(p.x+nx*w,p.y+ny*w); c.rotate(t/50+i); c.fillStyle=OWN.rgb(rib[i%3],0.9*al); c.fillRect(-P.S*0.3,-P.S*0.05,P.S*0.6,P.S*0.1); c.restore(); } }
      if(t<330) return; for(let i=0;i<3;i++){ const q=((t-330)/300+i/3)%1; c.strokeStyle=OWN.rgb([240,250,255],0.7*al*(1-q)); c.lineWidth=2.5; c.beginPath(); c.arc(fx-P.d*P.R*0.2,fy,P.R*(0.8+0.6*q),P.d>0?-1.1:Math.PI-1.1,P.d>0?1.1:Math.PI+1.1); c.stroke(); } OWN.SS.squint(c,P,al); } },
  /* Helm's porthole fogs, then a wavy stream of bubbles big and small pours out and pops on the foe, a few clinging to it */
  "Bubble Jet":{ col:[150,220,255], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, src=x.self.center||P.o0, col=[150,220,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      atGlowA(c,src.x,src.y,P.S*0.9,[220,240,255],0.5*B.up(t,0,200)*al); if(t<200){ for(let i=0;i<3;i++) OWN.bubble(c,src.x+Math.sin(t/60+i*2)*P.S*0.3,src.y-((t/4+i*15)%(P.S*0.8)),P.S*0.1,col,true); return; }
      for(let i=0;i<26;i++){ const q=((t/450)+i/26)%1; if(q>L) continue; const p=B.lp(src,P.tg,q), w=Math.sin(q*Math.PI*3+t/80+i)*P.S*0.45*(0.3+q), r=P.S*(0.08+0.18*atH(i*7))*(0.7+0.6*q); OWN.bubble(c,p.x,p.y+w,r,col,i%3===0); }
      if(t<330) return; for(let i=0;i<6;i++){ const q=((t-330)/260+i/6)%1; OWN.pop(c,fx+(atH(i*3)-0.5)*P.R*1.2,fy+(atH(i*5)-0.5)*P.R*1.1,P.S*0.3,[220,245,255],q,6); }
      const k=B.up(t,330,600); for(let i=0;i<6;i++) OWN.bubble(c,fx+(atH(i*11)-0.5)*P.R*1.5,fy+(atH(i*13)-0.5)*P.R*1.3-Math.sin(t/120+i)*P.S*0.1,P.S*(0.1+0.1*atH(i))*eo(k)*al,col,true); } },
  /* Helm's valve spins and fires a straight, high-pressure water jet with pressure rings racing down it; the foe is squeezed and spray fans back */
  "Pressure Jet":{ col:[120,200,255], atk:(t)=>({f:0,pose:t<200?"determined":t<820?"push":null,off:t>200&&t<800?[-OWN_PD(t)*3,0]:[0,0]}),
    draw(c,PF,P,t,x){ const B=OWN.BM, src=OWN.pt(x.self,P.tg,[0.88,0.35]), col=[120,200,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      if(t<200){ const k=B.up(t,0,200); c.save(); c.translate(src.x,src.y); c.rotate(t/30); c.strokeStyle=OWN.rgb([200,160,80],k); c.lineWidth=P.S*0.08; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(i*Math.PI/2)*P.S*0.35,Math.sin(i*Math.PI/2)*P.S*0.35); c.stroke(); } c.beginPath(); c.arc(0,0,P.S*0.35,0,7); c.stroke(); c.restore(); return; }
      const end=B.lp(src,{x:fx-P.d*P.R*0.3,y:fy},L), an=B.hv(src,end); B.tube(c,src,end,P.S*0.2,col,al,0.03,t);
      for(let i=0;i<6;i++){ const q=((t/200)+i/6)%1; if(q>L) continue; const p=B.lp(src,end,q); c.save(); c.translate(p.x,p.y); c.rotate(an); c.strokeStyle=OWN.rgb([230,245,255],0.85*al*(1-q*0.5)); c.lineWidth=P.S*0.06; c.beginPath(); c.ellipse(0,0,P.S*0.12,P.S*(0.35+0.25*q),0,0,7); c.stroke(); c.restore(); }
      if(t<330) return; for(let i=0;i<14;i++){ const q=((t/220)+atH(i*3))%1, a2=an+Math.PI+(atH(i)-0.5)*2.2, v=P.R*1.3*q; OWN.drop(c,end.x+Math.cos(a2)*v,end.y+Math.sin(a2)*v+q*q*P.R*0.5,P.S*0.1*(1-q)*al+0.5,a2,col); }
      for(let i=0;i<3;i++){ const q=((t-330)/220+i/3)%1; c.strokeStyle=OWN.rgb([200,235,255],0.8*al*q); c.lineWidth=2; c.beginPath(); c.ellipse(fx,fy,P.R*(1.5-0.6*q),P.R*(1.3-0.5*q),0,0,7); c.stroke(); } OWN.SS.squint(c,P,al); } },
  /* Bloop's bell pumps and fires a thick water cannon, with ribbons of water spiralling round it and pulses bulging down it; it lands in a huge splash */
  "Water Cannon":{ col:[110,200,255], atk:(t)=>{ const q=((t-150)%150)/150; return t>150&&t<780?{f:0,pose:"push",sx:1+0.1*Math.sin(Math.PI*q),sy:1-0.12*Math.sin(Math.PI*q),off:[-OWN_PD(t)*3,0]}:{f:0,pose:t<150?"cast":null}; },
    draw(c,PF,P,t,x){ const B=OWN.BM, bell=OWN.pt(x.self,P.tg,[0.65,0.32]), col=[110,200,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      if(t<200){ const k=B.up(t,0,200); OWN.glob(c,bell.x+P.d*P.S*0.4*k,bell.y,P.S*0.45*k,t,col); for(let i=0;i<2;i++){ const q=((t/160)+i/2)%1; OWN.CH.ring(c,bell.x,bell.y,P.S*(1.4-1.0*q),P.S*0.08,col,0.7*q*k); } return; }
      const end=B.lp(bell,{x:fx,y:fy},L), dx=end.x-bell.x, dy=end.y-bell.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln, W=P.S*1.1, pts=[]; for(let m=0;m<=16;m++) pts.push(B.lp(bell,end,m/16));
      const helix=(front)=>{ for(let s=0;s<2;s++){ c.lineCap="round"; for(let m=1;m<=48;m++){ const q0=(m-1)/48, q1=m/48, ph0=q0*Ln/(P.S*0.9)-t/40+s*Math.PI, ph1=q1*Ln/(P.S*0.9)-t/40+s*Math.PI, z=Math.cos(ph1); if((z>0)!==front) continue;
          const r0=W*0.62*(0.7+0.3*q0), r1=W*0.62*(0.7+0.3*q1); c.strokeStyle=front?`rgba(235,250,255,${0.9*al})`:OWN.rgb([70,140,220],0.7*al); c.lineWidth=P.S*(front?0.2:0.14); c.beginPath(); c.moveTo(bell.x+dx*q0+nx*Math.sin(ph0)*r0,bell.y+dy*q0+ny*Math.sin(ph0)*r0); c.lineTo(bell.x+dx*q1+nx*Math.sin(ph1)*r1,bell.y+dy*q1+ny*Math.sin(ph1)*r1); c.stroke(); } } };
      helix(false); B.water(c,pts,W,al,t,col);
      for(let j=0;j<4;j++){ const q=((t-200)/260+j/4)%1; if(q>L) continue; const p=B.lp(bell,end,q); OWN.glob(c,p.x,p.y,W*0.62,t+j*40,[150,215,255],B.hv(bell,P.tg),0.4,j,0.75*al); } helix(true);
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,bell.x+P.d*P.S*0.3,bell.y,P.S*1.2,[200,235,255],0.6*al); c.restore(); if(t<330) return; const k=B.up(t,330,880);
      for(let i=0;i<16;i++){ const a2=-Math.PI*1.05+i/15*Math.PI*1.1+P.d*0.3, v=P.R*(0.4+1.3*((t/280+i*0.29)%1)), g=((t/280+i*0.29)%1); OWN.drop(c,fx+Math.cos(a2)*v,fy+Math.sin(a2)*v*0.85+g*g*P.R*0.8,P.S*0.2*(1-g*0.5)*al,a2,col); }
      for(let i=0;i<6;i++){ const an=i/6*7+t/200; PF(fx+Math.cos(an)*P.R*0.7,fy+Math.sin(an)*P.R*0.5,P.R*0.5,0.55*al,[235,248,255]); }
      for(let j=0;j<3;j++){ const q=((t-330)/300+j/3)%1; OWN.CH.ring(c,fx,fy,P.R*(0.5+1.2*q),P.S*0.12,j%2?[255,150,220]:col,0.8*(1-q)*al); }
      c.fillStyle=OWN.rg(c,fx,P.gnd,0,P.R*1.7*eo(k),[[0,OWN.rgb([150,210,255],0.7*al)],[1,OWN.rgb([90,160,240],0)]]); c.beginPath(); c.ellipse(fx,P.gnd,P.R*1.7*eo(k),P.R*0.3*eo(k),0,0,7); c.fill();
      for(let i=0;i<5;i++){ const q=((t-330)/350+i/5)%1; OWN.drop(c,fx+(i-2)*P.R*0.4,P.head.y+P.R*(0.4+1.3*q),P.S*0.14,Math.PI/2,col); } OWN.SS.squint(c,P,al); } },
  /* a fat stream of pink-white soap foam and bubbles flows from Suds, and the foe ends up wearing a pile of suds with bubbles floating off */
  "Soap Stream":{ col:[255,200,235], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, src=x.self.top||P.o0, col=[255,205,235], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, wh=[255,250,255];
      if(t<200){ const k=B.up(t,0,200); for(let i=0;i<5;i++) PF(src.x+(i-2)*P.S*0.25,src.y-P.S*0.15*k,P.S*0.35*k,0.8,i%2?wh:col); return; }
      const end=B.lp(src,{x:fx,y:fy-P.R*0.2},L); for(let i=0;i<20;i++){ const q=((t/500)+i/20)%1; if(q>L) continue; const p=B.lp(src,end,q), w=Math.sin(q*Math.PI*2+t/100)*P.S*0.4; PF(p.x,p.y+w,P.S*(0.35+0.25*atH(i)),0.8*al,i%3?wh:col); }
      for(let i=0;i<12;i++){ const q=((t/380)+i/12)%1; if(q>L) continue; const p=B.lp(src,end,q); OWN.bubble(c,p.x+(atH(i*3)-0.5)*P.S*0.8,p.y+(atH(i*5)-0.5)*P.S*0.9,P.S*(0.08+0.1*atH(i)),[255,220,245],true); }
      if(t<330) return; const k=eo(B.up(t,330,520)); for(let i=0;i<7;i++){ const a2=Math.PI+i/6*Math.PI; PF(P.head.x+Math.cos(a2)*P.R*0.55*k,P.head.y+Math.sin(a2)*P.R*0.35*k+P.S*0.1,P.S*0.45*k,0.85*al,i%2?wh:col); }
      for(let i=0;i<6;i++){ const q=((t-330)/500+i/6)%1; OWN.bubble(c,fx+(atH(i*7)-0.5)*P.R*1.4+Math.sin(t/90+i)*P.S*0.2,P.head.y-q*P.R*1.4,P.S*(0.1+0.08*atH(i)),[255,220,245],true); } } },
  /* a thick column of water spouts from Suds' top like a fountain, arcs high over and pours down onto the foe's head with a big splash */
  "Spout Jet":{ col:[110,190,255], atk:(t)=>({f:0,pose:t<820?"cast":null,sy:t<200?1-0.08*Math.sin(Math.PI*t/200):1}),
    draw(c,PF,P,t,x){ const B=OWN.BM, src=x.self.top||P.o0, col=[110,190,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, hd=P.head;
      if(t<200){ const k=B.up(t,0,200); OWN.glob(c,src.x,src.y-P.S*0.3*k,P.S*0.45*k,t,col); for(let i=0;i<6;i++) OWN.drop(c,src.x+(i-2.5)*P.S*0.22,src.y-P.S*0.8*k*Math.sin(Math.PI*((t/150+i/6)%1)),P.S*0.14,-Math.PI/2,col); return; }
      const ex={x:fx,y:hd.y-P.S*0.1}, ctl={x:(src.x+fx)/2,y:Math.min(src.y,hd.y)-P.R*3.2}, pts=[]; for(let m=0;m<=26;m++){ const q=m/26*L, u=1-q; pts.push({x:u*u*src.x+2*u*q*ctl.x+q*q*ex.x,y:u*u*src.y+2*u*q*ctl.y+q*q*ex.y}); }
      B.water(c,pts,P.S*0.9,al,t,col); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,src.x,src.y,P.S*0.9,[200,235,255],0.5*al); c.restore();
      for(let i=0;i<16;i++){ const q=atH(i*3), p=pts[Math.min(pts.length-1,Math.round(q*26))], d=((t/3+i*19)%(P.S*2)); OWN.drop(c,p.x+(atH(i*7)-0.5)*P.S*0.9,p.y+P.S*0.45+d,P.S*0.13*(1-d/(P.S*2)),Math.PI/2,col); }
      for(let i=0;i<8;i++){ const q=((t/200)+i/8)%1, p=pts[Math.min(pts.length-1,Math.round(atH(i*5)*26))], a2=-Math.PI/2+(atH(i*11)-0.5)*2.4; OWN.drop(c,p.x+Math.cos(a2)*P.S*1.2*q,p.y+Math.sin(a2)*P.S*1.2*q+q*q*P.S,P.S*0.11*(1-q),a2,col); }
      if(t<330) return; const k=B.up(t,330,880); 
      for(let i=0;i<14;i++){ const g=((t/260)+i*0.31)%1, a2=-Math.PI+i/13*Math.PI, v=P.R*(0.3+1.1*g); OWN.drop(c,ex.x+Math.cos(a2)*v,ex.y+Math.sin(a2)*v*0.75+g*g*P.R*0.8,P.S*0.17*(1-g*0.5)*al,a2,col); }
      for(let i=0;i<5;i++){ const an=i/5*7+t/200; PF(ex.x+Math.cos(an)*P.R*0.5,ex.y+Math.sin(an)*P.R*0.35,P.R*0.38,0.5*al,[235,248,255]); }
      c.fillStyle=OWN.rg(c,fx,P.gnd,0,P.R*1.6*eo(k),[[0,OWN.rgb([150,210,255],0.7*al)],[1,OWN.rgb([90,160,240],0)]]); c.beginPath(); c.ellipse(fx,P.gnd,P.R*1.6*eo(k),P.R*0.3*eo(k),0,0,7); c.fill(); for(let i=0;i<3;i++){ const q=((t-330)/400+i/3)%1; c.strokeStyle=OWN.rgb([220,240,255],0.7*al*(1-q)); c.lineWidth=1.5; c.beginPath(); c.ellipse(fx,P.gnd,P.R*(0.3+1.2*q),P.R*(0.06+0.22*q),0,0,7); c.stroke(); }
      for(let i=0;i<5;i++){ const q=((t-330)/350+i/5)%1; OWN.drop(c,fx+(i-2)*P.R*0.4,hd.y+P.R*(0.3+1.4*q),P.S*0.14,Math.PI/2,col); } OWN.SS.squint(c,P,al); } },
  /* an icy blue jet full of frost crystals and snowflakes; icicles grow on the foe and it shivers under a frost coat */
  "Cold Jet":{ col:[170,230,255], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, src=x.self.top||P.o0, col=[170,230,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      B.charge(c,src,P.S,col,B.up(t,0,200)*al,t); if(t<200) return; const end=B.lp(src,P.tg,L); c.save(); c.globalCompositeOperation="lighter"; B.tube(c,src,end,P.S*0.3,col,al,0.06,t); c.restore();
      for(let i=0;i<12;i++){ const q=((t/400)+i/12)%1; if(q>L) continue; const p=B.lp(src,end,q), off=(atH(i*3)-0.5)*P.S*0.9; if(i%2) OWN.GU.flake?OWN.GU.flake(c,p.x,p.y+off,P.S*0.2,t/50+i,al):OWN.star(c,p.x,p.y+off,P.S*0.22,`rgba(240,250,255,${al})`,t/50+i); else OWN.star(c,p.x,p.y+off,P.S*0.18,`rgba(255,255,255,${al})`,i); }
      if(t<330) return; const k=eo(B.up(t,330,620)); c.fillStyle=OWN.rg(c,fx,fy,0,P.R*1.2,[[0,`rgba(230,248,255,${0.0})`],[0.7,`rgba(210,240,255,${0.35*al})`],[1,`rgba(190,230,255,${0.55*al})`]]); c.beginPath(); c.arc(fx,fy,P.R*1.15,0,7); c.fill();
      for(let i=0;i<5;i++){ const ix=fx+(i-2)*P.R*0.38, iy=P.gnd-P.R*1.55+Math.abs(i-2)*P.R*0.12, h=P.S*(0.5+0.3*atH(i))*k; c.fillStyle=OWN.lg(c,ix,iy,ix,iy+h,[[0,`rgba(235,250,255,${al})`],[1,`rgba(150,210,250,${0.8*al})`]]); c.beginPath(); c.moveTo(ix-P.S*0.12,iy); c.lineTo(ix+P.S*0.12,iy); c.lineTo(ix,iy+h); c.closePath(); c.fill(); }
      OWN.tremble(c,P.tg,P.R,t,[150,200,240],0.85*al); for(let i=0;i<8;i++){ const q=((t-330)/600+atH(i))%1; OWN.star(c,fx+(atH(i*3)-0.5)*P.R*1.8,fy-P.R*1.2+q*P.R*2.2,P.S*0.12*al,"rgba(255,255,255,.95)",t/80+i); } } },
  /* Tome's pages glow and a detailed magic circle opens in front of it, turned to face the foe; beams fire from points round its rim and converge on the foe with a core blast down the middle, and a second circle turns under the foe */
  "Spell Rune":{ col:[170,140,255], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, pg=x.self.center||P.o0, col=[170,140,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, e=eo(B.up(t,0,220)), sg={x:pg.x+P.d*P.S*1.5,y:pg.y-P.S*0.2}, r=P.S*1.5*e, sx=0.4, rot=t/280;
      atGlowA(c,pg.x,pg.y,P.S*1.2,col,0.5*e*al); for(let i=0;i<6;i++){ const q=((t/300)+i/6)%1, a2=i/6*Math.PI*2; B.rune(c,pg.x+(sg.x-pg.x)*q+Math.cos(a2)*P.S*0.3,pg.y-P.S*0.3-Math.sin(Math.PI*q)*P.S*0.6,P.S*0.12,i,[230,220,255],al*e*(1-q)); }
      B.sigil(c,sg.x,sg.y,r,col,al*e,rot,sx,1); if(t<200) return; const pts=[]; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+rot; pts.push({x:sg.x+sx*r*Math.cos(a),y:sg.y+r*Math.sin(a)}); }
      c.save(); c.globalCompositeOperation="lighter"; pts.forEach((p,i)=>{ const k=eo(B.up(t,200+i*12,330+i*12)); B.tube(c,p,B.lp(p,{x:fx,y:fy},k),P.S*0.07,i%2?[220,200,255]:col,al,0,t,0.8); }); B.tube(c,sg,B.lp(sg,P.tg,L),P.S*0.3,col,al,0.04,t); c.restore();
      for(let i=0;i<9;i++){ const q=((t/420)+i/9)%1; if(q>L) continue; const p=B.lp(sg,P.tg,q); B.rune(c,p.x,p.y+Math.sin(q*9+t/90)*P.S*0.35,P.S*(0.16+0.06*Math.sin(t/60+i)),i,[235,225,255],al); }
      if(t<330) return; const k=B.up(t,330,520); B.sigil(c,fx,P.gnd-2,P.R*1.4*eo(k),col,al,-t/300,1,0.3); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*1.3,col,0.65*al); c.restore();
      for(let i=0;i<6;i++){ const q=((t-330)/400+i/6)%1; B.rune(c,fx+(atH(i*3)-0.5)*P.R*1.6,P.gnd-q*P.R*2.2,P.S*0.15,i+2,col,al*(1-q)); } OWN.SS.squint(c,P,al); } },
  /* Tome's pages flutter and a parchment scroll unrolls from them with lines of writing running along it and gold capitals peeling off; it wraps round the foe and the words flare gold as it tightens */
  "Verse Beam":{ col:[255,220,150], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, pg=x.self.center||P.o0, col=[255,220,150], al=B.A(t), fx=P.tg.x, fy=P.tg.y, W=P.S*0.62, TXT="thus spoke the verse and the page turned on its foe ";
      atGlowA(c,pg.x,pg.y,P.S*(0.8+0.9*B.up(t,0,200)),col,0.6*al);
      for(let i=0;i<3;i++){ const q=((t/260)+i/3)%1, lift=Math.sin(Math.PI*q); c.save(); c.globalAlpha=al*lift; c.translate(pg.x,pg.y-P.S*0.1); c.rotate(-P.d*(0.3+1.6*q)); c.fillStyle=OWN.lg(c,0,0,P.S*0.8,0,[[0,"#f7ecd2"],[1,"#fffaf0"]]); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(P.S*0.4,-P.S*0.25*lift,P.S*0.8,-P.S*0.05); c.lineTo(P.S*0.8,P.S*0.35); c.quadraticCurveTo(P.S*0.4,P.S*0.2,0,P.S*0.3); c.closePath(); c.fill();
        c.strokeStyle="rgba(120,90,60,.5)"; c.lineWidth=1; for(let m=0;m<3;m++){ c.beginPath(); c.moveTo(P.S*0.15,P.S*(0.05+0.08*m)); c.lineTo(P.S*0.65,P.S*(0.03+0.08*m)); c.stroke(); } c.restore(); }
      if(t<200) return; const L=B.up(t,200,380), wrap=B.up(t,380,720), pts=[], ctl={x:(pg.x+fx)/2,y:(pg.y+fy)/2-P.R*1.0};
      for(let m=0;m<=36;m++){ const q=m/36*L, u=1-q; pts.push({x:u*u*pg.x+2*u*q*ctl.x+q*q*fx,y:u*u*pg.y+2*u*q*ctl.y+q*q*(fy-P.R*0.7)+Math.sin(q*10+t/70)*P.S*0.2}); }
      if(wrap>0) for(let m=1;m<=48*wrap;m++){ const a2=-Math.PI/2+m/48*Math.PI*4, r=P.R*(1.2-0.22*wrap); pts.push({x:fx+Math.cos(a2)*r,y:fy-P.R*0.7+m/48*P.R*1.4+Math.sin(a2)*r*0.3}); }
      if(pts.length<2) return; const nrm=[]; let len=[0]; for(let i=0;i<pts.length;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)], l=Math.hypot(b.x-a.x,b.y-a.y)||1; nrm.push({x:-(b.y-a.y)/l,y:(b.x-a.x)/l}); if(i) len.push(len[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y)); }
      c.save(); c.globalAlpha=al; c.lineCap="round"; c.lineJoin="round"; c.shadowColor=OWN.rgb(col,0.9); c.shadowBlur=P.S*0.5; c.strokeStyle="#c9a66b"; c.lineWidth=W; c.beginPath(); pts.forEach((p,i)=>c[i?"lineTo":"moveTo"](p.x,p.y)); c.stroke(); c.shadowBlur=0;
      c.strokeStyle="#fbf1d8"; c.lineWidth=W*0.84; c.stroke(); c.strokeStyle="rgba(200,160,90,.55)"; c.lineWidth=1.2; for(const sd of [-1,1]){ c.beginPath(); pts.forEach((p,i)=>c[i?"lineTo":"moveTo"](p.x+nrm[i].x*sd*W*0.33,p.y+nrm[i].y*sd*W*0.33)); c.stroke(); }
      const glow=wrap>0.5?(wrap-0.5)/0.5:0, step=W*0.36, total=len[len.length-1], off=(t/6)%(step*TXT.length); c.font=`italic 700 ${Math.round(W*0.42)}px Georgia, serif`; c.textAlign="center"; c.textBaseline="middle";
      let j=0; for(let d=step*0.5-(off%step);d<total;d+=step,j++){ let i=1; while(i<len.length-1&&len[i]<d) i++; const a=pts[i-1], b=pts[i], f=(d-len[i-1])/((len[i]-len[i-1])||1), px=a.x+(b.x-a.x)*f, py=a.y+(b.y-a.y)*f, ch=TXT[(Math.floor((d+off)/step))%TXT.length];
        if(ch===" ") continue; c.save(); c.translate(px,py); c.rotate(Math.atan2(b.y-a.y,b.x-a.x)); c.fillStyle=glow>0?OWN.rgb(OWN.mix([90,60,30],[230,160,30],glow),1):"#5a3c1e"; if(glow>0){ c.shadowColor="rgba(255,200,80,1)"; c.shadowBlur=W*0.4*glow; } c.fillText(ch,0,1); c.restore(); }
      c.restore();
      const caps="VERSE"; for(let i=0;i<5;i++){ const q=((t-200)/500+i/5)%1, idx=Math.min(pts.length-1,Math.floor(q*pts.length)), p=pts[idx], a2=t/200+i*1.3, rr=W*(1.2+0.6*Math.sin(t/150+i)); c.save(); c.globalAlpha=al*Math.sin(Math.PI*q); c.translate(p.x+Math.cos(a2)*rr,p.y+Math.sin(a2)*rr*0.6); c.rotate(Math.sin(t/120+i)*0.3);
        c.font=`900 ${Math.round(P.S*0.55)}px Georgia, serif`; c.textAlign="center"; c.textBaseline="middle"; c.shadowColor="rgba(255,200,80,1)"; c.shadowBlur=P.S*0.4; c.fillStyle=c.createLinearGradient(0,-P.S*0.3,0,P.S*0.3); c.fillStyle.addColorStop(0,"#fff4c4"); c.fillStyle.addColorStop(1,"#e0a020"); c.fillText(caps[i],0,0); c.restore(); }
      if(t>=330){ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*1.2,col,0.5*al+0.3*glow*al); c.restore(); OWN.SS.squint(c,P,al*wrap); } } },
  /* Shutter's lens iris opens, a beam full of hexagon bokeh fires, and focus brackets snap round the foe */
  "Lens Beam":{ col:[180,220,255], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, lens=OWN.pt(x.self,P.tg,[0.62,0.5]), col=[180,220,255], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, hex=(hx,hy,r,cc,a2,f=true)=>{ c.beginPath(); for(let m=0;m<6;m++){ const a3=m/6*Math.PI*2+0.5; c[m?"lineTo":"moveTo"](hx+Math.cos(a3)*r,hy+Math.sin(a3)*r); } c.closePath(); if(f){ c.fillStyle=OWN.rgb(cc,a2); c.fill(); } else { c.strokeStyle=OWN.rgb(cc,a2); c.stroke(); } };
      const e=B.up(t,0,200); c.save(); c.lineWidth=P.S*0.07; hex(lens.x,lens.y,P.S*(0.15+0.4*e),[60,70,90],0.6*al,false); for(let i=0;i<6;i++){ const a3=i/6*Math.PI*2+t/200; c.strokeStyle=OWN.rgb([200,210,230],0.8*al); c.beginPath(); c.moveTo(lens.x+Math.cos(a3)*P.S*0.15*(1+e),lens.y+Math.sin(a3)*P.S*0.15*(1+e)); c.lineTo(lens.x+Math.cos(a3+1)*P.S*0.55,lens.y+Math.sin(a3+1)*P.S*0.55); c.stroke(); } c.restore(); atGlowA(c,lens.x,lens.y,P.S*0.9*e,col,0.7*al);
      if(t<200) return; const end=B.lp(lens,P.tg,L); c.save(); c.globalCompositeOperation="lighter"; B.tube(c,lens,end,P.S*0.26,col,al,0,t); [[255,200,150],[150,220,255],[220,255,190],[255,170,230]].forEach((cc,i)=>{ const q=((t/700)+i/4)%1; if(q<L){ const p=B.lp(lens,end,q); hex(p.x+(i%2?1:-1)*P.S*0.4,p.y+(i%2?-1:1)*P.S*0.3,P.S*(0.35+0.2*i),cc,0.35*al); } }); c.restore();
      if(t<330) return; const k=B.up(t,330,480), bx=P.R*(1.6-0.5*eo(k)); c.strokeStyle=`rgba(255,255,255,${0.95*al})`; c.lineWidth=P.S*0.1; c.lineCap="round"; for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ c.beginPath(); c.moveTo(fx+sx*bx,fy+sy*bx-sy*P.R*0.35); c.lineTo(fx+sx*bx,fy+sy*bx); c.lineTo(fx+sx*bx-sx*P.R*0.35,fy+sy*bx); c.stroke(); }
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*1.1,[255,255,255],0.6*al); c.restore(); OWN.SS.squint(c,P,al); } },
  /* Shutter's lens barrel slides out, a cone zooms in on the foe, and a magnifier circle with a crosshair shows it up close before a flash */
  "Zoom Lens":{ col:[200,230,255], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, lens=OWN.pt(x.self,P.tg,[0.62,0.5]), col=[200,230,255], al=B.A(t), fx=P.tg.x, fy=P.tg.y, ex=B.up(t,0,220), an=B.hv(lens,P.tg);
      c.save(); c.translate(lens.x,lens.y); c.rotate(an); c.globalAlpha=al; for(let i=0;i<3;i++){ const l=P.S*0.35*ex*(i+1), r=P.S*(0.55-0.08*i); c.fillStyle=OWN.lg(c,0,-r,0,r,[[0,"#4a4f60"],[0.4,"#9aa0b0"],[1,"#2a2e3a"]]); c.fillRect(l-P.S*0.35*ex,-r,P.S*0.35*ex+1,r*2); } const tipX=P.S*1.05*ex; c.fillStyle=OWN.rg(c,tipX,0,0,P.S*0.5,[[0,"#e8f4ff"],[0.6,"#7fb0e0"],[1,"#2a4060"]]); c.beginPath(); c.ellipse(tipX,0,P.S*0.12,P.S*0.38,0,0,7); c.fill(); c.restore();
      const tip={x:lens.x+Math.cos(an)*P.S*1.05*ex,y:lens.y+Math.sin(an)*P.S*1.05*ex}; if(t<200) return; const L=B.L(t); c.save(); c.globalCompositeOperation="lighter"; B.cone(c,tip,B.lp(tip,P.tg,L),P.S*0.4,P.R*(1.6-1.0*B.up(t,250,420))*L,col,al,0.35,0.2); c.restore();
      if(t<330) return; const k=eo(B.up(t,330,470)), mr=P.R*1.15*k; c.save(); c.globalAlpha=al; c.shadowColor="rgba(40,30,70,.4)"; c.shadowBlur=10; c.strokeStyle="#3a3f50"; c.lineWidth=P.S*0.2; c.beginPath(); c.arc(fx,fy,mr,0,7); c.stroke(); c.shadowBlur=0; c.fillStyle=OWN.rg(c,fx,fy,0,mr,[[0,"rgba(255,255,255,.0)"],[0.8,"rgba(200,230,255,.18)"],[1,"rgba(160,200,240,.45)"]]); c.beginPath(); c.arc(fx,fy,mr,0,7); c.fill();
      c.strokeStyle="rgba(255,90,90,.85)"; c.lineWidth=2; c.beginPath(); c.moveTo(fx-mr*0.8,fy); c.lineTo(fx-mr*0.2,fy); c.moveTo(fx+mr*0.2,fy); c.lineTo(fx+mr*0.8,fy); c.moveTo(fx,fy-mr*0.8); c.lineTo(fx,fy-mr*0.2); c.moveTo(fx,fy+mr*0.2); c.lineTo(fx,fy+mr*0.8); c.stroke(); c.beginPath(); c.arc(fx,fy,mr*0.12,0,7); c.stroke();
      OWN.CH.shine(c,fx-mr*0.5,fy-mr*0.55,mr*0.3,mr*0.12,0.8,-0.6); c.restore(); const fl=B.up(t,600,760); if(fl>0&&fl<1){ c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1+2*fl),[255,255,255],0.95*(1-fl)); c.restore(); } } },
  /* a silver crescent moon rises over the vampire with a pale halo, and a shimmering moonbeam pours from it straight onto the foe, carrying little crescents and moon dust; the foe is washed in silver light */
  "Moon Beam":{ col:[210,225,255], atk:(t)=>({f:0,pose:t<820?"cast":null,lift:-6*Math.sin(Math.PI*Math.min(1,t/900))}),
    draw(c,PF,P,t,x){ const B=OWN.BM, top=x.self.top||P.o0, col=[210,225,255], al=B.A(t), fx=P.tg.x, fy=P.tg.y, e=eo(B.up(t,0,220)), moon={x:top.x+P.d*P.R*0.4,y:top.y-P.R*0.75-P.R*0.3*e}, mr=P.S*1.1*e;
      c.save(); c.globalAlpha=0.35*e*al; c.strokeStyle="rgba(230,240,255,.8)"; c.lineWidth=2; c.beginPath(); c.arc(moon.x,moon.y,mr*2.1,0,7); c.stroke(); c.restore();
      if(t>=200){ const L=B.L(t), end=B.lp(moon,P.tg,L); c.save(); c.globalCompositeOperation="lighter"; B.cone(c,moon,end,mr*0.5,P.R*0.8,[180,200,255],al,0.35,0.55); B.tube(c,moon,end,P.S*0.38,col,al,0.05,t); c.restore();
        for(let i=0;i<7;i++){ const q=((t/450)+i/7)%1; if(q>L) continue; const p=B.lp(moon,P.tg,q), w=Math.sin(q*10+t/90+i)*P.S*0.5; B.moon2(c,p.x,p.y+w,P.S*(0.16+0.06*Math.sin(t/80+i)),[225,232,255],[120,130,170],0.9*al,true); }
        for(let i=0;i<14;i++){ const q=((t/350)+atH(i*3))%1; if(q>L) continue; const p=B.lp(moon,P.tg,q); OWN.star(c,p.x+(atH(i*5)-0.5)*P.S*1.1,p.y+(atH(i*7)-0.5)*P.S*1.1,P.S*0.12*al,"rgba(245,248,255,.95)",t/60+i); } }
      B.moon2(c,moon.x,moon.y,mr,[230,236,255],[120,130,170],al,true); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,moon.x,moon.y,mr*1.3,[200,215,255],0.5*al); c.restore();
      for(let i=0;i<6;i++) OWN.star(c,moon.x+(atH(i*3)-0.5)*P.R*2.6,moon.y+(atH(i*5)-0.5)*P.R*1.4,P.S*0.13*e*al*(0.6+0.4*Math.sin(t/80+i)),"rgba(255,255,245,.95)",i);
      if(t<330) return; const k=B.up(t,330,600); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1.2+0.2*Math.sin(t/60)),[200,215,255],0.7*al); c.restore();
      for(let i=0;i<6;i++){ const a2=i/6*Math.PI*2+t/250, v=P.R*(0.9+0.15*Math.sin(t/70+i)); B.moon2(c,fx+Math.cos(a2)*v,fy+Math.sin(a2)*v*0.6,P.S*0.2*eo(k),[225,232,255],[120,130,170],al,true); }
      for(let i=0;i<10;i++){ const q=((t-330)/500+atH(i))%1; OWN.star(c,fx+(atH(i*3)-0.5)*P.R*1.6,fy+P.R*0.7-q*P.R*1.9,P.S*0.13*al,"rgba(235,240,255,.95)",t/60+i); } OWN.SS.squint(c,P,al*0.8); } },
  /* a blood moon swells over the field, dark crimson with seas and craters and blood dripping off its rim; a crimson beam bleeds out of it onto the foe, and the foe's blood floats back to the vampire, who glows red */
  "Blood Moon":{ col:[190,20,40], atk:(t)=>({f:0,pose:t<820?"cast":null,lift:-8*Math.sin(Math.PI*Math.min(1,t/900))}),
    draw(c,PF,P,t,x){ const B=OWN.BM, top=x.self.top||P.o0, src=x.self.mouth||x.self.center||P.o0, col=[190,20,40], al=B.A(t), fx=P.tg.x, fy=P.tg.y, e=eo(B.up(t,0,220)), moon={x:(top.x+fx)/2,y:Math.min(top.y,P.head.y)-P.R*0.8-P.R*0.4*e}, mr=P.S*1.25*e;
      if(t>=200){ const L=B.L(t), end=B.lp(moon,{x:fx,y:fy},L); c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<6;i++){ const q=0.08+i*0.06; if(q<L){ const p=B.lp(moon,end,q/L*L); atGlowA(c,p.x,p.y,mr*(0.9-i*0.1),[190,10,30],0.35*al); } } B.tube(c,B.lp(moon,end,0.15),end,P.S*0.32,[200,20,40],al,0.06,t,0.5); c.restore();
        for(let i=0;i<12;i++){ const q=((t/380)+atH(i*3))%1; if(q>L) continue; const p=B.lp(moon,P.tg,q); OWN.drop(c,p.x+(atH(i*5)-0.5)*P.S*1.0,p.y+(atH(i*7)-0.5)*P.S*0.8,P.S*0.15*al,B.hv(moon,P.tg),[150,0,20]); } }
      B.moon2(c,moon.x,moon.y,mr,[150,8,22],[50,0,6],al,false,0.22); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,moon.x,moon.y+mr*0.6,mr*1.3,[200,20,40],0.6*al); c.restore();
      for(let i=0;i<4;i++){ const dx=moon.x+(i-1.5)*mr*0.42, by=moon.y+Math.sqrt(Math.max(0,mr*mr-Math.pow((i-1.5)*mr*0.42,2)))-2, q=((t/600)+i*0.27)%1, len=mr*(0.2+0.6*q); c.fillStyle=OWN.rgb([140,0,18],0.95*al*e); c.beginPath(); c.moveTo(dx-mr*0.06,by); c.lineTo(dx+mr*0.06,by); c.lineTo(dx+mr*0.04,by+len); c.arc(dx,by+len,mr*0.05,0,Math.PI); c.fill();
        if(q>0.7){ const f=(q-0.7)/0.3; OWN.drop(c,dx,by+len+f*P.R*1.4,P.S*0.13,Math.PI/2,[150,0,20]); } }
      if(t<330) return; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*1.2,[200,20,40],0.55*al); atGlowA(c,(x.self.center||src).x,(x.self.center||src).y,P.R*1.0,[210,20,40],0.5*al*B.up(t,450,650)); c.restore();
      c.fillStyle=OWN.rg(c,fx,fy,P.R*0.3,P.R*1.3,[[0,"rgba(120,0,15,0)"],[1,`rgba(110,0,15,${0.35*al})`]]); c.beginPath(); c.arc(fx,fy,P.R*1.3,0,7); c.fill();
      for(let i=0;i<11;i++){ const q=((t-330)/450+atH(i*3))%1, st={x:fx+(atH(i*5)-0.5)*P.R*1.0,y:fy+(atH(i*7)-0.5)*P.R}, p={x:st.x+(src.x-st.x)*q,y:st.y+(src.y-st.y)*q-Math.sin(Math.PI*q)*P.R*0.8}; atGlowA(c,p.x,p.y,P.S*0.35,[200,10,30],0.45*al); OWN.drop(c,p.x,p.y,P.S*0.18*al,B.hv(st,src),[150,0,20]); } OWN.SS.squint(c,P,al); } },
  /* the kraken's siphon blasts a twisting corkscrew water spout, two strands spiralling round each other, and the foe is spun in a ring of spray */
  "Water Spout":{ col:[90,170,240], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, src=x.self.mouth||x.self.center||P.o0, col=[90,170,240], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      if(t<200){ OWN.glob(c,src.x+P.d*P.S*0.3,src.y,P.S*0.35*B.up(t,0,200),t,col); return; } const end=B.lp(src,P.tg,L), dx=end.x-src.x, dy=end.y-src.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln; B.tube(c,src,end,P.S*0.18,[140,200,250],al*0.7,0.1,t,0.4);
      for(let s=0;s<2;s++){ const seg=[]; for(let m=0;m<=40;m++){ const q=m/40, w=(P.S*0.3+P.S*0.4*q)*Math.sin(q*Math.PI*7-t/30+s*Math.PI); seg.push({x:src.x+dx*q+nx*w,y:src.y+dy*q+ny*w,z:Math.cos(q*Math.PI*7-t/30+s*Math.PI)}); }
        c.lineCap="round"; for(let m=1;m<seg.length;m++){ const a=seg[m-1], b=seg[m]; c.strokeStyle=OWN.rgb(b.z>0?[200,235,255]:[60,130,220],0.9*al); c.lineWidth=P.S*(0.2+0.08*b.z); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); } }
      if(t<330) return; for(let i=0;i<12;i++){ const a2=i/12*Math.PI*2+t/90, r=P.R*(1.1+0.1*Math.sin(t/60+i)); OWN.drop(c,fx+Math.cos(a2)*r,fy+Math.sin(a2)*r*0.4,P.S*0.14*al,a2+Math.PI/2,col); } c.strokeStyle=OWN.rgb([200,235,255],0.6*al); c.lineWidth=2.5; c.beginPath(); c.ellipse(fx,fy,P.R*1.15,P.R*0.45,0,0,7); c.stroke(); OWN.SS.squint(c,P,al); } },
  /* the rune carved in Golem's chest glows, and glowing stone tablets pulse out one after another, stamping the foe with its rune and cracking the ground */
  "Rune Pulse":{ col:[120,230,210], atk:(t)=>({f:0,pose:t<200?"determined":t<820?"push":null,off:[0,0]}),
    draw(c,PF,P,t,x){ const B=OWN.BM, ch=x.self.center||P.o0, col=[120,230,210], al=B.A(t), fx=P.tg.x, fy=P.tg.y;
      const e=B.up(t,0,200); atGlowA(c,ch.x,ch.y,P.S*(0.7+0.6*e),col,0.7*al); B.rune(c,ch.x,ch.y,P.S*0.35,1,col,al*Math.max(0.4,e));
      for(let j=0;j<4;j++){ const q=(t-180-j*110)/170; if(q<0) continue; if(q<1){ const p=B.lp(ch,P.tg,eo(q)), s=P.S*(0.4+0.25*q); c.save(); c.translate(p.x,p.y); c.rotate(Math.sin(t/80+j)*0.15); c.shadowColor="rgba(40,30,60,.35)"; c.shadowBlur=6; c.fillStyle=OWN.lg(c,-s,-s,s,s,[[0,"#a9a39a"],[1,"#6b665f"]]); OWN.rr(c,-s,-s,s*2,s*2,s*0.25); c.fill(); c.shadowBlur=0; c.restore(); B.rune(c,p.x,p.y,s*0.55,j,col,al); atGlowA(c,p.x,p.y,s*1.4,col,0.4*al); }
        else { const s2=(q-1)*170/260; if(s2<1){ OWN.CH.ring(c,fx,fy,P.R*(0.5+1.1*s2),P.S*0.14*(1-s2)+1,col,0.85*(1-s2)); } } }
      if(t<330) return; B.rune(c,fx,fy,P.R*0.55,1,col,al*(0.7+0.3*Math.sin(t/50))); c.strokeStyle=OWN.rgb([90,70,60],0.8*al); c.lineWidth=2; for(let i=0;i<5;i++){ const a2=Math.PI+i/4*Math.PI*0.9+0.1, L2=P.R*(0.6+0.6*B.up(t,330,600)); c.beginPath(); c.moveTo(fx,P.gnd); c.lineTo(fx+Math.cos(a2)*L2*0.5,P.gnd+Math.sin(a2)*L2*0.08+2); c.lineTo(fx+Math.cos(a2)*L2,P.gnd+3); c.stroke(); }
      for(let i=0;i<5;i++){ const q=((t-330)/380+i/5)%1; c.fillStyle=OWN.rgb([140,130,120],al*(1-q)); c.beginPath(); c.arc(fx+(i-2)*P.R*0.4,P.gnd-Math.sin(Math.PI*q)*P.R*0.5,P.S*0.1,0,7); c.fill(); } } },
  /* a flower on Diwata's head opens, and a soft green-gold ray full of swirling petals sends little flowers sprouting on the foe's head */
  "Glow Ray":{ col:[200,255,170], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, top=x.self.top||P.o0, col=[200,255,170], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, pk=[255,170,210];
      const e=eo(B.up(t,0,200)); atGlowA(c,top.x,top.y,P.S*(0.6+0.8*e),[255,240,200],0.6*al); B.flower(c,top.x,top.y-P.S*0.1,P.S*0.6,pk,e*al,t/400); if(t<200) return;
      const end=B.lp(top,P.tg,L); c.save(); c.globalCompositeOperation="lighter"; B.tube(c,top,end,P.S*0.3,col,al,0.06,t); c.restore();
      for(let i=0;i<12;i++){ const q=((t/450)+i/12)%1; if(q>L) continue; const p=B.lp(top,end,q), w=Math.sin(q*12+t/70+i)*P.S*0.5; c.save(); c.translate(p.x,p.y+w); c.rotate(t/60+i); c.fillStyle=OWN.rg(c,0,0,0,P.S*0.2,[[0,"#fff"],[1,OWN.rgb(i%2?pk:[255,230,150])]]); c.beginPath(); c.ellipse(0,0,P.S*0.2,P.S*0.11,0,0,7); c.fill(); c.restore(); }
      if(t<330) return; for(let i=0;i<4;i++){ const k=B.up(t,330+i*60,480+i*60); B.flower(c,P.head.x+(i-1.5)*P.R*0.45,P.head.y+P.S*0.15-Math.abs(i-1.5)*-P.S*0.1,P.S*0.45,i%2?pk:[255,240,150],eo(k)*al,i); }
      for(let i=0;i<8;i++){ const q=((t-330)/500+atH(i))%1; OWN.star(c,fx+(atH(i*3)-0.5)*P.R*1.6,fy-q*P.R*1.6,P.S*0.12*al,"rgba(255,255,230,.95)",t/50+i); } } },
  /* a sun disc rises behind the sphinx's headdress and throws a golden ray with heat shimmer; the foe sweats in the glare */
  "Sun Ray":{ col:[255,200,80], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, top=x.self.top||P.o0, col=[255,200,80], al=B.A(t), fx=P.tg.x, fy=P.tg.y, e=eo(B.up(t,0,220)), sun={x:top.x,y:top.y-P.S*0.4-P.S*0.8*e};
      c.save(); c.globalAlpha=al; atGlowA(c,sun.x,sun.y,P.S*2.2*e,[255,190,80],0.7); for(let i=0;i<12;i++){ const a2=i/12*Math.PI*2+t/500; OWN.FL.ray(c,sun.x,sun.y,sun.x+Math.cos(a2)*P.S*1.6*e,sun.y+Math.sin(a2)*P.S*1.6*e,P.S*0.12,P.S*0.02,[255,220,120],0.9); }
      c.fillStyle=OWN.rg(c,sun.x,sun.y,0,P.S*0.75*e+1,[[0,"#fffbe0"],[0.6,"#ffd24a"],[1,"#f0a020"]],-P.S*0.2,-P.S*0.2); c.beginPath(); c.arc(sun.x,sun.y,P.S*0.75*e+1,0,7); c.fill(); c.restore(); if(t<200) return; const L=B.L(t), end=B.lp(sun,P.tg,L);
      c.save(); c.globalCompositeOperation="lighter"; B.cone(c,sun,end,P.S*0.5,P.R*0.9,col,al,0.5,0.5); B.tube(c,sun,end,P.S*0.22,[255,235,160],al,0,t); c.restore();
      const dx=end.x-sun.x, dy=end.y-sun.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln; for(let s=0;s<3;s++){ c.strokeStyle=OWN.rgb([255,240,200],0.35*al); c.lineWidth=1.5; c.beginPath(); for(let m=0;m<=30;m++){ const q=m/30*L, w=(s-1)*P.R*0.5*q+Math.sin(q*20-t/40+s)*P.S*0.12; c.lineTo(sun.x+dx*q/L*L+nx*w,sun.y+dy*q/L*L+ny*w); } c.stroke(); }
      if(t<330) return; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*1.3,[255,170,70],0.55*al); c.restore(); for(let i=0;i<3;i++){ const q=((t-330)/350+i/3)%1; OWN.drop(c,fx+P.R*(0.5+0.25*i)*(i%2?-1:1),P.head.y+P.R*(0.2+0.6*q),P.S*0.16,Math.PI/2,[150,210,255]); }
      for(let s=0;s<3;s++){ c.strokeStyle=OWN.rgb([255,235,200],0.4*al); c.lineWidth=1.5; c.beginPath(); for(let m=0;m<=12;m++){ const yy=P.head.y-P.S*0.3-m*P.S*0.12; c.lineTo(fx+(s-1)*P.R*0.5+Math.sin(m*1.2-t/50+s)*P.S*0.15,yy); } c.stroke(); } OWN.SS.squint(c,P,al); } },
  /* the dragon coughs a hot puff and sprays a cone of glowing embers that streak across, stick to the foe and smoulder there with little flames */
  "Ember Breath":{ col:[255,150,60], atk:(t)=>({f:0,pose:t<200?"determined":t<820?"bitewide":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, m=x.self.mouth||P.o0, al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, outer=OWN.rgb([255,110,40],0.95), inner=OWN.rgb([255,240,170],0.98);
      if(t<200){ const k=B.up(t,0,200); c.save(); c.globalCompositeOperation="lighter"; B.fire(c,m.x+P.d*P.S*0.2,m.y,P.S*(0.3+0.4*k),0.8,0.8*k); c.restore(); for(let i=0;i<3;i++) PF(m.x-P.d*P.S*0.1,m.y-P.S*(0.3+0.7*((t/200+i/3)%1)),P.S*0.3,0.45*k,[120,110,110]); return; }
      const an=B.hv(m,P.tg), D=Math.hypot(fx-m.x,fy-m.y)*1.05; c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<14;i++){ const q=((t/220)+i/14)%1; if(t>720) break; const sp=(atH(i*5)-0.5)*0.5*q; B.fire(c,m.x+Math.cos(an+sp)*D*0.55*q,m.y+Math.sin(an+sp)*D*0.55*q,P.S*(0.3+0.6*q),1-q*0.9,0.65*(1-q)*al); }
      for(let i=0;i<90;i++){ const age=((t/360)+atH(i*3))%1, born=t-age*360; if(born<200||born>720||age>L*1.05) continue; const sp=(atH(i*7)-0.5)*0.6, r=D*age, wob=Math.sin(t/40+i)*P.S*0.15*age, p={x:m.x+Math.cos(an+sp)*r-Math.sin(an)*wob,y:m.y+Math.sin(an+sp)*r+Math.cos(an)*wob+age*age*P.S*0.4}, tl=P.S*(0.5+0.8*age), hot=1-age*0.6;
        const g=c.createLinearGradient(p.x-Math.cos(an+sp)*tl,p.y-Math.sin(an+sp)*tl,p.x,p.y); g.addColorStop(0,"rgba(255,90,30,0)"); g.addColorStop(1,OWN.rgb(OWN.mix([255,250,200],[255,120,40],1-hot),al)); c.strokeStyle=g; c.lineWidth=P.S*(0.11+0.08*atH(i)); c.lineCap="round"; c.beginPath(); c.moveTo(p.x-Math.cos(an+sp)*tl,p.y-Math.sin(an+sp)*tl); c.lineTo(p.x,p.y); c.stroke(); atGlowA(c,p.x,p.y,P.S*0.35,[255,150,60],0.7*al); c.fillStyle="rgba(255,250,220,.95)"; c.beginPath(); c.arc(p.x,p.y,P.S*0.06,0,7); c.fill(); }
      c.restore(); if(t<330) return;
      for(let i=0;i<10;i++){ const px=fx+(atH(i*3)-0.5)*P.R*1.5, py=fy+(atH(i*5)-0.5)*P.R*1.4, k=B.up(t,330+i*25,430+i*25); if(k<=0) continue; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,px,py,P.S*0.4*(0.8+0.2*Math.sin(t/30+i)),[255,120,40],0.8*k*al); c.restore(); c.fillStyle=OWN.rgb([255,220,120],k*al); c.beginPath(); c.arc(px,py,P.S*0.08,0,7); c.fill();
        if(i%2) OWN.flame(c,px,py-P.S*0.15,P.S*0.22*k*al,Math.PI/2,outer,inner,t+i*30); if(i%3===0) PF(px,py-P.S*0.4-((t/7+i*13)%(P.S*1.4)),P.S*0.3,0.35*al*k,[140,130,130]); }
      for(let i=0;i<8;i++){ const q=((t-330)/400+atH(i))%1; c.fillStyle=OWN.rgb([255,200,110],0.9*al*(1-q)); c.beginPath(); c.arc(fx+(atH(i*3)-0.5)*P.R*1.4,fy-q*P.R*1.6,P.S*0.06,0,7); c.fill(); } OWN.SS.squint(c,P,al); } },
  /* a short, wide blast of fire roars out of the dragon's mouth and bursts round the foe in a fireball; when it dies down the foe is left sooty and smoking */
  "Scorch":{ col:[255,120,40], atk:(t)=>({f:0,pose:t<200?"determined":t<560?"bitewide":null,off:t>200&&t<560?[Math.sin(t/10)*1.5-2,0]:[0,0]}),
    draw(c,PF,P,t,x){ const B=OWN.BM, m=x.self.mouth||P.o0, al=B.A(t), fx=P.tg.x, fy=P.tg.y;
      if(t<200){ const k=B.up(t,0,200); c.save(); c.globalCompositeOperation="lighter"; B.fire(c,m.x+P.d*P.S*0.15,m.y,P.S*(0.3+0.5*k),0.9,0.9*k); c.restore(); return; }
      const an=B.hv(m,P.tg), D=Math.hypot(fx-m.x,fy-m.y); c.save(); c.globalCompositeOperation="lighter";
      for(let i=0;i<70;i++){ const age=((t/230)+atH(i*3))%1, born=t-age*230; if(born<200||born>520) continue; const sp=(atH(i*7)-0.5)*0.75*age, r=D*age, tb=Math.sin(t/30+i*1.7)*P.S*0.25*age, p={x:m.x+Math.cos(an+sp)*r-Math.sin(an)*tb,y:m.y+Math.sin(an+sp)*r+Math.cos(an)*tb-age*age*P.S*0.3};
        B.fire(c,p.x,p.y,P.S*(0.35+0.85*age),1-age*0.75,0.85*al); }
      c.restore(); if(t<330) return; const fb=B.up(t,330,700), on=1-B.up(t,560,720);
      c.save(); c.globalCompositeOperation="lighter"; for(let i=0;i<26;i++){ const a2=i/26*Math.PI*2+atH(i)*0.5, v=P.R*(0.2+1.0*eo(fb))*(0.5+0.5*atH(i*3)), p={x:fx+Math.cos(a2)*v,y:fy+Math.sin(a2)*v*0.85-fb*P.R*0.4*atH(i*5)}; B.fire(c,p.x,p.y,P.R*(0.35+0.3*atH(i*7))*(1-fb*0.4),1-fb*0.8-atH(i)*0.2,0.9*on); }
      atGlowA(c,fx,fy,P.R*(1.2+0.8*fb),[255,120,40],0.8*on); c.restore();
      const sk=B.up(t,560,740); for(let i=0;i<7;i++){ c.fillStyle=`rgba(40,30,30,${0.5*sk*al})`; c.beginPath(); c.ellipse(fx+(atH(i*3)-0.5)*P.R*1.3,fy+(atH(i*5)-0.5)*P.R*1.2,P.S*(0.22+0.18*atH(i)),P.S*(0.14+0.12*atH(i*7)),atH(i)*3,0,7); c.fill(); }
      for(let i=0;i<7;i++){ const q=((t-480)/380+i/7)%1; if(t>480) PF(fx+(atH(i*7)-0.5)*P.R*1.1+Math.sin(t/90+i)*P.S*0.3,P.head.y+P.R*0.3-q*P.R*1.9,P.S*(0.35+0.6*q),0.6*sk*al*(1-q),[85,80,85]); }
      for(let i=0;i<6;i++){ const q=((t-560)/300+atH(i))%1; if(t>560){ c.fillStyle=OWN.rgb([255,170,80],0.9*al*(1-q)); c.beginPath(); c.arc(fx+(atH(i*3)-0.5)*P.R*1.2,fy+P.R*0.2-q*P.R*1.2,P.S*0.05,0,7); c.fill(); } } OWN.SS.squint(c,P,al); } },
  /* a long, rolling stream of fire pours out of the dragon's mouth, white hot at the mouth and cooling to orange and red as it billows toward the foe; it breaks over the foe in a wall of flame with smoke rolling off the top */
  "Flame Stream":{ col:[255,130,40], atk:(t)=>({f:0,pose:t<200?"determined":t<820?"bitewide":null,off:t>200&&t<760?[-2,0]:[0,0]}),
    draw(c,PF,P,t,x){ const B=OWN.BM, m=x.self.mouth||P.o0, al=B.A(t), fx=P.tg.x, fy=P.tg.y, outer=OWN.rgb([255,100,30],0.95), inner=OWN.rgb([255,235,150],0.98);
      if(t<200){ const k=B.up(t,0,200); c.save(); c.globalCompositeOperation="lighter"; B.fire(c,m.x+P.d*P.S*0.15,m.y,P.S*(0.3+0.5*k),0.9,0.9*k); c.restore(); for(let i=0;i<3;i++) PF(m.x-P.d*P.S*0.1,m.y-P.S*(0.3+0.7*((t/200+i/3)%1)),P.S*0.3,0.45*k,[120,110,110]); return; }
      const dx=fx-m.x, dy=fy-m.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln, path=q=>({x:m.x+dx*q+nx*Math.sin(q*Math.PI*2.5-t/70)*P.S*0.45*q,y:m.y+dy*q+ny*Math.sin(q*Math.PI*2.5-t/70)*P.S*0.45*q-q*q*P.S*0.3});
      for(let i=0;i<20;i++){ const age=((t/300)+i/20)%1, born=t-age*300; if(born<200||born>760||age<0.75) continue; const p=path(age); PF(p.x+(atH(i)-0.5)*P.R*0.6,p.y-P.R*(0.4+1.2*(age-0.75)*4),P.S*(0.5+0.8*(age-0.75)*4),0.5*al,[95,85,90]); }
      c.save(); c.globalCompositeOperation="lighter";
      for(let i=0;i<90;i++){ const age=((t/300)+i/90)%1, born=t-age*300; if(born<200||born>760) continue; const p=path(Math.min(1,age)), tb=(atH(i*7)-0.5)*P.R*0.9*age+Math.sin(t/35+i*1.3)*P.S*0.18*age; B.fire(c,p.x+nx*tb,p.y+ny*tb,P.S*(0.28+0.85*age),1-age*0.8,0.8*al); }
      B.fire(c,m.x+P.d*P.S*0.2,m.y,P.S*0.55,1,0.9*al*(t<760?1:0)); c.restore(); if(t<330) return; const k=B.up(t,330,520);
      for(let i=0;i<10;i++){ const a2=i/10*Math.PI*2+t/200, rr=P.R*(1.05+0.08*Math.sin(t/50+i)); OWN.flame(c,fx+Math.cos(a2)*rr,P.gnd-P.S*0.2+Math.sin(a2)*P.R*0.25,P.S*(0.5+0.25*Math.sin(t/40+i))*eo(k)*al,Math.PI/2,outer,inner,t+i*30); }
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*1.5,[255,120,40],0.6*al); c.restore(); OWN.SS.squint(c,P,al); } },
  /* the salamander's tail flame flares and it breathes a corkscrew of fire, two flame strands twisting round each other */
  "Flame Breath":{ col:[255,140,50], atk:(t)=>({f:0,pose:t<200?"determined":t<820?"bitewide":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, m=x.self.mouth||P.o0, tail=OWN.pt(x.self,P.tg,[0.02,0.65]), al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, outer=OWN.rgb([255,100,30],0.95), inner=OWN.rgb([255,235,150],0.98);
      const e=B.up(t,0,200); OWN.flame(c,tail.x,tail.y-P.S*0.15,P.S*(0.18+0.18*e)*al,Math.PI/2,outer,inner,t); atGlowA(c,tail.x,tail.y-P.S*0.3,P.S*(0.6+0.6*e),[255,150,60],0.6*e*al); if(t<200) return;
      const end=B.lp(m,P.tg,L), dx=end.x-m.x, dy=end.y-m.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln, an=B.hv(m,P.tg);
      for(let s=0;s<2;s++) for(let i=0;i<14;i++){ const q=((t/280)+i/14)%1, ph=q*Math.PI*6-t/35+s*Math.PI, w=(P.S*0.2+P.S*0.5*q)*Math.sin(ph), z=Math.cos(ph); OWN.flame(c,m.x+dx*q+nx*w,m.y+dy*q+ny*w,P.S*(0.16+0.2*q)*(0.8+0.25*z)*al,an+Math.PI,s?outer:OWN.rgb([255,170,40],0.95),inner,t+i*20+s*70); }
      if(t<330) return; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1.1+0.2*Math.sin(t/40)),[255,130,40],0.75*al); c.restore(); for(let i=0;i<6;i++){ const a2=i/6*Math.PI*2+t/120, v=P.R*0.8; OWN.flame(c,fx+Math.cos(a2)*v,fy+Math.sin(a2)*v*0.8,P.S*0.25*al,a2+Math.PI,outer,inner,t+i*40); } OWN.SS.squint(c,P,al); } },
  /* magic smoke curls up from the lamp-tail to the djinn's hands, a gold magic circle opens in front of them, and a purple and gold beam fires through it wrapped in turning arcane symbols; a circle of symbols spins under the foe as it vanishes in starry smoke */
  "Genie Beam":{ col:[190,120,255], atk:(t)=>({f:0,pose:t<200?"slamup":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, hd=(x.self.hands&&x.self.hands.length?x.self.hands.reduce((a,h)=>P.d*h.x>P.d*a.x?h:a):null)||OWN.pt(x.self,P.tg,[0.9,0.4]), base=OWN.pt(x.self,P.tg,[0.4,0.95]), col=[190,120,255], gold=[255,215,100], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y, e=eo(B.up(t,0,220));
      for(let i=0;i<7;i++){ const q=((t/260)+i/7)%1, p={x:base.x+(hd.x-base.x)*q+Math.sin(q*8+t/80)*P.S*0.45,y:base.y+(hd.y-base.y)*q}; PF(p.x,p.y,P.S*(0.28+0.15*q),0.55*al*(t<820?1:0),i%2?col:[230,200,255]); B.sym(c,p.x,p.y,P.S*0.13,i,gold,al*Math.sin(Math.PI*q),t/200); }
      const sg={x:hd.x+P.d*P.S*0.7,y:hd.y}; B.sigil(c,sg.x,sg.y,P.S*1.2*e,gold,al*e,t/240,0.42,1);
      for(let i=0;i<6;i++){ const a2=i/6*Math.PI*2+t/300, r=P.S*1.7*e; B.sym(c,sg.x+Math.cos(a2)*r*0.45,sg.y+Math.sin(a2)*r,P.S*0.18,i,i%2?gold:[230,200,255],al*e,a2); }
      if(t<200) return; const end=B.lp(sg,P.tg,L), dx=end.x-sg.x, dy=end.y-sg.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln;
      c.save(); c.globalCompositeOperation="lighter"; B.tube(c,sg,end,P.S*0.55,col,al,0.06,t); B.tube(c,sg,end,P.S*0.25,gold,al,0,t); c.restore();
      for(let i=0;i<14;i++){ const q=((t/450)+i/14)%1; if(q>L) continue; const ph=q*Math.PI*5-t/45+i, w=Math.sin(ph)*P.S*0.9, z=Math.cos(ph); B.sym(c,sg.x+dx*q+nx*w,sg.y+dy*q+ny*w,P.S*(0.16+0.06*z),i,i%3===0?[255,255,255]:i%2?gold:[225,190,255],al*(0.6+0.4*z),t/150+i); }
      for(let s=0;s<2;s++){ c.strokeStyle=OWN.rgb(s?gold:[230,200,255],0.6*al); c.lineWidth=P.S*0.06; c.beginPath(); for(let m=0;m<=40;m++){ const q=m/40, w=Math.sin(q*Math.PI*6-t/35+s*Math.PI)*P.S*0.7; c.lineTo(sg.x+dx*q+nx*w,sg.y+dy*q+ny*w); } c.stroke(); }
      if(t<330) return; const k=B.up(t,330,880); B.sigil(c,fx,P.gnd-2,P.R*1.4*eo(Math.min(1,k*3)),col,al,-t/260,1,0.3); OWN.SS.cloud(c,PF,fx,fy,P.R*1.3,k,[col,[230,200,255],[255,230,170]],10,0.65*al,0.2);
      for(let i=0;i<10;i++){ const a2=i/10*Math.PI*2+t/300, v=P.R*(0.6+0.8*eo(k)); B.sym(c,fx+Math.cos(a2)*v,fy+Math.sin(a2)*v*0.7,P.S*0.2,i,i%2?gold:[255,255,255],al,a2); } } },
  /* three wish stars light up over the djinn, the first two spin round it and all three merge into one great golden beam; the foe is caught in a burst of wish sparkles */
  "Third Wish":{ col:[255,215,100], atk:(t)=>({f:0,pose:t<200?"slamup":t<820?"push":null,lift:-10*Math.sin(Math.PI*Math.min(1,t/900))}),
    draw(c,PF,P,t,x){ const B=OWN.BM, top=x.self.top||P.o0, col=[255,215,100], al=B.A(t), fx=P.tg.x, fy=P.tg.y, ctr={x:top.x+P.d*P.S*1.0,y:top.y-P.R*0.45};
      const stars=[0,1,2].map(i=>{ const on=B.up(t,i*55,i*55+80), a2=i/3*Math.PI*2+t/140, m=B.up(t,200,330), r=P.S*1.3*(1-m); return {x:ctr.x+Math.cos(a2)*r,y:ctr.y+Math.sin(a2)*r*0.6,on}; });
      stars.forEach((s,i)=>{ if(s.on<=0) return; atGlowA(c,s.x,s.y,P.S*0.9*s.on,col,0.7*al); OWN.star(c,s.x,s.y,P.S*0.55*s.on*(t>=330?0:1),`rgba(255,250,210,${al})`,t/60+i); c.save(); c.globalAlpha=al*s.on*(t>=330?0:1); c.font=`900 ${Math.round(P.S*0.4)}px ui-rounded, system-ui, sans-serif`; c.fillStyle="#7a4a10"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(String(i+1),s.x,s.y+1); c.restore(); });
      if(t<200) return; const L=B.L(t), end=B.lp(ctr,P.tg,L); c.save(); c.globalCompositeOperation="lighter"; B.tube(c,ctr,end,P.S*0.7,col,al,0.05,t); B.tube(c,ctr,end,P.S*0.3,[255,255,230],al,0,t); c.restore(); OWN.star(c,ctr.x,ctr.y,P.S*(0.9+0.2*Math.sin(t/40)),`rgba(255,250,220,${al})`,t/80);
      for(let i=0;i<12;i++){ const q=((t/350)+i/12)%1; if(q>L) continue; const p=B.lp(ctr,end,q); OWN.star(c,p.x+(atH(i*3)-0.5)*P.S*1.2,p.y+(atH(i*5)-0.5)*P.S*1.2,P.S*0.2*al,OWN.rgb(i%2?[255,255,255]:[255,200,120],0.95),t/40+i); }
      if(t<330) return; const k=B.up(t,330,880); for(let r=0;r<2;r++){ const q=B.up(t,380+r*120,800+r*120); if(q>0&&q<1){ for(let i=0;i<14;i++){ const a2=i/14*Math.PI*2+r*0.2, v=P.R*(0.4+1.8*eo(q)); OWN.star(c,fx+Math.cos(a2)*v,fy+Math.sin(a2)*v*0.85,P.S*0.3*(1-q),OWN.rgb(r?[255,170,220]:col,0.95),q*4+i); } OWN.CH.ring(c,fx,fy,P.R*(0.5+1.6*eo(q)),P.S*0.12*(1-q)+1,col,0.85*(1-q)); } }
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*(1.2+0.6*k),col,0.75*al); c.restore(); OWN.SS.squint(c,P,al); } },
  /* Migo's head glows pink and two wavy psychic beams weave to the foe's head, where a pink brain glow, spirals and question marks appear */
  "Mind Probe":{ col:[255,140,220], atk:(t)=>({f:0,pose:t<820?"cast":null,rot:Math.sin(t/90)*0.04}),
    draw(c,PF,P,t,x){ const B=OWN.BM, hd=x.self.top||P.o0, col=[255,140,220], al=B.A(t), L=B.L(t), fx=P.tg.x, tgt={x:fx,y:P.head.y+P.R*0.15};
      atGlowA(c,hd.x,hd.y+P.S*0.3,P.S*(0.7+0.5*B.up(t,0,200)+0.15*Math.sin(t/50)),col,0.7*al); for(let i=0;i<3;i++){ const q=((t/300)+i/3)%1; OWN.CH.ring(c,hd.x,hd.y+P.S*0.3,P.S*(0.4+1.2*q),P.S*0.05,col,0.7*al*(1-q)); } if(t<200) return;
      const dx=tgt.x-hd.x, dy=tgt.y-hd.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln; c.save(); c.globalCompositeOperation="lighter"; c.lineCap="round"; for(let s=0;s<2;s++) for(const [w,a2] of [[P.S*0.28,0.3],[P.S*0.1,0.9]]){ c.strokeStyle=OWN.rgb(s?[200,150,255]:col,a2*al); c.lineWidth=w; c.beginPath(); for(let m=0;m<=40;m++){ const q=m/40*L, ww=Math.sin(q*Math.PI*8-t/30+s*Math.PI)*P.S*0.4; c.lineTo(hd.x+dx*q+nx*ww,hd.y+dy*q+ny*ww); } c.stroke(); } c.restore();
      if(t<330) return; const k=eo(B.up(t,330,480)), bx=fx, by=P.head.y-P.R*0.5; c.save(); c.globalAlpha=al*k; atGlowA(c,bx,by,P.R*0.9,col,0.5); c.fillStyle=OWN.rg(c,bx,by,0,P.R*0.55,[[0,"#ffe0f4"],[1,"#ff8fd0"]],-P.R*0.15,-P.R*0.15); for(const [u,v] of [[-0.25,-0.05],[0.25,-0.05],[-0.12,-0.25],[0.12,-0.25],[0,0.1]]){ c.beginPath(); c.arc(bx+u*P.R,by+v*P.R,P.R*0.28,0,7); c.fill(); }
      c.strokeStyle="rgba(200,80,160,.6)"; c.lineWidth=2; c.beginPath(); c.moveTo(bx,by-P.R*0.4); c.quadraticCurveTo(bx-P.R*0.05,by-P.R*0.1,bx,by+P.R*0.25); c.stroke(); c.restore();
      for(let i=0;i<3;i++){ const q=((t-330)/450+i/3)%1; c.save(); c.globalAlpha=al*(1-q); c.font=`900 ${Math.round(P.S*(0.45+0.2*q))}px ui-rounded, system-ui, sans-serif`; c.fillStyle="#ff6fc8"; c.shadowColor="rgba(255,255,255,.9)"; c.shadowBlur=6; c.fillText("?",bx+(i-1)*P.R*0.6,by-P.R*0.4-q*P.R*0.8); c.restore(); }
      c.strokeStyle=`rgba(120,70,160,${0.9*al})`; c.lineWidth=2.4; c.lineCap="round"; for(const sd of [-1,1]){ const ex=fx+sd*P.R*0.3, ey=P.tg.y-P.R*0.25; c.beginPath(); for(let m=0;m<=14;m++){ const a2=m/14*Math.PI*3+t/70, r=P.R*0.11*m/14; c.lineTo(ex+Math.cos(a2)*r,ey+Math.sin(a2)*r); } c.stroke(); } } },
  /* Dagon's gills flare and two fans of sea spray burst from both sides of its head, carrying little fish and seaweed, and drench the foe */
  "Gill Spray":{ col:[90,200,200], atk:(t)=>({f:0,pose:t<200?"determined":t<820?"push":null,sx:t<820?1+0.05*Math.sin(Math.PI*Math.min(1,t/200)):1}),
    draw(c,PF,P,t,x){ const B=OWN.BM, gl=[OWN.pt(x.self,P.tg,[0.25,0.3]),OWN.pt(x.self,P.tg,[0.85,0.32])], col=[90,200,200], al=B.A(t), L=B.L(t), fx=P.tg.x, fy=P.tg.y;
      gl.forEach((g,j)=>{ const e=B.up(t,0,200); for(let i=0;i<3;i++){ c.strokeStyle=OWN.rgb([200,90,110],0.8*e*al); c.lineWidth=2; c.beginPath(); c.arc(g.x,g.y+i*P.S*0.12,P.S*0.2,-1,1); c.stroke(); } if(t<200) return;
        const ctl={x:(g.x+fx)/2,y:Math.min(g.y,fy)-P.R*(j?0.6:1.4)}; for(let i=0;i<26;i++){ const q=((t/420)+atH(i*3+j*7))%1; if(q>L) continue; const u=1-q, p={x:u*u*g.x+2*u*q*ctl.x+q*q*fx,y:u*u*g.y+2*u*q*ctl.y+q*q*fy}, sp=(atH(i*5+j)-0.5)*P.R*0.9*q;
          if(i%6===0) B.fish(c,p.x,p.y+sp,P.S*0.3,B.hv(g,P.tg)+Math.sin(t/40+i)*0.4,[255,170,90],al); else if(i%6===3){ c.save(); c.translate(p.x,p.y+sp); c.rotate(t/70+i); c.strokeStyle=OWN.rgb([70,160,80],0.9*al); c.lineWidth=P.S*0.07; c.beginPath(); c.moveTo(-P.S*0.25,0); c.quadraticCurveTo(0,-P.S*0.2,P.S*0.25,0); c.stroke(); c.restore(); } else OWN.drop(c,p.x,p.y+sp,P.S*(0.15+0.09*atH(i)),B.hv(g,P.tg),[120,210,220]); }
        PF(g.x+P.d*P.S*0.4,g.y,P.S*0.4,0.5*al,[200,240,240]); });
      if(t<330) return; for(let i=0;i<6;i++){ const q=((t-330)/350+i/6)%1; OWN.drop(c,fx+(i-2.5)*P.R*0.35,P.head.y+P.R*(0.3+1.5*q),P.S*0.13,Math.PI/2,[120,210,220]); } c.fillStyle=OWN.rg(c,fx,P.gnd,0,P.R*1.3,[[0,`rgba(120,210,220,${0.5*al})`],[1,"rgba(120,210,220,0)"]]); c.beginPath(); c.ellipse(fx,P.gnd,P.R*1.3,P.R*0.25,0,0,7); c.fill(); OWN.SS.squint(c,P,al); } },
  /* Hastur's sigil throws a yellow stage light on the foe; a spotlight drops on it, footlights glow along the ground, a red valance with gold fringe and tassels drops, and heavy folded curtains sweep shut over the foe and stay closed to the end (Gid, 19 Nov 2026: hold on the closed curtain) */
  "Final Act":{ col:[255,220,80], atk:(t)=>({f:0,pose:t<200?"slamup":t<820?"push":null,lift:-8*Math.sin(Math.PI*Math.min(1,t/900))}),
    draw(c,PF,P,t,x){ const B=OWN.BM, top=x.self.top||P.o0, col=[255,220,80], al=1-B.up(t,935,960), fx=P.tg.x, fy=P.tg.y, sg={x:top.x,y:top.y-P.R*0.7};
      const e=eo(B.up(t,0,200)); OWN.CH.sigil(c,sg.x,sg.y,P.R*0.5*e,col,e*al,t); if(t<200) return; const L=B.L(t), end=B.lp(sg,P.tg,L);
      c.save(); c.globalCompositeOperation="lighter"; B.tube(c,sg,end,P.S*0.45,col,al*(1-B.up(t,440,560)),0.05,t); c.restore();
      if(t<330) return; const sp=B.up(t,330,420), y0=P.head.y-P.R*2.1, y1=P.gnd+P.S*0.35, w=P.R*1.7;
      OWN.CH.spot(c,fx,P.gnd,y0-P.R*1.2,P.R*1.4,sp*al*(1-B.up(t,620,720)));
      for(let i=0;i<7;i++){ const lx=fx+(i-3)*w*0.32, f=B.up(t,340+i*20,400+i*20); c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,lx,P.gnd+P.S*0.35,P.S*0.55,[255,220,140],0.75*f*al); c.restore(); c.fillStyle=OWN.rgb([255,250,220],f*al); c.beginPath(); c.ellipse(lx,P.gnd+P.S*0.4,P.S*0.12,P.S*0.06,0,0,7); c.fill(); }
      for(let i=0;i<6;i++){ const q=((t-330)/420+i/6)%1; OWN.star(c,fx+(atH(i*3)-0.5)*w*1.6,y0+q*(P.gnd-y0),P.S*0.14*al,"rgba(255,245,200,.95)",t/60+i); }
      const ck=eo(B.up(t,400,620)); B.curtain2(c,fx,y0,y1,w,-1,ck,al,t); B.curtain2(c,fx,y0,y1,w,1,ck,al,t);
      const vd=eo(B.up(t,340,420)), vy=y0-P.S*0.6+P.S*0.9*vd-P.S*0.9; c.save(); c.globalAlpha=al*vd; c.shadowColor="rgba(40,0,10,.45)"; c.shadowBlur=8; c.fillStyle=OWN.lg(c,0,vy,0,vy+P.S*1.3,[[0,"#7a1020"],[0.6,"#c8303e"],[1,"#8a1828"]]);
      c.beginPath(); c.moveTo(fx-w*1.08,vy); c.lineTo(fx+w*1.08,vy); for(let i=3;i>=0;i--){ const xa=fx-w*1.08+(i+1)/4*w*2.16, xb=fx-w*1.08+i/4*w*2.16; c.lineTo(xa,vy+P.S*0.5); c.quadraticCurveTo((xa+xb)/2,vy+P.S*1.5,xb,vy+P.S*0.5); } c.closePath(); c.fill(); c.shadowBlur=0;
      c.strokeStyle="#f2c94c"; c.lineWidth=2.5; c.beginPath(); for(let i=0;i<4;i++){ const xa=fx-w*1.08+(i+1)/4*w*2.16, xb=fx-w*1.08+i/4*w*2.16; c.moveTo(xb,vy+P.S*0.55); c.quadraticCurveTo((xa+xb)/2,vy+P.S*1.55,xa,vy+P.S*0.55); } c.stroke();
      c.strokeStyle="rgba(242,201,76,.85)"; c.lineWidth=1.3; for(let i=0;i<4;i++){ const xa=fx-w*1.08+(i+1)/4*w*2.16, xb=fx-w*1.08+i/4*w*2.16; for(let m=1;m<10;m++){ const u=m/10, xx=xb+(xa-xb)*u, yy=vy+P.S*0.55+Math.sin(Math.PI*u)*P.S*0.95; c.beginPath(); c.moveTo(xx,yy); c.lineTo(xx,yy+P.S*0.18); c.stroke(); } }
      for(let i=0;i<=4;i++){ const xx=fx-w*1.08+i/4*w*2.16, sw=Math.sin(t/120+i)*P.S*0.06; c.strokeStyle="#d9a630"; c.lineWidth=2; c.beginPath(); c.moveTo(xx,vy+P.S*0.5); c.lineTo(xx+sw,vy+P.S*0.95); c.stroke(); c.fillStyle=OWN.lg(c,xx,vy+P.S*0.95,xx,vy+P.S*1.35,[[0,"#ffe08a"],[1,"#c8901e"]]); c.beginPath(); c.moveTo(xx+sw-P.S*0.08,vy+P.S*0.95); c.lineTo(xx+sw+P.S*0.08,vy+P.S*0.95); c.lineTo(xx+sw+P.S*0.13,vy+P.S*1.35); c.lineTo(xx+sw-P.S*0.13,vy+P.S*1.35); c.closePath(); c.fill(); c.beginPath(); c.arc(xx+sw,vy+P.S*0.92,P.S*0.08,0,7); c.fill(); }
      c.restore(); } },
  /* Yog's eyes of every size float off its body, glowing, and swarm out round the beam it fires, turning round it and all staring at the foe; they burst over the foe in a scatter of little eyes (Gid, 19 Nov 2026: eyeballs, not orbs) */
  "Spark Globe":{ col:[200,160,255], atk:(t)=>({f:0,pose:t<200?"cast":t<820?"push":null}),
    draw(c,PF,P,t,x){ const B=OWN.BM, ctr=x.self.center||P.o0, col=[200,160,255], al=B.A(t), fx=P.tg.x, fy=P.tg.y, rb=[[255,120,160],[255,190,80],[110,220,150],[90,170,255],[190,120,255],[255,150,220],[120,220,240]], SZ=[0.72,0.4,0.56,0.32,0.48,0.36,0.62], N=7, line=eo(B.up(t,120,320));
      const eye=(gx,gy,r,cc,a2,seed)=>{ if(a2<=0||r<1) return; c.save(); c.globalAlpha*=a2; c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,gx,gy,r*2.0,cc,0.6); c.restore();
        c.fillStyle=OWN.rg(c,gx,gy,0,r,[[0,"#ffffff"],[0.75,"#f4eef8"],[1,"#c8b8d8"]],-r*0.3,-r*0.3); c.beginPath(); c.arc(gx,gy,r,0,7); c.fill();
        c.strokeStyle="rgba(220,80,110,.35)"; c.lineWidth=Math.max(0.8,r*0.04); for(let v=0;v<4;v++){ const a=seed*1.3+v*1.6; c.beginPath(); c.moveTo(gx+Math.cos(a)*r*0.95,gy+Math.sin(a)*r*0.95); c.quadraticCurveTo(gx+Math.cos(a+0.3)*r*0.75,gy+Math.sin(a+0.3)*r*0.75,gx+Math.cos(a-0.1)*r*0.6,gy+Math.sin(a-0.1)*r*0.6); c.stroke(); }
        const la=Math.atan2(fy-gy,fx-gx), ld=Math.min(r*0.35,Math.hypot(fx-gx,fy-gy)), ix=gx+Math.cos(la)*r*0.35*(ld/(r*0.35)||0), iy=gy+Math.sin(la)*r*0.35*(ld/(r*0.35)||0), ir=r*0.5;
        c.fillStyle=OWN.rg(c,ix,iy,0,ir,[[0,OWN.rgb(OWN.mix(cc,[255,255,255],0.4))],[0.7,OWN.rgb(cc)],[1,OWN.rgb(OWN.mix(cc,[40,20,60],0.5))]]); c.beginPath(); c.arc(ix,iy,ir,0,7); c.fill(); c.fillStyle="#140a1e"; c.beginPath(); c.arc(ix,iy,ir*0.45,0,7); c.fill();
        c.fillStyle="#fff"; c.beginPath(); c.arc(ix-ir*0.35,iy-ir*0.38,ir*0.22,0,7); c.fill(); const bl=((t/900+seed*0.37)%1); if(bl<0.06){ const k=Math.sin(Math.PI*bl/0.06); c.fillStyle=OWN.rgb(OWN.mix(cc,[60,30,90],0.3)); c.beginPath(); c.ellipse(gx,gy-r*(1-k),r*1.02,r*k,0,0,Math.PI); c.fill(); }
        OWN.CH.shine(c,gx-r*0.4,gy-r*0.45,r*0.28,r*0.13,0.9,-0.5); c.restore(); };
      const end=B.lp(ctr,P.tg,t<200?0:B.L(t)), dx=fx-ctr.x, dy=fy-ctr.y, Ln=Math.hypot(dx,dy)||1, nx=-dy/Ln, ny=dx/Ln, gl=[];
      for(let i=0;i<N;i++){ const a2=i/N*Math.PI*2+t/180, orb={x:ctr.x+Math.cos(a2)*P.S*1.2,y:ctr.y+Math.sin(a2)*P.S*0.8}, k=((i+0.5)/N*0.85+0.08+((t-200)/2400))%0.95+0.03, ph=t/150+i*1.9, rr=P.S*(0.8+0.25*Math.sin(t/200+i)), z=Math.cos(ph);
        const bp={x:ctr.x+dx*k+nx*Math.sin(ph)*rr,y:ctr.y+dy*k+ny*Math.sin(ph)*rr}; gl.push({x:orb.x+(bp.x-orb.x)*line,y:orb.y+(bp.y-orb.y)*line,z:t<120?1:z*line+(1-line),i}); }
      const draw=(front)=>gl.forEach(g=>{ if((g.z>=0)!==front) return; eye(g.x,g.y,P.S*SZ[g.i]*(0.85+0.15*g.z),rb[g.i],al*(0.7+0.3*g.z),g.i); });
      draw(false); if(t>=200){ c.save(); c.globalCompositeOperation="lighter"; B.tube(c,ctr,end,P.S*0.26,col,al,0.04,t); c.restore(); } draw(true);
      if(t<330) return; const k=B.up(t,330,880); for(let i=0;i<10;i++){ const a2=i/10*Math.PI*2+0.3+t/400, v=P.R*(0.3+1.5*eo(k)); eye(fx+Math.cos(a2)*v,fy+Math.sin(a2)*v*0.8,P.S*(0.14+0.1*atH(i))*(1-k*0.5),rb[i%rb.length],al*(1-k*0.5),i+3); }
      c.save(); c.globalCompositeOperation="lighter"; atGlowA(c,fx,fy,P.R*1.3,col,0.6*al); c.restore(); OWN.SS.squint(c,P,al); } },
};
const OWN_PD=(t)=>Math.min(1,Math.max(0,(t-200)/100));
OWN.beamFx=(c,t,x,o)=>{ OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:[0.9,0.5]}); P.S*=2.0; OWN.GU.d=P.d; const col=o.col||[255,255,255];
    /* every beam lands with a soft bloom in its own colour and a ring when it first reaches the foe (Gid, 19 Nov 2026: bigger, more effects) */
    if(t>=330&&t<900){ const k=OWN.BM.up(t,330,620), al=OWN.BM.A(t); for(let i=0;i<6;i++){ const an=i/6*7+t/300; PF(P.tg.x+Math.cos(an)*P.R*0.5,P.tg.y+Math.sin(an)*P.R*0.4,P.R*0.45,0.35*al,col); } if(k<1) OWN.CH.ring(c,P.tg.x,P.tg.y,P.R*(0.5+1.4*eo(k)),P.S*0.1*(1-k)+1,col,0.8*(1-k)); }
    o.draw(c,PF,P,t,x); }); };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.beam) return; const K=ANIM.beam, fx1=K.fx, atk1=K.atk;
  K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&pos.name&&OWN_BEAM[pos.name], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; };
  K.fx=function(c,t,x){ const o=x&&OWN_BEAM[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ OWN.beamFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN beam",x.name,e&&e.message); } } }; })();

/* ---------- chatter, own versions (19 Nov 2026): every family sent the same white jaw-shaped outlines, so each one now sends a thing
   of its own (wind-up teeth, cursing bubbles, winged notes, a clock chime, a sour note, a falling speaker, iron filings, a sound hawk,
   an ice roar, glass shards, a screech, goat spirits, a whisper under a spotlight). Wind-up to 140 ms, travel 140-420, contact at 420,
   then 420-1060. ---------- */
OWN.CH={
  /* soft glossy look to match the Snabits: a radial gradient lit from the top left, a white shine, a soft shadow, and no dark outlines */
  grad(c,x,y,r,col){ return OWN.rg(c,x,y,r*0.05,r,[[0,OWN.rgb(OWN.mix(col,[255,255,255],0.6))],[0.55,OWN.rgb(col)],[1,OWN.rgb(OWN.mix(col,[0,0,0],0.22))]],-r*0.35,-r*0.4); },
  shine(c,x,y,rx,ry,al=0.6,rot=-0.5){ if(rx<0.5||ry<0.5) return; c.save(); c.fillStyle=`rgba(255,255,255,${al})`; c.beginPath(); c.ellipse(x,y,rx,ry,rot,0,7); c.fill(); c.restore(); },
  bubble(c,x,y,w,h,d,tint=[255,255,255],al=1){ if(w<2||al<=0) return; c.save(); c.globalAlpha*=al; c.shadowColor="rgba(70,50,100,.28)"; c.shadowBlur=h*0.28; c.shadowOffsetY=h*0.08;
    c.fillStyle=OWN.rg(c,x,y,h*0.05,w*0.6,[[0,"#fff"],[0.65,OWN.rgb(OWN.mix(tint,[255,255,255],0.45))],[1,OWN.rgb(OWN.mix(tint,[205,195,230],0.4))]],-w*0.15,-h*0.2);
    c.beginPath(); c.ellipse(x,y,w*0.5,h*0.5,0,0,7); c.fill();
    c.beginPath(); c.moveTo(x-d*w*0.14,y+h*0.36); c.quadraticCurveTo(x-d*w*0.3,y+h*0.6,x-d*w*0.46,y+h*0.72); c.quadraticCurveTo(x-d*w*0.18,y+h*0.64,x+d*w*0.06,y+h*0.42); c.fill();
    c.shadowColor="transparent"; OWN.CH.shine(c,x-w*0.24,y-h*0.24,w*0.12,h*0.08,0.85); c.restore(); },
  burst(c,x,y,w,h,col,al=1,n=10,rot=0){ if(w<2||al<=0) return; c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=al; c.shadowColor=OWN.rgb(OWN.mix(col,[40,20,40],0.4),0.35); c.shadowBlur=h*0.22; c.shadowOffsetY=h*0.06;
    c.fillStyle=OWN.rg(c,0,0,h*0.05,w*0.6,[[0,OWN.rgb(OWN.mix(col,[255,255,255],0.8))],[0.55,OWN.rgb(OWN.mix(col,[255,255,255],0.3))],[1,OWN.rgb(col)]],-w*0.12,-h*0.15);
    c.beginPath(); for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2, px=Math.cos(a)*w*0.36, py=Math.sin(a)*h*0.36; if(i===0) c.moveTo(px,py); else c.quadraticCurveTo(Math.cos(a-Math.PI/n)*w*0.62,Math.sin(a-Math.PI/n)*h*0.62,px,py); } c.closePath(); c.fill();
    c.shadowColor="transparent"; OWN.CH.shine(c,-w*0.17,-h*0.19,w*0.1,h*0.07,0.8); c.restore(); },
  grawlix(c,x,y,s,t,al=1){ if(al<=0) return; c.save(); c.globalAlpha*=al; const syms=["#","@","$","%","!","&","*"]; c.font=`900 ${Math.round(s)}px ui-rounded, system-ui, sans-serif`; c.textAlign="center"; c.textBaseline="middle"; c.shadowColor="rgba(255,255,255,.95)"; c.shadowBlur=s*0.3;
    for(let i=0;i<4;i++){ const ch=syms[(i+Math.floor(t/90))%syms.length], xx=x+(i-1.5)*s*0.6, yy=y+Math.sin(t/40+i)*s*0.08; c.fillStyle=["#ff6b80","#8a7cf2","#ffa95a","#4cc095"][i]; c.fillText(ch,xx,yy); } c.restore(); },
  vein(c,x,y,r,al){ if(al<=0) return; c.save(); c.globalAlpha*=al; c.lineCap="round"; c.shadowColor="rgba(255,90,110,.5)"; c.shadowBlur=r*0.3;
    for(const [w,col] of [[r*0.3,"#ff6b80"],[r*0.1,"#ffd0d6"]]){ c.strokeStyle=col; c.lineWidth=w; for(let i=0;i<4;i++){ c.save(); c.translate(x,y); c.rotate(i*Math.PI/2); c.beginPath(); c.moveTo(r*0.28,-r*0.28); c.quadraticCurveTo(r*0.62,-r*0.12,r*0.72,-r*0.55); c.stroke(); c.restore(); } c.shadowColor="transparent"; } c.restore(); },
  /* Chomp's own mouth in its body colour: glossy jaws, a dark mouth, small white fangs like the Snabits' own and a pink tongue */
  jaw(c,x,y,r,t,open,d,col,al=1){ if(r<2||al<=0) return; c.save(); c.translate(x,y); c.scale(d,1); c.globalAlpha*=al; const o=r*(0.06+0.3*open), W=r, H=r*0.58;
    c.shadowColor="rgba(90,30,50,.3)"; c.shadowBlur=r*0.25; c.shadowOffsetY=r*0.07;
    c.fillStyle=OWN.rg(c,0,0,r*0.05,W,[[0,"#9a3650"],[1,"#4a1426"]]); c.beginPath(); c.ellipse(0,0,W*0.84,o+H*0.22,0,0,7); c.fill(); c.shadowColor="transparent";
    c.fillStyle=OWN.rg(c,W*0.08,o*0.5,r*0.02,W*0.5,[[0,"#ffb0c2"],[1,"#e8668a"]]); c.beginPath(); c.ellipse(W*0.08,o*0.45+H*0.12,W*0.4,Math.max(2,o*0.55),0,0,7); c.fill();
    c.fillStyle="#fff"; c.strokeStyle="#fff"; c.lineJoin="round"; c.lineWidth=r*0.04;
    for(const sd of [-1,1]){ const ly=sd*(o+H*0.08); for(let i=0;i<5;i++){ const tx=-W*0.56+i*W*0.28; c.beginPath(); c.moveTo(tx-W*0.1,ly); c.lineTo(tx+W*0.1,ly); c.lineTo(tx,ly-sd*H*0.32); c.closePath(); c.fill(); c.stroke(); } }
    for(const sd of [-1,1]){ const cy=sd*(o+H*0.08); c.fillStyle=OWN.CH.grad(c,0,cy+sd*H*0.5,W*1.05,col); c.beginPath(); c.ellipse(0,cy,W,sd<0?H:H*0.8,0,sd<0?Math.PI:0,sd<0?Math.PI*2:Math.PI); c.closePath(); c.fill(); }
    OWN.CH.shine(c,-W*0.45,-(o+H*0.08)-H*0.6,W*0.22,H*0.1,0.65,-0.2); c.fillStyle="rgba(255,140,170,.55)"; c.beginPath(); c.ellipse(W*0.55,o+H*0.35,W*0.14,H*0.1,0,0,7); c.fill(); c.restore(); },
  noteG(c,x,y,s,col,rot=0,two=false,al=1){ if(s<1||al<=0) return; c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=al; const dk=OWN.mix(col,[0,0,0],0.18);
    c.shadowColor=OWN.rgb(col,0.6); c.shadowBlur=s*0.45; c.strokeStyle=OWN.rgb(dk); c.lineWidth=Math.max(2,s*0.16); c.lineCap="round"; c.lineJoin="round";
    const heads=two?[[0,0],[s*0.95,-s*0.25]]:[[0,0]];
    for(const [hx,hy] of heads){ c.beginPath(); c.moveTo(hx+s*0.4,hy-s*0.08); c.lineTo(hx+s*0.4,hy-s*1.35); c.stroke(); }
    if(two){ c.lineWidth=s*0.26; c.beginPath(); c.moveTo(s*0.4,-s*1.3); c.lineTo(s*1.35,-s*1.55); c.stroke(); } else { c.beginPath(); c.moveTo(s*0.4,-s*1.35); c.quadraticCurveTo(s*0.98,-s*1.05,s*0.78,-s*0.55); c.stroke(); }
    for(const [hx,hy] of heads){ c.fillStyle=OWN.CH.grad(c,hx,hy,s*0.55,col); c.beginPath(); c.ellipse(hx,hy,s*0.5,s*0.37,-0.4,0,7); c.fill(); }
    c.shadowColor="transparent"; for(const [hx,hy] of heads) OWN.CH.shine(c,hx-s*0.18,hy-s*0.12,s*0.15,s*0.07,0.8); c.restore(); },
  wingNote(c,x,y,s,t,col,al=1){ if(al<=0) return; c.save(); c.globalAlpha*=al; const fl=Math.sin(t/25);
    for(const sd of [-1,1]){ c.fillStyle=OWN.rg(c,x,y,s*0.1,s*1.1,[[0,"rgba(240,228,255,.95)"],[1,OWN.rgb(OWN.mix(col,[120,90,170],0.5),0.85)]]); c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+sd*s*0.6,y-s*(0.5+fl*0.4),x+sd*s*1.1,y-s*0.1*fl);
      c.quadraticCurveTo(x+sd*s*0.85,y+s*0.05,x+sd*s*0.7,y+s*0.2); c.quadraticCurveTo(x+sd*s*0.5,y+s*0.05,x+sd*s*0.35,y+s*0.2); c.closePath(); c.fill(); }
    OWN.CH.noteG(c,x,y,s*0.9,col); c.restore(); },
  speaker(c,x,y,r,t,al=1,col=[160,140,220]){ if(al<=0) return; c.save(); c.translate(x,y); c.globalAlpha*=al; c.shadowColor="rgba(50,30,80,.35)"; c.shadowBlur=r*0.35; c.shadowOffsetY=r*0.1;
    c.fillStyle=OWN.rg(c,0,0,r*0.1,r*1.4,[[0,OWN.rgb(OWN.mix(col,[255,255,255],0.5))],[0.6,OWN.rgb(col)],[1,OWN.rgb(OWN.mix(col,[0,0,0],0.25))]],-r*0.45,-r*0.55); c.beginPath(); c.roundRect(-r*0.82,-r,r*1.64,r*2,r*0.42); c.fill(); c.shadowColor="transparent";
    const pump=1+0.07*Math.sin(t/20); for(const [cy,rr] of [[-r*0.5,r*0.3],[r*0.32,r*0.5]]){ c.fillStyle=OWN.rgb(OWN.mix(col,[40,30,70],0.55)); c.beginPath(); c.arc(0,cy,rr*1.12,0,7); c.fill();
      c.fillStyle=OWN.rg(c,0,cy,rr*0.1,rr*pump,[[0,"#c8c4e0"],[0.55,"#6a6290"],[1,"#3a3456"]]); c.beginPath(); c.arc(0,cy,rr*pump,0,7); c.fill(); c.fillStyle=OWN.rg(c,0,cy,0,rr*0.3,[[0,"#ffffff"],[1,"#b8b2d8"]],-rr*0.1,-rr*0.1); c.beginPath(); c.arc(0,cy,rr*0.28,0,7); c.fill(); }
    OWN.CH.shine(c,-r*0.42,-r*0.78,r*0.22,r*0.08,0.6,-0.3); c.fillStyle="#9ff4ff"; c.shadowColor="#7ae8ff"; c.shadowBlur=r*0.2; c.beginPath(); c.arc(r*0.55,-r*0.82,r*0.07,0,7); c.fill(); c.restore(); },
  hawk(c,x,y,r,t,d,al=1){ if(al<=0) return; c.save(); c.translate(x,y); c.scale(d,1); c.globalAlpha*=al; const fl=Math.sin(t/35)*0.4; atGlowA(c,0,0,r*1.6,[255,225,150],0.35);
    c.shadowColor="rgba(255,190,90,.8)"; c.shadowBlur=r*0.35; c.fillStyle=OWN.rg(c,0,0,r*0.05,r*1.1,[[0,"rgba(255,252,235,.97)"],[0.6,"rgba(255,226,160,.92)"],[1,"rgba(240,170,80,.85)"]],r*0.3,-r*0.2);
    c.beginPath(); c.moveTo(r*0.9,0); c.lineTo(r*0.55,-r*0.12); c.quadraticCurveTo(0,-r*(0.9+fl),-r*0.55,-r*(1.1+fl)); c.quadraticCurveTo(-r*0.4,-r*0.6,-r*0.35,-r*0.5); c.quadraticCurveTo(-r*0.7,-r*0.3,-r*0.95,-r*0.15); c.quadraticCurveTo(-r*0.75,-r*0.05,-r*0.6,0);
    c.quadraticCurveTo(-r*0.8,r*0.1,-r*0.95,r*0.2); c.quadraticCurveTo(-r*0.6,r*0.2,-r*0.3,r*0.15); c.quadraticCurveTo(0,r*(0.6-fl),-r*0.4,r*(0.75-fl)); c.quadraticCurveTo(r*0.2,r*0.4,r*0.5,r*0.12); c.closePath(); c.fill(); c.shadowColor="transparent";
    c.fillStyle=OWN.rg(c,r*0.95,r*0.05,0,r*0.2,[[0,"#ffd27a"],[1,"#f09030"]]); c.beginPath(); c.moveTo(r*0.88,-r*0.02); c.quadraticCurveTo(r*1.12,r*0.02,r*1.0,r*0.14); c.lineTo(r*0.86,r*0.1); c.fill();
    c.fillStyle="#5a3418"; c.beginPath(); c.arc(r*0.7,-r*0.03,r*0.055,0,7); c.fill(); OWN.CH.shine(c,r*0.69,-r*0.05,r*0.02,r*0.02,0.95,0); c.restore(); },
  glass(c,x,y,r,rot,al=1){ if(al<=0||r<0.5) return; c.save(); c.translate(x,y); c.rotate(rot); c.globalAlpha*=al; c.shadowColor="rgba(160,230,255,.9)"; c.shadowBlur=r*0.6;
    const g=c.createLinearGradient(-r,-r*0.4,r,r*0.4); g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(0.5,"rgba(200,240,255,.75)"); g.addColorStop(1,"rgba(140,210,245,.7)"); c.fillStyle=g;
    c.beginPath(); c.moveTo(r,0); c.lineTo(-r*0.3,-r*0.45); c.lineTo(-r*0.8,r*0.1); c.lineTo(-r*0.1,r*0.35); c.closePath(); c.fill(); c.shadowColor="transparent";
    c.strokeStyle="rgba(255,255,255,.85)"; c.lineWidth=Math.max(1,r*0.08); c.lineCap="round"; c.beginPath(); c.moveTo(r*0.5,-r*0.05); c.lineTo(-r*0.2,-r*0.25); c.stroke(); c.restore(); },
  goat(c,x,y,r,t,d,al=1){ if(al<=0) return; c.save(); c.translate(x,y+Math.sin(t/60)*r*0.1); c.scale(d,1); c.globalAlpha*=al; atGlowA(c,0,0,r*1.4,[120,60,160],0.4);
    const body=OWN.rg(c,0,0,r*0.05,r*1.0,[[0,"rgba(110,80,150,.95)"],[0.6,"rgba(60,36,90,.92)"],[1,"rgba(30,16,48,.85)"]],-r*0.2,-r*0.3); c.fillStyle=body;
    c.beginPath(); c.ellipse(0,0,r*0.55,r*0.42,0,0,7); c.fill(); c.beginPath(); c.moveTo(r*0.35,-r*0.12); c.quadraticCurveTo(r*0.95,r*0.05,r*0.85,r*0.4); c.quadraticCurveTo(r*0.6,r*0.58,r*0.3,r*0.3); c.fill();
    c.fillStyle="rgba(40,22,62,.85)"; for(let i=0;i<5;i++){ const xx=-r*0.5+i*r*0.22; c.beginPath(); c.moveTo(xx-r*0.04,r*0.28); c.quadraticCurveTo(xx-r*0.12,r*(0.6+Math.sin(t/40+i)*0.1),xx-r*0.06,r*(0.85+Math.sin(t/40+i)*0.15)); c.quadraticCurveTo(xx+r*0.04,r*0.55,xx+r*0.1,r*0.32); c.fill(); }
    c.lineCap="round"; for(const sd of [-1,1]){ c.strokeStyle="rgba(215,200,235,.95)"; c.lineWidth=r*0.15; c.beginPath(); c.moveTo(r*0.05,-r*0.3); c.bezierCurveTo(-r*0.3,-r*1.0+sd*r*0.1,-r*0.9,-r*0.8,-r*0.75,-r*0.25+sd*r*0.1); c.stroke();
      c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=r*0.05; c.stroke(); }
    c.shadowColor="#ffe060"; c.shadowBlur=r*0.3; c.fillStyle="#ffe46a"; c.beginPath(); c.ellipse(r*0.38,-r*0.05,r*0.11,r*0.075,0,0,7); c.fill(); c.shadowColor="transparent"; c.fillStyle="#3a2050"; c.beginPath(); c.roundRect(r*0.31,-r*0.07,r*0.15,r*0.035,r*0.017); c.fill();
    c.fillStyle="rgba(150,40,70,.85)"; c.beginPath(); c.ellipse(r*0.75,r*0.38,r*0.12,r*0.06+Math.abs(Math.sin(t/50))*r*0.06,0,0,7); c.fill(); c.restore(); },
  spot(c,x,gy,top,w,al){ if(al<=0) return; c.save(); const g=c.createLinearGradient(0,top,0,gy); g.addColorStop(0,`rgba(255,240,170,${0.05*al})`); g.addColorStop(1,`rgba(255,235,150,${0.42*al})`); c.fillStyle=g; c.beginPath(); c.moveTo(x-w*0.15,top); c.lineTo(x+w*0.15,top); c.lineTo(x+w,gy); c.lineTo(x-w,gy); c.closePath(); c.fill();
    c.fillStyle=OWN.rg(c,x,gy,0,w,[[0,`rgba(255,245,190,${0.5*al})`],[1,"rgba(255,235,150,0)"]]); c.beginPath(); c.ellipse(x,gy,w,w*0.2,0,0,7); c.fill(); c.restore(); },
  sign(c,x,y,r,col,al){ if(al<=0) return; c.save(); c.globalAlpha*=al; c.shadowColor=OWN.rgb(col,0.9); c.shadowBlur=r*0.5; c.strokeStyle=OWN.rgb(col); c.lineWidth=Math.max(2,r*0.16); c.lineCap="round"; c.beginPath(); c.arc(x,y-r*0.2,r*0.35,Math.PI*0.2,Math.PI*1.7); c.moveTo(x,y+r*0.15); c.lineTo(x,y+r);
    c.moveTo(x,y+r*0.5); c.quadraticCurveTo(x-r*0.6,y+r*0.4,x-r*0.7,y+r*0.9); c.moveTo(x,y+r*0.5); c.quadraticCurveTo(x+r*0.6,y+r*0.4,x+r*0.7,y+r*0.9); c.stroke(); c.restore(); },
  ring(c,x,y,r,w,col,al){ if(al<=0||r<=1) return; c.save(); c.shadowColor=OWN.rgb(col,al); c.shadowBlur=w*1.6; c.strokeStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.3),al*0.6); c.lineWidth=w; c.beginPath(); c.arc(x,y,r,0,7); c.stroke();
    c.shadowBlur=0; c.strokeStyle=OWN.rgb([255,255,255],al*0.65); c.lineWidth=w*0.3; c.beginPath(); c.arc(x,y,r,0,7); c.stroke(); c.restore(); },
  clock(c,x,y,s,t){ c.save(); c.translate(x,y); c.shadowColor="rgba(255,200,80,.7)"; c.shadowBlur=s*0.5; c.fillStyle=OWN.rg(c,0,0,s*0.05,s*0.6,[[0,"#fffdf6"],[0.7,"#fbefcf"],[1,"#eed49a"]],-s*0.2,-s*0.2); c.beginPath(); c.arc(0,0,s*0.55,0,7); c.fill(); c.shadowColor="transparent";
    const g=c.createLinearGradient(-s*0.6,-s*0.6,s*0.6,s*0.6); g.addColorStop(0,"#ffeaa0"); g.addColorStop(1,"#d6a440"); c.strokeStyle=g; c.lineWidth=s*0.12; c.beginPath(); c.arc(0,0,s*0.55,0,7); c.stroke();
    c.fillStyle="rgba(140,100,50,.7)"; for(let i=0;i<12;i++){ const an=i/12*Math.PI*2; c.beginPath(); c.arc(Math.cos(an)*s*0.42,Math.sin(an)*s*0.42,i%3?s*0.025:s*0.05,0,7); c.fill(); }
    c.strokeStyle="#8a6430"; c.lineCap="round"; c.lineWidth=s*0.07; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(t/50)*s*0.36,Math.sin(t/50)*s*0.36); c.stroke(); c.lineWidth=s*0.09; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(t/400)*s*0.24,Math.sin(t/400)*s*0.24); c.stroke();
    c.fillStyle="#d6a440"; c.beginPath(); c.arc(0,0,s*0.06,0,7); c.fill(); OWN.CH.shine(c,-s*0.25,-s*0.3,s*0.15,s*0.06,0.7); c.restore(); },
  bang(c,x,y,w,col,al=1){ c.save(); c.globalAlpha*=al; c.fillStyle=col; for(let i=0;i<3;i++){ const bx=x+(i-1)*w*0.22; c.beginPath(); c.roundRect(bx-w*0.05,y-w*0.14,w*0.1,w*0.18,w*0.05); c.fill(); c.beginPath(); c.arc(bx,y+w*0.12,w*0.045,0,7); c.fill(); } c.restore(); }
};
const OWN_CHAT={
  "Chatter":{
    wind(c,PF,t,P,x,a){ const k=t/140; OWN.CH.jaw(c,a.x+P.d*P.S*0.2,a.y,P.S*0.55*eo(k),t,Math.abs(Math.sin(t/25)),P.d,P.body||[240,110,140]); },
    fly(c,PF,k,P,x,a,h,t){ const hop=Math.abs(Math.sin(k*Math.PI*3)), p={x:a.x+(h.x-a.x)*k,y:a.y+(h.y-a.y)*k-hop*P.R*0.5}; OWN.CH.jaw(c,p.x,p.y,P.S*0.6,t,Math.abs(Math.sin(t/20)),P.d,P.body||[240,110,140]);
      for(let i=0;i<3;i++){ const f=Math.floor(k*3)-i; if(f<0) continue; const fx=a.x+(h.x-a.x)*(f/3); c.fillStyle="rgba(255,255,255,.4)"; c.beginPath(); c.ellipse(fx,a.y+(h.y-a.y)*(f/3)+P.S*0.5,P.S*0.25,P.S*0.06,0,0,7); c.fill(); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2; const p={x:P.tg.x-P.d*R*0.3+Math.sin(k*30)*R*0.08,y:P.tg.y-R*0.3}; OWN.CH.jaw(c,p.x,p.y,P.S*0.6,t,Math.abs(Math.sin(t/16)),P.d,P.body||[240,110,140],al);
      for(let i=0;i<4;i++){ const q=((k*3)+i/4)%1; if(q>0.5) continue; const an=i*1.6; c.strokeStyle=`rgba(255,255,255,${(1-q*2)*al})`; c.lineWidth=3; c.lineCap="round"; c.beginPath(); c.moveTo(p.x+Math.cos(an)*R*0.5,p.y+Math.sin(an)*R*0.5); c.lineTo(p.x+Math.cos(an)*R*(0.65+q),p.y+Math.sin(an)*R*(0.65+q)); c.stroke(); }
      for(let i=0;i<3;i++){ const px=P.tg.x+(atH(i)-0.5)*R, py=P.tg.y+(atH(i*3)-0.3)*R*0.6; c.strokeStyle=`rgba(255,107,128,${0.8*al*Math.min(1,k*3)})`; c.lineWidth=2.5; c.lineCap="round"; c.beginPath(); c.arc(px,py,R*0.08,0.2,Math.PI-0.2); c.stroke(); } } },
  "Trash Talk":{
    wind(c,PF,t,P,x,a){ const k=t/140; OWN.CH.bubble(c,a.x+P.d*P.S*0.6,a.y-P.S*0.9,P.S*1.4*eo(k),P.S*0.9*eo(k),P.d); if(k>0.5) OWN.CH.grawlix(c,a.x+P.d*P.S*0.6,a.y-P.S*0.9,P.S*0.38,t); },
    fly(c,PF,k,P,x,a,h,t){ for(let i=0;i<3;i++){ const kk=k*1.3-i*0.15; if(kk<0||kk>1) continue; const p=OWN.DR.pos({x:a.x+P.d*P.S*0.6,y:a.y-P.S*0.9},{x:h.x,y:h.y-P.R*(0.2+0.3*i)},eo(kk),P.R,0.8), w=P.S*(1.7+0.25*i);
        if(i===2) OWN.CH.burst(c,p.x,p.y,w,w*0.72,[255,120,140]); else OWN.CH.bubble(c,p.x,p.y,w,w*0.62,P.d,i===1?[255,236,200]:[255,255,255]); OWN.CH.grawlix(c,p.x,p.y,P.S*0.46,t+i*50); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2; for(let i=0;i<3;i++){ const an=-Math.PI/2+(i-1)*0.9, v=R*(0.6+0.9*eo(k)), p={x:P.tg.x+Math.cos(an)*v,y:P.tg.y-R*0.4+Math.sin(an)*v*0.6}; if(i===1) OWN.CH.burst(c,p.x,p.y,P.S*1.2*(1-k*0.3),P.S*0.85*(1-k*0.3),[255,120,140],al*(1-k*0.5)); else OWN.CH.bubble(c,p.x,p.y,P.S*1.2*(1-k*0.3),P.S*0.75*(1-k*0.3),-P.d,[255,255,255],al*(1-k*0.5)); OWN.CH.grawlix(c,p.x,p.y,P.S*0.3,t+i*40,al*(1-k*0.5)); }
      OWN.CH.vein(c,P.tg.x+P.d*R*0.45,P.head.y-R*0.1,R*0.28,al); if(k<0.4){ c.strokeStyle=`rgba(255,255,255,${1-k/0.4})`; c.lineWidth=3; c.lineCap="round"; for(let i=0;i<6;i++){ const an=i/6*7; c.beginPath(); c.moveTo(P.tg.x+Math.cos(an)*R*0.6,P.tg.y+Math.sin(an)*R*0.6); c.lineTo(P.tg.x+Math.cos(an)*R*(0.8+k),P.tg.y+Math.sin(an)*R*(0.8+k)); c.stroke(); } } } },
  "Bat Song":{
    wind(c,PF,t,P,x,a){ const k=t/140; for(let i=0;i<3;i++){ const an=t/30+i*2.1; OWN.CH.wingNote(c,a.x+Math.cos(an)*P.S*0.7*k,a.y-P.S*0.5+Math.sin(an)*P.S*0.3*k,P.S*0.45,t+i*30,[200,130,255]); } },
    fly(c,PF,k,P,x,a,h,t){ for(let i=0;i<5;i++){ const kk=Math.min(1,k*1.2-i*0.05); if(kk<0) continue; const p=OWN.GU.path(a,{x:h.x,y:h.y-P.R*0.4+(i-2)*P.R*0.2},kk,P.R,0.5,P.S*0.5,t,i*1.3); OWN.CH.wingNote(c,p.x,p.y,P.S*0.8,t+i*40,[[200,130,255],[255,130,200],[130,170,255]][i%3]); }
      for(let i=0;i<6;i++){ const q=OWN.GU.path(a,h,Math.max(0,k-i*0.06),P.R,0.5); OWN.star(c,q.x,q.y+(atH(i)-0.5)*P.S,P.S*0.1,"rgba(230,200,255,.9)",t/40+i); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2; for(let i=0;i<5;i++){ const an=t/120+i*1.26; OWN.CH.wingNote(c,P.tg.x+Math.cos(an)*R*0.9,P.head.y-R*0.35+Math.sin(an)*R*0.3,P.S*0.7,t+i*40,[[200,130,255],[255,130,200],[130,170,255]][i%3],al); }
      for(let i=0;i<2;i++){ const an=t/90+i*Math.PI; c.strokeStyle=`rgba(200,140,255,${al})`; c.lineWidth=2; c.beginPath(); for(let j=0;j<=12;j++){ const f=j/12, aa=an+f*5, rr=R*0.12*f; c.lineTo(P.tg.x+(i-0.5)*R*0.5+Math.cos(aa)*rr,P.tg.y-R*0.3+Math.sin(aa)*rr); } c.stroke(); } } },
  "Echo Burst":{
    wind(c,PF,t,P,x,a){ const k=t/140; atGlowA(c,a.x,a.y,P.S*1.2,[190,120,255],0.6*k); },
    fly(c,PF,k,P,x,a,h,t){ for(let i=0;i<4;i++){ const kk=k*1.4-i*0.18; if(kk<0||kk>1) continue; const cx=a.x+(h.x-a.x)*kk, r=P.S*(0.6+0.9*kk); c.save(); c.translate(cx,a.y+(h.y-a.y)*kk); c.scale(P.d,1);
        const g=c.createRadialGradient(-r*0.4,0,r*0.2,0,0,r); g.addColorStop(0,"rgba(140,70,220,0)"); g.addColorStop(0.75,"rgba(170,110,255,.65)"); g.addColorStop(1,"rgba(240,220,255,.95)"); c.fillStyle=g; c.beginPath(); c.arc(0,0,r,-1.1,1.1); c.arc(-r*0.35,0,r*0.75,1.0,-1.0,true); c.closePath(); c.fill();
        OWN.GU.bat(c,-r*0.25,0,r*0.22,t+i*30,[60,30,100]); c.restore(); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R; for(let i=0;i<4;i++){ const q=k*1.6-i*0.2; if(q<0||q>1) continue; const back=i%2, cx=P.tg.x-P.d*(back?q*R*1.4:R*0.2), r=R*(0.9-0.15*i)*(1+q*0.4); c.save(); c.translate(cx,P.tg.y); c.scale(back?-P.d:P.d,1); c.strokeStyle=`rgba(200,150,255,${0.85*(1-q)})`; c.lineWidth=R*0.18*(1-q*0.5); c.beginPath(); c.arc(0,0,r,-1.1,1.1); c.stroke(); c.restore(); }
      for(let i=0;i<4;i++){ const an=t/60+i*1.57; OWN.GU.bat(c,P.tg.x+Math.cos(an)*R*1.0,P.tg.y-R*0.3+Math.sin(an)*R*0.4,P.S*0.3,t+i*40,[60,30,100],1-k); } } },
  "Chime":{
    wind(c,PF,t,P,x,a){ const k=t/140; for(let i=0;i<2;i++){ const sw=Math.sin(t/30+i*Math.PI)*0.4; OWN.MT.item(c,x,"bell2",a.x+(i-0.5)*P.S*0.9,a.y-P.S*0.9,P.S*0.35*eo(k),sw,t); } },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.DR.pos(a,h,eo(k),P.R,0.2); for(let i=0;i<3;i++){ const r=P.S*(0.6+0.35*i)*(0.7+0.5*k); OWN.CH.ring(c,p.x,p.y,r,P.S*0.14,[255,210,80],0.85-i*0.2); }
      OWN.CH.clock(c,p.x,p.y,P.S,t);
      for(let i=0;i<3;i++){ const q=OWN.DR.pos(a,h,eo(Math.max(0,k-0.1-i*0.08)),P.R,0.2); OWN.CH.noteG(c,q.x,q.y-P.S*0.4,P.S*0.35,[255,205,80],Math.sin(t/50+i)*0.3,i%2===1); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R; for(let i=0;i<4;i++){ const q=Math.max(0,k-i*0.1); if(q<=0||q>=1) continue; OWN.CH.ring(c,P.tg.x,P.tg.y-R*0.2,R*(0.5+1.5*eo(q)),R*0.14*(1-q),[255,210,80],1-q); }
      for(let i=0;i<5;i++){ const an=-Math.PI/2+(i-2)*0.6, v=R*(0.8+0.8*eo(k)); OWN.MT.item(c,x,"bell2",P.tg.x+Math.cos(an)*v,P.tg.y-R*0.4+Math.sin(an)*v*0.6+k*k*R,P.S*0.22,Math.sin(t/25+i)*0.5,t); }
      OWN.bonk(c,P.head.x,P.head.y,R*0.8,k); } },
  "Sour Note":{
    wind(c,PF,t,P,x,a){ const k=t/140; OWN.CH.sour(c,a.x+P.d*P.S*0.3,a.y-P.S*0.6,P.S*0.7*eo(k),t); },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.GU.path({x:a.x+P.d*P.S*0.3,y:a.y-P.S*0.6},h,k,P.R,0.4,P.S*0.6,t); OWN.CH.sour(c,p.x,p.y,P.S*1.1,t);
      for(let i=0;i<5;i++){ const q=OWN.GU.path({x:a.x,y:a.y-P.S*0.6},h,Math.max(0,k-0.08-i*0.06),P.R,0.4,P.S*0.6,t); PF(q.x,q.y,P.S*0.3,0.45,[180,230,90]); OWN.DR.tear(c,q.x,q.y+P.S*0.3,P.S*0.07,Math.PI/2,[170,230,70],0.8); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2; if(k<0.45) OWN.CH.sour(c,h.x,h.y-k*R,P.S*0.8*(1-k/0.45*0.4),t,1-k/0.45); for(let i=0;i<6;i++){ const q=((k*2)+i/6)%1; PF(P.tg.x+(atH(i)-0.5)*R*1.3,P.tg.y-R*0.3-q*R*1.2,P.S*(0.25+0.3*q),0.5*(1-k)*(1-q),[190,235,110]); }
      c.strokeStyle=`rgba(60,80,20,${al})`; c.lineWidth=2.6; c.lineCap="round"; const ey=P.tg.y-R*0.25; for(const sd of [-1,1]){ const ex=P.tg.x+sd*R*0.32; c.beginPath(); c.moveTo(ex-R*0.12,ey); c.quadraticCurveTo(ex,ey-R*0.1,ex+R*0.12,ey); c.stroke(); }
      c.beginPath(); for(let i=0;i<=6;i++) c.lineTo(P.tg.x-R*0.25+i*R*0.083,P.tg.y+R*0.12+(i%2?-1:1)*R*0.04); c.stroke(); } },
  "Bass Drop":{
    wind(c,PF,t,P,x,a){ const k=t/140; OWN.CH.speaker(c,P.tg.x,P.tg.y-P.R*3-P.S*(1-k),P.S*0.6,t,k); },
    fly(c,PF,k,P,x,a,h,t){ const y0=P.tg.y-P.R*3, y1=P.head.y-P.S*0.7, y=y0+(y1-y0)*ei(k); for(let i=0;i<3;i++){ const q=((t/90)+i/3)%1; OWN.CH.ring(c,P.tg.x,y,P.S*(0.7+1.2*q),P.S*0.12,[120,220,255],0.7*(1-q)); } OWN.CH.speaker(c,P.tg.x,y,P.S*0.75,t);
      c.strokeStyle="rgba(255,255,255,.7)"; c.lineWidth=2; for(let i=-1;i<=1;i++){ c.beginPath(); c.moveTo(P.tg.x+i*P.S*0.4,y-P.S*1.0); c.lineTo(P.tg.x+i*P.S*0.4,y-P.S*(1.6+0.4*Math.abs(i))); c.stroke(); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, y=P.head.y-P.S*0.7+(k<0.15?Math.sin(k/0.15*Math.PI)*R*0.2:0), al=k<0.75?1:(1-k)/0.25; OWN.CH.speaker(c,P.tg.x,y,P.S*0.75,t*3,al);
      for(let i=0;i<4;i++){ const q=((k*2.5)+i/4)%1; c.strokeStyle=`rgba(120,220,255,${0.8*(1-q)*al})`; c.lineWidth=4*(1-q)+1; c.beginPath(); c.ellipse(P.tg.x,P.gnd+2,R*(0.4+1.6*q),R*(0.1+0.3*q),0,0,7); c.stroke(); }
      for(let i=0;i<8;i++) PF(P.tg.x+(atH(i)-0.5)*R*2,P.gnd-R*0.2*atH(i*3),P.S*0.4,0.5*(1-k),[205,190,165]); OWN.MT.debris(c,{x:P.tg.x,y:P.gnd-R*0.2},R,k,[130,115,100],8,0.08,3); } },
  "Hum":{
    wind(c,PF,t,P,x,a){ const k=t/140; OWN.CH.field(c,a.x,a.y,P.S*1.2*eo(k),t,1,P.d); },
    fly(c,PF,k,P,x,a,h,t){ OWN.CH.field(c,a.x+(h.x-a.x)*eo(k)*0.5,a.y+(h.y-a.y)*eo(k)*0.5,P.S*(1.2+1.6*k),t,1,P.d);
      for(let i=0;i<24;i++){ const f=((t/300)+atH(i))%1; if(f>k) continue; const p=OWN.DR.pos(a,h,f,P.R,0.3); c.save(); c.translate(p.x+(atH(i*3)-0.5)*P.S*1.4,p.y+(atH(i*5)-0.5)*P.S*1.4); c.rotate(Math.atan2(h.y-a.y,h.x-a.x)+Math.sin(t/20+i)*0.4); c.fillStyle="#9494b0"; c.beginPath(); c.roundRect(-P.S*0.1,-1.8,P.S*0.2,3.6,1.8); c.fill(); c.restore(); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2; OWN.CH.field(c,P.tg.x,P.tg.y,R*1.3,t*2,al,P.d); for(let i=0;i<30;i++){ const an=atH(i)*Math.PI*2, rr=R*(0.7+0.5*atH(i*3)); c.save(); c.translate(P.tg.x+Math.cos(an)*rr+Math.sin(t/10+i)*2,P.tg.y+Math.sin(an)*rr*0.8); c.rotate(an+Math.PI/2); c.fillStyle=`rgba(148,148,176,${al})`; c.beginPath(); c.roundRect(-R*0.09,-1.8,R*0.18,3.6,1.8); c.fill(); c.restore(); }
      c.strokeStyle=`rgba(255,255,255,${0.8*al})`; c.lineWidth=1.6; for(let i=0;i<3;i++){ c.beginPath(); for(let j=0;j<=10;j++) c.lineTo(P.tg.x-R*0.9+j*R*0.18,P.head.y-R*(0.5+i*0.12)+(j%2?-3:3)); c.stroke(); } } },
  "Hawk Cry":{
    wind(c,PF,t,P,x,a){ const k=t/140; atGlowA(c,a.x,a.y,P.S*1.2,[255,220,150],0.6*k); OWN.CH.hawk(c,a.x+P.d*P.S*0.5,a.y-P.S*0.3,P.S*0.6*eo(k),t,P.d,k); },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.GU.path(a,h,k,P.R,0.9); for(let j=1;j<6;j++){ const q=OWN.GU.path(a,h,Math.max(0,k-j*0.05),P.R,0.9); PF(q.x,q.y,P.S*(0.5-j*0.07),0.45,[255,235,190]); } OWN.CH.hawk(c,p.x,p.y,P.S*1.0,t,P.d);
      for(let i=0;i<3;i++){ const q=OWN.GU.path(a,h,Math.max(0,k-0.1-i*0.1),P.R,0.9); OWN.CH.ring(c,q.x,q.y,P.S*(0.3+i*0.2),P.S*0.08,[255,220,150],0.6-i*0.15); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R; if(k<0.4){ const q=k/0.4; OWN.CH.hawk(c,h.x+P.d*q*R*1.2,h.y-q*R*1.5,P.S*1.0,t,P.d,1-q); } for(let i=0;i<3;i++){ const q=Math.max(0,k-i*0.12); if(q<=0||q>=1) continue; OWN.CH.ring(c,P.tg.x,P.tg.y,R*(0.5+1.4*eo(q)),R*0.12*(1-q),[255,220,150],1-q); }
      OWN.GU.scatter(6,h,R,k,(q,i)=>OWN.GU.feather(c,q.x,q.y,P.S*0.25,k*8+i,i%2?[160,110,60]:[245,240,225],1-k)); for(let i=0;i<4;i++){ const an=-Math.PI/2+(i-1.5)*0.5; c.strokeStyle=`rgba(255,255,255,${0.9*(1-k)})`; c.lineWidth=2.5; c.beginPath(); c.moveTo(P.tg.x+Math.cos(an)*R*0.7,P.head.y+Math.sin(an)*R*0.4); c.lineTo(P.tg.x+Math.cos(an)*R*1.0,P.head.y+Math.sin(an)*R*0.7); c.stroke(); } } },
  "Scary Roar":{
    wind(c,PF,t,P,x,a){ const k=t/140; for(let i=0;i<4;i++) PF(a.x+P.d*P.S*0.3*i*k,a.y,P.S*0.35,0.5*k,[230,245,255]); },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.DR.pos(a,h,eo(k),P.R,0.1), w=P.S*(1.4+1.4*k); OWN.CH.burst(c,p.x,p.y,w,w*0.75,[150,200,245],1,11);
      for(let i=0;i<5;i++){ const an=i/5*Math.PI*2+0.3; OWN.GU.shard(c,p.x+Math.cos(an)*w*0.5,p.y+Math.sin(an)*w*0.38,P.S*0.25,an,1); } for(let i=0;i<8;i++){ const q=OWN.DR.pos(a,h,eo(Math.max(0,k-i*0.05)),P.R,0.1); OWN.GU.flake(c,q.x+(atH(i)-0.5)*P.S,q.y+(atH(i*3)-0.5)*P.S,P.S*0.12,t/30+i); }
      OWN.CH.bang(c,p.x,p.y,w,"#5a88c8"); },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2; for(let i=0;i<10;i++) PF(P.tg.x+P.d*R*(0.2+0.8*eo(k))+(atH(i)-0.5)*R,P.tg.y+(atH(i*3)-0.5)*R*1.3,P.S*0.5,0.65*(1-k),[230,245,255]);
      OWN.DR.coat(c,P,Math.min(1,k*2),[220,240,255],0.5*al,true,3,7); for(let i=0;i<6;i++) OWN.GU.shard(c,P.tg.x+(atH(i*3)-0.5)*R*1.6,P.tg.y+(atH(i*5)-0.2)*R,R*0.2*eo(Math.min(1,k*3)),-Math.PI/2+(atH(i)-0.5),al);
      c.strokeStyle=`rgba(110,150,200,${al})`; c.lineWidth=2.5; c.lineCap="round"; for(let i=0;i<5;i++){ const xx=P.tg.x+(i-2)*R*0.22, yy=P.head.y-R*0.2; c.beginPath(); c.moveTo(xx,yy); c.lineTo(xx+Math.sin(t/15+i)*3,yy-R*0.3); c.stroke(); } } },
  "Shrill Note":{
    wind(c,PF,t,P,x,a){ const k=t/140; atGlowA(c,a.x,a.y,P.S*0.9,[180,240,255],0.7*k); OWN.CH.noteG(c,a.x+P.d*P.S*0.4,a.y-P.S*0.5,P.S*0.4*eo(k),[130,215,240],0,true); },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.DR.pos(a,h,eo(k),P.R,0.05); c.save(); c.translate(p.x,p.y); c.rotate(P.d>0?0:Math.PI); c.shadowColor="rgba(150,230,255,.9)"; c.shadowBlur=P.S*0.4; const dg=c.createLinearGradient(-P.S*0.6,0,P.S,0); dg.addColorStop(0,"rgba(150,215,245,.75)"); dg.addColorStop(1,"rgba(255,255,255,.98)"); c.fillStyle=dg; c.beginPath(); c.moveTo(P.S*1.0,0); c.lineTo(-P.S*0.6,-P.S*0.35); c.lineTo(-P.S*0.3,0); c.lineTo(-P.S*0.6,P.S*0.35); c.closePath(); c.fill(); c.restore();
      for(let i=0;i<8;i++){ const q=OWN.DR.pos(a,h,eo(Math.max(0,k-i*0.05)),P.R,0.05); OWN.CH.glass(c,q.x+(atH(i)-0.5)*P.S,q.y+(atH(i*3)-0.5)*P.S*0.8,P.S*0.18,t/40+i); } for(let i=0;i<3;i++) OWN.CH.noteG(c,p.x-P.d*P.S*(0.6+i*0.5),p.y-P.S*0.5,P.S*0.3,[130,215,240],0,true); },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2; c.strokeStyle=`rgba(255,255,255,${0.95*al})`; c.lineWidth=2.5; c.lineCap="round"; c.lineJoin="round"; c.shadowColor="rgba(160,230,255,.9)"; c.shadowBlur=6; for(let i=0;i<8;i++){ const an=i/8*7+0.3; c.beginPath(); c.moveTo(h.x,h.y); let px=h.x, py=h.y; for(let j=1;j<=3;j++){ px+=Math.cos(an+(atH(i*3+j)-0.5)*0.8)*R*0.25*eo(Math.min(1,k*3)); py+=Math.sin(an+(atH(i*5+j)-0.5)*0.8)*R*0.25*eo(Math.min(1,k*3)); c.lineTo(px,py); } c.stroke(); }
      OWN.GU.scatter(10,h,R,k,(q,i)=>OWN.CH.glass(c,q.x,q.y+k*R*0.6,P.S*0.18,k*8+i,1-k)); for(let i=0;i<3;i++){ const q=Math.max(0,k-i*0.1); if(q<=0||q>=1) continue; OWN.CH.ring(c,P.tg.x,P.tg.y,R*(0.5+1.2*q),R*0.08,[180,240,255],1-q); } } },
  "Sky Screech":{
    wind(c,PF,t,P,x,a){ const k=t/140; for(let i=0;i<4;i++) OWN.GU.feather(c,a.x+(i-1.5)*P.S*0.4,a.y-P.S*0.5*k,P.S*0.28,-Math.PI/2+(i-1.5)*0.3,[230,190,90]); },
    fly(c,PF,k,P,x,a,h,t){ const p=OWN.DR.pos(a,h,eo(k),P.R,0.15), w=P.S*(1.2+1.2*k); OWN.CH.burst(c,p.x,p.y,w,w*0.7,[255,195,70],1,11);
      c.strokeStyle="rgba(200,120,40,.85)"; c.lineWidth=3; c.lineCap="round"; for(let i=0;i<3;i++){ c.beginPath(); for(let j=0;j<=6;j++) c.lineTo(p.x-w*0.3+j*w*0.1,p.y+(i-1)*w*0.12+(j%2?-w*0.05:w*0.05)); c.stroke(); }
      OWN.GU.ride(8,a,h,k,t,P,(q,i)=>OWN.GU.feather(c,q.x,q.y,P.S*0.28,(P.d>0?0:Math.PI)+Math.sin(t/50+i)*0.9,i%2?[230,190,90]:[245,240,225]),0.8,0.05); },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2; for(let i=0;i<12;i++){ const an=i/12*Math.PI*2, L=R*(0.8+0.6*eo(k))*(i%2?0.7:1); c.fillStyle=`rgba(255,220,90,${0.9*(1-k)})`; c.beginPath(); c.moveTo(P.tg.x+Math.cos(an-0.12)*R*0.5,P.tg.y+Math.sin(an-0.12)*R*0.5); c.lineTo(P.tg.x+Math.cos(an)*L,P.tg.y+Math.sin(an)*L); c.lineTo(P.tg.x+Math.cos(an+0.12)*R*0.5,P.tg.y+Math.sin(an+0.12)*R*0.5); c.fill(); }
      OWN.GU.scatter(8,h,R,k,(q,i)=>OWN.GU.feather(c,q.x,q.y,P.S*0.26,k*8+i,i%2?[230,190,90]:[245,240,225],1-k)); OWN.SS.squint(c,P,al); } },
  "Dark Bleat":{
    wind(c,PF,t,P,x,a){ const k=t/140; PF(a.x,a.y,P.S*(0.4+0.6*k),0.6,[40,25,55]); },
    fly(c,PF,k,P,x,a,h,t){ for(let i=0;i<3;i++){ const kk=Math.min(1,k*1.2-i*0.12); if(kk<0) continue; const p=OWN.GU.path(a,{x:h.x,y:h.y+(i-1)*P.R*0.4},kk,P.R,0.3,P.S*0.4,t,i*2); for(let j=1;j<5;j++){ const q=OWN.GU.path(a,{x:h.x,y:h.y+(i-1)*P.R*0.4},Math.max(0,kk-j*0.05),P.R,0.3,P.S*0.4,t,i*2); PF(q.x,q.y,P.S*(0.45-j*0.06),0.55,[40,25,55]); }
        OWN.CH.goat(c,p.x,p.y,P.S*(0.7-i*0.08),t+i*40,P.d); } },
    land(c,PF,k,P,x,a,h,t){ const R=P.R; for(let i=0;i<8;i++) PF(P.tg.x+(atH(i)-0.5)*R*1.6,P.tg.y+(atH(i*3)-0.5)*R*1.2,P.S*0.5,0.6*(1-k),[40,25,55]); for(let i=0;i<3;i++){ const an=t/90+i*2.1; OWN.CH.goat(c,P.tg.x+Math.cos(an)*R*0.9,P.tg.y-R*0.4+Math.sin(an)*R*0.3,P.S*0.55,t+i*30,Math.cos(an)>0?-1:1,1-k); }
      for(let i=0;i<3;i++){ const ex=P.tg.x+(atH(i*7)-0.5)*R*1.2, ey=P.tg.y+(atH(i*9)-0.5)*R*0.8; OWN.WV.eye(c,ex,ey,R*0.1,t+i*40,(1-k)*Math.min(1,k*4),"#ffe040"); } } },
  "Stage Whisper":{   /* a whisper balloon (Gid, 19 Nov 2026): comics draw a whisper as a balloon with a dashed outline, so a soft dashed balloon in Hastur's colour
                          saying "psst..." floats over under the spotlights, slips into the foe's ear and the foe shivers under Hastur's sigil */
    wind(c,PF,t,P,x,a){ const k=t/140, hc=P.body||[240,215,90]; OWN.CH.spot(c,P.o0.x,P.sg,P.o0.y-P.R*4,P.S*1.2,k*0.7);
      OWN.CH.whisperBubble(c,a.x+P.d*P.S*0.9,a.y-P.S*0.9,P.S*2.0*eo(k),P.S*1.1*eo(k),P.d,hc,k,"psst...",t); },
    fly(c,PF,k,P,x,a,h,t){ const hc=P.body||[240,215,90], ear={x:P.tg.x-P.d*P.R*0.75,y:P.head.y+P.R*0.15}, st={x:a.x+P.d*P.S*0.9,y:a.y-P.S*0.9};
      OWN.CH.spot(c,P.o0.x,P.sg,P.o0.y-P.R*4,P.S*1.2,0.7*(1-k)); OWN.CH.spot(c,P.tg.x,P.gnd,P.tg.y-P.R*4,P.R*1.2,k);
      const e=eio(k), p={x:st.x+(ear.x-P.d*P.S*1.0-st.x)*e,y:st.y+(ear.y-P.S*0.8-st.y)*e+Math.sin(k*Math.PI*2)*P.S*0.3};
      for(let i=1;i<4;i++){ const q=Math.max(0,e-i*0.09); OWN.CH.whisperDot(c,st.x+(ear.x-st.x)*q,st.y+(ear.y-P.S*0.8-st.y)*q+P.S*0.5,P.S*(0.22-i*0.04),hc,0.8); }
      OWN.CH.whisperBubble(c,p.x,p.y,P.S*2.0,P.S*1.1,P.d,hc,1,"psst...",t); },
    land(c,PF,k,P,x,a,h,t){ const R=P.R, al=k<0.8?1:(1-k)/0.2, hc=P.body||[240,215,90], dk=OWN.mix(hc,[30,15,45],0.45), ear={x:P.tg.x-P.d*R*0.75,y:P.head.y+R*0.15};
      OWN.CH.spot(c,P.tg.x,P.gnd,P.tg.y-R*4,R*1.2,al);
      if(k<0.35){ const q=k/0.35, bx=ear.x-P.d*P.S*1.0*(1-q), by=ear.y-P.S*0.8*(1-q); OWN.CH.whisperBubble(c,bx,by,P.S*2.0*(1-q*0.85),P.S*1.1*(1-q*0.85),P.d,hc,1-q*0.5,q<0.5?"psst...":"",t); }
      const letters="psst"; for(let i=0;i<4;i++){ const q=Math.min(1,Math.max(0,(k-0.1-i*0.07)/0.35)); if(q<=0||q>=1) continue; OWN.CH.whisperText(c,ear.x-P.d*P.S*(1.3-1.2*q)+(i-1.5)*P.S*0.1,ear.y-P.S*0.5*(1-q),P.S*0.5*(1-q*0.6),letters[i],dk,1-q*0.8); }
      if(k>0.25){ const q=Math.min(1,(k-0.25)/0.2); OWN.CH.sigil(c,P.tg.x,P.head.y-R*1.6,R*0.45,hc,al*q,t);
        c.strokeStyle=OWN.rgb(dk,0.7*al*q); c.lineWidth=2.5; c.lineCap="round"; for(const sd of [-1,1]) for(let j=0;j<2;j++){ const xx=P.tg.x+sd*R*(0.8+j*0.14)+Math.sin(t/14+j)*2; c.beginPath(); c.moveTo(xx,P.tg.y-R*0.25); c.quadraticCurveTo(xx+sd*R*0.06,P.tg.y,xx,P.tg.y+R*0.25); c.stroke(); }
        for(let j=0;j<5;j++){ const xx=P.tg.x+(atH(j)-0.5)*R*1.3, yy=P.tg.y+(atH(j*3)-0.5)*R*0.9; c.fillStyle=OWN.rgb(OWN.mix(hc,[255,255,255],0.5),0.8*al*q); c.beginPath(); c.arc(xx,yy,R*0.035,0,7); c.fill(); } } } }
};
/* a whisper balloon: soft and see-through, with a dashed outline in the speaker's colour and small italic words */
OWN.CH.whisperBubble=(c,x,y,w,h,d,col,al,txt,t)=>{ if(w<3||al<=0) return; c.save(); c.globalAlpha*=al; const dk=OWN.mix(col,[30,15,45],0.45), wob=Math.sin(t/90)*0.03;
  c.shadowColor="rgba(60,40,90,.2)"; c.shadowBlur=h*0.25; c.shadowOffsetY=h*0.06;
  c.fillStyle=OWN.rg(c,x,y,h*0.05,w*0.6,[[0,"rgba(255,255,255,.92)"],[0.7,OWN.rgb(OWN.mix(col,[255,255,255],0.8),0.85)],[1,OWN.rgb(OWN.mix(col,[255,255,255],0.6),0.8)]],-w*0.15,-h*0.2);
  c.beginPath(); c.ellipse(x,y,w*0.5*(1+wob),h*0.5*(1-wob),0,0,7); c.fill(); c.shadowColor="transparent";
  c.setLineDash([Math.max(3,h*0.12),Math.max(3,h*0.1)]); c.lineDashOffset=-t/30; c.strokeStyle=OWN.rgb(OWN.mix(col,[30,15,45],0.2),0.95); c.lineWidth=Math.max(1.8,h*0.06); c.lineCap="round";
  c.beginPath(); c.ellipse(x,y,w*0.5*(1+wob),h*0.5*(1-wob),0,0,7); c.stroke(); c.setLineDash([]);
  OWN.CH.shine(c,x-w*0.25,y-h*0.25,w*0.1,h*0.07,0.8);
  if(txt){ c.font=`italic 700 ${Math.round(h*0.36)}px Georgia, serif`; c.textAlign="center"; c.textBaseline="middle"; c.fillStyle=OWN.rgb(dk,0.9); c.fillText(txt,x,y+h*0.02); }
  c.restore(); };
OWN.CH.whisperDot=(c,x,y,r,col,al)=>{ if(r<1||al<=0) return; c.save(); c.globalAlpha*=al; c.fillStyle="rgba(255,255,255,.85)"; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.setLineDash([Math.max(2,r*0.5),Math.max(2,r*0.4)]); c.strokeStyle=OWN.rgb(OWN.mix(col,[30,15,45],0.2),0.9); c.lineWidth=Math.max(1.4,r*0.18); c.beginPath(); c.arc(x,y,r,0,7); c.stroke(); c.restore(); };
OWN.CH.whisperText=(c,x,y,sz,txt,col,al)=>{ if(al<=0||sz<2) return; c.save(); c.globalAlpha*=al; c.font=`italic 700 ${Math.round(sz)}px Georgia, serif`; c.textAlign="center"; c.textBaseline="middle"; c.shadowColor=OWN.rgb(col,0.9); c.shadowBlur=sz*0.5; c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.4)); c.fillText(txt,x,y); c.restore(); };
/* Hastur's sigil: three curling arms round a centre, glowing in its own colour inside a soft halo */
OWN.CH.sigil=(c,x,y,r,col,al,t)=>{ if(al<=0||r<2) return; c.save(); c.globalAlpha*=al; atGlowA(c,x,y,r*2.2,OWN.mix(col,[255,255,255],0.3),0.55);
  c.fillStyle=OWN.rg(c,x,y,0,r*1.25,[[0,OWN.rgb(OWN.mix(col,[255,255,255],0.7),0.35)],[1,OWN.rgb(col,0)]]); c.beginPath(); c.arc(x,y,r*1.25,0,7); c.fill();
  c.translate(x,y); c.rotate(Math.sin(t/300)*0.15); c.lineCap="round"; c.lineJoin="round";
  const arms=()=>{ for(let i=0;i<3;i++){ const a0=i/3*Math.PI*2-Math.PI/2; c.beginPath(); c.moveTo(Math.cos(a0)*r*0.15,Math.sin(a0)*r*0.15);
      c.quadraticCurveTo(Math.cos(a0)*r*0.95,Math.sin(a0)*r*0.95,Math.cos(a0+0.9)*r*0.75,Math.sin(a0+0.9)*r*0.75); c.quadraticCurveTo(Math.cos(a0+1.3)*r*0.5,Math.sin(a0+1.3)*r*0.5,Math.cos(a0+0.95)*r*0.42,Math.sin(a0+0.95)*r*0.42); c.stroke(); }
    c.beginPath(); c.arc(0,0,r*1.02,0,7); c.stroke(); };
  c.shadowColor=OWN.rgb(col,1); c.shadowBlur=r*0.5; c.strokeStyle=OWN.rgb(OWN.mix(col,[40,20,60],0.15),0.95); c.lineWidth=r*0.2; arms();
  c.shadowBlur=0; c.strokeStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.6),0.95); c.lineWidth=r*0.07; arms(); c.fillStyle="#fff"; c.beginPath(); c.arc(0,0,r*0.1,0,7); c.fill(); c.restore(); };
OWN.CH.sour=(c,x,y,s,t,al=1)=>{ if(s<1||al<=0) return; c.save(); c.translate(x,y); c.rotate(Math.sin(t/30)*0.25); c.globalAlpha*=al; atGlowA(c,0,0,s*1.2,[190,240,90],0.4); OWN.CH.noteG(c,0,0,s,[160,215,70],0.3,false);
  c.strokeStyle="#3e6a18"; c.lineWidth=Math.max(1.8,s*0.07); c.lineCap="round"; c.lineJoin="round"; c.beginPath(); c.moveTo(-s*0.38,-s*0.04); c.lineTo(-s*0.26,s*0.02); c.lineTo(-s*0.38,s*0.08); c.moveTo(-s*0.02,-s*0.08); c.lineTo(-s*0.14,-s*0.02); c.lineTo(-s*0.02,s*0.04); c.stroke();
  c.beginPath(); for(let i=0;i<=4;i++) c.lineTo(-s*0.32+i*s*0.08,s*0.2+(i%2?-s*0.035:s*0.035)); c.stroke(); c.fillStyle="rgba(255,150,170,.6)"; c.beginPath(); c.ellipse(-s*0.42,s*0.16,s*0.07,s*0.04,0,0,7); c.fill(); c.restore(); };
OWN.CH.field=(c,x,y,r,t,al,d)=>{ if(r<2||al<=0) return; c.save(); c.translate(x,y); c.globalAlpha*=al; c.shadowBlur=r*0.12; c.shadowColor="rgba(255,255,255,.7)"; for(let i=0;i<4;i++){ const rr=r*(0.4+i*0.22), ph=(t/200+i*0.3)%1; c.lineCap="round";
    c.strokeStyle=`rgba(230,70,70,${0.8-i*0.15})`; c.lineWidth=Math.max(2,r*0.08); c.beginPath(); c.ellipse(0,-rr*0.45,rr,rr*0.5,0,Math.PI*1.05,Math.PI*1.95); c.stroke();
    c.strokeStyle=`rgba(70,110,230,${0.8-i*0.15})`; c.beginPath(); c.ellipse(0,rr*0.45,rr,rr*0.5,0,Math.PI*0.05,Math.PI*0.95); c.stroke();
    c.fillStyle="rgba(255,255,255,.9)"; c.beginPath(); c.arc(Math.cos(ph*Math.PI*2)*rr,-rr*0.45+Math.sin(ph*Math.PI*2)*rr*0.5*(ph<0.5?-1:1)*0.5,2.2,0,7); c.fill(); } c.restore(); };
OWN.chatFx=(c,t,x,o)=>{ OWN.noSoft=true; try{ OWN.twoPass(c,x,(cc,PF)=>{ const c=cc; const P=OWN.cx(x,{at:[0.9,0.4],sz:1.2}); P.S*=2.3; OWN.GU.d=P.d; const s=x.self, fr=OWN.pt(s,x.target,[1,0.5]).x;
    const a=s.mouth?{x:fr+P.d*P.S*0.1,y:s.mouth.y}:{x:fr+P.d*P.S*0.1,y:P.o0.y}, h={x:P.tg.x-P.d*P.R*0.2,y:P.tg.y-P.R*0.25};
    if(t<140){ if(o.wind) o.wind(c,PF,t,P,x,a); return; }
    if(t<420){ o.fly(c,PF,(t-140)/280,P,x,a,h,t); return; }
    o.land(c,PF,Math.min(1,(t-420)/640),P,x,a,h,t); }); } finally { OWN.noSoft=false; } };
(()=>{ if(typeof ANIM==="undefined"||!ANIM.chatter) return; const K=ANIM.chatter, fx1=K.fx;
  K.fx=function(c,t,x){ const o=x&&OWN_CHAT[x.name]||null; if(!o) return fx1.call(this,c,t,x); try{ OWN.chatFx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN chatter",x.name,e&&e.message); } } }; })();
