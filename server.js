#!/usr/bin/env node
/* ExcelNation CBT Edu — server sinkronisasi (tanpa dependensi). Jalankan: node server.js
   Pengaturan lewat environment: PORT, HOST, DATA_DIR, TEACHER_CODE, TRUST_PROXY=1 (bila di belakang Caddy/Nginx) */
'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),zlib=require('zlib'),crypto=require('crypto');
const PORT=+process.env.PORT||8080, HOST=process.env.HOST||'0.0.0.0', TRUST=process.env.TRUST_PROXY==='1';
const DATA_DIR=path.resolve(process.env.DATA_DIR||__dirname), DATA=path.join(DATA_DIR,'excelnation-data.json'), BAK=path.join(DATA_DIR,'backups');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const TEACHER=process.env.TEACHER_CODE?sha(String(process.env.TEACHER_CODE).trim()):'e71528abf228cf68f827c130d65e94fd788e99d23d4934b30d7ce48e58b3fea4';
const HTML=path.join(__dirname,'ExcelNation-CBT-Edu.html');
fs.mkdirSync(DATA_DIR,{recursive:true});
let store=new Map(), ver=0, unlocked=new Map(); // unlocked: nis -> Set(examId)
try{ const j=JSON.parse(fs.readFileSync(DATA,'utf8')); ver=j.ver||0; Object.entries(j.data||{}).forEach(([k,v])=>store.set(k,v)); Object.entries(j.unlocked||{}).forEach(([n,a])=>unlocked.set(n,new Set(a))); console.log('Data dimuat:',store.size,'entri dari',DATA); }catch(e){ console.log('Data baru (belum ada berkas data).'); }
let dirty=false;
function snapshot(){ const o={}; store.forEach((v,k)=>o[k]=v); const u={}; unlocked.forEach((s,n)=>u[n]=[...s]); return JSON.stringify({ver,data:o,unlocked:u}); }
function dailyBackup(){ try{ fs.mkdirSync(BAK,{recursive:true}); const f=path.join(BAK,'excelnation-data-'+new Date().toISOString().slice(0,10)+'.json'); if(!fs.existsSync(f)&&fs.existsSync(DATA)) fs.copyFileSync(DATA,f);
  fs.readdirSync(BAK).filter(n=>/^excelnation-data-.*\.json$/.test(n)).sort().slice(0,-14).forEach(n=>fs.unlinkSync(path.join(BAK,n))); }catch(e){ console.error('Backup harian gagal:',e.message); } }
setInterval(()=>{ if(!dirty) return; dirty=false; fs.writeFile(DATA+'.tmp',snapshot(),err=>{ if(err) return console.error('Gagal menyimpan:',err.message); fs.rename(DATA+'.tmp',DATA,e=>{ if(e) console.error(e.message); else dailyBackup(); }); }); },2000);
function flush(){ try{ fs.writeFileSync(DATA,snapshot()); }catch(e){} }
['SIGINT','SIGTERM'].forEach(s=>process.on(s,()=>{ flush(); process.exit(0); }));
/* ---- keamanan: sesi guru, pembatasan percobaan ---- */
const tokens=new Map(); // token -> kedaluwarsa
setInterval(()=>{ const t=Date.now(); tokens.forEach((e,k)=>{ if(e<t) tokens.delete(k); }); fails.forEach((f,k)=>{ if(f.until<t&&t-f.first>f.win) fails.delete(k); }); },60000).unref();
const fails=new Map();
function blocked(key){ const f=fails.get(key); return !!(f&&f.until>Date.now()); }
function fail(key,max,win,lock){ const t=Date.now(); let f=fails.get(key); if(!f||t-f.first>win) f={n:0,first:t,until:0,win}; f.n++; if(f.n>=max) f.until=t+lock; fails.set(key,f); }
const ipOf=req=>TRUST?(String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||req.socket.remoteAddress):req.socket.remoteAddress;
const TEACHER_ONLY=/^(key:|cfg:|res:|bank:|man:)/;
const role=req=>{ const t=req.headers['x-teacher']; return t&&tokens.get(String(t))>Date.now()?'teacher':'student'; };
const nisOf=req=>String(req.headers['x-nis']||'').slice(0,20);
function canRead(k,r,nis){
  if(r==='teacher') return true; if(TEACHER_ONLY.test(k)) return false; if(k.startsWith('draft:')) return false;
  let m; if((m=k.match(/^(?:att|ctl):[^:]+:(.+)$/))) return m[1]===nis;
  if((m=k.match(/^qs:(.+)$/))) return !!(unlocked.get(nis)&&unlocked.get(nis).has(m[1]));
  return true;
}
function canWrite(k,r,nis,val){
  if(r==='teacher') return !k.startsWith('draft:'); let m;
  if((m=k.match(/^att:([^:]+):(.+)$/))){ if(m[2]!==nis) return false; const old=store.get(k); if(old&&old.val&&old.val.submitted&&!(val&&val.submitted)) return false; return true; }
  if((m=k.match(/^av:(.+)$/))) return m[1]===nis;
  return false;
}
const body=(req,max)=>new Promise((res,rej)=>{ let b='',n=0; req.on('data',c=>{ n+=c.length; if(n>max){ rej(new Error('413')); req.destroy(); return; } b+=c; }); req.on('end',()=>{ try{ res(JSON.parse(b||'{}')); }catch(e){ res({}); } }); req.on('error',()=>rej(new Error('abort'))); });
const HEAD={'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
const send=(res,code,obj,req)=>{ const s=JSON.stringify(obj); if(req&&s.length>4096&&/\bgzip\b/.test(req.headers['accept-encoding']||'')){ res.writeHead(code,{...HEAD,'Content-Type':'application/json','Cache-Control':'no-store','Content-Encoding':'gzip',Vary:'Accept-Encoding'}); return res.end(zlib.gzipSync(s,{level:3})); } res.writeHead(code,{...HEAD,'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(s); };
/* HTML: hash kode guru DIHAPUS dari berkas yang dikirim ke siswa (login guru diperiksa server) */
let hc={mt:0,raw:null,gz:null};
function page(cb){ fs.stat(HTML,(e,st)=>{ if(e) return cb(e); if(hc.mt===st.mtimeMs&&hc.gz) return cb(null,hc); fs.readFile(HTML,'utf8',(e2,t)=>{ if(e2) return cb(e2); t=t.replace(/const TEACHER_HASH = '[0-9a-f]{64}';/,"const TEACHER_HASH = '';"); const raw=Buffer.from(t); zlib.gzip(raw,{level:9},(e3,gz)=>{ if(e3) return cb(e3); hc={mt:st.mtimeMs,raw,gz}; cb(null,hc); }); }); }); }
http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://x'), r=role(req), nis=nisOf(req), ip=ipOf(req);
  try{
    if(u.pathname==='/healthz'){ res.writeHead(200,{...HEAD,'Content-Type':'text/plain'}); return res.end('ok'); }
    if(u.pathname==='/api/ping') return send(res,200,{app:'excelnation',now:Date.now()});
    if(u.pathname==='/api/whoami') return send(res,200,{role:r});
    if(u.pathname==='/api/teacher-login'&&req.method==='POST'){
      const key='tl:'+ip; if(blocked(key)) return send(res,429,{error:'Terlalu banyak percobaan. Coba lagi beberapa menit.'});
      const b=await body(req,4096); const h=sha(String(b.code||'').trim()); const ok=h.length===TEACHER.length&&crypto.timingSafeEqual(Buffer.from(h),Buffer.from(TEACHER));
      if(!ok){ fail(key,6,15*60e3,15*60e3); return send(res,403,{error:'Kode akses salah.'}); }
      const tk=crypto.randomBytes(24).toString('hex'); tokens.set(tk,Date.now()+12*3600e3); fails.delete(key); return send(res,200,{token:tk});
    }
    if(u.pathname==='/api/changes'){ const since=+u.searchParams.get('since')||0; if(since>=ver) return send(res,200,{v:ver,now:Date.now(),changes:[]}); const ch=[]; store.forEach((e,k)=>{ if(e.ver>since&&canRead(k,r,nis)) ch.push({k,val:e.val,ts:e.ts}); }); return send(res,200,{v:ver,now:Date.now(),changes:ch},req); }
    if(u.pathname==='/api/batch'&&req.method==='POST'){ const b=await body(req,r==='teacher'?120e6:4e6); let n=0; (b.items||[]).forEach(it=>{ if(!it||typeof it.k!=='string'||!canWrite(it.k,r,nis,it.val)) return; const old=store.get(it.k); if(old&&old.ts>it.ts) return; store.set(it.k,{val:it.val,ts:it.ts||Date.now(),ver:++ver}); n++; }); if(n) dirty=true; return send(res,200,{ok:true,n,v:ver,now:Date.now()}); }
    if(u.pathname==='/api/unlock'&&req.method==='POST'){
      const b=await body(req,4096), key='ul:'+nis+':'+ip; if(blocked(key)) return send(res,429,{error:'Terlalu banyak kode salah. Tunggu 5 menit.'});
      const ex=store.get('exam:'+b.id), cf=store.get('cfg:'+b.id), qs=store.get('qs:'+b.id);
      if(!ex||!ex.val||!cf||!qs) return send(res,404,{error:'Ujian tidak ditemukan'});
      if(String(b.code||'').trim().toUpperCase()!==String(cf.val.code).toUpperCase()){ fail(key,10,10*60e3,5*60e3); return send(res,403,{error:'Kode salah'}); }
      const t=Date.now(); if(t<ex.val.start-2000||t>=ex.val.end) return send(res,403,{error:'Di luar jadwal ujian'});
      if(!unlocked.has(nis)) unlocked.set(nis,new Set()); unlocked.get(nis).add(b.id); dirty=true; return send(res,200,{qs:qs.val});
    }
    if(['/manifest.webmanifest','/icon-192.png','/icon-512.png','/icon-180.png','/icon-maskable-512.png','/sw.js','/apple-touch-icon.png','/favicon.ico'].includes(u.pathname)){ const alias={'/apple-touch-icon.png':'icon-180.png','/favicon.ico':'icon-192.png'}; const f=path.join(__dirname,alias[u.pathname]||u.pathname.slice(1)); return fs.readFile(f,(e,d)=>{ if(e){ res.writeHead(404,HEAD); return res.end(); } const sw=u.pathname==='/sw.js'; res.writeHead(200,{...HEAD,'Cache-Control':sw?'no-cache':'public, max-age=86400','Content-Type':sw?'application/javascript; charset=utf-8':(/\.(png|ico)$/.test(u.pathname)?'image/png':'application/manifest+json'),...(sw?{'Service-Worker-Allowed':'/'}:{})}); res.end(d); }); }
    if(u.pathname==='/'||u.pathname==='/index.html'){ return page((e,c)=>{ if(e){ res.writeHead(500,HEAD); return res.end('ExcelNation-CBT-Edu.html tidak ditemukan di folder server.'); } const gz=/\bgzip\b/.test(req.headers['accept-encoding']||''); res.writeHead(200,{...HEAD,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store',Vary:'Accept-Encoding',...(gz?{'Content-Encoding':'gzip'}:{})}); res.end(gz?c.gz:c.raw); }); }
    res.writeHead(404,HEAD); res.end('Not found');
  }catch(e){ if(e&&e.message==='413'){ res.writeHead(413,HEAD); return res.end('Terlalu besar'); } if(e&&e.message==='abort') return; console.error(e); try{ res.writeHead(500,HEAD); res.end('error'); }catch(_){} }
}).listen(PORT,HOST,()=>{
  console.log('\n  ExcelNation CBT Edu — server berjalan\n');
  console.log(`  Data disimpan di: ${DATA}`);
  Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).forEach(i=>console.log(`  Jaringan lokal:  http://${i.address}:${PORT}/`));
  console.log(`  Di komputer ini: http://localhost:${PORT}/\n`);
});
