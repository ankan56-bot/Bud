# Granskning av 10 återbudsluckor efter partnerns pass

## Avgränsning

Dessa tio positioner uppstår när en spelare har öppnat, motståndarna ingriper och öppnarens partner passar. Rättningsmotorn saknar en beskriven fortsättning för öppnarens nästa beslut. Det betyder inte att Pass är fel; pass är bara referensgeneratorns säkra reservbud när motorn saknar rekommendation.

## Resultat

| Case | Öppning | Motståndarnas bud före återbudet | Öppnarens HCP | Fördelning ♠/♥/♦/♣ | Auktion |
|---|---|---|---:|---|---|
| stenberg-03-bid-5 | 1S | 3D | 13 | ♠4 ♥3 ♦4 ♣2 | 1S 3D P P P |
| slam-02-bid-5 | 1H | 2S | 19 | ♠0 ♥5 ♦5 ♣3 | 1H 2S P P P |
| trumf-02-bid-5 | 1H | 1S | 12 | ♠3 ♥5 ♦0 ♣5 | 1H 1S P P P |
| trumf-05-bid-5 | 1C | 1H, 2C | 14 | ♠4 ♥3 ♦1 ♣5 | 1C 1H P 2C P |
| tvafarg-02-bid-5 | 1S | 3C | 13 | ♠5 ♥3 ♦4 ♣1 | 1S 3C P P P |
| tvafarg-04-bid-5 | 1D | 2S | 17 | ♠1 ♥4 ♦6 ♣2 | 1D 2S P P P |
| tvafarg-05-bid-5 | 1C | 1S | 13 | ♠1 ♥4 ♦0 ♣8 | 1C 1S P P P |
| dubbling-02-bid-5 | 1D | Dbl | 12 | ♠3 ♥3 ♦4 ♣3 | 1D Dbl P P P |
| dubbling-04-bid-5 | 1D | Dbl, 2N | 13 | ♠2 ♥3 ♦5 ♣3 | 1D Dbl P 2N P |
| dubbling-09-bid-5 | 1H | Dbl, 3S | 14 | ♠2 ♥6 ♦0 ♣5 | 1H Dbl P 3S P |

## Mönster och skillnader

- **Enkelt inkliv med partnerpass och därefter pass från inklivarens partner:** `stenberg-03` (1♠–3♦–P–P), `slam-02` (1♥–2♠–P–P), `trumf-02` (1♥–1♠–P–P), `tvafarg-02` (1♠–3♣–P–P), `tvafarg-04` (1♦–2♠–P–P), `tvafarg-05` (1♣–1♠–P–P). Dessa är inte samma sak som att öppnaren måste återbjuda en ny färg; partnern har inte visat stöd.
- **Motståndarnas andra bud innan öppnaren återkommer:** `trumf-05` (1♣–1♥–P–2♣), `dubbling-04` (1♦–Dbl–P–2NT), `dubbling-09` (1♥–Dbl–P–3♠). Nivå och budtyp skiljer sig åt; de kan inte dela en generell återbudsregel.
- **Dubbling:** `dubbling-02` är 1♦–Dbl–P–P. Det är en särskild konkurrenssituation och ska inte blandas ihop med naturliga inkliv.
- Öppnarhänderna har 12–19 HCP och flera olika fördelningar. Det finns ingen gemensam handprofil som motiverar ett enda obligatoriskt återbud.

## Jämförelse med tidigare dokumenterade exempel

- **Giv 19** i `LOGG_BUDREGLER.md`: 1♦–(1♥)–Pass–Pass–1♠. Öppnaren återkommer med en ny färg efter att motståndarna passat. Det är ett användbart exempel på återbud efter partnerns pass, men motståndarna har inte fortsatt bjuda före återbudet.
- **Giv 21**: 1♥–(2♣)–Pass–Pass–2♥. Öppnaren återkommer i egen färg efter att motståndarna passat. Detta är närmare ett naturligt återbud, men fortfarande inte en match till de fall där motståndarnas partner höjer eller dubblingen följs av ett nytt bud.
- Giv 7, 10, 13, 22, 24 och 25 har andra turordningar eller handlar om partnerns svar/inkliv. De fastställer inte hur öppnaren ska agera efter partnerns pass i dessa tio sekvenser.

## Vad kan fastställas?

1. De tio sekvenserna är strukturellt giltiga auktioner; de är inte felaktiga turordningsmönster.
2. Öppnarens hand är känd i testdata, men partnerns pass avslöjar inte tillräcklig styrka eller stöd för att anta en bestämd fortsättning.
3. Befintliga loggexempel visar att öppnaren ibland kan återkomma med en ny färg eller egen färg efter partnerns pass, men bara när motståndarna inte har fortsatt på samma sätt.
4. Det finns inte underlag för att ändra pass till ett obligatoriskt bud i någon av de tio positionerna.
5. Ingen grundregel, kompletterande regel eller rekommendation har lagts till. Alla tio förblir `ej_täckt` tills ett auktoritativt systemunderlag eller fler godkända exempel finns.

## Nästa prioritet

Fortsätt med de nio handspecifika luckorna. För varje fall ska vi skilja mellan:
- om handen uppfyller en uttrycklig befintlig systemregel;
- om analysbiblioteket har en kompatibel sekvens med relevant handprofil;
- om det saknas en regelkälla och fallet därför måste förbli ej täckt.

DDS får inte användas som facit för budsystemets avsikt.
