# Fleranvändarstöd för budgivningen

## Aktuellt läge
Rummet har nu ett gemensamt lobbyflöde:
- Första anslutna spelaren väljer **1–4 spelare**.
- **1 spelare:** väljer valfri plats eller styr både Nord och Syd.
- **2 spelare:** väljer varsin plats Nord/Syd; Öst och Väst är Buddie.
- **3 spelare:** väljer valfri plats; Buddie fyller den fjärde platsen.
- **4 spelare:** alla fyra platser är mänskliga.
- Namn, spelar-ID och plats synkroniseras mellan anslutna enheter. Namn är valfritt.
- Lobby visar **Väntar på spelare** tills det begärda antalet spelare har valt plats.
- Rumsinställning och egen plats sparas lokalt så att enheten kan återansluta efter att webbläsaren stängts.
- Platsbyte är låst under en pågående giv; platsen kan lämnas när given är klar.

## Gemensam budgivning
Varje giv har en explicit lista över mänskliga platser (`humanSeats`). Alla övriga platser är Buddie. Befintlig `botCall`, `legal` och `advance` används fortsatt; ingen separat uppsättning bridgebudregler har skapats.

Tema och budgivningsläge synkroniseras i rummet. Gemensamma åtgärder som start, ny giv, omspel och ångra skickas till en vald rumssamordnare så att flera samtidiga tryck inte ska skapa flera olika givar. Bud från mänskliga spelare fortsätter att synkroniseras som tidigare. Åtgärdsmeddelanden tidsbegränsas också, så att äldre kommandon som spelas upp ur ntfys meddelandehistorik vid återanslutning inte körs igen.

## Transport och begränsningar
Rumsmeddelanden transporteras via ntfy. Spelarlista hålls aktuell med återkommande närvaromeddelanden och gamla deltagare tas bort efter timeout. Platskonflikter avgörs deterministiskt mellan klienterna. Det är dock inte en serverbaserad transaktionell låsning: vid samtidiga anslutningar eller nätverksavbrott kan det fortfarande uppstå tillfälliga skillnader. Därför krävs praktiskt test med två separata enheter innan funktionen betraktas som produktionssäker.

## Fristående sessionskärna
`budgivning-session.js` är en UI-oberoende sessionsmodell för 1–4 mänskliga platser. Den använder injicerade funktioner för budvalidering och botbud och duplicerar därför inte bridgebudreglerna.

## Avgränsning
Den här etappen gäller budgivning och automatisk turhantering. Kortspel med en mänsklig spelare och tre kortspelsrobotar är ännu inte implementerat. DDS används inte som ersättning för en dold-informations-AI; kortspelsroboten måste senare fatta beslut utifrån endast den information en spelare lagligen känner till.

## Tester
GitHub Actions kör sessionskärnans Node-tester, syntaxkontroll av inline-JavaScript och regressionskontroller av lobby, närvaro, namn, återanslutning och gemensamma åtgärder.
