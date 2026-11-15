# Utveckling: analysbibliotek, facit och budmotor

## Beslutad riktning

Målet är att förbättra både undervisningsanalysen och Öst–Väst-motorn utan att förvanska det definierade systemet.

### Kunskapslager

1. **Grundsystemet** – den befintliga rättningsmotorn och de uttryckligen fastställda Nordisk Standard-reglerna är auktoritativ källa. Kompletterande resonemang får aldrig skriva över detta.
2. **Kompletterande budlogik** – analyserar situationer där grundsystemet saknar täckning eller lämnar flera rimliga alternativ. Varje post märks som kompletterande och får källa, motivering och säkerhetsnivå.
3. **Analysbiblioteket** – pedagogiska noder som förklarar budsekvenser, handvillkor, fortsättningar, alternativ och vanliga misstag. En nod får bara matcha när både sekvens och relevanta handvillkor stämmer.
4. **DDS** – används som efterhandskontroll av stick och kontraktsmöjligheter. DDS känner till alla fyra händer och får därför inte ensamt avgöra vad spelarna borde ha bjudit med den information de hade under auktionen.

## Temabaserad testuppsättning

Hemsidan har för närvarande 14 teman:

| ID | Tema | Antal första testgivare |
|---|---|---:|
| alla | Alla slags givar | 10 |
| nt | 1NT, Stayman och överföringar | 10 |
| stenberg | Stenberg 2NT | 10 |
| tva | 2♣-öppning | 10 |
| rkc | Essfråga (RKC) | 10 |
| slam | Slambudgivning i färg | 10 |
| slamnt | Slambudgivning i sang | 10 |
| trumf | Trumfstöd | 10 |
| sang | Sanghänder | 10 |
| invit | Inviter | 10 |
| tvafarg | Tvåfärgshänder | 10 |
| svag | Svaga öppningar och spärrbud | 10 |
| dubbling | Upplysningsdubbling | 10 |
| inkliv | Inkliv och dubbling | 10 |

Första målet är 140 temamärkta givare. Varje tema ska ha reproducerbara seed-värden. Givarna ska skapas med temats faktiska villkor, inte slumpas först och etiketteras i efterhand. Sju typiska och tre gränsnära fall är en startfördelning, men får anpassas om ett tema kräver annan variation.

Samma givuppsättning ska återanvändas vid varje motorändring. Resultat ska redovisas per tema och per budposition. Om en giv passar flera teman får den ha flera sekundära etiketter, men ett tydligt huvudtema.

## Bedömningsflöde per giv

1. Kontrollera kortlek, 13 kort per hand, 52 unika kort och temavillkor.
2. Kör grundsystemets rättningsmotor och spara dess exakta bedömning.
3. Markera vilka auktionstillstånd som är täckta, valfria, felaktiga eller ej täckta.
4. Analysera ej täckta och tvetydiga lägen separat. Kompletterande bedömningar ska innehålla resonemang, alternativ och osäkerhet.
5. Kör DDS som efterhandskontroll där det är relevant. Håll dolda kort separerade från information som var tillgänglig för budgivarna.
6. Skapa eller uppdatera analysnoder med strukturerade handvillkor och tydlig källa.
7. Testa budmotorn mot samma givuppsättning och jämför förbättringar/regressioner.

## Krav på AI-bedömning

AI-stödd analys under utvecklingen ska:
- följa grundsystemet när det finns en uttrycklig regel;
- identifiera luckor i stället för att hitta på systemregler;
- använda bridgekunskap för att föreslå rimliga beslut utanför uttryckliga regler;
- väga in partnerns bud och den information som faktiskt är tillgänglig;
- skilja systemkorrekthet från strategisk kvalitet och DDS-efterhandsresultat;
- ange motivering, alternativ och säkerhetsnivå;
- inte automatiskt publicera en komplettering som en ny grundregel.

Ingen extern AI-tjänst ska krävas av den publicerade hemsidan. Analys som ska köras lokalt måste vara uttryckligt implementerad i lokala regler/data; ett statiskt JSON-bibliotek är inte i sig en AI-modell.

## Kvalitetsgrindar

- Inga ändringar i grundsystemet utan dokumenterad regelgrund och regressionstest.
- Ingen kompletterande regel får märkas som grundsystem.
- Varje nod ska validera sekvens och relevanta handvillkor.
- Testgivarna ska vara reproducerbara och kontrollerade för kortintegritet.
- Kör syntaxkontroll och regressionstest efter varje motorändring.
- Redovisa ej täckta lägen separat; målet är att minska dem över tid, inte dölja dem.
- Ingen AI- eller DDS-rekommendation ska presenteras som säkert facit utan korrekt kunskapskälla.

## Nuvarande utgångsläge

- Befintliga filer: `rattningsmotor.js`, `analysmotor.js`, `analysbibliotek.json`, `dds-integration.js`.
- Befintlig analys av 200 givare dokumenterar luckor i svarshandens tredje bud, återbud efter 1NT-svar och konkurrensbudgivning. Den rapporten är en baslinje, inte ett slutligt AI-facit.
- Den nuvarande analysmotorn matchar huvudsakligen sekvensprefix. Handvillkor behöver göras till verklig matchningskontroll innan biblioteket byggs ut kraftigt.
- Den nuvarande temageneratorn finns inbyggd i `Budtraning.html`. Den ska återanvändas eller extraheras till en separat utvecklingsmodul så att testgivare kan skapas utan att belasta användarens iPad.

## Avgränsning för publicerad webbplats

Stora simuleringar och analyskörningar ska ske i utvecklingsmiljö, inte i besökarens webbläsare. Webbplatsen ska bara hämta den färdiga, validerade kunskapen och använda DDS för enskilda givar när det behövs.


## Kompletterande kandidatmatchning – första implementation

`kompletterande_budlogik.json` innehåller nu fem omarkerade som systemregler (status `unreviewed`) kandidater för 1♥–Dbl. `analysmotor.js` kan matcha dessa separat mot exakt budsekvens, nästa spelare och strukturerade HCP-/fördelningsvillkor. Endast den aktuella spelarens hand används. Matcharen returnerar alla kandidater och visar överlapp; den väljer inte automatiskt mellan motstridiga kandidater och får aldrig skriva över `rattningsmotor.js`.

Regressioner:
- Grundsystemets budrättningsmotor: 54 testfall.
- Kompletterande handvillkorsmatchare: 6 testfall.
- Kandidaterna är ännu inte godkända och får inte användas som grundsystemfacit.


### Visning av kompletterande kandidater

Efter avslutad giv kan analysvyn nu visa handvillkorsmatchade kompletterande kandidater för ej täckta budpositioner. Kandidaterna märks som ej godkända, visar källa/osäkerhet och påverkar inte grundsystemets rättning. Matchningen stöder också pass före öppningsbudet.
