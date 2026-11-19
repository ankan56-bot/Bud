/* Special continuation after 2NT–3♣–3♠ (Stayman).
 * Extracted from budbeslut.js without changing the established rule criteria.
 */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory;
  else root.Rattning2NTStaymanFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  return function(hand,partnerHand,opener,partnershipPoints,NC){
    var total=hand.hp+partnerHand.hp;
    var fit=hand.L.S+partnerHand.L.S;
    var points=fit>=8?partnershipPoints(hand,partnerHand,'S'):0;
    if(!opener){
      if(hand.bal&&total>=25&&fit<8)
        return {exp:'3N',alt:[],why:'Balanserad svarshand och '+total+' gemensamma honnörspoäng efter 2NT–3♣–3♠. Ingen 8-korts spaderfit; 25+ hp enligt projektregeln ger 3NT framför lågfärg.',means:function(c){return c==='3N'?'Balanserad hand och 25+ gemensamma hp: 3NT.':null},conv:'2NT-Stayman',ruleStatus:'user_confirmed'};
      if(fit>=8&&points>=26)
        return {exp:'4S',alt:[],why:'8-korts spaderfit och '+points+' gemensamma spelpoäng: utgång i spader.',means:function(c){return c==='4S'?'Utgång med 8-korts spaderfit.':null},conv:'2NT-Stayman'};
      return NC('Efter 2NT–3♣–3♠ når paret inte en verifierad utgångsprofil för 3NT eller 4♠; fortsatt bud lämnas ej täckt.',null,'2NT-Stayman',true);
    }
    if(hand.bal&&total>=25&&fit<8)
      return {exp:'3N',alt:[],why:'Balanserad svarshand och '+total+' gemensamma honnörspoäng efter 2NT–3♣–3♠. Ingen 8-korts spaderfit; 25+ hp enligt projektregeln ger 3NT.',means:function(c){return c==='3N'?'Balanserad hand, 25+ gemensamma hp och ingen spaderfit: 3NT.':null},conv:'2NT-Stayman',ruleStatus:'user_confirmed'};
    if(fit>=8&&points>=26)
      return {exp:'4S',alt:[],why:'8-korts spaderfit och '+points+' gemensamma spelpoäng: 26+ ger utgång i spader.',means:function(c){return c==='4S'?'Utgång med 8-korts spaderfit och 26+ gemensamma spelpoäng.':null},conv:'2NT-Stayman'};
    return NC('Efter 2NT–3♣–3♠ når paret inte 26 poäng för 3NT/4♠ eller saknar nödvändig form. Situationen lämnas ej täckt.',null,'2NT-Stayman',true);
  };
});
