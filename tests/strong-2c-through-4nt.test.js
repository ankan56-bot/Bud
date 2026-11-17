'use strict';
const assert=require('node:assert/strict');
const factory=require('../2kloveroppning.js');

const api={
  SU:['C','D','H','S'],
  SYM:{C:'♣',D:'♦',H:'♥',S:'♠',N:'NT'},
  NAME:{},
  side:s=>s==='N'||s==='S'?0:1,
  partner:s=>({N:'S',S:'N',E:'W',W:'E'}[s]),
  isBid:c=>/^[1-7][CDHSN]$/.test(c),
  lv:c=>Number(c[0]),
  st_:c=>c[1],
  rk:c=>Number(c[0])*5+'CDHSN'.indexOf(c[1]),
  txt:c=>c,
  maj:s=>s==='H'||s==='S',
  lowest:(s,above)=>{for(let l=1;l<=7;l++){const b=l+s;if(!above||Number(b[0])*5+'CDHSN'.indexOf(b[1])>Number(above[0])*5+'CDHSN'.indexOf(above[1]))return b;}return null;},
  jump:()=>null,H:()=>null,handHps:()=>0,partnershipPoints:()=>0,T:m=>c=>m[c]||null,
  ok:()=>true,NC:(why,means,conv,sourceGap)=>({exp:null,alt:[],why,means:means||(()=>null),conv:conv||'test',sourceGap:!!sourceGap})
};
const twoClub=factory(api);

// The user's selected response is unconditional: no strength or shape alternative.
for(const hand of [
  {hp:0,bal:false,L:{C:0,D:0,H:0,S:0}},
  {hp:5,bal:true,L:{C:1,D:4,H:4,S:4}},
  {hp:12,bal:false,L:{C:6,D:2,H:3,S:2}},
  {hp:20,bal:true,L:{C:3,D:3,H:3,S:4}}
]){
  const response=twoClub.resp2c(hand);
  assert.equal(response.exp,'2D');
  assert.deepEqual(response.alt,[]);
}

// Opening: retain the existing strong-opening thresholds.
assert.equal(twoClub.opening({hp:19,bal:false}),null);
assert.equal(twoClub.opening({hp:20,bal:false}).exp,'2C');
assert.equal(twoClub.opening({hp:21,bal:true}),null);
assert.equal(twoClub.opening({hp:22,bal:true}).exp,'2C');

// Exact balanced rebid ranges after 2C-2D.
for(const hp of [22,23,24]){
  const r=twoClub.reb2c({hp,bal:true,L:{}},'2D');
  assert.equal(r.exp,'2N',hp+' hp must rebid 2NT');
  assert.match(r.why,/22-24/);
}
for(const hp of [25,26,27]){
  const r=twoClub.reb2c({hp,bal:true,L:{}},'2D');
  assert.equal(r.exp,'3N',hp+' hp must rebid 3NT');
  assert.match(r.why,/25-27/);
}
for(const hp of [28,29]){
  const r=twoClub.reb2c({hp,bal:true,L:{}},'2D');
  assert.equal(r.exp,'4N',hp+' hp must rebid 4NT');
  assert.match(r.why,/Lathunden s\. 24/);
  assert.match(r.means('4N'),/28-29/);
}

// Out-of-range balanced hands are not silently forced into a neighboring range.
for(const hp of [20,21,30,31]){
  const r=twoClub.reb2c({hp,bal:true,L:{}},'2D');
  assert.equal(r.exp,null,hp+' hp is outside the documented 22-29 balanced rebid ranges');
  assert.equal(r.sourceGap,true);
}

// Obalanced hands: 5+ major rebids at the 2-level; otherwise 5+ minor at the 3-level.
assert.equal(twoClub.reb2c({hp:20,bal:false,L:{C:2,D:2,H:5,S:4}},'2D').exp,'2H');
assert.equal(twoClub.reb2c({hp:20,bal:false,L:{C:5,D:4,H:2,S:2}},'2D').exp,'3C');
const noFiveCardSuit=twoClub.reb2c({hp:22,bal:false,L:{C:4,D:4,H:3,S:2}},'2D');
assert.equal(noFiveCardSuit.exp,null);
assert.match(noFiveCardSuit.why,/utan 5-korts färg/);

// Only the selected 2D response is handled.
const wrongResponse=twoClub.reb2c({hp:23,bal:true,L:{}},'2H');
assert.equal(wrongResponse.exp,null);

console.log('Strong 2C through 4NT: all tests passed.');
