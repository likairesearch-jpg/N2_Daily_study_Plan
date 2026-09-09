'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const R=require('../tools/release.cjs'),dist=path.join(R.ROOT,'dist');
(async()=>{
 // Serve at the same subdirectory shape as GitHub Pages, including offline SW scope.
 const prefix='/N2_Daily_study_Plan/';
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith(prefix)){res.writeHead(404).end();return;}const rel=url.pathname.slice(prefix.length)||'index.html',file=path.resolve(dist,rel);if(!file.startsWith(dist+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':({'.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html','.png':'image/png'})[path.extname(file)]||'text/plain','Cache-Control':'no-store'});res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+prefix;
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXE?{executablePath:process.env.BROWSER_EXE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:960}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const originals={};for(const p of ['version.json','data/index.json','data/course-policy.json','service-worker.js'])originals[p]=fs.readFileSync(path.join(dist,p),'utf8');
 try{
  await page.goto(url);await page.waitForSelector('#card h1');await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await page.locator('#week option').count(),2);
  await page.selectOption('#week','2');await page.selectOption('#day','day008');await page.click('[data-status="green"]');
  const saved=await page.evaluate(()=>localStorage.getItem('n2-daily-v1'));
  fs.mkdirSync(path.join(R.ROOT,'.sync'),{recursive:true});await page.screenshot({path:path.join(R.ROOT,'.sync/desktop.png'),fullPage:true});
  const changed={...R.capture()},policy=JSON.parse(changed['data/course-policy.json']);policy.infrastructureBrowserTest=true;changed['data/course-policy.json']=JSON.stringify(policy);
  const meta=R.metadata(changed);R.writeChanged(dist,{'data/course-policy.json':changed['data/course-policy.json'],...meta});
  await page.click('#check-updates');const version=JSON.parse(meta['version.json']).courseVersion.slice(0,8);await page.waitForFunction(v=>document.querySelector('#update-status').textContent.includes(v),version);
  assert.equal(await page.inputValue('#day'),'day008');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('n2-daily-v1')).status['day008-intro']),'green');
  // Partial deployment must preserve the last good complete snapshot.
  R.writeChanged(dist,{'version.json':originals['version.json'],'data/index.json':originals['data/index.json']});
  await page.click('#check-updates');await page.waitForFunction(()=>document.querySelector('#update-status').textContent.includes('hash mismatch'));
  assert.equal(await page.locator('#card h1').count(),1);
  await context.setOffline(true);await page.reload();await page.waitForSelector('#card h1',{timeout:25000});assert.equal(await page.inputValue('#day'),'day008');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('n2-daily-v1')).status['day008-intro']),'green');
  await context.setOffline(false);R.writeChanged(dist,originals);await page.click('#check-updates');await page.waitForFunction(v=>document.querySelector('#update-status').textContent.includes(v),JSON.parse(originals['version.json']).courseVersion.slice(0,8));
  // Force a new shell revision at this test origin; controllerchange reloads safely.
  fs.writeFileSync(path.join(dist,'service-worker.js'),originals['service-worker.js'].replace(/const REVISION='[^']+'/,"const REVISION='browser-update-test'"));
  await page.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration()).update();});
  await page.waitForFunction(async()=>{const keys=await caches.keys();return keys.some(k=>k.endsWith('browser-update-test'));});
  await page.waitForSelector('#card h1');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('n2-daily-v1')).status['day008-intro']),'green');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS real browser: desktop rendering, Pages subpath, dynamic JSON update, hash mismatch fallback, offline reload, SW upgrade, progress retained, no JS errors.');
 }finally{R.writeChanged(dist,originals);await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
