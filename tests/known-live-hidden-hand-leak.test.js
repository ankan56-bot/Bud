"use strict";

// Characterization test for a known defect: live correction currently reads
// partner's hidden cards when accepting a 3M invitation.
// TODO: replace this with an invariance test against decideLive() once the
// live/post-deal API separation is implemented.
const assert = require("node:assert/strict");
const R = require("../rattningsmotor.js");

const east = [
  "H14","H13","H12","H11","H2",
  "S13","S7","S6","D8","D6","D4","C9","C5"
];
const responderA = [
  "H10","H9","H8","H7","S14","S12","S2",
  "D14","D2","D3","C4","C2","C3"
];
const responderB = [
  "H10","H9","H8","H7","S14","S12","S2","S3",
  "D14","D2","D3","C2","C3"
];

function fullDeal(south) {
  const deck = [];
  for (const suit of ["S","H","D","C"]) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  const used = new Set([...east, ...south]);
  assert.equal(used.size, 26, "North and South hands must be disjoint");
  const rest = deck.filter(card => !used.has(card));
  assert.equal(rest.length, 26);
  return { E: east, S: rest.slice(0,13), W: south, N: rest.slice(13,26) };
}

const auction = [
  {s:"E",c:"1H"},
  {s:"S",c:"P"},
  {s:"W",c:"3H"},
  {s:"N",c:"P"},
  {s:"E",c:"P"}
];
const dealA = fullDeal(responderA);
const dealB = fullDeal(responderB);
assert.deepStrictEqual(dealA.E, dealB.E, "The acting player's hand must be identical");

const pointsA = R.partnershipPoints(R.H(east), R.H(responderA), "H");
const pointsB = R.partnershipPoints(R.H(opener), R.H(responderB), "H");
assert.equal(pointsA, 25);
assert.equal(pointsB, 26);
assert.equal(R.H(responderA).htp("H"), 10);
assert.equal(R.H(responderB).htp("H"), 11);

const decisionA = R.nodeFor({hands:dealA,dealer:"N",bids:auction},4);
const decisionB = R.nodeFor({hands:dealB,dealer:"N",bids:auction},4);
assert.equal(decisionA.exp, "P");
assert.equal(decisionB.exp, "4H");
assert.notEqual(decisionA.exp, decisionB.exp,
  "Known defect should remain visible until live decisions stop reading partner's hidden cards");

console.log("KNOWN DEFECT reproduced for Buddie's East seat: identical own hand + auction produced Pass vs 4H from West's hidden cards.");
