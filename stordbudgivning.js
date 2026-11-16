/* RattningStord: separat regelmodul. Reglerna är flyttade utan avsiktlig beteendeförändring. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningStordFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api){
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
  function overcall(h,ob,last){
    var hp=h.hp,L=h.L,os=ob[1],lvl=lv(ob),exp,why,alt=[];
    var un=SU.filter(function(s){return s!=='N'&&s!==os;});
    var takeout=hp>=12&&un.every(function(s){return L[s]>=3});
    var means=function(c){
      if(c==='X')return 'Upplysningsdubbling: 12+ hp och 3+ kort i alla objudna färger, eller 17+ hp oavsett fördelning.';
      if(c==='1N')return 'Inkliv 1NT: 15-17 hp, balanserad hand och håll i öppningsfärgen.';
      if(c==='2N')return 'Försvar mot spärr: 16-18 hp, balanserad hand.';
      if(c==='P')return 'Pass: handen uppfyller inget inklivsvillkor.';
      if(isBid(c)&&c[1]!=='N'){
        var lo=lowest(c[1],ob);
        if(c===lo){
          if(lv(c)===1)return 'Enkelt inkliv på 1-nivån: 10+ hp, bra 5+ färg.';
          if(lv(c)===2)return 'Enkelt inkliv på 2-nivån: 12-17 hp och 6+ färg.';
        }
        if(c===jump(c[1],ob))return 'Hoppande inkliv: 6-10 hp och 6+ färg.';
      }
      return null;
    };

    // Försvar mot spärröppning (2-nivå eller högre).
    if(lvl>=2){
      if(h.bal&&hp>=16&&hp<=18&&ok('2N',last)){
        exp='2N';why=hp+' hp balanserad: 2NT enligt spärrförsvaret.';
      }else if(takeout||hp>=17){
        exp='X';why=takeout?'12+ hp och 3+ kort i alla objudna färger: upplysningsdubbling mot spärr.':'17+ hp: dubbling mot spärr oavsett fördelning.';
      }else{
        exp='P';why='Ingen dubblingshand eller balanserad 16-18-hand för 2NT: pass.';
      }
      return {exp:exp,alt:alt,why:why,means:means,conv:'dubbling',soft:true};
    }

    // 1NT-inkliv: 15-17 hp, balanserad och håll.
    if(hp>=15&&hp<=17&&h.bal&&h.stop(os)&&ok('1N',ob)){
      exp='1N';why=hp+' hp, balanserad hand med håll i '+SYM[os]+': 1NT.';
      if(takeout)alt.push('X');
      return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
    }

    // Upplysningsdubbling: 12+ hp med 3+ i samtliga objudna färger,
    // eller 17+ hp oavsett fördelning.
    if(takeout){
      exp='X';why='12+ hp och minst 3 kort i alla objudna färger: upplysningsdubbling.';
      return {exp:exp,alt:alt,why:why,means:means,conv:'dubbling',soft:true};
    }
    if(hp>=17){
      exp='X';why='17+ hp: dubbling oavsett fördelning.';
      return {exp:exp,alt:alt,why:why,means:means,conv:'dubbling',soft:true};
    }

    // Enkelt inkliv: 1-nivån 10+ hp och bra 5+ färg;
    // 2-nivån 12-17 hp och minst 6 kort.
    var simple=un.filter(function(s){
      var lo=lowest(s,ob),lev=lv(lo);
      if(lev===1){
        if(maj(s))return hp>=10&&hp<=16&&L[s]>=5&&h.good(s);
        return hp>=12&&hp<=16&&L[s]>=5;
      }
      if(lev===2)return hp>=12&&hp<=16&&L[s]>=6;
      return false;
    }).sort(function(a,b){
      if(L[b]!==L[a])return L[b]-L[a];
      return SU.indexOf(b)-SU.indexOf(a);
    });
    if(simple.length){
      exp=lowest(simple[0],ob);
      why=hp+' hp och '+L[simple[0]]+' kort i '+SYM[simple[0]]+': enkelt inkliv.';
      return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
    }

    // Hoppande inkliv: 6-10 hp och 6+ färg.
    var jumpSuits=un.filter(function(s){return L[s]>=6&&hp>=6&&hp<=10;}).sort(function(a,b){
      if(L[b]!==L[a])return L[b]-L[a];
      return SU.indexOf(b)-SU.indexOf(a);
    });
    for(var ji=0;ji<jumpSuits.length;ji++){
      var js=jumpSuits[ji],jb=jump(js,ob);
      if(jb&&ok(jb,ob)&&(!maj(js)||lv(jb)!==2||h.good(js))){
        exp=jb;why=hp+' hp och '+L[js]+' kort i '+SYM[js]+': hoppande inkliv.';
        return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
      }
    }

    exp='P';why='Ingen inklivshand enligt systemets styrke- och färglängdskrav: pass.';
    return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
  }
  function respOvercall(h,oc,last,ob,sourcePageRules){
    var s=st_(oc),os=ob?ob[1]:null,L=h.L,hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(c==='1N')return (sourcePageRules?'6-10':'8-10')+' hp, balanserad hand med håll i motståndarnas inklivsfärg.';
      if(c==='2N')return '11-13 hp, balanserad hand med bra håll.';
      if(c==='3N')return '14+ hp, balanserad hand med bra håll.';
      if(isBid(c)&&c[1]===s){
        var d=lv(c)-lv(oc);
        if(d===1)return '6-9 hp och 3-korts stöd: enkel höjning.';
        if(d===2)return '6-9 hp och 4-korts stöd: dubbel höjning.';
        if(d===3)return '6-9 hp och 5-korts stöd: trippel höjning.';
      }
      if(isBid(c)&&c[1]===os)return '10+ hp och 3+ stöd: överbud i motståndarnas färg.';
      if(isBid(c)&&c[1]!=='N'){
        var base=lowest(c[1],last),need=base&&lv(base)>=2?10:8;
        if(c===base)return need+'+ hp och '+(sourcePageRules&&(c[1]==='C'||c[1]==='D')?'4+':'5+')+' färg: rondkrav.';
        if(c===jump(c[1],last))return '14+ hp, bra 6+ färg: utgångskrav.';
      }
      if(c==='P')return 'Pass när inget av systemets svarsbud uppfylls.';
      return null;
    };

    // BridgePlus s. 90 applies when our side opened and opponents interfered.
    // Where both a five-card new major and 1NT are plausible, the source gives no priority.
    var unbidFiveMajor=((s!=='S'&&os!=='S'&&L.S>=5)||(s!=='H'&&os!=='H'&&L.H>=5));
    var canShow1NT=h.bal&&hp>=6&&hp<=10&&h.stop(os)&&ok('1N',last);
    if(sourcePageRules&&unbidFiveMajor&&canShow1NT)
      return NC('Både 1NT med håll och ny femkortshögfärg är möjliga; BridgePlus s. 90 anger ingen prioritet mellan dem.');
    if(sourcePageRules&&unbidFiveMajor&&L[s]>=3&&hp>=6&&hp<=9)
      return NC('Både höjning med stöd och ny femkortshögfärg är möjliga; källan anger ingen prioritet.');
    var unbidFourMinor=((s!=='C'&&os!=='C'&&L.C>=4)||(s!=='D'&&os!=='D'&&L.D>=4));
    if(sourcePageRules&&unbidFourMinor&&L[s]>=3&&!canShow1NT)
      return NC('Både stöd i partnerns öppningsfärg och en fyrkortslågfärg är möjliga; källan anger ingen prioritet.');
    if(sourcePageRules&&!exp&&!unbidFiveMajor&&canShow1NT){
      exp='1N';why='6-10 hp, balanserad hand med håll i motståndarnas inklivsfärg: 1NT.';
    }
    // Stöd visas först i övriga konkurrenslägen; 6-9 hp med 3/4/5-korts stöd.
    if(!exp&&L[s]>=3&&hp>=6&&hp<=9){
      var steps=L[s]>=5?3:L[s]>=4?2:1;
      var raise=(lv(oc)+steps)+s;
      if(ok(raise,last)){
        exp=raise;
        why=hp+' hp och '+L[s]+'-korts stöd: '+(steps===1?'enkel':steps===2?'dubbel':'trippel')+' höjning.';
      }
    }

    // 10+ hp och 3+ stöd: överbud i öppningsfärgen.
    if(!exp&&L[s]>=3&&hp>=10&&os){
      var cue=lowest(os,last);
      if(ok(cue,last)){exp=cue;why='10+ hp och '+L[s]+'-korts stöd: överbud i motståndarnas färg.';}
    }

    if(!sourcePageRules&&!exp&&h.bal&&hp>=8&&hp<=10&&h.stop(os)&&ok('1N',last)){
      exp='1N';why='8-10 hp, balanserad hand med håll i öppningsfärgen: 1NT.';
    }
    if(!exp&&h.bal&&hp>=11&&hp<=13&&h.stop(os)&&ok('2N',last)){
      exp='2N';why='11-13 hp, balanserad hand med bra håll: 2NT.';
    }
    if(!exp&&h.bal&&hp>=14&&h.stop(os)&&ok('3N',last)){
      exp='3N';why='14+ hp, balanserad hand med bra håll: 3NT.';
    }

    // BridgePlus-svaret efter vår öppning tillåter 4-korts lågfärg; övriga lägen behåller 5+.
    // Hopp i ny färg kräver 14+ hp och en bra 6+-färg.
    if(!exp){
      var suits=['S','H','D','C'].filter(function(x){return x!==s&&x!==os&&L[x]>=(sourcePageRules&&(x==='C'||x==='D')?4:5);});
      suits.sort(function(a,b){
        if(L[b]!==L[a])return L[b]-L[a];
        return ['S','H','C','D'].indexOf(a)-['S','H','C','D'].indexOf(b);
      });
      for(var si=0;si<suits.length&&!exp;si++){
        var ns=suits[si],base=lowest(ns,last);
        if(hp>=14&&L[ns]>=6&&h.good(ns)){
          var jumpBid=jump(ns,last);
          if(jumpBid&&ok(jumpBid,last)){
            exp=jumpBid;why='14+ hp och bra 6+-färg i '+SYM[ns]+': hoppande färgbud, utgångskrav.';
          }
        }
        if(!exp&&base&&hp>=(lv(base)>=2?10:8)){
          exp=base;why=hp+' hp och '+L[ns]+' kort i '+SYM[ns]+': ny färg på lägsta nivå, rondkrav.';
        }
      }
    }

    // Pass är rätt när handen inte når något av de uttryckliga svarsbuden.
    if(!exp){exp='P';why='Ingen höjning, sang, överbud eller ny färg uppfyller systemkraven: pass.';}
    return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
  }
  function respDouble(h,ob,last){
    var os=ob[1],L=h.L,hp=h.hp,exp,why,alt=[],un=SU.filter(function(s){return s!==os;});
    function rankedSuits(list){
      return list.sort(function(a,b){
        if(L[b]!==L[a])return L[b]-L[a];
        if(h.htp(b)!==h.htp(a))return h.htp(b)-h.htp(a);
        return SU.indexOf(b)-SU.indexOf(a);
      });
    }
    var cheapest=un.map(function(s){return {s:s,bid:lowest(s,ob)};})
      .filter(function(x){return x.bid&&L[x.s]>=3;})
      .sort(function(a,b){return rk(a.bid)-rk(b.bid);})[0];
    var jump8=rankedSuits(un.filter(function(s){var p=h.htp(s);return L[s]>=4&&p>=8&&p<=9;}))[0];
    var jump10=rankedSuits(un.filter(function(s){var p=h.htp(s);return L[s]>=5&&p>=10&&p<=12;}))[0];
    var means=function(c){
      if(c==='1N')return '6-9 hp och håll i öppningsfärgen.';
      if(c==='2N')return '10-12 hp och håll i öppningsfärgen.';
      if(c==='3N')return '13+ hp och håll i öppningsfärgen.';
      if(c==='P')return 'Pass endast med många kort i öppningsfärgen.';
      if(isBid(c)&&c[1]===os)return '10+ hp: överbud i motståndarnas färg, krav.';
      if(isBid(c)&&c[1]!=='N'){
        var low=lowest(c[1],ob),jumpBid=jump(c[1],ob);
        if(c===low)return '0-7 hp: färg på lägsta nivå (kan vara 3 kort).';
        if(c===jumpBid&&h.htp(c[1])>=8&&h.htp(c[1])<=9&&L[c[1]]>=4)
          return '8-9 htp och 4+ färg: hopp i färgen.';
        if(c==='3'+c[1]&&h.htp(c[1])>=10&&h.htp(c[1])<=12&&L[c[1]]>=5)
          return '10-12 htp och helst 5+ färg: hopp till 3-nivån.';
      }
      return null;
    };

    // Pass är endast aktuellt när svarshanden har en lång och bra färg
    // i motståndarnas öppningsfärg (möjlighet att straffpassa UD).
    if(L[os]>=5&&h.good(os)){
      exp='P';why='Minst 5 kort och bra kvalitet i öppningsfärgen: straffpass.';
    }
    // Naturliga sangsvar med håll; REF anger ingen separat balansgräns.
    else if(h.stop(os)&&hp>=6&&hp<=9){
      exp='1N';why=hp+' hp, balanserad hand med håll: 1NT.';
    }
    else if(h.stop(os)&&hp>=10&&hp<=12){
      exp='2N';why=hp+' hp, balanserad hand med håll: 2NT.';
    }
    else if(h.stop(os)&&hp>=13){
      exp='3N';why=hp+' hp, balanserad hand med håll: 3NT.';
    }
    // 0-7 hp: billigaste färg, även med bara tre kort.
    else if(hp<=7&&cheapest){
      exp=cheapest.bid;why=hp+' hp: billigaste objudna färg ('+SYM[cheapest.s]+'), även med 3 kort.';
    }
    // 8-9 HTP: välj den bästa av alla objudna 4+-färger som uppfyller gränsen.
    else if(jump8){
      var j=jump(jump8,ob);
      if(j&&ok(j,ob)){exp=j;why=h.htp(jump8)+' htp och '+L[jump8]+' kort i '+SYM[jump8]+': hopp i färgen.';}
    }
    // 10-12 HTP: välj en 5+-färg som faktiskt uppfyller HTP-gränsen.
    if(!exp&&jump10&&ok('3'+jump10,ob)){
      exp='3'+jump10;why=h.htp(jump10)+' htp och '+L[jump10]+' kort i '+SYM[jump10]+': hopp till 3-nivån.';
    }
    // 10+ hp: överbud är krav när inget lämpligare svar har visats.
    if(!exp&&hp>=10){
      var cue=lowest(os,ob);
      if(cue&&ok(cue,ob)){exp=cue;why=hp+' hp: överbud i motståndarnas färg, krav.';}
    }
    if(!exp)return NC('Svar efter upplysningsdubbling: handen uppfyller inget uttryckligt svarsvillkor i systemunderlaget.',means,'dubbling');
    return {exp:exp,alt:alt,why:why||'',means:means,conv:'dubbling',soft:true};
  }

  /* ––––– SVARSHANDENS ANDRA BUD EFTER 1NT-SVAR ––––– */
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

  return {overcall,respOvercall,respDouble,respAfter1NT,responderSecondBid};
});
