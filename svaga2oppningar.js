/* Separat regelmodul: RattningSvagaTva. Reglerna är flyttade, inte omskrivna. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningSvagaTvaFactory=factory;
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
  function opening(h,pick,m){
    var hp=h.hp;
    if(!(hp>=6&&hp<=10&&m>=6))return null;
    var exp,alt=[],why;
    if(m===6&&pick!=='C'&&h.goodForWeakTwo(pick)){
      exp='2'+pick;
      why='6-10 hp och exakt 6-korts '+SYM[pick]+' med bra kvalitet: svag tvåa.';
    }else if(m===6){
      exp='P';
      why=pick==='C'?'Med 6-korts ♣ finns ingen svag tvåa (2♣ är starkt). Pass.':'6-10 hp och 6-korts '+SYM[pick]+' men för dålig färgkvalitet för svag tvåa: pass.';
    }else if(m===7){
      exp='3'+pick;alt=['4'+pick];why='7-korts färg med 6-10 hp: spärrbud 3 i färg.';
    }else{
      exp='4'+pick;alt=['3'+pick];why='8-korts färg med 6-10 hp: spärrbud 4 i färg.';
    }
    return {exp:exp,alt:alt,why:why,conv:'svag tvåa',means:function(b){
      if(b==='P')return 'Pass när färgkvaliteten inte räcker för svag tvåöppning.';
      if(/^2[DHS]$/.test(b))return '6-10 hp, exakt sexkortsfärg med bra kvalitet.';
      if(/^3[CDHS]$/.test(b))return 'Spärröppning med sjukortsfärg.';
      if(/^4[CDHS]$/.test(b))return 'Spärröppning med åttakortsfärg.';
      return null;
    }};
  }
  function resp2w(h,oc,openerCards){
    var o=st_(oc),L=h.L,hp=h.hp,exp,why,alt=[];
    var opener=openerCards?H(openerCards):null;
    var fit=opener?L[o]+opener.L[o]:0;
    var jointPoints=opener&&fit>=8?partnershipPoints(h,opener,o):0;
    var newSuits=SU.filter(function(s){return s!==o&&L[s]>=5;})
      .sort(function(a,b){if(L[b]!==L[a])return L[b]-L[a];return SU.indexOf(b)-SU.indexOf(a);});
    var stp=handHps(h,o);
    var means=function(c){
      if(c==='3'+o)return 'Invitativ höjning: cirka 14–16 STP; exakt prioritet mot Stenberg behöver källstöd.';
      if(c==='2N')return 'Stenberg: minst 13 STP med öppningsfärgen som trumf.';
      if(c==='6'+o)return 'Lillslam: minst 10-korts fit och 33+ gemensamma spelpoäng.';
      if(c===(maj(o)?'4':'5')+o)return 'Utgång: gemensamma spelpoäng når systemets gräns med etablerad fit.';
      if(c==='P')return 'Pass med svag hand utan stöd eller egen 5+ färg.';
      if(isBid(c)&&st_(c)!==o&&st_(c)!=='N')return 'Ny färg: minst 5 kort, 15+ hp, rondkrav till minst 3 i öppningsfärgen.';
      return null;
    };
    // Med etablerad fit väger gemensam spelstyrka före svaga svarsalternativ.
    // 33+ spelpoäng och minst 10 trumf motiverar lillslam; annars gäller
    // 26+ i högfärg respektive 28+ i lågfärg för utgång.
    if(opener && !newSuits.length && fit>=8){
      if(fit>=10 && jointPoints>=33){
        exp='6'+o;
        why=fit+'-korts fit i '+SYM[o]+' och '+jointPoints+' gemensamma spelpoäng: lillslam ska undersökas.';
        return {exp:exp,alt:[],why:why,means:means,conv:'svag tvåa / slam',soft:false};
      }
      var gameThreshold=maj(o)?26:28;
      if(jointPoints>=gameThreshold){
        exp=maj(o)?'4'+o:'5'+o;
        why=fit+'-korts fit i '+SYM[o]+' och '+jointPoints+' gemensamma spelpoäng: utgång enligt '+gameThreshold+'-poängsgränsen.';
        return {exp:exp,alt:[],why:why,means:means,conv:'svag tvåa',soft:false};
      }
    }
    // Lathund s. 27: 2NT after a weak two-opening is Stenberg, 13+ STP.
    // It is a separate convention from the old 9–10 HP invit, which is removed.
    if(stp>=13){
      if(newSuits.length)
        return NC('Efter svag tvåöppning uppfyller handen både 13+ STP för Stenberg 2NT och kravet på en lång sidofärg. Lathunden s. 27 anger ingen prioritet; lämnas EJ TÄCKT.',null,'svag tvåa / Stenberg',true);
      if(stp>=14&&stp<=16&&L[o]>=2)
        return NC('Handen uppfyller både Stenberg 2NT (13+ STP) och 3 i öppningsfärgen som invit (ca 14–16 STP). Lathunden s. 27 anger ingen prioritet eller stödlängd som skiljer buden åt; lämnas EJ TÄCKT.',null,'svag tvåa / Stenberg',true);
      return {exp:'2N',alt:[],why:stp+' STP med öppningsfärgen som trumf: 2NT är Stenberg enligt Lathunden s. 27. Öppnarens fortsättning bedöms separat.',means:function(c){return c==='2N'?'13+ STP: Stenberg 2NT efter svag tvåöppning.':null},conv:'svag tvåa / Stenberg',ruleStatus:'source_confirmed'};
    }
    if(newSuits.length>1){
      return NC('Handen har flera egna 5+ färger efter svag tvåa. REF anger ingen prioritet mellan färgerna; välj inte en färg enbart utifrån intern sorteringsordning.');
    }
    if(newSuits.length){
      if(hp<15)return NC('Ny färg efter svag tvåa kräver enligt Lathunden s. 27 minst 15–16 hp och rondkrav. Handen når inte styrkegränsen.',null,'svag tvåa',false);
      exp=lowest(newSuits[0],oc);
      why='5+ kort i '+SYM[newSuits[0]]+' och minst 15 hp: ny färg, rondkrav till minst 3 i öppningsfärgen.';
    }else if(hp<=8){
      exp='P';why=hp+' hp utan en uttryckligen definierad invit eller forcing-fortsättning: pass.';
    }else{
      return NC('Svar efter svag tvåa: handen passar inte de uttryckligen angivna villkoren för 5+ färg eller Stenberg 2NT.');
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'svag tvåa',soft:false};
  }
  function open2w(h,oc,r){
    var o=st_(oc),hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(r==='2N')return null;
      return null};
    if(r==='2N'){
      return NC('2NT efter svag tvåöppning är Stenberg med 13+ STP enligt Lathunden s. 27. Öppnarens exakta fortsättning efter Stenberg är inte tillräckligt specificerad i källunderlaget. Den äldre 6–8/9–10 hp-stegen används inte.',means,'svag tvåa / Stenberg',true);
    }
    if(r==='3'+o){
      return NC('3 i öppningsfärgen är invit med cirka 14–16 STP enligt Lathunden s. 27. Öppnarens fortsättning efter denna invit specificeras inte tillräckligt.',means,'svag tvåa',true);
    }
    if(isBid(r)&&r[1]!==o&&r[1]!=='N'){
      return {exp:null,alt:[],why:'Svarshandens nya färg efter svag tvåa är 5+ kort och forcing till minst 3 i öppningsfärgen. Öppnarens återbud efter detta krav specificeras inte i REF; pass kan därför inte godkännas men inget exakt återbud kan rekommenderas.',means:means,conv:'svag tvåa',sourceGap:true};
    }
    return {exp:null,alt:[],why:'Fortsättningen beskrivs inte i dokumentet.',means:means,conv:'svag tvåa'};
  }

  /* ––––– ÖPPNARENS ANDRA BUD (Plus) ––––– */

  return {opening,resp2w,open2w};
});
