'use strict';

// Deterministic 200-deal validation of uncontested 1♣/1♦ openings.
// Source gaps are reported with all four hands; they are not converted to guesses.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const R=require('../rattningsmotor.js');
const SEATS=['N','E','S','W'],NEXT={N:'E',E:'S',S:'W',W:'N'};

function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(rng){const d=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)d.push(s+n);for(let i=d.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return{N:d.slice(0,13),E:d.slice(13,26),S:d.slice(26,39),W:d.slice(39,52)};}
function hp(hand){return hand.reduce((n,c)=>n+Math.max(0,Number(c.slice(1))-10),0);}
function shape(hand){const counts={S:0,H:0,D:0,C:0};for(const c of hand)counts[c[0]]++;return Object.values(counts).sort((a,b)=>b-a).join('');}
function has4441(hands){return SEATS.some(seat=>shape(hands[seat])==='4441');}
function passOpponents(h){const e=hp(h.E),w=hp(h.W);return e<=9&&w<=9&&e+w<=17;}
function opening(h){return R.nodeFor({hands:h,dealer:'N',bids:[{s:'N',c:'P'}]},0);}
function generate(){
 const out=[],seen=new Set();
 for(let seed=202611170;out.length<200&&seed<202611170+5000000;seed++){
  const rng=mulberry(seed),hands=shuffle(rng);
  if(!passOpponents(hands)||has4441(hands))continue;
  const first=opening(hands);
  if(!first||!['1C','1D'].includes(first.exp))continue;
  if(rng()>Math.exp(0.133*(hp(hands.N)+hp(hands.S)-40)))continue;
  const key=SEATS.map(s=>hands[s].slice().sort().join(',')).join('|');
  if(seen.has(key))continue;
  seen.add(key);
  out.push({id:'one-minor-'+String(out.length+1).padStart(3,'0'),seed,hands,opening:first.exp});
 }
 assert.equal(out.length,200,'Could not generate 200 unique 1♣/1♦ opening deals without 4-4-4-1 hands.');
 return out;
}

const deals=generate();
const report={
 generatedAt:new Date().toISOString(),engineVersion:R.version,deals:deals.length,
 openings:{'1C':0,'1D':0},turns:0,covered:0,uncovered:[],
 exceptions:[],illegalRecommendations:[],invalidAuctions:[],
 unfinishedAuctions:[],cardIntegrityErrors:[]
};

for(const deal of deals){
 report.openings[deal.opening]++;
 const all=SEATS.flatMap(s=>deal.hands[s]);
 if(all.length!==52||new Set(all).size!==52||SEATS.some(s=>deal.hands[s].length!==13)||
    has4441(deal.hands)||!passOpponents(deal.hands)){
  report.cardIntegrityErrors.push(deal.id);continue;
 }
 const st={hands:deal.hands,dealer:'N',bids:[]};
 let seat='N',ended=false,guard=0;
 while(!ended&&guard++<32){
  const index=st.bids.length;let call='P';
  if(seat==='N'||seat==='S'){
   report.turns++;
   st.bids.push({s:seat,c:'P'});
   try{
    const node=R.nodeFor(st,index);
    if(node&&node.exp){call=node.exp;report.covered++;}
    else report.uncovered.push({
      dealId:deal.id,seed:deal.seed,seat,
      auction:st.bids.map(x=>x.s+':'+x.c).join(' '),
      hands:deal.hands,sourceGap:!!(node&&node.sourceGap),
      reason:node&&node.why?node.why:'No matching rule'
    });
   }catch(e){
    report.exceptions.push({
      dealId:deal.id,seed:deal.seed,seat,
      auction:st.bids.map(x=>x.s+':'+x.c).join(' '),
      hands:deal.hands,message:String(e&&e.message||e),stack:String(e&&e.stack||'')
    });
   }
   st.bids[index]={s:seat,c:call};
  }else st.bids.push({s:seat,c:'P'});
  const validation=R.validateAuction(st);
  for(const error of validation.errors)if(error.index===index)
    report.illegalRecommendations.push({dealId:deal.id,seat,call,message:error.message});
  ended=validation.ended;seat=NEXT[seat];
 }
 const final=R.validateAuction(st);
 if(!final.valid)report.invalidAuctions.push({dealId:deal.id,errors:final.errors});
 if(!final.ended)report.unfinishedAuctions.push({dealId:deal.id,calls:st.bids.length});
}
report.coveragePercent=report.turns?Math.round(report.covered/report.turns*1000)/10:0;
report.sourceGapCount=report.uncovered.filter(x=>x.sourceGap).length;
fs.mkdirSync('testdata',{recursive:true});
fs.writeFileSync('testdata/one_minor_200_validation_latest.json',JSON.stringify(report,null,2)+'\n');
function compactHand(cards){
 const bySuit={S:[],H:[],D:[],C:[]};
 const ranks={14:'A',13:'K',12:'Q',11:'J',10:'T'};
 for(const card of cards)bySuit[card[0]].push(Number(card.slice(1)));
 return ['S','H','D','C'].map(s=>s+bySuit[s].sort((a,b)=>b-a).map(n=>ranks[n]||String(n)).join('')).join(' ');
}
const uncoveredLog={
 generatedAt:report.generatedAt,
 source:'200-deal ostörd budgivning; 4-4-4-1-händer exkluderade',
 coveragePercent:report.coveragePercent,
 uncovered:report.uncovered.map(x=>({
  dealId:x.dealId,seat:x.seat,auction:x.auction,sourceGap:x.sourceGap,reason:x.reason,
  hands:Object.fromEntries(SEATS.map(s=>[s,compactHand(x.hands[s])]))
 }))
};
fs.writeFileSync('testdata/one_minor_200_uncovered_latest.json',JSON.stringify(uncoveredLog,null,2)+'\n');
console.log(JSON.stringify({
 deals:report.deals,openings:report.openings,turns:report.turns,
 covered:report.covered,uncovered:report.uncovered.length,
 sourceGaps:report.sourceGapCount,coveragePercent:report.coveragePercent,
 exceptions:report.exceptions.length,illegalRecommendations:report.illegalRecommendations.length,
 invalidAuctions:report.invalidAuctions.length,unfinishedAuctions:report.unfinishedAuctions.length,
 cardIntegrityErrors:report.cardIntegrityErrors.length,uncoveredDetails:report.uncovered
},null,2));

assert.equal(report.deals,200);
assert.equal(report.cardIntegrityErrors.length,0);
assert.equal(report.exceptions.length,0);
assert.equal(report.illegalRecommendations.length,0);
assert.equal(report.invalidAuctions.length,0);
assert.equal(report.unfinishedAuctions.length,0);
assert.equal(report.sourceGapCount,report.uncovered.length,'Every uncovered minor sequence must be explicitly marked and saved as a source gap.');
assert.ok(report.coveragePercent>=93,'The 200-deal minor-opening test must retain at least 93% coverage while preserving explicit source gaps.');
