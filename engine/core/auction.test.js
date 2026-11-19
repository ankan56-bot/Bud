'use strict';

const assert = require('node:assert/strict');
const { rank, parseCall, validateAuction } = require('./auction');

assert.equal(rank('1C'), 6);
assert.ok(rank('1D') > rank('1C'));
assert.ok(rank('1H') > rank('1D'));
assert.ok(rank('1S') > rank('1H'));
assert.ok(rank('1N') > rank('1S'));
assert.equal(parseCall('PASS').normalized, 'P');

const passedOut = validateAuction({ dealer: 'N', calls: ['P', 'P', 'P', 'P'] });
assert.equal(passedOut.valid, true);
assert.equal(passedOut.ended, true);
assert.equal(passedOut.contract, null);

const normal = validateAuction({ dealer: 'N', calls: ['1H', 'P', '2H', 'P', 'P', 'P'] });
assert.equal(normal.valid, true);
assert.equal(normal.ended, true);
assert.equal(normal.contractText, '2H');

const doubled = validateAuction({ dealer: 'N', calls: ['1H', 'X', 'XX', 'P', 'P', 'P'] });
assert.equal(doubled.valid, true);
assert.equal(doubled.contractText, '1HXX');

const invalidDouble = validateAuction({ dealer: 'N', calls: ['1H', 'X', 'X'] });
assert.equal(invalidDouble.valid, false);
assert.equal(invalidDouble.errors.some(e => e.code === 'already-doubled'), true);

const illegalBid = validateAuction({ dealer: 'N', calls: ['1H', '1D'] });
assert.equal(illegalBid.valid, false);
assert.equal(illegalBid.errors.some(e => e.code === 'bid-not-higher'), true);

const wrongTurn = validateAuction({ dealer: 'N', calls: [{ seat: 'E', call: '1H' }] });
assert.equal(wrongTurn.valid, false);
assert.equal(wrongTurn.errors.some(e => e.code === 'wrong-turn'), true);

const afterEnd = validateAuction({ dealer: 'N', calls: ['P', 'P', 'P', 'P', '1C'] });
assert.equal(afterEnd.valid, false);
assert.equal(afterEnd.errors.some(e => e.code === 'after-end'), true);

console.log('auction.js: all tests passed');
