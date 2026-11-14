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
  function NC(why,means,conv){return {exp:null,alt:[],why:why||'Situationen beskrivs inte i dokumentet.',means:means||function(){return null},conv:conv||'övrigt'}}

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
      if(c==='P')return 'Pass: under 6 hp.';
      if(c==='1N')return '6-10 hp, förnekar 4-korts stöd och färg på 1-nivå. Lovar ej jämn hand.';
      if(c==='2N')return 'Stenberg: 13+ htp, 4+ stöd, utgångskrav.';
      if(isBid(c)&&st_(c)===o){var l=lv(c);
        if(l===2)return '6-10 htp, 4+ stöd.';
        if(l===3)return '11-12 htp, 4+ stöd.';
        if(l===4)return M?'Spärrbud, max 12 htp, bra stöd och svitad hand.':'Spärrbud, max 9 htp, bra stöd och svitad hand.'}
      if(isBid(c)&&st_(c)!=='N'&&st_(c)!==o){var lo=lowest(st_(c),oc),l2=lv(c);
        if(c===lo&&l2===1)return '1 över 1: 6+ hp, 4+ färg, rondkrav.';
        if(c===lo&&l2===2){if(hp>=11||(hp===10&&L[st_(c)]>=6&&h.good(st_(c))))return '2 över 1: 11+ hp (eller 10 hp med bra 6-kortsfärg), 4+ färg, rondkrav.'}
        if(l2>lv(lo))return 'Dubbelhopp i ny färg: renons i färgen, 4+ stöd och 13+ htp.'}
      return null};

    if(M&&sup){
      if(htp<6){exp='P';why='Bara '+htp+' htp med stöd: för svag för att svara.'}
      else if(htp<=10){exp='2'+o;why=htp+' htp med 4+ stöd i högfärgen: 2 i färgen (6-10 stp).'}
      else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen (11-12 stp).'}
      else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT (13+).'}
    }else if(hp<6&&(!sup||htp<6)){exp='P';why='Under 6 hp: pass.'}
    else if(!M&&sup&&cand.some(maj)){var cm=cand.filter(maj);exp=lowest(pickBest(cm),oc);why='Stöd i lågfärg men egen 4+ högfärg: visa högfärgen först (sök högfärg).';
      if(cm.length>1&&L[cm[0]]===L[cm[1]])alt.push(lowest(cm[0]===pickBest(cm)?cm[1]:cm[0],oc))}
    else if(!M&&sup){
      if(htp<=10){exp='2'+o;why=htp+' htp med 4+ stöd i lågfärgen: 2 i färgen.'}
      else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen.'}
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
  function ntResp(h,k){
    var hp=h.hp,L=h.L,b=2+k,Hs=maj,exp,why,alt=[],soft=false;
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
    else if(hp>=lo&&(L.H===4||L.S===4)){exp=c2;why='4-korts högfärg och '+hp+' hp: Stayman.';conv='Stayman';soft=false}
    else if(hp>=lo&&hp<gl&&!k){exp='2N';why=hp+' hp, balanserad utan 4-korts högfärg: invit 2NT.'}
    else if(hp>=gl){exp=n2;why=hp+' hp utan högfärgsfit att söka: 3NT.';soft=false}
    else if(!k&&(L.C>=6||L.D>=6||(L.C>=5&&L.D>=5))){exp='2S';why='Dåliga kort med lång lågfärg: 2♠ (relä till 3 i lågfärg).'}
    else{exp='P';why=hp+' hp utan färg att visa: pass.'}
    return {exp:exp,alt:alt,why:why,means:means,conv:conv,soft:soft};
  }
  function ntOpener(h,k,r){
    var L=h.L,hp=h.hp,b=2+k,c2=b+'C',d2=b+'D',h2=b+'H',s2=b+'S',n2=b+'N',exp,why,alt=[],soft=false,conv='1NT-system';
    var means=function(c){
      if(r===c2){if(c===b+'D')return 'Ingen 4+ högfärg.';if(c===b+'H')return '4-5 korts ♥ (kan ha 4-4 i högfärg).';if(c===b+'S')return '4-5 korts ♠.'}
      if(r===d2){if(c===h2)return 'Fullföljer överföringen (visar 2+ ♥).';if(c===(b+1)+'H')return 'Max och 4+ ♥: kan bjuda 3♥ i stället för 2♥.'}
      if(r===h2){if(c===s2)return 'Fullföljer överföringen.';if(c===(b+1)+'S')return 'Max och 4+ ♠: kan bjuda 3♠ i stället.'}
      if(!k&&r==='2S'){if(c==='2N')return 'Längre ♦ än ♣ eller lika längd i lågfärg.';if(c==='3C')return 'Längre ♣ än ♦.'}
      if(r===b+'N'){if(c==='P')return 'Pass: 15 hp, minimum.';if(c==='3N')return 'Tackar ja till inviten (16-17 hp).'}
      if(c==='P')return 'Pass (slutbud).';
      return null};

    if (r === b+'N') {
        if (hp <= 15) return {exp:'P', alt:[], why:hp+' hp (minimum): passar på inbjudan.', means:means, conv:'1NT-system', soft:false};
        return {exp:'3N', alt:[], why:hp+' hp: tackar ja till inbjudan med 3NT.', means:means, conv:'1NT-system', soft:false};
    }

    if(r===c2){conv='Stayman';exp=L.H>=4?h2:L.S>=4?s2:d2;
      why=L.H>=4?'4+ ♥ (även 4-4 i högfärg): 2♥.':L.S>=4?'4+ ♠ utan ♥: 2♠.':'Ingen 4-korts högfärg: 2♦.';
      if(L.H>=4&&L.S>=5)alt=[s2]}
    else if(r===d2||r===h2){conv='överföring';var M=r===d2?'H':'S';
      if(hp>=17&&L[M]>=4&&!k){exp=(b+1)+M;alt=[b+M];why='Max (17 hp) och 4+ '+SYM[M]+': får bjuda 3 i färgen, men 2 i färgen är det vanliga.'}
      else{exp=b+M;why='Fullföljer överföringen.'}}
    else if(!k&&r==='2S'){conv='1NT-svar';exp=L.C>L.D?'3C':'2N';why=L.C>L.D?'Längre ♣ än ♦: 3♣.':'Längre ♦ än ♣ eller lika: 2NT.'}
    else if(!k&&(r==='3C'||r==='3D')){var m=r[1];exp=[14,13,12].some(function(n){return h.has(m,n)})?'3N':'P';soft=true;
      why=exp==='P'?'Passar med små kort (xx/xxx) i stödet.':'Topphonnör i färgen: söker 3NT.'}
    else if(r==='3N'||(!k&&r==='2N'&&false)){exp='P';why='Slutbud: pass.'}
    else return {exp:null,alt:[],why:'Öppnarens svar på detta bud beskrivs inte i dokumentet.',means:means,conv:conv};
    return {exp:exp,alt:alt,why:why,means:means,conv:conv,soft:soft};
  }
  function stay2(h,reply){
    var hp=h.hp,L=h.L,M=reply==='2H'?'H':reply==='2S'?'S':null,exp,why,alt=[];

    var splSuit = M ? SU.filter(function(s){return s!==M&&L[s]<=1})[0] : null;
    var splBid = splSuit ? (L[M]>=6 ? ((lv('2'+M)+1)+splSuit) : null) : null;

    var means=function(c){
      if(c===splBid && L[M]>=6) return 'Splinter: singel/renons i '+SYM[splSuit]+' och 6+ kort i trumffärgen. 14+ stp.';
      if(/^3[HS]$/.test(c))return 'Invit: 3 i öppnarens visade högfärg (8-9 stp).';
      if(c==='2N')return 'Invit (8-9 hp); efter Stayman visar sang att man har 4♠ (annars hade man bjudit högfärgen).';
      if(c==='3N')return 'Utgång i sang (10-15 hp); efter Stayman visar det 4♠ (eller ingen fit).';
      if(c==='4H'||c==='4S')return 'Slutbud i högfärgen (10-15 stp).';
      return null};
    if(M&&L[M]>=4){exp=hp>=10?'4'+M:'3'+M;why='Fit i '+SYM[M]+' med '+hp+' hp: '+(hp>=10?'utgång 4':'invit 3')+SYM[M]+'.'}
    else{
      var five=L.H>=5?'H':L.S>=5?'S':null;
      if(reply==='2D'&&five&&!h.bal&&hp>=10){exp='3'+five;why='Utgångsstyrka och obalanserad hand med 5-högfärg: 2♣ och sedan 3 i högfärgen.'}
      else{exp=hp>=10?'3N':'2N';why=hp>=10?'Ingen fit: utgång 3NT.':'Ingen fit: invit 2NT.'}
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'Stayman'};
  }
  function transfer2(h,M){
    var L=h.L,hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(c==='P')return '0-8 hp med minst 5 kort i överföringsfärgen: svagt slutbud.';
      if(c==='2N')return '8-9 hp och exakt 5 kort i överföringsfärgen: invit.';
      if(c==='3'+M)return '8-9 stp och minst 6 kort i överföringsfärgen: invit.';
      if(c==='3N')return 'Välj utgång med jämn hand och exakt 5-korts '+SYM[M]+'.';
      if(c==='4'+M)return '10-15 stp och minst 6 kort i överföringsfärgen: utgång i högfärgen.';
      if(c==='4C'||c==='4D')return 'Kontrollbud och slamintresse i '+SYM[M]+'.';
      if(c==='4N')return 'Essfråga (RKC) med '+SYM[M]+' som trumf.';
      if(M==='H'&&c==='2S')return '6+ hp, minst 5♥ och 4+♠: rondkrav.';
      if(c==='3C'||c==='3D')return '10+ hp, 5+ i överföringsfärgen och 4+ i lågfärgen: utgångskrav.';
      if(M==='S'&&c==='3H')return 'Invit med minst 5-5 i båda högfärgerna.';
      return null};
    if(hp<=8){exp='P';why=hp+' hp och minst 5 '+SYM[M]+': pass efter fullföljd överföring (0-8 hp).'}
    else if(hp<=9){if(L[M]>=6){exp='3'+M;why='8-9 hp och minst 6 '+SYM[M]+': invit med 3 i högfärgen.'}else{exp='2N';why='8-9 hp och exakt 5 '+SYM[M]+': invit med 2NT.'}}
    else if(hp<=15){
      if(L[M]>=6){exp='4'+M;why='10-15 hp och minst 6 '+SYM[M]+': utgång 4'+SYM[M]+'.'}
      else{
        if(h.bal){exp='3N';why='Välj utgång med jämn hand och exakt 5-korts '+SYM[M]+'.';}
        else{return NC('3NT kräver jämn hand och exakt 5-korts högfärg. Med obalanserad hand, överväg 4'+M+'.', means, 'överföring');}
      }
    }
    else{
      return {exp:null,alt:[],why:hp+' hp: 17+ visar slamintresse med 4 i lågfärg (kontrollbud) eller 4NT (RKC). Valet mellan dem är inte definierat.',means:means,conv:'överföring'};
    }
    if(hp>=6&&hp<=9){
      if(M==='H'&&L.H>=5&&L.S>=4)alt.push('2S');
      if(M==='S'&&L.H>=5&&L.S>=5)alt.push('3H');
    }
    if(hp>=10){
      if(L[M]>=5)['C','D'].forEach(function(s){if(L[s]>=4)alt.push('3'+s)});
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'överföring'};
  }
  function ntOpenerInvit(h,M,inv){
    var L=h.L,hp=h.hp,exp,alt=[],why;
    var means=function(c){
      if(c==='P')return 'Pass: tackar nej till inviten (15 hp).';
      if(c==='3N')return 'Tackar ja till inviten (16-17 hp): utgång i sang.';
      if(c==='4'+M)return 'Tackar ja till inviten (16-17 hp): utgång i högfärgen.';
      return null};
    if(inv!=='2N'&&inv!=='3'+M)return NC('Öppnarens svar på detta bud beskrivs inte i dokumentet.',means,'överföring');
    var game=L[M]>=3?'4'+M:'3N';

    if(hp<=15){exp='P';why=hp+' hp (minimum): tackar nej till inviten, pass.'}
    else{exp=game;why=hp+' hp: tackar ja till inviten med '+txt(game)+(L[M]>=3?' (minst 3 '+SYM[M]+').':' (färre än 3 '+SYM[M]+').');}
    return {exp:exp,alt:alt,why:why,means:means,conv:'överföring',soft:false};
  }
  function ntOpener3(h,k1,k2,k3){
    var L=h.L,hp=h.hp;
    var M = st_(k2);
    if(k1==='2C'&&(M==='H'||M==='S')&&k3==='2N'){
      var means=function(c){if(c==='P')return 'Minimum: passar på inviten.';if(c==='3N')return 'Maximum: tackar ja med 3NT.';if(c==='4'+M)return 'Maximum med trumfstöd: tackar ja med utgång.';return null};
      if (hp <= 15) return {exp:'P', alt:[], why:hp+' hp (minimum): passar på inbjudan.', means:means, conv:'Stayman'};
      var game = L[M]>=4 ? '4'+M : '3N';
      return {exp:game, alt:[], why:hp+' hp: tackar ja till inbjudan med '+txt(game), means:means, conv:'Stayman'};
    }
    if(k1==='2C'&&(M==='H'||M==='S')&&k3==='3N'){
      var means2=function(c){return c==='P'?'Passar på utgångsbudet.':null};
      return {exp:'P', alt:[], why:'Slutbud: pass.', means:means2, conv:'Stayman'};
    }
    return NC('Fortsättningen beskrivs inte i dokumentet.');
  }
  function ntOpener3NTChoice(h,M){
    var L=h.L,hp=h.hp,exp,why;
    var means=function(c){
      if(c==='P')return 'Pass: inget 3-korts stöd.';
      if(c==='4'+M)return 'Väljer utgång i högfärgen (3+ stöd).';
      return null;
    };
    if(L[M]>=3){exp='4'+M;why='Partnern bjöd 3NT (välj utgång). Du har 3+ '+SYM[M]+': bjud 4'+M+'.';}
    else{exp='P';why='Partnern bjöd 3NT (välj utgång). Du har färre än 3 '+SYM[M]+': passa.';}
    return {exp:exp,alt:[],why:why,means:means,conv:'överföring'};
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
  function resp2w(h,oc){
    var o=st_(oc),L=h.L,hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(c==='3'+o)return 'Invit, 14-16 stp, 3+ stöd.';
      if(c==='4'+o)return 'Utgång, 13-16 stp, 5+ kort (eller 4+ med stöd).';
      if(c==='3N')return 'Slutbud.';
      if(c==='2N')return 'Invit, 9-10 hp, 2+ stöd.';
      if(isBid(c)&&st_(c)!==o&&st_(c)!=='N'&&(lv(c)>=2))return 'Ny färg: 15-16 hp, rondkrav, minst 5-kortsfärg.';
      if(c==='P')return 'Pass: 0-8 hp.';
      return null};
    if(hp>=15){
      var ns=SU.filter(function(s){return s!==o&&L[s]>=5}).sort(function(a,b){return L[b]-L[a]})[0];
      if(ns) {exp=lowest(ns,oc);why=hp+' hp och 5+ '+SYM[ns]+': ny färg (krav).'}
    }
    if(!exp){
      if(hp<=8){exp='P';why='0-8 hp: pass.'}
      else if(hp>=9&&hp<=10){exp='2N';why='9-10 hp och 2+ stöd: 2NT invit.'}
      else if(hp>=14&&hp<=16){if(L[o]>=3){exp='3'+o;why='14-16 stp och 3+ stöd: 3 i färgen (invit).'}else{exp='P';why='14-16 hp utan stöd: pass.'}}
      else if(hp>=13&&L[o]>=5){exp='4'+o;why='13-16 stp och långt stöd: 4 i färgen (utgång).'}
      else{exp='P';why=hp+' hp utan lämpligt bud: pass.'}
    }
    return {exp:exp,alt:alt,why:why,means:means,conv:'svag tvåa',soft:true};
  }
  function open2w(h,oc,r){
    var o=st_(oc),hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(r==='2N'){if(c==='3'+o||c==='3D'||c==='3H')return 'Ombud: minimum (6-8 hp).';if(c==='3N'||c==='4'+o)return 'Maximum (9-10 hp).'}
      if(r==='3'+o){if(c==='P')return 'Pass: minimum (6-8 hp).';if(c==='4'+o)return 'Maximum (9-10 hp).'}
      if(r==='2N'&&c==='P')return 'Pass (efter minimumsinvit).';
      return null};
    if(r==='2N'){exp=hp<=8?'3'+o:'4'+o;alt=hp>=9&&maj(o)?['3N']:[];why=hp<=8?'6-8 hp: minimum, 3 i färgen.':'9-10 hp: maximum, 4 i färgen.';return {exp:exp,alt:alt,why:why,means:means,conv:'svag tvåa',soft:true}}
    if(r==='3'+o){exp=hp<=8?'P':'4'+o;alt=[];why=hp<=8?'6-8 hp: pass.':'9-10 hp: maximum, utgång 4 i färgen.';return {exp:exp,alt:alt,why:why,means:means,conv:'svag tvåa',soft:false};}
    return {exp:null,alt:[],why:'Fortsättningen beskrivs inte i dokumentet.',means:means,conv:'svag tvåa'};
  }

  /* ––––– ÖPPNARENS ANDRA BUD (Plus) ––––– */
  function reb1(h,oc,r){
    var o=st_(oc),hp=h.hp,L=h.L,rs=st_(r),exp,why,alt=[],soft=false;

    var splSuit = SU.filter(function(s){return s!==o&&s!==rs&&L[s]<=1})[0];
    var splBid = splSuit ? ((lv(r)+1)+splSuit) : null;

    var means=function(c){
      if(r==='2N'){var Ma=maj(o);
        if(c==='3N')return '12-15 hp, jämn hand utan 3-korts stöd.';
        if(c==='3'+o)return '16+ stp, stark hand.';
        if(isBid(c)&&lv(c)===3)return 'Singel i '+SYM[c[1]]+' (12-15 hp).';return null}
      if(c===splBid && hp>=13) return 'Splinter: singel/renons i '+SYM[splSuit]+' och 13+ stp.';
      if(rs===o&&lv(r)===2){if(c==='4'+o)return '19+ stp: utgång.';if(c==='3'+o)return '16-18 stp, naturlig invit.';if(isBid(c)&&lv(c)===3)return '16-18 stp med singel i den bjudna färgen.';if(c==='P')return 'Pass: 13-15 stp.'}
      if(rs!==o&&rs!=='N'&&c===lv(r)+1+rs)return 'Trumfstöd, lägsta höjning: 12-16 stp.';
      if(rs!==o&&rs!=='N'&&c===(lv(r)+2)+rs)return 'Trumfstöd, enkelhopp: 17-19 stp.';
      if(isBid(c)&&st_(c)===o&&rs!==o)return 'Egen färg.';
      if(c==='1N'||c==='2N'&&lv(r)===1&&r!=='1N')return c==='1N'?'12-14 hp, balanserad (NT på lägsta nivå).':'18-19 hp, balanserad (hopp i NT).';
      if(r==='1N'&&c==='2N')return '18-19 hp, balanserad (2NT när partnern bjöd 1NT).';
      if(r==='1N'&&c==='P')return 'Pass: 12-14 balanserad.';
      if(isBid(c)&&st_(c)!=='N'&&st_(c)!==o&&st_(c)!==rs)return 'Andra färg.';
      return null};

    if(r==='2N'){
      var sg=h.singles().filter(function(s){return L[s]===1&&s!==o});
      if(h.htp(o)>=16){exp='3'+o;why=h.htp(o)+' htp utan singel: 3 i färgen (16+ stp).';}
      else if(sg.length){var s1=sg[0];exp='3'+s1;why='Singel i '+SYM[s1]+': visa den på 3-nivå.';if(sg.length>1)alt=sg.slice(1).map(function(s){return '3'+s});soft=true}
      else if(h.bal||h.htp(o)<=15){exp='3N';why='12-15 hp, jämn hand eller utan singel: 3NT.'}
      else return {exp:null,alt:[],why:'Minimum utan singel och obalanserad: dokumentet anger inte budet.',means:means,conv:'Stenberg'};
      return {exp:exp,alt:alt,why:why,means:means,conv:'Stenberg',soft:soft};
    }
    if(rs===o){
      if(lv(r)===2&&maj(o)){var t=h.htp(o);
        if(t>=19){exp='4'+o;why=t+' htp: utgång.'}
        else if(t>=16){var sg2=h.singles().filter(function(s){return L[s]<=1&&s!==o});
          if(sg2.length){exp=lowest(sg2[0],r);alt=['3'+o];why=t+' htp med singel: ny färg 16-18.'}
          else{exp='3'+o;why=t+' htp utan singel: 3 i färgen (invit).'}}
        else{exp='P';why=t+' htp: högst 15, pass.'}
        return {exp:exp,alt:alt,why:why,means:means,conv:'trumfstöd',soft:true};}
      return {exp:null,alt:[],why:'Fortsättningen efter denna höjning beskrivs inte i dokumentet.',means:means,conv:'trumfstöd'};
    }
    var low=function(s){return lowest(s,r)};
    var sup=rs!=='N'&&L[rs]>=4;
    var side4=SU.filter(function(s){return s!==o&&L[s]>=4});
    if(sup){var tp=h.htp(rs);
      if(hp>=13 && splBid && L[rs]>=4){exp=splBid;why='Splinter: singel/renons i '+SYM[splSuit]+', 13+ stp.'}
      else if(tp<=16){exp=low(rs);why='4+ stöd i '+SYM[rs]+' och '+tp+' htp: lägsta höjning (12-16).'}
      else if(tp<=19){exp=jump(rs,r);why=tp+' htp med stöd: enkelhopp (17-19).'}
      else if(maj(rs)){exp='4'+rs;why=tp+' htp: hopp till utgång (20+).'}
      else return {exp:null,alt:[],why:'Med 20+ htp och lågfärgsstöd ska man först undersöka 3NT; dokumentet anger inte budet.',means:means,conv:'öppnarens 2:a bud'};
      soft=false;
    }else if(L[o]>=6&&!SU.some(function(s){return s!==o&&L[s]>=4})){
      if(hp<=14){exp=low(o);why='Egen 6+ färg utan sidofärg: lägsta nivå (12-14).'}
      else if(hp<=17){exp=jump(o,r);why='Egen 6+ färg: enkelhopp (15-17).'}
      else if(hp>=18){exp=maj(o)?'4'+o:NC('Dokumentet anger inte budet för denna hand.',means).exp;why='Egen 6+ högfärg, 18+: utgång.'}
      else return NC('Dokumentet anger inte budet för denna hand.',means);
    }else if(h.bal){
      if(r==='1N'){if(hp<=14){exp='P';why='Balanserad 12-14: pass efter partnerns 1NT.'}else if(hp>=18&&hp<=19){exp='2N';why='Balanserad 18-19: 2NT.'}else return NC('Dokumentet anger inte budet för denna styrka.',means)}
      else if(hp<=14){exp=low('N');why='Balanserad 12-14: NT på lägsta nivå.'}
      else if(hp>=18&&hp<=19){exp=jump('N',r);why='Balanserad 18-19: hopp i NT.'}
      else return NC('Dokumentet anger inte budet för balanserad hand med '+hp+' hp i denna situation.',means);
    }else{
      var s2=side4.filter(function(s){return s!==rs&&L[o]+L[s]>=9}).sort(function(a,b){return L[b]-L[a]})[0];
      if(s2){var x=low(s2),rev=SU.indexOf(s2)>SU.indexOf(o)&&lv(x)===2&&lv(r)===1;
        if(rev){if(h.htp(s2)>=18||hp>=18){exp=x;why='Reverse (andra färgen högre än första): 18+.'}else if(L[o]>=5){exp=low(o);why='Utan styrka för reverse: bjud om första färgen (visar 5+ färg).'}else return NC('Dokumentet anger inte budet.',means)}
        else if(hp>=18){exp=jump(s2,r);why='Hopp i andra färgen: 18+ htp med minst 5-4.'}
        else{exp=x;why='Andra färgen på lägsta nivå: 12-17 hp med 5-4.'}
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
    if(ours.some(function(x){return x.c==='1N'})){
      if(ours.some(function(x){return x.c==='2D'})&&ours.some(function(x){return x.c==='2H'}))return 'H';
      if(ours.some(function(x){return x.c==='2H'})&&ours.some(function(x){return x.c==='2S'}))return 'S';
    }
    return null;
  }
  // Fyr-essfråga utan trumf är bara avtalad i dessa uttryckliga sangsekvenser.
  // Övriga 4NT-bud utan fastställd trumf ska inte automatiskt tolkas som essfråga.
  function agreedNoTrumpAceAsk(bids,sideWanted){
    var ours=bids.filter(function(x){return side(x.s)===sideWanted&&x.c!=='P'&&x.c!=='X'&&x.c!=='XX'}).map(function(x){return x.c});
    var seq=ours.join(',');
    return seq==='1N,4N' ||
           seq==='1N,2C,2D,4N' ||
           seq==='2N,4N' ||
           seq==='2N,3C,3D,4N' ||
           seq==='2C,2D,2N,4N';
  }
  function rkcReply(h,T_){
    var kc=h.aces+(T_&&h.has(T_,13)?1:0);
    var q=!!(T_&&h.has(T_,12));
    var vd=h.singles().some(function(s){return h.L[s]===0});
    var exp,why;
    var means=function(c){
      if(!T_){
        if(c==='5C')return '0 ess av 4.';
        if(c==='5D')return '1 ess av 4.';
        if(c==='5H')return '2 ess av 4.';
        if(c==='5S')return '3 ess av 4.';
        if(c==='5N')return '4 ess av 4.';
        return null;
      }
      if(c==='5C')return '0 eller 3 ess (av 5).';
      if(c==='5D')return '1 eller 4 ess (av 5).';
      if(c==='5H')return '2 ess utan trumfdam.';
      if(c==='5S')return '2 ess med trumfdam.';
      if(c==='5N')return '3 ess och renons.';
      return null;
    };

    if (T_) {
        if (kc === 0 || kc === 3) exp = (kc === 3 && vd) ? '5N' : '5C';
        else if (kc === 1 || kc === 4) exp = '5D';
        else exp = q ? '5S' : '5H';
    } else {
        if (h.aces === 0) exp = '5C';
        else if (h.aces === 1) exp = '5D';
        else if (h.aces === 2) exp = '5H';
        else if (h.aces === 3) exp = '5S';
        else exp = '5N';
    }

    why = T_ ? (kc + ' ess inklusive trumfkungen. Svar enligt 0314.') : (h.aces + ' av de fyra essen. Svar enligt fyr-essfråga utan trumf.');
    return {exp:exp,alt:[],why:why,means:means,conv:T_?'Blackwood 5 ess':'Fyr-essfråga utan trumf'};
  }
  function rkcNextStep(h,T_,r){
    var exp,why;
    var means=function(c){
      if(c==='5N')return 'Frågar efter trumfdamen (eller antal kungar i sang).';
      if(c==='6'+T_)return 'Lillslam i trumffärgen.';
      if(c==='7'+T_)return 'Storslam i trumffärgen.';
      if(c==='6N')return 'Lillslam i sang.';
      if(c==='7N')return 'Storslam i sang.';
      if(c==='P')return 'Pass.';
      return null;
    };
    if (T_) {
        if (r === '5N') {
            if (h.has(T_, 12)) {
                if (h.kings >= 3) { exp = '7'+T_; why = 'Trumfdamen och alla kungar finns: Storslam.'; }
                else { exp = '6'+T_; why = 'Trumfdamen finns, men kungar saknas: Lillslam.'; }
            } else {
                exp = '6'+T_; why = 'Trumfdamen saknas: Lillslam.';
            }
        } else if (r === '6'+T_ || r === '7'+T_) {
            exp = 'P'; why = 'Slutbud.';
        } else {
            exp = '6'+T_; why = 'Lillslam.';
        }
    } else {
        // I fyr-essvarianten är 5NT svaret som visar alla fyra ess.
        // Det går därför inte att använda 5NT som kungfråga efter det svaret.
        if (r === '5N') {
            exp = '6N'; why = 'Alla fyra ess finns. Bjud 6NT och avsluta budgivningen; ingen kungfråga används.';
        } else if (/^5[CDHS]$/.test(r)) {
            exp = '5N'; why = 'Svaret visar färre än fyra ess. 5NT används som sangslutbud, inte som kungfråga.';
        } else if (r === '6N' || r === '7N') {
            exp = 'P'; why = 'Slutbud.';
        } else if (r === 'P') {
            exp = 'P'; why = 'Pass efter fastställt sangslutbud.';
        } else {
            exp = '6N'; why = 'Lillslam i sang.';
        }
    }
    return {exp:exp,alt:[],why:why,means:means,conv:T_?'Blackwood 5 ess':'Fyr-essfråga utan trumf'};
  }

  /* ––––– INKLIV / DUBBLING / STÖDDUBBLING ––––– */
  function overcall(h,ob,last){
    var hp=h.hp,L=h.L,os=ob[1],lvl=lv(ob),exp,why,alt=[];
    var means=function(c){
      if(c==='X')return 'Upplysningsdubbling: 12+ hp och minst 3 kort i objudna färger.';
      if(c==='1N')return 'Inkliv 1NT: 15-17 hp och håll i öppningsfärgen.';
      if(c==='P')return 'Pass.';
      if(isBid(c)&&c[1]!=='N'){var lo=lowest(c[1],ob);
        if(c===lo)return 'Enkelt inkliv: 12-17 hp, 5+ färg'+(lv(c)===2?' (2-nivån kräver normalt 6+ färg)':'')+'.';
        if(lv(c)===lv(lo)+1)return 'Hoppande inkliv: 6-10 hp och 6+ färg.'}
      if(c==='2N')return 'Försvar mot spärr: 16-18 hp balanserad.';
      return null};
    if(lvl>=2){
      var un=SU.filter(function(s){return s!==os});var tk=hp>=12&&un.every(function(s){return L[s]>=3})&&L[os]<=2;
      if(tk||hp>=18){exp='X';why='Mot spärröppning: dubbling = upplysningsdubbling eller 18+.'}
      else if(h.bal&&hp>=15&&hp<=18&&ok('2N',last)){exp='2N';why='15-18 balanserad: 2NT.'}
      else{exp='P';why='Ingen dubblingshand: pass.'}
      return {exp:exp,alt:alt,why:why,means:means,conv:'dubbling',soft:true};
    }
    var un2=SU.filter(function(s){return s!==os});
    var takeout=hp>=12&&un2.every(function(s){return L[s]>=3})&&L[os]<=2;
    var five=un2.filter(function(s){return L[s]>=5}).sort(function(a,b){return L[b]-L[a]||(SU.indexOf(b)-SU.indexOf(a))})[0];
    var okOver=function(s){var x=lowest(s,ob);return lv(x)<=2&&(lv(x)>1||hp>=10&&h.good(s)||!maj(s)&&hp>=12)&&(hp>=12||(lv(x)===1&&maj(s)&&hp>=10&&h.good(s)))};
    if(hp>=18&&(takeout||true)&&h.bal===false&&hp>=17&&five===undefined&&!takeout){exp='X';why='18+ hp: dubbling visar alla fördelningar.'}
    else if(hp>=15&&hp<=17&&h.bal&&h.stop(os)&&ok('1N',ob)&&lvl===1){exp='1N';why='15-17 hp balanserad med håll i '+SYM[os]+': 1NT.';if(takeout)alt.push('X')}
    else if(takeout&&!(five&&okOver(five))){exp='X';why='12+ hp med minst 3 kort i objudna färger och kort i '+SYM[os]+': upplysningsdubbling.'}
    else if(five&&okOver(five)){exp=lowest(five,ob);why=hp+' hp och 5+ '+SYM[five]+': enkelt inkliv.';if(takeout)alt.push('X')}
    else if(hp>=6&&hp<=10&&un2.some(function(s){return L[s]>=6})){var s6=un2.filter(function(s){return L[s]>=6})[0];exp=jump(s6,ob);why='6-10 hp och 6+ '+SYM[s6]+': hoppande inkliv.'}
    else{exp='P';why='Ingen inklivshand ('+hp+' hp): pass.'}
    return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
  }
  function respOvercall(h,oc,last,ob){
    var s=st_(oc),os=ob?ob[1]:null,L=h.L,hp=h.hp,exp,why,alt=[];
    var means=function(c){
      if(c==='1N')return '9-12 hp, balanserad, håll i öppningsfärgen.';if(c==='2N')return '10-12 hp, balanserad, bra håll.';if(c==='3N')return '13-16 hp, balanserad, bra håll.';
      if(isBid(c)&&c[1]===s){var d=lv(c)-lv(oc);return d===1?(lv(oc)===1?'Enkel höjning: 6-10 stp, 3-korts stöd.':'Enkel höjning: 8-11 stp, 3-korts stöd.'):d===2?('Dubbel höjning: '+(lv(oc)===1?'8-11 stp':'11-12 stp')+', 4-korts stöd.'):'Trippel höjning: 8-11 stp, 5-korts stöd.'}
      if(isBid(c)&&c[1]===os)return 'Överbud (deras färg): 10+ hp och 3+ stöd.';
      if(isBid(c)&&c[1]!=='N')return lv(c)>lv(lowest(c[1],last))?'Hopp i ny färg: 14+ hp, bra 6+ färg, utgångskrav.':'Ny färg: 10+ hp, 5+ färg, rondkrav.';
      if(c==='P')return 'Pass.';return null};
    if(L[s]>=3&&hp<=7&&lv(oc)===1){var t=L[s]>=5?3:L[s]>=4?2:1;var e=(lv(oc)+t)+s;if(ok(e,last)&&lv(e)<=4){exp=e;why=L[s]+' kort stöd och '+hp+' hp: '+(t===1?'enkel':t===2?'dubbel':'trippel')+' höjning.'}}
    if(!exp&&L[s]>=3&&hp>=8&&hp<=11&&lv(oc)===2){var t2=L[s]>=5?2:1;var e2=(lv(oc)+t2)+s;if(ok(e2,last)){exp=e2;why=L[s]+' kort stöd och '+hp+' stp: höjning.'}}
    if(!exp&&L[s]>=3&&hp>=10&&os&&lv(oc)===1){exp=lowest(os,last);why='10+ hp och 3+ stöd: överbud i deras färg.'}
    if(!exp&&h.bal&&hp>=9&&hp<=12&&h.stop(os)&&ok('1N',last)){exp='1N';why='9-12 hp med håll: 1NT.'}
    if(!exp&&h.bal&&hp>=10&&hp<=12&&h.stop(os)&&ok('2N',last)){exp='2N';why='10-12 hp med håll: 2NT.'}
    if(!exp&&h.bal&&hp>=13&&hp<=16&&h.stop(os)&&ok('3N',last)){exp='3N';why='13-16 hp med håll: 3NT.'}
    return {exp:exp||null,alt:[],why:why||'Dokumentet anger inte budet för denna hand.',means:means,conv:'inkliv',soft:true};
  }
  function respDouble(h,ob,last){
    var os=ob[1],L=h.L,hp=h.hp,exp,why,alt=[];
    var un=SU.filter(function(s){return s!==os});
    var means=function(c){
      if(c==='1N')return '6-10 hp och håll i öppningsfärgen.';if(c==='2N')return '11-12 hp och håll i öppningsfärgen.';if(c==='3N')return '13-16 hp och håll i öppningsfärgen.';
      if(c==='P')return 'Pass: bara med många kort i öppningsfärgen.';
      if(isBid(c)&&c[1]===os)return 'Överbud: 10+ hp, krav.';
      if(isBid(c)&&c[1]!=='N'){var lo=lowest(c[1],ob);return c===lo?'Färg på lägsta nivå: 0-9 hp, okrav.':lv(c)===lv(lo)+1?(lv(c)>=3?'Hopp till 3-läget: 11-12 stp, 5+ färg.':'Hopp i färg: 6-10 stp, 5+ färg.'):null}
      return null};
    var best=un.slice().sort(function(a,b){return L[b]-L[a]||SU.indexOf(b)-SU.indexOf(a)})[0];
    if(L[os]>=5&&h.good(os)){exp='P';why='Många kort i öppningsfärgen: pass är rätt.'}
    else if(hp<=9){exp=lowest(best,ob);why='0-9 hp: färg på lägsta nivå ('+SYM[best]+').'}
    else if(hp<=12){if(L[best]>=5&&lv(lowest(best,ob))<3){exp=(3)+best;alt=[lowest(os,ob)];why='11-12 stp och 5+ färg: hopp till 3-läget.'}else if(h.bal&&h.stop(os)){exp='2N';alt=[lowest(os,ob)];why='11-12 hp med håll: 2NT.'}else{exp=lowest(os,ob);why='10+ hp: överbud i deras färg (krav).'}}
    else if(hp<=16){if(L[best]>=5&&lv(lowest(best,ob))<=2){exp=lowest(best,ob);alt=[lowest(os,ob)];why='6-10 stp: hopp till 2-läget.'}else if(h.bal&&h.stop(os)){exp='3N';alt=[lowest(os,ob)];why='13-16 hp med håll: 3NT.'}else{exp=lowest(os,ob);why='10+ hp: överbud i deras färg (krav).'}}
    else{if(h.bal&&h.stop(os)){exp='3N';alt=[lowest(os,ob)];why='13-16 hp med håll: 3NT.'}else{exp=lowest(os,ob);why='10+ hp: överbud i deras färg (krav).'}}
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
      if(totalHcp>=26)return {exp:'3N',alt:[],why:totalHcp+' gemensamma honnörspoäng: utgång i sang enligt 26-poängsgränsen.',means:means,conv:'svar efter öppnarens återbud'};
      if(totalHcp>=22)return {exp:'2N',alt:[],why:totalHcp+' gemensamma honnörspoäng: invit i sang.',means:means,conv:'svar efter öppnarens återbud'};
      return {exp:'P',alt:[],why:totalHcp+' gemensamma honnörspoäng: under invitnivån efter balanserat återbud.',means:means,conv:'svar efter öppnarens återbud'};
    }

    // C. Öppnaren har visat minst sex kort i sin egen färg.
    if(rb===first&&oh.L[first]>=6){
      fit= L[first]+oh.L[first];
      if(fit>=8){
        total=partnershipPoints(h,oh,first);threshold=maj(first)?26:28;
        if(total>=threshold)return {exp:maj(first)?'4'+first:'5'+first,alt:[],why:fit+'-korts fit i '+SYM[first]+' och '+total+' gemensamma spelpoäng: utgång.',means:means,conv:'svar efter öppnarens återbud'};
        if(total>=threshold-4)return {exp:'3'+first,alt:[],why:fit+'-korts fit och '+total+' gemensamma spelpoäng: invit.',means:means,conv:'svar efter öppnarens återbud'};
        return {exp:'P',alt:[],why:fit+'-korts fit men '+total+' gemensamma spelpoäng: pass.',means:means,conv:'svar efter öppnarens återbud'};
      }
      if(totalHcp>=26)return {exp:'3N',alt:[],why:'Ingen tillräcklig fit. '+totalHcp+' gemensamma honnörspoäng: 3NT.',means:means,conv:'svar efter öppnarens återbud'};
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
  function nodeFor(st,i){
    var b=st.bids[i],me=b.s,pt=partner(me),prior=st.bids.slice(0,i),h=H(st.hands[me]);
    var last=lastBidCode(prior);
    var ours=prior.filter(function(x){return side(x.s)===side(me)&&x.c!=='P'});
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
    for(var k=1;k<ours.length;k++)if(ours[k].s===ours[k-1].s)return nc('Budgivningen följer inte ett turordnat mönster som dokumentet beskriver.');
    if(ours[ours.length-1].s!==pt)return nc('Budgivningen följer inte ett turordnat mönster som dokumentet beskriver.');
    var d=ours.length,opener=ours[0].s===me,f=ours[0].c;
    var c1=f,fs=c1[1]; // Deklareras nu här för att undvika bugg

    var trumpForSide=rkcTrumpFromAuction(prior,side(me));
    if(b.c==='4N'){
      if(trumpForSide){
        return {exp:'4N',alt:[],why:'Essfråga (Blackwood 5 ess) med '+SYM[trumpForSide]+' som fastställd trumf.',means:function(c){return c==='4N'?'Essfråga (Blackwood 5 ess).':null},conv:'Blackwood 5 ess'};
      }
      if(agreedNoTrumpAceAsk(prior.concat([{s:me,c:'4N'}]),side(me))){
        return {exp:'4N',alt:[],why:'Avtalad fyr-essfråga utan fastställd trumf. 5♣–5NT visar 0–4 ess.',means:function(c){return c==='4N'?'Fyr-essfråga i sang enligt överenskommen sekvens.':null},conv:'Fyr-essfråga utan trumf'};
      }
      return NC('4NT utan fastställd trumf är inte automatiskt essfråga. I andra sangsekvenser behandlas 4NT som kvantitativt eller enligt parets särskilda överenskommelse.');
    }

    var partnerAskIndex=-1;
    for(var pai=prior.length-1;pai>=0;pai--)if(prior[pai].s===pt&&prior[pai].c==='4N'){partnerAskIndex=pai;break;}
    if(partnerAskIndex>=0){
      var afterPartnerAsk=prior.slice(partnerAskIndex+1).filter(function(x){return x.s===me&&isBid(x.c)});
      if(!afterPartnerAsk.length)return rkcReply(h,rkcTrumpFromAuction(prior,side(me)));
      // Svarshanden har redan svarat; efter frågeställarens sangslutbud ska den passa.
      if(b.c==='P')return {exp:'P',alt:[],why:'Pass efter att frågeställaren har fastställt sangslutbudet.',means:function(c){return c==='P'?'Pass.':null},conv:'Fyr-essfråga utan trumf'};
    }
    var myAskIndex=-1;
    for(var mai=prior.length-1;mai>=0;mai--)if(prior[mai].s===me&&prior[mai].c==='4N'){myAskIndex=mai;break;}
    if(myAskIndex>=0){
      var afterMyAsk=prior.slice(myAskIndex+1).filter(function(x){return x.s===pt&&isBid(x.c)});
      if(afterMyAsk.length){
        var response=afterMyAsk[0].c;
        if(isBid(b.c) && /^([56][CDHSN])$/.test(b.c))return rkcNextStep(h,rkcTrumpFromAuction(prior,side(me)),response);
        if(b.c==='P' && (last==='6N'||last==='7N'||last==='5N'))return {exp:'P',alt:[],why:'Pass efter fastställt sangslutbud.',means:function(c){return c==='P'?'Pass.':null},conv:'Fyr-essfråga utan trumf'};
      }
    }

    if(oppBefore.length){
      if(d===1&&!oppAfter.length&&oppBefore.length===1){
        if(f==='X')return respDouble(h,oppBefore[0].c,last);
        if(f==='1N')return ntResp(h,0);
        if(isBid(f))return respOvercall(h,f,last,oppBefore[0].c);
      }
      return nc('Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet.');
    }

    // Motståndarinblandning efter 1NT-öppning
    if(oppAfter.length){
      if (c1=== '1N' && d===1 && oppAfter.length===1) {
          var oppBid = oppAfter[0].c;
          if (!opener) {
              if (b.c==='X') return {exp:'X', alt:[], why:'Upplysningsdubbling: invit+, 3+ i objudna färger.', conv:'dubbling'};
              if (isBid(b.c) && st_(b.c) !== 'N') {
                  if (lv(b.c) === 2) return {exp:b.c, alt:[], why:'Naturligt, invit med 5+ färg (Stayman/överföring avstängt).', conv:'inkliv'};
                  if (lv(b.c) === 3) return {exp:b.c, alt:[], why:'Naturligt, utgångskrav med 5+ färg.', conv:'inkliv'};
              }
          }
      }

      if (d===1 && oppAfter.length===1 && opener && b.c==='X') {
          if (h.L[st_(f)] === 3) return {exp:'X', alt:[], why:'Stöddubbling: exakt 3-korts stöd i öppningsfärgen.', conv:'dubbling'};
          return {exp:'X', alt:[], why:'Dubbling visar 3-korts stöd (du har '+h.L[st_(f)]+').', conv:'dubbling'};
      }
      if (d===1 && oppAfter.length===1 && !opener && b.c==='X') {
          var os = oppAfter[0].c[1];
          var un = SU.filter(function(s){return s!==os});
          var has4 = un.filter(function(s){return h.L[s]===4});
          if (has4.length > 0) return {exp:'X', alt:[], why:'Negativ dubbling: visar 4-korts '+SYM[has4[0]]+'.', conv:'dubbling'};
          return {exp:'X', alt:[], why:'Negativ dubbling: visar 4-kort i objuden högfärg.', conv:'dubbling'};
      }
      return nc('Motståndarna lade sig i: fortsättningen beskrivs inte i dokumentet.');
    }

    if(d>=3 && /^1[CDHS]$/.test(ours[0].c)){
      var s1=ours[0].c[1], s2=ours[1].c[1];

      if(d===3 && !opener && ours[2].c === '2'+s1 && isBid(b.c) && b.c[1]!==s1 && b.c[1]!==s2 && b.c[1]!=='N'){
        if(hp>=13) return {exp:b.c,alt:[],why:'Fjärde färg (konstgjort): 13+ hp, utgångskrav. Berättar inget om färgen.',means:function(c){return c===b.c?'Fjärde färg (utgångskrav).':null},conv:'Fjärde färg'};
        if(hp>=10) return {exp:b.c,alt:[],why:'Tredje färg: 10+ hp, rondkrav. Kan bjudas med 3 kort om det är ett håll.',means:function(c){return c===b.c?'Tredje färg (rondkrav).':null},conv:'Tredje färg'};
        return NC('Tredje färg kräver minst 10 hp.', null, 'Tredje färg');
      }

      var openerShowsTwoSuits = isBid(ours[2].c) &&
        ours[2].c[1] !== s1 && ours[2].c[1] !== 'N' &&
        h.L[s1] >= 4 && h.L[ours[2].c[1]] >= 4;
      if(d===4 && opener && (ours[2].c === '2'+s1 || openerShowsTwoSuits) &&
         isBid(ours[3].c) && ours[3].c[1]!==s1 &&
         ours[3].c[1]!==s2 && ours[3].c[1]!=='N'){
         var s3 = ours[3].c[1];
         if (h.stop(s3)) {
             if (hp <= 14) return {exp:'2N', alt:[], why:'Håll i fjärde färgen, minimum: 2NT.', conv:'Fjärde färg'};
             return {exp:'3N', alt:[], why:'Håll i fjärde färgen, maximum: 3NT.', conv:'Fjärde färg'};
         }
         if (h.L[s2] >= 3) return {exp:lowest(s2, b.c), alt:[], why:'Trumfstöd i partnerns första färg.', conv:'Fjärde färg'};
         if (h.L[s1] >= 6) return {exp:lowest(s1, b.c), alt:[], why:'Bjuder om egen färg.', conv:'Fjärde färg'};
         return {exp:lowest(s2, b.c), alt:[], why:'Preferens till partnerns första färg.', conv:'Fjärde färg'};
      }
    }

    if(c1==='1N'||c1==='2N'){var k=c1==='2N'?1:0;
      if(c1==='1N'&&!opener&&d===2){
        var opening=prior.filter(function(x){return x.s===pt&&isBid(x.c)&&/^1[CDHS]$/.test(x.c)})[0];
        var openerRebid=prior.filter(function(x){return x.s===pt&&isBid(x.c)&&x!==opening}).slice(-1)[0];
        if(opening&&openerRebid)return respAfter1NT(h,opening.c,openerRebid.c,b.c);
      }
      if(!opener&&d===1)return ntResp(h,k);
      if(opener&&d===2)return ntOpener(h,k,ours[1].c);
      if(!opener&&d===3&&!k){var m1=ours[1].c,rep=ours[2].c;
        if(m1==='2C')return stay2(h,rep);
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
        if((t1==='2D'&&t2==='2H')||(t1==='2H'&&t2==='2S'))return ntOpenerInvit(h,t1==='2D'?'H':'S',ours[3].c);
        return ntOpener3(h,ours[1].c,ours[2].c,ours[3].c);
      }
      return nc('Fortsättningen i 1NT/2NT-systemet beskrivs inte i dokumentet.');
    }
    if(c1==='2C'){
      if(!opener&&d===1)return resp2c(h);
      if(opener&&d===2)return reb2c(h,ours[1].c);
      if(!opener&&d===3){var rb=ours[2].c;if(rb==='2N')return ntResp(h,1);return resp2c2(h,rb,ours[1].c)}
      return nc('Fortsättningen i 2♣-systemet beskrivs inte i dokumentet.');
    }
    if(/^2[DHS]$/.test(c1)){
      if(!opener&&d===1)return resp2w(h,c1);
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
      if(!opener&&d===3&&ours[1].c==='1N')
        return respAfter1NT(h,ours[0].c,ours[2].c,b.c);
      if(!opener&&d===3){
        var openerHand=st.hands[pt];
        return responderSecondBid(h,ours[0].c,ours[1].c,ours[2].c,openerHand);
      }
      if(!opener&&d===1)return resp1(h,c1);
      if(opener&&d===2)return reb1(h,c1,ours[1].c);
      if(!opener&&d===3&&isBid(ours[2].c) && ours[2].c[1]!=='N') {
         var M = st_(ours[0].c);
         if (ours[2].c[1] !== M && ours[2].c[1] !== 'N' && ours[2].c[0] >= '3') {
             if (b.c === '4'+M) return {exp:'4'+M, alt:[], why:'Slutbud (minimum).', conv:'splinter'};
             if (b.c === '3'+M) return {exp:'3'+M, alt:[], why:'Slamintresse (stark hand).', conv:'splinter'};
         }
      }
      return nc('Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet.');
    }
    return nc('Okänd budgivning.');
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
      'Blackwood 5 ess':'Blackwood 5 ess (0314) används när trumf är fastställd. 5♣ = 0 eller 3, 5♦ = 1 eller 4, 5♥ = 2 utan dam, 5♠ = 2 med dam. Efter 5NT kan fortsatt budgivning följa RKC-reglerna för fastställd trumf.',
      'Fyr-essfråga utan trumf':'Fyr-essfråga utan fastställd trumf används bara i uttryckligen överenskomna sangsekvenser: 1NT–4NT, 1NT–2♣–2♦–4NT, 2NT–4NT, 2NT–3♣–3♦–4NT och 2♣–2♦–2NT–4NT. 5♣ = 0 ess, 5♦ = 1 ess, 5♥ = 2 ess, 5♠ = 3 ess, 5NT = 4 ess. Efter 5NT bjuder frågeställaren 6NT och därefter pass. Ingen kungfråga används.',
      'inkliv':'Ett inkliv visar normalt 12–17 hp och minst 5 kort i färgen (2-nivån kräver 6 kort). 1NT-inkliv visar 15–17 hp och håll i öppningsfärgen. Vid inkliv efter 1NT stängs Stayman/överföring av. Ny färg 2-nivå = invit, 3-nivå = krav.',
      'dubbling':'Upplysningsdubbling (UD) visar minst 12 hp och 3+ kort i objudna färger. Negativ dubbling (av SH) visar 6+ hp och 4-korts objuden högfärg. Stöddubbling (av ÖH) visar exakt 3-korts stöd. Dubbelt efter 1NT-inkl = UD, invit+.',
      'svar efter 1NT':'Efter 1 i färg–1NT och öppnarens återbud finns ett uttryckligt undantag: svarshandens andra färgbud kan vara 6–9 hp och minst 6 kort, utan att vara krav.',
      'Tredje färg':'Tredje färg är ett rondkrav som lovar minst 10 hp. Det kan bjudas med bara 3 kort om det är ett håll (t.ex. D-x-x).',
      'Fjärde färg':'Fjärde färg är ett konstgjort utgångskrav som lovar minst 13 hp. Det berättar ingenting om färgen man bjuder, utan ber partnern beskriva sin hand ytterligare.',
      'spärr':'Spärrbudet visar en lång färg och begränsad styrka. Ny färg är krav. 3NT kan vara rätt slutbud om partnern har en lång lågfärg.',
      'splinter':'Splinterbudet visar singel/renons i den bjudna färgen, 4+ trumfstöd och 19-21 stp. Efter splinter kan SH bjuda 3M (slamintresse) eller 4M (minimum).',
      'överbud':'Överbud (Cuebid) i motståndarens färg visar 10+ hp och 3+ trumfstöd. Det är ett kravbud.'
    };
    var detail=extra[conv]||'Budets betydelse ska läsas tillsammans med den föregående budgivningen.';
    return short ? short+'\n\n'+detail : detail;
  }

  function verdictOf(node,act){
    var short=node.means(act)||'Budet ingår inte i dokumentets system i den här situationen.';
    var o={bedomning:'ej_täckt',motivering:node.why||'',forklaring:expandedMeaning(short,node.conv||'övrigt',act),konvention:node.conv||'övrigt',battre:''};
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
    var pt=partner(b.s),a=H(st.hands[b.s]),p=H(st.hands[pt]);
    var majors=['H','S'].filter(function(x){return a.L[x]+p.L[x]>=8;});
    majors.sort(function(x,y){return (a.L[y]+p.L[y])-(a.L[x]+p.L[x]);});
    var minors=['C','D'].filter(function(x){return a.L[x]+p.L[x]>=8;});
    minors.sort(function(x,y){return (a.L[y]+p.L[y])-(a.L[x]+p.L[x]);});
    var balanced=a.bal&&p.bal;
    var trump=majors.length?majors[0]:(minors.length?minors[0]:'N');
    var total=partnershipPoints(a,p,trump);
    var gameReached=(st_(currentContract)==='N'&&lv(currentContract)>=3)||
      (maj(st_(currentContract))&&lv(currentContract)>=4)||
      (!maj(st_(currentContract))&&st_(currentContract)!=='N'&&lv(currentContract)>=5);
    if(total>=33&&lv(currentContract)<6){
      var slamTarget=majors.length?'6'+majors[0]:(balanced?'6N':minors.length?'6'+minors[0]:'6N');
      if(rk(slamTarget)<=rk(currentContract)){
        var alternatives=['6N','6H','6S','6C','6D'];
        slamTarget=alternatives.filter(function(x){return rk(x)>rk(currentContract);})[0]||null;
      }
      if(!slamTarget)return null;
      var basis=trump==='N'?'sang, endast honnörspoäng':'trumfkontrakt med fördelningspoäng och trumflängdsbonus';
      return {target:slamTarget,why:'Partnerskapets sammanlagda styrka är '+total+' poäng ('+basis+'). Med 33+ poäng ska slam undersökas. Val av trumf/sang beror på fit och fördelning; pass under lillslam avslutar för tidigt.'};
    }
    var threshold=trump==='N'?26:(maj(trump)?26:28);
    if(total>=threshold&&!gameReached){
      var preferred=trump==='N'?'3N':(maj(trump)?'4'+trump:'5'+trump);
      var choices=[preferred,'3N','4H','4S','5C','5D'];
      var target=choices.filter(function(x,j,arr){return arr.indexOf(x)===j&&rk(x)>rk(currentContract);})[0];
      if(!target)return null;
      var thresholdText=trump==='N'?'26+ hp utan färgfit; sang räknas enbart med honnörspoäng':(maj(trump)?'26+ spelpoäng med minst 8-korts högfärgsfit':'28+ spelpoäng med minst 8-korts lågfärgsfit');
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
      var suit=isBid(b.c)?st_(b.c):null;
      var agreed=null;
      for(var ai=i;ai>=0;ai--){
        if(bids[ai].s===b.s && isBid(bids[ai].c) && bids[ai].c[1]!=='N'){agreed=bids[ai].c[1];break;}
      }
      item.hp=hand.hp;item.htp=suit?hand.htp(suit):hand.hp;item.langd=hand.L;
      if(agreed && hand.L[agreed]+partnerHand.L[agreed]>=8){
        item.handtyp='Trumfstöd ('+SYM[agreed]+')';
      }else{
        var lens=[hand.L.C,hand.L.D,hand.L.H,hand.L.S].sort(function(a,b){return b-a});
        if(hand.bal)item.handtyp='Jämn fördelning ('+hand.shape+')';
        else if(lens[0]>=6)item.handtyp='Enfärgshand';
        else if(lens[0]>=5&&lens[1]>=4)item.handtyp='Tvåfärgshand';
        else item.handtyp='Obalanserad hand';
      }
      if(!(side(b.s)===1&&b.c==='P'))items.push(item);
    }
    var status=structural.ended?'Budgivningen är avslutad.':bids.length?'Budgivningen är inte avslutad – inväntar fler bud.':'Ingen budgivning registrerad.';
    return {items:items,summary:'Rätt '+right+' · Fel '+wrong+' · Valfritt '+optional+' · Ej täckt '+uncovered+' (Norr och Syd).',auction:{valid:structural.valid,ended:structural.ended,dealer:structural.dealer,contract:structural.contractText,status:status,errors:structural.errors.map(function(e){return 'Bud '+(e.index+1)+': '+e.message})}};
  }

  return {judge:judgeComplete,H:H,nodeFor:nodeFor,txt:txt,validateAuction:validateAuction,version:'5.3'};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Rattning;
if(typeof window!=='undefined')window.Rattning=Rattning;
