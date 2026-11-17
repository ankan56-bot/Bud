# Integrationsrevision: 1♣/1♦

Datum: 2026-11-17  
Arbetsgren: `work/minor-openings-1c-1d`  
Bas: `work/undisturbed-architecture`  
Status: implementerad och integrerad på arbetsgrenen; riktade tester, 200-givars stresstest och full CI godkända. Källluckor är avsiktligt kvar och loggas med fyra händer.

## 1. Modulgräns och ägarskap

- `lagfargsbudgivning.js` är färgspecifik adapter för 1♣ och 1♦.
- Gemensamma grundfunktioner återanvänds från `ettoppningssvar.js`; ingen kopia av högfärgsreglerna skapas.
- `trumfstod.js` fortsätter att routa Stenberg och vanliga stödvisningar.
- `stenberg.js` äger 2NT efter 1♣/1♦ och dess fortsättningar.
- 1NT-svarsfamiljen efter 1 i färg lämnas till den redan byggda gemensamma grenen och ändras inte här.
- `slamlogik.js` äger RKC/4NT; ingen slamkod dupliceras i lågfärgsmodulen.
- `budbeslut.js` är fortsatt central sekvensrouter.

## 2. Öppning

- 12–19 hp och minst fyra kort i öppningsfärgen.
- 11 hp med bra 5+ färg tillåts som en synlig vägledande tolkning. Källan använder uttrycket ”bra färg” men definierar inte exakt honnörskvalitet; den befintliga `good()`-kontrollen används därför med `ruleStatus: source_interpretation`.
- Fjärde hand efter tre pass behåller den befintliga 11-hp-regeln.
- Öppningsfärgsvalet ligger kvar centralt i `budbeslut.js`; det har inte ändrats i denna modul.

## 3. Svarshanden

Nordisk standard styr över Lathundens avvikande tillägg:

- 1 över 1: 6+ hp, minst fyra kort, rondkrav.
- 2 över 1: 11+ hp, minst fyra kort, rondkrav.
- 1NT: 6–10 hp och förnekar 4+ stöd samt en 4-kortsfärg som kan bjudas på 1-nivån.
- 1♣–1♦ är ett naturligt en-över-en-svar.
- Efter 1♦ kan 2♣ visa 11+ hp och minst fyra klöver.
- Lathundens undantag 10 hp + bra 6-kortsfärg införs inte som grundregel. I den relevanta 1♦–2♣-situationen väljs 1NT om handen i övrigt passar 6–10-hp-svaret.
- 4+ stöd i lågfärgsöppningen hanteras av det befintliga trumfstödslagret. 4+ högfärg visas före lågfärgsstödet.
- 2NT med 13+ htp och 4+ stöd lämnas till Stenberg.

## 4. Öppnarens återbud efter 1 över 1 / 2 över 1

- 4+ stöd i svarsfärgen lämnas till gemensam trumfstödslogik.
- Egen 6+ lågfärg utan 4+ sidofärg använder 12–16 HTP på lägsta nivå och 17–19 HTP med enkelhopp.
- 20+ HTP med egen lång lågfärg och utan sidofärg lämnas ej täckt; ingen 5-lågfärg antas.
- Tvåfärgshänder med minst nio kort i de två färgerna hanteras sekvensbundet. För hopp/omvänd visning krävs minst fem kort i öppningsfärgen och minst fyra i den andra färgen; 4–5 med kortare öppningsfärg får inte automatiskt hoppa. 12–17 hp visar andra färgen på lägsta nivå; 18+ HTP visar hopp när 5–4-profilen är uppfylld.
- Reverse identifieras utifrån den billigaste lagliga nivån: en högre sidofärg är reverse först när den billigaste visningen ligger på 2-nivån. En färg som kan visas på 1-nivån är ett naturligt färgbud, inte reverse.
- Lika långa alternativa sidofärger utan uttrycklig prioritet lämnas ej täckta.
- Balanserade återbud och 1NT-fortsättningen återanvänder den tidigare gemensamma logiken.

## 5. Svarshandens andra bud och öppnarens tredje bud

- Lågfärgsspecifika fortsättningar finns redan definierade i projektets analysbibliotek, träd T40. De implementeras som `project_extension`, inte som ordagranna regler ur PDF:en.
- Efter öppnarens 6+ lågfärg täcker T40: 2NT med balanserad 10–12 hp, minst två korts stöd och håll i sidofärgerna; 3 i lågfärgen med 11–12 HTP och minst tre stöd; 4 i lågfärgen med 13–18 HTP och minst fyra stöd; 3NT med 13+ hp, balanserad hand och håll; pass med 6–10 hp utan stöd eller egen lång sidofärg.
- Efter preferens/höjning till 3 i öppningslågfärgen täcker T40 minst åtta trumf: 28+ gemensamma poäng ger 5 i lågfärgen; under 28 stannar paret i 3-lågfärgen.
- Dessa T40-regler hålls tydligt åtskilda från Nordisk Standards direkta stödregler och Stenberg 2NT. De ska inte generaliseras till andra sekvenser.
- Öppnarens fortsättning efter 2NT-invit och andra senare fortsättningar utan uttrycklig T40-gren sparas som source gaps.
- 3NT-undersökning före lågfärgsutgång med 20+ HTP och stöd måste fortsatt respekteras; exakta saknade fortsättningar får inte hittas på.

## 6. Källuckor – inga antaganden

Följande ska fortsatt sparas med budsekvens och alla fyra händer i ej-täckta-loggen:

1. 20+ HTP och 4+ stöd i lågfärg: exakt 3NT-undersökning och när 5♣/5♦ väljs.
2. Fortsättningar efter 1m–1x–2m, inklusive svarshandens andra bud och öppnarens tredje bud, där PDF:en saknar en lågfärgsspecifik fortsättningsregel.
3. 20+ HTP med egen 6+ lågfärg utan sidofärg: exakt utgångsbud är inte definierat i det tillgängliga underlaget.
4. Två eller fler lika långa möjliga sidofärger när källan inte anger prioritet.
5. Numerisk definition av ”bra 5+ färg” vid 11 hp.
6. Undantaget 5–5 i spader–klöver där 1♣ kan väljas om spaderfärgen är dålig. Öppningsvalets kvalitetskriterium är inte definierat och den centrala öppningsväljaren ändras inte här.

## 7. Verifieringsresultat

Senaste godkända CI-körning: `44092411308` (commit `1a8afadc`).

- 200 deterministiska lågfärgsgivare.
- 1 026 bedömda budpositioner.
- 970 täckta positioner; 56 uttryckliga källuckor.
- 94,5 % täckningsgrad.
- 0 undantag, 0 olagliga rekommendationer, 0 ogiltiga auktioner, 0 ofärdiga auktioner och 0 kortintegritetsfel.
- Samtliga 56 ej täckta positioner sparas separat med budsekvens och alla fyra händer.
- Riktade 1♣/1♦-tester och den breda ostörda regressionskorpusen är godkända.

## 8. Regression och skydd

- 200-givarsvalideringen för 1♣/1♦: 1 026 N/S-positioner, 970 täckta (94,5 %), 56 explicita source gaps. Alla 56 sparas i `one_minor_200_uncovered_latest.json`; 0 olagliga rekommendationer, 0 ogiltiga budgivningar, 0 exceptions och 0 ofrivilligt oavslutade givar.

- Högfärgsmodulen ändras inte.
- 1NT-, trumfstöds-, Stenberg- och slammodulerna återanvänds.
- Inga dolda händer används i livebeslut.
- Alla källluckor förblir explicita; ett ej täckt läge får inte ersättas med ett sannolikt bud.
- `main` är orörd.
