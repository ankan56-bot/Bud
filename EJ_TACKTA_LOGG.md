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


## Stenberg 2NT – 2026-11-16

- Modulen täcker svarshandens 2NT efter 1♥/1♠ och 1♣/1♦, samt öppningshandens första återbud enligt Nordisk standard s. 2–3.
- Kända källuckor loggas med full budsekvens: öppningshandens handtyp passar inte någon av de uttryckliga återbudstyperna (exempelvis renons eller flera singletoner), eller svarshandens fortsättning efter öppnarens 3-bud saknar en uttrycklig regel i källan.
- Svarshandens utgångsval använder projektets befintliga gränser: 26 spelpoäng i högfärg och 28 i lågfärg, med minst 8-korts fit. 4NT routas till RKC först efter öppnarens beskrivande 3-nivååterbud.
- Öppen expertfråga: vilka fortsättningar ska svarshanden använda när Stenberg är utgångskrav men handen inte når projektets ordinarie färggräns, samt vilken prioritet gäller mellan flera singletoner/renons?
- Frågan finns även i den maskinläsbara expertloggen (id: stenberg-continuation-after-opener-rebid).


## Ostörd 100-givarsregression – 2026-11-17

Efter uppdatering av rättningsmotorn till v8.0 identifierades fem ytterligare positioner där källunderlaget inte ger en verifierad fortsättning. De lämnas ej täckta; inga budregler har lagts till utifrån dessa exempel.

| Giv | Seed | Auktion fram till beslut | Källucka |
|---|---:|---|---|
| ostord-100-007 | 202611347 | 2♣ – pass – 2♦ – pass – 3♣ – pass – 4♣ – pass | Tredje budet efter stark 2♣-öppning är inte specificerat i den granskade rutan. |
| ostord-100-038 | 202612484 | 2♣ – pass – 2♦ – pass – 2♥ – pass – 3♥ – pass | Tredje budet efter stark 2♣-öppning är inte specificerat i den granskade rutan. |
| ostord-100-058 | 202613128 | 2♣ – pass – 2♦ – pass – 2NT – pass – 3♦ – pass – 3♥ – pass | Efter 2NT-överföring finns både 5+♥ och 4+ i lågfärg; källan visar 4♣/4♦ som slaminvit men anger ingen prioritet när båda lågfärgerna passar. |
| ostord-100-074 | 202613766 | 2♣ – pass – 2♦ – pass – 3♦ – pass – 3♥ – pass | Tredje budet efter stark 2♣-öppning är inte specificerat i den granskade rutan. |
| ostord-100-092 | 202614466 | 2♣ – pass – 2♦ – pass – 2♥ – pass – 3♦ – pass | Tredje budet efter stark 2♣-öppning är inte specificerat i den granskade rutan. |

Den deterministiska 100-givarskörningen omfattar 526 beslut: 504 täckta och 22 ej täckta (95,8 %). Den har 0 tekniska undantag, 0 olagliga rekommendationer, 0 ogiltiga auktioner, 0 ofärdiga auktioner och 0 kortintegritetsfel. De fem nya positionerna ovan är en del av de 22 ej täckta; de ska granskas mot lathunden innan någon regel införs.
