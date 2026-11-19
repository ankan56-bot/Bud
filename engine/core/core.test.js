'use strict';
const assert = require('node:assert/strict');
const { replayAuction } = require('./auction');
const { normalizeHand, shape, isBalanced, highCardPoints, describeDistribution } = require('./hand');
const { validateRuleRecord } = require('./rule-record');
const { chooseRule } = require('./decision');

const passout = replayAuction({ dealer: 'N', calls: ['P','P','P','P'] });
assert.equal(passout.valid, true); assert.equal(passout.ended, true);
const auction = replayAuction({ dealer: 'N', calls: ['1H','X','XX','P','P','P'] });
assert.equal(auction.valid, true); assert.equal(auction.contractText, '1HXX');
assert.equal(replayAuction({dealer:'N',calls:['1H','X','X']}).errors[0].code, 'already-doubled');
assert.equal(replayAuction({dealer:'N',calls:['1H','P','1D']}).errors[0].code, 'bid-not-higher');
assert.equal(replayAuction({dealer:'N',calls:['P','P','P','P','1C']}).errors[0].code, 'after-end');

const h = normalizeHand({S:'AKQJ',H:'AKQ',D:'AK',C:'5432'});
assert.equal(h.valid, true); assert.equal(shape(h.hand), '4-3-2-4');
assert.equal(highCardPoints(h.hand), 26);
assert.equal(isBalanced(h.hand), false);
assert.equal(normalizeHand({S:'AA',H:'KQJ',D:'AK',C:'5432'}).valid, false);
assert.equal(normalizeHand({S:'AKQJ',H:'AKQ',D:'AK',C:'543'}).valid, false); // 12 cards
assert.equal(describeDistribution(h.hand).lengths.S, 4);

const goodRule = { id:'test.rule', source:{document:'Lathund',page:1,box:'Test'}, status:'verified', auctionPattern:[], conditions:[], bid:'1H', meaning:'Test meaning', forcing:'nonforcing' };
assert.equal(validateRuleRecord(goodRule).valid, true);
assert.equal(validateRuleRecord({...goodRule,source:{document:'Lathund',page:1}}).valid, false);
assert.equal(validateRuleRecord({...goodRule,status:'unresolved',bid:'1H'}).valid, false);
assert.equal(chooseRule([{id:'a',status:'verified',match:true,priority:1}]).status, 'matched');
assert.equal(chooseRule([{id:'a',status:'verified',match:true},{id:'b',status:'verified',match:true}]).status, 'conflict');
assert.equal(chooseRule([{id:'a',status:'unresolved',match:true}]).status, 'uncovered');
console.log('core foundation tests passed');
