/* Mystery codes, posted by Gid outside the game. Each one works once per save. Only a hash of each code is kept here,
   so reading the source doesn't give them away. To add one, hash "snabits-code|" + the code (upper case) with SHA-256,
   keep the first 24 hex characters, and add a row below. */
const CODE_REWARDS = {
  '38deb4905002fc0c69020483': { items: { 'Energy cell': 2 }, bits: 1000 },
  '691a1f591d7c46fa8a2f7ea2': { items: { 'Life fruit': 1 }, bits: 500 },
  '04a48161a93430375de5cb70': { items: { 'Rebirth seed': 1, 'Honey cake': 3 }, bits: 0 },
};
async function codeHash(code) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('snabits-code|' + code));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 24);
}
async function redeemCode(raw) {
  const code = (raw || '').trim().toUpperCase().replace(/\s+/g, ''); if (!code) return '';
  if (!(window.crypto && crypto.subtle)) return "Codes need the game opened from its web address.";
  const h = await codeHash(code), R = CODE_REWARDS[h];
  if (!R) return "That code didn't work.";
  PLAYER.codes = PLAYER.codes || []; if (PLAYER.codes.includes(h)) return 'This save already used that code.';
  PLAYER.codes.push(h);
  for (const [k, n] of Object.entries(R.items || {})) addItem(k, n);
  if (R.bits) PLAYER.bits += R.bits;
  saveGame(); if (typeof drawUI === 'function' && RS) drawUI();
  const got = Object.entries(R.items || {}).map(([k, n]) => `${n > 1 ? n : /^[AEIOU]/.test(k) ? 'an' : 'a'} ${k}${n > 1 ? (/s$/.test(k) ? '' : 's') : ''}`).concat(R.bits ? [`${R.bits} bits`] : []);
  return `That code gave you ${got.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`;
}
