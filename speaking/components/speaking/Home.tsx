"use client";
import {BookOpenText, ChevronRight, Highlighter, NotebookPen, Shuffle, UserRound} from "lucide-react";
import {bank,collectionCounts,homeStories,p1Items,randomId,shortName,storiesById} from "./model";
import {partInfo,parts,path} from "./types";
import {partIcons, StoryIcon} from "./Common";
export function StoryPreview({id}:{id:string}){
  const story=storiesById.get(id); if(!story)return null;
  return <a className="story-preview" href={path("story",story.id)}><StoryIcon id={story.id}/><span className="story-title"><strong>{shortName(story)}</strong><span lang="en">{story.en}</span></span><span className="story-count">{story.topics.length} 张 P2</span><ChevronRight className="chev" size={16}/></a>;
}
export default function Home(){
  function draw(){const id=randomId(bank.cards);if(id)location.hash=path("p2",id);}
  return <main className="wrap home">
    <section className="hero"><div className="record-art" aria-hidden="true"/><div className="hero-inner">
      <div className="season"><span/>2026 年 9–12 月 · 大陆题库</div>
      <h1>我的口语练习本<span lang="en">Speaking Notebook</span></h1>
      <p>选一张题卡，讲自己的故事，再练几道相关追问。</p>
      <div className="hero-actions"><button className="btn lime" onClick={draw}><Shuffle size={17}/>抽一张 P2 题卡</button><a className="btn glass" href={path("bank","p2","focus")}><Highlighter size={17}/>练文字重点</a></div>
    </div></section>
    <section aria-labelledby="parts-title"><div className="section-head"><div><span className="kicker">Question bank</span><h2 id="parts-title">按考试环节练习</h2></div></div>
    <div className="part-grid">{parts.map(part=>{const Info=partInfo[part],Icon=partIcons[part];return <a className={"part-card "+part} key={part} href={path("bank",part)}>
       <div className="part-top"><span>PART {part.slice(1)}</span><Icon size={23} strokeWidth={1.5}/></div>
       <h3>{Info.name}</h3><p>{Info.intro}</p><footer><strong>{collectionCounts[part]}</strong> {Info.unit}{part==="p1"&&<span> · {p1Items.length} 问</span>}</footer>
    </a>})}</div></section>
    <div className="home-lower"><section aria-labelledby="stories-title"><div className="section-head"><div><span className="kicker">Story bank</span><h2 id="stories-title">串题素材</h2></div><a className="text-link" href={path("stories")}>查看全部 {bank.stories.length} 组</a></div>
      <div className="home-list">{homeStories.map(id=><StoryPreview key={id} id={id}/>)}</div></section>
    <section aria-labelledby="personal-title"><div className="section-head"><div><span className="kicker">My notebook</span><h2 id="personal-title">语料与笔记</h2></div></div>
      <div className="notebook-links"><a href={path("phrases")}><span className="small-icon mist"><BookOpenText/></span><div><strong>通用口语语料</strong><small>表达偏好、讲故事、解释观点</small></div><ChevronRight size={16}/></a><a href={path("profile")}><span className="small-icon sage"><UserRound/></span><div><strong>口语背景示例</strong><small>家乡、学业、经历与日常表达</small></div><ChevronRight size={16}/></a>
      <a href={path("saved")}><span className="small-icon apricot"><NotebookPen/></span><div><strong>我保存的答案</strong><small>回到写过的答案和练过的题卡</small></div><ChevronRight size={16}/></a></div></section></div>
  </main>;
}
