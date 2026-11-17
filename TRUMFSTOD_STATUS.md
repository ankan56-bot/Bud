# Trumfstöd – modulstatus

Källa: **Nordisk standard, 2012-08-22**, s. 2–3 i användarens PDF. Ingen extern webbsökning används.

## Arkitektur

- `trumfstod.js` är routningslager för svar efter 1 i färg och öppningshandens andra bud när svarshanden visat en färg.
- `stenberg.js` är separat specialmodul för Stenberg 2NT. Reglerna kopieras inte till trumfstöd.
- Övriga naturliga svar och återbud går via de gemensamma funktionerna i `ettoppningssvar.js`, med färgspecifika adaptrar i `hogfargsbudgivning.js` och `lagfargsbudgivning.js`.
- Slam/RKC hanteras av `slamlogik.js` och anropas via den centrala budroutern.
- `main` är orörd; arbete sker på `work/undisturbed-architecture`.

## Aktiva stödvisningar enligt Nordisk standard

| Öppning | Svar | Krav / innebörd |
|---|---|---|
| 1 lå | 2 lå | 6–9 htp, 4+ stöd; egen 4+ högfärg visas först |
| 1 lå | 3 lå | 10–12 htp, 4+ stöd |
| 1 lå | 4 lå | Spärr, max 9 htp, bra stöd och svitad hand |
| 1 lå | 2NT | 13+ htp, 4+ stöd; Stenberg och utgångskrav |
| 1 hö | 2 hö | 6–9 htp, 4+ stöd |
| 1 hö | 3 hö | 10–12 htp, 4+ stöd |
| 1 hö | 4 hö | Spärr, max 12 htp, bra stöd och svitad hand |
| 1 hö | 2NT | 13+ htp, 4+ stöd; Stenberg och utgångskrav |

**Viktigt systembeslut:** Splinter är pausad och ingår inte i den aktiva budgivningen. Även om Nordisk Standard beskriver dubbelhopp i ny färg för renons ska motorn i nuläget inte rekommendera eller tolka sådana bud som splinter. Detta är ett medvetet projektbeslut, inte en ändring av vad källtexten säger. Stenberg 2NT påverkas inte: 13+ htp och minst fyra korts stöd gäller fortsatt.

## Stenberg

Stenberg 2NT hanteras helt av `stenberg.js`:
- 13+ htp och minst fyra korts stöd.
- Efter lågfärgsöppning visas egen 4+ högfärg före lågfärgsstöd.
- Öppnarens dokumenterade återbud är 3 i trumffärgen med 15+ htp utan singleton, 3 i sidofärg med singleton eller 3NT med 12–14 hp balanserad hand.
- Renons, flera singletoner och andra handtyper utan uttryckligt bud lämnas EJ TÄCKTA.
- Fortsättningar och 4NT/RKC lämnas över till Stenberg-/slammodulerna enligt den offentliga budsekvensen.

## Öppningshandens vanliga andra bud efter svarshandens färgbud

- 4+ stöd i svarshandens färg: billigaste höjning 12–16 htp.
- Enkelhopp i trumffärgen: 17–19 htp.
- Hopp till utgång: 20+ htp.
- Med lågfärgsstöd och 20+ htp ska 3NT undersökas först; om den exakta sekvensen saknas i källan lämnas läget EJ TÄCKT.

## Kvalitativa spärrhöjningar

4 i öppningsfärgen är implementerat med PDF:ens maxgränser: 12 htp i högfärg och 9 htp i lågfärg. Orden ”bra stöd” och ”svitad hand” operationaliseras preliminärt med projektets befintliga `good()`-kontroll och obalanserad hand. Resultatet märks `ruleStatus: source_interpretation`; det ska inte beskrivas som en uttrycklig numerisk källregel.

## Testning och kända gränser

- `tests/trumfstod.test.js`: modulgräns, delegering till Stenberg/hög-/lågfärgsmoduler, stödklassificering och lågfärgens sök-högfärg-prioritet. Testet är uppdaterat så att void inte aktiverar den pausade splinterkonventionen.
- `tests/stenberg-2nt.test.js`: Stenberggränser, öppnaråterbud, live-/efterhandsvägar, 100 deterministiska Stenberghänder och RKC-överlämning. Ett särskilt fall kontrollerar att en hand med void fortfarande går genom Stenberg när övriga krav är uppfyllda.
- Full testsvit/CI måste köras efter ändringarna innan ny täckningsgrad rapporteras.
- Källluckor och ej definierade fortsättningar ska fortsatt sparas i expertloggen. Inga saknade prioriteringar eller budsekvenser får fyllas med antaganden.
