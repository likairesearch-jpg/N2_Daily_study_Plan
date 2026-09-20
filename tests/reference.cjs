'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const R=require('../tools/reference.cjs'),course=require('../tools/release.cjs'),before=course.signature(course.capture());
const {index,rows}=R.load();assert(rows.length>30000);assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
assert.deepEqual(R.recordSchema,JSON.parse(fs.readFileSync(path.join(R.ROOT,'schemas/reference.schema.json'))));
for(const [surface,pos]of [['職場','noun'],['新しい','adj-i'],['断定する','verb']]){const r=rows.find(r=>r.type==='vocab'&&r.surface===surface);assert(r.partsOfSpeech.includes(pos));assert(r.variants.some(v=>v.partsOfSpeech?.includes(pos)));assert(r.sources.some(s=>s.id==='nihongo-mono'));}
assert(rows.some(r=>r.conflict));assert(rows.some(r=>r.type==='grammar'&&r.structure.length&&r.explanation));assert(rows.some(r=>r.type==='vocab'&&r.examples.length));assert(rows.some(r=>r.type==='kanji'&&r.onyomi.length));
assert(rows.every(r=>r.sources.every(s=>['openjlpt','nihongo-mono'].includes(s.id))));
const bad=structuredClone(rows[0]);bad.sources[0].license='UNKNOWN';assert.throws(()=>R.validateRows([bad]),/license/);
assert.throws(()=>R.validateRows([rows[0],rows[0]]),/Duplicate/);
const policy=JSON.parse(fs.readFileSync(path.join(R.ROOT,'sources/policy.json'))),source=policy.sources.find(x=>x.id==='openjlpt');
const auditDir=fs.mkdtempSync(path.join(os.tmpdir(),'n2-license-test-'));fs.writeFileSync(path.join(auditDir,'LICENSE'),'test license v1');cp.execFileSync('git',['init',auditDir],{stdio:'ignore',windowsHide:true});cp.execFileSync('git',['-C',auditDir,'add','LICENSE'],{stdio:'ignore',windowsHide:true});const auditPolicy={id:'test',licenseInventory:['LICENSE'],evidence:R.fingerprint(auditDir,['LICENSE'])};fs.writeFileSync(path.join(auditDir,'LICENSE'),'test license v2');assert.throws(()=>R.audit(auditPolicy,auditDir),/changed/);
// A failed refresh in an isolated root must leave its previously usable snapshot pointer untouched.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'n2-refs-test-'));for(const p of ['tools','sources','data/reference'])fs.mkdirSync(path.join(temp,p),{recursive:true});
fs.copyFileSync(path.join(R.ROOT,'tools/reference.cjs'),path.join(temp,'tools/reference.cjs'));
fs.copyFileSync(path.join(R.ROOT,'sources/policy.json'),path.join(temp,'sources/policy.json'));
const sentinel=JSON.stringify({previous:'retained'});fs.writeFileSync(path.join(temp,'data/reference/index.json'),sentinel);
const result=cp.spawnSync(process.execPath,['tools/reference.cjs','update','--offline'],{cwd:temp,encoding:'utf8',windowsHide:true,env:{...process.env,NODE_PATH:path.join(R.ROOT,'node_modules')}});
assert.notEqual(result.status,0);assert.equal(fs.readFileSync(path.join(temp,'data/reference/index.json'),'utf8'),sentinel);assert(!fs.existsSync(path.join(temp,'.cache/reference-sources/.update.lock')));
// A failing Git transport also preserves the last published pointer.
const remoteDir=path.join(temp,'.cache/reference-sources/fixture');fs.mkdirSync(remoteDir,{recursive:true});cp.execFileSync('git',['init',remoteDir],{stdio:'ignore',windowsHide:true});cp.execFileSync('git',['-C',remoteDir,'remote','add','origin','https://github.com/n2-reference-test/unreachable.git'],{stdio:'ignore',windowsHide:true});cp.execFileSync('git',['-C',remoteDir,'config','url.'+path.join(temp,'missing-remote').replaceAll('\\','/')+'.insteadOf','https://github.com/n2-reference-test/unreachable.git'],{stdio:'ignore',windowsHide:true});fs.writeFileSync(path.join(temp,'sources/policy.json'),JSON.stringify({sources:[{id:'fixture',cacheName:'fixture',url:'https://github.com/n2-reference-test/unreachable',branch:'main',evidence:{},licenseInventory:[]}]}));
const failedFetch=cp.spawnSync(process.execPath,['tools/reference.cjs','update'],{cwd:temp,encoding:'utf8',windowsHide:true,env:{...process.env,NODE_PATH:path.join(R.ROOT,'node_modules')}});assert.notEqual(failedFetch.status,0);assert(failedFetch.stderr.includes('fetch'),failedFetch.stderr);assert.equal(fs.readFileSync(path.join(temp,'data/reference/index.json'),'utf8'),sentinel);
assert.equal(course.signature(course.capture()),before);
console.log('PASS reference schema, provenance, conflicts, examples, failed refresh preserves previous snapshot, formal courses untouched; '+index.version.slice(0,12));

const covered=R.formalCoverage(),select=args=>R.selectCandidates(rows,args,covered);
const first=select(['--type=vocab','--level=N2','--limit=2']);assert.equal(first.records.length,2);assert.equal(first.nextOffset,2);assert.notEqual(first.records[0].id,select(['--type=vocab','--level=N2','--limit=2','--offset=2']).records[0].id);
for(const flag of ['true','false']){const r=select(['--type=vocab','--covered='+flag]);assert(r.total>0);assert(r.records.every(x=>x.covered===(flag==='true')));}
const clean=select(['--type=grammar','--level=N2','--covered=false','--conflict=false','--confidence=medium']);assert(clean.total>0);assert(clean.records.every(x=>!x.covered&&!x.conflict&&x.confidence==='medium'));
const hit=clean.records[0];assert.equal(select(['--id='+hit.id]).records[0].id,hit.id);assert(select(['--keyword='+hit.surface]).total>0);
assert.throws(()=>select(['--type=kanji','--covered=false']),/unknown/);assert.throws(()=>select(['--limit=51']),/limit/);assert.throws(()=>select(['--limit=NaN']),/limit/);assert(select(['--type=kanji']).records.every(x=>x.covered===null));
console.log('PASS local bounded query, filters, pagination and coverage semantics');
