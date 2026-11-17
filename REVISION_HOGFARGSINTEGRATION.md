# Integrationsrevision: 1♥/1♠

Datum: 2026-11-17  
Arbetsgren: `work/undisturbed-architecture`  
Granskad commit: `878e7ed8dbf5a0554daecfc6f7e728c98623fe87`  
Bas: `main` (`cb7acefb9ca0a822b04a9bec859786437e0c23be`)  
Status: endast revision; inga budregler eller runtime-filer ändrade.

## Slutsats

Projektet har redan en stor del av den avsedda 1♥/1♠-funktionaliteten. En ny fristående 1M-motor skulle duplicera befintliga regler. Rätt väg är att behålla `ettoppningssvar.js` som gemensam regelimplementation för naturliga svar och öppnaråterbud, låta `trumfstod.js` vara routnings-/stödlager, och låta Stenberg respektive slam förbli separata specialmoduler.

Det finns dock en aktiv konflikt mellan ett uttryckligt användarbeslut och koden: splinter har beslutats bort från den aktiva budgivningen, men `trumfstod.js` fortfarande testar och rekommenderar splinter före Stenberg. Denna konflikt måste rättas och testas innan den bredare integrationen kan betraktas som kvalitetssäkrad.

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

## 3. Avvikelser som måste hanteras före ny funktionalitet

### A. Splinter – blockerande konflikt

- Beslutet i den senaste regelloggen säger uttryckligen att splinter ska tas bort ur den aktiva budgivningen.
- Den granskade `trumfstod.js` innehåller fortfarande en aktiv gren som identifierar renons + 4+ stöd + 13+ HTP och rekommenderar dubbelhopp före Stenberg.
- `TRUMFSTOD_STATUS.md` beskriver också fortfarande dubbelhoppet som aktivt.
- Stenberg- och trumfstödtesterna innehåller förväntningar som bygger på denna tidigare splintertolkning.

Åtgärd: avaktivera/borttag splintervägen i runtime och uppdatera dess tester/status så att 2NT Stenberg och övriga verifierade svar går genom rätt väg. Behåll historiken i loggen, men inte som aktiv regel. Detta är en synkronisering med ett redan fattat beslut, inte en ny systemregel.

### B. Regelstatus för RKC måste läsas från aktuell källa/status

Den aktuella `SLAMKOMPLEX_4NT_STATUS.md` och `tests/rkc-nordisk-standard-major.test.js` anger Nordisk standards svarstabell: 5♣ = 0/3 och 5♦ = 1/4, med 5♥/5♠ för två nyckelkort beroende på trumfdam. Äldre anteckningar om 1430 förekommer i historiken. Vid integration ska endast den aktuella, källkontrollerade RKC-implementationen i `slamlogik.js` användas. 1M-koden ska inte ha en egen RKC-tabell.

### C. Testkörningsstatus är inte fastställd av denna revision

Repo-grenen har CI-workflow och riktade tester. Den här läsningen har verifierat filernas existens och kodstruktur, men inte exekverat Node-testsviten eller bekräftat aktuell GitHub Actions-status. Ingen ny täckningsprocent ska rapporteras förrän testkörningens faktiska resultat finns.

## 4. Rekommenderad integrationsplan

1. Synkronisera splinterbeslutet i runtime, test och statusdokument. Kör berörda Stenberg-/trumfstödtester.
2. Lägg till ett integrations-/kontrakttest som bevisar att 1♥ och 1♠ båda delegerar till samma gemensamma svar-/återbudsregler, utan duplicerade specialfall.
3. Lägg till uttryckliga överlämningstester:
   - 1M–1NT → gemensam `reb1()`-logik och befintliga 1NT-fortsättningar.
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

Arkitekturen är redan närmare målet än vad en ny 1♥/1♠-modul skulle antyda. Nästa kodändring ska vara en riktad korrigering av den kända splinterkonflikten och dess tester, följd av integrationstester. Först därefter ska den återstående budkartan fyllas på.