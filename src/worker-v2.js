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

const esc=x=>String(x||'').replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/\"/g,'"');
const cleanText=x=>String(x||'').replace(/<[^>]+>/g,' ').replace(/&/g,'&').replace(/"/g,'\"').replace(/&#39;/g,"'").replace(/</g,'<').replace(/>/g,'>').replace(/\s+/g,' ').trim();
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
  'crochet-sunglasses-case':'/images/pins/pin-crochet-sunglasses-case-for-beginners.jpg',
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

function page(d){const u=`https://sararaincrochet.com/posts/${d.slug}.html`,img=resolveImage(d);return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(d.description)}"><meta name="author" content="Sara Rain Crochet"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${u}"><meta property="og:title" content="${esc(d.title)} — Sara Rain Crochet"><meta property="og:description" content="${esc(d.description)}"><meta property="og:type" content="article"><meta property="og:url" content="${u}"><meta property="og:image" content="https://sararaincrochet.com${img}"><title>${esc(d.title)} — Sara Rain Crochet</title><style>body{margin:0;background:#f7f4ed;color:#21312c;font-family:Arial,sans-serif;line-height:1.7}.shell{max-width:1040px;margin:auto;padding:32px 22px 80px}.brand{color:#21312c;text-decoration:none;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px}.hero,.card{background:#fff;border:1px solid #ded7ce;padding:28px}.hero{background:#efe9df}.hero img{display:block;width:100%;max-height:760px;object-fit:cover;margin-top:24px}.kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9b5148}h1,h2,h3{font-family:Georgia,serif;line-height:1.15}h1{font-size:clamp(38px,6vw,70px);font-weight:500}h2{font-size:34px}h3{font-size:24px}.lede{font-size:19px}.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0 45px}.fact{background:#fff;border:1px solid #ded7ce;padding:18px}.fact b{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#9b5148}.roadmap{background:#21312c;color:#f7f4ed;padding:28px;margin:45px 0}.check{border-left:4px solid #9b5148;padding:16px 20px;background:#f1ebe3}.note{background:#ead9cf;padding:20px}.back{display:inline-block;margin-top:30px;color:#9b5148;font-weight:700;text-decoration:none}footer{margin-top:65px;padding-top:24px;border-top:1px solid #d8d0c6;font-size:13px;color:#66716b}@media(max-width:700px){.facts{grid-template-columns:1fr}.shell{padding:22px 16px 60px}}</style><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:d.title,description:d.description,image:[`https://sararaincrochet.com${img}`],mainEntityOfPage:{'@type':'WebPage','@id':u},author:{'@type':'Organization',name:'Sara Rain Crochet'},publisher:{'@type':'Organization',name:'Sara Rain Crochet'}})}</script></head><body><main class="shell"><a class="brand" href="/">Sara Rain Crochet</a><article><div class="hero"><div class="kicker">${esc(d.category||'Crochet tutorial')} · ${esc(d.readTime||'12 min read')}</div><h1>${esc(d.title)}</h1><p class="lede">${esc(d.description)}</p><img src="${img}" alt="${esc(d.title)} crochet tutorial"></div><div class="facts"><div class="fact"><b>Skill</b>Beginner friendly</div><div class="fact"><b>Project</b>${esc(d.title)}</div><div class="fact"><b>Approach</b>Measured, practical construction</div></div><section class="roadmap"><h2>Complete tutorial roadmap</h2><ol><li>Prepare yarn, hook, measurements, and workspace.</li><li>Build the main shape with consistent stitch counts.</li><li>Pause at checkpoints to compare size and symmetry.</li><li>Finish edges, joins, closures, or hardware carefully.</li><li>Block, wash, and store the finished project appropriately.</li></ol></section><section><h2>Materials & preparation</h2><div class="card">${paras(d.materials)||'<p>Gather your yarn, hook, scissors, and tapestry needle before you begin.</p>'}</div></section><section><h2>Core pattern / method</h2><div class="card">${paras(d.intro)}${d.steps?`<h3>Step-by-step</h3><ol>${lis(d.steps)}</ol>`:''}${!d.intro&&!d.steps&&d.rawContent?paras(d.rawContent):''}</div></section><section><h2>Checkpoint</h2><div class="check">${paras(d.checkpoint)||'<p>Pause and check stitch counts, edges, and overall shape before continuing.</p>'}</div></section><section><h2>Troubleshooting</h2><div class="card">${paras(d.troubleshooting)||'<p>If the fabric changes shape unexpectedly, count stitches, check tension, and compare your work with the previous successful section.</p>'}</div></section><section><h2>Finishing</h2><div class="card">${paras(d.finishing)||'<p>Weave in ends securely, shape the piece, and block if the yarn allows it.</p>'}</div></section><section><h2>Variations & next projects</h2><div class="card">${paras(d.variations)||'<p>Change color, yarn weight, or finished size once the base version feels comfortable.</p>'}</div></section><section><h2>Care & storage</h2><div class="note">${paras(d.care)||'<p>Follow the yarn label for washing and drying. Store finished items clean and completely dry.</p>'}</div></section><section><h2>Final notes</h2><p>Record your hook size, stitch count, and any adjustment that worked for your tension. Those notes make the next version easier and more consistent.</p></section></article><a class="back" href="/#pinterest-tutorials">← Back to tutorials</a><footer>© Sara Rain Crochet · Practical patterns and patient tutorials for modern makers.</footer></main></body></html>`}

async function posts(e){const r=await fetch(`${RAW}/data/posts.json?x=${Date.now()}`);const remote=r.ok?await r.json():[];const map=new Map(freshPosts.map(p=>[p.slug,{...p}]));for(const p of remote){if(map.has(p.slug)){const base=map.get(p.slug);map.set(p.slug,{...base,...p,image:p.image||base.image})}else map.set(p.slug,p)}return [...map.values()].map(p=>({...p,image:resolveImage(p)}))}

function replacePinImage(html,image,title){
  if(html.includes('{{PIN_IMAGE}}'))return html.replaceAll('{{PIN_IMAGE}}',image);
  const imgRe=/<img\b([^>]*?)\bsrc\s*=\s*(['"])(.*?)\2([^>]*)>/i;
  if(imgRe.test(html))return html.replace(imgRe,(m,a,q,src,b)=>`<img${a}src=${q}${image}${q}${b}>`);
  const tag=`<img src="${image}" alt="${esc(title)} crochet tutorial" style="max-width:100%;height:auto;display:block;margin:24px auto;">`;
  if(/<main\b[^>]*>/i.test(html))return html.replace(/<main\b[^>]*>/i,m=>m+tag);
  if(/<body\b[^>]*>/i.test(html))return html.replace(/<body\b[^>]*>/i,m=>m+tag);
  return tag+html;
}
function normalizeTutorialHeader(html,title,description){
  const eyebrow='<div class="eyebrow">Sara Rain Crochet · Free Pattern</div>';
  const lede=`<p class="lede">${esc(description)}</p>`;
  let h=html;
  h=h.replace(/<p\b[^>]*class=["']meta["'][^>]*>[\s\S]*?<\/p>/i,eyebrow);
  h=h.replace(/<p\b[^>]*class=["']intro["'][^>]*>[\s\S]*?<\/p>/i,lede);
  h=h.replace(/<p\b[^>]*class=["']dek["'][^>]*>[\s\S]*?<\/p>/i,lede);
  if(!/<div\b[^>]*class=["'][^"']*eyebrow[^"']*["']/i.test(h)) h=h.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i,`${eyebrow}$1`);
  if(!/<p\b[^>]*class=["']lede["']/i.test(h)) h=h.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i,`$1${lede}`);
  return h;
}

function addMissingMeta(html,title,description,url,image){
  let h=html;
  if(!/<title\b/i.test(h))h=h.replace(/<head\b[^>]*>/i,m=>m+`<title>${esc(title)} — Sara Rain Crochet</title>`);
  if(!/<meta\b[^>]*name=["']description["']/i.test(h))h=h.replace(/<head\b[^>]*>/i,m=>m+`<meta name="description" content="${esc(description)}">`);
  if(!/<link\b[^>]*rel=["']canonical["']/i.test(h))h=h.replace(/<head\b[^>]*>/i,m=>m+`<link rel="canonical" href="${url}">`);
  if(!/property=["']og:image["']/i.test(h))h=h.replace(/<head\b[^>]*>/i,m=>m+`<meta property="og:image" content="https://sararaincrochet.com${image}">`);
  return h;
}

async function publishStructured(r,e){
  if(!await auth(r,e))return out({error:'Unauthorized'},401);
  if(!e.GITHUB_TOKEN)return out({error:'GITHUB_TOKEN is not configured'},500);
  const d=await r.json().catch(()=>({}));
  const title=String(d.title||'').trim();
  if(!title)return out({error:'Title is required.'},400);
  const description=String(d.description||'').trim()||`${title} — a step-by-step crochet tutorial from Sara Rain Crochet.`;
  const s=slug(d.slug||title);
  if(!s)return out({error:'Could not create a URL slug from the title.'},400);
  let imagePath=null, imageBlob=null, ext='jpg';
  const m=String(d.imageDataUrl||'').match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
  if(m){
    if(m[2].length>5500000)return out({error:'Image is too large. Keep it under about 4 MB.'},400);
    ext=m[1]==='png'?'png':m[1]==='webp'?'webp':'jpg';
    imagePath=`/images/pins/pin-${s}.${ext}`;
    imageBlob=m[2];
  }
  let existing=null;
  try{const list=await posts(e);existing=list.find(p=>p.slug===s)||null;}catch{}
  if(!imagePath && existing && existing.image) imagePath=existing.image;
  if(!imagePath) return out({error:'Upload a JPG, PNG, or WebP Pinterest pin (required for new posts).'},400);
  const post={slug:s,title,description,category:String(d.category||'Crochet tutorial').trim()||'Crochet tutorial',readTime:String(d.readTime||'12 min read').trim()||'12 min read',image:imagePath,published:true,materials:String(d.materials||'').trim(),intro:String(d.intro||'').trim(),steps:String(d.steps||'').trim().split('\n').map(x=>x.trim()).filter(Boolean),checkpoint:String(d.checkpoint||'').trim(),troubleshooting:String(d.troubleshooting||'').trim(),finishing:String(d.finishing||'').trim(),variations:String(d.variations||'').trim(),care:String(d.care||'').trim(),rawContent:String(d.rawContent||'').trim()};
  if(!post.materials && !post.intro && !post.steps.length && post.rawContent){post.intro=post.rawContent;}
  const html=page(post);
  const ref=await g(`${API}/git/ref/heads/${BRANCH}`,e);
  const head=ref.object.sha;
  const commit=await g(`${API}/git/commits/${head}`,e);
  const treeItems=[{path:`public/posts/${s}.html`,mode:'100644',type:'blob',sha:(await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:html,encoding:'utf-8'})})).sha}];
  if(imageBlob){treeItems.push({path:`public/images/pins/pin-${s}.${ext}`,mode:'100644',type:'blob',sha:(await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:imageBlob,encoding:'base64'})})).sha});}
  let ps=await posts(e);
  ps=ps.filter(p=>p.slug!==s);
  ps.unshift({slug:post.slug,title:post.title,description:post.description,category:post.category,readTime:post.readTime,image:post.image,published:true,materials:post.materials,intro:post.intro,steps:post.steps,checkpoint:post.checkpoint,troubleshooting:post.troubleshooting,finishing:post.finishing,variations:post.variations,care:post.care});
  treeItems.push({path:'data/posts.json',mode:'100644',type:'blob',sha:(await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:JSON.stringify(ps,null,2)+'\n',encoding:'utf-8'})})).sha});
  const tree=await g(`${API}/git/trees`,e,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:treeItems})});
  const c=await g(`${API}/git/commits`,e,{method:'POST',body:JSON.stringify({message:`${existing?'Update':'Publish'} crochet tutorial: ${title}`,tree:tree.sha,parents:[head]})});
  await g(`${API}/git/refs/heads/${BRANCH}`,e,{method:'PATCH',body:JSON.stringify({sha:c.sha})});
  return out({ok:true,url:`/posts/${s}.html`,title});
}

async function deletePost(r,e){
  if(!await auth(r,e))return out({error:'Unauthorized'},401);
  if(!e.GITHUB_TOKEN)return out({error:'GITHUB_TOKEN is not configured'},500);
  const d=await r.json().catch(()=>({}));
  const s=slug(d.slug||'');
  if(!s)return out({error:'Slug is required.'},400);
  let ps=await posts(e);
  const before=ps.length;
  ps=ps.filter(p=>p.slug!==s);
  if(ps.length===before)return out({error:'Post not found in catalog.'},404);
  const ref=await g(`${API}/git/ref/heads/${BRANCH}`,e);
  const head=ref.object.sha;
  const commit=await g(`${API}/git/commits/${head}`,e);
  const pb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:JSON.stringify(ps,null,2)+'\n',encoding:'utf-8'})});
  const tree=await g(`${API}/git/trees`,e,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:[{path:'data/posts.json',mode:'100644',type:'blob',sha:pb.sha}]})});
  const c=await g(`${API}/git/commits`,e,{method:'POST',body:JSON.stringify({message:`Remove tutorial from catalog: ${s}`,tree:tree.sha,parents:[head]})});
  await g(`${API}/git/refs/heads/${BRANCH}`,e,{method:'PATCH',body:JSON.stringify({sha:c.sha})});
  return out({ok:true,slug:s});
}

async function getPostHtml(r,e,u){
  if(!await auth(r,e))return out({error:'Unauthorized'},401);
  const s=String(u.searchParams.get('slug')||'').trim();
  if(!s)return out({error:'slug is required'},400);
  const list=await posts(e);
  const p=list.find(x=>x.slug===s);
  if(p&&(p.materials||p.intro||p.steps||p.rawContent)){
    return out({ok:true,slug:s,title:p.title||s,html:page(p)});
  }
  const path=`/posts/${s}.html`;
  let a=await e.ASSETS.fetch(new Request(new URL(path,r.url),{method:'GET'}));
  if(!a.ok){
    const x=await fetch(`${RAW}${path}`);
    if(x.ok)a=x; else return out({error:'Post HTML not found for '+s},404);
  }
  return out({ok:true,slug:s,title:(p&&p.title)||s,html:await a.text()});
}

async function publishHtml(r,e){
  if(!await auth(r,e))return out({error:'Unauthorized'},401);
  if(!e.GITHUB_TOKEN)return out({error:'GITHUB_TOKEN is not configured'},500);
  const d=await r.json().catch(()=>({}));
  let html=String(d.html||'').trim();
  if(!html)return out({error:'Paste your tutorial HTML first.'},400);
  
  const m=String(d.imageDataUrl||'').match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
  if(m&&m[2].length>5500000)return out({error:'Image is too large. Keep it under about 4 MB.'},400);
  const titleMatch=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title=cleanText(titleMatch&&titleMatch[1]);
  if(!title)return out({error:'Your HTML needs a <title> or <h1> so the post URL can be created automatically.'},400);
  const descMatch=html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const description=cleanText(descMatch&&descMatch[1])||`${title} — a step-by-step crochet tutorial from Sara Rain Crochet.`;
  const s=slug(d.slug||title);
  if(!s)return out({error:'Could not create a URL slug from the HTML title.'},400);
  let ps=await posts(e);
  const existing=ps.find(p=>p.slug===s);
  let image,ext='jpg',ib=null;
  if(m){
    ext=m[1]==='png'?'png':m[1]==='webp'?'webp':'jpg';
    image=`/images/pins/pin-${s}.${ext}`;
  } else if(existing&&existing.image){
    image=existing.image;
  } else {
    return out({error:'Upload a JPG, PNG, or WebP Pinterest pin (required for new posts).'},400);
  }
  const url=`https://sararaincrochet.com/posts/${s}.html`;
  if(m) html=replacePinImage(html,image,title);
  html=addMissingMeta(html,title,description,url,image);
  html=normalizeTutorialHeader(html,title,description);
  const ref=await g(`${API}/git/ref/heads/${BRANCH}`,e);
  const head=ref.object.sha;
  const commit=await g(`${API}/git/commits/${head}`,e);
  if(m) ib=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:m[2],encoding:'base64'})});
  const hb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:html,encoding:'utf-8'})});
  ps=ps.filter(p=>p.slug!==s);
  ps.unshift({slug:s,title,description,category:(existing&&existing.category)||'Crochet tutorial',readTime:(existing&&existing.readTime)||'12 min read',image,published:true});
  const pb=await g(`${API}/git/blobs`,e,{method:'POST',body:JSON.stringify({content:JSON.stringify(ps,null,2)+'\n',encoding:'utf-8'})});
  const treeItems=[{path:`public/posts/${s}.html`,mode:'100644',type:'blob',sha:hb.sha},{path:'data/posts.json',mode:'100644',type:'blob',sha:pb.sha}];
  if(ib) treeItems.push({path:`public/images/pins/pin-${s}.${ext}`,mode:'100644',type:'blob',sha:ib.sha});
  const tree=await g(`${API}/git/trees`,e,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:treeItems})});
  const c=await g(`${API}/git/commits`,e,{method:'POST',body:JSON.stringify({message:`Publish crochet tutorial: ${title}`,tree:tree.sha,parents:[head]})});
  await g(`${API}/git/refs/heads/${BRANCH}`,e,{method:'PATCH',body:JSON.stringify({sha:c.sha})});
  return out({ok:true,url:`/posts/${s}.html`,title});
}

async function api(r,e,u){
  if(u.pathname==='/api/posts'&&r.method==='GET')return out(await posts(e));
  if(u.pathname==='/api/admin/session')return out({authenticated:await auth(r,e)});
  if(u.pathname==='/api/admin/login'&&r.method==='POST'){
    const d=await r.json().catch(()=>({})),i=String(d.identifier||'').trim().toLowerCase(),p=String(d.password||''),un=String(e.ADMIN_USERNAME||'').trim().toLowerCase(),em=String(e.ADMIN_EMAIL||'').trim().toLowerCase();
    if(!e.ADMIN_PASSWORD||(!un&&!em))return out({error:'Admin credentials are not configured.'},500);
    if(p!==e.ADMIN_PASSWORD||(i!==un&&i!==em))return out({error:'Invalid login details.'},401);
    const token=await session(e,i);
    return new Response(JSON.stringify({ok:true,authenticated:true}),{headers:{...J,'Set-Cookie':`sara_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`}})
  }
  if(u.pathname==='/api/admin/logout'&&r.method==='POST')return new Response(JSON.stringify({ok:true}),{headers:{...J,'Set-Cookie':'sara_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'}});
  if(u.pathname==='/api/admin/publish'&&r.method==='POST')return publishStructured(r,e);
  if(u.pathname==='/api/admin/delete'&&r.method==='POST')return deletePost(r,e);
  if(u.pathname==='/api/admin/post-html'&&r.method==='GET')return getPostHtml(r,e,u);
  if(u.pathname==='/api/admin/publish-html'&&r.method==='POST')return publishHtml(r,e);
  return out({error:'Not found'},404)
}

export default{async fetch(r,e){
  const u=new URL(r.url);
  if(u.pathname.startsWith('/api/'))return api(r,e,u);
  if(u.pathname==='/sara'||u.pathname==='/sara/'){
    const a=await e.ASSETS.fetch(new Request(new URL('/sara/index.html',r.url),{headers:{'cache-control':'no-cache'},method:'GET'}));
    return new Response(a.body,{status:a.status,statusText:a.statusText,headers:new Headers({...Object.fromEntries(a.headers),'cache-control':'no-store'})})
  }
  if(u.pathname==='/'||u.pathname==='/index.html'){
    const a=await e.ASSETS.fetch(r);if(!a.ok)return a;
    const ps=await posts(e);if(!ps.length)return a;let h=await a.text();
    const cards=ps.map(p=>`<a class="pinterest-card" href="/posts/${p.slug}.html"><img src="${p.image}" alt="${esc(p.title)}" loading="lazy"><div class="pinterest-card-content"><h3>${esc(p.title)}</h3><span>Read tutorial →</span></div></a>`).join('');
    const sectionStart=h.indexOf('<section class="pinterest-section"');
    const gridStart=sectionStart>=0?h.indexOf('<div class="pinterest-grid">',sectionStart):-1;
    const gridEnd=gridStart>=0?h.indexOf('</div></div></section>',gridStart):-1;
    if(gridStart>=0&&gridEnd>=0){
      h=h.slice(0,gridStart)+`<div class="pinterest-grid">${cards}</div>`+h.slice(gridEnd+'</div>'.length);
    }
    return new Response(h,{headers:new Headers({...Object.fromEntries(a.headers),'cache-control':'no-store'})})
  }
  if(u.pathname.startsWith('/posts/')){
    const sl=u.pathname.split('/').pop().replace(/\.html$/,'');const p=(await posts(e)).find(x=>x.slug===sl);
    if(p&&(p.materials||p.intro||p.steps||p.rawContent))return new Response(page(p),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60'}});
    const a=await e.ASSETS.fetch(r);if(a.ok)return a;const x=await fetch(`${RAW}${u.pathname}`,{cf:{cacheTtl:300}});if(x.ok)return x
  }
  if(u.pathname.startsWith('/images/pins/')){
    const a=await e.ASSETS.fetch(r);if(a.ok)return a;const x=await fetch(`${RAW}${u.pathname}`,{cf:{cacheTtl:300}});if(x.ok)return x
  }
  return e.ASSETS.fetch(r)
}};
