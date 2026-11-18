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
    var rb=isBid(rebid)?st_(rebid):null,oh=H(openerHand),hp=h.hp,L=h.L;
    var totalHcp=hp+oh.hp,fitSuit=null,fit=0,total=0,threshold=0,game=null,invite=null;
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
    // Denna gräns gäller bara denna exakta sekvens; den får inte spridas
    // till andra 2NT-bud eller till 1♥–1♠–2♣.
    if(first==='H'&&resp==='S'&&rb==='D'){
      if(h.bal&&hp>=11&&hp<=12){
        return {exp:'2N',alt:[],why:hp+' hp och balanserad hand efter 1♥–1♠–2♦: 2NT är invit (11–12 hp).',
          means:function(c){return c==='2N'?'Naturlig invit i sang, 11–12 hp, balanserad hand.':null},
          conv:'invit i sang'};
      }
      if(h.bal&&hp<=10){
        return NC(hp+' hp efter 1♥–1♠–2♦: 2NT-inviten är fastställd till 11–12 hp. Denna hand ligger under intervallet; inget annat återbud är verifierat här.',means,'svar efter öppnarens återbud',true);
      }
    }

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
        if(h.bal)return {exp:'2N',alt:[],why:hp+' hp: invit med balanserad hand efter öppnarens tvåfärgshand.',means:means,conv:'svar efter öppnarens återbud'};
        if(pref)return {exp:lowest(pref,rebid),alt:[],why:hp+' hp: invitnivå, preferens till bästa gemensamma färg.',means:means,conv:'svar efter öppnarens återbud'};
      }
    }
    return NC('Denna handtyp eller fortsättning kan inte avgöras säkert med de uppgifter som visas.',means,'svar efter öppnarens återbud');
  }

  /* ––––– DISPATCH ––––– */

  return {respAfter1NT,responderSecondBid};
});
