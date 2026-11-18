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
  Yeti:{at:[[0.95,0.45]],style:"frost",col:[225,240,255]},
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
  body(c,ok?()=>{}:(...a)=>OWN.sp(c,...a)); };
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
        case "rings": { if(i%2) break; p=lerpP(o0,tg,k,0,0); p={x:p.x,y:p.y-Math.sin(Math.PI*k)*S*2}; r=(6+k*18)*big; for(const [lw,col] of [[7,OWN.rgb(OWN.mix(C,[40,40,40],0.4),0.6*w*(1-k*0.5))],[3.5,OWN.rgb(OWN.mix(C,[255,255,255],0.4),0.9*w*(1-k*0.5))]]){ c.strokeStyle=col; c.lineWidth=lw*(1-k*0.4)*big; c.beginPath(); c.ellipse(p.x,p.y,r*0.55,r,0,0,7); c.stroke(); } break; }
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
          if(i%3===0) OWN.star(c,p.x+(atH(i)-0.5)*r,p.y+(atH(i*3)-0.5)*r,(2+2*k)*big,OWN.rgb([255,255,255],0.9*w*(1-k)),t/200+i); break; }
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
    K.fx=function(c,t,x){ const o=x&&TABLE[x.fam]; if(!o) return fx0.call(this,c,t,x); return fn(c,t,x,o); };
    if(atk) K.atk=function(t,pos){ const o=pos&&TABLE[pos.fam]; return o?atk(t,pos,o):atk0.call(this,t,pos); }; };
  wrap("bolt",OWN_BOLT,OWN.boltFx);
  { const K=ANIM.bolt; if(K){ const fx1=K.fx, atk1=K.atk;   // the second pass wins where a family has one
    K.fx=function(c,t,x){ const o=x&&OWN_BOLT2[x.fam]; return o?o.fx(c,t,x,o):fx1.call(this,c,t,x); };
    K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&OWN_BOLT2[pos.fam], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; }; } }
  wrap("steam",OWN_STEAM,OWN.steamFx);
  wrap("trumpet",OWN_HORN,OWN.hornFx,(t,pos,o)=>{ const k=t<220?eo(t/220):t<860?1:1-eio(Math.min(1,(t-860)/240)), loud=t>220&&t<860;
    const P=atPose("push",k>0.5&&/zs|steam/.test(o.extra||"")?{open:0.75*k,eyes:"shut"}:{open:0.75*k});
    return {pose:P,sy:1+0.05*k*(loud?Math.abs(Math.sin(t/30)):1),rot:(o.up||0)*0.35*k*(pos.dir||1)*-1,off:[loud?Math.sin(t/11)*1.2:0,0]}; });
})();

/* a family with its own bolt draws its own landing, so the stock hit lines stay off and the burst stays small */
function OWN_OWNS(S){ if(!(S&&S.anim&&S.spec)) return false; const k=S.anim.kind, f=S.spec.family; return !!(k==="bolt"&&OWN_BOLT2[f]||k==="steam"&&OWN_STEAM[f]||k==="trumpet"&&typeof OWN_HORN2!=="undefined"&&OWN_HORN2[f]||k==="propthrow"&&typeof OWN_PROP!=="undefined"&&OWN_PROP[f]); }

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
OWN.note=(c,x,y,s,col,rot=0,two=false)=>{ c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=col; c.strokeStyle=col; c.lineWidth=Math.max(1.4,s*0.18);
  c.beginPath(); c.ellipse(0,0,s*0.5,s*0.36,-0.4,0,7); c.fill(); c.beginPath(); c.moveTo(s*0.42,-s*0.1); c.lineTo(s*0.42,-s*1.5); c.stroke();
  if(two){ c.beginPath(); c.ellipse(s*1.2,-s*0.25,s*0.5,s*0.36,-0.4,0,7); c.fill(); c.beginPath(); c.moveTo(s*1.62,-s*0.35); c.lineTo(s*1.62,-s*1.75); c.stroke(); c.lineWidth=s*0.35; c.beginPath(); c.moveTo(s*0.42,-s*1.5); c.lineTo(s*1.62,-s*1.75); c.stroke(); }
  else { c.beginPath(); c.moveTo(s*0.42,-s*1.5); c.quadraticCurveTo(s*1.1,-s*1.1,s*0.9,-s*0.6); c.stroke(); } c.restore(); };
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
  K.fx=function(c,t,x){ const o=x&&OWN_HORN2[x.fam]; if(!o) return fx1.call(this,c,t,x); try{ return o.fx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error('OWN trumpet',x.fam,e&&e.message); } } };
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
  Presto:{at:[1.0,0.5],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x-d*R*0.4,y:tg.y-R*0.1};
      if(t<260){ const q=eo(Math.min(1,t/180)); for(let i=0;i<5;i++) OWN.prop(c,x,"card",o0.x,o0.y,-d*0.6+(i-2)*0.25*q,2.1,i===4&&t>200?1-OWN.k(t,200,260):1); }
      if(t<200) return;
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go(o0,end,ei(q),S*0.3,0); OWN.prop(c,x,"card",p.x,p.y,d*t/16,2.2); return; }
      const q=OWN.k(t,620,1000); OWN.prop(c,x,"card",end.x,end.y,d*0.6,2.2,q<0.8?1:1-(q-0.8)/0.2); OWN.bonk(c,end.x,end.y,R*0.7,Math.min(0.99,q*1.4)); } },
  /* Pogo: it bounces the ball hard off the ground in springy hops that grow until the last one smacks the foe */
  Pogo:{at:[0.9,0.6],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,sg,gnd}=P, k=OWN.pk(x), r=S*0.8;
      if(t<200){ const q=t/200, y=o0.y+(sg-r-o0.y)*Math.abs(Math.sin(q*Math.PI*2)); OWN.prop(c,x,k,o0.x+d*S*0.4,y,0,2.2); return; }
      const end={x:tg.x,y:tg.y-R*0.1};
      if(t<620){ const q=OWN.k(t,200,620), seg=Math.min(2,Math.floor(q*3)), sq=q*3-seg, xs=[o0.x+d*S*0.4,o0.x+(tg.x-o0.x)*0.35,o0.x+(tg.x-o0.x)*0.7,end.x], gy=(px)=>sg+(gnd-sg)*Math.min(1,Math.abs(px-o0.x)/Math.abs(tg.x-o0.x||1))-r;
        const x0=xs[seg], x1=xs[seg+1], px=x0+(x1-x0)*sq, h=R*(0.6+seg*0.35), last=seg===2, py=last?gy(x0)+(end.y-gy(x0))*sq-Math.sin(Math.PI*sq)*h*0.6:gy(px)-Math.sin(Math.PI*sq)*h, squash=!last&&(sq<0.08||sq>0.92);
        if(!last&&sq>0.9) SG.dust(c,x1,gy(x1)+r,S*0.6,(sq-0.9)*10,4); c.save(); c.translate(px,py); c.scale(squash?1.25:1,squash?0.8:1); OWN.prop(c,x,k,0,0,d*t/40,2.2); c.restore(); return; }
      const q=OWN.k(t,620,1000); OWN.bonk(c,end.x,end.y,R,q); OWN.prop(c,x,k,end.x-d*R*1.4*q,end.y-R*1.2*Math.sin(Math.PI*q)+q*q*R,0,2.2,1-q); } },
  /* Golem: it breaks a pebble off its own body, lobs it high, and it lands with a thud and a burst of dust */
  Golem:{at:[0.9,0.35],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R,gnd,head}=P, col=OWN.mix(P.body||[150,140,130],[110,100,95],0.45), end={x:tg.x,y:head.y+S*0.2};
      const rock=(pt,s,rot)=>{ c.save(); c.translate(pt.x,pt.y); c.rotate(rot); c.fillStyle=OWN.rgb(col,1); c.beginPath(); for(let i=0;i<7;i++){ const a=i/7*7, rr=s*(0.8+0.3*atH(i+3)); c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); c.fillStyle=OWN.rgb(OWN.mix(col,[255,255,255],0.3),1); c.beginPath(); c.arc(-s*0.25,-s*0.25,s*0.3,0,7); c.fill(); c.restore(); };
      if(t<200){ const q=t/200; if(q>0.5) for(let i=0;i<4;i++){ c.fillStyle=OWN.rgb(col,1); c.beginPath(); c.arc(o0.x+Math.cos(i*1.6)*S*q,o0.y+Math.sin(i*1.6)*S*q,1.8,0,7); c.fill(); } rock({x:o0.x+d*S*0.5*q,y:o0.y-S*0.6*q},S*0.7,0); return; }
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go({x:o0.x+d*S*0.5,y:o0.y-S*0.6},end,q,R*1.2,0); rock(p,S*0.85,d*q*8); return; }
      const q=OWN.k(t,620,1000); SG.dust(c,tg.x,gnd,R*0.9,q,8); for(let i=0;i<5;i++){ const a=-Math.PI*0.8+i/4*Math.PI*0.6, v=R*(0.4+0.7*eo(q)); rock({x:end.x+Math.cos(a)*v,y:end.y+Math.sin(a)*v+q*q*R*1.2},S*0.28*(1-q*0.5),q*5+i); } OWN.bonk(c,end.x,end.y,R*0.8,q); } },
  /* Tanuki: it flings its straw hat like a frisbee, it curves out wide, smacks the foe and sails back */
  Tanuki:{at:[0.5,-0.05],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.3};
      if(t<200){ OWN.prop(c,x,"hat",o0.x-d*S*0.3*eo(t/200),o0.y,-d*0.4*eo(t/200),2.4); return; }
      const out=OWN.k(t,200,620), back=OWN.k(t,620,1000);
      const p=t<620?(()=>{ const r=OWN.go(o0,end,eo(out),0,0); return {x:r.x,y:r.y-Math.sin(out*Math.PI)*R*1.0}; })():(()=>{ const r=OWN.go(end,o0,eio(back),0,0); return {x:r.x,y:r.y+Math.sin(back*Math.PI)*R*0.6}; })();
      c.save(); c.translate(p.x,p.y); c.scale(1,0.55); OWN.prop(c,x,"hat",0,0,t/25,2.4); c.restore(); c.strokeStyle="rgba(255,255,255,.5)"; c.lineWidth=2; c.beginPath(); c.ellipse(p.x,p.y,S*1.4,S*0.5,0,t/25,t/25+1.4); c.stroke();
      OWN.bonk(c,end.x,end.y,R*0.9,OWN.k(t,620,900)); } },
  /* Mermaid: it scoops a pearl from its tail fin and flicks it with a splash; the pearl streaks over gleaming and bursts in spray */
  Mermaid:{at:[0.95,0.5],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.15}, sea=[150,215,240];
      if(t<200){ const q=t/200; for(let i=0;i<5;i++){ const a=-Math.PI/2+(i-2)*0.4; c.fillStyle=OWN.rgb(sea,1-q); c.beginPath(); c.arc(o0.x+Math.cos(a)*S*1.4*q,o0.y+Math.sin(a)*S*1.4*q,S*0.15,0,7); c.fill(); } OWN.prop(c,x,"pearl",o0.x,o0.y,0,2.2*eo(q)); return; }
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go(o0,end,ei(q),S*0.4,0); for(let i=1;i<6;i++){ const b=OWN.go(o0,end,Math.max(0,ei(q)-i*0.04),S*0.4,0); c.fillStyle=OWN.rgb(sea,0.7*(1-i/6)); c.beginPath(); c.arc(b.x,b.y+Math.sin(i+t/40)*2,S*0.18,0,7); c.fill(); }
        atGlowA(c,p.x,p.y,S*1.2,[255,250,240],0.6); OWN.prop(c,x,"pearl",p.x,p.y,0,2.2); OWN.star(c,p.x-S*0.3,p.y-S*0.3,S*0.3,"rgba(255,255,255,.95)",t/50); return; }
      const q=OWN.k(t,620,1000); OWN.pop(c,end.x,end.y,R*0.6,sea,q,10); OWN.bonk(c,end.x,end.y,R*0.7,q,[230,250,255]); } },
  /* Diwata: leaves whirl up round it, then fly out one after another as spinning blades and cut across the foe */
  Diwata:{at:[1.0,0.45],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, cen=P.s, end={x:tg.x,y:tg.y-R*0.15};
      for(let i=0;i<3;i++){ const t0=200+i*80, ph=i/3*Math.PI*2;
        if(t<t0){ const a=ph+t/70, p={x:cen.x+Math.cos(a)*R*0.9,y:cen.y-R*0.1+Math.sin(a)*R*0.45}; OWN.prop(c,x,"leaf",p.x,p.y,a,2.0*Math.min(1,t/150)); continue; }
        const st={x:cen.x+Math.cos(ph+t0/70)*R*0.9,y:cen.y-R*0.1+Math.sin(ph+t0/70)*R*0.45};
        if(t<t0+420){ const q=OWN.k(t,t0,t0+420), p=OWN.go(st,{x:end.x,y:end.y+(i-1)*R*0.35},ei(q),S*(0.5+i*0.5),0); OWN.prop(c,x,"leaf",p.x,p.y,t/18*d,2.2); continue; }
        const q=OWN.k(t,t0+420,t0+700); if(q<1){ c.strokeStyle=OWN.rgb([180,255,170],1-q); c.lineWidth=3; c.beginPath(); c.moveTo(end.x-R*0.8,end.y+(i-1)*R*0.35-R*0.2); c.lineTo(end.x+R*0.8,end.y+(i-1)*R*0.35+R*0.2); c.stroke(); } } } },
  /* Sphinx: a golden disc rises behind its head like the sun, blazing, then spins across and bursts in rays on the foe */
  Sphinx:{at:[0.5,-0.1],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.15}, sun={x:o0.x,y:o0.y-R*0.6}, gold=[255,210,90];
      const disc=(p,rot,a)=>{ atGlowA(c,p.x,p.y,S*2,gold,0.6*a); for(let i=0;i<8;i++){ const aa=rot+i/8*Math.PI*2; c.strokeStyle=OWN.rgb([255,230,140],0.8*a); c.lineWidth=2; c.beginPath(); c.moveTo(p.x+Math.cos(aa)*S*0.9,p.y+Math.sin(aa)*S*0.9); c.lineTo(p.x+Math.cos(aa)*S*1.4,p.y+Math.sin(aa)*S*1.4); c.stroke(); } OWN.prop(c,x,"disc",p.x,p.y,rot,2.3,a); };
      if(t<200){ const q=eo(t/200); disc({x:sun.x,y:o0.y+(sun.y-o0.y)*q},t/80,q); return; }
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go(sun,end,ei(q),R*0.6,0); disc(p,d*t/20,1); return; }
      const q=OWN.k(t,620,1000); if(q<1){ for(let i=0;i<12;i++){ const aa=i/12*Math.PI*2; c.strokeStyle=OWN.rgb(gold,1-q); c.lineWidth=3; c.beginPath(); c.moveTo(end.x+Math.cos(aa)*R*0.3,end.y+Math.sin(aa)*R*0.3); c.lineTo(end.x+Math.cos(aa)*R*(0.6+1.0*q),end.y+Math.sin(aa)*R*(0.6+1.0*q)); c.stroke(); } atGlowA(c,end.x,end.y,R*(0.8+0.6*q),gold,0.7*(1-q)); } } },
  /* Sarimanok: a fish flops in its beak, it tosses it flapping end over end, and the fish slaps the foe with a splash */
  Sarimanok:{at:[1.0,0.35],sz:1.4,fx(c,t,x,o){ const P=OWN.cx(x,o), {o0,tg,d,S,R}=P, end={x:tg.x,y:tg.y-R*0.2}, sea=[150,215,240];
      if(t<200){ OWN.prop(c,x,"fish",o0.x+d*S*0.3,o0.y+S*0.2,Math.sin(t/25)*0.5,2.4); return; }
      if(t<620){ const q=OWN.k(t,200,620), p=OWN.go(o0,end,q,R*1.3,0); OWN.prop(c,x,"fish",p.x,p.y,d*q*10+Math.sin(t/20)*0.4,2.4); for(let i=0;i<2;i++){ c.fillStyle=OWN.rgb(sea,0.8); c.beginPath(); c.arc(p.x-d*S*(0.8+i*0.6),p.y+S*0.3+i*3,S*0.15,0,7); c.fill(); } return; }
      const q=OWN.k(t,620,1000); OWN.pop(c,end.x,end.y,R*0.6,sea,q,10); OWN.prop(c,x,"fish",end.x-d*R*q,end.y-Math.sin(Math.PI*q)*R+q*q*R*1.3,-d*q*6,2.4,1-q*0.8); } }
};
(()=>{ if(typeof ANIM==="undefined"||!ANIM.propthrow) return; const K=ANIM.propthrow, fx1=K.fx;
  K.fx=function(c,t,x){ const o=x&&OWN_PROP[x.fam]; if(!o) return fx1.call(this,c,t,x); try{ o.fx(c,t,x,o); }catch(e){ if(!OWN.err){ OWN.err=1; console.error("OWN propthrow",x.fam,e&&e.message); } } if(typeof atImpact==="function") atImpact(t,620,0.3,0.05); };
  const atk1=K.atk; K.atk=function(t,pos){ const b=atk1.call(this,t,pos), o=pos&&OWN_PROP[pos.fam], e=o&&o.atk&&o.atk(t,pos); return e?{...b,...e}:b; }; })();


/* ---------- detailed props (Gid, 18 Nov 2026: the stock props were flat shapes) ---------- */
OWN.lg=(c,x0,y0,x1,y1,stops)=>{ const g=c.createLinearGradient(x0,y0,x1,y1); stops.forEach(([o,col])=>g.addColorStop(o,col)); return g; };
OWN.rg=(c,x,y,r0,r1,stops,ox=0,oy=0)=>{ const g=c.createRadialGradient(x+ox,y+oy,r0,x,y,r1); stops.forEach(([o,col])=>g.addColorStop(o,col)); return g; };
OWN.rr=(c,x,y,w,h,r)=>{ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); };
OWN.PROPS={
  chair(c,s,t){ const wood=OWN.lg(c,-s,0,s,0,[[0,"#9c6a3c"],[0.5,"#c08850"],[1,"#7a4e2a"]]); c.lineJoin="round"; c.strokeStyle="#4a2c14"; c.lineWidth=Math.max(1,s*0.07);
    for(const [x0,x1] of [[-0.75,-0.6],[0.55,0.7],[-0.45,-0.32],[0.82,0.95]]){ c.fillStyle=wood; c.beginPath(); c.rect(s*x0,s*0.1,s*(x1-x0),s*1.0); c.fill(); c.stroke(); }
    c.fillStyle=OWN.lg(c,0,-s*0.1,0,s*0.25,[[0,"#d8a066"],[1,"#9a6234"]]); c.beginPath(); c.moveTo(-s*0.85,s*0.1); c.lineTo(s*0.75,s*0.1); c.lineTo(s*1.0,-s*0.12); c.lineTo(-s*0.55,-s*0.12); c.closePath(); c.fill(); c.stroke();
    c.fillStyle=wood; for(const x0 of [-0.85,0.45]){ c.beginPath(); c.rect(s*x0,-s*1.25,s*0.17,s*1.37); c.fill(); c.stroke(); }
    for(let i=0;i<3;i++){ c.fillStyle=i%2?"#b47c46":"#c48a52"; c.beginPath(); c.rect(-s*0.7,-s*(1.1-i*0.33),s*1.17,s*0.16); c.fill(); c.stroke(); }
    c.strokeStyle="rgba(80,45,20,.45)"; c.lineWidth=0.8; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-s*0.5+i*s*0.3,-s*0.08); c.quadraticCurveTo(-s*0.4+i*s*0.3,0,-s*0.55+i*s*0.3,s*0.06); c.stroke(); }
    c.fillStyle="rgba(255,235,200,.35)"; c.fillRect(-s*0.83,-s*1.2,s*0.05,s*1.2); },
  cork(c,s){ c.strokeStyle="#5a3a1c"; c.lineWidth=Math.max(1,s*0.07); c.fillStyle=OWN.lg(c,-s*0.5,0,s*0.5,0,[[0,"#a8743e"],[0.45,"#d9a66a"],[1,"#8a5a2c"]]);
    c.beginPath(); c.moveTo(-s*0.55,-s*0.6); c.lineTo(s*0.55,-s*0.6); c.lineTo(s*0.45,s*0.7); c.lineTo(-s*0.45,s*0.7); c.closePath(); c.fill(); c.stroke();
    c.fillStyle="#e2b67a"; c.beginPath(); c.ellipse(0,-s*0.6,s*0.55,s*0.18,0,0,7); c.fill(); c.stroke(); c.fillStyle="#9a6634"; for(let i=0;i<14;i++){ c.beginPath(); c.arc((atH(i)-0.5)*s*0.85,-s*0.4+atH(i*3)*s*1.0,s*(0.04+0.04*atH(i*7)),0,7); c.fill(); }
    for(let i=0;i<5;i++){ c.beginPath(); c.arc((atH(i+20)-0.5)*s*0.8,-s*0.6+(atH(i*5)-0.5)*s*0.18,s*0.035,0,7); c.fill(); } c.fillStyle="rgba(255,255,255,.3)"; c.fillRect(-s*0.3,-s*0.45,s*0.1,s*1.0); },
  leaf(c,s,t){ c.save(); c.rotate(-0.2); c.fillStyle=OWN.lg(c,0,-s*0.5,0,s*0.5,[[0,"#8ad86a"],[0.6,"#4fae46"],[1,"#2f7a34"]]); c.strokeStyle="#22582a"; c.lineWidth=Math.max(1,s*0.06);
    c.beginPath(); c.moveTo(-s*1.1,0); c.bezierCurveTo(-s*0.5,-s*0.75,s*0.6,-s*0.65,s*1.2,0); c.bezierCurveTo(s*0.6,s*0.55,-s*0.5,s*0.7,-s*1.1,0); c.fill(); c.stroke();
    c.strokeStyle="#2e6e30"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); c.moveTo(-s*1.35,s*0.12); c.quadraticCurveTo(0,s*0.02,s*1.1,0); c.stroke(); c.lineWidth=Math.max(0.8,s*0.04);
    for(let i=0;i<5;i++){ const x0=-s*0.7+i*s*0.38; c.beginPath(); c.moveTo(x0,0); c.quadraticCurveTo(x0+s*0.15,-s*0.2,x0+s*0.32,-s*0.36); c.moveTo(x0,0); c.quadraticCurveTo(x0+s*0.15,s*0.18,x0+s*0.3,s*0.32); c.stroke(); }
    c.fillStyle="rgba(255,255,255,.3)"; c.beginPath(); c.ellipse(-s*0.1,-s*0.28,s*0.5,s*0.1,-0.15,0,7); c.fill(); c.restore(); },
  note(c,s){ c.save(); c.fillStyle=OWN.lg(c,-s*0.5,-s,s*0.6,s*0.5,[[0,"#e070e0"],[1,"#8a2aa0"]]); c.strokeStyle="#4a1258"; c.lineWidth=Math.max(1,s*0.07);
    c.beginPath(); c.ellipse(-s*0.25,s*0.55,s*0.5,s*0.36,-0.4,0,7); c.fill(); c.stroke(); c.fillRect(s*0.14,-s*1.05,s*0.16,s*1.6); c.strokeRect(s*0.14,-s*1.05,s*0.16,s*1.6);
    c.beginPath(); c.moveTo(s*0.3,-s*1.05); c.bezierCurveTo(s*0.9,-s*0.8,s*1.0,-s*0.35,s*0.7,-s*0.1); c.bezierCurveTo(s*0.8,-s*0.45,s*0.6,-s*0.6,s*0.3,-s*0.65); c.closePath(); c.fill(); c.stroke();
    c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-s*0.38,s*0.42,s*0.16,s*0.08,-0.4,0,7); c.fill(); c.restore(); },
  scrap(c,s){ c.strokeStyle="#2e3440"; c.lineWidth=Math.max(1,s*0.06); c.fillStyle=OWN.lg(c,0,-s*0.25,0,s*0.25,[[0,"#d8dde6"],[0.5,"#9aa3b2"],[1,"#5e6676"]]); c.beginPath(); c.rect(-s*0.2,-s*0.22,s*1.25,s*0.44); c.fill(); c.stroke();
    c.strokeStyle="rgba(40,46,56,.7)"; c.lineWidth=1; for(let i=0;i<7;i++){ const xx=s*0.02+i*s*0.15; c.beginPath(); c.moveTo(xx,-s*0.22); c.lineTo(xx+s*0.08,s*0.22); c.stroke(); }
    c.fillStyle=OWN.lg(c,-s*0.8,-s*0.5,-s*0.2,s*0.5,[[0,"#e8ecf2"],[1,"#6e7686"]]); c.strokeStyle="#2e3440"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); for(let i=0;i<6;i++){ const a=i*Math.PI/3+Math.PI/6; c.lineTo(-s*0.5+Math.cos(a)*s*0.32,Math.sin(a)*s*0.55); } c.closePath(); c.fill(); c.stroke();
    c.fillStyle="rgba(255,255,255,.55)"; c.fillRect(-s*0.62,-s*0.38,s*0.08,s*0.5); },
  wrapper(c,s){ const col=["#ff7ab0","#ffd2e4"]; c.strokeStyle="#a83a6a"; c.lineWidth=Math.max(1,s*0.06);
    for(const sd of [-1,1]){ c.fillStyle=col[0]; c.beginPath(); c.moveTo(sd*s*0.5,-s*0.18); c.lineTo(sd*s*1.15,-s*0.5); c.lineTo(sd*s*1.05,-s*0.12); c.lineTo(sd*s*1.2,0); c.lineTo(sd*s*1.05,s*0.15); c.lineTo(sd*s*1.15,s*0.5); c.lineTo(sd*s*0.5,s*0.18); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(sd*s*0.6,-s*0.1); c.lineTo(sd*s*1.0,-s*0.32); c.moveTo(sd*s*0.6,s*0.1); c.lineTo(sd*s*1.0,s*0.32); c.stroke(); }
    c.fillStyle=OWN.lg(c,0,-s*0.5,0,s*0.5,[[0,"#ffa6cc"],[1,"#e0508e"]]); OWN.rr(c,-s*0.58,-s*0.42,s*1.16,s*0.84,s*0.3); c.fill(); c.stroke();
    c.save(); OWN.rr(c,-s*0.58,-s*0.42,s*1.16,s*0.84,s*0.3); c.clip(); c.fillStyle="#fff2f8"; for(let i=-3;i<4;i++){ c.beginPath(); c.moveTo(i*s*0.3,-s*0.5); c.lineTo(i*s*0.3+s*0.12,-s*0.5); c.lineTo(i*s*0.3+s*0.42,s*0.5); c.lineTo(i*s*0.3+s*0.3,s*0.5); c.fill(); } c.restore();
    c.fillStyle="rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-s*0.15,-s*0.25,s*0.3,s*0.07,0,0,7); c.fill(); },
  page(c,s){ c.save(); c.fillStyle=OWN.lg(c,-s,-s,s,s,[[0,"#fffdf4"],[1,"#e8dfc6"]]); c.strokeStyle="#9a8a62"; c.lineWidth=Math.max(1,s*0.05);
    c.beginPath(); c.moveTo(-s*0.75,-s*1.0); c.lineTo(s*0.75,-s*1.0); c.lineTo(s*0.75,s*0.75); c.quadraticCurveTo(s*0.6,s*0.95,s*0.35,s*1.0); for(let i=0;i<6;i++) c.lineTo(s*0.35-i*s*0.2,s*(1.0+(i%2?-0.06:0.04))); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle="rgba(60,60,90,.55)"; c.lineWidth=Math.max(0.8,s*0.05); for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(-s*0.55,-s*0.72+i*s*0.27); c.lineTo(s*(0.55-(i===5?0.4:atH(i)*0.25)),-s*0.72+i*s*0.27); c.stroke(); }
    c.fillStyle="#c03a3a"; c.beginPath(); c.arc(-s*0.45,-s*0.72,s*0.09,0,7); c.fill(); c.fillStyle="rgba(0,0,0,.08)"; c.beginPath(); c.moveTo(s*0.75,s*0.75); c.quadraticCurveTo(s*0.55,s*0.65,s*0.35,s*1.0); c.quadraticCurveTo(s*0.6,s*0.95,s*0.75,s*0.75); c.fill(); c.restore(); },
  candy(c,s,t,x){ const rock=/Rock/.test(x&&x.name||""); if(rock){ c.strokeStyle="#7a5a3a"; c.lineWidth=Math.max(1.2,s*0.1); c.beginPath(); c.moveTo(0,s*0.2); c.lineTo(0,s*1.2); c.stroke();
        const cols=["#b9e4ff","#ffc6e8","#d8c6ff"]; for(let i=0;i<7;i++){ const a=-Math.PI/2+(i-3)*0.42, L=s*(0.6+0.35*atH(i)); c.save(); c.rotate(a+Math.PI/2); c.fillStyle=cols[i%3]; c.strokeStyle="rgba(90,90,140,.6)"; c.lineWidth=1; c.beginPath(); c.moveTo(-s*0.18,0); c.lineTo(0,-L); c.lineTo(s*0.18,0); c.lineTo(0,s*0.18); c.closePath(); c.fill(); c.stroke(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.moveTo(-s*0.06,-s*0.05); c.lineTo(0,-L*0.8); c.lineTo(s*0.02,-s*0.05); c.fill(); c.restore(); } return; }
      c.fillStyle="#fff"; c.strokeStyle="#b02a3a"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.arc(0,0,s*0.7,0,7); c.fill(); c.stroke(); c.save(); c.beginPath(); c.arc(0,0,s*0.66,0,7); c.clip(); c.fillStyle="#e83a4a";
      for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(0,0); c.arc(0,0,s*0.7,i/6*Math.PI*2,i/6*Math.PI*2+0.45); c.closePath(); c.fill(); } c.restore(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(-s*0.22,-s*0.28,s*0.2,s*0.1,-0.6,0,7); c.fill(); },
  pineapple(c,s){ c.strokeStyle="#7a4e10"; c.lineWidth=Math.max(1,s*0.06);
    for(let i=0;i<5;i++){ const a=-Math.PI/2+(i-2)*0.35, L=s*(0.8-Math.abs(i-2)*0.12); c.fillStyle=i%2?"#4ea84a":"#6cc85a"; c.save(); c.translate(0,-s*0.6); c.rotate(a+Math.PI/2); c.beginPath(); c.moveTo(-s*0.12,0); c.quadraticCurveTo(-s*0.08,-L*0.6,0,-L); c.quadraticCurveTo(s*0.08,-L*0.6,s*0.12,0); c.fill(); c.strokeStyle="#2e6a2a"; c.stroke(); c.restore(); }
    c.fillStyle=OWN.rg(c,0,s*0.1,s*0.1,s*0.8,[[0,"#ffd84a"],[1,"#d08a1a"]],-s*0.2,-s*0.2); c.beginPath(); c.ellipse(0,s*0.15,s*0.6,s*0.8,0,0,7); c.fill(); c.strokeStyle="#7a4e10"; c.stroke();
    c.save(); c.beginPath(); c.ellipse(0,s*0.15,s*0.6,s*0.8,0,0,7); c.clip(); c.strokeStyle="rgba(140,90,20,.7)"; c.lineWidth=1; for(let i=-4;i<5;i++){ c.beginPath(); c.moveTo(i*s*0.3-s,-s); c.lineTo(i*s*0.3+s,s*1.2); c.stroke(); c.beginPath(); c.moveTo(i*s*0.3+s,-s); c.lineTo(i*s*0.3-s,s*1.2); c.stroke(); }
    c.fillStyle="#8a5a10"; for(let i=-3;i<4;i++) for(let j=-3;j<4;j++){ c.beginPath(); c.arc(i*s*0.3+(j%2)*s*0.15,s*0.15+j*s*0.25,s*0.035,0,7); c.fill(); } c.restore(); },
  card(c,s0,t,x){ const s=s0*1.3, red=atH(Math.floor((x&&x.self?x.self.x:0)/7))>0.5; c.save(); c.fillStyle="rgba(0,0,0,.18)"; OWN.rr(c,-s*0.52,-s*0.68,s*1.1,s*1.44,s*0.14); c.fill(); c.fillStyle=OWN.lg(c,-s,-s,s,s,[[0,"#ffffff"],[1,"#eceae2"]]); c.strokeStyle="#6a6a7a"; c.lineWidth=Math.max(1,s*0.05);
    OWN.rr(c,-s*0.55,-s*0.72,s*1.1,s*1.44,s*0.14); c.fill(); c.stroke(); c.strokeStyle=red?"#e04a5a":"#2a2a3a"; c.lineWidth=Math.max(0.8,s*0.03); OWN.rr(c,-s*0.45,-s*0.62,s*0.9,s*1.24,s*0.1); c.stroke();
    const ink=red?"#e04a5a":"#22223a"; c.fillStyle=ink; if(red){ c.beginPath(); c.moveTo(0,s*0.3); c.bezierCurveTo(-s*0.55,-s*0.1,-s*0.25,-s*0.5,0,-s*0.2); c.bezierCurveTo(s*0.25,-s*0.5,s*0.55,-s*0.1,0,s*0.3); c.fill(); }
    else { c.beginPath(); c.moveTo(0,-s*0.38); c.bezierCurveTo(s*0.55,0,s*0.25,s*0.32,0,s*0.12); c.bezierCurveTo(-s*0.25,s*0.32,-s*0.55,0,0,-s*0.38); c.fill(); c.fillRect(-s*0.05,s*0.05,s*0.1,s*0.28); }
    c.font="bold "+Math.max(6,s*0.32)+"px system-ui"; c.fillText("A",-s*0.42,-s*0.38); c.save(); c.rotate(Math.PI); c.fillText("A",-s*0.42,-s*0.38); c.restore(); c.restore(); },
  ball(c,s,t){ c.save(); c.beginPath(); c.arc(0,0,s*0.75,0,7); c.clip(); const cols=["#ff5a5a","#ffffff","#4aa0ff","#ffffff","#ffd23a","#ffffff"]; for(let i=0;i<6;i++){ c.fillStyle=cols[i]; c.beginPath(); c.moveTo(0,0); c.arc(0,0,s,i/6*Math.PI*2,(i+1)/6*Math.PI*2); c.closePath(); c.fill(); }
    c.fillStyle=OWN.rg(c,0,0,s*0.1,s*0.8,[[0,"rgba(255,255,255,0)"],[1,"rgba(0,0,0,.28)"]],-s*0.25,-s*0.25); c.fillRect(-s,-s,s*2,s*2); c.restore(); c.strokeStyle="#5a4a4a"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.arc(0,0,s*0.75,0,7); c.stroke();
    c.fillStyle="#fff"; c.beginPath(); c.arc(0,0,s*0.14,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.75)"; c.beginPath(); c.ellipse(-s*0.3,-s*0.35,s*0.2,s*0.1,-0.6,0,7); c.fill(); },
  hat(c,s){ c.strokeStyle="#7a5a20"; c.lineWidth=Math.max(1,s*0.06); c.fillStyle=OWN.lg(c,0,-s*0.2,0,s*0.4,[[0,"#f0d48a"],[1,"#c09a48"]]); c.beginPath(); c.ellipse(0,s*0.2,s*1.3,s*0.42,0,0,7); c.fill(); c.stroke();
    c.strokeStyle="rgba(140,100,40,.6)"; c.lineWidth=0.9; for(let i=1;i<4;i++){ c.beginPath(); c.ellipse(0,s*0.2,s*(0.5+i*0.25),s*(0.16+i*0.08),0,0,7); c.stroke(); }
    c.fillStyle=OWN.lg(c,-s*0.6,0,s*0.6,0,[[0,"#d8b464"],[0.5,"#f4dc9a"],[1,"#b88e40"]]); c.strokeStyle="#7a5a20"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.moveTo(-s*0.6,s*0.15); c.bezierCurveTo(-s*0.6,-s*0.75,s*0.6,-s*0.75,s*0.6,s*0.15); c.closePath(); c.fill(); c.stroke();
    c.fillStyle="#c83a3a"; c.beginPath(); c.moveTo(-s*0.6,s*0.05); c.quadraticCurveTo(0,s*0.2,s*0.6,s*0.05); c.lineTo(s*0.6,-s*0.12); c.quadraticCurveTo(0,0,-s*0.6,-s*0.12); c.closePath(); c.fill();
    c.strokeStyle="rgba(140,100,40,.55)"; c.lineWidth=0.9; for(let i=0;i<5;i++){ c.beginPath(); c.moveTo(-s*0.45+i*s*0.22,-s*0.15); c.quadraticCurveTo(-s*0.4+i*s*0.2,-s*0.4,-s*0.3+i*s*0.15,-s*0.52); c.stroke(); } },
  pearl(c,s,t){ c.fillStyle=OWN.rg(c,0,0,s*0.05,s*0.7,[[0,"#ffffff"],[0.4,"#f4ecf6"],[0.75,"#dcd2ec"],[1,"#b4a8cc"]],-s*0.25,-s*0.25); c.beginPath(); c.arc(0,0,s*0.68,0,7); c.fill();
    c.save(); c.globalAlpha*=0.45; c.fillStyle=OWN.lg(c,-s*0.7,s*0.7,s*0.7,-s*0.7,[[0,"rgba(255,170,210,.9)"],[0.5,"rgba(160,230,255,.6)"],[1,"rgba(255,250,200,.0)"]]); c.beginPath(); c.arc(0,0,s*0.68,0,7); c.fill(); c.restore();
    c.fillStyle="#fff"; c.beginPath(); c.ellipse(-s*0.25,-s*0.28,s*0.18,s*0.1,-0.7,0,7); c.fill(); OWN.star(c,s*0.3,-s*0.4,s*0.25,"rgba(255,255,255,.9)",(t||0)/200); },
  disc(c,s,t){ c.fillStyle=OWN.rg(c,0,0,s*0.1,s*0.9,[[0,"#fff2b0"],[0.6,"#f4c040"],[1,"#b07818"]],-s*0.2,-s*0.2); c.strokeStyle="#7a5010"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); c.arc(0,0,s*0.85,0,7); c.fill(); c.stroke();
    c.strokeStyle="rgba(140,90,20,.8)"; c.lineWidth=Math.max(1,s*0.05); c.beginPath(); c.arc(0,0,s*0.55,0,7); c.stroke(); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; c.beginPath(); c.moveTo(Math.cos(a)*s*0.58,Math.sin(a)*s*0.58); c.lineTo(Math.cos(a)*s*0.8,Math.sin(a)*s*0.8); c.stroke(); }
    c.fillStyle=OWN.rg(c,0,0,s*0.02,s*0.3,[[0,"#7af0ff"],[1,"#1a7ab0"]],-s*0.08,-s*0.08); c.beginPath(); c.arc(0,0,s*0.25,0,7); c.fill(); c.strokeStyle="#0a4a70"; c.lineWidth=1; c.stroke(); c.fillStyle="rgba(255,255,255,.8)"; c.beginPath(); c.arc(-s*0.08,-s*0.08,s*0.07,0,7); c.fill(); },
  fish(c,s,t){ const flop=Math.sin((t||0)/45)*0.35; c.save(); c.strokeStyle="#1e4a7a"; c.lineWidth=Math.max(1,s*0.06);
    c.fillStyle="#5aa0e0"; c.save(); c.translate(-s*0.75,0); c.rotate(flop); c.beginPath(); c.moveTo(0,0); c.lineTo(-s*0.55,-s*0.45); c.quadraticCurveTo(-s*0.4,0,-s*0.55,s*0.45); c.closePath(); c.fill(); c.stroke(); c.strokeStyle="rgba(30,74,122,.5)"; c.lineWidth=0.8; for(let i=-1;i<=1;i++){ c.beginPath(); c.moveTo(-s*0.05,0); c.lineTo(-s*0.48,i*s*0.3); c.stroke(); } c.restore();
    c.fillStyle="#7ab8ec"; c.strokeStyle="#1e4a7a"; c.lineWidth=Math.max(1,s*0.06); c.beginPath(); c.moveTo(-s*0.1,-s*0.35); c.quadraticCurveTo(s*0.15,-s*0.7,s*0.35,-s*0.3); c.closePath(); c.fill(); c.stroke();
    c.fillStyle=OWN.lg(c,0,-s*0.45,0,s*0.45,[[0,"#4a86d0"],[0.55,"#9ad0f4"],[1,"#eef8ff"]]); c.beginPath(); c.ellipse(0,0,s*0.85,s*0.42,0,0,7); c.fill(); c.stroke();
    c.save(); c.beginPath(); c.ellipse(0,0,s*0.85,s*0.42,0,0,7); c.clip(); c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=0.9; for(let i=0;i<4;i++) for(let j=-1;j<=1;j++){ c.beginPath(); c.arc(-s*0.35+i*s*0.25,j*s*0.22,s*0.13,-1.2,1.2); c.stroke(); } c.restore();
    c.fillStyle="#fff"; c.beginPath(); c.arc(s*0.5,-s*0.08,s*0.13,0,7); c.fill(); c.fillStyle="#1a1a2a"; c.beginPath(); c.arc(s*0.53,-s*0.08,s*0.07,0,7); c.fill(); c.strokeStyle="#1e4a7a"; c.beginPath(); c.arc(s*0.82,s*0.08,s*0.08,-1.2,1.2); c.stroke(); c.restore(); },
  gravel(c,s){ c.fillStyle=OWN.lg(c,-s,-s,s,s,[[0,"#a8a29a"],[1,"#5e5852"]]); c.strokeStyle="#3a3632"; c.lineWidth=Math.max(1,s*0.07); c.beginPath(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, r=s*(0.6+0.25*atH(i+5)); c.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.85); } c.closePath(); c.fill(); c.stroke();
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
