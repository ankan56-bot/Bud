/* Persistent log of uncovered bidding positions. Exportable as a JSON file for expert review. */
(function(root){
  'use strict';
  var KEY='bud_ej_tackta_logg_v1';
  // Frågor som redan identifierats under slamgenomgången och ska följa med
  // när användaren exporterar loggen för expertgranskning. Okända budsekvenser
  // anges uttryckligen som null i stället för att konstrueras.
  var EXPERT_QUESTIONS=[
    {id:'slam-rkc-all-five-keycards',topic:'RKC – alla fem nyckelkort',sequence:null,question:'Vilken fortsättning ska användas när paret har alla fem nyckelkort? Nordisk standard-tabellen i det tillgängliga underlaget anger inget särskilt svar för 5 av 5.'},
    {id:'slam-rkc-multiple-voids',topic:'RKC – flera renonser',sequence:null,question:'Vilken renons ska visas när handen har två eller fler renonser och RKC-svaret ska visa 2 nyckelkort med renons? Underlaget väljer inte mellan renonserna.'},
    {id:'slam-rkc-queen-ask-legality',topic:'RKC – trumfdamfråga och lagliga bud',sequence:null,question:'Vilka alternativa fortsättningar gäller när nästa bud som inte är trumf inte kan följas av ett lagligt 5-i-trumf-förnekande, eller när 5NT/6-i-ny-färg inte längre är lagligt?'},
    {id:'slam-four-aces-no-seven',topic:'Fyr-essfråga – fortsättning när 7NT inte är tillåtet',sequence:null,question:'Vilken fortsättning ska användas efter fyr-essfråga när svaret inte visar alla fyra essen och 7NT därför inte är tillåtet? Finns en uttrycklig acceptregel för 6NT?'},
    {id:'slam-control-bids',topic:'Kontrollbud och slamsekvenser',sequence:null,question:'Vilka kontrollbudssekvenser före och efter 4NT/RKC ingår i Nordisk standard, och hur ska de kopplas till fastställd trumf, essfråga och slamval?'},
    {id:'slam-quantitative-2nt-4nt',topic:'Kvantitativ invit 2NT–4NT',sequence:'2NT–4NT',question:'Vilken exakt styrkegräns ska öppnaren använda för att acceptera den kvantitativa inviten till 6NT efter 2NT-öppning (20–21 hp)?'},
    {id:'slam-transfer-superaccept-4nt',topic:'4NT efter överförings-superaccept',sequence:null,question:'Är 4NT efter en överförings-superaccept också RKC med överföringsfärgen som trumf, eller krävs en annan fortsättning? Underlaget behöver bekräftas.'},
    {id:'slam-nt-six-threshold',topic:'Honnörspoäng för 6NT',sequence:null,question:'Bekräfta den exakta honnörspoängsgränsen för 6NT i Nordisk standard. Nuvarande implementation använder 33+ gemensamma hp (utan fördelningspoäng), i linje med projektets generella slamkontroll.'}
  ];
  function read(){
    try{var v=root.localStorage&&root.localStorage.getItem(KEY);return v?JSON.parse(v):[];}
    catch(e){return [];}
  }
  function record(entry){
    if(!entry||typeof entry!=='object')return null;
    var rows=read();
    var clean={
      timestamp:new Date().toISOString(),
      context:entry.context||'after_deal',
      dealer:entry.dealer||null,
      seat:entry.seat||null,
      auction:Array.isArray(entry.auction)?entry.auction.map(function(x){return {s:x.s,c:x.c};}):[],
      attemptedCall:entry.attemptedCall||null,
      reason:entry.reason||'Ingen verifierad fortsättning.',
      sourceGap:!!entry.sourceGap,
      hands:entry.hands||null,
      trainingSide:entry.trainingSide||null
    };
    var key=JSON.stringify({context:clean.context,dealer:clean.dealer,seat:clean.seat,auction:clean.auction,attemptedCall:clean.attemptedCall,reason:clean.reason,hands:clean.hands});
    if(rows.some(function(x){return x._key===key;}))return {added:false,count:rows.length};
    clean._key=key;
    rows.push(clean);
    try{root.localStorage.setItem(KEY,JSON.stringify(rows));}
    catch(e){return {added:false,count:rows.length,error:'Lagringen misslyckades: '+e.message};}
    return {added:true,count:rows.length};
  }
  function exportJson(){
    var rows=read();
    var payload={format:'bud-ej-tackta-v1',exportedAt:new Date().toISOString(),count:rows.length,entries:rows.map(function(x){var y=Object.assign({},x);delete y._key;return y;}),expertQuestions:EXPERT_QUESTIONS};
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    var url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='ej-tackta-budsekvenser.json';a.style.display='none';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    return rows.length;
  }
  function count(){return read().length;}
  function clear(){try{root.localStorage.removeItem(KEY);return true;}catch(e){return false;}}
  root.EjTacktaLogg={record:record,exportJson:exportJson,count:count,clear:clear,read:read};
})(typeof window!=='undefined'?window:globalThis);
