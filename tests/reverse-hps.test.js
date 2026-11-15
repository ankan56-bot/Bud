'use strict';

const assert = require('node:assert/strict');
const Rattning = require('../rattningsmotor.js');

function makeDeal(shape, honors) {
  const deck = [];
  for (const suit of ['C', 'D', 'H', 'S']) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }

  const north = [];
  for (const suit of ['C', 'D', 'H', 'S']) {
    const cards = (honors[suit] || []).map(rank => suit + rank);
    for (let rank = 2; rank <= 14 && cards.length < shape[suit]; rank++) {
      if (!cards.includes(suit + rank)) cards.push(suit + rank);
    }
    north.push(...cards.slice(0, shape[suit]));
  }

  assert.equal(north.length, 13, 'North must have 13 cards');
  assert.equal(new Set(north).size, 13, 'North hand must contain unique cards');

  const rest = deck.filter(card => !north.includes(card));
  return {
    N: north,
    E: rest.slice(0, 13),
    S: rest.slice(13, 26),
    W: rest.slice(26, 39)
  };
}

function assessReverse(shape, honors) {
  const hands = makeDeal(shape, honors);
  const bids = [
    { s: 'N', c: '1D' },
    { s: 'E', c: 'P' },
    { s: 'S', c: '1H' },
    { s: 'W', c: 'P' },
    { s: 'N', c: '2S' }
  ];
  return Rattning.judge({ hands, dealer: 'N', bids }).items.at(-1);
}

// 18 HPS, 5-4 shape: reverse is allowed without an agreed trump suit.
{
  const item = assessReverse(
    { C: 1, D: 5, H: 3, S: 4 },
    { D: [14, 13], S: [14, 12], H: [13], C: [12] }
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 18, '5-4 without 6+ suit or 5-5 has no STP');
  assert.match(item.motivering, /18 HPS/);
}

// 17 HP, 5-4 shape: singleton/doubleton elsewhere must not create STP.
// The 2S reverse is therefore too strong; the engine recommends 2D.
{
  const item = assessReverse(
    { C: 1, D: 5, H: 3, S: 4 },
    { D: [14, 13], S: [13, 12, 11], H: [12, 11], C: [11] }
  );
  assert.equal(item.bedomning, 'fel');
  assert.equal(item.htp, 17, '5-4 shortness must not be counted as STP');
  assert.equal(item.battre, '2♦');
}

// 17 HP, 6-4 shape: own 6+ suit permits STP; reverse reaches 18+ HPS.
{
  const item = assessReverse(
    { C: 1, D: 6, H: 2, S: 4 },
    { D: [14, 13], S: [14, 12], H: [13], C: [11] }
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 20, '6+ suit allows STP');
  assert.match(item.motivering, /20 HPS/);
}

// 17 HP, 5-5 shape: own two-suiter permits STP in the short side suits.
{
  const item = assessReverse(
    { C: 1, D: 5, H: 2, S: 5 },
    { D: [14, 13], S: [14, 12], H: [13], C: [11] }
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 20, '5-5 shape allows STP');
  assert.match(item.motivering, /20 HPS/);
}

console.log('Reverse/HPS regression tests passed (4 cases).');
