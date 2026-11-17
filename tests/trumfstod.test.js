'use strict';
const assert=require('node:assert/strict');
const factory=require('../trumfstod.js');
const api={maj:s=>s==='H'||s==='S',st_:c=>c[1],isBid:c=>/^[1-7][CDHSN]$/.test(c),lv:c=>Number(c[0]),
 SU:['C','D','H','S'],handHps:h=>h.points||0,lowest:(s,o)=>({C:'2C',D:'2D',H:'2H',S:'2S'})[s],NC:(why,means,conv,sourceGap)=>({exp:null,why,sourceGap:!!sourceGap})};
const calls=[];
const stenberg={
 responder:(h,o)=>{calls.push(['stenberg.responder',o]);return o==='1H'&&h.special?{exp:'2N',conv:'Stenberg'}:null;},
 openerRebid:(h,o,p)=>{calls.push(['stenberg.openerRebid',o]);return {exp:'3'+o,conv:'Stenberg'};},
 responderContinuation:(h,o,call,p,prior,rkc,side,seat)=>{calls.push(['stenberg.responderContinuation',o,call]);return {exp:'P',conv:'Stenberg continuation'};}
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
assert.equal(majorPreempt.ruleStatus,'source_interpretation','the qualitative source wording must remain visible as an interpretation');
assert.equal(majorPreempt.soft,true);
const majorAbovePreemptLimit=scoring.H(['H13','H12','H11','H10','H2','S13','S12','S11','S2','D2','D3','C2','C3']);
assert.equal(scoring.handHps(majorAbovePreemptLimit,'H'),14);
assert.equal(commonResponses.resp1(majorAbovePreemptLimit,'1H').exp,'2N','a strong major fit above 12 htp must use Stenberg, not the 4-level preempt');
const minorPreempt=commonResponses.resp1(scoring.H(['C13','C12','C11','C10','C9','D2','D3','D4','D5','D6','H2','S2','S3']),'1C');
assert.equal(minorPreempt.exp,'4C','4+ good club support, at most 9 htp and a distributional hand should preempt to 4C');
assert.equal(minorPreempt.ruleStatus,'source_interpretation');
assert.equal(minorPreempt.soft,true);
const minorAbovePreemptLimit=scoring.H(['C13','C12','C2','C3','D12','D2','D3','D4','D5','D6','H2','H3','S2']);
assert.equal(scoring.handHps(minorAbovePreemptLimit,'C'),10);
assert.equal(commonResponses.resp1(minorAbovePreemptLimit,'1C').exp,'3C','10 htp with an unbalanced good minor fit is a 3-level raise, not the 4-level preempt');
const majorLow=commonResponses.resp1(scoring.H(['H13','H2','H3','H4','S12','S2','S3','D11','D2','D3','C2','C3','C4']),'1H');
assert.equal(majorLow.exp,'2H','6-9 htp with four-card major support should raise to two');
const majorInvite=commonResponses.resp1(scoring.H(['H13','H12','H2','H3','S13','S2','S3','D12','D2','D3','C2','C3','C4']),'1H');
assert.equal(majorInvite.exp,'3H','10-12 htp with four-card major support should raise to three');
const majorStenberg=commonResponses.resp1(scoring.H(['H13','H12','H2','H3','S13','S2','S3','D14','D2','D3','C11','C2','C3']),'1H');
assert.equal(majorStenberg.exp,'2N','13+ htp with four-card major support should use Stenberg');
const minorLow=commonResponses.resp1(scoring.H(['C13','C2','C3','C4','D12','D2','D3','H11','H2','H3','S2','S3','S4']),'1C');
assert.equal(minorLow.exp,'2C','6-9 htp with four-card minor support and no four-card major should raise to two');
const minorInvite=commonResponses.resp1(scoring.H(['C13','C12','C2','C3','D13','D2','D3','H12','H2','H3','S2','S3','S4']),'1C');
assert.equal(minorInvite.exp,'3C','10-12 htp with four-card minor support and no four-card major should raise to three');
const minorStenberg=commonResponses.resp1(scoring.H(['C13','C12','C2','C3','D14','D2','D3','H13','H2','H3','S11','S2','S3']),'1C');
assert.equal(minorStenberg.exp,'2N','13+ htp with four-card minor support and no four-card major should use Stenberg');
const partnerLow=['S2','S3','S4','S5','H2','H3','H4','H5','D2','D3','D4','C2','C3'];
const opener12=scoring.H(['S13','S12','S2','S3','H14','H2','H3','H4','D12','D2','D3','C2','C3']);
assert.equal(commonResponses.reb1(opener12,'1H','1S',partnerLow).exp,'2S','12-16 htp with four-card support in responder suit should make the cheapest raise');
const opener17=scoring.H(['S14','S13','S12','S2','H14','H2','H3','H4','D13','D2','D3','C2','C3']);
assert.equal(commonResponses.reb1(opener17,'1H','1S',partnerLow).exp,'3S','17-19 htp with four-card support in responder suit should jump');
const opener20=scoring.H(['S14','S13','S12','S11','H14','H13','H2','H3','D13','D2','D3','C2','C3']);
assert.equal(commonResponses.reb1(opener20,'1H','1S',partnerLow).exp,'4S','20+ htp with four-card support in responder suit should bid game');
const partnerClub=['C2','C3','C4','C5','H2','H3','H4','H5','D2','D3','D4','S2','S3'];
const openerMinor20=scoring.H(['C14','C13','C12','C11','H14','H13','H12','H11','D14','D13','D12','S2','S3']);
const minorGameExploration=commonResponses.reb1(openerMinor20,'1H','2C',partnerClub);
assert.equal(minorGameExploration.exp,null,'20+ htp with a minor fit must not invent the 3NT investigation sequence');
assert.equal(minorGameExploration.sourceGap,true,'the undocumented 3NT/5-minor route must be marked for expert review');

// End-to-end route: the real correction engine must preserve the uncovered
// 3NT/5-minor exploration as a source gap after 1H–2C.
const R=require('../rattningsmotor.js');
const minorGapNorth=['C2','C3','C4','C5','H14','H13','H12','H11','D14','D13','D12','S14','S2'];
const minorGapSouth=['C14','C13','C12','C11','C10','H2','H3','H4','D2','D3','D4','S13','S3'];
const used=new Set(minorGapNorth.concat(minorGapSouth));
assert.equal(used.size,26,'integration test hands must not overlap');
const rest=[];
for(const suit of ['S','H','D','C'])for(let rank=2;rank<=14;rank++){
  const card=suit+rank;if(!used.has(card))rest.push(card);
}
const minorGapDeal={N:minorGapNorth,S:minorGapSouth,E:rest.slice(0,13),W:rest.slice(13,26)};
const minorGapNode=R.nodeFor({hands:minorGapDeal,dealer:'N',bids:[
  {s:'N',c:'1H'},{s:'E',c:'P'},{s:'S',c:'2C'},{s:'W',c:'P'},{s:'N',c:'P'}
]},4);
assert.equal(minorGapNode.exp,null);
assert.equal(minorGapNode.sourceGap,true,'the real bidding router must preserve the source gap for expert logging');




assert.deepEqual(trumfstod.responder({special:true},'1H'),{exp:'2N',conv:'Stenberg'});
assert.deepEqual(calls.pop(),['stenberg.responder','1H']);
assert.equal(trumfstod.responder({},'1H').conv,'major');
assert.deepEqual(calls.pop(),['major.respond','1H']);
assert.equal(trumfstod.responder({},'1C').conv,'minor');
assert.deepEqual(calls.pop(),['minor.respond','1C']);
assert.equal(trumfstod.openerSecondBid({},'1S','2N').conv,'Stenberg');
assert.deepEqual(calls.pop(),['stenberg.openerRebid','1S']);
assert.equal(trumfstod.responderContinuation({},'1H','3H').conv,'Stenberg continuation');
assert.deepEqual(calls.pop(),['stenberg.responderContinuation','1H','3H']);
assert.equal(trumfstod.openerSecondBid({},'1D','2D').conv,'minor');
assert.deepEqual(calls.pop(),['minor.rebid','1D','2D']);
assert.equal(trumfstod.isSupportResponse({L:{H:4}},'1H','2H'),true);
assert.equal(trumfstod.isSupportResponse({L:{H:4}},'1H','2N'),true);
assert.equal(trumfstod.isSupportResponse({L:{H:3}},'1H','2H'),false);
assert.equal(trumfstod.isSupportResponse({L:{H:4}},'1H','1N'),false);
assert.equal(trumfstod.accepts('1H'),true);
assert.equal(trumfstod.accepts('2H'),false);
const voidSupport=trumfstod.responder({special:true,L:{C:0,D:4,H:4,S:5},points:13},'1H');
assert.equal(voidSupport.exp,'2N','splinter is paused; a qualifying hand follows the Stenberg route even with a void');
assert.deepEqual(calls.pop(),['stenberg.responder','1H']);
const searchMajor=trumfstod.responder({L:{C:4,D:2,H:4,S:3},points:13},'1C');
assert.equal(searchMajor.conv,'minor','the minor family is delegated to');
const realMajorSearch=commonResponses.resp1(scoring.H(['H14','H13','H12','H11','C2','C3','C4','C5','S2','S3','S4','D2','D3']),'1C');
assert.equal(realMajorSearch.exp,'1H','a 4+ major is shown before minor support');
const multipleVoids=trumfstod.responder({special:true,L:{C:0,D:0,H:4,S:5},points:13},'1H');
assert.equal(multipleVoids.exp,'2N','the paused splinter convention must not block Stenberg routing');
assert.deepEqual(calls.pop(),['stenberg.responder','1H']);
const multipleVoidsWithMajor=trumfstod.responder({L:{C:4,D:0,H:4,S:0},points:13},'1C');
assert.equal(multipleVoidsWithMajor.conv,'minor','splinter selection is inactive; ordinary low-opening response routing is preserved');
assert.notEqual(multipleVoidsWithMajor.sourceGap,true,'a covered major-first sequence must not be logged as an uncovered void priority');

console.log('trumfstod: all tests passed');
