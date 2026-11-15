# Projektinventering – 2026-11-15

## Omfattning och säkerhet

Inventeringen är gjord mot GitHubs `main` vid commit `f338ee7debc13023fc5e5fc35c4ca27619d2b9d6`.
Arbetet fortsätter på den separata grenen `work/theme-dataset-analysis`. `main` har inte ändrats av detta arbete.

Den äldre grenen `feature/two-player-dds` ligger 90 commits bakom `main` och ska inte användas som bas för nya ändringar utan en separat innehållsgranskning.

## Verifierat nuläge

- `rattningsmotor.js` exporterar vid körning `Rattning.version === '6.6'`. Filhuvudets historiska ändringskommentar nämner 4.8 och är missvisande; runtime-versionen är 6.6.
- `analysmotor.js` är version 1.0.2.
- `analysbibliotek.json` är version 0.5.4 med 33 träd och 125 noder.
- De 125 noderna saknar strukturerade `handConditions`/`conditions` på nodnivå. Träd har i stället huvudsakligen fritext i `conditions`.
- `analysmotor.findMatch()` matchar budsekvensens prefix och väljer den längsta träff som passar. Den tar inte handdata som argument och verifierar därför inte nodernas handvillkor.
- `kompletterande_budlogik.json` har authority `supplementary_only`, status `initial_schema_no_approved_rules` och en tom `entries`-lista.
- `testdata/temagivare_manifest.json` beskriver 14 teman × 10 givare = 140, men samtliga teman har tomma `dealIds` och status `pending`.
- `Budtraning.html` innehåller redan temageneratorfunktioner, bland annat `biasedDeal`, `focusOk`, `newDeal` och `BudThemeDiagnostics`. Givarna skapas med seed via `mulberry(seed)`. Dessa befintliga villkor ska återanvändas eller extraheras, inte ersättas med efterhandsmärkning av slumpgivare.
- DDS-runtimefilerna finns i `dds-runtime/` (JS, WASM och binär JS). Förekomsten av filerna verifierar inte att DDS faktiskt kör i Safari.

## Regler och kända granskningspunkter

- Grundsystemet är auktoritativt. Kompletterande analys får inte skriva över rättningsmotorn.
- Fastställda utgångsgränser enligt projektbeslut: 26 hp i högfärg, 28 spelpoäng i lågfärg och 26 hp i sang utan färgfit.
- Stenberg 2NT med 13+ htp och minst fyra trumfstöd har företräde enligt tidigare beslut; Jacoby 2NT får inte oavsiktligt införas.
- RKC är 1430: 5♣ visar 1/4 och 5♦ visar 0/3 nyckelkort.
- Tidigare dokumenterade luckor omfattar bland annat svarshandens tredje bud, fortsättning efter 1NT-svar samt konkurrensbudgivning. `ANALYS_200_GIVAR.md` är en historisk täckningsinventering, inte ett uppdaterat regressionstest av nuvarande runtime-version.

## Vad som ännu inte är gjort

- De 140 temagivarna är inte genererade eller validerade.
- Ingen full regression har körts mot nuvarande `main`/runtime 6.6 i denna arbetsomgång.
- Analysbiblioteket har inte byggts om till sekvens + strukturerade handvillkor.
- DDS-körning i Safari har inte verifierats här.
- Öst/Väst-motorn har inte ändrats i denna arbetsomgång.

## Nästa tekniska steg

1. Extrahera och testa den befintliga temageneratorn i en körbar utvecklingsmodul med exakt reproducerbara seeds.
2. Generera 10 givare per tema med validering av 52 unika kort, 13 kort per hand och temavillkor.
3. Skapa ett automatiserat testflöde som kör rättningsmotorn mot givarna och redovisar rätt/fel/valfritt/ej täckt per tema och budposition.
4. Utöka analysnoder med strukturerade handvillkor och ändra matchningen så att både sekvens och relevanta handvillkor kontrolleras.
5. Först därefter föreslå regeländringar och förbättringar i Öst/Väst-motorn.

Ingen ny systemregel har införts genom denna inventering.


## Arkitekturkrav: människa i Nord, AI i Syd och Öst/Väst

Det långsiktiga spelsättet ska vara möjligt utan att bud- eller spelmotorerna byggs om:

- Nord styrs av människan.
- Syd är AI-partner till Nord.
- Öst och Väst är separata AI-motståndare.
- Varje AI-instans får endast sin egen hand, budhistoriken, sårbarhet, giv och annan information som är lagligt offentlig eller visad genom budgivningen.
- En AI-instans får aldrig läsa partnerns eller motståndarnas dolda händer. Ingen gemensam AI-kontext får innehålla alla fyra händer under pågående budgivning eller spel.
- DDS och fullständig givanalysering får använda alla fyra händer endast i en separat efterhands-/testfas, tydligt skild från spelarnas beslutsunderlag.

Tekniskt ska framtida beslutsgränssnitt ta emot en spelposition (seat) och ett explicit avgränsat informationsunderlag (knownInformation/motsvarande), inte ett objekt med samtliga händer. Budmotorn ska kunna anropas separat per position och använda samma auktoritativa systemregler, men med spelarens egen hand och lagliga budhistorik. Spelmotor och kortspels-AI ligger senare i planen; detta krav ska säkras i datamodell och API redan nu.

Detta är ett arkitekturkrav, inte ett påstående om att tvåspelar-/fyrspelar-AI redan är implementerad eller testad.


## Genomfört efter inventeringen

- Dokumenterat arkitekturkravet för människa i Nord och separata AI-agenter i Syd, Öst och Väst i både denna statusrapport och utvecklingsplanen.
- Lagt till `seat-view.js` som en första informationsgräns för framtida AI-agenter. Funktionen bygger en fristående, djupt fryst vy med endast vald spelares hand, budhistorik, giv, sårbarhet, system och uttryckligen tillförd offentlig information. Den returnerar inte hela `hands`-objektet.
- Lagt till `testdata/seat-view.test.js`. Fyra Node-tester har körts lokalt och passerat: endast egen hand exponeras, datan kopieras och fryses, ogiltig position/hand avvisas och endast uttryckligen tillförd offentlig information skickas vidare.

Begränsning: detta är en isolerad byggsten, ännu inte inkopplad i en AI-budgivare eller spelmotor. Anroparen måste konstruera `publicState` enbart av lagligt offentlig information. Temagivarna 140 st är fortfarande inte genererade; nästa arbetsblock är att göra den befintliga webbgeneratorn körbar i en testmiljö och därefter generera och validera givarna.


## Temagivare – första reproducerbara baslinjen

- `testdata/theme_deals_140.json` innehåller nu 140 givare: 10 för vart och ett av de 14 temana.
- Givarna genererades med den befintliga `newDeal`/`biasedDeal`-logiken i `Budtraning.html`, inte med en separat approximativ generator. Seeds är fasta och dokumenterade i datasetet och manifestet.
- För teman där båda lägena är möjliga används 5 störda och 5 ostörda givare. Dubbling och inkliv är störda enligt temats befintliga generator.
- Samtliga 140 har 52 unika kort, 13 kort per hand, godkänt temavillkor och referensauktioner utan strukturella fel enligt `Rattning.validateAuction`.
- Rättningsmotorn 6.6 bedömde 630 relevanta Nord/Syd-bud i korrigerade referensauktioner: 583 rätt, 47 ej täckta, 0 fel och 0 valfria.
- De 47 ej täckta fördelas: alla 6, Stenberg 2, slambudgivning i färg 2, trumfstöd 6, tvåfärgshänder 6, dubbling 15 och inkliv 10. Övriga teman hade 0.
- `testdata/theme_deals_140_report.md` redovisar resultatet per tema. `testdata/generate-theme-deals.js` är en Node-generator som läser den faktiska HTML-generatorn och rättningsmotorn. `testdata/theme-deals.test.js` testar antal, kortintegritet, auktioner och reproducerbarhet.
- En GitHub Actions-workflow har lagts till för att regenerera datasetet och köra testerna på push/PR. GitHub Actions körning 43658747827 slutfördes med success: regenerering, oförändrat dataset och samtliga dataset-/reproducerbarhetstester passerade. Test för AI-positionernas informationsgräns läggs också in i workflowet.

Viktig begränsning: referensauktionerna är deterministiska täckningsspår byggda från befintlig rättningsmotor och träningssidans Öst/Väst-logik. De är inte oberoende expertbud eller ett självständigt strategiskt facit. Alla givars typklass är `unclassified`; 7 typiska/3 gränsnära ska inte påstås förrän manuell/regelbaserad klassificering har gjorts. DDS har inte körts.


## Korrigering av referensauktionernas läge

Den första exporterade baslinjen använde störd Öst/Väst-bot även på givarna märkta ostörd. GitHub Actions upptäckte att regenerering gav avvikande budsekvenser. Generatorn har korrigerats så att referensauktionen använder varje givs faktiska läge. Den korrigerade baslinjen har därför 583 rätt och 47 ej täckta (i stället för den preliminära 578/49). Korrigerad dataset, rapport och lista över ej täckta positioner är uppdaterade. Korrigeringen verifierades av GitHub Actions körning 43658747827 (success).


## Analys av täckningsluckorna

`testdata/uncovered_analysis_47.md` grupperar de 47 ej täckta positionerna och prioriterar nästa granskning. 26 gäller konkurrensbudgivning; dessutom förekommer dubbling i totalt 16 av de 47 ej täckta positionerna, uppdelade i tre svar efter motståndarens dubbling av öppningen, åtta återbud från dubbleraren, två fortsättningar efter ny motståndarinblandning och tre övriga passpositioner, 10 gäller sekvens-/turordningsmönster, 9 saknar specificerat bud för handen, 1 gäller svarshandens andra bud och 1 är uttryckligen osäker. Alla 47 är pass i referensauktionen eftersom generatorn väljer pass när motorn saknar ett säkert förslag; de är inte facit för att pass är korrekt.

Jämförbara dokumenterade exempel finns i `LOGG_BUDREGLER.md` (bl.a. Giv 7, 10, 13, 19, 21, 22, 24 och 25). De ska granskas hand för hand innan regler ändras. Ingen ny systemregel eller kompletterande regel har lagts till.

GitHub Actions körning `43658789320` passerade med success inklusive regenerering, oförändrat dataset, dataset-/reproducerbarhetstester och AI seat isolation-tester.


## Skärpt informationsgräns för AI-positioner

`seat-view.js` är nu version 0.2.0. Den tillåter endast en uttrycklig lista av offentliga spelfält i `publicState`, avvisar okända fält och blockerar dolda hand-/seat-mappar även nästlade. Dummy får bara skickas när `dummyExposed: true`. Testfilen innehåller sex tester för egen hand, kopiering/frysning, avvisade dolda händer, dummygränsen och ogiltiga positioner. Ändringen är fortfarande en fristående byggsten och ännu inte inkopplad i en spelande agent.


Senaste verifiering av informationsgränsen: GitHub Actions körning `43658949390` passerade efter att `seat-view.js` blockerar även nästlade seat-keyed handobjekt. Både dataset-/reproducerbarhetstester och samtliga AI seat isolation-tester passerade.


## Spelarroller – arkitekturgrund

- `player-roles.js` version 1.0.0 definierar standarduppställningen Nord människa, Syd AI-partner, Öst/Väst AI-motståndare. Roller kan överskrivas per position.
- `seat-view.js` version 0.2.0 ger en AI-position endast egen hand och tillåten offentlig information; okända fält och dolda hand-/seat-mappar avvisas. Dummy kräver `dummyExposed: true`.
- Automatiska tester finns i `testdata/player-roles.test.js` och `testdata/seat-view.test.js`. GitHub Actions kör nu båda dessa utöver temagivartesterna.
- Ingen spelmotor eller AI-budgivare är ännu inkopplad. Detta säkrar gränssnittet som senare agentkod ska använda.


## Senaste fortsättning: konkurrensbudgivning

- GitHub Actions körning `43659094671` slutfördes med `success` på commit `1696fb6a4aae0a6615f4835c6235bee6e0fcc0b3`.
- `testdata/competition_audit_26.md` dokumenterar 26 ej täckta konkurrenspositioner med budsekvens, position, HCP och fördelning.
- Kodgranskningen visar att `nodeForRaw()` har begränsad hantering av `oppBefore` och `oppAfter`; efter konkurrensbud går många legitima fortsättningar till generisk ej täckt. Det är en täckningsbegränsning, inte belägg för att pass är fel.
- Giv 13 i `LOGG_BUDREGLER.md` är ett närliggande exempel (1♠–X–2♠), men tillgängligt underlag fastställer inte ett helt system för svar/återbud efter dubbling.
- Ingen budregel eller rättningskod ändrades. Nästa steg är att få fram/återfinna uttryckligt systemunderlag för dessa separata situationer innan implementation.


## Fullständig första granskning av 47 ej täckta positioner

- 26 konkurrenspositioner: `testdata/competition_audit_26.md`.
- 10 sekvenspositioner: `testdata/sequence_audit_10.md`. Samtliga är pass efter partnerns pass; koden filtrerar bort pass ur listan över egna bud och ger därför en missvisande diagnos om turordning. Detta visar inte om pass är korrekt.
- 9 handspecifika positioner: `testdata/hand_gaps_9.md`. De gäller svar efter partnerns färginkliv/hoppinkliv eller 2NT-inkliv; systemet anger inklivens krav men inte tillräckligt om svaren.
- 2 övriga positioner: `testdata/final_gaps_2.md`. Den första felklassificeras som svarshandens andra bud trots att det är öppnarens tredje bud; den andra gäller svar efter öppnarens 1♠–2♠–3♥.
- Totalt: 47/47 genomgångna på sekvensnivå, handens HCP och fördelning samt kodens dispatch. Detta är inte en oberoende expertgranskning av bästa bud eller DDS-facit.
- Ingen grundsystemregel, kompletterande regel eller rättningskod ändrades. `main` är fortfarande orörd.


## Fortsättning 2026-11-15 – analysbibliotek och diagnostik

- Granskat T29–T33 i analysbiblioteket. Två av de 47 luckorna har starka kandidatbud från dessa befintliga träd: 2♥ i `trumf-02-bid-3` och spärrande 3♣ i `trumf-05-bid-3`. De är inte införda som rättningsregler eftersom träden saknar uttrycklig godkännandestatus. `dubbling-09-bid-3` matchar T33 men handprofilen täcker inte handen.
- Analysbibliotekets T29–T33 utelämnar pass i sina komprimerade sekvenser. Matchningen var tidigare ordagrann och missade därför normala auktioner med passrundor. Metadata `ignorePasses:true` har lagts till endast för dessa fem träd; `analysmotor.js` version 1.0.3 använder flaggan. Alla fem sekvensmönster testas.
- Korrigerat ett verkligt diagnostikfel i `rattningsmotor.js`: giltiga återbud från öppnaren efter partnerns pass och motståndarnas inkliv kallades tidigare felaktigt turordningsfel. De är nu tydligt ej täckta utan att motorn hittar på ett bud.
- Nya tester: `auction-dispatch.test.js` och `analysis-library-match.test.js`. GitHub Actions körning `43659839449` passerade med alla testgrupper: dataset/reproducerbarhet, dispatch, analysbiblioteksmatchning, AI-informationsgräns och spelarroller.
- Generatorns reproducerbara baslinje är uppdaterad med den nya diagnostexten. Antalet ej täckta positioner är fortfarande 47; det här var en klassificeringskorrigering, inte en ökning eller minskning av budtäckningen.
- Inga nya grundsystemregler har införts. `main` är orörd.
