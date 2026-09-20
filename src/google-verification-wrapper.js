import tutorialWorker from './tutorial-image-wrapper.js';

const GOOGLE_TAG = '<meta name="google-site-verification" content="eYCLA4SbSc8jRmc8bI729wq-QkDGAI2F5ctE3aKDy9o" />';
const GA_ID = 'G-NS6VRFWC64';
const GA_TAG = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>`;

const RAW = 'https://raw.githubusercontent.com/krawielvis-rgb/crochet/main';
const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://sararaincrochet.com/</loc></url>
  <url><loc>https://sararaincrochet.com/about.html</loc></url>
  <url><loc>https://sararaincrochet.com/privacy-policy.html</loc></url>
  <url><loc>https://sararaincrochet.com/cookie-policy.html</loc></url>
  <url><loc>https://sararaincrochet.com/terms.html</loc></url>
  <url><loc>https://sararaincrochet.com/contact.html</loc></url>
  <url><loc>https://sararaincrochet.com/pinterest-tutorials.html</loc></url>
</urlset>`;

const HIDDEN_HOME_SLUGS = new Set([
  'crochet-sunglasses-case',
  'react-artifact',
  'crochet-sunglasses-case-tutorial',
  'crochet-mug-cozy-tutorial',
  'crochet-baby-blanket',
  'easy-crochet-baby-blanket-pattern-for-beginners-sara-rain-crochet',
  'strawberry-granny-bandana-pink-and-white',
  'granny-bandana-crochet-pattern-sage-and-cream-triangle-beginner-friendly',
  'pumpkin-headphone-covers-fall-aesthetic-free-tutorial-beginner-friendly',
  'free-halloween-wind-spinner-5-in-1-tutorial',
  'cozy-halloween-beanie-gloves-pattern-quick-1-hour-make',
  'free-halloween-hair-clips-crochet-pattern-8-spooky-clips',
  'free-crochet-frog-witch-halloween-amigurumi',
  'free-fox-crochet-pattern-my-little-woodland-fox',
  'free-crochet-kitten-pattern-my-little-orange-kitty-beginner-friendly',
  'free-crochet-capybara-pattern-brown-baby-capy-with-orange-cap-beginner-amigurumi',
  'free-crochet-dinosaur-pattern-sage-green-baby-dino-with-yellow-spikes-beginner-a',
  'free-winter-crochet-penguin-cute-amigurumi-and-easy-pattern-beginner-tutorial',
  'free-fall-crochet-charms-bag-charms-and-keychains-ghost-bat-pumpkin-mushroom-lat',
  'free-fall-crochet-mosaic-mosaic-squares-and-halloween-coasters-beginner',
  'free-fall-crochet-flowers-3d-flowers-and-granny-squares-pouch-beginner-tutorial',
  'free-fall-crochet-pumpkins-beginner-tutorial-with-pictures',
  'free-mini-cat-keychains-low-sew-black-cat-with-bow',
  'free-mini-ghost-keychains-low-sew-tiny-pumpkins-pattern',
  'free-crochet-fall-chunky-bow-ear-warmer-quick-30-min-pattern',
  'free-cat-buddy-halloween-amigurumi-black-cat-plush-easy',
  'free-frog-buddy-halloween-amigurumi-witch-hat-frog-easy-plush',
  'free-ghost-pop-ghost-in-pumpkin-30-min-pop-toy-pattern',
  'free-halloween-bat-keychains-low-sew-easy-pattern',
  'free-crochet-spider-and-web-tutorial-spooky-cute-halloween-2026',
  'free-viral-crochet-kawaii-bats-halloween-fall-decor',
  'crochet-ghost-bag-charm-halloween-bag',
  'free-halloween-set-fingerless-gloves-ghost-mug-cozy',
  'free-chunky-fall-leg-warmers-quick-2-hour-pattern-sara-rain-crochet',
  'free-cozy-halloween-beanie-quick-crochet-pattern',
  'free-cozy-fall-fingerless-gloves-quick-1-hour-make',
  'free-cozy-twisted-ear-warmer-quick-30-min-pattern',
  'free-chunky-fall-beanie-cozy-pattern',
  'free-mini-bat-keychains-low-sew',
  'mini-pumpkin-30-min-pattern-tutorial',
  'crochet-black-cat-in-pumpkin-tutorial',
  'crochet-ghost-in-jack-o-lantern-tutorial',
  'crochet-halloween-bat-tutorial-sara-rain-crochet',
  'crochet-cozy-socks',
  'crochet-dog-bandana',
  'crochet-cardigan-tutorial',
  'easy-crochet-baby-booties-pattern-for-beginners-sara-rain-crochet',
  'crochet-beanie-for-beginners-sara-rain-crochet',
  'crochet-bookmark-tutorial-sara-rain-crochet',
  'crochet-bucket-hat',
  'first-crochet-project',
  'granny-square',
  'yarn-guide',
  'amigurumi',
  'crochet-flower',
  'how-to-read-crochet-patterns',
  'single-vs-double-crochet',
  'crochet-hook-sizes-guide',
  'how-to-fix-crochet-mistakes',
  'crochet-blanket-for-beginners'
]);

const esc = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\"/g, '&quot;');

function filterHomepageCards(html) {
  if (!html) return html;
  let updated = html;
  for (const hiddenSlug of HIDDEN_HOME_SLUGS) {
    const cardRe = new RegExp(
      '<a[^>]*class=["\\\'][^"\\\']*pinterest-card[^"\\\']["\\\'][^>]*href=["\\\']/posts/' +
        hiddenSlug +
        '\\\\.html["\\\'][^>]*>.*?</a>',
      'gis'
    );
    updated = updated.replace(cardRe, '');
  }
  return updated;
}

async function publishedPosts() {
  try {
    const response = await fetch(`${RAW}/data/posts.json?homepage=${Date.now()}`, {
      headers: { 'cache-control': 'no-cache' }
    });
    if (!response.ok) return [];
    const posts = await response.json();
    if (!Array.isArray(posts)) return [];
    return posts.filter((p) => {
      if (!p || p.published === false || !p.slug) return false;
      return !HIDDEN_HOME_SLUGS.has(String(p.slug).toLowerCase());
    });
  } catch {
    return [];
  }
}

function cardForPost(post) {
  const slug = String(post.slug || '').trim();
  const title = String(post.title || slug).trim();
  const image = String(post.image || `/images/pins/pin-${slug}.jpg`).trim();
  return `<a class="pinterest-card" href="/posts/${encodeURIComponent(slug)}.html"><img src="${esc(image)}" alt="${esc(title)}" loading="lazy"><div class="pinterest-card-content"><h3>${esc(title)}</h3><span>Read tutorial →</span></div></a>`;
}

async function ensureAutomaticHomepageCards(html) {
  if (!html) return html;
  // Do not auto-add posts to the homepage. The homepage card list in index.html is authoritative.
  return filterHomepageCards(html);
  /*
  const posts = await publishedPosts();
  let updated = filterHomepageCards(html);
  if (!posts.length) return updated;

  const gridStart = updated.search(/<div\s+class=["']pinterest-grid["'][^>]*>/i);
  if (gridStart < 0) return updated;
  const openEnd = updated.indexOf('>', gridStart) + 1;
  if (openEnd <= 0) return updated;

  let depth = 0;
  let pos = gridStart;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = gridStart;
  let closingGrid = -1;
  let match;
  while ((match = tagRe.exec(updated))) {
    if (match.index < gridStart) continue;
    const token = match[0];
    if (/^<div\b/i.test(token)) depth++;
    else depth--;
    if (depth === 0) {
      closingGrid = match.index;
      break;
    }
  }
  if (closingGrid < 0) return updated;

  const gridContent = updated.slice(openEnd, closingGrid);
  const existingSlugs = new Set();
  const hrefRe = /href=["']\/posts\/([^"']+)\.html["']/gi;
  let hrefMatch;
  while ((hrefMatch = hrefRe.exec(gridContent))) {
    existingSlugs.add(decodeURIComponent(hrefMatch[1]).toLowerCase());
  }

  const missingCards = posts
    .filter((post) => !existingSlugs.has(String(post.slug).toLowerCase()))
    .map(cardForPost)
    .filter(Boolean)
    .join('\n');

  if (!missingCards) return updated;
  return updated.slice(0, closingGrid) + '\n' + missingCards + '\n' + updated.slice(closingGrid);
  */
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function injectUploadedImage(html, image, title) {
  if (!html || !image) return html;
  if (html.includes(image)) return html;
  if (html.includes('{{PIN_IMAGE}}')) return html.replaceAll('{{PIN_IMAGE}}', image);
  const safeTitle = String(title || 'Crochet tutorial')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
  const tag = '<img src="' + image + '" alt="' + safeTitle + ' crochet tutorial" style="max-width:100%;height:auto;display:block;margin:24px auto;">';
  const mainRe = new RegExp('<main[^>]*>.*?</main>', 'is');
  const mainMatch = html.match(mainRe);
  if (mainMatch) {
    const main = mainMatch[0];
    const h1Re = new RegExp('<h1[^>]*>.*?</h1>', 'is');
    const h1Match = main.match(h1Re);
    if (h1Match) {
      const updatedMain = main.replace(h1Match[0], h1Match[0] + tag);
      return html.replace(main, updatedMain);
    }
    return html.replace(mainMatch[0], mainMatch[0].replace(new RegExp('(<main[^>]*>)', 'i'), '$1' + tag));
  }
  const h1Re = new RegExp('<h1[^>]*>.*?</h1>', 'is');
  const h1Match = html.match(h1Re);
  if (h1Match) return html.replace(h1Match[0], h1Match[0] + tag);
  const bodyRe = new RegExp('<body[^>]*>', 'i');
  if (bodyRe.test(html)) return html.replace(bodyRe, (match) => match + tag);
  return tag + html;
}

async function prepareSaraPublish(request) {
  if (request.method !== 'POST') return request;
  const url = new URL(request.url);
  if (url.pathname !== '/api/admin/publish-html') return request;
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== 'object') return request;
  const html = String(data.html || '');
  const imageDataUrl = String(data.imageDataUrl || '');
  const titleRe = new RegExp('<title[^>]*>(.*?)</title>', 'is');
  const h1Re = new RegExp('<h1[^>]*>(.*?)</h1>', 'is');
  const titleMatch = html.match(titleRe) || html.match(h1Re);
  const title = String(titleMatch ? titleMatch[1].replace(/<[^>]+>/g, ' ').trim() : 'Crochet tutorial');
  let imageMatch = null;
  const dataPrefix = 'data:image/';
  if (imageDataUrl.startsWith(dataPrefix)) {
    const rest = imageDataUrl.slice(dataPrefix.length);
    const semi = rest.indexOf(';base64,');
    if (semi > 0) {
      const kind = rest.slice(0, semi).toLowerCase();
      if (kind === 'jpeg' || kind === 'jpg' || kind === 'png' || kind === 'webp') {
        imageMatch = [imageDataUrl.slice(0, dataPrefix.length + semi + 8), kind];
      }
    }
  }
  if (imageMatch && html) {
    const kind = imageMatch[1].toLowerCase();
    const ext = kind === 'png' ? 'png' : kind === 'webp' ? 'webp' : 'jpg';
    const s = slugify(data.slug || title);
    if (s) {
      const image = '/images/pins/pin-' + s + '.' + ext;
      data.html = injectUploadedImage(html, image, title);
    }
  }
  return new Request(request, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(data),
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirect ONLY the built-in workers.dev hostname. Nothing else runs first.
    if (url.hostname === "crochet.krawielvis.workers.dev") {
      return Response.redirect(
        "https://sararaincrochet.com" + url.pathname + url.search,
        301
      );
    }
    if (url.pathname === '/sitemap.xml' || url.pathname === '/sitemaps.xml') {
      return new Response(SITEMAP, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    const preparedRequest = await prepareSaraPublish(request);
    const response = await tutorialWorker.fetch(preparedRequest, env, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const html = await response.text();
    const homepageCards = url.pathname === '/' || url.pathname === '/index.html'
      ? await ensureAutomaticHomepageCards(html)
      : html;
    const hasVerification = homepageCards.includes('eYCLA4SbSc8jRmc8bI729wq-QkDGAI2F5ctE3aKDy9o');
    const hasAnalytics = homepageCards.includes(GA_ID);
    let updated = homepageCards;
    if (!hasVerification) {
      updated = updated.replace(/<head([^>]*)>/i, '<head$1>' + String.fromCharCode(10) + '  ' + GOOGLE_TAG);
    }
    if (!hasAnalytics) {
      updated = updated.replace(/<head([^>]*)>/i, '<head$1>' + String.fromCharCode(10) + '  ' + GA_TAG);
    }
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};