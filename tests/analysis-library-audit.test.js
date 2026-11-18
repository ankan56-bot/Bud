"use strict";
const assert = require("assert");
const library = require("../analysbibliotek.json");
const { auditLibrary, isCompetitiveTree } = require("../scripts/validate-analysis-library");

const result = auditLibrary(library);
assert.deepStrictEqual(result.errors, [], "No dangling IDs, duplicate IDs or malformed branch data");
assert.strictEqual(isCompetitiveTree({ id: "T29_INKLIV" }), true);
assert.strictEqual(isCompetitiveTree({ id: "T28_OVERFORING" }), false);
const inviteTree = library.trees.find(tree => tree.id === "T42_OPPNARENS_TREDJE_BUD_EFTER_2NT_INVIT");
assert.ok(inviteTree, "T42 opener third-bid tree must be present");
assert.strictEqual(inviteTree.nodes.length, 6);

// Snapshot of the current baseline. Changing these numbers requires reviewing
// the underlying data and updating this test deliberately; it is not a rule generator.
const expected = {
  totalTrees: 53,
  competitiveTreesExcluded: 5,
  undisturbedTrees: 48,
  undisturbedNodes: 327,
  branchEntries: 338,
  linkedBranches: 213,
  unlinkedBranches: 125,
  nodesWithoutOutgoing: 211,
  nodesWithoutHandProfile: 27,
  invalidRootTrees: 1,
  invalidBranchTargets: 0,
  crossTreeLinks: 7,
  duplicateSequenceGroups: 34,
  duplicateSequenceExtraOccurrences: 37
};
for (const [key, value] of Object.entries(expected)) {
  assert.strictEqual(result.metrics[key], value, key + " baseline changed; inspect before accepting");
}

const rootWarnings = result.warnings.filter(item => item.type === "invalid-root");
assert.deepStrictEqual(rootWarnings.map(item => item.tree), [
  "T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD"
]);
const missingProfiles = result.warnings.filter(item => item.type === "missing-hand-profile");
assert.strictEqual(missingProfiles.length, 27);
console.log("Analysis library audit tests passed.");
