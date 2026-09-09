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
let env=boot();assert.equal(env.run('state.index'),4);assert.equal(env.run('state.note'),'原有笔记');assert.equal(env.run("state.status['day001-4']"),'yellow');
assert(env.node('#week').innerHTML.includes('Week 02'));
for(let n=8;n<=14;n++){
 const id='day'+String(n).padStart(3,'0');env.run('selectDay('+JSON.stringify(id)+')');
 assert.equal(env.node('#day').value,id);assert.equal(env.node('#week').value,'2');
 const lengths=env.run('cards.map(c=>{const h=c.html();if(/undefined|\\[object Object\\]/.test(h))throw Error(c.id);return h.length;})');
 assert(lengths.every(n=>n>0));
 const types=env.run('cards.map(c=>c.section).join("|")');for(const s of ['间隔复习','词汇','语法','阅读','听力','双人口语','复盘'])assert(types.includes(s));
 env.run("state.index=cards.length-1;render()");assert(env.node('#next').disabled);
}
env.run("selectDay('day008');go(5);state.status[cards[5].id]='green';state.note='第8天笔记';state.notes.day008=state.note;save()");
env.run("selectDay('day014');go(3);selectDay('day008')");
assert.equal(env.run('state.index'),5);assert.equal(env.run('state.note'),'第8天笔记');
env=boot();assert.equal(env.run('state.dayId'),'day008');assert.equal(env.run('state.index'),5);
env.run("selectDay('day001')");assert.equal(env.run('state.index'),4);assert.equal(env.run('state.note'),'原有笔记');assert.equal(env.run("state.status['day001-4']"),'yellow');
env.run("selectDay('day008');state.revealed={};state.answers={};");
const before=env.run("cards.find(c=>c.id==='day008-reading').html()");assert(!before.includes('data-speech'));assert(!before.includes('正确答案'));
env.run("state.revealed['day008-reading']=true;state.answers['day008-rq1']='B'");
const after=env.run("cards.find(c=>c.id==='day008-reading').html()");assert(after.includes('data-speech'));assert(after.includes('正确答案：B'));
const hidden=env.run("cards.find(c=>c.id==='day008-listening').html()");assert(!hidden.includes('查看原文</button><div'));
env.run("state.revealed['day008-listening']=true");
assert(env.run("cards.find(c=>c.id==='day008-listening').html()").length>hidden.length);
env.run("speak({dataset:{speech:'資料を提出する。'},classList:{add(){},remove(){}}})");assert.equal(spoken.lang,'ja-JP');assert.equal(spoken.text,'資料を提出する。');
const bundle={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data/course-bundle.js'),'utf8'),bundle);
assert.equal(JSON.stringify(bundle.window.N2_WEEK02),JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'data/week02.json'),'utf8'))));
console.log('PASS: all seven days render; navigation boundaries; legacy progress/note preserved; per-day restore; reading/listening reveal; ja-JP speech; bundle parity.');

