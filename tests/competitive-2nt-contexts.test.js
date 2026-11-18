'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');

function deal(north,south){
  const deck=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);
  assert.equal(north.length,13);assert.equal(south.length,13);
  assert.equal(new Set([...north,...south]).size,26);
  const rest=deck.filter(c=>!north.includes(c)&&!south.includes(c));
  return {N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
}
const opener=['C14','C13','C8','C9','C10','H12','H11','H10','H9','S12','S2','D12','D5'];
const eleven=['H14','H13','H2','S13','S3','S4','S5','D11','D2','D3','C5','C6','C7'];
const twelve=['H14','H13','H2','S13','S3','S4','S5','D11','D2','D3','C11','C6','C7'];
const thirteen=['H14','H13','H2','S13','S3','S4','S5','D11','D2','D3','C12','C6','C7'];
const ten=['H14','H13','H2','S13','S3','S4','S5','D2','D3','D4','C5','C6','C7'];
function sourceResponse(hand){
  const hands=deal(opener,hand);
  return R.nodeFor({hands,dealer:'N',bids:[
    {s:'N',c:'1C'},{s:'E',c:'1H'},{s:'S',c:'2N'}
  ]},2);
}
// Lathund s. 35: after opponents overcall our 1C, 2NT is 11–12 hp,
// balanced with a heart stopper. This must not use the 11–13 overcall rule.
assert.equal(sourceResponse(eleven).exp,'2N');
assert.equal(sourceResponse(twelve).exp,'2N');
assert.notEqual(sourceResponse(thirteen).exp,'2N');
assert.equal(sourceResponse(ten).exp,'1N');

// Nordisk Standard s. 7: when partner has overcalled 1S over 1H,
// 2NT remains 11–13 hp, balanced with a good heart stopper.
function dealWest(north,west){
  const deck=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);
  assert.equal(new Set([...north,...west]).size,26);
  const rest=deck.filter(c=>!north.includes(c)&&!west.includes(c));
  const east=rest.filter(c=>c[0]==='S').slice(-5);
  const fillers=rest.filter(c=>c[0]!=='S');
  east.push(...fillers.slice(0,8));
  const south=rest.filter(c=>!east.includes(c));
  return {N:north,E:east,S:south,W:west};
}
const overcallResponder=['H14','H13','H2','S2','S3','D13','D2','D3','D4','C13','C2','C3','C4'];
const overcallHands=dealWest(['H12','H11','H10','H9','H8','D14','D11','D10','D9','C14','C11','C10','C9'],overcallResponder);
const reply=R.nodeFor({hands:overcallHands,dealer:'N',bids:[
 {s:'N',c:'1H'},{s:'E',c:'1S'},{s:'S',c:'P'},{s:'W',c:'2N'}
]},3);
assert.equal(reply.exp,'2N');
console.log('Competitive 2NT contexts: Lathund 11–12 after opponent overcall and Nordisk Standard 11–13 after partner overcall passed.');
