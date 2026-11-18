/* Budbeslut: öppningsbedömning och sekvensstyrd buddirigering.
 * Flyttad från rattningsmotor.js utan avsiktlig regel- eller beteendeförändring.
 */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningBudbeslutFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api,deps){
  var SU=api.SU, SYM=api.SYM, NAME=api.NAME;
  var side=api.side, partner=api.partner, isBid=api.isBid, lv=api.lv, st_=api.st_;
  var rk=api.rk, txt=api.txt, maj=api.maj, lowest=api.lowest, jump=api.jump;
  var H=api.H, handHps=api.handHps, partnershipPoints=api.partnershipPoints;
  var T=api.T, ok=api.ok, NC=api.NC;
  var twoClub=deps.twoClub, weakTwo=deps.weakTwo, trumfstod=deps.trumfstod;
  var majorBidding=deps.majorBidding, minorBidding=deps.minorBidding;
  var resp2c=twoClub.resp2c, reb2c=twoClub.reb2c, resp2c2=twoClub.resp2c2, openerThirdAfter2c=twoClub.openerThirdAfter2c, responderAfter2c2ntStayman=twoClub.responderAfter2c2ntStayman, responderAfter2c2ntTransfer=twoClub.responderAfter2c2ntTransfer;
  var resp2w=weakTwo.resp2w, open2w=weakTwo.open2w;
  var overcall=deps.overcalls.overcall, respOvercall=deps.overcalls.respOvercall;
  var respDouble=deps.doubles.respDouble;
  var rkcTrumpFromAuction=deps.slam.rkcTrumpFromAuction;
  var agreedNoTrumpAceAsk=deps.slam.agreedNoTrumpAceAsk;
  var agreedQuantitativeNoTrumpInvite=deps.slam.agreedQuantitativeNoTrumpInvite;
  var rkcReply=deps.slam.rkcReply, rkcNextStep=deps.slam.rkcNextStep;
  var rkcQueenReply=deps.slam.rkcQueenReply, rkcSlamNextStep=deps.slam.rkcSlamNextStep;
  var fourAceSlamNextStep=deps.slam.fourAceSlamNextStep;
  var ntResp=deps.sang.ntResp, ntOpener=deps.sang.ntOpener, stay2=deps.sang.stay2;
  var transfer2=deps.sang.transfer2, ntOpenerInvit=deps.sang.ntOpenerInvit;
  var ntOpener3=deps.sang.ntOpener3, ntOpener3NTChoice=deps.sang.ntOpener3NTChoice;
  var respAfter1NT=deps.stord.respAfter1NT, responderSecondBid=deps.stord.responderSecondBid;
  var openerThirdAfterTwoSuitInvite=deps.stord.openerThirdAfterTwoSuitInvite;
  /* ––––– ÖPPNING ––––– */
  function openingNode(h, fourthHandAfterThreePasses){
    var hp=h.hp,L=h.L,m=h.longest(),exp,alt=[],why;
    var cs=SU.filter(function(s){return L[s]===m}),pick;

    // Nya regler för val av öppningsfärg
    if(m>=5){
      // 5-5 ordning: Spader > Hjärter > Ruter > Klöver
      var order55 = ['S', 'H', 'D', 'C'];
      pick = cs.sort(function(a,b){ return order55.indexOf(a) - order55.indexOf(b); })[0];
      if(cs.length>1) alt.push('1'+cs[1]);
    } else {
      // 4-4 ordning: Hjärter > Spader > Klöver > Ruter
      var f=SU.filter(function(s){return L[s]===4});
      var order44 = ['H', 'S', 'C', 'D'];
      pick = f.sort(function(a,b){ return order44.indexOf(a) - order44.indexOf(b); })[0];
    }

    var one='1'+pick;
    var strongOpening=twoClub.opening(h);
    if(strongOpening)return strongOpening;
    if(h.bal&&hp>=20&&hp<=21){exp='2N';why='Balanserad 20-21 hp öppnas 2NT.'}
    else if(h.bal&&hp>=15&&hp<=17){exp='1N';why='Balanserad (fördelning '+h.shape+') med 15-17 hp öppnas 1NT.'}
    else if(hp>=11){
      var oneOpening=maj(pick)?majorBidding.open(h,pick,fourthHandAfterThreePasses):minorBidding.open(h,pick,fourthHandAfterThreePasses);
      if(oneOpening)return oneOpening;
      var weakOpening=weakTwo.opening(h,pick,m);
      if(weakOpening)return weakOpening;
      exp='P';why=hp+' hp räcker inte för öppning enligt 11-poängsregeln och ingen spärrhand.';
    }else{
      var weakOpening=weakTwo.opening(h,pick,m);
      if(weakOpening)return weakOpening;
      exp='P';why=hp+' hp räcker inte för öppning (12+, 11 med bra färg) och ingen spärrhand.';
    }
    return {exp:exp,alt:alt,why:why,conv:'öppning',means:function(c){
      if(c==='P')return 'Pass: under 12 hp (11 hp kräver bra färg), ingen spärrhand eller för dålig färg för svag tvåa.';
      if(c==='1N')return '15-17 hp, balanserad (även 5-korts högfärg).';
      if(c==='2C')return 'Utgångskrav, eller 22-24 hp balanserad.';
      if(c==='2N')return '20-21 hp, balanserad.';
      if(/^2[DHS]$/.test(c))return '6-10 hp, exakt 6-korts '+SYM[c[1]]+', bra färg (2 honnörer eller 1 honnör + 2 av 10-9-8).';
      if(/^3[CDHS]$/.test(c))return 'Spärrbud, 6-10 hp, 7-korts färg.';
      if(/^4[CDHS]$/.test(c))return 'Spärrbud, 6-10 hp, 8-korts färg.';
      if(/^1[CDHS]$/.test(c))return '12-19 hp, 4+ färg (11 hp endast med 6 kort + 3 honnörer eller 7 kort + 2 honnörer).';
      return null}};
  }

  /* ––––– SVAR PÅ 1 I FÄRG (Plus) ––––– */
  function lastBidCode(prior){var l=null;prior.forEach(function(x){if(isBid(x.c))l=x.c});return l}
  function nodeForRaw(st,i){
    var b=st.bids[i],me=b.s,pt=partner(me),prior=st.bids.slice(0,i),h=H(st.hands[me]);
    var last=lastBidCode(prior);
    var ours=prior.filter(function(x){return side(x.s)===side(me)&&x.c!=='P'});
    var lastCall=null,firstCall=null;
    for(var li=prior.length-1;li>=0;li--)if(isBid(prior[li].c)){lastCall=prior[li];break;}
    for(var fi=0;fi<prior.length;fi++)if(isBid(prior[fi].c)){firstCall=prior[fi];break;}

    // När partnern redan har bjudit utgång är pass normalt slutbud.
    // Rättningsmotorns separata utgångs-/slamkontroll kan fortfarande
    // föreslå vidare bud om styrkan motiverar slam.
    if(b.c==='P'&&lastCall&&side(lastCall.s)===side(me)){
      var ls=st_(lastCall.c),ll=lv(lastCall.c);
      var stayman3NTSpadeChoice=b.c==='P'&&lastCall.c==='3N'&&ours.length===4&&
        ours[0].c==='1N'&&ours[1].c==='2C'&&ours[2].c==='2H'&&ours[3].c==='3N'&&
        h.L.H===4&&h.L.S===4;
      var transfer3NTGameChoice=b.c==='P'&&lastCall.c==='3N'&&ours.length===4&&
        ours[0].c==='1N'&&
        ((ours[1].c==='2D'&&ours[2].c==='2H')||(ours[1].c==='2H'&&ours[2].c==='2S'))&&
        ours[3].c==='3N';
      var partnerHasGame=((ls==='N'&&ll>=3)||(maj(ls)&&ll>=4)||(!maj(ls)&&ls!=='N'&&ll>=5))&&
        !stayman3NTSpadeChoice&&!transfer3NTGameChoice;
      // Undantag: efter Stayman 2♥–3NT kan 4-4-öppnaren välja 4♠ (Nordisk standard s. 4).
      // 4NT med fastställd trumf är RKC-fråga, inte slutbud.
      var partnerHasRkcAsk=lastCall.c==='4N'&&!!rkcTrumpFromAuction(prior,side(me));
      var partnerHasFourAceAsk=lastCall.c==='4N'&&agreedNoTrumpAceAsk(prior,side(me));
      var partnerHasQuantitativeInvite=lastCall.c==='4N'&&agreedQuantitativeNoTrumpInvite(prior,side(me));
      var partnerRkcReply=/^(?:5[CDHSN]|6[CDHS])$/.test(lastCall.c)&&prior.some(function(x){return x.s===me&&x.c==='4N'})&&!!rkcTrumpFromAuction(prior,side(me));
      var partnerFourAceReply=/^5[CDHS]$/.test(lastCall.c)&&
        prior.some(function(x){return x.s===me&&x.c==='4N'})&&agreedNoTrumpAceAsk(prior,side(me));
      var partnerRkcQueenAsk=lastCall.s===pt&&/^5[CDHS]$/.test(lastCall.c)&&
        prior.some(function(x){return x.s===pt&&x.c==='4N'})&&
        prior.some(function(x){return x.s===me&&/^5[CD]$/.test(x.c)})&&
        !!rkcTrumpFromAuction(prior,side(me));
      if(partnerHasGame&&lastCall.c!=='4N'&&!partnerHasRkcAsk&&!partnerHasFourAceAsk&&!partnerHasQuantitativeInvite&&!partnerRkcReply&&!partnerFourAceReply&&!partnerRkcQueenAsk)return {exp:'P',alt:[],why:'Partnern har redan bjudit utgång. Pass avslutar budgivningen om inte styrkan motiverar slam.',means:function(c){return c==='P'?'Pass efter partnerns utgångsbud.':null},conv:'slutbud'};
    }

    // Pass efter en svag tvåöppning och 2NT-fråga när öppnaren visar minimum.
    if(b.c==='P'&&firstCall&&/^2[CDHS]$/.test(firstCall.c)&&
       prior.some(function(x){return x.c==='2N'&&side(x.s)===side(me)})&&
       lastCall&&lastCall.c==='3'+st_(firstCall.c)&&side(lastCall.s)===side(me)){
      return {exp:'P',alt:[],why:'2NT-frågan har fått svaret 3 i öppningsfärgen, vilket visar minimum efter svag tvåa. Pass är slutbud utan ytterligare invitstyrka.',means:function(c){return c==='P'?'Pass efter minimumsvar på 2NT-fråga.':null},conv:'svag tvåa'};
    }

    // Efter partnerns spärröppning på 3-nivån är pass standard med en
    // hand som inte når utgång; game-kontrollen ovan fångar starkare händer.
    if(b.c==='P'&&firstCall&&/^3[CDHS]$/.test(firstCall.c)&&ours.length===1){
      return {exp:'P',alt:[],why:'Partnern har spärröppnat på 3-nivån. Pass är rätt med en hand som inte når utgång.',means:function(c){return c==='P'?'Pass efter partnerns spärröppning.':null},conv:'spärr'};
    }
    var opp=prior.filter(function(x){return side(x.s)!==side(me)&&x.c!=='P'});
    var iFirst=ours.length?prior.indexOf(ours[0]):-1;
    var oppBefore=opp.filter(function(x){return iFirst<0||prior.indexOf(x)<iFirst});
    var oppAfter=opp.filter(function(x){return iFirst>=0&&prior.indexOf(x)>iFirst});
    var nc=function(w){return NC(w)};
    if(!ours.length){
      if(!opp.length){var fourthHandAfterThreePasses=prior.length===3&&prior.every(function(x){return x.c==='P'});return openingNode(h,fourthHandAfterThreePasses);}
      if(opp.length===1&&isBid(opp[0].c)){var ob=opp[0].c;if(ob==='1N'||ob==='2C')return nc('Försvar mot '+txt(ob)+'-öppning beskrivs inte i dokumentet.');return overcall(h,ob,last)}
      return nc('Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet.');
    }
    // Om den som nu ska bjuda senast var den som bjöd för paret har
    // partnern passat. Det är en giltig auktion, men konkurrensåterbudet
    // efter partnerns pass måste bedömas som ej täckt – inte som fel turordning.
    var weakMinorRelayFinalPass = b.c==='P'&&ours.length===3&&ours[0].c==='1N'&&ours[1].c==='2S'&&ours[2].c==='3C'&&ours[0].s===me&&ours[2].s===me;
    var lastOwnBidIndex=ours.length?prior.indexOf(ours[ours.length-1]):-1;
    var lastPartnerBidIndex=-1;
    for(var pbi=0;pbi<prior.length;pbi++)
      if(prior[pbi].s===pt&&isBid(prior[pbi].c))lastPartnerBidIndex=pbi;
    // Only classify "partner passed after our last bid" when our last bid
    // actually occurred after partner's last non-pass bid. If partner has
    // since made a new bid (e.g. a game-forcing new suit), we must continue
    // to evaluate that response instead of incorrectly abstaining.
    if(ours.length&&ours[ours.length-1].s===me&&lastOwnBidIndex>lastPartnerBidIndex&&!weakMinorRelayFinalPass)
      return nc('Partnern har passat efter vår senaste budgivning; konkurrensfortsättningen i den här sekvensen är inte beskriven i systemunderlaget.');
    var d=ours.length,opener=ours[0].s===me,f=ours[0].c;
    if(weakMinorRelayFinalPass&&opener&&d===3)
      return {exp:'P',alt:[],why:'Svarshanden passar på öppnarens 3♣-reläsvar. Pass avslutar budgivningen i 3♣.',means:function(c){return c==='P'?'Pass efter svarshandens signoff.':null},conv:'1NT-svar'};
    var c1=f,fs=c1[1]; // Deklareras nu här för att undvika bugg

    // Slut på en naturlig preferens till öppningsfärgen.
    if(b.c==='P'&&opener&&d>=4&&/^2[CDHS]$/.test(ours[3].c)&&
       st_(ours[3].c)===st_(ours[0].c)&&lv(ours[3].c)===2){
      return {exp:'P',alt:[],why:'Svarshanden har valt preferens till öppningsfärgen på 2-nivån. Pass är slutbud om inte den separata utgångs-/slamkontrollen visar tillräcklig styrka.',means:function(c){return c==='P'?'Pass efter preferens till öppningsfärgen.':null},conv:'preferens'};
    }

    // Svarshandens invit efter öppnarens 1NT-återbud.
    if(b.c==='P'&&opener&&d===4&&ours[2].c==='1N'&&ours[3].c==='2N'){
      var inviteTotal=h.hp+H(st.hands[pt]).hp;
      if(h.hp<14)return {exp:'P',alt:[],why:'Öppnaren har minimum i 1NT-återbudet. Pass på svarshandens 2NT-invit.',means:function(c){return c==='P'?'Pass med minimum efter 2NT-invit.':null},conv:'invit i sang'};
      return {exp:'3N',alt:[],why:'Öppnaren har maximum i 1NT-återbudet och accepterar 2NT-inviten med 3NT.',means:function(c){return c==='3N'?'Utgång i sang efter accepterad invit.':null},conv:'invit i sang'};
    }
    if(b.c==='P'&&opener&&d===4&&ours[2].c==='1N'&&/^3[HS]$/.test(ours[3].c)){
      var invitedSuit=st_(ours[3].c),invitedPartner=H(st.hands[pt]);
      var invitedFit=h.L[invitedSuit]+invitedPartner.L[invitedSuit];
      var invitedPoints=partnershipPoints(h,invitedPartner,invitedSuit);
      if(invitedFit>=8&&invitedPoints<26)return {exp:'P',alt:[],why:'Svarshanden har inviterat med 3 i högfärg, men paret når inte 26 gemensamma spelpoäng. Pass.',means:function(c){return c==='P'?'Pass på invit när 26-poängsgränsen inte nås.':null},conv:'invit i högfärg'};
      if(invitedFit>=8&&invitedPoints>=26)return {exp:'4'+invitedSuit,alt:[],why:invitedFit+'-korts fit och '+invitedPoints+' gemensamma spelpoäng: acceptera inviten till utgång.',means:function(c){return c==='4'+invitedSuit?'Accepterar invit till utgång.':null},conv:'invit i högfärg'};
    }

    // Öppnarens pass efter partnerns invitativa höjning i egen lågfärg.
    if(b.c==='P'&&opener&&d>=4&&/^3[CD]$/.test(ours[3].c)&&
       st_(ours[3].c)===st_(ours[2].c)){
      return {exp:'P',alt:[],why:'Partnerns 3-nivåhöjning i lågfärg är invitativ. Pass med minimum; utgångskontrollen fångar 28+ spelpoäng.',means:function(c){return c==='P'?'Pass med minimum efter lågfärgsinvit.':null},conv:'trumfstöd'};
    }

    var trumpForSide=rkcTrumpFromAuction(b.c==='4N'?prior.concat([{s:me,c:b.c}]):prior,side(me));
    if(b.c==='4N'){
      if(trumpForSide){
        return {exp:'4N',alt:[],why:'Essfråga (Blackwood 5 ess) med '+SYM[trumpForSide]+' som fastställd trumf.',means:function(c){return c==='4N'?'Essfråga (Blackwood 5 ess).':null},conv:'Blackwood 5 ess'};
      }
      if(agreedNoTrumpAceAsk(prior.concat([{s:me,c:'4N'}]),side(me))){
        return {exp:'4N',alt:[],why:'Avtalad fyr-essfråga utan fastställd trumf. 5♣–5NT visar 0–4 ess.',means:function(c){return c==='4N'?'Fyr-essfråga i sang enligt överenskommen sekvens.':null},conv:'Fyr-essfråga utan trumf'};
      }
      if(agreedQuantitativeNoTrumpInvite(prior.concat([{s:me,c:'4N'}]),side(me))){
        return {exp:'4N',alt:[],why:'Kvantitativ invit till 6NT efter 2NT-öppning. Detta är inte en essfråga.',means:function(c){return c==='4N'?'Kvantitativ invit till 6NT; inte essfråga.':null},conv:'Kvantitativ sanginvit'};
      }
      return NC('4NT utan fastställd trumf är inte automatiskt essfråga. I andra sangsekvenser behandlas 4NT som kvantitativt eller enligt parets särskilda överenskommelse.',null,'4NT',true);
    }

    var partnerAskIndex=-1;
    for(var pai=prior.length-1;pai>=0;pai--)if(prior[pai].s===pt&&prior[pai].c==='4N'){partnerAskIndex=pai;break;}
    if(partnerAskIndex>=0){
      var afterPartnerAsk=prior.slice(partnerAskIndex+1).filter(function(x){return x.s===me&&isBid(x.c)});
      var partnerAskTrump=rkcTrumpFromAuction(prior,side(me));
      var partnerAskFour=agreedNoTrumpAceAsk(prior,side(me));
      if(!afterPartnerAsk.length){
        if(partnerAskTrump||partnerAskFour)return rkcReply(h,partnerAskTrump);
        if(agreedQuantitativeNoTrumpInvite(prior,side(me)))
          return NC('Partnerns 4NT är en kvantitativ invit till 6NT efter 2NT-öppning, inte en essfråga. Öppnarens accept/pass-gräns är inte fastställd här; använd inte ess-/nyckelkortssvar.',null,'Kvantitativ sanginvit',true);
        return NC('Partnerns 4NT har ingen fastställd trumf och sekvensen är inte en uttryckligen avtalad fyr-essfråga enligt Nordisk standard. Svaret lämnas ej täckt.',null,'4NT',true);
      }
      if(partnerAskTrump&&(afterPartnerAsk[0].c==='5C'||afterPartnerAsk[0].c==='5D')){
        var responseIndex=prior.indexOf(afterPartnerAsk[0]),queenAskIndex=-1;
        for(var qai=responseIndex+1;qai<prior.length;qai++)
          if(prior[qai].s===pt&&isBid(prior[qai].c)){queenAskIndex=qai;break;}
        if(queenAskIndex>=0){
          var expectedAsk=rkcNextStep(h,partnerAskTrump,afterPartnerAsk[0].c,prior.slice(0,responseIndex+1));
          if(expectedAsk&&expectedAsk.exp===prior[queenAskIndex].c)
            return rkcQueenReply(h,partnerAskTrump,prior);
          return NC('Budet efter det dubbeltydiga 5-lågsvar matchar inte den verifierade lagliga trumfdamfrågan. Sekvensen lämnas ej täckt.',null,'RKC – trumfdamfråga',true);
        }
      }
      // När frågeställaren har avslutat på 6- eller 7-nivån ska svarshanden passa.
      if(b.c==='P'&&last&&/^[67][CDHSN]$/.test(last))
        return {exp:'P',alt:[],why:'Pass efter att partnern har fastställt slamkontraktet.',means:function(c){return c==='P'?'Pass efter slutbud.':null},conv:'slam – slutbud'};
    }
    var myAskIndex=-1;
    for(var mai=prior.length-1;mai>=0;mai--)if(prior[mai].s===me&&prior[mai].c==='4N'){myAskIndex=mai;break;}
    if(myAskIndex>=0){
      var afterMyAsk=prior.slice(myAskIndex+1).filter(function(x){return x.s===pt&&isBid(x.c)});
      if(afterMyAsk.length){
        var response=afterMyAsk[0].c;
        var myAskTrump=rkcTrumpFromAuction(prior,side(me));
        var myAskIsAgreed=myAskTrump||agreedNoTrumpAceAsk(prior,side(me));
        if(!myAskIsAgreed)return NC('4NT-sekvensen är inte en verifierad essfråga enligt Nordisk standard; fortsättningen lämnas ej täckt.',null,'4NT',true);
        if(!myAskTrump){
          if(afterMyAsk.length===1)return fourAceSlamNextStep(h,response);
        }else if(response==='5C'||response==='5D'){
          if(afterMyAsk.length===1)return rkcNextStep(h,myAskTrump,response,prior);
          var responseIndex=prior.indexOf(afterMyAsk[0]),queenReply=afterMyAsk[1]&&afterMyAsk[1].c;
          if(queenReply){
            var askIndex=-1;
            for(var qi=responseIndex+1;qi<prior.length;qi++)
              if(prior[qi].s===me&&isBid(prior[qi].c)){askIndex=qi;break;}
            var expectedAsk=askIndex>=0?rkcNextStep(h,myAskTrump,response,prior.slice(0,responseIndex+1)):null;
            if(expectedAsk&&expectedAsk.exp===prior[askIndex].c)
              return rkcSlamNextStep(h,myAskTrump,response,queenReply,prior);
            return NC('Trumfdamfrågans sekvens kan inte verifieras mot Nordisk standard s. 7. Läget lämnas ej täckt.',null,'RKC – slamfortsättning',true);
          }
        }else{
          return rkcSlamNextStep(h,myAskTrump,response,null,prior);
        }
        if(b.c==='P'&&last&&/^[67][CDHSN]$/.test(last))
          return {exp:'P',alt:[],why:'Pass efter fastställt slamkontrakt.',means:function(c){return c==='P'?'Pass efter slutbud.':null},conv:'slam – slutbud'};
      }
    }

    if(oppBefore.length){
      if(d===1&&!oppAfter.length&&oppBefore.length===1){
        if(f==='X')return respDouble(h,oppBefore[0].c,last);
        if(f==='1N')return ntResp(h,0);
        if(isBid(f))return respOvercall(h,f,last,oppBefore[0].c);
      }
      // Dubblerarens återbud efter partnerns svar på upplysningsdubbling.
      if(d===2&&ours.length===2&&ours[0].c==='X'&&ours[0].s===me&&ours[1].s===pt&&!oppAfter.length){
        var partnerResponse=ours[1].c;
        var responseSuit=isBid(partnerResponse)?st_(partnerResponse):null;
        var hasSupport=responseSuit&&responseSuit!=='N'&&h.L[responseSuit]>=3;
        if(hasSupport){
          return nc('Dubbleraren har 3+ stöd i partnerns svarsfärg. REF anger inte dubblerarens fortsättning med stöd.');
        }
        if(b.c==='P'){
          if(h.hp<18)return {exp:'P',alt:[],why:h.hp+' hp utan stöd för partnerns svar: pass. Egen färg/NT efter dubbling kräver 18+ hp.',means:function(c){return c==='P'?'Pass under 18 hp utan stöd efter upplysningsdubbling.':null},conv:'dubbling'};
          return nc('18+ hp utan stöd: REF tillåter egen färg/NT, men anger inte vilket återbud som ska väljas. Pass kan därför inte bedömas automatiskt.');
        }
        if(isBid(b.c)&&(b.c[1]==='N'||(b.c[1]!==responseSuit&&b.c[1]!==oppBefore[0].c[1]))){
          if(h.hp>=18)return {exp:b.c,alt:[],why:h.hp+' hp utan stöd för partnerns svar: egen färg/NT efter upplysningsdubbling är tillåtet från 18 hp.',means:function(c){return c===b.c?'Egen färg/NT efter upplysningsdubbling utan stöd: 18+ hp.':null},conv:'dubbling'};
          return {exp:'P',alt:[],why:h.hp+' hp utan stöd: egen färg/NT efter dubbling kräver 18+ hp; pass i stället.',means:function(c){return c==='P'?'Pass under 18 hp utan stöd.':null},conv:'dubbling'};
        }
        return nc('Dubblerarens återbud är varken pass eller en egen färg/NT enligt den uttryckliga 18 hp-regeln.');
      }
      return nc('Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet.');
    }

    // Motståndarinblandning efter 1NT-öppning
    if(oppAfter.length){
      if(c1==='1N'&&d===1&&oppAfter.length===1&&!opener){
        var interferenceSuit=oppAfter[0].c[1];
        if(b.c==='X'){
          var unbidAfterNT=SU.filter(function(s){return s!==interferenceSuit;});
          if(!unbidAfterNT.every(function(s){return h.L[s]>=3;}))
            return NC('Upplysningsdubbling efter 1NT kräver minst invitstyrka och 3+ kort i alla objudna färger; handen saknar minst ett uttryckligt fördelningsvillkor.');
          return NC('Handen har 3+ kort i objudna färger, men den exakta styrkegränsen för minst invit efter 1NT är inte numeriskt definierad i REF. Ingen automatisk dubblingsrekommendation ges.');
        }
        if(isBid(b.c)&&st_(b.c)!=='N'&&(lv(b.c)===2||lv(b.c)===3)){
          if(h.L[st_(b.c)]<5)
            return NC('Naturligt färgbud efter motståndarinkliv över 1NT kräver minst 5 kort i färgen.');
          return NC((lv(b.c)===2?'Invitstyrkan':'Utgångskravet')+' för naturligt färgbud efter motståndarinkliv över 1NT saknar numerisk handgräns i REF. Färglängden räcker inte ensam för automatisk rättning.');
        }
      }

      if(d===1&&oppAfter.length===1&&!opener&&/^1[CD]$/.test(f)&&
         (oppAfter[0].c==='1H'||oppAfter[0].c==='1S')){
        var negativeOvercall=oppAfter[0].c;
        var partnerOpeningSuit=f[1];
        // The photographed rule gives exact four spades over 1H and at least
        // four hearts over 1S. A five-card heart suit over 1S overlaps with
        // a natural two-level response, so that case remains uncovered.
        if(b.c==='X'){
          if(h.hp<6)return {exp:'P',alt:[],why:'0–5 hp/stp: pass enligt grundregeln.',means:function(c){return c==='P'?'Pass med 0–5 hp/stp.':null},conv:'negativ dubbling'};
          if(h.L[partnerOpeningSuit]>=3)
            return NC('Stöd i partnerns öppningsfärg överlappar med den negativa dubblingen; prioriteten är inte angiven i källan.');
          if(negativeOvercall==='1H'&&h.L.S===4)
            return {exp:'X',alt:[],why:'Negativ dubbling av 1♥ visar exakt fyra spader enligt BridgePlus s. 91.',means:function(c){return c==='X'?'Exakt fyra spader.':null},conv:'negativ dubbling'};
          if(negativeOvercall==='1S'&&h.L.H===4)
            return {exp:'X',alt:[],why:'Negativ dubbling av 1♠ visar minst fyra hjärter enligt BridgePlus s. 91; här är handen fyrkorts.',means:function(c){return c==='X'?'Minst fyra hjärter.':null},conv:'negativ dubbling'};
          return NC('Den negativa dubblingen uppfyller inte den uttryckliga färglängdsvisningen på BridgePlus s. 91.');
        }
        if(h.hp>=6&&h.L[partnerOpeningSuit]<3&&
           ((negativeOvercall==='1H'&&h.L.S===4)||(negativeOvercall==='1S'&&h.L.H===4))){
          return {exp:'X',alt:[],why:negativeOvercall==='1H'?'Negativ dubbling: exakt fyra spader efter 1♥-inkliv.':'Negativ dubbling: fyra hjärter efter 1♠-inkliv.',means:function(c){return c==='X'?(negativeOvercall==='1H'?'Exakt fyra spader.':'Minst fyra hjärter.'):null},conv:'negativ dubbling'};
        }
        if(negativeOvercall==='1S'&&h.L.H>=5)
          return NC('Fem eller fler hjärter efter 1♠-inkliv överlappar negativ dubbling med naturligt 2♥; källan anger ingen prioritet.');
        return respOvercall(h,f,last,negativeOvercall,true);
      }
      if(d===1&&oppAfter.length===1&&!opener&&b.c==='X'){
        return NC('Negativ dubbling efter 1 i färg finns inte definierad i den fastställda REF-systemtexten. Den får därför inte räknas som ett automatiskt grundsystembud.');
      }
      if(d===1&&oppAfter.length===1&&opener&&b.c==='X'){
        return NC('Öppnarens dubbling efter motståndarinkliv och partnerns pass (reopenings-/stöddubbling) är inte definierad i REF-systemtexten.');
      }
      return nc('Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet.');
    }

    // Svarshandens andra bud efter 1NT-svar måste hanteras före de generella
    // reglerna för tredje/fjärde färg, annars fångas sekvensen för tidigt.
    if(!opener&&d===3&&ours[1].c==='1N'){
      var openerHandAfter1NT=H(st.hands[pt]);
      if(openerHandAfter1NT.shape==='4441')
        return responderSecondBid(h,ours[0].c,ours[1].c,ours[2].c,st.hands[pt]);
      return respAfter1NT(h,ours[0].c,ours[2].c,b.c);
    }

    if(d>=3 && /^1[CDHS]$/.test(ours[0].c)){
      var s1=ours[0].c[1], s2=ours[1].c[1];

      if(d===3 && !opener && ours[2].c === '2'+s1 && isBid(b.c) && b.c[1]!==s1 && b.c[1]!==s2 && b.c[1]!=='N'){
        if(h.hp>=13) return {exp:b.c,alt:[],why:'Fjärde färg (konstgjort): 13+ hp, utgångskrav. Berättar inget om färgen.',means:function(c){return c===b.c?'Fjärde färg (utgångskrav).':null},conv:'Fjärde färg'};
        if(h.hp>=10) return {exp:b.c,alt:[],why:'Tredje färg: 10+ hp, rondkrav. Kan bjudas med 3 kort om det är ett håll.',means:function(c){return c===b.c?'Tredje färg (rondkrav).':null},conv:'Tredje färg'};
        return NC('Tredje färg kräver minst 10 hp.', null, 'Tredje färg');
      }

      var openerShowsTwoSuits = isBid(ours[2].c) &&
        ours[2].c[1] !== s1 && ours[2].c[1] !== 'N' &&
        h.L[s1] >= 4 && h.L[ours[2].c[1]] >= 4;
      if(d===4 && opener && ours[0].c==='1C' && ours[1].c==='1D' &&
         ours[2].c==='2C' && ours[3].c==='2N' && h.stop('H')){
        return {exp:'3H',alt:[],why:'Håll i hjärter visas med 3♥ efter 1♣–1♦–2♣–2NT. Budet är utgångskrav.',
          means:function(c){return c==='3H'?'Visar hjärterhåll; utgångskrav.':null},conv:'hållvisning',soft:false};
      }
      if(d===4 && opener && ours[3].c==='2N' && openerShowsTwoSuits){
        var invitePartner=H(st.hands[pt]);
        var inviteHcp=h.hp+invitePartner.hp;
        var allStops=['C','D','H','S'].every(function(s){return h.stop(s)});
        if(allStops){
          return {exp:'3N',alt:[],why:'Öppnaren har håll i alla fyra färger och paret har '+inviteHcp+' gemensamma honnörspoäng efter 2NT-inviten. Välj 3NT framför lågfärgsutgång.',means:function(c){return c==='3N'?'Accepterar sanginvit med håll i alla färger.':null},conv:'invit i sang'};
        }
      }
      if(d===4 && opener && (ours[2].c === '2'+s1 || openerShowsTwoSuits) &&
         isBid(ours[3].c) && ours[3].c[1]!==s1 &&
         ours[3].c[1]!==s2 && ours[3].c[1]!=='N'){
         var s3 = ours[3].c[1];
         if (h.stop(s3)) {
             if (h.hp <= 14) return {exp:'2N', alt:[], why:'Håll i fjärde färgen, minimum: 2NT.', conv:'Fjärde färg'};
             return {exp:'3N', alt:[], why:'Håll i fjärde färgen, maximum: 3NT.', conv:'Fjärde färg'};
         }
         if (h.L[s2] >= 3) return {exp:lowest(s2, last), alt:[], why:'Trumfstöd i partnerns första färg.', conv:'Fjärde färg'};
         if (h.L[s1] >= 5) return {exp:lowest(s1, last), alt:[], why:'Ingen lämplig preferens; bjuder om egen femkortsfärg.', conv:'Fjärde färg'};
         return {exp:lowest(s2, last), alt:[], why:'Preferens till partnerns första färg.', conv:'Fjärde färg'};
      }
    }

    if(c1==='1N'||c1==='2N'){var k=c1==='2N'?1:0;
      if(k===1&&!opener&&d===3&&ours[1].c==='3C'&&ours[2].c==='3S'){
        var staymanOpener=H(st.hands[pt]);
        var staymanTotal=h.hp+staymanOpener.hp;
        var spadeFit=h.L.S+staymanOpener.L.S;
        var spadePoints=spadeFit>=8?partnershipPoints(h,staymanOpener,'S'):0;
        if(h.bal&&staymanTotal>=25&&spadeFit<8){
          return {exp:'3N',alt:[],why:'Balanserad svarshand och '+staymanTotal+' gemensamma honnörspoäng efter 2NT–3♣–3♠. Ingen 8-korts spaderfit; 25+ hp enligt projektregeln ger 3NT framför lågfärg.',means:function(c){return c==='3N'?'Balanserad hand och 25+ gemensamma hp: 3NT.':null},conv:'2NT-Stayman',ruleStatus:'user_confirmed'};
        }
        if(spadeFit>=8&&spadePoints>=26){
          return {exp:'4S',alt:[],why:'8-korts spaderfit och '+spadePoints+' gemensamma spelpoäng: utgång i spader.',means:function(c){return c==='4S'?'Utgång med 8-korts spaderfit.':null},conv:'2NT-Stayman'};
        }
        return NC('Efter 2NT–3♣–3♠ når paret inte en verifierad utgångsprofil för 3NT eller 4♠; fortsatt bud lämnas ej täckt.',null,'2NT-Stayman',true);
      }
      if(k===1&&opener&&d===3&&ours[1].c==='3C'&&ours[2].c==='3S'){
        var knownStaymanTotal=hp+opener.hp;
        var knownSpadeFit=h.L.S+opener.L.S;
        var knownSpadePoints=knownSpadeFit>=8?partnershipPoints(h,opener,'S'):0;
        if(h.bal&&knownStaymanTotal>=25&&knownSpadeFit<8)
          return {exp:'3N',alt:[],why:'Balanserad svarshand och '+knownStaymanTotal+' gemensamma honnörspoäng efter 2NT–3♣–3♠. Ingen 8-korts spaderfit; 25+ hp enligt projektregeln ger 3NT.',means:function(c){return c==='3N'?'Balanserad hand, 25+ gemensamma hp och ingen spaderfit: 3NT.':null},conv:'2NT-Stayman',ruleStatus:'user_confirmed'};
        if(knownSpadeFit>=8&&knownSpadePoints>=26)
          return {exp:'4S',alt:[],why:'8-korts spaderfit och '+knownSpadePoints+' gemensamma spelpoäng: 26+ ger utgång i spader.',means:function(c){return c==='4S'?'Utgång med 8-korts spaderfit och 26+ gemensamma spelpoäng.':null},conv:'2NT-Stayman'};
        return NC('Efter 2NT–3♣–3♠ når paret inte 26 poäng för 3NT/4♠ eller saknar nödvändig form. Situationen lämnas ej täckt.',null,'2NT-Stayman',true);
      }
      if(c1==='1N'&&!opener&&d===2){
        var opening=prior.filter(function(x){return x.s===pt&&isBid(x.c)&&/^1[CDHS]$/.test(x.c)})[0];
        var openerRebid=prior.filter(function(x){return x.s===pt&&isBid(x.c)&&x!==opening}).slice(-1)[0];
        if(opening&&openerRebid)return respAfter1NT(h,opening.c,openerRebid.c,b.c);
      }
      if(!opener&&d===1)return ntResp(h,k,st.hands[pt]);
      if(opener&&d===2)return ntOpener(h,k,ours[1].c,st.hands[pt]);
      if(!opener&&d===3&&!k){var m1=ours[1].c,rep=ours[2].c;
        if(m1==='2C')return stay2(h,rep,st.hands[pt]);
        if(m1==='2D'&&rep==='2H')return transfer2(h,'H');
        if(m1==='2H'&&rep==='2S')return transfer2(h,'S');
        if(m1==='2S'&&rep==='2N'){
          if(h.L.C===h.L.D)return NC('Efter 1NT–2♠–2NT har svarshanden lika lång ♣ och ♦. Nordisk standard anger 3 lågfärg som slutbud men ingen prioritet vid lika längd; lämnas EJ TÄCKT.',T({'3C':'Möjligt slutbud i ♣; lika långa lågfärger saknar källbelagd prioritet.','3D':'Möjligt slutbud i ♦; lika långa lågfärger saknar källbelagd prioritet.'}),'1NT-svar',true);
          var mc=h.L.C>h.L.D?'3C':'3D';
          return {exp:mc,alt:[],why:'Bjud den längre lågfärgen som slutbud efter 2NT-reläsvar.',means:T({'3C':'Slutbud i ♣.','3D':'Slutbud i ♦.'}),conv:'1NT-svar'};
        }
        if(m1==='2S'&&rep==='3C'){
          if(h.L.C===h.L.D)return NC('Efter 1NT–2♠–3♣ har svarshanden lika lång ♣ och ♦. Källan anger pass eller 3♦ som slutbud men ingen prioritet vid lika längd; lämnas EJ TÄCKT.',T({P:'Möjligt slutbud i 3♣; lika långa lågfärger saknar källbelagd prioritet.','3D':'Möjligt slutbud i 3♦; lika långa lågfärger saknar källbelagd prioritet.'}),'1NT-svar',true);
          var e=h.L.C>h.L.D?'P':'3D';
          return {exp:e,alt:[],why:e==='P'?'Svarshandens klöver är längre: passar på 3♣.':'Svarshandens ruter är längre: korrigerar till 3♦.',means:T({P:'Slutbud: pass.','3D':'Slutbud i ♦.'}),conv:'1NT-svar'};
        }
      }
      if(opener&&d===4&&!k){
        var t1=ours[1].c,t2=ours[2].c;
        // A responder's new suit on the 3-level is game-forcing. Route
        // opener's next decision through the general extra-length/NT logic.
        if((t1==='2D'&&t2==='2H'||t1==='2H'&&t2==='2S'||t1==='2C'&&(t2==='2H'||t2==='2S'))&&
           /^3[CD]$/.test(ours[3].c))
          return ntOpener3(h,t1,t2,ours[3].c,st.hands[pt]);
        // 3NT valde utgång efter överföring
        if((t1==='2D'&&t2==='2H'&&ours[3].c==='3N')||(t1==='2H'&&t2==='2S'&&ours[3].c==='3N')){
            return ntOpener3NTChoice(h, t1==='2D'?'H':'S');
        }
        if((t1==='2D'&&t2==='2H'&&ours[3].c==='4H')||(t1==='2H'&&t2==='2S'&&ours[3].c==='4S')){
            return {exp:'P',alt:[],why:'4 i överföringsfärgen är slutbud/signoff enligt Nordisk standard s. 5. Öppnaren passar.',means:function(c){return c==='P'?'Pass efter svarshandens signoff i 4M.':null},conv:'överföring'};
        }
        if((t1==='2D'&&t2==='2H')||(t1==='2H'&&t2==='2S'))return ntOpenerInvit(h,t1==='2D'?'H':'S',ours[3].c,st.hands[pt]);
        return ntOpener3(h,ours[1].c,ours[2].c,ours[3].c,st.hands[pt]);
      }
      return nc('Fortsättningen i 1NT/2NT-systemet beskrivs inte i dokumentet.');
    }
    if(c1==='2C'){
      if(!opener&&d===1)return resp2c(h);
      if(opener&&d===2)return reb2c(h,ours[1].c);
      if(!opener&&d===3){
        var rb=ours[2].c;
        if(rb==='2N'){
          if(h.L.H>=5&&h.L.S>=5)
            return NC('Efter 2♣–2♦–2NT har svarshanden 5-5 i högfärgerna. Lathunden s. 25 anger överföringarna men ingen prioritet mellan två möjliga överföringsfärger; lämnas ej täckt.',null,'2NT-system',true);
          if(h.L.C>=6||h.L.D>=6||(h.L.C>=5&&h.L.D>=5))
            return NC('Efter 2♣–2♦–2NT har svarshanden lång eller tvåfärgad lågfärg. Lathunden s. 25 hänvisar lågfärgsfrågan till PRO och slaminviterna till Slam; dessa externa grenar är inte antagna.',null,'2NT-system',true);
          return ntResp(h,1);
        }
        return resp2c2(h,rb,ours[1].c);
      }
      if(opener&&d===4&&ours[1].c==='2D'){
        if(ours[2].c==='2N')
          return ntOpener(h,1,ours[3].c,st.hands[pt]);
        return openerThirdAfter2c(h,ours[2].c,ours[3].c);
      }
      if(!opener&&d===5&&ours[1].c==='2D'&&ours[2].c==='2N'){
        if(ours[3].c==='3C')return responderAfter2c2ntStayman(h,ours[4].c);
        if(ours[3].c==='3D'&&ours[4].c==='3H')return responderAfter2c2ntTransfer(h,'H');
        if(ours[3].c==='3H'&&ours[4].c==='3S')return responderAfter2c2ntTransfer(h,'S');
      }
      if(!opener&&d>=4&&ours[1].c==='2D'&&ours[2].c==='2N')
        return NC('2♣–2♦–2NT använder samma 2NT-system enligt Lathunden s. 24–25. PRO-lågfärgsfrågan, Slam-fortsättningar och övriga sekvenser är inte automatiskt antagna; lämnas ej täckta.',null,'2♣-system / 2NT-system',true);
      return nc('Fortsättningen i 2♣-systemet beskrivs inte i dokumentet.');
    }
    if(/^2[DHS]$/.test(c1)){
      if(!opener&&d===1)return resp2w(h,c1,st.hands[pt]);
      if(opener&&d===2)return open2w(h,c1,ours[1].c);
      return nc('Fortsättningen efter svag tvåa beskrivs inte i dokumentet.');
    }
    if(/^[34][CDHS]$/.test(c1)){
      if(!opener&&d===1){
         if(b.c==='3N') return {exp:'3N', alt:[], why:'3NT med håll i sidofärgerna.', conv:'spärr'};
         if(isBid(b.c) && b.c[1]!==c1[1] && b.c[1]!=='N') return {exp:b.c, alt:[], why:'Ny färg: rondkrav, 5+ kort.', conv:'spärr'};
         if(isBid(b.c) && st_(b.c)===st_(c1)) return {exp:b.c, alt:[], why:'Höjning av spärren (spärrhöjning).', conv:'spärr'};
      }
      return nc('Fortsättningen efter spärrbud beskrivs inte i dokumentet.');
    }
    if(/^1[CDHS]$/.test(c1)){
      // Alla svar på 1 i färg går genom trumfstödets huvudmodul.
      // Den avgör mellan splinter, Stenberg och ordinarie färgsvar.
      if(!opener&&d===1)return trumfstod.responder(h,c1);
      if(opener&&d===2&&ours[1].c==='2N')
        return trumfstod.openerSecondBid(h,c1,ours[1].c,st.hands[pt]?H(st.hands[pt]):null);
      if(!opener&&d===3&&ours[1].c==='2N')
        return trumfstod.responderContinuation(h,c1,b.c,st.hands[pt]?H(st.hands[pt]):null,
          prior,rkcTrumpFromAuction,side(me),me);
      // Efter 1♦–1♥–2♠ är 2♠ öppnarens reverse och SH ska
      // höja till 4♠ med minst 8-korts fit och 26+ gemensamma spelpoäng.
      if(!opener&&d===2&&c1==='1H'&&b.c==='4S'){
        var partnerCalls=prior.filter(function(x){return x.s===pt&&x.c!=='P'&&isBid(x.c)});
        var partnerRebid=partnerCalls.length>1?partnerCalls[1].c:null;
        var ph=H(st.hands[pt]),fitS=h.L.S+ph.L.S;
        var totalS=partnershipPoints(h,ph,'S');
        if(partnerRebid==='2S'&&fitS>=8&&totalS>=26){
          return {exp:'4S',alt:[],why:'Reverse 1♦–1♥–2♠. Minst 8-korts spaderfit och '+totalS+' gemensamma spelpoäng (26+): SH ska bjuda 4♠.',means:function(c){return c==='4S'?'Utgång i ♠: minst 8-korts fit och 26+ gemensamma spelpoäng.':null},conv:'reverse och utgång'};
        }
      }
      if(!opener&&d===3){
        var openerHand=st.hands[pt];
        return responderSecondBid(h,ours[0].c,ours[1].c,ours[2].c,openerHand);
      }
      if(opener&&d===4&&ours[0].c==='1H'&&ours[1].c==='1S'&&ours[2].c==='2D'&&ours[3].c==='2N')
        return openerThirdAfterTwoSuitInvite(h,ours[0].c,ours[1].c,ours[2].c,ours[3].c);
      if(opener&&d===2)return trumfstod.openerSecondBid(h,c1,ours[1].c,st.hands[pt]);
      return nc('Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet.');
    }
    return nc('Okänd budgivning.');
  }



  return {nodeForRaw:nodeForRaw};
});
