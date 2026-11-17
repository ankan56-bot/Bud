# Stark 2♣ – källunderlag inför modul ÖH 2♣

**Status:** Källutdrag och jämförelse dokumenterade. Svarsvarianten är beslutad: svarshanden bjuder alltid 2♦. Modulen är ännu inte implementerad eller godkänd.  
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

Samma sida innehåller svarshandens fortsättningar efter 2♣–2♦–2♥. Dessa ska endast användas om den sekvensen ingår i den valda grenen och ska granskas separat mot Nordisk Standard.

### Tryckt sida 25
Lathunden visar 2NT-system med Stayman, överföringar, lågfärgsfråga och slam-inviter. Den visar också öppnarens tredje bud efter 2♣–2♦–2NT och 2♣–2♦–3♣/3♥. Alla sådana sekvenser ska kontrolleras mot den valda systemprofilen och hänvisade källor innan implementation.

### Tryckt sida 26
Denna sida behandlar fortsättningar efter 2♣–2♥. Eftersom vi alltid svarar 2♦ är den grenen inte del av vår valda grundväg och ska inte implementeras i 2♣-modulen.

### Tryckt sida 27
Motståndarnas störning efter 2♣ hör till störd budgivning och ska inte blandas in i ostörd ÖH 2♣-modul.

## 3. Jämförelse och status

| Fråga | Nordisk Standard | Lathunden | Vårt beslut |
|---|---|---|---|
| Öppning 2♣ | Utgångskrav eller minst 22 hp balanserad | Stark öppning; 20+ obalanserad eller 22+ balanserad | Behåll NS som norm; 20+ obalanserad ska verifieras mot systemets starka öppningsdefinition |
| Svar | Alltid 2♦ är uttryckligen tillåten variant | 2♦ eller Plus-variant 2♥ svagt | Alltid 2♦. 2♥ används inte. |
| 22–24 balanserad | 2NT efter 2♦ | 2NT efter 2♦ | Överens |
| 25–27 balanserad | 3NT efter 2♦ | 3NT efter 2♦ | Överens |
| 28–29 balanserad | Inte angivet | 4NT efter 2♦ | Komplettering som kräver separat beslut |
| Obalanserad hand | 2M/3m utgångskrav med 5+ färg | Minst 5-kortsfärg, obalanserad | Behåll kravstatus från NS |

## 4. Kvarvarande öppna frågor

1. Vilka exakta handstyrkor gäller för obalanserade återbud efter 2♣–2♦? Rutorna anger färglängd och handtyp men inte fullständigt styrkeintervall.
2. Vilka fortsättningar som hänvisar till Bättre bud, Plus och Slam ska ingå i obligatorisk rättning? Hänvisade källor måste granskas innan dessa regler implementeras.
3. Ska 4NT efter 2♣–2♦ ingå som 28–29 hp jämn hand, trots att grenen inte anges i Nordisk Standard?
4. Hur ska öppnarens starka 2♣-klassificering hantera utgångskrav som inte fångas av en ren hp-gräns?
5. Vilka sekvenser efter 2♣–2♦ är helt definierade och vilka ska gå till expertloggen?

## 5. Implementationens avgränsning

När källgranskningen är klar byggs ÖH 2♣ i befintligt träd:
- öppningshandens klassificering,
- alltid 2♦ som enda svar,
- öppnarens återbud efter 2♣–2♦,
- svarshandens fortsättningar,
- gränsfall runt 20/22/24/25/27/28/29 hp,
- ej täckta sekvenser till separat expertlogg.

Ingen kod ändras i denna källdokumentation.