'use strict';

// Regression tests for the explicit Stayman continuations in Nordisk standard,
// 2012-08-22, page 4.
const assert = require('node:assert/strict');
const R = require('../rattningsmotor.js');

const deck=[];
for(const suit of ['S','H','D','C']) for(let rank=2;rank<=14;rank++) deck.push(suit+rank);

function deal(north,south){
  const used=new Set([...north,...south]);
  assert.equal(used.size,26,'North and South hands must not overlap');
  const rest=deck.filter(card=>!used.has(card));
  return {N:north.slice(),E:rest.slice(0,13),S:south.slice(),W:rest.slice(13,26)};
}
const south=['S5','S6','S7','S8','H5','H6','H7','H8','D5','D6','D7','C5','C6'];
const min44=['S14','S13','S2','S3','H14','H11','H2','H3','D13','D2','D3','C2','C3']; // 15 hp, 4-4-3-2
const max44=['S14','S13','S12','S2','H14','H11','H2','H3','D13','D2','D3','C2','C3']; // 17 hp, 4-4-3-2

function judge(north, sequence){
  const hands=deal(north,south);
  const bids=sequence.concat([{s:'N',c:'P'}]);
  return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}
function judgeWithFreshHands(north,sequence){
  const rest=deck.filter(card=>!north.includes(card));
  const hands={N:north.slice(),E:rest.slice(0,13),S:rest.slice(13,26),W:rest.slice(26,39)};
  const bids=sequence.concat([{s:'N',c:'P'}]);
  return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}

// Opener's first Stayman reply: 2♦ denies a four-card major;
// 2♥ shows four or five hearts (and takes priority with 4-4);
// 2♠ shows four or five spades when hearts are not shown.
const afterStaymanQuestion=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2C'},{s:'W',c:'P'}
];
const noFourCardMajor=['D14','D13','D7','D2','H14','H8','H3','S13','S8','S3','C11','C8','C3'];
const fourHeartsOnly=['H14','H13','H7','H2','S14','S8','S3','D13','D8','D3','C11','C8','C3'];
const fourSpadesOnly=['S14','S13','S7','S2','H14','H8','H3','D13','D8','D3','C11','C8','C3'];
for (const [hand,expected,label] of [
  [noFourCardMajor,'2D','no four-card major'],
  [fourHeartsOnly,'2H','four hearts, no four spades'],
  [fourSpadesOnly,'2S','four spades, no four hearts']
]) {
  assert.equal(R.H(hand).hp,15,label+': fixture must be 15 HCP');
  assert.equal(judgeWithFreshHands(hand,afterStaymanQuestion).exp,expected,
    'Stayman opener reply for '+label);
}

const afterStayman2NT=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2C'},{s:'W',c:'P'},
  {s:'N',c:'2H'},{s:'E',c:'P'},
  {s:'S',c:'2N'},{s:'W',c:'P'}
];
assert.equal(judge(min44,afterStayman2NT).exp,'3S',
  '4-4 major minimum opener must bid 3S after Stayman 2NT');
assert.equal(judge(max44,afterStayman2NT).exp,'4S',
  '4-4 major maximum opener must bid 4S after Stayman 2NT');

const afterStayman3NT=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2C'},{s:'W',c:'P'},
  {s:'N',c:'2H'},{s:'E',c:'P'},
  {s:'S',c:'3N'},{s:'W',c:'P'}
];
assert.equal(judge(min44,afterStayman3NT).exp,'4S',
  '4-4 major opener may choose 4S after Stayman 3NT');

// Nordisk standard s. 4 says responder normally has its own four-card
// major (or slam interest); it does not state an 8 hp minimum for that route.
{
  const south=['H2','H3','H4','H5','S2','S3','S4','D2','D3','D4','C2','C3','C4'];
  const north=deck.filter(card=>!south.includes(card)).slice(0,13);
  const used=new Set([...north,...south]);
  const rest=deck.filter(card=>!used.has(card));
  const hands={N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
  const bids=[{s:'N',c:'1N'},{s:'E',c:'P'},{s:'S',c:'P'}];
  assert.equal(R.nodeFor({hands,dealer:'N',bids},2).exp,'2C',
    'a four-card major is sufficient for Stayman; do not invent an 8 hp floor');
}

// Natural new suits after each Stayman answer are game-forcing:
// 5+ major or 4+ minor. The recommendation must not depend on the
// opener's hidden cards.
function responderAfterStayman(south,openerReply){
  const north=deck.filter(card=>!south.includes(card)).slice(0,13);
  const used=new Set([...north,...south]);
  assert.equal(used.size,26);
  const rest=deck.filter(card=>!used.has(card));
  const hands={N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
  const bids=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2C'},{s:'W',c:'P'},
    {s:'N',c:openerReply},{s:'E',c:'P'},
    {s:'S',c:'P'}
  ];
  return R.nodeFor({hands,dealer:'N',bids},bids.length-1);
}
assert.equal(responderAfterStayman(
  ['S14','S13','S12','S11','S10','H2','H3','H4','D2','D3','D4','C2','C3'],'2H').exp,'2S',
  '5+ spades after Stayman 2H is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['C14','C13','C12','C11','S2','S3','S4','H2','H3','H4','D2','D3','D4'],'2H').exp,'3C',
  '4+ clubs after Stayman 2H is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['H14','H13','H12','H11','H10','S2','S3','S4','D2','D3','D4','C2','C3'],'2D').exp,'2H',
  '5+ hearts after Stayman 2D is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['D14','D13','D12','D11','S2','S3','S4','H2','H3','H4','C2','C3','C4'],'2D').exp,'3D',
  '4+ diamonds after Stayman 2D is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['H14','H13','H12','H11','H10','S2','S3','S4','D2','D3','D4','C2','C3'],'2S').exp,'3H',
  '5+ hearts after Stayman 2S is a natural game-forcing new suit');
assert.equal(responderAfterStayman(
  ['S14','S13','S12','S11','H2','H3','H4','D2','D3','D4','C2','C3','C4'],'2H').exp,null,
  'exactly four spades is known, but invite versus game needs a strength boundary');
// The source also names 3M in opener's shown major as an invit.
// The bidding meaning is recognized, but the numeric choice/acceptance
// threshold remains uncovered rather than borrowing a generic point band.
const heartsInviteHand=['H14','H13','H12','H11','H10','S2','S3','D2','D3','D4','C2','C3','C4'];
const heartsInvite=responderAfterStayman(heartsInviteHand,'2H');
assert.equal(heartsInvite.exp,null);
assert.match(heartsInvite.why,/3H är invit i öppnarens visade högfärg/i);

const spadesInviteHand=['S14','S13','S12','S11','S10','H2','H3','D2','D3','D4','C2','C3','C4'];
const spadesInvite=responderAfterStayman(spadesInviteHand,'2S');
assert.equal(spadesInvite.exp,null);
assert.match(spadesInvite.why,/3S är invit i öppnarens visade högfärg/i);
const balancedAfterSpades=['S14','S13','S2','S3','H12','H11','H2','D13','D2','D3','C2','C3','C4'];
assert.equal(R.H(balancedAfterSpades).bal,true);
const naturalStaymanNTInvite=responderAfterStayman(balancedAfterSpades,'2S');
assert.equal(naturalStaymanNTInvite.exp,null);
assert.match(naturalStaymanNTInvite.why,/2NT är naturlig invit efter Stayman 2♠/i);
const gameFourSpades=['S14','S13','S12','S11','H11','H2','H3','D2','D3','D4','C2','C3','C4'];
assert.equal(R.H(gameFourSpades).hp,11);
const gameFourSpadesAuction=[
  {s:'N',c:'1N'},{s:'E',c:'P'},
  {s:'S',c:'2C'},{s:'W',c:'P'},
  {s:'N',c:'2H'},{s:'E',c:'P'}
];
assert.equal(R.decideLive({seat:'S',dealer:'N',auction:gameFourSpadesAuction,ownHand:gameFourSpades}).exp,null,
  'the numeric threshold for the special four-spade Stayman invitation is not stated, even with 11 hp');
// Do not apply the separate 26-point major-game threshold to Stayman
// unless Nordisk standard defines the accept boundary for this sequence.
{
  const north=['H2','H3','H4','S14','S13','S12','D14','D13','D2','C11','C2','C3','C4'];
  const south=['H13','H12','H11','H5','H6','S2','S3','S4','D5','D6','D7','C13','C6'];
  assert.equal(R.H(north).hp,17);
  assert.equal(R.H(south).hp,9);
  const used=new Set([...north,...south]);
  assert.equal(used.size,26);
  const rest=deck.filter(c=>!used.has(c));
  const hands={N:north,E:rest.slice(0,13),S:south,W:rest.slice(13,26)};
  const bids=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2C'},{s:'W',c:'P'},
    {s:'N',c:'2H'},{s:'E',c:'P'},
    {s:'S',c:'P'}
  ];
  const result=R.nodeFor({hands,dealer:'N',bids},bids.length-1);
  assert.equal(result.exp,null,
    '8-card heart fit and 26 combined HCP do not import the separate major-game threshold into Stayman');
  assert.match(result.why,/acceptgräns|lämnas ej täckt/i);
}
// Stayman 2♦–2NT is a natural balanced invitation. The agreed 25-HCP
// threshold decides acceptance after the full deal is known.
{
  const north=['C14','C13','C2','C3','S14','S2','S3','H13','H2','H3','D12','D2','D3'];
  const south=['S13','S4','S5','H14','H4','H5','H6','D11','D5','D6','C11','C5','C6'];
  assert.equal(R.H(north).hp,16);
  assert.equal(R.H(south).hp,9);
  assert.equal(R.H(north).bal,true);
  assert.equal(R.H(south).bal,true);
  const hands=deal(north,south);
  const bids=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2C'},{s:'W',c:'P'},
    {s:'N',c:'2D'},{s:'E',c:'P'},
    {s:'S',c:'2N'},{s:'W',c:'P'},
    {s:'N',c:'P'}
  ];
  const result=R.nodeFor({hands,dealer:'N',bids},bids.length-1);
  assert.equal(result.exp,'3N','16+9=25 HCP accepts the 2NT invitation');
  assert.equal(result.ruleStatus,'user_confirmed');
}

// Stayman 2♦ without a four-card major: the same agreed 25-HCP threshold
// applies to the direct 3NT game choice after the 2♦ denial.
{
  const north=['C14','C13','C2','C3','S14','S12','S2','H13','H2','H3','D2','D3','D4'];
  const south=['S13','S3','S4','H14','H4','H5','H6','D12','D5','D6','C4','C5','C6'];
  assert.equal(R.H(north).hp,16);
  assert.equal(R.H(south).hp,9);
  const hands=deal(north,south);
  const bids=[
    {s:'N',c:'1N'},{s:'E',c:'P'},
    {s:'S',c:'2C'},{s:'W',c:'P'},
    {s:'N',c:'2D'},{s:'E',c:'P'},
    {s:'S',c:'P'}
  ];
  const result=R.nodeFor({hands,dealer:'N',bids},bids.length-1);
  assert.equal(result.exp,'3N','16+9=25 HCP reaches 3NT after Stayman 2♦');
  assert.equal(result.ruleStatus,'user_confirmed');
}

// 2NT–3♣–3♠: a balanced responder with 25 combined HCP and no
// eight-card spade fit reaches 3NT under the same agreed 25-HCP rule.
{
  const north=['S14','S13','S12','S2','H14','H13','H2','D14','D2','D3','C2','C3','C4'];
  const south=['H12','H4','H5','H6','S11','S5','S6','D11','D5','D6','C11','C5','C6'];
  assert.equal(R.H(north).hp,20);
  assert.equal(R.H(south).hp,5);
  assert.equal(R.H(north).bal,true);
  assert.equal(R.H(south).bal,true);
  const hands=deal(north,south);
  const bids=[
    {s:'N',c:'2N'},{s:'E',c:'P'},
    {s:'S',c:'3C'},{s:'W',c:'P'},
    {s:'N',c:'3S'},{s:'E',c:'P'},
    {s:'S',c:'P'}
  ];
  const result=R.nodeFor({hands,dealer:'N',bids},bids.length-1);
  assert.equal(result.exp,'3N','20+5=25 HCP with no 8-card spade fit reaches 3NT');
  assert.equal(result.ruleStatus,'user_confirmed');
}


// Same 2NT–3♣–3♠ auction, but with an eight-card spade fit and
// 26 combined game points: choose 4♠ rather than applying the NT threshold.
{
  const north=['S14','S13','S12','S2','H14','H13','H2','D14','D2','D3','C2','C3','C4'];
  const south=['S11','S10','S9','S8','H12','H4','H5','D13','D5','D6','C5','C6','C7'];
  assert.equal(R.H(north).hp,20);
  assert.equal(R.H(south).hp,6);
  assert.equal(R.H(north).L.S+R.H(south).L.S,8);
  const hands=deal(north,south);
  const bids=[
    {s:'N',c:'2N'},{s:'E',c:'P'},
    {s:'S',c:'3C'},{s:'W',c:'P'},
    {s:'N',c:'3S'},{s:'E',c:'P'},
    {s:'S',c:'P'}
  ];
  const result=R.nodeFor({hands,dealer:'N',bids},bids.length-1);
  assert.equal(result.exp,'4S','8-card spade fit and 26 combined game points selects 4S');
}

console.log('1NT Stayman continuation tests: passed.');
