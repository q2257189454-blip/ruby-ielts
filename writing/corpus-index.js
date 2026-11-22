import {model, sentenceText} from './model.js';
import {families, annotations} from './corpus-annotations.js';
import {teachingPhrases} from './corpus-lexicon.js';
import {opening, positions, mechanisms, examples, concerns, responses} from './corpus-guide.js';

export const norm = value => String(value ?? '').normalize('NFKC').toLowerCase()
  .replace(/[‘’]/g,"'").replace(/[‐‑–]/g,'-').replace(/\s+/g,' ').trim();
const byName = (a,b) => a.localeCompare(b,'zh-CN');
export const familyById = new Map(families.map(f => [f.id,f]));

function originalFields(d,version) {
  const fields = {};
  for (const [pi,p] of model(d,version).entries()) {
    for (const s of p.sentences) {
      let start = 0;
      const sentence = sentenceText(s);
      for (const w of s.pieces) {
        if (w.key) fields[w.key] = {text:w.text, zh:w.zh, sentence, translation:s.zh, start, pi, label:p.label};
        start += w.text.length;
      }
    }
  }
  return fields;
}
export function createIndex(essays) {
  const records = essays.map(d => {
    const n = annotations[d.id];
    const fields = originalFields(d,'full');
    const topics = [...new Set([d.topic,...(d.tags || [])])];
    const search = norm([d.title,d.prompt,d.q,d.type,d.stanceSummary,...topics,n.keep,
      ...Object.values(fields).flatMap(f => [f.text,f.zh]), ...[n.a,n.b].map(([id])=>familyById.get(id).name)].join('\n'));
    return {d,n,fields,topics,search};
  });
  const counts = {};
  for (const r of records) for (const t of r.topics) counts[t] = (counts[t] || 0) + 1;
  const primary = new Set(essays.map(d => d.topic));
  const sortedTopics = Object.keys(counts).sort((a,b) => counts[b]-counts[a] || byName(a,b));
  return {records,counts,primary,sortedTopics};
}
export function fieldsFor(record,edition='full') {
  if (edition !== 'simple') return record.fields;
  return record.simpleFields ??= originalFields(record.d,'simple');
}
export function inScope(records,topic,type,query='') {
  const terms = norm(query).split(' ').filter(Boolean);
  return records.filter(r => (!topic || r.topics.includes(topic)) && (!type || r.d.type===type)
    && terms.every(q=>r.search.includes(q)));
}
export function classifySlot(key) {
  if (key==='t') return ['开头改写方式',opening,r=>r.n.o];
  if (key==='s' || key==='z0') return ['立场写法',positions,r=>r.n.p];
  if (key==='b4') return ['举例方式',examples,r=>r.n.ex];
  if (['r0','r1','r2','r5'].includes(key)) return ['顾虑类型',concerns,r=>r.n.risk];
  if (['r3','rAction','r6'].includes(key)) return ['回应方式',responses,r=>r.n.reply];
  const body = key[0]==='a' || key==='z1' ? 'a' : 'b';
  return ['本段的论证思路',mechanisms,r=>r.n[body][1]];
}
export function groupHits(hits, keyFn) {
  const groups = new Map();
  for (const hit of hits) {
    const id = keyFn(hit);
    if (!groups.has(id)) groups.set(id,{id,hits:[],docs:new Set()});
    const group = groups.get(id);
    group.hits.push(hit);
    group.docs.add(hit.r.d.id);
  }
  return [...groups.values()].sort((a,b)=>b.docs.size-a.docs.size || b.hits.length-a.hits.length || byName(a.id,b.id));
}
export function ideaGroups(records, general) {
  const hits = records.flatMap(r=>['a','b'].map(body=>({r,key:body+'0',body})));
  return groupHits(hits,h=>h.r.n[h.body][general?1:0]);
}

const tokenPattern = /[\p{L}\p{N}]+(?:['’‘‐‑–-][\p{L}\p{N}]+)*/gu;
const tokens = s => [...s.matchAll(tokenPattern)].map(m=>({w:norm(m[0]),i:m.index,end:m.index+m[0].length}));
export function buildLexicon(records) {
  const terms = [], forms = new Map(), candidates = new Map();
  function addForm(term,raw) {
    const form=norm(raw);
    if (!form || forms.has(form)) return;
    forms.set(form,term);
    term.forms.push(form);
    const words=tokens(form).map(t=>t.w);
    if (!words.length) return;
    if (!candidates.has(words[0])) candidates.set(words[0],[]);
    candidates.get(words[0]).push({term,form,words});
  }
  function add(en,zh,tip,aliases,core) {
    const old=forms.get(norm(en));
    if (old) {
      for (const v of aliases) addForm(old,v);
      return;
    }
    const term={id:norm(en),en,zh,tip,core,forms:[],hits:[]};
    terms.push(term);
    for (const v of [en,...aliases]) addForm(term,v);
  }
  for (const [en,zh,tip,...aliases] of teachingPhrases) add(en,zh,tip,aliases,true);
  for (const {d} of records) for (const [en,zh] of d.v) add(en,zh,'',[],false);
  for (const r of records) for (const [key,f] of Object.entries(r.fields)) {
    const words=tokens(f.text);
    words.forEach((word,i)=>{
      for (const {term,form,words:pattern} of candidates.get(word.w) || []) {
        const last=words[i+pattern.length-1];
        if (!last || !pattern.every((w,j)=>words[i+j].w===w)) continue;
        const found=f.text.slice(word.i,last.end);
        if (norm(found)===form) term.hits.push({r,key,start:word.i,end:last.end,form:found});
      }
    });
  }
  return terms.filter(t=>t.hits.length).map(t=>({...t,search:norm([t.en,t.zh,t.tip,...t.forms].join(' '))}));
}
export function rankedPhrases(lexicon,records,query='',coreOnly=false) {
  const scope = new Set(records.map(r=>r.d.id));
  const q = norm(query);
  const list=[];
  for (const t of lexicon) {
    if ((q && !t.search.includes(q)) || (coreOnly && !t.core)) continue;
    const hits=t.hits.filter(h=>scope.has(h.r.d.id));
    if (hits.length) list.push({...t,hits,docs:new Set(hits.map(h=>h.r.d.id))});
  }
  return list.sort((a,b)=>b.docs.size-a.docs.size || b.hits.length-a.hits.length || a.en.localeCompare(b.en,'en'));
}

