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
// The ordinary Stayman invit meanings are source-backed, but their
// numerical selection/acceptance thresholds are not. Keep them qualitative.
const invitTree=lib.trees.find(t=>t.id==='T46_STAYMAN_INVIT_MEANINGS');
assert.ok(invitTree);
assert.equal(A.treeCompatible(invitTree),true);
assert.equal(invitTree.sourceStatus,'source_qualitative');
assert.deepEqual(invitTree.nodes.map(n=>n.sequence.at(-1)),['3♥','3♠','2NT']);
assert.ok(invitTree.sourceStatusNote.includes('Inga numeriska'));
assert.ok(invitTree.nodes.every(n=>n.branches.length===0),
  'no unsupported opener acceptance branches may be invented');
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
const t40=findTree('T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD');
const t40Balanced=findNode('T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD','t40_balanced_rebid');
assert.match(t40Balanced.branches.find(b=>b.call==='3NT').label,/25\+/);
assert.match(t40Balanced.branches.find(b=>b.call==='2NT').label,/22–24/);
const t40Own=findNode('T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD','t40_own_suit_rebid');
assert.match(t40Own.branches.find(b=>b.call==='3NT').label,/25\+/);
assert.match(t40Own.branches.find(b=>b.call==='2NT').label,/22–24/);
assert.ok(t40);

for(const [treeId,rootId,acceptId] of [
 ['T27_OVERFORING_HJARTER_SEXKORT_INVIT','t27_overforing_hjarter_sexkort_invit_n3','t27_overforing_hjarter_sexkort_invit_n5'],
 ['T28_OVERFORING_SPADER_SEXKORT_INVIT','t28_overforing_spader_sexkort_invit_n3','t28_overforing_spader_sexkort_invit_n5']
]){
 has25Branch(treeId,rootId,'3NT');
 assert.match(findNode(treeId,acceptId).handProfile.opener,/25 gemensamma/);
}


// The 2NT–3♣–3♠ decision is part of the existing T23 tree so the
// more specific guidance is not hidden by an identical sequence match.
const t23=findTree('T23');
const t23Spades=findNode('T23','t23_3');
assert.deepEqual(t23Spades.sequence,['2NT','Pass','3♣','Pass','3♠']);
assert.deepEqual(t23Spades.branches.map(b=>b.call),['4♠','3NT']);
assert.match(t23Spades.branches[0].label,/8-korts spaderfit.*26\+/);
assert.match(t23Spades.branches[1].label,/25\+ gemensamma hp/);
assert.match(t23Spades.analysis,/26 gemensamma spelpoäng/);
assert.match(t23Spades.analysis,/25 gemensamma honnörspoäng/);
assert.equal(t23Spades.ruleStatus,'user_confirmed');

console.log('Stayman 2H analysis tree: passed.');
