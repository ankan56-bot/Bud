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
    assert.equal(deal.checks.opening1NTValidated, true, deal.id);
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


test("every first-bid 1NT opening is exactly 15-17 HCP and balanced", () => {
  const { api } = loadRuntime();
  for (const deal of stored.deals) {
    const firstBid = deal.bids.find(bid => bid.c !== "P");
    if (!firstBid || firstBid.c !== "1N") continue;
    const hand = deal.hands[firstBid.s];
    const hcp = api.hpOf(hand);
    const shape = api.shapeOf(hand);
    const sorted = [shape.S, shape.H, shape.D, shape.C].sort((a, b) => b - a).join("");
    assert.ok(hcp >= 15 && hcp <= 17, deal.id + ": " + hcp + " HCP");
    assert.ok(["4333", "4432", "5332"].includes(sorted), deal.id + ": " + sorted);
  }
});

test("the NT theme only contains a genuine 15-17 HCP balanced opener", () => {
  const { api, Rattning } = loadRuntime();
  for (const deal of stored.deals.filter(item => item.theme === "nt")) {
    const opening = Rattning.nodeFor({ hands: deal.hands, dealer: deal.dealer,
      bids: [{ s: deal.dealer, c: "P" }] }, 0);
    assert.equal(opening.exp, "1N", deal.id);
    const hand = deal.hands[deal.dealer];
    const shape = api.shapeOf(hand);
    const sorted = [shape.S, shape.H, shape.D, shape.C].sort((a, b) => b - a).join("");
    assert.ok(api.hpOf(hand) >= 15 && api.hpOf(hand) <= 17, deal.id);
    assert.ok(["4333", "4432", "5332"].includes(sorted), deal.id);
  }
});
