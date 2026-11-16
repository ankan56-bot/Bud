# Nod- och sekvensinventering – ostörd budgivning

**Datum:** 2026-11-16  
**Bas:** `analysbibliotek.json` version 0.6.5  
**Omfattning:** 40 ostörda träd, 240 noder. De fem konkurrensträden T29–T33 är avsiktligt exkluderade och ska förbli orörda.

Detta är en råinventering av befintliga noder, inte ett godkännande av deras regelinnehåll. Sekvensen visas i budordning. Grenar utan `next` redovisas som `terminal/ej länkad`; det betyder inte automatiskt att noden är färdig. Handprofil visar om `handProfile` finns i nuvarande JSON, inte om profilen är maskinellt verifierbar.


## T01_RKC_HJARTER — 4NT med överenskommen trumf – RKC

- Noder: 6
- Root: `t01_n0` (giltig)
- Villkor: Hjärter är överenskommen trumf efter Stenberg 2NT / 2NT efter 1♥ visar 13+ HTP och minst fyra hjärter / Paret spelar RKC 1430 med fem nyckelkort

- **t01_n0** — `1♥ – Pass – 2NT – Pass – 3♣ – Pass`  
  Stenberg 2NT etablerar hjärter som trumf och visar minst fyrkortsstöd samt 13+ HTP. 3♣ visar exakt en singleton i klöver; void räknas inte som singleton.  
  Grenar: 4NT → t01_n1 (Frågar efter nyckelkort). Handprofil: ja.
- **t01_n1** — `1♥ – Pass – 2NT – Pass – 3♣ – Pass – 4NT`  
  4NT är RKC 1430 eftersom hjärter är överenskommen trumf efter Stenberg 2NT.  
  Grenar: 5♣ → t01_n2 (1 eller 4 nyckelkort); 5♦ → t01_n3 (0 eller 3 nyckelkort); 5♥ → t01_n4 (2 utan hjärterdam); 5♠ → t01_n5 (2 med hjärterdam). Handprofil: saknas.
- **t01_n2** — `1♥ – Pass – 2NT – Pass – 3♣ – Pass – 4NT – Pass – 5♣`  
  Svar 5♣ visar 1 eller 4 nyckelkort enligt RKC 1430.  
  Grenar: 5♥ → terminal/ej länkad (Stanna i utgång); 6♥ → terminal/ej länkad (Lilla slammet – kräver tillräckliga nyckelkort och kontroll). Handprofil: saknas.
- **t01_n3** — `1♥ – Pass – 2NT – Pass – 3♣ – Pass – 4NT – Pass – 5♦`  
  Svar 5♦ visar 0 eller 3 nyckelkort enligt RKC 1430.  
  Grenar: 5♥ → terminal/ej länkad (Signoff); 6♥ → terminal/ej länkad (Lilla slammet om nyckelkorten räcker). Handprofil: saknas.
- **t01_n4** — `1♥ – Pass – 2NT – Pass – 3♣ – Pass – 4NT – Pass – 5♥`  
  Svar 5♥ visar två nyckelkort utan hjärterdam.  
  Grenar: Pass → terminal/ej länkad (Stanna i 5♥); 6♥ → terminal/ej länkad (Endast med tillräcklig kompletterande information). Handprofil: saknas.
- **t01_n5** — `1♥ – Pass – 2NT – Pass – 3♣ – Pass – 4NT – Pass – 5♠`  
  Svar 5♠ visar två nyckelkort med hjärterdam.  
  Grenar: 6♥ → terminal/ej länkad (Lilla slammet); 7♥ → terminal/ej länkad (Storslam – kräver mycket starkt underlag). Handprofil: saknas.

## T02_KVANTITATIV_4NT — 4NT utan överenskommen trumf – kvantitativ invit

- Noder: 2
- Root: `t02_n0` (giltig)
- Villkor: Öppningsbudet 2NT visar 20–21 hp och balanserad hand / Svarshanden har balanserad hand och cirka 11–12 hp / Ingen trumffärg är överenskommen

- **t02_n0** — `2NT`  
  2NT visar 20–21 hp och balanserad hand.  
  Grenar: 4NT → t02_n1 (Kvantitativ invit); 3NT → terminal/ej länkad (Slutbud med svagare svarshand). Handprofil: saknas.
- **t02_n1** — `2NT – Pass – 4NT`  
  4NT är en invit till 6NT, inte essfråga. Svarshanden visar slamintresse med balanserad hand.  
  Grenar: Pass → terminal/ej länkad (Minimum – avslår inviten och stannar i 4NT); 6NT → terminal/ej länkad (Maximum och lämpliga värden – accepterar). Handprofil: saknas.

## T03_OVERFORING_PASS — Överföring till hjärter – grundsekvens och fortsättningar

- Noder: 2
- Root: `t03_n0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♦ är överföring och visar minst fem hjärter; öppnaren fullföljer med 2♥ eller superaccepterar med 3♥ vid 17 hp och 4+ hjärter. / 0–8 hp: pass. 9 hp: 2NT med exakt fem hjärter eller 3♥ med 6+ hjärter som invit. / 10–15 hp: med exakt fem hjärter och jämn hand väljs 3NT vid 26+ gemensamma hp, annars 2NT-invit vid 22–25; med 6+ hjärter väljs 4♥ vid 26+ gemensamma spelpoäng, annars 3♥-invit vid 22–25. / 16+ hp: slamintresse; valet mellan kontrollbud och 4NT RKC är inte automatiserat.

- **t03_n0** — `1NT – Pass – 2♦`  
  2♦ är överföring till hjärter och visar minst fem hjärter. Öppnaren fullföljer normalt med 2♥; med 17 hp och minst fyra hjärter finns superaccept 3♥.  
  Grenar: 2♥ → t03_n1 (Normal fullföljd överföring); 3♥ → t27_superaccept (Superaccept: 17 hp och minst fyra hjärter). Handprofil: ja.
- **t03_n1** — `1NT – Pass – 2♦ – Pass – 2♥`  
  Öppnaren har fullföljt överföringen. Svarshanden väljer därefter pass, invit, utgång eller slamväg efter styrka och längd.  
  Grenar: Pass → terminal/ej länkad (0–8 hp – svagt slutbud); 2NT → t19_0 (9 hp exakt fem hjärter eller 10+ hp med 22–25 gemensamma hp – invit); 3♥ → t27_overforing_hjarter_sexkort_invit_n2 (9 hp med 6+ hjärter eller 10+ hp med 22–25 gemensamma spelpoäng – invit); 3NT → terminal/ej länkad (Exakt fem hjärter, jämn hand och 26+ gemensamma honnörspoäng); 4♥ → terminal/ej länkad (6+ hjärter, minst 8-kortsfit och 26+ gemensamma spelpoäng); 2♠ → terminal/ej länkad (6–9 hp, 5+ hjärter och 4+ spader – rondkrav; fortsättningen är inte färdig); 3♣ → terminal/ej länkad (10+ hp, 5+ hjärter och 4+ klöver – utgångskrav; fortsättningen inte färdig); 3♦ → terminal/ej länkad (10+ hp, 5+ hjärter och 4+ ruter – utgångskrav; fortsättningen inte färdig); 4♣ → terminal/ej länkad (Kontrollbud; val och fortsättning inte färdig); 4♦ → terminal/ej länkad (Kontrollbud; val och fortsättning inte färdig); 4NT → t43_n2 (RKC 1430 med hjärter som trumf; svaren efter 4NT byggs senare). Handprofil: ja.

## T04_INVIT_2NT_PASS — Sanginvit avslås – pass före 4NT

- Noder: 1
- Root: `t04_n0` (giltig)
- Villkor: Norr öppnar 1NT = 15–17 hp, balanserad hand. / Svarshanden har balanserad hand utan fyrkortshögfärg; normalt 8–9 hp, eller 10+ när parets sammanlagda honnörspoäng fortfarande är under 26. / 2NT är invit till 3NT.

- **t04_n0** — `1NT – Pass – 2NT`  
  2NT är en invit till 3NT. Normalt visar det 8–9 hp; även en balanserad hand med 10+ hp använder 2NT om paret ännu inte når 26 gemensamma honnörspoäng.  
  Grenar: Pass → terminal/ej länkad (Minimum – inviten avslås, slutbud 2NT); 3NT → terminal/ej länkad (Maximum – inviten accepteras). Handprofil: ja.

## T05_HJARTERFIT_PASS — Hjärterfit – stanna i 2♥

- Noder: 1
- Root: `t05_n0` (giltig)
- Villkor: Norr öppnar 1♥ med normal öppningsstyrka / Syd har tre- eller fyrkorts hjärterstöd och cirka 6–9 hp / Paret använder enkel höjning som begränsad svarshand

- **t05_n0** — `1♥ – Pass – 2♥`  
  2♥ visar stöd och en begränsad hand, normalt cirka 6–9 hp i detta förenklade system.  
  Grenar: Pass → terminal/ej länkad (Slutbud 2♥ – ingen utgångsinvit). Handprofil: saknas.

## T06_STAYMAN_INGEN_HOGFARG — Stayman – ingen högfärg hittas, sanginvit

- Noder: 3
- Root: `t06_n0` (giltig)
- Villkor: 1NT visar 15–17 hp och jämn fördelning / Paret spelar Stayman där 2♣ frågar efter fyrkortshögfärg / Svarshanden har invitstyrka och jämn hand utan egen femkortshögfärg

- **t06_n0** — `1NT – Pass – 2♣`  
  2♣ är Stayman och frågar efter fyrkortshögfärg.  
  Grenar: 2♦ → t06_n1 (Ingen fyrkortshögfärg); 2♥ → t24_stayman_hjarter_invit_n0 (Öppnaren visar 4+ hjärter); 2♠ → t25_stayman_spader_invit_n0 (Öppnaren visar 4+ spader utan 4+ hjärter). Handprofil: ja.
- **t06_n1** — `1NT – Pass – 2♣ – Pass – 2♦`  
  2♦ visar att öppnaren saknar fyrkortshögfärg.  
  Grenar: 2NT → t06_n2 (Balanserad invit till 3NT); 3NT → terminal/ej länkad (26+ gemensamma honnörspoäng – direkt utgång); 4NT → t43_n1 (Avtalad fyr-essfråga utan trumf). Handprofil: ja.
- **t06_n2** — `1NT – Pass – 2♣ – Pass – 2♦ – Pass – 2NT`  
  Öppnaren accepterar 2NT-inviten med 3NT endast om paret har minst 26 gemensamma honnörspoäng; annars pass.  
  Grenar: Pass → terminal/ej länkad (Minimum – inviten avslås, slutbud 2NT); 3NT → terminal/ej länkad (Maximum – inviten accepteras). Handprofil: ja.

## T07_OVERFORING_HJARTER — Överföring till hjärter – grundsekvens och fortsättningar

- Noder: 2
- Root: `t07_n0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♦ är överföring och visar minst fem hjärter; öppnaren fullföljer med 2♥ eller superaccepterar med 3♥ vid 17 hp och 4+ hjärter. / 0–8 hp: pass. 9 hp: 2NT med exakt fem hjärter eller 3♥ med 6+ hjärter som invit. / 10–15 hp: med exakt fem hjärter och jämn hand väljs 3NT vid 26+ gemensamma hp, annars 2NT-invit vid 22–25; med 6+ hjärter väljs 4♥ vid 26+ gemensamma spelpoäng, annars 3♥-invit vid 22–25. / 16+ hp: slamintresse; valet mellan kontrollbud och 4NT RKC är inte automatiserat.

- **t07_n0** — `1NT – Pass – 2♦`  
  2♦ är överföring till hjärter och visar minst fem hjärter. Öppnaren fullföljer normalt med 2♥; med 17 hp och minst fyra hjärter finns superaccept 3♥.  
  Grenar: 2♥ → t07_n1 (Normal fullföljd överföring); 3♥ → t27_superaccept (Superaccept: 17 hp och minst fyra hjärter). Handprofil: ja.
- **t07_n1** — `1NT – Pass – 2♦ – Pass – 2♥`  
  Öppnaren har fullföljt överföringen. Svarshanden väljer därefter pass, invit, utgång eller slamväg efter styrka och längd.  
  Grenar: Pass → terminal/ej länkad (0–8 hp – svagt slutbud); 2NT → t19_0 (9 hp exakt fem hjärter eller 10+ hp med 22–25 gemensamma hp – invit); 3♥ → t27_overforing_hjarter_sexkort_invit_n2 (9 hp med 6+ hjärter eller 10+ hp med 22–25 gemensamma spelpoäng – invit); 3NT → terminal/ej länkad (Exakt fem hjärter, jämn hand och 26+ gemensamma honnörspoäng); 4♥ → terminal/ej länkad (6+ hjärter, minst 8-kortsfit och 26+ gemensamma spelpoäng); 2♠ → terminal/ej länkad (6–9 hp, 5+ hjärter och 4+ spader – rondkrav; fortsättningen är inte färdig); 3♣ → terminal/ej länkad (10+ hp, 5+ hjärter och 4+ klöver – utgångskrav; fortsättningen inte färdig); 3♦ → terminal/ej länkad (10+ hp, 5+ hjärter och 4+ ruter – utgångskrav; fortsättningen inte färdig); 4♣ → terminal/ej länkad (Kontrollbud; val och fortsättning inte färdig); 4♦ → terminal/ej länkad (Kontrollbud; val och fortsättning inte färdig); 4NT → t43_n2 (RKC 1430 med hjärter som trumf; svaren efter 4NT byggs senare). Handprofil: ja.

## T08_OVERFORING_SPADER — Överföring till spader – grundsekvens och fortsättningar

- Noder: 2
- Root: `t08_n0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♥ är överföring och visar minst fem spader; öppnaren fullföljer med 2♠ eller superaccepterar med 3♠ vid 17 hp och 4+ spader. / 0–8 hp: pass. 9 hp: 2NT med exakt fem spader eller 3♠ med 6+ spader som invit. / 10–15 hp: med exakt fem spader och jämn hand väljs 3NT vid 26+ gemensamma hp, annars 2NT-invit vid 22–25; med 6+ spader väljs 4♠ vid 26+ gemensamma spelpoäng, annars 3♠-invit vid 22–25. / 16+ hp: slamintresse; valet mellan kontrollbud och 4NT RKC är inte automatiserat.

- **t08_n0** — `1NT – Pass – 2♥`  
  2♥ är överföring till spader och visar minst fem spader. Öppnaren fullföljer normalt med 2♠; med 17 hp och minst fyra spader finns superaccept 3♠.  
  Grenar: 2♠ → t08_n1 (Normal fullföljd överföring); 3♠ → t28_superaccept (Superaccept: 17 hp och minst fyra spader). Handprofil: ja.
- **t08_n1** — `1NT – Pass – 2♥ – Pass – 2♠`  
  Öppnaren har fullföljt överföringen. Svarshanden väljer därefter pass, invit, utgång eller slamväg efter styrka och längd.  
  Grenar: Pass → terminal/ej länkad (0–8 hp – svagt slutbud); 2NT → t20_0 (9 hp exakt fem spader eller 10+ hp med 22–25 gemensamma hp – invit); 3♠ → t28_overforing_spader_sexkort_invit_n2 (9 hp med 6+ spader eller 10+ hp med 22–25 gemensamma spelpoäng – invit); 3NT → terminal/ej länkad (Exakt fem spader, jämn hand och 26+ gemensamma honnörspoäng); 4♠ → terminal/ej länkad (6+ spader, minst 8-kortsfit och 26+ gemensamma spelpoäng); 3♥ → terminal/ej länkad (6–9 hp, 5-5 i högfärgerna – invit; fortsättningen inte färdig); 3♣ → terminal/ej länkad (10+ hp, 5+ spader och 4+ klöver – utgångskrav; fortsättningen inte färdig); 3♦ → terminal/ej länkad (10+ hp, 5+ spader och 4+ ruter – utgångskrav; fortsättningen inte färdig); 4♣ → terminal/ej länkad (Kontrollbud; val och fortsättning inte färdig); 4♦ → terminal/ej länkad (Kontrollbud; val och fortsättning inte färdig); 4NT → t43_n3 (RKC 1430 med spader som trumf; svaren efter 4NT byggs senare). Handprofil: ja.

## T09_1NT_DIREKT_3NT — Direkt 3NT – jämn hand med utgångsstyrka

- Noder: 1
- Root: `t09_n0` (giltig)
- Villkor: 1NT = 15–17 hp och balanserad hand. / Ingen fyrkortshögfärg som ska undersökas med Stayman och ingen femkortshögfärg som ska överföras. / Svarshanden har minst 26 gemensamma honnörspoäng tillsammans med öppnaren.

- **t09_n0** — `1NT – Pass – 3NT`  
  3NT är direkt slutbud först när paret har minst 26 gemensamma honnörspoäng och ingen högfärgsfit ska undersökas. Vid 22–25 och balanserad svarshand används 2NT som invit.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T10_1H_ENKEL_HOJNING — Enkel höjning av hjärter – begränsad hand med trumfstöd

- Noder: 2
- Root: `t10_n0` (giltig)
- Villkor: Öppnaren visar minst fem hjärter med 1♥ / Svarshanden har tre- eller fyrkorts hjärterstöd och cirka 6–9 hp / Enkel höjning är begränsad och inte invit i parets system

- **t10_n0** — `1♥ – Pass – 2♥`  
  2♥ visar hjärterstöd och en begränsad svarshand.  
  Grenar: Pass → terminal/ej länkad (Minimum – slutbud 2♥); 3♥ → t10_n1 (Endast om öppnaren har tillägg och systemet tillåter fortsatt invit). Handprofil: ja.
- **t10_n1** — `1♥ – Pass – 2♥ – Pass – 3♥`  
  Öppnaren visar tillägg efter den begränsade höjningen.  
  Grenar: Pass → terminal/ej länkad (Svarshanden avböjer – 3♥ blir slutbud); 4♥ → terminal/ej länkad (Svarshanden accepterar – utgång i 4♥). Handprofil: ja.

## T11_STAYMAN_HJARTERFIT_UTGANG — Stayman hittar hjärterfit – utgång

- Noder: 1
- Root: `t11_n0` (giltig)
- Villkor: 1NT = 15–17 hp, jämn fördelning. / 2♣ är Stayman; öppnarens svar visar minst fyra kort i hjärter. / Svarshanden har minst fyra kort i hjärter så att paret har minst åtta trumfkort. / 4M kräver minst 26 gemensamma spelpoäng; 22–25 är invit med 3M.

- **t11_n0** — `1NT – Pass – 2♣ – Pass – 2♥`  
  2♥ visar fyrkortshjärter hos öppnaren.  
  Grenar: 4♥ → terminal/ej länkad (Utgång i hjärter). Handprofil: ja.

## T12_STAYMAN_SPADERFIT_UTGANG — Stayman hittar spaderfit – utgång

- Noder: 1
- Root: `t12_n0` (giltig)
- Villkor: 1NT = 15–17 hp, jämn fördelning. / 2♣ är Stayman; öppnarens svar visar minst fyra kort i spader. / Svarshanden har minst fyra kort i spader så att paret har minst åtta trumfkort. / 4M kräver minst 26 gemensamma spelpoäng; 22–25 är invit med 3M.

- **t12_n0** — `1NT – Pass – 2♣ – Pass – 2♠`  
  2♠ visar fyrkortsspader hos öppnaren.  
  Grenar: 4♠ → terminal/ej länkad (Utgång i spader). Handprofil: ja.

## T13_STAYMAN_HJARTERINVIT — Stayman hittar hjärterfit – invit

- Noder: 2
- Root: `t13_n0` (giltig)
- Villkor: 1NT = 15–17 hp, jämn fördelning. / 2♣ är Stayman och 2♥ visar minst fyra hjärter hos öppnaren. / Svarshanden har minst fyra hjärter; paret har minst åtta trumfkort. / 3♥ är invit vid 22–25 gemensamma spelpoäng; 4♥ vid minst 26.

- **t13_n0** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 3♥`  
  3♥ är en invit till 4♥ med hjärterstöd.  
  Grenar: Pass → terminal/ej länkad (Minimum eller olämpliga värden – inviten avslås); 4♥ → t13_n1 (Maximum och bra trumfstöd – inviten accepteras). Handprofil: ja.
- **t13_n1** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 3♥ – Pass – 4♥`  
  4M – accepterar inviten när paret har minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T14_1H_3H_INVIT — Invithöjning till 3♥

- Noder: 2
- Root: `t14_n0` (giltig)
- Villkor: 1♥ visar minst fem hjärter och öppningsstyrka / 3♥ är invithöjning i parets system / Svarshanden har normalt 10–12 HTP och minst fyrkortsstöd / Öppnaren accepterar till 4♥ endast vid minst 26 gemensamma spelpoäng; annars pass.

- **t14_n0** — `1♥ – Pass – 3♥`  
  3♥ visar trumfstöd och invitstyrka.  
  Grenar: Pass → terminal/ej länkad (Minimum – inviten avslås, slutbud 3♥); 4♥ → t14_n1 (Tillägg – inviten accepteras). Handprofil: ja.
- **t14_n1** — `1♥ – Pass – 3♥ – Pass – 4♥`  
  Öppnaren accepterar inviten med tillägg.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T15_1S_2S_SVAG_HOJNING — Enkel spaderhöjning – svag hand

- Noder: 2
- Root: `t15_n0` (giltig)
- Villkor: 1♠ visar minst fem spader och öppningsstyrka / 2♠ är en begränsad enkel höjning / Svarshanden har normalt 6–9 hp och minst tre spader

- **t15_n0** — `1♠ – Pass – 2♠`  
  2♠ visar spaderstöd och en begränsad hand.  
  Grenar: Pass → terminal/ej länkad (Minimum – slutbud 2♠); 3♠ → t15_n1 (Med tydliga tillägg och enligt parets fortsättningsmetod). Handprofil: ja.
- **t15_n1** — `1♠ – Pass – 2♠ – Pass – 3♠`  
  Öppnaren inviterar till 4♠ med 3♠.  
  Grenar: Pass → terminal/ej länkad (Minimum – stanna i 3♠); 4♠ → terminal/ej länkad (Inviten accepteras – 4♠). Handprofil: ja.

## T16_1H_4H_SVAGT — Direkt 4♥ – svag hand med lång trumffit

- Noder: 1
- Root: `t16_n0` (giltig)
- Villkor: 1♥ visar minst fem hjärter och öppningsstyrka / Svarshanden har normalt femkortsstöd och svag hand / Paret använder direkt 4♥ som spärrande slutbud

- **t16_n0** — `1♥ – Pass – 4♥`  
  4♥ är ett spärrande slutbud med lång hjärterfit och begränsad styrka.  
  Grenar: Pass → terminal/ej länkad (Slutbud 4♥); 5♥ → terminal/ej länkad (Konkurrensbud endast om budläget och fördelningen motiverar det). Handprofil: ja.

## T17_1NT_2NT_INVIT_ACCEPT — Sanginvit accepteras – 3NT

- Noder: 1
- Root: `t17_n0` (giltig)
- Villkor: 1NT = 15–17 hp, jämn fördelning. / Svarshandens 2NT är en balanserad invit. / Öppnaren accepterar med 3NT endast om de gemensamma honnörspoängen når minst 26; annars pass.

- **t17_n0** — `1NT – Pass – 2NT – Pass – 3NT`  
  Öppnaren accepterar 2NT-inviten med 3NT endast om paret har minst 26 gemensamma honnörspoäng; annars passar öppnaren.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T18_1NT_3NT_DIREKT — Direkt utgång efter 1NT

- Noder: 1
- Root: `t18_n0` (giltig)
- Villkor: 1NT = 15–17 hp och balanserad hand. / Ingen fyrkortshögfärg som ska undersökas med Stayman och ingen femkortshögfärg som ska överföras. / Svarshanden har minst 26 gemensamma honnörspoäng tillsammans med öppnaren.

- **t18_n0** — `1NT – Pass – 3NT`  
  3NT är direkt slutbud först när paret har minst 26 gemensamma honnörspoäng och ingen högfärgsfit ska undersökas. Vid 22–25 och balanserad svarshand används 2NT som invit.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T19 — Överföring till hjärter – invit med femkortsfärg

- Noder: 4
- Root: `t19_0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♦ överför till hjärter; 2♥ fullföljer. / Svarshanden har exakt fem kort i hjärter och invitstyrka: normalt 9 hp eller 10+ när paret har 22–25 gemensamma honnörspoäng. / Efter 2NT: öppnaren bjuder 3NT vid minst 26 gemensamma honnörspoäng, 4M vid minst 8-kortsfit och 26 gemensamma spelpoäng, annars pass.

- **t19_0** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 2NT`  
  Öppnaren tar ställning till 2NT-inviten efter överföringen. 4H kräver minst åtta trumfkort och 26 gemensamma spelpoäng; 3NT kräver 26 gemensamma honnörspoäng utan 8-kortsfit; annars pass.  
  Grenar: 3NT → t19_2 (3NT – 26+ gemensamma hp, utan 8-kortsfit); 4H → t19_3 (4H – 8+ korts fit och 26+ gemensamma spelpoäng); Pass → t19_4 (Pass – paret når inte utgångsgränsen). Handprofil: ja.
- **t19_2** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 2NT – Pass – 3NT`  
  3NT – accepterar endast om paret har minst 26 gemensamma honnörspoäng och saknar 8-kortsfit.  
  Grenar: Pass → terminal/ej länkad (3NT blir slutbud). Handprofil: ja.
- **t19_3** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 2NT – Pass – 4♥`  
  4H – accepterar endast med minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: Pass → terminal/ej länkad (4♥ blir slutbud). Handprofil: ja.
- **t19_4** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 2NT – Pass – Pass`  
  Pass – inviten avslås när paret inte når 26-poängsgränsen.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T20 — Överföring till spader – invit med femkortsfärg

- Noder: 4
- Root: `t20_0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♥ överför till spader; 2♠ fullföljer. / Svarshanden har exakt fem kort i spader och invitstyrka: normalt 9 hp eller 10+ när paret har 22–25 gemensamma honnörspoäng. / Efter 2NT: öppnaren bjuder 3NT vid minst 26 gemensamma honnörspoäng, 4M vid minst 8-kortsfit och 26 gemensamma spelpoäng, annars pass.

- **t20_0** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 2NT`  
  Öppnaren tar ställning till 2NT-inviten efter överföringen. 4S kräver minst åtta trumfkort och 26 gemensamma spelpoäng; 3NT kräver 26 gemensamma honnörspoäng utan 8-kortsfit; annars pass.  
  Grenar: 3NT → t20_2 (3NT – 26+ gemensamma hp, utan 8-kortsfit); 4S → t20_3 (4S – 8+ korts fit och 26+ gemensamma spelpoäng); Pass → t20_4 (Pass – paret når inte utgångsgränsen). Handprofil: ja.
- **t20_2** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 2NT – Pass – 3NT`  
  3NT – accepterar endast om paret har minst 26 gemensamma honnörspoäng och saknar 8-kortsfit.  
  Grenar: Pass → terminal/ej länkad (3NT blir slutbud). Handprofil: ja.
- **t20_3** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 2NT – Pass – 4♠`  
  4S – accepterar endast med minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: Pass → terminal/ej länkad (4♠ blir slutbud). Handprofil: ja.
- **t20_4** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 2NT – Pass – Pass`  
  Pass – inviten avslås när paret inte når 26-poängsgränsen.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T21 — Färgprov efter 1♥–2♥ – hjärterfit

- Noder: 5
- Root: `t21_0` (giltig)
- Villkor: 1♥ visar minst fem hjärter / 2♥ är en begränsad höjning med normalt 6–9 hp och minst tre hjärter / 3♣/3♦/3♠ används som färgprov enligt parets överenskommelse / Svarshanden bedömer hjälp i provfärgen

- **t21_0** — `1♥ – Pass – 2♥`  
  Färgprov efter 1♥–2♥ – hjärterfit  
  Grenar: 3♣ → t21_1 (Färgprov i klöver); 3♦ → t21_2 (Färgprov i ruter); 3♠ → t21_3 (Färgprov i spader); 4♥ → t21_4 (Direkt utgång i hjärter). Handprofil: ja.
- **t21_1** — `1♥ – Pass – 2♥ – Pass – 3♣`  
  Färgprov i klöver  
  Grenar: 3♥ → terminal/ej länkad (Svarshanden avböjer färgprovet – stanna på 3♥); 4♥ → terminal/ej länkad (Svarshanden accepterar färgprovet – utgång). Handprofil: ja.
- **t21_2** — `1♥ – Pass – 2♥ – Pass – 3♦`  
  Färgprov i ruter  
  Grenar: 3♥ → terminal/ej länkad (Svarshanden avböjer färgprovet – stanna på 3♥); 4♥ → terminal/ej länkad (Svarshanden accepterar färgprovet – utgång). Handprofil: ja.
- **t21_3** — `1♥ – Pass – 2♥ – Pass – 3♠`  
  Färgprov i spader  
  Grenar: 3♥ → terminal/ej länkad (Svarshanden avböjer färgprovet – stanna på 3♥); 4♥ → terminal/ej länkad (Svarshanden accepterar färgprovet – utgång). Handprofil: ja.
- **t21_4** — `1♥ – Pass – 2♥ – Pass – 4♥`  
  Direkt utgång i hjärter  
  Grenar: inga utgående grenar. Handprofil: ja.

## T22 — Färgprov efter 1♠–2♠ – spaderfit

- Noder: 5
- Root: `t22_0` (giltig)
- Villkor: 1♠ visar minst fem spader / 2♠ är en begränsad höjning med normalt 6–9 hp och minst tre spader / 3♣/3♦/3♥ används som färgprov enligt parets överenskommelse / Svarshanden bedömer hjälp i provfärgen

- **t22_0** — `1♠ – Pass – 2♠`  
  Färgprov efter 1♠–2♠ – spaderfit  
  Grenar: 3♣ → t22_1 (Färgprov i klöver); 3♦ → t22_2 (Färgprov i ruter); 3♥ → t22_3 (Färgprov i hjärter); 4♠ → t22_4 (Direkt utgång i spader). Handprofil: ja.
- **t22_1** — `1♠ – Pass – 2♠ – Pass – 3♣`  
  Färgprov i klöver  
  Grenar: 3♠ → terminal/ej länkad (Svarshanden avböjer färgprovet – stanna på 3♠); 4♠ → terminal/ej länkad (Svarshanden accepterar färgprovet – utgång). Handprofil: ja.
- **t22_2** — `1♠ – Pass – 2♠ – Pass – 3♦`  
  Färgprov i ruter  
  Grenar: 3♠ → terminal/ej länkad (Svarshanden avböjer färgprovet – stanna på 3♠); 4♠ → terminal/ej länkad (Svarshanden accepterar färgprovet – utgång). Handprofil: ja.
- **t22_3** — `1♠ – Pass – 2♠ – Pass – 3♥`  
  Färgprov i hjärter  
  Grenar: 3♠ → terminal/ej länkad (Svarshanden avböjer färgprovet – stanna på 3♠); 4♠ → terminal/ej länkad (Svarshanden accepterar färgprovet – utgång). Handprofil: ja.
- **t22_4** — `1♠ – Pass – 2♠ – Pass – 4♠`  
  Direkt utgång i spader  
  Grenar: inga utgående grenar. Handprofil: ja.

## T23 — Stayman efter 2NT – undersök högfärgsfit

- Noder: 5
- Root: `t23_0` (giltig)
- Villkor: 2NT visar 20–21 hp och jämn fördelning / Paret spelar Stayman även efter 2NT; 3♣ frågar efter fyrkortshögfärg / Svarshanden har utgångsstyrka och fyrkortshögfärg eller jämn hand / Svarssätt efter 3♣ måste vara överenskommet

- **t23_0** — `2NT – Pass – 3♣`  
  Stayman efter 2NT – undersök högfärgsfit  
  Grenar: 3♦ → t23_1 (Ingen fyrkortshögfärg); 3♥ → t23_2 (Visar fyra hjärter); 3♠ → t23_3 (Visar fyra spader). Handprofil: ja.
- **t23_1** — `2NT – Pass – 3♣ – Pass – 3♦`  
  3♦ – ingen fyrkortshögfärg  
  Grenar: 3NT → t23_4 (Jämn hand – sangutgång). Handprofil: ja.
- **t23_2** — `2NT – Pass – 3♣ – Pass – 3♥`  
  3♥ – visar fyra hjärter  
  Grenar: 4♥ → terminal/ej länkad (Utgång med 4–4-fit); 3NT → terminal/ej länkad (Sang endast om svarshanden saknar hjärterstöd). Handprofil: ja.
- **t23_3** — `2NT – Pass – 3♣ – Pass – 3♠`  
  3♠ – visar fyra spader  
  Grenar: 4♠ → terminal/ej länkad (Utgång med 4–4-fit); 3NT → terminal/ej länkad (Sang endast om svarshanden saknar spaderstöd). Handprofil: ja.
- **t23_4** — `2NT – Pass – 3♣ – Pass – 3♦ – Pass – 3NT`  
  Svarshanden avslutar i 3NT efter att öppnaren förnekat fyrkortshögfärg.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T24_STAYMAN_HJARTER_INVIT — Stayman hittar hjärterfit – invit till 4♥

- Noder: 7
- Root: `t24_stayman_hjarter_invit_n0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♣ är Stayman; öppnarens 2♥ visar minst fyra kort i hjärter. / Svarshanden har minst fyra kort i hjärter och paret minst åtta trumfkort. / 3M är invit vid 22–25 gemensamma spelpoäng; 4M är utgång vid minst 26.

- **t24_stayman_hjarter_invit_n0** — `1NT – Pass – 2♣ – Pass – 2♥`  
  Öppnaren visar fyrkortsfärg i hjärter efter Stayman.  
  Grenar: Pass → t24_stayman_hjarter_invit_n1 (Motståndaren passar). Handprofil: ja.
- **t24_stayman_hjarter_invit_n1** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass`  
  4M – accepterar inviten när paret har minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: 3♥ → t24_stayman_hjarter_invit_n2 (Invit med fyrkortsstöd); 4♥ → t24_stayman_hjarter_invit_n6 (Direkt utgång med utgångsstyrka). Handprofil: ja.
- **t24_stayman_hjarter_invit_n2** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 3♥`  
  Svarshanden inviterar till 4♥.  
  Grenar: Pass → t24_stayman_hjarter_invit_n3 (Motståndaren passar). Handprofil: ja.
- **t24_stayman_hjarter_invit_n3** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 3♥ – Pass`  
  Öppnaren ska nu ta ställning till inviten.  
  Grenar: Pass → t24_stayman_hjarter_invit_n4 (Avslår inviten); 4♥ → t24_stayman_hjarter_invit_n5 (Accepterar inviten). Handprofil: ja.
- **t24_stayman_hjarter_invit_n4** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 3♥ – Pass – Pass`  
  3M blir slutbud när paret inte når 26 gemensamma spelpoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t24_stayman_hjarter_invit_n5** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 3♥ – Pass – 4♥`  
  4M – accepterar inviten när paret har minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t24_stayman_hjarter_invit_n6** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 4♥`  
  Svarshanden går direkt till 4♥.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T25_STAYMAN_SPADER_INVIT — Stayman hittar spaderfit – invit till 4♠

- Noder: 7
- Root: `t25_stayman_spader_invit_n0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♣ är Stayman; öppnarens 2♠ visar minst fyra kort i spader. / Svarshanden har minst fyra kort i spader och paret minst åtta trumfkort. / 3M är invit vid 22–25 gemensamma spelpoäng; 4M är utgång vid minst 26.

- **t25_stayman_spader_invit_n0** — `1NT – Pass – 2♣ – Pass – 2♠`  
  Öppnaren visar fyrkortsfärg i spader efter Stayman.  
  Grenar: Pass → t25_stayman_spader_invit_n1 (Motståndaren passar). Handprofil: ja.
- **t25_stayman_spader_invit_n1** — `1NT – Pass – 2♣ – Pass – 2♠ – Pass`  
  4M – accepterar inviten när paret har minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: 3♠ → t25_stayman_spader_invit_n2 (Invit med fyrkortsstöd); 4♠ → t25_stayman_spader_invit_n6 (Direkt utgång med utgångsstyrka). Handprofil: ja.
- **t25_stayman_spader_invit_n2** — `1NT – Pass – 2♣ – Pass – 2♠ – Pass – 3♠`  
  Svarshanden inviterar till 4♠.  
  Grenar: Pass → t25_stayman_spader_invit_n3 (Motståndaren passar). Handprofil: ja.
- **t25_stayman_spader_invit_n3** — `1NT – Pass – 2♣ – Pass – 2♠ – Pass – 3♠ – Pass`  
  Öppnaren ska nu ta ställning till inviten.  
  Grenar: Pass → t25_stayman_spader_invit_n4 (Avslår inviten); 4♠ → t25_stayman_spader_invit_n5 (Accepterar inviten). Handprofil: ja.
- **t25_stayman_spader_invit_n4** — `1NT – Pass – 2♣ – Pass – 2♠ – Pass – 3♠ – Pass – Pass`  
  3M blir slutbud när paret inte når 26 gemensamma spelpoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t25_stayman_spader_invit_n5** — `1NT – Pass – 2♣ – Pass – 2♠ – Pass – 3♠ – Pass – 4♠`  
  4M – accepterar inviten när paret har minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t25_stayman_spader_invit_n6** — `1NT – Pass – 2♣ – Pass – 2♠ – Pass – 4♠`  
  Svarshanden går direkt till 4♠.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T26_STAYMAN_INGEN_HOGFARG_INVIT — Stayman – ingen högfärg, sanginvit

- Noder: 7
- Root: `t26_n0` (giltig)
- Villkor: 1NT = 15–17 hp, jämn fördelning. / 2♣ är Stayman; 2♦ förnekar fyrkortshögfärg. / Balanserad svarshand: 2NT invit vid 22–25 gemensamma honnörspoäng; 3NT vid minst 26. / 4NT i sekvensen 1NT–2♣–2♦ är avtalad fyr-essfråga utan trumf.

- **t26_n0** — `1NT – Pass – 2♣ – Pass – 2♦`  
  Öppnaren förnekar fyrkortshögfärg.  
  Grenar: Pass → t26_n1 (Motståndaren passar). Handprofil: ja.
- **t26_n1** — `1NT – Pass – 2♣ – Pass – 2♦ – Pass`  
  Svarshanden väljer nivå efter styrka och handtyp: 2NT med balanserad invitstyrka och 22–25 gemensamma honnörspoäng, 3NT med minst 26 gemensamma honnörspoäng eller 4NT som uttryckligen avtalad fyr-essfråga utan trumf.  
  Grenar: 2NT → t26_n2 (Invit med cirka 8–9 hp); 3NT → t26_n5 (Direkt utgång); 4NT → t43_n1 (Avtalad fyr-essfråga utan trumf). Handprofil: ja.
- **t26_n2** — `1NT – Pass – 2♣ – Pass – 2♦ – Pass – 2NT`  
  Svarshanden inviterar till 3NT.  
  Grenar: Pass → t26_n3 (Motståndaren passar). Handprofil: ja.
- **t26_n3** — `1NT – Pass – 2♣ – Pass – 2♦ – Pass – 2NT – Pass`  
  Öppnaren accepterar 2NT-inviten med 3NT endast om paret har minst 26 gemensamma honnörspoäng; annars pass.  
  Grenar: Pass → t26_n4 (Avslår inviten); 3NT → t26_n6 (Accepterar inviten). Handprofil: ja.
- **t26_n4** — `1NT – Pass – 2♣ – Pass – 2♦ – Pass – 2NT – Pass – Pass`  
  2NT blir slutbud när paret inte når 26 gemensamma honnörspoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t26_n5** — `1NT – Pass – 2♣ – Pass – 2♦ – Pass – 3NT`  
  Svarshanden går direkt till 3NT.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t26_n6** — `1NT – Pass – 2♣ – Pass – 2♦ – Pass – 2NT – Pass – 3NT`  
  Öppnaren accepterar inviten med 3NT.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T27_OVERFORING_HJARTER_SEXKORT_INVIT — Överföring till hjärter – sexkortsfärg och invit

- Noder: 9
- Root: `t27_overforing_hjarter_sexkort_invit_n0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♦ överför till hjärter; 2♥ fullföljer. / Svarshanden har minst sex kort i hjärter och invitstyrka: normalt 9 hp eller 10+ när parets gemensamma spelpoäng är 22–25. / Efter 3M-inviten: öppnaren bjuder 4M vid minst 8-kortsfit och 26 gemensamma spelpoäng, 3NT vid 26 gemensamma honnörspoäng utan 8-kortsfit, annars pass.

- **t27_overforing_hjarter_sexkort_invit_n0** — `1NT – Pass – 2♦ – Pass – 2♥`  
  Öppnaren fullföljer överföringen.  
  Grenar: Pass → t27_overforing_hjarter_sexkort_invit_n1 (Motståndaren passar). Handprofil: ja.
- **t27_overforing_hjarter_sexkort_invit_n1** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass`  
  Svarshanden väljer nivå efter styrkan.  
  Grenar: 3♥ → t27_overforing_hjarter_sexkort_invit_n2 (Invit med sexkortsfärg); 4♥ → t27_overforing_hjarter_sexkort_invit_n6 (Direkt utgång). Handprofil: ja.
- **t27_overforing_hjarter_sexkort_invit_n2** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 3♥`  
  Svarshanden inviterar till utgång i hjärter.  
  Grenar: Pass → t27_overforing_hjarter_sexkort_invit_n3 (Motståndaren passar). Handprofil: ja.
- **t27_overforing_hjarter_sexkort_invit_n3** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 3♥ – Pass`  
  Öppnaren accepterar endast om paret når 26 gemensamma poäng: 4H vid 8+ trumfkort och 26 spelpoäng; 3NT vid 26 honnörspoäng utan 8-kortsfit; annars pass.  
  Grenar: Pass → t27_overforing_hjarter_sexkort_invit_n4 (Avslår inviten); 3NT → t27_overforing_hjarter_sexkort_invit_n5 (Accepterar utan trumfstöd); 4♥ → t27_overforing_hjarter_sexkort_invit_n7 (Accepterar med trumfstöd). Handprofil: ja.
- **t27_overforing_hjarter_sexkort_invit_n4** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 3♥ – Pass – Pass`  
  3H blir slutbud när utgångsgränsen inte nås.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t27_overforing_hjarter_sexkort_invit_n5** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 3♥ – Pass – 3NT`  
  Öppnaren accepterar med 3NT endast om paret har minst 26 gemensamma honnörspoäng och färre än tre kort i trumffärgen.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t27_overforing_hjarter_sexkort_invit_n6** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 4♥`  
  Svarshanden går direkt till 4♥.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t27_overforing_hjarter_sexkort_invit_n7** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 3♥ – Pass – 4♥`  
  Öppnaren accepterar med 4H endast om paret har minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t27_superaccept** — `1NT – Pass – 2♦ – Pass – 3♥`  
  Superaccept av hjärteröverföring  
  Grenar: inga utgående grenar. Handprofil: ja.

## T28_OVERFORING_SPADER_SEXKORT_INVIT — Överföring till spader – sexkortsfärg och invit

- Noder: 9
- Root: `t28_overforing_spader_sexkort_invit_n0` (giltig)
- Villkor: 1NT = 15–17 hp och jämn fördelning. / 2♥ överför till spader; 2♠ fullföljer. / Svarshanden har minst sex kort i spader och invitstyrka: normalt 9 hp eller 10+ när parets gemensamma spelpoäng är 22–25. / Efter 3M-inviten: öppnaren bjuder 4M vid minst 8-kortsfit och 26 gemensamma spelpoäng, 3NT vid 26 gemensamma honnörspoäng utan 8-kortsfit, annars pass.

- **t28_overforing_spader_sexkort_invit_n0** — `1NT – Pass – 2♥ – Pass – 2♠`  
  Öppnaren fullföljer överföringen.  
  Grenar: Pass → t28_overforing_spader_sexkort_invit_n1 (Motståndaren passar). Handprofil: ja.
- **t28_overforing_spader_sexkort_invit_n1** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass`  
  Svarshanden väljer nivå efter styrkan.  
  Grenar: 3♠ → t28_overforing_spader_sexkort_invit_n2 (Invit med sexkortsfärg); 4♠ → t28_overforing_spader_sexkort_invit_n6 (Direkt utgång). Handprofil: ja.
- **t28_overforing_spader_sexkort_invit_n2** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 3♠`  
  Svarshanden inviterar till utgång i spader.  
  Grenar: Pass → t28_overforing_spader_sexkort_invit_n3 (Motståndaren passar). Handprofil: ja.
- **t28_overforing_spader_sexkort_invit_n3** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 3♠ – Pass`  
  Öppnaren accepterar endast om paret når 26 gemensamma poäng: 4S vid 8+ trumfkort och 26 spelpoäng; 3NT vid 26 honnörspoäng utan 8-kortsfit; annars pass.  
  Grenar: Pass → t28_overforing_spader_sexkort_invit_n4 (Avslår inviten); 3NT → t28_overforing_spader_sexkort_invit_n5 (Accepterar utan trumfstöd); 4♠ → t28_overforing_spader_sexkort_invit_n7 (Accepterar med trumfstöd). Handprofil: ja.
- **t28_overforing_spader_sexkort_invit_n4** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 3♠ – Pass – Pass`  
  3S blir slutbud när utgångsgränsen inte nås.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t28_overforing_spader_sexkort_invit_n5** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 3♠ – Pass – 3NT`  
  Öppnaren accepterar med 3NT endast om paret har minst 26 gemensamma honnörspoäng och färre än tre kort i trumffärgen.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t28_overforing_spader_sexkort_invit_n6** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 4♠`  
  Svarshanden går direkt till 4♠.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t28_overforing_spader_sexkort_invit_n7** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 3♠ – Pass – 4♠`  
  Öppnaren accepterar med 4S endast om paret har minst åtta trumfkort och 26 gemensamma spelpoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t28_superaccept** — `1NT – Pass – 2♥ – Pass – 3♠`  
  Superaccept av spaderöverföring  
  Grenar: inga utgående grenar. Handprofil: ja.

## T34_STENBERG_2NT — Stenberg 2NT – öppnarens återbud

- Noder: 12
- Root: `t34_h_n0` (giltig)
- Villkor: Svarshanden har 13+ HTP och minst fyra korts stöd i öppningsfärgen. / 2NT är Stenberg och utgångskrav. / Öppnarens återbud styrs av HTP, balans och singleton i sidofärg. / Void räknas inte som singleton; flera singletonfärger utan prioritet lämnas utan automatisk rekommendation.

- **t34_h_n0** — `1♥ – Pass – 2NT – Pass`  
  Öppnaren beskriver sin hand efter Stenberg 2NT.  
  Grenar: 3♣ → t34_h_c (Exakt en singleton i klöver); 3♦ → t34_h_d (Exakt en singleton i ruter); 3♠ → t34_h_s (Exakt en singleton i spader); 3♥ → t34_h_3h (15+ HTP utan singleton); 3NT → t34_h_3nt (12–14 hp, balanserad utan singleton). Handprofil: ja.
- **t34_h_c** — `1♥ – Pass – 2NT – Pass – 3♣`  
  3♣ visar exakt en singleton i klöver.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_h_d** — `1♥ – Pass – 2NT – Pass – 3♦`  
  3♦ visar exakt en singleton i ruter.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_h_s** — `1♥ – Pass – 2NT – Pass – 3♠`  
  3♠ visar exakt en singleton i spader.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_h_3h** — `1♥ – Pass – 2NT – Pass – 3♥`  
  3♥ visar 15+ HTP utan singleton.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_h_3nt** — `1♥ – Pass – 2NT – Pass – 3NT`  
  3NT visar 12–14 hp och balanserad hand utan singleton.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_s_n0** — `1♠ – Pass – 2NT – Pass`  
  Öppnaren beskriver sin hand efter Stenberg 2NT.  
  Grenar: 3♣ → t34_s_c (Exakt en singleton i klöver); 3♦ → t34_s_d (Exakt en singleton i ruter); 3♥ → t34_s_h (Exakt en singleton i hjärter); 3♠ → t34_s_3s (15+ HTP utan singleton); 3NT → t34_s_3nt (12–14 hp, balanserad utan singleton). Handprofil: ja.
- **t34_s_c** — `1♠ – Pass – 2NT – Pass – 3♣`  
  3♣ visar exakt en singleton i klöver.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_s_d** — `1♠ – Pass – 2NT – Pass – 3♦`  
  3♦ visar exakt en singleton i ruter.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_s_h** — `1♠ – Pass – 2NT – Pass – 3♥`  
  3♥ visar exakt en singleton i hjärter.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_s_3s** — `1♠ – Pass – 2NT – Pass – 3♠`  
  3♠ visar 15+ HTP utan singleton.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t34_s_3nt** — `1♠ – Pass – 2NT – Pass – 3NT`  
  3NT visar 12–14 hp och balanserad hand utan singleton.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T35_OPENER_REBID_AFTER_1M_2M — Öppnarens återbud efter 1M–2M

- Noder: 14
- Root: `t35_h_n0` (giltig)
- Villkor: Svarshanden har minst fyra korts stöd och 6–12 HTP efter öppning 1♥ eller 1♠. / 17–19 HTP: singleton visas på 3-nivån; utan singleton bjuds 3M. / 20+ HTP: 4M. Högst 16 HTP: pass. / Void räknas inte som singleton; flera singletonfärger utan prioritet lämnas ej täckta.

- **t35_h_n0** — `1♥ – Pass – 2♥ – Pass`  
  Öppnaren väljer återbud efter den begränsade hjärterhöjningen.  
  Grenar: 3♣ → t35_h_c (17–19 HTP och exakt en singleton i klöver); 3♦ → t35_h_d (17–19 HTP och exakt en singleton i ruter); 3♠ → t35_h_s (17–19 HTP och exakt en singleton i spader); 3♥ → t35_h_3h (17–19 HTP utan singleton); 4♥ → t35_h_4h (20+ HTP – utgång); Pass → t35_h_p (Högst 16 HTP – pass). Handprofil: ja.
- **t35_h_c** — `1♥ – Pass – 2♥ – Pass – 3♣`  
  3♣ visar exakt en singleton i klöver.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_h_d** — `1♥ – Pass – 2♥ – Pass – 3♦`  
  3♦ visar exakt en singleton i ruter.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_h_s** — `1♥ – Pass – 2♥ – Pass – 3♠`  
  3♠ visar exakt en singleton i spader.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_h_3h** — `1♥ – Pass – 2♥ – Pass – 3♥`  
  3♥ visar 17–19 HTP utan singleton.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_h_4h** — `1♥ – Pass – 2♥ – Pass – 4♥`  
  4♥ visar 20+ HTP och går direkt till utgång.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_h_p** — `1♥ – Pass – 2♥ – Pass – Pass`  
  Pass visar högst 16 HTP.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_s_n0** — `1♠ – Pass – 2♠ – Pass`  
  Öppnaren väljer återbud efter den begränsade spaderhöjningen.  
  Grenar: 3♣ → t35_s_c (17–19 HTP och exakt en singleton i klöver); 3♦ → t35_s_d (17–19 HTP och exakt en singleton i ruter); 3♥ → t35_s_h (17–19 HTP och exakt en singleton i hjärter); 3♠ → t35_s_3s (17–19 HTP utan singleton); 4♠ → t35_s_4s (20+ HTP – utgång); Pass → t35_s_p (Högst 16 HTP – pass). Handprofil: ja.
- **t35_s_c** — `1♠ – Pass – 2♠ – Pass – 3♣`  
  3♣ visar exakt en singleton i klöver.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_s_d** — `1♠ – Pass – 2♠ – Pass – 3♦`  
  3♦ visar exakt en singleton i ruter.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_s_h** — `1♠ – Pass – 2♠ – Pass – 3♥`  
  3♥ visar exakt en singleton i hjärter.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_s_3s** — `1♠ – Pass – 2♠ – Pass – 3♠`  
  3♠ visar 17–19 HTP utan singleton.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_s_4s** — `1♠ – Pass – 2♠ – Pass – 4♠`  
  4♠ visar 20+ HTP och går direkt till utgång.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t35_s_p** — `1♠ – Pass – 2♠ – Pass – Pass`  
  Pass visar högst 16 HTP.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T36_OPPNING_HANDPROFILER — Ostörd budgivning – detaljerade handprofiler för öppning 1 i färg

- Noder: 4
- Root: `t36_1c` (giltig)
- Villkor: Ostörd budgivning. / Öppningsreglerna i rattningsmotorn är oförändrade. / Fyrkortsfärger prioriteras H > S > C > D; femkortsfärger 5-5 prioriteras S > H > D > C.

- **t36_1c** — `1♣`  
  Öppning 1♣ – handprofil  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t36_1d** — `1♦`  
  Öppning 1♦ – handprofil  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t36_1h** — `1♥`  
  Öppning 1♥ – handprofil  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t36_1s** — `1♠`  
  Öppning 1♠ – handprofil  
  Grenar: inga utgående grenar. Handprofil: ja.

## T37_SVAR_1_I_FARG_HANDPROFILER — Ostörd budgivning – svarshandens fördelnings- och styrkeprofiler efter 1 i färg

- Noder: 18
- Root: `t37_1c1d` (giltig)
- Villkor: Ostörd budgivning. / Profilerna återger befintliga regler i resp1(); inga nya budöverenskommelser skapas. / Skilj mellan HP och HTP när trumfstöd finns.

- **t37_1c1d** — `1♣ – Pass – 1♦`  
  1♦ efter 1♣  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1c1h** — `1♣ – Pass – 1♥`  
  1♥ efter 1♣  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1c1s** — `1♣ – Pass – 1♠`  
  1♠ efter 1♣  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1d1h** — `1♦ – Pass – 1♥`  
  1♥ efter 1♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1d1s** — `1♦ – Pass – 1♠`  
  1♠ efter 1♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1h1s** — `1♥ – Pass – 1♠`  
  1♠ efter 1♥  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1c1nt** — `1♣ – Pass – 1NT`  
  1NT efter 1♣  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1d1nt** — `1♦ – Pass – 1NT`  
  1NT efter 1♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1h1nt** — `1♥ – Pass – 1NT`  
  1NT efter 1♥  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1s1nt** — `1♠ – Pass – 1NT`  
  1NT efter 1♠  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1d2c** — `1♦ – Pass – 2♣`  
  2♣ efter 1♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1d2h** — `1♦ – Pass – 2♥`  
  2♥ efter 1♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1d2s** — `1♦ – Pass – 2♠`  
  2♠ efter 1♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1h2c** — `1♥ – Pass – 2♣`  
  2♣ efter 1♥  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1h2d** — `1♥ – Pass – 2♦`  
  2♦ efter 1♥  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1s2c** — `1♠ – Pass – 2♣`  
  2♣ efter 1♠  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1s2d** — `1♠ – Pass – 2♦`  
  2♦ efter 1♠  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t37_1s2h** — `1♠ – Pass – 2♥`  
  2♥ efter 1♠  
  Grenar: inga utgående grenar. Handprofil: ja.

## T38_FJARDE_FARG_4441 — Ostörd budgivning – 4-4-4-1-händer och fjärde färg

- Noder: 1
- Root: `t38_0` (giltig)
- Villkor: Endast ostörd budgivning. / Fjärde färg är artificiell och utgångskrav enligt den dokumenterade 13+ hp-regeln. / En fyrkortsfärg får inte ensam göra fjärde-färgsbudet naturligt.

- **t38_0** — `1♦ – Pass – 1♠ – Pass – 2♣ – Pass – 3♥`  
  3♥ efter 1♦–1♠–2♣ – fjärde färg, inte naturlig hjärter  
  Grenar: inga utgående grenar. Handprofil: ja.

## T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1 — Ostörd budgivning – öppnarens återbud efter 1 över 1

- Noder: 37
- Root: `t39_1c1d_1nt` (giltig)
- Villkor: Ostörd budgivning efter öppning 1 i färg och svar 1 över 1. / Återbuden återger reb1() i rattningsmotorn; de ändrar inte grundsystemet. / HP, HTP, STP och HPS hålls isär. Använd den värdering som respektive regel uttryckligen kräver. / Reverse kräver 18+ HPS och minst 5-4; vanligt andra färgbud på lägsta nivå visar 12-17 hp och 5-4. / Balanserad hand avser motorns definition (4333, 4432 eller 5332); 4-4-4-1 är obalanserad.

- **t39_1c1d_1nt** — `1♣ – Pass – 1♦ – Pass – 1NT`  
  1NT efter 1♣–1♦ – balanserat minimumåterbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1d_2nt** — `1♣ – Pass – 1♦ – Pass – 2NT`  
  2NT efter 1♣–1♦ – starkt balanserat återbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1d_own** — `1♣ – Pass – 1♦ – Pass – 2♣`  
  2♣ efter 1♣–1♦ – återbud i egen färg  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1d_support** — `1♣ – Pass – 1♦ – Pass – 2♦`  
  2♦ efter 1♣–1♦ – stöd i svarsfärgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1d_second_0** — `1♣ – Pass – 1♦ – Pass – 1♥`  
  1♥ efter 1♣–1♦ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1d_second_1** — `1♣ – Pass – 1♦ – Pass – 1♠`  
  1♠ efter 1♣–1♦ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1h_1nt** — `1♣ – Pass – 1♥ – Pass – 1NT`  
  1NT efter 1♣–1♥ – balanserat minimumåterbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1h_2nt** — `1♣ – Pass – 1♥ – Pass – 2NT`  
  2NT efter 1♣–1♥ – starkt balanserat återbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1h_own** — `1♣ – Pass – 1♥ – Pass – 2♣`  
  2♣ efter 1♣–1♥ – återbud i egen färg  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1h_support** — `1♣ – Pass – 1♥ – Pass – 2♥`  
  2♥ efter 1♣–1♥ – stöd i svarsfärgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1h_second_0** — `1♣ – Pass – 1♥ – Pass – 1♠`  
  1♠ efter 1♣–1♥ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1s_1nt** — `1♣ – Pass – 1♠ – Pass – 1NT`  
  1NT efter 1♣–1♠ – balanserat minimumåterbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1s_2nt** — `1♣ – Pass – 1♠ – Pass – 2NT`  
  2NT efter 1♣–1♠ – starkt balanserat återbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1s_own** — `1♣ – Pass – 1♠ – Pass – 2♣`  
  2♣ efter 1♣–1♠ – återbud i egen färg  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1s_support** — `1♣ – Pass – 1♠ – Pass – 2♠`  
  2♠ efter 1♣–1♠ – stöd i svarsfärgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1s_second_0** — `1♣ – Pass – 1♠ – Pass – 2♦`  
  2♦ efter 1♣–1♠ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1c1s_second_1** — `1♣ – Pass – 1♠ – Pass – 2♥`  
  2♥ efter 1♣–1♠ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1h_1nt** — `1♦ – Pass – 1♥ – Pass – 1NT`  
  1NT efter 1♦–1♥ – balanserat minimumåterbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1h_2nt** — `1♦ – Pass – 1♥ – Pass – 2NT`  
  2NT efter 1♦–1♥ – starkt balanserat återbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1h_own** — `1♦ – Pass – 1♥ – Pass – 2♦`  
  2♦ efter 1♦–1♥ – återbud i egen färg  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1h_support** — `1♦ – Pass – 1♥ – Pass – 2♥`  
  2♥ efter 1♦–1♥ – stöd i svarsfärgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1h_second_0** — `1♦ – Pass – 1♥ – Pass – 1♠`  
  1♠ efter 1♦–1♥ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1s_1nt** — `1♦ – Pass – 1♠ – Pass – 1NT`  
  1NT efter 1♦–1♠ – balanserat minimumåterbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1s_2nt** — `1♦ – Pass – 1♠ – Pass – 2NT`  
  2NT efter 1♦–1♠ – starkt balanserat återbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1s_own** — `1♦ – Pass – 1♠ – Pass – 2♦`  
  2♦ efter 1♦–1♠ – återbud i egen färg  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1s_support** — `1♦ – Pass – 1♠ – Pass – 2♠`  
  2♠ efter 1♦–1♠ – stöd i svarsfärgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1s_second_0** — `1♦ – Pass – 1♠ – Pass – 2♣`  
  2♣ efter 1♦–1♠ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1d1s_second_1** — `1♦ – Pass – 1♠ – Pass – 2♥`  
  2♥ efter 1♦–1♠ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1h1s_1nt** — `1♥ – Pass – 1♠ – Pass – 1NT`  
  1NT efter 1♥–1♠ – balanserad öppnare eller specialfall 4-4-4-1  
  Grenar: 2♣ → terminal/ej länkad (12–17 hp, om klöver är den andra fyrkortsfärgen och lägsta möjliga bud); 2♦ → terminal/ej länkad (12–17 hp, om ruter är den andra fyrkortsfärgen och lägsta möjliga bud); Pass → terminal/ej länkad (12–17 hp – tillåtet alternativ, stanna i 1NT); 2NT → terminal/ej länkad (18–19 hp). Handprofil: ja.
- **t39_1h1s_2nt** — `1♥ – Pass – 1♠ – Pass – 2NT`  
  2NT efter 1♥–1♠ – starkt balanserat återbud  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1h1s_own** — `1♥ – Pass – 1♠ – Pass – 2♥`  
  2♥ efter 1♥–1♠ – återbud i egen färg  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1h1s_support** — `1♥ – Pass – 1♠ – Pass – 2♠`  
  2♠ efter 1♥–1♠ – stöd i svarsfärgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1h1s_second_0** — `1♥ – Pass – 1♠ – Pass – 2♣`  
  2♣ efter 1♥–1♠ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_1h1s_second_1** — `1♥ – Pass – 1♠ – Pass – 2♦`  
  2♦ efter 1♥–1♠ – andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_reverse_strong_jump** — `1♣ – Pass – 1♦ – Pass – 2♥`  
  2♥ efter 1♣–1♦ – hopp i andra färgen  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_splinter** — `1♥ – Pass – 1♠ – Pass – 3♦`  
  3♦ efter 1♥–1♠ – splinter med spaderstöd  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t39_4441_after_1nt** — `1♥ – Pass – 1NT – Pass`  
  4-4-4-1 efter partnerns 1NT – specialåterbud  
  Grenar: 2♣ → terminal/ej länkad (12–17 hp – om klöver är den lägsta möjliga andra fyrkortsfärgen); 2♦ → terminal/ej länkad (12–17 hp – om ruter är den lägsta möjliga andra fyrkortsfärgen); Pass → terminal/ej länkad (12–17 hp – tillåtet att stanna i 1NT); 2NT → terminal/ej länkad (18–19 hp). Handprofil: ja.

## T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD — Ostörd budgivning – svarshandens andra bud efter öppnarens återbud

- Noder: 6
- Root: `Svarshanden väger samman öppnarens återbud, egen fördelning och styrka. Vid fastställd färgfit används gemensamma spelpoäng; i sang används honnörspoäng.` (ROOT-FEL: värdet matchar inget nod-ID)
- Villkor: Budgivningen är ostörd. / Öppnaren har gjort sitt andra bud efter svarshandens första svar. / Beskrivningarna följer nuvarande rättningsmotor; luckor markeras uttryckligen.

- **t40_support_raise** — `1♥ – Pass – 1♠ – Pass – 2♠`  
  Öppnaren höjer svarshandens högfärg – svarshandens andra bud  
  Grenar: 4♠ → terminal/ej länkad (8+ korts spaderfit och minst 26 gemensamma spelpoäng); 3♠ → terminal/ej länkad (8+ korts spaderfit och 22–25 gemensamma spelpoäng – invit); Pass → terminal/ej länkad (8+ korts spaderfit men under 22 gemensamma spelpoäng). Handprofil: ja.
- **t40_balanced_rebid** — `1♥ – Pass – 1♠ – Pass – 1NT`  
  Öppnaren återbjuder 1NT – svarshandens andra bud  
  Grenar: 4♥/4♠ → terminal/ej länkad (Minst 8-korts högfärgsfit och 26+ gemensamma spelpoäng); 3♥/3♠ → terminal/ej länkad (Minst 8-korts högfärgsfit och 22–25 gemensamma spelpoäng – invit); 3NT → terminal/ej länkad (Ingen tillräcklig högfärgsfit och 26+ gemensamma hp); 2NT → terminal/ej länkad (Ingen tillräcklig högfärgsfit och 22–25 gemensamma hp – invit); Pass → terminal/ej länkad (Under invitnivån). Handprofil: ja.
- **t40_own_suit_rebid** — `1♥ – Pass – 1♠ – Pass – 2♥`  
  Öppnaren återbjuder sin egen färg – svarshandens andra bud  
  Grenar: 4♥ → terminal/ej länkad (Minst 8-korts hjärterfit och 26+ gemensamma spelpoäng); 3♥ → terminal/ej länkad (Minst 8-korts hjärterfit och 22–25 gemensamma spelpoäng – invit); 3NT → terminal/ej länkad (Ingen fit och 26+ gemensamma hp); 2NT → terminal/ej länkad (Ingen fit och 22–25 gemensamma hp – invit); Pass → terminal/ej länkad (Under invitnivån). Handprofil: ja.
- **t40_two_suit_rebid** — `1♣ – Pass – 1♦ – Pass – 1♥`  
  Öppnaren visar två färger – svarshandens andra bud  
  Grenar: 2♣/2♥ → terminal/ej länkad (Högst 9 hp: preferens till bästa gemensamma färg, om minst två kort finns där); 2NT → terminal/ej länkad (10–12 hp och balanserad hand – invit); 1♠ → terminal/ej länkad (13+ hp: fjärde färg på lägsta nivå – utgångskrav i sekvensen 1♣–1♦–1♥); 3NT → terminal/ej länkad (13+ hp när fjärde färg saknas och preferens inte kan väljas). Handprofil: ja.
- **t40_4441_special** — `1♥ – Pass – 1NT – Pass – 2♦`  
  4-4-4-1-öppnaren visar andra fyrkortsfärg – svarshandens andra bud  
  Grenar: 2♥/2♦ → terminal/ej länkad (Högst 9 hp: preferens till en av öppnarens två färger); 2NT → terminal/ej länkad (10–12 hp och balanserad hand – invit); 3♣ (nuvarande motorkod) → terminal/ej länkad (13+ hp: motorn väljer 3♣ som fjärde färg i denna sekvens; färgvalet är ännu inte systembekräftat). Handprofil: ja.
- **t40_responder_after_1nt_response** — `1♥ – Pass – 1NT – Pass – 2♥`  
  Svarshandens andra bud efter 1NT-svar  
  Grenar: 3♣ → terminal/ej länkad (6–9 hp och minst 6 klöver efter 2♦; 3♣ är lägsta lagliga nivå och ej krav); 3♥ → terminal/ej länkad (6–9 hp och minst 6 hjärter; återbud i öppningsfärgen på 3-nivån, ej krav); Pass → terminal/ej länkad (Högst 9 hp utan en färg som uppfyller motorns begränsade återbudsvillkor); Ej täckt → terminal/ej länkad (10+ hp eller ny färg som kan bjudas på 2-nivån – kräver systemförtydligande). Handprofil: ja.

## T41_STARK_2C_FORTSATTNING — Stark 2♣ – väntebud, öppnarens återbud och svarshandens fortsättning

- Noder: 31
- Root: `t41_n0` (giltig)
- Villkor: Ostörd budgivning. / 2♣ är stark öppning; första svar är alltid artificiella 2♦ oavsett svarshandens styrka och fördelning. / Efter 2♦ visar 2♥/2♠ minst femkortsfärg och utgångskrav; 3♣/3♦ minst femkortsfärg och utgångskrav. / 2NT visar 22–24 hp och jämn hand; 3NT visar 25–27 hp och jämn hand. / Efter öppnarens färgbud följer svarshanden de dokumenterade Herbert-, stöd-, sidofärgs- och sangreglerna i rattningsmotorns resp2c2(). / Noderna beskriver endast fortsättningar som uttryckligen stöds av aktuell motor; ej definierade handtyper lämnas utanför.

- **t41_n0** — `2♣`  
  Stark 2♣-öppning  
  Grenar: 2♦ → t41_n1 (Obligatoriskt väntebud). Handprofil: ja.
- **t41_n1** — `2♣ – Pass – 2♦`  
  Svar 2♦ – öppnaren beskriver sin starka hand  
  Grenar: 2♥ → t41_2h (5+ hjärter, utgångskrav); 2♠ → t41_2s (5+ spader, utgångskrav); 2NT → t41_2nt (22–24 hp, jämn hand); 3♣ → t41_3c (5+ klöver, utgångskrav); 3♦ → t41_3d (5+ ruter, utgångskrav); 3NT → t41_3nt (25–27 hp, jämn hand). Handprofil: ja.
- **t41_2h** — `2♣ – Pass – 2♦ – Pass – 2♥`  
  5+ hjärter, utgångskrav  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2s** — `2♣ – Pass – 2♦ – Pass – 2♠`  
  5+ spader, utgångskrav  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2nt** — `2♣ – Pass – 2♦ – Pass – 2NT`  
  22–24 hp, jämn hand  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3c** — `2♣ – Pass – 2♦ – Pass – 3♣`  
  5+ klöver, utgångskrav  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3d** — `2♣ – Pass – 2♦ – Pass – 3♦`  
  5+ ruter, utgångskrav  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3nt** — `2♣ – Pass – 2♦ – Pass – 3NT`  
  25–27 hp, jämn hand  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2h_root** — `2♣ – Pass – 2♦ – Pass – 2♥ – Pass`  
  2♥ – svarshandens fortsättning  
  Grenar: 2♠ → t41_2h_decline (Herbertavslag: 0–5 hp utan visat stödvärde); 3♥ → t41_2h_support (6+ hp och minst 3 korts stöd); 4♥ → t41_2h_weakfit (0–5 hp, minst 4 korts stöd och kortfärg); 3NT → t41_2h_nt (6+ hp, jämn hand utan stöd eller högfärg att visa). Handprofil: ja.
- **t41_2h_decline** — `2♣ – Pass – 2♦ – Pass – 2♥ – Pass – 2♠`  
  2♠ efter 2♥ – Herbertavslag eller naturlig spaderfärg  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2h_support** — `2♣ – Pass – 2♦ – Pass – 2♥ – Pass – 3♥`  
  Stöd med positiv hand efter 2♥  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2h_weakfit** — `2♣ – Pass – 2♦ – Pass – 2♥ – Pass – 4♥`  
  Svag hand med kortfärg och starkt stöd  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2h_nt** — `2♣ – Pass – 2♦ – Pass – 2♥ – Pass – 3NT`  
  Jämn svarshand efter 2♥  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2s_root** — `2♣ – Pass – 2♦ – Pass – 2♠ – Pass`  
  2♠ – svarshandens fortsättning  
  Grenar: 2NT → t41_2s_decline (Herbertavslag: 0–5 hp utan visat stödvärde); 3♠ → t41_2s_support (6+ hp och minst 3 korts stöd); 4♠ → t41_2s_weakfit (0–5 hp, minst 4 korts stöd och kortfärg); 3NT → t41_2s_nt (6+ hp, jämn hand utan stöd eller högfärg att visa); 3♥ → t41_2s_new (6+ hp och minst 5 kort i annan färg – utgångskrav). Handprofil: ja.
- **t41_2s_decline** — `2♣ – Pass – 2♦ – Pass – 2♠ – Pass – 2NT`  
  Herbertavslag efter 2♠  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2s_support** — `2♣ – Pass – 2♦ – Pass – 2♠ – Pass – 3♠`  
  Stöd med positiv hand efter 2♠  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2s_weakfit** — `2♣ – Pass – 2♦ – Pass – 2♠ – Pass – 4♠`  
  Svag hand med kortfärg och starkt stöd  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2s_nt** — `2♣ – Pass – 2♦ – Pass – 2♠ – Pass – 3NT`  
  Jämn svarshand efter 2♠  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_2s_new** — `2♣ – Pass – 2♦ – Pass – 2♠ – Pass – 3♥`  
  Ny färg efter 2♠  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3c_root** — `2♣ – Pass – 2♦ – Pass – 3♣ – Pass`  
  3♣ – svarshandens fortsättning  
  Grenar: 3♦ → t41_3c_decline (Herbertavslag: 0–5 hp utan visat stödvärde); 4♣ → t41_3c_support (6+ hp och minst 3 korts stöd); 5♣ → t41_3c_weakfit (0–5 hp, minst 4 korts stöd och kortfärg); 3NT → t41_3c_nt (6+ hp, jämn hand utan stöd eller högfärg att visa); 3♠ → t41_3c_newmajor (6+ hp och minst 4 kort i spader – utgångskrav). Handprofil: ja.
- **t41_3c_decline** — `2♣ – Pass – 2♦ – Pass – 3♣ – Pass – 3♦`  
  Herbertavslag efter 3♣  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3c_support** — `2♣ – Pass – 2♦ – Pass – 3♣ – Pass – 4♣`  
  Stöd med positiv hand efter 3♣  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3c_weakfit** — `2♣ – Pass – 2♦ – Pass – 3♣ – Pass – 5♣`  
  Svag hand med kortfärg och starkt stöd  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3c_nt** — `2♣ – Pass – 2♦ – Pass – 3♣ – Pass – 3NT`  
  Jämn svarshand efter 3♣  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3c_newmajor** — `2♣ – Pass – 2♦ – Pass – 3♣ – Pass – 3♠`  
  Högfärg efter lågfärgsvisning  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3d_root** — `2♣ – Pass – 2♦ – Pass – 3♦ – Pass`  
  3♦ – svarshandens fortsättning  
  Grenar: 3♥ → t41_3d_decline (Herbertavslag: 0–5 hp utan visat stödvärde); 4♦ → t41_3d_support (6+ hp och minst 3 korts stöd); 5♦ → t41_3d_weakfit (0–5 hp, minst 4 korts stöd och kortfärg); 3NT → t41_3d_nt (6+ hp, jämn hand utan stöd eller högfärg att visa); 3♠ → t41_3d_newmajor (6+ hp och minst 4 kort i spader – utgångskrav). Handprofil: ja.
- **t41_3d_decline** — `2♣ – Pass – 2♦ – Pass – 3♦ – Pass – 3♥`  
  Herbertavslag efter 3♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3d_support** — `2♣ – Pass – 2♦ – Pass – 3♦ – Pass – 4♦`  
  Stöd med positiv hand efter 3♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3d_weakfit** — `2♣ – Pass – 2♦ – Pass – 3♦ – Pass – 5♦`  
  Svag hand med kortfärg och starkt stöd  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3d_nt** — `2♣ – Pass – 2♦ – Pass – 3♦ – Pass – 3NT`  
  Jämn svarshand efter 3♦  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t41_3d_newmajor** — `2♣ – Pass – 2♦ – Pass – 3♦ – Pass – 3♠`  
  Högfärg efter lågfärgsvisning  
  Grenar: inga utgående grenar. Handprofil: ja.

## T42_1NT_SVAG_LAGFARGSRELA — 1NT – svagt relä med lång lågfärg

- Noder: 8
- Root: `t42_n0` (giltig)
- Villkor: Norr öppnar 1NT = 15–17 hp och jämn hand. / Svarshanden har under 8 hp och minst sex kort i en lågfärg, eller 5-5 i lågfärgerna. / 2♠ är artificiellt relä; det visar inte spader. / Öppnaren visar vilken lågfärg som är längre: 3♣ med längre klöver; 2NT med längre ruter eller lika längd. / Efter reläsvar väljer svarshanden slutbud 3♣ eller 3♦ efter sin egen längd; vid lika längd efter 2NT väljs 3♣.

- **t42_n0** — `1NT – Pass – 2♠`  
  2♠ – artificiellt relä med svag lågfärgshand  
  Grenar: 2NT → t42_n2 (Längre ruter eller lika längd i lågfärgerna); 3♣ → t42_n3 (Längre klöver). Handprofil: ja.
- **t42_n1** — `1NT – Pass – 2♠ – Pass`  
  Öppnarens svar på 2♠-reläet  
  Grenar: 2NT → t42_n2 (Ruter minst lika lång som klöver); 3♣ → t42_n3 (Klöver längre än ruter). Handprofil: ja.
- **t42_n2** — `1NT – Pass – 2♠ – Pass – 2NT – Pass`  
  2NT visar längre ruter eller lika längd i lågfärgerna. Svarshanden väljer sin längsta lågfärg; vid lika längd väljs klöver enligt nuvarande motor.  
  Grenar: 3♣ → t42_n4 (Klöver minst lika lång – slutbud 3♣); 3♦ → t42_n5 (Ruter längre – slutbud 3♦). Handprofil: ja.
- **t42_n3** — `1NT – Pass – 2♠ – Pass – 3♣ – Pass`  
  3♣ visar att öppnarens klöver är längre än ruter. Svarshanden passar om egna klöver är minst lika långa som ruter; annars korrigerar svarshanden till 3♦.  
  Grenar: Pass → t42_n6 (Klöver minst lika lång – slutbud 3♣); 3♦ → t42_n7 (Ruter längre – korrigering till 3♦). Handprofil: ja.
- **t42_n4** — `1NT – Pass – 2♠ – Pass – 2NT – Pass – 3♣`  
  Svarshanden väljer 3♣ som slutbud efter 2NT-reläsvar.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t42_n5** — `1NT – Pass – 2♠ – Pass – 2NT – Pass – 3♦`  
  Svarshanden väljer 3♦ som slutbud efter 2NT-reläsvar.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t42_n6** — `1NT – Pass – 2♠ – Pass – 3♣ – Pass – Pass`  
  Svarshanden passar på 3♣ och avslutar budgivningen.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t42_n7** — `1NT – Pass – 2♠ – Pass – 3♣ – Pass – 3♦`  
  Svarshanden korrigerar till 3♦ som slutbud.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T43_1NT_4NT_ENDPOINTS — 1NT – 4NT: fyr-essfråga utan trumf och RKC efter överföring/fit

- Noder: 8
- Root: `t43_n0` (giltig)
- Villkor: Öppningen 1NT visar 15–17 hp och balanserad hand. / Trädet dokumenterar bara vägen fram till 4NT; svaren efter 4NT ingår inte i denna etapp. / Direkt 1NT–4NT och 1NT–2♣–2♦–4NT är fyr-essfråga utan trumf. / Efter överföring till högfärg är 4NT RKC 1430 med överföringsfärgen som trumf.

- **t43_n0** — `1NT – Pass – 4NT`  
  4NT är uttryckligen avtalad fyr-essfråga utan fastställd trumf – inte kvantitativ invit.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t43_n1** — `1NT – Pass – 2♣ – Pass – 2♦ – Pass – 4NT`  
  4NT är uttryckligen avtalad fyr-essfråga utan fastställd trumf efter Stayman 2♦.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t43_n2** — `1NT – Pass – 2♦ – Pass – 2♥ – Pass – 4NT`  
  4NT är RKC 1430 med hjärter som trumf efter fullföljd hjärteröverföring.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t43_n3** — `1NT – Pass – 2♥ – Pass – 2♠ – Pass – 4NT`  
  4NT är RKC 1430 med spader som trumf efter fullföljd spaderöverföring.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t43_n4** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 3♥ – Pass – 4♥ – Pass – 4NT`  
  4NT är RKC 1430 efter att Stayman hittat hjärterfit och paret gått till 4♥.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t43_n5** — `1NT – Pass – 2♣ – Pass – 2♠ – Pass – 3♠ – Pass – 4♠ – Pass – 4NT`  
  4NT är RKC 1430 efter att Stayman hittat spaderfit och paret gått till 4♠.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t43_n6** — `1NT – Pass – 2♣ – Pass – 2♥ – Pass – 4♥ – Pass – 4NT`  
  4NT är RKC 1430 efter Stayman och direkt utgång i hjärter.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t43_n7** — `1NT – Pass – 2♣ – Pass – 2♠ – Pass – 4♠ – Pass – 4NT`  
  4NT är RKC 1430 efter Stayman och direkt utgång i spader.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T44_RKC_1430_SPADER_STENBERG — RKC 1430 efter 1♠ och Stenberg 2NT

- Noder: 5
- Root: `t44_s0` (giltig)
- Villkor: Ostörd budgivning. / 2NT efter 1♠ är Stenberg: 13+ HTP och minst fyra korts stöd. / Öppnarens 3♥ visar exakt en singleton i hjärter. / 4NT frågar efter fem nyckelkort; svaren följer RKC 1430. / Void behandlas inte som singleton. Andra Stenbergåterbud och kontrollbudssekvenser dokumenteras separat.

- **t44_s0** — `1♠ – Pass – 2NT – Pass – 3♥ – Pass – 4NT`  
  4NT är RKC 1430 med spader som överenskommen trumf efter Stenberg 2NT.  
  Grenar: 5♣ → t44_s1 (1 eller 4 nyckelkort); 5♦ → t44_s2 (0 eller 3 nyckelkort); 5♥ → t44_s3 (2 nyckelkort utan spaderdam); 5♠ → t44_s4 (2 nyckelkort med spaderdam). Handprofil: ja.
- **t44_s1** — `1♠ – Pass – 2NT – Pass – 3♥ – Pass – 4NT – Pass – 5♣`  
  5♣ visar 1 eller 4 nyckelkort enligt RKC 1430.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t44_s2** — `1♠ – Pass – 2NT – Pass – 3♥ – Pass – 4NT – Pass – 5♦`  
  5♦ visar 0 eller 3 nyckelkort enligt RKC 1430.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t44_s3** — `1♠ – Pass – 2NT – Pass – 3♥ – Pass – 4NT – Pass – 5♥`  
  5♥ visar två nyckelkort utan spaderdam.  
  Grenar: inga utgående grenar. Handprofil: ja.
- **t44_s4** — `1♠ – Pass – 2NT – Pass – 3♥ – Pass – 4NT – Pass – 5♠`  
  5♠ visar två nyckelkort med spaderdam.  
  Grenar: inga utgående grenar. Handprofil: ja.

## T45_1S_3S_INVIT — Invithöjning till 3♠

- Noder: 2
- Root: `t45_s0` (giltig)
- Villkor: 1♠ visar minst fem spader och öppningsstyrka. / 3♠ är invithöjning i parets system. / Svarshanden har normalt 10–12 HTP och minst fyrkortsstöd. / Öppnaren accepterar till 4♠ endast vid minst 26 gemensamma spelpoäng; annars pass.

- **t45_s0** — `1♠ – Pass – 3♠`  
  3♠ visar minst fyrkortsstöd och invitstyrka (normalt 10–12 HTP). Öppnaren accepterar bara om paret når 26 gemensamma spelpoäng.  
  Grenar: Pass → terminal/ej länkad (Under 26 gemensamma spelpoäng – avslå inviten); 4♠ → t45_s1 (26+ gemensamma spelpoäng – acceptera inviten). Handprofil: ja.
- **t45_s1** — `1♠ – Pass – 3♠ – Pass – 4♠`  
  Öppnaren accepterar 3♠-inviten med 26+ gemensamma spelpoäng.  
  Grenar: inga utgående grenar. Handprofil: ja.

## Överlappande sekvenser inom ostörd del

- `1NT | Pass | 2♦` — T03_OVERFORING_PASS/t03_n0, T07_OVERFORING_HJARTER/t07_n0
- `1NT | Pass | 2♦ | Pass | 2♥` — T03_OVERFORING_PASS/t03_n1, T07_OVERFORING_HJARTER/t07_n1, T27_OVERFORING_HJARTER_SEXKORT_INVIT/t27_overforing_hjarter_sexkort_invit_n0
- `1♥ | Pass | 2♥` — T05_HJARTERFIT_PASS/t05_n0, T10_1H_ENKEL_HOJNING/t10_n0, T21/t21_0
- `1NT | Pass | 2♣ | Pass | 2♦` — T06_STAYMAN_INGEN_HOGFARG/t06_n1, T26_STAYMAN_INGEN_HOGFARG_INVIT/t26_n0
- `1NT | Pass | 2♣ | Pass | 2♦ | Pass | 2NT` — T06_STAYMAN_INGEN_HOGFARG/t06_n2, T26_STAYMAN_INGEN_HOGFARG_INVIT/t26_n2
- `1NT | Pass | 2♥ | Pass | 2♠` — T08_OVERFORING_SPADER/t08_n1, T28_OVERFORING_SPADER_SEXKORT_INVIT/t28_overforing_spader_sexkort_invit_n0
- `1NT | Pass | 3NT` — T09_1NT_DIREKT_3NT/t09_n0, T18_1NT_3NT_DIREKT/t18_n0
- `1♥ | Pass | 2♥ | Pass | 3♥` — T10_1H_ENKEL_HOJNING/t10_n1, T35_OPENER_REBID_AFTER_1M_2M/t35_h_3h
- `1NT | Pass | 2♣ | Pass | 2♥` — T11_STAYMAN_HJARTERFIT_UTGANG/t11_n0, T24_STAYMAN_HJARTER_INVIT/t24_stayman_hjarter_invit_n0
- `1NT | Pass | 2♣ | Pass | 2♠` — T12_STAYMAN_SPADERFIT_UTGANG/t12_n0, T25_STAYMAN_SPADER_INVIT/t25_stayman_spader_invit_n0
- `1NT | Pass | 2♣ | Pass | 2♥ | Pass | 3♥` — T13_STAYMAN_HJARTERINVIT/t13_n0, T24_STAYMAN_HJARTER_INVIT/t24_stayman_hjarter_invit_n2
- `1NT | Pass | 2♣ | Pass | 2♥ | Pass | 3♥ | Pass | 4♥` — T13_STAYMAN_HJARTERINVIT/t13_n1, T24_STAYMAN_HJARTER_INVIT/t24_stayman_hjarter_invit_n5
- `1♠ | Pass | 2♠` — T15_1S_2S_SVAG_HOJNING/t15_n0, T22/t22_0
- `1♠ | Pass | 2♠ | Pass | 3♠` — T15_1S_2S_SVAG_HOJNING/t15_n1, T35_OPENER_REBID_AFTER_1M_2M/t35_s_3s
- `1♥ | Pass | 2♥ | Pass | 3♣` — T21/t21_1, T35_OPENER_REBID_AFTER_1M_2M/t35_h_c
- `1♥ | Pass | 2♥ | Pass | 3♦` — T21/t21_2, T35_OPENER_REBID_AFTER_1M_2M/t35_h_d
- `1♥ | Pass | 2♥ | Pass | 3♠` — T21/t21_3, T35_OPENER_REBID_AFTER_1M_2M/t35_h_s
- `1♥ | Pass | 2♥ | Pass | 4♥` — T21/t21_4, T35_OPENER_REBID_AFTER_1M_2M/t35_h_4h
- `1♠ | Pass | 2♠ | Pass | 3♣` — T22/t22_1, T35_OPENER_REBID_AFTER_1M_2M/t35_s_c
- `1♠ | Pass | 2♠ | Pass | 3♦` — T22/t22_2, T35_OPENER_REBID_AFTER_1M_2M/t35_s_d
- `1♠ | Pass | 2♠ | Pass | 3♥` — T22/t22_3, T35_OPENER_REBID_AFTER_1M_2M/t35_s_h
- `1♠ | Pass | 2♠ | Pass | 4♠` — T22/t22_4, T35_OPENER_REBID_AFTER_1M_2M/t35_s_4s
- `1♣ | Pass | 1♦ | Pass | 1♥` — T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1/t39_1c1d_second_0, T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD/t40_two_suit_rebid
- `1♥ | Pass | 1♠ | Pass | 1NT` — T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1/t39_1h1s_1nt, T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD/t40_balanced_rebid
- `1♥ | Pass | 1♠ | Pass | 2♥` — T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1/t39_1h1s_own, T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD/t40_own_suit_rebid
- `1♥ | Pass | 1♠ | Pass | 2♠` — T39_OPPNARENS_ATERBUD_EFTER_1_OVER_1/t39_1h1s_support, T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD/t40_support_raise

## Inventeringsnotering

Överlapp ska bedömas semantiskt: samma budsekvens kan vara en gemensam tillståndsbeskrivning, eller så skiljer sig handvillkor/avsikt. Normalisera inte automatiskt. T40:s ogiltiga root, de åtta saknade handprofilerna och terminala grenar utan explicit terminalstatus finns också redovisade i `KARTA_OSTORD_BUDGIVNING.md`.
