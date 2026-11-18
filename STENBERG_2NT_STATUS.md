# Stenberg 2NT – implementation status

Källa: **Nordisk standard, 2012-08-22**, s. 2–3 (PDF i användarens bibliotek).
Ingen extern webbsökning används.

## Svarshandens 2NT

- 1♥–2NT och 1♠–2NT: minst 13 htp och minst fyra korts stöd. Stenberg och utgångskrav.
- 1♣–2NT och 1♦–2NT: samma krav.
- Efter lågfärgsöppning ska svarshanden visa 4-korts högfärg före lågfärgsstödet. Därför ska 2NT i lågfärg inte användas om svarshanden har en 4-korts högfärg.

## Absolut avgränsning av Stenberg 2NT

- Stenberg gäller endast när 2NT är svarshandens direkta svar på partnerns öppning 1♣, 1♦, 1♥ eller 1♠.
- I dessa fyra sekvenser är 2NT alltid Stenberg och alltid utgångskrav.
- Öppnaren får inte passa på Stenberg 2NT; öppnaren måste lämna ett systemenligt återbud.
- 2NT i varje annan budsekvens är **inte Stenberg**. Det ska bedömas enligt den specifika sekvensens egen regel, exempelvis invit, hållvisning, återbud eller annan överenskommelse.
- Stenberg får inte aktiveras enbart för att auktionen innehåller en öppning på 1-tricksnivån och ett 2NT-bud senare. Det måste vara det direkta svaret utan föregående bud från svarshanden eller motståndarna.
- Denna avgränsning gäller både budrekommendation, rättning och live-läge.

## Öppningshandens första återbud efter Stenberg

| Öppning | Återbud | Betydelse |
|---|---|---|
| 1♥ | 3♥ | 15+ htp, ingen singleton |
| 1♥ | 3♣ / 3♦ | Singleton i bjuden lågfärg |
| 1♥ | 3♠ | Singleton i andra högfärgen |
| 1♠ | 3♠ | 15+ htp, ingen singleton |
| 1♠ | 3♣ / 3♦ | Singleton i bjuden lågfärg |
| 1♠ | 3♥ | Singleton i andra högfärgen |
| 1♣ | 3♣ | 15+ htp, ingen singleton |
| 1♣ | 3♦ | Singleton i andra lågfärgen |
| 1♣ | 3♥ / 3♠ | Singleton i bjuden högfärg |
| 1♦ | 3♦ | 15+ htp, ingen singleton |
| 1♦ | 3♣ | Singleton i andra lågfärgen |
| 1♦ | 3♥ / 3♠ | Singleton i bjuden högfärg |
| Alla | 3NT | 12–14 hp, balanserad hand |

## Slutpunkter

- 4♥/4♠: högfärgsutgång.
- 5♣/5♦: lågfärgsutgång.
- 4NT: överlämnas till befintlig RKC-/slammodul när trumfen är fastställd.

Utgångskontrollen kräver minst 8-korts fit och projektets spelpoängsgräns: 26 i högfärg och 28 i lågfärg. 4NT efter Stenberg i lågfärg fastställer öppningsfärgen som trumf och routas till RKC.

## Källuckor – expertloggen

PDF:en beskriver inte svarshandens fullständiga fortsättning efter öppnarens 3-färgsåterbud/3NT. Den anger inte heller prioritet mellan flera singletoner eller fortsättning med renons. Dessa positioner markeras EJ TÄCKTA och sparas i expertloggen. Kända regelbrott, exempelvis för få htp eller stöd, markeras däremot inte som källuckor.

## Analysbibliotek

- T34_STENBERG_2NT: högfärgsvarianten.
- T35_STENBERG_2NT_LAGFARG: klöver- och rutervarianten.
- T45_RKC_NORDISK_KLOVER och T46_RKC_NORDISK_RUTER: RKC-grenar efter Stenberg 2NT i lågfärg.

## Tester

tests/stenberg-2nt.test.js täcker hög- och lågfärg, 13 htp-gränsen, 4+ stöd, sök-högfärg-regeln, singletonvisningar, 3NT, 15+ htp utan singleton, live-läge, 100 deterministiska Stenberghänder, lågfärgsutgång och RKC-handoff.


## Separata 2NT-inviter efter svarshandens första färgbud

- 1♥–1♠–2♣–2NT: Nordisk standard s. 3 anger 10–12 hp, balanserad hand, exakt två hjärter samt håll i spader och ruter. Detta är en naturlig invit, inte Stenberg.
- 1♥–1♠–2♦–2NT: användaren har uttryckligen fastställt 11–12 hp och invit. Implementationen kräver balanserad hand och håller denna exakta sekvens separat från 2♣-grenen.
- Båda sekvenserna är svarshandens andra bud efter öppnarens andra färg. De får aldrig ärva Stenbergs utgångskrav eller 4-kortsstödskrav.


## Stenberg 2NT efter svag tvåöppning – separat konvention

Källa: Bridge Lathund bok, tryckt sida 27.

- Efter svag 2♦, 2♥ eller 2♠ visar 2NT Stenberg med minst 13 STP.
- Detta är en egen Stenberggren och får inte blandas ihop med 1♥/1♠–2NT eller 1♣/1♦–2NT.
- Rättningsmotorn räknar STP med öppningsfärgen som trumf enligt projektets handpoängsmodell.
- Den äldre regeln 2NT = 9–10 hp och 2+ stöd är borttagen.
- Öppnarens fortsättning efter svag tvåa–2NT är inte tillräckligt specificerad i källunderlaget. Den lämnas EJ TÄCKT; den gamla 6–8/9–10 hp-stegen får inte användas.
- Överlapp mellan 13+ STP och en lång sidofärg lämnas EJ TÄCKT tills lathundens prioritet är fastställd.

