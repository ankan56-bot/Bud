# Analys av 200 giv – första täckningspasset

Datum: 2026-11-14  
Motor: rattningsmotor.js v5.2  
Underlag: bridge_100_deals.json (giv 1–100) och bridge_100_deals_round2.json (giv 101–200).

## Metod
- Alla kortvärden A/K/Q/J/T normaliserades till 14/13/12/11/10 innan HCP och fördelning beräknades.
- Varje giv roterades så att givens faktiska givare blev Nord; därmed kunde motorns Nord/Syd-bedömning användas för samma test.
- Öppningsbuden genererades utifrån det fastställda systemet och jämfördes med motorns bedömning.
- Därefter provades svar och återbud på motorns dokumenterade huvudvägar. När en nod saknade regel markerades den som ej täckt.
- Detta är en täckningsinventering, inte en fullständig AI-genererad och bridgeexpertverifierad slutbudgivning för alla 200 givar. Ingen slutsats om optimal slutkontrakt eller DDS görs.

## Resultat – öppningsbud
| Test | Rätt | Fel | Valfritt | Ej täckt |
|---|---:|---:|---:|---:|
| Giv 1–100 | 100 | 0 | 0 | 0 |
| Giv 101–200 | 100 | 0 | 0 | 0 |

Öppningsreglerna täcker alltså samtliga 200 öppningssituationer i detta test.

## Resultat – fortsättningar på dokumenterade huvudvägar
| Nod | Testade situationer | Täckta | Ej täckta |
|---|---:|---:|---:|
| Svar efter öppning | 80 | 75 | 5 |
| Öppnarens återbud | 61 | 56 | 5 |
| Svarshandens tredje bud | 48 | 4 | 44 |

Viktigt: testet följer motorns huvudförslag vid föregående bud. Det mäter vilka grenar som saknar regler, inte hur ofta de uppstår i verkligt spel.

## Identifierade luckor med hög prioritet
1. **Svar efter spärröppning på 3-nivån** – fem testade svarslägen saknar uttrycklig fortsättningsregel.
2. **Öppnarens återbud efter 1NT-svar** – vissa händer saknar definierad återbudsväg.
3. **Öppnarens återbud efter spärrhöjning** – fortsättningen efter 3M-stöd är inte definierad.
4. **Svarshandens tredje bud efter 1 i färg** – mycket stor lucka. Exempel är fortsättningar efter 1♦–1♠–3♦, 1♥–1♠–2♦ och 1♥–2♦–2♥.
5. **Svarshandens tredje bud efter 1NT-svar** – flera fortsättningar efter 1♠–1NT–2♦ behöver hanteras bredare än det nuvarande undantaget för 6–9 hp och 6+ kort.

## Regelkonflikter
Inga direkta konflikter med de fastställda öppningsreglerna hittades i detta pass. Öppningsbudens test följer samma prioriteringar som motorn:
- 1NT 15–17 hp balanserad.
- 2NT 20–21 hp balanserad.
- 2♣ för starka händer enligt systemet.
- 1 i färg 12–19 hp.
- 11 hp med angiven färgkvalitet.
- Svag tvåa med exakt sex kort och angiven färgkvalitet.
- 7-korts spärröppning på 3-nivån enligt motorns befintliga regel.

## Nästa arbete
- Utöka svarshandens tredje bud efter 1 i färg.
- Utöka återbud efter 1NT-svar.
- Definiera fortsättning efter spärröppningar och spärrhöjningar.
- Därefter köra om hela 200-givstestet och jämföra antal rätt/fel/valfritt/ej täckt.


## Första implementationen av bokreglerna

Efter första täckningspasset har bokens fyra handtyper för svarshandens andra bud efter öppnarens återbud implementerats i `rattningsmotor.js` (v5.3):
- öppnaren visar stöd i svarshandens färg,
- öppnaren visar balanserad hand,
- öppnaren visar minst sex kort i egen färg,
- öppnaren visar två färger.

Poänggränserna är anpassade till systemets gemensamma beräkning: 26 spelpoäng i högfärg, 28 i lågfärg och 26 honnörspoäng i sang. Fördelningspoäng räknas bara i färg med minst åtta gemensamma trumfkort. Bokens intervall har alltså inte kopierats direkt.

**Viktigt:** Kodändringen är gjord, men de 200 givarna har ännu inte körts om efter ändringen. Täckningssiffrorna ovan är baslinjen från v5.2 och ska inte läsas som ett resultat för v5.3. Nästa steg är regressionstest av nya grenar och tidigare godkända budsekvenser.
