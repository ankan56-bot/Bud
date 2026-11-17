# Runtimegranskning – befintlig 2♣-modul

**Branch:** work/undisturbed-architecture  
**Fil:** `2kloveroppning.js`  
**Status:** Öppning, alltid 2♦, öppnarens återbud och de källbelagda fortsättningarna efter 2NT är implementerade. Entydiga fördelningsgrenar från Lathunden s. 25 är routade; överlapp och externa Plus/PRO/Slam-grenar lämnas ej täckta. Lathundens uttryckliga 4NT-essfrågor med klöver/hjärter/spader som trumf är nu kopplade till befintlig Nordisk Standard-RKC i `slamlogik.js`, inklusive bibehållen trumfidentifiering efter RKC-svaret. Fem direkta runtime-kontroller av trumfkopplingen passerade. Full GitHub Actions-körning ska verifieras separat.  
**Källor:** Nordisk Standard s. 2 och 6; Lathunden tryckt s. 24–27.  
**Systembeslut:** Svarshanden bjuder alltid 2♦ på 2♣. 2♥ som svagt svar används inte.

## Befintlig struktur
Modulen exponerar:
- `opening(h)`
- `resp2c(h)`
- `reb2c(h,r)`
- `resp2c2(h,rb,mine)`

Den använder alltid 2♦ som svar på 2♣. Det stämmer med användarens val och med den always-2♦-variant som Nordisk Standard uttryckligen tillåter.

## Jämförelse och risker

### 1. Öppning
Nuvarande kod öppnar 2♣ med:
- 22+ hp balanserad,
- 20+ hp obalanserad.

Nordisk Standard anger utgångskrav eller minst 22 hp och balanserad hand. Lathunden anger 20+ obalanserad eller 22+ balanserad. 20+ obalanserad behöver därför bekräftas mot systemets valda starka öppningsdefinition. Koden har inte en separat klassificering av GF-händer som inte fångas av hp-gränsen.

### 2. Svar
Nuvarande kod väljer alltid 2♦. Detta är beslutat och ska behållas.
- Inget alternativt 2♥-svar ska genereras.
- Lathundens 2♥ med 0–4 hp och inget ess är Plus-variant och används inte.
- NS:s alternativa 2♥/3 lå-svar används inte i vår valda svarsväg.

### 3. Öppnarens återbud efter 2♣–2♦
Koden:
- väljer 2NT för 22–24 hp balanserad hand,
- väljer 3NT för 25–27 hp balanserad hand,
- väljer 4NT för 28–29 hp balanserad hand enligt Lathunden s. 24,
- väljer 2♥/2♠ eller 3♣/3♦ vid minst 5 kort i färg.

Nordisk Standard anger:
- 2♥/2♠: utgångskrav, 5+ högfärg,
- 2NT: 22–24 hp jämn,
- 3 lå: utgångskrav, 5+ lågfärg,
- 3NT: 25–27 hp jämn.

Risker och avgränsningar:
- 4NT 28–29 hp är implementerat som ett uttryckligt Lathundstillägg; Nordisk Standard anger inte denna gren.
- Balanserade händer utanför intervallen 22–29 hp lämnas ej täckta i stället för att tvingas in i fel bud.
- Om obalanserad hand saknar 5+ färg returnerar koden ingen rekommendation; detta är bättre än att hitta på ett bud.
- 3NT är begränsat till 25–27 hp enligt NS.

### 4. Svarshandens fortsättning / Herbertavslag
Koden har stöd för Herbertavslag efter 2♥, 2♠, 3♣ och 3♦:
- 2♥ → 2♠,
- 2♠ → 2NT,
- 3♣ → 3♦,
- 3♦ → 3♥.

Den hanterar även stöd, ny färg och 3NT i flera fall.

Risker:
- NS:s 4M-svar med 0–5 hp kräver stöldvärde och 4+ stöd. Koden testar 4+ stöd och singelton, men inte uttryckligen renons.
- Efter 2♣–2♦–3 lå anger NS 4 lå som 6+ hp, 3+ stöd och slamintresse. Koden testar inte separat slamintresse.
- Efter 3 lå anger NS 3 hö som 6+ hp och 4+ färg. Exakt färgprioritering måste verifieras.
- 0–5 hp med stöldvärde och bra trumfstöd efter 3 lå ska ge 5 lå, inte Herbertavslag.

### 5. Kvarvarande täckningsluckor
- Fortsättningar efter 4NT och senare bud ligger utanför denna modulomgång.
- Stark 2♣-hand utan 5+ färg i obalanserad gren.
- Hur stöldvärde ska beräknas (singelton, renons och eventuell annan definition).
- Hur slamintresse identifieras i 4 lå-grenen.
- Alla fortsättningar som Lathunden hänvisar till Bättre bud, Plus eller Slam.
- Alla sekvenser där motståndarna kliver in (ska ligga utanför ostörd modul).

## Rekommenderad testmatris när modulen öppnas
1. Öppningsgränser: balanserad 21/22/24/25/27/28/29; obalanserad 19/20/21.
2. 2♣–2♦: 22–24 balanserad → 2NT; 25–27 balanserad → 3NT; 28–29 balanserad → 4NT enligt Lathunden s. 24.
3. Obalanserad med 5+ högfärg → rätt 2M utgångskrav.
4. Obalanserad med 5+ lågfärg → rätt 3m utgångskrav.
5. Saknar 5+ färg → ej täckt, aldrig påhittat bud.
6. Herbert efter 2♥, 2♠, 3♣ och 3♦, med 0–5 respektive 6+ hp.
7. 4M med 0–5: kontrollera både singelton och renons som stöldvärde.
8. 4m med 6+ och 3+ stöd: kräver slamintresse.
9. Alla färgval med 5–5 och 5–4 som positiva och negativa gränsfall.
10. Verifiera att varje odefinierad sekvens hamnar i separat expertlogg.

## 6. Fortsättningar efter öppnarens återbud
- Efter 2♣–2♦–2NT återanvänds den befintliga 2NT-familjen för Stayman/överföringens första svar och öppnarens svar. Svarshandens 5-4-högfärgsfortsättningar efter Stayman samt 3NT med femkortshögfärg efter överföring är också routade enligt Lathunden s. 25. Överlapp mellan 3NT och Slam-hänvisade 4♣/4♦ lämnas ej täckt. Lågfärgsfrågan 3♠ (PRO) och 4♣/4♦ slaminviter (Slam) hålls utanför grundprofilen.
- Efter 2♣–2♦–2♠–2NT, 2♣–2♦–3♣–3♦ och 2♣–2♦–3♥–3♠ finns fördelningstabeller i Lathunden s. 25. Dessa är nu routade via `openerThirdAfter2c`. Endast entydiga 5-4-/6-kortsprofiler ger automatiskt bud; överlappande profiler lämnas ej täckta.
- Lathunden s. 26 innehåller ytterligare svarshandsfortsättningar med STP, kortfärg, kontrollbud och stöd. De har inte översatts till HP/HTP och ska granskas separat.
- 4NT i de uttryckliga sekvenserna är nu kopplat till befintlig RKC-motor. Fortsättningen använder samma Nordisk Standard-regler och befintliga gap-hantering; inget nytt slamvillkor har skapats.

## Slutsats
Modulen använder alltid 2♦ och täcker öppnarens återbud, de verifierade 2NT-fortsättningarna, de entydiga tredje-budsgrenarna samt de källbelagda 4NT-essfrågorna kopplade till befintlig RKC. Nordisk Standards intervall 2NT 22–24 och 3NT 25–27 följs; Lathundens 4NT 28–29 är ett tydligt märkt tillägg. Alla osäkra överlapp och Plus/PRO/Slam-hänvisningar utan verifierade villkor lämnas ej täckta.