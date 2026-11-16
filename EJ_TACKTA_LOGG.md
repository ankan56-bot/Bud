# Logg över ej täckta budsekvenser

Alla beslutspunkter där rättningsmotorn saknar ett verifierat rekommenderat bud (exp saknas) registreras automatiskt i en separat lokal logg.

## Vad som sparas
- Givare och spelplats som skulle bjuda.
- Hela den offentliga budsekvensen fram till beslutspunkten.
- Det faktiskt lagda budet, om det finns.
- Motorns förklaring och markering om det är en källucka.
- De fyra händerna vid efterhandsrättning/facit, så att en expert kan återskapa situationen.
- Kontext, exempelvis efterhandsrättning.

Identiska positioner från upprepade omrenderingar sparas bara en gång. Olika händer eller olika auktioner blir separata poster.

## Var hittar jag filen?
Loggen sparas automatiskt i webbläsarens lokala lagring på den enhet där träningen körs. Den följer alltså inte automatiskt med mellan iPad, telefon och dator.

I rutan **Budfacit** eller **Automatisk rättning** finns knappen **Ladda ned ej täckta sekvenser**. Den exporterar allt som hittills sparats till filen `ej-tackta-budsekvenser.json`.

Ladda ned filen och skicka den till experten. Exporten innehåller både auktion och givare.

## Viktigt
- Loggen fylls på automatiskt; man behöver inte anteckna positionerna manuellt.
- Exportera gärna med jämna mellanrum och innan webbläsardata rensas.
- Att exportera rensar inte loggen.
- Loggen är separat från rapporterna med redan kända ej täckta testgivare.
- Loggen innebär inte att motorn börjar gissa: ej täckta bud förblir ej täckta tills en regel har verifierats.
