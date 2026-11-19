'use strict';
const { SUITS, validateSuitCards } = require('./cards');
const { highCardPoints } = require('./points');

function normalizeHand(input) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { valid: false, hand: null, errors: ['Hand must be an object keyed by S,H,D,C.'] };
  const hand = {};
  for (const suit of SUITS) {
    const parsed = validateSuitCards(input[suit] || '');
    hand[suit] = parsed.cards;
    errors.push(...parsed.errors.map(e => `${suit}: ${e}`));
  }
  const count = SUITS.reduce((n, suit) => n + hand[suit].length, 0);
  if (count !== 13) errors.push(`A hand must contain exactly 13 cards; got ${count}.`);
  return { valid: errors.length === 0, hand, errors };
}
function lengths(hand) {
  return Object.fromEntries(SUITS.map(suit => [suit, (hand && hand[suit] || []).length]));
}
function sortedLengths(hand) {
  return SUITS.map(suit => (hand && hand[suit] || []).length).sort((a,b) => b-a);
}
function shape(hand) {
  const lens = sortedLengths(hand);
  return lens.join('-');
}
function isBalanced(hand) {
  const s = sortedLengths(hand);
  return (s[0] <= 5 && s[2] >= 2 && s[3] >= 2) || s.join('-') === '4-3-3-3';
}
function describeDistribution(hand) {
  const lens = lengths(hand);
  const nonVoid = SUITS.filter(s => lens[s] > 0).length;
  const longSuits = SUITS.filter(s => lens[s] >= 5);
  const shortSuits = SUITS.filter(s => lens[s] <= 1);
  return { lengths: lens, shape: shape(hand), balanced: isBalanced(hand), nonVoid, longSuits, shortSuits };
}
module.exports = { normalizeHand, lengths, sortedLengths, shape, isBalanced, describeDistribution, highCardPoints };
