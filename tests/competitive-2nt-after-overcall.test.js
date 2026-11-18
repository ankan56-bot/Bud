'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');

function dealWithWest(west){
  const deck=[];
  for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);
  const used=new Set(west);
  assert.equal(used.size,13);
  const rest=deck.filter(c=>!used.has(c));
  return {N:rest.slice(0,13),E:rest.slice(13,26),S:rest.slice(26,39),W:west};
}
function decide(west){
  const hands=dealWithWest(west);
  return R.nodeFor({hands,dealer:'N',bids:[
    {s:'N',c:'1H'},{s:'E',c:'1S'},{s:'S',c:'2D'},{s:'W',c:'2N'}
  ]},3);
}
// 11 hp: H-AKx, S-Kxxx, D-Jxx, C-xxx. Balanced and with a strong heart stopper.
const eleven=decide(['H14','H13','H2','S13','S2','S3','S4','D11','D2','D3','C2','C3','C4']);
assert.equal(eleven.exp,'2N');
assert.equal(eleven.conv,'svar på inkliv');
assert.equal(eleven.ruleStatus,'user_confirmed');
// 12 hp: replace the diamond jack with the queen.
const twelve=decide(['H14','H13','H2','S13','S2','S3','S4','D12','D2','D3','C2','C3','C4']);
assert.equal(twelve.exp,'2N');
assert.equal(twelve.ruleStatus,'user_confirmed');
// 10 hp is below the user-confirmed invit range.
const ten=decide(['H14','H13','H2','S13','S2','S3','S4','D2','D3','D4','C2','C3','C4']);
assert.equal(ten.exp,null);
assert.equal(ten.sourceGap,false);
// 13 hp is deliberately not silently included in the exact 11–12 sequence.
const thirteen=decide(['H14','H13','H2','S13','S2','S3','S4','D12','D2','D3','C11','C2','C3']);
assert.equal(thirteen.exp,null);
assert.equal(thirteen.sourceGap,false);
// 11 hp but unbalanced: reject 2NT.
const unbalanced=decide(['H14','H13','H2','S13','S2','S3','D11','D2','D3','D4','D5','C2','C3']);
assert.equal(unbalanced.exp,null);
assert.equal(unbalanced.sourceGap,false);
// 11 hp balanced but no sound heart stopper: reject 2NT.
const noStop=decide(['H11','H10','H2','S14','S13','S2','S3','D13','D2','D3','C2','C3','C4']);
assert.equal(noStop.exp,null);
assert.equal(noStop.sourceGap,false);
console.log('Competitive 2NT after 1H–1S–2D: 11–12 HP, balanced and stopper checks passed.');
