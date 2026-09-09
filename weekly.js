'use strict';
window.N2BuildCards = function(day, h) {
 const {esc,jp,ruby,state}=h, cards=[], index=window.N2_KNOWLEDGE;
 function sourceBlocks(blocks){
  return blocks.map(b=>{
   let html='',position=0;const candidates=(b.japanese||[]).filter(t=>t.tts&&/[一-龯々ぁ-ゖァ-ヺ]/.test(t.tts)).sort((a,b)=>b.display.length-a.display.length);
   while(position<b.text.length){let best=null,at=b.text.length;for(const t of candidates){const p=b.text.indexOf(t.display,position);if(p>=0&&p<at){at=p;best=t;}}if(!best){html+=esc(b.text.slice(position));break;}html+=esc(b.text.slice(position,at))+jp(best.display,best.tts);position=at+best.display.length;}
   return b.heading?'<h3>'+html+'</h3>':'<p>'+html+'</p>';
  }).join('');
 }
 const text=(t,play=true)=>t?(play?jp(t.display,t.tts):'<span lang="ja">'+ruby(t.display)+'</span>'):'';
 const translated=t=>t&&t.translationZh?'<p class="translation">'+esc(t.translationZh)+'</p>':'';
 const show=id=>!!state.revealed[id];
 const reveal=(id,label)=>'<button data-reveal="'+esc(id)+'">'+esc(label)+'</button>';
 const add=(id,section,title,html)=>cards.push({id,section,title,html});
 const note=s=>'<p class="note">'+esc(s||'')+'</p>';
 const examples=items=>(items||[]).map(t=>'<div class="example">'+text(t)+translated(t)+'</div>').join('');
 function questions(items,play) {return items.map(q=>{
  const answered=Object.prototype.hasOwnProperty.call(state.answers,q.id);
  return '<div class="question"><h3>'+text(q.prompt,play)+'</h3>'+
   (q.type==='single_choice'?q.options.map(o=>'<button class="option" data-question="'+esc(q.id)+'" data-answer="'+esc(o.id)+'" aria-pressed="'+(state.answers[q.id]===o.id)+'">'+esc(o.id)+'. '+(play?text(o.text):ruby(o.text.display))+'</button>').join(''):reveal(q.id,'已作答，查看参考答案'))+
   ((answered||show(q.id))?note((q.answer?'正确答案：'+q.answer+'。 ':'')+q.explanationZh)+examples(q.sampleAnswer?[q.sampleAnswer]:[]):'')+'</div>';
 }).join('');}
 add(day.id+'-intro','今日目标',day.title,()=>'<h1>'+esc(day.title)+'</h1><p class="meaning">'+esc(day.date)+'</p><div class="stats"><div><strong>'+day.counts.newVocabulary+'</strong><span>新词</span></div><div><strong>'+day.counts.reviewVocabulary+'</strong><span>复习词</span></div><div><strong>'+day.scheduledMinutes+'</strong><span>分钟</span></div></div>'+note(day.goalsZh.join('；')));
 for(const module of day.modules) {
  const label=({review:'间隔复习',vocabulary:'词汇',grammar:'语法',reading:'阅读',listening:'听力／复述',speaking:'双人口语',recap:'复盘'})[module.type]+' · '+module.durationMinutes+'分钟';
  if(module.type==='source'){
   const key=day.id+'-source-'+day.modules.indexOf(module);
   add(key,module.title,module.title,()=>'<h2>'+esc(module.title)+'</h2>'+sourceBlocks(module.blocks));
  }
  if(module.type==='responses'){
   module.tasks.forEach((task,i)=>{const key=module.id+'-'+i;
    add(key,'即时应答 · '+module.durationMinutes+'分钟','听后立即回答',()=>'<h2>即时应答 '+(i+1)+'</h2>'+note(module.instructionsZh)+'<button class="speak audio-trigger" data-speech="'+esc(task.prompt.tts)+'">播放题目</button>'+(show(key)?examples([task.prompt,task.answer]):reveal(key,'已回答，查看题目与示范')));
   });
  }
  if(module.type==='review') {
   for(const interval of day.review.intervals){
    const prefix=day.id+'-review-'+interval.offsetDays;
    add(prefix,label,'D+'+interval.offsetDays,()=>'<h2>D+'+interval.offsetDays+' · Day '+String(interval.sourceDay).padStart(3,'0')+'</h2>'+note(day.review.instructionsZh)+'<p>'+interval.vocabularyIds.length+' 个词汇 · '+interval.grammarIds.length+' 个语法</p>');
    for(const id of interval.vocabularyIds){const v=index.vocabulary.find(x=>x.id===id);if(!v)continue;
     const key=prefix+'-'+id;
     add(key,label,v.word,()=>'<p class="eyebrow">D+'+interval.offsetDays+' · 3秒提取</p><h1>'+ (show(key)?text(v.text):esc(v.word))+'</h1>'+ (show(key)?'<p class="meaning">'+esc(v.reading)+' · '+esc(v.meaningZh)+'</p>':reveal(key,'显示读音与意思')));
    }
    for(const id of interval.grammarIds){const g=index.grammar.find(x=>x.id===id);if(!g)continue;const key=prefix+'-'+id;
     add(key,label,g.form,()=>'<h2>'+text(g.formText)+'</h2>'+note('先说中文意义，再造一句。')+(show(key)?note(g.meaningZh)+examples(g.examples):reveal(key,'核对意义与例句')));
    }
   }
  }
  if(module.type==='vocabulary'){
   for(const v of day.vocabulary)add(v.id,label,v.word.display,()=>'<p class="eyebrow">'+(v.mode==='new'?'今日新词':'复习词')+'</p><h1>'+text(v.word)+'</h1><p class="translation" lang="ja">'+jp(v.reading,v.reading)+'</p><p class="meaning">'+esc(v.word.translationZh)+'</p>'+examples(v.collocations.map(c=>c.text)));
   const linked=new Set(day.vocabulary.flatMap(v=>v.collocations.map(c=>c.id)));
   for(const c of day.collocations.filter(c=>!linked.has(c.id)))add(c.id,label,'重点搭配',()=>'<h2>'+text(c.text)+'</h2>'+translated(c.text));
  }
  if(module.type==='grammar')for(const g of day.grammar)add(g.id,label,g.form.display,()=>'<p class="eyebrow">'+(g.mode==='new'?'新语法':'语法回收')+'</p><h1>'+text(g.form)+'</h1><p class="meaning">'+esc(g.meaningZh)+'</p>'+note(g.explanationZh)+examples(g.examples)+(g.notes||[]).map(n=>note(n.explanationZh)+examples(n.texts)).join(''));
  if(module.type==='reading'){
   const r=day.reading;
   add(r.id,label,'先读后听',()=>'<h2>计时阅读 · '+r.timeLimitSeconds+'秒</h2>'+note(show(r.id)?r.secondPass.join(' → '):'第一遍自行计时，不查词，不听朗读。读完后完成下方问题。')+'<div class="reading-text">'+text(r.text,show(r.id))+'</div>'+questions(r.questions,show(r.id))+(show(r.id)?translated(r.text):reveal(r.id,'已完成阅读作答，进入听读复述')));
  }
  if(module.type==='listening'){
   const l=day.listening;
   add(l.id,label,'先听后看',()=>'<h2>听人物、动作与最后决定</h2>'+note(l.instructionsZh||'先听一次再作答；之后查看原文，复听并交换角色复述。')+'<button class="speak audio-trigger" data-speech="'+esc(l.tts)+'">播放听力</button>'+questions(l.questions||(l.question?[l.question]:[]),false)+(show(l.id)?examples(l.segments.map(s=>s.text))+note(l.retellingInstructionsZh)+examples(l.followUps):reveal(l.id,'已完成听力作答，查看原文')));
  }
  if(module.type==='speaking'){
   const s=day.speaking;
   add(s.id,label,'双人输出',()=>'<h2>'+text(s.prompt)+'</h2>'+translated(s.prompt)+note(s.instructionsZh)+examples(s.followUps)+(show(s.id)?examples(s.models):reveal(s.id,'自己说完后，查看示范')));
  }
  if(module.type==='recap'){
   add(day.id+'-recap',label,'记录真实薄弱项',()=>'<h2>把今天的薄弱项留下来</h2>'+note(day.recap.instructionsZh)+'<label for="notes">本日笔记（可分别写 A / B）</label><textarea id="notes"></textarea><p id="reviewCounts"></p>');
   if(day.weeklyReview) {
    const w=day.weeklyReview;
    for(let i=0;i<(w.grammarTasks||[]).length;i++){const g=w.grammarTasks[i],id=day.id+'-weekly-grammar-'+i;
     add(id,label,'周语法抽测',()=>'<h2>'+text(g.form)+'</h2>'+note(g.promptZh)+(show(id)?note(g.expectedMeaningZh)+examples([g.sampleAnswer]):reveal(id,'造句后核对')));
    }
    add(day.id+'-handoff',label,'Week '+String(day.week).padStart(2,'0')+' 交接',()=>'<h2>Week '+String(day.week).padStart(2,'0')+' · 周复盘与交接</h2>'+note(w.instructionsZh)+'<p>全周抽测 '+w.assessment.vocabularySampleCount+' 个词汇，'+w.assessment.grammarPromptCount+' 个语法。</p>'+note('本页不会自动判定已经掌握。请在本日笔记分别记录两人的完成情况、红黄绿、阅读依据、听力角色动作、口语卡点和下周调整。'));
   }
  }
 }
 return cards;
};

