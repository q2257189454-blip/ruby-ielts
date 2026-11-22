"use client";
import {AudioLines, BookOpen, CircleCheck, Compass, FolderOpen, Headphones, Layers3, Lightbulb, MessagesSquare, Mic, NotebookPen, Sparkles, Wind, Trees, Users, Utensils, Volume2, Monitor, Bike, Camera, Store, Moon, LibraryBig, type LucideIcon} from "lucide-react";
import { useState } from "react";
import {path,Part} from "./types";
export const partIcons={p1:MessagesSquare,p2:Mic,p3:Layers3};
const storyIcons: Record<string,LucideIcon> = {"book-fair":BookOpen,"museum-guide":Compass,"market-birthday":Utensils,"kite-making":Wind,maggie:Camera,"olympic-gymnast":Sparkles,"riverside-park":Trees,"shopping-complex":Store,"poster-print":Monitor,"little-prince":BookOpen,"market-sound":Volume2,"cycling-open-day":Bike};
export const storyColors: Record<string,string>={"book-fair":"pink","museum-guide":"sage","market-birthday":"apricot","kite-making":"mist","olympic-gymnast":"mist",maggie:"lilac","riverside-park":"sage","shopping-complex":"lilac","poster-print":"mist","little-prince":"apricot","market-sound":"lilac","cycling-open-day":"sage"};
export function StoryIcon({id}:{id:string}) {const Icon=storyIcons[id]||Lightbulb;return <span className={"tile-icon "+(storyColors[id]||"sage")}><Icon size={22} strokeWidth={1.65}/></span>;}
export function Logo(){return <a className="brand" href="#/" aria-label="Speakbook 练习首页"><span className="logo-mark"><AudioLines size={24} strokeWidth={2}/></span><span>Speakbook<span className="brand-dot">.</span></span></a>}
export function Nav({section}:{section:string}){
  return <header className="mast"><div className="mast-inner"><Logo/><nav aria-label="主导航">{[
    {id:"home",url:path(),label:"练习首页",icon:Headphones},{id:"bank",url:path("bank","p1"),label:"题库",icon:LibraryBig},
    {id:"stories",url:path("stories"),label:"串题素材",icon:FolderOpen},{id:"phrases",url:path("phrases"),label:"通用语料",icon:BookOpen},{id:"saved",url:path("saved"),label:"我的笔记",icon:NotebookPen}
  ].map(({id,url,label,icon:Icon})=><a href={url} key={id} className={section===id?"active":""} aria-current={section===id?"page":undefined}><Icon size={16}/>{label}</a>)}</nav>
  <a className="owner" href={path("profile")} aria-label="查看口语背景示例"><span className="avatar">S</span><span>背景示例</span></a></div></header>;
}
export function PartLabel({part}:{part:Part}){return <span className={"part-label "+part}>PART {part.slice(1)}</span>}
export function Done({on}:{on:boolean}){return on?<span className="done"><CircleCheck size={15}/>已练</span>:null;}
export function Empty({children}:{children:React.ReactNode}){return <div className="empty"><FolderOpen size={28} strokeWidth={1.5}/><div>{children}</div></div>;}
export function Speak({text,label="听题"}:{text:string;label?:string}) {
  const [state,setState]=useState("");
  function listen(){
    if (!("speechSynthesis" in window)) {setState("当前浏览器不支持朗读。");return;}
    speechSynthesis.cancel();if(state==="正在朗读"){setState("");return;}
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang="en-GB";utterance.rate=.92;
    utterance.onend=()=>setState("");utterance.onerror=e=>setState(["canceled","interrupted"].includes(e.error)?"":"当前浏览器未能朗读。");
    setState("正在朗读");speechSynthesis.speak(utterance);
  }
  return <span className="speak-wrap"><button className="mini" onClick={listen}><Volume2 size={16}/>{state==="正在朗读"?"停止朗读":label}</button>{state&&<small role="status">{state}</small>}</span>;
}

export function Marked({on,children}:{on:boolean;children:React.ReactNode}){return on?<mark className="question-highlight">{children}</mark>:<>{children}</>;}
