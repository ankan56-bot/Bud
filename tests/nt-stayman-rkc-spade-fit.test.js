'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');

// 17 HCP, balanced 4-4 in the majors. No aces, but K♠, K♦ and K♣.
const opener=['S13','S12','S11','S2','H12','H11','H2','H3','D13','D12','D2','C13','C2'];
assert.equal(R.H(opener).hp,17);
assert.equal(R.H(opener).bal,true);
assert.equal(R.H(opener).L.S,4);
assert.equal(R.H(opener).L.H,4);

function replyAfter(sequence){
  const bids=sequence.concat([{s:'W',c:'P'},{s:'N',c:'P'}]);
  return R.nodeFor({hands:{N:opener},dealer:'N',bids},bids.length-1);
}
const afterStayman2NT=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2C'},{s:'W',c:'P'},
 {s:'N',c:'2H'},{s:'E',c:'P'},
 {s:'S',c:'2N'},{s:'W',c:'P'},
 {s:'N',c:'4S'},{s:'E',c:'P'},
 {s:'S',c:'4N'}
];
const twoNTReply=replyAfter(afterStayman2NT);
assert.equal(twoNTReply.exp,'5C',
  'after Stayman 2H-2NT-4S, 4NT is RKC with spades; K♠ is one keycard');

const afterStayman3NT=afterStayman2NT.map((b,i)=>i===6?{s:'S',c:'3N'}:i===8?{s:'N',c:'4S'}:b);
const threeNTReply=replyAfter(afterStayman3NT);
assert.equal(threeNTReply.exp,'5C',
  'after Stayman 2H-3NT-4S, 4NT is RKC with spades; K♠ is one keycard');

// A 3M superaccept completes the transfer in practice, but the PDF does not
// explicitly state the 4NT continuation after that alternate response.
// Keep it uncovered rather than silently extending the RKC agreement.
const afterHeartSuperaccept=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2D'},{s:'W',c:'P'},
 {s:'N',c:'3H'},{s:'E',c:'P'},
 {s:'S',c:'4N'},{s:'W',c:'P'}
];
const superacceptReply=R.nodeFor({hands:{N:opener},dealer:'N',bids:afterHeartSuperaccept.concat([{s:'N',c:'P'}])},afterHeartSuperaccept.length);
assert.equal(superacceptReply.exp,null,
  '4NT after a transfer superaccept remains uncovered until its continuation is source-verified');
assert.match(superacceptReply.why,/ingen fastställd trumf|inte en uttryckligen avtalad/i);
const lib=require('../analysbibliotek.json');
const t43=lib.trees.find(t=>t.id==='T43_1NT_4NT_ENDPOINTS');
assert.ok(t43);
for(const id of ['t43_n10','t43_n11','t43_n12']){
  const node=t43.nodes.find(n=>n.id===id);
  assert.ok(node,'analysis tree documents '+id);
  assert.equal(node.sequence[node.sequence.length-1],'4NT');
  assert.match(node.meaning,/RKC med spader/i);
}

console.log('Stayman four-spade fit RKC tests: passed.');
