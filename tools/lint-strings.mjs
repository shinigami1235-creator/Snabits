#!/usr/bin/env node
/* Checks every line of text a player reads in Snabits (dialogue, banners, menus, item text) and the README
   against the writing shapes Gid has rejected. Run it before every push:

       node tools/lint-strings.mjs            check the game and the README
       node tools/lint-strings.mjs --test     check the rules against known good and bad lines
       node tools/lint-strings.mjs file.js    check one file

   It fails (exit 1) on an error and prints warnings for a person to read. A line that breaks a rule on purpose
   goes in ALLOW below with the reason. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

/* lines allowed to break a rule, each with its reason */
const ALLOW = [
  // [file, start of the sentence, reason]
  ['tala.js', 'This is X.', 'Tala introducing the monster by name, which is how a person says it'],
];
const SKIP = ['peer.js'];   // the PeerJS library, not the game's own text

/* ---------- pulling the text out ---------- */
/* string literals and template literals from a JS file, skipping comments and regexes */
function jsStrings(src) {
  const out = []; let i = 0, line = 1, prev = '';
  const regexOk = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case|in|of|delete|void|throw|new|do|else)$/.test(prev);
  function readTemplate() {
    let txt = '', start = line; i++;
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') { txt += src[i + 1]; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { i += 2; let depth = 1; txt += '{x}';
        while (i < src.length && depth) { const ch = src[i];
          if (ch === '{') depth++; else if (ch === '}') { depth--; if (!depth) break; }
          else if (ch === '`') { readTemplate(); continue; }
          else if (ch === '"' || ch === "'") { readQuoted(ch); continue; }
          if (ch === '\n') line++; i++; }
        i++; continue; }
      if (src[i] === '\n') line++;
      txt += src[i]; i++;
    }
    i++; out.push({ text: txt, line: start });
  }
  function readQuoted(q) {
    let txt = '', start = line; i++;
    while (i < src.length && src[i] !== q) { if (src[i] === '\\') { txt += src[i + 1]; i += 2; continue; } if (src[i] === '\n') line++; txt += src[i]; i++; }
    i++; out.push({ text: txt, line: start });
  }
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; } i += 2; continue; }
    if (c === '"' || c === "'") { readQuoted(c); prev = 'x'; continue; }
    if (c === '`') { readTemplate(); prev = 'x'; continue; }
    if (c === '/' && regexOk()) { i++; let cls = false; while (i < src.length && (src[i] !== '/' || cls)) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; else if (src[i] === '\n') break; i++; } i++; while (/[a-z]/.test(src[i] || '')) i++; prev = 'x'; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (/[A-Za-z0-9_$]/.test(c)) { let w = ''; while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) w += src[i++]; prev = w; continue; }
    prev = c; i++;
  }
  return out;
}
/* text nodes from HTML, with the inline scripts' strings too */
function htmlStrings(src) {
  const out = []; const lineAt = k => src.slice(0, k).split('\n').length;
  src.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, (m, body, k) => { const base = lineAt(k) - 1; for (const s of jsStrings(body)) out.push({ text: s.text, line: s.line + base }); return m; });
  const noScript = src.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/g, m => m.replace(/[^\n]/g, ' '));
  noScript.replace(/>([^<>]+)</g, (m, t, k) => { if (t.trim()) out.push({ text: t, line: lineAt(k) }); return m; });
  noScript.replace(/\b(?:placeholder|title|aria-label)="([^"]+)"/g, (m, t, k) => { out.push({ text: t, line: lineAt(k) }); return m; });
  return out;
}
/* markdown prose by paragraph, skipping code */
function mdStrings(src) {
  const out = []; let buf = [], start = 0, fence = false;
  const flush = () => { if (buf.length) out.push({ text: buf.join(' '), line: start }); buf = []; };
  src.split('\n').forEach((l, k) => {
    if (/^```/.test(l)) { fence = !fence; flush(); return; }
    if (fence || /^( {4}|\t)/.test(l) || /^\s*\|/.test(l)) { flush(); return; }
    if (!l.trim() || /^\s*([-*]|\d+\.|#+)\s/.test(l)) flush();
    if (l.trim()) { if (!buf.length) start = k + 1; buf.push(l.replace(/^\s*([-*]|\d+\.|#+)\s+/, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`[^`]*`/g, 'CODE')); }
  });
  flush(); return out;
}

/* is this string something a player reads? */
function playerText(t) {
  const s = t.replace(/<[^>]*>/g, ' ').replace(/\{x\}/g, 'X').replace(/\s+/g, ' ').trim();
  if (s.length < 8 || !/[a-z]{2,} [a-zA-Z]/.test(s)) return null;
  if (/=>|\bfunction\b|\bconst\b|;\s*\w+\(|[{}]|\brgba?\(|\b\d+px\b|^[#.][\w-]+|\bvar\(--|\bdocument\.|^\s*[\w-]+:\s|\.(js|png|css|json|html)\b|^(https?:|data:)/.test(s)) return null;
  if (!/[A-Z]/.test(s[0]) && !/^X /.test(s) && !/[.!?]$/.test(s)) return null;
  return s;
}
const sentences = s => s.split(/(?<=[.!?])\s+(?=[A-Z"'(X])/).map(x => x.trim()).filter(Boolean);
const words = s => (s.toLowerCase().match(/[a-z']+/g) || []).filter(w => w.length > 3);

/* ---------- the rules ---------- */
const BANNED = ['crucial', 'vital', 'pivotal', 'robust', 'seamless', 'seamlessly', 'leverage', 'delve', 'underscore', 'underscores', 'tapestry', 'testament', 'showcase', 'showcases',
  'holistic', 'nuanced', 'myriad', 'realm', 'elevate', 'vibrant', 'boasts', 'nestled', 'simply', 'merely', 'truly', 'actually', 'essentially', 'fundamentally', 'arguably',
  'honestly', 'frankly', 'deliberate', 'deliberately', 'load-bearing', 'meticulous', 'intricate', 'bustling', 'palpable', 'shimmered', 'unleash'];
const TICS = [/\bthink of it as\b/i, /\bin other words\b/i, /\bthe whole point\b/i, /\bwhich is (why|what)\b/i, /\bthe real question\b/i, /\bat its core\b/i, /\bevery single\b/i,
  /\bstands as\b/i, /\bserves as\b/i, /\brather than merely\b/i, /\bless like an? \w+ and more like\b/i, /\bearns its keep\b/i, /\bsingle most\b/i, /\bhere's the thing\b/i, /\bthe catch\?/i];
const RULES = [
  { id: 'dash', err: true, why: 'an em or en dash', test: s => /[—–]| -- /.test(s) },
  { id: 'curly', err: true, why: 'curly quotes', test: s => /[“”‘’]/.test(s) },
  { id: 'semicolon', err: true, why: 'a semicolon; split it or join with and, but or so', test: s => /;\s/.test(s) },
  { id: 'gloss', err: true, why: 'a "That is / This is" sentence labelling the one before it', test: (s, i) => i > 0 && /^(That|This|These|Those) (is|are|was|were)\b|^That's (the|what|all|how|it)\b/.test(s) },
  { id: 'not-x-but-y', err: true, why: 'negative parallelism (not X, but Y)', test: s => /\bnot (just|only|merely|simply)\b/i.test(s) || /\b(it'?s|this is|that is|is) not\b[^.!?]*?[,;]\s*(it'?s|but|it is)\b/i.test(s) || /,\s*not (the|a|an|just|by|from|on|in|at)?\s*[\w' ]{1,24}[.!?]$/i.test(s) },
  { id: 'split-contrast', err: true, why: 'a contrast split into two clipped sentences; join with while', test: (s, i) => i > 0 && /^[\w' ]{1,30} (is|was|does|did|are|were|has|have) not[.!]$|^\w+ (isn't|wasn't|doesn't|didn't)[.!]$/.test(s) },
  { id: 'reassure', err: true, why: 'a line telling the reader nothing went wrong', test: s => /\bnothing (is |was |gets |got )?(cut|lost|cropped)\b|\bloses nothing\b|\bwithout being cut\b|\bnever sent anywhere\b/i.test(s) },
  { id: 'beat', err: true, why: 'a short fragment used as a beat', test: (s, i) => i > 0 && /^(Not (often|really|quite|always|yet|much)|Mostly|Barely|Almost|Sort of|Kind of|Fair enough|For now|Probably|Somehow|Anyway|Just in case|Until now)[.!]$/.test(s) },
  { id: 'fragment-lead', err: true, why: 'a sentence opening on a verbless fragment ("Four weeks, and ...")', test: s => /^(One|Two|Three|Four|Five|Six|Ten|\d+) \w+, and\b|^\w+ first, \w+ (later|second)\b/i.test(s) },
  { id: 'state-no-instruction', err: true, why: 'a balanced "X and nothing Y" state with nothing to do', test: s => /\band nothing (is|was|has)\b/i.test(s) },
  { id: 'banned-word', err: true, why: 'a word on the banned list', test: s => { const w = (s.toLowerCase().match(/[a-z-]+/g) || []); return BANNED.find(b => w.includes(b)) || TICS.find(r => r.test(s)); } },
  { id: 'fragment', err: false, why: 'a short verbless sentence; join it to the next one or give it a verb', test: (s, i, all) => all.length > 1 && /^[A-Z][\w']*( [\w']+){0,2}[.]$/.test(s) && !/^(Rest|Train|Feed|Look|Tap|Pick|Come|Go|Wait|Try|Hold|Stop|Run|Watch|Again|Thanks|Thank you|Good|Well done|Welcome)\b/.test(s) && !/\b(is|are|was|were|has|have|had|can|will|did|does|do|it'?s|i'?m|you'?re|we'?re|they'?re|learned|won|lost|got|went|came|gets|goes|takes|ran|ate|here'?s|there'?s|pays)\b/i.test(s) },
  { id: 'colon', err: false, why: 'a colon in the middle of a spoken line', test: s => /\w: [a-z0-9]/.test(s) && !/^\w+( \w+)?: /.test(s) },
  { id: 'so-clause', err: false, why: 'a ", so ..." clause; keep it only if it tells the reader to do something', test: s => /,\s*so (nothing|it still|the quality)\b/i.test(s) },
  { id: 'restate', err: false, why: 'repeats most of the sentence before it', test: (s, i, all) => { if (!i) return false; const a = new Set(words(all[i - 1])), b = words(s); return b.length >= 3 && b.filter(w => a.has(w)).length / b.length >= 0.75; } },
];

function lint(units, file) {
  const hits = [];
  for (const u of units) {
    const s = file.endsWith('.md') ? u.text : playerText(u.text); if (!s) continue;
    const ss = sentences(s);
    ss.forEach((sen, i) => {
      for (const r of RULES) { if (!r.test(sen, i, ss)) continue;
        if (ALLOW.some(([f, start]) => file.endsWith(f) && sen.startsWith(start))) continue;
        hits.push({ file, line: u.line, rule: r.id, err: r.err, why: r.why, text: sen }); }
    });
  }
  return hits;
}
function lintFile(f) {
  const src = fs.readFileSync(f, 'utf8');
  const units = f.endsWith('.js') || f.endsWith('.mjs') ? jsStrings(src) : f.endsWith('.html') ? htmlStrings(src) : mdStrings(src);
  return lint(units, path.relative(ROOT, f));
}

/* ---------- self-test: the rules must still catch what Gid rejected and pass what he approved ---------- */
function selfTest() {
  const bad = ["Kiko's here to take it to Glacier Rim. Four weeks, and it comes back in a month.", 'Set to Lower face. That is the treated area.', 'Wrinkles compared. Displacement was not.',
    'It is not a song, it is a statement.', 'Tall post 3:4, nothing cut', 'People still come this far out sometimes. Not often.', 'The photo is loaded and nothing is marked.',
    'The shadow is the lamp, not the treatment.', 'It came off clean and sharp — that was Ice Shard.', 'This boasts a vibrant shop.', 'Out like a light. Mostly.'];
  const good = ['Kiko is here to take Toxichomp to Glacier Rim. They\'ll train there for four weeks.', 'Well done! Toxichomp has learned Ice Shard.', 'Wrinkles were compared while displacement was not.',
    'Welcome! Feel free to look around. The skill chips are in the glass case.', 'Hit the post again and put your weight behind it.', 'It isn\'t well enough to travel. Rest it or give it medicine first.'];
  let fail = 0;
  const caught = t => lint([{ text: t, line: 0 }], 'test.js').some(h => h.err);
  // the first bad line is caught by restate/beat only as a warning, so it counts if any hit fires
  for (const t of bad) if (!lint([{ text: t, line: 0 }], 'test.js').length) { console.log('MISSED  ' + t); fail++; }
  for (const t of good) if (caught(t)) { console.log('FALSE   ' + t + '  ' + lint([{ text: t, line: 0 }], 'test.js').map(h => h.rule).join(',')); fail++; }
  console.log(fail ? `${fail} self-test problems` : `self-test passed: ${bad.length} bad lines caught, ${good.length} good lines passed`);
  return fail;
}

const args = process.argv.slice(2);
if (args.includes('--test')) process.exit(selfTest() ? 1 : 0);
const files = args.length ? args.map(a => path.resolve(a)) : [
  ...fs.readdirSync(path.join(ROOT, 'prototype')).filter(f => /\.(js|html)$/.test(f) && !SKIP.includes(f)).map(f => path.join(ROOT, 'prototype', f)),
  path.join(ROOT, 'README.md'),
];
const hits = files.flatMap(lintFile);
for (const h of hits) console.log(`${h.err ? 'ERROR' : 'warn '} ${h.file}:${h.line}  ${h.rule}  ${h.text}`);
const errs = hits.filter(h => h.err).length;
console.log(`\n${errs} errors, ${hits.length - errs} warnings in ${files.length} files`);
if (selfTest()) process.exit(1);
process.exit(errs ? 1 : 0);
