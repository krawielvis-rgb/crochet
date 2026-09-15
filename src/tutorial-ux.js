(() => {
  const init = () => {
    const article = document.querySelector('article.content');
    if (!article) return;

    const shell = document.querySelector('.tutorial-shell');
    const header = document.querySelector('.tutorial-header');
    const hero = document.querySelector('.hero');
    const facts = document.querySelector('.facts');
    if (!shell || !header) return;

    // Make every tutorial easier to scan without changing the existing visual identity.
    const headings = [...article.querySelectorAll('h2')];
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `section-${index + 1}`;
      }
    });

    if (headings.length >= 3 && !document.querySelector('.tutorial-jumpbar')) {
      const jumpbar = document.createElement('nav');
      jumpbar.className = 'tutorial-jumpbar';
      jumpbar.setAttribute('aria-label', 'Tutorial sections');
      const preferred = headings.filter(h => /materials|gauge|pattern|step-by-step|finishing|troubleshooting/i.test(h.textContent));
      const selected = (preferred.length ? preferred : headings).slice(0, 6);
      jumpbar.innerHTML = selected.map(h => `<a href="#${h.id}">${h.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a>`).join('');
      header.insertAdjacentElement('afterend', jumpbar);
    }

    if (facts && !document.querySelector('.quick-pattern')) {
      const values = [...facts.querySelectorAll('.fact')].map(f => ({
        label: f.querySelector('strong')?.textContent.trim() || '',
        value: f.querySelector('span')?.textContent.trim() || ''
      })).filter(x => x.value);
      const quick = document.createElement('section');
      quick.className = 'quick-pattern';
      quick.setAttribute('aria-label', 'Quick pattern information');
      quick.innerHTML = `<div><span>QUICK PATTERN</span><strong>Plan it before you stitch</strong></div><dl>${values.map(x => `<div><dt>${x.label}</dt><dd>${x.value}</dd></div>`).join('')}</dl><a href="#${headings[0]?.id || 'section-1'}">Start the tutorial ↓</a>`;
      facts.insertAdjacentElement('afterend', quick);
    }

    if (hero && !document.querySelector('.save-pattern')) {
      const save = document.createElement('aside');
      save.className = 'save-pattern';
      save.innerHTML = '<div><strong>Love this crochet idea?</strong><span>Save this tutorial to Pinterest so you can find the pattern again.</span></div><button type="button">Save this pattern</button>';
      save.querySelector('button').addEventListener('click', () => {
        const url = encodeURIComponent(window.location.href);
        const media = encodeURIComponent(hero.querySelector('img')?.src || '');
        const description = encodeURIComponent(document.title);
        window.open(`https://www.pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank', 'noopener,noreferrer');
      });
      hero.insertAdjacentElement('afterend', save);
    }

    if (!document.querySelector('.tutorial-backtop')) {
      const back = document.createElement('a');
      back.className = 'tutorial-backtop';
      back.href = '#top';
      back.textContent = 'Back to top ↑';
      article.appendChild(back);
      document.body.id = 'top';
    }

    // Prevent cumulative layout shift for images that do not already declare dimensions.
    article.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
