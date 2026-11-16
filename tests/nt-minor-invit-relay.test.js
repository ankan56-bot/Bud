'use strict';

const assert = require('node:assert/strict');
const R = require('../rattningsmotor.js');
const deck = ['S','H','D','C'].flatMap(s => Array.from({length:13},(_,i)=>s+(i+2)));

function makeDeal(north, south) {
  const used = new Set([...north, ...south]);
  assert.equal(used.size, 26, 'hands must be disjoint');
  const rest = deck.filter(c => !used.has(c));
  return {N:north, E:rest.slice(0,13), S:south, W:rest.slice(13,26)};
}
const neutralSouth = ['S2','S3','S4','S5','H2','H3','H5','D2','D3','D5','C4','C5','C6'];

function recommend(north, auction) {
  const hands = makeDeal(north, neutralSouth);
  const bids = auction.concat([{s:'N',c:'P'}]);
  return R.nodeFor({hands,dealer:'N',bids}, bids.length-1);
}

// Nordisk standard s. 4: after a 1NT opening, 3m is an invitational
// long-minor action. Opener passes with xx/xxx and seeks 3NT with a
// top honour in two- or three-card support.
const cases = [
  {
    name:'3C, two-card support with Q',
    north:['S14','S12','S11','S2','H13','H4','H3','D14','D7','D4','D3','C12','C3'],
    call:'3C', expected:'3N'
  },
  {
    name:'3C, two-card support without top honour',
    north:['S14','S12','S11','S2','H14','H13','H4','D14','D7','D4','C8','C3','C2'],
    call:'3C', expected:'P'
  },
  {
    name:'3C, three-card support with Q',
    north:['S14','S12','S11','S2','H13','H12','H4','D14','D7','D4','C12','C8','C3'],
    call:'3C', expected:'3N'
  },
  {
    name:'3C, three-card support without top honour',
    north:['S14','S12','S2','H14','H13','H4','D14','D7','D4','C8','C7','C3','C2'],
    call:'3C', expected:'P'
  },
  {
    name:'3D, two-card support with K',
    north:['S14','S12','S11','S2','H13','H4','H3','D14','D13','D4','C8','C3','C2'],
    call:'3D', expected:'3N'
  },
  {
    name:'3D, three-card support without top honour',
    north:['S14','S12','S2','H14','H13','H4','D8','D7','D4','C8','C7','C3','C2'],
    call:'3D', expected:'P'
  }
];
for (const c of cases) {
  const auction = [
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:c.call},{s:'W',c:'P'}
  ];
  const result = recommend(c.north, auction);
  assert.equal(result.exp,c.expected,c.name+': '+result.why);
  assert.match(result.why,/stöd|Topphonnör|honnör/i,c.name+' should explain the source rule');
}

// 1NT–2S is the weak-minor relay. Opener rebids 2NT with longer diamonds
// or equal minor length, and 3C with longer clubs (Nordisk standard s. 4–5).
const relayHands = [
  {name:'longer diamonds', north:['S14','S12','S11','S2','H13','H12','H4','D14','D11','D7','D4','C8','C3'], expected:'2N'},
  {name:'equal minors', north:['S14','S12','S11','S2','H13','H12','H4','D14','D7','D4','C12','C8','C3'], expected:'2N'},
  {name:'longer clubs', north:['S14','S12','S11','S2','H13','H12','H4','D14','D7','D4','C12','C8','C7'], expected:'3C'}
];
for (const c of relayHands) {
  const auction = [
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2S'},{s:'W',c:'P'},
    {s:'N',c:'P'}
  ];
  const result = recommend(c.north, auction.slice(0,-1));
  assert.equal(result.exp,c.expected,'2S relay: '+c.name+' — '+result.why);
}

// After the relay, responder's 3m is a signoff; opener passes.
for (const [rebid,signoff] of [['2N','3D'],['3C','3D'],['2N','3C']]) {
  const auction = [
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2S'},{s:'W',c:'P'},
    {s:'N',c:rebid},{s:'E',c:'P'},
    {s:'S',c:signoff},{s:'W',c:'P'}
  ];
  const result = recommend(relayHands[0].north, auction);
  assert.equal(result.exp,'P','opener must pass after relay signoff '+rebid+'–'+signoff);
}

console.log('1NT minor invitation and weak-minor relay tests: passed.');
