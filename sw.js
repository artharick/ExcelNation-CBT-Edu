/* ExcelNation service worker — pasang ke layar utama + tetap terbuka saat sinyal putus */
const V='xn-v4';const SHELL=['./','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname==='/healthz') return;
  if(r.mode==='navigate'){ e.respondWith(fetch(r).then(res=>{ const c=res.clone(); caches.open(V).then(x=>x.put('./',c)); return res; }).catch(()=>caches.match('./'))); return; }
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); } return res; })));
});

self.addEventListener('push',e=>{ e.waitUntil((async()=>{ let n={title:'ExcelNation',body:'Ada pembaruan ujian. Buka aplikasi.',tag:'xn'}; try{ const r=await fetch('api/notice',{cache:'no-store'}); if(r.ok) n=await r.json(); }catch(_){} await self.registration.showNotification(n.title,{body:n.body,icon:'icon-192.png',badge:'icon-192.png',tag:n.tag||'xn',renotify:true,vibrate:[200,100,200],data:{url:'./'}}); })()); });
self.addEventListener('notificationclick',e=>{ e.notification.close(); e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{ for(const c of l){ if('focus' in c) return c.focus(); } return clients.openWindow('./'); })); });
