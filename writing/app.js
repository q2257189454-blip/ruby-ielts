import {state,saved,persist,db,route,e,get,icon,a,btn,mark,touch,navigate} from './ui.js';
import {validBody} from './model.js';
import {catalog,mine,setBank,updateResults,info} from './catalog.js?rev=corpus1';
import {article,articleAction,articleInput,tick,selectSourceSlot} from './article.js?rev=corpus1';
import {logic,handlePractice} from './practice.js';
import {language,configureHandbook,handleHandbook,updateHandSearch,handbookUrl} from './handbook.js?rev=corpus1';
import {corpus,corpusAction,corpusChange,corpusInput} from './corpus.js';
const mount=document.querySelector('#app');
const modal=document.querySelector('#modal');
const menu=[['题库','grid','#/','bank'],['逻辑链','chain','#/logic','logic'],['语料库','stack','#/corpus','corpus'],['表达手册','word','#/language','language'],['我的练习','bookmark','#/mine','mine']];
function header(active){return `<header class="site-header"><div class="shell nav-shell"><a class="brand" href="#/" aria-label="Ruby 写作室首页"><img src="./assets/mark.svg" alt="" width="37" height="37"><span class="brand-text"><em>Ruby</em> 写作室</span></a><nav class="main-nav" aria-label="主导航">${menu.map(([name,im,url,k])=>`<a class="nav-link ${active===k?'active':''}" href="${url}" ${active===k?'aria-current="page"':''}>${icon(im,17)}${name}</a>`).join('')}</nav></div></header>`;}
function footer(){return `<footer class="site-footer"><div class="shell"><span>Ruby 写作室 · IELTS Academic Writing</span>${btn('练习室说明','info','link-btn')}</div></footer>`;}
function titleText(x){document.title=x==='雅思写作练习室'?x+' · Ruby':x+' · Ruby 写作室';}
function render(){
 const [view,id='']=route();let body='',title='雅思写作练习室',active='bank';
 if(view==='task'){
  const item=get(id);if(item){body=article(item);title=item.title;}
  else{body='<div class="shell secondary-page"><h1>找不到这道题</h1>'+a('返回分类题库','#/','btn forest')+'</div>';}
 }else if(view==='logic'){
  let [k,b]=id.split('@');let item=get(k);if(!item||!item.id.startsWith('e'))item=db.essays[0];body=logic(item,b);active='logic';title='补一条逻辑链';
 }else if(view==='corpus'){body=corpus();active='corpus';title='大作文语料库';}
 else if(view==='mine'){body=mine();active='mine';title='我的练习';}
 else if(view==='language'){body=language();active='language';title=state.handLane==='topics'?'大作文话题词组':'小作文'+(state.handLane==='patterns'?'句式':'同义替换');}
 else{body=catalog(view!=='bank');if(state.collection==='november')title='11 月大作文题单';}
 mount.innerHTML=header(active)+'<main id="main" tabindex="-1">'+body+'</main>'+footer();titleText(title);
}
function go(){
 if(modal.open)modal.close();
 const [view,id='',mode='',key='']=route();
 let sourceParagraph;
 state.sourceEdition='';
 if(view==='task'&&get(id)){
  state.detailId=id;touch(get(id));state.tab=mode==='write'?'write':'read';state.selected='';state.translated={};state.phraseOpen={};state.phraseMore=false;state.highlight=null;state.logicBody=0;state.readZh=false;state.showReview=false;state.openHint=false;
  if(mode==='at')sourceParagraph=selectSourceSlot(get(id),key,new URLSearchParams(location.hash.split('?')[1]||'').get('edition'));
 }else{state.detailId='';}
 if(view==='bank'&&(id==='1'||id==='2'))setBank(Number(id),mode);
 else if(!view&&state.collection)setBank(2);
 if(view==='language')configureHandbook(route().slice(1));
 state.logicRevealed=false;
 render();
 if(sourceParagraph!==undefined)document.getElementById('para-'+sourceParagraph)?.scrollIntoView({block:'start'});
 else window.scrollTo(0,0);
}
document.addEventListener('click',event=>{
 if(event.target===modal){modal.close();return;}
 const skip=event.target.closest('.skip');if(skip){event.preventDefault();document.querySelector('#main')?.focus();return;}
 const el=event.target.closest('[data-act]');if(!el||el.disabled)return;const act=el.dataset.act;
 if(act==='close'){modal.close();return;}if(act==='info'){info();return;}
 if(act==='star'){mark(el.dataset.id);render();return;}
 if(act==='bankTab'){
  const [,task,collection]=route(),n=Number(el.dataset.n);
  if(route()[0]==='bank'&&(task!==el.dataset.n||collection))navigate('#/bank/'+n);
  else{setBank(n);render();}
  return;
 }
 if(act==='type'){state.type=el.dataset.value;state.page=1;render();return;}
 if(act==='resetFilter'){setBank(state.bank,state.collection);render();return;}
 if(act==='page'){state.page=Number(el.dataset.page);updateResults();document.querySelector('.catalog-controls')?.scrollIntoView({block:'start'});return;}
 if(act==='mineTab'){state.mine=el.dataset.value;render();return;}
 if(route()[0]==='corpus'&&corpusAction(act,el))return;
 if(route()[0]==='task'&&articleAction(act,el,render))return;
 if(route()[0]==='language'&&handleHandbook(act,el))return;
 handlePractice(act,el,route(),render);
});
document.addEventListener('keydown',ev=>{const t=ev.target.closest('span[role="button"][data-act]');if(t&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();t.click();}});
document.addEventListener('input',ev=>{
 const t=ev.target;
 if(corpusInput(t))return;
 if(t.id==='bankSearch'){state.search=t.value;state.page=1;updateResults();return;}
 if(t.id==='langSearch'){updateHandSearch(t.value);return;}
 if(t.id==='logicAnswer'){saved.logicAnswers[t.dataset.key]=t.value;persist();return;}
 articleInput(t);
});
document.addEventListener('change',ev=>{
 const t=ev.target;
 if(corpusChange(t))return;
 if(t.id==='topicSelect'){state.topic=t.value;state.page=1;updateResults();}
 if(t.id==='handGroup'){navigate(handbookUrl(state.handLane,t.value));}
 if(t.id==='logicSelect'){navigate('#/logic/'+t.value+'@'+validBody(get(t.value),t.dataset.body));}
 if(t.matches('[data-check]')&&state.detailId){(saved.checks[state.detailId]??={})[t.dataset.check]=t.checked;persist();}
});
document.addEventListener('toggle',ev=>{
 const t=ev.target;
 if(!t.isConnected)return;
 if(t.classList?.contains('prompt-zh'))state.readZh=t.open;
 if(t.classList?.contains('expression-more'))state.phraseMore=t.open;
 if(t.dataset?.phraseIndex!==undefined)state.phraseOpen[t.dataset.phraseIndex]=t.open;
},true);
window.addEventListener('hashchange',go);setInterval(tick,500);
try{
 // Use the entry module's bank revision for the data request on static hosts.
 const bankUrl=new URL('./data.json',import.meta.url);
 bankUrl.search=new URL(import.meta.url).search;
 const reply=await fetch(bankUrl,{cache:'no-cache'});
 if(!reply.ok)throw new Error('题库读取失败');
 Object.assign(db,await reply.json());
 go();
}catch(err){console.error(err);mount.innerHTML=header('bank')+'<main class="shell secondary-page"><h1>题库暂时没有打开</h1><p>请刷新页面重新加载。</p><button type="button" class="btn forest" id="retry">重新加载</button></main>';document.querySelector('#retry').onclick=()=>location.reload();}

