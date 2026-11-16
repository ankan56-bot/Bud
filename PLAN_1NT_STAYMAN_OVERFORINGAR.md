# Slutförande av Stayman och överföringar – 1NT

**Arbetsgren:** `work/undisturbed-architecture`  
**Datum:** 2026-11-16  
**Omfattning:** Ostörd budgivning efter 1NT. Detta dokument avgränsar de två arbetsområden som ska färdigställas nu.

## Avgränsning och uppskjutna frågor

Arbetet omfattar endast:

1. Stayman: svarshandens fortsättningar och öppnarens beslut där dessa är uttryckligen beskrivna.
2. Hjärter- och spaderöverföring: samtliga källbelagda budbetydelser och de öppnarbeslut som faktiskt stöds av systemtexten.

Följande ingår **inte** i denna genomgång:

- Valet mellan 3NT och 5♣/5♦. Detta läggs i listan över framtida förbättringar och får inte påverka nuvarande rättning.
- Slamdelen: kontrollbud, RKC, essfrågesvar och fortsättningar efter essfrågan. Den ska granskas separat.
- Störda budgivningar.

## A. Stayman – sekvenskarta

### A1. Öppnarens svar

| Sekvens | Betydelse | Status |
|---|---|---|
| 1NT–2♣–2♦ | Öppnaren saknar fyrkortshögfärg | Källbelagd, s. 4 |
| 1NT–2♣–2♥ | 4–5 hjärter; kan även ha 4–4 i högfärgerna | Källbelagd, s. 4 |
| 1NT–2♣–2♠ | 4–5 spader | Källbelagd, s. 4 |

Vid 4–4 i högfärgerna används 2♥. Detta ska ha regressionstest så att prioriteten inte ändras av misstag.

### A2. Svarshandens fortsättningar

| Auktion efter öppnarens svar | Betydelse | Status |
|---|---|---|
| Ny högfärg, 5+ kort | Naturligt utgångskrav | Källbelagd, s. 4 |
| Ny lågfärg, 4+ kort | Naturligt utgångskrav | Källbelagd, s. 4 |
| 1NT–2♣–2♥–2NT | Visar exakt fyra spader; invitsekvens | Källbelagd, s. 4 |
| 1NT–2♣–2♥–3NT | Visar också fyra spader | Källbelagd, s. 4 |
| 1NT–2♣–2♥–3♥ | Invit i öppnarens visade hjärter | Källbelagd betydelse; numerisk styrkegräns saknas |
| 1NT–2♣–2♠–3♠ | Invit i öppnarens visade spader | Källbelagd betydelse; numerisk styrkegräns saknas |
| 1NT–2♣–2♠–2NT | Naturlig sanginvit | Källbelagd betydelse; numerisk styrkegräns saknas |
| 1NT–2♣–2♦–3M | Med utgångsstyrka och obalanserad hand med femkortshögfärg används Stayman följt av 3 i högfärgen | Källbelagd, s. 4; hand-/styrkevillkor ska testas |

Om flera nya färger samtidigt uppfyller längdkraven och systemtexten inte anger prioritet ska beslutet lämnas **EJ TÄCKT**. Motorn får inte hitta på en prioritetsordning.

### A3. Öppnarens fortsättning efter den särskilda 2♥-grenen

| Sekvens | Öppnarens hand | Fortsättning |
|---|---|---|
| 1NT–2♣–2♥–2NT | 4–4 i högfärgerna, 15–16 hp | 3♠ |
| Samma | 4–4 i högfärgerna, 17 hp | 4♠ |
| 1NT–2♣–2♥–3NT | 4–4 i högfärgerna | 4♠ |
| Samma | Inte 4–4 i högfärgerna | Pass |

Dessa uttryckliga fortsättningar är redan dokumenterade som implementerade och regressionstestade. De får inte generaliseras till andra handtyper utan stöd i källan.

### A4. Stayman – vad som inte får antas

- Stayman-inviternas numeriska styrkegränser är inte angivna i Nordisk Standard.
- Öppnarens generella accept/pass efter inviterna är inte fullständigt specificerad av den granskade texten.
- Fortsättningen efter 1NT–2♣–2♠ ska inte spegelvändas från hjärtergrenen utan källstöd.
- 25 HP för 3NT är en separat överenskommen projektregel, inte en generell ersättning för saknade Staymanregler.
- Livebeslut får endast använda spelarens egen hand och offentlig budinformation. Exakt dold partnerhand får endast användas i efterhandsfacit.

## B. Överföringar – sekvenskarta

### B1. Öppnarens fullföljning

| Sekvens | Öppnarens hand | Fortsättning |
|---|---|---|
| 1NT–2♦ | Normal öppningshand | 2♥ |
| 1NT–2♦ | Maximum och minst fyra hjärter | 3♥ (superaccept enligt källtabellen) |
| 1NT–2♥ | Normal öppningshand | 2♠ |
| 1NT–2♥ | Maximum och minst fyra spader | 3♠ (superaccept enligt källtabellen) |

Superacceptvillkoret ska vara källkontrollerat och testat separat från vanlig fullföljning. Det får inte användas om öppnarens hand inte uppfyller de uttryckliga villkoren.

### B2. Efter hjärteröverföring – 1NT–2♦–2♥

| Svarshandens bud | Betydelse |
|---|---|
| Pass | Dåliga kort, minst fem hjärter |
| 2NT | Invit, jämn hand, exakt fem hjärter |
| 3♥ | Invit, minst sex hjärter |
| 2♠ | Rondkrav, minst 5 hjärter och 4 spader |
| 3♣ / 3♦ | Utgångskrav, minst 5 hjärter och 4+ i bjuden lågfärg |
| 3NT | Väljer utgång, jämn hand och exakt fem hjärter |
| 4♣ / 4♦ | Kontrollbud och slamintresse |
| 4♥ | Slutbud |
| 4NT | RKC med hjärter som trumf |

Om både 3♣ och 3♦ uppfyller längdvillkoret saknas källbelagd prioritet; lämna EJ TÄCKT.

### B3. Efter spaderöverföring – 1NT–2♥–2♠

| Svarshandens bud | Betydelse |
|---|---|
| Pass | Dåliga kort, minst fem spader |
| 2NT | Invit, jämn hand, exakt fem spader |
| 3♠ | Invit, minst sex spader |
| 3♥ | Invit med minst 5–5 i högfärgerna |
| 3♣ / 3♦ | Utgångskrav, minst 5 spader och 4+ i bjuden lågfärg |
| 3NT | Väljer utgång, jämn hand och exakt fem spader |
| 4♣ / 4♦ | Kontrollbud och slamintresse |
| 4♠ | Slutbud |
| 4NT | RKC med spader som trumf |

Om både 3♣ och 3♦ uppfyller längdvillkoret saknas källbelagd prioritet; lämna EJ TÄCKT.

### B4. Överföringar – viktiga begränsningar

- Nordisk Standard s. 5 ger kvalitativa beskrivningar för svag/invit/utgång men inte numeriska HP-intervall. Tidigare påhittade intervall ska inte återinföras.
- Öppnarens accept/pass efter 2NT- eller 3M-inviter kan inte räknas ut från partnerns faktiska kort i livebudgivningen.
- Om källan inte ger en verifierad acceptgräns ska öppnarens beslut lämnas EJ TÄCKT i stället för att en gräns konstrueras.
- Efter svarshandens 3NT är öppnarens korrigering till 4M med tre korts stöd inte belagd i den granskade tabellen. Lämna EJ TÄCKT i det läget; passa endast när källans handvillkor för att inte korrigera är uppfyllt.
- 4♣/4♦ efter fullföljd överföring har betydelsen kontrollbud/slamintresse. De är inte vanliga inviter eller självständiga slutbud.
- 4NT hör till den separata slamgenomgången. I denna arbetsdel ska betydelsen endast bevaras och inte byggas ut.

## C. Genomförande- och testkrav

För varje sekvens ovan ska följande verifieras:

1. Korrekt spelare/roll fattar beslutet.
2. Egen handprofil och offentlig auktion räcker för ett livebeslut.
3. Ingen dold partnerhand påverkar livebeslut eller motivering.
4. Källbelagd betydelse finns i analysbiblioteket.
5. En isolerad regressionstest täcker positivt fall, negativt fall och relevanta överlapp.
6. Saknad numerisk styrkegräns eller saknad prioritet ger EJ TÄCKT – inte ett gissat bud.
7. Facit får använda hela given, men ska märka Systemregel, Överenskommen projektregel, Vägledande bedömning och EJ TÄCKT separat.

## D. Framtida förbättringar – utanför denna leverans

- **Lågfärgsutgång kontra sang:** utred när 5♣/5♦ ska väljas framför 3NT, inklusive användarens princip att 3NT först ska undersökas när det är relevant. Ingen sådan prioritering ska implementeras nu.
- **Slamkomplexet:** separat genomgång av kontrollbud, fastställd trumf, fyr-essfråga, fem-nyckelkorts-RKC och svar/fortsättningar efter essfrågan.
- **Störd budgivning:** ligger utanför nuvarande 1NT-arbete.

## E. Definition av färdig

Stayman- och överföringsdelarna kan markeras färdiga när alla källbelagda grenar är representerade, regressionstesterna passerar, dolda händer inte påverkar livebeslut och alla olösta källuckor är uttryckligen märkta EJ TÄCKT. Att en lucka är korrekt markerad EJ TÄCKT är inte ett misslyckande och får inte lösas genom att hitta på en systemregel.
