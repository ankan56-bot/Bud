/*
 * Fristående export av rättningsmotorn/beslutsträdet.
 * Källa: Budtraning.html, feature/two-player-dds.
 * Användning: Rattning.judge({hands, dealer, bids})
 *
 * Ändringar i version 4.8 (Uppdaterade utgångströsklar):
 * - Öppningsfärg: 4-4 prioriterar H > S > C > D. 5-5 prioriterar S > H > D > C.
 * - Buggfix: Motståndarinblandning efter 1NT kraschar inte längre (c1 deklarerad tidigare).
 * - 3NT efter överföring ("Välj utgång") kräver nu jämn hand (h.bal) för att vara rätt.
 * - Fixat: Öppningshandens svar på 3NT-valet (passar eller bjuder 4M).
 *
 * Rensad version: inledande chattext och kodstaket borttagna. Rättningar utöver detta:
 * - isBid använde /^[1-7]$/ och kände därför inte igen något bud: nu /^[1-7][CDHSN]$/.
 * - transfer2 refererade till okänd variabel b (ReferenceError): raderna borttagna.
 * - judge() tappade förklaring/motivering/konvention i resultatet: bevaras nu (hp/htp/langd läggs till).
 * - Lagt till module.exports längst ned.
 */
var Rattning = (function(){
  var SU = ['C','D','H','S'], SYM = {C:'♣',D:'♦',H:'♥',S:'♠',N:'NT'}, NAME = {N:'Norr',E:'Öst',S:'Syd',W:'Väst'};
  function side(s){return s==='N'||s==='S'?0:1}
  function partner(s){return {N:'S',S:'N',E:'W',W:'E'}[s]}
  function isBid(c){return /^[1-7][CDHSN]$/.test(c)}
  function lv(c){return +c[0]} function st_(c){return c[1]}
  function rk(c){return lv(c)*5+'CDHSN'.indexOf(c[1])}
  function txt(c){return c==='P'?'Pass':(c==='X'||c==='XX')?c:c[0]+SYM[c[1]]}
  function maj(s){return s==='H'||s==='S'}
  function lowest(s,above){for(var l=1;l<=7;l++){var c=l+s;if(!above||rk(c)>rk(above))return c}return null}
  function jump(s,above){var c=lowest(s,above);return c&&lv(c)<7?(lv(c)+1)+s:null}

  // Poängberäkningen ligger i en separat modul; regelbeteendet är oförändrat.
  var scoring=(typeof module!=='undefined'&&module.exports)
    ? require('./poangberakning.js')
    : (typeof window!=='undefined'?window.RattningPoang:null);
  if(!scoring) throw new Error('poangberakning.js måste laddas före rattningsmotor.js');
  var H=scoring.H, handHps=scoring.handHps, partnershipPoints=scoring.partnershipPoints;

  function T(m){return function(c){return m[c]||null}}
  function ok(c,last){return c==='P'||c==='X'||c==='XX'||(isBid(c)&&(!last||rk(c)>rk(last)))}
  function NC(why,means,conv,sourceGap){return {exp:null,alt:[],why:why||'Situationen beskrivs inte i dokumentet.',means:means||function(){return null},conv:conv||'övrigt',sourceGap:!!sourceGap}}

  // Regelområdena laddas som separata moduler och får explicita beroenden.
  var sharedApi={SU:SU,SYM:SYM,NAME:NAME,side:side,partner:partner,isBid:isBid,lv:lv,st_:st_,rk:rk,txt:txt,maj:maj,lowest:lowest,jump:jump,H:H,handHps:handHps,partnershipPoints:partnershipPoints,T:T,ok:ok,NC:NC};
  var oneResponseFactory=(typeof module!=='undefined'&&module.exports)?require('./ettoppningssvar.js'):window.RattningEttOppningsSvarFactory;
  var oneResponse=oneResponseFactory(sharedApi);
  var majorFactory=(typeof module!=='undefined'&&module.exports)?require('./hogfargsbudgivning.js'):window.RattningHogfargFactory;
  var minorFactory=(typeof module!=='undefined'&&module.exports)?require('./lagfargsbudgivning.js'):window.RattningLagfargFactory;
  var majorBidding=majorFactory(sharedApi,oneResponse), minorBidding=minorFactory(sharedApi,oneResponse);

  var twoClubFactory=(typeof module!=='undefined'&&module.exports)?require('./2kloversoppning.js'):window.Rattning2KloverFactory;
  var weakTwoFactory=(typeof module!=='undefined'&&module.exports)?require('./svaga2oppningar.js'):window.RattningSvagaTvaFactory;
  var overcallFactory=(typeof module!=='undefined'&&module.exports)?require('./inkliv.js'):window.RattningInklivFactory;
  var doubleFactory=(typeof module!=='undefined'&&module.exports)?require('./dubbling.js'):window.RattningDubblingFactory;
  var twoClub=twoClubFactory(sharedApi), weakTwo=weakTwoFactory(sharedApi),
      overcalls=overcallFactory(sharedApi), doubles=doubleFactory(sharedApi);
  var resp2c=twoClub.resp2c, reb2c=twoClub.reb2c, resp2c2=twoClub.resp2c2,
      resp2w=weakTwo.resp2w, open2w=weakTwo.open2w,
      overcall=overcalls.overcall, respOvercall=overcalls.respOvercall,
      respDouble=doubles.respDouble;

  var sangFactory=(typeof module!=='undefined'&&module.exports)?require('./sangbudgivning.js'):window.RattningSangFactory;
  var stordFactory=(typeof module!=='undefined'&&module.exports)?require('./stordbudgivning.js'):window.RattningStordFactory;
  var sang=sangFactory(sharedApi), stord=stordFactory(sharedApi);
  var slamFactory=(typeof module!=='undefined'&&module.exports)?require('./slamlogik.js'):window.RattningSlamFactory;
  var slam=slamFactory(sharedApi);
  var regelFactory=(typeof module!=='undefined'&&module.exports)?require('./regelkontroll.js'):window.RattningRegelkontrollFactory;
  var regel=regelFactory(sharedApi);
  var nextSeat=regel.nextSeat, validSeat=regel.validSeat, validateAuction=regel.validateAuction,
      missedGameOrSlam=regel.missedGameOrSlam;
  var rkcTrumpFromAuction=slam.rkcTrumpFromAuction, agreedNoTrumpAceAsk=slam.agreedNoTrumpAceAsk,
      agreedQuantitativeNoTrumpInvite=slam.agreedQuantitativeNoTrumpInvite, rkcReply=slam.rkcReply,
      rkcNextStep=slam.rkcNextStep, slamProhibitionFromAuction=slam.slamProhibitionFromAuction;
  var ntResp=sang.ntResp, ntOpener=sang.ntOpener, stay2=sang.stay2, transfer2=sang.transfer2,
      ntOpenerInvit=sang.ntOpenerInvit, ntOpener3=sang.ntOpener3, ntOpener3NTChoice=sang.ntOpener3NTChoice;
  var respAfter1NT=stord.respAfter1NT, responderSecondBid=stord.responderSecondBid;

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
    if(h.bal&&hp>=22&&hp<=27){exp='2C';why='Balanserad med '+hp+' hp: 2♣ (22-24 balanserad, starkare via 2♣).'}
    else if(h.bal&&hp>=20&&hp<=21){exp='2N';why='Balanserad 20-21 hp öppnas 2NT.'}
    else if(h.bal&&hp>=15&&hp<=17){exp='1N';why='Balanserad (fördelning '+h.shape+') med 15-17 hp öppnas 1NT.'}
    else if(hp>=22){exp='2C';why=hp+' hp är utgångskrav: öppna 2♣.'}
    else if(hp>=20){exp='2C';alt=[one];why=hp+' hp obalanserad är starkare än 1 i färg (12-19): 2♣, utgångskrav.'}
    else if(hp>=12){exp=one;why=hp+' hp med längsta färgen '+SYM[pick]+' ('+L[pick]+' kort): 1 i färg (12-19 hp).'}
    else if(hp===11&&(fourthHandAfterThreePasses||h.goodForEleven(pick))){exp=one;alt=['P'];why=fourthHandAfterThreePasses?'Fjärde hand efter tre pass: 11 hp räcker för öppning utan särskilt färgkvalitetskrav.':'11 hp med bra färg: 6 kort och minst 3 honnörer eller 7 kort och minst 2 honnörer. 1 i färg är tillåtet; pass är också möjligt.'}
    else if(hp>=6&&hp<=10&&m>=6){
      if(m===6&&pick!=='C'&&h.goodForWeakTwo(pick)){exp='2'+pick;why='6-10 hp och exakt 6-korts '+SYM[pick]+' med bra kvalitet (2 honnörer eller 1 honnör + 2 av 10-9-8): svag tvåa.'}
      else if(m===6&&pick!=='C'&&!h.goodForWeakTwo(pick)){exp='P';why='6-10 hp och 6-korts '+SYM[pick]+' men för dålig färgkvalitet för svag tvåa: pass.'}
      else if(m===6){exp='P';why='Med 6-korts ♣ finns ingen svag tvåa (2♣ är starkt). Pass.'}
      else if(m===7){exp='3'+pick;alt=['4'+pick];why='7-korts färg med 6-10 hp: spärrbud 3 i färg.'}
      else {exp='4'+pick;alt=['3'+pick];why='8-korts färg med 6-10 hp: spärrbud 4 i färg.'}
    }
    else{exp='P';why=hp+' hp räcker inte för öppning (12+, 11 med bra färg) och ingen spärrhand.'}
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
      var partnerRkcReply=/^5[CDHS]$/.test(lastCall.c)&&prior.some(function(x){return x.s===me&&x.c==='4N'})&&!!rkcTrumpFromAuction(prior,side(me));
      if(partnerHasGame&&!partnerHasRkcAsk&&!partnerHasFourAceAsk&&!partnerHasQuantitativeInvite&&!partnerRkcReply)return {exp:'P',alt:[],why:'Partnern har redan bjudit utgång. Pass avslutar budgivningen om inte styrkan motiverar slam.',means:function(c){return c==='P'?'Pass efter partnerns utgångsbud.':null},conv:'slutbud'};
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
    if(ours.length&&ours[ours.length-1].s===me&&!weakMinorRelayFinalPass)
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

    var trumpForSide=rkcTrumpFromAuction(prior,side(me));
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
      return NC('4NT utan fastställd trumf är inte automatiskt essfråga. I andra sangsekvenser behandlas 4NT som kvantitativt eller enligt parets särskilda överenskommelse.');
    }

    var partnerAskIndex=-1;
    for(var pai=prior.length-1;pai>=0;pai--)if(prior[pai].s===pt&&prior[pai].c==='4N'){partnerAskIndex=pai;break;}
    if(partnerAskIndex>=0){
      var afterPartnerAsk=prior.slice(partnerAskIndex+1).filter(function(x){return x.s===me&&isBid(x.c)});
      if(!afterPartnerAsk.length){
        var partnerAskTrump=rkcTrumpFromAuction(prior,side(me));
        var partnerAskFour=agreedNoTrumpAceAsk(prior,side(me));
        if(partnerAskTrump||partnerAskFour)
          return rkcReply(h,partnerAskTrump);
        if(agreedQuantitativeNoTrumpInvite(prior,side(me)))
          return NC('Partnerns 4NT är en kvantitativ invit till 6NT efter 2NT-öppning, inte en essfråga. Öppnarens accept/pass-gräns är inte fastställd här; använd inte ess-/nyckelkortssvar.',null,'Kvantitativ sanginvit',true);
        return NC('Partnerns 4NT har ingen fastställd trumf och sekvensen är inte en uttryckligen avtalad fyr-essfråga enligt Nordisk standard. Svaret lämnas ej täckt.');
      }
      // Svarshanden har redan svarat; efter frågeställarens sangslutbud ska den passa.
      if(b.c==='P')return {exp:'P',alt:[],why:'Pass efter att frågeställaren har fastställt sangslutbudet.',means:function(c){return c==='P'?'Pass.':null},conv:'Fyr-essfråga utan trumf'};
    }
    var myAskIndex=-1;
    for(var mai=prior.length-1;mai>=0;mai--)if(prior[mai].s===me&&prior[mai].c==='4N'){myAskIndex=mai;break;}
    if(myAskIndex>=0){
      var afterMyAsk=prior.slice(myAskIndex+1).filter(function(x){return x.s===pt&&isBid(x.c)});
      if(afterMyAsk.length){
        var response=afterMyAsk[0].c;
        var myAskTrump=rkcTrumpFromAuction(prior,side(me));
        var myAskIsAgreed=myAskTrump||agreedNoTrumpAceAsk(prior,side(me));
        if(!myAskIsAgreed)return NC('4NT-sekvensen är inte en verifierad essfråga enligt Nordisk standard; fortsättningen lämnas ej täckt.');
        if(isBid(b.c) && /^([56][CDHSN])$/.test(b.c))return rkcNextStep(h,myAskTrump,response);
        if(b.c==='P' && (last==='6N'||last==='7N'))return {exp:'P',alt:[],why:'Pass efter fastställt slutbud.',means:function(c){return c==='P'?'Pass.':null},conv:'Fyr-essfråga utan trumf'};
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
        if(m1==='2S'&&rep==='2N'){var mc=h.L.C>=h.L.D?'3C':'3D';return {exp:mc,alt:[],why:'Bjud din långa lågfärg på 3-nivå som slutbud.',means:T({'3C':'Slutbud i ♣.','3D':'Slutbud i ♦.'}),conv:'1NT-svar'}}
        if(m1==='2S'&&rep==='3C'){var e=h.L.C>=h.L.D?'P':'3D';return {exp:e,alt:[],why:e==='P'?'Du har ♣ som lågfärg: pass.':'Du har ♦ som lågfärg: 3♦.',means:T({P:'Slutbud: pass.','3D':'Slutbud i ♦.'}),conv:'1NT-svar'}}
      }
      if(opener&&d===4&&!k){
        var t1=ours[1].c,t2=ours[2].c;
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
      if(!opener&&d===3){var rb=ours[2].c;if(rb==='2N')return ntResp(h,1);return resp2c2(h,rb,ours[1].c)}
      // Efter 2♣–2♦–3♣–3♦ är 3♦ Herbertavslag.
      // Öppningshanden ska då välja sin bästa sidofärg, inte passa.
      if(opener&&d===4&&ours[1].c==='2D'&&ours[2].c==='3C'&&ours[3].c==='3D'){
        var sideSuits=['H','S','D'].filter(function(s){return h.L[s]>=4;});
        sideSuits.sort(function(a,b){
          if(h.L[b]!==h.L[a])return h.L[b]-h.L[a];
          if(h.good(b)!==h.good(a))return h.good(b)?1:-1;
          return ['H','S','D'].indexOf(a)-['H','S','D'].indexOf(b);
        });
        var best=sideSuits[0]||'C';
        var rebid=sideSuits.length?'3'+best:'4C';
        return {exp:rebid,alt:[],why:'3♦ är Herbertavslag efter 3♣. Öppningshanden väljer sin bästa sidofärg ('+(sideSuits.length?SYM[best]:'ingen sidofärg med 4+ kort; återbud i ♣')+') och får inte passa.',means:function(c){return c===rebid?'Öppningshandens färgval efter Herbertavslag.':null},conv:'2♣-system / Herbert'};
      }
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
      if(!opener&&d===1)return maj(st_(c1))?majorBidding.respond(h,c1):minorBidding.respond(h,c1);
      if(opener&&d===2)return maj(st_(c1))?majorBidding.rebid(h,c1,ours[1].c,st.hands[pt]):minorBidding.rebid(h,c1,ours[1].c,st.hands[pt]);
      return nc('Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet.');
    }
    return nc('Okänd budgivning.');
  }


  // Säkerhetskontroll: rekommendationen får aldrig ligga på eller under
  // det högsta kontraktsbud som redan har lagts i auktionen.
  // Om partnern redan har nått den föreslagna nivån ska svaret vara pass,
  // inte ett olagligt återbud eller ett upprepat kontraktsbud.
  // Auction-only guard: no hidden hand information is used here.
  function decideLive(input){
    input=input||{};
    var seat=input.seat,dealer=input.dealer,auction=input.auction||[],ownHand=input.ownHand;
    if(!validSeat(seat)||!validSeat(dealer))
      return NC('Livebeslut kräver giltig plats och givare.','', 'live');
    if(!Array.isArray(ownHand)||ownHand.length!==13)
      return NC('Livebeslut kräver exakt 13 egna kort.','', 'live');
    var cardSet={};
    for(var ci=0;ci<ownHand.length;ci++){
      var card=ownHand[ci];
      if(typeof card!=='string'||! /^[CDHS](?:[2-9]|1[0-4])$/.test(card)||cardSet[card])
        return NC('Den egna handen innehåller ogiltiga eller dubblerade kort.','', 'live');
      cardSet[card]=true;
    }
    if(!Array.isArray(auction))
      return NC('Budhistoriken måste vara en lista.','', 'live');
    var expected=dealer;
    for(var ai=0;ai<auction.length;ai++){
      var call=auction[ai];
      if(!call||call.s!==expected||!validSeat(call.s)||
         !(call.c==='P'||call.c==='X'||call.c==='XX'||isBid(call.c)))
        return NC('Budhistoriken är ogiltig eller turordningen stämmer inte.','', 'live');
      expected=nextSeat(expected);
    }
    if(expected!==seat)
      return NC('Det är inte den angivna spelarens tur enligt den offentliga budhistoriken.','', 'live');
    if(auction.length>=4&&auction.slice(-4).every(function(x){return x.c==='P';}))
      return NC('Budgivningen är redan avslutad efter fyra pass.','', 'live');
    var nonPass=auction.filter(function(x){return x.c!=='P';});
    var openingCall=nonPass[0]||null;
    var isOpeningDecision=nonPass.length===0;
    var isOneNTFamily=!!openingCall&&openingCall.c==='1N'&&
      side(openingCall.s)===side(seat)&&
      auction.every(function(x){
        if(side(x.s)!==side(seat))return x.c==='P';
        return x.c==='P'||x.c==='1N'||
          ['2C','2D','2H','2S','2N','3C','3D','3H','3S','3N','4C','4D','4H','4S','4N'].indexOf(x.c)>=0;
      })&&nonPass.every(function(x){return x.c!=='X'&&x.c!=='XX';});
    if(!isOpeningDecision&&!isOneNTFamily)
      return NC('Den här budsekvensen ingår ännu inte i den informationssäkra livebedömningen. Öppning efter pass och ostörd 1NT-familj är aktiverade; andra sekvenser lämnas ej täckta.','', 'live');
    var bids=auction.concat([{s:seat,c:'P'}]);
    var st={hands:{}};st.hands[seat]=ownHand.slice();st.dealer=dealer;st.bids=bids;
    var node;
    try{node=nodeForRaw(st,bids.length-1);}
    catch(e){return NC('Livebeslut stoppades säkert: '+e.message,'','live');}
    if(!node||!node.exp)
      return NC(node&&node.why||'Öppnings-/1NT-läget är inte täckt utan partnerns dolda hand.','', 'live');
    return {
      exp:node.exp,
      alt:(node.alt||[]).slice(),
      why:node.why||'',
      conv:node.conv||'öppning',
      means:node.means,
      soft:!!node.soft,
      sourceGap:!!node.sourceGap,
      ruleStatus:node.ruleStatus||null,
      context:'live',
      informationBoundary:'own_hand_and_public_auction_only'
    };
  }

  function nodeFor(st,i){
    var node=nodeForRaw(st,i);

    // Samma poänggränser ska styra både rekommendationen och rättningen.
    // Kontrollera missad utgång/slam när rålogiken saknar nod eller föreslår pass.
    // En explicit exp:null betyder däremot att systemregeln inte är täckt och får inte skrivas över.
    var priorPartnershipCalls=st&&st.bids?st.bids.slice(0,i).filter(function(x){return x&&isBid(x.c)&&side(x.s)===side(st.bids[i].s)}).length:0;
    // Generic missed-game/ slam rescue must not override an explicit RKC
    // response or the deliberately uncovered continuation after that reply.
    var hasRkcContext=!!(st&&st.bids&&st.bids.slice(0,i).some(function(x){return x&&x.c==='4N'&&side(x.s)===side(st.bids[i].s)})&&rkcTrumpFromAuction(st.bids.slice(0,i),side(st.bids[i].s)));
    var highestBefore=null;
    if(st&&st.bids)st.bids.slice(0,i).forEach(function(x){if(x&&isBid(x.c)&&(!highestBefore||rk(x.c)>rk(highestBefore)))highestBefore=x.c;});
    var rawIllegal=!!(node&&node.exp&&isBid(node.exp)&&highestBefore&&rk(node.exp)<=rk(highestBefore));
    if(st&&st.bids&&st.bids[i]&&!hasRkcContext&&priorPartnershipCalls>=2&&
       (!node||(!node.exp&&!node.sourceGap)||node.exp==='P'||rawIllegal)){
      var contractBefore=null,sideBefore=null;
      for(var ci=0;ci<i;ci++){
        if(st.bids[ci]&&isBid(st.bids[ci].c)){
          contractBefore=st.bids[ci].c;
          sideBefore=side(st.bids[ci].s);
        }
      }
      var analysisBids=st.bids.slice();
      analysisBids[i]={s:st.bids[i].s,c:'P'};
      var missed=missedGameOrSlam(st,analysisBids,i,contractBefore,sideBefore);
      if(missed){
        node={
          exp:missed.target,
          alt:[],
          why:missed.why,
          means:function(c){return c===missed.target?'Utgång eller slam enligt partnerskapets poänggränser.':null},
          conv:'missad utgång/slam',
          soft:false
        };
      }
    }
    var slamBlockReason=st&&st.bids&&st.bids[i]
      ?slamProhibitionFromAuction(st.bids,i,side(st.bids[i].s)):null;
    if(slamBlockReason){
      var actualCall=st.bids[i].c;
      if(isBid(actualCall)&&lv(actualCall)>=6){
        return {exp:null,slamBlocked:true,why:slamBlockReason};
      }
      if(node&&node.exp&&isBid(node.exp)&&lv(node.exp)>=6){
        return {exp:null,slamBlocked:true,why:slamBlockReason};
      }
    }
    if(!node||!node.exp||!isBid(node.exp))return node;
    var highest=null;
    (st.bids||[]).slice(0,i).forEach(function(x){
      if(x&&isBid(x.c)&&(!highest||rk(x.c)>rk(highest)))highest=x.c;
    });
    if(highest&&rk(node.exp)<=rk(highest)){
      var rejected=node.exp;
      var priorMeans=typeof node.means==='function'?node.means:null;
      return {
        exp:'P',
        alt:[],
        why:'Det ursprungliga förslaget '+txt(rejected)+' är inte längre lagligt eftersom kontraktsbudet '+txt(highest)+' redan har lagts. Passas i stället; budmotorn får inte rekommendera ett lägre eller upprepat kontraktsbud.',
        means:function(c){
          if(c==='P')return 'Pass när partnerns eller motståndarnas tidigare kontraktsbud redan ligger över det föreslagna budet.';
          return priorMeans?priorMeans(c):null;
        },
        conv:node.conv||'budordning',
        soft:false
      };
    }
    if(node.alt&&node.alt.length){
      node.alt=node.alt.filter(function(c){
        return !isBid(c)||!highest||rk(c)>rk(highest);
      });
    }
    return node;
  }

  function expandedMeaning(short,conv,act){
    var extra={
      'öppning':'Öppningsbudet beskriver öppningshandens styrka och fördelning. Vid 4-4 öppnas H>S>C>D. Vid 5-5 öppnas S>H>D>C.',
      'svar':'Svarshanden beskriver sin styrka och fördelning. En ny färg på 1-nivån visar minst 6 hp och minst 4 kort samt är rondkrav. En ny färg på 2-nivån visar minst 11 hp och minst 4 kort samt är rondkrav.',
      'Stenberg':'Stenberg 2NT visar minst 13 htp och minst 4 korts stöd i öppningsfärgen. Det är utgångskrav.',
      'Stayman':'Stayman är högfärgsfråga efter sangöppning. 2♣ frågar efter 4-korts högfärg; öppnaren svarar 2♦ utan 4+ högfärg, 2♥ med 4–5 hjärter och 2♠ med 4–5 spader.',
      'överföring':'Överföringsbudet visar minst 5 kort i den angivna högfärgen. 3NT visar jämn hand och exakt 5 kort (välj utgång). 4C/4D är kontrollbud. 4NT är RKC.',
      '1NT-svar':'Efter 1NT används systemets särskilda svar: Stayman för att hitta högfärgsfit, överföring med minst 5-korts högfärg, naturlig invit med balanserad hand eller slutbud.',
      '2♣-system':'Öppning 2♣ är utgångskrav eller 22-24 hp balanserad. Svarshanden bjuder alltid 2♦ (väntebud). Därefter beskriver öppnaren sin hand. Vid 26 hp bjuds utgång (3NT/4M/5m), vid 33 hp bjuds 4NT (essfråga).',
      'Herbert':'Herbertavslag är det närmaste tillgängliga budet efter 2♣–2♦–2M. Det visar 0–5 hp och säger i sig inget om den färg som bjuds.',
      'svag tvåa':'En svag tvåöppning visar 6–10 hp och exakt 6 kort i ♦ eller högfärg, med bra färgkvalitet (2 honnörer eller 1 honnör + 2 av 10-9-8). 3 i öppningsfärgen är invit (14-16 stp), 2NT är invit (9-10 hp).',
      'öppnarens 2:a bud':'Öppnarens andra bud preciserar styrka och fördelning efter svarshandens första bud.',
      'RKC':'RKC är essfråga. När trumf är fastställd räknas fyra ess plus trumfkungen som femte ess.',
      'RKC 1430':'RKC 1430 används när trumf är fastställd. 5♣ = 1 eller 4 nyckelkort, 5♦ = 0 eller 3, 5♥ = 2 utan trumfdam, 5♠ = 2 med trumfdam.',
      'Fyr-essfråga utan trumf':'Nordisk standard s. 7: i de uttryckligen avtalade sangsekvenserna 1NT–4NT och 1NT–2♣–2♦–4NT räknas fyra ess. 5♣ = 0 eller 4 ess, 5♦ = 1, 5♥ = 2, 5♠ = 3. Fortsättningen efter svaret är inte definierad här.',
      'inkliv':'Ett inkliv visar normalt 12–17 hp och minst 5 kort i färgen (2-nivån kräver 6 kort). 1NT-inkliv visar 15–17 hp och håll i öppningsfärgen. Vid inkliv efter 1NT stängs Stayman/överföring av. Ny färg 2-nivå = invit, 3-nivå = krav.',
      'dubbling':'Upplysningsdubbling (UD) visar minst 12 hp och 3+ kort i objudna färger. Negativ dubbling (av SH) visar 6+ hp och 4-korts objuden högfärg. Stöddubbling (av ÖH) visar exakt 3-korts stöd. Dubbelt efter 1NT-inkl = UD, invit+.',
      'svar efter 1NT':'Efter 1 i färg–1NT och öppnarens återbud finns ett uttryckligt undantag: svarshandens andra färgbud kan vara 6–9 hp och minst 6 kort, utan att vara krav.',
      'Tredje färg':'Tredje färg är ett rondkrav som lovar minst 10 hp. Det kan bjudas med bara 3 kort om det är ett håll (t.ex. D-x-x).',
      'Fjärde färg':'Fjärde färg är ett konstgjort utgångskrav som lovar minst 13 hp. Det berättar ingenting om färgen man bjuder, utan ber partnern beskriva sin hand ytterligare.',
      'spärr':'Spärrbudet visar en lång färg och begränsad styrka. Ny färg är krav. 3NT kan vara rätt slutbud om partnern har en lång lågfärg.',
      'överbud':'Överbud (Cuebid) i motståndarens färg visar 10+ hp och 3+ trumfstöd. Det är ett kravbud.',
      'hållvisning':'3♥ visar håll i hjärter efter 1♣–1♦–2♣–2NT. Budet är utgångskrav.'
    };
    var detail=extra[conv]||'Budets betydelse ska läsas tillsammans med den föregående budgivningen.';
    return short ? short+'\n\n'+detail : detail;
  }

  function verdictOf(node,act){
    var short=(typeof node.means==='function'?node.means(act):null)||'Budet ingår inte i dokumentets system i den här situationen.';
    var o={bedomning:'ej_täckt',motivering:node.why||'',forklaring:expandedMeaning(short,node.conv||'övrigt',act),konvention:node.conv||'övrigt',battre:''};
    if(node.slamBlocked){
      if(isBid(act)&&lv(act)>=6){
        o.bedomning='fel';
        o.motivering=node.why;
        o.forklaring='Slam är spärrat efter motståndarnas visade styrka/fortsättning i den här auktionen.';
        return o;
      }
      o.bedomning='ej_täckt';o.motivering=node.why;return o;
    }
    if(!node.exp){o.bedomning='ej_täckt';o.motivering=node.why;return o}
    if(act===node.exp){o.bedomning='rätt';return o}
    if(node.alt&&node.alt.indexOf(act)>=0){o.bedomning='valfritt';o.battre=txt(node.exp);return o}
    o.bedomning=node.soft?'valfritt':'fel';
    o.battre=txt(node.exp);
    if(node.soft)o.motivering='Dokumentet är inte exakt här, men huvudbudet är '+txt(node.exp)+'. '+node.why;
    return o;
  }
  function judge(st){
    var items=[],r=0,f=0,v=0,n=0;
    st.bids.forEach(function(b,i){
      if(side(b.s)===1){
        if(b.c!=='P')items.push({nr:i+1,plats:NAME[b.s],bud:txt(b.c),konvention:'motståndare',forklaring:b.e||'Motståndarens bud (robot).',bedomning:'rätt',battre:'',motivering:''});
        return;
      }
      var node;try{node=nodeFor(st,i)}catch(e){node=NC('Kunde inte bedöma budet ('+e.message+').')}
      var v_=verdictOf(node,b.c);
      var it={nr:i+1,plats:NAME[b.s],bud:txt(b.c)};for(var k in v_)it[k]=v_[k];
      if(it.bedomning==='rätt')r++;else if(it.bedomning==='fel')f++;else if(it.bedomning==='valfritt')v++;else n++;
      items.push(it);
    });
    return {items:items,summary:'Rätt '+r+' · Fel '+f+' · Valfritt '+v+' · Ej täckt '+n+' (Norr och Syd).'};
  }
  function judgeComplete(st){
    var structural=validateAuction(st), items=[],right=0,wrong=0,optional=0,uncovered=0;
    var bids=st.bids||[];
    var runningContract=null, runningSide=null;
    for(var i=0;i<bids.length;i++){
      var b=bids[i], item={nr:i+1,plats:NAME[b.s]||b.s,bud:txt(b.c)};
      var contractBefore=runningContract, sideBefore=runningSide;
      var issue=null;
      for(var j=0;j<structural.errors.length;j++)if(structural.errors[j].index===i){issue=structural.errors[j].message;break}
      if(issue){
        item.konvention='budordning';item.forklaring='Budet kan inte bedömas som en giltig del av auktionen.';
        item.bedomning='fel';item.battre='';item.motivering=issue;wrong++;
      }else if(side(b.s)===1){
        // Motståndarnas pass är redan tydliga i budgivningen; visa ingen tom rättningspost.
        if(b.c!=='P'){
          item.konvention='motståndare';item.forklaring=b.e||'Motståndarens bud (robot).';
          item.bedomning='rätt';item.battre='';item.motivering='Motståndarens bud visas som kontext och poängsätts inte.';
        }
      }else{
        var node;
        try{node=nodeFor(st,i)}catch(e){node=NC('Kunde inte bedöma budet ('+e.message+').')}
        var v=verdictOf(node,b.c);
        for(var k in v)item[k]=v[k];

        // Återhämtning efter tidigare felbud: behåll handanalysen och peka ut
        // den första avvikelsen i stället för att låta följdbuden se ut som
        // om handen/analysen saknas.
        if(!node.exp){
          var firstDeviation=null;
          for(var ri=0;ri<items.length;ri++){
            var prev=items[ri];
            if((prev.plats==='Norr'||prev.plats==='Syd') && prev.bedomning==='fel' && prev.battre){
              firstDeviation=prev;break;
            }
          }
          if(firstDeviation){
            item.konvention='avvikelse efter tidigare felbud';
            item.motivering='Handen är fortfarande identifierad och analyserad, men den fortsatta budsekvensen kan inte bedömas säkert efter avvikelsen vid bud '+firstDeviation.nr+'. Där rekommenderades '+firstDeviation.battre+'. Rätta först det budet; därefter kan fortsättningen bedömas på nytt.';
            item.forklaring='Följdbudet ligger utanför den förväntade budvägen eftersom ett tidigare bud avvek. Detta betyder inte att handen saknas i systemet.';
            item.battre=firstDeviation.battre;
          }
        }
        var missed=missedGameOrSlam(st,bids,i,contractBefore,sideBefore);
        if(missed){
          item.bedomning='fel';item.battre=txt(missed.target);item.konvention='missad utgång/slam';
          item.motivering=missed.why+' Bästa teoretiska bud: '+txt(missed.target)+'.';
          item.forklaring='Pass trots att partnerskapets sammanlagda honnörsstyrka motiverar att bjuda vidare till utgång eller slam.';
        }
        if(item.bedomning==='rätt')right++;else if(item.bedomning==='fel')wrong++;else if(item.bedomning==='valfritt')optional++;else uncovered++;
      }
      if(isBid(b.c)){runningContract=b.c;runningSide=side(b.s);}
      var hand=H(st.hands[b.s]);
      var partnerHand=H(st.hands[partner(b.s)]);
      var agreed=null;
      // Stenberg 2NT visar uttryckligen stöd i öppnarens färg.
      if(node&&node.conv==='Stenberg'){
        for(var ai=0;ai<i;ai++){
          if(side(bids[ai].s)===side(b.s)&&/^1[CDHS]$/.test(bids[ai].c)){
            var candidate=bids[ai].c[1];
            if(hand.L[candidate]+partnerHand.L[candidate]>=8)agreed=candidate;
            break;
          }
        }
      }else{
        // I övriga sekvenser krävs att båda spelarna faktiskt har bjudit
        // samma färg. En reverse eller en ensidig färgbeskrivning fastställer
        // inte i sig trumf, även om de dolda händerna råkar ha 8 kort ihop.
        for(var aj=i;aj>=0;aj--){
          if(bids[aj].s!==b.s||!isBid(bids[aj].c)||bids[aj].c[1]==='N')continue;
          var candidateSuit=bids[aj].c[1];
          var partnerHasBidSuit=bids.slice(0,i+1).some(function(x){
            return x.s===partner(b.s)&&isBid(x.c)&&x.c[1]===candidateSuit;
          });
          if(partnerHasBidSuit&&hand.L[candidateSuit]+partnerHand.L[candidateSuit]>=8){
            agreed=candidateSuit;break;
          }
        }
      }
      if(!agreed && node && node.conv && node.conv.indexOf('svag tvåa')===0){
        for(var wi=0;wi<=i;wi++){
          if(side(bids[wi].s)===side(b.s) && /^2[DHS]$/.test(bids[wi].c)){
            var weakSuit=st_(bids[wi].c);
            if(hand.L[weakSuit]+partnerHand.L[weakSuit]>=8)agreed=weakSuit;
            break;
          }
        }
      }
      var agreedFit=agreed?hand.L[agreed]+partnerHand.L[agreed]:0;
      item.hp=hand.hp;item.htp=handHps(hand,agreed);item.langd=hand.L;
      if(agreed && agreedFit>=8){
        item.handtyp='Trumfstöd ('+SYM[agreed]+')';
        item.trumfstod=agreedFit+' kort i '+SYM[agreed];
      }else{
        var lens=[hand.L.C,hand.L.D,hand.L.H,hand.L.S].sort(function(a,b){return b-a});
        if(hand.bal)item.handtyp='Jämn fördelning ('+hand.shape+')';
        else if(lens[0]>=6)item.handtyp='Enfärgshand';
        else if(lens[0]>=5&&lens[1]>=4)item.handtyp='Tvåfärgshand';
        else item.handtyp='Obalanserad hand';
      }
      if(node && node.exp){
        var jointHcp=hand.hp+partnerHand.hp;
        var lengthBonus=agreedFit===9?1:agreedFit>=10?2:0;
        var jointPlaying=agreedFit>=8?partnershipPoints(hand,partnerHand,agreed):jointHcp;
        var distributionPoints=agreedFit>=8?jointPlaying-jointHcp-lengthBonus:0;
        function handShapeText(x){return '♠'+x.L.S+' ♥'+x.L.H+' ♦'+x.L.D+' ♣'+x.L.C;}
        item.nod={
          konvention:node.conv||'övrigt',
          rekommendation:txt(node.exp),
          rekommendationskod:node.exp,
          alternativ:(node.alt||[]).map(txt),
          motivering:node.why||'',
          betydelse:typeof node.means==='function'?(node.means(node.exp)||''):'',
          regelstatus:node.soft?'Vägledande bedömning':'Systemregel',
          hand:{hp:hand.hp,fordelning:handShapeText(hand)},
          partner:{hp:partnerHand.hp,fordelning:handShapeText(partnerHand)},
          gemensammaHp:jointHcp,
          fit:agreedFit>=8?{farg:agreed,antal:agreedFit,gemensammaSpelpoang:jointPlaying,fordelningspoang:distributionPoints,langdBonus:lengthBonus}:null
        };
      }
      if(!(side(b.s)===1&&b.c==='P'))items.push(item);
    }
    var status=structural.ended?'Budgivningen är avslutad.':bids.length?'Budgivningen är inte avslutad – inväntar fler bud.':'Ingen budgivning registrerad.';
    return {items:items,summary:'Rätt '+right+' · Fel '+wrong+' · Valfritt '+optional+' · Ej täckt '+uncovered+' (Norr och Syd).',auction:{valid:structural.valid,ended:structural.ended,dealer:structural.dealer,contract:structural.contractText,status:status,errors:structural.errors.map(function(e){return 'Bud '+(e.index+1)+': '+e.message})}};
  }

  return {judge:judgeComplete,H:H,partnershipPoints:partnershipPoints,nodeFor:nodeFor,nodeForRaw:nodeForRaw,decideLive:decideLive,slamProhibitionFromAuction:slamProhibitionFromAuction,txt:txt,validateAuction:validateAuction,version:'8.0'};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Rattning;
if(typeof window!=='undefined')window.Rattning=Rattning;
