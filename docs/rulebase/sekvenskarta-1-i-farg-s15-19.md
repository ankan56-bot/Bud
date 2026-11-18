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

### 0C. Generellt efter 2-över-1 – tryckt s. 14

Detta avsnitt är uttryckligen generellt och ska implementeras som rollbaserade principer, inte som en enda bokstavlig exempelauktion:

- Om paret hittar en gemensam trumffärg efter att budgivningen inletts med 2-över-1 ska paret komma till minst utgång.
- Öppnarens stigande återbud (revers) – återbud i en färg på tvåtricksnivån som ligger högre än öppningsfärgen – lovar extra styrka: minst 16 hp och minst 5–4-fördelning. Detta är en roll-/budordningsregel; den får inte reduceras till ett specifikt färgpar.
- Efter ett sådant stigande återbud gäller svarshandens tre styrkeintervall: svag 6–10 hp/stp, invit 11–12 hp/stp, utgång 13+ hp/stp.
- Med svag hand kan svarshanden passa, återbjuda egen färg, bjuda sang eller preferera till öppnarens första färg.
- Med invitstyrka kan svarshanden bjuda 2NT eller en tidigare bjuden färg på 3-nivån.
- Med utgångsstyrka bjuder svarshanden utgång eller ett kravbud.
- Om två färger är bjudna och svarshanden introducerar den tredje färgen är det tredje färg. Om tre färger är bjudna (öppnaren har visat tvåfärgshand) är motsvarande bud fjärde färg.
- Tredje färg anges som kravbud med 10+ hp och naturlig färgvisning i Plus-rutan. Fjärde färg anges som utgångskrav med 13+ hp i Plus-rutan. Plus-markeringarna innebär att konventionsdelen inte automatiskt ingår i grundprofilen.

**Viktig skillnad:** Den generella principen om stigande budgivning och styrkeintervall gäller som beskriven systemprincip. De specifika fortsättningsbuden i exempelrutan (t.ex. klöverhåll, fjärde färg, preferens och längdkrav) ska bara flyttas till andra färgkombinationer när samma roll, nivå och budordning finns och källans princip täcker den rollen.

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

### 1A. Öppnaren återbjuder ny färg på entricksnivån

Tabellens svaga bud:
- Pass: 6–10 hp.
- 2♣: 3-kortsstöd, 6–10 stp.
- 2♦: 6+ ruter, 6–10 hp.
- 2♥: 4-kortsstöd, 6–10 stp.

Invitbud:
- 2NT: hjärterhåll, 11–12 hp.
- 3♣: 3-kortsstöd, 11–12 stp.
- 3♦: 6+ ruter, 11–12 hp.
- 3♥: 4-kortsstöd, 11–12 stp.

Utgång eller krav:
- 3NT: hjärterhåll, 13–15 hp.
- 4♣: 4-kortsstöd, 13–15 stp.
- 2♠: fjärde färg, 13+ hp, utgångskrav (Plus-markering i tabellen).

**Avgränsning:** Tabellen är den särskilda grenen där öppnaren återbjudit ny färg på 1-nivån. Hållbuden får inte flyttas till grenen med återbud på 2-nivån.

### 1B. Öppnaren återbjuder ny färg på tvåtricksnivån

Svaga bud:
- Pass: 0–1 ruter och 3–4 klöver, 6–9 hp (exempel-/sekvensbunden beskrivning).
- 2♦: preferens, minst två ruter, 6–10 hp/stp.
- 2♥: 6+ hjärter, 6–10 hp.

Invitbud:
- 2NT: i sekvensen 1♥–1♠–2♦ visar klöverhåll (den enda objudna färgen), 11–12 hp; invit, inte krav.
- 3♣: minst fyrkortsstöd, 10–12 stp.
- 3♦: minst trekortsstöd, 11–12 stp.
- 3♥: minst fyrkortsstöd, 11–12 stp.

Utgång eller krav:
- 3NT: hjärterhåll, 13–15 hp.
- 2♠: fjärde färg, 13+ hp, utgångskrav (Plus-markering i tabellen).

**Viktig sekvensregel – korrigerad efter användarens kontroll:** I 1♥–1♠–2♦ har tre färger visats. 2NT visar därför håll i den enda objudna färgen, **klöver**, och är en **invit med 11–12 hp**. Det är inte krav. Regeln om krav gäller ny färg, inte sang. Hållbudet får inte mekaniskt hämtas från en annan exempelruta.

## 2. Öppnarens 1NT-återbud eller enfärgshand – tryckt s. 16

### 2A. Efter öppnarens 1NT-återbud

Svaga bud:
- Pass: 6–10(11) hp.
- Övriga färgbud: svaga, 6–10 hp (texten om försenad Stayman nedan är ett särskilt undantag).

Invit:
- 2NT: 11–12 hp.

Utgång/krav:
- 3NT: 13–18 hp.
- 2♣, 2♦ eller 2♥ kan vara tredje färg (Plus): 10+ hp och 3+ kort i färgen.
- 2♠ kan vara försenad Stayman (PRO): minst 11 hp, frågar efter öppnarens högfärgslängder.

**Avgränsning:** Tredje färg och försenad Stayman är konventionsmärkta och ska inte läggas in i grundprofilen utan separat beslut.

### 2B. Efter att öppnaren visar enfärgshand

Sidan visar en annan uppsättning exempel och tabellrutor, bland annat:
- Pass: 6–10 hp.
- 2NT: 11–12 hp med håll i de angivna sidofärgerna i exemplet.
- 3♦: 11–12 stp, 3+ ruter.
- 3♠: 11–12 hp, 6+ spader.
- 3NT: 13–18 hp med håll i de angivna sidofärgerna i exemplet.
- Tredje färg (Plus) förekommer med 10+ hp och 3+ kort i angiven färg.
- Ytterligare färgbud visar bland annat 6+ kort i egen färg.

**EJ TÄCKT för generell kodning:** Exakta sidofärgshåll och färgvarianter måste först knytas till respektive visad öppningsfärg och auktion. Dessa rutor får inte generaliseras från en enda exempelgiv.

## 3. Trumfstöd efter en-över-en och efter två-över-en – tryckt s. 17

Sidan innehåller flera separata exempel, inte en enda universell tabell.

### 3A. Efter öppnarens trumfstöd efter en-över-en
Exempelrutor visar bland annat:
- Pass i svag zon.
- 2NT som invit med 11–12 hp och håll i namngivna sidofärger i det aktuella exemplet.
- Ny färg som krav/slaminvit eller kortfärgsvisning i särskilt markerade konventionsgrenar.
- Färghöjningar med stödpoängsintervall och olika stödlängder.

### 3B. Efter svarshandens två-över-en
Exempelrutor visar bland annat:
- 2♠: 11–12 hp, tvåkortsstöd i spader i den visade sekvensen.
- 2NT: 11–12 hp, ruterhåll i den visade sekvensen.
- 3♣: 10–12 hp, 6+ klöver.
- 3♦: fjärde färg, 13+ hp, utgångskrav.
- 3♥: 16+ stp, 4+ hjärterstöd i den visade sekvensen.
- 3♠: 11–12 hp, trekortsstöd i spader.
- 4♥: trumfstöd, 13–15 stp i den visade sekvensen.
- Andra exempel visar bland annat singel hjärter med exakt 11 hp, 3:e färg och kortfärg.

**Systemgräns:** Splinter är avstängt i projektets valda profil. Rutor märkta Plus/Pro eller splinter får inte aktiveras genom denna sidgenomgång.
**EJ TÄCKT:** Ingen av dessa budbetydelser får flyttas till en annan öppnings-/svarsfärg utan en egen kontroll av budordning och källruta.

## 4. Öppnarens tredje bud efter svagt svar eller 2NT-invit – tryckt s. 18

Texten anger att öppnaren ofta passar när svarshanden är svag, men kan bjuda igen med fördelning eller styrka. Invitbud från öppnaren anges generellt som cirka 15–17 hp.

### 4A. Svarshanden återbjuder 1NT
Sidan visar exempel på handtyper och återbud, bland annat:
- 5–4 eller 4–4–4–1: 11–15 hp.
- 6-kortsfärg: 11–14 hp.
- 4-kortsfärg: 15–17 hp.
- 3-kortshjärter: 15–17 hp.
- 6–5-fördelning med flera angivna styrkeintervall.
- Invit omkring (15)16–17 hp.
- Splinter 16–17 hp i en särskild ruta.
- Slutbud.

Dessa är handtyper knutna till exemplens auktioner. De är inte en fristående regel att öppnaren alltid ska återbjuda enligt listan.

### 4B. Svarshanden inviterar med 2NT
Exempelrutor visar bland annat:
- Pass: 11–13 hp.
- 3♣: trekortsstöd i spader, 15–17 hp (exempelbundet).
- 3♦: invit, (15)16–17 hp.
- 3♥: 5–5-fördelning, 15–17 hp.
- 3♠: 6–4-fördelning, 15–17 hp.
- 4♣: minst 6–4-fördelning, stark hand, utgångskrav.
- 3NT som slutbud i den visade grenen.

**EJ TÄCKT:** Exakt prioritet mellan flera samtidigt uppfyllda fördelningsrutor framgår inte tillräckligt generellt. Välj inte automatiskt en färgprioritet.

## 5. Öppnarens tredje bud efter tredje eller fjärde färg – tryckt s. 19

Inledande principtext:
- När svarshanden har gjort ett kravbud ska öppnaren undvika att introducera en ny färg på ett sätt som inte passar kravsituationen.
- Öppnaren kan visa mer längd i första färgen, preferera svarshandens färg eller bjuda sang med håll.
- Hopp till svarshandens första färg visar trekortsstöd i den beskrivna situationen.

### 5A. Efter svarshandens tredje färg
Exempelrutor visar bland annat:
- 2♠ inte tillåtet i den visade auktionen.
- 2NT: inget bättre bud i den visade situationen.
- 3♣: tvåkortshjärter, minimum i den visade sekvensen.
- 3♦: fjärde färg, utgångskrav.
- 3♥: spaderhåll, minimum.
- 3NT: sexkortsfärg, minimum i den visade sekvensen.
- Andra exempel visar 5–5, fyrkortsfärg, 6–4 maximum och trekortsstöd.

### 5B. Efter svarshandens fjärde färg
Exempelrutor visar bland annat:
- 2♦ inte tillåtet i den visade auktionen.
- 2♥: inget bättre bud.
- 2♠: tvåkortsstöd i spader.
- 2NT: ruterhåll.
- 3♣: 5–5-fördelning.
- 3♦: fyrkortsfärg.
- 3♥: 6–4-fördelning, maximum.
- 3♠: trekortsstöd i spader, maximum.
- 3NT inte tillåtet i den visade auktionen.

### 5C. Fortsättning efter tredje färg
Sidan visar bland annat:
- 2NT: fjärde färg, utgångskrav.
- 3♣ och 3NT: invit, 11–12 hp i var sin visad färg-/hållkontext.
- 3♦: 5–5, 11–12 hp.
- 3♥: sexkortshjärter, 11–12 hp.
- Fortsättningar på högre nivå visar bland annat ruterhåll 13+ hp, minst fyrkortsstöd 13+ stp, trekortsstöd 16+ stp, minst sexkortsfärg 16+ stp och slutbud.

**EJ TÄCKT:** Denna del måste kodas per fullständig auktion. Budens betydelser kan inte lossas från exempelbudgivningen och appliceras på andra färgkombinationer.

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
