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


test('page 18: 3NT after 2NT invite requires 15–17 hp', () => {
  const hand = ['C14','C13','C9','D14','D13','D9','D8','D7','D6','H14','H13','H9','S12'];
  const st = state(hand, [
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1D'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},
    {s:'N',c:'3N'}
  ]);
  const node = expectBid(st, 8, '3N');
  assert.match(node.why, /15–17 hp/);
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
