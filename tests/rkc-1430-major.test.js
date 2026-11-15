'use strict';

// RKC 1430 regression tests after a major-suit opening and Stenberg 2NT.
// The opener answers partner's 4NT; the agreed trump is the opening major.
const assert = require('node:assert/strict');
const Rattning = require('../rattningsmotor.js');

const filler = ['S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','D2','D3'];
function answer(hand) {
  assert.equal(hand.length, 13);
  const st = {
    hands: { N: hand, E: filler, S: filler, W: filler },
    bids: [
      {s:'N',c:'1H'}, {s:'E',c:'P'},
      {s:'S',c:'2N'}, {s:'W',c:'P'},
      {s:'N',c:'3C'}, {s:'E',c:'P'},
      {s:'S',c:'4N'}, {s:'W',c:'P'},
      {s:'N',c:'P'}
    ]
  };
  return Rattning.nodeFor(st, 8);
}

// 1 keycard: club ace, no heart king.
assert.equal(answer(['C14','H2','H3','H4','H5','H6','H7','H8','S2','S3','S4','D2','D3']).exp, '5C');
// 4 keycards: four aces, no heart king (the same 1430 bucket as one).
assert.equal(answer(['S14','H14','D14','C14','H2','H3','H4','H5','H6','H7','S2','S3','S4']).exp, '5C');
// 0 keycards.
assert.equal(answer(['H2','H3','H4','H5','H6','H7','H8','H9','S2','S3','S4','D2','D3']).exp, '5D');
// 3 keycards.
assert.equal(answer(['S14','H14','D14','H2','H3','H4','H5','H6','H7','S2','S3','S4','D2']).exp, '5D');
// 2 keycards without the trump queen.
assert.equal(answer(['S14','D14','H2','H3','H4','H5','H6','H7','H8','S2','S3','S4','D2']).exp, '5H');
// 2 keycards with the trump queen.
assert.equal(answer(['S14','D14','H12','H2','H3','H4','H5','H6','H7','S2','S3','S4','D2']).exp, '5S');

console.log('RKC 1430 major-suit responses: 6/6 passed.');
