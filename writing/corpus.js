import {e,icon,db,saved,route} from './ui.js';
import {caseNotes} from './corpus-examples.js';
import {essayTypes} from './model.js';
import {essayFrames,sourceSlots} from './essay-frames.js';
import {sections,slots,mechanisms,examples,concerns,responses} from './corpus-guide.js';
import {createIndex,fieldsFor,inScope,classifySlot,groupHits,ideaGroups,familyById,buildLexicon,rankedPhrases,norm} from './corpus-index.js';

const views = [
  ['slots','填空写法','pen'],['ideas','话题观点','chain'],
  ['moves','举例与让步','talk'],['phrases','高频搭配','word']
];
const moveTypes = {ex:['举例方式',examples,'b4'],risk:['让步顾虑',concerns,'r0'],reply:['回应办法',responses,'rAction']};
let cache, lexicon;
const bank = () => cache ??= createIndex(db.essays);
const options = (list,chosen) => list.map(([v,label])=>`<option value="${e(v)}"${chosen===v?' selected':''}>${e(label)}</option>`).join('');
const groupsOf = hits => [...new Map(hits.map(h=>[h.r.d.id,h.r])).values()];
function current() {
  const v = route()[1];
  const view = views.some(([id])=>id===v) ? v : 'slots';
  const q = location.hash.includes('?') ? location.hash.split('?').slice(1).join('?') : '';
  const p = new URLSearchParams(q);
  const edition = (p.get('edition') || saved.edition)==='simple'?'simple':'full';
  const topic = bank().sortedTopics.includes(p.get('topic'))?p.get('topic'):'';
  const type = essayTypes.includes(p.get('type'))?p.get('type'):'';
  const key = Object.hasOwn(sourceSlots[edition],p.get('slot'))?p.get('slot'):'t';
  return {p,view,topic,type,key,edition,query:p.get('q')||'',pick:p.get('pick')||'',doc:p.get('doc')||'',
    limit:Math.max(20,Math.min(2000,Number(p.get('n'))||20)),general:p.get('lens')==='common',
    core:p.get('core')==='1',mode:Object.hasOwn(moveTypes,p.get('mode'))?p.get('mode'):'ex'};
}
function path(view,p) {
  const q=p.toString();
  return '#/corpus/'+view+(q?'?'+q:'');
}
function tabUrl(s,v) {
  const p=new URLSearchParams();
  for(const k of ['topic','type','edition']) if(s.p.has(k)) p.set(k,s.p.get(k));
  return path(v,p);
}
function button(key,value,label,on=false,cls='') {
  return `<button type="button" data-act="corpusSet" data-param="${e(key)}" data-value="${e(value)}" aria-pressed="${on}" class="${cls}${on?' chosen':''}">${label}</button>`;
}
function chooser(param,label,rows,value,cls='') {
  return `<label class="cu-select ${cls}"><span>${e(label)}</span><select aria-label="${e(label)}" data-corpus-param="${param}">${options(rows,value)}</select></label>`;
}
function scopeBar(s) {
  const idx=bank();
  const group = primary => idx.sortedTopics.filter(t=>idx.primary.has(t)===primary).map(t=>[t,t+'（'+idx.counts[t]+' 篇）']);
  return `<div class="cu-filters">
    <label class="cu-select"><span>话题</span><select aria-label="话题" data-corpus-param="topic"><option value="">全部话题</option><optgroup label="主话题">${options(group(true),s.topic)}</optgroup><optgroup label="细分标签">${options(group(false),s.topic)}</optgroup></select></label>
    ${chooser('type','题型',[['','全部题型'],...essayTypes.map(t=>[t,t])],s.type)}
    <label class="cu-search">${icon('search',17)}<input type="search" id="corpusSearch" value="${e(s.query)}" aria-label="${s.view==='phrases'?'搜索搭配或中文义':'搜索题干、填法或观点'}" placeholder="${s.view==='phrases'?'搜索搭配或中文义，如 access to':'搜题干或范文中的词，如 homework、家务'}"></label>
  </div>`;
}
export function corpus() {
  const s=current(),idx=bank();
  return `<div class="shell secondary-page cu-page"><header class="cu-header"><div><div class="section-kicker"><span></span> TASK 2 · WRITING CORPUS</div><h1>大作文语料库</h1>
    <p>从题干改写到让步回应，逐空对照范文里的实际写法。</p></div>
    <div class="cu-stats"><div><strong>${idx.records.length}</strong><span>篇范文</span></div><div><strong>${familyById.size}</strong><span>组话题观点</span></div></div></header>
    <nav class="cu-tabs" aria-label="语料库栏目">${views.map(([v,title,im])=>`<a href="${e(tabUrl(s,v))}" ${s.view===v?'aria-current="page"':''}>${icon(im,18)}${title}</a>`).join('')}</nav>
    ${scopeBar(s)}<div id="corpusResults">${results(s)}</div>
    <details class="cu-method"><summary>频次怎样统计？</summary><p>一题算一篇，两版模板共用的填法只计一次。话题筛选包含主话题及细分标签，同一篇可能属于多个话题。改写、举例、顾虑和回应各取该篇的主要写法。话题观点分别标记两个主体段，同一篇的两段都命中时计一篇。</p>
    <p>搭配候选来自每篇的表达积累与通用固定搭配清单。只在英文填充内容中逐项匹配完整词组，明确列出的词形归到同一项。先按覆盖篇数，再按出现次数排序。固定模板在“填空写法”里单独查看。这里的频次只代表本站范文。</p></details></div>`;
}
function metric(g) {return g.docs.size+' 篇';}
function recap(s,rows) {
  const desc=[s.topic,s.type].filter(Boolean).join(' · ')||'全部话题和题型';
  return `<div class="cu-recap"><span>${e(desc)} <i>·</i> <b>${rows.length}</b> 篇范文${s.topic?'（含话题标签）':''}</span>${s.topic||s.type||s.query?'<button type="button" data-act="corpusReset" class="link-btn">清除筛选</button>':''}</div>`;
}
function empty(msg) {return `<div class="cu-empty">${icon('search',24)}<h3>没有找到匹配项</h3><p>${e(msg)}</p><button type="button" class="btn soft small" data-act="corpusReset">清除筛选</button></div>`;}
function framed(s,key,only=false) {
  const marker = s.edition==='full'?'完整版':'简易版';
  const skeleton = (en,active) => en.split(/(\{\w+\})/).map(part=>{
    if (!part.startsWith('{')) return e(part);
    const k=part.slice(1,-1);
    return `<span class="cu-blank${k===active?' focus':''}">${e(sourceSlots[s.edition][k])}</span>`;
  }).join('');
  if (only) return `<details class="cu-frames"><summary>查看${marker}五段固定模板</summary>${essayFrames[s.edition].map((p,i)=>`<div><h4>${sections[i][0]}</h4><p lang="en">${p.map(([en])=>skeleton(en,'')).join(' ')}</p></div>`).join('')}</details>`;
  const line=essayFrames[s.edition].flat().find(([en])=>en.includes('{'+key+'}'));
  return `<div class="cu-frame"><small>${marker}模板句 <i></i> 蓝色为固定措辞，橙色为填空</small><p lang="en">${skeleton(line[0],key)}</p></div>`;
}
function markRange(text,start,end) {
  return e(text.slice(0,start))+'<mark>'+e(text.slice(start,end))+'</mark>'+e(text.slice(end));
}
function original(r,key,edition='full',hit=null) {
  const f=fieldsFor(r,edition)[key];
  if (!f) return '';
  const from=f.start+(hit?.start??0),to=f.start+(hit?.end??f.text.length);
  return `<div class="cu-line"><div class="cu-role">${e(f.label)} · ${e(slots[key][0])}</div><p class="cu-en" lang="en">${markRange(f.sentence,from,to)}</p><p class="cu-zh">${e(f.translation)}</p></div>`;
}
function sourceUrl(r,key,edition='full') {
  return '#/task/'+encodeURIComponent(r.d.id)+'/at/'+encodeURIComponent(key)+'?edition='+edition;
}
function sourceHeader(s,hits) {
  const docs=groupsOf(hits);
  const r=docs.find(r=>r.d.id===s.doc) || docs[0];
  const selected=hits.filter(h=>h.r===r);
  const nav=chooser('doc','选一篇看原文',docs.map(({d})=>[d.id,(d.november?'11 月第 '+d.november.number+' 题 · ':'')+d.title]),r.d.id,'cu-doc');
  return {r,selected,html:`<div class="cu-sources"><div class="cu-source-heading"><strong>范文对照</strong><span>共 ${docs.length} 篇可查</span></div>${nav}<p class="cu-stance"><b>${e(r.d.type)}</b> ${e(r.d.stanceSummary || r.d.stance)}</p></div>`};
}
function jump(r,key,ed) {return `<a class="cu-jump" href="${e(sourceUrl(r,key,ed))}">在范文中定位这一空</a>`;}
const tip = (title,body) => body?`<div class="cu-tip"><b>${e(title)}</b><p>${e(body)}</p></div>`:'';
function caseStudy(r) {
  const labels=['谁在什么情境','具体做了什么','结果或推论'];
  return `<dl class="cu-case">${caseNotes[r.d.id].map((value,i)=>`<div><dt>${labels[i]}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>`;
}
function relatedMove(s,r,mode,label) {
  const p=new URLSearchParams();
  if(s.topic)p.set('topic',s.topic);
  if(s.type)p.set('type',s.type);
  p.set('mode',mode);
  p.set('pick',r.n[mode]);
  p.set('doc',r.d.id);
  return `<a class="cu-entry" href="${e(path('moves',p))}">${label}</a>`;
}
function slotGuide(s,rows) {
  const {key,edition}=s,valid=sourceSlots[edition];
  const [name,grammar,what,check]=slots[key];
  const [groupLabel,dictionary,extract]=classifySlot(key);
  const groups=groupHits(rows.map(r=>({r,key})),h=>extract(h.r));
  const chosen=groups.find(g=>g.id===s.pick);
  const hits=chosen?.hits || rows.map(r=>({r,key}));
  const src=sourceHeader(s,hits);
  const editionButtons=['full','simple'].map((k,i)=>button('edition',k,['完整版','简易版'][i],s.edition===k)).join('');
  const dir=sections.map(([label,keys])=>`<div class="cu-slot-group"><h3>${label}</h3>${keys.filter(k=>Object.hasOwn(valid,k)).map(k=>button('slot',k,e(slots[k][0]),k===key,'cu-slot')).join('')}</div>`).join('');
  const mobileOptions=sections.map(([label,keys])=>`<optgroup label="${label}">${options(keys.filter(k=>Object.hasOwn(valid,k)).map(k=>[k,slots[k][0]]),key)}</optgroup>`).join('');
  const aside=`<aside class="cu-directory"><div class="cu-dir-head"><h2>模板填空</h2><small>${Object.keys(valid).length} 个</small></div><div class="cu-seg">${editionButtons}</div><label class="cu-mobile-select">选择填空位置<select aria-label="选择填空位置" data-corpus-param="slot">${mobileOptions}</select></label><div class="cu-dir-body">${dir}</div></aside>`;
  const chips=[button('pick','','全部写法',!chosen,'cu-chip'),...groups.map(g=>button('pick',g.id,e(dictionary[g.id][0])+` <small>${metric(g)}</small>`,g===chosen,'cu-chip'))].join('');
  const actual=chosen || groups.find(g=>g.id===extract(src.r));
  const typeInfo=dictionary[actual.id];
  const content=`<article class="cu-card"><div class="cu-heading"><div><small>${sections.find(([,ks])=>ks.includes(key))[0]} · 填空写法</small><h2>${e(name)}</h2></div><span class="cu-tag">${e(grammar)}</span></div><p class="cu-intro">${e(what)}</p>
    ${framed(s,key)}<h3 class="cu-minor">按${e(groupLabel)}看范文</h3><div class="cu-chipset">${chips}</div>
    ${src.html}<p class="cu-note"><b>${e(typeInfo[0])}</b> ${e(typeInfo[1])}${typeInfo[2]?' <span lang="en">'+e(typeInfo[2])+'</span>':''}</p>
    ${key==='t'?`<div class="cu-prompt"><small>英文题干</small><p class="cu-en" lang="en">${e(src.r.d.prompt)}</p></div>`:''}
    ${key==='b4'?caseStudy(src.r):''}${original(src.r,key,edition)}${key==='t'?original(src.r,'s',edition)+tip('审题时保留什么',src.r.n.keep):''}
    ${jump(src.r,key,edition)}${tip('写完检查',check)}${framed(s,key,true)}</article>`;
  return `<div class="cu-layout">${aside}${content}</div>`;
}
function rankSide(s,groups,title,name,sub,headButtons='') {
  const chosen=groups.find(g=>g.id===s.pick)||groups[0];
  const ix=groups.indexOf(chosen);
  const visible=groups.slice(0,s.limit);
  if (ix>=s.limit) visible.push(chosen);
  const items=visible.map(g=>button('pick',g.id,`<span><strong>${e(name(g))}</strong><small>${e(sub(g))}</small></span><b>${metric(g)}</b>`,chosen===g,'cu-rank')).join('');
  const menu=chooser('pick',title,groups.map(g=>[g.id,name(g)+' · '+metric(g)]),chosen.id,'cu-mobile-select');
  return {chosen,html:`<aside class="cu-directory"><div class="cu-dir-head"><h2>${e(title)}</h2><small>${groups.length} 项</small></div>${headButtons}${menu}
    <div class="cu-dir-body cu-ranking">${items}${visible.length<groups.length?button('n',String(s.limit+25),'显示更多','', 'cu-more'):''}</div></aside>`};
}
function ideaView(s,rows) {
  const groups=ideaGroups(rows,s.general);
  const name=g=>s.general?mechanisms[g.id][0]:familyById.get(g.id).name;
  const sub=g=>(s.general?'跨话题思路':familyById.get(g.id).topic)+' · '+g.hits.length+' 个主体段';
  const modes=`<div class="cu-seg">${button('lens','topic','话题观点',!s.general)}${button('lens','common','跨话题思路',s.general)}</div>`;
  const {chosen:g,html}=rankSide(s,groups,'观点频次',name,sub,modes);
  const f=familyById.get(g.id),src=sourceHeader(s,g.hits);
  const teaching=s.general?tip('怎样展开',mechanisms[g.id][1]):tip('适合回答',f.when)+tip('把观点写具体',f.how)+tip('适用边界',f.limit);
  const excerpts=src.selected.map(h=>{
    const keys=h.body==='a'?['a0','a1','a2','a4','a5']:['b0','b4','b5'];
    return `<section class="cu-chain">${keys.map(k=>original(src.r,k)).join('')}${jump(src.r,h.key,'full')}</section>`;
  }).join('');
  return `<div class="cu-layout">${html}<article class="cu-card"><div class="cu-heading"><div><small>${s.general?'跨话题思路':e(f.topic)} · ${metric(g)} / ${rows.length} 篇</small><h2>${e(name(g))}</h2></div></div>
    ${teaching}${src.html}${excerpts}
    <div class="cu-related">${relatedMove(s,src.r,'ex','拆解本题的例子')}${relatedMove(s,src.r,'risk','查看本题的让步和回应')}</div></article></div>`;
}
function movesView(s,rows) {
  const [label,dict,key]=moveTypes[s.mode];
  const groups=groupHits(rows.map(r=>({r,key})),h=>h.r.n[s.mode]);
  const modes=`<div class="cu-seg cu-three">${Object.entries(moveTypes).map(([id,[l]])=>button('mode',id,l,s.mode===id)).join('')}</div>`;
  const {chosen:g,html}=rankSide(s,groups,'段落写法',g=>dict[g.id][0],()=>label,modes);
  const src=sourceHeader(s,g.hits);
  const keys=s.mode==='ex'?['b0','b4','b5']:['r0','r1','r2','r3','rAction','r6'];
  const guide=s.mode==='ex'?'先找这个人或机构遇到了什么，再找他采取的动作。最后一句说明这个结果怎样支持段首论点。':'先读对方的理由和它成立的情境，再看作者的行动是否正好能化解那项顾虑。';
  return `<div class="cu-layout">${html}<article class="cu-card"><div class="cu-heading"><div><small>${label} · ${metric(g)} / ${rows.length} 篇</small><h2>${e(dict[g.id][0])}</h2></div></div>
    ${tip('什么材料适合写',dict[g.id][1])}${tip(s.mode==='ex'?'怎样读这个例子':'怎样连成让步段',guide)}${src.html}
    ${s.mode==='ex'?caseStudy(src.r):''}${keys.map(k=>original(src.r,k)).join('')}${jump(src.r,key,'full')}</article></div>`;
}
function phrasesView(s,rows) {
  lexicon ??= buildLexicon(bank().records);
  const words=rankedPhrases(lexicon,rows,s.query,s.core);
  const modes=`<div class="cu-seg">${button('core','','全部搭配',!s.core)}${button('core','1','只看通用',s.core)}</div>`;
  if (!words.length) return modes+empty('可以换一个英文词、中文释义或话题再查。');
  const {chosen:t,html}=rankSide(s,words,'搭配频次',t=>t.en,t=>t.zh,modes);
  const src=sourceHeader(s,t.hits);
  const forms=[...new Set(t.hits.map(h=>norm(h.form)))];
  return `<div class="cu-layout">${html}<article class="cu-card"><div class="cu-heading"><div><small>${t.core?'通用固定搭配':'范文表达积累'} · ${metric(t)} / ${rows.length} 篇 · 出现 ${t.hits.length} 次</small>
      <h2 class="cu-en" lang="en">${e(t.en)}</h2><p class="cu-gloss">${e(t.zh)}</p></div></div>
    ${tip('怎么搭配',t.tip)}${tip('本次检索命中的词形',forms.join(' / '))}
    ${src.html}${src.selected.map(h=>original(src.r,h.key,'full',h)+jump(src.r,h.key,'full')).join('')}</article></div>`;
}
function results(s) {
  const rows=inScope(bank().records,s.topic,s.type,s.view==='phrases'?'':s.query);
  if (!rows.length) return recap(s,rows)+empty('这组话题、题型和关键词没有交集。可以减少一个筛选条件。');
  const view={slots:slotGuide,ideas:ideaView,moves:movesView,phrases:phrasesView}[s.view];
  return recap(s,rows)+view(s,rows);
}
function change(key,value) {
  const s=current(),p=s.p;
  if (key==='reset') {
    for (const k of ['topic','type','q','pick','doc','n','core']) p.delete(k);
  } else {
    if (value) p.set(key,value); else p.delete(key);
    if (!['doc','n'].includes(key)) p.delete('doc');
    if (!['pick','doc','n'].includes(key)) p.delete('pick');
    if (!['doc','pick','n'].includes(key)) p.delete('n');
    if (key==='edition' && !Object.hasOwn(sourceSlots[value],s.key)) p.delete('slot');
  }
  history.replaceState(history.state,'',path(s.view,p));
  if (key==='reset') {
    const bar=document.querySelector('.cu-filters');
    if (bar) bar.outerHTML=scopeBar(current());
  }
  const panel=document.getElementById('corpusResults');
  if (panel) {
    const scroll=panel.querySelector?.('.cu-dir-body')?.scrollTop || 0;
    const active=document.activeElement;
    const restore=active && panel.contains?.(active) && (active.dataset.param || active.dataset.corpusParam);
    panel.innerHTML=results(current());
    const directory=panel.querySelector?.('.cu-dir-body');
    if (directory && ['pick','doc','n','slot'].includes(key)) directory.scrollTop=scroll;
    if (restore) {
      const controls=[...panel.querySelectorAll('button[data-param], select[data-corpus-param]')];
      const next=controls.find(t=>t.tagName===active.tagName &&
        (t.dataset.param || t.dataset.corpusParam)===restore &&
        (t.tagName==='SELECT' || t.dataset.value===active.dataset.value));
      next?.focus({preventScroll:true});
    }
  }
}
export function corpusAction(act,el) {
  if (act==='corpusSet') {change(el.dataset.param,el.dataset.value);return true;}
  if (act==='corpusReset') {change('reset','');return true;}
  return false;
}
export function corpusChange(el) {if (el.dataset?.corpusParam) {change(el.dataset.corpusParam,el.value);return true;}return false;}
export function corpusInput(el) {if(el.id==='corpusSearch') {change('q',el.value);return true;}return false;}

