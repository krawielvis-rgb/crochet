import baseWorker from './worker-v2.js';

const REMOVED_SLUG = 'crochet-sunglasses-case';
const REMOVED_HOME_CARDS = /<a class="pinterest-card" href="\/posts\/(?:crochet-sunglasses-case|crochet-sunglasses-case-for-beginners)\.html">[\s\S]*?<\/a>\s*/gi;

const TUTORIALS = {
  'easy-crochet-baby-booties-pattern-for-beginners-sara-rain-crochet': ['baby-booties', ['01-baby-booties-materials.jpg','02-baby-booties-start-sole.jpg','03-baby-booties-sole-rounds.jpg','04-baby-booties-toe.jpg','05-baby-booties-sides.jpg','06-baby-booties-cuff.jpg','07-baby-booties-finishing.jpg','08-baby-booties-finished.jpg'], ['Materials & Yarn','Starting the Sole','Building the Sole','Shaping the Toe','Crocheting the Sides','Creating the Cuff','Finishing & Weaving Ends','Finished Baby Booties']],
  'crochet-beanie-for-beginners-sara-rain-crochet': ['crochet-beanie', ['01-beanie-materials.jpg','02-beanie-starting-crown.jpg','03-beanie-crown-rounds.jpg','04-beanie-crown-complete.jpg','05-beanie-side-walls.jpg','06-beanie-shaping.jpg','07-beanie-finishing.jpg','08-beanie-finished.jpg'], ['Materials & Hook','Starting the Crown','Working the Crown Rounds','Completed Crown','Building the Side Walls','Shaping the Beanie','Finishing & Weaving Ends','Finished Crochet Beanie']],
  'crochet-bookmark-tutorial-sara-rain-crochet': ['crochet-bookmark', ['01-bookmark-materials.jpg','02-bookmark-starting-chain.jpg','03-bookmark-first-row.jpg','04-bookmark-building-length.jpg','05-bookmark-pattern-detail.jpg','06-bookmark-edging.jpg','07-bookmark-finishing.jpg','08-bookmark-finished.jpg'], ['Materials & Hook','Starting Chain','First Crochet Row','Building the Bookmark Length','Creating the Stitch Pattern','Adding the Edging','Finishing & Weaving Ends','Finished Crochet Bookmark']],
  'crochet-bag-charms': ['crochet-bag-charms', ['01-bag-charms-materials.jpg','02-bag-charms-starting-piece.jpg','03-bag-charms-building-shape.jpg','04-bag-charms-detail.jpg','05-bag-charms-adding-strap.jpg','06-bag-charms-adding-ring.jpg','07-bag-charms-finishing.jpg','08-bag-charms-finished.jpg'], ['Materials & Yarn','Starting the Charm','Building the Shape','Adding the Crochet Details','Adding the Strap','Attaching the Key Ring','Finishing & Weaving Ends','Finished Crochet Bag Charm']]
};

const CSS = `<style id="tutorial-process-images">.tutorial-process-gallery{margin:50px 0 70px}.tutorial-process-image{margin:0 0 55px;max-width:760px}.tutorial-process-image img{display:block;width:100%;height:auto;border-radius:18px;box-shadow:0 16px 42px rgba(38,53,47,.14)}.tutorial-process-image figcaption{margin:12px 4px 0;color:#68736d;font:15px/1.5 Arial,sans-serif}.tutorial-process-image figcaption strong{color:#26352f;font:600 20px Georgia,serif;margin-left:10px}.tutorial-process-label{color:#45695a;text-transform:uppercase;letter-spacing:.1em;font:700 10px Arial,sans-serif}@media(max-width:700px){.tutorial-process-image{margin-bottom:40px}.tutorial-process-image img{border-radius:14px}}</style>`;

function gallery(folder, files, titles) {
  return `<section class="tutorial-process-gallery" aria-label="Visual step-by-step tutorial"><h2>Visual Step-by-Step</h2>${files.map((file,i) => `<figure class="tutorial-process-image"><img src="/images/tutorials/${folder}/${file}?v=2" alt="${titles[i]} — crochet tutorial step ${i+1}"><figcaption><span class="tutorial-process-label">Step ${i+1}</span><strong>${titles[i]}</strong></figcaption></figure>`).join('')}</section>`;
}

function enhance(html, config) {
  if (html.includes('tutorial-process-gallery')) return html;
  const block = gallery(config[0], config[1], config[2]);
  const mainOpen = html.match(/<main\b[^>]*>/i);
  if (!mainOpen) return html;
  const at = mainOpen.index + mainOpen[0].length;
  return html.slice(0, at) + block + html.slice(at).replace('</head>', CSS + '</head>');
}

function stripRemovedHomeCards(html) {
  return html.replace(REMOVED_HOME_CARDS, '');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const slug = url.pathname.replace(/^\/posts\//, '').replace(/\.html$/, '').replace(/\/$/, '');

    if (slug === REMOVED_SLUG) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
      });
    }

    const isHome = url.pathname === '/' || url.pathname === '/index.html';
    const config = TUTORIALS[slug];
    if (!config && !isHome) return baseWorker.fetch(request, env, ctx);

    const response = await baseWorker.fetch(request, env, ctx);
    const type = response.headers.get('content-type') || '';
    if (!response.ok || !type.includes('text/html')) return response;

    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    headers.delete('ETag');

    if (isHome) {
      return new Response(stripRemovedHomeCards(html), { status: response.status, statusText: response.statusText, headers });
    }

    return new Response(enhance(html, config), { status: response.status, statusText: response.statusText, headers });
  }
};
