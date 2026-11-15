'use strict';

// Deterministic 100-deal stress test focused on uncontested 1♥/1♠ openings.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const R = require('../rattningsmotor.js');
const SEATS=['N','E','S','W'], NEXT={N:'E',E:'S',S:'W',W:'N'};
function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(rng){const d=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)d.push(s+n);for(let i=d.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return{N:d.slice(0,13),E:d.slice(13,26),S:d.slice(26,39),W:d.slice(39,52)};}
function hp(hand){return hand.reduce((n,c)=>n+Math.max(0,Number(c.slice(1))-10),0);}
function passOpponents(h){const e=hp(h.E),w=hp(h.W);return e<=9&&w<=9&&e+w<=17;}
function opening(h){return R.nodeFor({hands:h,dealer:'N',bids:[{s:'N',c:'P'}]},0);}
function generate(){
 const out=[],seen=new Set();
 for(let seed=202611150;out.length<100&&seed<202611150+3000000;seed++){
  const rng=mulberry(seed),hands=shuffle(rng);
  if(!passOpponents(hands))continue;
  const first=opening(hands);
  if(!first||!['1H','1S'].includes(first.exp))continue;
  if(rng()>Math.exp(0.133*(hp(hands.N)+hp(hands.S)-40)))continue;
  const key=SEATS.map(s=>hands[s].slice().sort().join(',')).join('|');
  if(seen.has(key))continue;seen.add(key);
  out.push({id:'one-major-'+String(out.length+1).padStart(3,'0'),seed,hands,opening:first.exp});
 }
 assert.equal(out.length,100,'Could not generate 100 unique 1♥/1♠ opening deals.');
 return out;
}
const deals=generate();
const report={generatedAt:new Date().toISOString(),engineVersion:R.version,deals:deals.length,openings:{'1H':0,'1S':0},turns:0,covered:0,uncovered:[],exceptions:[],illegalRecommendations:[],invalidAuctions:[],unfinishedAuctions:[],cardIntegrityErrors:[]};
for(const deal of deals){
 report.openings[deal.opening]++;
 const all=SEATS.flatMap(s=>deal.hands[s]);
 if(all.length!==52||new Set(all).size!==52||SEATS.some(s=>deal.hands[s].length!==13)||!passOpponents(deal.hands)){report.cardIntegrityErrors.push(deal.id);continue;}
 const st={hands:deal.hands,dealer:'N',bids:[]};let seat='N',ended=false,guard=0;
 while(!ended&&guard++<32){
  const index=st.bids.length;let call='P';
  if(seat==='N'||seat==='S'){
   report.turns++;st.bids.push({s:seat,c:'P'});
   try{
    const node=R.nodeFor(st,index);
    if(node&&node.exp){call=node.exp;report.covered++;}
    else report.uncovered.push({dealId:deal.id,seed:deal.seed,seat,auction:st.bids.map(x=>x.s+':'+x.c).join(' '),reason:node&&node.why?node.why:'No matching rule'});
   }catch(e){report.exceptions.push({dealId:deal.id,seat,message:String(e&&e.message||e)});}
   st.bids[index]={s:seat,c:call};
  }else st.bids.push({s:seat,c:'P'});
  const v=R.validateAuction(st);
  for(const e of v.errors)if(e.index===index)report.illegalRecommendations.push({dealId:deal.id,seat,call,message:e.message});
  ended=v.ended;seat=NEXT[seat];
 }
 const final=R.validateAuction(st);
 if(!final.valid)report.invalidAuctions.push({dealId:deal.id,errors:final.errors});
 if(!final.ended)report.unfinishedAuctions.push({dealId:deal.id,calls:st.bids.length});
}
report.coveragePercent=report.turns?Math.round(report.covered/report.turns*1000)/10:0;
fs.mkdirSync('testdata',{recursive:true});
fs.writeFileSync('testdata/one_major_100_validation_latest.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({deals:report.deals,openings:report.openings,turns:report.turns,covered:report.covered,uncovered:report.uncovered.length,coveragePercent:report.coveragePercent,exceptions:report.exceptions.length,illegalRecommendations:report.illegalRecommendations.length,invalidAuctions:report.invalidAuctions.length,unfinishedAuctions:report.unfinishedAuctions.length,cardIntegrityErrors:report.cardIntegrityErrors.length},null,2));
assert.equal(report.cardIntegrityErrors.length,0);
assert.equal(report.exceptions.length,0);
assert.equal(report.illegalRecommendations.length,0);
assert.equal(report.invalidAuctions.length,0);
assert.equal(report.unfinishedAuctions.length,0);
