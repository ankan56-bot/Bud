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

`testdata/uncovered_analysis_47.md` grupperar de 47 ej täckta positionerna och prioriterar nästa granskning. 26 gäller konkurrensbudgivning (13 med dubbling i sekvensen, 9 annan motståndarinblandning och 4 flera motståndarbud), 10 gäller sekvens-/turordningsmönster, 9 saknar specificerat bud för handen, 1 gäller svarshandens andra bud och 1 är uttryckligen osäker. Alla 47 är pass i referensauktionen eftersom generatorn väljer pass när motorn saknar ett säkert förslag; de är inte facit för att pass är korrekt.

Jämförbara dokumenterade exempel finns i `LOGG_BUDREGLER.md` (bl.a. Giv 7, 10, 13, 19, 21, 22, 24 och 25). De ska granskas hand för hand innan regler ändras. Ingen ny systemregel eller kompletterande regel har lagts till.

GitHub Actions körning `43658789320` passerade med success inklusive regenerering, oförändrat dataset, dataset-/reproducerbarhetstester och AI seat isolation-tester.
