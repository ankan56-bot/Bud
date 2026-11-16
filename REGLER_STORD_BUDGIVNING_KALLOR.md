# Regelunderlag – störd budgivning

**Datum:** 2026-11-16  
**Källa:** Användarens fotografier av *BridgePlus – Nya Bridgeskolan*, s. 90–91, samt användarens uttryckliga preciseringar i chatten.  
**Status:** Källtranskribering och regelbeslut. Inte ännu infört i produktionsmotorn.

## 1. Störd budgivning – grundregler (s. 90)

Bokens sammanfattningsruta anger:
- Poängstyrkan för att bjuda är oförändrad.
- Ny högfärg kräver minst fem kort.
- 1NT lovar håll i motståndarnas inklivsfärg.

Brödtexten anger dessutom:
- Passa med 0–5 hp/stp.
- Oftast bjuda med minst 6 hp/stp.
- Ett två-över-ett-svar visar fortfarande minst 11 hp, eller 10 hp och en ensekortsfärg. Formuleringen om 10 hp och ensekortsfärg behöver verifieras mot en skarpare källbild innan den används som maskinregel.
- En lågfärg får fortfarande bjudas med fyra kort.
- 1NT-svar på 6–10 hp får endast användas om handen har håll i motståndarnas inklivsfärg. Utan håll finns risk att motståndarna tar många stick i den färgen.

Exemplen på sidan illustrerar att 1NT inte ska väljas utan hjärterhåll och att en sexkortsfärg kan motivera ett naturligt färgbud.

## 2. Negativa dubblingar efter 1♣/1♦ (s. 91)

Bokens markerade regelruta anger:
- Dubbling av ett 1♥-inkliv visar **exakt fyra spader**.
- Dubbling av ett 1♠-inkliv visar **minst fyra hjärter**.

Exemplen på sidan visar negativa dubblingar efter partnerns 1♦- respektive 1♣-öppning. Bildmaterialet ger inte någon fullständig fortsättningsstruktur för alla bud efter den negativa dubblingen. Sådana fortsättningar ska inte fyllas i med antaganden.

## 3. Slambegränsning efter motståndarnas ingripande – användarens uttryckliga regel

Användaren har uttryckligen fastställt följande strategiska begränsning för vår sida:
- Om motståndarnas dubblare har visat 13 HP, ska vår sida inte rekommendera slam. Då återstår högst 27 HP för vår sida.
- Ett motståndarkliv på tvåtricksnivån ska också stänga slamrekommendationer för vår sida; användarens angivna skäl är att högst 27 HP återstår.
- Efter ett motståndarkliv på entricksnivån ska slam också vara uteslutet när inklivarens partner har hunnit lämna ett svar.

Detta är en **strategisk spärr för slamförslag**, inte ett påstående om att alla fortsatta utgångsbud ska upphöra. Vanlig budgivning kan fortsätta, men motorn får inte föreslå slam i dessa lägen.

### Öppen teknisk kontrollpunkt

Nuvarande rattningsmotor.js beskriver enkelt inkliv på tvåtricksnivån som 12–17 HP. Det är inte samma sak som en säker miniminivå på 13 HP. Innan slamspärren kopplas till den befintliga styrkeberäkningen måste denna skillnad hanteras uttryckligt. Den användarbeslutade slamspärren ska inte i tysthet användas för att ändra själva inklivets styrkeintervall.

## 4. Vad källan inte fastställer

De fotograferade sidorna fastställer inte:
- Att Nord–Syd i alla lägen ska fortsätta helt som i ostörd budgivning efter en dubbling.
- Samtliga svar och återbud efter negativ dubbling.
- Alla fortsättningar efter upplysningsdubbling eller inkliv.
- En komplett regel för när utgång ska bjudas efter motståndarnas ingripande.

Därför ska dessa positioner tills vidare markeras **ej täckta** om de inte redan har en separat, verifierad regel.

## 5. Implementeringsordning

1. Lägg till källbaserade tester för 1NT-håll, femkortskravet i ny högfärg och fyrkortskravet i lågfärg.
2. Lägg till exakta tester för de två negativa dubblingsfallen.
3. Inför slamspärren som en separat kontroll av motståndarnas budhistorik; den ska inte ändra grundvärderingen av handen.
4. Testa alla konkurrenssekvenser för att säkerställa att en slamspärr inte felaktigt blockerar vanliga utgångsbud.
5. Låt odefinierade fortsättningar vara ej täckta.

Ingen produktionsregel ska ändras enbart utifrån en otydlig formulering i fotografiet.