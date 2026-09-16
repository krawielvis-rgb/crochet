import tutorialWorker from './tutorial-image-wrapper.js';

const GOOGLE_TAG = '<meta name="google-site-verification" content="eYCLA4SbSc8jRmc8bI729wq-QkDGAI2F5ctE3aKDy9o" />';

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://sararaincrochet.com/</loc></url>
  <url><loc>https://sararaincrochet.com/about.html</loc></url>
  <url><loc>https://sararaincrochet.com/privacy-policy.html</loc></url>
  <url><loc>https://sararaincrochet.com/cookie-policy.html</loc></url>
  <url><loc>https://sararaincrochet.com/terms.html</loc></url>
  <url><loc>https://sararaincrochet.com/contact.html</loc></url>
  <url><loc>https://sararaincrochet.com/pinterest-tutorials.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/first-crochet-project.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/granny-square.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/yarn-guide.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/amigurumi.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-flower.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/how-to-read-crochet-patterns.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/single-vs-double-crochet.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-hook-sizes-guide.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/how-to-fix-crochet-mistakes.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-blanket-for-beginners.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/magic-ring-tutorial.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-vs-knitting.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/best-yarn-for-amigurumi.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/how-to-crochet-in-the-round.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-stitch-abbreviations.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/how-to-crochet-a-scarf.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-gift-ideas.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/how-to-block-crochet.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-tension-guide.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/c2c-crochet-guide.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-coasters-pattern.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/how-to-join-yarn.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-vs-store-bought.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-market-bag.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/seasonal-crochet-projects.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-pencil-bag.html</loc></url>
  <url><loc>https://sararaincrochet.com/posts/crochet-bag-charms.html</loc></url>
</urlset>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/sitemap.xml' || url.pathname === '/sitemaps.xml') {
      return new Response(SITEMAP, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    const response = await tutorialWorker.fetch(request, env, ctx);
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) return response;

    const html = await response.text();
    if (html.includes('eYCLA4SbSc8jRmc8bI729wq-QkDGAI2F5ctE3aKDy9o')) {
      return new Response(html, response);
    }

    const updated = html.replace(/<\/head>/i, `  ${GOOGLE_TAG}\n</head>`);
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');

    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
