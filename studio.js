(function(){
'use strict';
const C=window.HorrorCore,$=id=>document.getElementById(id),LOCK='domenik:studio-lock:v1',SESSION='domenik:studio-open:v1';
let draft;
try{draft=structuredClone(C.config(window.EVENT_CONFIG));}catch{draft=JSON.parse(JSON.stringify(window.EVENT_CONFIG));}
let lock=C.read(LOCK,null);
if(!lock||typeof lock.salt!=='string'||typeof lock.hash!=='string')lock=null;
function sessionOpen(){try{return sessionStorage.getItem(SESSION)==='yes';}catch{return false;}}
function open(){try{sessionStorage.setItem(SESSION,'yes');}catch{}$('gate').hidden=true;$('editor').hidden=false;$('lock-studio').hidden=false;populate();}
async function hashPass(pass,salt){
 if(!crypto.subtle)throw Error('Questo browser non supporta il blocco locale qui. Puoi entrare senza blocco oppure usare il sito in HTTPS.');
 const input=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},input,256);
 return Array.from(new Uint8Array(bits)).map(n=>n.toString(16).padStart(2,'0')).join('');
}
function gate(){
 $('gate').hidden=false;$('editor').hidden=true;$('lock-studio').hidden=true;$('local-password').value='';
 $('gate-title').textContent=lock?'Riapri lo studio.':'Metti un piccolo lucchetto.';
 $('gate-description').textContent=lock?'Inserisci la passphrase scelta su questo dispositivo. Questo è soltanto un blocco locale: non protegge il sito pubblico.':'Se vuoi, scegli una passphrase locale di almeno 6 caratteri. Resterà solo in questo browser e non proteggerà il sito pubblico.';
 $('login-button').textContent=lock?'Apri lo studio':'Crea il blocco ed entra';$('reset-lock').hidden=!lock;$('skip-lock').hidden=!!lock;$('local-password').autocomplete=lock?'current-password':'new-password';
}
$('login-form').onsubmit=async e=>{
 e.preventDefault();const pass=$('local-password').value;$('login-status').textContent='';if(pass.length<6){$('login-status').textContent='Scegli almeno 6 caratteri.';return;}
 $('login-button').disabled=true;
 try{
  if(lock){const hashed=await hashPass(pass,lock.salt);if(hashed!==lock.hash)throw Error('La passphrase non corrisponde.');}
  else{const salt=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(v=>v.toString(16).padStart(2,'0')).join('');const hash=await hashPass(pass,salt);if(!C.write(LOCK,{salt,hash}))throw Error('Il browser non consente di memorizzare il blocco. Usa «Entra senza blocco».');lock={salt,hash};}
  $('local-password').value='';open();
 }catch(error){$('login-status').textContent=error.message;}finally{$('login-button').disabled=false;}
};
$('skip-lock').onclick=open;
$('reset-lock').onclick=()=>{if(confirm('Rimuovere il blocco locale di questo browser? I contenuti dell’evento e i progressi rimangono.')){try{localStorage.removeItem(LOCK);sessionStorage.removeItem(SESSION);}catch{}lock=null;gate();$('login-status').textContent='Blocco locale rimosso. Puoi sceglierne uno nuovo.';}};
$('lock-studio').onclick=()=>{try{sessionStorage.removeItem(SESSION);}catch{}gate();$('login-status').textContent=lock?'Studio chiuso.':'Studio chiuso. Non hai impostato un blocco locale.';};
function field(label,type,value,max){const l=document.createElement('label');l.textContent=label;const el=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')el.type=type;else el.rows=3;el.value=value;el.required=true;if(max)el.maxLength=max;l.append(el);return {label:l,input:el};}
function populate(){
 for(const [id,key] of [['title','title'],['date','eventDate'],['time','eventTime'],['location','location'],['film','filmTitle'],['intro','intro'],['extra','extra']])$('field-'+id).value=draft[key];
 const host=$('clue-editor');host.replaceChildren();draft.dailyClues.forEach((c,i)=>addClueEditor(c,i));
 $('radio-editor').replaceChildren();draft.transmissions.forEach((s,i)=>{const f=field('MESSAGGIO '+(i+1),'textarea',s,350);f.input.className='radio-copy';$('radio-editor').append(f.label);});
}
function addClueEditor(c,index){
 const box=document.createElement('div');box.className='clue-edit';const top=document.createElement('div');top.className='clue-edit-top';const name=document.createElement('span');name.textContent='BUSTA '+String(index+1).padStart(2,'0');const remove=document.createElement('button');remove.type='button';remove.className='remove-clue';remove.textContent='Rimuovi';remove.onclick=()=>{if($('clue-editor').children.length<=1){status('Mantieni almeno una busta.');return;}box.remove();};top.append(name,remove);box.append(top);
 for(const [key,label,type,max] of [['date','DATA DI APERTURA','date'],['title','TITOLO','text',100],['body','INDIZIO','textarea',650],['note','NOTA FINALE','textarea',250]]){const f=field(label,type,c[key],max);f.input.dataset.key=key;if(key==='date')f.input.className='clue-date';box.append(f.label);}
 $('clue-editor').append(box);
}
function gather(){
 const c=JSON.parse(JSON.stringify(draft));
 for(const [id,key] of [['title','title'],['date','eventDate'],['time','eventTime'],['location','location'],['film','filmTitle'],['intro','intro'],['extra','extra']])c[key]=$('field-'+id).value.trim();
 c.timeZone='Europe/Rome';c.dailyClues=[...$('clue-editor').children].map(box=>Object.fromEntries([...box.querySelectorAll('[data-key]')].map(input=>[input.dataset.key,input.value.trim()])));c.transmissions=[...document.querySelectorAll('.radio-copy')].map(el=>el.value.trim());
 return C.validate(c);
}
function status(message){$('editor-status').textContent=message;}
$('add-clue').onclick=()=>{const count=$('clue-editor').children.length;if(count>=12){status('Puoi inserire al massimo 12 buste.');return;}addClueEditor({date:draft.eventDate,title:'Un nuovo presentimento',body:'Scrivi qui il tuo indizio senza rivelare la sorpresa.',note:'Torna presto.'},count);status('Busta aggiunta. Scegli una data non già utilizzata.');};
$('editor-form').onsubmit=e=>{
 e.preventDefault();try{draft=gather();if(!C.write(C.CONFIG_KEY,draft))throw Error('Il browser non consente il salvataggio locale. Puoi comunque scaricare config.js.');status('Anteprima applicata su questo dispositivo. Apri o ricarica la casa per vederla. Gli altri invitati non vedono ancora le modifiche.');}catch(error){status(error.message);}
};
$('export-config').onclick=()=>{if(!$('editor-form').reportValidity())return;try{draft=gather();const js='/* Contenuti dell’invito. Nessuna password o segreto in questo file. */\nwindow.EVENT_CONFIG = '+JSON.stringify(draft,null,2)+';\n';C.download('config.js',js,'text/javascript;charset=utf-8');status('config.js scaricato. Sostituisci il file omonimo nella cartella pubblicata su GitHub e conferma il commit.');}catch(error){status(error.message);}};
$('import-config').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 try{if(file.size>150000)throw Error('Il file è troppo grande per una configurazione.');let content=(await file.text()).trim().replace(/^\/\*[\s\S]*?\*\/\s*/,'');const match=content.match(/^window\.EVENT_CONFIG\s*=\s*([\s\S]*?);?\s*$/);if(match)content=match[1].replace(/;\s*$/,'');draft=C.validate(JSON.parse(content));populate();status('Configurazione importata nell’editor. Applica l’anteprima o scarica il file per pubblicarla.');}catch(error){status('Importazione non riuscita: '+error.message);}finally{e.target.value='';}
};
$('reset-preview').onclick=()=>{if(confirm('Rimuovere l’anteprima locale e ripristinare i contenuti del file config.js attualmente pubblicato?')){try{localStorage.removeItem(C.CONFIG_KEY);}catch{}draft=JSON.parse(JSON.stringify(window.EVENT_CONFIG));populate();status('Anteprima locale rimossa. La casa usa di nuovo il file config.js pubblicato.');}};
if(sessionOpen())open();else gate();
})();
