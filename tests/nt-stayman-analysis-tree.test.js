'use strict';

const assert=require('node:assert/strict');
const A=require('../analysmotor.js');
const lib=require('../analysbibliotek.json');
const tree=lib.trees.find(t=>t.id==='T45_STAYMAN_2H_CONTINUATIONS');
assert.ok(tree,'Stayman 2H continuation tree must exist');
assert.equal(A.treeCompatible(tree),true,'Stayman continuation tree must be compatible');
assert.equal(tree.nodes.length,6);
const bySequence=new Map(tree.nodes.map(n=>[n.sequence.join('|'),n]));
const twoNt=bySequence.get('1NT|Pass|2♣|Pass|2♥|Pass|2NT');
assert.ok(twoNt);
assert.deepEqual(twoNt.branches.map(b=>b.call),['3♠','4♠']);
const threeNt=bySequence.get('1NT|Pass|2♣|Pass|2♥|Pass|3NT');
assert.ok(threeNt);
assert.deepEqual(threeNt.branches.map(b=>b.call),['4♠','Pass']);
assert.ok(tree.conditions.some(c=>c.includes('15–16 hp')||c.includes('15–17 hp')));
// The analysis library must mirror the user-confirmed 25-HCP no-trump
// game threshold, while keeping 26-point suit-game thresholds separate.
assert.match(lib.conventions.oneNTGameThreshold,/25 combined HCP/);
function findTree(id){const t=lib.trees.find(x=>x.id===id);assert.ok(t,'missing '+id);return t;}
function findNode(id,nodeId){const n=findTree(id).nodes.find(x=>x.id===nodeId);assert.ok(n,'missing '+id+'/'+nodeId);return n;}
function has25Branch(treeId,nodeId,call){
  const branch=findNode(treeId,nodeId).branches.find(x=>x.call===call);
  assert.ok(branch,'missing '+treeId+'/'+nodeId+'/'+call);
  assert.match(branch.label,/25\+/,'branch must use the agreed 25-HCP rule');
}
has25Branch('T06_STAYMAN_INGEN_HOGFARG','t06_n1','3NT');
has25Branch('T06_STAYMAN_INGEN_HOGFARG','t06_n2','3NT');
has25Branch('T26_STAYMAN_INGEN_HOGFARG_INVIT','t26_n1','3NT');
has25Branch('T26_STAYMAN_INGEN_HOGFARG_INVIT','t26_n3','3NT');
assert.match(findNode('T17_1NT_2NT_INVIT_ACCEPT','t17_n0').handProfile.opener,/25 gemensamma/);
for(const [treeId,rootId,acceptId] of [
 ['T19','t19_0','t19_2'],['T20','t20_0','t20_2']
]){
 has25Branch(treeId,rootId,'3NT');
 assert.match(findNode(treeId,acceptId).handProfile.opener,/25\+/);
}
for(const [treeId,rootId,acceptId] of [
 ['T27_OVERFORING_HJARTER_SEXKORT_INVIT','t27_overforing_hjarter_sexkort_invit_n3','t27_overforing_hjarter_sexkort_invit_n5'],
 ['T28_OVERFORING_SPADER_SEXKORT_INVIT','t28_overforing_spader_sexkort_invit_n3','t28_overforing_spader_sexkort_invit_n5']
]){
 has25Branch(treeId,rootId,'3NT');
 assert.match(findNode(treeId,acceptId).handProfile.opener,/25 gemensamma/);
}

console.log('Stayman 2H analysis tree: passed.');
