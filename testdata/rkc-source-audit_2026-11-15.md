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

Källan anger också att efter dubbeltydiga 5♣-/5♦-svar kan svarshanden gå ned i 5 i trumf; om frågeställaren då har 3 eller 4 ess ska denne bjuda 6 i trumf. Den exakta praktiska budsekvensen behöver modelleras separat och testas innan den kodas.

## Kodstatus efter denna granskning

- Svarskoderna för 5♣–5♠ med fastställd trumf finns i `rkcReply`.
- Projektets särskilda 5NT-visning av 3 ess och renons finns.
- Svar på 6 i färg för 2 ess och renons är implementerat: en renons visas med 6 i renonsfärgen, men om renonsfärgen är högre än trumf visas 6 i trumf. Flera renonser lämnas ej täckta eftersom källan inte anger vilken som ska visas.
- Fyr-essfrågan utan trumf behåller den separat överenskomna sekvenslogiken.
- Frågeställarens fortsättning efter 5♣/5♦/5♥/5♠ med trumf är nu markerad som ej täckt i stället för att automatiskt föreslå 6 i trumf. Det förhindrar att en osäker fortsättning presenteras som systemfacit.
- Nästa utvecklingssteg är att modellera den dokumenterade fortsättningen efter dubbeltydiga 5♣-/5♦-svar, inklusive när svarshanden går ned i 5 i trumf. Detta ska göras först när den exakta budsekvensen kan identifieras utan att gissa.

## Kvalitetsprincip

Ingen RKC-fortsättning ska härledas enbart från allmän bridgepraxis och märkas som Nordisk standard. Där källan inte ger ett entydigt val ska motorn redovisa luckan.
