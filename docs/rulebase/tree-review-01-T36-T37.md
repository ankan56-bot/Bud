# Trädgranskning 01 – T36 och T37

**Arbetsgren:** `work/undisturbed-architecture`  
**Analysbibliotek:** version 0.6.43 (52 träd)  
**Källor:** Nordisk Standard (grund-PDF), Bridge Lathund bok(2).pdf (ostörd), visuellt granskade sidor.

## Varför börjar vi här?
Detta följer den tidigare ostörda trädkartan: först öppningshandens profiler (T36), därefter svarshandens profiler efter 1 i färg (T37). Vi hoppar inte till en ny fristående ämnesordning. T36/T37 är startpunkten för den befintliga kedjan T36 → T37 → T39 → T40.

## T36 – öppningshandprofiler efter 1 i färg

- Befintligt träd-ID: `T36_OPPNING_HANDPROFILER`
- Noder: 4 (`t36_1c`, `t36_1d`, `t36_1h`, `t36_1s`)
- Trädets nuvarande funktion: beskriver öppningshandens profil efter 1♣/1♦/1♥/1♠.
- Källkoppling:
  - Lathund ostörd, PDF-sida 1, tryckt sida 8: öppningsbud och handtyper.
  - Nordisk Standard, tidigare genomgången öppningsregel på PDF-sida 2.
- Befintlig projektregel i trädet: öppningsfärgsprioritet och handprofil. Den ska jämföras med källorna, inte automatiskt ersättas.

### Grenvis granskningslista
| Nod | Sekvens | Fråga mot Lathunden | Fråga mot Nordisk Standard | Status |
|---|---|---|---|---|
| t36_1c | 1♣ | Hur beskriver Lathunden längdkravet och undantagen? | Stämmer 12–19 hp, 4+ färg och 11 hp-undantaget? | Källjämförelse kvar |
| t36_1d | 1♦ | Vilket längd-/prioritetskrav anges? | Kontrollera samma grundregel och öppningsprioritet. | Källjämförelse kvar |
| t36_1h | 1♥ | Bekräftar sidan 8 minst 4 kort och styrkeintervall? | Jämför 4+ färg och undantag. | Källjämförelse kvar |
| t36_1s | 1♠ | Bekräftar sidan 8 minst 4 kort och styrkeintervall? | Jämför 4+ färg och undantag. | Källjämförelse kvar |

**Viktigt:** färgval mellan lika långa färger är ett separat systembeslut. Lathundens tryckta sida 8 måste läsas för den exakta prioriteten; den får inte härledas från trädtiteln eller nuvarande kod.

## T37 – svarshandens profiler efter 1 i färg

- Befintligt träd-ID: `T37_SVAR_1_I_FARG_HANDPROFILER`
- Noder: 18.
- Omfattning: 1 över 1, 1NT-svar och 2 över 1 efter öppning 1♣/1♦/1♥/1♠.
- Källkoppling:
  - Lathund ostörd, PDF-sida 2, tryckt sida 10: svar på 1 i färg och styrke-/längdkrav.
  - Nordisk Standard, tidigare genomgången PDF-sida 2: 1-nivåsvar 6+ hp/4+ färg och 2-över-1 11+ hp/4+ färg, rondkrav.
  - Lathundens tryckta sida 11 innehåller även Stenberg/fortsättningar; det tillhör senare T34/Stenberg-granskning, inte T37:s första svarsrond.

### Nodgrupper
1. 1-över-1:
   - `t37_1c1d`, `t37_1c1h`, `t37_1c1s`
   - `t37_1d1h`, `t37_1d1s`
   - `t37_1h1s`
2. 1NT-svar:
   - `t37_1c1nt`, `t37_1d1nt`, `t37_1h1nt`, `t37_1s1nt`
3. 2-över-1:
   - `t37_1d2c`, `t37_1d2h`, `t37_1d2s`
   - `t37_1h2c`, `t37_1h2d`
   - `t37_1s2c`, `t37_1s2d`, `t37_1s2h`

### Viktiga kontrollpunkter
- Kontrollera varje sekvens separat mot tryckt sida 10; ett generellt intervall får inte appliceras om Lathunden anger ett särskilt undantag.
- Skilj HP från HTP när svarshanden har stöd i öppningsfärgen.
- Kontrollera om 1NT-svaret är begränsat av färgval och stöd, och om det uttryckligen kräver balanserad hand. Det befintliga trädet säger på flera ställen att handen inte behöver vara balanserad.
- Jämför 2-över-1:s 11+ hp/4+ färg i Nordisk Standard med de alternativa villkor som eventuellt står i Lathunden. Eventuell 10 hp + 6-kortsfärg får inte göras till generell regel utan ordagrant källstöd.
- Om Lathunden anger en annan gräns än Nordisk Standard: registrera `conflict_review` eller `clarification_candidate` med båda sidreferenserna. Ingen tyst ändring.
- Kontrollera 1♣–1♦ särskilt: det är en sekvens med både svar på 1-nivån och ett svar som kan vara del av andra fortsättningsgrenar; matchningen ska inte förväxlas med T39/T40.

## Arkitektur- och täckningsfynd
- T36 har fyra noder och T37 har 18 noder. I nuvarande JSON saknar dessa noder utgående grenar. Det är inte automatiskt ett fel eftersom träden fungerar som handprofil-/sekvensregister, men de är inte kompletta navigerbara budträd i betydelsen sammanlänkade beslutsträd.
- Innan noderna byggs ut ska vi avgöra om de ska vara kanoniska profil-/regelposter som andra träd refererar till, eller om det behövs explicita beslutslänkar. Vi ska inte skapa dubbla sekvensnoder bara för att fylla ut trädet.
- Befintlig runtime för svar efter 1 i färg går via gemensam `resp1()` i `ettoppningssvar.js`, med separata hög-/lågfärgsmoduler som delegerar dit. Den faktiska implementationen måste jämföras mot samtliga 18 T37-profiler.
- Ingen kodändring görs i denna granskning.

## Nästa steg
1. Slutför källjämförelsen för T36 och T37 med fullständig regeltranskription från tryckt sida 8–10.
2. Skapa testmatris för varje nod och varje gränsvärde.
3. Jämför testmatrisen med `resp1()` och öppningsmodulerna.
4. Dokumentera alla avvikelser/oklarheter i granskningsregistret och expertloggen.
5. Gå vidare till T39 först när T36/T37 är klassificerade.

## Status
**T36/T37:** källor och runtime identifierade; fullständig sekvensvis jämförelse och testmatris återstår.  
**Kodändringar:** inga.
