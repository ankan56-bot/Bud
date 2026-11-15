"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { generateDataset, loadRuntime } = require("./generate-theme-deals.js");

const DATA_PATH = path.join(__dirname, "theme_deals_140.json");
const stored = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

test("dataset contains exactly 140 valid deals, 10 for each of 14 themes", () => {
  assert.equal(stored.deals.length, 140);
  assert.equal(stored.summary.dealCount, 140);
  assert.equal(Object.keys(stored.summary.themeStats).length, 14);
  for (const [theme, stats] of Object.entries(stored.summary.themeStats)) {
    assert.equal(stats.deals, 10, theme);
  }
  for (const deal of stored.deals) {
    const cards = Object.values(deal.hands).flat();
    assert.equal(cards.length, 52, deal.id);
    assert.equal(new Set(cards).size, 52, deal.id);
    for (const seat of ["N", "E", "S", "W"]) assert.equal(deal.hands[seat].length, 13, deal.id);
    assert.equal(deal.checks.themeCondition, true, deal.id);
    assert.equal(deal.checks.auctionErrors, 0, deal.id);
  }
});

test("all stored reference auctions pass the current structural validator", () => {
  const { Rattning } = loadRuntime();
  for (const deal of stored.deals) {
    const result = Rattning.validateAuction({ hands: deal.hands, dealer: deal.dealer, bids: deal.bids });
    assert.equal(JSON.stringify(result.errors), "[]", deal.id);
  }
});

test("fixed seeds reproduce hands, auctions and correction results", () => {
  const regenerated = generateDataset();
  assert.equal(regenerated.deals.length, stored.deals.length);
  assert.equal(regenerated.source.rulesEngineVersion, RattningVersion());
  assert.deepEqual(regenerated.summary, stored.summary, "stored summary must match the current correction engine");
  for (let i = 0; i < stored.deals.length; i++) {
    assert.equal(regenerated.deals[i].id, stored.deals[i].id);
    assert.equal(regenerated.deals[i].seed, stored.deals[i].seed);
    assert.equal(JSON.stringify(regenerated.deals[i].hands), JSON.stringify(stored.deals[i].hands), stored.deals[i].id);
    assert.equal(JSON.stringify(regenerated.deals[i].bids), JSON.stringify(stored.deals[i].bids), stored.deals[i].id);
    assert.equal(JSON.stringify(regenerated.deals[i].correction), JSON.stringify(stored.deals[i].correction), stored.deals[i].id + " correction");
  }
});

function RattningVersion() {
  return loadRuntime().Rattning.version;
}

test("the 140-deal baseline contains no incorrect grades", () => {
  assert.equal(stored.summary.gradeCounts.fel || 0, 0);
  for (const [theme, stats] of Object.entries(stored.summary.themeStats)) {
    assert.equal(stats.wrong, 0, theme);
  }
});
