'use strict';

// Source-aligned 1NT opening boundary tests.
// Nordisk standard 2012-08-22, pages 2 and 4:
// 15-17 HCP, balanced 4333 / 4432 / 5332, including a five-card major.
const assert = require('node:assert/strict');
const R = require('../rattningsmotor.js');

const cases = [
  {
    name: '4333, 15 HCP',
    hand: ['S14','S13','S7','S2','H14','H8','H3','D13','D8','D3','C11','C8','C3'],
    expected: '1N'
  },
  {
    name: '4432, 15 HCP',
    hand: ['S14','S13','S7','S2','H13','H11','H8','H3','D13','D8','D3','C11','C3'],
    expected: '1N'
  },
  {
    name: '5332 with five spades, 17 HCP',
    hand: ['S14','S13','S12','S11','S2','H14','H8','H3','D13','D8','D3','C8','C3'],
    expected: '1N'
  },
  {
    name: '5332 with five hearts, 15 HCP',
    hand: ['H14','H13','H12','H7','H2','S14','S8','S3','D12','D8','D3','C8','C3'],
    expected: '1N'
  },
  {
    name: 'balanced 14 HCP opens one suit, not 1NT',
    hand: ['S14','S13','S7','S2','H14','H8','H3','D12','D8','D3','C11','C8','C3'],
    expected: '1S'
  },
  {
    name: 'balanced 18 HCP opens one suit, not 1NT',
    hand: ['S14','S13','S12','S7','H14','H8','H3','D13','D8','D3','C12','C8','C3'],
    expected: '1S'
  }
];

for (const c of cases) {
  assert.equal(c.hand.length, 13, c.name + ': hand must contain 13 cards');
  assert.equal(new Set(c.hand).size, 13, c.name + ': hand must contain unique cards');
  const analysis = R.H(c.hand);
  const bids = [{s:'N',c:'P'}];
  const result = R.nodeFor({hands:{N:c.hand},dealer:'N',bids},0);
  assert.equal(result.exp,c.expected,c.name + ': ' + result.why);
  if (c.expected === '1N') {
    assert.equal(analysis.bal,true,c.name + ': must be balanced');
    assert.ok(analysis.hp >= 15 && analysis.hp <= 17,c.name + ': must be 15-17 HCP');
  }
}

// The live opening decision must produce the same 1NT recommendation
// using only the opening player's own hand.
for (const c of cases.filter(x => x.expected === '1N')) {
  const live = R.decideLive({seat:'N',dealer:'N',auction:[],ownHand:c.hand});
  assert.equal(live.exp,'1N',c.name + ': live opening must agree with facit');
  assert.equal(live.informationBoundary,'own_hand_and_public_auction_only');
}

console.log('1NT opening boundaries: passed (' + cases.length + ' hand profiles).');
