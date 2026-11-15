# Granskning av 9 återbudsluckor efter partnerns pass

## Avgränsning

Dessa positioner uppstår när en spelare har öppnat, motståndarna ingriper och öppnarens partner passar. Rättningsmotorn saknar en beskriven fortsättning för öppnarens nästa beslut. Det betyder inte att Pass är fel; pass är bara referensgeneratorns säkra reservbud när motorn saknar rekommendation.

## Resultat

| Case | Öppning | Motståndarnas bud före återbudet | Öppnarens HCP | Fördelning ♠/♥/♦/♣ | Auktion |
|---|---|---|---:|---|---|
| stenberg-03-bid-5 | 1S | 3D | 13 | ♠4 ♥3 ♦4 ♣2 | 1S 3D P P P |
| slam-02-bid-5 | 1H | 2S | 19 | ♠0 ♥5 ♦5 ♣3 | 1H 2S P P P |
| trumf-02-bid-5 | 1H | 1S | 12 | ♠3 ♥5 ♦0 ♣5 | 1H 1S P P P |
| trumf-05-bid-5 | 1C | 1H, 2C | 14 | ♠4 ♥3 ♦1 ♣5 | 1C 1H P 2C P P P |
| tvafarg-02-bid-5 | 1S | 3C | 13 | ♠5 ♥3 ♦4 ♣1 | 1S 3C P P P |
| tvafarg-05-bid-5 | 1C | 1S | 13 | ♠1 ♥4 ♦0 ♣8 | 1C 1S P P P |
| dubbling-02-bid-5 | 1D | Dbl | 12 | ♠3 ♥3 ♦4 ♣3 | 1D Dbl P P P |
| dubbling-04-bid-5 | 1D | Dbl, 2N | 13 | ♠2 ♥3 ♦5 ♣3 | 1D Dbl P 2N P P P |
| dubbling-09-bid-5 | 1H | Dbl, 3S | 14 | ♠2 ♥6 ♦0 ♣5 | 1H Dbl P 3S P P P |

## Mönster och skillnader

- **Enkelt inkliv med partnerpass och därefter pass från inklivarens partner:** `stenberg-03`, `slam-02`, `trumf-02`, `tvafarg-02` och `tvafarg-05`. Dessa är inte samma sak som att öppnaren måste återbjuda en ny färg; partnern har inte visat stöd.
- **Motståndarnas andra bud innan öppnaren återkommer:** `trumf-05`, `dubbling-04` och `dubbling-09`. Nivå och budtyp skiljer sig åt; de kan inte dela en generell återbudsregel.
- **Dubbling:** `dubbling-02` är 1♦–Dbl–P–P. Det är en särskild konkurrenssituation och ska inte blandas ihop med naturliga inkliv.

## Jämförelse med tidigare dokumenterade exempel

- **Giv 19** i `LOGG_BUDREGLER.md`: 1♦–(1♥)–Pass–Pass–1♠. Öppnaren återkommer med en ny färg efter att motståndarna passat. Det är ett användbart exempel på återbud efter partnerns pass, men motståndarna har inte fortsatt bjuda före återbudet.
- **Giv 21**: 1♥–(2♣)–Pass–Pass–2♥. Öppnaren återkommer i egen färg efter att partnern passat. Detta är närmare ett naturligt återbud, men fortfarande inte en match till fallen där motståndarnas partner höjer eller dubblingen följs av ett nytt bud.
- Övriga loggade givare har andra turordningar eller gäller svar/inkliv. De fastställer inte hur öppnaren ska agera i dessa sekvenser.

## Slutsats

De 9 sekvenserna är giltiga auktioner, inte turordningsfel. Öppnarhänderna har 12–19 HCP och varierande fördelningar. Det finns inte underlag för att ändra pass till ett obligatoriskt bud i någon av positionerna. Alla förblir `ej_täckt` tills ett auktoritativt systemunderlag eller fler godkända exempel finns.
