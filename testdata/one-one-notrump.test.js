"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rattning = require("../rattningsmotor.js");

const RANKS = { A:14, K:13, Q:12, J:11, T:10 };
function cards(suit, ranks) {
  return [...ranks].map(rank => suit + (RANKS[rank] || Number(rank)));
}
function completeDeal(north, south) {
  const used = [...north, ...south];
  assert.equal(north.length, 13);
  assert.equal(south.length, 13);
  assert.equal(new Set(used).size, 26, "N/S hands must not overlap");
  const deck = ["S","H","D","C"].flatMap(suit =>
    Array.from({length:13}, (_,i) => suit + (14-i))
  );
  const rest = deck.filter(card => !used.includes(card));
  return { N:north, S:south, E:rest.slice(0,13), W:rest.slice(13,26) };
}
function auction(opener, opening, responderSecond) {
  const bids = [
    {s:"N",c:opening}, {s:"E",c:"P"},
    {s:"S",c:"1N"}, {s:"W",c:"P"},
    {s:"N",c:opener}, {s:"E",c:"P"}
  ];
  if (responderSecond) bids.push({s:"S",c:responderSecond});
  return bids;
}
function node(hands, bids, index) {
  return Rattning.nodeFor({hands,dealer:"N",bids},index);
}

const balanced18 = [
  ...cards("H","AKQ23"), ...cards("S","AK2"),
  ...cards("D","Q23"), ...cards("C","45")
];
const responder8WithHeartFit = [
  ...cards("H","456"), ...cards("S","J34"),
  ...cards("D","A45"), ...cards("C","K678")
];

test("1♦–1NT: balanced 18 hp opener rebids 2NT; 8 hp responder accepts 3NT", () => {
  const hands = completeDeal(
    [...cards("D","AKQJ"), ...cards("H","A23"), ...cards("S","K23"), ...cards("C","J23")],
    [...cards("C","K456"), ...cards("D","567"), ...cards("H","K89"), ...cards("S","Q89")]
  );
  const bids = auction("2N","1D");
  const opener = node(hands,bids,4);
  assert.equal(opener.exp,"2N");
  const full = bids.concat([{s:"S",c:"3N"}]);
  const responder = node(hands,full,6);
  assert.equal(responder.exp,"3N");
  assert.match(responder.why,/26 gemensamma honnörspoäng/);
});

test("1♥–1NT: 8-card heart fit and 26+ playing points selects 4♥", () => {
  const hands = completeDeal(balanced18,responder8WithHeartFit);
  const bids = auction("2N","1H").concat([{s:"S",c:"4H"}]);
  const result = node(hands,bids,6);
  assert.equal(result.exp,"4H");
  assert.match(result.why,/8-korts fit i ♥/);
});

test("1♠–1NT: 8-card spade fit and 26+ playing points selects 4♠", () => {
  const opener = [
    ...cards("S","AKQ23"), ...cards("H","AK2"),
    ...cards("D","Q23"), ...cards("C","45")
  ];
  const responder = [
    ...cards("S","456"), ...cards("H","J34"),
    ...cards("D","A45"), ...cards("C","K678")
  ];
  const hands = completeDeal(opener,responder);
  const bids = auction("2N","1S").concat([{s:"S",c:"4S"}]);
  const result = node(hands,bids,6);
  assert.equal(result.exp,"4S");
  assert.match(result.why,/8-korts fit i ♠/);
});

test("1♥–1NT: 18 + 7 hp is below game and passes 2NT", () => {
  const responder7 = [
    ...cards("H","4"), ...cards("S","J345"),
    ...cards("D","A45"), ...cards("C","Q6789")
  ];
  const hands = completeDeal(balanced18,responder7);
  const bids = auction("2N","1H").concat([{s:"S",c:"P"}]);
  const result = node(hands,bids,6);
  assert.equal(result.exp,"P");
  assert.match(result.why,/25 gemensamma honnörspoäng/);
});

test("1♦ opener with 6 diamonds and 16 htp rebids at the 2-level, not 3-level", () => {
  const opener = [
    ...cards("D","AKJ234"), ...cards("H","A23"),
    ...cards("S","Q2"), ...cards("C","45")
  ];
  const responder = [
    ...cards("C","K236"), ...cards("D","567"),
    ...cards("H","K89"), ...cards("S","J89")
  ];
  const hands = completeDeal(opener,responder);
  const bids = auction("2D","1D");
  const result = node(hands,bids,4);
  assert.equal(result.exp,"2D");
  assert.match(result.why,/16 htp, lägsta nivå/);
});

test("1♥–1NT–2♣: responder may rebid a 6-card diamond suit at the lowest legal level 2♦", () => {
  const opener = [
    ...cards("H","AK234"), ...cards("C","AK23"),
    ...cards("S","J5"), ...cards("D","67")
  ];
  const responder = [
    ...cards("D","AK2345"), ...cards("H","567"),
    ...cards("S","89"), ...cards("C","89")
  ];
  const hands = completeDeal(opener,responder);
  const bids = [
    {s:"N",c:"1H"},{s:"E",c:"P"},{s:"S",c:"1N"},
    {s:"W",c:"P"},{s:"N",c:"2C"},{s:"E",c:"P"},{s:"S",c:"2D"}
  ];
  const result = node(hands,bids,6);
  assert.equal(result.exp,"2D");
  assert.match(result.why,/6\+ ♦/);
  assert.equal(result.conv,"svar efter 1NT");
});

test("1-1NT branch stops at game and never recommends a slam", () => {
  const hands = completeDeal(balanced18,responder8WithHeartFit);
  const bids = auction("2N","1H").concat([{s:"S",c:"4H"}]);
  const result = node(hands,bids,6);
  assert.ok(["3N","4H","4S","P"].includes(result.exp));
  assert.ok(!/^6|^7|^5N|^4N/.test(result.exp));
});
