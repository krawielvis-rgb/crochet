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
const slug=x=>String(x).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);

const LEGACY_AMZ=new Set(['easy-halloween-crochet-you-can-actually-finish-13-spooky-patterns','halloween-crochet-patterns-book-25-patterns-beginner-friendly','3-happy-halloween-crochet-kit-pumpkin-bat-spider','happy-halloween-gnome-crochet-kit-beginner-friendly','amigurumi-critters-25-imaginative-crochet-designs','6-adorable-animals-crochet-kit-beginner-friendly']);
const isAmz=p=>p&&(p.catalog==='amazon'||LEGACY_AMZ.has(String(p.slug||'').toLowerCase()));

function resolveImage(p){
  if(!p)return '';
  if(p.image)return p.image;
  if(p.slug)return `/images/pins/pin-${p.slug}.webp`;
  return '';
}

async function posts(e){let live=[];
try{
  if(e&&e.GITHUB_TOKEN){
    const meta=await g(`${API}/contents/data/posts.json?ref=${BRANCH}`,e);
    if(meta&&meta.content){
      const text=atob(String(meta.content).replace(/\n/g,''));
      const parsed=JSON.parse(text);
      if(Array.isArray(parsed)) live=parsed;
    }
  }
}catch{}
if(!live.length){
  const r=await fetch(`${RAW}/data/posts.json?x=${Date.now()}`,{cache:'no-store',cf:{cacheTtl:0}});
  live=r.ok?await r.json():[];
}
if(!Array.isArray(live))live=[];
let deleted=new Set();try{const dr=await fetch(`${RAW}/data/deleted-slugs.json?x=${Date.now()}`,{cache:'no-store',cf:{cacheTtl:0}});if(dr.ok){const dj=await dr.json();if(Array.isArray(dj))dj.forEach(s=>deleted.add(String(s||'').toLowerCase()))}}catch{}
let remote=live;if(live.length<80){const fb=await fetch('https://raw.githubusercontent.com/krawielvis-rgb/crochet/03cc176d8d0ef2bc06e02e1b192001b9cc22bfbf/data/posts.json');if(fb.ok){const base=await fb.json();const liveSlugs=new Set(live.map(p=>p&&p.slug));remote=[...live,...base.filter(p=>p&&!liveSlugs.has(p.slug))]}}
const map=new Map((freshPosts||[]).map(p=>[p.slug,{...p}]));
for(const p of remote){if(!p||!p.slug)continue;if(map.has(p.slug)){const prev=map.get(p.slug);map.set(p.slug,{...p,...prev,image:prev.image||p.image})}else map.set(p.slug,p)}
const ordered=[];const seen=new Set();
for(const p of live){if(p&&p.slug&&map.has(p.slug)&&!seen.has(p.slug)){ordered.push(map.get(p.slug));seen.add(p.slug)}}
for(const p of map.values()){if(p&&p.slug&&!seen.has(p.slug)){ordered.push(p);seen.add(p.slug)}}
return ordered.filter(p=>{if(!p||p.published===false)return false;const s=String(p.slug||'').toLowerCase();if(deleted.has(s))return false;return true;}).map(p=>({...p,image:resolveImage(p)}));
}

async function publishHtml(r,e){
  if(!await auth(r,e))return out({error:'Unauthorized'},401);
  if(!e.GITHUB_TOKEN)return out({error:'GITHUB_TOKEN is not configured'},500);
  const d=await r.json().catch(()=>({}));
  let html=String(d.html||'').trim();
  if(!html)return out({error:'Paste your tutorial HTML first.'},400);
  const m=String(d.imageDataUrl||'').match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
  if(m&&m[2].length>5500000)return out({error:'Image is too large.'},400);
  const titleMatch=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title=cleanText(titleMatch&&titleMatch[1]);
  if(!title)return out({error:'Your HTML needs a <title> or <h1>.'},400);
  const description=cleanText((html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)||[])[1])||`${title} — Sara Rain Crochet.`;
  const s=slug(d.slug||title);
  if(!s)return out({error:'Could not create a URL slug.'},400);
  let ps=await posts(e);
  const existing=ps.find(p=>p.slug===s);
  let image,ext='jpg';
  if(m){ext=m[1]==='png'?'png':m[1]==='webp'?'webp':'jpg';image=`/images/pins/pin-${s}.${ext}`;}
  else if(existing&&existing.image){image=existing.image;}
  else {return out({error:'Upload a JPG, PNG, or WebP pin image.'},400);}
  if(m){const imgRe=/<img\b([^>]*?)\bsrc\s*=\s*(['"])(.*?)\2([^>]*)>/i;if(imgRe.test(html))html=html.replace(imgRe,(mm,a,q,src,b)=>`<img${a}src=${q}${image}${q}${b}>`);}
  const ref=await g(`${API}/git/ref/heads/${BRANCH}`,e);
  const head=ref.object.sha;
  const commit=await g(`${API}/git/commits/${head}`,e);
  const treeItems=[];
  if(m){const ib=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:m[2],encoding:'base64'})});treeItems.push({path:`public/images/pins/pin-${s}.${ext}`,mode:'100644',type:'blob',sha:ib.sha});}
  const hb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:html,encoding:'utf-8'})});
  treeItems.push({path:`public/posts/${s}.html`,mode:'100644',type:'blob',sha:hb.sha});
  ps=ps.filter(p=>p.slug!==s);
  const catalog=(d.catalog==='amazon'||d.catalog==='home')?d.catalog:((existing&&existing.catalog)==='amazon'?'amazon':'home');
  ps.unshift({slug:s,title,description,category:(existing&&existing.category)||'Crochet tutorial',readTime:(existing&&existing.readTime)||'12 min read',image,published:true,catalog});
  const pb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:JSON.stringify(ps,null,2)+'\n',encoding:'utf-8'})});
  treeItems.push({path:'data/posts.json',mode:'100644',type:'blob',sha:pb.sha});
  const tree=await g(`${API}/git/trees`,e,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:treeItems})});
  const c=await g(`${API}/git/commits`,e,{method:'POST',body:JSON.stringify({message:`Publish: ${title}`,tree:tree.sha,parents:[head]})});
  await g(`${API}/git/refs/heads/${BRANCH}`,e,{method:'PATCH',body:JSON.stringify({sha:c.sha})});
  return out({ok:true,url:`/posts/${s}.html`,title,catalog});
}

async function deletePost(r,e){
  if(!await auth(r,e))return out({error:'Unauthorized'},401);
  if(!e.GITHUB_TOKEN)return out({error:'GITHUB_TOKEN is not configured'},500);
  const d=await r.json().catch(()=>({}));
  const s=slug(d.slug||'');
  if(!s)return out({error:'Slug is required.'},400);
  let ps=await posts(e);
  const before=ps.length;
  ps=ps.filter(p=>p&&p.slug!==s);
  if(ps.length===before)return out({error:'Post not found in catalog.'},404);
  let deleted=[];
  try{const dr=await fetch(`${RAW}/data/deleted-slugs.json?x=${Date.now()}`);if(dr.ok){const j=await dr.json();if(Array.isArray(j))deleted=j}}catch{}
  if(!deleted.includes(s))deleted.push(s);
  const ref=await g(`${API}/git/ref/heads/${BRANCH}`,e);
  const head=ref.object.sha;
  const commit=await g(`${API}/git/commits/${head}`,e);
  const pb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:JSON.stringify(ps,null,2)+'\n',encoding:'utf-8'})});
  const db=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:JSON.stringify(deleted,null,2)+'\n',encoding:'utf-8'})});
  const tree=await g(`${API}/git/trees`,e,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:[{path:'data/posts.json',mode:'100644',type:'blob',sha:pb.sha},{path:'data/deleted-slugs.json',mode:'100644',type:'blob',sha:db.sha}]})});
  const c=await g(`${API}/git/commits`,e,{method:'POST',body:JSON.stringify({message:`Remove from catalog: ${s}`,tree:tree.sha,parents:[head]})});
  await g(`${API}/git/refs/heads/${BRANCH}`,e,{method:'PATCH',body:JSON.stringify({sha:c.sha})});
  return out({ok:true,removed:s});
}

function injectCookieBanner(html){
  if(!html||typeof html!=='string')return html;
  if(html.includes('id="sara-cookie-banner"'))return html;
  const snip=`\n<style id="sara-cookie-style">\n#sara-cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:520px;margin:0 auto;background:#fffdf9;color:#19302b;border:1px solid rgba(25,48,43,.14);border-radius:18px;box-shadow:0 16px 40px rgba(25,48,43,.14);padding:16px 18px;font:15px/1.5 'DM Sans',system-ui,sans-serif}\n#sara-cookie-banner p{margin:0 0 12px;color:#59655e;font-size:14px;line-height:1.55}\n#sara-cookie-banner a{color:#9b5148;font-weight:600;text-decoration:underline}\n#sara-cookie-banner .sara-cookie-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}\n#sara-cookie-banner button{border:0;border-radius:999px;padding:10px 16px;font:600 13px 'DM Sans',system-ui,sans-serif;cursor:pointer}\n#sara-cookie-banner .sara-cookie-accept{background:#19302b;color:#f4f0e8}\n@media(min-width:700px){#sara-cookie-banner{left:24px;right:auto;margin:0;width:min(420px,calc(100vw - 48px))}}\n</style>\n<div id="sara-cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie notice" hidden>\n  <p>We use cookies for analytics and (later) ads, and to remember your preferences. See our <a href="/cookie-policy.html">Cookie Policy</a>.</p>\n  <div class="sara-cookie-actions">\n    <button type="button" class="sara-cookie-accept" id="sara-cookie-accept">Accept</button>\n    <a href="/cookie-policy.html" style="border-radius:999px;display:inline-block;text-decoration:none;border:1px solid rgba(25,48,43,.18);padding:9px 14px;font:600 13px 'DM Sans',system-ui,sans-serif;color:#19302b">Learn more</a>\n  </div>\n</div>\n<script>\n(function(){\n  try{\n    if(localStorage.getItem('sara_cookie_ok')==='1')return;\n    var b=document.getElementById('sara-cookie-banner');\n    if(!b)return;\n    b.hidden=false;\n    var btn=document.getElementById('sara-cookie-accept');\n    if(btn)btn.addEventListener('click',function(){\n      try{localStorage.setItem('sara_cookie_ok','1');}catch(e){}\n      b.remove();\n    });\n  }catch(e){}\n})();\n</script>`;
  if(/<\/body>/i.test(html)) return html.replace(/<\/body>/i, snip+'</body>');
  return html+snip;
}

export default{async fetch(r,e){
  const u=new URL(r.url);
  if(u.pathname==='/api/posts')return out(await posts(e));
  if(u.pathname==='/api/admin/publish-html'&&r.method==='POST')return publishHtml(r,e);
  if(u.pathname==='/api/admin/delete'&&r.method==='POST')return deletePost(r,e);
  if(u.pathname==='/api/admin/login'&&r.method==='POST'){
    const d=await r.json().catch(()=>({}));
    const id=String(d.identifier||d.username||d.email||'').trim();
    const pw=String(d.password||'');
    const ok=(e.ADMIN_USER&&id===e.ADMIN_USER||e.ADMIN_EMAIL&&id===e.ADMIN_EMAIL)&&(pw&&pw===(e.ADMIN_PASSWORD||''));
    if(!ok)return out({error:'Invalid credentials'},401);
    const tok=await session(e,id);
    return new Response(JSON.stringify({ok:true}),{status:200,headers:{...J,'set-cookie':`sara_admin=${tok}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`}});
  }
  if(u.pathname==='/api/admin/logout'&&r.method==='POST'){
    return new Response(JSON.stringify({ok:true}),{status:200,headers:{...J,'set-cookie':'sara_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'}});
  }
  if(u.pathname==='/api/admin/session'){
    return out({authenticated:await auth(r,e)});
  }
  if(u.pathname==='/api/admin/post-html'){
    if(!await auth(r,e))return out({error:'Unauthorized'},401);
    const s=slug(u.searchParams.get('slug')||'');
    if(!s)return out({error:'Slug required'},400);
    let res=await e.ASSETS.fetch(new Request(new URL(`/posts/${s}.html`,r.url)));
    if(!res.ok) res=await e.ASSETS.fetch(new Request(new URL(`/public/posts/${s}.html`,r.url)));
    if(!res.ok){
      const raw=await fetch(`${RAW}/public/posts/${s}.html`);
      if(!raw.ok)return out({error:'Post HTML not found'},404);
      return out({html:await raw.text(),title:s});
    }
    return out({html:await res.text(),title:s});
  }
  if(u.pathname==='/sara'||u.pathname==='/sara/'){
    return e.ASSETS.fetch(new Request(new URL('/sara/index.html',r.url),{method:'GET'}));
  }
  if(u.pathname==='/'||u.pathname==='/index.html'){
    let res=await e.ASSETS.fetch(r);
    let h=await res.text();
    try{
      const list=await posts(e);
      const cards=list.filter(p=>p&&!isAmz(p)).slice(0,80).map(p=>`<a class="pinterest-card" href="/posts/${p.slug}.html"><img src="${esc(p.image||'')}" alt="${esc(p.title||'')}" loading="lazy"><div class="pinterest-card-content"><h3>${esc(p.title||'')}</h3><span>Read tutorial →</span></div></a>`).join('');
      const gridStart=h.search(/<div\s+class=["']pinterest-grid["'][^>]*>/i);
      if(gridStart>=0){
        const openEnd=h.indexOf('>',gridStart)+1;
        let depth=1,i=openEnd;
        while(i<h.length&&depth>0){
          const nextOpen=h.indexOf('<div',i);
          const nextClose=h.indexOf('</div>',i);
          if(nextClose<0)break;
          if(nextOpen>=0&&nextOpen<nextClose){depth++;i=nextOpen+4;}
          else{depth--;i=nextClose+6;if(depth===0){h=h.slice(0,openEnd)+cards+h.slice(nextClose);break;}}
        }
      }
    }catch(err){}
    return new Response(injectCookieBanner(h),{status:200,headers:{'content-type':'text/html;charset=utf-8','cache-control':'public,max-age=60'}});
  }
  if(u.pathname==='/amazon-finds.html'||u.pathname==='/amazon-finds'){
    let res=await e.ASSETS.fetch(new Request(new URL('/amazon-finds.html',r.url),{method:'GET'}));
    let html=await res.text();
    try{
      const list=await posts(e);
      const amz=list.filter(p=>isAmz(p));
      const cards=amz.map(p=>`<a class="affiliate-card" href="/posts/${p.slug}.html"><img src="${esc(p.image||'')}" alt="${esc(p.title||'')}" loading="lazy"><div class="affiliate-card-content"><h3>${esc(p.title||'')}</h3><span class="tag">Amazon · Read →</span></div></a>`).join('');
      const gridStart=html.search(/<div\s+class=["']affiliate-grid["'][^>]*>/i);
      if(gridStart>=0){
        const openEnd=html.indexOf('>',gridStart)+1;
        let depth=1,i=openEnd;
        while(i<html.length&&depth>0){
          const nextOpen=html.indexOf('<div',i);
          const nextClose=html.indexOf('</div>',i);
          if(nextClose<0)break;
          if(nextOpen>=0&&nextOpen<nextClose){depth++;i=nextOpen+4;}
          else{depth--;i=nextClose+6;if(depth===0){html=html.slice(0,openEnd)+cards+html.slice(nextClose);break;}}
        }
      }
    }catch(err){}
    return new Response(injectCookieBanner(html),{status:200,headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store'}});
  }
  {
    const res=await e.ASSETS.fetch(r);
    const path=u.pathname.toLowerCase();
    const ct=(res.headers.get('content-type')||'').toLowerCase();
    const looksHtml=ct.includes('text/html')||path.endsWith('.html')||path.endsWith('.htm')||path==='/'||path.endsWith('/');
    if(looksHtml && res.status===200){
      let body=await res.text();
      if(body.includes('<html')||body.includes('<!doctype')||body.includes('<!DOCTYPE')||body.includes('<body')){
        body=injectCookieBanner(body);
        return new Response(body,{status:200,headers:{'content-type':'text/html;charset=utf-8','cache-control':res.headers.get('cache-control')||'public,max-age=60'}});
      }
    }
    return res;
  }
}};
