# Trumfstöd – källgranskning och modulgräns

**Status:** Källbasen är jämförd på huvudnivå. Modulen finns redan i arbetsgrenen men denna fil är en käll- och arkitekturgranskning, inte ett godkännande av varje implementation.  
**Normerande källa:** Nordisk Standard, 2012-08-22, s. 2–3.  
**Kompletterande källa:** *Bridge Lathund bok(2).pdf*, tryckt s. 9–13.  
**Arbetsgren:** `work/undisturbed-architecture`.

## 1. Arkitekturbeslut

Trumfstöd är den övergripande modulen för stödvisningar och öppningshandens återbud efter 1 i färg. Stenberg är en återanvänd specialmodul under trumfstödsmodulen.

- `trumfstod.js` äger flödet för svarshandens stödvisning och routing. Splinter är pausad enligt användarens uttryckliga systembeslut och är inte en aktiv budgren.
- `stenberg.js` äger Stenberg 2NT: kvalificering, öppnarens första svar och Stenbergfortsättningar.
- `ettoppningssvar.js` fortsätter att äga de generella svaren och öppnarens vanliga återbud efter 1 i färg.
- Hög-/lågfärgsmodulerna fortsätter hantera naturliga färgbud och vanliga återbud.
- Det skapas inte en andra Stenbergimplementation och Stenbergreglerna kopieras inte in i trumfstödsmodulen.

Detta är rätt modulgräns: trumfstöd är användarens tränings-/rättningsområde, medan Stenberg är en specifik konvention som återanvänds inom området.

## 2. Nordisk Standard – svarshandens stödvisningar

### 1 lå öppning
- 2 lå: 6–9 htp, 4+ stöd. Om svarshanden har egen 4+ högfärg ska högfärgen visas först.
- 3 lå: 10–12 htp, 4+ stöd.
- 4 lå: spärrbud, max 9 htp, bra stöd och svitad hand.
- 2NT: 13+ htp, 4+ stöd; Stenberg och utgångskrav.
- Dubbelhopp i ny färg för renons finns beskrivet i källan men är pausat och ska inte rekommenderas i den aktiva motorn.

### 1 hö öppning
- 2 hö: 6–9 htp, 4+ stöd.
- 3 hö: 10–12 htp, 4+ stöd.
- 4 hö: spärrbud, max 12 htp, bra stöd och svitad hand.
- 2NT: 13+ htp, 4+ stöd; Stenberg och utgångskrav.
- Dubbelhopp i ny färg: renons i bjuden färg, 4+ stöd och 13+ htp.

### Gemensamma principer
- Med 4+ stöd i öppnad högfärg visas stödet alltid.
- Med stöd i öppnad lågfärg och egen 4+ högfärg visas högfärgen först.
- Stödpoäng/htp ska användas enligt Nordisk Standards definition. Lathundens stp får inte blandas in utan att poängdefinitionerna är verifierade.

## 3. Nordisk Standard – Stenberg 2NT

Stenberg kräver 4+ stöd och är utgångskrav.

### Efter 1 hö–2NT
- 3 hö: extra styrka, 15+ htp, ingen singel.
- 3 lå: singel i den bjudna lågfärgen.
- 3 andra hö: singel i den andra högfärgen.
- 3NT: 12–14 hp, balanserad hand.

### Efter 1 lå–2NT
- 3 lå: extra styrka, 15+ htp, ingen singel.
- 3 andra lå: singel i den andra lågfärgen.
- 3 hö: singel i högfärgen.
- 3NT: 12–14 hp, balanserad hand.

Renons efter Stenberg, flera singeltoner utan prioritet och andra handtyper som inte motsvarar tabellen ska inte få påhittade återbud.

## 4. Nordisk Standard – öppningshandens vanliga andra bud med trumfstöd

När SH bjudit en färg och ÖH har 4+ stöd:
- billigaste möjliga höjning: 12–16 htp;
- höjning med enkelhopp: 17–19 htp;
- hopp till utgång: 20+ htp.
- Vid stöd i lågfärg ska 3NT undersökas först när det är relevant enligt källan.

Övriga handtyper efter en-över-en – egen 6+ färg, balanserad hand och tvåfärgshand – ligger i de befintliga generella svar-/återbudsmodulerna och ska inte dupliceras här.

## 5. Lathunden – kompletterande iakttagelser

### Tryckt s. 9
- Pass 0–5 stödpoäng.
- Enkelhöjning 6–10 stödpoäng; Lathunden nämner ibland 3-stöd + singelton och märker detta Plus.
- Dubbelhöjning 11–12 stödpoäng.
- 2NT minst 13 stödpoäng, utgångskrav.
- Splinterrutorna visar kortfärg/renons och 13+ stödpoäng, men vissa fall är märkta PRO.
- Lathunden säger att SH med stöd i lågfärg och minst fyra kort i högfärg ska inleda med högfärgen.

### Tryckt s. 11 – Stenberg
Lathunden visar efter 1 lå–2NT:
- ny färg = kortfärg (hänvisning Bättre bud);
- 3 lå = ingen kortfärg, 16+ stödpoäng;
- 3NT = ingen kortfärg, 12–15 stödpoäng.

Efter 1 hö–2NT visar den:
- ny färg = kortfärg (Bättre bud);
- 3 hö = ingen kortfärg, 16+ stödpoäng;
- 4 hö = ingen kortfärg, 12–15 stödpoäng.

Dessa fortsättningar avviker från Nordisk Standards exakta budbetydelser. Nordisk Standard styr därför i rättningsmotorn. Lathundens tabeller kan endast användas som kompletterande material efter separat beslut.

### Tryckt s. 11–13 – fortsättningar
- Lathunden visar fortsättningar efter Stenbergsvar, bland annat 3NT utan kortfärg/slamintresse, 4 i trumf som slutbud, 4 lå som singleton/slamintresse och 4NT som essfråga i vissa exempel.
- Efter enkelhöjning och två-över-en visas ytterligare invit-, kontroll- och splintersekvenser. Flera är märkta Bättre bud, Plus eller PRO.
- Dessa fortsättningar måste hållas knutna till exakt budsekvens och hänvisning. De får inte utvidga NS-grenen utan systembeslut.

## 6. Källkonflikter och öppna gränser

1. **Styrkegräns Stenberg:** NS använder 15+ htp utan singel och 12–14 hp balanserad; Lathunden anger 16+ stp respektive 12–15 stp i sina tabeller. NS gäller.
2. **Bud för kortfärg:** NS visar singelton genom specifika bud efter öppningens färgtyp. Lathunden hänvisar till Bättre bud och använder ny färg som kortfärg. Endast NS-tabellen är norm.
3. **3NT efter Stenberg:** NS anger 12–14 hp balanserad. Lathundens 12–15 stp/ej kortfärg är inte samma villkor.
4. **3-stöd:** Lathunden nämner trestöd plus singelton i Plus-material. NS:s standardstöd kräver 4+ kort. Ingen generell 3-stödsregel.
5. **Spärrhöjning:** NS:s 1 lå–4 lå och 1 hö–4 hö har olika maxstyrka (9 respektive 12 htp) och kräver bra stöd/svitad hand. Kvalitativa villkor får inte förenklas till enbart poänggräns.
6. **Renons/splinter:** NS beskriver dubbelhopp i ny färg för renons, 4+ stöd och 13+ htp. Användaren har dock beslutat att splinter ska tas bort ur den nuvarande budgivningen tills grundmotorn är stabil. Därför är splinter inaktiv i runtime och ska inte rekommenderas eller tolkas; Stenberg 2NT påverkas inte.
7. **Sök högfärg:** med lågfärgsstöd och 4+ högfärg visas högfärgen först. Denna prioritet går före att välja en splinterrenons.

## 7. Kontroll av befintlig kod

Följande filer är redan etablerade:
- `trumfstod.js`
- `stenberg.js`
- `ettoppningssvar.js`
- `tests/trumfstod.test.js`
- `tests/stenberg-2nt.test.js`

Läsgranskningen visar att arkitekturens avsikt redan följer vald modulgräns: trumfstöd routar Stenberg vidare till den separata Stenbergmodulen. Koden innehåller också källgap för flera renoncer och Stenberg-handtyper som saknar prioritet. Dessa skydd ska bevaras.

### Kontrollpunkter innan modulens avslut
- Kontrollera att trumfstödsroutingen inte gör generella bud till stödsekvenser.
- Säkerställ att Stenberg endast aktiveras med 4+ stöd och 13+ htp.
- Säkerställ att 4+ högfärg visas före lågfärgsstöd.
- Säkerställ att 4-läges spärrhöjning har separata maxgränser för hög- respektive lågfärg.
- Säkerställ att pausad splinter inte aktiveras eller rekommenderas; 2NT Stenberg ska fortsatt prövas enligt sina egna villkor.
- Alla sekvenser som saknar uttryckligt källstöd ska hamna i expertloggen.

## 8. Slutsats

**Behåll trumfstöd som en separat övergripande modul och återanvänd Stenberg som delmodul.** Den befintliga uppdelningen är bättre än att slå ihop all Stenberglogik med generell trumfstödslogik. Nästa arbete ska vara sekvensvis test- och källkontroll av trumfstödsmodulen, inte en omskrivning från början.
