# Karta över ostörd budgivning

**Datum:** 2026-11-16  
**Arbetsgren:** `work/undisturbed-architecture`  
**Källa:** aktuell `main`-bas efter PR #12, befintlig `rattningsmotor.js`, `analysbibliotek.json`, `HANDANALYSUNDERLAG.md`, `LOGG_BUDREGLER.md` och befintliga testfiler.

## 1. Hur kartan ska läsas

Kontrakten 4♥, 4♠, 5♣, 5♦ och 3NT är målkontrakt, inte fem separata budsystem. Kartan organiserar alla vägar dit efter öppningsfamilj och budgivningsfunktion. Ett område kan därför bidra till flera mål.

Status:
- **Befintligt:** det finns kod/noder och tester för åtminstone en del av området.
- **Delvis:** strukturen finns men viktiga fortsättningar eller handvillkor saknas/är oklara.
- **Ej kartlagt:** området behöver inventeras mot rättningsmotorn och systemunderlaget innan status kan sättas.
- **Pausat:** konkurrensbudgivning; lämnas orörd.

## 2. Öppningsfamiljer – övergripande karta

| Öppning/familj | Huvudområden | Nuvarande underlag | Status |
|---|---|---|---|
| 1♣ | Svar, 1 över 1, 2 över 1, återbud, stöd, sang, starka fortsättningar | T36–T40, T37, T41; rättningsmotorns öppnings-/svarsfunktioner | Delvis – låg öppningsfärg och lågfärgsutgång kräver särskild kontroll |
| 1♦ | Svar, 1 över 1, 2 över 1, återbud, stöd, fjärde färg | T36–T40, T37, T38–T40 | Delvis |
| 1♥ | Svar, höjningar, 1NT, Stenberg, återbud, invit, utgång, RKC | T01, T10, T14, T16, T21, T34–T40 | Delvis – Stenberg-/RKC-fortsättningar och flera gränsfall kvarstår |
| 1♠ | Svar, höjningar, 1NT, Stenberg, återbud, invit, utgång, RKC | T15, T22, T34–T40, T44–T45 | Delvis – motsvarande fortsättningar och gränsfall kvarstår |
| 1NT | Direkt 3NT, Stayman, överföringar, inviter, svagt lågfärgsrelä, 4NT | T03–T09, T17–T20, T23–T28, T42–T43 | Delvis – dokumenterad lucka i obalanserad Stayman-fortsättning och superacceptfortsättningar |
| 2♣ stark | 2♦ väntesvar, öppnarens återbud, svarshandens fortsättningar | T41 | Delvis – bara de uttryckligen dokumenterade grenarna |
| 2NT | Kvantitativ invit, Stayman efter 2NT | T02, T23 | Delvis – svar och fortsättningar behöver kontrolleras mot hela systemunderlaget |
| Svaga 2-öppningar | Svar, invit, utgång, spärrande höjningar | Rättningsmotor och logg; ingen samlad ostörd nodfamilj identifierad i biblioteket | Ej kartlagt |
| Spärröppningar på 3-/4-nivån | Svar och fortsättningar | Vissa relaterade öppnings-/höjningsregler i motorn | Ej kartlagt |

## 3. Nätverksområden och befintliga träd

### A. Gemensamma hand- och öppningsregler
- **T36** – öppningshandprofiler efter 1 i färg.
- **T37** – svarshandens styrke-/fördelningsprofiler efter 1 i färg.
- **T38** – fjärde färg och 4-4-4-1.
- Handvärdering i `HANDANALYSUNDERLAG.md` och `rattningsmotor.js`.

**Granskningsbehov:** se till att HP, HTP, HPS och STP inte sammanblandas; kontrollera öppningsval, 4-4-4-1 och hur poängmått väljs i varje regel.

### B. 1NT-öppning
- **Grund och överföringar:** T03, T07, T08.
- **Stayman:** T06, T11–T13, T24–T26.
- **Sanginvit och direkt utgång:** T04, T09, T17, T18.
- **Överföringsinvit med fem-/sexkortsfärg:** T19, T20, T27, T28.
- **Svagt lågfärgsrelä:** T42.
- **4NT-slutpunkter:** T43.

**Kända granskningspunkter:** T03 och T07 överlappar; T09 och T18 är dubblerade sekvenser; T06 och T26 överlappar Stayman-fortsättningar; T11–T13 och T24–T26 innehåller överlapp mellan invit-/utgångsgrenar. Obalanserad Stayman-fortsättning är en dokumenterad lucka. Superaccept efter 1NT och svarshandens fortsättning behöver hållas isär. Efter 4NT ligger svaren utanför den dokumenterade etappen.

### C. 1♥/1♠-öppning
- **Enkla höjningar och spärrhöjningar:** T05, T10, T15, T16.
- **Invithöjning:** T14, T45.
- **Färgprov:** T21, T22.
- **Stenberg:** T34.
- **Öppnarens återbud efter 1M–2M:** T35.
- **Öppnarens återbud efter 1 över 1:** T39.
- **Svarshandens andra bud efter öppnarens återbud:** T40.
- **RKC:** T01 (hjärter) och T44 (spader).

**Kända granskningspunkter:** kriteriet för hjälp i färgprov är inte fastställt; flera singletonfärger saknar dokumenterad prioritet; void är inte singleton; frågeställarens fortsättning efter RKC-svar är ej täckt; alla fem nyckelkort saknar definierat svar i dokumenterad 1430-tabell; vissa lågfärgsfit-/utgångsfall saknar fastställt återbud.

### D. 1♣/1♦-öppning och 1-över-1
- T36–T40 beskriver gemensamma öppnings-, svar-, återbuds- och fortsättningsprofiler.
- T39 täcker många öppnaråterbud efter 1 över 1.
- T40 ska täcka svarshandens andra bud efter öppnarens återbud.

**Kända granskningspunkter:** T40:s root pekar inte på ett nod-ID; T40:s noder och grenar måste granskas mot faktisk `nodeFor()`-logik. Lågfärgsutgång och 4-4-4-1 kräver tydlig åtskillnad mellan fastställda regler och systemfrågor.

### E. Stark 2♣
- **T41** – väntesvar, öppnarens återbud och svarshandens fortsättning.

**Granskningsbehov:** säkerställ att alla sekvenser som rättningsmotorn faktiskt täcker finns i kartan; markera övriga som ej täckta. Hitta inte på fortsättning efter starka öppningssekvenser.

### F. Slam och 4NT
- T01/T44: RKC 1430 med fastställd högfärgstrumf.
- T43: 4NT efter 1NT, både fyr-essfråga utan trumf och RKC efter överföring/fit.
- T02: kvantitativ 4NT efter 2NT.

**Viktigt:** 4NT måste tolkas av auktionskontexten. RKC, fyr-essfråga utan trumf och kvantitativ invit får inte slås ihop. Svaren efter 4NT och frågeställarens fortsättning är ofullständiga i nuvarande underlag.

## 4. Kontraktsmålsmatris

| Mål | Relevanta vägar som måste kartläggas | Nuläge |
|---|---|---|
| 4♥ | 1♥-öppning, hjärterfit efter 1NT/Stayman/överföring, Stenberg, 1 över 1 och invit | Flera delar finns; inte komplett |
| 4♠ | 1♠-öppning, spaderfit efter Stayman/överföring, Stenberg, 1 över 1 och invit | Flera delar finns; inte komplett |
| 5♣ | Klöverfit efter 1♣/1♦/1♥/1♠/1NT, utgångsbeslut och lågfärgsprioritering mot sang | Ej fullständigt kartlagt |
| 5♦ | Ruterfit efter 1♦/övriga öppningar/1NT, utgångsbeslut och lågfärgsprioritering mot sang | Ej fullständigt kartlagt |
| 3NT | Balanserade öppningar/svar, 1NT-inviter, Stayman utan fit, sangåterbud efter 1 i färg | Många delar finns; inte komplett |
| 6-nivå | RKC/essfråga, kontrollbud, gemensam spelstyrka och trumffit | Delvis; frågeställarens fortsättning och vissa svar saknas |
| 7-nivå | Nyckelkort, trumfkungen, kontroller och uttryckliga storslamkrav | Ej fullständigt kartlagt |

Målen ska inte tolkas som att en viss poängsumma ensam tvingar fram ett kontrakt. Systemsekvens, fit, handtyp och tillgänglig information måste också stämma.

## 5. Konkurrensbudgivning – pausad och utanför arbetsomfånget

Följande träd bevaras oförändrade:
- T29 – 1♥ – (1♠)
- T30 – 1♠ – (2♥)
- T31 – 1♦ – (1♠)
- T32 – 1♣ – (1♥)
- T33 – 1♥ – (Dbl)

De ingår inte i den fortsatta ostörda kartläggningen eller kodändringen. Kända luckor och den tidigare 140-givarsbaslinjen bevaras i befintlig dokumentation.

## 6. Strukturell kontroll av nuvarande analysbibliotek

Inventering av `analysbibliotek.json` på basen 2026-11-16:

| Kontroll | Resultat |
|---|---:|
| Totalt antal träd | 45 |
| Ostörda träd | 40 |
| Pausade konkurrensträd | 5 |
| Noder | 271 |
| Grenposter | 273 |
| Grenar med nodmål | 167 |
| Grenar utan nodmål | 106 |
| Dubbla nod-ID:n | 0 |
| Grenar med saknat nodmål | 0 |
| Sekvensnycklar som förekommer i flera träd | 26 |
| Extra förekomster av dubbla sekvenser | 28 |
| Noder utan handProfile | 8 |
| Noder utan utgående grenar | 176 |
| Träd med ogiltig root | 1 (T40) |

Dubbla sekvenser är inte automatiskt fel; vissa kan vara parallella beskrivningar av samma tillstånd. De ska klassificeras och normaliseras först när deras villkor och syften jämförts. 106 grenar utan `next` kan vara avsiktliga terminaler, men deras terminalstatus är inte maskinellt uttryckt ännu. 176 noder utan utgående grenar kan vara slutnoder eller ofärdiga grenar; även dessa måste klassificeras.

### Konkreta strukturella fel/förbättringspunkter
1. T40 root-värdet är en beskrivande mening, inte ett nod-ID.
2. Åtta noder saknar handprofil. Fem är RKC-fråga/svarsnoder i T01, två hör till kvantitativ 4NT i T02 och en till enkel hjärterhöjning T05. Avgör vilka som behöver strukturerade handvillkor och vilka som är rena konventionella tillstånd.
3. T03/T07 och flera Stayman-/höjningssekvenser är dubblerade mellan träd.
4. 106 grenposter saknar nodmål; lägg till explicit terminaltyp innan de behandlas som ofullständiga.
5. T39/T40 har många sekvenser som måste jämföras mot rättningsmotorns exakta matchningsordning, inte bara textbeskrivning.

## 7. Rekommenderad mappningsordning

1. Fastställ kanonisk modell för auktion, spelare, handfakta och systembetydelse.
2. Inventera öppning och svar efter 1♣/1♦/1♥/1♠.
3. Mappa öppnarens återbud efter 1 över 1 och svarshandens andra bud.
4. Mappa 1NT-systemet inklusive Stayman, överföringar, inviter och 4NT.
5. Mappa Stenberg och fortsättningar efter 1M–2M.
6. Mappa stark 2♣.
7. Mappa 2NT, svaga tvåor och spärröppningar.
8. Mappa slutkontraktsvägar och slam.
9. Först därefter normalisera noder och ta bort verkliga dubbleringar.

Varje område ska få en lista över täckta sekvenser, villkorsgränser, testfall, ej täckta lägen och öppna systemfrågor. Ingen regelkod ändras enbart för att göra kartan komplett.

## 8. Prioriterad arkitekturgranskning: informationsläckage

Källkodsinventeringen visar att vissa nuvarande rättningsvägar läser partnerns faktiska hand:
- `responderSecondBid()` tar emot `openerHand` och beräknar gemensamma poäng.
- `nodeForRaw()` läser partnerns hand i vissa invit-/acceptansbeslut.
- `missedGameOrSlam()` analyserar båda händerna i paret.

Detta kan vara korrekt i efterhandsrättning men är inte tillåtet i ett livebeslut för en spelande bot. Nästa kodinventering ska klassificera varje användning som **live**, **efterhandsanalys** eller **testhjälp**. Ingen ändring görs innan samtliga anrop är kartlagda. Den publicerade tvåspelarbudgivningen från PR #12 ska bevaras; detta är en framtida informationsgräns för botens beslut, inte ett skäl att ändra session-/UI-koden nu.



## Uppdaterad granskningsstatus 2026-11-16

- Den enda ej täckta positionen i 100-givarsprovet för 1♥/1♠ har rekonstruerats som svar efter en sekvens som motorn tolkar som splinter: `1♠–2♦–3♥`. T40 saknar motsvarande svarshandsgren.
- Splintertolkningen och dess styrkekrav är inte användarbekräftade systemregler. 13+ HTP och minst fyra korts stöd är bekräftat för Stenberg 2NT, inte för splinter. `reb1()` kontrollerar `hp>=13`, medan T39:s text säger 13+ STP. Detta är en dokumenterad kod-/regelkonflikt.
- Rättningsmotorn och analysbiblioteket är ännu parallella strukturer. Se `KORSREFERENS_RUNTIME_NODER.md` för funktionell koppling och alla sekvenskollisioner.
- `findMatches()` finns nu som diagnostiskt API och visar samtliga sekvensprefixträffar. Befintlig `findMatch()` behåller första-träff-beteendet tills handprofil- och rollmatchning är implementerad.
- En CI-karaktärisering reproducerar att Buddie Öst kan välja Pass eller 4♥ med samma egen hand och samma auktion, beroende på Västs dolda kort. Live-/efterhandsseparation är blockerande före test av roboten som rättvis bridgepartner.