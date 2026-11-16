'use strict';

// Live 1NT decisions must use only the acting player's 13 cards and public
// auction. Hidden hands supplied as an extra payload must have no influence.
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
const deck=[];
for(const suit of ['S','H','D','C'])for(let rank=2;rank<=14;rank++)deck.push(suit+rank);

function fill(cards){
 const out=cards.slice();
 for(const c of deck){if(out.length===13)break;if(!out.includes(c))out.push(c);}
 assert.equal(out.length,13);assert.equal(new Set(out).size,13);return out;
}
function live(seat,auction,ownHand,extra){
 return R.decideLive(Object.assign({seat,dealer:'N',auction,ownHand},extra||{}));
}
const firstResponse=[{s:'N',c:'1N'},{s:'E',c:'P'}];
const fiveHearts=fill(['H2','H3','H4','H5','H6','S2','S3','S4','D2','D3','D4','C2','C3']);
const hiddenA=fill(deck.filter(c=>!fiveHearts.includes(c)).slice(0,13));
const hiddenB=fill(deck.filter(c=>!fiveHearts.includes(c)).slice(13,26));
const liveA=live('S',firstResponse,fiveHearts,{hands:{N:hiddenA}});
const liveB=live('S',firstResponse,fiveHearts,{hands:{N:hiddenB}});
assert.equal(liveA.exp,'2D','five hearts: transfer to hearts');
assert.equal(liveA.why,liveB.why,'changing hidden hands must not change live explanation');
assert.equal(liveA.exp,liveB.exp,'changing hidden hands must not change live recommendation');

const opener17=fill(['H14','H13','H12','H11','S14','D13','C2','C3','C4','S2','S3','D2','D3']);
assert.equal(R.H(opener17).hp,17);
assert.equal(live('N',[...firstResponse,{s:'S',c:'2D'},{s:'W',c:'P'}],opener17).exp,'3H',
 'opener may superaccept with 17 hp and 4+ hearts');

const afterCompletedHeartTransfer=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2D'},{s:'W',c:'P'},
 {s:'N',c:'2H'},{s:'E',c:'P'}
];
const inviteFiveHearts=fill(['H13','H12','H11','H10','H9','S13','S2','S3','D2','D3','D4','C2','C3']);
assert.equal(live('S',afterCompletedHeartTransfer,inviteFiveHearts).exp,null,
 'balanced exact five-card transfer suit: invite is described but no numeric strength threshold is specified');

// Opener's acceptance after a natural 2NT invitation uses the
// later-confirmed 25-HCP no-trump game threshold, but live play cannot see
// responder's hidden cards.
const natural2NTAuction=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2N'},{s:'W',c:'P'}
];
const opener16ForInvite=fill(['S14','S13','S2','S3','H14','H2','H3','D14','D2','D3','C11','C2','C3']);
assert.equal(R.H(opener16ForInvite).hp,16);
assert.equal(live('N',natural2NTAuction,opener16ForInvite).exp,null,
 'live opener cannot accept/pass a 2NT invite from hidden responder HCP');
function judgeNatural2NT(responderHand){
 const opener=['S14','S13','S2','S3','H14','H2','H3','D14','D2','D3','C11','C2','C3'];
 const used=new Set([...opener,...responderHand]);
 assert.equal(used.size,26);
 const rest=deck.filter(c=>!used.has(c));
 const hands={N:opener,E:rest.slice(0,13),S:responderHand,W:rest.slice(13,26)};
 const bids=natural2NTAuction.concat([{s:'N',c:'P'}]);
 return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}
const responderEight=['C14','C4','C5','C6','D13','D4','D5','H4','H5','H6','S11','S4','S5'];
const responderNine=['C14','C4','C5','C6','D13','D4','D5','H11','H4','H5','S11','S4','S5'];
assert.equal(R.H(responderEight).hp,8);
assert.equal(R.H(responderNine).hp,9);
assert.equal(judgeNatural2NT(responderEight).exp,'P',
 '16+8=24 HCP: opener declines the natural 2NT invitation');
assert.equal(judgeNatural2NT(responderNine).exp,'3N',
 '16+9=25 HCP: opener accepts at the confirmed 25-HCP no-trump game threshold');
const responderTen=['C14','C4','C5','C6','D13','D4','D5','H12','H4','H5','S11','S4','S5'];
assert.equal(R.H(responderTen).hp,10);
assert.equal(judgeNatural2NT(responderTen).exp,'3N',
 '16+10=26 HCP: opener accepts at the confirmed no-trump game threshold');

// The same 25-HCP no-trump threshold applies when Stayman finds no
// major and responder's 2NT is a balanced invitation.
function judgeStayman2NT(responderHand){
 const opener=['C14','C13','C2','C3','D14','D13','D11','D2','S11','S2','S3','H2','H3'];
 assert.equal(R.H(opener).hp,16);
 assert.equal(R.H(opener).bal,true);
 const used=new Set([...opener,...responderHand]);assert.equal(used.size,26);
 const rest=deck.filter(c=>!used.has(c));
 const hands={N:opener,E:rest.slice(0,13),S:responderHand,W:rest.slice(13,26)};
 const auction=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2C'},{s:'W',c:'P'},
  {s:'N',c:'2D'},{s:'E',c:'P'},
  {s:'S',c:'2N'},{s:'W',c:'P'}
 ];
 const bids=auction.concat([{s:'N',c:'P'}]);
 return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}
assert.equal(judgeStayman2NT(responderEight).exp,'P',
 '16+8=24 HCP after Stayman 2D: opener declines the invitation');
assert.equal(judgeStayman2NT(responderNine).exp,'3N',
 '16+9=25 HCP after Stayman 2D: opener accepts at the confirmed threshold');

const staymanAfter2H=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2C'},{s:'W',c:'P'},
 {s:'N',c:'2H'},{s:'E',c:'P'}
];
const fiveSpades=fill(['S14','S13','S12','S11','S10','H2','H3','H4','D2','D3','D4','C2','C3']);
assert.equal(live('S',staymanAfter2H,fiveSpades).exp,'2S',
 'natural game-forcing new suit after Stayman is live-safe');

const fourFourOpener=fill(['S14','S13','S2','S3','H14','H10','H2','H3','D13','D12','D2','C2','C3']);
const afterStayman2NT=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2C'},{s:'W',c:'P'},
 {s:'N',c:'2H'},{s:'E',c:'P'},
 {s:'S',c:'2N'},{s:'W',c:'P'}
];
assert.equal(live('N',afterStayman2NT,fourFourOpener).exp,'3S',
 'explicit Stayman 4-4 continuation can be decided from opener hand alone');

const balancedEight=fill(['C14','C13','C2','C3','D2','D3','D4','H11','H2','H3','S2','S3','S4']);
assert.equal(R.H(balancedEight).hp,8);
assert.equal(R.H(balancedEight).bal,true);
assert.equal(live('S',firstResponse,balancedEight).exp,null,
 'the source describes a natural 2NT invitation but gives no numeric responder HCP band');

const balancedTen=fill(['C14','C13','C2','C3','D13','D2','D3','H2','H3','H4','S2','S3','S4']);
assert.equal(R.H(balancedTen).hp,10);
assert.equal(live('S',firstResponse,balancedTen).exp,'3N',
 '10 own HCP plus partner minimum reaches the confirmed 25-HCP 3NT threshold');
const balancedNine=fill(['C14','C2','C3','D13','D2','D3','H2','H3','H4','S11','S2','S3','S4']);
assert.equal(R.H(balancedNine).hp,9);
assert.equal(live('S',firstResponse,balancedNine).exp,null,
 '9 own HCP plus partner minimum reaches only 24 HCP; no numeric invit band is stated');
const balancedEleven=fill(['C14','C13','C2','C3','D13','D2','D3','H2','H3','H4','S11','S2','S3']);
assert.equal(R.H(balancedEleven).hp,11);
assert.equal(live('S',firstResponse,balancedEleven).exp,'3N',
 '11 own HCP also guarantees the confirmed 25-HCP 3NT threshold');

const afterTransfer3NTChoice=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2D'},{s:'W',c:'P'},
 {s:'N',c:'2H'},{s:'E',c:'P'},
 {s:'S',c:'3N'},{s:'W',c:'P'}
];
const openerWithThreeHearts=fill(['H14','H13','H12','S14','S2','S3','D13','D2','D3','C2','C3','C4','C5']);
assert.equal(live('N',afterTransfer3NTChoice,openerWithThreeHearts).exp,null,
 'opener correction with 3+ hearts after responder chooses 3NT is not defined in the source');
const openerWithoutThreeHearts=fill(['S14','S13','S12','D14','D13','D2','D3','C2','C3','C4','C5','H2','H3']);
assert.equal(live('N',afterTransfer3NTChoice,openerWithoutThreeHearts).exp,'P',
 'opener passes 3NT game-choice bid without 3+ hearts');

// The 2♠ relay's later choices are live-safe: each is based on the
// acting player's own minor-suit lengths, not partner's hidden cards.
const relay2NTAuction=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2S'},{s:'W',c:'P'},
 {s:'N',c:'2N'},{s:'E',c:'P'}
];
const relayResponderClubs=fill(['C13','C12','C11','C10','C2','D13','D2','D3','H2','H3','H4','S2','S3']);
assert.equal(live('S',relay2NTAuction,relayResponderClubs).exp,'3C',
 'after 2NT responder selects the longer clubs as signoff');
const relayOpenerAuction=relay2NTAuction.concat([{s:'S',c:'3C'},{s:'W',c:'P'}]);
const relayOpenerClubsLonger=fill(['C13','C12','C11','C10','C2','D13','D2','D3','H14','H2','H3','S13','S3']);
assert.equal(live('N',relayOpenerAuction,relayOpenerClubsLonger).exp,'P',
 'opener passes after responder signs off in 3C');

// 1NT–3m is invitational with a good 6+ minor. The source only
// defines opener's response with xx/xxx (pass) or a top honour (3NT).
const weakNoMajorBalanced=fill(['C13','C12','C11','C2','H2','H3','H4','D2','D3','D4','S2','S3','S4']);
assert.equal(R.H(weakNoMajorBalanced).hp,6);
assert.equal(R.H(weakNoMajorBalanced).bal,true);
assert.equal(live('S',firstResponse,weakNoMajorBalanced).exp,null,
 'a weak balanced hand without a major has no numeric pass boundary in the source');

const afterMinorInvite=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'3C'},{s:'W',c:'P'}
];
const openerWithTwoSmallClubs=fill(['S14','S13','S2','S3','H14','H12','H2','H3','D13','D2','D3','C2','C3']);
assert.equal(R.H(openerWithTwoSmallClubs).hp,16);
assert.equal(live('N',afterMinorInvite,openerWithTwoSmallClubs).exp,'P',
 'opener passes with xx in the invited minor');
const openerWithThreeSmallClubs=fill(['S14','S13','S2','S3','H14','H12','H2','D13','D2','D3','C2','C3','C4']);
assert.equal(R.H(openerWithThreeSmallClubs).hp,16);
assert.equal(live('N',afterMinorInvite,openerWithThreeSmallClubs).exp,'P',
 'opener passes with xxx in the invited minor');
const openerWithClubTopHonor=fill(['S14','S13','S2','S3','H14','H2','H3','D13','D2','D3','C13','C2','C3']);
assert.equal(R.H(openerWithClubTopHonor).hp,17);
assert.equal(live('N',afterMinorInvite,openerWithClubTopHonor).exp,'3N',
 'opener searches for 3NT with a top honor in the invited minor');
const openerWithFourSmallClubs=fill(['C2','C3','C4','C5','S14','S13','S2','S3','H14','H12','H2','D13','D2']);
assert.equal(R.H(openerWithFourSmallClubs).hp,16);
assert.equal(live('N',afterMinorInvite,openerWithFourSmallClubs).exp,null,
 'four small cards are not covered by the stated xx/xxx or top-honor cases');

// After Stayman 2♦ opener denies a four-card major. Eleven own HCP
// guarantee 26 combined HCP against the 15-HCP minimum; ten do not.
const staymanNoMajorAuction=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2C'},{s:'W',c:'P'},
 {s:'N',c:'2D'},{s:'E',c:'P'}
];
const staymanElevenBalanced=fill(['S14','S13','S2','S3','H12','H11','H2','H3','D2','D3','D4','C11','C2']);
assert.equal(R.H(staymanElevenBalanced).hp,11);
assert.equal(R.H(staymanElevenBalanced).bal,true);
assert.equal(live('S',staymanNoMajorAuction,staymanElevenBalanced).exp,'3N',
 '11 own HCP after Stayman 2D guarantees 25+ combined HCP against the 15-HCP minimum');
const staymanTenBalanced=fill(['S14','S13','S2','S3','H12','H11','H2','H3','D2','D3','D4','C2','C3']);
assert.equal(R.H(staymanTenBalanced).hp,10);
assert.equal(live('S',staymanNoMajorAuction,staymanTenBalanced).exp,'3N',
 '10 own HCP already guarantees the 25-HCP 3NT threshold after Stayman 2D');

// 4M after a completed transfer is explicitly a signoff; opener passes.
const afterHeartTransferSignoff=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2D'},{s:'W',c:'P'},
 {s:'N',c:'2H'},{s:'E',c:'P'},
 {s:'S',c:'4H'},{s:'W',c:'P'}
];
assert.equal(live('N',afterHeartTransferSignoff,openerWithThreeHearts).exp,'P',
 'opener passes after heart-transfer 4H signoff');
const afterSpadeTransferSignoff=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2H'},{s:'W',c:'P'},
 {s:'N',c:'2S'},{s:'E',c:'P'},
 {s:'S',c:'4S'},{s:'W',c:'P'}
];
const openerWithThreeSpades=fill(['S14','S13','S12','H14','H2','H3','D13','D2','D3','C2','C3','C4','C5']);
assert.equal(R.H(openerWithThreeSpades).hp,16);
assert.equal(live('N',afterSpadeTransferSignoff,openerWithThreeSpades).exp,'P',
 'opener passes after spade-transfer 4S signoff');

const naturalInvite=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2N'},{s:'W',c:'P'}
];
const opener16=fill(['S14','S13','S12','H14','H13','D14','D13','C2','C3','C4','S2','H2','D2']);
const inviteResult=live('N',naturalInvite,opener16);
assert.equal(inviteResult.exp,null,
 'opener must not accept/reject 2NT invite using partner hidden HCP');

console.log('Information-safe live 1NT tests: passed.');
