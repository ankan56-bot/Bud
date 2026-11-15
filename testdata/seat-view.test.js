/* Run: node --test testdata/seat-view.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createSeatView } = require("../seat-view.js");

function sampleState() {
  return {
    hands: {
      N: ["SA", "HK"], E: ["S2", "H2"], S: ["SK", "HQ"], W: ["S3", "H3"]
    },
    bids: [{ s: "N", c: "1N" }, { s: "E", c: "P" }],
    dealer: "N",
    vulnerability: { NS: false, EW: true }
  };
}

test("AI view contains only the selected seat's hand", () => {
  const view = createSeatView(sampleState(), "S", { playedCards: [] });
  assert.deepEqual(view.ownHand, ["SK", "HQ"]);
  assert.equal(view.seat, "S");
  assert.equal(Object.hasOwn(view, "hands"), false);
  for (const otherSeat of ["N", "E", "W"]) assert.equal(Object.hasOwn(view, otherSeat), false);
  assert.equal(JSON.stringify(view).includes('"SA"'), false);
  assert.equal(JSON.stringify(view).includes('"S2"'), false);
  assert.equal(JSON.stringify(view).includes('"S3"'), false);
});

test("view is detached from source state and deeply immutable", () => {
  const state = sampleState();
  const view = createSeatView(state, "N", { trick: [{ seat: "E", card: "S2" }] });
  state.hands.N[0] = "S2";
  state.bids[0].c = "P";
  assert.equal(view.ownHand[0], "SA");
  assert.equal(view.auction[0].c, "1N");
  assert.equal(Object.isFrozen(view), true);
  assert.equal(Object.isFrozen(view.ownHand), true);
  assert.equal(Object.isFrozen(view.auction[0]), true);
});

test("invalid seats and missing hands are rejected", () => {
  assert.throws(() => createSeatView(sampleState(), "X"), /Unknown bridge seat/);
  assert.throws(() => createSeatView({ hands: {} }, "N"), /valid hand/);
});

test("only explicitly supplied public information is forwarded", () => {
  const view = createSeatView(sampleState(), "E", { auctionOpen: true, playedCards: [] });
  assert.deepEqual(view.publicState, { auctionOpen: true, playedCards: [] });
  assert.equal(Object.hasOwn(view.publicState, "hands"), false);
});
