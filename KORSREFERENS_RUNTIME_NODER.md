# Korsreferensrapport: överlappande budsekvenser och runtime-täckning

**Datum:** 2026-11-16  
**Gren:** `work/undisturbed-architecture`  
**Källor:** `analysbibliotek.json`, `rattningsmotor.js`, `analysmotor.js`  
**Avgränsning:** Ostörd budgivning. T29–T33 (störd budgivning) är pausade och ingår inte.

## 1. Runtime-täckning per systemfamilj

Det här är en funktionell korsreferens, inte ett påstående om att varje gren är fullständigt implementerad eller verifierad. En kodfunktion kan hantera flera varianter, och ett biblioteksträd kan beskriva pedagogiska situationer som inte har en unik runtime-nod.

| Systemfamilj | Bibliotek | Runtime-funktioner | Bedömning |
|---|---|---|---|
| Öppning 1 i färg, 1NT, 2NT, stark 2♣, svag tvåa och spärr | T36, T41 samt delvis T02/T34 | `openingNode()`, `open2w()` och dispatcher i `nodeForRaw()` | Delvis. T36 profilerar öppningar 1♣–1♠; övriga öppningstyper behöver separat täckningsmatris. |
| Svar efter 1 i färg | T37 | `resp1()` | Delvis. Trädet har 18 profilnoder; kontrollera att alla budvarianter och HP/HTP-gränser matchar. |
| Öppnarens återbud efter 1 över 1 | T39 | `reb1()` | Stort träd (37 noder), men vissa grenar och 4-4-4-1-specialfall behöver korsverifieras. |
| Svarshandens andra bud efter öppnarens återbud | T40 | `responderSecondBid()` | Delvis och strukturellt fel: T40-root är inte ett nod-ID. Flera funktionella regler läser dessutom partnerns faktiska hand i den nuvarande runtime-koden. |
| 1NT Stayman och överföring | T03, T06–T08, T11–T13, T19–T20, T24–T28 | `ntResp()`, `stay2()`, `transfer2()`, `ntOpener()`, `ntOpenerInvit()`, `ntOpener3()`, `ntOpener3NTChoice()` | Brett modellerat men överlappande. `findMatch()` kontrollerar inte handprofiler och väljer bara första längsta sekvensträffen. |
| 1NT svagt lågfärgsrelä | T42 | dispatcher för 1NT/2NT | Bibliotek finns; runtime-mappning och regressioner behöver verifieras separat. |
| 1NT 4NT och slamgränser | T43, T02 | `agreedNoTrumpAceAsk()`, `rkcReply()`, `rkcNextStep()` och 4NT-grenar | Delvis. T43 dokumenterar vägen fram till 4NT; svar/fortsättning ligger delvis utanför omfattningen. |
| Stenberg 2NT och öppnarens återbud | T34, T01, T44 | Stenberg-grenar i `nodeForRaw()`, `rkcTrumpFromAuction()` | Delvis. T01/T44 har RKC-svar; andra återbud och fortsättningar är inte komplett konsoliderade. |
| Öppnarens återbud efter 1M–2M | T35 | `reb1()` / särskild Stenberg- och höjningslogik | Delvis. Två separata träd/funktioner behöver kontrolleras mot samma handprofilskrav. |
| Höjningar/inviter i högfärg | T05, T10, T14–T16, T21–T22, T45 | `resp1()`, `reb1()`, `responderSecondBid()` | Överlappande. Hjärter/spader har inte helt symmetrisk nodmängd; T45 tillför spaderinvit. |
| Stark 2♣ | T41 | `resp2c()`, `reb2c()`, `resp2c2()`, `ntResp()` | Stort träd (31 noder). Kräver fortsatta tester för varje öppnaråterbud och Herbertgren. |
| Svag tvåa | Inget samlat ostört träd identifierat | `resp2w()`, `open2w()` | Runtime finns, men bibliotekstäckningen är inte samlad. Måste behandlas som lucka i pedagogisk nodkarta. |
| Spärröppningar 3-/4-nivå | Inget samlat ostört träd identifierat | öppningslogik och enklare svarsvillkor i dispatcher | Otillräcklig pedagogisk täckning. |
| RKC efter fastställd trumf | T01, T44 samt T43 för 1NT-överföringskontext | `rkcReply()`, `rkcNextStep()` | Delvis. RKC-svar finns; efterföljande slamval och vissa svarskontexter är uttryckligen ej täckta. |
| Konkurrensbudgivning | T29–T33 | overcall-/dubblingsfunktioner | **Pausad. Ska inte ändras i denna etapp.** |

## 2. Sekvenskollisioner – alla 26 grupper

Följande ostörda noder delar exakt samma lagrade budsekvens. Detta är inte automatiskt fel eller dubbletter. Varje grupp måste klassificeras som samma regel och redundant pedagogisk nod; olika handprofiler/roller; olika betydelser/fortsättningar; eller faktisk konflikt i systemunderlaget.

`findMatch()` väljer i dag en enda träff efter sekvenslängd och JSON-ordning. Den väger inte in `handProfile`, roll eller trädvillkor.

### 1. `1NT → Pass → 2♦`
- **T03_OVERFORING_PASS / t03_n0 – Överföring till hjärter – grundsekvens och fortsättningar**
  - Betydelse: 2♦ är överföring till hjärter och visar minst fem hjärter. Öppnaren fullföljer normalt med 2♥; med 17 hp och minst fyra hjärter finns superaccept 3♥.
  - Analys: Överföringen används med både svaga händer, inviter och starka händer. Öppnaren ska normalt bjuda 2♥. Superaccept 3♥ är ett särskilt alternativ med 17 hp och minst fyra hjärter.
  - Handprofil: {"opener":"15–17 hp, balanserad 1NT-hand; superaccept 3♥ visar 17 hp och minst fyra hjärter.","responder":"Minst fem hjärter; styrkan kan vara svag, invitativ eller utgångs-/slamintresserad."}
  - Grenar: 2♥ → t03_n1; 3♥ → t27_superaccept
- **T07_OVERFORING_HJARTER / t07_n0 – Överföring till hjärter – grundsekvens och fortsättningar**
  - Betydelse: 2♦ är överföring till hjärter och visar minst fem hjärter. Öppnaren fullföljer normalt med 2♥; med 17 hp och minst fyra hjärter finns superaccept 3♥.
  - Analys: Överföringen används med både svaga händer, inviter och starka händer. Öppnaren ska normalt bjuda 2♥. Superaccept 3♥ är ett särskilt alternativ med 17 hp och minst fyra hjärter.
  - Handprofil: {"opener":"15–17 hp, balanserad 1NT-hand; superaccept 3♥ visar 17 hp och minst fyra hjärter.","responder":"Minst fem hjärter; styrkan kan vara svag, invitativ eller utgångs-/slamintresserad."}
  - Grenar: 2♥ → t07_n1; 3♥ → t27_superaccept

### 2. `1NT → Pass → 2♦ → Pass → 2♥`
- **T03_OVERFORING_PASS / t03_n1 – Överföring till hjärter – grundsekvens och fortsättningar**
  - Betydelse: Öppnaren har fullföljt överföringen. Svarshanden väljer därefter pass, invit, utgång eller slamväg efter styrka och längd.
  - Analys: 0–8 hp: pass. 9 hp: 2NT med exakt fem hjärter eller 3♥ med minst sex. 10–15 hp: exakt fem hjärter och jämn hand – 3NT vid minst 26 gemensamma honnörspoäng, 2NT-invit vid 22–25; minst sex hjärter – 4♥ vid minst 26 gemensamma spelpoäng, annars 3♥-invit vid 22–25. Med 10+ hp och sidofärg kan 3♣/3♦ vara utgångskrav; 2♠ kan visa 5+ hjärter och 4+ spader. Vid 16+ hp är valet mellan kontrollbud och 4NT RKC ännu inte automatiserat. RKC 1430 är synkroniserat i analysbibliotek och rättningsmotor. Fortsättningen efter nyckelkortssvaren hanteras separat och lämnas ej täckt där systemregler saknas.
  - Handprofil: {"opener":"15–17 hp, balanserad 1NT-hand; 2♥ fullföljer den artificiella överföringen och visar minst två hjärter enligt motorns betydelse. Tillsammans med svarshandens 5+ hjärter blir fitten minst sju kort, men inte nödvändigtvis åtta.","responder":"Minst fem hjärter; 0–8 hp pass, 9 hp invit efter längd, 10–15 hp utgångsväg, 16+ hp slamintresse."}
  - Grenar: Pass [utan mål]; 2NT → t19_0; 3♥ → t27_overforing_hjarter_sexkort_invit_n2; 3NT [utan mål]; 4♥ [utan mål]; 2♠ [utan mål]; 3♣ [utan mål]; 3♦ [utan mål]; 4♣ [utan mål]; 4♦ [utan mål]; 4NT → t43_n2
- **T07_OVERFORING_HJARTER / t07_n1 – Överföring till hjärter – grundsekvens och fortsättningar**
  - Betydelse: Öppnaren har fullföljt överföringen. Svarshanden väljer därefter pass, invit, utgång eller slamväg efter styrka och längd.
  - Analys: 0–8 hp: pass. 9 hp: 2NT med exakt fem hjärter eller 3♥ med minst sex. 10–15 hp: exakt fem hjärter och jämn hand – 3NT vid minst 26 gemensamma honnörspoäng, 2NT-invit vid 22–25; minst sex hjärter – 4♥ vid minst 26 gemensamma spelpoäng, annars 3♥-invit vid 22–25. Med 10+ hp och sidofärg kan 3♣/3♦ vara utgångskrav; 2♠ kan visa 5+ hjärter och 4+ spader. Vid 16+ hp är valet mellan kontrollbud och 4NT RKC ännu inte automatiserat. RKC 1430 är synkroniserat i analysbibliotek och rättningsmotor. Fortsättningen efter nyckelkortssvaren hanteras separat och lämnas ej täckt där systemregler saknas.
  - Handprofil: {"opener":"15–17 hp, balanserad 1NT-hand; 2♥ fullföljer den artificiella överföringen och visar minst två hjärter enligt motorns betydelse. Tillsammans med svarshandens 5+ hjärter blir fitten minst sju kort, men inte nödvändigtvis åtta.","responder":"Minst fem hjärter; 0–8 hp pass, 9 hp invit efter längd, 10–15 hp utgångsväg, 16+ hp slamintresse."}
  - Grenar: Pass [utan mål]; 2NT → t19_0; 3♥ → t27_overforing_hjarter_sexkort_invit_n2; 3NT [utan mål]; 4♥ [utan mål]; 2♠ [utan mål]; 3♣ [utan mål]; 3♦ [utan mål]; 4♣ [utan mål]; 4♦ [utan mål]; 4NT → t43_n2
- **T27_OVERFORING_HJARTER_SEXKORT_INVIT / t27_overforing_hjarter_sexkort_invit_n0 – Överföring till hjärter – sexkortsfärg och invit**
  - Betydelse: Öppnaren fullföljer överföringen.
  - Analys: Svarshanden har minst sex hjärter och cirka 8–9 hp. Efter fullföljd överföring inviterar svarshanden med 3♥. Motståndaren passar innan svarshanden väljer invit eller direkt utgång.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning; minst trekortsstöd för högfärgsutgång","responder":"Minst sex kort i hjärter; normalt 9 hp eller 10+ hp med 22–25 gemensamma spelpoäng för invit."}
  - Grenar: Pass → t27_overforing_hjarter_sexkort_invit_n1

### 3. `1♥ → Pass → 2♥`
- **T05_HJARTERFIT_PASS / t05_n0 – Hjärterfit – stanna i 2♥**
  - Betydelse: 2♥ visar stöd och en begränsad hand, normalt cirka 6–9 hp i detta förenklade system.
  - Analys: Syd visar hjärterstöd men inte invitstyrka. Norr har minimum och ingen anledning att fortsätta. Pass är därför ett aktivt och korrekt slutbeslut.
  - Handprofil: SAKNAS
  - Grenar: Pass [utan mål]
- **T10_1H_ENKEL_HOJNING / t10_n0 – Enkel höjning av hjärter – begränsad hand med trumfstöd**
  - Betydelse: 2♥ visar hjärterstöd och en begränsad svarshand.
  - Analys: Öppnaren har en enfärgshand eller tvåfärgshand med minst fem hjärter och öppningsstyrka. Svarshanden har trumfstöd och cirka 6–9 hp. Sang väljs bort eftersom paret har hittat en högfärgsfit, och en annan färg behöver inte introduceras med en begränsad hand. Öppnaren passar med minimum; med extra styrka krävs en annan fortsättning än enkel höjning.
  - Handprofil: {"opener":"Öppningsstyrka, minst fem hjärter","responder":"6–9 hp, trumfstöd med minst tre hjärter"}
  - Grenar: Pass [utan mål]; 3♥ → t10_n1
- **T21 / t21_0 – Färgprov efter 1♥–2♥ – hjärterfit**
  - Betydelse: Färgprov efter 1♥–2♥ – hjärterfit
  - Analys: Svarshanden har normalt 6–9 hp och minst trekortsstöd. Öppnaren har tillägg och undersöker utgångschansen genom ett färgprov. Provfärgen pekar ut var öppnaren behöver hjälp. En direkt 4♥ kräver en hand där öppnaren anser att utgången är tillräckligt stark utan ytterligare undersökning.
  - Handprofil: {"opener":"Minst fem hjärter, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre hjärter, bedömer honnörer och fördelning"}
  - Grenar: 3♣ → t21_1; 3♦ → t21_2; 3♠ → t21_3; 4♥ → t21_4

### 4. `1NT → Pass → 2♣ → Pass → 2♦`
- **T06_STAYMAN_INGEN_HOGFARG / t06_n1 – Stayman – ingen högfärg hittas, sanginvit**
  - Betydelse: 2♦ visar att öppnaren saknar fyrkortshögfärg.
  - Analys: 2♦ visar att öppnaren saknar fyrkortshögfärg. Med balanserad svarshand och 22–25 gemensamma honnörspoäng väljs 2NT som invit; med minst 26 väljs 3NT. Den uttryckligen avtalade fyr-essfrågan 4NT är också tillgänglig i denna sekvens.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning, ingen fyrkortshögfärg","responder":"Balanserad hand; 22–25 gemensamma honnörspoäng för 2NT-invit eller minst 26 för 3NT."}
  - Grenar: 2NT → t06_n2; 3NT [utan mål]; 4NT → t43_n1
- **T26_STAYMAN_INGEN_HOGFARG_INVIT / t26_n0 – Stayman – ingen högfärg, sanginvit**
  - Betydelse: Öppnaren förnekar fyrkortshögfärg.
  - Analys: Efter Stayman visar 2♦ ingen fyrkortshögfärg. Motståndaren passar; svarshanden väljer sedan sanginvit med 2NT eller direkt 3NT med utgångsstyrka.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning, ingen fyrkortshögfärg","responder":"Jämn hand, ingen fyrkortshögfärg"}
  - Grenar: Pass → t26_n1

### 5. `1NT → Pass → 2♣ → Pass → 2♦ → Pass → 2NT`
- **T06_STAYMAN_INGEN_HOGFARG / t06_n2 – Stayman – ingen högfärg hittas, sanginvit**
  - Betydelse: Öppnaren accepterar 2NT-inviten med 3NT endast om paret har minst 26 gemensamma honnörspoäng; annars pass.
  - Analys: Svarshanden har cirka 8–9 hp och jämn fördelning. Stayman har prövat högfärgerna men ingen passande fyrkortshögfärg hittades. Därför väljs sang framför hjärter eller spader. Öppnaren passar med minimum och bjuder 3NT med maximum och lämpliga honnörer. Beslutet grundas på parets faktiska gemensamma honnörspoäng, inte enbart öppnarens 16–17 hp.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning","responder":"8–9 hp, jämn fördelning"}
  - Grenar: Pass [utan mål]; 3NT [utan mål]
- **T26_STAYMAN_INGEN_HOGFARG_INVIT / t26_n2 – Stayman – ingen högfärg, sanginvit**
  - Betydelse: Svarshanden inviterar till 3NT.
  - Analys: 2NT visar cirka 8–9 hp. Motståndarna passar normalt innan öppnaren avgör om handen har maximum eller goda honnörsvärden.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning","responder":"Balanserad hand utan fyrkortshögfärg; 22–25 gemensamma honnörspoäng för 2NT-invit."}
  - Grenar: Pass → t26_n3

### 6. `1NT → Pass → 2♥ → Pass → 2♠`
- **T08_OVERFORING_SPADER / t08_n1 – Överföring till spader – grundsekvens och fortsättningar**
  - Betydelse: Öppnaren har fullföljt överföringen. Svarshanden väljer därefter pass, invit, utgång eller slamväg efter styrka och längd.
  - Analys: 0–8 hp: pass. 9 hp: 2NT med exakt fem spader eller 3♠ med minst sex. 10–15 hp: exakt fem spader och jämn hand – 3NT vid minst 26 gemensamma honnörspoäng, 2NT-invit vid 22–25; minst sex spader – 4♠ vid minst 26 gemensamma spelpoäng, annars 3♠-invit vid 22–25. Med 10+ hp och sidofärg kan 3♣/3♦ vara utgångskrav; 3♥ kan visa 5-5 i högfärgerna som invit. Vid 16+ hp är valet mellan kontrollbud och 4NT RKC ännu inte automatiserat. RKC 1430 är synkroniserat i analysbibliotek och rättningsmotor. Fortsättningen efter nyckelkortssvaren hanteras separat och lämnas ej täckt där systemregler saknas.
  - Handprofil: {"opener":"15–17 hp, balanserad 1NT-hand; 2♠ fullföljer den artificiella överföringen och visar minst två spader enligt motorns betydelse. Tillsammans med svarshandens 5+ spader blir fitten minst sju kort, men inte nödvändigtvis åtta.","responder":"Minst fem spader; 0–8 hp pass, 9 hp invit efter längd, 10–15 hp utgångsväg, 16+ hp slamintresse."}
  - Grenar: Pass [utan mål]; 2NT → t20_0; 3♠ → t28_overforing_spader_sexkort_invit_n2; 3NT [utan mål]; 4♠ [utan mål]; 3♥ [utan mål]; 3♣ [utan mål]; 3♦ [utan mål]; 4♣ [utan mål]; 4♦ [utan mål]; 4NT → t43_n3
- **T28_OVERFORING_SPADER_SEXKORT_INVIT / t28_overforing_spader_sexkort_invit_n0 – Överföring till spader – sexkortsfärg och invit**
  - Betydelse: Öppnaren fullföljer överföringen.
  - Analys: Svarshanden har minst sex spader och cirka 8–9 hp. Efter fullföljd överföring inviterar svarshanden med 3♠. Motståndaren passar innan svarshanden väljer invit eller direkt utgång.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning; minst trekortsstöd för högfärgsutgång","responder":"Minst sex kort i spader; normalt 9 hp eller 10+ hp med 22–25 gemensamma spelpoäng för invit."}
  - Grenar: Pass → t28_overforing_spader_sexkort_invit_n1

### 7. `1NT → Pass → 3NT`
- **T09_1NT_DIREKT_3NT / t09_n0 – Direkt 3NT – jämn hand med utgångsstyrka**
  - Betydelse: 3NT är direkt slutbud först när paret har minst 26 gemensamma honnörspoäng och ingen högfärgsfit ska undersökas. Vid 22–25 och balanserad svarshand används 2NT som invit.
  - Analys: Öppnaren har 15–17 hp och en jämn hand. Svarshanden har en jämn hand med cirka 10–15 hp, vilket normalt ger tillräcklig styrka för sangutgång. Högfärg väljs bort eftersom ingen femkortsfärg eller känd fit finns. En lång lågfärg behöver inte undersökas när handen passar för sang och styrkan räcker till utgång.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning","responder":"Balanserad hand utan 4-korts högfärg att undersöka; tillsammans med öppnaren minst 26 gemensamma honnörspoäng."}
  - Grenar: inga
- **T18_1NT_3NT_DIREKT / t18_n0 – Direkt utgång efter 1NT**
  - Betydelse: 3NT är direkt slutbud först när paret har minst 26 gemensamma honnörspoäng och ingen högfärgsfit ska undersökas. Vid 22–25 och balanserad svarshand används 2NT som invit.
  - Analys: Svarshanden har cirka 10–15 hp och jämn fördelning. Tillsammans har paret normalt tillräcklig styrka för sangutgång. Högfärg väljs bort eftersom svarshanden saknar fyrkortshögfärg som behöver undersökas och ingen trumffit är känd. En direkt 3NT beskriver handen effektivt och lämnar inte motståndarna onödig information.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning","responder":"Balanserad hand utan 4-korts högfärg att undersöka; tillsammans med öppnaren minst 26 gemensamma honnörspoäng."}
  - Grenar: inga

### 8. `1♥ → Pass → 2♥ → Pass → 3♥`
- **T10_1H_ENKEL_HOJNING / t10_n1 – Enkel höjning av hjärter – begränsad hand med trumfstöd**
  - Betydelse: Öppnaren visar tillägg efter den begränsade höjningen.
  - Analys: Svarshanden har visat en begränsad hand med hjärterstöd. Öppnaren kan invitera vidare med tillägg, men svarshanden behöver inte acceptera utan tillräckliga värden. Pass stannar i 3♥; 4♥ väljs när svarshanden har övre delen av sin visade styrka eller fördelningsvärden som motiverar utgång.
  - Handprofil: {"opener":"Öppningsstyrka med tillägg, minst fem hjärter","responder":"Begränsad höjning, 6–9 hp, tre- eller fyrkorts hjärterstöd"}
  - Grenar: Pass [utan mål]; 4♥ [utan mål]
- **T35_OPENER_REBID_AFTER_1M_2M / t35_h_3h – Öppnarens återbud efter 1M–2M**
  - Betydelse: 3♥ visar 17–19 HTP utan singleton.
  - Analys: Öppnaren inviterar till 4♥ med extra styrka men utan singelton i sidofärg.
  - Handprofil: {"opener":"17–19 HTP, ingen singleton","responder":"6–12 HTP, minst fyra hjärter"}
  - Grenar: inga

### 9. `1NT → Pass → 2♣ → Pass → 2♥`
- **T11_STAYMAN_HJARTERFIT_UTGANG / t11_n0 – Stayman hittar hjärterfit – utgång**
  - Betydelse: 2♥ visar fyrkortshjärter hos öppnaren.
  - Analys: Öppnaren har 15–17 hp och jämn fördelning med minst fyra hjärter. Stayman har hittat en möjlig högfärgsfit. Svarshanden har också minst fyra hjärter och utgångsstyrka. Hjärter väljs framför sang eftersom paret har minst åtta trumf tillsammans.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning, minst fyra kort i hjärter","responder":"Minst fyra kort i hjärter; 8+ korts fit och minst 26 gemensamma spelpoäng för utgång."}
  - Grenar: 4♥ [utan mål]
- **T24_STAYMAN_HJARTER_INVIT / t24_stayman_hjarter_invit_n0 – Stayman hittar hjärterfit – invit till 4♥**
  - Betydelse: Öppnaren visar fyrkortsfärg i hjärter efter Stayman.
  - Analys: Svarshanden har fyrkortsstöd och invitstyrka. Efter öppnarens svar passar motståndaren innan svarshanden väljer mellan invit och direkt utgång. Öppnaren accepterar endast när paret har minst 26 gemensamma spelpoäng i den etablerade 8-kortsfitten; annars pass.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning, minst fyra hjärter","responder":"Minst fyra hjärter och 8-korts fit; 22–25 gemensamma spelpoäng för invit eller minst 26 för direkt utgång."}
  - Grenar: Pass → t24_stayman_hjarter_invit_n1

### 10. `1NT → Pass → 2♣ → Pass → 2♠`
- **T12_STAYMAN_SPADERFIT_UTGANG / t12_n0 – Stayman hittar spaderfit – utgång**
  - Betydelse: 2♠ visar fyrkortsspader hos öppnaren.
  - Analys: Öppnaren har 15–17 hp och jämn fördelning med minst fyra spader. Stayman har hittat en högfärgsfit. Svarshanden har minst fyra spader och utgångsstyrka. Spader väljs framför sang eftersom en gemensam åttakortsfit ger ett naturligt trumfkontrakt.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning, minst fyra kort i spader","responder":"Minst fyra kort i spader; 8+ korts fit och minst 26 gemensamma spelpoäng för utgång."}
  - Grenar: 4♠ [utan mål]
- **T25_STAYMAN_SPADER_INVIT / t25_stayman_spader_invit_n0 – Stayman hittar spaderfit – invit till 4♠**
  - Betydelse: Öppnaren visar fyrkortsfärg i spader efter Stayman.
  - Analys: Svarshanden har fyrkortsstöd och invitstyrka. Efter öppnarens svar passar motståndaren innan svarshanden väljer mellan invit och direkt utgång. Öppnaren accepterar endast när paret har minst 26 gemensamma spelpoäng i den etablerade 8-kortsfitten; annars pass.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning, minst fyra spader","responder":"Minst fyra spader och 8-korts fit; 22–25 gemensamma spelpoäng för invit eller minst 26 för direkt utgång."}
  - Grenar: Pass → t25_stayman_spader_invit_n1

### 11. `1NT → Pass → 2♣ → Pass → 2♥ → Pass → 3♥`
- **T13_STAYMAN_HJARTERINVIT / t13_n0 – Stayman hittar hjärterfit – invit**
  - Betydelse: 3♥ är en invit till 4♥ med hjärterstöd.
  - Analys: Svarshanden har cirka 8–9 hp och fyrkortshjärter. Öppnaren har visat fyrkortshjärter och därmed finns minst åtta trumf tillsammans. Svarshanden inviterar till utgång i stället för att välja 2NT, eftersom hjärterfitten gör färgkontraktet mer attraktivt. Öppnaren accepterar med maximum och lämplig hand, annars passar. Öppnaren accepterar endast när paret har minst 26 gemensamma spelpoäng i den etablerade 8-kortsfitten; annars pass.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning, minst fyra hjärter","responder":"Minst fyra hjärter och 8-korts fit; 22–25 gemensamma spelpoäng för 3♥-invit."}
  - Grenar: Pass [utan mål]; 4♥ → t13_n1
- **T24_STAYMAN_HJARTER_INVIT / t24_stayman_hjarter_invit_n2 – Stayman hittar hjärterfit – invit till 4♥**
  - Betydelse: Svarshanden inviterar till 4♥.
  - Analys: Invitbudet visar fyrkortsstöd och cirka 8–9 hp. Motståndarna passar normalt innan öppnaren fattar beslut.
  - Handprofil: {"opener":"15–17 hp, jämn fördelning, minst fyra hjärter","responder":"Minst fyra hjärter och 8-korts fit; 22–25 gemensamma spelpoäng för invit eller minst 26 för direkt utgång."}
  - Grenar: Pass → t24_stayman_hjarter_invit_n3

### 12. `1NT → Pass → 2♣ → Pass → 2♥ → Pass → 3♥ → Pass → 4♥`
- **T13_STAYMAN_HJARTERINVIT / t13_n1 – Stayman hittar hjärterfit – invit**
  - Betydelse: 4M – accepterar inviten när paret har minst åtta trumfkort och 26 gemensamma spelpoäng.
  - Analys: Svarshanden har visat en invit med hjärterstöd efter Stayman. Öppnaren har maximum inom 1NT-intervallet och tillräckligt bra stöd eller sidovärden för att acceptera. Med minimum hade öppnaren passat på 3♥.
  - Handprofil: {"opener":"Minst fyra kort i trumffärgen; paret har minst åtta trumfkort och 26 gemensamma spelpoäng.","responder":"Minst fyra hjärter och 8-korts fit; 22–25 gemensamma spelpoäng för 3♥-invit."}
  - Grenar: inga
- **T24_STAYMAN_HJARTER_INVIT / t24_stayman_hjarter_invit_n5 – Stayman hittar hjärterfit – invit till 4♥**
  - Betydelse: 4M – accepterar inviten när paret har minst åtta trumfkort och 26 gemensamma spelpoäng.
  - Analys: Öppnaren har maximum eller goda spelvärden och accepterar inviten. Den gemensamma 4–4-fitten gör högfärgen till rätt trumf.
  - Handprofil: {"opener":"Minst fyra kort i trumffärgen; paret har minst åtta trumfkort och 26 gemensamma spelpoäng.","responder":"Minst fyra hjärter och 8-korts fit; 22–25 gemensamma spelpoäng för invit eller minst 26 för direkt utgång."}
  - Grenar: inga

### 13. `1♠ → Pass → 2♠`
- **T15_1S_2S_SVAG_HOJNING / t15_n0 – Enkel spaderhöjning – svag hand**
  - Betydelse: 2♠ visar spaderstöd och en begränsad hand.
  - Analys: Öppnaren har minst fem spader och öppningsstyrka. Svarshanden har 6–9 hp och minst tre spader, alltså trumfstöd men inte invitstyrka. Sang väljs bort eftersom paret har hittat en högfärgsfit. En ny färg väljs också bort eftersom handen är begränsad och inte har styrka att bjuda vidare. Öppnaren passar med minimum.
  - Handprofil: {"opener":"Öppningsstyrka, minst fem spader","responder":"6–9 hp, minst tre spader, trumfstöd"}
  - Grenar: Pass [utan mål]; 3♠ → t15_n1
- **T22 / t22_0 – Färgprov efter 1♠–2♠ – spaderfit**
  - Betydelse: Färgprov efter 1♠–2♠ – spaderfit
  - Analys: Svarshanden har normalt 6–9 hp och minst trekortsstöd. Öppnaren har tillägg och undersöker utgångschansen genom ett färgprov. Provfärgen pekar ut var öppnaren behöver hjälp. Direkt 4♠ kräver en hand där öppnaren anser att utgången är tillräckligt stark utan ytterligare undersökning.
  - Handprofil: {"opener":"Minst fem spader, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre spader, bedömer honnörer och fördelning"}
  - Grenar: 3♣ → t22_1; 3♦ → t22_2; 3♥ → t22_3; 4♠ → t22_4

### 14. `1♠ → Pass → 2♠ → Pass → 3♠`
- **T15_1S_2S_SVAG_HOJNING / t15_n1 – Enkel spaderhöjning – svag hand**
  - Betydelse: Öppnaren inviterar till 4♠ med 3♠.
  - Analys: Svarshanden har visat en begränsad spaderhöjning med minst trekortsstöd. Öppnaren visar tillägg genom att bjuda 3♠. Svarshanden passar med minimum och accepterar med bättre styrka eller extra fördelningsvärden. 4♠ är slutbud när utgången bedöms ha rimliga chanser.
  - Handprofil: {"opener":"Minst fem spader och tillägg utöver öppningsminimum","responder":"6–9 hp, minst tre spader"}
  - Grenar: Pass [utan mål]; 4♠ [utan mål]
- **T35_OPENER_REBID_AFTER_1M_2M / t35_s_3s – Öppnarens återbud efter 1M–2M**
  - Betydelse: 3♠ visar 17–19 HTP utan singleton.
  - Analys: Öppnaren inviterar till 4♠ med extra styrka men utan singleton i sidofärg.
  - Handprofil: {"opener":"17–19 HTP, ingen singleton","responder":"6–12 HTP, minst fyra spader"}
  - Grenar: inga

### 15. `1♥ → Pass → 2♥ → Pass → 3♣`
- **T21 / t21_1 – Färgprov efter 1♥–2♥ – hjärterfit**
  - Betydelse: Färgprov i klöver
  - Analys: Öppnaren provar klöver för att se om svarshanden har honnörshjälp, korthet eller annan användbar fördelning. Svarshanden kan avböja med 3♥ eller acceptera med 4♥. Trumffit är redan känd, så sang är inte huvudalternativet.
  - Handprofil: {"opener":"Minst fem hjärter, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre hjärter, bedömer honnörer och fördelning"}
  - Grenar: 3♥ [utan mål]; 4♥ [utan mål]
- **T35_OPENER_REBID_AFTER_1M_2M / t35_h_c – Öppnarens återbud efter 1M–2M**
  - Betydelse: 3♣ visar exakt en singleton i klöver.
  - Analys: Öppnaren har 17–19 HTP och en enda singleton i klöver. Void räknas inte som singleton.
  - Handprofil: {"opener":"17–19 HTP, exakt en klöversingel","responder":"6–12 HTP, minst fyra hjärter"}
  - Grenar: inga

### 16. `1♥ → Pass → 2♥ → Pass → 3♦`
- **T21 / t21_2 – Färgprov efter 1♥–2♥ – hjärterfit**
  - Betydelse: Färgprov i ruter
  - Analys: Öppnaren provar ruter av samma skäl: svarshanden bedömer sina värden i provfärgen och antalet förlorare. Svaga ruter talar för att stanna i 3♥; god hjälp kan motivera 4♥.
  - Handprofil: {"opener":"Minst fem hjärter, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre hjärter, bedömer honnörer och fördelning"}
  - Grenar: 3♥ [utan mål]; 4♥ [utan mål]
- **T35_OPENER_REBID_AFTER_1M_2M / t35_h_d – Öppnarens återbud efter 1M–2M**
  - Betydelse: 3♦ visar exakt en singleton i ruter.
  - Analys: Öppnaren har 17–19 HTP och en enda singleton i ruter.
  - Handprofil: {"opener":"17–19 HTP, exakt en rutertsingel","responder":"6–12 HTP, minst fyra hjärter"}
  - Grenar: inga

### 17. `1♥ → Pass → 2♥ → Pass → 3♠`
- **T21 / t21_3 – Färgprov efter 1♥–2♥ – hjärterfit**
  - Betydelse: Färgprov i spader
  - Analys: Öppnaren provar spader. Svarshanden värderar spaderhonnörer, korthet och förlorare innan beslut om utgång. Färgprovet är en överenskommelse som paret måste ha etablerat.
  - Handprofil: {"opener":"Minst fem hjärter, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre hjärter, bedömer honnörer och fördelning"}
  - Grenar: 3♥ [utan mål]; 4♥ [utan mål]
- **T35_OPENER_REBID_AFTER_1M_2M / t35_h_s – Öppnarens återbud efter 1M–2M**
  - Betydelse: 3♠ visar exakt en singleton i spader.
  - Analys: Öppnaren har 17–19 HTP och en enda singleton i spader.
  - Handprofil: {"opener":"17–19 HTP, exakt en spadersingel","responder":"6–12 HTP, minst fyra hjärter"}
  - Grenar: inga

### 18. `1♥ → Pass → 2♥ → Pass → 4♥`
- **T21 / t21_4 – Färgprov efter 1♥–2♥ – hjärterfit**
  - Betydelse: Direkt utgång i hjärter
  - Analys: Öppnaren bedömer att tilläggsstyrkan och trumfstödet räcker för 4♥ direkt. Färgprov hoppas över eftersom öppnaren anser sig kunna värdera handen utan ytterligare information.
  - Handprofil: {"opener":"Minst fem hjärter, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre hjärter, bedömer honnörer och fördelning"}
  - Grenar: inga
- **T35_OPENER_REBID_AFTER_1M_2M / t35_h_4h – Öppnarens återbud efter 1M–2M**
  - Betydelse: 4♥ visar 20+ HTP och går direkt till utgång.
  - Analys: Öppnaren bedömer att styrkan räcker för utgång.
  - Handprofil: {"opener":"20+ HTP","responder":"6–12 HTP, minst fyra hjärter"}
  - Grenar: inga

### 19. `1♠ → Pass → 2♠ → Pass → 3♣`
- **T22 / t22_1 – Färgprov efter 1♠–2♠ – spaderfit**
  - Betydelse: Färgprov i klöver
  - Analys: Öppnaren provar klöver för att se om svarshanden har honnörshjälp, korthet eller användbar fördelning. Svarshanden kan avböja med 3♠ eller acceptera med 4♠. Sang är inte huvudalternativet eftersom trumffit är känd.
  - Handprofil: {"opener":"Minst fem spader, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre spader, bedömer honnörer och fördelning"}
  - Grenar: 3♠ [utan mål]; 4♠ [utan mål]
- **T35_OPENER_REBID_AFTER_1M_2M / t35_s_c – Öppnarens återbud efter 1M–2M**
  - Betydelse: 3♣ visar exakt en singleton i klöver.
  - Analys: Öppnaren har 17–19 HTP och en enda singleton i klöver.
  - Handprofil: {"opener":"17–19 HTP, exakt en klöversingel","responder":"6–12 HTP, minst fyra spader"}
  - Grenar: inga

### 20. `1♠ → Pass → 2♠ → Pass → 3♦`
- **T22 / t22_2 – Färgprov efter 1♠–2♠ – spaderfit**
  - Betydelse: Färgprov i ruter
  - Analys: Öppnaren provar ruter. Svarshanden bedömer honnörer, korthet och förlorare i provfärgen. Svaga ruter talar för att stanna i 3♠; god hjälp kan motivera utgång.
  - Handprofil: {"opener":"Minst fem spader, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre spader, bedömer honnörer och fördelning"}
  - Grenar: 3♠ [utan mål]; 4♠ [utan mål]
- **T35_OPENER_REBID_AFTER_1M_2M / t35_s_d – Öppnarens återbud efter 1M–2M**
  - Betydelse: 3♦ visar exakt en singleton i ruter.
  - Analys: Öppnaren har 17–19 HTP och en enda singleton i ruter.
  - Handprofil: {"opener":"17–19 HTP, exakt en rutertsingel","responder":"6–12 HTP, minst fyra spader"}
  - Grenar: inga

### 21. `1♠ → Pass → 2♠ → Pass → 3♥`
- **T22 / t22_3 – Färgprov efter 1♠–2♠ – spaderfit**
  - Betydelse: Färgprov i hjärter
  - Analys: Öppnaren provar hjärter för att undersöka om svarshanden kan täcka förlorare där. Färgprovet är systemberoende och ska vara överenskommet.
  - Handprofil: {"opener":"Minst fem spader, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre spader, bedömer honnörer och fördelning"}
  - Grenar: 3♠ [utan mål]; 4♠ [utan mål]
- **T35_OPENER_REBID_AFTER_1M_2M / t35_s_h – Öppnarens återbud efter 1M–2M**
  - Betydelse: 3♥ visar exakt en singleton i hjärter.
  - Analys: Öppnaren har 17–19 HTP och en enda singleton i hjärter.
  - Handprofil: {"opener":"17–19 HTP, exakt en hjärtersingel","responder":"6–12 HTP, minst fyra spader"}
  - Grenar: inga

### 22. `1♠ → Pass → 2♠ → Pass → 4♠`
- **T22 / t22_4 – Färgprov efter 1♠–2♠ – spaderfit**
  - Betydelse: Direkt utgång i spader
  - Analys: Öppnaren bedömer att tilläggsstyrkan och spaderstödet räcker för 4♠ direkt. Färgprov hoppas över eftersom öppnaren anser sig kunna värdera handen utan ytterligare information.
  - Handprofil: {"opener":"Minst fem spader, öppningsstyrka med tillägg","responder":"6–9 hp, minst tre spader, bedömer honnörer och fördelning"}
  - Grenar: inga
- **T35_OPENER_REBID_AFTER_1M_2M / t35_s_4s – Öppnarens återbud efter 1M–2M**
  - Betydelse: 4♠ visar 20+ HTP och går direkt till utgång.
  - Analys: Öppnaren bedömer att styrkan räcker för utgång.
  - Handprofil: {"opener":"20+ HTP","responder":"6–12 HTP, minst fyra spader"}
  - Grenar: inga

### 23. `1♣ → Pass → 1♦ → Pass → 1♥`
- **T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1 / t39_1c1d_second_0 – Ostörd budgivning – öppnarens återbud efter 1 över 1**
  - Betydelse: 1♥ efter 1♣–1♦ – andra färgen
  - Analys: Öppnaren visar minst fyra kort i den nya färgen. Ett naturligt andra färgbud på lägsta nivå visar normalt 12–17 hp och en 5-4-hand. Om färgparet och budnivån i stället gör budet till reverse gäller den starkare reverse-regeln: minst 5-4 och 18+ HPS. Hela handens färglängder måste därför kontrolleras; budet får inte automatiskt tolkas som en vanlig 5-4-hand.
  - Handprofil: {"opener":"Minst fyra kort i den nya färgen. Normalt 5-4 med 12–17 hp på lägsta nivå; vid reverse minst 5-4 och 18+ HPS. Öppningsfärgen måste ha minst fem kort för reverse.","responder":"Svarshanden har visat 6+ hp och minst fyra kort i sin färg. Öppnarens andra färg kan vara ett vanligt återbud eller reverse beroende på färgrangordning och styrka."}
  - Grenar: inga
- **T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD / t40_two_suit_rebid – Ostörd budgivning – svarshandens andra bud efter öppnarens återbud**
  - Betydelse: Öppnaren visar två färger – svarshandens andra bud
  - Analys: Öppnaren har visat minst fyra klöver och minst fyra hjärter. Återbudet kan vara en reverse och därmed visa starkare hand, men svarshandens fortsättning styrs i denna motordel främst av egen hp och preferens. Med högst 9 hp väljs preferens till en av öppnarens visade färger om svarshanden har minst två kort där; motorn väljer färgen med längst gemensam längd. Med 10–12 hp bjuder en balanserad svarshand 2NT som invit. En obalanserad hand på 10–12 hp kan visa preferens om sådan finns; annars är situationen inte täckt. Med 13+ hp bjuds fjärde färg på lägsta lagliga nivå som utgångskrav. I exemplet 1♣–1♦–1♥ blir det 1♠. Om fjärde färg saknas används preferens om möjligt, annars 3NT. Någon separat poängmodell för preferens är inte definierad i denna gren.
  - Handprofil: {"opener":"Minst 4 klöver och 4 hjärter. Beroende på färgrangordning och styrka kan 1♥ vara en reverse; öppnarens styrka ska inte antas vara begränsad.","responder":"0–9 hp: preferens om minst två kort i en av öppnarens färger. 10–12 hp: 2NT med balanserad hand, annars preferens om tillgänglig. 13+ hp: fjärde färg som utgångskrav; i exemplet 1♣–1♦–1♥ bjuds 1♠."}
  - Grenar: 2♣/2♥ [utan mål]; 2NT [utan mål]; 1♠ [utan mål]; 3NT [utan mål]

### 24. `1♥ → Pass → 1♠ → Pass → 1NT`
- **T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1 / t39_1h1s_1nt – Ostörd budgivning – öppnarens återbud efter 1 över 1**
  - Betydelse: 1NT efter 1♥–1♠ – balanserad öppnare eller specialfall 4-4-4-1
  - Analys: Med en vanlig balanserad hand visar 1NT 12–14 hp. Men en 4-4-4-1-hand är inte balanserad och får inte klassificeras som ett vanligt 1NT-återbud. Efter öppning i en fyrkortsfärg och partnerns 1NT gäller specialregeln: med 12–17 hp kan öppnaren bjuda en annan fyrkortsfärg på 2-nivån trots att färgen bara innehåller fyra kort; öppnaren får också passa 1NT. Med 18–19 hp bjuder öppnaren 2NT. Exempel: 4♠-4♥-4♦-1♣ öppnar 1♥ enligt öppningsprioriteten. Efter 1♠–1NT visar öppnaren 2♦ med 12–17 hp (alternativt pass) och 2NT med 18–19 hp.
  - Handprofil: {"opener":"4-4-4-1, alltså fyra kort i tre färger och singel i den fjärde. Efter partnerns 1NT: 12–17 hp = bjud den lägsta möjliga andra fyrkortsfärgen på 2-nivån trots fyrkortslängd; pass är också tillåtet. 18–19 hp = 2NT.","responder":"Partnern har svarat 1NT. Öppnarens specialåterbud beskriver 4-4-4-1 och ska inte tolkas som ett normalt femkortsfärgsbud."}
  - Grenar: 2♣ [utan mål]; 2♦ [utan mål]; Pass [utan mål]; 2NT [utan mål]
- **T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD / t40_balanced_rebid – Ostörd budgivning – svarshandens andra bud efter öppnarens återbud**
  - Betydelse: Öppnaren återbjuder 1NT – svarshandens andra bud
  - Analys: Öppnaren visar en balanserad hand med 12–14 hp. Svarshanden söker först en gemensam högfärg med minst 8 kort. Finns sådan fit: 26+ gemensamma spelpoäng ger 4 i högfärgen; 22–25 ger 3 i högfärgen som invit. Om ingen sådan högfärgsfit når dessa nivåer bedöms sang med sammanlagda honnörspoäng: 26+ = 3NT, 22–25 = 2NT invit, under 22 = pass. Sang räknas med honnörspoäng, inte fördelningspoäng.
  - Handprofil: {"opener":"Balanserad hand, 12–14 hp efter 1♥–1♠–1NT.","responder":"Räkna högfärgsfit först. Med minst 8 kort används spelpoäng i färg; utan sådan fit används enbart gemensamma hp i sang."}
  - Grenar: 4♥/4♠ [utan mål]; 3♥/3♠ [utan mål]; 3NT [utan mål]; 2NT [utan mål]; Pass [utan mål]

### 25. `1♥ → Pass → 1♠ → Pass → 2♥`
- **T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1 / t39_1h1s_own – Ostörd budgivning – öppnarens återbud efter 1 över 1**
  - Betydelse: 2♥ efter 1♥–1♠ – återbud i egen färg
  - Analys: Öppnaren visar minst sex kort i öppningsfärgen och saknar sidofärg med minst fyra kort. Med 12–14 hp bjuds färgen på lägsta nivå; med 15–17 hp görs enkelhopp. Med 18+ hp i högfärg går öppnaren till utgång. För lågfärgsöppning anger motorn inte ett säkert motsvarande utgångsbud vid 18+ hp – det ska lämnas öppet i stället för att gissas.
  - Handprofil: {"opener":"6+ kort i öppningsfärgen, utan annan sidofärg med 4+ kort. 12–14 hp = lägsta nivå; 15–17 hp = enkelhopp; 18+ hp i högfärg = utgång.","responder":"Svarshanden har visat en egen färg på 1-nivån; öppnarens ombud av egen färg visar extra längd snarare än stöd i svarsfärgen."}
  - Grenar: inga
- **T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD / t40_own_suit_rebid – Ostörd budgivning – svarshandens andra bud efter öppnarens återbud**
  - Betydelse: Öppnaren återbjuder sin egen färg – svarshandens andra bud
  - Analys: Öppnarens återbud i egen färg visar minst fem kort i öppningsfärgen i denna fortsättningsgren; normalt sex kort när ingen annan sidofärg med fyra kort finns. Svarshanden kontrollerar först om det finns minst 8 korts fit i öppningsfärgen. Med 26+ gemensamma spelpoäng i högfärg bjuds utgång; med 22–25 invit; under 22 pass. Om fit saknas används sammanlagda honnörspoäng: 26+ ger 3NT, 22–25 ger 2NT invit, annars pass. Motorns gren omfattar öppnare med minst fem kort.
  - Handprofil: {"opener":"Återbud i öppningsfärgen. Motorns respondergren kräver minst fem kort; normalt visar återbudet sex kort när ingen sidofärg med fyra kort finns.","responder":"Minst 8-korts fit: färgtrösklarna 26/22. Utan fit: 26/22 gemensamma hp för sang."}
  - Grenar: 4♥ [utan mål]; 3♥ [utan mål]; 3NT [utan mål]; 2NT [utan mål]; Pass [utan mål]

### 26. `1♥ → Pass → 1♠ → Pass → 2♠`
- **T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1 / t39_1h1s_support – Ostörd budgivning – öppnarens återbud efter 1 över 1**
  - Betydelse: 2♠ efter 1♥–1♠ – stöd i svarsfärgen
  - Analys: Öppnaren visar minst fyra kort i svarsfärgen. Lägre höjning visar 12–16 HTP; enkelhopp visar 17–19 HTP. Vid 20+ HTP går öppnaren till utgång i högfärg. Vid 20+ HTP med lågfärgsstöd saknas ett säkert specificerat återbud i motorn och analysen ska markera det som otäckt i stället för att hitta på ett bud. HTP används här eftersom trumfstöd finns. En viktig specialform är 4-4-4-1: exempelvis 4♠-4♥-4♦-1♣ öppnar 1♥ enligt prioriteten H > S > C > D. Efter partnerns 1♠ finns fyra korts spaderstöd. Handen är obalanserad, och återbudet ska styras av HTP – inte behandlas som en balanserad sanghand.
  - Handprofil: {"opener":"4+ kort i svarsfärgen. 12–16 HTP = lägsta höjning; 17–19 HTP = enkelhopp; 20+ HTP = utgång om svarsfärgen är högfärg. Exempel: 4♠-4♥-4♦-1♣ öppnar 1♥ och har sedan 4-korts spaderstöd.","responder":"Svarshanden har visat minst fyra kort i sin färg. Öppnarens återbud fastställer fit och visar HTP-intervall."}
  - Grenar: inga
- **T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD / t40_support_raise – Ostörd budgivning – svarshandens andra bud efter öppnarens återbud**
  - Betydelse: Öppnaren höjer svarshandens högfärg – svarshandens andra bud
  - Analys: Öppnaren visar minst fyra spader och minst 8-korts gemensam fit. Svarshanden räknar gemensamma spelpoäng: honnörspoäng plus fördelningspoäng utanför trumf och längdbonus i trumf (9 trumf = +1, 10 eller fler = +2). I högfärg är 26+ gemensamma spelpoäng utgång; 22–25 invit; under 22 pass. I lågfärg används 28+ för utgång och 24–27 för invit; under 24 pass. Detta är motorns gränser i denna gren.
  - Handprofil: {"opener":"Minst 4 spader. Öppnarens 2♠ efter 1♥–1♠ visar stöd i svarshandens färg.","responder":"Minst 4 spader visade i första svarsronden. 26+ gemensamma spelpoäng = 4♠; 22–25 = 3♠ invit; under 22 = pass."}
  - Grenar: 4♠ [utan mål]; 3♠ [utan mål]; Pass [utan mål]

## 3. Särskilt viktiga kollisioner

- `1NT–Pass–2♦`: T03 och T07 representerar samma överföringsbud men olika fortsättnings- och handstyrkescenarier.
- `1NT–Pass–2♦–Pass–2♥`: T03, T07 och T27 skiljer sig i efterföljande invit-/svag-handmodell.
- `1♥–Pass–2♥`: T05, T10 och T21 har olika pedagogiskt syfte (stanna, enkel höjning, färgprov).
- `1NT–Pass–2♣–Pass–2♦`: T06 och T26 skiljer grundsekvens från invitfortsättning.
- `1NT–Pass–2♥–Pass–2♠`: T08 och T28 skiljer grundöverföring från sexkortsinvit.
- `1NT–Pass–3NT`: T09 och T18 beskriver direkt utgång från liknande sekvens.

Dessa ska inte slås ihop innan handvillkor, målgrupp, nästa beslutspunkt och betydelse är jämförda.

## 4. Kritiska kopplingsfel och risker

1. **T40-root:** `root` är en beskrivande text, inte ett nod-ID.
2. **Nodmatcharen:** `findMatch()` returnerar en enda sekvensmatch och kontrollerar inte handprofil.
3. **Rättningsmotorn:** `nodeForRaw()` är ett separat hårdkodat beslutsträd; det finns ingen fullständig nod-ID-koppling från 241 biblioteksnoder till runtime-regler.
4. **Dold information:** robotens `botCall()` skickar hela given till `Rattning.nodeFor()`. Denna korsreferens bevisar därför inte att livebuden är informationsmässigt korrekta.
5. **Svag tvåa/spärr:** runtime-kod finns, men ingen motsvarande samlad ostörd nodfamilj har identifierats.
6. **Grenar utan mål:** 106 grenposter saknar `next`. En del är uppenbara signoff-/terminalbeskrivningar, men datamodellen markerar inte terminalstatus separat från odefinierad fortsättning.

## 5. Rekommenderad ordning för fortsatt arbete

1. Bygg validering för ID, sekvenser, grenar och root-referenser. Den är nu införd som `scripts/validate-analysis-library.js` med baslinjetest i `tests/analysis-library-audit.test.js`.
2. Klassificera de 26 sekvenskollisionerna utan att slå ihop något.
3. Skapa en tydlig terminal-/ej-modellerad status för grenarna, men bara efter granskning av varje gren.
4. Reparera T40-root genom att välja ett befintligt, verifierat nod-ID – inte genom att ändra budbetydelsen.
5. Lägg till de saknade handprofilerna från dokumenterat underlag; annars lämnas de som ej fastställda.
6. Separera livebeslut från efterhandsrättning och testa invarians mot ändrade dolda händer.
7. Först därefter kan vi börja mappa varje runtime-beslutsregel till kanoniska noder och låta en noddriven motor ersätta delar av hårdkodningen.

**Ingen budregel har ändrats i denna rapport.** Alla osäkerheter ska fortsatt redovisas som ej täckta.
## 6. Konkret testfynd: splinter saknar svarshandsgren

100-givarsprovet körde 527 beslut, varav 526 täcktes (99,8 %), utan tekniska undantag, olagliga rekommendationer, ogiltiga auktioner eller ofärdiga auktioner. Den enda ej täckta positionen var seed `202615834`, sekvensen `1♠–Pass–2♦–Pass–3♥–Pass–?`.

Vid rekonstruktion av given visar det sig att öppnarens 3♥ är ett splinterbud med hjärterkorthet och ruterstöd (öppnarhanden är 4-4-4-1). T39 har ett splinterexempel på öppnarens återbud, men T40 saknar en svarshandsnod efter splinter. Nuvarande `responderSecondBid()` saknar också en uttrycklig splintergren och returnerar därför ej täckt.

Detta ska hållas isär från vanlig tvåfärgshand/reverse. Vi behöver verifiera systemets svar efter splinter innan nod eller kod skapas. Den äldre korta klassificeringen av seedet i loggen bör inte användas som facit utan denna korrigering.

## 7. Konkret bevis på dold-hand-läckage

Se reproducerbart exempel i `GRANSKNING_LIVE_OCH_EFTERHAND.md`: med samma Östhand och samma offentliga Öst 1♥–Väst 3♥-auktion ger nuvarande `nodeFor()` Pass när Västs dolda fördelning ger 25 spelpoäng och 4♥ när den ger 26. Båda svarshänderna uppfyller samma visade 3♥-invitvillkor. Det visar varför handvillkor i nodmatchning måste skilja offentlig budinferens från efterhandskort.
### 6.1 Viktig reservation: splintertolkningen är inte auktoriserad

Att den nuvarande motorn väljer 3♥ som splinter i seed 202615834 beskriver **motorns nuvarande tolkning**, inte en verifierad systemregel. Tidigare assistenttext om 13+ STP eller 19–21 STP och fortsättning med 3M/4M har inte uttryckligen bekräftats av användaren. Den uttryckligen bekräftade 13+ HTP-regeln gäller Stenberg 2NT med minst fyra korts stöd, inte splinter. `reb1()` kontrollerar dessutom `hp>=13` medan nodtexten säger 13+ STP. Detta måste lösas innan vi bygger en splintergren i T40.
## 8. Diagnostisk matchare tillagd

`analysmotor.js` exporterar nu även `findMatches()`. Den returnerar samtliga noder vars sekvens är prefixmatchning mot aktuell auktion, sorterade med längsta sekvens först. Befintliga `findMatch()` behåller sitt gamla beteende och returnerar första träffen, så befintlig UI-/rapportlogik ändras inte.

Tester visar att `1NT–Pass–2♦` ger två exakta nodträffar (T03/T07), medan `1♥–Pass–2♥` ger tre exakta träffar (T05/T10/T21). Detta gör tvetydigheten synlig för framtida migrering. `findMatches()` kontrollerar ännu inte handprofiler eller roll; den är en diagnostisk mellanlösning, inte en komplett nodmotor.