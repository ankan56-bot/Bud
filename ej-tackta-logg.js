/* Persistent log of uncovered bidding positions. Exportable as a JSON file for expert review. */
(function(root){
  'use strict';
  var KEY='bud_ej_tackta_logg_v1';
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
    var payload={format:'bud-ej-tackta-v1',exportedAt:new Date().toISOString(),count:rows.length,entries:rows.map(function(x){var y=Object.assign({},x);delete y._key;return y;})};
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
