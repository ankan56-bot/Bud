/* Separat regelmodul: RattningInkliv. Reglerna är flyttade, inte omskrivna. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningInklivFactory=factory;
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
      if(c==='2N')return sourcePageRules?'11–12 hp, balanserad hand med bra håll i motståndarnas inklivsfärg.':'11–13 hp, balanserad hand med bra håll.';
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

    // Cue-bid strength differs by context. After our own opening and
    // opponent interference, Lathunden s. 35 requires 13+ STP with support.
    // After partner's overcall, the Nordisk Standard 10+ hp rule remains.
    var cueStrength=sourcePageRules?handHps(h,s)>=13:hp>=10;
    if(!exp&&L[s]>=3&&cueStrength&&os){
      var cue=lowest(os,last);
      if(ok(cue,last)){exp=cue;why=(sourcePageRules?handHps(h,s)+' STP':'10+ hp')+' och '+L[s]+'-korts stöd: överbud i motståndarnas färg.';}
    }

    if(!sourcePageRules&&!exp&&h.bal&&hp>=8&&hp<=10&&h.stop(os)&&ok('1N',last)){
      exp='1N';why='8-10 hp, balanserad hand med håll i öppningsfärgen: 1NT.';
    }
    var twoNtMax=sourcePageRules?12:13;
    if(!exp&&h.bal&&hp>=11&&hp<=twoNtMax&&h.stop(os)&&ok('2N',last)){
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

  return {overcall,respOvercall};
});
