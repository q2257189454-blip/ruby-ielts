import raw from "@/content/bank.json";
import {loadWorkbook} from "./workbook";
import {categories, type Bank, type Part, type Question, type Story} from "./types";
const base = raw as unknown as Bank;
// Keep established card IDs so saved answers and P3 links still work.
const chapterIds = [
  [14, 5, 15, 13, 20, 16, 7, 4, 44, 3, 10, 19, 21, 17, 11, 2, 18],
  [42, 38, 40, 39, 41, 51, 53, 35, 6, 26, 24, 9, 37, 52, 8, 56, 1, 32, 50],
  [43, 12, 34, 49, 36, 48, 54, 55, 57, 58, 45, 46, 47],
  [28, 27, 29, 30, 31, 23, 22, 25],
];
const originalCards = new Map(base.cards.map(card=>[card.id,card]));
let position=0;
const publicCards=chapterIds.flatMap((ids,chapter)=>ids.map(value=>{
  const id="p2-"+String(value).padStart(2,"0");
  const original=originalCards.get(id)!;
  return {...original,highlight:original.highlight||(id==="p2-34"&&!!originalCards.get("p2-v14")?.highlight),category:categories[chapter],number:String(++position).padStart(2,"0"),titleZh:original.focusZh||original.zh};
}));
const activeIds=new Set(publicCards.map(card=>card.id));
const publicStories=base.stories.map(story=>({...story,topics:story.topics.filter(topic=>activeIds.has(topic.cardId))})).filter(story=>story.topics.length);
const edition={cards:publicCards,stories:publicStories,aliases:{"p2-v14":"p2-34"}};
const workbook = loadWorkbook(edition.cards);
export const personalEdition = workbook!==null;
const notesById = new Map(workbook?.cards.map(c=>[c.id,c]));
export const bank:Bank = {
  ...base,
  cards: edition.cards.map(c=>personalEdition?{
    ...c,...notesById.get(c.id),focusZh:undefined,focusWording:undefined,focusCues:undefined,focusAlternatives:undefined,variants:undefined,
  }:c),
  stories: workbook?.stories??edition.stories,
  aliases: {...base.aliases,...edition.aliases},
};
export const topicById = new Map(bank.topics.map(t=>[t.id,t]));
const foundation=["p1-work-study","p1-hometown","p1-home","p1-area"];
export const orderedTopics=[...foundation.map(id=>topicById.get(id)!).filter(Boolean),...bank.topics.filter(t=>!foundation.includes(t.id))];
export const p1Items=bank.topics.flatMap(t=>t.questions);
export const p1ById=new Map(p1Items.map(q=>[q.id,q]));
export const p1Parents=new Map(bank.topics.flatMap(t=>t.questions.map(q=>[q.id,t] as const)));
export const cardById = new Map(bank.cards.map(c=>[c.id,c]));
export const p3ById=new Map(bank.questions.map(q=>[q.id,q]));
export const storiesById=new Map(bank.stories.map(s=>[s.id,s]));
export const parents=new Map<string, string[]>();
for (const c of bank.cards) {
  for(const f of c.followups) parents.set(f,[...(parents.get(f)||[]),c.id]);
}
export const collectionCounts = {
  p1:bank.topics.length, p2:bank.cards.length, p3:bank.questions.length,
};
export const shortName = (s:Story) => s.zh;
export const homeStories=bank.stories.slice(0,3).map(s=>s.id);
export const priorityStories=[...homeStories,...bank.stories.map(s=>s.id).filter(id=>!homeStories.includes(id))];
export function searchMatch(parts:(string|undefined)[],query:string) {return !query.trim() || query.trim().toLocaleLowerCase().split(/\s+/).every(word=>parts.some(p=>p?.toLocaleLowerCase().includes(word)));}
export function questionMatches(q:Question,search:string) {
  const focusPhrases=q.focusAlternatives?.flatMap(alt=>[alt.en,alt.zh])??[];
  return searchMatch([q.zh,q.en,q.focusWording,q.focusZh,...focusPhrases,...(q.variants||[])],search);
}
export const getQuestion=(part:Part,id:string)=>part==="p1"?p1ById.get(id):part==="p2"?cardById.get(id):p3ById.get(id);
export function questionPart(id:string):Part|undefined {
  if(p1ById.has(id))return "p1"; if(cardById.has(id))return "p2"; if(p3ById.has(id))return "p3";
}
export const randomId=<T extends {id:string}>(items:T[])=>items.length?items[Math.floor(Math.random()*items.length)].id:"";

const profileByQuestion: Record<string,string[]> = {
  "p1-hometown-q01":["home"], "p1-home-q06":["house"], "p1-home-q16":["house"],
  "p1-area-q01":["market-sound"], "p1-area-q02":["home","food"],
  "p1-secondary-school-q02":["school"], "p1-secondary-school-q03":["school"],
  "p1-tidiness-q01":["tidy"], "p1-tidiness-q05":["tidy"], "p1-tidiness-q06":["tidy"],
  "p1-work-study-q01":["gap","major"], "p1-work-study-q02":["major","research"],
  "p1-work-study-q06":["goal"], "p1-work-study-q12":["gap","intern"],
  "p1-work-study-q19":["goal"], "p1-computers-q02":["tech"],
};
export function personalLines(id:string) {
  const keys=profileByQuestion[id]||[];
  return keys.map(key=>bank.profile.find(row=>row.id===key)).filter(row=>row!==undefined);
}
