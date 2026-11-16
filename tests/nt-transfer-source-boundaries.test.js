'use strict';

// Conservative source-aligned checks for 1NT transfer continuations.
// Nordisk standard 2012-08-22, page 5: natural shape meanings are covered;
// qualitative invit/weak strength bands remain uncovered until verified.
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
const deck=[];
for(const suit of ['S','H','D','C'])for(let rank=2;rank<=14;rank++)deck.push(suit+rank);

function hand(shapeCards){
  const out=shapeCards.slice();
  for(const c of deck){if(out.length===13)break;if(!out.includes(c))out.push(c);}
  assert.equal(out.length,13);
  assert.equal(new Set(out).size,13);
  return out;
}
function result(south,sequence){
  const north=deck.filter(c=>!south.includes(c)).slice(0,13);
  const used=new Set([...north,...south]);
  assert.equal(used.size,26,'hands must not overlap');
  const rest=deck.filter(c=>!used.has(c));
  const hands={N:north,S:south,E:rest.slice(0,13),W:rest.slice(13,26)};
  const bids=sequence.concat([{s:'S',c:'P'}]);
  return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}
const afterHeartTransfer=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2D'},{s:'W',c:'P'},
  {s:'N',c:'2H'},{s:'E',c:'P'}
];
const afterSpadeTransfer=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2H'},{s:'W',c:'P'},
  {s:'N',c:'2S'},{s:'E',c:'P'}
];

// Explicit natural meanings from the source table.
const fiveHeartFourSpade=hand(['H14','H13','H12','H11','H10','S14','S13','S12','S11','D14','D13','C14','C13']);
assert.equal(result(fiveHeartFourSpade,afterHeartTransfer).exp,'2S',
  '5+ hearts and 4+ spades: one-round forcing 2S');

const fiveHeartFourClub=hand(['H14','H13','H12','H11','H10','C14','C13','C12','C11','S14','S13','D14','D13']);
assert.equal(result(fiveHeartFourClub,afterHeartTransfer).exp,'3C',
  '5+ hearts and 4+ clubs: game-forcing 3C');

const fiveHeartBothMinors=hand(['H14','H13','H12','H11','H10','C14','C13','C12','D14','D13','D12','S14','S13']);
assert.equal(result(fiveHeartBothMinors,afterHeartTransfer).exp,null,
  'no invented priority when both minor suits meet the 4-card condition');

const fiveFiveMajors=hand(['S14','S13','S12','S11','S10','H14','H13','H12','H11','H10','D14','D13','C14']);
assert.equal(result(fiveFiveMajors,afterSpadeTransfer).exp,'3H',
  '5-5 majors after spade transfer: invitational 3H');

// The source says invit/weak but does not give numeric HP bands here.
// Such cases must remain uncovered rather than borrow partner's hidden cards.
const balancedFiveHearts=hand(['H14','H13','H12','H11','H10','S14','S13','D14','D13','C14','C13','C12','C11']);
assert.equal(result(balancedFiveHearts,afterHeartTransfer).exp,null,
  'balanced exact-five transfer hand has no invented 2NT/3NT threshold');

console.log('1NT transfer source-boundary tests: passed.');
