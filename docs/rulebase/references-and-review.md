# Referensregister och granskningslista

## Referenser som ska fångas

Lathundens rutor och marginalmarkeringar hänvisar till eller skiljer ut fördjupningsmaterial. Följande referensnamn ska registreras när de förekommer på respektive sida:

| Referens-ID | Namn/etikett | Hantering |
|---|---|---|
| REF-BATTRE-BUD | Bättre bud | Extern referens. Hänvisning registreras med Lathundens sida och ämne. Innehållet är inte verifierat förrän boken finns tillgänglig. |
| REF-PRO | PRO | Avancerad vägledning/markering. Inte automatiskt en del av grundsystemets rättningsregler. |
| REF-SLAM | Slam | Fördjupningsreferens för slamsekvenser. Behöver identifieras när hänvisningen förekommer. |
| REF-PLUS | Plus | Lathundens egen fördjupningsmarkering; exakt innebörd ska följas från bokens förklaring och inte gissas. |

## Första granskningslistan

| ID | Område | Fråga att avgöra | Status |
|---|---|---|---|
| REV-001 | Ostörd – öppningsbud | Exakta intervall, färglängder och undantag jämfört med Nordisk Standard? | Öppen |
| REV-002 | Ostörd – svar | Vilka svar är krav, rondkrav, invit eller spärr? | Öppen |
| REV-003 | Ostörd – öppnarens andra bud | Stämmer stödintervall, balanserade händer, reverse och tvåfärgshänder med grund-PDF? | Öppen |
| REV-004 | Ostörd – Stenberg | Finns ytterligare fortsättningar eller undantag utöver grundbeskrivningen? | Öppen |
| REV-005 | Ostörd – slam/RKC | Stämmer svarsskalor, kontrollbud, trumfkontext och fortsättningar med den redan byggda slammodulen? | Öppen |
| REV-006 | Ostörd – splinter | Vilka exakta krav och svarsvägar anges? | Öppen |
| REV-007 | Störd – inkliv | Exakta styrke- och färglängdskrav för olika nivåer och zoner? | Öppen |
| REV-008 | Störd – dubbling | Skilj UD, straffdubbling, responsiv dubbling och övriga dubblingar. Vilka krav gäller? | Öppen |
| REV-009 | Störd – redubbling | När är RD straffbetonad, SOS/utspelsvisande eller styrkevisande enligt respektive sekvens? | Öppen |
| REV-010 | Störd – 1NT | Vilka försvarssystem och fortsättningar anges, och vilka är PRO/Plus? | Öppen |
| REV-011 | Störd – motståndarnas spärr | Vilka svar och fortsättningar gäller efter olika spärrnivåer? | Öppen |
| REV-012 | Störd – Stenberg/trumfstöd | Vilka betydelser överlever när motståndarna kliver in eller dubblar? | Öppen |
| REV-013 | Zon | Är zonråden strategiska råd eller uttryckliga systemkrav? | Öppen |
| REV-014 | Utspel/markering | Ska endast arkiveras som framtida referens, utanför nuvarande budtränare? | Öppen |
| REV-015 | Källkonflikt | Varje skillnad mellan Lathunden och Nordisk Standard ska dokumenteras med båda sidreferenserna. | Löpande |

## Transkriptionsformat för kommande regelposter

Varje enskild regel ska få följande fält:

- `rule_id`
- `domain`: `undisturbed` eller `competitive`
- `auction_pattern`: fullständig budsekvens
- `actor`: vilken hand som ska bedömas
- `hand_conditions`: styrka, fördelning, färglängder, honnörer och övriga villkor
- `meaning`: regelns innebörd med källnära formulering
- `forcing_status`: passbart, rondkrav, utgångskrav eller annat uttryckligen angivet krav
- `source_id` och `source_page`
- `reference_tag`: exempelvis PRO, Plus, Bättre bud eller Slam
- `status`: en av statuskoderna i README
- `implementation_target`: modul eller `not_yet_assigned`
- `notes`: osäkerheter, konflikter och expertfrågor

## Avgränsning
Denna fil registrerar hänvisningar och granskningsbehov. Den återger inte innehållet i de externa böckerna och får inte användas som om dessa böcker vore lästa.
