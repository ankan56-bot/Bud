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
