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
assert.equal(live('S',afterCompletedHeartTransfer,inviteFiveHearts).exp,'2N',
 '8–9 hp, balanced exact five-card transfer suit: invite 2NT');

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
assert.equal(live('S',firstResponse,balancedTen).exp,null,
 '10 hp cannot guarantee 26 combined hp against partner range 15–17');
const balancedEleven=fill(['C14','C13','C2','C3','D13','D2','D3','H2','H3','H4','S11','S2','S3']);
assert.equal(R.H(balancedEleven).hp,11);
assert.equal(live('S',firstResponse,balancedEleven).exp,'3N',
 '11 hp guarantees 26 combined hp even opposite a 15 hp 1NT opening');

const afterTransfer3NTChoice=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2D'},{s:'W',c:'P'},
 {s:'N',c:'2H'},{s:'E',c:'P'},
 {s:'S',c:'3N'},{s:'W',c:'P'}
];
const openerWithThreeHearts=fill(['H14','H13','H12','S14','S2','S3','D13','D2','D3','C2','C3','C4','C5']);
assert.equal(live('N',afterTransfer3NTChoice,openerWithThreeHearts).exp,'4H',
 'opener chooses 4H over 3NT when 3+ hearts support the game-choice bid');
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
 '11 own HCP guarantees the 26-HCP 3NT game after Stayman 2D');
const staymanTenBalanced=fill(['S14','S13','S2','S3','H12','H11','H2','H3','D2','D3','D4','C2','C3']);
assert.equal(R.H(staymanTenBalanced).hp,10);
assert.equal(live('S',staymanNoMajorAuction,staymanTenBalanced).exp,null,
 '10 own HCP cannot guarantee 26 and no unverified invitation band is assumed');

const naturalInvite=[
 {s:'N',c:'1N'},{s:'E',c:'P'},
 {s:'S',c:'2N'},{s:'W',c:'P'}
];
const opener16=fill(['S14','S13','S12','H14','H13','D14','D13','C2','C3','C4','S2','H2','D2']);
const inviteResult=live('N',naturalInvite,opener16);
assert.equal(inviteResult.exp,null,
 'opener must not accept/reject 2NT invite using partner hidden HCP');

console.log('Information-safe live 1NT tests: passed.');
