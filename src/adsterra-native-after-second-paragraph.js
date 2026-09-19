const AD_SCRIPT_SRC =
  'https://pl31414585.profitableratecpmnetwork.com/2c6f0fc07e58621aea96ce4b630ffa15/invoke.js';

const CONTAINER_ID = 'container-2c6f0fc07e58621aea96ce4b630ffa15';
const GLOBAL_KEY = '__saraRainAdsterraNativeAfterSecondParagraph';

function insertAd() {
  if (window[GLOBAL_KEY]) return;

  // Only operate on individual post pages that contain the post article.
  const post = document.querySelector('main.article > article[data-enhanced="true"]');
  if (!post) return;

  // Prevent duplicate insertion if this script is accidentally included twice.
  if (post.querySelector('[data-adsterra-native-after-second-paragraph]')) {
    window[GLOBAL_KEY] = true;
    return;
  }

  const paragraphs = Array.from(post.querySelectorAll('p')).filter(
    (paragraph) => paragraph.textContent.trim().length > 0
  );

  // Wait until there are at least two real post paragraphs.
  if (paragraphs.length < 2) return;

  const anchor = paragraphs[1];

  const wrapper = document.createElement('div');
  wrapper.dataset.adsterraNativeAfterSecondParagraph = 'true';
  wrapper.style.cssText = 'margin: 32px 0; width: 100%;';

  const container = document.createElement('div');
  container.id = CONTAINER_ID;

  const script = document.createElement('script');
  script.async = true;
  script.dataset.cfasync = 'false';
  script.src = AD_SCRIPT_SRC;

  wrapper.append(container, script);
  anchor.insertAdjacentElement('afterend', wrapper);

  window[GLOBAL_KEY] = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', insertAd, { once: true });
} else {
  insertAd();
}
