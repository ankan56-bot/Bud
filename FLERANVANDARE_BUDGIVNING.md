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

Tema och budgivningsläge synkroniseras i rummet. Gemensamma åtgärder som start, ny giv, omspel och ångra skickas till en vald rumssamordnare så att flera samtidiga tryck inte ska skapa flera olika givar. Bud från mänskliga spelare fortsätter att synkroniseras som tidigare. Inkommande givtillstånd ordnas efter ntfys serverstämpel i stället för klienternas lokala revisionsräknare, eftersom varje enhet annars kan ha olika räknarvärden och råka ignorera en senare budgivningsuppdatering. Äldre fördröjda tillstånd får inte skriva över ett nyare mottaget tillstånd. Åtgärdsmeddelanden tidsbegränsas också, så att äldre kommandon som spelas upp ur ntfys meddelandehistorik vid återanslutning inte körs igen. Vid återanslutning väntar botmotorn dessutom tills den historiska tillståndsströmmen har varit tyst en kort stund innan den återupptar automatiska bud. Det hindrar en robot från att hinna agera på ett äldre mellanläge medan ntfy fortfarande spelar upp historiken. Även närvaromeddelanden filtreras med ntfys serverstämpel: gamla närvaroposter ur historiken får inte återta en plats, och mottagna aktiva poster får lokal mottagningstid i stället för att lita på deltagarens klocka. Därmed blir platsägarskap och samordnarval mindre känsliga för felaktiga klockor på olika enheter. Händelsehanterare från en tidigare EventSource-anslutning kontrollerar dessutom att de fortfarande hör till aktuellt rum och aktuell anslutning, så köade meddelanden från ett rum som lämnats inte kan ändra det nya rummets tillstånd.

## Transport och begränsningar
Rumsmeddelanden transporteras via ntfy. Spelarlista hålls aktuell med återkommande närvaromeddelanden och gamla deltagare tas bort efter timeout. Platskonflikter avgörs deterministiskt mellan klienterna. Klienterna stoppar också nya platsanspråk när rummets konfigurerade antal deltagare redan är uppnått, samtidigt som en befintlig deltagare kan byta till en ledig plats. Det är dock inte en serverbaserad transaktionell låsning: vid samtidiga anslutningar eller nätverksavbrott kan det fortfarande uppstå tillfälliga skillnader. Samordnaren väljs deterministiskt som lägsta aktiva spelar-ID. När dess närvaromeddelanden upphör kan övriga klienter välja nästa aktiva deltagare efter timeout. Botbud återskapas deterministiskt från givens seed och mänskliga bud vid återanslutning; de skickas inte som separata auktoritativa bud. Automatiska tester verifierar både återuppbyggnaden och samordnarbyte. Därför krävs fortfarande praktiskt test med två separata enheter innan funktionen betraktas som produktionssäker.

## Fristående sessionskärna
`budgivning-session.js` är en UI-oberoende sessionsmodell för 1–4 mänskliga platser. Den använder injicerade funktioner för budvalidering och botbud och duplicerar därför inte bridgebudreglerna.

## Avgränsning
Den här etappen gäller budgivning och automatisk turhantering. Kortspel med en mänsklig spelare och tre kortspelsrobotar är ännu inte implementerat. DDS används inte som ersättning för en dold-informations-AI; kortspelsroboten måste senare fatta beslut utifrån endast den information en spelare lagligen känner till.

## Tester
GitHub Actions kör sessionskärnans Node-tester, syntaxkontroll av inline-JavaScript och regressionskontroller av lobby, närvaro, namn, återanslutning och gemensamma åtgärder.
