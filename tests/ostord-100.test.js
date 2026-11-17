'use strict';

// Deterministic 100-deal undisturbed stress test.
// Uses the same Mulberry32 shuffle and opponent-pass condition as Budtraning.html.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Rattning = require('../rattningsmotor.js');

const SEATS = ['N', 'E', 'S', 'W'];
const NEXT = { N: 'E', E: 'S', S: 'W', W: 'N' };
function mulberry(seed) {
  return function () {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function shuffleDeal(rng) {
  const deck = [];
  for (const suit of ['S', 'H', 'D', 'C']) {
    for (let rank = 2; rank <= 14; rank++) deck.push(suit + rank);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return { N: deck.slice(0, 13), E: deck.slice(13, 26), S: deck.slice(26, 39), W: deck.slice(39, 52) };
}
function hp(hand) {
  return hand.reduce((sum, card) => sum + Math.max(0, Number(card.slice(1)) - 10), 0);
}
function opponentMustPass(hands) {
  const east = hp(hands.E), west = hp(hands.W);
  return east <= 9 && west <= 9 && east + west <= 17;
}
function generateDeals() {
  const deals = [], seen = new Set();
  for (let seed = 202611150; deals.length < 100 && seed < 202611150 + 2000000; seed++) {
    const rng = mulberry(seed);
    const hands = shuffleDeal(rng);
    if (!opponentMustPass(hands)) continue;
    // Match the broad "alla slags givar" weighting in the in-app generator.
    if (rng() > Math.exp(0.133 * (hp(hands.N) + hp(hands.S) - 40))) continue;
    const key = SEATS.map(seat => hands[seat].slice().sort().join(',')).join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    deals.push({ id: 'ostord-100-' + String(deals.length + 1).padStart(3, '0'), seed, dealer: SEATS[Math.floor(rng() * 4)], hands });
  }
  assert.equal(deals.length, 100, 'Could not generate 100 unique undisturbed deals within the seed range.');
  return deals;
}

const deals = generateDeals();
const report = {
  generatedAt: new Date().toISOString(),
  branch: process.env.GITHUB_REF_NAME || 'local',
  engineVersion: Rattning.version,
  generation: 'Mulberry32 deterministic shuffle; E/W <=9 HCP each and combined <=17; broad NS strength weighting',
  deals: deals.length,
  turns: 0,
  covered: 0,
  uncovered: [],
  exceptions: [],
  illegalRecommendations: [],
  invalidAuctions: [],
  unfinishedAuctions: [],
  cardIntegrityErrors: []
};

for (const deal of deals) {
  const allCards = SEATS.flatMap(seat => deal.hands[seat]);
  if (allCards.length !== 52 || new Set(allCards).size !== 52 ||
      SEATS.some(seat => deal.hands[seat].length !== 13) || !opponentMustPass(deal.hands)) {
    report.cardIntegrityErrors.push(deal.id);
    continue;
  }

  const st = { hands: deal.hands, dealer: deal.dealer, bids: [] };
  let seat = deal.dealer, ended = false, guard = 0;
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
            dealId: deal.id, seed: deal.seed, seat,
            auction: st.bids.map(b => b.s + ':' + b.c).join(' '),
            reason: node && node.why ? node.why : 'Ingen regelmatchning.'
          });
        }
      } catch (error) {
        report.exceptions.push({ dealId: deal.id, seat, message: String(error && error.message || error) });
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
  if (!finalValidation.valid) report.invalidAuctions.push({ dealId: deal.id, errors: finalValidation.errors });
  if (!finalValidation.ended) report.unfinishedAuctions.push({ dealId: deal.id, calls: st.bids.length });
}

report.coveragePercent = report.turns ? Math.round(report.covered / report.turns * 1000) / 10 : 0;
fs.mkdirSync('testdata', { recursive: true });
fs.writeFileSync('testdata/ostord_100_validation_latest.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  deals: report.deals, turns: report.turns, covered: report.covered,
  uncovered: report.uncovered.length, coveragePercent: report.coveragePercent,
  exceptions: report.exceptions.length, illegalRecommendations: report.illegalRecommendations.length,
  invalidAuctions: report.invalidAuctions.length, unfinishedAuctions: report.unfinishedAuctions.length,
  cardIntegrityErrors: report.cardIntegrityErrors.length,
  uncoveredDetails: report.uncovered
}, null, 2));

assert.equal(report.cardIntegrityErrors.length, 0, 'All generated deals must contain 52 unique cards and four 13-card hands.');
assert.equal(report.exceptions.length, 0, 'No runtime exceptions are allowed.');
assert.equal(report.illegalRecommendations.length, 0, 'No illegal recommendations are allowed.');
assert.equal(report.invalidAuctions.length, 0, 'All simulated auctions must be legal.');
assert.equal(report.unfinishedAuctions.length, 0, 'All simulated auctions must end.');
// Remaining uncovered cases are explicitly source gaps, not unexplained
// engine failures: qualitative/numeric invite boundaries, the weak-relay
// strength descriptor, and transfer hands outside the tabulated shapes.
const acceptedUncoveredIds=[
  'ostord-100-001','ostord-100-002','ostord-100-007','ostord-100-030','ostord-100-031','ostord-100-034','ostord-100-036','ostord-100-037','ostord-100-038','ostord-100-039',
  'ostord-100-040','ostord-100-044','ostord-100-048','ostord-100-052','ostord-100-053','ostord-100-058','ostord-100-066','ostord-100-074','ostord-100-080','ostord-100-088','ostord-100-092','ostord-100-094'
].sort();
assert.deepEqual(
  report.uncovered.map(x=>x.dealId).sort(),
  acceptedUncoveredIds,
  'Only the explicitly documented source-gap cases may remain uncovered.'
);
for(const item of report.uncovered){
  assert.match(item.reason,/anges inte|inte angiven|numerisk(?:a)? styrkegräns|ingen numerisk HP-gräns|lämnas ej täckt|motsvarar inte någon av de angivna utgångsprofilerna|beskrivs inte i dokumentet|finns inte specificerad|ingen prioritet/i,
    'Every uncovered case must state the precise source gap: '+item.dealId);
}
// The 22 remaining positions are explicit source gaps (including five newly exposed
// 2C/Stayman/transfer continuations); do not invent bids to raise this percentage.
assert.ok(report.coveragePercent>=95.5,
  'The 100-deal test must retain at least 95.5% coverage while reporting documented source gaps honestly.');
