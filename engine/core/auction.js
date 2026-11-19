'use strict';

const SEATS = ['N', 'E', 'S', 'W'];
const NEXT = { N: 'E', E: 'S', S: 'W', W: 'N' };
const PARTNER = { N: 'S', S: 'N', E: 'W', W: 'E' };
const SUITS = ['C', 'D', 'H', 'S', 'N'];
const CONTRACT_RE = /^[1-7][CDHSN]$/;

function isContractBid(call) {
  return typeof call === 'string' && CONTRACT_RE.test(call);
}
function rank(call) {
  if (!isContractBid(call)) return -1;
  return Number(call[0]) * 5 + SUITS.indexOf(call[1]);
}
function side(seat) {
  if (seat === 'N' || seat === 'S') return 'NS';
  if (seat === 'E' || seat === 'W') return 'EW';
  return null;
}
function parseCall(call) {
  if (call === 'P' || call === 'PASS') return { type: 'pass', normalized: 'P' };
  if (call === 'X' || call === 'DBL') return { type: 'double', normalized: 'X' };
  if (call === 'XX' || call === 'RDBL') return { type: 'redouble', normalized: 'XX' };
  if (isContractBid(call)) return { type: 'bid', normalized: call };
  return { type: 'invalid', normalized: call };
}

/**
 * Validate an auction without assigning system meaning to calls.
 * Input: { dealer: 'N', calls: [{seat:'N', call:'1H'}, ...] }
 * A call can also be a string if seats are inferred from dealer.
 */
function validateAuction(input = {}) {
  const dealer = input.dealer;
  const calls = Array.isArray(input.calls) ? input.calls : [];
  const errors = [];
  if (!SEATS.includes(dealer)) {
    errors.push({ index: -1, code: 'invalid-dealer', message: 'Dealer must be N, E, S, or W.' });
  }

  let expected = SEATS.includes(dealer) ? dealer : null;
  let contract = null;
  let contractSeat = null;
  let doubled = 0;
  let passes = 0;
  let ended = false;
  const normalizedCalls = [];

  calls.forEach((raw, index) => {
    const seat = typeof raw === 'string' ? expected : raw && raw.seat;
    const rawCall = typeof raw === 'string' ? raw : raw && raw.call;
    const parsed = parseCall(rawCall);
    const call = parsed.normalized;

    if (ended) {
      errors.push({ index, code: 'after-end', message: 'Call made after the auction ended.' });
      normalizedCalls.push({ index, seat, call, valid: false });
      return;
    }
    if (!SEATS.includes(seat)) {
      errors.push({ index, code: 'invalid-seat', message: 'Unknown seat.' });
    } else if (expected && seat !== expected) {
      errors.push({ index, code: 'wrong-turn', message: 'Expected ' + expected + ' to call, got ' + seat + '.' });
    }
    if (SEATS.includes(seat)) expected = NEXT[seat];

    let valid = true;
    if (parsed.type === 'invalid') {
      valid = false;
      errors.push({ index, code: 'invalid-call', message: 'Unknown call: ' + String(rawCall) + '.' });
    } else if (parsed.type === 'pass') {
      passes += 1;
      if ((!contract && passes >= 4) || (contract && passes >= 3)) ended = true;
    } else if (parsed.type === 'bid') {
      if (contract && rank(call) <= rank(contract)) {
        valid = false;
        errors.push({ index, code: 'bid-not-higher', message: call + ' must be higher than ' + contract + '.' });
      } else {
        contract = call;
        contractSeat = seat;
        doubled = 0;
        passes = 0;
      }
    } else if (parsed.type === 'double') {
      if (!contract) {
        valid = false;
        errors.push({ index, code: 'double-no-contract', message: 'A double requires a contract bid.' });
      } else if (side(seat) === side(contractSeat)) {
        valid = false;
        errors.push({ index, code: 'double-own-side', message: 'A side may not double its own contract.' });
      } else if (doubled !== 0) {
        valid = false;
        errors.push({ index, code: 'already-doubled', message: 'The contract is already doubled or redoubled.' });
      } else {
        doubled = 1;
        passes = 0;
      }
    } else if (parsed.type === 'redouble') {
      if (!contract || doubled !== 1) {
        valid = false;
        errors.push({ index, code: 'redouble-not-doubled', message: 'A redouble requires the opponents to have doubled.' });
      } else if (side(seat) !== side(contractSeat)) {
        valid = false;
        errors.push({ index, code: 'redouble-own-contract-side', message: 'Only the contract side may redouble.' });
      } else {
        doubled = 2;
        passes = 0;
      }
    }

    normalizedCalls.push({ index, seat, call, valid });
  });

  const contractText = contract
    ? contract + (doubled === 1 ? 'X' : doubled === 2 ? 'XX' : '')
    : null;

  return {
    valid: errors.length === 0,
    ended,
    dealer,
    nextSeat: ended ? null : expected,
    contract,
    contractSeat,
    contractSide: side(contractSeat),
    doubled,
    contractText,
    calls: normalizedCalls,
    errors
  };
}

module.exports = {
  SEATS,
  NEXT,
  PARTNER,
  SUITS,
  isContractBid,
  rank,
  side,
  parseCall,
  validateAuction
};
