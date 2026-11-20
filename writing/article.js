import {e,icon,btn,a,db,state,saved,persist,get,bookButton,openModal,highlightBox,notify,positionLine} from './ui.js';
import {model,isChart,fullText,sentenceText,allSlots,wordCount,chain,bilingual,bodyNames} from './model.js';
import {handbookUrl} from './handbook.js';
const current=()=>get(state.detailId);
const partsFor=d=>model(d,saved.edition);
const setOf=(bag,id)=>saved[bag][id]??={};
const slot=(d,parts)=>allSlots(parts).find(p=>p.key===state.selected);
function answeredCount(d,parts){
 const answers=saved.blanks[d.id]||{};
 return allSlots(parts).filter(p=>answers[p.key]?.trim()).length;
}
function chartFigure(d,ev=null,large=false){
 return `<div class="chart-figure ${large?'large':''}"><div class="chart-contain">${large?'':btn(icon('expand',17),'expandChart','figure-zoom','aria-label="放大原图"')}<div class="chart-art"><img src="./${e(d.image)}" alt="${e(d.title)}，${e(d.type)}">${highlightBox(ev)}</div></div>${ev?'<div class="figure-caption"><b>'+e(ev.anchor)+'</b></div>':''}</div>`;
}
function question(d){
 const chart=isChart(d);
 return `<section class="prompt"><div class="box-label">${icon('book',16)} 英文题目 <span lang="en">QUESTION</span></div><p class="english prompt-text" lang="en">${e(d.prompt)}</p><details class="prompt-zh" ${state.readZh?'open':''}><summary>中文题意 ${icon('down',14)}</summary><p>${e(d.q||d.promptZh)}</p></details>${chart?chartFigure(d,d.evidence[state.highlight]||null):`<div class="prompt-asks"><span class="ask-label">审题</span><span>${e(d.ask[0])}</span><span>${e(d.ask[1])}</span></div>`}</section>`;
}
function readToolbar(d){
 return `<div class="work-tabs">${[['read','book','双色范文'],['fill','pen','挖空练习'],['write','timer','限时写作']].map(([k,im,t])=>btn(icon(im,17)+t,'articleTab',state.tab===k?'active':'',`data-value="${k}" aria-pressed="${state.tab===k}"`)).join('')}</div>
 <div class="article-tools"><div class="edition-pick" aria-label="模板版本">${[['full','完整版'],['simple','简易版']].map(([k,t])=>btn(t,'edition',saved.edition===k?'active':'',`data-value="${k}" aria-pressed="${saved.edition===k}"`)).join('')}</div>
 ${state.tab!=='write'?`<div class="sample-legend"><span><i></i>固定模板</span><span><i></i>本题填充</span></div>`:''}
 <div class="edition-links">${state.tab!=='write'?btn('本题表达','toVocabulary','link-btn'):''}${btn('模板说明','templateGuide','link-btn muted')}</div></div>`;
}
function piecesHTML(d,s,fill){
 return s.pieces.map(w=>{
  if(!w.key)return e(w.text);
  const user=saved.blanks[d.id]?.[w.key];const cls=fill?'gap'+(user?.trim()?' answered':''):'filled';
  const text=fill?user?.trim()||'〔'+w.label+'〕':w.text;
  if(!fill)return '<span tabindex="0" role="button" class="filled'+(state.selected===w.key?' selected':'')+'" data-act="selectSlot" data-slot="'+e(w.key)+'" title="'+e(w.label)+'" aria-label="'+e(w.label+'：'+w.text)+'">'+e(w.text)+'</span>';
  return btn(e(text),'selectSlot',cls+(state.selected===w.key?' selected':''),`data-slot="${w.key}" title="${e(w.label)}" aria-label="${e(w.label+'：'+(fill?(user||'填写这里'):w.text))}"`);
 }).join('');
}
function slotInspector(d,parts){
 const w=slot(d,parts);if(!w)return '';
 const response=saved.blanks[d.id]?.[w.key]||'';
 const earlier=w.key==='rAction'?saved.blanks[d.id]?.r4:'';
 const previous=earlier?.trim()?`<details class="previous-blank"><summary>查看以前在此处写的判断</summary><p class="english" lang="en">${e(earlier)}</p></details>`:'';
 return `<section class="inspector"><div class="box-label">${icon('pen',16)} 当前填空</div><h3>${e(w.label)}</h3><p>${e(w.tip)}</p>
 ${state.tab==='fill'?`<label class="input-label" for="slotAnswer">我的英文表达</label><textarea id="slotAnswer" class="small-input english" rows="3" placeholder="写下你自己的填法…" lang="en">${e(response)}</textarea><span class="autosave">自动保存在本机</span>${previous}${btn(state.openHint?'收起参考填法':'看提示与参考','showSlotHint','link-btn')}${state.openHint?`<p class="slot-cn">${e(w.zh)}</p><p class="ref-en english">${e(w.text)}</p>`:''}`:`<p class="ref-en english">${e(w.text)}</p><div class="slot-cn">${e(w.zh)}</div>`}</section>`;
}
function studyBody(d,parts){
 const fill=state.tab==='fill',w=slot(d,parts),currentPi=w?.pi;
 return `<section class="article-sheet"><div class="sheet-head"><div><span class="section-kicker"><span></span> ${fill?'CLOZE PRACTICE':'MODEL ANSWER'}</span><h2>${fill?'填写本题内容':'参考范文'}</h2></div><span class="count-mark">${fill?answeredCount(d,parts)+' / '+allSlots(parts).length+' 项已填':(isChart(d)?'':parts.length+' 段 · ')+wordCount(fullText(parts))+' words'}</span></div>
 ${fill?'<p class="sheet-instruction">点选空格写英文。两个版本中意思相同的空格共用你的答案。</p>':''}
 ${parts.map((p,i)=>`<section class="essay-para" id="para-${i}"><div class="para-label"><span>${e(p.label)}</span>${btn(state.translated[i]?'收起中文':'中文','translate','translation-toggle',`data-idx="${i}" aria-expanded="${!!state.translated[i]}"`)}</div><p class="english essay-text" lang="en">${p.sentences.map(s=>piecesHTML(d,s,fill)).join(' ')}</p>${state.translated[i]?`<div class="cn-paragraph">${p.sentences.map(s=>e(s.zh)).join('')}</div>`:''}${currentPi===i?'<div class="mobile-inspect">'+slotInspector(d,parts).replaceAll('slotAnswer','slotAnswerMobile')+'</div>':''}</section>`).join('')}
 </section>`;
}
function bodyLogic(d){
 const body=state.logicBody;
 return `<section class="panel logic-detail"><div class="panel-heading">${icon('chain',19)}<h3>本段逻辑链</h3></div><div class="mini-tabs">${bodyNames(d).map((label,i)=>btn(e(label),'bodyLogic',i===body?'active':'',`data-idx="${i}"`)).join('')}</div>
 <ol class="chain-list">${chain(d,body).map(([k,v])=>`<li><strong>${k}</strong><span>${e(v)}</span></li>`).join('')}</ol>
 ${a('自己补中间一步','#/logic/'+d.id+'@'+body,'btn soft wide')}</section>`;
}
function bestEvidence(d,pi,si){
 const zh=d.paragraphs[pi].sentences[si].zh;
 const grams=t=>new Set([...t.matchAll(/[A-Za-z]+|[0-9]+(?:[.,][0-9]+)*|(?=([\u3400-\u9fff]{2}))/g)].map(m=>(m[1]||m[0]).toLowerCase()).filter(Boolean));
 const targets=grams(zh);
 const scored=d.evidence.map((v,i)=>{const words=grams(v.feature+v.detail+v.anchor);const common=[...targets].filter(t=>words.has(t));return {i,n:common.reduce((n,t)=>n+(/[0-9]/.test(t)?2:1),0)};}).sort((a,b)=>b.n-a.n);
 return scored[0]?.n>=2?scored[0].i:null;
}
function evidence(d){return `<section class="panel"><div class="panel-heading">${icon('target',19)}<h3>定位图中信息</h3></div><div class="evidence-grid">${d.evidence.map((v,i)=>btn(`<strong>${e(v.feature)}</strong><small>${e(v.anchor)}</small>`,'evidence','evidence-btn'+(state.highlight===i?' active':''),`data-idx="${i}"`)).join('')}</div>${state.highlight!==null?`<p class="evidence-detail">${e(d.evidence[state.highlight].detail)}</p>`:''}</section>`;}
const primaryTopics={'教育':'教育','犯罪':'犯罪与司法','交通':'交通','环境':'环境与能源','政府':'政府与公共政策','工作':'工作与就业','社会':'社会与平等','文化艺术与旅游':'文化与艺术','科技与媒体':'科技'};
const moreTopics={'社交媒体':'社交媒体','广告与新闻':'广告与新闻','科技':'科技','网络隐私':'科技','文化艺术':'文化与艺术','旅游':'旅游','家庭':'家庭与成长','职场':'工作与就业','城市生活':'城市与住房','社区生活':'社会与平等','国际与全球化':'全球化','健康':'健康','食品与消费':'经济与消费','交通出行':'交通','公共政策':'政府与公共政策'};
const specificTopics={e082:'体育与休闲',e193:'经济与消费',e214:'经济与消费',e098:'旅游',e134:'旅游',e207:'科技',e124:'社交媒体',e035:'广告与新闻',e038:'广告与新闻',e042:'社交媒体',e125:'社交媒体',e126:'科技',e159:'健康',e157:'家庭与成长',e137:'城市与住房',e190:'城市与住房',e102:'城市与住房',e111:'全球化'};
function phraseIndex(text, phrase) {
 const needle=phrase.toLowerCase(), source=text.toLowerCase();
 let pos=source.indexOf(needle);
 while(pos!==-1){
  const before=source.charAt(pos-1), after=source.charAt(pos+needle.length);
  if(!/[a-z0-9]/i.test(before) && !/[a-z0-9]/i.test(after))return pos;
  pos=source.indexOf(needle,pos+1);
 }
 return -1;
}

// Resolve examples in the selected edition so the quoted sentence always
// matches the adjacent reading passage, including its fixed opening words.
export function studyExpressions(d,parts) {
 const phrases=isChart(d)?d.phrases.map(p=>[p.en,p.zh]):d.v;
 const lines=parts.flatMap(p=>p.sentences.map(s=>({paragraph:p.label,text:sentenceText(s),translation:s.zh})));
 return phrases.map(([en,zh])=>{
  for(const line of lines){
   const start=phraseIndex(line.text,en);
   if(start!==-1)return {en,zh,...line,start};
  }
  return {en,zh};
 });
}

function phraseCard(item,index) {
 const {en,zh,text,translation,paragraph,start}=item;
 const summary=`<span class="expression-heading"><b lang="en" class="english">${e(en)}</b><span>${e(zh)}</span></span>`;
 if(text===undefined)return `<div class="expression-entry">${summary}</div>`;
 const quote=e(text.slice(0,start))+'<mark>'+e(text.slice(start,start+en.length))+'</mark>'+e(text.slice(start+en.length));
 return `<details class="expression-entry" data-phrase-index="${index}" ${state.phraseOpen[index]?'open':''}><summary>${summary}${icon('down',13)}</summary><div class="expression-context"><small>范文原句 · ${e(paragraph)}</small><p class="english" lang="en">${quote}</p><p>${e(translation)}</p></div></details>`;
}
function vocabulary(d,parts){
 const chart=isChart(d), phrases=studyExpressions(d,parts);
 const topics=chart?[]:[...new Set([specificTopics[d.id],primaryTopics[d.topic],...(d.tags||[]).map(t=>moreTopics[t])].filter(Boolean))].slice(0,3);
 const links=topics.length?`<div class="article-phrases"><small>相关话题词组</small>${topics.map(t=>a(e(t)+' '+icon('right',12),handbookUrl('topics',t),'topic-jump')).join('')}</div>`:'';
 const first=4, rest=phrases.slice(first);
 const more=rest.length?`<details class="expression-more" ${state.phraseMore?'open':''}><summary><span class="more-closed">展开其余 ${rest.length} 组</span><span class="more-open">收起后 ${rest.length} 组</span>${icon('down',14)}</summary>${rest.map((p,i)=>phraseCard(p,i+first)).join('')}</details>`:'';
 return `<section id="article-vocabulary" tabindex="-1" class="panel vocab"><div class="panel-heading">${icon('word',18)}<h3>本题表达</h3><span class="expression-count">${phrases.length} 组搭配</span></div><p class="expression-instruction">点开搭配，查看范文原句。</p>${phrases.slice(0,first).map(phraseCard).join('')}${more}${links}</section>`;
}
function chartTips(d){
 const group=d.type==='地图'?'地图与方位':d.type==='流程图'?'流程与顺序':d.type==='饼图'?'占比与百分点':d.type==='混合图'?'预测与混合图':d.mode==='静态图'?'比较与排名':'年份与数据点';
 const pos=d.type==='地图'?'形容词':d.type==='流程图'?'副词':'动词';
 return `<section class="panel"><div class="panel-heading">${icon('word',18)}<h3>通用句式与替换</h3></div>${a(e(group),handbookUrl('patterns',group),'btn soft wide')}${a('查看'+pos+'替换 '+icon('right',13),handbookUrl('synonyms',pos),'text-link subsection-link')}</section>`;
}
function paperSide(d,parts){return `<aside class="article-side"><div class="desktop-inspect">${slotInspector(d,parts)}</div>${vocabulary(d,parts)}${isChart(d)?evidence(d):bodyLogic(d)}${isChart(d)?chartTips(d):''}</aside>`;}
export function remaining(d){const t=saved.timers[d.id],length=(isChart(d)?20:40)*60;return t?.end?Math.max(0,Math.ceil((t.end-Date.now())/1000)):(t?.left??length);}
const timeText=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
export function tick(){const n=document.querySelector('#timeLeft'),d=current();if(!n||!d)return;const left=remaining(d);n.textContent=timeText(left);if(!left&&saved.timers[d.id]?.end){saved.timers[d.id]={left:0};persist();const b=document.querySelector('[data-act="timer"]');if(b)b.textContent='重新计时';notify('练习时间到了，你的草稿已保留。');}}
function timed(d,parts){
 const text=saved.drafts[d.id]||'',wc=wordCount(text),min=isChart(d)?150:250;
 return `<div class="study-grid writing-grid"><section class="article-sheet"><div class="sheet-head"><div><span class="section-kicker"><span></span> WRITING DESK</span><h2>我的草稿</h2></div><div class="timer"><b id="timeLeft">${timeText(remaining(d))}</b>${btn(saved.timers[d.id]?.end?'暂停':remaining(d)?'开始计时':'重新计时','timer','btn small subtle')}</div></div><label class="sr" for="draft">我的英文作文</label><textarea class="draft english" id="draft" lang="en" placeholder="Write your answer here…">${e(text)}</textarea><div class="draft-footer"><span><b id="wordCounter">${wc}</b> / ${min} 词 · 自动保存在本机</span>${btn(state.showReview?'收起对照':'写完，查看对照','review','btn forest')}</div>${state.showReview?`<div class="compare"><h3>范文对照</h3>${parts.map(p=>`<b>${e(p.label)}</b><p class="english" lang="en">${p.sentences.map(s=>e(sentenceText(s))).join(' ')}</p>`).join('')}</div>`:''}</section>${rubric(d,text)}</div>`;
}
function rubric(d,text){
 const chart=isChart(d);
 const qs=chart?[['任务完成','概述写出了最重要的特征吗？',d.evidence[0].detail],['连贯与衔接','细节段按什么线索分组？',d.paragraphs[2].sentences[0].zh],['词汇','动词和幅度符合图上变化吗？',d.phrases[0].en+' · '+d.phrases[0].zh],['语法','时态、单位、比较对象是否一致？','回图核实比较双方的时间、单位和范围。']]:[['任务回应',d.ask[0],d.ask[1]],['连贯与衔接','观点到结果，中间哪一步需要补充？',bilingual(d.a[2]).zh],['词汇','表达能否具体到人、行为或条件？',d.v[0][0]+' · '+d.v[0][1]],['语法','条件句与主语的单复数搭配正确吗？','检查主谓、动词原形、从句结构与标点。']];
 const weak=(text.match(/[^.!?\n]*(?:more convenient|very good|many benefits|a lot of benefits|good for people|improve people's lives)[^.!?\n]*[.!?]?/i)||[])[0];
 return `<aside class="panel rubric"><div class="panel-heading">${icon('check',19)}<h3>四项写作自查</h3></div>${qs.map(([k,q,n],i)=>`<label class="rubric-item"><input type="checkbox" data-check="${i}" ${saved.checks[d.id]?.[i]?'checked':''}><span><b>${k}</b>${e(q)}<small>${e(n)}</small></span></label>`).join('')}
 ${state.showReview?`<div class="draft-feedback"><b>这一稿可以检查</b><p>${wordCount(text)<(chart?150:250)?'当前字数为 '+wordCount(text)+'。可以先补全缺少的细节，再核对字数。':'字数已达到本题要求。再核对下列位置。'}</p>${weak?`<blockquote class="english">${e(weak.trim())}</blockquote><p>这句的结果比较宽泛。写明谁的哪一步发生了变化。</p>`:''}<p>${e(chart?d.evidence[0].detail:d.transfer)}</p></div>`:''}
 </aside>`;
}
export function article(d){
 if(!d)return '';
 const parts=partsFor(d),chart=isChart(d);
 return `<div class="shell secondary-page detail-page"><div class="crumb">${a('分类题库','#/bank/'+(chart?1:2))} ${icon('right',13)} ${chart?'小作文':'大作文'}</div><div class="article-title"><div><div class="section-kicker"><span></span> TASK ${chart?1:2} <i></i> ${e(d.type)} · ${e(d.topic)}</div><h1>${e(d.title)}</h1></div>${bookButton(d,true)}</div><div class="detail-position"><b>${chart?'写作重点':'范文立场'}</b>${positionLine(d)}</div>${question(d)}${readToolbar(d)}${state.tab==='write'?timed(d,parts):`<div class="study-grid">${studyBody(d,parts)}${paperSide(d,parts)}</div>`}</div>`;
}
export function articleInput(el){
 const d=current();if(!d)return false;
 if(el.id==='draft'){saved.drafts[d.id]=el.value;persist();const c=document.querySelector('#wordCounter');if(c)c.textContent=wordCount(el.value);return true;}
 if(el.id==='slotAnswer'||el.id==='slotAnswerMobile'){
  setOf('blanks',d.id)[state.selected]=el.value;persist();
  document.querySelectorAll('.gap.selected').forEach(b=>{b.textContent=el.value.trim()||'〔'+(slot(d,partsFor(d))?.label||'填空')+'〕';b.classList.toggle('answered',!!el.value.trim());});
  const ct=document.querySelector('.count-mark');if(ct){const parts=partsFor(d);ct.textContent=answeredCount(d,parts)+' / '+allSlots(parts).length+' 项已填';}return true;
 }
 return false;
}
export function articleAction(act,el,render){
 const d=current();if(!d)return false;
 switch(act){
 case 'articleTab':state.tab=el.dataset.value;state.selected=state.tab==='fill'?(state.selected||allSlots(partsFor(d))[0]?.key||''):'';state.openHint=false;break;
 case 'edition':{
  const previous=slot(d,partsFor(d));
  saved.edition=el.dataset.value;
  const parts=partsFor(d);
  if(previous && !slot(d,parts)){
   state.selected=state.tab==='fill'?(allSlots(parts).find(p=>p.pi===previous.pi)?.key||''):'';
   state.openHint=false;
  }
  persist();break;
 }
 case 'toVocabulary':{
  const panel=document.getElementById('article-vocabulary');
  if(panel){panel.focus({preventScroll:true});panel.scrollIntoView({block:'start'});}
  return true;
 }
 case 'translate':state.translated[el.dataset.idx]=!state.translated[el.dataset.idx];break;
 case 'selectSlot':state.selected=el.dataset.slot;state.openHint=false;if(state.selected.startsWith('r'))state.logicBody=2;else if(state.selected.startsWith('b'))state.logicBody=1;else if(state.selected.startsWith('a'))state.logicBody=0;
  if(isChart(d)){
    const [pIndex,sIndex]=state.selected.slice(1).split('_').map(Number);
    if(pIndex===1){const alt={c02:[1,0],c05:[0,0],c12:[0,0],c16:[1,0],c20:[0,null],c22:[1,0]};state.highlight=(alt[d.id]||[0,1])[sIndex]??null;}
    else if(pIndex>=2){state.highlight=bestEvidence(d,pIndex,sIndex);}
    else state.highlight=null;
  }
  break;
 case 'bodyLogic':state.logicBody=Number(el.dataset.idx);break;
 case 'showSlotHint':state.openHint=!state.openHint;break;
 case 'evidence':state.highlight=Number(el.dataset.idx);openModal('图面证据',chartFigure(d,d.evidence[state.highlight],true)+'<p class="evidence-detail">'+e(d.evidence[state.highlight].detail)+'</p>','figure-dialog');render();return true;
 case 'expandChart':openModal('原图 · '+d.title,chartFigure(d,d.evidence[state.highlight],true),'figure-dialog');return true;
 case 'timer':{const left=remaining(d);saved.timers[d.id]=saved.timers[d.id]?.end?{left}:{end:Date.now()+1000*(left||(isChart(d)?20:40)*60)};persist();break;}
 case 'review':state.showReview=!state.showReview;break;
 case 'templateGuide':{
  const parts=partsFor(d);
  let text=`<p>当前为<b>${saved.edition==='simple'?'简易版':'完整版'}</b>。蓝色文字可复用，橙色处按题意填入。${isChart(d)?'图表按引言、概述和两组细节展开。小作文的简易版是对应图表句式的简写。':'同一版本的蓝色句子在每道大作文中完全相同。两版共用论点与例子，完整版另有反驳依据等填空。'}</p>`;
  if(d.structureNote)text+='<p>'+e(d.structureNote)+'</p>';
  text+=parts.map(p=>`<div class="guide-section"><h3>${e(p.sourceLabel||p.label)}</h3><p lang="en" class="english">${p.sentences.map(s=>s.pieces.map(w=>w.key?'<span class="fill-key">'+e(w.placeholder||'〔'+w.label+'〕')+'</span>':e(w.text)).join('')).join(' ')}</p></div>`).join('');
  openModal('本题模板骨架',text,'guide-dialog');return true;}
 default:return false;
 }
 render();
 if(act==='selectSlot'){
   const sel=window.matchMedia('(max-width:840px)').matches?document.querySelector('.mobile-inspect .inspector'):document.querySelector('.desktop-inspect .inspector');
   if(sel){const r=sel.getBoundingClientRect();if(r.top<62||r.bottom>innerHeight)sel.scrollIntoView({behavior:'smooth',block:'nearest'});}
 }
 return true;
}

