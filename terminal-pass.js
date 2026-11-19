/* Terminal pass checks extracted from budbeslut.js; rule behavior kept intact. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.RattningTerminalPassFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  return function(ctx){
    var b=ctx.b, lastCall=ctx.lastCall, me=ctx.me, pt=ctx.pt, ours=ctx.ours, h=ctx.h, prior=ctx.prior, firstCall=ctx.firstCall;
    var side=ctx.side, st_=ctx.st_, lv=ctx.lv, maj=ctx.maj;
    var rkcTrumpFromAuction=ctx.rkcTrumpFromAuction, agreedNoTrumpAceAsk=ctx.agreedNoTrumpAceAsk, agreedQuantitativeNoTrumpInvite=ctx.agreedQuantitativeNoTrumpInvite;
        // När partnern redan har bjudit utgång är pass normalt slutbud.
        // Rättningsmotorns separata utgångs-/slamkontroll kan fortfarande
        // föreslå vidare bud om styrkan motiverar slam.
        if(b.c==='P'&&lastCall&&side(lastCall.s)===side(me)){
          var ls=st_(lastCall.c),ll=lv(lastCall.c);
          var stayman3NTSpadeChoice=b.c==='P'&&lastCall.c==='3N'&&ours.length===4&&
            ours[0].c==='1N'&&ours[1].c==='2C'&&ours[2].c==='2H'&&ours[3].c==='3N'&&
            h.L.H===4&&h.L.S===4;
          var transfer3NTGameChoice=b.c==='P'&&lastCall.c==='3N'&&ours.length===4&&
            ours[0].c==='1N'&&
            ((ours[1].c==='2D'&&ours[2].c==='2H')||(ours[1].c==='2H'&&ours[2].c==='2S'))&&
            ours[3].c==='3N';
          var partnerHasGame=((ls==='N'&&ll>=3)||(maj(ls)&&ll>=4)||(!maj(ls)&&ls!=='N'&&ll>=5))&&
            !stayman3NTSpadeChoice&&!transfer3NTGameChoice;
          // Undantag: efter Stayman 2♥–3NT kan 4-4-öppnaren välja 4♠ (Nordisk standard s. 4).
          // 4NT med fastställd trumf är RKC-fråga, inte slutbud.
          var partnerHasRkcAsk=lastCall.c==='4N'&&!!rkcTrumpFromAuction(prior,side(me));
          var partnerHasFourAceAsk=lastCall.c==='4N'&&agreedNoTrumpAceAsk(prior,side(me));
          var partnerHasQuantitativeInvite=lastCall.c==='4N'&&agreedQuantitativeNoTrumpInvite(prior,side(me));
          var partnerRkcReply=/^(?:5[CDHSN]|6[CDHS])$/.test(lastCall.c)&&prior.some(function(x){return x.s===me&&x.c==='4N'})&&!!rkcTrumpFromAuction(prior,side(me));
          var partnerFourAceReply=/^5[CDHS]$/.test(lastCall.c)&&
            prior.some(function(x){return x.s===me&&x.c==='4N'})&&agreedNoTrumpAceAsk(prior,side(me));
          var partnerRkcQueenAsk=lastCall.s===pt&&/^5[CDHS]$/.test(lastCall.c)&&
            prior.some(function(x){return x.s===pt&&x.c==='4N'})&&
            prior.some(function(x){return x.s===me&&/^5[CD]$/.test(x.c)})&&
            !!rkcTrumpFromAuction(prior,side(me));
          if(partnerHasGame&&lastCall.c!=='4N'&&!partnerHasRkcAsk&&!partnerHasFourAceAsk&&!partnerHasQuantitativeInvite&&!partnerRkcReply&&!partnerFourAceReply&&!partnerRkcQueenAsk)return {exp:'P',alt:[],why:'Partnern har redan bjudit utgång. Pass avslutar budgivningen om inte styrkan motiverar slam.',means:function(c){return c==='P'?'Pass efter partnerns utgångsbud.':null},conv:'slutbud'};
        }
    
        // Pass efter en svag tvåöppning och 2NT-fråga när öppnaren visar minimum.
        if(b.c==='P'&&firstCall&&/^2[CDHS]$/.test(firstCall.c)&&
           prior.some(function(x){return x.c==='2N'&&side(x.s)===side(me)})&&
           lastCall&&lastCall.c==='3'+st_(firstCall.c)&&side(lastCall.s)===side(me)){
          return {exp:'P',alt:[],why:'2NT-frågan har fått svaret 3 i öppningsfärgen, vilket visar minimum efter svag tvåa. Pass är slutbud utan ytterligare invitstyrka.',means:function(c){return c==='P'?'Pass efter minimumsvar på 2NT-fråga.':null},conv:'svag tvåa'};
        }
    
        // Efter partnerns spärröppning på 3-nivån är pass standard med en
        // hand som inte når utgång; game-kontrollen ovan fångar starkare händer.
        if(b.c==='P'&&firstCall&&/^3[CDHS]$/.test(firstCall.c)&&ours.length===1){
          return {exp:'P',alt:[],why:'Partnern har spärröppnat på 3-nivån. Pass är rätt med en hand som inte når utgång.',means:function(c){return c==='P'?'Pass efter partnerns spärröppning.':null},conv:'spärr'};
        }
    
    return null;
  };
});
