'use strict';

// Fresh independent 500-deal audit for undisturbed four-seat training.
// North/South are the two partnership seats handled by the bidding engine;
// East/West are the silent opponents and always pass in undisturbed mode.
// Uncovered engine decisions are recorded with all four hands and the full auction.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const R = require('../rattningsmotor.js');

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
  seats: 'Four seats simulated; North/South use the engine, East/West pass',
  generation: '500 independent Mulberry32 deals; East/West <=9 HCP each and <=17 combined',
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
  const st = { hands: deal.hands, dealer: deal.dealer, bids: [] };
  let seat = deal.dealer, ended = false, guard = 0;
  while (!ended && guard++ < 32) {
    const index = st.bids.length;
    let call = 'P';
    if (seat === 'N' || seat === 'S') {
      report.decisions++;
      st.bids.push({s:seat,c:'P'});
      try {
        const node = R.nodeFor(st,index);
        if (node && node.exp != null) {
          call = node.exp;
          report.covered++;
        } else {
          report.uncovered.push({
            dealId:deal.id, seed:deal.seed, dealer:deal.dealer, seat,
            hands:deal.hands,
            auction:st.bids.map(b=>b.s+':'+b.c).join(' '),
            reason:node && node.why ? node.why : 'Ingen regelmatchning.'
          });
        }
      } catch (e) {
        report.exceptions.push({dealId:deal.id,seat,message:String(e && e.stack || e)});
      }
      st.bids[index] = {s:seat,c:call};
    } else {
      st.bids.push({s:seat,c:'P'});
    }
    const v = R.validateAuction(st);
    for (const error of v.errors) if (error.index === index) {
      report.illegalRecommendations.push({dealId:deal.id,seat,call,message:error.message});
    }
    ended = v.ended;
    seat = NEXT[seat];
  }
  const final = R.validateAuction(st);
  if (!final.valid) report.invalidAuctions.push({dealId:deal.id,errors:final.errors});
  if (!final.ended) report.unfinishedAuctions.push({dealId:deal.id,calls:st.bids.length});
}
report.coveragePercent = report.decisions ? Math.round(report.covered/report.decisions*1000)/10 : 0;
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
