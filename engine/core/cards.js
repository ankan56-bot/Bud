'use strict';
const SUITS = Object.freeze(['S', 'H', 'D', 'C']);
const RANKS = Object.freeze(['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']);
const HCP_VALUES = Object.freeze({ A: 4, K: 3, Q: 2, J: 1 });
function isSuit(suit) { return SUITS.includes(suit); }
function isRank(rank) { return RANKS.includes(rank); }
function cardId(suit, rank) { return `${suit}${rank}`; }
function validateSuitCards(cards) {
  if (typeof cards !== 'string') return { valid: false, cards: [], errors: ['Suit holding must be a string.'] };
  const normalized = cards.toUpperCase().replace(/[\s,.-]/g, '');
  const errors = [];
  const seen = new Set();
  for (const rank of normalized) {
    if (!isRank(rank)) errors.push(`Invalid rank ${rank}.`);
    else if (seen.has(rank)) errors.push(`Duplicate rank ${rank} in suit.`);
    else seen.add(rank);
  }
  return { valid: errors.length === 0, cards: [...seen], errors };
}
module.exports = { SUITS, RANKS, HCP_VALUES, isSuit, isRank, cardId, validateSuitCards };
