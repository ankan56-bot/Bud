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
console.log('Stayman 2H analysis tree: passed.');
