"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createSeatView } = require("../seat-view.js");
function sampleState() {
 return {hands:{N:["SA","HK"],E:["S2","H2"],S:["SK","HQ"],W:["S3","H3"]},bids:[{s:"N",c:"1N"},{s:"E",c:"P"}],dealer:"N",vulnerability:{NS:false,EW:true}};
}
test("AI view contains only selected hand",()=>{
 const view=createSeatView(sampleState(),"S",{playedCards:[]});
 assert.deepEqual(view.ownHand,["SK","HQ"]); assert.equal(view.seat,"S");
 assert.equal(Object.hasOwn(view,"hands"),false);
 for(const other of ["N","E","W"])assert.equal(Object.hasOwn(view,other),false);
 assert.equal(JSON.stringify(view).includes('"SA"'),false);
 assert.equal(JSON.stringify(view).includes('"S2"'),false);
 assert.equal(JSON.stringify(view).includes('"S3"'),false);
});
test("view is detached and deeply immutable",()=>{
 const state=sampleState(),view=createSeatView(state,"N",{playedCards:[{seat:"E",card:"S2"}]});
 state.hands.N[0]="S2";state.bids[0].c="P";
 assert.equal(view.ownHand[0],"SA");assert.equal(view.auction[0].c,"1N");
 assert.equal(Object.isFrozen(view),true);assert.equal(Object.isFrozen(view.ownHand),true);assert.equal(Object.isFrozen(view.auction[0]),true);
});
test("hidden hands and unapproved public fields are rejected",()=>{
 const state=sampleState();
 assert.throws(()=>createSeatView(state,"N",{hands:state.hands}),/Unsupported publicState field/);
 assert.throws(()=>createSeatView(state,"N",{playedCards:[],hiddenHands:state.hands}),/Unsupported publicState field/);
 assert.throws(()=>createSeatView(state,"N",{playedCards:[],custom:true}),/Unsupported publicState field/);
});
test("dummy cards are allowed only after dummy is exposed",()=>{
 const state=sampleState(),dummy={seat:"S",hand:["SK","HQ"]};
 assert.throws(()=>createSeatView(state,"N",{dummy}),/dummyExposed/);
 const view=createSeatView(state,"N",{dummy,dummyExposed:true});
 assert.deepEqual(view.publicState.dummy,dummy);
});
test("private nested hand data is rejected",()=>{
 const state=sampleState();
 assert.throws(()=>createSeatView(state,"N",{playedCards:[{hand:["SA"]}]}),/Private hand data/);
});
test("invalid seats and missing hands are rejected",()=>{
 assert.throws(()=>createSeatView(sampleState(),"X"),/Unknown bridge seat/);
 assert.throws(()=>createSeatView({hands:{}},"N"),/valid hand/);
});
