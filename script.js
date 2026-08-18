import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { collection, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const fixes=document.createElement('style');
fixes.textContent=`
.logo img{content:url('vr-logo-dorado.png')!important;object-fit:contain!important;transform:none!important;border-radius:0!important;background:transparent!important}
.header{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translateY(-14px)!important;background:rgba(8,8,8,.94)!important;border-bottom:1px solid rgba(255,255,255,.10)!important;backdrop-filter:blur(16px)!important;transition:.22s!important}
.header.scrolled{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:none!important}
@media(max-width:680px){
  .header{height:62px!important;padding-top:env(safe-area-inset-top)!important}
  .header-inner{width:calc(100% - 22px)!important}
  .logo{overflow:visible!important;border-radius:0!important}
  .logo img{width:54px!important;height:54px!important}
  .menu-btn{margin-left:auto!important}
  .hero{position:relative!important;height:560px!important;min-height:560px!important;max-height:560px!important;overflow:hidden!important;background:#090909!important;padding:0!important}
  .hero-media{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;aspect-ratio:auto!important;background-image:linear-gradient(180deg,rgba(0,0,0,.04) 0%,rgba(0,0,0,.03) 34%,rgba(0,0,0,.22) 56%,rgba(0,0,0,.88) 100%),url('portada.jpeg')!important;background-size:cover!important;background-position:center 28%!important;background-repeat:no-repeat!important}
  .hero-content{position:absolute!important;z-index:3!important;left:28px!important;right:28px!important;top:auto!important;bottom:40px!important;transform:none!important;width:auto!important;margin:0!important;padding:0!important}
  .hero-title{font-size:clamp(62px,17vw,78px)!important;line-height:.80!important;letter-spacing:.005em!important;margin:0 0 16px!important;max-width:330px!important;text-shadow:0 5px 28px rgba(0,0,0,.72)!important}
  .hero-bottom{display:block!important;border-top:1px solid rgba(255,255,255,.34)!important;padding-top:12px!important}
  .hero-copy{font-size:16px!important;line-height:1.35!important;margin:0 0 16px!important;text-shadow:0 2px 12px rgba(0,0,0,.78)!important}
  .hero-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;width:100%!important}
  .hero-actions .btn{min-width:0!important;min-height:48px!important;padding:0 10px!important;font-size:10px!important}
  h2,.statement h2,.band h2{font-size:clamp(46px,13.5vw,58px)!important;line-height:.91!important;letter-spacing:0!important}
  .section{padding:62px 0!important}
  .statement-grid,.band-intro,.booking-grid{gap:24px!important}
  .section-head{gap:16px!important;margin-bottom:28px!important}
}
@media(max-width:390px){
  .hero{height:530px!important;min-height:530px!important;max-height:530px!important}
  .hero-content{left:22px!important;right:22px!important;bottom:34px!important}
  .hero-title{font-size:58px!important;max-width:290px!important}
  .hero-copy{font-size:15px!important}
}
`;
document.head.appendChild(fixes);

document.querySelectorAll('.logo img,.footer-logo img').forEach(img=>{img.src='vr-logo-dorado.png';img.removeAttribute('srcset');});

const header=document.getElementById('header');
function updateHeader(){header?.classList.toggle('scrolled',window.scrollY>70)}
updateHeader();
window.addEventListener('scroll',updateHeader,{passive:true});

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