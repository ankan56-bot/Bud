# Handanalysunderlag – Nordisk standard

**Version:** 1.0 · **Datum:** 2026-11-15  
**Syfte:** Gemensamt underlag för rättningsmotor, analysbibliotek och pedagogisk handanalys. Grundsystemets uttryckliga regler har företräde. Luckor ska markeras som ej täckta, inte fyllas med antaganden.

## 1. Poängvärdering

### Honnörspoäng (HP)
- Ess = 4, kung = 3, dam = 2, knekt = 1.
- HP räknas alltid.

### HTP / stödpoäng
- Stöd-/fördelningspoäng får räknas när trumffärgen är etablerad och handen har stöd i den färgen.
- Renons = +3, singleton = +2, dubbelton = +1 i sidofärg.
- Korthet i trumffärgen ger inte kortfärgspoäng.
- I sang räknas enbart HP; ingen korthets- eller trumflängdsbonus.

### Gemensam trumflängdsbonus
- 8 gemensamma trumfkort: ingen extra längdpoäng.
- 9 gemensamma trumfkort: +1.
- 10 eller fler gemensamma trumfkort: +2 (inte +3).
- Denna bonus läggs till utöver respektive hands kortfärgspoäng; den ersätter inte korthetspoängen.

## 2. Stenberg 2NT

- Svarshandens 2NT efter 1♥/1♠ visar 13+ HTP och minst fyra korts stöd; utgångskrav.
- Void får inte behandlas som singleton.
- Öppnaren visar exakt en singleton i sidofärg på 3-nivån.
- Flera möjliga singletonfärger utan uttrycklig prioritet ska lämnas ej täckta i råmotorn.
- 15+ HTP utan singleton: 3M.
- 12–14 HP och balanserad hand utan singleton: 3NT.
- Om styrkan når utgångsnivå men den exakta fortsättningen inte är fastställd av Stenbergregeln, ska rånoden inte hitta på ett återbud. Den separata game-safety-kontrollen kan väga in 26+ gemensamma spelpoäng.

## 3. Öppnarens återbud efter 1M–2M

- 2M visar minst fyra korts stöd och begränsad svarshand enligt grundsystemets intervall.
- Högst 16 HTP hos öppnaren: pass.
- 17–19 HTP med exakt en singleton i sidofärg: visa singletonfärgen på 3-nivån.
- 17–19 HTP utan singleton: 3M (invit).
- 20+ HTP: 4M.
- Flera singletonfärger utan prioritet: ej täckt; välj inte godtycklig färg.


## 4. Förtydliganden från manuell kontroll av ostörda givare

- Efter 1NT–2♣–2♠ (Stayman) med konstaterad 8-korts spaderfit ska svarshanden passa när parets gemensamma spelpoäng understiger 26. Bjud inte automatiskt 3♠ enbart för att svarshanden har 10 hp. Vid 26+ gemensamma spelpoäng bjuds 4♠.
- Efter 1♣–2♣ väljer öppnaren 3NT med 18+ hp och balanserad hand. Sang prioriteras framför utgång i lågfärg när handen är jämn.
- Efter 1♦–1♠–2♣–2NT accepterar öppnaren med 3NT när öppnaren har håll i alla fyra färger. 2NT-inviten accepteras i sang; sang prioriteras framför lågfärgsutgång. Sang prioriteras framför lågfärgsutgång.
- Efter 2NT–3♣–3♠ väljer svarshanden 3NT med balanserad hand, minst 25 gemensamma honnörspoäng och utan 8-korts spaderfit. En lågfärg ska inte sökas före sangutgång i detta läge.
- Fortsättningen efter 1♥–1NT är fortfarande ej fastställd och ska lämnas ej täckt tills systemregeln har beslutats.

## 5. Konkurrensbudgivning – pausad

Konkurrensbudgivningen är pausad. Kvarvarande luckor från 140-givarsanalysen bevaras i baslinjen och utvecklingsloggen. De ska inte påverka eller sänka kvaliteten i den ostörda motorn. Återuppta först efter separat beslut och fortsatt avstämning mot REF.

## 6. Valideringsprinciper

1. Skilj systemkorrekthet från strategisk spelstyrka och DDS-efterhandsanalys.
2. Visa endast rekommendationer som stöds av grundsystemet eller tydligt märkta, godkända kompletteringar.
3. Visa inte en budrekommendation om flera regler konkurrerar utan dokumenterad prioritet.
4. Samma fasta testgivare används vid varje motorändring.
5. En ny ostörd analys ska redovisa täckning, ej täckta lägen, tekniska undantag och olagliga rekommendationer separat.


## 5. Manuell genomgång av nya ostörda testgivare (2026-11-15)

Följande bedömningar är dokumenterade från genomgången av de åtta redovisade givarna. De är underlag för fortsatt arbete; motorn ändras inte automatiskt av denna notering.

- **Giv 023:** Syd har 21 hp, Nord 6 hp och paret har 10 ruter. Den gemensamma spelstyrkan enligt motorns fulla värdering når utgångsgränsen. Rekommendation: **5♦**.
- **Giv 037:** Behöver inte täckas av motorn i nuläget. Behandlas som en accepterad lucka.
- **Giv 055:** Paret har 12 ruter och 34 gemensamma spelpoäng. Med minst 10-korts fit och 33+ spelpoäng rekommenderas **6♦** som lillslam.
- **Giv 068:** Efter den exakta sekvensen 1♣–1♦–2♣–2NT visar öppnaren hjärterhåll med **3♥**, utgångskrav.
- **Giv 103, 126, 140 och 149:** Lämnas obesvarade tills vidare. Inga budregler ska härledas från dessa givare utan ny genomgång.

I betatestets rättningsvy visas nu den utlösta budnoden separat och utfällbart för varje N/S-bud som har en täckt rekommendation. Den innehåller handfördelning, HP, partnerns hand, fit, gemensamma spelpoäng, längd-/fördelningspoäng, nodens rekommendation och systembetydelse. Ej täckta bud får ingen påhittad nod.
- **Giv 103, 126, 140 och 149:** Lämnas obesvarade tills vidare. Inga budregler ska härledas från dessa givare utan ny genomgång.

Övriga obesvarade fall i stressmaterialet ska fortsatt redovisas som ej täckta, inte fyllas med antaganden.
