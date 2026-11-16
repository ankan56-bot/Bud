'use strict';

// RKC 1430 across every possible trump suit, plus the source-defined void
// responses and the separate no-trump four-ace table.
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
const SU=['C','D','H','S'];
const deck=[];
for(const suit of SU)for(let rank=2;rank<=14;rank++)deck.push(suit+rank);

function makeHand({trump=null,aces=[],trumpKing=false,trumpQueen=false,voids=[]}){
  const cards=[];
  for(const suit of aces)cards.push(suit+'14');
  if(trump&&trumpKing)cards.push(trump+'13');
  if(trump&&trumpQueen)cards.push(trump+'12');
  for(const suit of SU){
    if(voids.includes(suit))continue;
    for(let rank=11;rank>=2&&cards.length<13;rank--){
      const card=suit+rank;
      if(!cards.includes(card))cards.push(card);
    }
  }
  assert.equal(cards.length,13,'fixture must contain 13 cards');
  assert.equal(new Set(cards).size,13,'fixture cards must be unique');
  assert.ok(voids.every(s=>!cards.some(c=>c[0]===s)),'void suit must be empty');
  return cards;
}
function dealWithNorth(north){
  const rest=deck.filter(c=>!north.includes(c));
  assert.equal(rest.length,39);
  return {N:north.slice(),E:rest.slice(0,13),S:rest.slice(13,26),W:rest.slice(26,39)};
}
function answerWithTrump(trump,north){
  const bids=[
    {s:'N',c:'1'+trump},{s:'E',c:'P'},
    {s:'S',c:'2'+trump},{s:'W',c:'P'},
    {s:'N',c:'3'+trump},{s:'E',c:'P'},
    {s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'P'}
  ];
  return R.nodeFor({hands:dealWithNorth(north),dealer:'N',bids},8);
}
function aceSuits(count,voids=[]){
  return SU.filter(s=>!voids.includes(s)).slice(0,count);
}

for(const trump of SU){
  const cases=[
    [makeHand({trump,aces:[]}), '5D', '0 keycards'],
    [makeHand({trump,aces:['C']}), '5C', '1 keycard'],
    [makeHand({trump,aces:['C','D']}), '5H', '2 keycards without trump queen'],
    [makeHand({trump,aces:['C','D'],trumpQueen:true}), '5S', '2 keycards with trump queen'],
    [makeHand({trump,aces:['C','D','H']}), '5D', '3 keycards without void'],
    [makeHand({trump,aces:['C','D','H','S']}), '5C', '4 keycards without trump king']
  ];
  for(const [hand,expected,label] of cases){
    const result=answerWithTrump(trump,hand);
    assert.equal(result.exp,expected, trump+' trump: '+label+' should be '+expected+'; got '+JSON.stringify(result));
  }
  const allFive=makeHand({trump,aces:SU,trumpKing:true});
  const five=answerWithTrump(trump,allFive);
  assert.equal(five.exp,null,trump+' trump: five of five keycards remain uncovered');
  assert.equal(five.sourceGap,true,'five-keycard gap must be marked for logging');
}

for(const trump of SU){
  for(const voidSuit of SU.filter(s=>s!==trump)){
    const hand=makeHand({trump,aces:aceSuits(2,[voidSuit]),voids:[voidSuit]});
    const expected=SU.indexOf(voidSuit)>SU.indexOf(trump)?'6'+trump:'6'+voidSuit;
    const result=answerWithTrump(trump,hand);
    assert.equal(result.exp,expected, trump+' trumps / '+voidSuit+' void must show '+expected);
  }
  const voidHand=makeHand({trump,aces:aceSuits(3),voids:[SU.find(s=>s!==trump)]});
  assert.equal(answerWithTrump(trump,voidHand).exp,'5N',
    trump+' trump: three keycards and a void must be shown by 5NT');
  const multipleVoids=SU.filter(s=>s!==trump).slice(0,2);
  const twoKeysManyVoids=makeHand({trump,aces:aceSuits(2,multipleVoids),voids:multipleVoids});
  const ambiguous=answerWithTrump(trump,twoKeysManyVoids);
  assert.equal(ambiguous.exp,null,trump+' trump: multiple voids with two keycards have no specified suit choice');
  assert.equal(ambiguous.sourceGap,true);
}

// No-trump four-ace asks: 5C=0 or 4, 5D=1, 5H=2, 5S=3.
// 5NT is NOT the four-ace response.
function answerWithoutTrump(aces,viaStayman=false){
  const north=makeHand({aces:SU.slice(0,aces)});
  const bids=viaStayman
    ?[{s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'2C'},{s:'W',c:'P'},
      {s:'N',c:'2D'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'},{s:'N',c:'P'}]
    :[{s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'},{s:'N',c:'P'}];
  return R.nodeFor({hands:dealWithNorth(north),dealer:'N',bids},bids.length-1);
}
for(const viaStayman of [false,true]){
  for(const [aces,expected] of [[0,'5C'],[1,'5D'],[2,'5H'],[3,'5S'],[4,'5C']]){
    const result=answerWithoutTrump(aces,viaStayman);
    assert.equal(result.exp,expected,'no-trump '+(viaStayman?'Stayman':'direct')+' ask with '+aces+' aces');
    assert.notEqual(result.exp,'5N','5NT is not the four-ace response');
  }
}

// 2NT–4NT is quantitative, not an ace ask; 1m–2NT is not Stenberg.
{
  const north=makeHand({aces:['C']});
  const bids=[{s:'N',c:'1C'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},
    {s:'N',c:'4N'},{s:'E',c:'P'},{s:'S',c:'P'}];
  const result=R.nodeFor({hands:dealWithNorth(north),dealer:'N',bids},6);
  assert.equal(result.exp,null);
  assert.doesNotMatch(result.why,/RKC|essfråga/i);
}
console.log('All-trumps RKC and no-trump four-ace tests: passed.');
