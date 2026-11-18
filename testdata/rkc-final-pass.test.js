"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rattning = require("../rattningsmotor.js");

function deal() {
  const cards = [];
  for (const suit of ["S", "H", "D", "C"]) {
    for (let rank = 14; rank >= 2; rank--) cards.push(suit + rank);
  }
  return {
    N: cards.slice(0, 13),
    E: cards.slice(13, 26),
    S: cards.slice(26, 39),
    W: cards.slice(39, 52)
  };
}

function askAfterResponse(response) {
  const bids = [
    { s: "N", c: "1S" },
    { s: "E", c: "P" },
    { s: "S", c: "2S" },
    { s: "W", c: "P" },
    { s: "N", c: "4N" },
    { s: "E", c: "P" },
    { s: "S", c: response },
    { s: "W", c: "P" },
    { s: "N", c: "P" }
  ];
  return Rattning.nodeFor({ hands: deal(), dealer: "N", bids }, 8);
}

for (const response of ["5C", "5D", "5H", "5S"]) {
  test(response + " trump RKC response does not invent an unsupported asker continuation", () => {
    const result = askAfterResponse(response);
    assert.equal(result?.exp, null);
    assert.match(result?.why || "", /inte ett entydigt nästa bud|inte uttryckligen fastställd/i);
  });
}

function dealWithSouth(south) {
  const deck = [];
  for (const suit of ["S", "H", "D", "C"]) {
    for (let rank = 14; rank >= 2; rank--) deck.push(suit + rank);
  }
  const chosen = new Set(south);
  const rest = deck.filter(card => !chosen.has(card));
  return {
    N: rest.slice(0, 13),
    E: rest.slice(13, 26),
    S: south,
    W: rest.slice(26, 39)
  };
}

function responseFromSouthHand(south, trump = "S") {
  const hands = dealWithSouth(south);
  const bids = [
    { s: "N", c: "1" + trump }, { s: "E", c: "P" },
    { s: "S", c: "2" + trump }, { s: "W", c: "P" },
    { s: "N", c: "4N" }, { s: "E", c: "P" },
    { s: "S", c: "P" }
  ];
  return Rattning.nodeFor({ hands, dealer: "N", bids }, 6);
}

test("two keycards and a club void are shown by 6C when clubs are below trumps", () => {
  const hand = ["S14", "S10", "S9", "H14", "H13", "H12", "H11", "D10", "D13", "D12", "D11", "D9", "D8"];
  const result = responseFromSouthHand(hand);
  assert.deepEqual(Rattning.H(hand).L, { C: 0, D: 6, H: 4, S: 3 }, "test hand must contain exactly one club void");
  assert.equal(result?.exp, "6C", JSON.stringify(result));
});

test("three keycards and a void use the ordinary 5C keycard response", () => {
  const hand = ["S14", "S13", "S10", "S9", "D14", "D10", "D9", "D8", "H10", "H9", "H8", "H7", "H6"];
  const result = responseFromSouthHand(hand);
  assert.deepEqual(Rattning.H(hand).L, { C: 0, D: 4, H: 5, S: 4 });
  assert.equal(result?.exp, "5C", JSON.stringify(result));
});

test("two keycards and a heart void below spade trumps are shown by 6H", () => {
  const hand = ["S14", "S10", "S9", "S8", "D14", "D13", "D12", "D11", "D10", "D9", "D8", "D7", "C13"];
  const result = responseFromSouthHand(hand);
  assert.equal(result?.exp, "6H");
});

test("two keycards and a spade void above heart trumps are shown by 6H", () => {
  const hand = ["H13", "H10", "H9", "H8", "D14", "D10", "D9", "D8", "C12", "C11", "C10", "C9", "C8"];
  const result = responseFromSouthHand(hand, "H");
  assert.deepEqual(Rattning.H(hand).L, { C: 5, D: 4, H: 4, S: 0 });
  assert.equal(result?.exp, "6H", JSON.stringify(result));
});

test("a documented no-trump four-ace ask stops at 6NT when an ace is missing", () => {
  const hands = deal();
  const bids = [
    { s: "N", c: "1N" },
    { s: "E", c: "P" },
    { s: "S", c: "4N" },
    { s: "W", c: "P" },
    { s: "N", c: "5C" },
    { s: "E", c: "P" },
    { s: "S", c: "P" }
  ];
  const result = Rattning.nodeFor({ hands, dealer: "N", bids }, 6);
  assert.equal(result?.exp, "6N");
  assert.match(result?.why || "", /stanna i 6NT/i);
});




function dealWithNorth(north) {
  const deck = [];
  for (const suit of ["S", "H", "D", "C"]) {
    for (let rank = 14; rank >= 2; rank--) deck.push(suit + rank);
  }
  const chosen = new Set(north);
  const rest = deck.filter(card => !chosen.has(card));
  return {
    N: north,
    E: rest.slice(0, 13),
    S: rest.slice(13, 26),
    W: rest.slice(26, 39)
  };
}

function askerAfterAmbiguousResponse(north) {
  const hands = dealWithNorth(north);
  const bids = [
    { s: "N", c: "1S" }, { s: "E", c: "P" },
    { s: "S", c: "2S" }, { s: "W", c: "P" },
    { s: "N", c: "4N" }, { s: "E", c: "P" },
    { s: "S", c: "5C" }, { s: "W", c: "P" },
    { s: "N", c: "5D" }, { s: "E", c: "P" },
    { s: "S", c: "5S" }, { s: "W", c: "P" },
    { s: "N", c: "P" }
  ];
  return Rattning.nodeFor({ hands, dealer: "N", bids }, 12);
}

test("after 5C then 5S retreat, asker with three aces bids 6S", () => {
  const north = ["S14", "H14", "D14", "S13", "S12", "S11", "S10", "S9", "H2", "D2", "C2", "C3", "C4"];
  const result = askerAfterAmbiguousResponse(north);
  assert.equal(Rattning.H(north).aces, 3);
  assert.equal(result?.exp, "6S", JSON.stringify(result));
  assert.match(result?.why || "", /3 egna ess/);
});

test("after 5C then 5S retreat, asker with only two aces does not get the documented 6S continuation", () => {
  const north = ["S14", "H14", "S13", "S12", "S11", "S10", "S9", "S8", "H2", "D2", "C2", "C3", "C4"];
  const result = askerAfterAmbiguousResponse(north);
  assert.equal(Rattning.H(north).aces, 2);
  assert.equal(result?.exp, null, JSON.stringify(result));
  assert.match(result?.why || "", /inte ett entydigt nästa bud|inte uttryckligen fastställd/i);
});

test("after 5D then 5S retreat, asker with four aces bids 6S", () => {
  const north = ["S14", "H14", "D14", "C14", "S13", "S12", "S11", "S10", "S9", "H2", "D2", "C2", "C3"];
  const result = askerAfterAmbiguousResponse(north);
  assert.equal(Rattning.H(north).aces, 4);
  assert.equal(result?.exp, "6S", JSON.stringify(result));
});


function dealWithNorthSouth(north,south){const d=[];for(const s of ["S","H","D","C"])for(let n=14;n>=2;n--)d.push(s+n);const used=new Set([...north,...south]);const r=d.filter(c=>!used.has(c));return {N:north,E:r.slice(0,13),S:south,W:r.slice(13,26)};}
function ntAskState(north,south,aceReply,kingReply){const bids=[{s:"N",c:"1N"},{s:"E",c:"P"},{s:"S",c:"4N"},{s:"W",c:"P"},{s:"N",c:aceReply},{s:"E",c:"P"}];if(kingReply)bids.push({s:"S",c:"5N"},{s:"W",c:"P"},{s:"N",c:kingReply});return {hands:dealWithNorthSouth(north,south),dealer:"N",bids};}
const northNT=["S14","S13","S12","S11","S10","S9","H2","H3","D2","D3","C2","C3","C4"];
const southAllAces=["H14","D14","C14","H13","D13","C13","S8","S7","S6","H4","D4","C5","C6"];
test("sang 4NT: all four partnership aces leads to 5NT king ask",()=>{const st=ntAskState(northNT,southAllAces,"5D");st.bids.push({s:"S",c:"5N"});assert.equal(Rattning.H(st.hands.S).aces,3);assert.equal(Rattning.nodeFor(st,6).exp,"5N");});
test("sang 4NT: missing an ace stops at 6NT",()=>{const southMissing=["H14","D14","H13","D13","C13","S8","S7","S6","H4","D4","C5","C6","C7"];const st=ntAskState(northNT,southMissing,"5D");st.bids.push({s:"S",c:"6N"});assert.notEqual(Rattning.H(st.hands.S).aces,3);assert.equal(Rattning.nodeFor(st,6).exp,"6N");});
test("sang king ask: all four kings but fewer than 36 partnership HP stops at 6NT",()=>{const st=ntAskState(northNT,southAllAces,"5D","6D");st.bids.push({s:"E",c:"P"},{s:"S",c:"6N"});assert.equal(Rattning.H(st.hands.S).kings,3);assert.ok(Rattning.H(st.hands.S).hp+Rattning.H(st.hands.N).hp<37);assert.equal(Rattning.nodeFor(st,10).exp,"6N");assert.match(Rattning.nodeFor(st,10).why,/kravet för 7NT är 36/i);});
const northNTGrand=["S14","S13","H12","D11","S2","S3","S4","S5","S6","S7","S8","S9","S10"];
const southNTGrand=["H14","D14","C14","H13","D13","C13","S12","C12","H11","H2","H3","D2","D3"];
test("sang king ask: all four aces and kings plus exactly 36 partnership HP permits 7NT",()=>{const st=ntAskState(northNTGrand,southNTGrand,"5D","6D");st.bids.push({s:"E",c:"P"},{s:"S",c:"7N"});assert.equal(Rattning.H(st.hands.S).aces,3);assert.equal(Rattning.H(st.hands.S).kings,3);assert.equal(Rattning.H(st.hands.S).hp+Rattning.H(st.hands.N).hp,36);assert.equal(Rattning.nodeFor(st,10).exp,"7N");});

test("sang king ask: a missing king stops at 6NT",()=>{const southTwo=["H14","D14","C14","H13","D13","S8","S7","S6","H4","D4","C5","C6","C7"];const st=ntAskState(northNT,southTwo,"5D","6D");st.bids.push({s:"E",c:"P"},{s:"S",c:"6N"});assert.equal(Rattning.H(st.hands.S).kings,2);assert.equal(Rattning.nodeFor(st,10).exp,"6N");});

test("trump 5NT king ask: responder shows the first eligible side king/shortness", () => {
  const hand = ["S14", "S10", "S9", "H14", "H13", "H12", "H11", "D10", "D13", "D12", "D11", "D9", "D8"];
  const hands = dealWithSouth(hand);
  const bids = [
    { s: "N", c: "1S" }, { s: "E", c: "P" },
    { s: "S", c: "2S" }, { s: "W", c: "P" },
    { s: "N", c: "4N" }, { s: "E", c: "P" },
    { s: "S", c: "5D" }, { s: "W", c: "P" },
    { s: "N", c: "5N" }, { s: "E", c: "P" },
    { s: "S", c: "6C" }
  ];
  const result = Rattning.nodeFor({ hands, dealer: "N", bids }, 10);
  assert.equal(result?.exp, "6C", JSON.stringify(result));
  assert.match(result?.why || "", /första sidokungen/i);
});
