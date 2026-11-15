"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { evaluateHandConditions, evaluateMatchedHand } = require("../analysmotor.js");
const library = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "analysbibliotek.json"), "utf8"
));

function node(treeId, nodeId) {
  const tree = library.trees.find(t => t.id === treeId);
  assert.ok(tree, "tree exists: " + treeId);
  const found = tree.nodes.find(n => n.id === nodeId);
  assert.ok(found, "node exists: " + nodeId);
  return found;
}

test("all 114 existing hand-profile nodes have role-specific structured profiles", () => {
  let count = 0;
  let roleProfiles = 0;
  for (const tree of library.trees) {
    for (const n of tree.nodes) {
      if (!n.handProfile) continue;
      count++;
      assert.ok(n.handConditionsByRole, n.id + " missing handConditionsByRole");
      for (const [role, sourceText] of Object.entries(n.handProfile)) {
        const c = n.handConditionsByRole[role];
        assert.ok(c, n.id + " missing " + role + " profile");
        assert.equal(c.schemaVersion, 1);
        assert.equal(c.seat, role);
        assert.equal(c.authority, "analysis_only");
        assert.equal(c.sourceText, sourceText);
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
        assert.ok(c.hcp || c.balanced === true || Object.keys(c.suitLengths || {}).length || c.manual?.length,
          n.id + " has neither machine criteria nor manual review");
        roleProfiles++;
      }
    }
  }
  assert.equal(count, 114);
  assert.equal(roleProfiles, 228);
});

test("explicit three-or-four-card support is encoded without inventing a single length", () => {
  const c = node("T10_1H_ENKEL_HOJNING", "t10_n1").handConditionsByRole.responder;
  assert.deepEqual(c.hcp, { min: 6, max: 9 });
  assert.deepEqual(c.suitLengths.H, { min: 3, max: 4 });
  assert.equal(c.manual, undefined);
});

test("post-deal evaluation chooses the role of the actual final bidder", () => {
  const responderHand = [
    "S14", "S2", "S3",
    "H13", "H2", "H3", "H4",
    "D11", "D2", "D3",
    "C2", "C3", "C4"
  ];
  const responderNode = node("T10_1H_ENKEL_HOJNING", "t10_n0");
  const responderBids = [
    { s: "N", c: "1H" }, { s: "E", c: "P" },
    { s: "S", c: "2H" }, { s: "W", c: "P" }
  ];
  const responderResult = evaluateMatchedHand(
    { length: 3, node: responderNode }, responderBids, { S: responderHand }
  );
  assert.equal(responderResult.role, "responder");
  assert.equal(responderResult.status, "match");
  assert.equal(responderResult.hcp, 8);

  const openerHand = [
    "S14", "S13", "S2",
    "H14", "H13", "H2", "H3", "H4",
    "D11", "D2",
    "C3", "C4", "C5"
  ];
  const openerNode = node("T10_1H_ENKEL_HOJNING", "t10_n1");
  const openerBids = [
    { s: "N", c: "1H" }, { s: "E", c: "P" },
    { s: "S", c: "2H" }, { s: "W", c: "P" },
    { s: "N", c: "3H" }
  ];
  const openerResult = evaluateMatchedHand(
    { length: 5, node: openerNode }, openerBids, { N: openerHand }
  );
  assert.equal(openerResult.role, "opener");
  assert.equal(openerResult.status, "manual_review");
  assert.equal(openerResult.hcp, 15);
});

test("qualitative alternatives do not become false automatic rejections", () => {
  const c = node("T26_STAYMAN_INGEN_HOGFARG_INVIT", "t26_n6").handConditionsByRole.opener;
  const hand = [
    "S14", "S2", "S3", "S4",
    "H13", "H2", "H3",
    "D11", "D2", "D3",
    "C2", "C3", "C4"
  ];
  const result = evaluateHandConditions(hand, c);
  assert.equal(result.status, "manual_review");
  assert.equal(result.matches, null);
  assert.ok(result.failures.length > 0);
});
