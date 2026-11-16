'use strict';
const assert=require('node:assert/strict');
const store=new Map();
global.window={localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)}};
delete require.cache[require.resolve('../ej-tackta-logg.js')];
require('../ej-tackta-logg.js');
const log=global.window.EjTacktaLogg;
const entry={context:'after_deal',dealer:'N',seat:'S',auction:[{s:'N',c:'1N'},{s:'E',c:'P'}],attemptedCall:'P',reason:'Staymanfortsättning saknas',sourceGap:true,hands:{N:['SA'],E:[],S:[],W:[]}};
assert.equal(log.count(),0);
assert.equal(log.record(entry).added,true);
assert.equal(log.count(),1);
assert.equal(log.record(entry).added,false,'identisk position ska inte dubbelloggas');
assert.equal(log.count(),1);
const rows=log.read();
assert.equal(rows[0].seat,'S');
assert.deepEqual(rows[0].auction,entry.auction);
assert.equal(rows[0].sourceGap,true);
assert.equal(log.clear(),true);
assert.equal(log.count(),0);

// A valid but unsupported live auction must also be persisted automatically.
const R=require('../rattningsmotor.js');
const ownHand=['S14','S13','S12','S2','H14','H13','H2','D14','D2','D3','C11','C2','C3'];
const live=R.decideLive({
  seat:'N',dealer:'N',
  auction:[{s:'N',c:'2N'},{s:'E',c:'P'},{s:'S',c:'3S'},{s:'W',c:'P'}],
  ownHand
});
assert.equal(live.exp,null);
assert.equal(log.count(),1,'unsupported live decision must be saved');
const liveRow=log.read()[0];
assert.equal(liveRow.context,'live');
assert.equal(liveRow.seat,'N');
assert.deepEqual(liveRow.auction,[{s:'N',c:'2N'},{s:'E',c:'P'},{s:'S',c:'3S'},{s:'W',c:'P'}]);
assert.deepEqual(liveRow.hands.N,ownHand);
assert.equal(log.clear(),true);
assert.equal(log.count(),0);
console.log('ej-tackta-logg.test.js: OK');
