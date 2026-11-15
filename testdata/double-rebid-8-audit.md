# Granskning av återbud efter upplysningsdubbling – 8 fall

## Syfte

Åtta av de ej täckta positionerna gäller spelaren som gjorde upplysningsdubblingen och nu ska återkomma efter att partnern har svarat och öppnaren har passat. De är separata från:
- svarshandens första bud efter att motståndarna dubblat vår öppning (T33:s situation);
- svar på partnerns upplysningsdubbling (`respDouble()` i rättningsmotorn);
- återbud från en naturlig inklivare efter partnerns stöd.

## De åtta fallen

HCP och fördelning gäller dubbleraren respektive partnern. Fördelningen är ♠-♥-♦-♣.

| Case | Motståndarnas öppning | Dubblerare | Dubblerarens hand | Partners svar | Partnerns hand | Auktion (P = pass) |
|---|---|---|---|---|---|---|
| dubbling-01-bid-6 | W:1D | N | 19 (S4-H4-D1-C4) | S:1S | 5 (S3-H3-D4-C3) | 1D Dbl P 1S P P |
| dubbling-03-bid-6 | W:1D | N | 12 (S7-H3-D0-C3) | S:1H | 3 (S2-H4-D3-C4) | 1D Dbl P 1H P P |
| dubbling-05-bid-6 | E:1H | S | 15 (S4-H1-D4-C4) | N:2D | 7 (S3-H2-D4-C4) | 1H Dbl P 2D P P |
| dubbling-06-bid-6 | E:1C | S | 14 (S4-H4-D3-C2) | N:1D | 7 (S3-H3-D5-C2) | 1C Dbl P 1D P P |
| dubbling-07-bid-6 | E:1H | S | 13 (S3-H2-D4-C4) | N:2D | 8 (S4-H2-D5-C2) | 1H Dbl P 2D P P |
| dubbling-08-bid-6 | W:1C | N | 12 (S3-H4-D4-C2) | S:1H | 9 (S3-H5-D2-C3) | 1C Dbl P 1H P P |
| dubbling-10-bid-6 | E:1H | S | 13 (S4-H2-D3-C4) | N:2C | 6 (S4-H3-D1-C5) | 1H Dbl P 2C P P |
| inkliv-09-bid-6 | E:1D | S | 14 (S4-H3-D2-C4) | N:1S | 6 (S5-H3-D4-C1) | 1D Dbl P 1S P P |

## Vad fallen visar

- Dubblerarens styrka varierar från 12 till 19 HCP.
- Fördelningen varierar från 3-4-4-2 till 7-3-0-3; det finns både balanserade händer och kraftigt enfärgade händer.
- Partnerns svar varierar mellan 1♥, 1♠, 1♦, 2♦ och 2♣.
- Partnerns HCP ligger mellan 3 och 9.
- Samma återbud kan därför inte väljas enbart utifrån öppningsfärg eller partnerns svarsfärg. Dubblerarens egen fördelning och styrka måste ingå.

## Separat fall: inklivarens återbud efter partnerns hoppstöd

`inkliv-02-bid-6` är inte en upplysningsdubbling:
- Auktion: 1♣–1♥–Pass–3♥–Pass–Pass.
- Inklivarens hand: 11 HCP, 1-6-5-1.
- Partnerns hand: 4 HCP, 4-4-2-3.
- Partnern har gjort ett hoppstöd 3♥; inklivaren ska nu välja fortsättning.

Detta kräver en separat regelgren från återbud efter upplysningsdubbling.

## Jämförelse mot LOGG_BUDREGLER.md

Giv 22 innehåller en upplysningsdubbling efter ett hoppande inkliv, men det är inte återbud efter att partnern har svarat på dubbleringen. Giv 13 gäller i stället svarshandens bud efter att motståndarna dubblat vår öppning. Giv 19 och 21 beskriver öppnarens återbud efter naturligt inkliv. Ingen av dessa loggposter ger en auktoritativ återbudsregel för de åtta fallen ovan.

## Rekommenderat nästa underlag

1. Hitta systemtexten för återbud efter upplysningsdubbling, inklusive skillnad mellan 1-nivå- och 2-nivåsvar.
2. Definiera vilka återbud som visar minimum, maximum, egen lång färg eller balanserad hand.
3. Bestäm om partnerns svarsfärg är krav, preferens eller bara beskrivande.
4. Lägg först därefter till strukturerade handvillkor och regressionstester.

## Beslut

Inget bud har föreslagits som rätt eller fel i dessa åtta fall. Ingen ny regel har lagts till. Detta är en inventering av de exakta handtyperna och auktionerna som behöver en egen systemkälla.
