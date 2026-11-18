"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rattning = require("../rattningsmotor.js");

// Representative of nine identical false slam conflicts:
// 1H–2NT–3NT. The 33+ point rule must initiate RKC, not jump directly to 6H.
const northSlam = ["S2","C14","H10","H8","C4","H4","D4","S12","D13","S7","H5","C13","D9"];
const southSlam = ["C12","S14","H3","D10","H7","H12","D6","D14","C2","H13","H14","C7","D11"];
const slamPrefix = [
  {s:"N",c:"1H"},{s:"E",c:"P"},{s:"S",c:"2N"},
  {s:"W",c:"P"},{s:"N",c:"3N"},{s:"E",c:"P"}
];
function slamNode(call) {
  return Rattning.nodeFor({
    hands:{N:northSlam,S:southSlam,E:[],W:[]},
    dealer:"N",bids:slamPrefix.concat([{s:"S",c:call}])
  },6);
}

test("33+ points with an agreed major fit initiates 4NT/RKC, not an unsupported direct 6-level bid", () => {
  const pass = slamNode("P");
  assert.equal(pass.exp,"4N");
  assert.match(pass.why,/undersökas via 4NT\/RKC/);
  const ask = slamNode("4N");
  assert.equal(ask.exp,"4N");
  assert.equal(ask.conv,"Blackwood 5 ess");
});

const northRaise = ["C12","S12","S14","C6","D10","H8","D8","C14","C9","C7","H13","D5","D11"];
const southRaise = ["C4","D6","D7","S9","S11","D2","C10","S8","C5","H4","H14","S10","D12"];
const raisePrefix = [
  {s:"N",c:"1C"},{s:"E",c:"P"},{s:"S",c:"1D"},
  {s:"W",c:"P"},{s:"N",c:"3D"},{s:"E",c:"P"}
];
function raiseNode(call) {
  const bids=raisePrefix.concat([{s:"S",c:call}]);
  return Rattning.nodeFor({hands:{N:northRaise,S:southRaise,E:[],W:[]},dealer:"N",bids},6);
}

test("the engine never recommends repeating the 3D contract already on the table", () => {
  assert.equal(raiseNode("P").exp,"P");
  assert.equal(raiseNode("3D").exp,"P");
  assert.match(raiseNode("P").why,/inte längre lagligt/);
});

const northFourth = ["D3","C6","D8","S11","C14","S14","H3","S12","S9","H9","C5","D5","S4"];
const southFourth = ["D2","H14","C13","C9","D12","H12","H4","C8","H10","C12","H2","S13","D7"];
const fourthPrefix = [
  {s:"S",c:"1H"},{s:"W",c:"P"},{s:"N",c:"1S"},
  {s:"E",c:"P"},{s:"S",c:"2C"},{s:"W",c:"P"}
];
function fourthNode(call) {
  const bids=fourthPrefix.concat([{s:"N",c:call}]);
  return Rattning.nodeFor({hands:{N:northFourth,S:southFourth,E:[],W:[]},dealer:"N",bids},6);
}

test("after 1H-1S-2C the engine does not fall back to 2NT without both required stoppers", () => {
  const pass=fourthNode("P");
  const twoNT=fourthNode("2N");
  assert.equal(pass.exp,null);
  assert.equal(twoNT.exp,null);
  assert.match(pass.why,/håll i både ♠ och ♦/);
});
