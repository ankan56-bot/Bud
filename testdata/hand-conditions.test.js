"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { evaluateHandConditions, evaluateMatchedHand } = require("../analysmotor.js");
const library = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "analysbibliotek.json"), "utf8"
));

function findConditions(treeId, nodeId) {
  const tree = library.trees.find(t => t.id === treeId);
  assert.ok(tree, "tree exists: " + treeId);
  const node = tree.nodes.find(n => n.id === nodeId);
  assert.ok(node, "node exists: " + nodeId);
  return node.handConditions;
}

const t29SimpleRaise = findConditions(
  "T29_1H_1S_KONKURRENS", "t29_1h_1s_konkurrens_n1"
);
const t29Notrump = findConditions(
  "T29_1H_1S_KONKURRENS", "t29_1h_1s_konkurrens_n4"
);

test("all 25 competitive leaf nodes use valid structured responder conditions", () => {
  const ids = [
    "T29_1H_1S_KONKURRENS", "T30_1S_2H_KONKURRENS",
    "T31_1D_1S_KONKURRENS", "T32_1C_1H_KONKURRENS",
    "T33_1H_DBL_SVAR"
  ];
  let count = 0;
  for (const id of ids) {
    const tree = library.trees.find(t => t.id === id);
    assert.ok(tree);
    for (const node of tree.nodes) {
      if (!node.branches.length) {
        const c = node.handConditions;
        assert.ok(c, node.id + " missing handConditions");
        assert.equal(c.schemaVersion, 1);
        assert.equal(c.seat, "responder");
        if (c.hcp) {
          assert.ok(Number.isFinite(c.hcp.min));
          if (c.hcp.max !== undefined) assert.ok(c.hcp.max >= c.hcp.min);
        }
        for (const [suit, bounds] of Object.entries(c.suitLengths || {})) {
          assert.ok(["S", "H", "D", "C"].includes(suit));
          if (bounds.min !== undefined) assert.ok(bounds.min >= 0 && bounds.min <= 13);
          if (bounds.max !== undefined) assert.ok(bounds.max >= 0 && bounds.max <= 13);
          if (bounds.min !== undefined && bounds.max !== undefined) assert.ok(bounds.max >= bounds.min);
        }
        assert.ok(Array.isArray(c.manual || []));
        count++;
      }
    }
  }
  assert.equal(count, 25);
});

test("machine-verifiable HCP and suit-length conditions can match or reject a hand", () => {
  const fittingHand = [
    "S14", "S2", "S3",
    "H13", "H2", "H3", "H4",
    "D11", "D2", "D3",
    "C2", "C3", "C4"
  ];
  const result = evaluateHandConditions(fittingHand, t29SimpleRaise);
  assert.equal(result.status, "match");
  assert.equal(result.matches, true);
  assert.equal(result.hcp, 8);
  assert.equal(result.shape.H, 4);

  const tooShortInHearts = [
    "S14", "S2", "S3", "S4",
    "H13", "H2",
    "D11", "D2", "D3",
    "C2", "C3", "C4", "C5"
  ];
  const rejected = evaluateHandConditions(tooShortInHearts, t29SimpleRaise);
  assert.equal(rejected.status, "no_match");
  assert.equal(rejected.matches, false);
});

test("unresolved stopper requirements remain manual review, not false certainty", () => {
  const balancedHand = [
    "S14", "S2", "S3", "S4",
    "H13", "H2", "H3",
    "D11", "D2", "D3",
    "C2", "C3", "C4"
  ];
  const result = evaluateHandConditions(balancedHand, t29Notrump);
  assert.equal(result.status, "manual_review");
  assert.equal(result.matches, null);
  assert.match(result.manual.join(" "), /Spaderstopper/);
});

test("invalid or incomplete hands are rejected safely", () => {
  assert.equal(evaluateHandConditions(["S14"], t29SimpleRaise).status, "invalid_hand");
  const duplicate = Array(13).fill("S14");
  assert.equal(evaluateHandConditions(duplicate, t29SimpleRaise).status, "invalid_hand");
});

test("post-deal analysis evaluates the bidder's own hand after pass rounds", () => {
  const fittingHand = [
    "S14", "S2", "S3",
    "H13", "H2", "H3", "H4",
    "D11", "D2", "D3",
    "C2", "C3", "C4"
  ];
  const match = {
    length: 3,
    tree: { ignorePasses: true },
    node: {
      sequence: ["1♥", "1♠", "2♥"],
      handConditions: t29SimpleRaise
    }
  };
  const bids = [
    { s: "S", c: "1H" }, { s: "W", c: "P" },
    { s: "N", c: "1S" }, { s: "E", c: "P" },
    { s: "N", c: "2H" }, { s: "E", c: "P" }
  ];
  const result = evaluateMatchedHand(match, bids, { N: fittingHand });
  assert.equal(result.seat, "N");
  assert.equal(result.status, "match");
  assert.equal(result.hcp, 8);
});
