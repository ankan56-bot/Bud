"use strict";
const assert = require("assert");
const library = require("../analysbibliotek.json");
const { auditLibrary, isCompetitiveTree } = require("../scripts/validate-analysis-library");

const result = auditLibrary(library);
assert.deepStrictEqual(result.errors, [], "No dangling IDs, duplicate IDs or malformed branch data");
assert.strictEqual(isCompetitiveTree({ id: "T29_INKLIV" }), true);
assert.strictEqual(isCompetitiveTree({ id: "T28_OVERFORING" }), false);

// Snapshot of the current baseline. Changing these numbers requires reviewing
// the underlying data and updating this test deliberately; it is not a rule generator.
const expected = {
  totalTrees: 47,
  competitiveTreesExcluded: 5,
  undisturbedTrees: 42,
  undisturbedNodes: 251,
  branchEntries: 254,
  linkedBranches: 139,
  unlinkedBranches: 115,
  nodesWithoutOutgoing: 158,
  nodesWithoutHandProfile: 10,
  invalidRootTrees: 1,
  invalidBranchTargets: 0,
  crossTreeLinks: 7,
  duplicateSequenceGroups: 27,
  duplicateSequenceExtraOccurrences: 29
};
for (const [key, value] of Object.entries(expected)) {
  assert.strictEqual(result.metrics[key], value, key + " baseline changed; inspect before accepting");
}

const rootWarnings = result.warnings.filter(item => item.type === "invalid-root");
assert.deepStrictEqual(rootWarnings.map(item => item.tree), [
  "T40_SVARSHANDENS_ANDRA_BUD_EFTER_OPPNARENS_ATERBUD"
]);
const missingProfiles = result.warnings.filter(item => item.type === "missing-hand-profile");
assert.strictEqual(missingProfiles.length, 10);
console.log("Analysis library audit tests passed.");
