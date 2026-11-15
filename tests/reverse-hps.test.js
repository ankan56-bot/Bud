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

function makeDealFor(seat, shape, honors, supportSuit = 'H') {
  const deck = [];
  for (const suit of ['C', 'D', 'H', 'S']) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  const target = [];
  for (const suit of ['C', 'D', 'H', 'S']) {
    const cards = (honors[suit] || []).map(rank => suit + rank);
    for (let rank = 2; rank <= 14 && cards.length < shape[suit]; rank++) {
      if (!cards.includes(suit + rank)) cards.push(suit + rank);
    }
    target.push(...cards.slice(0, shape[suit]));
  }
  assert.equal(target.length, 13, 'Target hand must have 13 cards');
  assert.equal(new Set(target).size, 13, 'Target hand must contain unique cards');
  let rest = deck.filter(card => !target.includes(card));
  const hands = { N: [], E: [], S: [], W: [] };
  hands[seat] = target;
  const partner = { N: 'S', E: 'W', S: 'N', W: 'E' }[seat];
  const partnerSupport = rest.filter(card => card[0] === supportSuit).slice(0, 4);
  const partnerHand = partnerSupport.concat(rest.filter(card => !partnerSupport.includes(card)).slice(0, 9));
  hands[partner] = partnerHand;
  rest = rest.filter(card => !partnerHand.includes(card));
  const others = ['N', 'E', 'S', 'W'].filter(s => s !== seat && s !== partner);
  others.forEach((s, i) => { hands[s] = rest.slice(i * 13, (i + 1) * 13); });
  return hands;
}

function assessRaise(suit, shape, honors, call) {
  const hands = makeDealFor('S', shape, honors, suit);
  const bids = [
    { s: 'N', c: '1' + suit },
    { s: 'E', c: 'P' },
    { s: 'S', c: call },
    { s: 'W', c: 'P' }
  ];
  return Rattning.judge({ hands, dealer: 'N', bids }).items.at(-1);
}

function assessMajorRaise(shape, honors, call) {
  const hands = makeDealFor('S', shape, honors);
  const bids = [
    { s: 'N', c: '1H' },
    { s: 'E', c: 'P' },
    { s: 'S', c: call },
    { s: 'W', c: 'P' }
  ];
  return Rattning.judge({ hands, dealer: 'N', bids }).items.at(-1);
}

function assessOpenerRebid(shape, honors, call) {
  const hands = makeDealFor('S', shape, honors, 'H');
  const bids = [
    { s: 'S', c: '1H' },
    { s: 'W', c: 'P' },
    { s: 'N', c: '2H' },
    { s: 'E', c: 'P' },
    { s: 'S', c: call }
  ];
  return Rattning.judge({ hands, dealer: 'S', bids }).items.at(-1);
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


// With an actual 8-card fit, support points are counted even though the
// opener's own shape is only 5-4-2-2.
{
  const deck = [];
  for (const suit of ['C', 'D', 'H', 'S']) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  const north = ['S14', 'S13', 'S7', 'S6', 'S5', 'H14', 'H12', 'H8', 'H7', 'D13', 'D4', 'C11', 'C3'];
  const south = ['S2', 'S3', 'S4'];
  const rest = deck.filter(card => !north.includes(card) && !south.includes(card));
  south.push(...rest.slice(0, 10));
  const remaining = deck.filter(card => !north.includes(card) && !south.includes(card));
  const hands = {
    N: north,
    E: remaining.slice(0, 13),
    S: south,
    W: remaining.slice(13, 26)
  };
  const bids = [
    { s: 'N', c: '1S' },
    { s: 'E', c: 'P' },
    { s: 'S', c: '2S' },
    { s: 'W', c: 'P' },
    { s: 'N', c: 'P' }
  ];
  const item = Rattning.judge({ hands, dealer: 'N', bids }).items.at(-1);
  assert.equal(item.htp, 19, '8-card support fit allows support points');
}

 
// 9 HTP with 4-card heart support is a simple 2H raise.
{
  const item = assessMajorRaise(
    { C: 2, D: 3, H: 4, S: 4 },
    { H: [14], S: [13], D: [11] },
    '2H'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 9);
}

// The exact 10-HTP boundary belongs to the 3H raise, not 2H.
{
  const item = assessMajorRaise(
    { C: 1, D: 4, H: 4, S: 4 },
    { H: [14], S: [13], D: [11] },
    '3H'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 10);
}

// 13+ HTP with 4-card major support uses Stenberg 2NT even with a singleton;
// it must take precedence over a splinter.
{
  const item = assessMajorRaise(
    { C: 1, D: 4, H: 4, S: 4 },
    { H: [14, 13, 12], S: [14] },
    '2N'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 15);
  assert.match(item.motivering, /Stenberg/);
}

 
// Minor-suit raise: 9 HTP belongs at the 2-level.
{
  const item = assessRaise(
    'C',
    { C: 4, D: 4, H: 3, S: 2 },
    { C: [14], D: [13], H: [11] },
    '2C'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 9);
}

// Minor-suit raise: 10 HTP belongs at the 3-level.
{
  const item = assessRaise(
    'C',
    { C: 4, D: 4, H: 3, S: 2 },
    { C: [14], D: [13], H: [12] },
    '3C'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 10);
}

 
// After 1H-2H, 16 HTP is still a pass, not a singleton-showing rebid.
{
  const item = assessOpenerRebid(
    { C: 4, D: 4, H: 4, S: 1 },
    { H: [14, 13, 12], D: [14], C: [11] },
    'P'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 16);
}

// At 17 HTP with a singleton, opener shows the singleton at the lowest level.
{
  const item = assessOpenerRebid(
    { C: 4, D: 4, H: 4, S: 1 },
    { H: [14, 13, 12], D: [14], C: [12] },
    '2S'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 17);
}

// At 17 HTP without a singleton, opener invites with 3H.
{
  const item = assessOpenerRebid(
    { C: 3, D: 3, H: 4, S: 3 },
    { H: [14, 13, 12], D: [14, 13], C: [11] },
    '3H'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 17);
}

// 20 HTP is the game threshold after the major raise.
{
  const item = assessOpenerRebid(
    { C: 4, D: 4, H: 4, S: 1 },
    { H: [14, 13, 12], D: [14, 13], C: [12] },
    '4H'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 20);
}

console.log('Bridge bidding regression tests passed (14 cases).');
