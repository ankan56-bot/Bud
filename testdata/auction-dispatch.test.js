"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadRuntime } = require("./generate-theme-deals.js");

const casesPath = path.join(__dirname, "uncovered_cases_47.json");
const uncovered = JSON.parse(fs.readFileSync(casesPath, "utf8")).cases;
const sequenceCases = uncovered.filter(c =>
  /Budgivningen följer inte ett turordnat mönster/i.test(c.uncoveredBid?.reason || "")
);

test("valid opener rebids after partner pass are not diagnosed as turn-order errors", () => {
  const { Rattning } = loadRuntime();
  assert.equal(sequenceCases.length, 10, "the audited regression set should contain ten cases");

  for (const deal of sequenceCases) {
    const index = deal.uncoveredBid.number - 1;
    const result = Rattning.nodeFor({
      hands: deal.hands,
      dealer: deal.dealer,
      bids: deal.auction
    }, index);

    assert.doesNotMatch(
      result?.why || "",
      /turordnat mönster/i,
      deal.id + " must not be called an auction-order error"
    );
    assert.match(
      result?.why || "",
      /Öppnarens återbud efter partnerns pass och motståndarnas inkliv/i,
      deal.id + " should receive the specific uncovered-rule diagnosis"
    );
    assert.equal(result?.exp || null, null, deal.id + " must remain uncovered, not receive an invented call");
  }
});
