# Baslinjerapport – 140 temagivare

## Omfattning och validering

- 14 teman × 10 givare = 140 givare.
- Samtliga givare har 52 unika kort och 13 kort per hand.
- Samtliga uppfyller generatorns temavillkor.
- Samtliga referensauktioner passerar `Rattning.validateAuction` utan strukturella fel.
- Rättningsmotor: version 7.1.
- DDS har inte körts; detta är en budgivnings-/täckningsbaslinje.
- 5 störda + 5 ostörda givare per tema där båda lägena är möjliga. Dubbling och inkliv genereras som störda.
- Givarna är reproducerbara via fasta seeds och `testdata/generate-theme-deals.js`. Generatorn registrerar den exakta Git-blob-hashen för den rättningsmotor som användes.

## Rättningsutfall – engine 7.1

| Bedömning | Antal |
|---|---:|
| Rätt | 590 |
| Fel | 0 |
| Valfritt | 0 |
| Ej täckt | 43 |

De ej täckta buden är inte automatiskt felaktiga. De markerar lägen där grundsystemets nuvarande rättningsnyckel inte ger ett entydigt facit. De ska analyseras innan kompletterande regler föreslås.

## Resultat per tema

| Tema | Givare | Budpositioner | Ej täckt | Fel |
|---|---:|---:|---:|---:|
| Alla slags givar | 10 | 92 | 6 | 0 |
| 1NT, Stayman och överföringar | 10 | 100 | 0 | 0 |
| Stenberg 2NT (stöd i hög- och lågfärg) | 10 | 91 | 2 | 0 |
| 2♣-öppning (starka givar) | 10 | 112 | 0 | 0 |
| Essfråga (RKC) – alla färger | 10 | 118 | 0 | 0 |
| Slambudgivning i färg (kontrollbud och RKC) | 10 | 87 | 2 | 0 |
| Slambudgivning i sang | 10 | 100 | 0 | 0 |
| Trumfstöd (stödbud i färg) | 10 | 74 | 5 | 0 |
| Sanghänder (1NT/2NT och svar) | 10 | 84 | 0 | 0 |
| Inviter (invit eller utgång) | 10 | 66 | 0 | 0 |
| Tvåfärgshänder (andra bud) | 10 | 98 | 4 | 0 |
| Svaga öppningar och spärrbud | 10 | 58 | 0 | 0 |
| Upplysningsdubbling (dubbla och svara, alltid störd) | 10 | 68 | 15 | 0 |
| Inkliv och dubbling (alla bjuder) | 10 | 54 | 9 | 0 |

## Analys av ej täckta budpositioner

Samtliga 43 ej täckta bedömningar är pass i den genererade referensauktionen. Det beror på att referensgeneratorn väljer pass när rättningsmotorn saknar ett säkert budförslag. Det betyder inte att passen har bevisats vara rätt eller fel.

| Orsak enligt rättningsmotorn | Antal |
|---|---:|
| Motståndarna lade sig i – fortsättningen ej beskriven | 12 |
| Motståndarna har lagt sig i – fortsättningen ej beskriven | 8 |
| Motståndarna har bjudit flera gånger | 4 |
| Öppnarens återbud efter partnerns pass och motståndarnas inkliv | 9 |
| Svar efter inkliv på nivå/situation utan uttrycklig svarstabell | 6 |
| Handen uppfyller inget uttryckligt svarsvillkor i tabellen på s. 7 | 3 |
| Öppnarens tredje bud efter 1 i färg, svar och återbud | 1 |
| **Totalt** | **43** |

### Effekt av källstyrd ändring i version 7.1

Nordisk standard, sida 7, anger att svar efter 1-högfärgs-/1-ruterinkliv ska följa en särskild tabell. Den nya implementationen har:
- infört stödhöjningar med 6–9 hp och 3/4/5-kortsstöd;
- infört 1NT 8–10, 2NT 11–13 och 3NT 14+ med balanserad hand och håll;
- infört ny färg med 8+ hp på 1-nivån och 10+ hp på 2-nivån, minst fem kort och rondkrav;
- infört hopp i ny färg med 14+ hp, bra 6+ färg och utgångskrav;
- infört överbud med 10+ hp och 3+ stöd;
- lämnat andra inklivsnivåer ej täckta i stället för att ärva fel svarstabell.

Ett tidigare ej täckt testfall, `inkliv-05`, har nu korrekt rekommendation 4♥: 8 hp och femkortsstöd efter partnerns 1♥-inkliv. Ett tidigare felaktigt lågt stöd-bud (4 hp med fyrkortsstöd) har tagits bort; källan anger 6–9 hp.

## Viktig metodbegränsning

Referensauktionen skapas deterministiskt med befintlig rättningsmotor och träningssidans Öst/Väst-logik. Den är användbar för att hitta täckningsluckor och testa reproducerbarhet, men den är inte en oberoende expertbudgivning eller ett självständigt facit. Att rättningsmotorn godkänner ett bud i denna baslinje bevisar därför inte att motorn är strategiskt optimal.

Alla givares `caseType` är tills vidare `unclassified`. Fördelningen 7 typiska/3 gränsnära ska inte hävdas förrän givarna har granskats och klassificerats.

## Körning

```bash
node testdata/generate-theme-deals.js
node --test testdata/theme-deals.test.js
node --test testdata/auction-dispatch.test.js
node --test testdata/overcall-responses.test.js
node --test testdata/analysis-library-match.test.js
node --test testdata/hand-conditions.test.js
node --test testdata/hand-profile-conditions.test.js
node --test testdata/seat-view.test.js
node --test testdata/player-roles.test.js
node --test testdata/dds-runtime.test.js
```

Senaste fullständiga verifiering: GitHub Actions körning `43664406782` – samtliga steg godkända, inklusive deterministisk regenerering och publicering av datasetartefakt.
