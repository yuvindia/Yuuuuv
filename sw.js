const C="yuuuuv-v1";
const SHELL=["./","index.html","app1.js","app2.js","app3.js","app4.js","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=="GET")return;
 if(u.origin!==location.origin&&u.hostname!=="cdn.jsdelivr.net")return;
 e.respondWith(caches.open(C).then(async c=>{
  const hit=await c.match(r,{ignoreSearch:true});
  const net=fetch(r).then(res=>{if(res.ok||res.type==="opaque")c.put(r.url.split("?")[0],res.clone());return res}).catch(()=>hit);
  return hit||net;
 }));
});
