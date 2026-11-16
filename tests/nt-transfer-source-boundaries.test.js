'use strict';

// Conservative source-aligned checks for 1NT transfer continuations.
// Nordisk standard 2012-08-22, page 5: natural shape meanings are covered;
// qualitative invit/weak strength bands remain uncovered until verified.
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
const A=require('../analysmotor.js');
const lib=require('../analysbibliotek.json');
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

const fiveHeartBothMinors=hand(['H14','H13','H12','H11','H10','C14','C13','C12','C11','D14','D13','D12','D11']);
assert.equal(result(fiveHeartBothMinors,afterHeartTransfer).exp,null,
  'no invented priority when both minor suits meet the 4-card condition');

const fiveFiveMajors=hand(['S13','S2','S3','S4','S5','H13','H12','H11','H4','H5','D2','D3','C2']);
assert.equal(result(fiveFiveMajors,afterSpadeTransfer).exp,'3H',
  '5-5 majors after spade transfer: invitational 3H');

// The source says invit/weak but does not give numeric HP bands here.
// Such cases must remain uncovered rather than borrow partner's hidden cards.
const balancedFiveHearts=hand(['H14','H13','H12','H11','H10','S14','S13','S12','D14','D13','D12','C14','C13']);
assert.equal(result(balancedFiveHearts,afterHeartTransfer).exp,null,
  'hands outside the source-defined 0–15 hp bands remain uncovered');

// Exact page-5 strength bands: 0–7 pass; 8–9 invite; 10–15 choose game.
const weakFiveHearts=hand(['H9','H8','H7','H6','H5','S14','S2','S3','D13','D2','D3','C2','C3']);
assert.equal(R.H(weakFiveHearts).hp,7);
assert.equal(result(weakFiveHearts,afterHeartTransfer).exp,'P','0–7 hp passes');

const invitFiveHearts=hand(['H13','H12','H11','H10','H9','S13','S2','S3','D2','D3','D4','C2','C3']);
assert.equal(R.H(invitFiveHearts).hp,9);
assert.equal(R.H(invitFiveHearts).bal,true);
assert.equal(result(invitFiveHearts,afterHeartTransfer).exp,'2N','8–9 hp, balanced exact five hearts: 2NT invite');

const invitSixHearts=hand(['H13','H12','H11','H10','H9','H8','S13','S2','D2','D3','D4','C2','C3']);
assert.equal(R.H(invitSixHearts).hp,9);
assert.equal(R.H(invitSixHearts).bal,false);
assert.equal(result(invitSixHearts,afterHeartTransfer).exp,'3H','8–9 hp and 6+ hearts: 3H invite');

const gameFiveHearts=hand(['H14','H13','H12','H11','H9','S13','S2','S3','D2','D3','D4','C2','C3']);
assert.equal(R.H(gameFiveHearts).hp,13);
assert.equal(R.H(gameFiveHearts).bal,true);
assert.equal(result(gameFiveHearts,afterHeartTransfer).exp,'3N','10–15 hp, balanced exact five hearts: 3NT');

const gameSixHearts=hand(['H13','H12','H11','H10','H9','H8','S14','S13','D2','D3','D4','C2','C3']);
assert.equal(R.H(gameSixHearts).hp,13);
assert.equal(R.H(gameSixHearts).bal,false);
assert.equal(result(gameSixHearts,afterHeartTransfer).exp,'4H','10–15 hp and 6+ hearts: 4H');

const invitFiveFive=hand(['H13','H12','H11','H10','H9','S13','S2','S3','S4','S5','D2','D3','C2']);
assert.equal(R.H(invitFiveFive).hp,9);
assert.equal(result(invitFiveFive,afterSpadeTransfer).exp,'3H','8–9 hp and 5-5 majors after spade transfer: 3H invite');

// Trees with unverified numerical strength bands remain documented but
// must not be selected as authoritative correction/analysis nodes.
for(const id of ['T03_OVERFORING_PASS','T07_OVERFORING_HJARTER','T08_OVERFORING_SPADER']){
  const tree=lib.trees.find(t=>t.id===id);
  assert.ok(tree, 'expected source-aligned transfer tree '+id);
  assert.equal(tree.sourceStatus,'source_verified',id+' must be marked source verified');
  assert.equal(A.treeCompatible(tree),true,id+' must be available for authoritative matching');
}
for(const id of ['T19','T20','T27_OVERFORING_HJARTER_SEXKORT_INVIT','T28_OVERFORING_SPADER_SEXKORT_INVIT']){
  const tree=lib.trees.find(t=>t.id===id);
  assert.ok(tree, 'expected documented invitation tree '+id);
  assert.equal(tree.sourceStatus,'provisional_source_gap',id+' remains provisional because opener acceptance is not specified');
  assert.equal(A.treeCompatible(tree),false,id+' must not be matched as authoritative');
}
console.log('1NT transfer source-boundary tests: passed.');
