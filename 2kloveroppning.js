/* Separat regelmodul: Rattning2Klover. Reglerna är flyttade, inte omskrivna. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.Rattning2KloverFactory=factory;
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
  function opening(h){
    var hp=h.hp;
    if(hp>=22||(!h.bal&&hp>=20)){
      return {exp:'2C',alt:[],why:h.bal?hp+' hp balanserad hand: öppna 2♣.':hp+' hp obalanserad hand: stark 2♣-öppning, utgångskrav.',conv:'2♣-öppning',means:function(b){return b==='2C'?'Utgångskrav, eller stark balanserad hand.':null}};
    }
    return null;
  }
  function resp2c(h){
    var means=function(c){return c==='2D'?'Väntebud (relä): säger ingenting om ruterfärgen.':'Endast 2♦ används som första svar i detta system.'};
    return {exp:'2D',alt:[],why:'Svarshanden bjuder alltid 2♦ (väntebud) på 2♣, oavsett styrka och fördelning.',means:means,conv:'2♣-system'};
  }
  function reb2c(h,r){
    var L=h.L,hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(r!=='2D')return null;
      if(c==='2H'||c==='2S')return 'Utgångskrav, 5+ '+SYM[c[1]]+'.';
      if(c==='2N')return '22-24 hp, jämn hand.';
      if(c==='3C'||c==='3D')return 'Utgångskrav, 5+ '+SYM[c[1]]+'.';
      if(c==='3N')return '25-27 hp, jämn hand.';
      if(c==='4N')return '28-29 hp, jämn hand (Lathunden s. 24; komplettering utöver NS).';
      return null};
    if(r!=='2D')return {exp:null,alt:[],why:'Endast 2♦-svar hanteras i detta system.',means:means,conv:'2♣-system'};
    if(h.bal&&hp>=22&&hp<=24){exp='2N';why=hp+' hp jämn: 2NT (22-24).'}
    else if(h.bal&&hp>=25&&hp<=27){exp='3N';why=hp+' hp jämn: 3NT (25-27).'}
    else if(h.bal&&hp>=28&&hp<=29){exp='4N';why=hp+' hp jämn: 4NT (28-29 enligt Lathunden s. 24; tillägg som inte anges i Nordisk Standard).';}
    else if(h.bal){return {exp:null,alt:[],why:hp+' hp balanserad hand efter 2♣–2♦ ligger utanför de källbelagda intervallen 22–29 hp. Sekvensen lämnas ej täckt.',means:means,conv:'2♣-system',sourceGap:true};}
    else{
      var mj=['H','S'].filter(function(s){return L[s]>=5});
      var mn=['C','D'].filter(function(s){return L[s]>=6});
      if(mj.length===1){exp='2'+mj[0];why='5+ '+SYM[mj[0]]+': 2 i högfärgen (utgångskrav).'}
      else if(mj.length>1)return {exp:null,alt:[],why:'Obalanserad hand har 5+ i båda högfärgerna efter 2♣–2♦. Nordisk standard anger inte prioritet mellan högfärgerna; lämnas ej täckt.',means:means,conv:'2♣-system',sourceGap:true};
      else if(mn.length===1){exp='3'+mn[0];why='6+ '+SYM[mn[0]]+': 3 i lågfärgen (utgångskrav).'}
      else if(mn.length>1)return {exp:null,alt:[],why:'Obalanserad hand har 6+ i båda lågfärgerna efter 2♣–2♦ och saknar 5-korts högfärg. Nordisk standard anger inte prioritet mellan lågfärgerna; lämnas ej täckt.',means:means,conv:'2♣-system',sourceGap:true};
      else return {exp:null,alt:[],why:'Obalanserad hand utan källbeskriven 5-korts högfärg eller bra 6-korts lågfärg: dokumentet anger inte budet.',means:means,conv:'2♣-system',sourceGap:true}}
    return {exp:exp,alt:alt,why:why,means:means,conv:'2♣-system',soft:false};
  }
  function resp2c2(h,rb,mine){
    var hp=h.hp,L=h.L,exp,why,alt=[];
    var near={'2H':'2S','2S':'2N','3C':'3D','3D':'3H'}[rb];
    var means=function(c){
      if(c===near)return 'Herbertavslag: närmsta bud visar 0-5 hp och ej trumfstöd.';
      if(c==='3'+rb[1]&&maj(rb[1])&&rb[0]==='2')return '6+ hp och 3+ stöd.';
      if(c==='4'+rb[1]&&rb[0]==='2')return '0-5 hp med stöldvärde och 4+ stöd.';
      if(c==='3N')return '6+ hp, jämn hand.';
      if((c==='3H'||c==='3S')&&rb[0]==='3')return '6+ hp och 4+ färg.';
      if(c==='4'+rb[1]&&rb[0]==='3')return '6+ hp, 3+ stöd och slamintresserad.';
      if(c==='5'+rb[1]&&rb[0]==='3')return '0-5 hp med stöldvärde och bra trumfstöd.';
      if(isBid(c)&&rb[0]==='2'&&st_(c)!==rb[1])return '6+ hp och 5+ färg.';
      return null};
    if(!near)return {exp:null,alt:[],why:'Fortsättningen beskrivs inte i dokumentet.',means:means,conv:'2♣-system'};
    var T_=rb[1],single=h.singles().length>0;
    if(rb[0]==='2'){
      if(hp<=5){
        if(L[T_]>=4&&single){exp='4'+T_;alt=[near];why='0-5 hp med 4+ stöd och stöldvärde: 4 i färgen.'}
        else{exp=near;why='0-5 hp utan stödvärde: Herbertavslag.'}
      }else if(L[T_]>=3){exp='3'+T_;why='6+ hp och 3+ stöd: 3 i färgen.'}
      else{var ns=SU.filter(function(s){return s!==T_&&L[s]>=5}).sort(function(a,b){return L[b]-L[a]})[0];
        if(ns){exp=lowest(ns,rb);why='6+ hp och 5+ '+SYM[ns]+': ny färg.'}
        else if(h.bal){exp='3N';why='6+ hp och jämn hand: 3NT.'}
        else return {exp:null,alt:[],why:'Dokumentet anger inte budet för denna hand.',means:means,conv:'2♣-system'}}
    }else{
      var m_=T_;
      if(hp<=5){
        if(L[m_]>=4&&single){exp='5'+m_;alt=[near];why='0-5 hp med stöldvärde och bra trumfstöd: 5 i färgen.'}
        else{exp=near;why='0-5 hp: Herbertavslag.'}
      }else if(L[m_]>=3){exp='4'+m_;why='6+ hp och 3+ stöd: 4 i färgen (slamintresse).'}
      else{var mj=['H','S'].filter(function(s){return L[s]>=4}).sort(function(a,b){return L[b]-L[a]||(a==='H'?-1:1)})[0];
        if(mj){exp='3'+mj;why='6+ hp och 4+ '+SYM[mj]+': 3 i färgen.'}
        else if(h.bal){exp='3N';why='6+ hp och jämn hand: 3NT.'}
        else return {exp:null,alt:[],why:'Dokumentet anger inte budet för denna hand.',means:means,conv:'2♣-system'}}
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'Herbert'};
  }


  // Öppnarens tredje bud efter svarshandens andra bud.
  // Dessa kompletterande fördelningsrutor kommer från Lathunden s. 25.
  // De får inte skriva över Nordisk Standards grundgrenar eller externa
  // hänvisningar till Slam/Plus/PRO.
  function openerThirdAfter2c(h,openerRebid,responderRebid){
    var L=h.L,candidates=[],meansMap={};
    function has54(s){return L[s]>=5&&SU.some(function(t){return t!==s&&L[t]>=4;});}
    function add(b,meaning){candidates.push(b);meansMap[b]=meaning;}
    if(openerRebid==='2S'&&responderRebid==='2N'){
      ['C','D','H'].forEach(function(s){if(has54(s))add('3'+s,'Minst 5-4-fördelning enligt Lathunden s. 25.');});
      if(L.S>=6)add('3S','Minst sexkortsspader enligt Lathunden s. 25.');
      if(candidates.length===1){var only=candidates[0];return {exp:only,alt:[],why:meansMap[only],means:function(b){return meansMap[b]||null;},conv:'2♣-system / Lathunden s. 25',source:'lathunden_s25'};}
      if(candidates.length>1)return NC('Handen uppfyller flera möjliga fördelningsåterbud efter 2♣–2♦–2♠–2NT ('+candidates.join(', ')+'). Lathunden s. 25 anger ingen prioritet; sekvensen lämnas ej täckt.',function(b){return meansMap[b]||null;},'2♣-system / Lathunden s. 25',true);
      return NC('Lathunden s. 25 anger 3♣/3♦/3♥ med minst 5-4-fördelning eller 3♠ med minst sexkortsspader efter 2♣–2♦–2♠–2NT. Handen matchar ingen av dessa profiler.',function(b){return meansMap[b]||null;},'2♣-system / Lathunden s. 25',true);
    }
    if(openerRebid==='3C'&&responderRebid==='3D'){
      if(has54('D'))add('3D','Minst 5-4-fördelning enligt Lathunden s. 25.');
      if(L.H>=6)add('3H','Minst sexkortshjärter enligt Lathunden s. 25.');
      if(has54('S'))add('3S','Minst 5-4-fördelning enligt Lathunden s. 25.');
      if(candidates.length===1){var one=candidates[0];return {exp:one,alt:[],why:meansMap[one],means:function(b){return meansMap[b]||null;},conv:'2♣-system / Lathunden s. 25',source:'lathunden_s25'};}
      if(candidates.length>1)return NC('Handen uppfyller flera möjliga fördelningsåterbud efter 2♣–2♦–3♣–3♦ ('+candidates.join(', ')+'). Lathunden s. 25 anger ingen prioritet; sekvensen lämnas ej täckt.',function(b){return meansMap[b]||null;},'2♣-system / Lathunden s. 25',true);
      return NC('Efter 2♣–2♦–3♣–3♦ visar Lathunden s. 25 även 3NT naturligt, 4♣ trumfstöd och 4NT essfråga med klöver som trumf. De exakta hand-/styrkevillkoren för val mellan dessa bud är inte angivna här; lämnas ej täckt.',function(b){if(b==='3N')return 'Naturligt sangbud.';if(b==='4C')return 'Trumfstöd i klöver; exakt stöd-/styrkegräns anges inte.';if(b==='4N')return 'Essfråga med klöver som trumf; exakt slamtröskel anges inte.';return meansMap[b]||null;},'2♣-system / Lathunden s. 25',true);
    }
    if(openerRebid==='3H'&&responderRebid==='3S'){
      if(L.S>=6)add('3S','Minst sexkortsspader enligt Lathunden s. 25.');
      if(!h.bal)add('3N','Naturligt sangbud med obalanserad hand enligt Lathunden s. 25.');
      if(has54('C'))add('4C','Minst 5-4-fördelning enligt Lathunden s. 25.');
      if(has54('D'))add('4D','Minst 5-4-fördelning enligt Lathunden s. 25.');
      if(candidates.length===1){var chosen=candidates[0];return {exp:chosen,alt:[],why:meansMap[chosen],means:function(b){return meansMap[b]||null;},conv:'2♣-system / Lathunden s. 25',source:'lathunden_s25'};}
      if(candidates.length>1)return NC('Handen uppfyller flera möjliga fortsättningar efter 2♣–2♦–3♥–3♠ ('+candidates.join(', ')+'). Lathunden s. 25 anger ingen prioritet; sekvensen lämnas ej täckt.',function(b){return meansMap[b]||null;},'2♣-system / Lathunden s. 25',true);
      return NC('Efter 2♣–2♦–3♥–3♠ visar Lathunden s. 25 även 4♥ med 3+ hjärter och minimum samt 4NT essfråga med hjärter som trumf. Minimum och slamtröskel är inte numeriskt definierade; lämnas ej täckt.',function(b){if(b==='4H')return '3+ hjärter och minimum; minimum är inte kvantifierat.';if(b==='4N')return 'Essfråga med hjärter som trumf; exakt slamtröskel anges inte.';return meansMap[b]||null;},'2♣-system / Lathunden s. 25',true);
    }
    return NC('Denna tredje-budssekvens efter 2♣ finns inte specificerad i den granskade rutan.',null,'2♣-system',true);
  }


  function responderAfter2c2ntStayman(h,openerReply){
    var L=h.L,choices=[],meansMap={};
    if(openerReply==='3D'){
      if(L.H>=5&&L.S>=4){choices.push('3H');meansMap['3H']='5+ hjärter och 4+ spader, utgångskrav enligt Lathunden s. 25.';}
      if(L.S>=5&&L.H>=4){choices.push('3S');meansMap['3S']='5+ spader och 4+ hjärter, utgångskrav enligt Lathunden s. 25.';}
      if(choices.length===1){var one=choices[0];return {exp:one,alt:[],why:meansMap[one],means:function(b){return meansMap[b]||null;},conv:'2♣-system / 2NT-Stayman',source:'lathunden_s25'};}
      if(choices.length>1)return NC('Efter 2♣–2♦–2NT–3♣–3♦ har handen både 5+♥/4+♠ och 5+♠/4+♥. Lathunden s. 25 anger ingen prioritet; lämnas ej täckt.',function(b){return meansMap[b]|| (b==='3N'?'Slutbud i sang.':null);},'2NT-Stayman',true);
      return NC('Efter 2♣–2♦–2NT–3♣–3♦ anger Lathunden s. 25 3NT som slutbud och 4♣/4♦ som minst 5-kortsfärg med slaminvit. Ingen numerisk styrkegräns för val av dessa bud anges; lämnas ej täckt.',function(b){if(b==='3N')return 'Slutbud i sang.';if(b==='4C'||b==='4D')return 'Minst 5-kortsfärg och slaminvit (hänvisning Slam).';return null;},'2NT-Stayman',true);
    }
    if(openerReply==='3H'){
      if(L.S===4)return NC('Efter 2♣–2♦–2NT–3♣–3♥ visar Lathunden s. 25 både 3♠ med fyrkortsspader och slaminvit samt 3NT med fyrkortsspader utan krav. Numerisk styrkegräns för valet saknas; lämnas ej täckt.',function(b){if(b==='3S')return 'Fyrkortsspader, slaminvit (nyhet i Lathunden).';if(b==='3N')return 'Fyrkortsspader, ej krav.';if(b==='4N')return 'Essfråga med hjärter som trumf.';return null;},'2NT-Stayman',true);
      return NC('Efter 2♣–2♦–2NT–3♣–3♥ anger Lathunden s. 25 4♣/4♦ med minst 5-kortsfärg, fyrkortsspader och slaminvit samt 4NT som essfråga med hjärter som trumf. Slamintresse och trumf-/essfrågegräns är inte kvantifierade; lämnas ej täckt.',function(b){if(b==='4C'||b==='4D')return 'Minst 5-kortsfärg, fyrkortsspader och slaminvit (Slam).';if(b==='4N')return 'Essfråga med hjärter som trumf.';return null;},'2NT-Stayman',true);
    }
    return NC('Öppnarens svar efter 2NT-Stayman är inte en av de granskade svarsrutorna på Lathunden s. 25.',null,'2NT-Stayman',true);
  }
  function responderAfter2c2ntTransfer(h,major){
    var L=h.L,minorFit=['C','D'].filter(function(s){return L[s]>=4;});
    if(L[major]===5&&minorFit.length===0)return {exp:'3N',alt:[],why:'Femkortshögfärg efter överföring: 3NT är icke-krav enligt Lathunden s. 25.',means:function(b){return b==='3N'?'Femkortshögfärg, ej krav.':null;},conv:'2♣-system / 2NT-överföring',source:'lathunden_s25'};
    if(L[major]>=5&&minorFit.length)return NC('Efter 2NT-överföring har handen 5+ '+SYM[major]+' och 4+ lågfärg. Lathunden s. 25 visar 4♣/4♦ som slaminvit, men hänvisar till Slam och anger ingen prioritet om båda lågfärgerna passar.',function(b){if(b==='4C'||b==='4D')return 'Minst 4-kortslågfärg och 5-kortshögfärg, slaminvit (Slam).';if(b==='4N')return 'Essfråga med överföringsfärgen som trumf.';return null;},'2NT-överföring',true);
    return NC('Efter 2NT-överföring anger Lathunden s. 25 3NT med femkortshögfärg (ej krav), 4♣/4♦ med 4+ lågfärg och 5-kortshögfärg (Slam) samt 4NT som essfråga med överföringsfärgen som trumf. Handen passar inte entydigt i en automatiskt bedömbar gren.',function(b){if(b==='3N')return 'Femkortshögfärg, ej krav.';if(b==='4C'||b==='4D')return '4+ lågfärg, 5-kortshögfärg och slaminvit.';if(b==='4N')return 'Essfråga med överföringsfärgen som trumf.';return null;},'2NT-överföring',true);
  }

  /* ––––– SVAG TVÅA (Plus) ––––– */

  return {opening,resp2c,reb2c,resp2c2,openerThirdAfter2c,responderAfter2c2ntStayman,responderAfter2c2ntTransfer};
});
