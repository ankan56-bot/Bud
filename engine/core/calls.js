'use strict';

const SUITS = Object.freeze(['C', 'D', 'H', 'S', 'N']);
const CONTRACTS = Object.freeze(Array.from({ length: 7 }, (_, i) => 1 + i)
  .flatMap(level => SUITS.map(suit => `${level}${suit}`)));
const CALL_ALIASES = Object.freeze({ PASS: 'P', DBL: 'X', DOUBLE: 'X', RDBL: 'XX', REDOUBLE: 'XX' });
const CALLS = Object.freeze(['P', 'X', 'XX', ...CONTRACTS]);

function normalizeCall(raw) {
  if (typeof raw !== 'string') return null;
  const upper = raw.trim().toUpperCase();
  return CALL_ALIASES[upper] || (CALLS.includes(upper) ? upper : null);
}
function callType(call) {
  const normalized = normalizeCall(call);
  if (!normalized) return 'invalid';
  if (normalized === 'P') return 'pass';
  if (normalized === 'X') return 'double';
  if (normalized === 'XX') return 'redouble';
  return 'bid';
}
function contractRank(contract) {
  const c = normalizeCall(contract);
  if (!c || callType(c) !== 'bid') return -1;
  const level = Number(c[0]);
  const denomination = SUITS.indexOf(c[1]);
  return (level - 1) * 5 + denomination;
}
function isContract(call) { return callType(call) === 'bid'; }

module.exports = { SUITS, CONTRACTS, CALLS, normalizeCall, callType, contractRank, isContract };
