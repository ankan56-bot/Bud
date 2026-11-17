# Baslinjerapport – 140 temagivare

## Omfattning och validering

- 14 teman × 10 givare = 140 givare.
- Samtliga givare har 52 unika kort och 13 kort per hand.
- Samtliga uppfyller generatorns temavillkor.
- Samtliga referensauktioner passerar `Rattning.validateAuction` utan strukturella fel.
- Rättningsmotor: version 8.4.
- DDS har inte körts; detta är en budgivnings-/täckningsbaslinje.
- 5 störda + 5 ostörda givare per tema där båda lägena är möjliga. Stenberg och trumfstöd är ostörda för att isolera respektive konvention; dubbling och inkliv genereras som störda.
- Givarna är reproducerbara via fasta seeds och `testdata/generate-theme-deals.js`.

## Aktuellt rättningsutfall

| Bedömning | Antal |
|---|---:|
| Rätt | 591 |
| Fel | 0 |
| Valfritt | 0 |
| Ej täckt | 38 |

De ej täckta buden är inte automatiskt felaktiga. De markerar lägen där grundsystemets nuvarande rättningsnyckel inte ger ett entydigt facit. De ska analyseras mot källsystemet innan kompletterande regler föreslås.

## Resultat per tema

| Tema | Givare | Budpositioner | Ej täckt | Fel |
|---|---:|---:|---:|---:|
| Alla slags givar | 10 | 92 | 6 | 0 |
| 1NT, Stayman och överföringar | 10 | 100 | 0 | 0 |
| Stenberg 2NT | 10 | 92 | 0 | 0 |
| 2♣-öppning | 10 | 112 | 0 | 0 |
| Essfråga (RKC) | 10 | 118 | 0 | 0 |
| Slambudgivning i färg | 10 | 89 | 2 | 0 |
| Slambudgivning i sang | 10 | 100 | 0 | 0 |
| Trumfstöd | 10 | 80 | 1 | 0 |
| Sanghänder | 10 | 84 | 0 | 0 |
| Inviter | 10 | 66 | 0 | 0 |
| Tvåfärgshänder | 10 | 96 | 5 | 0 |
| Svaga öppningar och spärrbud | 10 | 58 | 0 | 0 |
| Upplysningsdubbling | 10 | 68 | 15 | 0 |
| Inkliv och dubbling | 10 | 54 | 9 | 0 |
| **Totalt** | **140** | **1 203** | **38** | **0** |

## Tolkning av temagivarna som stresstest

Målet är att varje tema på sikt ska innehålla ungefär:
- 6–7 typiska givare som prövar normal, tydligt systemenlig budgivning.
- 3–4 gränsfall som prövar modellens förmåga att hantera svårare avvägningar, nära beslutströsklar och konkurrerande budalternativ.

Gränsfall betyder inte att systemreglerna blir flexibla eller ändras. Samma dokumenterade regler gäller i samtliga givare. Klassificeringen beskriver testets svårighetsgrad, inte en alternativ regel eller ett tillåtet regelbrott.

Klassificering ska göras per tema utifrån de faktiska beslutspunkterna i given. Exempelvis kan 1NT-temat innehålla gränsfall i svarshandens val mellan Stayman, överföring, invit och utgång även om öppningshanden alltid uppfyller det absoluta kravet 15–17 hp och balanserad. En 14-hp, 18-hp eller obalanserad 1NT-öppning ska däremot inte märkas som ett giltigt gränsfall.

I den aktuella versionen är endast 1NT-temats öppningsvillkor klassificerade maskinellt. Övriga teman är ännu `unclassified`. Vi ska inte skriva in en 7/3-fördelning som om den redan vore verifierad. Nästa steg är att granska beslutspunkterna tema för tema och välja verkliga typiska respektive gränsnära situationer.

## Analys av ej täckta budpositioner

Samtliga 38 ej täckta bedömningar ska behandlas som granskningspunkter, inte automatiskt som fel. Referensgeneratorn väljer pass när rättningsmotorn saknar ett säkert budförslag. Därför behöver dessa positioner granskas separat innan de kan användas som facit för en AI-modell.

## Viktig metodbegränsning

Referensauktionen skapas deterministiskt med befintlig rättningsmotor och träningssidan Öst/Väst-logik. Den är användbar för att hitta täckningsluckor och testa reproducerbarhet, men den är inte en oberoende expertbudgivning eller ett självständigt facit. Att rättningsmotorn godkänner ett bud i denna baslinje bevisar därför inte att motorn är strategiskt optimal.

AI-analyser som senare läggs till i analysbiblioteket ska granskas mot källsystemet och får inte behandla den genererade referensauktionen som oberoende facit. Analysen ska skilja mellan:
1. information som spelaren faktiskt hade vid budtillfället;
2. systemets dokumenterade krav och betydelser;
3. alternativa bud som var rimliga utifrån tillgänglig information;
4. efterhandsinformation från de dolda händerna och eventuell DDS-analys.

## Senaste verifiering

GitHub Actions workflow `Theme deal regression`, körning `44075222891`, för engine 8.4: **success**. Testjobbet `theme-deals` slutfördes utan fel.
