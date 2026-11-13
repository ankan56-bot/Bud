/*
 * Fristående export av rättningsmotorn/beslutsträdet.
 * Källa: Budtraning.html, feature/two-player-dds.
 * Användning: Rattning.judge({hands, dealer, bids})
 */
var Rattning=(function(){
var SU=['C','D','H','S'],SYM={C:'♣',D:'♦',H:'♥',S:'♠',N:'NT'},NAME={N:'Norr',E:'Öst',S:'Syd',W:'Väst'};
function side(s){return s==='N'||s==='S'?0:1}
function partner(s){return {N:'S',S:'N',E:'W',W:'E'}[s]}
function isBid(c){return /^[1-7][CDHSN]$/.test(c)}
function lv(c){return +c[0]}function st_(c){return c[1]}
function rk(c){return lv(c)*5+'CDHSN'.indexOf(c[1])}
function txt(c){return c==='P'?'Pass':(c==='X'||c==='XX')?c:c[0]+SYM[c[1]]}
function maj(s){return s==='H'||s==='S'}
function lowest(s,above){for(var l=1;l<=7;l++){var c=l+s;if(!above||rk(c)>rk(above))return c}return null}
function jump(s,above){var c=lowest(s,above);return c&&lv(c)<7?(lv(c)+1)+s:null}
function H(cards){
  var L={C:0,D:0,H:0,S:0},hp=0,top={C:[],D:[],H:[],S:[]},aces=0;
  cards.forEach(function(k){var n=+k.slice(1),s=k[0];L[s]++;top[s].push(n);if(n>=11)hp+=n-10;if(n===14)aces++});
  var sh=[L.S,L.H,L.D,L.C].sort(function(a,b){return b-a}).join('');
  var o={L:L,hp:hp,top:top,aces:aces,shape:sh,bal:['4333','4432','5332'].indexOf(sh)>=0};
  o.htp=function(t){var x=hp;SU.forEach(function(s){if(s!==t){var n=L[s];x+=n===0?3:n===1?2:n===2?1:0}});return x};
  o.has=function(s,n){return top[s].indexOf(n)>=0};
  o.stop=function(s){return o.has(s,14)||(o.has(s,13)&&L[s]>=2)||(o.has(s,12)&&L[s]>=3)||(o.has(s,11)&&L[s]>=4)};
  o.good=function(s){var t=top[s],c=[14,13,12].filter(function(n){return t.indexOf(n)>=0}).length,d=[14,13,12,11,10].filter(function(n){return t.indexOf(n)>=0}).length;return c>=2||d>=3};
  // Bra färg för 11 hp-öppning enligt användarens precisering: 6 kort + 3 honnörer eller 7 kort + 2 honnörer. Honnörer = A, K, Q, J; 10 räknas som mellankort.
  o.goodForEleven=function(s){var n=L[s],hon=[14,13,12,11].filter(function(r){return top[s].indexOf(r)>=0}).length;return (n===6&&hon>=3)||(n===7&&hon>=2)};
  o.longest=function(){return Math.max(L.C,L.D,L.H,L.S)};
  o.singles=function(){return SU.filter(function(s){return L[s]<=1})};
  return o;
}
/* Nod: {exp:kod|null, alt:[], why:'', means:function(kod), conv:'', soft:bool} */
function T(m){return function(c){return m[c]||null}}
function ok(c,last){return c==='P'||c==='X'||c==='XX'||(isBid(c)&&(!last||rk(c)>rk(last)))}
function NC(why,means,conv){return {exp:null,alt:[],why:why||'Situationen beskrivs inte i dokumentet.',means:means||function(){return null},conv:conv||'övrigt'}}

/* ---------- ÖPPNING ---------- */
function openingNode(h){
  var hp=h.hp,L=h.L,m=h.longest(),exp,alt=[],why;
  var cs=SU.filter(function(s){return L[s]===m}),pick;
  if(m>=5){pick=cs[cs.length-1];if(cs.length>1&&pick==='S'&&cs.indexOf('C')>=0)alt.push('1C')}
  else{var f=SU.filter(function(s){return L[s]===4});pick=f[0]}
  var one='1'+pick;
  if(hp>=12&&hp<=21&&L.H>=5&&L.C>=4){exp='2C';why=hp+' htp med minst 5 hjärter och 4 klöver: naturlig tvåfärgsöppning 2♣ enligt avsnitt D.'}
  else if(h.bal&&hp>=22&&hp<=27){exp='2C';why='Balanserad med '+hp+' hp: 2♣ (22-24 balanserad, starkare via 2♣).'}
  else if(h.bal&&hp>=20&&hp<=21){exp='2N';why='Balanserad 20-21 hp öppnas 2NT.'}
  else if(h.bal&&hp>=15&&hp<=17){exp='1N';why='Balanserad (fördelning '+h.shape+') med 15-17 hp öppnas 1NT.'}
  else if(hp>=22){exp='2C';why=hp+' hp är utgångskrav: öppna 2♣.'}
  else if(hp>=20){exp='2C';alt=[one];why=hp+' hp obalanserad är starkare än 1 i färg (12-19): 2♣, utgångskrav.'}
  else if(hp>=12){exp=one;why=hp+' hp med längsta färgen '+SYM[pick]+' ('+L[pick]+' kort): 1 i färg (12-19 hp).'}
  else if(hp===11&&h.goodForEleven(pick)){exp=one;alt=['P'];why='11 hp med bra färg: 6 kort och minst 3 honnörer eller 7 kort och minst 2 honnörer. 1 i färg är tillåtet; pass är också möjligt.'}
  else if(hp>=6&&hp<=10&&m>=6){
    if(m===6&&pick!=='C'){exp='2'+pick;why='6-10 hp och exakt 6-korts '+SYM[pick]+': svag tvåa.'}
    else if(m===6){exp='P';why='Med 6-korts ♣ finns ingen svag tvåa (2♣ är starkt). Pass.'}
    else if(m===7){exp='3'+pick;alt=['4'+pick];why='7-korts färg med 6-10 hp: spärrbud 3 i färg (ta hänsyn till zoner).'}
    else {exp='4'+pick;alt=['3'+pick];why='8-korts färg med 6-10 hp: spärrbud 4 i färg (ta hänsyn till zoner).'}
  }
  else{exp='P';why=hp+' hp räcker inte för öppning (12+, 11 med 6 kort + 3 honnörer eller 7 kort + 2 honnörer) och ingen spärrhand.'}
  return {exp:exp,alt:alt,why:why,conv:'öppning',means:function(c){
    if(c==='P')return 'Pass: under 12 hp (11 hp kräver 6 kort + 3 honnörer eller 7 kort + 2 honnörer), ingen spärrhand.';
    if(c==='1N')return '15-17 hp, balanserad (även 5-korts högfärg).';
    if(c==='2C')return (hp>=12&&hp<=21&&L.H>=5&&L.C>=4)?'12-21 htp, minst 5 hjärter och 4 klöver: tvåfärgsöppning.':'Utgångskrav, eller 22-24 hp balanserad.';
    if(c==='2N')return '20-21 hp, balanserad.';
    if(/^2[DHS]$/.test(c))return '6-10 hp, exakt 6-korts '+SYM[c[1]]+'.';
    if(/^3[CDHS]$/.test(c))return 'Spärrbud, 6-10 hp, 7-korts färg.';
    if(/^4[CDHS]$/.test(c))return 'Spärrbud, 6-10 hp, 8-korts färg.';
    if(/^1[CDHS]$/.test(c))return '12-19 hp, 4+ färg (11 hp endast med 6 kort + 3 honnörer eller 7 kort + 2 honnörer).';
    return null}};
}

/* ---------- SVAR PÅ 1 I FÄRG ---------- */
function resp1(h,oc){
  var o=st_(oc),hp=h.hp,L=h.L,M=maj(o),sup=L[o]>=4,htp=sup?h.htp(o):hp,exp,why,alt=[];
  var cand=SU.filter(function(s){return s!==o&&rk('1'+s)>rk(oc)&&L[s]>=4});
  function pickBest(cs){var b=cs[0];cs.forEach(function(s){if(L[s]>L[b])b=s});return b}
  var means=function(c){
    if(c==='P')return 'Pass: under 6 hp.';
    if(c==='1N')return '6-10 hp, förnekar 4-korts stöd och 4-korts färg som kan bjudas på 1-nivå.';
    if(c==='2N')return 'Stenberg: 13+ htp, 4+ stöd, utgångskrav.';
    if(isBid(c)&&st_(c)===o){var l=lv(c);
      if(l===2)return '6-9 htp, 4+ stöd.';
      if(l===3)return '10-12 htp, 4+ stöd.';
      if(l===4)return M?'Spärrbud, max 12 htp, bra stöd och svitad hand.':'Spärrbud, max 9 htp, bra stöd och svitad hand.'}
    if(isBid(c)&&st_(c)!=='N'&&st_(c)!==o){var lo=lowest(st_(c),oc),l2=lv(c);
      if(c===lo&&l2===1)return '1 över 1: 6+ hp, 4+ färg, rondkrav (partnern får inte passa).';
      if(c===lo&&l2===2)return '2 över 1: 11+ hp, 4+ färg, rondkrav (partnern får inte passa).';
      if(l2>lv(lo))return 'Dubbelhopp i ny färg: renons i färgen, 4+ stöd och 13+ htp.'}
    return null};
  if(M&&sup){
    if(htp<6){exp='P';why='Bara '+htp+' htp med stöd: för svag för att svara.'}
    else if(htp<=9){exp='2'+o;why=htp+' htp med 4+ stöd i högfärgen: 2 i färgen (6-9).'}
    else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen (10-12).'}
    else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT (13+).'}
  }else if(hp<6&&(!sup||htp<6)){exp='P';why='Under 6 hp: pass.'}
  else if(!M&&sup&&cand.some(maj)){var cm=cand.filter(maj);exp=lowest(pickBest(cm),oc);why='Stöd i lågfärg men egen 4+ högfärg: visa högfärgen först (sök högfärg).';
    if(cm.length>1&&L[cm[0]]===L[cm[1]])alt.push(lowest(cm[0]===pickBest(cm)?cm[1]:cm[0],oc))}
  else if(!M&&sup){
    if(htp<=9){exp='2'+o;why=htp+' htp med 4+ stöd i lågfärgen: 2 i färgen.'}
    else if(htp<=12){exp='3'+o;why=htp+' htp med 4+ stöd: 3 i färgen.'}
    else{exp='2N';why=htp+' htp med 4+ stöd: Stenberg 2NT.'}
  }
  else if(cand.length){var b=pickBest(cand);exp=lowest(b,oc);why='6+ hp och en 4+ färg som kan bjudas på 1-nivå: 1 över 1.';
    cand.forEach(function(s){if(s!==b&&L[s]===L[b])alt.push(lowest(s,oc))})}
  else if(hp<=10){exp='1N';why=hp+' hp utan 4-korts stöd eller färg på 1-nivå: 1NT (6-10).'}
  else{var c2=SU.filter(function(s){return s!==o&&L[s]>=4});
    if(c2.length){var b2=pickBest(c2);exp=lowest(b2,oc);why=hp+' hp och 4+ färg: 2 över 1 (11+, rondkrav).'}
    else{return {exp:null,alt:[],why:hp+' hp utan färg att visa: dokumentet beskriver inte detta bud.',means:means,conv:'svar'}}}
  return {exp:exp,alt:alt,why:why,means:means,conv:htp>=13&&exp==='2N'?'Stenberg':'svar'};
}

/* ---------- 1NT / 2NT-STRUKTUR ---------- */
function ntResp(h,k){
  var hp=h.hp,L=h.L,b=2+k,Hs=maj,exp,why,alt=[],soft=false;
  var lo=k?5:8,gl=k?5:10;
  var c2=(b)+'C',d2=(b)+'D',h2=(b)+'H',s2=(b)+'S',n2=(b)+'N';
  var means=function(c){
    if(c==='P')return 'Pass: dåliga kort utan färg att visa.';
    if(c===c2)return 'Fråga efter 4-korts högfärg (Stayman). Bör själv ha någon 4-högfärg.';
    if(c===d2)return 'Överföring: minst 5-korts ♥.';
    if(c===h2)return 'Överföring: minst 5-korts ♠.';
    if(!k&&c==='2S')return 'Dåliga kort med minst 6-korts lågfärg (eller 5-5 i lågfärgerna). Vill hellre spela 3 i lågfärg.';
    if(!k&&c==='2N')return 'Naturlig invit med balanserad hand utan 4-korts högfärg.';
    if(!k&&(c==='3C'||c==='3D'))return 'Invit med bra 6+ lågfärg.';
    if(c==='3N')return 'Slutbud (utgång i sang).';
    return null};
  var conv='1NT-svar';
  if(L.H>=5&&L.S>=5){exp=h2;alt=[d2];why='5-5 i högfärgerna: överföring till ♠ (och sedan 3♥ som invit).';conv='överföring'}
  else if(L.H>=5||L.S>=5){var M=L.H>=5?'H':'S';exp=M==='H'?d2:h2;why='5+ '+SYM[M]+': överföring ('+(M==='H'?d2:h2).replace(/^(\d)(.)/,function(_,a,b){return a+SYM[b]})+').';conv='överföring'}
  else if(hp>=lo&&(L.H===4||L.S===4)){exp=c2;why='4-korts högfärg och '+hp+' hp: Stayman.';conv='Stayman';soft=!!k}
  else if(hp>=lo&&hp<gl&&!k){exp='2N';why=hp+' hp, balanserad utan 4-korts högfärg: invit 2NT.'}
  else if(hp>=gl){exp=n2;why=hp+' hp utan högfärgsfit att söka: 3NT.';soft=!!k}
  else if(!k&&(L.C>=6||L.D>=6||(L.C>=5&&L.D>=5))){exp='2S';why='Dåliga kort med lång lågfärg: 2♠ (relä till 3 i lågfärg).'}
  else{exp='P';why=hp+' hp utan färg att visa: pass.'}
  if(k&&exp&&exp!=='P'||k)soft=true;
  return {exp:exp,alt:alt,why:why,means:means,conv:conv,soft:soft};
}
function ntOpener(h,k,r){
  var L=h.L,hp=h.hp,b=2+k,c2=b+'C',d2=b+'D',h2=b+'H',s2=b+'S',exp,why,alt=[],soft=false,conv='1NT-system';
  var means=function(c){
    if(r===c2){if(c===b+'D')return 'Ingen 4+ högfärg.';if(c===b+'H')return '4-5 korts ♥ (kan ha 4-4 i högfärg).';if(c===b+'S')return '4-5 korts ♠.'}
    if(r===d2){if(c===h2)return 'Fullföljer överföringen (visar 2+ ♥).';if(c===(b+1)+'H')return 'Max och 4+ ♥: kan bjuda 3♥ i stället för 2♥.'}
    if(r===h2){if(c===s2)return 'Fullföljer överföringen.';if(c===(b+1)+'S')return 'Max och 4+ ♠: kan bjuda 3♠ i stället.'}
    if(!k&&r==='2S'){if(c==='2N')return 'Längre ♦ än ♣ eller lika längd i lågfärg.';if(c==='3C')return 'Längre ♣ än ♦.'}
    if(c==='P')return 'Pass (slutbud).';
    return null};
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
  var means=function(c){
    if(/^3[HS]$/.test(c))return 'Invit: 3 i öppnarens visade högfärg.';
    if(c==='2N')return 'Invit; efter Stayman visar sang att man har 4♠ (annars hade man bjudit högfärgen).';
    if(c==='3N')return 'Utgång i sang; efter Stayman visar det 4♠ (eller ingen fit).';
    if(c==='4H'||c==='4S')return 'Slutbud i högfärgen.';
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
    if(c==='P')return '0-7 hp med minst 5 kort i överföringsfärgen: svagt slutbud.';
    if(c==='2N')return '8-9 hp och exakt 5 kort i överföringsfärgen: invit.';
    if(c==='3'+M)return '8-9 hp och minst 6 kort i överföringsfärgen: invit.';
    if(c==='3N')return '10-15 hp och exakt 5 kort i överföringsfärgen: utgång i sang.';
    if(c==='4'+M)return '10-15 hp och minst 6 kort i överföringsfärgen: utgång i högfärgen.';
    return null};
  if(hp<=7){exp='P';why=hp+' hp och minst 5 '+SYM[M]+': pass efter fullföljd överföring (0-7 hp).'}
  else if(hp<=9){if(L[M]>=6){exp='3'+M;why='8-9 hp och minst 6 '+SYM[M]+': invit med 3 i högfärgen.'}else{exp='2N';why='8-9 hp och exakt 5 '+SYM[M]+': invit med 2NT.'}}
  else if(hp<=15){if(L[M]>=6){exp='4'+M;why='10-15 hp och minst 6 '+SYM[M]+': utgång 4'+SYM[M]+'.'}else{exp='3N';why='10-15 hp och exakt 5 '+SYM[M]+': utgång 3NT.'}}
  else{return {exp:null,alt:[],why:hp+' hp: fortsättning över 15 hp beskrivs inte i tabellen på sidan 61.',means:means,conv:'överföring'};}
  return {exp:exp,alt:alt,why:why,means:means,conv:'överföring'};
}
function ntOpener3(h,k1,k2,k3){ // 1NT - 2C - 2x - 2N/3N  (öppnarens tredje bud)
  var L=h.L,hp=h.hp;
  if(k1==='2C'&&k2==='2H'&&(k3==='2N'||k3==='3N')){
    var means=function(c){if(c==='3S')return 'Minimum med 4-4 i högfärg: 3♠ (invit godtas ej).';if(c==='4S')return 'Max med 4-4 i högfärg: 4♠.';return null};
    if(L.S>=4){var e=k3==='3N'?'4S':(hp>=17?'4S':'3S');return {exp:e,alt:k3==='3N'?['P']:[],why:'Partnern har 4♠ (bjöd Stayman och sedan sang) och du har 4♠: '+(e==='4S'?'4♠.':'3♠ med minimum.'),means:means,conv:'Stayman',soft:true}}
    return {exp:null,alt:[],why:'Utan ♠-fit anger dokumentet inget om hur invit besvaras.',means:means,conv:'Stayman'};
  }
  return NC('Fortsättningen beskrivs inte i dokumentet.');
}

/* ---------- 2♣-ÖPPNING ---------- */
function resp2c(h){
  var hp=h.hp,L=h.L,exp,why,alt=[];
  var means=function(c){
    if(c==='2D')return 'Om handen inte passar för 2 i högfärg eller 3 i lågfärg (en variant är att alltid svara 2♦).';
    if(c==='2H'||c==='2S')return '6+ hp och bra 5+ '+SYM[c[1]]+'.';
    if(c==='3C'||c==='3D')return '6+ hp och bra 6+ lågfärg.';
    return null};
  if(hp<6){exp='2D';why='Under 6 hp: 2♦.'}
  else{
    var mj=['H','S'].filter(function(s){return L[s]>=5&&h.good(s)}).sort(function(a,b){return L[b]-L[a]||(b==='S'?1:-1)});
    var mn=['C','D'].filter(function(s){return L[s]>=6&&h.good(s)});
    if(mj.length){exp='2'+mj[0];alt=['2D'];why='6+ hp och bra 5+ '+SYM[mj[0]]+': 2 i högfärgen (en variant: alltid 2♦).'}
    else if(mn.length){exp='3'+mn[0];alt=['2D'];why='6+ hp och bra 6+ lågfärg: 3 i färgen (en variant: alltid 2♦).'}
    else{exp='2D';why='Handen passar inte för 2 i högfärg eller 3 i lågfärg: 2♦.'}
  }
  return {exp:exp,alt:alt,why:why,means:means,conv:'2♣-system'};
}
function reb2c(h,r){
  var L=h.L,hp=h.hp,exp,why;
  var means=function(c){
    if(r!=='2D')return null;
    if(c==='2H'||c==='2S')return 'Utgångskrav, 5+ '+SYM[c[1]]+'.';
    if(c==='2N')return '22-24 hp, jämn hand.';
    if(c==='3C'||c==='3D')return 'Utgångskrav, 5+ '+SYM[c[1]]+'.';
    if(c==='3N')return '25-27 hp, jämn hand.';
    return null};
  if(r!=='2D')return {exp:null,alt:[],why:'Öppnarens fortsättning efter ett positivt svar beskrivs inte i dokumentet.',means:means,conv:'2♣-system'};
  if(h.bal&&hp<=24){exp='2N';why=hp+' hp jämn: 2NT (22-24).'}
  else if(h.bal){exp='3N';why=hp+' hp jämn: 3NT (25-27).'}
  else{var mj=['H','S'].filter(function(s){return L[s]>=5}).sort(function(a,b){return L[b]-L[a]||(b==='S'?1:-1)});
    var mn=['C','D'].filter(function(s){return L[s]>=5}).sort(function(a,b){return L[b]-L[a]});
    if(mj.length){exp='2'+mj[0];why='5+ '+SYM[mj[0]]+': 2 i högfärgen (utgångskrav).'}
    else if(mn.length){exp='3'+mn[0];why='5+ '+SYM[mn[0]]+': 3 i lågfärgen (utgångskrav).'}
    else return {exp:null,alt:[],why:'Obalanserad hand utan 5-korts färg: dokumentet anger inte budet.',means:means,conv:'2♣-system'}}
  return {exp:exp,alt:[],why:why,means:means,conv:'2♣-system',soft:false};
}
function resp2c2(h,rb,mine){
  var hp=h.hp,L=h.L,exp,why,alt=[];
  var near={'2H':'2S','2S':'2N','3C':'3D','3D':'3H'}[rb];
  var means=function(c){
    if(c===near)return 'Herbertavslag: närmsta bud visar 0-5 hp och ej trumfstöd (säger inget om färgen).';
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
      if(L[T_]>=4&&single){exp='4'+T_;alt=[near];why='0-5 hp med 4+ stöd och stöldvärde (singel/renons): 4 i färgen.'}
      else{exp=near;why='0-5 hp utan stödvärde: Herbertavslag (närmsta bud).'}
    }else if(L[T_]>=3){exp='3'+T_;why='6+ hp och 3+ stöd: 3 i färgen.'}
    else{var ns=SU.filter(function(s){return s!==T_&&L[s]>=5}).sort(function(a,b){return L[b]-L[a]})[0];
      if(ns){exp=lowest(ns,rb);why='6+ hp och 5+ '+SYM[ns]+': ny färg.'}
      else if(h.bal){exp='3N';why='6+ hp och jämn hand: 3NT.'}
      else return {exp:null,alt:[],why:'Dokumentet anger inte budet för denna hand.',means:means,conv:'2♣-system'}}
  }else{
    var m_=T_;
    if(hp<=5){
      if(L[m_]>=4&&single){exp='5'+m_;alt=[near];why='0-5 hp med stöldvärde och bra trumfstöd: 5 i färgen.'}
      else{exp=near;why='0-5 hp: Herbertavslag (närmsta bud).'}
    }else if(L[m_]>=3){exp='4'+m_;why='6+ hp och 3+ stöd: 4 i färgen (slamintresse).'}
    else{var mj=['H','S'].filter(function(s){return L[s]>=4}).sort(function(a,b){return L[b]-L[a]||(a==='H'?-1:1)})[0];
      if(mj){exp='3'+mj;why='6+ hp och 4+ '+SYM[mj]+': 3 i färgen.'}
      else if(h.bal){exp='3N';why='6+ hp och jämn hand: 3NT.'}
      else return {exp:null,alt:[],why:'Dokumentet anger inte budet för denna hand.',means:means,conv:'2♣-system'}}
  }
  return {exp:exp,alt:alt,why:why,means:means,conv:'Herbert'};
}

/* ---------- SVAG TVÅA ---------- */
function resp2w(h,oc){
  var o=st_(oc),L=h.L,hp=h.hp;
  var means=function(c){
    if(c==='3'+o)return 'Spärrhöjning, 3+ stöd, ej invit.';
    if(c==='3N')return 'Slutbud.';
    if(c==='2N')return 'Invitbud med 2+ stöd.';
    if(isBid(c)&&st_(c)!==o&&st_(c)!=='N'&&lv(c)===2)return '5+ färg, krav till minst 3 i öppningsfärgen.';
    return null};
  if(L[o]>=3&&hp<=8)return {exp:'3'+o,alt:[],why:'3+ stöd och bara '+hp+' hp: spärrhöjning 3 i färgen.',means:means,conv:'svag tvåa',soft:true};
  if(L[o]<3&&hp<=8)return {exp:'P',alt:[],why:'Svag hand utan stöd: pass.',means:means,conv:'svag tvåa',soft:true};
  return {exp:null,alt:[],why:'Dokumentet anger inga poänggränser för detta svar.',means:means,conv:'svag tvåa'};
}
function open2w(h,oc,r){
  var o=st_(oc),hp=h.hp;
  var means=function(c){if(r==='2N'){if(c==='3'+o||c==='3D'||c==='3H')return 'Ombud: 6-8 hp.';if(c==='3N'||c==='4'+o)return '9-10 hp.'}if(r==='3'+o){if(c==='P')return 'Pass med minimum.';if(c==='4'+o)return 'Accepterar inviten med maximum.'}return null};
  if(r==='2N'){var e=hp<=8?'3'+o:'3N';return {exp:e,alt:hp>=9&&maj(o)?['4'+o]:[],why:hp<=8?'6-8 hp: ombud (3 i färgen).':'9-10 hp: 3NT/4 i högfärg.',means:means,conv:'svag tvåa',soft:true}}
  if(r==='3'+o){var game=o==='D'?'5D':'4'+o;var accept=hp>=9;return {exp:accept?game:'P',alt:[],why:'Invitbud efter svag tvåöppning. Öppningshanden har '+hp+' hp; '+(accept?'maximal öppningsstyrka och accepterar inviten.':'inte maximal öppningsstyrka och passar.'),means:means,conv:'invit efter svag tvåa',soft:false};}
  return {exp:null,alt:[],why:'Fortsättningen beskrivs inte i dokumentet.',means:means,conv:'svag tvåa'};
}

/* ---------- ÖPPNARENS ANDRA BUD EFTER 1 I FÄRG ---------- */
function reb1(h,oc,r){
  var o=st_(oc),hp=h.hp,L=h.L,rs=st_(r),exp,why,alt=[],soft=false;
  var means=function(c){
    if(r==='2N'){var Ma=maj(o);
      if(c==='3N')return '12-14 hp, balanserad hand.';
      if(c==='3'+o)return 'Extra styrka, 15+ htp, ingen singel.';
      if(isBid(c)&&lv(c)===3)return 'Visar singel i '+SYM[c[1]]+'.';return null}
    if(rs===o&&lv(r)===2){if(c==='4'+o)return '20+ htp: utgång.';if(c==='3'+o)return '17-19 htp, naturlig invit utan singelton.';if(isBid(c)&&lv(c)===3)return '17-19 htp med singel i den bjudna färgen (negativt invitbud).';if(c==='P')return 'Pass: högst 16 htp.'}
    if(rs!==o&&rs!=='N'&&c===lv(r)+1+rs)return 'Trumfstöd, lägsta höjning: 12-16 htp.';
    if(rs!==o&&rs!=='N'&&c===(lv(r)+2)+rs)return 'Trumfstöd, enkelhopp: 17-19 htp.';
    if(isBid(c)&&st_(c)===o&&rs!==o)return 'Egen färg ('+(lv(c)===lv(lowest(o,r))?'lägsta nivå: 12-16 htp, 6+ kort eller 5+ om svagare än reverse':'hopp: 17-19 htp, 6+ kort')+').';
    if(c==='1N'||c==='2N'&&lv(r)===1&&r!=='1N')return c==='1N'?'12-14 hp, balanserad (NT på lägsta nivå).':'18-19 hp, balanserad (hopp i NT).';
    if(r==='1N'&&c==='2N')return '18-19 hp, balanserad (2NT när partnern bjöd 1NT).';
    if(r==='1N'&&c==='P')return 'Pass: 12-14 balanserad.';
    if(isBid(c)&&st_(c)!=='N'&&st_(c)!==o&&st_(c)!==rs)return 'Andra färg: lägsta nivå 12-17 hp (5-4), hopp 18+ htp, eller reverse 18+.';
    return null};
  if(r==='2N'){
    var sg=h.singles().filter(function(s){return L[s]===1&&s!==o});
    if(h.bal&&hp<=14){exp='3N';why='12-14 hp balanserad: 3NT.'}
    else if(sg.length){var s1=sg[0];exp='3'+s1;why='Singel i '+SYM[s1]+': visa den på 3-nivå.';if(sg.length>1)alt=sg.slice(1).map(function(s){return '3'+s});soft=true}
    else if(h.htp(o)>=15){exp='3'+o;why=h.htp(o)+' htp utan singel: 3 i färgen (extra styrka).'}
    else return {exp:null,alt:[],why:'Minimum utan singel och obalanserad: dokumentet anger inte budet.',means:means,conv:'Stenberg'};
    return {exp:exp,alt:alt,why:why,means:means,conv:'Stenberg',soft:soft};
  }
  if(rs===o){
    if(lv(r)===2&&maj(o)){var t=h.htp(o);
      if(t>=20){exp='4'+o;why=t+' htp: utgång.'}
      else if(t>=17){var sg2=h.singles().filter(function(s){return L[s]<=1&&s!==o});
        if(sg2.length){exp=lowest(sg2[0],r);alt=['3'+o];why=t+' htp med singel: ny färg 17-19 (negativt invitbud).'}
        else{exp='3'+o;why=t+' htp utan singel: 3 i färgen (invit).'}}
      else{exp='P';why=t+' htp: högst 16, pass.'}
      return {exp:exp,alt:alt,why:why,means:means,conv:'trumfstöd',soft:true};}
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
    if(hp<=16){exp=low(o);why='Egen 6+ färg utan sidofärg: lägsta nivå (12-16).'}
    else if(hp<=19){exp=jump(o,r);why='Egen 6+ färg: enkelhopp (17-19).'}
    else if(maj(o)){exp='4'+o;why='Egen 6+ högfärg, 20+: utgång.'}
    else return NC('Dokumentet anger inte budet för denna hand.',means);
  }else if(h.bal){
    if(r==='1N'){if(hp<=14){exp='P';why='Balanserad 12-14: pass efter partnerns 1NT.'}else if(hp<=19&&hp>=18){exp='2N';why='Balanserad 18-19: 2NT.'}else return NC('Dokumentet anger inte budet för denna styrka.',means)}
    else if(hp<=14){exp=low('N');why='Balanserad 12-14: NT på lägsta nivå.'}
    else if(hp>=18&&hp<=19){exp=jump('N',r);why='Balanserad 18-19: hopp i NT.'}
    else return NC('Dokumentet anger inte budet för balanserad hand med '+hp+' hp i denna situation.',means);
  }else{
    var s2=side4.filter(function(s){return s!==rs&&L[o]+L[s]>=9}).sort(function(a,b){return L[b]-L[a]})[0];
    if(s2){var x=low(s2),rev=rk(s2+'')>0&&SU.indexOf(s2)>SU.indexOf(o)&&lv(x)===2&&lv(r)===1;
      if(rev){if(h.htp(s2)>=18||hp>=18){exp=x;why='Reverse (andra färgen högre än första): 18+.'}else if(L[o]>=5){exp=low(o);why='Utan styrka för reverse: bjud om första färgen (visar 5+ färg).'}else return NC('Dokumentet anger inte budet.',means)}
      else if(hp>=18){exp=jump(s2,r);why='Hopp i andra färgen: 18+ htp med minst 5-4.'}
      else{exp=x;why='Andra färgen på lägsta nivå: 12-17 hp med 5-4.'}
    }else if(L[o]>=5){exp=low(o);why='Bjuder om första färgen (5+ kort).';soft=true}
    else return NC('Dokumentet anger inte budet för denna hand.',means);
  }
  return {exp:exp,alt:alt,why:why,means:means,conv:'öppnarens 2:a bud',soft:soft};
}

/* ---------- RKC ---------- */
function rkcTrumpFromAuction(bids,sideWanted){
  var ours=bids.filter(function(x){return side(x.s)===sideWanted&&isBid(x.c)});
  // Stenberg: öppning 1 i färg följd av partnerns 2NT fastställer öppningsfärgen.
  for(var i=0;i<ours.length;i++){
    if(/^1[CDHS]$/.test(ours[i].c)){
      var opener=ours[i].s, suit=ours[i].c[1];
      for(var j=i+1;j<ours.length;j++){
        if(ours[j].s!==opener&&ours[j].c==='2N')return suit;
      }
    }
  }
  // Färg som båda spelarna har bjudit naturligt.
  var by={};ours.forEach(function(x){if(x.c[1]!=='N'){by[x.c[1]]=by[x.c[1]]||{};by[x.c[1]][x.s]=1}});
  var fits=SU.filter(function(k){return by[k]&&by[k].N&&by[k].S});
  if(fits.length===1)return fits[0];
  // Överföring efter 1NT: partnerns överföringsbud fastställer högfärgen.
  if(ours.some(function(x){return x.c==='1N'})){
    if(ours.some(function(x){return x.c==='2D'})&&ours.some(function(x){return x.c==='2H'}))return 'H';
    if(ours.some(function(x){return x.c==='2H'})&&ours.some(function(x){return x.c==='2S'}))return 'S';
  }
  return null;
}
function rkcReply(h,T_){
  var kc=h.aces+(T_&&h.has(T_,13)?1:0),q=!!(T_&&h.has(T_,12)),vd=h.singles().some(function(s){return h.L[s]===0}),exp,why;
  var means=function(c){
    if(T_){
      if(c==='5C')return '0 eller 3 ess (av 5, inklusive trumfkungen).';
      if(c==='5D')return '1 eller 4 ess (av 5, inklusive trumfkungen).';
      if(c==='5H')return '2 ess utan trumfdam.';
      if(c==='5S')return '2 ess med trumfdam.';
      if(c==='5N')return '3 ess och någon renons.';
    }else{
      if(c==='5C')return '0 eller 4 ess (av 4).';
      if(c==='5D')return '1 ess.';
      if(c==='5H')return '2 ess.';
      if(c==='5S')return '3 ess.';
    }
    return null;
  };
  if(!T_){
    exp=kc===0||kc===4?'5C':kc===1?'5D':kc===2?'5H':'5S';
    why=kc+' ess av 4 (ingen trumf fastställd): '+txt(exp)+'. Kungar räknas inte.';
  }else if(kc===0||kc===3){exp=kc===3&&vd?'5N':'5C';why=kc+' ess inklusive trumfkungen'+(kc===3&&vd?' och renons: 5NT.':': 5♣.');}
  else if(kc===1||kc===4){exp='5D';why=kc+' ess inklusive trumfkungen: 5♦.';}
  else{exp=q?'5S':'5H';why='2 ess '+(q?'med':'utan')+' trumfdam.';}
  return {exp:exp,alt:[],why:why,means:means,conv:'RKC'};
}
/* ---------- INKLIV / DUBBLING ---------- */
function overcall(h,ob,last){
  var hp=h.hp,L=h.L,os=ob[1],lvl=lv(ob),exp,why,alt=[];
  var means=function(c){
    if(c==='X')return 'Upplysningsdubbling: 12+ hp och minst 3 kort i objudna färger, eller 17+ hp.';
    if(c==='1N')return 'Inkliv 1NT: 15-17 hp och håll i öppningsfärgen.';
    if(c==='P')return 'Pass.';
    if(isBid(c)&&c[1]!=='N'){var lo=lowest(c[1],ob);
      if(c===lo)return 'Enkelt inkliv: 12-17 hp, 5+ färg'+(lv(c)===1&&maj(c[1])?' (1 i högfärg: 10+ hp och bra 5+färg)':'')+'.';
      if(lv(c)===lv(lo)+1)return 'Hoppande inkliv: 6-10 hp och 6+ färg.'}
    if(c==='2N')return 'Försvar mot spärr: 16-18 hp balanserad.';
    return null};
  if(lvl>=2&&c0(ob)){ // försvar mot svaga spärröppningar
    var un=SU.filter(function(s){return s!==os});var tk=hp>=12&&un.every(function(s){return L[s]>=3})&&L[os]<=2;
    if(tk||hp>=17){exp='X';why='Mot spärröppning: dubbling = upplysningsdubbling eller 17+.'}
    else if(h.bal&&hp>=16&&hp<=18&&ok('2N',last)){exp='2N';why='16-18 balanserad: 2NT.'}
    else{exp='P';why='Ingen dubblingshand: pass.'}
    return {exp:exp,alt:alt,why:why,means:means,conv:'dubbling',soft:true};
  }
  var un2=SU.filter(function(s){return s!==os});
  var takeout=hp>=12&&un2.every(function(s){return L[s]>=3})&&L[os]<=2;
  var five=un2.filter(function(s){return L[s]>=5}).sort(function(a,b){return L[b]-L[a]||(SU.indexOf(b)-SU.indexOf(a))})[0];
  var okOver=function(s){var x=lowest(s,ob);return lv(x)<=2&&(lv(x)>1||hp>=10&&h.good(s)||!maj(s)&&hp>=12)&&(hp>=12&&hp<=17||(lv(x)===1&&maj(s)&&hp>=10&&h.good(s)))};
  if(hp>=17&&(takeout||true)&&h.bal===false&&hp>=17&&five===undefined&&!takeout){exp='X';why='17+ hp: dubbling visar alla fördelningar.'}
  else if(hp>=15&&hp<=17&&h.bal&&h.stop(os)&&ok('1N',ob)&&lvl===1){exp='1N';why='15-17 hp balanserad med håll i '+SYM[os]+': 1NT.';if(takeout)alt.push('X')}
  else if(takeout&&!(five&&okOver(five))){exp='X';why='12+ hp med minst 3 kort i objudna färger och kort i '+SYM[os]+': upplysningsdubbling.'}
  else if(five&&okOver(five)){exp=lowest(five,ob);why=hp+' hp och 5+ '+SYM[five]+': enkelt inkliv.';if(takeout)alt.push('X')}
  else if(hp>=6&&hp<=10&&un2.some(function(s){return L[s]>=6})){var s6=un2.filter(function(s){return L[s]>=6})[0];exp=jump(s6,ob);why='6-10 hp och 6+ '+SYM[s6]+': hoppande inkliv.'}
  else{exp='P';why='Ingen inklivshand ('+hp+' hp): pass.'}
  return {exp:exp,alt:alt,why:why,means:means,conv:'inkliv',soft:true};
}
function c0(ob){return lv(ob)>=2}
function respOvercall(h,oc,last,ob){
  var s=st_(oc),os=ob?ob[1]:null,L=h.L,hp=h.hp,exp,why;
  var means=function(c){
    if(c==='1N')return '8-10 hp, balanserad, håll i öppningsfärgen.';if(c==='2N')return '11-13 hp, balanserad, bra håll.';if(c==='3N')return '14+ hp, balanserad, bra håll.';
    if(isBid(c)&&c[1]===s){var d=lv(c)-lv(oc);return d===1?'Enkel höjning: 6-9 hp, 3-korts stöd.':d===2?'Dubbel höjning: 6-9 hp, 4-korts stöd.':'Trippel höjning: 6-9 hp, 5-korts stöd.'}
    if(isBid(c)&&c[1]===os)return 'Överbud (deras färg): 10+ hp och 3+ stöd.';
    if(isBid(c)&&c[1]!=='N')return lv(c)>lv(lowest(c[1],last))?'Hopp i ny färg: 14+ hp, bra 6+ färg, utgångskrav.':'Ny färg: 8+ hp, 5+ färg, rondkrav (10+ hp om budet är på 2-nivå).';
    if(c==='P')return 'Pass.';return null};
  if(L[s]>=3&&hp<=9&&hp>=6){var t=L[s]>=5?3:L[s]>=4?2:1;var e=(lv(oc)+t)+s;if(ok(e,last)&&lv(e)<=4){exp=e;why=L[s]+' kort stöd och '+hp+' hp: '+(t===1?'enkel':t===2?'dubbel':'trippel')+' höjning.'}}
  if(!exp&&L[s]>=3&&hp>=10&&os){exp=lowest(os,last);why='10+ hp och 3+ stöd: överbud i deras färg.'}
  // Fortsatt NT-svar efter inkliv är inte fullständigt specificerat i källfilen.
  return {exp:exp||null,alt:[],why:why||'Dokumentet anger inte budet för denna hand.',means:means,conv:'inkliv',soft:true};
}
function respDouble(h,ob,last){
  var os=ob[1],L=h.L,hp=h.hp,exp,why,alt=[];
  var un=SU.filter(function(s){return s!==os});
  var means=function(c){
    if(c==='1N')return '6-9 hp och håll i öppningsfärgen.';if(c==='2N')return '10-12 hp och håll i öppningsfärgen.';if(c==='3N')return '13+ hp och håll i öppningsfärgen.';
    if(c==='P')return 'Pass: bara med många kort i öppningsfärgen.';
    if(isBid(c)&&c[1]===os)return 'Överbud: 10+ hp, krav så länge nya färger bjuds.';
    if(isBid(c)&&c[1]!=='N'){var lo=lowest(c[1],ob);return c===lo?'Färg på lägsta nivå: 0-7 hp (i värsta fall 3-korts färg).':lv(c)===lv(lo)+1?(lv(c)>=3?'Hopp till 3-läget: 10-12 htp och helst 5+ färg.':'Hopp i färg: 8-9 htp, 4+ färg.'):null}
    return null};
  var best=un.slice().sort(function(a,b){return L[b]-L[a]||SU.indexOf(b)-SU.indexOf(a)})[0];
  if(L[os]>=5&&h.good(os)){exp='P';why='Många kort i öppningsfärgen: pass är rätt.'}
  else if(hp<=7){exp=lowest(best,ob);why='0-7 hp: färg på lägsta nivå ('+SYM[best]+').'}
  else if(hp<=9){if(L[best]>=4){exp=jump(best,ob);why='8-9 htp och 4+ färg: hopp i färg.'}else if(h.stop(os)&&ok('1N',ob)){exp='1N';why='6-9 hp med håll: 1NT.'}else exp=lowest(best,ob)}
  else if(hp<=12){if(L[best]>=5&&lv(lowest(best,ob))<3){exp=(3)+best;alt=[lowest(os,ob)];why='10-12 htp och 5+ färg: hopp till 3-läget.'}else if(h.bal&&h.stop(os)){exp='2N';alt=[lowest(os,ob)];why='10-12 hp med håll: 2NT.'}else{exp=lowest(os,ob);why='10+ hp: överbud i deras färg (krav).'}}
  else{if(h.bal&&h.stop(os)){exp='3N';alt=[lowest(os,ob)];why='13+ hp med håll: 3NT.'}else{exp=lowest(os,ob);why='10+ hp: överbud i deras färg (krav).'}}
  return {exp:exp,alt:alt,why:why||'',means:means,conv:'dubbling',soft:true};
}

/* ---------- SVARSHANDENS ANDRA BUD EFTER 1NT-SVAR ---------- */
function respAfter1NT(h,opening,rebid,act){
  var hp=h.hp,L=h.L, suit=isBid(act)?st_(act):null;
  var isOpeningSuit=suit&&suit===st_(opening);
  var lowestNewSuit=suit&&lowest(suit,rebid)===act;
  var means=function(c){
    if(isBid(c)&&c[0]==='3'&&st_(c)!=='N'&&L[st_(c)]>=6&&hp>=6&&hp<=9){
      if(st_(c)!==st_(opening)&&lowest(st_(c),rebid)===c)
        return 'Svarshandens andra färgbud på lägsta nivå efter 1NT: 6-9 hp och minst 6-korts färg. Undantag från krav på ny färg.';
      if(st_(c)===st_(opening)&&c==='3'+st_(opening))
        return 'Svarshandens andra bud i öppningsfärgen enligt dokumentets exempel: 6-9 hp och minst 6-korts färg. Undantag från krav på ny färg.';
    }
    return null;
  };
  // Källans två exempel: 1♠–1NT / 2♦–3♣ och 1♥–1NT / 2♣–3♥.
  // För annan färg krävs lägsta möjliga bud över öppnarens återbud;
  // i öppningsfärgen följs dokumentets uttryckliga 3-nivåexempel.
  var allowed=hp>=6&&hp<=9&&suit&&L[suit]>=6&&lv(act)===3&&
    ((isOpeningSuit&&act==='3'+suit)||(!isOpeningSuit&&lowestNewSuit));
  if(allowed){
    return {exp:act,alt:[],why:hp+' hp och 6+ '+SYM[suit]+': bjud färgen på lägsta nivå i andra budronden. Budet är inte krav.',means:means,conv:'svar efter 1NT',soft:false};
  }
  return NC('Efter 1NT-svaret är endast de beskrivna andra färgbuden med 6-9 hp och 6+ kort täckta av dokumentet.',means,'svar efter 1NT');
}

/* ---------- TVÅFÄRGSHAND 5+ hjärter / 4+ klöver (sidan D) ---------- */
function twoSuitResponse(h){
  var L=h.L,hp=h.hp,exp=null,why='',means=function(c){
    if(c==='2H'||c==='2S')return '6-9 hp, 2-3 kort i hjärter respektive 6+ kort i spader: svagt.';
    if(c==='2N')return '10-12 hp och ruterhåll: invit.';
    if(c==='3C')return '10-12 hp och 4+ klöver: invit.';
    if(c==='3H')return '10-12 hp och 3 hjärter: invit.';
    if(c==='3N')return '13-17 hp och ruterhåll.';
    if(c==='4H')return '13-17 htp och 3 hjärter.';
    if(c==='2D')return 'Fjärde färg: utgångskrav, 13+ hp; visar inte ruter utan söker oftast håll för sang.';
    return null;
  };
  if(hp>=13&&L.D>=4){exp='2D';why=hp+' hp och ruter som fjärde färg: utgångskrav (13+ hp).';}
  else if(hp>=13&&hp<=17&&L.H===3){exp='4H';why=hp+' htp och 3 hjärter: 4♥.';}
  else if(hp>=13&&hp<=17&&h.stop('D')){exp='3N';why=hp+' hp och ruterhåll: 3NT.';}
  else if(hp>=10&&hp<=12&&L.H===3){exp='3H';why=hp+' htp och 3 hjärter: invit 3♥.';}
  else if(hp>=10&&hp<=12&&L.C>=4){exp='3C';why=hp+' hp och 4+ klöver: invit 3♣.';}
  else if(hp>=10&&hp<=12&&h.stop('D')){exp='2N';why=hp+' hp och ruterhåll: invit 2NT.';}
  else if(hp>=6&&hp<=9&&L.S>=6){exp='2S';why=hp+' hp och 6+ spader: svagt 2♠.';}
  else if(hp>=6&&hp<=9&&L.H>=2&&L.H<=3){exp='2H';why=hp+' hp och 2-3 hjärter: svagt 2♥.';}
  else{return {exp:null,alt:[],why:'Handen passar inte tydligt i något av svaren som anges på sidan D.',means:means,conv:'tvåfärgshand'};}
  return {exp:exp,alt:[],why:why,means:means,conv:'tvåfärgshand'};
}
/* ---------- DISPATCH ---------- */
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
    if(!opp.length)return openingNode(h);
    if(opp.length===1&&isBid(opp[0].c)){var ob=opp[0].c;if(ob==='1N'||ob==='2C')return nc('Försvar mot '+txt(ob)+'-öppning beskrivs inte i dokumentet.');return overcall(h,ob,last)}
    return nc('Motståndarna har bjudit flera gånger: situationen beskrivs inte i dokumentet.');
  }
  for(var k=1;k<ours.length;k++)if(ours[k].s===ours[k-1].s)return nc('Budgivningen följer inte ett turordnat mönster som dokumentet beskriver.');
  if(ours[ours.length-1].s!==pt)return nc('Budgivningen följer inte ett turordnat mönster som dokumentet beskriver.');
  var d=ours.length,opener=ours[0].s===me,f=ours[0].c;
  // RKC: 4NT-frågan och partnerns svar bedöms mot hela den tidigare auktionen.
  var trumpForSide=rkcTrumpFromAuction(prior,side(me));
  if(b.c==='4N'){
    return {exp:'4N',alt:[],why:trumpForSide?'Essfråga (RKC) med '+SYM[trumpForSide]+' som fastställd trumf.':'Essfråga (RKC), ingen trumf fastställd: fyra ess räknas.',means:function(c){return c==='4N'?'Essfråga (RKC).':null},conv:'RKC'};
  }
  var partnerAsk=prior.slice().reverse().filter(function(x){return x.s===pt&&x.c==='4N'})[0];
  if(partnerAsk){return rkcReply(h,rkcTrumpFromAuction(prior,side(me)));}
  if(oppBefore.length){
    if(d===1&&!oppAfter.length&&oppBefore.length===1){
      if(f==='X')return respDouble(h,oppBefore[0].c,last);
      if(f==='1N')return ntResp(h,0);
      if(isBid(f))return respOvercall(h,f,last,oppBefore[0].c);
    }
    return nc('Motståndarna har lagt sig i: fortsättningen beskrivs inte i dokumentet.');
  }
  if(oppAfter.length){
    return nc('Motståndarna lade sig i efter er öppning. Dokumentet beskriver bara 1NT-störning (ny färg på 2-nivå naturlig, dubbling = upplysning).');
  }
  var c1=f,fs=c1[1];
  if(c1==='1N'||c1==='2N'){var k=c1==='2N'?1:0;
    // Svarshandens andra bud efter 1NT: ny färg på lägsta nivå är undantag från krav.
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
    if(opener&&d===4&&!k)return ntOpener3(h,ours[1].c,ours[2].c,ours[3].c);
    return nc('Fortsättningen i 1NT/2NT-systemet beskrivs inte i dokumentet.');
  }
  if(c1==='2C'){
    if(!opener&&d===1){var oh=H(st.hands[pt]);if(oh.hp>=12&&oh.hp<=21&&oh.L.H>=5&&oh.L.C>=4)return twoSuitResponse(h);return resp2c(h); }
    if(opener&&d===2)return reb2c(h,ours[1].c);
    if(!opener&&d===3){var rb=ours[2].c;if(rb==='2N')return ntResp(h,1);return resp2c2(h,rb,ours[1].c)}
    return nc('Fortsättningen i 2♣-systemet beskrivs inte i dokumentet.');
  }
  if(/^2[DHS]$/.test(c1)){
    if(!opener&&d===1)return resp2w(h,c1);
    if(opener&&d===2)return open2w(h,c1,ours[1].c);
    return nc('Fortsättningen efter svag tvåa beskrivs inte i dokumentet.');
  }
  if(/^1[CDHS]$/.test(c1)){
    // Sekvens: 1 i färg – 1NT – öppnarens återbud – SHs andra bud.
    if(!opener&&d===3&&ours[1].c==='1N')
      return respAfter1NT(h,ours[0].c,ours[2].c,b.c);
    if(!opener&&d===1)return resp1(h,c1);
    if(opener&&d===2)return reb1(h,c1,ours[1].c);
    return nc('Svarshandens andra bud efter 1 i färg beskrivs bara med enstaka exempel i dokumentet.');
  }
  return nc('Spärröppningar (3-nivå eller högre): dokumentet beskriver inga svar.');
}
/* Mer utförlig hjälptext. Innehållet bygger på Nordisk standard 2012-08-22.
   Texten skiljer budets systembetydelse från skälet till att handen ska välja budet. */
function expandedMeaning(short,conv,act){
  var extra={
    'öppning':'Öppningsbudet beskriver öppningshandens styrka och fördelning så att partnern kan avgöra om sidan ska spela delkontrakt, invitera eller söka utgång/slam. Honnörspoäng räknas: ess 4, kung 3, dam 2 och knekt 1. Handens fördelning och färgkvalitet vägs också in.',
    'svar':'Svarshanden beskriver sin styrka och fördelning. En ny färg på 1-nivån visar minst 6 hp och minst 4 kort samt är rondkrav. En ny färg på 2-nivån visar minst 11 hp och minst 4 kort samt är rondkrav. Stöd visas enligt nivåerna för stödpoäng/trumfpoäng.',
    'Stenberg':'Stenberg 2NT visar minst 13 htp och minst 4 korts stöd i öppningsfärgen. Det är utgångskrav: paret ska alltså inte stanna under utgång. Öppnaren beskriver därefter extra styrka eller singelton enligt färgen som bjuds.',
    'Stayman':'Stayman är högfärgsfråga efter sangöppning. 2♣ frågar efter 4-korts högfärg; öppnaren svarar 2♦ utan 4+ högfärg, 2♥ med 4–5 hjärter och 2♠ med 4–5 spader. Svarshanden bör själv ha en 4-korts högfärg eller slamintresse enligt sekvensen.',
    'överföring':'Överföringsbudet visar minst 5 kort i den angivna högfärgen. Efter öppnarens fullföljande: 0-7 hp passar; 8-9 hp bjuder 2NT med exakt 5 kort eller 3 i högfärgen med minst 6 kort (invit); 10-15 hp bjuder 3NT med exakt 5 kort eller 4 i högfärgen med minst 6 kort.',
    'tvåfärgshand':'Öppningshanden har minst 5+4 kort i två färger men har inte preciserat styrkan. En ny färg från svarshanden får därför inte passas. På sidan D visas 1♥ med 4+ hjärter och 2♣ med minst 5 hjärter och 4 klöver; styrkeintervallet är enligt användarens rättelse 12-21 htp. Svar efter 2♣: 2♥/2♠ är svagt (6-9 hp); 2NT är invit med 10-12 hp och ruterhåll; 3♣ är invit med 10-12 hp och 4+ klöver; 3♥ är invit med 10-12 hp och 3 hjärter; 3NT visar 13-17 hp och ruterhåll; 4♥ visar 13-17 htp och 3 hjärter. Fjärde färg är utgångskrav (13+ hp) och visar inte färgen.',
    '1NT-svar':'Efter 1NT används systemets särskilda svar: Stayman för att hitta högfärgsfit, överföring med minst 5-korts högfärg, naturlig invit med balanserad hand eller slutbud. Efter motståndarnas inkliv gäller inte Stayman/överföringar enligt dokumentet.',
    '2♣-system':'Öppning 2♣ är utgångskrav eller minst 22 hp med balanserad hand. Svarshanden visar positiv hand med minst 6 hp och bra långfärg, annars används 2♦ som avslag/relä. Fortsättningen beskriver öppnarens hand och ska leda till minst utgång.',
    'Herbert':'Herbertavslag är det närmaste tillgängliga budet efter 2♣–2♦. Det visar 0–5 hp och säger i sig inget om den färg som bjuds. Stöd och stöldvärde kan i stället visas med höjning enligt dokumentets särskilda regler.',
    'svag tvåa':'En svag tvåöppning visar 6–10 hp och exakt 6 kort i ♦ eller högfärg. Svarshanden kan höja spärrande med stöd och svag hand, bjuda 2NT som invit eller bjuda 3 i samma färg som invit. Efter 3 i samma färg passar öppningshanden med minimum och går till 4♥/4♠ eller 5♦ med maximum. 2♣ omfattas inte av denna regel.',
    'öppnarens 2:a bud':'Öppnarens andra bud preciserar styrka och fördelning efter svarshandens första bud. Stöd i partnerns färg visas med lägsta höjning 12–16 htp, enkelhopp 17–19 htp och hopp till utgång vid 20+ htp i högfärg. Egen färg, andra färg och sangbud visar i stället längd, styrka eller balanserad hand enligt systemet.',
    'RKC':'RKC är essfråga. När trumf är fastställd räknas fyra ess plus trumfkungen som femte ess; utan fastställd trumf räknas endast de fyra essen. Svaren 5♣, 5♦, 5♥ och 5♠ anger antal nyckelkort enligt tabellen i dokumentet. Trumfdamen och renons kan därefter beskrivas.',
    'inkliv':'Ett inkliv visar normalt 12–17 hp och minst 5 kort i färgen. 1NT-inkliv visar 15–17 hp och håll i öppningsfärgen. Hoppande inkliv visar 6–10 hp och minst 6 kort. Efter inkliv beskriver svarshanden stöd, egen färg eller sanghåll enligt de angivna styrkeintervallen.',
    'dubbling':'Upplysningsdubbling visar normalt minst 12 hp och minst 3 kort i de objudna färgerna, eller 17+ hp oavsett fördelning. Partnern ska välja sin längsta färg direkt; en ny färg från dubblaren senare visar stark hand om dubblaren saknar stöd.',
    'svar efter 1NT':'Efter 1 i färg–1NT och öppnarens återbud finns ett uttryckligt undantag: svarshandens andra färgbud kan vara 6–9 hp och minst 6 kort, utan att vara krav, enligt exemplen i dokumentet.'
  };
  var detail=extra[conv]||'Budets betydelse ska läsas tillsammans med den föregående budgivningen. Poänggränserna och färglängderna i Nordisk standard gäller för just den beskrivna sekvensen; samma budkod kan därför betyda något annat i en annan sekvens.';
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
/* ---------- AUKTIONSMOTOR: HELA SEK VENSEN ---------- */
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
function judgeComplete(st){
  var structural=validateAuction(st), items=[],right=0,wrong=0,optional=0,uncovered=0;
  var bids=st.bids||[];
  for(var i=0;i<bids.length;i++){
    var b=bids[i], item={nr:i+1,plats:NAME[b.s]||b.s,bud:txt(b.c)};
    var issue=null;
    for(var j=0;j<structural.errors.length;j++)if(structural.errors[j].index===i){issue=structural.errors[j].message;break}
    if(issue){
      item.konvention='budordning';item.forklaring='Budet kan inte bedömas som en giltig del av auktionen.';
      item.bedomning='fel';item.battre='';item.motivering=issue;wrong++;
    }else if(side(b.s)===1){
      item.konvention='motståndare';item.forklaring=b.e|| (b.c==='P'?'Motståndaren passar.':'Motståndarens bud (robot).');
      item.bedomning='rätt';item.battre='';item.motivering='Motståndarens bud visas som kontext och poängsätts inte.';
    }else{
      var node;
      try{node=nodeFor(st,i)}catch(e){node=NC('Kunde inte bedöma budet ('+e.message+').')}
      var v=verdictOf(node,b.c);
      for(var k in v)item[k]=v[k];
      if(item.bedomning==='rätt')right++;else if(item.bedomning==='fel')wrong++;else if(item.bedomning==='valfritt')optional++;else uncovered++;
    }
    // Presentationsordning: budets bedömning först, därefter varför och sedan systemförklaring.
    var hand=H(st.hands[b.s]);
     var suit=isBid(item.bud)?st_(item.bud):null;
    item={nr:item.nr,plats:item.plats,bud:item.bud,bedomning:item.bedomning,battre:item.battre||'',hp:hand.hp,htp:suit?hand.htp(suit):hand.hp,langd:hand.L};
    items.push(item);
  }
  var status=structural.ended?'Budgivningen är avslutad.':bids.length?'Budgivningen är inte avslutad – inväntar fler bud.':'Ingen budgivning registrerad.';
  return {items:items,summary:'Rätt '+right+' · Fel '+wrong+' · Valfritt '+optional+' · Ej täckt '+uncovered+' (Norr och Syd).',auction:{valid:structural.valid,ended:structural.ended,dealer:structural.dealer,contract:structural.contractText,status:status,errors:structural.errors.map(function(e){return 'Bud '+(e.index+1)+': '+e.message})}};
}
return {judge:judgeComplete,H:H,nodeFor:nodeFor,txt:txt,validateAuction:validateAuction,version:'2.5-page61-transfer-pageD-two-suiter-12hp'};
})();
