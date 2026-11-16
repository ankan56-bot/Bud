# 4NT och slamkomplex – verifierad status

Senast uppdaterad: 2026-11-16  
Systemkälla: **Nordisk standard, 2012-08-22**, främst sida 5 och sida 7.  
Arbetsgren: `work/undisturbed-architecture`. `main` är inte ändrad.

## 1. Betydelsen av 4NT

4NT tolkas alltid utifrån den offentliga budsekvensen. Det får inte automatiskt klassas som essfråga.

### Fastställd trumf – RKC 1430

RKC används när trumf är fastställd. Motorn identifierar nu:

- Naturligt bjuden och höjd färg – samtliga fyra färger kan vara trumf.
- Stenberg 2NT efter 1♥ eller 1♠. 2NT efter 1♣ eller 1♦ behandlas inte som Stenberg.
- Stayman-svar 2♥ eller 2♠, där högfärgen är indirekt fastställd enligt Nordisk standard.
- Fullföljd överföring 1NT–2♦–2♥ respektive 1NT–2♥–2♠; 4NT är uttryckligen RKC med överföringsfärgen som trumf.
- De särskilda Staymanfortsättningarna där öppnaren visar spaderfit efter 2NT/3NT.

4NT efter en överförings-superaccept är fortsatt ej täckt när källan inte uttryckligen fastställer den fortsättningen. Motorn ska inte anta att superaccepten automatiskt ger samma RKC-överenskommelse.

### Ingen fastställd trumf – fyr-essfråga

Följande sekvenser är uttryckligen avtalade som fyr-essfråga:

- 1NT–4NT
- 1NT–2♣–2♦–4NT

Svar enligt Nordisk standard sida 7:

| Svar | Betydelse |
|---|---|
| 5♣ | 0 eller 4 ess |
| 5♦ | 1 ess |
| 5♥ | 2 ess |
| 5♠ | 3 ess |

**5NT är inte svaret för fyra ess** i denna tabell.

### Kvantitativ 4NT

2NT–4NT är en kvantitativ invit till 6NT, inte en essfråga. Nordisk standard anger inte en tillräckligt exakt accept-/passgräns för öppnaren. Den fortsättningen lämnas därför ej täckt tills en sådan regel är uttryckligen beslutad.

## 2. RKC 1430 – projektets svarstabell

Projektets uttryckligen valda RKC 1430-ordning är:

| Svar | Betydelse |
|---|---|
| 5♣ | 1 eller 4 nyckelkort |
| 5♦ | 0 eller 3 nyckelkort |
| 5♥ | 2 nyckelkort utan trumfdam |
| 5♠ | 2 nyckelkort med trumfdam |

Nyckelkorten är de fyra essen och trumfkungen. Denna 1430-ordning är projektets avtalade variant; den ska inte blandas ihop med den omvända 5♣/5♦-ordning som står i Nordisk standards generella RKC-tabell.

### Renonsvisningar enligt Nordisk standard sida 7

- 5NT visar 3 nyckelkort och någon renons.
- 6 i färg visar 2 nyckelkort och renons i den bjudna färgen.
- Om renonsfärgen är högre än trumf visas den i stället genom 6 i trumf.
- Två nyckelkort och flera renonser lämnas ej täckt eftersom systemtexten inte väljer vilken renons som ska visas.
- Fem av fem nyckelkort saknar ett uttryckligt svar i projektets 1430-tabell och lämnas ej täckt.

## 3. Fortsättningen efter RKC-svaret

Nordisk standard sida 7 beskriver en fråga efter trumfdam efter svar på 5-läget. Den anger att trumfdamen förnekas genom 5 i trumf och visas genom 5NT eller 6 i ny färg, där 6 i ny färg också visar kung i den färgen.

Källan ger däremot inte en entydig och fullständig laglig budstege för samtliga svar, alla fyra trumffärger och alla fortsättningslägen. Rättningsmotorn hittar därför inte på en generell fortsättning. Dessa positioner markeras **ej täckta** och sparas i den separata granskningsloggen.

Efter fyr-essfråga utan trumf anger Nordisk standard inte heller en fortsättningsstege. Även dessa fortsättningar lämnas ej täckta.

## 4. Tester och loggning

Regressionstester täcker nu:

- RKC 1430 med ♣, ♦, ♥ och ♠ som trumf.
- Samtliga fyra ordinarie svarskategorier.
- 5NT för 3 nyckelkort och renons.
- 6 i färg för 2 nyckelkort och renons, inklusive regeln när renonsfärgen är högre än trumf.
- Flera renonser och fem av fem nyckelkort som ej täckta fall.
- Fyr-essfråga i sang, både direkt efter 1NT och efter 1NT–2♣–2♦.
- 2NT–4NT som kvantitativ invit, skild från essfråga.
- Att 2NT efter lågfärgsöppning inte felaktigt tolkas som Stenberg.

Alla ej täckta positioner sparas i `EjTacktaLogg` både vid efterhandsrättning och i livebedömningen. Loggen deduplicerar identiska positioner och kan exporteras för expertgranskning.

## 5. Kvar att fastställa

1. Fullständig, laglig fortsättningsstege efter RKC-svar – särskilt trumfdamfrågan och fortsättningen efter svar som visar trumfdam eller renons.
2. Fortsättning efter fyr-essfråga utan trumf.
3. Numerisk accept-/passregel efter kvantitativt 2NT–4NT.
4. Eventuella ytterligare 4NT-sekvenser som ska vara särskilt avtalade.

Dessa punkter ska inte fyllas med allmän bridgepraxis utan källstöd eller uttryckligt beslut.
