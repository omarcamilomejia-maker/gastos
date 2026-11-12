/* Ocarisa · modo sin internet. Páginas: primero la red (así siempre carga la última versión) y, si no hay red, la copia guardada. La API de Google nunca se guarda. */
const C="ocarisa-salud-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.indexOf("ocarisa-salud-")===0&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const conTiempo=(p,ms)=>Promise.race([p,new Promise((_,ko)=>setTimeout(()=>ko(new Error("lento")),ms))]);
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET")return;
  if(u.hostname==="script.google.com"||u.hostname.endsWith("googleusercontent.com"))return;
  const esPagina=r.mode==="navigate"||(u.origin===location.origin&&/\/(index\.html)?$/.test(u.pathname));
  if(esPagina){
    e.respondWith(conTiempo(fetch(r,{cache:"no-store"}),6000).then(async res=>{if(res&&res.redirected){const b=await res.clone().blob();res=new Response(b,{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}})}if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put("./index.html",cp))}return res})
      .catch(()=>caches.match("./index.html").then(h=>h||caches.match("./"))));
    return}
  if(u.origin===location.origin||u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>hit);return hit||net}))}
});
