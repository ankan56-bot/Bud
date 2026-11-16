/* Lågfärgsbudgivning efter 1-öppning (1♣/1♦). */
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports) module.exports=factory;
 else root.RattningLagfargFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api,common){
 var maj=api.maj,st_=api.st_,NC=api.NC;
 function accepts(opening){return !!opening&&/^[1][CDHS]$/.test(opening)&&!maj(st_(opening));}
 function respond(hand,opening){if(!accepts(opening))return NC('Fel modul för öppningsfärgen.');return common.resp1(hand,opening);}
 function rebid(hand,opening,response,partnerHand){if(!accepts(opening))return NC('Fel modul för öppningsfärgen.');return common.reb1(hand,opening,response,partnerHand);}
 return {accepts:accepts,respond:respond,rebid:rebid};
});
