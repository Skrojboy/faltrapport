// Delas av test.mjs (node) och test.html (webbläsare). Returnerar lista med misslyckade kontroller.
import { byggExport, teknikText } from './export.js';
import { FALT } from './falt.js';

export function kor() {
  const fel = [];
  const kolla = (ok, text) => { if (!ok) fel.push(text); console.assert(ok, text); };
  const b = {
    fastighet: 'Ljungby Plogen 15', datum: '2026-10-19', besiktare: 'Gustaf Skrealid', medverkande: 'Anna Andersson',
    svar: {
      stomme: { val: ['Betong'] }, fasad: { val: ['Tegel', 'Puts'], annat: '' }, yttertak: { val: ['Plåt', 'Papp', 'Sedum'] },
      portar: { val: ['Ja'], annat: '4' },
      skick_yttre: { n: true }, standard_lgh: { h: true },
      reparation: { noterat: true, belopp: '250 000', ar: '2028' },
      byggar: { ar: '1974' }, omradestyp: { cbd: true }, service: { ort: 'Ljungby', km: '2,5' },
    },
    anteckningar: { hyror: 'x' },
  };
  const e = byggExport(b);
  const hitta = (falt, kol, etikett) => e.celler.find((c) => c.falt === falt && c.kol === kol && (!etikett || c.etikett === etikett));
  kolla(e.format === 'winna-faltrapport/1', 'format');
  kolla(e.fastighet === b.fastighet && e.medverkande === 'Anna Andersson', 'huvudfält');
  kolla(e.celler.every((c) => c.varde !== undefined), 'varde saknas');
  kolla(hitta('stomme', 'C')?.varde === 'Betong' && hitta('stomme', 'C').sektion === 'Teknisk beskrivning', 'stomme');
  kolla(hitta('fasad', 'C')?.varde === 'Tegel och puts', 'fasad sammanfogas med "och"');
  kolla(hitta('yttertak', 'C')?.varde === 'Plåt, papp och sedum', 'tre alternativ');
  kolla(hitta('portar', 'C')?.varde === 'Ja (4)', 'portar med antal');
  kolla(!e.celler.some((c) => c.falt === 'grundlaggning'), 'obesvarat fält ska utelämnas');
  // radio: vald = 1, övriga null, alla fyra celler med
  const sy = e.celler.filter((c) => c.falt === 'skick_yttre');
  kolla(sy.length === 4 && sy.find((c) => c.kol === 'D').varde === 1 && sy.filter((c) => c.varde === null).length === 3, 'radio ger 1 + null');
  const sl = hitta('standard_lgh', 'B');
  kolla(sl?.forskjut === 1 && sl.varde === 1 && hitta('standard_lgh', 'D').varde === null, 'forskjut + radio');
  kolla(!('forskjut' in hitta('skick_yttre', 'B')), 'forskjut utelämnas när 0');
  const rp = e.celler.filter((c) => c.falt === 'reparation');
  kolla(rp[0].etikett === 'Reperationsbehov', 'Reperationsbehov stavas som mallen');
  kolla(rp.find((c) => c.kol === 'D').varde === 250000, 'belopp med mellanslag blir tal');
  kolla(rp.find((c) => c.kol === 'F').varde === 2028 && rp.find((c) => c.kol === 'H').varde === null, 'år/kalkylstart');
  kolla(hitta('byggar', 'B')?.varde === 1 && hitta('byggar', 'D')?.varde === 1974, 'byggår: B=1 och D=år');
  kolla(hitta('omradestyp', 'D')?.varde === 1 && hitta('omradestyp', 'B').varde === null, 'områdestyp radio');
  kolla(hitta('service', 'D')?.varde === 2.5, 'km med decimalkomma blir tal');
  kolla(hitta('fysisk', 'B')?.varde === 1, 'fysisk alltid 1');
  kolla(e.anteckningar.hyror === 'x' && e.anteckningar.ovrigt === '' && e.svar === b.svar, 'anteckningar och svar');
  kolla(teknikText({ alt: ['A', 'B'] }, { val: ['A'], annat: 'sten' }) === 'A och sten', 'annat läggs till');
  const tom = byggExport({ svar: {} });
  kolla(tom.celler.length === 1, 'tomt svar ger bara fysisk');
  kolla(new Set(FALT.map((f) => f.id)).size === FALT.length, 'unika fält-id');
  return fel;
}
