'use strict';

const assert = require('node:assert/strict');
const R = require('../rattningsmotor.js');

// Fixed opener: 1H then 2D, with a 5-4-2-2 hand and 13 HCP.
const opener = [
  'H14','H13','H9','H7','H6',
  'D14','D9','D8','D7',
  'S12','S9','C9','C7'
];

function dealForResponder(responder) {
  const deck = [];
  for (const suit of ['S','H','D','C']) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  const used = new Set(opener.concat(responder));
  assert.equal(used.size, 26, 'opener and responder hands must not overlap');
  const rest = deck.filter(card => !used.has(card));
  assert.equal(rest.length, 26, 'the remaining 26 cards must be available');
  return {N: opener, E: rest.slice(0,13), S: responder, W: rest.slice(13,26)};
}

const cases = [
  {
    name: '11 HCP balanced: invit',
    hand: ['S14','S13','S7','S2','H11','H8','H3','D12','D10','D3','C11','C8','C3'],
    expected: '2N'
  },
  {
    name: '12 HCP balanced: invit',
    hand: ['S14','S13','S7','S2','H12','H8','H3','D13','D10','D3','C10','C8','C3'],
    expected: '2N'
  },
  {
    name: '10 HCP balanced: below the confirmed invit range',
    hand: ['S14','S13','S7','S2','H11','H8','H3','D12','D10','D3','C10','C8','C3'],
    expected: null
  },
  {
    name: '13 HCP balanced: continue with fourth-suit forcing, not 2NT invit',
    hand: ['S14','S13','S7','S2','H12','H8','H3','D13','D10','D3','C11','C8','C3'],
    expected: '3C'
  }
];

for (const c of cases) {
  assert.equal(R.H(c.hand).hp, Number(c.name.match(/^\d+/)[0]), c.name + ': HCP fixture');
  assert.equal(R.H(c.hand).bal, true, c.name + ': balanced fixture');
  const hands = dealForResponder(c.hand);
  const bids = [
    {s:'N',c:'1H'}, {s:'E',c:'P'},
    {s:'S',c:'1S'}, {s:'W',c:'P'},
    {s:'N',c:'2D'}, {s:'E',c:'P'},
    {s:'S',c:'2N'}
  ];
  const node = R.nodeFor({hands, dealer:'N', bids}, 6);
  assert.equal(node.exp, c.expected, c.name + ': ' + node.why);
  if (c.expected === '2N') {
    assert.equal(node.conv, 'invit i sang');
    assert.match(node.why, /11–12 hp/);
  }
  if (c.expected === null) assert.equal(node.sourceGap, true);

  // The same exact branch is available to the live robot without partner cards.
  const liveAuction = [
    {s:'N',c:'1H'}, {s:'E',c:'P'},
    {s:'S',c:'1S'}, {s:'W',c:'P'},
    {s:'N',c:'2D'}, {s:'E',c:'P'}
  ];
  const live = R.decideLive({seat:'S',dealer:'N',auction:liveAuction,ownHand:c.hand});
  assert.equal(live.exp, c.expected, c.name + ': live decision must match the after-deal rule');
  if (c.expected === '2N') {
    assert.equal(live.informationBoundary,'own_hand_and_public_auction_only');
    assert.equal(live.context,'live');
  }
}

// A superficially similar 1♥–1♠–2♣ sequence must not inherit the 2NT rule.
const otherAuction = [
  {s:'N',c:'1H'}, {s:'E',c:'P'},
  {s:'S',c:'1S'}, {s:'W',c:'P'},
  {s:'N',c:'2C'}, {s:'E',c:'P'}
];
const other = R.decideLive({seat:'S',dealer:'N',auction:otherAuction,ownHand:cases[1].hand});
assert.equal(other.exp,null,'the 2♦ rule must not leak into 2♣');

console.log('1H-1S-2D-2NT invitation boundaries: passed (after-deal and live, 10/11/12/13 HCP).');
