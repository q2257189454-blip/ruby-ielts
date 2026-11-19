import {icon,esc,url,labelRef,partStamp,safeGet,safeSet} from './ui.js';
const groupNames={heading:'Heading · 段落标题',contain:'Contain · 段落信息匹配',mc:'选择题',tf:'判断题 · T / F / NG',yn:'观点判断 · Y / N / NG',fill:'填空题',wordbank:'选词填空',short:'简答题',ending:'句尾匹配',match:'信息配对'};
const shortNames={heading:'Heading',contain:'Contain',mc:'选择',tf:'T / F / NG',yn:'Y / N / NG',ynng:'Y / N / NG',fill:'填空',wordbank:'选词',short:'简答',ending:'句尾匹配',match:'配对'};
const groupHints={heading:'从段落要点回想正确标题。',contain:'从题干中的细节回想它出现的段落。',mc:'点开题干，查看正确选项的中英文。',tf:'对照原文的事实，检查对象、范围和时间。',yn:'判断陈述是否符合作者的观点。',fill:'看保留空格的中文，回想英文原词。',wordbank:'根据中文空格回想英文词库中的答案。',short:'先用中文回想，再检查英文答案。',ending:'读完句首，回想能使原意完整的句尾。',match:'从题干的观点或特征定位对应的人物、地点或类别。'};
const modes=[['parallel','逐句对照'],['original','只看原文'],['recall','遮住译文']];
const zhTitles={article:'文章内容',questions:'题目速记',language:'语言考点'};
let textMode=safeGet('ruby.ielts.recall.language-mode.v1','parallel');
if(!modes.some(m=>m[0]===textMode))textMode='parallel';
let questionOpen=new Map();
function addr(ref,note){if(!ref)return '';const [p,s]=ref.split('.');return note.paragraphs.find(x=>x.id===p)?.sentences[Number(s)-1]?.[0]||''}
function loc(id,ref,returnTo,from='questions'){if(!ref)return '';return `<a class="ref-link" href="${esc(url(id,'article',{at:ref,rev:2,back:returnTo,from}))}">${icon('pin')}${esc(labelRef(ref))}</a>`}
function jumpLink(target,txt){return `<button type="button" class="q-shortcut" data-scroll="${esc(target)}">${esc(txt)}</button>`}
function toolsMode(){return `<div class="mode" role="group" aria-label="原文显示方式">${modes.map(([key,name])=>`<button type="button" data-mode="${key}" class="${textMode===key?'active':''}" aria-pressed="${textMode===key}">${name}</button>`).join('')}</div>`}
function asideLinks(rows,detail){return `<aside class="aside"><div class="aside-head"><h2>本页目录</h2>${icon('list')}</div><nav aria-label="本页目录">${rows.map(([id,t])=>`<button data-scroll="${esc(id)}">${esc(t)}</button>`).join('')}</nav>${detail?`<small>${esc(detail)}</small>`:''}</aside>`}
function beforeText(params,id){const back=params.get('back');if(!back)return '';const from=params.get('from')==='language'?'language':'questions';const label=from==='language'?'回到语言考点':back.startsWith('heading-options')?'回到标题列表':'回到 Q'+back.replace(/^q-/,'');return `<a class="jumpback" href="${esc(url(id,from,{at:back}))}">${icon('rotate')}${esc(label)}</a>`}

function bilingualLine([english, chinese], ref, selected, returnLink = '', heading = false) {
  const tag = heading ? 'h3' : 'span';
  const classes = ['sentence', heading && 'source-subheading', ref === selected && 'hit'].filter(Boolean).join(' ');
  const reveal = `<button class="single-translation" data-trans="${esc(ref)}" ${textMode === 'recall' ? '' : 'hidden'} aria-expanded="false">看这句译文</button>`;
  return `<div id="s-${esc(ref)}" class="${classes}"><${tag} class="en-line" lang="en">${esc(english)} </${tag}><div class="zh-line">${esc(chinese)}</div>${reveal}${ref === selected ? returnLink : ''}</div>`;
}

function supplementaryBlock(title, lines, prefix, selected) {
  if (!lines?.length) return '';
  const content = lines.map((line, i) => bilingualLine(line, prefix + '.' + (i + 1), selected)).join(' ');
  return `<section class="passage-lead"><h3>${esc(title)}</h3>${content}</section>`;
}

function renderPassageParagraph(paragraph, selected, returnLink) {
  const {id, role, sectionTitle, sentences, dialogueTurns, pdfPages} = paragraph;
  const heading = sectionTitle ? bilingualLine(sectionTitle, 'section.' + id, selected, returnLink, true) : '';
  const pageLabel = pdfPages?.length ? `<small class="pdf-page">原 PDF 第 ${esc(pdfPages.join('–'))} 页</small>` : '';
  const lines = sentences.map((sentence, i) => bilingualLine(sentence, id + '.' + (i + 1), selected, returnLink));
  let body = lines.join(' ');
  if (dialogueTurns?.length) {
    const turns = dialogueTurns.map((first, i) => {
      const end = i + 1 < dialogueTurns.length ? dialogueTurns[i + 1] - 1 : lines.length;
      return `<div class="dialogue-turn">${lines.slice(first - 1, end).join(' ')}</div>`;
    });
    body = lines.slice(0, dialogueTurns[0] - 1).join(' ') + `<blockquote class="passage-dialogue">${turns.join('')}</blockquote>`;
  }
  return `<section class="passage-section" id="p-${esc(id)}">${heading}<h3 class="para-title"><span class="para-id">${esc(id)}</span>${esc(role)}${pageLabel}</h3><div>${body}</div></section>`;
}

function renderLogicStep([span, action], index, grouped) {
  if (!span) return `<div class="flow-step"><b>${index + 1}</b><span>${esc(action)}</span></div>`;
  const firstParagraph = span.split(/[–—-]/)[0];
  const label = grouped ? `第 ${span} 段` : span;
  return `<button type="button" data-scroll="p-${esc(firstParagraph)}"><b>${esc(label)}</b><span>${esc(action)}</span></button>`;
}

function renderArticle(a,n,params){
  const paragraphs=n.paragraphs;
  const selected=params.get('at')||'';
  const lead = supplementaryBlock('导语', n.lead, 'lead', selected);
  const notes = supplementaryBlock('原文注释', n.footnotes, 'note', selected);
  const returnLink = beforeText(params, a.id);
  const overview=`<section class="study-card overview" id="abstract"><h2>文章大意</h2><p>${esc(n.summary)}</p></section>`;
  const grouped = Boolean(a.studyGroupCount);
  const outline = n.logic.map((step, index) => renderLogicStep(step, index, grouped)).join('');
  const flow=`<section class="study-card" id="logic"><h2>行文逻辑</h2><div class="logic-links${grouped ? ' study-outline' : ''}">${outline}</div><details class="para-briefs"><summary>逐段大意 <span class="chev">${icon('chevron')}</span></summary>${paragraphs.map(p=>`<div class="brief-row"><button data-scroll="p-${esc(p.id)}">${esc(labelRef(p.id))}${p.role?' · '+esc(p.role):''}</button><span>${esc(p.brief)}</span></div>`).join('')}</details></section>`;
  const text=`<section class="study-card para-card" id="passage"><div class="switch-line"><h2 class="source-heading">文章主体</h2>${toolsMode()}</div><div id="passage-body" class="${textMode==='original'?'original-only':textMode==='recall'?'hidden-zh':''}">${lead}${paragraphs.map(p => renderPassageParagraph(p, selected, returnLink)).join('')}${notes}</div></section>`;
  return {main:overview+flow+text,side:asideLinks([['abstract','文章大意'],['logic','行文逻辑'],['passage','原文与逐句翻译'],...paragraphs.map(p=>['p-'+p.id,p.role?labelRef(p.id)+' · '+p.role:labelRef(p.id)])],`${paragraphs.length} 段 · ${paragraphs.reduce((sum,p)=>sum+p.sentences.length,0)} 句`)}
}
function headingBank(opts,a,n,bankId){return `<details class="head-library"><summary>${icon('list')} 全部 ${opts.length} 个标题与中文 <span class="chev">${icon('chevron')}</span></summary><div class="head-opts">${opts.map(([num,en,zh,par,ref,why])=>`<div class="opt"><span class="opt-en" lang="en"><b>${esc(num)}</b>${esc(en)}</span><p>${esc(zh)}</p><details><summary>查看匹配或排除理由</summary><p><strong>${par?esc(par)+' 段':'干扰项'}</strong> · ${esc(why)}</p>${ref?`<blockquote class="evidence" lang="en">${esc(addr(ref,n))}</blockquote>${loc(a.id,ref,bankId)}`:''}</details></div>`).join('')}</div></details>`}
function questionCard(a,n,g,q){
  const qid='q-'+q.no;const key=a.id+':'+(new URLSearchParams(location.hash.split('?')[1]).get('v')||'')+':'+qid;const isOpen=questionOpen.get(key)===true;
  const headingCue=q.cue?`<span class="heading-cue">${esc(q.cue)}</span>`:'';
  const clue=q.clue?`<span class="clue-line">定位词　${esc(q.clue)}</span>`:'';
  let answer;
  if(q.correct)answer=q.correct.map(([ltr,en,zh,ref])=>`<div class="correct-row"><b>${esc(ltr)}</b> <span class="q-en" lang="en">${esc(en)}</span><p>${esc(zh)}</p>${loc(a.id,ref,qid)}</div>`).join('');
  else {
    const value=g.type==='contain'?q.answer+' 段':q.answer;
    const initial=g.type==='contain'?'所在段落':g.type==='heading'?'正确标题':'答案';
    const refs=[...new Set([q.ref,...(q.refs||[])].filter(Boolean))];
    const contextOnly=q.contextOnly||q.answer==='NOT GIVEN';
    answer=`<div class="q-answer"><span class="answer-label">${initial}</span><strong>${esc(value)}</strong></div>${q.solution?`<p class="answer-zh">${esc(q.solution)}</p>`:''}${q.why?`<p class="reason">${esc(q.why)}</p>`:''}${g.type!=='ending'&&q.ref?`${contextOnly?'<span class="evidence-label">相关原文</span>':''}<blockquote class="evidence" lang="en">${esc(addr(q.ref,n))}</blockquote>`:''}${refs.map(r=>loc(a.id,r,qid)).join('')}`;
  }
  return `<details id="${esc(qid)}" class="q-card" data-qkey="${esc(key)}" ${isOpen?'open':''}><summary><span class="q-num">Q${esc(q.no)}</span><span><span class="q-en" lang="en">${esc(q.en)}</span><span class="q-zh">${esc(q.zh)}</span>${headingCue}${clue}</span><span class="reveal-cue"><span class="show">看答案</span><span class="hide">收起</span><span class="chev">${icon('chevron')}</span></span></summary><div class="q-detail">${answer}</div></details>`
}
function questionView(a,n){
  if (a.sourceKind === 'background' && !n.groups.length) {
    return {main:`<section class="study-card overview"><h2>背景阅读资料</h2><p>当前版本收录的是背景长文，段号对应这份资料。核对考试段落请以带题试卷为准。</p><a class="text-link" href="${esc(url(a.id,'article'))}">看文章内容</a></section>`,side:''};
  }
  if(!n.groups.length)return {main:`<section class="study-card overview"><h2>纯阅读篇目</h2><p>这篇文章没有附带题目。可以用逐句对照、段落大意和语言考点复习。</p><a class="text-link" href="${esc(url(a.id,'article'))}">看文章内容</a></section>`,side:''};
  const groups=n.groups.map((g,i)=>({...g,anchor:n.groups.slice(0,i).some(v=>v.type===g.type)?'g-'+g.type+'-'+i:'g-'+g.type}));
  const title=g=>g.label||groupNames[g.subtype]||groupNames[g.type]||'题目';
  const nav=groups.map(g=>`<button data-scroll="${g.anchor}" class="q-shortcut ${['heading','contain'].includes(g.type)?'focus-type':''}">${esc(shortNames[g.subtype]||shortNames[g.type]||'题目')} <small>Q${esc(g.range)}</small></button>`).join('');
  const head=`<div class="q-head"><div class="mini-heading"><h2>题型速记</h2><button class="toolbtn" id="q-all">${icon('cards')}<span>展开全部答案</span></button></div><div class="q-jumps">${nav}</div>${n.inferredAnswers?'<p class="group-hint">本篇答案依据题干与原文推定。</p>':''}</div>`;
  const panels=groups.map(g=>{
    const bank=g.wordbank?.length?`<details class="head-library"><summary>${icon('list')} 查看备选词 <span class="chev">${icon('chevron')}</span></summary><div class="wordbank">${g.wordbank.map(([k,en,zh])=>`<span><b>${esc(k)}</b> ${esc(en)}${zh?' · '+esc(zh):''}</span>`).join('')}</div></details>`:'';
    const bankId=g.anchor==='g-heading'?'heading-options':'heading-options-'+g.anchor;
    const opts=g.type==='heading'&&g.options?.length?`<div id="${esc(bankId)}">${headingBank(g.options,a,n,bankId)}</div>`:'';
    const instruction=g.instructionsZh||g.hint||(g.instructions&&/[\u4e00-\u9fff]/u.test(g.instructions)?g.instructions:'')||groupHints[g.subtype]||groupHints[g.type]||'';
    return `<section id="${esc(g.anchor)}" class="q-section"><h3>${esc(title(g))}<span class="range">Q${esc(g.range)}</span></h3><p class="group-hint">${esc(instruction)}</p>${opts}${bank}${g.items.map(q=>questionCard(a,n,g,q)).join('')}</section>`;
  }).join('');
  return {main:head+panels,side:asideLinks(groups.map(g=>[g.anchor,title(g)+' · Q'+g.range]),'点题干查看答案，再点定位句回到原文。')};
}
function languageView(a,n){
  const pairs=`<section class="study-card" id="pairs"><h2>同义替换</h2><p class="section-hint">${n.groups.length?'按题号对照题干与原文，按段落复习词义。':'对照原文表达和释义。'}</p>${n.pairs.map(([qs,from,to,zh,ref,kind])=>`<div class="pair"><small>${esc(qs)}${kind?' · '+esc(kind):''}</small><div class="pair-main"><span lang="en">${esc(from)}</span><span class="swap">${kind==='原文释义'?'意为':'对应'}</span><mark lang="en">${esc(to)}</mark></div><p>${esc(zh)}</p>${loc(a.id,ref,'pairs','language')}</div>`).join('')}</section>`;
  const points=`<section class="study-card" id="points"><h2>高频考点解析</h2>${n.points.map(([title,num,body,ref])=>`<div class="point"><small>${esc(num)}</small><h3>${esc(title)}</h3><p>${esc(body)}</p>${loc(a.id,ref,'points','language')}</div>`).join('')}</section>`;
  const clauses=`<section class="study-card" id="clauses"><h2>从句拆解</h2>${n.clauses.map(([ref,title,main,scope,step])=>{const [p,s]=ref.split('.');const zh=n.paragraphs.find(x=>x.id===p).sentences[Number(s)-1][1];return `<div class="clause"><h3>${esc(title)}</h3><blockquote lang="en">${esc(addr(ref,n))}</blockquote><p><span class="term">主干　</span><span lang="en">${esc(main)}</span></p><p><span class="term">从句　</span>${esc(scope)}</p><p><span class="term">顺读　</span>${esc(step)}</p><details class="source-block"><summary>整句译文 ${icon('chevron')}</summary><p>${esc(zh)}</p></details>${loc(a.id,ref,'clauses','language')}</div>`}).join('')}</section>`;
  return {main:pairs+points+clauses,side:asideLinks([['pairs','题干与原文的同义替换'],['points','本篇高频考点'],['clauses','长难句与从句']],null)}
}
function studyPage(a,n,tab,params,marked){
  const v=params.get('v'), chosen=a.variants?.some(x=>x[0]===v)?v:a.id;
  const readingLabel = a.sourceKind === 'background' ? '背景资料（非原题）' : '纯阅读';
  const studyGroups = a.studyGroupCount ? `<span class="meta-inline">${esc(a.studyGroupCount)} 个速记主题</span>` : '';
  const meta=`<div class="meta">${partStamp(a.part)}${n.paragraphs.length?`<span class="meta-inline">${n.paragraphs.length} 段</span>`:''}${studyGroups}${n.groups.length?'':`<span class="meta-inline">${readingLabel}</span>`}</div>`;
  const variants=a.variants?`<div class="variants"><span>题型版本</span>${a.variants.map(([id,name])=>`<a class="${chosen===id?'active':''}" href="${esc(url(a.id,tab,{v:id===a.id?null:id}))}">${esc(name)}</a>`).join('')}</div>`:'';
  const tabs=`<nav class="study-tabs" aria-label="速记分区">${Object.entries(zhTitles).map(([key,label])=>`<a href="${esc(url(a.id,key))}" class="${tab===key?'active':''}" ${tab===key?'aria-current="page"':''}>${icon({article:'book',questions:'cards',language:'pen'}[key])}${label}</a>`).join('')}</nav>`;
  const view=tab==='questions'?questionView(a,n):tab==='language'?languageView(a,n):renderArticle(a,n,params);
  const subtitle=n.subtitle?`<p class="passage-subtitle" id="subtitle"><i lang="en">${esc(n.subtitle[0])}</i>　${esc(n.subtitle[1])}</p>`:'';
  return `<div class="shell article-shell"><a href="#/index" class="back-link" data-back-index>${icon('list')} 返回篇目索引</a><header class="article-heading"><div>${meta}<h1 lang="en"><span class="${a.highlight?'highlight-title':''}">${esc(a.en)}</span></h1><p class="cn">${esc(a.zh)}</p>${subtitle}</div><button class="btn article-mark" data-book="${esc(a.id)}" aria-pressed="${marked}" aria-label="${marked?'移除书签':'加入书签'}">${icon('bookmark')}${marked?'已加书签':'加入书签'}</button></header>${variants}${tabs}<div class="study-grid ${view.side?'':'wide-reader'}"><div class="reader-col">${view.main}</div>${view.side}</div></div>`;
}
function scrollElement(id,moveFocus=false){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:'instant',block:'start'});if(moveFocus){const t=el.matches('details')?el.querySelector('summary'):el;if(t){if(!t.hasAttribute('tabindex'))t.tabIndex=-1;t.focus({preventScroll:true})}}}
function updateBulkLabel(){const button=document.querySelector('#q-all span');if(!button)return;const all=[...document.querySelectorAll('.q-card')];button.textContent=all.length&&all.every(q=>q.open)?'遮住全部答案':'展开全部答案'}
function afterStudy(params,tab){
  document.querySelectorAll('.q-card').forEach(el=>el.addEventListener('toggle',()=>{questionOpen.set(el.dataset.qkey,el.open);updateBulkLabel()}));
  updateBulkLabel();
  const target=params.get('at');
  if(!target)return;
  requestAnimationFrame(()=>{
    if(tab==='article' && document.getElementById('s-'+target))scrollElement('s-'+target,true);
    else if(target.startsWith('heading-options')){const el=document.getElementById(target)?.querySelector('details');if(el)el.open=true;scrollElement(target,true)}
    else {const el=document.getElementById(target);if(el?.matches('.q-card'))el.open=true;scrollElement(target,true)}
  });
}
function studyAction(el){
  const mode=el.closest('[data-mode]')?.dataset.mode;
  if(mode&&modes.some(m=>m[0]===mode)){
    textMode=mode;safeSet('ruby.ielts.recall.language-mode.v1',mode);
    const root=document.getElementById('passage-body');if(!root)return;
    root.className=mode==='original'?'original-only':mode==='recall'?'hidden-zh':'';
    for(const b of document.querySelectorAll('[data-mode]')){b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode))}
    for(const b of root.querySelectorAll('[data-trans]')){b.hidden=mode!=='recall';b.setAttribute('aria-expanded','false');b.textContent='看这句译文';b.closest('.sentence').classList.remove('revealed')}
    return
  }
  const tr=el.closest('[data-trans]');
  if(tr){const visible=tr.closest('.sentence').classList.toggle('revealed');tr.textContent=visible?'遮住译文':'看这句译文';tr.setAttribute('aria-expanded',String(visible));return}
  const bulk=el.closest('#q-all');
  if(bulk){const all=[...document.querySelectorAll('.q-card')];const open=all.some(q=>!q.open);all.forEach(q=>{q.open=open;questionOpen.set(q.dataset.qkey,open)});updateBulkLabel();return}
  const scroll=el.closest('[data-scroll]');if(scroll)scrollElement(scroll.dataset.scroll,true)
}

export {studyPage,afterStudy,studyAction};

