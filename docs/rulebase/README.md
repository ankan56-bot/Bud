# Regelbas – källregister och arbetsstatus

## Syfte
Samla reglerna från Nordisk Standard och Lathundens två delar utan att blanda ihop källornas auktoritet. Detta är en inventering och källkarta, inte en färdig exekverbar regelmotor.

## Källor

| ID | Källa | Omfattning | Roll |
|---|---|---:|---|
| NS-BASE | Nordisk Standard (befintlig PDF) | Original-PDF i projektets källmaterial | Grundsystem och normerande källa |
| LH-OST | Bridge Lathund bok(2).pdf | 14 PDF-sidor; tryckta sidor cirka 8–35 | Förtydliganden och översikt för ostörd budgivning |
| LH-STORD | Bridge Lathund störd budgivning.pdf | 9 PDF-sidor; tryckta sidor cirka 34–51 | Förtydliganden och översikt för störd budgivning |

## Källhierarki
1. Nordisk Standard är grundsystemet.
2. Lathunden används som kompletterande och förtydligande källa.
3. Hänvisningar i Lathunden till Bättre bud, PRO, Slam och andra verk registreras som externa referenser. De blir inte automatiskt regler.
4. PRO- och strategiska råd får inte i sig göra ett systemenligt bud felaktigt.

## Statuskoder
- `confirmed_base`: uttryckligen belagd i Nordisk Standard.
- `clarification_candidate`: Lathunden verkar precisera en grundregel.
- `exception_candidate`: Lathunden anger ett undantag eller särskild situation.
- `supplement_candidate`: situation eller sekvens som inte tydligt finns i grund-PDF:en.
- `reference_only`: hänvisning till annan litteratur; innehållet är inte tillgängligt här.
- `conflict_review`: möjlig skillnad mellan källorna; kräver kontroll, ingen automatisk prioritering.
- `unverified_ocr`: text eller budsymbol är för svår att läsa säkert från skannad sida.

## Viktig begränsning i denna första inventering
De två Lathund-PDF:erna är bildskanningar. De har granskats visuellt sida för sida. Textutvinning/OCR är inte tillräckligt tillförlitlig för att ensamt fastställa kortfärger, budsymboler eller exakta gränsvärden. Därför är detta en ämnes- och sidinventering. Exakta regler ska transkriberas och dubbelkontrolleras mot sidbilden innan de implementeras.

## Arbetsprinciper
- Bevara originalformulering, budsekvens, handvillkor och sidreferens.
- Håll ostörd och störd budgivning separata, även när de delar begrepp.
- Registrera osäker läsning i granskningslistan i stället för att gissa.
- Jämför först därefter mot NS-BASE.
- Spara alla sekvenser som rättningsmotorn inte täcker i den befintliga expertloggen.
- Ingen kod eller regelprioritet ändras genom enbart denna inventering.

## Inventeringsfiler
- [Ostörd budgivning](ostord-inventory.md)
- [Störd budgivning](stord-inventory.md)
- [Referensregister och granskningspunkter](references-and-review.md)
