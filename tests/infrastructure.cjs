'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const R=require('../tools/release.cjs');
const files=R.capture(),original=R.signature(files),meta=R.metadata(files);
assert.deepEqual(meta,R.metadata(files),'version generation must be deterministic');
let bad={...files,'data/week02.json':'{' };assert.throws(()=>R.validate(bad),/week02/);
const edit=fn=>{const clone={...files},w=JSON.parse(clone['data/week02.json']);fn(w);clone['data/week02.json']=JSON.stringify(w);return clone;};
assert.throws(()=>R.validate(edit(w=>w.days[0].day=15)),/days|date continuity/);
assert.throws(()=>R.validate(edit(w=>w.days[0].vocabulary[0].word.tts='')),/tts/);
assert.throws(()=>R.validate(edit(w=>w.days[0].reading.questions[0].answer='INVALID')),/answer/);
assert.throws(()=>R.validate(edit(w=>w.days[0].review.intervals[0].vocabularyIds.push('missing-reference'))),/unresolved/);
assert.throws(()=>R.validate(edit(w=>w.days[0].vocabulary.push(w.days[0].vocabulary[0]))),/duplicate card|duplicate new/);
assert.throws(()=>R.validate(edit(w=>w.days[0].date='2026-09-04')),/date continuity/);
assert.throws(()=>R.validate(edit(w=>w.days[0].counts.newVocabulary++)),/count/);
// Isolated local remote exercises real Git without publishing test content to GitHub.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'n2-infra-')),repo=path.join(temp,'repo'),remote=path.join(temp,'remote.git');fs.mkdirSync(repo);
const run=(cmd,args,cwd=repo,ok=true)=>{const r=cp.spawnSync(cmd,args,{cwd,encoding:'utf8',windowsHide:true,env:{...process.env,NODE_PATH:path.join(R.ROOT,'node_modules'),GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:path.join(temp,'empty-config'),GIT_TERMINAL_PROMPT:'0'}});if(ok&&r.status!==0)throw Error(r.stdout+r.stderr);return r;};
const git=(...args)=>run('git',args).stdout.trim();
for(const p of ['tools/release.cjs','tools/sync.cjs','tools/workflow.cjs','tools/reference.cjs','weekly.js','schemas/course.schema.json']){fs.mkdirSync(path.dirname(path.join(repo,p)),{recursive:true});fs.copyFileSync(path.join(R.ROOT,p),path.join(repo,p));}
fs.cpSync(path.join(R.ROOT,'data/reference'),path.join(repo,'data/reference'),{recursive:true});
R.writeChanged(repo,{...files,...meta,'.gitignore':'.sync/\ndata/*.js\n'});
git('init','-b','main');git('config','user.name','Infrastructure Test');git('config','user.email','test@example.invalid');git('add','.');git('commit','-m','Test baseline');
run('git',['init','--bare',remote]);git('remote','add','origin','https://github.com/n2-test/local.git');git('config','url.'+remote.replace(/\\/g,'/')+'.insteadOf','https://github.com/n2-test/local.git');git('push','-u','origin','main');
const once=ok=>run(process.execPath,['tools/sync.cjs','once'],repo,ok);
const baseline=git('rev-parse','HEAD');once(true);assert.equal(git('rev-parse','HEAD'),baseline,'no duplicate commit');
fs.writeFileSync(path.join(repo,'unrelated.txt'),'must never auto commit');
const policy=JSON.parse(files['data/course-policy.json']);policy.infrastructureTest=1;fs.writeFileSync(path.join(repo,'data/course-policy.json'),JSON.stringify(policy));once(true);
assert.notEqual(git('rev-parse','HEAD'),baseline);assert(!git('show','--pretty=','--name-only','HEAD').includes('unrelated'));
assert.equal(git('diff','--cached','--name-only'),'');const published=git('rev-parse','HEAD');once(true);assert.equal(git('rev-parse','HEAD'),published);
fs.writeFileSync(path.join(repo,'data/week02.json'),'{');assert.notEqual(once(false).status,0);assert.equal(git('rev-parse','HEAD'),published);assert.equal(fs.readFileSync(path.join(repo,'data/week02.json'),'utf8'),'{');
fs.writeFileSync(path.join(repo,'data/week02.json'),files['data/week02.json']);git('add','unrelated.txt');assert.notEqual(once(false).status,0,'must reject pre-existing manual staging');
assert.equal(R.signature(R.capture()),original,'real formal course data was untouched');
console.log('PASS: schema failures, deterministic versions, real isolated Git sync, no duplicate commits, no unrelated files, invalid data blocked, manual staging protected. Test fixture: '+temp);

// Draft rehearsal uses Week02 only inside the isolated test repository.
git('reset','HEAD','unrelated.txt');fs.mkdirSync(path.join(repo,'data/drafts'),{recursive:true});const draftPath=path.join(repo,'data/drafts/week02.json');
fs.writeFileSync(draftPath,'{');assert.notEqual(run(process.execPath,['tools/workflow.cjs','promote','--week=2'],repo,false).status,0);assert.equal(git('rev-parse','HEAD'),published);
const rehearsal=JSON.parse(files['data/week02.json']);rehearsal.title+=' [ISOLATED TEST ONLY]';fs.writeFileSync(draftPath,JSON.stringify(rehearsal));
once(true);assert.equal(git('rev-parse','HEAD'),published,'draft cannot trigger commit');
run(process.execPath,['tools/workflow.cjs','validate','--week=2']);assert.equal(fs.readFileSync(path.join(repo,'data/week02.json'),'utf8'),files['data/week02.json']);
run(process.execPath,['tools/workflow.cjs','promote','--week=2']);once(true);const promoted=git('rev-parse','HEAD');assert.notEqual(promoted,published);assert(!git('show','--pretty=','--name-only','HEAD').includes('drafts'));assert(!fs.readFileSync(path.join(repo,'data/index.json'),'utf8').includes('drafts'));once(true);assert.equal(git('rev-parse','HEAD'),promoted);
fs.writeFileSync(path.join(repo,'data/week02.json'),JSON.stringify({...rehearsal,title:'Unapproved edit'}));assert.notEqual(once(false).status,0);assert.equal(git('rev-parse','HEAD'),promoted);
assert.equal(R.signature(R.capture()),original,'No rehearsal course escaped isolated repository');console.log('PASS draft -> validate -> promote -> index/version -> isolated Git push; unpromoted changes rejected');

const resolvedTemp=fs.realpathSync(temp),tempRoot=fs.realpathSync(os.tmpdir());assert(resolvedTemp.startsWith(tempRoot+path.sep)&&path.basename(resolvedTemp).startsWith('n2-infra-'));fs.rmSync(resolvedTemp,{recursive:true,force:true,maxRetries:3});console.log('PASS isolated rehearsal checkout and remote cleaned');
