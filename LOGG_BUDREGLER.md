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
