/* Rattningsrapport: tolkning av rekommendationer och färdig rättningsrapport.
 * Flyttad från rattningsmotor.js; regler och bedömningsordning behålls.
 */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningRapportFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api,deps){
  var NAME=api.NAME, SYM=api.SYM, side=api.side, partner=api.partner;
  var isBid=api.isBid, st_=api.st_, txt=api.txt, H=api.H;
  var handHps=api.handHps, partnershipPoints=api.partnershipPoints;
  var NC=api.NC;
  var nodeFor=deps.nodeFor, validateAuction=deps.validateAuction;
  var missedGameOrSlam=deps.missedGameOrSlam;
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


  return {judge:judge,judgeComplete:judgeComplete};
});
