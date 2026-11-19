# Ostörd budgivning – modularkitektur

## Mål och avgränsning
Den här strukturen gäller endast ostörd budgivning (N/S). Öst/Väst ska inte kunna påverka budbeslut. Tävlingsbudgivning, inkliv, dubbling och redubbling hanteras i senare arbete och får inte läcka in i routern.

Systemets Nordisk Standard-regler är den enda auktoritativa källan. Kod får inte fylla luckor med påhittade systembetydelser. Oklarheter ska markeras som ej täckta.

## Ansvarslager
1. **Öppningsmoduler** – bestämmer öppningsbud från handen.
2. **Svarmoduler** – bestämmer svar på öppning, inklusive specialkonventioner.
3. **Återbudsmoduler** – bestämmer öppningshandens och svarshandens fortsättning efter svar/återbud.
4. **Slammodul** – hanterar slamambition, kontrollbud, ess-/kungfrågor och stopp/fortsättning. 4NT är en intern komponent; det är inte en fristående modul.
5. **Router** – klassificerar situationen och väljer modul. Den fattar aldrig själva budbeslutet.

## Routing-princip
Routern läser hela budsekvensen, inte bara senaste budet. Sekvens, position, budnivå, kravstatus och eventuell trumfbestämning styr modulval.

### Modulgrupper
- Öppningar: 1♥/1♠, 1♣/1♦, 1NT, svaga 2, starka öppningar, spärröppningar.
- Svar: svar på högfärg, lågfärg, 1NT, 2-öppningar; trumfstöd; Stayman; överföringar; Stenberg; övriga specialbud.
- Återbud: efter 1-över-1, 1-över-2, 2-över-1, trumfstöd, NT-svar, invit, Stayman/överföring/Stenberg.
- Slam: slamambition, 4NT-typning, svar, kungfråga/5NT, kontrollbud, beslut.

## Viktiga skydd
- Stenberg 2NT klassificeras endast när 2NT är direkt svar på 1 i färg (1♣/1♦/1♥/1♠–2NT).
- Övriga 2NT-sekvenser är sekvensspecifika och får inte automatiskt tolkas som Stenberg.
- 4NT klassificeras efter kontext. RKC/essfråga kräver trumf fastställd; essfråga utan fastställd trumf har sin separata betydelse. Naturligt 4NT eller annan betydelse ska lämnas till relevant modul.
- Ingen färgvariant skapas med mekaniskt färgbyte. Varianter ska verifieras mot budordning, nivå, hopp, revers, krav och laglig budgivning.
- Öppningsregler och 1NT-regeln (15–17 balanserad) är låsta och får inte ändras av routing.
- Routerresultat är endast en etikett/ansvarig modul. Saknad täckning ger `uncovered`, aldrig ett gissat bud.

## Implementation
`modules/ostord/router.js` är en fristående, deterministisk klassificerare. Den är avsiktligt inte inkopplad i befintlig tränare förrän testad och adapterad mot nuvarande budrepresentation.

## Nästa integrationssteg
1. Mappa varje befintlig regel-/modulfil till ansvarslagret.
2. Skapa sekvensbaserade fixtures från lathunden för varje modul.
3. Adaptera befintliga moduler bakom samma beslutskontrakt.
4. Kör regression på befintliga givar och simuleringar.
5. Integrera först när inga gamla budbeslut förändras oavsiktligt.
