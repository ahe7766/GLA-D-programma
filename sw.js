const CACHE='glad-test-v3-20260827';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/warmup.png','./assets/cooldown.png'];
for(let p=5;p<=14;p++)for(let l=1;l<=4;l++)CORE.push(`./assets/p${String(p).padStart(2,'0')}-l${l}.png`);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
