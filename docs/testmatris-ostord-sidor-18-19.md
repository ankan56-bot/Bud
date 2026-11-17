# Testmatris – Nordisk Standard s. 18–19 (ostörd budgivning)

Källa: uppladdat foto av tryckta sidor 18–19 i *Lathund – Nya Bridgeskolan*.

Status gäller implementationen i `rattningsmotor.js` på `work/theme-dataset-analysis`.

## Implementerat i denna ändring

- Tredje respektive fjärde färg klassificeras efter antalet olika färger som redan visats i parets budgivning, inte efter hp.
- Tredje färg: minst 10 hp, rondkrav.
- Fjärde färg: minst 13 hp, utgångskrav.
- Om styrkan inte når källans gräns returneras ej täckt/för svagt med förklaring i stället för att budet godkänns.
- Budet måste vara en ny färg; sang och redan bjudna färger klassificeras inte som tredje/fjärde färg.

## Obligatoriska sekvenstester

| Test | Sekvens/regel | Förväntat |
|---|---|---|
| T3-01 | 1♥–1♠–2♥–3♣ med 10+ hp | 3♣ godtas som tredje färg, rondkrav |
| T3-02 | Samma sekvens med under 10 hp | Ej täckt/för svagt |
| T3-03 | 1♥–1♠–2♣–2♦ med 9 hp | Ej täckt/för svagt som fjärde färg |
| T4-01 | 1♥–1♠–2♣–2♦ med 13+ hp | 2♦ godtas som fjärde färg, utgångskrav |
| T4-02 | Sekvens där endast två färger visats före ny färg | Ska inte felklassas som fjärde färg |
| T4-03 | Sekvens där tre färger redan visats före ny färg | Ska inte felklassas som tredje färg |
| T4-04 | Försök att återbjuda redan visad färg | Ska inte klassificeras som tredje/fjärde färg |

## Källtabeller som ännu kräver separat implementering och handtester

### Sida 18
- Öppningshandens återbud efter svarshandens 1NT.
- Öppningshandens återbud efter preferens.
- Öppningshandens återbud när svarshanden bjuder om sin färg.
- Öppningshandens svar på 2NT-invit.
- Exakta minimum-/maximumgränser och fördelningskrav i respektive tabell.

### Sida 19
- Öppningshandens exakta val efter svarshandens tredje färg: förbjudna bud, preferens, stöd, längdvisning och hållvisning.
- Öppningshandens exakta val efter svarshandens fjärde färg.
- Svarshandens fortsättningar efter tredje färg: invit 11–12 hp, fjärde färg som utgångskrav, 5–5, 6-korts hjärter.
- Svarshandens fortsättningar efter fjärde färg: ruterhåll, stödpoäng, 6-kortsfärg och slutbud.
- Verifiera skillnaden mellan hp och stp i alla dessa grenar.

## Viktig avgränsning

Denna ändring korrigerar klassificeringen av tredje/fjärde färg. Den implementerar inte automatiskt samtliga svarstabeller på sidorna 18–19. Dessa ska inte markeras som färdiga förrän varje rad har en sekvenstest med representativa händer. Inga luckor får fyllas med antagna systemregler.
