const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(root+'/data/day001.json','utf8').replace(/^\uFEFF/,''));
assert.equal(data.vocab.length,15);assert.equal(data.grammar.length,4);
let saved=null,spoken=null;
const elements=new Map();
function el(s){if(!elements.has(s))elements.set(s,{value:'',innerHTML:'',textContent:'',dataset:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){}});return elements.get(s);}
const context={console,window:{N2_DAY:data,addEventListener(){},speechSynthesis:{getVoices:()=>[{lang:'ja-JP'}],addEventListener(){},cancel(){},speak(u){spoken=u;}}},document:{querySelector:el,querySelectorAll:()=>[],body:el('body'),addEventListener(){}},localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},SpeechSynthesisUtterance:function(t){this.text=t;}};
vm.createContext(context);vm.runInContext(fs.readFileSync(root+'/app.js','utf8'),context);
assert.equal(vm.runInContext('cards.length',context),27);
vm.runInContext('go(999)',context);assert.equal(JSON.parse(saved).index,26);
vm.runInContext('go(-2)',context);assert.equal(JSON.parse(saved).index,0);
vm.runInContext('go(16)',context);assert.equal(JSON.parse(saved).index,16);
vm.runInContext("speak({dataset:{speech:'人口の増加に伴って、住宅も増えている。'},classList:{add(){},remove(){}}})",context);
assert.equal(spoken.lang,'ja-JP');assert(!spoken.text.includes('（'));
assert.equal(vm.runInContext("plain('人口（じんこう）の増加（ぞうか）')",context),'人口の増加');
vm.runInContext("state.status[cards[16].id]='green';state.note='review';save()",context);assert.equal(JSON.parse(saved).note,'review');
const fresh={...context};vm.createContext(fresh);vm.runInContext(fs.readFileSync(root+'/app.js','utf8'),fresh);assert.equal(vm.runInContext('state.index',fresh),16);
const offline={...context,localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}};vm.createContext(offline);vm.runInContext(fs.readFileSync(root+'/app.js','utf8'),offline);
const bundle={window:{}};vm.runInNewContext(fs.readFileSync(root+'/data/day001.js','utf8'),bundle);assert.equal(JSON.stringify(bundle.window.N2_DAY),JSON.stringify(data));
console.log('PASS: 15 words, 4 grammar entries, 27 cards; navigation bounds; ja-JP speech; annotation removal; saved state restore; unavailable storage; JSON parity.');

