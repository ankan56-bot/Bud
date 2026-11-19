/* Ostörd budgivning – kontextrouter.
 * Pure classifier: labels the situation; never chooses a bid.
 * Competition/interference is deliberately outside scope.
 */
(function(root){
  'use strict';
  const normalize = call => String(call || '').trim().toUpperCase()
    .replace(/[♣]/g,'C').replace(/[♦]/g,'D').replace(/[♥]/g,'H').replace(/[♠]/g,'S')
    .replace(/NT/g,'N');
  const isPass = c => ['P','PASS'].includes(normalize(c));
  const isSuitOpening = c => /^1[CDHS]$/.test(normalize(c));
  const isNT = c => /^(1|2|3|4)N$/.test(normalize(c));
  const isSuit = c => /^[1-7][CDHS]$/.test(normalize(c));
  const result = (module, reason) => Object.freeze({module,reason,confidence:'sequence'});
  function classify(input){
    const auction=Array.isArray(input)?input:(input&&input.auction)||[];
    const calls=auction.map(normalize).filter(Boolean);
    if(!calls.length) return result('opening','No calls yet');
    if(calls.some(c=>['X','XX'].includes(c)||(!isPass(c)&&!isSuit(c)&&!isNT(c))))
      return result('out-of-scope','Interference or unsupported call; competition is paused');
    const nonPass=calls.filter(c=>!isPass(c));
    if(!nonPass.length) return result('opening','Passed-out auction');
    const first=nonPass[0],second=nonPass[1];
    if(nonPass.length===1){
      if(first==='1N') return result('responses-1nt','Responder after 1NT');
      if(first==='2N') return result('responses-2nt','Responder after 2NT');
      if(first==='2C') return result('responses-2c','Responder after strong 2C');
      if(['2D','2H','2S'].includes(first)) return result('responses-weak-2','Responder after weak 2');
      if(isSuitOpening(first)) return result(first[1]==='H'||first[1]==='S'?'responses-1-major':'responses-1-minor','Responder after 1-level suit opening');
      return result('responses-other-opening','Responder after other opening');
    }
    // Direct Stenberg is narrowly defined: 1-level suit opening – 2NT.
    if(nonPass.length===2&&isSuitOpening(first)&&second==='2N')
      return result('stenberg','Direct 2NT response to 1-level suit opening only');
    if(first==='1N'&&nonPass.length===2) return result('responses-1nt','Direct response to 1NT');
    if(first==='2N'&&nonPass.length===2) return result('responses-2nt','Direct response to 2NT');
    if(first==='2C') return result('responses-2c','Strong 2C opening family');
    if(['2D','2H','2S'].includes(first)) return result('responses-weak-2','Weak 2 opening family');
    // All 4NT routes to the Slam module. The module must interpret the whole auction;
    // this router deliberately does not label it RKC, quantitative, or natural.
    if(nonPass.includes('4N')) return result('slam','Contextual 4NT: slam module interprets full sequence');
    if(nonPass.length===2) return result('response','Opening-specific response module');
    if(nonPass.length===3){
      const openerRebid=nonPass[2];
      if(isNT(openerRebid)) return result('rebid-nt','Opening hand rebid in NT');
      if(isSuit(openerRebid)) return result('rebid-suit','Opening hand rebid in suit');
      return result('rebid-special','Opening hand special rebid');
    }
    if(nonPass.length===4){
      const responderContinuation=nonPass[3];
      if(isNT(responderContinuation)) return result('responder-continuation-nt','Responder continuation in NT');
      if(isSuit(responderContinuation)) return result('responder-continuation-suit','Responder continuation in suit');
      return result('responder-continuation-special','Responder special continuation');
    }
    return result('continuation','Further auction continuation; route by full sequence and system state');
  }
  root.BudUncontestedRouter=Object.freeze({classify,normalize});
})(typeof globalThis!=='undefined'?globalThis:this);
