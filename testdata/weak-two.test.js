"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rattning = require("../rattningsmotor.js");
const analysisLibrary = require("../analysbibliotek.json");

const RANKS = { A:14, K:13, Q:12, J:11, T:10 };
function cards(suit, ranks) {
  return [...ranks].map(rank => suit + (RANKS[rank] || Number(rank)));
}
function completeDeal(north, south) {
  const used = [...north, ...south];
  assert.equal(north.length, 13);
  assert.equal(south.length, 13);
  assert.equal(new Set(used).size, 26);
  const deck = ["S","H","D","C"].flatMap(suit =>
    Array.from({length:13}, (_,i) => suit + (14-i))
  );
  const rest = deck.filter(card => !used.includes(card));
  return { N:north, E:rest.slice(0,13), S:south, W:rest.slice(13,26) };
}
function fillerHand(usedHand) {
  const deck = ["S","H","D","C"].flatMap(suit =>
    Array.from({length:13}, (_,i) => suit + (14-i))
  );
  return deck.filter(card => !usedHand.includes(card)).slice(0,13);
}
function node(hands, bids, index) {
  return Rattning.nodeFor({ hands, dealer:"N", bids }, index);
}
function weakTwoHand(suit, ranks="AK9876") {
  const others = ["S","H","D","C"].filter(s => s !== suit);
  let remaining = 13 - ranks.length;
  const counts = [Math.min(3,remaining)];
  remaining -= counts[0];
  counts.push(Math.min(3,remaining));
  remaining -= counts[1];
  counts.push(remaining);
  const low = "23456789TJQKA";
  return [
    ...cards(suit,ranks),
    ...cards(others[0],low.slice(0,counts[0])),
    ...cards(others[1],low.slice(0,counts[1])),
    ...cards(others[2],low.slice(0,counts[2]))
  ];
}
function poorQualityWeakTwoHand(suit) {
  const others = ["S","H","D","C"].filter(s => s !== suit);
  return [
    ...cards(suit,"234567"),
    ...cards(others[0],"AK"),
    ...cards(others[1],"234"),
    ...cards(others[2],"23")
  ];
}

function preemptHand(suit, ranks) {
  const others = ["S","H","D","C"].filter(s => s !== suit);
  const rankValue = { A:4, K:3, Q:2, J:1, T:0 };
  const suitHp = [...ranks].reduce((sum,r) => sum + (rankValue[r] || 0),0);
  let sideRanks = [];
  let sideHp = 0;
  for (const rank of ["Q","J","K"]) {
    if (suitHp + sideHp >= 8) break;
    sideRanks.push(rank);
    sideHp += rankValue[rank];
  }
  const remaining = 13 - ranks.length - sideRanks.length;
  const low = "23456789T";
  const firstCount = Math.min(3,remaining);
  return [
    ...cards(suit,ranks),
    ...cards(others[0],sideRanks),
    ...cards(others[1],low.slice(0,firstCount)),
    ...cards(others[2],low.slice(0,remaining-firstCount))
  ];
}

function elevenPointSixCardHand(suit) {
  const others = ["S","H","D","C"].filter(s => s !== suit);
  return [
    ...cards(suit,"234567"),
    ...cards(others[0],"AK"),
    ...cards(others[1],"QJ"),
    ...cards(others[2],"J23")
  ];
}

test("2♦, 2♥ and 2♠ openings require 6-10 HCP, exactly six cards and defined suit quality", () => {
  for (const suit of ["D","H","S"]) {
    const opener = weakTwoHand(suit);
    const hands = completeDeal(opener, fillerHand(opener));
    const expected = "2" + suit;
    const result = node(hands,[{s:"N",c:expected}],0);
    assert.equal(result.exp,expected,suit);
    assert.equal(result.conv,"öppning");
  }
});

test("6-10 hp with exactly six cards but no qualifying suit honors does not open a weak two", () => {
  for (const suit of ["D","H","S"]) {
    const opener = poorQualityWeakTwoHand(suit);
    const result = node(completeDeal(opener,fillerHand(opener)),[
      {s:"N",c:"2"+suit}
    ],0);
    assert.equal(result.exp,"P",suit);
  }
});

test("one honor plus two of 10-9-8 qualifies as a good weak-two suit", () => {
  for (const suit of ["D","H","S"]) {
    const others = ["S","H","D","C"].filter(s => s !== suit);
    const opener = [
      ...cards(suit,"AT9876"),
      ...cards(others[0],"KQ"),
      ...cards(others[1],"J2"),
      ...cards(others[2],"345")
    ];
    const result = node(completeDeal(opener,fillerHand(opener)),[
      {s:"N",c:"2"+suit}
    ],0);
    assert.equal(result.exp,"2"+suit,suit);
  }
});

test("a qualifying six-card club suit remains uncovered because 2C is strong", () => {
  const opener = weakTwoHand("C");
  const result = node(completeDeal(opener,fillerHand(opener)),[{s:"N",c:"2C"}],0);
  assert.equal(result.exp,null);
  assert.match(result.why,/alternativ spärrnivå.*inte fastställd/i);
});

test("a six-card club suit with no quality criterion does not open", () => {
  const opener = poorQualityWeakTwoHand("C");
  const result = node(completeDeal(opener,fillerHand(opener)),[{s:"N",c:"P"}],0);
  assert.equal(result.exp,"P");
});

test("11 hp with a six-card ♦/♥/♠ suit opens at the one-level, even without suit honors", () => {
  for (const suit of ["D","H","S"]) {
    const opener = elevenPointSixCardHand(suit);
    const hands = completeDeal(opener,fillerHand(opener));
    const result = node(hands,[{s:"N",c:"1"+suit}],0);
    assert.equal(result.exp,"1"+suit,suit);
  }
});

test("a five-card suit with 6-10 hp is not a weak two opening", () => {
  const opener = weakTwoHand("H","AKQ98");
  const hands = completeDeal(opener,fillerHand(opener));
  const result = node(hands,[{s:"N",c:"P"}],0);
  assert.equal(result.exp,"P");
});

test("a seven-card suit is outside the weak-two family and uses the 3-level preemptive opening", () => {
  const opener = weakTwoHand("H","AK98765");
  const hands = completeDeal(opener,fillerHand(opener));
  const result = node(hands,[{s:"N",c:"3H"}],0);
  assert.equal(result.exp,"3H");
});

test("3 in the opening suit is an invit with approximately 14-16 stp", () => {
  const opener=weakTwoHand("H");
  const responder=[
    ...cards("H","Q2"), ...cards("S","AKQ"),
    ...cards("D","KJ"), ...cards("C","345678")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"3H"}
  ],2);
  assert.equal(result.exp,"3H");
  assert.match(result.why,/invit.*14–16 stp/);
  assert.match(result.means("3H"),/14–16 stp/);
});

test("2NT is Stenberg 2NT and requires at least 13 stp", () => {
  const opener=weakTwoHand("H");
  const responder=[
    ...cards("H","Q2"), ...cards("S","AKQ"),
    ...cards("D","KJ"), ...cards("C","34567")
  ];
  const accepted=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"}
  ],2);
  assert.equal(accepted.exp,"2N");
  assert.equal(accepted.conv,"Stenberg");
  assert.match(accepted.why,/Stenberg.*13 stp/);

  const weakResponder=[
    ...cards("H","Q2"), ...cards("S","A"),
    ...cards("D","234567"), ...cards("C","3456")
  ];
  const rejected=node(completeDeal(opener,weakResponder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"}
  ],2);
  assert.equal(rejected.exp,null);
  assert.match(rejected.why,/minst 13 stp/);
});

test("a new six-card suit with at least 15 HCP is forcing", () => {
  const opener=weakTwoHand("H");
  const responder=[
    ...cards("H","Q2"), ...cards("S","AKQJ98"),
    ...cards("D","AK"), ...cards("C","345")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2S"}
  ],2);
  assert.equal(result.exp,"2S");
  assert.match(result.why,/minst 15 hp.*sexkortsfärg.*rondkrav/i);
});

test("a five-card new suit after a weak two is left for expert review", () => {
  const opener=weakTwoHand("H");
  const responder=[
    ...cards("H","Q2"), ...cards("S","AKQJ9"),
    ...cards("D","AK"), ...cards("C","345678")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2S"}
  ],2);
  assert.equal(result.exp,null);
  assert.match(result.why,/femkortsfärg.*expertbedömning/i);
});

test("a jump in a new suit is a Splinter with singleton/void and at least 19 stp", () => {
  const opener=weakTwoHand("H");
  const responder=[
    ...cards("H","Q2"), ...cards("S","5"),
    ...cards("D","AKQJ"), ...cards("C","AKQJT8")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"3S"}
  ],2);
  assert.equal(result.exp,"3S");
  assert.equal(result.conv,"Splinter");
  assert.match(result.why,/Splinter.*19 stp/);
});

test("3NT is treated as the documented final contract", () => {
  const opener = weakTwoHand("H");
  const hands = completeDeal(opener,fillerHand(opener));
  const result = node(hands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"3N"}
  ],2);
  assert.equal(result.exp,"3N");
  assert.match(result.why,/slutbud/);
});

test("opener completes the forcing new-suit response with at least 3 in the opening suit", () => {
  const opener = weakTwoHand("H");
  const responder = [
    ...cards("H","2"), ...cards("S","AKQJ9"),
    ...cards("D","567"), ...cards("C","6789")
  ];
  const hands = completeDeal(opener,responder);
  const result = node(hands,[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2S"},
    {s:"W",c:"P"},{s:"N",c:"3H"}
  ],4);
  assert.equal(result.exp,"3H");
  assert.match(result.why,/krav.*3 i öppningsfärgen/i);
});

test("the opener's continuation after the new Stenberg 2NT response is left uncovered", () => {
  const opener=weakTwoHand("H","AK9876");
  const responder=[
    ...cards("H","T2"), ...cards("S","AKQ"),
    ...cards("D","KJ"), ...cards("C","34567")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"},
    {s:"W",c:"P"},{s:"N",c:"3H"}
  ],4);
  assert.equal(result.exp,null);
  assert.match(result.why,/Stenberg.*fortsättning/i);
});

test("the former minimum/maximum rebid after 2NT is no longer applied", () => {
  const opener=weakTwoHand("H","AKQ976");
  const responder=[
    ...cards("H","T2"), ...cards("S","AKQ"),
    ...cards("D","KJ"), ...cards("C","34567")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"},
    {s:"W",c:"P"},{s:"N",c:"4H"}
  ],4);
  assert.equal(result.exp,null);
  assert.match(result.why,/tidigare 6-8.*9-10 hp-stegen används inte/);
});

test("the old 3NT maximum rebid after 2NT is also disabled for a minor weak two", () => {
  const opener=weakTwoHand("D","AKQ976");
  const responder=[
    ...cards("D","T2"), ...cards("S","AK"),
    ...cards("H","Q5678"), ...cards("C","6789")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2D"},{s:"E",c:"P"},{s:"S",c:"2N"},
    {s:"W",c:"P"},{s:"N",c:"3N"}
  ],4);
  assert.equal(result.exp,null);
  assert.match(result.why,/Stenberg.*fortsättning/i);
});

test("seven-card preempts use 2-level for one quality criterion and 3-level for both", () => {
  for (const suit of ["D","H","S"]) {
    const cases = [
      ["AK76543","2"+suit], // two honors only
      ["A987654","2"+suit], // one honor plus two intermediates
      ["AKT9876","3"+suit], // both criteria
      ["8765432","P"]       // neither criterion
    ];
    for (const [ranks,expected] of cases) {
      const opener=preemptHand(suit,ranks);
      const result=node(completeDeal(opener,fillerHand(opener)),[{s:"N",c:expected}],0);
      assert.equal(result.exp,expected,suit+" "+ranks);
    }
  }
});

test("eight-card preempts use 3-level for one quality criterion and 4-level for both", () => {
  for (const suit of ["D","H","S"]) {
    const cases = [
      ["AK765432","3"+suit], // two honors only
      ["A9876543","3"+suit], // one honor plus two intermediates
      ["AKT98765","4"+suit], // both criteria
      ["8765432T","P"]       // neither criterion
    ];
    for (const [ranks,expected] of cases) {
      const opener=preemptHand(suit,ranks);
      const result=node(completeDeal(opener,fillerHand(opener)),[{s:"N",c:expected}],0);
      assert.equal(result.exp,expected,suit+" "+ranks);
    }
  }
});

test("clubs never use 2C as a weak opening; 7-card one-criterion hands start at 3C", () => {
  for (const ranks of ["AK76543","A987654"]) {
    const opener=preemptHand("C",ranks);
    const result=node(completeDeal(opener,fillerHand(opener)),[{s:"N",c:"3C"}],0);
    assert.equal(result.exp,"3C",ranks);
  }
});

test("eight-card club preempts use 3C with one criterion and 4C with both", () => {
  for (const [ranks,expected] of [["AK765432","3C"],["A9876543","3C"],["AKT98765","4C"]]) {
    const opener=preemptHand("C",ranks);
    const result=node(completeDeal(opener,fillerHand(opener)),[{s:"N",c:expected}],0);
    assert.equal(result.exp,expected,ranks);
  }
});

test("a seven-card 2-level opening does not inherit the six-card weak-two response system", () => {
  const opener=preemptHand("H","AK76543");
  const responder=[
    ...cards("H","Q2"), ...cards("S","AKQJ"),
    ...cards("D","5678"), ...cards("C","678")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"2N"}
  ],2);
  assert.equal(result.exp,null);
  assert.match(result.why,/sjukortsfärg/);
});

test("responses after a three-level preempt are uncovered unless explicitly documented", () => {
  const opener=preemptHand("H","AKT9876");
  const responder=[
    ...cards("H","2"), ...cards("S","AKQJ9"),
    ...cards("D","5678"), ...cards("C","678")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"3H"},{s:"E",c:"P"},{s:"S",c:"3N"}
  ],2);
  assert.equal(result.exp,null);
  assert.match(result.why,/inte definierade/);
});

test("responses after a four-level preempt are uncovered unless explicitly documented", () => {
  const opener=preemptHand("H","AKT98765");
  const responder=[
    ...cards("H","2"), ...cards("S","AKQJ9"),
    ...cards("D","5678"), ...cards("C","678")
  ];
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"4H"},{s:"E",c:"P"},{s:"S",c:"5C"}
  ],2);
  assert.equal(result.exp,null);
  assert.match(result.why,/inte definierade/);
});

test("weak-two analysis trees are restricted to exactly six cards", () => {
  const expected = {
    T34_SVAG_TVA_D: "D",
    T35_SVAG_TVA_H: "H",
    T36_SVAG_TVA_S: "S"
  };
  for (const [id,suit] of Object.entries(expected)) {
    const tree=analysisLibrary.trees.find(item=>item.id===id);
    assert.ok(tree,id);
    const root=tree.nodes.find(item=>item.id===tree.root);
    assert.equal(root.handConditions.suitLengths[suit].min,6,id);
    assert.equal(root.handConditions.suitLengths[suit].max,6,id);
    assert.ok(root.handConditions.manual.some(item=>/färgkvaliteten/i.test(item)),id);
  }
});

test("direct game contracts after a weak two are final contracts", () => {
  const opener=weakTwoHand("H");
  for(const call of ["3N","4H","5D"]){
    const responder=fillerHand(opener);
    const result=node(completeDeal(opener,responder),[
      {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:call}
    ],2);
    assert.equal(result.exp,call,call);
    assert.match(result.why,/slutbud/);
  }
});

test("4NT after a weak two is RKC with the opening suit as trump", () => {
  const opener=weakTwoHand("H");
  const responder=fillerHand(opener);
  const result=node(completeDeal(opener,responder),[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"4N"}
  ],2);
  assert.equal(result.exp,"4N");
  assert.equal(result.conv,"Blackwood 5 ess");
  assert.match(result.why,/hjärter som trumf|trumf/);
});

test("weak-two analysis trees use Lathund page 27 response meanings", () => {
  for (const [id,opening] of [
    ["T34_SVAG_TVA_D","2D"],["T35_SVAG_TVA_H","2H"],["T36_SVAG_TVA_S","2S"]
  ]) {
    const tree=analysisLibrary.trees.find(item=>item.id===id);
    const root=tree.nodes.find(item=>item.id===tree.root);
    const labels=root.branches.map(branch=>branch.label).join(" | ");
    assert.match(labels,/Stenberg 2NT.*13\+ stp/);
    assert.match(labels,/Invit.*14–16 stp/);
    assert.match(labels,/Ny färg.*15–16\+ hp.*rondkrav/);
    assert.match(labels,/Utgångsbud.*slutbud/);
    assert.match(labels,/Splinter.*19\+ stp/);
    assert.match(labels,/Essfråga.*trumf/);
    assert.ok(tree.nodes.some(node=>node.sequence.join(",")===[opening,"Pass","4N"].join(",")));
  }
});


test("ten-card trump fit receives the agreed +2 trump-length bonus", () => {
  const hand = [
    ...cards("H","23456"), ...cards("S","23"),
    ...cards("D","234"), ...cards("C","234")
  ];
  const a=Rattning.H(hand), b=Rattning.H(hand);
  // Two points of shortness (one per hand) plus the agreed two-point
  // bonus for a ten-card fit; no high-card points are present.
  assert.equal(Rattning.partnershipPoints(a,b,"H")-(a.hp+b.hp),4);
});

test("a direct 4H final contract after a weak two is rejected below 26 playing points", () => {
  const opener=weakTwoHand("H");
  const responder=fillerHand(opener);
  const hands=completeDeal(opener,responder);
  const result=Rattning.judge({hands,dealer:"N",bids:[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"4H"},
    {s:"W",c:"P"},{s:"N",c:"P"},{s:"E",c:"P"}
  ]});
  const game=result.items.find(item=>item.bud==="4♥");
  assert.equal(game.bedomning,"fel");
  assert.equal(game.konvention,"utgång/slam – styrkekrav");
  assert.match(game.motivering,/26 gemensamma spelpoäng/);
});

test("a direct 3NT final contract after a weak two is rejected below 26 HCP", () => {
  const opener=weakTwoHand("H");
  const responder=[
    ...cards("H","Q2"), ...cards("S","234"),
    ...cards("D","456"), ...cards("C","23456")
  ];
  const hands=completeDeal(opener,responder);
  const result=Rattning.judge({hands,dealer:"N",bids:[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"3N"},
    {s:"W",c:"P"},{s:"N",c:"P"},{s:"E",c:"P"}
  ]});
  const game=result.items.find(item=>item.bud==="3NT");
  assert.equal(game.bedomning,"fel");
  assert.match(game.motivering,/26 gemensamma honnörspoäng/);
});


test("a direct six-level contract after a weak two requires the common 33-point slam threshold", () => {
  const opener=weakTwoHand("H");
  const responder=[
    ...cards("H","Q2"), ...cards("S","234"),
    ...cards("D","456"), ...cards("C","23456")
  ];
  const hands=completeDeal(opener,responder);
  const result=Rattning.judge({hands,dealer:"N",bids:[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"6H"},
    {s:"W",c:"P"},{s:"N",c:"P"},{s:"E",c:"P"}
  ]});
  const slam=result.items.find(item=>item.bud==="6♥");
  assert.equal(slam.bedomning,"fel");
  assert.equal(slam.konvention,"utgång/slam – styrkekrav");
  assert.match(slam.motivering,/33 gemensamma poäng/);
});


test("a direct grand-slam contract after a weak two also requires the common 33-point threshold", () => {
  const opener=weakTwoHand("H");
  const responder=[
    ...cards("H","Q2"), ...cards("S","234"),
    ...cards("D","456"), ...cards("C","23456")
  ];
  const hands=completeDeal(opener,responder);
  const result=Rattning.judge({hands,dealer:"N",bids:[
    {s:"N",c:"2H"},{s:"E",c:"P"},{s:"S",c:"7N"},
    {s:"W",c:"P"},{s:"N",c:"P"},{s:"E",c:"P"}
  ]});
  const slam=result.items.find(item=>item.bud==="7NT");
  assert.equal(slam.bedomning,"fel");
  assert.match(slam.motivering,/33 gemensamma poäng/);
});
