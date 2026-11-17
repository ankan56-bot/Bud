# Svaga tvåöppningar – implementation och täckningsaudit

Branch: `work/theme-dataset-analysis`  
Rättningsmotor: 8.5  
Omfattning i denna etapp: ostörd budgivning efter 2♦, 2♥ och 2♠. Störd budgivning ingår inte.

## Auktoritativt underlag som finns i projektet

Den inbäddade Nordisk Standard-texten i `Budtraning.html` anger:
- 2♦/2♥/2♠: 6–10 hp, exakt sexkortsfärg.
- Med 11 hp och sexkortsfärg öppnas 1 i färgen i stället.
- Öppningsfärgen ska ha god färgkvalitet enligt den befintliga regeln i motorn.
- Ny färg med minst fem kort är krav till minst 3 i öppningsfärgen.
- 3 i öppningsfärgen är spärrhöjning med minst tre stödkort, inte invit.
- 3NT är slutbud.
- Hopp med renons är slaminvit.
- 2NT är invit med minst två stödkort.
- 2NT-frågan: öppnaren visar minimum med 3 i öppningsfärgen; vid maximum anges 3NT/4 i högfärg.
- Texten anger även ombudsbud på 3-nivån med 6–8 hp samt 3NT/4 högfärg med 9–10 hp. Exakt auktion/rollfördelning behöver knytas till respektive gren innan automatisk rättning.

## Ändrat i rättningsmotorn

- Rättat en direkt konflikt: 3 i öppningsfärgen klassas nu som spärrhöjning med 3+ stöd, inte som invit med 14–16 spelpoäng.
- 2NT-invit kräver nu både 9–10 hp och minst två stödkort.
- En 2NT-budgivning utan minst två stödkort markeras som ej täckt/inte förenlig med den dokumenterade invitgrenen.
- Höga svarshänder och fördelningar utan en uttryckligt definierad gren markeras som ej täckta i stället för att få ett påhittat pass eller invitbud.
- Öppnarens min/max-svar efter 2NT är kvar enligt befintlig regelkod; de behöver fortsatt kontrolleras mot fullständig källa och fler givtyper.

## Öppningsvillkor som ska vara oförändrade

- Endast ♦, ♥ och ♠ kan öppnas svagt på tvåläget; 2♣ är starköppning.
- Exakt sex kort, 6–10 hp och god färgkvalitet.
- 11 hp med sexkortsfärg går via 1 i färgen enligt projektets text.
- 3- och 4-öppningar är spärröppningsmoduler senare och blandas inte in här.

## Kvarvarande luckor – sparade för expertgranskning

Följande ska inte fyllas med antaganden:
1. Exakt styrkegräns/prioritet för ny färg med 5+ kort kontra 2NT-invit.
2. Fullständig fortsättning efter den kravställande nya färgen, inklusive öppnarens återbud och svarshandens fortsättning.
3. Exakt val mellan 3NT och 4 i högfärg efter 2NT när öppnaren visar maximum.
4. Exakt betydelse och budposition för uttrycket ”ombudsbud på 3-nivå 6–8 hp”.
5. Direkta 3NT-svar: vilka handprofiler/stopp som krävs utöver att budet är slutbud.
6. Hopp med renons som slaminvit: exakta bud, krav och fortsättningar.
7. Slutbud/pass efter varje gren samt svarshandens återbud efter öppnarens min/max-besked.

Alla dessa luckor ska gå till expertloggen. Ingen konkurrensbudgivning, inkliv eller dubbling har implementerats i denna modul.

## Regression

`testdata/weak-two.test.js` testar öppningsvillkoren, spärrhöjningen, 2NT-inviten och öppnarens min/max-besked. Testerna är avsedda att köras i GitHub Actions tillsammans med befintliga regressioner.
