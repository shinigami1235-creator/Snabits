/* Snabits music. The synth engine is ported from Crater Kings (FM electric piano, bells, square and saw leads,
   pads, drums from noise). Every tune below is an original composition for Snabits, in a handheld-RPG chiptune style:
   a calm camera tune, a morning ranch tune, a night tune, a town tune, a wild battle, the tournament ring and a boss.
   The track follows whatever screen is up. */
let AC=null, MC=null;
const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nm(s){const m=/^([A-G])(#|b)?(\d)$/.exec(s);return NOTE[m[1]]+(m[2]==="#"?1:m[2]==="b"?-1:0)+12*(+m[3]+1);}
const mf=m=>440*Math.pow(2,(m-69)/12);
const QUAL={maj7:[0,4,7,11],m7:[0,3,7,10],"7":[0,4,7,10],m:[0,3,7],"":[0,4,7],sus:[0,5,7],add9:[0,4,7,14]};
function chordP(s){const m=/^([A-G])(#|b)?(.*)$/.exec(s);return{r:NOTE[m[1]]+(m[2]==="#"?1:m[2]==="b"?-1:0),iv:QUAL[m[3]]||QUAL[""]};}
function voiceCh(ch,lo){return ch.iv.map(i=>{const n=(ch.r+i)%12;return n+Math.ceil((lo-n)/12)*12;}).sort((a,b)=>a-b);}
function parseMel(bars){return bars.map(str=>{const tk=str.trim().split(/\s+/),ev=[];for(let i=0;i<16;i++){const x=tk[i];if(x&&x!=="-"&&x!=="."){let l=1;while(i+l<16&&tk[i+l]==="-")l++;ev[i]={m:nm(x),l};}}return ev;});}
function holdLen(p,i){let l=1;while(i+l<p.length&&p[i+l]==="-")l++;return l;}

const TRACKS={
  scan:{name:"Shutter Song",bpm:110,lead:"bell",lv:0.19,comp:"ep",bassK:"slap",calm:true,
    dr:{k:"x......x..x.....",s:"....x.......x...",h:"x.x.x.x.x.x.x.x."},
    bs:"R..R..O.R.5.O..R",cp:"L-------..C..C..",form:["A","A"],
    sec:{A:{ch:["Cmaj7","Am7","Dm7","G7","Cmaj7","Am7","Fmaj7|G7","Cmaj7"],mel:[
      "E5 - G5 - B5 - - - C6 - - - B5 - G5 -",
      "A5 - - - - - E5 - - - G5 - A5 - C6 -",
      "D6 - - - C6 - A5 - F5 - - - A5 - - -",
      "G5 - - - - - - - . . B4 - D5 - F5 -",
      "E5 - - - G5 - - - C6 - - - D6 - E6 -",
      "E6 - - - C6 - - - A5 - - - G5 - A5 -",
      "A5 - - - F5 - - - D5 - - - F5 - B5 -",
      "C6 - - - - - - - . . . . . . . ."]}}},
  day:{name:"Morning Chores",bpm:104,lead:"bell",lv:0.19,comp:"ep",bassK:"pick",calm:true,
    dr:{k:"x.......x.......",s:"....r.......r...",h:"..x...x...x...x."},
    bs:"R...R.5.R...O.5.",cp:"L-----..C-..C-..",form:["A","B","A","B"],
    sec:{A:{ch:["Dmaj7","Gmaj7","Em7","A7","Dmaj7","Bm7","Em7|A7","D"],mel:[
      "F#5 - - - A5 - - - D6 - - - C#6 - A5 -",
      "B5 - - - - - - - . . G5 - A5 - B5 -",
      "G5 - - - F#5 - E5 - - - B4 - E5 - G5 -",
      "A5 - - - - - - - . . . . C#5 - E5 -",
      "F#5 - - - A5 - - - D6 - - - E6 - F#6 -",
      "D6 - - - B5 - - - F#5 - - - A5 - B5 -",
      "G5 - - - E5 - - - C#5 - - - E5 - G5 -",
      "F#5 - - - - - - - D5 - - - . . . ."]},
      B:{ch:["Gmaj7","A","F#m7","Bm7","Em7","A","Bm7|E7","A7"],mel:[
      "D6 - - - B5 - - - G5 - - - A5 - B5 -",
      "C#6 - - - - - A5 - - - E5 - - - . .",
      "A5 - - - C#6 - - - E6 - - - C#6 - A5 -",
      "B5 - - - - - - - . . D6 - C#6 - B5 -",
      "G5 - - - B5 - - - E6 - - - D6 - B5 -",
      "C#6 - - - - - - - A5 - B5 - C#6 - D6 -",
      "D6 - - - B5 - - - G#5 - - - B5 - D6 -",
      "C#6 - - - - - - - . . . . . . . ."]}}},
  night:{name:"Lantern Hours",bpm:80,lead:"whistle",lv:0.14,comp:"pad",bassK:"pick",calm:true,
    dr:{k:"x.........x.....",s:"................",h:"..s...s...s...s."},
    bs:"R.......5.......",cp:"L---------------",ar:"0.2.1.3.0.2.1.3.",form:["A","A"],
    sec:{A:{ch:["Dm7","Bbmaj7","Fmaj7","C","Dm7","Bbmaj7","Gm7","A7"],mel:[
      "A5 - - - - - - - F5 - - - G5 - A5 -",
      "D5 - - - - - - - . . . . F5 - - -",
      "E5 - - - - - F5 - A5 - - - C6 - - -",
      "G5 - - - - - - - . . . . . . . .",
      "A5 - - - C6 - - - D6 - - - C6 - A5 -",
      "Bb5 - - - - - - - A5 - - - F5 - - -",
      "G5 - - - - - - - Bb5 - - - A5 - G5 -",
      "E5 - - - - - - - . . . . . . . ."]}}},
  town:{name:"Market Lane",bpm:118,lead:"whistle",lv:0.19,comp:"skank",bassK:"pick",
    dr:{k:"x.........x.....",s:"....x.......x...",h:"x.x.x.x.x.x.x.xo"},
    bs:"R..R..5.R..R..O.",cp:"..C...C...C...C.",form:["A","B","A","B"],
    sec:{A:{ch:["G","C","D","G","Em","C","A7|D7","G"],mel:[
      "D5 - G5 - B5 - - - A5 - G5 - B5 - - -",
      "C6 - - - B5 - A5 - G5 - - - E5 - - -",
      "F#5 - - - A5 - - - D6 - C6 - A5 - - -",
      "B5 - - - G5 - - - . . D5 - E5 - F#5 -",
      "G5 - - - B5 - - - E6 - D6 - B5 - - -",
      "C6 - - - E6 - - - C6 - B5 - A5 - G5 -",
      "C#6 - - - A5 - - - F#5 - - - A5 - C6 -",
      "B5 - - - - - - - G5 - - - . . . ."]},
      B:{ch:["Am7","D7","Bm7","Em","Am7","D7","Gmaj7","D7"],mel:[
      "E5 - - - A5 - - - C6 - - - B5 - A5 -",
      "F#5 - - - - - - - . . D5 - F#5 - A5 -",
      "D6 - - - - - B5 - - - A5 - F#5 - - -",
      "G5 - - - - - - - . . E5 - F#5 - G5 -",
      "A5 - - - C6 - - - E6 - - - D6 - C6 -",
      "A5 - - - - - F#5 - - - D5 - - - . .",
      "B5 - - - D6 - - - F#6 - - - D6 - B5 -",
      "A5 - - - - - - - . . F#5 - A5 - C6 -"]}}},
  wild:{name:"Something Moved",bpm:150,lead:"sqep",lv:0.17,comp:"ep",bassK:"slap",
    dr:{k:"x.....x...x.....",s:"....x.......x...",h:"x.xxx.x.x.xxx.xo"},
    bs:"R.RO..R.R.RO.5R.",cp:"..C..C....C..C-.",form:["A","B","A","B"],
    sec:{A:{ch:["Em","C","D","Bm","Em","C","Am|B7","B7"],mel:[
      "E5 - G5 - B5 - - - E6 - - - D6 - B5 -",
      "C6 - - - - - G5 - - - E5 - G5 - C6 -",
      "D6 - - - A5 - F#5 - - - A5 - D6 - E6 -",
      "F#6 - - - - - - - . . D6 - B5 - F#5 -",
      "G5 - - - E5 - - - B5 - - - G5 - E5 -",
      "E6 - - - - - C6 - G5 - - - E5 - G5 -",
      "A5 - - - C6 - - - D#6 - - - F#5 - A5 -",
      "B5 - - - - - - - . . . . D#6 - F#6 -"]},
      B:{ch:["Cmaj7","D","Bm7","Em","Cmaj7","D","B7","B7"],mel:[
      "G5 - - - - - E5 - G5 - B5 - - - C6 -",
      "D6 - - - - - - - . . F#5 - A5 - D6 -",
      "F#6 - - - - - D6 - - - B5 - - - A5 -",
      "B5 - - - - - - - . . G5 - A5 - B5 -",
      "C6 - - - B5 - - - G5 - - - E5 - G5 -",
      "A5 - - - - - D6 - - - F#6 - - - E6 -",
      "D#6 - - - - - - - F#6 - - - D#6 - B5 -",
      "A5 - - - - - F#5 - - - D#5 - - - . ."]}}},
  train:{name:"Work It Out",bpm:124,lead:"sqep",lv:0.17,comp:"skank",bassK:"slap",
    dr:{k:"x...x...x...x...",s:"....x.......x..x",h:"x.xox.xox.xox.xo"},
    bs:"R.R.O.R.R.R.5.O.",cp:"..C...C...C...C.",form:["A","B","A","B"],
    sec:{A:{ch:["G","D","Em","C","G","D","C|D","G"],mel:[
      "D5 - G5 - B5 - - - D6 - - - B5 - G5 -",
      "A5 - - - F#5 - A5 - D6 - - - . . A5 -",
      "B5 - - - G5 - E5 - G5 - B5 - E6 - - -",
      "C6 - - - - - G5 - E5 - - - . . G5 -",
      "B5 - D6 - G6 - - - F#6 - - - D6 - B5 -",
      "A5 - - - D6 - - - F#6 - - - E6 - D6 -",
      "E6 - - - C6 - - - D6 - - - F#6 - - -",
      "G6 - - - - - - - . . D6 - B5 - G5 -"]},
      B:{ch:["Em","C","G","D","Em","C","Am|D","D"],mel:[
      "E5 - - - G5 - - - B5 - - - A5 - G5 -",
      "E5 - - - - - - - . . C5 - E5 - G5 -",
      "D5 - - - G5 - - - B5 - - - D6 - B5 -",
      "A5 - - - - - - - . . F#5 - A5 - D6 -",
      "E6 - - - D6 - B5 - - - G5 - B5 - E6 -",
      "G6 - - - E6 - - - C6 - - - E6 - G6 -",
      "F#6 - - - E6 - - - D6 - - - C6 - A5 -",
      "D6 - - - - - - - . . A5 - B5 - C6 -"]}}},
  cup:{name:"Ring of Eight",bpm:136,lead:"crystal",lv:0.18,comp:"pad",bassK:"pick",
    dr:{k:"x...x...x...x...",s:"....x.......x...",h:"x.o.x.o.x.o.x.o."},
    bs:"R.R.O.R.R.R.O.5.",cp:"L---------------",ar:"0123212301232123",form:["A","B","A","B"],
    sec:{A:{ch:["Bb","F","Gm","Eb","Bb","F","Eb|F","Bb"],mel:[
      "D6 - - - F5 - Bb5 - - - D6 - F6 - - -",
      "F6 - - - - - - - C6 - - - A5 - C6 -",
      "D6 - - - - - Bb5 - G5 - - - Bb5 - D6 -",
      "Eb6 - - - - - - - . . . . D6 - C6 -",
      "Bb5 - - - D6 - - - F6 - - - G6 - F6 -",
      "C6 - - - - - A5 - F5 - - - A5 - C6 -",
      "Eb6 - - - D6 - Bb5 - A5 - - - C6 - - -",
      "Bb5 - - - - - - - . . . . . . . ."]},
      B:{ch:["Gm","Eb","Bb","F","Gm","Eb","Cm7","F7"],mel:[
      "G5 - - - Bb5 - - - D6 - - - G6 - - -",
      "G6 - - - F6 - Eb6 - - - Bb5 - - - . .",
      "F6 - - - - - D6 - Bb5 - - - D6 - F6 -",
      "F6 - - - - - - - . . C6 - D6 - Eb6 -",
      "D6 - - - - - Bb5 - - - G5 - Bb5 - D6 -",
      "Eb6 - - - G6 - - - F6 - Eb6 - D6 - - -",
      "C6 - - - Eb6 - - - G6 - - - F6 - Eb6 -",
      "F6 - - - - - - - Eb6 - - - A5 - C6 -"]}}},
  boss:{name:"Crowned Beast",bpm:156,lead:"saw",lv:0.15,comp:"pow",bassK:"saw",
    dr:{k:"x.x...x.x.x...x.",s:"....x.......x...",h:"xxxxxxxxxxxxxxxx"},
    bs:"RRORRRORRRORRROR",cp:"C.....C.....C...",form:["A","B","A","B"],
    sec:{A:{ch:["Dm","Bb","C","Am","Dm","Bb","Gm|A","A"],mel:[
      "D5 - - - A5 - D6 - - - F6 - E6 - D6 -",
      "D6 - - - - - Bb5 - F5 - - - Bb5 - D6 -",
      "E6 - - - C6 - G5 - - - C6 - E6 - G6 -",
      "E6 - - - - - - - . . C6 - D6 - E6 -",
      "F6 - - - E6 - D6 - A5 - - - D6 - F6 -",
      "F6 - - - - - D6 - - - Bb5 - - - A5 -",
      "G5 - - - Bb5 - D6 - C#6 - - - E6 - G6 -",
      "A6 - - - - - - - E6 - - - C#6 - A5 -"]},
      B:{ch:["Gm","A","Dm","Bb","Gm","A","Bb|C","A"],mel:[
      "G5 - Bb5 - D6 - - - G6 - - - F6 - D6 -",
      "E6 - - - - - C#6 - A5 - - - . . . .",
      "D6 - F6 - A6 - - - F6 - - - D6 - A5 -",
      "Bb5 - - - - - - - D6 - - - F6 - - -",
      "G6 - - - F6 - D6 - Bb5 - - - D6 - G6 -",
      "A6 - - - G6 - E6 - C#6 - - - E6 - - -",
      "F6 - - - D6 - Bb5 - E6 - - - G6 - - -",
      "A6 - - - - - - - . . . . . . . ."]}}},
};
for(const k in TRACKS)for(const s in TRACKS[k].sec){const S=TRACKS[k].sec[s];S.ev=parseMel(S.mel);S.cp=S.ch.map(c=>c.split("|").map(chordP));}

const MUS={on:true,cur:null,tr:null,bus:null,nb:null,vol:.3,tgt:-1,jingleT:0,timer:0};
try{ if(localStorage.getItem("snabits.music")==="0") MUS.on=false; }catch(e){}

function mo(type,f,t){const o=MC.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);return o;}
function mg(v){const g=MC.createGain();g.gain.value=v;return g;}
function adsr(g,t,v,a,sus,tau,end,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setTargetAtTime(v*sus,t+a,tau);g.gain.setTargetAtTime(0,end,rel);}
function nsrc(t,dur){const s=MC.createBufferSource();s.buffer=MUS.nb;s.start(t,Math.random()*.9);s.stop(t+dur);return s;}
/* instruments */
function iEP(d,t,m,dur,v){const f=mf(m),c=mo("sine",f,t),m1=mo("sine",f,t),m2=mo("sine",f*7,t),g1=MC.createGain(),g2=MC.createGain(),g=MC.createGain();
  g1.gain.setValueAtTime(f*2.2,t);g1.gain.setTargetAtTime(f*.3,t,.18);g2.gain.setValueAtTime(f*1.1,t);g2.gain.setTargetAtTime(0,t,.02);
  m1.connect(g1);g1.connect(c.frequency);m2.connect(g2);g2.connect(c.frequency);
  const e=t+Math.max(dur,.06);adsr(g,t,v,.004,.35,.3,e,.08);c.connect(g);g.connect(d);
  for(const o of[c,m1,m2]){o.start(t);o.stop(e+.5);}}
function iBell(d,t,m,dur,v){const f=mf(m),c=mo("sine",f,t),m1=mo("sine",f*3.5,t),g1=MC.createGain(),g=MC.createGain();
  g1.gain.setValueAtTime(f*2.6,t);g1.gain.setTargetAtTime(f*.15,t,.12);m1.connect(g1);g1.connect(c.frequency);
  const e=t+Math.max(dur,.1);adsr(g,t,v,.003,.25,.35,e,.25);c.connect(g);g.connect(d);c.start(t);m1.start(t);c.stop(e+1.2);m1.stop(e+1.2);}
function iLead(d,t,m,dur,v,type,cut,det){const f=mf(m),fl=MC.createBiquadFilter(),g=MC.createGain(),os=[];
  fl.type="lowpass";fl.frequency.setValueAtTime(cut*1.8,t);fl.frequency.setTargetAtTime(cut,t,.07);fl.Q.value=1.5;
  for(const dt of det){const o=mo(type,f,t);o.detune.value=dt;o.connect(fl);os.push(o);}
  if(dur>.2){const l=mo("sine",5.6,t),lg=MC.createGain();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(0,t+.12);lg.gain.linearRampToValueAtTime(f*.011,t+Math.min(dur,.45));l.connect(lg);for(const o of os)lg.connect(o.frequency);os.push(l);}
  const e=t+Math.max(dur,.06);adsr(g,t,v/Math.sqrt(det.length),.006,.72,.18,e,.05);fl.connect(g);g.connect(d);for(const o of os){o.start(t);o.stop(e+.4);}}
function iWhistle(d,t,m,dur,v){const f=mf(m),o=mo("sine",f,t),o2=mo("triangle",f*2,t),g=MC.createGain(),g2=mg(.18),l=mo("sine",5.2,t),lg=MC.createGain();
  o.frequency.setValueAtTime(f*.985,t);o.frequency.linearRampToValueAtTime(f,t+.03);
  lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.014,t+Math.min(dur,.4));l.connect(lg);lg.connect(o.frequency);
  const e=t+Math.max(dur,.06);adsr(g,t,v,.02,.8,.2,e,.06);o.connect(g);o2.connect(g2);g2.connect(g);g.connect(d);for(const x of[o,o2,l]){x.start(t);x.stop(e+.4);}}
function iBass(d,t,m,dur,v,k){const f=mf(m),fl=MC.createBiquadFilter(),g=MC.createGain(),os=[];fl.type="lowpass";
  if(k==="saw"){os.push(mo("sawtooth",f,t),mo("square",f/2,t));fl.frequency.setValueAtTime(2400,t);fl.frequency.setTargetAtTime(300,t,.06);fl.Q.value=5;}
  else if(k==="slap"){os.push(mo("square",f,t),mo("sine",f,t));fl.frequency.setValueAtTime(3000,t);fl.frequency.setTargetAtTime(420,t,.045);fl.Q.value=4;}
  else{os.push(mo("triangle",f,t),mo("square",f,t));fl.frequency.setValueAtTime(1500,t);fl.frequency.setTargetAtTime(520,t,.08);fl.Q.value=2;}
  const e=t+Math.max(dur,.05);adsr(g,t,v,.004,.6,.12,e,.04);for(const o of os){o.connect(fl);o.start(t);o.stop(e+.3);}fl.connect(g);g.connect(d);}
function iPad(d,t,ms,dur,v){const fl=MC.createBiquadFilter(),g=MC.createGain();fl.type="lowpass";fl.frequency.value=1500;fl.Q.value=.7;
  const e=t+dur,os=[];for(const m of ms)for(const dt of[-9,9]){const o=mo("sawtooth",mf(m),t);o.detune.value=dt;o.connect(fl);os.push(o);}
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.18);g.gain.setTargetAtTime(v*.8,t+.18,.4);g.gain.setTargetAtTime(0,e,.15);
  fl.connect(g);g.connect(d);for(const o of os){o.start(t);o.stop(e+.8);}}
function iPow(d,t,ms,dur,v){const fl=MC.createBiquadFilter(),g=MC.createGain();fl.type="lowpass";fl.frequency.setValueAtTime(3200,t);fl.frequency.setTargetAtTime(900,t,.12);
  const r=ms[0],e=t+dur,os=[];for(const m of[r,r+7,r+12]){const o=mo("sawtooth",mf(m),t);o.connect(fl);os.push(o);}
  adsr(g,t,v,.005,.5,.12,e,.06);fl.connect(g);g.connect(d);for(const o of os){o.start(t);o.stop(e+.4);}}
function dKick(d,t,v){const o=mo("sine",165,t),g=MC.createGain();o.frequency.exponentialRampToValueAtTime(44,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.34);o.connect(g);g.connect(d);o.start(t);o.stop(t+.36);}
function dNoise(d,t,dur,v,type,f,q=1){const s=nsrc(t,dur+.02),fl=MC.createBiquadFilter(),g=MC.createGain();fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);g.connect(d);}
function dSnare(d,t,v){dNoise(d,t,.17,v,"highpass",1400);const o=mo("triangle",210,t),g=MC.createGain();o.frequency.exponentialRampToValueAtTime(150,t+.07);g.gain.setValueAtTime(v*.8,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(g);g.connect(d);o.start(t);o.stop(t+.1);}
function dClap(d,t,v){for(let i=0;i<3;i++)dNoise(d,t+i*.011,i<2?.03:.16,v*(i<2?.7:1),"bandpass",1300,1.2);}
function dRim(d,t,v){const o=mo("square",1650,t),g=MC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.035);o.connect(g);g.connect(d);o.start(t);o.stop(t+.04);dNoise(d,t,.03,v*.6,"bandpass",3500,2);}

/* one 16th step of a track */
function musStep(tr,t,sp,hot){
  const D=tr.def,bar=Math.floor(tr.n/16),s=tr.n%16,fi=Math.floor(bar/8)%D.form.length,b=bar%8;
  const S=D.sec[D.form[fi]],full=fi>=D.form.length/2||hot,dst=tr.g,last=b===7;
  const chs=S.cp[b],ch=chs.length>1&&s>=8?chs[1]:chs[0],half=chs.length>1?8:16,ci=chs.length>1&&s>=8?8:0;
  if(D.dr.k[s]==="x"&&!(last&&s>=12&&!D.calm))dKick(dst,t,.6);
  if(last&&s>=12&&!D.calm)dSnare(dst,t,.22+.08*(s-12));
  else{const sn=D.dr.s[s];if(sn==="x")dSnare(dst,t,.42);else if(sn==="c")dClap(dst,t,.5);else if(sn==="r")dRim(dst,t,.22);}
  const h=hot?"x":D.dr.h[s];
  if(h==="x")dNoise(dst,t,.035,s%4===2?.13:.08,"highpass",8000);else if(h==="o")dNoise(dst,t,.2,.1,"highpass",7000);else if(h==="s")dNoise(dst,t,.03,s%2?.05:.08,"bandpass",6500,1.5);
  if(b===0&&s===0&&!D.calm)dNoise(dst,t,1.3,.13,"highpass",4200);
  const bp=D.bs[s],root=ch.r+Math.ceil((33-ch.r)/12)*12;
  if(bp!=="."&&bp!=="-"){const m=bp==="O"?root+12:bp==="5"?root+7:root;iBass(dst,t,m,sp*holdLen(D.bs,s)*.8,D.bassK==="saw"?.17:.25,D.bassK);}
  const cp=D.cp[s],vc=voiceCh(ch,D.comp==="pad"?52:57);
  if(cp==="C"||cp==="L"){const len=cp==="L"?Math.min(holdLen(D.cp,s),half-(s-ci)):1.5;
    if(D.comp==="pad"){if(s===ci)iPad(dst,t,vc,sp*half*.98,.035);}
    else if(D.comp==="pow")iPow(dst,t,[root+12],sp*len,.07);
    else for(const m of vc)iEP(dst,t,m,sp*len,D.comp==="skank"?.05:.055);}
  if(D.comp==="pad"&&s===ci&&cp!=="L")iPad(dst,t,vc,sp*half*.98,.035);
  if(D.ar&&D.ar[s]!=="."){const tones=voiceCh(ch,64),all=tones.concat(tones.map(x=>x+12)),i=+D.ar[s];iBell(dst,t,all[i%all.length]+(full&&s%8===7?12:0),sp,.045);}
  const ev=S.ev[b][s];
  if(ev){const dur=sp*ev.l*.92,v=D.lv;
    if(D.lead==="sqep"){iLead(dst,t,ev.m,dur,v*.75,"square",3000,[0]);iEP(dst,t,ev.m,dur,v*.6);}
    else if(D.lead==="bell"){iEP(dst,t,ev.m,dur,v);iBell(dst,t,ev.m+12,dur,v*.25);}
    else if(D.lead==="whistle"){iWhistle(dst,t,ev.m,dur,v);iBell(dst,t,ev.m-12,Math.min(dur,sp*2),v*.3);}
    else if(D.lead==="crystal"){iLead(dst,t,ev.m,dur,v*.8,"triangle",5000,[0]);iBell(dst,t,ev.m,dur,v*.45);}
    else if(D.lead==="saw")iLead(dst,t,ev.m,dur,v*1.1,"sawtooth",2600,[-10,10]);
    if(full&&D.lead!=="bell")iBell(dst,t,ev.m+12,Math.min(dur,sp*3),v*.22);}
}

/* Sound only starts after a tap, since phones block audio until then. */
function audioInit(){
  if(!AC){ try{ AC=new(window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=null; return; } }
  if(AC.state==="suspended") AC.resume();
  if(MUS.bus) return;
  MC=AC; const nb=AC.createBuffer(1,AC.sampleRate*1.5,AC.sampleRate),d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; MUS.nb=nb;
  MUS.bus=AC.createGain(); MUS.bus.gain.value=0;
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-16; comp.ratio.value=3; comp.attack.value=.01; comp.release.value=.2;
  MUS.bus.connect(comp); comp.connect(AC.destination); MUS.timer=setInterval(musTick,25);
}
addEventListener("pointerdown",audioInit,{capture:true}); addEventListener("keydown",audioInit,{capture:true});
document.addEventListener("visibilitychange",()=>{ if(!AC) return; if(document.hidden) AC.suspend(); else AC.resume(); });

const shown=id=>{ const e=document.getElementById(id); return !!e&&e.style.display!=="none"&&getComputedStyle(e).display!=="none"; };
/* Which tune fits the screen right now. */
function musWant(){
  if(performance.now()<MUS.jingleT) return null;
  if(typeof B!=="undefined"&&B&&shown("battle")) return B.mus||"cup";
  if(typeof WILD!=="undefined"&&WILD) return "wild";
  if(shown("venue")) return "cup";
  if(shown("ob")) return "town";
  if(typeof RS!=="undefined"&&RS&&shown("ranch")){
    if(RS.inTown) return "town";
    if(RS.training&&ranchHour()<19) return "train";
    const h=ranchHour(); return h<6||h>=19?"night":"day";
  }
  return "scan";
}
function musPlay(key){
  const now=AC.currentTime;
  if(MUS.tr){const o=MUS.tr;o.g.gain.cancelScheduledValues(now);o.g.gain.setValueAtTime(o.g.gain.value,now);o.g.gain.linearRampToValueAtTime(0,now+2);MUS.fading=(MUS.fading||[]).concat(o);setTimeout(()=>{o.g.disconnect();MUS.fading=MUS.fading.filter(x=>x!==o);},2600);}
  MUS.cur=key;MUS.tr=null;if(!key||!TRACKS[key])return;
  const g=AC.createGain();g.gain.setValueAtTime(0,now);g.gain.setValueAtTime(0,now+.4);g.gain.linearRampToValueAtTime(1,now+2.9);g.connect(MUS.bus);
  MUS.tr={def:TRACKS[key],g,n:0,t:now+.1};
}
function musTick(){
  if(!AC||AC.state!=="running")return; MC=AC;
  const want=musWant(); if(want!==MUS.cur) musPlay(want);
  const tgt=MUS.on?MUS.vol:0;
  if(tgt!==MUS.tgt){MUS.tgt=tgt;MUS.bus.gain.setTargetAtTime(tgt,AC.currentTime,.12);}
  const tr=MUS.tr; if(!MUS.on) return;
  const now=AC.currentTime; if(!tr){ for(const o of MUS.fading||[]){ const sp2=60/o.def.bpm/4; if(o.t<now-.1) o.t=now+.05; while(o.t<now+.16){musStep(o,o.t,sp2,false);o.t+=sp2;o.n++;} } return; }
  if(tr.t<now-.1) tr.t=now+.05;
  const B0=typeof B!=="undefined"&&B&&B.fight, hot=!!(B0&&!B.fight.over&&B.fight.p[0].hp<B.fight.p[0].maxhp*.25);
  const sp=60/(tr.def.bpm*(hot?1.06:1))/4;
  while(tr.t<now+.16){musStep(tr,tr.t,sp,hot);tr.t+=sp;tr.n++;}
  for(const o of MUS.fading||[]){ const sp2=60/o.def.bpm/4; if(o.t<now-.1) o.t=now+.05; while(o.t<now+.16){musStep(o,o.t,sp2,false);o.t+=sp2;o.n++;} }   // the outgoing tune keeps playing while it fades
}
/* Short stingers: win, loss, and evolving. */
function musJingle(kind){
  if(!AC||!MUS.bus||!MUS.on) return false; MC=AC;
  const g=AC.createGain(); g.gain.value=1; g.connect(MUS.bus); const t=AC.currentTime+.05; let len;
  if(kind===true){
    [72,76,79,84].forEach((m,i)=>{iLead(g,t+i*.1,m,.1,.12,"square",3200,[0]);iEP(g,t+i*.1,m,.1,.1);});
    [81,79,84].forEach((m,i)=>iLead(g,t+.5+i*.16,m,.14,.12,"square",3200,[0]));
    for(const m of[72,76,79,84])iEP(g,t+1,m,1.3,.07); iLead(g,t+1,88,1.2,.13,"square",3400,[0]); iBell(g,t+1,96,1.2,.06);
    dKick(g,t+1,.8); dNoise(g,t+1,1.6,.16,"highpass",4200); iBass(g,t+1,36,1.2,.3,"pick"); len=4200;
  } else if(kind==="evo"){
    [60,64,67,71,72,76,79,83,84].forEach((m,i)=>iBell(g,t+i*.11,m,.3,.07));
    for(const m of[60,67,72,76,79])iPad(g,t+1.05,[m],2.2,.03);
    iLead(g,t+1.05,88,1.6,.12,"triangle",5000,[0]); iBell(g,t+1.05,100,1.8,.05); dNoise(g,t+1.05,2,.12,"highpass",5000); len=4600;
  } else {
    [67,66,65].forEach((m,i)=>iLead(g,t+i*.26,m,.22,.1,"triangle",2400,[0]));
    for(const m of[60,63,67])iEP(g,t+.8,m,1.2,.06); iBass(g,t+.8,36,1.1,.26,"pick"); len=3600;
  }
  setTimeout(()=>g.disconnect(),len+500);
  MUS.jingleT=performance.now()+len; if(MUS.tr) musPlay(null); MUS.cur=null; return true;
}
function musToggle(){
  MUS.on=!MUS.on; try{ localStorage.setItem("snabits.music",MUS.on?"1":"0"); }catch(e){}
  musLabels();
  if(MUS.on) audioInit();
}
musLabels();
function musLabels(){ document.querySelectorAll(".musbtn").forEach(b=>{ b.textContent=b.closest("#bottom")?"♪":MUS.on?"Music on":"Music off"; b.setAttribute("aria-label",MUS.on?"Music on":"Music off"); b.style.opacity=MUS.on?1:.45; }); }
/* Render a tune offline, for testing. */
async function musRender(key,secs){
  const sr=44100,oc=new OfflineAudioContext(1,sr*secs,sr),prev=MC,prevNb=MUS.nb;MC=oc;
  const nb=oc.createBuffer(1,sr*1.5,sr),dd=nb.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1;MUS.nb=nb;
  const bus=oc.createGain();bus.gain.value=MUS.vol;const comp=oc.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.2;bus.connect(comp);comp.connect(oc.destination);
  const tr={def:TRACKS[key],g:bus,n:0},sp=60/tr.def.bpm/4;for(let t=.05;t<secs-.5;t+=sp){musStep(tr,t,sp,false);tr.n++;}
  MC=prev;MUS.nb=prevNb;const buf=await oc.startRendering();return buf.getChannelData(0);
}
