(function(){
"use strict";
var modulePromise=null, resultCache={};
var STRAINS=["S","H","D","C","N"], RANKS={14:"A",13:"K",12:"Q",11:"J",10:"T"};
function loadScript(src){
 return new Promise(function(resolve,reject){
  var s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=function(){reject(new Error("Kunde inte ladda "+src))};document.head.appendChild(s);
 });
}
function loadDds(){
 if(modulePromise)return modulePromise;
 modulePromise=(async function(){
  if(!window.crossOriginIsolated||typeof SharedArrayBuffer==="undefined"){
   throw new Error("Safari aktiverar säkerhetsläget för DDS. Ladda om sidan en gång när den har installerat service workern.");
  }
  if(typeof window.ddsWebWasmBytes!=="function")await loadScript("dds-runtime/dds_web_wasm_bin.js");
  if(typeof window.createDdsModule!=="function")await loadScript("dds-runtime/dds_web_wasm.js");
  if(typeof window.ddsWebWasmBytes!=="function"||typeof window.createDdsModule!=="function")throw new Error("DDS-filerna har ännu inte byggts in.");
  return window.createDdsModule({wasmBinary:window.ddsWebWasmBytes()});
 })().catch(function(e){modulePromise=null;throw e});
 return modulePromise;
}
function pbn(hands){
 function one(seat){return ["S","H","D","C"].map(function(s){
  var cards=hands[seat].filter(function(c){return c[0]===s}).map(function(c){return RANKS[+c.slice(1)]||String(+c.slice(1)).sort(function(a,b){return "AKQJT98765432".indexOf(a)-"AKQJT98765432".indexOf(b)});
  return cards.length?cards.join(""):"-";
 }).join(".")}
 return "N:"+["N","E","S","W"].map(one).join(" ");
}
function score(level,strain,tricks,doubled){
 var target=level+6, made=tricks-target, mult=doubled===2?4:doubled===1?2:1;
 var per=strain==="C"||strain==="D"?20:30;
 var points=strain==="N"?40+30*(level-1):per*level;
 var contractPoints=points*mult, score=contractPoints;
 if(contractPoints>=100)score+=300;else score+=50;
 if(level===6)score+=500;
 if(level===7)score+=1000;
 if(doubled===1)score+=50;else if(doubled===2)score+=100;
 if(made>0){
  if(doubled===0)score+=made*(strain==="C"||strain==="D"?20:30);
  else score+=made*(doubled===2?200:100);
 }else if(made<0){
  var down=-made;
  if(doubled===0)score-=50*down;
  else{
   var pen=down===1?100:down===2?300:down===3?500:800+300*(down-4);
   score-=pen*(doubled===2?2:1);
  }
 }
 return score;
}
function contractText(code){return code?code[0]+({S:"♠",H:"♥",D:"♦",C:"♣",N:"NT"}[code[1]]||code[1]):"pass"}
function calcTable(module,hands){
 var ptr=module._malloc(20*4);
 try{
  var rc=module.ccall("dds_web_calc_table","number",["string","number"],[pbn(hands),ptr]);
  if(rc!==1)throw new Error("DDS returnerade felkod "+rc);
  var values=[];for(var i=0;i<20;i++)values.push(module.getValue(ptr+i*4,"i32"));
  return values;
 }finally{module._free(ptr)}
}
function run(st){
 var box=document.getElementById("dds-review");if(!box)return;
 var key=JSON.stringify([st.hands,st.bids,st.dealer]);
 if(resultCache[key]){box.innerHTML=resultCache[key];return}
 box.innerHTML='<p class="status">Dubbel-dummy-analys</p><p class="mu">DDS analyserar alla 20 kombinationer av färg och spelhand…</p>';
 (async function(){
  try{
   var m=await loadDds(),t=calcTable(m,st.hands),idx={S:0,H:1,D:2,C:3,N:4},seatIdx={N:0,E:1,S:2,W:3};
   var best=null;
   ["N","S"].forEach(function(declarer){
    STRAINS.forEach(function(strain){
     var tricks=t[idx[strain]*4+seatIdx[declarer]];
     for(var level=1;level<=7;level++)if(tricks>=level+6){
      var sc=score(level,strain,tricks,0);
      if(!best||sc>best.score)best={level:level,strain:strain,declarer:declarer,tricks:tricks,score:sc};
     }
    });
   });
   var auction=window.Rattning.validateAuction(st),actual="";
   if(auction.contract&&auction.contractSide===0){
    var strain=auction.contract[1],declarer=null;
    for(var i=0;i<st.bids.length;i++){var b=st.bids[i];if((b.s==="N"||b.s==="S")&&b.c&&b.c[1]===strain&&/^[1-7]/.test(b.c)){declarer=b.s;break}}
    if(declarer){
     var level=+auction.contract[0],tricks=t[idx[strain]*4+seatIdx[declarer]],diff=tricks-(level+6);
     var made=diff>=0?"går hem"+(diff?" med "+diff+" övertrick":""):"går bet med "+(-diff)+" undertrick";
     var actualScore=score(level,strain,tricks,auction.doubled);
     actual='<p><b>Er slutkontrakt:</b> '+contractText(auction.contract)+' av '+(declarer==="N"?"Norr":"Syd")+' – '+tricks+' stick, '+made+'.</p><p class="mu">Beräknad score utan zon: '+actualScore+' poäng för Nord/Syd.</p>';
    }
   }
   var bestHtml=best?'<p><b>Bästa möjliga kontrakt för Nord/Syd:</b> '+best.level+({S:"♠",H:"♥",D:"♦",C:"♣",N:"NT"}[best.strain])+' av '+(best.declarer==="N"?"Norr":"Syd")+' – '+best.tricks+' stick.</p><p class="mu">Score utan zon: '+best.score+' poäng.</p>':'<p>Inget kontrakt på Nord/Syds sida kan gå hem.</p>';
   var out='<p class="status">Dubbel-dummy-analys</p>'+bestHtml+actual+'<p class="mu">Beräknat med DDS i webbläsaren. Ingen zon/vulnerabilitet används.</p>';
   resultCache[key]=out;box.innerHTML=out;
  }catch(e){box.innerHTML='<p class="status">DDS-analys kunde inte köras</p><p class="mu">'+String(e.message||e).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})+'</p>'}
 })();
}
window.runDdsReview=run;
})();