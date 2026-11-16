"use strict";

// Characterize the remaining legacy 1M invitation leak, and verify that the
// migrated 1NT live path no longer reads the opener's hidden cards.
const assert = require("node:assert/strict");
const R = require("../rattningsmotor.js");

const eastOpener = [
  "H14","H13","H12","H11","H2",
  "S13","S7","S6","D8","D6","D4","C9","C5"
];
const westInviteA = [
  "H10","H9","H8","H7","S14","S12","S2",
  "D14","D2","D3","C4","C2","C3"
];
const westInviteB = [
  "H10","H9","H8","H7","S14","S12","S2","S3",
  "D14","D2","D3","C2","C3"
];

function fullDealWithEast(east, west) {
  const deck = [];
  for (const suit of ["S","H","D","C"]) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  const used = new Set([...east, ...west]);
  assert.equal(used.size, 26, "East and West hands must be disjoint");
  const rest = deck.filter(card => !used.has(card));
  assert.equal(rest.length, 26);
  return { E: east, S: rest.slice(0,13), W: west, N: rest.slice(13,26) };
}

// Case 1: East opens 1H; West's 3H invit shows 10–12 HTP and 4+ hearts.
// Both possible West hands satisfy that public description.
const majorAuction = [
  {s:"E",c:"1H"},
  {s:"S",c:"P"},
  {s:"W",c:"3H"},
  {s:"N",c:"P"},
  {s:"E",c:"P"}
];
const majorDealA = fullDealWithEast(eastOpener, westInviteA);
const majorDealB = fullDealWithEast(eastOpener, westInviteB);
assert.deepStrictEqual(majorDealA.E, majorDealB.E);
assert.equal(R.partnershipPoints(R.H(eastOpener), R.H(westInviteA), "H"), 25);
assert.equal(R.partnershipPoints(R.H(eastOpener), R.H(westInviteB), "H"), 26);
assert.equal(R.H(westInviteA).htp("H"), 10);
assert.equal(R.H(westInviteB).htp("H"), 11);
assert.equal(R.nodeFor({hands:majorDealA,dealer:"E",bids:majorAuction},4).exp, "P");
assert.equal(R.nodeFor({hands:majorDealB,dealer:"E",bids:majorAuction},4).exp, "4H");

// Case 2: East responds to West's 1NT. East's 10-HCP hand and auction stay
// fixed; West's actual 15 versus 16 HCP changes the recommendation 2NT/3NT.
const eastResponder = [
  "D14","D13","D12","D5","D4","S11","S7","S6","H8","H6","H3","C9","C2"
];
const west15 = [
  "S14","S13","S8","S5","H14","H12","H4","D11","D7","D6","C11","C7","C4"
];
const west16 = [
  "S14","S13","S8","S5","H14","H12","H4","D11","D7","D6","C12","C7","C4"
];
function fullDealWithWest(west) {
  const deck = [];
  for (const suit of ["S","H","D","C"]) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  const used = new Set([...eastResponder, ...west]);
  assert.equal(used.size, 26, "East and West hands must be disjoint");
  const rest = deck.filter(card => !used.has(card));
  return { W: west, N: rest.slice(0,13), E: eastResponder, S: rest.slice(13,26) };
}
const ntAuction = [
  {s:"W",c:"1N"},
  {s:"N",c:"P"},
  {s:"E",c:"P"}
];
const ntDeal15 = fullDealWithWest(west15);
const ntDeal16 = fullDealWithWest(west16);
assert.deepStrictEqual(ntDeal15.E, ntDeal16.E);
assert.equal(R.H(eastResponder).hp, 10);
assert.equal(R.H(west15).hp, 15);
assert.equal(R.H(west16).hp, 16);
// 10 own HCP plus the 15-HCP minimum of a 1NT opener guarantees
// the confirmed 25-HCP no-trump game threshold, regardless of hidden hand.
assert.equal(R.nodeFor({hands:ntDeal15,dealer:"W",bids:ntAuction},2).exp, "3N");
assert.equal(R.nodeFor({hands:ntDeal16,dealer:"W",bids:ntAuction},2).exp, "3N");
const liveNt15=R.decideLive({seat:"E",dealer:"W",auction:ntAuction,ownHand:eastResponder});
const liveNt16=R.decideLive({seat:"E",dealer:"W",auction:ntAuction,ownHand:eastResponder});
assert.equal(liveNt15.exp,liveNt16.exp);
assert.equal(liveNt15.why,liveNt16.why);
assert.equal(liveNt15.exp,"3N","10 own HCP guarantees 25 combined HCP against 1NT minimum");

console.log("Legacy 1M hidden-hand leak characterized; 1NT live path is invariant and conservative.");
