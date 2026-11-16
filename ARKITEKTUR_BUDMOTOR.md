# Arkitektur för budmotorn – beslutad målbild

**Arbetsgren:** `work/undisturbed-architecture`  
**Bas:** `main` efter merge av PR #12  
**Omfattning i denna fas:** ostörd budgivning. Konkurrensbudgivning är pausad och ska bevaras oförändrad.

## 1. Grundprincip

Vi bygger inte fem separata regelträd för 4♠, 4♥, 5♦, 5♣ och 3NT. Dessa kontrakt är **mål och analysvyer**. Den faktiska budgivningen modelleras som ett gemensamt nätverk av budtillstånd, systembetydelser, handvillkor och beslut. Flera vägar kan leda till samma slutkontrakt och samma regel ska bara ha en auktoritativ definition.

Arkitekturen ska vara stegvis införbar. Befintlig rättningsmotor är fortsatt auktoritativ för systemets nuvarande automatiska bedömningar tills en uttrycklig, testad ersättning finns. Den här arkitekturbeskrivningen ger inte tillstånd att skriva om eller ändra budregler.

## 2. Kunskaps- och exekveringslager

1. **Kort- och handanalys** – validerar 52 unika kort, 13 kort per hand, färglängder, balans och rena handfakta. Beräknar separata mått: HP, HTP, HPS, STP och gemensam spelstyrka. Måtten får inte blandas ihop.
2. **Systembibliotek** – versionerade, källbelagda Nordisk Standard-regler och konventioner. Varje regel har entydig identitet, villkor, betydelse, källa, status och tester. Grundsystemets regler har företräde framför kompletterande analyser.
3. **Auktions-/tillståndsmodell** – en kanonisk lista av bud med giv, zon, givare, budgivare, bud och kontext. Härled vem som ska agera och om auktionen är avslutad. Budhistoriken är gemensam; varje beslut får bara använda information som spelaren faktiskt känner till.
4. **Budtolkning och inferens** – tolkar hela relevanta sekvensen, inte bara senaste budet. Härleder vad varje spelare har visat/förnekat och håller isär kända fakta, intervall och osäkerheter. Dolda händer får inte användas som beslutsunderlag under budgivningen.
5. **Besluts-/rättningsmotor** – jämför spelarens bud med de bud som är tillåtna och stöds av det fastställda systemet. Returnerar systemstatus, rekommendation, alternativ och motivering. Vid konflikt eller saknad regel markeras läget; ingen godtycklig prioritetsregel får väljas.
6. **Strategisk analys** – separat bedömning av kvaliteten hos ett i övrigt systemmässigt möjligt bud. Den får inte skriva över systemrättningen och ska märkas som strategisk/kompletterande med osäkerhetsnivå.
7. **Pedagogik och analysbibliotek** – förklarar betydelsen, handvillkoren, fortsättningar, alternativ och vanliga misstag. Biblioteksnoder är pedagogiska representationer av regler och auktionstillstånd, inte en parallell källa till budregler.
8. **Verifiering** – regel-, nod-, sekvens-, giv-, regressions- och täckningstester. DDS är en separat efterhandskontroll av stick och kontrakt, inte ett facit för vad som borde ha bjudits med dold information.

## 3. Gemensam datamodell

Varje regel-/analysobjekt ska på sikt kunna uttrycka:

- stabilt ID och versionsnummer;
- status: `systemregel`, `godkänd komplettering`, `kandidat`, `ej fastställd` eller `avvisad`;
- källa/referens och datum för beslut;
- sekvensmönster och vilken plats som ska agera;
- handvillkor per berörd spelare, med uttryckliga min/max-värden;
- vilka fakta som är synliga för den som agerar;
- betydelse, kravstatus, tillåtna fortsättningar och eventuella alternativ;
- konflikter/överlapp och uttrycklig prioritet om en sådan är dokumenterad;
- tester och kända luckor.

Auktionen lagras en gång. Träd och kontraktsvyer länkar till samma regel-/tillståndsobjekt i stället för att kopiera regler.

## 4. Bedömningsresultat hålls isär

Varje budposition ska kunna rapportera separata dimensioner:

- **Systemkorrekthet:** korrekt, felaktigt, valfritt eller ej täckt.
- **Handvillkor:** uppfyllda, inte uppfyllda eller okända.
- **Strategisk kvalitet:** separat analys, inte systemfacit.
- **DDS-efterkontroll:** teoretiskt stick-/kontraktsresultat med alla händer kända.

"EJ TÄCKT" är ett giltigt resultat och ska aldrig ersättas med en uppfunnen regel. Konflikter mellan lika relevanta regler ska redovisas som konflikter tills underlaget ger en prioritet.

## 5. Kontraktsmål som navigationslager

Vi använder följande kontraktsmål för att organisera täckningskartan:

- Högfärgsutgång: 4♥ och 4♠.
- Lågfärgsutgång: 5♣ och 5♦.
- Sangutgång: 3NT.
- Lillslam: 6♣/6♦/6♥/6♠/6NT.
- Storslam: 7♣/7♦/7♥/7♠/7NT.
- Delkontrakt och invit-/avböjningslägen.

Dessa mål är inte egna, isolerade regelträd. Varje mål ska kunna nås via alla relevanta öppningar och fortsättningar. 4NT måste tolkas utifrån kontext: exempelvis essfråga, RKC med fastställd trumf eller kvantitativ invit. Det är inte ett enda generiskt bud.

## 6. Nod- och nätverksprinciper

- En nod beskriver ett tydligt tillstånd eller en regel, inte en hel sekvenskedja som duplicerar andra regler.
- En nodmatchning måste kontrollera sekvens, agerande plats och relevanta handvillkor.
- Grenar pekar på stabila nod-ID:n. Terminala grenar ska ha en uttrycklig terminalorsak/status i den framtida modellen.
- Överlappande sekvenser ska länka till samma kanoniska nod eller uttryckligen deklarera varför de skiljer sig.
- En handprofil beskriver endast relevanta villkor; den får inte vara fri text när villkoret ska kunna maskinverifieras.
- Noder som beskriver flera alternativa bud måste ange villkoren för varje alternativ.
- Varje regel har en källa. Ingen regel får härledas enbart från DDS eller från att ett bud förekommer i en genererad giv.

## 7. Regler för handvärdering som ska bevaras

- HP: ess 4, kung 3, dam 2, knekt 1.
- Kortfärgs-/stödpoäng räknas endast när färgfit är etablerad och i färgkontrakt enligt handanalysunderlaget.
- Renons +3, singleton +2, dubbelton +1 per hand i sidofärg.
- Gemensam trumflängdsbonus: 9 trumf +1; 10 eller fler +2.
- Sang: endast HP; inga korthets- eller trumflängdspoäng.
- HP, HTP, HPS och STP är skilda mått. En regel ska uttryckligen ange vilket mått den använder.
- Void är inte singleton.

Dessa punkter är en återgivning av befintligt dokumenterat underlag, inte nya budöverenskommelser.

## 8. Avgränsning och arbetsordning

1. Inventera nuvarande rättningsmotor, analysbibliotek, dokumenterade regler och fasta testgivare.
2. Skapa en komplett karta över ostörd budgivning från öppning till slutbud, med kontraktsmål som täckningsvyer.
3. Märk varje område som verifierat, delvis täckt, ej täckt eller systemfråga.
4. Identifiera dubbleringar, felaktiga länkar, fria textvillkor och konflikter.
5. Föreslå en normaliserad nodmodell och migreringsordning.
6. Först därefter görs begränsade kodändringar, en del i taget, med regressionstester.

**Konkurrensbudgivning förblir pausad.** De befintliga konkurrensträden och dokumenterade luckorna bevaras, men ändras inte i denna fas. Main lämnas orörd; allt arbete sker på arbetsgrenen tills separat granskning och uttryckligt mergebeslut.

## 9. Första inventeringsfynd (2026-11-16)

Analysbiblioteket på basgrenen innehåller 45 träd och 271 noder. Av träden är 40 ostörda och 5 hör till pausad konkurrensbudgivning. Den maskinella strukturella kontrollen fann:

- 273 grenposter: 167 med nodmål och 106 utan nodmål.
- Inga dubbla nod-ID:n och inga grenar som pekar på ett saknat nod-ID.
- 26 sekvensnycklar förekommer i flera träd (28 extra förekomster). Detta är ett överlapp som måste klassificeras, inte automatiskt raderas.
- 8 noder saknar `handProfile`.
- T40 har ett `root`-värde som är en beskrivande mening och inte ett nod-ID.
- 176 noder saknar utgående grenar; många kan vara avsiktliga slutnoder men behöver klassificeras.

Detta är inventeringsresultat, inte ändringar i befintliga regler. Se `KARTA_OSTORD_BUDGIVNING.md` för täckningskartan och prioriterade granskningspunkter.

## 10. Särskild informationsgräns: livebud kontra efterhandsrättning

En genomgång av nuvarande `rattningsmotor.js` visar att vissa beslutsvägar använder partnerns faktiska hand, bland annat i `responderSecondBid()`, vissa invitkontroller i `nodeForRaw()` och den separata `missedGameOrSlam()`-kontrollen. Det kan vara avsiktligt för efterhandsrättning av en färdig giv, men får inte läcka in i en bot som agerar under pågående budgivning.

Därför ska systemet uttryckligen skilja mellan två exekveringskontexter:

- **Livebeslut:** den agerande spelarens egen hand + budhistorik + offentliga auktionsfakta + systemregler. Partnerns och motståndarnas faktiska kort är förbjudna som beslutsunderlag.
- **Efterhandsanalys:** får använda hela given för att diagnostisera missad utgång/slam eller jämföra kontrakt, men resultatet ska märkas som efterhandsanalys och får inte presenteras som ett bud som spelaren kunde veta var rätt vid beslutstillfället.

Samma regeldefinition kan återanvändas, men funktionens indata och resultat måste bära tydlig kontext. Inför inte detta som en snabb flagga utan att först kartlägga alla anrop och tester. Det är en prioriterad arkitekturgrind innan budmotorn används som självständig motståndare.


## Informationsgräns: livebud kontra efterhandsrättning (2026-11-16)

En separat kodgranskning har bekräftat att Öst–Väst-robotens nuvarande `botCall()` skickar hela given till `Rattning.nodeFor()`. Rättningsmotorn använder på flera ställen partnerns faktiska hand för att välja bud. Det innebär att robotens livebeslut kan påverkas av dold information. `nodeFor()` kan dessutom anropa `missedGameOrSlam()`, som uttryckligen räknar med båda faktiska händerna.

Detta måste separeras innan Buddie kan betraktas som en informationsmässigt korrekt bridgepartner. Se den detaljerade inventeringen, klassificeringen och migrationsplanen i [GRANSKNING_LIVE_OCH_EFTERHAND.md](GRANSKNING_LIVE_OCH_EFTERHAND.md).

**Bindande regel:** Livebeslut får endast använda egen hand och offentlig auktion. Efterhandsrättning får använda hela given, men dess slutsatser får aldrig återföras som om spelaren kunde ha känt till dem under budgivningen. Ingen ny budregel införs genom denna arkitekturgranskning.


## Nodmatchning och kanonisk nodmodell (2026-11-16)

Den aktuella analysmotorn matchar i huvudsak sekvensprefix och väljer den längsta träffen. Den kontrollerar inte nodens handprofil eller roll. Biblioteket och rättningsmotorn är två parallella strukturer utan fullständig verifierad nodkoppling. Inventeringen visar 40 ostörda träd, 241 noder och flera oklassificerade grenar. Se [GRANSKNING_NODMATCHNING.md](GRANSKNING_NODMATCHNING.md) för exakta mått, T40-root-felet, handprofilsluckor och föreslagen valideringsordning.
