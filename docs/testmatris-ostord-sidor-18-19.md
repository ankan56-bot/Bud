# Testmatris – ostörd budgivning, Nordisk Standard s. 18–19

Källa: användarens uppladdade `bilaga 1.pdf`, tryckta sidor 18–19. Matrisen återger budraderna direkt från fotografiet.

## Sida 18 – ÖH:s tredje bud

### SH återbjuder 1NT
- 2♣: 5–4 eller 4441, 11–15 hp
- 2♦: 6-kortsfärg, 11–14 hp
- 2♥: 4-korts hjärter, 15–17 hp
- 2♠: 3-korts spader, 15–17 hp
- 2NT: invit, (15) 16–17 hp
- 3♣: 6-kortsfärg, 15–17 hp
- 3♠: 6–5-fördelning, 14–17 hp

### SH prefererar
- Pass: 11–15 hp
- 2♠: 3-korts spader, 15–17 hp
- 2NT: invit, (15) 16–17 hp
- 3♣: 5–5-fördelning, 15–17 hp
- 3♥: 6–4-fördelning, 15–17 hp
- 4♥: minst 6–4-fördelning, stark hand

### SH bjuder om sin färg
- Pass: 11–15 hp
- 2♠: 6–5-fördelning, minimum
- 2NT: invit, (15) 16–17 hp
- 3♦: 6-kortsfärg, 15–17 hp
- 3♥: invit
- 3♠: 6–5-fördelning, 14–17 hp
- 4♣: Splinter, 16–17 hp (konflikt med projektbeslutet att ta bort Splinter; får inte återinföras automatiskt)
- 4♥: slutbud

### SH inviterar med 2NT
- 3♣: svagt, fjärde färg, utgångskrav
- 3♦: 5–5-fördelning, minimum
- 3♥: 6–4-fördelning, minimum
- 3♠: 3-korts spader, maximum (annars 2♠ direkt)
- 3NT: slutbud

## Sida 19 – SH bjuder tredje eller fjärde färg

### SH bjuder tredje färg
- Pass: inte tillåtet
- 2♥: 2-korts hjärter, minimum
- 2♠: fjärde färg, utgångskrav
- 2NT: spaderhåll, minimum
- 3♣: 6-kortsfärg, minimum
- 3♦: 4-kortsstöd
- 3♥: 3-korts hjärter
- 3NT: spaderhåll, maximum

### Fortsättning efter tredje färg
- 2♠: fjärde färg, utgångskrav
- 2NT: invit, 11–12 hp
- 3♣: invit, 11–12 hp
- 3♦: 5–5-fördelning, 11–12 hp
- 3♥: 6-korts hjärter, 11–12 hp

### SH bjuder fjärde färg
- Pass: inte tillåtet
- 2♥: inget bättre bud
- 2♠: 2-korts spader
- 2NT: ruterhåll
- 3♣: 5–5-fördelning
- 3♦: 4-kortsfärg
- 3♥: 6–4-fördelning, maximum (annars 2♠ direkt)
- 3♠: 3-korts spader, maximum (annars 2♠ direkt)
- 3NT: inte tillåtet

### Fortsättning efter fjärde färg
- 2NT: ruterhåll, 13+ hp
- 3♣: minst 4-stöd, 13+ stp
- 3♥: 3-stöd, 16+ stp
- 3♠: minst 6-korts, 16+ stp
- 3NT: ruterhåll, slutbud
- 4♠: minst 6-korts, maximum 15 stp

## Testkrav och status

1. Testa varje tabellgren separat med korrekta exempelbudgivningar.
2. Tredje respektive fjärde färg identifieras av antalet olika färger paret redan visat, inte av hp.
3. Tabellens inledning säger att ny färg är krav, men tabellen ger ingen generell hp-gräns för själva tredje-/fjärde-färgsbudet. Motorn får därför inte använda påhittade generella gränser på 10 respektive 13 hp.
4. Testa uttryckliga förbud: pass efter tredje färg, pass efter fjärde färg och 3NT efter fjärde färg.
5. Testa hp och stp separat; de får inte blandas.
6. 4♣ Splinter är en uttrycklig konflikt mellan lathunden och projektets tidigare beslut att ta bort Splinter. Logga för expertbeslut.
7. Otydliga eller ej specificerade handvärderingar ska hamna i ej-täckt-loggen.

## Faktisk kodstatus i rättningsmotorn

- Sida 18: tredje bud efter 1NT-återbud har implementerade kontroller för samtliga sju budrader i det avbildade exemplet.
- Sida 18: preferensgrenen har implementerade kontroller för pass, 2♠, 2NT, 3♣ och 3♥. 4♥ lämnas ej täckt eftersom ”stark hand” saknar numerisk gräns.
- Sida 18: ombud-grenen har kontroller för pass, 2NT, 3♦, 3♥, 3♠ och 4♥. 2♠/6–5 minimum lämnas ej täckt eftersom minimum inte är numeriskt definierat. 4♣ Splinter lämnas ej täckt på grund av projektkonflikten.
- Sida 18: 2NT-invitgrenen känner igen 3♣ som fjärde färg/utgångskrav och 3NT som slutbud. 3♦, 3♥ och 3♠ lämnas ej täckta eftersom minimum/maximum inte är numeriskt definierat.
- Sida 19: svarshandens tredje och fjärde färg identifieras efter antalet olika färger paret redan visat. Nya färgbud godtas som kravbud; inga generella hp-gränser har hittats på.
- Sida 19: öppnarens tabell efter tredje färg har direkta kontroller för 2♥ med två hjärter, 2♠ som fjärde färg/utgångskrav, 3♣ med sex klöver, 3♦ med fyrkortsstöd och 3♥ med trekortsstöd. Sangvalen lämnas ej täckta eftersom minimum/maximum saknar numeriska gränser.
- Sida 19: öppnarens tabell efter fjärde färg har direkta kontroller för 2♠ med två spader, 2NT med ruterhåll, 3♣ med 5–5 och 3♦ med fyrkortsfärg. 2♥ (”inget bättre bud”) samt 3♥/3♠ (maximum) lämnas ej täckta. Pass och 3NT anges som uttryckligt otillåtna och loggas som ej täckta med förklaring.
- Fortsättning efter tredje färg: 2♠ fjärde färg/utgångskrav, 2NT och 3♣ invit 11–12 hp, 3♦ 5–5 med 11–12 hp och 3♥ sexkortshjärter med 11–12 hp har nu kodstöd för den avbildade exempelvägen.
- Fortsättning efter fjärde färg: 2NT med ruterhåll och 13+ hp samt 3NT med ruterhåll som slutbud har kodstöd. Bud som kräver stp-gränser lämnas ej täckta eftersom stp-beräkningen inte är verifierad mot denna tabell.

## Teststatus

Regressionstester finns i `tests/ostord-sidor-18-19.test.js` för 1NT-återbud, preferens, tredje/fjärde färg och vissa fortsättningsbud. Ett körbart GitHub Actions-arbetsflöde finns i `.github/workflows/ostord-pages-18-19.yml`.

**Viktigt:** Jag har inte fått någon körningsrapport från GitHub Actions för den här grenen. Testerna är därför tillagda men inte verifierade som gröna. Modulen ska inte markeras helt färdig förrän fortsättningstabellerna har implementerats och hela testsviten har körts.


## Implementationskontroll 2026-11-17

Följande kodstöd har nu lagts till i `rattningsmotor.js` på arbetsgrenen:

- Sida 18, SH bjuder om sin färg: 2♠ med 6–5 och 11–15 hp.
- Sida 18, SH prefererar: 4♥ med minst 6–4 och 18+ hp.
- Sida 18, efter SH:s 2NT-invit: 3♦ med 5–5 och 11–14 hp; 3♥ med 6–4 och 11–14 hp; 3♠ med trekortsstöd och 15–17 hp; 3NT med 15–17 hp. 3NT-förklaringen är inte reducerad till enbart ”slutbud”.
- Sida 19, efter tredje färg: 2♥, 2NT och 3♣ med minimum 11–14 hp; 3NT med spaderhåll och maximum 15–17 hp.
- Sida 19, fortsättning efter fjärde färg: stp-villkoren är nu kontrollerade separat från hp. 3♣ kräver minst 4-kortsstöd och 13+ stp; 3♥ kräver 3-kortsstöd och 16+ stp; 3♠ kräver minst 6-kortsfärg och 16+ stp; 4♠ kräver minst 6-kortsfärg och högst 15 stp.
- Sida 19, 3NT i fortsättningen efter fjärde färg kräver ruterhåll och högst 17 hp. Ingen ny nedre hp-gräns har lagts till.

### Testresultat

GitHub Actions körde `node --test tests/ostord-sidor-18-19.test.js` på commit `2dbbb1919c1e04a94d6c58b3b6e5437626c94b69`: **9 tester godkända, 0 underkända**. Arbetsflöde: https://github.com/ankan56-bot/Bud/actions/runs/44124685468

### Kvarstående ej täckt / behöver källkontroll

- Sida 18, 2NT-invitgrenen har i befintlig dispatch en hårdkodad exempelauktion `1♥–1♦; 2♥–2NT`. Den auktionen är inte budtekniskt giltig eftersom 1♦ ligger under 1♥. Jag har inte gissat vilken auktion som ska ersätta den; grenen behöver jämföras med originalfotot innan den kan godkännas som körbar.
- Sida 18, 4♣ Splinter kvarstår som uttrycklig konflikt mellan lathunden och tidigare projektbeslut. Den aktiveras inte.
- Sida 19, 2♥ efter fjärde färg (”inget bättre bud”) saknar fortfarande maskinellt verifierbar handdefinition.
- Bud som inte uppfyller en fullständig tabellrad ska fortsätta returneras som ej täckta och sparas för expertgranskning. Testerna visar inte att samtliga sådana sekvenser redan skrivs till en separat beständig logg; den persistenta loggningen behöver verifieras separat.
