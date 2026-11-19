'use strict';
const assert = require('node:assert/strict');
const { replayAuction } = require('./auction');
const { contractRank, normalizeCall, callType } = require('./calls');

assert.equal(contractRank('1C'), 0);
assert.ok(contractRank('1D') > contractRank('1C'));
assert.ok(contractRank('1H') > contractRank('1D'));
assert.ok(contractRank('1S') > contractRank('1H'));
assert.ok(contractRank('1N') > contractRank('1S'));
assert.equal(normalizeCall('PASS'), 'P');
assert.equal(callType('XX'), 'redouble');

const passout = replayAuction({ dealer:'N', calls:['P','P','P','P'] });
assert.equal(passout.valid, true); assert.equal(passout.ended, true); assert.equal(passout.contract, null);
const normal = replayAuction({ dealer:'N', calls:['1H','P','2H','P','P','P'] });
assert.equal(normal.valid, true); assert.equal(normal.ended, true); assert.equal(normal.contractText, '2H');
const doubled = replayAuction({ dealer:'N', calls:['1H','X','XX','P','P','P'] });
assert.equal(doubled.valid, true); assert.equal(doubled.contractText, '1HXX');
assert.equal(replayAuction({dealer:'N',calls:['1H','X','X']}).errors[0].code, 'already-doubled');
assert.equal(replayAuction({dealer:'N',calls:['1H','1D']}).errors[0].code, 'bid-not-higher');
const wrongTurn = replayAuction({dealer:'N',calls:[{seat:'E',call:'1H'}]});
assert.equal(wrongTurn.errors[0].code, 'wrong-turn'); assert.equal(wrongTurn.contract, null);
assert.equal(replayAuction({dealer:'N',calls:['P','P','P','P','1C']}).errors[0].code, 'after-end');
console.log('auction core tests passed');
