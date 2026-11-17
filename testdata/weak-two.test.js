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

test("3 in the opening suit is a preemptive raise with 3+ support, not an invit", () => {
  const opener = [
    ...cards("H","AK9876"), ...cards("S","234"),
    ...cards("D","234"), ...cards("C","2")
  ];
  const responder = [
    ...cards("H","Q32"), ...cards("S","567"),
    ...cards("D","K89"), ...cards("C","6789")
  ];
  const hands = completeDeal(opener,responder);
  const result = node(hands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"3H"}
  ],2);
  assert.equal(result.exp,"3H");
  assert.match(result.why,/spärrhöjning/);
  assert.match(result.means("3H"),/ej invit/i);
});

test("2NT is an invit and requires 2+ support; no unsupported responder point range is invented", () => {
  const opener = weakTwoHand("H");
  const supportedResponder = [
    ...cards("H","Q2"), ...cards("S","AK"),
    ...cards("D","Q5678"), ...cards("C","6789")
  ];
  const supported = node(completeDeal(opener,supportedResponder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"}
  ],2);
  assert.equal(supported.exp,"2N");
  assert.match(supported.why,/ingen exakt hp-gräns/i);

  const unsupportedResponder = [
    ...cards("H","2"), ...cards("S","AK"),
    ...cards("D","Q56789"), ...cards("C","6789")
  ];
  const unsupported = node(completeDeal(opener,unsupportedResponder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"}
  ],2);
  assert.equal(unsupported.exp,null);
  assert.match(unsupported.why,/minst 2 korts stöd/);
});

test("a new suit with 5+ cards is forcing to at least 3 in opener's suit", () => {
  const opener = weakTwoHand("H");
  const responder = [
    ...cards("H","2"), ...cards("S","AKQJ9"),
    ...cards("D","567"), ...cards("C","6789")
  ];
  const hands = completeDeal(opener,responder);
  const result = node(hands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2S"}
  ],2);
  assert.equal(result.exp,"2S");
  assert.match(result.why,/krav till minst 3/);
});

test("a jump in a new suit with a void is a slam invitation", () => {
  const opener = weakTwoHand("H");
  const responder = [
    ...cards("H","Q2"), ...cards("D","AKQJ98"),
    ...cards("C","KQJ98")
  ];
  const hands = completeDeal(opener,responder);
  const result = node(hands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"3S"}
  ],2);
  assert.equal(result.exp,"3S");
  assert.match(result.why,/renons och är slaminvit/);
});

test("3NT is treated as the documented final contract", () => {
  const opener = weakTwoHand("H");
  const hands = completeDeal(opener,fillerHand(opener));
  const result = node(hands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"3N"}
  ],2);
  assert.equal(result.exp,"3N");
  assert.match(result.why,/slutbud/);
});

test("opener completes the forcing new-suit response with at least 3 in the opening suit", () => {
  const opener = weakTwoHand("H");
  const responder = [
    ...cards("H","2"), ...cards("S","AKQJ9"),
    ...cards("D","567"), ...cards("C","6789")
  ];
  const hands = completeDeal(opener,responder);
  const result = node(hands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2S"},
    {s:"W",c:"P"},{s:"N",c:"3H"}
  ],4);
  assert.equal(result.exp,"3H");
  assert.match(result.why,/krav.*3 i öppningsfärgen/i);
});

test("after 2NT, opener shows minimum (6-8 hp) with 3 in the opening suit", () => {
  const opener = weakTwoHand("H","AK9876");
  const responder = [
    ...cards("H","T2"), ...cards("S","AK"),
    ...cards("D","Q5678"), ...cards("C","6789")
  ];
  const result = node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"},
    {s:"W",c:"P"},{s:"N",c:"3H"}
  ],4);
  assert.equal(result.exp,"3H");
  assert.match(result.why,/6-8 hp/);
});

test("after 2NT, a maximum major opener shows 4M with 3NT as the documented alternative", () => {
  const opener = weakTwoHand("H","AKQ976");
  const responder = [
    ...cards("H","T2"), ...cards("S","AK"),
    ...cards("D","Q5678"), ...cards("C","6789")
  ];
  const result = node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"},
    {s:"W",c:"P'},{s:"N",c:"4H"}
  ],4);
  assert.equal(result.exp,"4H");
  assert.ok(result.alt.includes("3N"));
  assert.match(result.why,/9-10 hp/);
});

test("after 2NT, a maximum minor opener rebids 3NT, never 4 in the minor", () => {
  const opener = weakTwoHand("D","AKQ976");
  const responder = [
    ...cards("D","T2"), ...cards("S","AK"),
    ...cards("H","Q5678"), ...cards("C","6789")
  ];
  const result = node(completeDeal(opener,responder),[
    {s:"N",c:"2D"},{s:"E",c:"P"},{s:"S",c:"2N"},
    {s:"W",c:"P"},{s:"N",c:"3N"}
  ],4);
  assert.equal(result.exp,"3N");
  assert.match(result.why,/inte 4 i lågfärgen/);
});
