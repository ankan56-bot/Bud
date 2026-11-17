# Logg – budregler och rättningslogik

## Hand 1 – slutbud och automatisk pass

**Status:** Dokumenterat krav. Ingen ändring av budmotor eller rättningsmotor utförd.

Följande bud ska behandlas som slutbud:
- 3NT
- 4♠
- 4♥
- 5♦
- 5♣

När ett sådant slutbud har nåtts ska efterföljande budgivare passa, förutsatt att budsekvensen inte är del av en pågående konventionell fråga/svarssekvens.

### Undantag: 5 i lågfärg efter essfråga
5♦ eller 5♣ är inte automatiskt slutbud om budgivningen har gått via 4NT som essfråga (S-frågan). Då kan budet vara ett svar på frågan och budgivningen fortsätter enligt essfrågelogiken.

### Koppling till tidigare budlogik
Slutbud ska också kunna fastställas utifrån tidigare beräknad spelstyrka och trumfstöd. Exempel:
- Högfärg: minst 8 trumf och 26 OTP innebär att utgångsnivån 4♥/4♠ är nådd.
- När utgångsnivån är nådd ska nästa bud vara pass, om ingen uttrycklig konventionell sekvens fortfarande pågår.

**Viktigt:** Detta är en dokumenterad regel-/testpunkt för kommande arbete. Den är inte implementerad och inga befintliga regler eller filer i motorn har ändrats.


## Giv 4 – fortsättning efter stark 2♣

**Status:** Dokumenterat systemkrav/testobservation. Ingen ändring av budmotor eller rättningsmotor utförd.

Efter sekvensen **2♣–2♦ (obligatorisk väntan)–2♥** är **3NT från svarshanden korrekt** med en hand som:
- inte är ett Herbert-avslag (0–5 HCP), och
- inte har slamintresse eller tillräckliga värden för att undersöka slam.

Detta innebär att svarshanden inte måste visa en ny färg på 3-tricksnivån i den här situationen. Giv 4:s 3NT-bud ska alltså bedömas som korrekt. Fortsättningen i stark-2♣-sekvenser behöver kompletteras med fler testhänder innan reglerna implementeras, så att vi inte bygger in en alltför snäv eller motstridig regel.


## Giv 6–15 – separat dokumentation av föreslagna budgivningar

**Status:** Testobservationer från AI-analysen och rättningsmotor 5.2. Inga kodändringar utförda. Budgivningarna nedan är separata exempel; de ska inte slås ihop till en enda regel. Motståndarnas bud är med som kontext. "Ej täckt" betyder att motorn saknar beskriven fortsättning, inte att budet är fel.

### Giv 6 – 1♠–pass–2♠–pass…
Föreslagen auktion: Öst 1♠, Syd pass, Väst 2♠, Norr pass, Öst pass, Syd pass.
- 1♠ och 2♠ är rimliga öppnings-/svarsbud; 2♠ är slutkontrakt med 8-korts fit och begränsad styrka.
- Motorn bedömer Syds pass efter öppningen som rätt. Fortsättningen efter motståndarnas bud är ej täckt.
- Ingen kodändring.

### Giv 7 – fjärde hand öppnar efter tre pass, följt av inkliv
Föreslagen auktion: Syd pass, Väst pass, Norr pass, Öst 1♦, Syd pass, Väst 1♠, Norr 2♠, Öst pass, Syd pass, Väst pass.
- Östs 1♦ är korrekt som fjärde hand efter tre pass (14 hp). Västs 1♠ är ett naturligt svar med 4+ spader och 8 hp.
- Norrs 2♠ är ett konkurrerande inkliv med 5-korts spader och 10 hp; motorn saknar denna fortsättning efter flera motståndarbud.
- Syds pass efter inklivet är också ej täckt. Exemplet ska behållas separat som konkurrensbudgivningstest.

### Giv 8 – 1♣–1♥–1NT–3NT
Föreslagen auktion: Väst pass, Norr 1♣, Öst pass, Syd 1♥, Väst pass, Norr 1NT, Öst pass, Syd 3NT, Väst pass, Norr pass, Öst pass.
- Motorn godkänner Norrs 1♣, Syds 1♥ och Norrs 1NT (12–14 balanserad).
- Syds 3NT är ett naturligt utgångsval med 16 hp; fortsättningen efter 1♣–1♥–1NT behöver kompletteras i motorn.
- Pass efter 3NT ska omfattas av den dokumenterade slutbudsregeln.

### Giv 9 – 1♦ och pass runt
Föreslagen auktion: Norr pass, Öst 1♦, Syd pass, Väst pass, Norr pass.
- Östs 1♦ är korrekt med 16 hp och 6-korts ruter. Syds och Norrs pass bedöms som korrekta.
- Enkel öppning med pass runt; ingen ny regel identifierad.

### Giv 10 – 1♦–1♠–2♠ och pass
Föreslagen auktion: Öst pass, Syd pass, Väst pass, Norr 1♦, Öst 1♠, Syd pass, Väst 2♠, Norr pass, Öst pass, Syd pass.
- Norrs 1♦ är korrekt med 12 hp och 5 ruter. Östs 1♠ är ett naturligt inkliv med 5-korts spader. Västs 2♠ är stöd med 4-korts spader.
- Motorn saknar delar av fortsättningen efter inkliv; pass efter 2♠ avslutar budgivningen.

### Giv 11 – stark öppningshand med 6-korts ruter och högfärgsfit
Föreslagen start: Syd 1♦, Väst pass, Norr 1♠, Öst pass, Syd 3♦.
- Motorn bedömer 1♦ och 1♠ som rätt och kräver 3♦ som öppnarens hoppåterbud (inte 2♦).
- Norrs fortsättning måste analyseras vidare: Norr har 6-korts spader och paret har 8-korts spaderfit. Motorns övergripande poängkontroll indikerar slamintresse (33 spelpoäng enligt dess beräkning), så ett omedelbart 3NT ska inte betraktas som fastställt slutbud.
- Behöver fler exempel för att definiera fortsättningen och slamundersökningen.

### Giv 12 – 1♦, pass, 1NT, 2♦
Föreslagen auktion: Väst 1♦, Norr pass, Öst 1NT, Syd pass, Väst 2♦, Norr pass, Öst pass, Syd pass.
- 1NT-svaret och öppnarens 2♦-återbud är en möjlig naturlig fortsättning; resten är ej täckt efter konkurrenssituationen.
- Viktig skillnad mellan systemregel och motorkod: användarens system anger att inkliv på 2-nivån kräver 6 kort. Motorn 5.2 föreslår ändå 2♣ med Norrs 5-kortsfärg och 12 hp. Detta är en konkret konflikt som ska rättas först när fler inklivsexempel granskats; motorns förslag ska inte tas som gällande systemregel.

### Giv 13 – 1♠, upplysningsdubbling, stöd
Föreslagen auktion: Norr 1♠, Öst X, Syd 2♠, Väst pass, Norr pass, Öst pass.
- Norrs 1♠ och Östs upplysningsdubbling är rimliga. Syds 2♠ visar stöd och begränsad styrka; motorn saknar fortsättningen efter dubbling.
- 2♠ är slutkontrakt. Testfall för stöd efter upplysningsdubbling.

### Giv 14 – 1♣ följt av naturligt svar
Föreslagen start: Öst 1♣, Syd pass, Väst 1♥, Norr pass, Öst 2♣.
- Öppningsbudet 1♣ är korrekt. Fortsättningen efter 1♥ och 2♣ behöver analyseras vidare; motorn saknar en del av svarshandens andra bud.
- Den tidigare testade sekvensen där Syd bjöd 3♣ var felaktig eftersom Syd är motståndare till öppnaren, inte öppnarens partner. Den ska inte användas som systemexempel.

### Giv 15 – Stenberg efter 1♥–1♠
Föreslagen auktion: Syd 1♥, Väst pass, Norr 1♠, Öst pass, Syd 2NT (Stenberg), Väst pass, Norr 4♠, Öst pass, Syd pass, Väst pass.
- Norrs 1♠ är korrekt. Syd har 13 hp och 4-korts spaderstöd; enligt systemregeln ska Syd bjuda Stenberg 2NT.
- Motorn 5.2 föreslår i stället 2♦ som splinter på grund av singelton. Detta står i konflikt med den uttryckliga systemregeln om Stenberg 2NT med 13+ htp och 4+ stöd. **Detta är en konkret motoravvikelse att rätta**, men först tillsammans med övriga Stenbergfall så att prioriteringen mellan Stenberg och splinter blir konsekvent.
- Norrs 4♠ är en möjlig signoff med svag hand och mycket lång spader; fortsättningen är inte fullständigt täckt.

**Samlad slutsats för giv 6–15:** Flera fortsättningar efter inkliv, dubblingar och konkurrensbud är ej täckta. Två konkreta konflikter har identifierats: (1) 2-nivåinkliv med 5 kort trots systemkrav på 6 kort, (2) motorn väljer splinter framför Stenberg trots 13+ htp och 4+ stöd. Giv 11 kräver särskild slamfortsättning. Inga kodfiler har ändrats.


## Giv 16–25 – separat dokumentation av tio nya givar

**Status:** AI-föreslagna auktioner har jämförts med rättningsmotor 5.2. Varje giv dokumenteras separat. Inga kodändringar utförda. "Ej täckt" betyder att motorn inte kan avgöra fortsättningen med nuvarande regler; det betyder inte automatiskt att budet är fel.

### Giv 16 – balanserad 21 hp
AI:s första förslag 2♣–2♦–2♠–4♠ var felaktigt enligt systemet. Handen har 21 hp och balanserad 5-3-3-2-fördelning; korrekt öppning är **2NT** enligt intervallet 20–21. Motorn bekräftar 2NT och avvisar 2♣. Svarshandens fortsättning efter 2NT behöver bedömas separat. Denna giv ska inte användas som exempel på stark 2♣.

### Giv 17 – stark 2♣, balanserad 22 hp
Föreslagen auktion: Norr pass, Öst pass, Syd 2♣, Väst pass, Norr 2♦, Öst pass, Syd 2NT.
- Motorn godkänner pass, 2♣, obligatoriskt 2♦ och 2NT (22–24 balanserad).
- Motorn föreslår därefter 5♦ i stället för pass med svarshandens 2 hp. Detta behöver granskas manuellt: 2NT-återbudet visar den starka balanserade handen, men svarshanden är mycket svag. Motorns generella spelpoängs-/utgångsbedömning kan vara för aggressiv här.
- Separat testfall för fortsättning efter 2♣–2♦–2NT.

### Giv 18 – 1♦ och svagt inkliv
Öst öppnar 1♦ med 17 hp och 5 ruter. Syd har 6 hp och 5 hjärter. AI:s första förslag 1♥ som inkliv bedöms av motorn som valfritt men med pass som huvudbud. Denna hand ska dokumenteras som exempel på att femkortsfärg inte räcker utan erforderlig inklivsstyrka. Efter pass runt är öppningen avslutad; ingen konstlad fortsättning ska läggas till.

### Giv 19 – konkurrensbudgivning med 1♥-inkliv
Föreslagen auktion: Syd 1♦, Väst 1♥, Norr pass, Öst pass, Syd 1♠, därefter pass runt.
- Motorn godkänner öppningen 1♦ och registrerar 1♥ som motståndarbud. Fortsättningen efter inklivet är ej täckt.
- Syds 1♠ visar sin fyrkortsfärg efter öppning och konkurrens. Behöver fler jämförbara exempel innan regel byggs.

### Giv 20 – pass och enkel öppning
Föreslagen auktion: Väst pass, Norr pass, Öst 1♦, Syd pass, Väst pass, Norr pass.
- Motorn godkänner samtliga bedömda pass och Östs 1♦.
- Enkel öppning med pass runt; inget nytt systemkrav identifierat.

### Giv 21 – 1♥ följt av 2♣-inkliv
Föreslagen auktion: Norr pass, Öst 1♥, Syd 2♣, Väst pass, Norr pass, Öst 2♥, därefter pass runt.
- Motorn godkänner 1♥, Syds 2♣-inkliv (15 hp och minst fem klöver) och Östs 2♥-återbud.
- Pass från Norr och Syd i konkurrenssituationen är ej täckta. Behåll som separat test av återbud efter inkliv.

### Giv 22 – 1♠ och hoppande klöverinkliv
Korrigerad kandidatsekvens: Öst 1♠, Syd 3♣, Väst pass, Norr X.
- Syd har 8 hp och sex klöver; motorn anger 3♣ som huvudbud (hoppande inkliv).
- Norr har 12 hp och fördelning som passar för upplysningsdubbling; motorn anger X som huvudbud i stället för 2♠.
- Östs och Syds fortsättning efter dubblingen är ännu inte fastställd. Tidigare AI-förslag med pass/2♠/pass gav flera valfria avvikelser och ersätts av detta bättre testscenario.

### Giv 23 – 1♥ och pass runt
Föreslagen auktion: Syd pass, Väst pass, Norr 1♥, Öst pass, Syd pass, Väst pass.
- Motorn godkänner pass och öppningen 1♥.
- Norrs öppningshand har 11 hp och sexkorts hjärter. Den ryms inom systemets undantag för 11 hp med bra lång färg. En öppning på 1-tricksnivån får enligt systemet ha högst 19 hp; starkare händer ska öppnas enligt 2♣-/2NT-reglerna.
- Syds svar ska bedömas utifrån svarshandens styrka och den sammanlagda spelstyrkan: tillräckliga värden för utgång ska leda till utgång, medan starkare sammanlagda värden ska leda till slamundersökning. Det går därför inte att slå fast 4♥ enbart utifrån motorns uppgift om 27 spelpoäng.
- Testfallet ska kontrollera att svarshanden skiljer mellan utgång och slam utifrån öppnarens möjliga styrka (högst 19 hp) och sina egna värden. Ingen generell automatisk 4♥-regel fastställs här.

### Giv 24 – 1♣ och hoppande hjärterinkliv
Korrigerad kandidatsekvens: Väst pass, Norr pass, Öst 1♣, Syd 2♥, Väst pass, Norr 2♠, Öst 2♣.
- Syd har 9 hp och sex hjärter; motorn anger 2♥ som huvudbud (hoppande inkliv) snarare än 1♥.
- Norrs 2♠-svar efter inklivet är ej täckt. Östs 2♣-återbud är naturligt och godkänt.
- Testfall för hoppande inkliv med sexkortsfärg och måttlig styrka.

### Giv 25 – 1♥ och konkurrens med ruter
Föreslagen kandidatsekvens: Norr 1♥, Öst pass, Syd 2♦, Väst pass, Norr 4♥.
- Norr har 12 hp och sjukortig hjärter. Syd har 12 hp, fem ruter och tre hjärter. Motorns poängbedömning anger 4♥ som bästa slutmål (30 spelpoäng och minst åttakorts hjärterfit).
- Motorn markerade Syds ursprungliga pass som fel och föreslog 4♥ som bästa teoretiska kontrakt. Själva inklivet 2♦ och fortsättningen behöver verifieras manuellt innan de blir fasta systemregler.
- Separat testfall för att inte missa utgång när öppnaren har lång högfärg och svarshanden har stöd.

**Samlad observation giv 16–25:** Nya testområden är svar efter 2NT, svaga inkliv, hoppande inkliv, upplysningsdubbling efter hoppande inkliv, svar/återbud efter konkurrensbud samt utgångsbedömning med lång högfärg. Giv 16 visar vikten av att skilja balanserad 20–21 från stark 2♣. Giv 17 och 23 kräver manuell kontroll av motorns spelpoängsberäkning. Inga kodfiler har ändrats.


## Bokregler – svarshandens andra bud efter öppnarens återbud (s. 32–33)

**Status:** Implementerat i rättningsmotorn v5.3. Samma beslutsträd används av budförslag och rättning via `Rattning.nodeFor()`.

Bokens fyra handtyper har lagts in som struktur:
A. Öppnaren har visat stöd i svarshandens färg.
B. Öppnaren har visat en balanserad hand.
C. Öppnaren har visat en enfärgshand med minst sex kort.
D. Öppnaren har visat två färger (5–4 eller längre).

**Poänganpassning till vårt system:**
- Bokens exakta intervall har inte kopierats rakt av.
- I trumf används vår gemensamma spelpoängsberäkning: fördelningspoäng endast vid minst åtta gemensamma trumfkort; utgångsgräns 26 i högfärg och 28 i lågfärg.
- I sang används endast gemensamma honnörspoäng och 26-poängsgränsen.
- Invitnivå används som mellanläge under utgångsgränsen.
- Vid tvåfärgshand används svag preferens, invit med mellanstyrka och fjärde färg som utgångskrav med 13+ hp när den är tillgänglig.

**Avgränsning:** Detta är en första konsekvent kodtolkning av bokens principer, inte en ordagrann kopia av dess poängtabeller. Den behöver nu regressionstestas mot de 200 givarna och tidigare godkända exempel. Bokens regler har inte fått företräde framför uttryckliga tidigare systembeslut.


## Konfliktkontroll före regressionstest – 2026-11-14

Vid granskning av v5.3 hittades en kvarvarande avvikelse från den fastställda sanggränsen: den övergripande kontrollen för missad utgång använde 25 hp i sang utan fit. Detta stod i konflikt med systemets beslutade gräns 26 hp. Felet är korrigerat i `rattningsmotor.js` (commit `031fd77`): både tröskel, förklaring och kommentar använder nu 26 hp.

Kontrollerat utan ytterligare ändring:
- Särregeln efter 1 i färg–1NT, inklusive 6–9 hp och 6+ kort, körs före den nya generella bokregeln och behåller därmed sin prioritet.
- Stenberg 2NT med 13+ htp och 4+ stöd ligger kvar i svarsfunktionen.
- Reverse-/fjärde-färg-logiken ligger kvar separat från den nya generella återbudsbedömningen.
- Öppningsgränserna 1NT 15–17, 2NT 20–21 och 1 i färg 12–19 har inte ändrats.

Kvar att verifiera i regressionstest: de nya invitnivåerna 22–25 i högfärg och 24–27 i lågfärg är kodtolkningar av bokprincipen, inte uttryckligen tidigare fastställda systemtrösklar. De ska jämföras med tidigare godkända givar innan de betraktas som slutgiltiga. Ingen regressionstestkörning är gjord ännu.


## Invitgränstest av v5.3 – 2026-11-14

Kört syntetiska gränsfall direkt mot `Rattning.nodeFor()`, med korrekt normalisering av honnörskort till 14/13/12/11/10. Detta är isolerade beslutstester, inte regressionstest av de 200 givarna.

**Högfärgsfit, 8 kort, öppnare 13 hp:**
- 22–23 gemensamma honnörspoäng gav 24–25 gemensamma spelpoäng och rekommendationen 3 i trumffärgen (invit).
- Från 24 gemensamma honnörspoäng gav 26+ spelpoäng och rekommendationen utgång.

**Lågfärgsfit, 8 kort, öppnare 13 hp:**
- 21 gemensamma honnörspoäng gav 23 spelpoäng och pass.
- 22–25 gemensamma honnörspoäng gav 24–27 spelpoäng och 3 i lågfärgen (invit).
- Utgångsgränsen 28 spelpoäng är oförändrad.

**Balanserat återbud utan majorfit:**
- 21 gemensamma honnörspoäng: pass.
- 22–25 gemensamma honnörspoäng: 2NT (invit).
- 26 gemensamma honnörspoäng: 3NT (utgång).

**Slutsats:** De isolerade gränstesterna följer de avsedda intervallen. Ingen ändring av poänggränserna behövs efter detta test. Fortsatt kontroll av budval och handtyper sker i regressionstestet.


## 1-färgsöppning – 1NT-svar (arbetslogg 2026-11-17)

Källgrund: **Nordisk standard 2012-08-22, sida 3**. Detta är en avgränsad fortsättning efter 1 i färg–1NT; den får inte blandas ihop med 1NT-öppningens Stayman/överföringar.

### Implementerat enligt källan
- Öppnarens balanserade hand: 12–14 hp passar på 1NT-svaret; 18–19 hp återbjuder 2NT.
- Egen 6+ färg utan sidofärg: 12–16 htp på lägsta nivå; 17–19 htp med enkelhopp; 20+ htp till utgång i högfärg.
- Tvåfärgshand med minst 9 kort: andra färgen på lägsta nivå med 12–17 hp vid 5-4; hopp i andra färgen med 18+ htp och minst 5-4; reverse med 18+ och minst 5-4.
- Svarshandens undantag efter 1NT: 6–9 hp och egen 6+ färg får återbjudas på lägsta lagliga nivå utan krav. För öppningsfärgen är lägsta återbudsnivå 3; för en ny färg kan det vara 2.
- Efter öppnarens 2NT (18–19 balanserad) accepteras inviten till utgång med 26+ gemensamma honnörspoäng i sang, eller med minst 8-korts högfärgsfit och 26+ gemensamma spelpoäng. Detta använder parets redan fastställda utgångsgränser. Modulen stannar vid utgång och innehåller inga slamförslag.

### Expertfrågor / ej täckt
1. Öppnarens tredje bud efter att svarshanden återbjudit egen 6+ färg med 6–9 hp är inte fullständigt beskrivet på sida 3. Fortsättningen ska därför förbli ej täckt tills ett uttryckligt svar finns.
2. Svarshandens andra bud med 10 hp efter öppnarens färgåterbud saknar ett tydligt separat undantag i källtexten. Ingen ny regel har hittats på.
3. För 20+ htp med egen 6+ lågfärg utan sidofärg anger den citerade tabellen inte ett lika tydligt slutbud som för högfärg. Lämnas för expertkontroll.
4. Under nuvarande svarstabell går 1♣–1NT inte att nå naturligt: en 4+ färg kan visas på 1-nivån eller som klöverstöd. Detta bör bekräftas mot parets fullständiga svarssystem innan sekvensen avförs som omöjlig.

Alla ovanstående luckor ska ligga kvar som ej bedömda och föras vidare i luckloggen; de får inte fyllas med antagna budregler.


## Svaga tvåöppningar – arbetsstart 2026-11-17

- Separat audit finns i `testdata/weak-two-audit.md`.
- Projektets inbäddade Nordisk Standard-text har använts som tillgängligt underlag; ingen PDF har hittats i den aktuella arbetsgrenen. Ingen extern webbsökning har använts.
- Rättningsmotor 8.5 korrigerar 3-höjningen efter svag tvåa till spärrhöjning (3+ stöd, ej invit) och kräver 2+ stöd för 2NT-invit (9–10 hp).
- Oklara styrkegränser och fortsättningar dokumenteras som ej täckta i auditrapporten i stället för att fyllas med antaganden.
- Störd budgivning lämnas helt utanför arbetet.


## Källkontroll svaga tvåöppningar – korrigering 2026-11-17

PDF:en `nordisk_standard.pdf` (2012-08-22), sida 4, återfanns i ChatGPT-biblioteket efter den första kodpassningen. Denna PDF-text är auktoritativ och ersätter tidigare notering om att PDF inte fanns tillgänglig.

- 2NT efter svag tvåa är invit med minst 2 stödkort. PDF:en anger ingen hp-gräns för svarshanden; den tidigare 9–10 hp-gränsen på svarshanden är borttagen.
- 6–8 hp respektive 9–10 hp gäller öppnarens min/max-ombud efter 2NT.
- Maximum efter 2NT är 3NT/4 högfärg. Efter lågfärgsöppning är återbudet 3NT, inte 4 i lågfärgen.
- Ny färg med 5+ kort är krav till minst 3 i öppningsfärgen.
- Hopp i ny färg visar renons och är slaminvit.
- 3NT är slutbud; 3 i öppningsfärgen är spärrhöjning med 3+ stöd, ej invit.
- Rättningsmotor 8.6 och utökade tester bygger nu på PDF sida 4. Återstående odefinierade fortsättningar finns i `testdata/weak-two-audit.md`.


## Svaga tvåöppningar – PDF-baserad regression godkänd 2026-11-17

- Rättningsmotor 8.6 är incheckad på arbetsgrenen.
- `testdata/weak-two.test.js`: 11/11 tester passerar.
- Hela GitHub Actions-körningen `44096901366` passerade samtliga steg, inklusive befintliga regressioner, analysbibliotek, handvillkor och DDS-runtime-kontroller.
- 140-givarsbaslinjen uppdaterad för motor 8.6: 581 rätt, 39 ej täckta, 0 fel; 1 185 budpositioner. DDS är inte körd i själva budgivningsbaslinjen.
- PDF sida 4 är källan. Inga poänggränser för svarshandens 2NT-invit har hittats; motorn kontrollerar endast minst 2 stödkort. Öppnarens 6–8/9–10 hp-min/max efter 2NT är implementerat.
- Ej täckta fortsättningar är specificerade i `testdata/weak-two-audit.md`. De ska inte ersättas med antaganden.


## Slutlig gränskontroll svaga tvåöppningar – 2026-11-17

- Utökade svag-två-testpaketet till 14 tester. Det täcker nu även 11 hp med sexkortsfärg (öppna 1 i färgen), femkortsfärg som inte får bli svag tvåa samt sju kort som i stället hör till 3-öppningsfamiljen.
- Samtliga 14 svag-två-tester passerade i körning `44097230489`; hela workflow-körningen avslutades med **success**.
- Källreglerna på PDF sida 4 är därmed testade för alla uttryckligen beskrivna svarstyper. Fortsättningar som inte finns i PDF:en ligger kvar i expertloggen, inte som gissade regler.


## Slutlig källkorrigering och analysnoder – svaga tvåöppningar 2026-11-17

- PDF sida 2 har verifierat att 2♦/2♥/2♠ är 6–10 hp och exakt sex kort. PDF:en anger inget krav på bra färgkvalitet. Det tidigare motorvillkoret för färgkvalitet är borttaget.
- 11 hp med sexkortsfärg i ♦/♥/♠ öppnas 1 i färgen enligt den uttryckliga noteringen i PDF:en. Detta testas nu även med en färg utan honnörer.
- Motorversion 8.7; 15/15 svag-två-regressioner passerar.
- Analysbiblioteket har tre pedagogiska träd tillagda: `T34_SVAG_TVA_D`, `T35_SVAG_TVA_H`, `T36_SVAG_TVA_S`. De täcker de tre öppningarna och de dokumenterade svarstyperna. Odefinierade fortsättningar är uttryckligen märkta, inte påhittade.
- Full GitHub Actions-körning `44098066656`: **success**, inklusive analysbibliotekets matchning och handprofiltester.
- 140-givarsbaslinjen för motor 8.7: 579 rätt, 40 ej täckta, 0 fel (1 181 budpositioner).


## Återställd färgkvalitet för svaga tvåöppningar – 2026-11-17

Användarens uttryckliga instruktion återställer den tidigare definitionen av god färg för 2♦/2♥/2♠. Detta ersätter den tidigare ändringen i motor 8.7 där kvalitetskravet togs bort.

- Exakt sex kort i öppningsfärgen och 6–10 hp gäller fortsatt.
- Färgkvalitet: minst 2 honnörer (A/K/Q/J), eller minst 1 honnör samt minst 2 av 10–9–8.
- En sexkortsfärg som inte uppfyller kvalitetskravet ska inte öppnas svagt på 2-läget.
- Rättningsmotor 8.8 återinför kontrollen via den befintliga `goodForWeakTwo`-funktionen.
- 16 regressionstester täcker både två honnörer, en honnör + två mellankort samt otillräcklig färgkvalitet.
- GitHub Actions `44100697247`: hela testkedjan **success**.
- Uppdaterad 140-givarsbaslinje: 581 rätt, 39 ej täckta, 0 fel; 1 185 budpositioner.


## Spärröppningar – 2026-11-17

- Beslut: samma två kriterier för bra färg används som för svaga tvåor: (1) minst två honnörer A/K/D/Kn, (2) minst en honnör samt minst två av 10/9/8.
- 6 kort: ett eller båda kriterierna ger 2♦/2♥/2♠.
- 7 kort: ett kriterium ger 2-nivån; båda ger 3-nivån.
- 8 kort: ett kriterium ger 3-nivån; båda ger 4-nivån.
- Noll kriterier ger ingen spärröppning i den definierade trappan. 9+ kort är ej täckt och ska loggas.
- 2♣ förblir starköppning. Därför kan 7-korts ♣ inte öppnas på 2-nivån; 3♣ används vid minst ett kriterium. 8-korts ♣: 3♣ med ett kriterium, 4♣ med båda.
- Implementerat i rättningsmotor 8.9 på `work/theme-dataset-analysis`. Se `testdata/preemptive-openings-audit.md`.

- Kvar att expertgranska: lika långa spärrfärger med olika färgkvalitet samt fortsättningar efter 3-/4-nivåns spärröppningar. 9+ kort med 6-10 hp är ej täckt.
- 20 regressionstester finns i `testdata/weak-two.test.js`; testkörning/CI är ännu inte verifierad och ska inte beskrivas som godkänd.

- Rättningsmotor 9.0: 7-/8-korts spärrtrappa enligt användarbeslutet. Svar efter sjukkortig 2-nivåöppning och efter 3-/4-nivåöppningar markeras ej täckta; generiska tidigare antaganden om nya färger/3NT/spärrhöjning har tagits bort.
- Regressionstestfilen har nu 23 tester. CI-/testkörning är ännu inte verifierad.

- Analysbiblioteket uppdaterat till 0.5.16. T34–T36 begränsade till exakt sex kort och kvalitetskriteriet markeras för manuell kontroll; hindrar att sjukkortig 2-nivåöppning felaktigt förklaras som PDF:ens svaga tvåa.
- Regressionstestfilen har nu 25 tester, inklusive analysbibliotekets exakta sexkortsvillkor. Testkörning/CI är fortfarande inte verifierad.

- Rättningsmotor 9.1: sexkortig ♣ med bra färg lämnas ej täckt eftersom 2♣ är starköppning och alternativ nivå saknas i underlaget. Ingen pass-/3♣-regel hittas på. Manifest och regressionstester uppdaterade; 26 tester finns, körning/CI ej verifierad.

- Lagt till `.github/workflows/preemptive-regression.yml` som kör de 26 testerna i `testdata/weak-two.test.js` vid push till arbetsgrenen och PR mot main. Körresultat är ännu inte verifierat.


## Svaga tvåor – svarbud enligt lathund sida 27 (2026-11-17)

- Användarbeslut: endast svarbuden efter svag tvåöppning ändras. Öppningsvillkoren 6–10 hp, exakt sex kort och tidigare definition av god färg ligger kvar.
- Källa för svaren: `Bridge Lathund bok(2).pdf`, tryckt sida 27.
- 3 i öppningsfärgen = invit cirka 14–16 stp.
- 2NT = Stenberg 2NT, 13+ stp.
- Ny färg = ofta sexkortsfärg, minst 15–16 hp, rondkrav. Femkortsfärg lämnas för expertbedömning då lathunden inte anger absolut minimiantal.
- Direkt utgång = slutbud.
- Hopp i ny färg = Splinter, 19+ stp.
- 4NT = essfråga med öppningsfärgen som trumf; trumfdetektionen i RKC har utökats för svaga 2-öppningar.
- Den tidigare min/max-stegen efter 2NT är avstängd. Öppnarens fortsättning efter Stenberg behöver egen verifiering och loggas ej täckt.
- Rättningsmotor 9.4, analysbibliotek 0.5.17 och 30 regressionstester incheckade på arbetsgrenen. CI är ännu inte verifierad.


## Gemensamma poängkrav för utgång och slam efter svag tvåa – 2026-11-17

- Beslut: samma normala styrkekrav ska gälla även efter svag tvåöppning; ingen separat poängskala.
- Rättningsmotor 9.5 skiljer mellan budets systembetydelse och kontraktets styrkemässiga kvalitet. Direkt utgång enligt Lathunden är fortsatt ett slutbud, men kontraktet kontrolleras separat.
- Gemensam kontraktskontroll: 3NT 26 hp; 4♥/4♠ 26 spelpoäng + minst 8-korts fit; 5♣/5♦ 28 spelpoäng + minst 8-korts fit; lillslam 33 poäng + högst ett saknat ess (och fit i färg); storslam alla fyra ess samt trumfkungen i färg.
- Korrigerad gemensam trumflängdsbonus: 9 trumf +1, 10+ trumf +2.
- Fyra regressionstester tillagda. Testkörning/CI inväntar verifiering.


- Motor 9.6: generell missad-utgång-kontroll får inte överskriva ej täckta fortsättningar efter Stenberg 2NT. Slutkontraktets separata poängkontroll gäller fortsatt. Testfixturer och +2-trumfbonusregression rättade.

## Öppnarens andra färg – positiv och negativ betydelse (2026-11-17)

Källa: Nordisk standard 2012-08-22, sida 3, avsnittet "Öppningshandens andra bud".

- 1♥–1♠–2♣: andra färgen på lägsta nivå. Visar 12–17 hp och exakt 5–4 i de två färgerna. SH får passa med 6–7 hp och stöd.
- 1♥–1♠–3♣: hopp i andra färgen. Visar 18+ htp och minst 5–4 i båda färgerna.
- Stigande budgivning (reverse): 18+ hp och minst 5–4; andra färgen är högre än den första.
- Negativ betydelse ska visas uttryckligen: 2♣ på lägsta nivå utesluter 18+ htp; 3♣ med hopp utesluter intervallet 12–17 hp för den enkla 5–4-beskrivningen.
- HTP ska inte räknas slentrianmässigt på varje 5–4-hand. För denna tvåfärgsgren räknas stöd-/fördelningspoäng när handen har egen 6+ färg eller 5–5, i enlighet med definitionen på sida 1. En vanlig 5–4-hand använder hp.
- Fördelningar/styrkor som inte matchar någon av de uttryckliga raderna lämnas ej täckta i stället för att anta en regel.

Rättningsmotorn får separat konventionsetikett `tvåfärgshand`, med budförklaring för både positiv och negativ betydelse. Regressionstester tillagda för 5–4 vid 14/17/18 hp, 6–4 med 18 htp samt ej täckt 6–4 på 12–17 hp.

- Regressionkontroll: svarshandens andra bud efter 1 i färg–1NT flyttat före generell tredje-/fjärde-färgsdispatch så 1♥–1NT–2♣–2♦ bedöms enligt 1NT-undantaget.

- Dispatchförfining: 1M–1NT–2NT går till den separata utgångsbedömningen (hp/fit); övriga återbud efter 1M–1NT går till respAfter1NT. Detta hindrar att 2NT-inviten felaktigt behandlas som ett svagt färgåterbud.

- Rättningsmotor uppdaterad till 9.7 efter tvåfärgsgrenens styrke- och dispatchkorrigering. Negativt test tillagt: 2♣ på lägsta nivå avvisas när handen kräver 3♣ med 18+ htp.

- Analysbibliotek 0.5.18: Splinter-grenar borttagna ur T34–T36; aktiva trädsnoder visar i stället ej täckt.


## Modulstatus (2026-11-17)

Ostörd budgivning är stängd för den verifierade omfattningen. CI: 31/31 ostörda tester, 34/34 svag-två-tester och samtliga temagivar-/reproducerbarhetstester godkända. Kvarvarande ospecificerade bud lämnas ej täckta; se avsnittet om spärrhöjningar 4m/4M ovan.
