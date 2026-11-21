import {db,state,saved,get,e,icon,btn,a,notify,persist,questionTitle} from './ui.js';
import {chain,bilingual,validBody,bodyNames} from './model.js';

function step(item) {
 return `<div><span class="step-tag">${e(item[0])}</span><p>${e(item[1])}</p></div>`;
}

export function logic(d, requested) {
 const body = validBody(d,requested), labels = bodyNames(d);
 const steps = chain(d,body), gapIndex = body===0 ? 1 : 2, gap = steps[gapIndex];
 const hint = ['什么具体情况会让这个结果发生？','什么样的具体场景能支持这个论点？','即使承认上面的顾虑，你的判断为什么仍然成立，或需要怎样调整？'][body];
 const reference = bilingual([d.a[1],d.b[4],d.r?.[3]][body]).en.replace(/^[a-z]/,c=>c.toUpperCase());
 const key = d.id+'@'+body, answer=saved.logicAnswers[key]||'';
 const show = state.logicRevealed, done=!!saved.attempts[key];
 const check = body===2 ? '把你的回应与题干对照。它是否解释了哪种情形会改变结论，或怎样减轻对方指出的问题？' : d.transfer;
 const blank = `<div class="logic-missing"><span class="step-tag">自己补一步 · ${e(gap[0])}</span><label for="logicAnswer">${e(hint)}</label><textarea id="logicAnswer" rows="3" placeholder="先写中文也可以…" data-key="${key}">${e(answer)}</textarea><div class="logic-action">${btn(show?'收起参考思路':'查看参考思路','revealLogic','btn forest')}<span>${done?'已练习':'自动保存'}</span></div>
 ${show?`<div class="reference-answer"><b>一种写法</b><p>${e(gap[1])}</p><p class="english" lang="en">${e(reference)}.</p></div>`:''}</div>`;
 return `<div class="shell secondary-page logic-page"><div class="section-kicker"><span></span> LOGIC PRACTICE</div><h1>补一条逻辑链</h1><p class="lede">从一个抽象观点往下追问，写出中间真正发生的事。</p><div class="logic-page-grid"><section class="logic-work"><div class="logic-chooser"><label class="chooser-label">练习题目<select id="logicSelect" data-body="${body}">${db.essays.map(x=>`<option value="${x.id}" ${d.id===x.id?'selected':''}>${e(x.title)}</option>`).join('')}</select></label>${btn(icon('shuffle',17)+'换一题','shuffleLogic','btn subtle')}</div>
 <div class="logic-block"><div class="logic-block-title"><div><span class="meta-tag">${e(d.type)} · ${e(d.topic)}</span><h2>${questionTitle(d)}</h2></div>${btn(icon('bookmark',18),'starLogic','icon-btn'+(saved.logicStars[key]?' on':''),`aria-label="收藏本条逻辑链" aria-pressed="${!!saved.logicStars[key]}"`)}</div>
 <div class="mini-tabs">${labels.map((label,i)=>a(e(label),'#/logic/'+d.id+'@'+i,body===i?'active':'')).join('')}</div>
 <div class="logic-steps">${steps.map((item,i)=>i===gapIndex?blank:step(item)).join('')}</div></div></section>
 <aside><section class="panel"><div class="panel-heading">${icon('bulb',18)}<h3>检查这一步</h3></div><p>${e(check)}</p>${a('对照完整范文','#/task/'+d.id,'btn soft wide')}</section><section class="panel"><div class="panel-heading">${icon('book',18)}<h3>英文题干</h3></div><p class="english">${e(d.prompt)}</p></section></aside></div></div>`;
}
export function handlePractice(action,el,path,render){
 if(path[0]!=='logic')return false;
 const [id,raw]=String(path[1]||'').split('@');
 const found=get(id),d=found&&db.essays.includes(found)?found:db.essays[0];
 const body=validBody(d,raw),key=d.id+'@'+body;
 if(action==='revealLogic'){state.logicRevealed=!state.logicRevealed;if(state.logicRevealed&&saved.logicAnswers[key]?.trim())saved.attempts[key]=true;persist();render();return true;}
 if(action==='starLogic'){if(saved.logicStars[key])delete saved.logicStars[key];else saved.logicStars[key]=true;persist();notify(saved.logicStars[key]?'已收藏这条逻辑链':'已移出收藏');render();return true;}
 if(action==='shuffleLogic'){
  const others=db.essays.filter(v=>v.id!==d.id&&validBody(v,body)===body);
  if(others.length) location.hash='#/logic/'+others[Math.floor(Math.random()*others.length)].id+'@'+body;
  return true;
 }
 return false;
}
