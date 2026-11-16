/*
 * Fristående export av rättningsmotorn/beslutsträdet.
 * Källa: Budtraning.html, feature/two-player-dds.
 * Användning: Rattning.judge({hands, dealer, bids})
 *
 * Ändringar i version 4.8 (Uppdaterade utgångströsklar):
 * - Öppningsfärg: 4-4 prioriterar H > S > C > D. 5-5 prioriterar S > H > D > C.
 * - Buggfix: Motståndarinblandning efter 1NT kraschar inte längre (c1 deklarerad tidigare).
 * - 3NT efter överföring ("Välj utgång") kräver nu jämn hand (h.bal) för att vara rätt.
 * - Fixat: Öppningshandens svar på 3NT-valet (passar eller bjuder 4M).
 *
 * Rensad version: inledande chattext och kodstaket borttagna. Rättningar utöver detta:
 * - isBid använde /^[1-7]$/ och kände därför inte igen något bud: nu /^[1-7][CDHSN]$/.
 * - transfer2 refererade till okänd variabel b (ReferenceError): raderna borttagna.
 * - judge() tappade förklaring/motivering/konvention i resultatet: bevaras nu (hp/htp/langd läggs till).
 * - Lagt till module.exports längst ned.
 */
var Rattning = (function(){
  var SU = ['C','D','H','S'], SYM = {C:'♣',D:'♦',H:'♥',S:'♠',N:'NT'}, NAME = {N:'Norr',E:'Öst',S:'Syd',W:'Väst'};
  function side(s){return s==='N'||s==='S'?0:1}
  function partner(s){return {N:'S',S:'N',E:'W',W:'E'}[s]}
  function isBid(c){return /^[1-7][CDHSN]$/.test(c)}
  function lv(c){return +c[0]} function st_(c){return c[1]}
  function rk(c){return lv(c)*5+'CDHSN'.indexOf(c[1])}
  function txt(c){return c==='P'?'Pass':(c==='X'||c==='XX')?c:c[0]+SYM[c[1]]}
  function maj(s){return s==='H'||s==='S'}
  function lowest(s,above){for(var l=1;l<=7;l++){var c=l+s;if(!above||rk(c)>rk(above))return c}return null}
  function jump(s,above){var c=lowest(s,above);return c&&lv(c)<7?(lv(c)+1)+s:null}

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

  function T(m){return function(c){return m[c]||null}}
  function ok(c,last){return c==='P'||c==='X'||c==='XX'||(isBid(c)&&(!last||rk(c)>rk(last)))}
  function NC(why,means,conv,sourceGap){return {exp:null,alt:[],why:why||'Situationen beskrivs inte i dokumentet.',means:means||function(){return null},conv:conv||'övrigt',sourceGap:!!sourceGap}}

  /* ––––– ÖPPNING ––––– */
  function openingNode(h, fourthHandAfterThreePasses){
    var hp=h.hp,L=h.L,m=h.longest(),exp,alt=[],why;
    var cs=SU.filter(function(s){return L[s]===m}),pick;

    // Nya regler för val av öppningsfärg
    if(m>=5){
      // 5-5 ordning: Spader > Hjärter > Ruter > Klöver
      var order55 = ['S', 'H', 'D', 'C'];
      pick = cs.sort(function(a,b){ return order55.indexOf(a) - order55.indexOf(b); })[0];
      if(cs.length>1) alt.push('1'+cs[1]);
    } else {
      // 4-4 ordning: Hjärter > Spader > Klöver > Ruter
      var f=SU.filter(function(s){return L[s]===4});
      var order44 = ['H', 'S', 'C', 'D'];
      pick = f.sort(function(a,b){ return order44.indexOf(a) - order44.indexOf(b); })[0];
    }

    var one='1'+pick;
    if(h.bal&&hp>=22&&hp<=27){exp='2C';why='Balanserad med '+hp+' hp: 2♣ (22-24 balanserad, starkare via 2♣).'}
    else if(h.bal&&hp>=20&&hp<=21){exp='2N';why='Balanserad 20-21 hp öppnas 2NT.'}
    else if(h.bal&&hp>=15&&hp<=17){exp='1N';why='Balanserad (fördelning '+h.shape+') med 15-17 hp öppnas 1NT.'}
    else if(hp>=22){exp='2C';why=hp+' hp är utgångskrav: öppna 2♣.'}
    else if(hp>=20){exp='2C';alt=[one];why=hp+' hp obalanserad är starkare än 1 i färg (12-19): 2♣, utgångskrav.'}
    else if(hp>=12){exp=one;why=hp+' hp med längsta färgen '+SYM[pick]+' ('+L[pick]+' kort): 1 i färg (12-19 hp).'}
    else if(hp===11&&(fourthHandAfterThreePasses||h.goodForEleven(pick))){exp=one;alt=['P'];why=fourthHandAfterThreePasses?'Fjärde hand efter tre pass: 11 hp räcker för öppning utan särskilt färgkvalitetskrav.':'11 hp med bra färg: 6 kort och minst 3 honnörer eller 7 kort och minst 2 honnörer. 1 i färg är tillåtet; pass är också möjligt.'}
    else if(hp>=6&&hp<=10&&m>=6){
      if(m===6&&pick!=='C'&&h.goodForWeakTwo(pick)){exp='2'+pick;why='6-10 hp och exakt 6-korts '+SYM[pick]+' med bra kvalitet (2 honnörer eller 1 honnör + 2 av 10-9-8): svag tvåa.'}
      else if(m===6&&pick!=='C'&&!h.goodForWeakTwo(pick)){exp='P';why='6-10 hp och 6-korts '+SYM[pick]+' men för dålig färgkvalitet för svag tvåa: pass.'}
      else if(m===6){exp='P';why='Med 6-korts ♣ finns ingen svag tvåa (2♣ är starkt). Pass.'}
      else if(m===7){exp='3'+pick;alt=['4'+pick];why='7-korts färg med 6-10 hp: spärrbud 3 i färg.'}
      else {exp='4'+pick;alt=['3'+pick];why='8-korts färg med 6-10 hp: spärrbud 4 i färg.'}
    }
    else{exp='P';why=hp+' hp räcker inte för öppning (12+, 11 med bra färg) och ingen spärrhand.'}
    return {exp:exp,alt:alt,why:why,conv:'öppning',means:function(c){
      if(c==='P')return 'Pass: under 12 hp (11 hp kräver bra färg), ingen spärrhand eller för dålig färg för svag tvåa.';
      if(c==='1N')return '15-17 hp, balanserad (även 5-korts högfärg).';
      if(c==='2C')return 'Utgångskrav, eller 22-24 hp balanserad.';
      if(c==='2N')return '20-21 hp, balanserad.';
      if(/^2[DHS]$/.test(c))return '6-10 hp, exakt 6-korts '+SYM[c[1]]+', bra färg (2 honnörer eller 1 honnör + 2 av 10-9-8).';
      if(/^3[CDHS]$/.test(c))return 'Spärrbud, 6-10 hp, 7-korts färg.';
      if(/^4[CDHS]$/.test(c))return 'Spärrbud, 6-10 hp, 8-korts färg.';
      if(/^1[CDHS]$/.test(c))return '12-19 hp, 4+ färg (11 hp endast med 6 kort + 3 honnörer eller 7 kort + 2 honnörer).';
      return null}};
  }

  /* ––––– SVAR PÅ 1 I FÄRG (Plus) ––––– */
  function resp1(h,oc){
    var o=st_(oc),hp=h.hp,L=h.L,M=maj(o),sup=L[o]>=4,htp=sup?h.htp(o):hp,exp,why,alt=[];
    var cand=SU.filter(function(s){return s!==o&&rk('1'+s)>rk(oc)&&L[s]>=4});
    function pickBest(cs){var b=cs[0];cs.forEach(function(s){if(L[s]>L[b])b=s});return b}

    var means=function(c){
      if(c==='P')return 'Pass: under 6 htp.';
      if(c==='1N')return '6-10 hp, förnekar 4-korts stöd och färg på 1-nivå. Lovar ej jämn hand.';
      if(c==='2N')return 'Stenberg: 13+ htp, 4+ stöd, utgångskrav.';
      if(isBid(c)&&st_(c)===o){var l=lv(c);
        if(l===2)return '6-9 htp, 4+ stöd.';
        if(l===3)return '10-12 htp, 4+ stöd.';
        if(l===4)return M?'Spärrbud, max 12 htp, bra stöd och svitad hand.':'Spärrbud, max 9 htp, bra stöd och svitad hand.'}
      if(isBid(c)&&st_(c)!=='N'&&st_(c)!==o){var lo=lowest(st_(c),oc),l2=lv(c);
        if(c===lo&&l2===1)return '1 över 1: 6+ hp, 4+ färg, rondkrav.';
        if(c===lo&&l2===2){if(hp>=11||(hp===10&&L[st_(c)]>=6&&h.good(st_(c))))return '2 över 1: 11+ hp (eller 10 hp med bra 6-kortsfärg), 4+ färg, rondkrav.'}
        if(l2>lv(lo))return 'Dubbelhopp i ny färg: renons i färgen, 4+ stöd och 13+ htp.'}
      return null};

    if(M&&sup){
      if(htp<6){exp='P';why='Bara '+htp+' htp med stöd: för svag för att svara.'}
      else if(htp<=9){exp='2'+o;why=htp+' htp med 4+ stöd i högfärgen: 2 i färgen (6-9 stp).'}
      else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen (10-12 stp).'}
      else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT (13+).'}
    }else if(hp<6&&(!sup||htp<6)){exp='P';why='Under 6 hp: pass.'}
    else if(!M&&sup&&cand.some(maj)){var cm=cand.filter(maj);exp=lowest(pickBest(cm),oc);why='Stöd i lågfärg men egen 4+ högfärg: visa högfärgen först (sök högfärg).';
      if(cm.length>1&&L[cm[0]]===L[cm[1]])alt.push(lowest(cm[0]===pickBest(cm)?cm[1]:cm[0],oc))}
    else if(!M&&sup){
      if(htp<=9){exp='2'+o;why=htp+' htp med 4+ stöd i lågfärgen: 2 i färgen (6-9).'}
      else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen (10-12).'}
      else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT.'}
    }
    else if(cand.length){var b=pickBest(cand);exp=lowest(b,oc);why='6+ hp och en 4+ färg på 1-nivå: 1 över 1.';
      cand.forEach(function(s){if(s!==b&&L[s]===L[b])alt.push(lowest(s,oc))})}
    else if(hp<=10&&!(hp===10&&h.longest()>=6&&h.good(h.longest()))){exp='1N';why=hp+' hp utan 4-korts stöd eller färg på 1-nivå: 1NT (6-10).'}
    else{
      var c2=SU.filter(function(s){return s!==o&&L[s]>=4});
      if(c2.length){var b2=pickBest(c2);exp=lowest(b2,oc);why=hp+' hp och 4+ färg: 2 över 1 (11+, rondkrav).'}
      else return {exp:null,alt:[],why:hp+' hp utan färg att visa: dokumentet beskriver inte detta bud.',means:means,conv:'svar'}
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:htp>=13&&exp==='2N'?'Stenberg':'svar'};
  }

  /* ––––– 1NT / 2NT-STRUKTUR (Plus) ––––– */
  function ntResp(h,k,openerCards){
    var hp=h.hp,L=h.L,b=2+k,Hs=maj,exp,why,alt=[],soft=false;
    var opener=openerCards?H(openerCards):null;
    var jointHp=hp+(opener?opener.hp:0);
    var lo=k?5:8,gl=k?5:10;
    var c2=(b)+'C',d2=(b)+'D',h2=(b)+'H',s2=(b)+'S',n2=(b)+'N';
    var means=function(c){
      if(c==='P')return 'Pass: dåliga kort utan färg att visa.';
      if(c===c2)return 'Fråga efter 4-korts högfärg (Stayman). Bör själv ha någon 4-högfärg.';
      if(c===d2)return 'Överföring: minst 5-korts ♥.';
      if(c===h2)return 'Överföring: minst 5-korts ♠.';
      if(!k&&c==='2S')return 'Dåliga kort med minst 6-korts lågfärg. Vill hellre spela 3 i lågfärg.';
      if(!k&&c==='2N')return 'Naturlig invit med balanserad hand utan 4-korts högfärg.';
      if(!k&&(c==='3C'||c==='3D'))return 'Invit med bra 6+ lågfärg.';
      if(c==='3N')return 'Slutbud (utgång i sang).';
      return null};
    var conv='1NT-svar';
    if(L.H>=5&&L.S>=5){exp=h2;alt=[d2];why='5-5 i högfärgerna: överföring till ♠ (och sedan 3♥ som invit).';conv='överföring'}
    else if(L.H>=5||L.S>=5){var M=L.H>=5?'H':'S';exp=M==='H'?d2:h2;why='5+ '+SYM[M]+': överföring.';conv='överföring'}
    else if((k?hp>=lo:true)&&(L.H===4||L.S===4)){exp=c2;why=(L.H===4||L.S===4?'Egen fyrkortshögfärg: Stayman enligt Nordisk standard.':'')+(k?' ('+hp+' hp efter 2NT).':'');conv='Stayman';soft=false}
    else if(!k&&(L.C>=6||L.D>=6||(L.C>=5&&L.D>=5))){
      return NC('Handen har 6+ kort i en lågfärg eller 5-5 i lågfärgerna. Nordisk standard skiljer mellan 2♠-relä med dåliga kort och 3 lå-invit med bra 6+ lå, men definierar inte numeriskt vad som är dåliga respektive bra kort/färg. Numerisk styrke-/kvalitetsgräns saknas; situationen lämnas ej täckt i stället för att välja med en påhittad gräns.',means,conv,true);
    }
    else if(hp>=lo&&hp<gl&&!k){
      return NC('Nordisk standard s. 4 anger 2NT som naturlig invit med balanserad hand utan 4-korts högfärg, men anger inte ett numeriskt HP-intervall. Ingen egen gräns införs; situationen lämnas ej täckt.',means,conv,true);
    }
    else if(hp>=gl){
      if(!k&&!opener){
        // 1NT shows 15–17 HCP. With 10+ own HCP, 25 combined HCP
        // are guaranteed; no hidden partner hand is needed for this game bid.
        var jointMin=hp+15;
        if(jointMin>=25){
          exp='3N';
          why=hp+' egna hp plus minst 15 hp från 1NT-öppnaren: minst 25 gemensamma hp. 3NT är slutbud.';
        }else return NC('Partnerns 1NT visar 15–17 hp. 25 gemensamma hp nås inte säkert och källan anger ingen numerisk gräns för invit/pass; situationen lämnas ej täckt.',means,conv,true);
      }else if(!k&&jointHp<25){
        return NC('Paret når inte 25 gemensamma hp för 3NT. Den naturliga 2NT-inviten saknar numeriskt styrkeintervall i källan; pass kontra invit lämnas ej täckt.',means,conv,true);
      }else{
        exp=k?n2:'3N';
        why=hp+' hp och '+(k?'tillräcklig styrka efter 2NT-öppning':jointHp+' gemensamma hp')+': 3NT.';
      }
      soft=false;
    }
    else return NC('Svarshanden saknar de uttryckliga färgprofilerna för Stayman, överföring eller lågfärgsrelä. Pass med dåliga kort är en kvalitativ möjlighet, men Nordisk standard s. 4 anger ingen numerisk gräns för när pass ska väljas; handen lämnas ej täckt.',means,conv,true);
    return {exp:exp,alt:alt,why:why,means:means,conv:conv,soft:soft};
  }
  function ntOpener(h,k,r,responderCards){
    var L=h.L,hp=h.hp,b=2+k,c2=b+'C',d2=b+'D',h2=b+'H',s2=b+'S',n2=b+'N',exp,why,alt=[],soft=false,conv='1NT-system';
    var responder=responderCards?H(responderCards):null,jointHp=hp+(responder?responder.hp:0);
    var means=function(c){
      if(r===c2){if(c===b+'D')return 'Ingen 4+ högfärg.';if(c===b+'H')return '4-5 korts ♥ (kan ha 4-4 i högfärg).';if(c===b+'S')return '4-5 korts ♠.'}
      if(r===d2){if(c===h2)return 'Fullföljer överföringen (visar 2+ ♥).';if(c===(b+1)+'H')return 'Max och 4+ ♥: kan bjuda 3♥ i stället för 2♥.'}
      if(r===h2){if(c===s2)return 'Fullföljer överföringen.';if(c===(b+1)+'S')return 'Max och 4+ ♠: kan bjuda 3♠ i stället.'}
      if(!k&&r==='2S'){if(c==='2N')return 'Längre ♦ än ♣ eller lika längd i lågfärg.';if(c==='3C')return 'Längre ♣ än ♦.'}
      if(r===b+'N'){if(c==='P')return 'Avslår 2NT-inviten; numerisk acceptgräns anges inte i Nordisk standard.';if(c==='3N')return 'Accepterar 2NT-inviten; numerisk acceptgräns anges inte i Nordisk standard.'}
      if(c==='P')return 'Pass (slutbud).';
      return null};

    if (r === b+'N') {
        if(!responder)return NC('2NT är en naturlig invit. Livebeslutet kan inte använda partnerns dolda honnörspoäng; efter given accepteras inviten med 3NT när paret når den bekräftade gränsen 25 gemensamma hp.',means,'1NT-system',true);
        if(jointHp<25)return {exp:'P',alt:[],why:jointHp+' gemensamma honnörspoäng: under 25-hp-gränsen för 3NT, avslår 2NT-inviten.',means:means,conv:'1NT-system',soft:false};
        return {exp:'3N',alt:[],why:jointHp+' gemensamma honnörspoäng: når 25-hp-gränsen för 3NT och accepterar 2NT-inviten.',means:means,conv:'1NT-system',soft:false};
    }

    if(r===c2){conv='Stayman';exp=L.H>=4?h2:L.S>=4?s2:d2;
      why=L.H>=4?'4+ ♥ (även 4-4 i högfärg): 2♥.':L.S>=4?'4+ ♠ utan ♥: 2♠.':'Ingen 4-korts högfärg: 2♦.';
      if(L.H>=4&&L.S>=5)alt=[s2]}
    else if(r===d2||r===h2){conv='överföring';var M=r===d2?'H':'S';
      if(hp>=17&&L[M]>=4&&!k){exp=(b+1)+M;alt=[b+M];why='Max (17 hp) och 4+ '+SYM[M]+': får bjuda 3 i färgen, men 2 i färgen är det vanliga.'}
      else{exp=b+M;why='Fullföljer överföringen.'}}
    else if(!k&&r==='2S'){conv='1NT-svar';exp=L.C>L.D?'3C':'2N';why=L.C>L.D?'Längre ♣ än ♦: 3♣.':'Längre ♦ än ♣ eller lika: 2NT.'}
    else if(!k&&(r==='3C'||r==='3D')){
      var m=r[1],topHonor=[14,13,12].some(function(n){return h.has(m,n)});
      if((L[m]===2||L[m]===3)&&topHonor){exp='3N';why='Topphonnör i 2–3-kortsstödet i den bjudna lågfärgen: söker 3NT enligt Nordisk standard s. 4.';}
      else if((L[m]===2||L[m]===3)&&!topHonor){exp='P';why='Endast xx/xxx i stödfärgen: passar enligt Nordisk standard s. 4.';}
      else return NC('Efter invitbudet 3'+m+' är endast pass med xx/xxx i stöd eller 3NT med topphonnör uttryckligen beskrivet. Övrig stödlängd utan topphonnör lämnas ej täckt.',means,'1NT-svar',true);
      soft=true;
    }
    else if(r==='3N'||(!k&&r==='2N'&&false)){exp='P';why='Slutbud: pass.'}
    else return NC('Öppnarens svar på detta bud beskrivs inte i dokumentet; fortsättningen lämnas ej täckt.',means,conv,true);
    return {exp:exp,alt:alt,why:why,means:means,conv:conv,soft:soft};
  }
  function stay2(h,reply,openerCards){
    var hp=h.hp,L=h.L,M=reply==='2H'?'H':reply==='2S'?'S':null,exp,why,alt=[];
    var opener=openerCards?H(openerCards):null;
    var fit=opener&&M?L[M]+opener.L[M]:0;

    var means=function(c){
      if(/^3[HS]$/.test(c))return 'Invit i öppnarens visade högfärg; exakt numerisk styrkegräns anges inte i Nordisk standard.';
      if(c==='2N')return 'Balanserad invit; efter Stayman 2♥ visar 2NT exakt fyra spader. Numerisk invitgräns anges inte i Nordisk standard.';
      if(c==='3N')return 'Utgång i sang utan fastställd högfärgsfit; numerisk HP-gräns anges inte i Nordisk standard.';
      if(c==='4H'||c==='4S')return 'Utgång i högfärgen med minst 8-korts fit; exakt acceptgräns efter Stayman anges inte här.';
      return null};
    // Nordisk standard s. 4: after a 2♥ Stayman answer, responder's
    // 2NT shows exactly four spades; a new suit is natural and game-forcing
    // (5+ major or 4+ minor). The same natural GF principle applies after 2♠.
    if(reply==='2H'&&L.S===4){
      // The 2NT route shows four spades and is described as an invitation.
      // The PDF gives opener's 4-4 response (3S minimum / 4S maximum), but
      // does not state responder's numeric threshold for choosing it.
      return NC('Exakt fyra spader efter Stayman 2♥ är visat. 2NT är den särskilda invitvägen, men Nordisk standard anger inte svarshandens numeriska styrkegräns för att välja mellan pass och denna invit. Ingen numerisk HP-gräns eller egen HP-regel överförs hit.',function(c){if(c==='2N')return 'Invit med exakt fyra spader; öppnaren visar 4-4 i högfärgerna med 3♠/4♠ enligt styrka.';return null},'Stayman',true);
    }
    var naturalNew=[];
    if(reply==='2D'){
      if(L.H>=5)naturalNew.push('H');
      if(L.S>=5)naturalNew.push('S');
      if(L.C>=4)naturalNew.push('C');
    }else if(reply==='2H'){
      if(L.S>=5)naturalNew.push('S');
      ['C','D'].forEach(function(suit){if(L[suit]>=4)naturalNew.push(suit);});
    }else if(reply==='2S'){
      if(L.H>=5)naturalNew.push('H');
      ['C','D'].forEach(function(suit){if(L[suit]>=4)naturalNew.push(suit);});
    }
    if(naturalNew.length===1){
      var ns=naturalNew[0],newBid=lowest(ns,reply);
      return {exp:newBid,alt:[],why:'Ny färg efter Stayman: '+(maj(ns)?'minst fem kort i högfärgen':'minst fyra kort i lågfärgen')+' och utgångskrav enligt Nordisk standard s. 4.',means:function(c){return c===newBid?'Naturlig ny färg, utgångskrav.':null},conv:'Stayman'};
    }
    if(naturalNew.length>1)
      return NC('Efter Stayman uppfyller flera nya färger längdkravet för naturligt utgångskrav. Nordisk standard s. 4 anger ingen prioritet mellan dem.',null,'Stayman',true);
    if(!opener){
      return NC('Efter Stayman är den egna handen inte tillräcklig för att avgöra invit/pass eller utgång utan partnerns dolda hand. 3NT är ett slutbud, men numerisk HP-gräns för att välja det anges inte i Nordisk standard; endast HP räknas i sang och ingen egen gräns införs.',means,'Stayman',true);
    }
    if(M&&L[M]>=4&&opener&&fit>=8){
      return NC('Minst 8-korts fit efter Stayman är känd, men Nordisk standard anger inte en särskild numerisk acceptgräns för att välja 4M framför invit eller pass i denna Staymanfortsättning. Den separata 26-poängsgränsen för högfärgsutgång från andra sekvenser överförs inte hit; lämnas ej täckt.',means,'Stayman',true);
    }else{
      var five=L.H>=5?'H':L.S>=5?'S':null;
      if(reply==='2D'&&five&&!h.bal)
        return NC('Obalanserad svarshand med 5-korts högfärg efter Stayman 2♦ kan fortsätta med 3 i högfärgen vid utgångsstyrka, men den numeriska styrkegränsen är inte angiven.',means,'Stayman',true);
      return NC('Ingen högfärgsfit är fastställd. 3NT är ett slutbud, men Nordisk standard anger ingen numerisk HP-gräns för att välja det framför invit/pass; endast HP räknas i sang och handen lämnas ej täckt.',means,'Stayman',true);
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'Stayman'};
  }
  function transfer2(h,M){
    var L=h.L,exp,why,alt=[];
    var minors=['C','D'];
    var means=function(c){
      if(c==='P')return 'Svag hand med minst fem kort i överföringsfärgen; exakt styrkegräns anges inte.';
      if(c==='2N')return 'Invit med jämn hand och exakt fem kort i överföringsfärgen.';
      if(c==='3'+M)return 'Invit med minst sex kort i överföringsfärgen.';
      if(c==='3N')return 'Välj sangutgång med jämn hand och exakt fem kort i överföringsfärgen.';
      if(c==='4'+M)return 'Slutbud i överföringsfärgen.';
      if(M==='H'&&c==='2S')return 'Rondkrav med minst 5♥ och 4+♠.';
      if(c==='3C'||c==='3D')return 'Utgångskrav med minst fem kort i överföringsfärgen och 4+ i bjuden lågfärg.';
      if(M==='S'&&c==='3H')return 'Invit med minst 5-5 i båda högfärgerna.';
      if(c==='4C'||c==='4D')return 'Kontrollbud och slamintresse i överföringsfärgen.';
      if(c==='4N')return 'RKC med överföringsfärgen som trumf.';
      return null;
    };

    if(L[M]<5)
      return NC('Överföringssekvensen visar minst fem kort i '+SYM[M]+', men den egna handen uppfyller inte längdkravet. Situationen lämnas ej täckt.',means,'överföring',true);

    // These special continuations are explicitly described by the source.
    // If more than one shape condition applies, the PDF gives no priority.
    var special=[];
    if(M==='H'&&L.S>=4)
      special.push({bid:'2S',why:'Minst 5♥ och 4+♠: 2♠ är rondkrav enligt Nordisk standard s. 5.'});
    minors.filter(function(suit){return L[suit]>=4;}).forEach(function(suit){
      special.push({bid:'3'+suit,why:'Minst 5'+SYM[M]+' och 4+ '+SYM[suit]+': 3 i lågfärgen är utgångskrav enligt Nordisk standard s. 5.'});
    });
    if(M==='S'&&L.H>=5)
      return NC('Minst 5-5 i högfärgerna efter spaderöverföring. Nordisk standard s. 5 anger 3♥ som invit, men styrkegränsen för att välja invitvägen anges inte; handen lämnas ej täckt.',means,'överföring',true);
    if(special.length>1)
      return NC('Handen uppfyller flera särskilda fortsättningsbeskrivningar efter överföring ('+special.map(function(x){return x.bid;}).join(', ')+'). Nordisk standard anger ingen prioritet mellan dessa överlappande grenar; situationen lämnas ej täckt.',means,'överföring',true);
    if(special.length===1){
      if(special[0].bid==='3H'&&M==='S')
        return NC('Minst 5-5 i högfärgerna identifierar 3♥ som invit efter spaderöverföring, men källan anger ingen numerisk styrkegräns för när inviten ska väljas framför pass eller utgång. Situationen lämnas ej täckt.',means,'överföring',true);
      return {exp:special[0].bid,alt:[],why:special[0].why,means:means,conv:'överföring'};
    }

    // The source gives the meanings of pass, invitation and game-choice
    // continuations, but does not quantify "weak", "invite" or game strength.
    // Do not turn these qualitative descriptions into invented HCP bands.
    if(h.bal&&L[M]===5)
      return NC('Jämn hand med exakt fem kort i överföringsfärgen: källan beskriver både 2NT-invit och 3NT som val av utgång, men anger ingen numerisk styrkegräns för valet. Situationen lämnas ej täckt.',means,'överföring',true);
    if(L[M]>=6)
      return NC('Minst sex kort i överföringsfärgen: källan beskriver 3M som invit och 4M som slutbud, men anger ingen numerisk styrkegräns för valet. Situationen lämnas ej täckt.',means,'överföring',true);
    return NC('Överföringshanden uppfyller inte någon av de särskilt beskrivna fortsättningsprofilerna. Källan anger ingen fullständig fortsättningsregel för denna handtyp; situationen lämnas ej täckt.',means,'överföring',true);
  }
  function ntOpenerInvit(h,M,inv,responderCards){
    var means=function(c){
      if(c==='P')return 'Öppnarens accept/pass efter invit; exakta acceptkriterier anges inte i Nordisk standard s. 5.';
      if(c==='3N')return 'Utgång i sang efter invit utan etablerad högfärgsfit.';
      if(c==='4'+M)return 'Utgång i överföringsfärgen efter invit.';
      return null};
    if(inv!=='2N'&&inv!=='3'+M)
      return NC('Öppnarens svar på detta bud beskrivs inte i dokumentet; fortsättningen lämnas ej täckt.',means,'överföring',true);
    return NC('Nordisk standard s. 5 beskriver 2NT/3M som inviter efter överföring men anger inte öppnarens numeriska accept-/passgräns. Den separata 26-poängsgränsen för andra högfärgssekvenser överförs inte hit; fortsättningen lämnas ej täckt.',means,'överföring',true);
  }
  function ntOpener3(h,k1,k2,k3,responderCards){
    var L=h.L,hp=h.hp,partner=responderCards?H(responderCards):null,jointHp=hp+(partner?partner.hp:0);
    if(k1==='2S'&&((k2==='2N'&&(k3==='3C'||k3==='3D'))||(k2==='3C'&&k3==='3D'))){
      return {exp:'P',alt:[],why:'Svarshanden har valt slutbud i lågfärg efter 2♠-reläet. Pass avslutar budgivningen.',means:function(c){return c==='P'?'Pass efter svarshandens val av lågfärg.':null},conv:'1NT-svar'};
    }
    var M = st_(k2);
    if(k1==='2C'&&M==='D'&&k3==='2N'){
      var meansNoMajor=function(c){if(c==='P')return 'Passar när paret inte når 25 gemensamma honnörspoäng.';if(c==='3N')return 'Accepterar när paret når 25 gemensamma honnörspoäng.';return null};
      if(!partner)return NC('Efter Stayman 2♦–2NT är 2NT en balanserad sanginvit. Livebeslutet får inte använda partnerns dolda hand; efter given är 25 gemensamma hp den bekräftade 3NT-gränsen.',meansNoMajor,'Stayman',true);
      if(jointHp<25)return {exp:'P',alt:[],why:jointHp+' gemensamma honnörspoäng: under 25-hp-gränsen, avslår 2NT-inviten efter Stayman 2♦.',means:meansNoMajor,conv:'Stayman'};
      return {exp:'3N',alt:[],why:jointHp+' gemensamma honnörspoäng: accepterar 2NT-inviten med 3NT.',means:meansNoMajor,conv:'Stayman'};
    }
    if(k1==='2C'&&M==='H'&&k3==='2N'){
      // Nordisk standard s. 4: 2NT visar fyra spader hos svarshanden.
      // Med 4-4 i högfärgerna väljer öppnaren 3♠ med minimum och 4♠ med maximum.
      var meansHeartStaymanInvite=function(c){
        if(c==='3S')return '4-4 i högfärgerna och minimum (15–16 hp): visar spaderfit på invitnivå.';
        if(c==='4S')return '4-4 i högfärgerna och maximum (17 hp): accepterar inviten i spader.';
        return null;
      };
      if(L.H===4&&L.S===4){
        if(hp===17)return {exp:'4S',alt:[],why:'4-4 i högfärgerna och 17 hp (maximum): accepterar 2NT-inviten med 4♠.',means:meansHeartStaymanInvite,conv:'Stayman'};
        if(hp>=15&&hp<=16)return {exp:'3S',alt:[],why:'4-4 i högfärgerna och '+hp+' hp (minimum): visar spaderfit med 3♠.',means:meansHeartStaymanInvite,conv:'Stayman'};
      }
      return NC('Nordisk standard s. 4 anger öppnarens 3♠/4♠-val efter 2NT när öppnaren har 4-4 i högfärgerna. Övriga handtyper i denna fortsättning är inte tillräckligt specificerade.',meansHeartStaymanInvite,'Stayman');
    }
    if(k1==='2C'&&M==='H'&&k3==='3N'){
      // Nordisk standard s. 4: 3NT visar också fyra spader hos svarshanden.
      // Öppnaren kan välja 4♠ när den egna handen är 4-4 i högfärgerna.
      var meansHeartStaymanGame=function(c){
        if(c==='4S')return '4-4 i högfärgerna: väljer 4♠ efter svarshandens 3NT.';
        if(c==='P')return 'Ingen 4-4 i högfärgerna: passar på 3NT.';
        return null;
      };
      if(L.H===4&&L.S===4)return {exp:'4S',alt:[],why:'4-4 i högfärgerna: väljer 4♠ efter svarshandens 3NT enligt Nordisk standard s. 4.',means:meansHeartStaymanGame,conv:'Stayman'};
      return {exp:'P',alt:[],why:'Öppnaren har inte 4-4 i högfärgerna; passar på 3NT.',means:meansHeartStaymanGame,conv:'Stayman'};
    }
    if(k1==='2C'&&(M==='H'||M==='S')&&k3==='3'+M){
      var gameSuit='4'+M;
      var meansInvite=function(c){if(c==='P')return 'Öppnarens accept/pass efter Stayman-invit; numeriska acceptkriterier anges inte i Nordisk standard.';if(c===gameSuit)return 'Möjlig utgång efter Stayman-invit; acceptkriterierna är inte fastställda här.';return null};
      return NC('Svarshanden har inviterat med 3'+M+' efter Stayman. Nordisk standard anger inte öppnarens numeriska accept-/passgräns för denna Staymanfortsättning. Den separata 26-poängsgränsen för andra högfärgssekvenser överförs inte hit.',meansInvite,'Stayman',true);
    }
    if(k1==='2C'&&(M==='H'||M==='S')&&k3==='3N'){
      var means2=function(c){return c==='P'?'Passar på utgångsbudet.':null};
      return {exp:'P', alt:[], why:'Slutbud: pass.', means:means2, conv:'Stayman'};
    }
    return NC('Fortsättningen beskrivs inte i dokumentet; lämnas ej täckt.',null,'1NT-system',true);
  }
  function ntOpener3NTChoice(h,M){
    var L=h.L;
    var means=function(c){
      if(c==='P')return 'Passar på 3NT när öppnarens hand inte har minst tre kort i överföringsfärgen.';
      if(c==='4'+M)return 'Öppnarens möjliga korrigering till högfärgsutgång vid 3+ stöd är inte definierad i Nordisk standard s. 5.';
      return null;
    };
    if(L[M]>=3)
      return NC('Svarshanden har valt 3NT som utgång efter överföring. Öppnaren har 3+ kort i överföringsfärgen, men Nordisk standard s. 5 anger inte om öppnaren ska korrigera till 4M eller passa. Fortsättningen lämnas ej täckt.',means,'överföring',true);
    return {exp:'P',alt:[],why:'Svarshanden har valt 3NT som utgång. Öppnaren har färre än tre kort i överföringsfärgen och passar.',means:means,conv:'överföring'};
  }

  /* ––––– 2♣-ÖPPNING (Nordisk standard / Herbert) ––––– */
  function resp2c(h){
    var means=function(c){return c==='2D'?'Väntebud (relä): säger ingenting om ruterfärgen.':'Endast 2♦ används som första svar i detta system.'};
    return {exp:'2D',alt:[],why:'Svarshanden bjuder alltid 2♦ (väntebud) på 2♣, oavsett styrka och fördelning.',means:means,conv:'2♣-system'};
  }
  function reb2c(h,r){
    var L=h.L,hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(r!=='2D')return null;
      if(c==='2H'||c==='2S')return 'Utgångskrav, 5+ '+SYM[c[1]]+'.';
      if(c==='2N')return '22-24 hp, jämn hand.';
      if(c==='3C'||c==='3D')return 'Utgångskrav, 5+ '+SYM[c[1]]+'.';
      if(c==='3N')return '25-27 hp, jämn hand.';
      return null};
    if(r!=='2D')return {exp:null,alt:[],why:'Endast 2♦-svar hanteras i detta system.',means:means,conv:'2♣-system'};
    if(h.bal&&hp<=24){exp='2N';why=hp+' hp jämn: 2NT (22-24).'}
    else if(h.bal){exp='3N';why=hp+' hp jämn: 3NT (25-27).'}
    else{var mj=['H','S'].filter(function(s){return L[s]>=5}).sort(function(a,b){return L[b]-L[a]||(b==='S'?1:-1)});
      var mn=['C','D'].filter(function(s){return L[s]>=5}).sort(function(a,b){return L[b]-L[a]});
      if(mj.length){exp='2'+mj[0];why='5+ '+SYM[mj[0]]+': 2 i högfärgen (utgångskrav).'}
      else if(mn.length){exp='3'+mn[0];why='5+ '+SYM[mn[0]]+': 3 i lågfärgen (utgångskrav).'}
      else return {exp:null,alt:[],why:'Obalanserad hand utan 5-korts färg: dokumentet anger inte budet.',means:means,conv:'2♣-system'}}
    return {exp:exp,alt:alt,why:why,means:means,conv:'2♣-system',soft:false};
  }
  function resp2c2(h,rb,mine){
    var hp=h.hp,L=h.L,exp,why,alt=[];
    var near={'2H':'2S','2S':'2N','3C':'3D','3D':'3H'}[rb];
    var means=function(c){
      if(c===near)return 'Herbertavslag: närmsta bud visar 0-5 hp och ej trumfstöd.';
      if(c==='3'+rb[1]&&maj(rb[1])&&rb[0]==='2')return '6+ hp och 3+ stöd.';
      if(c==='4'+rb[1]&&rb[0]==='2')return '0-5 hp med stöldvärde och 4+ stöd.';
      if(c==='3N')return '6+ hp, jämn hand.';
      if((c==='3H'||c==='3S')&&rb[0]==='3')return '6+ hp och 4+ färg.';
      if(c==='4'+rb[1]&&rb[0]==='3')return '6+ hp, 3+ stöd och slamintresserad.';
      if(c==='5'+rb[1]&&rb[0]==='3')return '0-5 hp med stöldvärde och bra trumfstöd.';
      if(isBid(c)&&rb[0]==='2'&&st_(c)!==rb[1])return '6+ hp och 5+ färg.';
      return null};
    if(!near)return {exp:null,alt:[],why:'Fortsättningen beskrivs inte i dokumentet.',means:means,conv:'2♣-system'};
    var T_=rb[1],single=h.singles().length>0;
    if(rb[0]==='2'){
      if(hp<=5){
        if(L[T_]>=4&&single){exp='4'+T_;alt=[near];why='0-5 hp med 4+ stöd och stöldvärde: 4 i färgen.'}
        else{exp=near;why='0-5 hp utan stödvärde: Herbertavslag.'}
      }else if(L[T_]>=3){exp='3'+T_;why='6+ hp och 3+ stöd: 3 i färgen.'}
      else{var ns=SU.filter(function(s){return s!==T_&&L[s]>=5}).sort(function(a,b){return L[b]-L[a]})[0];
        if(ns){exp=lowest(ns,rb);why='6+ hp och 5+ '+SYM[ns]+': ny färg.'}
        else if(h.bal){exp='3N';why='6+ hp och jämn hand: 3NT.'}
        else return {exp:null,alt:[],why:'Dokumentet anger inte budet för denna hand.',means:means,conv:'2♣-system'}}
    }else{
      var m_=T_;
      if(hp<=5){
        if(L[m_]>=4&&single){exp='5'+m_;alt=[near];why='0-5 hp med stöldvärde och bra trumfstöd: 5 i färgen.'}
        else{exp=near;why='0-5 hp: Herbertavslag.'}
      }else if(L[m_]>=3){exp='4'+m_;why='6+ hp och 3+ stöd: 4 i färgen (slamintresse).'}
      else{var mj=['H','S'].filter(function(s){return L[s]>=4}).sort(function(a,b){return L[b]-L[a]||(a==='H'?-1:1)})[0];
        if(mj){exp='3'+mj;why='6+ hp och 4+ '+SYM[mj]+': 3 i färgen.'}
        else if(h.bal){exp='3N';why='6+ hp och jämn hand: 3NT.'}
        else return {exp:null,alt:[],why:'Dokumentet anger inte budet för denna hand.',means:means,conv:'2♣-system'}}
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'Herbert'};
  }

  /* ––––– SVAG TVÅA (Plus) ––––– */
  function resp2w(h,oc,openerCards){
    var o=st_(oc),L=h.L,hp=h.hp,exp,why,alt=[];
    var opener=openerCards?H(openerCards):null;
    var fit=opener?L[o]+opener.L[o]:0;
    var jointPoints=opener&&fit>=8?partnershipPoints(h,opener,o):0;
    var newSuits=SU.filter(function(s){return s!==o&&L[s]>=5;})
      .sort(function(a,b){if(L[b]!==L[a])return L[b]-L[a];return SU.indexOf(b)-SU.indexOf(a);});
    var preempt=hp<=8&&L[o]>=3;
    var invite=hp>=9&&hp<=10&&L[o]>=2;
    var means=function(c){
      if(c==='3'+o)return 'Spärrande höjning: minst 3 korts stöd, ej invit.';
      if(c==='2N')return 'Invit: 9-10 hp och minst 2 korts stöd.';
      if(c==='6'+o)return 'Lillslam: minst 10-korts fit och 33+ gemensamma spelpoäng.';
      if(c===(maj(o)?'4':'5')+o)return 'Utgång: gemensamma spelpoäng når systemets gräns med etablerad fit.';
      if(c==='P')return 'Pass med svag hand utan stöd eller egen 5+ färg.';
      if(isBid(c)&&st_(c)!==o&&st_(c)!=='N')return 'Ny färg: minst 5 kort, krav till minst 3 i öppningsfärgen.';
      return null;
    };
    // Med etablerad fit väger gemensam spelstyrka före svaga svarsalternativ.
    // 33+ spelpoäng och minst 10 trumf motiverar lillslam; annars gäller
    // 26+ i högfärg respektive 28+ i lågfärg för utgång.
    if(opener && !newSuits.length && fit>=8){
      if(fit>=10 && jointPoints>=33){
        exp='6'+o;
        why=fit+'-korts fit i '+SYM[o]+' och '+jointPoints+' gemensamma spelpoäng: lillslam ska undersökas.';
        return {exp:exp,alt:[],why:why,means:means,conv:'svag tvåa / slam',soft:false};
      }
      var gameThreshold=maj(o)?26:28;
      if(jointPoints>=gameThreshold){
        exp=maj(o)?'4'+o:'5'+o;
        why=fit+'-korts fit i '+SYM[o]+' och '+jointPoints+' gemensamma spelpoäng: utgång enligt '+gameThreshold+'-poängsgränsen.';
        return {exp:exp,alt:[],why:why,means:means,conv:'svag tvåa',soft:false};
      }
    }
    if(newSuits.length>1){
      return NC('Handen har flera egna 5+ färger efter svag tvåa. REF anger ingen prioritet mellan färgerna; välj inte en färg enbart utifrån intern sorteringsordning.');
    }
    if(newSuits.length&&(preempt||invite)){
      return NC('Handen uppfyller både villkoret för egen 5+ färg och ett stöd-bud efter svag tvåa. REF anger ingen prioritet mellan dessa alternativ.');
    }
    if(newSuits.length){
      exp=lowest(newSuits[0],oc);
      why='5+ kort i '+SYM[newSuits[0]]+': ny färg, krav till minst 3 i öppningsfärgen.';
    }else if(preempt){
      exp='3'+o;
      why='Svag hand med 3+ stöd: spärrande höjning till 3 i öppningsfärgen, ej invit.';
    }else if(invite){
      exp='2N';
      why=hp+' hp och 2+ stöd: invit 2NT.';
    }else if(hp<=8){
      exp='P';why=hp+' hp utan 3+ stöd eller egen 5+ färg: pass.';
    }else{
      return NC('Svar efter svag tvåa: handen passar inte de uttryckligen angivna villkoren för 5+ färg, spärrhöjning eller 2NT-invit.');
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'svag tvåa',soft:false};
  }
  function open2w(h,oc,r){
    var o=st_(oc),hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(r==='2N'){
        if(c==='3'+o)return 'Öppnarens minimum: 6-8 hp, 3 i öppningsfärgen.';
        if((maj(o)&&c==='4'+o)||(!maj(o)&&c==='3N'))return 'Öppnarens maximum: 9-10 hp, 4M eller 3NT efter lågfärg.';
        if(c==='P')return 'Pass efter 2NT-invit när öppnarens hand inte passar minimum-/maximumåterbudet.';
      }
      return null};
    if(r==='2N'){
      if(hp>=6&&hp<=8){exp='3'+o;why=hp+' hp: minimum, 3 i öppningsfärgen.';return {exp:exp,alt:[],why:why,means:means,conv:'svag tvåa',soft:false};}
      if(hp>=9&&hp<=10){
        exp=maj(o)?'4'+o:'3N';
        why=hp+' hp: maximum efter 2NT-invit; '+(maj(o)?'4 i högfärgen.':'3NT efter lågfärgsöppning.');
        return {exp:exp,alt:[],why:why,means:means,conv:'svag tvåa',soft:false};
      }
      return NC('Öppnarens styrka efter 2NT-invit ligger utanför de uttryckligen angivna 6-8/9-10 hp-intervallen.',means,'svag tvåa');
    }
    if(r==='3'+o){
      return NC('Svarshandens 3-bud är spärrande och ej invit. Öppnarens fortsättning efter spärrhöjningen specificeras inte i REF.',means,'svag tvåa');
    }
    if(isBid(r)&&r[1]!==o&&r[1]!=='N'){
      return {exp:null,alt:[],why:'Svarshandens nya färg efter svag tvåa är 5+ kort och forcing till minst 3 i öppningsfärgen. Öppnarens återbud efter detta krav specificeras inte i REF; pass kan därför inte godkännas men inget exakt återbud kan rekommenderas.',means:means,conv:'svag tvåa'};
    }
    return {exp:null,alt:[],why:'Fortsättningen beskrivs inte i dokumentet.',means:means,conv:'svag tvåa'};
  }

  /* ––––– ÖPPNARENS ANDRA BUD (Plus) ––––– */
  function reb1(h,oc,r,partnerCards){
    var o=st_(oc),hp=h.hp,L=h.L,rs=st_(r),exp,why,alt=[],soft=false,reverseBid=null;

    var means=function(c){
      if(c===reverseBid&&reverseBid)return 'Reverse: 18+ HPS och minst 5-4 i öppningsfärgen och den nya färgen. HPS räknas enligt reglerna för egen 6+-färg eller 5-5, utan krav på fastställd trumf.';
      if(r==='2N'){var Ma=maj(o);
        if(c==='3N')return '12-14 hp, balanserad hand.';
        if(c==='3'+o)return '15+ htp utan singel: extra styrka.';
        if(isBid(c)&&lv(c)===3)return 'Singel i '+SYM[c[1]]+' (12-15 hp).';return null}
      if(rs===o&&lv(r)===2){if(c==='4'+o)return '20+ htp: utgång.';if(c==='3'+o)return '17-19 htp, naturlig invit.';if(isBid(c)&&lv(c)===3)return '17-19 htp med singel i den bjudna färgen.';if(c==='P')return 'Pass: 13-15 stp.'}
      if(rs!==o&&rs!=='N'&&c===lv(r)+1+rs)return 'Trumfstöd, lägsta höjning: 12-16 stp.';
      if(rs!==o&&rs!=='N'&&c===(lv(r)+2)+rs)return 'Trumfstöd, enkelhopp: 17-19 stp.';
      if(isBid(c)&&st_(c)===o&&rs!==o)return 'Egen färg.';
      if(c==='1N'||c==='2N'&&lv(r)===1&&r!=='1N')return c==='1N'?'12-14 hp, balanserad (NT på lägsta nivå).':'18-19 hp, balanserad (hopp i NT).';
      if(r==='1N'&&c==='2N')return '18-19 hp, balanserad (2NT när partnern bjöd 1NT).';
      if(r==='1N'&&c==='P')return 'Pass: 12-17 hp med 4-4-4-1 får stanna i 1NT.';
      if(r==='1N'&&isBid(c)&&c[1]!=='N'&&c[1]!==o)return '4-4-4-1: visar en annan fyrkortsfärg på 2-nivån trots bara fyra kort.';
      if(r==='1N'&&c==='P')return 'Pass: 12-14 balanserad.';
      if(isBid(c)&&st_(c)!=='N'&&st_(c)!==o&&st_(c)!==rs)return 'Andra färg.';
      return null};

    if(r==='2N'){
      var sg=h.singles().filter(function(s){return L[s]===1&&s!==o});
      if(sg.length>1){
        return {exp:null,alt:[],why:'Flera sidofärger är singel. Systemunderlaget anger ingen prioritet mellan dem; välj inte ett godtyckligt 3-bud.',means:means,conv:'Stenberg'};
      }
      if(sg.length===1){var s1=sg[0];exp='3'+s1;why='Singel i '+SYM[s1]+': visa den på 3-nivå.';soft=true}
      else if(h.htp(o)>=15){exp='3'+o;why=h.htp(o)+' htp utan singel: 3 i färgen (15+).';}
      else if(h.bal&&h.hp>=12&&h.hp<=14){exp='3N';why=h.hp+' hp, balanserad hand utan singel: 3NT.'}
      else return {exp:null,alt:[],why:'Efter Stenberg: utan 15+ htp, singel eller balanserad 12-14 hp anger dokumentet inte budet.',means:means,conv:'Stenberg'};
      return {exp:exp,alt:alt,why:why,means:means,conv:'Stenberg',soft:soft};
    }
    if(rs===o){
      // 3M is an invit with 10–12 HTP and at least four-card support.
      // Accept only when the partnership reaches the agreed 26 playing-point game threshold.
      if(lv(r)===3&&maj(o)){
        var inviter=H(partnerCards||[]),majorFit=h.L[o]+inviter.L[o];
        var combinedMajorPoints=partnershipPoints(h,inviter,o);
        if(majorFit>=8&&combinedMajorPoints>=26){
          return {exp:'4'+o,alt:[],why:majorFit+'-korts fit i '+SYM[o]+' och '+combinedMajorPoints+' gemensamma spelpoäng: acceptera 3'+SYM[o]+'-inviten till utgång.',means:function(c){return c==='4'+o?'Accepterar högfärgsinvit med 26+ gemensamma spelpoäng.':null},conv:'invit i högfärg'};
        }
        return {exp:'P',alt:[],why:majorFit+'-korts fit i '+SYM[o]+' men endast '+combinedMajorPoints+' gemensamma spelpoäng: under 26, avslå inviten och passa.',means:function(c){return c==='P'?'Avslår 3'+SYM[o]+'-inviten under 26 gemensamma spelpoäng.':null},conv:'invit i högfärg'};
      }
      if(lv(r)===2&&maj(o)){var t=h.htp(o);
        if(t>=20){exp='4'+o;why=t+' htp: utgång (20+).'}
        else if(t>=17){
          var sg2=SU.filter(function(s){return s!==o&&L[s]===1});
          if(sg2.length>1)return {exp:null,alt:[],why:'17-19 HTP och singel i flera sidofärger. Systemunderlaget anger ingen prioritet mellan färgerna; välj inte ett godtyckligt återbud.',means:means,conv:'trumfstöd'};
          if(sg2.length===1){exp=lowest(sg2[0],r);alt=['3'+o];why=t+' htp med singel: ny färg (17-19).'}
          else{exp='3'+o;why=t+' htp utan singel: 3 i färgen (17-19, invit).'}
        }
        else{exp='P';why=t+' htp: högst 16, pass.'}
        return {exp:exp,alt:alt,why:why,means:means,conv:'trumfstöd',soft:true};}
      if(!maj(o)&&lv(r)>=2&&h.bal&&h.hp>=18){
        return {exp:'3N',alt:[],why:h.hp+' hp och jämn fördelning efter partnerns lågfärgshöjning: välj 3NT före utgång i lågfärg.',means:function(c){return c==='3N'?'18+ hp och jämn fördelning: sang prioriteras framför lågfärgsutgång.':null},conv:'trumfstöd'};
      }
      if(!maj(o)&&lv(r)>=2&&h.hp<=14){
        return {exp:'P',alt:[],why:'Öppnaren har minimum eller normal styrka efter partnerns lågfärgshöjning. Pass tills vidare; starkare fortsättning kräver ytterligare stöd eller styrka.',means:means,conv:'trumfstöd'};
      }
      return {exp:null,alt:[],why:'Fortsättningen efter denna höjning beskrivs inte i dokumentet.',means:means,conv:'trumfstöd'};
    }
    var low=function(s){return lowest(s,r)};
    var sup=rs!=='N'&&L[rs]>=4;
    var side4=SU.filter(function(s){return s!==o&&L[s]>=4});
    if(sup){var tp=h.htp(rs);
      if(tp<=16){exp=low(rs);why='4+ stöd i '+SYM[rs]+' och '+tp+' htp: lägsta höjning (12-16).'}
      else if(tp<=19){exp=jump(rs,r);why=tp+' htp med stöd: enkelhopp (17-19).'}
      else if(maj(rs)){exp='4'+rs;why=tp+' htp: hopp till utgång (20+).'}
      else return {exp:null,alt:[],why:'Med 20+ htp och lågfärgsstöd ska man först undersöka 3NT; dokumentet anger inte budet.',means:means,conv:'öppnarens 2:a bud'};
      soft=false;
    }else if(L[o]>=6&&!SU.some(function(s){return s!==o&&L[s]>=4})){
      if(hp<=14){exp=low(o);why='Egen 6+ färg utan sidofärg: lägsta nivå (12-14).'}
      else if(hp<=17){exp=jump(o,r);why='Egen 6+ färg: enkelhopp (15-17).'}
      else if(hp>=18){exp=maj(o)?'4'+o:NC('Dokumentet anger inte budet för denna hand.',means).exp;why='Egen 6+ högfärg, 18+: utgång.'}
      else return NC('Dokumentet anger inte budet för denna hand.',means);
    }else if(r==='1N'&&h.shape==='4441'){
      if(hp>=18&&hp<=19){exp='2N';why='4-4-4-1 med 18-19 hp: bjud 2NT.';}
      else if(hp>=12&&hp<=17){
        var fourCardRebids=SU.filter(function(s){return s!==o&&L[s]===4;}).sort(function(a,b){return rk(low(a))-rk(low(b));});
        if(fourCardRebids.length){exp=low(fourCardRebids[0]);alt=['P'];why='4-4-4-1 med '+hp+' hp efter 1NT: visa den lägsta möjliga andra fyrkortsfärgen på 2-nivån trots bara fyra kort. Pass på 1NT är också tillåtet.';}
        else return NC('4-4-4-1 efter 1NT men ingen annan fyrkortsfärg kan visas enligt budordningen.',means);
      }else return NC('4-4-4-1 efter 1NT: styrkan ligger utanför de angivna 12-19 hp-intervallen.',means);
    }else if(h.bal){
      if(r==='1N'){if(hp<=14){exp='P';why='Balanserad 12-14: pass efter partnerns 1NT.'}else if(hp>=18&&hp<=19){exp='2N';why='Balanserad 18-19: 2NT.'}else return NC('Dokumentet anger inte budet för denna styrka.',means)}
      else if(hp<=14){exp=low('N');why='Balanserad 12-14: NT på lägsta nivå.'}
      else if(hp>=18&&hp<=19){exp=jump('N',r);why='Balanserad 18-19: hopp i NT.'}
      else return NC('Dokumentet anger inte budet för balanserad hand med '+hp+' hp i denna situation.',means);
    }else{
      var s2=side4.filter(function(s){return s!==rs&&L[o]+L[s]>=9}).sort(function(a,b){return L[b]-L[a]})[0];
      if(s2){
        var x=low(s2);
        var reverseCandidate=SU.indexOf(s2)>SU.indexOf(o)&&SU.indexOf(s2)>SU.indexOf(rs)&&lv(r)===1;
        var reverse=reverseCandidate&&L[o]>=5&&L[s2]>=4;
        var hps=handHps(h,null);
        if(reverse){
          reverseBid=(lv(r)+1)+s2;
          if(hps>=18){
            exp=reverseBid;
            why='Reverse (andra färgen högre än öppningsfärgen och svarsfärgen): '+hps+' HPS, 18+ och minst 5-4.';
          }else if(L[o]>=5){
            exp=low(o);
            why='Under 18 HPS för reverse: bjud om första färgen (visar 5+ färg).';
          }else return NC('Dokumentet anger inte budet.',means);
        }else if(reverseCandidate){
          exp=x;
          why='Reverse kräver minst 5 kort i öppningsfärgen och 4 i den nya färgen. Visa den nya färgen på lägsta nivå.';
        }else if(hps>=18){
          exp=jump(s2,r);
          why='Hopp i andra färgen: '+hps+' HPS, 18+ och minst 5-4.';
        }else{
          exp=x;
          why='Andra färgen på lägsta nivå: 12-17 hp med 5-4.';
        }
      }else if(L[o]>=5){exp=low(o);why='Bjuder om första färgen (5+ kort).';soft=true}
      else return NC('Dokumentet anger inte budet för denna hand.',means);
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'öppnarens 2:a bud',soft:soft};
  }

  /* ––––– RKC / BLACKWOOD 5 ESS ––––– */
  function rkcTrumpFromAuction(bids,sideWanted){
    var ours=bids.filter(function(x){return side(x.s)===sideWanted&&isBid(x.c)});
    for(var i=0;i<ours.length;i++){
      if(/^1[CDHS]$/.test(ours[i].c)){
        var opener=ours[i].s, suit=ours[i].c[1];
        for(var j=i+1;j<ours.length;j++){
          if(ours[j].s!==opener&&ours[j].c==='2N')return suit;
        }
      }
    }
    var by={};ours.forEach(function(x){if(x.c[1]!=='N'){by[x.c[1]]=by[x.c[1]]||{};by[x.c[1]][x.s]=1}});
    var fits=SU.filter(function(k){return by[k]&&by[k].N&&by[k].S});
    if(fits.length===1)return fits[0];
    // Nordisk standard s. 5: efter fullföljd överföring är 4NT uttryckligen RKC
    // med överföringsfärgen som trumf. S. 7 anger också indirekt trumf efter
    // 2♥/2♠ som svar på Stayman 2♣. Kontrollera även budgivarnas roller.
    var ntOpeningIndex=ours.findIndex(function(x){return x.c==='1N';});
    if(ntOpeningIndex>=0){
      var ntOpenerSeat=ours[ntOpeningIndex].s;
      for(var oi=ntOpeningIndex+1;oi<ours.length;oi++){
        var call=ours[oi];
        if(call.s===ntOpenerSeat)continue;
        if(call.c==='2D'){
          for(var hj=oi+1;hj<ours.length;hj++)
            if(ours[hj].s===ntOpenerSeat&&ours[hj].c==='2H')return 'H';
        }
        if(call.c==='2H'){
          for(var sj=oi+1;sj<ours.length;sj++)
            if(ours[sj].s===ntOpenerSeat&&ours[sj].c==='2S')return 'S';
        }
        if(call.c==='2C'){
          for(var mj=oi+1;mj<ours.length;mj++)
            if(ours[mj].s===ntOpenerSeat&&(ours[mj].c==='2H'||ours[mj].c==='2S'))
              return ours[mj].c[1];
        }
      }
    }
    return null;
  }
  // Fyr-essfråga utan trumf är bara avtalad i dessa uttryckliga sangsekvenser.
  // Övriga 4NT-bud utan fastställd trumf ska inte automatiskt tolkas som essfråga.
  function agreedNoTrumpAceAsk(bids,sideWanted){
    var ours=bids.filter(function(x){return side(x.s)===sideWanted&&x.c!=='P'&&x.c!=='X'&&x.c!=='XX'}).map(function(x){return x.c});
    var seq=ours.join(',');
    return seq==='1N,4N' ||
           seq==='1N,2C,2D,4N';
  }
  // The user-confirmed 2NT–4NT sequence is quantitative: an invitation to
  // 6NT, not an ace ask. The opener's acceptance threshold is kept separate.
  function agreedQuantitativeNoTrumpInvite(bids,sideWanted){
    var ours=bids.filter(function(x){return side(x.s)===sideWanted&&x.c!=='P'&&x.c!=='X'&&x.c!=='XX'}).map(function(x){return x.c});
    return ours.join(',')==='2N,4N';
  }
  function rkcReply(h,T_){
    var kc=h.aces+(T_&&h.has(T_,13)?1:0);
    var q=!!(T_&&h.has(T_,12));
    var exp,why;
    var means=function(c){
      if(!T_){
        if(c==='5C')return '0 eller 4 ess av 4.';
        if(c==='5D')return '1 ess av 4.';
        if(c==='5H')return '2 ess av 4.';
        if(c==='5S')return '3 ess av 4.';
        return null;
      }
      if(c==='5C')return '1 eller 4 nyckelkort (av 5).';
      if(c==='5D')return '0 eller 3 nyckelkort (av 5).';
      if(c==='5H')return '2 nyckelkort utan trumfdam.';
      if(c==='5S')return '2 nyckelkort med trumfdam.';
      if(c==='5N')return null;
      return null;
    };

    if (T_ && kc === 5) {
        return NC('Alla fem nyckelkort finns. Bibliotekets RKC 1430-tabell anger inte ett särskilt svar för fem av fem; motorn lämnar därför detta fall ej täckt i stället för att felaktigt tolka det som två nyckelkort.',means,'RKC 1430');
    }
    if (T_) {
        // Systemets avtalade RKC 1430: 5C=1/4, 5D=0/3,
        // 5H=2 utan trumfdam, 5S=2 med trumfdam.
        if (kc === 1 || kc === 4) exp = '5C';
        else if (kc === 0 || kc === 3) exp = '5D';
        else exp = q ? '5S' : '5H';
    } else {
        if (h.aces === 0 || h.aces === 4) exp = '5C';
        else if (h.aces === 1) exp = '5D';
        else if (h.aces === 2) exp = '5H';
        else exp = '5S';
    }

    why = T_ ? (kc + ' nyckelkort inklusive trumfkungen. Svar enligt RKC 1430.') : (h.aces + ' av de fyra essen. Svar enligt fyr-essfråga utan trumf.');
    return {exp:exp,alt:[],why:why,means:means,conv:T_?'RKC 1430':'Fyr-essfråga utan trumf'};
  }
  function rkcNextStep(h,T_,r){
    if(T_){
      return NC('Efter svaret på RKC 1430 behöver frågeställaren väga in sina egna nyckelkort och skilja mellan de dubbla svaren 1/4 respektive 0/3. Fortsättningsregeln efter 5♣, 5♦, 5♥ eller 5♠ är ännu inte fastställd; motorn ska därför inte automatiskt bjuda slam.');
    }
    return NC('Nordisk standard s. 7 anger ingen fortsättningsregel efter svaren på fyr-essfrågan utan fastställd trumf. Fortsättningen lämnas därför ej täckt.');
  }

  /* ––––– INKLIV / DUBBLING / STÖDDUBBLING ––––– */
  function overcall(h,ob,last){
    var hp=h.hp,L=h.L,os=ob[1],lvl=lv(ob),exp,why,alt=[];
    var un=SU.filter(function(s){return s!=='N'&&s!==os;});
    var takeout=hp>=12&&un.every(function(s){return L[s]>=3});
    var means=function(c){
      if(c==='X')return 'Upplysningsdubbling: 12+ hp och 3+ kort i alla objudna färger, eller 17+ hp oavsett fördelning.';
      if(c==='1N')return 'Inkliv 1NT: 15-17 hp, balanserad hand och håll i öppningsfärgen.';
      if(c==='2N')return 'Försvar mot spärr: 16-18 hp, balanserad hand.';
      if(c==='P')return 'Pass: handen uppfyller inget inklivsvillkor.';
      if(isBid(c)&&c[1]!=='N'){
        var lo=lowest(c[1],ob);
        if(c===lo){
          if(lv(c)===1)return 'Enkelt inkliv på 1-nivån: 10+ hp, bra 5+ färg.';
          if(lv(c)===2)return 'Enkelt inkliv på 2-nivån: 12-17 hp och 6+ färg.';
        }
        if(c===jump(c[1],ob))return 'Hoppande inkliv: 6-10 hp och 6+ färg.';
      }
      return null;
    };

    // Försvar mot spärröppning (2-nivå eller högre).
    if(lvl>=2){
      if(h.bal&&hp>=16&&hp<=18&&ok('2N',last)){
        exp='2N';why=hp+' hp balanserad: 2NT enligt spärrförsvaret.';
      }else if(takeout||hp>=17){
        exp='X';why=takeout?'12+ hp och 3+ kort i alla objudna färger: upplysningsdubbling mot spärr.':'17+ hp: dubbling mot spärr oavsett fördelning.';
      }else{
        exp='P';why='Ingen dubblingshand eller balanserad 16-18-hand för 2NT: pass.';
      }
      return {exp:exp,alt:alt,why:why,means:means,conv:'dubbling',soft:true};
    }

    // 1NT-inkliv: 15-17 hp, balanserad och håll.
    if(hp>=15&&hp<=17&&h.bal&&h.stop(os)&&ok('1N',ob)){
      exp='1N';why=hp+' hp, balanserad hand med håll i '+SYM[os]+': 1NT.';
      if(takeout)alt.push('X');
      return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
    }

    // Upplysningsdubbling: 12+ hp med 3+ i samtliga objudna färger,
    // eller 17+ hp oavsett fördelning.
    if(takeout){
      exp='X';why='12+ hp och minst 3 kort i alla objudna färger: upplysningsdubbling.';
      return {exp:exp,alt:alt,why:why,means:means,conv:'dubbling',soft:true};
    }
    if(hp>=17){
      exp='X';why='17+ hp: dubbling oavsett fördelning.';
      return {exp:exp,alt:alt,why:why,means:means,conv:'dubbling',soft:true};
    }

    // Enkelt inkliv: 1-nivån 10+ hp och bra 5+ färg;
    // 2-nivån 12-17 hp och minst 6 kort.
    var simple=un.filter(function(s){
      var lo=lowest(s,ob),lev=lv(lo);
      if(lev===1){
        if(maj(s))return hp>=10&&hp<=16&&L[s]>=5&&h.good(s);
        return hp>=12&&hp<=16&&L[s]>=5;
      }
      if(lev===2)return hp>=12&&hp<=16&&L[s]>=6;
      return false;
    }).sort(function(a,b){
      if(L[b]!==L[a])return L[b]-L[a];
      return SU.indexOf(b)-SU.indexOf(a);
    });
    if(simple.length){
      exp=lowest(simple[0],ob);
      why=hp+' hp och '+L[simple[0]]+' kort i '+SYM[simple[0]]+': enkelt inkliv.';
      return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
    }

    // Hoppande inkliv: 6-10 hp och 6+ färg.
    var jumpSuits=un.filter(function(s){return L[s]>=6&&hp>=6&&hp<=10;}).sort(function(a,b){
      if(L[b]!==L[a])return L[b]-L[a];
      return SU.indexOf(b)-SU.indexOf(a);
    });
    for(var ji=0;ji<jumpSuits.length;ji++){
      var js=jumpSuits[ji],jb=jump(js,ob);
      if(jb&&ok(jb,ob)&&(!maj(js)||lv(jb)!==2||h.good(js))){
        exp=jb;why=hp+' hp och '+L[js]+' kort i '+SYM[js]+': hoppande inkliv.';
        return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
      }
    }

    exp='P';why='Ingen inklivshand enligt systemets styrke- och färglängdskrav: pass.';
    return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
  }
  function respOvercall(h,oc,last,ob,sourcePageRules){
    var s=st_(oc),os=ob?ob[1]:null,L=h.L,hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(c==='1N')return (sourcePageRules?'6-10':'8-10')+' hp, balanserad hand med håll i motståndarnas inklivsfärg.';
      if(c==='2N')return '11-13 hp, balanserad hand med bra håll.';
      if(c==='3N')return '14+ hp, balanserad hand med bra håll.';
      if(isBid(c)&&c[1]===s){
        var d=lv(c)-lv(oc);
        if(d===1)return '6-9 hp och 3-korts stöd: enkel höjning.';
        if(d===2)return '6-9 hp och 4-korts stöd: dubbel höjning.';
        if(d===3)return '6-9 hp och 5-korts stöd: trippel höjning.';
      }
      if(isBid(c)&&c[1]===os)return '10+ hp och 3+ stöd: överbud i motståndarnas färg.';
      if(isBid(c)&&c[1]!=='N'){
        var base=lowest(c[1],last),need=base&&lv(base)>=2?10:8;
        if(c===base)return need+'+ hp och '+(sourcePageRules&&(c[1]==='C'||c[1]==='D')?'4+':'5+')+' färg: rondkrav.';
        if(c===jump(c[1],last))return '14+ hp, bra 6+ färg: utgångskrav.';
      }
      if(c==='P')return 'Pass när inget av systemets svarsbud uppfylls.';
      return null;
    };

    // BridgePlus s. 90 applies when our side opened and opponents interfered.
    // Where both a five-card new major and 1NT are plausible, the source gives no priority.
    var unbidFiveMajor=((s!=='S'&&os!=='S'&&L.S>=5)||(s!=='H'&&os!=='H'&&L.H>=5));
    var canShow1NT=h.bal&&hp>=6&&hp<=10&&h.stop(os)&&ok('1N',last);
    if(sourcePageRules&&unbidFiveMajor&&canShow1NT)
      return NC('Både 1NT med håll och ny femkortshögfärg är möjliga; BridgePlus s. 90 anger ingen prioritet mellan dem.');
    if(sourcePageRules&&unbidFiveMajor&&L[s]>=3&&hp>=6&&hp<=9)
      return NC('Både höjning med stöd och ny femkortshögfärg är möjliga; källan anger ingen prioritet.');
    var unbidFourMinor=((s!=='C'&&os!=='C'&&L.C>=4)||(s!=='D'&&os!=='D'&&L.D>=4));
    if(sourcePageRules&&unbidFourMinor&&L[s]>=3&&!canShow1NT)
      return NC('Både stöd i partnerns öppningsfärg och en fyrkortslågfärg är möjliga; källan anger ingen prioritet.');
    if(sourcePageRules&&!exp&&!unbidFiveMajor&&canShow1NT){
      exp='1N';why='6-10 hp, balanserad hand med håll i motståndarnas inklivsfärg: 1NT.';
    }
    // Stöd visas först i övriga konkurrenslägen; 6-9 hp med 3/4/5-korts stöd.
    if(!exp&&L[s]>=3&&hp>=6&&hp<=9){
      var steps=L[s]>=5?3:L[s]>=4?2:1;
      var raise=(lv(oc)+steps)+s;
      if(ok(raise,last)){
        exp=raise;
        why=hp+' hp och '+L[s]+'-korts stöd: '+(steps===1?'enkel':steps===2?'dubbel':'trippel')+' höjning.';
      }
    }

    // 10+ hp och 3+ stöd: överbud i öppningsfärgen.
    if(!exp&&L[s]>=3&&hp>=10&&os){
      var cue=lowest(os,last);
      if(ok(cue,last)){exp=cue;why='10+ hp och '+L[s]+'-korts stöd: överbud i motståndarnas färg.';}
    }

    if(!sourcePageRules&&!exp&&h.bal&&hp>=8&&hp<=10&&h.stop(os)&&ok('1N',last)){
      exp='1N';why='8-10 hp, balanserad hand med håll i öppningsfärgen: 1NT.';
    }
    if(!exp&&h.bal&&hp>=11&&hp<=13&&h.stop(os)&&ok('2N',last)){
      exp='2N';why='11-13 hp, balanserad hand med bra håll: 2NT.';
    }
    if(!exp&&h.bal&&hp>=14&&h.stop(os)&&ok('3N',last)){
      exp='3N';why='14+ hp, balanserad hand med bra håll: 3NT.';
    }

    // BridgePlus-svaret efter vår öppning tillåter 4-korts lågfärg; övriga lägen behåller 5+.
    // Hopp i ny färg kräver 14+ hp och en bra 6+-färg.
    if(!exp){
      var suits=['S','H','D','C'].filter(function(x){return x!==s&&x!==os&&L[x]>=(sourcePageRules&&(x==='C'||x==='D')?4:5);});
      suits.sort(function(a,b){
        if(L[b]!==L[a])return L[b]-L[a];
        return ['S','H','C','D'].indexOf(a)-['S','H','C','D'].indexOf(b);
      });
      for(var si=0;si<suits.length&&!exp;si++){
        var ns=suits[si],base=lowest(ns,last);
        if(hp>=14&&L[ns]>=6&&h.good(ns)){
          var jumpBid=jump(ns,last);
          if(jumpBid&&ok(jumpBid,last)){
            exp=jumpBid;why='14+ hp och bra 6+-färg i '+SYM[ns]+': hoppande färgbud, utgångskrav.';
          }
        }
        if(!exp&&base&&hp>=(lv(base)>=2?10:8)){
          exp=base;why=hp+' hp och '+L[ns]+' kort i '+SYM[ns]+': ny färg på lägsta nivå, rondkrav.';
        }
      }
    }

    // Pass är rätt när handen inte når något av de uttryckliga svarsbuden.
    if(!exp){exp='P';why='Ingen höjning, sang, överbud eller ny färg uppfyller systemkraven: pass.';}
    return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
  }
  function respDouble(h,ob,last){
    var os=ob[1],L=h.L,hp=h.hp,exp,why,alt=[],un=SU.filter(function(s){return s!==os;});
    function rankedSuits(list){
      return list.sort(function(a,b){
        if(L[b]!==L[a])return L[b]-L[a];
        if(h.htp(b)!==h.htp(a))return h.htp(b)-h.htp(a);
        return SU.indexOf(b)-SU.indexOf(a);
      });
    }
    var cheapest=un.map(function(s){return {s:s,bid:lowest(s,ob)};})
      .filter(function(x){return x.bid&&L[x.s]>=3;})
      .sort(function(a,b){return rk(a.bid)-rk(b.bid);})[0];
    var jump8=rankedSuits(un.filter(function(s){var p=h.htp(s);return L[s]>=4&&p>=8&&p<=9;}))[0];
    var jump10=rankedSuits(un.filter(function(s){var p=h.htp(s);return L[s]>=5&&p>=10&&p<=12;}))[0];
    var means=function(c){
      if(c==='1N')return '6-9 hp och håll i öppningsfärgen.';
      if(c==='2N')return '10-12 hp och håll i öppningsfärgen.';
      if(c==='3N')return '13+ hp och håll i öppningsfärgen.';
      if(c==='P')return 'Pass endast med många kort i öppningsfärgen.';
      if(isBid(c)&&c[1]===os)return '10+ hp: överbud i motståndarnas färg, krav.';
      if(isBid(c)&&c[1]!=='N'){
        var low=lowest(c[1],ob),jumpBid=jump(c[1],ob);
        if(c===low)return '0-7 hp: färg på lägsta nivå (kan vara 3 kort).';
        if(c===jumpBid&&h.htp(c[1])>=8&&h.htp(c[1])<=9&&L[c[1]]>=4)
          return '8-9 htp och 4+ färg: hopp i färgen.';
        if(c==='3'+c[1]&&h.htp(c[1])>=10&&h.htp(c[1])<=12&&L[c[1]]>=5)
          return '10-12 htp och helst 5+ färg: hopp till 3-nivån.';
      }
      return null;
    };

    // Pass är endast aktuellt när svarshanden har en lång och bra färg
    // i motståndarnas öppningsfärg (möjlighet att straffpassa UD).
    if(L[os]>=5&&h.good(os)){
      exp='P';why='Minst 5 kort och bra kvalitet i öppningsfärgen: straffpass.';
    }
    // Naturliga sangsvar med håll; REF anger ingen separat balansgräns.
    else if(h.stop(os)&&hp>=6&&hp<=9){
      exp='1N';why=hp+' hp, balanserad hand med håll: 1NT.';
    }
    else if(h.stop(os)&&hp>=10&&hp<=12){
      exp='2N';why=hp+' hp, balanserad hand med håll: 2NT.';
    }
    else if(h.stop(os)&&hp>=13){
      exp='3N';why=hp+' hp, balanserad hand med håll: 3NT.';
    }
    // 0-7 hp: billigaste färg, även med bara tre kort.
    else if(hp<=7&&cheapest){
      exp=cheapest.bid;why=hp+' hp: billigaste objudna färg ('+SYM[cheapest.s]+'), även med 3 kort.';
    }
    // 8-9 HTP: välj den bästa av alla objudna 4+-färger som uppfyller gränsen.
    else if(jump8){
      var j=jump(jump8,ob);
      if(j&&ok(j,ob)){exp=j;why=h.htp(jump8)+' htp och '+L[jump8]+' kort i '+SYM[jump8]+': hopp i färgen.';}
    }
    // 10-12 HTP: välj en 5+-färg som faktiskt uppfyller HTP-gränsen.
    if(!exp&&jump10&&ok('3'+jump10,ob)){
      exp='3'+jump10;why=h.htp(jump10)+' htp och '+L[jump10]+' kort i '+SYM[jump10]+': hopp till 3-nivån.';
    }
    // 10+ hp: överbud är krav när inget lämpligare svar har visats.
    if(!exp&&hp>=10){
      var cue=lowest(os,ob);
      if(cue&&ok(cue,ob)){exp=cue;why=hp+' hp: överbud i motståndarnas färg, krav.';}
    }
    if(!exp)return NC('Svar efter upplysningsdubbling: handen uppfyller inget uttryckligt svarsvillkor i systemunderlaget.',means,'dubbling');
    return {exp:exp,alt:alt,why:why||'',means:means,conv:'dubbling',soft:true};
  }

  /* ––––– SVARSHANDENS ANDRA BUD EFTER 1NT-SVAR ––––– */
  function respAfter1NT(h,opening,rebid,act){
    var hp=h.hp,L=h.L, suit=isBid(act)?st_(act):null;
    var isOpeningSuit=suit&&suit===st_(opening);
    var lowestNewSuit=suit&&lowest(suit,rebid)===act;
    var means=function(c){
      if(isBid(c)&&c[0]==='3'&&st_(c)!=='N'&&L[st_(c)]>=6&&hp>=6&&hp<=9){
        if(st_(c)!==st_(opening)&&lowest(st_(c),rebid)===c)
          return 'Svarshandens andra färgbud på lägsta nivå efter 1NT: 6-9 hp och minst 6-korts färg. Undantag från krav.';
        if(st_(c)===st_(opening)&&c==='3'+st_(opening))
          return 'Svarshandens andra bud i öppningsfärgen: 6-9 hp och minst 6-korts färg.';
      }
      return null;
    };
    var allowed=hp>=6&&hp<=9&&suit&&L[suit]>=6&&lv(act)===3&&((isOpeningSuit&&act==='3'+suit)||(!isOpeningSuit&&lowestNewSuit));
    if(allowed){
      return {exp:act,alt:[],why:hp+' hp och 6+ '+SYM[suit]+': bjud färgen på lägsta nivå i andra budronden. Budet är inte krav.',means:means,conv:'svar efter 1NT',soft:false};
    }
    if(hp<=9){
      return {exp:'P',alt:[],why:hp+' hp och ingen egen 6-kortsfärg att återbjuda: pass efter öppnarens återbud.',means:function(c){return c==='P'?'Pass med svag hand efter 1NT-svar.':null},conv:'svar efter 1NT'};
    }
    return NC('Efter 1NT-svaret är endast de beskrivna andra färgbuden med 6-9 hp och 6+ kort täckta av dokumentet.',means,'svar efter 1NT');
  }

  /* ––––– SVARSHANDENS ANDRA BUD EFTER ÖPPNARENS ÅTERBUD ––––– */
  function responderSecondBid(h,opening,response,rebid,openerHand){
    var first=st_(opening),resp=isBid(response)?st_(response):null;
    var rb=isBid(rebid)?st_(rebid):null,oh=H(openerHand),hp=h.hp,L=h.L;
    var totalHcp=hp+oh.hp,fitSuit=null,fit=0,total=0,threshold=0,game=null,invite=null;
    var means=function(c){
      if(c==='P')return 'Svagt svar: avstår från vidare budgivning.';
      if(c==='2N'||c==='3N')return 'Balanserad hand utan tillräckligt trumfstöd: invit eller utgång i sang.';
      if(isBid(c)&&c[1]!=='N')return 'Visar stöd, preferens eller fortsatt färgbeskrivning enligt öppnarens återbud.';
      return null;
    };

    // A. Öppnaren har höjt svarshandens färg.
    if(resp&&rb===resp){
      fitSuit=resp;fit=L[fitSuit]+oh.L[fitSuit];
      if(fit>=8){
        threshold=maj(fitSuit)?26:28;
        total=partnershipPoints(h,oh,fitSuit);
        game=maj(fitSuit)?'4'+fitSuit:'5'+fitSuit;
        invite='3'+fitSuit;
        if(total>=threshold)return {exp:game,alt:[],why:fit+'-korts fit i '+SYM[fitSuit]+' och '+total+' gemensamma spelpoäng: utgång enligt våra gränser ('+threshold+'+).',means:means,conv:'svar efter öppnarens återbud'};
        if(total>=threshold-4)return {exp:invite,alt:[],why:fit+'-korts fit och '+total+' gemensamma spelpoäng: invitnivå, men ännu inte utgång enligt våra gränser.',means:means,conv:'svar efter öppnarens återbud'};
        return {exp:'P',alt:[],why:fit+'-korts fit men '+total+' gemensamma spelpoäng: under invitnivån.',means:means,conv:'svar efter öppnarens återbud'};
      }
    }

    // B. Öppnaren har visat en balanserad hand.
    if(rb==='N'){
      var major=['S','H'].filter(function(s){return L[s]+oh.L[s]>=8;}).sort(function(a,b){return (L[b]+oh.L[b])-(L[a]+oh.L[a]);})[0];
      if(major){
        total=partnershipPoints(h,oh,major);
        if(total>=26)return {exp:'4'+major,alt:[],why:'Högfärgsfit ('+(L[major]+oh.L[major])+' kort) och '+total+' gemensamma spelpoäng: utgång.',means:means,conv:'svar efter öppnarens återbud'};
        if(total>=22)return {exp:'3'+major,alt:[],why:'Högfärgsfit och '+total+' gemensamma spelpoäng: invit.',means:means,conv:'svar efter öppnarens återbud'};
      }
      if(totalHcp>=25)return {exp:'3N',alt:[],why:totalHcp+' gemensamma honnörspoäng: utgång i sang enligt 25-poängsgränsen.',means:means,conv:'svar efter öppnarens återbud'};
      if(totalHcp>=22)return {exp:'2N',alt:[],why:totalHcp+' gemensamma honnörspoäng: invit i sang.',means:means,conv:'svar efter öppnarens återbud'};
      return {exp:'P',alt:[],why:totalHcp+' gemensamma honnörspoäng: under invitnivån efter balanserat återbud.',means:means,conv:'svar efter öppnarens återbud'};
    }

    // C. Öppnaren har visat minst sex kort i sin egen färg.
    if(rb===first&&oh.L[first]>=5){
      fit= L[first]+oh.L[first];
      if(fit>=8){
        total=partnershipPoints(h,oh,first);threshold=maj(first)?26:28;
        if(total>=threshold)return {exp:maj(first)?'4'+first:'5'+first,alt:[],why:fit+'-korts fit i '+SYM[first]+' och '+total+' gemensamma spelpoäng: utgång.',means:means,conv:'svar efter öppnarens återbud'};
        if(total>=threshold-4)return {exp:'3'+first,alt:[],why:fit+'-korts fit och '+total+' gemensamma spelpoäng: invit.',means:means,conv:'svar efter öppnarens återbud'};
        return {exp:'P',alt:[],why:fit+'-korts fit men '+total+' gemensamma spelpoäng: pass.',means:means,conv:'svar efter öppnarens återbud'};
      }
      if(totalHcp>=25)return {exp:'3N',alt:[],why:'Ingen tillräcklig fit. '+totalHcp+' gemensamma honnörspoäng: 3NT enligt 25-poängsgränsen.',means:means,conv:'svar efter öppnarens återbud'};
      if(totalHcp>=22)return {exp:'2N',alt:[],why:'Ingen tillräcklig fit. '+totalHcp+' gemensamma honnörspoäng: invit 2NT.',means:means,conv:'svar efter öppnarens återbud'};
      return {exp:'P',alt:[],why:'Ingen tillräcklig fit och under invitstyrka: pass.',means:means,conv:'svar efter öppnarens återbud'};
    }

    // D. Öppnaren har visat två färger; styrkan är ännu inte begränsad.
    if(rb&&rb!==first&&rb!=='N'&&oh.L[first]>=4&&oh.L[rb]>=4){
      var pref=[first,rb].filter(function(s){return L[s]>=2;}).sort(function(a,b){return (L[b]+oh.L[b])-(L[a]+oh.L[a]);})[0];
      if(hp<=9&&pref)return {exp:lowest(pref,rebid),alt:[],why:hp+' hp: svag hand, preferens till bästa gemensamma färg.',means:means,conv:'svar efter öppnarens återbud'};
      if(hp>=13){
        var fourth=SU.filter(function(s){return s!==first&&s!==rb&&s!==resp;})[0];
        if(fourth)return {exp:lowest(fourth,rebid),alt:[],why:hp+' hp: fjärde färg som utgångskrav; öppnaren har visat två färger men inte begränsat styrkan.',means:means,conv:'Fjärde färg'};
        if(pref)return {exp:lowest(pref,rebid),alt:[],why:hp+' hp: stark hand, fortsätt via preferens till bästa färg.',means:means,conv:'svar efter öppnarens återbud'};
        return {exp:'3N',alt:[],why:hp+' hp: stark balanserad hand, utgångskrav i sang.',means:means,conv:'svar efter öppnarens återbud'};
      }
      if(hp>=10&&hp<=12){
        if(h.bal)return {exp:'2N',alt:[],why:hp+' hp: invit med balanserad hand efter öppnarens tvåfärgshand.',means:means,conv:'svar efter öppnarens återbud'};
        if(pref)return {exp:lowest(pref,rebid),alt:[],why:hp+' hp: invitnivå, preferens till bästa gemensamma färg.',means:means,conv:'svar efter öppnarens återbud'};
      }
    }
    return NC('Denna handtyp eller fortsättning kan inte avgöras säkert med de uppgifter som visas.',means,'svar efter öppnarens återbud');
  }

  /* ––––– DISPATCH ––––– */
  function lastBidCode(prior){var l=null;prior.forEach(function(x){if(isBid(x.c))l=x.c});return l}
  function nodeForRaw(st,i){
    var b=st.bids[i],me=b.s,pt=partner(me),prior=st.bids.slice(0,i),h=H(st.hands[me]);
    var last=lastBidCode(prior);
    var ours=prior.filter(function(x){return side(x.s)===side(me)&&x.c!=='P'});
    var lastCall=null,firstCall=null;
    for(var li=prior.length-1;li>=0;li--)if(isBid(prior[li].c)){lastCall=prior[li];break;}
    for(var fi=0;fi<prior.length;fi++)if(isBid(prior[fi].c)){firstCall=prior[fi];break;}

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
      var partnerRkcReply=/^5[CDHS]$/.test(lastCall.c)&&prior.some(function(x){return x.s===me&&x.c==='4N'})&&!!rkcTrumpFromAuction(prior,side(me));
      if(partnerHasGame&&!partnerHasRkcAsk&&!partnerHasFourAceAsk&&!partnerHasQuantitativeInvite&&!partnerRkcReply)return {exp:'P',alt:[],why:'Partnern har redan bjudit utgång. Pass avslutar budgivningen om inte styrkan motiverar slam.',means:function(c){return c==='P'?'Pass efter partnerns utgångsbud.':null},conv:'slutbud'};
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
    var opp=prior.filter(function(x){return side(x.s)!==side(me)&&x.c!=='P'});
    var iFirst=ours.length?prior.indexOf(ours[0]):-1;
    var oppBefore=opp.filter(function(x){return iFirst<0||prior.indexOf(x)<iFirst});
    var oppAfter=opp.filter(function(x){return iFirst>=0&&prior.indexOf(x)>iFirst});
    var nc=function(w){return NC(w)};
    if(!ours.length){
      if(!opp.length){var fourthHandAfterThreePasses=prior.length===3&&prior.every(function(x){return x.c==='P'});return openingNode(h,fourthHandAfterThreePasses);}
      if(opp.length===1&&isBid(opp[0].c)){var ob=opp[0].c;if(ob==='1N'||ob==='2C')return nc('Försvar mot '+txt(ob)+'-öppning beskrivs inte i dokumentet.');return overcall(h,ob,last)}
      return nc('Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet.');
    }
    // Om den som nu ska bjuda senast var den som bjöd för paret har
    // partnern passat. Det är en giltig auktion, men konkurrensåterbudet
    // efter partnerns pass måste bedömas som ej täckt – inte som fel turordning.
    var weakMinorRelayFinalPass = b.c==='P'&&ours.length===3&&ours[0].c==='1N'&&ours[1].c==='2S'&&ours[2].c==='3C'&&ours[0].s===me&&ours[2].s===me;
    if(ours.length&&ours[ours.length-1].s===me&&!weakMinorRelayFinalPass)
      return nc('Partnern har passat efter vår senaste budgivning; konkurrensfortsättningen i den här sekvensen är inte beskriven i systemunderlaget.');
    var d=ours.length,opener=ours[0].s===me,f=ours[0].c;
    if(weakMinorRelayFinalPass&&opener&&d===3)
      return {exp:'P',alt:[],why:'Svarshanden passar på öppnarens 3♣-reläsvar. Pass avslutar budgivningen i 3♣.',means:function(c){return c==='P'?'Pass efter svarshandens signoff.':null},conv:'1NT-svar'};
    var c1=f,fs=c1[1]; // Deklareras nu här för att undvika bugg

    // Slut på en naturlig preferens till öppningsfärgen.
    if(b.c==='P'&&opener&&d>=4&&/^2[CDHS]$/.test(ours[3].c)&&
       st_(ours[3].c)===st_(ours[0].c)&&lv(ours[3].c)===2){
      return {exp:'P',alt:[],why:'Svarshanden har valt preferens till öppningsfärgen på 2-nivån. Pass är slutbud om inte den separata utgångs-/slamkontrollen visar tillräcklig styrka.',means:function(c){return c==='P'?'Pass efter preferens till öppningsfärgen.':null},conv:'preferens'};
    }

    // Svarshandens invit efter öppnarens 1NT-återbud.
    if(b.c==='P'&&opener&&d===4&&ours[2].c==='1N'&&ours[3].c==='2N'){
      var inviteTotal=h.hp+H(st.hands[pt]).hp;
      if(h.hp<14)return {exp:'P',alt:[],why:'Öppnaren har minimum i 1NT-återbudet. Pass på svarshandens 2NT-invit.',means:function(c){return c==='P'?'Pass med minimum efter 2NT-invit.':null},conv:'invit i sang'};
      return {exp:'3N',alt:[],why:'Öppnaren har maximum i 1NT-återbudet och accepterar 2NT-inviten med 3NT.',means:function(c){return c==='3N'?'Utgång i sang efter accepterad invit.':null},conv:'invit i sang'};
    }
    if(b.c==='P'&&opener&&d===4&&ours[2].c==='1N'&&/^3[HS]$/.test(ours[3].c)){
      var invitedSuit=st_(ours[3].c),invitedPartner=H(st.hands[pt]);
      var invitedFit=h.L[invitedSuit]+invitedPartner.L[invitedSuit];
      var invitedPoints=partnershipPoints(h,invitedPartner,invitedSuit);
      if(invitedFit>=8&&invitedPoints<26)return {exp:'P',alt:[],why:'Svarshanden har inviterat med 3 i högfärg, men paret når inte 26 gemensamma spelpoäng. Pass.',means:function(c){return c==='P'?'Pass på invit när 26-poängsgränsen inte nås.':null},conv:'invit i högfärg'};
      if(invitedFit>=8&&invitedPoints>=26)return {exp:'4'+invitedSuit,alt:[],why:invitedFit+'-korts fit och '+invitedPoints+' gemensamma spelpoäng: acceptera inviten till utgång.',means:function(c){return c==='4'+invitedSuit?'Accepterar invit till utgång.':null},conv:'invit i högfärg'};
    }

    // Öppnarens pass efter partnerns invitativa höjning i egen lågfärg.
    if(b.c==='P'&&opener&&d>=4&&/^3[CD]$/.test(ours[3].c)&&
       st_(ours[3].c)===st_(ours[2].c)){
      return {exp:'P',alt:[],why:'Partnerns 3-nivåhöjning i lågfärg är invitativ. Pass med minimum; utgångskontrollen fångar 28+ spelpoäng.',means:function(c){return c==='P'?'Pass med minimum efter lågfärgsinvit.':null},conv:'trumfstöd'};
    }

    var trumpForSide=rkcTrumpFromAuction(prior,side(me));
    if(b.c==='4N'){
      if(trumpForSide){
        return {exp:'4N',alt:[],why:'Essfråga (Blackwood 5 ess) med '+SYM[trumpForSide]+' som fastställd trumf.',means:function(c){return c==='4N'?'Essfråga (Blackwood 5 ess).':null},conv:'Blackwood 5 ess'};
      }
      if(agreedNoTrumpAceAsk(prior.concat([{s:me,c:'4N'}]),side(me))){
        return {exp:'4N',alt:[],why:'Avtalad fyr-essfråga utan fastställd trumf. 5♣–5NT visar 0–4 ess.',means:function(c){return c==='4N'?'Fyr-essfråga i sang enligt överenskommen sekvens.':null},conv:'Fyr-essfråga utan trumf'};
      }
      if(agreedQuantitativeNoTrumpInvite(prior.concat([{s:me,c:'4N'}]),side(me))){
        return {exp:'4N',alt:[],why:'Kvantitativ invit till 6NT efter 2NT-öppning. Detta är inte en essfråga.',means:function(c){return c==='4N'?'Kvantitativ invit till 6NT; inte essfråga.':null},conv:'Kvantitativ sanginvit'};
      }
      return NC('4NT utan fastställd trumf är inte automatiskt essfråga. I andra sangsekvenser behandlas 4NT som kvantitativt eller enligt parets särskilda överenskommelse.');
    }

    var partnerAskIndex=-1;
    for(var pai=prior.length-1;pai>=0;pai--)if(prior[pai].s===pt&&prior[pai].c==='4N'){partnerAskIndex=pai;break;}
    if(partnerAskIndex>=0){
      var afterPartnerAsk=prior.slice(partnerAskIndex+1).filter(function(x){return x.s===me&&isBid(x.c)});
      if(!afterPartnerAsk.length){
        var partnerAskTrump=rkcTrumpFromAuction(prior,side(me));
        var partnerAskFour=agreedNoTrumpAceAsk(prior,side(me));
        if(partnerAskTrump||partnerAskFour)
          return rkcReply(h,partnerAskTrump);
        if(agreedQuantitativeNoTrumpInvite(prior,side(me)))
          return NC('Partnerns 4NT är en kvantitativ invit till 6NT efter 2NT-öppning, inte en essfråga. Öppnarens accept/pass-gräns är inte fastställd här; använd inte ess-/nyckelkortssvar.',null,'Kvantitativ sanginvit',true);
        return NC('Partnerns 4NT har ingen fastställd trumf och sekvensen är inte en uttryckligen avtalad fyr-essfråga enligt Nordisk standard. Svaret lämnas ej täckt.');
      }
      // Svarshanden har redan svarat; efter frågeställarens sangslutbud ska den passa.
      if(b.c==='P')return {exp:'P',alt:[],why:'Pass efter att frågeställaren har fastställt sangslutbudet.',means:function(c){return c==='P'?'Pass.':null},conv:'Fyr-essfråga utan trumf'};
    }
    var myAskIndex=-1;
    for(var mai=prior.length-1;mai>=0;mai--)if(prior[mai].s===me&&prior[mai].c==='4N'){myAskIndex=mai;break;}
    if(myAskIndex>=0){
      var afterMyAsk=prior.slice(myAskIndex+1).filter(function(x){return x.s===pt&&isBid(x.c)});
      if(afterMyAsk.length){
        var response=afterMyAsk[0].c;
        var myAskTrump=rkcTrumpFromAuction(prior,side(me));
        var myAskIsAgreed=myAskTrump||agreedNoTrumpAceAsk(prior,side(me));
        if(!myAskIsAgreed)return NC('4NT-sekvensen är inte en verifierad essfråga enligt Nordisk standard; fortsättningen lämnas ej täckt.');
        if(isBid(b.c) && /^([56][CDHSN])$/.test(b.c))return rkcNextStep(h,myAskTrump,response);
        if(b.c==='P' && (last==='6N'||last==='7N'))return {exp:'P',alt:[],why:'Pass efter fastställt slutbud.',means:function(c){return c==='P'?'Pass.':null},conv:'Fyr-essfråga utan trumf'};
      }
    }

    if(oppBefore.length){
      if(d===1&&!oppAfter.length&&oppBefore.length===1){
        if(f==='X')return respDouble(h,oppBefore[0].c,last);
        if(f==='1N')return ntResp(h,0);
        if(isBid(f))return respOvercall(h,f,last,oppBefore[0].c);
      }
      // Dubblerarens återbud efter partnerns svar på upplysningsdubbling.
      if(d===2&&ours.length===2&&ours[0].c==='X'&&ours[0].s===me&&ours[1].s===pt&&!oppAfter.length){
        var partnerResponse=ours[1].c;
        var responseSuit=isBid(partnerResponse)?st_(partnerResponse):null;
        var hasSupport=responseSuit&&responseSuit!=='N'&&h.L[responseSuit]>=3;
        if(hasSupport){
          return nc('Dubbleraren har 3+ stöd i partnerns svarsfärg. REF anger inte dubblerarens fortsättning med stöd.');
        }
        if(b.c==='P'){
          if(h.hp<18)return {exp:'P',alt:[],why:h.hp+' hp utan stöd för partnerns svar: pass. Egen färg/NT efter dubbling kräver 18+ hp.',means:function(c){return c==='P'?'Pass under 18 hp utan stöd efter upplysningsdubbling.':null},conv:'dubbling'};
          return nc('18+ hp utan stöd: REF tillåter egen färg/NT, men anger inte vilket återbud som ska väljas. Pass kan därför inte bedömas automatiskt.');
        }
        if(isBid(b.c)&&(b.c[1]==='N'||(b.c[1]!==responseSuit&&b.c[1]!==oppBefore[0].c[1]))){
          if(h.hp>=18)return {exp:b.c,alt:[],why:h.hp+' hp utan stöd för partnerns svar: egen färg/NT efter upplysningsdubbling är tillåtet från 18 hp.',means:function(c){return c===b.c?'Egen färg/NT efter upplysningsdubbling utan stöd: 18+ hp.':null},conv:'dubbling'};
          return {exp:'P',alt:[],why:h.hp+' hp utan stöd: egen färg/NT efter dubbling kräver 18+ hp; pass i stället.',means:function(c){return c==='P'?'Pass under 18 hp utan stöd.':null},conv:'dubbling'};
        }
        return nc('Dubblerarens återbud är varken pass eller en egen färg/NT enligt den uttryckliga 18 hp-regeln.');
      }
      return nc('Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet.');
    }

    // Motståndarinblandning efter 1NT-öppning
    if(oppAfter.length){
      if(c1==='1N'&&d===1&&oppAfter.length===1&&!opener){
        var interferenceSuit=oppAfter[0].c[1];
        if(b.c==='X'){
          var unbidAfterNT=SU.filter(function(s){return s!==interferenceSuit;});
          if(!unbidAfterNT.every(function(s){return h.L[s]>=3;}))
            return NC('Upplysningsdubbling efter 1NT kräver minst invitstyrka och 3+ kort i alla objudna färger; handen saknar minst ett uttryckligt fördelningsvillkor.');
          return NC('Handen har 3+ kort i objudna färger, men den exakta styrkegränsen för minst invit efter 1NT är inte numeriskt definierad i REF. Ingen automatisk dubblingsrekommendation ges.');
        }
        if(isBid(b.c)&&st_(b.c)!=='N'&&(lv(b.c)===2||lv(b.c)===3)){
          if(h.L[st_(b.c)]<5)
            return NC('Naturligt färgbud efter motståndarinkliv över 1NT kräver minst 5 kort i färgen.');
          return NC((lv(b.c)===2?'Invitstyrkan':'Utgångskravet')+' för naturligt färgbud efter motståndarinkliv över 1NT saknar numerisk handgräns i REF. Färglängden räcker inte ensam för automatisk rättning.');
        }
      }

      if(d===1&&oppAfter.length===1&&!opener&&/^1[CD]$/.test(f)&&
         (oppAfter[0].c==='1H'||oppAfter[0].c==='1S')){
        var negativeOvercall=oppAfter[0].c;
        var partnerOpeningSuit=f[1];
        // The photographed rule gives exact four spades over 1H and at least
        // four hearts over 1S. A five-card heart suit over 1S overlaps with
        // a natural two-level response, so that case remains uncovered.
        if(b.c==='X'){
          if(h.hp<6)return {exp:'P',alt:[],why:'0–5 hp/stp: pass enligt grundregeln.',means:function(c){return c==='P'?'Pass med 0–5 hp/stp.':null},conv:'negativ dubbling'};
          if(h.L[partnerOpeningSuit]>=3)
            return NC('Stöd i partnerns öppningsfärg överlappar med den negativa dubblingen; prioriteten är inte angiven i källan.');
          if(negativeOvercall==='1H'&&h.L.S===4)
            return {exp:'X',alt:[],why:'Negativ dubbling av 1♥ visar exakt fyra spader enligt BridgePlus s. 91.',means:function(c){return c==='X'?'Exakt fyra spader.':null},conv:'negativ dubbling'};
          if(negativeOvercall==='1S'&&h.L.H===4)
            return {exp:'X',alt:[],why:'Negativ dubbling av 1♠ visar minst fyra hjärter enligt BridgePlus s. 91; här är handen fyrkorts.',means:function(c){return c==='X'?'Minst fyra hjärter.':null},conv:'negativ dubbling'};
          return NC('Den negativa dubblingen uppfyller inte den uttryckliga färglängdsvisningen på BridgePlus s. 91.');
        }
        if(h.hp>=6&&h.L[partnerOpeningSuit]<3&&
           ((negativeOvercall==='1H'&&h.L.S===4)||(negativeOvercall==='1S'&&h.L.H===4))){
          return {exp:'X',alt:[],why:negativeOvercall==='1H'?'Negativ dubbling: exakt fyra spader efter 1♥-inkliv.':'Negativ dubbling: fyra hjärter efter 1♠-inkliv.',means:function(c){return c==='X'?(negativeOvercall==='1H'?'Exakt fyra spader.':'Minst fyra hjärter.'):null},conv:'negativ dubbling'};
        }
        if(negativeOvercall==='1S'&&h.L.H>=5)
          return NC('Fem eller fler hjärter efter 1♠-inkliv överlappar negativ dubbling med naturligt 2♥; källan anger ingen prioritet.');
        return respOvercall(h,f,last,negativeOvercall,true);
      }
      if(d===1&&oppAfter.length===1&&!opener&&b.c==='X'){
        return NC('Negativ dubbling efter 1 i färg finns inte definierad i den fastställda REF-systemtexten. Den får därför inte räknas som ett automatiskt grundsystembud.');
      }
      if(d===1&&oppAfter.length===1&&opener&&b.c==='X'){
        return NC('Öppnarens dubbling efter motståndarinkliv och partnerns pass (reopenings-/stöddubbling) är inte definierad i REF-systemtexten.');
      }
      return nc('Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet.');
    }

    // Svarshandens andra bud efter 1NT-svar måste hanteras före de generella
    // reglerna för tredje/fjärde färg, annars fångas sekvensen för tidigt.
    if(!opener&&d===3&&ours[1].c==='1N'){
      var openerHandAfter1NT=H(st.hands[pt]);
      if(openerHandAfter1NT.shape==='4441')
        return responderSecondBid(h,ours[0].c,ours[1].c,ours[2].c,st.hands[pt]);
      return respAfter1NT(h,ours[0].c,ours[2].c,b.c);
    }

    if(d>=3 && /^1[CDHS]$/.test(ours[0].c)){
      var s1=ours[0].c[1], s2=ours[1].c[1];

      if(d===3 && !opener && ours[2].c === '2'+s1 && isBid(b.c) && b.c[1]!==s1 && b.c[1]!==s2 && b.c[1]!=='N'){
        if(h.hp>=13) return {exp:b.c,alt:[],why:'Fjärde färg (konstgjort): 13+ hp, utgångskrav. Berättar inget om färgen.',means:function(c){return c===b.c?'Fjärde färg (utgångskrav).':null},conv:'Fjärde färg'};
        if(h.hp>=10) return {exp:b.c,alt:[],why:'Tredje färg: 10+ hp, rondkrav. Kan bjudas med 3 kort om det är ett håll.',means:function(c){return c===b.c?'Tredje färg (rondkrav).':null},conv:'Tredje färg'};
        return NC('Tredje färg kräver minst 10 hp.', null, 'Tredje färg');
      }

      var openerShowsTwoSuits = isBid(ours[2].c) &&
        ours[2].c[1] !== s1 && ours[2].c[1] !== 'N' &&
        h.L[s1] >= 4 && h.L[ours[2].c[1]] >= 4;
      if(d===4 && opener && ours[0].c==='1C' && ours[1].c==='1D' &&
         ours[2].c==='2C' && ours[3].c==='2N' && h.stop('H')){
        return {exp:'3H',alt:[],why:'Håll i hjärter visas med 3♥ efter 1♣–1♦–2♣–2NT. Budet är utgångskrav.',
          means:function(c){return c==='3H'?'Visar hjärterhåll; utgångskrav.':null},conv:'hållvisning',soft:false};
      }
      if(d===4 && opener && ours[3].c==='2N' && openerShowsTwoSuits){
        var invitePartner=H(st.hands[pt]);
        var inviteHcp=h.hp+invitePartner.hp;
        var allStops=['C','D','H','S'].every(function(s){return h.stop(s)});
        if(allStops){
          return {exp:'3N',alt:[],why:'Öppnaren har håll i alla fyra färger och paret har '+inviteHcp+' gemensamma honnörspoäng efter 2NT-inviten. Välj 3NT framför lågfärgsutgång.',means:function(c){return c==='3N'?'Accepterar sanginvit med håll i alla färger.':null},conv:'invit i sang'};
        }
      }
      if(d===4 && opener && (ours[2].c === '2'+s1 || openerShowsTwoSuits) &&
         isBid(ours[3].c) && ours[3].c[1]!==s1 &&
         ours[3].c[1]!==s2 && ours[3].c[1]!=='N'){
         var s3 = ours[3].c[1];
         if (h.stop(s3)) {
             if (h.hp <= 14) return {exp:'2N', alt:[], why:'Håll i fjärde färgen, minimum: 2NT.', conv:'Fjärde färg'};
             return {exp:'3N', alt:[], why:'Håll i fjärde färgen, maximum: 3NT.', conv:'Fjärde färg'};
         }
         if (h.L[s2] >= 3) return {exp:lowest(s2, last), alt:[], why:'Trumfstöd i partnerns första färg.', conv:'Fjärde färg'};
         if (h.L[s1] >= 5) return {exp:lowest(s1, last), alt:[], why:'Ingen lämplig preferens; bjuder om egen femkortsfärg.', conv:'Fjärde färg'};
         return {exp:lowest(s2, last), alt:[], why:'Preferens till partnerns första färg.', conv:'Fjärde färg'};
      }
    }

    if(c1==='1N'||c1==='2N'){var k=c1==='2N'?1:0;
      if(k===1&&!opener&&d===3&&ours[1].c==='3C'&&ours[2].c==='3S'){
        var staymanOpener=H(st.hands[pt]);
        var staymanTotal=h.hp+staymanOpener.hp;
        var spadeFit=h.L.S+staymanOpener.L.S;
        if(h.bal&&staymanTotal>=25&&spadeFit<8){
          return {exp:'3N',alt:[],why:'Balanserad svarshand och '+staymanTotal+' gemensamma honnörspoäng efter 2NT–3♣–3♠. Ingen 8-korts spaderfit; välj 3NT framför lågfärg.',means:function(c){return c==='3N'?'Balanserad hand, 25+ gemensamma honnörspoäng och ingen spaderfit: 3NT.':null},conv:'2NT-Stayman'};
        }
        if(h.bal&&staymanTotal>=25&&spadeFit>=8){
          return {exp:'4S',alt:[],why:'8-korts spaderfit och '+staymanTotal+' gemensamma honnörspoäng: utgång i spader.',means:function(c){return c==='4S'?'Utgång med 8-korts spaderfit.':null},conv:'2NT-Stayman'};
        }
      }
      if(c1==='1N'&&!opener&&d===2){
        var opening=prior.filter(function(x){return x.s===pt&&isBid(x.c)&&/^1[CDHS]$/.test(x.c)})[0];
        var openerRebid=prior.filter(function(x){return x.s===pt&&isBid(x.c)&&x!==opening}).slice(-1)[0];
        if(opening&&openerRebid)return respAfter1NT(h,opening.c,openerRebid.c,b.c);
      }
      if(!opener&&d===1)return ntResp(h,k,st.hands[pt]);
      if(opener&&d===2)return ntOpener(h,k,ours[1].c,st.hands[pt]);
      if(!opener&&d===3&&!k){var m1=ours[1].c,rep=ours[2].c;
        if(m1==='2C')return stay2(h,rep,st.hands[pt]);
        if(m1==='2D'&&rep==='2H')return transfer2(h,'H');
        if(m1==='2H'&&rep==='2S')return transfer2(h,'S');
        if(m1==='2S'&&rep==='2N'){var mc=h.L.C>=h.L.D?'3C':'3D';return {exp:mc,alt:[],why:'Bjud din långa lågfärg på 3-nivå som slutbud.',means:T({'3C':'Slutbud i ♣.','3D':'Slutbud i ♦.'}),conv:'1NT-svar'}}
        if(m1==='2S'&&rep==='3C'){var e=h.L.C>=h.L.D?'P':'3D';return {exp:e,alt:[],why:e==='P'?'Du har ♣ som lågfärg: pass.':'Du har ♦ som lågfärg: 3♦.',means:T({P:'Slutbud: pass.','3D':'Slutbud i ♦.'}),conv:'1NT-svar'}}
      }
      if(opener&&d===4&&!k){
        var t1=ours[1].c,t2=ours[2].c;
        // 3NT valde utgång efter överföring
        if((t1==='2D'&&t2==='2H'&&ours[3].c==='3N')||(t1==='2H'&&t2==='2S'&&ours[3].c==='3N')){
            return ntOpener3NTChoice(h, t1==='2D'?'H':'S');
        }
        if((t1==='2D'&&t2==='2H'&&ours[3].c==='4H')||(t1==='2H'&&t2==='2S'&&ours[3].c==='4S')){
            return {exp:'P',alt:[],why:'4 i överföringsfärgen är slutbud/signoff enligt Nordisk standard s. 5. Öppnaren passar.',means:function(c){return c==='P'?'Pass efter svarshandens signoff i 4M.':null},conv:'överföring'};
        }
        if((t1==='2D'&&t2==='2H')||(t1==='2H'&&t2==='2S'))return ntOpenerInvit(h,t1==='2D'?'H':'S',ours[3].c,st.hands[pt]);
        return ntOpener3(h,ours[1].c,ours[2].c,ours[3].c,st.hands[pt]);
      }
      return nc('Fortsättningen i 1NT/2NT-systemet beskrivs inte i dokumentet.');
    }
    if(c1==='2C'){
      if(!opener&&d===1)return resp2c(h);
      if(opener&&d===2)return reb2c(h,ours[1].c);
      if(!opener&&d===3){var rb=ours[2].c;if(rb==='2N')return ntResp(h,1);return resp2c2(h,rb,ours[1].c)}
      // Efter 2♣–2♦–3♣–3♦ är 3♦ Herbertavslag.
      // Öppningshanden ska då välja sin bästa sidofärg, inte passa.
      if(opener&&d===4&&ours[1].c==='2D'&&ours[2].c==='3C'&&ours[3].c==='3D'){
        var sideSuits=['H','S','D'].filter(function(s){return h.L[s]>=4;});
        sideSuits.sort(function(a,b){
          if(h.L[b]!==h.L[a])return h.L[b]-h.L[a];
          if(h.good(b)!==h.good(a))return h.good(b)?1:-1;
          return ['H','S','D'].indexOf(a)-['H','S','D'].indexOf(b);
        });
        var best=sideSuits[0]||'C';
        var rebid=sideSuits.length?'3'+best:'4C';
        return {exp:rebid,alt:[],why:'3♦ är Herbertavslag efter 3♣. Öppningshanden väljer sin bästa sidofärg ('+(sideSuits.length?SYM[best]:'ingen sidofärg med 4+ kort; återbud i ♣')+') och får inte passa.',means:function(c){return c===rebid?'Öppningshandens färgval efter Herbertavslag.':null},conv:'2♣-system / Herbert'};
      }
      return nc('Fortsättningen i 2♣-systemet beskrivs inte i dokumentet.');
    }
    if(/^2[DHS]$/.test(c1)){
      if(!opener&&d===1)return resp2w(h,c1,st.hands[pt]);
      if(opener&&d===2)return open2w(h,c1,ours[1].c);
      return nc('Fortsättningen efter svag tvåa beskrivs inte i dokumentet.');
    }
    if(/^[34][CDHS]$/.test(c1)){
      if(!opener&&d===1){
         if(b.c==='3N') return {exp:'3N', alt:[], why:'3NT med håll i sidofärgerna.', conv:'spärr'};
         if(isBid(b.c) && b.c[1]!==c1[1] && b.c[1]!=='N') return {exp:b.c, alt:[], why:'Ny färg: rondkrav, 5+ kort.', conv:'spärr'};
         if(isBid(b.c) && st_(b.c)===st_(c1)) return {exp:b.c, alt:[], why:'Höjning av spärren (spärrhöjning).', conv:'spärr'};
      }
      return nc('Fortsättningen efter spärrbud beskrivs inte i dokumentet.');
    }
    if(/^1[CDHS]$/.test(c1)){
      // Efter 1♦–1♥–2♠ är 2♠ öppnarens reverse och SH ska
      // höja till 4♠ med minst 8-korts fit och 26+ gemensamma spelpoäng.
      if(!opener&&d===2&&c1==='1H'&&b.c==='4S'){
        var partnerCalls=prior.filter(function(x){return x.s===pt&&x.c!=='P'&&isBid(x.c)});
        var partnerRebid=partnerCalls.length>1?partnerCalls[1].c:null;
        var ph=H(st.hands[pt]),fitS=h.L.S+ph.L.S;
        var totalS=partnershipPoints(h,ph,'S');
        if(partnerRebid==='2S'&&fitS>=8&&totalS>=26){
          return {exp:'4S',alt:[],why:'Reverse 1♦–1♥–2♠. Minst 8-korts spaderfit och '+totalS+' gemensamma spelpoäng (26+): SH ska bjuda 4♠.',means:function(c){return c==='4S'?'Utgång i ♠: minst 8-korts fit och 26+ gemensamma spelpoäng.':null},conv:'reverse och utgång'};
        }
      }
      if(!opener&&d===3){
        var openerHand=st.hands[pt];
        return responderSecondBid(h,ours[0].c,ours[1].c,ours[2].c,openerHand);
      }
      if(!opener&&d===1)return resp1(h,c1);
      if(opener&&d===2)return reb1(h,c1,ours[1].c,st.hands[pt]);
      return nc('Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet.');
    }
    return nc('Okänd budgivning.');
  }


  // Säkerhetskontroll: rekommendationen får aldrig ligga på eller under
  // det högsta kontraktsbud som redan har lagts i auktionen.
  // Om partnern redan har nått den föreslagna nivån ska svaret vara pass,
  // inte ett olagligt återbud eller ett upprepat kontraktsbud.
  // Auction-only guard: no hidden hand information is used here.
  function slamProhibitionFromAuction(bids,index,ourSide){
    var prior=(bids||[]).slice(0,index);
    for(var j=0;j<prior.length;j++){
      var call=prior[j];
      if(!call||side(call.s)===ourSide)continue;
      var earlierOurBid=prior.slice(0,j).some(function(x){return x&&side(x.s)===ourSide&&/^1[CDHSN]$/.test(x.c);});
      if(!earlierOurBid)continue;
      if(/^2[CDHS]$/.test(call.c)){
        return 'Motståndarna har klivit in på tvåtricksnivån; enligt den uttryckliga slamspärren får vår sida inte rekommendera slam.';
      }
      if(/^1[CDHS]$/.test(call.c)){
        var opponentPartner=partner(call.s);
        var partnerResponded=prior.slice(j+1).some(function(x){
          return x&&x.s===opponentPartner&&x.c!=='P';
        });
        if(partnerResponded){
          return 'Motståndarna har gjort ett inkliv på entricksnivån och inklivarens partner har svarat; enligt den uttryckliga slamspärren får vår sida inte rekommendera slam.';
        }
      }
    }
    return null;
  }

  // Public live API. Deliberately accepts one hand only; there is no
  // parameter through which partner/opponent cards can enter the decision.
  function decideLive(input){
    input=input||{};
    var seat=input.seat,dealer=input.dealer,auction=input.auction||[],ownHand=input.ownHand;
    if(!validSeat(seat)||!validSeat(dealer))
      return NC('Livebeslut kräver giltig plats och givare.','', 'live');
    if(!Array.isArray(ownHand)||ownHand.length!==13)
      return NC('Livebeslut kräver exakt 13 egna kort.','', 'live');
    var cardSet={};
    for(var ci=0;ci<ownHand.length;ci++){
      var card=ownHand[ci];
      if(typeof card!=='string'||! /^[CDHS](?:[2-9]|1[0-4])$/.test(card)||cardSet[card])
        return NC('Den egna handen innehåller ogiltiga eller dubblerade kort.','', 'live');
      cardSet[card]=true;
    }
    if(!Array.isArray(auction))
      return NC('Budhistoriken måste vara en lista.','', 'live');
    var expected=dealer;
    for(var ai=0;ai<auction.length;ai++){
      var call=auction[ai];
      if(!call||call.s!==expected||!validSeat(call.s)||
         !(call.c==='P'||call.c==='X'||call.c==='XX'||isBid(call.c)))
        return NC('Budhistoriken är ogiltig eller turordningen stämmer inte.','', 'live');
      expected=nextSeat(expected);
    }
    if(expected!==seat)
      return NC('Det är inte den angivna spelarens tur enligt den offentliga budhistoriken.','', 'live');
    if(auction.length>=4&&auction.slice(-4).every(function(x){return x.c==='P';}))
      return NC('Budgivningen är redan avslutad efter fyra pass.','', 'live');
    var nonPass=auction.filter(function(x){return x.c!=='P';});
    var openingCall=nonPass[0]||null;
    var isOpeningDecision=nonPass.length===0;
    var isOneNTFamily=!!openingCall&&openingCall.c==='1N'&&
      side(openingCall.s)===side(seat)&&
      auction.every(function(x){
        if(side(x.s)!==side(seat))return x.c==='P';
        return x.c==='P'||x.c==='1N'||
          ['2C','2D','2H','2S','2N','3C','3D','3H','3S','3N','4C','4D','4H','4S','4N'].indexOf(x.c)>=0;
      })&&nonPass.every(function(x){return x.c!=='X'&&x.c!=='XX';});
    if(!isOpeningDecision&&!isOneNTFamily)
      return NC('Den här budsekvensen ingår ännu inte i den informationssäkra livebedömningen. Öppning efter pass och ostörd 1NT-familj är aktiverade; andra sekvenser lämnas ej täckta.','', 'live');
    var bids=auction.concat([{s:seat,c:'P'}]);
    var st={hands:{}};st.hands[seat]=ownHand.slice();st.dealer=dealer;st.bids=bids;
    var node;
    try{node=nodeForRaw(st,bids.length-1);}
    catch(e){return NC('Livebeslut stoppades säkert: '+e.message,'','live');}
    if(!node||!node.exp)
      return NC(node&&node.why||'Öppnings-/1NT-läget är inte täckt utan partnerns dolda hand.','', 'live');
    return {
      exp:node.exp,
      alt:(node.alt||[]).slice(),
      why:node.why||'',
      conv:node.conv||'öppning',
      means:node.means,
      context:'live',
      informationBoundary:'own_hand_and_public_auction_only'
    };
  }

  function nodeFor(st,i){
    var node=nodeForRaw(st,i);

    // Samma poänggränser ska styra både rekommendationen och rättningen.
    // Kontrollera missad utgång/slam när rålogiken saknar nod eller föreslår pass.
    // En explicit exp:null betyder däremot att systemregeln inte är täckt och får inte skrivas över.
    var priorPartnershipCalls=st&&st.bids?st.bids.slice(0,i).filter(function(x){return x&&isBid(x.c)&&side(x.s)===side(st.bids[i].s)}).length:0;
    // Generic missed-game/ slam rescue must not override an explicit RKC
    // response or the deliberately uncovered continuation after that reply.
    var hasRkcContext=!!(st&&st.bids&&st.bids.slice(0,i).some(function(x){return x&&x.c==='4N'&&side(x.s)===side(st.bids[i].s)})&&rkcTrumpFromAuction(st.bids.slice(0,i),side(st.bids[i].s)));
    var highestBefore=null;
    if(st&&st.bids)st.bids.slice(0,i).forEach(function(x){if(x&&isBid(x.c)&&(!highestBefore||rk(x.c)>rk(highestBefore)))highestBefore=x.c;});
    var rawIllegal=!!(node&&node.exp&&isBid(node.exp)&&highestBefore&&rk(node.exp)<=rk(highestBefore));
    if(st&&st.bids&&st.bids[i]&&!hasRkcContext&&priorPartnershipCalls>=2&&
       (!node||(!node.exp&&!node.sourceGap)||node.exp==='P'||rawIllegal)){
      var contractBefore=null,sideBefore=null;
      for(var ci=0;ci<i;ci++){
        if(st.bids[ci]&&isBid(st.bids[ci].c)){
          contractBefore=st.bids[ci].c;
          sideBefore=side(st.bids[ci].s);
        }
      }
      var analysisBids=st.bids.slice();
      analysisBids[i]={s:st.bids[i].s,c:'P'};
      var missed=missedGameOrSlam(st,analysisBids,i,contractBefore,sideBefore);
      if(missed){
        node={
          exp:missed.target,
          alt:[],
          why:missed.why,
          means:function(c){return c===missed.target?'Utgång eller slam enligt partnerskapets poänggränser.':null},
          conv:'missad utgång/slam',
          soft:false
        };
      }
    }
    var slamBlockReason=st&&st.bids&&st.bids[i]
      ?slamProhibitionFromAuction(st.bids,i,side(st.bids[i].s)):null;
    if(slamBlockReason){
      var actualCall=st.bids[i].c;
      if(isBid(actualCall)&&lv(actualCall)>=6){
        return {exp:null,slamBlocked:true,why:slamBlockReason};
      }
      if(node&&node.exp&&isBid(node.exp)&&lv(node.exp)>=6){
        return {exp:null,slamBlocked:true,why:slamBlockReason};
      }
    }
    if(!node||!node.exp||!isBid(node.exp))return node;
    var highest=null;
    (st.bids||[]).slice(0,i).forEach(function(x){
      if(x&&isBid(x.c)&&(!highest||rk(x.c)>rk(highest)))highest=x.c;
    });
    if(highest&&rk(node.exp)<=rk(highest)){
      var rejected=node.exp;
      var priorMeans=typeof node.means==='function'?node.means:null;
      return {
        exp:'P',
        alt:[],
        why:'Det ursprungliga förslaget '+txt(rejected)+' är inte längre lagligt eftersom kontraktsbudet '+txt(highest)+' redan har lagts. Passas i stället; budmotorn får inte rekommendera ett lägre eller upprepat kontraktsbud.',
        means:function(c){
          if(c==='P')return 'Pass när partnerns eller motståndarnas tidigare kontraktsbud redan ligger över det föreslagna budet.';
          return priorMeans?priorMeans(c):null;
        },
        conv:node.conv||'budordning',
        soft:false
      };
    }
    if(node.alt&&node.alt.length){
      node.alt=node.alt.filter(function(c){
        return !isBid(c)||!highest||rk(c)>rk(highest);
      });
    }
    return node;
  }

  function expandedMeaning(short,conv,act){
    var extra={
      'öppning':'Öppningsbudet beskriver öppningshandens styrka och fördelning. Vid 4-4 öppnas H>S>C>D. Vid 5-5 öppnas S>H>D>C.',
      'svar':'Svarshanden beskriver sin styrka och fördelning. En ny färg på 1-nivån visar minst 6 hp och minst 4 kort samt är rondkrav. En ny färg på 2-nivån visar minst 11 hp och minst 4 kort samt är rondkrav.',
      'Stenberg':'Stenberg 2NT visar minst 13 htp och minst 4 korts stöd i öppningsfärgen. Det är utgångskrav.',
      'Stayman':'Stayman är högfärgsfråga efter sangöppning. 2♣ frågar efter 4-korts högfärg; öppnaren svarar 2♦ utan 4+ högfärg, 2♥ med 4–5 hjärter och 2♠ med 4–5 spader.',
      'överföring':'Överföringsbudet visar minst 5 kort i den angivna högfärgen. 3NT visar jämn hand och exakt 5 kort (välj utgång). 4C/4D är kontrollbud. 4NT är RKC.',
      '1NT-svar':'Efter 1NT används systemets särskilda svar: Stayman för att hitta högfärgsfit, överföring med minst 5-korts högfärg, naturlig invit med balanserad hand eller slutbud.',
      '2♣-system':'Öppning 2♣ är utgångskrav eller 22-24 hp balanserad. Svarshanden bjuder alltid 2♦ (väntebud). Därefter beskriver öppnaren sin hand. Vid 26 hp bjuds utgång (3NT/4M/5m), vid 33 hp bjuds 4NT (essfråga).',
      'Herbert':'Herbertavslag är det närmaste tillgängliga budet efter 2♣–2♦–2M. Det visar 0–5 hp och säger i sig inget om den färg som bjuds.',
      'svag tvåa':'En svag tvåöppning visar 6–10 hp och exakt 6 kort i ♦ eller högfärg, med bra färgkvalitet (2 honnörer eller 1 honnör + 2 av 10-9-8). 3 i öppningsfärgen är invit (14-16 stp), 2NT är invit (9-10 hp).',
      'öppnarens 2:a bud':'Öppnarens andra bud preciserar styrka och fördelning efter svarshandens första bud.',
      'RKC':'RKC är essfråga. När trumf är fastställd räknas fyra ess plus trumfkungen som femte ess.',
      'RKC 1430':'RKC 1430 används när trumf är fastställd. 5♣ = 1 eller 4 nyckelkort, 5♦ = 0 eller 3, 5♥ = 2 utan trumfdam, 5♠ = 2 med trumfdam.',
      'Fyr-essfråga utan trumf':'Nordisk standard s. 7: i de uttryckligen avtalade sangsekvenserna 1NT–4NT och 1NT–2♣–2♦–4NT räknas fyra ess. 5♣ = 0 eller 4 ess, 5♦ = 1, 5♥ = 2, 5♠ = 3. Fortsättningen efter svaret är inte definierad här.',
      'inkliv':'Ett inkliv visar normalt 12–17 hp och minst 5 kort i färgen (2-nivån kräver 6 kort). 1NT-inkliv visar 15–17 hp och håll i öppningsfärgen. Vid inkliv efter 1NT stängs Stayman/överföring av. Ny färg 2-nivå = invit, 3-nivå = krav.',
      'dubbling':'Upplysningsdubbling (UD) visar minst 12 hp och 3+ kort i objudna färger. Negativ dubbling (av SH) visar 6+ hp och 4-korts objuden högfärg. Stöddubbling (av ÖH) visar exakt 3-korts stöd. Dubbelt efter 1NT-inkl = UD, invit+.',
      'svar efter 1NT':'Efter 1 i färg–1NT och öppnarens återbud finns ett uttryckligt undantag: svarshandens andra färgbud kan vara 6–9 hp och minst 6 kort, utan att vara krav.',
      'Tredje färg':'Tredje färg är ett rondkrav som lovar minst 10 hp. Det kan bjudas med bara 3 kort om det är ett håll (t.ex. D-x-x).',
      'Fjärde färg':'Fjärde färg är ett konstgjort utgångskrav som lovar minst 13 hp. Det berättar ingenting om färgen man bjuder, utan ber partnern beskriva sin hand ytterligare.',
      'spärr':'Spärrbudet visar en lång färg och begränsad styrka. Ny färg är krav. 3NT kan vara rätt slutbud om partnern har en lång lågfärg.',
      'överbud':'Överbud (Cuebid) i motståndarens färg visar 10+ hp och 3+ trumfstöd. Det är ett kravbud.',
      'hållvisning':'3♥ visar håll i hjärter efter 1♣–1♦–2♣–2NT. Budet är utgångskrav.'
    };
    var detail=extra[conv]||'Budets betydelse ska läsas tillsammans med den föregående budgivningen.';
    return short ? short+'\n\n'+detail : detail;
  }

  function verdictOf(node,act){
    var short=(typeof node.means==='function'?node.means(act):null)||'Budet ingår inte i dokumentets system i den här situationen.';
    var o={bedomning:'ej_täckt',motivering:node.why||'',forklaring:expandedMeaning(short,node.conv||'övrigt',act),konvention:node.conv||'övrigt',battre:''};
    if(node.slamBlocked){
      if(isBid(act)&&lv(act)>=6){
        o.bedomning='fel';
        o.motivering=node.why;
        o.forklaring='Slam är spärrat efter motståndarnas visade styrka/fortsättning i den här auktionen.';
        return o;
      }
      o.bedomning='ej_täckt';o.motivering=node.why;return o;
    }
    if(!node.exp){o.bedomning='ej_täckt';o.motivering=node.why;return o}
    if(act===node.exp){o.bedomning='rätt';return o}
    if(node.alt&&node.alt.indexOf(act)>=0){o.bedomning='valfritt';o.battre=txt(node.exp);return o}
    o.bedomning=node.soft?'valfritt':'fel';
    o.battre=txt(node.exp);
    if(node.soft)o.motivering='Dokumentet är inte exakt här, men huvudbudet är '+txt(node.exp)+'. '+node.why;
    return o;
  }
  function judge(st){
    var items=[],r=0,f=0,v=0,n=0;
    st.bids.forEach(function(b,i){
      if(side(b.s)===1){
        if(b.c!=='P')items.push({nr:i+1,plats:NAME[b.s],bud:txt(b.c),konvention:'motståndare',forklaring:b.e||'Motståndarens bud (robot).',bedomning:'rätt',battre:'',motivering:''});
        return;
      }
      var node;try{node=nodeFor(st,i)}catch(e){node=NC('Kunde inte bedöma budet ('+e.message+').')}
      var v_=verdictOf(node,b.c);
      var it={nr:i+1,plats:NAME[b.s],bud:txt(b.c)};for(var k in v_)it[k]=v_[k];
      if(it.bedomning==='rätt')r++;else if(it.bedomning==='fel')f++;else if(it.bedomning==='valfritt')v++;else n++;
      items.push(it);
    });
    return {items:items,summary:'Rätt '+r+' · Fel '+f+' · Valfritt '+v+' · Ej täckt '+n+' (Norr och Syd).'};
  }
  function nextSeat(s){return {N:'E',E:'S',S:'W',W:'N'}[s]}
  function validSeat(s){return s==='N'||s==='E'||s==='S'||s==='W'}
  function validateAuction(st){
    var bids=st.bids||[], dealer=validSeat(st.dealer)?st.dealer:(bids.length?bids[0].s:null);
    var errors=[], contract=null, contractSide=null, doubled=0, consecutivePasses=0, ended=false, expected=dealer;
    for(var i=0;i<bids.length;i++){
      var b=bids[i]||{}, c=b.c, seat=b.s;
      if(ended){errors.push({index:i,message:'Bud efter att budgivningen redan avslutats.'});continue}
      if(!validSeat(seat)){errors.push({index:i,message:'Okänd spelare/plats.'});continue}
      if(expected&&seat!==expected)errors.push({index:i,message:'Fel turordning: '+seat+' skulle inte bjuda nu; förväntad spelare är '+expected+'.'});
      expected=nextSeat(seat);
      if(c==='P'){
        consecutivePasses++;
        if((!contract&&consecutivePasses===4)||(contract&&consecutivePasses===3))ended=true;
        continue;
      }
      consecutivePasses=0;
      if(isBid(c)){
        if(contract&&rk(c)<=rk(contract))errors.push({index:i,message:'Budet '+txt(c)+' är inte högre än föregående kontraktsbud '+txt(contract)+'.'});
        contract=c;contractSide=side(seat);doubled=0;
        continue;
      }
      if(c==='X'){
        if(!contract)errors.push({index:i,message:'Dubbling kräver ett föregående kontraktsbud.'});
        else if(side(seat)===contractSide)errors.push({index:i,message:'Man får inte dubbla sin egen sidas kontraktsbud.'});
        else if(doubled!==0)errors.push({index:i,message:'Kontraktet är redan dubblat eller redubblat.'});
        else doubled=1;
        continue;
      }
      if(c==='XX'){
        if(!contract||doubled!==1)errors.push({index:i,message:'Redubbling kräver att motståndarna har dubblat det aktuella kontraktet.'});
        else if(side(seat)!==contractSide)errors.push({index:i,message:'Endast sidan som bjöd kontraktet får redubbla.'});
        else doubled=2;
        continue;
      }
      errors.push({index:i,message:'Okänt budkod: '+c+'.'});
    }
    var contractText=contract?txt(contract)+(doubled===1?' dubblat':doubled===2?' redubblat':''):'Inget kontrakt';
    return {valid:errors.length===0,errors:errors,ended:ended,contract:contract,contractSide:contractSide,doubled:doubled,contractText:contractText,dealer:dealer};
  }

  // Övergripande kontroll av missad utgång och slam vid pass på egen sida.
  // Trösklarna är vägledande: välj först högfärgsfit, därefter sang eller lågfärg.
  // Missad utgång/slam: 26 poäng i högfärg, 28 i lågfärg,
  // 26 hp i sang utan fit. Fördelningspoäng räknas bara med fastställd trumf.
  function missedGameOrSlam(st,bids,i,currentContract,currentSide){
    var b=bids[i];
    if(!b||b.c!=='P'||side(b.s)!==0||currentSide!==0||!currentContract)return null;
    var priorNS=bids.slice(0,i).filter(function(x){return x&&isBid(x.c)&&side(x.s)===0;});
    if(priorNS.length<2)return null;
    var pt=partner(b.s),a=H(st.hands[b.s]),p=H(st.hands[pt]);
    // Weakness after a completed transfer is qualitative in the source;
    // do not infer a numeric pass exception from responder HCP.
    var totalHcp=a.hp+p.hp;

    // Räkna bara en färgfit som är visad naturligt i auktionen.
    // Konstgjorda bud som Stayman, överföring och 2♦-väntan efter 2♣
    // får inte skapa en påhittad trumf eller fördelningspoäng.
    function naturalSuitCall(index){
      var call=bids[index],c=call&&call.c;
      if(!call||!isBid(c)||c[1]==='N')return false;
      var prev=null;
      for(var z=index-1;z>=0;z--)if(isBid(bids[z].c)){prev=bids[z].c;break;}
      if(prev==='1N'&&['2C','2D','2H'].indexOf(c)>=0)return false;
      if(prev==='2N'&&c==='3C')return false;
      if(prev==='2C'&&c==='2D'){
        var first=null;
        for(var q=0;q<index;q++)if(isBid(bids[q].c)){first=bids[q].c;break;}
        if(first==='2C')return false;
      }
      return true;
    }
    var shown={C:false,D:false,H:false,S:false};
    for(var si=0;si<i;si++){
      if(side(bids[si].s)===0&&naturalSuitCall(si))shown[st_(bids[si].c)]=true;
    }
    var majors=['H','S'].filter(function(x){return shown[x]&&a.L[x]+p.L[x]>=8;});
    majors.sort(function(x,y){return (a.L[y]+p.L[y])-(a.L[x]+p.L[x]);});
    var minors=['C','D'].filter(function(x){return shown[x]&&a.L[x]+p.L[x]>=8;});
    minors.sort(function(x,y){return (a.L[y]+p.L[y])-(a.L[x]+p.L[x]);});

    var trump=majors.length?majors[0]:(minors.length?minors[0]:'N');
    var total=trump==='N'?totalHcp:partnershipPoints(a,p,trump);
    var threshold=trump==='N'?25:(maj(trump)?26:28);
    var gameLevel=trump==='N'?3:(maj(trump)?4:5);
    var currentSuit=st_(currentContract),currentLevel=lv(currentContract);
    var gameReached=(currentSuit==='N'&&currentLevel>=3)||
      (maj(currentSuit)&&currentLevel>=4)||
      (!maj(currentSuit)&&currentSuit!=='N'&&currentLevel>=5);
    var slamTarget='6'+trump;

    if(total>=33&&lv(currentContract)<6&&rk(slamTarget)>rk(currentContract)){
      var basis=trump==='N'?'sang, endast honnörspoäng':'naturligt visad '+SYM[trump]+'-fit med fördelningspoäng';
      return {target:slamTarget,why:'Partnerskapets sammanlagda styrka är '+total+' poäng ('+basis+'). Med 33+ poäng ska slam undersökas. Pass under lillslam avslutar för tidigt.'};
    }
    if(total>=threshold&&!gameReached){
      var target=trump==='N'?'3N':(maj(trump)?'4'+trump:'5'+trump);
      if(rk(target)<=rk(currentContract)){
        var choices=trump==='N'?['3N']:maj(trump)?['4H','4S','3N']:['5C','5D','3N'];
        target=choices.filter(function(x){return rk(x)>rk(currentContract);})[0]||null;
      }
      if(!target)return null;
      var thresholdText=trump==='N'?'25+ honnörspoäng i sang':(maj(trump)?'26+ spelpoäng med minst 8-korts naturligt visad högfärgsfit':'28+ spelpoäng med minst 8-korts naturligt visad lågfärgsfit');
      return {target:target,why:'Partnerskapets sammanlagda styrka är '+total+' poäng. '+thresholdText+' innebär att utgång ska undersökas; pass på ett kontrakt under utgång missar utgång.'};
    }
    return null;
  }

  function judgeComplete(st){
    var structural=validateAuction(st), items=[],right=0,wrong=0,optional=0,uncovered=0;
    var bids=st.bids||[];
    var runningContract=null, runningSide=null;
    for(var i=0;i<bids.length;i++){
      var b=bids[i], item={nr:i+1,plats:NAME[b.s]||b.s,bud:txt(b.c)};
      var contractBefore=runningContract, sideBefore=runningSide;
      var issue=null;
      for(var j=0;j<structural.errors.length;j++)if(structural.errors[j].index===i){issue=structural.errors[j].message;break}
      if(issue){
        item.konvention='budordning';item.forklaring='Budet kan inte bedömas som en giltig del av auktionen.';
        item.bedomning='fel';item.battre='';item.motivering=issue;wrong++;
      }else if(side(b.s)===1){
        // Motståndarnas pass är redan tydliga i budgivningen; visa ingen tom rättningspost.
        if(b.c!=='P'){
          item.konvention='motståndare';item.forklaring=b.e||'Motståndarens bud (robot).';
          item.bedomning='rätt';item.battre='';item.motivering='Motståndarens bud visas som kontext och poängsätts inte.';
        }
      }else{
        var node;
        try{node=nodeFor(st,i)}catch(e){node=NC('Kunde inte bedöma budet ('+e.message+').')}
        var v=verdictOf(node,b.c);
        for(var k in v)item[k]=v[k];

        // Återhämtning efter tidigare felbud: behåll handanalysen och peka ut
        // den första avvikelsen i stället för att låta följdbuden se ut som
        // om handen/analysen saknas.
        if(!node.exp){
          var firstDeviation=null;
          for(var ri=0;ri<items.length;ri++){
            var prev=items[ri];
            if((prev.plats==='Norr'||prev.plats==='Syd') && prev.bedomning==='fel' && prev.battre){
              firstDeviation=prev;break;
            }
          }
          if(firstDeviation){
            item.konvention='avvikelse efter tidigare felbud';
            item.motivering='Handen är fortfarande identifierad och analyserad, men den fortsatta budsekvensen kan inte bedömas säkert efter avvikelsen vid bud '+firstDeviation.nr+'. Där rekommenderades '+firstDeviation.battre+'. Rätta först det budet; därefter kan fortsättningen bedömas på nytt.';
            item.forklaring='Följdbudet ligger utanför den förväntade budvägen eftersom ett tidigare bud avvek. Detta betyder inte att handen saknas i systemet.';
            item.battre=firstDeviation.battre;
          }
        }
        var missed=missedGameOrSlam(st,bids,i,contractBefore,sideBefore);
        if(missed){
          item.bedomning='fel';item.battre=txt(missed.target);item.konvention='missad utgång/slam';
          item.motivering=missed.why+' Bästa teoretiska bud: '+txt(missed.target)+'.';
          item.forklaring='Pass trots att partnerskapets sammanlagda honnörsstyrka motiverar att bjuda vidare till utgång eller slam.';
        }
        if(item.bedomning==='rätt')right++;else if(item.bedomning==='fel')wrong++;else if(item.bedomning==='valfritt')optional++;else uncovered++;
      }
      if(isBid(b.c)){runningContract=b.c;runningSide=side(b.s);}
      var hand=H(st.hands[b.s]);
      var partnerHand=H(st.hands[partner(b.s)]);
      var agreed=null;
      // Stenberg 2NT visar uttryckligen stöd i öppnarens färg.
      if(node&&node.conv==='Stenberg'){
        for(var ai=0;ai<i;ai++){
          if(side(bids[ai].s)===side(b.s)&&/^1[CDHS]$/.test(bids[ai].c)){
            var candidate=bids[ai].c[1];
            if(hand.L[candidate]+partnerHand.L[candidate]>=8)agreed=candidate;
            break;
          }
        }
      }else{
        // I övriga sekvenser krävs att båda spelarna faktiskt har bjudit
        // samma färg. En reverse eller en ensidig färgbeskrivning fastställer
        // inte i sig trumf, även om de dolda händerna råkar ha 8 kort ihop.
        for(var aj=i;aj>=0;aj--){
          if(bids[aj].s!==b.s||!isBid(bids[aj].c)||bids[aj].c[1]==='N')continue;
          var candidateSuit=bids[aj].c[1];
          var partnerHasBidSuit=bids.slice(0,i+1).some(function(x){
            return x.s===partner(b.s)&&isBid(x.c)&&x.c[1]===candidateSuit;
          });
          if(partnerHasBidSuit&&hand.L[candidateSuit]+partnerHand.L[candidateSuit]>=8){
            agreed=candidateSuit;break;
          }
        }
      }
      if(!agreed && node && node.conv && node.conv.indexOf('svag tvåa')===0){
        for(var wi=0;wi<=i;wi++){
          if(side(bids[wi].s)===side(b.s) && /^2[DHS]$/.test(bids[wi].c)){
            var weakSuit=st_(bids[wi].c);
            if(hand.L[weakSuit]+partnerHand.L[weakSuit]>=8)agreed=weakSuit;
            break;
          }
        }
      }
      var agreedFit=agreed?hand.L[agreed]+partnerHand.L[agreed]:0;
      item.hp=hand.hp;item.htp=handHps(hand,agreed);item.langd=hand.L;
      if(agreed && agreedFit>=8){
        item.handtyp='Trumfstöd ('+SYM[agreed]+')';
        item.trumfstod=agreedFit+' kort i '+SYM[agreed];
      }else{
        var lens=[hand.L.C,hand.L.D,hand.L.H,hand.L.S].sort(function(a,b){return b-a});
        if(hand.bal)item.handtyp='Jämn fördelning ('+hand.shape+')';
        else if(lens[0]>=6)item.handtyp='Enfärgshand';
        else if(lens[0]>=5&&lens[1]>=4)item.handtyp='Tvåfärgshand';
        else item.handtyp='Obalanserad hand';
      }
      if(node && node.exp){
        var jointHcp=hand.hp+partnerHand.hp;
        var lengthBonus=agreedFit===9?1:agreedFit>=10?2:0;
        var jointPlaying=agreedFit>=8?partnershipPoints(hand,partnerHand,agreed):jointHcp;
        var distributionPoints=agreedFit>=8?jointPlaying-jointHcp-lengthBonus:0;
        function handShapeText(x){return '♠'+x.L.S+' ♥'+x.L.H+' ♦'+x.L.D+' ♣'+x.L.C;}
        item.nod={
          konvention:node.conv||'övrigt',
          rekommendation:txt(node.exp),
          rekommendationskod:node.exp,
          alternativ:(node.alt||[]).map(txt),
          motivering:node.why||'',
          betydelse:typeof node.means==='function'?(node.means(node.exp)||''):'',
          regelstatus:node.soft?'Vägledande bedömning':'Systemregel',
          hand:{hp:hand.hp,fordelning:handShapeText(hand)},
          partner:{hp:partnerHand.hp,fordelning:handShapeText(partnerHand)},
          gemensammaHp:jointHcp,
          fit:agreedFit>=8?{farg:agreed,antal:agreedFit,gemensammaSpelpoang:jointPlaying,fordelningspoang:distributionPoints,langdBonus:lengthBonus}:null
        };
      }
      if(!(side(b.s)===1&&b.c==='P'))items.push(item);
    }
    var status=structural.ended?'Budgivningen är avslutad.':bids.length?'Budgivningen är inte avslutad – inväntar fler bud.':'Ingen budgivning registrerad.';
    return {items:items,summary:'Rätt '+right+' · Fel '+wrong+' · Valfritt '+optional+' · Ej täckt '+uncovered+' (Norr och Syd).',auction:{valid:structural.valid,ended:structural.ended,dealer:structural.dealer,contract:structural.contractText,status:status,errors:structural.errors.map(function(e){return 'Bud '+(e.index+1)+': '+e.message})}};
  }

  return {judge:judgeComplete,H:H,partnershipPoints:partnershipPoints,nodeFor:nodeFor,nodeForRaw:nodeForRaw,decideLive:decideLive,slamProhibitionFromAuction:slamProhibitionFromAuction,txt:txt,validateAuction:validateAuction,version:'8.0'};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Rattning;
if(typeof window!=='undefined')window.Rattning=Rattning;
