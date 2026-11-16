/* Poängberäkning för rättningsmotorn.
 * Innehåller handanalys, individuell spelstyrka och gemensam spelstyrka.
 * Nordisk Standard-reglerna i denna modul är oförändrade vid extraktionen.
 */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports) module.exports=factory();
  else root.RattningPoang=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  var SU=['C','D','H','S'];
  function H(cards){
    var L={C:0,D:0,H:0,S:0},hp=0,top={C:[],D:[],H:[],S:[]},aces=0,kings=0;
    cards.forEach(function(k){var n=+k.slice(1),s=k[0];L[s]++;top[s].push(n);if(n>=11)hp+=n-10;if(n===14)aces++;if(n===13)kings++;});
    var sh=[L.S,L.H,L.D,L.C].sort(function(a,b){return b-a}).join('');
    var o={L:L,hp:hp,top:top,aces:aces,kings:kings,shape:sh,bal:['4333','4432','5332'].indexOf(sh)>=0};
    o.htp=function(t){if(!t||t==='N')return hp;var x=hp;SU.forEach(function(s){if(s!==t){var n=L[s];x+=n===0?3:n===1?2:n===2?1:0}});return x};
    o.has=function(s,n){return top[s].indexOf(n)>=0};
    o.stop=function(s){return o.has(s,14)||(o.has(s,13)&&L[s]>=2)||(o.has(s,12)&&L[s]>=3)||(o.has(s,11)&&L[s]>=4)};
    o.good=function(s){var t=top[s],c=[14,13,12].filter(function(n){return t.indexOf(n)>=0}).length,d=[14,13,12,11,10].filter(function(n){return t.indexOf(n)>=0}).length;return c>=2||d>=3};
    o.goodForEleven=function(s){var n=L[s],hon=[14,13,12,11].filter(function(r){return top[s].indexOf(r)>=0}).length;return (n===6&&hon>=3)||(n===7&&hon>=2)};
    o.goodForWeakTwo=function(s){var n=L[s],hon=[14,13,12,11].filter(function(r){return top[s].indexOf(r)>=0}).length,mid=[10,9,8].filter(function(r){return top[s].indexOf(r)>=0}).length;return n===6&&(hon>=2||(hon>=1&&mid>=2))};
    o.longest=function(){return Math.max(L.C,L.D,L.H,L.S)};
    o.singles=function(){return SU.filter(function(s){return L[s]<=1})};
    return o;
  }

  // HPS för en egen hand: STP får räknas vid etablerat stöd eller
  // med egen 6+-färg/5-5. En 5-4-hand utan stöd ger bara HP.
  function handHps(h,supportedSuit){
    if(supportedSuit)return h.htp(supportedSuit);
    var eligible=SU.filter(function(s){
      return h.L[s]>=6||(h.L[s]===5&&SU.some(function(t){return t!==s&&h.L[t]===5;}));
    });
    var best=h.hp;
    eligible.forEach(function(s){best=Math.max(best,h.htp(s));});
    return best;
  }

  // Gemensam spelstyrka: honnörspoäng alltid; fördelningspoäng och
  // trumflängdsbonus endast i färgkontrakt med minst 8 gemensamma trumfkort.
  // Sang värderas enbart med honnörspoäng.
  function partnershipPoints(a,p,trump){
    var total=a.hp+p.hp;
    if(!trump||trump==='N')return total;
    var fit=a.L[trump]+p.L[trump];
    if(fit<8)return total;
    [a,p].forEach(function(h){
      SU.forEach(function(s){
        if(s!==trump){var n=h.L[s];total+=n===0?3:n===1?2:n===2?1:0;}
      });
    });
    if(fit===9)total+=1;else if(fit>=10)total+=2;
    return total;
  }


  return {H:H,handHps:handHps,partnershipPoints:partnershipPoints};
});
