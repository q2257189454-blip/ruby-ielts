import {icon,esc,url,partStamp,safeGet,safeSet,announce} from './ui.js';
import {studyPage,afterStudy,studyAction} from './study.js?v=675ca0c02c';
const main=document.querySelector('#main');
const countEl=document.querySelector('#mark-count');
const gridFilters={index:{part:'all',scope:'all',type:'all',q:'',page:0},bookmarks:{part:'all',scope:'all',type:'all',q:'',page:0}};
const scrollPositions={index:0,bookmarks:0};
const slides=[
  {id:'d702d3204720',kind:'判断与填空',ref:'第 4 段',quote:'More graphite helped make a pencil mark that was <mark>softer, thicker and darker</mark>.',group:'g-tf'},
  {id:'248b3d39aaa3',kind:'Heading · 段落标题',ref:'A 段',quote:'<mark>These features</mark> enable birds to come and go with the seasons.',group:'g-heading'},
  {id:'19404737786c',kind:'Contain · 信息匹配',ref:'D 段',quote:'People will risk a lot <mark>to prevent a loss</mark>, she notes …',group:'g-contain'}
];
const PAGE_SIZE=12;
const stored=safeGet('ruby.ielts.recall.bookmarks.v1',[]);
let marks=new Set(Array.isArray(stored)?stored:[]);
let catalog=[],byId=new Map(),pageNow='',returnPage='index',slide=1,activeFilter=null,currentRead=null,fetchToken=0;
const cache=new Map();
const releaseQuery = new URL(import.meta.url).search;
async function loadJson(url) {
  for (const retry of [false, true]) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), retry ? 30000 : 12000);
    let retryable = true;
    try {
      const response = await fetch(url, {signal: controller.signal, cache: retry ? 'reload' : 'default'});
      if (response.ok) return await response.json();
      retryable = response.status === 408 || response.status >= 500;
      throw new Error('HTTP ' + response.status);
    } catch (error) {
      if (retry || !retryable) throw error;
    } finally {
      clearTimeout(timer);
    }
    await new Promise(resolve => setTimeout(resolve, 400));
  }
}
function getJson(path) {
  if (!cache.has(path)) {
    const pending = loadJson('./data/' + path + releaseQuery).catch(error => {
      cache.delete(path);
      throw error;
    });
    cache.set(path, pending);
  }
  return cache.get(path);
}
function selected(a,b){return a===b?' selected':''}
function navStyle(page){document.querySelector('#nav-index').classList.toggle('active',page==='index');document.querySelector('#nav-marks').classList.toggle('active',page==='bookmarks');for(const [id,name] of [['nav-index','index'],['nav-marks','bookmarks']]){const link=document.getElementById(id);if(page===name)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')}}
function star(a){const on=marks.has(a.id);return `<button class="star" data-book="${esc(a.id)}" aria-pressed="${on}" aria-label="${on?'移除':'添加'}《${esc(a.en)}》书签" title="${on?'已加书签':'加入书签'}">${icon('bookmark')}</button>`}
function featureCard(){
  const info=slides[slide],article=byId.get(info.id);
  const tabs=slides.map((item,i)=>`<button data-slide="${i}" aria-pressed="${slide===i}" aria-label="${byId.get(item.id).part} ${esc(byId.get(item.id).zh)}">P${i+1}</button>`).join('');
  return `<div class="file-tabs" role="group" aria-label="切换速记卡">${tabs}</div><div class="file-card"><div class="file-top"><span>${icon('cards')}　速记卡</span><span>${esc(info.kind)}</span></div><h2 class="file-title" lang="en">${esc(article.en)}</h2><p class="file-sub">${esc(article.zh)}</p><blockquote class="file-quote" lang="en">${info.quote}</blockquote><div class="card-foot"><span class="file-note">${esc(info.ref)} · 原文摘句</span><a class="text-link" href="${esc(url(article.id,'questions',{at:info.group}))}">打开这篇速记 ${icon('book')}</a></div></div>`;
}
function hero(){
  const stats=['P1','P2','P3'].map(part=>`<div><dd>${catalog.filter(a=>a.part===part).length}</dd><dt>${part} 篇目</dt></div>`).join('');
  return `<section class="hero"><div class="hero-left"><div class="hero-kicker" lang="en">IELTS ACADEMIC READING</div><h1>雅思阅读<span>速记本</span></h1><p class="hero-date">中英逐句对照 · 题型速记 · 语言考点</p><dl class="stats">${stats}</dl></div><div class="feature" id="feature">${featureCard()}</div></section>`;
}
function listChrome(bookmarks){
  const f=activeFilter;
  const categories=[['all','全部题型'],['heading','Heading'],['contain','Contain'],['mc','选择题'],['tf','判断题'],['fill','填空题'],['match','匹配题'],['short','简答题'],['reading','纯阅读']];
  const buttons=[['all','全部'],['P1','P1'],['P2','P2'],['P3','P3']].map(([id,label])=>`<button class="${f.part===id?'active':''}" data-part="${id}" aria-pressed="${f.part===id}">${label}</button>`).join('');
  const subtitle=bookmarks?'书签保存在当前浏览器。':`<a class="new-passage" href="${esc(url('daa80192fcd1'))}">新收录 · 墨尔本摄影师 · 网上回忆版本（仅参考）</a>`;
  return `<section class="index-section" aria-labelledby="index-title"><div class="section-line"><div><h2 id="index-title">${bookmarks?'已加书签的篇目':'篇目索引'}</h2><p class="section-info">${subtitle}</p></div><label class="search">${icon('search')}<input aria-label="搜索英文篇名或中文名" id="search" type="search" placeholder="搜索英文篇名或中文名" value="${esc(f.q)}"></label></div><div class="controls"><div class="part-switch" role="group" aria-label="按篇章分类">${buttons}</div><div class="selects"><label class="select-wrap"><select id="scope" aria-label="篇目范围"><option value="all"${selected(f.scope,'all')}>全部篇目</option><option value="highlight"${selected(f.scope,'highlight')}>只看高亮</option></select>${icon('chevron')}</label><label class="select-wrap"><select id="type" aria-label="筛选题型">${categories.map(([v,t])=>`<option value="${v}"${selected(f.type,v)}>${t}</option>`).join('')}</select>${icon('chevron')}</label></div></div><div id="result-list"></div></section>`;
}
function catalogRow(a){
  const names={heading:'Heading',contain:'Contain',tf:'判断',mc:'选择',fill:'填空',match:'匹配',ending:'句尾匹配',short:'简答'};
  const readingLabel = a.sourceKind === 'background' ? '背景资料' : '纯阅读';
  const types=(a.displayTypes||a.types||[]).map(k=>names[k]||k).join(' · ')||readingLabel;
  const meta=a.paragraphCount?`${a.paragraphCount} 段`:'';
  const studyGroups = a.studyGroupCount ? `${a.studyGroupCount} 组速记` : '';
  const mobileMeta = studyGroups ? [types, meta, studyGroups].join(' · ') : types;
  const sizeDetail = studyGroups ? `<small class="row-study-groups">${esc(studyGroups)}</small>` : '';
  const sourceLabel = a.sourceLabel ? ' · ' + esc(a.sourceLabel) : '';
  return `<div class="catalog-row table-cols ${a.highlight?'listed':''}" role="listitem"><a class="row-link" href="${esc(url(a.id))}">${partStamp(a.part)}<span class="row-copy"><span class="row-en" lang="en"><span class="title-text">${esc(a.en)}</span></span><span class="row-zh">${esc(a.zh)}${sourceLabel}${a.variants?' · '+a.variants.length+' 个版本':''}</span><span class="row-mobile-meta">${esc(mobileMeta)}</span></span></a><div class="desktop-cell row-types">${esc(types)}</div><div class="desktop-cell row-size">${esc(meta)}${sizeDetail}</div>${star(a)}</div>`;
}
function lower(s){return String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[\s’‘'"?.:·()\-_–—]/g,'')}
function matched(){
  const f=activeFilter,term=lower(f.q.trim());
  return catalog.filter(a=>(pageNow!=='bookmarks'||marks.has(a.id))&&(f.part==='all'||f.part===a.part)&&(f.scope!=='highlight'||a.highlight)&&(f.type==='all'||a.types?.includes(f.type))&&(!term||lower(a.en+' '+a.zh+' '+(a.aliases||[]).join(' ')).includes(term))).sort((a,b)=>a.part.localeCompare(b.part)||a.en.localeCompare(b.en,'en'));
}
function drawList(speak=false){
  const f=activeFilter;if(!f)return;
  const items=matched(),total=items.length,bookmarks=pageNow==='bookmarks';
  f.page=Math.max(0,Math.min(f.page,Math.ceil(total/PAGE_SIZE)-1));
  const from=f.page*PAGE_SIZE,to=Math.min(total,from+PAGE_SIZE);
  const table=total?`<div class="index-table"><div class="list-head table-cols" aria-hidden="true"><span>篇章 / 文章</span><span>题型</span><span>篇幅</span><span></span></div><div role="list" aria-label="篇目列表">${items.slice(from,to).map(catalogRow).join('')}</div></div>`:`<div class="empty"><h3>${bookmarks&&!marks.size?'书签本还是空的':'没有符合条件的篇目'}</h3><p>${bookmarks&&!marks.size?'点篇目右侧的书签图标，即可在这里继续复习。':'可以调整搜索词、篇章或材料范围。'}</p>${bookmarks&&!marks.size?`<a href="#/index" class="btn">浏览篇目索引</a>`:`<button class="btn" data-reset>重置筛选</button>`}</div>`;
  const pager=total?`<div class="pager"><span>显示 ${from+1}–${to} / 共 ${total} 篇</span><div><button data-page="-1" class="btn" ${f.page===0?'disabled':''}>上一页</button><span>${f.page+1} / ${Math.ceil(total/PAGE_SIZE)}</span><button data-page="1" class="btn" ${to>=total?'disabled':''}>下一页</button></div></div>`:'';
  document.querySelector('#result-list').innerHTML=table+pager;
  if(speak)announce(`找到 ${total} 个篇目`);
}
function listPage(name,restore){
  pageNow=name;returnPage=name;activeFilter=gridFilters[name];currentRead=null;
  const bookmarks=name==='bookmarks';navStyle(name);
  document.title=(bookmarks?'我的书签':'篇目索引')+' · Ruby 雅思阅读速记';
  main.innerHTML=`<div class="shell home">${bookmarks?`<section class="book-hero"><h1>我的书签</h1><p>已收藏 ${marks.size} 个篇目</p></section>`:hero()}${listChrome(bookmarks)}</div>`;
  drawList();
  requestAnimationFrame(()=>window.scrollTo({top:restore?scrollPositions[name]:0,behavior:'instant'}));
}
function parse(){
  const [path,qs='']=location.hash.replace(/^#\/?/,'').split('?');
  const parts=path.split('/');
  if(parts[0]!=='read')return {page:parts[0]==='bookmarks'?'bookmarks':'index'};
  return {page:'read',id:parts[1],tab:['article','questions','language'].includes(parts[2])?parts[2]:'article',params:new URLSearchParams(qs)}
}
function noContent(msg){
  main.innerHTML=`<div class="shell home"><div class="empty"><h3>${esc(msg)}</h3><p>可重新打开这一页，或返回完整索引。</p><button class="btn" data-retry>重新载入</button> <a href="#/index" class="btn">返回篇目索引</a></div></div>`
}
async function route(){
  const token=++fetchToken;
  if(pageNow==='index'||pageNow==='bookmarks')scrollPositions[pageNow]=window.scrollY;
  const prev=pageNow,r=parse();
  if(!catalog.length){
    try{catalog=await getJson('catalog.json');byId=new Map(catalog.map(a=>[a.id,a]));}
    catch{if(token===fetchToken)noContent('篇目索引暂时未能载入');return}
  }
  if(token!==fetchToken)return;
  countEl.textContent=String(marks.size);
  if(r.page!=='read')return listPage(r.page,prev==='read');
  const a=byId.get(r.id);
  if(!a){pageNow='read';currentRead=null;navStyle('');noContent('未找到这个篇目');return}
  pageNow='read';activeFilter=null;navStyle(returnPage);document.title=a.zh+' · Ruby 雅思阅读速记';
  if(!currentRead||currentRead.id!==a.id){main.innerHTML='<div class="shell loading">正在打开阅读材料…</div>';window.scrollTo({top:0,behavior:'instant'})}
  const background = a.variants?.find(([, , info]) => info?.sourceKind === 'background');
  const previousAddress = r.params.get('at') || '';
  if (background && r.tab === 'article' && !r.params.has('v') && /^(?:\d+\.\d+|p-\d+)$/.test(previousAddress)) {
    // Background editions used numbered paragraphs. The new exam editions use letters.
    r.params.set('v', background[0]);
    history.replaceState(history.state, '', url(a.id, r.tab, Object.fromEntries(r.params)));
  }
  const variantId=a.variants?.some(x=>x[0]===r.params.get('v'))?r.params.get('v'):a.id;
  let note;
  try{note=await getJson('notes/'+variantId+'.json')}catch{if(token===fetchToken)noContent('这篇速记暂时未能载入');return}
  if(token!==fetchToken)return;
  currentRead={id:a.id};
  if (r.tab === 'article' && note.previousRefs && Object.hasOwn(note.previousRefs, previousAddress)) {
    const oldRef = previousAddress;
    const [paragraph, sentence] = oldRef.split('.');
    const stillExists = note.paragraphs.find(p => p.id === paragraph)?.sentences[Number(sentence) - 1];
    if (!stillExists) {
      r.params.set('at', note.previousRefs[oldRef]);
      r.params.set('rev', '2');
      history.replaceState(history.state, '', url(a.id, r.tab, Object.fromEntries(r.params)));
    } else if (!r.params.has('rev')) {
      const returnTo = r.params.get('back') || '';
      const question = returnTo.startsWith('q-')
        ? note.groups.flatMap(group => group.items).find(item => String(item.no) === returnTo.slice(2))
        : null;
      const addresses = question
        ? [question.ref, ...(question.refs || []), ...(question.correct || []).map(option => option[3])]
        : [];
      if (!addresses.includes(oldRef)) r.params.set('at', note.previousRefs[oldRef]);
    }
  }
  main.innerHTML=studyPage(a,note,r.tab,r.params,marks.has(a.id));
  const back=main.querySelector('[data-back-index]');if(back&&returnPage==='bookmarks'){back.href='#/bookmarks';back.innerHTML=icon('bookmark')+' 返回我的书签'}
  if(!r.params.get('at'))window.scrollTo({top:0,behavior:'instant'});
  afterStudy(r.params,r.tab);
}
function toggleBook(id){
  if(!byId.has(id))return;
  if(marks.has(id))marks.delete(id);else marks.add(id);
  const saved=safeSet('ruby.ielts.recall.bookmarks.v1',[...marks]);
  countEl.textContent=String(marks.size);
  const on=marks.has(id);announce((on?'已加入书签':'已移除书签')+(saved?'':'，仅本次有效'));
  const btn=document.querySelector(`[data-book="${id}"]`);
  if(btn){btn.setAttribute('aria-pressed',String(on));btn.setAttribute('aria-label',(on?'移除':'添加')+'《'+byId.get(id).en+'》书签');btn.title=on?'已加书签':'加入书签';if(btn.classList.contains('article-mark'))btn.innerHTML=icon('bookmark')+(on?'已加书签':'加入书签')}
  if(pageNow==='bookmarks'){const h=document.querySelector('.book-hero p');if(h)h.textContent=`已收藏 ${marks.size} 个篇目`;drawList()}
}
document.addEventListener('click',e=>{
  const el=e.target instanceof Element?e.target:null;if(!el)return;
  if(el.closest('#skip')){e.preventDefault();main.focus();return}
  const book=el.closest('[data-book]');if(book){toggleBook(book.dataset.book);return}
  if(el.closest('[data-retry]')){route();return}
  if(pageNow==='read'){studyAction(el);return}
  const btn=el.closest('button');if(!btn)return;
  if(btn.hasAttribute('data-slide')){
    slide=Number(btn.dataset.slide);const host=document.getElementById('feature');host.innerHTML=featureCard();host.querySelector(`[data-slide="${slide}"]`).focus({preventScroll:true});return
  }
  if(!activeFilter)return;
  if(btn.dataset.part){activeFilter.part=btn.dataset.part;activeFilter.page=0;for(const b of document.querySelectorAll('[data-part]')){const on=b.dataset.part===activeFilter.part;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))}drawList(true)}
  if(btn.hasAttribute('data-page')){
    activeFilter.page+=Number(btn.dataset.page);drawList();document.querySelector('.controls').scrollIntoView({behavior:'instant',block:'start'});announce('第 '+(activeFilter.page+1)+' 页');
  }
  if(btn.hasAttribute('data-reset')){Object.assign(activeFilter,{part:'all',type:'all',scope:'all',page:0,q:''});document.querySelector('.index-section').outerHTML=listChrome(pageNow==='bookmarks');drawList(true);document.querySelector('#search').focus()}
});
document.addEventListener('input',e=>{if(e.target.id==='search'&&activeFilter){activeFilter.q=e.target.value;activeFilter.page=0;drawList(true)}});
document.addEventListener('change',e=>{if(activeFilter&&['scope','type'].includes(e.target.id)){activeFilter[e.target.id]=e.target.value;activeFilter.page=0;drawList(true)}});
window.addEventListener('storage',e=>{if(e.key!=='ruby.ielts.recall.bookmarks.v1')return;const value=safeGet(e.key,null);if(Array.isArray(value)){marks=new Set(value);route()}});
window.addEventListener('hashchange',route);
document.querySelector('#nav-marks .icon-place').innerHTML=icon('bookmark');
route();


