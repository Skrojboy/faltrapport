# SPEC — Fältrapport för iPad, steg 1 (utkast att testa)

Plan: `../PLAN_faltrapport_ipad.md`. Två delar som delar ett kontrakt (exportfilen, avsnitt 1):
A. webbappen i den här mappen, B. inläsningen i Winnas Automations Robot (`text`-steget).

## 1. Kontraktet: exportfilen `Fältrapport <fastighet> <ÅÅÅÅ-MM-DD>.json`
```json
{
  "format": "winna-faltrapport/1",
  "fastighet": "Exempelby Prov 1:1",
  "datum": "2026-10-19",
  "besiktare": "Gustaf Skrealid",
  "medverkande": "Anna Andersson",
  "celler": [
    {"falt": "stomme", "sektion": "Teknisk beskrivning", "etikett": "Stomme", "kol": "C", "varde": "Betong"},
    {"falt": "skick_yttre", "sektion": "Skick, standard", "etikett": "Yttre skick", "kol": "B", "varde": null},
    {"falt": "skick_yttre", "sektion": "Skick, standard", "etikett": "Yttre skick", "kol": "D", "varde": 1},
    {"falt": "standard_lgh", "sektion": "Skick, standard", "etikett": "Lägenheterna håller standard", "forskjut": 1, "kol": "B", "varde": 1}
  ],
  "anteckningar": {"hyror": "fri text", "investeringar": "fri text", "ovrigt": "fri text"},
  "svar": {}
}
```
- `celler` innehåller bara fält som är **besvarade**. För ett besvarat valfält skickas ALLA cellerna i gruppen:
  det valda alternativet får 1 och de övriga `null` (null = töm cellen). Då ligger inte förra årets etta kvar bredvid.
- `svar` är appens egna rådata (för att kunna öppna ett utkast igen). Roboten läser den inte.
- `anteckningar` läses inte in i kalkylen i steg 1. Roboten listar den bara i flaggrapporten.

**Hur roboten hittar cellen** (radnummer flyttar mellan mallversioner, därför ankare och inte adresser):
1. sektionsraden = första raden i fliken där kolumn B (trimmad, casefold) == `sektion` (casefold);
2. målraden = första raden EFTER sektionsraden där kolumn A, B eller C (trimmad, casefold) är exakt `etikett`; finns ingen, den första som börjar med den;
3. plus `forskjut` (standard 0); cellen = `kol` + rad.
Hittas sektionen eller etiketten inte, eller är målcellen en formel eller skyddad, skrivs ingenting för den
posten och roboten flaggar den med vad den såg (FL.bedomning). Den gissar aldrig.

## 2. Fälten (mall 2026; sektion = rubrik i kolumn B; etikett = text i kol A/B/C på målraden)
Inmatningscellen står till vänster om sin etikett: etikett i C → B, i E → D, i G → F, i I → H.

| Avsnitt i appen | falt | sektion | etikett (målrad) | celler och värden |
|---|---|---|---|---|
| Besiktning | omfattning | Besiktning | "Besiktning enbart utvändigt" / "Besiktning invändigt & utvändigt" | B=1 på vald rad, null på den andra (radio) |
| | urval | Besiktning | "Besiktning av lokaler och bostäder" / "Besiktning av lokaler" / "Besiktning av bostäder" | B, radio över tre rader |
| | fysisk | Besiktning | "Fysisk besiktning har skett" | B=1 alltid när rapporten exporteras |
| Omgivning | omradestyp | Omgivning | "Industriområde" | B = text (namn på industriområdet, eller "ett"); D=1 CBD, F=1 bostadsområde, H=1 handelsområde (radio: B-text ELLER en av D/F/H) |
| | lage_ort | Omgivning | "Centrala" | B/D/F/H = 1 för centrala/utkant/utanför/landsbygd (radio) |
| | service | Omgivning | "Service, ort" | B = ortnamn (text), D = km (tal) |
| | vag | Omgivning | "Större väg" | B = vägens namn (text), D = avstånd i talspråk (text, t.ex. "på 5 kilometers avstånd") |
| | kollektivt | Omgivning | "Tåg finns" | B=1 tåg, D=1 buss (flerval) |
| | flygplats | Omgivning | "Avstånd flygplats" | B = km (tal) |
| | omgivning_fritext | Omgivning | "Skriv in ev. fritext här" | B = text |
| Tomt | bebyggelse | Tomt | "Bebyggd" | B/D/F = 1 för delvis bebyggd/obebyggd/fullt bebyggd (radio) |
| | markanvandning | Tomt | "Parkeringsplatser" | B/D/F/H = parkering/kommunikationsytor/trädgård/upplag (flerval) |
| | va | Tomt | "Kommunalt va" | B kommunalt, D enskilt (flerval) |
| | inhagnad | Tomt | "Industristaket" | B/D/F/H = staket/industriport/hårdgjord asfalt/bärlager grus (flerval) |
| | tomt_fritext | Tomt | "Skriv in ev. fritext här" | B = text |
| Byggnad | antal_byggnader | Byggnadsbeskrivning | "ange antal byggnader" | B = heltal |
| | plan | Byggnadsbeskrivning | "plan ovan mark" | B = antal plan (heltal), D=1 källare, F=1 vind |
| | byggar | Byggnadsbeskrivning | "Huvudsakligt byggår" | B=1 (årtalet D är en formel mot Taxering) |
| | tillbyggnad | Byggnadsbeskrivning | "Tillbyggnadsår" | B=1 (år ur Taxering); eller raden "Byggts till i omgångar" B=1 |
| | lokaltyper | Byggnadsbeskrivning | "Bostäder" (rad 1) och "Lager" (rad 2) | rad 1: B bostäder, D butiker, F industri, H kontor; rad 2: B lager, D övrigt (flerval) |
| | uthyrning | Byggnadsbeskrivning | "Uthyrning en hyresgäst" | B=1 en extern hyresgäst / D=1 flera; raden "Egen verksamhet" B=1 (flerval) |
| | byggnad_fritext | Byggnadsbeskrivning | "Skriv in ev. fritext här" | B = text |
| Teknik | grundlaggning, stomme, bjalklag, fasad, fonster, balkonger, yttertak, varmekalla, uppvarmning, ventilation, komfortkyla, sophantering, hissar, tvattstuga, pplatser, portar, takhojd, tekn_ovrigt | Teknisk beskrivning | "Grundläggning", "Stomme", "Bjälklag", "Fasadmaterial", "Fönster, glas", "Balkonger", "Yttertak", "Värmekälla", "Uppvärmningssystem", "Ventilationssystem", "Komfortkyla", "Sophantering", "Hissar", "Tvättstuga", "Antal G- och P-platser", "Portar", "Takhöjd", "Övrigt" | C = TEXT. Flerval av knappar; valda alternativ sammanfogas med ", " och " och " före det sista ("Tegel och puts"). Knappar + ett "annat"-fält. Alternativ: se avsnitt 3. Takhöjd och P-platser = fri text eller tal |
| Skick | skick_yttre | Skick, standard | "Yttre skick" | B/C/D/E = mycket bra/bra/normalt/mindre bra (radio) |
| | skick_inre | Skick, standard | "Inre skick" | B/C/D/E (radio) |
| | standard_lgh | Skick, standard | "Lägenheterna håller standard", forskjut 1 | B/D/F = hög/normal/enkel (radio) |
| | standard_lokal | Skick, standard | "Lokalerna håller standard", forskjut 1 | B/D/F (radio) |
| | reparation | Skick, standard | "Reperationsbehov", forskjut 1 | B=1 noterat, D = belopp kr (tal), F = år (ÅÅÅÅ) ELLER H=1 kalkylstart; ej noterat = B null |
| | anpassningsbar | Skick, standard | "Bedöms vara mindre anpassningsbara" | B=1, D = anledning (text) |
| | skick_fritext | Skick, standard | "Skriv in ev. fritext här" | B = text |
| Miljö | miljo_besiktning | Miljö | "Kontroll av miljöbelastningar" | B=1, D = belastning (text) |
| | energi | Miljö | "Energideklaration har delgets" | B=1, D = energiklass (A–G), F=1 OVK genomförd, H=1 radonmätning |
| | miljobyggnad | Miljö | "Miljöbyggnad" | B=1, D/F/H = guld/silver/brons (radio) |
| | miljo_fritext | Miljö | "Skriv in ev. fritext här" | B = text |
| Anteckningar | hyror, investeringar, ovrigt | — | — | bara `anteckningar`, inga celler |

"Reperationsbehov" och "Lägenheterna håller standard" stavas som i mallen (stavfelet ska vara med).

## 3. Alternativen i Teknik (från mallen och pappersprotokollet)
- Grundläggning: Platta på mark, Kantbalk, Plintar, Pålar, Källare
- Stomme: Betong, Trä, Stål, Murad · Bjälklag: Betong, Trä, Stål
- Fasad: Tegel, Puts, Trä, Plåt, Betong, Lättbetong, Glas
- Fönster: 2-glas, 3-glas, Isolerglas, Industriglas
- Balkonger, Komfortkyla, Hissar, Tvättstuga, Portar: Ja/Nej (+ antal för portar, hissar som fri text)
- Yttertak: Bandtäckt plåt, Plåt, Papp, Gummiduk, Tegelpannor, Betongtakpannor, Sedum
- Värmekälla: Fjärrvärme, Bergvärme, Jordvärme, Luft-vatten-värmepump, Elpanna, Direktverkande el, Oljepanna, Pellets, Flis, Spillvärme, Solceller
- Uppvärmningssystem: Vattenburna radiatorer, Aerotemprar, Luft, Golvvärme
- Ventilation: Självdrag, Mekanisk frånluft, Mekanisk till- och frånluft, Värmeåtervinning (FTX)
- Sophantering: Tunnor, Miljörum, Miljöhus, Egen

## 4. Del A — webbappen (mappen `Winna Faltrapport/`)
- Ren HTML/CSS/JS utan beroenden och utan byggsteg: `index.html`, `app.js`, `falt.js` (fältdefinitionen från avsnitt 2–3
  som DATA; appen ritar formuläret ur den), `sw.js`, `manifest.webmanifest`, `ikon.svg` + `ikon-192.png`/`ikon-512.png`.
- Svenska överallt. iPad i stående och liggande läge. Stora tryckytor (minst 44 px). Valknappar som "chips"
  (radio = ett valt, flerval = flera). Avsnitten som flikar eller en sidomeny så att man hoppar fritt.
- Start: fält för fastighet, datum (förvalt i dag), besiktare (Gustaf Skrealid / Per …, kommer ihåg det senaste valet), medverkande.
- Flera besiktningar sparas i IndexedDB (lista på startsidan: fortsätt, ta bort med bekräftelse). Varje tryck sparas direkt.
- Offline: service worker cachar alla filer (cache-first, versionsnummer i cachenamnet).
- Exportknapp: bygger JSON-filen enligt avsnitt 1 och öppnar iOS-delningsbladet via `navigator.share({files})`
  (reserv: nedladdningslänk). En knapp "Skriv ut / PDF" visar en ren utskriftsvy (CSS `@media print`) med alla svar.
- Inga nätanrop och ingen extern kod (fungerar offline och skickar ingen data någonstans).
- Självtest: `test.html` som laddar `falt.js` + exportfunktionen, bygger en export från ett exempelsvar och kontrollerar
  med `console.assert` att avsnitt 1 följs (radio ger 1 + null, teknik-texten sammanfogas rätt). Ska kunna köras med
  `node test.mjs` också (lägg exportlogiken i en ren funktion som går att importera).
- Ingen git-push och inget GitHub-repo. `git init` + en commit i mappen räcker.

## 5. Del B — roboten (`Winnas Automations Robot (Gustafs utveckling)`)
- `robot/karna/kalla.py` `filer()`: `ut["faltrapport"]` = senaste `Fältrapport*.json` under `arbetsmapp.rot` vars namn
  innehåller beteckningen (använd `_bet_i_filnamn`, samma som `foton`), annars None. Uteslut utmappen.
- Ny modul `robot/inlasare/faltrapport.py`: `las(path)` validerar `format == "winna-faltrapport/1"` (annars SystemExit
  med tydligt fel) och `placera(ws, rapport)` → `(andringar {adr: varde}, fel [(post, orsak)])` enligt
  ankarregeln i avsnitt 1. Får inte skriva formelceller, celler i `TEXT_SKYDDADE` eller utanför `ttr.RAD_MIN..RAD_MAX`.
- `steg_text` (båda grenarna, tidigare kalkyl och nytt jobb): om `F["faltrapport"]` finns, läs mallens
  'Text till rapport' (läsning med openpyxl är ok) och lägg fältrapportens ändringar OVANPÅ (fält > migrerat).
  Gulmarkera de celler där fältet ändrade ett migrerat värde. FL.mekanisk med antal, FL.bedomning per post som inte
  kunde placeras, FL.text med anteckningarna och FL.bekrafta om besiktningsdatum, besiktare och medverkande
  (Basinfo E4–E6 ägs av fds-steget och skrivs inte här).
- `text`-stegets område ändras INTE (fältets celler ligger redan inom det). Uppdatera `beskrivning`/`indata` för steget och raden
  i `docs/STYRNING.md` §2.
- Test `tester/test_faltrapport.py`: en fixtur-JSON + mallen som testerna redan använder; kontrollera att Stomme → C på
  "Stomme"-raden, att radio ger 1 + tom, att en okänd etikett blir fel och inte skrivs, och att en formelcell inte skrivs.
- Följ robotens CLAUDE.md (skriv aldrig .xlsm med openpyxl, mallen skrivs aldrig). Kör hela testsviten; den ska vara grön.

Rättat 2026-10-19 efter bygget: B36–B38 och D105/D106 är formler (mot Basinfo E6–E8 respektive Taxering), så fälten medverkande_roll och byggårens årtal utgick. Medverkande skrivs i Basinfo för hand.
