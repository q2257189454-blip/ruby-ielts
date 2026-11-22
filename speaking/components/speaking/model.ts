import raw from "@/content/bank.json";
import type {Bank, Part, Question, Story} from "./types";
export const bank = raw as unknown as Bank;
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
export const homeStories=["book-fair","museum-guide","market-birthday"];
export const priorityStories=[...homeStories,...bank.stories.map(s=>s.id).filter(id=>!homeStories.includes(id))];
export function searchMatch(parts:(string|undefined)[],query:string) {return !query.trim() || query.trim().toLocaleLowerCase().split(/\s+/).every(word=>parts.some(p=>p?.toLocaleLowerCase().includes(word)));}
export const questionMatches=(q:Question,search:string)=>searchMatch([q.zh,q.en,q.focusWording,...(q.variants||[])],search);
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
