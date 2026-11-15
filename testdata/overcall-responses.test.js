"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rattning = require("../rattningsmotor.js");

function hand(S, H, D, C) {
  return [
    ...S.map(n => "S" + n),
    ...H.map(n => "H" + n),
    ...D.map(n => "D" + n),
    ...C.map(n => "C" + n)
  ];
}

function response(opening, overcall, cards) {
  const bids = [
    { s: "W", c: opening },
    { s: "N", c: overcall },
    { s: "E", c: "P" },
    { s: "S", c: "P" }
  ];
  return Rattning.nodeFor({ hands: { S: cards }, dealer: "W", bids }, 3);
}

test("audited inkliv-05 deal: 8 hp and five-card heart support calls 4H", () => {
  const cards = ["D14","H5","H7","D3","H12","C9","C3","C12","H6","S7","D7","H10","D2"];
  assert.equal(response("1C", "1H", cards).exp, "4H");
});

test("four-card support with only 4 hp does not receive an invented raise", () => {
  const result = response("1C", "1H", hand([9,7,4],[13,12,8,6],[9,7,4],[9,6]));
  assert.equal(result.exp, null);
});

test("one-level overcall response: support raises follow 6-9 hp and 3/4/5-card support", () => {
  assert.equal(response("1C", "1H", hand([9,7,4],[13,12,11],[8,6,3],[9,6,2,3])).exp, "2H");
  assert.equal(response("1C", "1H", hand([9,7,4],[13,12,11,8],[11,8,6],[9,6,2])).exp, "3H");
  assert.equal(response("1C", "1H", hand([9,7,4],[13,12,11,9,8],[11,8,6],[9,6])).exp, "4H");
});

test("one-level overcall response: NT ranges and opening-suit stopper", () => {
  assert.equal(response("1C", "1D", hand([11,9,7,4],[14,9,7,4],[9,6],[13,9,7])).exp, "1N");
  assert.equal(response("1H", "1S", hand([9,7],[13,9,7],[14,11,9,7],[13,9,7,6])).exp, "2N");
  assert.equal(response("1H", "1S", hand([9,7],[14,9,7],[14,13,9,7],[12,11,9,7])).exp, "3N");
});

test("one-level overcall response: new suit is forcing with the documented HCP threshold", () => {
  assert.equal(response("1C", "1H", hand([14,13,9,8,7],[11,9],[8,6,3],[9,6,2])).exp, "1S");
  assert.equal(response("1H", "1S", hand([8,5],[9,7,4],[12,8,6],[14,13,11,9,8])).exp, "2C");
  const belowTwoLevelMinimum = response("1H", "1S", hand([8,5],[9,7,4],[12,8,6],[14,13,9,8,7]));
  assert.equal(belowTwoLevelMinimum.exp, null);
});

test("one-level overcall response: jump new suit and cue-bid conditions", () => {
  assert.equal(response("1C", "1H", hand([14,13,12,11,10,9],[9,7],[14,8,6,4],[8])).exp, "2S");
  assert.equal(response("1C", "1H", hand([14,9,7],[13,12,11],[8,6,3],[9,6,2,3])).exp, "2C");
});

test("the one-level response table is not applied to 2-level, jump, or 2NT overcalls", () => {
  assert.equal(response("1S", "2C", hand([9,7],[8,6,4],[14,9,7],[13,12,11,10,8])).exp, null);
  assert.equal(response("1S", "3C", hand([9,7],[8,6],[14,9,7],[13,12,11,10,8])).exp, null);
  assert.equal(response("1S", "2N", hand([14,9,7],[13,8,6],[12,9,7],[11,8,3,2])).exp, null);
});

test("no unsupported pass is invented when no documented response condition matches", () => {
  const result = response("1C", "1H", hand([9,8,7],[8,6,4],[9,8,7],[9,8,7,6]));
  assert.equal(result.exp, null);
  assert.match(result.why, /Pass kan inte fastställas|uppfyller inte något uttryckligt svarsvillkor/);
});
