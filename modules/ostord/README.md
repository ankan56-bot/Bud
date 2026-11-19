# Ostörd budgivning – modulöversikt och adapterkontrakt

Detta dokument beskriver befintliga moduler på `work/undisturbed-architecture` och hur de ska delas upp/dirigeras. Det är en arbetskarta, inte en ändring av systemregler.

## Befintliga modulgränser

| Modul | Ansvar idag | Målgrupp |
|---|---|---|
| `hogfargsbudgivning.js` | Öppning, svar och återbud för 1♥/1♠ | Öppningar / svar / återbud (adapter) |
| `lagfargsbudgivning.js` | Öppning, svar och återbud för 1♣/1♦ | Öppningar / svar / återbud (adapter) |
| `ettoppningssvar.js` | Gemensamma svar på 1 i färg (`resp1`) och öppnarens andra bud (`reb1`) | **Delad fil som bör delas i svar respektive återbud**, med gemensamma hjälpfunktioner kvar |
| `trumfstod.js` | Trumfstödssvar, öppnarens andra bud och svarshandens fortsättning; återanvänder Stenberg | Svar / återbud / fortsättning |
| `stenberg.js` | Stenberg-responder, öppnarens återbud och svarshandens fortsättning | Specialiserat svar / återbud / fortsättning |
| `sangbudgivning.js` | 1NT-svar, Stayman, transfer, öppnarens fortsättningar och val av utgång | Svar / återbud / specialkonvention |
| `stordbudgivning.js` | 1NT-återbud efter invit och svarshandens andra bud | Återbud / fortsättning |
| `2kloveroppning.js` | 2♣ öppning, väntesvar, återbud och fortsättning, inklusive reläer | Öppning / svar / återbud |
| `svaga2oppningar.js` | Svaga 2 öppningar, svar och öppnarens fortsättning | Öppning / svar / återbud |
| `slamlogik.js` | RKC-trumfidentifiering, essfrågor, kvantitativa NT-inviter, svar, fortsättning, slamförbud | **Slammodul**; 4NT är intern och kontextberoende |
| `budbeslut.js` | Öppningsval och sekvensbaserad dispatch in i moduler | Router/dispatcher; bör hållas tunn |
| `rattningsmotor.js` | Publik facade, hand-/auktionsfakta och sammansättning av factories | Kärna/facade; ska inte växa med nya regler |

## Beslutad separering

- **Öppningsmoduler** ska endast besluta om öppningspositionen, med öppningsfamiljens regler.
- **Svarmoduler** ska tolka svarshandens första bud efter öppning.
- **Återbudsmoduler** ska tolka öppnarens andra bud och svarshandens fortsättning, med hela sekvensen.
- **Specialmoduler** (Stayman, transfer, Stenberg, trumfstöd, stark 2♣, svaga 2) ska exponera explicita funktioner för varje aktörssteg, inte en generisk bid-funktion.
- **Slammodulen** ska ta emot full auktion och handfakta som är synliga för den agerande spelaren. Den ska själv avgöra om 4NT är RKC, essfråga utan fastställd trumf, kvantitativ invit eller ej täckt. Routern får aldrig hårdkoda betydelsen.

## Router-kontrakt

`modules/ostord/router.js` är en första isolerad klassificerare. Den:
- är deterministisk och endast klassificerar;
- routes Stenberg endast vid direkt `1♣/1♦/1♥/1♠ – 2NT`;
- skickar alla 4NT till Slam-modulen för sekvensbaserad tolkning;
- markerar inkliv/dubbling som `out-of-scope` (tävlingsbudgivningen är pausad);
- använder fasen i auktionen för att skilja svar, öppnaråterbud och svarshandens fortsättning;
- väljer aldrig bud och får inte användas som facit.

Den är ännu **inte inkopplad** i den befintliga rättningsmotorn. Integrering sker först när en adapter testas mot befintlig dispatch och regressionsgivarna.

## Integrationsgrind

1. Inventera alla factory-funktioner och beroenden.
2. Skapa adapter för dispatcher som endast väljer ansvarig modul; inget regelinnehåll flyttas samtidigt.
3. Kör befintliga Stenberg-, trumfstöd-, NT-, 2♣-, svaga-2-, slam-, 1-major- och ostörd 100/500-givstester.
4. Jämför gammal och ny dispatch på samma fasta auktioner/händer. Alla skillnader ska förklaras.
5. Aktivera ny router först när 0 oförklarade regressioner.
6. Separera `ettoppningssvar.js` i svar/återbud endast som en fristående extraction med identiska testsvar; inga regeländringar samtidigt.

## Status

- Dokumenterad målarkitektur: klar.
- Första fristående router: implementerad.
- Router regressionstest: passerar lokalt i Node.
- CI-workflow: tillagd; körstatus ännu ej verifierad.
- Integrering i produktens dispatcher: inte gjord.
- Extraction av `ettoppningssvar.js`: planerad, inte gjord.
