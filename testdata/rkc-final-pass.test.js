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
