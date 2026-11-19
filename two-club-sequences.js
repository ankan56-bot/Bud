/* Sekvensfamilj för 2♣-öppning. Behåller systemregler; dispatcher ger null när grenen ej matchar. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningTwoClubSequencesFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(deps){
  'use strict';
  var NC=deps.NC, resp2c=deps.resp2c, reb2c=deps.reb2c, ntResp=deps.ntResp,
      resp2c2=deps.resp2c2, ntOpener=deps.ntOpener,
      openerThirdAfter2c=deps.openerThirdAfter2c,
      responderAfter2c2ntStayman=deps.responderAfter2c2ntStayman,
      responderAfter2c2ntTransfer=deps.responderAfter2c2ntTransfer;
  function route(h,opener,d,ours,st,pt,nc){
    if(!opener&&d===1)return resp2c(h);
    if(opener&&d===2)return reb2c(h,ours[1].c);
    if(!opener&&d===3){
      var rb=ours[2].c;
      if(rb==='2N'){
        if(h.L.H>=5&&h.L.S>=5)
          return NC('Efter 2♣–2♦–2NT har svarshanden 5-5 i högfärgerna. Lathunden s. 25 anger överföringarna men ingen prioritet mellan två möjliga överföringsfärger; lämnas ej täckt.',null,'2NT-system',true);
        if(h.L.C>=6||h.L.D>=6||(h.L.C>=5&&h.L.D>=5))
          return NC('Efter 2♣–2♦–2NT har svarshanden lång eller tvåfärgad lågfärg. Lathunden s. 25 hänvisar lågfärgsfrågan till PRO och slaminviterna till Slam; dessa externa grenar är inte antagna.',null,'2NT-system',true);
        return ntResp(h,1);
      }
      return resp2c2(h,rb,ours[1].c);
    }
    if(opener&&d===4&&ours[1].c==='2D'){
      if(ours[2].c==='2N')
        return ntOpener(h,1,ours[3].c,st.hands[pt]);
      return openerThirdAfter2c(h,ours[2].c,ours[3].c);
    }
    if(!opener&&d===5&&ours[1].c==='2D'&&ours[2].c==='2N'){
      if(ours[3].c==='3C')return responderAfter2c2ntStayman(h,ours[4].c);
      if(ours[3].c==='3D'&&ours[4].c==='3H')return responderAfter2c2ntTransfer(h,'H');
      if(ours[3].c==='3H'&&ours[4].c==='3S')return responderAfter2c2ntTransfer(h,'S');
    }
    if(!opener&&d>=4&&ours[1].c==='2D'&&ours[2].c==='2N')
      return NC('2♣–2♦–2NT använder samma 2NT-system enligt Lathunden s. 24–25. PRO-lågfärgsfrågan, Slam-fortsättningar och övriga sekvenser är inte automatiskt antagna; lämnas ej täckta.',null,'2♣-system / 2NT-system',true);
    return nc('Fortsättningen i 2♣-systemet beskrivs inte i dokumentet.');

  }
  return route;
});
