/* Version tracking. Every push to GitHub runs the Pages workflow, which writes the build number here and in version.json.
   The game checks version.json when it opens, every 5 minutes and whenever it comes back to the screen, and offers the update. */
const APP_VER="__VER__", APP_DATE="__DATE__";
const appVerNum=v=>/^\d+$/.test(String(v))?+v:0;
let VER_NEW=null;
async function verCheck(){
  if(APP_VER==="__VER__"||location.protocol==="file:") return null;
  try{
    const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"}); if(!r.ok) return null;
    const j=await r.json(); if(appVerNum(j.v)>appVerNum(APP_VER)){ VER_NEW=j; verBar(); } return j;
  }catch(e){ return null; }
}
function verUpdate(){ try{ if(typeof saveGame==="function"&&typeof PLAYER!=="undefined"&&PLAYER) saveGame(); }catch(e){} location.replace(location.pathname+"?v="+(VER_NEW?VER_NEW.v:Date.now())); }
function verBar(){
  let b=document.getElementById("verbar");
  if(!b){ b=document.createElement("div"); b.id="verbar"; document.body.appendChild(b); }
  b.innerHTML=`<span>Version ${VER_NEW.v} is out${VER_NEW.note?": "+VER_NEW.note:""}.</span><button id="verbtn">Update</button><button id="verx" aria-label="Later">Later</button>`;
  document.getElementById("verbtn").onclick=verUpdate;
  document.getElementById("verx").onclick=()=>b.remove();
}
verCheck(); setInterval(verCheck,5*60*1000);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) verCheck(); });
