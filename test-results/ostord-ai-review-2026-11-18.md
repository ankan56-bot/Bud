# Granskning av de 11 interna motsägelserna – 2026-11-18

## Åtgärder
| Antal | Feltyp | Åtgärd | Status |
|---:|---|---|---|
| 9 | 1M–2NT–3NT: poängkontrollen hoppade direkt till 6M utan esskontroll | Nästa steg blir 4NT/RKC i den specifika Stenbergsekvensen. Lillslam väljs först efter ess-/trumfkungssvar. | Lösta; fortsatta RKC-svar bedöms separat |
| 1 | 1♣–1♦–3♦: motorn föreslog att upprepa 3♦ | Laglighetskontrollen körs före självkonsistenskontrollen; pass är korrekt. | Löst |
| 1 | 1♥–1♠–2♣: generiskt återbud 2NT trots saknat ruterkontroll | Den exakta sekvensen kräver alla dokumenterade kriterier. Om de inte uppfylls lämnas läget ej täckt. | Löst säkert; inget obelagt bud |

## Ny simulering
- Givar: **1200**, 100 per tema
- N/S-beslut: **5383**
- Täckta beslut: **5343 (99.26 %)**
- Ej täckta beslut: **40** i **36** unika sekvenser
- Kvarvarande interna motsägelser: **0**
- Overifierade icke-passbud: **0**
- Ogiltiga auktioner: **0**

## Per tema
| Tema | Givar | N/S-beslut | Täckta | Ej täckta |
|---|---:|---:|---:|---:|
| alla | 100 | 510 | 505 | 5 |
| nt | 100 | 507 | 507 | 0 |
| stenberg | 100 | 470 | 467 | 3 |
| tva | 100 | 560 | 560 | 0 |
| rkc | 100 | 499 | 485 | 14 |
| slam | 100 | 484 | 475 | 9 |
| slamnt | 100 | 448 | 448 | 0 |
| trumf | 100 | 401 | 400 | 1 |
| sang | 100 | 395 | 395 | 0 |
| invit | 100 | 365 | 365 | 0 |
| tvafarg | 100 | 544 | 536 | 8 |
| svag | 100 | 200 | 200 | 0 |

De nio slamfallen leder nu till 4NT/RKC. I några av dessa givare blir det efterföljande 5♣/5♦-svaret fortfarande ej täckt eftersom nästa bud inte är entydigt fastställt i den aktuella regelgrenen. De lämnas därför i loggen för separat granskning.

Alla ej täckta sekvenser och handuppgifter finns i JSON-loggen. Inga Nordisk Standard-regler har hittats på för att höja täckningsgraden.
