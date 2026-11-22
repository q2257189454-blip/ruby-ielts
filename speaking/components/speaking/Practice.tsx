"use client";
import {useEffect,useRef,useState} from "react";
import {CircleCheck,Mic,Pause,Play,RotateCcw,Save,Square,Timer,Download} from "lucide-react";
import {NotebookState,Part,readLocal,writeLocal} from "./types";

export function AnswerEditor({id,title,book,sample,label="我的答案",hint="写下英文答案，或先记几个中英文提示词。"}:{id:string;title:string;book:NotebookState;sample?:string;label?:string;hint?:string}) {
  const key="answer:"+id, draftKey="draft:"+key, saved=book.entries[key]?.body||"";
  const [text,setText]=useState(""),[dirty,setDirty]=useState(false),[status,setStatus]=useState(""),[working,setWorking]=useState(false);
  useEffect(()=>{const draft=readLocal<string|null>(draftKey,null);if(draft!==null){setText(draft);setDirty(draft!==saved);}else if(!dirty)setText(saved);},[saved,draftKey,dirty]);
  function edit(value:string){setText(value);setDirty(value!==saved);writeLocal(draftKey,value);setStatus("");}
  async function persist(){setWorking(true);try{const msg=await book.save({id:key,title,body:text});writeLocal(draftKey,null);setDirty(false);setStatus(msg);}catch(e){setStatus((e as Error).message);}finally{setWorking(false);}}
  return <section className="panel editor"><div className="inline-head"><h2>{label}</h2>{dirty&&<span className="dot-msg">草稿</span>}</div><label className="sr" htmlFor={"field-"+id}>{label}</label>
    <textarea id={"field-"+id} value={text} maxLength={30000} onChange={e=>edit(e.target.value)} placeholder={hint} rows={5}/>
    <div className="actions"><button className="btn dark" disabled={working||!book.ready||!dirty} onClick={persist}><Save size={16}/>{working?"保存中…":"保存"+(label==="我的答案"?"答案":"笔记")}</button><>{sample&&!text&&!saved&&book.ready&&<button className="btn soft" onClick={()=>edit(sample)}>用示例起草</button>}</><small role="status">{status||(!dirty&&saved?"已有保存的内容":"")}</small></div></section>;
}
export function MarkDone({id,title,book}:{id:string;title:string;book:NotebookState}){
  const marked=book.entries["done:"+id]?.body==="1";
  const [busy,setBusy]=useState(false),[feedback,setFeedback]=useState("");
  async function toggle(){setBusy(true);try{const msg=await book.save({id:"done:"+id,title,body:marked?"0":"1"});setFeedback(msg);}catch(e){setFeedback((e as Error).message);}finally{setBusy(false);}}
  return <div className="completion"><button className={"btn "+(marked?"soft":"outline")} disabled={busy||!book.ready} onClick={toggle} aria-pressed={marked}><CircleCheck size={16}/>{marked?"已练过":"标记为已练"}</button>{feedback&&<small role="status">{feedback}</small>}</div>;
}
export function TimerPanel({part}:{part:Part}){
  const specs=part==="p2"?[{key:"prep",text:"准备",sec:60},{key:"speak",text:"陈述",sec:120}]:[{key:"speak",text:"作答",sec:part==="p1"?30:60}];
  const [phase,setPhase]=useState(0),[left,setLeft]=useState(specs[0].sec),[running,setRunning]=useState(false),[info,setInfo]=useState("");
  const deadline=useRef(0);
  function choose(i:number){setPhase(i);setLeft(specs[i].sec);setRunning(false);setInfo("");}
  function start(i:number,seconds:number){setPhase(i);setLeft(seconds);deadline.current=Date.now()+seconds*1000;setInfo("");setRunning(true);}
  useEffect(()=>{if(!running)return;const tick=()=>{
    const remain=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setLeft(remain);
    if(remain===0){
      if(part==="p2"&&phase===0){
        const nextEnd=deadline.current+120000;deadline.current=nextEnd;setPhase(1);setLeft(Math.max(0,Math.ceil((nextEnd-Date.now())/1000)));setInfo("准备结束，开始陈述。");
      } else {setRunning(false);setInfo("本轮计时结束。");}
    }
  };tick();const timer=window.setInterval(tick,200);return()=>clearInterval(timer);},[running,phase,part]);
  return <section className="panel timer-panel"><div className="tiny-head"><Timer size={18}/><h2>练习计时</h2></div><div className="timer-modes">{specs.map((s,i)=><button key={s.key} onClick={()=>choose(i)} className={phase===i?"selected":""} aria-pressed={phase===i}>{s.text} {s.sec<60?s.sec+" 秒":s.sec/60+" 分钟"}</button>)}</div>
    <output className="timer-digits" aria-label="剩余练习时间">{String(Math.floor(left/60)).padStart(2,"0")}<span>:</span>{String(left%60).padStart(2,"0")}</output>
    <div className="actions"><button className="btn dark" onClick={()=>running?setRunning(false):start(phase,left||specs[phase].sec)}>{running?<Pause size={15}/>:<Play size={15}/>} {running?"暂停":left===specs[phase].sec||!left?"开始":"继续"}{!running&&left===specs[phase].sec?specs[phase].text:""}</button><button className="icon-button" onClick={()=>choose(phase)} aria-label="重置计时"><RotateCcw size={16}/></button></div>
    <small aria-live="polite">{info||(part==="p2"?"准备结束后，自动进入两分钟陈述。":"单题自练参考时长，可随时暂停。")}</small></section>;
}
export function Recorder({id}:{id:string}){
  const [recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[src,setSrc]=useState(""),[type,setType]=useState(""),[status,setStatus]=useState("");
  const recorder=useRef<MediaRecorder|null>(null), mounted=useRef(true),audioURL=useRef(""),streamRef=useRef<MediaStream|null>(null);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;const r=recorder.current;if(r&&r.state!=="inactive")r.stop();streamRef.current?.getTracks().forEach(t=>t.stop());if(audioURL.current) URL.revokeObjectURL(audioURL.current);};},[]);
  async function record(){
    if(recording){if(recorder.current?.state==="recording")recorder.current.stop();return;}
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setStatus("此浏览器不支持录音，可以继续计时练习。");return;}
    setBusy(true);setStatus("");
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(!mounted.current){stream.getTracks().forEach(t=>t.stop());return;}
      streamRef.current=stream;const r=new MediaRecorder(stream),chunks:BlobPart[]=[];recorder.current=r;
      r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      r.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(!mounted.current)return;const mime=r.mimeType||"audio/webm",blob=new Blob(chunks,{type:mime});
        if(audioURL.current)URL.revokeObjectURL(audioURL.current);audioURL.current=URL.createObjectURL(blob);setType(mime.includes("mp4")?"m4a":mime.includes("ogg")?"ogg":"webm");setSrc(audioURL.current);setRecording(false);setStatus("");};
      r.start();setRecording(true);
    }catch{streamRef.current?.getTracks().forEach(t=>t.stop());setStatus("未能使用麦克风。请检查浏览器的麦克风权限。");}finally{if(mounted.current)setBusy(false);}
  }
  return <div className="recorder"><button className="btn outline" disabled={busy} onClick={record}>{recording?<Square size={15}/>:<Mic size={15}/>} {recording?"结束录音":busy?"连接麦克风…":src?"重新录音":"录下这次回答"}</button>
    {src&&<><audio aria-label="回听本次回答" controls src={src}/><a href={src} download={id+"."+type} className="text-link"><Download size={14}/>下载录音</a></>}
    <small role="status">{status||(recording?"录音中…":"录音可回听，离开这道题前可下载。")}</small></div>;
}
