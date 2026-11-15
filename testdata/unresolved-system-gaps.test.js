"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Rattning = require("../rattningsmotor.js");

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "uncovered_cases_47.json"), "utf8")).cases;

function grade(id) {
  const deal = cases.find(item => item.id === id);
  assert.ok(deal, "missing audited case " + id);
  const index = deal.uncoveredBid.number - 1;
  return Rattning.nodeFor({
    hands: deal.hands,
    dealer: deal.dealer,
    bids: deal.auction
  }, index);
}

test("all eight takeout-doubler rebids remain uncovered without a sourced continuation rule", () => {
  const ids = [
    "dubbling-01-bid-6",
    "dubbling-03-bid-6",
    "dubbling-05-bid-6",
    "dubbling-06-bid-6",
    "dubbling-07-bid-6",
    "dubbling-08-bid-6",
    "dubbling-10-bid-6",
    "inkliv-09-bid-6"
  ];
  for (const id of ids) {
    const result = grade(id);
    assert.equal(result?.exp || null, null, id + " must not receive an invented rebid");
  }
});

test("responses after unsupported overcall levels remain uncovered", () => {
  const ids = [
    "alla-02-bid-5",   // 2NT overcall
    "inkliv-03-bid-4", // 2-level minor overcall
    "inkliv-04-bid-4", // jump overcall at 3-level
    "inkliv-06-bid-4", // jump overcall at 3-level
    "inkliv-07-bid-4", // jump 2-major overcall; weak-two response choice unresolved
    "inkliv-08-bid-4"  // jump overcall at 3-level
  ];
  for (const id of ids) {
    const result = grade(id);
    assert.equal(result?.exp || null, null, id + " must remain uncovered until its own continuation rule is specified");
  }
});

test("jump 2-major overcall explains weak-two calls without inventing their priority", () => {
  const result = grade("inkliv-07-bid-4");
  assert.equal(result?.exp || null, null);
  assert.match(result.means("3S") || "", /spärrhöjning.*3\+ stöd.*inte invit/i);
  assert.match(result.means("2N") || "", /invitbud.*2\+ stöd/i);
  assert.match(result.means("3H") || "", /ny färg.*5\+ kort.*krav/i);
});
