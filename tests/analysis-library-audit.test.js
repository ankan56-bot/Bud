"use strict";
const assert = require("assert");
const library = require("../analysbibliotek.json");
const { auditLibrary, isCompetitiveTree } = require("../scripts/validate-analysis-library");

const result = auditLibrary(library);
assert.deepStrictEqual(result.errors, [], "No dangling IDs, duplicate IDs or malformed branch data");
assert.strictEqual(isCompetitiveTree({ id: "T29_INKLIV" }), true);
assert.strictEqual(isCompetitiveTree({ id: "T28_OVERFORING" }), false);

// Snapshot of the current baseline. The T40 minor continuation additions were reviewed; these snapshot counts include them.
// Changing these numbers requires reviewing the underlying data deliberately.
const expected = {
  totalTrees: 52,
  competitiveTreesExcluded: 5,
  undisturbedTrees: 47,
  undisturbedNodes: 332,
  branchEntries: 333,
  linkedBranches: 208,
  unlinkedBranches: 125,
  nodesWithoutOutgoing: 217,
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
