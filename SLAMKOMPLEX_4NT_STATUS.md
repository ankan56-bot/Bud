# 4NT och slamkomplex – verifierad status

Senast uppdaterad: 2026-11-16  
Auktoritativ källa: **Nordisk standard, 2012-08-22**, s. 5 och 7.  
Arbetsgren: `work/undisturbed-architecture`. `main` är orörd.

## 1. Betydelsen av 4NT

4NT klassificeras med hela den offentliga budsekvensen. Det får inte automatiskt behandlas som essfråga.

### Fastställd trumf – RKC enligt Nordisk standard

Trumf är fastställd när färgen är bjuden och höjd, eller indirekt efter 2♥/2♠ som svar på Stayman 2♣. Stenberg 2NT efter 1♣/1♦ fastställer också öppningsfärgen som trumf eftersom svarshanden visar minst fyra korts stöd; 4NT efter Stenberg routas därför till RKC med klöver respektive ruter som trumf. Efter fullföljd överföring 1NT–2♦–2♥ respektive 1NT–2♥–2♠ är 4NT också uttryckligen RKC med överföringsfärgen som trumf (s. 5).

Fem nyckelkort är de fyra essen och trumfkungen. **Nordisk standards faktiska svarstabell på sida 7 är:**

| Svar | Betydelse |
|---|---|
| 5♣ | 0 eller 3 nyckelkort |
| 5♦ | 1 eller 4 nyckelkort |
| 5♥ | 2 nyckelkort utan trumfdam |
| 5♠ | 2 nyckelkort med trumfdam |
| 5NT | 3 nyckelkort och någon renons |
| 6 i färg | 2 nyckelkort och renons i bjuden färg; 6 i trumf om renonsfärgen är högre än trumf |

**Viktig rättelse:** En tidigare implementation och statusrapport använde felaktigt 1430-ordningen (5♣=1/4 och 5♦=0/3). Det var inte ett uttryckligt användarbeslut och stämde inte med Nordisk standard. Koden, testerna och analysbiblioteket är nu ändrade till den tryckta ordningen ovan. Benämningen 1430 ska inte användas för denna grundtabell.

### Ingen fastställd trumf – fyr-essfråga

Följande sekvenser är uttryckligen fyr-essfråga:
- 1NT–4NT
- 1NT–2♣–2♦–4NT

Svar enligt sida 7:

| Svar | Betydelse |
|---|---|
| 5♣ | 0 eller 4 ess |
| 5♦ | 1 ess |
| 5♥ | 2 ess |
| 5♠ | 3 ess |

5NT är inte svaret för fyra ess.

### Kvantitativ 4NT

2NT–4NT är kvantitativ invit till 6NT, inte essfråga. Systemtexten anger inte en exakt accept-/passgräns för öppnaren. Den fortsättningen lämnas därför ej täckt.

## 2. Trumfdamfrågan efter 5♣/5♦

Nordisk standard s. 7 anger:
- Efter svaren 5♣ eller 5♦ frågar nästa bud som inte är trumf efter trumfdamen.
- Trumfdamen förnekas genom 5 i trumf.
- Trumfdamen visas genom 5NT eller 6 i ny färg; 6 i ny färg visar också kung i den färgen.
- Efter ett dubbeltydigt 5-lågsvar bjuder frågeställaren 6 i trumf med 3 eller 4 egna ess om partnern går ner i 5 i trumf.

Implementation:
- Frågan genereras bara när det finns ett lagligt 5-bud som inte är trumf och 5 i trumf fortfarande är ett lagligt förnekande.
- Om budordningen gör detta omöjligt markeras positionen ej täckt och sparas i granskningsloggen. Motorn hittar inte på ett 6-bud som skulle ändra källans uttryckliga förnekelsebud.
- Svarshanden förnekar med 5 i trumf om den saknar trumfdamen.
- Med trumfdamen visas den med 5NT när det är lagligt; annars används 6 i ny färg endast när handen har en entydig sådan kung.
- Efter förnekad trumfdam och dubbeltydigt 5♣/5♦-svar bjuder frågeställaren 6 i trumf om den egna handen har 3 eller 4 ess.

## 3. Lillslam och storslam – projektets beslutade gränser

Dessa är uttryckliga projektregler som kompletterar systemtexten:

- **6 i färg:** tillåts när partnerskapet har minst 3 av de 4 essen (högst ett saknat ess).
- **7NT:** kräver samtliga 4 ess.
- **7 i färg:** kräver samtliga 4 ess och trumfkungen.

Motorn räknar möjliga kortkombinationer som är förenliga med RKC-svaret och den egna handen. Den rekommenderar 6/7 bara när kravet är säkert uppfyllt för samtliga möjliga tolkningar av ett dubbeltydigt svar. Om både tillräcklig och otillräcklig essfördelning fortfarande är möjlig lämnas läget ej täckt.

Ingen numerisk acceptregel för 6NT efter kvantitativ invit är införd.

## 4. Testtäckning

Regressionstester täcker:
- RKC med ♣, ♦, ♥ och ♠ som trumf.
- Den exakta RKC-svarstabellen från Nordisk standard (5♣=0/3; 5♦=1/4).
- 5NT och 6-färgssvaren för renons.
- Fyr-essfrågan i sang.
- Trumfdamfråga, förnekelse med 5 i trumf och visning med 5NT.
- 6 i färg när minst 3 ess är säkrade.
- 7 i färg när alla fyra ess och trumfkungen är säkrade.
- 7NT när alla fyra ess är säkrade.
- Ej täckta budordningskonflikter loggas i `EjTacktaLogg`.

## 5. Kvar att fastställa

1. Svar på samtliga fem nyckelkort saknas i Nordisk standards svarstabell; detta lämnas ej täckt.
2. Två nyckelkort tillsammans med flera renonser saknar en angiven prioritering av vilken renons som ska visas; detta lämnas ej täckt.
3. Trumfdamfrågans lagliga budvägar i de trumffärger/5-svar där 5 i trumf inte kan användas som förnekelse efter frågebudet.
4. Exakt val mellan flera möjliga 6-bud i ny färg om 5NT inte längre är lagligt och handen har flera sidokungar.
5. Fortsättning efter fyr-essfråga när 7NT-kravet inte är uppfyllt; 6NT-acceptgränsen efter kvantitativ invit är inte specificerad.
6. Kontrollbudssekvenserna på 4-nivån ska behandlas som ett separat delområde efter slamkomplexet.

Alla dessa luckor ska fortsätta sparas för expertgranskning i stället för att fyllas med allmän bridgepraxis.
