'use strict';

// Generates one principal, source-conservative bidding line for an undisturbed
// deal. Each decision is delegated to decideLive with only the acting hand
// and public auction. Opponents pass because this API is explicitly for the
// undisturbed training theme; unsupported positions stop the facit visibly.
(function(root){
  function isSeat(s){return ['N','E','S','W'].includes(s);}
  function sideOf(s){return s==='N'||s==='S'?'NS':'EW';}
  function nextSeat(s){return {N:'E',E:'S',S:'W',W:'N'}[s];}
  function isCall(c){return c==='P'||/^[1-7][CDHSN]$/.test(c);}
  function meaning(result,call){
    return result&&typeof result.means==='function' ? (result.means(call)||'') : '';
  }
  function validateDeal(hands,dealer){
    if(!isSeat(dealer))return 'Ogiltig givare.';
    if(!hands||typeof hands!=='object')return 'Fyra händer krävs.';
    const seen=new Set();
    for(const seat of ['N','E','S','W']){
      const hand=hands[seat];
      if(!Array.isArray(hand)||hand.length!==13)return 'Varje spelare måste ha exakt 13 kort.';
      for(const card of hand){
        if(typeof card!=='string'||! /^[CDHS](?:[2-9]|1[0-4])$/.test(card))return 'Givaren innehåller ett ogiltigt kort.';
        if(seen.has(card))return 'Givaren innehåller ett kort mer än en gång.';
        seen.add(card);
      }
    }
    return seen.size===52?'': 'Givaren innehåller inte 52 unika kort.';
  }
  function generateUndisturbedFacit(input){
    input=input||{};
    const hands=input.hands,dealer=input.dealer,trainingSide=input.trainingSide||'NS';
    const invalid=validateDeal(hands,dealer);
    if(invalid)return {status:'invalid_deal',complete:false,auction:[],steps:[],message:invalid};
    if(trainingSide!=='NS'&&trainingSide!=='EW')
      return {status:'invalid_options',complete:false,auction:[],steps:[],message:'trainingSide måste vara NS eller EW.'};

    const auction=[],steps=[];
    let seat=dealer,passes=0,decisions=0;
    while(decisions<64){
      if(sideOf(seat)!==trainingSide){
        auction.push({s:seat,c:'P'});
        steps.push({
          seat,call:'P',callText:'Pass',kind:'assumed_opponent_pass',
          explanation:'Ostörd budgivning: motståndarsidan passar enligt träningslägets premiss.',
          systemStatus:'training_assumption'
        });
        passes++;
      }else{
        const result=root.Rattning.decideLive({
          ownHand:hands[seat].slice(),seat,dealer,auction:auction.map(x=>({s:x.s,c:x.c}))
        });
        decisions++;
        if(!result||!result.exp){
          steps.push({
            seat,kind:'uncovered',call:null,callText:'',
            explanation:result&&result.why?result.why:'Budmotorn har inte lämnat något verifierat bud.',
            systemStatus:'not_covered',
            context:'live'
          });
          return {
            status:'incomplete',complete:false,trainingSide,dealer,
            auction,steps,uncovered:{seat,auction:auction.slice(),reason:steps[steps.length-1].explanation},
            message:'Facitlinjen är ofullständig. Ingen fortsättning har hittats på eller antagits.'
          };
        }
        if(!isCall(result.exp)){
          return {status:'engine_error',complete:false,trainingSide,dealer,auction,steps,
            message:'Budmotorn returnerade ett ogiltigt bud: '+String(result.exp)};
        }
        const call=result.exp;
        const alternatives=(result.alt||[]).filter(isCall).map(c=>({
          call:c,callText:root.Rattning.txt(c),meaning:meaning(result,c)
        }));
        const step={
          seat,call,callText:root.Rattning.txt(call),
          kind:'system_recommendation',
          explanation:result.why||'',
          meaning:meaning(result,call),
          alternatives,
          alternativeNote:alternatives.length
            ?'Alternativen redovisas som möjliga bud. Denna facitlinje väljer huvudrekommendationen; alternativen är inte därmed förklarade som fel.'
            :'',
          systemStatus:'live_rule_engine',
          informationBoundary:result.informationBoundary||'own_hand_and_public_auction_only'
        };
        steps.push(step);
        auction.push({s:seat,c:call});
        passes=call==='P'?passes+1:0;
      }
      if(passes>=4){
        return {
          status:'complete',complete:true,trainingSide,dealer,auction,steps,
          contract:(function(){const last=auction.slice().reverse().find(x=>x.c!=='P');return last?{bid:last.c,bidText:root.Rattning.txt(last.c),declarer:last.s}:null;})(),
          message:auction.some(x=>x.c!=='P')?'Budgivningen är avslutad.':'Budgivningen är avslutad utan kontrakt.'
        };
      }
      if(auction.length>=4&&passes>=4)break;
      seat=nextSeat(seat);
    }
    return {status:'safety_stop',complete:false,trainingSide,dealer,auction,steps,
      message:'Säkerhetsgränsen nåddes innan budgivningen avslutades.'};
  }
  const api={generateUndisturbedFacit:generateUndisturbedFacit,version:'0.1.0'};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.BudFacit=api;
})(typeof globalThis!=='undefined'?globalThis:this);
