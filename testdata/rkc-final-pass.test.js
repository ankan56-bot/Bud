"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rattning = require("../rattningsmotor.js");

function deal() {
  const cards = [];
  for (const suit of ["S", "H", "D", "C"]) {
    for (let rank = 14; rank >= 2; rank--) cards.push(suit + rank);
  }
  return {
    N: cards.slice(0, 13),
    E: cards.slice(13, 26),
    S: cards.slice(26, 39),
    W: cards.slice(39, 52)
  };
}

function askAfterResponse(response) {
  const bids = [
    { s: "N", c: "1S" },
    { s: "E", c: "P" },
    { s: "S", c: "2S" },
    { s: "W", c: "P" },
    { s: "N", c: "4N" },
    { s: "E", c: "P" },
    { s: "S", c: response },
    { s: "W", c: "P" },
    { s: "N", c: "P" }
  ];
  return Rattning.nodeFor({ hands: deal(), dealer: "N", bids }, 8);
}

for (const response of ["5C", "5D", "5H", "5S"]) {
  test(response + " trump RKC response does not invent an unsupported asker continuation", () => {
    const result = askAfterResponse(response);
    assert.equal(result?.exp, null);
    assert.match(result?.why || "", /inte ett entydigt nästa bud|inte uttryckligen fastställd/i);
  });
}

function dealWithSouth(south) {
  const deck = [];
  for (const suit of ["S", "H", "D", "C"]) {
    for (let rank = 14; rank >= 2; rank--) deck.push(suit + rank);
  }
  const chosen = new Set(south);
  const rest = deck.filter(card => !chosen.has(card));
  return {
    N: rest.slice(0, 13),
    E: rest.slice(13, 26),
    S: south,
    W: rest.slice(26, 39)
  };
}

function responseFromSouthHand(south, trump = "S") {
  const hands = dealWithSouth(south);
  const bids = [
    { s: "N", c: "1" + trump }, { s: "E", c: "P" },
    { s: "S", c: "2" + trump }, { s: "W", c: "P" },
    { s: "N", c: "4N" }, { s: "E", c: "P" },
    { s: "S", c: "P" }
  ];
  return Rattning.nodeFor({ hands, dealer: "N", bids }, 6);
}

test("two keycards and a club void are shown by 6C when clubs are below trumps", () => {
  const hand = ["S14", "S10", "S9", "H14", "H13", "H12", "H11", "D10", "D13", "D12", "D11", "D9", "D8"];
  const result = responseFromSouthHand(hand);
  assert.deepEqual(Rattning.H(hand).L, { C: 0, D: 6, H: 4, S: 3 }, "test hand must contain exactly one club void");
  assert.equal(result?.exp, "6C", JSON.stringify(result));
});

test("three keycards and a void are shown by 5NT", () => {
  const hand = ["S14", "S13", "S10", "S9", "D14", "D10", "D9", "D8", "H10", "H9", "H8", "H7", "H6"];
  const result = responseFromSouthHand(hand);
  assert.deepEqual(Rattning.H(hand).L, { C: 0, D: 4, H: 5, S: 4 });
  assert.equal(result?.exp, "5N", JSON.stringify(result));
});

test("two keycards and a heart void below spade trumps are shown by 6H", () => {
  const hand = ["S14", "S10", "S9", "S8", "D14", "D13", "D12", "D11", "D10", "D9", "D8", "D7", "C13"];
  const result = responseFromSouthHand(hand);
  assert.equal(result?.exp, "6H");
});

test("two keycards and a spade void above heart trumps are shown by 6H", () => {
  const hand = ["H13", "H10", "H9", "H8", "D14", "D10", "D9", "D8", "C12", "C11", "C10", "C9", "C8"];
  const result = responseFromSouthHand(hand, "H");
  assert.deepEqual(Rattning.H(hand).L, { C: 5, D: 4, H: 4, S: 0 });
  assert.equal(result?.exp, "6H", JSON.stringify(result));
});

test("a documented no-trump four-ace ask uses 5NT as the final contract after fewer than four aces", () => {
  const hands = deal();
  const bids = [
    { s: "N", c: "1N" },
    { s: "E", c: "P" },
    { s: "S", c: "4N" },
    { s: "W", c: "P" },
    { s: "N", c: "5C" },
    { s: "E", c: "P" },
    { s: "S", c: "P" }
  ];
  const result = Rattning.nodeFor({ hands, dealer: "N", bids }, 6);
  assert.equal(result?.exp, "5N");
  assert.match(result?.why || "", /sangslutbud/i);
});

test("responder passes after the asker fixes the no-trump final contract at 5NT", () => {
  const hands = deal();
  const bids = [
    { s: "N", c: "1N" },
    { s: "E", c: "P" },
    { s: "S", c: "4N" },
    { s: "W", c: "P" },
    { s: "N", c: "5C" },
    { s: "E", c: "P" },
    { s: "S", c: "5N" },
    { s: "W", c: "P" },
    { s: "N", c: "P" }
  ];
  const result = Rattning.nodeFor({ hands, dealer: "N", bids }, 8);
  assert.equal(result?.exp, "P");
  assert.match(result?.why || "", /Pass efter att frågeställaren har fastställt sangslutbudet/);
});
