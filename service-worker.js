const CACHE='saenggo-progress-v2-11-0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./logo.png'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const isPage=event.request.mode==='navigate' || event.request.destination==='document';
  if(isPage){
    event.respondWith(fetch(event.request).then(resp=>{
      const copy=resp.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return resp;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(resp=>{
    const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return resp;
  })));
});
