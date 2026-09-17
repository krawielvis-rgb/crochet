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
  'crochet-sunglasses-case-tutorial'
]);

function filterHomepageCards(html) {
  if (!html) return html;
  let updated = html;
  for (const hiddenSlug of HIDDEN_HOME_SLUGS) {
    const escaped = hiddenSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cardRe = new RegExp(`<a\\b[^>]*class=["'][^"']*pinterest-card[^"']*["'][^>]*href=["']/posts/${escaped}\\.html["'][^>]*>[\\s\\S]*?<\\/a>`, 'gi');
    updated = updated.replace(cardRe, '');
  }
  return updated;
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function injectUploadedImage(html, image, title) {
  if (!html || !image) return html;
  if (html.includes(image)) return html;
  if (html.includes('{{PIN_IMAGE}}')) return html.replaceAll('{{PIN_IMAGE}}', image);
  const safeTitle = String(title || 'Crochet tutorial').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/\"/g, '"');
  const tag = `<img src="${image}" alt="${safeTitle} crochet tutorial" style="max-width:100%;height:auto;display:block;margin:24px auto;">`;
  const mainMatch = html.match(/<main\\b[^>]*>[\\s\\S]*?<\\/main>/i);
  if (mainMatch) {
    const main = mainMatch[0];
    const h1Match = main.match(/<h1\\b[^>]*>[\\s\\S]*?<\\/h1>/i);
    if (h1Match) {
      const updatedMain = main.replace(h1Match[0], h1Match[0] + tag);
      return html.replace(main, updatedMain);
    }
    return html.replace(mainMatch[0], mainMatch[0].replace(/(<main\\b[^>]*>)/i, '$1' + tag));
  }
  const h1Match = html.match(/<h1\\b[^>]*>[\\s\\S]*?<\\/h1>/i);
  if (h1Match) return html.replace(h1Match[0], h1Match[0] + tag);
  if (/<body\\b[^>]*>/i.test(html)) return html.replace(/<body\\b[^>]*>/i, match => match + tag);
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
  const titleMatch = html.match(/<title\\b[^>]*>([\\s\\S]*?)<\\/title>/i) || html.match(/<h1\\b[^>]*>([\\s\\S]*?)<\\/h1>/i);
  const title = String(titleMatch ? titleMatch[1].replace(/<[^>]+>/g, ' ').trim() : 'Crochet tutorial');
  const imageMatch = imageDataUrl.match(/^data:image\\/(jpeg|jpg|png|webp);base64,/i);
  if (imageMatch && html) {
    const ext = imageMatch[1].toLowerCase() === 'png' ? 'png' : imageMatch[1].toLowerCase() === 'webp' ? 'webp' : 'jpg';
    const s = slugify(data.slug || title);
    if (s) {
      const image = `/images/pins/pin-${s}.${ext}`;
      data.html = injectUploadedImage(html, image, title);
    }
  }
  return new Request(request, {method: 'POST', headers: request.headers, body: JSON.stringify(data)});
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/sitemap.xml' || url.pathname === '/sitemaps.xml') {
      return new Response(SITEMAP, {status: 200, headers: {'Content-Type': 'application/xml; charset=UTF-8', 'Cache-Control': 'public, max-age=3600'}});
    }
    const preparedRequest = await prepareSaraPublish(request);
    const response = await tutorialWorker.fetch(preparedRequest, env, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const html = await response.text();
    const homepageFiltered = (url.pathname === '/' || url.pathname === '/index.html') ? filterHomepageCards(html) : html;
    const hasVerification = homepageFiltered.includes('eYCLA4SbSc8jRmc8bI729wq-QkDGAI2F5ctE3aKDy9o');
    const hasAnalytics = homepageFiltered.includes(GA_ID);
    let updated = homepageFiltered;
    if (!hasVerification) updated = updated.replace(/<head([^>]*)>/i, `<head$1>\n  ${GOOGLE_TAG}`);
    if (!hasAnalytics) updated = updated.replace(/<head([^>]*)>/i, `<head$1>\n  ${GA_TAG}`);
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    return new Response(updated, {status: response.status, statusText: response.statusText, headers});
  }
};
