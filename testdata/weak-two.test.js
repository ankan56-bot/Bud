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
  assert.equal(new Set(used).size, 26);
  const deck = ["S","H","D","C"].flatMap(suit =>
    Array.from({length:13}, (_,i) => suit + (14-i))
  );
  const rest = deck.filter(card => !used.includes(card));
  return { N:north, E:rest.slice(0,13), S:south, W:rest.slice(13,26) };
}
function fillerHand(usedHand) {
  const deck = ["S","H","D","C"].flatMap(suit =>
    Array.from({length:13}, (_,i) => suit + (14-i))
  );
  return deck.filter(card => !usedHand.includes(card)).slice(0,13);
}
function node(hands, bids, index) {
  return Rattning.nodeFor({ hands, dealer:"N", bids }, index);
}
function weakTwoHand(suit, ranks="AK9876") {
  const others = ["S","H","D","C"].filter(s => s !== suit);
  return [
    ...cards(suit,ranks),
    ...cards(others[0],"234"),
    ...cards(others[1],"234"),
    ...cards(others[2],"2")
  ];
}

test("2♦, 2♥ and 2♠ openings require exactly six cards, 6-10 HCP and a good suit", () => {
  for (const suit of ["D","H","S"]) {
    const opener = weakTwoHand(suit);
    const hands = completeDeal(opener, fillerHand(opener));
    const expected = "2" + suit;
    const result = node(hands,[{s:"N",c:expected}],0);
    assert.equal(result.exp,expected,suit);
    assert.equal(result.conv,"öppning");
  }
});

test("a six-card club suit is not treated as a weak two opening", () => {
  const opener = weakTwoHand("C");
  const hands = completeDeal(opener,fillerHand(opener));
  const result = node(hands,[{s:"N",c:"P"}],0);
  assert.equal(result.exp,"P");
});

test("responder's 3-level raise with 3+ support is preemptive, not an invit", () => {
  const opener = [
    ...cards("H","AK9876"), ...cards("S","234"),
    ...cards("D","234"), ...cards("C","2")
  ];
  const responder = [
    ...cards("H","Q32"), ...cards("S","567"),
    ...cards("D","K89"), ...cards("C","6789")
  ];
  const hands = completeDeal(opener,responder);
  const bids = [{s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"3H"}];
  const result = node(hands,bids,2);
  assert.equal(result.exp,"3H");
  assert.match(result.why,/spärrhöjning/);
  assert.match(result.means("3H"),/ej invit/i);
});

test("2NT response is an invit only with 9-10 HCP and at least two-card support", () => {
  const opener = weakTwoHand("H");
  const supportedResponder = [
    ...cards("H","Q2"), ...cards("S","AK"),
    ...cards("D","56789"), ...cards("C","6789")
  ];
  const supportedHands = completeDeal(opener,supportedResponder);
  const supported = node(supportedHands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"}
  ],2);
  assert.equal(supported.exp,"2N");

  const unsupportedResponder = [
    ...cards("H","2"), ...cards("S","AK"),
    ...cards("D","Q56789T"), ...cards("C","6789")
  ];
  const unsupportedHands = completeDeal(opener,unsupportedResponder);
  const unsupported = node(unsupportedHands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"}
  ],2);
  assert.equal(unsupported.exp,null);
  assert.match(unsupported.why,/minst 2 korts stöd/);
});

test("opener shows minimum after the 2NT inquiry with 3 in the opening suit", () => {
  const opener = weakTwoHand("H","AK9876");
  const responder = [
    ...cards("H","Q2"), ...cards("S","AK"),
    ...cards("D","Q345"), ...cards("C","678")
  ];
  const hands = completeDeal(opener,responder);
  const bids = [
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"},
    {s:"W",c:"P"},{s:"N",c:"3H"}
  ];
  const result = node(hands,bids,4);
  assert.equal(result.exp,"3H");
  assert.match(result.why,/minimum/);
});

test("opener shows maximum after the 2NT inquiry with game in the major", () => {
  const opener = weakTwoHand("H","AKQ976");
  const responder = [
    ...cards("H","Q2"), ...cards("S","AK"),
    ...cards("D","Q345"), ...cards("C","678")
  ];
  const hands = completeDeal(opener,responder);
  const bids = [
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"},
    {s:"W",c:"P"},{s:"N",c:"4H"}
  ];
  const result = node(hands,bids,4);
  assert.equal(result.exp,"4H");
  assert.match(result.why,/maximum/);
});
