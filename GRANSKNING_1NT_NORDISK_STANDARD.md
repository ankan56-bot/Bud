# Granskning: 1NT-familjen mot Nordisk standard (2012-08-22)

**Datum:** 2026-11-16  
**Arbetsgren:** `work/undisturbed-architecture`  
**Auktoritativ källa:** användarens `nordisk_standard.pdf`, s. 1–8. För 1NT är s. 4–5 och slamreglerna på s. 7 avgörande.  
**Kodgranskning:** `rattningsmotor.js`, `analysbibliotek.json`, befintliga testfiler.  
**Status:** Källjämförelse och avvikelselista. Ingen budregel eller produktionskod ändrad.

## Sammanfattning

PDF:en ger betydligt tydligare regler än vad den nuvarande implementationen fullt ut följer. Flera poänggränser i koden är inte angivna i Nordisk standard och får därför inte presenteras som systemregler. Det finns också konkreta saknade eller felklassificerade fortsättningar, framför allt efter Stayman och i tolkningen av 4NT.

Viktigast:
1. Öppningen 1NT är korrekt modellerad som 15–17 hp och balanserad, inklusive 5-korts högfärg.
2. Stayman/överföringsstarten är i huvudsak igenkänd, men koden lägger till styrkegränser som PDF:en inte anger.
3. Fortsättningen efter Stayman 1NT–2♣–2♥–2NT/3NT är uttryckligen beskriven på s. 4 men delvis saknad eller felaktig i koden.
4. Överföringstabellerna på s. 5 är mycket mer detaljerade än den nuvarande funktionen `transfer2`; flera budalternativ är bara alternativa förklaringar i koden, inte fungerande beslut.
5. Analysbibliotekets fyr-essmetadata motsäger PDF:ens essfrågetabell på s. 7. Den måste korrigeras. Samtidigt bekräftar s. 5 uttryckligen RKC efter fullföljd överföring.
6. Livebeslut får inte använda partnerns verkliga hp, fördelning eller fit. Flera av de granskade funktionerna gör just detta.

## 1. Öppningen 1NT

**Källa: s. 2 och s. 4.**

Nordisk standard:
- 15–17 hp.
- Balanserad: 4333, 4432 eller 5332.
- 5-korts högfärg är uttryckligen tillåten.

Nuvarande kod:
- `opening()` väljer 1NT för balanserad hand med 15–17 hp.
- Handklassificeringen använder de balanserade formerna.

**Bedömning:** Öppningsvillkoret stämmer i sak. Kontrollera separat att alla tre balanserade formerna accepteras och att 5332 med femkorts högfärg inte sorteras bort.

## 2. Svarshandens första bud efter 1NT

**Källa: s. 4.**

| Bud | Nordisk standard | Nuvarande kod | Resultat |
|---|---|---|---|
| 2♣ | Frågar efter 4-korts högfärg; svarshanden lovar normalt egen 4-högfärg eller slamintresse. | Stayman när handen har 4+ i högfärg och kodens HP-gräns uppnås. | Kodens extra styrkegräns är inte angiven i PDF:en. En uttrycklig 2♣-väg för slamintresse utan egen fyrkorts högfärg saknas i nuvarande modell och behöver en separat källstyrd bedömning. |
| 2♦ | Överföring med minst 5 hjärter. | Överföring vid 5+ hjärter. | Stämmer i grundvillkoret. |
| 2♥ | Överföring med minst 5 spader. | Överföring vid 5+ spader. | Stämmer i grundvillkoret. |
| 2♠ | Dåliga kort med minst 6-korts lågfärg eller 5-5 i lågfärgerna; vill hellre spela 3 lågfärg än 1NT. | Reläväg finns, men kodens ordning kan få 8–9 hp obalanserade händer att returnera ej täckt innan lågfärgsreläet prövas. | Prioritet/handvillkor behöver rättas och testas mot både 6+ och 5-5. |
| 2NT | Naturlig invit med balanserad hand utan 4-korts högfärg. | Balanserad invit, men kodens intervall är 8–9 hp. | Balansvillkoret stämmer; den numeriska gränsen är inte angiven i PDF:en. |
| 3♣/3♦ | Invit med bra 6+ lågfärg. Öppnaren passar med xx eller xxx i stöd och söker topphonnör. | Kandidatbud/alternativ förekommer, men svarsmotorn väljer inte konsekvent 3-lågfärg som den dokumenterade inviten. Öppnaren kontrollerar A/K/D i färgen. | Behöver ren sekvensmodell. Definitionen av ”bra” är inte numeriskt preciserad i denna punkt. |
| 3NT | Slutbud. | Koden kan rekommendera 3NT med hjälp av gemensamma hp från partnerns faktiska hand. | Slutbudets betydelse stämmer; beslutet får inte bygga på dold partnerhand. |

**Viktig gräns:** PDF:en anger inte de exakta HP-intervall som koden använder för Stayman, 2NT-invit eller vissa svaga svar. Dessa tal ska inte göras till systemregler utan ytterligare källa.

## 3. Öppnarens svar efter Stayman

**Källa: s. 4.**

Nordisk standard anger:
- 2♦: ÖH har ingen 4+ högfärg.
- 2♥: ÖH har 4–5 hjärter och kan även ha 4-4 i högfärgerna.
- 2♠: ÖH har 4–5 spader.

Nuvarande `ntOpener()` väljer 2♥ när öppnaren har 4+ hjärter, annars 2♠ när öppnaren har 4+ spader, annars 2♦.

**Bedömning:** Svarsbetydelserna stämmer. Prioriteten 2♥ framför 2♠ vid 4-4 följer den uttryckliga formuleringen att 2♥ kan visa 4-4. Lägg ändå ett separat test för 4-4 så att detta inte ändras av framtida refaktorering.

## 4. Fortsättning efter Stayman

**Källa: s. 4.**

PDF:en anger:
- Efter 2♣ och öppnarens svar är 2NT och 3 i ÖH:s visade högfärg inviter.
- Ny färg från SH är utgångskrav och naturlig: 5+ högfärg eller 4+ lågfärg.
- Med utgångsstyrka och obalanserad hand med 5-korts högfärg bjuder SH 2♣ och därefter 3 i högfärgen.
- Särskild sekvens:
  - 1NT–2♣–2♥–2NT visar att SH har fyra spader.
  - Om ÖH har 4-4 i högfärgerna bjuder ÖH 3♠ med minimum och 4♠ med maximum.
  - Efter 1NT–2♣–2♥–3NT visar SH också fyra spader; ÖH kan bjuda 4♠ om ÖH har 4-4 i högfärgerna.

Nuvarande kod:
- `stay2()` använder generella 22/26-gemensamma-poänggränser för invit/utgång. Dessa gränser står inte i PDF:ens Stayman-avsnitt.
- `ntOpener3()` har nu den källstyrda specialgrenen: efter 1NT–2♣–2♥–2NT bjuder öppnaren 3♠ med 15–16 hp och 4♠ med 17 hp när öppnaren har 4-4 i högfärgerna.
- Efter 1NT–2♣–2♥–3NT bjuder öppnaren 4♠ med 4-4 i högfärgerna och passar annars.
- Dessa grenar har regressionstester i `tests/nt-stayman-continuations.test.js` och körs i CI.
- Kodens allmänna behandling av ny färg efter Stayman täcker inte tydligt hela det uttryckliga kravet: ny färg är naturlig och utgångskrav med 5+ högfärg eller 4+ lågfärg.

**Konkret korrigering:** 1NT–2♣–2♥–2NT och 1NT–2♣–2♥–3NT är nu implementerade enligt den specifika texten ovan. Det får inte ersättas med en generell 22/26-poängsregel.

**Öppen fråga:** PDF:en beskriver uttryckligen fortsättningen efter 2♥. Motsvarande fortsättning efter 2♠ ska inte spegelvändas automatiskt om inte annan systemtext styrker det.

## 5. Överföring till hjärter – fullständig gren

**Källa: s. 5.**

Efter 1NT–2♦:
- ÖH bjuder nästan alltid 2♥.
- Om ÖH har maximum och 4+ hjärter får ÖH bjuda 3♥ i stället.
- Efter 2♥ kan SH bjuda:
  - Pass: dåliga kort, men minst 5 hjärter.
  - 2NT: invit med jämn hand och exakt 5 hjärter.
  - 3♥: invit med 6+ hjärter.
  - 2♠: rondkrav med 5+ hjärter och 4+ spader.
  - 3 lå: utgångskrav med 5+ hjärter och 4+ lågfärg.
  - 3NT: välj utgång med jämn hand och exakt 5 hjärter.
  - 4 lå: kontrollbud och slamintresse i hjärter.
  - 4♥: slutbud.
  - 4NT: essfråga med hjärter som trumf (RKC).

Nuvarande kod:
- Har 0–8 hp som pass, 9 hp som invit och 10–15 hp som fortsättningsintervall. Dessa numeriska gränser är inte angivna i PDF:en.
- 3♥/2NT-inviter och 3NT-välj-utgång blandas med gemensamma poänggränser och partnerns faktiska hand.
- 2♠ och 3 lågfärg finns i vissa fall endast som `alt`, inte som en fullständig gren som väljs när handvillkoren stämmer.
- 4 lå, 4♥ och 4NT finns i betydelsetexten, men inte som komplett, källstyrd beslutstabell för svarshanden.
- Koden väljer 4♥/3♥ med hjälp av faktisk fit och gemensamma spelpoäng, vilket är otillåten dold information i livebeslut.

**Slutsats:** Överföringsgrenen är endast delvis implementerad. Systemets budbetydelser ska läggas in som explicita villkorade grenar. De saknade numeriska gränserna får inte fyllas med antagna HP-tal.

## 6. Överföring till spader – fullständig gren

**Källa: s. 5.**

Efter 1NT–2♥:
- ÖH bjuder nästan alltid 2♠; maximum med 4+ spader kan ge 3♠.
- Efter 2♠:
  - Pass: dåliga kort med minst 5 spader.
  - 2NT: invit med jämn hand och exakt 5 spader.
  - 3♠: invit med 6+ spader.
  - 3 lå: utgångskrav med 5+ spader och 4+ lågfärg.
  - 3♥: invit med minst 5-5 i båda högfärgerna.
  - 3NT: välj utgång med jämn hand och exakt 5 spader.
  - 4 lå: kontrollbud och slamintresse i spader.
  - 4♠: slutbud.
  - 4NT: essfråga med spader som trumf (RKC).

Nuvarande kod:
- Stöd för 3♥ med 5-5 finns som alternativ, men måste vara en explicit gren med rätt handvillkor.
- Övriga problem motsvarar hjärteröverföringen: obelagda HP-gränser, dold partnerhand och ofullständiga grenar för 3 lå, 3NT, 4 lå, 4♠ och 4NT.

## 7. Svagt lågfärgsrelä efter 1NT–2♠

**Källa: s. 4–5.**

SH visar svag hand med 6+ lågfärg eller 5-5 i lågfärgerna. ÖH:
- Bjuder 2NT med längre ruter eller lika längd i lågfärgerna.
- Bjuder 3♣ med längre klöver.
- Efter 2NT bjuder SH 3 lågfärg som slutbud.
- Efter 3♣ bjuder SH pass eller 3♦ som slutbud.

Nuvarande kod har den grundläggande längdjämförelsen i `ntOpener()` och slutbudshantering i `ntOpener3()`.

**Kontrollpunkt:** Se till att svarshandens svaga 2♠-relä prövas före generella obalanserade invit-/styrkegrenar där PDF:ens handvillkor är uppfyllda. Lägg separata tester för 6+ klöver, 6+ ruter, 5-5 lågfärger, lika längd samt längre ruter.

## 8. Tolkningen av 4NT – viktig konflikt

**Källa: s. 7, avsnittet ”Slaminstrument – RKC”.**

PDF:en skiljer mellan två lägen:

### Trumf är fastställd
Trumf är fastställd när färgen är bjuden och höjd, eller indirekt efter 2 i högfärg som svar på Stayman 2♣. Då gäller fem nyckelkort (fyra ess + trumfkungen):
- 5♣ = 0 eller 3 ess av 5.
- 5♦ = 1 eller 4 ess.
- 5♥ = 2 ess utan trumfdam.
- 5♠ = 2 ess med trumfdam.
- 5NT = 3 ess och någon renons.
- 6 i färg = 2 ess och renons i den bjudna färgen, med särskild nivåregel som anges på s. 7.

### Trumf är inte fastställd
Då räknas endast fyra ess:
- 5♣ = 0 eller 4 ess av 4.
- 5♦ = 1 ess.
- 5♥ = 2 ess.
- 5♠ = 3 ess.

### Konsekvens för nuvarande analysbibliotek
`analysbibliotek.json` anger i `oneNTNoTrumpAceAsk` att 1NT–4NT och 1NT–2♣–2♦–4NT har svaren 5♣=0, 5♦=1, 5♥=2, 5♠=3, 5NT=4. Detta är fel mot PDF:en på två punkter:
- 5♣ ska visa 0 eller 4, inte bara 0.
- PDF:en anger inte 5NT som svar för fyra ess i detta läge; 5♠ visar 3 ess.

Till skillnad från en allmän slutsats om trumffit anger PDF:ens överföringstabell på s. 5 uttryckligen att 4NT efter 1NT–2♦–2♥ är RKC med hjärter som trumf och att 4NT efter 1NT–2♥–2♠ är RKC med spader som trumf. Den regeln ska därför behållas. Den är en särskild uttrycklig överenskommelse i systemet, även om en full åttakortsfit inte alltid är känd.
 
S. 7 ger dessutom en separat regel om indirekt fastställd trumf efter 2♥/2♠ som svar på Stayman 2♣. Därför ska 4NT efter 1NT–2♣–2♥ eller 1NT–2♣–2♠ också klassificeras som fem-ess-RKC. Efter 2♦ (ingen högfärg) är ingen trumf fastställd; 4NT är då fyr-essfråga.

### Stayman och fastställd trumf
Efter Stayman-svar 2♥/2♠ anger PDF:en att trumf kan vara indirekt fastställd. Därför ska 4NT i dessa auktioner prövas som fem-ess-RKC enligt s. 7. Efter 2♦ (ingen högfärg) är ingen trumf fastställd; 4NT är då fyr-essfråga.

**Krav:** 4NT måste klassificeras med hela auktionshistoriken och fastställd trumfstatus. Ett generiskt 4NT-träd får inte användas.

## 9. Informationsgräns: livebeslut kontra efterhandsrättning

De nuvarande funktionerna `ntResp`, `ntOpener`, `stay2`, `transfer2`, `ntOpenerInvit` och `ntOpener3` tar emot partnerns faktiska hand eller använder dess poäng/längder.

Det kan användas i efterhandsdiagnostik men inte för ett livebud. I livebudgivningen ska partnerns hand representeras av det intervall och de egenskaper som partnerns bud visar. Om PDF:en inte ger tillräcklig information för att välja mellan invit, utgång eller pass ska funktionen lämna beslutet ej täckt eller använda en separat, tydligt märkt kompletterande policy.

## 10. Prioriterad korrigeringslista

### P0 – källkonflikter som måste rättas före vidare 1NT-utbyggnad
1. Rätta fyr-esssvaren i `oneNTNoTrumpAceAsk` enligt s. 7.
2. Separera 4NT efter Stayman 2♥/2♠ (fem nyckelkort) från 4NT efter 2♦ eller direkt 1NT (fyra ess).
3. Behåll den uttryckliga RKC-regeln efter fullföljd överföring (s. 5), och säkerställ att den klassificeras skilt från fyr-essfrågan utan trumf.
4. Behåll och regressionstesta de uttryckliga Staymanfortsättningarna efter 2♥–2NT och 2♥–3NT; de är nu implementerade.

### P1 – beslutsträd som saknar korrekt källstyrd modell
5. Lägg in hela hjärter- och spaderöverföringstabellen från s. 5 som explicita budgrenar.
6. Gör 2♠-lågfärgsreläet komplett och kontrollera prioriteten mot svaga/invitstyrka.
7. Gör 3-lågfärgsinvit efter 1NT explicit, inklusive öppnarens pass/3NT-beslut med xx/xxx kontra topphonnör.
8. Modellera ny färg efter Stayman som naturligt utgångskrav enligt s. 4.
9. Modellera Stayman 2♣ med slamintresse utan egen fyrkorts högfärg, men lämna styrketröskeln öppen tills den kan beläggas.
9. Ta bort obelagda numeriska HP-/gemensamma-poängsgränser ur systemfacit. Behåll dem endast om de kan beläggas på annan sida i samma PDF.

### P2 – tester och nodkvalitet
10. Skapa isolerade tester för varje tabellrad och gränsfall.
11. Kontrollera att nodernas handvillkor och roll matchar den faktiska spelaren.
12. Lägg till dold-hand-invarians för samtliga livebeslut.
13. Märk terminaler och ej modellerade fortsättningar explicit.

## 11. Testmatris att bygga

| Testfamilj | Obligatoriska variationer | Källa |
|---|---|---|
| 1NT-öppning | 4333, 4432, 5332 med 5-korts högfärg; 14/15/17/18 hp | s. 2, 4 |
| Staymanfråga | 4-korts högfärg; 4-4 båda; ingen 4-högfärg; svag hand kontra slamintresse där texten tillåter | s. 4 |
| Öppnarens Staymansvar | 0, 4♥, 4♠, 4-4 högfärg | s. 4 |
| Stayman fortsättning | 2NT efter 2♥; 3NT efter 2♥; 3 i visad högfärg; ny 5+ högfärg; ny 4+ lågfärg | s. 4 |
| Hjärteröverföring | svagt pass; 2NT exakt 5 och jämn; 3♥ 6+; 2♠ 5+/4+; 3m 5+/4+; 3NT jämn exakt 5; 4m; 4♥; 4NT | s. 5 |
| Spaderöverföring | motsvarande hjärterfall plus 3♥ med 5-5 högfärg | s. 5 |
| Lågfärgsrelä | 6+ lå; 5-5 lå; lika lågfärgslängd; längre ruter; längre klöver; signoff | s. 4–5 |
| 4NT utan trumf | 5♣ 0/4, 5♦ 1, 5♥ 2, 5♠ 3 | s. 7 |
| 4NT med fastställd trumf | samtliga 5-essvar och renonsvar | s. 7 |
| Liveisolering | samma egen hand och auktion, varierade tre dolda händer | arkitekturkrav |

## 12. Slutlig status

**Verifierat mot PDF:** 1NT-öppningens styrka/balans, grundbetydelserna för Stayman och överföringsbuden, öppnarens Staymansvar, de särskilda 2♥-Staymanfortsättningarna, lågfärgsreläets grundstruktur, uttrycklig RKC efter fullföljd överföring samt skillnaden mellan fyra och fem ess.

**Kodavvikelser identifierade:** obelagda styrkegränser, ofullständiga Stayman-svarshandsfortsättningar, ofullständiga överföringsgrenar, dold-hand-beroenden och felaktig fyr-essmetadata. De särskilda öppnarfortsättningarna efter 2♥–2NT/3NT är implementerade och testade. Överförings-RKC är däremot uttryckligen källbelagd och ska vara kvar.

**Uppdatering 2026-11-16:** P0-arbetet har nu kompletterats med Staymanfortsättningarna efter 1NT–2♣–2♥–2NT och 1NT–2♣–2♥–3NT. 2NT-grenen följer den uttryckliga 4-4-regeln: 3♠ med 15–16 hp och 4♠ med 17 hp. 3NT-grenen väljer 4♠ vid 4-4 i högfärgerna, annars pass. Övriga 2NT-handtyper lämnas ej täckta i stället för att få en påhittad fortsättning. Regressionstester har lagts till i `tests/nt-stayman-continuations.test.js`. Även T43-trädets villkor har rättats så att det inte motsäger den uttryckliga RKC-regeln efter fullföljd överföring på s. 5. Ändringarna ligger endast på `work/undisturbed-architecture`; `main` och konkurrensbudgivningen är orörda.
