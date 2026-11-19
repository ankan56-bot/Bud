/* Extracted from ettoppningssvar.js; behavior/rules unchanged. */
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports) module.exports=factory; else root.RattningSvar1Factory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api){
 var SU=api.SU, SYM=api.SYM, NAME=api.NAME, side=api.side, partner=api.partner, isBid=api.isBid,
     lv=api.lv, st_=api.st_, rk=api.rk, txt=api.txt, maj=api.maj, lowest=api.lowest,
     jump=api.jump, H=api.H, handHps=api.handHps, partnershipPoints=api.partnershipPoints,
     T=api.T, ok=api.ok, NC=api.NC;

  function resp1(h,oc){
    var o=st_(oc),hp=h.hp,L=h.L,M=maj(o),sup=L[o]>=4,htp=sup?h.htp(o):hp,exp,why,alt=[],ruleStatus=null;
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

    if(M&&sup&&!h.bal&&h.good(o)&&htp<=12){
      exp='4'+o;ruleStatus='source_interpretation';why=htp+' htp, 4+ högfärgsstöd, bra stöd och obalanserad/svitad hand: spärrhöjning till 4'+o+'.';
    }else if(M&&sup){
      if(htp<6){exp='P';why='Bara '+htp+' htp med stöd: för svag för att svara.'}
      else if(htp<=9){exp='2'+o;why=htp+' htp med 4+ stöd i högfärgen: 2 i färgen (6-9 stp).'}
      else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen (10-12 stp).'}
      else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT (13+).'}
    }else if(hp<6&&(!sup||htp<6)){exp='P';why='Under 6 hp: pass.'}
    else if(!M&&sup&&cand.some(maj)){var cm=cand.filter(maj);exp=lowest(pickBest(cm),oc);why='Stöd i lågfärg men egen 4+ högfärg: visa högfärgen först (sök högfärg).';
      if(cm.length>1&&L[cm[0]]===L[cm[1]])alt.push(lowest(cm[0]===pickBest(cm)?cm[1]:cm[0],oc))}
    else if(!M&&sup&&!h.bal&&h.good(o)&&htp<=9){
      exp='4'+o;ruleStatus='source_interpretation';why=htp+' htp, 4+ lågfärgsstöd, bra stöd och obalanserad/svitad hand: spärrhöjning till 4'+o+'.';
    }else if(!M&&sup){
      if(htp<=9){exp='2'+o;why=htp+' htp med 4+ stöd i lågfärgen: 2 i färgen (6-9).'}
      else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen (10-12).'}
      else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT.'}
    }
    else if(cand.length){var b=pickBest(cand);exp=lowest(b,oc);why='6+ hp och en 4+ färg på 1-nivå: 1 över 1.';
      cand.forEach(function(s){if(s!==b&&L[s]===L[b])alt.push(lowest(s,oc))})}
    else if(hp<=10&&!(hp===10&&SU.some(function(s){return L[s]>=6&&h.good(s)}))){exp='1N';why=hp+' hp utan 4-korts stöd eller färg på 1-nivå: 1NT (6-10).'}
    else{
      var c2=SU.filter(function(s){return s!==o&&L[s]>=4});
      if(c2.length){var b2=pickBest(c2);exp=lowest(b2,oc);why=hp+' hp och 4+ färg: 2 över 1 (11+, rondkrav).'}
      else return {exp:null,alt:[],why:hp+' hp utan färg att visa: dokumentet beskriver inte detta bud.',means:means,conv:'svar'}
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:htp>=13&&exp==='2N'?'Stenberg':'svar',ruleStatus:ruleStatus,soft:ruleStatus==='source_interpretation'};
  }

  /* ––––– 1NT / 2NT-STRUKTUR (Plus) ––––– */
 return {resp1:resp1};
});
