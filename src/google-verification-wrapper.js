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
  'crochet-baby-blanket',
  'crochet-baby-booties',
  'crochet-beanie',
  'crochet-bookmark',
  'crochet-bucket-hat',
  'crochet-cardigan',
  'crochet-crop-top',
  'crochet-dog-bandana',
  'crochet-ear-warmer',
  'crochet-fingerless-gloves',
  'crochet-headband',
  'crochet-keychain',
  'crochet-laptop-sleeve',
  'crochet-mug-cozy',
  'crochet-pencil-bag',
  'crochet-pet-sweater',
  'crochet-pillow-cover',
  'crochet-placemat',
  'crochet-plant-hanger',
  'crochet-scrunchie',
  'crochet-socks',
  'crochet-table-runner',
  'crochet-tote-bag',
  'crochet-wall-hanging',
  'easy-crochet-baby-blanket-pattern-for-beginners-sara-rain-crochet'
]);

const esc = (value) => String(value || '')
  .replace(/&/g, '&')
  .replace(/</g, '<')
  .replace(/>/g, '>')
  .replace(/"/g, '"');

function filterHomepageCards(html) {
  if (!html) return html;
  let updated = html;
  for (const hiddenSlug of HIDDEN_HOME_SLUGS) {
    const cardRe = new RegExp(
      '<a[^>]*class=["\'][^"\']*pinterest-card[^"\']*["\'][^>]*href=["\']/posts/' +
        hiddenSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
        '\\.html["\'][^>]*>[\\s\\S]*?</a>',
      'gi'
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
  return filterHomepageCards(html);
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
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
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

// Deploy trigger: hide 25 blank homepage cards 2026-09-21
