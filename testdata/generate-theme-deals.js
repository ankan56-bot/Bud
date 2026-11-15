#!/usr/bin/env node
"use strict";

/*
 * Reproducible 140-deal dataset generator.
 * Run from repository root: node testdata/generate-theme-deals.js
 *
 * The production deal/theme logic is loaded from Budtraning.html rather than
 * reimplemented here. The browser UI tail is omitted; only the generator and
 * existing rule engine are executed in a sandbox.
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(__dirname, "temagivare_manifest.json");
const OUTPUT_PATH = path.join(__dirname, "theme_deals_140.json");
const RULES_CONTENT = fs.readFileSync(path.join(ROOT, "rattningsmotor.js"), "utf8");
const RULES_VERSION = (RULES_CONTENT.match(/version:'([^']+)'/) || [])[1];
const GIT_BLOB_HEADER = Buffer.from("blob " + Buffer.byteLength(RULES_CONTENT) + "\0");
const RULES_BLOB_SHA = crypto.createHash("sha1").update(GIT_BLOB_HEADER).update(RULES_CONTENT).digest("hex");
const SOURCE = {
  generator: "Budtraning.html existing newDeal/biasedDeal generator",
  generatorBlobSha: "00cb45b5e1cb97798a8a3600a60aa55f652252d5",
  rulesEngine: "rattningsmotor.js",
  rulesEngineVersion: RULES_VERSION,
  rulesEngineBlobSha: RULES_BLOB_SHA,
  branchBase: "f338ee7debc13023fc5e5fc35c4ca27619d2b9d6"
};

function loadRuntime() {
  const html = fs.readFileSync(path.join(ROOT, "Budtraning.html"), "utf8");
  const rules = fs.readFileSync(path.join(ROOT, "rattningsmotor.js"), "utf8");
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length < 6) throw new Error("Could not locate the main training script in Budtraning.html");

  const source = scripts[5][1];
  const tail = source.lastIndexOf("if(room)connect();");
  if (tail < 0) throw new Error("Could not locate the UI bootstrap boundary in Budtraning.html");

  const runnable = source.slice(0, tail) + [
    "window.BudThemeApi={",
    "newDeal:newDeal,focusOk:focusOk,FOC:FOC,shapeOf:shapeOf,hpOf:hpOf,",
    "oppMustPass:oppMustPass,SEATS:SEATS,themeDealer:themeDealer,",
    "botCall:botCall,turn:turn,ended:ended,legal:legal,",
    "themedOpening:themedOpening,themedOvercall:themedOvercall,",
    "validInklivScenario:validInklivScenario,naturalFitOpener:naturalFitOpener",
    "};})();"
  ].join("");

  const sandbox = {
    document: {
      getElementById: () => null,
      createElement: () => ({ style: {}, focus() {}, select() {} }),
      body: { appendChild() {}, removeChild() {} },
      execCommand: () => true
    },
    localStorage: { getItem: () => null, setItem() {} },
    navigator: {},
    fetch: () => Promise.resolve({ ok: false }),
    setTimeout: () => 0
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(runnable, sandbox, { timeout: 10000 });
  vm.runInContext(rules, sandbox, { timeout: 10000 });
  if (!sandbox.Rattning || sandbox.Rattning.version !== SOURCE.rulesEngineVersion) {
    throw new Error("Unexpected correction engine version; review the source metadata before regenerating");
  }
  return { api: sandbox.BudThemeApi, Rattning: sandbox.Rattning };
}

function balanced(hand, api) {
  const shape = api.shapeOf(hand);
  return [shape.S, shape.H, shape.D, shape.C].sort((a, b) => b - a).join("") === "4333" ||
    [shape.S, shape.H, shape.D, shape.C].sort((a, b) => b - a).join("") === "4432" ||
    [shape.S, shape.H, shape.D, shape.C].sort((a, b) => b - a).join("") === "5332";
}

function doubleThemeValid(deal, api) {
  const suits = ["S", "H", "D", "C"];
  const dealer = deal.dealer;
  if (dealer === "E" || dealer === "W") {
    const opening = api.themedOpening(deal.hands, dealer);
    if (!opening || !/^1[CDHS]$/.test(opening.exp || "")) return false;
    const overcaller = api.SEATS[(api.SEATS.indexOf(dealer) + 1) % 4];
    const shape = api.shapeOf(deal.hands[overcaller]);
    const double = api.themedOvercall(deal.hands, dealer, opening.exp);
    return api.hpOf(deal.hands[overcaller]) >= 12 &&
      shape[opening.exp[1]] <= 2 &&
      suits.every(suit => suit === opening.exp[1] || shape[suit] >= 3) &&
      !!double && double.exp === "X";
  }

  const overcaller = api.SEATS[(api.SEATS.indexOf(dealer) + 1) % 4];
  const openerHand = deal.hands[dealer];
  const overcallerShape = api.shapeOf(deal.hands[overcaller]);
  const shortSuits = suits.filter(suit => overcallerShape[suit] <= 2).length;
  const opening = api.themedOpening(deal.hands, dealer);
  const double = opening && /^1[CDHS]$/.test(opening.exp || "")
    ? api.themedOvercall(deal.hands, dealer, opening.exp) : null;
  const hp = api.hpOf(openerHand);
  return hp >= 12 && hp <= 19 &&
    !(balanced(openerHand, api) && hp >= 15 && hp <= 17) &&
    api.hpOf(deal.hands[overcaller]) >= 12 &&
    shortSuits === 1 &&
    Math.max(overcallerShape.S, overcallerShape.H, overcallerShape.D, overcallerShape.C) <= 4 &&
    !!double && double.exp === "X";
}

function makeReferenceAuction(deal, api, Rattning) {
  const state = { mode: deal.mode, hands: deal.hands, dealer: deal.dealer, bids: [] };
  for (let i = 0; i < 60 && !api.ended(state); i++) {
    const seat = api.turn(state);
    let call = "P";
    if (seat === "E" || seat === "W") {
      const result = api.botCall(state, seat);
      call = result && result.c || "P";
    } else {
      const trial = state.bids.concat([{ s: seat, c: "P" }]);
      let node = null;
      try {
        node = Rattning.nodeFor({ hands: state.hands, dealer: state.dealer, bids: trial }, trial.length - 1);
      } catch (_) {}
      call = node && node.exp || "P";
    }
    if (!api.legal(state, call, seat)) call = "P";
    state.bids.push({ s: seat, c: call });
  }
  if (!api.ended(state)) throw new Error("Reference auction did not terminate within 60 calls");
  const structural = Rattning.validateAuction(state);
  if (structural.errors.length) {
    throw new Error("Invalid reference auction: " + JSON.stringify(structural.errors));
  }
  // Hard opening constraints: never allow the reference auction to
  // normalize an out-of-range or unbalanced NT opening.
  const firstBid = state.bids.find(bid => bid.c !== "P");
  if (firstBid && (firstBid.c === "1N" || firstBid.c === "2N")) {
    const openingHand = state.hands[firstBid.s];
    const openingHcp = api.hpOf(openingHand);
    const validRange = firstBid.c === "1N"
      ? openingHcp >= 15 && openingHcp <= 17
      : openingHcp >= 20 && openingHcp <= 21;
    if (!validRange || !balanced(openingHand, api)) {
      throw new Error("Invalid " + firstBid.c + " opening in " + deal.theme + ": " +
        firstBid.s + " has " + openingHcp + " HCP and shape " +
        JSON.stringify(api.shapeOf(openingHand)));
    }
  }
  if (firstBid && firstBid.c === "2C") {
    const openingHand = state.hands[firstBid.s];
    const openingHcp = api.hpOf(openingHand);
    const openingIsBalanced = balanced(openingHand, api);
    const validStrongTwo = openingHcp >= 22 || (openingHcp >= 20 && openingHcp <= 21 && !openingIsBalanced);
    if (!validStrongTwo) {
      throw new Error("Invalid 2C opening in " + deal.theme + ": " +
        firstBid.s + " has " + openingHcp + " HCP and " +
        (openingIsBalanced ? "balanced" : "unbalanced") + " shape.");
    }
  }
  return state;
}

function classifyDeal(deal, api) {
  if (deal.theme !== "nt") {
    return {
      caseType: "unclassified",
      classification: {
        status: "pending",
        reason: "Temats beslutströsklar är ännu inte fullständigt modellerade med verifierbara egenskaper."
      }
    };
  }

  const opener = deal.dealer;
  const responder = opener === "N" ? "S" : "N";
  const openerHcp = api.hpOf(deal.hands[opener]);
  const responderHcp = api.hpOf(deal.hands[responder]);
  const responderShape = api.shapeOf(deal.hands[responder]);
  const firstCall = deal.bids.find(bid => bid.c !== "P");
  if (!firstCall || firstCall.s !== opener || firstCall.c !== "1N") {
    throw new Error("NT theme lacks its expected 1NT opening: " + deal.id);
  }
  if (!balanced(deal.hands[opener], api) || openerHcp < 15 || openerHcp > 17) {
    throw new Error("NT theme violates the hard 1NT opening rule: " + deal.id);
  }
  if (responderHcp < 8 || (responderShape.H < 4 && responderShape.S < 4)) {
    throw new Error("NT theme responder does not meet the documented theme condition: " + deal.id);
  }

  return {
    caseType: "typical",
    classification: {
      status: "rule_evidence",
      dimensions: [{
        rule: "1NT opening",
        observed: openerHcp + " HCP, balanced",
        boundary: "15-17 HCP and balanced",
        rationale: "Handen uppfyller samtliga absoluta krav för en korrekt 1NT-öppning. En hand på 15 eller 17 hp är inte ett gränsfall i betydelsen tveksamt eller felaktigt bud."
      }],
      rationale: "Typisk giltig 1NT-giv: öppningshanden uppfyller systemets kompletta krav 15-17 hp och balanserad fördelning."
    }
  };
}

function generateDataset() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const { api, Rattning } = loadRuntime();
  const deals = [];
  const gradeCounts = {};
  const themeStats = {};

  for (const theme of manifest.themes) {
    const modes = ["dubbling", "inkliv", "stenberg", "trumf"].includes(theme.id)
      ? Array(10).fill(theme.id === "stenberg" || theme.id === "trumf" ? "ostord" : "stord")
      : Array.from({ length: 10 }, (_, index) => index < 5 ? "stord" : "ostord");

    for (let index = 0; index < 10; index++) {
      const mode = modes[index];
      const seed = (7919 * (index + 1) + theme.id.length * 104729 + (mode === "ostord" ? 17 : 0)) >>> 0;
      const generated = api.newDeal(index + 1, mode, theme.id, seed);
      const cards = Object.values(generated.hands).flat();
      const uniqueCards = new Set(cards);
      const integrity = cards.length === 52 && uniqueCards.size === 52 &&
        ["N", "E", "S", "W"].every(seat => generated.hands[seat].length === 13);
      const themeCondition = theme.id === "dubbling"
        ? doubleThemeValid(generated, api)
        : api.focusOk(generated.hands, theme.id);
      const quietModeCondition = mode !== "ostord" || api.oppMustPass(generated.hands);
      const inklivCondition = theme.id !== "inkliv" ||
        api.validInklivScenario(generated.hands, "E") || api.validInklivScenario(generated.hands, "W");
      if (!integrity || !themeCondition || !quietModeCondition || !inklivCondition) {
        throw new Error("Deal validation failed for " + theme.id + " #" + (index + 1));
      }

      const auction = makeReferenceAuction(generated, api, Rattning);
      if (theme.id === "stenberg" || theme.id === "trumf") {
        const openingIndex = auction.bids.findIndex(bid => /^[1][CDHS]$/.test(bid.c));
        const opening = auction.bids[openingIndex];
        const responseIndex = auction.bids.findIndex((bid, position) =>
          position > openingIndex && bid.s === (opening.s === "N" ? "S" : "N"));
        const response = auction.bids[responseIndex];
        const uninterrupted = auction.bids.slice(openingIndex + 1, responseIndex).every(bid => bid.c === "P");
        const expectedResponse = theme.id === "stenberg"
          ? response && response.c === "2N"
          : response && /^[23][CDHS]$/.test(response.c) && response.c[1] === opening.c[1];
        if (!opening || !response || !uninterrupted || !expectedResponse) {
          throw new Error(theme.id + " deal does not contain its required uncontested support response: #" + (index + 1));
        }
        const responseTrial = auction.bids.slice(0, responseIndex + 1);
        const responseNode = Rattning.nodeFor({ hands: auction.hands, dealer: auction.dealer, bids: responseTrial }, responseIndex);
        const supportLength = api.shapeOf(auction.hands[response.s])[opening.c[1]];
        if (supportLength < 4 ||
            (theme.id === "stenberg" && (!responseNode || responseNode.conv !== "Stenberg" || responseNode.exp !== "2N")) ||
            (theme.id === "trumf" && (!responseNode || responseNode.exp !== response.c))) {
          throw new Error(theme.id + " response violates documented support/strength logic: #" + (index + 1));
        }
      }
      const judged = Rattning.judge(auction);
      const id = theme.id + "-" + String(index + 1).padStart(2, "0");
      const items = judged.items.map(item => ({
        nr: item.nr, seat: item.plats, bid: item.bud, grade: item.bedomning,
        suggested: item.battre || "", reason: item.motivering || ""
      }));
      const classification = classifyDeal({ id, theme: theme.id, dealer: generated.dealer,
        hands: generated.hands, bids: auction.bids }, api);
      const deal = {
        id, theme: theme.id, themeTitle: theme.title, mode, seed,
        caseType: classification.caseType, classification: classification.classification,
        dealer: generated.dealer,
        hands: generated.hands, bids: auction.bids,
        checks: {
          uniqueCards: uniqueCards.size, thirteenCardsPerSeat: true,
          themeCondition: true, quietModeCondition, auctionErrors: 0,
          openingNTValidated: true, openingStrongTwoValidated: true
        },
        correction: { version: Rattning.version, summary: judged.summary, items }
      };
      deals.push(deal);

      if (!themeStats[theme.id]) themeStats[theme.id] = { deals: 0, bids: 0, uncovered: 0, optional: 0, wrong: 0 };
      themeStats[theme.id].deals++;
      themeStats[theme.id].bids += auction.bids.length;
      for (const item of items) {
        gradeCounts[item.grade] = (gradeCounts[item.grade] || 0) + 1;
        if (item.grade === "ej_täckt") themeStats[theme.id].uncovered++;
        if (item.grade === "valfritt") themeStats[theme.id].optional++;
        if (item.grade === "fel") themeStats[theme.id].wrong++;
      }
    }
  }

  if (deals.length !== 140) throw new Error("Expected 140 deals, generated " + deals.length);
  return {
    version: "1.0.0",
    title: "140 reproducerbara temagivare",
    source: SOURCE,
    generation: {
      seedScheme: "(7919 * (indexWithinTheme + 1) + themeId.length * 104729 + (mode === 'ostord' ? 17 : 0)) >>> 0",
      dealsPerTheme: 10,
      modeDistribution: "5 stord + 5 ostord where supported; dubbling and inkliv are stord only",
      caseClassification: "NT theme classified from explicit system boundaries; other themes remain unclassified pending equivalent evidence.",
      openingNT: "A first non-pass 1NT call requires 15-17 HCP; a first non-pass 2NT call requires 20-21 HCP. Both require a balanced 4333/4432/5332 hand."
    },
    validation: {
      allDealsGenerated: true, noGenerationFailures: true,
      allHands52UniqueCards: true, allSeats13Cards: true,
      allThemeConditions: true, allAuctionsStructurallyValid: true, ddsUsed: false
    },
    auctionNote: "The stored auction is a deterministic reference line generated from the existing training/rules engine for coverage diagnostics. It is not an independently authored optimal auction or an independent correctness oracle.",
    summary: { dealCount: deals.length, failures: [], gradeCounts, themeStats },
    deals
  };
}

if (require.main === module) {
  const dataset = generateDataset();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2) + "\n", "utf8");
  console.log(JSON.stringify(dataset.summary, null, 2));
}

module.exports = { generateDataset, loadRuntime, doubleThemeValid };
