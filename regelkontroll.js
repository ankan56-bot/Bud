/* Regelkontroll: budsekvensens struktur och missad utgång; slam via RKC. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningRegelkontrollFactory=factory;
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
  var lastBidCode=api.lastBidCode;
  function nextSeat(s){return {N:'E',E:'S',S:'W',W:'N'}[s]}
  function validSeat(s){return s==='N'||s==='E'||s==='S'||s==='W'}
  function validateAuction(st){
    var bids=st.bids||[], dealer=validSeat(st.dealer)?st.dealer:(bids.length?bids[0].s:null);
    var errors=[], contract=null, contractSide=null, doubled=0, consecutivePasses=0, ended=false, expected=dealer;
    for(var i=0;i<bids.length;i++){
      var b=bids[i]||{}, c=b.c, seat=b.s;
      if(ended){errors.push({index:i,message:'Bud efter att budgivningen redan avslutats.'});continue}
      if(!validSeat(seat)){errors.push({index:i,message:'Okänd spelare/plats.'});continue}
      if(expected&&seat!==expected)errors.push({index:i,message:'Fel turordning: '+seat+' skulle inte bjuda nu; förväntad spelare är '+expected+'.'});
      expected=nextSeat(seat);
      if(c==='P'){
        consecutivePasses++;
        if((!contract&&consecutivePasses===4)||(contract&&consecutivePasses===3))ended=true;
        continue;
      }
      consecutivePasses=0;
      if(isBid(c)){
        if(contract&&rk(c)<=rk(contract))errors.push({index:i,message:'Budet '+txt(c)+' är inte högre än föregående kontraktsbud '+txt(contract)+'.'});
        contract=c;contractSide=side(seat);doubled=0;
        continue;
      }
      if(c==='X'){
        if(!contract)errors.push({index:i,message:'Dubbling kräver ett föregående kontraktsbud.'});
        else if(side(seat)===contractSide)errors.push({index:i,message:'Man får inte dubbla sin egen sidas kontraktsbud.'});
        else if(doubled!==0)errors.push({index:i,message:'Kontraktet är redan dubblat eller redubblat.'});
        else doubled=1;
        continue;
      }
      if(c==='XX'){
        if(!contract||doubled!==1)errors.push({index:i,message:'Redubbling kräver att motståndarna har dubblat det aktuella kontraktet.'});
        else if(side(seat)!==contractSide)errors.push({index:i,message:'Endast sidan som bjöd kontraktet får redubbla.'});
        else doubled=2;
        continue;
      }
      errors.push({index:i,message:'Okänt budkod: '+c+'.'});
    }
    var contractText=contract?txt(contract)+(doubled===1?' dubblat':doubled===2?' redubblat':''):'Inget kontrakt';
    return {valid:errors.length===0,errors:errors,ended:ended,contract:contract,contractSide:contractSide,doubled:doubled,contractText:contractText,dealer:dealer};
  }

  // Övergripande kontroll av missad utgång och slam vid pass på egen sida.
  // Trösklarna är vägledande: välj först högfärgsfit, därefter sang eller lågfärg.
  // Missad utgång/slam: 26 poäng i högfärg, 28 i lågfärg,
  // Numerisk HP-gräns för sangutgång är inte fastställd i denna källa. Fördelningspoäng räknas inte i sang.
  function missedGameOrSlam(st,bids,i,currentContract,currentSide){
    var b=bids[i];
    if(!b||b.c!=='P'||side(b.s)!==0||currentSide!==0||!currentContract)return null;
    var priorNS=bids.slice(0,i).filter(function(x){return x&&isBid(x.c)&&side(x.s)===0;});
    if(priorNS.length<2)return null;
    var pt=partner(b.s),a=H(st.hands[b.s]),p=H(st.hands[pt]);
    // Weakness after a completed transfer is qualitative in the source;
    // do not infer a numeric pass exception from responder HCP.
    var totalHcp=a.hp+p.hp;

    // Räkna bara en färgfit som är visad naturligt i auktionen.
    // Konstgjorda bud som Stayman, överföring och 2♦-väntan efter 2♣
    // får inte skapa en påhittad trumf eller fördelningspoäng.
    function naturalSuitCall(index){
      var call=bids[index],c=call&&call.c;
      if(!call||!isBid(c)||c[1]==='N')return false;
      var prev=null;
      for(var z=index-1;z>=0;z--)if(isBid(bids[z].c)){prev=bids[z].c;break;}
      if(prev==='1N'&&['2C','2D','2H'].indexOf(c)>=0)return false;
      if(prev==='2N'&&c==='3C')return false;
      if(prev==='2C'&&c==='2D'){
        var first=null;
        for(var q=0;q<index;q++)if(isBid(bids[q].c)){first=bids[q].c;break;}
        if(first==='2C')return false;
      }
      return true;
    }
    var shown={C:false,D:false,H:false,S:false};
    for(var si=0;si<i;si++){
      if(side(bids[si].s)===0&&naturalSuitCall(si))shown[st_(bids[si].c)]=true;
    }
    var majors=['H','S'].filter(function(x){return shown[x]&&a.L[x]+p.L[x]>=8;});
    majors.sort(function(x,y){return (a.L[y]+p.L[y])-(a.L[x]+p.L[x]);});
    var minors=['C','D'].filter(function(x){return shown[x]&&a.L[x]+p.L[x]>=8;});
    minors.sort(function(x,y){return (a.L[y]+p.L[y])-(a.L[x]+p.L[x]);});

    var trump=majors.length?majors[0]:(minors.length?minors[0]:'N');
    var total=trump==='N'?totalHcp:partnershipPoints(a,p,trump);
    var threshold=trump==='N'?25:(maj(trump)?26:28);
    var gameLevel=trump==='N'?3:(maj(trump)?4:5);
    var currentSuit=st_(currentContract),currentLevel=lv(currentContract);
    var gameReached=(currentSuit==='N'&&currentLevel>=3)||
      (maj(currentSuit)&&currentLevel>=4)||
      (!maj(currentSuit)&&currentSuit!=='N'&&currentLevel>=5);
    // Säkerhetskontrollen får hitta en missad utgång, men får aldrig
    // hoppa direkt till slam. Slamundersökning går via den separata
    // 4NT/RKC-modulen när sekvensen har etablerat rätt förutsättningar.
    if(total>=threshold&&!gameReached){
      var target=trump==='N'?'3N':(maj(trump)?'4'+trump:'5'+trump);
      if(rk(target)<=rk(currentContract)){
        var choices=trump==='N'?['3N']:maj(trump)?['4H','4S','3N']:['5C','5D','3N'];
        target=choices.filter(function(x){return rk(x)>rk(currentContract);})[0]||null;
      }
      if(!target)return null;
      var thresholdText=trump==='N'?'numerisk sanggräns ej verifierad':(maj(trump)?'26+ spelpoäng med minst 8-korts naturligt visad högfärgsfit':'28+ spelpoäng med minst 8-korts naturligt visad lågfärgsfit');
      return {target:target,why:'Partnerskapets sammanlagda styrka är '+total+' poäng. '+thresholdText+' innebär att utgång ska undersökas; pass på ett kontrakt under utgång missar utgång.'+(total>=33?' 33+ poäng kan motivera senare slamundersökning via 4NT/RKC, men inte ett direkt hopp till slam.':'')};
    }
    return null;
  }


  return {nextSeat:nextSeat,validSeat:validSeat,validateAuction:validateAuction,missedGameOrSlam:missedGameOrSlam};
});
