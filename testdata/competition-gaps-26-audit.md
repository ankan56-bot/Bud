# Fördjupad granskning av 25 konkurrens- och försvarsluckor

## Syfte och avgränsning

Dessa 25 positioner är täckningsluckor i referensauktionen. Fyra är försvarspass efter motståndarnas naturliga öppning och svar, medan 21 gäller inkliv/dubbling eller fortsättning efter upplysningsdubbling. Alla står som Pass därför att generatorn väljer Pass när rättningsmotorn saknar ett säkert förslag. Pass är inte därmed verifierat som korrekt.

Granskningen jämför sekvenserna med tidigare exempel i `LOGG_BUDREGLER.md` (Giv 7, 10, 13, 19, 21, 22, 24 och 25), analysbibliotekets T29–T33 och uttryckliga systembeslut.

## Sammanfattning

| Delgrupp | Antal | Vad saknas |
|---|---:|---|
| Första svar/fortsättning efter motståndarnas inkliv eller dubbling | 12 | Stöd, naturliga svar, sang, färgbud eller pass efter olika inklivsnivåer |
| Återbud efter partnerns svar på upplysningsdubbling | 9 | Dubblerarens återbud utifrån egen hand och partnerns svar |
| Försvar efter motståndarnas öppning och svar/återbud | 4 | Försvarspass när motståndarna bygger en naturlig auktion |
| **Totalt** | **25** | |

Av dessa är 21 egentliga konkurrens-/dubblingssituationer och fyra försvarspositioner mot en naturlig motståndarauktion. De 16 positioner där dubbling förekommer ska delas upp efter den exakta rollen i sekvensen; de är inte en enda regeltyp.

## Jämförelse mot T29–T33

### T29 – 1♥–(1♠)
- `trumf-02-bid-3`: svarshanden har 6 HCP och fem hjärter. Den uppfyller både T29-profilen för enkel höjning 2♥ (6–9 HCP, minst tre hjärter) och profilen för spärrande hoppstöd 3♥ (0–6 HCP, minst fyra hjärter). Överlappningen vid 6 HCP och fem trumfkort saknar tydlig prioritering. Ingen automatisk rekommendation ska väljas innan överenskommelsen preciserats.

### T32 – 1♣–(1♥)
- `trumf-05-bid-3`: svarshanden har 4 HCP och fem klöver. Det matchar T32:s analysprofil för spärrande 3♣ (0–6 HCP och minst fem klöver). Stark kandidat för vidare systemgranskning, men T32 är fortfarande `analysis_only`.

### T33 – 1♥–(Dbl)
- `dubbling-09-bid-3`: svarshanden har 2 HCP, två hjärter och åttakorts ruter. Ingen av T33:s fem svarsnoder beskriver handen. T33 anger inte uttryckligen att pass är rätt; ingen passregel ska hittas på.

T29–T33 beskriver svar efter motståndarnas inkliv/dubbling av vår öppning. De täcker inte svar när vår partner själv har klivit in eller dubblerat.

## Jämförelse mot LOGG_BUDREGLER.md

- **Giv 7 och 10:** konkurrens med spaderbud, men annan turordning och inga generella pass-/svarsnivåer.
- **Giv 13:** stöd efter upplysningsdubbling, men ingen full svarstabell för olika styrkor/färger.
- **Giv 19 och 21:** öppnarens återbud efter partnerns pass när motståndarna själva passar; inte samma som när de fortsätter bjuda.
- **Giv 22:** hoppande inkliv följt av upplysningsdubbling; annan rollfördelning än dubblerarens återbud.
- **Giv 24 och 25:** hoppande inkliv eller konkurrensbud med stöd; enstaka exempel, inte en generell regel.

Loggen innehåller jämförelsepunkter men ingen komplett regel för dessa positioner.

## Exakta 25 positioner

| Case | Spelare | HCP | Fördelning ♠/♥/♦/♣ | Auktion |
|---|---|---:|---|---|
| alla-05-bid-5 | N | 5 | ♠5 ♥4 ♦2 ♣2 | P 1C P 1S P 2C P 5C P P P |
| alla-05-bid-7 | S | 5 | ♠2 ♥2 ♦6 ♣3 | P 1C P 1S P 2C P 5C P P P |
| alla-05-bid-9 | N | 5 | ♠5 ♥4 ♦2 ♣2 | P 1C P 1S P 2C P 5C P P P |
| alla-05-bid-11 | S | 5 | ♠2 ♥2 ♦6 ♣3 | P 1C P 1S P 2C P 5C P P P |
| stenberg-03-bid-3 | S | 12 | ♠4 ♥2 ♦2 ♣5 | 1S 3D P P P |
| slam-02-bid-3 | N | 10 | ♠4 ♥4 ♦2 ♣3 | 1H 2S P P P |
| trumf-02-bid-3 | N | 6 | ♠3 ♥5 ♦1 ♣4 | 1H 1S P P P |
| trumf-05-bid-3 | S | 4 | ♠3 ♥0 ♦5 ♣5 | 1C 1H P 2C P P P |
| trumf-05-bid-7 | S | 4 | ♠3 ♥0 ♦5 ♣5 | 1C 1H P 2C P P P |
| tvafarg-02-bid-3 | N | 6 | ♠2 ♥4 ♦2 ♣5 | 1S 3C P P P |
| tvafarg-05-bid-3 | N | 10 | ♠5 ♥3 ♦4 ♣1 | 1C 1S P P P |
| dubbling-01-bid-6 | N | 19 | ♠4 ♥4 ♦1 ♣4 | 1D Dbl P 1S P P P |
| dubbling-02-bid-3 | N | 11 | ♠5 ♥4 ♦0 ♣4 | 1D Dbl P P P |
| dubbling-03-bid-6 | N | 12 | ♠7 ♥3 ♦0 ♣3 | 1D Dbl P 1H P P P |
| dubbling-04-bid-3 | S | 4 | ♠4 ♥4 ♦3 ♣2 | 1D Dbl P 2N P P P |
| dubbling-04-bid-7 | S | 4 | ♠4 ♥4 ♦3 ♣2 | 1D Dbl P 2N P P P |
| dubbling-05-bid-6 | S | 15 | ♠4 ♥1 ♦4 ♣4 | 1H Dbl P 2D P P P |
| dubbling-06-bid-6 | S | 14 | ♠4 ♥4 ♦3 ♣2 | 1C Dbl P 1D P P P |
| dubbling-07-bid-6 | S | 13 | ♠3 ♥2 ♦4 ♣4 | 1H Dbl P 2D P P P |
| dubbling-08-bid-6 | N | 12 | ♠3 ♥4 ♦4 ♣2 | 1C Dbl P 1H P P P |
| dubbling-09-bid-3 | N | 2 | ♠1 ♥2 ♦8 ♣2 | 1H Dbl P 3S P P P |
| dubbling-09-bid-7 | N | 2 | ♠1 ♥2 ♦8 ♣2 | 1H Dbl P 3S P P P |
| dubbling-10-bid-6 | S | 13 | ♠4 ♥2 ♦3 ♣4 | 1H Dbl P 2C P P P |
| inkliv-02-bid-6 | N | 11 | ♠1 ♥6 ♦5 ♣1 | 1C 1H P 3H P P P |
| inkliv-09-bid-6 | S | 14 | ♠4 ♥3 ♦2 ♣4 | 1D Dbl P 1S P P P |

## Rekommenderad ordning

1. Preciserar prioriteringen mellan T29:s enkelhöjning och spärrande hoppstöd vid 6 HCP och fem trumfkort.
2. Bekräfta om T32:s 3♣-profil är en godkänd paröverenskommelse.
3. Skaffa källa för svar efter 1♥–(Dbl) med 2 HCP och två hjärter.
4. Skapa separat gren för dubblerarens återbud efter partners svar på upplysningsdubbling.
5. Samla fler exempel för 2-/3-nivåinkliv och fortsättning efter flera motståndarbud.

## Beslut

Ingen ny budregel har lagts till. Ingen av de 25 positionerna har omklassificerats till rätt eller fel. T29–T33 fortsätter att vara analysunderlag med `authority: analysis_only`.
