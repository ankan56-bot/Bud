const test = require("node:test");
const assert = require("node:assert/strict");
const BudSession = require("../budgivning-session.js");
const hands = Object.fromEntries(["N","E","S","W"].map(s => [s, Array(13).fill(s + "2")]));
const legal = (st, call, seat) => call === "P" || /^[1-7][CDHSN]$/.test(call);

test("stödjer 1, 2, 3 och 4 mänskliga spelare", () => {
  for (let n=1;n<=4;n++) {
    const humanSeats = ["N","E","S","W"].slice(0,n);
    const s = BudSession.createSession({hands, dealer:"N", humanSeats});
    assert.equal(s.humanSeats.length,n);
    assert.equal(s.botSeats.length,4-n);
  }
});
test("fördelar botplatser automatiskt och lämnar över till människa", () => {
  let s = BudSession.createSession({hands,dealer:"N",humanSeats:["N","S"]});
  assert.equal(BudSession.isHumanTurn(s),true);
  s = BudSession.applyCall(s,"N","1H",legal);
  s = BudSession.advanceBots(s,()=>({call:"P",explanation:"Pass"}),legal);
  assert.equal(s.bids.length,2);
  assert.equal(s.bids[1].seat,"E");
  assert.equal(BudSession.turn(s),"S");
  assert.equal(BudSession.isHumanTurn(s),true);
});
test("alla botplatser kan bjuda tills auktionen åter når människa", () => {
  let s = BudSession.createSession({hands,dealer:"N",humanSeats:["N"]});
  s = BudSession.applyCall(s,"N","1N",legal);
  s = BudSession.advanceBots(s,()=> "P",legal);
  assert.equal(BudSession.turn(s),"N");
  assert.equal(s.bids.length,4);
  assert.equal(s.status,"bidding");
});
test("fyra mänskliga spelare ger inga automatiska botbud", () => {
  const s = BudSession.createSession({hands,dealer:"N",humanSeats:["N","E","S","W"]});
  assert.equal(BudSession.isBotTurn(s),false);
  assert.equal(BudSession.advanceBots(s,()=>{throw Error("should not run")},legal).bids.length,0);
});
test("avvisar dubbla platser, fel tur och otillåtna bud", () => {
  assert.throws(()=>BudSession.createSession({hands,humanSeats:["N","N"]}));
  const s = BudSession.createSession({hands,dealer:"N",humanSeats:["S"]});
  assert.throws(()=>BudSession.applyCall(s,"S","1H",legal),/inte S/);
  assert.throws(()=>BudSession.applyCall(s,"N","1H",legal),/inte tilldelad/);
});
test("auktionen avslutas efter fyra pass eller tre pass efter kontraktsbud", () => {
  assert.equal(BudSession.auctionEnded([{call:"P"},{call:"P"},{call:"P"},{call:"P"}]),true);
  assert.equal(BudSession.auctionEnded([{call:"1N"},{call:"P"},{call:"P"},{call:"P"}]),true);
});
