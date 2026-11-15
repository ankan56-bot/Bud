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

function responseFromSouthHand(south) {
  const hands = dealWithSouth(south);
  const bids = [
    { s: "N", c: "1S" }, { s: "E", c: "P" },
    { s: "S", c: "2S" }, { s: "W", c: "P" },
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

test("two keycards and a heart void above spade trumps are shown by 6S", () => {
  const hand = ["S14", "S10", "S9", "S8", "D14", "D13", "D12", "D11", "D10", "D9", "D8", "D7", "C13"];
  const result = responseFromSouthHand(hand);
  assert.equal(result?.exp, "6S");
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
