# Granskning av 9 sekvensluckor efter partnerns pass

## Slutsats

De 9 positionerna är giltiga i faktisk turordning. De uppstår när öppnaren har bjudit, partnern därefter har passat och motståndarna har ingripit. Öppnaren kommer sedan tillbaka till budgivningen. Rättningsmotorn känner nu igen sekvensen som giltig och ger en specifik `ej_täckt`-diagnos i stället för ett generiskt turordningsfel.

Detta är en diagnos- och täckningsfråga, inte ett bevis för att Pass är rätt eller fel. Händerna varierar i styrka och fördelning; ingen generell passregel har lagts till.

## De 9 positionerna

| ID | Plats | HCP | Fördelning ♠–♥–♦–♣ | Auktion fram till pass |
|---|---|---:|---|---|
| `stenberg-03-bid-5` | N | 13 | 4-3-4-2 | N:1S E:3D S:P W:P N:P |
| `slam-02-bid-5` | S | 19 | 0-5-5-3 | S:1H W:2S N:P E:P S:P |
| `trumf-02-bid-5` | S | 12 | 3-5-0-5 | S:1H W:1S N:P E:P S:P |
| `trumf-05-bid-5` | N | 14 | 4-3-1-5 | N:1C E:1H S:P W:2C N:P E:P S:P |
| `tvafarg-02-bid-5` | S | 13 | 5-3-4-1 | S:1S W:3C N:P E:P S:P |
| `tvafarg-05-bid-5` | S | 13 | 1-4-0-8 | S:1C W:1S N:P E:P S:P |
| `dubbling-02-bid-5` | S | 12 | 3-3-4-3 | S:1D W:X N:P E:P S:P |
| `dubbling-04-bid-5` | N | 13 | 2-3-5-3 | N:1D E:X S:P W:2N N:P E:P S:P |
| `dubbling-09-bid-5` | S | 14 | 2-6-0-5 | S:1H W:X N:P E:3S S:P W:P N:P |

## Regressionstest

`testdata/auction-dispatch.test.js` verifierar att samtliga 9 sekvenser:
- inte får diagnosen ”Budgivningen följer inte ett turordnat mönster”;
- får den särskilda ej täckt-diagnosen för öppnarens återbud efter partnerns pass;
- inte får något påhittat budförslag.

