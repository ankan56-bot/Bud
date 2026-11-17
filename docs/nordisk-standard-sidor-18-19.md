# Nordisk Standard – sidorna 18–19: fortsättningsbud efter 1 i färg

Källa: användarens uppladdade fotografi i `bilaga 1.pdf`, tryckta sidor 18–19 i *Lathund – Nya Bridgeskolan*. Detta är en korrigerad avskrift direkt mot bilden.

Detta underlag gäller ostörd budgivning. Det är källmaterial, inte i sig bevis på att reglerna är implementerade. Bevara hp och stödpoäng (stp) som skilda mått. Otydliga eller motstridiga tolkningar ska loggas för expertkontroll, inte fyllas i med antaganden.

## Sida 18 – ÖH:s tredje bud när SH visar en svag hand eller inviterar med 2NT

Inledning: ÖH passar ofta, men med fördelning eller styrka kan han bjuda igen. Invitbuden visar alla cirka 15–17 hp.

### SH återbjuder 1NT

Exempelsekvens: 1♣–1♥; 1♠–1NT; pass–pass–pass, ÖH:s tredje bud.

| Bud | Betydelse |
|---|---|
| 2♣ | 5–4 eller 4441, 11–15 hp |
| 2♦ | 6-kortsfärg, 11–14 hp |
| 2♥ | 4-korts hjärter, 15–17 hp |
| 2♠ | 3-korts spader, 15–17 hp |
| 2NT | Invit, (15) 16–17 hp |
| 3♣ | 6-kortsfärg, 15–17 hp |
| 3♠ | 6–5-fördelning, 14–17 hp |

### SH prefererar

| Bud | Betydelse |
|---|---|
| Pass | 11–15 hp |
| 2♠ | 3-korts spader, 15–17 hp |
| 2NT | Invit, (15) 16–17 hp |
| 3♣ | 5–5-fördelning, 15–17 hp |
| 3♥ | 6–4-fördelning, 15–17 hp |
| 4♥ | Minst 6–4-fördelning, stark hand |

### SH bjuder om sin färg

| Bud | Betydelse |
|---|---|
| Pass | 11–15 hp |
| 2♠ | 6–5-fördelning, minimum |
| 2NT | Invit, (15) 16–17 hp |
| 3♦ | 6-kortsfärg, 15–17 hp |
| 3♥ | Invit |
| 3♠ | 6–5-fördelning, 14–17 hp |
| 4♣ | Splinter, 16–17 hp |
| 4♥ | Slutbud |

**Systemkonflikt att bevara för expertbeslut:** Tabellen på sidan 18 anger 4♣ Splinter. I projektets tidigare systembeslut har Splinter tagits bort. Återinför inte Splinter automatiskt; logga konflikten och låt användaren/expert avgöra vilken norm som ska gälla.

### SH inviterar med 2NT

| Bud | Betydelse |
|---|---|
| 3♣ | Svagt, fjärde färg, utgångskrav |
| 3♦ | 5–5-fördelning, minimum |
| 3♥ | 6–4-fördelning, minimum |
| 3♠ | 3-korts spader, maximum (annars 2♠ direkt) |
| 3NT | Slutbud |

## Sida 19 – ÖH:s tredje bud när SH bjuder tredje eller fjärde färg

Inledning: Eftersom SH kräver genom att bjuda en ny färg måste ÖH fortsätta. Det kan han göra genom att visa extra färglängder, preferera till SH:s första färg eller bjuda sang med håll. Ett hopp till SH:s först bjudna färg visar 3-stöd.

### SH bjuder tredje färg

Exempel: 1♣–1♥; 2♣–2♦; ÖH:s fortsättning.

| Bud | Betydelse |
|---|---|
| Pass | Inte tillåtet |
| 2♥ | 2-korts hjärter, minimum |
| 2♠ | Fjärde färg, utgångskrav |
| 2NT | Spaderhåll, minimum |
| 3♣ | 6-kortsfärg, minimum |
| 3♦ | 4-kortsstöd |
| 3♥ | 3-korts hjärter |
| 3NT | Spaderhåll, maximum |

### Fortsättning efter tredje färg

| Bud | Betydelse |
|---|---|
| 2♠ | Fjärde färg, utgångskrav |
| 2NT | Invit, 11–12 hp |
| 3♣ | Invit, 11–12 hp |
| 3♦ | 5–5-fördelning, 11–12 hp |
| 3♥ | 6-korts hjärter, 11–12 hp |

### SH bjuder fjärde färg

Exempel: 1♥–1♠; 2♣–2♦; ÖH:s fortsättning.

| Bud | Betydelse |
|---|---|
| Pass | Inte tillåtet |
| 2♥ | Inget bättre bud |
| 2♠ | 2-korts spader |
| 2NT | Ruterhåll |
| 3♣ | 5–5-fördelning |
| 3♦ | 4-kortsfärg |
| 3♥ | 6–4-fördelning, maximum (annars 2♠ direkt) |
| 3♠ | 3-korts spader, maximum (annars 2♠ direkt) |
| 3NT | Inte tillåtet |

### Fortsättning efter fjärde färg

| Bud | Betydelse |
|---|---|
| 2NT | Ruterhåll, 13+ hp |
| 3♣ | Minst 4-stöd, 13+ stp |
| 3♥ | 3-stöd, 16+ stp |
| 3♠ | Minst 6-korts, 16+ stp |
| 3NT | Ruterhåll, slutbud |
| 4♠ | Minst 6-korts, maximum 15 stp |

## Implementations- och testregler

- Implementera tabellerna som separata, igenkännbara budvägar i ostörd budgivning.
- Testa öppningshandens tredje bud och svarshandens fortsättning var för sig.
- Bevara skillnaden mellan hp och stp exakt som tabellerna anger.
- Bevara betydelserna minimum, maximum, invit, utgångskrav, slutbud, ”inte tillåtet” och ”inget bättre bud”.
- Tredje färg och fjärde färg är skilda vägar; avgör inte vilken det är enbart från handens hp.
- Sidorna visar exempelbudgivningar. Generalisera inte till andra sekvenser utan stöd i källan.
- Ändra inte färdigställda 1NT- eller trumfstödsregler som sidoeffekt.
- Splinterkonflikten ovan ska ligga kvar som en uttrycklig expertfråga.
- Varje budväg som inte säkert kan bedömas ska registreras som ej täckt för expertgranskning.
- Dokumentation räknas inte som implementation. En regel får markeras klar först när den har kodstöd och regressionstest.
