/*
 * Trumfstöd – huvudmodul för svarshandens stödvisningar och öppningshandens
 * andra bud efter 1 i färg, enligt Nordisk standard 2012-08-22, s. 2–3.
 *
 * Stenberg är en återanvänd specialmodul. Den dupliceras inte här.
 * Övriga generella bud (färgvisning, NT, tvåfärgshänder m.m.) återanvänds
 * från de befintliga hög-/lågfärgsmodulerna.
 *
 * Källprincip: endast uttryckligen beskrivna bud rekommenderas. Okända
 * fortsättningar lämnas till rättningsmotorns gemensamma expertlogg.
 */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningTrumfstodFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api,deps){
  deps=deps||{};
  var maj=api.maj, st_=api.st_, isBid=api.isBid, lv=api.lv, NC=api.NC, sideOf=api.side;
  var stenberg=deps.stenberg, major=deps.majorBidding, minor=deps.minorBidding;
  if(!stenberg||!major||!minor) throw new Error('trumfstod.js kräver Stenberg samt hög- och lågfärgsmodulerna.');

  function ordinary(opening){return maj(st_(opening))?major:minor;}
  function isOneLevelSuit(opening){return typeof opening==='string'&&/^1[CDHS]$/.test(opening);}

  // Stenberg is scoped to a direct 2NT response to the partnership's
  // opening 1-level suit bid. Later 2NT bids in other sequences are not Stenberg.
  function isStenbergSequence(auction){
    if(!Array.isArray(auction)) return false;
    var calls=auction.filter(function(x){return x&&x.c!=='P';});
    if(calls.length<2||!isOneLevelSuit(calls[0].c)||calls[1].c!=='2N') return false;
    if(sideOf(calls[0].s)===sideOf(calls[1].s)) return false;
    // No opponent intervention may occur after the direct response.
    return calls.slice(2).every(function(x){return sideOf(x.s)===sideOf(calls[0].s);});
  }

  // Hela svarshanden på 1 i färg passerar här. Stenberg prövas först;
  // övriga bud går via befintlig svarsmotor. Splinter är pausad.
  function responder(hand,opening){
    if(!isOneLevelSuit(opening)) return NC('Trumfstöd kräver en öppning på 1-tricksnivån i färg.');
    // Splinter är pausad. Stenberg och den vanliga svarsmotorn är enda aktiva vägar.
    var special=stenberg.responder(hand,opening);
    if(special&&special.exp) return special;
    return ordinary(opening).respond(hand,opening);
  }

  // Öppningshandens andra bud. Stenberg 2NT är en separat undermodul;
  // vanliga stödhöjningar och övriga återbud går via befintlig färgmodul.
  function openerSecondBid(hand,opening,response,partnerCards){
    if(!isOneLevelSuit(opening)) return NC('Trumfstöd kräver en öppning på 1-tricksnivån i färg.');
    if(response==='2N') return stenberg.openerRebid(hand,opening,partnerCards);
    return ordinary(opening).rebid(hand,opening,response,partnerCards);
  }

  function responderContinuation(hand,opening,call,partnerHand,prior,rkcTrumpFromAuction,sideWanted,askSeat){
    return stenberg.responderContinuation(hand,opening,call,partnerHand,prior,
      rkcTrumpFromAuction,sideWanted,askSeat);
  }

  function isSupportResponse(hand,opening,bid){
    if(!isOneLevelSuit(opening)||!isBid(bid)) return false;
    var suit=st_(opening);
    if(st_(bid)===suit) return hand&&hand.L&&hand.L[suit]>=4&&lv(bid)>=2;
    return bid==='2N'&&hand&&hand.L&&hand.L[suit]>=4;
  }

  return {responder:responder,openerSecondBid:openerSecondBid,responderContinuation:responderContinuation,
    isSupportResponse:isSupportResponse,isStenbergSequence:isStenbergSequence,accepts:isOneLevelSuit};
});
