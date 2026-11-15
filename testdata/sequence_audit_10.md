# Granskning av 10 sekvensluckor

## Slutsats

De 10 positionerna är inte felaktiga i faktisk turordning. De uppstår när den aktuella spelaren redan har öppnat/bjudit, partnern därefter har passat och budgivningen återkommer till den aktuella spelaren. I samtliga fall är partnerns senaste handling före passpositionen `P`.

I `nodeForRaw()` byggs `ours` av tidigare kontraktsbud från den egna sidan, men passbud filtreras bort. Därefter kräver koden att det senaste egna kontraktsbudet ska komma från partnern:

`ours[ours.length-1].s !== pt`

När partnern har passat finns inget senare eget kontraktsbud från partnern, så den här kontrollen returnerar den generiska texten om att budgivningen inte följer ett turordnat mönster. Det är en missvisande diagnos: turordningen är giltig, men motorn saknar en täckt regel för den aktuella spelarens fortsättning efter partnerns pass i konkurrensbudgivningen.

**Detta är en kod-/klassificeringslucka, inte ett bevis på att pass är rätt eller fel.** Händerna varierar från 12 till 19 hp och innehåller flera olika fördelningar. Det finns därför inte stöd för att lägga in en generell automatisk passregel.

## De 10 positionerna

HCP och fördelning avser spelaren vars pass inte täcks. Fördelning anges ♠–♥–♦–♣.

| ID | Plats | HCP | Fördelning | Auktion fram till pass | Partners senaste bud |
|---|---:|---:|---:|---|---:|
| `stenberg-03-bid-5` | N | 13 | 4-3-4-2 | N:1S E:3D S:P W:P N:P | P |
| `slam-02-bid-5` | S | 19 | 0-5-5-3 | S:1H W:2S N:P E:P S:P | P |
| `trumf-02-bid-5` | S | 12 | 3-5-0-5 | S:1H W:1S N:P E:P S:P | P |
| `trumf-05-bid-5` | N | 14 | 4-3-1-5 | N:1C E:1H S:P W:2C N:P | P |
| `tvafarg-02-bid-5` | S | 13 | 5-3-4-1 | S:1S W:3C N:P E:P S:P | P |
| `tvafarg-04-bid-5` | N | 17 | 1-4-6-2 | N:1D E:2S S:P W:P N:P | P |
| `tvafarg-05-bid-5` | S | 13 | 1-4-0-8 | S:1C W:1S N:P E:P S:P | P |
| `dubbling-02-bid-5` | S | 12 | 3-3-4-3 | S:1D W:X N:P E:P S:P | P |
| `dubbling-04-bid-5` | N | 13 | 2-3-5-3 | N:1D E:X S:P W:2N N:P | P |
| `dubbling-09-bid-5` | S | 14 | 2-6-0-5 | S:1H W:X N:P E:3S S:P | P |

## Vad som kan och inte kan fastställas

- **Kan fastställas:** sekvenserna representerar fortsättningslägen där partnern har passat; den generiska "turordningsmönster"-texten beskriver inte grundproblemet.
- **Kan fastställas:** de 10 fallen behöver en separat dispatch för öppnarens/den tidigare budgivarens återbud efter partnerns pass, eller en mer specifik ej täckt-diagnos.
- **Kan inte fastställas från underlaget:** vilket återbud som är systemkorrekt för varje hand, om pass är rätt, eller om ett konkurrensbud kräver stöd, ombud eller pass.
- **Ingen regel ändras:** de här positionerna ska inte lösas med en generell passregel eller med strategiska bridgeantaganden.

## Rekommenderat nästa steg

Sök efter uttryckliga systemexempel för öppnarens återbud när partnern passat efter motståndarnas inkliv/dubbling. Om en regel hittas ska den implementeras som en avgränsad branch med handvillkor och regressionstest. Om inget underlag finns ska motorn visa en korrekt beskrivning av luckan i stället för att kalla auktionen felaktig i turordning.

## Avgränsning

DDS har inte använts. Ingen kod eller grundsystemregel har ändrats. Rapporten hör till `work/theme-dataset-analysis`; `main` är orörd.
