import {db,state,saved,get,e,icon,btn,a,row,questionTitle,emptyView,openModal} from './ui.js';
import {essayTypes,chartTypes,bodyNames,validBody} from './model.js';
const typePath=t=>t===1?db.charts:db.essays;
const valOf=e=>e?.value||'';
export function hero(){return `<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><span class="hero-kicker"><i></i>IELTS ACADEMIC WRITING</span><h1 id="hero-title">雅思写作练习室</h1><p>对照两版范文，练习把每个观点写具体。</p><div class="hero-actions">${a(icon('pen',18)+'练大作文','#/bank/2','btn warm')}${a(icon('bars',18)+'练小作文','#/bank/1','btn ghost-light')}</div></div></section>`;}
export const lessonTabs=()=>`<div class="task-tabs" aria-label="选择写作任务">${[2,1].map(n=>btn((n===2?'大作文':'小作文')+`<span lang="en">Task ${n}</span>`,'bankTab','task-tab'+(state.bank===n?' active':''),`data-n="${n}" aria-pressed="${state.bank===n}"`)).join('')}</div>`;
function collectionFilter(){
 const isNovember=state.collection==='november';
 const count=db.essays.filter(d=>d.november).length;
 const link=(url,label,active)=>`<a class="collection-link${active?' selected':''}" href="${url}"${active?' aria-current="page"':''}>${label}</a>`;
 return `<div class="batch-filter" aria-label="按题单浏览"><span>题单</span>${link('#/bank/2','全部题目',!isNovember)}${link('#/bank/2/november','<span class="november-title">11 月题单</span> <small>'+count+'</small>',isNovember)}</div>`;
}
function printRows(){
 const q=state.search.trim().toLowerCase();
 const items=typePath(state.bank).filter(d=>(!state.collection||d.november)&&(!state.type||d.type===state.type)&&(!state.topic||[d.topic,...(d.tags||[]),d.mode].includes(state.topic))&&(!q||[d.title,d.prompt,d.november?.prompt,d.topic,d.type,...(d.tags||[]),...(d.keywords||[]),d.q,d.promptZh,d.stance,d.stanceSummary].filter(Boolean).join(' ').toLowerCase().includes(q)));
 if(state.collection==='november')items.sort((a,b)=>a.november.number-b.november.number);
 const pages=Math.max(1,Math.ceil(items.length/state.per));state.page=Math.min(state.page,pages);
 const start=(state.page-1)*state.per;
 return `<div class="list-caption"><span>${state.collection==='november'?'11 月题单 · ':''}${state.type||'全部题型'}<span class="caption-count">${items.length} 道</span></span>${(q||state.type||state.topic)?btn('清除筛选','resetFilter','link-btn'):''}</div>${items.length?'<div class="question-list">'+items.slice(start,start+state.per).map(row).join('')+'</div>':emptyView('没有找到这道题','试试题目里的其他关键词，或清除筛选。')}${pages>1?`<div class="pagination"><span>第 ${start+1}–${Math.min(items.length,start+state.per)} 道</span><div>${btn(icon('left',17),'page','pager',`data-page="${state.page-1}" aria-label="上一页" ${state.page<=1?'disabled':''}`)}<span>${state.page} / ${pages}</span>${btn(icon('right',17),'page','pager',`data-page="${state.page+1}" aria-label="下一页" ${state.page>=pages?'disabled':''}`)}</div></div>`:''}`;
}
export function updateResults(){const box=document.querySelector('#bankResults');if(box)box.innerHTML=printRows();}
function aside(){
 const selected=get('e074')||db.essays[0];const last=get(saved.recent[0]);return `<aside class="home-side">
 <section class="logic-promo"><div class="promo-kicker">${icon('chain',18)} 专项练习</div><h3>补一条逻辑链</h3><p>从「交通更便利」往下想一步。</p><div class="mini-chain"><div><i></i><span>增加公共交通投入</span></div><div class="mini-gap"><i></i><span>中间发生了什么？</span></div><div><i></i><span>早班护士能够准时到岗</span></div></div>${a(icon('pen',16)+'开始拆解','#/logic/'+(selected?.id||''),'btn forest wide')}</section>
 ${state.bank===2?`<a class="reference-promo" href="#/corpus"><span class="mini-square">${icon('stack',19)}</span><div><h3>大作文语料库</h3><p>查填空写法、话题观点<br>和范文高频搭配</p></div></a>`:''}
 <a class="reference-promo handbook-promo" href="${state.bank===1?'#/language/小作文/句式':'#/language/大作文'}"><span class="mini-square">${icon('word',19)}</span><div><h3>写作表达手册</h3><p>大作文话题词组<br>小作文句式与同义替换</p></div><span class="card-go">${icon('right',18)}</span></a>
 ${last?`<section class="resume"><span class="mini-label">${icon('clock',15)} 上次练到</span>${a(questionTitle(last), '#/task/'+last.id,'resume-title')}</section>`:''}
 </aside>`;
}
export function catalog(showHero=true){
 const d=typePath(state.bank),chart=state.bank===1;const topics=chart?['动态图','静态图','空间变化','过程顺序',...new Set(d.map(x=>x.topic))]:['教育','犯罪','科技','社交媒体','健康','社会','政府','工作','环境','交通','科技与媒体','文化艺术与旅游',...new Set(d.flatMap(x=>[x.topic,...(x.tags||[])]))];
 return `<div class="shell">${showHero?hero():''}<section class="catalog" id="bank"><div class="catalog-heading"><div><div class="section-kicker"><span></span> QUESTION BANK</div><h2>分类题库</h2></div><div class="collection-count"><b>${db.essays.length}</b> 篇大作文 <i></i> <b>${db.charts.length}</b> 道小作文</div></div>
 <div class="catalog-grid"><div class="catalog-main"><div class="catalog-controls"><div class="catalog-top">${lessonTabs()}<label class="search-box">${icon('search',17)}<input id="bankSearch" type="search" aria-label="搜索题目、立场或关键词" placeholder="搜题目、立场或关键词" value="${e(state.search)}"></label></div>
 <div class="filter-line"><div class="chips" aria-label="题型筛选">${['',...(chart?chartTypes:essayTypes)].map(t=>btn(t||'全部','type','chip '+(state.type===t?'active':''),`data-value="${e(t)}" aria-pressed="${state.type===t}"`)).join('')}</div><label class="select-wrap">${icon('grid',14)}<select id="topicSelect" aria-label="按话题或图表特征筛选"><option value="">${chart?'图表特征':'全部话题'}</option>${[...new Set(topics)].map(t=>`<option ${state.topic===t?'selected':''} value="${e(t)}">${e(t)}</option>`).join('')}</select>${icon('down',13)}</label></div>${chart?'':collectionFilter()}</div>
 <div id="bankResults">${printRows()}</div></div>${aside()}</div></section></div>`;
}
export function setBank(n,collection=''){state.bank=n;state.collection=n===2&&collection==='november'?'november':'';state.search='';state.topic='';state.type='';state.page=1;}
export function mine(){
 const mode=state.mine;
 const ids=mode==='收藏题目'?Object.keys(saved.stars).reverse():mode==='写作草稿'?Object.keys(saved.drafts).filter(k=>saved.drafts[k]?.trim()).reverse():mode==='逻辑收藏'?Object.keys(saved.logicStars).reverse():saved.recent;
 return `<div class="shell secondary-page"><div class="section-kicker"><span></span> MY NOTEBOOK</div><h1>我的练习</h1><p class="lede">在这个浏览器里继续上次写到的地方。</p><div class="text-tabs">${['收藏题目','写作草稿','逻辑收藏','最近浏览'].map(n=>btn(n,'mineTab',mode===n?'active':'',`data-value="${n}" aria-pressed="${n===mode}"`)).join('')}</div><div class="mine-list">${ids.length?ids.map(id=>{
 const [base,body]=id.split('@');const d=get(base);if(!d)return '';if(mode==='逻辑收藏')return a(icon('chain')+`<span><strong>${questionTitle(d)}</strong><small>${e(bodyNames(d)[validBody(d,body)])} · 逻辑链</small></span>`,'#/logic/'+id,'mine-link');
 if(mode==='写作草稿')return a(icon('pen')+`<span><strong>${questionTitle(d)}</strong><small>${e(saved.drafts[id].slice(0,85))}</small></span>`,'#/task/'+id+'/write','mine-link');
 return row(d);}).join(''):emptyView('这里还没有'+mode,'喜欢的题目可以点书签；写作草稿会随输入自动保存。',a('去题库选题','#/','btn forest'))}</div></div>`;
}
export function info(){
 openModal('练习室使用说明',`<div class="guide-section"><h3>读双色范文</h3><p><span class="fixed-key">深蓝表示固定句式</span>，<span class="fill-key">橙色下划线表示本题填充</span>。点选橙色部分可查看它在段落中的作用。两版模板共用你的填空记录。</p></div><div class="guide-section"><h3>查表达</h3><p>大作文可以按话题和论证用途找搭配。小作文可以按图表写作场景查句式，或按词性比较近义词。</p></div><div class="guide-section"><h3>核对自己的作文</h3><p>大作文至少写 250 词，检查是否回应了每个问题、立场是否贯穿全文。小作文至少写 150 词，核对概述、比较对象和图中的关键信息。两项任务都可以从衔接、词汇和语法复查。</p></div>`);
}
