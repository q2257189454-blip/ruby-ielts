export type Part = "p1" | "p2" | "p3";
export const categories = ["人物", "事件", "事物", "地点"] as const;
export type Category = typeof categories[number];
export interface Question {
  id: string;
  en: string;
  zh: string;
  sample: string;
  sampleZh: string;
  highlight: boolean;
  variants?: string[];
  sampleNote?: string;
  focusWording?: string;
  focusZh?: string;
  focusAlternatives?: {en: string; zh: string; cues?: string[]}[];
  context?: {en?: string; zh: string};
}
export interface Topic {
  priority?: boolean;
  id: string;
  zh: string;
  en: string;
  questions: Question[];
}
export interface Card extends Question {
  titleZh: string;
  number: string;
  category: Category;
  storyId: string;
  cues: string[];
  cuesZh?: string[];
  focusCues?: string[];
  followups: string[];
  relatedFollowups?: string[];
  outline: string[];
  replaceable: string;
}
export interface Angle {
  cardId: string; angle: string; opening?: string; zh?: string; en?: string; code?: string; status?: string;
}
export interface Story {
  id: string; zh: string; en: string;
  coreEn: string; coreZh: string; coreTranslation: string; keywords: string[]; topics: Angle[]; extensions: Angle[];
  discussions?: {en: string; zh: string; idea: string}[];
}
export interface ProfileLine {id: string; label: string; en: string; zh: string; topics?: string[]; prompt?: string; note?: string}
export interface Bank {
  aliases: Record<string,string>; topics: Topic[]; cards: Card[]; questions: Question[]; stories: Story[]; profile: ProfileLine[];
}
export interface Entry {
  id: string; title: string; body: string; cards: string[]; updated: number; revision: number;
}
export interface EntryInput {id: string; title: string; body: string; cards?: string[]}
export interface NotebookState {
  entries: Record<string, Entry>; ready: boolean; mode: "account" | "device" | "local" | "loading";
  save: (data: EntryInput) => Promise<string>;
}
export const parts: Part[] = ["p1", "p2", "p3"];
export const partInfo = {
  p1: {name:"日常问答", english:"Everyday questions", unit:"个话题", intro:"用自己的背景，回答生活里的小问题。"},
  p2: {name:"话题陈述", english:"The long turn", unit:"张题卡", intro:"从一个熟悉的故事开始，练习两分钟陈述。"},
  p3: {name:"延伸讨论", english:"Further discussion", unit:"道追问", intro:"从个人经历出发，谈普遍现象和自己的观点。"},
};
export const path = (...segments: string[]) => "#/" + segments.map(encodeURIComponent).join("/");
export const readLocal = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem("speakbook-v1:" + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
export const writeLocal = (key: string, value: unknown): boolean => {
  try {localStorage.setItem("speakbook-v1:" + key, JSON.stringify(value)); return true;} catch {return false;}
};
