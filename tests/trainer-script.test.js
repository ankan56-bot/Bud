const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("Budtraning.html inline JavaScript parses without syntax errors", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1])
    .filter(source => source.trim());
  assert.ok(scripts.length > 0, "HTML should contain an inline application script");
  scripts.forEach((source, index) => {
    assert.doesNotThrow(() => new vm.Script(source), "inline script " + (index + 1));
  });
});

test("the app keeps legacy two-human sessions as the default for old saved deals", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  assert.match(html, /m\.humanSeats\|\|\['N','S'\]/);
  assert.match(html, /humanSeats:st\.humanSeats\|\|\['N','S'\]/);
});

test("solo bot assignment survives bid submission and undo state copies", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const copies = html.match(/focus:st\.focus,hands:st\.hands,dealer:st\.dealer,humanSeats:st\.humanSeats\|\|\['N','S'\],bids:/g) || [];
  assert.equal(copies.length, 3, "submit, undo and keyboard/button bid paths must retain humanSeats");
  assert.match(html, /function isBot\(s,st\)/);
  assert.match(html, /Ensam mot tre robotar/);
});
