# Svaga tvåöppningar – implementation och täckningsaudit

Branch: `work/theme-dataset-analysis`  
Rättningsmotor: 8.8  
Omfattning: ostörd budgivning efter 2♦, 2♥ och 2♠. Störd budgivning ingår inte.

## Auktoritativ källa

Källa: användarens PDF `nordisk_standard.pdf`, daterad 2012-08-22, sida 4. PDF:en har återfunnits i ChatGPT-biblioteket och har prioritet framför tidigare sammanfattningar eller den förkortade regeltexten i HTML-filen.

## Regler från PDF sida 4

- 2♦/2♥/2♠ visar 6–10 hp, exakt sex kort och god färgkvalitet: minst 2 honnörer eller minst 1 honnör samt minst 2 av 10-9-8.
- Med 11 hp och sexkortsfärg öppnas 1 i färgen.
- Ny färg: minst 5 kort, krav till minst 3 i öppningsfärgen.
- 3 i öppningsfärgen: spärrhöjning med minst 3 stödkort, inte invit.
- 3NT: slutbud.
- Hopp i ny färg: visar renons och är slaminvit.
- 2NT: invitbud med minst 2 stödkort.
- Efter 2NT visar öppnaren minimum med 3♦/3 i högfärgen och 6–8 hp.
- Efter 2NT visar öppnaren maximum med 3NT/4 i högfärg och 9–10 hp.
- PDF:en anger ingen exakt hp-gräns för svarshandens 2NT-invit. Den tidigare kodade gränsen 9–10 hp på svarshanden var därför inte källstödd och har tagits bort.
- Vid maximum efter 2NT är 3NT/4 högfärg alternativen. För lågfärgsöppning används 3NT; 4 i lågfärgen ska inte föreslås som maxbesked.

## Implementerat i rättningsmotorn 8.8

- 2♦/2♥/2♠ öppningsvillkor testas: exakt sex kort, 6–10 hp och god färgkvalitet enligt tidigare definition: minst 2 honnörer eller 1 honnör + minst 2 av 10-9-8.
- 2♣ förblir starköppning och blandas inte in i svaga tvåöppningar.
- 2NT accepteras som invit när svarshanden har minst två stödkort; inget eget hp-intervall har hittats på.
- 3 i öppningsfärgen accepteras som spärrhöjning med minst tre stödkort och förklaras uttryckligen som ej invit.
- Ny färg på lägsta lagliga nivå accepteras med minst fem kort och förklaras som krav till minst 3 i öppningsfärgen.
- Hopp i ny färg accepteras när svarshanden är renons i den färgen och förklaras som slaminvit.
- 3NT accepteras som slutbud.
- Efter kravställande ny färg återbjuder öppnaren minst 3 i öppningsfärgen.
- Efter 2NT visar öppnaren 6–8 hp med 3 i öppningsfärgen. Med 9–10 hp visas maximum med 3NT efter lågfärgsöppning eller 4 i öppningshögfärgen (3NT är också tillåtet alternativ efter högfärgsöppning).

## Kvarvarande luckor – expertloggen

Följande ska inte fyllas med antaganden:
1. Exakt hp-intervall för svarshandens 2NT-invit – PDF:en anger endast invit och minst 2 stöd.
2. Passkriterier när svarshanden saknar 5+ sidofärg, 2+ stöd eller ett definierat hopp.
3. Öppnarens fortsättning efter partnerns direkta spärrhöjning till 3 i öppningsfärgen.
4. Svarshandens fortsättning efter öppnarens 3 i öppningsfärgen som fullgör kravbudet i ny färg.
5. Vilka handvillkor som avgör 3NT kontra 4 i öppningshögfärgen efter öppnarens maximum på 2NT. PDF:en anger båda alternativen men inte urvalskriteriet.
6. Fortsättning efter hoppet som visar renons och slaminvit; de exakta kontrollbuden är inte beskrivna i detta avsnitt.

Alla dessa sekvenser ska loggas som ej täckta tills de kan verifieras. Ingen störd budgivning, inkliv eller dubbling har implementerats i denna modul.

## Regression

`testdata/weak-two.test.js` innehåller 16 regressionstester för öppningsgränserna och de dokumenterade svaren: spärrhöjning, 2NT, ny färg, renons-/slaminvit, 3NT, öppnarens svar efter ny färg samt min/max efter 2NT.
