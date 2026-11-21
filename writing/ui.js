import {icon} from './icons.js';
import {isChart} from './model.js';
export {icon};
export const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const e=esc;
export const btn=(label,act,cls='',opts='')=>`<button type="button" class="${cls}" data-act="${act}" ${opts}>${label}</button>`;
export const a=(label,url,cls='')=>`<a class="${cls}" href="${esc(url)}">${label}</a>`;
const key='ruby-writing-studio-1';
const empty={edition:'full',stars:{},drafts:{},blanks:{},logicAnswers:{},logicStars:{},recent:[],checks:{},timers:{},attempts:{}};
function load(){try{const record=JSON.parse(localStorage.getItem(key)||'{}');return Object.fromEntries(Object.entries(empty).map(([k,v])=>[k,record[k]??v]));}catch{return {...empty};}}
export const saved=load();
let storageIssue=false;
export function persist(){try{localStorage.setItem(key,JSON.stringify(saved));}catch{if(!storageIssue){storageIssue=true;notify('浏览器暂时无法保存记录，当前页面仍可继续练习。');}}}
export const db={essays:[],charts:[]};
export const state={bank:2,collection:'',type:'',topic:'',search:'',page:1,per:8,detailId:'',tab:'read',selected:'',translated:{},phraseOpen:{},phraseMore:false,openHint:false,readZh:false,showReview:false,logicBody:0,highlight:null,logicRevealed:false,handLane:'topics',handGroup:'教育',handQuery:'',handRole:'',handLimit:24,mine:'收藏题目'};
export const all=()=>[...db.essays,...db.charts];
export const get=id=>db.essays.find(x=>x.id===id)||db.charts.find(x=>x.id===id);
export function notify(msg){const n=document.querySelector('#notice');if(!n)return;n.textContent=msg;n.classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>n.classList.remove('visible'),1900);}
export function navigate(path){if(location.hash===path)window.dispatchEvent(new HashChangeEvent('hashchange'));else location.hash=path;}
export const route=()=>decodeURI(location.hash.replace(/^#\/?/,'')).split('?')[0].split('/').filter(Boolean);
export function touch(d){saved.recent=[d.id,...saved.recent.filter(x=>x!==d.id)].slice(0,30);persist();}
export function mark(id){if(saved.stars[id])delete saved.stars[id];else saved.stars[id]=true;persist();notify(saved.stars[id]?'已加入收藏':'已移出收藏');}
export const bookButton=(d,inline=false)=>btn(icon('bookmark',inline?17:18)+(inline?' '+(saved.stars[d.id]?'已收藏':'收藏题目'):''),'star',(inline?'btn subtle':'star icon-btn')+(saved.stars[d.id]?' on':''),`data-id="${d.id}" aria-label="${saved.stars[d.id]?'取消收藏':'收藏'}${esc(d.title)}" aria-pressed="${!!saved.stars[d.id]}"`);
export const taskUrl=d=>'#/task/'+d.id;
export function openModal(title,content,cls=''){const m=document.querySelector('#modal');m.className=cls;m.setAttribute('aria-labelledby','dialog-title');m.innerHTML=`<div class="dialog-top"><h2 id="dialog-title">${esc(title)}</h2>${btn(icon('close'),'close','icon-btn','aria-label="关闭"')}</div><div class="dialog-body">${content}</div>`;if(!m.open)m.showModal();}
export const chartIcons={'折线图':'line','柱状图':'bars','饼图':'pie','表格':'table','混合图':'stack','地图':'map','流程图':'chain'};
const byTopic={'教育':['grad','olive'],'犯罪':['scales','plum'],'科技与媒体':['talk','blue'],'交通':['bus','peach'],'环境':['leaf','mint'],'政府':['scales','olive'],'工作':['brief','peach'],'文化艺术与旅游':['globe','plum'],'社会':['talk','blue'],'体育与休闲':['globe','mint']};
export function identity(d){return isChart(d)?[chartIcons[d.type],({'折线图':'mint','饼图':'peach','柱状图':'blue','表格':'olive','混合图':'plum','流程图':'mint','地图':'blue'})[d.type]]:byTopic[d.topic]||['book','olive'];}
export function positionLine(d) {
 const chart=isChart(d),label=chart?'写作方式':'范文立场';
 return `<span class="position-line"><span class="stance-pill${chart?' objective':''}"><span class="sr">${label}，</span>${esc(d.stance)}</span><span class="stance-judgment">${esc(d.stanceSummary)}</span></span>`;
}
export function questionTitle(d){
 return d.november ? `<span class="november-title">${esc(d.title)}</span>` : esc(d.title);
}
export function row(d) {
 const [im,co]=identity(d);
 const topic=isChart(d)?d.mode:(d.tags?.includes('社交媒体')?'社交媒体':d.topic);
 return `<article class="question-row"><a class="row-link" href="${taskUrl(d)}"><span class="tile ${co}">${icon(im,23)}</span><span class="row-copy">${positionLine(d)}<strong>${questionTitle(d)}</strong><span class="row-foot"><span class="q-meta">${d.november?`<span class="batch-index">11 月 · 第 ${d.november.number} 题</span><i></i>`:''}<span>${esc(d.type)}</span><i></i>${esc(topic)}</span><span class="q-excerpt" lang="en">${esc(d.prompt)}</span></span></span></a>${bookButton(d)}</article>`;
}
export function emptyView(title,desc,cta=''){return `<div class="empty-view">${icon('book',29)}<strong>${esc(title)}</strong><p>${esc(desc)}</p>${cta}</div>`;}
export function highlightBox(ev){if(!ev?.rect||ev.rect.length!==4)return '';const [x,y,w,h]=ev.rect.map(v=>Math.min(1,Math.max(0,Number(v)))*100);return `<span class="chart-highlight" aria-hidden="true" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"></span>`;}

