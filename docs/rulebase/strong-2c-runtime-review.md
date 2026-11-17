# Runtimegranskning – befintlig 2♣-modul

**Branch:** work/undisturbed-architecture  
**Fil:** `2kloveroppning.js`  
**Status:** Endast läsgranskning. Ingen kod ändrad.  
**Källor:** Nordisk Standard s. 2 och 6; Lathunden tryckt s. 24–27.

## Befintlig struktur
Modulen exponerar fyra funktioner:
- `opening(h)`
- `resp2c(h)`
- `reb2c(h,r)`
- `resp2c2(h,rb,mine)`

Den använder den förenklade svarsvägen där SH alltid svarar 2♦ på 2♣. Det är en uttryckligen tillåten variant i Nordisk Standard (”En variant är att alltid svara 2♦”), så detta är inte i sig en avvikelse.

## Jämförelse och risker

### 1. Öppning
Nuvarande kod:
- öppnar 2♣ med 22+ hp balanserad,
- öppnar 2♣ med 20+ hp obalanserad.

Nordisk Standard:
- utgångskrav eller minst 22 hp och balanserad.

Lathunden:
- 20+ hp obalanserad eller 22+ hp balanserad.

Bedömning:
- Den balanserade gränsen är förenlig med NS:s 22+ i öppningsdefinitionen, men senare återbud måste hålla 22–24/25–27 enligt NS.
- 20+ obalanserad kommer från Lathunden och behöver finnas som uttrycklig tillåten stark öppning i den valda systemprofilen.
- Koden har ingen separat kontroll för ”utgångskrav” som inte fångas av poänggränsen. Om starka GF-händer med lägre hp är tillåtna i systemet kan de missas. Detta måste bedömas med befintliga handklassificeringar, inte antas.

### 2. Svar
Nuvarande kod väljer alltid 2♦. Nordisk Standard tillåter alltid-2♦-varianten. Den använder inte NS:s alternativa svar 2♥ (6+ hp och bra 5+ högfärg) eller 3 lå (6+ hp och bra 6+ lågfärg). Det är ett medvetet systemschema i nuvarande kod, men det ska dokumenteras som valt alternativ.

Lathundens 2♥-svar 0–4 hp utan ess är markerat Plus och står i direkt konflikt med NS:s 2♥-svar 6+ hp och bra 5+ högfärg. Koden använder inte detta svaga svar, vilket är säkrare för grundsystemet.

### 3. Öppnarens återbud efter 2♣–2♦
Koden:
- väljer 2NT för balanserad hand upp till 24 hp,
- väljer 3NT för alla balanserade händer över 24 hp,
- väljer 2♥/2♠ eller 3♣/3♦ vid minst 5 kort i färg.

Nordisk Standard anger uttryckligen:
- 2♥/2♠: utgångskrav, 5+ högfärg,
- 2NT: 22–24 hp jämn,
- 3 lå: utgångskrav, 5+ lågfärg,
- 3NT: 25–27 hp jämn.

Risk:
- Koden har ingen separat hantering av 28–29 hp jämn hand som Lathunden visar med 4NT. NS anger inte denna gren. Den får inte tyst styras till 3NT.
- Om en obalanserad hand saknar 5+ färg returnerar koden ingen rekommendation; det är en lämplig ej-täckt situation tills källan ger svar.
- Koden måste också säkerställa att 3NT bara används i NS:s 25–27-intervall.

### 4. Svarshandens fortsättning / Herbertavslag
Koden har stöd för de fyra Herbertavslagssekvenser som anges i NS:
- efter 2♥: närmaste bud 2♠,
- efter 2♠: 2NT,
- efter 3♣: 3♦,
- efter 3♦: 3♥.

Den hanterar även stöd, ny färg och 3NT i flera fall.

Identifierade risker:
- NS:s 4M-svar med 0–5 hp kräver ”stöldvärde” och 4+ stöd. Koden testar 4+ stöd och singelton, men kontrollerar inte uttryckligen renons/void som också kan ge stöldvärde.
- Efter 2♣–2♦–3 lå anger NS 4 lå som 6+ hp, 3+ stöd **och slamintresse**. Koden väljer 4 lå när den ser 3+ stöd men testar inte separat slamintresse.
- Efter 3 lå anger NS 3 hö som 6+ hp och 4+ färg. Koden väljer bland 4+ högfärger; den exakta prioriteringen mellan två möjliga färger behöver verifieras mot systemets valregel.
- Koden måste säkerställa att 0–5 hp med stöldvärde och bra trumfstöd efter 3 lå blir 5 lå, inte Herbertavslag.

### 5. Täckning som saknas eller måste verifieras
- 28–29 hp balanserad öppnarhand efter 2♣–2♦.
- Stark 2♣-hand utan 5+ färg i obalanserad gren.
- Om systemprofilen ska stödja NS:s alternativa svar 2♥/3 lå, eller enbart always-2♦.
- Hur stöldvärde ska beräknas (singelton, renons och eventuell annan definition).
- Hur ”slamintresse” identifieras i 4 lå-grenen.
- Alla fortsättningar som Lathunden hänvisar till Bättre bud, Plus eller Slam.
- Alla sekvenser där motståndarna kliver in (ska ligga utanför ostörd modul).

## Rekommenderad testmatris när modulen öppnas
1. Öppningsgränser: balanserad 21/22/24/25/27/28/29; obalanserad 19/20/21.
2. 2♣–2♦: 22–24 balanserad → 2NT; 25–27 balanserad → 3NT; 28–29 → ej täckt tills beslut.
3. Obalanserad med 5+ högfärg → rätt 2M utgångskrav.
4. Obalanserad med 5+ lågfärg → rätt 3m utgångskrav.
5. Saknar 5+ färg → ej täckt, aldrig påhittat bud.
6. Herbert efter 2♥, 2♠, 3♣ och 3♦, med 0–5 respektive 6+ hp.
7. 4M med 0–5: kontrollera både singelton och renons som stöldvärde.
8. 4m med 6+ och 3+ stöd: kräver slamintresse.
9. Alla färgval med 5–5 och 5–4 som positiva och negativa gränsfall.
10. Verifiera att varje odefinierad sekvens hamnar i separat expertlogg.

## Slutsats
Modulen har redan en betydande regelstruktur och bygger på always-2♦-varianten. Den ska inte skrivas om från början. När ÖH 2♣ blir nästa aktiva modul ska befintliga funktioner och tester bevaras, men de identifierade luckorna måste testas och rättas mot Nordisk Standard innan modulen kan godkännas. Ingen kod har ändrats i denna granskning.
