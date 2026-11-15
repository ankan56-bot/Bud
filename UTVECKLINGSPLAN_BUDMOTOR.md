# Utveckling: analysbibliotek, facit och budmotor

## Beslutad riktning

Målet är att förbättra både undervisningsanalysen och Öst–Väst-motorn utan att förvanska det definierade systemet.

### Kunskapslager

1. **Grundsystemet** – den befintliga rättningsmotorn och de uttryckligen fastställda Nordisk Standard-reglerna är auktoritativ källa. Kompletterande resonemang får aldrig skriva över detta.
2. **Kompletterande budlogik** – analyserar situationer där grundsystemet saknar täckning eller lämnar flera rimliga alternativ. Varje post märks som kompletterande och får källa, motivering och säkerhetsnivå.
3. **Analysbiblioteket** – pedagogiska noder som förklarar budsekvenser, handvillkor, fortsättningar, alternativ och vanliga misstag. En nod får bara matcha när både sekvens och relevanta handvillkor stämmer.
4. **DDS** – används som efterhandskontroll av stick och kontraktsmöjligheter. DDS känner till alla fyra händer och får därför inte ensamt avgöra vad spelarna borde ha bjudit med den information de hade under auktionen.

## Temabaserad testuppsättning

Hemsidan har för närvarande 14 teman:

| ID | Tema | Antal första testgivare |
|---|---|---:|
| alla | Alla slags givar | 10 |
| nt | 1NT, Stayman och överföringar | 10 |
| stenberg | Stenberg 2NT | 10 |
| tva | 2♣-öppning | 10 |
| rkc | Essfråga (RKC) | 10 |
| slam | Slambudgivning i färg | 10 |
| slamnt | Slambudgivning i sang | 10 |
| trumf | Trumfstöd | 10 |
| sang | Sanghänder | 10 |
| invit | Inviter | 10 |
| tvafarg | Tvåfärgshänder | 10 |
| svag | Svaga öppningar och spärrbud | 10 |
| dubbling | Upplysningsdubbling | 10 |
| inkliv | Inkliv och dubbling | 10 |

Första målet är 140 temamärkta givare. Varje tema ska ha reproducerbara seed-värden. Givarna ska skapas med temats faktiska villkor, inte slumpas först och etiketteras i efterhand. Sju typiska och tre gränsnära fall är en startfördelning, men får anpassas om ett tema kräver annan variation.

Samma givuppsättning ska återanvändas vid varje motorändring. Resultat ska redovisas per tema och per budposition. Om en giv passar flera teman får den ha flera sekundära etiketter, men ett tydligt huvudtema.

## Bedömningsflöde per giv

1. Kontrollera kortlek, 13 kort per hand, 52 unika kort och temavillkor.
2. Kör grundsystemets rättningsmotor och spara dess exakta bedömning.
3. Markera vilka auktionstillstånd som är täckta, valfria, felaktiga eller ej täckta.
4. Analysera ej täckta och tvetydiga lägen separat. Kompletterande bedömningar ska innehålla resonemang, alternativ och osäkerhet.
5. Kör DDS som efterhandskontroll där det är relevant. Håll dolda kort separerade från information som var tillgänglig för budgivarna.
6. Skapa eller uppdatera analysnoder med strukturerade handvillkor och tydlig källa.
7. Testa budmotorn mot samma givuppsättning och jämför förbättringar/regressioner.

## Krav på AI-bedömning

AI-stödd analys under utvecklingen ska:
- följa grundsystemet när det finns en uttrycklig regel;
- identifiera luckor i stället för att hitta på systemregler;
- använda bridgekunskap för att föreslå rimliga beslut utanför uttryckliga regler;
- väga in partnerns bud och den information som faktiskt är tillgänglig;
- skilja systemkorrekthet från strategisk kvalitet och DDS-efterhandsresultat;
- ange motivering, alternativ och säkerhetsnivå;
- inte automatiskt publicera en komplettering som en ny grundregel.

Ingen extern AI-tjänst ska krävas av den publicerade hemsidan. Analys som ska köras lokalt måste vara uttryckligt implementerad i lokala regler/data; ett statiskt JSON-bibliotek är inte i sig en AI-modell.

## Kvalitetsgrindar

- Inga ändringar i grundsystemet utan dokumenterad regelgrund och regressionstest.
- Ingen kompletterande regel får märkas som grundsystem.
- Varje nod ska validera sekvens och relevanta handvillkor.
- Testgivarna ska vara reproducerbara och kontrollerade för kortintegritet.
- Kör syntaxkontroll och regressionstest efter varje motorändring.
- Redovisa ej täckta lägen separat; målet är att minska dem över tid, inte dölja dem.
- Ingen AI- eller DDS-rekommendation ska presenteras som säkert facit utan korrekt kunskapskälla.

## Nuvarande utgångsläge

- Befintliga filer: `rattningsmotor.js`, `analysmotor.js`, `analysbibliotek.json`, `dds-integration.js`.
- Befintlig analys av 200 givare dokumenterar luckor i svarshandens tredje bud, återbud efter 1NT-svar och konkurrensbudgivning. Den rapporten är en baslinje, inte ett slutligt AI-facit.
- Den nuvarande analysmotorn matchar huvudsakligen sekvensprefix. Handvillkor behöver göras till verklig matchningskontroll innan biblioteket byggs ut kraftigt.
- Den nuvarande temageneratorn finns inbyggd i `Budtraning.html`. Den ska återanvändas eller extraheras till en separat utvecklingsmodul så att testgivare kan skapas utan att belasta användarens iPad.

## Avgränsning för publicerad webbplats

Stora simuleringar och analyskörningar ska ske i utvecklingsmiljö, inte i besökarens webbläsare. Webbplatsen ska bara hämta den färdiga, validerade kunskapen och använda DDS för enskilda givar när det behövs.


## Framtida spelarkitektur: människa Nord, AI Syd/Öst/Väst

En central framtida användning är att användaren spelar Nord medan AI spelar Syd som partner och Öst/Väst som motståndare. Arkitekturen ska därför från början stödja fyra separata spelarinstanser:

- Nord: mänsklig inmatning.
- Syd: AI-partner.
- Öst och Väst: varsin AI-motståndare.

**Informationssäkerhet är ett hårt krav.** Varje AI-beslut ska få endast den aktuella spelarens egen hand, budhistorik, sårbarhet, givinformation och den information som lagligen blivit offentlig genom budgivningen (och senare spelet). En AI får aldrig få partnerns eller motståndarnas dolda kort. Undvik en gemensam beslutsfunktion som tar emot alla fyra händer; använd i stället ett gränssnitt i stil med decide({ seat, ownHand, auction, vulnerability, publicState, system }). Den exakta API-formen fastställs när spelmotorn byggs, men informationsgränsen ska testas automatiskt.

DDS får fortsatt användas med alla fyra händer i en separat efterhandsanalys/testprocess. Den får inte läcka in i spelaragenternas beslutsunderlag under en pågående giv.

Detta innebär inte att spelmotorn eller AI-spelarna byggs i detta delsteg. Först färdigställs och verifieras rättningsmotor, temagivare, analysvillkor och budlogik. Därefter kan spelmotorn byggas ovanpå samma regel- och kunskapslager.


## Första verifierade temabaslinjen

`testdata/theme_deals_140.json` är den fasta baslinjen: 10 givare per tema, fasta seeds, 52 unika kort per giv och 13 kort per hand. Temagenereringen återanvänder den befintliga logiken i `Budtraning.html`. Rättningsmotor 6.6 gav 583 rätt och 47 ej täckta bedömningar av 630 relevanta Nord/Syd-bud, utan felaktiga bedömningar. Se `testdata/theme_deals_140_report.md` för fördelning per tema.

De 47 ej täckta buden är nästa analysmål. De ska granskas mot budsekvens, handvillkor och befintlig systemdokumentation innan analysbibliotek eller kompletterande budlogik ändras. Referensauktionerna är genererade med samma befintliga system och är därför en täckningsbaslinje, inte oberoende facit. Klassificering typisk/gränsnära och DDS-kontroll återstår.

Reproducerbar generator och tester finns i `testdata/generate-theme-deals.js` och `testdata/theme-deals.test.js`. GitHub Actions körning 43658747827 har passerat regenerering och dataset-/reproducerbarhetstester. Workflowet utökas även med testet för AI-positionernas informationsgräns.


## Prioriterad analys av ej täckta lägen

De 47 ej täckta positionerna är samlade i `testdata/uncovered_cases_47.json` och grupperade i `testdata/uncovered_analysis_47.md`. Prioritet ett är de 26 konkurrensfallen; därefter sekvens-/turordningsluckor (10), handspecifika luckor (9), ett fall av svarshandens andra bud och ett osäkert fall. Dessa är täckningsluckor, inte bevis för att referensauktionernas pass är fel eller rätt. Jämför med konkreta tidigare exempel i `LOGG_BUDREGLER.md` innan några nya villkor implementeras.

GitHub Actions har passerat på commit med både dataset-/reproducerbarhetstester och AI seat isolation-tester. Ingen regel har ändrats i detta analyssteg.


## AI-informationsgräns

`seat-view.js` version 0.2.0 är nu striktare: AI-agenten får en whitelistad vy; okända `publicState`-fält och dolda hand-/seat-mappar avvisas, och dummy får endast exponeras efter `dummyExposed: true`. Sex automatiska tester täcker gränsen. Detta är ännu inte inkopplat i spelmotorn, men API-gränsen ska återanvändas när agentgränssnittet byggs.


Senaste AI-seat regression: GitHub Actions körning `43658949390` passerade med både dataset- och AI-seat-tester. Informationsvyn blockerar okända fält, dolda händer även nästlade och dummy utan uttrycklig exponering.


## Första konkreta spelargränssnittet

- `player-roles.js` anger standardbordet: Nord = människa, Syd = AI-partner, Öst/Väst = AI-motståndare. Roller kan konfigureras utan att ändra kunskapsmotorn.
- `seat-view.js` skapar en separat, fryst vy för en bestämd position. Vyn innehåller endast spelarens egen hand, budhistorik, givare, sårbarhet, system och uttryckligen godkända offentliga spelfält.
- AI-kod ska få `createSeatView(gameState, seat, publicState)`-resultatet och aldrig själva `gameState`-objektet. Fullständiga händer får bara användas av givhantering och separat efterhandskontroll.
- Dummy får läggas i offentlig vy först när `dummyExposed === true`.
- Detta är en testad arkitekturgrund, inte en färdig spelande agent eller spelmotor.


Fördjupningen av dubblingsfallen finns i `testdata/uncovered_analysis_47.md`. Av 47 ej täckta positioner förekommer dubbling i 16, och de är uppdelade efter var i auktionen luckan uppstår: svar efter motståndarens dubbling av öppningen, dubblerarens återbud efter partnerns svar, ny motståndarinblandning och övriga passpositioner. Detta ska styra nästa granskning av dispatchlogiken.
