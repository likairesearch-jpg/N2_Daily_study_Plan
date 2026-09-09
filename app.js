'use strict';
const D=window.N2_DAY, KEY='n2-daily-v1';
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>s.replace(/（[^）]*）/g,'').replace(/～/g,'');
const ruby=s=>esc(s).replace(/([一-龯々]+)（([ぁ-ゖァ-ヺー]+)）/g,'<ruby>$1<rt>$2</rt></ruby>');
const jp=(s,read)=>'<span class="speak" lang="ja" role="button" tabindex="0" data-speech="'+esc(read||plain(s))+'" aria-label="朗读：'+esc(plain(s))+'">'+ruby(s)+'</span>';
let state={index:0,status:{},note:'',kana:true,rate:1,dayId:'day001',positions:{},notes:{},revealed:{},answers:{}},storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&typeof saved==='object'){state={...state,...saved};if(!state.status||typeof state.status!=='object')state.status={};}}catch{storageOK=false;}
for(const key of ['positions','notes','revealed','answers'])if(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key]))state[key]={};
if(typeof state.notes.day001!=='string')state.notes.day001=typeof state.note==='string'?state.note:'';
function save(){state.positions[state.dayId]=state.index;try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;$('#message').textContent='浏览器无法保存进度；请允许本地存储。';}}
// Legacy presentation was extracted byte-for-byte from the original rendered cards.
const cards=D.cards.map(c=>({...c,html:()=>c.html}));
const legacyCards=cards.slice();
const courseDays=new Map([['day001',D],...(window.N2_WEEKS||[window.N2_WEEK01,window.N2_WEEK02].filter(Boolean)).flatMap(w=>w.days.map(d=>[d.id,d]))]);
function selectDay(id,remember=true){
 if(!courseDays.has(id))id='day001';
 if(remember){state.positions[state.dayId]=state.index;state.notes[state.dayId]=state.note;}
 state.dayId=id;
 const day=courseDays.get(id);
 cards.splice(0,cards.length,...(id==='day001'?legacyCards:window.N2BuildCards(day,{esc,jp,ruby,state})));
 const savedIndex=state.positions[id]??(remember?0:state.index);
 state.index=Number.isInteger(savedIndex)?Math.max(0,Math.min(cards.length-1,savedIndex)):0;
 state.note=state.notes[id]||'';
 sections=[...new Set(cards.map(c=>c.section))];
 $('#chapters').innerHTML=sections.map(s=>'<button data-page="'+cards.findIndex(c=>c.section===s)+'">'+esc(s)+'<small>→</small></button>').join('');
 $('#week').value=String(day.week);
 $('#day').innerHTML=[...courseDays].filter(([key,d])=>d.week===day.week).map(([key,d])=>'<option value="'+key+'">Day '+String(d.day).padStart(3,'0')+' · '+d.date+'</option>').join('');
 $('#day').value=id;
 $('.eyebrow').textContent='WEEK '+String(day.week).padStart(2,'0')+' / DAY '+String(day.day).padStart(3,'0');
 document.title='N2 每日冲刺 · Day '+String(day.day).padStart(3,'0');
 render();
}
state.index=Number.isInteger(state.index)?Math.max(0,Math.min(cards.length-1,state.index)):0;
let sections=[...new Set(cards.map(c=>c.section))];
$('#chapters').innerHTML=sections.map(s=>'<button data-page="'+cards.findIndex(c=>c.section===s)+'">'+esc(s)+'<small>→</small></button>').join('');
function stop(){if('speechSynthesis'in window)window.speechSynthesis.cancel();document.querySelectorAll('.playing').forEach(e=>e.classList.remove('playing'));}
function render(){stop();const c=cards[state.index];$('#card').innerHTML=c.html();$('#category').textContent=c.section;$('#counter').textContent=String(state.index+1).padStart(2,'0')+' / '+cards.length;$('#prev').disabled=state.index===0;$('#next').disabled=state.index===cards.length-1;document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',cards[+b.dataset.page].section===c.section));document.querySelectorAll('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String((state.status[c.id]||'')===b.dataset.status)));const done=cards.filter(c=>state.status[c.id]).length;$('#progressText').textContent=done+' / '+cards.length+' 页已记录';$('#progress').value=done/cards.length;document.body.classList.toggle('hide-kana',!state.kana);if($('#notes')){$('#notes').value=typeof state.note==='string'?state.note:'';$('#notes').oninput=e=>{state.note=e.target.value;state.notes[state.dayId]=state.note;save();};$('#reviewCounts').textContent=['red','yellow','green'].map((s,i)=>['🔴 不会','🟡 反应慢','🟢 掌握'][i]+' '+cards.filter(c=>state.status[c.id]===s).length).join('　');}save();}
function go(n){state.index=Math.max(0,Math.min(cards.length-1,n));render();}
let voices=[],utterance=null;
function loadVoices(){voices=window.speechSynthesis.getVoices().filter(v=>/^ja(?:-|_)/i.test(v.lang));$('#message').textContent=voices.length?'日语语音已就绪 · 进度保存在当前浏览器':'未检测到日语语音，请在系统中安装日语语音后重开浏览器。';if(!storageOK)$('#message').textContent+=' 当前无法保存进度。';}
if('speechSynthesis'in window){loadVoices();window.speechSynthesis.addEventListener('voiceschanged',loadVoices);}else $('#message').textContent='当前浏览器不支持语音朗读。';
function speak(el){stop();if(!('speechSynthesis'in window)||!voices.length){$('#message').textContent='没有可用的日语语音。请安装日语语音并使用支持朗读的浏览器。';return;}utterance=new SpeechSynthesisUtterance(el.dataset.speech);utterance.lang='ja-JP';utterance.voice=voices.find(v=>v.lang==='ja-JP')||voices[0];utterance.rate=Number(state.rate)||1;utterance.onstart=()=>el.classList.add('playing');utterance.onend=()=>el.classList.remove('playing');utterance.onerror=e=>{el.classList.remove('playing');if(e.error!=='canceled'&&e.error!=='interrupted')$('#message').textContent='朗读未成功：'+e.error+'。请重试。';};window.speechSynthesis.speak(utterance);}
document.addEventListener('click',e=>{const reveal=e.target.closest('[data-reveal]');if(reveal){state.revealed[reveal.dataset.reveal]=true;render();return;}const answer=e.target.closest('[data-answer]');if(answer&&!e.target.closest('.speak')){state.answers[answer.dataset.question]=answer.dataset.answer;render();return;}const el=e.target.closest('.speak');if(el)speak(el);const page=e.target.closest('[data-page]');if(page)go(+page.dataset.page);const status=e.target.closest('[data-status]');if(status){state.status[cards[state.index].id]=status.dataset.status;render();}});
document.addEventListener('keydown',e=>{if(e.target.closest('.speak')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();speak(e.target.closest('.speak'));return;}if(/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();go(state.index+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(state.index-1);}});
$('#prev').onclick=()=>go(state.index-1);$('#next').onclick=()=>go(state.index+1);$('#stop').onclick=stop;$('#kana').checked=!!state.kana;$('#kana').onchange=e=>{state.kana=e.target.checked;document.body.classList.toggle('hide-kana',!state.kana);save();};$('#rate').value=String(state.rate);$('#rate').onchange=e=>{state.rate=+e.target.value;save();};$('#week').innerHTML=[...new Set([...courseDays.values()].map(d=>d.week))].sort((a,b)=>a-b).map(w=>'<option value="'+w+'">Week '+String(w).padStart(2,'0')+'</option>').join('');$('#week').onchange=e=>{const entry=[...courseDays].find(([id,d])=>d.week===Number(e.target.value));if(entry)selectDay(entry[0]);};$('#day').onchange=e=>selectDay(e.target.value);window.addEventListener('pagehide',stop);selectDay(state.dayId,false);


window.N2RefreshCourses=function(){const activeId=cards[state.index]?.id;const remembered=state.dayId;courseDays.clear();courseDays.set("day001",window.N2_DAY);for(const w of window.N2_WEEKS)for(const d of w.days)courseDays.set(d.id,d);$("#week").innerHTML=[...new Set([...courseDays.values()].map(d=>d.week))].sort((a,b)=>a-b).map(w=>'<option value="'+w+'">Week '+String(w).padStart(2,"0")+'</option>').join("");selectDay(remembered);const pos=cards.findIndex(c=>c.id===activeId);if(pos>=0)go(pos);};
