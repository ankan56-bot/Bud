/* Högfärgsbudgivning efter 1-öppning (1♥/1♠). */
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports) module.exports=factory;
 else root.RattningHogfargFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api,common){
 var maj=api.maj,st_=api.st_,NC=api.NC;
 function accepts(opening){return !!opening&&/^[1][CDHS]$/.test(opening)&&maj(st_(opening));}
 function open(hand,suit,fourthHandAfterThreePasses){
   if(!accepts('1'+suit))return NC('Fel modul för öppningsfärgen.');
   var hp=hand.hp, length=hand.L[suit], alt=[];
   if(hp>=12&&hp<=19){
     return {exp:'1'+suit,alt:[],why:hp+' hp med längsta färgen '+(api.SYM[suit]||suit)+' ('+length+' kort): 1 i färg (12-19 hp).',conv:'öppning',
       means:function(b){return b==='1'+suit?'12-19 hp och minst 4 kort i färgen.':null}};
   }
   if(hp===11&&(fourthHandAfterThreePasses||hand.goodForEleven(suit))){
     if(!fourthHandAfterThreePasses&&!(length===6&&hand.good(suit))&&!(length===7&&hand.good(suit)))return NC('11 hp kräver bra öppningsfärg enligt systemregeln.');
     alt=['P'];
     return {exp:'1'+suit,alt:alt,why:fourthHandAfterThreePasses?'Fjärde hand efter tre pass: 11 hp räcker för öppning.':'11 hp med bra färg: 1 i färg är tillåtet; pass är också möjligt.',conv:'öppning',
       means:function(b){return b==='1'+suit?'11 hp med bra färg eller fjärde hand efter tre pass.':b==='P'?'Alternativt pass med 11 hp.':null}};
   }
   return null;
 }
 function respond(hand,opening){if(!accepts(opening))return NC('Fel modul för öppningsfärgen.');return common.resp1(hand,opening);}
 function rebid(hand,opening,response,partnerHand){if(!accepts(opening))return NC('Fel modul för öppningsfärgen.');return common.reb1(hand,opening,response,partnerHand);}
 return {accepts:accepts,open:open,respond:respond,rebid:rebid};
});
