# Granskning av 26 konkurrenspositioner

## Slutsats

De 26 positionerna är verkliga täckningsluckor i den nuvarande dispatchlogiken. Granskningen visar en tydlig teknisk orsak: `nodeForRaw()` delar upp motståndarnas bud i `oppBefore` och `oppAfter`. När motståndarna har klivit in efter vår första budgivning går kontrollen till en begränsad gren som bara hanterar ett fåtal fall med `d === 1`. Övriga fortsättningar returneras som ej täckta innan den normala budsekvenslogiken nås.

Det betyder inte att alla pass är fel. I flera positioner saknas en uttrycklig systemregel för hur paret ska fortsätta efter konkurrensbud. I andra finns närliggande dokumenterade exempel, men de räcker inte ensamma för att fastställa en generell regel.

**Ingen grundsystemregel eller kodlogik har ändrats i denna granskning.** Det finns inte tillräckligt underlag för att implementera ett generellt konkurrensbudsträd utan att riskera att hitta på systemregler.

## Vad som har verifierats

1. Alla 26 poster är pass-positioner i den genererade referensauktionen. De skapades som pass när motorn inte gav ett säkert förslag; de är inte oberoende facit.
2. Handdata har granskats på HCP och fördelningsform. Det finns stor variation: från 2 till 19 hp och från balanserade till mycket obalanserade händer. Därför kan de inte lösas med en enda generell passregel.
3. `oppAfter`-grenen i `nodeForRaw()` stöder för närvarande endast ett litet antal specifika situationer, huvudsakligen när vår sida bara har gjort ett bud. När vi har hunnit svara eller återbjuda och motståndarna därefter agerar, returneras generisk ej täckt.
4. `respDouble()` är en annan situation: den gäller när vår partner har dubblat motståndarnas öppning och vi svarar. Den kan inte återanvändas för att bedöma svar efter att motståndarna har dubblat vår öppning.
5. Loggens Giv 13 dokumenterar ett konkret exempel: 1♠ – X – 2♠, där 2♠ visar stöd och begränsad styrka. Det är användbart som ett riktat regressionsexempel, men det fastställer inte ensamt alla styrkegränser och fortsättningar efter dubbling.

## Klassificering av positionerna

### A. Motståndarna har bjudit flera gånger före aktuell passposition (4)

- `alla-05-bid-5`: Norr efter 1♣–1♠.
- `alla-05-bid-7`: Syd efter 1♣–1♠–2♣.
- `alla-05-bid-9`: Norr efter ytterligare 5♣.
- `alla-05-bid-11`: Syd efter att auktionen nått 5♣ och båda motståndarna passat.

Detta är samma giv med fyra olika passpositioner. Händerna är svaga (5 hp i både Norr och Syd), men motståndarnas bud visar olika mycket fördelning och styrka. Ett pass kan vara rimligt, men det kan inte generaliseras utan regler för konkurrens, spärr och försvar mot höga kontrakt.

### B. Ett motståndarbud efter vår första budgivning (13)

- `stenberg-03-bid-3`: Syd efter Norrs 1♠ och Östs 3♦.
- `slam-02-bid-3`: Norr efter Syds 1♥ och Västs 2♠.
- `trumf-02-bid-3`: Norr efter Syds 1♥ och Västs 1♠.
- `trumf-05-bid-3`: Syd efter Norrs 1♣ och Östs 1♥.
- `trumf-05-bid-7`: Syd efter senare 2♣ från Väst.
- `tvafarg-02-bid-3`: Norr efter Syds 1♠ och Västs 3♣.
- `tvafarg-04-bid-3`: Syd efter Norrs 1♦ och Östs 2♠.
- `tvafarg-05-bid-3`: Norr efter Syds 1♣ och Västs 1♠.
- `dubbling-02-bid-3`: Norr efter Syds 1♦ och Västs dubbling.
- `dubbling-04-bid-3`: Syd efter Norrs 1♦ och Östs dubbling.
- `dubbling-09-bid-3`: Norr efter Syds 1♥ och Västs dubbling.
- `inkliv-02-bid-6`: Norr efter 1♣–1♥–pass–3♥ och tidigare pass.
- `inkliv-09-bid-6`: Syd efter 1♦–X–pass–1♠.

Detta är inte en enhetlig kategori. Den innehåller både enkla inkliv, hoppande inkliv, dubblingar och senare konkurrensbud. De tre svaren direkt efter motståndarnas dubbling av vår öppning är särskilt separata från svar på partnerns upplysningsdubbling.

### C. Dubblingssekvenser efter motståndarnas dubbling (9)

**C1. Dubblerarens återbud efter partners svar (7)**

- `dubbling-01-bid-6`: Norr efter 1♦–X–pass–1♠.
- `dubbling-03-bid-6`: Norr efter 1♦–X–pass–1♥.
- `dubbling-05-bid-6`: Syd efter 1♥–X–pass–2♦.
- `dubbling-06-bid-6`: Syd efter 1♣–X–pass–1♦.
- `dubbling-07-bid-6`: Syd efter 1♥–X–pass–2♦.
- `dubbling-08-bid-6`: Norr efter 1♣–X–pass–1♥.
- `dubbling-10-bid-6`: Syd efter 1♥–X–pass–2♣.

Här är det den ursprungliga dubbleraren som ska agera igen. `respDouble()` är inte rätt funktion för detta steg: den analyserar svarshanden efter partnerns dubbling av motståndarnas öppning, inte dubblerarens återbud efter partnerns svar. Något komplett återbudssystem efter upplysningsdubbling har inte kunnat beläggas i de granskade regeltexterna.

**C2. Ytterligare motståndarinblandning efter dubblingen (2)**

- `dubbling-04-bid-7`: Syd efter 1♦–X–pass–2NT–pass–pass.
- `dubbling-09-bid-7`: Norr efter 1♥–X–pass–3♠–pass–pass.

Dessa är senare konkurrensbeslut efter att motståndarna först dubblat vår öppning och därefter bjudit igen. De ska inte blandas ihop med ett ostört återbud från dubbleraren.

## Samtliga 26 poster – handdata och auktion

HCP och fördelning nedan avser den spelare vars pass inte täcks. Fördelningen anges i ordningen ♠–♥–♦–♣.

| ID | Plats | HCP | Fördelning | Auktion fram till pass | Orsak |
|---|---:|---:|---:|---|---|
| `alla-05-bid-5` | N | 5 | 5-4-2-2 | N:P E:1C S:P W:1S N:P | Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. |
| `alla-05-bid-7` | S | 5 | 2-2-6-3 | N:P E:1C S:P W:1S N:P E:2C S:P | Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. |
| `alla-05-bid-9` | N | 5 | 5-4-2-2 | N:P E:1C S:P W:1S N:P E:2C S:P W:5C N:P | Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. |
| `alla-05-bid-11` | S | 5 | 2-2-6-3 | N:P E:1C S:P W:1S N:P E:2C S:P W:5C N:P E:P S:P | Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. |
| `stenberg-03-bid-3` | S | 12 | 4-2-2-5 | N:1S E:3D S:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `slam-02-bid-3` | N | 10 | 4-4-2-3 | S:1H W:2S N:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `trumf-02-bid-3` | N | 6 | 3-5-1-4 | S:1H W:1S N:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `trumf-05-bid-3` | S | 4 | 3-0-5-5 | N:1C E:1H S:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `trumf-05-bid-7` | S | 4 | 3-0-5-5 | N:1C E:1H S:P W:2C N:P E:P S:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `tvafarg-02-bid-3` | N | 6 | 2-4-2-5 | S:1S W:3C N:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `tvafarg-04-bid-3` | S | 11 | 1-4-2-6 | N:1D E:2S S:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `tvafarg-05-bid-3` | N | 10 | 5-3-4-1 | S:1C W:1S N:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-01-bid-6` | N | 19 | 4-4-1-4 | W:1D N:X E:P S:1S W:P N:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-02-bid-3` | N | 11 | 5-4-0-4 | S:1D W:X N:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-03-bid-6` | N | 12 | 7-3-0-3 | W:1D N:X E:P S:1H W:P N:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-04-bid-3` | S | 4 | 4-4-3-2 | N:1D E:X S:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-04-bid-7` | S | 4 | 4-4-3-2 | N:1D E:X S:P W:2N N:P E:P S:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-05-bid-6` | S | 15 | 4-1-4-4 | E:1H S:X W:P N:2D E:P S:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-06-bid-6` | S | 14 | 4-4-3-2 | E:1C S:X W:P N:1D E:P S:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-07-bid-6` | S | 13 | 3-2-4-4 | E:1H S:X W:P N:2D E:P S:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-08-bid-6` | N | 12 | 3-4-4-2 | W:1C N:X E:P S:1H W:P N:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-09-bid-3` | N | 2 | 1-2-8-2 | S:1H W:X N:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-09-bid-7` | N | 2 | 1-2-8-2 | S:1H W:X N:P E:3S S:P W:P N:P | Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. |
| `dubbling-10-bid-6` | S | 13 | 4-2-3-4 | E:1H S:X W:P N:2C E:P S:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| `inkliv-02-bid-6` | N | 11 | 1-6-5-1 | W:1C N:1H E:P S:3H W:P N:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |
| `inkliv-09-bid-6` | S | 14 | 4-3-2-4 | E:1D S:X W:P N:1S E:P S:P | Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. |

## Koddiagnos

- `oppBefore` avser motståndarnas bud före vår första budgivning.
- `oppAfter` avser motståndarnas bud efter vår första budgivning.
- Om `oppBefore.length` är positivt hanteras endast vissa första svar efter ett enstaka motståndarbud; övriga lägen blir ej täckta.
- Om `oppAfter.length` är positivt hanteras särskilda fall som 1NT-inkliv, stöddubbling och negativ dubbling. Därefter returneras ej täckt i stället för att låta en normal budsekvens fortsätta.
- Denna tidiga retur förklarar täckningsluckorna tekniskt, men den talar inte om vilket bud som är rätt.

## Rekommenderad fortsatt ordning

1. **Svara efter motståndarnas dubbling av vår öppning:** dokumentera exakt vad som gäller för redubbling, naturliga svar och stöd. Använd Giv 13 som första riktade test när fullständig hand finns.
2. **Återbud efter egen upplysningsdubbling:** sök uttryckliga systemexempel för dubblerarens återbud efter 1-färgssvar, 1NT-svar och hoppande svar. Skilj pass, överbud, sang och egen färg.
3. **Enkla och hoppande inkliv:** jämför varje hand mot dokumenterade gränser för 1- respektive 2-/3-nivå. Håll öppningssidans pass/återbud åtskilt från inklivarens partners svar.
4. **Flera motståndarbud:** bygg inte generell logik förrän konkurrensprinciper för ombud, stöd, spärr och pass är fastställda.

Först när en regelkälla och handvillkor är tydliga ska en avgränsad kodgren och regressionstest läggas till. Övriga positioner ska fortsätta visas som ej täckta.

## Avgränsning

- DDS har inte använts för att avgöra buden.
- Ingen strategisk bedömning har presenterats som systemfacit.
- Ingen grundsystemregel eller kompletterande regel har ändrats.
- `main` är orörd; rapporten hör till `work/theme-dataset-analysis`.
