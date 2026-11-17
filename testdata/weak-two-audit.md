# Svaga tvåöppningar – implementation och täckningsaudit

Branch: `work/theme-dataset-analysis`  
Rättningsmotor: 9.6  
Analysbibliotek: 0.5.17  
Omfattning: ostörd budgivning efter 2♦, 2♥ och 2♠. Störd budgivning ingår inte.

## Källor och ansvarsfördelning

- **Öppningsvillkoren** behålls från `nordisk_standard.pdf`, sida 4, kompletterat med användarens uttryckliga beslut om god färg.
- **Svarbuden** är nu ändrade för att följa `Bridge Lathund bok(2).pdf`, tryckt sida 27 (PDF-filens bild/spread 10).
- Lathundens sida 27 ersätter de tidigare svarreglerna i den här modulen. Den ändrar inte öppningsvillkoren.

## Öppningsvillkor – oförändrade

- 2♦/2♥/2♠: 6–10 hp, exakt sex kort och god färg.
- God färg: minst 2 honnörer (A/K/D/Kn), eller minst 1 honnör samt minst 2 av 10/9/8.
- Med 11 hp och sexkortsfärg öppnas 1 i färgen.
- 2♣ förblir starköppning och ingår inte i svaga tvåöppningar.
- 7- och 8-kortiga spärröppningar följer den separat beslutade spärrtrappan; de får inte automatiskt använda svarsträdet för exakt sexkortig svag tvåa.

## Svar efter svag tvåöppning – lathundens sida 27

| Svar | Betydelse |
|---|---|
| 3 i öppningsfärgen | Invit, cirka 14–16 stp |
| 2NT | Stenberg 2NT, 13+ stp |
| Ny färg | Ofta sexkortsfärg, minst 15–16 hp, rondkrav |
| Direkt utgång | Slutbud |
| Hopp i ny färg | Splinter, 19+ stp |
| 4NT | Essfråga med öppningsfärgen som trumf |

### Maskinell tolkning och försiktighetsgränser

- 3 i öppningsfärgen rättas mot cirka 14–16 stp.
- 2NT rättas som Stenberg med minst 13 stp. Den tidigare regeln om enkel invit och minst två stödkort är borttagen.
- Ny färg kräver minst 15 hp och rondkrav. Sexkortsfärg godtas direkt. Lathunden säger ”ofta” sex kort och anger inte en absolut minimilängd; femkortsfärg lämnas därför för expertbedömning i stället för att godkännas eller underkännas med en påhittad gräns.
- Direkt utgång behandlas som slutbud.
- Hopp i ny färg behandlas som Splinter med minst 19 stp när färgen är singel eller renons. Om budnivån samtidigt kan vara ett naturligt utgångsbud avgör handens färglängd tolkningen.
- 4NT behandlas som RKC/essfråga med öppningsfärgen som trumf. Rättningsmotorns trumfdetektion är utökad för 2♦/2♥/2♠ följt av 4NT.
- Öppnarens fortsättning efter Stenberg 2NT är inte beskriven på sida 27. Den tidigare 6–8 / 9–10 hp-min/max-stegen är därför avstängd och sekvensen lämnas ej täckt tills fortsättningen är verifierad.

## Kvarvarande expertfrågor

1. Exakt minimiantal kort i ny färg: lathunden säger ”ofta sexkortsfärg”, inte en absolut gräns.
2. Exakt värdering av stp i gränsfall kring 14–16, 13+ och 19+.
3. Öppnarens fortsättning efter Stenberg 2NT efter svag tvåöppning.
4. Öppnarens fortsättning efter invitbudet 3 i öppningsfärgen.
5. Eventuella särskilda handvillkor för val mellan naturlig utgång och Splinter när budkoden ligger på utgångsnivå.

Alla ej täckta sekvenser ska sparas i expertloggen. Inga regler för störd budgivning har ändrats.

## Regression

`testdata/weak-two.test.js` innehåller 35 regressionstester. De täcker öppningsvillkoren, lathundens sex svarfamiljer, RKC-trumfidentifiering, femkortig ny färg som expertfråga, Stenberggränsen och att gamla min/max-svar efter 2NT inte längre används.

CI/testkörning ska verifieras separat innan testerna rapporteras som godkända.


## Gemensamma utgångs- och slamkrav efter svag tvåa – motor 9.5

- Direkt utgång fortsätter att betyda slutbud enligt Lathundens sida 27. Detta beskriver budets systembetydelse, inte att kontraktet automatiskt är styrkemässigt motiverat.
- En separat gemensam kontraktskontroll prövar nu slutkontrakt efter svag tvåöppning mot samma krav som övriga budvägar:
  - 3NT: minst 26 gemensamma hp.
  - 4♥/4♠: minst 8-korts fit och 26 gemensamma spelpoäng.
  - 5♣/5♦: minst 8-korts fit och 28 gemensamma spelpoäng.
  - Lillslam: minst 33 gemensamma poäng; i färg krävs minst 8-korts fit och högst ett saknat ess.
  - Storslam: minst 33 gemensamma poäng och alla fyra ess; i färg även trumfkungen.
- Kontrollen är fristående från konventionsrättningen: ett bud kan vara korrekt tolkat som slutbud men ändå fel styrkemässigt.
- Gemensam poängfunktion korrigerad till +1 vid 9 trumf och +2 vid 10+ trumf, enligt tidigare fastställd värdering.
- Fem nya regressionstester täcker 10-korts trumfbonus, otillräcklig styrka för 3NT, 4♥ och 6♥.
- Motor 9.5 och 35 tester incheckade. Testkörning/CI är ännu inte verifierad.


## Regressionfix motor 9.6

- Ej täckta fortsättningar efter Stenberg 2NT skyddas nu från den generella kontrollen för missad utgång. Den kontrollen får inte hitta på en fortsättning som källunderlaget inte beskriver.
- Separat styrkekontroll av faktiskt valt slutkontrakt ligger kvar.
- Testfixturerna skapar nu fullständiga, unika händer även när ursprungliga exempel saknade eller överlappade kort.
- Analysnodernas manuella färgkvalitetsfält testas mot den faktiska etiketten.
- Gemensamt regressionstest för 10-/11-korts fit uppdaterat till +2 längdbonus.
