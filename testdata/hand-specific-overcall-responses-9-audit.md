# Granskning av nio handspecifika täckningsluckor

## Avgränsning

Dessa nio positioner har diagnosen ”Dokumentet anger inte budet för denna hand”. Samtliga är pass från spelaren vars partner har gjort ett inkliv eller ett sanginkliv. De är alltså svar på partnerns inkliv, inte egna inkliv. Rättningsmotorn har inte en uttrycklig svarstabell för de aktuella sekvenserna.

## Exakta händer och sekvenser

| Case | Svarshand | Partners inkliv | HCP | Fördelning ♠/♥/♦/♣ | Auktion |
|---|---|---|---:|---|---|
| alla-02-bid-5 | S | 2N | 6 | ♠5 ♥1 ♦1 ♣6 | P 2H 2N P P |
| inkliv-01-bid-4 | N | 1H | 4 | ♠4 ♥1 ♦4 ♣4 | 1C 1H P P |
| inkliv-03-bid-4 | N | 2C | 4 | ♠4 ♥5 ♦1 ♣3 | 1S 2C P P |
| inkliv-04-bid-4 | S | 3D | 6 | ♠5 ♥3 ♦3 ♣2 | 1S 3D P P |
| inkliv-05-bid-4 | S | 1H | 8 | ♠1 ♥5 ♦4 ♣3 | 1C 1H P P |
| inkliv-06-bid-4 | S | 3H | 9 | ♠6 ♥1 ♦1 ♣5 | 1S 3H P P |
| inkliv-07-bid-4 | S | 2S | 6 | ♠3 ♥5 ♦3 ♣2 | 1C 2S P P |
| inkliv-08-bid-4 | N | 3C | 9 | ♠3 ♥3 ♦3 ♣4 | 1D 3C P P |
| inkliv-10-bid-4 | N | 1H | 7 | ♠5 ♥2 ♦1 ♣5 | 1C 1H P P |

## Kontroll mot uttryckliga systembeslut

- I `LOGG_BUDREGLER.md` finns en uttrycklig notering från Giv 12: systemets inkliv på 2-nivån kräver sex kort. Det är en regel för den som själv kliver in, inte en svarstabell för partnern. Den kan därför inte användas för att bestämma om svarshanden ska passa eller bjuda.
- Giv 18 dokumenterar att ett svagt 1♥-inkliv med fem kort och 6 HCP inte ska behandlas som självklart. Även detta gäller inklivarens beslut, inte partnerns svar.
- Giv 22 och 24 innehåller hoppande inkliv (3♣/2♥) och visar att sådana bud kan vara relevanta i vissa handtyper. De fastställer inte hur partnern ska svara på dessa inkliv.
- Giv 7, 10, 19, 21 och 25 gäller andra konkurrenspositioner eller öppnarens återbud. De ger ingen komplett svarstabell efter partnerns inkliv.
- Analysbibliotekets T29–T33 gäller svar efter motståndarnas inkliv/dubbling av vår öppning. De beskriver inte svar när vår partner själv har klivit in. Ingen av dessa noder är därför en korrekt sekvensmatch.

## Fallgrupper

1. **Svar efter 1-nivåinkliv:** `inkliv-01` (1♣–1♥), `inkliv-05` (1♣–1♥) och `inkliv-10` (1♣–1♥) har 4–8 HCP och olika fördelningar. Tre händer med samma auktionsstart visar att en gemensam svarstabell behövs; det går inte att dra slutsats enbart av färgfit.
2. **Svar efter 2-nivåinkliv:** `inkliv-03` (1♠–2♣) har 4 HCP, `inkliv-07` (1♣–2♠) har 6 HCP. De behöver bedömas utifrån partnerns färg, trumfstöd och om svaret är pass eller stöd; ingen av de dokumenterade reglerna anger prioritet.
3. **Svar efter hoppinkliv på 3-nivån:** `inkliv-04` (1♠–3♦), `inkliv-06` (1♠–3♥) och `inkliv-08` (1♦–3♣) har 6–9 HCP och olika stöd-/sidofärgsprofiler. Detta är en separat nivå och ska inte ärva svar på 1- eller 2-nivå.
4. **Svar efter 2NT-inkliv:** `alla-02` följer 2♥–2NT och har 6 HCP med fem spader och sex klöver. Det är ett separat balanserat/konventionellt beslut; ingen sådan svarstabell finns i de granskade källorna.

## Slutsats

- Ingen av de nio positionerna kan rättas med T29–T33.
- Den uttryckliga sexkortskravsregeln för 2-nivåinkliv gäller inte svarshandens beslut.
- Det saknas källstöd för att omvandla någon av dessa nio pass till ett obligatoriskt bud eller att bekräfta pass som korrekt.
- Alla nio ska fortsatt vara `ej_täckt`. Inga grundregler eller kompletterande regler har ändrats.

## Rekommenderad fortsättning

Skapa separata systemtabeller för (a) svar efter 1-nivåinkliv, (b) svar efter 2-nivåinkliv, (c) svar efter hoppande 3-nivåinkliv och (d) svar efter 2NT-inkliv. För varje tabell behövs godkända exempel med styrka, trumfstöd, egen färg och sårbarhet. Håll dessa regler åtskilda från svar efter motståndarnas inkliv av vår öppning.
