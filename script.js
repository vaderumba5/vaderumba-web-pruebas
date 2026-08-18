import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { collection, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const fixes=document.createElement('style');
fixes.textContent=`
.header{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translateY(-16px)!important;background:rgba(8,8,8,.92)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;backdrop-filter:blur(16px)!important;transition:.25s!important}
.header.scrolled{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:none!important}
.logo-name{display:none!important}
.logo{overflow:hidden!important;border-radius:12px!important}
.logo img,.footer-logo img{content:url('vr-logo-dorado.svg')!important;object-fit:contain!important;object-position:center!important;transform:none!important;transform-origin:center!important}
.hero{position:relative!important;overflow:hidden!important;background:#090909!important}
.hero-media{position:absolute!important;inset:0!important;background-image:linear-gradient(180deg,rgba(0,0,0,.12) 0%,rgba(0,0,0,.05) 28%,rgba(0,0,0,.40) 64%,rgba(0,0,0,.94) 100%),linear-gradient(90deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,.08) 40%,rgba(0,0,0,.22) 100%),url('portada.jpeg')!important;background-size:cover!important;background-position:center 26%!important;background-repeat:no-repeat!important}
.hero-content{position:absolute!important;z-index:2!important}
.hero-title{position:relative!important;z-index:3!important;max-width:270px!important;text-shadow:0 5px 28px rgba(0,0,0,.55)!important}
.hero-title span{display:block!important}
.hero-bottom{position:relative!important;z-index:3!important}
@media(max-width:680px){
  .header{height:62px!important;padding-top:env(safe-area-inset-top)!important}
  .header-inner{width:calc(100% - 22px)!important}
  .logo{width:58px!important;height:50px!important}
  .logo img{width:58px!important;height:50px!important;object-fit:contain!important}
  .footer-logo img{width:82px!important;height:auto!important;object-fit:contain!important}
  .menu-btn{margin-left:auto!important}
  .hero{height:620px!important;min-height:620px!important;max-height:620px!important;padding:0!important;overflow:hidden!important}
  .hero-media{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;background-position:center 22%!important}
  .hero-content{left:16px!important;right:16px!important;top:auto!important;bottom:22px!important;transform:none!important;width:auto!important;margin:0!important;padding:0!important}
  .hero-title{font-size:clamp(58px,18vw,82px)!important;line-height:.82!important;letter-spacing:.005em!important;margin:0 0 14px!important;max-width:260px!important}
  .hero-bottom{display:block!important;border-top:1px solid rgba(255,255,255,.34)!important;padding-top:11px!important}
  .hero-copy{font-size:16px!important;line-height:1.35!important;margin:0 0 16px!important;text-shadow:0 2px 12px rgba(0,0,0,.78)!important}
  .hero-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important}
  .hero-actions .btn{min-width:0!important;min-height:46px!important;padding:0 10px!important;font-size:10px!important}
  h2,.statement h2,.band h2{font-size:44px!important;line-height:.93!important;letter-spacing:0!important}
  .section{padding:58px 0!important}
  .statement-grid,.band-intro,.booking-grid{gap:22px!important}
  .section-head{gap:15px!important;margin-bottom:26px!important}
}
@media(max-width:390px){
  .hero{height:590px!important;min-height:590px!important;max-height:590px!important}
  .hero-content{left:14px!important;right:14px!important;bottom:18px!important}
  .hero-title{font-size:54px!important;max-width:220px!important}
  .hero-copy{font-size:14px!important}
  h2,.statement h2,.band h2{font-size:40px!important}
}
`;
document.head.appendChild(fixes);

const heroTitle=document.querySelector('.hero-title');
if(heroTitle){heroTitle.innerHTML='<span>VA DE</span><span>RUMBA</span>';}

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
function renderRows(items){if(!dates)return;dates.replaceChildren();items.forEach(c=>{const d=c.date?.toDate?.();const row=document.createElement('div');row.className='date-row';const time=document.createElement('time');time.textContent=d?fmtDay.format(d).toUpperCase():'FECHA';const strong=document.createElement('strong');strong.textContent=locationOf(c)||'Va de Rumba en directo';const meta=document.createElement('span');meta.textContent=[txt(c.time)&&`${txt(c.time)} h`,txt(c.ticketLabel)].filter(Boolean).join(' · ')||'Próximamente';const end=document.createElement(c.ticketUrl?'a':'b');end.textContent='↗';if(c.ticketUrl){end.href=c.ticketUrl;end.target='_blank';end.rel='noopener noreferrer'}row.append(time,strong,meta,end);dates.append(row)});}
function renderNext(c){if(!nextDate||!nextTitle||!nextMeta)return;const d=c.date?.toDate?.();nextDate.innerHTML=d?fmtDay.format(d).toUpperCase().replace(' ','<br>'):'PRÓXIMA<br>FECHA';nextTitle.textContent=locationOf(c)||'Va de Rumba en directo';nextMeta.textContent=[d&&fmtLong.format(d),txt(c.time)&&`${txt(c.time)} h`,txt(c.ticketLabel)].filter(Boolean).join(' · ');}
function emptyState(){if(nextDate)nextDate.innerHTML='PRÓXIMA<br>FECHA';if(nextTitle)nextTitle.textContent='Nuevos directos en camino';if(nextMeta)nextMeta.textContent='Próximamente anunciaremos nuevas fechas.';if(dates)dates.innerHTML='<div class="date-row"><time>2026</time><strong>Próximamente anunciaremos nuevas fechas</strong><span>Síguenos en redes para enterarte primero</span><b>↗</b></div>'}

const q=query(collection(db,'public_concerts'),where('status','==','scheduled'),where('date','>=',Timestamp.fromDate(madridStartOfToday())),orderBy('date','asc'));
onSnapshot(q,snap=>{if(snap.empty){emptyState();return}const items=snap.docs.map(d=>d.data());renderNext(items[0]);renderRows(items.slice(0,6));},err=>{console.error('No se pudieron cargar los conciertos públicos.',err);emptyState();});