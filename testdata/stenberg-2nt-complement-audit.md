# Stenberg 2NT – status på tidigare luckor

Datum: 2026-11-18  
Arbetsgren: `work/theme-dataset-analysis`  
Källa för ursprungliga testposter: `logs/ej-bedomda-ostord-ai-2026-11-18.json`  
Regelbeslut: `LOGG_BUDREGLER.md`, avsnittet "Stenberg 2NT – förtydliganden från användaren".

## Fastställda förtydliganden

1. Efter 1♥/1♠–2NT visar 3♥, 3♠, 3♣ och 3♦ minst 15 HTP. Varje buds redan befintliga andra betydelse ska behållas.
2. 3NT visar balanserad hand med 12–19 poäng; normalhanteringen är pass och ingen slamfortsättning följer automatiskt.
3. 4♣/4♦ efter 3NT är inte giltiga systembud. Rättningsmotorn ska markera fel.
4. Analysmotorn får separat känna igen 4♣/4♦ som möjlig invit med lång lågfärg: öppnaren passar med 12–14 HTP och föreslår 5 i inviterad lågfärg med mer än 14 HTP.
5. Analysförslaget får aldrig göra 4♣/4♦ giltiga i rättningen.

## Luckor som fortfarande är öppna

| Ursprunglig sekvens | Testhand hos den som ska återbjuda | Status | Skäl |
|---|---:|---|---|
| 1♠–2NT | 12 HCP, 5-2-4-2 | Öppen | Obalanserad minimumhand; de nya besluten anger inte ett uttryckligt återbud för denna handtyp. |
| 1♥–2NT | 11–12 HCP, obalanserad | Öppen | Varken den nya 3NT-definitionen (balanserad) eller en uttrycklig 15+ HTP-gren avgör dessa exempel. |
| 1♣–2NT | 12 HCP, obalanserad | Öppen | SKROT-underlaget gäller högfärgsöppning; ingen lågfärgsregel beslutad här. |
| 1♦–2NT | 12 HCP, obalanserad | Öppen | Ingen direkt regel för lågfärgsöppning fastställd. |
| 2♦–2NT | Svag tvåöppning, 10 HCP | Öppen | Separat Stenberggren enligt lathunden; öppnarens fortsättning är inte avgjord av detta tillägg. |
| 1M–2NT–3NT–4NT–5♣/5♦/5♥/5♠ | Flera händer | Öppen | Detta är RKC-/essfrågefortsättning. Den nya regeln om 4♣/4♦-invit efter 3NT löser inte svaren efter 4NT. |

## Poster som inte ska raderas ur rårapporten

Den historiska JSON-rapporten är en reproducerbar testartefakt och ska bevaras oförändrad. Vid kontroll av dess Stenbergposter finns ingen post som säkert kan tas bort som löst av de nya besluten:

- De omedelbara luckorna efter 1M–2NT gäller obalanserade händer på 11–12 HCP. Den nya 3NT-regeln gäller balanserad hand, och 15+ HTP-buden avgör inte dessa minimumhänder.
- Poster där auktionen redan gått 1M–2NT–3NT–4NT–5X gäller RKC-svar. De ska inte tas bort med hänvisning till regeln om ogiltiga 4♣/4♦-invitbud efter 3NT.
- Den nya analysgrenen för felaktiga 4♣/4♦-inviter fanns inte som sådan i de 40 historiska ej-bedömda posterna.

Alltså: **inga av de historiska Stenbergsekvenserna tas bort från råloggen i detta steg**. I stället är den nya 4♣/4♦-analysgrenen dokumenterad som en ny regel-/analysgren, och ovanstående verkliga luckor ligger kvar som öppna. Detta förhindrar att testhistoriken eller kvarvarande luckor döljs.

## Nästa steg

1. Lägg in rättningskontrollen som avvisar 4♣/4♦ i den exakta sekvensen efter 3NT.
2. Lägg in den separata analysbedömningen (12–14 HTP = pass; över 14 HTP = 5 i inviterad lågfärg).
3. Bygg regressionstester för 3♥/3♠/3♣/3♦ ≥15 HTP med bibehållen andra betydelse samt 3NT balanserad 12–19.
4. Kör om Stenbergtesterna och skapa en ny aktiv lucklista från resultaten. Radera inte historiska rådata.
