'use strict';
(() => {
 const status=s=>{document.querySelector('#app-status').textContent=s;};
 if('serviceWorker'in navigator&&location.protocol!=='file:'){
  let controlled=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled){location.reload();}controlled=true;});
  navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).then(reg=>{
   const check=()=>reg.update().catch(()=>{});check();setInterval(check,5*60*1000);window.addEventListener('online',check);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});status('桌面 PWA 已就绪');
  }).catch(e=>status('离线程序安装失败：'+e.message));
 }
 let install;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();install=e;document.querySelector('#install-app').hidden=false;});
 document.querySelector('#install-app').onclick=async()=>{if(install){await install.prompt();install=null;document.querySelector('#install-app').hidden=true;}};
 document.querySelector('#check-updates').onclick=()=>window.N2CheckUpdates?.();
 document.querySelector('#retry-load').onclick=()=>location.reload();
 document.querySelector('#export-progress').onclick=()=>{const data=JSON.parse(localStorage.getItem('n2-daily-v1')||'{}');const url=URL.createObjectURL(new Blob([JSON.stringify({format:'n2-progress-v1',data},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='n2-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 document.querySelector('#import-progress').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;const v=JSON.parse(await file.text());if(v.format!=='n2-progress-v1'||!v.data||typeof v.data!=='object'||Array.isArray(v.data))throw Error('不是 N2 进度备份');if(!confirm('导入将合并进度；同名记录使用备份中的值。继续？'))return;const old=JSON.parse(localStorage.getItem('n2-daily-v1')||'{}');const merged={...old,...v.data};for(const k of ['status','positions','notes','revealed','answers'])merged[k]={...(old[k]||{}),...(v.data[k]||{})};localStorage.setItem('n2-daily-v1',JSON.stringify(merged));location.reload();}catch(err){status('导入失败：'+err.message);}};
})();
