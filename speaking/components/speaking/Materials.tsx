"use client";
import {useEffect,useState} from "react";
import {ChevronRight, NotebookPen, Plus, Save, Search, UserRound} from "lucide-react";
import {bank,cardById,priorityStories,questionPart,searchMatch,shortName,storiesById} from "./model";
import {Done,Empty,Marked,StoryIcon} from "./Common";
import {AnswerEditor} from "./Practice";
import {Absent,Sample} from "./Detail";
import {CategoryChoices} from "./Bank";
import {Category,Entry,NotebookState,path,readLocal,writeLocal} from "./types";

export function Stories({book}:{book:NotebookState}){
  const [query,setQuery]=useState(""),[category,setCategory]=useState<Category|"">("");
  const matchesCategory=(ids:string[])=>!category||ids.some(id=>cardById.get(id)?.category===category);
  const own=Object.values(book.entries).filter(e=>e.id.startsWith("material:")&&matchesCategory(e.cards)&&searchMatch([e.title,e.body],query));
  const prepared=priorityStories.map(id=>storiesById.get(id)!).filter(s=>s&&matchesCategory(s.topics.map(t=>t.cardId))&&searchMatch([s.zh,s.en,s.coreZh,...s.keywords,...s.topics.map(t=>cardById.get(t.cardId)?.zh)],query));
  return <main className="wrap inner-page"><div className="page-heading"><div><span className="kicker">Story bank</span><h1>串题素材</h1><p>选一段熟悉的经历，对照它在不同 P2 题目里的完整讲法。</p></div><a className="btn dark" href={path("new")}><Plus size={17}/>添加素材</a></div>
    <label className="search solo"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索故事、人物或 P2 题目" aria-label="搜索串题素材"/></label>
    <CategoryChoices value={category} change={setCategory}/>
    <div className="story-grid">{own.map(e=><a key={e.id} className="story-box" href={path("material",e.id.slice(9))}><div className="story-box-top"><span className="tile-icon sage"><NotebookPen size={23}/></span><span>自建素材</span></div><h2>{e.title}</h2><p className="clamp">{e.body}</p><small>{e.cards.filter(id=>cardById.has(id)).length} 张关联题卡</small></a>)}
    {prepared.map(s=>{const cards=s.topics.map(t=>cardById.get(t.cardId)!).filter(Boolean);return <a key={s.id} className="story-box" href={path("story",s.id,...(category?[cards.find(c=>c.category===category)!.id]:[]))}><div className="story-box-top"><StoryIcon id={s.id}/><span>{[...new Set(cards.map(c=>c.category))].join(" / ")}</span></div><h2>{shortName(s)}</h2><p lang="en">{s.en}</p><footer><span>{cards.length} 张 P2 完整范答</span></footer></a>;})}</div>
    {!own.length&&!prepared.length&&<Empty>没有找到这个故事。</Empty>}</main>;
}
export function StoryPage({id,initialCard,book}:{id:string;initialCard?:string;book:NotebookState}){
  const story=storiesById.get(id);if(!story)return <Absent/>;
  const cards=story.topics.map(t=>cardById.get(t.cardId)!).filter(Boolean),selected=cards.find(c=>c.id===initialCard)||cards[0];
  if(!selected)return <Absent/>;
  return <main className="wrap inner-page"><a className="crumb" href={path("stories")}>串题素材</a>
    <div className="page-heading"><div><span className="kicker">Personal story</span><h1>{shortName(story)}</h1><p lang="en">{story.en}</p></div><StoryIcon id={id}/></div>
    <div className="detail-grid story-detail"><article><section className="panel story-selector"><div className="inline-head"><h2>用这个故事回答哪道题</h2><span className="sub">{cards.length} 张 P2</span></div>
      <div className="story-choices">{cards.map(c=><a key={c.id} href={path("story",id,c.id)} className={selected.id===c.id?"selected":""} aria-current={selected.id===c.id?"true":undefined}><small>{c.category}</small><Marked on={c.highlight}>{c.zh}</Marked><Done on={book.entries["done:"+c.id]?.body==="1"}/></a>)}</div>
      <div className="selected-prompt"><span className="kicker">Part 2</span><h2 lang="en"><Marked on={selected.highlight}>{selected.en}</Marked></h2><p>{selected.zh}</p></div>
      </section><Sample key={selected.id} q={selected} card={selected}/>
      <div className="actions story-actions"><a className="btn dark" href={path("p2",selected.id)}>打开题卡，计时练习</a>
        {(selected.followups[0]||selected.relatedFollowups?.[0])&&<a className="btn soft" href={path("p3",selected.followups[0]||selected.relatedFollowups![0],selected.id)}>{selected.followups.length?"接练对应 P3":"接练同主题 P3"}</a>}</div>
    </article><aside className="side-stack"><section className="panel core-panel"><h2>这组可以共用的内容</h2><p className="core-zh">{story.coreZh}</p><p className="core-en" lang="en">{story.coreEn}</p><details className="fold core-translation"><summary>主干逐句翻译</summary><p lang="zh-CN">{story.coreTranslation}</p></details><div className="keywords">{story.keywords.map(k=><span key={k}>{k}</span>)}</div></section>
    <AnswerEditor id={"story-"+id} title={shortName(story)} book={book} label="我的素材笔记" hint="补上真实细节，或记下换题时想保留的句子。"/></aside></div></main>;
}
export function Profile({book}:{book:NotebookState}){
  return <main className="wrap inner-page"><a href={path()} className="crumb">练习首页</a><div className="page-heading"><div><span className="kicker">Personal background</span><h1>口语背景示例</h1><p>这些是虚构的练习设定。你可以把英文里的地点、职业和生活细节换成自己的。</p></div><span className="avatar big">S</span></div>
    <div className="profile-grid">{bank.profile.map(line=><article className="panel profile-card" key={line.id}><div className="inline-head"><h2>{line.label}</h2><UserRound size={17}/></div>{line.prompt&&<p className="profile-prompt" lang="en">{line.prompt}</p>}<p className="profile-answer" lang="en">{line.en}</p><p className="sub">{line.zh}</p>{line.note&&<small>{line.note}</small>}</article>)}</div>
    <AnswerEditor id="personal-profile" title="口语背景示例" book={book} label="我的背景补充" hint="把最近的变化，或考场上想用的表达记在这里。"/></main>;
}
type Draft={title:string;body:string;cards:string[]};
export function MaterialEditor({id,card,book}:{id:string;card?:string;book:NotebookState}){
  const isNew=id==="new",draftKey="material-draft:"+(isNew?"new":id),entry=book.entries["material:"+id];
  const fallback:Draft={title:"",body:"",cards:cardById.has(card||"")?[card!]:[]};
  const [draft,setDraft]=useState<Draft>(fallback),[search,setSearch]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{if(!book.ready)return;const local=readLocal<Draft|null>(draftKey,null);
    const data=local || (entry?{title:entry.title,body:entry.body,cards:entry.cards}:fallback);
    const withCard=card&&cardById.has(card)&&!data.cards.includes(card)?{...data,cards:[...data.cards,card]}:data;
    setDraft(withCard);
  },[book.ready,id,entry?.revision,card]);
  const change=(patch:Partial<Draft>)=>{const next={...draft,...patch};setDraft(next);writeLocal(draftKey,next);setMessage("");};
  const toggle=(cid:string)=>change({cards:draft.cards.includes(cid)?draft.cards.filter(i=>i!==cid):[...draft.cards,cid]});
  async function persist(e:React.FormEvent){e.preventDefault();if(!draft.title.trim()||!draft.body.trim()){setMessage("请填写素材名称和故事主干。");return;}setBusy(true);
    const newId=isNew?"my-"+crypto.randomUUID():id;
    try{const notice=await book.save({id:"material:"+newId,title:draft.title.trim(),body:draft.body.trim(),cards:draft.cards});
      writeLocal(draftKey,null);if(isNew){location.hash=path("material",newId);}setMessage(notice);
    }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  return <main className="wrap inner-page slim"><a className="crumb" href={path("stories")}>串题素材</a><div className="page-heading"><div><span className="kicker">My material</span><h1>{isNew?"添加我的素材":entry?.title||"我的素材"}</h1></div></div>
    <form className="panel material-form" onSubmit={persist}><label>素材名称<input value={draft.title} onChange={e=>change({title:e.target.value})} placeholder="比如：在社区书市帮忙" maxLength={150} required/></label><label>故事主干或关键词<textarea rows={7} value={draft.body} onChange={e=>change({body:e.target.value})} placeholder="可以从中文线索写起，也可以直接记英文。" maxLength={30000} required/></label>
    <fieldset><legend>关联 P2 题卡 · 已选 {draft.cards.filter(id=>cardById.has(id)).length} 张</legend><div className="selected-cards">{draft.cards.filter(id=>cardById.has(id)).map(cid=><button type="button" title="取消关联" onClick={()=>toggle(cid)} key={cid}>{cardById.get(cid)?.zh||cid} ×</button>)}</div><label className="search"><Search size={17}/><input placeholder="查找要关联的题卡" aria-label="搜索要关联的题卡" value={search} onChange={e=>setSearch(e.target.value)}/></label>
    <div className="check-list">{bank.cards.filter(c=>searchMatch([c.en,c.zh],search)).map(c=><label key={c.id}><input type="checkbox" checked={draft.cards.includes(c.id)} onChange={()=>toggle(c.id)}/>{c.zh}<small>{c.category}类</small></label>)}</div></fieldset>
    <div className="actions"><button className="btn dark" disabled={busy||!book.ready}><Save size={16}/>{busy?"保存中…":"保存素材"}</button><small role="status">{message}</small></div></form>
    {!isNew&&entry&&entry.cards.some(cid=>cardById.has(cid))&&<section className="panel"><h2>去练已关联的题卡</h2>{entry.cards.filter(cid=>cardById.has(cid)).map(cid=><a className="row-link" key={cid} href={path("p2",cid)}>{cardById.get(cid)?.zh}<ChevronRight size={15}/></a>)}</section>}</main>;
}
function entryHref(e:Entry){
  const [kind,id]=e.id.split(":");
  if(kind==="material")return path("material",id);
  if(id==="personal-profile")return path("profile");
  if(id.startsWith("story-")&&storiesById.has(id.slice(6)))return path("story",id.slice(6));
  const p=questionPart(id);return p?path(p,id):path("note",id);
}
export function Saved({book}:{book:NotebookState}){
  const [tab,setTab]=useState("answer");
  const entries=Object.values(book.entries).filter(e=>e.id.startsWith(tab+":")&&(tab==="done"?e.body==="1":!!e.body.trim())).sort((a,b)=>b.updated-a.updated);
  return <main className="wrap inner-page slim"><div className="page-heading"><div><span className="kicker">My notebook</span><h1>我的笔记</h1><p>从上次写下的答案或练过的题目继续。</p></div><a className="btn dark" href={path("new")}><Plus size={16}/>添加素材</a></div>
  <div className="seg">{[["answer","答案与笔记"],["material","自建素材"],["done","练过的题"]].map(([key,label])=><button key={key} className={tab===key?"selected":""} onClick={()=>setTab(key)} aria-pressed={tab===key}>{label}</button>)}</div>
  {entries.length?<div className="bank-list">{entries.map(e=><a className="bank-row" key={e.id} href={entryHref(e)}><span className="row-copy"><strong>{e.title}</strong>{tab!=="done"&&<small className="clamp">{e.body}</small>}</span><ChevronRight size={17}/></a>)}</div>:<Empty>{!book.ready?"正在读取笔记…":tab==="done"?"在题卡上标记「已练过」，这里就会留下记录。":tab==="material"?"添加自己的故事，再把能共用这段经历的 P2 题卡勾在一起。":"在题卡上保存答案，或在故事旁写一条笔记，就能在这里继续。"}<a className="text-link" href={tab==="material"?path("new"):path("bank","p1")}>{tab==="material"?"添加第一段素材":"去题库练习"}</a></Empty>}
  <small className="sync-state" role="status">{book.mode==="loading"?"正在读取…":book.mode==="account"?"个人内容随账号保存。":book.mode==="local"?"你的答案、素材和练习记录保存在当前浏览器。":"当前使用本机草稿，恢复连接后可同步。"}</small></main>;
}

export function ArchivedNote({id,book}:{id:string;book:NotebookState}){
  const note=book.entries["answer:"+id],done=book.entries["done:"+id];
  if(book.ready&&!note&&!done)return <Absent/>;
  return <main className="wrap inner-page slim"><a className="crumb" href={path("saved")}>我的笔记</a><div className="page-heading"><div><span className="kicker">My notebook</span><h1>{note?.title||done?.title||"我的练习记录"}</h1></div><Done on={done?.body==="1"}/></div><AnswerEditor id={id} title={note?.title||done?.title||"练习笔记"} book={book}/></main>;
}
