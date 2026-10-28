(function(){
'use strict';
const Core=window.HorrorCore,$=id=>document.getElementById(id);
let config;
try{config=Core.config(window.EVENT_CONFIG);}catch(error){$('hero-title').textContent='La casa ha perso il copione.';$('intro').textContent=error.message;return;}
const progressKey='domenik:progress:'+config.edition;
const blank=()=>({secrets:[],readClues:[],visits:[],alias:'',bestMemory:null,bestHold:0});
const raw=Core.read(progressKey,{}),state={...blank(),...(raw&&typeof raw==='object'?raw:{})};
for(const k of ['secrets','readClues','visits'])if(!Array.isArray(state[k]))state[k]=[];
if(typeof state.alias!=='string')state.alias='';
let storageWarned=false,toastTimer,day='',target=Core.eventTimestamp(config);
const secretDefs=[
 {id:'door',name:'Tre colpi alla porta',hint:'Le buone maniere prevedono di bussare. Tre volte.',body:'Qualcuno ha bussato dall’altra parte. Sicuramente è Domenik. Sicuramente.'},
 {id:'window',name:'L’ospite non in lista',hint:'La finestra sotto il tetto sembra abitata.',body:'Hai visto qualcuno alla finestra. Il problema è che la casa doveva essere vuota.'},
 {id:'eye',name:'Il logo ti guarda',hint:'L’occhio in alto a sinistra non ama essere toccato. Soprattutto tre volte.',body:'Tre tocchi. Un battito di ciglia. Adesso sa che ci sei.'},
 {id:'radio',name:'La frequenza proibita',hint:'La radio risponde al segnale più nitido. Non sempre al più forte.',body:'Hai trovato la frequenza di oggi. Domani il messaggio potrebbe essere diverso.'},
 {id:'hold',name:'Sangue freddo',hint:'Cinque secondi senza mollare. Oppure cinque tocchi coraggiosi.',body:'Nervi saldi, almeno qui. La prova del divano sarà un’altra storia.'},
 {id:'memory',name:'Memoria del buio',hint:'Quattro coppie si nascondono sotto le carte.',body:'Hai riconosciuto tutte le coppie. La casa sostiene di riconoscere te.'},
 {id:'word',name:'La parola proibita',hint:'Il finale del video ti dà la parola: INCUBO. Scrivila sulla tastiera o tocca qui per pronunciarla.',body:'INCUBO. Adesso che l’hai nominato, l’invito è ufficiale.'},
 {id:'candle',name:'Meglio al buio',hint:'Una candela accesa in fondo alla pagina. Cosa potrebbe andare storto?',body:'Hai spento l’ultima luce. Diciamo che era per creare atmosfera.'}
];
state.secrets=state.secrets.filter(id=>secretDefs.some(s=>s.id===id));
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4200);}
function save(){if(!Core.write(progressKey,state)&&!storageWarned){storageWarned=true;toast('Il browser non consente il salvataggio: le scoperte dureranno questa visita.');}}
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','#'+name);svg.append(use);return svg;}
function showModal(title,body,note='',label='UN MESSAGGIO DALLA CASA'){
 const host=$('modal-content');host.replaceChildren();
 const eyebrow=document.createElement('div');eyebrow.className='eyebrow';eyebrow.textContent=label;
 const heading=document.createElement('h2');heading.id='dialog-title';heading.textContent=title;
 const p=document.createElement('p');p.textContent=body;host.append(eyebrow,heading,p);
 if(note){const n=document.createElement('p');n.className='modal-note';n.textContent=note;host.append(n);}
 $('modal').setAttribute('aria-labelledby','dialog-title');if(!$('modal').open)$('modal').showModal();
}
$('modal-close').onclick=()=>$('modal').close();
$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('modal').close();}});
function unlock(id){
 if(state.secrets.includes(id))return false;
 state.secrets.push(id);save();renderSecrets();soundNote(196,.28);toast('Segreto ritrovato: '+secretDefs.find(s=>s.id===id).name+' · '+state.secrets.length+'/8');return true;
}
function renderSecrets(){
 $('secret-total').textContent=state.secrets.length;$('nav-secret-count').textContent=state.secrets.length+'/8';
 const list=$('secret-list');list.replaceChildren();
 secretDefs.forEach((s,i)=>{const found=state.secrets.includes(s.id),b=document.createElement('button');b.className='secret-row'+(found?' found':'');b.append(icon(found?'key':'lock'));const name=document.createElement('span');name.textContent=found?s.name:`Segreto ${String(i+1).padStart(2,'0')} — ? ? ?`;const end=document.createElement('small');end.textContent=found?'RITROVATO ↗':'UN INDIZIO ↗';b.append(name,end);b.onclick=()=>{
  showModal(found?s.name:'La casa sussurra…',found?s.body:s.hint,'','IL TUO DOSSIER');
  if(s.id==='word'&&!found){const form=document.createElement('form');form.innerHTML='<label for="secret-word">La parola proibita</label><input id="secret-word" maxlength="20" autocomplete="off" placeholder="Sei lettere. Un brutto sogno."><button class="btn primary" type="submit">Pronuncia la parola</button><p id="word-status" role="status"></p>';
   form.onsubmit=e=>{e.preventDefault();if($('secret-word').value.trim().toLowerCase()==='incubo'){unlock('word');showModal(s.name,s.body);}else $('word-status').textContent='La casa non riconosce questa parola.';};$('modal-content').append(form);
  }
 };list.append(b);});
}
function readableDate(date,options={day:'numeric',month:'long'}){return new Intl.DateTimeFormat('it-IT',{...options,timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
function applyConfig(){
 const lines=config.title.split('\n');$('hero-title').replaceChildren();const a=document.createElement('span'),b=document.createElement('em');a.textContent=lines[0];b.textContent=lines.slice(1).join(' ');$('hero-title').append(a,b);
 $('intro').textContent=config.intro;$('extra').textContent=config.extra;
 const date=readableDate(config.eventDate).toUpperCase();$('event-date').textContent=date;$('event-time').textContent='ORE '+config.eventTime;$('event-location').textContent=config.location.toUpperCase();
 $('program-time').textContent=config.eventTime;$('program-location').textContent=config.location;$('film-title').textContent=config.filmTitle||'Il titolo resta nell’ombra.';
 $('closing-meta').textContent=`${date} / ORE ${config.eventTime} / ${config.location.toUpperCase()}`;
 const marquee=document.querySelector('.marquee>div');marquee.replaceChildren();
 for(const text of [date,'ORE '+config.eventTime,config.location.toUpperCase(),'IL PEGGIO DEVE ANCORA VENIRE',date,'ORE '+config.eventTime,config.location.toUpperCase()]){marquee.append(document.createTextNode(text));const star=document.createElement('span');star.textContent='✳';marquee.append(star);}
 if(Core.read(Core.CONFIG_KEY,null))$('local-banner').hidden=false;
}
$('public-version').onclick=()=>{try{localStorage.removeItem(Core.CONFIG_KEY);}catch{}location.reload();};
function renderEnvelopes(){
 const host=$('envelopes');host.replaceChildren();
 const clues=[...config.dailyClues].sort((a,b)=>a.date.localeCompare(b.date));
 host.style.gridTemplateColumns='';
 clues.forEach((clue,index)=>{
  const locked=day<clue.date,read=state.readClues.includes(clue.date),b=document.createElement('button');
  b.className='envelope'+(locked?' locked':'')+(read?' read':'');b.setAttribute('aria-label',(locked?'Busta sigillata: si apre il ':'Apri la busta del ')+readableDate(clue.date));
  const date=document.createElement('span');date.className='envelope-date';date.textContent=readableDate(clue.date,{day:'numeric',month:'short'}).toUpperCase();
  const stamp=document.createElement('span');stamp.className='stamp';stamp.setAttribute('aria-hidden','true');stamp.textContent='✳';
  const title=document.createElement('strong');title.textContent=locked?'Ancora sigillata':clue.title;
  const status=document.createElement('small');status.textContent=locked?'SI APRE IL '+readableDate(clue.date).toUpperCase():read?'GIÀ APERTA · RILEGGI ↗':'È PER TE. APRILA ↗';
  b.append(date,stamp,icon(locked?'lock':'key'),title,status);
  b.onclick=()=>{
   if(locked){showModal('Non ancora.',`Questa busta si apre il ${readableDate(clue.date)}, a mezzanotte nel fuso ${config.timeZone}.`,'Nel frattempo, la casa ha altri segreti.','SIGILLO INTEGRO');return;}
   if(!state.readClues.includes(clue.date)){state.readClues.push(clue.date);save();renderEnvelopes();}
   showModal(clue.title,clue.body,clue.note,'BUSTA '+String(index+1).padStart(2,'0')+' / '+readableDate(clue.date).toUpperCase());soundNote(130,.15);
  };host.append(b);
 });
 const next=clues.find(c=>c.date>day);$('daily-note').textContent=next?'PROSSIMA BUSTA: '+readableDate(next.date).toUpperCase()+' · A MEZZANOTTE, ORA ITALIANA.':'TUTTE LE BUSTE SONO APERTE. ORA RESTA SOLO DA PRESENTARSI.';
}
let radioWonToday=false;
function visit(){
 const next=Core.dateKey(new Date(),config.timeZone);if(next===day)return;
 day=next;radioWonToday=false;
 if(!state.visits.includes(day)){state.visits.push(day);save();}
 $('visit-streak').textContent=`${state.visits.length} ${state.visits.length===1?'giorno di curiosità':'giorni di curiosità'}. La casa prende nota.`;
 renderEnvelopes();tuneRadio(false);
}
let previouslyStarted=false;
function tick(){
 const r=Core.remaining(target);for(const k of ['days','hours','minutes','seconds'])$(k).textContent=String(r[k]).padStart(2,'0');
 if(r.started&&!previouslyStarted){$('count-label').textContent='LA PORTA È APERTA. BENVENUTI NELL’INCUBO.';document.title='La porta è aperta — Casa di Domenik';previouslyStarted=true;}
 visit();
}
let knockCount=0,knockTimer,eyeCount=0,eyeTimer;
$('door').onclick=()=>{
 knockCount++;clearTimeout(knockTimer);knockTimer=setTimeout(()=>knockCount=0,6000);
 const scene=$('house-scene');scene.classList.remove('knock');void scene.offsetWidth;scene.classList.add('knock');soundNote(74,.12);
 if(knockCount>=3){knockCount=0;clearTimeout(knockTimer);unlock('door');showModal('Qualcuno ha risposto.',secretDefs[0].body,'Tre colpi. Ricordateli.','TOC. TOC. TOC.');}else toast(knockCount===1?'Un colpo. Il silenzio risponde.':'Due colpi. Manca qualcosa.');
};
$('window').onclick=()=>{$('ghost').classList.add('show');setTimeout(()=>$('ghost').classList.remove('show'),4500);unlock('window');showModal('Non eri solo.',secretDefs[1].body,'Per fortuna siete tra amici. Più o meno.');};
$('brand').addEventListener('click',e=>{e.preventDefault();eyeCount++;clearTimeout(eyeTimer);eyeTimer=setTimeout(()=>eyeCount=0,4000);if(eyeCount>=3){eyeCount=0;unlock('eye');showModal('Ti ha visto.',secretDefs[2].body);}else if(eyeCount===2)toast('L’occhio ha quasi finito di svegliarsi.');});
let pumpkinCount=0;
$('pumpkin').onclick=()=>{$('house-scene').classList.toggle('pumpkin-lit');toast(['La zucca sorride. Tu un po’ meno.','Non è lei la sorpresa schifosa.','Questa almeno non chiede di essere invitata.'][pumpkinCount++%3]);soundNote(220,.09);};
let moonCount=0;
$('moon-button').onclick=()=>toast(['La luna consiglia di non fare programmi per il dopo film.','Alle 21:21 anche le ombre arrivano puntuali.','La luna ha letto il programma. Ha chiesto di uscire.'][moonCount++%3]);
$('candle').onclick=()=>{const out=$('candle').classList.toggle('out');if(out){unlock('candle');toast('Luce spenta. Adesso siamo pronti.');}else toast('Meglio controllare chi c’è nella stanza.');};
let typed='';
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;if(e.key.length===1){typed=(typed+e.key.toLowerCase()).slice(-6);if(typed==='incubo'){unlock('word');showModal('Hai detto la parola.',secretDefs[6].body);typed='';}}});
// Audio attivato soltanto su richiesta, mai all'apertura.
let audioContext=null,audioBus=null,audioOn=false,noiseGain=null;
async function enableAudio(){
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){toast('Audio non disponibile in questo browser. La casa resta inquietante anche in silenzio.');return;}
 try{
  if(!audioContext){audioContext=new Audio();audioBus=audioContext.createGain();audioBus.gain.value=.075;audioBus.connect(audioContext.destination);
   const hum=audioContext.createOscillator(),hg=audioContext.createGain();hum.type='sine';hum.frequency.value=48;hg.gain.value=.23;hum.connect(hg).connect(audioBus);hum.start();
   const buffer=audioContext.createBuffer(1,audioContext.sampleRate*3,audioContext.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   const source=audioContext.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=800;noiseGain=audioContext.createGain();noiseGain.gain.value=.2;source.connect(filter).connect(noiseGain).connect(audioBus);source.start();
  }
  if(audioOn){audioOn=false;await audioContext.suspend();}else{await audioContext.resume();audioOn=true;soundNote(146,.7);}
  $('sound-toggle').setAttribute('aria-pressed',String(audioOn));$('sound-toggle').querySelector('span').textContent=audioOn?'Audio on':'Audio off';
 }catch{toast('Il browser non ha attivato l’audio. Puoi riprovare.');}
}
function soundNote(hz,duration=.2){if(!audioOn||!audioContext||audioContext.state!=='running')return;const osc=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;osc.type='sine';osc.frequency.setValueAtTime(hz,now);osc.frequency.exponentialRampToValueAtTime(hz*.8,now+duration);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.3,now+.015);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain).connect(audioBus);osc.start(now);osc.stop(now+duration+.02);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
$('sound-toggle').onclick=enableAudio;
function tuneRadio(user=true){
 const f=Number($('tuner').value),targetFrequency=Core.frequency(day),distance=Math.abs(f-targetFrequency),found=distance<.061;
 $('frequency').textContent=f.toFixed(1);$('tuner').setAttribute('aria-valuetext',f.toFixed(1)+' MHz. '+(found?'Segnale trovato':distance<.6?'Segnale molto vicino':distance<2?'Segnale vicino':'Interferenze'));
 $('radio-light').classList.toggle('tuned',found);
 if(noiseGain&&audioContext)noiseGain.gain.setTargetAtTime(found?.035:Math.min(.35,.08+distance*.025),audioContext.currentTime,.1);
 if(found){const n=Number(day.replace(/-/g,''))%4;$('radio-message').textContent=config.transmissions[n];if(user&&!radioWonToday){radioWonToday=true;unlock('radio');soundNote(329,.6);toast('Trasmissione di oggi agganciata. Torna domani per una nuova frequenza.');}}
 else $('radio-message').textContent=distance<.6?'Il segnale è quasi pulito. Muoviti piano.':distance<2?'Una voce tra le interferenze… sei vicino.':distance<5?'Qualcosa si muove nel rumore.':'Solo interferenze. Per ora.';
}
$('tuner').addEventListener('input',()=>tuneRadio());
// Prova di tenuta, con alternativa a tocchi per chi non può tenere premuto.
let holdStart=null,holdRAF=null,holdMode='hold',taps=0,holdFinished=false;
function showBest(){const n=Number(state.bestHold)||0;$('hold-best').textContent=n>=5?'Miglior tenuta: 5.0 s. Sangue freddo.':n>0?'Miglior tenuta: '+n.toFixed(1)+' s. Riprova.':'Il coraggio va allenato.';}
function finishHold(){holdStart=null;cancelAnimationFrame(holdRAF);holdFinished=true;$('hold-number').textContent=holdMode==='taps'?'5 / 5':'05.0';$('hold-button').classList.remove('holding');$('hold-button').classList.add('won');$('hold-status').textContent='LA CASA APPROVA. PER ORA.';if(holdMode==='hold')state.bestHold=5;save();showBest();unlock('hold');soundNote(261,.4);}
function frameHold(){if(holdStart===null)return;const elapsed=(performance.now()-holdStart)/1000;$('hold-number').textContent=Math.min(5,elapsed).toFixed(1).padStart(4,'0');if(elapsed>=5){finishHold();return;}holdRAF=requestAnimationFrame(frameHold);}
function beginHold(){if(holdMode!=='hold'||holdStart!==null)return;holdFinished=false;$('hold-button').classList.remove('won');$('hold-button').classList.add('holding');$('hold-status').textContent='CI SEI. NON MOLLARE.';holdStart=performance.now();holdRAF=requestAnimationFrame(frameHold);}
function stopHold(){if(holdStart===null)return;const elapsed=Math.min(5,(performance.now()-holdStart)/1000);if(elapsed>=5){finishHold();return;}cancelAnimationFrame(holdRAF);holdStart=null;$('hold-button').classList.remove('holding');state.bestHold=Math.max(Number(state.bestHold)||0,elapsed);save();showBest();$('hold-status').textContent='LA CASA HA SENTITO UN’ESITAZIONE. RIPROVA.';}
$('hold-button').addEventListener('pointerdown',e=>{if(holdMode==='hold'){e.preventDefault();$('hold-button').setPointerCapture(e.pointerId);beginHold();}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('hold-button').addEventListener(name,stopHold);
$('hold-button').addEventListener('keydown',e=>{if(holdMode==='hold'&&[' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)beginHold();}});
$('hold-button').addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key)){if(holdMode==='hold')e.preventDefault();stopHold();}});
$('hold-button').addEventListener('blur',stopHold);
$('hold-button').addEventListener('contextmenu',e=>e.preventDefault());
$('hold-button').addEventListener('click',()=>{if(holdMode==='taps'){if(holdFinished){holdFinished=false;taps=0;$('hold-button').classList.remove('won');}taps++;$('hold-number').textContent=taps+' / 5';$('hold-status').textContent='OGNI TOCCO CONTA.';if(taps>=5)finishHold();}});
$('hold-accessible').onclick=()=>{stopHold();holdMode=holdMode==='hold'?'taps':'hold';taps=0;holdFinished=false;$('hold-button').classList.remove('won');$('hold-number').textContent=holdMode==='taps'?'0 / 5':'00.0';$('hold-button').setAttribute('aria-label',holdMode==='taps'?'Tocca cinque volte per completare la prova':'Tieni premuto per cinque secondi. Con la tastiera tieni premuto Spazio o Invio.');$('hold-status').textContent=holdMode==='taps'?'TOCCA IL SIMBOLO CINQUE VOLTE':'TIENI PREMUTO PER INIZIARE';$('hold-accessible').textContent=holdMode==='taps'?'Torna alla prova di tenuta':'Alternativa: avvia una prova a 5 tocchi';};
// Memory: mazzo nuovo a ogni partita, record personale persistente.
let deck=[],openCards=[],matches=0,moves=0,boardBusy=false,memoryTimeout=null;
function newMemory(){
 clearTimeout(memoryTimeout);openCards=[];matches=0;moves=0;boardBusy=false;deck=['eye','moon','key','candle','eye','moon','key','candle'];
 for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 $('memory-moves').textContent='0 tentativi';$('memory-status').textContent=state.bestMemory?'Il tuo record: '+state.bestMemory+' tentativi. La casa se lo ricorda.':'Trova le coppie. Nessuna fretta. Forse.';
 const grid=$('memory-grid');grid.replaceChildren();deck.forEach((s,i)=>{const b=document.createElement('button');b.className='memory-tile';b.setAttribute('aria-label','Carta '+(i+1)+', coperta');b.setAttribute('aria-pressed','false');b.append(icon(s));b.onclick=()=>flipCard(i);grid.append(b);});
}
const names={eye:'occhio',moon:'luna',key:'chiave',candle:'candela'};
function flipCard(i){
 const cards=[...$('memory-grid').children],b=cards[i];if(boardBusy||openCards.includes(i)||b.classList.contains('matched'))return;
 b.classList.add('revealed');b.setAttribute('aria-pressed','true');b.setAttribute('aria-label','Carta '+(i+1)+': '+names[deck[i]]);openCards.push(i);soundNote(180+i*15,.1);
 if(openCards.length<2)return;moves++;$('memory-moves').textContent=moves+' tentativi';const [a,c]=openCards;
 if(deck[a]===deck[c]){cards[a].classList.add('matched');cards[c].classList.add('matched');cards[a].disabled=true;cards[c].disabled=true;openCards=[];matches++;
  if(matches===4){if(!Number.isFinite(state.bestMemory)||state.bestMemory===null||moves<state.bestMemory)state.bestMemory=moves;save();$('memory-status').textContent='Tutte le coppie ritrovate in '+moves+' tentativi. Record: '+state.bestMemory+'.';unlock('memory');}else $('memory-status').textContent='Una coppia ritrovata. '+matches+' su 4.';
 }else{boardBusy=true;memoryTimeout=setTimeout(()=>{for(const n of [a,c]){cards[n].classList.remove('revealed');cards[n].setAttribute('aria-pressed','false');cards[n].setAttribute('aria-label','Carta '+(n+1)+', coperta');}openCards=[];boardBusy=false;},850);}
}
$('memory-reset').onclick=newMemory;
function ticket(){
 showModal('Il tuo posto è segnato.','Scegli come vuoi farti chiamare. Il biglietto è un ricordo digitale: non è una prenotazione e il nome resta sul tuo dispositivo.','','UN INVITO. NESSUNA VIA DI FUGA.');
 const form=document.createElement('form');form.innerHTML='<label for="guest-name">NOME O SOPRANNOME</label><input id="guest-name" maxlength="28" placeholder="Il prossimo sopravvissuto" autocomplete="nickname"><div class="ticket-preview"><div class="eyebrow" style="justify-content:center">AMMETTE UN ANIMO CORAGGIOSO</div><div class="ticket-name" id="ticket-name"></div><p class="ticket-fine" id="ticket-date"></p><p class="ticket-fine" id="ticket-location"></p><p class="ticket-fine">FILM HORROR + UNA SORPRESA SCHIFOSA</p></div><button class="btn primary" type="submit">Scarica il tuo biglietto ↗</button>';
 $('modal-content').append(form);$('guest-name').value=state.alias;$('ticket-name').textContent=state.alias||'Il prossimo sopravvissuto';$('ticket-date').textContent=readableDate(config.eventDate)+' · ore '+config.eventTime;$('ticket-location').textContent=config.location;
 $('guest-name').oninput=e=>{$('ticket-name').textContent=e.target.value.trim()||'Il prossimo sopravvissuto';};
 form.onsubmit=e=>{e.preventDefault();state.alias=$('guest-name').value.trim().slice(0,28);save();const esc=Core.escape;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1500" viewBox="0 0 1080 1500"><rect width="1080" height="1500" fill="#101814"/><rect x="64" y="64" width="952" height="1372" rx="3" fill="none" stroke="#c7aa75" stroke-width="2" stroke-dasharray="10 8"/><g text-anchor="middle" fill="#e9e3cf" font-family="Georgia,serif"><text x="540" y="200" font-size="23" letter-spacing="6">L’ULTIMA PROIEZIONE</text><text x="540" y="320" font-size="75">Il posto c’è.</text><text x="540" y="410" font-size="75" font-style="italic" fill="#e2ab88">Il coraggio?</text><text x="540" y="610" font-size="48" fill="#e2ab88">${esc(state.alias||'Il prossimo sopravvissuto')}</text><text x="540" y="730" font-size="33">${esc(readableDate(config.eventDate))} · ore ${esc(config.eventTime)}</text><text x="540" y="795" font-size="36">${esc(config.location)}</text><path d="M200 890H880" stroke="#516045"/><text x="540" y="990" font-size="27">FILM HORROR</text><text x="540" y="1040" font-size="27">E UNA SORPRESA SCHIFOSA…</text><text x="540" y="1210" font-size="22" fill="#c7aa75">AMMETTE UN ANIMO CORAGGIOSO.</text><text x="540" y="1260" font-size="20">NESSUNA GARANZIA SULLO STOMACO.</text><text x="540" y="1350" font-size="15">INVITO DIGITALE · NON È UNA PRENOTAZIONE</text></g></svg>`;
 Core.download('Il-mio-biglietto-Halloween.svg',svg,'image/svg+xml');toast('Biglietto scaricato. Il tuo posto è nell’incubo.');};
}
$('ticket-open').onclick=ticket;
$('teaser').onclick=()=>{
 showModal('Dieci secondi di avvertimento.','Il countdown della festa continua. Questo è il teaser originale.','','IL TRAILER DELLA NOTTE');
 const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.poster='assets/countdown-poster.jpg';video.src='assets/countdown.mp4';video.setAttribute('aria-label','Teaser di Halloween, 10 secondi. 31 ottobre, ore 21:21, Casa di Domenik.');$('modal-content').append(video);
 if(audioContext&&audioOn)audioContext.suspend().catch(()=>{});
};
$('modal').addEventListener('close',()=>{const video=$('modal-content').querySelector('video');if(video){video.pause();video.removeAttribute('src');video.load();if(audioContext&&audioOn&&!document.hidden)audioContext.resume().catch(()=>{});}});
$('calendar').onclick=()=>{
 const utc=ms=>new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
 const escape=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\r/g,'');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Casa di Domenik//Halloween//IT','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+config.edition+'@casa-domenik.local','DTSTAMP:'+utc(Date.now()),'DTSTART:'+utc(target),'SUMMARY:'+escape('Halloween — '+config.location),'LOCATION:'+escape(config.location),'DESCRIPTION:'+escape('Film horror e una sorpresa schifosa. '+config.extra),'END:VEVENT','END:VCALENDAR'];
 // Folding a 70 byte: anche i calendari più vecchi digeriscono l’invito.
 const folded=lines.map(line=>{let result='',chunk='';for(const ch of line){if(new TextEncoder().encode(chunk+ch).length>70){result+=chunk+'\r\n ';chunk=ch;}else chunk+=ch;}return result+chunk;}).join('\r\n')+'\r\n';
 Core.download('Halloween-Casa-di-Domenik.ics',folded,'text/calendar;charset=utf-8');toast('Invito calendario scaricato. Ore '+config.eventTime+', ora italiana.');
};
$('share').onclick=async()=>{
 if(!/^https?:$/.test(location.protocol)){showModal('Prima apriamo la casa online.','Pubblica il progetto su GitHub Pages. Poi questo pulsante condividerà il link corretto.');return;}
 const url=location.origin+location.pathname,text=`${readableDate(config.eventDate)}, ore ${config.eventTime}. ${config.location}. Film horror e una sorpresa schifosa… Porta il coraggio. Lo stomaco vediamo.`;
 try{if(navigator.share){await navigator.share({title:'L’ultima proiezione — '+config.location,text,url});}else if(navigator.clipboard){await navigator.clipboard.writeText(text+'\n'+url);toast('Invito e link copiati. Convoca i coraggiosi.');}else showModal('Convoca un amico.',text+'\n\n'+url,'Copia questo messaggio per condividerlo.');}catch(error){if(error.name!=='AbortError')showModal('Convoca un amico.',text+'\n\n'+url,'Copia questo messaggio per condividerlo.');}
};
$('progress-reset').onclick=()=>{
 showModal('Cancellare le tue tracce?','Si azzerano segreti, buste lette, record, nome sul biglietto e giorni di visita su questo dispositivo. I contenuti dell’evento restano come sono.');
 const b=document.createElement('button');b.className='btn primary';b.textContent='Sì, azzera i miei progressi';b.onclick=()=>{try{localStorage.removeItem(progressKey);}catch{}location.reload();};$('modal-content').append(b);
};
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopHold();if(audioContext&&audioOn)audioContext.suspend().catch(()=>{});}else{tick();if(audioContext&&audioOn)audioContext.resume().catch(()=>{});}});
applyConfig();renderSecrets();showBest();newMemory();tick();setInterval(tick,1000);
})();
