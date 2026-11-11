const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);
vm.runInContext(fs.readFileSync(''+require('path').join(__dirname,'../prototype/monster.js')+'','utf8')+';this.FAMILY=FAMILY;this.buildGrid=buildGrid;',c);
let bad=0;
for(const fam of Object.keys(c.FAMILY)){
  const F=c.FAMILY[fam], yb=F.body[0]+F.body[1].length-1; let ref=null;
  for(let e=0;e<7;e++)for(let m=0;m<5;m++)for(let t=0;t<5;t++)for(let a=0;a<5;a++){
    const G=c.buildGrid(fam,{eyes:e,mouth:m,top:t,arms:a});
    const rows=G.slice(yb+1).map(r=>r.join("")).join("|");
    let sym=true; for(let y=yb+1;y<20;y++) for(let x=0;x<10;x++) if(G[y][x]!==G[y][19-x]) sym=false;
    const legCount=G.slice(yb+1).flat().filter(v=>v).length;
    if(ref===null) ref=rows;
    if(!sym||rows!==ref||(F.legs!=="ghost"&&legCount<2)){ bad++; if(bad<6) console.log("BAD",fam,e,m,t,a,sym,legCount); }
  }
  console.log(fam,"legs rows ok, pixels below body:",ref.split("").filter(ch=>ch!=="0"&&ch!=="|").length);
}
console.log("bad combos:",bad);
