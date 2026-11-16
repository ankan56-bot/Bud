'use strict';

// Conservative source-aligned checks for 1NT transfer continuations.
// Nordisk standard 2012-08-22, page 5: transfer strength descriptions are
// qualitative; the separate weak 2♠ minor relay is also qualitative.
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

const fiveFiveMajors=['S13','S2','S3','S4','S5','H13','H12','H11','H4','H5','D2','D3','C2'];
const fiveFiveMajorResponse=result(fiveFiveMajors,afterOneNT);
assert.equal(fiveFiveMajorResponse.exp,'2H',
  '5-5 majors uses the spade transfer so the documented 3H invit route is available');
assert.ok(fiveFiveMajorResponse.alt.includes('2D'),
  'heart transfer remains an alternative when holding 5-5 majors');

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

const fiveFiveMajorsAfterTransfer=hand(['S13','S2','S3','S4','S5','H13','H12','H11','H4','H5','D2','D3','C2']);
const fiveFiveMajorsResult=result(fiveFiveMajorsAfterTransfer,afterSpadeTransfer);
assert.equal(fiveFiveMajorsResult.exp,null,
  '5-5 majors identifies the invit profile, but strength is unquantified');
assert.match(fiveFiveMajorsResult.means('3H'),/Invit med minst 5-5/i);

const heartTransferOverlap=hand(['H14','H13','H12','H11','H10','S14','S13','S12','S11','C14','C13','C12','C11']);
assert.equal(result(heartTransferOverlap,afterHeartTransfer).exp,null,
  'overlap between 2S one-round force and 3m game force has no source priority');
// The same source table also gives meanings for 4m control bids,
// 4M signoff and 4NT RKC. These are exposed as candidate meanings even
// where the source does not give enough strength/priority to recommend one.
const bothMinorControlHand=hand(['H14','H13','H12','H11','H10','C14','C13','C12','C11','D14','D13','D12','D11']);
const bothMinorControl=result(bothMinorControlHand,afterHeartTransfer);
assert.equal(bothMinorControl.exp,null);
assert.match(bothMinorControl.means('4C'),/Kontrollbud och slamintresse/i);
assert.match(bothMinorControl.means('4D'),/Kontrollbud och slamintresse/i);

const balancedFiveHeartSignoff=hand(['H14','H13','H12','H11','H10','S14','S13','S2','D14','D13','D2','C2','C3']);
const heartTransferCandidates=result(balancedFiveHeartSignoff,afterHeartTransfer);
assert.equal(heartTransferCandidates.exp,null);
assert.match(heartTransferCandidates.means('4H'),/Slutbud/i);
assert.match(heartTransferCandidates.means('4N'),/RKC/i);

// The PDF gives qualitative meanings but no numerical HP bands for
// weak / invitation / game-choice after transfer. The engine must not
// infer 0–7, 8–9 or 10–15 from this source.
const balancedFiveHearts=hand(['H14','H13','H12','H11','H10','S14','S13','S12','D14','D13','D12','C14','C13']);
assert.equal(result(balancedFiveHearts,afterHeartTransfer).exp,null,
  'balanced exact five-card transfer suit: no invented invit/game HCP boundary');
const weakFiveHearts=hand(['H9','H8','H7','H6','H5','S14','S2','S3','D13','D2','D3','C2','C3']);
const invitFiveHearts=hand(['H13','H12','H11','H10','H9','S13','S2','S3','D2','D3','D4','C2','C3']);
const gameFiveHearts=hand(['H14','H13','H12','H11','H9','S13','S2','S3','D2','D3','D4','C2','C3']);
for(const h of [weakFiveHearts,invitFiveHearts,gameFiveHearts]){
  assert.equal(result(h,afterHeartTransfer).exp,null,
    'different HCP totals do not create an unsupported source band');
}
const invitSixHearts=hand(['H13','H12','H11','H10','H9','H8','S13','S2','D2','D3','D4','C2','C3']);
const gameSixHearts=hand(['H13','H12','H11','H10','H9','H8','S14','S13','D2','D3','D4','C2','C3']);
assert.equal(result(invitSixHearts,afterHeartTransfer).exp,null,
  '6+ hearts: no numerical invit/game choice boundary');
assert.equal(result(gameSixHearts,afterHeartTransfer).exp,null,
  'same 6+ shape with more HCP remains unclassified without a source boundary');
const fiveFiveSpade=hand(['S13','S12','S11','S10','S9','H13','H12','H11','H10','H9','D2','D3','C2']);
assert.equal(result(fiveFiveSpade,afterSpadeTransfer).exp,null,
  '5-5 majors still lacks the numeric strength threshold for invit 3H');

// Transfer trees retain the source meanings, but are not authoritative for
// strength classification because the source gives no numerical boundaries.
for(const id of ['T03_OVERFORING_PASS','T07_OVERFORING_HJARTER','T08_OVERFORING_SPADER']){
  const tree=lib.trees.find(t=>t.id===id);
  assert.ok(tree, 'expected source-aligned transfer tree '+id);
  assert.equal(tree.sourceStatus,'source_qualitative',id+' retains source-backed meanings but no numeric strength bands');
  assert.equal(A.treeCompatible(tree),true,id+' may be shown as qualitative analysis, not numeric classification');
}
for(const id of ['T19','T20','T27_OVERFORING_HJARTER_SEXKORT_INVIT','T28_OVERFORING_SPADER_SEXKORT_INVIT']){
  const tree=lib.trees.find(t=>t.id===id);
  assert.ok(tree, 'expected documented invitation tree '+id);
  assert.equal(tree.sourceStatus,'provisional_source_gap',id+' remains provisional because opener acceptance is not specified');
  assert.equal(A.treeCompatible(tree),false,id+' must not be matched as authoritative');
}
// The user-confirmed 25-HCP no-trump game threshold is an explicit
// project rule, distinct from the source's qualitative 3NT description.
for(const id of ['T09_1NT_DIREKT_3NT','T18_1NT_3NT_DIREKT']){
  const tree=lib.trees.find(t=>t.id===id);
  assert.ok(tree);
  assert.equal(tree.sourceStatus,'user_confirmed');
  assert.equal(A.treeCompatible(tree),true,id+' must expose the user-confirmed 25-HCP 3NT threshold');
}
for(const id of ['T04_INVIT_2NT_PASS','T06_STAYMAN_INGEN_HOGFARG']){
  const tree=lib.trees.find(t=>t.id===id);
  assert.ok(tree);
  assert.equal(tree.sourceStatus,'provisional_source_gap');
  assert.equal(A.treeCompatible(tree),false,id+' contains an unverified strength boundary');
}
const weakRelayTree=lib.trees.find(t=>t.id==='T42_1NT_SVAG_LAGFARGSRELA');
assert.ok(weakRelayTree);
const relayAfter2NT=weakRelayTree.nodes.find(n=>n.id==='t42_n2');
assert.match(relayAfter2NT.meaning,/ingen prioritet/i);
assert.match(relayAfter2NT.analysis,/vid lika längd.*EJ TÄCKT/i);
assert.doesNotMatch(JSON.stringify(weakRelayTree),/vid lika längd väljs klöver/i);
for(const [treeId,bid,label] of [
  ['T03_OVERFORING_PASS','4♥','minst fem hjärter'],
  ['T07_OVERFORING_HJARTER','4♥','minst fem hjärter'],
  ['T08_OVERFORING_SPADER','4♠','minst fem spader']
]){
  const tree=lib.trees.find(t=>t.id===treeId);
  const node=tree.nodes.find(n=>n.sequence.length===5);
  const branch=node.branches.find(b=>b.call===bid);
  assert.ok(branch);
  assert.match(branch.label,new RegExp(label));
}
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
// Opener's superaccept after transfer: maximum 17 HCP and 4+
// cards in the transfer suit may raise directly to three of the major.
const beforeHeartTransfer=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2D'},{s:'W',c:'P'}
];
const maxWithFourHearts=['H14','H13','H2','H3','S14','S12','S2','D13','D2','D3','C11','C2','C3'];
assert.equal(R.H(maxWithFourHearts).hp,17);
assert.equal(R.H(maxWithFourHearts).L.H,4);
assert.equal(nodeAt('N',beforeHeartTransfer,maxWithFourHearts).exp,'3H',
  '17 HCP and four hearts: heart superaccept');
const maxWithFourSpades=['S14','S13','S2','S3','H14','H12','H2','D13','D2','D3','C11','C2','C3'];
assert.equal(R.H(maxWithFourSpades).hp,17);
assert.equal(R.H(maxWithFourSpades).L.S,4);
const beforeSpadeTransfer=beforeHeartTransfer.map((b,i)=>i===2?{s:'S',c:'2H'}:b);
assert.equal(nodeAt('N',beforeSpadeTransfer,maxWithFourSpades).exp,'3S',
  '17 HCP and four spades: spade superaccept');
const seventeenMinusOne=maxWithFourHearts.map(c=>c==='C11'?'C10':c);
assert.equal(R.H(seventeenMinusOne).hp,16);
assert.equal(nodeAt('N',beforeHeartTransfer,seventeenMinusOne).exp,'2H',
  '16 HCP and four hearts: normal transfer completion, not superaccept');
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
 'after 2NT responder signs off in clubs when clubs are longer');

const responderDiamondsLonger=hand(['D13','D12','D11','D10','D2','C13','C2','C3','H2','H3','H4','S2','S3']);
assert.equal(nodeAt('S',afterRelay2NT,responderDiamondsLonger).exp,'3D',
 'after 2NT responder signs off in diamonds when diamonds are longer');

const responderMinorsEqual=hand(['D13','D12','D11','D2','D3','C13','C12','C11','C2','H2','H3','S2','S3']);
const equalAfter2NT=nodeAt('S',afterRelay2NT,responderMinorsEqual);
assert.equal(equalAfter2NT.exp,null,
 'after 2NT equal minor lengths have no source-defined signoff priority');
assert.match(equalAfter2NT.why,/ingen prioritet vid lika längd/i);

const afterRelay3C=relayAuction.concat([{s:'N',c:'3C'},{s:'E',c:'P'}]);
assert.equal(nodeAt('S',afterRelay3C,responderClubsLonger).exp,'P',
 'after opener 3C responder passes when clubs are longer');
assert.equal(nodeAt('S',afterRelay3C,responderDiamondsLonger).exp,'3D',
 'after opener 3C responder corrects to longer diamonds');
const equalAfter3C=nodeAt('S',afterRelay3C,responderMinorsEqual);
assert.equal(equalAfter3C.exp,null,
 'after opener 3C equal minor lengths have no source-defined signoff priority');
assert.match(equalAfter3C.why,/ingen prioritet vid lika längd/i);

const afterRelaySignoff=afterRelay2NT.concat([{s:'S',c:'3C'},{s:'W',c:'P'}]);
assert.equal(nodeAt('N',afterRelaySignoff,openerClubsLonger).exp,'P',
 'opener passes after responder signs off in a minor');
// The transfer table defines the responder's invite but not opener's
// acceptance criteria. Even when the hidden hands happen to total 26, the engine must not
// use the responder's hidden hand to decide the no-trump game choice live.
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
// The source says responder's 3NT is the chosen game after a balanced
// five-card transfer hand. It does not say whether opener should correct
// to 4M with three-card support, so that case remains uncovered.
const afterTransfer3NT=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2D'},{s:'W',c:'P'},
 {s:'N',c:'2H'},{s:'E',c:'P'},
 {s:'S',c:'3N'},{s:'W',c:'P'}
];
const openerThreeHearts=hand(['C14','C13','C12','C2','C3','D14','D2','D3','H14','H2','H3','S2','S3']);
assert.equal(R.H(openerThreeHearts).hp,17);
assert.equal(R.H(openerThreeHearts).L.H,3);
assert.equal(nodeAt('N',afterTransfer3NT,openerThreeHearts).exp,null,
  '3+ support after transfer 3NT has no source-defined correction');
const openerTwoHearts=hand(['C14','C13','C12','C2','C3','D14','D2','D3','H2','H3','S14','S2','S3']);
assert.equal(R.H(openerTwoHearts).hp,17);
assert.equal(R.H(openerTwoHearts).L.H,2);
assert.equal(nodeAt('N',afterTransfer3NT,openerTwoHearts).exp,'P',
  'opener passes on responder-selected 3NT without three-card support');

console.log('1NT transfer source-boundary tests: passed.');
