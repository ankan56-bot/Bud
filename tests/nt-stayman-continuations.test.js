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

// Nordisk standard s. 4 says responder normally has its own four-card
// major (or slam interest); it does not state an 8 hp minimum for that route.
{
  const south=['H2','H3','H4','H5','S2','S3','S4','D2','D3','D4','C2','C3','C4'];
  const north=deck.filter(card=>!south.includes(card)).slice(0,13);
  const used=new Set([...north,...south]);
  const rest=deck.filter(card=>!used.has(card));
  const hands={N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
  const bids=[{s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'P'}];
  assert.equal(R.nodeFor({hands,dealer:'N',bids},2).exp,'2C',
    'a four-card major is sufficient for Stayman; do not invent an 8 hp floor');
}

// Natural new suits after each Stayman answer are game-forcing:
// 5+ major or 4+ minor. The recommendation must not depend on the
// opener's hidden cards.
function responderAfterStayman(south,openerReply){
  const north=deck.filter(card=>!south.includes(card)).slice(0,13);
  const used=new Set([...north,...south]);
  assert.equal(used.size,26);
  const rest=deck.filter(card=>!used.has(card));
  const hands={N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
  const bids=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2C'},{s:'W',c:'P'},
    {s:'N',c:openerReply},{s:'E',c:'P'},
    {s:'S',c:'P'}
  ];
  return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}
assert.equal(responderAfterStayman(
  ['S14','S13','S12','S11','S10','H2','H3','H4','D2','D3','D4','C2','C3'],'2H').exp,'2S',
  '5+ spades after Stayman 2H is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['C14','C13','C12','C11','S2','S3','S4','H2','H3','H4','D2','D3','D4'],'2H').exp,'3C',
  '4+ clubs after Stayman 2H is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['H14','H13','H12','H11','H10','S2','S3','S4','D2','D3','D4','C2','C3'],'2D').exp,'2H',
  '5+ hearts after Stayman 2D is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['H14','H13','H12','H11','H10','S2','S3','S4','D2','D3','D4','C2','C3'],'2S').exp,'3H',
  '5+ hearts after Stayman 2S is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['S14','S13','S12','S11','H2','H3','H4','D2','D3','D4','C2','C3','C4'],'2H').exp,null,
  'exactly four spades is known, but invite versus game needs a strength boundary');
const gameFourSpades=['S14','S13','S12','S11','H11','H2','H3','D2','D3','D4','C2','C3','C4'];
assert.equal(R.H(gameFourSpades).hp,11);
const gameFourSpadesAuction=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2C'},{s:'W',c:'P'},
  {s:'N',c:'2H'},{s:'E',c:'P'}
];
assert.equal(R.decideLive({seat:'S',dealer:'N',auction:gameFourSpadesAuction,ownHand:gameFourSpades}).exp,null,
  'the numeric threshold for the special four-spade Stayman invitation is not stated, even with 11 hp');
console.log('1NT Stayman continuation tests: passed.');
