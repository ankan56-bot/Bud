# Nordisk Standard – sidorna 18–19: fortsättningsbud efter 1 i färg

Källa: *Lathund – Nya Bridgeskolan*, kapitel 3 ”Budgivning efter en i färg”, tryckta sidor 18–19. Underlaget är användarens uppladdade fotografi av uppslaget.

Detta dokument är en källnära registrering av tabellerna. Det ska användas som normativt underlag vid komplettering av ostörd budgivning. Där en tabell eller sekvens behöver tolkas ytterligare ska den markeras för kontroll – regler får inte fyllas i genom antaganden.

## Sida 18 – Öppningshandens tredje bud när svarshanden visar svag hand eller inviterar med 2NT

Inledande text: Öppningshanden passar ofta, men med fördelning eller styrka kan den bjuda igen. Invitbuden visar cirka 15–17 hp.

### Svarshanden återbjuder 1NT

Tabellen anger följande fortsättningar:

| Bud | Betydelse |
|---|---|
| 2♣ | 5–4 eller 4441, 11–15 hp |
| 2♦ | 6-kortsfärg, 11–14 hp |
| 2♥ | 4-korts hjärter, 15–17 hp |
| 2♠ | 5–5-fördelning, 11–13 hp |
| 2NT | Invit, (15) 16–17 hp |
| 3♣ | 6-kortsfärg, 15–17 hp |
| 3♠ | 6–5-fördelning, 14–17 hp |

### Svarshanden prefererar

| Bud | Betydelse |
|---|---|
| 2♠ | 3-korts spader, 15–17 hp |
| 2NT | Invit, (15) 16–17 hp |
| 3♣ | 5–5-fördelning, 15–17 hp |
| 3♥ | 6–4-fördelning, 15–17 hp |
| 4♥ | Minst 6–4-fördelning, stark hand |

### Svarshanden bjuder om sin färg

| Bud | Betydelse |
|---|---|
| 2♠ | 6–5-fördelning, minimum, 11–15 hp |
| 2NT | Invit, (15) 16–17 hp |
| 3♦ | 6-kortsfärg, 15–17 hp |
| 3♥ | Invit |
| 3♠ | 6–5-fördelning, 14–17 hp |
| 4♣ | Splinter, 16–17 hp |
| 4♥ | Slutbud |

*Obs: Budsekvensens exakta kortsymboler i exempelrutan ska vid implementation kontrolleras mot originalbilden; betydelserna ovan är avlästa ur tabellens budrader.*

### Svarshanden inviterar med 2NT

| Bud | Betydelse |
|---|---|
| 3♣ | Svagt, fjärde färg, utgångskrav |
| 3♦ | 5–5-fördelning, minimum |
| 3♥ | 6–4-fördelning, minimum |
| 3♠ | 3-korts spader, maximum (annars 2♠ direkt) |
| 3NT | Slutbud |

## Sida 19 – Öppningshandens tredje bud när svarshanden bjuder tredje eller fjärde färg

Inledande text: Eftersom svarshanden kräver genom att bjuda en ny färg måste öppningshanden fortsätta. Det kan göras genom att visa extra färglängder, preferera till svarshandens första färg eller bjuda sang med håll. Ett hopp till svarshandens först bjudna färg visar trekortsstöd.

### Svarshanden bjuder tredje färg

| Bud | Betydelse |
|---|---|
| 2♥ | Inte tillåtet |
| 2♠ | 2-korts hjärter, minimum |
| 2NT | Fjärde färg, utgångskrav |
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
| 3♦ | 5–5, 11–12 hp |
| 3♥ | 6-korts hjärter, 11–12 hp |

### Svarshanden bjuder fjärde färg

| Bud | Betydelse |
|---|---|
| 2♥ | Inget tillåtet |
| 2♠ | Inget bättre bud |
| 2NT | 2-korts spader |
| 3♣ | Ruterhåll |
| 3♦ | 5–5-fördelning |
| 3♥ | 4-kortsfärg |
| 3♠ | 6–4-fördelning, maximum (annars 2♠ direkt) |
| 3NT | Inget tillåtet |

### Fortsättning efter fjärde färg

| Bud | Betydelse |
|---|---|
| 2NT | Ruterhåll, 13+ hp |
| 3♣ | Minst 4-stöd, 13+ stödpoäng |
| 3♥ | 3-stöd, 16+ stödpoäng |
| 3♠ | Minst 6-korts, 16+ stödpoäng |
| 3NT | Ruterhåll, slutbud |
| 4♠ | Minst 6-korts, maximum 15 stödpoäng |

## Implementationsregler och kvalitetssäkring

- Dessa tabeller ska läggas till i ostörd budgivnings rättningsmotor och testunderlag.
- Bevara skillnaden mellan hp och stödpoäng (stp); konvertera inte automatiskt den ena till den andra.
- Bevara uttryck som minimum, maximum, invit, utgångskrav, slutbud, ”inte tillåtet” och ”inget bättre bud”.
- ”Inte tillåtet” och ”inget tillåtet” är inte samma sak som en saknad regel; de är uttryckliga begränsningar i tabellen.
- Tredje färg och fjärde färg ska behandlas som skilda budvägar.
- Testa både öppningshandens svar och svarshandens fortsättning, med exakta budsekvenser.
- Om en handtyp, styrkegräns eller fortsättning inte kan utläsas entydigt ur källan ska den loggas som ej täckt/kräver expertkontroll. Hitta inte på en komplettering.
- Ändra inte redan färdigställda 1NT- eller trumfstödsregler som sidoeffekt. Dela hellre gemensam logik med tydliga tester.
- Dokumentet registrerar källinnehållet; kodändringar får markeras som klara först när motsvarande implementation och regressionstester är genomförda.
