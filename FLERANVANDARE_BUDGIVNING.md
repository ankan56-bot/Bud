# Fleranvändarstöd för budgivningen

## Aktuellt läge
Budgivningen i `Budtraning.html` stöder nu två spelformer:

- **Ensam mot tre robotar:** en människa väljer Nord eller Syd; de tre övriga platserna sköts automatiskt.
- **Två människor:** Nord och Syd är mänskliga platser; Öst och Väst är robotar. Det fungerar även när spelarna sitter på varsin enhet i samma rum.
- **Båda på en enhet:** båda N/S-platserna styrs manuellt, med robotar i Öst/Väst.

Spelformen sparas lokalt och skickas med i den synkroniserade givinformationen. Äldre sparade givarsessioner utan platsinställning tolkas fortsatt som två mänskliga N/S-platser, så befintliga träningsrum behåller sitt beteende.

## Botfördelning och budmotor
Varje giv har en explicit lista över mänskliga platser (`humanSeats`). Alla övriga platser är robotar. Den befintliga `botCall`, `legal` och `advance` används fortsatt; ingen separat uppsättning bridgebudregler har skapats.

## Fristående sessionskärna
`budgivning-session.js` är en UI-oberoende sessionsmodell för 1–4 mänskliga platser. Den använder injicerade funktioner för budvalidering och botbud och duplicerar därför inte bridgebudreglerna. Den är testad separat och utgör grund för fortsatt utveckling av sessioner.

## Avgränsning
Den här etappen gäller budgivning och automatisk turhantering. Kortspel med en mänsklig spelare och tre kortspelsrobotar är ännu inte implementerat. DDS används inte som ersättning för en dold-informations-AI; kortspelsroboten måste senare fatta beslut utifrån endast den information en spelare lagligen känner till.

## Tester
GitHub Actions kör:
- sessionskärnans Node-tester
- syntaxkontroll av inline-JavaScript i `Budtraning.html`
- kompatibilitetskontroll för äldre sessioner utan `humanSeats`
