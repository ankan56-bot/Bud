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
    overcalls:overcalls,doubles:doubles,slam:slam,sang:sang,stord:stord
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
