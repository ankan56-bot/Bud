# Granskning av de två återstående täckningsluckorna

## 1. `alla-01-bid-9` – öppnarens tredje bud efter 1♣–1♠–2♣–2NT

Handen hos öppnaren (Syd) har 13 HCP och fördelningen 1–4–3–5. Budsekvensen är:

`1♣ – Pass – 1♠ – Pass – 2♣ – Pass – 2NT – Pass – ?`

Den gamla diagnosen sade felaktigt att detta var svarshandens andra bud. Det är i själva verket öppnarens tredje bud, efter att svarshanden redan har bjudit två gånger. Rättningsmotorn har korrigerats så att den nu rapporterar en särskild ej täckt-diagnos för öppnarens tredje bud efter 1 i färg. Ingen budrekommendation har lagts till.

Detta är en ren diagnoskorrigering: den ändrar inte pass till ett annat bud och påstår inte att pass är korrekt. En separat regel behövs för öppnarens tredje bud i denna sekvensfamilj.

## 2. `trumf-04-bid-7` – svar efter ett möjligt splinterbud

Sekvensen är:

`1♠ – Pass – 2♠ – Pass – 3♥ – Pass – ?`

Öppnarens hand har 13 HCP, fem spader och singel hjärter. Svarshanden har 6 HCP, fyra spader och fyra hjärter. Rättningsmotorn har producerat 3♥ via sin befintliga splintergren efter 1♠–2♠. Den efterföljande svarshanden får diagnosen att fortsättningen inte kan avgöras säkert.

Det här fallet måste hållas isär från en vanlig naturlig 3♥-återbudshand: 3♥ är skapat av splinterlogiken, inte av att öppnaren visar en naturlig hjärterfärg. Paret har tidigare beslutat att splinter kan utelämnas. Därför ska denna genererade sekvens inte användas som ett godkänt systemexempel eller som bevis för att svarshanden måste kunna svara på splinter.

**Åtgärd i denna granskning:** ingen ny regel har lagts till och ingen handbedömning har fabricerats. Fallet markeras som en system-/generatoravvikelse att hantera när splintergrenarna rensas bort. Det ska inte räknas som en oberoende systemlucka i en godkänd auktion.

## Slutsats för de 47 ursprungliga positionerna

- 26 konkurrens- och försvarslägen är granskade separat.
- 10 öppnaråterbud efter partnerns pass är granskade separat.
- 9 svar på partnerns inkliv är granskade separat.
- 1 felaktig diagnos för öppnarens tredje bud är korrigerad.
- 1 återstående referensauktion använder splinterlogik som paret har valt att utelämna; den ska inte användas som systemfacit.

Ingen grundregel har ändrats i denna granskning. Rättningsmotorns ändring är endast en mer korrekt diagnos av öppnarens tredje bud.
