'use strict';
const cp=require('node:child_process');
async function api(endpoint,method='GET',body){
 const r=cp.spawnSync('git',['credential','fill'],{encoding:'utf8',input:'protocol=https\nhost=github.com\nusername=likairesearch-jpg\n\n',windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}});
 if(r.status!==0)throw Error('GitHub authentication unavailable. Run git credential-manager github login --username likairesearch-jpg --device');
 const credential=Object.fromEntries(r.stdout.trim().split(/\r?\n/).map(s=>{const i=s.indexOf('=');return[s.slice(0,i),s.slice(i+1)];}));
 if(!credential.password)throw Error('Credential Manager returned no credential');
 const response=await fetch('https://api.github.com/repos/likairesearch-jpg/N2_Daily_study_Plan/'+endpoint,{method,headers:{Authorization:'Bearer '+credential.password,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('GitHub API '+method+' '+endpoint+' returned HTTP '+response.status);
 return response.status===204?null:response.json();
}
module.exports=api;
if(require.main===module){const cmd=process.argv[2];(async()=>{
 if(cmd==='pages'){try{await api('pages');await api('pages','PUT',{build_type:'workflow'});}catch(e){if(!e.message.includes('HTTP 404'))throw e;await api('pages','POST',{build_type:'workflow'});}console.log('Pages source configured: GitHub Actions');}
 else if(cmd==='status'){const runs=await api('actions/runs?per_page=3');console.log(JSON.stringify(runs.workflow_runs.map(r=>({id:r.id,status:r.status,conclusion:r.conclusion,url:r.html_url,sha:r.head_sha})),null,2));}
 else throw Error('Use pages or status');
})().catch(e=>{console.error(e.message);process.exitCode=1;});}
