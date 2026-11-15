# Granskning av analysbibliotekets konkurrensträd T29–T33

## Syfte och avgränsning

Analysbiblioteket `analysbibliotek.json` version 0.5.5 innehåller fem träd för svar efter motståndarnas inkliv eller dubbling:

| Träd | Sekvens | Dokumenterat innehåll |
|---|---|---|
| T29 | 1♥ – (1♠) | 2♥ enkel höjning, 2♠ stödvisande cue-bid, 3♥ spärrande hoppstöd, 1NT med spaderhåll, 2♦ naturligt |
| T30 | 1♠ – (2♥) | 2♠ enkel höjning, 3♥ cue-bid, 3♠ spärrande hoppstöd, 2NT med hjärterhåll, 3♣ naturligt |
| T31 | 1♦ – (1♠) | 2♦ enkel höjning, 2♠ cue-bid, 3♦ spärrande hoppstöd, 1NT med spaderhåll, 2♣ naturligt |
| T32 | 1♣ – (1♥) | 2♣ enkel höjning, 2♥ cue-bid, 3♣ spärrande hoppstöd, 1♠ naturligt, 1NT med hjärterhåll |
| T33 | 1♥ – (Dbl) | Redubbling med 10+ hp, 2♥ enkel höjning, 3♥ spärrande hoppstöd, 1♠ naturligt, 1NT utan hjärterfit |

Träden är tydligt formulerade som paröverenskommelser, men biblioteket saknar fält för källa, godkännandestatus och auktoritet. De är därför **befintligt dokumenterat analysunderlag**, inte automatiskt bekräftade grundsystemregler. Deras handprofiler är dessutom fritext; analysmotorn kan inte maskinellt avgöra om en viss hand uppfyller villkoren.

## Matchning mot de 47 ej täckta positionerna

Tre av de 47 positionerna har en exakt sekvensmotsvarighet i T29–T33:

1. `trumf-02-bid-3`: 1♥–(1♠). Handen har 6 hp och fyra hjärter. T29 anger 2♥ med minst tre hjärter och cirka 6–9 hp. Detta är en stark kandidat till 2♥.
2. `trumf-05-bid-3`: 1♣–(1♥). Handen har 4 hp och fem klöver. T32 anger 3♣ som spärrande hoppstöd med normalt fem eller fler klöver och cirka 0–6 hp. Detta är en stark kandidat till 3♣.
3. `dubbling-09-bid-3`: 1♥–(Dbl). Handen har 2 hp och två hjärter. Den uppfyller inte någon av de uttryckligen listade svarstyperna i T33; pass anges inte uttryckligen i trädet.

Dessa två tydliga kandidater ska inte automatiskt göras till rättningsregler innan träden har bekräftats som en del av det fastställda systemet. T33 ger inte tillräckligt stöd för att fastställa pass i det tredje fallet.

De övriga sex positionerna i den tidigare gruppen med nio handspecifika luckor gäller andra sekvenser, bland annat inkliv på 2-/3-nivån och svar efter ett hoppande inkliv. De täcks inte av T29–T33.

## Viktig skillnad: olika dubblingssituationer

T33 gäller svarshandens första bud när motståndarna dubblar vår öppning (exempelvis 1♥–Dbl).

Det är inte samma sak som:
- svar efter att partnern har dubblat motståndarnas öppning (`respDouble()` i rättningsmotorn), eller
- dubblerarens återbud efter att partnern har svarat på den egna upplysningsdubblingen.

De sju återbudspositionerna efter egen upplysningsdubbling i konkurrensgranskningen är fortfarande en separat och odokumenterad fas. T33 kan inte användas för att fylla den luckan.

## Analysmotorns matchning – korrigering

T29–T33 har komprimerade sekvenser som avsiktligt utelämnar passrundor. Den tidigare `findMatch()` jämförde dessa ordagrant mot hela auktionen, inklusive pass. Därför kunde träden inte matchas i normala auktioner med pass mellan buden.

Korrigering genomförd:
- T29–T33 har fått explicit metadata `ignorePasses: true`.
- `analysmotor.js` filtrerar bort pass endast för träd med den metadataflaggan.
- Övriga träd behåller sin exakta passkänsliga sekvensmatchning.
- Separata tester kontrollerar T29, T32 och T33 i auktioner med passrundor samt att vanliga träd inte får ändrad matchning.

Detta gör analysinnehållet tillgängligt i rätt auktion. Det innebär inte att analysmotorn väljer bud automatiskt eller att fritextvillkoren blir maskinellt verifierade.

## Korrigering av turordningsdiagnos

De tio sekvensfallen där öppnaren återkommer efter partnerns pass i konkurrensbudgivning klassades tidigare felaktigt som ett turordningsfel. Rättningsmotorn har nu en avgränsad igenkänning av just detta giltiga läge och visar i stället att öppnarens återbud efter partnerns pass och motståndarnas inkliv saknar täckning. Inget budförslag läggs till.

Ett regressionstest kontrollerar samtliga tio positioner och säkerställer att de fortfarande är ej täckta, men inte felaktigt beskrivs som ogiltig turordning.

## Kvarstående arbete

1. Bekräfta om T29–T33 ska upphöjas till fastställda systemregler eller ligga kvar som analys-/kompletterande överenskommelser.
2. Om de godkänns, omvandla relevanta handprofiler till strukturerade villkor och bygg handbaserade rättningstester.
3. Definiera svar efter 2-/3-nivåinkliv och 2NT-inkliv.
4. Hitta auktoritativt underlag för dubblerarens återbud efter partnerns svar på upplysningsdubbling.
5. Definiera öppnarens tredje bud efter 1♣–1♠–2♣–2NT.

## Avgränsning

Ingen av T29–T33 har gjorts till automatisk grundsystemregel. Ingen ny bridgekonvention har hittats på. Korrigeringarna i analysmotorn och turordningsdiagnosen är tekniska matchnings-/klassificeringsändringar, inte ändringar av budsystemet. `main` är orörd.


## Strukturerade handvillkor – schema version 1

Analysbiblioteket är nu version 0.5.6 och har fått `handConditionSchemaVersion: 1`. Samtliga 25 bladnoder i T29–T33 har maskinläsbara `handConditions` med svarshandens roll, HCP-intervall och explicita färglängder. Där underlaget uttryckligen anger balanserad hand har detta också strukturerats.

Exempel på schema:

```json
{
  "schemaVersion": 1,
  "seat": "responder",
  "hcp": { "min": 6, "max": 9 },
  "suitLengths": { "H": { "min": 3 } }
}
```

Villkor som inte kan avgöras säkert enbart från 13 kort – särskilt stopperbedömning och fritextuttryck som "begränsat stöd" – ligger kvar i `manual`. De får inte översättas till falskt exakta gränser.

`analysmotor.js` version 1.0.5 innehåller `evaluateHandConditions()`: kontrollerar 13 giltiga, unika kort, beräknar HCP och färglängder, kontrollerar balanserad fördelning enligt formerna 4-3-3-3, 4-4-3-2 och 5-3-3-2, och returnerar `match`, `no_match` eller `manual_review`. Om ett nödvändigt villkor kräver manuell bedömning returneras aldrig ett falskt säkert ja.

Efterhandsanalysen använder `evaluateMatchedHand()` för att kontrollera den faktiska budgivarens hand mot den matchade noden. Detta är uttryckligen efterhandsanalys med full handinformation – funktionen får inte användas som beslutsunderlag för AI under pågående budgivning. AI-agenternas seat-view/informationsgräns är fortsatt separat.

Nya tester i `testdata/hand-conditions.test.js` täcker schema, positiv och negativ matchning, manuell stopperbedömning, ogiltiga händer och kopplingen till rätt budgivares hand i en auktion med passrundor.


**Auktoritetsmarkering:** samtliga 25 `handConditions` är dessutom märkta `authority: "analysis_only"`. Detta hindrar att maskinläsbara analysprofiler misstas för godkända grundsystemregler. De får användas för att beskriva och kontrollera efterhandsanalys, inte för att ensamma generera bud i spelmotorn.


## Utökning till övriga analysbiblioteket – 33 träd

Analysbiblioteket är version 0.5.9. De befintliga `handProfile`-beskrivningarna har strukturerats för samtliga 119 noder som redan hade sådana profiler. Det ger 238 rollprofiler (öppnare och svarshand där de finns) under `handConditionsByRole`.

- 137 rollprofiler kan kontrolleras helt maskinellt utifrån de uttryckliga numeriska/fördelningsvillkor som kunde läsas ut.
- 101 rollprofiler innehåller dessutom kvalitativa, systemberoende eller ofullständigt definierade villkor och ger därför `manual_review` i stället för ett säkert automatiskt ja/nej.
- Profilerna är märkta `authority: "analysis_only"`; de blir inte grundsystemregler.
- Sex noder i T01 saknar handprofil och har lämnats orörda eftersom trädet bygger på Jacoby 2NT och är oförenligt med den fastställda Stenberg 2NT-överenskommelsen. T02, T03 och T05 har nu fått profiler direkt från sina uttryckliga trädvillkor. Ingen handinformation har hittats på.

Analysmotorn 1.0.6 väljer nu rollprofil efter vem som faktiskt avgav nodens sista bud: första budgivaren i sekvensen är `opener`, dennes partner är `responder`. Den jämför passinkluderande nodsekvenser med rätt antal icke-passbud när den hämtar den faktiska budgivarens hand. Kvalitativa alternativ, exempelvis "16–17 hp eller motsvarande goda spelvärden", kan inte felaktigt underkännas automatiskt: vid sådana profiler redovisas eventuella numeriska avvikelser men resultatet blir `manual_review`.

Nya regressionstester finns i `testdata/hand-profile-conditions.test.js` och körs i CI.


**Tillägg för T02, T03 och T05:** de fem noderna i dessa tre kompatibla träd har nu fått handprofiler direkt från trädens befintliga villkor. Ungefärliga intervall (t.ex. "cirka" och "normalt") är märkta för manuell bedömning. T01 har inte kompletterats eftersom dess Jacoby 2NT-konvention strider mot parets fastställda Stenberg 2NT.
