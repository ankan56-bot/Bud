"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadRuntime } = require("./generate-theme-deals.js");

const casesPath = path.join(__dirname, "uncovered_cases_47.json");
const uncovered = JSON.parse(fs.readFileSync(casesPath, "utf8")).cases;
const sequenceCases = uncovered.filter(c =>
  /Öppnarens återbud efter partnerns pass och motståndarnas inkliv/i.test(c.uncoveredBid?.reason || "")
);

test("valid opener rebids after partner pass are not diagnosed as turn-order errors", () => {
  const { Rattning } = loadRuntime();
  assert.equal(sequenceCases.length, 9, "the audited regression set should contain ten cases");

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

test("opener's third bid after responder's second bid gets its own uncovered diagnosis", () => {
  const { Rattning } = loadRuntime();
  const deal = uncovered.find(c => c.id === "alla-01-bid-9");
  assert.ok(deal, "the regression case must exist");
  const index = deal.uncoveredBid.number - 1;
  const result = Rattning.nodeFor({
    hands: deal.hands,
    dealer: deal.dealer,
    bids: deal.auction
  }, index);
  assert.equal(result?.exp || null, null);
  assert.match(result?.why || "", /Öppnarens tredje bud efter 1 i färg/);
  assert.doesNotMatch(result?.why || "", /Svarshandens andra bud/);
});

test("agreed no-splinter scope prevents splinter rebids after a simple major raise", () => {
  const { Rattning } = loadRuntime();
  const hands = {
    S: ["S12","H4","S14","C6","S13","D8","S10","C8","D11","S3","C5","C13","C4"],
    N: ["C12","D2","S2","H13","S9","C9","S4","H2","D6","H10","D5","H11","S6"],
    E: ["C10","C11","H12","D3","D13","D14","S5","D12","S7","H9","H7","H8","S11"],
    W: ["C2","C7","D7","D9","D4","H3","D10","H5","H14","H6","C14","C3","S8"]
  };
  const bids = [
    { s: "S", c: "1S" }, { s: "W", c: "P" },
    { s: "N", c: "2S" }, { s: "E", c: "P" },
    { s: "S", c: "P" }
  ];
  const result = Rattning.nodeFor({ hands, dealer: "S", bids }, 4);
  assert.equal(result?.exp, "3S");
  assert.doesNotMatch(result?.why || "", /splinter/i);
});
