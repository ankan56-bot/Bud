"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const R = require("../rattningsmotor.js");

const html = fs.readFileSync(require.resolve("../Budtraning.html"), "utf8");
const match = html.match(/function botCall\(st,botSeat\)\{([\s\S]*?)\n\}/);
assert.ok(match, "The trainer must expose its integrated botCall implementation for source-level verification.");
assert.match(match[1], /Rattning\.decideLive/, "Live bots must use the information-safe live API.");
assert.doesNotMatch(match[1], /Rattning\.nodeFor|strategicBotFallback/, "Live bots must not use full-deal after-the-fact logic or an unapproved fallback.");

const ownHand = [
  "D14","D13","D12","D5","D4","S11","S7","S6","H8","H6","H3","C9","C2"
];
const openerA = [
  "S14","S13","S8","S5","H14","H12","H4","D11","D7","D6","C11","C7","C4"
];
const openerB = [
  "S14","S13","S8","S5","H14","H12","H4","D11","D7","D6","C12","C7","C4"
];
assert.equal(ownHand.length, 13);
assert.equal(openerA.length, 13);
assert.equal(openerB.length, 13);

const auction = [{s:"W",c:"1N"},{s:"N",c:"P"}];
const liveA = R.decideLive({seat:"E",dealer:"W",auction,ownHand});
const liveB = R.decideLive({seat:"E",dealer:"W",auction,ownHand});
assert.equal(liveA.exp, "3N");
assert.equal(liveB.exp, "3N");
assert.equal(liveA.exp, liveB.exp);
assert.equal(liveA.why, liveB.why);
assert.equal(liveA.informationBoundary, "own_hand_and_public_auction_only");

// A sequence outside the verified live families must remain uncovered;
// it must not be completed by looking at the partner's actual hand.
const unsupported = R.decideLive({
  seat:"E",
  dealer:"W",
  auction:[{s:"W",c:"1H"},{s:"N",c:"P"}],
  ownHand
});
assert.equal(unsupported.exp, null);
assert.equal(unsupported.context, "live");

console.log("Integrated bot live path uses only own hand/public auction; unsupported sequences abstain safely.");
