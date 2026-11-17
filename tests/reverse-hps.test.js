'use strict';

const assert = require('node:assert/strict');
const Rattning = require('../rattningsmotor.js');

function makeScoringHand(shape, offset = 0) {
  const cards = [];
  for (const suit of ['C', 'D', 'H', 'S']) {
    for (let i = 0; i < shape[suit]; i++) cards.push(suit + (2 + offset + i));
  }
  assert.equal(cards.length, 13, 'Scoring hand must contain 13 cards');
  return cards;
}

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

function makeDealFromPair(seat, hand, partnerHand) {
  const deck = [];
  for (const suit of ['C', 'D', 'H', 'S']) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  assert.equal(hand.length, 13);
  assert.equal(partnerHand.length, 13);
  assert.equal(new Set([...hand, ...partnerHand]).size, 26);
  const rest = deck.filter(card => !hand.includes(card) && !partnerHand.includes(card));
  const partner = { N: 'S', E: 'W', S: 'N', W: 'E' }[seat];
  const others = ['N', 'E', 'S', 'W'].filter(s => s !== seat && s !== partner);
  return {
    [seat]: hand.slice(),
    [partner]: partnerHand.slice(),
    [others[0]]: rest.slice(0, 13),
    [others[1]]: rest.slice(13, 26)
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
  const lowRank = card => Number(card.slice(1)) <= 10;
  const partnerSupport = rest.filter(card => card[0] === supportSuit && lowRank(card)).slice(0, 4);
  const partnerHand = partnerSupport.concat(
    rest.filter(card => !partnerSupport.includes(card) && lowRank(card)).slice(0, 9)
  );
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

function assessOpeningOvercall(opponentOpen, shape, honors, call) {
  const hands = makeDealFor('S', shape, honors, 'H');
  const bids = [
    { s: 'E', c: opponentOpen },
    { s: 'S', c: call }
  ];
  return Rattning.nodeFor({ hands, dealer: 'E', bids }, 1);
}

function assessTakeoutDoubleResponse(opponentOpen, shape, honors, call) {
  const hands = makeDealFor('S', shape, honors, 'H');
  const bids = [
    { s: 'E', c: opponentOpen },
    { s: 'S', c: 'P' },
    { s: 'W', c: 'P' },
    { s: 'N', c: 'X' },
    { s: 'E', c: 'P' },
    { s: 'S', c: call }
  ];
  return Rattning.judge({ hands, dealer: 'E', bids }).items.at(-1);
}

function assessOvercallResponse(opponentOpen, partnerOvercall, shape, honors, call) {
  const supportSuit = partnerOvercall[1];
  const hands = makeDealFor('S', shape, honors, supportSuit);
  const bids = [
    { s: 'E', c: opponentOpen },
    { s: 'S', c: 'P' },
    { s: 'W', c: 'P' },
    { s: 'N', c: partnerOvercall },
    { s: 'E', c: 'P' },
    { s: 'S', c: call }
  ];
  return Rattning.judge({ hands, dealer: 'E', bids }).items.at(-1);
}

function assessDoublerRebid(opening, shape, honors, partnerResponse, call) {
  const hands = makeDealFor('N', shape, honors);
  const bids = [
    { s: 'W', c: opening },
    { s: 'N', c: 'X' },
    { s: 'E', c: 'P' },
    { s: 'S', c: partnerResponse },
    { s: 'W', c: 'P' },
    { s: 'N', c: call }
  ];
  return Rattning.nodeFor({ hands, dealer: 'W', bids }, 5);
}

function assessWeakTwoResponse(opening, shape, honors, call) {
  const hands = makeDealFor('S', shape, honors, opening[1]);
  const bids = [
    { s: 'N', c: opening },
    { s: 'E', c: 'P' },
    { s: 'S', c: call }
  ];
  return Rattning.nodeFor({ hands, dealer: 'N', bids }, 2);
}

function assessWeakTwoOpenerRebid(opening, shape, honors, response, call) {
  const hands = makeDealFor('N', shape, honors, opening[1]);
  const bids = [
    { s: 'N', c: opening },
    { s: 'E', c: 'P' },
    { s: 'S', c: response },
    { s: 'W', c: 'P' },
    { s: 'N', c: call }
  ];
  return Rattning.nodeFor({ hands, dealer: 'N', bids }, 4);
}

function assessStenbergOpener(shape, honors, call) {
  const hands = makeDealFor('N', shape, honors, 'H');
  const bids = [
    { s: 'N', c: '1H' },
    { s: 'E', c: 'P' },
    { s: 'S', c: '2N' },
    { s: 'W', c: 'P' },
    { s: 'N', c: call }
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

// 18 HTP, 5-4 shape: a jump in the second suit is allowed.
{
  const item = assessReverse(
    { C: 1, D: 5, H: 3, S: 4 },
    { D: [14, 13], S: [14, 12], H: [13], C: [12] }
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 18, '5-4 without 6+ suit or 5-5 has no STP');
  assert.match(item.motivering, /18 HTP/);
}

// 17 HP, 5-4 shape: singleton/doubleton elsewhere must not create STP.
// The 2S jump is too strong; the engine recommends the cheapest second suit, 1S.
{
  const item = assessReverse(
    { C: 1, D: 5, H: 3, S: 4 },
    { D: [14, 13], S: [13, 12, 11], H: [12, 11], C: [11] }
  );
  assert.equal(item.bedomning, 'fel');
  assert.equal(item.htp, 17, '5-4 shortness must not be counted as STP');
  assert.equal(item.battre, '1♠');
}

// 17 HP, 6-4 shape: own 6+ suit permits STP; reverse reaches 18+ HTP.
{
  const item = assessReverse(
    { C: 1, D: 6, H: 2, S: 4 },
    { D: [14, 13], S: [14, 12], H: [13], C: [11] }
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 20, '6+ suit allows STP');
  assert.match(item.motivering, /20 HTP/);
}

// A 4-5 distribution is not a 5-4 reverse, even with 18 HTP.
{
  const item = assessReverse(
    { C: 1, D: 4, H: 3, S: 5 },
    { D: [14, 13], S: [14, 13], H: [13], C: [11] }
  );
  assert.equal(item.bedomning, 'fel');
  assert.equal(item.htp, 18, '5-4 is required; 4-5 without support counts HP only');
  assert.equal(item.battre, '1♠', 'Show the second suit at the lowest level instead of a false reverse');
}

// 17 HP, 5-5 shape: own two-suiter permits STP in the short side suits.
{
  const item = assessReverse(
    { C: 1, D: 5, H: 2, S: 5 },
    { D: [14, 13], S: [14, 12], H: [13], C: [11] }
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 20, '5-5 shape allows STP');
  assert.match(item.motivering, /20 HTP/);
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

 
// Partnership scoring: 8 trumps gives no fit bonus.
{
  const north = Rattning.H(makeScoringHand({ C: 3, D: 3, H: 4, S: 3 }, 0));
  const south = Rattning.H(makeScoringHand({ C: 3, D: 3, H: 4, S: 3 }, 6));
  assert.equal(Rattning.partnershipPoints(north, south, 'H'), north.hp + south.hp);
}

// Nine combined trumps add exactly one point.
{
  const north = Rattning.H(makeScoringHand({ C: 3, D: 3, H: 5, S: 2 }, 0));
  const south = Rattning.H(makeScoringHand({ C: 3, D: 3, H: 4, S: 3 }, 6));
  assert.equal(Rattning.partnershipPoints(north, south, 'H'), north.hp + south.hp + 2);
}

// Ten or more combined trumps add exactly two fit points, plus any hand shortness points.
{
  const north = Rattning.H(makeScoringHand({ C: 3, D: 3, H: 5, S: 2 }, 0));
  const south = Rattning.H(makeScoringHand({ C: 3, D: 3, H: 5, S: 2 }, 6));
  assert.equal(Rattning.partnershipPoints(north, south, 'H'), north.hp + south.hp + 4);
}

// NT contracts count HCP only, regardless of distribution or trump fit.
{
  const north = Rattning.H(makeScoringHand({ C: 3, D: 3, H: 5, S: 2 }, 0));
  const south = Rattning.H(makeScoringHand({ C: 3, D: 3, H: 5, S: 2 }, 6));
  assert.equal(Rattning.partnershipPoints(north, south, 'N'), north.hp + south.hp);
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

// Splinter is disabled: a short side suit does not create a jump in that suit.
// With four-card spade support, the opener makes the ordinary natural raise.
{
  const hands = makeDealFor(
    'N',
    { C: 1, D: 4, H: 4, S: 4 },
    { C: [11], D: [12], H: [14, 13], S: [14] },
    'S'
  );
  const bids = [
    { s: 'N', c: '1H' },
    { s: 'E', c: 'P' },
    { s: 'S', c: '1S' },
    { s: 'W', c: 'P' },
    { s: 'N', c: '2S' }
  ];
  const item = Rattning.judge({ hands, dealer: 'N', bids }).items.at(-1);
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.battre, '');
  assert.doesNotMatch(item.forklaring, /Splinter/i);
}

// 13+ HTP with 4-card major support uses Stenberg 2NT even with a singleton.
// Splinter is deliberately excluded from the current bidding system.
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

 
// Stenberg: 15+ HTP without a singleton is shown with 3M.
{
  const item = assessStenbergOpener(
    { C: 3, D: 3, H: 4, S: 3 },
    { H: [14, 13], D: [14, 13], C: [11] },
    '3H'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 15);
}

// Stenberg: 12-14 hp and balanced is shown with 3NT.
{
  const item = assessStenbergOpener(
    { C: 3, D: 3, H: 4, S: 3 },
    { H: [14, 13], D: [14, 13] },
    '3N'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.hp, 14);
}

// Stenberg: a singleton is shown even when the hand has 15+ HTP.
{
  const item = assessStenbergOpener(
    { C: 4, D: 4, H: 4, S: 1 },
    { H: [14, 13, 12], D: [14], C: [12] },
    '3S'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 17);
}

// Unbalanced minimum without a singleton is not silently converted to 3NT.
{
  const item = assessStenbergOpener(
    { C: 2, D: 4, H: 5, S: 2 },
    { H: [14, 13], D: [14], C: [11] },
    'P'
  );
  assert.equal(item.bedomning, 'ej_täckt');
}

 
// A competitive auction where opener gets another turn after responder passes
// is legal; it must be reported as an uncovered competitive continuation,
// not as an invalid turn-order pattern.
{
  const hands = makeDeal(
    { C: 3, D: 3, H: 3, S: 4 },
    { D: [14], H: [13], S: [12] }
  );
  const bids = [
    { s: 'N', c: '1D' },
    { s: 'E', c: '1H' },
    { s: 'S', c: 'P' },
    { s: 'W', c: '2H' },
    { s: 'N', c: 'P' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'N', bids }, 4);
  assert.equal(node.exp, null);
  assert.match(node.why, /Partnern har passat/);
}

 
// Responses to partner's overcall follow the published support-length ladder.
{
  const item = assessOvercallResponse(
    '1D', '1H',
    { C: 3, D: 3, H: 3, S: 4 },
    { H: [14], S: [13], D: [11] },
    '2H'
  );
  assert.equal(item.bedomning, 'rätt');
}
{
  const item = assessOvercallResponse(
    '1D', '1H',
    { C: 3, D: 3, H: 4, S: 3 },
    { H: [14, 13], S: [11] },
    '3H'
  );
  assert.equal(item.bedomning, 'rätt');
}
{
  const item = assessOvercallResponse(
    '1D', '1H',
    { C: 2, D: 3, H: 5, S: 3 },
    { H: [14, 13], S: [11] },
    '4H'
  );
  assert.equal(item.bedomning, 'rätt');
}

// NT responses: 8-10, 11-13 and 14+ hp, with a stopper.
{
  const item = assessOvercallResponse(
    '1D', '1H',
    { C: 4, D: 3, H: 2, S: 4 },
    { D: [14], S: [13], C: [12] },
    '1N'
  );
  assert.equal(item.bedomning, 'rätt');
}
{
  const item = assessOvercallResponse(
    '1D', '1H',
    { C: 4, D: 3, H: 2, S: 4 },
    { D: [14, 13], S: [12], C: [11], H: [11] },
    '2N'
  );
  assert.equal(item.bedomning, 'rätt');
}
{
  const item = assessOvercallResponse(
    '1D', '1H',
    { C: 4, D: 3, H: 2, S: 4 },
    { D: [14, 13], S: [14, 13] },
    '3N'
  );
  assert.equal(item.bedomning, 'rätt');
}

// New suit: 8+ hp at the 1-level, 10+ hp when the cheapest bid is at 2-level.
{
  const item = assessOvercallResponse(
    '1C', '1H',
    { C: 3, D: 3, H: 2, S: 5 },
    { S: [14], D: [13], C: [11] },
    '1S'
  );
  assert.equal(item.bedomning, 'rätt');
}
{
  const item = assessOvercallResponse(
    '1C', '1H',
    { C: 3, D: 5, H: 2, S: 3 },
    { D: [14, 13], S: [12], C: [11] },
    '2D'
  );
  assert.equal(item.bedomning, 'rätt');
}

// Jump in a new suit: 14+ hp and a good 6+ suit is game forcing.
{
  const item = assessOvercallResponse(
    '1C', '1H',
    { C: 2, D: 3, H: 2, S: 6 },
    { S: [14, 13, 12], D: [14], H: [11] },
    '2S'
  );
  assert.equal(item.bedomning, 'rätt');
}

// Cue-bid: 10+ hp and 3+ support.
{
  const item = assessOvercallResponse(
    '1D', '1H',
    { C: 3, D: 3, H: 3, S: 4 },
    { H: [14, 13], S: [12], C: [11] },
    '2D'
  );
  assert.equal(item.bedomning, 'rätt');
}

// A hand that meets none of the response conditions passes.
{
  const item = assessOvercallResponse(
    '1D', '1H',
    { C: 4, D: 3, H: 2, S: 4 },
    { S: [13], D: [12], C: [11], H: [11] },
    'P'
  );
  assert.equal(item.bedomning, 'rätt');
}

// After a 2-level overcall, a new suit at the 3-level requires 10+ hp.
{
  const item = assessOvercallResponse(
    '1S', '2H',
    { C: 5, D: 3, H: 2, S: 3 },
    { C: [14, 13], D: [12], S: [11] },
    '3C'
  );
  assert.equal(item.bedomning, 'rätt');
}

 
// Responses to partner's takeout double: 0-7 hp bids the cheapest unbid suit.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 2, D: 1, H: 3, S: 7 },
    { S: [13], H: [12] },
    '1H'
  );
  assert.equal(item.bedomning, 'rätt');
}

// 1NT: 6-9 hp with a stopper.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 3, D: 3, H: 3, S: 4 },
    { D: [14], S: [13], H: [11] },
    '1N'
  );
  assert.equal(item.bedomning, 'rätt');
}

// 2NT: 10-12 hp with a stopper.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 3, D: 3, H: 3, S: 4 },
    { D: [14, 13], S: [12], H: [11], C: [11] },
    '2N'
  );
  assert.equal(item.bedomning, 'rätt');
}

// 3NT: 13+ hp with a stopper.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 3, D: 3, H: 3, S: 4 },
    { D: [14, 13], S: [14, 13] },
    '3N'
  );
  assert.equal(item.bedomning, 'rätt');
}

// 8-9 HTP and a 4+ suit: jump in the suit.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 3, D: 3, H: 3, S: 4 },
    { S: [14], H: [13], C: [11] },
    '2S'
  );
  assert.equal(item.bedomning, 'rätt');
}

// 10-12 HTP and a 5+ suit: jump to the 3-level.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 3, D: 2, H: 3, S: 5 },
    { S: [14, 13], H: [12], C: [11] },
    '3S'
  );
  assert.equal(item.bedomning, 'rätt');
}

// 10+ hp without a suitable NT or suit jump: cue-bid is forcing.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 3, D: 4, H: 3, S: 3 },
    { C: [14, 11], H: [13], S: [12] },
    '2D'
  );
  assert.equal(item.bedomning, 'rätt');
}

// Pass only with a long, good holding in the opponent's opening suit.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 3, D: 5, H: 3, S: 2 },
    { D: [14, 13], C: [12], H: [11] },
    'P'
  );
  assert.equal(item.bedomning, 'rätt');
}

 
// Simple overcall at the 1-level: 10+ hp and a good 5+ suit.
{
  const node = assessOpeningOvercall(
    '1D',
    { C: 3, D: 3, H: 2, S: 5 },
    { S: [14, 13], C: [12], D: [11] },
    '1S'
  );
  assert.equal(node.exp, '1S');
}

// Jump overcall: 6-10 hp and a good 6-card major.
{
  const node = assessOpeningOvercall(
    '1D',
    { C: 3, D: 2, H: 6, S: 2 },
    { H: [13, 12], C: [11] },
    '2H'
  );
  assert.equal(node.exp, '2H');
}

// A 1-level minor overcall does not use the 10+ major-suit exception.
{
  const node = assessOpeningOvercall(
    '1D',
    { C: 5, D: 3, H: 3, S: 2 },
    { C: [14, 13, 11], D: [12], H: [11] },
    'P'
  );
  assert.equal(node.exp, 'P');
}

// A good 5-card major may be overcalled at the 1-level with 10 hp.
{
  const node = assessOpeningOvercall(
    '1D',
    { C: 3, D: 3, H: 5, S: 2 },
    { H: [14, 13], D: [12], C: [11] },
    '1H'
  );
  assert.equal(node.exp, '1H');
}

// Simple overcall at the 2-level requires 12+ hp and 6+ cards.
{
  const node = assessOpeningOvercall(
    '1S',
    { C: 2, D: 6, H: 3, S: 2 },
    { D: [14, 13, 12], H: [11], C: [12, 11] },
    '2D'
  );
  assert.equal(node.exp, '2D');
}
{
  const node = assessOpeningOvercall(
    '1S',
    { C: 2, D: 5, H: 3, S: 3 },
    { D: [14, 13], H: [12], C: [11], S: [11] },
    'P'
  );
  assert.equal(node.exp, 'P');
}

// 1-level overcall with only 9 hp is below the 10 hp threshold.
{
  const node = assessOpeningOvercall(
    '1D',
    { C: 3, D: 3, H: 2, S: 5 },
    { S: [14, 13], C: [12] },
    'P'
  );
  assert.equal(node.exp, 'P');
}

// Takeout double: 12+ hp and at least 3 cards in every unbid suit.
{
  const node = assessOpeningOvercall(
    '1D',
    { C: 3, D: 3, H: 3, S: 4 },
    { C: [14, 13], H: [13], S: [12] },
    'X'
  );
  assert.equal(node.exp, 'X');
}

// 17+ hp is a double regardless of distribution, even with a 5-card suit.
{
  const node = assessOpeningOvercall(
    '1D',
    { C: 2, D: 3, H: 2, S: 6 },
    { S: [14, 13], C: [14, 11], D: [13], H: [12] },
    'X'
  );
  assert.equal(node.exp, 'X');
}

// 1NT overcall: 15-17 hp, balanced and with a stopper.
{
  const node = assessOpeningOvercall(
    '1D',
    { C: 3, D: 3, H: 3, S: 4 },
    { D: [14, 13], S: [14, 13], H: [11] },
    '1N'
  );
  assert.equal(node.exp, '1N');
}

// Against a 2-level preempt, balanced 16-18 hp is 2NT.
{
  const node = assessOpeningOvercall(
    '2H',
    { C: 4, D: 3, H: 4, S: 2 },
    { H: [14, 13], C: [14, 13], D: [12] },
    '2N'
  );
  assert.equal(node.exp, '2N');
}

// Against a 2-level preempt, 15 hp without a takeout shape is not 2NT.
{
  const node = assessOpeningOvercall(
    '2H',
    { C: 4, D: 3, H: 4, S: 2 },
    { H: [14, 13], C: [14, 13], D: [11] },
    'P'
  );
  assert.equal(node.exp, 'P');
}

// A negative double after a natural suit opening is not a REF base-system rule.
{
  const hands = makeDealFor(
    'S',
    { C: 3, D: 2, H: 4, S: 4 },
    { H: [14, 13], S: [12], D: [11] }
  );
  const bids = [
    { s: 'N', c: '1H' },
    { s: 'E', c: '1S' },
    { s: 'S', c: 'X' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'N', bids }, 2);
  assert.equal(node.exp, null);
  assert.match(node.why, /Negativ dubbling.*inte definierad/i);
}

// A double after 1NT still needs an exact invit-strength boundary; shape alone is insufficient.
{
  const hands = makeDealFor(
    'S',
    { C: 3, D: 2, H: 4, S: 4 },
    { C: [14], H: [14], S: [13], D: [11] }
  );
  const bids = [
    { s: 'N', c: '1N' },
    { s: 'E', c: '2D' },
    { s: 'S', c: 'X' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'N', bids }, 2);
  assert.equal(node.exp, null);
  assert.match(node.why, /exakta styrkegränsen.*inte numeriskt/i);
}

// A new suit after interference over 1NT must have at least five cards.
{
  const hands = makeDealFor(
    'S',
    { C: 3, D: 3, H: 4, S: 3 },
    { C: [14], H: [13], S: [12], D: [11] }
  );
  const bids = [
    { s: 'N', c: '1N' },
    { s: 'E', c: '2D' },
    { s: 'S', c: '2H' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'N', bids }, 2);
  assert.equal(node.exp, null);
  assert.match(node.why, /minst 5 kort/i);
}

// A void is not a singleton: 17 HTP after 1H-2H is the no-singleton 3H invite.
{
  const item = assessOpenerRebid(
    { C: 0, D: 4, H: 5, S: 4 },
    { H: [14, 13], D: [14], S: [13] },
    '3H'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.htp, 17);
  assert.match(item.motivering, /utan singel/i);
}

// Two side singletons after 1H-2H have no documented priority.
{
  const hands = makeDealFor('S', { C: 1, D: 1, H: 6, S: 5 }, { H: [14, 13], S: [14, 12] }, 'H');
  const bids = [
    { s: 'S', c: '1H' }, { s: 'W', c: 'P' },
    { s: 'N', c: '2H' }, { s: 'E', c: 'P' }, { s: 'S', c: '3C' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'S', bids }, 4);
  assert.equal(node.exp, null);
  assert.match(node.why, /singel i flera sidofärger/i);
}

// Two side singletons after Stenberg also have no documented priority.
{
  const north = ['C2', 'D2', 'H14', 'H2', 'H3', 'H13', 'H4', 'H5', 'S14', 'S12', 'S2', 'S3', 'S4'];
  const south = ['C14', 'C4', 'C5', 'D13', 'D4', 'D5', 'H6', 'H7', 'H8', 'H9', 'S5', 'S6', 'S7'];
  const hands = makeDealFromPair('N', north, south);
  const bids = [
    { s: 'N', c: '1H' }, { s: 'E', c: 'P' },
    { s: 'S', c: '2N' }, { s: 'W', c: 'P' }, { s: 'N', c: '3C' }
  ];
  const state = { hands, dealer: 'N', bids };
  const raw = Rattning.nodeForRaw(state, 4);
  assert.equal(raw.exp, null);
  assert.match(raw.why, /Flera sidofärger är singel/i);
  const node = Rattning.nodeFor(state, 4);
  assert.equal(node.exp, '4H', 'The separate game-point safety check still finds the mandatory major game after Stenberg.');
}

// A new suit over a weak two is forcing, but the opener's exact rebid is unspecified.
{
  const hands = makeDealFor(
    'S',
    { C: 3, D: 6, H: 2, S: 2 },
    { D: [14, 13], C: [11], H: [10] }
  );
  const bids = [
    { s: 'S', c: '2D' },
    { s: 'W', c: 'P' },
    { s: 'N', c: '2H' },
    { s: 'E', c: 'P' },
    { s: 'S', c: 'P' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'S', bids }, 4);
  assert.equal(node.exp, null);
  assert.match(node.why, /forcing till minst 3.*Öppnarens återbud/i);
}

// 0-7 hp after takeout double: choose the cheapest unbid suit, not the longest.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 3, D: 2, H: 3, S: 5 },
    { S: [14, 13] },
    '1H'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.match(item.motivering, /billigaste objudna färg/);
}

// 1NT after takeout double needs a stopper, but REF does not require a balanced hand.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 5, D: 1, H: 4, S: 3 },
    { D: [14], H: [13], S: [11] },
    '1N'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.hp, 8);
}

// 2NT after takeout double: 10-12 hp and stopper, even when unbalanced.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 5, D: 1, H: 4, S: 3 },
    { D: [14], H: [14], S: [13] },
    '2N'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.hp, 11);
}

// 3NT after takeout double: 13+ hp and stopper, even when unbalanced.
{
  const item = assessTakeoutDoubleResponse(
    '1D',
    { C: 5, D: 1, H: 4, S: 3 },
    { D: [14], H: [14, 13], S: [14] },
    '3N'
  );
  assert.equal(item.bedomning, 'rätt');
  assert.equal(item.hp, 15);
}

// A new suit after a weak two is forcing with 5+ cards; no 15 hp threshold is stated.
{
  const node = assessWeakTwoResponse(
    '2D',
    { C: 3, D: 2, H: 3, S: 5 },
    { S: [11], H: [11], C: [11] },
    '2S'
  );
  assert.equal(node.exp, '2S');
  assert.match(node.why, /5\+ kort.*forcing|5\+ kort.*krav/i);
}

// Two own 5-card suits after a weak two have no documented priority.
{
  const node = assessWeakTwoResponse(
    '2D',
    { C: 1, D: 2, H: 5, S: 5 },
    { H: [14, 13], S: [11] },
    '2H'
  );
  assert.equal(node.exp, null);
  assert.match(node.why, /flera egna 5\+ färger.*ingen prioritet/i);
}

// 2NT after a weak two is invitational with 9-10 hp and at least 2-card support.
{
  const node = assessWeakTwoResponse(
    '2H',
    { C: 4, D: 3, H: 2, S: 4 },
    { H: [14], S: [14], C: [11] },
    '2N'
  );
  assert.equal(node.exp, '2N');
}

// 9-10 hp without the required 2-card support is not automatically 2NT.
{
  const node = assessWeakTwoResponse(
    '2H',
    { C: 4, D: 4, H: 1, S: 4 },
    { C: [14], D: [14], S: [11] },
    '2N'
  );
  assert.equal(node.exp, null);
}

// A weak hand with 3+ support makes the preemptive 3-level raise, not an invit.
{
  const node = assessWeakTwoResponse(
    '2H',
    { C: 3, D: 3, H: 4, S: 3 },
    { H: [12], D: [11], S: [11], C: [11] },
    '3H'
  );
  assert.equal(node.exp, '3H');
  assert.match(node.why, /spärrande.*ej invit/i);
}

// A weak hand without 3+ support or a 5+ side suit passes.
{
  const node = assessWeakTwoResponse(
    '2H',
    { C: 4, D: 3, H: 2, S: 4 },
    { C: [11], D: [11], S: [11] },
    'P'
  );
  assert.equal(node.exp, 'P');
}

// After 2D-2NT, a 9-10 hp opener rebids 3NT, not the illegal 4D.
{
  const node = assessWeakTwoOpenerRebid(
    '2D',
    { C: 2, D: 6, H: 3, S: 2 },
    { D: [14, 13], C: [12] },
    '2N',
    '3N'
  );
  assert.equal(node.exp, '3N');
}

// After 2H-2NT, a 9-10 hp opener rebids 4H.
{
  const node = assessWeakTwoOpenerRebid(
    '2H',
    { C: 3, D: 2, H: 6, S: 2 },
    { H: [14, 13], C: [12] },
    '2N',
    '4H'
  );
  assert.equal(node.exp, '4H');
}

// Doubler with no support and under 18 hp passes after partner's 2NT response.
{
  const node = assessDoublerRebid(
    '1D',
    { C: 3, D: 2, H: 4, S: 4 },
    { C: [14, 13], H: [14, 13] },
    '2N',
    'P'
  );
  assert.equal(node.exp, 'P');
  assert.match(node.why, /18\+ hp/i);
}

// Doubler without support may rebid own suit/NT with 18+ hp.
{
  const node = assessDoublerRebid(
    '1D',
    { C: 3, D: 2, H: 5, S: 3 },
    { H: [14, 13, 12], C: [14, 13], S: [13] },
    '2N',
    '3H'
  );
  assert.equal(node.exp, '3H');
  assert.match(node.why, /19 hp.*utan stöd/i);
}

// A natural own-suit rebid below 18 hp without support should be pass.
{
  const node = assessDoublerRebid(
    '1D',
    { C: 3, D: 3, H: 5, S: 2 },
    { H: [14, 13], C: [14], D: [13] },
    '1S',
    '2H'
  );
  assert.equal(node.exp, 'P');
  assert.match(node.why, /kräver 18\+ hp/i);
}

// When the doubler has 3+ support for partner's response, the rebid is not specified.
{
  const node = assessDoublerRebid(
    '1D',
    { C: 3, D: 3, H: 3, S: 4 },
    { C: [14, 13], D: [14, 13], S: [14] },
    '1S',
    'P'
  );
  assert.equal(node.exp, null);
  assert.match(node.why, /3\+ stöd.*inte dubblerarens fortsättning/i);
}

// After 1NT-2C-2S, the source does not specify the numeric invit boundary below game.
{
  const north = ['S14', 'S13', 'S2', 'S3', 'H14', 'H2', 'H3', 'D13', 'D2', 'D3', 'C12', 'C2', 'C3'];
  const south = ['S12', 'S11', 'S4', 'S5', 'H4', 'H5', 'H6', 'D4', 'D5', 'D6', 'C4', 'C5', 'C6'];
  const hands = makeDealFromPair('S', south, north);
  const bids = [
    { s: 'N', c: '1N' }, { s: 'E', c: 'P' },
    { s: 'S', c: '2C' }, { s: 'W', c: 'P' },
    { s: 'N', c: '2S' }, { s: 'E', c: 'P' }, { s: 'S', c: 'P' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'N', bids }, 6);
  assert.equal(node.exp, null);
  assert.match(node.why, /numerisk(?:a)? acceptgräns.*anges inte|lämnas ej täckt/i);
}

// After 1C-2C, a balanced 18-HCP opener chooses 3NT before a minor game.
{
  const opener = ['C14', 'C13', 'C2', 'C3', 'D14', 'D13', 'D2', 'H12', 'H2', 'H3', 'S12', 'S2', 'S3'];
  const responder = ['C4', 'C5', 'C6', 'C7', 'D4', 'D5', 'D6', 'H4', 'H5', 'H6', 'S5', 'S6', 'S7'];
  const hands = makeDealFromPair('S', opener, responder);
  const bids = [
    { s: 'S', c: '1C' }, { s: 'W', c: 'P' },
    { s: 'N', c: '2C' }, { s: 'E', c: 'P' }, { s: 'S', c: '3N' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'S', bids }, 4);
  assert.equal(node.exp, '3N');
  assert.match(node.why, /18 hp och jämn fördelning/i);
}

// After a two-suit rebid and a 2NT invite, opener accepts with 3NT
// when all four suits are stopped.
{
  const opener = ['S13', 'S2', 'H13', 'H2', 'D4', 'D14', 'D12', 'D11', 'D9', 'C6', 'C5', 'C11', 'C2'];
  const responder = ['S9', 'S14', 'S6', 'S4', 'H8', 'H6', 'H4', 'D10', 'D6', 'D13', 'C14', 'C10', 'C7'];
  const hands = makeDealFromPair('S', opener, responder);
  const bids = [
    { s: 'S', c: '1D' }, { s: 'W', c: 'P' },
    { s: 'N', c: '1S' }, { s: 'E', c: 'P' },
    { s: 'S', c: '2C' }, { s: 'W', c: 'P' },
    { s: 'N', c: '2N' }, { s: 'E', c: 'P' }, { s: 'S', c: '3N' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'S', bids }, 8);
  assert.equal(node.exp, '3N');
}

// After 2NT-3C-3S, a balanced responder with 26+ combined HCP and no
// eight-card spade fit chooses 3NT.
{
  const responder = ['S13', 'S11', 'S2', 'H3', 'H11', 'H2', 'H5', 'D4', 'D10', 'C10', 'C11', 'C4', 'C3'];
  const opener = ['S10', 'S12', 'S14', 'S4', 'H13', 'H7', 'H14', 'D8', 'D6', 'C5', 'C6', 'C14', 'C13'];
  const hands = makeDealFromPair('S', responder, opener);
  const bids = [
    { s: 'N', c: '2N' }, { s: 'E', c: 'P' },
    { s: 'S', c: '3C' }, { s: 'W', c: 'P' },
    { s: 'N', c: '3S' }, { s: 'E', c: 'P' }, { s: 'S', c: '3N' }
  ];
  const node = Rattning.nodeFor({ hands, dealer: 'N', bids }, 6);
  assert.equal(node.exp, '3N');
}

console.log('Bridge bidding regression tests passed (82 cases).');
