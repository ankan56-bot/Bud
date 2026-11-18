'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const Rattning = require('../rattningsmotor.js');
const corpus = require('../testdata/temagivare_140.json');

const NEXT = { N: 'E', E: 'S', S: 'W', W: 'N' };
const deals = corpus.deals.filter(deal => deal.mode === 'ostord');
const report = {
  generatedAt: new Date().toISOString(),
  branch: process.env.GITHUB_REF_NAME || 'local',
  commit: (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch (_) { return null; } })(),
  corpusPath: 'testdata/temagivare_140.json',
  engineVersion: Rattning.version,
  deals: deals.length,
  turns: 0,
  covered: 0,
  uncovered: [],
  exceptions: [],
  illegalRecommendations: [],
  invalidAuctions: [],
  unfinishedAuctions: [],
  sourceGapStops: []
};

for (const deal of deals) {
  const st = { hands: deal.hands, dealer: deal.dealer, bids: [] };
  let seat = deal.dealer;
  let ended = false;
  let sourceGapStopped = false;
  let guard = 0;

  while (!ended && guard++ < 32) {
    const index = st.bids.length;
    let call = 'P';

    if (seat === 'N' || seat === 'S') {
      report.turns++;
      st.bids.push({ s: seat, c: 'P' });
      try {
        const node = Rattning.nodeFor(st, index);
        if (node && node.exp != null) {
          call = node.exp;
          report.covered++;
        } else {
          report.uncovered.push({
            dealId: deal.id,
            seat,
            auction: st.bids.slice(0, -1).map(b => b.s + ':' + b.c).join(' '),
            sourceGap: !!(node && node.sourceGap),
            reason: node && node.why ? node.why : 'Ingen regelmatchning.'
          });
          st.bids.pop();
          sourceGapStopped = true;
          break;
        }
      } catch (error) {
        report.exceptions.push({ dealId: deal.id, seat, message: String(error && error.message || error) });
        st.bids.pop(); sourceGapStopped = true; break;
      }
      st.bids[index] = { s: seat, c: call };
    } else {
      st.bids.push({ s: seat, c: 'P' });
    }

    const validation = Rattning.validateAuction(st);
    for (const error of validation.errors) {
      if (error.index === index) report.illegalRecommendations.push({
        dealId: deal.id, seat, call, message: error.message
      });
    }
    ended = validation.ended;
    seat = NEXT[seat];
  }

  const finalValidation = Rattning.validateAuction(st);
  if (!finalValidation.valid) report.invalidAuctions.push({
    dealId: deal.id, errors: finalValidation.errors
  });
  if (sourceGapStopped) report.sourceGapStops.push({ dealId: deal.id, calls: st.bids.length });
  else if (!finalValidation.ended) report.unfinishedAuctions.push({
    dealId: deal.id, calls: st.bids.length
  });
}

report.coveragePercent = report.turns ? Math.round(report.covered / report.turns * 1000) / 10 : 0;
fs.mkdirSync('testdata', { recursive: true });
fs.writeFileSync('testdata/ostord_validation_latest.json', JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  deals: report.deals,
  turns: report.turns,
  covered: report.covered,
  uncovered: report.uncovered.length,
  uncoveredDetails: report.uncovered,
  coveragePercent: report.coveragePercent,
  exceptions: report.exceptions.length,
  illegalRecommendations: report.illegalRecommendations.length,
  invalidAuctions: report.invalidAuctions.length,
  unfinishedAuctions: report.unfinishedAuctions.length,
  sourceGapStops: report.sourceGapStops.length
}, null, 2));

assert.equal(report.deals, 36, 'The fixed corpus should contain 36 undisturbed deals.');
assert.equal(report.turns, 150, 'The fixed corpus stops at source gaps and may finish earlier when game-level safety rescue finds the mandatory game.');
assert.equal(report.covered, 138, 'The source-verified rules cover 138 positions before source-gap stops.');
const acceptedSourceGaps=[
  'invit-08','invit-09','invit-10','nt-08','nt-09','nt-10','rkc-08',
  'sang-09','slamnt-08','slamnt-10','alla-10','svag-08'
].sort();
assert.deepEqual(report.uncovered.map(x=>x.dealId).sort(),acceptedSourceGaps,
  'Only documented 1NT invitation and continuation source gaps may remain uncovered.');
assert.ok(report.uncovered.every(x=>x.sourceGap===true&&x.reason&&x.reason.length>20),
  'Every uncovered fixed-corpus case must be an explicit, explained source gap.');
assert.equal(report.sourceGapStops.length,report.uncovered.length,'Each incomplete auction must stop at its first source gap.');
assert.equal(report.exceptions.length, 0, 'No runtime exceptions are allowed.');
assert.equal(report.illegalRecommendations.length, 0, 'No illegal recommendations are allowed.');
assert.equal(report.invalidAuctions.length, 0, 'All simulated auctions must be legal.');
assert.equal(report.unfinishedAuctions.length, 0, 'All simulated auctions must end.');
assert.equal(report.coveragePercent, 92, 'Undisturbed coverage reflects documented source gaps and game-level safety rescues.');
