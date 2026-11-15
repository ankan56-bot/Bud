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


## Konkurrensgranskning – 26 positioner

`testdata/competition_audit_26.md` innehåller den handvisa genomgången av de 26 konkurrenspositionerna. Den identifierar den tekniska luckan i `nodeForRaw()` (`oppBefore`/`oppAfter`) och skiljer mellan flera motståndarbud, svar efter dubbling av vår öppning, dubblerarens återbud och senare konkurrens. Giv 13 i `LOGG_BUDREGLER.md` är ett närliggande konkret exempel på 1♠–X–2♠, men inte tillräckligt för att härleda ett fullständigt regelträd. Inga grundregler eller motorgrenar har ändrats; saknade regler ska fortsatt markeras ej täckta.


## Fullständig granskning av de 47 ej täckta positionerna

Den första manuella genomgången är nu dokumenterad i fyra separata rapporter:
- `testdata/competition_audit_26.md` – 26 konkurrenspositioner och `oppBefore`/`oppAfter`-dispatch.
- `testdata/sequence_audit_10.md` – 10 sekvensluckor där partnern har passat; motorns turordningsdiagnos är missvisande eftersom pass filtreras bort från `ours`.
- `testdata/hand_gaps_9.md` – 9 svarpositioner efter partnerns inkliv/hoppande inkliv eller 2NT-inkliv; svarssystem saknas i granskade texter.
- `testdata/final_gaps_2.md` – öppnarens tredje bud efter 1♣–1♠–2♣–2NT och svar efter 1♠–2♠–3♥.

Ingen av rapporterna inför nya systemregler. De skiljer mellan teknisk dispatchlucka, missvisande diagnostext och faktiskt saknat systemunderlag. Nästa steg är att återfinna den exakta auktoritativa systemtexten för svar efter inkliv, konkurrenssekvenser och öppnarens fortsättningar innan avgränsade kodändringar görs.


## Analysbibliotekets konkurrensträd och tekniska korrigeringar

- Granskat T29–T33 i `analysbibliotek.json`. De beskriver svar efter 1♥–(1♠), 1♠–(2♥), 1♦–(1♠), 1♣–(1♥) och 1♥–(Dbl). Biblioteket saknar godkännandestatus/källfält, så träden är dokumenterat analysunderlag men inte automatiskt fastställda grundsystemregler.
- Två av de tidigare ej täckta händerna har tydliga kandidatbud i befintliga träd: `trumf-02-bid-3` passar T29:s 2♥-höjning (6 hp, 4 hjärter); `trumf-05-bid-3` passar T32:s spärrande 3♣ (4 hp, 5 klöver). De är inte införda i rättningsmotorn i väntan på auktoritetsbekräftelse.
- T33 matchar `dubbling-09-bid-3`, men handen passar inte någon av trädets listade svarstyper; pass är inte uttryckligen beskrivet.
- `analysbibliotek.json` version 0.5.5 har fått `ignorePasses:true` för T29–T33 eftersom dessa sekvenser är komprimerade och utelämnar pass. `analysmotor.js` 1.0.3 använder flaggan endast för dessa träd. Regressionstest täcker samtliga fem mönster och att vanliga träd behåller passkänslighet.
- `rattningsmotor.js` har fått en avgränsad dispatch-/diagnostikkorrigering: öppnaren som återkommer efter partnerns pass och motståndarnas inkliv klassas inte längre felaktigt som ogiltig turordning. Positionen förblir ej täckt och inget bud föreslås.
- Nya tester: `testdata/auction-dispatch.test.js` och `testdata/analysis-library-match.test.js`. Baslinjen `theme_deals_140.json`, `uncovered_cases_47.json` och analysrapporten har uppdaterats för den nya diagnostexten.

### Fortsatt prioritering
1. Få auktoritetsstatus för T29–T33 fastställd innan deras bud blir rättningsregler.
2. Definiera svar efter 2-/3-nivåinkliv och 2NT-inkliv.
3. Definiera dubblerarens återbud efter partnerns svar på upplysningsdubbling.
4. Definiera öppnarens tredje bud efter 1♣–1♠–2♣–2NT.


## Version- och CI-kontroll efter diagnostikkorrigeringen

Rättningsmotorn är nu version 6.7. `testdata/generate-theme-deals.js` är pinnad till den exakta blobben för 6.7, och samtliga 140 sparade givare anger samma motorversion. Baslinjerapporten är uppdaterad. Senaste fullständiga GitHub Actions-körning `43659958289` passerade; den verifierade reproducerbarheten och samtliga teststeg, inklusive auktionens dispatch, analysbibliotekets fem konkurrensträd, seat isolation och spelarroller.


## Strukturerade handvillkor för konkurrensanalys

Analysbibliotekets T29–T33 har nu 25 bladnoder med `handConditions` schema version 1. HCP, explicita färglängder och balanserad fördelning är maskinläsbara. Stopperkrav och oklara fritextbegrepp ligger kvar som manuell kontroll; de får inte approximeras utan godkänd definition.

`analysmotor.js` 1.0.5 kan utvärdera villkoren och koppla dem till den hand som faktiskt avgav budet i efterhandsanalysen. Denna fullhandskontroll är inte tillgänglig för spelande AI under pågående budgivning. Testfil: `testdata/hand-conditions.test.js`.


## Utökning till övriga analysbiblioteket – 33 träd

Analysbiblioteket är version 0.5.9. De befintliga `handProfile`-beskrivningarna har strukturerats för samtliga 119 noder som redan hade sådana profiler. Det ger 238 rollprofiler (öppnare och svarshand där de finns) under `handConditionsByRole`.

- 137 rollprofiler kan kontrolleras helt maskinellt utifrån de uttryckliga numeriska/fördelningsvillkor som kunde läsas ut.
- 101 rollprofiler innehåller dessutom kvalitativa, systemberoende eller ofullständigt definierade villkor och ger därför `manual_review` i stället för ett säkert automatiskt ja/nej.
- Profilerna är märkta `authority: "analysis_only"`; de blir inte grundsystemregler.
- Sex noder i T01 saknar handprofil och har lämnats orörda eftersom trädet bygger på Jacoby 2NT och är oförenligt med den fastställda Stenberg 2NT-överenskommelsen. T02, T03 och T05 har nu fått profiler direkt från sina uttryckliga trädvillkor. Ingen handinformation har hittats på.

Analysmotorn 1.0.6 väljer nu rollprofil efter vem som faktiskt avgav nodens sista bud: första budgivaren i sekvensen är `opener`, dennes partner är `responder`. Den jämför passinkluderande nodsekvenser med rätt antal icke-passbud när den hämtar den faktiska budgivarens hand. Kvalitativa alternativ, exempelvis "16–17 hp eller motsvarande goda spelvärden", kan inte felaktigt underkännas automatiskt: vid sådana profiler redovisas eventuella numeriska avvikelser men resultatet blir `manual_review`.

Nya regressionstester finns i `testdata/hand-profile-conditions.test.js` och körs i CI.


**Tillägg för T02, T03 och T05:** de fem noderna i dessa tre kompatibla träd har nu fått handprofiler direkt från trädens befintliga villkor. Ungefärliga intervall (t.ex. "cirka" och "normalt") är märkta för manuell bedömning. T01 har inte kompletterats eftersom dess Jacoby 2NT-konvention strider mot parets fastställda Stenberg 2NT.


## Fördjupad granskning av konkurrens-/försvarsluckorna

De 26 poster som i den första orsaksgrupperingen hamnade under motståndarnas bud har nu granskats mot `LOGG_BUDREGLER.md` och T29–T33. Förtydligande: 22 är egentliga konkurrens-/dubblingssituationer; fyra är försvarspass efter motståndarnas naturliga 1♣–1♠–2♣–5♣-sekvens. Rapporten `testdata/competition-gaps-26-audit.md` listar alla 26 positioner med handens HCP/fördelning och jämförelser med tidigare givexempel.

Två tydliga handbaserade kandidater finns i T29–T33: `trumf-02-bid-3` matchar T29 men har en överlappning mellan 2♥ och spärrande 3♥ vid 6 HCP/fem hjärter; `trumf-05-bid-3` matchar T32:s 3♣-profil (4 HCP/fem klöver). Båda är fortfarande `analysis_only`. `dubbling-09-bid-3` (1♥–Dbl, 2 HCP/två hjärter) saknar ett definierat passalternativ i T33. Loggens Giv 7, 10, 13, 19, 21, 22, 24 och 25 ger strukturella jämförelser men ingen komplett regelkälla för de 26 fallen. Inga budregler har ändrats.


**Ytterligare precisering av de nio senare återbuden:** åtta är återbud från den som gjort upplysningsdubblingen efter partnerns svar. `inkliv-02-bid-6` är i stället inklivarens återbud efter partnerns hoppstöd 3♥. Dessa kräver separata beslutsgrenar.
