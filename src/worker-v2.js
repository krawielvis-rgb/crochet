import freshPosts from './fresh-posts.js';

const REPO='krawielvis-rgb/crochet';
const BRANCH='main';
const RAW=`https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const API=`https://api.github.com/repos/${REPO}`;
const J={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};

const out=(x,s=200,h={})=>new Response(JSON.stringify(x),{status:s,headers:{...J,...h}});
const cookie=(r,n)=>{const m=(r.headers.get('Cookie')||'').match(new RegExp('(?:^|;\\s*)'+n+'=([^;]+)'));return m?decodeURIComponent(m[1]):''};
const b64=u=>{let s='';for(const x of u)s+=String.fromCharCode(x);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const ub64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4)),c=>c.charCodeAt(0));

async function sig(secret,v){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(v)))}
async function session(env,id){const p=b64(new TextEncoder().encode(JSON.stringify({i:id,e:Date.now()+43200000})));return p+'.'+b64(await sig(env.SESSION_SECRET||env.ADMIN_PASSWORD,p))}
async function auth(r,e){const t=cookie(r,'sara_admin'),[p,s]=t.split('.');if(!p||!s)return false;try{const a=ub64(s),b=await sig(e.SESSION_SECRET||e.ADMIN_PASSWORD,p);if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];if(d)return false;return JSON.parse(new TextDecoder().decode(ub64(p))).e>Date.now()}catch{return false}}

const gh=e=>({Authorization:`Bearer ${e.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Sara-Rain-Crochet-Admin','Content-Type':'application/json'});
async function g(url,e,opt={}){const r=await fetch(url,{...opt,headers:{...gh(e),...(opt.headers||{})}});if(!r.ok){let msg='GitHub API '+r.status;try{const d=await r.json();if(d.message)msg+=': '+d.message}catch{}throw Error(msg)}return r.json()}

const esc=x=>String(x||'').replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"');
const cleanText=x=>String(x||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const paras=x=>String(x||'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s).replace(/\n/g,'<br>')}</p>`).join('');
const lis=x=>Array.isArray(x)?x.map(s=>`<li>${esc(s)}</li>`).join(''):String(x||'').split('\n').map(s=>s.trim()).filter(Boolean).map(s=>`<li>${esc(s)}</li>`).join('');
const slug=x=>String(x).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);

const IMAGE_BY_SLUG={
  'crochet-baby-blanket':'/images/pins/pin-easy-crochet-baby-blanket-pattern-for-beginners-sara-rain-crochet.jpg',
  'crochet-baby-booties':'/images/pins/pin-easy-crochet-baby-booties-pattern-for-beginners-sara-rain-crochet.jpg',
  'crochet-beanie':'/images/pins/pin-crochet-beanie-for-beginners-sara-rain-crochet.jpg',
  'crochet-bookmark':'/images/pins/pin-crochet-bookmark-tutorial-sara-rain-crochet.jpg',
  'crochet-cardigan':'/images/pins/pin-crochet-cardigan-tutorial.jpg',
  'crochet-cardigan-tutorial':'/images/pins/pin-crochet-cardigan-tutorial.jpg',
  'easy-crochet-baby-blanket-pattern-for-beginners-sara-rain-crochet':'/images/pins/pin-easy-crochet-baby-blanket-pattern-for-beginners-sara-rain-crochet.jpg',
  'easy-crochet-baby-booties-pattern-for-beginners-sara-rain-crochet':'/images/pins/pin-easy-crochet-baby-booties-pattern-for-beginners-sara-rain-crochet.jpg',
  'crochet-beanie-for-beginners-sara-rain-crochet':'/images/pins/pin-crochet-beanie-for-beginners-sara-rain-crochet.jpg',
  'crochet-bookmark-tutorial-sara-rain-crochet':'/images/pins/pin-crochet-bookmark-tutorial-sara-rain-crochet.jpg'
};
function resolveImage(p){
  if(!p)return '';
  if(IMAGE_BY_SLUG[p.slug])return IMAGE_BY_SLUG[p.slug];
  if(p.image)return p.image;
  if(p.slug)return `/images/pins/pin-${p.slug}.jpg`;
  return '';
}

async function posts(e){const r=await fetch(`${RAW}/data/posts.json?x=${Date.now()}`);const remote=r.ok?await r.json():[];const map=new Map(freshPosts.map(p=>[p.slug,{...p}]));for(const p of remote){if(map.has(p.slug)){const base=map.get(p.slug);map.set(p.slug,{...base,...p,image:p.image||base.image})}else map.set(p.slug,p)}return [...map.values()].filter(p=>{if(!p||p.published===false)return false;const s=String(p.slug||'').toLowerCase()+' '+String(p.title||'').toLowerCase();if(s.includes('sunglass'))return false;return true;}).map(p=>({...p,image:resolveImage(p)}))}

export default {
  async fetch(r,e,ctx){
    const u=new URL(r.url);
    if(u.pathname==='/api/posts'&&r.method==='GET'){
      try{return out(await posts(e))}catch(err){return out({error:String(err.message||err)},500)}
    }
    if(u.pathname==='/'||u.pathname==='/index.html'){
      const a=await e.ASSETS.fetch(r);if(!a.ok)return a;
      const ps=await posts(e);let h=await a.text();
      if(ps.length){
        const cards=ps.map(p=>`<a class="pinterest-card" href="/posts/${p.slug}.html"><img src="${p.image}" alt="${esc(p.title)}" loading="lazy"><div class="pinterest-card-content"><h3>${esc(p.title)}</h3><span>Read tutorial →</span></div></a>`).join('');
        if(h.includes('PLACEHOLDER_CARDS')){
          h=h.replace(/PLACEHOLDER_CARDS/g,cards);
        } else {
          const sectionStart=h.indexOf('<section class="pinterest-section"');
          const gridStart=sectionStart>=0?h.indexOf('<div class="pinterest-grid">',sectionStart):-1;
          const gridEnd=gridStart>=0?h.indexOf('</div></div></section>',gridStart):-1;
          if(gridStart>=0&&gridEnd>=0){
            h=h.slice(0,gridStart)+`<div class="pinterest-grid">${cards}</div>`+h.slice(gridEnd+'</div>'.length);
          }
        }
      }
      return new Response(h,{headers:new Headers({...Object.fromEntries(a.headers),'cache-control':'no-store, no-cache, must-revalidate'})});
    }
    if(u.pathname.startsWith('/posts/')&&u.pathname.endsWith('.html')){
      const a=await e.ASSETS.fetch(r);
      if(a.ok)return a;
      const slug=u.pathname.replace(/^\/posts\//,'').replace(/\.html$/,'');
      try{
        const list=await posts(e);
        const p=list.find(x=>x.slug===slug);
        if(p){
          const html=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)} — Sara Rain Crochet</title><link rel="stylesheet" href="/src/style.css"></head><body><main style="max-width:800px;margin:40px auto;padding:20px"><a href="/">← Home</a><h1>${esc(p.title)}</h1><img src="${p.image}" alt="${esc(p.title)}" style="max-width:100%"><p>${esc(p.description)}</p></main></body></html>`;
          return new Response(html,{headers:{'content-type':'text/html;charset=utf-8'}});
        }
      }catch{}
      return a;
    }
    return e.ASSETS.fetch(r);
  }
};
