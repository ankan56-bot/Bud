/* seat-view.js
 * Information boundary for future seat-specific bridge agents.
 * The agent receives this view, never the full game state.
 */
(function (root) {
  "use strict";

  const SEATS = ["N", "E", "S", "W"];

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") {
      const out = {};
      Object.keys(value).forEach(function (key) { out[key] = clone(value[key]); });
      return out;
    }
    return value;
  }

  function freezeDeep(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { freezeDeep(value[key]); });
    return Object.freeze(value);
  }

  /**
   * Build the strictly whitelisted information passed to one AI seat.
   * publicState must be assembled from information legally visible to that seat
   * (for example, the auction and played cards; dummy only after it is exposed).
   * Do not pass the original game state as publicState.
   */
  function createSeatView(gameState, seat, publicState) {
    if (!gameState || !gameState.hands) throw new TypeError("Game state with hands is required");
    if (SEATS.indexOf(seat) < 0) throw new RangeError("Unknown bridge seat: " + seat);
    if (!Array.isArray(gameState.hands[seat])) throw new TypeError("The selected seat has no valid hand");

    const view = {
      seat: seat,
      ownHand: clone(gameState.hands[seat]),
      auction: clone(Array.isArray(gameState.bids) ? gameState.bids : []),
      dealer: gameState.dealer || null,
      vulnerability: clone(gameState.vulnerability == null ? null : gameState.vulnerability),
      publicState: clone(publicState == null ? {} : publicState),
      system: gameState.system || "Nordisk Standard"
    };
    return freezeDeep(view);
  }

  const api = { version: "0.1.0", createSeatView: createSeatView };
  root.BudSeatView = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
