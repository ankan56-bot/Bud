# Granskning: analysnoder, matchning och koppling till rättningsmotorn

**Datum:** 2026-11-16  
**Gren:** `work/undisturbed-architecture`  
**Omfattning:** De 40 ostörda träden i `analysbibliotek.json`, deras handprofiler, grenar och användning i analysmotorn.  
**Status:** Inventering och riskanalys. Ingen produktionslogik eller nodregel ändrad.

## 1. Aktuell inventering

Källan är den aktuella `analysbibliotek.json` på denna arbetsgren. De fem konkurrensträden T29–T33 är exkluderade.

| Mått | Ostörd budgivning |
|---|---:|
| Träd | 40 |
| Noder | 241 |
| Grenposter | 248 |
| Grenar med `next`-mål | 142 |
| Grenar utan `next`-mål | 106 |
| Noder utan utgående grenar | 151 |
| Noder utan `handProfile` | 8 |
| Träd med ogiltig `root`-referens | 1 |

De åtta noder som saknar `handProfile`:
- T01 RKC hjärter: `t01_n1`–`t01_n5`
- T02 kvantitativ 4NT: `t02_n0`, `t02_n1`
- T05 hjärterfit/pass: `t05_n0`

T40 har ett `root`-fält som innehåller en beskrivande mening i stället för ett nod-ID. Trädet innehåller noder, men dess rot kan inte följas maskinellt enligt samma kontrakt som övriga träd.

## 2. Viktig skillnad: nodterminal och odefinierad gren

Tre tillstånd måste representeras separat:

1. **Fortsättning:** en gren har ett giltigt `next`-ID som finns i samma kanoniska nodmängd.
2. **Avsiktligt slutbud:** en gren är uttryckligen markerad som terminal och förklarar varför auktionen ska stanna.
3. **Ej modellerad fortsättning:** en gren saknar `next` och är inte uttryckligen markerad som terminal.

I nuläget finns 106 grenar utan `next`. De kan inte alla antas vara slutbud. På samma sätt har 151 noder inga utgående grenar; även de måste klassificeras innan man kan säga att de är kompletta slutnoder. Det behövs en explicit terminalstatus, exempelvis `terminal: true` med en terminalorsak, eller `coverage: "unmodeled"`.

**Regel:** En gren utan länk får inte automatiskt tolkas som pass/slutbud eller som en färdig fortsättning.

## 3. Analysmotorns faktiska matchningsbeteende

### 3.1 `findMatch()`

Nuvarande funktion:
- normaliserar den aktuella budsekvensen;
- går igenom alla träd som passerar `treeCompatible()`;
- jämför varje nods sekvens som prefix mot den aktuella auktionen;
- accepterar jokertecknet `…`;
- sorterar träffarna efter längsta sekvens och returnerar endast den första.

Den kontrollerar **inte**:
- `tree.conditions`;
- `node.handProfile`;
- öppnar-/svarshandsroll;
- om en gren faktiskt leder till nästa nod;
- om två noder med samma sekvens har olika handvillkor eller betydelser.

Det innebär att biblioteket i praktiken inte används som en fullständig handvillkorsstyrd nodmotor. Om flera noder har samma sekvens kan den första i JSON-ordningen vinna, även om en annan nod bättre passar handen eller den pedagogiska situationen.

### 3.2 `treeCompatible()`

Den filtrerar bort vissa kända textmönster som står i konflikt med fastställda konventioner. Detta är en skyddsspärr, men den bygger på textsökning i serialiserad JSON och är inte en strukturerad kontroll av konventions-ID, regelversion eller datakonsistens.

### 3.3 `findSupplementary()`

Den kompletterande matcharen är mer strukturerad:
- sekvensprefix;
- rätt nästa spelare;
- roll (öppnare/svarshand);
- villkor på den aktuella spelarens hand, inklusive HP, färglängd, balans och stoppare.

Den använder `hands[next]`, alltså den aktuella spelarens hand, inte partnerns dolda hand. Det är rätt informationsprincip för en handvillkorsmatchare. Kandidaterna är dock separata, ej godkända kompletteringar och får inte bli grundsystemfacit utan granskning.

## 4. Biblioteket och rättningsmotorn är två parallella strukturer

`rattningsmotor.js` väljer bud genom hårdkodade dispatchgrenar och hjälpfunktioner. `analysbibliotek.json` innehåller pedagogiska noder. Det finns ingen generell, verifierad koppling där varje nod-ID i biblioteket är en exekverbar regel i rättningsmotorn.

Det innebär:
- En nod kan finnas i biblioteket utan att rättningsmotorn täcker samma handvillkor.
- Rättningsmotorn kan bedöma en sekvens utan att det finns en motsvarande pedagogisk nod.
- En sekvensmatchning i `findMatch()` bevisar inte att handvillkoren för noden är uppfyllda.
- Samma sekvens i flera träd behöver inte vara en dubblett; det kan vara olika handtyper eller fortsättningssyften.

Därför ska vi inte slå ihop noder bara för att sekvenserna är lika. Först måste betydelse, handprofil, roll, konvention och fortsättningsgrenar jämföras.

## 5. Rekommenderad kanonisk nodmodell

Varje nod bör på sikt ha följande uttryckliga fält:

- `id`: stabilt och unikt ID.
- `auctionPrefix`: normaliserad sekvens som identifierar beslutspunkten.
- `actorRole`: öppnare, svarshand eller annan definierad roll.
- `handConditions`: strukturerade villkor för den hand som ska fatta beslutet.
- `publicInferences`: vad partnerns och motståndarnas bud tillåter spelaren att sluta sig till.
- `ruleSource` och `ruleVersion`: källa till systemregeln.
- `systemStatus`: systemregel, valfritt enligt systemet, kompletterande kandidat eller ej täckt.
- `branches`: möjliga bud med villkor och motivering.
- `targetNodeId`: nästa nod, om fortsättningen är modellerad.
- `terminalStatus`: uttrycklig terminal eller ej modellerad fortsättning.
- `pedagogy`: förklaring, typiska fel och varför alternativa bud inte valts.

En nod ska bara matcha om både sekvens, roll och relevanta handvillkor stämmer. Vid flera giltiga matchningar ska systemet returnera flera kandidater eller en uttrycklig konflikt – inte välja den första av tekniska ordningsskäl.

## 6. Föreslagen arbetsordning

1. Rätta först datakontraktet för T40-root och terminal/ej modellerad gren, utan att ändra budbetydelser.
2. Komplettera de åtta saknade handprofilerna från verifierat underlag. Om underlaget inte räcker, markera profilen som ej fastställd i stället för att gissa.
3. Skapa en sekvensnyckel och jämför alla noder med samma sekvens. Klassificera dem som verkliga dubbletter, villkorsvarianter eller olika pedagogiska vyer.
4. Lägg till automatiska valideringar: unika ID, giltiga root-ID, giltiga target-ID, explicit terminalstatus, strukturella handprofiler och refererade konventionsversioner.
5. Bygg en separat matchare som returnerar alla noder som uppfyller sekvens + roll + handvillkor.
6. Jämför matcharens resultat med rättningsmotorns beslut på fasta ostörda givare.
7. Först därefter kan vi överväga att låta bibliotekets kanoniska noder driva delar av rättningsmotorn.

Ingen av dessa punkter kräver att vi ändrar någon fastställd budregel. Saknad information ska fortsätta vara synlig som en lucka.

## 7. Nästa grind

Den praktiska nästa grinden är en maskinell validerare för nodbiblioteket och en korsreferensrapport mellan:
- auktionstillstånd i rättningsmotorns dispatcher;
- sekvensprefix i analysbiblioteket;
- handvillkor;
- förväntat nästa bud;
- terminal eller odefinierad fortsättning.

Det ger oss en kontrollerbar karta innan någon större omstrukturering av budträdet görs.


## Ny korsreferensrapport och maskinell validering

`KORSREFERENS_RUNTIME_NODER.md` listar systemfamiljer, relevanta runtime-funktioner och samtliga 26 grupper med identiska sekvensnycklar. Den bekräftar att bibliotek och runtime ännu inte är en gemensam nodmotor. `scripts/validate-analysis-library.js` kontrollerar strukturella fel; `tests/analysis-library-audit.test.js` låser den nuvarande baslinjen. De kända luckorna (T40-root, 8 handprofiler, 106 grenposter utan mål) är avsiktliga varningar och har inte tyst rättats.
