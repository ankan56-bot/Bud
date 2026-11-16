'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
const scoring=require('../poangberakning.js');
const api={SU:['C','D','H','S'],maj:s=>s==='H'||s==='S',st_:c=>c[1],handHps:scoring.handHps,
 partnershipPoints:scoring.partnershipPoints,
 NC:(why,means,conv,sourceGap)=>({exp:null,alt:[],why,means:means||(()=>null),conv:conv||'test',sourceGap:!!sourceGap})};
const St=require('../stenberg.js')(api);
function hand(cards){return require('../poangberakning.js').H(cards);}
function fill(a,b){const deck=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);const used=new Set([...a,...b]);assert.equal(used.size,a.length+b.length);const rest=deck.filter(c=>!used.has(c));return {N:a,E:rest.slice(0,13),S:b,W:rest.slice(13,26)};}

const strongHeartSupport=hand(['H14','H13','H12','H11','S14','S13','S2','D14','D2','D3','C14','C2','C3']);
assert.equal(St.responder(strongHeartSupport,'1H').exp,'2N');
const noFit=hand(['H14','H13','H12','S14','S13','S12','D14','D13','D12','C14','C13','C12','C11']);
assert.equal(St.responder(noFit,'1H').exp,null);
const minorWithMajor=hand(['C14','C13','C12','C11','H14','H13','H12','H11','S2','S3','D2','D3','D4']);
assert.equal(St.responder(minorWithMajor,'1C').exp,null);
const strongMinorSupport=hand(['C14','C13','C12','C11','S14','S13','S2','H2','H3','H4','D2','D3','D4']);
assert.equal(St.responder(strongMinorSupport,'1C').exp,'2N');

const oneClub=hand(['H14','H13','H12','H11','H10','S14','S13','S2','D14','D13','D12','D11','C2']);
assert.equal(St.openerRebid(oneClub,'1H').exp,'3C');
const oneDiamond=hand(['S14','S13','S12','S11','S10','H14','H13','H12','D14','D13','D12','D11','C2']);
assert.equal(St.openerRebid(oneDiamond,'1S').exp,'3C');
const oneOtherMajor=hand(['S14','S13','S12','S11','S10','H2','D14','D13','D12','D11','C14','C13','C12']);
assert.equal(St.openerRebid(oneOtherMajor,'1S').exp,'3H');
const minorSingleton=hand(['C14','C13','C12','C11','C10','D2','H14','H13','H12','S14','S13','S12','S11']);
assert.equal(St.openerRebid(minorSingleton,'1C').exp,'3D');

const balanced14=hand(['H14','H13','H12','H11','H10','S14','S2','S3','D2','D3','D4','C2','C3']);
assert.equal(St.openerRebid(balanced14,'1H').exp,'3N');
const balancedStrong=hand(['H14','H13','H12','H11','H10','S14','S13','S2','D2','D3','D4','C2','C3']);
assert.equal(St.openerRebid(balancedStrong,'1H').exp,'3H');
const twoSingletons=hand(['H14','H13','H12','H11','H10','S2','D2','C14','C13','C12','C11','C10','C9']);
assert.equal(St.openerRebid(twoSingletons,'1H').exp,null);
const voidHand=hand(['H14','H13','H12','H11','H10','S14','S13','S12','D14','D13','D12','D11','D10']);
assert.equal(St.openerRebid(voidHand,'1H').exp,null);

const hands=fill(['H2','H3','H4','H5','H6','S14','S13','S2','D14','D13','D12','C2','C3'],
 ['H14','H13','H12','H11','S12','S11','S10','D11','D10','D9','C14','C13','C12']);
const node=R.nodeFor({hands,dealer:'N',bids:[{s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'2N'}]},2);
assert.equal(node.exp,'2N');
const live=R.decideLive({seat:'S',dealer:'N',auction:[{s:'N',c:'1H'},{s:'E',c:'P'}],
 ownHand:hands.S});
assert.equal(live.exp,'2N','live mode should recommend Stenberg using only the responder hand and public auction');
const openerHands=fill(['H14','H13','H12','H11','H10','S14','S13','S12','D14','D13','D12','D11','C2'],
 ['H2','H3','H4','H5','S11','S10','S9','D10','D9','D8','C14','C13','C12']);
const openerNode=R.nodeFor({hands:openerHands,dealer:'N',bids:[
 {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},{s:'N',c:'3C'}
]},4);
assert.equal(openerNode.exp,'3C');
const southHand=require('../poangberakning.js').H(openerHands.S);
const northHand=require('../poangberakning.js').H(openerHands.N);
assert.equal(St.responderContinuation(southHand,'1H','4H',northHand,
 [{s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},{s:'N',c:'3C'},{s:'E',c:'P'}],
 null,0).exp,'4H');
// Minor Stenberg must establish the minor trump for the existing RKC module.
const minorDeal=fill(
 ['C2','C3','C4','C5','C6','S14','S13','S12','D13','D12','D11','H13','H12'],
 ['C14','C13','C12','C10','H14','H10','H9','S11','S10','S9','D14','D10','D9']);
const minorAuction=[
 {s:'N',c:'1C'},{s:'E',c:'P'},{s:'S',c:'2N'},{s:'W',c:'P'},
 {s:'N',c:'3C'},{s:'E',c:'P'},{s:'S',c:'4N'}
];
const ask=R.nodeFor({hands:minorDeal,dealer:'N',bids:minorAuction},6);
assert.equal(ask.exp,'4N','4NT after 1♣–2NT–3♣ must hand off as RKC with clubs agreed');
const reply=R.nodeFor({hands:minorDeal,dealer:'N',bids:minorAuction.concat([{s:'W',c:'P'},{s:'N',c:'5D'}])},8);
assert.equal(reply.exp,'5D','one keycard after minor Stenberg must use the existing RKC response table');

console.log('Stenberg 2NT: source-bound response, opener rebids, live response and minor RKC handoff passed.');
