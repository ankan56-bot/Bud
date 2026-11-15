# Granskning av 9 handspecifika luckor

## Slutsats

Åtta av nio positioner är svarshandens första agerande efter att motståndarna har gjort ett inkliv eller hoppande inkliv över partnerns öppning. Den nionde (`alla-02-bid-5`) är partnern till en 2NT-inklivare som ska agera efter motståndarnas svaga 2♥-öppning. De aktuella händerna har 4–9 hp och varierande fördelning.

I de granskade systemtexterna finns gränser för själva inklivet (normalt 12–17 hp och minst fem kort; 2-nivån kräver sex kort), men det saknas en tillräckligt detaljerad regel för partnerns svar efter inklivet. Det går därför inte att avgöra passpositionerna enbart från öppnings-/inklivsreglerna.

**Ingen generell passregel eller svarskonvention läggs till.** Ett svagt svar kan ofta vara pass, men med stöd eller lämplig fördelning kan ett annat bud vara aktuellt; exakta krav måste komma från systemet.

## Fördelning

- 8 positioner: partnern har gjort ett färginkliv eller hoppande färginkliv.
- 1 position: partnern har gjort 2NT-inkliv efter motståndarnas svaga 2♥.
- Alla nio är pass i referensauktionen, eftersom rättningsmotorn saknade ett säkert svarsförslag.
- HCP för svarshanden: 4–9.

## De nio positionerna

Fördelning anges ♠–♥–♦–♣.

| ID | Plats | HCP | Fördelning | Auktion fram till pass |
|---|---:|---:|---:|---|
| `alla-02-bid-5` | S | 6 | 5-1-1-6 | S:P W:2H N:2N E:P S:P |
| `inkliv-01-bid-4` | N | 4 | 4-1-4-4 | E:1C S:1H W:P N:P |
| `inkliv-03-bid-4` | N | 4 | 4-5-1-3 | E:1S S:2C W:P N:P |
| `inkliv-04-bid-4` | S | 6 | 5-3-3-2 | W:1S N:3D E:P S:P |
| `inkliv-05-bid-4` | S | 8 | 1-5-4-3 | W:1C N:1H E:P S:P |
| `inkliv-06-bid-4` | S | 9 | 6-1-1-5 | W:1S N:3H E:P S:P |
| `inkliv-07-bid-4` | S | 6 | 3-5-3-2 | W:1C N:2S E:P S:P |
| `inkliv-08-bid-4` | N | 9 | 3-3-3-4 | E:1D S:3C W:P N:P |
| `inkliv-10-bid-4` | N | 7 | 5-2-1-5 | E:1C S:1H W:P N:P |

## Matchning mot befintliga analysteman

Analysbiblioteket innehåller redan fem relevanta konkurrensträd (T29–T33). De är dokumenterade i analysbiblioteket men saknar ett separat godkännandefält och får därför inte automatiskt behandlas som fastställda grundsystemregler.

Två av de nio positionerna har en direkt sekvensmatch mot dessa träd:
- `trumf-02-bid-3`: 1♥–(1♠). T29 beskriver enkel höjning till 2♥ med minst 3 hjärter och cirka 6–9 hp. Den aktuella handen har 4 hjärter och 6 hp; det är en tydlig kandidat till 2♥, men behöver bekräftas som auktoritativ regel innan rättningsmotorn ändras.
- `trumf-05-bid-3`: 1♣–(1♥). T32 beskriver 3♣ som spärrande hoppstöd med normalt 5+ klöver och cirka 0–6 hp. Den aktuella handen har 5 klöver och 4 hp; det är en tydlig kandidat till 3♣, men samma godkännandeförbehåll gäller.

`dubbling-09-bid-3` matchar T33:s sekvens 1♥–(dubbling), men handen (2 hp och 2 hjärter) uppfyller inte någon av de uttryckligen listade svarshandstyperna. T33 anger inte pass som ett explicit alternativ. Övriga sex positioner saknar exakt motsvarande sekvens bland T29–T33 (de gäller bland annat 2-/3-nivåinkliv eller 2NT-inkliv).

Analysbibliotekets sekvenser i T29–T33 är komprimerade och utelämnar passrundor. `analysmotor.js` matchade tidigare sekvenserna ordagrant inklusive pass och hittade därför inte träden i normala auktioner. Detta har nu åtgärdats med explicit `ignorePasses`-metadata för just dessa fem träd och separata regressionstester. Det gör träden synliga i analysen; det gör dem inte till rättningsregler.

## Viktiga skillnader

1. **Färginkliv på 1-nivån:** exempelvis 1♣–1♥ och 1♦–1♥. Svarshanden kan ha stöd, egen färg eller sanghåll, men systemets exakta svarskrav är inte belagda här.
2. **Hoppande inkliv på 2-/3-nivån:** exempelvis 1♠–3♦, 1♠–3♥, 1♣–2♠ och 1♦–3♣. Det är viktigt att inte återanvända svaren för ett vanligt inkliv utan dokumentstöd.
3. **2NT-inkliv:** `alla-02-bid-5` är en egen situation efter motståndarnas svaga 2♥. Den ska inte blandas ihop med svar på partnerns vanliga färginkliv.

## Rekommenderat nästa steg

Leta efter systemets avsnitt om svar på inkliv, inklusive stöd, hoppstöd, överbud, sang och pass. Om sådant underlag saknas behöver användaren godkänna en kompletterande budlogik separat från grundsystemet. Fram till dess ska positionerna förbli ej täckta.

## Avgränsning

Händerna har granskats med HCP och fördelning, men pass har inte bedömts som strategiskt rätt/fel. DDS har inte använts. Ingen kod eller grundsystemregel har ändrats. Rapporten hör till `work/theme-dataset-analysis`; `main` är orörd.
