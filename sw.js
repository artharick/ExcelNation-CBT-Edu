/* ExcelNation service worker — pasang ke layar utama + tetap terbuka saat sinyal putus */
const V='xn-v3';const SHELL=['./','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname==='/healthz') return;
  if(r.mode==='navigate'){ e.respondWith(fetch(r).then(res=>{ const c=res.clone(); caches.open(V).then(x=>x.put('./',c)); return res; }).catch(()=>caches.match('./'))); return; }
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); } return res; })));
});
