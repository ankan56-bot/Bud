/* Öppningsbeslut – isolerad modul. Regeln flyttad utan avsiktlig ändring. */
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports) module.exports=factory; else root.RattningOpeningFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api,deps){
 var SU=api.SU, SYM=api.SYM, NAME=api.NAME, side=api.side, partner=api.partner, isBid=api.isBid,
     lv=api.lv, st_=api.st_, rk=api.rk, txt=api.txt, maj=api.maj, lowest=api.lowest,
     jump=api.jump, H=api.H, handHps=api.handHps, partnershipPoints=api.partnershipPoints,
     T=api.T, ok=api.ok, NC=api.NC;
 var twoClub=deps.twoClub, weakTwo=deps.weakTwo, majorBidding=deps.majorBidding, minorBidding=deps.minorBidding;

  function openingNode(h, fourthHandAfterThreePasses){
    var hp=h.hp,L=h.L,m=h.longest(),exp,alt=[],why;
    var cs=SU.filter(function(s){return L[s]===m}),pick;

    // Nya regler för val av öppningsfärg
    if(m>=5){
      // 5-5 ordning: Spader > Hjärter > Ruter > Klöver
      var order55 = ['S', 'H', 'D', 'C'];
      pick = cs.sort(function(a,b){ return order55.indexOf(a) - order55.indexOf(b); })[0];
      if(cs.length>1) alt.push('1'+cs[1]);
    } else {
      // 4-4 ordning: Hjärter > Spader > Klöver > Ruter
      var f=SU.filter(function(s){return L[s]===4});
      var order44 = ['H', 'S', 'C', 'D'];
      pick = f.sort(function(a,b){ return order44.indexOf(a) - order44.indexOf(b); })[0];
    }

    var one='1'+pick;
    var strongOpening=twoClub.opening(h);
    if(strongOpening)return strongOpening;
    if(h.bal&&hp>=20&&hp<=21){exp='2N';why='Balanserad 20-21 hp öppnas 2NT.'}
    else if(h.bal&&hp>=15&&hp<=17){exp='1N';why='Balanserad (fördelning '+h.shape+') med 15-17 hp öppnas 1NT.'}
    else if(hp>=11){
      var oneOpening=maj(pick)?majorBidding.open(h,pick,fourthHandAfterThreePasses):minorBidding.open(h,pick,fourthHandAfterThreePasses);
      if(oneOpening)return oneOpening;
      var weakOpening=weakTwo.opening(h,pick,m);
      if(weakOpening)return weakOpening;
      exp='P';why=hp+' hp räcker inte för öppning enligt 11-poängsregeln och ingen spärrhand.';
    }else{
      var weakOpening=weakTwo.opening(h,pick,m);
      if(weakOpening)return weakOpening;
      exp='P';why=hp+' hp räcker inte för öppning (12+, 11 med bra färg) och ingen spärrhand.';
    }
    return {exp:exp,alt:alt,why:why,conv:'öppning',means:function(c){
      if(c==='P')return 'Pass: under 12 hp (11 hp kräver bra färg), ingen spärrhand eller för dålig färg för svag tvåa.';
      if(c==='1N')return '15-17 hp, balanserad (även 5-korts högfärg).';
      if(c==='2C')return 'Utgångskrav, eller 22-24 hp balanserad.';
      if(c==='2N')return '20-21 hp, balanserad.';
      if(/^2[DHS]$/.test(c))return '6-10 hp, exakt 6-korts '+SYM[c[1]]+', bra färg (2 honnörer eller 1 honnör + 2 av 10-9-8).';
      if(/^3[CDHS]$/.test(c))return 'Spärrbud, 6-10 hp, 7-korts färg.';
      if(/^4[CDHS]$/.test(c))return 'Spärrbud, 6-10 hp, 8-korts färg.';
      if(/^1[CDHS]$/.test(c))return '12-19 hp, 4+ färg (11 hp endast med 6 kort + 3 honnörer eller 7 kort + 2 honnörer).';
      return null}};
  }

 return {openingNode:openingNode};
});
