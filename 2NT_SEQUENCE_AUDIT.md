# 2NT-sekvenskarta – Nordisk Standard och Lathunden

Syfte: varje 2NT ska bedömas utifrån hela den faktiska budsekvensen. Ett 2NT-bud får aldrig klassas som Stenberg enbart för att en öppning på 1-nivån förekommer tidigare i auktionen.

## Fastställda 2NT-betydelser

| Sekvens | Betydelse | Källa / implementation |
|---|---|---|
| 1♥/1♠–2NT | Stenberg, 13+ htp och minst 4-korts stöd; utgångskrav | Nordisk standard s. 2–3; `stenberg.js` |
| 1♣/1♦–2NT | Samma Stenbergkrav, men 4-korts högfärg ska visas först | Nordisk standard s. 2–3; `stenberg.js` |
| 1♥–1♠–2♣–2NT | 10–12 hp, balanserad, exakt 2 hjärter samt håll i spader och ruter | Nordisk standard s. 3; `stordbudgivning.js` |
| 1♥–1♠–2♦–2NT | Invit, 11–12 hp, balanserad | Användarbekräftad sekvensregel; `stordbudgivning.js` |
| 2♦/2♥/2♠–2NT | Stenberg, 13+ STP | Lathunden, tryckt s. 27; `svaga2oppningar.js` |
| 2♦/2♥/2♠–4NT | Essfråga med öppningsfärgen som trumf | Lathunden, tryckt s. 27; `slamlogik.js` → befintlig RKC |
| 1NT–2NT | Naturlig invit: balanserad hand utan 4-korts högfärg | Nordisk standard s. 4; numerisk HP-gräns saknas i källan |
| 1NT–2♠–2NT | Öppnarens relä: längre ruter eller lika långa lågfärger | Nordisk standard s. 4–5; sangmodulen |
| 1NT–2♣–2♥–2NT | Svarshanden visar 4 spader | Nordisk standard s. 4; Stayman-grenen |
| 1NT–2♦–2♥–2NT | Invit efter överföring, balanserad med exakt 5 hjärter | Nordisk standard s. 5; transfergrenen |
| 1NT–2♥–2♠–2NT | Invit efter överföring, balanserad med exakt 5 spader | Nordisk standard s. 5; transfergrenen |
| 2♣–2♦–2NT | Öppnarens balanserade 22–24 hp | Nordisk standard s. 6; stark-2♣-grenen |
| 2♣–2♦–2♠–2NT | Svarshanden visar 0–5 hp utan fördelningskrav | Nordisk standard s. 6; stark-2♣-grenen |
| Partnern har klivit in på 1-nivån – 2NT | 11–13 hp, balanserad och bra håll i motståndarnas öppningsfärg | Nordisk standard s. 7; `inkliv.js` |
| Motståndarna har klivit in över vår 1-färgsöppning – 2NT | 11–12 hp, balanserad och håll i inklivsfärgen | Lathunden, tryckt s. 35; `inkliv.js` med källkontext |
| Efter upplysningsdubbling – 2NT | 10–12 hp och håll i öppningsfärgen | Nordisk standard s. 8; dubblingsmodulen |
| Överbud 2NT mot svagt spärrbud | 16–18 hp, balanserad | Nordisk standard s. 8; inklivsmodulen |
| Öppning 2NT | 20–21 hp, balanserad | Nordisk standard s. 2; öppningsmodulen |
| Öppning 1 i färg–1NT–2NT | Öppnarens balanserade 18–19 hp | Nordisk standard s. 3; återbudsmodulen |

## Viktiga avgränsningar

- Direkt Stenberg efter 1 i färg kräver att 2NT är svarshandens omedelbara bud. Senare 2NT-bud i exempelvis 1♥–1♠–2♦–2NT går till sin egen sekvensregel.
- 2NT efter svag tvåöppning är en separat Stenberggren; den får inte använda den tidigare 9–10 hp-inviten.
- Direkt 4NT efter svag tvåöppning använder öppningsfärgen som trumf. RKC-igenkänningen är avgränsad till just den direkta sekvensen, så Stayman- och andra 4NT-frågor inte fångas av misstag.
- När en etablerad 8-korts fit når utgångsgränsen ska utgången väljas före en svagare Stenberg-/invitgren.
- Splinter är fortsatt avstängt enligt användarens beslut.

## Kvarstående källuckor

1. Lathunden s. 27 anger både 2NT Stenberg 13+ STP och höjning till 3 i öppningsfärgen som invit med cirka 14–16 STP. Prioritet och stödlängd som skiljer buden åt saknas. Överlappet lämnas EJ TÄCKT.
2. Öppnarens fortsättning efter 2NT Stenberg på en svag tvåöppning är inte tillräckligt beskriven i det verifierade underlaget. Ingen äldre 6–8/9–10 hp-stege får användas.
3. Lathunden anger inte en numerisk HP-gräns för den naturliga 1NT–2NT-inviten. Den ska inte fyllas med ett antaget tal.
4. 1♥–1♠–2♦–2NT har användarens 11–12 hp-invit och balanserad hand; ytterligare krav på håll eller stöd är inte tillagda utan källa.

## Regressionstester

- `tests/stenberg-2nt.test.js`: direkt Stenberg, 100 deterministiska händer, gränser och RKC-handoff.
- `tests/second-bid-2nt-invit.test.js`: 1♥–1♠–2♣–2NT och 1♥–1♠–2♦–2NT.
- `tests/weak-two-stenberg.test.js`: 13+ STP, overlap/source gaps, opener gap och direkt 4NT/RKC.
- `tests/competitive-2nt-contexts.test.js`: skiljer 11–12 hp efter motståndarnas inkliv från 11–13 hp efter partnerns inkliv.
