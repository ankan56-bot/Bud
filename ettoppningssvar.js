/* Gemensamma regler för svar och öppnarens återbud efter 1 i färg. */
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports) module.exports=factory;
 else root.RattningEttOppningsSvarFactory=factory;
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
  function resp1(h,oc){
    var o=st_(oc),hp=h.hp,L=h.L,M=maj(o),sup=L[o]>=4,htp=sup?h.htp(o):hp,exp,why,alt=[];
    var cand=SU.filter(function(s){return s!==o&&rk('1'+s)>rk(oc)&&L[s]>=4});
    function pickBest(cs){var b=cs[0];cs.forEach(function(s){if(L[s]>L[b])b=s});return b}

    var means=function(c){
      if(c==='P')return 'Pass: under 6 htp.';
      if(c==='1N')return '6-10 hp, förnekar 4-korts stöd och färg på 1-nivå. Lovar ej jämn hand.';
      if(c==='2N')return 'Stenberg: 13+ htp, 4+ stöd, utgångskrav.';
      if(isBid(c)&&st_(c)===o){var l=lv(c);
        if(l===2)return '6-9 htp, 4+ stöd.';
        if(l===3)return '10-12 htp, 4+ stöd.';
        if(l===4)return M?'Spärrbud, max 12 htp, bra stöd och svitad hand.':'Spärrbud, max 9 htp, bra stöd och svitad hand.'}
      if(isBid(c)&&st_(c)!=='N'&&st_(c)!==o){var lo=lowest(st_(c),oc),l2=lv(c);
        if(c===lo&&l2===1)return '1 över 1: 6+ hp, 4+ färg, rondkrav.';
        if(c===lo&&l2===2){if(hp>=11||(hp===10&&L[st_(c)]>=6&&h.good(st_(c))))return '2 över 1: 11+ hp (eller 10 hp med bra 6-kortsfärg), 4+ färg, rondkrav.'}
        if(l2>lv(lo))return 'Dubbelhopp i ny färg: renons i färgen, 4+ stöd och 13+ htp.'}
      return null};

    if(M&&sup){
      if(htp<6){exp='P';why='Bara '+htp+' htp med stöd: för svag för att svara.'}
      else if(htp<=9){exp='2'+o;why=htp+' htp med 4+ stöd i högfärgen: 2 i färgen (6-9 stp).'}
      else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen (10-12 stp).'}
      else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT (13+).'}
    }else if(hp<6&&(!sup||htp<6)){exp='P';why='Under 6 hp: pass.'}
    else if(!M&&sup&&cand.some(maj)){var cm=cand.filter(maj);exp=lowest(pickBest(cm),oc);why='Stöd i lågfärg men egen 4+ högfärg: visa högfärgen först (sök högfärg).';
      if(cm.length>1&&L[cm[0]]===L[cm[1]])alt.push(lowest(cm[0]===pickBest(cm)?cm[1]:cm[0],oc))}
    else if(!M&&sup){
      if(htp<=9){exp='2'+o;why=htp+' htp med 4+ stöd i lågfärgen: 2 i färgen (6-9).'}
      else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen (10-12).'}
      else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT.'}
    }
    else if(cand.length){var b=pickBest(cand);exp=lowest(b,oc);why='6+ hp och en 4+ färg på 1-nivå: 1 över 1.';
      cand.forEach(function(s){if(s!==b&&L[s]===L[b])alt.push(lowest(s,oc))})}
    else if(hp<=10&&!(hp===10&&h.longest()>=6&&h.good(h.longest()))){exp='1N';why=hp+' hp utan 4-korts stöd eller färg på 1-nivå: 1NT (6-10).'}
    else{
      var c2=SU.filter(function(s){return s!==o&&L[s]>=4});
      if(c2.length){var b2=pickBest(c2);exp=lowest(b2,oc);why=hp+' hp och 4+ färg: 2 över 1 (11+, rondkrav).'}
      else return {exp:null,alt:[],why:hp+' hp utan färg att visa: dokumentet beskriver inte detta bud.',means:means,conv:'svar'}
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:htp>=13&&exp==='2N'?'Stenberg':'svar'};
  }

  /* ––––– 1NT / 2NT-STRUKTUR (Plus) ––––– */

  function reb1(h,oc,r,partnerCards){
    var o=st_(oc),hp=h.hp,L=h.L,rs=st_(r),exp,why,alt=[],soft=false,reverseBid=null;

    var means=function(c){
      if(c===reverseBid&&reverseBid)return 'Reverse: 18+ HPS och minst 5-4 i öppningsfärgen och den nya färgen. HPS räknas enligt reglerna för egen 6+-färg eller 5-5, utan krav på fastställd trumf.';
      if(r==='2N'){var Ma=maj(o);
        if(c==='3N')return '12-14 hp, balanserad hand.';
        if(c==='3'+o)return '15+ htp utan singel: extra styrka.';
        if(isBid(c)&&lv(c)===3)return 'Singel i '+SYM[c[1]]+' (12-15 hp).';return null}
      if(rs===o&&lv(r)===2){if(c==='4'+o)return '20+ htp: utgång.';if(c==='3'+o)return '17-19 htp, naturlig invit.';if(isBid(c)&&lv(c)===3)return '17-19 htp med singel i den bjudna färgen.';if(c==='P')return 'Pass: 13-15 stp.'}
      if(rs!==o&&rs!=='N'&&c===lv(r)+1+rs)return 'Trumfstöd, lägsta höjning: 12-16 stp.';
      if(rs!==o&&rs!=='N'&&c===(lv(r)+2)+rs)return 'Trumfstöd, enkelhopp: 17-19 stp.';
      if(isBid(c)&&st_(c)===o&&rs!==o)return 'Egen färg.';
      if(c==='1N'||c==='2N'&&lv(r)===1&&r!=='1N')return c==='1N'?'12-14 hp, balanserad (NT på lägsta nivå).':'18-19 hp, balanserad (hopp i NT).';
      if(r==='1N'&&c==='2N')return '18-19 hp, balanserad (2NT när partnern bjöd 1NT).';
      if(r==='1N'&&c==='P')return 'Pass: 12-17 hp med 4-4-4-1 får stanna i 1NT.';
      if(r==='1N'&&isBid(c)&&c[1]!=='N'&&c[1]!==o)return '4-4-4-1: visar en annan fyrkortsfärg på 2-nivån trots bara fyra kort.';
      if(r==='1N'&&c==='P')return 'Pass: 12-14 balanserad.';
      if(isBid(c)&&st_(c)!=='N'&&st_(c)!==o&&st_(c)!==rs)return 'Andra färg.';
      return null};

    if(r==='2N'){
      var sg=h.singles().filter(function(s){return L[s]===1&&s!==o});
      if(sg.length>1){
        return {exp:null,alt:[],why:'Flera sidofärger är singel. Systemunderlaget anger ingen prioritet mellan dem; välj inte ett godtyckligt 3-bud.',means:means,conv:'Stenberg'};
      }
      if(sg.length===1){var s1=sg[0];exp='3'+s1;why='Singel i '+SYM[s1]+': visa den på 3-nivå.';soft=true}
      else if(h.htp(o)>=15){exp='3'+o;why=h.htp(o)+' htp utan singel: 3 i färgen (15+).';}
      else if(h.bal&&h.hp>=12&&h.hp<=14){exp='3N';why=h.hp+' hp, balanserad hand utan singel: 3NT.'}
      else return {exp:null,alt:[],why:'Efter Stenberg: utan 15+ htp, singel eller balanserad 12-14 hp anger dokumentet inte budet.',means:means,conv:'Stenberg'};
      return {exp:exp,alt:alt,why:why,means:means,conv:'Stenberg',soft:soft};
    }
    if(rs===o){
      // 3M is an invit with 10–12 HTP and at least four-card support.
      // Accept only when the partnership reaches the agreed 26 playing-point game threshold.
      if(lv(r)===3&&maj(o)){
        var inviter=H(partnerCards||[]),majorFit=h.L[o]+inviter.L[o];
        var combinedMajorPoints=partnershipPoints(h,inviter,o);
        if(majorFit>=8&&combinedMajorPoints>=26){
          return {exp:'4'+o,alt:[],why:majorFit+'-korts fit i '+SYM[o]+' och '+combinedMajorPoints+' gemensamma spelpoäng: acceptera 3'+SYM[o]+'-inviten till utgång.',means:function(c){return c==='4'+o?'Accepterar högfärgsinvit med 26+ gemensamma spelpoäng.':null},conv:'invit i högfärg'};
        }
        return {exp:'P',alt:[],why:majorFit+'-korts fit i '+SYM[o]+' men endast '+combinedMajorPoints+' gemensamma spelpoäng: under 26, avslå inviten och passa.',means:function(c){return c==='P'?'Avslår 3'+SYM[o]+'-inviten under 26 gemensamma spelpoäng.':null},conv:'invit i högfärg'};
      }
      if(lv(r)===2&&maj(o)){var t=h.htp(o);
        if(t>=20){exp='4'+o;why=t+' htp: utgång (20+).'}
        else if(t>=17){
          var sg2=SU.filter(function(s){return s!==o&&L[s]===1});
          if(sg2.length>1)return {exp:null,alt:[],why:'17-19 HTP och singel i flera sidofärger. Systemunderlaget anger ingen prioritet mellan färgerna; välj inte ett godtyckligt återbud.',means:means,conv:'trumfstöd'};
          if(sg2.length===1){exp=lowest(sg2[0],r);alt=['3'+o];why=t+' htp med singel: ny färg (17-19).'}
          else{exp='3'+o;why=t+' htp utan singel: 3 i färgen (17-19, invit).'}
        }
        else{exp='P';why=t+' htp: högst 16, pass.'}
        return {exp:exp,alt:alt,why:why,means:means,conv:'trumfstöd',soft:true};}
      if(!maj(o)&&lv(r)>=2&&h.bal&&h.hp>=18){
        return {exp:'3N',alt:[],why:h.hp+' hp och jämn fördelning efter partnerns lågfärgshöjning: välj 3NT före utgång i lågfärg.',means:function(c){return c==='3N'?'18+ hp och jämn fördelning: sang prioriteras framför lågfärgsutgång.':null},conv:'trumfstöd'};
      }
      if(!maj(o)&&lv(r)>=2&&h.hp<=14){
        return {exp:'P',alt:[],why:'Öppnaren har minimum eller normal styrka efter partnerns lågfärgshöjning. Pass tills vidare; starkare fortsättning kräver ytterligare stöd eller styrka.',means:means,conv:'trumfstöd'};
      }
      return {exp:null,alt:[],why:'Fortsättningen efter denna höjning beskrivs inte i dokumentet.',means:means,conv:'trumfstöd'};
    }
    var low=function(s){return lowest(s,r)};
    var sup=rs!=='N'&&L[rs]>=4;
    var side4=SU.filter(function(s){return s!==o&&L[s]>=4});
    if(sup){var tp=h.htp(rs);
      if(tp<=16){exp=low(rs);why='4+ stöd i '+SYM[rs]+' och '+tp+' htp: lägsta höjning (12-16).'}
      else if(tp<=19){exp=jump(rs,r);why=tp+' htp med stöd: enkelhopp (17-19).'}
      else if(maj(rs)){exp='4'+rs;why=tp+' htp: hopp till utgång (20+).'}
      else return {exp:null,alt:[],why:'Med 20+ htp och lågfärgsstöd ska man först undersöka 3NT; dokumentet anger inte budet.',means:means,conv:'öppnarens 2:a bud'};
      soft=false;
    }else if(L[o]>=6&&!SU.some(function(s){return s!==o&&L[s]>=4})){
      if(hp<=14){exp=low(o);why='Egen 6+ färg utan sidofärg: lägsta nivå (12-14).'}
      else if(hp<=17){exp=jump(o,r);why='Egen 6+ färg: enkelhopp (15-17).'}
      else if(hp>=18){exp=maj(o)?'4'+o:NC('Dokumentet anger inte budet för denna hand.',means).exp;why='Egen 6+ högfärg, 18+: utgång.'}
      else return NC('Dokumentet anger inte budet för denna hand.',means);
    }else if(r==='1N'&&h.shape==='4441'){
      if(hp>=18&&hp<=19){exp='2N';why='4-4-4-1 med 18-19 hp: bjud 2NT.';}
      else if(hp>=12&&hp<=17){
        var fourCardRebids=SU.filter(function(s){return s!==o&&L[s]===4;}).sort(function(a,b){return rk(low(a))-rk(low(b));});
        if(fourCardRebids.length){exp=low(fourCardRebids[0]);alt=['P'];why='4-4-4-1 med '+hp+' hp efter 1NT: visa den lägsta möjliga andra fyrkortsfärgen på 2-nivån trots bara fyra kort. Pass på 1NT är också tillåtet.';}
        else return NC('4-4-4-1 efter 1NT men ingen annan fyrkortsfärg kan visas enligt budordningen.',means);
      }else return NC('4-4-4-1 efter 1NT: styrkan ligger utanför de angivna 12-19 hp-intervallen.',means);
    }else if(h.bal){
      if(r==='1N'){if(hp<=14){exp='P';why='Balanserad 12-14: pass efter partnerns 1NT.'}else if(hp>=18&&hp<=19){exp='2N';why='Balanserad 18-19: 2NT.'}else return NC('Dokumentet anger inte budet för denna styrka.',means)}
      else if(hp<=14){exp=low('N');why='Balanserad 12-14: NT på lägsta nivå.'}
      else if(hp>=18&&hp<=19){exp=jump('N',r);why='Balanserad 18-19: hopp i NT.'}
      else return NC('Dokumentet anger inte budet för balanserad hand med '+hp+' hp i denna situation.',means);
    }else{
      var s2=side4.filter(function(s){return s!==rs&&L[o]+L[s]>=9}).sort(function(a,b){return L[b]-L[a]})[0];
      if(s2){
        var x=low(s2);
        var reverseCandidate=SU.indexOf(s2)>SU.indexOf(o)&&SU.indexOf(s2)>SU.indexOf(rs)&&lv(r)===1;
        var reverse=reverseCandidate&&L[o]>=5&&L[s2]>=4;
        var hps=handHps(h,null);
        if(reverse){
          reverseBid=(lv(r)+1)+s2;
          if(hps>=18){
            exp=reverseBid;
            why='Reverse (andra färgen högre än öppningsfärgen och svarsfärgen): '+hps+' HPS, 18+ och minst 5-4.';
          }else if(L[o]>=5){
            exp=low(o);
            why='Under 18 HPS för reverse: bjud om första färgen (visar 5+ färg).';
          }else return NC('Dokumentet anger inte budet.',means);
        }else if(reverseCandidate){
          exp=x;
          why='Reverse kräver minst 5 kort i öppningsfärgen och 4 i den nya färgen. Visa den nya färgen på lägsta nivå.';
        }else if(hps>=18){
          exp=jump(s2,r);
          why='Hopp i andra färgen: '+hps+' HPS, 18+ och minst 5-4.';
        }else{
          exp=x;
          why='Andra färgen på lägsta nivå: 12-17 hp med 5-4.';
        }
      }else if(L[o]>=5){exp=low(o);why='Bjuder om första färgen (5+ kort).';soft=true}
      else return NC('Dokumentet anger inte budet för denna hand.',means);
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'öppnarens 2:a bud',soft:soft};
  }

  /* ––––– RKC / BLACKWOOD 5 ESS ––––– */

 return {resp1:resp1,reb1:reb1};
});
