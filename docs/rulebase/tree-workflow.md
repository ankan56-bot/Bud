# Arbetsmetod – träd-för-träd

## Bindande grundprincip
**Nordisk Standard är grundsystemet och har alltid företräde.** Lathundarna är kompletterande källor. De får förtydliga eller komplettera, men får aldrig tyst skriva över Nordisk Standard.

Vi behåller befintliga träd-ID:n, trädkartan, nodinventeringen, runtime-korsreferensen och testerna. Vi skapar inget parallellt budsystem.

## Förarbete – Lathundarna
Innan nästa budmodul öppnas ska båda Lathundarna inventeras:
- Ostörd budgivning: *Bridge Lathund bok(2).pdf*.
- Störd budgivning: *Bridge Lathund störd budgivning.pdf*.

Ämnes- och källkartan finns i [Lathundens källinventering](lathund-source-inventory.md). Alla olösta källkonflikter och sekvenser som kräver expertbedömning samlas i [Lathundens expertfrågelogg](lathund-expert-questions.md).

Källinventeringen är en karta, inte en färdig regeltranskription. Varje budruta som ska påverka rättningen måste därefter verifieras mot originalsidan och jämföras med Nordisk Standard. OCR får endast vara läshjälp, aldrig ensam regelkälla.

För varje regel registreras:
1. Exakt budsekvens och position.
2. Vad budet visar.
3. HP/HTP/STP, färglängd, stöd och handtyp.
4. Fortsättningar och alternativa bud.
5. Källa och sidnummer.
6. Klassificering: grundregel, förtydligande, komplettering, strategiskt råd, hänvisning, konflikt eller expertfråga.

Hänvisningar till Bättre bud, PRO, Plus och Slam ska hållas åtskilda från innehåll som faktiskt står i Lathunden. Oklara uttryck som inte är kvantifierade får inte bli påhittade villkor.

**Ingen kodändring görs under detta förarbete.**

## Arbetscykel för varje befintligt träd
1. Lås trädets omfattning.
2. Läs hela trädet: root, noder, grenar, terminaler, handprofiler och länkar.
3. Följ varje budsekvens uppifrån och ned.
4. Jämför först med Nordisk Standard, därefter med relevant Lathundssida.
5. Jämför med runtime: funktioner, moduler och eventuell överlappning.
6. Klassificera varje gren.
7. Bygg positiva, negativa och gränsfall som test.
8. Implementera först när källan och villkoren är tydliga.
9. Uppdatera nodinventering, runtime-korsreferens och expertloggen över ej täckta sekvenser.
10. Kör relevanta regressionstester innan nästa träd.

## Ordning och nästa modul
Det tidigare träd-för-träd-arbetet ska bevaras. T36/T37-dokumentationen är preliminär och får inte tolkas som att dessa träd är färdiggranskade.

När källinventeringen och jämförelsen är klara är nästa avgränsade modul enligt användarens senaste prioritering **Trumfstöd**. Stenberg ska återanvändas som en befintlig delkomponent/undersekvens och inte dupliceras som ett separat parallellt system. Trumfstöd blir den övergripande modulen som anropar Stenberg där budsekvensen kräver det. ÖH 2♣ har nu öppnats som nästa modul och är implementerad till och med öppnarens 4NT-återbud. Senare fortsättningar efter 2NT/4NT ligger utanför den här avgränsningen. Vi ändrar inte ordning eller skapar nya träd utan att bevara befintliga ID:n och länkar.

## Störd budgivning
Den störda Lathunden inventeras nu som källa, men kodändringar i störd budgivning är fortsatt pausade medan ostörd budgivning prioriteras, om inte användaren ändrar detta.

## Regler som inte får brytas
- Nordisk Standard är grundsystemet.
- Lathunden kompletterar; den ersätter inte grundsystemet.
- PRO/Plus och strategiska råd hålls isär från obligatorisk systemrättning.
- DDS är efterhandskontroll, inte ensam sanningskälla.
- Ingen regel skapas från genererade händer eller antaganden.
- Partnerns dolda hand används inte i livebeslut.
- Alla ej täckta sekvenser sparas i separat expertlogg.
- `main` lämnas orörd; arbete sker på `work/undisturbed-architecture`.

## Status
| Arbetsdel | Status |
|---|---|
| Identifiera och läsa in båda Lathundarna | Genomfört; båda PDF:erna är visuellt öppnade och sidindelade |
| Skapa ämnes- och källkarta | Genomförd på ämnesnivå; sidgränser och flera tabeller rättade efter visuell kontroll |
| Sekvensvis avläsning av varje ruta och exakt poängvillkor | Pågår; öppnings-/svarsfamiljer, 1NT, stark 2♣, slam och delar av störd budgivning visuellt kontrollerade. Tryckt s. 18–19 i ostörd PDF är svårläst. |
| Jämförelse mot Nordisk Standard | Pågår; första jämförelser finns i lathund-nordisk-standard-crosscheck.md och strong-2c-source-review.md |
| Konflikt- och expertfrågelogg från jämförelsen | Påbörjad i lathund-expert-questions.md; varje olöst sekvens ska föras dit |
| Trumfstöd | Nästa prioriterade modul; arkitekturprincip fastställd: övergripande trumfstödsmodul återanvänder befintlig Stenberg-komponent, utan duplicering. Källgranskning återstår. |
| ÖH 2♣ | Implementerad till och med öppnarens återbud 4NT; alltid 2♦ som svar. Nya gränstester tillagda och CI inkopplad. |
| Kodändring | Pågår i avgränsade moduler; 2♣ är implementerad till 4NT. `main` är orörd. |
