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
    var preempt=hp<=8&&L[o]>=3;
    var invite=hp>=9&&hp<=10&&L[o]>=2;
    var means=function(c){
      if(c==='3'+o)return 'Spärrande höjning: minst 3 korts stöd, ej invit.';
      if(c==='2N')return 'Invit: 9-10 hp och minst 2 korts stöd.';
      if(c==='6'+o)return 'Lillslam: minst 10-korts fit och 33+ gemensamma spelpoäng.';
      if(c===(maj(o)?'4':'5')+o)return 'Utgång: gemensamma spelpoäng når systemets gräns med etablerad fit.';
      if(c==='P')return 'Pass med svag hand utan stöd eller egen 5+ färg.';
      if(isBid(c)&&st_(c)!==o&&st_(c)!=='N')return 'Ny färg: minst 5 kort, krav till minst 3 i öppningsfärgen.';
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
    if(newSuits.length>1){
      return NC('Handen har flera egna 5+ färger efter svag tvåa. REF anger ingen prioritet mellan färgerna; välj inte en färg enbart utifrån intern sorteringsordning.');
    }
    if(newSuits.length&&(preempt||invite)){
      return NC('Handen uppfyller både villkoret för egen 5+ färg och ett stöd-bud efter svag tvåa. REF anger ingen prioritet mellan dessa alternativ.');
    }
    if(newSuits.length){
      exp=lowest(newSuits[0],oc);
      why='5+ kort i '+SYM[newSuits[0]]+': ny färg, krav till minst 3 i öppningsfärgen.';
    }else if(preempt){
      exp='3'+o;
      why='Svag hand med 3+ stöd: spärrande höjning till 3 i öppningsfärgen, ej invit.';
    }else if(invite){
      exp='2N';
      why=hp+' hp och 2+ stöd: invit 2NT.';
    }else if(hp<=8){
      exp='P';why=hp+' hp utan 3+ stöd eller egen 5+ färg: pass.';
    }else{
      return NC('Svar efter svag tvåa: handen passar inte de uttryckligen angivna villkoren för 5+ färg, spärrhöjning eller 2NT-invit.');
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'svag tvåa',soft:false};
  }
  function open2w(h,oc,r){
    var o=st_(oc),hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(r==='2N'){
        if(c==='3'+o)return 'Öppnarens minimum: 6-8 hp, 3 i öppningsfärgen.';
        if((maj(o)&&c==='4'+o)||(!maj(o)&&c==='3N'))return 'Öppnarens maximum: 9-10 hp, 4M eller 3NT efter lågfärg.';
        if(c==='P')return 'Pass efter 2NT-invit när öppnarens hand inte passar minimum-/maximumåterbudet.';
      }
      return null};
    if(r==='2N'){
      if(hp>=6&&hp<=8){exp='3'+o;why=hp+' hp: minimum, 3 i öppningsfärgen.';return {exp:exp,alt:[],why:why,means:means,conv:'svag tvåa',soft:false};}
      if(hp>=9&&hp<=10){
        exp=maj(o)?'4'+o:'3N';
        why=hp+' hp: maximum efter 2NT-invit; '+(maj(o)?'4 i högfärgen.':'3NT efter lågfärgsöppning.');
        return {exp:exp,alt:[],why:why,means:means,conv:'svag tvåa',soft:false};
      }
      return NC('Öppnarens styrka efter 2NT-invit ligger utanför de uttryckligen angivna 6-8/9-10 hp-intervallen.',means,'svag tvåa');
    }
    if(r==='3'+o){
      return NC('Svarshandens 3-bud är spärrande och ej invit. Öppnarens fortsättning efter spärrhöjningen specificeras inte i REF.',means,'svag tvåa');
    }
    if(isBid(r)&&r[1]!==o&&r[1]!=='N'){
      return {exp:null,alt:[],why:'Svarshandens nya färg efter svag tvåa är 5+ kort och forcing till minst 3 i öppningsfärgen. Öppnarens återbud efter detta krav specificeras inte i REF; pass kan därför inte godkännas men inget exakt återbud kan rekommenderas.',means:means,conv:'svag tvåa'};
    }
    return {exp:null,alt:[],why:'Fortsättningen beskrivs inte i dokumentet.',means:means,conv:'svag tvåa'};
  }

  /* ––––– ÖPPNARENS ANDRA BUD (Plus) ––––– */

  return {opening,resp2w,open2w};
});
