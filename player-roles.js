/* player-roles.js
 * Default table configuration for the planned human-vs-three-AI game.
 * Roles describe control only; they do not grant access to hidden cards.
 */
(function (root) {
  "use strict";
  const SEATS = ["N", "E", "S", "W"];
  const DEFAULT_ROLES = Object.freeze({
    N: Object.freeze({ controller: "human", relationship: "human_player" }),
    S: Object.freeze({ controller: "ai", relationship: "partner" }),
    E: Object.freeze({ controller: "ai", relationship: "opponent" }),
    W: Object.freeze({ controller: "ai", relationship: "opponent" })
  });

  function getSeatRole(seat, overrides) {
    if (SEATS.indexOf(seat) < 0) throw new RangeError("Unknown bridge seat: " + seat);
    const role = overrides && overrides[seat] ? overrides[seat] : DEFAULT_ROLES[seat];
    if (!role || (role.controller !== "human" && role.controller !== "ai")) {
      throw new TypeError("Each seat must have controller 'human' or 'ai'");
    }
    if (role.controller === "ai" && role.relationship !== "partner" && role.relationship !== "opponent") {
      throw new TypeError("AI relationship must be 'partner' or 'opponent'");
    }
    return Object.freeze({ controller: role.controller, relationship: role.relationship });
  }

  function getDefaultTableRoles() {
    const out = {};
    SEATS.forEach(seat => { out[seat] = getSeatRole(seat); });
    return Object.freeze(out);
  }

  const api = { version: "1.0.0", seats: SEATS.slice(), getSeatRole, getDefaultTableRoles };
  root.BudPlayerRoles = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
