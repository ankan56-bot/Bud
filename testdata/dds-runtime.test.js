"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ddsScriptPath = path.resolve(__dirname, "..", "dds-runtime", "dds_web_wasm.js");
globalThis.document = { currentScript: { src: ddsScriptPath } };
const createDdsModule = require(ddsScriptPath);


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

test("DDS WebAssembly calculates a deterministic 20-cell double-dummy table", { timeout: 120000 }, async () => {
  const wasmPath = path.join(__dirname, "..", "dds-runtime", "dds_web_wasm.wasm");
  const wasmBinary = new Uint8Array(fs.readFileSync(wasmPath));
  const module = await createDdsModule({ wasmBinary, noInitialRun: true });
  const hands = {
    N: ["S14","S13","S12","S11","S10","S9","S8","S7","S6","S5","S4","S3","S2"],
    E: ["H14","H13","H12","H11","H10","H9","H8","H7","H6","H5","H4","H3","H2"],
    S: ["D14","D13","D12","D11","D10","D9","D8","D7","D6","D5","D4","D3","D2"],
    W: ["C14","C13","C12","C11","C10","C9","C8","C7","C6","C5","C4","C3","C2"]
  };
  const pbn = toPbn(hands);
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
