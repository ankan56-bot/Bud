/* DDS-integration — dubbel-dummy-facit och zonjusterad partävling */
(function(){
"use strict";
var modulePromise=null,cache={},STRAINS=["S","H","D","C","N"],RANKS={14:"A",13:"K",12:"Q",11:"J",10:"T"};
var NAMES={S:"♠",H:"♥",D:"♦",C:"♣",N:"NT"};
function loadScript(src){return new Promise(function(resolve,reject){var s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=function(){reject(new Error("Kunde inte ladda "+src))};document.head.appendChild(s)})}
function loadDds(){
 if(modulePromise)return modulePromise;
 modulePromise=(async function(){
  if(!window.crossOriginIsolated||typeof SharedArrayBuffer==="undefined")throw new Error("DDS kräver säkerhetsläget från service workern. Öppna sidan via GitHub Pages och ladda om efter första besöket.");
  if(typeof window.ddsWebWasmBytes!=="function")await loadScript("dds-runtime/dds_web_wasm_bin.js");
  if(typeof window.createDdsModule!=="function")await loadScript("dds-runtime/dds_web_wasm.js");
  if(typeof window.ddsWebWasmBytes!=="function"||typeof window.createDdsModule!=="function")throw new Error("DDS WebAssembly-filerna saknas.");
  return window.createDdsModule({wasmBinary:window.ddsWebWasmBytes()});
 })().catch(function(e){modulePromise=null;throw e});return modulePromise;
}
function pbn(hands){
 function one(seat){return ["S","H","D","C"].map(function(s){var cards=hands[seat].filter(c=>c[0]===s).map(c=>RANKS[+c.slice(1)]||String(+c.slice(1))).sort((a,b)=>"AKQJT98765432".indexOf(a)-"AKQJT98765432".indexOf(b));return cards.length?cards.join(""):"-"}).join(".")}
 return "N:"+["N","E","S","W"].map(one).join(" ");
}
function calcTable(m,hands){
 var ptr=m._malloc(80);
 try{var rc=m.ccall("dds_web_calc_table","number",["string","number"],[pbn(hands),ptr]);if(rc!==1)throw new Error("DDS returnerade felkod "+rc);var a=[];for(var i=0;i<20;i++)a.push(m.getValue(ptr+i*4,"i32"));return a}
 finally{m._free(ptr)}
}
function score(level,strain,tricks,doubled,vul){
 var target=level+6,delta=tricks-target;
 if(delta<0){
  var down=-delta,pen;
  if(!doubled)pen=(vul?100:50)*down;
  else if(vul)pen=down===1?200:500+300*(down-2);
  else pen=down===1?100:down===2?300:down===3?500:800+300*(down-4);
  return -pen*(doubled===2?2:1);
 }
 var minor=strain==="C"||strain==="D",base=strain==="N"?40+30*(level-1):(minor?20:30)*level;
 var contract=base*(doubled===2?4:doubled===1?2:1),total=contract;
 total+=contract>=100?(vul?500:300):50;
 if(level===6)total+=vul?750:500;
 if(level===7)total+=vul?1500:1000;
 if(doubled===1)total+=50;else if(doubled===2)total+=100;
 if(delta>0)total+=delta*(doubled===0?(minor?20:30):doubled===1?100:200)*(vul&&doubled?2:1);
 return total;
}
function textContract(level,strain){return level+NAMES[strain]}
function index(strain,declarer){return STRAINS.indexOf(strain)*4+["N","E","S","W"].indexOf(declarer)}
function evaluate(table,vul){
 var candidates=[];
 ["N","S"].forEach(function(declarer){STRAINS.forEach(function(strain){var tricks=table[index(strain,declarer)];for(var level=1;level<=7;level++){var sc=score(level,strain,tricks,0,vul);candidates.push({level,strain,declarer,tricks,score:sc,contract:textContract(level,strain)})}})});
 candidates.sort((a,b)=>b.score-a.score||b.tricks-a.tricks||a.level-b.level);
 return {best:candidates[0],candidates,table};
}
function currentContract(st,table,vul){
 var auc=window.Rattning.validateAuction(st);if(!auc.contract)return null;
 var strain=auc.contract[1],declarer=null;
 for(var i=0;i<st.bids.length;i++){var b=st.bids[i];if((auc.contractSide===0?(b.s==="N"||b.s==="S"):(b.s==="E"||b.s==="W"))&&b.c&&b.c[1]===strain&&/^[1-7]/.test(b.c)){declarer=b.s;break}}
 if(!declarer)return null;
 var tricks=table[index(strain,declarer)],level=+auc.contract[0],sc=score(level,strain,tricks,auc.doubled,vul)*(auc.contractSide===0?1:-1);
 return {contract:textContract(level,strain),declarer,tricks,required:level+6,delta:tricks-level-6,scoreNS:sc,side:auc.contractSide};
}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function render(st,table,vul){
 var box=document.getElementById("dds-review");if(!box)return;
 var ev=evaluate(table,vul),actual=currentContract(st,table,vul),b=ev.best;
 var h='<p class="status">DDS – dubbel-dummy-facit</p><p class="mu">Zon: <select id="dds-vul" class="sm"><option value="none" '+(!vul?'selected':'')+'>Ingen zon</option><option value="ns" '+(vul?'selected':'')+'>Nord–Syd i zon</option></select></p>';
 h+='<section class="review-item ok"><b>Bästa kontrakt för Nord–Syd enligt DDS</b><p style="font-size:24px;font-weight:700">'+esc(b.contract)+'</p><p>'+esc(b.declarer==="N"?"Norr":"Syd")+' som spelförare · '+b.tricks+' stick · beräknad score '+b.score+' poäng ('+(vul?'i zon':'ozon')+').</p></section>';
 if(actual){h+='<section class="review-item '+(actual.side===0&&actual.delta>=0?'ok':actual.side===0?'fel':'mid')+'"><b>Det faktiska slutkontraktet</b><p>'+esc(actual.contract)+' · '+actual.tricks+' stick ('+(actual.delta>=0?actual.delta+' över':' '+(-actual.delta)+' bet')+') · NS-score '+actual.scoreNS+'.</p></section>'}
 h+='<p><b>Alla möjliga stick – Norr/Syd som spelförare</b></p><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;text-align:center">';
 h+='<div class="mu">Färg</div><div class="mu">Norr</div><div class="mu">Syd</div><div class="mu">Bästa nivå</div><div class="mu">Score</div>';
 STRAINS.forEach(function(s){var nt=table[index(s,"N")],stx=table[index(s,"S")],pick=ev.candidates.filter(x=>x.strain===s).sort((a,b)=>b.score-a.score)[0];h+='<div style="padding:6px;background:var(--bg);border-radius:6px">'+NAMES[s]+'</div><div style="padding:6px;background:var(--bg);border-radius:6px">'+nt+'</div><div style="padding:6px;background:var(--bg);border-radius:6px">'+stx+'</div><div style="padding:6px;background:var(--bg);border-radius:6px">'+pick.contract+'</div><div style="padding:6px;background:var(--bg);border-radius:6px">'+pick.score+'</div>'});
 h+='</div><p class="mu" style="margin-top:10px">DDS använder alla fyra händer. Det här är det teoretiska facit efter given – inte information som spelarna hade under budgivningen. Zonvalet påverkar poängberäkningen.</p>';
 box.innerHTML=h;
 var sel=document.getElementById("dds-vul");if(sel)sel.onchange=function(){render(st,table,sel.value==="ns")};
 if(window.BudAnalys&&window.Rattning){
  window.BudAnalys.analyze(st,window.Rattning.judge(st),{best:b,actual:actual,vulnerable:vul,table:table}).then(function(r){
   var target=document.getElementById("dds-review");if(target)target.insertAdjacentHTML("beforeend",'<div class="review-secondary"><p class="status">Samlad budanalys</p>'+r.html+'</div>');
  }).catch(function(e){var target=document.getElementById("dds-review");if(target)target.insertAdjacentHTML("beforeend",'<p class="mu">Analysbiblioteket kunde inte läsas: '+esc(e.message)+'</p>')});
 }
}
function run(st){
 var box=document.getElementById("dds-review");if(!box)return;
 var key=JSON.stringify([st.hands,st.bids,st.dealer]);
 box.innerHTML='<p class="status">Dubbel-dummy-analys</p><p class="mu">DDS räknar stick i alla fem spelfärgerna för både Norr och Syd…</p>';
 (async function(){try{var table=cache[key];if(!table){var m=await loadDds();table=calcTable(m,st.hands);cache[key]=table}render(st,table,false)}catch(e){box.innerHTML='<p class="status">DDS-analys kunde inte köras</p><p class="mu">'+esc(e.message||e)+'</p>'}})();
}
window.runDdsReview=run;
})();
