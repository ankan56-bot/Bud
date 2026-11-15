# Analys av 47 ej täckta budpositioner

## Tolkning

Alla 47 poster är **Pass** i den deterministiska referensauktionen. Referensgeneratorn använder Pass när rättningsmotorn inte lämnar ett säkert budförslag. Därför är dessa poster täckningsluckor, inte bevis för att Pass är korrekt eller felaktigt.

## Orsaksfördelning

| Orsak från rättningsmotorn | Antal | Exempel-ID |
|---|---:|---|
| Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet. | 13 | stenberg-03-bid-3, slam-02-bid-3, trumf-02-bid-3 |
| Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet. | 9 | dubbling-01-bid-6, dubbling-03-bid-6, dubbling-05-bid-6 |
| Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet. | 4 | alla-05-bid-5, alla-05-bid-7, alla-05-bid-9 |
| Budgivningen följer inte ett turordnat mönster som dokumentet beskriver. | 10 | stenberg-03-bid-5, slam-02-bid-5, trumf-02-bid-5 |
| Dokumentet anger inte budet för denna hand. | 9 | alla-02-bid-5, inkliv-01-bid-4, inkliv-03-bid-4 |
| Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet. | 1 | alla-01-bid-9 |
| Denna handtyp eller fortsättning kan inte avgöras säkert med de uppgifter som visas. | 1 | trumf-04-bid-7 |

Summa: 47.

## Första prioritering

1. **Konkurrensbudgivning (26 poster).** De 13 posterna med första orsaken är särskilt värda att kontrollera mot dubblingslogiken; 9 poster gäller annan motståndarinblandning och 4 har flera motståndarbud i sekvensen. Befintliga exempel i `LOGG_BUDREGLER.md` som bör jämföras är Giv 7, 10, 13, 19, 21, 22, 24 och 25. Dessa exempel är inte automatiskt bevis för att samtliga 26 lägen har en fast regel.
2. **Sekvens-/turordningsluckor (10 poster).** Här behöver vi kontrollera om motorn felaktigt avvisar normala pass-/återbudssekvenser efter att motståndarna har klivit in, eller om dokumenterad systeminformation saknas.
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
