# Granskning: informationsgräns mellan livebudgivning och efterhandsrättning

**Datum:** 2026-11-16  
**Gren:** `work/undisturbed-architecture`  
**Omfattning:** Ostörd budgivning, med fokus på vilka kort en spelare eller robot får använda vid sitt beslut.  
**Status:** Granskning och riskdokumentation. Ingen produktionslogik ändrad.

## Sammanfattning

Granskningen har hittat en **bekräftad informationsläcka i Öst–Väst-robotens livebudgivning**. `botCall()` i `Budtraning.html` skickar hela given (`st.hands`) till `Rattning.nodeFor()`. Rättningsmotorn använder på flera ställen partnerns faktiska hand för att välja bud. Eftersom samma dispatcher används av roboten kan Buddie fatta beslut med information som en mänsklig spelare inte har.

Detta är inte bara en teoretisk arkitekturrisk: anropskedjan är direkt synlig i koden. Problemet måste lösas innan robotens bud kan betraktas som ett rättvist livebeslut. Efterhandsrättning får däremot fortsatt använda alla fyra händer, tydligt märkt som efterhandsanalys.

## 1. Bekräftad live-anropskedja

1. `botCall(st, botSeat)` bygger en provauktion med robotens tur.
2. Funktionen anropar `Rattning.nodeFor({hands: st.hands, dealer: st.dealer, bids: trial}, ...)`.
3. `nodeFor()` anropar `nodeForRaw()` och kan dessutom anropa `missedGameOrSlam()`.
4. Båda vägarna kan läsa partnerns faktiska kort via `st.hands[pt]` eller båda händerna via `st.hands[b.s]` och `st.hands[pt]`.

**Konsekvens:** Samma kodväg används både för robotens livebud och för efterhandsrättning. Det finns ingen typad eller tekniskt framtvingad gräns mellan dessa två användningsfall.

## 2. Dolda handreferenser i rättningsmotorn

| Kodplats | Funktion/situation | Faktisk dold information | Risk i livebud |
|---|---|---|---|
| ca rad 516–560 | `reb1()`, accepterar 3M-invit | Partnerns längd i trumffärgen och gemensamma spelpoäng | Öppnaren kan acceptera eller avslå invit utifrån svarshandens faktiska kort i stället för budgivningens visade styrka |
| ca rad 987–1054 | `responderSecondBid()` | Öppnarens hp, balans, färglängder, fit och gemensamma spelpoäng | Svarshanden kan välja utgång/invit/preferens med vetskap om öppnarens dolda hand |
| ca rad 1120–1129 | 1NT-återbud och högfärgsinvit | Partnerns hp, fit och gemensamma spelpoäng | Robotens accept/pass kan styras av dold styrka och fit |
| ca rad 1224–1227 | Svarshandens andra bud efter 1NT | Öppnarens exakta fördelning (bl.a. 4441) | Budväg väljs utifrån en dold fördelningsform |
| ca rad 1248, 1271 | Invit-/Staymanrelaterad logik | Partnerns faktiska hand | Kan påverka val av bud och fortsättning |
| ca rad 1286–1302 | 1NT/2NT-svar, Stayman, överföring och öppnarens fortsättning | Partnerns faktiska kort i flera hjälpfunktioner | Kan påverka svar, accept, superaccept eller fortsättning |
| ca rad 1326 | Svar efter svag tvåöppning | Partnerns faktiska hand skickas till `resp2w()` | Måste kontrolleras funktionsvis; risk för dold handberoende logik |
| ca rad 1341–1355 | Reverse, svarshandens andra bud och öppnarens återbud | Partnerns faktiska spaderfit, spelpoäng och kort | Kan styra bud som kräver kunskap om den dolda handen |
| ca rad 1537–1601 | `missedGameOrSlam()` | Båda sidans faktiska händer och gemensamma fit | Hindsight-funktion; får inte användas i livebeslut |
| ca rad 1655 ff. | `judgeComplete()` | Spelarens och partnerns faktiska händer | Efterhandsanalys; rimligt endast efter given och tydligt märkt |

Radnumren är orienterande och kan ändras. Sök efter funktionsnamn och uttrycken `st.hands[pt]`, `partnerCards` och `openerHand` vid framtida ändringar.

## 3. Klassificering av nuvarande anrop

| Anropare | Användning | Klassificering |
|---|---|---|
| `botCall()` → `nodeFor()` | Öst–Väst-robotens beslut under auktionen | **LIVE – får endast använda egen hand och offentlig budhistorik** |
| `themedOpening/Overcall/Response/Rebid()` | Skapa och kontrollera temagivare | Test-/genereringsmiljö; full given får användas för att konstruera facit, men får inte återanvändas som livepolicy |
| `bidMeaning()` → `nodeFor()` | Förklara redan lagda bud | Efterhands-/visningskontext |
| `reviewHtml()` → `judge()` | Rätta färdig giv | POST-DEAL |
| `runSupplementaryReview()` | Kandidatanalys av ej täckta positioner efter given | POST-DEAL |
| `judgeComplete()` | Fullständig rättning och handanalys | POST-DEAL |

## 4. Analysmotorn och nodbiblioteket

- `findMatch()` väljer den längsta sekvensprefixmatchningen i `analysbibliotek.json`. Den kontrollerar inte nodens handvillkor. Därför är den inte tillräcklig som fullständig besluts-/rättningsmatchare.
- `treeCompatible()` filtrerar vissa uttryckligen motstridiga texter (bl.a. Jacoby och RKC-svar som inte stämmer med beslutad 1430-struktur). Det är en textbaserad spärr, inte en strukturerad regelvalidering.
- `findSupplementary()` kontrollerar sekvensprefix, nästa spelare, roll och den aktuella spelarens handvillkor. Den läser `hands[next]`, inte partnerns kort. Det är en bättre informationsmodell, men kandidaterna är fortfarande efterhands-/utvärderingsmaterial och inte automatiskt godkända systemregler.
- Flera noder saknar `handProfile`; sådana noder kan inte få full handvillkorsvalidering förrän profilen kompletterats.
- Terminala grenar och saknade fortsättningsnoder måste skiljas åt i datamodellen. En gren utan `next` betyder inte automatiskt att sekvensen är ett definierat slutbud.

## 5. Rekommenderad målarkitektur

### Separera beslut från rättning

Inför två tydliga API:er med olika indata:

**Livebeslut**
```js
decideLive({
  ownHand,
  seat,
  dealer,
  auction
})
```

- Innehåller inte `hands`, `partnerHand`, DDS-resultat eller något objekt som kan slå upp motståndarnas kort.
- Partnerns och motståndarnas bud får användas som offentlig information.
- Handvillkor får endast utvärderas mot `ownHand`.
- För partnerns styrka/fördelning används enbart intervall och slutsatser som faktiskt följer av budsystemet; inte det verkliga värdet.

**Efterhandsrättning**
```js
judgeDeal({
  hands,
  dealer,
  auction,
  ddsResult
})
```

- Får använda alla fyra händer för att kontrollera vad som faktiskt fanns.
- Ska märka slutsatser som efterhandskunskap.
- Får inte återanvändas av livebotten som budrekommendation.

### Säker migrationsordning

1. Skriv tester som visar att samma `ownHand + auction` ger samma livebeslut oavsett vilka kort som ligger i de tre övriga händerna.
2. Extrahera nuvarande regler till separata funktioner med tydliga indata. Behåll post-deal-beräkningar i rättningslagret.
3. Ersätt varje liveberoende av partnerns faktiska kort med offentlig budinferens, eller returnera `ej täckt` om systemunderlaget inte räcker.
4. Säkerställ att `missedGameOrSlam()` aldrig körs i livevägen.
5. Kör befintliga regressionstester och temagivare, plus adversarial tests där dolda händer byts medan egen hand och auktion hålls konstanta.
6. Kontrollera att tvåspelarflödet och synkroniseringen inte ändras.

**Viktigt:** Detta är en arkitekturriktning, inte ett tillstånd att hitta på nya budregler. Där offentlig budinformation inte räcker ska roboten avstå från att låtsas veta partnerns hand och markera läget som ej täckt eller använda en separat, uttryckligen godkänd strategisk bedömning.

## 6. Nästa kodgrind

Innan någon ändring av budregler görs ska vi:
- inventera samtliga funktioner som tar `partnerCards`, `openerHand` eller `st.hands[pt]`;
- följa varje hjälpfunktion till dess faktiska läsningar;
- fastställa vilka parametrar som kan göras om till offentligt härledd information;
- skapa ett isolerat livebesluts-API och tester för dold-hand-invarians;
- först därefter göra små, separata implementationer.

Ingen ändring i denna granskning ändrar själva budsystemet.

## 7. Separat strategisk reservlogik

`strategicBotFallback()` i `Budtraning.html` använder robotens egen hand och partnerns offentliga budhistorik. I den granskade funktionen hittades ingen direkt läsning av partnerns faktiska kort. Den är därför inte samma dolda-hand-läcka som `Rattning.nodeFor()`.

Däremot är detta en separat strategisk reservpolicy, inte en verifierad del av Nordisk Standard-rättningsmotorn. Exempelvis härleder den möjliga fit-längder från partnerns tidigare färgbud och väljer preferens mellan två visade färger. Den måste därför ha separat status, motivering och tester. Den får inte presenteras som ett systembud bara för att den ger ett konkret bud när grundmotorn saknar täckning.

## 8. Verifieringskrav för informationsisolering

Ett centralt regressionstest ska skapa flera kompletta givar med samma robot-hand, samma givare och exakt samma offentliga budsekvens men olika kort i de tre andra händerna. `decideLive()` ska returnera identiskt bud och motivering i samtliga fall. Testet ska även köras på varje stödd budposition efter att den nya livevägen införts.


## 9. Exakt funktionsinventering av dolda handberoenden

Följande hjälpfunktioner tar uttryckligen emot partnerns faktiska kort eller läser partnerns hand via dispatcher. De är inte säkra som generella livebeslutsfunktioner i nuvarande form:

| Funktion | Dold indata | Beslut som påverkas | Konsekvens |
|---|---|---|---|
| `ntResp(h,k,openerCards)` | Öppnarens kort | Gemensamma hp efter 1NT/2NT; val av sangutgång/invit | Svarshanden kan välja bud utifrån öppnarens faktiska hp. |
| `ntOpener(h,k,r,responderCards)` | Svarshandens kort | Accept/pass på 2NT-invit | Öppnaren kan acceptera invit utifrån svarshandens faktiska hp. |
| `stay2(h,reply,openerCards)` | Öppnarens kort | Fit och gemensamma spelpoäng efter Stayman | Svarshanden kan välja 3M/4M/3NT/pass med vetskap om öppnarens hand. |
| `transfer2(h,M,openerCards)` | Öppnarens kort | Gemensamma hp, fit och spelpoäng efter överföring | Svarshanden kan välja slutbud/invit med dold information. |
| `ntOpenerInvit(h,M,inv,responderCards)` | Svarshandens kort | Accept av 2NT/3M-invit | Öppnaren ser den faktiska fitten och gemensamma styrkan. |
| `ntOpener3(h,k1,k2,k3,responderCards)` | Svarshandens kort | Accept efter Stayman-invit och vissa sangfortsättningar | Öppnaren kan fatta beslut med partnerns dolda kort. |
| `resp2w(h,oc,openerCards)` | Öppnarens kort | Fit, gemensamma spelpoäng, utgång/slam efter svag tvåa | Svarshanden kan veta den verkliga fitten. |
| `reb1(h,oc,r,partnerCards)` | Svarshandens kort | Accept/pass efter 3M-invit | Öppnaren kan se faktisk fit och gemensamma spelpoäng. |
| `responderSecondBid(h,opening,response,rebid,openerHand)` | Öppnarens kort | Fit, gemensam hp/HTP, preferens, invit och utgång | Svarshanden kan välja fortsättning utifrån öppnarens verkliga hand. |
| `nodeForRaw()` | `st.hands[pt]` på flera grenar | 1NT-inviter, 1NT 4-4-4-1-väg, reverse/fit och fortsättningar | Dispatcher för in dold information direkt i beslutet. |
| `nodeFor()` → `missedGameOrSlam()` | Båda sidans faktiska händer | Missad utgång/slam-rescue | Efterhandskontroll körs även i den funktion som används av livebotten. |

### Direkta läsningar i dispatchern

- Cirka rad 1120: läser partnerns hp efter 1NT-återbud. Den lokala variabeln `inviteTotal` verkar inte användas i den aktuella grenen, men läsningen visar att dispatchern har blandat in fullgivarstatus.
- Cirka rad 1125–1129: läser partnerns hand för att acceptera/avslå 3♥/3♠-invit.
- Cirka rad 1224–1227: kontrollerar partnerns exakta 4-4-4-1-fördelning och skickar den till svarshandens andra-bud-logik.
- Cirka rad 1248–1253: läser partnerns hp för sanginvit efter 2NT.
- Cirka rad 1271–1279: läser partnerns hp och spaderlängd efter 2NT–3♣–3♠.
- Cirka rad 1286–1291: skickar partnerns faktiska hand till NT-svar, NT-öppnarens återbud, Stayman och överföringsfunktioner.
- Cirka rad 1301–1302: skickar partnerns faktiska hand till öppnarens fortsättning efter invit/Stayman.
- Cirka rad 1326: skickar öppnarens faktiska hand till svarshandens beslut efter svag tvåa.
- Cirka rad 1344–1347: testar faktisk spaderfit och gemensamma spelpoäng i reverse-sekvens.
- Cirka rad 1351–1355: skickar öppnarens hand till svarshandens andra bud och partnerns hand till öppnarens återbud.

Radnumren är ungefärliga och ska verifieras mot aktuell fil vid kodändring.

### Viktig distinktion

Alla dessa funktioner är inte felaktiga för efterhandsrättning. Problemet är att de blandas med livebeslut. Målet är inte att kasta bort deras pedagogiska värde, utan att dela varje beslut i:
- **Livevariant:** endast egen hand + offentlig budinformation; returnerar ej täckt om informationen inte räcker.
- **Efterhandsvariant:** får använda båda händerna, men resultatet märks som efterhandsanalys och får inte påverka robotens livebud.

Denna uppdelning måste omfatta även strategiska reservbeslut och utgångs-/slamkontrollen.

## 10. Reproducerbart exempel: samma egen hand och auktion ger olika livebeslut

Jag har byggt två fullständiga, kortmässigt giltiga givar där öppnarens hand och den offentliga auktionen är identiska. Endast svarshandens dolda kort skiljer sig.

**Öppnarens hand i båda fallen:** 13 hp, fem hjärter, fördelning 5-3-3-2.  
**Offentlig auktion i båda fallen:** 1♥ – Pass – 3♥ – Pass – (öppnarens beslut).

Svarshand A har 10 hp, 10 HTP och fyra hjärter (4-3-3-3). Svarshand B har 10 hp, 11 HTP och fyra hjärter (4-4-3-2). Båda ligger inom det dokumenterade intervallet för en 3♥-invit (10–12 HTP, minst fyra hjärter).

Nuvarande rättningsmotor ger:

| Dold svarshand | Gemensamma spelpoäng enligt motorn | Beslut |
|---|---:|---|
| A | 25 | Pass |
| B | 26 | 4♥ |

Det här är ett direkt reproducerbart bevis på att `Rattning.nodeFor()` använder partnerns faktiska kort för att välja öppnarens livebud. Under budgivningen vet öppnaren bara att partnern har inviterat med 10–12 HTP och minst fyra hjärter; öppnaren vet inte om partnern har exakt den ena eller andra fördelningen.

**Korrekt hantering:** Den livevägen måste använda det intervall och den information som budet faktiskt visar. Om den dokumenterade systemtexten inte anger hur öppnaren ska fatta beslut när intervallet sträcker sig över utgångsgränsen ska livebeslutet markeras ej täckt/kräva kompletterande systembeslut – inte läsa partnerns kort.

## 11. Ny lucka från 100-givarskörningen: svar efter splinter

Jag har återskapat seed `202615834` från 100-givarsprovet och följt varje beslut i motorn. Sekvensen är:

`1♠ – Pass – 2♦ – Pass – 3♥ – Pass – ?`

I just denna giv har öppnaren 4-4-4-1 och 3♥ är enligt nuvarande `reb1()` ett splinterbud: singelton i hjärter och minst fyra korts stöd i svarshandens ruter. Svarshandens 2♦ har därmed fått en fitbeskrivning, men `responderSecondBid()` har ingen uttrycklig gren för splinter. Den försöker i stället behandla öppnarens återbud som en naturlig andra färg/tvåfärgshand och lämnar beslutet ej täckt.

Det här är en mer precis klassificering än den äldre korta beskrivningen i loggen. **Vi ska inte hitta på svar efter splinter.** Först måste den auktoritativa systemöverenskommelsen för svarshandens styrkeintervall, kontrollvisning och signoff efter splinter verifieras. Därefter kan vi lägga till en nodfamilj och separata tester.
### 11.1 Systemstatus för splinter – inte verifierad överenskommelse

En separat genomgång av tidigare projektdiskussioner visar att följande inte har bekräftats uttryckligen av användaren som systemregel: splinter med 13+ STP, splinter med 19–21 STP, och svarshandens fortsättning efter splinter (t.ex. 3M/4M, kontrollbud eller slamintresse). De beskrivningarna förekommer i tidigare assistentförslag och har därefter lagts in i delar av biblioteket/koden, men ska inte behandlas som auktoritativ Nordisk Standard utan verifiering.

Det som är uttryckligen bekräftat i tidigare diskussion är **Stenberg 2NT efter 1M med 13+ HTP och minst fyra korts stöd**. Detta är en annan konvention och får inte användas som automatiskt styrkekrav för splinter.

Nuvarande `reb1()` använder `hp>=13` i splintervillkoret, medan nodtexten beskriver 13+ STP. Det är dessutom en intern kod-/dokumentationskonflikt: funktionen kontrollerar HP, inte STP. Inga ändringar ska göras innan rätt splintervillkor och efterföljande budväg har verifierats mot den auktoritativa systemkällan.