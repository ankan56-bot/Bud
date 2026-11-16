# Rapport: ej täckta ostörda budpositioner – 2026-11-16

**Gren:** `work/undisturbed-architecture`  
**Motor:** rattningsmotor.js v7.6  
**Syfte:** samla de exakta givarna och auktionerna där den nuvarande motorn avstår från att rekommendera ett bud. Inga luckor har fyllts med gissningar.

## 1. Testresultat

| Test | Givar | Beslut | Täckta | Ej täckta | Täckning | Tekniska/laglighetsfel |
|---|---:|---:|---:|---:|---:|---:|
| Ostörd 100, första stickprovet | 100 | 533 | 532 | 1 | 99,8 % | 0 |
| Ostörd 100, andra stickprovet | 100 | 524 | 520 | 4 | 99,2 % | 0 |
| Ostörd 200, tredje stickprovet | 200 | 1041 | 1034 | 7 | 99,3 % | 0 |
| 1♥/1♠, riktat 100-givarsprov | 100 | 527 | 526 | 1 | 99,8 % | 0 |
| Fast ostörd korpus | 36 | 167 | 166 | 1 | 99,4 % | 0 |

Alla körningar passerade kortintegritet, tekniska undantag, olagliga rekommendationer, ogiltiga auktioner och ofärdiga auktioner. Stickproven innehåller ett överlappande seed (202614226) mellan två 100-givarsgeneratorer; de ska därför inte summeras som helt unika givar.

## 2. Unika ej täckta givare och fullständiga händer

Notation: A=ess, K=kung, Q=dam, J=knekt, T=tio. Händerna visas i ordningen ♠, ♥, ♦, ♣. HP är honnörspoäng.

### 1. ostord-100-088 / ostord-200-030 — seed 202614226
**Kategori:** Stayman – svarshandens obalanserade invit efter 2♥
**Auktion:** `N:1N E:P S:2C W:P N:2H E:P S:P`
**Motorns besked:** Ingen fit, obalanserad svarshand och invitstyrka efter Stayman: fortsatt bud är inte definierat.
**Analys:** Syd har 9 hp, 6 ruter och 5 spader men ingen 8-korts fit i hjärter. Den aktuella Staymanfortsättningen för obalanserad invitstyrka utan användbar högfärgsfit är uttryckligen ej definierad.
- **N** (16 hp, 3-4-2-4): 9 7 6 | K J T 6 | A J | A K 4 3
- **E** (8 hp, 2-4-3-4): Q 2 | A 9 3 2 | Q 7 6 | 8 7 6 5
- **S** (9 hp, 4-2-6-1): K J 5 3 | 7 4 | K T 8 5 3 2 | Q
- **W** (7 hp, 4-3-2-4): A T 8 4 | Q 8 5 | 9 4 | J T 9 2

### 2. ostord-200-064 — seed 202615660
**Kategori:** Stayman – öppnarens beslut efter 2♥–2NT
**Auktion:** `S:1N W:P N:2C E:P S:2H W:P N:2N E:P S:P`
**Motorns besked:** Efter Stayman 1NT–2♣–2H–2NT måste öppnaren väga 3NT mot eventuell fit i den andra högfärgen. Exakt fortsättning är inte fastställd; öppnarens egen 4-kortsfärg räcker inte för att rekommendera 4H.
**Analys:** Syds öppnarhand har 15 hp och 4-4 i högfärgerna. Norrs 2NT är invit; den faktiska given har spaderfit, men öppnaren kan inte använda Norrs dolda 4-kortsspader. Systemet anger inte säkert valet mellan 3NT och 4♠ i denna situation.
- **N** (10 hp, 4-3-2-4): A Q 9 5 | T 9 7 | Q 3 | Q 8 6 3
- **E** (6 hp, 4-2-3-4): K 7 6 4 | 4 2 | 5 4 2 | K 9 4 2
- **S** (15 hp, 4-4-2-3): T 8 3 2 | A K Q J | T 7 | A J 5
- **W** (9 hp, 1-4-6-2): J | 8 6 5 3 | A K J 9 8 6 | T 7

### 3. one-major-042 / ostord-200-072 — seed 202615834
**Kategori:** 1-över-1 – tidigare splintertolkning borttagen
**Auktion:** `N:1S E:P S:2D W:P N:3H E:P S:P`
**Motorns besked:** Denna handtyp eller fortsättning kan inte avgöras säkert med de uppgifter som visas.
**Historisk notering:** Den tidigare motorn föreslog 3♥ som splinter (hjärterkorthet, ruterstöd). Splinter är nu borttaget ur systemet. Givaren måste räknas om: öppnaren har fyrkortsstöd i ruter efter 2♦, så den naturliga stödvägen ska prövas; 3♥ får inte längre motiveras som splinter.
- **N** (13 hp, 4-1-4-4): A K Q 8 | 3 | K T 8 5 | J T 7 4
- **E** (7 hp, 3-6-3-1): 7 5 4 | K T 8 6 4 2 | 9 6 3 | A
- **S** (11 hp, 3-4-4-2): T 3 2 | A J 7 5 | A Q 7 2 | 8 3
- **W** (9 hp, 3-2-2-6): J 9 6 | Q 9 | J 4 | K Q 9 6 5 2

### 4. ostord-200-076 — seed 202615910
**Kategori:** Stayman – öppnarens beslut efter 2♠–2NT
**Auktion:** `W:P N:1N E:P S:2C W:P N:2S E:P S:2N W:P N:P`
**Motorns besked:** Efter Stayman 1NT–2♣–2S–2NT måste öppnaren väga 3NT mot eventuell fit i den andra högfärgen. Exakt fortsättning är inte fastställd; öppnarens egen 4-kortsfärg räcker inte för att rekommendera 4S.
**Analys:** Öppnarhanden har 4 spader och 3 hjärter; svarshanden har 4 hjärter och 2 spader. Efter 2♠–2NT saknas verifierad fortsättningsregel för 3NT kontra alternativ högfärgsväg.
- **N** (17 hp, 4-3-4-2): Q J T 4 | K J 4 | A Q J 4 | Q J
- **E** (8 hp, 4-2-3-4): A 9 6 3 | A 7 | 8 7 3 | T 8 7 5
- **S** (8 hp, 2-4-4-3): 8 7 | Q T 3 2 | K T 5 2 | K 4 3
- **W** (7 hp, 3-4-2-4): K 5 2 | 9 8 6 5 | 9 6 | A 9 6 2

### 5. ostord-400-037 — seed 202814601
**Kategori:** 1-over-1 – svarshandens andra bud efter 1♦–1♠–2♥
**Auktion:** `E:P S:P W:P N:1D E:P S:1S W:P N:2H E:P S:P`
**Motorns besked:** Denna handtyp eller fortsättning kan inte avgöras säkert med de uppgifter som visas.
**Analys:** Svarshanden har 9 hp, fem spader och sex klöver; öppnaren visar en andra färg. Den aktuella T40-/runtime-mappningen täcker inte denna fortsättning tillräckligt precist.
- **N** (14 hp, 2-4-5-2): A 9 | A Q 5 4 | A 9 5 3 2 | 6 4
- **E** (9 hp, 1-3-5-4): 5 | J 8 7 | Q J 8 7 4 | K Q T 2
- **S** (9 hp, 5-1-1-6): Q T 6 4 2 | K | T | A 9 8 7 5 3
- **W** (8 hp, 5-5-2-1): K J 8 7 3 | T 9 6 3 2 | K 6 | J

### 6. ostord-400-068 — seed 202815618
**Kategori:** 1-over-1 – fortsättning efter svarshandens 2NT-invit och öppnarens 3♥
**Auktion:** `E:P S:1C W:P N:1D E:P S:2C W:P N:2N E:P S:3H W:P N:P`
**Motorns besked:** Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet.
**Analys:** Norrs 2NT är svarshandens andra bud efter 1♣–1♦–2♣. Syd fortsätter 3♥; Norrs följande beslut är ett senare återbud som inte täcks av den begränsade T40-modellen.
- **N** (10 hp, 3-3-5-2): A 3 2 | J 9 6 | A 9 7 6 3 | J 9
- **E** (9 hp, 4-3-3-3): K T 6 4 | K Q 3 | J T 2 | T 8 5
- **S** (13 hp, 2-4-2-5): 9 7 | A T 4 2 | Q 5 | A K 7 6 3
- **W** (8 hp, 4-3-3-3): Q J 8 5 | 8 7 5 | K 8 4 | Q 4 2

### 7. ostord-400-103 — seed 202816769
**Kategori:** 1-over-1 – öppnarens tredje bud efter 1♣–1♦–2♣–2NT
**Auktion:** `W:P N:1C E:P S:1D W:P N:2C E:P S:2N W:P N:P`
**Motorns besked:** Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet.
**Analys:** Öppnaren har 12 hp, 5 klöver och 4 spader, svarshanden 13 hp och 4-4-3-2. Öppnarens fortsättning efter 2NT-invit är inte tillräckligt specificerad i nuvarande regelbibliotek.
- **N** (12 hp, 4-1-3-5): Q 9 6 2 | 9 | A Q 2 | A T 6 4 2
- **E** (6 hp, 1-5-3-4): 4 | Q J 7 5 4 | T 8 4 | Q J 7 3
- **S** (13 hp, 3-4-4-2): T 7 5 | A K T 3 | K 7 5 3 | K 5
- **W** (9 hp, 5-3-3-2): A K J 8 3 | 8 6 2 | J 9 6 | 9 8

### 8. ostord-400-121 — seed 202817339
**Kategori:** Stayman – öppnarens beslut efter 2♠–2NT
**Auktion:** `E:P S:P W:P N:1N E:P S:2C W:P N:2S E:P S:2N W:P N:P`
**Motorns besked:** Efter Stayman 1NT–2♣–2S–2NT måste öppnaren väga 3NT mot eventuell fit i den andra högfärgen. Exakt fortsättning är inte fastställd; öppnarens egen 4-kortsfärg räcker inte för att rekommendera 4S.
**Analys:** Ytterligare en 2♠–2NT-position där nuvarande kod uttryckligen lämnar valet mellan 3NT och eventuell högfärgsfit ej täckt.
- **N** (15 hp, 4-2-4-3): Q 9 8 3 | A 3 | K Q 7 5 | A 6 4
- **E** (9 hp, 2-4-4-3): K J | K J 8 6 | J T 8 3 | 7 5 3
- **S** (8 hp, 3-4-3-3): T 7 2 | Q 7 5 2 | 6 4 2 | K Q J
- **W** (8 hp, 4-3-2-4): A 6 5 4 | T 9 4 | A 9 | T 9 8 2

### 9. ostord-400-126 — seed 202817386
**Kategori:** 1-over-1 – öppnarens tredje bud efter 1♣–1♦–2♣–2NT
**Auktion:** `W:P N:P E:P S:1C W:P N:1D E:P S:2C W:P N:2N E:P S:P`
**Motorns besked:** Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet.
**Analys:** Öppnaren har 17 hp, 5 klöver och singel hjärter. Svarshandens 2NT-invit är känd; öppnarens beslut efter denna är inte täckt av nuvarande regler.
- **N** (6 hp, 4-3-4-2): T 8 7 6 | 9 4 2 | Q T 6 5 | A 9
- **E** (8 hp, 2-6-3-2): Q 2 | K Q J T 7 3 | 8 7 2 | T 7
- **S** (17 hp, 4-1-3-5): A K 9 5 | 5 | A K 4 | Q J 6 5 2
- **W** (9 hp, 3-3-3-4): J 4 3 | A 8 6 | J 9 3 | K 8 4 3

### 10. ostord-400-140 — seed 202817694
**Kategori:** Spärröppning – svar efter 4♣
**Auktion:** `S:4C W:P N:P`
**Motorns besked:** Fortsättningen efter spärrbud beskrivs inte i dokumentet.
**Analys:** Partnern har 22 hp, 6 ruter och 4 hjärter. Systemets svar efter 4♣ är inte definierat i den aktuella ostörda nodkartan; inget bud föreslås.
- **N** (22 hp, 2-4-6-1): A T | A 8 7 5 | A K Q J T 8 | A
- **E** (3 hp, 2-5-5-1): 6 2 | Q J 6 3 2 | 9 6 5 3 2 | 9
- **S** (7 hp, 2-1-2-8): J 4 | T | 7 4 | K Q J 8 6 5 3 2
- **W** (8 hp, 7-3-0-3): K Q 9 8 7 5 3 | K 9 4 | – | T 7 4

### 11. ostord-400-179 — seed 202819013
**Kategori:** Stark 2♣ – öppnarens återbud efter 2♦-väntbud
**Auktion:** `N:2C E:P S:2D W:P N:P`
**Motorns besked:** Obalanserad hand utan 5-korts färg: dokumentet anger inte budet.
**Analys:** Öppnarhanden har 21 hp och 4-4-4-1, utan femkortsfärg. T41/runtime har ingen verifierad fortsättning för denna handtyp; lämnas ej täckt.
- **N** (21 hp, 4-4-1-4): K Q T 7 | A K 3 2 | A | A J 8 6
- **E** (8 hp, 3-2-4-4): J 4 3 | J T | K 7 5 3 | K 9 5 4
- **S** (4 hp, 3-4-3-3): 9 8 2 | Q 8 7 4 | T 4 2 | Q T 7
- **W** (7 hp, 3-3-5-2): A 6 5 | 9 6 5 | Q J 9 8 6 | 3 2

## 3. Samlad klassificering

### Stayman
- Obalanserad invitstyrka efter 1NT–2♣–2♥ utan användbar fit: ej täckt.
- Öppnarens val efter 1NT–2♣–2♥/2♠–2NT: 3NT kontra eventuell högfärgsfit är inte systemdefinierat i den aktuella modellen. Flera givare visar samma lucka.

### 1 över 1 och senare återbud
- Svarshandens andra bud efter 1♦–1♠–2♥ saknar tillräckligt bred modellering.
- Öppnarens tredje bud efter 1♣–1♦–2♣–2NT saknar verifierad fortsättningsregel.
- Svarshandens senare fortsättning efter att öppnaren visat ytterligare färg (t.ex. 3♥) ligger utanför den nuvarande T40-modellen.

### Avancerade konventioner
- Splinter är borttaget ur den aktuella budgivningen. Äldre resultat som byggde på splintertolkning ska räknas om utan konventionen.

### Spärr och stark 2♣
- Svar efter 4♣-spärr är inte täckt.
- Stark 2♣–2♦ med obalanserad 4-4-4-1-öppnarhand utan femkortsfärg är inte täckt.

## 4. Viktiga regler för fortsatt arbete

1. Behåll dessa positioner som ej täckta tills auktoritativ systemtext eller användarbeslut finns.
2. Hitta inte på bud för att höja täckningsprocenten.
3. Alla nya regler ska få isolerade tester och sedan köras mot de deterministiska stickproven.
4. När livebudgivningen separerats från efterhandsrättningen ska dolda händer inte påverka någon av dessa livebeslut.
5. T29–T33 och konkurrensbudgivning är fortsatt pausade.