# Fördjupad granskning av 26 konkurrensluckor

## Syfte och avgränsning

De 26 positionerna är täckningsluckor i referensauktionen. Alla står som Pass därför att generatorn väljer Pass när rättningsmotorn saknar ett säkert förslag. Pass är inte därmed verifierat som korrekt. Granskningen jämför sekvenserna med:
- tidigare exempel i `LOGG_BUDREGLER.md` (Giv 7, 10, 13, 19, 21, 22, 24 och 25);
- analysbibliotekets T29–T33;
- de uttryckliga systemgränserna och de redan dokumenterade luckorna.

Loggens givbeskrivningar innehåller inte fullständiga kortlistor för dessa exempel. Jämförelserna nedan är därför strukturella, inte exakta hand-mot-hand-jämförelser.

## Sammanfattning

| Delgrupp | Antal | Vad saknas |
|---|---:|---|
| Första svar/fortsättning efter motståndarnas inkliv eller dubbling | 13 | Stöd, naturliga svar, sang, färgbud eller pass efter olika inklivsnivåer |
| Återbud efter partnerns svar på upplysningsdubbling | 9 | Dubblerarens återbud utifrån egen hand och partnerns svar |
| Flera motståndarbud i samma auktion | 4 | Fortsättning efter två eller fler konkurrensbud |
| **Totalt** | **26** | |

De 16 positioner där dubbling förekommer har dessutom tidigare delats upp i tre svar efter motståndarnas dubbling av vår öppning, åtta återbud från dubbleraren efter partners svar och två fortsättningar efter ny motståndarinblandning, plus tre övriga passpositioner. Dessa är olika beslutssituationer och får inte slås ihop till en generell dubblingsregel.

## Jämförelse mot befintliga analysnoder

### T29 – 1♥–(1♠)

- `trumf-02-bid-3` har sekvensen 1♥–(1♠). Svarshanden har 6 HCP och fem hjärter. Den handen uppfyller både T29-profilen för enkel höjning 2♥ (6–9 HCP, minst tre hjärter) och profilen för spärrande hoppstöd 3♥ (0–6 HCP, minst fyra hjärter). Det finns alltså en överlappning vid 6 HCP och fem trumfkort. T29 anger ingen tydlig prioritering mellan dessa bud; ingen automatisk rekommendation ska väljas förrän överenskommelsen preciserats.
- `dubbling-09-bid-7` börjar också med 1♥–(Dbl), inte T29.

### T32 – 1♣–(1♥)

- `trumf-05-bid-3` har sekvensen 1♣–(1♥). Svarshanden har 4 HCP och fem klöver. Det matchar T32:s analysprofil för spärrande 3♣ (0–6 HCP och minst fem klöver). Detta är en stark kandidat för vidare systemgranskning, men T32 är fortfarande märkt `analysis_only` och är inte en godkänd grundregel.
- `trumf-05-bid-7` innehåller senare 2♣ från motståndarsidan. Det är inte svarshandens initiala val i T32 och kan inte rättas genom att återanvända den noden.

### T33 – 1♥–(Dbl)

- `dubbling-09-bid-3` har sekvensen 1♥–(Dbl). Svarshanden har 2 HCP, två hjärter och åttakorts ruter. Ingen av T33:s fem svarsnoder beskriver den handen. T33 säger inte uttryckligen att Pass är rätt alternativ i just denna handprofil. Det går därför inte att fylla luckan med en påhittad passregel.
- `dubbling-09-bid-7` fortsätter efter ett nytt 3♠-inkliv. T33 har ingen gren för den fortsättningen.

### T29–T33 täcker inte övriga sekvenser

Följande auktioner saknar en exakt match i de fem konkurrensträden:
- 1♠–(3♦), 1♥–(2♠), 1♠–(3♣), 1♦–(2♠), 1♣–(1♠);
- 1♦–(Dbl), samt återbud efter upplysningsdubbling och partners svar;
- 1♣–(1♥) följt av motståndarnas 2♣ och senare pass/återbud;
- upprepade motståndarbud efter 1♣–(1♠)–(2♣)–(5♣).

Detta är separata nivåer och former av konkurrens. T29–T33 ska inte generaliseras till dem utan stöd.

## Jämförelse mot LOGG_BUDREGLER.md

| Loggexempel | Relevant likhet | Varför det inte fastställer en regel för dessa luckor |
|---|---|---|
| Giv 7 | 1♦-öppning och spaderkonkurrens | Överbudet kommer efter partnerns 1♠-svar; annan turordning än flera av luckorna |
| Giv 10 | 1♦–(1♠), därefter stöd från överkallarens partner | Partnerns svar och motståndarnas fortsättning skiljer sig; ingen generell pass-/svarsnivå fastställs |
| Giv 13 | Svar efter upplysningsdubbling av öppningen | Exemplet visar 2♠-stöd efter 1♠–(Dbl), men ger ingen full svarstabell för 1♦/1♥ eller svaga händer |
| Giv 19 | Öppnarens återbud efter 1♦–(1♥) och partnerns pass | Motståndarna passar innan öppnaren återkommer; inte samma som återbud efter ytterligare motståndarbud |
| Giv 21 | 1♥–(2♣), partnern passar, öppnaren återkommer med 2♥ | Relevant för öppnarens återbud efter inkliv, men enstaka exempel och annan budsekvens än återbudsluckorna |
| Giv 22 | Hoppande 3♣-inkliv följt av upplysningsdubbling | Dubblingen görs av partnern till öppnaren efter hoppinklivet; inte dubblerarens återbud efter partners svar |
| Giv 24 | Hoppande inkliv och partnerns färgbud | 1♣–(2♥) och 2♠-svar; annan färg/nivå än 1♣–(1♥) och T32 |
| Giv 25 | 1♥–(2♦) och stöd/utgång i hjärter | Exemplet säger inte hur svarshanden ska agera efter 1♥–(2♠), 1♥–(1♠) eller dubbling |

**Slutsats:** Loggen innehåller användbara jämförelsepunkter men ingen av de åtta givarna utgör ensam en komplett regel för de 26 luckorna. Särskilt viktigt är att skilja mellan (a) svarshandens första val efter motståndarnas inkliv, (b) öppnarens återbud när partnern passat, (c) svar efter att motståndarna dubblat vår öppning och (d) dubblerarens återbud efter partners svar på upplysningsdubbling.

## Exakta 26 positioner

HCP och fördelning nedan gäller handen hos den spelare vars Pass står som ej täckt. Färglängderna visas som ♠/♥/♦/♣.

| Case | Spelare | HCP | Fördelning | Auktion (P = pass) | Grupp |
|---|---:|---:|---|---|---|
| alla-05-bid-5 | N | 5 | ♠5 ♥4 ♦2 ♣2 | P 1C P 1S P | Flera motståndarbud |
| alla-05-bid-7 | S | 5 | ♠2 ♥2 ♦6 ♣3 | P 1C P 1S P 2C P | Flera motståndarbud |
| alla-05-bid-9 | N | 5 | ♠5 ♥4 ♦2 ♣2 | P 1C P 1S P 2C P 5C P | Flera motståndarbud |
| alla-05-bid-11 | S | 5 | ♠2 ♥2 ♦6 ♣3 | P 1C P 1S P 2C P 5C P P P | Flera motståndarbud |
| stenberg-03-bid-3 | S | 12 | ♠4 ♥2 ♦2 ♣5 | 1S 3D P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| slam-02-bid-3 | N | 10 | ♠4 ♥4 ♦2 ♣3 | 1H 2S P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| trumf-02-bid-3 | N | 6 | ♠3 ♥5 ♦1 ♣4 | 1H 1S P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| trumf-05-bid-3 | S | 4 | ♠3 ♥0 ♦5 ♣5 | 1C 1H P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| trumf-05-bid-7 | S | 4 | ♠3 ♥0 ♦5 ♣5 | 1C 1H P 2C P P P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| tvafarg-02-bid-3 | N | 6 | ♠2 ♥4 ♦2 ♣5 | 1S 3C P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| tvafarg-04-bid-3 | S | 11 | ♠1 ♥4 ♦2 ♣6 | 1D 2S P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| tvafarg-05-bid-3 | N | 10 | ♠5 ♥3 ♦4 ♣1 | 1C 1S P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| dubbling-01-bid-6 | N | 19 | ♠4 ♥4 ♦1 ♣4 | 1D Dbl P 1S P P | Efter partners svar på upplysningsdubbling |
| dubbling-02-bid-3 | N | 11 | ♠5 ♥4 ♦0 ♣4 | 1D Dbl P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| dubbling-03-bid-6 | N | 12 | ♠7 ♥3 ♦0 ♣3 | 1D Dbl P 1H P P | Efter partners svar på upplysningsdubbling |
| dubbling-04-bid-3 | S | 4 | ♠4 ♥4 ♦3 ♣2 | 1D Dbl P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| dubbling-04-bid-7 | S | 4 | ♠4 ♥4 ♦3 ♣2 | 1D Dbl P 2N P P P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| dubbling-05-bid-6 | S | 15 | ♠4 ♥1 ♦4 ♣4 | 1H Dbl P 2D P P | Efter partners svar på upplysningsdubbling |
| dubbling-06-bid-6 | S | 14 | ♠4 ♥4 ♦3 ♣2 | 1C Dbl P 1D P P | Efter partners svar på upplysningsdubbling |
| dubbling-07-bid-6 | S | 13 | ♠3 ♥2 ♦4 ♣4 | 1H Dbl P 2D P P | Efter partners svar på upplysningsdubbling |
| dubbling-08-bid-6 | N | 12 | ♠3 ♥4 ♦4 ♣2 | 1C Dbl P 1H P P | Efter partners svar på upplysningsdubbling |
| dubbling-09-bid-3 | N | 2 | ♠1 ♥2 ♦8 ♣2 | 1H Dbl P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| dubbling-09-bid-7 | N | 2 | ♠1 ♥2 ♦8 ♣2 | 1H Dbl P 3S P P P | Svar/fortsättning efter motståndarnas inkliv eller dubbling |
| dubbling-10-bid-6 | S | 13 | ♠4 ♥2 ♦3 ♣4 | 1H Dbl P 2C P P | Efter partners svar på upplysningsdubbling |
| inkliv-02-bid-6 | N | 11 | ♠1 ♥6 ♦5 ♣1 | 1C 1H P 3H P P | Efter partners svar på upplysningsdubbling |
| inkliv-09-bid-6 | S | 14 | ♠4 ♥3 ♦2 ♣4 | 1D Dbl P 1S P P | Efter partners svar på upplysningsdubbling |

## Rekommenderad ordning för fortsatt regelarbete

1. **T29-överlappningen:** avgör om 6 HCP med fem hjärter ska vara enkel höjning eller spärrande hoppstöd. Dokumentera prioritering och gräns innan kodning.
2. **T32-kandidaten:** verifiera att 3♣ är avsedd spärrande höjning med 0–6 HCP och minst fem klöver efter 1♣–(1♥). Behåll den som analyskandidat tills paret godkänt överenskommelsen.
3. **T33-svag svarshand:** skaffa källa för när Pass är korrekt efter 1♥–(Dbl) med 2 HCP och två hjärter, alternativt dokumentera andra avsedda svar.
4. **Dubblerarens återbud:** skapa en separat regel-/analysgren för 1♦/1♥/1♣–(Dbl)–Pass–svar–Pass. Den ska använda dubblerarens egen hand, inte partnerns dolda kort.
5. **Nivå- och färgvarianter:** samla fler jämförbara exempel för 1♠–(3♣), 1♦–(2♠), 1♥–(2♠) och 1♠–(3♦).
6. **Flera motståndarbud:** behandla sekvenserna med 1♣–(1♠)–(2♣)–(5♣) som egen konkurrensfas.

## Beslut

Ingen ny budregel har lagts till. Ingen av de 26 passen har omklassificerats till rätt eller fel. T29–T33 fortsätter att vara analysunderlag med `authority: analysis_only`. De enda två starka handbaserade kandidaterna i denna granskning är `trumf-02-bid-3` (men med överlappande T29-bud) och `trumf-05-bid-3` (T32:s 3♣-profil). Övriga positioner kräver ytterligare systemkälla eller exempel.
