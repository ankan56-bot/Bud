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
      if(/^1[HS]$/.test(ours[i].c)){
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
          for(var mj=oi+1;mj<ours.length;mj++){
            if(ours[mj].s!==ntOpenerSeat)continue;
            if(ours[mj].c==='2S')return 'S';
            if(ours[mj].c==='2H'){
              // Stayman 2H normally fixes hearts indirectly for RKC.
              // Exception: responder's 2NT/3NT shows four spades; if
              // opener then shows 3S/4S with 4-4 majors, spades become
              // the agreed trump suit for a later 4NT ask.
              for(var sj2=mj+1;sj2<ours.length;sj2++){
                if(ours[sj2].s===ntOpenerSeat)continue;
                if(ours[sj2].c!=='2N'&&ours[sj2].c!=='3N')continue;
                for(var oj2=sj2+1;oj2<ours.length;oj2++){
                  if(ours[oj2].s===ntOpenerSeat&&(ours[oj2].c==='3S'||ours[oj2].c==='4S'))
                    return 'S';
                }
              }
              return 'H';
            }
          }
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
    var voids=SU.filter(function(s){return h.L[s]===0;});
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
      if(c==='5N')return '3 nyckelkort och någon renons.';
      if(/^6[CDHS]$/.test(c))return '2 nyckelkort och renons; 6 i trumf om renonsfärgen är högre än trumf.';
      return null;
    };

    if (T_) {
        // Fem nyckelkort saknar ett uttryckligt svar i projektets RKC 1430-tabell.
        if (kc === 5) {
          return NC('Alla fem nyckelkort finns. RKC 1430-tabellen anger inget särskilt svar för fem av fem; läget lämnas ej täckt.',means,'RKC 1430',true);
        }
        // Nordisk standard s. 7: 3 nyckelkort + renons visas med 5NT.
        if (kc === 3 && voids.length > 0) {
          exp = '5N';
        // Två nyckelkort + en renons visas med 6 i renonsfärgen,
        // utom när renonsfärgen ligger högre än trumf: då visas 6 i trumf.
        } else if (kc === 2 && voids.length === 1) {
          var voidSuit=voids[0];
          exp=SU.indexOf(voidSuit)>SU.indexOf(T_) ? '6'+T_ : '6'+voidSuit;
        } else if (kc === 2 && voids.length > 1) {
          return NC('Två nyckelkort och flera renonser. Nordisk standard s. 7 anger 6 i färg för renons men väljer inte vilken av flera renonser som ska visas; läget lämnas ej täckt.',means,'RKC 1430',true);
        } else if (kc === 1 || kc === 4) {
          exp = '5C';
        } else if (kc === 0 || kc === 3) {
          exp = '5D';
        } else if (kc === 2) {
          exp = q ? '5S' : '5H';
        } else {
          return NC('Nyckelkortsantalet saknar ett uttryckligt svar i RKC 1430-tabellen.',means,'RKC 1430',true);
        }
    } else {
        // Fyr-essfråga utan trumf: Nordisk standard s. 7.
        if (h.aces === 0 || h.aces === 4) exp = '5C';
        else if (h.aces === 1) exp = '5D';
        else if (h.aces === 2) exp = '5H';
        else exp = '5S';
    }

    why = T_
      ? (kc + ' nyckelkort inklusive trumfkungen' + (voids.length ? ' och ' + voids.length + ' renons(er)' : '') + '. Svar enligt RKC 1430 och renonsreglerna i Nordisk standard s. 7.')
      : (h.aces + ' av de fyra essen. Svar enligt fyr-essfråga utan trumf.');
    return {exp:exp,alt:[],why:why,means:means,conv:T_?'RKC 1430':'Fyr-essfråga utan trumf'};
  }
  function rkcNextStep(h,T_,r){
    if(T_){
      return NC('Efter RKC-svaret beskriver Nordisk standard s. 7 en fortsättning där nästa bud som inte är trumf frågar efter trumfdamen; trumfdamen förnekas med 5 i trumf och visas med 5NT eller 6 i ny färg (som också visar kung i den färgen). Källan ger dock inte en entydig, laglig fortsättningsstege för samtliga RKC 1430-svar och alla fyra möjliga trumffärger. Fortsättningen lämnas därför ej täckt i stället för att hitta på bud.',null,'RKC 1430',true);
    }
    return NC('Nordisk standard s. 7 anger svaren på fyr-essfrågan utan fastställd trumf men inte frågeställarens fortsättning efter dessa svar. Fortsättningen lämnas ej täckt.',null,'Fyr-essfråga utan trumf',true);
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
