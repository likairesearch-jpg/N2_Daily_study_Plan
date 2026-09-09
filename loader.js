'use strict';
// A single cache entry commits a complete, hash-verified course snapshot atomically.
(() => {
 const base=new URL('./',location.href),cacheName='n2-course-snapshot-'+base.pathname;
 const key=new URL('_course_snapshot',base).href;
 const status=s=>{const e=document.querySelector('#update-status');if(e)e.textContent=s;};
 const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),x=>x.toString(16).padStart(2,'0')).join('');
 async function network(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{const r=await fetch(new URL(url,base),{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.text();}finally{clearTimeout(timer);}}
 function mergedKnowledge(data){const k=structuredClone(data['data/knowledge-index.json']);for(const kind of ['vocabulary','grammar']){const map=new Map(k[kind].map(x=>[x.id,x]));for(const w of Object.values(data).filter(x=>Array.isArray(x.days)))for(const d of w.days)for(const v of d[kind]||[]){const id=v.conceptId||v.knowledgeId;if(!id||map.has(id))continue;map.set(id,kind==='vocabulary'?{id,word:v.word.display,text:v.word,reading:v.reading,meaningZh:v.word.translationZh}:{id,form:v.form.display,formText:v.form,meaningZh:v.meaningZh,examples:v.examples});}k[kind]=[...map.values()];}return k;}
 let current=null,busy=false,started=false;
 function apply(snapshot){const legacyChanged=started&&JSON.stringify(window.N2_DAY)!==JSON.stringify(snapshot.data['data/day001.json']);window.N2_DAY=snapshot.data['data/day001.json'];window.N2_WEEKS=snapshot.index.weeks.map(w=>snapshot.data[w.url]);window.N2_KNOWLEDGE=mergedKnowledge(snapshot.data);current=snapshot;if(legacyChanged){location.reload();return;}if(started&&window.N2RefreshCourses)window.N2RefreshCourses();}
 async function check(){if(busy)return;busy=true;try{
  const version=JSON.parse(await network('version.json?t='+Date.now()));
  if(version.schemaVersion!==1||!/^[a-f0-9]{64}$/.test(version.indexSha256)||version.index!=='data/index.json'||version.courseVersion!==version.indexSha256)throw Error('Invalid version metadata');
  if(current?.version.courseVersion===version.courseVersion){status('课程已是最新 · '+version.courseVersion.slice(0,8));return;}
  const indexText=await network(version.index+'?v='+version.courseVersion);
  if(await digest(indexText)!==version.indexSha256)throw Error('Index hash mismatch');
  const index=JSON.parse(indexText);if(index.schemaVersion!==1||!Array.isArray(index.files)||!Array.isArray(index.weeks))throw Error('Unsupported course index');
  const data={};await Promise.all(index.files.map(async f=>{if(!/^data\/(week[0-9]{2,}\.json|day001\.json|knowledge-index\.json|course-policy\.json)$/.test(f.url)||!/^[a-f0-9]{64}$/.test(f.sha256))throw Error('Invalid course file path');const text=await network(f.url+'?v='+f.sha256);if(await digest(text)!==f.sha256)throw Error(f.url+': hash mismatch');data[f.url]=JSON.parse(text.replace(/^\uFEFF/,''));}));
  if(!data['data/day001.json']||!data['data/knowledge-index.json']||index.weeks.some(w=>!data[w.url]))throw Error('Incomplete course snapshot');
  const snapshot={version,index,data};
  let cached=true;try{const cache=await caches.open(cacheName);await cache.put(key,new Response(JSON.stringify(snapshot),{headers:{'Content-Type':'application/json'}}));}catch{cached=false;}
  apply(snapshot);status('课程已更新 · '+version.courseVersion.slice(0,8)+(cached?' · 可离线使用':' · 浏览器无法保存离线课程'));
 }catch(e){status((current?'更新暂不可用，使用上次完整课程':'课程加载失败，请联网后重试')+' · '+e.message);}finally{busy=false;}}
 function script(src){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=reject;document.head.append(el);});}
 async function start(){
  if(location.protocol==='file:'){await script('data/day001.js');await script('data/course-bundle.js');status('本地文件模式：不支持自动更新/PWA，请使用网站地址');}
  else {try{const cache=await caches.open(cacheName),r=await cache.match(key);if(r)apply(await r.json());}catch{}await check();if(!current){document.querySelector('#retry-load').hidden=false;return;}}
  await script('weekly.js');await script('app.js');started=true;
  if(location.protocol!=='file:'){setInterval(check,5*60*1000);window.addEventListener('online',check);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});}
 }
 window.N2CheckUpdates=check;
 start().catch(e=>{status('启动失败：'+e.message);document.querySelector('#retry-load').hidden=false;});
})();
