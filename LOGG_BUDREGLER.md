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


## Reverse och HPS – korrigering mot rättningsmallen

**Datum:** 2026-11-15  
**Status:** Implementerat och isolerat regressionstestat på `work/hps-reverse-audit`. `main` är inte ändrad.

Rättningsmallen i `Budtraning.html` anger:
- HP: E=4, K=3, D=2, Kn=1.
- STP räknas vid stöd eller med egen 6+-färg/5-5.
- HTP/HPS = HP + STP.
- Öppnarens stigande (reverse) budgivning kräver 18+ och minst 5-4.

Granskningen hittade två avvikelser i rättningsmotorn:
1. Reverse-detekteringen byggde på den lägsta budnivån i den nya färgen och kunde därför missa själva reversebudet på 2-nivån.
2. `h.htp(s2)` kunde ge STP för en 5-4-hand enbart på grund av korthet i sidofärger. Det strider mot rättningsmallens villkor för egen STP.

Ändring i `rattningsmotor.js`:
- Reverse identifieras när den nya färgen ligger över både öppningsfärgen och svarshandens färg; budet läggs på 2-nivån.
- Gränsen är 18+ HPS även när trumf inte är fastställd.
- HPS för egen hand beräknas enligt mallens formvillkor: STP för egen 6+-färg eller 5-5; en ren 5-4-hand får inte automatiskt STP.
- Under 18 HPS rekommenderas återbud i öppningsfärgen när handen har minst 5 kort där.

Nytt test: `tests/reverse-hps.test.js`. Fyra isolerade fall verifierades:
1. 18 HP och 5-4: reverse godkänns.
2. 17 HP och 5-4 med singelton/dubbelton: reverse underkänns; 2 i öppningsfärgen föreslås.
3. 17 HP och 6-4: STP enligt 6+-färgsregeln ger 20 HPS; reverse godkänns.
4. 17 HP och 5-5: STP enligt 5-5-regeln ger 20 HPS; reverse godkänns.

**Verifiering:** JavaScript-syntaxkontroll och samtliga tio isolerade regressionfall passerade mot version 6.6. Fullständig temagivar-/200-givarsregression återstår.

**Viktigt om GitHub-grenar:** Vid återstarten var `main` 90 commits före `feature/two-player-dds` (som fortfarande pekade på commit `f96e664`). Arbetet har därför startats från aktuella `main` i den nya grenen `work/hps-reverse-audit`. Varken `main` eller den äldre grenen har ändrats.


### Uppföljning – enhetlig HPS-visning

Vid fortsatt granskning upptäcktes att rättningsresultatets visade `htp`-värde fortfarande beräknades mot den senast bjudna färgen även när handen varken hade stöd, egen 6+-färg eller 5-5. Det kunde visa exempelvis 19 HTP för en 17 HP 5-4-hand, trots att dessa STP inte får räknas enligt mallen.

Detta är nu samlat i funktionen `handHps()`:
- Med stöd används stödpoäng i den stödda färgen.
- Utan stöd räknas STP endast med egen 6+-färg eller 5-5.
- En 5-4-hand utan stöd visar endast HP.

Regressionstesten kontrollerar nu även det visade HPS-värdet: 18, 17, 20 respektive 20 i de fyra fallen. Samtliga fyra fall passerar efter ändringen.


## Svarshöjningar och Stenberg – granskning mot regelsammanfattningen

**Datum:** 2026-11-15  
**Status:** Implementerat på `work/hps-reverse-audit`, verifierat med regressionstester. `main` är inte ändrad.

Granskning av den auktoritativa regelsammanfattningen i `Budtraning.html` visade att svarsfunktionens höjningsgränser låg en poäng för högt:
- 2 i högfärg/lågfärg: 6–9 HTP (tidigare upp till 10).
- 3 i högfärg/lågfärg: 10–12 HTP (tidigare från 11).

Detta är nu korrigerat i `resp1()`. Prioriteringen att visa 4+ högfärg före lågfärgsstöd är oförändrad. 13+ HTP med 4+ högfärgsstöd går till Stenberg 2NT före eventuell splinter.

En separat visningsavvikelse rättades också: vid Stenberg 2NT visades tidigare endast HP eftersom själva budet är sang. Nu hämtas stödpoängen från öppnarens färg när Stenbergsekvensen är identifierad. I övriga sekvenser räknas stödpoäng i visningen först när båda spelarna har bjudit samma färg; ett ensidigt färgbud/reverse räcker inte för att fastställa trumf.

### Regressionstester

`tests/reverse-hps.test.js` omfattar nu tio isolerade fall:
- Fem HPS/reverse-fall, inklusive skillnaden mellan 5-4, 6-4, 5-5 och faktisk 8-korts fit.
- 9 HTP med 4-korts högfärgsstöd: 2♥.
- 10 HTP med 4-korts högfärgsstöd: 3♥.
- 13+ HTP med 4-korts högfärgsstöd och singelton: Stenberg 2NT, inte splinter.
- 9 HTP med lågfärgsstöd utan 4-korts högfärg: 2♣.
- 10 HTP med lågfärgsstöd utan 4-korts högfärg: 3♣.

Samtliga tio fall passerar. JavaScript-syntaxkontroll passerar.

### Kvarstående precisering i källregeln

Regelsammanfattningen nämner även spärrhöjning till 4♥/4♠ (max 12 HTP) respektive 4♣/4♦ (max 9 HTP). Den anger däremot inte tillräckligt tydligt vilken minsta trumflängd/fördelning som skiljer dessa spärrhöjningar från vanliga 2-/3-höjningar. Den delen lämnas därför uttryckligen som ej fullständigt implementerad; ingen handvillkorsregel har hittats på.



## 100-givars smoke test – aktuella motorn

**Datum:** 2026-11-15  
**Underlag:** `bridge_100_deals_round2.json`, seed 20261115, 100 givare.  
**Motor:** `rattningsmotor.js` version 6.6 på `work/hps-reverse-audit`.

Alla 100 givare normaliserades från A/K/Q/J/T till 14/13/12/11/10 och kontrollerades för 52 unika kort och 13 kort per hand. Därefter kördes en reproducerbar självspels-/röksekvens: Norr och Syd använde motorns rekommendationer, Öst och Väst passade. Syftet var att hitta krascher, olagliga rekommendationer och otillräckligt täckta tillstånd – inte att använda motorns egna bud som oberoende facit.

Resultat:
- 100/100 givare hade korrekt kortintegritet.
- 100/100 auktioner avslutades.
- 759 budpositioner behandlades.
- 362 bedömda turer för Norr/Syd.
- 357/362 turer hade en uttrycklig rekommendation: **98,6 % täckning** i just denna testkörning.
- 5 turer var ej täckta.
- 0 undantag/krascher.
- 0 olagliga kontraktsbud rekommenderade.

De fem ej täckta fallen är sparade som nästa analyskö:
- Giv 110: svarshandens andra bud efter 1 i färg, efter 1♣–1♠–2♦–3♣.
- Giv 115: fortsättning efter 1NT–2♠–3♣–3♦.
- Giv 150: fortsättning efter partnerns spärröppning 4♣.
- Giv 174: fortsättning efter 1♥–2♥–2♠.
- Giv 191: fortsättning efter 1♥–1♠–2♥–3♥.

**Begränsning:** Detta är ett tekniskt täcknings-/rökprov där motståndarna alltid passar. Det bevisar inte att varje rekommendation är bridgekorrekt. De fem luckorna ska granskas mot systemreglerna innan ny logik läggs till.


### Uppföljning – öppnarens återbud efter 1M–2M

Samma jämförelse mot regelsammanfattningen visade att `reb1()` använde gränserna 16+ för invit/ny färg och 19+ för utgång. Källregeln anger däremot:
- 17–19 HTP: 3M naturlig invit utan singel.
- 17–19 HTP: ny färg när handen har singel i den bjudna färgen.
- 20+ HTP: utgång.

Gränserna är nu korrigerade till pass upp till 16, invit/ny färg från 17 och utgång från 20. Fyra nya regressionstester täcker 16, 17 med singel, 17 utan singel och 20 HTP. Samtliga passerar.

Testsviten `tests/reverse-hps.test.js` omfattar nu **14 isolerade fall** och passerar med aktuell motor.



### Omkörning efter svarshöjnings- och återbudsfixarna

100-givars smoke-testet kördes om efter de senaste ändringarna. Samma seed och givmaterial användes.

- 100/100 givare med korrekt kortintegritet.
- 100/100 auktioner avslutades.
- 757 budpositioner behandlades.
- 361 bedömda turer för Norr/Syd.
- 357 täckta och 4 ej täckta: **98,9 % täckning**.
- 0 undantag/krascher och 0 olagliga kontraktsbud.

Giv 174 är nu täckt efter korrigeringen av 17–19 HTP-gränsen efter 1♥–2♥. Kvar som ej täckta i denna körning är giv 110, 115, 150 och 191. Testet är fortfarande ett rök-/täckningsprov med passande motståndare, inte ett oberoende korrekthetsfacit.


### Uppföljning – öppnarens svar efter Stenberg 2NT

En ny kontroll mot Stenberg-regeln hittade ytterligare en gränsavvikelse:
- Källregeln anger 3M med 15+ HTP utan singel.
- 3NT är 12–14 hp med balanserad hand.
- En singel ska visas med färgbud på 3-nivån.

Motorn använde tidigare 16+ HTP för 3M och kunde dessutom välja 3NT för en obalanserad hand utan singel. Detta är korrigerat:
1. Singel visas först, även när handen samtidigt har 15+ HTP.
2. Utan singel visas 3M från 15 HTP.
3. 3NT används bara för balanserad hand med 12–14 hp.
4. Obalanserad minimumhand utan singel lämnas ej täckt i stället för att få ett påhittat bud.

Fyra nya regressionstester täcker 15 HTP utan singel, balanserad 14 hp, 15+ HTP med singel samt obalanserad minimum utan singel. Den totala isolerade testsviten omfattar nu **18 fall**, samtliga passerar.


## Första fasta temagivaruppsättningen – 140 givare

**Datum:** 2026-11-15  
**Status:** Genererad, validerad och incheckad på `work/hps-reverse-audit`.

Jag återanvände den befintliga deterministiska generatorn i `Budtraning.html` i stället för att hitta på nya givvillkor. Resultatet är 10 unika givare per vart och ett av de 14 träningstemana:
- 12 vanliga teman: 7 störda och 3 ostörda givare per tema.
- Dubbling och inkliv: 10 störda givare per tema, eftersom störning är själva temat.

Alla 140 givare klarade kontroll av 52 unika kort, 13 kort per hand, temavillkor, lägesvillkor och global unikhet. Källfilen är `testdata/temagivare_140.json`; manifestet är uppdaterat.

### Första motorbaslinjen

Korrigeringsmotorn kördes mot alla 140 givare. N/S använde `Rattning.nodeFor`; E/V använde appens befintliga `botCall` i störda lägen och passade i ostörda lägen. Detta är ett täcknings- och tekniskt säkerhetsprov, inte ett oberoende facit för bridgekorrekthet.

- 140/140 auktioner avslutades.
- 590 bedömda turer för N/S.
- 515 täckta och 75 ej täckta: **87,3 % total täckning**.
- Ostört läge: 174/174 täckta (**100 %**).
- Stört läge: 341/416 täckta (**82,0 %**).
- 0 undantag/krascher och 0 olagliga kontraktsbud rekommenderade.

Täckning per tema:
- 100 %: NT, 2♣, RKC, sangslam och inviter.
- 90,9 %: färgslam.
- 89,7 %: svaga öppningar/spärr.
- 78,4 %: Stenberg.
- 66,7 %: trumfstöd.
- 65,2 %: alla slags givar.
- 60,9 %: inkliv.
- 47,1 %: upplysningsdubbling.

De 75 luckorna är sparade med giv-ID, auktion, hand och motivering i `testdata/temagivare_140_baseline.json`. De största grupperna gäller konkurrensbudgivning: motståndarnas inkliv, flera motståndsbud och återbud efter att partnern passat. Ostört läge är redan helt täckt i denna körning.

### Nästa prioritering

1. Täcka konkurrensfortsättningar efter inkliv och dubbling utan att hitta på regler utanför systemunderlaget.
2. Fördjupa Stenberg- och trumfstödssekvenser där motståndarna stör.
3. Gå igenom de 8 handtypsluckorna mot regelsammanfattningen.
4. Köra samma fasta 140 givare efter varje ändring och jämföra mot baslinjen.

Regressionstestfilen `tests/reverse-hps.test.js` omfattar nu **19 isolerade fall**, samtliga passerar.


## Svar efter partnerns inkliv – regelgranskning och korrigering

En genomgång av de ej täckta fallen i 140-givarsbaslinjen ledde till en direkt jämförelse mellan `respOvercall()` och systemunderlaget. Motorn hade fel intervall för sangsvar och stödhöjningar och saknade naturliga färgsvar samt hoppande färgsvar.

Funktionen är nu omarbetad enligt de uttryckliga systemreglerna:
- 1NT: 8–10 hp, balanserad hand och håll.
- 2NT: 11–13 hp, balanserad hand och bra håll.
- 3NT: 14+ hp, balanserad hand och bra håll.
- Enkel/dubbel/trippel höjning: 6–9 hp med 3/4/5-korts stöd.
- Ny färg: 8+ hp och 5+ kort om lägsta budet ligger på 1-nivån; 10+ hp om det krävs 2-nivån.
- Hopp i ny färg: 14+ hp och bra 6+-färg, utgångskrav.
- Överbud: 10+ hp och 3+ stöd.
- Pass när inget av systemets uttryckliga svarsvillkor uppfylls.

Tio nya regressionstester täcker stödhöjningar, 1NT/2NT/3NT, ny färg på 1- och 2-nivån, hoppande färgbud, överbud och pass. Den isolerade sviten omfattar nu **30 testfall**, samtliga passerar.

### 140-givarsbaslinje efter ändringen

- Täckning: 522/596 turer (**87,6 %**), tidigare 515/590 (**87,3 %**).
- Ej täckta turer: 74, tidigare 75.
- Ostört: fortsatt 100 %.
- Stört: 348/422 turer täckta (**82,5 %**); inklivstemat förbättrades från 60,9 % till 83,3 %.
- 0 krascher och 0 olagliga kontraktsbud.

Baslinjefilen har uppdaterats med aktuell motorversion och samtliga kvarvarande luckor. Att totalprocenten bara ökar marginellt beror på att nya korrekta svar förändrar auktionernas fortsättning och därmed blottlägger andra ännu ej beskrivna konkurrenssekvenser. De nya buden är inte tillagda enbart för att höja täckningsprocenten; de följer systemunderlaget.


## Svar på upplysningsdubbling – gränser korrigerade

Jämförelsen mot den uttryckliga UD-regeln visade att `respDouble()` hade flera felaktiga intervall och saknade rätt budprioritering. Den är nu uppdaterad:
- 1NT 6–9 hp med håll.
- 2NT 10–12 hp med håll.
- 3NT 13+ hp med håll.
- 0–7 hp: färg på lägsta nivå, även med bara 3 kort.
- 8–9 HTP: hopp i färg med 4+ kort.
- 10–12 HTP: hopp till 3-nivån, helst 5+ kort.
- 10+ hp: överbud i motståndarnas färg, krav.
- Straffpass endast med lång och bra färg i öppningsfärgen.

Åtta nya regressionstester täcker dessa svar. Den totala testsviten omfattar nu **38 fall**, samtliga passerar.

### Uppdaterad 140-givarsbaslinje

- 522/595 turer täckta (**87,7 %**), 73 ej täckta.
- Ostört: 174/174 (**100 %**).
- Stört: 348/421 (**82,7 %**).
- 140/140 auktioner avslutade.
- 0 krascher och 0 olagliga kontraktsbud.

Dubblingstemat ligger fortfarande på 47,1 %. Granskningen av kvarvarande exempel visar att många luckor gäller **dubblerarens återbud efter partnerns färgsvar** eller **fortsättningen när motståndarna dubblar vår öppning**. Dessa fortsättningar är inte definierade i den aktuella UD-regeln; de ska därför inte fyllas med antaganden.


### Formell auktionvalidering av samtliga 140 givare

Efter täckningskörningen kördes även `Rattning.validateAuction()` på varje färdig auktion:
- 140/140 auktioner giltiga.
- 0 turordningsfel.
- 0 olagliga kontraktsbud.
- 0 ogiltiga dubblingar/redubblingar.
- 0 undantag.

Detta kompletterar täckningsmåttet: de ej täckta buden är regel-/sekvensluckor, inte felaktigt konstruerade auktioner.


## Inkliv och försvar mot spärr – öppningsbuden korrigerade

Ytterligare en jämförelse mellan `overcall()` och systemunderlaget visade flera avvikelser:
- 1-nivåns enkla inkliv ska kunna bjudas med 10+ hp och bra 5+ färg.
- 2-nivåns enkla inkliv kräver 12–17 hp och minst 6 kort.
- Upplysningsdubbling kräver 12+ hp och 3+ kort i alla objudna färger; den ska inte dessutom kräva högst två kort i öppningsfärgen.
- 17+ hp ger dubbling oavsett fördelning, med det särskilda undantaget att 1NT 15–17 hp balanserad med håll prioriteras.
- Hoppande inkliv: 6–10 hp och 6+ färg.
- Mot spärröppning: 2NT 16–18 hp balanserad; dubbling med UD-form eller 17+ hp.

Dessa gränser och prioriteringar är nu korrigerade. Även ett fel i kontrollen av objudna färger vid försvar mot spärr är rättat. Nio nya regressionstester tillkom; testsviten omfattar nu **47 fall**, samtliga passerar.

### Ny 140-givarsbaslinje

- 536/604 turer täckta (**88,7 %**), tidigare 522/595 (**87,7 %**).
- 68 ej täckta turer, tidigare 73.
- Stört läge: 362/430 (**84,2 %**).
- Ostört läge: fortsatt 174/174 (**100 %**).
- 140/140 auktioner avslutades och godkändes av `validateAuction`.
- 0 krascher, 0 olagliga kontraktsbud och 0 valideringsfel.

Inklivstemat ligger nu på 83,3 % och trumfstöd på 68,4 %. Dubblingstemat ligger kvar på 47,1 % eftersom de återstående exemplen främst kräver fortsättningsregler efter dubblerarens första svar, inte själva inklivs-/dubblingsbeslutet.


### Kvarvarande luckor – fördelning

De 68 ej täckta turerna i senaste 140-givarsbaslinjen är samtliga i störda lägen:
- 28: motståndarna har klivit in efter att vår sida börjat bjuda.
- 16: partnern har passat efter vår senaste budgivning; vi får en ny tur.
- 13: motståndarna har hunnit bjuda flera gånger.
- 10: ytterligare varianter av motståndarinblandning.
- 1: annan odokumenterad fortsättning.

Det bekräftar att ostörd budgivning och de flesta grundsvar nu är väl täckta. Nästa stora utvecklingsområde är uttryckliga konkurrenssekvenser. Jag håller dessa luckor separata från regelkorrigeringarna: vi ska inte höja täckningen genom att hitta på svar som inte finns i systemunderlaget.


## Poängmodell och reverse – återkontroll mot den senast fastställda rättningsmallen

Återkontrollen mot de uttryckliga besluten från 2026-11-15 hittade två avvikelser och en saknad gränskontroll.

### Gemensamma spelpoäng
- 8 trumf: ingen trumflängdsbonus.
- 9 trumf: +1.
- 10 eller fler trumf: **+3** (motorn hade felaktigt +2).
- Fördelningspoäng räknas bara när minst 8 gemensamma trumfkort är fastställda.
- I sang räknas endast HP, även vid 3NT, 6NT och 7NT.

Poängfunktionen är korrigerad. Fyra direkta regressionstester täcker 8-, 9- och 10-kortsfit samt sang utan fördelningspoäng.

### Reverse
Rättningsmallen säger:
- Minst 18 HPS.
- Minst 5 kort i öppningsfärgen och minst 4 i den nya färgen.
- Den nya färgen ska vara högre rankad än öppningsfärgen och svarsfärgen.
- Trumfen behöver inte vara fastställd.
- En 5-4-hand utan stöd räknar endast HP; HTP får inte skapas av en obekräftad 4-kortsfärg.

Motorn krävde tidigare bara sammanlagt 9 kort i de två färgerna. Det kunde felaktigt godkänna 4-5 som reverse. Nu krävs uttryckligen 5-4 i rätt riktning. Ett 4-5-läge går i stället till lägsta naturliga färgbud och får inte felaktigt hoppa som reverse.

Fem nya/utökade regressionstester täcker dessa poäng- och reversegränser. Testsviten omfattar nu **52 fall**, samtliga passerar.

### Omkörning av fasta testgivare
140-givarsbaslinjen har körts om med motor 6.7:
- 536/604 budpositioner täckta (**88,7 %**).
- 68 ej täckta, oförändrat eftersom ändringarna gäller poänggränser och reverse-form.
- 174/174 ostörda positioner täckta.
- 140/140 auktioner avslutade och validerade.
- 0 undantag, 0 olagliga kontraktsbud och 0 valideringsfel.

Baslinjen är uppdaterad med aktuell motor-SHA. Ändringarna ligger fortsatt på `work/hps-reverse-audit`; `main` är orörd.


### Förtydligande av 1-nivåns inkliv

Den fullständiga systemtexten i appen preciserar att 10+-undantaget gäller **1-nivåns högfärgsinkliv med bra 5+-färg**. Det gäller inte ett inkliv i lågfärg. Jag justerade därför logiken:
- 1♥/1♠: 10+ hp med bra 5+-färg.
- 1♣/1♦: normalgränsen 12+ hp, minst 5 kort.
- 2-nivå: 12+ hp och minst 6 kort.
- 17+ hp hanteras enligt den separata UD-regeln och dess prioritet.

Två nya regressionstester verifierar skillnaden mellan 1-lägets högfärg och lågfärg. Testsviten är nu **54/54 godkänd**. 140-givarskörningen är upprepad: 88,7 % täckning, 0 krascher och 140/140 giltiga auktioner.


## Kompletterande kunskapslager – första handvillkorsstyrda kandidater

För att hantera luckor i konkurrensbudgivningen utan att förvandla förslag till grundsystemregler har `kompletterande_budlogik.json` byggts ut till version 0.2.0.

Fem kandidater för sekvensen 1♥–Dbl har strukturerats från det befintliga analysbibliotekets T33:
- Redubbling med cirka 10+ hp och normalt utan hjärterstöd.
- 2♥ med 3+ stöd och cirka 6–9 hp.
- 3♥ som spärrande hoppstöd med normalt 4+ hjärter och 0–6 hp.
- 1♠ med 5+ spader och cirka 6+ hp.
- 1NT med jämn hand, cirka 6–10 hp och normalt utan 3+ hjärter.

Alla fem är uttryckligen märkta `unreviewed`, `supplementary_only` och `must_not_override`. De påverkar inte rättningsmotorns grundregler och får inte användas som automatiskt facit.

I `analysmotor.js` finns nu en separat matchare som:
- kräver exakt aktuell budsekvens och rätt nästa spelare;
- kontrollerar HCP, färglängder och jämn fördelning mot strukturerade handvillkor;
- använder endast den aktuella budgivarens hand, inte dolda kort;
- returnerar samtliga matchande kandidater med osäkerhet och granskningsstatus.

Ett avsiktligt överlapp mellan 1♠ och 1NT för jämna händer med fem spader dokumenteras i stället för att en prioritet hittas på. Sex nya tester täcker kandidaterna och matchningen. Grundmotorns 54 regressionstester är oförändrade.

Detta är ett första separat analyslager, inte en ändring av de 140 givarnas grundsystemstäckning.


### Sista gränstestet för hoppinkliv

Ett ytterligare test verifierar den uttryckliga regeln för hoppinkliv: 6–10 hp och en bra sexkortsfärg. Testet passerar. Grundsystemets regressionstestsvit är nu **55/55 godkänd**; de sex testerna för det separata kompletterande kunskapslagret är fortsatt godkända.


### Kandidatmatchning visas separat i givargranskningen

Den handvillkorsstyrda kompletterande matcharen är nu ansluten till granskningsvyn efter avslutad giv. Den visar endast kandidater när grundmotorn markerat den aktuella budpositionen som ej täckt. Varje förslag märks tydligt som ej godkänt och visar faktisk budgivning, kandidat, alternativ, osäkerhet och källa. Grundsystemets automatiska rättning ändras inte.

Matchningen fungerar även när givaren har passat före öppningsbudet; den söker efter den relevanta sekvensen i slutet av den aktuella budhistoriken. Sju tester för det kompletterande lagret passerar.


### Tvetydigheter i kompletterande svar efter 1♥–Dbl

Matcharen har nu uttryckliga tester för tre överlapp som finns i det befintliga analysunderlaget:
- Exakt 10 hp kan passa både redubbling och balanserat 1NT.
- Exakt 6 hp med 4+ hjärter kan passa både enkelhöjning 2♥ och spärrande 3♥.
- En jämn hand med 5 spader kan passa både 1♠ och 1NT.

Dessa har inte lösts genom påhittad prioritering. Matcharen visar samtliga kandidater och noterar att överenskommelsen saknar prioritet. Det kompletterande lagret har nu **9/9 godkända tester**.


## Utökning av kompletterande konkurrensbudgivning

Analysbibliotekets befintliga träd T29–T32 har nu också omvandlats till strukturerade kandidater:
- 1♥–(1♠): höjning, cue-bid, spärrstöd, 1NT med spaderhåll och egen ruterfärg.
- 1♠–(2♥): höjning, cue-bid, spärrstöd, 2NT med hjärterhåll och egen klöverfärg.
- 1♦–(1♠): ruterstöd, cue-bid, spärrstöd, 1NT med spaderhåll och egen klöverfärg.
- 1♣–(1♥): klöverstöd, cue-bid, spärrstöd, naturlig spader och 1NT med hjärterhåll.

Det kompletterande lagret innehåller nu **25 kandidater** (5 efter 1♥–Dbl och 20 efter fyra naturliga inklivsekvenser). Alla är fortfarande `unreviewed` och får inte skriva över grundsystemet. Matcharen kontrollerar nu även stoppare med samma grundprincip som rättningsmotorn (E, Kx, Qxx, Jxxx).

Testerna omfattar nu **15 fall** för det kompletterande lagret. De kontrollerar bland annat stöd, färglängd, styrka, jämn fördelning, stoppare och att sangbud utan stoppare inte matchar.


## Konkurrensbudgivning och Stenberg – fördjupad revision 2026-11-15

Den här omgången har fortsatt enbart med punkterna 1 och 2 i utvecklingsplanen. Spelmotorn där Syd spelar mot en människa är uttryckligen pausad; fokus ligger på att få Öst/Väst-roboten och den gemensamma rättningsmotorn stabila först.

### A. Konkurrensbudgivning – regler som saknas i REF ska inte godkännas

- Negativ dubbling efter en naturlig färgöppning fanns tidigare klassad som grundsystemregel. Den regeln finns inte i REF. Motorn markerar nu sekvensen som ej täckt i stället för att automatiskt godkänna dubblingen.
- En öppnares dubbling efter motståndarinkliv och partnerpass (reopening-/stöddubbling) är inte heller definierad i REF. Den godkänns inte längre som en automatisk stöddubbling.
- Efter motståndarinkliv över 1NT kontrolleras nu 5+ kort innan ett naturligt färgbud ens kan övervägas. Exakt invit-/utgångsstyrka för dessa färgbud är inte numeriskt definierad i REF, så motorn markerar dem som ej täckta i stället för att godkänna varje faktiskt bud.
- Upplysningsdubbling efter 1NT kräver 3+ kort i samtliga objudna färger. Eftersom den exakta styrkegränsen för ”minst invit” saknas i REF lämnas den automatiska rekommendationen ej täckt.
- Svar efter upplysningsdubbling: 0–7 hp ska bjuda den billigaste objudna färgen, även med bara tre kort. Motorn valde tidigare den längsta färgen; detta är rättat.
- 1NT/2NT/3NT efter upplysningsdubbling kräver håll och respektive hp-intervall. REF anger inte ett separat krav på balanserad hand, så det extra balanskravet är borttaget.
- För 8–9 respektive 10–12 HTP söks nu bland alla objudna färger som faktiskt uppfyller både poäng- och längdvillkoren, i stället för att bara kontrollera den längsta färgen.

### B. Öppnarens andra bud efter 1M–2M

- En void är inte en singel. 17–19 HTP utan någon singleton ska ge 3M-invit; motorn räknade tidigare void som singel och kunde visa fel sidofärg.
- En singleton i exakt en sidofärg visas på 3-nivån.
- Om handen har singleton i flera sidofärger anger REF ingen prioritet. Råmotorn lämnar då situationen ej täckt i stället för att välja första färgen i intern färgordning.
- 20+ HTP ger utgång; 16 HTP stannar på passnivå enligt befintliga gränstester.

### C. Stenberg

- Stenberg 2NT med 13+ HTP och 4+ stöd har fortsatt prioritet framför splinter.
- En singleton visas på 3-nivån före 15+ HTP-återbudet i öppningsfärgen.
- 15+ HTP utan singleton visas med 3M.
- 12–14 hp balanserad hand visas med 3NT.
- Obalanserad minimumhand utan singleton lämnas ej täckt.
- Flera singletonfärger utan angiven prioritet lämnas ej täckta i råmotorn. Den separata kontrollen för 26+ gemensamma spelpoäng kan fortfarande föreslå utgång när Stenberg är utgångskrav.

### D. Svaga tvåöppningar – korrigerade svar och återbud

- Ny färg med 5+ kort är krav till minst 3 i öppningsfärgen; det tidigare påhittade 15 hp-kravet är borttaget.
- 2NT är invit med 9–10 hp och minst 2 korts stöd.
- 3 i öppningsfärgen är spärrande med 3+ stöd, inte en invit.
- Svag hand utan stöd eller egen 5+ färg passar.
- Efter 2NT-invit visar öppnaren 6–8 hp med 3 i öppningsfärgen; med 9–10 hp blir det 4 i högfärg eller 3NT efter lågfärgsöppning. Ett felaktigt 4♦-återbud efter 2♦ är därmed borttaget.
- Om svarshanden bjuder en ny färg är öppnarens exakta återbud inte specificerat i REF. Motorn godkänner inte pass men hittar inte på ett nytt bud.

### E. Testdata och verifiering

Fyra tidigare svaga-två-givare uppfyllde inte längre temavillkoren när den felaktiga gamla svarshöjningen togs bort. De har ersatts deterministiskt med nya seeds:
- svag-02: 93000000
- svag-05: 93000001
- svag-09: 93000002
- svag-10: 93000003

Samtliga 140 testgivare är åter validerade: 52 unika kort, 13 kort per hand, tema- och lägesvillkor uppfyllda.

Aktuell motor: **7.0**.
- Grundsystemets regressionstester: **73/73**.
- Kompletterande matchartester: **15/15**.
- 140/140 auktioner avslutade och godkända av auktionsvalidatorn.
- 0 undantag, 0 olagliga kontraktsrekommendationer.
- 605 bedömda N/S-turer: 533 täckta, 72 ej täckta (**88,1 %**).
- Ostörd budgivning: 170/170 täckt (**100 %**).
- Störd budgivning: 363/435 täckt (**83,4 %**).

Täckningsprocenten är inte direkt jämförbar med föregående baslinje eftersom fyra testgivare har bytts ut efter att deras gamla svaga-två-svar inte längre uppfyllde REF. De kvarvarande luckorna är huvudsakligen konkurrensfortsättningar som inte finns i REF; de ska inte fyllas med gissningar.


### Slutlig omkörning efter att flera 5+ färger gjorts ej täckta

En extra gränskontroll visade att en svag-två-givare hade två egna 5-kortsfärger. Eftersom REF inte anger prioritet mellan dem lämnas den situationen nu ej täckt i stället för att färgordningen i koden avgör. Därför ersattes även svag-02 en gång till, med seed **93000004** (de övriga tre ersatta givarna behåller 93000001–93000003).

Slutlig verifiering mot motor 7.0:
- Grundsystemets regressionstester: **74/74**.
- Kompletterande analystester: **15/15**.
- 606 N/S-positioner: 535 täckta, 71 ej täckta (**88,3 %**).
- Stört: 365/436 (**83,7 %**); ostört: 170/170 (**100 %**).
- 140/140 giltiga och avslutade auktioner; 0 undantag och 0 olagliga rekommendationer.


## Slutlig komplettering: dubblerarens återbud efter upplysningsdubbling

Vid genomgång av REF-raden om upplysningsdubbling hittades en uttrycklig regel som saknades i motorn: **utan stöd får dubbleraren bjuda egen färg eller sang först med 18+ hp**.

Detta är nu implementerat i den faktiska återbudsturen efter att partnern har svarat på upplysningsdubblingen:
- Utan 3+ stöd i partnerns svarsfärg och under 18 hp: pass rekommenderas i stället för egen färg/NT.
- Utan stöd och 18+ hp: egen färg/NT kan godkännas.
- Med 3+ stöd i partnerns svarsfärg: återbudet lämnas ej täckt eftersom REF inte anger hur dubbleraren ska fortsätta med stöd.
- Om handen har 18+ hp utan stöd men spelaren passar, lämnas exakt återbud ej täckt; REF anger styrkekravet men inte vilken färg/NT som ska väljas.

Fyra riktade regressionstester täcker 18 hp-gränsen och stödgränsen. Grundsviten är nu **78/78**.

### Slutlig motor 7.1-baslinje
- 140 givare, alla tema-/lägesvaliderade.
- 606 N/S-positioner: **538 täckta, 68 ej täckta (88,8 %)**.
- Stört: 368/436 (**84,4 %**).
- Ostört: 170/170 (**100 %**).
- Dubblingstemat förbättrat från 47,1 % till **55,9 %**.
- 140/140 auktioner avslutade och validerade.
- 0 undantag och 0 olagliga kontraktsrekommendationer.
- Kompletterande matchare: 25 kandidater, 15/15 tester.

Kvarvarande luckor domineras av motståndarinblandning och partnerpass där REF saknar fortsättningsregler. De ska inte fyllas med antagna standardkonventioner.


## Pausad konkurrensbudgivning – överlämning (2026-11-15)

Konkurrensbudgivningen är pausad på användarens uttryckliga beslut. De kvarvarande ej täckta störda sekvenserna sparas som öppet arbete och ska inte lösas genom gissningar. Den senaste blandade baslinjen hade 68 ej täckta positioner, samtliga i störd budgivning; ostörd budgivning var 170/170 (100 %). De återstående orsakerna är främst motståndarnas inkliv efter vår öppning, partnerpass följt av fortsatt konkurrens, upprepade motståndarbud, svaga tvåor och dubblerarens återbud med stöd.

Arbetet fortsätter på `work/undisturbed-validation` separat från konkurrensspåret. `work/hps-reverse-audit` bevaras som tidigare arbetsgren och `main` ändras inte.

## Synkronisering av ostörd logik och analysnoder (2026-11-15)

- Korrigerad gemensam trumflängdsbonus: 9 gemensamma trumfkort = +1; 10 eller fler = +2. Kortfärgspoäng (renons +3, singel +2, dubbelton +1 per hand) räknas separat i färgkontrakt med minst 8 gemensamma trumfkort. Sang ger inga sådana poäng.
- Analysbiblioteket uppdaterat med Stenberg 2NT och återbud efter 1M–2M enligt motorversion 7.1.
- Flera singletonfärger utan dokumenterad prioritet ger ingen automatisk rekommendation. Void är inte singleton.
- Ännu ej verifierat: ny ostörd 140-givarskörning efter ändringen. Den ska dokumenteras först när CI/körning har bekräftat resultatet.


## 1♥/1♠ till utgång och RKC 4NT – pågående arbete (2026-11-15)

Utvecklingsspåret `feature/one-major-to-game-4nt` har startats från aktuell `main`. Arbetet omfattar ostörd budgivning efter 1♥ och 1♠, från svarshandens första bud via öppnarens återbud och svarshandens fortsättning till utgång eller 4NT med överenskommen trumf. Störd budgivning är fortsatt pausad.

### Första verifierbara ändringen
- Rättat en verklig konventionskonflikt: analysbiblioteket angav RKC 1430, men `rkcReply()` i rättningsmotorn svarade enligt 0314.
- Motorn använder nu RKC 1430 när trumf är fastställd: 5♣ = 1/4 nyckelkort, 5♦ = 0/3, 5♥ = 2 utan trumfdam, 5♠ = 2 med trumfdam.
- Tagit bort motorns odokumenterade 5NT-svar för 3 nyckelkort och renons från den här svarsmappningen; det ingår inte i den dokumenterade 1430-överenskommelsen.
- Förtydligat att 2NT efter 1♥/1♠ är Stenberg (13+ HTP och minst fyra korts stöd), inte Jacoby. Void räknas inte som singleton.
- Befintligt hjärterträd T01 har korrigerats till Stenberg/RKC 1430. Nytt spaderträd T44 beskriver motsvarande sekvens efter 1♠.
- Lagt till sex riktade regressionstester som kontrollerar 1-, 4-, 0- och 3-nyckelkort samt två nyckelkort med/utan trumfdam.
- CI har utökats så att dessa tester körs på arbetsgrenen.

### Kvar att göra i detta spår
- Täcka samtliga svar efter 1♥/1♠, inklusive stöd, 1 över 1, 2 över 1, 1NT, Stenberg och spärrhöjningar.
- Slutföra öppnarens och svarshandens fortsättningar efter 1 över 1 fram till utgång; komplettera luckor i T39/T40.
- Slutföra svarshandens fortsättningar efter Stenbergåterbuden i T34.
- Kontrollera RKC 1430 genom hela auktionen, inklusive frågeställarens fortsättning efter 5♣/5♦/5♥/5♠. Slamval ska inte hittas på där kontrollinformation saknas.
- Köra riktade handprofiler och 100 deterministiska ostörda givare med 1♥/1♠ som tema, och redovisa täckning, felbud, olagliga bud och undantag separat.

Detta är en del-leverans på arbetsgren; den är inte mergad till `main`. Ingen ny täckningsprocent hävdas innan testerna har körts.

- En riktad CI-körning hittade dessutom att den generella slutbudskontrollen behandlade partnerns 4NT som ett färdigt sang-/utgångsbud och därför svarade Pass innan RKC-svarsfunktionen nåddes. Kontrollen är nu justerad: 4NT med fastställd trumf går vidare till RKC-svar.
