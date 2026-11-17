/* Stenberg 2NT enligt Nordisk standard 2012-08-22, s. 2–3.
 * Avgränsad modul: svarshandens 2NT, öppningshandens första återbud
 * och uttryckliga slutpunkter. Fortsättningar som källan inte definierar
 * lämnas EJ TÄCKTA och ska inte fyllas med antagna systemregler.
 */
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports) module.exports=factory;
 else root.RattningStenbergFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api){
 var SU=api.SU, maj=api.maj, st_=api.st_, handHps=api.handHps;
 var H=api.H, partnershipPoints=api.partnershipPoints, NC=api.NC, sideOf=api.side;
 function accepts(opening){return !!opening&&/^1[CDHS]$/.test(opening);}
 function result(exp,why,conv,means){
   return {exp:exp,alt:[],why:why,conv:conv||'Stenberg 2NT',
     means:means||function(c){return c===exp?why:null;}};
 }
 function responder(hand,opening){
   if(!accepts(opening))return NC('Stenbergmodulen kräver en öppning på 1-tricksnivån i färg.');
   var suit=st_(opening),fit=hand.L[suit],htp=handHps(hand,suit);
   if(fit<4)return NC('Stenberg 2NT kräver minst fyra korts stöd i öppningsfärgen.',null,'Stenberg 2NT',false);
   if(!maj(suit)&&(hand.L.H>=4||hand.L.S>=4))
     return NC('Med 4+ kort i högfärg och stöd i öppnad lågfärg ska högfärgen visas först (sök högfärg). 2NT är därför inte Stenberg här.',null,'Stenberg 2NT',false);
   if(htp<13)return NC('Stenberg 2NT kräver minst 13 htp inklusive stöd-/trumfpoäng; handen har '+htp+'.',null,'Stenberg 2NT',false);
   return result('2N','Stenberg 2NT: minst 13 htp och minst fyra korts stöd i öppningsfärgen. Utgångskrav.','Stenberg 2NT',
     function(c){return c==='2N'?'13+ htp, 4+ stöd; Stenberg och utgångskrav.':null;});
 }
 function singletonRebid(suit,openingSuit){
   if(maj(openingSuit)){
     if(suit==='C'||suit==='D')return '3'+suit;
     if(suit!==openingSuit&&maj(suit))return '3'+suit;
     return null;
   }
   if(suit!==openingSuit)return '3'+suit;
   return null;
 }
 function openerRebid(hand,opening,partnerHand){
   if(!accepts(opening))return NC('Stenbergmodulen kräver en öppning på 1-tricksnivån i färg.');
   var openingSuit=st_(opening);
   if(partnerHand&&partnerHand.L[openingSuit]<4)
     return NC('Den tidigare 2NT-bjudningen saknar verifierat 4-kortsstöd i öppningsfärgen.',null,'Stenberg 2NT',false);
   var singletons=SU.filter(function(s){return hand.L[s]===1;});
   var voids=SU.filter(function(s){return hand.L[s]===0;});
   if(voids.length)
     return NC('Nordisk standard anger singeltonsvisning efter Stenberg men inte vilken fortsättning som gäller med renons. Läget lämnas EJ TÄCKT.',null,'Stenberg 2NT',true);
   if(singletons.length===1){
     var call=singletonRebid(singletons[0],openingSuit);
     if(!call)return NC('Singeltonen ligger i en färg som inte kan visas enligt den uttryckliga Stenberg-tabellen.',null,'Stenberg 2NT',true);
     return result(call,'Öppningshanden visar singelton i '+({C:'♣',D:'♦',H:'♥',S:'♠'}[singletons[0]])+' efter Stenberg 2NT.','Stenberg 2NT',
       function(c){return c===call?'Visar singelton i den bjudna färgen.':null;});
   }
   if(singletons.length>1){
     var multipleSingletonGap=NC('Nordisk standard anger inte prioritet mellan två eller fler singeltoner efter Stenberg 2NT.',null,'Stenberg 2NT',true);
     // Keep the sequence logged as uncovered, but allow the independent
     // partnership game-point safety check to find a proven 8-card major fit.
     multipleSingletonGap.allowSafetyRescue=true;
     return multipleSingletonGap;
   }
   if(hand.bal&&hand.hp>=12&&hand.hp<=14)
     return result('3N','12–14 hp och balanserad hand: 3NT efter Stenberg 2NT.','Stenberg 2NT',
       function(c){return c==='3N'?'12–14 hp, balanserad hand.':null;});
   var htp=handHps(hand,openingSuit);
   if(htp>=15)
     return result('3'+openingSuit,'15+ htp och ingen singelton: extra styrka visas genom höjning av öppningsfärgen till 3-nivån.','Stenberg 2NT',
       function(c){return c==='3'+openingSuit?'15+ htp, ingen singelton.':null;});
   return NC('Handen motsvarar inte någon av de angivna återbudsprofilerna efter Stenberg: varken 15+ htp utan singelton, 12–14 hp balanserad eller en singelton som kan visas. Läget lämnas ej täckt.',null,'Stenberg 2NT',true);
 }
 function responderContinuation(hand,opening,call,partnerHand,prior,rkcTrumpFromAuction,sideWanted,askSeat){
   var suit=st_(opening),fit=partnerHand?hand.L[suit]+partnerHand.L[suit]:0;
   if(call==='4N'){
     var trump=typeof rkcTrumpFromAuction==='function'&&Array.isArray(prior)
       ?rkcTrumpFromAuction(prior.concat([{s:askSeat,c:'4N'}]),sideWanted):null;
     if(trump)return result('4N','4NT efter fastställd trumf: överlämnas till den separata RKC-/slammodulen.','Stenberg → slammodul');
     return NC('4NT efter Stenberg kan inte verifieras som RKC med den offentliga budsekvensen. Överlämnas inte automatiskt till essfrågan.',null,'Stenberg 2NT',true);
   }
   var ownCalls=Array.isArray(prior)?prior.filter(function(x){return sideOf(x.s)===sideWanted&&x.c!=='P'&&x.c!=='X'&&x.c!=='XX';}):[];
   var lastOwn=ownCalls.length?ownCalls[ownCalls.length-1]:null;
   if(!partnerHand){
     if(lastOwn&&lastOwn.c==='3N'&&call==='P')
       return result('P','Öppnaren har redan nått 3NT, som är utgång. Pass är säkert utan att behöva se partnerns hand.','Stenberg – 3NT-utgång',
         function(c){return c==='P'?'Passar 3NT som redan är utgång.':null;});
     return NC('Slutbudet efter Stenberg kräver gemensam handanalys; den andra handen är inte tillgänglig i live-läget.',null,'Stenberg 2NT',false);
   }
   if(fit<8)return NC('Slutbudet kräver minst åtta korts gemensam trumf; aktuell fit är '+fit+'.',null,'Stenberg 2NT',false);
   var points=partnershipPoints(hand,partnerHand,suit),isMajor=maj(suit),minimum=isMajor?26:28;
   var expected=isMajor?'4'+suit:'5'+suit;
   if(points>=minimum)
     return result(expected,fit+'-korts fit och '+points+' gemensamma spelpoäng: utgång i '+(isMajor?'högfärg':'lågfärg')+'. Stenberg är utgångskrav; pass under utgång godtas inte.','Stenberg – slutbud',
       function(c){return c===expected?'Slutbud; Stenbergmodulen avslutas här.':null;});
   if(lastOwn&&lastOwn.c==='3N'&&call==='P')
     return result('P','Öppnaren har redan nått 3NT, som är utgång. Med färre än '+minimum+' gemensamma spelpoäng enligt projektets färggräns stannar paret i 3NT.','Stenberg – 3NT-utgång',
       function(c){return c==='P'?'Passar 3NT som redan är utgång.':null;});
   return NC('Stenberg är utgångskrav men handen når inte projektets '+minimum+'-poängsgräns för '+(isMajor?'4'+suit:'5'+suit)+'. Nordisk standard anger inte en alternativ fortsättning i denna handtyp; läget lämnas ej täckt.',null,'Stenberg 2NT',true);
 }
 return {accepts:accepts,responder:responder,openerRebid:openerRebid,responderContinuation:responderContinuation};
});
