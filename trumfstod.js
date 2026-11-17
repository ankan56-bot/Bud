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
  var maj=api.maj, st_=api.st_, isBid=api.isBid, lv=api.lv, NC=api.NC, SU=api.SU, handHps=api.handHps, lowest=api.lowest;
  var stenberg=deps.stenberg, major=deps.majorBidding, minor=deps.minorBidding;
  if(!stenberg||!major||!minor) throw new Error('trumfstod.js kräver Stenberg samt hög- och lågfärgsmodulerna.');

  function ordinary(opening){return maj(st_(opening))?major:minor;}
  function isOneLevelSuit(opening){return typeof opening==='string'&&/^1[CDHS]$/.test(opening);}

  // Hela svarshanden på 1 i färg passerar här. Stenberg kontrolleras först;
  // övriga stöd- och färgbud bedöms av den befintliga gemensamma svarsmotorn.
  function responder(hand,opening){
    if(!isOneLevelSuit(opening)) return NC('Trumfstöd kräver en öppning på 1-tricksnivån i färg.');
    var openingSuit=st_(opening), fit=hand&&hand.L?hand.L[openingSuit]:0;
    var htp=typeof handHps==='function'?handHps(hand,fit>=4?openingSuit:null):0;
    var voids=hand&&hand.L?SU.filter(function(s){return s!==openingSuit&&hand.L[s]===0;}):[];

    // Vid lågfärgsöppning ska en egen 4+ högfärg visas först,
    // även när handen också innehåller en eller flera renoncer.
    var hasMajor= !maj(openingSuit)&&SU.some(function(s){return maj(s)&&hand.L[s]>=4;});
    // PDF s. 2: dubbelhopp i ny färg visar renons, 4+ stöd och 13+ htp.
    // Om flera renoncer finns anger källan ingen prioritet; logga i stället.
    if(!hasMajor&&fit>=4&&htp>=13&&voids.length>1)
      return NC('Svarshanden har flera renoncer med 4+ stöd och 13+ htp. Nordisk standard anger dubbelhopp i renonsfärg men inte prioritet mellan flera renoncer; sekvensen lämnas EJ TÄCKT.',null,'trumfstöd',true);
    if(!hasMajor&&fit>=4&&htp>=13&&voids.length===1){
      var voidSuit=voids[0];
        var first=lowest(voidSuit,opening),doubleJump=first?(lv(first)+2)+voidSuit:null;
        if(doubleJump&&lv(doubleJump)<=7)
          return {exp:doubleJump,alt:[],why:'Renons i '+({C:'♣',D:'♦',H:'♥',S:'♠'}[voidSuit])+', 4+ stöd i öppningsfärgen och '+htp+' htp: dubbelhopp i renonsfärgen enligt Nordisk standard s. 2.',means:function(c){return c===doubleJump?'Dubbelhopp: renons i färgen, 4+ stöd och 13+ htp.':null},conv:'trumfstöd – renons'};
    }

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
    isSupportResponse:isSupportResponse,accepts:isOneLevelSuit};
});
