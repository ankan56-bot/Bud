> **Aktuell styrning från 2026-11-16:** Denna notering ersätter äldre arbetsprioriteringar i dokumentets historiska avsnitt. Vi fokuserar nu på att omstrukturera och kartlägga **ostörd budgivning** innan nya budregler eller större kodändringar görs. Konkurrensbudgivningen är pausad och ska inte ändras. `main` lämnas orörd; arbetet sker på `work/undisturbed-architecture`.
>
> Arkitekturprinciper finns i [ARKITEKTUR_BUDMOTOR.md](ARKITEKTUR_BUDMOTOR.md) och den första täckningskartan i [KARTA_OSTORD_BUDGIVNING.md](KARTA_OSTORD_BUDGIVNING.md). Den fullständiga råinventeringen av befintliga ostörda analysnoder finns i [INVENTERING_NODER_OSTORD.md](INVENTERING_NODER_OSTORD.md). Kontrakten 4♥, 4♠, 5♣, 5♦ och 3NT används som mål-/täckningsvyer, inte som separata regelmotorer. Befintlig rättningsmotor är fortsatt auktoritativ tills en regeländring har dokumenterats och verifierats.
>
> **Nästa grind:** fullständiggör sekvens- och handvillkorskartan för ostörd budgivning, klassificera överlapp och ej täckta fall, fastställ en kanonisk nodmodell och först därefter genomför små, testade kodändringar.
>
> ---
>
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
- Kompletterande handvillkorsmatchare: 15 testfall.
- Kandidaterna är ännu inte godkända och får inte användas som grundsystemfacit.


### Visning av kompletterande kandidater

Efter avslutad giv kan analysvyn nu visa handvillkorsmatchade kompletterande kandidater för ej täckta budpositioner. Kandidaterna märks som ej godkända, visar källa/osäkerhet och påverkar inte grundsystemets rättning. Matchningen stöder också pass före öppningsbudet.


De kompletterande testerna täcker även kända överlapp mellan redubbling/1NT, 2♥/3♥ och 1♠/1NT. Matcharen visar flera kandidater när underlaget inte anger en prioritetsregel.


Det kompletterande kandidatbiblioteket omfattar nu 25 ej godkända kandidater från T29–T33. Matcharen kontrollerar även stoppare (E, Kx, Qxx, Jxxx). Alla kandidater är separata från grundsystemet och returneras som möjliga analyser, inte automatiska budfacit.


## Pågående prioritet: Öst/Väst och grundsystemets täckning

Spelmotorn där Syd spelar mot en människa i Nord är pausad enligt användarens instruktion. Arbetet fokuserar i stället på att göra Öst/Väst-budmotorn och den befintliga rättningsmotorn tillförlitliga.

### Konkurrenssekvenser
- Negativ dubbling efter naturlig färgöppning och reopening-/stöddubbling är inte definierade i REF och ska därför visas som ej täckta, inte automatiskt godkännas.
- 1NT efter motståndarinkliv: kontrollera 5+ färg och lämna bud utan numeriskt definierad invit-/utgångsstyrka ej täckta.
- Svar efter UD: billigaste objudna färg vid 0–7 hp; NT-svar kräver håll men inte ett extra balansvillkor; sök HTP-kandidater bland samtliga relevanta färger.

### Stenberg och öppnarens återbud
- Void får inte behandlas som singleton.
- En singleton i sidofärg visas; flera möjliga singletonfärger utan prioritet lämnas ej täckta i råmotorn.
- 15+ HTP utan singleton efter Stenberg visar 3M; 12–14 hp balanserad visar 3NT.
- 1M–2M: 17–19 HTP med singleton visar färgen; utan singleton 3M; 20+ utgång.

### Svaga tvåöppningar
- Ny färg 5+ är forcing till minst 3 i öppningsfärgen utan påhittad 15 hp-gräns.
- 2NT kräver 9–10 hp och minst 2 korts stöd.
- 3 i öppningsfärgen är spärrande med 3+ stöd, ej invit.
- Openerns återbud efter 2NT följer 6–8 minimum på 3-nivån och 9–10 maximum: 4M eller 3NT efter minoröppning.
- Odefinierade fortsättningar lämnas ej täckta.

Aktuell teststatus: 73 grundsystemstester och 15 kompletterande tester passerar. 140 deterministiska givare är validerade; alla auktioner är giltiga och ostörd täckning är 100 %. Fortsätt prioritera att granska de återstående störda sekvenserna och Stenberg-/återbudsgränserna.


### Slutlig kontroll – svaga tvåor och konkurrens

Flera egna 5+ färger efter svag tvåa har nu också gjorts ej täckta när REF saknar prioritetsregel. Testsviten är 74/74 för grundmotorn och 15/15 för kompletterande matchning. Senaste 140-givarsbaslinjen: 535/606 täckta positioner (88,3 %), 100 % ostört, 83,7 % stört, 0 tekniska fel och 140/140 giltiga auktioner. Den aktuella svag-02-givaren använder seed 93000004.


### Dubblerarens återbud – uttrycklig 18 hp-regel

Efter upplysningsdubbling och partnerns svar gäller enligt REF: utan stöd kräver egen färg/NT minst 18 hp. Motorn kontrollerar nu dubblerarens faktiska andra tur:
- Under 18 hp utan stöd: pass i stället för egen färg/NT.
- 18+ hp utan stöd: egen färg/NT kan godkännas.
- Med 3+ stöd är återbudet ej täckt tills systemunderlaget anger fortsättningen.

Detta har minskat luckorna i dubblingstemat. Senaste motor 7.1: 78/78 grundtester, 15/15 kompletterande tester, 538/606 positioner täckta (88,8 %), 100 % ostört och 84,4 % stört.


## Pausad konkurrensbudgivning och ny arbetsgren (2026-11-15)

Konkurrensbudgivningen pausas tills vidare. De återstående 68 ej täckta positionerna i 140-givarsbaslinjen ska bevaras som arbetslista; de ska inte fyllas med antagna regler. Fortsatt arbete ska ske separat från den ostörda budgivningen.

Ny arbetsgren: `work/undisturbed-validation`, skapad från `work/hps-reverse-audit`. Denna gren fokuserar på att verifiera ostörd budgivning, bevara 100 % täckning och synkronisera rättningsmotor, analysnoder och handanalysunderlag. `main` lämnas orörd.

Genomförda synkroniseringar i denna arbetsomgång:
- Gemensam trumfbonus: 9 kort ger +1; 10 eller fler ger +2 (inte +3). Kortfärgspoäng räknas separat enligt handens korthet.
- Analysbiblioteket har kompletterats med Stenberg 2NT och öppnarens återbud efter 1M–2M.
- Singletonprioritet får inte hittas på när flera sidofärger är singel; void räknas inte som singleton.

Nästa grind är en ny körning av de fasta ostörda givarna. Godkänt resultat kräver 100 % täckning, noll tekniska undantag och noll olagliga rekommendationer. Därefter granskas noder och handanalys mot de faktiska resultaten.


## Ny granskningspunkt 2026-11-16

- Bekräftad liveinformationsläcka mellan `botCall()` och `Rattning.nodeFor()`: se [GRANSKNING_LIVE_OCH_EFTERHAND.md](GRANSKNING_LIVE_OCH_EFTERHAND.md). Detta måste lösas före rättvis livebudgivning.
- Analysbibliotekets nodmatchning kontrollerar inte handprofil och roll; T40 har ogiltig root och terminala grenar är inte explicit klassificerade. Se [GRANSKNING_NODMATCHNING.md](GRANSKNING_NODMATCHNING.md).
- Nästa tekniska steg är en ren validerare och korsreferensrapport. Inga budregler ändras innan den grinden är godkänd.
