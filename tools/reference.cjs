'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const Ajv=require('ajv'),ROOT=path.resolve(__dirname,'..'),CACHE=path.join(ROOT,'.cache/reference-sources'),OUT=path.join(ROOT,'data/reference');
const json=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const stringify=x=>JSON.stringify(x,null,2)+'\n',write=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});if(!fs.existsSync(p)||fs.readFileSync(p,'utf8')!==s){fs.writeFileSync(p+'.tmp',s);fs.renameSync(p+'.tmp',p);}};
const git=(dir,args)=>cp.execFileSync('git',['-C',dir,...args],{encoding:'utf8',timeout:120000,windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}}).trim();
const norm=s=>String(s||'').normalize('NFKC').trim(),surfaceKey=s=>norm(s).replace(/[〜～~]/g,'').replace(/\s+/g,'');
const levels=['N5','N4','N3','N2','N1'],types=['vocab','kanji','grammar','examples'];
function fingerprint(dir,files){return Object.fromEntries(files.map(p=>[p,hash(fs.readFileSync(path.join(dir,p)))]));}
function audit(config,dir){const inventory=git(dir,['ls-files']).split('\n').filter(p=>/(^|\/)(license|notice|copying|copyright)([.\/-]|$)/i.test(p)).sort();if(JSON.stringify(inventory)!==JSON.stringify(config.licenseInventory))throw Error(config.id+': license file inventory changed; re-audit required');const evidence=fingerprint(dir,Object.keys(config.evidence));if(JSON.stringify(evidence)!==JSON.stringify(config.evidence))throw Error(config.id+': license/provenance evidence changed; human re-audit required');return evidence;}
function refresh(s,offline){
 const dir=path.join(CACHE,s.cacheName);
 if(!fs.existsSync(dir)){if(offline)throw Error(s.id+': no offline cache');fs.mkdirSync(CACHE,{recursive:true});cp.execFileSync('git',['clone','--depth','1','--filter=blob:none',s.url+'.git',dir],{timeout:180000,windowsHide:true,stdio:'pipe',env:{...process.env,GIT_TERMINAL_PROMPT:'0'}});}
 if(git(dir,['config','--get','remote.origin.url'])!==s.url+'.git')throw Error(s.id+': unexpected cache remote');
 if(git(dir,['status','--porcelain']))throw Error(s.id+': upstream cache has local edits; refusing to overwrite');
 if(!offline){git(dir,['fetch','--depth','64','origin',s.branch]);git(dir,['merge','--ff-only','FETCH_HEAD']);}
 audit(s,dir);return {dir,commit:git(dir,['rev-parse','HEAD'])};
}
function normalize(inputs){
 const map=new Map();
 function add(type,value,source,file,row,license){
  if(!value.surface||!levels.includes(value.level)&&type!=='examples')throw Error(source.id+': invalid source surface/level at '+file+'#'+row);
  const key=type==='vocab'?norm(value.surface)+'|'+norm(value.reading):type==='examples'?norm(value.surface)+'|'+norm(value.translation):surfaceKey(value.surface);
  const id=type+'-'+hash(key).slice(0,24),p={id:source.id,url:source.url,commit:source.commit,file,row,license,attribution:source.attribution,evidence:'metadata/licenses/'+source.id+'/'};
  let r=map.get(id);if(!r){r={id,type,surface:value.surface,reading:value.reading||null,meanings:value.meanings||[],meaningLanguage:'en',translationOrigin:'upstream',onyomi:value.onyomi||[],kunyomi:value.kunyomi||[],structure:value.structure||[],explanation:value.explanation||null,commonness:value.commonness??null,frequency:value.frequency??null,relations:value.relations||{},examples:[],exampleVocabulary:[],jlpt:{resolved:null,bySource:{}},sources:[],variants:[],confidence:'medium',conflict:false,issues:[]};map.set(id,r);}
  r.resolvedFrom??={surface:r.sources[0]?.id||source.id};for(const field of ['reading','meanings','onyomi','kunyomi','structure','explanation','commonness','frequency','relations']){const v=value[field];const empty=x=>x==null||(Array.isArray(x)&&!x.length);if(empty(r[field])&&!empty(v))r[field]=v;if(!empty(r[field])&&!r.resolvedFrom[field])r.resolvedFrom[field]=source.id;}
  if(value.level){const ls=r.jlpt.bySource[source.id]??=[];if(!ls.includes(value.level))ls.push(value.level);}
  if(!r.sources.some(x=>x.id===p.id&&x.file===p.file&&x.row===row))r.sources.push(p);
  const view={source:source.id,file,row,level:value.level||null,reading:value.reading||null,meanings:value.meanings||[],onyomi:value.onyomi||[],kunyomi:value.kunyomi||[],structure:value.structure||[],explanation:value.explanation||null,commonness:value.commonness??null,frequency:value.frequency??null,relations:value.relations||{},translation:value.translation||null,sourceTags:value.sourceTags||[]};
  r.variants.push(view);
  for(const [i,e]of (value.examples||[]).entries()){if(!e.ja)throw Error(source.id+': malformed example');const eid=add('examples',{surface:e.ja,translation:e.en||null,meanings:e.en?[e.en]:[],level:value.level},source,file,row+'/examples/'+i,license);if(!r.examples.includes(eid))r.examples.push(eid);}
  return id;
 }
 for(const s of inputs){const read=p=>json(path.join(s.dir,p));
  if(s.id==='openjlpt')for(const level of levels)for(const type of ['vocab','kanji','grammar']){
   const file='data/json/'+type+'/'+level.toLowerCase()+'.json',rows=read(file);if(!Array.isArray(rows)||!rows.length)throw Error(file+': expected nonempty array');
   rows.forEach((v,i)=>add(type,{surface:v.word||v.character||v.pattern,reading:v.reading,meanings:v.meanings||(v.meaning?[v.meaning]:[]),level:v.level,examples:v.examples,onyomi:v.onyomi,kunyomi:v.kunyomi,structure:v.formation?[v.formation]:[],frequency:v.freq?{value:v.freq,metric:'rank',origin:'KANJIDIC2'}:null},s,file,String(i),'CC-BY-SA-4.0'));
  }
  if(s.id==='nihongo-mono'){
   for(const level of levels)for(const type of ['vocab','verbs','grammar']){
    const file='src/data/'+type+'/'+level.toLowerCase()+'.json',rows=read(file);if(!Array.isArray(rows)||!rows.length)throw Error(file+': expected nonempty array');
    rows.forEach((v,i)=>add(type==='verbs'?'vocab':type,{surface:v.kanji||v.kana||v.title,reading:v.kana,meanings:v.gloss||(v.meaning?[v.meaning]:[]),level:'N'+v.jlpt,examples:v.examples,structure:v.structure,explanation:v.summary,commonness:v.common,relations:{synonyms:v.synonyms||[],antonyms:v.antonyms||[],related:v.related||[],slug:v.slug||null},sourceTags:v.sources||[]},s,file,String(i),type==='grammar'?'MIT':'CC-BY-SA-4.0'));
   }
   const file='src/data/kanji/kanji.json';for(const [key,v]of Object.entries(read(file))){if(!levels.includes('N'+v.jlpt))continue;add('kanji',{surface:v.char,meanings:v.meanings,level:'N'+v.jlpt,onyomi:v.on,kunyomi:v.kun,frequency:v.freq?{value:v.freq,metric:'rank',origin:'KANJIDIC2'}:null},s,file,key,'CC-BY-SA-4.0');}
  }
 }
 const rows=[...map.values()].sort((a,b)=>a.id.localeCompare(b.id)),bySurface=new Map();
 for(const r of rows){const key=r.type+':'+surfaceKey(r.surface);if(!bySurface.has(key))bySurface.set(key,[]);bySurface.get(key).push(r);}
 for(const r of rows){
  const lv=[...new Set(Object.values(r.jlpt.bySource).flat())];r.jlpt.resolved=lv.length===1?lv[0]:null;
  if(lv.length>1)r.issues.push('level-conflict');
  if(r.type==='vocab'&&!r.reading)r.issues.push('missing-reading');
  if(r.reading&&!/^[ぁ-ゖァ-ヺー・.\s〜～－\-]+$/.test(r.reading))r.issues.push('reading-needs-review');
  for(const field of ['meanings','onyomi','kunyomi','structure']){const versions=r.variants.map(x=>x[field]).filter(x=>x?.length);if(new Set(versions.map(x=>JSON.stringify([...x].sort()))).size>1)r.issues.push(field+'-difference');}
  if((bySurface.get(r.type+':'+surfaceKey(r.surface))||[]).length>1)r.issues.push('surface-has-reading-variants');
  r.conflict=r.issues.some(x=>x.endsWith('conflict')||x.endsWith('difference')||x==='surface-has-reading-variants');
  // Shared JMdict/KANJIDIC/Waller lineage is not independent corroboration.
  r.confidence=r.issues.length?'review':'medium';
 }
 const vocab=rows.filter(x=>x.type==='vocab');for(const r of rows.filter(x=>x.type==='kanji'))r.exampleVocabulary=vocab.filter(v=>v.surface.includes(r.surface)).slice(0,20).map(v=>v.id);
 return rows;
}
const recordSchema={type:'object',required:['id','type','surface','reading','meanings','jlpt','sources','variants','confidence','conflict','issues','examples','exampleVocabulary','meaningLanguage','translationOrigin','onyomi','kunyomi','structure','explanation','resolvedFrom'],properties:{id:{type:'string',pattern:'^(vocab|kanji|grammar|examples)-[a-f0-9]{24}$'},type:{enum:types},surface:{type:'string',minLength:1},reading:{type:['string','null']},meanings:{type:'array',items:{type:'string'}},jlpt:{type:'object',required:['resolved','bySource'],properties:{resolved:{enum:[...levels,null]},bySource:{type:'object',additionalProperties:{type:'array',items:{enum:levels}}}}},sources:{type:'array',minItems:1,items:{type:'object',required:['id','url','commit','file','row','license','attribution'],properties:{commit:{type:'string',pattern:'^[a-f0-9]{40}$'},license:{enum:['MIT','CC-BY-SA-4.0']},url:{type:'string',pattern:'^https://github.com/'},attribution:{type:'string',minLength:1}}}},variants:{type:'array',minItems:1},confidence:{enum:['medium','high','review']},conflict:{type:'boolean'},issues:{type:'array',items:{type:'string'}},examples:{type:'array',items:{type:'string'}}}};
function validateRows(rows){
 const check=new Ajv({strict:false}).compile(recordSchema),ids=new Set();for(const r of rows){if(!check(r))throw Error(r.id+': '+JSON.stringify(check.errors));if(ids.has(r.id))throw Error('Duplicate ID '+r.id);ids.add(r.id);}
 for(const r of rows)for(const id of [...r.examples,...r.exampleVocabulary])if(!ids.has(id))throw Error(r.id+': unresolved reference '+id);
 for(const type of types)for(const level of levels)if(!rows.some(r=>r.type===type&&Object.values(r.jlpt.bySource).flat().includes(level)))throw Error('Missing '+type+' '+level);
}
function load(){
 const index=json(path.join(OUT,'index.json'));if(!/^[a-f0-9]{64}$/.test(index.version)||index.snapshot!=='snapshots/'+index.version)throw Error('Invalid snapshot pointer');
 if(hash(JSON.stringify(index.files))!==index.version)throw Error('Reference manifest hash mismatch');const base=path.join(OUT,index.snapshot),rows=[];
 for(const [p,h]of Object.entries(index.files)){if(!/^(vocab|kanji|grammar|examples|metadata)\/[A-Za-z0-9_./-]+$/.test(p)||p.includes('..'))throw Error('Unsafe snapshot file path');const bytes=fs.readFileSync(path.join(base,p));if(hash(bytes)!==h)throw Error('Reference hash mismatch '+p);if(types.some(t=>p===t+'/records.json'))rows.push(...JSON.parse(bytes));}
 validateRows(rows);const registry=json(path.join(base,'metadata/registry.json'));
 for(const r of rows)for(const s of r.sources){const policy=registry.sources.find(x=>x.id===s.id);if(!policy?.machineImportAllowed||!policy.redistributionAllowed||policy.commit!==s.commit)throw Error('Unapproved provenance '+s.id);for(const evidence of Object.keys(policy.evidence))if(index.files['metadata/licenses/'+s.id+'/'+evidence]!==policy.evidence[evidence])throw Error('Missing license evidence '+s.id);}
 return {index,base,rows,registry};
}
function docs(registry){return '# Reference source audit\n\nGenerated from the reviewed source policy and pinned upstream revisions. No reference data becomes formal teaching content automatically.\n\n'+registry.sources.map(s=>'## '+s.name+'\n\n- Source: '+s.url+'\n- Commit: '+(s.commit||'web/manual')+'\n- License: '+s.license+'\n- Machine import: '+s.machineImportAllowed+'; redistribution: '+s.redistributionAllowed+'\n- Data: '+s.dataTypes.join(', ')+'\n- Attribution: '+s.attribution+'\n- Audit: '+s.notes+'\n').join('\n')+'\nNormalized combined reference records are distributed under CC BY-SA 4.0; original MIT notices remain attached. English meanings are upstream, not generated Chinese translations. JLPT labels are unofficial, and shared upstream lineage does not increase confidence. Grammar pattern matching is conservative; differences are review flags, not corrections. Full evidence and notices are included in each immutable snapshot.\n';}
function publish(rows,registry){
 validateRows(rows);const files={};for(const type of types)files[type+'/records.json']='[\n'+rows.filter(r=>r.type===type).map(r=>JSON.stringify(r)).join(',\n')+'\n]\n';
 files['metadata/registry.json']=stringify(registry);
 files['metadata/conflicts.json']=stringify(rows.filter(r=>r.issues.length).map(r=>({id:r.id,type:r.type,surface:r.surface,issues:r.issues,bySource:r.jlpt.bySource})));
 files['metadata/summary.json']=stringify(Object.fromEntries(types.map(t=>[t,{total:rows.filter(r=>r.type===t).length,byLevel:Object.fromEntries(levels.map(l=>[l,rows.filter(r=>r.type===t&&r.jlpt.resolved===l).length])),review:rows.filter(r=>r.type===t&&r.confidence==='review').length}])));
 for(const s of registry.sources.filter(s=>s.machineImportAllowed))for(const p of Object.keys(s.evidence))files['metadata/licenses/'+s.id+'/'+p]=fs.readFileSync(path.join(CACHE,s.cacheName,p),'utf8');
 files['metadata/LICENSE.txt']=fs.readFileSync(path.join(CACHE,'OpenJLPT/LICENSE'),'utf8');
 files['metadata/ATTRIBUTION.md']='Reference adaptations: normalized fields, grouping, links, conflict flags and indexes by N2 Daily App. No teaching text generated. Combined adaptation licensed CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/ .\n\n'+registry.sources.filter(s=>s.machineImportAllowed).map(s=>s.name+': '+s.attribution+'\n'+s.url+'/tree/'+s.commit+'\n'+s.notes).join('\n\n')+'\n\nJMdict/KANJIDIC2 are the property of the Electronic Dictionary Research and Development Group, used in conformance with https://www.edrdg.org/edrdg/licence.html . JLPT labels derive from Jonathan Waller (https://www.tanos.co.uk/jlpt/); examples include Tatoeba/Tanaka Corpus (https://tatoeba.org), CC BY 2.0 FR. Retain all included upstream notices. Sentence-level authors are not supplied by these distributions; provenance links identify the exact upstream file and row.\n';
 const hashes=Object.fromEntries(Object.entries(files).sort().map(([p,t])=>[p,hash(t)])),version=hash(JSON.stringify(hashes));
 const dir=path.join(OUT,'snapshots',version);const staging=fs.mkdtempSync(path.join(CACHE,'.stage-'));for(const [p,t]of Object.entries(files))write(path.join(staging,p),t);
 // Verify all written bytes before committing the single current-snapshot pointer.
 for(const [p,h]of Object.entries(hashes))if(hash(fs.readFileSync(path.join(staging,p)))!==h)throw Error('Snapshot write verification failed');
 if(!fs.existsSync(dir)){fs.mkdirSync(path.dirname(dir),{recursive:true});fs.renameSync(staging,dir);}else{for(const [p,h]of Object.entries(hashes))if(hash(fs.readFileSync(path.join(dir,p)))!==h)throw Error('Existing immutable snapshot is corrupt');if(!path.resolve(staging).startsWith(path.resolve(CACHE)+path.sep+'.stage-'))throw Error('Unsafe staging cleanup');fs.rmSync(staging,{recursive:true});}
 write(path.join(OUT,'index.json'),stringify({schemaVersion:1,version,snapshot:'snapshots/'+version,files:hashes}));
 write(path.join(ROOT,'sources/registry.json'),stringify(registry));write(path.join(ROOT,'docs/SOURCES.md'),docs(registry));return version;
}
async function update(offline=false){
 fs.mkdirSync(CACHE,{recursive:true});const lock=path.join(CACHE,'.update.lock');let fd;try{fd=fs.openSync(lock,'wx');fs.writeFileSync(fd,String(process.pid));}catch{throw Error('Reference update already running or stale .cache/reference-sources/.update.lock');}
 try{const policy=json(path.join(ROOT,'sources/policy.json')),old=fs.existsSync(path.join(ROOT,'sources/registry.json'))?json(path.join(ROOT,'sources/registry.json')):{sources:[]},sources=[],inputs=[];
 for(const s of policy.sources){if(!s.cacheName){sources.push({...s,commit:null,fetchedAt:null,version:null});continue;}
 const {dir,commit}=refresh(s,offline),previous=old.sources.find(x=>x.id===s.id),entry={...s,commit,version:commit,fetchedAt:previous?.commit===commit?previous.fetchedAt:new Date().toISOString()};sources.push(entry);if(s.machineImportAllowed)inputs.push({...entry,dir});console.log('Audited '+s.id+' '+commit.slice(0,10)+(s.machineImportAllowed?' import':' manual-only'));}
 const rows=normalize(inputs),version=publish(rows,{schemaVersion:1,sources});console.log('PASS reference update: '+rows.length+' records; '+version.slice(0,12));
 }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
function query(args){const {rows}=load(),type=args.find(x=>x.startsWith('--type='))?.slice(7),level=args.find(x=>x.startsWith('--level='))?.slice(8),text=args.find(x=>!x.startsWith('--'))||'',limit=Math.max(1,Math.min(100,Number(args.find(x=>x.startsWith('--limit='))?.slice(8)||10)));const result=rows.filter(r=>(!type||r.type===type)&&(!level||Object.values(r.jlpt.bySource).flat().includes(level))&&(!args.includes('--review')||r.confidence==='review')&&JSON.stringify([r.surface,r.reading,r.meanings]).toLowerCase().includes(text.toLowerCase()));console.log(JSON.stringify({total:result.length,records:result.slice(0,limit)},null,2));}
function coverage(){
 const {rows}=load(),R=require('./release.cjs'),{weeks,knowledge}=R.validate(R.capture()),vocab=new Set(knowledge.vocabulary.map(v=>surfaceKey(v.word))),grammar=new Set(knowledge.grammar.map(g=>surfaceKey(g.form))),days=weeks.flatMap(w=>w.days);
 const actualVocab=new Set([...(json(path.join(ROOT,'data/day001.json')).vocab||[]).map(v=>surfaceKey(v[0])),...days.flatMap(d=>(d.vocabulary||[]).map(v=>surfaceKey(v.word.display.replace(/（[^）]*）/g,''))))]);
 const actualGrammar=new Set([...(json(path.join(ROOT,'data/day001.json')).grammar||[]).map(g=>surfaceKey(g[0])),...days.flatMap(d=>(d.grammar||[]).map(g=>surfaceKey(g.form.display.replace(/（[^）]*）/g,''))))]);
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const report={asOf:today,examTarget:'2026-12-06',daysRemaining:Math.ceil((Date.parse('2026-12-06')-Date.parse(today))/86400000),latestFormalDay:Math.max(...days.map(d=>d.day)),latestFormalWeek:Math.max(...weeks.map(w=>w.week)),note:'Candidates are unofficial; matched coverage is not mastery. Kanji appearing in vocabulary is incidental exposure, not formal kanji instruction.',levels:{},weeklyReviewCount:days.filter(d=>d.weeklyReview).length,miniMockCount:days.filter(d=>d.miniMock).length};
 for(const type of ['vocab','kanji','grammar']){const n2=rows.filter(r=>r.type===type&&Object.values(r.jlpt.bySource).flat().includes('N2'));const covered=type==='vocab'?n2.filter(r=>actualVocab.has(surfaceKey(r.surface))).length:type==='grammar'?n2.filter(r=>actualGrammar.has(surfaceKey(r.surface))).length:null;report.levels[type]={n2Candidates:n2.length,matchedFormalCoverage:covered,uncovered:covered===null?null:n2.length-covered,conflict:n2.filter(r=>r.conflict).length,review:n2.filter(r=>r.confidence==='review').length,prerequisiteCandidates:rows.filter(r=>r.type===type&&['N5','N4','N3'].includes(r.jlpt.resolved)).length,n1Optional:rows.filter(r=>r.type===type&&r.jlpt.resolved==='N1').length};}
 console.log(JSON.stringify(report,null,2));return report;
}
module.exports={normalize,validateRows,load,update,hash,fingerprint,audit,ROOT,recordSchema};
if(require.main===module){const cmd=process.argv[2]||'validate';Promise.resolve().then(()=>{if(cmd==='update')return update(process.argv.includes('--offline'));if(cmd==='validate'){const x=load();console.log('PASS reference validation: '+x.rows.length+' records');return;}if(cmd==='query')return query(process.argv.slice(3));if(cmd==='coverage')return coverage();throw Error('Use update [--offline], validate, query, or coverage');}).catch(e=>{console.error('REFERENCE FAILED: '+e.message);process.exitCode=1;});}
