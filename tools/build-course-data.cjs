// Compatible entry point; discovers all course weeks.
const cp=require('node:child_process');const r=cp.spawnSync(process.execPath,[require('node:path').join(__dirname,'release.cjs'),'prepare'],{stdio:'inherit',windowsHide:true});process.exitCode=r.status||0;
