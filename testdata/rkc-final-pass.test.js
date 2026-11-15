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

for (const response of ["5C", "5D"]) {
  test(response + " response to partner's 4NT ace ask continues the agreed spade slam investigation", () => {
    const result = askAfterResponse(response);
    assert.equal(result?.exp, "6S");
    assert.doesNotMatch(result?.why || "", /Partnern har redan bjudit utgång/);
  });
}

for (const response of ["5H", "5S"]) {
  test(response + " response to 4NT continues to the agreed spade slam level", () => {
    const result = askAfterResponse(response);
    assert.equal(result?.exp, "6S");
  });
}

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
