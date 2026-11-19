const paths = {
  book:'<path d="M3.5 4.5c3.2-.8 5.9-.3 8.5 1.4 2.6-1.7 5.3-2.2 8.5-1.4v14c-3.2-.8-5.9-.3-8.5 1.4-2.6-1.7-5.3-2.2-8.5-1.4z"/><path d="M12 6v14"/>',
  bookmark:'<path d="M6.5 4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16l-5.5-3.8L6.5 20z"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  list:'<path d="M8.5 6h12m-12 6h12m-12 6h12"/><path d="M3.5 6h.1m-.1 6h.1m-.1 6h.1"/>',
  layers:'<path d="m3 8 9-4.5L21 8l-9 4.5zM3.5 12l8.5 4.3 8.5-4.3m-17 4L12 20.3l8.5-4.3"/>',
  text:'<path d="M4 5h16M12 5v15m-4 0h8"/>',
  chevron:'<path d="m6.5 9.2 5.5 5.5 5.5-5.5"/>',
  pin:'<path d="M12 21s6.5-5.8 6.5-11.5a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21z"/><circle cx="12" cy="9.3" r="2"/>',
  cards:'<rect x="6.5" y="6" width="14" height="14" rx="2"/><path d="M16 3H5a2 2 0 0 0-2 2v11m6.5-4.5h7m-7 4h4"/>',
  check:'<path d="m4.5 12 5 5 10-11"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 6.5V12l3.7 2"/>',
  flash:'<path d="M6 5h10l3 3v11H6z"/><path d="M15 5v4h4m-10 4h6m-6 3h4"/>',
  pen:'<path d="m4 19 1.2-5L15.8 3.5l4.7 4.7L10 18.8 4 20zM13.8 5.5l4.7 4.7"/>',
  rotate:'<path d="M4 10.5a8 8 0 1 1 .9 6M4 4.5v6h6"/>',
  calendar:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  focus:'<path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/><circle cx="12" cy="12" r="3"/>'
};
function icon(name){return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function url(id,tab='article',settings={}){
  const params={...settings};
  const [path,search]=location.hash.slice(1).split('?');
  if(params.v===undefined&&path?.startsWith('/read/'+id+'/'))params.v=new URLSearchParams(search).get('v');
  const qs=new URLSearchParams(Object.entries(params).filter(([,v])=>v!==undefined&&v!==null&&v!==''));
  return '#/read/'+encodeURIComponent(id)+'/'+tab+(qs.size?'?'+qs:'');
}
function labelRef(ref){const [p,n]=String(ref).split('.');return (/^\d+$/.test(p)?`第 ${p} 段`:`${p} 段`)+(n?` · 第 ${n} 句`:'')}
function partStamp(part){return `<span class="part-stamp ${esc(part.toLowerCase())}">${esc(part)}</span>`}
function safeGet(key,fallback){try{const x=localStorage.getItem(key);return x===null?fallback:JSON.parse(x)}catch{return fallback}}
function safeSet(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch{return false}}
function announce(s){const box=document.querySelector('#status');if(box)box.textContent=s}

export {icon,esc,url,labelRef,partStamp,safeGet,safeSet,announce};

