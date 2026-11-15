/* Core for 1–4 human bridge bidding sessions.
 * UI-independent: the existing bidding/rules engine supplies legalCall and botCall.
 * Seats are always N/E/S/W; a human may control any seat, including several seats
 * on one device. This module deliberately does not implement card play.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.BudSession = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const SEATS = ["N", "E", "S", "W"];

  function assertSeat(seat) {
    if (!SEATS.includes(seat)) throw new Error("Ogiltig plats: " + seat);
  }
  function nextSeat(seat) {
    assertSeat(seat);
    return SEATS[(SEATS.indexOf(seat) + 1) % 4];
  }
  function turn(session) {
    return SEATS[(SEATS.indexOf(session.dealer) + session.bids.length) % 4];
  }
  function auctionEnded(bids) {
    if (!bids.length) return false;
    const anyNonPass = bids.some(b => b.call !== "P");
    return anyNonPass
      ? bids.length >= 4 && bids.slice(-3).every(b => b.call === "P")
      : bids.length >= 4;
  }
  function normalizeHumanSeats(humanSeats) {
    if (!Array.isArray(humanSeats)) throw new Error("humanSeats måste vara en lista.");
    const seats = humanSeats.slice();
    if (seats.length < 1 || seats.length > 4) throw new Error("Ange 1–4 mänskliga spelare.");
    seats.forEach(assertSeat);
    if (new Set(seats).size !== seats.length) throw new Error("Varje plats kan bara tilldelas en människa.");
    return SEATS.filter(s => seats.includes(s));
  }
  function validateHands(hands) {
    if (!hands || !SEATS.every(s => Array.isArray(hands[s]) && hands[s].length === 13)) {
      throw new Error("En giltig giv med 13 kort per spelare krävs.");
    }
    const cards = SEATS.flatMap(s => hands[s]);
    if (cards.some(c => typeof c !== "string" || !c.length) || new Set(cards).size !== 52) {
      throw new Error("Given måste innehålla 52 unika kort.");
    }
  }
  function createSession(config) {
    config = config || {};
    const humanSeats = normalizeHumanSeats(config.humanSeats || ["S"]);
    const dealer = config.dealer || "N";
    assertSeat(dealer);
    validateHands(config.hands);
    const bids = [];
    (config.bids || []).forEach(b => {
      assertSeat(b.seat);
      if (typeof b.call !== "string" || !b.call) throw new Error("Ogiltigt bud i auktionen.");
      if (auctionEnded(bids)) throw new Error("Auktionen innehåller bud efter avslut.");
      const expected = SEATS[(SEATS.indexOf(dealer) + bids.length) % 4];
      if (b.seat !== expected) throw new Error("Fel budordning: väntade " + expected + " men fick " + b.seat + ".");
      bids.push({ seat: b.seat, call: b.call, explanation: b.explanation || "" });
    });
    const session = {
      version: 1,
      id: config.id || null,
      dealer,
      mode: config.mode || "stord",
      focus: config.focus || "alla",
      humanSeats,
      botSeats: SEATS.filter(s => !humanSeats.includes(s)),
      hands: config.hands,
      bids,
      status: "bidding"
    };
    if (auctionEnded(bids)) session.status = "complete";
    return session;
  }
  function isHumanTurn(session) {
    return session.status === "bidding" && session.humanSeats.includes(turn(session));
  }
  function isBotTurn(session) {
    return session.status === "bidding" && session.botSeats.includes(turn(session));
  }
  function snapshot(session) {
    return {
      version: session.version, id: session.id, dealer: session.dealer,
      mode: session.mode, focus: session.focus,
      humanSeats: session.humanSeats.slice(), botSeats: session.botSeats.slice(),
      hands: session.hands, bids: session.bids.map(b => Object.assign({}, b)),
      status: session.status
    };
  }
  function applyCall(session, seat, call, legalCall) {
    if (session.status !== "bidding") throw new Error("Budgivningen är redan avslutad.");
    assertSeat(seat);
    if (!session.humanSeats.includes(seat)) throw new Error("Platsen är inte tilldelad en människa.");
    if (turn(session) !== seat) throw new Error("Det är inte " + seat + "s tur.");
    if (typeof legalCall !== "function" || !legalCall(session, call, seat)) {
      throw new Error("Budet är inte tillåtet.");
    }
    const next = snapshot(session);
    next.bids.push({ seat, call, explanation: "" });
    if (auctionEnded(next.bids)) next.status = "complete";
    return next;
  }
  function advanceBots(session, botCall, legalCall, maxCalls) {
    if (typeof botCall !== "function" || typeof legalCall !== "function") {
      throw new Error("Bot- och budvalideringsfunktion måste anges.");
    }
    const next = snapshot(session);
    const limit = Math.max(1, Math.min(40, maxCalls || 40));
    let count = 0;
    while (next.status === "bidding" && next.botSeats.includes(turn(next)) && count < limit) {
      const seat = turn(next);
      const result = botCall(next, seat);
      const call = typeof result === "string" ? result : result && result.call;
      const explanation = typeof result === "object" && result ? (result.explanation || "") : "";
      if (!call || !legalCall(next, call, seat)) {
        throw new Error("Boten föreslog ett ogiltigt bud på " + seat + ".");
      }
      next.bids.push({ seat, call, explanation });
      count++;
      if (auctionEnded(next.bids)) next.status = "complete";
    }
    if (next.status === "bidding" && next.botSeats.includes(turn(next)) && count === limit) {
      throw new Error("Botsekvensen nådde säkerhetsgränsen utan att lämna över turen.");
    }
    return next;
  }
  return {
    version: "1.0.0", seats: SEATS.slice(), nextSeat, turn, auctionEnded,
    createSession, isHumanTurn, isBotTurn, applyCall, advanceBots, snapshot
  };
});
