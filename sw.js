/* Cache only our application assets. Third-party services/tiles are never preloaded. */
const CACHE='souhaits-v9.0.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/icon.svg','./assets/theme.js?v=9.0.0','./assets/app.css?v=9.0.0','./assets/app.js?v=9.0.0','./assets/territoires.js?v=9.0.0','./assets/local-tools.js?v=9.0.0','./assets/departements.js','./assets/vendor/leaflet/leaflet.js','./assets/vendor/leaflet/leaflet.css'];
const ALLOWED=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('souhaits-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&[new URL('./',self.registration.scope).pathname,new URL('./index.html',self.registration.scope).pathname].includes(url.pathname)){
  event.respondWith(fetch(request).then(async response=>{if(response.ok){try{const cache=await caches.open(CACHE);await cache.put(new URL('./index.html',self.registration.scope),response.clone());}catch(_error){}}return response;}).catch(()=>caches.match(new URL('./index.html',self.registration.scope))));return;
 }
 if(ALLOWED.has(url.href))event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
