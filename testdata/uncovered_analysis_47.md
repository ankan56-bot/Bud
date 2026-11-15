# Analys av 47 ej täckta budpositioner

## Tolkning

Alla 47 poster är **Pass** i den deterministiska referensauktionen. Referensgeneratorn använder Pass när rättningsmotorn inte lämnar ett säkert budförslag. Därför är dessa poster täckningsluckor, inte bevis för att Pass är korrekt eller felaktigt.

## Orsaksfördelning

| Orsak från rättningsmotorn | Antal | Exempel-ID |
|---|---:|---|
| Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. | 13 | stenberg-03-bid-3, slam-02-bid-3, trumf-02-bid-3 |
| Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. | 9 | dubbling-01-bid-6, dubbling-03-bid-6, dubbling-05-bid-6 |
| Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. | 4 | alla-05-bid-5, alla-05-bid-7, alla-05-bid-9 |
| Öppnarens återbud efter partnerns pass och motståndarnas inkliv beskrivs inte i dokumentet. | 10 | stenberg-03-bid-5, slam-02-bid-5, trumf-02-bid-5 |
| Dokumentet anger inte budet för denna hand. | 9 | alla-02-bid-5, inkliv-01-bid-4, inkliv-03-bid-4 |
| Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet. | 1 | alla-01-bid-9 |
| Denna handtyp eller fortsättning kan inte avgöras säkert med de uppgifter som visas. | 1 | trumf-04-bid-7 |

Summa: 47.

## Första prioritering

1. **Konkurrensbudgivning (26 poster).** De 13 posterna med första orsaken är särskilt värda att kontrollera mot dubblingslogiken; 9 poster gäller annan motståndarinblandning och 4 har flera motståndarbud i sekvensen. Befintliga exempel i `LOGG_BUDREGLER.md` som bör jämföras är Giv 7, 10, 13, 19, 21, 22, 24 och 25. Dessa exempel är inte automatiskt bevis för att samtliga 26 lägen har en fast regel.
2. **Öppnarens återbud efter partnerns pass (10 poster).** Dessa är giltiga auktioner där öppnaren återkommer efter partnerns pass och motståndarnas inkliv. En kodkorrigering har tagit bort den felaktiga turordningsdiagnosen; själva återbudet är fortfarande ej täckt.
3. **Handspecifika luckor (9 poster).** Dessa är koncentrerade till inklivstemat och en allmän giv. De måste bedömas med full hand, budhistorik och uttryckliga systemgränser; vi ska inte fylla dem med generella bridgeantaganden.
4. **Svarshandens andra bud (1 post).** Isolerat fall efter 1 i färg och öppnarens återbud. Jämför med tidigare loggade exempel och bokregler innan kodning.
5. **Osäkert fall (1 post).** Ska förbli ej täckt tills mer systemunderlag finns.

## Vad som inte har ändrats

- Ingen grundsystemregel har lagts till eller ändrats.
- Ingen kompletterande regel har godkänts.
- Inga analysnoder har lagts till på basis av dessa pass.
- DDS har inte använts för att avgöra buden.

## Underlag

- `testdata/uncovered_cases_47.json`: exakta händer, auktioner, positioner och rättningsmotivering.
- `testdata/theme_deals_140.json`: fullständiga givare och referensauktioner.
- `LOGG_BUDREGLER.md`: tidigare dokumenterade testobservationer och uttryckliga systemkrav.

Nästa steg är att jämföra de 26 konkurrensfallen mot loggens konkreta givexempel och regeltexter, och därefter formulera testbara kandidater. Ingen kodändring ska göras förrän ett handvillkor och en regelkälla är tydliga.


## Fördjupning: de 16 ej täckta positionerna med dubbling i sekvensen

Dessa 16 positioner ska inte behandlas som en enda regeltyp. Budsekvenserna visar minst fyra olika situationer:

### A. Svar efter att motståndaren dubblat partnerns öppning (3 positioner)
- `dubbling-02-bid-3`: S:1D W:X N:P; position Norr, Pass.
- `dubbling-04-bid-3`: N:1D E:X S:P; position Syd, Pass.
- `dubbling-09-bid-3`: S:1H W:X N:P; position Norr, Pass.

Detta är inte samma situation som svar på partnerns upplysningsdubbling. I rättningsmotorns nuvarande dispatch finns `respDouble()` för svar när partnern har dubblat motståndarnas öppning. Den täcker inte automatiskt svarshandens val efter att motståndaren har dubblat vår öppning. Vi behöver kontrollera om systemet föreskriver redubbling, naturliga svar eller andra prioriteringar innan en sådan gren byggs.

### B. Dubblerarens återbud efter partners svar (8 positioner)
- `dubbling-01-bid-6`: W:1D N:X E:P S:1S W:P N:P; position Norr, Pass.
- `dubbling-03-bid-6`: W:1D N:X E:P S:1H W:P N:P; position Norr, Pass.
- `dubbling-05-bid-6`: E:1H S:X W:P N:2D E:P S:P; position Syd, Pass.
- `dubbling-06-bid-6`: E:1C S:X W:P N:1D E:P S:P; position Syd, Pass.
- `dubbling-07-bid-6`: E:1H S:X W:P N:2D E:P S:P; position Syd, Pass.
- `dubbling-08-bid-6`: W:1C N:X E:P S:1H W:P N:P; position Norr, Pass.
- `dubbling-10-bid-6`: E:1H S:X W:P N:2C E:P S:P; position Syd, Pass.
- `inkliv-09-bid-6`: E:1D S:X W:P N:1S E:P S:P; position Syd, Pass.

Det här är återbud från den spelare som först dubblade, efter att partnern har svarat och motståndarna har passat. Rättningsmotorn lämnar dessa som ej täckta. De ska granskas utifrån dubblerarens ursprungliga hand, partnerns svarsfärg och om pass från öppningssidan är en del av sekvensen.

### C. Fortsättning efter ytterligare motståndarinblandning (2 positioner)
- `dubbling-04-bid-7`: N:1D E:X S:P W:2N N:P E:P S:P; position Syd, Pass.
- `dubbling-09-bid-7`: S:1H W:X N:P E:3S S:P W:P N:P; position Norr, Pass.

Här har motståndarna lagt ett nytt bud efter den första dubblingen och partnerskapet måste ompröva. Detta är skilt från ett ostört återbud efter dubbling.

### D. Övriga passpositioner i dubblingssekvenser (3 positioner)
- `dubbling-02-bid-5`: S:1D W:X N:P E:P S:P; position Syd, Pass.
- `dubbling-04-bid-5`: N:1D E:X S:P W:2N N:P; position Norr, Pass.
- `dubbling-09-bid-5`: S:1H W:X N:P E:3S S:P; position Syd, Pass.

De här positionerna är pass efter varierande motståndarsvar/fortsättningar. De kräver samma exakta sekvenskontroll och ska inte generaliseras från A–C.

**Kodobservation:** `nodeForRaw()` har en särskild dispatch för `oppBefore`, men går till en generell ej täckt-nod när motståndarinblandningen inte matchar dess snäva mönster. Det förklarar varför flera olika fortsättningar hamnar i samma generiska feltext. Det är en täckningsbegränsning, inte belägg för att passen är rätt eller fel.

**Nästa regelgranskning:** separera (1) svar efter motståndarnas dubbling av vår öppning, (2) återbud efter partnerns svar på vår upplysningsdubbling, och (3) ny budgivning när motståndarna kliver in igen. För varje kategori måste vi hitta uttrycklig systemkälla och testhänder. Ingen regel ändras i detta steg.


## Fördjupad granskning av konkurrens-/försvarsluckorna

De 26 poster som i den första orsaksgrupperingen hamnade under motståndarnas bud har nu granskats mot `LOGG_BUDREGLER.md` och T29–T33. Förtydligande: 22 är egentliga konkurrens-/dubblingssituationer; fyra är försvarspass efter motståndarnas naturliga 1♣–1♠–2♣–5♣-sekvens. Rapporten `testdata/competition-gaps-26-audit.md` listar alla 26 positioner med handens HCP/fördelning och jämförelser med tidigare givexempel.

Två tydliga handbaserade kandidater finns i T29–T33: `trumf-02-bid-3` matchar T29 men har en överlappning mellan 2♥ och spärrande 3♥ vid 6 HCP/fem hjärter; `trumf-05-bid-3` matchar T32:s 3♣-profil (4 HCP/fem klöver). Båda är fortfarande `analysis_only`. `dubbling-09-bid-3` (1♥–Dbl, 2 HCP/två hjärter) saknar ett definierat passalternativ i T33. Loggens Giv 7, 10, 13, 19, 21, 22, 24 och 25 ger strukturella jämförelser men ingen komplett regelkälla för de 26 fallen. Inga budregler har ändrats.
