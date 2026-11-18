"""Shared helpers for the audit drivers. Run the server first (tools/tests/serve.sh), then any script in this folder from anywhere."""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
BASE = 'http://localhost:8765/prototype/index.html'
HERE = os.path.dirname(os.path.abspath(__file__))

# in-page helpers: a pump that taps whatever is waiting for a tap, and a scan of the visible text for broken values
PUMP = r"""() => {
window.__audit = { bad: [], clicks: {} };
// a button counts only if a finger could reach it: shown, enabled, and nothing lying on top of it
window.__vis = e => { if (!e || e.offsetParent === null || e.disabled) return false; e.scrollIntoView({ block: 'center' });
  const r = e.getBoundingClientRect(), top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!top && (top === e || e.contains(top) || top.contains(e) && top.id !== 'atest'); };
window.__badText = () => { const t = document.body.innerText || ''; const m = t.match(/[^\n]{0,60}(\bNaN\b|\bundefined\b|\[object |\bInfinity\b)[^\n]{0,40}/); return m ? m[0] : null; };
// the game's sound functions swallow their own errors, so each one is rebuilt with a catch that keeps the error for the drivers to read
window.__patchSound = () => { window.__snd = window.__snd || [];
  for (const n of ['atSfx', 'rsfx', 'sfx', 'cry', 'elSfx', 'kindSfx']) { try { const src = (0, eval)(n).toString(), p = src.replace(/catch\s*\(\s*(\w+)\s*\)\s*\{\s*\}/g, (m, v) => `catch(${v}){ __snd.push('${n}: '+${v}); }`); if (p !== src) (0, eval)(n + '=' + p); } catch (e) { __snd.push('patch ' + n + ': ' + e); } }
  try { if (typeof audioInit === 'function') audioInit(); } catch (e) { __snd.push('audioInit: ' + e); } };
window.__pump = (o = {}) => {
  const A = window.__audit, hit = id => { const e = document.getElementById(id); if (__vis(e)) { e.click(); A.clicks[id] = (A.clicks[id] || 0) + 1; return true; } return false; };
  const b = __badText(); if (b && !A.bad.includes(b)) A.bad.push(b);
  if (document.querySelector('canvas.summon-cv')) { const c = document.querySelector('canvas.summon-cv'); c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c.click(); return 'summon'; }
  if (hit('tip-skip') || hit('tip-ok')) return 'tip';
  { const sk = document.querySelector('.show-skip'); if (sk && !o.watchShows) { sk.click(); return 'show-skip'; } }   // the cup show's Skip, so a long run doesn't sit through every table and face-off
  if (hit(o.scold ? 'r-sc' : 'r-pr')) return 'react';
  if (hit(o.no ? 'yn-n' : 'yn-y')) return 'yesno';
  { const v = document.querySelector('#r-panel [data-v]'); if (__vis(v)) { v.click(); return 'variant'; } }   // an evolution with more than one variant on offer waits for a pick
  { const h = document.querySelector('#atest .res h2'); if (h && __vis(document.getElementById('at-cont'))) A.lastRes = h.textContent; }   // what the fight screen said, for the drivers to compare
  if (hit('at-cont')) return 'at-cont';
  if (hit('at-fight')) return 'at-fight';
  { const sk = document.getElementById('at-shove'); if (__vis(sk) && /Skip/.test(sk.textContent) && !sk.classList.contains('on')) { sk.click(); return 'skip'; } }
  if (o.control && typeof AT !== 'undefined' && AT && AT.ar && !AT.ar.over && !AT.auto) { atSetAuto(true); return 'auto-on'; }
  if (o.control && typeof AT !== 'undefined' && AT && AT.auto && !AT.fast) AT.fast = true;   // a fight started by hand has no Skip button, so the driver speeds it up the way Skip would
  // the old turn battle (pixel art, hybrids): Skip on Auto, and a move tapped each turn when the fight is by hand
  if (hit('b-fast')) return 'b-fast';
  if (typeof B !== 'undefined' && B && B.opts && !B.opts.auto && !B.busy && !B.fight.over) { const bs = [...document.querySelectorAll('#b-btns .bbtn:not([disabled])')].filter(__vis); if (bs.length) { B.fast = true; bs[Math.floor(Math.random() * Math.min(bs.length, 5))].click(); return 'b-move'; } }
  if (hit(o.fight ? 't-fight' : 't-auto')) return 'match';
  if (hit('v-done')) return 'v-done';
  if (!o.keepReport && (hit('r-rok') || hit('tr-ok')) || hit('b-cont')) return 'ok';
  return null;
};
}"""

async def launch(p, hash='test', viewport=(390, 844), clear=True, title=False):
    b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
    ctx = await b.new_context(viewport=dict(width=viewport[0], height=viewport[1]), device_scale_factor=1)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:300]))
    pg.on('console', lambda m: errs.append('console: ' + m.text[:300]) if m.type == 'error' and 'favicon' not in m.text and 'ERR_' not in m.text else None)
    await pg.goto(BASE + ('#' + hash if hash else '')); await pg.wait_for_timeout(900)
    if clear: await pg.evaluate("()=>{ localStorage.clear(); }"); await pg.reload(); await pg.wait_for_timeout(900)
    await pg.evaluate(PUMP); await pg.evaluate("()=>__patchSound()")
    if hash and not title: await pg.evaluate("()=>{ const o=document.getElementById('ob'); if(o){ o.style.display='none'; o.innerHTML=''; } }")
    return b, pg, errs

async def reinject(pg):
    await pg.evaluate(PUMP); await pg.evaluate("()=>__patchSound()")

class Checks:
    def __init__(self): self.fails = []; self.n = 0
    def ok(self, cond, what):
        self.n += 1
        if not cond: self.fails.append(what); print('  FAIL', what)
        return cond
    def done(self, errs=None):
        if errs: self.fails += ['console/page error: ' + e for e in errs]
        print(f'{self.n} checks, {len(self.fails)} failed')
        for f in self.fails: print('  -', f)
        return 1 if self.fails else 0

async def settle(pg, opts=None, max_s=120, idle_ticks=6, label=''):
    """Pump until the ranch is idle (not busy, no overlay waiting). Returns False on a freeze."""
    opts = opts or {}; idle = 0; last = None; same = 0
    for k in range(int(max_s / 0.12)):
        did = await pg.evaluate("o=>__pump(o)", opts)
        st = await pg.evaluate("""()=>JSON.stringify([typeof RS!=='undefined'&&RS?[RS.busy,RS.x|0,RS.pose,RS.say&&RS.say.length]:null, typeof PLAYER!=='undefined'&&PLAYER?PLAYER.week:null, typeof AT!=='undefined'&&AT&&AT.ar?[Math.round(AT.ar.t*10),AT.ar.p[0].hp,AT.ar.p[1].hp,AT.ar.over]:null, typeof B!=='undefined'&&B&&B.fight?[B.fight.turn,B.fight.p[0].hp,B.fight.p[1].hp,B.busy]:null,
            typeof CUP!=='undefined'&&CUP?[CUP.round,CUP.done,CUP.fights]:null, !!document.querySelector('canvas.summon-cv'), document.getElementById('r-panel')?document.getElementById('r-panel').innerHTML.length:0, document.getElementById('v-body')?document.getElementById('v-body').innerHTML.length:0, (document.getElementById('r-banner')||{}).textContent])""")
        busy = await pg.evaluate("""()=>{ const shown=id=>{ const e=document.getElementById(id); return !!e&&getComputedStyle(e).display!=='none'; };
            return (typeof RS!=='undefined'&&RS&&RS.busy?'scene':'')+(shown('atest')?' arena':'')+(shown('battle')&&typeof B!=='undefined'&&B?' battle':'')+(document.querySelector('canvas.summon-cv')?' summon':'')+(shown('venue')&&typeof CUP!=='undefined'&&CUP?' cup':''); }""")
        if did or busy: idle = 0
        else:
            idle += 1
            if idle >= idle_ticks: return True
        if st == last and not did: same += 1
        else: same = 0; last = st
        if same > 200:   # 24 seconds with nothing moving
            print('  FREEZE', label, busy, st); await pg.screenshot(path=os.path.join(HERE, f'freeze-{label or "x"}.png')); return False
        await pg.wait_for_timeout(120)
    print('  TIMEOUT', label); await pg.screenshot(path=os.path.join(HERE, f'timeout-{label or "x"}.png')); return False
