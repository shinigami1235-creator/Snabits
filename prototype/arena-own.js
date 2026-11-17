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
OWN.rgb=(c,a)=>atRgba(c,a);
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
    case "flame": for(let i=0;i<6;i++){ const xx=tg.x+(i-2.5)*R*0.28, hh=R*(0.5+0.4*atH(i))*(1-k*0.6); OWN.flame(c,xx,tg.y+R*0.3-hh*0.3,hh*0.45,-Math.PI/2,OWN.rgb(C,0.85*a),OWN.rgb(C2,0.9*a),t+i*90); } break;
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
/* ---------- steam: a cloud from its own part ---------- */
const OWN_STEAM={
  Fizz:{at:[[0.5,-0.22]],style:"bubbles",col:[240,190,250]},
  Puff:{at:[[0.7,0.35]],style:"spores",col:[190,140,230]},
  Wick:{at:[[0.5,-0.25]],style:"smoke",col:[120,115,125]},
  Nimbo:{at:[[0.8,0.85]],style:"fog",col:[220,232,250]},
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
  Vampire:{at:[[0.6,1.0]],style:"fog",col:[90,120,90]},
  Phoenix:{at:[[0.6,0.0]],style:"haze",col:[255,170,90]},
  Yeti:{at:[[0.95,0.45]],style:"frost",col:[225,240,255]},
  Mermaid:{at:[[0.05,0.85]],style:"spray",col:[200,235,245]},
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
OWN.steamFx=(c,t,x,o)=>{ const tg=x.target, S=OWN.size(x), pts=o.at.map(uv=>OWN.pt(x.self,tg,uv)), C=o.col;
  if(t<180){ for(const p of pts) SG.puff(c,p.x,p.y-t/40,S*(0.4+t/300),0.7,C); return; }
  const w=Math.min(1,(t-180)/120)*Math.min(1,(900-t)/160); if(w<=0) return; const big=atBig(x);
  pts.forEach((o0,j)=>{ const n=o.style==="jet"?14:18;
    for(let i=0;i<n;i++){ const k=((t-180)/520+i/n)%1; let p, r;
      switch(o.style){
        case "smoke": { p=lerpP(o0,tg,k,0,0); p={x:p.x+Math.sin(k*7+i)*S*0.8,y:p.y-Math.sin(Math.PI*k)*S*4}; r=(6+k*22)*big; SG.puff(c,p.x,p.y,r,0.8*w*(1-k*0.5),OWN.mix(C,[60,55,60],atH(i)*0.4)); break; }
        case "fog": { const gy=x.self.foot!=null?x.self.foot:(o0.y+S*3); p={x:o0.x+(tg.x-o0.x)*k,y:gy-S*(0.8+0.6*atH(i))-Math.sin(k*5+i)*S*0.3}; r=(10+k*20)*big; SG.puff(c,p.x,p.y,r,0.75*w*(1-k*0.4),C); break; }
        case "rings": { if(i%2) break; p=lerpP(o0,tg,k,0,0); p={x:p.x,y:p.y-Math.sin(Math.PI*k)*S*2}; r=(6+k*18)*big; for(const [lw,col] of [[7,OWN.rgb(OWN.mix(C,[40,40,40],0.4),0.6*w*(1-k*0.5))],[3.5,OWN.rgb(OWN.mix(C,[255,255,255],0.4),0.9*w*(1-k*0.5))]]){ c.strokeStyle=col; c.lineWidth=lw*(1-k*0.4)*big; c.beginPath(); c.ellipse(p.x,p.y,r*0.55,r,0,0,7); c.stroke(); } break; }
        case "jet": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/60)*6*k); r=(3+k*28)*big; SG.puff(c,p.x,p.y,r,0.9*w*(1-k*0.6),C); break; }
        case "stink": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*10*k); r=(7+k*20)*big; SG.puff(c,p.x,p.y-k*6,r,0.7*w*(1-k*0.5),OWN.mix(C,[120,90,60],atH(i)*0.3));
          if(i%4===0){ c.strokeStyle=OWN.rgb(OWN.mix(C,[60,90,30],0.4),0.8*w*(1-k)); c.lineWidth=2; c.beginPath(); for(let q=0;q<=8;q++){ const yy=p.y-r-q*3; c.lineTo(p.x+Math.sin(q*1.3+t/80)*4,yy); } c.stroke(); } break; }
        case "spray": { p=lerpP(o0,tg,k,0,(atH(i*7)-0.5)*S*4*k); for(let q=0;q<4;q++){ c.fillStyle=OWN.rgb(OWN.mix(C,[255,255,255],q*0.25),0.95*w*(1-k*0.4)); c.beginPath(); c.arc(p.x+(atH(i+q*9)-0.5)*S*2.4*k,p.y+(atH(i*3+q)-0.5)*S*2.4*k,(2.2+2.8*(1-k))*big,0,7); c.fill(); }
          SG.puff(c,p.x,p.y,(5+k*18)*big,0.55*w*(1-k*0.6),C); break; }
        case "dust": { const gy=x.self.foot!=null?x.self.foot:(o0.y+S*2); p={x:o0.x+(tg.x-o0.x)*k,y:o0.y+(gy-S-o0.y)*Math.min(1,k*2)-Math.sin(k*6+i)*S*0.6}; r=(6+k*22)*big; SG.puff(c,p.x,p.y,r,0.75*w*(1-k*0.4),OWN.mix(C,[90,70,50],atH(i)*0.35));
          if(i%2) { c.fillStyle=OWN.rgb(OWN.mix(C,[60,45,30],0.5),0.8*w*(1-k)); c.beginPath(); c.arc(p.x+(atH(i*5)-0.5)*r*2,p.y+(atH(i)-0.5)*r,1.6*big,0,7); c.fill(); } break; }
        case "haze": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*8*k); if(i%2===0) atGlowA(c,p.x,p.y,(8+k*20)*big,C,0.3*w*(1-k*0.6));
          c.strokeStyle=OWN.rgb(OWN.mix(C,[255,255,255],0.3),0.8*w*(1-k)); c.lineWidth=2.5*big; c.beginPath(); for(let q=-4;q<=4;q++){ c.lineTo(p.x+Math.sin(q*1.4+t/50+i)*S*0.5*(1+k),p.y+q*S*0.45*(1+k)); } c.stroke();
          if(i%2===0) SG.puff(c,p.x,p.y,(5+k*16)*big,0.45*w*(1-k),OWN.mix(C,[255,255,255],0.55));
          if(i%5===0){ c.fillStyle=OWN.rgb([255,200,90],0.95*w*(1-k)); c.beginPath(); c.arc(p.x+(atH(i)-0.5)*S*2,p.y-(1-k)*S,1.8*big,0,7); c.fill(); } break; }
        case "frost": { p=lerpP(o0,tg,k,0,Math.sin(i*2.3+t/80)*8*k); r=(5+k*22)*big; SG.puff(c,p.x,p.y,r,0.75*w*(1-k*0.5),C);
          if(i%3===0) OWN.star(c,p.x+(atH(i)-0.5)*r,p.y+(atH(i*3)-0.5)*r,(2+2*k)*big,OWN.rgb([255,255,255],0.9*w*(1-k)),t/200+i); break; }
        case "hot": { p=lerpP(o0,tg,k,0,Math.sin(i*2.3+t/80)*8*k); r=(5+k*20)*big; SG.puff(c,p.x,p.y,r,0.7*w*(1-k*0.5),OWN.mix(C,[255,230,200],atH(i)*0.5));
          if(i%2===0){ c.fillStyle=OWN.rgb([255,190,80],0.95*w*(1-k)); c.beginPath(); c.arc(p.x+(atH(i)-0.5)*r,p.y+(atH(i*3)-0.5)*r-(1-k)*4,1.8*big,0,7); c.fill(); } break; }
        case "bubbles": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*10*k); if(i%2) OWN.bubble(c,p.x,p.y-Math.sin(Math.PI*k)*S*2,(4+8*k)*big,OWN.mix(C,[120,60,140],0.3),false); else SG.puff(c,p.x,p.y,(5+k*18)*big,0.55*w*(1-k*0.5),C); break; }
        case "spores": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*12*k); r=(5+k*20)*big; SG.puff(c,p.x,p.y-Math.sin(Math.PI*k)*S,r,0.65*w*(1-k*0.5),C);
          c.fillStyle=OWN.rgb(OWN.mix(C,[255,255,255],0.5),0.9*w*(1-k)); for(let q=0;q<3;q++){ c.beginPath(); c.arc(p.x+(atH(i*3+q)-0.5)*r*1.6,p.y+(atH(i+q*5)-0.5)*r*1.6,1.6*big,0,7); c.fill(); } break; }
        case "sparkle": { p=lerpP(o0,tg,k,0,Math.sin(i*2.1+t/90)*12*k); SG.puff(c,p.x,p.y,(4+k*16)*big,0.45*w*(1-k*0.5),C); if(i%2) OWN.star(c,p.x+(atH(i)-0.5)*S*2,p.y+(atH(i*2)-0.5)*S*2,(2+2*(1-k))*big,OWN.rgb([255,250,220],0.95*w*(1-k)),t/120+i); break; }
        default: { p=lerpP(o0,tg,k,0,0); SG.puff(c,p.x,p.y,(8+k*26)*big,0.85*w*(1-k*0.55),C); } } } });
  c.fillStyle=OWN.rgb(o.col,0.22*w); c.beginPath(); c.arc(tg.x,tg.y,28*atBig(x),0,7); c.fill(); };
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
    K.fx=function(c,t,x){ const o=x&&TABLE[x.fam]; if(!o) return fx0.call(this,c,t,x); return fn(c,t,x,o); };
    if(atk) K.atk=function(t,pos){ const o=pos&&TABLE[pos.fam]; return o?atk(t,pos,o):atk0.call(this,t,pos); }; };
  wrap("bolt",OWN_BOLT,OWN.boltFx);
  wrap("steam",OWN_STEAM,OWN.steamFx);
  wrap("trumpet",OWN_HORN,OWN.hornFx,(t,pos,o)=>{ const k=t<220?eo(t/220):t<860?1:1-eio(Math.min(1,(t-860)/240)), loud=t>220&&t<860;
    const P=atPose("push",k>0.5&&/zs|steam/.test(o.extra||"")?{open:0.75*k,eyes:"shut"}:{open:0.75*k});
    return {pose:P,sy:1+0.05*k*(loud?Math.abs(Math.sin(t/30)):1),rot:(o.up||0)*0.35*k*(pos.dir||1)*-1,off:[loud?Math.sin(t/11)*1.2:0,0]}; });
})();
