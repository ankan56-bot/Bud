'use strict';

// Architectural contract: the 1NT family stops when 4NT is reached.
// The reusable slam module owns the meaning and all responses after 4NT.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const SangFactory=require('../sangbudgivning.js');
const SlamFactory=require('../slamlogik.js');
const A=require('../analysmotor.js');
const lib=JSON.parse(fs.readFileSync('analysbibliotek.json','utf8'));

const sang=SangFactory({});
const slam=SlamFactory({});
assert.equal(typeof sang.ntResp,'function');
assert.equal(typeof sang.transfer2,'function');
assert.equal(Object.prototype.hasOwnProperty.call(sang,'rkcReply'),false,
  'the 1NT bidding module must not own answers after 4NT');
assert.equal(typeof slam.rkcReply,'function',
  'the separate slam module owns responses to 4NT');
assert.equal(typeof slam.rkcTrumpFromAuction,'function',
  'the separate slam module determines trump from the public auction');
assert.equal(typeof slam.agreedNoTrumpAceAsk,'function',
  'the separate slam module distinguishes the agreed four-ace ask');
assert.equal(typeof slam.agreedQuantitativeNoTrumpInvite,'function',
  'the separate slam module distinguishes quantitative 4NT');

const tree=lib.trees.find(t=>t.id==='T43_1NT_4NT_ENDPOINTS');
assert.ok(tree,'the 1NT-to-4NT endpoint tree must exist');
assert.equal(A.treeCompatible(tree),true);
assert.deepEqual(tree.moduleBoundary,{
  biddingFamilyModule:'sangbudgivning.js',
  boundary:'4NT',
  fourNTModule:'slamlogik.js',
  rule:'1NT-trädet slutar när 4NT har bjudits. Svar på 4NT och frågeställarens fortsättning hanteras endast av slamlogik.js.'
});
assert.ok(tree.nodes.length>0);
for(const node of tree.nodes){
  assert.equal(node.sequence.at(-1),'4NT',
    node.id+' must end exactly when 4NT is reached');
  assert.deepEqual(node.branches,[],
    node.id+' must not contain any response or continuation after 4NT');
}
for(const id of ['T03_OVERFORING_PASS','T07_OVERFORING_HJARTER','T08_OVERFORING_SPADER']){
  const transfer=lib.trees.find(t=>t.id===id);
  assert.ok(transfer);
  const fourNT=(transfer.nodes||[]).flatMap(n=>n.branches||[]).filter(b=>b.call==='4NT');
  assert.ok(fourNT.length>0,id+' must expose 4NT as a terminal option');
  assert.ok(fourNT.every(b=>b.next===null),
    id+' must hand off after 4NT instead of branching into its responses');
}
console.log('1NT / 4NT module boundary tests: passed.');
