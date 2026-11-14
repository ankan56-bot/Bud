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
