// Ren exportlogik (SPEC avsnitt 1). Inga DOM-anrop, så node test.mjs kan köra den.
import { FALT, ANTECKNINGAR } from './falt.js';

export const harVarde = (v) => v === true || (typeof v === 'string' && v.trim() !== '');

// "Tegel och puts", "A, B och C". Enkel (Ja/Nej) + annat blir "Ja (3)".
export function teknikText(f, s = {}) {
  const val = (s.val || []).filter((a) => f.alt.includes(a));
  const annat = (s.annat || '').trim();
  if (f.enkel && val.length && annat) return `${val[0]} (${annat})`;
  const lista = (annat ? [...val, annat] : val).map((t, i) => (i ? t[0].toLowerCase() + t.slice(1) : t)); // "Tegel och puts"
  return lista.length < 2 ? lista.join('') : lista.slice(0, -1).join(', ') + ' och ' + lista.at(-1);
}

export const besvarad = (f, s = {}) => f.typ === 'teknik' ? teknikText(f, s) !== '' : f.delar.some((d) => d.typ !== 'auto' && harVarde(s[d.id]));

const tillTal = (t) => { const n = Number(t.replace(/\s/g, '').replace(',', '.')); return t.trim() !== '' && !isNaN(n) ? n : t.trim(); };

function delVarde(d, s) {
  if (d.typ === 'val') return s[d.id] ? 1 : null;
  if (d.typ === 'auto') return d.av.some((i) => harVarde(s[i])) ? 1 : null;
  if (!harVarde(s[d.id])) return null;
  return d.typ === 'tal' ? tillTal(s[d.id]) : s[d.id].trim();
}

export function byggCeller(svar = {}) {
  const celler = [];
  for (const f of FALT) {
    const s = f.alltid ? { [f.delar[0].id]: true } : svar[f.id] || {};
    if (!besvarad(f, s)) continue;
    if (f.typ === 'teknik') {
      celler.push({ falt: f.id, sektion: f.sektion, etikett: f.etikett, kol: f.kol, varde: teknikText(f, s) });
      continue;
    }
    for (const d of f.delar) {
      const c = { falt: f.id, sektion: d.sektion ?? f.sektion, etikett: d.etikett ?? f.etikett };
      const fo = d.forskjut ?? f.forskjut;
      if (fo) c.forskjut = fo;
      celler.push({ ...c, kol: d.kol, varde: delVarde(d, s) });
    }
  }
  return celler;
}

export function byggExport(b) {
  const a = b.anteckningar || {};
  return {
    format: 'winna-faltrapport/1',
    fastighet: b.fastighet || '',
    datum: b.datum || '',
    besiktare: b.besiktare || '',
    medverkande: b.medverkande || '',
    celler: byggCeller(b.svar),
    anteckningar: Object.fromEntries(ANTECKNINGAR.map((n) => [n.id, a[n.id] || ''])),
    svar: b.svar || {},
  };
}

export const filnamn = (b) => `Fältrapport ${(b.fastighet || '').replace(/[\\/:*?"<>|]/g, '-').trim() || 'namnlös'} ${b.datum || ''}.json`;

// Läsbar rad per fält, för utskriftsvyn.
export function sammanfatta(f, s = {}) {
  if (f.typ === 'teknik') return teknikText(f, s);
  return f.delar.filter((d) => d.typ !== 'auto' && harVarde(s[d.id]))
    .map((d) => d.typ === 'val' ? d.namn : `${d.namn}: ${s[d.id].trim()}`).join('; ');
}
