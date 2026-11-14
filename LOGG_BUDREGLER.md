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
- Motorn bedömer att Syds pass missar 4♥: dess beräkning anger 27 spelpoäng och minst åttakorts hjärterfit. Detta är ett konkret test av svarshandens höjning/utgångsbedömning. Kontrollera manuellt om poängberäkningen och 4♥-rekommendationen stämmer med systemets exakta spelpoängsdefinition.

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
