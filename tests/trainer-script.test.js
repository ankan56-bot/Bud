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
  assert.match(html, /baseState:pack\(state\)/);
  assert.match(html, /roomConfig\.count&&!roomReady\(\)/);
});


test("room readiness counts distinct valid seat owners, not raw presence records", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function roomSeatOwners()");
  const end = html.indexOf("function seatOwnerName", start);
  assert.ok(start >= 0 && end > start, "room seat ownership helpers should exist");
  const source = html.slice(start, end);
  function ready(count, players) {
    const context = { SEATS: ["N", "E", "S", "W"], roomPlayers: players, roomConfig: { count } };
    vm.runInNewContext(source, context);
    return context.roomReady();
  }
  assert.equal(ready(1, { a: { seat: "X" } }), true, "one player controlling both N/S is one participant");
  assert.equal(ready(1, { a: { seat: "N" } }), true);
  assert.equal(ready(2, { a: { seat: "N" }, b: { seat: "N" } }), false,
    "two people claiming the same seat must not start a two-player room");
  assert.equal(ready(2, { a: { seat: "N" }, b: { seat: "S" } }), true);
  assert.equal(ready(3, { a: { seat: "N" }, b: { seat: "N" }, c: { seat: "S" } }), false,
    "a duplicate seat claim must not count as a third player");
  assert.equal(ready(3, { a: { seat: "N" }, b: { seat: "E" }, c: { seat: "S" } }), true);
  assert.equal(ready(4, { a: { seat: "N" }, b: { seat: "E" }, c: { seat: "S" }, d: { seat: "W" } }), true);
});


test("replayed room-action messages are accepted only within the live freshness window", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function isFreshRoomAction(");
  const end = html.indexOf("\nfunction executeRoomAction", start);
  assert.ok(start >= 0 && end > start, "freshness guard should exist before room actions");
  const source = html.slice(start, end);
  const context = {};
  vm.runInNewContext(source, context);
  const now = 1_800_000_000_000;
  assert.equal(context.isFreshRoomAction({ time: now / 1000 }, now), true);
  assert.equal(context.isFreshRoomAction({ time: (now - 59_000) / 1000 }, now), true);
  assert.equal(context.isFreshRoomAction({ time: (now - 61_000) / 1000 }, now), false,
    "old ntfy history must not replay room actions after reconnect");
  assert.equal(context.isFreshRoomAction({}, now), false);
  assert.equal(context.isFreshRoomAction({ time: "not-a-time" }, now), false);
});

test("room state synchronization uses ntfy server chronology rather than per-device revision counters", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function isNewerRoomState(");
  const end = html.indexOf("\nfunction executeRoomAction", start);
  assert.ok(start >= 0 && end > start, "server-time state ordering helper should exist");
  const context = {};
  vm.runInNewContext(html.slice(start, html.indexOf("\n", start)), context);
  const latest = 1_800_000_000_000;
  assert.equal(context.isNewerRoomState({ time: latest / 1000 }, latest), true,
    "events at the same server timestamp remain ordered by the SSE stream");
  assert.equal(context.isNewerRoomState({ time: (latest + 1000) / 1000 }, latest), true);
  assert.equal(context.isNewerRoomState({ time: (latest - 1000) / 1000 }, latest), false,
    "a delayed older state must not overwrite a newer state");
  assert.equal(context.isNewerRoomState({}, latest), false);
  assert.equal(context.isNewerRoomState({ time: "invalid" }, latest), false);
  assert.match(html, /lastStateEventTime=0/);
  assert.match(html, /rev=Math\.max\(rev,Number\(m\.v\)\|\|0\);adopt\(m\.st\)/);
});

test("room actions are accepted only for the exact auction state the player acted on", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function sameRoomState(");
  const end = html.indexOf("\nfunction executeRoomAction", start);
  assert.ok(start >= 0 && end > start, "room-state comparison helper should exist");
  const context = {};
  vm.runInNewContext(html.slice(start, html.indexOf("\n", start)), context);
  const stateA = { no: 4, seed: "abc", h: ["N1NT"] };
  const stateSame = { no: 4, seed: "abc", h: ["N1NT"] };
  const stateLater = { no: 4, seed: "abc", h: ["N1NT", "S2NT"] };
  assert.equal(context.sameRoomState(stateA, stateSame), true);
  assert.equal(context.sameRoomState(stateA, stateLater), false,
    "a request based on an earlier auction must be rejected");
  assert.equal(context.sameRoomState(stateA, null), false);
  assert.match(html, /sameRoomState\(m\.baseState,pack\(state\)\)/);
});
