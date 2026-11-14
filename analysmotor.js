/* analysmotor.js — regelbaserad analys ovanpå rättningsmotorn och analysbiblioteket */
(function(global){
"use strict";
const SUITS=["S","H","D","C"], SUIT_NAME={S:"spader",H:"hjärter",D:"ruter",C:"klöver"};
const SYMBOL={S:"♠",H:"♥",D:"♦",C:"♣",N:"sang"};
let libraryPromise=null;
function callText(c){
 if(c==="P")return "Pass";if(c==="X")return "Dbl";if(c==="XX")return "Redbl";
 if(!c)return "";return String(c[0])+({S:"♠",H:"♥",D:"♦",C:"♣",N:"NT"}[c[1]]||c[1]);
}
function normalizeCall(c){
 let s=String(c||"").trim().replace(/Pass/i,"Pass").replace(/Dbl|X$/i,"Dbl").replace(/Redbl|XX/i,"Redbl");
 s=s.replace(/NT$/i,"NT").replace(/([1-7])([SHDC])$/i,(_,n,x)=>n+({S:"♠",H:"♥",D:"♦",C:"♣"}[x.toUpperCase()]));
 return s;
}
function normalizeSequence(seq){return (seq||[]).map(normalizeCall)}
function loadLibrary(){
 if(!libraryPromise)libraryPromise=fetch("analysbibliotek.json").then(r=>{if(!r.ok)throw new Error("Analysbiblioteket kunde inte läsas ("+r.status+").");return r.json()});
 return libraryPromise;
}
function treeCompatible(tree){
 const text=JSON.stringify(tree||{});
 // Explicitly reject prototype passages that contradict the authoritative
 // correction engine's Stenberg convention or the partnership's RKC 1430.
 if(/Jacoby/i.test(text))return false;
 if(text.includes("5♣=0")||text.includes("5♣ = 0")||text.includes("5♣ visar 0"))return false;
 if(text.includes("5♦=1")||text.includes("5♦ = 1")||text.includes("5♦ visar 1"))return false;
 return true;
}
function findMatch(lib,bids){
 const q=normalizeSequence((bids||[]).map(b=>callText(b.c))),hits=[];
 for(const tree of lib.trees||[]){
  if(!treeCompatible(tree))continue;
  for(const node of tree.nodes||[]){
   const seq=normalizeSequence(node.sequence||[]);
   if(seq.length<=q.length&&seq.every((v,i)=>v==="…"||v===q[i]))hits.push({tree,node,length:seq.length,exact:seq.length===q.length});
  }
 }
 hits.sort((a,b)=>b.length-a.length);
 return hits[0]||null;
}
function lengths(hand){
 const L={S:0,H:0,D:0,C:0};(hand||[]).forEach(c=>{if(L[c[0]]!==undefined)L[c[0]]++});return L;
}
function fitSummary(hands){
 const n=lengths(hands.N),s=lengths(hands.S);
 return SUITS.map(x=>({suit:x,name:SUIT_NAME[x],north:n[x],south:s[x],total:n[x]+s[x]}))
  .filter(x=>x.total>=8).sort((a,b)=>b.total-a.total);
}
function ruleSummary(result){
 const items=result&&result.items||[];
 return {
  errors:items.filter(x=>x.bedomning==="fel").map(x=>({nr:x.nr,seat:x.plats,bid:x.bud,suggested:x.battre,reason:x.motivering,convention:x.konvention})),
  uncovered:items.filter(x=>x.bedomning==="ej_täckt").length,
  optional:items.filter(x=>x.bedomning==="valfritt").length
 };
}
function buildReport(st,ruleResult,ddsResult){
 const match=findMatch(global.BudAnalysLibrary||{trees:[]},st.bids);
 const fits=fitSummary(st.hands),rules=ruleSummary(ruleResult),findings=[];
 const actual=ddsResult&&ddsResult.actual,best=ddsResult&&ddsResult.best;
 if(best){
  const game=best.strain==="N"?best.level>=3:(best.strain==="S"||best.strain==="H"?best.level>=4:best.level>=5);
  if(game&&(!actual||actual.side!==0||actual.scoreNS<best.score)){
   findings.push("DDS visar att "+best.contract+" kan ge "+best.tricks+" stick för Nord–Syd. Det är ett teoretiskt efterhandsfacit; det visar inte i sig att paret kunde bjuda kontraktet utifrån den information som fanns under budgivningen.");
  }
  if(best.level>=6&&(!actual||actual.side!==0||actual.contract!==best.contract)){
   findings.push("DDS hittar dessutom ett teoretiskt slamkontrakt ("+best.contract+"). Slamfrågan måste bedömas mot vad budgivningen faktiskt visade, inte enbart mot de dolda korten.");
  }
  if(actual&&actual.side===0&&best.score>actual.scoreNS){
   findings.push("Det teoretiskt bästa kontraktet ger "+(best.score-actual.scoreNS)+" fler poäng än det faktiska slutkontraktet enligt vald zon. Skillnaden är en jämförelse av korten efter given, inte automatiskt ett konstaterat budfel.");
  }
 }
 return {
  version:"1.0.1",
  source:"Rattningsmotor v"+((global.Rattning&&global.Rattning.version)||"?")+" + analysbibliotek",
  ruleErrors:rules.errors,uncovered:rules.uncovered,optional:rules.optional,
  fits:fits,theoreticalFindings:findings,
  library:match?{treeId:match.tree.id,title:match.tree.title,conditions:match.tree.conditions||[],sequence:match.node.sequence||[],meaning:match.node.meaning||"",analysis:match.node.analysis||"",exact:match.exact}:null,
  dds:ddsResult||null,
  knowledgeBoundary:"DDS använder samtliga fyra händer. En spelare under budgivningen känner bara till sin egen hand och informationen som partnerns och motståndarnas bud lagligen visar. Därför är DDS-facit en efterhandsjämförelse, inte automatiskt ett bud som paret kunde känna till."
 };
}
function escapeHtml(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function render(report){
 let h='<section class="review-item"><b>Analysbiblioteket</b>';
 if(report.library){
  h+='<p><b>'+escapeHtml(report.library.title)+'</b></p>';
  if(report.library.conditions.length)h+='<p class="mu">Förutsättningar: '+report.library.conditions.map(escapeHtml).join(" · ")+'</p>';
  if(report.library.meaning)h+='<p>'+escapeHtml(report.library.meaning)+'</p>';
  if(report.library.analysis)h+='<p>'+escapeHtml(report.library.analysis)+'</p>';
  h+='<p class="mu">'+(report.library.exact?"Sekvensen matchar ett komplett biblioteksavsnitt.":"Biblioteket matchar en del av budsekvensen; fortsättningen är inte täckt av just detta avsnitt.")+'</p>';
 }else h+='<p class="mu">Ingen specifik sekvens i biblioteket matchade. Rättningsmotorns egna regler och rekommendationer gäller fortfarande.</p>';
 h+='</section>';
 if(report.theoreticalFindings.length){h+='<section class="review-item"><b>Teoretisk kontraktsjämförelse</b>'+report.theoreticalFindings.map(x=>'<p>'+escapeHtml(x)+'</p>').join("")+'</section>'}
 if(report.fits.length){
  h+='<section class="review-item"><b>Färganpassningar som finns i given</b><p class="mu">Detta är en efterhandskontroll av de faktiska korten, inte information som paret automatiskt hade under budgivningen.</p><p>'+report.fits.map(x=>escapeHtml(x.name+" "+x.total+" kort ("+x.north+"–"+x.south+")")).join(" · ")+'</p></section>';
 }
 if(report.ruleErrors.length){
  h+='<section class="review-item fel"><b>Rättningsmotorns avvikelser</b>';
  report.ruleErrors.forEach(x=>{h+='<p>Bud '+x.nr+' ('+escapeHtml(x.seat)+'): '+escapeHtml(x.bid)+(x.suggested?' · förslag '+escapeHtml(x.suggested):'')+(x.reason?' — '+escapeHtml(x.reason):'')+'</p>'});
  h+='</section>';
 }
 h+='<section class="review-item"><b>Så ska facit tolkas</b><p class="mu">'+escapeHtml(report.knowledgeBoundary)+'</p></section>';
 return h;
}
async function analyze(st,ruleResult,ddsResult){
 const lib=await loadLibrary();global.BudAnalysLibrary=lib;
 const report=buildReport(st,ruleResult,ddsResult);
 return {report,html:render(report)};
}
global.BudAnalys={
 version:"1.0.2",loadLibrary,findMatch,treeCompatible,buildReport,analyze,
 normalizeSequence
};
})(typeof window!=="undefined"?window:globalThis);
