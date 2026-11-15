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

test("solo mode lets one human choose any compass seat or both North and South", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  assert.match(html, /function humanSeatsForNewDeal\(\)\{if\(roomConfig\.count\)return roomHumanSeats\(\);if\(playerMode!=='solo'\)return \['N','S'\]/);
  ["N", "E", "S", "W"].forEach(seat => assert.ok(html.includes("setSeat(s)"), "seat picker should support " + seat));
  assert.match(html, /function seatView\(s\)\{return \(s===me\|\|\(seat==='X'&&\(s==='N'\|\|s==='S'\)\)\)\?handBlock\(st,s\):seatHtml\(st,s,rel\(s\)\)\}/);
});

test("seat selection can be changed between deals to inspect all table positions", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  assert.match(html, /function setSeat\(s\)\{if\(roomConfig\.count\)\{if\(s===null\)/);
  assert.match(html, /Du spelar Öst\./);
  assert.match(html, /Du spelar Väst\./);
});

test("room entry has an optional persistent player name", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  assert.match(html, /Namn \(valfritt\)/);
  assert.match(html, /id="player-name"/);
  assert.match(html, /localStorage\.setItem\('bt_player_name',playerName\)/);
  assert.ok(html.includes("esc(playerName)+' ('+NAME[me]+')'"));
  assert.match(html, /\.seatL \.fan,\.seatR \.fan\{flex-direction:column/);
});

test("shared room lobby supports player counts one through four and waiting seats", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  assert.match(html, /Hur många spelare\?/);
  assert.match(html, /data-count=\"'\+n\+'\"/);
  assert.match(html, /Väntar på spelare/);
  assert.match(html, /Buddie/);
  assert.match(html, /function roomHumanSeats\(\)/);
  assert.match(html, /function roomReady\(\)/);
});

test("room membership persists and is synchronized with player names and seats", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  assert.match(html, /bt_player_id/);
  assert.match(html, /bt_room_config_/);
  assert.match(html, /type:'presence'/);
  assert.match(html, /function announcePresence\(\)/);
  assert.match(html, /function restoreRoomConfig\(\)/);
  assert.match(html, /seatOwnerName\(s\)/);
});

test("shared actions are routed through a room coordinator", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  assert.match(html, /function roomCoordinator\(\)/);
  assert.match(html, /function requestRoomAction\(action,data\)/);
  assert.match(html, /type:'room-action'/);
  assert.match(html, /requestRoomAction\('next'\)/);
  assert.match(html, /requestRoomAction\('undo'\)/);
  assert.match(html, /requestRoomAction\('theme'/);
});
