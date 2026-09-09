'use strict';
// Commit only an immutable, validated snapshot through a separate Git index.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const R=require('./release.cjs'),dir=path.join(R.ROOT,'.sync');fs.mkdirSync(dir,{recursive:true});
const statusFile=path.join(dir,'status.json');
function status(state,message){const value={time:new Date().toISOString(),pid:process.pid,state,message};fs.writeFileSync(statusFile,JSON.stringify(value,null,2));console.log(state+': '+message);}
function git(args,options={}){const r=cp.spawnSync('git',args,{cwd:R.ROOT,encoding:'utf8',timeout:60000,windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never',...options.env},input:options.input});if(r.error||r.status!==0)throw Error('git '+args[0]+' failed: '+(r.error?.message||r.stderr||r.stdout).trim());return r.stdout.trim();}
function locked(fn){const file=path.join(dir,'publish.lock');let fd;try{fd=fs.openSync(file,'wx');fs.writeFileSync(fd,String(process.pid));}catch{throw Error('Publisher lock exists. Check service status before recovering stale .sync/publish.lock.');}try{return fn();}finally{fs.closeSync(fd);fs.unlinkSync(file);}}
function synchronize(){return locked(()=>{
 if(git(['branch','--show-current'])!=='main')throw Error('Switch to main before publishing');
 const remote=git(['config','--get','remote.origin.url']);if(!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(remote)&&!/^git@github\.com:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(remote))throw Error('origin must be a normal GitHub URL without embedded credentials');
 if(git(['diff','--cached','--name-only']))throw Error('Git staging area is not empty; finish or unstage your manual work first');
 if(git(['ls-files','-u']))throw Error('Resolve Git conflicts manually');
 if(git(['diff','--name-only','--','tools/release.cjs','tools/sync.cjs','schemas','weekly.js']))throw Error('Validation/renderer code has uncommitted changes; complete the engineering release first');
 const before=git(['rev-parse','HEAD']);
 const files=R.capture(),meta=R.metadata(files),snapshot={...files,...meta};
 const tracked=git(['ls-files','--','data','version.json']).split('\n').filter(p=>R.AUTO(p));
 for(const p of tracked)if(!(p in snapshot))throw Error('Automatic deletion is prohibited: '+p);
 // Fetch may fail without losing or resetting any local data. Retry next cycle.
 git(['fetch','origin','main']);const upstream=git(['rev-parse','origin/main']);
 try{git(['merge-base','--is-ancestor',upstream,before]);}catch{throw Error('Remote main has diverged/advanced; reconcile it manually. No reset or force push was performed.');}
 const pending=git(['rev-list',upstream+'..'+before]).split('\n').filter(Boolean);
 for(const commit of pending){const changed=git(['diff-tree','-m','--no-commit-id','--name-only','-r',commit]).split('\n').filter(Boolean);if(changed.some(p=>!R.AUTO(p)))throw Error('Unpushed engineering commit detected; publish it manually once before enabling course sync');}
 const indexFile=path.join(dir,'publish-index-'+process.pid),env={GIT_INDEX_FILE:indexFile};
 try{
  git(['read-tree',before],{env});const blobs=[];
  for(const [p,text]of Object.entries(snapshot)){const blob=git(['hash-object','-w','--stdin'],{input:text});git(['update-index','--add','--cacheinfo','100644',blob,p],{env});blobs.push([p,blob]);}
  const tree=git(['write-tree'],{env});let head=before;
  if(tree!==git(['rev-parse',before+'^{tree}'])){
   // Revalidate the actual staged bytes, not mutable working files.
   const staged={};
   // git() trims text; use raw blob reads to preserve exact hashes and whitespace.
   for(const p of Object.keys(files)){const out=cp.spawnSync('git',['show',':'+p],{cwd:R.ROOT,encoding:'utf8',windowsHide:true,env:{...process.env,...env}});if(out.status!==0)throw Error('Cannot read staged '+p);staged[p]=out.stdout;}
   const stagedMeta=R.metadata(staged);if(stagedMeta['version.json']!==meta['version.json'])throw Error('Staged snapshot changed');
   head=git(['commit-tree',tree,'-p',before],{input:'Publish course '+JSON.parse(meta['version.json']).courseVersion.slice(0,12)+'\n'});
   if(git(['diff','--cached','--name-only']))throw Error('Manual staging detected during publication; retry after completing it');
   git(['update-ref','refs/heads/main',head,before]);
   // Align only our approved paths in the ordinary index; unrelated working files stay untouched.
   for(const [p,blob]of blobs)git(['update-index','--add','--cacheinfo','100644',blob,p]);
   if(R.signature(R.capture())===R.signature(files)){R.writeChanged(R.ROOT,meta);R.bundle(R.ROOT,files);}
  }
  git(['push','origin',head+':refs/heads/main']);status('ok',head===before&&before===upstream?'No course changes; already synchronized':'Published '+head.slice(0,12));
 }finally{if(fs.existsSync(indexFile))fs.unlinkSync(indexFile);}
 });}
const mode=process.argv[2]||'once';
if(mode==='status'){console.log(fs.existsSync(statusFile)?fs.readFileSync(statusFile,'utf8'):'No sync run yet');}
else if(mode==='recover'){const file=path.join(dir,'publish.lock');if(!fs.existsSync(file))console.log('No stale lock');else{const pid=Number(fs.readFileSync(file,'utf8'));let alive=true;try{process.kill(pid,0);}catch(e){if(e.code==='ESRCH')alive=false;}if(alive){console.error('PID is active or cannot be verified; refusing to remove lock');process.exitCode=1;}else{fs.unlinkSync(file);console.log('Removed stale lock for exited PID '+pid);}}}
else if(mode==='once'){try{synchronize();}catch(e){status('error',e.message);process.exitCode=1;}}
else if(mode==='watch'){
 let previous=null;
 const tick=()=>{try{const next=R.signature(R.capture());if(next===previous)synchronize();else status('waiting','Waiting for course files to remain stable for 30 seconds');previous=next;}catch(e){status('error',e.message);}};
 tick();setInterval(tick,30000);
}else{console.error('Use once, watch or status');process.exitCode=1;}
