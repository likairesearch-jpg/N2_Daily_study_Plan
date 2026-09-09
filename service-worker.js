'use strict';
const REVISION='__BUILD_REVISION__';
const PREFIX='n2-shell-'+new URL(self.registration.scope).pathname+'-';
const CACHE=PREFIX+REVISION;
const SHELL=['./','index.html','style.css','app.js','weekly.js','loader.js','pwa.js','manifest.json','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(SHELL.map(p=>new Request(new URL(p,self.registration.scope),{cache:'reload'})));await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith(PREFIX)&&k!==CACHE)await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 const relative=url.pathname.slice(new URL(self.registration.scope).pathname.length);
 // Course network requests never fall back individually: loader commits complete snapshots.
 if(relative.startsWith('data/')||relative==='version.json'){e.respondWith(fetch(e.request,{cache:'no-store'}));return;}
 if(SHELL.includes(relative)||relative==='')e.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(new URL(relative||'./',self.registration.scope));return hit||fetch(e.request);})());
});
