import {useCallback,useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import NotebookView from "../components/speaking/NotebookView";
import {Entry,EntryInput,NotebookState,readLocal,writeLocal} from "../components/speaking/types";

const recordPrefix="pages-entry:";

function readEntries(){
  const records:Record<string,Entry>={};
  const prefix="speakbook-v1:"+recordPrefix;
  try {
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key?.startsWith(prefix))continue;
      const id=key.slice(prefix.length),entry=readLocal<Entry|null>(recordPrefix+id,null);
      if(entry&&entry.id===id)records[id]=entry;
    }
  } catch { /* Entries are available after the browser grants local storage. */ }
  return records;
}
function PublicNotebook(){
  const [entries,setEntries]=useState(readEntries);
  useEffect(()=>{
    function refresh(event:StorageEvent){
      if(event.key===null||event.key.startsWith("speakbook-v1:"+recordPrefix))setEntries(readEntries());
    }
    window.addEventListener("storage",refresh);
    return ()=>window.removeEventListener("storage",refresh);
  },[]);
  const save=useCallback(async(input:EntryInput)=>{
    const {id,title,body,cards=[]}=input;
    const previous=readLocal<Entry|null>(recordPrefix+id,null);
    const entry:Entry={id,title,body,cards,updated:Date.now(),revision:(previous?.revision??0)+1};
    if(!writeLocal(recordPrefix+id,entry))throw new Error("浏览器暂时无法保存。请先复制这段内容。");
    setEntries(current=>({...current,[id]:entry}));
    return "已保存到当前浏览器";
  },[]);
  const book:NotebookState={entries,ready:true,mode:"local",save};
  return <NotebookView book={book}/>;
}
createRoot(document.getElementById("notebook")!).render(<PublicNotebook/>);
