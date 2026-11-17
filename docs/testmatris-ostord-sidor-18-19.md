# Testmatris – ostörd budgivning, Nordisk Standard s. 18–19

Källa: användarens uppladdade `bilaga 1.pdf`, tryckta sidor 18–19. Matrisen återger budraderna direkt från fotografiet.

## Sida 18 – ÖH:s tredje bud

### SH återbjuder 1NT
- 2♣: 5–4 eller 4441, 11–15 hp
- 2♦: 6-kortsfärg, 11–14 hp
- 2♥: 4-korts hjärter, 15–17 hp
- 2♠: 3-korts spader, 15–17 hp
- 2NT: invit, (15) 16–17 hp
- 3♣: 6-kortsfärg, 15–17 hp
- 3♠: 6–5-fördelning, 14–17 hp

### SH prefererar
- Pass: 11–15 hp
- 2♠: 3-korts spader, 15–17 hp
- 2NT: invit, (15) 16–17 hp
- 3♣: 5–5-fördelning, 15–17 hp
- 3♥: 6–4-fördelning, 15–17 hp
- 4♥: minst 6–4-fördelning, stark hand

### SH bjuder om sin färg
- Pass: 11–15 hp
- 2♠: 6–5-fördelning, minimum
- 2NT: invit, (15) 16–17 hp
- 3♦: 6-kortsfärg, 15–17 hp
- 3♥: invit
- 3♠: 6–5-fördelning, 14–17 hp
- 4♣: Splinter, 16–17 hp (konflikt med projektbeslutet att ta bort Splinter; får inte återinföras automatiskt)
- 4♥: slutbud

### SH inviterar med 2NT
- 3♣: svagt, fjärde färg, utgångskrav
- 3♦: 5–5-fördelning, minimum
- 3♥: 6–4-fördelning, minimum
- 3♠: 3-korts spader, maximum (annars 2♠ direkt)
- 3NT: slutbud

## Sida 19 – SH bjuder tredje eller fjärde färg

### SH bjuder tredje färg
- Pass: inte tillåtet
- 2♥: 2-korts hjärter, minimum
- 2♠: fjärde färg, utgångskrav
- 2NT: spaderhåll, minimum
- 3♣: 6-kortsfärg, minimum
- 3♦: 4-kortsstöd
- 3♥: 3-korts hjärter
- 3NT: spaderhåll, maximum

### Fortsättning efter tredje färg
- 2♠: fjärde färg, utgångskrav
- 2NT: invit, 11–12 hp
- 3♣: invit, 11–12 hp
- 3♦: 5–5-fördelning, 11–12 hp
- 3♥: 6-korts hjärter, 11–12 hp

### SH bjuder fjärde färg
- Pass: inte tillåtet
- 2♥: inget bättre bud
- 2♠: 2-korts spader
- 2NT: ruterhåll
- 3♣: 5–5-fördelning
- 3♦: 4-kortsfärg
- 3♥: 6–4-fördelning, maximum (annars 2♠ direkt)
- 3♠: 3-korts spader, maximum (annars 2♠ direkt)
- 3NT: inte tillåtet

### Fortsättning efter fjärde färg
- 2NT: ruterhåll, 13+ hp
- 3♣: minst 4-stöd, 13+ stp
- 3♥: 3-stöd, 16+ stp
- 3♠: minst 6-korts, 16+ stp
- 3NT: ruterhåll, slutbud
- 4♠: minst 6-korts, maximum 15 stp

## Testkrav och status

1. Testa varje tabellgren separat med korrekta exempelbudgivningar.
2. Tredje respektive fjärde färg identifieras av antalet olika färger paret redan visat, inte av hp.
3. Tabellens inledning säger att ny färg är krav, men tabellen ger ingen generell hp-gräns för själva tredje-/fjärde-färgsbudet. Motorn får därför inte använda påhittade generella gränser på 10 respektive 13 hp.
4. Testa uttryckliga förbud: pass efter tredje färg, pass efter fjärde färg och 3NT efter fjärde färg.
5. Testa hp och stp separat; de får inte blandas.
6. 4♣ Splinter är en uttrycklig konflikt mellan lathunden och projektets tidigare beslut att ta bort Splinter. Logga för expertbeslut.
7. Otydliga eller ej specificerade handvärderingar ska hamna i ej-täckt-loggen.

**Status:** Källavskriften är korrigerad. Klassificeringen av tredje/fjärde färg är korrigerad i motorn. Fullständig handbaserad regressionstestning av samtliga rader återstår; dokumentet ska inte tolkas som att alla rader är godkända.
