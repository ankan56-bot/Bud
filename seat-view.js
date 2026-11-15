/* seat-view.js
 * Strict information boundary for future seat-specific bridge agents.
 * The agent receives this view, never the full game state.
 */
(function (root) {
  "use strict";
  const SEATS = ["N", "E", "S", "W"];
  const PUBLIC_STATE_KEYS = new Set(["playedCards","currentTrick","trickHistory","contract","declarer","dummy","dummyExposed","tricksTaken","trickNumber","nextToPlay","openingLead"]);
  const PRIVATE_KEYS = new Set(["hands","allHands","hiddenHands","privateHands","otherHands","fullDeal","dealHands","northHand","eastHand","southHand","westHand"]);
  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") { const out = {}; Object.keys(value).forEach(key => { out[key] = clone(value[key]); }); return out; }
    return value;
  }
  function freezeDeep(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => freezeDeep(value[key]));
    return Object.freeze(value);
  }
  function assertNoPrivateHandData(value, path, allowDummyHand) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach((item,index) => assertNoPrivateHandData(item,path+"["+index+"]",allowDummyHand)); return; }
    Object.keys(value).forEach(key => {
      if (PRIVATE_KEYS.has(key) || (key === "hand" && !allowDummyHand)) throw new TypeError("Private hand data is not allowed in publicState at "+path+"."+key);
      assertNoPrivateHandData(value[key],path+"."+key,allowDummyHand);
    });
  }
  function copyPublicState(publicState) {
    if (publicState == null) return {};
    if (typeof publicState !== "object" || Array.isArray(publicState)) throw new TypeError("publicState must be an object containing only whitelisted public fields");
    Object.keys(publicState).forEach(key => { if (!PUBLIC_STATE_KEYS.has(key)) throw new TypeError("Unsupported publicState field: "+key); });
    if (Object.prototype.hasOwnProperty.call(publicState,"dummy") && publicState.dummy != null && publicState.dummyExposed !== true) throw new TypeError("Dummy cards may be supplied only after dummyExposed is true");
    Object.keys(publicState).forEach(key => {
      if (key === "dummy") assertNoPrivateHandData(publicState[key],"publicState.dummy",true);
      else assertNoPrivateHandData(publicState[key],"publicState."+key,false);
    });
    return clone(publicState);
  }
  function createSeatView(gameState, seat, publicState) {
    if (!gameState || !gameState.hands) throw new TypeError("Game state with hands is required");
    if (SEATS.indexOf(seat) < 0) throw new RangeError("Unknown bridge seat: "+seat);
    if (!Array.isArray(gameState.hands[seat])) throw new TypeError("The selected seat has no valid hand");
    return freezeDeep({
      seat, ownHand: clone(gameState.hands[seat]),
      auction: clone(Array.isArray(gameState.bids) ? gameState.bids : []),
      dealer: gameState.dealer || null,
      vulnerability: clone(gameState.vulnerability == null ? null : gameState.vulnerability),
      publicState: copyPublicState(publicState),
      system: gameState.system || "Nordisk Standard"
    });
  }
  const api = { version: "0.2.0", createSeatView };
  root.BudSeatView = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
