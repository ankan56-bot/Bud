# Integrationsrevision: 1♥/1♠

Datum: 2026-11-17  
Arbetsgren: `work/undisturbed-architecture`  
Granskad commit: `878e7ed8dbf5a0554daecfc6f7e728c98623fe87`  
Bas: `main` (`cb7acefb9ca0a822b04a9bec859786437e0c23be`)  
Status: implementation och fokuserad verifiering genomförd; fem källluckor är uttryckligen kvar som expertfrågor. `main` är orörd.

## Slutsats

Projektet har redan en stor del av den avsedda 1♥/1♠-funktionaliteten. En ny fristående 1M-motor skulle duplicera befintliga regler. Rätt väg är att behålla `ettoppningssvar.js` som gemensam regelimplementation för naturliga svar och öppnaråterbud, låta `trumfstod.js` vara routnings-/stödlager, och låta Stenberg respektive slam förbli separata specialmoduler.

Revisionen hittade en konflikt mellan det uttryckliga beslutet att pausa splinter och den befintliga runtime-koden. Den första korrigeringen är nu gjord: `trumfstod.js` går inte längre via splinter, och Stenberg prövas som separat specialmodul. Riktade tester och status-/källdokument har uppdaterats; körning av tester/CI återstår.

## 1. Befintliga komponenter och ägarskap

| Område | Nuvarande auktoritativ plats | Bedömning |
|---|---|---|
| Öppning 1♥/1♠ | `hogfargsbudgivning.js` via `budbeslut.js` | Befintlig; tunn färgspecifik adapter. |
| Svar efter 1M | `ettoppningssvar.js:resp1()` via `trumfstod.js` | Befintlig gemensam implementation. Omfattar stöd, 1 över 1, 2 över 1 och 1NT enligt aktuella villkor. |
| Öppnarens återbud efter svar | `ettoppningssvar.js:reb1()` via `trumfstod.js` | Befintlig gemensam implementation. Omfattar bl.a. 1M–1NT, 1M–2M och flera fortsättningar. |
| Stenberg 2NT | `stenberg.js` | Separat specialmodul; anropas av `trumfstod.js`. Ska inte kopieras. |
| Trumfstöd | `trumfstod.js` + gemensamma regler i `ettoppningssvar.js` | Befintligt routnings-/stödskikt. |
| Slam/RKC/4NT | `slamlogik.js` via `budbeslut.js` | Gemensam slammodul; ska ta emot fastställd trumf och inte dupliceras i 1M. |
| Auktionens dirigering | `budbeslut.js:nodeForRaw()` | Central sekvensrouter. |
| Efterhandslogg | `ej-tackta-logg.js` och `EJ_TACKTA_LOGG.md` | Finns; källuckor ska fortsätta markeras och loggas. |

`hogfargsbudgivning.js` innehåller i praktiken bara öppningskontroll och delegering till `common.resp1()` / `common.reb1()`. Det är alltså inte en andra regelmotor. Hjärter och spader delar redan samma kodväg, vilket är rätt arkitektur.

## 2. Redan befintlig testning

Följande tester finns på den granskade grenen:

- `tests/one-major-100.test.js`: deterministiskt 100-givarsprov med ostörd 1♥/1♠-öppning.
- `tests/one-major-invit.test.js`: riktade tester av 3M-invit och öppnarens accept/pass.
- `tests/trumfstod.test.js`: modulgräns, delegering, stödklassificering och integration.
- `tests/stenberg-2nt.test.js`: Stenberg, gränsvillkor, fortsättning och RKC-överlämning.
- `tests/rkc-nordisk-standard-major.test.js`: RKC efter 1M och efter enkel trumfhöjning.

Testfilerna visar att stora delar redan finns. Att köra eller utöka dessa tester är nästa verifieringssteg; den här dokumentrevisionen gör inget anspråk på att testerna har körts i denna session.

## 3. Verifierade resultat och kvarstående avvikelser

### A. Splinter – konflikt identifierad och korrigerad

- Beslutet i den senaste regelloggen säger uttryckligen att splinter ska tas bort ur den aktiva budgivningen.
- Den tidigare `trumfstod.js`-grenen som rekommenderade dubbelhopp före Stenberg är borttagen.
- `tests/trumfstod.test.js` och `tests/stenberg-2nt.test.js` är uppdaterade: void får inte aktivera splinter och hindrar inte en i övrigt kvalificerad Stenberghand.
- `TRUMFSTOD_STATUS.md` och `docs/rulebase/trumfstod-source-review.md` skiljer nu mellan källans beskrivning och projektets aktiva beslut.

Detta synkroniserar runtime med ett redan fattat användarbeslut; det inför ingen ny systemregel.

### B. RKC-överlämning efter Stenberg – korrigerad och testad

Revisionens första CI-körning visade att 4NT efter 1♣–2NT–3♣ inte identifierades som RKC, eftersom trumfen inte kunde härledas från Stenbergsekvensen. `slamlogik.js` känner nu igen 1M–2NT–3x–4NT först efter öppnarens beskrivande 3-nivååterbud, och `budbeslut.js` klassificerar det aktuella 4NT-budet med hela den offentliga sekvensen. Stenberg- och RKC-testerna passerar. Ett negativt regressionstest säkerställer också att direkt 4NT efter 1M–2NT utan öppnarens beskrivande 3-nivååterbud förblir ej täckt och inte skrivs över av generisk slamlogik. Ingen RKC-tabell har kopierats in i 1M-modulen.

### C. Fokuserad verifiering – godkänd

Senaste fokuserade CI-körning har godkänt Stenberg 2NT, trumfstöd, högfärgs-RKC, 200-givarsprovet för 1♥/1♠ och 3M-invit. I 200-givarsprovet är 200/200 givar giltiga; 1 038 beslut gav 1 033 täckta och 5 ej täckta (**99,5 %**), med 0 tekniska undantag, 0 olagliga rekommendationer, 0 ogiltiga/ofärdiga auktioner och 0 kortintegritetsfel. 3M-invit: 4/4 tester godkända.

200-givarsprovet hittade också ett tekniskt fel i 10 hp-grenen för sexkortsfärg: `h.longest()` returnerar en längd, inte en färgkod. Koden skickade längden till `h.good()` och kunde kasta undantag. Det är nu korrigerat med ett färgvis `SU.some(...)`-villkor och ett riktat regressionstest.

De fem källuckorna är sparade med alla fyra händer i `testdata/one_major_200_uncovered_2026-11-17.json` och beskrivna i `LOGG_BUDREGLER.md`: två öppnarhänder som inte matchar dokumenterade Stenbergåterbud, en renons efter Stenberg utan definierad fortsättning, samt två lägen med 20+ htp och lågfärgsstöd där 3NT-/5-lågfärgsutforskningen inte är fullständigt definierad. Inga återbud har hittats på.

### D. Full CI – separat befintlig avvikelse

Den fullständiga workflowen passerar de fokuserade högfärgs-/Stenberg-/RKC-testerna men stannar senare i den breda ostörda korpusen vid `tests/ostord-100.test.js`. Testets förväntade lista över ej täckta 1NT-/2♣-positioner avviker från den faktiska listan. Detta ligger utanför de ändrade 1♥/1♠-vägarna. Baslinjen har inte ändrats för att få CI grönt; den separata korpusavvikelsen behöver egen granskning.

## 4. Slutkontroll av integrationsvägar

Följande överlämningar är implementerade och har passerat riktade regressionstester:
- 1M–1NT → gemensam `ettoppningssvar.js:reb1()`-logik.
- 1M–2M → befintlig trumfstöds-/invitlogik.
- 1M–2NT → separat `stenberg.js`.
- Fastställd trumf + 4NT → gemensam `slamlogik.js`.
- 1♥ och 1♠ använder samma gemensamma svar-/återbudsregler; `hogfargsbudgivning.js` är endast adapter.
- Splinter är pausad enligt uttryckligt systembeslut och har ingen aktiv rekommendationsväg.

200-givarsprovet och de fokuserade Stenberg-, trumfstöds-, 3M-invit- och RKC-testerna är godkända. Den fulla workflowen är däremot inte grön eftersom den separata breda ostörda korpusen (`tests/ostord-100.test.js`) har en avvikelse i sin lista över ej täckta 1NT-/2♣-positioner. Den baslinjen har inte ändrats.

## 5. Skyddsräcken

- `main` ska förbli orörd; allt arbete sker på `work/undisturbed-architecture`.
- Ingen kopia av Stenberg-, trumfstöds- eller slamregler i högfärgsmodulen.
- Ingen ny regel utan stöd i användarens PDF eller ett uttryckligt användarbeslut.
- Håll isär HP, HTP, HPS, STP och gemensamma spelpoäng.
- Livebeslut får inte använda partnerns eller motståndarnas dolda händer; efterhandsfacit får använda given men får inte återföras till livebeslut.

## Slutbedömning

Arkitekturen är redan närmare målet än vad en ny 1♥/1♠-modul skulle antyda. Splinterkonflikten är nu synkroniserad med användarbeslutet. Nästa kodsteg är att verifiera integrationerna och därefter fylla endast de luckor som återstår i budkartan.

## 6. Slutstatus – 1♥/1♠ från öppning till utgång/slam (2026-11-17)

**Implementationens status: färdig för alla sekvenser som stöds av det granskade regelunderlaget.** Ingen separat högfärgsmotor behövs; gemensam kod används för hjärter och spader. 200 deterministiska givare har gett 1 033 täckta beslut av 1 038 (99,5 %), utan tekniska undantag, olagliga rekommendationer, ogiltiga/ofärdiga auktioner eller kortintegritetsfel.

De fem ej täckta positionerna är avsiktliga källluckor och finns med fullständiga händer, seed och motivering i `testdata/one_major_200_uncovered_2026-11-17.json` samt i `LOGG_BUDREGLER.md`. De gäller två öppnarhänder utanför de dokumenterade Stenbergåterbuden, en renons efter Stenberg och två 20+ HTP-lägen med lågfärgsstöd där 3NT-/5-lågfärgssekvensen saknar fullständigt källstöd. De ska besvaras av expert eller genom ytterligare auktoritativt PDF-underlag; ingen regel har hittats på.

**CI-status:** alla relevanta fokuserade steg passerar, inklusive 200-givarsprovet. Full workflow är fortsatt röd endast vid den separat identifierade breda ostörda regressionen i 1NT-/2♣-korpusen. Den avvikelsen har inte maskats eller skrivits om.

**Branch-skydd:** ändringarna ligger kvar på `work/undisturbed-architecture`. `main` har inte ändrats eller mergats. Den här slutstatusen innebär alltså att 1M-modulen är färdig enligt tillgängligt källstöd, inte att de fem dokumenterade expertfrågorna har fått påhittade svar.
