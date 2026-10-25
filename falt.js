// Fältdefinitionen (SPEC avsnitt 2-3) som data. Formuläret och exporten ritas/byggs ur denna lista.
// Del: typ val (chip, 1/null), text, tal (text i cellen, tal skickas som tal), auto (1 om någon av `av` är ifylld).
// Fält: radio = ett val bland alla delar; utesluter = delar som töms när denna fylls i.
const val = (id, namn, kol, x = {}) => ({ id, namn, kol, typ: 'val', ...x });
const text = (id, namn, kol, x = {}) => ({ id, namn, kol, typ: 'text', ...x });
const tal = (id, namn, kol, x = {}) => ({ id, namn, kol, typ: 'tal', ...x });
const auto = (id, kol, av) => ({ id, kol, typ: 'auto', av });
const falt = (id, avsnitt, sektion, etikett, namn, delar, x = {}) => ({ id, avsnitt, sektion, etikett, namn, delar, ...x });
const BESIKTNING = 'Besiktning', OMG = 'Omgivning', TOMT = 'Tomt', BYGG = 'Byggnadsbeskrivning', SKICK = 'Skick, standard', MILJO = 'Miljö';
const fritext = (id, avsnitt, sektion) => falt(id, avsnitt, sektion, 'Skriv in ev. fritext här', 'Fritext', [text('t', 'Fritext', 'B', { lang: true })]);
const teknik = (id, etikett, alt, x = {}) => ({ id, avsnitt: 'Teknik', sektion: 'Teknisk beskrivning', etikett, namn: etikett, typ: 'teknik', kol: 'C', alt, ...x });
const JN = { alt: ['Ja', 'Nej'], enkel: true };

export const AVSNITT = ['Besiktning', 'Omgivning', 'Tomt', 'Byggnad', 'Teknik', 'Skick', 'Miljö'];
export const ANTECKNINGAR = [
  { id: 'hyror', namn: 'Hyror' },
  { id: 'investeringar', namn: 'Investeringar' },
  { id: 'ovrigt', namn: 'Övrigt' },
];

// Lokaltyper för hyresrader (mallens koder i Hyror!B). Ö3 = övrigt per styck, t.ex. container/paketboxar.
export const LOKALTYPER = [['Bo', 'Bostad'], ['Ko', 'Kontor'], ['Bu', 'Butik'], ['Re', 'Restaurang'], ['La', 'Lager'], ['In', 'Industri'], ['Eu', 'Utbildning/övrigt lokal'], ['Ga', 'Garage'], ['Pa', 'Parkering'], ['Ö3', 'Övrigt st']];
export const STATUS = [['U', 'Uthyrd'], ['E', 'Egen'], ['V', 'Vakant']];

export const FALT = [
  falt('omfattning', 'Besiktning', BESIKTNING, '', 'Omfattning', [
    val('ut', 'Enbart utvändigt', 'B', { etikett: 'Besiktning enbart utvändigt' }),
    val('inut', 'Invändigt & utvändigt', 'B', { etikett: 'Besiktning invändigt & utvändigt' }),
  ], { radio: true }),
  falt('urval', 'Besiktning', BESIKTNING, '', 'Urval', [
    val('lb', 'Lokaler och bostäder', 'B', { etikett: 'Besiktning av lokaler och bostäder' }),
    val('l', 'Lokaler', 'B', { etikett: 'Besiktning av lokaler' }),
    val('b', 'Bostäder', 'B', { etikett: 'Besiktning av bostäder' }),
  ], { radio: true }),
  falt('fysisk', 'Besiktning', BESIKTNING, 'Fysisk besiktning har skett', 'Fysisk besiktning har skett', [val('v', 'Fysisk besiktning har skett', 'B')], { alltid: true }),

  falt('omradestyp', 'Omgivning', OMG, 'Industriområde', 'Områdestyp', [
    text('namn', 'Industriområde (namn eller "ett")', 'B'), val('cbd', 'CBD', 'D'), val('bost', 'Bostadsområde', 'F'), val('handel', 'Handelsområde', 'H'),
  ], { radio: true }),
  falt('lage_ort', 'Omgivning', OMG, 'Centrala', 'Läge i orten', [
    val('c', 'Centrala', 'B'), val('u', 'Utkant', 'D'), val('ut', 'Utanför', 'F'), val('l', 'Landsbygd', 'H'),
  ], { radio: true }),
  falt('service', 'Omgivning', OMG, 'Service, ort', 'Service', [text('ort', 'Ort', 'B'), tal('km', 'Avstånd (km)', 'D')]),
  falt('vag', 'Omgivning', OMG, 'Större väg', 'Större väg', [text('namn', 'Vägens namn', 'B'), text('avst', 'Avstånd, t.ex. "på 5 kilometers avstånd"', 'D')]),
  falt('kollektivt', 'Omgivning', OMG, 'Tåg finns', 'Kollektivtrafik', [val('tag', 'Tåg', 'B'), val('buss', 'Buss', 'D')]),
  falt('flygplats', 'Omgivning', OMG, 'Avstånd flygplats', 'Flygplats', [tal('km', 'Avstånd (km)', 'B')]),
  fritext('omgivning_fritext', 'Omgivning', OMG),

  falt('bebyggelse', 'Tomt', TOMT, 'Bebyggd', 'Bebyggelse', [val('delvis', 'Delvis bebyggd', 'B'), val('obebyggd', 'Obebyggd', 'D'), val('full', 'Fullt bebyggd', 'F')], { radio: true }),
  falt('markanvandning', 'Tomt', TOMT, 'Parkeringsplatser', 'Markanvändning', [
    val('park', 'Parkeringsplatser', 'B'), val('komm', 'Kommunikationsytor', 'D'), val('tradgard', 'Trädgård', 'F'), val('upplag', 'Upplag', 'H'),
  ]),
  falt('va', 'Tomt', TOMT, 'Kommunalt va', 'VA', [val('komm', 'Kommunalt', 'B'), val('ensk', 'Enskilt', 'D')]),
  falt('inhagnad', 'Tomt', TOMT, 'Industristaket', 'Inhägnad och beläggning', [
    val('staket', 'Industristaket', 'B'), val('port', 'Industriport', 'D'), val('asfalt', 'Hårdgjord asfalt', 'F'), val('grus', 'Bärlager grus', 'H'),
  ]),
  fritext('tomt_fritext', 'Tomt', TOMT),

  falt('antal_byggnader', 'Byggnad', BYGG, 'ange antal byggnader', 'Antal byggnader', [tal('n', 'Antal', 'B')]),
  falt('plan', 'Byggnad', BYGG, 'plan ovan mark', 'Plan', [tal('n', 'Antal plan ovan mark', 'B'), val('kallare', 'Källare', 'D'), val('vind', 'Vind', 'F')]),
  // Årtalen (D105/D106) är formler mot Taxering; i fält väljs bara om de ska med i texten.
  falt('byggar', 'Byggnad', BYGG, 'Huvudsakligt byggår', 'Byggår', [val('med', 'Ta med byggår (ur taxeringen)', 'B')]),
  falt('tillbyggnad', 'Byggnad', BYGG, 'Tillbyggnadsår', 'Tillbyggnad', [
    val('ar', 'Tillbyggd, ta med år (ur taxeringen)', 'B'), val('omg', 'Byggts till i omgångar', 'B', { etikett: 'Byggts till i omgångar' }),
  ]),
  falt('lokaltyper', 'Byggnad', BYGG, 'Bostäder', 'Lokaltyper', [
    val('bost', 'Bostäder', 'B'), val('butik', 'Butiker', 'D'), val('ind', 'Industri', 'F'), val('kontor', 'Kontor', 'H'),
    val('lager', 'Lager', 'B', { etikett: 'Lager' }), val('ovr', 'Övrigt', 'D', { etikett: 'Lager' }),
  ]),
  falt('uthyrning', 'Byggnad', BYGG, 'Uthyrning en hyresgäst', 'Uthyrning', [
    val('en', 'En extern hyresgäst', 'B'), val('flera', 'Flera hyresgäster', 'D'), val('egen', 'Egen verksamhet', 'B', { sektion: 'Fastighetstyp', etikett: 'Egen verksamhet' }) // B114 är =B73,
  ]),
  fritext('byggnad_fritext', 'Byggnad', BYGG),

  teknik('grundlaggning', 'Grundläggning', ['Platta på mark', 'Kantbalk', 'Plintar', 'Pålar', 'Källare']),
  teknik('stomme', 'Stomme', ['Betong', 'Trä', 'Stål', 'Murad']),
  teknik('bjalklag', 'Bjälklag', ['Betong', 'Trä', 'Stål']),
  teknik('fasad', 'Fasadmaterial', ['Tegel', 'Puts', 'Trä', 'Plåt', 'Betong', 'Lättbetong', 'Glas']),
  teknik('fonster', 'Fönster, glas', ['2-glas', '3-glas', 'Isolerglas', 'Industriglas']),
  teknik('balkonger', 'Balkonger', JN.alt, JN),
  teknik('yttertak', 'Yttertak', ['Bandtäckt plåt', 'Plåt', 'Papp', 'Gummiduk', 'Tegelpannor', 'Betongtakpannor', 'Sedum']),
  teknik('varmekalla', 'Värmekälla', ['Fjärrvärme', 'Bergvärme', 'Jordvärme', 'Luft-vatten-värmepump', 'Elpanna', 'Direktverkande el', 'Oljepanna', 'Pellets', 'Flis', 'Spillvärme', 'Solceller']),
  teknik('uppvarmning', 'Uppvärmningssystem', ['Vattenburna radiatorer', 'Aerotemprar', 'Luft', 'Golvvärme']),
  teknik('ventilation', 'Ventilationssystem', ['Självdrag', 'Mekanisk frånluft', 'Mekanisk till- och frånluft', 'Värmeåtervinning (FTX)']),
  teknik('komfortkyla', 'Komfortkyla', JN.alt, JN),
  teknik('sophantering', 'Sophantering', ['Tunnor', 'Miljörum', 'Miljöhus', 'Egen']),
  teknik('hissar', 'Hissar', JN.alt, { ...JN, annatNamn: 'Antal / beskrivning' }),
  teknik('tvattstuga', 'Tvättstuga', JN.alt, JN),
  teknik('pplatser', 'Antal G- och P-platser', []),
  teknik('portar', 'Portar', JN.alt, { ...JN, annatNamn: 'Antal' }),
  teknik('takhojd', 'Takhöjd', []),
  teknik('tekn_ovrigt', 'Övrigt', []),

  falt('skick_yttre', 'Skick', SKICK, 'Yttre skick', 'Yttre skick', [val('mb', 'Mycket bra', 'B'), val('b', 'Bra', 'C'), val('n', 'Normalt', 'D'), val('mind', 'Mindre bra', 'E')], { radio: true }),
  falt('skick_inre', 'Skick', SKICK, 'Inre skick', 'Inre skick', [val('mb', 'Mycket bra', 'B'), val('b', 'Bra', 'C'), val('n', 'Normalt', 'D'), val('mind', 'Mindre bra', 'E')], { radio: true }),
  falt('standard_lgh', 'Skick', SKICK, 'Lägenheterna håller standard', 'Lägenheterna håller standard', [val('h', 'Hög', 'B'), val('n', 'Normal', 'D'), val('e', 'Enkel', 'F')], { radio: true, forskjut: 1 }),
  falt('standard_lokal', 'Skick', SKICK, 'Lokalerna håller standard', 'Lokalerna håller standard', [val('h', 'Hög', 'B'), val('n', 'Normal', 'D'), val('e', 'Enkel', 'F')], { radio: true, forskjut: 1 }),
  falt('reparation', 'Skick', SKICK, 'Reperationsbehov', 'Reparationsbehov', [
    val('noterat', 'Noterat', 'B'), tal('belopp', 'Belopp (kr)', 'D'), tal('ar', 'År (ÅÅÅÅ)', 'F', { utesluter: ['kalk'] }), val('kalk', 'Kalkylstart', 'H', { utesluter: ['ar'] }),
  ], { forskjut: 1 }),
  falt('anpassningsbar', 'Skick', SKICK, 'Bedöms vara mindre anpassningsbara', 'Mindre anpassningsbara', [val('ja', 'Bedöms vara mindre anpassningsbara', 'B'), text('orsak', 'Anledning', 'D', { lang: true })]),
  fritext('skick_fritext', 'Skick', SKICK),

  falt('miljo_besiktning', 'Miljö', MILJO, 'Kontroll av miljöbelastningar', 'Miljöbelastningar', [val('ja', 'Kontroll gjord', 'B'), text('bel', 'Belastning', 'D', { lang: true })]),
  falt('energi', 'Miljö', MILJO, 'Energideklaration har delgets', 'Energi', [
    val('ja', 'Energideklaration delgiven', 'B'), text('klass', 'Energiklass', 'D', { alt: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }), val('ovk', 'OVK genomförd', 'F'), val('radon', 'Radonmätning', 'H'),
  ]),
  falt('miljobyggnad', 'Miljö', MILJO, 'Miljöbyggnad', 'Miljöbyggnad', [auto('b', 'B', ['guld', 'silver', 'brons']), val('guld', 'Guld', 'D'), val('silver', 'Silver', 'F'), val('brons', 'Brons', 'H')], { radio: true }),
  fritext('miljo_fritext', 'Miljö', MILJO),
];
