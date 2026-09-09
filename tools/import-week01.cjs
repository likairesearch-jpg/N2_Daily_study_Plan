const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8').replace(/^\uFEFF/,'')),write=(f,v)=>fs.writeFileSync(path.join(root,f),typeof v==='string'?v:JSON.stringify(v,null,2));
const sources=read('work/week01-sources.json'),index=read('data/knowledge-index.json');
const plain=s=>s.replace(/（[ぁ-ゖァ-ヺー]+）/g,'').replace(/～/g,'').trim();
const J=(s,zh=null,tts=null)=>({display:s.trim(),tts:tts||plain(s),lang:'ja-JP',translationZh:zh});
const clean=s=>s.trim().replace(/^[-*]\s*/,'');
const lines=s=>s.split('\n').map(clean).filter(Boolean);
function audio(s){const out=[];let active=false;for(const l of lines(s)){if(l.includes('🔊 日语朗读')){active=true;continue;}if(active&&/^[一-龯々ぁ-ゖァ-ヺー]/.test(l)&&/[ぁ-ゖァ-ヺ]/.test(l)&&!/[听后先第问答题学自然目标示范参考解抓复述两每今要选]/.test(l.slice(0,3))&&!l.includes('＝')&&!l.includes('（'))out.push(l);else active=false;}return out;}
function sourceBlocks(s){
 const spoken=new Set(audio(s));
 const known=[...index.vocabulary.map(v=>({display:v.word,tts:v.reading})),...index.grammar.map(g=>({display:'～'+g.form,tts:g.form}))];
 return lines(s.replace(/<span[^>]*>.*?<\/span>/g,'')).filter(l=>!l.includes('🔊 日语朗读')).map(l=>{
  const text=l.replace(/^#+\s*/,'');
  const japanese=spoken.has(l)?[J(l)]:[...l.matchAll(/(?:[一-龯々]+（[ぁ-ゖァ-ヺー]+）[ぁ-ゖァ-ヺー]*|[ぁ-ゖァ-ヺー]+|[、。！？「」～／])+/g)].filter(m=>m[0].includes('（')).map(m=>J(m[0]));
  for(const t of known)if(text.includes(t.display))japanese.push(J(t.display,null,t.tts));
  return {text,heading:/^#/.test(l),japanese};
 });
}
function question(s,id){const ls=lines(s),q=ls.find(l=>/^(?:Q|問題|问题)[：:]/.test(l));if(!q)return null;const options=ls.filter(l=>/^[A-D]\.\s*/.test(l)).map(l=>({id:l[0],text:J(l.replace(/^[A-D]\.\s*/,''))}));const ans=s.match(/(?:答案|正解)[：:]\s*([A-D])/);return {id,type:'single_choice',prompt:J(q.replace(/^(?:Q|問題|问题)[：:]\s*/,'')),options,answer:ans?.[1],explanationZh:ls.find(l=>/^(?:解题要求|答案|正解)[：:]/.test(l))||'根据原文核对。'};}
const titles={2:'信息判断与依据',3:'城市暑热与多种对策',4:'灾害对策与语法辨析',5:'学习效率与任务听力',6:'工作方式与效率',7:'第一周复盘与方法调整'};
const days=[];
for(const src of sources){
 const n=src.day,id='day'+String(n).padStart(3,'0');
 const parts=src.text.split(/^#{1,2}\s*[①②③④⑤⑥⑦⑧]/m),intro=parts.shift();
 const secs=parts.map(s=>{const pos=s.indexOf('\n'),title=s.slice(0,pos).trim();return {title,body:s.slice(pos+1),durationMinutes:Number(title.match(/(\d+)分钟/)?.[1]||0)};});
 const d={id,day:n,week:1,date:new Date(Date.UTC(2026,7,26+n)).toISOString().slice(0,10),title:titles[n],schemaVersion:'2.1.0',source:{url:src.url,title:src.title,archive:'docs/course-sources/'+id+'.md'},goalsZh:lines(intro).filter(l=>!l.startsWith('#')),scheduledMinutes:secs.reduce((a,s)=>a+s.durationMinutes,0),sourceEstimatedMinutes:Number(intro.match(/约\s*(\d+)分钟/)?.[1]||0),counts:{},modules:[],vocabulary:[],collocations:[],grammar:[],review:{instructionsZh:'按 D+1 / D+3 复习；3秒说出读音与意思。记录真实红黄绿，再做原正式课程中的重点抽测。D+7 从 Day 008 起到期。',intervals:[]}};
 for(const off of [1,3,7])if(n-off>=1)d.review.intervals.push({offsetDays:off,sourceDay:n-off,vocabularyIds:index.vocabulary.filter(v=>v.firstTaughtDay===n-off).map(v=>v.id),grammarIds:index.grammar.filter(g=>g.firstTaughtDay===n-off).map(g=>g.id)});
 for(const sec of secs){
  const b=sec.body,ls=lines(b),m={durationMinutes:sec.durationMinutes};
  if(sec.title.includes('旧知识')){
   d.modules.push({...m,type:'review'});
   d.modules.push({type:'source',title:'正式重点复习',durationMinutes:0,blocks:sourceBlocks(b),withinPreviousModule:true});
  }else if(sec.title.includes('新词')){
   d.modules.push({...m,type:'vocabulary'});
   const rows=[...b.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].slice(1).map(r=>[...r[1].matchAll(/<td>(.*?)<\/td>/g)].map(x=>x[1]));
   const collocText=b.split(/#{2,3}\s*重点搭配/)[1]?.split(/#{2,3}\s*🔊/)[0]||'';
   d.collocations=lines(collocText).filter(l=>l.includes('＝')).map((l,i)=>{const at=l.indexOf('＝');return {id:id+'-c'+(i+1),text:J(l.slice(0,at),l.slice(at+1))};});
   d.vocabulary=rows.map(([word,reading,zh],i)=>({id:id+'-v'+(i+1),knowledgeId:'v-'+word,mode:index.vocabulary.find(v=>v.word===word)?.firstTaughtDay<n?'review':'new',word:J(word,zh.replace(/[、, ]*확보/,''),reading),reading,collocations:d.collocations.filter(c=>plain(c.text.display).includes(word))}));
   const notes=ls.filter(l=>/易混|容易混|重点：|^>|偏正式|使用范围|都可表示|读音完全/.test(l)&&!l.startsWith('<'));
   if(notes.length)d.modules.push({type:'source',title:'词汇辨析',durationMinutes:0,withinPreviousModule:true,blocks:sourceBlocks(notes.join('\n'))});
  }else if(sec.title.includes('今日')&&sec.title.includes('语法')){
   d.modules.push({...m,type:'grammar'});
   const gs=b.split(/^###\s+(?=(?:\d+\.\s*)?～)/m).slice(1);
   d.grammar=gs.map((s,i)=>{const gl=lines(s),form=gl.shift().replace(/^\d+\.\s*/,''),examples=[];
    for(let j=0;j<gl.length;j++){const match=gl[j].match(/^(?:带假名)?例句\d*[：:]\s*(.*)/);if(match)examples.push(J(match[1],gl[j+1]?.match(/^翻译[：:]\s*(.*)/)?.[1]||null));}
    const extraAudio=audio(s).flatMap(a=>a.match(/[^。！？]+[。！？]?/g)||[]).filter(a=>!examples.some(e=>e.tts.includes(a)));
    const gid='g-'+plain(form),g=index.grammar.find(g=>g.id===gid);
    return {id:id+'-g'+(i+1),knowledgeId:gid,mode:g?.firstTaughtDay<n?'review':'new',form:J(form),meaningZh:gl.filter(l=>/^中文意义/.test(l)).map(l=>l.replace(/^中文意义\d*[：:]\s*/, '')).join('；'),explanationZh:gl.filter(l=>/^使用说明/.test(l)).map(l=>l.replace(/^使用说明[：:]\s*/, '')).join('；'),examples:[...examples,...extraAudio.map(a=>J(a))],notes:gl.filter(l=>/^(?:重点词|整体记忆|搭配)[：:]/.test(l)).map(l=>({explanationZh:l,texts:[]}))};
   });
  }else if(sec.title.includes('阅读')){
   d.modules.push({...m,type:'reading'});
   const paragraph=ls.find(l=>!l.startsWith('#')&&l.includes('（')&&l.length>100);
   d.reading={id:id+'-reading',timeLimitSeconds:n===2?60:90,text:J(paragraph),questions:[question(b,id+'-rq1')].filter(Boolean),secondPass:['核对原文依据','点击日语听读','不看原文复述']};
  }else if(sec.title.includes('即时应答')){
   const tasks=[];for(let i=0;i<ls.length;i++)if(ls[i].includes('🔊 日语朗读')){const prompt=ls[i+1],answer=ls[i+2]?.replace(/^自然回答[：:]\s*/,'');if(prompt&&answer)tasks.push({prompt:J(prompt),answer:J(answer)});}
   d.modules.push({...m,type:'responses',id:id+'-responses',tasks,instructionsZh:'先听题目，立即用日语回答，再查看原正式示范。两人交换角色。'});
  }else if(sec.title.includes('听力')){
   d.modules.push({...m,type:'listening'});
   const tts=audio(b).join(''),q=question(b,id+'-lq1');
   const annotated=ls.find(l=>/^学习版(?:原文)?[：:]/.test(l))?.replace(/^学习版(?:原文)?[：:]\s*/,'')||ls.find(l=>l.includes('（')&&l.length>100)||tts;
   d.listening={id:id+'-listening',instructionsZh:ls[0],tts,question:q,questions:q?[q]:[],segments:[{text:J(annotated,null,tts)}],retellingInstructionsZh:ls.filter(l=>/复述|抓信号|听力抓手|分工/.test(l)).join('；'),followUps:n===3?ls.filter(l=>/^(どうして|歩（|どのように)/.test(l)).map(l=>J(l)):[]};
  }else if(sec.title.includes('口语')){
   d.modules.push({...m,type:'speaking'});
   let topicIndex=ls.findIndex(l=>/^(?:主题|话题)[：:]/.test(l));let topic=topicIndex>=0?ls[topicIndex].replace(/^(?:主题|话题)[：:]\s*/,''):ls[ls.indexOf('今日主题：')+1];
   if(!topic)throw Error('Missing speaking topic '+id);
   const split=topic.split('＝'),start=ls.findIndex(l=>/^(示范|参考)[：:]/.test(l));
   let models=start>=0?ls.slice(start+1).filter(l=>!l.startsWith('#')).filter(l=>l.includes('（')):[];
   if(!models.length){const full=audio(b).join('');const p=plain(split[0]);models=[full.startsWith(p)?full.slice(p.length):full].filter(Boolean);}
   d.speaking={id:id+'-speaking',prompt:J(split[0],split[1]||null),instructionsZh:ls.filter(l=>/^每|^要求/.test(l)).join('；'),models:models.map(l=>J(l)),followUps:[]};
  }else if(sec.title.includes('复盘')){
   d.modules.push({...m,type:'recap'});
   d.recap={instructionsZh:ls.join('\n')};
   if(n===7)d.weeklyReview={instructionsZh:'按原正式 Day 007 完成累计抽测；在笔记记录 A / B 两人的红黄绿、听力分工和下周需回收的项目。尚未填写的结果保持空白。',assessment:{vocabularySampleCount:10,grammarPromptCount:3},actualResults:null};
  }else d.modules.push({...m,type:'source',title:sec.title,blocks:sourceBlocks(b)});
 }
 d.counts={newVocabulary:d.vocabulary.filter(v=>v.mode==='new').length,reviewVocabulary:d.vocabulary.filter(v=>v.mode==='review').length};
 if(n===7){const mod=d.modules.find(m=>m.type==='source');mod.blocks.push({text:'日期校核：原文“D+7｜第一周累计抽测”保留为累计抽测；Day 001 的正式 D+7 到期日为 Day 008。',japanese:[]});}
 write('docs/course-sources/'+id+'.md',src.text);
 days.push(d);
}
write('data/week01.json',{schemaVersion:'2.1.0',week:1,dayRange:[1,7],legacyDayIds:['day001'],sourcePolicy:'Import existing formal Day 2–7 as Day 002–007; preserve original lessons and record editorial corrections explicitly.',days});
console.log(days.map(d=>d.id+': '+d.vocabulary.length+' vocabulary, '+d.grammar.length+' grammar, '+d.modules.length+' modules').join('\n'));
