/* Lågfärgsbudgivning efter 1-öppning (1♣/1♦).
 *
 * Färgspecifik adapter ovanpå de gemensamma svaren/återbuden.
 * Nordisk standard är normerande. Endast lågfärgsspecifika skillnader
 * hanteras här; 1NT, Stenberg, trumfstöd och slam återanvänds.
 */
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports) module.exports=factory;
 else root.RattningLagfargFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api,common){
 var SU=api.SU,maj=api.maj,st_=api.st_,NC=api.NC;
 var lowest=api.lowest,jump=api.jump,handHps=api.handHps;
 var isBid=api.isBid,lv=api.lv;

 function accepts(opening){
   return !!opening&&/^[1][CDHS]$/.test(opening)&&!maj(st_(opening));
 }

 function open(hand,suit,fourthHandAfterThreePasses){
   if(!accepts('1'+suit))return NC('Fel modul för öppningsfärgen.');
   var hp=hand.hp,length=hand.L[suit],alt=[];
   if(length<4)return null;
   if(hp>=12&&hp<=19){
     return {exp:'1'+suit,alt:[],
       why:hp+' hp och minst fyra kort i '+(api.SYM[suit]||suit)+': öppning 1 i lågfärg (12–19 hp).',
       conv:'öppning',
       means:function(b){return b==='1'+suit?'12–19 hp och minst 4 kort i öppningsfärgen.':null}};
   }
   if(hp===11&&(fourthHandAfterThreePasses||hand.goodForEleven(suit))){
     alt=['P'];
     return {exp:'1'+suit,alt:alt,
       why:fourthHandAfterThreePasses?'Fjärde hand efter tre pass: 11 hp räcker för öppning.':
         '11 hp med bra lång färg enligt den befintliga kvalitetskontrollen: 1 i färg är tillåtet; pass är också möjligt.',
       conv:'öppning',
       means:function(b){return b==='1'+suit?'11 hp med bra färg eller fjärde hand efter tre pass.':b==='P'?'Alternativt pass med 11 hp.':null}};
   }
   // Nordisk standard säger 11 hp med bra 5+ färg men definierar inte
   // numeriskt vad "bra" betyder. good() är därför en synlig tolkning,
   // inte en ny hård systemregel.
   if(hp===11&&length>=5&&hand.good(suit)){
     return {exp:'1'+suit,alt:['P'],
       why:'11 hp och minst fem kort i lågfärgen med god färgkvalitet. Kvalitetskravet är en operativ tolkning av källans "bra 5+ färg".',
       conv:'öppning',ruleStatus:'source_interpretation',soft:true,
       means:function(b){return b==='1'+suit?'11 hp, minst 5 kort och god färgkvalitet (vägledande tolkning).':b==='P'?'Alternativt pass med 11 hp.':null}};
   }
   return null;
 }

 function respond(hand,opening){
   if(!accepts(opening))return NC('Fel modul för öppningsfärgen.');
   var result=common.resp1(hand,opening);
   if(!result||!result.exp)return result;

   // Nordisk standard kräver 11+ hp för 2 över 1. Lathundens
   // 10 hp + bra 6-kortsfärg är inte grundregel. Den enda praktiska
   // lågfärgssituationen är 1♦–2♣; med 10 hp används 1NT (6–10 hp).
   var o=st_(opening),responseSuit=st_(result.exp);
   if(hand.L[o]<4&&hand.hp===10&&/^2[CDHS]$/.test(result.exp)&&
      hand.L[responseSuit]>=6&&hand.good(responseSuit)){
     return {exp:'1N',alt:[],
       why:'10 hp når inte Nordisk standards krav 11+ hp för 2 över 1. Ingen ny färg kan visas på 1-nivån; 1NT visar 6–10 hp.',
       means:function(c){return c==='1N'?'6–10 hp, förnekar 4+ stöd och färg som kan bjudas på 1-nivån.':null},
       conv:'svar'};
   }
   return result;
 }

 function minorRebid(hand,opening,response){
   var o=st_(opening),rs=st_(response),L=hand.L;
   if(!isBid(response)||response==='1N'||response==='2N'||rs==='N'||rs===o||L[rs]>=4)return null;

   // Egen 6+ lågfärg utan sidofärg: Nordisk standard s. 3 anger
   // 12–16 HTP på lägsta nivå, 17–19 HTP med enkelhopp och 20+ HTP
   // som utgångsområde. Exakt lågfärgsutgång på 20+ är inte definierad.
   var sideSuits=SU.filter(function(s){return s!==o&&L[s]>=4;});
   if(L[o]>=6&&sideSuits.length===0){
     var ownHtp=handHps(hand,null),ownLow=lowest(o,response),ownJump=jump(o,response);
     if(ownHtp>=12&&ownHtp<=16&&ownLow)
       return {exp:ownLow,alt:[],why:ownHtp+' HTP och egen 6+ '+(api.SYM[o]||o)+' utan sidofärg: lägsta möjliga bud (12–16 HTP).',
         means:function(c){return c===ownLow?'Egen 6+ lågfärg, 12–16 HTP: lägsta nivå.':null},conv:'öppnarens 2:a bud'};
     if(ownHtp>=17&&ownHtp<=19&&ownJump)
       return {exp:ownJump,alt:[],why:ownHtp+' HTP och egen 6+ '+(api.SYM[o]||o)+' utan sidofärg: enkelhopp (17–19 HTP).',
         means:function(c){return c===ownJump?'Egen 6+ lågfärg, 17–19 HTP: enkelhopp.':null},conv:'öppnarens 2:a bud'};
     return NC(ownHtp>=20?
       '20+ HTP med egen 6+ lågfärg och utan sidofärg: källan anger hopp till utgång för högfärg men inte exakt lågfärgsbud. Ingen 5-lågfärg eller annan sekvens antas.':
       'Egen 6+ lågfärg utan sidofärg men HTP utanför de dokumenterade 12–19-intervallen.',
       function(){return null},'öppnarens 2:a bud',true);
   }

   // Tvåfärgshand med minst nio kort sammanlagt. Val av en unik
   // sidofärg följer längden; lika långa alternativ lämnas ej täckta.
   var candidates=sideSuits.filter(function(s){return s!==rs&&L[o]+L[s]>=9;});
   if(!candidates.length)return null;
   var maxLength=Math.max.apply(null,candidates.map(function(s){return L[s];}));
   var best=candidates.filter(function(s){return L[s]===maxLength;});
   if(best.length!==1)
     return NC('Flera möjliga sidofärger har samma längd. Nordisk standard anger ingen prioritet mellan dem; inget färgval görs.',function(){return null},'öppnarens 2:a bud',true);

   var second=best[0],cheapest=lowest(second,response),secondJump=jump(second,response);
   var hps=handHps(hand,null);
   // Reverse/stigande budgivning uppstår bara när den billigaste lagliga
   // visningen av den högre sidofärgen ligger på 2-nivån. Om färgen kan
   // visas på 1-nivån är det ett vanligt färgbud, inte reverse.
   var reverse=L[o]>=5&&L[second]>=4&&
     SU.indexOf(second)>SU.indexOf(o)&&cheapest&&lv(cheapest)===2;
   if(reverse){
     if(hps>=18)
       return {exp:cheapest,alt:[],why:'Reverse: '+hps+' HTP och minst 5-4. Den högre sidofärgen kan först visas på 2-nivån.',
         means:function(c){return c===cheapest?'Reverse: 18+ HTP och minst 5-4.':null},conv:'reverse'};
     if(hand.hp>=12&&hand.hp<=17){
       var openerSuitBid=lowest(o,response);
       if(openerSuitBid)return {exp:openerSuitBid,alt:[],why:hand.hp+' hp och 5+ i öppningsfärgen: under 18 HTP för reverse, visar öppningsfärgen på lägsta nivå.',
         means:function(c){return c===openerSuitBid?'12–17 hp: visa 5+ öppningsfärg i stället för reverse.':null},conv:'öppnarens 2:a bud'};
     }
     return NC('Reversekandidat utan styrka som täcks av källans intervall.',function(){return null},'reverse',true);
   }

   if(hps>=18&&secondJump)
     return {exp:secondJump,alt:[],why:hps+' HTP och minst 5-4: hopp i den andra färgen.',
       means:function(c){return c===secondJump?'18+ HTP och minst 5-4: hopp i andra färgen.':null},conv:'öppnarens 2:a bud'};
   if(hand.hp>=12&&hand.hp<=17&&cheapest)
     return {exp:cheapest,alt:[],why:hand.hp+' hp och minst nio kort i två färger: andra färgen på lägsta nivå.',
       means:function(c){return c===cheapest?'12–17 hp: andra färgen på lägsta nivå.':null},conv:'öppnarens 2:a bud'};
   return NC('Tvåfärgshand med minst nio kort men styrkan ligger utanför de dokumenterade återbudsintervallen.',function(){return null},'öppnarens 2:a bud',true);
 }

 function rebid(hand,opening,response,partnerHand){
   if(!accepts(opening))return NC('Fel modul för öppningsfärgen.');
   var specific=minorRebid(hand,opening,response);
   if(specific)return specific;
   return common.reb1(hand,opening,response,partnerHand);
 }

 return {accepts:accepts,open:open,respond:respond,rebid:rebid};
});
