'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const Ajv=require('ajv/dist/2020'),formats=require('ajv-formats');
const ROOT=path.resolve(__dirname,'..');
const INPUT=/^data\/(week[0-9]{2,}\.json|day001\.json|knowledge-index\.json|course-policy\.json)$/;
const AUTO=p=>INPUT.test(p)||p==='data/index.json'||p==='version.json';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
const parse=(s,p)=>{try{return JSON.parse(s.replace(/^\uFEFF/,''));}catch(e){throw Error(p+': '+e.message);}};
function capture(root=ROOT){return Object.fromEntries(fs.readdirSync(path.join(root,'data')).map(n=>'data/'+n).filter(n=>INPUT.test(n)).sort().map(n=>[n,read(path.join(root,n))]));}
function signature(files){return hash(JSON.stringify(Object.entries(files).sort()));}
function knowledge(base,weeks){const result=structuredClone(base);for(const kind of ['vocabulary','grammar']){const entries=new Map(result[kind].map(x=>[x.id,x]));for(const w of weeks)for(const d of w.days)for(const item of d[kind]||[]){const id=item.conceptId||item.knowledgeId;if(!id||entries.has(id))continue;entries.set(id,kind==='vocabulary'?{id,word:item.word.display,reading:item.reading,meaningZh:item.word.translationZh,text:item.word,firstTaughtDay:d.day}:{id,form:item.form.display,formText:item.form,meaningZh:item.meaningZh,examples:item.examples,firstTaughtDay:d.day});}result[kind]=[...entries.values()];}return result;}
function validate(files){
 const ajv=new Ajv({allErrors:true,strict:false});formats(ajv);
 const check=ajv.compile(parse(read(path.join(ROOT,'schemas/course.schema.json')),'schema'));
 const values=Object.fromEntries(Object.entries(files).map(([n,t])=>[n,parse(t,n)]));
 for(const required of ['data/day001.json','data/knowledge-index.json','data/course-policy.json'])if(!values[required])throw Error('Missing '+required);
 const weeks=Object.entries(values).filter(([n])=>/^data\/week\d+\.json$/.test(n)).sort((a,b)=>a[1].week-b[1].week);
 if(!weeks.length)throw Error('No weeks found');
 const seen=new Set(['day001']);
 for(const [name,w] of weeks){
  if(!check(w))throw Error(name+': '+ajv.errorsText(check.errors,{separator:'\n'}));
  if(name!=='data/week'+String(w.week).padStart(2,'0')+'.json')throw Error(name+': week number does not match filename');
  const start=(w.week-1)*7+1,expected=Array.from({length:w.week===1?6:7},(_,i)=>start+i+(w.week===1?1:0));
  if(JSON.stringify(w.days.map(d=>d.day))!==JSON.stringify(expected))throw Error(name+': expected complete ordered days '+expected.join(','));
  const range=Array.isArray(w.dayRange)?w.dayRange:[w.dayRange?.start,w.dayRange?.end];
  if(range[0]!==start||range[1]!==start+6)throw Error(name+': incorrect dayRange');
  for(const d of w.days){if(d.week!==w.week||d.id!=='day'+String(d.day).padStart(3,'0')||seen.has(d.id))throw Error(name+': duplicate/mismatched day '+d.id);seen.add(d.id);}
 }
 if(weeks.some(([,w],i)=>w.week!==i+1))throw Error('Weeks must be contiguous from Week 01');
 const base=values['data/knowledge-index.json'];
 for(const kind of ['vocabulary','grammar'])if(!Array.isArray(base[kind])||new Set(base[kind].map(x=>x.id)).size!==base[kind].length)throw Error('knowledge-index: missing array or duplicate IDs in '+kind);
 const index=knowledge(base,weeks.map(x=>x[1]));
 const walk=(x,p)=>{if(!x||typeof x!=='object')return;if('display'in x){if(!ajv.validate({$ref:'#/$defs/ja',$defs:{ja:check.schema.$defs.ja}},x))throw Error(p+': invalid Japanese text (display / tts / lang / translationZh)');}
  if(x.type==='single_choice'){if(!Array.isArray(x.options)||!x.options.some(o=>o.id===x.answer)||new Set(x.options.map(o=>o.id)).size!==x.options.length)throw Error(p+': invalid answer/options');}
  for(const [k,v] of Object.entries(x))walk(v,p+'/'+k);
 };
 for(const [n,w] of weeks){walk(w,n);for(const d of w.days)for(const r of d.review?.intervals||[]){if(r.sourceDay!==d.day-r.offsetDays||!seen.has('day'+String(r.sourceDay).padStart(3,'0')))throw Error(d.id+': invalid review sourceDay');for(const kind of ['vocabulary','grammar'])for(const id of r[kind+'Ids'])if(!index[kind].some(x=>x.id===id))throw Error(d.id+': unresolved '+kind+' reference '+id);}}
 walk(index,'knowledge-index');
 const legacy=values['data/day001.json'];if(legacy.day!==1||legacy.week!==1||!['vocab','grammar','listening','speaking'].every(k=>Array.isArray(legacy[k])))throw Error('Invalid legacy Day 001');
 const tags=new Set(['h1','h2','p','div','span','ruby','rt','br','label','textarea','strong','small']);
 if(!Array.isArray(legacy.cards)||legacy.cards.length!==27)throw Error('Day001: retain all original 27 card IDs');
 for(const [i,c]of legacy.cards.entries()){
  if(c.id!=='day001-'+i||typeof c.section!=='string'||typeof c.title!=='string'||typeof c.html!=='string')throw Error('Day001: invalid card '+i);
  // Legacy HTML is restricted to inert presentation tags and attributes (no URLs, styles, handlers or scripts).
  const rest=c.html.replace(/<[^>]*>/g,token=>{const m=token.match(/^<\/?([a-z0-9]+)((?:\s+[a-z-]+="[^"<>]*")*)\s*\/?>$/);if(!m||!tags.has(m[1]))throw Error(c.id+': unsafe HTML tag');const attrs=[...m[2].matchAll(/\s+([a-z-]+)="[^"<>]*"/g)];if(attrs.some(a=>!['class','lang','role','tabindex','data-speech','aria-label','for','id','placeholder'].includes(a[1])))throw Error(c.id+': unsafe HTML attribute');return '';});if(/[<>]/.test(rest))throw Error(c.id+': malformed HTML');
 }
 // Render every state branch using the real renderer. This also catches missing fields and duplicate progress keys.
 const ctx={window:{N2_KNOWLEDGE:index}};vm.runInNewContext(read(path.join(ROOT,'weekly.js')),ctx);
 for(const [,w] of weeks)for(const d of w.days){const state={revealed:new Proxy({},{get:()=>true}),answers:new Proxy({},{get:()=>true,getOwnPropertyDescriptor:()=>({configurable:true,enumerable:true,value:true})})};let cards;try{cards=ctx.window.N2BuildCards(d,{esc:String,jp:String,ruby:String,state});for(const c of cards)c.html();}catch(e){throw Error(d.id+': renderer contract: '+e.message);}if(new Set(cards.map(c=>c.id)).size!==cards.length)throw Error(d.id+': duplicate card IDs');}
 return {values,weeks:weeks.map(x=>x[1]),knowledge:index};
}
function metadata(files){const {weeks}=validate(files);const entries=Object.entries(files).sort().map(([url,text])=>({url,sha256:hash(text)}));const index={schemaVersion:1,weeks:weeks.map(w=>({week:w.week,url:'data/week'+String(w.week).padStart(2,'0')+'.json',days:w.days.map(d=>d.id)})),files:entries};const indexText=JSON.stringify(index,null,2)+'\n';const version={schemaVersion:1,courseVersion:hash(indexText),index:'data/index.json',indexSha256:hash(indexText)};return {'data/index.json':indexText,'version.json':JSON.stringify(version,null,2)+'\n'};}
function writeChanged(root,files){for(const [p,s] of Object.entries(files)){const target=path.join(root,p);fs.mkdirSync(path.dirname(target),{recursive:true});if(!fs.existsSync(target)||read(target)!==s){const tmp=target+'.tmp';fs.writeFileSync(tmp,s);fs.renameSync(tmp,target);}}}
function bundle(root,files){const {values,weeks,knowledge:index}=validate(files);writeChanged(root,{'data/day001.js':'// Generated from JSON.\nwindow.N2_DAY='+JSON.stringify(values['data/day001.json'])+';\n','data/course-bundle.js':'// Generated from JSON.\nwindow.N2_WEEKS='+JSON.stringify(weeks)+';\n'+weeks.map(w=>'window.N2_WEEK'+String(w.week).padStart(2,'0')+'=window.N2_WEEKS.find(w=>w.week==='+w.week+');').join('\n')+'\nwindow.N2_KNOWLEDGE='+JSON.stringify(index)+';\n'});}
function run(command){const files=capture(),meta=metadata(files);if(command==='validate'){for(const [p,s]of Object.entries(meta))if(!fs.existsSync(path.join(ROOT,p))||read(path.join(ROOT,p))!==s)throw Error(p+': stale metadata; run node tools/release.cjs prepare');}else if(command==='prepare'){writeChanged(ROOT,meta);bundle(ROOT,files);}else if(command==='build'){run('validate');const target=path.join(ROOT,'dist');fs.mkdirSync(target,{recursive:true});for(const p of ['index.html','style.css','app.js','weekly.js','loader.js','pwa.js','service-worker.js','manifest.json','assets/icon-192.png','assets/icon-512.png']){fs.mkdirSync(path.dirname(path.join(target,p)),{recursive:true});fs.copyFileSync(path.join(ROOT,p),path.join(target,p));}writeChanged(target,{...files,...meta});const assets=['index.html','style.css','app.js','weekly.js','loader.js','pwa.js','manifest.json','assets/icon-192.png','assets/icon-512.png'];const revision=hash(assets.map(p=>hash(fs.readFileSync(path.join(target,p)))).join(''));const sw=read(path.join(target,'service-worker.js')).replace('__BUILD_REVISION__',revision);fs.writeFileSync(path.join(target,'service-worker.js'),sw);}else throw Error('Use validate, prepare or build');console.log('PASS '+command+': '+validate(files).weeks.length+' weeks; version '+JSON.parse(meta['version.json']).courseVersion.slice(0,12));}
module.exports={ROOT,INPUT,AUTO,hash,capture,signature,validate,metadata,writeChanged,bundle,knowledge};
if(require.main===module)try{run(process.argv[2]||'validate');}catch(e){console.error('COURSE VALIDATION FAILED: '+e.message);process.exitCode=1;}
