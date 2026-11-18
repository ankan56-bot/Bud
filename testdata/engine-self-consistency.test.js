"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rattning = require("../rattningsmotor.js");

// Deterministic deal that exposed an internal contradiction:
// 1H–2NT–3NT, where the pass-only analysis suggested 6H but
// the same engine rejected 6H and preferred 4H when tested as an actual bid.
const north = ["S2","C14","H10","H8","C4","H4","D4","S12","D13","S7","H5","C13","D9"];
const south = ["C12","S14","H3","D10","H7","H12","D6","D14","C2","H13","H14","C7","D11"];
const prefix = [
  {s:"N",c:"1H"},{s:"E",c:"P"},{s:"S",c:"2N"},
  {s:"W",c:"P"},{s:"N",c:"3N"},{s:"E",c:"P"}
];
function node(call) {
  return Rattning.nodeFor({
    hands:{N:north,S:south,E:[],W:[]},
    dealer:"N",
    bids:prefix.concat([{s:"S",c:call}])
  },6);
}

test("a pass recommendation is uncovered if the same proposed slam is rejected as an actual bid", () => {
  const pass = node("P");
  assert.equal(pass.exp,null);
  assert.equal(pass.conv,"motorintern konflikt");
  assert.match(pass.why,/förslaget 6♥.*underkänner samma bud.*4♥/);
});

test("the same auction still identifies 4H as the engine's verified game-level recommendation", () => {
  const six = node("6H");
  assert.equal(six.exp,"4H");
  assert.match(six.why,/9 kort.*35 gemensamma spelpoäng/);
});
