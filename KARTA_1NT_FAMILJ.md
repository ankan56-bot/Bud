# Kartläggning: 1NT-familjen – ostörd budgivning

**Datum:** 2026-11-16  
**Gren:** `work/undisturbed-architecture`  
**Status:** Kod- och sekvensinventering. Detta dokument godkänner inte nya systemregler.

## Avgränsning och princip

Omfattar öppning 1NT (15–17 hp, balanserad), svarshandens första bud, Stayman, överföringar, svarshandens fortsättning, öppnarens beslut, inviter, utgång och 4NT. Konkurrensbudgivning är exkluderad.

Rättningsmotorns befintliga kod är nulägesbeskrivning – inte automatiskt bevis på att varje detalj följer Nordisk Standard. Där systemunderlaget inte verifierar en fortsättning ska den lämnas som öppen fråga/ej täckt. Partnerns faktiska hand får inte användas i livebeslut.

## 1. Öppning och svarshandens första bud

Runtime-funktion: `ntResp(h,k,openerCards)`. I livevarianten används 1NT-öppningens offentliga 15–17-intervall; partnerns exakta kort används inte.

| Sekvens/situation | Nuvarande kodbeteende | Granskningsstatus |
|---|---|---|
| 1NT–2♣ | Stayman med egen 4-korts högfärg eller slamintresse | Egen fyrkortshögfärg är källbelagd; slamintresse utan egen 4-högfärg behöver separat modellering |
| 1NT–2♦ | Överföring till hjärter vid minst fem hjärter | Sekvens identifierad; fortsättningsregler granskas separat |
| 1NT–2♥ | Överföring till spader vid minst fem spader | Sekvens identifierad; fortsättningsregler granskas separat |
| 1NT–2♠ | Svagt lågfärgsrelä med 6+ lågfärg eller 5-5 lågfärger | Källbelagt s. 4–5; styrkebeskrivningen är kvalitativ och prioritet mot andra svar ska testas |
| 1NT–2NT | Naturlig invit med balanserad hand utan 4-korts högfärg | Betydelsen källbelagd s. 4; exakt numeriskt HP-intervall anges inte |
| 1NT–3♣/3♦ | Invit med bra 6+ lågfärg | Källbelagt s. 4; kvaliteten på ”bra” behöver preciseras |
| 1NT–3NT | Slutbud i sang | Källbelagd betydelse s. 4; livevalet måste respektera partnerns 15–17-intervall |

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

Runtime-funktion: `stay2(h,reply,openerCards)`; de källstyrda 2NT-/nya-färggrenarna returnerar innan någon dold partnerhand behövs.

Källverifierade vägar enligt sida 4:
- Efter 2♥ visar svarshandens 2NT exakt fyra spader.
- Efter 2♦, 2♥ eller 2♠ är en ny färg naturlig och utgångskrav: 5+ kort i ny högfärg eller 4+ kort i ny lågfärg.
- Om flera nya färger samtidigt uppfyller längdkraven lämnas prioriteten ej täckt.
- Inviter med 2NT eller 3 i öppnarens visade högfärg är definierade som inviter, men öppnarens exakta accept/pass fortsättning kräver egen kontroll mot dokumentets fortsättningsregler.

**Öppna luckor som redan dokumenterats i givarrapporten:**
- Obalanserad invitstyrka efter 1NT–2♣–2♥ utan användbar fit.
- Öppnarens beslut efter 1NT–2♣–2♥/2♠–2NT: 3NT kontra eventuell fit i den andra högfärgen. Nuvarande kod returnerar uttryckligen ej täckt.
- Samma fortsättningsfråga förekommer i flera provgivare och ska inte lösas genom att anta att öppnarens egen fyrkortsfärg automatiskt ska återbjudas.

**Teknisk risk:** `stay2` läser öppnarens faktiska hand för att räkna fit och gemensamma spelpoäng. Det får endast användas i efterhandsrättning/test, inte i svarshandens livebeslut.

## 4. Överföringar

Runtime-funktioner: `transfer2(h,M)`, `ntOpenerInvit` och separata öppnargrenar i `ntOpener`/`ntOpener3`.

Källverifierade budbetydelser enligt Nordisk standard s. 5:
- Pass: dåliga kort men minst fem kort i överföringsfärgen.
- 2NT: invit med jämn hand och exakt fem kort i överföringsfärgen.
- 3M: invit med minst sex kort i överföringsfärgen.
- 3NT: välj utgång med jämn hand och exakt fem kort.
- 4M: slutbud.
- Efter spaderöverföring: 3♥ är invit med minst 5-5 i båda högfärgerna; eftersom styrkegränsen saknas klassificerar motorn inte automatiskt valet av denna invit.
- Efter hjärteröverföring: 2♠ rondkrav med 5+♥ och 4+♠.
- Efter båda överföringarna: 3 lå är utgångskrav med 5+ överföringsfärg och 4+ i bjuden lågfärg; 4 lå är kontrollbud och slamintresse; 4NT är RKC med överföringsfärgen som trumf.

**Viktig korrigering:** PDF sida 5 anger inga numeriska HP-intervall för svag/invit/utgång. Tidigare intervall 0–7, 8–9 och 10–15 hp har tagits bort ur motorn. Den väljer inte mellan pass, invit och slutbud utan en verifierad styrkegräns. Entydiga kravbud (2♠ efter hjärteröverföring och 3 lå efter båda överföringarna) kan fortfarande väljas på sina uttryckliga formvillkor. 3♥ efter spaderöverföring är en invit och lämnas ej täckt utan styrkegräns. Om flera specialvillkor överlappar lämnas prioriteten ej täckt.

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

Original-PDF sida 5 anger inga numeriska HP-intervall efter fullföljd överföring. De tidigare inlagda 0–7, 8–9 och 10–15 hp-gränserna har tagits bort. T03/T07/T08 och invit-/acceptträdena hålls preliminära för styrkevalet; kvalitativa budbetydelser och särskilda formvillkor behålls.

Stayman sida 4 har också implementerats tydligare: efter 2♦, 2♥ eller 2♠ är en ny färg naturlig och utgångskrav med 5+ högfärg eller 4+ lågfärg. Efter 2♥ visar 2NT exakt fyra spader. Om flera nya färger samtidigt uppfyller längdkraven lämnas prioriteten ej täckt.

Nya regressionstester:
- `tests/nt-transfer-source-boundaries.test.js`: avsaknad av numeriska HP-gränser samt specialbudens formvillkor och överlapp.
- `tests/nt-stayman-continuations.test.js`: naturliga utgångskravsbud efter samtliga Stayman-svar samt 2NT med exakt fyra spader efter 2♥.


## 11. Live 1NT – första säkra implementation

`decideLive` accepterar nu ostörda auktioner i 1NT-familjen och använder `nodeForRaw` i stället för den efterhandsbaserade `nodeFor`. Det förhindrar att den generella kontrollen av missad utgång/slam läser partnerns dolda hand i ett livebeslut.

Källstyrda och handbaserade grenar som nu kan avgöras med enbart egen hand och offentlig auktion:
- Eget svar på partnerns 1NT: Stayman med egen 4-korts högfärg, överföring med 5+ högfärg, samt entydiga specialfortsättningar efter överföring; svag/invit/utgång lämnas ej täckt när styrkegränsen saknas.
- Öppnarens Staymansvar och fullföljning/superaccept av överföring.
- Stayman 2NT efter 2♥ med exakt fyra spader; öppnarens 3♠/4♠-val med egen 4-4 och 15–16/17 hp.
- Naturlig ny färg efter Stayman som utgångskrav.
- Överföringsfortsättning med egen hand.

Gränser som uttryckligen lämnas ej täckta live:
- Öppnarens accept/pass efter 2NT- eller 3M-invit när det skulle kräva partnerns exakta honnörspoäng.
- Stayman-invit/utgång där den exakta gemensamma styrkan eller fitten inte kan avgöras från offentliga bud.
- Alla sekvenser med motståndaringripande och andra budfamiljer.

Nytt test: `tests/live-1nt-information-boundary.test.js` kontrollerar att dolda händer inte påverkar livebeslut och att inviter som kräver dold information lämnas ej täckta.


## 12. Svagt lågfärgsrelä – numerisk gräns ej fastställd

1NT–2♠ visar enligt Nordisk standard s. 4 en svag hand med minst sex kort i en lågfärg eller 5-5 i lågfärgerna. Öppnaren bjuder 3♣ med längre klöver, annars 2NT (längre ruter eller lika längd). Efter 2NT bjuder svarshanden 3♣ eller 3♦ som signoff; efter 3♣ passar svarshanden eller bjuder 3♦ som signoff.

Källan anger inte ett exakt numeriskt HP-intervall för "svag/dåliga kort". Motorn rekommenderar därför inte automatiskt 2♠ utifrån en egen gräns. Den känner igen längdprofilen men lämnar styrkeklassificeringen ej täckt. Trädet T42 är källbaserat kvalitativt och beskriver reläets betydelse/fortsättning; det används inte för numerisk styrkeklassificering.


### Täckningskontroll efter källkonservativ rättning

Den fasta 36-givarskorpusen innehåller nu 169 N/S-beslut. Fem beslut lämnas ej täckta: ett efter Stayman 2♦ där öppnarens fortsättning saknas, samt fyra val av naturlig 2NT-invit där Nordisk standard inte anger ett numeriskt styrkeintervall. Täckningen är 164/169 (97,0 %). Det är en medveten minskning från den tidigare högre täckningen som delvis byggde på obelagda invitgränser.

I den separata 100-givarskontrollen ligger täckningen kvar över 98 %. Kvarvarande luckor är dokumenterade och omfattar:
- numeriska invitgränser som saknas i källan;
- överföringshänder där den kvalitativa styrkekategorin svag/invit/utgång inte kan fastställas;
- öppnarens fortsättning efter svarshandens utgångskravande 3♣/3♦ efter överföring;
- öppnarens accept/pass efter invit när källan inte definierar kriterierna.

Alla dessa lägen lämnas ej täckta hellre än att motorn konstruerar ett systembud. Inga undantag, ogiltiga auktioner eller runtimefel får förekomma i simuleringarna.


### 2NT–4NT kvantitativ invit

2NT–4NT klassificeras som kvantitativ invit till 6NT, separat från 1NT:s fyr-essfrågor och från RKC. Öppnarens accept/pass lämnas ej täckt tills den exakta styrkegränsen för accept har verifierats.

Öppnarens eventuella korrigering efter svarshandens 3NT är nu också en uttrycklig källucka: vid 3+ stöd i överföringsfärgen lämnas beslutet ej täckt, eftersom sida 5 inte anger om 4M ska väljas framför 3NT. Utan 3+ stöd passar öppnaren. Ett sådant läge finns i 100-givarskontrollen (ostord-100-080).


## 13. Korrigering efter kontroll av original-PDF sida 5

PDF-tabellen innehåller inte 0–7, 8–9 eller 10–15 hp. De intervallen var felaktigt införda i tidigare implementation och dokumentation och är nu borttagna. `transfer2` lämnar pass/invit/slutbud ej täckt när valet kräver en numerisk styrkegräns som källan inte ger. Specialbud med uttryckliga formvillkor är fortsatt implementerade. T03/T07/T08 har markerats `source_qualitative`: de visas som källbaserade kvalitativa förklaringar men gör inte numerisk styrkeklassificering.


### Direkt 3NT och sanggräns

Den bekräftade spelregeln är 25 gemensamma honnörspoäng för sangutgång. I 3NT räknas endast hp, inga fördelningspoäng. Detta är skilt från 26 OTP för högfärgsutgång och 28 OTP för lågfärgsutgång. Vid partnerns 1NT (15–17 hp) kan svarshanden därför bjuda 3NT live med minst 10 egna hp, om ingen högfärg ska undersökas med Stayman eller överföring. Vid 9 hp kan paret ligga under eller på 25 beroende på öppnarens hand; den naturliga 2NT-inviten saknar numeriskt svarshandsintervall i Nordisk standard och lämnas därför ej täckt.
