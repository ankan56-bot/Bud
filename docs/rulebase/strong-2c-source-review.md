# Stark 2♣ – källunderlag inför modul ÖH 2♣

**Status:** Källutdrag och jämförelse dokumenterade. Svarsvarianten är beslutad: svarshanden bjuder alltid 2♦. Modulen är implementerad för öppning, alltid-2♦-svar och öppnarens återbud till och med 4NT. Fortsättningarna efter 2NT återanvänder den befintliga 2NT-familjen för första Stayman-/överföringsrundan. Utvalda tredje-budsrutor från Lathunden s. 25 är implementerade när endast en fördelningsprofil passar; överlappningar och externa Plus/PRO/Slam-grenar lämnas ej täckta.  
**Normerande källa:** Nordisk Standard, s. 2–3 och 6.  
**Kompletterande källa:** Lathunden, tryckta s. 24–27.  
**Systembeslut från användaren:** Efter 2♣ svarar vi alltid 2♦. 2♥ som svagt svar används inte.  
**Viktig avgränsning:** Lathundens Plus-/Bättre bud-/Slam-hänvisningar blir inte automatiskt obligatoriska systemregler.

## 1. Nordisk Standard – grundregel och vald svarsväg

**Öppning**
- 2♣: utgångskrav eller minst 22 hp och balanserad hand.

**Vald svarsväg**
- Svarshanden bjuder alltid 2♦, oavsett styrka och fördelning.
- Nordisk Standard anger uttryckligen detta som en variant.
- Alternativen 2♥ (6+ hp och bra 5+ högfärg) och 3 lå (6+ hp och bra 6+ lågfärg) används inte i vår valda systemprofil.

**Efter 2♣–2♦**
- 2♥: utgångskrav, 5+ hjärter.
- 2♠: utgångskrav, 5+ spader.
- 2NT: 22–24 hp, jämn hand.
- 3 lå: utgångskrav, 5+ lågfärg.
- 3NT: 25–27 hp, jämn hand.
- 4NT: 28–29 hp, jämn hand (Lathunden s. 24; uttryckligt tillägg eftersom Nordisk Standard inte anger denna nivå).

**Efter 2♣–2♦–2♥**
- Närmaste bud: 0–5 hp och ej trumfstöd (Herbertavslag).
- 3♥: 6+ hp och 3+ stöd.
- 4♥: 0–5 hp med stöldvärde och 4+ stöd.
- Ny färg: 6+ hp, 5+ färg.
- 3NT: 6+ hp, jämn hand.

**Efter 2♣–2♦–3 lå**
- Närmaste bud: 0–5 hp och ej trumfstöd (Herbertavslag).
- 3 hö: 6+ hp och 4+ färg.
- 3NT: 6+ hp, jämn hand.
- 4 lå: 6+ hp, 3+ stöd och slamintresse.
- 5 lå: 0–5 hp med stöldvärde och bra trumfstöd.

Nordisk Standard ger exempel på Herbertavslag efter 2♥, 2♠, 3♣ och 3♦. De ska hållas bundna till respektive sekvens.

## 2. Lathunden – källnoteringar

### Tryckt sida 24
Lathunden visar:
- 2♦: minst 5 hp eller ett ess, utgångskrav.
- 2♥: 0–4 hp, inget ess, uttryckligen hänvisat till Plus.

**Systembeslut:** 2♥-svaret används inte. Vår svarshand bjuder alltid 2♦. Därmed är Lathundens svaga 2♥-variant inte en öppen fråga och ska inte implementeras.

Efter 2♣–2♦ visar Lathunden:
- 2♥/2♠: minst 5-kortsfärg, obalanserad hand.
- 2NT: 22–24 hp, jämn hand.
- 3♣/3♦: minst 5-kortsfärg, obalanserad hand.
- 3NT: 25–27 hp, jämn hand.
- 4NT: 28–29 hp, jämn hand.

Samma sida innehåller svarshandens fortsättningar efter 2♣–2♦–2♥. Nordisk Standards uttryckliga svarsvillkor ligger till grund för den ordinarie rättningen; Lathundens extra STP-/kortfärgsgrenar hålls utanför tills de har valts som del av systemprofilen.

### Tryckt sida 25
Lathunden visar 2NT-system med Stayman, överföringar, lågfärgsfråga och slam-inviter. Den visar också öppnarens tredje bud efter 2♣–2♦–2NT och 2♣–2♦–3♣/3♥. Alla sådana sekvenser ska kontrolleras mot den valda systemprofilen och hänvisade källor innan implementation.

### Tryckt sida 25 – fortsättningar
Lathunden anger att 2NT-systemet gäller även efter 2♣–2♦–2NT (22–24 hp). Första svarsrundan visar:
- Pass: svagt, ingen 5+ högfärg.
- 3♣: Stayman (hänvisning Bättre bud).
- 3♦/3♥: överföringar (hänvisning Bättre bud).
- 3♠: lågfärgsfråga (hänvisning PRO).
- 3NT: slutbud.
- 4♣/4♦: minst 6-kortsfärg och slaminvit (hänvisning Slam).

Den befintliga 2NT-familjen återanvänds för Stayman/överföringsförsta bud. PRO- och Slam-hänvisningarna införs inte automatiskt.

Lathunden visar även öppnarens tredje bud efter:
- 2♣–2♦–2♠–2NT: 3♣/3♦/3♥ med minst 5-4-fördelning; 3♠ med minst 6-kortsfärg.
- 2♣–2♦–3♣–3♦: 3♦/3♠ med minst 5-4-fördelning; 3♥ med minst 6-kortsfärg; dessutom 3NT naturligt, 4♣ trumfstöd och 4NT essfråga med klöver som trumf.
- 2♣–2♦–3♥–3♠: 3♠ med minst 6-kortsfärg; 3NT naturligt, uttryckligen inte jämn hand; 4♣/4♦ med minst 5-4-fördelning; 4♥ med 3+ hjärter och minimum; 4NT essfråga med hjärter som trumf.

Efter 2NT-Stayman implementeras 5+♥/4+♠ respektive 5+♠/4+♥ som kravbud när endast en profil passar. Efter överföring implementeras 3NT som icke-krav med exakt femkortshögfärg när ingen 4+ lågfärg/slaminvit överlappar. Fördelningsbuden implementeras endast när en enda profil passar. När flera budprofiler överlappar returneras ej täckt. Villkoren för naturligt 3NT, trumfstöd och essfråga är inte fullt kvantifierade i tabellerna och ska inte fyllas i med antaganden.

### Tryckt sida 26
Sidan innehåller svarshandens tredje bud efter stark 2♣, bland annat 2-kortsstöd, 3NT utan stöd, kontrollbud med hjärter-/spaderstöd och STP-intervall (5–7 eller 8+ stp). Dessa är mer detaljerade Plus-/Lathundstillägg än Nordisk Standards grundsvar. De har inte översatts till HP/HTP och implementeras inte utan separat systembeslut.

Sidan innehåller också en separat sekvens efter motståndarnas störning av 2♣. Den tillhör störd budgivning och ligger utanför denna ostörda modul.

### Tryckt sida 27
Motståndarnas störning efter 2♣ hör till störd budgivning och ska inte blandas in i ostörd ÖH 2♣-modul.

## 3. Jämförelse och status

| Fråga | Nordisk Standard | Lathunden | Vårt beslut |
|---|---|---|---|
| Öppning 2♣ | Utgångskrav eller minst 22 hp balanserad | Stark öppning; 20+ obalanserad eller 22+ balanserad | Behåll NS som norm; 20+ obalanserad ska verifieras mot systemets starka öppningsdefinition |
| Svar | Alltid 2♦ är uttryckligen tillåten variant | 2♦ eller Plus-variant 2♥ svagt | Alltid 2♦. 2♥ används inte. |
| 22–24 balanserad | 2NT efter 2♦ | 2NT efter 2♦ | Överens |
| 25–27 balanserad | 3NT efter 2♦ | 3NT efter 2♦ | Överens |
| 28–29 balanserad | Inte angivet | 4NT efter 2♦ | Infört som uttryckligt Lathundstillägg inom användarens beställda modulomfattning; inte en NS-basregel |
| Obalanserad hand | 2M/3m utgångskrav med 5+ färg | Minst 5-kortsfärg, obalanserad | Behåll kravstatus från NS |

## 4. Kvarvarande öppna frågor

1. Vilka exakta handstyrkor gäller för obalanserade återbud efter 2♣–2♦? Rutorna anger färglängd och handtyp men inte fullständigt styrkeintervall.
2. Vilka fortsättningar som hänvisar till Bättre bud, Plus och Slam ska ingå i obligatorisk rättning? Hänvisade källor måste granskas innan dessa regler implementeras.
3. 4NT efter 2♣–2♦ är infört som 28–29 hp jämn hand enligt Lathunden s. 24. Det ska märkas som Lathundstillägg, inte som NS-regel.
4. Hur ska öppnarens starka 2♣-klassificering hantera utgångskrav som inte fångas av en ren hp-gräns?
5. Vilka sekvenser efter 2♣–2♦ är helt definierade och vilka ska gå till expertloggen?

## 5. Implementationens avgränsning

När källgranskningen är klar byggs ÖH 2♣ i befintligt träd:
- öppningshandens klassificering,
- alltid 2♦ som enda svar,
- öppnarens återbud efter 2♣–2♦,
- öppnarens återbud upp till och med 4NT;
- svarshandens fortsättningar efter dessa återbud hanteras i nästa modulsteg,
- gränsfall runt 20/22/24/25/27/28/29 hp,
- ej täckta sekvenser till separat expertlogg.

Ingen kod ändras i denna källdokumentation.