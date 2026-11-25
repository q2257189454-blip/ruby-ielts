"use client";
import {useRef, useState} from "react";
import {importWorkbook,clearWorkbook} from "./workbook";
import {ChevronRight, Highlighter, Search, Shuffle, X} from "lucide-react";
import {bank, personalEdition, cardById, orderedTopics, parents, priorityStories, questionMatches, randomId, searchMatch, shortName, storiesById} from "./model";
import {categories, Category, Entry, Part, partInfo, parts, path, Question} from "./types";
import {Done, Empty, Marked, partIcons} from "./Common";

export interface Filter {search:string; story:string; category:Category|""; page:number}
export const initialFilter:Filter={search:"",story:"all",category:"",page:1};
interface Row {
  id:string; title:string; sub:string; meta:string; href:string; done:boolean; highlight:boolean;
  category?:Category; group?:string; isTopic?:boolean; priority?:boolean;
}
interface Props {
  part:Part; filter:Filter; setFilter:(value:Filter)=>void; focusOnly:boolean; entries:Record<string,Entry>;
}
function RowLink({row}:{row:Row}){
  return <a className={row.isTopic&&row.highlight?("bank-row focus-topic-row"+(row.priority?" priority":"")):"bank-row"} href={row.href}>
    <span className="row-copy"><strong><Marked on={row.highlight}>{row.title}</Marked></strong>{row.sub&&<small><Marked on={row.highlight&&(!!row.category||!!row.isTopic)}>{row.sub}</Marked></small>}</span>
    {row.meta&&<span className="row-meta">{row.priority&&<span className="topic-priority">优先练</span>}{row.meta}</span>}<Done on={row.done}/><ChevronRight size={17}/>
  </a>;
}
export function CategoryChoices({value,change}:{value:Category|"";change:(value:Category|"")=>void}){
  return <div className="category-choices" aria-label="P2 题卡分类">{(["",...categories] as const).map(c=>
    <button key={c} className={value===c?"selected":""} aria-pressed={value===c} onClick={()=>change(c)}>{c?c+"类":"全部类别"}</button>)}</div>;
}
function WorkbookChooser(){
  const input=useRef<HTMLInputElement>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  async function select(file?:File){
    if(!file)return;
    setBusy(true);setMessage("");
    try {await importWorkbook(file,bank.cards);location.reload();}
    catch(error){setMessage(error instanceof Error?error.message:"读取失败，请重新选择练习册。");setBusy(false);}
    finally{if(input.current)input.current.value="";}
  }
  function reset(){
    try{clearWorkbook();location.reload();}
    catch{setMessage("当前浏览器无法更改已保存的版本。");}
  }
  return <div className="workbook-choice">
    <span><strong>{personalEdition?"个人练习册":"公开匿名示例"}</strong> · 57 张题卡</span>
    <button className="mini" disabled={busy} onClick={()=>input.current?.click()}>{busy?"正在读取…":personalEdition?"更换练习册":"导入个人练习册 PDF"}</button>
    {personalEdition&&<button className="mini" onClick={reset}>切回公开示例</button>}
    <input hidden ref={input} type="file" accept="application/pdf,.pdf" aria-label="选择个人练习册 PDF" onChange={e=>void select(e.target.files?.[0])}/>
    <small>个人素材仅保存在当前浏览器。</small>{message&&<p role="alert">{message}</p>}
  </div>;
}
export default function QuestionBank({part,filter,setFilter,focusOnly,entries}:Props){
  const {search,story,category,page}=filter;
  const update=(value:Partial<Filter>)=>setFilter({...filter,page:1,...value});
  const done=(id:string)=>entries["done:"+id]?.body==="1";
  const rows:Row[]=[],drillIds:string[]=[];
  const [focusIndex,setFocusIndex]=useState<"questions"|"topics">("questions");
  const onlyTopics=part==="p1"&&(focusOnly?focusIndex==="topics":!search.trim());
  const customMaterials=Object.values(entries).filter(e=>e.id.startsWith("material:"));
  const qRoute=(p:Part,q:Question,parent?:string)=>p==="p1"?path(p,q.id,...(focusOnly?["focus"]:[])):path(p,q.id,...(parent?[parent]:[]));
  const addQuestion=(q:Question,label:string,parent?:string)=>{
    rows.push({id:q.id,title:q.highlight&&q.focusWording?q.focusWording:q.en,sub:q.focusZh||q.zh,meta:label,href:qRoute(part,q,parent),done:done(q.id),highlight:q.highlight});
    drillIds.push(q.id);
  };
  if(part==="p1")for(const t of orderedTopics){
    const qs=t.questions.filter(q=>!focusOnly||q.highlight);
    if(!qs.length)continue;
    if(onlyTopics){
      if(!searchMatch([t.en,t.zh],search)&&!qs.some(q=>questionMatches(q,search)))continue;
      const count=qs.filter(q=>q.highlight).length;
      rows.push({id:t.id,title:t.zh,sub:t.en,meta:focusOnly?count+" 道重点小问":qs.length+" 道小问"+(count?" · "+count+" 道重点":""),href:path("topic",t.id,...(focusOnly?["focus"]:[])),done:qs.every(q=>done(q.id)),highlight:count>0,isTopic:true,priority:t.priority});
      drillIds.push(...qs.map(q=>q.id));continue;
    }
    const groupMatch=searchMatch([t.en,t.zh],search);
    for(const q of qs)if(groupMatch||questionMatches(q,search))addQuestion(q,t.zh);
  }
  if(part==="p2")for(const c of bank.cards){
    if((category&&c.category!==category)||(focusOnly&&!c.highlight))continue;
    const s=storiesById.get(c.storyId), own=customMaterials.filter(e=>e.cards.includes(c.id));
    if(story!=="all"&&c.storyId!==story&&!own.some(e=>e.id===story))continue;
    const name=s?shortName(s):"个人经历";
    if(!questionMatches(c,search)&&!searchMatch([name,c.titleZh,c.number,c.category,...c.outline,...own.map(e=>e.title),...c.cues],search))continue;
    rows.push({id:c.id,title:c.number+" · "+c.titleZh,sub:c.en,meta:"",href:path("p2",c.id,...(focusOnly?["focus"]:[])),done:done(c.id),highlight:c.highlight,category:c.category,group:name});
    drillIds.push(c.id);
  }
  if(part==="p3")for(const q of bank.questions){
    if(focusOnly&&!q.highlight)continue;
    const related=(parents.get(q.id)||[]).map(id=>cardById.get(id)!).filter(Boolean);
    if(!questionMatches(q,search)&&!searchMatch(related.flatMap(c=>[c.zh,c.en]),search))continue;
    addQuestion(q,related[0]?.zh||"延伸讨论",related[0]?.id);
  }
  const batch=24,pages=Math.max(1,Math.ceil(rows.length/batch)),now=Math.min(page,pages);
  function draw(){
    const id=randomId(drillIds.map(id=>({id})));if(!id)return;
    location.hash=rows.find(row=>row.id===id)?.href||path(part,id,...(focusOnly?["focus"]:[]));
  }
  return <main className="wrap inner-page">
    <div className="page-heading"><div><span className="kicker">Question bank</span><h1>大陆口语题库</h1></div>
      <button className="btn dark" onClick={draw} disabled={!drillIds.length}><Shuffle size={16}/>从当前范围抽题</button></div>
    <div className="part-tabs" aria-label="题库分区">{parts.map(p=>{const Icon=partIcons[p];return <a key={p} href={path("bank",p,...(focusOnly?["focus"]:[]))} className={p===part?"selected":""} aria-current={p===part?"page":undefined}><Icon size={18}/><strong>Part {p.slice(1)}</strong> {partInfo[p].name}</a>;})}</div>
    {part==="p2"&&<WorkbookChooser/>}
    <div className="filters">
      <label className="search"><Search size={18}/><input aria-label="搜索中英文题目或关键词" placeholder={part==="p2"?"搜索题目、故事或关键词":"搜索中英文题目或关键词"} value={search} onChange={e=>update({search:e.target.value})}/>{search&&<button aria-label="清空搜索" onClick={()=>update({search:""})}><X size={16}/></button>}</label>
      <a className={"btn focus-toggle "+(focusOnly?"selected":"outline")} href={path("bank",part,...(focusOnly?[]:["focus"]))} onClick={()=>update({page:1})} aria-label={focusOnly?"显示全部大陆题目":"只看文字重点"}><Highlighter size={16}/>{focusOnly?"只看重点 · 已开启":"只看文字重点"}</a>
      {part==="p2"&&<label className="select-wrap"><span className="sr">按串题故事筛选</span><select value={story} onChange={e=>update({story:e.target.value})}><option value="all">全部故事</option>{priorityStories.map(s=>storiesById.get(s)).filter(Boolean).map(s=><option key={s!.id} value={s!.id}>{shortName(s!)}</option>)}{customMaterials.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>}
    </div>
    {part==="p2"&&<CategoryChoices value={category} change={category=>update({category})}/>}
    {part==="p1"&&focusOnly&&<div className="category-choices" aria-label="重点浏览方式">
      {(["questions","topics"] as const).map(mode=><button key={mode} className={focusIndex===mode?"selected":""} aria-pressed={focusIndex===mode} onClick={()=>{setFocusIndex(mode);update({page:1});}}>{mode==="topics"?"按重点话题":"按重点小问"}</button>)}</div>}
    <div className="list-caption"><strong>{rows.length} {onlyTopics?"个话题":part==="p2"?"张题卡":"道小问"}</strong><span><i className="highlight-key"/>{onlyTopics?"黄色话题含有重点小问":"黄色下划线标出重点小问"}</span></div>
    {!rows.length?<Empty>没有找到匹配的题目。可以清空关键词或切换筛选。</Empty>:part==="p2"?
      <div className="p2-categories">{categories.map(cat=>{const selected=rows.filter(r=>r.category===cat);if(!selected.length)return null;
        const groups=[...new Set(selected.map(r=>r.group!))];
        return <section key={cat} className="p2-group"><div className="inline-head"><h2>{cat}类</h2><small>{selected.length} 张</small></div>
          {groups.map(group=><div key={group} className="p2-story-group"><h3>{group}</h3><div className="bank-list">{selected.filter(r=>r.group===group).map(row=><RowLink key={row.id} row={row}/>)}</div></div>)}</section>;})}</div>
      :<div className={"bank-list "+part}>{rows.slice((now-1)*batch,now*batch).map(row=><RowLink key={row.id} row={row}/>)}</div>}
    {part!=="p2"&&pages>1&&<div className="pagination"><button className="btn outline" disabled={now<=1} onClick={()=>{update({page:now-1});window.scrollTo(0,0);}}>上一页</button><span>{now} / {pages}</span><button className="btn outline" disabled={now>=pages} onClick={()=>{update({page:now+1});window.scrollTo(0,0);}}>下一页</button></div>}
  </main>;
}
