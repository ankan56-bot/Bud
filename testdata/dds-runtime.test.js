"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("DDS WebAssembly binary is valid and exposes the expected solver API", async () => {
  const wasmPath = path.join(__dirname, "..", "dds-runtime", "dds_web_wasm.wasm");
  const bytes = fs.readFileSync(wasmPath);
  assert.ok(bytes.length > 100000, "DDS WebAssembly binary is present");
  const binaryLoader = fs.readFileSync(
    path.join(__dirname, "..", "dds-runtime", "dds_web_wasm_bin.js"), "utf8"
  );
  const base64Block = binaryLoader.match(/const DDS_WEB_WASM_BASE64 =([\\s\\S]*?);/);
  assert.ok(base64Block, "embedded DDS binary loader exists");
  const embedded = Buffer.from(
    Array.from(base64Block[1].matchAll(/"([^"]+)"/g), m => m[1]).join(""),
    "base64"
  );
  assert.deepEqual(embedded, bytes, "embedded browser binary matches the standalone WASM file");
  const compiled = await WebAssembly.compile(bytes);
  const names = new Set(WebAssembly.Module.exports(compiled).map(x => x.name));
  for (const name of ["dds_web_calc_table", "dds_web_solve_plays", "dds_web_solve_leads", "malloc", "free"]) {
    assert.ok(names.has(name), "missing WebAssembly export: " + name);
  }
});

test("browser integration wires COI, WebAssembly loading and DDS table calculation", () => {
  const root = path.join(__dirname, "..");
  const integration = fs.readFileSync(path.join(root, "dds-integration.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "Budtraning.html"), "utf8");
  const coi = fs.readFileSync(path.join(root, "coi-serviceworker.js"), "utf8");
  const glue = fs.readFileSync(path.join(root, "dds-runtime", "dds_web_wasm.js"), "utf8");
  const binaryLoader = fs.readFileSync(path.join(root, "dds-runtime", "dds_web_wasm_bin.js"), "utf8");

  assert.match(integration, /window\.crossOriginIsolated/);
  assert.match(integration, /SharedArrayBuffer/);
  assert.match(integration, /createDdsModule/);
  assert.match(integration, /wasmBinary:window\\.ddsWebWasmBytes\\(\\)/);
  assert.match(integration, /dds_web_calc_table/);
  assert.match(html, /<script src="coi-serviceworker\.js"><\/script>/);
  assert.match(html, /<script src="dds-integration\.js"><\/script>/);
  assert.match(html, /runDdsReview\(st\)/);
  assert.match(coi, /Cross-Origin-Embedder-Policy/);
  assert.match(coi, /Cross-Origin-Opener-Policy/);
  assert.match(glue, /createDdsModule/);
  assert.match(binaryLoader, /ddsWebWasmBytes/);
});
