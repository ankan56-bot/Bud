# Pausat arbete – störd budgivning

**Beslut:** 2026-11-15. Störd/konkurrensbudgivning pausas på användarens uttryckliga önskemål. Fortsatt utveckling fokuserar tills vidare på ostörd budgivning.

## Sparad utgångspunkt

Den fullständiga listan över ej täckta positioner finns i `testdata/temagivare_140_baseline.json`, version 1.9.0, under `uncovered`. Listan innehåller 68 positioner från den fasta 140-givarsuppsättningen. Ändra inte eller radera dessa exempel när konkurrensspåret är pausat.

### Fördelning av de 68 luckorna

| Antal | Typ av lucka | Återupptagningsnotering |
|---:|---|---|
| 27 | Motståndarna har lagt sig i; fortsättningen är inte beskriven i systemunderlaget. | Granska varje sekvens mot REF innan regel införs. |
| 15 | Motståndarna har bjudit flera gånger. | Ingen generell konkurrensregel får antas. |
| 15 | Partnern har passat efter vår senaste budgivning och konkurrensfortsättningen saknas. | Kräver separat analys av pass/återöppning och auktionens kontext. |
| 4 | Svarshandens nya färg efter svag tvåa är 5+ och forcing; öppnarens återbud är inte specificerat. | Bevara forcingkravet; hitta inte på ett exakt återbud. |
| 4 | Dubbleraren har 3+ stöd i partnerns svarsfärg. | REF saknar dubblerarens fortsättning med stöd. |
| 3 | Motståndarna har lagt sig i; fortsättningen är inte beskriven. | Behandlas som separat konkurrenslucka, inte som pass per automatik. |
| **68** | **Totalt** | **Pausat – ej implementerat.** |

## Regler för att återuppta spåret

1. Börja från den sparade listan `uncovered`; återskapa inte luckorna från minnet.
2. Skilj mellan uttryckliga REF-regler, valfria bud, ej täckta sekvenser och kompletterande strategiska förslag.
3. En odefinierad fortsättning ska fortsätta vara ej täckt tills systemunderlaget har förtydligats eller användaren har godkänt en separat kompletterande överenskommelse.
4. Kör samma fasta givare efter varje ändring och redovisa störd täckning separat från ostörd täckning.
5. Ändra inte `main` utan uttryckligt godkännande.

## Aktivt utvecklingsspår

Ostörd budgivning fortsätter på `work/undisturbed-validation`. Konkurrensspåret återupptas först efter separat beslut. Denna fil och den fullständiga `uncovered`-listan i baslinjen är överlämningen till framtida arbete.
