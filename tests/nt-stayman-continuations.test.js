'use strict';

// Regression tests for the explicit Stayman continuations in Nordisk standard,
// 2012-08-22, page 4.
const assert = require('node:assert/strict');
const R = require('../rattningsmotor.js');

const deck=[];
for(const suit of ['S','H','D','C']) for(let rank=2;rank<=14;rank++) deck.push(suit+rank);

function deal(north,south){
  const used=new Set([...north,...south]);
  assert.equal(used.size,26,'North and South hands must not overlap');
  const rest=deck.filter(card=>!used.has(card));
  return {N:north.slice(),E:rest.slice(0,13),S:south.slice(),W:rest.slice(13,26)};
}
const south=['S5','S6','S7','S8','H5','H6','H7','H8','D5','D6','D7','C5','C6'];
const min44=['S14','S13','S2','S3','H14','H11','H2','H3','D13','D2','D3','C2','C3']; // 15 hp, 4-4-3-2
const max44=['S14','S13','S12','S2','H14','H11','H2','H3','D13','D2','D3','C2','C3']; // 17 hp, 4-4-3-2

function judge(north, sequence){
  const hands=deal(north,south);
  const bids=sequence.concat([{s:'N',c:'P'}]);
  return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}

const afterStayman2NT=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2C'},{s:'W',c:'P'},
  {s:'N',c:'2H'},{s:'E',c:'P'},
  {s:'S',c:'2N'},{s:'W',c:'P'}
];
assert.equal(judge(min44,afterStayman2NT).exp,'3S',
  '4-4 major minimum opener must bid 3S after Stayman 2NT');
assert.equal(judge(max44,afterStayman2NT).exp,'4S',
  '4-4 major maximum opener must bid 4S after Stayman 2NT');

const afterStayman3NT=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2C'},{s:'W',c:'P'},
  {s:'N',c:'2H'},{s:'E',c:'P'},
  {s:'S',c:'3N'},{s:'W',c:'P'}
];
assert.equal(judge(min44,afterStayman3NT).exp,'4S',
  '4-4 major opener may choose 4S after Stayman 3NT');

console.log('1NT Stayman continuation tests: passed.');
