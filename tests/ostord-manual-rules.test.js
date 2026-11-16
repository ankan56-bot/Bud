'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const Rattning = require('../rattningsmotor.js');

function deal(N, E, S, W) { return { N, E, S, W }; }
function state(hands, dealer, bids) { return { hands, dealer, bids }; }
function rotateHiddenHands(hands) { return { N: hands.E, E: hands.W, S: hands.S, W: hands.N }; }

const deal023 = deal(
  ['D8','D4','S13','C12','H9','D2','H4','S5','D10','D9','D11','C2','C5'],
  ['C7','H5','H2','D5','C10','H8','S6','H3','H11','H12','S14','C6','C4'],
  ['S2','H13','H7','D3','S10','C13','C14','H14','D13','S3','D7','C3','D14'],
  ['S11','S9','H10','S12','S4','C11','D12','S8','C8','D6','C9','S7','H6']
);
const auction023 = state(deal023, 'W', [
  {s:'W',c:'P'}, {s:'N',c:'2D'}, {s:'E',c:'P'}, {s:'S',c:'P'}
]);
{
  const node = Rattning.nodeFor(auction023, 3);
  assert.equal(node.exp, '5D');
  assert.match(node.why, /10-korts fit.*gemensamma spelpoäng/i);
  const judged = Rattning.judge(auction023);
  const item = judged.items.find(x => x.nr === 4);
  assert.equal(item.nod.rekommendationskod, '5D');
  assert.equal(item.nod.fit.antal, 10);
  assert.equal(item.nod.fit.gemensammaSpelpoang, 31);
}

const deal055 = deal(
  ['H9','S14','C13','D6','H4','H14','D8','S12','D14','S10','D2','D3','D13'],
  ['H5','C4','H6','C9','C12','C2','H7','S4','S13','S5','C6','D7','C10'],
  ['D5','H8','D11','S9','D4','D12','C14','D9','S3','D10','C3','H11','S7'],
  ['S2','C7','C8','H13','C11','H12','H2','H10','S6','H3','S11','S8','C5']
);
const auction055 = state(deal055, 'E', [
  {s:'E',c:'P'}, {s:'S',c:'2D'}, {s:'W',c:'P'}, {s:'N',c:'P'}
]);
{
  const node = Rattning.nodeFor(auction055, 3);
  assert.equal(node.exp, '6D');
  assert.match(node.why, /12-korts fit.*34 gemensamma spelpoäng/i);
  const judged = Rattning.judge(auction055);
  const item = judged.items.find(x => x.nr === 4);
  assert.equal(item.nod.rekommendationskod, '6D');
  assert.equal(item.nod.fit.antal, 12);
  assert.equal(item.nod.fit.gemensammaSpelpoang, 34);
}

const deal068 = deal(
  ['D3','C11','S3','D9','S14','H9','D7','H11','H6','D6','S2','D14','C9'],
  ['C10','S10','S4','D2','S6','H12','C5','H13','C8','S13','H3','D11','D10'],
  ['C13','D5','S9','H14','H2','C14','H4','H10','D12','S7','C3','C7','C6'],
  ['S5','C4','H7','S11','D13','H8','C12','C2','S8','D8','D4','H5','S12']
);
const auction068 = state(deal068, 'E', [
  {s:'E',c:'P'}, {s:'S',c:'1C'}, {s:'W',c:'P'}, {s:'N',c:'1D'},
  {s:'E',c:'P'}, {s:'S',c:'2C'}, {s:'W',c:'P'}, {s:'N',c:'2N'},
  {s:'E',c:'P'}, {s:'S',c:'P'}
]);
{
  const node = Rattning.nodeFor(auction068, 9);
  assert.equal(node.exp, '3H');
  assert.match(node.why, /håll i hjärter.*utgångskrav/i);
  const judged = Rattning.judge(auction068);
  const item = judged.items.find(x => x.nr === 10);
  assert.equal(item.nod.rekommendationskod, '3H');
  assert.equal(item.nod.konvention, 'hållvisning');
}


function completeDealWithSouth(south) {
  const deck = ['S','H','D','C'].flatMap(suit =>
    Array.from({length:13}, (_,i) => suit + (i + 2))
  );
  assert.equal(south.length, 13);
  const unique = new Set(south);
  assert.equal(unique.size, 13, 'South hand must not contain duplicate cards');
  const rest = deck.filter(card => !unique.has(card));
  return {
    N: rest.slice(0,13),
    E: rest.slice(13,26),
    S: south,
    W: rest.slice(26,39)
  };
}

// BridgePlus s. 90: 1NT response is 6–10 HP, but requires a stopper
// in the opponents' overcall suit.
{
  const hands = completeDealWithSouth([
    'S12','S8','S5',
    'H13','H8','H5',
    'D11','D7','D4',
    'C9','C7','C4','C2'
  ]);
  const st = state(hands, 'N', [
    {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'P'}
  ]);
  const node = Rattning.nodeFor(st, 2);
  assert.equal(node.exp, '1N', '6 HP with a heart stopper qualifies for 1NT');
  assert.match(node.why, /6-10 hp.*håll/i);
  const alternate = state(rotateHiddenHands(hands), 'N', [
    {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'P'}
  ]);
  assert.equal(Rattning.nodeFor(alternate, 2).exp, node.exp,
    'Live response must not depend on partner/opponents hidden cards');
}

// The same 6 HP balanced hand without a heart stopper must not bid 1NT.
{
  const hands = completeDealWithSouth([
    'S13','S8','S6','S4','S2',
    'H8','H5','H3',
    'D12','D9','D4',
    'C11','C7'
  ]);
  const st = state(hands, 'N', [
    {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'P'}
  ]);
  const node = Rattning.nodeFor(st, 2);
  assert.notEqual(node.exp, '1N', '1NT requires a stopper in the overcall suit');
}

// A five-card new major and 1NT with a stopper overlap; the source gives no priority.
{
  const hands = completeDealWithSouth([
    'S12','S11','S8','S6','S4',
    'H13','H8','H5',
    'D12','D9','D4',
    'C9','C3'
  ]);
  const st = state(hands, 'N', [
    {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'P'}
  ]);
  const node = Rattning.nodeFor(st, 2);
  assert.equal(node.exp, null);
  assert.match(node.why, /ingen prioritet/i);
}

// BridgePlus s. 90: a minor may be introduced with four cards.
// The 11 HP hand clears the ordinary two-over-one strength threshold.
{
  const hands = completeDealWithSouth([
    'S14','S11','S8',
    'H8','H5','H3','H2',
    'D9','D4',
    'C14','C12','C7','C2'
  ]);
  const st = state(hands, 'N', [
    {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'P'}
  ]);
  const node = Rattning.nodeFor(st, 2);
  assert.equal(node.exp, '2C', 'Four-card minor is permitted as a response to the overcall');
}

// A four-card major is not enough for a new major-suit response.
{
  const hands = completeDealWithSouth([
    'S14','S11','S8','S6',
    'H8','H5','H3','H2',
    'D9','D4',
    'C7','C4','C2'
  ]);
  const st = state(hands, 'N', [
    {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'P'}
  ]);
  const node = Rattning.nodeFor(st, 2);
  assert.equal(node.exp, 'P', 'Four-card major must not be treated as a five-card new major');
}


function negativeDoubleDeal(south) {
  return completeDealWithSouth(south);
}

// BridgePlus s. 91: after 1D–1H, a negative double shows exactly four spades.
{
  const hands = negativeDoubleDeal([
    'S14','S13','S8','S6',
    'H12','H9','H5','H2',
    'D8','D4',
    'C11','C7','C3'
  ]);
  const st = state(hands, 'N', [
    {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'P'}
  ]);
  const node = Rattning.nodeFor(st, 2);
  assert.equal(node.exp, 'X');
  assert.match(node.why, /exakt fyra spader/i);
  const alternate = state(rotateHiddenHands(hands), 'N', [
    {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'P'}
  ]);
  assert.equal(Rattning.nodeFor(alternate, 2).exp, node.exp,
    'Negative double must depend only on own hand and public auction');
}

// BridgePlus s. 91: after 1C–1S, a negative double shows at least four hearts.
{
  const hands = negativeDoubleDeal([
    'S11','S8','S5',
    'H14','H12','H9','H5',
    'D13','D11','D8','D4',
    'C7','C3'
  ]);
  const st = state(hands, 'N', [
    {s:'N',c:'1C'}, {s:'E',c:'1S'}, {s:'S',c:'P'}
  ]);
  const node = Rattning.nodeFor(st, 2);
  assert.equal(node.exp, 'X');
  assert.match(node.why, /fyra hjärter/i);
}


// Five hearts after 1S- overcall overlap negative double and natural 2H;
// the source does not state which call has priority, so the position stays uncovered.
{
  const hands = completeDealWithSouth([
    'S9','S6','S4',
    'H14','H13','H8','H5','H2',
    'D12','D11','D8',
    'C7','C3'
  ]);
  const st = state(hands, 'N', [
    {s:'N',c:'1C'}, {s:'E',c:'1S'}, {s:'S',c:'P'}
  ]);
  const node = Rattning.nodeFor(st, 2);
  assert.equal(node.exp, null);
  assert.match(node.why, /prioritet/i);
}

const twoLevelOvercall = [
  {s:'N',c:'1D'}, {s:'E',c:'2H'}
];
assert.match(
  Rattning.slamProhibitionFromAuction(twoLevelOvercall, 2, 0),
  /tvåtricksnivån/i,
  'A two-level opponent overcall blocks slam for our side'
);

const oneLevelNoResponse = [
  {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'1S'}
];
assert.equal(
  Rattning.slamProhibitionFromAuction(oneLevelNoResponse, 3, 0),
  null,
  'A one-level overcall alone does not activate the slam block'
);

const oneLevelWithResponse = [
  {s:'N',c:'1D'}, {s:'E',c:'1H'}, {s:'S',c:'1S'}, {s:'W',c:'1S'}
];
assert.match(
  Rattning.slamProhibitionFromAuction(oneLevelWithResponse, 4, 0),
  /entricksnivån.*partner har svarat/i,
  'A one-level overcall followed by the overcaller partner response blocks slam'
);


const allCards = ['S','H','D','C'].flatMap(suit =>
  Array.from({length:13}, (_,i) => suit + (i + 2))
);
const arbitraryHands = {
  N: allCards.slice(0,13), E: allCards.slice(13,26),
  S: allCards.slice(26,39), W: allCards.slice(39,52)
};
const blockedTwoLevel = Rattning.nodeFor({
  hands: arbitraryHands, dealer: 'N',
  bids: [{s:'N',c:'1D'},{s:'E',c:'2H'},{s:'S',c:'6D'}]
}, 2);
assert.equal(blockedTwoLevel.slamBlocked, true);
assert.match(blockedTwoLevel.why, /tvåtricksnivån/i);

const blockedOneLevelResponse = Rattning.nodeFor({
  hands: arbitraryHands, dealer: 'N',
  bids: [
    {s:'N',c:'1D'},{s:'E',c:'1H'},{s:'S',c:'1S'},
    {s:'W',c:'1S'},{s:'N',c:'6D'}
  ]
}, 4);
assert.equal(blockedOneLevelResponse.slamBlocked, true);
assert.match(blockedOneLevelResponse.why, /partner har svarat/i);


const liveOpeningHand = [
  'S14','S13','S8','S5','S2',
  'H14','H12','H4',
  'D11','D7','D6',
  'C11','C7'
];
const liveAuction = [
  {s:'N',c:'P'}, {s:'E',c:'P'}, {s:'S',c:'P'}
];
const liveA = Rattning.decideLive({
  ownHand: liveOpeningHand, seat:'W', dealer:'N', auction:liveAuction
});
const liveB = Rattning.decideLive({
  ownHand: liveOpeningHand.slice(), seat:'W', dealer:'N', auction:liveAuction
});
assert.equal(liveA.exp, '1N', '15-17 balanced own hand opens 1NT in live API');
assert.equal(liveB.exp, liveA.exp, 'Repeated live call with same public information is invariant');
assert.equal(liveA.context, 'live');
assert.equal(liveA.informationBoundary, 'own_hand_and_public_auction_only');

// The live API now supports the undisturbed 1NT family. Five spades
// transfer to spades with 2♥; the opener's hidden hand is not supplied.
const liveResponse = Rattning.decideLive({
  ownHand: liveOpeningHand, seat:'E', dealer:'W',
  auction:[{s:'W',c:'1N'},{s:'N',c:'P'}]
});
assert.equal(liveResponse.exp, '2H');
assert.equal(liveResponse.context, 'live');
assert.equal(liveResponse.informationBoundary, 'own_hand_and_public_auction_only');

// It rejects wrong turn order and malformed own-hand input.
const wrongTurn = Rattning.decideLive({
  ownHand: liveOpeningHand, seat:'S', dealer:'N', auction:[{s:'N',c:'P'}]
});
assert.equal(wrongTurn.exp, null);
assert.match(wrongTurn.why, /inte den angivna spelarens tur/i);
const endedAuction = Rattning.decideLive({
  ownHand: liveOpeningHand, seat:'N', dealer:'N',
  auction:[{s:'N',c:'P'},{s:'E',c:'P'},{s:'S',c:'P'},{s:'W',c:'P'}]
});
assert.equal(endedAuction.exp, null);
assert.match(endedAuction.why, /redan avslutad/i);
const malformedHand = Rattning.decideLive({
  ownHand: liveOpeningHand.slice(1), seat:'N', dealer:'N', auction:[]
});
assert.equal(malformedHand.exp, null);
assert.match(malformedHand.why, /13 egna kort/i);

const report = {
  engineVersion: Rattning.version,
  cases: [
    { deal: 'ostord-400-023', expected: '5D', fit: 10, jointPlayingPoints: 31 },
    { deal: 'ostord-400-055', expected: '6D', fit: 12, jointPlayingPoints: 34 },
    { deal: 'ostord-400-068', expected: '3H', forcing: 'game' },
    { deal: 'source-90-1nt', expected: '1N', hp: 6, stopper: 'H' },
    { deal: 'source-90-no-stopper', expected: 'not-1N', hp: 6 },
    { deal: 'source-90-major-vs-1nt', expected: 'uncovered' },
    { deal: 'source-90-four-card-minor', expected: '2C', clubLength: 4 },
    { deal: 'source-90-four-card-major', expected: 'P', spadeLength: 4 },
    { deal: 'source-91-negative-double-hearts', expected: 'X', spadeLength: 4 },
    { deal: 'source-91-negative-double-spades', expected: 'X', heartLength: 4 },
    { deal: 'source-91-five-heart-overlap', expected: 'uncovered' },
    { deal: 'slam-block-two-level', expected: 'blocked' },
    { deal: 'slam-block-one-level-with-response', expected: 'blocked' },
    { deal: 'slam-block-one-level-alone', expected: 'not-blocked' },
    { deal: 'slam-block-two-level-integration', expected: 'blocked' },
    { deal: 'slam-block-one-level-response-integration', expected: 'blocked' }
  ],
  detailedNodeAnalysis: true,
  result: 'passed'
};
fs.mkdirSync('testdata', { recursive: true });
fs.writeFileSync('testdata/ostord_manual_rules_latest.json', JSON.stringify(report, null, 2) + '\n');
assert.equal(JSON.parse(fs.readFileSync('testdata/ostord_manual_rules_latest.json', 'utf8')).result, 'passed');
console.log('Manual bidding rule checks passed (3 undisturbed deals + 8 source-rule regressions + 3 auction-only slam guard checks + 2 live decision integration checks).');
