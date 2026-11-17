# Trumfstöd – modulstatus

Källa: **Nordisk standard, 2012-08-22**, s. 2–3 i användarens PDF. Ingen extern webbsökning används.

## Arkitektur

- `trumfstod.js` är huvudmodul för stödvisningar efter 1 i färg och öppningshandens andra bud när svarshanden visat en färg.
- `stenberg.js` är en återanvänd special-/undermodul för Stenberg 2NT. Stenbergreglerna kopieras inte till huvudmodulen.
- Befintliga hög- och lågfärgsmoduler fortsätter att hantera övriga svar och återbud. Trumfstödslagret dirigerar till rätt modul.
- `budbeslut.js` använder trumfstödslagret för svar på 1 i färg och för öppnarens återbud efter Stenberg.
- `rattningsmotor.js` skapar modulen och injicerar dess beroenden. `main` är orörd.

## Kartläggning mot PDF

### Svarshandens stödvisningar efter 1 i färg

| Öppning | Svar | Krav / innebörd |
|---|---|---|
| 1 lå | 2 lå | 6–9 htp, 4+ stöd; visa dock egen 4+ högfärg först |
| 1 lå | 3 lå | 10–12 htp, 4+ stöd |
| 1 lå | 4 lå | Spärr, max 9 htp, bra stöd och svitad hand |
| 1 lå | 2NT | 13+ htp, 4+ stöd; Stenberg och utgångskrav |
| 1 hö | 2 hö | 6–9 htp, 4+ stöd |
| 1 hö | 3 hö | 10–12 htp, 4+ stöd |
| 1 hö | 4 hö | Spärr, max 12 htp, bra stöd och svitad hand |
| 1 hö | 2NT | 13+ htp, 4+ stöd; Stenberg och utgångskrav |
| 1 i färg | dubbelhopp i ny färg | Renons i bjuden färg, 4+ stöd och 13+ htp |

**Prioritet:** Med lågfärgsstöd och 4+ kort i högfärg ska högfärgen visas först. Högfärgsstöd visas alltid. En enda renons med 4+ stöd och 13+ htp visas med dubbelhopp i renonsfärgen. Om handen har flera renoncer anger PDF:en ingen prioritet; dessa lägen lämnas EJ TÄCKTA i stället för att välja godtyckligt.

### Stenberg

Hög- och lågfärgsvarianterna finns kvar i `stenberg.js`. Huvudmodulen skickar 2NT dit. Dokumenterade öppnaråterbud är 3 i trumffärgen med 15+ htp utan singel, 3 i angiven sidofärg med singel samt 3NT med 12–14 hp balanserad hand. Fortsättningar som PDF:en inte beskriver ska fortsatt markeras EJ TÄCKTA.

### Öppningshandens andra bud efter svarshandens färgbud

- Trumfstöd (4+ stöd i svarshandens färg): lägsta möjliga höjning 12–16 htp.
- Enkelhopp i trumffärgen: 17–19 htp.
- Hopp till utgång: 20+ htp.
- Med lågfärgsstöd och 20+ htp ska 3NT undersökas först.

## Källluckor och expertlogg

Kända regler och numeriska gränser ska rättas som systemregler. Endast situationer som PDF:en inte täcker ska märkas `sourceGap`/EJ TÄCKT och gå till den befintliga expertloggen. Inga saknade prioriteringar eller fortsättningar fylls i genom antaganden.

## Tester och status

- `tests/trumfstod.test.js`: kontrollerar modulgränsen, routing till Stenberg och hög-/lågfärgsmodulerna, stödbudsklassificering samt dubbelhopp med renons och loggning av flera renoncer.
- `tests/stenberg-2nt.test.js`: befintliga Stenbergregressioner.
- Nästa verifieringssteg: köra hela testsviten och lägga till fullständiga givbaserade gränstester för varje rad i stödtabellen, särskilt spärrhöjningarna och dubbelhopp med renons.
