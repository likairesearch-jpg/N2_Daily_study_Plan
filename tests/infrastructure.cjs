'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const R=require('../tools/release.cjs');
const files=R.capture(),original=R.signature(files),meta=R.metadata(files);
assert.deepEqual(meta,R.metadata(files),'version generation must be deterministic');
let bad={...files,'data/week02.json':'{' };assert.throws(()=>R.validate(bad),/week02/);
const edit=fn=>{const clone={...files},w=JSON.parse(clone['data/week02.json']);fn(w);clone['data/week02.json']=JSON.stringify(w);return clone;};
assert.throws(()=>R.validate(edit(w=>w.days[0].day=15)),/days/);
assert.throws(()=>R.validate(edit(w=>w.days[0].vocabulary[0].word.tts='')),/tts/);
assert.throws(()=>R.validate(edit(w=>w.days[0].reading.questions[0].answer='INVALID')),/answer/);
assert.throws(()=>R.validate(edit(w=>w.days[0].review.intervals[0].vocabularyIds.push('missing-reference'))),/unresolved/);
assert.throws(()=>R.validate(edit(w=>w.days[0].vocabulary.push(w.days[0].vocabulary[0]))),/duplicate card/);
// Future navigation and validation fixture: existing teaching text copied only in memory, never published.
const future=JSON.parse(files['data/week02.json']);future.week=3;future.id='week03';future.dayRange={start:15,end:21};
future.days=future.days.map(d=>{const old=d.day,newDay=old+7,oldId=d.id,newId='day'+String(newDay).padStart(3,'0');d=JSON.parse(JSON.stringify(d).replaceAll(oldId,newId));d.day=newDay;d.week=3;for(const r of d.review.intervals){r.sourceDay+=7;if(r.sourceDayId)r.sourceDayId='day'+String(r.sourceDay).padStart(3,'0');}return d;});
const withFuture={...files,'data/week03.json':JSON.stringify(future)};assert.equal(R.validate(withFuture).weeks.length,3);
assert.equal(JSON.parse(R.metadata(withFuture)['data/index.json']).weeks[2].days[0],'day015');
// Isolated local remote exercises real Git without publishing test content to GitHub.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'n2-infra-')),repo=path.join(temp,'repo'),remote=path.join(temp,'remote.git');fs.mkdirSync(repo);
const run=(cmd,args,cwd=repo,ok=true)=>{const r=cp.spawnSync(cmd,args,{cwd,encoding:'utf8',windowsHide:true,env:{...process.env,NODE_PATH:path.join(R.ROOT,'node_modules'),GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:path.join(temp,'empty-config'),GIT_TERMINAL_PROMPT:'0'}});if(ok&&r.status!==0)throw Error(r.stdout+r.stderr);return r;};
const git=(...args)=>run('git',args).stdout.trim();
for(const p of ['tools/release.cjs','tools/sync.cjs','weekly.js','schemas/course.schema.json']){fs.mkdirSync(path.dirname(path.join(repo,p)),{recursive:true});fs.copyFileSync(path.join(R.ROOT,p),path.join(repo,p));}
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
