'use strict';

// Nordisk standard RKC across every trump suit, plus queen asks and slam gates.
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
const A=require('../analysmotor.js');
const library=require('../analysbibliotek.json');
const SU=['C','D','H','S'];
const deck=[];
for(const suit of SU)for(let rank=2;rank<=14;rank++)deck.push(suit+rank);

function makeHand({trump=null,aces=[],trumpKing=false,trumpQueen=false,voids=[],exclude=[]}){
  const cards=[];
  for(const suit of aces)cards.push(suit+'14');
  if(trump&&trumpKing)cards.push(trump+'13');
  if(trump&&trumpQueen)cards.push(trump+'12');
  for(let rank=11;rank>=2&&cards.length<13;rank--){
    for(const suit of SU){
      if(cards.length>=13)break;
      if(voids.includes(suit))continue;
      const card=suit+rank;
      if(!cards.includes(card)&&!exclude.includes(card))cards.push(card);
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
    [makeHand({trump,aces:[]}), '5C', '0 keycards'],
    [makeHand({trump,aces:['C']}), '5D', '1 keycard'],
    [makeHand({trump,aces:['C','D']}), '5H', '2 keycards without trump queen'],
    [makeHand({trump,aces:['C','D'],trumpQueen:true}), '5S', '2 keycards with trump queen'],
    [makeHand({trump,aces:['C','D','H']}), '5C', '3 keycards without void'],
    [makeHand({trump,aces:['C','D','H','S']}), '5D', '4 keycards without trump king']
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
  const threeKeyVoid=SU.find(s=>s!==trump);
  const voidHand=makeHand({trump,aces:aceSuits(3,[threeKeyVoid]),voids:[threeKeyVoid]});
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

// A direct 4NT by opener immediately after 1m–2NT bypasses the required descriptive Stenberg rebid and is not RKC.
{
  const north=makeHand({aces:['C']});
  const bids=[{s:'N',c:'1C'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},
    {s:'N',c:'4N'},{s:'E',c:'P'},{s:'S',c:'P'}];
  const result=R.nodeFor({hands:dealWithNorth(north),dealer:'N',bids},6);
  assert.equal(result.exp,null);
  assert.notEqual(result.conv,'RKC');
  assert.match(result.why,/ingen fastställd trumf/i);
}
// The offline analysis library must cover minor-suit RKC as well as the
// existing major-suit trees, including the source-defined void responses.
for(const id of ['T01_RKC_HJARTER','T44_RKC_NORDISK_SPADER_STENBERG','T45_RKC_NORDISK_KLOVER','T46_RKC_NORDISK_RUTER']){
  const tree=library.trees.find(t=>t.id===id);
  assert.ok(tree,'missing analysis tree '+id);
  assert.equal(A.treeCompatible(tree),true,id+' must be compatible with the analysis matcher');
  assert.ok(tree.nodes.some(n=>n.sequence.includes('5NT')),'tree '+id+' must explain 5NT void response');
  assert.ok(tree.nodes.some(n=>n.sequence.some(c=>/^6[♣♦♥♠]$/.test(c))),'tree '+id+' must explain 6-level void response');
}
// Queen-ask steps, denial, and the source-defined 6-level follow-up.
{
  function deal(north,south){
    const rest=deck.filter(c=>!north.includes(c)&&!south.includes(c));
    assert.equal(north.length,13);assert.equal(south.length,13);assert.equal(rest.length,26);
    return {N:north.slice(),E:rest.slice(0,13),S:south.slice(),W:rest.slice(13,26)};
  }
  const responderNoQueen=makeHand({trump:'H',aces:['C']});
  const askerThreeAces=makeHand({aces:['S','D','H'],exclude:responderNoQueen});
  const hands=deal(responderNoQueen,askerThreeAces);
  const auction=[
    {s:'N',c:'1H'},{s:'E',c:'P'},
    {s:'S',c:'2H'},{s:'W',c:'P'},
    {s:'N',c:'3H'},{s:'E',c:'P'},
    {s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'5C'},{s:'E',c:'P'}
  ];
  const ask=R.nodeFor({hands,dealer:'N',bids:auction.concat([{s:'S',c:'P'}])},10);
  assert.equal(ask.exp,'5D','after 5C, the next legal non-trump bid below 5H asks for the trump queen');
  const afterAsk=auction.concat([{s:'S',c:'5D'},{s:'W',c:'P'},{s:'N',c:'P'}]);
  const deny=R.nodeFor({hands,dealer:'N',bids:afterAsk},12);
  assert.equal(deny.exp,'5H','a hand without the trump queen denies with 5 in trump');
  const afterDeny=auction.concat([{s:'S',c:'5D'},{s:'W',c:'P'},{s:'N',c:'5H'},{s:'E',c:'P'},{s:'S',c:'P'}]);
  const six=R.nodeFor({hands,dealer:'N',bids:afterDeny},14);
  assert.equal(six.exp,'6H','with 3 own aces, asker bids 6 in trump after the queen is denied');

  const responderWithQueen=makeHand({trump:'H',aces:['C'],trumpQueen:true});
  const askerThreeAcesQ=makeHand({aces:['S','D','H'],exclude:responderWithQueen});
  const handsQ=deal(responderWithQueen,askerThreeAcesQ);
  const auctionQ=auction.concat([{s:'S',c:'5D'},{s:'W',c:'P'},{s:'N',c:'P'}]);
  const show=R.nodeFor({hands:handsQ,dealer:'N',bids:auctionQ},12);
  assert.equal(show.exp,'5N','a hand with the trump queen shows it with 5NT');

  // With 4 aces opposite the single trump king, the queen shown completes
  // all five keycards and permits the 7-level suit contract.
  const kingQueenResponder=makeHand({trump:'S',trumpKing:true,trumpQueen:true});
  const fourAceAsker=makeHand({aces:SU,exclude:kingQueenResponder});
  const handsSeven=deal(kingQueenResponder,fourAceAsker);
  const sevenAuction=[
    {s:'N',c:'1S'},{s:'E',c:'P'},{s:'S',c:'2S'},{s:'W',c:'P'},
    {s:'N',c:'3S'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'5D'},{s:'E',c:'P'},{s:'S',c:'5H'},{s:'W',c:'P'},
    {s:'N',c:'5N'},{s:'E',c:'P'},{s:'S',c:'P'}
  ];
  const seven=R.nodeFor({hands:handsSeven,dealer:'N',bids:sevenAuction},14);
  assert.equal(seven.exp,'7S','all four aces plus the trump king permit 7 in the suit');

  // Two keycards opposite two own aces guarantee at least three aces,
  // so 6 in the agreed suit is permitted even if the fourth ace is missing.
  const twoKeyResponder=makeHand({trump:'H',aces:['C'],trumpKing:true});
  const twoAceAsker=makeHand({aces:['S','D'],exclude:twoKeyResponder});
  const handsSix=deal(twoKeyResponder,twoAceAsker);
  const sixAuction=[
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'2H'},{s:'W',c:'P'},
    {s:'N',c:'3H'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'5H'},{s:'E',c:'P'},{s:'S',c:'P'}
  ];
  const small=R.nodeFor({hands:handsSix,dealer:'N',bids:sixAuction},10);
  assert.equal(small.exp,'6H','at least three partnership aces permit a 6-level suit contract');

  // A void in a lower suit is shown in that suit; asker can then set 6H.
  const responderVoidC=makeHand({trump:'H',aces:['D'],trumpKing:true,voids:['C']});
  const askerVoidC=makeHand({aces:['S','C'],exclude:responderVoidC});
  const handsVoidC=deal(responderVoidC,askerVoidC);
  const voidCAuction=[
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'2H'},{s:'W',c:'P'},
    {s:'N',c:'3H'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'6C'},{s:'E',c:'P'},{s:'S',c:'P'}
  ];
  assert.equal(R.nodeFor({hands:handsVoidC,dealer:'N',bids:voidCAuction},10).exp,'6H',
    '6 in a lower void suit can be followed by the agreed 6H contract');

  // A void above hearts is shown by 6H itself. If the ace threshold is met,
  // the responder has already placed the partnership in the permitted small slam.
  const responderVoidS=makeHand({trump:'H',aces:['D'],trumpKing:true,voids:['S']});
  const askerVoidS=makeHand({aces:['S','C'],exclude:responderVoidS});
  const handsVoidS=deal(responderVoidS,askerVoidS);
  const voidSAuction=[
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'2H'},{s:'W',c:'P'},
    {s:'N',c:'3H'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'6H'},{s:'E',c:'P'},{s:'S',c:'P'}
  ];
  assert.equal(R.nodeFor({hands:handsVoidS,dealer:'N',bids:voidSAuction},10).exp,'P',
    'when 6H is already the legal void response, pass rather than rebid 6H');
}

// A no-trump four-ace ask reaches 7NT only when all four aces are certain.
{
  const responder=makeHand({});
  const asker=makeHand({aces:SU,exclude:responder});
  const rest=deck.filter(c=>!responder.includes(c)&&!asker.includes(c));
  const hands={N:responder,E:rest.slice(0,13),S:asker,W:rest.slice(13,26)};
  const bids=[
    {s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'5C'},{s:'E',c:'P'},{s:'S',c:'P'}
  ];
  const result=R.nodeFor({hands,dealer:'N',bids},6);
  assert.equal(result.exp,'7N','7NT requires all four aces');
}

// When no legal 5-level queen ask leaves 5 in trump available as a denial,
// retain the position in the separate review log rather than inventing a step.
{
  const store=new Map();
  global.window={localStorage:{
    getItem:key=>store.has(key)?store.get(key):null,
    setItem:(key,value)=>store.set(key,value),
    removeItem:key=>store.delete(key)
  }};
  require('../ej-tackta-logg.js');
  const log=global.window.EjTacktaLogg;
  const north=makeHand({trump:'H',aces:['C']});
  const south=makeHand({aces:['S','D','H'],exclude:north});
  const rest=deck.filter(c=>!north.includes(c)&&!south.includes(c));
  const hands={N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
  const bids=[
    {s:'N',c:'1H'},{s:'E',c:'P'},
    {s:'S',c:'2H'},{s:'W',c:'P'},
    {s:'N',c:'3H'},{s:'E',c:'P'},
    {s:'S',c:'4N'},{s:'W',c:'P'},
    {s:'N',c:'5D'},{s:'E',c:'P'},
    {s:'S',c:'5S'},{s:'W',c:'P'},{s:'N',c:'P'}
  ];
  const result=R.nodeFor({hands,dealer:'N',bids},12);
  assert.equal(result.exp,null,'when 5 in trump is no longer a legal denial, do not invent an alternative');
  assert.equal(result.sourceGap,true);
  assert.equal(log.count(),1,'the uncovered RKC continuation must be saved');
  assert.equal(log.read()[0].context,'after_deal');
}
console.log('All-trumps RKC, queen-ask, and slam-gate tests: passed.');
