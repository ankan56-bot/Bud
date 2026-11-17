const test = require('node:test');
const assert = require('node:assert/strict');
const Rattning = require('../rattningsmotor.js');

function state(handN, bids, handS) {
  const empty = ['C2','C3','C4','C5','C6','D2','D3','D4','H2','H3','S2','S3','S4'];
  return {
    hands: { N: handN, S: handS || empty, E: empty, W: empty },
    bids
  };
}

function expectBid(st, index, expected) {
  const node = Rattning.nodeFor(st, index);
  assert.equal(node && node.exp, expected, node && node.why);
  return node;
}

test('page 18: 1♣–1♥; 1♠–1NT, 5–4 and 11 hp permits 2♣', () => {
  const hand = ['C14','C13','C9','C8','C7','D14','D9','D8','D7','H9','H8','S9','S8'];
  const st = state(hand, [
    {s:'N',c:'1C'},{s:'E',c:'P'},{s:'S',c:'1H'},{s:'W',c:'P'},
    {s:'N',c:'1S'},{s:'E',c:'P'},{s:'S',c:'1N'},{s:'W',c:'P'},
    {s:'N',c:'2C'}
  ]);
  expectBid(st, 8, '2C');
});

test('page 19: third suit is recognized and forcing without an invented hp threshold', () => {
  const hand = ['C14','C13','C12','C11','C10','C9','D14','D13','D12','D11','H14','H13','S14'];
  const st = state(hand, [
    {s:'N',c:'1C'},{s:'E',c:'P'},{s:'S',c:'1H'},{s:'W',c:'P'},
    {s:'N',c:'2C'},{s:'E',c:'P'},{s:'S',c:'2D'}
  ]);
  const node = expectBid(st, 6, '2D');
  assert.equal(node.conv, 'Tredje färg');
  assert.equal(node.soft, false);
});

test('page 19: fourth suit is distinguished from third suit', () => {
  const hand = ['C14','C13','C12','C11','C10','C9','D14','D13','D12','D11','H14','H13','S14'];
  const st = state(hand, [
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1S'},{s:'W',c:'P'},
    {s:'N',c:'2C'},{s:'E',c:'P'},{s:'S',c:'2D'}
  ]);
  const node = expectBid(st, 6, '2D');
  assert.equal(node.conv, 'Fjärde färg');
  assert.equal(node.soft, false);
});

test('page 19: after 1♥–1♠; 2♣–2♦, 2NT shows a diamond stopper', () => {
  const hand = ['C14','C13','C12','C11','C10','C9','D14','D9','D8','D7','H14','H13','S14'];
  const st = state(hand, [
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1S'},{s:'W',c:'P'},
    {s:'N',c:'2C'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'2N'}
  ]);
  expectBid(st, 8, '2N');
});

test('page 18: preference branch accepts 2NT invite at 15-17 hp', () => {
  const hand = ['C14','C13','C9','C8','D14','D9','D8','H13','H9','H8','S12','S9','S8'];
  const st = state(hand, [
    {s:'N',c:'1D'},{s:'E',c:'P'},{s:'S',c:'1H'},{s:'W',c:'P'},
    {s:'N',c:'2D'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'2N'}
  ]);
  expectBid(st, 8, '2N');
});

test('page 19: opener shows four-card diamond support after third suit', () => {
  const hand = ['C14','C13','C12','C11','C10','C9','D14','D13','D12','D9','H14','H13','S14'];
  const st = state(hand, [
    {s:'N',c:'1C'},{s:'E',c:'P'},{s:'S',c:'1H'},{s:'W',c:'P'},
    {s:'N',c:'2C'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'3D'}
  ]);
  expectBid(st, 8, '3D');
});

test('page 19: after third suit, 6-card hearts and 11 hp permits 3♥', () => {
  const handS = ['H14','H13','H9','H8','H7','H6','C14','C9','D9','D8','S9','S8','S7'];
  const st = state([], [
    {s:'N',c:'1C'},{s:'E',c:'P'},{s:'S',c:'1H'},{s:'W',c:'P'},
    {s:'N',c:'2C'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'3H'}
  ], handS);
  expectBid(st, 10, '3H');
});

test('page 19: responder can use 2♠ as fourth suit after third-suit sequence', () => {
  const handS = ['H14','H13','H9','H8','H7','H6','C14','C9','D9','D8','S9','S8','S7'];
  const st = state([], [
    {s:'N',c:'1C'},{s:'E',c:'P'},{s:'S',c:'1H'},{s:'W',c:'P'},
    {s:'N',c:'2C'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'2S'}
  ], handS);
  const node = expectBid(st, 10, '2S');
  assert.equal(node.conv, 'Fjärde färg');
});


test('page 19: 3NT after fourth-suit continuation is rejected above 17 hp', () => {
  const handS = ['D14','D13','D12','D11','C14','C13','C12','H14','H13','H12','S14','S13','S12'];
  const st = state([], [
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1S'},{s:'W',c:'P'},
    {s:'N',c:'2C'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'3N'}
  ], handS);
  const node = Rattning.nodeFor(st, 10);
  assert.notEqual(node && node.exp, '3N');
});


test('page 18: 4♣ Splinter is accepted with 16–17 hp', () => {
  const hand = ['C14','C13','C9','C8','D14','D9','D8','H13','H9','H8','S12','S9','S8'];
  const st = state(hand, [
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1D'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'4C'}
  ]);
  const node = expectBid(st, 8, '4C');
  assert.equal(node.conv, 'Splinter');
});

test('page 18: 4♣ Splinter is not accepted outside 16–17 hp', () => {
  const hand = ['C14','C13','C9','C8','D14','D13','D9','H9','H8','H7','S9','S8','S7'];
  const st = state(hand, [
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1D'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'4C'}
  ]);
  const node = Rattning.nodeFor(st, 8);
  assert.notEqual(node && node.exp, '4C');
});


test('page 18: 1♥–1♠; 2♦–2NT is an 11–12 hp invite', () => {
  const opener = ['C14','C13','C12','D14','D13','H9','H8','H7','H6','S9','S8','S7','C6'];
  const responder = ['S14','S13','S12','S11','H11','C9','C8','C7','D9','D8','D7','H10','H5'];
  const st = state(opener, [
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1S'},{s:'W',c:'P'},
    {s:'N',c:'2D'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},
    {s:'N',c:'3N'}
  ], responder);
  const node = expectBid(st, 8, '3N');
  assert.equal(node.conv, 'ÖH:s tredje bud efter 2NT-invit');
});

test('page 18: 2NT invite branch requires responder 11–12 hp', () => {
  const opener = ['C14','C13','C12','D14','D13','H9','H8','H7','H6','S9','S8','S7','C6'];
  const responder = ['S14','S13','S12','S11','H13','C9','C8','C7','D9','D8','D7','H10','H5'];
  const st = state(opener, [
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1S'},{s:'W',c:'P'},
    {s:'N',c:'2D'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},
    {s:'N',c:'3N'}
  ], responder);
  const node = Rattning.nodeFor(st, 8);
  assert.notEqual(node && node.exp, '3N');
});

function openerTwoSuitState(hand, call) {
  const empty = ['C2','C3','C4','C5','C6','D2','D3','D4','H2','H3','S2','S3','S4'];
  return { hands:{N:hand,S:empty,E:empty,W:empty}, bids:[
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1S'},{s:'W',c:'P'},{s:'N',c:call}
  ]};
}

test('1♥–1♠–2♣: 12–17 hp and exact 5–4; meaning explicitly excludes the jump range', () => {
  const hand=['H14','H13','H9','H8','H7','C14','C13','C9','C8','D9','D8','S9','S8'];
  const node=Rattning.nodeFor(openerTwoSuitState(hand,'2C'),4);
  assert.equal(node.exp,'2C',node.why);
  assert.equal(node.conv,'tvåfärgshand');
  assert.match(node.means('2C'),/12–17 hp/);
  assert.match(node.means('2C'),/Utesluter 18\+ htp/);
});

test('1♥–1♠–2♣ remains the low rebid at 17 hp with exact 5–4', () => {
  const hand=['H14','H13','H12','H9','H8','C14','C13','C9','C8','D11','D8','S9','S8'];
  const node=Rattning.nodeFor(openerTwoSuitState(hand,'2C'),4);
  assert.equal(node.exp,'2C',node.why);
});

test('1♥–1♠–3♣: jump shows 18+ htp with at least 5–4', () => {
  const hand=['H14','H13','H12','H9','H8','C14','C13','C9','C8','D12','D9','D8','S2'];
  const node=Rattning.nodeFor(openerTwoSuitState(hand,'3C'),4);
  assert.equal(node.exp,'3C',node.why);
  assert.match(node.means('3C'),/18\+ htp/);
  assert.match(node.means('3C'),/minst 5–4/);
});

test('1♥–1♠–3♣: 16 hp can qualify through 18 htp with a 6–4 hand', () => {
  const hand=['H14','H13','H9','H8','H7','H6','C14','C13','C9','C8','D12','D9','S2'];
  const node=Rattning.nodeFor(openerTwoSuitState(hand,'3C'),4);
  assert.equal(node.exp,'3C',node.why);
});

test('a low-level second-color rebid is not generalized to 6–4 or 5–5 at 12–17 hp', () => {
  const hand=['H14','H13','H9','H8','H7','H6','C14','C13','C9','C8','D9','D8','S9'];
  const node=Rattning.nodeFor(openerTwoSuitState(hand,'2C'),4);
  assert.equal(node.exp,null,node.why);
  assert.equal(node.conv,'tvåfärgshand');
});
test('1♥–1♠–2♣ is rejected when the hand has 18+ htp and the jump is required', () => {
  const hand=['H14','H13','H12','H9','H8','C14','C13','C9','C8','D12','D9','D8','S2'];
  const node=Rattning.nodeFor(openerTwoSuitState(hand,'2C'),4);
  assert.equal(node.exp,'3C',node.why);
  assert.match(node.means('2C'),/12–17 hp/);
});