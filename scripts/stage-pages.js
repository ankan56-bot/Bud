"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "_site");
const runtimeFiles = [
  "coi-serviceworker.js",
  "poangberakning.js",
  "sangbudgivning.js",
  "stordbudgivning.js",
  "slamlogik.js",
  "regelkontroll.js",
  "2kloveroppning.js",
  "svaga2oppningar.js",
  "inkliv.js",
  "dubbling.js",
  "svar1farg.js",
  "aterbud1farg.js",
  "ettoppningssvar.js",
  "hogfargsbudgivning.js",
  "lagfargsbudgivning.js",
  "stenberg.js",
  "trumfstod.js",
  "opening-decision.js",
  "2nt-stayman.js",
  "terminal-pass.js",
  "two-club-sequences.js",
  "budbeslut.js",
  "rattningsrapport.js",
  "ej-tackta-logg.js",
  "rattningsmotor.js",
  "facitmotor.js",
  "dds-integration.js",
  "analysmotor.js",
  "analysbibliotek.json",
  "kompletterande_budlogik.json",
  "bridge-brand-transparent.png"
];
const ddsFiles = [
  "dds_web_wasm_bin.js",
  "dds_web_wasm.js",
  "dds_web_wasm.wasm"
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "dds-runtime"), { recursive: true });
fs.copyFileSync(path.join(root, "Budtraning.html"), path.join(out, "index.html"));

for (const file of runtimeFiles) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) throw new Error("Missing runtime asset: " + file);
  fs.copyFileSync(source, path.join(out, file));
}
for (const file of ddsFiles) {
  const source = path.join(root, "dds-runtime", file);
  if (!fs.existsSync(source)) throw new Error("Missing DDS runtime asset: dds-runtime/" + file);
  fs.copyFileSync(source, path.join(out, "dds-runtime", file));
}

const html = fs.readFileSync(path.join(out, "index.html"), "utf8");
const scriptRefs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
for (const ref of scriptRefs) {
  if (/^(?:https?:)?\/\//i.test(ref)) continue;
  const target = path.resolve(out, ref);
  if (!target.startsWith(out + path.sep) || !fs.existsSync(target)) {
    throw new Error("Published HTML references a missing local script: " + ref);
  }
}
for (const file of ["analysbibliotek.json", "kompletterande_budlogik.json"]) {
  if (!fs.existsSync(path.join(out, file))) throw new Error("Missing fetched JSON asset: " + file);
}
fs.writeFileSync(path.join(out, ".nojekyll"), "");

console.log("Pages bundle ready: _site/index.html");
console.log("Copied " + runtimeFiles.length + " runtime assets and " + ddsFiles.length + " DDS assets.");
