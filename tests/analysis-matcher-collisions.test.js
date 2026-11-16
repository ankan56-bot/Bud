"use strict";
const assert = require("node:assert/strict");
const A = require("../analysmotor.js");
const library = require("../analysbibliotek.json");

const transfer = A.findMatches(library, [
  {c:"1N"},{c:"P"},{c:"2D"}
]);
assert.deepStrictEqual(
  transfer.filter(x => x.exact).map(x => x.tree.id).sort(),
  ["T03_OVERFORING_PASS","T07_OVERFORING_HJARTER"].sort()
);

const simpleRaise = A.findMatches(library, [
  {c:"1H"},{c:"P"},{c:"2H"}
]);
assert.deepStrictEqual(
  simpleRaise.filter(x => x.exact).map(x => x.tree.id).sort(),
  ["T05_HJARTERFIT_PASS","T10_1H_ENKEL_HOJNING","T21"].sort()
);

const first = A.findMatch(library, [{c:"1N"},{c:"P"},{c:"2D"}]);
assert.equal(first.tree.id, transfer[0].tree.id,
  "Legacy findMatch should keep its first-match behavior until a deliberate migration");

console.log("Analysis matcher collision diagnostics passed (2 exact transfer matches, 3 exact 1♥–2♥ matches).");
