/* Ostörd budgivning – kontextrouter.
 * Pure classifier: labels the situation; never chooses a bid.
 * Competition/interference is deliberately outside scope.
 */
(function(root){
  'use strict';
  const SUITS = new Set(['C','D','H','S']);
  const normalize = call => String(call || '').trim().toUpperCase()
    .replace(/[♣]/g,'C').replace(/[♦]/g,'D').replace(/[♥]/g,'H').replace(/[♠]/g,'S')
    .replace(/NT/g,'N');
  const isPass = c => ['P','PASS'].includes(normalize(c));
  const isSuitOpening = c => /^1[CDHS]$/.test(normalize(c));
  const isNT = c => /^(1|2|3|4)N$/.test(normalize(c));
  const isSuit = c => /^[1-7][CDHS]$/.test(normalize(c));
  function result(module, reason, confidence='sequence'){
    return Object.freeze({module, reason, confidence});
  }
  function classify(input){
    const auction = Array.isArray(input) ? input : (input && input.auction) || [];
    const calls = auction.map(normalize).filter(Boolean);
    if(!calls.length) return result('opening','No calls yet');
    if(calls.some(c=>['X','XX'].includes(c) || (!isPass(c)&&!isSuit(c)&&!isNT(c))))
      return result('out-of-scope','Auction contains unsupported/interference call');
    const nonPass = calls.filter(c=>!isPass(c));
    if(!nonPass.length) return result('opening','Passed-out or first opening decision');
    const first = nonPass[0], second = nonPass[1];
    if(nonPass.length===1){
      if(first==='1N') return result('responses-1nt','Responder acts after 1NT opening');
      if(first==='2N') return result('responses-2nt','Responder acts after 2NT opening');
      if(first==='2C') return result('responses-2c','Responder acts after strong 2C opening');
      if(['2D','2H','2S'].includes(first)) return result('responses-weak-2','Responder acts after weak 2 opening');
      if(isSuitOpening(first)) return result(first[1]==='H'||first[1]==='S'?'responses-1-major':'responses-1-minor','Responder acts after 1-level suit opening');
      return result('responses-other-opening','Responder after other opening');
    }
    // Direct 2NT response to a suit opening only: Stenberg.
    if(nonPass.length===2 && isSuitOpening(first) && second==='2N')
      return result('stenberg','2NT directly over a 1-level suit opening');
    if(first==='1N' && nonPass.length===2)
      return result('responses-1nt','Direct response to 1NT');
    if(first==='2N' && nonPass.length===2)
      return result('responses-2nt','Direct response to 2NT');
    if(first==='2C') return result('responses-2c','Auction starts with strong 2C opening');
    if(['2D','2H','2S'].includes(first)) return result('responses-weak-2','Auction starts with weak 2 opening');
    // 4NT is contextual: it is not automatically an ace ask/RKC.
    if(nonPass.includes('4N')){
      const idx=nonPass.indexOf('4N');
      if(idx>=2) return result('slam','4NT after auction development; slam module interprets full context');
      return result('contextual-4nt','Sequence-specific 4NT meaning; no automatic RKC');
    }
    if(nonPass.length>=3){
      const opener=nonPass[0], responder=nonPass[1];
      if(isSuitOpening(opener) && isSuit(responder)){
        const level=Number(responder[0]);
        if(level===1) return result('rebid-1-over-1','Response at 1-level');
        if(level===2 && SUITS.has(responder[1]) && responder[1]!==opener[1]) return result('rebid-1-over-2','Response at 2-level in a new suit');
        if(level>=2) return result('rebid-2-over-1-or-jump','Response at 2+ level; exact sequence required');
      }
      if(['2N','3N'].includes(responder)) return result('rebid-nt-response','NT response continuation');
      return result('rebid-special','Special response or continuation requires sequence-specific module');
    }
    return result('response','Response to opening; opening-specific response module');
  }
  root.BudUncontestedRouter=Object.freeze({classify,normalize});
})(typeof globalThis!=='undefined'?globalThis:this);
