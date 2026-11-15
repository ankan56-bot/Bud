# Analys av 44 ej täckta budpositioner

## Tolkning

Alla 44 poster är **Pass** i den deterministiska referensauktionen. Referensgeneratorn använder Pass när rättningsmotorn inte lämnar ett säkert budförslag. Därför är dessa poster täckningsluckor, inte bevis för att Pass är korrekt eller felaktigt.

## Orsaksfördelning

| Orsak från rättningsmotorn | Antal |
|---|---:|
| Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. | 12 |
| Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. | 9 |
| Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. | 4 |
| Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. | 9 |
| Dokumentet anger inte budet för denna hand. | 9 |
| Öppnarens tredje bud efter 1 i färg, svar och öppnarens återbud beskrivs inte i dokumentet. | 1 |
| Osäkert fall | 0 |

Summa: 44.

## Första prioritering

1. **Konkurrensbudgivning och dubbling (21 positioner).** Tolv positioner gäller svar/fortsättning efter motståndarnas inkliv eller dubbling och nio gäller återbud från dubbleraren efter partners svar. De fyra fallen med flera motståndarbud är en separat försvarsgrupp och ska inte räknas som vanliga inkliv.
2. **Öppnarens återbud efter partnerns pass (9 positioner).** Giltiga auktioner, men ingen generell återbudsregel kan utläsas ur varierande handtyper.
3. **Handspecifika svar efter partnerns inkliv (9 positioner).** Dessa är svarshänder, inte egna inkliv. Den dokumenterade sexkortskravsregeln för 2-nivåinkliv gäller inte deras svar.
4. **Öppnarens tredje bud efter svarshandens andra bud (1 position).** Diagnosen är nu korrekt, men budregeln saknas.
5. **Osäkert fall (0).** Den tidigare osäkra splinterpositionen har nu lösts genom att splintergrenarna tagits bort och 3♠-invit används i stället för 3♥-splinter.

## De 16 positionerna med dubbling i sekvensen

### Svar efter att motståndaren dubblat vår öppning (3)
- `dubbling-02-bid-3`: S:1D W:X N:P E:P S:P
- `dubbling-04-bid-3`: N:1D E:X S:P W:2N N:P E:P S:P
- `dubbling-09-bid-3`: S:1H W:X N:P E:3S S:P W:P N:P

### Dubblerarens återbud efter partners svar (8)
- `dubbling-01-bid-6`: W:1D N:X E:P S:1S W:P N:P E:P
- `dubbling-03-bid-6`: W:1D N:X E:P S:1H W:P N:P E:P
- `dubbling-05-bid-6`: E:1H S:X W:P N:2D E:P S:P W:P
- `dubbling-06-bid-6`: E:1C S:X W:P N:1D E:P S:P W:P
- `dubbling-07-bid-6`: E:1H S:X W:P N:2D E:P S:P W:P
- `dubbling-08-bid-6`: W:1C N:X E:P S:1H W:P N:P E:P
- `dubbling-10-bid-6`: E:1H S:X W:P N:2C E:P S:P W:P
- `inkliv-09-bid-6`: E:1D S:X W:P N:1S E:P S:P W:P

### Fortsättning efter ytterligare motståndarinblandning (2)
- `dubbling-04-bid-7`: N:1D E:X S:P W:2N N:P E:P S:P
- `dubbling-09-bid-7`: S:1H W:X N:P E:3S S:P W:P N:P

### Övriga passpositioner i dubblingssekvenser (3)
- `dubbling-02-bid-5`: S:1D W:X N:P E:P S:P
- `dubbling-04-bid-5`: N:1D E:X S:P W:2N N:P E:P S:P
- `dubbling-09-bid-5`: S:1H W:X N:P E:3S S:P W:P N:P

Dessa är fyra olika situationer. De ska inte generaliseras till en enda dubblingsregel. `respDouble()` för svar på partnerns upplysningsdubbling täcker inte automatiskt svar när motståndarna dubblar vår öppning eller dubblerarens återbud efter partners svar.

## Alla 44 exakta positioner

HCP och fördelning avser handen hos spelaren vars Pass inte täcks. Fördelningen visas ♠/♥/♦/♣.

| Case | Spelare | HCP | Fördelning | Auktion | Diagnos |
|---|---|---:|---|---|---|
| alla-01-bid-9 | S | 13 | ♠1 ♥4 ♦3 ♣5 | 1C P 1S P 2C P 2N P P P | Öppnarens tredje bud efter 1 i färg, svar och öppnarens återbud beskrivs inte i dokumentet. |
| alla-02-bid-5 | S | 6 | ♠5 ♥1 ♦1 ♣6 | P 2H 2N P P P | Dokumentet anger inte budet för denna hand. |
| alla-05-bid-5 | N | 5 | ♠5 ♥4 ♦2 ♣2 | P 1C P 1S P 2C P 5C P P P | Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. |
| alla-05-bid-7 | S | 5 | ♠2 ♥2 ♦6 ♣3 | P 1C P 1S P 2C P 5C P P P | Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. |
| alla-05-bid-9 | N | 5 | ♠5 ♥4 ♦2 ♣2 | P 1C P 1S P 2C P 5C P P P | Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. |
| alla-05-bid-11 | S | 5 | ♠2 ♥2 ♦6 ♣3 | P 1C P 1S P 2C P 5C P P P | Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. |
| stenberg-03-bid-3 | S | 12 | ♠4 ♥2 ♦2 ♣5 | 1S 3D P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| stenberg-03-bid-5 | N | 13 | ♠4 ♥3 ♦4 ♣2 | 1S 3D P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| slam-02-bid-3 | N | 10 | ♠4 ♥4 ♦2 ♣3 | 1H 2S P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| slam-02-bid-5 | S | 19 | ♠0 ♥5 ♦5 ♣3 | 1H 2S P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| trumf-02-bid-3 | N | 6 | ♠3 ♥5 ♦1 ♣4 | 1H 1S P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| trumf-02-bid-5 | S | 12 | ♠3 ♥5 ♦0 ♣5 | 1H 1S P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| trumf-05-bid-3 | S | 4 | ♠3 ♥0 ♦5 ♣5 | 1C 1H P 2C P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| trumf-05-bid-5 | N | 14 | ♠4 ♥3 ♦1 ♣5 | 1C 1H P 2C P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| trumf-05-bid-7 | S | 4 | ♠3 ♥0 ♦5 ♣5 | 1C 1H P 2C P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| tvafarg-02-bid-3 | N | 6 | ♠2 ♥4 ♦2 ♣5 | 1S 3C P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| tvafarg-02-bid-5 | S | 13 | ♠5 ♥3 ♦4 ♣1 | 1S 3C P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| tvafarg-05-bid-3 | N | 10 | ♠5 ♥3 ♦4 ♣1 | 1C 1S P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| tvafarg-05-bid-5 | S | 13 | ♠1 ♥4 ♦0 ♣8 | 1C 1S P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| dubbling-01-bid-6 | N | 19 | ♠4 ♥4 ♦1 ♣4 | 1D Dbl P 1S P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-02-bid-3 | N | 11 | ♠5 ♥4 ♦0 ♣4 | 1D Dbl P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-02-bid-5 | S | 12 | ♠3 ♥3 ♦4 ♣3 | 1D Dbl P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| dubbling-03-bid-6 | N | 12 | ♠7 ♥3 ♦0 ♣3 | 1D Dbl P 1H P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-04-bid-3 | S | 4 | ♠4 ♥4 ♦3 ♣2 | 1D Dbl P 2N P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-04-bid-5 | N | 13 | ♠2 ♥3 ♦5 ♣3 | 1D Dbl P 2N P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| dubbling-04-bid-7 | S | 4 | ♠4 ♥4 ♦3 ♣2 | 1D Dbl P 2N P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-05-bid-6 | S | 15 | ♠4 ♥1 ♦4 ♣4 | 1H Dbl P 2D P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-06-bid-6 | S | 14 | ♠4 ♥4 ♦3 ♣2 | 1C Dbl P 1D P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-07-bid-6 | S | 13 | ♠3 ♥2 ♦4 ♣4 | 1H Dbl P 2D P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-08-bid-6 | N | 12 | ♠3 ♥4 ♦4 ♣2 | 1C Dbl P 1H P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-09-bid-3 | N | 2 | ♠1 ♥2 ♦8 ♣2 | 1H Dbl P 3S P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-09-bid-5 | S | 14 | ♠2 ♥6 ♦0 ♣5 | 1H Dbl P 3S P P P | Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. |
| dubbling-09-bid-7 | N | 2 | ♠1 ♥2 ♦8 ♣2 | 1H Dbl P 3S P P P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| dubbling-10-bid-6 | S | 13 | ♠4 ♥2 ♦3 ♣4 | 1H Dbl P 2C P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| inkliv-01-bid-4 | N | 4 | ♠4 ♥1 ♦4 ♣4 | 1C 1H P P P | Dokumentet anger inte budet för denna hand. |
| inkliv-02-bid-6 | N | 11 | ♠1 ♥6 ♦5 ♣1 | 1C 1H P 3H P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| inkliv-03-bid-4 | N | 4 | ♠4 ♥5 ♦1 ♣3 | 1S 2C P P P | Dokumentet anger inte budet för denna hand. |
| inkliv-04-bid-4 | S | 6 | ♠5 ♥3 ♦3 ♣2 | 1S 3D P P P | Dokumentet anger inte budet för denna hand. |
| inkliv-05-bid-4 | S | 8 | ♠1 ♥5 ♦4 ♣3 | 1C 1H P P P | Dokumentet anger inte budet för denna hand. |
| inkliv-06-bid-4 | S | 9 | ♠6 ♥1 ♦1 ♣5 | 1S 3H P P P | Dokumentet anger inte budet för denna hand. |
| inkliv-07-bid-4 | S | 6 | ♠3 ♥5 ♦3 ♣2 | 1C 2S P P P | Dokumentet anger inte budet för denna hand. |
| inkliv-08-bid-4 | N | 9 | ♠3 ♥3 ♦3 ♣4 | 1D 3C P P P | Dokumentet anger inte budet för denna hand. |
| inkliv-09-bid-6 | S | 14 | ♠4 ♥3 ♦2 ♣4 | 1D Dbl P 1S P P P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| inkliv-10-bid-4 | N | 7 | ♠5 ♥2 ♦1 ♣5 | 1C 1H P P P | Dokumentet anger inte budet för denna hand. |

## Vad som inte har ändrats

- Ingen grundsystemregel har lagts till eller ändrats.
- Ingen kompletterande regel har godkänts.
- Ingen av de kvarvarande passen har omklassificerats till fel.
- DDS har inte använts för att avgöra buden.
- Den gamla splinterpositionen `trumf-04-bid-7` finns inte längre bland de ej täckta fallen efter rättningen.

## Underlag

- `testdata/uncovered_cases_47.json` (legacy-filnamn): aktuell lista med 44 positioner.
- `testdata/theme_deals_140.json`: fullständiga givare och referensauktioner.
- `LOGG_BUDREGLER.md`: tidigare dokumenterade testobservationer och uttryckliga systemkrav.
