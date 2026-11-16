# Kartläggning: 1NT-familjen – ostörd budgivning

**Datum:** 2026-11-16  
**Gren:** `work/undisturbed-architecture`  
**Status:** Kod- och sekvensinventering. Detta dokument godkänner inte nya systemregler.

## Avgränsning och princip

Omfattar öppning 1NT (15–17 hp, balanserad), svarshandens första bud, Stayman, överföringar, svarshandens fortsättning, öppnarens beslut, inviter, utgång och 4NT. Konkurrensbudgivning är exkluderad.

Rättningsmotorns befintliga kod är nulägesbeskrivning – inte automatiskt bevis på att varje detalj följer Nordisk Standard. Där systemunderlaget inte verifierar en fortsättning ska den lämnas som öppen fråga/ej täckt. Partnerns faktiska hand får inte användas i livebeslut.

## 1. Öppning och svarshandens första bud

Runtime-funktion: `ntResp(h,k,openerCards)`.

| Sekvens/situation | Nuvarande kodbeteende | Granskningsstatus |
|---|---|---|
| 1NT–2♣ | Stayman när svarshanden har minst fyra kort i en högfärg och uppfyller kodens styrkegräns | Kontrollera exakt styrkeintervall och eventuella undantag mot Nordisk Standard-texten |
| 1NT–2♦ | Överföring till hjärter vid minst fem hjärter | Sekvens identifierad; fortsättningsregler granskas separat |
| 1NT–2♥ | Överföring till spader vid minst fem spader | Sekvens identifierad; fortsättningsregler granskas separat |
| 1NT–2♠ | Relä till 3 lågfärg med lång lågfärg i svag hand | Systemkälla/alla handvillkor behöver verifieras |
| 1NT–2NT | Balanserad invit utan fyrkorts högfärg | Poänggräns och balansvillkor behöver verifieras |
| 1NT–3♣/3♦ | Invit med bra sexkortslågfärg | Definitionen av ”bra” och exakta villkor behöver verifieras |
| 1NT–3NT | Direkt sangutgång | Kontrollera att beslutet baseras på korrekt gemensam styrka i livebudgivning |

**Teknisk risk:** Funktionen tar emot `openerCards` och räknar gemensamma hp. Detta är efterhandsinformation och får inte styra svarshandens livebud. Livevarianten ska enbart använda svarshandens egen hand och den offentliga betydelsen av 1NT.

## 2. Öppnarens svar efter Stayman

Runtime-funktion: `ntOpener(h,k,r,responderCards)`.

| Auktion | Nuvarande kodbeteende | Granskningsstatus |
|---|---|---|
| 1NT–2♣–2♦ | Visar ingen fyrkorts högfärg | Sekvens finns |
| 1NT–2♣–2♥ | Visar 4+ hjärter; kan även ha fyra spader | Sekvens finns |
| 1NT–2♣–2♠ | Visar 4+ spader utan hjärter | Sekvens finns |
| Efter 2♣–2♦/2♥/2♠ | Flera fortsättningar hanteras av separata funktioner | Måste kartläggas sekvens för sekvens |

Kodens val av 2♥ framför 2♠ när öppnaren har båda fyrkorts högfärgerna är en explicit prioritering i implementationen. Den ska verifieras mot systemkällan, inte tas för given.

## 3. Svarshandens fortsättning efter Stayman

Runtime-funktion: `stay2(h,reply,openerCards)`.

Identifierade vägar:
- Efter 2♦ hanteras bland annat balanserad invit/utgång och en obalanserad femkortshögfärg.
- Efter visad högfärg hanteras fit, invit och utgång.
- Kodens gränser använder gemensamma hp eller gemensamma spelpoäng beroende på om det finns högfärgsfit.

**Öppna luckor som redan dokumenterats i givarrapporten:**
- Obalanserad invitstyrka efter 1NT–2♣–2♥ utan användbar fit.
- Öppnarens beslut efter 1NT–2♣–2♥/2♠–2NT: 3NT kontra eventuell fit i den andra högfärgen. Nuvarande kod returnerar uttryckligen ej täckt.
- Samma fortsättningsfråga förekommer i flera provgivare och ska inte lösas genom att anta att öppnarens egen fyrkortsfärg automatiskt ska återbjudas.

**Teknisk risk:** `stay2` läser öppnarens faktiska hand för att räkna fit och gemensamma spelpoäng. Det får endast användas i efterhandsrättning/test, inte i svarshandens livebeslut.

## 4. Överföringar

Runtime-funktioner: `transfer2(h,M,openerCards)`, `ntOpenerInvit` och `ntOpener3NTChoice`.

Källverifierade svarsvägar enligt Nordisk standard s. 5 och nuvarande `transfer2`:
- 0–7 hp: pass.
- 8–9 hp: invit; 2NT med jämn hand och exakt fem kort i överföringsfärgen, eller 3M med minst sex kort.
- 10–15 hp: 3NT med jämn hand och exakt fem kort, eller 4M med minst sex kort.
- Efter spaderöverföring: 3♥ invit med minst 5-5 i båda högfärgerna.
- Efter hjärteröverföring: 2♠ rondkrav med 5+♥ och 4+♠.
- Efter båda överföringarna: 3 lå är utgångskrav med 5+ överföringsfärg och 4+ i bjuden lågfärg; 4 lå är kontrollbud och slamintresse; 4NT är RKC med överföringsfärgen som trumf.

Gränserna och budbetydelserna är verifierade mot original-PDF:ens sida 5. Om flera lågfärger samtidigt uppfyller 4+-villkoret saknar källan en prioritet; motorn lämnar därför den situationen ej täckt. Styrkor över 15 hp hanteras ännu inte som en automatiserad slamväg.

**Öppna luckor/risker:**
- Obalanserad femkortshand efter överföring saknar fastställd fortsättning i vissa styrkelägen.
- Kodens val mellan kontrollbud och 4NT vid slamintresse är inte definierat.
- `transfer2` använder nu endast svarshandens egen hand för valet efter fullföljd överföring. Öppnarens beslut efter en invit är separat och ska inte användas som livebeslut med dold partnerhand.
- Öppnarens superaccept med 3 i överföringsfärgen förekommer i koden vid maxstyrka och minst fyra kort i färgen. Denna avvikelse från vanlig fullföljd överföring måste kontrolleras mot systemunderlaget.
- Efter svarshandens invit ska öppnarens beslut baseras på den information som inviten visar, inte partnerns faktiska kort.

## 5. 4NT och slamgränsen

Analysbibliotekets konventionsmetadata anger tre skilda betydelser:
1. 1NT–4NT: fyr-essfråga utan fastställd trumf.
2. 1NT–2♣–2♦–4NT: samma uttryckligen avtalade fyr-essfråga utan fastställd trumf.
3. Efter fullföljd överföring: 4NT är RKC 1430 med överföringsfärgen som trumf.

Detta är tre olika auktionstillstånd. De får inte slås ihop till en generell 4NT-regel. Svaren efter 4NT ligger utanför nuvarande omfattning enligt bibliotekets metadata.

**Kontrollpunkt:** Verifiera att dispatchern alltid kan avgöra om trumf är överenskommen innan 4NT klassificeras. Enbart budnivån 4NT räcker inte för att bestämma betydelsen.

## 6. Nödvändig arkitekturdelning

Funktionerna ovan blandar i dag livebeslut och efterhandsrättning genom parametrar som `openerCards` och `responderCards`.

Mål:
- `decideLive({ ownHand, seat, dealer, auction })`: ingen fullständig `hands`-array, ingen partnerhand, inget DDS-resultat.
- `judgeDeal({ hands, dealer, auction, ddsResult })`: får använda alla händer efter avslutad giv.
- Om systemets offentliga budinformation inte räcker för ett säkert livebeslut ska resultatet vara ej täckt – inte ett beslut baserat på dold hand.

Första testet ska hålla egen hand och offentlig auktion konstanta och byta de tre dolda händerna. Livebeslut och motivering måste då vara identiska.

## 7. Föreslagen verifieringsmatris

Varje rad ska få:
- exakt sekvens inklusive pass från övriga spelare;
- roll och vem som ska bjuda;
- egen handprofil och styrkeintervall;
- vad partnerns bud faktiskt visar (intervall, inte exakt dold hand);
- förväntat bud eller uttryckligt ej täckt;
- källa/sidnummer i Nordisk Standard;
- isolerat regressionstest;
- motsvarande analysnod-ID eller markering att nod saknas.

Prioriterad ordning:
1. 1NT–2♣ och öppnarens 2♦/2♥/2♠.
2. Svarshandens fortsättning efter vart och ett av dessa svar.
3. Överföring och öppnarens fullföljning/superaccept.
4. Svarshandens källstyrda fortsättningar efter fullföljd överföring.
5. Inviter och öppnarens accept/pass.
6. Direkt 4NT, Stayman-4NT och överförings-RKC.
7. Terminaler, ej täckta fortsättningar och dubbletter i analysbiblioteket.

## 8. Källgranskning mot Nordisk standard

Den fullständiga PDF:en `nordisk_standard.pdf` (2012-08-22) har nu kontrollerats, inte bara en sammanfattning. Se `GRANSKNING_1NT_NORDISK_STANDARD.md` för sida-för-sida-korsreferens och prioriterad avvikelselista.

Viktiga bekräftade källregler:
- 1NT: 15–17 hp, 4333/4432/5332, även femkorts högfärg (s. 2, 4).
- Stayman 2♣ frågar efter fyrkorts högfärg; öppnarens 2♦/2♥/2♠-svar har uttryckliga betydelser (s. 4).
- Efter 1NT–2♣–2♥ är 2NT och 3NT-fortsättningarna med fyrkorts spader särskilt beskrivna (s. 4).
- Hela hjärter- och spaderöverföringstabellen är specificerad på s. 5.
- Svagt lågfärgsrelä efter 2♠ är specificerat på s. 4–5.
- 4NT har två olika essfrågetabeller beroende på om trumf är fastställd; fyr-esssvaret 5♣ betyder 0 eller 4, inte bara 0 (s. 7).
- Efter fullföljd överföring är 4NT uttryckligen RKC med överföringsfärgen som trumf (s. 5). Efter Stayman-svaret 2♥/2♠ är högfärgen indirekt fastställd (s. 7).

Källgranskningen hittade verkliga kod-/dokumentavvikelser. Dessa ska åtgärdas i ordningen P0, P1, P2 i granskningsrapporten. Ingen ny HP-gräns får införas enbart för att koden redan använder den.

## 9. Ändringsstatus

Källgranskningen är dokumenterad i `GRANSKNING_1NT_NORDISK_STANDARD.md`. En första P0-korrigering har nu gjorts i rättningsmotorn och analysbiblioteket:
- Fyr-essfrågan utan trumf använder 5♣=0/4, 5♦=1, 5♥=2, 5♠=3.
- 4NT efter fullföljd överföring och efter Stayman 2♥/2♠ klassificeras som RKC.
- Odefinierade 4NT-sekvenser efter 2NT och 2♣-öppning har tagits bort ur automatisk fyr-essfrågematchning.
- Fortsättningen efter svar på fyr-essfrågan lämnas ej täckt eftersom PDF:en inte anger den.
- Analysmatcharen filtrerar inte längre bort den giltiga fyr-essfrågetabellen på grund av en textmatchning.

Nya regressionstester finns i `tests/nt-four-ace-source.test.js`. Öppnarens särskilda Staymanfortsättningar efter 2♥–2NT/3NT är nu verifierade och regressionstestade. Återstår: fullständig svarshandslogik efter Stayman, hela överföringstabellen, lågfärgsreläets prioritet och live-/efterhandsseparationen för samtliga 1NT-funktioner. Konkurrensbudgivning och `main` är orörda.


## 10. Uppdatering efter förnyad sidkontroll – 2026-11-16

Original-PDF sida 5 anger uttryckligen intervallen 0–7, 8–9 och 10–15 hp efter fullföljd överföring. De har nu återinförts i motorn och T03/T07/T08 har uppdaterats. Fyra separata invitträd (T19/T20/T27/T28) är fortfarande preliminära eftersom de beskriver öppnarens accept/pass efter inviten, vilket inte framgår av överföringstabellen på sida 5.

Stayman sida 4 har också implementerats tydligare: efter 2♦, 2♥ eller 2♠ är en ny färg naturlig och utgångskrav med 5+ högfärg eller 4+ lågfärg. Efter 2♥ visar 2NT exakt fyra spader. Om flera nya färger samtidigt uppfyller längdkraven lämnas prioriteten ej täckt.

Nya regressionstester:
- `tests/nt-transfer-source-boundaries.test.js`: exakta styrkeintervall, fem-/sexkortsfärg och 5-5 högfärg.
- `tests/nt-stayman-continuations.test.js`: naturliga utgångskravsbud efter samtliga Stayman-svar samt 2NT med exakt fyra spader efter 2♥.
