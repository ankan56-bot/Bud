'use strict';

// Fresh independent 500-deal audit for undisturbed four-seat training.
// North/South are the two partnership seats handled by the bidding engine;
// East/West are the silent opponents and always pass in undisturbed mode.
// Uncovered engine decisions are recorded with all four hands and the full auction.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const R = require('../rattningsmotor.js');
global.Rattning = R;
const F = require('../facitmotor.js');

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
  return { N: deck.slice(0,13), E: deck.slice(13,26), S: deck.slice(26,39), W: deck.slice(39,52) };
}
function hp(hand) {
  return hand.reduce((sum, card) => sum + Math.max(0, Number(card.slice(1)) - 10), 0);
}
function opponentsPass(h) {
  return hp(h.E) <= 9 && hp(h.W) <= 9 && hp(h.E) + hp(h.W) <= 17;
}
function makeDeals() {
  const out = [], seen = new Set();
  for (let seed = 202611180; out.length < 500 && seed < 202611180 + 5000000; seed++) {
    const rng = mulberry(seed), hands = shuffleDeal(rng);
    if (!opponentsPass(hands)) continue;
    if (rng() > Math.exp(0.133 * (hp(hands.N) + hp(hands.S) - 40))) continue;
    const key = SEATS.map(s => hands[s].slice().sort().join(',')).join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: 'ostord-random-500-' + String(out.length + 1).padStart(3,'0'), seed,
      dealer: SEATS[Math.floor(rng() * 4)], hands });
  }
  assert.equal(out.length, 500, 'Could not generate 500 unique deals in the seed range.');
  return out;
}

const deals = makeDeals();
const report = {
  generatedAt: new Date().toISOString(),
  branch: process.env.GITHUB_REF_NAME || 'local',
  engineVersion: R.version,
  mode: 'ostord',
  seats: 'Four seats simulated; North/South use the engine, East/West pass; uncovered decisions stop the facit',
  generation: '500 independent Mulberry32 deals; East/West <=9 HCP each and <=17 combined; facit stops at first uncovered decision',
  deals: deals.length, decisions: 0, covered: 0, uncovered: [],
  exceptions: [], illegalRecommendations: [], invalidAuctions: [],
  unfinishedAuctions: [], cardIntegrityErrors: []
};

for (const deal of deals) {
  const cards = SEATS.flatMap(s => deal.hands[s]);
  if (cards.length !== 52 || new Set(cards).size !== 52 ||
      SEATS.some(s => deal.hands[s].length !== 13) || !opponentsPass(deal.hands)) {
    report.cardIntegrityErrors.push(deal.id);
    continue;
  }
  try {
    // Use the same source-conservative facit path as the trainer. When a
    // decision is uncovered, stop that deal there; never invent a pass and
    // never create artificial downstream auctions.
    const result = F.generateUndisturbedFacit({
      hands: deal.hands, dealer: deal.dealer, trainingSide: 'NS'
    });
    const recommendations = result.steps.filter(x => x.kind === 'system_recommendation');
    report.decisions += recommendations.length + (result.uncovered ? 1 : 0);
    report.covered += recommendations.length;
    if (result.uncovered) {
      report.uncovered.push({
        dealId: deal.id, seed: deal.seed, dealer: deal.dealer,
        seat: result.uncovered.seat, hands: deal.hands,
        auction: result.auction.map(b => b.s + ':' + b.c).join(' '),
        reason: result.uncovered.reason
      });
    }
    if (result.status === 'engine_error' || result.status === 'safety_stop' ||
        result.status === 'invalid_deal' || result.status === 'invalid_options') {
      report.exceptions.push({dealId:deal.id,status:result.status,message:result.message});
    }
    const validation = R.validateAuction({
      hands: deal.hands, dealer: deal.dealer,
      bids: result.auction.map(b => ({s:b.s,c:b.c}))
    });
    if (!validation.valid) report.invalidAuctions.push({dealId:deal.id,errors:validation.errors});
    if (result.complete && !validation.ended)
      report.unfinishedAuctions.push({dealId:deal.id,status:result.status,calls:result.auction.length});
    for (const step of recommendations) {
      if (!isValidCall(step.call))
        report.illegalRecommendations.push({dealId:deal.id,seat:step.seat,call:step.call});
    }
  } catch (e) {
    report.exceptions.push({dealId:deal.id,message:String(e && e.stack || e)});
  }
}

function isValidCall(call) {
  return call === 'P' || /^[1-7][CDHSN]$/.test(call);
}
const groups = new Map();
for (const item of report.uncovered) {
  const key = item.reason.split(/[.!?]/)[0].slice(0,180);
  groups.set(key,(groups.get(key)||0)+1);
}
report.uncoveredCategories = [...groups.entries()].sort((a,b)=>b[1]-a[1]).map(([reason,count])=>({count,reason}));
fs.mkdirSync('testdata',{recursive:true});
fs.writeFileSync('testdata/ostord_random_500_latest.json',JSON.stringify(report,null,2)+'\\n');
console.log(JSON.stringify({
  deals:report.deals, decisions:report.decisions, covered:report.covered,
  uncovered:report.uncovered.length, coveragePercent:report.coveragePercent,
  uncoveredCategories:report.uncoveredCategories,
  examples:report.uncovered.slice(0,30),
  exceptions:report.exceptions.length, illegalRecommendations:report.illegalRecommendations.length,
  invalidAuctions:report.invalidAuctions.length, unfinishedAuctions:report.unfinishedAuctions.length,
  cardIntegrityErrors:report.cardIntegrityErrors.length
},null,2));
assert.equal(report.cardIntegrityErrors.length,0,'All deals must contain 52 unique cards.');
assert.equal(report.exceptions.length,0,'No simulation exceptions allowed.');
assert.equal(report.illegalRecommendations.length,0,'No illegal recommendations allowed.');
assert.equal(report.invalidAuctions.length,0,'All auctions must be legal.');
assert.equal(report.unfinishedAuctions.length,0,'All auctions must finish.');
console.log('Fresh 500-deal undisturbed audit passed technical and auction-legality checks.');
