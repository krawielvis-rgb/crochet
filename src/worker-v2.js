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

const esc=x=>String(x||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cleanText=x=>String(x||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const paras=x=>String(x||'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s).replace(/\n/g,'<br>')}</p>`).join('');
const lis=x=>Array.isArray(x)?x.map(s=>`<li>${esc(s)}</li>`).join(''):String(x||'').split('\n').map(s=>s.trim()).filter(Boolean).map(s=>`<li>${esc(s)}</li>`).join('');
const slug=x=>String(x).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);

const IMAGE_BY_SLUG={};
function resolveImage(p){
  if(!p)return '';
  if(IMAGE_BY_SLUG[p.slug])return IMAGE_BY_SLUG[p.slug];
  if(p.image)return p.image;
  if(p.slug)return `/images/pins/pin-${p.slug}.jpg`;
  return '';
}

function injectPostStyles(html){
  if(!html||typeof html!=='string')return html;
  if(html.includes('id="critical-site"'))return html;
  const critical=`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;500;600;700&family=Fraunces:opsz,wght@9..144,500;600&display=swap" rel="stylesheet"><style id="critical-site">:root{--ink:#21312c;--paper:#f7f4ed;--red:#d85e4b;--line:rgba(33,49,44,.18)}*{box-sizing:border-box}body{margin:0;background:var(--paper)!important;color:var(--ink)!important;font-family:'DM Sans',system-ui,sans-serif!important;font-size:16px;line-height:1.6}a{color:inherit;text-decoration:none}.site-header{height:84px;padding:0 5.5vw;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);background:var(--paper);position:relative;z-index:4}.brand{display:flex;gap:10px;align-items:center;font-family:Fraunces,Georgia,serif;font-size:22px;font-weight:600;color:var(--ink)!important}.brand-mark{width:30px;height:30px;border:1.5px solid var(--ink);border-radius:50%;display:grid;place-items:center;font-size:18px}.site-header nav{display:flex;gap:35px;font-size:14px}.site-header nav a{color:var(--ink)!important;text-decoration:none}.site-header nav a:hover{color:var(--red)}.button,.button-small{display:inline-flex;align-items:center;gap:12px;background:var(--ink);color:var(--paper)!important;padding:10px 14px;font-size:12px;font-weight:600;border:0;text-decoration:none}.button span,.button-small span{font-size:17px}.article{max-width:900px;margin:0 auto;padding:92px 30px 105px}.article>h1{font-family:Fraunces,Georgia,serif;font-size:clamp(42px,6vw,72px);font-weight:500;letter-spacing:-1.5px;line-height:1.05;margin:13px 0 23px;color:var(--ink)}.meta{font:500 10px 'DM Mono',monospace;letter-spacing:1.3px;text-transform:uppercase;color:#77877e;margin-bottom:12px}.dek{font-family:Fraunces,Georgia,serif;font-size:clamp(18px,2.4vw,26px);line-height:1.35;max-width:700px;color:#53635b;margin-bottom:36px}.article-image,.pin-image{width:100%;max-height:520px;object-fit:cover;border-radius:12px;margin:24px 0;display:block}@media(max-width:700px){.site-header nav{display:none}.article{padding:70px 18px 80px}}</style>`;
  if(/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m=>m+critical);
  return critical+html;
}

function page(d){const u=`https://sararaincrochet.com/posts/${d.slug}.html`,img=resolveImage(d);return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(d.description)}"><link rel="canonical" href="${u}"><title>${esc(d.title)} — Sara Rain Crochet</title><style>body{margin:0;background:#f7f4ed;color:#21312c;font-family:Arial,sans-serif;line-height:1.7}.shell{max-width:1040px;margin:auto;padding:32px 22px 80px}.brand{color:#21312c;text-decoration:none;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px}.hero,.card{background:#fff;border:1px solid #ded7ce;padding:28px}.hero{background:#efe9df}.hero img{display:block;width:100%;max-height:760px;object-fit:cover;margin-top:24px}.kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9b5148}h1,h2,h3{font-family:Georgia,serif;line-height:1.15}h1{font-size:clamp(38px,6vw,70px);font-weight:500}h2{font-size:34px}.lede{font-size:19px}.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0 45px}.fact{background:#fff;border:1px solid #ded7ce;padding:18px}.fact b{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#9b5148}.roadmap{background:#21312c;color:#f7f4ed;padding:28px;margin:45px 0}.check{border-left:4px solid #9b5148;padding:16px 20px;background:#f1ebe3}.note{background:#ead9cf;padding:20px}.back{display:inline-block;margin-top:30px;color:#9b5148;font-weight:700;text-decoration:none}footer{margin-top:65px;padding-top:24px;border-top:1px solid #d8d0c6;font-size:13px;color:#66716b}@media(max-width:700px){.facts{grid-template-columns:1fr}.shell{padding:22px 16px 60px}}</style></head><body><main class="shell"><a class="brand" href="/">Sara Rain Crochet</a><article><div class="hero"><div class="kicker">${esc(d.category||'Crochet tutorial')} · ${esc(d.readTime||'12 min read')}</div><h1>${esc(d.title)}</h1><p class="lede">${esc(d.description)}</p><img src="${img}" alt="${esc(d.title)} crochet tutorial"></div><div class="facts"><div class="fact"><b>Skill</b>Beginner friendly</div><div class="fact"><b>Project</b>${esc(d.title)}</div><div class="fact"><b>Approach</b>Measured, practical construction</div></div><section class="roadmap"><h2>Complete tutorial roadmap</h2><ol><li>Prepare yarn, hook, measurements, and workspace.</li><li>Build the main shape with consistent stitch counts.</li><li>Pause at checkpoints to compare size and symmetry.</li><li>Finish edges, joins, closures, or hardware carefully.</li><li>Block, wash, and store the finished project appropriately.</li></ol></section><section><h2>Materials & preparation</h2><div class="card">${paras(d.materials)||'<p>Gather your yarn, hook, scissors, and tapestry needle before you begin.</p>'}</div></section><section><h2>Core pattern / method</h2><div class="card">${paras(d.intro)}${d.steps?`<h3>Step-by-step</h3><ol>${lis(d.steps)}</ol>`:''}</div></section><section><h2>Checkpoint</h2><div class="check">${paras(d.checkpoint)||'<p>Pause and check stitch counts, edges, and overall shape before continuing.</p>'}</div></section><section><h2>Troubleshooting</h2><div class="card">${paras(d.troubleshooting)||'<p>If the fabric changes shape unexpectedly, count stitches and check tension.</p>'}</div></section><section><h2>Finishing</h2><div class="card">${paras(d.finishing)||'<p>Weave in ends securely and shape the piece.</p>'}</div></section><section><h2>Care & storage</h2><div class="note">${paras(d.care)||'<p>Follow the yarn label for washing and drying.</p>'}</div></section></article><a class="back" href="/#pinterest-tutorials">← Back to tutorials</a><footer>© Sara Rain Crochet</footer></main></body></html>`}

async function posts(e){const r=await fetch(`${RAW}/data/posts.json?x=${Date.now()}`);const remote=r.ok?await r.json():[];const map=new Map((freshPosts||[]).map(p=>[p.slug,{...p}]));for(const p of remote){if(map.has(p.slug)){const base=map.get(p.slug);map.set(p.slug,{...base,...p,image:p.image||base.image})}else map.set(p.slug,p)}return [...map.values()].filter(p=>{if(!p||p.published===false)return false;const s=String(p.slug||'').toLowerCase();if(s.includes('sunglass'))return false;return true;}).map(p=>({...p,image:resolveImage(p)}))}

function replacePinImage(html,image,title){
  if(html.includes('{{PIN_IMAGE}}'))return html.replaceAll('{{PIN_IMAGE}}',image);
  const imgRe=/<img\b([^>]*?)\bsrc\s*=\s*(['"])(.*?)\2([^>]*)>/i;
  if(imgRe.test(html))return html.replace(imgRe,(m,a,q,src,b)=>`<img${a}src=${q}${image}${q}${b}>`);
  return html;
}
function addMissingMeta(html,title,description,url,image){
  let h=html;
  if(!/<title\b/i.test(h))h=h.replace(/<head\b[^>]*>/i,m=>m+`<title>${esc(title)} — Sara Rain Crochet</title>`);
  if(!/<meta\b[^>]*name=["']description["']/i.test(h))h=h.replace(/<head\b[^>]*>/i,m=>m+`<meta name="description" content="${esc(description)}">`);
  if(!/<link\b[^>]*rel=["']canonical["']/i.test(h))h=h.replace(/<head\b[^>]*>/i,m=>m+`<link rel="canonical" href="${url}">`);
  return h;
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
  const url=`https://sararaincrochet.com/posts/${s}.html`;
  if(m) html=replacePinImage(html,image,title);
  html=addMissingMeta(html,title,description,url,image);
  const ref=await g(`${API}/git/ref/heads/${BRANCH}`,e);
  const head=ref.object.sha;
  const commit=await g(`${API}/git/commits/${head}`,e);
  const treeItems=[];
  if(m){const ib=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:m[2],encoding:'base64'})});treeItems.push({path:`public/images/pins/pin-${s}.${ext}`,mode:'100644',type:'blob',sha:ib.sha});}
  const hb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:html,encoding:'utf-8'})});
  treeItems.push({path:`public/posts/${s}.html`,mode:'100644',type:'blob',sha:hb.sha});
  ps=ps.filter(p=>p.slug!==s);
  ps.unshift({slug:s,title,description,category:(existing&&existing.category)||'Crochet tutorial',readTime:(existing&&existing.readTime)||'12 min read',image,published:true});
  const pb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:JSON.stringify(ps,null,2)+'\n',encoding:'utf-8'})});
  treeItems.push({path:'data/posts.json',mode:'100644',type:'blob',sha:pb.sha});
  const tree=await g(`${API}/git/trees`,e,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:treeItems})});
  const c=await g(`${API}/git/commits`,e,{method:'POST',body:JSON.stringify({message:`Publish: ${title}`,tree:tree.sha,parents:[head]})});
  await g(`${API}/git/refs/heads/${BRANCH}`,e,{method:'PATCH',body:JSON.stringify({sha:c.sha})});
  return out({ok:true,url:`/posts/${s}.html`,title});
}

async function deletePost(r,e){
  if(!await auth(r,e))return out({error:'Unauthorized'},401);
  const d=await r.json().catch(()=>({}));
  const s=slug(d.slug||'');
  if(!s)return out({error:'Slug is required.'},400);
  let ps=await posts(e);
  const before=ps.length;
  ps=ps.filter(p=>p.slug!==s);
  if(ps.length===before)return out({error:'Post not found.'},404);
  const ref=await g(`${API}/git/ref/heads/${BRANCH}`,e);
  const head=ref.object.sha;
  const commit=await g(`${API}/git/commits/${head}`,e);
  const pb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:JSON.stringify(ps,null,2)+'\n',encoding:'utf-8'})});
  const tree=await g(`${API}/git/trees`,e,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:[{path:'data/posts.json',mode:'100644',type:'blob',sha:pb.sha}]})});
  const c=await g(`${API}/git/commits`,e,{method:'POST',body:JSON.stringify({message:`Remove: ${s}`,tree:tree.sha,parents:[head]})});
  await g(`${API}/git/refs/heads/${BRANCH}`,e,{method:'PATCH',body:JSON.stringify({sha:c.sha})});
  return out({ok:true,slug:s});
}

export default{async fetch(r,e,ctx){
  const u=new URL(r.url);
  if(u.pathname==='/api/posts'&&r.method==='GET')return out(await posts(e));
  if(u.pathname==='/api/admin/session')return out({authenticated:await auth(r,e)});
  if(u.pathname==='/api/admin/login'&&r.method==='POST'){
    const d=await r.json().catch(()=>({}));
    if(String(d.password||'')!==String(e.ADMIN_PASSWORD||''))return out({error:'Invalid password'},401);
    const t=await session(e,'sara');
    return new Response(JSON.stringify({ok:true}),{status:200,headers:{...J,'set-cookie':`sara_admin=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`}});
  }
  if(u.pathname==='/api/admin/publish-html'&&r.method==='POST')return publishHtml(r,e);
  if(u.pathname==='/api/admin/delete'&&r.method==='POST')return deletePost(r,e);
  if(u.pathname==='/sara'||u.pathname==='/sara/'){
    const a=await e.ASSETS.fetch(new Request(new URL('/sara/index.html',r.url),{method:'GET'}));
    return a;
  }
  if(u.pathname==='/'||u.pathname==='/index.html'){
    const a=await e.ASSETS.fetch(r);if(!a.ok)return a;
    let h=await a.text();
    try{
      const list=await posts(e);
      const cards=list.slice(0,80).map(p=>`<a class="pinterest-card" href="/posts/${p.slug}.html"><img src="${esc(p.image||'')}" alt="${esc(p.title||'')}" loading="lazy"><div class="pinterest-card-content"><h3>${esc(p.title||'')}</h3><span>Read tutorial →</span></div></a>`).join('');
      const gridStart=h.search(/<div\s+class=["']pinterest-grid["'][^>]*>/i);
      if(gridStart>=0){
        const openEnd=h.indexOf('>',gridStart)+1;
        let depth=0,pos=gridStart,closing=-1;
        const tagRe=/<\/?div\b[^>]*>/gi;tagRe.lastIndex=gridStart;let m;
        while((m=tagRe.exec(h))){if(/^<div\b/i.test(m[0]))depth++;else depth--;if(depth===0){closing=m.index;break;}}
        if(closing>0) h=h.slice(0,openEnd)+cards+h.slice(closing);
      }
    }catch{}
    return new Response(h,{status:a.status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
  }
  if(u.pathname.startsWith('/posts/')){
    const topicCardSlugs=['granny-square','yarn-guide','amigurumi','how-to-crochet-a-scarf','crochet-blanket-for-beginners'];
    const topicSlug=u.pathname.split('/').pop().replace(/\.html$/,'');
    if(topicCardSlugs.includes(topicSlug)){
      const topic=await fetch(RAW+u.pathname,{cf:{cacheTtl:300}});
      if(topic.ok){
        const html=injectPostStyles(await topic.text());
        return new Response(html,{status:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
      }
    }
    const sl=topicSlug;const p=(await posts(e)).find(x=>x.slug===sl);
    if(p&&(p.materials||p.intro||p.steps||p.rawContent))return new Response(page(p),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60'}});
    const a=await e.ASSETS.fetch(r);
    if(a.ok){
      const html=injectPostStyles(await a.text());
      return new Response(html,{status:a.status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
    }
    const x=await fetch(`${RAW}${u.pathname}`,{cf:{cacheTtl:300}});
    if(x.ok){
      const html=injectPostStyles(await x.text());
      return new Response(html,{status:x.status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
    }
    return new Response('Not found',{status:404});
  }
  if(u.pathname.startsWith('/images/pins/')){
    const a=await e.ASSETS.fetch(r);if(a.ok)return a;
    const x=await fetch(`${RAW}${u.pathname}`,{cf:{cacheTtl:300}});if(x.ok)return x;
  }
  return e.ASSETS.fetch(r);
}};
