# AI-granskning av ostörd budgivning – 2026-11-18

## Resultat
- Givar: **1200** (100 per tema, 12 teman)
- Bedömda N/S-beslut: **5513**
- Verifierade beslut: **5482 (99.44 %)**
- Ej täckta eller motstridiga beslut: **31** i **28** unika sekvenser
- Interna motor-konflikter: **11**
- AI-förslag som först verifierats av rättningsmotorn: **1**
- Otillåtna/overifierade icke-passbud: **0**
- Ogiltiga auktioner: **0**

Öst/Väst passade i samtliga givar. Dubbling och inkliv ingår inte eftersom de kräver störd budgivning.

## Metod
AI-resonemanget använder den egna handen och den offentliga budgivningen. Det får inte ändra Nordisk Standard eller hitta på saknade konventioner. Ett kandidatbud måste sedan godkännas när det prövas som faktiskt bud av rättningsmotorn. Om motorn inte bekräftar det blir det pass och en loggad lucka.

## Viktigaste fynd
1. **Stenberg efter 1-färgsöppning:** flera händer hamnar mellan de uttryckliga svaren (15+ htp utan singel, singelvisning eller 12–14 hp balanserad). De lämnas ej täckta.
2. **Intern konflikt i slamkontrollen:** motorn kan föreslå 6♥/6♠ när spelaren passar, men när samma slam prövas som faktiskt bud föreslår motorn i stället 4♥/4♠. Dessa fall markeras nu som intern konflikt och rättas inte automatiskt.
3. **Öppnarens tredje bud efter 1-färgsöppning:** flera fortsättningar saknar en uttrycklig regel i underlaget.
4. **Svag tvåa:** den kompletterande AI-funktionen gav ett Stenberg-förslag med 13+ stp och minst tvåkorts stöd; rättningsmotorn bekräftade budet. Stödkravet är särskilt för svag tvåa och blandas inte ihop med vanlig Stenberg efter 1 i färg.
5. **Ingen gissningsbudgivning:** alla icke-passbud som inte verifieras spärras. Alla auktioner var strukturellt giltiga.

## Per tema
| Tema | Givar | N/S-beslut | Verifierade | Ej täckta | Motor-konflikter |
|---|---:|---:|---:|---:|---:|
| alla | 100 | 518 | 513 | 5 | 1 |
| nt | 100 | 513 | 513 | 0 | 0 |
| stenberg | 100 | 477 | 474 | 3 | 1 |
| tva | 100 | 566 | 566 | 0 | 0 |
| rkc | 100 | 524 | 514 | 10 | 5 |
| slam | 100 | 504 | 500 | 4 | 2 |
| slamnt | 100 | 497 | 497 | 0 | 0 |
| trumf | 100 | 401 | 400 | 1 | 0 |
| sang | 100 | 395 | 395 | 0 | 0 |
| invit | 100 | 365 | 365 | 0 | 0 |
| tvafarg | 100 | 553 | 545 | 8 | 2 |
| svag | 100 | 200 | 200 | 0 | 0 |

## Källkod
- Rättningsmotor: `7a1bcc367a93b36c6a7de449d5a23fe2a1a0d389`
- Tränare: `ccb91889ebb02026c53af196980f92a023f7c6bf`
