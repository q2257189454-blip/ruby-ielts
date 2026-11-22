"use client";
import {useEffect,useState} from "react";
import {BookOpenText,ChevronRight,Headphones,Layers3,Link2,MessagesSquare,NotebookPen,Shuffle,UserRound} from "lucide-react";
import {cardById,getQuestion,p1ById,p1Parents,p3ById,parents,personalLines,randomId,shortName,storiesById,topicById} from "./model";
import {Card,NotebookState,Part,partInfo,path,Question,readLocal,writeLocal} from "./types";
import {Done,Empty,Marked,PartLabel,Speak,StoryIcon} from "./Common";
import {AnswerEditor,MarkDone,Recorder,TimerPanel} from "./Practice";

export function Absent(){
  return <main className="wrap inner-page"><Empty>这个条目暂时找不到。<a className="text-link" href={path("bank","p1")}>返回题库</a></Empty></main>;
}
export function Sample({q,card}:{q:Question;card?:Card}){
  const [show,setShow]=useState(true),[chinese,setChinese]=useState(true);
  useEffect(()=>setChinese(readLocal("sample-chinese",true)),[]);
  function toggleChinese(){setChinese(!chinese);writeLocal("sample-chinese",!chinese);}
  const english=q.sample.split(/\n\s*\n/),translation=q.sampleZh.split(/\n\s*\n/);
  return <section className="panel sample-panel">
    <div className="inline-head"><div><span className="kicker">Model answer</span><h2>{card?"两分钟完整示范":"简短回答示例"}</h2></div><div className="sample-tools"><Speak text={q.sample} label="听范答"/>{show&&<button className="mini" onClick={toggleChinese} aria-pressed={chinese}>{chinese?"隐藏中文":"显示中文"}</button>}<button className="mini" onClick={()=>setShow(!show)} aria-expanded={show}>{show?"收起范答":"展开范答"}</button></div></div>
    {card&&<div className="memory-path"><span>记忆顺序</span><ol>{card.outline.map((x,i)=><li key={i}>{x}</li>)}</ol></div>}
    {show&&<div className="sample-text">{english.map((paragraph,i)=><div key={i} className="answer-pair"><p lang="en">{paragraph}</p>{chinese&&<p className="answer-translation" lang="zh-CN">{translation[i]}</p>}</div>)}</div>}
    {!card&&q.sampleNote&&<p className="replaceable"><strong>可换成你的细节</strong> {q.sampleNote}</p>}
    {card&&<p className="replaceable"><strong>可换成你的细节</strong> {card.replaceable}</p>}
  </section>;
}
function QuestionLinks({ids,context,book,part="p3"}:{ids:string[];context?:string;book:NotebookState;part?:"p1"|"p3"}){
  return <div className="linked-list">{ids.map(id=>{
    const q=(part==="p1"?p1ById:p3ById).get(id);if(!q)return null;
    return <a key={id} href={path(part,id,...(context?[context]:[]))}><span><strong lang="en"><Marked on={q.highlight}>{q.highlight&&q.focusWording?q.focusWording:q.en}</Marked></strong>{q.zh&&<small>{q.zh}</small>}</span><Done on={book.entries["done:"+id]?.body==="1"}/><ChevronRight size={16}/></a>;
  })}</div>;
}
export function TopicPage({id,focusOnly,book}:{id:string;focusOnly:boolean;book:NotebookState}){
  const topic=topicById.get(id);if(!topic)return <Absent/>;
  const focusCount=topic.questions.filter(q=>q.highlight).length;
  const qs=topic.questions.filter(q=>!focusOnly||q.highlight);
  return <main className="wrap inner-page slim"><a className="crumb" href={path("bank","p1",...(focusOnly?["focus"]:[]))}>P1 题库</a>
    <div className="page-heading"><div><PartLabel part="p1"/><h1><Marked on={focusCount>0}>{topic.zh}</Marked></h1><p lang="en">{topic.en}</p></div>
    {!!qs.length&&<button className="btn dark" onClick={()=>location.hash=path("p1",randomId(qs),...(focusOnly?["focus"]:[]))}><Shuffle size={16}/>抽一道小问</button>}</div>
    <section className="panel"><div className="inline-head"><h2>{focusOnly?"文字重点":"话题小问"}</h2><span className="sub">{qs.length} 道</span></div>{focusCount>0&&<a className="topic-focus-link" href={path("topic",topic.id,...(focusOnly?[]:["focus"]))}>{focusOnly?"查看本组全部小问":"只练本组 "+focusCount+" 道重点"}</a>}<QuestionLinks part="p1" ids={qs.map(q=>q.id)} context={focusOnly?"focus":undefined} book={book}/></section>
    <a className="row-link" href={path("profile")}><UserRound size={17}/>查看背景表达示例</a></main>;
}
function Followups({card,book}:{card:Card;book:NotebookState}){
  const original=!!card.followups.length, sequence=original?card.followups:card.relatedFollowups||[];
  if(!sequence.length)return null;
  const visible=Math.max(5,sequence.filter(id=>p3ById.get(id)?.highlight).length);
  return <section className="panel follow" id="related-p3"><div className="inline-head"><div><span className="kicker">Part 3</span><h2>{original?"这张卡的 P3 追问":"同主题 P3 练习"}</h2></div>
    <a className="btn soft" href={path("p3",sequence[0],card.id)}><MessagesSquare size={16}/>开始连练</a></div>
    <QuestionLinks ids={sequence.slice(0,visible)} context={card.id} book={book}/>{sequence.length>visible&&<details className="fold"><summary>更多追问 · {sequence.length-visible} 道</summary><QuestionLinks ids={sequence.slice(visible)} context={card.id} book={book}/></details>}</section>;
}
function MaterialLinks({card,book}:{card:Card;book:NotebookState}){
  const story=storiesById.get(card.storyId),own=Object.values(book.entries).filter(r=>r.id.startsWith("material:")&&r.cards.includes(card.id));
  return <section className="panel material-panel"><div className="tiny-head"><Layers3 size={20}/><h2>同一素材还能练什么</h2></div>
    {story&&<div className="angle-card"><a className="angle-title" href={path("story",story.id,card.id)}><StoryIcon id={story.id}/><span><strong>{shortName(story)}</strong><small>{story.topics.length} 张 P2 完整范答</small></span><ChevronRight size={16}/></a></div>}
    {own.map(s=><a className="row-link" key={s.id} href={path("material",s.id.slice(9))}><NotebookPen size={16}/>{s.title}</a>)}
    <a className="text-link" href={path("new",card.id)}>添加自己的素材</a></section>;
}
const compact=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
export function Detail({part,id,from,book}:{part:Part;id:string;from?:string;book:NotebookState}){
  const q=getQuestion(part,id);if(!q)return <Absent/>;
  const card=part==="p2"?cardById.get(id):undefined,topic=part==="p1"?p1Parents.get(id):undefined;
  const fromCard=part==="p3"&&from?cardById.get(from):undefined;
  const ctx=fromCard&&(fromCard.followups.includes(id)||fromCard.relatedFollowups?.includes(id))?fromCard:undefined;
  const linked=(parents.get(id)||[]).map(x=>cardById.get(x)!).filter(Boolean),chosen=ctx||linked[0];
  const focusOnly=from==="focus",sequence=topic?topic.questions.filter(x=>!focusOnly||x.highlight).map(x=>x.id):part==="p3"&&chosen?(chosen.followups.length?chosen.followups:chosen.relatedFollowups||[]):[];
  const pos=sequence.indexOf(id);
  const nextRoute=(next:string)=>path(part,next,...(ctx||chosen?[chosen!.id]:focusOnly?["focus"]:[]));
  const back=topic?path("topic",topic.id,...(focusOnly?["focus"]:[])):ctx?path("p2",ctx.id):path("bank",part,...(focusOnly?["focus"]:[]));
  const follow=card&&(card.followups[0]||card.relatedFollowups?.[0]), personal=topic?personalLines(id):[];
  const focusTitle=q.focusWording&&compact(q.focusWording)!==compact(q.en)?q.focusWording:undefined;
  const focusCues=card?.focusCues?.length&&card.focusCues.some((x,i)=>compact(x)!==compact(card.cues[i]||""))?card.focusCues:[];
  return <main className="wrap inner-page"><a className="crumb" href={back}>{topic?topic.zh+" · P1 话题":ctx?"返回 P2 · "+ctx.zh:part.toUpperCase()+" 题库"}</a>
    <div className="detail-grid"><article>
      <section className={"panel question-card "+part}><div className="inline-head"><div className="part-line"><PartLabel part={part}/><span>{card?card.category+"类":partInfo[part].name}</span></div><Speak text={q.en}/></div>
        {card&&<p className="question-title-cn">{card.zh}</p>}<h1 lang="en"><Marked on={q.highlight&&!focusTitle}>{q.en}</Marked></h1>{!card&&<p className="translation">{q.zh}</p>}
        {focusTitle&&<p className="focus-wording"><small>文字重点问法</small><mark className="question-highlight" lang="en">{focusTitle}</mark></p>}
        {card&&<div className="cuebox"><strong lang="en">You should say</strong><ul>{card.cues.map((cue,i)=><li key={i} lang="en">{cue}</li>)}</ul>
          {!!card.cuesZh?.length&&<details className="fold"><summary>查看中文提示</summary><ul>{card.cuesZh.map((cue,i)=><li key={i}>{cue}</li>)}</ul></details>}
          {!!focusCues.length&&<details className="fold"><summary>文字重点的提示点</summary><ul>{focusCues.map((cue,i)=><li key={i} lang="en"><Marked on>{cue}</Marked></li>)}</ul></details>}
        </div>}
        {!!q.variants?.length&&<details className="fold alternate-prompts"><summary>同题的其他问法</summary><ul>{q.variants.map(v=><li key={v} lang="en">{v}</li>)}</ul></details>}
        {q.context&&<div className="cuebox clarify"><strong>讨论背景</strong>{q.context.en&&<p lang="en">{q.context.en}</p>}<p>{q.context.zh}</p></div>}
        <div className="question-tools"><MarkDone id={id} title={q.en} book={book}/>{card&&follow&&<a className="btn soft" href={path("p3",follow,card.id)}><MessagesSquare size={16}/>{card.followups.length?"练对应 P3":"练同主题 P3"}</a>}</div>
      </section>
      <Sample key={id} q={q} card={card}/>
      {part==="p3"&&chosen&&<section className="panel context-panel"><div className="tiny-head"><Link2 size={18}/><h2>{ctx&&!ctx.followups.includes(id)?"同主题 P2 题卡":"对应的 P2 题卡"}</h2></div>{(ctx&&!ctx.followups.includes(id)?[ctx,...linked]:linked).map(c=><a key={c.id} className="row-link" href={path("p2",c.id)}><Marked on={c.highlight}>{c.zh}</Marked><ChevronRight size={15}/></a>)}</section>}
      {pos>=0&&sequence.length>1&&<div className="series"><div><small>{topic?"同一话题":"同组追问"}</small><strong>{pos+1} / {sequence.length}</strong></div><div>{pos>0&&<a className="btn outline" href={nextRoute(sequence[pos-1])}>上一题</a>}{pos<sequence.length-1&&<a className="btn soft" href={nextRoute(sequence[pos+1])}>下一题</a>}</div></div>}
      {card&&<Followups card={card} book={book}/>}
      <AnswerEditor key={"answer-"+id} id={id} title={q.en} book={book} sample={q.sample}/>
    </article><aside className="side-stack"><TimerPanel key={id} part={part}/><section className="panel"><div className="tiny-head"><Headphones size={18}/><h2>口语回听</h2></div><Recorder id={id} key={id}/></section>
      {card&&<MaterialLinks card={card} book={book}/>}
      <section className="panel"><div className="tiny-head"><BookOpenText size={18}/><h2>通用口语语料</h2></div><a href={path("phrases",part)} className="text-link">查看适合 Part {part.slice(1)} 的说法</a></section>
      {topic&&<section className="panel side-idea"><div className="tiny-head"><UserRound size={18}/><h2>背景表达示例</h2></div>{personal.map(line=><div className="personal-line" key={line.id}><small>{line.label}</small><p lang="en">{line.en}</p></div>)}<a href={path("profile")} className="text-link">查看背景示例</a></section>}
    </aside></div></main>;
}
