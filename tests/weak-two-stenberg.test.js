'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');

function deal(responder){
  const deck=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);
  assert.equal(responder.length,13);
  assert.equal(new Set(responder).size,13);
  const unavailable=new Set(responder),opener=[];
  function take(suit,count){
    for(const card of deck){
      if(card[0]===suit&&!unavailable.has(card)&&opener.filter(x=>x[0]===suit).length<count)
        opener.push(card);
    }
  }
  take('H',6);take('S',2);take('D',2);take('C',3);
  assert.equal(opener.length,13);
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

// 14 STP plus 3+ support also matches the separate 3-level invit range;
// the Lathund does not give priority between that and 2NT Stenberg.
const invitOverlap=['H2','H3','H4','H5','H6','H7','S14','D14','D2','C12','C11','C10','C2'];
const invitOverlapResult=response(invitOverlap);
assert.equal(invitOverlapResult.exp,null);
assert.equal(invitOverlapResult.sourceGap,true);

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

// Lathund s. 27: direct 4NT after weak 2H is an ace ask with hearts agreed.
const ask=R.nodeFor({hands,dealer:'N',bids:[
 {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'4N'}
]},2);
assert.equal(ask.exp,'4N');
assert.equal(ask.conv,'Blackwood 5 ess');
// The existing RKC response table is reused; opener has the trump king, so one keycard = 5D.
const reply=R.nodeFor({hands,dealer:'N',bids:[
 {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'},{s:'N',c:'5C'}
]},4);
assert.equal(reply.exp,'5D');
console.log('Weak-two 2NT Stenberg: 13+ STP, threshold, overlap and opener source-gap tests passed.');
