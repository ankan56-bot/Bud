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


## Slutlig verifiering av denna arbetsomgång

- `rattningsmotor.js` version 6.7: den nya diagnostiken för öppnarens återbud efter partnerns pass är versionssatt.
- Generatorn `testdata/generate-theme-deals.js` är pinnad till exakt rättningsmotor-blob `76d57bacb0cc63a07d45f65ef55bd58a2f3b62c4` och förväntar version 6.7.
- Alla 140 sparade givare har `correction.version: 6.7`; `theme_deals_140_report.md` anger samma version.
- Senaste fullständiga GitHub Actions-körning `43659958289` är `success`. Reproducerbarhetsdiffen är ren och workflow-jobbet passerade samtliga teststeg.
- Analysbiblioteket är version 0.5.5 och analysmotorn 1.0.3. T29–T33 matchar nu sina komprimerade sekvenser även när lagliga passrundor förekommer.
- `main` är fortfarande orörd. Arbetsgrenen ligger 80 commits före `main` och 0 bakom.


## Strukturerade handvillkor – senaste implementation

- `analysbibliotek.json` version 0.5.6: schema version 1 och 25 strukturerade handprofiler på bladnoderna i T29–T33.
- `analysmotor.js` version 1.0.5: HCP-, färglängds- och balanseradhetskontroll, validering av 13 unika kort och tre resultatnivåer: match, no_match, manual_review.
- Stopperkrav och oklara uttryck som "begränsat stöd" markeras för manuell kontroll; inga antagna definitioner.
- Efterhandsanalysen kan kontrollera budgivarens faktiska hand mot noden. Detta får inte användas av AI under pågående budgivning; seat-view-gränsen gäller fortsatt.
- Nya regressionstester i `testdata/hand-conditions.test.js`.
- GitHub Actions körning `43660192227` passerade på commit `09bab5a909dfacce5f65b15825b682e8617089f2`; alla fem handvillkorstester passerade och övriga dataset-, analys-, AI-seat- och rolltester passerade. Dokumentationskörning `43660201574` passerade också. `main` är orörd.


## Utökade strukturerade handprofiler

- `analysbibliotek.json` 0.5.9: 119 noder med tidigare handProfile-text strukturerade till 228 `handConditionsByRole`-profiler. 134 är fullt maskinellt kontrollerbara; 94 kräver även manuell bedömning. Alla är `analysis_only`.
- 11 noder utan ursprunglig handprofil har lämnats orörda.
- `analysmotor.js` 1.0.6: väljer öppnar-/svarshandsprofil efter faktisk budgivare och hanterar pass i sekvensen korrekt. Kvalitativa alternativ leder till `manual_review`, inte falsk automatisk underkänning.
- Nya tester: `testdata/hand-profile-conditions.test.js`; workflow-steget är tillagt.
- GitHub Actions för senaste ändringar inväntas.


## Slutlig täckning i denna etapp

`analysbibliotek.json` är version 0.5.11 med 119 av 125 noder strukturerade (238 rollprofiler). 137 profiler är fullt maskinellt kontrollerbara och 101 kräver också manuell bedömning. De sex kvarvarande noderna tillhör T01, som avsiktligt är inkompatibelt eftersom det bygger på Jacoby 2NT i stället för fastställd Stenberg 2NT. T02, T03 och T05 fick profiler från uttryckliga källvillkor. `analysmotor.js` är version 1.0.6. Nya profiltäckningstester 6/6 passerade i GitHub Actions körning 43660594300; den körningen innehåller även de övriga workflow-testerna.


## Fördjupad granskning av konkurrens-/försvarsluckorna

De 26 poster som i den första orsaksgrupperingen hamnade under motståndarnas bud har nu granskats mot `LOGG_BUDREGLER.md` och T29–T33. Förtydligande: 22 är egentliga konkurrens-/dubblingssituationer; fyra är försvarspass efter motståndarnas naturliga 1♣–1♠–2♣–5♣-sekvens. Rapporten `testdata/competition-gaps-26-audit.md` listar alla 26 positioner med handens HCP/fördelning och jämförelser med tidigare givexempel.

Två tydliga handbaserade kandidater finns i T29–T33: `trumf-02-bid-3` matchar T29 men har en överlappning mellan 2♥ och spärrande 3♥ vid 6 HCP/fem hjärter; `trumf-05-bid-3` matchar T32:s 3♣-profil (4 HCP/fem klöver). Båda är fortfarande `analysis_only`. `dubbling-09-bid-3` (1♥–Dbl, 2 HCP/två hjärter) saknar ett definierat passalternativ i T33. Loggens Giv 7, 10, 13, 19, 21, 22, 24 och 25 ger strukturella jämförelser men ingen komplett regelkälla för de 26 fallen. Inga budregler har ändrats.


**Ytterligare precisering av de nio senare återbuden:** åtta är återbud från den som gjort upplysningsdubblingen efter partnerns svar. `inkliv-02-bid-6` är i stället inklivarens återbud efter partnerns hoppstöd 3♥. Dessa kräver separata beslutsgrenar.


## Separat inventering av återbud efter upplysningsdubbling

Åtta fall där dubbleraren ska återkomma efter partnerns svar har fått en egen hand-/auktionsinventering i `testdata/double-rebid-8-audit.md`. Dubblerarens styrka varierar 12–19 HCP, partnerns 3–9 HCP och partnerns svarsfärger varierar. Loggens Giv 13 och 22 handlar om andra situationer och ger inte den saknade återbudsregeln. `inkliv-02-bid-6` har särskilts som ett nionde fall i den bredare gruppen: naturligt 1♥-inkliv följt av partnerns 3♥-hoppstöd, inte en upplysningsdubbling. Ingen regel eller rekommendation har lagts till.


## Samlad dokumentation för de 47 täckningsluckorna

Fördjupade delgranskningar finns nu:
- `testdata/competition-gaps-26-audit.md` – 26 positioner där motståndarnas bud påverkar beslutet eller där vi försvarar mot deras naturliga budsekvens. Förtydligar att 22 är egentliga konkurrens-/dubblingssituationer och fyra är försvarspass efter naturlig öppning/svar.
- `testdata/opener-rebid-after-pass-10-audit.md` – tio återbudslägen för öppnaren efter partnerns pass och motståndarnas inkliv.
- `testdata/hand-specific-overcall-responses-9-audit.md` – nio svar på partnerns egna inkliv, uppdelade efter 1-, 2-, 3-nivå och 2NT.
- `testdata/double-rebid-8-audit.md` – åtta återbud efter partnerns svar på upplysningsdubbling.

`inkliv-02-bid-6` är en separat nionde senare återbudsposition: naturligt inkliv följt av partnerns hoppstöd 3♥. Den ska inte blandas ihop med upplysningsdubbling.

Samtliga fyra nya delgranskningar har verifierats i GitHub Actions utan testfel. De är analysdokumentation; ingen av de 47 positionerna har omklassificerats och ingen ny systemregel har lagts till.


## Aktuellt verifierat läge – engine 7.0 och uppdaterad temabaslinje

Den tidigare inventeringen och 47-fallsanalysen ovan är historiska ögonblicksbilder. Efter att splinter-/singelvisande återbudsgrenar tagits bort enligt parets beslut har temagivarna genererats om och den aktuella baslinjen omfattar nu 44 ej täckta positioner.

- `rattningsmotor.js` version 7.0: splinter och singelvisande återbud efter enkel höjning är borttagna. Naturlig invit i öppnarens trumffärg används i stället.
- `testdata/theme_deals_140.json`: 140 givare, 589 rätt, 0 fel, 0 valfria och 44 ej täckta. Alla givare har 52 unika kort, 13 kort per hand och strukturellt giltiga auktioner.
- `analysbibliotek.json` version 0.5.11: 119 av 125 noder har rollbaserade strukturerade handprofiler, 238 rollprofiler totalt. 137 är fullt maskinellt kontrollerbara och 101 kräver även manuell bedömning. Alla är analysunderlag, inte automatiskt grundregler.
- `analysmotor.js` version 1.0.6: väljer handprofil efter faktisk budgivarroll och markerar kvalitativa villkor för manuell bedömning.
- De aktuella 44 luckorna fördelas på 25 konkurrens-/försvarsfall, 9 öppnaråterbud efter partnerns pass, 9 svar på partnerns inkliv och 1 öppnarens tredje bud efter svarshandens andra bud.
- Den tidigare osäkra splinterpositionen `trumf-04-bid-7` är nu täckt: öppnaren bjuder 3♠ naturlig invit och svarshandens pass bedöms som rätt.
- Diagnosen för `alla-01-bid-9` är korrigerad: det är öppnarens tredje bud, inte svarshandens andra bud. Positionen förblir ej täckt.
- 16 av de 44 kvarvarande positionerna har dubbling i sekvensen. Åtta är dubblerarens återbud efter partnerns svar; en annan position gäller naturlig inklivare efter partnerns hoppstöd.
- GitHub Actions har passerat på engine 7.0-baslinjen, inklusive dataset/reproducerbarhet, auktion-dispatch, analysbiblioteksmatchning, strukturerade handvillkor/profiler, AI-seat-isolering och rolltester. Senast bekräftade kompletta körning: `43661555698`.

`main` är fortsatt orörd. Arbetet ligger på `work/theme-dataset-analysis`. DDS har inte använts som budfacit och Safari-körning har inte verifierats.


## DDS – verifierad paketering, ej verifierad körning i webbläsare

- `dds-runtime/dds_web_wasm.wasm` kompileras i Node-testet och exporterar de förväntade funktionerna `dds_web_calc_table`, `dds_web_solve_plays` och `dds_web_solve_leads` samt minnesfunktionerna.
- `testdata/dds-runtime.test.js` kontrollerar binärfilens giltighet, exports och att `dds-integration.js`, `Budtraning.html` och `coi-serviceworker.js` är sammankopplade med rätt API och Cross-Origin-Isolation-krav.
- Detta är ett statiskt paketerings-/integrationsprov. Ett försök att köra den trådade DDS-motorn direkt i Node fastnade och har därför inte räknats som verifiering av solverns körning.
- Faktisk DDS-beräkning i Safari/GitHub Pages är fortfarande inte verifierad. Ingen DDS-resultatdata har använts som budfacit.
- Det statiska DDS-testet passerade i GitHub Actions körning `43662387692`.


## Källstyrd regeländring – 2026-11-15 (engine 7.3)

Originaldokumentet `Nordisk standard, 2012-08-22` (8 sidor, tidigare uppladdat i ChatGPT Library) har nu lästs. Källgranskningen finns i `testdata/system-rule-source-audit_2026-11-15.md`.

**Implementerat:** svar efter partnerns 1-högfärgs-/1-ruterinkliv enligt tabellen på sida 7:
- 1NT 8–10 hp, balanserad med håll.
- 2NT 11–13 hp, balanserad med bra håll.
- 3NT 14+ hp, balanserad med bra håll.
- Enkel/dubbel/trippel höjning med 6–9 hp och 3/4/5-kortsstöd.
- Ny färg: 8+ hp på 1-nivån, 10+ hp på 2-nivån, 5+ kort och rondkrav.
- Hopp i ny färg: 14+ hp, bra 6+ färg, utgångskrav.
- Överbud: 10+ hp och 3+ stöd.

Andra inklivsnivåer är uttryckligen avgränsade och får inte automatiskt använda samma tabell. Hoppande 2-högfärgsinkliv hänvisas i källan till svag-två-strukturen, men gränsen mellan invit och spärrhöjning är inte numeriskt definierad. 2-lägesinkliv i lågfärg, hoppande 3-nivåinkliv och 2NT-inkliv är därför fortsatt ej täckta.

**Regression:**
- Nya testfiler: `testdata/overcall-responses.test.js` och `testdata/unresolved-system-gaps.test.js`; de åtta återbuden testas fortsatt som ej täckta, och 18+-betydelsen utan stöd testas separat.
- Verifierar stöd 3/4/5 kort, NT-intervall, ny färg på 1-/2-nivå, hoppande ny färg, överbud och att andra inklivsnivåer inte ärver tabellen.
- Exakt tidigare lucka `inkliv-05`: 8 hp och fem hjärter efter partnerns 1♥ ger nu 4♥.
- Ett tidigare för lågt stödbud med 4 hp och fyrkortsstöd har tagits bort; källan anger 6–9 hp.

**Ny temabaslinje engine 7.3:**
- 140 reproducerbara givare.
- 590 rätt, 0 fel, 0 valfria, 43 ej täckta.
- Inklivstemat har 9 ej täckta positioner i stället för 10.
- `testdata/theme_deals_140.json` är regenererad med engine 7.3; generatorn registrerar nu exakt Git-blob-hash för den använda motorn.
- `testdata/theme_deals_140_report.md` uppdaterad.

GitHub Actions körning `43665028981` godkände samtliga steg: deterministisk generering, datasettest, auktion-dispatch, ny inklivstestsvit, analysbibliotek, strukturerade handvillkor/profiler, spelarroller, seat-isolering och DDS-paketering.

**Fortfarande ej ändrat:**
- Åtta återbud från den som gjort upplysningsdubblingen efter partnerns svar. Sida 8 ger dubblarens grundstyrka och partnerns första svar, men ingen återbudsstruktur för de aktuella händerna. Motorn visar nu den separata betydelsen 18+ hp när dubblaren saknar stöd och återbjuder egen färg/NT, men väljer inget bud.
- Öppnarens tredje bud efter 1♣–1♠–2♣–2NT. Det närliggande exemplet på sida 3 gäller en annan sekvens och har dessutom en motsägelsefull förklaring för 3♥.
- DDS har inte använts som budfacit.

`main` är fortsatt orörd. Allt arbete ligger på `work/theme-dataset-analysis`.

- För hoppande 2-högfärgsinkliv hänvisar sida 7 till svag-två-strukturen. 3 i öppningsfärgen är spärrhöjning med 3+ stöd, inte invit – detta stämmer även med användarens uttryckliga korrigering 2026-11-12. 2NT är invit med 2+ stöd. Motorn visar nu dessa betydelser samt ny färg/3NT/hopp som betydelser, men väljer inget huvudbud eftersom källan saknar numerisk styrkegräns och prioritering.

## Aktuellt verifierat läge – engine 8.3 (2026-11-15)

### Korrigering av poängvärdering
- Partnerskapets gemensamma trumflängdsbonus följer användarens fastställda regel: 9 gemensamma trumf ger +1; 10 eller fler ger +3. Den tidigare noteringen om +2 vid 10+ var felaktig och ska inte användas.
- Bonusen läggs till först vid minst 8 gemensamma trumf. Fördelnings-/stödpoäng räknas separat för båda händerna och endast en gång per hand. Sang värderas med honnörspoäng utan trumfbonus.
- Reverse kräver 18+ honnörspoäng och minst 5-4-fördelning enligt källtexten. Stödpoäng från en obekräftad fyrkortsfärg får inte användas för att nå 18-gränsen.
- HTP som visas för en hand är villkorad av relevant trumfstöd/fit, egen 6+ färg eller 5-5. Vid Stenberg 2NT visas svarshandens HTP i öppningsfärgen, men endast i ostörd sekvens.

### Stenberg – källregler och korrigering
- Svarshandens 2NT kräver minst 13 HTP och minst 4 trumfkort.
- Öppnarens återbud efter Stenberg: singel visas på 3-nivån; 15+ HTP utan singel visar extra styrka med 3 i trumffärgen; 12-14 HCP med balanserad hand visar 3NT.
- Koden hade tidigare en felaktig gräns på 16+ och prioriterade stark HTP före singleton. Detta är rättat till 15+ och singleton prioriteras enligt systemtexten.
- Regressioner testar 13+ HTP i svarshanden, visad HTP, 15+ utan singel, singleton före styrkebud och 12-14 balanserad 3NT.

### Temabaslinje och CI
- rattningsmotor.js är version 8.3.
- temagivare_manifest.json och theme_deals_140.json är synkroniserade med exakt engine-blob.
- Datasetet innehåller 140 reproducerbara givare, 591 rätt, 38 ej täckta, 0 fel och 0 valfria. Stenbergtemat har 0 ej täckta positioner; RKC-temat 0 ej täckta.
- Full GitHub Actions-körning 43698112340 slutfördes med success: deterministisk regenerering, dataset/reproducerbarhet, auktion-dispatch, inklivssvar, luckskydd, analysbiblioteksmatchning, strukturerade handvillkor/profiler, AI-seat-isolering, spelarroller, RKC och DDS-paketering.
- Workflowen använder nu engine-versionen automatiskt i baslinjens commitmeddelande och separerar concurrency per commit-SHA för att undvika att en fastnad körning blockerar ny verifiering.
- Den verifierade baslinjen är committad av CI som f69c218 (Update theme deal baseline for correction engine 8.3).

### Kvarstående avgränsningar
- Temagivarnas 7 typiska/3 gränsnära klassificering är ännu inte genomförd för samtliga teman. De ska inte märkas som typiska/gränsnära utan verifierbara beslutströsklar.
- De 38 ej täckta budpositionerna är inte automatiskt felaktiga bud; luckorna kräver fortsatt källgranskning innan nya regler införs.
- DDS-paketeringen är testad i CI, men faktisk DDS-beräkning i Safari är fortfarande inte verifierad. DDS används inte som budfacit.
- Den långsiktiga arkitekturen människa i Nord, AI i Syd och separata AI i Öst/Väst är fortsatt ett krav; den fullständiga spelande AI:n är inte färdig.

main är fortsatt orörd. Allt arbete ligger på work/theme-dataset-analysis.


## 1-färgsöppning – 1NT-svar till utgång (engine 8.4, 2026-11-17)

### Källgranskning och omfattning
- Källan är **Nordisk standard 2012-08-22, sida 3**. Ingen webbsökning har använts.
- Arbetet omfattar sekvensen 1 i färg–1NT och fortsättningen fram till delkontrakt eller utgång. Slamsekvenser ingår inte.
- Högfärgsöppningarna 1♥/1♠ och lågfärgsöppningen 1♦ har separata regressionsfall. 1♣–1NT verkar inte kunna uppstå naturligt med nuvarande svarstabell: en fyrkortsfärg kan visas på 1-nivån eller som klöverstöd. Detta ligger kvar som kontrollfråga i loggen, inte som en ny fastslagen systemregel.

### Implementerat / korrigerat
- Balanserad öppningshand 12–14 hp passar efter svarshandens 1NT.
- Balanserad öppningshand 18–19 hp återbjuder 2NT.
- Efter 2NT-inviten går svarshanden till 3NT vid minst 26 gemensamma honnörspoäng. Med minst 8-korts högfärgsfit och 26+ gemensamma spelpoäng väljs 4♥/4♠. Under gränsen passas. Detta använder våra redan fastställda utgångsgränser och stannar vid utgång.
- Öppnarens egen 6+ färg utan sidofärg räknas nu med HTP, inte enbart hp: 12–16 HTP på lägsta nivå, 17–19 HTP med enkelhopp. Detta rättar en tidigare avvikelse mellan källtabellen och kodens poängmått.
- Svarshandens undantag efter 1NT är korrigerat: 6–9 hp och 6+ egen färg får återbjudas på lägsta lagliga nivå utan krav. Det kan vara 2-nivån för en ny färg; öppningsfärgen återbjuds på 3-nivån.
- Befintliga regler för tvåfärgshand, andra färgen och reverse ligger kvar. Inga nya systemregler har lagts till för sekvenser där PDF:en inte ger stöd.

### Test och verifiering
- Ny testfil: `testdata/one-one-notrump.test.js` med 7 regressionsfall.
- Testar 1♦–1NT–2NT–3NT, 1♥/1♠ med högfärgsfit till utgång, avslag på invit under 26, 6+ lågfärg med HTP-gräns, samt 6–9 hp/6+ färg på lägsta lagliga nivå.
- Särskild kontroll säkerställer att grenen inte rekommenderar slam.
- GitHub Actions `Theme deal regression`, körning `44075488456`: **success**. Dataset/reproducerbarhet, auktion-dispatch, den nya 1–1NT-sviten, inklivssvar, luckskydd, analysbibliotek, handvillkor, handprofiler, AI-seat-isolering, spelarroller, RKC och DDS-paketering passerade.
- Rättningsmotor: version 8.4. Baslinjen är regenererad och committad av CI som `f8d314e`.
- Uppdaterad baslinje: 140 givare, 591 rätt, 0 fel, 0 valfria och 38 ej täckta. Rapporten finns i `testdata/theme_deals_140_report.md`.

### Kvarstående frågor – inte påhittade regler
- Öppnarens tredje bud efter svarshandens 6–9 hp/6+ färgåterbud är inte fullständigt beskrivet i källan.
- Svarshandens andra bud med 10 hp efter öppnarens färgåterbud saknar tydlig separat regel.
- 20+ HTP med egen 6+ lågfärg utan sidofärg behöver expertkontroll innan ett bestämt slutbud väljs.
- 1♣–1NT-sekvensens eventuella möjlighet behöver bekräftas mot hela svarssystemet.

Frågorna är sparade i `LOGG_BUDREGLER.md`. Luckorna ska fortsätta markeras som ej täckta och får inte automatiskt ersättas med AI-antaganden.

main är fortsatt orörd. Allt arbete ligger på `work/theme-dataset-analysis`.


## Svaga tvåöppningar – första implementationen 2026-11-17

- Arbetet är avgränsat till ostörd budgivning efter 2♦, 2♥ och 2♠. Störd budgivning, inkliv och dubbling har inte påbörjats.
- Underlaget som fanns i arbetsgrenen var den inbäddade Nordisk Standard-texten i `Budtraning.html`. Ingen Nordisk Standard-PDF fanns i den aktuella grenen; inga externa webbkällor har använts.
- Rättningsmotor 8.5 korrigerar svarshandens 3-höjning till spärrhöjning med minst 3 stödkort (inte invit), och kräver minst 2 stödkort för 2NT-invit med 9–10 hp.
- Svaga öppningar 2♦/2♥/2♠ testas för 6–10 hp, exakt sex kort och god färgkvalitet. 2♣ är fortsatt starköppning.
- Regressionstest `testdata/weak-two.test.js`: 6/6 tester passerade. Hela GitHub Actions-körningen `44096230036` passerade samtliga teststeg.
- Den reproducerbara baslinjen med motor 8.5 uppdaterades: 140 givare, 592 rätt, 38 ej täckta, 0 fel. DDS har inte körts.
- Kvarvarande svag-två-grenar finns i `testdata/weak-two-audit.md` och ska förbli ej täckta tills exakt budbetydelse och handvillkor har verifierats. Särskilt gäller det ny färg, direkta 3NT-svar, renons-/slaminvit och fortsättningar efter öppnarens min/max-besked.
- Modulen är därför inte färdigförklarad ännu. Nästa steg är att slutföra och testa de återstående ostörda grenarna innan 3- och 4-öppningar eller störd budgivning tas upp.


## Korrigerad PDF-verifiering – svaga tvåöppningar 2026-11-17

Den fullständiga `nordisk_standard.pdf` (2012-08-22) återfanns i ChatGPT-biblioteket. PDF sida 4 har nu använts direkt och ersätter den tidigare preliminära läsningen av den inbäddade HTML-sammanfattningen.

- 2NT-inviten efter svag tvåa kräver minst 2 stödkort. PDF:en anger inget exakt hp-intervall för svarshanden; den tidigare 9–10 hp-gränsen på svarshanden är borttagen.
- 6–8 hp (minimum) och 9–10 hp (maximum) gäller öppnarens ombud efter 2NT.
- Maximum visas med 3NT/4 högfärg; efter 2 lå visas 3NT, inte 4 lå.
- Ny färg 5+ är krav till minst 3 i öppningsfärgen. Hopp i ny färg visar renons och är slaminvit. 3NT är slutbud. 3 i öppningsfärgen är spärrhöjning med 3+ stöd, ej invit.
- Rättningsmotor 8.6 implementerar dessa källregler. Regressionerna har utökats; resultat inväntas i GitHub Actions.
- Fortsättningar som PDF:en inte definierar är kvar i expertloggen. Störd budgivning är fortfarande pausad.
