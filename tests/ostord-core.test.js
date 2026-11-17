"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rattning = require("../rattningsmotor.js");

const filler = ["C2","C3","C4","C5","C6","D2","D3","D4","H2","H3","S2","S3","S4"];
function state(north, south, bids) {
  return {hands:{N:north,S:south,E:filler,W:filler},dealer:"N",bids};
}
function node(north,south,bids,index) {
  return Rattning.nodeFor(state(north,south,bids),index);
}
const openerH5D4 = ["H14","H13","H12","H9","H8","D14","D13","D9","D8","S9","S8","C9","C8"]; // 16 hp, 5-4
const responder11 = ["S14","S13","S9","S8","H12","D11","C11","S7","H9","H8","D9","D8","C9"]; // 11 hp
const responder13 = ["S14","S13","S9","S8","H12","D12","C12","S7","H9","H8","D9","D8","C9"]; // 13 hp
const oneHoneSoneD = [
  {s:"N",c:"1H"},{s:"E",c:"P"},{s:"S",c:"1S"},{s:"W",c:"P"}
];

test("1♥–1♠–2♦–2NT is an 11–12 hp invite",()=>{
  const bids=oneHoneSoneD.concat([{s:"N",c:"2D"},{s:"E",c:"P"},{s:"S",c:"2N"}]);
  const result=node(openerH5D4,responder11,bids,6);
  assert.equal(result.exp,"2N",result.why);
  assert.equal(result.conv,"SH:s andra bud efter 1♥–1♠–2♦");
  assert.match(result.means("2N"),/11–12 hp/);
});

test("1♥–1♠–2♦–2NT outside 11–12 hp is left uncovered",()=>{
  const bids=oneHoneSoneD.concat([{s:"N",c:"2D"},{s:"E",c:"P"},{s:"S",c:"2N"}]);
  const result=node(openerH5D4,responder13,bids,6);
  assert.equal(result.exp,null,result.why);
  assert.match(result.why,/11–12 hp/);
});

test("opener's third bid after the 11–12 invite is assessed on its documented range",()=>{
  const bids=oneHoneSoneD.concat([{s:"N",c:"2D"},{s:"E",c:"P"},{s:"S",c:"2N"},{s:"W",c:"P"},{s:"N",c:"3N"}]);
  const result=node(openerH5D4,responder11,bids,8);
  assert.equal(result.exp,"3N",result.why);
  assert.equal(result.conv,"ÖH:s tredje bud efter 2NT-invit");
  assert.match(result.why,/15–17 hp/);
});

test("1♥–1♠–2♣–2NT requires 10–12 hp, balanced, two hearts and spade/diamond stoppers",()=>{
  const opener=["H14","H13","H9","H8","H7","C14","C13","C9","C8","S9","S8","D9","D8"];
  const responder=["S14","S9","S8","S7","D14","D9","D8","D7","H12","H9","C9","C8","C7"];
  const bids=oneHoneSoneD.concat([{s:"N",c:"2C"},{s:"E",c:"P"},{s:"S",c:"2N"}]);
  const result=node(opener,responder,bids,6);
  assert.equal(result.exp,"2N",result.why);
  assert.match(result.why,/tvåkorts ♥/);
});

test("1♥–1♠–2♣–3♥ shows three-card heart support and 10–12 htp",()=>{
  const opener=["H14","H13","H9","H8","H7","C14","C13","C9","C8","S9","S8","D9","D8"];
  const responder=["H14","H13","H9","S14","S9","S8","S7","D9","D8","D7","C9","C8","C7"];
  const bids=oneHoneSoneD.concat([{s:"N",c:"2C"},{s:"E",c:"P"},{s:"S",c:"3H"}]);
  const result=node(opener,responder,bids,6);
  assert.equal(result.exp,"3H",result.why);
  assert.match(result.why,/10–12 htp/);
});

test("1♥–1♠–2♦–3♠ shows 6+ spades and 10–12 htp",()=>{
  const responder=["S14","S13","S9","S8","S7","S6","H12","H9","D11","D9","D8","C9","C8"];
  const bids=oneHoneSoneD.concat([{s:"N",c:"2D"},{s:"E",c:"P"},{s:"S",c:"3S"}]);
  const result=node(openerH5D4,responder,bids,6);
  assert.equal(result.exp,"3S",result.why);
  assert.match(result.why,/6\+ ♠ och 10–12 htp/);
});

test("1♠–2♥ requires 11+ hp and at least five hearts",()=>{
  const opener=["S14","S13","S9","S8","S7","H9","H8","D9","D8","D7","C9","C8","C7"];
  const responder=["H14","H13","H9","H8","H7","D14","S9","S8","S7","C9","C8","D8","C7"];
  const bids=[{s:"N",c:"1S"},{s:"E",c:"P"},{s:"S",c:"2H"}];
  const result=node(opener,responder,bids,2);
  assert.equal(result.exp,"2H",result.why);
  assert.match(result.why,/11\+ hp och 5\+ ♥/);
});

test("1♠–2♣ is available with 4-3-3-3 and 11+ hp when responder has four hearts",()=>{
  const opener=["S14","S13","S9","S8","S7","H9","H8","D9","D8","D7","C9","C8","C7"];
  const responder=["H14","H13","H9","H8","C14","C9","C8","D9","D8","D7","S9","S8","S7"];
  const bids=[{s:"N",c:"1S"},{s:"E",c:"P"},{s:"S",c:"2C"}];
  const result=node(opener,responder,bids,2);
  assert.equal(result.exp,"2C",result.why);
  assert.match(result.why,/4♥ och 3♣ i 4-3-3-3/);
});

test("10 hp with a six-card club suit after 1♦ does not use 2-over-1; it bids 1NT",()=>{
  const opener=["D14","D13","D9","D8","D7","H9","H8","H7","S9","S8","C9","C8","C7"];
  const responder=["C14","C13","C9","C8","C7","C6","H12","H9","H8","D11","D9","S9","S8"];
  const bids=[{s:"N",c:"1D"},{s:"E",c:"P"},{s:"S",c:"1N"}];
  const result=node(opener,responder,bids,2);
  assert.equal(result.exp,"1N",result.why);
});

test("four-four opening suit selection uses the lowest suit",()=>{
  const hand=["C14","C13","C9","C8","D14","D13","D9","D8","H9","H8","H7","S9","S8"];
  const result=node(hand,filler,[{s:"N",c:"1C"}],0);
  assert.equal(result.exp,"1C",result.why);
});

test("five-five spades/clubs with poor spades may open 1♣",()=>{
  const hand=["S9","S8","S7","S6","S2","C14","C13","C12","C9","C8","D14","D9","H9"];
  const result=node(hand,filler,[{s:"N",c:"1C"}],0);
  assert.equal(result.exp,"1C",result.why);
  assert.ok(!result.alt.includes("1C"));
});

test("major-suit support responses use 6–9 htp for the two-level and 10–12 for the three-level",()=>{
  const opener=["H14","H13","H9","H8","H7","D14","D13","D9","D8","S9","S8","C9","C8"];
  const nine=["H14","H13","H9","H8","S12","S9","S8","D9","D8","D7","C9","C8","C7"];
  const ten=["H14","H13","H9","H8","S12","S9","S8","D11","D8","D7","C9","C8","C7"];
  const nineResult=node(opener,nine,[{s:"N",c:"1H"},{s:"E",c:"P"},{s:"S",c:"2H"}],2);
  const tenResult=node(opener,ten,[{s:"N",c:"1H"},{s:"E",c:"P"},{s:"S",c:"3H"}],2);
  assert.equal(nineResult.exp,"2H",nineResult.why);
  assert.equal(tenResult.exp,"3H",tenResult.why);
});

test("13 htp with four-card heart support uses Stenberg 2NT",()=>{
  const opener=["H14","H13","H9","H8","H7","D14","D13","D9","D8","S9","S8","C9","C8"];
  const responder=["H14","H13","H9","H8","S14","S9","S8","D11","D8","C9","C8","C7","C6"];
  const result=node(opener,responder,[{s:"N",c:"1H"},{s:"E",c:"P"},{s:"S",c:"2N"}],2);
  assert.equal(result.exp,"2N",result.why);
  assert.match(result.why,/Stenberg 2NT/);
});
