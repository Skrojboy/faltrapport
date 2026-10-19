import { AVSNITT, FALT, ANTECKNINGAR } from './falt.js';
import { besvarad, byggExport, filnamn, sammanfatta, harVarde } from './export.js';

const $ = (id) => document.getElementById(id);
const h = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const idag = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const minns = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };

// --- IndexedDB (allt sparas lokalt på enheten) ---
const db = new Promise((ok, fel) => {
  const r = indexedDB.open('faltrapport', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('b', { keyPath: 'id' });
  r.onsuccess = () => ok(r.result); r.onerror = () => fel(r.error);
});
const tx = async (mode, fn) => { const d = await db; return new Promise((ok, fel) => { const t = d.transaction('b', mode); const rq = fn(t.objectStore('b')); t.oncomplete = () => ok(rq?.result); t.onerror = () => fel(t.error); }); };
const alla = () => tx('readonly', (s) => s.getAll());
const radera = (id) => tx('readwrite', (s) => s.delete(id));

let cur = null, flik = 'Grunduppgifter', timer = 0;
const spara = () => { clearTimeout(timer); if (cur) { cur.andrad = Date.now(); tx('readwrite', (s) => s.put(cur)).catch(() => alert('Kunde inte spara. Exportera filen direkt som säkerhet.')); } };
const sparaSen = () => { clearTimeout(timer); timer = setTimeout(spara, 300); };
addEventListener('pagehide', spara);
document.addEventListener('visibilitychange', () => document.hidden && spara());

// --- Startsida ---
async function visaHem() {
  cur = null;
  for (const id of ['tillbaka', 'skrivut', 'exportera', 'flikar']) $(id).hidden = true;
  $('titel').textContent = 'Fältrapport';
  $('red').hidden = true; const hem = $('hem'); hem.hidden = false; hem.replaceChildren();
  const ny = h('button', 'prim', '+ Ny besiktning'); ny.style.width = '100%'; ny.style.marginBottom = '14px';
  ny.onclick = () => { cur = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), fastighet: '', datum: idag(), besiktare: minns('besiktare') || '', medverkande: '', svar: {}, anteckningar: {} }; flik = 'Grunduppgifter'; spara(); visaRed(); };
  hem.append(ny);
  const lista = (await alla()).sort((a, b) => b.andrad - a.andrad);
  if (!lista.length) hem.append(h('p', 'tom', 'Inga besiktningar än. Allt sparas på den här enheten.'));
  const ul = h('ul', 'lista');
  for (const b of lista) {
    const li = h('li'), o = h('button', 'oppna', b.fastighet || '(namnlös)');
    const n = FALT.filter((f) => besvarad(f, b.svar[f.id])).length;
    o.append(h('small', null, `${b.datum} · ${b.besiktare || 'ingen besiktare'} · ${n} fält besvarade`));
    o.onclick = () => { cur = b; flik = 'Grunduppgifter'; visaRed(); };
    const d = h('button', 'fara', 'Ta bort');
    d.onclick = async () => { if (confirm(`Ta bort besiktningen "${b.fastighet || 'namnlös'}"? Det går inte att ångra.`)) { await radera(b.id); visaHem(); } };
    li.append(o, d); ul.append(li);
  }
  hem.append(ul);
}

// --- Redigering ---
function visaRed() {
  $('hem').hidden = true; $('red').hidden = false;
  for (const id of ['tillbaka', 'skrivut', 'exportera', 'flikar']) $(id).hidden = false;
  const nav = $('flikar'); nav.replaceChildren();
  for (const n of ['Grunduppgifter', ...AVSNITT, 'Anteckningar']) {
    const b = h('button', null, n); b.dataset.flik = n; b.setAttribute('role', 'tab');
    b.onclick = () => { flik = n; visaFlik(); }; nav.append(b);
  }
  visaFlik();
}

function markeraFlikar() {
  $('titel').textContent = cur.fastighet || 'Ny besiktning';
  for (const b of $('flikar').children) {
    const n = b.dataset.flik;
    b.setAttribute('aria-selected', n === flik);
    b.classList.toggle('fylld', n === 'Anteckningar' ? ANTECKNINGAR.some((a) => harVarde(cur.anteckningar[a.id])) : FALT.some((f) => f.avsnitt === n && besvarad(f, cur.svar[f.id])));
  }
}

function visaFlik() {
  const m = $('red'); m.replaceChildren();
  if (flik === 'Grunduppgifter') grund(m);
  else if (flik === 'Anteckningar') for (const a of ANTECKNINGAR) m.append(fritt(a.namn, cur.anteckningar, a.id));
  else for (const f of FALT.filter((f) => f.avsnitt === flik && !f.alltid)) m.append(ritaFalt(f));
  markeraFlikar(); scrollTo(0, 0);
  $('flikar').querySelector('[aria-selected=true]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
}

function fritt(namn, obj, nyckel, kort) {
  const w = h('section', 'falt'); w.append(h('h3', null, namn));
  const t = h('textarea', kort ? 'lang' : ''); t.value = obj[nyckel] || ''; // vanlig textarea: iOS-diktering fungerar
  t.oninput = () => { obj[nyckel] = t.value; sparaSen(); markeraFlikar(); };
  w.append(t); return w;
}

function inmatning(namn, obj, nyckel, typ = 'text', extra) {
  const l = h('label', null, namn), i = h('input'); i.type = typ; i.value = obj[nyckel] || '';
  i.oninput = () => { obj[nyckel] = i.value; sparaSen(); markeraFlikar(); };
  l.append(i); extra?.(i, l); return l;
}

function grund(m) {
  const w = h('section', 'falt'); const d = h('div', 'delar'); w.append(d);
  d.append(inmatning('Fastighet', cur, 'fastighet'), inmatning('Datum', cur, 'datum', 'date'));
  const bes = inmatning('Besiktare', cur, 'besiktare', 'text', (i, l) => {
    const r = h('div', 'rad'); r.style.marginTop = '6px';
    for (const n of ['Gustaf Skrealid', 'Per ']) {
      const c = h('button', 'chip', n.trim() === 'Per' ? 'Per …' : n);
      c.type = 'button'; c.onclick = () => { i.value = n; i.dispatchEvent(new Event('input')); if (n.endsWith(' ')) i.focus(); };
      r.append(c);
    }
    l.append(r); i.addEventListener('change', () => minns('besiktare', cur.besiktare));
  });
  d.append(bes, inmatning('Medverkande (namn)', cur, 'medverkande'));
  m.append(w);
}

function satt(f, el, d, v) {
  const s = (cur.svar[f.id] ??= {});
  if (v === false || v === '' || v == null) delete s[d.id]; else {
    s[d.id] = v;
    if (f.radio) for (const x of f.delar) x !== d && x.typ !== 'auto' && delete s[x.id];
    for (const x of d.utesluter || []) delete s[x];
  }
  if (!Object.keys(s).length) delete cur.svar[f.id];
  synka(f, el); markeraFlikar(); d.typ === 'val' ? spara() : sparaSen();
}

function synka(f, el) {
  const s = cur.svar[f.id] || {};
  for (const e of el.querySelectorAll('[data-d]')) {
    const id = e.dataset.d, alt = e.dataset.alt;
    if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') { if (document.activeElement !== e) e.value = (f.typ === 'teknik' ? s.annat : s[id]) || ''; }
    else e.setAttribute('aria-pressed', f.typ === 'teknik' ? (s.val || []).includes(alt) : alt !== undefined ? s[id] === alt : !!s[id]);
  }
}

function chip(namn, attr) { const b = h('button', 'chip', namn); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); Object.assign(b.dataset, attr); return b; }

function ritaFalt(f) {
  const el = h('section', 'falt'); el.append(h('h3', null, f.namn)); const d = h('div', 'delar'); el.append(d);
  if (f.typ === 'teknik') {
    for (const a of f.alt) {
      const b = chip(a, { d: 'val', alt: a });
      b.onclick = () => {
        const s = (cur.svar[f.id] ??= {}); const v = s.val || [];
        s.val = v.includes(a) ? v.filter((x) => x !== a) : f.enkel ? [a] : [...v, a];
        if (!s.val.length) delete s.val; if (!Object.keys(s).length) delete cur.svar[f.id];
        synka(f, el); markeraFlikar(); spara();
      };
      d.append(b);
    }
    const l = h('label', null, f.alt.length ? (f.annatNamn || 'Annat') : 'Beskriv'), i = h('input'); i.dataset.d = 'annat'; i.setAttribute('enterkeyhint', 'done');
    i.oninput = () => { const s = (cur.svar[f.id] ??= {}); if (i.value) s.annat = i.value; else delete s.annat; if (!Object.keys(s).length) delete cur.svar[f.id]; markeraFlikar(); sparaSen(); };
    l.append(i); d.append(l);
  } else for (const x of f.delar) {
    if (x.typ === 'auto') continue;
    if (x.typ === 'val') { const b = chip(x.namn, { d: x.id }); b.onclick = () => satt(f, el, x, !(cur.svar[f.id] || {})[x.id]); d.append(b); continue; }
    const l = h('label', null, x.namn), i = h('input'); i.dataset.d = x.id;
    if (x.typ === 'tal') i.inputMode = 'decimal';
    i.oninput = () => satt(f, el, x, i.value);
    if (x.lang) { const t = h('textarea', 'lang'); t.dataset.d = x.id; t.oninput = () => satt(f, el, x, t.value); l.append(t); l.style.flexBasis = '100%'; }
    else l.append(i);
    if (x.alt) { const r = h('div', 'rad'); r.style.marginTop = '6px'; for (const a of x.alt) { const b = chip(a, { d: x.id, alt: a }); b.style.minWidth = '46px'; b.onclick = () => satt(f, el, x, (cur.svar[f.id] || {})[x.id] === a ? '' : a); r.append(b); } l.append(r); }
    d.append(l);
  }
  synka(f, el); return el;
}

// --- Export och utskrift ---
function exportera() {
  spara();
  const namn = filnamn(cur), fil = new File([JSON.stringify(byggExport(cur), null, 2)], namn, { type: 'application/json' });
  const ladda = () => { const a = h('a'); a.href = URL.createObjectURL(fil); a.download = namn; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 6e4); };
  if (navigator.canShare?.({ files: [fil] })) navigator.share({ files: [fil] }).catch((e) => e.name !== 'AbortError' && ladda());
  else ladda();
}

function skrivUt() {
  const u = $('utskrift'); u.replaceChildren();
  u.append(h('h1', null, `Fältrapport ${cur.fastighet}`), h('p', null, `Datum: ${cur.datum} · Besiktare: ${cur.besiktare} · Medverkande: ${cur.medverkande}`));
  for (const a of AVSNITT) {
    const rader = FALT.filter((f) => f.avsnitt === a && !f.alltid && besvarad(f, cur.svar[f.id]));
    if (!rader.length) continue;
    u.append(h('h2', null, a));
    for (const f of rader) { const p = h('p'); p.append(Object.assign(h('b'), { textContent: f.namn + ': ' }), sammanfatta(f, cur.svar[f.id])); u.append(p); }
  }
  for (const a of ANTECKNINGAR) if (harVarde(cur.anteckningar[a.id])) { u.append(h('h2', null, a.namn)); const p = h('p', null, cur.anteckningar[a.id]); p.style.whiteSpace = 'pre-wrap'; u.append(p); }
  print();
}

$('tillbaka').onclick = () => { spara(); visaHem(); };
$('exportera').onclick = exportera;
$('skrivut').onclick = skrivUt;
visaHem();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
