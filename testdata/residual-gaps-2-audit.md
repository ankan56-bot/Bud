# Granskning av återstående täckningslucka efter engine 7.0

## 1. `alla-01-bid-9` – öppnarens tredje bud efter 1♣–1♠–2♣–2NT

Handen hos öppnaren (Syd) har 13 HCP och fördelningen 1–4–3–5. Budsekvensen är:

`1♣ – Pass – 1♠ – Pass – 2♣ – Pass – 2NT – Pass – ?`

Den gamla diagnosen sade felaktigt att detta var svarshandens andra bud. Det är i själva verket öppnarens tredje bud, efter att svarshanden redan har bjudit två gånger. Rättningsmotorn 6.8 har korrigerat diagnosen så att den nu rapporterar en särskild ej täckt-position för öppnarens tredje bud efter 1 i färg. Ingen budrekommendation har lagts till.

Detta är en diagnoskorrigering: den ändrar inte pass till ett annat bud och påstår inte att pass är korrekt. En separat regel behövs för öppnarens tredje bud i denna sekvensfamilj.

## 2. Tidigare splinterposition `trumf-04-bid-7` – nu löst i engine 7.0

Tidigare sekvens:

`1♠ – Pass – 2♠ – Pass – 3♥ – Pass – ?`

Öppnarens hand har 13 HCP, fem spader och singel hjärter. 3♥ genererades tidigare av en singelvisande/splinterliknande återbudsgren. Paret har beslutat att splinter kan utelämnas, så den grenen har tagits bort tillsammans med den aktiva singelvisande återbudsvarianten efter enkel höjning.

Nu blir öppnarens bud **3♠**, en naturlig invit med 16 HTP. Svarshandens pass efter 3♠ bedöms som rätt i den uppdaterade referensauktionen. Denna position finns därför inte längre bland de ej täckta fallen.

## Sammanfattning

Efter engine 7.0 återstår 44 ej täckta positioner:
- 25 konkurrens- och försvarspositioner;
- 9 öppnaråterbud efter partnerns pass;
- 9 svar efter partnerns inkliv;
- 1 öppnarens tredje bud efter svarshandens andra bud.

Ingen grundsystemregel har ändrats utöver att de tidigare splinter-/singelvisande budgrenarna har tagits bort enligt parets beslut. Ingen DDS-bedömning har använts.
