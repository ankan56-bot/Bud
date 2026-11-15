"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
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
    assert.equal(deal.checks.openingNTValidated, true, deal.id);
  }
});

function gitBlobSha(content) {
  const header = Buffer.from("blob " + Buffer.byteLength(content) + "\0");
  return crypto.createHash("sha1").update(header).update(content).digest("hex");
}

test("manifest and dataset source metadata match the actual generator and rules engine", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "temagivare_manifest.json"), "utf8"));
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const rules = fs.readFileSync(path.join(__dirname, "..", "rattningsmotor.js"), "utf8");
  const htmlBlobSha = gitBlobSha(html);
  const rulesBlobSha = gitBlobSha(rules);
  const rulesVersion = (rules.match(/version:'([^']+)'/) || [])[1];

  assert.equal(manifest.generation.rulesEngineVersion, rulesVersion);
  assert.equal(manifest.generation.rulesEngineBlobSha, rulesBlobSha);
  assert.equal(manifest.generation.generatorBlobSha, htmlBlobSha);
  assert.equal(stored.source.rulesEngineVersion, rulesVersion);
  assert.equal(stored.source.rulesEngineBlobSha, rulesBlobSha);
  assert.equal(stored.source.generatorBlobSha, htmlBlobSha);
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


test("every first-bid 1NT or 2NT opening meets its exact range and shape", () => {
  const { api } = loadRuntime();
  for (const deal of stored.deals) {
    const firstBid = deal.bids.find(bid => bid.c !== "P");
    if (!firstBid || !["1N", "2N"].includes(firstBid.c)) continue;
    const hand = deal.hands[firstBid.s];
    const hcp = api.hpOf(hand);
    const shape = api.shapeOf(hand);
    const sorted = [shape.S, shape.H, shape.D, shape.C].sort((a, b) => b - a).join("");
    const range = firstBid.c === "1N" ? [15, 17] : [20, 21];
    assert.ok(hcp >= range[0] && hcp <= range[1], deal.id + ": " + firstBid.c + " with " + hcp + " HCP");
    assert.ok(["4333", "4432", "5332"].includes(sorted), deal.id + ": " + sorted);
  }
});


test("NT theme classification is evidence-based and preserves every hard rule", () => {
  const nt = stored.deals.filter(deal => deal.theme === "nt");
  assert.equal(nt.length, 10);
  const counts = nt.reduce((acc, deal) => {
    acc[deal.caseType] = (acc[deal.caseType] || 0) + 1;
    return acc;
  }, {});
  assert.equal(counts.typical, 10);
  assert.equal(counts.borderline || 0, 0);
  for (const deal of nt) {
    assert.equal(deal.classification.status, "rule_evidence", deal.id);
    assert.ok(deal.classification.rationale.length > 0, deal.id);
    assert.equal(deal.caseType, "typical", deal.id);
    assert.ok(deal.classification.dimensions.some(item =>
      item.rule === "1NT opening" &&
      item.boundary === "15-17 HCP and balanced"
    ), deal.id);
  }
  for (const deal of stored.deals.filter(deal => deal.theme !== "nt")) {
    assert.equal(deal.caseType, "unclassified", deal.id);
    assert.equal(deal.classification.status, "pending", deal.id);
  }
});


test("all first-bid 2C openings satisfy the strong-opening rule", () => {
  const { api } = loadRuntime();
  for (const deal of stored.deals) {
    const firstBid = deal.bids.find(bid => bid.c !== "P");
    if (!firstBid || firstBid.c !== "2C") continue;
    const hand = deal.hands[firstBid.s];
    const hcp = api.hpOf(hand);
    const balanced = api.isBalanced ? api.isBalanced(hand) :
      [api.shapeOf(hand).S, api.shapeOf(hand).H, api.shapeOf(hand).D, api.shapeOf(hand).C]
        .sort((a, b) => b - a).join("") in { "4333": 1, "4432": 1, "5332": 1 };
    assert.ok(hcp >= 22 || (hcp >= 20 && hcp <= 21 && !balanced),
      deal.id + ": invalid 2C opening with " + hcp + " HCP");
  }
});

test("the strong 2C theme consists only of 22+ HCP openings", () => {
  const { api } = loadRuntime();
  const deals = stored.deals.filter(deal => deal.theme === "tva");
  assert.equal(deals.length, 10);
  for (const deal of deals) {
    const firstBid = deal.bids.find(bid => bid.c !== "P");
    assert.equal(firstBid.c, "2C", deal.id);
    assert.ok(api.hpOf(deal.hands[firstBid.s]) >= 22, deal.id);
  }
});


test("all Stenberg theme deals contain a genuine 13+ HTP, 4+ support 2NT response", () => {
  const { api, Rattning } = loadRuntime();
  const deals = stored.deals.filter(deal => deal.theme === "stenberg");
  assert.equal(deals.length, 10);
  for (const deal of deals) {
    const openingIndex = deal.bids.findIndex(bid => /^[1][CDHS]$/.test(bid.c));
    assert.ok(openingIndex >= 0, deal.id + ": missing suit opening");
    const opening = deal.bids[openingIndex];
    const responseIndex = deal.bids.findIndex((bid, position) =>
      position > openingIndex && bid.s === (opening.s === "N" ? "S" : "N"));
    const response = deal.bids[responseIndex];
    assert.ok(response, deal.id + ": missing response");
    assert.equal(response.c, "2N", deal.id);
    assert.ok(deal.bids.slice(openingIndex + 1, responseIndex).every(bid => bid.c === "P"), deal.id);
    const shape = api.shapeOf(deal.hands[response.s]);
    assert.ok(shape[opening.c[1]] >= 4, deal.id + ": fewer than 4-card support");
    const htp = Rattning.H(deal.hands[response.s]).htp(opening.c[1]);
    assert.ok(htp >= 13, deal.id + ": Stenberg requires at least 13 HTP, got " + htp);
    const judged = Rattning.judge({ hands: deal.hands, dealer: deal.dealer, bids: deal.bids });
    const responseItem = judged.items.find(item => item.nr === responseIndex + 1);
    assert.equal(responseItem.htp, htp, deal.id + ": Stenberg response should display HTP in the agreed suit");
    const node = Rattning.nodeFor({
      hands: deal.hands, dealer: deal.dealer, bids: deal.bids.slice(0, responseIndex + 1)
    }, responseIndex);
    assert.equal(node.conv, "Stenberg", deal.id);
    assert.equal(node.exp, "2N", deal.id);
  }
});


test("all trumf support theme deals contain a valid uncontested support raise", () => {
  const { api, Rattning } = loadRuntime();
  const deals = stored.deals.filter(deal => deal.theme === "trumf");
  assert.equal(deals.length, 10);
  for (const deal of deals) {
    const openingIndex = deal.bids.findIndex(bid => /^[1][CDHS]$/.test(bid.c));
    const opening = deal.bids[openingIndex];
    assert.ok(opening, deal.id + ": missing suit opening");
    const responseIndex = deal.bids.findIndex((bid, position) =>
      position > openingIndex && bid.s === (opening.s === "N" ? "S" : "N"));
    const response = deal.bids[responseIndex];
    assert.ok(response, deal.id + ": missing support response");
    assert.ok(deal.bids.slice(openingIndex + 1, responseIndex).every(bid => bid.c === "P"), deal.id);
    assert.ok(/^[23][CDHS]$/.test(response.c) && response.c[1] === opening.c[1], deal.id);
    assert.ok(api.shapeOf(deal.hands[response.s])[opening.c[1]] >= 4, deal.id);
    const node = Rattning.nodeFor({
      hands: deal.hands, dealer: deal.dealer, bids: deal.bids.slice(0, responseIndex + 1)
    }, responseIndex);
    assert.equal(node.exp, response.c, deal.id);
  }
});


test("Stenberg opener shows 15+ HTP without a singleton", () => {
  const { Rattning } = loadRuntime();
  const north = ["H14","H12","H9","H8","S14","S13","S2","D12","D3","D2","C7","C6","C5"];
  const south = ["H13","H11","H10","H7","S12","S11","S10","D11","D10","D9","C4","C3","C2"];
  const used = new Set([...north, ...south]);
  const deck = ["S","H","D","C"].flatMap(suit =>
    Array.from({length:13}, (_,i) => suit + String(i+2)));
  const remaining = deck.filter(card => !used.has(card));
  const hands = { N:north, E:remaining.slice(0,13), S:south, W:remaining.slice(13) };
  const bids = [
    {s:"N",c:"1H"}, {s:"E",c:"P"}, {s:"S",c:"2N"},
    {s:"W",c:"P"}, {s:"N",c:"3H"}
  ];
  const node = Rattning.nodeFor({hands, dealer:"N", bids}, 4);
  assert.equal(Rattning.H(north).hp, 15);
  assert.equal(Rattning.H(north).htp("H"), 15);
  assert.equal(node.conv, "Stenberg");
  assert.equal(node.exp, "3H");
  assert.match(node.why, /15\+ stp/);
  assert.match(node.means("3H"), /15\+ htp/);
  assert.match(node.means("3N"), /12-14 hp/);
});

test("Stenberg counts HCP plus support points only after 4+ trump support", () => {
  const { Rattning } = loadRuntime();

  // 12 HCP, four hearts and one doubleton: 12 HCP + 1 support point = 13 HTP.
  const twelvePlusOne = [
    "S14", "S2",
    "H14", "H2", "H3", "H4",
    "D14", "D2", "D3",
    "C2", "C3", "C4", "C5"
  ];
  const supported = Rattning.H(twelvePlusOne);
  assert.equal(supported.hp, 12);
  assert.equal(supported.htp("H"), 13);

  // Same 12 HCP with a balanced 4-3-3-3 hand: no shortage points.
  const twelveFlat = [
    "S14", "S2", "S3",
    "H14", "H2", "H3", "H4",
    "D14", "D2", "D3",
    "C2", "C3", "C4"
  ];
  const balanced = Rattning.H(twelveFlat);
  assert.equal(balanced.hp, 12);
  assert.equal(balanced.htp("H"), 12);

  // With only three trumps, the response logic must not use shortage points
  // to manufacture Stenberg; it evaluates the hand on HCP alone.
  const threeTrumpHand = [
    "S14", "S2",
    "H14", "H2", "H3",
    "D14", "D2", "D3", "D4", "D5",
    "C2", "C3", "C4"
  ];
  const deck = [];
  for (const suit of ["S", "H", "D", "C"]) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  const available = deck.filter(card => !threeTrumpHand.includes(card));
  const openerHearts = available.filter(card => card[0] === "H").slice(0, 5);
  const openerExtras = available.filter(card => !openerHearts.includes(card)).slice(0, 8);
  const openerHand = openerHearts.concat(openerExtras);
  const rest = available.filter(card => !openerHand.includes(card));
  const hands = {
    N: openerHand,
    E: rest.slice(0, 13),
    S: threeTrumpHand,
    W: rest.slice(13, 26)
  };
  const result = Rattning.nodeFor({
    hands,
    dealer: "N",
    bids: [{s:"N",c:"1H"},{s:"E",c:"P"},{s:"S",c:"P"}]
  }, 2);
  assert.notEqual(result.exp, "2N");
  assert.notEqual(result.conv, "Stenberg");
});


test("reverse rebid strength does not count shortage points without a confirmed fit", () => {
  const { Rattning } = loadRuntime();
  const north = ["C14","C13","C12","C9","C8","D14","D13","D7","D6","H5","H4","S5","S4"];
  const south = ["H14","H13","H12","H11","D5","D4","D3","S8","S6","S3","S2","C7","C6"];
  const used = new Set([...north, ...south]);
  const deck = ["S","H","D","C"].flatMap(suit =>
    Array.from({length:13}, (_,i) => suit + String(i+2)));
  const remaining = deck.filter(card => !used.has(card));
  const hands = { N:north, S:south, E:remaining.slice(0,13), W:remaining.slice(13) };
  const bids = [
    {s:"N",c:"1C"}, {s:"E",c:"P"}, {s:"S",c:"1H"},
    {s:"W",c:"P"}, {s:"N",c:"2C"}
  ];
  const node = Rattning.nodeFor({hands, dealer:"N", bids}, 4);
  assert.equal(Rattning.H(north).hp, 16);
  assert.equal(Rattning.H(north).htp("D"), 18);
  assert.equal(node.exp, "2C");
  assert.match(node.why, /Utan styrka för reverse/);
  const judged = Rattning.judge({hands, dealer:"N", bids});
  const openerItem = judged.items.find(item => item.nr === 5);
  assert.ok(openerItem, "the opener's second bid should be included in the correction result");
  assert.equal(openerItem.hp, 16);
  assert.equal(openerItem.htp, 16, "do not display unsupported shortage points as HTP");
});

test("partnership fit bonus is +1 for nine trumps and +2 for ten", () => {
  const { Rattning } = loadRuntime();
  const hand = (suits) => {
    const ranks = {S:[2,3,4,5,6,7,8,9,10,11,12,13,14],
                   H:[2,3,4,5,6,7,8,9,10,11,12,13,14],
                   D:[2,3,4,5,6,7,8,9,10,11,12,13,14],
                   C:[2,3,4,5,6,7,8,9,10,11,12,13,14]};
    return Object.entries(suits).flatMap(([s,n]) => ranks[s].slice(0,n).map(r => s+r));
  };

  // Eight-card fit: 4-4 trumps, 3-3-3 side suits, no shortage points.
  const eightA = hand({H:4,S:3,D:3,C:3});
  const eightB = hand({H:4,S:3,D:3,C:3});
  assert.equal(Rattning.partnershipPoints(Rattning.H(eightA),Rattning.H(eightB),"H"),0);

  // Nine-card fit: one hand has a doubleton; +1 shortage and +1 fit bonus.
  const nineA = hand({H:5,S:3,D:3,C:2});
  const nineB = hand({H:4,S:3,D:3,C:3});
  assert.equal(Rattning.partnershipPoints(Rattning.H(nineA),Rattning.H(nineB),"H"),2);

  // Ten-card fit: both hands have a doubleton; +2 shortage and +2 fit bonus.
  const tenA = hand({H:5,S:3,D:3,C:2});
  const tenB = hand({H:5,S:3,D:3,C:2});
  assert.equal(Rattning.partnershipPoints(Rattning.H(tenA),Rattning.H(tenB),"H"),4);

  // Eleven-card fit still receives only +2, not a larger length bonus.
  const elevenA = hand({H:6,S:3,D:2,C:2});
  const elevenB = hand({H:5,S:3,D:3,C:2});
  assert.equal(Rattning.partnershipPoints(Rattning.H(elevenA),Rattning.H(elevenB),"H"),5);
});
