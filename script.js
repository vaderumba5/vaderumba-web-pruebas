import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { collection, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const header=document.getElementById('header');
function updateHeader(){header?.classList.toggle('scrolled',window.scrollY>70)}
updateHeader();
window.addEventListener('scroll',updateHeader,{passive:true});

document.querySelectorAll('.logo img,.footer-logo img').forEach(img=>{img.src='vr-logo-dorado.png';img.removeAttribute('srcset');});

const firebaseConfig={apiKey:"AIzaSyC0DrWRG4JLWHSX2vk5zat6eVxxKs8GfvY",authDomain:"va-de-rumba.firebaseapp.com",projectId:"va-de-rumba",storageBucket:"va-de-rumba.firebasestorage.app",messagingSenderId:"353945851143",appId:"1:353945851143:web:7c27b29224e687476c21a2",measurementId:"G-0DXD34H6CZ"};
const db=getFirestore(initializeApp(firebaseConfig));
const dates=document.getElementById('fechas');
const nextDate=document.getElementById('nextDate');
const nextTitle=document.getElementById('nextTitle');
const nextMeta=document.getElementById('nextMeta');
const fmtDay=new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',timeZone:'Europe/Madrid'});
const fmtLong=new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Madrid'});
function madridStartOfToday(){const now=new Date();const parts=new Intl.DateTimeFormat('en-GB',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Madrid'}).formatToParts(now);const v=Object.fromEntries(parts.map(({type,value})=>[type,value]));return new Date(Date.UTC(+v.year,+v.month-1,+v.day));}
function txt(v){return typeof v==='string'?v.trim():''}
function locationOf(c){return [txt(c.publicLocation)||txt(c.venue),txt(c.city)].filter(Boolean).join(' · ')}
function renderRows(items){dates.replaceChildren();items.forEach(c=>{const d=c.date?.toDate?.();const row=document.createElement('div');row.className='date-row';const time=document.createElement('time');time.textContent=d?fmtDay.format(d).toUpperCase():'FECHA';const strong=document.createElement('strong');strong.textContent=locationOf(c)||'Va de Rumba en directo';const meta=document.createElement('span');meta.textContent=[txt(c.time)&&`${txt(c.time)} h`,txt(c.ticketLabel)].filter(Boolean).join(' · ')||'Próximamente';const end=document.createElement(c.ticketUrl?'a':'b');end.textContent='↗';if(c.ticketUrl){end.href=c.ticketUrl;end.target='_blank';end.rel='noopener noreferrer'}row.append(time,strong,meta,end);dates.append(row)});}
function renderNext(c){const d=c.date?.toDate?.();nextDate.innerHTML=d?fmtDay.format(d).toUpperCase().replace(' ','<br>'):'PRÓXIMA<br>FECHA';nextTitle.textContent=locationOf(c)||'Va de Rumba en directo';nextMeta.textContent=[d&&fmtLong.format(d),txt(c.time)&&`${txt(c.time)} h`,txt(c.ticketLabel)].filter(Boolean).join(' · ');}
function emptyState(){nextDate.innerHTML='PRÓXIMA<br>FECHA';nextTitle.textContent='Nuevos directos en camino';nextMeta.textContent='Próximamente anunciaremos nuevas fechas.';dates.innerHTML='<div class="date-row"><time>2026</time><strong>Próximamente anunciaremos nuevas fechas</strong><span>Síguenos en redes para enterarte primero</span><b>↗</b></div>'}
const q=query(collection(db,'public_concerts'),where('status','==','scheduled'),where('date','>=',Timestamp.fromDate(madridStartOfToday())),orderBy('date','asc'));
onSnapshot(q,snap=>{if(snap.empty){emptyState();return}const items=snap.docs.map(d=>d.data());renderNext(items[0]);renderRows(items.slice(0,6));},err=>{console.error('No se pudieron cargar los conciertos públicos.',err);emptyState();});