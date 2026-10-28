/* Funzioni pure condivise da pagina, studio e verifiche. */
(function(root){
  'use strict';
  const CONFIG_KEY='domenik:config:v1';
  function partsAt(date,timeZone){
    return Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  }
  function dateKey(date=new Date(),zone='Europe/Rome'){
    const p=partsAt(date,zone);return `${p.year}-${p.month}-${p.day}`;
  }
  function eventTimestamp(c){
    const [y,m,d]=c.eventDate.split('-').map(Number),[h,mi]=c.eventTime.split(':').map(Number);
    const desired=Date.UTC(y,m-1,d,h,mi);let stamp=desired;
    for(let i=0;i<4;i++){
      const p=partsAt(new Date(stamp),c.timeZone);
      const wall=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);
      const next=stamp+(desired-wall);if(next===stamp)break;stamp=next;
    }
    const p=partsAt(new Date(stamp),c.timeZone);
    if(`${p.year}-${p.month}-${p.day}`!==c.eventDate || `${p.hour}:${p.minute}`!==c.eventTime)throw Error('Questa data o ora non esiste nel fuso scelto.');
    return stamp;
  }
  function remaining(target,now=Date.now()){
    const diff=Math.max(0,Math.ceil((target-now)/1000));
    return {days:Math.floor(diff/86400),hours:Math.floor(diff/3600)%24,minutes:Math.floor(diff/60)%60,seconds:diff%60,started:now>=target};
  }
  function validate(c){
    if(!c||typeof c!=='object'||Array.isArray(c))throw Error('Configurazione non valida.');
    const strings={edition:80,title:100,eventDate:10,eventTime:5,timeZone:60,location:70,filmTitle:140,intro:360,extra:180};
    for(const [key,max] of Object.entries(strings)){
      if(typeof c[key]!=='string'||c[key].length>max||(!c[key].trim()&&!['filmTitle','extra'].includes(key)))throw Error(`Controlla il campo ${key} (massimo ${max} caratteri).`);
    }
    if(!/^[a-zA-Z0-9_-]{1,80}$/.test(c.edition))throw Error('Il codice edizione può contenere solo lettere, numeri, trattini e underscore.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(c.eventDate)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(c.eventTime))throw Error('Data o ora non valida.');
    eventTimestamp(c);
    if(!Array.isArray(c.dailyClues)||c.dailyClues.length<1||c.dailyClues.length>12)throw Error('Inserisci da 1 a 12 indizi.');
    const dates=new Set();
    for(const clue of c.dailyClues){
      if(!clue||!/^\d{4}-\d{2}-\d{2}$/.test(clue.date)||dates.has(clue.date))throw Error('Date degli indizi non valide o duplicate.');
      const validDate=new Date(clue.date+'T12:00:00Z');
      if(!Number.isFinite(+validDate)||validDate.toISOString().slice(0,10)!==clue.date)throw Error('Data indizio inesistente.');
      dates.add(clue.date);
      for(const [k,max] of [['title',100],['body',650],['note',250]])if(typeof clue[k]!=='string'||clue[k].length>max||!clue[k].trim())throw Error('Completa tutti i campi degli indizi.');
    }
    if(!Array.isArray(c.transmissions)||c.transmissions.length!==4||c.transmissions.some(s=>typeof s!=='string'||!s.trim()||s.length>350))throw Error('Servono quattro messaggi radio, massimo 350 caratteri ciascuno.');
    return c;
  }
  function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value===null?fallback:value;}catch{return fallback;}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function config(base){const stored=read(CONFIG_KEY,null);if(stored){try{return validate(stored);}catch{}}return validate(base);}
  function frequency(date){let hash=0;for(const ch of date)hash=(hash*31+ch.charCodeAt(0))>>>0;return (900+hash%161)/10;}
  function escape(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));}
  function download(name,content,type='text/plain;charset=utf-8'){
    const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  root.HorrorCore={CONFIG_KEY,partsAt,dateKey,eventTimestamp,remaining,validate,read,write,config,frequency,escape,download};
})(typeof window==='undefined'?globalThis:window);
