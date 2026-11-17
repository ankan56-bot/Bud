'use strict';
const assert=require('node:assert/strict');
const factory=require('../2kloveroppning.js');

const api={
  SU:['C','D','H','S'],
  SYM:{C:'♣',D:'♦',H:'♥',S:'♠',N:'NT'},
  NAME:{},
  side:s=>s==='N'||s==='S'?0:1,
  partner:s=>({N:'S',S:'N',E:'W',W:'E'}[s]),
  isBid:c=>/^[1-7][CDHSN]$/.test(c),
  lv:c=>Number(c[0]),
  st_:c=>c[1],
  rk:c=>Number(c[0])*5+'CDHSN'.indexOf(c[1]),
  txt:c=>c,
  maj:s=>s==='H'||s==='S',
  lowest:(s,above)=>{for(let l=1;l<=7;l++){const b=l+s;if(!above||Number(b[0])*5+'CDHSN'.indexOf(b[1])>Number(above[0])*5+'CDHSN'.indexOf(above[1]))return b;}return null;},
  jump:()=>null,H:()=>null,handHps:()=>0,partnershipPoints:()=>0,T:m=>c=>m[c]||null,
  ok:()=>true,NC:(why,means,conv,sourceGap)=>({exp:null,alt:[],why,means:means||(()=>null),conv:conv||'test',sourceGap:!!sourceGap})
};
const twoClub=factory(api);

// The user's selected response is unconditional: no strength or shape alternative.
for(const hand of [
  {hp:0,bal:false,L:{C:0,D:0,H:0,S:0}},
  {hp:5,bal:true,L:{C:1,D:4,H:4,S:4}},
  {hp:12,bal:false,L:{C:6,D:2,H:3,S:2}},
  {hp:20,bal:true,L:{C:3,D:3,H:3,S:4}}
]){
  const response=twoClub.resp2c(hand);
  assert.equal(response.exp,'2D');
  assert.deepEqual(response.alt,[]);
}

// Opening: retain the existing strong-opening thresholds.
assert.equal(twoClub.opening({hp:19,bal:false}),null);
assert.equal(twoClub.opening({hp:20,bal:false}).exp,'2C');
assert.equal(twoClub.opening({hp:21,bal:true}),null);
assert.equal(twoClub.opening({hp:22,bal:true}).exp,'2C');

// Exact balanced rebid ranges after 2C-2D.
for(const hp of [22,23,24]){
  const r=twoClub.reb2c({hp,bal:true,L:{}},'2D');
  assert.equal(r.exp,'2N',hp+' hp must rebid 2NT');
  assert.match(r.why,/22-24/);
}
for(const hp of [25,26,27]){
  const r=twoClub.reb2c({hp,bal:true,L:{}},'2D');
  assert.equal(r.exp,'3N',hp+' hp must rebid 3NT');
  assert.match(r.why,/25-27/);
}
for(const hp of [28,29]){
  const r=twoClub.reb2c({hp,bal:true,L:{}},'2D');
  assert.equal(r.exp,'4N',hp+' hp must rebid 4NT');
  assert.match(r.why,/Lathunden s\. 24/);
  assert.match(r.means('4N'),/28-29/);
}

// Out-of-range balanced hands are not silently forced into a neighboring range.
for(const hp of [20,21,30,31]){
  const r=twoClub.reb2c({hp,bal:true,L:{}},'2D');
  assert.equal(r.exp,null,hp+' hp is outside the documented 22-29 balanced rebid ranges');
  assert.equal(r.sourceGap,true);
}

// Obalanced hands: 5+ major rebids at the 2-level; otherwise 5+ minor at the 3-level.
assert.equal(twoClub.reb2c({hp:20,bal:false,L:{C:2,D:2,H:5,S:4}},'2D').exp,'2H');
assert.equal(twoClub.reb2c({hp:20,bal:false,L:{C:5,D:4,H:2,S:2}},'2D').exp,'3C');
const noFiveCardSuit=twoClub.reb2c({hp:22,bal:false,L:{C:4,D:4,H:3,S:2}},'2D');
assert.equal(noFiveCardSuit.exp,null);
assert.match(noFiveCardSuit.why,/utan 5-korts färg/);

// Only the selected 2D response is handled.
const wrongResponse=twoClub.reb2c({hp:23,bal:true,L:{}},'2H');
assert.equal(wrongResponse.exp,null);


const openerThird=twoClub.openerThirdAfter2c;
const afterSpade2nt=openerThird({L:{C:5,D:4,H:2,S:2},bal:false},'2S','2N');
assert.equal(afterSpade2nt.exp,'3C','5-4 club distribution after 2S-2NT shows 3C');
assert.equal(afterSpade2nt.source,'lathunden_s25');
const overlap54=openerThird({L:{C:5,D:5,H:1,S:2},bal:false},'2S','2N');
assert.equal(overlap54.exp,null,'two competing 5-4 distributions must not get an invented priority');
assert.equal(overlap54.sourceGap,true);
const afterClubHerbert=openerThird({L:{C:2,D:5,H:6,S:0},bal:false},'3C','3D');
assert.equal(afterClubHerbert.exp,null,'overlapping 5-4 diamond and six-card heart routes must be left uncovered');
assert.equal(afterClubHerbert.sourceGap,true);
const sixHearts=openerThird({L:{C:2,D:2,H:6,S:3},bal:false},'3C','3D');
assert.equal(sixHearts.exp,'3H');
const sixSpades=openerThird({L:{C:2,D:2,H:3,S:6},bal:false},'3H','3S');
assert.equal(sixSpades.exp,null,'six spades and the unbalanced natural 3NT description overlap; no priority is stated');
assert.equal(sixSpades.sourceGap,true);
const fiveFourClubAfterHeart=openerThird({L:{C:5,D:4,H:2,S:2},bal:false},'3H','3S');
assert.equal(fiveFourClubAfterHeart.exp,null,'5-4 distribution overlaps the natural unbalanced 3NT route');
assert.equal(fiveFourClubAfterHeart.sourceGap,true);
const natural3nt=openerThird({L:{C:2,D:2,H:3,S:6},bal:false},'3H','3S');
assert.equal(natural3nt.exp,null,'6-card spades and natural 3NT both apply; the source gives no priority');
assert.equal(natural3nt.sourceGap,true);
const noNumericSlamThreshold=openerThird({L:{C:4,D:3,H:3,S:3},bal:true},'3C','3D');
assert.equal(noNumericSlamThreshold.exp,null);
assert.equal(noNumericSlamThreshold.sourceGap,true);



const stayman54=twoClub.responderAfter2c2ntStayman({L:{C:2,D:2,H:5,S:4}},'3D');
assert.equal(stayman54.exp,'3H','5 hearts and 4 spades after 3D Stayman answer is forcing 3H');
const stayman55=twoClub.responderAfter2c2ntStayman({L:{C:1,D:2,H:5,S:5}},'3D');
assert.equal(stayman55.exp,null,'5-5 in the majors fits both forcing routes');
assert.equal(stayman55.sourceGap,true);
const staymanSpadeInvite=twoClub.responderAfter2c2ntStayman({L:{C:2,D:3,H:2,S:4}},'3H');
assert.equal(staymanSpadeInvite.exp,null,'3S slam invite and 3NT nonforcing share the same four-spade shape without a source strength threshold');
assert.equal(staymanSpadeInvite.sourceGap,true);
const transferFiveMajor=twoClub.responderAfter2c2ntTransfer({L:{C:3,D:2,H:5,S:3}},'H');
assert.equal(transferFiveMajor.exp,'3N','five-card major after transfer can choose non-forcing 3NT when no minor slam shape applies');
const transferSlamOverlap=twoClub.responderAfter2c2ntTransfer({L:{C:4,D:2,H:5,S:2}},'H');
assert.equal(transferSlamOverlap.exp,null,'five-card major plus 4-card minor also qualifies for the Slam-referenced route');
assert.equal(transferSlamOverlap.sourceGap,true);

const R=require('../rattningsmotor.js');
function makeDeal(north,south){
  const deck=[];for(const suit of ['S','H','D','C'])for(let rank=2;rank<=14;rank++)deck.push(suit+rank);
  const used=new Set(north.concat(south));
  assert.equal(used.size,north.length+south.length,'2C/2NT integration hands must not overlap');
  const rest=deck.filter(card=>!used.has(card));
  return {N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
}
const ntOpenerHand=['H14','H13','H12','H11','S14','S13','S2','D14','D2','D3','C13','C2','C3'];
const ntResponderHand=['H10','H9','H8','H7','S3','S4','S5','D4','D5','D6','C4','C5','C6'];
const ntDeal=makeDeal(ntOpenerHand,ntResponderHand);
const ntStaymanAuction=[
  {s:'N',c:'2C'},{s:'E',c:'P'},{s:'S',c:'2D'},{s:'W',c:'P'},
  {s:'N',c:'2N'},{s:'E',c:'P'},{s:'S',c:'3C'}
];
assert.equal(R.nodeFor({hands:ntDeal,dealer:'N',bids:ntStaymanAuction},6).exp,'3C',
  '2C-2D-2NT uses the shared 2NT Stayman response family');
const ntStaymanReply=ntStaymanAuction.concat([{s:'W',c:'P'},{s:'N',c:'3H'}]);
assert.equal(R.nodeFor({hands:ntDeal,dealer:'N',bids:ntStaymanReply},8).exp,'3H',
  'opener answers 3C Stayman after the strong 2C rebid using the shared 2NT system');


const fiveFiveMajorHand=['S9','S8','S7','S6','S5','H10','H9','H8','H7','H6','D4','D5','C4'];
const fiveFiveDeal=makeDeal(ntOpenerHand,fiveFiveMajorHand);
const fiveFiveAuction=ntStaymanAuction.slice(0,6).concat([{s:'S',c:'3D'}]);
const fiveFiveNode=R.nodeFor({hands:fiveFiveDeal,dealer:'N',bids:fiveFiveAuction},6);
assert.equal(fiveFiveNode.exp,null,'5-5 majors after the strong 2NT rebid must not inherit an unverified transfer priority');
assert.equal(fiveFiveNode.sourceGap,true);
const sixClubHand=['C14','C12','C11','C10','C9','C8','D4','D5','D6','H2','H3','S4','S5'];
const sixClubDeal=makeDeal(ntOpenerHand,sixClubHand);
const sixClubAuction=ntStaymanAuction.slice(0,6).concat([{s:'S',c:'3C'}]);
const sixClubNode=R.nodeFor({hands:sixClubDeal,dealer:'N',bids:sixClubAuction},6);
assert.equal(sixClubNode.exp,null,'PRO/Slam low-suit continuations must remain uncovered');
assert.equal(sixClubNode.sourceGap,true);

// Strong 2♣ 4NT continuations: use the exact trump suit stated by
// Lathunden s. 25, even where the auction has not shown a mutual fit.
const slam=require('../slamlogik.js')(api);
function auction(calls){return calls.map(([s,c])=>({s,c}));}
assert.equal(slam.rkcTrumpFromAuction(auction([
  ['N','2C'],['E','P'],['S','2D'],['W','P'],['N','3C'],['E','P'],['S','3D'],['W','P'],['N','4N']
]),0),'C','4NT after 2C-2D-3C-3D is an ace ask with clubs as trump');
assert.equal(slam.rkcTrumpFromAuction(auction([
  ['N','2C'],['E','P'],['S','2D'],['W','P'],['N','3H'],['E','P'],['S','3S'],['W','P'],['N','4N']
]),0),'H','4NT after 2C-2D-3H-3S is an ace ask with hearts as trump');
assert.equal(slam.rkcTrumpFromAuction(auction([
  ['N','2C'],['E','P'],['S','2D'],['W','P'],['N','2N'],['E','P'],['S','3C'],['W','P'],['N','3H'],['E','P'],['S','4N']
]),1),'H','4NT after 2NT-Stayman 3H reply is an ace ask with hearts as trump');
assert.equal(slam.rkcTrumpFromAuction(auction([
  ['N','2C'],['E','P'],['S','2D'],['W','P'],['N','2N'],['E','P'],['S','3H'],['W','P'],['N','3S'],['E','P'],['S','4N']
]),1),'S','4NT after 2NT transfer to spades is an ace ask with spades as trump');
assert.equal(slam.rkcTrumpFromAuction(auction([
  ['N','2C'],['E','P'],['S','2D'],['W','P'],['N','2N'],['E','P'],['S','3D'],['W','P'],['N','3H'],['E','P'],['S','4N']
]),1),'H','4NT after 2NT transfer to hearts is an ace ask with hearts as trump');

console.log('Strong 2C through 4NT and source-bound third-bid branches: all tests passed.');
