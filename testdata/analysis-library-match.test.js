"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { findMatch } = require("../analysmotor.js");

const library = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "analysbibliotek.json"), "utf8"
));

test("competitive analysis trees match legal auctions containing pass rounds", () => {
  const cases = [
    {
      id: "T29_1H_1S_KONKURRENS",
      bids: ["1H", "P", "1S", "P", "P"]
    },
    {
      id: "T32_1C_1H_KONKURRENS",
      bids: ["1C", "P", "1H", "P", "P"]
    },
    {
      id: "T33_1H_DBL_SVAR",
      bids: ["1H", "P", "X", "P", "P"]
    }
  ];

  for (const item of cases) {
    const match = findMatch(library, item.bids.map(c => ({ c })));
    assert.equal(match?.tree.id, item.id, item.id);
    assert.equal(match?.length, 2, item.id + " should match the two-call root");
  }
});

test("pass-insensitive matching does not change ordinary pass-sensitive trees", () => {
  const match = findMatch(library, ["1H", "2H"].map(c => ({ c })));
  assert.notEqual(match?.tree.id, "T29_1H_1S_KONKURRENS");
  assert.notEqual(match?.tree.id, "T30_1S_2H_KONKURRENS");
  assert.notEqual(match?.tree.id, "T31_1D_1S_KONKURRENS");
  assert.notEqual(match?.tree.id, "T32_1C_1H_KONKURRENS");
  assert.notEqual(match?.tree.id, "T33_1H_DBL_SVAR");
});
