/* analysmotor.js — regelbaserad analys ovanpå rättningsmotorn och analysbiblioteket */
(function(global){
"use strict";
const SUITS=["S","H","D","C"], SUIT_NAME={S:"spader",H:"hjärter",D:"ruter",C:"klöver"};
const SYMBOL={S:"♠",H:"♥",D:"♦",C:"♣",N:"sang"};
let libraryPromise=null, supplementaryPromise=null;
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
function loadSupplementary(){
 if(!supplementaryPromise)supplementaryPromise=fetch("kompletterande_budlogik.json").then(r=>{if(!r.ok)throw new Error("Kompletterande budlogik kunde inte läsas ("+r.status+").");return r.json()});
 return supplementaryPromise;
}
function handStats(hand){
 const L=lengths(hand),hcp=(hand||[]).reduce((sum,c)=>sum+Math.max(0,(+c.slice(1))-10),0);
 const shape=[L.S,L.H,L.D,L.C].sort((a,b)=>b-a).join("");
 return {L,hcp,shape,balanced:["4333","4432","5332"].includes(shape)};
}
function nextSeat(seat){return {N:"E",E:"S",S:"W",W:"N"}[seat]}
function partnerSeat(seat){return {N:"S",S:"N",E:"W",W:"E"}[seat]}
function handMatches(conditions,hand){
 if(!conditions||!hand)return false;
 const stats=handStats(hand),hcp=conditions.hcp||{};
 if(hcp.min!=null&&stats.hcp<hcp.min)return false;
 if(hcp.max!=null&&stats.hcp>hcp.max)return false;
 for(const suit of SUITS){
  const range=(conditions.shape||{})[suit];
  if(range&&range.min!=null&&stats.L[suit]<range.min)return false;
  if(range&&range.max!=null&&stats.L[suit]>range.max)return false;
 }
 if(conditions.balanced===true&&!stats.balanced)return false;
 if(conditions.balanced===false&&stats.balanced)return false;
 (conditions.stoppers||[]).forEach(function(suit){
  const suited=(hand||[]).filter(c=>c[0]===suit),ranks=suited.map(c=>+c.slice(1));
  const has=(rank)=>ranks.includes(rank);
  const stopped=has(14)||(has(13)&&suited.length>=2)||(has(12)&&suited.length>=3)||(has(11)&&suited.length>=4);
  if(!stopped)stats.stopperMismatch=true;
 });
 if(stats.stopperMismatch)return false;
 return true;
}
function findSupplementary(logic,bids,hands,seat){
 const entries=logic&&Array.isArray(logic.entries)?logic.entries:[];
 const q=normalizeSequence((bids||[]).map(b=>callText(b.c)));
 if(!q.length)return [];
 const expectedNext=nextSeat((bids||[])[bids.length-1].s);
 const next=seat||expectedNext;
 if(next!==expectedNext)return [];
 return entries.filter(entry=>{
  const prefix=normalizeSequence(entry.auctionPrefix||[]);
  if(prefix.length>q.length)return false;
  const offset=q.length-prefix.length;
  if(!prefix.every((v,i)=>v===q[offset+i]))return false;
  const openingSeat=bids[offset]&&bids[offset].s;
  const role=entry.handConditions&&entry.handConditions.seatRole;
  if(role==="responder"&&next!==partnerSeat(openingSeat))return false;
  if(role==="opener"&&next!==openingSeat)return false;
  if(!handMatches(entry.handConditions,hands&&hands[next]))return false;
  return true;
 }).map(entry=>({
  id:entry.id,topic:entry.topic,seat:next,recommendation:entry.recommendation,
  rationale:entry.rationale,alternatives:entry.alternatives||[],
  confidence:entry.confidence,approvalStatus:entry.approvalStatus,
  systemCoverage:entry.systemCoverage,relationshipToSystem:entry.relationshipToSystem,
  provenance:entry.provenance,notes:entry.notes||[]
 }));
}
async function analyzeSupplementary(st,seat){
 const logic=await loadSupplementary();
 return findSupplementary(logic,st&&st.bids,st&&st.hands,seat);
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
  if(actual&&actual.side===0&&fits.length&&actual.strain!=="N"&&!fits.some(x=>x.suit===actual.strain)){
   findings.push("Efterhandskontrollen visar minst en åttakortsfit ("+fits.map(x=>x.name+" "+x.total).join(", ")+"), medan slutkontraktet spelades i en annan färg. Det kan vara en missad trumffärg, men budsekvensen måste visa om paret hade möjlighet att upptäcka den.");
  }
  if(actual&&actual.side===0&&actual.delta<0){
   findings.push("Det faktiska Nord–Syd-kontraktet går bet enligt DDS. Det är ett överkontrakt i efterhand; om budgivningen borde ha stannat lägre avgörs av den information paret hade.");
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
  if(report.library.conditions.length)h+='<p>Förutsättningar: '+report.library.conditions.map(escapeHtml).join(" · ")+'</p>';
  if(report.library.meaning)h+='<p>'+escapeHtml(report.library.meaning)+'</p>';
  if(report.library.analysis)h+='<p>'+escapeHtml(report.library.analysis)+'</p>';
 }
 h+='</section>';
 if(report.ruleErrors.length){
  h+='<section class="review-item fel"><b>Rättningsmotorns avvikelser</b>';
  report.ruleErrors.forEach(x=>{h+='<p>Bud '+x.nr+' ('+escapeHtml(x.seat)+'): '+escapeHtml(x.bid)+(x.suggested?' · förslag '+escapeHtml(x.suggested):'')+(x.reason?' — '+escapeHtml(x.reason):'')+'</p>'});
  h+='</section>';
 }
 if(report.dds&&Array.isArray(report.dds.table)&&report.dds.table.length>=20){
  const strains=[["S","♠"],["H","♥"],["D","♦"],["C","♣"],["N","NT"]];
  const seats=["N","E","S","W"];
  h+='<section class="review-item dds-matrix"><b>Maximala stick i alla spelfärger</b><p class="mu">Maximalt antal stick med respektive spelare som spelförare och varje färg som trumf eller sang.</p><div class="matrix-scroll"><table><thead><tr><th>Spelfärg</th><th>Norr</th><th>Öst</th><th>Syd</th><th>Väst</th></tr></thead><tbody>';
  strains.forEach(function(strain,i){
   h+='<tr><th>'+strain[1]+'</th>';
   seats.forEach(function(seat,j){h+='<td>'+report.dds.table[i*4+j]+'</td>'});
   h+='</tr>';
  });
  h+='</tbody></table></div></section>';
 }
 if(report.fits.length){
  h+='<section class="review-item"><b>Färganpassningar som finns i given</b><p>'+report.fits.map(x=>escapeHtml(x.name+" "+x.total+" kort ("+x.north+"–"+x.south+")")).join(" · ")+'</p></section>';
 }
 return h;
}
async function analyze(st,ruleResult,ddsResult){
 const lib=await loadLibrary();global.BudAnalysLibrary=lib;
 const report=buildReport(st,ruleResult,ddsResult);
 return {report,html:render(report)};
}
global.BudAnalys={
 version:"1.1.0",loadLibrary,loadSupplementary,findSupplementary,analyzeSupplementary,handStats,handMatches,findMatch,treeCompatible,buildReport,analyze,
 normalizeSequence
};
if(typeof module!=="undefined"&&module.exports)module.exports=global.BudAnalys;
})(typeof window!=="undefined"?window:globalThis);
