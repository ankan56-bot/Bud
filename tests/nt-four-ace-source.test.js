'use strict';

// Source-aligned regression tests for the 1NT four-ace/RKC distinction.
// Nordisk standard 2012-08-22, pages 4–5 and 7.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const R = require('../rattningsmotor.js');
const A = require('../analysmotor.js');

const deck = [];
for (const suit of ['S','H','D','C']) for (let rank=2; rank<=14; rank++) deck.push(suit+rank);

function dealWithNorth(north) {
  assert.equal(north.length,13);
  assert.equal(new Set(north).size,13);
  const rest=deck.filter(card=>!north.includes(card));
  return {N:north.slice(),E:rest.slice(0,13),S:rest.slice(13,26),W:rest.slice(26,39)};
}
function handWithAces(count) {
  const cards=[];
  for (const suit of ['S','H','D','C'].slice(0,count)) cards.push(suit+'14');
  for (const card of deck) {
    if(cards.length===13)break;
    if(card.endsWith('14'))continue;
    if(!cards.includes(card))cards.push(card);
  }
  return cards;
}
function answer(hands,bids,seat='N') {
  const st={hands,dealer:'N',bids:bids.concat([{s:seat,c:'P'}])};
  return R.nodeFor(st,st.bids.length-1);
}
// 1NT–4NT and 1NT–2♣–2♦–4NT are four-ace asks without established trump.
// 5♣ = 0 or 4; 5♦ = 1; 5♥ = 2; 5♠ = 3.
for (const sequence of [
  [{s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'}],
  [{s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'2C'},{s:'W',c:'P'},
   {s:'N',c:'2D'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'}]
]) {
  for (const [aces,expected] of [[0,'5C'],[1,'5D'],[2,'5H'],[3,'5S'],[4,'5C']]) {
    const result=answer(dealWithNorth(handWithAces(aces)),sequence);
    assert.equal(result.exp,expected,`four-ace response for ${aces} aces must be ${expected}`);
  }
}


function openerStaymanChoice(north,secondResponderBid) {
  const sequence=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2C'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},
    {s:'S',c:secondResponderBid},{s:'W',c:'P'}
  ];
  return answer(dealWithNorth(north),sequence);
}
const stayman44Minimum15=['S14','S13','S2','S3','H14','H11','H2','H3','D13','D2','D3','C2','C3'];
const stayman44Minimum16=['S14','S12','S2','S3','H14','H11','H2','H3','D13','D12','D2','C2','C3'];
const stayman44Maximum17=['S14','S13','S2','S3','H14','H11','H2','H3','D13','D12','D2','C2','C3'];
assert.equal(openerStaymanChoice(stayman44Minimum15,'2N').exp,'3S','4-4 and 15 hp: 3S');
assert.equal(openerStaymanChoice(stayman44Minimum16,'2N').exp,'3S','4-4 and 16 hp: 3S');
assert.equal(openerStaymanChoice(stayman44Maximum17,'2N').exp,'4S','4-4 and 17 hp: 4S');
assert.equal(openerStaymanChoice(stayman44Maximum17,'3N').exp,'4S','after 3NT, 4-4 allows 4S');
const staymanNoSpadeFit=['S14','S13','S11','H14','H2','H3','H4','D13','D2','D3','C2','C3','C4'];
assert.equal(openerStaymanChoice(staymanNoSpadeFit,'3N').exp,'P','without 4-4, pass on 3NT');

// Stayman 2♥/2♠ is the explicitly described indirect trump agreement.
// A single ace with no trump king is one keycard -> 5♣ in RKC 1430.
const oneAceNoMajorKing=['D14','S2','S3','S4','S5','H2','H3','H4','D2','D3','D4','C2','C3'];
for (const [reply,trump] of [['2H','H'],['2S','S']]) {
  const sequence=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2C'},{s:'W',c:'P'},
    {s:'N',c:reply},{s:'E',c:'P'},
    {s:'S',c:'4N'},{s:'W',c:'P'}
  ];
  const result=answer(dealWithNorth(oneAceNoMajorKing),sequence);
  assert.equal(result.exp,'5C',`Stayman ${reply} must establish ${trump} for RKC 1430`);
  assert.equal(result.conv,'RKC 1430');
}

// Nordisk standard s. 5 explicitly makes 4NT RKC after a completed transfer,
// even though the partnership may not have an eight-card fit.
{
  const opener=['S14','H14','D14','C14','S2','S3','S4','H2','H3','D2','D3','C2','C3'];
  const weak=['S5','S6','S7','H4','H5','H6','H7','H8','D4','D5','D6','C5','C6'];
  const hands=dealWithNorth(opener);
  const rest=deck.filter(card=>!hands.N.includes(card));
  hands.S=weak;
  const used=new Set([...hands.N,...hands.S]);
  const remaining=deck.filter(card=>!used.has(card));
  hands.E=remaining.slice(0,13);hands.W=remaining.slice(13,26);
  const sequence=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},
    {s:'S',c:'4N'},{s:'W',c:'P'}
  ];
  const result=answer(hands,sequence);
  assert.equal(result.conv,'RKC 1430','completed transfer explicitly establishes RKC in the source');
  assert.equal(result.exp,'5C','four keycards (four aces) are 1/4 in RKC 1430');
}

// Once the transfer suit has actually been raised, RKC is available.
{
  const north=['S14','S13','S2','S3','H14','H13','H2','H3','D12','D2','C2','C3','C4'];
  const sequence=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2D'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},
    {s:'S',c:'3H'},{s:'W',c:'P'},
    {s:'N',c:'4H'},{s:'E',c:'P'},
    {s:'S',c:'4N'},{s:'W',c:'P'}
  ];
  const result=answer(dealWithNorth(north),sequence);
  assert.equal(result.conv,'RKC 1430');
  assert.equal(result.exp,'5D','two aces plus the heart king are three keycards');
}

// The analysis library must expose the source-correct T43 tree; the former
// text-only matcher filter wrongly discarded the valid four-ace 5♣/5♦ table.
{
  const lib=JSON.parse(fs.readFileSync('analysbibliotek.json','utf8'));
  const t43=lib.trees.find(tree=>tree.id==='T43_1NT_4NT_ENDPOINTS');
  assert.ok(t43);
  assert.equal(A.treeCompatible(t43),true);
  assert.match(lib.conventions.oneNTNoTrumpAceAsk,/5♣=0 or 4/);
  assert.match(lib.conventions.oneNTTransferRkc,/Nordisk standard.*s\. 5/);
  assert.ok(t43.nodes.some(node=>node.sequence.join('|')==='1NT|Pass|2♣|Pass|2♥|Pass|4NT'));
  assert.ok(t43.nodes.some(node=>node.sequence.join('|')==='1NT|Pass|2♣|Pass|2♠|Pass|4NT'));
  assert.ok(t43.nodes.some(node=>node.sequence.join('|')==='1NT|Pass|2♦|Pass|2♥|Pass|4NT'));
}

// The separately agreed 2NT–4NT sequence is quantitative, not an
// ace ask. The invitation is identified, but opener acceptance remains
// uncovered until a numeric maximum/minimum rule is source-confirmed.
{
  const hands=dealWithNorth(handWithAces(2));
  const auction=[
    {s:'N',c:'2N'},{s:'E',c:'P'},
    {s:'S',c:'4N'}
  ];
  const bidResult=R.nodeFor({hands,dealer:'N',bids:auction},2);
  assert.equal(bidResult.exp,'4N');
  assert.equal(bidResult.conv,'Kvantitativ sanginvit');
  assert.match(bidResult.why,/Kvantitativ invit till 6NT/);
  const responseAuction=auction.concat([{s:'W',c:'P'},{s:'N',c:'P'}]);
  const openerResult=R.nodeFor({hands,dealer:'N',bids:responseAuction},4);
  assert.equal(openerResult.exp,null,'opener acceptance is not inferred from an unverified point band');
  assert.equal(openerResult.conv,'Kvantitativ sanginvit');
  assert.match(openerResult.why,/inte en essfråga/);
}
console.log('1NT four-ace/RKC source tests: passed.');
