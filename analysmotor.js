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
 const raw=normalizeSequence((bids||[]).map(b=>callText(b.c))),hits=[];
 for(const tree of lib.trees||[]){
  if(!treeCompatible(tree))continue;
  // Competitive trees T29–T33 store only contract calls. Their explicit
  // ignorePasses flag keeps normal pass rounds from preventing a match,
  // without weakening exact sequencing in the other trees.
  const q=tree.ignorePasses?raw.filter(v=>v!=="Pass"):raw;
  for(const node of tree.nodes||[]){
   const seq=normalizeSequence(node.sequence||[]);
   if(seq.length<=q.length&&seq.every((v,i)=>v==="…"||v===q[i]))hits.push({tree,node,length:seq.length,exact:seq.length===q.length});
  }
 }
 hits.sort((a,b)=>b.length-a.length);
 return hits[0]||null;
}
function evaluateHandConditions(hand,conditions){
 const c=conditions||{};
 if(!Array.isArray(hand)||hand.length!==13)return {status:"invalid_hand",matches:null,failures:["Handen måste innehålla 13 kort."],manual:[]};
 const seen=new Set(),shape={S:0,H:0,D:0,C:0};let hcp=0;
 for(const card of hand){
  const m=typeof card==="string"&&card.match(/^([SHDC])(1[0-4]|[2-9])$/);
  if(!m||seen.has(card))return {status:"invalid_hand",matches:null,failures:["Handen innehåller ogiltigt eller duplicerat kort."],manual:[]};
  seen.add(card);shape[m[1]]++;
  const rank=Number(m[2]);hcp+=rank===14?4:rank===13?3:rank===12?2:rank===11?1:0;
 }
 const failures=[];
 if(c.hcp){
  if(Number.isFinite(c.hcp.min)&&hcp<c.hcp.min)failures.push("HCP under miniminivån ("+hcp+" < "+c.hcp.min+").");
  if(Number.isFinite(c.hcp.max)&&hcp>c.hcp.max)failures.push("HCP över maximinivån ("+hcp+" > "+c.hcp.max+").");
 }
 for(const [suit,bounds] of Object.entries(c.suitLengths||{})){
  if(!Object.prototype.hasOwnProperty.call(shape,suit))return {status:"invalid_conditions",matches:null,failures:["Okänd färg i handvillkoren: "+suit],manual:[]};
  if(Number.isFinite(bounds.min)&&shape[suit]<bounds.min)failures.push("För få "+SUIT_NAME[suit]+" ("+shape[suit]+" < "+bounds.min+").");
  if(Number.isFinite(bounds.max)&&shape[suit]>bounds.max)failures.push("För många "+SUIT_NAME[suit]+" ("+shape[suit]+" > "+bounds.max+").");
 }
 if(c.balanced===true&&!["4333","4432","5332"].includes(Object.values(shape).sort((a,b)=>b-a).join("")))failures.push("Handen är inte balanserad enligt 4-3-3-3, 4-4-3-2 eller 5-3-3-2.");
 if(c.balanced===false&&["4333","4432","5332"].includes(Object.values(shape).sort((a,b)=>b-a).join("")))failures.push("Handen är balanserad men villkoret kräver obalanserad hand.");
 const manual=Array.isArray(c.manual)?c.manual.slice():[];
 if(manual.length)return {status:"manual_review",matches:null,hcp,shape,failures,manual};
 if(failures.length)return {status:"no_match",matches:false,hcp,shape,failures,manual:[]};
 if(!c.hcp&&!c.balanced&&!Object.keys(c.suitLengths||{}).length)return {status:"invalid_conditions",matches:null,hcp,shape,failures:[],manual:["Inga maskinellt verifierbara handvillkor finns."]};
 return {status:"match",matches:true,hcp,shape,failures:[],manual:[]};
}
// Post-deal analysis only: this reads the actual hand after the auction.
function evaluateMatchedHand(match,bids,hands){
 if(!match||!match.node||!Array.isArray(bids)||!hands)return null;
 const calls=bids.filter(b=>b&&b.c!=="P");
 const sequenceCalls=(match.node.sequence||[]).filter(c=>normalizeCall(c)!=="Pass");
 const index=sequenceCalls.length-1,entry=calls[index],last=sequenceCalls[sequenceCalls.length-1];
 if(!entry||!last||normalizeCall(callText(entry.c))!==normalizeCall(last))return null;
 const hand=hands[entry.s];
 if(!hand)return null;
 let conditions=match.node.handConditions||null,role=null;
 if(match.node.handConditionsByRole){
  const first=calls[0];
  const partnerOf={N:"S",S:"N",E:"W",W:"E"};
  if(first&&entry.s===first.s)role="opener";
  else if(first&&partnerOf[first.s]===entry.s)role="responder";
  if(!role)return null;
  conditions=match.node.handConditionsByRole[role]||null;
 }
 if(!conditions)return null;
 return {seat:entry.s,role,...evaluateHandConditions(hand,conditions)};
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
 const handReview=evaluateMatchedHand(match,st.bids,st.hands);
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
  version:"1.0.6",
  source:"Rattningsmotor v"+((global.Rattning&&global.Rattning.version)||"?")+" + analysbibliotek",
  ruleErrors:rules.errors,uncovered:rules.uncovered,optional:rules.optional,
  fits:fits,theoreticalFindings:findings,
  library:match?{treeId:match.tree.id,title:match.tree.title,conditions:match.tree.conditions||[],sequence:match.node.sequence||[],meaning:match.node.meaning||"",analysis:match.node.analysis||"",exact:match.exact,handReview}:null,
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
  if(report.library.handReview){
   const r=report.library.handReview;
   const label=r.status==="match"?"Maskinellt verifierade handvillkor uppfyllda":r.status==="no_match"?"Handen uppfyller inte de maskinella villkoren":"Manuell kontroll krävs för återstående handvillkor";
   h+='<p><b>'+label+'</b> · '+escapeHtml(r.seat)+' · '+r.hcp+' hp · '+escapeHtml(Object.values(r.shape).join("-"))+'</p>';
   if(r.failures.length)h+='<p>'+r.failures.map(escapeHtml).join(" · ")+'</p>';
   if(r.manual.length)h+='<p>Ej maskinellt avgjort: '+r.manual.map(escapeHtml).join(" · ")+'</p>';
  }
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
 version:"1.0.6",loadLibrary,findMatch,treeCompatible,evaluateHandConditions,evaluateMatchedHand,buildReport,analyze,
 normalizeSequence
};
if(typeof module!=="undefined"&&module.exports)module.exports=global.BudAnalys;
})(typeof window!=="undefined"?window:globalThis);
