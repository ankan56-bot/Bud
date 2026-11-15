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

Tema och budgivningsläge synkroniseras i rummet. Gemensamma åtgärder som start, ny giv, omspel och ångra skickas till en vald rumssamordnare så att flera samtidiga tryck inte ska skapa flera olika givar. Bud från mänskliga spelare fortsätter att synkroniseras som tidigare. Inkommande givtillstånd ordnas efter ntfys serverstämpel i stället för klienternas lokala revisionsräknare, eftersom varje enhet annars kan ha olika räknarvärden och råka ignorera en senare budgivningsuppdatering. Äldre fördröjda tillstånd får inte skriva över ett nyare mottaget tillstånd. Åtgärdsmeddelanden tidsbegränsas också, så att äldre kommandon som spelas upp ur ntfys meddelandehistorik vid återanslutning inte körs igen. Vid återanslutning väntar botmotorn dessutom tills den historiska tillståndsströmmen har varit tyst en kort stund innan den återupptar automatiska bud. Det hindrar en robot från att hinna agera på ett äldre mellanläge medan ntfy fortfarande spelar upp historiken. Även närvaromeddelanden filtreras med ntfys serverstämpel: gamla närvaroposter ur historiken får inte återta en plats, och mottagna aktiva poster får lokal mottagningstid i stället för att lita på deltagarens klocka. Därmed blir platsägarskap och samordnarval mindre känsliga för felaktiga klockor på olika enheter. Händelsehanterare från en tidigare EventSource-anslutning kontrollerar dessutom att de fortfarande hör till aktuellt rum och aktuell anslutning, så köade meddelanden från ett rum som lämnats inte kan ändra det nya rummets tillstånd. Vid byte av rum nollställs också den gamla auktionen, närvarohistoriken och väntande synkroniserings- och robottimers, så en fördröjd timer från föregående rum inte kan starta budgivning i det nya.

## Transport och begränsningar
Rumsmeddelanden transporteras via ntfy. Spelarlista hålls aktuell med återkommande närvaromeddelanden och gamla deltagare tas bort efter timeout. Platskonflikter avgörs deterministiskt mellan klienterna. Klienterna stoppar också nya platsanspråk när rummets konfigurerade antal deltagare redan är uppnått, samtidigt som en befintlig deltagare kan byta till en ledig plats. Det är dock inte en serverbaserad transaktionell låsning: vid samtidiga anslutningar eller nätverksavbrott kan det fortfarande uppstå tillfälliga skillnader. Samordnaren väljs deterministiskt som lägsta aktiva spelar-ID. När dess närvaromeddelanden upphör kan övriga klienter välja nästa aktiva deltagare efter timeout. Botbud återskapas deterministiskt från givens seed och mänskliga bud vid återanslutning; de skickas inte som separata auktoritativa bud. Automatiska tester verifierar både återuppbyggnaden och samordnarbyte. Därför krävs fortfarande praktiskt test med två separata enheter innan funktionen betraktas som produktionssäker.

## Fristående sessionskärna
`budgivning-session.js` är en UI-oberoende sessionsmodell för 1–4 mänskliga platser. Den använder injicerade funktioner för budvalidering och botbud och duplicerar därför inte bridgebudreglerna.

## Avgränsning
Den här etappen gäller budgivning och automatisk turhantering. Kortspel med en mänsklig spelare och tre kortspelsrobotar är ännu inte implementerat. DDS används inte som ersättning för en dold-informations-AI; kortspelsroboten måste senare fatta beslut utifrån endast den information en spelare lagligen känner till.

## Tester
GitHub Actions kör sessionskärnans Node-tester, syntaxkontroll av inline-JavaScript, bridgebudregressioner, RKC-/invittester och deterministiska givvalideringar för 1♥/1♠ samt ostörd budgivning.

Senaste kompletta körningen:
- 31/31 sessions- och tränartester godkända.
- 82 bridgebudregressioner, 15 kompletterande matcher, 16 RKC-tester, 4 invittester och 3 manuella handtester godkända.
- 100 giv med 1♥/1♠: 526/527 beslut täckta (99,8 %), inga undantag eller otillåtna bud.
- Fast ostörd korpus: 166/167 beslut täckta (99,4 %). Den enda uttryckligen kvarstående luckan är obalanserad invitstyrka utan högfärgsfit efter Stayman, exempelvis 1NT–2♣–2♦.
- Oberoende 100-givsurval ostört: 532/533 beslut täckta (99,8 %), inga undantag eller otillåtna bud.
- Ytterligare 100- och 200-givsurval körs som explorativa täckningsrapporter; de rapporterar ej definierade grenar utan att dölja dem.

Testsviten skiljer avsiktligt mellan fel (undantag, olagliga bud, ogiltiga eller ofärdiga auktioner) och ännu ej definierade systemgrenar.
