'use strict';
const assert=require('node:assert/strict');
const factory=require('../trumfstod.js');
const api={maj:s=>s==='H'||s==='S',st_:c=>c[1],isBid:c=>/^[1-7][CDHSN]$/.test(c),lv:c=>Number(c[0]),
 NC:why=>({exp:null,why,sourceGap:true})};
const calls=[];
const stenberg={
 responder:(h,o)=>{calls.push(['stenberg.responder',o]);return o==='1H'&&h.special?{exp:'2N',conv:'Stenberg'}:null;},
 openerRebid:(h,o,p)=>{calls.push(['stenberg.openerRebid',o]);return {exp:'3'+o,conv:'Stenberg'};}
};
function family(name){return {
 respond:(h,o)=>{calls.push([name+'.respond',o]);return {exp:'1N',conv:name};},
 rebid:(h,o,r,p)=>{calls.push([name+'.rebid',o,r]);return {exp:'2N',conv:name};}
};}
const trumfstod=factory(api,{stenberg,majorBidding:family('major'),minorBidding:family('minor')});

assert.deepEqual(trumfstod.responder({special:true},'1H'),{exp:'2N',conv:'Stenberg'});
assert.deepEqual(calls.pop(),['stenberg.responder','1H']);
assert.equal(trumfstod.responder({},'1H').conv,'major');
assert.deepEqual(calls.pop(),['major.respond','1H']);
assert.equal(trumfstod.responder({},'1C').conv,'minor');
assert.deepEqual(calls.pop(),['minor.respond','1C']);
assert.equal(trumfstod.openerSecondBid({},'1S','2N').conv,'Stenberg');
assert.deepEqual(calls.pop(),['stenberg.openerRebid','1S']);
assert.equal(trumfstod.openerSecondBid({},'1D','2D').conv,'minor');
assert.deepEqual(calls.pop(),['minor.rebid','1D','2D']);
assert.equal(trumfstod.isSupportResponse({L:{H:4}},'1H','2H'),true);
assert.equal(trumfstod.isSupportResponse({L:{H:4}},'1H','2N'),true);
assert.equal(trumfstod.isSupportResponse({L:{H:3}},'1H','2H'),true);
assert.equal(trumfstod.isSupportResponse({L:{H:4}},'1H','1N'),false);
assert.equal(trumfstod.accepts('1H'),true);
assert.equal(trumfstod.accepts('2H'),false);
console.log('trumfstod: all tests passed');
