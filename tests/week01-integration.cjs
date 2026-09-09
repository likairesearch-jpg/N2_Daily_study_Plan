const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
let saved=JSON.stringify({index:4,status:{'day001-4':'yellow'},note:'原有笔记',kana:true,rate:1});
let spoken=null;
function boot(){
 const nodes=new Map(),listeners={};
 const node=s=>{if(!nodes.has(s))nodes.set(s,{value:'',innerHTML:'',textContent:'',dataset:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){}});return nodes.get(s);};
 const ctx={window:{addEventListener(){},speechSynthesis:{getVoices:()=>[{lang:'ja-JP'}],addEventListener(){},cancel(){},speak(u){spoken=u;}}},document:{querySelector:node,querySelectorAll:()=>[],body:node('body'),addEventListener(k,fn){listeners[k]=fn;}},localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},SpeechSynthesisUtterance:function(t){this.text=t;}};
 vm.createContext(ctx);for(const f of ['data/day001.js','data/course-bundle.js','weekly.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
 return {ctx,node,listeners,run:s=>vm.runInContext(s,ctx)};
}

let env=boot();
assert.equal(env.run('courseDays.size'),14);
const counts=[15,12,10,14,12,12],grammarCounts=[4,4,3,4,3,3];
for(let n=2;n<=7;n++){
 const id='day'+String(n).padStart(3,'0');
 env.run('selectDay('+JSON.stringify(id)+');state.revealed={};state.answers={};');
 assert.equal(env.node('#day').value,id);
 assert.equal((env.node('#day').innerHTML.match(/<option /g)||[]).length,7);
 assert(!env.node('#day').innerHTML.includes('尚未导入'));
 const d=env.run('courseDays.get('+JSON.stringify(id)+')');
 assert.equal(d.vocabulary.length,counts[n-2]);assert.equal(d.grammar.length,grammarCounts[n-2]);
 assert.equal(d.date,new Date(Date.UTC(2026,7,26+n)).toISOString().slice(0,10));
 for(const g of d.grammar)assert(g.examples.length>0&&g.meaningZh);
 for(const interval of d.review.intervals)assert(interval.sourceDay>0&&interval.sourceDay+interval.offsetDays===n);
 env.run('cards.forEach(c=>{const h=c.html();if(!h||/undefined|\\[object Object\\]/.test(h))throw Error(c.id);});');
 const ids=env.run('cards.map(c=>c.id)');assert.equal(new Set(ids).size,ids.length);
 if(d.reading){
  const before=env.run('cards.find(c=>c.id==='+JSON.stringify(d.reading.id)+').html()');
  assert(!before.includes('data-speech'));
  assert(d.reading.questions[0].options.length>=3);
 }
 if(d.listening){assert(d.listening.tts.length>60);assert(d.listening.segments[0].text.tts===d.listening.tts);}
 for(const m of d.modules.filter(m=>m.type==='responses'))assert.equal(m.tasks.length,3);
 env.run("for(const c of cards)state.revealed[c.id]=true;cards.forEach(c=>{const h=c.html();if(/undefined|\\[object Object\\]/.test(h))throw Error(c.id);});");
 const all=env.run("cards.map(c=>c.html()).join('\\n')");
 assert(all.includes('data-speech'));assert(!/data-speech="[^"]*（/.test(all));
 if(n===7){assert(all.includes('Week 01 · 周复盘与交接'));assert(!all.includes('Week 02 · 周复盘'));}
 env.run("go(2);state.status[cards[2].id]='yellow';state.note='note-"+id+"';state.notes[state.dayId]=state.note;save()");
 console.log('PASS '+id+': '+ids.length+' cards, all hidden/revealed states render.');
}
env=boot();assert.equal(env.run('state.dayId'),'day007');assert.equal(env.run('state.note'),'note-day007');
env.run("selectDay('day002')");assert.equal(env.run('state.index'),2);assert.equal(env.run('state.note'),'note-day002');
env.run("selectDay('day001')");assert.equal(env.run('state.index'),4);assert.equal(env.run('state.note'),'原有笔记');
const bundle={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data/course-bundle.js'),'utf8'),bundle);
assert.equal(JSON.stringify(bundle.window.N2_WEEK01),JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'data/week01.json'),'utf8'))));
assert(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes('尚未导入'));
console.log('PASS: Day001-014 navigation, source counts/dates, unique card IDs, reveal gates, per-day persistence, legacy migration, JSON bundle parity.');
