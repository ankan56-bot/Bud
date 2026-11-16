'use strict';

const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
global.Rattning=R;
const F=require('../facitmotor.js');

const deck=[];
for(const suit of ['S','H','D','C'])for(let rank=2;rank<=14;rank++)deck.push(suit+rank);
function fill(cards){
  const out=cards.slice();
  for(const card of deck){if(out.length===13)break;if(!out.includes(card))out.push(card);}
  assert.equal(out.length,13);
  return out;
}
function deal(north,south){
  const used=new Set([...north,...south]);
  assert.equal(used.size,26);
  const rest=deck.filter(card=>!used.has(card));
  return {N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
}

// A complete deal that follows the source-backed 1NT opening and transfer
// through 2S, then stops where the source does not define the next choice.
const north=fill([
  'S14','S13','S2','S3',
  'H14','H12','H2','H3',
  'D13','D2','C2','C3','C4'
]);
// Explicit responder hand, disjoint from North.\nconst cleanSouth=['S12','S11','S10','S9','S8','H11','H10','H9','H8','D4','D5','C5','C6'];
const hands=deal(north,cleanSouth);
assert.equal(R.H(north).hp,16);
assert.equal(R.H(north).bal,true);
const result=F.generateUndisturbedFacit({hands,dealer:'N',trainingSide:'NS'});
assert.equal(result.status,'incomplete');
assert.deepEqual(result.auction.map(x=>x.c),['1N','P','2H','P','2S','P']);
assert.equal(result.steps[0].meaning,'15-17 hp, balanserad (även 5-korts högfärg).');
assert.ok(result.uncovered);
assert.equal(result.uncovered.seat,'S');
assert.match(result.message,/ofullständig/);

// Hidden hands are never passed to decideLive: only the acting player's hand
// and the public auction are included by the facit orchestrator.
const noContractHands=deal(\n  ['S2','S3','S4','S5','H2','H3','H4','D2','D3','C2','C3','C4','C5'],\n  ['S6','S7','S8','S9','H5','H6','H7','D4','D5','C6','C7','C8','C9']\n);\nconst noContract=F.generateUndisturbedFacit({hands:noContractHands,dealer:'E',trainingSide:'NS'});\nassert.equal(noContract.status,'complete');\nassert.equal(noContract.contract,null);\nassert.deepEqual(noContract.auction.map(x=>x.c),['P','P','P','P']);

// Invalid deals fail closed.
const invalid=F.generateUndisturbedFacit({hands:{N:north,E:north,S:cleanSouth,W:cleanSouth},dealer:'N'});
assert.equal(invalid.status,'invalid_deal');
assert.equal(invalid.complete,false);

console.log('Undisturbed facit generator tests: passed.');
