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

test("5C response to partner's 4NT ace ask is not mistaken for a final game contract", () => {
  const hands = deal();
  const bids = [
    { s: "N", c: "1S" },
    { s: "E", c: "P" },
    { s: "S", c: "2S" },
    { s: "W", c: "P" },
    { s: "N", c: "4N" },
    { s: "E", c: "P" },
    { s: "S", c: "5C" },
    { s: "W", c: "P" },
    { s: "N", c: "P" }
  ];
  const result = Rattning.nodeFor({ hands, dealer: "N", bids }, 8);
  assert.equal(result?.exp, "6S");
  assert.doesNotMatch(result?.why || "", /Partnern har redan bjudit utgång/);
});
