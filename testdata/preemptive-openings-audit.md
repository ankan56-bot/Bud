# Spärröppningar – implementation och täckningsaudit

Branch: `work/theme-dataset-analysis`  
Rättningsmotor: 8.9  
Omfattning: ostörd budgivning vid spärröppning. Störd budgivning ingår inte.

## Gemensam definition av bra färg

Samma definition används som i svaga tvåor. Två separata kriterier räknas:

1. Minst två honnörer: A, K, D eller Kn.
2. Minst en honnör (A, K, D eller Kn) samt minst två av 10, 9 och 8.

Ett kriterium ger färgkvalitet nivå 1. Båda kriterierna ger färgkvalitet nivå 2. Noll kriterier innebär att färgen inte uppfyller kvalitetskravet.

## Öppningstrappa för 6-10 hp

| Färglängd | Ett kriterium | Båda kriterierna |
|---|---|---|
| 6 kort | 2♦/2♥/2♠ | 2♦/2♥/2♠ |
| 7 kort | 2♦/2♥/2♠ | 3 i färgen |
| 8 kort | 3 i färgen | 4 i färgen |

- Sexkortig ♣ öppnas inte svagt på 2♣ eftersom 2♣ är reserverat för starköppning; sexkortig ♣ räcker inte heller till spärr på 3-nivån.
- För 7-korts ♣ med ett eller båda kvalitetskriterierna används 3♣, eftersom 2♣ inte kan användas som svag öppning.
- För 8-korts ♣ används 3♣ med ett kriterium och 4♣ med båda.
- Noll kriterier: ingen spärröppning enligt denna modell.
- 9+ kort ligger utanför den här definierade 6-8-kortstrappan och ska loggas som ej täckt, inte tilldelas en påhittad nivå.
- Om flera färger delar längsta längd är färgvalets prioritering i spärrhanden inte uttryckligen definierad tillsammans med kvalitetskriterierna. Befintlig öppningsfärgsordning används tills expert har granskat gränsfallet.
- Öppningsintervallet 6-10 hp gäller för denna spärrfamilj. Övriga öppningsregler, inklusive 11 hp-regeln och starköppningen 2♣, behålls.

## Implementation

- Gemensam funktion räknar de två kvalitetskriterierna separat.
- Öppningsmotorn väljer nivå efter färglängd och antal uppfyllda kriterier.
- 2♣ förblir starköppning.
- Samtliga beslut avser ostörd budgivning. Inkliv, dubbling och konkurrenssekvenser ingår inte.

## Regressionstester

`testdata/weak-two.test.js` utökas med tester för:
- 7 kort: ett kriterium → 2-nivån; båda → 3-nivån; inget → pass.
- 8 kort: ett kriterium → 3-nivån; båda → 4-nivån; inget → pass.
- ♣-undantaget på grund av starköppningen 2♣.
- Befintliga tester för svaga tvåor och deras dokumenterade fortsättningar behålls.

## Kvarvarande luckor – expertlogg

- 9+ kort med 6-10 hp: exakt spärrnivå är inte fastställd i det tillgängliga systemunderlaget.
- Fortsättning efter 3- och 4-nivåns spärröppningar: saknas i det verifierade underlaget.
- Val mellan två lika långa spärrfärger när bara den ena uppfyller kvalitetskriteriet: behöver expertbesked.
- Svarshandens värdering och fortsättningsbud efter 3-/4-nivåns spärröppningar: ska inte härledas från svaga tvåor utan uttryckligt stöd.
- Samtliga ej täckta sekvenser ska sparas i expertloggen.

Ingen störd budgivning eller försvarsbudgivning har lagts till.


Status: rättningsmotor 8.9 och 20 regressionstester är incheckade. Testkörning/CI-status är ännu inte verifierad i denna session; inga tester påstås vara godkända förrän körresultat finns.
