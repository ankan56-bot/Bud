"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const createDdsModule = require("../dds-runtime/dds_web_wasm.js");
const dataset = JSON.parse(fs.readFileSync(
  path.join(__dirname, "theme_deals_140.json"), "utf8"
));

const RANKS = { 14: "A", 13: "K", 12: "Q", 11: "J", 10: "T" };
function toPbn(hands) {
  function one(seat) {
    return ["S", "H", "D", "C"].map(suit => {
      const cards = hands[seat]
        .filter(card => card[0] === suit)
        .map(card => RANKS[Number(card.slice(1))] || String(Number(card.slice(1))))
        .sort((a, b) => "AKQJT98765432".indexOf(a) - "AKQJT98765432".indexOf(b));
      return cards.length ? cards.join("") : "-";
    }).join(".");
  }
  return "N:" + ["N", "E", "S", "W"].map(one).join(" ");
}

test("DDS WebAssembly calculates a deterministic 20-cell double-dummy table", async () => {
  const wasmPath = path.join(__dirname, "..", "dds-runtime", "dds_web_wasm.wasm");
  const wasmBinary = new Uint8Array(fs.readFileSync(wasmPath));
  const module = await createDdsModule({ wasmBinary, noInitialRun: true });
  const deal = dataset.deals.find(x => x.id === "alla-01");
  assert.ok(deal, "reference deal exists");
  const pbn = toPbn(deal.hands);
  const ptr = module._malloc(80);
  assert.ok(ptr, "DDS result buffer allocated");
  try {
    const rc = module.ccall(
      "dds_web_calc_table", "number", ["string", "number"], [pbn, ptr]
    );
    assert.equal(rc, 1, "DDS returns success");
    const first = Array.from({ length: 20 }, (_, i) => module.getValue(ptr + i * 4, "i32"));
    assert.equal(first.length, 20);
    assert.ok(first.every(n => Number.isInteger(n) && n >= 0 && n <= 13),
      "every declarer/strain result is a valid trick count");
    const rc2 = module.ccall(
      "dds_web_calc_table", "number", ["string", "number"], [pbn, ptr]
    );
    assert.equal(rc2, 1);
    const second = Array.from({ length: 20 }, (_, i) => module.getValue(ptr + i * 4, "i32"));
    assert.deepEqual(second, first, "same deal yields same DDS table");
  } finally {
    module._free(ptr);
  }
});
