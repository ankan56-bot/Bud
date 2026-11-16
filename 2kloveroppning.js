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
      return null};
    if(r!=='2D')return {exp:null,alt:[],why:'Endast 2♦-svar hanteras i detta system.',means:means,conv:'2♣-system'};
    if(h.bal&&hp<=24){exp='2N';why=hp+' hp jämn: 2NT (22-24).'}
    else if(h.bal){exp='3N';why=hp+' hp jämn: 3NT (25-27).'}
    else{var mj=['H','S'].filter(function(s){return L[s]>=5}).sort(function(a,b){return L[b]-L[a]||(b==='S'?1:-1)});
      var mn=['C','D'].filter(function(s){return L[s]>=5}).sort(function(a,b){return L[b]-L[a]});
      if(mj.length){exp='2'+mj[0];why='5+ '+SYM[mj[0]]+': 2 i högfärgen (utgångskrav).'}
      else if(mn.length){exp='3'+mn[0];why='5+ '+SYM[mn[0]]+': 3 i lågfärgen (utgångskrav).'}
      else return {exp:null,alt:[],why:'Obalanserad hand utan 5-korts färg: dokumentet anger inte budet.',means:means,conv:'2♣-system'}}
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

  /* ––––– SVAG TVÅA (Plus) ––––– */

  return {opening,resp2c,reb2c,resp2c2};
});
