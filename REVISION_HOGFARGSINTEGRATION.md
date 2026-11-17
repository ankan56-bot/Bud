# Integrationsrevision: 1♥/1♠

Datum: 2026-11-17  
Arbetsgren: `work/undisturbed-architecture`  
Granskad commit: `878e7ed8dbf5a0554daecfc6f7e728c98623fe87`  
Bas: `main` (`cb7acefb9ca0a822b04a9bec859786437e0c23be`)  
Status: endast revision; inga budregler eller runtime-filer ändrade.

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

Revisionens första CI-körning visade att 4NT efter 1♣–2NT–3♣ inte identifierades som RKC, eftersom trumfen inte kunde härledas från Stenbergsekvensen. `slamlogik.js` känner nu igen 1M–2NT–3x–4NT först efter öppnarens beskrivande 3-nivååterbud, och `budbeslut.js` klassificerar det aktuella 4NT-budet med hela den offentliga sekvensen. Stenberg- och RKC-testerna passerar. Ingen RKC-tabell har kopierats in i 1M-modulen.

### C. Fokuserad verifiering – godkänd

Senaste fokuserade CI-körning har godkänt Stenberg 2NT, trumfstöd, högfärgs-RKC, 200-givarsprovet för 1♥/1♠ och 3M-invit. I 200-givarsprovet är 200/200 givar giltiga; 1 038 beslut gav 1 033 täckta och 5 ej täckta (**99,5 %**), med 0 tekniska undantag, 0 olagliga rekommendationer, 0 ogiltiga/ofärdiga auktioner och 0 kortintegritetsfel. 3M-invit: 4/4 tester godkända.

200-givarsprovet hittade också ett tekniskt fel i 10 hp-grenen för sexkortsfärg: `h.longest()` returnerar en längd, inte en färgkod. Koden skickade längden till `h.good()` och kunde kasta undantag. Det är nu korrigerat med ett färgvis `SU.some(...)`-villkor och ett riktat regressionstest.

De fem källuckorna är sparade med alla fyra händer i `testdata/one_major_200_uncovered_2026-11-17.json` och beskrivna i `LOGG_BUDREGLER.md`: två öppnarhänder som inte matchar dokumenterade Stenbergåterbud, en renons efter Stenberg utan definierad fortsättning, samt två lägen med 20+ htp och lågfärgsstöd där 3NT-/5-lågfärgsutforskningen inte är fullständigt definierad. Inga återbud har hittats på.

### D. Full CI – separat befintlig avvikelse

Den fullständiga workflowen passerar de fokuserade högfärgs-/Stenberg-/RKC-testerna men stannar senare i den breda ostörda korpusen vid `tests/ostord-100.test.js`. Testets förväntade lista över ej täckta 1NT-/2♣-positioner avviker från den faktiska listan. Detta ligger utanför de ändrade 1♥/1♠-vägarna. Baslinjen har inte ändrats för att få CI grönt; den separata korpusavvikelsen behöver egen granskning.

## 4. Rekommenderad integrationsplan

1. Kör berörda Stenberg-/trumfstödtester efter splinterkorrigeringen och kontrollera att inga äldre tester fortfarande förutsätter aktiv splinter.
2. Lägg till ett integrations-/kontrakttest som bevisar att 1♥ och 1♠ båda delegerar till samma gemensamma svar-/återbudsregler, utan duplicerade specialfall.
3. Behåll de nu godkända överlämningstesterna:
   - 1M–1NT → gemensam `reb1()`-logik och befintliga fortsättningar.
   - 1M–2M → befintlig trumfstöds-/invitlogik.
   - 1M–2NT → `stenberg.js`.
   - Fastställd trumf + 4NT → `slamlogik.js`.
4. Kartlägg därefter varje återstående 1M-sekvens mot befintlig kod och test. Implementera endast verkliga luckor, med samma gemensamma funktion för H/S.
5. Kör full CI, riktade tester och 100-givarsprovet. Alla källuckor ska finnas kvar i `EJ_TACKTA_LOGG.md`/runtime-loggen; inga antagna bud läggs till.

## 5. Skyddsräcken

- `main` ska förbli orörd; allt arbete sker på `work/undisturbed-architecture`.
- Ingen kopia av Stenberg-, trumfstöds- eller slamregler i högfärgsmodulen.
- Ingen ny regel utan stöd i användarens PDF eller ett uttryckligt användarbeslut.
- Håll isär HP, HTP, HPS, STP och gemensamma spelpoäng.
- Livebeslut får inte använda partnerns eller motståndarnas dolda händer; efterhandsfacit får använda given men får inte återföras till livebeslut.

## Slutbedömning

Arkitekturen är redan närmare målet än vad en ny 1♥/1♠-modul skulle antyda. Splinterkonflikten är nu synkroniserad med användarbeslutet. Nästa kodsteg är att verifiera integrationerna och därefter fylla endast de luckor som återstår i budkartan.