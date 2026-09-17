const REPO='krawielvis-rgb/crochet';
const BRANCH='main';
const API=`https://api.github.com/repos/${REPO}`;
const HIDDEN_HOME_SLUGS=new Set([
  'crochet-sunglasses-case',
  'crochet-sunglasses-case-tutorial',
  'crochet-mug-cozy-tutorial',
  'crochet-baby-blanket',
  'easy-crochet-baby-blanket-pattern-for-beginners-sara-rain-crochet'
]);

const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
const b64DecodeText=(value)=>{
  const clean=String(value||'').replace(/\s+/g,'');
  const bytes=Uint8Array.from(atob(clean),c=>c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};
const esc=x=>String(x||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
const cleanText=x=>String(x||'').replace(/<[^>]+>/g,' ').replace(/&/g,'&').replace(/\s+/g,' ').trim();
const slug=x=>String(x||'').toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);

const gh=e=>({Authorization:`Bearer ${e.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Sara-Rain-Crochet-Admin','Content-Type':'application/json'});
async function g(url,e,opt={}){
  const r=await fetch(url,{...opt,headers:{...gh(e),...(opt.headers||{})}});
  if(!r.ok){
    let msg='GitHub API '+r.status;
    try{const d=await r.json();if(d.message)msg+=': '+d.message;}catch{}
    throw Error(msg);
  }
  return r.json();
}

function validSession(request,env){
  const cookie=request.headers.get('Cookie')||'';
  const match=cookie.match(/(?:^|;\s*)sara_admin=([^;]+)/);
  if(!match)return false;
  try{
    const token=decodeURIComponent(match[1]);
    const [payload,signature]=token.split('.');
    if(!payload||!signature)return false;
    const secret=env.SESSION_SECRET||env.ADMIN_PASSWORD||'';
    const raw=atob(signature.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((signature.length+3)%4));
    const expected=payload;
    return !!secret && !!raw && !!expected;
  }catch{return false;}
}

async function sessionAuth(request,env){
  if(!validSession(request,env))return false;
  const cookie=request.headers.get('Cookie')||'';
  const token=decodeURIComponent((cookie.match(/(?:^|;\s*)sara_admin=([^;]+)/)||[])[1]||'');
  const [payload,signature]=token.split('.');
  try{
    const secret=env.SESSION_SECRET||env.ADMIN_PASSWORD||'';
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
    const sigBytes=Uint8Array.from(atob(signature.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((signature.length+3)%4)),c=>c.charCodeAt(0));
    const ok=await crypto.subtle.verify('HMAC',key,sigBytes,new TextEncoder().encode(payload));
    if(!ok)return false;
    const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((payload.length+3)%4)),c=>c.charCodeAt(0))));
    return Number(data.e)>Date.now();
  }catch{return false;}
}

async function readGitHubText(path,env){
  const file=await g(`${API}/contents/${path}?ref=${BRANCH}`,env);
  return {text:b64DecodeText(file.content),sha:file.sha};
}

function cardForPost(post){
  const s=String(post.slug||'').trim();
  const title=String(post.title||s).trim();
  const image=String(post.image||`/images/pins/pin-${s}.jpg`).trim();
  return `<a class="pinterest-card" href="/posts/${encodeURIComponent(s)}.html"><img src="${esc(image)}" alt="${esc(title)}" loading="lazy"><div class="pinterest-card-content"><h3>${esc(title)}</h3><span>Read tutorial →</span></div></a>`;
}

function findGridClose(html,gridStart){
  const openEnd=html.indexOf('>',gridStart)+1;
  if(openEnd<=0)return -1;
  let depth=0;
  const tagRe=/<\/?div\b[^>]*>/gi;
  tagRe.lastIndex=gridStart;
  let match;
  while((match=tagRe.exec(html))){
    const token=match[0];
    if(/^<div\b/i.test(token))depth++;
    else depth--;
    if(depth===0)return match.index;
  }
  return -1;
}

function removeHiddenCards(html){
  let updated=html;
  for(const hidden of HIDDEN_HOME_SLUGS){
    const re=new RegExp('<a\\b[^>]*class=["\\\'][^"\\\']*pinterest-card[^"\\\']["\\\'][^>]*href=["\\\']\\/posts\\/'+hidden+'\\.html["\\\'][^>]*>[\\s\\S]*?<\\/a>','gi');
    updated=updated.replace(re,'');
  }
  return updated;
}

function addHomepageCard(indexHtml,post){
  let html=removeHiddenCards(indexHtml);
  const gridStart=html.search(/<div\s+class=["']pinterest-grid["'][^>]*>/i);
  if(gridStart<0)return html;
  const gridClose=findGridClose(html,gridStart);
  if(gridClose<0)return html;
  const grid=html.slice(gridStart,gridClose);
  const cardSlug=String(post.slug||'').toLowerCase();
  const existingRe=new RegExp('href=["\\\']/posts/'+cardSlug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\.html["\\\']','i');
  if(existingRe.test(grid))return html;
  return html.slice(0,gridStart)+html.slice(gridStart,html.indexOf('>',gridStart)+1)+'\n      '+cardForPost(post)+html.slice(html.indexOf('>',gridStart)+1);
}

export async function publishSaraHtml(request,env){
  if(!(await sessionAuth(request,env)))return out({error:'Unauthorized'},401);
  if(!env.GITHUB_TOKEN)return out({error:'GITHUB_TOKEN is not configured'},500);
  const d=await request.json().catch(()=>({}));
  let html=String(d.html||'').trim();
  if(!html)return out({error:'Paste your tutorial HTML first.'},400);
  const imageDataUrl=String(d.imageDataUrl||'');
  const m=imageDataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
  if(m&&m[2].length>5500000)return out({error:'Image is too large. Keep it under about 4 MB.'},400);
  const titleMatch=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title=cleanText(titleMatch&&titleMatch[1]);
  if(!title)return out({error:'Your HTML needs a <title> or <h1> so the post URL can be created automatically.'},400);
  const descMatch=html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const description=cleanText(descMatch&&descMatch[1])||`${title} — a step-by-step crochet tutorial from Sara Rain Crochet.`;
  const s=slug(d.slug||title);
  if(!s)return out({error:'Could not create a URL slug from the HTML title.'},400);
  const imageExt=m?(m[1]==='png'?'png':m[1]==='webp'?'webp':'jpg'):null;
  const image=m?`/images/pins/pin-${s}.${imageExt}`:'';
  if(!image)return out({error:'Upload a JPG, PNG, or WebP Pinterest pin (required for new posts).'},400);

  const [postsFile,indexFile,ref]=await Promise.all([
    readGitHubText('data/posts.json',env),
    readGitHubText('index.html',env),
    g(`${API}/git/ref/heads/${BRANCH}`,env)
  ]);
  const head=ref.object.sha;
  const commit=await g(`${API}/git/commits/${head}`,env);
  let posts=JSON.parse(postsFile.text);
  if(!Array.isArray(posts))posts=[];
  const existing=posts.find(p=>p&&p.slug===s)||null;
  const post={slug:s,title,description,category:(existing&&existing.category)||'Crochet tutorial',readTime:(existing&&existing.readTime)||'12 min read',image,published:true};
  posts=posts.filter(p=>p&&p.slug!==s);
  posts.unshift(post);

  const indexUpdated=HIDDEN_HOME_SLUGS.has(s)
    ? removeHiddenCards(indexFile.text)
    : addHomepageCard(indexFile.text,post);

  const htmlBlob=await g(`${API}/git/blobs`,env,{method:'POST',body:JSON.stringify({content:html,encoding:'utf-8'})});
  const postsBlob=await g(`${API}/git/blobs`,env,{method:'POST',body:JSON.stringify({content:JSON.stringify(posts,null,2)+'\n',encoding:'utf-8'})});
  const indexBlob=await g(`${API}/git/blobs`,env,{method:'POST',body:JSON.stringify({content:indexUpdated,encoding:'utf-8'})});
  const treeItems=[
    {path:`public/posts/${s}.html`,mode:'100644',type:'blob',sha:htmlBlob.sha},
    {path:'data/posts.json',mode:'100644',type:'blob',sha:postsBlob.sha},
    {path:'index.html',mode:'100644',type:'blob',sha:indexBlob.sha}
  ];
  if(m)treeItems.push({path:`public/images/pins/pin-${s}.${imageExt}`,mode:'100644',type:'blob',sha:(await g(`${API}/git/blobs`,env,{method:'POST',body:JSON.stringify({content:m[2],encoding:'base64'})})).sha});

  const tree=await g(`${API}/git/trees`,env,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:treeItems})});
  const newCommit=await g(`${API}/git/commits`,env,{method:'POST',body:JSON.stringify({message:`Publish crochet tutorial: ${title}`,tree:tree.sha,parents:[head]})});
  await g(`${API}/git/refs/heads/${BRANCH}`,env,{method:'PATCH',body:JSON.stringify({sha:newCommit.sha})});
  return out({ok:true,url:`/posts/${s}.html`,title,homepageCard:!HIDDEN_HOME_SLUGS.has(s),commit:newCommit.sha});
}
