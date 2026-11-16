/* Separat regelmodul: RattningDubbling. Reglerna är flyttade, inte omskrivna. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningDubblingFactory=factory;
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

  return {respDouble};
});
