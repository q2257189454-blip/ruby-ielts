import type {Card, Story} from "./types";

type CardNotes = Pick<Card,"id"|"en"|"zh"|"titleZh"|"cues"|"cuesZh"|"storyId"|"outline"|"replaceable"|"sample"|"sampleZh">;
type Workbook = {version:1; cards:CardNotes[]; stories:Story[]};
const storageKey = "speakbook-v1:p2-private-workbook";
const tag = "spk:practiceCards";
const record = (v:unknown): v is Record<string,unknown> => typeof v==="object" && v!==null;
const str = (v:unknown): v is string => typeof v==="string" && v.length>0 && v.length<7200;
const strings = (v:unknown): v is string[] => Array.isArray(v) && v.length>0 && v.length<20 && v.every(str);

function parse(value:string, cards:Card[]):Workbook {
  const doc:unknown=JSON.parse(value);
  if(!record(doc)||doc.version!==1||!Array.isArray(doc.cards)||doc.cards.length!==cards.length||!Array.isArray(doc.stories)||!doc.stories.length||doc.stories.length>cards.length)throw Error();
  const ids=new Set(cards.map(c=>c.id));
  const stories:Story[]=doc.stories.map(s=>{
    if(!record(s)||!str(s.id)||!str(s.zh)||!str(s.en)||!str(s.coreZh)||!str(s.coreEn)||!str(s.coreTranslation)||!strings(s.keywords))throw Error();
    return {id:s.id,zh:s.zh,en:s.en,coreZh:s.coreZh,coreEn:s.coreEn,coreTranslation:s.coreTranslation,keywords:s.keywords,topics:[],extensions:[]};
  });
  const byStory=new Map(stories.map(s=>[s.id,s]));
  if(byStory.size!==stories.length)throw Error();
  const notes:CardNotes[]=doc.cards.map(c=>{
    if(!record(c)||!str(c.id)||!ids.delete(c.id)||!str(c.en)||!str(c.zh)||!str(c.titleZh)||!strings(c.cues)||!strings(c.cuesZh)||c.cues.length!==c.cuesZh.length||!str(c.storyId)||!strings(c.outline)||!str(c.replaceable)||!str(c.sample)||!str(c.sampleZh))throw Error();
    const story=byStory.get(c.storyId);
    if(!story)throw Error();
    story.topics.push({cardId:c.id,angle:c.replaceable});
    return {id:c.id,en:c.en,zh:c.zh,titleZh:c.titleZh,cues:c.cues,cuesZh:c.cuesZh,storyId:c.storyId,outline:c.outline,replaceable:c.replaceable,sample:c.sample,sampleZh:c.sampleZh};
  });
  if(ids.size||stories.some(s=>s.topics.length===0))throw Error();
  return {version:1,cards:notes,stories};
}
export function loadWorkbook(cards:Card[]):Workbook|null {
  try {
    const value=localStorage.getItem(storageKey);
    return value?parse(value,cards):null;
  } catch {return null;}
}
export async function importWorkbook(file:File,cards:Card[]):Promise<void> {
  if(file.size>15*1024*1024)throw Error("请选择本题库的 PDF 练习册。");
  let workbook:Workbook;
  try {
    const data=new TextDecoder("latin1").decode(await file.arrayBuffer());
    const startTag="<"+tag+">", begin=data.indexOf(startTag);
    const end=begin<0?-1:data.indexOf("</"+tag+">",begin+startTag.length);
    if(!data.startsWith("%PDF-")||begin<0||end<0||end-begin>1024*1024)throw Error();
    const bytes=Uint8Array.from(atob(data.slice(begin+startTag.length,end)),c=>c.charCodeAt(0));
    workbook=parse(new TextDecoder().decode(bytes),cards);
  } catch {throw Error("这份 PDF 没有与当前 57 题匹配的个人素材。请选择配套练习册。");}
  try {localStorage.setItem(storageKey,JSON.stringify(workbook));}
  catch {throw Error("当前浏览器没有足够空间保存练习册。请换一个普通浏览器窗口重试。");}
}
export function clearWorkbook(){localStorage.removeItem(storageKey);}
