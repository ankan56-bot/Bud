'use strict';

const assert = require('node:assert/strict');
const R = require('../rattningsmotor.js');

const cases = [
  {
    name:'12 HCP, 5-5 hearts-diamonds minimum',
    hand:['H14','H13','H9','H7','H6','D13','D12','D9','D7','D6','S4','C2','C3'],
    expected:'3H'
  },
  {
    name:'12 HCP, 6-4 hearts-diamonds minimum',
    hand:['H14','H13','H12','H9','H7','H6','D13','D9','D7','D6','S4','S5','C2'],
    expected:'3D'
  },
  {
    name:'15 HCP, three spades and maximum',
    hand:['H14','H11','H9','H7','H6','D14','D13','D8','D7','S12','S11','S9','C2'],
    expected:'3S'
  },
  {
    name:'16 HCP, maximum without three-card spade support',
    hand:['H14','H13','H9','H7','H6','D14','D13','D9','D7','S12','S9','C2','C3'],
    expected:'3C'
  },
  {
    name:'13 HCP, fourth suit game force from the established 13+ threshold',
    hand:['H14','H13','H9','H7','H6','D14','D9','D8','D7','S12','S9','C2','C3'],
    expected:'3C'
  },
  {
    name:'12 HCP, minimum without 5-5 or 6-4 shape',
    hand:['H14','H13','H9','H7','H6','D14','D9','D8','D7','S11','S9','C2','C3'],
    expected:'P'
  },
  {
    name:'11 HCP 6-4 opening hand is not fourth hand',
    hand:['H14','H13','H11','H9','H7','H6','D13','D9','D7','D6','S4','S5','C2'],
    expected:null
  },
  {
    name:'18 HCP lies outside the 1H-1S-2D rebid range',
    hand:['H14','H13','H12','H9','H7','D14','D13','D9','D7','S12','S9','C2','C3'],
    expected:null
  }
];

const auction = [
  {s:'N',c:'1H'},{s:'E',c:'P'},
  {s:'S',c:'1S'},{s:'W',c:'P'},
  {s:'N',c:'2D'},{s:'E',c:'P'},
  {s:'S',c:'2N'},{s:'W',c:'P'}
];

for (const c of cases) {
  const h=R.H(c.hand);
  assert.equal(h.hp,Number(c.name.match(/^\d+/)[0]),c.name+': HCP fixture');
  const st={hands:{N:c.hand},dealer:'N',bids:auction.concat([{s:'N',c:'P'}])};
  const raw=R.nodeForRaw(st,8);
  assert.equal(raw.exp,c.expected,c.name+': '+raw.why);

  const live=R.decideLive({seat:'N',dealer:'N',auction,ownHand:c.hand});
  assert.equal(live.exp,c.expected,c.name+': live opener decision');
  if(c.expected){
    assert.equal(live.informationBoundary,'own_hand_and_public_auction_only');
    assert.equal(live.ruleStatus,'source_interpretation');
    assert.equal(live.soft,true);
  }
}

// The 11 HCP opening exception is available only in fourth hand after three passes.
const fourthHand11=[
  'H14','H13','H11','H9','H7','H6',
  'D13','D9','D7','D6',
  'S4','S5','C2'
];
const fourthHandAuction=[
  {s:'N',c:'P'},{s:'E',c:'P'},{s:'S',c:'P'},
  {s:'W',c:'1H'},{s:'N',c:'P'},{s:'E',c:'1S'},
  {s:'S',c:'P'},{s:'W',c:'2D'},{s:'N',c:'P'},
  {s:'E',c:'2N'},{s:'S',c:'P'}
];
assert.equal(R.H(fourthHand11).hp,11);
assert.equal(R.H(fourthHand11).L.H,6);
const fourthHandRaw=R.nodeForRaw({
  hands:{W:fourthHand11},dealer:'N',
  bids:fourthHandAuction.concat([{s:'W',c:'P'}])
},11);
assert.equal(fourthHandRaw.exp,'3D','11 HCP 6-4 minimum is allowed in fourth hand');
const fourthHandLive=R.decideLive({seat:'W',dealer:'N',auction:fourthHandAuction,ownHand:fourthHand11});
assert.equal(fourthHandLive.exp,'3D','live fourth-hand opener must use the 11 HCP exception');
assert.equal(fourthHandLive.informationBoundary,'own_hand_and_public_auction_only');

const fourthHand11_55=[
  'H14','H13','H11','H9','H7',
  'D13','D9','D7','D6','D5',
  'S4','C2','C3'
];
assert.equal(R.H(fourthHand11_55).hp,11);
assert.equal(R.H(fourthHand11_55).L.H,5);
assert.equal(R.H(fourthHand11_55).L.D,5);
const fourthHand55Raw=R.nodeForRaw({
  hands:{W:fourthHand11_55},dealer:'N',
  bids:fourthHandAuction.concat([{s:'W',c:'P'}])
},11);
assert.equal(fourthHand55Raw.exp,'3H','11 HCP 5-5 minimum is allowed in fourth hand');
const fourthHand55Live=R.decideLive({seat:'W',dealer:'N',auction:fourthHandAuction,ownHand:fourthHand11_55});
assert.equal(fourthHand55Live.exp,'3H','live fourth-hand 5-5 minimum must use the 11 HCP exception');

console.log('Opener third bid after 1H-1S-2D-2NT: source-bound branches passed.');
