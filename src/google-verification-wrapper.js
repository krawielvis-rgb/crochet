import tutorialWorker from './tutorial-image-wrapper.js';

const GOOGLE_TAG = '<meta name="google-site-verification" content="eYCLA4SbSc8jRmc8bI729wq-QkDGAI2F5ctE3aKDy9o" />';

export default {
  async fetch(request, env, ctx) {
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
