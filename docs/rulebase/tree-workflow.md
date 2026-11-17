# Arbetsmetod – träd-för-träd

## Bindande arbetssätt
Den nya Lathunden får inte ersätta eller bryta upp det tidigare systematiska arbetet med budträden. Vi fortsätter att använda den befintliga trädkartan, nodinventeringen, runtime-korsreferensen och testerna som arbetsstruktur.

**Arbetsenheten är ett befintligt budträd eller en tydligt avgränsad gren i ett träd – inte ett allmänt ämnesområde.**

Lathundens två PDF:er är ytterligare källor som kopplas in i respektive befintligt träd. Vi skapar inte ett parallellt budsystem och bygger inte om allt från början.

## Arbetscykel för varje träd
1. **Välj ett träd** från den befintliga kartan och lås dess omfattning.
2. **Läs hela trädet**: root, samtliga noder, grenar, terminaler, handprofiler och länkar.
3. **Följ budsekvensen uppifrån och ned**. Kontrollera varje gren och varje alternativt bud, inte bara slutkontraktet.
4. **Koppla källorna**: Nordisk Standard först, därefter rätt sida i Lathunden för ostörd eller störd budgivning. Registrera externa hänvisningar (Bättre bud, PRO, Slam, Plus) separat.
5. **Jämför mot runtime**: vilken funktion/modul bedömer sekvensen i dag? Finns nodmatchning? Finns överlapp med andra träd?
6. **Klassificera varje gren**:
   - verifierad grundregel
   - förtydligande
   - undantag
   - komplettering
   - strategisk/PRO-vägledning
   - källkonflikt
   - ej täckt / behöver expertbesked
7. **Bygg testfall** för positiva, negativa och gränsfall innan kodändring.
8. **Implementera endast när källan och villkoren är tillräckligt tydliga**. Ändra en modul i taget och kör relevanta regressionstester.
9. **Stäm av trädets täckning** och uppdatera nodinventering, runtime-korsreferens och ej-täckta-logg.
10. Gå vidare till nästa träd.

## Ordning
Vi följer den redan dokumenterade ordningen i `KARTA_OSTORD_BUDGIVNING.md` och behåller kontraktsmålen som täckningsvyer, inte separata budsystem.

Startordning:
1. Gemensamma öppnings- och handprofiler: T36.
2. Svarshandens profiler och svar efter 1 i färg: T37.
3. Öppnarens återbud efter 1 över 1: T39.
4. Svarshandens andra bud: T40.
5. Därefter 1NT-familjen, Stenberg/trumfstöd, stark 2♣, 2NT, svaga tvåor/spärröppningar och slam – i den ordning och med de beroenden som redan står i kartan.

Om ett träd visar sig innehålla flera separata logiska familjer delar vi upp arbetet i grenar, men bevarar ursprungligt träd-ID och länkar så att inget tappas bort.

## Störd budgivning
Störd budgivning får sin egen trädkarta och egna träd-ID:n. Den hålls fortsatt pausad för kodändringar tills ostörd fas är färdig, om inte användaren uttryckligen ändrar prioriteringen. Under tiden kan Lathundens störda PDF inventeras och kopplas till de befintliga konkurrensträden utan att ändra dem.

## Regler som inte får brytas
- Nordisk Standard är grundsystemet.
- Lathunden förtydligar och kompletterar, men får inte tyst skriva över grundregler.
- PRO/Plus och strategiska råd hålls åtskilda från obligatorisk systemrättning.
- Ingen regel skapas från DDS, genererade händer eller antaganden.
- Partnerns dolda hand får inte användas i livebeslut; efterhandsanalys hålls separat.
- Varje ej täckt sekvens sparas i expertloggen.
- `main` lämnas orörd; arbete sker på `work/undisturbed-architecture`.

## Statuslogg
| Träd | Källa jämförd | Runtime jämförd | Testfall | Kod ändrad | Status |
|---|---|---|---|---|---|
| T36 | Källor identifierade; exakt sida 8-jämförelse återstår | Runtime-funktion identifierad; detaljgranskning återstår | Ej påbörjat | Nej | Påbörjat – se tree-review-01-T36-T37.md |
| T37 | Lathund sida 10 och NS sida 2 identifierade; sekvensvis jämförelse återstår | resp1() i ettoppningssvar.js identifierad | Ej påbörjat | Nej | Påbörjat parallellt med T36-kartläggningen |
| T39 | Ej påbörjad | Ej påbörjad | Ej påbörjat | Nej | Väntar |
| T40 | Ej påbörjad | Ej påbörjad | Ej påbörjat | Nej | Väntar |

Detaljgranskningen för T36/T37 finns i [Trädgranskning 01 – T36 och T37](tree-review-01-T36-T37.md). Den är en start på käll- och runtime-kopplingen, inte ett godkännande av reglerna eller ett färdigtestat träd.

Denna status är avsiktligt konservativ. Den nya inventeringen av Lathundens sidor räknas inte som att ett träd är färdiggranskat.
