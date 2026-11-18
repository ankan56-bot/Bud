'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');

function fullDeal(north,south){
  const deck=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);
  assert.equal(north.length,13);assert.equal(south.length,13);
  assert.equal(new Set([...north,...south]).size,26);
  const rest=deck.filter(c=>!north.includes(c)&&!south.includes(c));
  return {N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
}
function openerFor(responder,secondSuit){
  const deck=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);
  const unavailable=new Set(responder),selected=[];
  function take(suit,count){
    for(const card of deck){
      if(card[0]===suit&&!unavailable.has(card)&&!selected.includes(card)&&selected.filter(x=>x[0]===suit).length<count)
        selected.push(card);
    }
  }
  take('H',secondSuit==='D'?4:5);take(secondSuit,4);
  const other=secondSuit==='D'?'C':'D';
  take('S',2);take(other,secondSuit==='D'?3:2);
  for(const card of deck){if(selected.length<13&&!unavailable.has(card)&&!selected.includes(card))selected.push(card);}
  assert.equal(selected.length,13);
  return selected;
}
function response(responder,rebid){
  const secondSuit=rebid==='2D'?'D':'C';
  const opener=openerFor(responder,secondSuit);
  const hands=fullDeal(opener,responder);
  return R.nodeFor({hands,dealer:'N',bids:[
    {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'1S'},{s:'W',c:'P'},
    {s:'N',c:rebid},{s:'E',c:'P'},{s:'S',c:'2N'}
  ]},6);
}

// User-confirmed 1H–1S–2D–2NT: invit, 11–12 hp, balanced.
const eleven=['S14','S13','S2','S3','H13','H2','H3','D11','D2','D3','C2','C3','C4'];
const twelve=['S14','S13','S2','S3','H13','H2','H3','D12','D2','D3','C2','C3','C4'];
assert.equal(response(eleven,'2D').exp,'2N');
assert.equal(response(eleven,'2D').ruleStatus,'user_confirmed');
assert.equal(response(twelve,'2D').exp,'2N');
assert.equal(response(twelve,'2D').ruleStatus,'user_confirmed');
const ten=['S14','S13','S2','S3','H13','H2','H3','D2','D3','D4','C2','C3','C4'];
assert.equal(response(ten,'2D').exp,null);
assert.equal(response(ten,'2D').sourceGap,false);
const thirteen=['S14','S13','S2','S3','H13','H2','H3','D12','D2','D3','C11','C2','C3'];
assert.equal(response(thirteen,'2D').exp,null);
assert.equal(response(thirteen,'2D').sourceGap,false);
const unbalanced=['S14','S13','S2','S3','S4','H13','H2','H3','H4','D11','D2','C2','C3'];
assert.equal(response(unbalanced,'2D').exp,null);
assert.equal(response(unbalanced,'2D').sourceGap,false);

// Separate PDF rule: 1H–1S–2C–2NT is 10–12 hp, balanced, exactly two hearts,
// and stoppers in spades and diamonds.
const sourceProfile=['S14','S13','S2','S3','H2','H3','D13','D12','D2','D3','C2','C3','C4'];
const sourceResult=response(sourceProfile,'2C');
assert.equal(sourceResult.exp,'2N');
assert.equal(sourceResult.ruleStatus,'source_confirmed');
const noDiamondStop=['S13','S12','S2','S3','H13','H2','D10','D9','D8','D7','C12','C2','C3'];
const rejectedSourceProfile=response(noDiamondStop,'2C');
assert.equal(rejectedSourceProfile.exp,null);
assert.equal(rejectedSourceProfile.sourceGap,false);
console.log('Second-bid 2NT invit tests: user-confirmed 1H–1S–2D and PDF 1H–1S–2C profiles passed.');
