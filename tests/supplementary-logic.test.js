'use strict';

const assert = require('node:assert/strict');
const A = require('../analysmotor.js');
const logic = require('../kompletterande_budlogik.json');

function makeHand(shape, honors = {}) {
  const cards = [];
  for (const suit of ['C', 'D', 'H', 'S']) {
    const chosen = (honors[suit] || []).map(rank => suit + rank);
    for (let rank = 2; rank <= 14 && chosen.length < shape[suit]; rank++) {
      if (!chosen.includes(suit + rank)) chosen.push(suit + rank);
    }
    cards.push(...chosen.slice(0, shape[suit]));
  }
  assert.equal(cards.length, 13);
  assert.equal(new Set(cards).size, 13);
  return cards;
}

const bids = [{ s: 'N', c: '1H' }, { s: 'E', c: 'X' }];

// 10+ hp without 3-card heart support: candidate redouble.
{
  const hands = {
    N: [], E: [],
    S: makeHand({ C: 4, D: 3, H: 2, S: 4 }, { C: [14, 13], D: [12, 11], S: [13] }),
    W: []
  };
  const matches = A.findSupplementary(logic, bids, hands);
  assert.deepEqual(matches.map(x => x.recommendation), ['XX']);
  assert.equal(matches[0].approvalStatus, 'unreviewed');
  assert.equal(matches[0].relationshipToSystem, 'must_not_override');
}

// 6-9 hp and 3+ hearts: natural competitive raise.
{
  const hands = {
    N: [], E: [],
    S: makeHand({ C: 3, D: 3, H: 3, S: 4 }, { C: [14], D: [13], S: [11] }),
    W: []
  };
  const matches = A.findSupplementary(logic, bids, hands);
  assert.deepEqual(matches.map(x => x.recommendation), ['2H']);
}

// 0-6 hp and 4+ hearts: preemptive jump support.
{
  const hands = {
    N: [], E: [],
    S: makeHand({ C: 3, D: 3, H: 4, S: 3 }, { S: [14], D: [11] }),
    W: []
  };
  const matches = A.findSupplementary(logic, bids, hands);
  assert.deepEqual(matches.map(x => x.recommendation), ['3H']);
}

// 5+ spades and 6+ hp: natural spade response.
{
  const hands = {
    N: [], E: [],
    S: makeHand({ C: 3, D: 3, H: 2, S: 5 }, { S: [14, 13], D: [12] }),
    W: []
  };
  const matches = A.findSupplementary(logic, bids, hands);
  assert(matches.some(x => x.recommendation === '1S'));
  // A balanced 5-3-3-2 hand also matches the broad 1NT candidate.
  // Keep both candidates visible until the partnership's priority is clarified.
  assert(matches.some(x => x.recommendation === '1N'));
  assert(matches.find(x => x.recommendation === '1N').notes.some(x => /Överlapp/.test(x)));
}

// Balanced 6-10 hp without 3-card heart support: 1NT candidate.
{
  const hands = {
    N: [], E: [],
    S: makeHand({ C: 3, D: 4, H: 2, S: 4 }, { C: [14], D: [13], S: [11] }),
    W: []
  };
  const matches = A.findSupplementary(logic, bids, hands);
  assert.deepEqual(matches.map(x => x.recommendation), ['1N']);
}

// The matcher must only inspect the next legal bidder and that hand.
{
  const hand = makeHand({ C: 3, D: 4, H: 2, S: 4 }, { C: [14], D: [13], S: [11] });
  const hands = { N: [], E: [], S: hand, W: [] };
  assert.equal(A.findSupplementary(logic, bids, hands, 'W').length, 0);
  assert.equal(A.findSupplementary(logic, [{ s: 'N', c: '1S' }, { s: 'E', c: 'X' }], hands).length, 0);
}

console.log('Supplementary bidding matcher passed (6 cases).');
