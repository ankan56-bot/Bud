/* RattningStord: separat regelmodul. Reglerna är flyttade utan avsiktlig beteendeförändring. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningStordFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api){
  var SU=api.SU, SYM=api.SYM, NAME=api.NAME;
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
  function respAfter1NT(h,opening,rebid,act){
    var hp=h.hp,L=h.L, suit=isBid(act)?st_(act):null;
    var isOpeningSuit=suit&&suit===st_(opening);
    var lowestNewSuit=suit&&lowest(suit,rebid)===act;
    var means=function(c){
      if(isBid(c)&&c[0]==='3'&&st_(c)!=='N'&&L[st_(c)]>=6&&hp>=6&&hp<=9){
        if(st_(c)!==st_(opening)&&lowest(st_(c),rebid)===c)
          return 'Svarshandens andra färgbud på lägsta nivå efter 1NT: 6-9 hp och minst 6-korts färg. Undantag från krav.';
        if(st_(c)===st_(opening)&&c==='3'+st_(opening))
          return 'Svarshandens andra bud i öppningsfärgen: 6-9 hp och minst 6-korts färg.';
      }
      return null;
    };
    var allowed=hp>=6&&hp<=9&&suit&&L[suit]>=6&&lv(act)===3&&((isOpeningSuit&&act==='3'+suit)||(!isOpeningSuit&&lowestNewSuit));
    if(allowed){
      return {exp:act,alt:[],why:hp+' hp och 6+ '+SYM[suit]+': bjud färgen på lägsta nivå i andra budronden. Budet är inte krav.',means:means,conv:'svar efter 1NT',soft:false};
    }
    if(hp<=9){
      return {exp:'P',alt:[],why:hp+' hp och ingen egen 6-kortsfärg att återbjuda: pass efter öppnarens återbud.',means:function(c){return c==='P'?'Pass med svag hand efter 1NT-svar.':null},conv:'svar efter 1NT'};
    }
    return NC('Efter 1NT-svaret är endast de beskrivna andra färgbuden med 6-9 hp och 6+ kort täckta av dokumentet.',means,'svar efter 1NT');
  }

  /* ––––– SVARSHANDENS ANDRA BUD EFTER ÖPPNARENS ÅTERBUD ––––– */
  function responderSecondBid(h,opening,response,rebid,openerHand){
    var first=st_(opening),resp=isBid(response)?st_(response):null;
    var rb=isBid(rebid)?st_(rebid):null,oh=openerHand?H(openerHand):null,hp=h.hp,L=h.L;
    var totalHcp=oh?hp+oh.hp:null,fitSuit=null,fit=0,total=0,threshold=0,game=null,invite=null;
    var means=function(c){
      if(c==='P')return 'Svagt svar: avstår från vidare budgivning.';
      if(c==='2N'||c==='3N')return 'Balanserad hand utan tillräckligt trumfstöd: invit eller utgång i sang.';
      if(isBid(c)&&c[1]!=='N')return 'Visar stöd, preferens eller fortsatt färgbeskrivning enligt öppnarens återbud.';
      return null;
    };

    // A. Öppnaren har höjt svarshandens färg.
    if(resp&&rb===resp){
      fitSuit=resp;fit=L[fitSuit]+oh.L[fitSuit];
      if(fit>=8){
        threshold=maj(fitSuit)?26:28;
        total=partnershipPoints(h,oh,fitSuit);
        game=maj(fitSuit)?'4'+fitSuit:'5'+fitSuit;
        invite='3'+fitSuit;
        if(total>=threshold)return {exp:game,alt:[],why:fit+'-korts fit i '+SYM[fitSuit]+' och '+total+' gemensamma spelpoäng: utgång enligt våra gränser ('+threshold+'+).',means:means,conv:'svar efter öppnarens återbud'};
        if(total>=threshold-4)return {exp:invite,alt:[],why:fit+'-korts fit och '+total+' gemensamma spelpoäng: invitnivå, men ännu inte utgång enligt våra gränser.',means:means,conv:'svar efter öppnarens återbud'};
        return {exp:'P',alt:[],why:fit+'-korts fit men '+total+' gemensamma spelpoäng: under invitnivån.',means:means,conv:'svar efter öppnarens återbud'};
      }
    }

    // B. Öppnaren har visat en balanserad hand.
    if(rb==='N'){
      var major=['S','H'].filter(function(s){return L[s]+oh.L[s]>=8;}).sort(function(a,b){return (L[b]+oh.L[b])-(L[a]+oh.L[a]);})[0];
      if(major){
        total=partnershipPoints(h,oh,major);
        if(total>=26)return {exp:'4'+major,alt:[],why:'Högfärgsfit ('+(L[major]+oh.L[major])+' kort) och '+total+' gemensamma spelpoäng: utgång.',means:means,conv:'svar efter öppnarens återbud'};
        if(total>=22)return {exp:'3'+major,alt:[],why:'Högfärgsfit och '+total+' gemensamma spelpoäng: invit.',means:means,conv:'svar efter öppnarens återbud'};
      }
      if(totalHcp >=25)return {exp:'3N',alt:[],why:totalHcp+' gemensamma honnörspoäng: utgång i sang enligt 25-poängsgränsen.',means:means,conv:'svar efter öppnarens återbud'};
      if(totalHcp>=22)return {exp:'2N',alt:[],why:totalHcp+' gemensamma honnörspoäng: invit i sang.',means:means,conv:'svar efter öppnarens återbud'};
      return {exp:'P',alt:[],why:totalHcp+' gemensamma honnörspoäng: under invitnivån efter balanserat återbud.',means:means,conv:'svar efter öppnarens återbud'};
    }

    // C. Öppnaren har visat minst sex kort i sin egen färg.
    if(rb===first&&oh.L[first]>=5){
      fit= L[first]+oh.L[first];
      if(fit>=8){
        total=partnershipPoints(h,oh,first);threshold=maj(first)?26:28;
        if(total>=threshold)return {exp:maj(first)?'4'+first:'5'+first,alt:[],why:fit+'-korts fit i '+SYM[first]+' och '+total+' gemensamma spelpoäng: utgång.',means:means,conv:'svar efter öppnarens återbud'};
        if(total>=threshold-4)return {exp:'3'+first,alt:[],why:fit+'-korts fit och '+total+' gemensamma spelpoäng: invit.',means:means,conv:'svar efter öppnarens återbud'};
        return {exp:'P',alt:[],why:fit+'-korts fit men '+total+' gemensamma spelpoäng: pass.',means:means,conv:'svar efter öppnarens återbud'};
      }
      if(totalHcp>=26)return {exp:'3N',alt:[],why:'Ingen tillräcklig fit. '+totalHcp+' gemensamma honnörspoäng: 3NT enligt 25-poängsgränsen.',means:means,conv:'svar efter öppnarens återbud'};
      if(totalHcp>=22)return {exp:'2N',alt:[],why:'Ingen tillräcklig fit. '+totalHcp+' gemensamma honnörspoäng: invit 2NT.',means:means,conv:'svar efter öppnarens återbud'};
      return {exp:'P',alt:[],why:'Ingen tillräcklig fit och under invitstyrka: pass.',means:means,conv:'svar efter öppnarens återbud'};
    }

    // Sekvensspecifik regel: 1♥–1♠–2♦–2NT.
    // Användarbekräftad 2026-11-18: 2NT är en invit med 11–12 HP.
    // Denna gräns gäller bara denna exakta sekvens; 1♥–1♠–2♣ har en
    // separat gren med egna krav och får inte blandas ihop med denna invit.
    if(first==='H'&&resp==='S'&&rb==='D'){
      if(h.bal&&hp>=11&&hp<=12){
        return {exp:'2N',alt:[],why:hp+' hp och balanserad hand efter 1♥–1♠–2♦: 2NT är invit (11–12 hp).',
          means:function(c){return c==='2N'?'Naturlig invit i sang, 11–12 hp, balanserad hand.':null},
          conv:'invit i sang'};
      }
      if(hp>=13){
        return {exp:'3C',alt:[],why:hp+' hp efter 1♥–1♠–2♦: fjärde färg 3♣ är utgångskrav; 2NT är inte längre invitintervallet.',
          means:function(c){return c==='3C'?'Fjärde färg, utgångskrav.':null},conv:'Fjärde färg'};
      }
      if(h.bal&&hp<=10){
        return NC(hp+' hp efter 1♥–1♠–2♦: 2NT-inviten är fastställd till 11–12 hp. Denna hand ligger under intervallet; inget annat återbud är verifierat här.',means,'svar efter öppnarens återbud',true);
      }
      if(!oh){
        return NC('Efter 1♥–1♠–2♦ är endast 2NT med 11–12 balanserade HP eller fjärde färg med 13+ HP säkert avgörbart utan partnerns dolda hand.','', 'live',true);
      }
    }
    // Separat, källbunden gren: 1♥–1♠–2♣–2NT.
    // Denna 2NT-invit är bara täckt med 10–12 HP, balanserad hand,
    // exakt två hjärter samt håll i både spader och ruter.
    if(first==='H'&&resp==='S'&&rb==='C'&&hp>=10&&hp<=12){
      if(h.bal&&L.H===2&&h.stop('S')&&h.stop('D')){
        return {exp:'2N',alt:[],why:hp+' hp, balanserad hand, två hjärter samt håll i spader och ruter efter 1♥–1♠–2♣: 2NT-invit.',
          means:function(c){return c==='2N'?'Balanserad invit, 10–12 hp, exakt två hjärter och håll i både spader och ruter.':null},
          conv:'invit i sang'};
      }
      return NC('Efter 1♥–1♠–2♣ är 2NT endast täckt med 10–12 hp, balanserad hand, exakt två hjärter samt håll i spader och ruter. Handen uppfyller inte samtliga villkor; lämnas ej täckt.',means,'svar efter öppnarens återbud',true);
    }

    if(!oh)return NC('Denna fortsättning kräver öppnarens hand för att avgöra preferens eller färgval.','', 'svar efter öppnarens återbud',true);

    // D. Öppnaren har visat två färger; styrkan är ännu inte begränsad.
    if(rb&&rb!==first&&rb!=='N'&&oh.L[first]>=4&&oh.L[rb]>=4){
      var pref=[first,rb].filter(function(s){return L[s]>=2;}).sort(function(a,b){return (L[b]+oh.L[b])-(L[a]+oh.L[a]);})[0];
      if(hp<=9&&pref)return {exp:lowest(pref,rebid),alt:[],why:hp+' hp: svag hand, preferens till bästa gemensamma färg.',means:means,conv:'svar efter öppnarens återbud'};
      if(hp>=13){
        var fourth=SU.filter(function(s){return s!==first&&s!==rb&&s!==resp;})[0];
        if(fourth)return {exp:lowest(fourth,rebid),alt:[],why:hp+' hp: fjärde färg som utgångskrav; öppnaren har visat två färger men inte begränsat styrkan.',means:means,conv:'Fjärde färg'};
        if(pref)return {exp:lowest(pref,rebid),alt:[],why:hp+' hp: stark hand, fortsätt via preferens till bästa färg.',means:means,conv:'svar efter öppnarens återbud'};
        return {exp:'3N',alt:[],why:hp+' hp: stark balanserad hand, utgångskrav i sang.',means:means,conv:'svar efter öppnarens återbud'};
      }
      if(hp>=10&&hp<=12){
        // T40:s generella tvåfärgsgren är konkretiserad med exemplet
        // 1♣–1♦–1♥. Övriga färgkombinationer får inte skapas genom färgbyte.
        if(first==='C'&&resp==='D'&&rb==='H'){
          if(h.bal)return {exp:'2N',alt:[],why:hp+' hp: balanserad invit efter 1♣–1♦–1♥.',means:means,conv:'svar efter öppnarens återbud'};
          if(pref)return {exp:lowest(pref,rebid),alt:[],why:hp+' hp: obalanserad invitnivå, preferens efter 1♣–1♦–1♥.',means:means,conv:'svar efter öppnarens återbud'};
        }
        return NC('10–12 hp efter denna tvåfärgssekvens är inte verifierat för just denna färgkombination. Ingen generell 2NT-invit eller preferensregel överförs från ett annat exempel.',means,'svar efter öppnarens återbud',true);
      }
    }
    return NC('Denna handtyp eller fortsättning kan inte avgöras säkert med de uppgifter som visas.',means,'svar efter öppnarens återbud');
  }

  /* ––––– ÖPPNARENS TREDJE BUD EFTER 1♥–1♠–2♦–2NT ––––– */
  function openerThirdAfterTwoSuitInvite(h,opening,response,rebid,invite){
    if(opening!=='1H'||response!=='1S'||rebid!=='2D'||invite!=='2N')
      return NC('Fel sekvens för den sekvensspecifika 2NT-invitgrenen.');
    var hp=h.hp,L=h.L;
    var minimum=hp>=12&&hp<=14,maximum=hp>=15&&hp<=17;
    if(!minimum&&!maximum)
      return NC('Öppnarens hand ligger utanför den verifierade 12–17 hp-ramen efter 1♥–1♠–2♦.','', '2NT-invit',true);

    // Lathundens tryckta sida 18: 3♦ = 5-5 min; 3♥ = 6-4 min;
    // 3♠ = trekortsstöd max; 3♣ = fjärde färg, utgångskrav.
    // "Min/max" mappas här till 12–14 respektive 15–17 hp; detta är
    // en tydligt markerad källtolkning, inte en ny grundsystemregel.
    if(minimum&&L.H===5&&L.D===5)
      return {exp:'3D',alt:[],why:'5-5 i hjärter och ruter med minimum (12–14 hp): 3♦ enligt Lathundens fortsättning efter 2NT-inviten.',
        means:function(c){return c==='3D'?'5-5-fördelning, minimum.':null},conv:'2NT-invit',soft:true,ruleStatus:'source_interpretation'};
    if(minimum&&L.H===6&&L.D===4)
      return {exp:'3H',alt:[],why:'6-4 i hjärter och ruter med minimum (12–14 hp): 3♥ enligt Lathundens fortsättning efter 2NT-inviten.',
        means:function(c){return c==='3H'?'6-4-fördelning, minimum.':null},conv:'2NT-invit',soft:true,ruleStatus:'source_interpretation'};
    if(maximum&&L.S===3)
      return {exp:'3S',alt:[],why:'Tre spader och maximum (15–17 hp): 3♠ visar trekortsstöd; annars skulle 2♠ ha bjudits direkt.',
        means:function(c){return c==='3S'?'3-korts spaderstöd, maximum.':null},conv:'2NT-invit',soft:true,ruleStatus:'source_interpretation'};
    if(maximum)
      return {exp:'3C',alt:[],why:'Maximum (15–17 hp) utan den särskilda trekortsspadergrenen: 3♣ är fjärde färg och utgångskrav.',
        means:function(c){return c==='3C'?'Fjärde färg, utgångskrav.':null},conv:'2NT-invit',soft:true,ruleStatus:'source_interpretation'};
    return {exp:'P',alt:[],why:'Minimum (12–14 hp) utan 5-5- eller 6-4-fördelningen: pass. 3NT är märkt Plus i Lathunden och ingår inte i grundprofilen.',
      means:function(c){return c==='P'?'Pass med minimum utan den beskrivna fördelningsgrenen.':null},conv:'2NT-invit',soft:true,ruleStatus:'source_interpretation'};
  }

  /* ––––– DISPATCH ––––– */

  return {respAfter1NT,responderSecondBid,openerThirdAfterTwoSuitInvite};
});
