# Källgranskning av RKC – 2026-11-15

## Auktoritativ källa

Nordisk standard, 2012-08-22, sida 7, avsnittet ”Slaminstrument – RKC”.

## Uttryckligen belagt när trumf är fastställd

- Trumfkungen räknas som det femte esset.
- 5♣ visar 0 eller 3 av fem ess.
- 5♦ visar 1 eller 4 av fem ess.
- 5♥ visar 2 ess utan trumfdam.
- 5♠ visar 2 ess med trumfdam.
- 5NT visar 3 ess och någon renons.
- 6 i färg visar 2 ess och renons i den bjudna färgen.
- Om renonsfärgen är högre än trumf ska svaret vara 6 i trumf.

## Uttryckligen belagt när trumf inte är fastställd

- Källan anger en fyr-essvariant: 5♣ = 0 eller 4, 5♦ = 1, 5♥ = 2, 5♠ = 3.
- Denna tabell är skild från den särskilt överenskomna fyr-essfrågan i vissa sangsekvenser som redan finns i projektet. De sekvensspecifika sangreglerna ska inte felaktigt tillskrivas denna RKC-tabell.

## Fortsättningar som källan beskriver men inte fullständigt specificerar

Källan säger att ”nästa bud som inte är trumf” efter svar på 5-läget frågar efter trumfdamen. Trumfdamen förnekas genom att bjuda 5 i trumf och visas genom 5NT eller 6 i ny färg (vilket visar kung i den färgen). Texten specificerar inte tillräckligt tydligt samtliga budval och prioriteringar i fortsättningen för att motorn ska kunna välja ett entydigt bud i alla lägen.

Källan anger också att efter dubbeltydiga 5♣-/5♦-svar kan svarshanden gå ned i 5 i trumf; om frågeställaren då har 3 eller 4 egna ess ska denne bjuda 6 i trumf. Motorn känner nu igen den avgränsade sekvensen 4NT–5♣/5♦–frågeställarens bud utanför trumf–5 i trumf och föreslår 6 i trumf när frågeställaren har 3 eller 4 ess. Andra fortsättningar förblir ej täckta.

## Kodstatus efter denna granskning

- Svarskoderna för 5♣–5♠ med fastställd trumf finns i `rkcReply`.
- Projektets särskilda 5NT-visning av 3 ess och renons finns.
- Svar på 6 i färg för 2 ess och renons är implementerat: en renons visas med 6 i renonsfärgen, men om renonsfärgen är högre än trumf visas 6 i trumf. Flera renonser lämnas ej täckta eftersom källan inte anger vilken som ska visas.
- Fyr-essfrågan utan trumf behåller den separat överenskomna sekvenslogiken.
- Frågeställarens fortsättning efter 5♣/5♦/5♥/5♠ med trumf är i huvudsak markerad som ej täckt i stället för att automatiskt föreslå 6 i trumf. Det dokumenterade specialfallet efter 5♣/5♦ och partnerns återgång till 5 i trumf är undantaget: 3 eller 4 egna ess ger 6 i trumf.
- Den dokumenterade fortsättningen efter dubbeltydiga 5♣-/5♦-svar är implementerad för den identifierbara återgången till 5 i trumf: frågeställaren med 3 eller 4 egna ess bjuder 6 i trumf. Övriga fortsättningar lämnas ej täckta.

## Kvalitetsprincip

Ingen RKC-fortsättning ska härledas enbart från allmän bridgepraxis och märkas som Nordisk standard. Där källan inte ger ett entydigt val ska motorn redovisa luckan.


## Tillägg – uppdaterad överenskommelse 2026-11-18

- **Sang:** 4NT frågar efter fyra ess: 5♣ = 0/4, 5♦ = 1, 5♥ = 2, 5♠ = 3. Saknas minst ett ess blir slutbudet 6NT. Alla fyra ess leder till 5NT som kungfråga. Kungssvar: 6♣ = 0/4, 6♦ = 1, 6♥ = 2, 6♠ = 3. Saknas minst en kung blir slutbudet 6NT; alla fyra kungar tillsammans med alla fyra ess ger 7NT.
- **Trumf:** 4NT frågar efter fem nyckelkort: 5♣ = 0/3, 5♦ = 1/4, 5♥ = 2 utan trumfdam, 5♠ = 2 med trumfdam. 5NT används därefter som kungfråga. Lägsta relevanta kung visas först, därefter nästa enligt färgordningen. Singelton/renons räknas som kung i färgen. Minst två saknade eller osäkra kungar innebär stopp på 6 i trumf och pass. Trumffärgen får inte hoppas över.
- Sangens 5NT-kungfråga får inte blandas ihop med äldre RKC-kod där 5NT kunde visa 3 nyckelkort och renons.
- Sekvenser där 4NT inte uttryckligen är avtalad fråga förblir ej täckta/kvantitativa enligt sammanhanget; motorn får inte anta essfråga.

Källtexten i Nordisk standard och parets uttryckliga senare överenskommelse hålls åtskilda. Där fortsättningen inte är entydigt specificerad i regelprofilen ska den fortfarande loggas som ej täckt.


## Tillägg – senare regelbeslut 2026-11-18

Den senare överenskommelsen om trumfens 5NT kungfråga går före källtextens äldre 5NT = 3 nyckelkort och renons. 5NT efter RKC ska därför identifieras som kungfråga. Exakt färgvis svarssteg är inte tillräckligt specificerad för automatisk budgivning och lämnas ej täckt. Tre nyckelkort och renons har inget automatiskt svar i den uppdaterade profilen.
