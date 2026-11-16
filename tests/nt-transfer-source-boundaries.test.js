'use strict';

// Conservative source-aligned checks for 1NT transfer continuations.
// Nordisk standard 2012-08-22, page 5: transfer strength bands are explicit;
// the separate weak 2♠ minor relay remains qualitative and has no HP cutoff.
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

// Weak 2♠ low-minor relay: source gives the shape and qualitative weakness,
// but no numerical HCP range. Do not invent one.
const afterOneNT=[{s:'N',c:'1N'},{s:'E',c:'P'}];
const weakSixClubs=hand(['C14','C13','C12','C11','C10','C9','S2','S3','H2','H3','D2','D3','D4']);
const weakSixClubsResult=result(weakSixClubs,afterOneNT);
assert.equal(weakSixClubsResult.exp,null,
  '6+ clubs fits both qualitative low-minor routes but their strength/quality distinction is unspecified');
assert.match(weakSixClubsResult.why,/skiljer mellan 2♠-relä.*3 lå-invit/i);
const weakFiveFiveMinors=hand(['C14','C13','C12','C11','C10','D14','D13','D12','D11','D10','S2','H2','H3']);
assert.equal(result(weakFiveFiveMinors,afterOneNT).exp,null,
  '5-5 minors fits relay shape but numeric weak threshold is unspecified');

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

const heartTransferOverlap=hand(['H14','H13','H12','H11','H10','S14','S13','S12','S11','C14','C13','C12','C11']);
assert.equal(result(heartTransferOverlap,afterHeartTransfer).exp,null,
  'overlap between 2S one-round force and 3m game force has no source priority');

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

const invitEightHearts=hand(['H14','H13','H2','H3','H4','S11','S2','S3','D2','D3','D4','C2','C3']);
assert.equal(R.H(invitEightHearts).hp,8);
assert.equal(R.H(invitEightHearts).bal,true);
assert.equal(result(invitEightHearts,afterHeartTransfer).exp,'2N','8 hp starts the invit band');

const invitSixHearts=hand(['H13','H12','H11','H10','H9','H8','S13','S2','D2','D3','D4','C2','C3']);
assert.equal(R.H(invitSixHearts).hp,9);
assert.equal(R.H(invitSixHearts).bal,false);
assert.equal(result(invitSixHearts,afterHeartTransfer).exp,'3H','8–9 hp and 6+ hearts: 3H invite');

const gameFiveHearts=hand(['H14','H13','H12','H11','H9','S13','S2','S3','D2','D3','D4','C2','C3']);
assert.equal(R.H(gameFiveHearts).hp,13);
assert.equal(R.H(gameFiveHearts).bal,true);
assert.equal(result(gameFiveHearts,afterHeartTransfer).exp,'3N','10–15 hp, balanced exact five hearts: 3NT');

const gameTenHearts=hand(['H14','H13','H2','H3','H4','S12','S11','S2','D2','D3','D4','C2','C3']);
assert.equal(R.H(gameTenHearts).hp,10);
assert.equal(R.H(gameTenHearts).bal,true);
assert.equal(result(gameTenHearts,afterHeartTransfer).exp,'3N','10 hp starts the game band');

const gameFifteenSixHearts=hand(['H14','H13','H2','H3','H4','H5','S14','S13','D11','D2','D3','C2','C3']);
assert.equal(R.H(gameFifteenSixHearts).hp,15);
assert.equal(result(gameFifteenSixHearts,afterHeartTransfer).exp,'4H','15 hp remains in the 10–15 game band');

const overFifteenSixHearts=hand(['H14','H13','H2','H3','H4','H5','S14','S13','D12','D2','D3','C2','C3']);
assert.equal(R.H(overFifteenSixHearts).hp,16);
assert.equal(result(overFifteenSixHearts,afterHeartTransfer).exp,null,'16+ hp has no defined continuation in this table');

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
// Direct 3NT at the user-confirmed 26 combined-HCP threshold remains
// authoritative; unverified 2NT-invite bands and the weak-relay numeric
// band stay provisional until their exact thresholds are confirmed.
for(const id of ['T09_1NT_DIREKT_3NT','T18_1NT_3NT_DIREKT']){
  const tree=lib.trees.find(t=>t.id===id);
  assert.ok(tree);
  assert.equal(A.treeCompatible(tree),true,id+' has a verified direct 3NT threshold');
}
for(const id of ['T04_INVIT_2NT_PASS','T06_STAYMAN_INGEN_HOGFARG']){
  const tree=lib.trees.find(t=>t.id===id);
  assert.ok(tree);
  assert.equal(tree.sourceStatus,'provisional_source_gap');
  assert.equal(A.treeCompatible(tree),false,id+' contains an unverified strength boundary');
}
const weakRelayTree=lib.trees.find(t=>t.id==='T42_1NT_SVAG_LAGFARGSRELA');
assert.ok(weakRelayTree);
assert.equal(weakRelayTree.sourceStatus,'source_qualitative');
assert.equal(A.treeCompatible(weakRelayTree),true,
  'weak relay meaning remains source-aligned qualitatively; numeric hand selection stays uncovered');
assert.ok(weakRelayTree.conditions.some(x=>/dåliga kort/i.test(x)));
assert.ok(!JSON.stringify(weakRelayTree).match(/under 8|0–7 hp|0-7 hp/i),
  'weak relay tree must not invent a numeric HP boundary');
// Verify the weak 2♠ relay continuations independently of the
// unquantified initial "weak/bad cards" selection condition.
function nodeAt(seat,auction,ownHand){
  const other=deck.filter(c=>!ownHand.includes(c));
  const used=new Set(ownHand);
  const hands={};hands[seat]=ownHand.slice();
  const opponents=['N','E','S','W'].filter(x=>x!==seat);
  for(let i=0;i<opponents.length;i++)hands[opponents[i]]=other.slice(i*13,(i+1)*13);
  const bids=auction.concat([{s:seat,c:'P'}]);
  return R.nodeForRaw({hands,dealer:'N',bids},bids.length-1);
}
const relayAuction=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2S'},{s:'W',c:'P'}
];
const openerClubsLonger=hand(['C13','C12','C11','C10','C2','D13','D2','D3','H14','H2','H3','S13','S3']);
assert.ok(R.H(openerClubsLonger).hp>=15&&R.H(openerClubsLonger).hp<=17);
assert.equal(nodeAt('N',relayAuction,openerClubsLonger).exp,'3C',
 'opener shows longer clubs with 3C');

const openerDiamondsLonger=hand(['D13','D12','D11','D10','D2','C13','C2','C3','H14','H2','H3','S14','S3']);
assert.ok(R.H(openerDiamondsLonger).hp>=15&&R.H(openerDiamondsLonger).hp<=17);
assert.equal(nodeAt('N',relayAuction,openerDiamondsLonger).exp,'2N',
 'opener shows longer diamonds with 2NT');

const afterRelay2NT=relayAuction.concat([{s:'N',c:'2N'},{s:'E',c:'P'}]);
const responderClubsLonger=hand(['C13','C12','C11','C10','C2','D13','D2','D3','H2','H3','H4','S2','S3']);
assert.equal(nodeAt('S',afterRelay2NT,responderClubsLonger).exp,'3C',
 'after 2NT responder signs off in clubs when clubs are at least as long');

const responderDiamondsLonger=hand(['D13','D12','D11','D10','D2','C13','C2','C3','H2','H3','H4','S2','S3']);
assert.equal(nodeAt('S',afterRelay2NT,responderDiamondsLonger).exp,'3D',
 'after 2NT responder signs off in diamonds when diamonds are longer');

const afterRelay3C=relayAuction.concat([{s:'N',c:'3C'},{s:'E',c:'P'}]);
assert.equal(nodeAt('S',afterRelay3C,responderClubsLonger).exp,'P',
 'after opener 3C responder passes when clubs are at least as long');
assert.equal(nodeAt('S',afterRelay3C,responderDiamondsLonger).exp,'3D',
 'after opener 3C responder corrects to longer diamonds');

const afterRelaySignoff=afterRelay2NT.concat([{s:'S',c:'3C'},{s:'W',c:'P'}]);
assert.equal(nodeAt('N',afterRelaySignoff,openerClubsLonger).exp,'P',
 'opener passes after responder signs off in a minor');
// The transfer table defines the responder's invite but not opener's
// acceptance criteria. Even when the hidden hands happen to total 26, the
// engine must not import an unrelated 26-point major-game rule.
function openerAfterTransfer(north,south,sequence){
  const used=new Set([...north,...south]);
  assert.equal(used.size,26,'opener and responder hands must not overlap');
  const rest=deck.filter(c=>!used.has(c));
  const hands={N:north.slice(),S:south.slice(),E:rest.slice(0,13),W:rest.slice(13,26)};
  const bids=sequence.concat([{s:'N',c:'P'}]);
  return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}
const inviteOpener17=['H2','H3','H4','S14','S13','S12','D14','D13','D2','C11','C2','C3','C4'];
assert.equal(R.H(inviteOpener17).hp,17);
const responderFiveHeartInvite=['H13','H12','H11','H5','H6','S2','S3','S4','D5','D6','D7','C13','C6'];
assert.equal(R.H(responderFiveHeartInvite).hp,9);
const openerAfterFiveHeartInvite=openerAfterTransfer(
  inviteOpener17,responderFiveHeartInvite,
  [{s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
   {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'}]
);
assert.equal(openerAfterFiveHeartInvite.exp,null,
  'opener acceptance after 2NT transfer invite is not numerically defined by the source');

const responderSixHeartInvite=['H13','H12','H11','H5','H6','H7','S2','S3','D5','D6','D7','C13','C6'];
assert.equal(R.H(responderSixHeartInvite).hp,9);
const openerAfterSixHeartInvite=openerAfterTransfer(
  inviteOpener17,responderSixHeartInvite,
  [{s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
   {s:'N',c:'2H'},{s:'E',c:'P'},{s:'S',c:'3H'},{s:'W',c:'P'}]
);
assert.equal(openerAfterSixHeartInvite.exp,null,
  'opener acceptance after 3H transfer invite is not numerically defined by the source');
console.log('1NT transfer source-boundary tests: passed.');
