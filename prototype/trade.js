/* Trading with a friend over a 5-letter code, on the same PeerJS link the friend rooms use (netfight.js).
   Each side picks a Snabit from its Freezer to offer and sees the other's. When both tap Trade on the same pair,
   the host sends the swap, the guest makes it and answers, and then the host makes it. A changed offer clears both taps.
   Needs peer.js, netfight.js (NET_CODES, netPeerOpts, NET_VER), game.js and lab.js. */
const TR_PFX = 'snabits-t1-';
const LT = { on: false, host: false, peer: null, conn: null, code: '', mine: null, theirs: null, meReady: false, themReady: false, name: '', parts: {} };
function tSend(o) { const c = LT.conn; if (!c || !c.open) return; const s = JSON.stringify(o);
  if (s.length < 6000) { c.send(o); return; }
  const id = Math.random().toString(36).slice(2, 8), n = Math.ceil(s.length / 6000); for (let i = 0; i < n; i++) c.send({ t: 'part', id, i, n, s: s.slice(i * 6000, (i + 1) * 6000) }); }
function tRecv(raw) { let m; try { m = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
  if (m.t === 'part') { const p = LT.parts[m.id] = LT.parts[m.id] || []; p[m.i] = m.s; if (p.filter(x => x != null).length === m.n) { delete LT.parts[m.id]; tRecv(p.join('')); } return; }
  tHandle(m); }
function tWire(c) { LT.conn = c; c.on('data', tRecv); c.on('close', () => { if (LT.conn === c && !LT.done) { tClose(); openTrade("Your friend left the trade."); } }); }
function tClose() { try { LT.conn && LT.conn.close(); } catch (e) {} try { LT.peer && LT.peer.destroy(); } catch (e) {}
  Object.assign(LT, { on: false, conn: null, peer: null, mine: null, theirs: null, meReady: false, themReady: false, name: '' }); }
function tStatus(t) { const e = el('tr-msg'); if (e) e.textContent = t || ''; }

function openTrade(msg) {
  if (LT.on) { tradeRoom(); return; }
  panel(`<div class="full lab-head"><b>Trade</b><button class="small" id="tr-back">Back</button></div>
    <div class="full lab-info">One of you opens a trade and sends the code, and the other types it in.</div>
    <button class="rb" id="tr-host">Open a trade</button>
    <div style="flex-basis:100%;display:flex;gap:8px;align-items:center"><input id="tr-code" maxlength="5" placeholder="K7QPX" style="width:120px;font-size:20px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:6px 10px;border-radius:10px;border:0"><button class="rb" id="tr-join" style="flex:0 0 auto">Join</button></div>
    <div id="tr-msg" class="full" style="font-size:13px;color:#ffd23f"></div>`);
  tStatus(msg);
  el('tr-back').onclick = () => { tClose(); openRooms(); };
  el('tr-host').onclick = tradeHost; el('tr-join').onclick = () => tradeJoin(el('tr-code').value);
}
function tradeHost() {
  if (typeof Peer === 'undefined') { tStatus('Online play could not load'); return; }
  tClose(); LT.done = false; LT.host = true; let c = ''; for (let i = 0; i < 5; i++) c += NET_CODES[Math.floor(Math.random() * NET_CODES.length)]; LT.code = c; tStatus('Opening a trade…');
  const p = LT.peer = new Peer(TR_PFX + c, netPeerOpts());
  p.on('open', () => { LT.on = true; tradeRoom(); });
  p.on('connection', cn => { if (LT.conn && LT.conn.open) { cn.on('open', () => { cn.send({ t: 'deny' }); setTimeout(() => cn.close(), 300); }); return; } tWire(cn); });
  p.on('error', e => { if (e.type === 'unavailable-id' && !LT.on) { tradeHost(); return; } tStatus(/network|server|socket/.test(e.type) ? 'Could not reach the room server. Check your internet connection.' : 'Online error: ' + e.type); });
}
function tradeJoin(code) {
  code = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (code.length !== 5) { tStatus('Trade codes have 5 letters and numbers, like K7QPX'); return; }
  if (typeof Peer === 'undefined') { tStatus('Online play could not load'); return; }
  tClose(); LT.done = false; LT.host = false; LT.code = code; tStatus('Joining ' + code + '…');
  const p = LT.peer = new Peer(netPeerOpts()), to = setTimeout(() => { if (!LT.on && LT.peer === p) { tStatus('No answer from trade ' + code + '. Check the code and your internet connection.'); tClose(); } }, 15000);
  p.on('open', () => { const cn = p.connect(TR_PFX + code, { reliable: true, serialization: 'json' }); tWire(cn);
    cn.on('open', () => { clearTimeout(to); LT.on = true; tSend({ t: 'hello', ver: NET_VER, name: RS ? displayName(RS) : 'A friend' }); tradeRoom(); }); });
  p.on('error', e => { clearTimeout(to); tStatus(e.type === 'peer-unavailable' ? 'There is no open trade with code ' + code : 'Online error: ' + e.type); tClose(); });
}
/* what goes over the link: the whole Freezer entry */
function tOffer(e) { if (RS && RS.id === e.id) saveGame(); const st = entryState(e); return { id: e.id, m: e.m, st: e.st || null, name: entryName(e), lv: st.level || 1, grade: st.grade || 'E', stage: st.stage || 'Bit' }; }
function tPick(id) { const e = PLAYER.roster.find(r => r.id === id); if (!e) return; LT.mine = tOffer(e); LT.meReady = false; LT.themReady = false; tSend({ t: 'offer', o: LT.mine }); tradeRoom(); }
function tHandle(m) {
  if (m.t === 'deny') { tClose(); openTrade('That trade already has two people in it.'); return; }
  if (m.t === 'hello') { if (m.ver !== NET_VER) { tSend({ t: 'old' }); tStatus('Your friend is on a different version. Both of you tap Update first.'); return; } LT.name = m.name; tSend({ t: 'hi', name: RS ? displayName(RS) : 'A friend' }); if (LT.mine) tSend({ t: 'offer', o: LT.mine }); tradeRoom(); return; }
  if (m.t === 'old') { tClose(); openTrade('Your friend is on a different version. Both of you tap Update first.'); return; }
  if (m.t === 'hi') { LT.name = m.name; tradeRoom(); return; }
  if (m.t === 'offer') { LT.theirs = m.o; LT.meReady = false; LT.themReady = false; tradeRoom(); return; }
  if (m.t === 'ready') { LT.themReady = !!m.on && LT.mine && LT.theirs && m.mine === LT.theirs.id && m.theirs === LT.mine.id; tradeRoom(); if (LT.host) tTry(); return; }
  if (m.t === 'swap' && !LT.host) { if (LT.mine && LT.theirs && m.give === LT.mine.id && m.get === LT.theirs.id) { tCommit(); tSend({ t: 'ack' }); } return; }
  if (m.t === 'ack' && LT.host) { tCommit(); return; }
}
function tTry() { if (LT.meReady && LT.themReady) tSend({ t: 'swap', give: LT.theirs.id, get: LT.mine.id }); }
function tCommit() {
  const give = LT.mine, get = LT.theirs; if (!give || !get || LT.done) return; LT.done = true;
  PLAYER.roster = PLAYER.roster.filter(r => r.id !== give.id);
  const e = { id: 'm' + (PLAYER.nextId++), m: get.m, st: get.st };
  if (e.m.hybridOf && typeof registerHybrid === 'function') registerHybrid(...e.m.hybridOf);
  PLAYER.roster.push(e); PLAYER.traded = (PLAYER.traded || 0) + 1;
  if (PLAYER.active === give.id || !PLAYER.active) { PLAYER.active = e.id; RS = null; }
  if (typeof dexRaise === 'function') dexRaise(e.m, (e.st && e.st.stage) || 'Bit');
  saveGame(); const line = `${give.name} went to your friend's ranch, and ${get.name} is here now.`;
  setTimeout(tClose, 400); LT.on = false;
  if (!RS) openRanch(); else { panel(''); menu('Out'); }
  say(line);
}
function tradeRoom() {
  const card = (o, who) => o ? `<div class="rb full" style="cursor:default;text-align:left" id="tr-${who}"><b>${o.name}</b><small>Lv ${o.lv} · grade ${o.grade} · ${o.stage}</small></div>` : `<div class="rb full" style="cursor:default;opacity:.6">${who === 'me' ? 'Pick one below' : 'Waiting for their pick'}</div>`;
  const both = LT.mine && LT.theirs && LT.conn && LT.conn.open;
  panel(`<div class="full lab-head"><b>Trade ${LT.code}</b><button class="small" id="tr-leave">Leave</button></div>
    ${LT.conn && LT.conn.open ? '' : `<div class="full lab-info">Send this code to your friend: <b style="font:800 20px var(--pix);letter-spacing:3px">${LT.code}</b></div>`}
    <div class="full" style="font-size:13px;opacity:.8">You offer</div>${card(LT.mine, 'me')}
    <div class="full" style="font-size:13px;opacity:.8">Your friend offers${LT.themReady ? ' · ready to trade' : ''}</div>${card(LT.theirs, 'them')}
    ${both ? `<button class="rb full feat" id="tr-go">${LT.meReady ? 'Waiting for them…' : 'Trade'}</button>` : ''}
    <div class="full" style="font-size:13px;opacity:.8">Your Freezer</div>
    ${PLAYER.roster.map(e => `<button class="rb" data-id="${e.id}">${entryName(e)}<small>Lv ${entryState(e).level || 1}${LT.mine && LT.mine.id === e.id ? ' · offered' : ''}</small></button>`).join('')}
    <div id="tr-msg" class="full" style="font-size:13px;color:#ffd23f"></div>`);
  el('tr-leave').onclick = () => { tClose(); openTrade(); };
  el('r-panel').querySelectorAll('[data-id]').forEach(b => b.onclick = () => tPick(b.dataset.id));
  if (el('tr-go')) el('tr-go').onclick = () => { LT.meReady = !LT.meReady; tSend({ t: 'ready', on: LT.meReady, mine: LT.mine.id, theirs: LT.theirs.id }); tradeRoom(); if (LT.host) tTry(); };
}
