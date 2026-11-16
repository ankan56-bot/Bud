'use strict';

// Nordisk standard RKC regression tests after 1♥/1♠ and Stenberg 2NT.
const assert = require('node:assert/strict');
const Rattning = require('../rattningsmotor.js');

function deal(north) {
  const deck = [];
  for (const suit of ['S','H','D','C']) for (let rank=2; rank<=14; rank++) deck.push(suit+rank);
  assert.equal(north.length, 13);
  assert.equal(new Set(north).size, 13);
  const rest = deck.filter(card => !north.includes(card));
  return {N:north,E:rest.slice(0,13),S:rest.slice(13,26),W:rest.slice(26,39)};
}
function answer(north, trump) {
  const hands=deal(north), opening=trump==='H'?'1H':'1S', singleton=trump==='H'?'3C':'3H';
  const st={hands,dealer:'N',bids:[
    {s:'N',c:opening},{s:'E',c:'P'},
    {s:'S',c:'2N'},{s:'W',c:'P'},
    {s:'N',c:singleton},{s:'E',c:'P'},
    {s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'P'}
  ]};
  return Rattning.nodeFor(st,8);
}
function cases(trump) {
  const queen=trump+'12';
  const cards={
    one:['C14','H2','H3','H4','H5','H6','H7','H8','S2','S3','S4','D2','D3'],
    four:['S14','H14','D14','C14','H2','H3','H4','H5','H6','H7','S2','S3','S4'],
    zero:['H2','H3','H4','H5','H6','H7','H8','S2','S3','S4','D2','D3','C2'],
    three:['S14','H14','D14','H2','H3','H4','H5','H6','S2','S3','S4','D2','C2'],
    twoNoQueen:['S14','D14','H2','H3','H4','H5','H6','H7','S2','S3','S4','D2','C2'],
    twoWithQueen:['S14','D14',queen,'H2','H3','H4','H5','H6','S2','S3','S4','D2','C2']
  };
  assert.equal(answer(cards.one,trump).exp,'5D','1 keycard must be 5♦ (Nordisk standard)');
  assert.equal(answer(cards.four,trump).exp,'5D','4 keycards must be 5♦ (Nordisk standard)');
  assert.equal(answer(cards.zero,trump).exp,'5C','0 keycards must be 5♣ (Nordisk standard)');
  assert.equal(answer(cards.three,trump).exp,'5C','3 keycards must be 5♣ (Nordisk standard)');
  assert.equal(answer(cards.twoNoQueen,trump).exp,'5H','2 without trump queen must be 5♥');
  assert.equal(answer(cards.twoWithQueen,trump).exp,'5S','2 with trump queen must be 5♠');
  const allFive=['S14','H14','D14','C14',trump+'13','H2','H3','H4','H5','S2','S3','D2','D3'];
  assert.equal(answer(allFive,trump).exp,null,'All five keycards are not assigned a response in the Nordisk standards tabell');
}
cases('H');
cases('S');

// RKC is also recognized after a natural raise has established the major fit.
function answerAfterSimpleFit(north,trump){
 const hands=deal(north),opening=trump==='H'?'1H':'1S',raise='2'+trump,rebid='3'+trump;
 const st={hands,dealer:'N',bids:[
  {s:'N',c:opening},{s:'E',c:'P'},
  {s:'S',c:raise},{s:'W',c:'P'},
  {s:'N',c:rebid},{s:'E',c:'P'},
  {s:'S',c:'4N'},{s:'W',c:'P'},
  {s:'N',c:'P'}
 ]};
 return Rattning.nodeFor(st,8);
}
assert.equal(answerAfterSimpleFit(['C14','H2','H3','H4','H5','H6','H7','H8','S2','S3','S4','D2','D3'],'H').exp,'5D');
assert.equal(answerAfterSimpleFit(['C14','H2','H3','H4','H5','H6','H7','H8','S2','S3','S4','D2','D3'],'S').exp,'5D');

// The asker must not be auto-promoted to 6M after an ambiguous low-suit RKC reply.
{
  const north=['C14','H2','H3','H4','H5','H6','H7','H8','S2','S3','S4','D2','D3'];
  const hands=deal(north);
  const st={hands,dealer:'N',bids:[
    {s:'N',c:'1H'},{s:'E',c:'P'},
    {s:'S',c:'2N'},{s:'W',c:'P'},
    {s:'N',c:'3C'},{s:'E',c:'P'},
    {s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'5C'},{s:'E',c:'P'},
    {s:'S',c:'P'}
  ]};
  const node=Rattning.nodeFor(st,10);
  assert.equal(node.exp,'5D','after a 5♣ answer with hearts trumps, 5♦ asks for the trump queen');
}

console.log('Nordisk standard major-suit RKC responses passed; five-keycard and unresolved continuations remain explicitly uncovered.');
