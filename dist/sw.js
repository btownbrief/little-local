const CACHE='little-local-offline-v3.1';
const FILES=['./','./index.html','./style.css','./app.js','./engine.js','./content.js','./profile.js','./audio.js','./shelf-rules.js','./shelf-engine.js','./shelf-catalog.js','./shelf-ui.js','./shelf-worker.js','./manifest.webmanifest','./assets/goods-atlas.png','./assets/goods-expansion.png','./assets/shop-interior.png','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('little-local-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  const allowed=FILES.some(file=>new URL(file,self.location).pathname===url.pathname);
  if(!allowed)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match('./'))));
  }else{
    event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match(request,{ignoreSearch:true}))));
  }
});
