/* Ostörd budgivning – kontextrouter.
 * Pure classifier: labels the situation; never chooses a bid.
 * Competition/interference is deliberately outside scope.
 */
(function(root){
  'use strict';
  const SUITS = new Set(['C','D','H','S']);
  const normalize = call => String(call || '').trim().toUpperCase().replace(/[♣]/g,'C').replace(/[♦]/g,'D').replace(/[♥]/g,'H').replace(/[♠]/g,'S').replace(/[NT]/g,'N');
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
    // Only NS calls are expected. Any opponent intervention is a scope violation.
    if(calls.some(c=>['X','XX'].includes(c) || (!isPass(c)&&!isSuit(c)&&!isNT(c)&&!/^([1-7])N$/.test(c))))
      return result('out-of-scope','Auction contains unsupported/interference call');
    const nonPass = calls.filter(c=>!isPass(c));
    if(!nonPass.length) return result('opening','Passed-out or first opening decision');
    if(nonPass.length===1) return result('opening','One opening call; next decision is response');
    const first = nonPass[0], second = nonPass[1], last = nonPass[nonPass.length-1];
    // Direct 2NT response to a suit opening only: Stenberg.
    if(nonPass.length===2 && isSuitOpening(first) && second==='2N')
      return result('stenberg','2NT directly over a 1-level suit opening');
    // NT-opening convention branches.
    if(first==='1N' && nonPass.length===2 && ['2C','2D','2H','2S','3C','3D','3H','3S','3N'].includes(second))
      return result('responses-1nt','Direct response to 1NT');
    if(first==='2N' && nonPass.length===2 && ['3C','3D','3H','3S','3N'].includes(second))
      return result('responses-2nt','Direct response to 2NT');
    // Strong opening sequence.
    if(first==='2C') return result('responses-2c','Auction starts with strong 2C opening');
    // Weak two response sequence.
    if(['2D','2H','2S'].includes(first)) return result('responses-weak-2','Auction starts with weak 2 opening');
    // Slam context: classify only where 4NT is actually present and the auction has
    // reached a slam inquiry/continuation context. Do not treat every 4NT as RKC.
    if(nonPass.includes('4N')){
      const idx=nonPass.indexOf('4N');
      if(idx>=2) return result('slam','4NT occurs after prior suit agreement/auction development; module must interpret context');
      return result('contextual-4nt','4NT meaning is unresolved from this minimal classifier; sequence-specific rule required');
    }
    // Rebid / continuation based on opening and response levels.
    if(nonPass.length>=3){
      const opener=nonPass[0], responder=nonPass[1];
      if(isSuitOpening(opener) && isSuit(responder)){
        const level=Number(responder[0]), openLevel=Number(opener[0]);
        if(level===1) return result('rebid-1-over-1','Response at 1-level');
        if(level===2 && SUITS.has(responder[1]) && responder[1]!==opener[1]) return result('rebid-1-over-2','Response at 2-level');
        if(level>=2) return result('rebid-2-over-1-or-jump','Response at 2+ level; sequence-specific rules needed');
      }
      if(['2N','3N'].includes(responder)) return result('rebid-nt-response','NT response continuation');
      return result('rebid-special','Special response or continuation requires sequence-specific module');
    }
    if(nonPass.length===2) return result('response','Response to opening; use opening-specific response module');
    return result('uncovered','No safe classification for this sequence');
  }
  root.BudUncontestedRouter=Object.freeze({classify,normalize});
})(typeof globalThis!=='undefined'?globalThis:this);
