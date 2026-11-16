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
    return seq==='1N,4N' || seq.indexOf('1N,4N,')===0 ||
           seq==='1N,2C,2D,4N' || seq.indexOf('1N,2C,2D,4N,')===0;
  }
  // The user-confirmed 2NT–4NT sequence is quantitative: an invitation to
  // 6NT, not an ace ask. The opener's acceptance threshold is kept separate.
  function agreedQuantitativeNoTrumpInvite(bids,sideWanted){
    var ours=bids.filter(function(x){return side(x.s)===sideWanted&&x.c!=='P'&&x.c!=='X'&&x.c!=='XX'}).map(function(x){return x.c});
    var seq=ours.join(',');
    return seq==='2N,4N'||seq.indexOf('2N,4N,')===0;
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
        // Fem nyckelkort saknar ett uttryckligt svar i projektets RKC enligt Nordisk standard-tabell.
        if (kc === 5) {
          return NC('Alla fem nyckelkort finns. RKC enligt Nordisk standard-tabellen anger inget särskilt svar för fem av fem; läget lämnas ej täckt.',means,'RKC enligt Nordisk standard',true);
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
          return NC('Två nyckelkort och flera renonser. Nordisk standard s. 7 anger 6 i färg för renons men väljer inte vilken av flera renonser som ska visas; läget lämnas ej täckt.',means,'RKC enligt Nordisk standard',true);
        } else if (kc === 0 || kc === 3) {
          exp = '5C';
        } else if (kc === 1 || kc === 4) {
          exp = '5D';
        } else if (kc === 2) {
          exp = q ? '5S' : '5H';
        } else {
          return NC('Nyckelkortsantalet saknar ett uttryckligt svar i RKC enligt Nordisk standard-tabellen.',means,'RKC enligt Nordisk standard',true);
        }
    } else {
        // Fyr-essfråga utan trumf: Nordisk standard s. 7.
        if (h.aces === 0 || h.aces === 4) exp = '5C';
        else if (h.aces === 1) exp = '5D';
        else if (h.aces === 2) exp = '5H';
        else exp = '5S';
    }

    why = T_
      ? (kc + ' nyckelkort inklusive trumfkungen' + (voids.length ? ' och ' + voids.length + ' renons(er)' : '') + '. Svar enligt RKC enligt Nordisk standard och renonsreglerna i Nordisk standard s. 7.')
      : (h.aces + ' av de fyra essen. Svar enligt fyr-essfråga utan trumf.');
    return {exp:exp,alt:[],why:why,means:means,conv:T_?'RKC enligt Nordisk standard':'Fyr-essfråga utan trumf'};
  }
  function highestContract(auction){
    var highest=null;
    (auction||[]).forEach(function(x){if(x&&isBid(x.c)&&(!highest||rk(x.c)>rk(highest)))highest=x.c;});
    return highest;
  }
  function rkcNextStep(h,T_,response,auction){
    if(!T_)return fourAceSlamNextStep(h,response);
    if(response!=='5C'&&response!=='5D')
      return rkcSlamNextStep(h,T_,response,null,auction);
    var highest=highestContract(auction), trumpCall='5'+T_;
    // The source says the ask is the next bid that is not trump. We only
    // generate it where 5 in trump remains a legal denial after the ask.
    var candidates=['5C','5D','5H','5S'];
    for(var i=0;i<candidates.length;i++){
      var call=candidates[i];
      if(call[1]===T_)continue;
      if(highest&&rk(call)<=rk(highest))continue;
      return {exp:call,alt:[],why:'Nästa lagliga bud som inte är trumf frågar efter trumfdamen enligt Nordisk standard s. 7. Om 5 i trumf fortfarande är lagligt förnekar det trumfdamen; den visas med 5NT eller 6 i ny färg (som även visar kung i den färgen). Om 5 i trumf inte längre är lagligt lämnas just förnekelsesvaret ej täckt.',means:function(c){return c===call?'Fråga efter trumfdam.':null},conv:'RKC – trumfdamfråga'};
    }
    return NC('Nordisk standard s. 7 säger att nästa bud som inte är trumf frågar efter trumfdamen och att den förnekas med 5 i trumf. I denna auktion finns inget lagligt 5-bud som både frågar och lämnar 5 i trumf som lagligt förnekande. Sekvensen lämnas ej täckt.',null,'RKC – trumfdamfråga',true);
  }
  function rkcQueenReply(h,T_,auction){
    var highest=highestContract(auction),trumpCall='5'+T_;
    if(!h.has(T_,12)){
      if(!highest||rk(trumpCall)>rk(highest))
        return {exp:trumpCall,alt:[],why:'Trumfdamen förnekas genom 5 i trumf enligt Nordisk standard s. 7.',means:function(c){return c===trumpCall?'Förnekar trumfdamen.':null},conv:'RKC – trumfdamfråga'};
      return NC('Trumfdamen saknas men 5 i trumf är inte längre ett lagligt förnekande efter frågebudet. Källan anger ingen alternativ förnekelse; läget lämnas ej täckt.',null,'RKC – trumfdamfråga',true);
    }
    if(!highest||rk('5N')>rk(highest))
      return {exp:'5N',alt:[],why:'Trumfdamen visas med 5NT enligt Nordisk standard s. 7.',means:function(c){return c==='5N'?'Visar trumfdamen.':null},conv:'RKC – trumfdamfråga'};
    var shown=SU.filter(function(s){return s!==T_&&h.has(s,13)&&(!highest||rk('6'+s)>rk(highest));});
    if(shown.length===1){
      var call='6'+shown[0];
      return {exp:call,alt:[],why:'Trumfdamen visas med 6 i ny färg; budet visar också kung i den färgen enligt Nordisk standard s. 7.',means:function(c){return c===call?'Visar trumfdamen och kung i '+SYM[shown[0]]+'.':null},conv:'RKC – trumfdamfråga'};
    }
    return NC('Trumfdamen finns men 5NT är inte längre lagligt. Nordisk standard tillåter 6 i ny färg som också visar kung i färgen, men handen ger inte en entydig laglig sådan färg.',null,'RKC – trumfdamfråga',true);
  }
  function keycardPossibilities(response){
    if(response==='5C')return [0,3];
    if(response==='5D')return [1,4];
    if(response==='5H'||response==='5S')return [2];
    if(response==='5N')return [3];
    if(/^6[CDHS]$/.test(response))return [2];
    return [];
  }
  function rkcSlamNextStep(h,T_,response,queenReply,auction){
    if(!T_)return fourAceSlamNextStep(h,response);
    if((response==='5C'||response==='5D')&&queenReply==='5'+T_){
      if(h.aces===3||h.aces===4){
        var six='6'+T_;
        var high=highestContract(auction);
        if(high&&rk(six)<=rk(high))return NC('6 i trumf är inte längre ett lagligt bud efter förnekelsen i 5 i trumf. Ingen alternativ fortsättning är uttryckligen angiven.',null,'RKC – lillslam',true);
        return {exp:six,alt:[],why:'Efter ett dubbeltydigt 5-lågsvar och förnekad trumfdam bjuder frågeställaren 6 i trumf med 3 eller 4 egna ess enligt Nordisk standard s. 7. Detta uppfyller också projektregeln om högst ett saknat ess för lillslam i färg.',means:function(c){return c===six?'Lillslam: frågeställaren har 3 eller 4 ess efter förnekad trumfdam.':null},conv:'RKC – lillslam'};
      }
      return NC('Efter dubbeltydigt 5-lågsvar och förnekad trumfdam anger Nordisk standard 6 i trumf när frågeställaren har 3 eller 4 ess. Den egna handen har inte 3 eller 4 ess; ingen annan fortsättning är fastställd.',null,'RKC – lillslam',true);
    }
    var counts=keycardPossibilities(response),ownAces=h.aces,ownTrumpKing=h.has(T_,13),poss=[];
    counts.forEach(function(kc){
      for(var pa=0;pa<=4-ownAces;pa++){
        var pk=kc-pa;
        if(pk!==0&&pk!==1)continue;
        if(pa+pk!==kc)continue;
        var totalKeycards=ownAces+pa+(ownTrumpKing?1:0)+pk;
        if(totalKeycards<=5)poss.push({partnerAces:pa,partnerTrumpKing:pk,totalAces:ownAces+pa,totalKeycards:totalKeycards});
      }
    });
    if(!poss.length)return NC('RKC-svaret kan inte kombineras med frågeställarens antal ess utan motsägelse. Positionen behöver granskas.',null,'RKC – slamfortsättning',true);
    var allSeven=poss.every(function(p){return p.totalAces===4&&p.totalKeycards===5;});
    if(allSeven){
      var seven='7'+T_;
      var highSeven=highestContract(auction);
      if(highSeven&&rk(seven)<=rk(highSeven))return NC('Storslamsbudet i trumf är inte längre lagligt efter partnerns kontroll-/renonsvisning. Läget lämnas ej täckt.',null,'RKC – storslam',true);
      return {exp:seven,alt:[],why:'Alla fyra essen och trumfkungen är säkrade av frågeställarens hand och RKC-svaret. Projektets storslamregel för färgkontrakt är uppfylld.',means:function(c){return c===seven?'Storslam: alla fyra ess och trumfkungen.':null},conv:'RKC – storslam'};
    }
    var allSmall=poss.every(function(p){return p.totalAces>=3;});
    if(allSmall){
      var six='6'+T_;
      var highSmall=highestContract(auction);
      if(highSmall&&rk(six)<rk(highSmall))return NC('Partnerskapet har tillräckligt med ess för lillslam, men 6 i trumf är lägre än partnerns redan gjorda 6-bud. Källan anger ingen alternativ slutbudsväg i detta läge.',null,'RKC – lillslam',true);
      if(highSmall&&rk(six)===rk(highSmall))return {exp:'P',alt:[],why:'Partnerns renons-/nyckelkortssvar har redan placerat kontraktet i 6 i trumf. Minst 3 av 4 ess är säkrade; pass behåller det tillåtna lillslammet.',means:function(c){return c==='P'?'Pass i det redan nådda lillslammet.':null},conv:'RKC – lillslam'};
      return {exp:six,alt:[],why:'Alla möjliga kortfördelningar enligt RKC-svaret visar minst 3 av de 4 essen. Högst ett ess saknas; lillslam i färg är tillåten enligt projektregeln.',means:function(c){return c===six?'Lillslam: minst 3 av 4 ess.':null},conv:'RKC – lillslam'};
    }
    return NC('RKC-svaret är fortfarande förenligt med både färre än 3 och minst 3 ess i partnerskapet. Eftersom lillslam i färg kräver minst 3 av 4 ess kan motorn inte välja 6- eller 7-läget säkert.',null,'RKC – slamfortsättning',true);
  }
  function fourAceSlamNextStep(h,response){
    var counts=response==='5C'?[0,4]:response==='5D'?[1]:response==='5H'?[2]:response==='5S'?[3]:[];
    var possible=[];
    counts.forEach(function(n){if(n<=4-h.aces)possible.push(h.aces+n);});
    if(possible.length&&possible.every(function(n){return n===4;}))
      return {exp:'7N',alt:[],why:'Alla fyra essen är säkrade. Projektregeln tillåter 7NT när samtliga fyra ess finns.',means:function(c){return c==='7N'?'Storslam i sang: alla fyra ess.':null},conv:'Fyr-essfråga – storslam'};
    return NC('Fyr-essvaret visar inte entydigt att partnerskapet har alla fyra ess. 7NT är därför inte tillåtet enligt projektregeln; någon separat acceptregel för 6NT är inte fastställd.',null,'Fyr-essfråga – slamfortsättning',true);
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
    rkcNextStep:rkcNextStep,rkcQueenReply:rkcQueenReply,rkcSlamNextStep:rkcSlamNextStep,fourAceSlamNextStep:fourAceSlamNextStep,slamProhibitionFromAuction:slamProhibitionFromAuction};
});
