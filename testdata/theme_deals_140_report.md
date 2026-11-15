# Baslinjerapport – 140 temagivare

## Omfattning och validering

- 14 teman × 10 givare = 140 givare.
- Samtliga givare har 52 unika kort och 13 kort per hand.
- Samtliga uppfyller generatorns temavillkor.
- Samtliga referensauktioner passerar `Rattning.validateAuction` utan strukturella fel.
- Rättningsmotor: version 6.6.
- DDS har inte körts; detta är en budgivnings-/täckningsbaslinje.
- 5 störda + 5 ostörda givare per tema där båda lägena är möjliga. Dubbling och inkliv genereras som störda.
- Givarna är reproducerbara via fasta seeds och `testdata/generate-theme-deals.js`.

## Rättningsutfall

| Bedömning | Antal |
|---|---:|
| Rätt | 578 |
| Fel | 0 |
| Valfritt | 0 |
| Ej täckt | 49 |

De 49 ej täckta buden är inte automatiskt felaktiga. De markerar lägen där grundsystemets nuvarande rättningsnyckel inte ger ett entydigt facit. De ska analyseras innan kompletterande regler föreslås.

## Resultat per tema

| Tema | Givare | Budpositioner | Ej täckt | Fel |
|---|---:|---:|---:|---:|
| Alla slags givar | 10 | 92 | 6 | 0 |
| 1NT, Stayman och överföringar | 10 | 100 | 0 | 0 |
| Stenberg 2NT (stöd i hög- och lågfärg) | 10 | 91 | 2 | 0 |
| 2♣-öppning (starka givar) | 10 | 112 | 0 | 0 |
| Essfråga (RKC) – alla färger | 10 | 111 | 2 | 0 |
| Slambudgivning i färg (kontrollbud och RKC) | 10 | 87 | 2 | 0 |
| Slambudgivning i sang | 10 | 100 | 0 | 0 |
| Trumfstöd (stödbud i färg) | 10 | 74 | 6 | 0 |
| Sanghänder (1NT/2NT och svar) | 10 | 80 | 0 | 0 |
| Inviter (invit eller utgång) | 10 | 66 | 0 | 0 |
| Tvåfärgshänder (andra bud) | 10 | 89 | 6 | 0 |
| Svaga öppningar och spärrbud | 10 | 58 | 0 | 0 |
| Upplysningsdubbling (dubbla och svara, alltid störd) | 10 | 68 | 15 | 0 |
| Inkliv och dubbling (alla bjuder) | 10 | 54 | 10 | 0 |

## Viktig metodbegränsning

Referensauktionen skapas deterministiskt med befintlig rättningsmotor och träningssidans Öst/Väst-logik. Den är användbar för att hitta täckningsluckor och testa reproducerbarhet, men den är inte en oberoende expertbudgivning eller ett självständigt facit. Att rättningsmotorn godkänner ett bud i denna baslinje bevisar därför inte att motorn är strategiskt optimal.

Alla givars `caseType` är tills vidare `unclassified`. Fördelningen 7 typiska/3 gränsnära ska inte hävdas förrän givarna har granskats och klassificerats.

## Körning

```bash
node testdata/generate-theme-deals.js
node --test testdata/theme-deals.test.js
```

Tester kontrollerar 140 givare, 10 per tema, kortintegritet, strukturella auktioner och att fasta seeds återskapar samma händer och budsekvenser.


## Närmare analys av de 49 ej täckta buden

Samtliga 49 ej täckta bedömningar är pass i den genererade referensauktionen. Det är en följd av att referensgeneratorn väljer pass när rättningsmotorn saknar ett säkert budförslag. Det betyder **inte** att 49 pass har bevisats vara rätt eller fel; de är kandidater för vidare analys.

| Orsak enligt rättningsmotorn | Antal |
|---|---:|
| Konkurrensbudgivning / motståndarna ingriper | 27 |
| Budsekvens utanför dokumenterade turordnade mönster | 11 |
| Dokumentet anger inte budet för handen | 9 |
| Svarshandens andra bud efter 1 i färg | 1 |
| Handtyp eller fortsättning kan inte avgöras säkert | 1 |

Den största samlade gruppen (27) gäller konkurrensbudgivning där motståndarna ingriper. Därefter kommer 11 sekvenser som inte följer ett dokumenterat turordnat mönster och 9 lägen där rättningsmotorn anger att dokumentet inte specificerar budet för handen. Ett enskilt fall gäller svarshandens andra bud efter 1 i färg. Ett fall är uttryckligen osäkert med tillgängliga uppgifter.

Exakta budsekvenser, positioner och fyra händer för dessa fall finns i `testdata/uncovered_cases_49.json`. Dessa ska analyseras mot `LOGG_BUDREGLER.md` och övriga systemkällor innan någon ny regel läggs till. Ingen avvikelse ska fyllas med en påhittad systemregel.
