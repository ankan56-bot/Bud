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
  const now = 1_800_000_000_000;
  function ready(count, players) {
    Object.values(players).forEach(p => { if (p.at == null) p.at = now; });
    const context = { SEATS: ["N", "E", "S", "W"], roomPlayers: players, roomConfig: { count },
      playerId: "self", Date: { now: () => now } };
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
  assert.equal(ready(2, { a: { seat: "N", at: now - 60_000 }, b: { seat: "S", at: now } }), false,
    "expired participants must not keep seats or make the room appear ready");
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


test("room reconnect rebuilds the same deterministic bot bids from the seed and human calls", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function pack(");
  const end = html.indexOf("\nfunction adopt", start);
  assert.ok(start >= 0 && end > start, "pack/build reconstruction functions should exist");
  const source = html.slice(start, end);
  function reconstruct() {
    const context = {
      isBot: (seat, st) => !(st.humanSeats || ["N", "S"]).includes(seat),
      newDeal: (no, mode, focus, seed, humanSeats) => ({
        no, mode, focus, seed, humanSeats: humanSeats || ["N", "S"],
        bids: [], hands: { N: [], E: [], S: [], W: [] }, dealer: "N"
      }),
      advance: st => {
        while (st.bids.length < 8 && !((["N", "E", "S", "W"])[st.bids.length] === "S" ||
                 (["N", "E", "S", "W"])[st.bids.length] === "N")) {
          const seat = ["N", "E", "S", "W"][st.bids.length % 4];
          if ((st.humanSeats || ["N", "S"]).includes(seat)) break;
          st.bids.push({ s: seat, c: "P" });
        }
        return st;
      },
      ended: st => st.bids.length >= 8,
      turn: st => ["N", "E", "S", "W"][st.bids.length % 4],
      legal: (st, call, seat) => ["N", "E", "S", "W"][st.bids.length % 4] === seat && call.length > 0
    };
    vm.runInNewContext(source, context);
    return context;
  }
  const ctx = reconstruct();
  const snapshot = { no: 7, seed: 12345, mode: "stord", focus: "alla",
    humanSeats: ["N", "S"], h: ["N1NT", "S2NT"], rep: 0 };
  const first = ctx.build(snapshot);
  const second = ctx.build(snapshot);
  assert.deepEqual(JSON.parse(JSON.stringify(first.bids)), JSON.parse(JSON.stringify(second.bids)));
  assert.deepEqual(first.bids.filter(b => b.c === "P").map(b => b.s), ["E", "W"]);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.pack(first).h)), snapshot.h);
});

test("room coordinator election is deterministic and fails over after stale presence expires", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function roomCoordinator()");
  const end = html.indexOf("\nfunction isFreshRoomAction", start);
  assert.ok(start >= 0 && end > start, "coordinator election helper should exist");
  const source = html.slice(start, end);
  const now = 1_800_000_000_000;
  const context = { Date: { now: () => now }, playerId: "c",
    roomPlayers: {
      c: { at: now, seat: "S" },
      a: { at: now - 10_000, seat: "N" },
      b: { at: now - 20_000, seat: "E" }
    } };
  vm.runInNewContext(source, context);
  assert.equal(context.roomCoordinator(), "a", "lowest active player ID coordinates");
  context.roomPlayers.a.at = now - 46_000;
  assert.equal(context.roomCoordinator(), "b", "next active player takes over after timeout");
  context.roomPlayers.b.at = now - 46_000;
  assert.equal(context.roomCoordinator(), "c", "remaining client becomes coordinator");
});


test("human room bids are coordinator-validated and only accepted from the owner of the acting seat", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function executeRoomAction(");
  const end = html.indexOf("\nfunction requestRoomAction", start);
  assert.ok(start >= 0 && end > start, "room action executor should exist");
  const source = html.slice(start, end);
  const calls = [];
  const state = { id: "deal", seed: 42, no: 1, mode: "stord", focus: "alla",
    hands: { N: [], E: [], S: [], W: [] }, dealer: "N", humanSeats: ["N", "S"], bids: [], rep: 0 };
  const context = {
    state, roomSeatOwners: () => ({ N: "alice", S: "bob" }),
    turn: () => "N", isBot: () => false, legal: () => true,
    save: next => calls.push(next),
    roomConfig: { count: 2 }, roomReady: () => true,
    modeSel: "stord", focusSel: "alla", playerId: "coordinator",
    humanSeatsForNewDeal: () => ["N", "S"], newSeed: () => 99,
    newDeal: () => state, ended: () => false
  };
  vm.runInNewContext(source, context);
  context.executeRoomAction("call", { seat: "N", call: "1NT" }, "mallory");
  assert.equal(calls.length, 0, "a different participant cannot bid for North");
  context.turn = () => "E";
  context.executeRoomAction("call", { seat: "E", call: "1C" }, "alice");
  assert.equal(calls.length, 0, "a human cannot impersonate a bot seat");
  context.turn = () => "N";
  context.executeRoomAction("call", { seat: "N", call: "1NT" }, "alice");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].bids[0].s, "N");
  assert.equal(calls[0].bids[0].c, "1NT");
  assert.match(html, /requestRoomAction\('call',\{seat:me,call:c\}\)/);
  assert.match(html, /sameRoomState\(m\.baseState,pack\(state\)\)/);
});


test("only the elected room coordinator runs shared bot turns and presence refresh triggers failover", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function isRoomBotCoordinator()");
  const end = html.indexOf("\nfunction isFreshRoomAction", start);
  assert.ok(start >= 0 && end > start, "room bot coordinator guard should exist");
  const context = { roomConfig: { count: 2 }, playerId: "b",
    roomCoordinator: () => "a" };
  vm.runInNewContext(html.slice(start, end), context);
  assert.equal(context.isRoomBotCoordinator(), false,
    "non-coordinator clients must not run duplicate bot turns");
  context.roomCoordinator = () => "b";
  assert.equal(context.isRoomBotCoordinator(), true);
  context.roomConfig = { count: 0 };
  assert.equal(context.isRoomBotCoordinator(), true,
    "legacy single-device mode is not restricted by room election");
  assert.match(html, /!isRoomBotCoordinator\(\)\)return/);
  assert.match(html, /roomConfig\.count&&roomCoordinator\(\)===playerId\)scheduleBot\(\)/,
    "presence refresh should start bot processing after coordinator failover");
});


test("room reconnect holds bot turns until replayed state messages go quiet", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function markRoomSync()");
  const end = html.indexOf("\n", start);
  assert.ok(start >= 0 && end > start, "room replay quiet-period helper should exist");
  const timers = new Map();
  const cleared = [];
  let nextId = 0, scheduledBots = 0;
  const context = {
    roomSyncTimer: null, roomSyncing: false,
    roomConfig: { count: 2 }, playerId: "a",
    roomCoordinator: () => "a",
    scheduleBot: () => { scheduledBots++; },
    setTimeout: fn => { const id = ++nextId; timers.set(id, fn); return id; },
    clearTimeout: id => { cleared.push(id); timers.delete(id); }
  };
  vm.runInNewContext(html.slice(start, end), context);
  context.markRoomSync();
  const firstTimer = context.roomSyncTimer;
  assert.equal(context.roomSyncing, true);
  context.markRoomSync();
  const latestTimer = context.roomSyncTimer;
  assert.notEqual(latestTimer, firstTimer);
  assert.deepEqual(cleared, [firstTimer], "each replayed state restarts the quiet period");
  assert.equal(scheduledBots, 0, "bots must wait while historical state is still arriving");
  timers.get(latestTimer)();
  assert.equal(context.roomSyncing, false);
  assert.equal(scheduledBots, 1, "the coordinator resumes bots after the replay quiet period");
  assert.ok(html.includes("if(roomSyncing||!st||!st.hands"));
  assert.ok(html.includes("if(roomSyncing||state!==st"));
  assert.ok(html.includes("es.onopen=function(){connState='online';startPresence();markRoomSync()"));
});


test("stale room presence history cannot reclaim seats after reconnect", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function isFreshRoomPresence(");
  const end = html.indexOf("\nfunction isFreshRoomAction", start);
  assert.ok(start >= 0 && end > start, "presence freshness helpers should exist");
  const context = {};
  vm.runInNewContext(html.slice(start, end), context);
  const now = 1_800_000_000_000;
  assert.equal(context.isFreshRoomPresence({ time: now / 1000 }, now), true);
  assert.equal(context.isFreshRoomPresence({ time: now / 1000 - 44 }, now), true);
  assert.equal(context.isFreshRoomPresence({ time: now / 1000 - 46 }, now), false);
  assert.equal(context.isFreshRoomPresence({ time: now / 1000 + 46 }, now), false);
  assert.equal(context.isFreshRoomPresence({}, now), false);
  assert.equal(context.isNewerRoomPresence({ time: 100 }, 99_000), true);
  assert.equal(context.isNewerRoomPresence({ time: 98 }, 99_000), false);
  assert.ok(html.includes("isFreshRoomPresence(o)&&isNewerRoomPresence(o,lastPresenceEventTime[m.p.id])"));
  assert.ok(html.includes("freshPresence={id:m.p.id,name:m.p.name||'',seat:m.p.seat||null,at:Date.now()}"));
});


test("room seat claims cannot exceed the configured participant count", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "Budtraning.html"), "utf8");
  const start = html.indexOf("function roomSeatOwners()");
  const end = html.indexOf("\nfunction claimRoomSeat", start);
  assert.ok(start >= 0 && end > start, "room seat claim helpers should exist");
  const now = 1_800_000_000_000;
  function allowed(count, playerId, players, seat) {
    Object.values(players).forEach(p => { if (p.at == null) p.at = now; });
    const context = { SEATS: ["N", "E", "S", "W"], roomPlayers: players, roomConfig: { count },
      playerId, Date: { now: () => now } };
    vm.runInNewContext(html.slice(start, end), context);
    return context.roomSeatClaimAllowed(seat);
  }
  assert.equal(allowed(1, "b", { a: { seat: "N" } }, "E"), false,
    "a one-player room must not accept a second human");
  assert.equal(allowed(1, "a", { a: { seat: "N" } }, "X"), true,
    "the sole player may switch to controlling both North and South");
  assert.equal(allowed(2, "c", { a: { seat: "N" }, b: { seat: "S" } }, "N"), false);
  assert.equal(allowed(3, "d", { a: { seat: "N" }, b: { seat: "E" }, c: { seat: "S" } }, "W"), false,
    "a full three-player room must not accept a fourth participant");
  assert.equal(allowed(3, "b", { a: { seat: "N" }, b: { seat: "E" }, c: { seat: "S" } }, "W"), true,
    "an existing participant may move to an unoccupied seat");
});
