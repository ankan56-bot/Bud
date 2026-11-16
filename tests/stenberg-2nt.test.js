'use strict';
const assert=require('node:assert/strict');
const R=require('../rattningsmotor.js');
const api={SU:['C','D','H','S'],maj:s=>s==='H'||s==='S',st_:c=>c[1],handHps:require('../poangberakning.js').handHps};
const St=require('../stenberg.js')(api);
function hand(cards){return require('../poangberakning.js').H(cards);}
function fill(a,b){const deck=[];for(const s of ['S','H','D','C'])for(let n=2;n<=14;n++)deck.push(s+n);const used=new Set([...a,...b]);assert.equal(used.size,a.length+b.length);const rest=deck.filter(c=>!used.has(c));return {N:a,E:rest.slice(0,13),S:b,W:rest.slice(13,26)};}

const strongHeartSupport=hand(['H14','H13','H12','H11','S14','S13','S2','D14','D2','D3','C14','C2','C3']);
assert.equal(St.responder(strongHeartSupport,'1H').exp,'2N');
const noFit=hand(['H14','H13','H12','S14','S13','S12','D14','D13','D12','C14','C13','C12','C11']);
assert.equal(St.responder(noFit,'1H').exp,null);
const minorWithMajor=hand(['C14','C13','C12','C11','H14','H13','H12','H11','S2','S3','D2','D3','D4']);
assert.equal(St.responder(minorWithMajor,'1C').exp,null);

const oneClub=hand(['H14','H13','H12','H11','H10','S14','S13','S2','D14','D13','D12','D11','C2']);
assert.equal(St.openerRebid(oneClub,'1H').exp,'3C');
const oneDiamond=hand(['S14','S13','S12','S11','S10','H14','H13','H12','D14','D13','D12','C2','C3']);
assert.equal(St.openerRebid(oneDiamond,'1S').exp,'3C');
const oneOtherMajor=hand(['H14','H13','H12','H11','H10','S2','D14','D13','D12','D11','C14','C13','C12']);
assert.equal(St.openerRebid(oneOtherMajor,'1S').exp,'3H');
const minorSingleton=hand(['C14','C13','C12','C11','C10','D2','H14','H13','H12','S14','S13','S12','S11']);
assert.equal(St.openerRebid(minorSingleton,'1C').exp,'3D');

const balanced14=hand(['H14','H13','H12','H11','H10','S14','S2','S3','D2','D3','D4','C2','C3']);
assert.equal(St.openerRebid(balanced14,'1H').exp,'3N');
const balancedStrong=hand(['H14','H13','H12','H11','H10','S14','S13','S2','D2','D3','D4','C2','C3']);
assert.equal(St.openerRebid(balancedStrong,'1H').exp,'3H');
const twoSingletons=hand(['H14','H13','H12','H11','H10','S14','S13','S12','D14','D13','D12','C2','C3']);
assert.equal(St.openerRebid(twoSingletons,'1H').exp,null);
const voidHand=hand(['H14','H13','H12','H11','H10','S14','S13','S12','D14','D13','D12','D11','D10']);
assert.equal(St.openerRebid(voidHand,'1H').exp,null);

const hands=fill(['H14','H13','H12','H11','H10','S14','S13','S2','D14','D13','D12','C2','C3'],
 ['H2','H3','H4','H5','S3','S4','S5','D2','D3','D4','C4','C5','C6']);
const node=R.nodeFor({hands,dealer:'N',bids:[{s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'2N'}]},2);
assert.equal(node.exp,'2N');
console.log('Stenberg 2NT: source-bound response and opener rebids passed.');
