/* Slamlogik: essfrågor, RKC och kontroll av förbjudna slamsekvenser. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningSlamFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api){
  var SU=api.SU;
  var SYM=api.SYM;
  var NAME=api.NAME;
  var side=api.side;
  var partner=api.partner;
  var isBid=api.isBid;
  var lv=api.lv;
  var st_=api.st_;
  var rk=api.rk;
  var txt=api.txt;
  var maj=api.maj;
  var lowest=api.lowest;
  var jump=api.jump;
  var H=api.H;
  var handHps=api.handHps;
  var partnershipPoints=api.partnershipPoints;
  var T=api.T;
  var ok=api.ok;
  var NC=api.NC;
  var lastBidCode=api.lastBidCode;
  function rkcTrumpFromAuction(bids,sideWanted){
    var ours=bids.filter(function(x){return side(x.s)===sideWanted&&isBid(x.c)});
    for(var i=0;i<ours.length;i++){
      if(/^1[CDHS]$/.test(ours[i].c)){
        var opener=ours[i].s, suit=ours[i].c[1];
        for(var j=i+1;j<ours.length;j++){
          if(ours[j].s!==opener&&ours[j].c==='2N')return suit;
        }
      }
    }
    var by={};ours.forEach(function(x){if(x.c[1]!=='N'){by[x.c[1]]=by[x.c[1]]||{};by[x.c[1]][x.s]=1}});
    var fits=SU.filter(function(k){return by[k]&&by[k].N&&by[k].S});
    if(fits.length===1)return fits[0];
    // Nordisk standard s. 5: efter fullföljd överföring är 4NT uttryckligen RKC
    // med överföringsfärgen som trumf. S. 7 anger också indirekt trumf efter
    // 2♥/2♠ som svar på Stayman 2♣. Kontrollera även budgivarnas roller.
    var ntOpeningIndex=ours.findIndex(function(x){return x.c==='1N';});
    if(ntOpeningIndex>=0){
      var ntOpenerSeat=ours[ntOpeningIndex].s;
      for(var oi=ntOpeningIndex+1;oi<ours.length;oi++){
        var call=ours[oi];
        if(call.s===ntOpenerSeat)continue;
        if(call.c==='2D'){
          for(var hj=oi+1;hj<ours.length;hj++)
            if(ours[hj].s===ntOpenerSeat&&ours[hj].c==='2H')return 'H';
        }
        if(call.c==='2H'){
          for(var sj=oi+1;sj<ours.length;sj++)
            if(ours[sj].s===ntOpenerSeat&&ours[sj].c==='2S')return 'S';
        }
        if(call.c==='2C'){
          for(var mj=oi+1;mj<ours.length;mj++)
            if(ours[mj].s===ntOpenerSeat&&(ours[mj].c==='2H'||ours[mj].c==='2S'))
              return ours[mj].c[1];
        }
      }
    }
    return null;
  }
  // Fyr-essfråga utan trumf är bara avtalad i dessa uttryckliga sangsekvenser.
  // Övriga 4NT-bud utan fastställd trumf ska inte automatiskt tolkas som essfråga.
  function agreedNoTrumpAceAsk(bids,sideWanted){
    var ours=bids.filter(function(x){return side(x.s)===sideWanted&&x.c!=='P'&&x.c!=='X'&&x.c!=='XX'}).map(function(x){return x.c});
    var seq=ours.join(',');
    return seq==='1N,4N' ||
           seq==='1N,2C,2D,4N';
  }
  // The user-confirmed 2NT–4NT sequence is quantitative: an invitation to
  // 6NT, not an ace ask. The opener's acceptance threshold is kept separate.
  function agreedQuantitativeNoTrumpInvite(bids,sideWanted){
    var ours=bids.filter(function(x){return side(x.s)===sideWanted&&x.c!=='P'&&x.c!=='X'&&x.c!=='XX'}).map(function(x){return x.c});
    return ours.join(',')==='2N,4N';
  }
  // Ägarskap för 4NT-modulen: alla svar på essfrågor/RKC och fortsättningar
  // efter 4NT hanteras här, oberoende av vilken öppningsfamilj som ledde dit.
  function rkcReply(h,T_){
    var kc=h.aces+(T_&&h.has(T_,13)?1:0);
    var q=!!(T_&&h.has(T_,12));
    var exp,why;
    var means=function(c){
      if(!T_){
        if(c==='5C')return '0 eller 4 ess av 4.';
        if(c==='5D')return '1 ess av 4.';
        if(c==='5H')return '2 ess av 4.';
        if(c==='5S')return '3 ess av 4.';
        return null;
      }
      if(c==='5C')return '1 eller 4 nyckelkort (av 5).';
      if(c==='5D')return '0 eller 3 nyckelkort (av 5).';
      if(c==='5H')return '2 nyckelkort utan trumfdam.';
      if(c==='5S')return '2 nyckelkort med trumfdam.';
      if(c==='5N')return null;
      return null;
    };

    if (T_ && kc === 5) {
        return NC('Alla fem nyckelkort finns. Bibliotekets RKC 1430-tabell anger inte ett särskilt svar för fem av fem; motorn lämnar därför detta fall ej täckt i stället för att felaktigt tolka det som två nyckelkort.',means,'RKC 1430');
    }
    if (T_) {
        // Systemets avtalade RKC 1430: 5C=1/4, 5D=0/3,
        // 5H=2 utan trumfdam, 5S=2 med trumfdam.
        if (kc === 1 || kc === 4) exp = '5C';
        else if (kc === 0 || kc === 3) exp = '5D';
        else exp = q ? '5S' : '5H';
    } else {
        if (h.aces === 0 || h.aces === 4) exp = '5C';
        else if (h.aces === 1) exp = '5D';
        else if (h.aces === 2) exp = '5H';
        else exp = '5S';
    }

    why = T_ ? (kc + ' nyckelkort inklusive trumfkungen. Svar enligt RKC 1430.') : (h.aces + ' av de fyra essen. Svar enligt fyr-essfråga utan trumf.');
    return {exp:exp,alt:[],why:why,means:means,conv:T_?'RKC 1430':'Fyr-essfråga utan trumf'};
  }
  function rkcNextStep(h,T_,r){
    if(T_){
      return NC('Efter svaret på RKC 1430 behöver frågeställaren väga in sina egna nyckelkort och skilja mellan de dubbla svaren 1/4 respektive 0/3. Fortsättningsregeln efter 5♣, 5♦, 5♥ eller 5♠ är ännu inte fastställd; motorn ska därför inte automatiskt bjuda slam.');
    }
    return NC('Nordisk standard s. 7 anger ingen fortsättningsregel efter svaren på fyr-essfrågan utan fastställd trumf. Fortsättningen lämnas därför ej täckt.');
  }

  /* ––––– INKLIV / DUBBLING / STÖDDUBBLING ––––– */

  function slamProhibitionFromAuction(bids,index,ourSide){
    var prior=(bids||[]).slice(0,index);
    for(var j=0;j<prior.length;j++){
      var call=prior[j];
      if(!call||side(call.s)===ourSide)continue;
      var earlierOurBid=prior.slice(0,j).some(function(x){return x&&side(x.s)===ourSide&&/^1[CDHSN]$/.test(x.c);});
      if(!earlierOurBid)continue;
      if(/^2[CDHS]$/.test(call.c)){
        return 'Motståndarna har klivit in på tvåtricksnivån; enligt den uttryckliga slamspärren får vår sida inte rekommendera slam.';
      }
      if(/^1[CDHS]$/.test(call.c)){
        var opponentPartner=partner(call.s);
        var partnerResponded=prior.slice(j+1).some(function(x){
          return x&&x.s===opponentPartner&&x.c!=='P';
        });
        if(partnerResponded){
          return 'Motståndarna har gjort ett inkliv på entricksnivån och inklivarens partner har svarat; enligt den uttryckliga slamspärren får vår sida inte rekommendera slam.';
        }
      }
    }
    return null;
  }

  // Public live API. Deliberately accepts one hand only; there is no
  // parameter through which partner/opponent cards can enter the decision.

  return {rkcTrumpFromAuction:rkcTrumpFromAuction,agreedNoTrumpAceAsk:agreedNoTrumpAceAsk,
    agreedQuantitativeNoTrumpInvite:agreedQuantitativeNoTrumpInvite,rkcReply:rkcReply,
    rkcNextStep:rkcNextStep,slamProhibitionFromAuction:slamProhibitionFromAuction};
});
