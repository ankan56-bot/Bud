# Källgranskning inför nästa regelarbete – 2026-11-15

## Syfte

Fastställa vad som faktiskt stöds av den auktoritativa systemkällan för tre prioriterade luckor:
1. Svar efter partnerns inkliv.
2. Återbud från den som gjort upplysningsdubblingen efter partnerns svar.
3. Öppnarens tredje bud efter att svarshanden har bjudit 2NT.

Auktoritativ källa är användarens åtta sidor långa **Nordisk standard, 2012-08-22** (`nordisk_standard.pdf`, tillgänglig i Library). Rättningsmotorn och analysbiblioteket är implementation respektive analysunderlag – de ersätter inte originaldokumentet.

## 1. Svar efter partnerns inkliv

### Belagt i Nordisk standard, sida 7
Rubriken är **”Svar på inkliv med 1 hö/♦”**:
- 1NT: 8–10 hp, balanserad med håll i öppningsfärgen.
- 2NT: 11–13 hp, balanserad och bra håll i öppningsfärgen.
- 3NT: 14+ hp, balanserad och bra håll i öppningsfärgen.
- Enkel höjning: 6–9 hp och trekortsstöd.
- Dubbel höjning: 6–9 hp och fyrkortsstöd.
- Trippel höjning: 6–9 hp och femkortsstöd.
- Ny färg: 8+ hp, femkortsfärg och rondkrav; 10+ hp om budet är på 2-nivån.
- Hopp i ny färg: 14+ hp, bra sexkortsfärg och utgångskrav.
- Överbud i motståndarnas färg: 10+ hp och trekortsstöd.

Sidan anger också att ett enkelt inkliv normalt visar 12–17 hp, med särskilda villkor för 1-högfärgsinkliv, och att hoppande inkliv visar 6–10 hp med minst sex kort.

### Begränsningar
- Tabellen är uttryckligen avgränsad till inkliv med 1-högfärg/1-ruter. Den kan inte utan vidare kopieras till 2-nivåinkliv eller hoppande 3-nivåinkliv.
- För hoppande 2-högfärgsinkliv anger sidan att fortsättningen är som efter en svag 2-högfärgsöppning. Sida 4 anger då: ny färg 5+ och krav till minst 3 i öppningsfärgen; 3 i öppningsfärgen är spärrhöjning med 3+ stöd, ej invit; 3NT är slutbud; hopp i ny färg visar renons och slaminvit; 2NT är invit med 2+ stöd. Användaren har också uttryckligen korrigerat att 2♥–3♥ och 2♠–3♠ är spärrbud, inte invitbud (2026-11-12). Efter 2NT visar öppnaren 3 i öppningsfärgen med 6–8 hp och 3NT/4 i högfärgen med 9–10 hp. Dokumentet anger däremot ingen exakt styrkegräns för när svarshanden ska välja 2NT-invit kontra spärrhöjningen, och inte heller en exakt styrkegräns för hoppande slaminvit i ny färg.
- Den aktuella luckgruppen innehåller svar efter 1-nivå, 2-nivå, hoppande 3-nivå och 2NT-inkliv. Bara 1-nivågruppen har en fullständigare numerisk svarstabell på sida 7. Hoppande 2-högfärgsinkliv hänvisas vidare till svag-två-strukturen, men där saknas vissa numeriska valgränser.
- Det tidigare sexkortskravet för egna 2-nivåinkliv är en regel om inklivarens eget bud; det får inte förväxlas med partnerns svar.

### Slutsats
Svar efter 1-högfärgs-/1-ruterinkliv kan implementeras enligt tabellen på sida 7, och den avgränsade implementationen finns nu i `rattningsmotor.js` version 7.1 med tester i `testdata/overcall-responses.test.js`. Hoppande 2-högfärgsinkliv har en hänvisning till svag-två-strukturen men behöver en separat, försiktig implementering eftersom invit-/spärrgränsen inte är numeriskt definierad. 2-lägesinkliv i lågfärg, hoppande 3-nivåinkliv och 2NT-inkliv förblir ej täckta. T29–T32 beskriver svar efter motståndarnas inkliv över vår öppning och är inte samma situation; de är dessutom märkta `analysis_only`.

## 2. Återbud efter upplysningsdubbling

### Belagt i Nordisk standard, sida 8
Under **”D som upplysningsdubbelt”**:
- D visar 12+ hp och minst tre kort i objudna färger, eller 17+ hp med alla fördelningar.
- Normalt har dubblaren alltså stöd i objudna färger och vill att partnern väljer sin längsta färg.
- Partnern måste i detta läge bjuda ut sin hand direkt.
- Ny färg är inte krav.
- Om dubblaren saknar stöd och bjuder egen färg eller NT visar det starka kort, 18+ hp.

Därefter följer tabellen **”svar på D (upplysningsdubbling)”** för partnerns första svar:
- 1NT: 6–9 hp och håll i öppningsfärgen.
- 2NT: 10–12 hp och håll i öppningsfärgen.
- 3NT: 13+ hp och håll i öppningsfärgen.
- Färg på lägsta nivå: 0–7 hp (i värsta fall trekortsfärg).
- Hopp i färg: 8–9 htp, fyrkortsfärg.
- Hopp till 3-läget: 10–12 htp, helst femkortsfärg.
- Överbud: 10+ hp och krav så länge nya färger bjuds.
- Pass: endast med många kort i öppningsfärgen.

### Vad källan inte anger
Sidan ger dubblarens styrka och partnerns första svar, men ingen fullständig tabell för **dubblarens återbud efter partnerns svar**. Den anger inte hur dubblaren ska skilja mellan minimum/maximum, balanserad hand, egen lång färg eller preferens efter partnerns val.

De åtta fallen i `double-rebid-8-audit.md` är just dubblerarens senare återbud. De får inte lösas genom att återanvända `respDouble()`, som är svarshandens första bud efter partnerns dubbling av motståndarnas öppning. Giv 13 i loggen gäller också svarshandens stöd efter dubbling, inte dubblarens återbud.

### Slutsats
Upplysningsdubblingens öppningsstyrka och partnerns första svar kan verifieras mot sida 8. Källan ger också 18+-betydelsen för återbud utan stöd, men den gäller inte de åtta inventerade fallen eftersom dubbleraren har 3+ stöd i samtliga. Dessa åtta återbud saknar därför fortfarande en användbar fortsättningsregel och ska förbli ej täckta.

## 3. Öppnarens tredje bud efter svarshandens 2NT

### Exakt fall
`final_gaps_2.md` beskriver:
- Auktion: 1♣–Pass–1♠–Pass–2♣–Pass–2NT–Pass–?
- Aktuell spelare: öppnaren.
- Öppnarens hand: 13 hp, fördelning 1–4–3–5 (♠–♥–♦–♣).

### Närliggande regel i Nordisk standard, sida 3
Dokumentet har ett närliggande exempel:
- 1♥ – 1♠ – 2♣ – 2NT: svarshanden visar 10–12 hp, balanserad hand, två hjärter samt håll i spader och ruter.
- Nästa rad visar 3♥ och anger 10–12 htp samt ”3-korts ♥”, med kommentaren att öppnaren redan har visat 5+ hjärter efter 2♣.

Det finns en intern motsägelse i den sista raden: öppnaren har redan visat minst fem hjärter genom 1♥ och 2♣, så uppgiften ”3-korts ♥” kan inte utan vidare beskriva öppnarens hand. Budet 3♥ står dessutom i öppnarens kolumn i originalets uppställning. Det kan vara ett skrivfel i färgangivelsen eller i handbeskrivningen. Därför använder vi den tydliga beskrivningen av svarshandens 2NT som information, men inte 3♥-raden som ett säkert facit för öppnarens tredje bud.

Exemplet gäller dessutom en annan sekvens: öppnaren började med 1♥ och visade därefter klöver som andra färg. Det kan inte överföras till 1♣–1♠–2♣, där öppnaren återbjuder sin öppningsfärg.

Sida 3 beskriver också öppnarens andra bud med egen 6+ färg, balanserad hand och tvåfärgshand, men ger inte en generell regel för öppnarens tredje bud efter svarshandens 2NT när öppnaren har återbjudit sin egen färg.

Stenberg 2NT är inte relevant här: den konventionen används som svar på öppnarens färgöppning med 13+ htp och minst fyrkortsstöd. Inte heller är detta svar på en 2NT-öppning.

### Slutsats
Det finns ett närliggande 2NT-exempel på sida 3, men det fastställer inte öppnarens fortsättning i den aktuella sekvensen. Dessutom är 3♥-radens förklaring internt motsägelsefull. Positionen är korrekt klassificerad som öppnarens tredje bud och ska förbli ej täckt tills en entydig fortsättning kan beläggas.

## Beslut för implementation

| Område | Vad kan användas nu? | Vad får inte göras ännu? |
|---|---|---|
| Svar efter partnerns 1-högfärgs-/1-ruterinkliv | Svarstabellen på sida 7, med angivna nivåer och handvillkor | Applicera tabellen generellt på 2-/3-nivå eller 2NT-inkliv |
| Återbud efter upplysningsdubbling | Sida 8 ger dubblarens grundkrav och partnerns första svar | Hitta på dubblarens senare återbud eller återanvända `respDouble()` |
| Öppnarens tredje bud efter 2NT | Det specifika 1♥–1♠–2♣–2NT-exemplet kan användas i just den sekvensen | Överföra 3♥-fortsättningen till 1♣–1♠–2♣–2NT |

## Nästa tekniska steg

1. Kör regression på den implementerade 1-nivåtabellen och kontrollera den genererade 140-givarsbaslinjen.
2. Utred den separata hänvisningen för hoppande 2-högfärgsinkliv; behåll den ej täckt där val mellan invit och spärr inte kan avgöras säkert.
3. Behåll de åtta dubblaråterbuden som ej täckta; ingen motorregel införs utan kompletterande systemkälla eller uttryckligt godkänt partnerskapsbeslut.
4. Behåll öppnarens tredje bud i 1♣–1♠–2♣–2NT som ej täckt. Lägg däremot ett positivt regressionstest för det dokumenterade exemplet 1♥–1♠–2♣–2NT–3♥ med dess uttryckliga handvillkor.
5. Kör hela 140-givarsbaslinjen och befintliga regressionstester efter varje avgränsad ändring. Ingen DDS-bedömning ska användas som budfacit.

## Verifieringsstatus

- Källan har lästs i sin helhet: 8 sidor, Nordisk standard 2012-08-22.
- Denna rapport skiljer nu mellan uttryckliga källregler, närliggande men ej överförbara exempel och verkliga luckor.
- Svarstabellen efter 1-högfärgs-/1-ruterinkliv är implementerad, version 7.1. Slutlig CI-körning för den uppdaterade testsviten inväntas.
- Övriga nämnda svarslägen och de två andra prioriterade luckorna är inte ändrade.
- `main` är orörd.
