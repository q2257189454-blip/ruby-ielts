import {e, icon, btn, a, state, emptyView} from './ui.js';
import {topics, patterns, synonyms} from './handbook-data.js';

const roles = ['现象与成因', '影响与权衡', '措施与对策'];
const catalog = {topics, patterns, synonyms};
const batchSize = 24;
const lanes = {
  topics: {heading: '话题词组', label: '话题', unit: '组词组', scope: '全部大作文词组', placeholder: '如 教育、就业、access'},
  patterns: {heading: '句式', label: '写作场景', unit: '个句式', scope: '全部小作文句式', placeholder: '如 年份、占比、from'},
  synonyms: {heading: '同义替换', label: '词性', unit: '组替换', scope: '全部小作文替换', placeholder: '如 increase、平稳、显著'}
};
const previousGroup = {'比较与概数':'比较与排名', '地图与流程':'地图与方位'};

export function handbookUrl(lane, name) {
  const base = lane === 'topics' ? '#/language/大作文' : '#/language/小作文/' + lanes[lane].heading;
  return name ? base + '/' + name : base;
}

export function configureHandbook(parts) {
  const [task, section, category] = parts;
  let lane = 'topics', name = section;
  if (task === '小作文') {
    lane = section === '同义替换' ? 'synonyms' : 'patterns';
    name = category;
  } else if (task && task !== '大作文') {
    lane = task === '同义替换' ? 'synonyms' : 'patterns';
    name = previousGroup[section] || section;
  }
  const groups = catalog[lane];
  state.handLane = lane;
  state.handGroup = groups.some(group => group.name === name) ? name : groups[0].name;
  state.handQuery = '';
  state.handRole = '';
  state.handLimit = batchSize;
}

function navLink(label, href, selected, cls = '') {
  return `<a class="${cls}${selected ? ' active' : ''}" href="${e(href)}"${selected ? ' aria-current="page"' : ''}>${label}</a>`;
}

function groupChooser(groups, meta) {
  const lane = state.handLane;
  const total = groups.reduce((n, group) => n + group.rows.length, 0);
  return `<aside class="index-card" aria-label="${meta.label}目录">
    <div class="index-title"><span>${meta.label}目录</span><small>${groups.length} 类</small></div>
    <nav class="index-items" aria-label="选择${meta.label}">${groups.map(g => navLink(`<span>${e(g.name)}</span><small>${g.rows.length}</small>`, handbookUrl(lane,g.name), state.handGroup === g.name, 'index-item')).join('')}</nav>
    <label class="index-mobile"><span>选择${meta.label}</span><select id="handGroup" aria-label="选择${meta.label}">${groups.map(g => `<option value="${e(g.name)}"${state.handGroup === g.name ? ' selected' : ''}>${e(g.name)}（${g.rows.length}）</option>`).join('')}</select>${icon('down',15)}</label>
    <div class="index-total">共 ${total} ${meta.unit}</div>
  </aside>`;
}

function taskSwitcher(isEssay) {
  const taskLink = (lane, selected, name, number) => navLink(`<b>${name}</b><span lang="en">Task ${number}</span>`, handbookUrl(lane), selected, 'hand-task');
  return `<nav class="hand-tasks" aria-label="表达手册写作任务">${taskLink('topics',isEssay,'大作文',2)}${taskLink('patterns',!isEssay,'小作文',1)}</nav>`;
}

export function language() {
  const lane = state.handLane, meta = lanes[lane], isEssay = lane === 'topics';
  return `<div class="shell secondary-page hand-page">
    <div class="section-kicker"><span></span> WRITING HANDBOOK</div><h1>写作表达手册</h1>
    <div class="hand-intro"><p class="lede">${isEssay ? '按话题查词组，看看每个搭配怎样写进一句论证。' : '按写作场景查句式，按词性比较近义词的搭配和语气。'}</p>${taskSwitcher(isEssay)}</div>
    ${isEssay?'<a class="cu-entry" href="#/corpus">查看大作文语料库与用法频次</a>':''}
    <div class="hand-tools">
      ${isEssay ? '<div class="hand-section-name">'+icon('word',19)+'<span>大作文话题词组</span></div>' : `<nav class="hand-modes" aria-label="小作文手册内容">${['patterns','synonyms'].map(k => navLink(lanes[k].heading, handbookUrl(k), lane === k)).join('')}</nav>`}
      <label class="hand-search">${icon('search',17)}<span>搜${meta.scope}</span><input id="langSearch" type="search" aria-label="搜索${meta.scope}" value="${e(state.handQuery)}" placeholder="${e(meta.placeholder)}"></label>
    </div><div class="hand-layout">${groupChooser(catalog[lane],meta)}<div id="langResults" class="hand-results">${langResults()}</div></div>
    </div>`;
}

function example(en, zh) {
  return `<div class="hand-example"><p class="english" lang="en">${e(en)}</p><p class="hand-zh">${e(zh)}</p></div>`;
}
function usage(note) {
  return `<div class="hand-note">${icon('bulb',16)}<span>${e(note)}</span></div>`;
}
function expressionCard(row, lane) {
  if (lane === 'topics') {
    const [, phrase, meaning, en, zh] = row;
    return `<article class="entry-card"><h3 class="phrase-head english" lang="en">${e(phrase)}</h3><p class="phrase-meaning">${e(meaning)}</p>${example(en,zh)}</article>`;
  }
  if (lane === 'synonyms') {
    const [meaning, head, alternatives, note, en, zh] = row;
    return `<article class="entry-card"><div class="entry-top"><h3 class="phrase-head english" lang="en">${e(head)}</h3><span>${e(meaning)}</span></div><p class="word-choices english" lang="en">${e(alternatives)}</p>${usage(note)}${example(en,zh)}</article>`;
  }
  const [intent, frame, en, zh, note, chartId] = row;
  return `<article class="entry-card"><h3 class="pattern-intent">${e(intent)}</h3><p class="word-choices english" lang="en">${e(frame)}</p>${example(en,zh)}${usage(note)}${chartId ? a('在图题中看这个写法 '+icon('right',13),'#/task/'+chartId,'hand-chart-link') : ''}</article>`;
}

function searchText(text) {
  return text.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[‐‑–—]/g,'-');
}
function matching(groups, lane, query) {
  const terms = searchText(query).replace(/[.…]+/g,' ').replaceAll('状词','副词').trim().split(/\s+/).filter(Boolean);
  const tests = terms.map(term => {
    if (!/^[a-z]+$/.test(term)) return words => words.includes(term);
    const prefix = new RegExp('(?:^|[^a-z])'+term);
    return words => prefix.test(words);
  });
  return groups.flatMap(group => {
    if (!query && group.name !== state.handGroup) return [];
    const rows = group.rows.filter(row => {
      if (!query) return lane !== 'topics' || !state.handRole || row[0] === state.handRole;
      const words = searchText([group.name, ...row].join(' '));
      return tests.every(test => test(words));
    });
    if (lane === 'topics') {
      return roles.map(role => ({heading: query ? group.name+' · '+role : role, rows: rows.filter(row => row[0] === role)})).filter(section => section.rows.length);
    }
    return rows.length ? [{heading:query ? group.name : '',rows}] : [];
  });
}

export function langResults() {
  const lane = state.handLane, query = state.handQuery.trim(), meta = lanes[lane];
  const blocks = matching(catalog[lane], lane, query);
  const total = blocks.reduce((n, group) => n + group.rows.length, 0);
  let left = query ? state.handLimit : total;
  const blocksHtml = blocks.map(block => {
    if (left <= 0) return '';
    const rows = block.rows.slice(0,left);
    left -= rows.length;
    return `<section class="entry-group">${block.heading ? '<h3 class="entry-group-title">'+e(block.heading)+'</h3>' : ''}<div class="entry-grid">${rows.map(row => expressionCard(row,lane)).join('')}</div></section>`;
  }).join('');
  return `<div class="entry-heading"><div><h2>${query ? '搜索结果' : e(state.handGroup)}</h2><p aria-live="polite">${query ? '“'+e(query)+'” · 搜索'+meta.scope+' · '+total+' '+meta.unit : total+' '+meta.unit}</p></div>${query ? btn('清除搜索','clearHandSearch','link-btn') : ''}</div>
   ${lane === 'topics' && !query ? `<div class="role-filters" aria-label="按论证用途筛选">${['',...roles].map(role => btn(role || '全部用途','handRole','chip '+(state.handRole===role?'active':''),`data-role="${role}" aria-pressed="${state.handRole===role}"`)).join('')}</div>` : ''}
   ${blocksHtml || emptyView('没有找到匹配的表达','可以试试另一个中文义或英文词根。')}
   ${query && total > state.handLimit ? btn('再显示 '+Math.min(total-state.handLimit,batchSize)+' 条','moreExpressions','btn subtle hand-more') : ''}`;
}

export function updateHandResults() {
  const target = document.querySelector('#langResults');
  if (target) target.innerHTML = langResults();
}
export function handleHandbook(action, el) {
  if (action === 'handRole') state.handRole = el.dataset.role;
  else if (action === 'moreExpressions') state.handLimit += batchSize;
  else if (action === 'clearHandSearch') {
    state.handQuery = '';
    state.handLimit = batchSize;
    const field = document.querySelector('#langSearch');
    if (field) {field.value = ''; field.focus();}
  } else return false;
  updateHandResults();
  if (action === 'handRole') document.querySelector('.role-filters [aria-pressed="true"]')?.focus({preventScroll:true});
  return true;
}
export function updateHandSearch(value) {
  state.handQuery = value;
  state.handLimit = batchSize;
  updateHandResults();
}
