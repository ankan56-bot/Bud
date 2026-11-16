/* RattningSang: separat regelmodul. Reglerna är flyttade utan avsiktlig beteendeförändring. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningSangFactory=factory;
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
  function ntResp(h,k,openerCards){
    var hp=h.hp,L=h.L,b=2+k,Hs=maj,exp,why,alt=[],soft=false,ruleStatus=null;
    var opener=openerCards?H(openerCards):null;
    var jointHp=hp+(opener?opener.hp:0);
    var lo=k?5:8,gl=k?5:10;
    var c2=(b)+'C',d2=(b)+'D',h2=(b)+'H',s2=(b)+'S',n2=(b)+'N';
    var means=function(c){
      if(c==='P')return 'Pass: dåliga kort utan färg att visa.';
      if(c===c2)return 'Fråga efter 4-korts högfärg (Stayman). Bör själv ha någon 4-högfärg.';
      if(c===d2)return 'Överföring: minst 5-korts ♥.';
      if(c===h2)return 'Överföring: minst 5-korts ♠.';
      if(!k&&c==='2S')return 'Dåliga kort med minst 6-korts lågfärg. Vill hellre spela 3 i lågfärg.';
      if(!k&&c==='2N')return 'Naturlig invit med balanserad hand utan 4-korts högfärg.';
      if(!k&&(c==='3C'||c==='3D'))return 'Invit med bra 6+ lågfärg.';
      if(c==='3N')return 'Slutbud (utgång i sang).';
      return null};
    var conv='1NT-svar';
    if(L.H>=5&&L.S>=5){exp=h2;alt=[d2];why='5-5 i högfärgerna: överföring till ♠ (och sedan 3♥ som invit).';conv='överföring'}
    else if(L.H>=5||L.S>=5){var M=L.H>=5?'H':'S';exp=M==='H'?d2:h2;why='5+ '+SYM[M]+': överföring.';conv='överföring'}
    else if((k?hp>=lo:true)&&(L.H===4||L.S===4)){exp=c2;why=(L.H===4||L.S===4?'Egen fyrkortshögfärg: Stayman enligt Nordisk standard.':'')+(k?' ('+hp+' hp efter 2NT).':'');conv='Stayman';soft=false}
    else if(!k&&(L.C>=6||L.D>=6||(L.C>=5&&L.D>=5))){
      return NC('Handen har 6+ kort i en lågfärg eller 5-5 i lågfärgerna. Nordisk standard skiljer mellan 2♠-relä med dåliga kort och 3 lå-invit med bra 6+ lå, men definierar inte numeriskt vad som är dåliga respektive bra kort/färg. Numerisk styrke-/kvalitetsgräns saknas; situationen lämnas ej täckt i stället för att välja med en påhittad gräns.',means,conv,true);
    }
    else if(hp>=lo&&hp<gl&&!k){
      return NC('Nordisk standard s. 4 anger 2NT som naturlig invit med balanserad hand utan 4-korts högfärg, men anger inte ett numeriskt HP-intervall. Ingen egen gräns införs; situationen lämnas ej täckt.',means,conv,true);
    }
    else if(hp>=gl){
      if(!k){
        // User explicitly accepted 25 HCP for no-trump game on 2026-11-14.
        var jointMin=hp+15;
        if(!opener&&jointMin>=25){exp='3N';ruleStatus='user_confirmed';why=hp+' egna hp plus minst 15 hp från 1NT-öppnaren: minst 25 gemensamma hp. 3NT är slutbud.';}
        else if(opener&&jointHp>=25){exp='3N';ruleStatus='user_confirmed';why=hp+' egna hp och '+jointHp+' gemensamma hp: når den bekräftade 25-hp-gränsen för 3NT.';}
        else return NC('Paret når inte säkert 25 gemensamma hp för 3NT. Den naturliga 2NT-inviten saknar numeriskt styrkeintervall i källan; situationen lämnas ej täckt.',means,conv,true);
      }else{
        var twoNTMin=hp+20;
        if(!opener&&twoNTMin>=25){exp='3N';ruleStatus='user_confirmed';why=hp+' egna hp plus minst 20 hp från 2NT-öppnaren: minst 25 gemensamma hp. 3NT är slutbud.';}
        else if(opener&&jointHp>=25){exp='3N';ruleStatus='user_confirmed';why=hp+' egna hp och '+jointHp+' gemensamma hp: når 25-hp-gränsen för 3NT.';}
        else return NC('Paret når inte säkert 25 gemensamma hp för 3NT efter 2NT-öppning; situationen lämnas ej täckt.',means,conv,true);
      }
      soft=false;
    }
    else return NC('Svarshanden saknar de uttryckliga färgprofilerna för Stayman, överföring eller lågfärgsrelä. Pass med dåliga kort är en kvalitativ möjlighet, men Nordisk standard s. 4 anger ingen numerisk gräns för när pass ska väljas; handen lämnas ej täckt.',means,conv,true);
    return {exp:exp,alt:alt,why:why,means:means,conv:conv,soft:soft,ruleStatus:ruleStatus};
  }
  function ntOpener(h,k,r,responderCards){
    var L=h.L,hp=h.hp,b=2+k,c2=b+'C',d2=b+'D',h2=b+'H',s2=b+'S',n2=b+'N',exp,why,alt=[],soft=false,conv='1NT-system';
    var responder=responderCards?H(responderCards):null,jointHp=hp+(responder?responder.hp:0);
    var means=function(c){
      if(r===c2){if(c===b+'D')return 'Ingen 4+ högfärg.';if(c===b+'H')return '4-5 korts ♥ (kan ha 4-4 i högfärg).';if(c===b+'S')return '4-5 korts ♠.'}
      if(r===d2){if(c===h2)return 'Fullföljer överföringen (visar 2+ ♥).';if(c===(b+1)+'H')return 'Max och 4+ ♥: kan bjuda 3♥ i stället för 2♥.'}
      if(r===h2){if(c===s2)return 'Fullföljer överföringen.';if(c===(b+1)+'S')return 'Max och 4+ ♠: kan bjuda 3♠ i stället.'}
      if(!k&&r==='2S'){if(c==='2N')return 'Längre ♦ än ♣ eller lika längd i lågfärg.';if(c==='3C')return 'Längre ♣ än ♦.'}
      if(r===b+'N'){if(c==='P')return 'Avslår 2NT-inviten; numerisk acceptgräns anges inte i Nordisk standard.';if(c==='3N')return 'Accepterar 2NT-inviten; numerisk acceptgräns anges inte i Nordisk standard.'}
      if(c==='P')return 'Pass (slutbud).';
      return null};

    if (r === b+'N') {
        if(!k){
          if(!responder)return NC('2NT efter 1NT är en naturlig invit. Livebeslutet får inte läsa partnerns dolda hp; efter given accepteras med 3NT vid minst 25 gemensamma hp.',means,'1NT-system',true);
          if(jointHp<25)return {exp:'P',alt:[],why:jointHp+' gemensamma honnörspoäng: under 25-hp-gränsen för 3NT, avslår 2NT-inviten.',means:means,conv:'1NT-system',soft:false,ruleStatus:'user_confirmed'};
          return {exp:'3N',alt:[],why:jointHp+' gemensamma honnörspoäng: når 25-hp-gränsen för 3NT och accepterar 2NT-inviten.',means:means,conv:'1NT-system',soft:false,ruleStatus:'user_confirmed'};
        }
        return {exp:'P',alt:[],why:'3NT är slutbud efter 2NT-öppning enligt Nordisk standard.',means:means,conv:'2NT-system'};
    }

    if(r===c2){conv='Stayman';exp=L.H>=4?h2:L.S>=4?s2:d2;
      why=L.H>=4?'4+ ♥ (även 4-4 i högfärg): 2♥.':L.S>=4?'4+ ♠ utan ♥: 2♠.':'Ingen 4-korts högfärg: 2♦.';
      if(L.H>=4&&L.S>=5)alt=[s2]}
    else if(r===d2||r===h2){conv='överföring';var M=r===d2?'H':'S';
      if(hp>=17&&L[M]>=4&&!k){exp=(b+1)+M;alt=[b+M];why='Max (17 hp) och 4+ '+SYM[M]+': får bjuda 3 i färgen, men 2 i färgen är det vanliga.'}
      else{exp=b+M;why='Fullföljer överföringen.'}}
    else if(!k&&r==='2S'){conv='1NT-svar';exp=L.C>L.D?'3C':'2N';why=L.C>L.D?'Längre ♣ än ♦: 3♣.':'Längre ♦ än ♣ eller lika: 2NT.'}
    else if(!k&&(r==='3C'||r==='3D')){
      var m=r[1],topHonor=[14,13,12].some(function(n){return h.has(m,n)});
      if((L[m]===2||L[m]===3)&&topHonor){exp='3N';why='Topphonnör i 2–3-kortsstödet i den bjudna lågfärgen: söker 3NT enligt Nordisk standard s. 4.';}
      else if((L[m]===2||L[m]===3)&&!topHonor){exp='P';why='Endast xx/xxx i stödfärgen: passar enligt Nordisk standard s. 4.';}
      else return NC('Efter invitbudet 3'+m+' är endast pass med xx/xxx i stöd eller 3NT med topphonnör uttryckligen beskrivet. Övrig stödlängd utan topphonnör lämnas ej täckt.',means,'1NT-svar',true);
      soft=true;
    }
    else if(r==='3N'||(!k&&r==='2N'&&false)){exp='P';why='Slutbud: pass.'}
    else return NC('Öppnarens svar på detta bud beskrivs inte i dokumentet; fortsättningen lämnas ej täckt.',means,conv,true);
    return {exp:exp,alt:alt,why:why,means:means,conv:conv,soft:soft};
  }
  function stay2(h,reply,openerCards){
    var hp=h.hp,L=h.L,M=reply==='2H'?'H':reply==='2S'?'S':null,exp,why,alt=[];
    var opener=openerCards?H(openerCards):null;
    var jointHcp=hp+(opener?opener.hp:0);
    var fit=opener&&M?L[M]+opener.L[M]:0;

    var means=function(c){
      if(/^3[HS]$/.test(c))return 'Invit i öppnarens visade högfärg; exakt numerisk styrkegräns anges inte i Nordisk standard.';
      if(c==='2N')return 'Balanserad invit; efter Stayman 2♥ visar 2NT exakt fyra spader. Numerisk invitgräns anges inte i Nordisk standard.';
      if(c==='3N')return 'Utgång i sang utan fastställd högfärgsfit; numerisk HP-gräns anges inte i Nordisk standard.';
      if(c==='4H'||c==='4S')return 'Utgång i högfärgen med minst 8-korts fit; exakt acceptgräns efter Stayman anges inte här.';
      return null};
    // Nordisk standard s. 4: after a 2♥ Stayman answer, responder's
    // 2NT shows exactly four spades; a new suit is natural and game-forcing
    // (5+ major or 4+ minor). The same natural GF principle applies after 2♠.
    if(reply==='2H'&&L.S===4){
      // The 2NT route shows four spades and is described as an invitation.
      // The PDF gives opener's 4-4 response (3S minimum / 4S maximum), but
      // does not state responder's numeric threshold for choosing it.
      return NC('Exakt fyra spader efter Stayman 2♥ är visat. 2NT är den särskilda invitvägen, men Nordisk standard anger inte svarshandens numeriska styrkegräns för att välja mellan pass och denna invit. Ingen numerisk HP-gräns eller egen HP-regel överförs hit.',function(c){if(c==='2N')return 'Invit med exakt fyra spader; öppnaren visar 4-4 i högfärgerna med 3♠/4♠ enligt styrka.';return null},'Stayman',true);
    }
    var naturalNew=[];
    if(reply==='2D'){
      if(L.H>=5)naturalNew.push('H');
      if(L.S>=5)naturalNew.push('S');
      if(L.C>=4)naturalNew.push('C');
      if(L.D>=4)naturalNew.push('D');
    }else if(reply==='2H'){
      if(L.S>=5)naturalNew.push('S');
      ['C','D'].forEach(function(suit){if(L[suit]>=4)naturalNew.push(suit);});
    }else if(reply==='2S'){
      if(L.H>=5)naturalNew.push('H');
      ['C','D'].forEach(function(suit){if(L[suit]>=4)naturalNew.push(suit);});
    }
    if(naturalNew.length===1){
      var ns=naturalNew[0],newBid=lowest(ns,reply);
      return {exp:newBid,alt:[],why:'Ny färg efter Stayman: '+(maj(ns)?'minst fem kort i högfärgen':'minst fyra kort i lågfärgen')+' och utgångskrav enligt Nordisk standard s. 4.',means:function(c){return c===newBid?'Naturlig ny färg, utgångskrav.':null},conv:'Stayman'};
    }
    if(naturalNew.length>1)
      return NC('Efter Stayman uppfyller flera nya färger längdkravet för naturligt utgångskrav. Nordisk standard s. 4 anger ingen prioritet mellan dem.',null,'Stayman',true);
    // Explicit invit routes from Nordisk standard s. 4. The hand shape
    // can identify the shown major, but the source gives no numeric
    // strength boundary for choosing this invit.
    if(M&&L[M]>=4){
      return NC('3'+M+' är invit i öppnarens visade högfärg efter Stayman enligt Nordisk standard s. 4. Den numeriska styrkegränsen för att välja inviten anges inte; situationen lämnas ej täckt.',function(c){return c==='3'+M?'Invit i öppnarens visade högfärg.':null},'Stayman',true);
    }
    if(reply==='2S'&&h.bal){
      return NC('2NT är naturlig invit efter Stayman 2♠ enligt Nordisk standard s. 4. Numerisk styrkegräns saknas; situationen lämnas ej täckt.',function(c){return c==='2N'?'Naturlig sanginvit efter Stayman 2♠.':null},'Stayman',true);
    }
    if(!opener){
      if(reply==='2D'&&hp>=10&&h.bal)return {exp:'3N',alt:[],why:hp+' egna hp plus minst 15 hp från 1NT-öppnaren: minst 25 gemensamma hp. 3NT.',means:means,conv:'Stayman',ruleStatus:'user_confirmed'};
      return NC('Efter Stayman saknas partnerns exakta hand live. 25 gemensamma hp krävs för 3NT; 10+ egna hp efter 2♦ garanterar detta mot 1NT-minimum. Övriga fall lämnas ej täckta.',means,'Stayman',true);
    }
    if(M&&L[M]>=4&&opener&&fit>=8){
      return NC('Minst 8-korts fit efter Stayman är känd, men Nordisk standard anger inte en särskild numerisk acceptgräns för att välja 4M framför invit eller pass i denna Staymanfortsättning. Den separata 26-poängsgränsen för högfärgsutgång från andra sekvenser överförs inte hit; lämnas ej täckt.',means,'Stayman',true);
    }else{
      var five=L.H>=5?'H':L.S>=5?'S':null;
      if(reply==='2D'&&five&&!h.bal)
        return NC('Obalanserad svarshand med 5-korts högfärg efter Stayman 2♦ kan fortsätta med 3 i högfärgen vid utgångsstyrka, men den numeriska styrkegränsen är inte angiven.',means,'Stayman',true);
      if(reply==='2D'&&h.bal&&jointHcp>=25){exp='3N';why='Ingen högfärgsfit och '+jointHcp+' gemensamma honnörspoäng: 25+ ger 3NT.';}
      else return NC('Ingen högfärgsfit är fastställd och paret når inte 26 gemensamma honnörspoäng för 3NT. Naturlig invitstyrka har ingen numerisk gräns i källan; pass/invit lämnas ej täckt.',means,'Stayman',true);
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'Stayman',ruleStatus:exp==='3N'?'user_confirmed':undefined};
  }
  function transfer2(h,M){
    var L=h.L,exp,why,alt=[];
    var minors=['C','D'];
    var means=function(c){
      if(c==='P')return 'Svag hand med minst fem kort i överföringsfärgen; exakt styrkegräns anges inte.';
      if(c==='2N')return 'Invit med jämn hand och exakt fem kort i överföringsfärgen.';
      if(c==='3'+M)return 'Invit med minst sex kort i överföringsfärgen.';
      if(c==='3N')return 'Välj sangutgång med jämn hand och exakt fem kort i överföringsfärgen.';
      if(c==='4'+M)return 'Slutbud i överföringsfärgen.';
      if(M==='H'&&c==='2S')return 'Rondkrav med minst 5♥ och 4+♠.';
      if(c==='3C'||c==='3D')return 'Utgångskrav med minst fem kort i överföringsfärgen och 4+ i bjuden lågfärg.';
      if(M==='S'&&c==='3H')return 'Invit med minst 5-5 i båda högfärgerna.';
      if(c==='4C'||c==='4D')return 'Kontrollbud och slamintresse i överföringsfärgen.';
      if(c==='4N')return 'RKC med överföringsfärgen som trumf.';
      return null;
    };

    if(L[M]<5)
      return NC('Överföringssekvensen visar minst fem kort i '+SYM[M]+', men den egna handen uppfyller inte längdkravet. Situationen lämnas ej täckt.',means,'överföring',true);

    // These special continuations are explicitly described by the source.
    // If more than one shape condition applies, the PDF gives no priority.
    var special=[];
    if(M==='H'&&L.S>=4)
      special.push({bid:'2S',why:'Minst 5♥ och 4+♠: 2♠ är rondkrav enligt Nordisk standard s. 5.'});
    minors.filter(function(suit){return L[suit]>=4;}).forEach(function(suit){
      special.push({bid:'3'+suit,why:'Minst 5'+SYM[M]+' och 4+ '+SYM[suit]+': 3 i lågfärgen är utgångskrav enligt Nordisk standard s. 5.'});
    });
    if(M==='S'&&L.H>=5)
      return NC('Minst 5-5 i högfärgerna efter spaderöverföring. Nordisk standard s. 5 anger 3♥ som invit, men styrkegränsen för att välja invitvägen anges inte; handen lämnas ej täckt.',means,'överföring',true);
    if(special.length>1)
      return NC('Handen uppfyller flera särskilda fortsättningsbeskrivningar efter överföring ('+special.map(function(x){return x.bid;}).join(', ')+'). Nordisk standard anger ingen prioritet mellan dessa överlappande grenar; situationen lämnas ej täckt.',means,'överföring',true);
    if(special.length===1){
      if(special[0].bid==='3H'&&M==='S')
        return NC('Minst 5-5 i högfärgerna identifierar 3♥ som invit efter spaderöverföring, men källan anger ingen numerisk styrkegräns för när inviten ska väljas framför pass eller utgång. Situationen lämnas ej täckt.',means,'överföring',true);
      return {exp:special[0].bid,alt:[],why:special[0].why,means:means,conv:'överföring'};
    }

    // The source gives the meanings of pass, invitation and game-choice
    // continuations, but does not quantify "weak", "invite" or game strength.
    // Do not turn these qualitative descriptions into invented HCP bands.
    if(h.bal&&L[M]===5)
      return NC('Jämn hand med exakt fem kort i överföringsfärgen: källan beskriver både 2NT-invit och 3NT som val av utgång, men anger ingen numerisk styrkegräns för valet. Situationen lämnas ej täckt.',means,'överföring',true);
    if(L[M]>=6)
      return NC('Minst sex kort i överföringsfärgen: källan beskriver 3M som invit och 4M som slutbud, men anger ingen numerisk styrkegräns för valet. Situationen lämnas ej täckt.',means,'överföring',true);
    return NC('Överföringshanden uppfyller inte någon av de särskilt beskrivna fortsättningsprofilerna. Källan anger ingen fullständig fortsättningsregel för denna handtyp; situationen lämnas ej täckt.',means,'överföring',true);
  }
  function ntOpenerInvit(h,M,inv,responderCards){
    var means=function(c){
      if(c==='P')return 'Öppnarens accept/pass efter invit; exakta acceptkriterier anges inte i Nordisk standard s. 5.';
      if(c==='3N')return 'Utgång i sang efter invit utan etablerad högfärgsfit.';
      if(c==='4'+M)return 'Utgång i överföringsfärgen efter invit.';
      return null};
    if(inv!=='2N'&&inv!=='3'+M)
      return NC('Öppnarens svar på detta bud beskrivs inte i dokumentet; fortsättningen lämnas ej täckt.',means,'överföring',true);
    return NC('Nordisk standard s. 5 beskriver 2NT/3M som inviter efter överföring men anger inte öppnarens numeriska accept-/passgräns. Den separata 26-poängsgränsen för andra högfärgssekvenser överförs inte hit; fortsättningen lämnas ej täckt.',means,'överföring',true);
  }
  function ntOpener3(h,k1,k2,k3,responderCards){
    var L=h.L,hp=h.hp,partner=responderCards?H(responderCards):null,jointHp=hp+(partner?partner.hp:0);
    if(k1==='2S'&&((k2==='2N'&&(k3==='3C'||k3==='3D'))||(k2==='3C'&&k3==='3D'))){
      return {exp:'P',alt:[],why:'Svarshanden har valt slutbud i lågfärg efter 2♠-reläet. Pass avslutar budgivningen.',means:function(c){return c==='P'?'Pass efter svarshandens val av lågfärg.':null},conv:'1NT-svar'};
    }
    var M = st_(k2);
    if(k1==='2C'&&M==='D'&&k3==='2N'){
      var meansNoMajor=function(c){if(c==='P')return 'Passar när paret inte når 25 gemensamma honnörspoäng.';if(c==='3N')return 'Accepterar när paret når 25 gemensamma honnörspoäng.';return null};
      if(!partner)return NC('Efter Stayman 2♦–2NT är 2NT en balanserad sanginvit. Livebeslutet får inte använda partnerns dolda hand; efter given är 25 gemensamma hp den användaraccepterade 3NT-gränsen.',meansNoMajor,'Stayman',true);
      if(jointHp<25)return {exp:'P',alt:[],why:jointHp+' gemensamma honnörspoäng: under 25-hp-gränsen, avslår 2NT-inviten efter Stayman 2♦.',means:meansNoMajor,conv:'Stayman',ruleStatus:'user_confirmed'};
      return {exp:'3N',alt:[],why:jointHp+' gemensamma honnörspoäng: accepterar 2NT-inviten med 3NT.',means:meansNoMajor,conv:'Stayman',ruleStatus:'user_confirmed'};
    }
    if(k1==='2C'&&M==='H'&&k3==='2N'){
      // Nordisk standard s. 4: 2NT visar fyra spader hos svarshanden.
      // Med 4-4 i högfärgerna väljer öppnaren 3♠ med minimum och 4♠ med maximum.
      var meansHeartStaymanInvite=function(c){
        if(c==='3S')return '4-4 i högfärgerna och minimum (15–16 hp): visar spaderfit på invitnivå.';
        if(c==='4S')return '4-4 i högfärgerna och maximum (17 hp): accepterar inviten i spader.';
        return null;
      };
      if(L.H===4&&L.S===4){
        if(hp===17)return {exp:'4S',alt:[],why:'4-4 i högfärgerna och 17 hp (maximum): accepterar 2NT-inviten med 4♠.',means:meansHeartStaymanInvite,conv:'Stayman'};
        if(hp>=15&&hp<=16)return {exp:'3S',alt:[],why:'4-4 i högfärgerna och '+hp+' hp (minimum): visar spaderfit med 3♠.',means:meansHeartStaymanInvite,conv:'Stayman'};
      }
      return NC('Nordisk standard s. 4 anger öppnarens 3♠/4♠-val efter 2NT när öppnaren har 4-4 i högfärgerna. Övriga handtyper i denna fortsättning är inte tillräckligt specificerade.',meansHeartStaymanInvite,'Stayman');
    }
    if(k1==='2C'&&M==='H'&&k3==='3N'){
      // Nordisk standard s. 4: 3NT visar också fyra spader hos svarshanden.
      // Öppnaren kan välja 4♠ när den egna handen är 4-4 i högfärgerna.
      var meansHeartStaymanGame=function(c){
        if(c==='4S')return '4-4 i högfärgerna: väljer 4♠ efter svarshandens 3NT.';
        if(c==='P')return 'Ingen 4-4 i högfärgerna: passar på 3NT.';
        return null;
      };
      if(L.H===4&&L.S===4)return {exp:'4S',alt:[],why:'4-4 i högfärgerna: väljer 4♠ efter svarshandens 3NT enligt Nordisk standard s. 4.',means:meansHeartStaymanGame,conv:'Stayman'};
      return {exp:'P',alt:[],why:'Öppnaren har inte 4-4 i högfärgerna; passar på 3NT.',means:meansHeartStaymanGame,conv:'Stayman'};
    }
    if(k1==='2C'&&(M==='H'||M==='S')&&k3==='3'+M){
      var gameSuit='4'+M;
      var meansInvite=function(c){if(c==='P')return 'Öppnarens accept/pass efter Stayman-invit; numeriska acceptkriterier anges inte i Nordisk standard.';if(c===gameSuit)return 'Möjlig utgång efter Stayman-invit; acceptkriterierna är inte fastställda här.';return null};
      return NC('Svarshanden har inviterat med 3'+M+' efter Stayman. Nordisk standard anger inte öppnarens numeriska accept-/passgräns för denna Staymanfortsättning. Den separata 26-poängsgränsen för andra högfärgssekvenser överförs inte hit.',meansInvite,'Stayman',true);
    }
    if(k1==='2C'&&(M==='H'||M==='S')&&k3==='3N'){
      var means2=function(c){return c==='P'?'Passar på utgångsbudet.':null};
      return {exp:'P', alt:[], why:'Slutbud: pass.', means:means2, conv:'Stayman'};
    }
    return NC('Fortsättningen beskrivs inte i dokumentet; lämnas ej täckt.',null,'1NT-system',true);
  }
  function ntOpener3NTChoice(h,M){
    var L=h.L;
    var means=function(c){
      if(c==='P')return 'Passar på 3NT när öppnarens hand inte har minst tre kort i överföringsfärgen.';
      if(c==='4'+M)return 'Öppnarens möjliga korrigering till högfärgsutgång vid 3+ stöd är inte definierad i Nordisk standard s. 5.';
      return null;
    };
    if(L[M]>=3)
      return NC('Svarshanden har valt 3NT som utgång efter överföring. Öppnaren har 3+ kort i överföringsfärgen, men Nordisk standard s. 5 anger inte om öppnaren ska korrigera till 4M eller passa. Fortsättningen lämnas ej täckt.',means,'överföring',true);
    return {exp:'P',alt:[],why:'Svarshanden har valt 3NT som utgång. Öppnaren har färre än tre kort i överföringsfärgen och passar.',means:means,conv:'överföring'};
  }

  /* ––––– 2♣-ÖPPNING (Nordisk standard / Herbert) ––––– */

  return {ntResp,ntOpener,stay2,transfer2,ntOpenerInvit,ntOpener3,ntOpener3NTChoice};
});
