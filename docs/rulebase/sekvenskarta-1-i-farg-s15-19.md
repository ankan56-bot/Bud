# Källstyrd sekvenskarta – budgivning efter 1 i färg (tryckt s. 12–19)

**Källa:** *Helan_lathunden_AI_sokbar_under_10MB 2.pdf*, kapitel 3, tryckt s. 12–19 (PDF-sidor 7–14). Kontrollerad mot sidbilderna.
**Syfte:** Förbereda en säker modulgräns och sekvensbaserad implementation. Detta dokument är en källkarta, inte ett fristående regelverk.

## Käll- och implementationsprinciper

1. En exempelauktion är inte automatiskt en exakt-sekvensregel. När källan anger en handtyp, en generell princip eller en familj av färgkombinationer ska färgerna tolkas efter sina roller (öppningsfärg, svarsfärg, andra visade färgen, trumffärg, objuden färg, tredje/fjärde färg). Alla varianter måste ändå vara lagliga i budordning och nivå.
2. Tabellen på s. 15 skiljer uttryckligen mellan öppnarens återbud på entricksnivån och tvåtricksnivån. Dessa får inte blandas.
3. Hänvisningar märkta Plus, PRO, MeraBud eller Slam är inte automatiskt del av grundprofilen.
4. När källan uttryckligen beskriver en generell handtyp eller säger att övriga bud följer en naturlig princip ska den generaliseras till alla lagliga färgroller som uppfyller villkoren. Enbart färgsymbolerna i exempelraden begränsar då inte regeln. Om källan däremot bara ger en specifik auktion och inte anger en generaliserbar roll ska den hållas exempelbunden.
5. Om budordning, nivå eller budbetydelse inte kan härledas säkert ska läget lämnas EJ TÄCKT, inte fyllas med en analogi.



## Tillämpning av exempel inom varje avsnitt – gäller hela lathunden

Användarens förtydligande gäller samtliga sidor, inte bara s. 12–27: när lathunden skriver **”T ex”** och visar en budsekvens som exempel inom ett regelavsnitt ska sekvensen läsas som ett exempel på avsnittets budprincip. Den får inte automatiskt hårdkodas till de bokstavliga färgerna i exemplet. Färgrollerna ska bytas ut enligt avsnittets räckvidd, samtidigt som budnivå, budordning och betydelse bevaras.

Särskilt utpekat exempel: tryckt s. 13, övre högra delen, sekvensen **1♥–2♣–3♣**. Där ska öppningsfärgen kunna vara **ruter, hjärter eller spader** enligt segmentets regel. Det betyder inte att alla färger får bytas fritt: varje variant måste fortfarande vara en laglig 2-över-1-auktion och 3-budet måste behålla samma systemroll (trumfstöd/återbud enligt just den tabellrutan).

Denna räckviddsregel gäller också andra ”T ex”-rutor i lathunden. Den upphäver inte tydliga avgränsningar mellan separata kolumner, nivåer eller konventionsrutor. Om en färgvariant ändrar 1-över-1 till 1-över-2, gör ett återbud till hopp/revers eller byter vilken färg som är objuden, måste den kontrolleras som en ny variant – inte kopieras mekaniskt.

## 0. Generella principer och färgroller – tryckt s. 12–14

Dessa sidor innehåller övergripande handtyper och systemprinciper. De ska inte reduceras till de bokstavliga färgerna i exemplen.

### 0A. Öppnarens handtyper och återbud efter 1-över-1 – tryckt s. 12

Källan definierar fyra handtyper för öppnaren:
- **Trumfstöd:** minst fyra kort i svarshandens bjudna färg.
- **Tvåfärgshand:** minst 5–4 i två färger.
- **Enfärgshand:** minst sex kort i öppningsfärgen.
- **Balanserad hand:** jämn hand utan trumfstöd.

Källan visar även styrkeintervall för återbuden. Dessa är handtypsbeskrivningar och färgrollerna ska följa den aktuella auktionen, inte låsas till exempelvis hjärter eller spader.

**Generalisering:** Om öppnaren visar trumfstöd är stödfärgen svarshandens färg. Om öppnaren visar tvåfärgshand är färgerna två separata färger med minst 5–4-längd. Om öppnaren visar enfärgshand är det öppningsfärgen som har minst sex kort. Dessa rollbeskrivningar gäller oavsett vilka färger som fyller rollerna, förutsatt att återbudet är lagligt.

**Styrka och nivå får inte blandas:**
- Efter 1-över-1 visar källans exempel trumfstöd på 2-nivån 13–15 stp och på 3-nivån 16–18 stp.
- Tvåfärgshand visas i exemplen med 12–17 hp respektive 18–19 hp beroende på återbudsnivå.
- Enfärgshand visas med minst sex kort i öppningsfärgen; styrkan beror på återbudet.
- Balanserad hand utan trumfstöd: 1NT 12–14 hp och 2NT 18–19 hp i exemplen.

Splinterrutorna på sidan är märkta Plus och ska inte aktiveras i projektets grundprofil.

### 0B. Öppnarens återbud efter 2-över-1 – tryckt s. 13

Sidan ger separata rollfamiljer efter 2-över-1:
- **Trumfstöd:** öppnaren visar stöd i svarshandens färg; exempel visar 3-nivå med 13–18 stp, krav, och 4-nivå med 19–21 stp, krav.
- **Tvåfärgshand:** öppnaren visar en andra färg; färgrollerna bestäms av öppningsfärgen och återbudsfärgen. Exempelraderna ska inte tolkas som att just klöver/ruter/hjärter alltid krävs.
- **Enfärgshand:** återbud i öppningsfärgen visar fortsatt längd där; källan visar minst fem kort i öppningsfärgen för vissa återbud och särskilda styrkeintervall.
- **Balanserad hand:** 2NT visas som 12–14 hp och 3NT som 18–19 hp i de angivna exemplen.

Fortsättningar som är markerade Plus, inklusive splinter, hålls utanför grundprofilen. De får inte bli aktiva bara för att en färgvariant är möjlig.

### 0C. Stigande budgivning efter 2-över-1 – tryckt s. 17

Källans formulering är villkorad: **”Om man spelar med stigande budgivning (reverse)”** råder utgångskrav när öppnaren bjuder stigande. Avsnittet är märkt **Pro**.

Detta är alltså inte en ovillkorlig grundregel i Nordisk Standard. Implementation:
- Regeln får endast aktiveras om projektets valda systemprofil uttryckligen använder Pro-konventionen.
- Utan den profilen ska en stigande återbudssituation inte automatiskt bli utgångskrav på grundval av denna ruta.
- Exempel och svarshandens styrkeintervall i Pro-rutan får inte föras över till grundsystemet.
- Själva budordningen kan fortfarande analyseras för att identifiera att ett bud är stigande/reverse, men det räcker inte för att aktivera den konventionella kravbetydelsen.

### 0D. Tredje och fjärde färg – källstatus

Plus-markeringen gäller bara de enskilda tabellrader där Plus-symbolen faktiskt står. På s. 15–17 är vissa rader för tredje/fjärde färg uttryckligen Plus-märkta och ska inte aktiveras i grundprofilen. S. 19 beskriver däremot fortsättningar efter att tredje eller fjärde färg redan har bjudits; de fortsättningarna får inte automatiskt avfärdas som Plus. De ska bedömas utifrån den fullständiga exempelauktionen och den exakta tabellraden.

En naturlig färgbjudning i samma färg får inte misstas för en Plus-konvention, och en Plus-markering på en rad får inte spridas till alla senare bud i auktionen.

### 0D. Färgvariantgenerator – bindande kontrollordning

För varje generaliserad sekvensfamilj ska systemet:
1. Identifiera öppningsfärg, svarsfärg, eventuell andra visad färg, trumffärg och kvarvarande objudna färger.
2. Bygga endast auktioner där varje bud är högre än föregående bud enligt bridgeordningen.
3. Kontrollera om varianten är 1-över-1, 1-över-2 eller 2-över-1; en färgvariant får inte ändra detta utan att regeln uttryckligen medger det.
4. Kontrollera om ett återbud blir hopp eller revers när färgerna byts. Om budkaraktären ändras får varianten inte ärva den gamla betydelsen.
5. Kontrollera rondkrav, utgångskrav och om partnern redan har begränsat sin hand.
6. Beräkna vilken färg som är den enda objudna färgen i just den auktionen innan ett sangbud får tolkas som hållvisande.
7. Skilja mellan generell regel, exempelbunden regel och EJ TÄCKT. Saknad källinformation får inte fyllas med bridgekonventioner från allmänkunskap.

En färgvariant som faller på någon av kontrollerna ska inte genereras och ska registreras som EJ TÄCKT eller ogiltig variant, inte få en approximerad budbetydelse.

## 1. Öppnarens återbud efter en-över-en – tryckt s. 15

Sidan är uppdelad i två självständiga tabellkolumner. Den avgörande skillnaden är **på vilken nivå öppnaren återbjuder sin nya färg**. Svarsbuden får inte flyttas mellan kolumnerna.

### 1A. Öppnaren återbjuder ny färg på entricksnivån

Tabellens bud är grupperade efter svarshandens styrka och ska tolkas inom den visade rollstrukturen:

| Svarsbud | Betydelse enligt tabellen |
|---|---|
| Pass | 6–10 hp |
| 2♣ | 3-kortsstöd, 6–10 stp |
| 2♦ | 6+ ruter, 6–10 hp |
| 2♥ | 4-kortsstöd, 6–10 stp |
| 2NT | hjärterhåll, 11–12 hp |
| 3♣ | 3-kortsstöd, 11–12 stp |
| 3♦ | 6+ ruter, 11–12 hp |
| 3♥ | 4-kortsstöd, 11–12 stp |
| 3NT | hjärterhåll, 13–15 hp |
| 4♣ | 4-kortsstöd, 13–15 stp |
| 2♠ | fjärde färg, 13+ hp, utgångskrav (Plus) |

**Färgroller och variantkontroll:** Tabellen visar både stöd i öppnarens/svarshandens färger, en lång egen färg, sang med håll och fjärde färg. När en annan färgkombination prövas måste systemet först identifiera vilken färg som är svarsfärg, vilken som är öppnarens återbjudna färg och vilka färger som ännu inte är bjudna. Exempelvis får etiketten ”hjärterhåll” inte bytas till en annan färg utan att den nya auktionen faktiskt lämnar den färgen objuden och att tabellens rollmönster fortfarande stämmer.

**Plus-avgränsning:** Fjärde färg är uttryckligen Plus-märkt och är därför inte en aktiv grundsystemsregel i denna modul utan separat beslut.

### 1B. Öppnaren återbjuder ny färg på tvåtricksnivån

Detta är en separat kolumn med annan budnivå och delvis andra svar:

| Svarsbud | Betydelse enligt tabellen |
|---|---|
| Pass | 0–1 ruter och 3–4 klöver, 6–9 hp (den visade svaga handbeskrivningen) |
| 2♦ | preferens, minst två ruter, 6–10 hp/stp |
| 2♥ | 6+ hjärter, 6–10 hp |
| 2NT | 11–12 hp, håll i den enda objudna färgen i den verifierade tre-färgssekvensen |
| 3♣ | minst 4-stöd, 10–12 stp |
| 3♦ | minst 3-stöd, 11–12 stp |
| 3♥ | minst 4-stöd, 11–12 stp |
| 3NT | håll i den angivna objudna färgen, 13–15 hp |
| 2♠ | fjärde färg, 13+ hp, utgångskrav (Plus) |

**Användarbekräftad sekvens:** I **1♥–1♠–2♦–2NT** har tre färger visats. 2NT visar håll i den enda objudna färgen, **klöver**, och är en **invit med 11–12 hp**, inte krav. Denna exakta tolkning är fastlagd.

**Viktigt vid generalisering:** Tabellen ger stöd för rollbaserad tolkning av ”enda objudna färgen”, men varje annan färgvariant måste byggas från sin faktiska auktion. Den får inte ärva klöverhåll eller 11–12-intervallet om färgrollerna, nivån eller tabellraden inte motsvarar samma fall. Fjärde färg 2♠ är Plus-märkt och ska hållas utanför grundprofilen.

## 2. Öppnarens 1NT-återbud eller enfärgshand – tryckt s. 16

Sidan har två olika tabeller. Den vänstra gäller efter öppnarens 1NT-återbud; den högra gäller när öppnaren visar enfärgshand. De ska hållas isär.

### 2A. Efter öppnarens 1NT-återbud

| Svarsbud | Betydelse enligt tabellen |
|---|---|
| Pass | 6–10(11) hp |
| 2♣ | 6–10 hp, 3 hjärter |
| 2♦ | 6–10 stp, 5+ spader |
| 2NT | 11–12 hp |
| 3♠ | 11–12 stp, 6+ spader |
| 2♣ / 2♦ / 2♥ | Tredje färg: 10+ hp och 3+ kort i färgen (Plus) |
| 3NT | 13–18 hp |
| 4♦ | 13–18 stp, 6+ spader |

Tabellens färgbud med längd/stöd är knutna till den visade exempelauktionen. Vid generalisering ska färgrollerna och svarshandens redan visade färg följas; man får inte anta att exempelvis 3♠ alltid betyder sexkortsspader i varje 1NT-återbud.

**Försenad Stayman (PRO):** Sidan anger att 2♠ kan användas som högfärgsfråga även efter öppnarens 1NT-återbud. Budet lovar minst 11 hp och ber öppnaren visa sina högfärgslängder. Övriga färgbud anges som svaga med 6–10 hp. PRO-märkningen innebär att detta inte aktiveras i grundprofilen.

### 2B. Efter att öppnaren visar enfärgshand

Den högra tabellen är en separat sekvensfamilj. Den visar bland annat:
- Pass: 6–10 hp.
- 2NT: 11–12 hp med håll i de två namngivna sidofärgerna i exemplet.
- 3♦: 11–12 stp, 3+ ruter.
- 3♠: 11–12 hp, 6+ spader.
- 3NT: 13–18 hp med håll i de två namngivna sidofärgerna i exemplet.
- Tredje färg: 10+ hp och 3+ kort i färgen (Plus).
- Andra färgbud i tabellen visar bland annat 3+ kort i en färg eller 6+ kort i svarshandens egen färg.

**Färgvariantkontroll:** Håll i 2NT/3NT ska här knytas till just de två sidofärger som är objudna i respektive exempelauktion. Denna tabell får inte blandas ihop med 2A:s 1NT-återbud. Tredje färg är Plus-märkt.

## 3. Trumfstöd efter en-över-en och efter två-över-en – tryckt s. 17

Sidan innehåller flera separata exempel och särskilda fortsättningsregler. Det är inte en enda generell tabell.

### 3A. Öppnaren visar trumfstöd efter en-över-en

Exempelrutan visar:
- Pass: 6–10 hp.
- 2NT: 11–12 hp och håll i de färger som anges i exempelauktionen.
- Ny färg: 11+ stp, krav i den visade fortsättningen.
- 3♣: 11–12 stp, 4+ stöd i den visade trumffärgen.
- 3♦: 11–12 stp, 5+ kort i egen färg.
- 3♥: 11–12 stp, 5+ kort i egen färg.
- 3♠/4♣: 16+ stp, kortfärg i den bjudna färgen och 5+ trumf i den visade Plus/Pro-grenen.
- 4♥: trumfstöd, 13–15 stp i det visade exemplet.

Separat exempel visar pass med 6–8 stp, 3NT som slutbud med 9–13 stp, kortfärgsbud som slaminvit och 4-nivåbud som slutbud. Kortfärg/slaminvit i denna ruta är Pro-märkt.

**Generalisering:** Trumfstöd och egen färg är rollbegrepp. Stödlängd och stp-intervall får följa med till en annan färgkombination endast när motsvarande stöd-/färgroll och samma budnivå finns. Ett bud som blir hopp eller får en annan nivå är inte automatiskt samma bud.

### 3B. Efter två-över-en

Exempelrutan visar en separat fortsättning efter 2-över-1. Följande betydelser framgår av tabellen:
- 2♠: 11–12 hp, tvåkortsstöd i spader i den visade auktionen.
- 2NT: 11–12 hp, ruterhåll i den visade auktionen.
- 3♣: 10–12 hp, 6+ klöver.
- 3♦: fjärde färg, 13+ hp, utgångskrav (Plus).
- 3♥: 16+ stp, 4+ hjärterstöd (Plus).
- 3♠: 11–12 hp, trekortsstöd i spader.
- 4♥: trumfstöd, 13–15 stp i det visade exemplet.

Ett annat exempel visar bland annat singelhjärter med exakt 11 hp, tredje färg (Plus), 10–12 hp med 6+ ruter, 16+ stp med kortfärg och splinter (Plus/Pro).

**Viktigt:** 2♠ tvåkortsstöd, 2NT ruterhåll och 3♠ trekortsstöd är betydelser i den visade auktionen, inte universella buddefinitioner. Andra färgkombinationer kräver att rollmönstret, budnivån och den objudna färgen stämmer. Fjärde färg, tredje färg och splinter som är Plus/Pro-märkta ska inte aktiveras i grundprofilen.

### 3C. Stigande budgivning efter 2-över-1

Sidans avslutande text säger att **om man spelar med stigande budgivning (reverse)** råder utgångskrav när öppnaren bjuder stigande. Avsnittet är **Pro-märkt**. Därför ska detta inte behandlas som en ovillkorlig grundsystemsregel. Om projektprofilen inte uttryckligen använder denna Pro-konvention ska den markeras EJ AKTIV, inte användas för att tvinga utgång.

## 4. Öppnarens tredje bud efter svagt svar eller 2NT-invit – tryckt s. 18

Inledningstexten säger att öppnaren ofta passar när svarshanden är svag, men med fördelning eller styrka kan bjuda igen. Invitbuden visar cirka 15–17 hp.

### 4A. Svarshanden återbjuder 1NT

Tabellen visar öppnarens återbud med följande handtyper/styrkor:
- 2♣: 5–4 eller 4–4–4–1, 11–15 hp.
- 2♦: 6-kortsfärg, 11–14 hp.
- 2♥: 4-kortsfärg, 15–17 hp.
- 2♠: 3-kortshjärter, 15–17 hp (som angivet i tabellen; ska inte omtolkas utan stöd).
- 2NT: 6–5-fördelning, 11–13 hp.
- 3♣: invit, (15)16–17 hp.
- 3♦: 6-kortsfärg, 15–17 hp.
- 3♥: 6–5-fördelning, 14–17 hp.
- 3♠: invit.
- 3NT: 6-kortsfärg, 15–17 hp.
- 4♣: 6–5-fördelning, 14–17 hp.
- 4♦: splinter, 16–17 hp.
- 4♥: slutbud.

**Kontrollpunkt:** Flera rader i den skannade tabellen är svåra att koppla till färgroller utan att först följa hela exempelauktionen. De ska därför behållas som exempelbundna tills sekvensnyckeln är verifierad. Splinterraden är avstängd i projektprofilen.

### 4B. Svarshanden prefererar

Den separata tabellen visar:
- Pass: 11–15 hp.
- 2NT: 3-kortsstöd i spader, 15–17 hp i det visade exemplet.
- 3♣: invit, (15)16–17 hp.
- 3♦: 5–5-fördelning, 15–17 hp.
- 3♥: 6–4-fördelning, 15–17 hp.
- 3♠: minst 6–4-fördelning, stark hand.

Budens färger är kopplade till exempelauktionen. En variant får generaliseras endast om svarshandens preferens och öppnarens visade färger får samma roller i den nya auktionen.

### 4C. Svarshanden inviterar med 2NT

Den högra tabellen visar:
- Pass: svagt.
- 3♣: 4:e färg, utgångskrav.
- 3♦: 5–5-fördelning, minimum.
- 3♥: 6–4-fördelning, minimum.
- 3♠: 3-kortsstöd, maximum (annars 2♠ direkt).
- 3NT: Plus-märkt slutbud.

**Färgroll:** Dessa är öppnarens tredje bud efter en 2NT-invit. De får inte blandas ihop med svarshandens 2NT efter öppnarens återbud på s. 15–17. Plus-budet är inte aktivt i grundprofilen.

## 5. Öppnarens tredje bud efter tredje eller fjärde färg – tryckt s. 19

Inledningstexten anger:
- När svarshanden har gjort ett kravbud måste öppnaren fortsätta budgivningen.
- Öppnaren kan visa mer längd i en tidigare bjuden färg, preferera svarshandens färg eller bjuda sang med håll.
- Ett hopp till svarshandens första bjudna färg visar trekortsstöd.
- Öppnaren ska först bjuda sin egen färg/visa håll enligt de alternativ som tabellen ger; en ny färg ska inte hittas på utanför tabellens systemroll.

### 5A. Svarshanden bjuder tredje färg

Exempelrutan anger följande budbetydelser i den visade auktionen:
- 2♠: inte tillåtet.
- 2NT: inget bättre bud.
- 3♣: tvåkortshjärter, minimum.
- 3♦: fjärde färg, utgångskrav.
- 3♥: spaderhåll, minimum.
- 3NT: sexkortsfärg, minimum.

Ytterligare rader i tabellen anger bland annat 5–5-fördelning, fyrkortsfärg, 6–4-fördelning maximum och trekortsstöd. Dessa ska knytas till den specifika exempelauktionen innan färgvarianter genereras.

### 5B. Svarshanden bjuder fjärde färg

Exempelrutan anger:
- 2♦: inte tillåtet.
- 2♥: inget bättre bud.
- 2♠: tvåkortsstöd i spader.
- 2NT: ruterhåll.
- 3♣: 5–5-fördelning.
- 3♦: fyrkortsfärg.
- 3♥: 6–4-fördelning, maximum.
- 3♠: trekortsstöd i spader, maximum.
- 3NT: inte tillåtet.

### 5C. Fortsättning efter tredje färg

En separat tabell visar svarshandens fortsättningar:
- 2NT: fjärde färg, utgångskrav.
- 3♣: invit, 11–12 hp.
- 3♦: 5–5, 11–12 hp.
- 3♥: 6-kortshjärter, 11–12 hp.
- 3NT: invit, 11–12 hp.

En ytterligare exempelruta visar öppnarens svar:
- 2NT: ruterhåll, 13+ hp.
- 3♣: minst 4-stöd, 13+ stp.
- 3♦: minst 6-kortsfärg, 16+ hp.
- 3♥: 3-stöd, 16+ stp.
- 3NT: ruterhåll, slutbud.
- 4♠: minst 6-kortsfärg, maximum 15 stp.

**Generaliseringsgräns:** Sidan innehåller flera olika auktioner och roller. ”Tredje färg” och ”fjärde färg” definieras av hur många färger som redan visats i just den aktuella auktionen. Man får inte byta färg i en exempelrad och behålla budbetydelsen om det då blir en annan färg i ordningen, ett annat nivåbud, ett hopp eller en annan objuden färg. Dessa rutor ska kodas med fullständig auktionskontext.

## 6. Rekommenderad modulindelning

Föreslagen modul: `efter-en-i-farg.js`, men den ska inte bli en ny monolit. Dela i små regelgrupper eller separata filer:
1. `svarshandens-andra-bud.js` – öppnarens återbud på 1- respektive 2-nivån (s. 15).
2. `efter-oppnarens-1nt.js` – balanserad återbudshand och särskilda 1NT-fortsättningar (s. 16).
3. `efter-trumfstod-en-over-en.js` – endast verifierade trumfstödssekvenser (s. 17).
4. `efter-tva-over-en.js` – sekvensspecifika fortsättningar (s. 17).
5. `oppnarens-tredje-bud.js` – efter svagt svar/2NT-invit (s. 18).
6. `efter-tredje-fjarde-farg.js` – fullständiga sekvensnycklar (s. 19).

Modulerna ska exponera små rena funktioner som tar hela auktionen, handdata och aktuell regelprofil. En gemensam generell "färgbytare" ska inte skapa budvarianter. Regelmatchning ska ske mot exakta auktioner eller explicit verifierade sekvensfamiljer. En sekvensfamilj ska beskrivas med färgroller och generera endast bud som är lagliga enligt budordning, nivå, hopp/revers, rondkrav och tidigare visade färger.

## 7. Nästa implementationssteg

1. Inventera nuvarande dirigering i `budbeslut.js` och befintliga regler i `ettoppningssvar.js`.
2. Lägg in först de sekvenser som har uttryckligt, entydigt källstöd och inte är Plus/PRO/Splinter.
3. Skriv positiva och negativa regressionstest för varje sekvens: rätt styrka, fel styrka, fel håll, fel längd, ej tillåten budordning och närliggande auktion som inte får matcha.
4. Kontrollera att `1♥–1♠–2♦–2NT` matchar 11–12 hp och klöverhåll, är invit (inte krav), och att den separata sekvensen `1♥–1♠–2♣–2NT` behåller sin egen källregel.
5. Allt som inte är entydigt verifierat lämnas EJ TÄCKT och läggs i expertfrågeloggen.


## 8. Korrigerad generell princip för sang efter tre visade färger

Användarbekräftad systemprincip:
- När tre färger har visats och svarshanden därefter bjuder sang, visar sangbudet håll i den enda objudna färgen.
- Sangbudet är invit, inte krav.
- Ny färg är krav; den egenskapen får inte överföras till sangbud.
- Denna princip ersätter tidigare felaktig notering om att sangbudet skulle vara krav.
- Exakt styrkeintervall och budnivå ska fortfarande kontrolleras mot respektive tabell/sekvens. Den verifierade sekvensen 1♥–1♠–2♦–2NT visar 11–12 hp.
