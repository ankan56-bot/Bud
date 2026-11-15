# Källgranskning inför nästa regelarbete – 2026-11-15

## Syfte

Fastställa vad som faktiskt stöds av det befintliga systemunderlaget för tre prioriterade luckor:
1. Svar efter partnerns inkliv.
2. Återbud från den som gjort upplysningsdubblingen efter partnerns svar.
3. Öppnarens tredje bud efter att svarshanden har bjudit 2NT.

Detta är en källinventering, inte en ny systemdefinition. Inga budregler eller motorgrenar ändras genom denna rapport.

## Källornas status

I arbetsgrenens rot finns ingen separat systembok, PDF, konventionsbilaga eller annan extern originalkälla. Det tillgängliga underlaget består av:
- `LOGG_BUDREGLER.md`: tidigare beslut och enskilda givobservationer.
- `analysbibliotek.json`: pedagogiska budträd. Träden T29–T33 är uttryckligen analysunderlag (`analysis_only`), inte godkända grundsystemregler.
- `rattningsmotor.js`: den nuvarande implementationen. Den kan visa vad motorn gör, men är inte oberoende bevis för att systemtolkningen är korrekt.
- Granskningsrapporterna i `testdata/`: inventeringar av luckor och tekniska orsaker; de är inte facit.

Därför kan en regel som endast förekommer i motorkod eller i ett analysbibliotek inte automatiskt upphöjas till auktoritativ systemregel.

## 1. Svar efter partnerns inkliv

### Vad som är belagt
- Loggen anger att ett inkliv på 2-nivån kräver minst sex kort i inklivsfärgen. Detta gäller inklivarens eget bud, inte partnerns svar.
- Giv 21 visar ett exempel med 1♥–(2♣)–Pass–Pass–2♥, där öppnarens återbud bedöms som rimligt. Det fastställer inte svarssystemet för inklivarens partner.
- Giv 24 visar 1♣–(2♥)–Pass–2♠–..., men loggen markerar uttryckligen svaret 2♠ som ej täckt.
- `hand-specific-overcall-responses-9-audit.md` delar svarsluckorna i svar efter 1-nivåinkliv, 2-nivåinkliv, hoppande 3-nivåinkliv och 2NT-inkliv. Ingen komplett svarstabell kunde beläggas.

### Närliggande material som inte är samma situation
- T29–T32 behandlar svarshandens agerande efter att motståndarna har klivit in över vår öppning. Det är inte svar efter partnerns eget inkliv.
- T29–T32 är dessutom märkta `analysis_only`; de är inte grundsystemfacit.

### Slutsats
Det går att behålla sexkortskravet för egna 2-nivåinkliv som en dokumenterad regel. Det går däremot inte att fastställa pass/stöd/ny färg/sang efter partnerns inkliv utifrån nuvarande underlag. De nio svarfallen ska därför fortsätta vara ej täckta.

## 2. Återbud efter upplysningsdubbling

### Vad som är belagt
- `double-rebid-8-audit.md` identifierar åtta separata fall där dubbleraren ska agera igen efter partnerns svar. Dubblerarens styrka varierar 12–19 HCP och partnerns svar 3–9 HCP.
- `rattningsmotor.js` har funktionen `respDouble()`, men den beskriver svarshandens bud efter partnerns dubbling av motståndarnas öppning. Den är inte en regel för dubblerarens återbud.
- Giv 13 i loggen är 1♠–(Dbl)–2♠. Det är svarshandens stöd efter en upplysningsdubbling, inte dubblerarens senare återbud.
- Giv 22 gäller en upplysningsdubbling efter ett hoppande inkliv. Den visar inte hur dubbleraren återkommer efter partnerns svar.

### Slutsats
Det saknas en belagd återbudsstruktur för dubbleraren. Framför allt är det inte fastställt hur minimum/maximum, balanserad hand, egen lång färg och partnerns svarsfärg ska prioriteras. De åtta fallen ska fortsätta vara ej täckta; `respDouble()` ska inte återanvändas för dem.

## 3. Öppnarens tredje bud efter svarshandens 2NT

### Exakt fall
`final_gaps_2.md` beskriver:
- Auktion: 1♣–Pass–1♠–Pass–2♣–Pass–2NT–Pass–?
- Aktuell spelare: öppnaren.
- Hand: 13 HCP, fördelning 1–4–3–5 (♠–♥–♦–♣).

### Vad som är belagt
- Systemets dokumenterade Stenberg 2NT gäller svar efter öppnarens högfärgsöppning med 13+ HTP och minst fyrkortsstöd. Det är inte samma sak som 2NT i den här sekvensen.
- Bokreglerna på s. 32–33 som loggen beskriver gäller svarshandens andra bud efter öppnarens återbud. De fastställer inte öppnarens tredje bud efter att svarshanden har bjudit 2NT.
- `ntResp()` avser svar på en 1NT-/2NT-öppning med Stayman/överföringar. Den fastställer inte öppnarens fortsättning i den aktuella naturliga sekvensen.

### Slutsats
Det finns ingen belagd regel som avgör om öppnaren ska passa eller fortsätta efter 1♣–1♠–2♣–2NT. Positionen är korrekt klassificerad som öppnarens tredje bud och ska fortsätta vara ej täckt.

## Beslut för implementation

| Område | Vad kan användas nu? | Vad får inte göras ännu? |
|---|---|---|
| Svar efter partnerns inkliv | Sexkortskravet för inkliv på 2-nivån, endast på inklivarens eget bud | Härleda svarstabell från T29–T32 eller från inklivarnas styrka |
| Återbud efter upplysningsdubbling | Separat identifiering av de åtta fallen | Återanvända `respDouble()` eller hitta på återbud efter styrkeintervall |
| Öppnarens tredje bud efter 2NT | Korrekt roll-/positionsklassificering | Behandla 2NT som Stenberg eller som svar på en 2NT-öppning |

## Nästa nödvändiga underlag

För att kunna fastställa reglerna behövs den auktoritativa systemtexten för:
1. Partnerns svar efter 1-, 2- och 3-nivåinkliv samt efter 2NT-inkliv.
2. Dubblerarens återbud efter partnerns svar på upplysningsdubbling.
3. Öppnarens fortsättning när svarshanden bjuder naturligt 2NT efter öppnarens återbud.

Tills den källan finns tillgänglig ska motorn markera dessa lägen som ej täckta. Det är avsiktligt och skyddar rättningens tillförlitlighet.

## Verifieringsstatus

- Källgranskning och dokumentation endast.
- Ingen ändring av `rattningsmotor.js`, `analysbibliotek.json` eller `kompletterande_budlogik.json`.
- Ingen DDS-bedömning har använts.
- `main` är orörd.
