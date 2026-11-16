# Granskning: 1NT-familjen mot Nordisk standard (2012-08-22)

**Datum:** 2026-11-16  
**Arbetsgren:** `work/undisturbed-architecture`  
**Auktoritativ källa:** användarens `nordisk_standard.pdf`, s. 1–8. För 1NT är s. 4–5 och slamreglerna på s. 7 avgörande.  
**Kodgranskning:** `rattningsmotor.js`, `analysbibliotek.json`, befintliga testfiler.  
**Status:** Källgranskning och aktiv implementation. Rättningsmotorn, analysbiblioteket och regressionstesterna har uppdaterats på arbetsgrenen; `main` är orörd.

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
| 2♠ | Dåliga kort med minst 6-korts lågfärg eller 5-5 i lågfärgerna; vill hellre spela 3 lågfärg än 1NT. | Handformen kan identifieras, men styrkan 'dåliga kort' saknar numerisk gräns i PDF:en. | Styrkevalet lämnas ej täckt; fortsättningarna efter reläet testas separat. |
| 2NT | Naturlig invit med balanserad hand utan 4-korts högfärg. | Balanserad invit; den tidigare kodade 8–9 hp-gränsen är borttagen eftersom PDF:en inte anger den. | Balansvillkoret stämmer; den numeriska gränsen är inte angiven i PDF:en. |
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
- Har tidigare använt numeriska intervall för pass/invit/utgång. De är inte angivna i PDF:en och har nu tagits bort från automatisk fortsättningsklassificering.
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

**Källa: Nordisk standard s. 5 och s. 7, avsnittet ”Slaminstrument – RKC”.**

PDF:en skiljer mellan två lägen.

### Trumf är fastställd

Trumf är fastställd när färgen är bjuden och höjd, eller indirekt efter 2♥/2♠ som svar på Stayman 2♣. Efter fullföljd överföring 1NT–2♦–2♥ respektive 1NT–2♥–2♠ anger sida 5 också uttryckligen RKC med överföringsfärgen som trumf.

Fem nyckelkort är fyra ess och trumfkungen. Den tryckta svarstabellen på sida 7 är:
- 5♣ = 0 eller 3 nyckelkort.
- 5♦ = 1 eller 4 nyckelkort.
- 5♥ = 2 utan trumfdam.
- 5♠ = 2 med trumfdam.
- 5NT = 3 och någon renons.
- 6 i färg = 2 och renons; 6 i trumf om renonsfärgen är högre än trumf.

**Rättelse av tidigare implementation:** En tidigare kodversion och rapport använde omvänd 1430-ordning (5♣=1/4 och 5♦=0/3). Något uttryckligt användarbeslut om att avvika från Nordisk standard har inte hittats. Den tidigare mappningen var därför fel i förhållande till projektets auktoritativa systemkälla. Den är nu korrigerad till 5♣=0/3 och 5♦=1/4 i rättningsmotor, tester och analysbibliotek.

### Trumf är inte fastställd

Då räknas endast fyra ess:
- 5♣ = 0 eller 4 ess av 4.
- 5♦ = 1 ess.
- 5♥ = 2 ess.
- 5♠ = 3 ess.

5NT är inte svar för fyra ess.

### Fortsättning efter RKC-svar

Nordisk standard s. 7 anger att efter 5♣/5♦ frågar nästa bud som inte är trumf efter trumfdamen. 5 i trumf förnekar damen; 5NT visar den; 6 i ny färg visar damen och kung i den färgen. Efter dubbeltydigt 5-lågsvar och förnekad trumfdam bjuder frågeställaren 6 i trumf med 3 eller 4 egna ess.

Motorn modellerar endast budvägar där den frågande färgen är laglig och 5 i trumf fortfarande kan användas som lagligt förnekande. Andra budordningslägen lämnas ej täckta och loggas.

### Projektets slamgränser

- 6 i färg: minst 3 av 4 ess i partnerskapet.
- 7NT: alla 4 ess.
- 7 i färg: alla 4 ess och trumfkungen.

Motorn rekommenderar bara slam när samtliga kortkombinationer som är förenliga med det offentliga RKC-svaret uppfyller gränsen. Om svaret fortfarande tillåter både tillräcklig och otillräcklig essfördelning lämnas läget ej täckt.

**Krav:** 4NT klassificeras med hela auktionshistoriken. Fyr-essfråga, RKC och kvantitativ 4NT ska hållas åtskilda.

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
10. Ta bort obelagda numeriska HP-/gemensamma-poängsgränser ur systemfacit. Behåll dem endast om de kan beläggas på annan sida i samma PDF.

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

**Uppdatering 2026-11-16:** P0-arbetet har nu kompletterats med Staymanfortsättningarna efter 1NT–2♣–2♥–2NT och 1NT–2♣–2♥–3NT. 2NT-grenen följer den uttryckliga 4-4-regeln: 3♠ med 15–16 hp och 4♠ med 17 hp. 3NT-grenen väljer 4♠ vid 4-4 i högfärgerna, annars pass. Övriga 2NT-handtyper lämnas ej täckta i stället för att få en påhittad fortsättning. Regressionstester finns i `tests/nt-stayman-continuations.test.js`. Analysbibliotek 0.6.6 innehåller dessutom `T45_STAYMAN_2H_CONTINUATIONS` med sex explicita noder för dessa sekvenser; detta valideras i `tests/nt-stayman-analysis-tree.test.js`. Även T43-trädets villkor har rättats så att det skiljer fyr-essfråga från RKC efter fullföljd överföring på s. 5. Ändringarna ligger endast på `work/undisturbed-architecture`; `main` och konkurrensbudgivningen är orörda.


## Uppdatering: överföringsfortsättningar (2026-11-16)

En ny kontroll mot Nordisk standard s. 5 har gjorts för svarshandens fortsättningar efter fullföljd överföring.

**Nu täckt direkt av källans kvalitativa beskrivningar i rättningsmotorn:**
- Efter hjärteröverföring: 2♠ som enrondskrav med minst 5♥ och 4+♠.
- Efter hjärteröverföring: 3♣/3♦ som utgångskrav med minst 5♥ och 4+ i den bjudna lågfärgen. Om båda lågfärgerna har fyra kort lämnas prioriteten ej täckt.
- Efter spaderöverföring: 3♥ som invit med minst 5-5 i högfärgerna.
- RKC 4NT efter fullföljd överföring hanteras separat enligt källans uttryckliga regel.

**Korrigering efter kontroll av original-PDF sida 5:** Tabellen anger INTE numeriska HP-intervall. Den anger endast kvalitativa styrkebeskrivningar:
- Pass: dåliga kort men minst fem kort i överföringsfärgen.
- 2NT: invit med jämn hand och exakt fem kort.
- 3M: invit med minst sex kort.
- 3NT: välj utgång med jämn hand och exakt fem kort.
- 4M: slutbud.
Motorn ska därför inte välja mellan dessa kategorier utifrån påhittade HP-intervall.
- Efter spaderöverföring: 3♥ invit med minst 5-5 i högfärgerna.
- Särskilda färggrenar: 2♠ rondkrav efter hjärteröverföring med 5+♥/4+♠; 3 lå utgångskrav med 5+ överföringsfärg/4+ lå; 4 lå kontrollbud och slamintresse; 4NT RKC.

Fyra äldre överförings-invitträd (T19/T20/T27/T28) har status `provisional_source_gap`, eftersom de innehåller öppnarens accept/pass efter inviten, vilket inte specificeras i överföringstabellen på sida 5. Därutöver är inviterna efter 1NT/Stayman (T04/T06/T11/T12/T13/T17/T24/T25/T26) preliminära eftersom deras numeriska styrke-/acceptgränser inte är belagda. T42 är däremot kvar som källbaserat kvalitativt träd: det beskriver 'dåliga kort' och lågfärgsreläets fortsättningar, men motorn rekommenderar inte 2♠ automatiskt med en påhittad HP-gräns. Grundträden T03/T07/T08 har status `source_qualitative`: deras budbetydelser är källbelagda och kan visas som kvalitativ förklaring, men får inte användas för numerisk styrkeklassificering.

Motorn använder svarshandens egen hand för att välja fortsättningsbud efter fullföljd överföring. Öppnarens efterhandsbeslut efter en invit är en separat fråga och ska inte exponeras som livebeslut med dold partnerhand.

Regressionstester kontrollerar att olika HP-tal inte skapar påhittade intervall, samtidigt som specialgrenarna 2♠, 3 lågfärg och 3♥ efter spaderöverföring testas. CI-workflowen kör `tests/nt-transfer-source-boundaries.test.js`.

**Nästa steg:** fortsätta med Stayman-svarshandens inviter och lågfärgsreläets kvalitativa styrkebeskrivning, utan att automatisera numeriska gränser som saknas i källan.


### Stayman – korrigerad styrkegräns

Även Stayman 2♣ har korrigerats på svarshandens första bud: en egen fyrkortshögfärg räcker för att välja Stayman enligt Nordisk standard s. 4. Den tidigare automatiska gränsen på 8 hp saknar stöd i den citerade källan och är borttagen för 1NT-svar. Möjligheten att använda Stayman med slamintresse utan egen fyrkortshögfärg kräver separat modellering; någon ny HP-gräns har inte införts. Regressionstestet innehåller nu en fyrkortshögfärgshand under den tidigare gränsen.


### Uppdatering: Stayman – naturliga utgångskrav (s. 4)

Efter svar på 1NT–2♣ har svarshandens nya färg nu implementerats som naturlig och utgångskrav enligt sida 4: 5+ kort i ny högfärg eller 4+ kort i ny lågfärg. Efter öppnarens 2♥ visar svarshandens 2NT exakt fyra spader; den grenen hanteras före de naturliga färgbuden. Om flera nya färger samtidigt uppfyller längdkraven lämnas prioriteten ej täckt i stället för att motorn väljer godtyckligt.

Regressionstester täcker nya färger efter 2♦, 2♥ och 2♠ samt 2NT med exakt fyra spader efter 2♥.


### Naturlig 2NT-invit efter 1NT – numerisk gräns saknas

Nordisk standard s. 4 anger betydelsen "naturlig invit med balanserad hand utan 4-korts högfärg", men anger inte ett numeriskt HP-intervall för svarshandens val av 2NT. Därför har den tidigare kodade 8–9 hp-gränsen tagits bort som automatisk regel. Rättningsmotorn lämnar den handklassificeringen ej täckt tills gränsen kan beläggas eller bekräftas. Öppnarens beslut efter en faktisk 2NT-invit kan inte göras live med partnerns dolda hand; den numeriska styrkegränsen för 3NT är inte fastställd och används därför inte i live- eller efterhandsrättning.

Nordisk standard beskriver 3NT som slutbud och användaren har accepterat 25 gemensamma honnörspoäng som gräns för sangutgång. I sang räknas endast HP. Analysbibliotekets träd för direkt 3NT är därför markerade `user_confirmed`; den separata 26-poängsgränsen för högfärgsutgång ska inte blandas in.


### Stayman-inviter – endast utgångsgränsen är numeriskt fastställd

Efter 1NT–2♣ har nya färger nu de uttryckliga källreglerna (5+ högfärg/4+ lågfärg, utgångskrav) och 2NT efter 2♥ visar exakt fyra spader. Däremot är 2NT som naturlig invit och 3M som invit efter visad högfärg beskrivna som inviter utan numeriskt styrkeintervall i PDF:en. Därför används inte tidigare kodade 22–25- eller 8–9-gränser för att välja mellan pass och invit. Rättningsmotorn lämnar dessa fall ej täckta. Den användarbekräftade 26-poängsgränsen gäller högfärgsutgång i de sekvenser där den har fastställts; den överförs inte automatiskt till Stayman, överföringar eller sang.


### Svagt lågfärgsrelä 1NT–2♠ – styrkegräns lämnas öppen

Nordisk standard s. 4 anger 2♠ som ett svagt/dåligt svar med minst sex kort i en lågfärg; reläet kan också användas med 5-5 i lågfärgerna. Öppnaren visar längre klöver med 3♣, annars 2NT (längre ruter eller lika längd). Efter 2NT bjuder svarshanden 3♣/3♦ som signoff; efter 3♣ passar svarshanden eller bjuder 3♦ som signoff.

PDF:en anger inte ett numeriskt HP-intervall för "dåliga kort". Rättningsmotorn har därför slutat använda den tidigare implicit antagna gränsen 0–7 hp för att rekommendera 2♠. När handen har 6+ kort i en lågfärg eller 5-5 i lågfärgerna markeras reläet som en möjlig formmässig väg, men styrkan lämnas ej bedömd tills en källa eller användarbekräftelse anger gränsen. Öppnarens svar och svarshandens signoff efter 2♠ är separata, källstyrda auktionstillstånd.

### Överlappande specialfortsättningar efter överföring

Efter hjärteröverföring kan samma hand uppfylla både 2♠-villkoret (5+♥/4+♠, rondkrav) och 3♣/3♦-villkoret (5+♥/4+ lågfärg, utgångskrav). Källtabellen anger betydelserna men inte vilken som har prioritet när båda är uppfyllda. Rättningsmotorn lämnar därför dessa överlappande händer ej täckta. Om båda lågfärgerna uppfyller 4+-villkoret lämnas också prioriteten ej täckt.

Testerna kontrollerar både överlappet och att ingen prioritet hittas på.


### Svagt lågfärgsrelä efter 1NT – kvalitativ styrka

Nordisk standard s. 4 beskriver 2♠ som ett relä för "dåliga kort" med 6+ kort i en lågfärg eller 5-5 i lågfärgerna. Källan anger inte ett numeriskt HP-intervall för "dåliga kort". Rättningsmotorn lämnar därför valet av 2♠ ej täckt när handen endast kan klassificeras med en antagen numerisk gräns. T42 behålls som källbaserat kvalitativt analysmaterial för att förklara budet och fortsättningarna, men inte som grund för en automatisk numerisk styrkeklassificering.


### Förtydligande: 2NT efter Stayman 2♥ är en särskild invitväg

2NT efter 1NT–2♣–2♥ visar exakt fyra spader. Öppnaren med 4-4 i högfärgerna svarar 3♠ med 15–16 hp och 4♠ med 17 hp (s. 4). Denna sekvens får inte behandlas som en vanlig 26-hp-sangutgång: 2NT är uttryckligen en invit som samtidigt söker den andra högfärgsfitten. Källan anger inte numeriskt när svarshanden ska välja pass respektive 2NT. Efter Stayman 2♦, där öppnaren förnekat fyrkortshögfärg, kan 10 egna hp garantera minst 25 gemensamma hp mot 1NT-minimum och ge 3NT live. Denna regel gäller inte den särskilda 2NT-inviten efter Stayman 2♥ som visar fyra spader. Även starka händer lämnas ej klassificerade för just valet pass/2NT tills gränsen är belagd.


### Öppnarens fortsättning efter 3 lågfärg som utgångskrav efter överföring

Efter fullföljd överföring är 3♣/3♦ från svarshanden ett utgångskrav när svarshanden har minst fem kort i överföringsfärgen och minst fyra i den bjudna lågfärgen (s. 5). PDF:en anger budets kravbetydelse, men inte en komplett fortsättningsstruktur för öppnaren. I 100-givarsimuleringen identifierades två sådana lägen (ostord-100-037 och ostord-100-066) där öppnarens nästa bud inte kan fastställas från den dokumenterade tabellen. Dessa fortsättningar lämnas ej täckta; motorn ska inte hitta på ett kontrollbud, sangbud eller annan fortsättning.


### Öppnarens fortsättning efter svarshandens 3 lågfärg (utgångskrav)

Överföringstabellen anger att 3♣/3♦ efter fullföljd överföring är utgångskrav när svarshanden visar minst fem kort i överföringsfärgen och 4+ i den bjudna lågfärgen. Däremot specificerar den inte öppnarens exakta återbud efter detta utgångskrav. Rättningsmotorn markerar därför öppnarens fortsättning som ej täckt i stället för att välja 3NT, 4M eller kontrollbud utifrån dolda kort eller en egen prioritet. Detta är nu dokumenterat i 100-givarkorpusen som två explicita källgap (givar 037 och 066).


### Avgränsning: 2NT–4NT är kvantitativ invit, inte essfråga

Den separata överenskommelsen för 2NT–4NT har nu kodats uttryckligen som kvantitativ invit till 6NT. Den får inte gå via fyr-essfrågan eller RKC. Öppnarens accept/pass är fortsatt ej täckt eftersom en numerisk gräns för minimum/maximum i den aktuella fortsättningen inte har verifierats här. Regressionstestet kontrollerar både att 4NT klassificeras som kvantitativ invit och att öppnarens svar inte blir ett påhittat ess-/nyckelkortssvar.


### Live 3NT efter Stayman 2♦

När öppnaren svarar 2♦ har öppnaren förnekat 4-korts högfärg. Om svarshanden har en balanserad hand med minst 10 egna hp garanteras minst 25 gemensamma hp även mot öppnarens 15-hp-minimum. Live-motorn kan därför bjuda 3NT utan att läsa öppnarens dolda kort. Med 9 hp går det inte att garantera 25; eftersom den numeriska invitgränsen inte anges lämnas pass/invit ej täckt.


### Öppnarens eventuella korrigering efter svarshandens 3NT efter överföring

Nordisk standard s. 5 säger att svarshanden väljer utgång med 3NT vid jämn hand och exakt fem kort i överföringsfärgen. Tabellen anger inte uttryckligen om öppnaren ska korrigera till 4M när öppnaren har tre eller fler kort i överföringsfärgen. Den tidigare implementationen gjorde automatiskt en sådan korrigering; detta är nu borttaget. Öppnaren passar när stödet är färre än tre kort, men lämnar läget ej täckt vid 3+ stöd tills en källa eller användarbekräftelse anger fortsättningen.


### Öppnarens svar efter svarshandens naturliga utgångskravsbud efter Stayman

Efter 1NT–2♣–2♦/2♥/2♠ är svarshandens nya färg naturlig och utgångskrav (5+ högfärg eller 4+ lågfärg, s. 4). Den generella regeln på sida 4 säger att partnern försöker visa extra längder eller bjuda sang, men ger inte en komplett prioriterad svarstabell för alla handtyper. Motorn känner igen svarshandens kravbud, men lämnar öppnarens nästa bud ej täckt när det kräver att den prioriterar mellan sang, stöd och sidofärgsvisning. 100-givarsimuleringen har identifierat sådana sekvenser i ostord-100-001, 031, 040, 048 och 052. Detta är avsiktliga luckor, inte runtimefel.


### Viktig korrigering av överföringstabellen – original-PDF sida 5

En ny läsning av själva PDF-sidan visar att tidigare text i denna granskningsfil som påstod att 0–7, 8–9 och 10–15 hp stod i tabellen var felaktig. Dessa intervall finns inte på sidan. Alla sådana numeriska regler är borttagna ur `transfer2`, och T03/T07/T08 har markerats `source_qualitative` eftersom de innehåller källbelagda budbetydelser men inte kan klassificera styrkan mellan svag/invit/utgång. De särskilda formvillkoren för 2♠, 3 lågfärg och 3♥ efter spaderöverföring är fortsatt implementerade när de är entydiga. Överlapp utan angiven prioritet lämnas ej täckt.


**Aktuell tolkning:** Överföringstabellens styrkebeskrivningar är kvalitativa. Äldre avsnitt i denna rapport som återger 8–9 hp eller andra numeriska gränser beskriver den tidigare implementationen och är inte godkända systemregler. Den styrkeklassificeringen är nu markerad ej täckt i motorn och i analysbiblioteket.


### Pass efter 1NT – ingen automatisk HP-gräns

Sida 4 beskriver svaga/dåliga kort kvalitativt i samband med 1NT-svaren, men anger inte en numerisk gräns för när en hand utan 4-korts högfärg eller längre färg ska passa. Den tidigare automatiska passgränsen under 8 hp har därför tagits bort. När handen inte uppfyller en uttrycklig Stayman-, överförings- eller reläprofil lämnas beslutet ej täckt i stället för att motorn antar en HP-gräns.


### Numerisk sangutgångsgräns ej fastställd

Användaren har accepterat 25 sammanlagda honnörspoäng för 3NT. I sang räknas endast HP, inte fördelnings-/trumfpoäng. Detta är separat från 26 gemensamma spelpoäng för högfärgsutgång och 28 för lågfärgsutgång. Efter partnerns 1NT (15–17 HP) kan 10 egna HP garantera 3NT live; 9 egna HP kan inte garantera 25.

Användaren har bekräftat 25 sammanlagda honnörspoäng för 3NT; i sang räknas endast HP, inte fördelnings-/trumfpoäng. Det är separat från 26 gemensamma spelpoäng för högfärgsutgång och 28 för lågfärgsutgång. Därför kan 10 egna HP efter partnerns 1NT (15–17 HP) garantera 3NT, medan 9 egna HP inte gör det. Den naturliga 2NT-inviten har fortfarande ingen källbelagd numerisk styrkegräns och ska inte antas vara 8–9 HP.


### Fortsatt arbete: Stayman-inviter och lågfärgsinvit (2026-11-16)

Fortsatt implementation på arbetsgrenen:

- Efter Stayman 2♥ känns 3♥ igen som invit i öppnarens visade hjärter.
- Efter Stayman 2♠ känns 3♠ igen som invit i öppnarens visade spader.
- 2NT efter Stayman 2♠ känns igen som en invit.
- De här inviterna lämnas fortfarande ej täckta som automatiska styrkebeslut eftersom Nordisk standard s. 4 inte anger numeriska gränser för svarshandens val eller öppnarens accept.
- Analysbiblioteket har fått T46 `STAYMAN_INVIT_MEANINGS`, ett kvalitativt träd med de tre uttryckliga invitbetydelserna. Det innehåller inga påhittade acceptgrenar.
- Efter 1NT–3♣/3♦ har analysbiblioteket fått T47 `1NT_MINOR_INVIT`. Det dokumenterar att 3m är invit med bra 6+ lågfärg, att öppnaren passar med xx/xxx utan topphonnör och söker 3NT med A/K/D i 2–3-kortsstöd. Definitionen av "bra" och eventuell numerisk styrkegräns lämnas öppen.
- Regressionstesterna för öppnarens stöd efter 3♣/3♦ har utökats med fler 2- och 3-kortsstöd, både med och utan topphonnör.
- Överföringstesterna har utökats med superacceptgränsen: 17 hp och 4+ kort i överföringsfärgen ger 3M; 16 hp med samma färglängd fullföljer normalt med 2M.

**Verifiering:** CI på arbetsgrenen passerar med samtliga 1NT-tester, analysbibliotekets strukturtest, Stayman-analystestet, 1♥/1♠-regressionen och den breda ostörda givarkorpusen. Senaste godkända körning: `43935968651`.

Ingen ändring har gjorts på `main`.

## 13. Modulgräns vid 4NT (2026-11-16)

Den överenskomna avgränsningen är nu uttrycklig i både kod och analysbibliotek:

- **1NT-familjen (`sangbudgivning.js`)** modellerar budgivningen fram till och med att någon i paret bjuder 4NT. 4NT kan finnas som terminalt val i en 1NT-sekvens, men 1NT-modulen tolkar inte svaren.
- **4NT-/slammodulen (`slamlogik.js`)** äger tolkningen av 4NT: fyr-essfråga, RKC, kvantitativ 4NT, trumfbestämning från den offentliga budhistoriken och svaren på frågan. Fortsättningen efter svaret byggs där, inte i 1NT-modulen.
- Analysbibliotekets `T43_1NT_4NT_ENDPOINTS` är ett rent överlämningsträd. Varje nod slutar exakt på 4NT och har inga grenar efter detta bud. Överföringsträden visar också 4NT som terminal gren.
- En separat arkitekturtestfil kontrollerar modulägarskap, T43:s terminala noder och att 4NT-grenarna i överföringsträden inte fortsätter i 1NT-familjen.

Detta innebär inte att 4NT-arbetet är färdigbyggt. Det betyder att dess logik ligger på rätt plats och kan byggas ut separat utan att 1NT-familjen växer förbi sin överenskomna slutpunkt.

## Slutlig komplettering – sangfamiljen, 2026-11-16

Den sista genomgången mot original-PDF:en har även omfattat 2NT-öppningen på s. 5. Den säger uttryckligen att budgivningen sker som efter 1NT men en nivå högre. Runtime omfattar därför 2NT-öppningens första svar, Stayman, överföringar, öppnarens första svar, 21-hp-superaccept på fyrkortsstöd och direkt 3NT när svarshandens egna 5 hp garanterar 25 gemensamma hp. 2NT–4NT hålls separat som kvantitativ invit till 6NT.

Följande försiktighetsregler har också låsts i kod och test:
- Lika långa klöver/ruter efter 2♠-reläet har ingen automatisk klöverprioritet. Positionen lämnas EJ TÄCKT.
- Stayman 2♥ följt av svarshandens 2NT/3NT och öppnarens 3♠/4♠ etablerar spaderfit. Senare 4NT klassificeras som RKC med spader som trumf, inte som hjärter-RKC enbart för att öppnaren tidigare bjöd 2♥.
- 4NT efter överföringssuperaccept 3♥/3♠ lämnas EJ TÄCKT tills den exakta fortsättningen verifierats i systemet.
- 2NT-öppningens senare fortsättningar som inte kan härledas säkert ur uttrycket ”en nivå högre” lämnas EJ TÄCKT. 3♠ svagt lågfärgsrelä efter 2NT har inte antagits.

Alla ej täckta positioner ska sparas automatiskt i exportfilen ej-tackta-budsekvenser.json; källuckor fylls inte med antagna prioriteringar eller HP-intervall.
