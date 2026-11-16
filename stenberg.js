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
 var H=api.H, partnershipPoints=api.partnershipPoints, NC=api.NC;
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
   if(singletons.length>1)
     return NC('Nordisk standard anger inte prioritet mellan två eller fler singeltoner efter Stenberg 2NT.',null,'Stenberg 2NT',true);
   if(hand.bal&&hand.hp>=12&&hand.hp<=14)
     return result('3N','12–14 hp och balanserad hand: 3NT efter Stenberg 2NT.','Stenberg 2NT',
       function(c){return c==='3N'?'12–14 hp, balanserad hand.':null;});
   var htp=handHps(hand,openingSuit);
   if(htp>=15)
     return result('3'+openingSuit,'15+ htp och ingen singelton: extra styrka visas genom höjning av öppningsfärgen till 3-nivån.','Stenberg 2NT',
       function(c){return c==='3'+openingSuit?'15+ htp, ingen singelton.':null;});
   return NC('Handen motsvarar inte någon uttryckligen beskriven återbudstyp efter Stenberg: varken 15+ htp utan singelton, 12–14 hp balanserad eller en singelton som kan visas.',null,'Stenberg 2NT',true);
 }
 function responderContinuation(hand,opening,call,partnerHand,prior,rkcTrumpFromAuction,side,askSeat){
   var suit=st_(opening),fit=partnerHand?hand.L[suit]+partnerHand.L[suit]:0;
   if(call==='4N'){
     var trump=typeof rkcTrumpFromAuction==='function'&&Array.isArray(prior)
       ?rkcTrumpFromAuction(prior.concat([{s:askSeat,c:'4N'}]),side):null;
     if(trump)return result('4N','4NT efter fastställd trumf: överlämnas till den separata RKC-/slammodulen.','Stenberg → slammodul');
     return NC('4NT efter Stenberg kan inte verifieras som RKC med den offentliga budsekvensen. Överlämnas inte automatiskt till essfrågan.',null,'Stenberg 2NT',true);
   }
   var isMajor=maj(suit),expected=isMajor?'4'+suit:'5'+suit;
   if(call!==expected)return NC('Efter öppningshandens Stenbergåterbud är nästa fortsättning inte uttryckligen specificerad i Nordisk standard. Budsekvensen sparas för expertgranskning.',null,'Stenberg 2NT',true);
   if(!partnerHand)return NC('Slutbudet efter Stenberg kräver gemensam handanalys; den andra handen är inte tillgänglig i live-läget.',null,'Stenberg 2NT',true);
   if(fit<8)return NC('Slutbudet kräver minst åtta korts gemensam trumf; aktuell fit är '+fit+'.',null,'Stenberg 2NT',false);
   var points=partnershipPoints(hand,partnerHand,suit),minimum=isMajor?26:28;
   if(points<minimum)return NC('Slutbudet kräver minst '+minimum+' gemensamma spelpoäng enligt projektets utgångsgräns; aktuell beräkning är '+points+'. Fortsättningen lämnas EJ TÄCKT.',null,'Stenberg 2NT',true);
   return result(expected,fit+'-korts fit och '+points+' gemensamma spelpoäng: slutpunkt i '+(isMajor?'högfärgsutgång':'lågfärgsutgång')+'.','Stenberg – slutbud',
     function(c){return c===expected?'Slutbud; Stenbergmodulen avslutas här.':null;});
 }
 return {accepts:accepts,responder:responder,openerRebid:openerRebid,responderContinuation:responderContinuation};
});
