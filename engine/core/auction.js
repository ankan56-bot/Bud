'use strict';

const SEATS = Object.freeze(['N', 'E', 'S', 'W']);
const NEXT = Object.freeze({ N: 'E', E: 'S', S: 'W', W: 'N' });
const PARTNER = Object.freeze({ N: 'S', S: 'N', E: 'W', W: 'E' });
const { normalizeCall, callType, contractRank } = require('./calls');

function side(seat) {
  if (seat === 'N' || seat === 'S') return 'NS';
  if (seat === 'E' || seat === 'W') return 'EW';
  return null;
}
function createAuctionState(dealer) {
  return {
    dealer,
    nextSeat: SEATS.includes(dealer) ? dealer : null,
    contract: null,
    contractSeat: null,
    doubleState: 0, // 0 undoubled, 1 doubled, 2 redoubled
    passesSinceAction: 0,
    ended: false,
    calls: [],
    errors: []
  };
}
function error(state, index, code, message) {
  state.errors.push({ index, code, message });
}

/** Pure-ish state transition: mutates the provided state for convenient replay. */
function applyCall(state, raw, index = state.calls.length) {
  const seat = typeof raw === 'string' ? state.nextSeat : raw && raw.seat;
  const rawCall = typeof raw === 'string' ? raw : raw && raw.call;
  const call = normalizeCall(rawCall);
  const item = { index, seat, rawCall, call, valid: true };

  if (state.ended) {
    item.valid = false; error(state, index, 'after-end', 'Call made after auction ended.');
    state.calls.push(item); return state;
  }
  if (!SEATS.includes(seat)) {
    item.valid = false; error(state, index, 'invalid-seat', 'Unknown seat.');
  } else if (seat !== state.nextSeat) {
    item.valid = false; error(state, index, 'wrong-turn', `Expected ${state.nextSeat}; got ${seat}.`);
    state.calls.push(item); return state;
  }
  if (!SEATS.includes(seat)) {
    state.calls.push(item); return state;
  }

  if (!call) {
    item.valid = false; error(state, index, 'invalid-call', `Unknown call: ${String(rawCall)}.`);
    state.calls.push(item); return state;
  } else {
    const type = callType(call);
    if (type === 'bid') {
      if (state.contract && contractRank(call) <= contractRank(state.contract)) {
        item.valid = false; error(state, index, 'bid-not-higher', `${call} is not higher than ${state.contract}.`);
      } else {
        state.contract = call;
        state.contractSeat = seat;
        state.doubleState = 0;
        state.passesSinceAction = 0;
      }
    } else if (type === 'double') {
      if (!state.contract) {
        item.valid = false; error(state, index, 'double-no-contract', 'Double requires a contract bid.');
      } else if (state.doubleState !== 0) {
        item.valid = false; error(state, index, 'already-doubled', 'The current contract is already doubled/redoubled.');
      } else if (side(seat) === side(state.contractSeat)) {
        item.valid = false; error(state, index, 'double-own-side', 'A side cannot double its own contract.');
      } else {
        state.doubleState = 1; state.passesSinceAction = 0;
      }
    } else if (type === 'redouble') {
      if (!state.contract || state.doubleState !== 1) {
        item.valid = false; error(state, index, 'redouble-not-doubled', 'Redouble requires the opponents to have doubled.');
      } else if (side(seat) !== side(state.contractSeat)) {
        item.valid = false; error(state, index, 'redouble-contract-side', 'Only the contract side may redouble.');
      } else {
        state.doubleState = 2; state.passesSinceAction = 0;
      }
    } else {
      state.passesSinceAction += 1;
      if ((!state.contract && state.passesSinceAction === 4) ||
          (state.contract && state.passesSinceAction === 3)) state.ended = true;
    }
  }

  item.valid = item.valid && !state.errors.some(e => e.index === index);
  state.calls.push(item);
  state.nextSeat = NEXT[seat];
  return state;
}
function replayAuction(input = {}) {
  const state = createAuctionState(input.dealer);
  const calls = Array.isArray(input.calls) ? input.calls : [];
  calls.forEach((raw, index) => applyCall(state, raw, index));
  const contractText = state.contract ? state.contract + (state.doubleState === 1 ? 'X' : state.doubleState === 2 ? 'XX' : '') : null;
  return {
    valid: state.errors.length === 0,
    ended: state.ended,
    dealer: state.dealer,
    nextSeat: state.ended ? null : state.nextSeat,
    contract: state.contract,
    contractSeat: state.contractSeat,
    contractSide: side(state.contractSeat),
    doubled: state.doubleState,
    contractText,
    calls: state.calls,
    errors: state.errors
  };
}
module.exports = { SEATS, NEXT, PARTNER, side, createAuctionState, applyCall, replayAuction, validateAuction: replayAuction };
