"use client";
import {useEffect,useState} from "react";
import {NotebookState,Part,parts} from "./types";
import {Nav} from "./Common";
import Home from "./Home";
import {bank} from "./model";
import Phrasebook from "./Phrasebook";
import QuestionBank,{Filter,initialFilter} from "./Bank";
import {Absent,Detail,TopicPage} from "./Detail";
import {ArchivedNote,MaterialEditor,Profile,Saved,Stories,StoryPage} from "./Materials";
export default function NotebookView({book}:{book:NotebookState}){
  const [hash,setHash]=useState("");
  const [filters,setFilters]=useState<Record<Part,Filter>>({p1:{...initialFilter},p2:{...initialFilter},p3:{...initialFilter}});
  useEffect(()=>{
    const go=()=>{setHash(location.hash);window.scrollTo(0,0);if("speechSynthesis" in window)speechSynthesis.cancel();};
    go();window.addEventListener("hashchange",go);return()=>window.removeEventListener("hashchange",go);
  },[]);
  let tokens:string[]=[];try{tokens=hash.replace(/^#\/?/,"").split("/").filter(Boolean).map(decodeURIComponent);}catch{tokens=["missing"];}
  const [view="home",id="",from=""]=tokens;let screen;let nav="home";
  if(view==="home")screen=<Home/>;
  else if(view==="bank"){
    nav="bank";const part:Part=parts.includes(id as Part)?id as Part:"p1";screen=<QuestionBank part={part} focusOnly={from==="focus"} filter={filters[part]} setFilter={v=>setFilters(f=>({...f,[part]:v}))} entries={book.entries}/>;
  } else if(view==="topic"){nav="bank";screen=<TopicPage id={id} focusOnly={from==="focus"} book={book}/>;}
  else if(parts.includes(view as Part)){nav="bank";screen=<Detail key={view+id} part={view as Part} id={bank.aliases[id]||id} from={from} book={book}/>;}
  else if(view==="stories"){nav="stories";screen=<Stories book={book}/>;}
  else if(view==="story"){nav="stories";screen=<StoryPage key={id} id={id} initialCard={from} book={book}/>;}
  else if(view==="material"||view==="new"){nav="stories";screen=<MaterialEditor key={view+id} id={view==="new"?"new":id} card={view==="new"?id:undefined} book={book}/>;}
  else if(view==="phrases"){nav="phrases";screen=<Phrasebook key={id} initialPart={parts.includes(id as Part)?id as Part:""}/>;}
  else if(view==="note"){nav="saved";screen=<ArchivedNote key={id} id={id} book={book}/>;}
  else if(view==="profile"){nav="saved";screen=<Profile book={book}/>;}
  else if(view==="saved"){nav="saved";screen=<Saved book={book}/>;}
  else screen=<Absent/>;
  return <><Nav section={nav}/>{screen}<footer className="site-foot"><span>Speakbook<span className="brand-dot">.</span></span><p>雅思口语练习本</p></footer></>;
}
