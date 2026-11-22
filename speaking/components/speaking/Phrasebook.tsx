"use client";
import {useState} from "react";
import {ArrowUpRight,Search,X} from "lucide-react";
import {phraseGroups} from "@/content/phrases";
import {Empty} from "./Common";
import {searchMatch} from "./model";
import {Part,parts,path} from "./types";

export default function Phrasebook({initialPart}:{initialPart:Part|""}){
  const [part,setPart]=useState<Part|"">(initialPart),[query,setQuery]=useState("");
  const groups=phraseGroups.filter(g=>!part||g.parts.includes(part)).map(group=>{
    const matches=searchMatch([group.name,group.use],query);
    const phrases=group.phrases.filter(p=>matches||searchMatch([p.phrase,p.meaning,p.example,p.translation],query));
    return {...group,phrases};
  }).filter(g=>g.phrases.length);
  return <main className="wrap inner-page"><div className="page-heading"><div><span className="kicker">Phrasebook</span><h1>通用口语语料</h1><p>找一句你说得顺的表达，换进自己的细节，再回到题目练一遍。</p></div></div>
    <div className="filters phrase-filters"><label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索中文用途、英文表达或例句" aria-label="搜索语料"/>{query&&<button aria-label="清空搜索" onClick={()=>setQuery("")}><X size={16}/></button>}</label>
    <div className="category-choices" aria-label="按考试环节筛选">{(["",...parts] as const).map(p=><button className={p===part?"selected":""} key={p} onClick={()=>setPart(p)} aria-pressed={p===part}>{p?"Part "+p.slice(1):"全部"}</button>)}</div></div>
    <div className="list-caption"><strong>{groups.length} 个用途</strong><span>{groups.reduce((sum,g)=>sum+g.phrases.length,0)} 条表达</span></div>
    {groups.length?<div className="phrase-grid">{groups.map(g=><section className="panel phrase-card" key={g.name}><div className="inline-head"><h2>{g.name}</h2><span className="phrase-parts">{g.parts.map(p=>p.toUpperCase()).join(" · ")}</span></div><p className="phrase-use">{g.use}</p>
      <dl>{g.phrases.map(p=><div className="expression" key={p.phrase}><dt lang="en">{p.phrase}</dt><dd>{p.meaning}</dd><dd className="phrase-example" lang="en">{p.example}</dd><dd lang="zh-CN" className="phrase-translation">{p.translation}</dd></div>)}</dl>
      <a className="text-link" href={path(g.practice[0],g.practice[1])}>用到「{g.practice[2]}」<ArrowUpRight size={15}/></a></section>)}</div>:<Empty>没有找到匹配的表达。试试“原因”“朋友”或 time。</Empty>}
  </main>;
}
