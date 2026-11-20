import {essayFrames, sourceSections, sourceSlots} from './essay-frames.js';

export const essayTypes=['同意与否','双边讨论','一题两问','利弊分析'];
export const chartTypes=['折线图','柱状图','饼图','表格','混合图','地图','流程图'];
export const wordCount=text=>(String(text).match(/[A-Za-z0-9]+(?:[.’'-][A-Za-z0-9]+)*/g)||[]).length;
export function bilingual(value){const [en,zh]=String(value||'').split('|');return {en:en.trim(),zh:(zh||'').trim()};}
const capital=s=>s.replace(/^[a-z]/,ch=>ch.toUpperCase());
const guide={
 t:['核心话题','用名词或动名词短语概括题干限定的话题。'],s:['核心立场','填完整句子，直接回应题目中的判断或问题。'],
 a0:['分论点','用完整句子说清本段要证明什么。'],a1:['背后原因','说明哪一个具体现实条件会造成上一句的现象。'],
 a2:['直接变化','落到一个人、一项行为或一个可观察的变化。'],a3:['进一步影响','介词后接名词或动名词短语。说明前一步如何带来这一步。'],
 a4:['长期影响','用名词或动名词短语说明变化持续后会出现什么。'],a5:['回扣题目','用完整句子把结果连回题干的限定或比较。'],
 b0:['第二个论点','说明这一段回答的另一面或第二问。'],b1:['有关人群','填能与后面动作搭配的复数名词短语。'],b2:['前提条件','说明缺失哪一个具体条件会让目标难以实现。'],
 b3:['想达成的目标','to 后接动词原形。写出这些人想完成的动作。'],b4:['具体例子','给出一个人或群体，把他放进一个可信的情境里。'],
 b5:['合理推论','说明这个例子究竟支持了哪个判断。'],b6:['本段判断','回答题干中的比较、要求或第二问。'],
 noun2:['应当重视的因素','在 why 与 should 之间填名词短语，点明例子所支持的因素。'],
 z0:['重申判断','换一种表达概括整篇文章的判断。'],z1:['归纳理由一','用一个完整句子收拢第一条论证。'],z2:['归纳理由二','回到第二条理由，与第一条区分。'],
 r0:['承认的顾虑','写完整句子，说明另一种意见有什么道理，或原判断有何局限。'],r1:['反方理由','说明持另一种意见的人最在意什么，以及为什么。'],r2:['成立条件','用带主语和谓语的从句写清这个顾虑成立的场景。'],r3:['回应顾虑','写出能解释原立场的区别、证据或实际做法。'],rAction:['对应的解决办法','在 If 后写完整的主语和谓语，具体说明谁可以做什么来缓解顾虑。'],
 r5:['反方指出的问题','在 associated with 后填名词或动名词短语，点名会造成不利影响的问题。'],r6:['最终支持的立场','在 reject 后填名词或动名词短语，明确自己仍然支持的主张。']
};
const paragraph=(label,sentences,help)=>({label,sentences,help});
export const hasConcession = d => Array.isArray(d.r) && d.r.length === 7;

export function validBody(d, requested) {
 const index = Number(requested);
 if (index === 2 && hasConcession(d)) return 2;
 return index === 1 ? 1 : 0;
}

export function bodyNames(d) {
 return hasConcession(d) ? ['主体段一','主体段二','让步段'] : ['主体段一','主体段二'];
}

function essayModel(d, edition) {
 const version = edition === 'simple' ? 'simple' : 'full';
 const values = {t:d.t, s:d.s, noun2:d.noun2, rAction:d.r?.[4]};
 for (const group of ['a','b','z','r']) {
  (d[group] || []).forEach((value, i) => {values[group+i] = value;});
 }
 const labels = ['引言','主体段一','主体段二','让步与回应','结论'];
 const tips = ['引出题干限定的话题，直接给出自己的回答。', ...d.ask, '先说清反方的顾虑在哪种情形下成立，再写出能减轻影响的具体办法。', '重申判断，用主体段已经论证过的理由收束。'];
 function line([form, translation]) {
  const pieces = form.split(/(\{\w+\})/).filter(Boolean).map(token => {
   if (!token.startsWith('{')) return {text:token};
   const key = token.slice(1,-1);
   const {en,zh} = bilingual(values[key]);
   // In the screenshot two sentences end inside the blank. Their final stop
   // belongs to the filled answer and is absent from the blank template.
   const text = form.endsWith(token) ? en + '.' : en;
   return {key, text, zh, label:guide[key][0], tip:guide[key][1], placeholder:sourceSlots[version][key]};
  });
  return {pieces, zh:translation.replace(/\{(\w+)\}/g, (_,key) => bilingual(values[key]).zh)};
 }
 return essayFrames[version].flatMap((lines,i) => {
  if (i===3 && !hasConcession(d)) return [];
  return [{...paragraph(labels[i], lines.map(line), tips[i]), sourceLabel:sourceSections[version][i]}];
 });
}
function chartModel(d,edition){
 return d.paragraphs.map((p,pi)=>paragraph(p.label,p.sentences.map((s,si)=>{
  const [left,right]=s[edition].split('{}');
  const label=['图表主题','总体特征','数据与比较','数据与比较'][pi];
  return {pieces:[{text:left},{key:'c'+pi+'_'+si,text:left?s.fill:capital(s.fill),zh:s.zh,label,tip:pi<2?'先确定对象、时间或最明显的特征，再安排句子。':'回到原图，逐项核对比较对象、数值、单位和时间。'},{text:right||''}],zh:s.zh};
 }),['交代对象、时间及单位。','用整体变化或最突出的差异概括全图。','用第一组图面证据展开概述。','补充第二组对比或后续步骤。'][pi]));
}
export const isChart=d=>d.id.startsWith('c');
export const model=(d,edition='full')=>isChart(d)?chartModel(d,edition):essayModel(d,edition);
export const sentenceText=s=>s.pieces.map(p=>p.text).join('');
export const fullText=parts=>parts.map(p=>p.sentences.map(sentenceText).join(' ')).join('\n\n');
export function chain(d,body=0){
 if(isChart(d))return [];
 const z=s=>bilingual(s).zh;
 if(validBody(d,body)===2)return [['承认顾虑',z(d.r[0])],['成立条件','当'+z(d.r[2])+'时，'+z(d.r[1])+'。'],['回应顾虑',z(d.r[3])],['具体办法',z(d.r[4])],['仍然支持',z(d.r[6])]];
 if(+body===1)return [['分论点',z(d.b[0])],['必要条件',z(d.b[1])+'需要'+z(d.b[2])+'，才能'+z(d.b[3])],['具体例子',z(d.b[4])],['回到题目',z(d.b[6])]];
 return [['分论点',z(d.a[0])],['背后原因',z(d.a[1])],['直接变化',z(d.a[2])],['进一步影响',z(d.a[3])],['长期影响',z(d.a[4])],['回到题目',z(d.a[5])]];
}
export const taskNumber=d=>isChart(d)?1:2;
export const allSlots=parts=>parts.flatMap((p,pi)=>p.sentences.flatMap(s=>s.pieces.filter(w=>w.key).map(w=>({...w,pi}))));

