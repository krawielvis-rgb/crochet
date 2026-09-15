import baseWorker from './worker-v2.js';

const TUTORIALS={
'easy-crochet-baby-booties-pattern-for-beginners-sara-rain-crochet':['baby-booties',['01-baby-booties-materials.jpg','02-baby-booties-start-sole.jpg','03-baby-booties-sole-rounds.jpg','04-baby-booties-toe.jpg','05-baby-booties-sides.jpg','06-baby-booties-cuff.jpg','07-baby-booties-finishing.jpg','08-baby-booties-finished.jpg'],['Materials & Yarn','Starting the Sole','Building the Sole','Shaping the Toe','Crocheting the Sides','Creating the Cuff','Finishing & Weaving Ends','Finished Baby Booties']],
'crochet-beanie-for-beginners-sara-rain-crochet':['crochet-beanie',['01-beanie-materials.jpg','02-beanie-starting-crown.jpg','03-beanie-crown-rounds.jpg','04-beanie-crown-complete.jpg','05-beanie-side-walls.jpg','06-beanie-shaping.jpg','07-beanie-finishing.jpg','08-beanie-finished.jpg'],['Materials & Hook','Starting the Crown','Working the Crown Rounds','Completed Crown','Building the Side Walls','Shaping the Beanie','Finishing & Weaving Ends','Finished Crochet Beanie']],
'crochet-bookmark-tutorial-sara-rain-crochet':['crochet-bookmark',['01-bookmark-materials.jpg','02-bookmark-starting-chain.jpg','03-bookmark-first-row.jpg','04-bookmark-building-length.jpg','05-bookmark-pattern-detail.jpg','06-bookmark-edging.jpg','07-bookmark-finishing.jpg','08-bookmark-finished.jpg'],['Materials & Hook','Starting Chain','First Crochet Row','Building the Bookmark Length','Creating the Stitch Pattern','Adding the Edging','Finishing & Weaving Ends','Finished Crochet Bookmark']],
'crochet-bag-charms':['crochet-bag-charms',['01-bag-charms-materials.jpg','02-bag-charms-starting-piece.jpg','03-bag-charms-building-shape.jpg','04-bag-charms-detail.jpg','05-bag-charms-adding-strap.jpg','06-bag-charms-adding-ring.jpg','07-bag-charms-finishing.jpg','08-bag-charms-finished.jpg'],['Materials & Yarn','Starting the Charm','Building the Shape','Adding the Crochet Details','Adding the Strap','Attaching the Key Ring','Finishing & Weaving Ends','Finished Crochet Bag Charm']]
};

const css='<style id="tutorial-process-images">.tutorial-process-gallery{margin:45px 0}.tutorial-process-image{margin:38px 0 52px;max-width:760px}.tutorial-process-image img{display:block;width:100%;height:auto;border-radius:18px;box-shadow:0 16px 42px rgba(38,53,47,.14)}.tutorial-process-image figcaption{margin-top:12px;font:15px/1.5 Arial,sans-serif;color:#68736d}.tutorial-process-image figcaption strong{font:600 18px Georgia,serif;color:#26352f;margin-left:10px}@media(max-width:700px){.tutorial-process-image{margin:30px 0 40px}.tutorial-process-image img{border-radius:14px}}</style>';

function gallery(folder,files,titles){return '<div class="tutorial-process-gallery" aria-label="Visual step-by-step tutorial">'+files.map((file,i)=>'<figure class="tutorial-process-image"><img src="/images/tutorials/'+folder+'/'+file+'" alt="'+titles[i]+' — crochet tutorial step '+(i+1)+'" loading="lazy" decoding="async"><figcaption><span>Step '+(i+1)+'</span><strong>'+titles[i]+'</strong></figcaption></figure>').join('')+'</div>'}

function enhance(html,config){
 if(html.includes('id="tutorial-process-images"'))return html;
 const block=gallery(config[0],config[1],config[2]);
 const marker=html.match(/<div class="facts"[\s\S]*?<\/div>/i);
 let out=marker?html.slice(0,marker.index+marker[0].length)+block+html.slice(marker.index+marker[0].length):html.replace(/<main\b[^>]*>/i,m=>m+block);
 return out.replace('</head>',css+'</head>');
}

export default{async fetch(request,env,ctx){
 const url=new URL(request.url); const slug=url.pathname.split('/').pop().replace(/\.html$/,''); const config=TUTORIALS[slug];
 if(!config)return baseWorker.fetch(request,env,ctx);
 const response=await baseWorker.fetch(request,env,ctx); const type=response.headers.get('content-type')||'';
 if(!response.ok||!type.includes('text/html'))return response;
 const html=await response.text(); const headers=new Headers(response.headers); headers.set('Cache-Control','no-store,max-age=0');
 return new Response(enhance(html,config),{status:response.status,statusText:response.statusText,headers});
}};
