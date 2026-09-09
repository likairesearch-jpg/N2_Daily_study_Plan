require('./github.cjs')('actions/workflows/pages.yml/dispatches','POST',{ref:'main'}).then(()=>console.log('Deployment requested for main')).catch(e=>{console.error(e.message);process.exitCode=1;});
