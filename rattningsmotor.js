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
  var stenbergFactory=(typeof module!=='undefined'&&module.exports)?require('./stenberg.js'):window.RattningStenbergFactory;
  var stenberg=stenbergFactory(sharedApi);
  var trumfstodFactory=(typeof module!=='undefined'&&module.exports)?require('./trumfstod.js'):window.RattningTrumfstodFactory;
  var trumfstod=trumfstodFactory(sharedApi,{stenberg:stenberg,majorBidding:majorBidding,minorBidding:minorBidding});

  var twoClubFactory=(typeof module!=='undefined'&&module.exports)?require('./2kloveroppning.js'):window.Rattning2KloverFactory;
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

  // Budregler och sekvensdirigering ligger i en separat modul.
  var budbeslutFactory=(typeof module!=='undefined'&&module.exports)
    ? require('./budbeslut.js')
    : window.RattningBudbeslutFactory;
  var budbeslut=budbeslutFactory(sharedApi,{
    twoClub:twoClub,weakTwo:weakTwo,majorBidding:majorBidding,minorBidding:minorBidding,
    trumfstod:trumfstod,overcalls:overcalls,doubles:doubles,slam:slam,sang:sang,stord:stord
  });
  var nodeForRaw=budbeslut.nodeForRaw;

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
    var ntOpeningCall=openingCall&&(openingCall.c==='1N'||openingCall.c==='2N');
    var ntFamilyCalls=openingCall&&openingCall.c==='2N'
      ?['2N','3C','3D','3H','3N','4N']
      :['1N','2C','2D','2H','2S','2N','3C','3D','3H','3S','3N','4C','4D','4H','4S','4N'];
    var isOneNTFamily=!!ntOpeningCall&&
      side(openingCall.s)===side(seat)&&
      auction.every(function(x){
        if(side(x.s)!==side(seat))return x.c==='P';
        return x.c==='P'||ntFamilyCalls.indexOf(x.c)>=0;
      })&&nonPass.every(function(x){return x.c!=='X'&&x.c!=='XX';});
    // Stenberg 2NT is information-safe: its response and opener's rebid
    // depend on the acting hand plus the public auction, not the hidden hand.
    var stenbergOwnCalls=auction.filter(function(x){return side(x.s)===side(seat)&&isBid(x.c);});
    var isStenbergFamily=!!openingCall&&/^1[CDHS]$/.test(openingCall.c)&&
      side(openingCall.s)===side(seat)&&
      auction.every(function(x){return side(x.s)===side(seat)||x.c==='P';})&&
      stenbergOwnCalls.length>=1&&
      stenbergOwnCalls.every(function(x,i){
        if(i===0)return /^1[CDHS]$/.test(x.c);
        return /^(?:2N|3[CDHSN]|4[HSN]|5[CD])$/.test(x.c);
      });
    if(!isOpeningDecision&&!isOneNTFamily&&!isStenbergFamily){
      var unsupportedReason='Den här budsekvensen ingår ännu inte i den informationssäkra livebedömningen. Öppning efter pass samt ostörd 1NT-/2NT-familjens verifierade grenar är aktiverade; andra sekvenser lämnas ej täckta.';
      if(typeof window!=='undefined'&&window.EjTacktaLogg){
        var liveOwnHands={};liveOwnHands[seat]=ownHand.slice();
        window.EjTacktaLogg.record({
          context:'live',dealer:dealer,seat:seat,auction:auction,
          attemptedCall:null,reason:unsupportedReason,sourceGap:true,hands:liveOwnHands
        });
      }
      return NC(unsupportedReason,'', 'live');
    }
    var bids=auction.concat([{s:seat,c:'P'}]);
    var st={hands:{}};st.hands[seat]=ownHand.slice();st.dealer=dealer;st.bids=bids;
    var node;
    try{node=nodeForRaw(st,bids.length-1);}
    catch(e){return NC('Livebeslut stoppades säkert: '+e.message,'','live');}
    if(!node||!node.exp){
      if(typeof window!=='undefined'&&window.EjTacktaLogg){
        var ownHands={};ownHands[seat]=ownHand.slice();
        window.EjTacktaLogg.record({
          context:'live',
          dealer:dealer,
          seat:seat,
          auction:auction,
          attemptedCall:null,
          reason:node&&node.why||'Öppnings-/1NT-läget är inte täckt utan partnerns dolda hand.',
          sourceGap:!!(node&&node.sourceGap),
          hands:ownHands
        });
      }
      return NC(node&&node.why||'Öppnings-/1NT-läget är inte täckt utan partnerns dolda hand.','', 'live');
    }
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

  function nodeForInternal(st,i){
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

  // Central loggning: varje ej täckt efterhandsposition sparas en gång.
  // Loggen deduplicerar identiska auktioner/givare och kan exporteras som JSON.
  function nodeFor(st,i){
    var node=nodeForInternal(st,i);
    if(!node||!node.exp){
      var bids=st&&Array.isArray(st.bids)?st.bids:[];
      var current=bids[i]||null;
      if(typeof window!=='undefined'&&window.EjTacktaLogg){
        window.EjTacktaLogg.record({
          context:'after_deal',
          dealer:st&&st.dealer,
          seat:current&&current.s,
          auction:bids.slice(0,i),
          attemptedCall:current&&current.c,
          reason:node&&node.why||'Ingen verifierad fortsättning.',
          sourceGap:!!(node&&node.sourceGap),
          hands:st&&st.hands||null
        });
      }
    }
    return node;
  }

  // Rapportering och presentation av rättningsresultat ligger separat.
  var rapportFactory=(typeof module!=='undefined'&&module.exports)
    ? require('./rattningsrapport.js')
    : window.RattningRapportFactory;
  var rapport=rapportFactory(sharedApi,{
    nodeFor:nodeFor,validateAuction:validateAuction,missedGameOrSlam:missedGameOrSlam
  });
  var judgeComplete=rapport.judgeComplete;
  
  return {judge:judgeComplete,H:H,partnershipPoints:partnershipPoints,nodeFor:nodeFor,nodeForRaw:nodeForRaw,decideLive:decideLive,slamProhibitionFromAuction:slamProhibitionFromAuction,txt:txt,validateAuction:validateAuction,version:'8.0'};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Rattning;
if(typeof window!=='undefined')window.Rattning=Rattning;
