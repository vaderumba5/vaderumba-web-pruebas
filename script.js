import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { collection, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const mobileFixes=document.createElement('style');
mobileFixes.textContent=`
.header{background:transparent!important;border-bottom:0!important;backdrop-filter:none!important;box-shadow:none!important}
.header.scrolled{background:rgba(8,8,8,.92)!important;border-bottom:1px solid rgba(255,255,255,.12)!important;backdrop-filter:blur(16px)!important;box-shadow:0 8px 28px rgba(0,0,0,.18)!important}
.logo-name{display:none!important}
.logo{overflow:hidden;border-radius:12px}
.logo img{width:58px!important;height:52px!important;object-fit:cover!important;object-position:center!important;transform:scale(1.18);transform-origin:center}
@media(max-width:680px){
  .header{height:62px!important;padding-top:env(safe-area-inset-top)}
  .header-inner{width:calc(100% - 22px)!important}
  .logo{width:56px;height:50px}
  .logo img{width:58px!important;height:52px!important;transform:scale(1.22)}
  .menu-btn{margin-left:auto}
  .hero{position:relative!important;height:430px!important;min-height:430px!important;max-height:430px!important;overflow:hidden!important;background:#090909!important;padding:0!important}
  .hero-media{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;aspect-ratio:auto!important;background-image:linear-gradient(180deg,rgba(0,0,0,.02) 0%,rgba(0,0,0,.04) 31%,rgba(9,9,9,.28) 43%,rgba(9,9,9,.76) 56%,#090909 76%),url('portada.jpeg')!important;background-size:100% auto!important;background-position:center top!important;background-repeat:no-repeat!important}
  .hero-content{position:absolute!important;z-index:2!important;left:16px!important;right:16px!important;top:142px!important;bottom:auto!important;transform:none!important;width:auto!important;margin:0!important;padding:0!important}
  .hero-title{font-size:48px!important;line-height:.82!important;letter-spacing:.005em!important;margin:0 0 12px!important;max-width:210px!important;text-shadow:0 4px 24px rgba(0,0,0,.72)!important}
  .hero-bottom{display:block!important;border-top:1px solid rgba(255,255,255,.34)!important;padding-top:10px!important}
  .hero-copy{font-size:15px!important;line-height:1.35!important;margin:0 0 14px!important;text-shadow:0 2px 12px rgba(0,0,0,.78)!important}
  .hero-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important}
  .hero-actions .btn{min-width:0!important;min-height:44px!important;padding:0 8px!important;font-size:10px!important}
  h2,.statement h2,.band h2{font-size:44px!important;line-height:.93!important;letter-spacing:0!important}
  .section{padding:58px 0!important}
  .statement-grid,.band-intro,.booking-grid{gap:22px!important}
  .section-head{gap:15px!important;margin-bottom:26px!important}
}
@media(max-width:390px){
  .hero{height:412px!important;min-height:412px!important;max-height:412px!important}
  .hero-content{top:132px!important;left:14px!important;right:14px!important}
  .hero-title{font-size:44px!important;max-width:190px!important}
  .hero-copy{font-size:14px!important}
  h2,.statement h2,.band h2{font-size:40px!important}
}
`;
document.head.appendChild(mobileFixes);

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