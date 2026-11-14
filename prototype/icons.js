/* The game's icon set, drawn like the monsters: one dark outline, flat fills and a white highlight, on a 32 by 32 grid.
   ICON(name) gives the SVG; iconize() puts them on the ranch menu, the top bar and the fight controls. */
const ICONS = (() => {
  const O = 'stroke="#3a2618" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
  const S = {
    Train: `<rect x="3" y="11" width="5" height="10" rx="1.6" fill="#7c8fb0" ${O}/><rect x="24" y="11" width="5" height="10" rx="1.6" fill="#7c8fb0" ${O}/><rect x="8" y="9" width="4" height="14" rx="1.4" fill="#9fb2d2" ${O}/><rect x="20" y="9" width="4" height="14" rx="1.4" fill="#9fb2d2" ${O}/><path d="M12 16h8" ${O} fill="none"/><path d="M9.5 11.5v3" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`,
    Rest: `<path d="M20 5a11 11 0 1 0 7 19A9 9 0 0 1 20 5z" fill="#ffd45e" ${O}/><path d="M11 10a7 7 0 0 0 0 9" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/><path d="M22 9h5l-5 5h5" fill="none" stroke="#3a2618" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`,
    Feed: `<path d="M8 15c0-5 4-8 8-8s8 3 8 8z" fill="#ff8a5c" ${O}/><circle cx="12" cy="12" r="2.6" fill="#7cc35a" ${O}/><circle cx="19" cy="11" r="2.4" fill="#ffd45e" ${O}/><path d="M4 15h24l-3 9a3 3 0 0 1-3 2H10a3 3 0 0 1-3-2z" fill="#c8874f" ${O}/><path d="M8 18.5h5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>`,
    Care: `<path d="M16 27S4 20 4 12a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8-12 15-12 15z" fill="#ff7aa2" ${O}/><path d="M8.5 10.5a3 3 0 0 1 3-2.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`,
    Out: `<path d="M16 6v22" ${O}/><path d="M6 8h16l4 4-4 4H6z" fill="#e9b45c" ${O}/><path d="M26 18H12l-4 3.5 4 3.5h14z" fill="#d48a3c" ${O}/><path d="M9 11h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>`,
    Info: `<path d="M16 9c-3-2-7-2-11-1v17c4-1 8-1 11 1 3-2 7-2 11-1V8c-4-1-8-1-11 1z" fill="#fff4dc" ${O}/><path d="M16 9v17" ${O}/><path d="M8 13h5M8 17h5M19 13h5M19 17h5" stroke="#c8874f" stroke-width="1.8" stroke-linecap="round"/>`,
    Menu: `<rect x="13.2" y="3" width="5.6" height="7" rx="1.4" fill="#b9a58a" ${O} transform="rotate(0 16 16)"/><rect x="13.2" y="3" width="5.6" height="7" rx="1.4" fill="#b9a58a" ${O} transform="rotate(45 16 16)"/><rect x="13.2" y="3" width="5.6" height="7" rx="1.4" fill="#b9a58a" ${O} transform="rotate(90 16 16)"/><rect x="13.2" y="3" width="5.6" height="7" rx="1.4" fill="#b9a58a" ${O} transform="rotate(135 16 16)"/><rect x="13.2" y="3" width="5.6" height="7" rx="1.4" fill="#b9a58a" ${O} transform="rotate(180 16 16)"/><rect x="13.2" y="3" width="5.6" height="7" rx="1.4" fill="#b9a58a" ${O} transform="rotate(225 16 16)"/><rect x="13.2" y="3" width="5.6" height="7" rx="1.4" fill="#b9a58a" ${O} transform="rotate(270 16 16)"/><rect x="13.2" y="3" width="5.6" height="7" rx="1.4" fill="#b9a58a" ${O} transform="rotate(315 16 16)"/><circle cx="16" cy="16" r="9" fill="#b9a58a" ${O}/><circle cx="16" cy="16" r="3.6" fill="#fff4dc" ${O}/><path d="M10.5 13a6 6 0 0 1 3-3.5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>`,
    Bits: `<circle cx="16" cy="16" r="11" fill="#ffc93c" ${O}/><circle cx="16" cy="16" r="7" fill="none" stroke="#c48f12" stroke-width="1.8"/><path d="M14 11v10M14 11h3a2.5 2.5 0 0 1 0 5h-3M14 16h3.5a2.5 2.5 0 0 1 0 5H14" fill="none" stroke="#7a5306" stroke-width="2" stroke-linejoin="round"/><path d="M9 12a8 8 0 0 1 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>`,
    Left: `<path d="M20 5L8 16l12 11z" fill="#fff4dc" ${O}/>`, Right: `<path d="M12 5l12 11-12 11z" fill="#fff4dc" ${O}/>`,
    Up: `<path d="M6 21l10-11 10 11z" fill="#fff4dc" ${O}/>`, Down: `<path d="M6 11l10 11 10-11z" fill="#fff4dc" ${O}/>`,
    Shove: `<path d="M9 27V14a2 2 0 0 1 4 0V9a2 2 0 0 1 4 0v-1a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v10c0 4-3 7-7 7z" fill="#ffd9b3" ${O}/><path d="M13 14v4M17 9v8M21 10v7" stroke="#3a2618" stroke-width="1.6" stroke-linecap="round"/>`,
    Auto: `<path d="M25 13a9.5 9.5 0 0 0-17-3" fill="none" stroke="#3a2618" stroke-width="4.4" stroke-linecap="round"/><path d="M25 13a9.5 9.5 0 0 0-17-3" fill="none" stroke="#7cc35a" stroke-width="2" stroke-linecap="round"/><path d="M7 19a9.5 9.5 0 0 0 17 3" fill="none" stroke="#3a2618" stroke-width="4.4" stroke-linecap="round"/><path d="M7 19a9.5 9.5 0 0 0 17 3" fill="none" stroke="#7cc35a" stroke-width="2" stroke-linecap="round"/><path d="M5 6l3 5 5-2z M27 26l-3-5-5 2z" fill="#7cc35a" ${O}/>`,
    Skip: `<path d="M4 8l11 8-11 8zM16 8l11 8-11 8z" fill="#fff4dc" ${O}/>`,
    Music: `<path d="M12 23V8l14-3v15" fill="none" ${O}/><circle cx="9" cy="23" r="3.5" fill="#5cb8ff" ${O}/><circle cx="23" cy="20" r="3.5" fill="#5cb8ff" ${O}/>`
  };
  return S;
})();
function ICON(name, size = 26) { const s = ICONS[name]; return s ? `<svg class="ic" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true">${s}</svg>` : ''; }
/* puts the icons on the buttons that are on screen now; safe to call again after a screen redraws */
function iconize() {
  if (!document.body.classList.contains('theme-wood')) return;
  const put = (el, name, keepText, size) => { if (!el || el.dataset.ic === name) return; el.dataset.ic = name; const t = keepText ? `<span>${el.textContent.trim()}</span>` : ''; el.innerHTML = ICON(name, size) + t; };
  document.querySelectorAll('#r-menu .rb').forEach(b => put(b, b.dataset.m, true, 28));
  put(document.getElementById('r-info'), 'Info', true, 20); put(document.getElementById('r-gear'), 'Menu', false, 22);
  const co = document.getElementById('r-coins'); if (co && !co.querySelector('.ic')) co.insertAdjacentHTML('afterbegin', ICON('Bits', 22));
  for (const [id, n] of [['at-l', 'Left'], ['at-r', 'Right'], ['at-up', 'Up'], ['at-dn', 'Down'], ['at-auto', 'Auto']]) put(document.getElementById(id), n, false, 28);
  const sh = document.getElementById('at-shove'); if (sh) { const skip = /Skip/.test(sh.textContent); if (skip) { if (sh.dataset.ic !== 'Skip') { sh.dataset.ic = 'Skip'; sh.innerHTML = ICON('Skip', 22) + '<span>Skip</span>'; sh.style.gap = '6px'; } } else put(sh, 'Shove', false, 28); }
}
