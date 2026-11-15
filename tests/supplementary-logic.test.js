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

// At exactly 10 hp, the redouble and balanced 1NT candidates overlap.
{
  const hands = {
    N: [], E: [],
    S: makeHand({ C: 3, D: 4, H: 2, S: 4 }, { C: [14], D: [13, 12], S: [11] }),
    W: []
  };
  const matches = A.findSupplementary(logic, bids, hands);
  assert.deepEqual(matches.map(x => x.recommendation), ['XX', '1N']);
  assert(matches.every(x => x.notes.some(n => /Överlapp/.test(n))));
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

// At 6 hp with 4 hearts, simple support and preemptive jump both match.
{
  const hands = {
    N: [], E: [],
    S: makeHand({ C: 3, D: 3, H: 4, S: 3 }, { S: [14], D: [12] }),
    W: []
  };
  const matches = A.findSupplementary(logic, bids, hands);
  assert.deepEqual(matches.map(x => x.recommendation), ['2H', '3H']);
  assert(matches.every(x => x.notes.some(n => /Överlapp/.test(n))));
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

// A pass before the opening does not prevent suffix matching.
{
  const extendedBids = [
    { s: 'N', c: 'P' },
    { s: 'E', c: '1H' },
    { s: 'S', c: 'X' }
  ];
  const hands = {
    N: [], E: [], S: [],
    W: makeHand({ C: 4, D: 3, H: 2, S: 4 }, { C: [14, 13], D: [12, 11], S: [13] })
  };
  const matches = A.findSupplementary(logic, extendedBids, hands);
  assert.deepEqual(matches.map(x => x.recommendation), ['XX']);
}

// The matcher must only inspect the next legal bidder and that hand.
{
  const hand = makeHand({ C: 3, D: 4, H: 2, S: 4 }, { C: [14], D: [13], S: [11] });
  const hands = { N: [], E: [], S: hand, W: [] };
  assert.equal(A.findSupplementary(logic, bids, hands, 'W').length, 0);
  assert.equal(A.findSupplementary(logic, [{ s: 'N', c: '1S' }, { s: 'E', c: 'X' }], hands).length, 0);
}

// Competitive response to 1H-(1S): 3-card support and 6-9 hp.
{
  const prefix = [{ s: 'N', c: '1H' }, { s: 'E', c: '1S' }];
  const hand = makeHand({ C: 3, D: 3, H: 3, S: 4 }, { C: [14], D: [13], S: [11] });
  const matches = A.findSupplementary(logic, prefix, { N: [], E: [], S: hand, W: [] });
  assert(matches.some(x => x.recommendation === '2H'));
}

// Competitive 1NT requires a stopper in the opponent's suit.
{
  const prefix = [{ s: 'N', c: '1H' }, { s: 'E', c: '1S' }];
  const hand = makeHand({ C: 3, D: 3, H: 2, S: 5 }, { C: [14], D: [11], S: [13] });
  const matches = A.findSupplementary(logic, prefix, { N: [], E: [], S: hand, W: [] });
  assert.deepEqual(matches.map(x => x.recommendation), ['1N']);
}
{
  const prefix = [{ s: 'N', c: '1H' }, { s: 'E', c: '1S' }];
  const hand = makeHand({ C: 3, D: 3, H: 2, S: 5 }, { C: [14], D: [13] });
  const matches = A.findSupplementary(logic, prefix, { N: [], E: [], S: hand, W: [] });
  assert.equal(matches.length, 0, 'Balanced hand without a spade stopper must not match 1NT');
}

// Competitive 2NT after 1S-(2H): balanced 10-12 hp and heart stopper.
{
  const prefix = [{ s: 'N', c: '1S' }, { s: 'E', c: '2H' }];
  const hand = makeHand({ C: 3, D: 4, H: 4, S: 2 }, { H: [14, 13], D: [12], C: [11] });
  const matches = A.findSupplementary(logic, prefix, { N: [], E: [], S: hand, W: [] });
  assert.deepEqual(matches.map(x => x.recommendation), ['2N']);
}

// Competitive 1NT after 1D-(1S): balanced hand with spade stopper.
{
  const prefix = [{ s: 'N', c: '1D' }, { s: 'E', c: '1S' }];
  const hand = makeHand({ C: 3, D: 3, H: 3, S: 4 }, { S: [13], C: [14], H: [12] });
  const matches = A.findSupplementary(logic, prefix, { N: [], E: [], S: hand, W: [] });
  assert.deepEqual(matches.map(x => x.recommendation), ['1N']);
}

// Competitive responses to 1C-(1H): natural spades and 1NT stopper profiles.
{
  const prefix = [{ s: 'N', c: '1C' }, { s: 'E', c: '1H' }];
  const hand = makeHand({ C: 3, D: 3, H: 3, S: 4 }, { S: [13], D: [14], C: [12] });
  const matches = A.findSupplementary(logic, prefix, { N: [], E: [], S: hand, W: [] });
  assert.deepEqual(matches.map(x => x.recommendation), ['1S']);
}
{
  const prefix = [{ s: 'N', c: '1C' }, { s: 'E', c: '1H' }];
  const hand = makeHand({ C: 3, D: 4, H: 3, S: 3 }, { H: [13, 12], D: [14] });
  const matches = A.findSupplementary(logic, prefix, { N: [], E: [], S: hand, W: [] });
  assert.deepEqual(matches.map(x => x.recommendation), ['1N']);
}

console.log('Supplementary bidding matcher passed (15 cases).');
