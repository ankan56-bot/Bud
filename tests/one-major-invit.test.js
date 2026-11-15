'use strict';

// Targeted tests for responder's 3M invit and opener's 26-point acceptance.
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
function fullDeal(north,south){
 const deck=[];for(const s of ['S','H','D','C'])for(let r=2;r<=14;r++)deck.push(s+r);
 assert.equal(north.length,13);assert.equal(south.length,13);
 assert.equal(new Set([...north,...south]).size,26,'North/South hands must be disjoint');
 const rest=deck.filter(c=>!north.includes(c)&&!south.includes(c));
 return {N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
}
function check(opener,responder,suit,expected){
 const deal=fullDeal(opener,responder),major=suit==='H'?'1H':'1S',raise='3'+suit;
 const response=R.nodeFor({hands:deal,dealer:'N',bids:[{s:'N',c:major},{s:'E',c:'P'},{s:'S',c:'P'}]},2);
 assert.equal(response.exp,raise,'Responder with 10 HCP and four-card support should invite with 3M');
 const st={hands:deal,dealer:'N',bids:[
  {s:'N',c:major},{s:'E',c:'P'},{s:'S',c:raise},{s:'W',c:'P'},{s:'N',c:'P'}
 ]};
 const rebid=R.nodeFor(st,4);
 assert.equal(rebid.exp,expected,rebid.why);
}
const heartResponder=['H14','H13','H12','H11','S2','S3','S4','D2','D3','D4','C2','C3','C4'];
const heartMinimum=['H10','H9','H8','H7','H6','S14','S5','S6','D14','D5','D6','C14','C5'];
const heartExtra=['H10','H9','H8','H7','H6','S14','S13','S5','D14','D12','D5','C14','C5'];
check(heartMinimum,heartResponder,'H','P');
check(heartExtra,heartResponder,'H','4H');

const spadeResponder=['S14','S13','S12','S11','H2','H3','H4','D2','D3','D4','C2','C3','C4'];
const spadeMinimum=['S10','S9','S8','S7','S6','H14','H5','H6','D14','D5','D6','C14','C5'];
const spadeExtra=['S10','S9','S8','S7','S6','H14','H13','H5','D14','D12','D5','C14','C5'];
check(spadeMinimum,spadeResponder,'S','P');
check(spadeExtra,spadeResponder,'S','4S');

console.log('1♥/1♠ 3M invit acceptance: 4/4 passed.');
