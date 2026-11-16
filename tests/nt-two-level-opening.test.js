'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');

const opener21=['S14','S13','S12','S2','H14','H13','H2','D14','D2','D3','C11','C2','C3'];
assert.equal(R.H(opener21).hp,21);
assert.equal(R.H(opener21).bal,true);
const opening=R.nodeFor({hands:{N:opener21},dealer:'N',bids:[{s:'N',c:'P'}]},0);
assert.equal(opening.exp,'2N','20-21 balanced opens 2NT');
assert.equal(R.decideLive({seat:'N',dealer:'N',auction:[],ownHand:opener21}).exp,'2N');

const opener19=opener21.map(c=>c==='C11'?'C2':c==='D14'?'D13':c);
assert.equal(R.H(opener19).hp,19);
assert.notEqual(R.nodeFor({hands:{N:opener19},dealer:'N',bids:[{s:'N',c:'P'}]},0).exp,'2N');
const opener22=opener21.map(c=>c==='C11'?'C12':c);
assert.equal(R.H(opener22).hp,22);
assert.notEqual(R.nodeFor({hands:{N:opener22},dealer:'N',bids:[{s:'N',c:'P'}]},0).exp,'2N');

function node(seat,auction,ownHand,otherHand){
  const hands={};hands[seat]=ownHand.slice();
  if(otherHand)hands[seat==='N'?'S':'N']=otherHand.slice();
  const bids=auction.concat([{s:seat,c:'P'}]);
  return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}
function live(seat,auction,ownHand){
  return R.decideLive({seat,dealer:'N',auction,ownHand});
}
const after2NT=[{s:'N',c:'2N'},{s:'E',c:'P'}];
const weakFourHearts=['H2','H3','H4','H5','S2','S3','S4','D2','D3','D4','C2','C3','C4'];
assert.equal(R.H(weakFourHearts).hp,0);
assert.equal(node('S',after2NT,weakFourHearts,opener21).exp,'3C',
  '2NT opening: a four-card major is enough for Stayman; no invented 5 HCP floor');
assert.equal(live('S',after2NT,weakFourHearts).exp,'3C');

const fiveHearts=['H13','H12','H11','H10','H9','S2','S3','S4','D2','D3','D4','C2','C3'];
assert.equal(R.H(fiveHearts).hp,5);
assert.equal(node('S',after2NT,fiveHearts,opener21).exp,'3D',
  '2NT opening: 5+ hearts transfers one level higher');
assert.equal(live('S',after2NT,fiveHearts).exp,'3D');

const fiveSpades=['S13','S12','S11','S10','S9','H2','H3','H4','D2','D3','D4','C2','C3'];
assert.equal(R.H(fiveSpades).hp,5);
assert.equal(node('S',after2NT,fiveSpades,opener21).exp,'3H',
  '2NT opening: 5+ spades transfers one level higher');
assert.equal(live('S',after2NT,fiveSpades).exp,'3H');

const balancedFive=['S2','S3','S4','H2','H3','H4','D2','D3','D4','C13','C12','C2','C3'];
assert.equal(R.H(balancedFive).hp,5);
assert.equal(R.H(balancedFive).bal,true);
assert.equal(node('S',after2NT,balancedFive,opener21).exp,'3N',
  '2NT opening plus 5 responder HCP guarantees 25 HCP for 3NT');
assert.equal(live('S',after2NT,balancedFive).exp,'3N',
  'live 3NT recommendation uses only own 5 HCP plus public 2NT minimum');

const noMajorLow=['S2','S3','S4','H2','H3','H4','D2','D3','D4','C2','C3','C4','C5'];
assert.equal(node('S',after2NT,noMajorLow,opener21).exp,null,
  'without a major or guaranteed 25 HCP the continuation remains uncovered');

const openerAfterStayman=[
 {s:'N',c:'2N'},{s:'E',c:'P'},{s:'S',c:'3C'},{s:'W',c:'P'}
];
const openerWithFourHearts=['S14','S13','S2','H14','H13','H12','H2','D12','D11','D2','C12','C2','C3'];
assert.equal(R.H(openerWithFourHearts).hp,21);
assert.equal(node('N',openerAfterStayman,openerWithFourHearts,weakFourHearts).exp,'3H',
  '2NT opening: opener shows four hearts at the next level');
assert.equal(live('N',openerAfterStayman,openerWithFourHearts).exp,'3H');

const openerWithNoMajor=['S14','S13','S2','H14','H11','H2','D2','D3','D4','C14','C13','C12','C2'];
assert.equal(node('N',openerAfterStayman,openerWithNoMajor,weakFourHearts).exp,'3D',
  '2NT opening: opener denies a four-card major at the next level');

const afterDirect3NT=after2NT.concat([{s:'S',c:'3N'},{s:'W',c:'P'}]);
assert.equal(node('N',afterDirect3NT,opener21,balancedFive).exp,'P',
  '3NT is a final contract after 2NT opening');

console.log('2NT opening response family tests: passed.');
