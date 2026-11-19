'use strict';
const { SUITS, HCP_VALUES } = require('./cards');
/** Raw HCP only. No distribution, trump-fit, or system-specific adjustments. */
function highCardPoints(hand) {
  if (!hand || typeof hand !== 'object') return 0;
  return SUITS.reduce((total, suit) => total + (hand[suit] || []).reduce((sum, rank) => sum + (HCP_VALUES[rank] || 0), 0), 0);
}
module.exports = { highCardPoints };
