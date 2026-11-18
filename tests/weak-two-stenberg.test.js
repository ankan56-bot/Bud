'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');

const opener=['H8','H9','H10','H11','H12','H13','S2','S3','D3','D4','C4','C5','C6'];
function deal(responder){
  const deck=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);
  assert.equal(new Set([...opener,...responder]).size,26);
  const rest=deck.filter(c=>!opener.includes(c)&&!responder.includes(c));
  return {N:opener,E:rest.slice(0,13),S:responder,W:rest.slice(13,26)};
}
function response(responder){
  const hands=deal(responder);
  return R.nodeFor({hands,dealer:'N',bids:[{s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'2N'}]},2);
}
// 10 HP + singleton (2 STP) + doubleton (1 STP) = 13 STP, with six-card heart support.
const thirteenStp=['H2','H3','H4','H5','H6','H7','S14','D13','D2','C12','C11','C2','C3'];
const accepted=response(thirteenStp);
assert.equal(accepted.exp,'2N');
assert.equal(accepted.conv,'svag tvåa / Stenberg');
assert.equal(accepted.ruleStatus,'source_confirmed');

// 9 HP + 3 shortage points = 12 STP: must not be misclassified as Stenberg.
const twelveStp=['H2','H3','H4','H5','H6','H7','S14','D13','D2','C12','C2','C3','C4'];
assert.equal(response(twelveStp).exp,null);
assert.equal(response(twelveStp).sourceGap,false);

// 13 STP plus a 5-card side suit is an unresolved overlap, not an invented priority.
const overlapping=['H2','H3','H4','H5','H6','H7','S14','D13','C12','C11','C10','C2','C3'];
const overlapResult=response(overlapping);
assert.equal(overlapResult.exp,null);
assert.equal(overlapResult.sourceGap,true);

// The opener's rebid after weak-two Stenberg is still a source gap.
// The old 6–8 / 9–10 HP ladder must not be used.
const hands=deal(thirteenStp);
const openerRebid=R.nodeFor({hands,dealer:'N',bids:[
 {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},{s:'N',c:'3H'}
]},4);
assert.equal(openerRebid.exp,null);
assert.equal(openerRebid.sourceGap,true);
console.log('Weak-two 2NT Stenberg: 13+ STP, threshold, overlap and opener source-gap tests passed.');
