'use strict';
const assert = require('node:assert/strict');
const R = require('../rattningsmotor.js');
const {test} = require('node:test');

const RANK = {A:14,K:13,Q:12,J:11,T:10};
function hand(spec) {
  const cards=[];
  for (const [suit,ranks] of Object.entries(spec)) {
    for (const rank of ranks) cards.push(suit + (RANK[rank] || Number(rank)));
  }
  assert.equal(cards.length,13,'Each test hand must contain 13 cards');
  assert.equal(new Set(cards).size,13,'A hand must not contain duplicate cards');
  return cards;
}
function completeDeal(north,south) {
  const used=[...north,...south];
  assert.equal(north.length,13);
  assert.equal(south.length,13);
  assert.equal(new Set(used).size,26,'N/S hands must be disjoint');
  const deck=['S','H','D','C'].flatMap(s=>Array.from({length:13},(_,i)=>s+(14-i)));
  const rest=deck.filter(c=>!used.includes(c));
  return {N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
}
function dealWithNorth(north) {
  const deck=['S','H','D','C'].flatMap(s=>Array.from({length:13},(_,i)=>s+(14-i)));
  const rest=deck.filter(c=>!north.includes(c));
  return {N:north,E:rest.slice(0,13),S:rest.slice(13,26),W:rest.slice(26,39)};
}
function responderNode(north,south,opening) {
  const hands=completeDeal(north,south);
  const bids=[{s:'N',c:opening},{s:'E',c:'P'},{s:'S',c:'P'}];
  return R.nodeFor({hands,dealer:'N',bids},2);
}
function openerNode(north,south,opening,response) {
  const hands=completeDeal(north,south);
  const bids=[
    {s:'N',c:opening},{s:'E',c:'P'},{s:'S',c:response},
    {s:'W',c:'P'},{s:'N',c:'P'}
  ];
  return R.nodeFor({hands,dealer:'N',bids},4);
}
function openingNode(north) {
  return R.nodeFor({hands:dealWithNorth(north),dealer:'N',bids:[{s:'N',c:'P'}]},0);
}

const c12=hand({C:'AKQ98',D:'23',H:'234',S:'234'});
const d12=hand({D:'AKQ98',C:'23',H:'234',S:'234'});
const good11C=hand({C:'AKJ98',D:'Q',H:'J23',S:'2345'});
const good11D=hand({D:'AKJ98',C:'Q',H:'J23',S:'2345'});
const poor11C=hand({C:'98765',D:'AKQ',H:'Q23',S:'23'});

test('1♣ and 1♦ open with 12–19 hp and at least four cards in the minor',()=>{
  assert.equal(openingNode(c12).exp,'1C');
  assert.equal(openingNode(d12).exp,'1D');
});

test('11 hp and a good 5-card minor is allowed but visibly marked as interpretation',()=>{
  const c=openingNode(good11C),d=openingNode(good11D);
  assert.equal(c.exp,'1C');
  assert.equal(d.exp,'1D');
  assert.equal(c.ruleStatus,'source_interpretation');
  assert.equal(d.ruleStatus,'source_interpretation');
  assert.equal(c.soft,true);
  assert.equal(d.soft,true);
});

test('11 hp with a poor 5-card minor is not promoted to an opening',()=>{
  assert.equal(openingNode(poor11C).exp,'P');
});

test('1♣–1♦: 6+ hp and four diamonds is a forcing one-over-one response',()=>{
  const responder=hand({D:'KQJ9',C:'456',H:'567',S:'678'});
  const result=responderNode(c12,responder,'1C');
  assert.equal(result.exp,'1D');
  assert.match(result.why,/1 över 1/);
});

test('1♦–1♥: 6+ hp and four hearts is a forcing one-over-one response',()=>{
  const responder=hand({H:'KQJ9',C:'456',D:'567',S:'678'});
  const result=responderNode(d12,responder,'1D');
  assert.equal(result.exp,'1H');
});

test('1♦–2♣: 11+ hp and four clubs is a forcing two-over-one response',()=>{
  const responder=hand({C:'AKJ9',D:'T76',H:'QJ5',S:'678'});
  const result=responderNode(d12,responder,'1D');
  assert.equal(result.exp,'2C');
  assert.match(result.why,/11\+/);
});

test('1♦–2♣: 10 hp and a good six-card club suit does not import the Lathund exception',()=>{
  const responder=hand({C:'AKQJ98',D:'567',H:'56',S:'78'});
  const result=responderNode(d12,responder,'1D');
  assert.equal(result.exp,'1N');
  assert.match(result.why,/10 hp/);
});

test('1♦–1NT: four clubs may be held when no four-card suit can be shown at the one-level',()=>{
  const responder=hand({C:'KQJ9',D:'567',H:'567',S:'678'});
  const result=responderNode(d12,responder,'1D');
  assert.equal(result.exp,'1N');
});

test('1♣ with four-card major support shows the major before minor support',()=>{
  const responder=hand({C:'JT76',H:'AKQT',D:'45',S:'678'});
  const result=responderNode(c12,responder,'1C');
  assert.equal(result.exp,'1H');
});

test('1♣–2♣: 6–9 htp with four-card support is a simple minor raise',()=>{
  const responder=hand({C:'JT76',D:'AKJ',H:'456',S:'567'});
  const result=responderNode(c12,responder,'1C');
  assert.equal(result.exp,'2C');
});

test('1♦–3♦: 10–12 htp with four-card support is a double raise',()=>{
  const responder=hand({D:'7654',C:'AKJ',H:'Q56',S:'789'});
  const result=responderNode(d12,responder,'1D');
  assert.equal(result.exp,'3D');
});

test('1♣–2NT is handed to the existing Stenberg module',()=>{
  const responder=hand({C:'JT76',D:'AK4',H:'KQ5',S:'678'});
  const result=responderNode(c12,responder,'1C');
  assert.equal(result.exp,'2N');
  assert.equal(result.conv,'Stenberg');
});

test('1♣–1♦–2♦: opener with 12–16 htp and four-card diamond support raises to 2♦',()=>{
  const opener=hand({C:'KQ32',D:'AKQ2',H:'J2',S:'234'});
  const responder=hand({D:'JT98',H:'AK5',S:'KQ6',C:'456'});
  const result=openerNode(opener,responder,'1C','1D');
  assert.equal(result.exp,'2D');
});

test('1♣–1♦–3♦: opener with 17–19 htp and four-card support jumps to 3♦',()=>{
  const opener=hand({C:'AKJ2',D:'AKQ2',H:'J2',S:'234'});
  const responder=hand({D:'KQJ9',C:'456',H:'567',S:'234'});
  const result=openerNode(opener,responder,'1C','1D');
  assert.equal(result.exp,'3D');
});

test('20+ htp with minor support remains an explicit source gap when 3NT exploration is undefined',()=>{
  const opener=hand({C:'AKQJ2',D:'AKQ2',H:'2',S:'234'});
  const responder=hand({D:'KQJ2',C:'987',H:'234',S:'567'});
  const result=openerNode(opener,responder,'1C','1D');
  assert.equal(result.exp,null);
  assert.equal(result.sourceGap,true);
});

test('1♣–1♦: own six-card club suit uses the 12–16 HTP rebid range',()=>{
  const opener=hand({C:'AKQ987',D:'K',H:'234',S:'234'});
  const responder=hand({D:'KQJ2',C:'987',H:'234',S:'567'});
  const result=openerNode(opener,responder,'1C','1D');
  assert.equal(result.exp,'2C');
  assert.match(result.why,/12–16 HTP/);
});

test('1♣–1♦: own six-card club suit uses the 17–19 HTP simple jump range',()=>{
  const opener=hand({C:'AKQJ98',D:'AK',H:'234',S:'23'});
  const responder=hand({D:'KQJ2',C:'987',H:'234',S:'567'});
  const result=openerNode(opener,responder,'1C','1D');
  assert.equal(result.exp,'3C');
  assert.match(result.why,/17–19 HTP/);
});

test('20+ HTP with a long minor and no side suit is not assigned an invented 5-minor contract',()=>{
  const opener=hand({C:'AKQJ98',D:'AKQ',H:'23',S:'23'});
  const responder=hand({D:'KQJ2',C:'987',H:'234',S:'567'});
  const result=openerNode(opener,responder,'1C','1D');
  assert.equal(result.exp,null);
  assert.equal(result.sourceGap,true);
});

test('1♣–1♦–1♥ is a natural one-level second suit, not a reverse',()=>{
  const opener=hand({C:'AKQ98',H:'KQJ2',D:'23',S:'45'});
  const responder=hand({D:'KQJ2',C:'987',H:'234',S:'567'});
  const result=openerNode(opener,responder,'1C','1D');
  assert.equal(result.exp,'1H');
});

test('1♣–1♠–2♥ is a reverse only when opener has 18+ HTP',()=>{
  const responder=hand({S:'KQJ9',C:'456',H:'567',D:'678'});
  const lowOpener=hand({C:'AKQ98',H:'KQJ2',D:'23',S:'45'});
  const strongOpener=hand({C:'AKQ98',H:'AKQ2',D:'23',S:'45'});
  assert.equal(openerNode(lowOpener,responder,'1C','1S').exp,'2C');
  assert.equal(openerNode(strongOpener,responder,'1C','1S').exp,'2H');
});

test('1♦–1♥–1♠ is a natural one-level second suit, not a reverse',()=>{
  const opener=hand({D:'AKQ98',S:'KQJ2',C:'23',H:'45'});
  const responder=hand({H:'KQJ9',C:'456',D:'234',S:'678'});
  const result=openerNode(opener,responder,'1D','1H');
  assert.equal(result.exp,'1S');
});

test('equally long side suits with no source priority are left uncovered',()=>{
  const opener=hand({C:'AKQ98',H:'KQJ2',S:'QJ98'});
  const responder=hand({D:'KQJ2',C:'987',H:'234',S:'567'});
  const result=openerNode(opener,responder,'1C','1D');
  assert.equal(result.exp,null);
  assert.equal(result.sourceGap,true);
});

console.log('1♣/1♦ targeted module tests: passed.');
