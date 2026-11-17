'use strict';
const assert=require('node:assert/strict');
const factory=require('../trumfstod.js');
const api={maj:s=>s==='H'||s==='S',st_:c=>c[1],isBid:c=>/^[1-7][CDHSN]$/.test(c),lv:c=>Number(c[0]),
 SU:['C','D','H','S'],handHps:h=>h.points||0,lowest:(s,o)=>({C:'2C',D:'2D',H:'2H',S:'2S'})[s],NC:(why,means,conv,sourceGap)=>({exp:null,why,sourceGap:!!sourceGap})};
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
const scoring=require('../poangberakning.js');
const SU=['C','D','H','S'];
const responseApi={
 SU:SU,SYM:{C:'♣',D:'♦',H:'♥',S:'♠',N:'NT'},NAME:{},
 side:s=>s==='N'||s==='S'?0:1,partner:s=>({N:'S',S:'N',E:'W',W:'E'}[s]),
 isBid:c=>/^[1-7][CDHSN]$/.test(c),lv:c=>Number(c[0]),st_:c=>c[1],
 rk:c=>Number(c[0])*5+'CDHSN'.indexOf(c[1]),txt:c=>c,
 maj:s=>s==='H'||s==='S',
 lowest:(s,above)=>{for(let l=1;l<=7;l++){const b=l+s;if(!above||Number(b[0])*5+'CDHSN'.indexOf(b[1])>Number(above[0])*5+'CDHSN'.indexOf(above[1]))return b;}return null;},
 jump:(s,above)=>{const b=responseApi.lowest(s,above);return b&&Number(b[0])<7?(Number(b[0])+1)+s:null;},
 H:scoring.H,handHps:scoring.handHps,partnershipPoints:scoring.partnershipPoints,
 T:m=>c=>m[c]||null,ok:(c,last)=>c==='P'||c==='X'||c==='XX',
 NC:(why,means,conv,sourceGap)=>({exp:null,alt:[],why,means:means||(()=>null),conv:conv||'test',sourceGap:!!sourceGap})
};
const commonResponses=require('../ettoppningssvar.js')(responseApi);
const majorPreempt=commonResponses.resp1(scoring.H(['H13','H12','H11','H10','H9','S13','S2','S3','S4','S5','D2','C2','C3']),'1H');
assert.equal(majorPreempt.exp,'4H','4+ good heart support, 12 or fewer htp and a distributional hand should preempt to 4H');
const minorPreempt=commonResponses.resp1(scoring.H(['C13','C12','C11','C10','C9','D2','D3','D4','D5','D6','H2','S2','S3']),'1C');
assert.equal(minorPreempt.exp,'4C','4+ good club support, at most 9 htp and a distributional hand should preempt to 4C');


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
assert.equal(trumfstod.isSupportResponse({L:{H:3}},'1H','2H'),false);
assert.equal(trumfstod.isSupportResponse({L:{H:4}},'1H','1N'),false);
assert.equal(trumfstod.accepts('1H'),true);
assert.equal(trumfstod.accepts('2H'),false);
const voidJump=trumfstod.responder({L:{C:0,D:4,H:4,S:5},points:13},'1H');
assert.equal(voidJump.exp,'4C','a single void is shown by a double jump with 4+ support and 13+ htp');
assert.equal(voidJump.conv,'trumfstöd – renons');
const searchMajor=trumfstod.responder({L:{C:4,D:2,H:4,S:3},points:13},'1C');
assert.equal(searchMajor.conv,'minor','the minor family is delegated to');
const realMajorSearch=commonResponses.resp1(scoring.H(['H14','H13','H12','H11','C2','C3','C4','C5','S2','S3','S4','D2','D3']),'1C');
assert.equal(realMajorSearch.exp,'1H','a 4+ major is shown before minor support');
const multipleVoids=trumfstod.responder({L:{C:0,D:0,H:4,S:5},points:13},'1H');
assert.equal(multipleVoids.exp,null);
assert.equal(multipleVoids.sourceGap,true,'no priority between multiple voids is invented');

console.log('trumfstod: all tests passed');
