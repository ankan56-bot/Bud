# Fleranvändarstöd för budgivningen

## Avgränsning
Den här modulen hanterar enbart budgivning. Kortspel och kortspels-AI ingår inte.

## Modell
- Fyra fasta platser: N, E, S, W.
- 1–4 mänskliga platser anges i `humanSeats`.
- Övriga platser blir automatiskt botplatser.
- Flera människor kan sitta vid samma enhet; transport/UI bestämmer senare hur turerna presenteras.
- Alla fyra platser använder samma befintliga budregler och samma botfunktion. Modulen innehåller inga egna bridgebudregler.

## API
`BudSession.createSession({ hands, dealer, humanSeats, mode, focus })`
skapar en session. `hands` måste innehålla fyra händer med 13 kort.

`BudSession.applyCall(session, seat, call, legalCall)`
validerar tur, mänsklig plats och tillåtet bud. Returnerar en ny session.

`BudSession.advanceBots(session, botCall, legalCall)`
låter botarna bjuda i följd tills nästa människa ska agera eller auktionen avslutas. Botens val delegeras till befintlig budmotor.

`BudSession.isHumanTurn(session)`, `isBotTurn(session)`, `turn(session)` och `auctionEnded(bids)`
ger tur-/statusinformation.

## Integration
Den befintliga Budtraning.html är fortfarande oförändrad i denna första etapp. Nästa steg är att koppla dess nuvarande `botCall`, `legal` och auktionsmodell till modulen och därefter lägga UI för platsfördelning. Detta håller den nuvarande tränaren stabil medan kärnlogiken testas separat.

## Viktig princip
Mänsklig eller automatisk spelare är en sessionsinställning, inte en separat budmotor. Samma budlogik används för Nord, Öst, Syd och Väst.
