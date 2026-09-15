(() => {
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  const visualTutorials = {
    'easy-crochet-baby-booties-pattern-for-beginners': {
      folder: 'baby-booties',
      steps: [
        ['01-baby-booties-materials.jpg', 'Materials & Yarn', /materials|preparation/i],
        ['02-baby-booties-start-sole.jpg', 'Starting the Sole', /step\s*1|oval sole|start.*sole/i],
        ['03-baby-booties-sole-rounds.jpg', 'Building the Sole', /sole.*round|build.*sole/i],
        ['04-baby-booties-toe.jpg', 'Shaping the Toe', /toe/i],
        ['05-baby-booties-sides.jpg', 'Crocheting the Sides', /upper|sides/i],
        ['06-baby-booties-cuff.jpg', 'Creating the Cuff', /cuff|opening/i],
        ['07-baby-booties-finishing.jpg', 'Finishing & Weaving Ends', /finishing|weaving|finish/i],
        ['08-baby-booties-finished.jpg', 'Finished Baby Booties', /finished|final/i]
      ]
    },
    'crochet-beanie-for-beginners-sara-rain-crochet': {
      folder: 'crochet-beanie',
      steps: [
        ['01-beanie-materials.jpg', 'Materials & Hook', /materials|preparation/i],
        ['02-beanie-starting-crown.jpg', 'Starting the Crown', /start.*crown|crown.*begin/i],
        ['03-beanie-crown-rounds.jpg', 'Working the Crown Rounds', /crown.*round|increase/i],
        ['04-beanie-crown-complete.jpg', 'Completed Crown', /completed crown|crown.*complete/i],
        ['05-beanie-side-walls.jpg', 'Building the Side Walls', /side walls|body|work.*down/i],
        ['06-beanie-shaping.jpg', 'Shaping the Beanie', /shap/i],
        ['07-beanie-finishing.jpg', 'Finishing & Weaving Ends', /finishing|weaving|finish/i],
        ['08-beanie-finished.jpg', 'Finished Crochet Beanie', /finished|final/i]
      ]
    },
    'crochet-bookmark-tutorial-sara-rain-crochet': {
      folder: 'crochet-bookmark',
      steps: [
        ['01-bookmark-materials.jpg', 'Materials & Hook', /materials|preparation/i],
        ['02-bookmark-starting-chain.jpg', 'Starting Chain', /starting chain|foundation chain/i],
        ['03-bookmark-first-row.jpg', 'First Crochet Row', /first row|row 1/i],
        ['04-bookmark-building-length.jpg', 'Building the Bookmark Length', /length|building.*bookmark/i],
        ['05-bookmark-pattern-detail.jpg', 'Creating the Stitch Pattern', /stitch pattern|pattern/i],
        ['06-bookmark-edging.jpg', 'Adding the Edging', /edging|border/i],
        ['07-bookmark-finishing.jpg', 'Finishing & Weaving Ends', /finishing|weaving|finish/i],
        ['08-bookmark-finished.jpg', 'Finished Crochet Bookmark', /finished|final/i]
      ]
    },
    'crochet-bag-charms': {
      folder: 'crochet-bag-charms',
      steps: [
        ['01-bag-charms-materials.jpg', 'Materials & Yarn', /materials|preparation/i],
        ['02-bag-charms-starting-piece.jpg', 'Starting the Charm', /start.*charm|starting piece|begin/i],
        ['03-bag-charms-building-shape.jpg', 'Building the Shape', /building.*shape|shape/i],
        ['04-bag-charms-detail.jpg', 'Adding the Crochet Details', /detail|details/i],
        ['05-bag-charms-adding-strap.jpg', 'Adding the Strap', /strap/i],
        ['06-bag-charms-adding-ring.jpg', 'Attaching the Key Ring', /key ring|ring/i],
        ['07-bag-charms-finishing.jpg', 'Finishing & Weaving Ends', /finishing|weaving|finish/i],
        ['08-bag-charms-finished.jpg', 'Finished Crochet Bag Charm', /finished|final/i]
      ]
    }
  };

  const makeFigure = (folder, filename, title, index) => {
    const figure = document.createElement('figure');
    figure.className = 'distributed-visual-step';
    figure.innerHTML = `
      <img src="/images/tutorials/${folder}/${filename}"
           alt="${escapeHtml(title)} for this crochet tutorial"
           loading="lazy" decoding="async">
      <figcaption><span>Step ${index + 1}</span><strong>${escapeHtml(title)}</strong></figcaption>
    `;
    return figure;
  };

  const addBucketHatSteps = (article) => {
    if (article.querySelector('.bucket-hat-distributed')) return;

    const oldHeading = [...article.querySelectorAll('h2')].find(h => /visual step-by-step/i.test(h.textContent));
    if (oldHeading) {
      const oldText = oldHeading.nextElementSibling;
      const oldContainer = oldText?.nextElementSibling;
      oldHeading.remove();
      if (oldText?.tagName === 'P') oldText.remove();
      if (oldContainer?.classList.contains('visual-steps')) oldContainer.remove();
    }

    const stepHeadings = [...article.querySelectorAll('h3')]
      .filter(h => /^step\s*[1-8]\b/i.test(h.textContent.trim()))
      .slice(0, 8);

    const steps = [
      ['01-materials.jpg', 'Materials & Preparation'],
      ['02-starting-crown.jpg', 'Starting the Crown'],
      ['03-crown-increases.jpg', 'Building the Circular Crown'],
      ['04-completed-crown.jpg', 'Completed Crown'],
      ['05-side-walls.jpg', 'Building the Side Walls'],
      ['06-brim-increases.jpg', 'Brim Increases'],
      ['07-finishing-brim.jpg', 'Finishing the Brim'],
      ['08-finished-bucket-hat.jpg', 'Finished Bucket Hat']
    ];

    // Keep the first materials photo near the preparation content, then place
    // each construction photo immediately after its corresponding step content.
    const materialsHeading = [...article.querySelectorAll('h2')].find(h => /materials.*preparation/i.test(h.textContent));
    if (materialsHeading) {
      const figure = makeFigure('bucket-hat', steps[0][0], steps[0][1], 0);
      let anchor = materialsHeading;
      let next = anchor.nextElementSibling;
      while (next && next.tagName !== 'H2') {
        anchor = next;
        next = next.nextElementSibling;
      }
      anchor.insertAdjacentElement('afterend', figure);
    }

    stepHeadings.forEach((heading, i) => {
      const step = steps[i + 1];
      if (!step) return;
      const figure = makeFigure('bucket-hat', step[0], step[1], i + 1);
      let anchor = heading;
      let next = anchor.nextElementSibling;
      // Put the image after the explanatory content/checkpoint, not before it.
      if (next && !/^H[23]$/.test(next.tagName)) {
        anchor = next;
        next = next.nextElementSibling;
        if (next && next.classList.contains('pattern-box')) anchor = next;
        else if (next && next.classList.contains('checkpoint')) anchor = next;
      }
      anchor.insertAdjacentElement('afterend', figure);
    });

    article.classList.add('bucket-hat-distributed');
  };

  const addVisualSteps = (article) => {
    const key = Object.keys(visualTutorials).find((slug) => location.pathname.includes(slug));
    if (!key || article.querySelector('.distributed-visual-step')) return;

    const config = visualTutorials[key];
    const headings = [...article.querySelectorAll('h2')];
    const used = new Set();

    config.steps.forEach(([filename, title, pattern], index) => {
      let heading = headings.find((h) => !used.has(h) && pattern.test(h.textContent));
      if (!heading) {
        const fallbackIndex = Math.min(index + 1, headings.length - 1);
        heading = headings.find((h, i) => i === fallbackIndex && !used.has(h));
      }
      if (!heading) return;
      used.add(heading);

      const section = heading.closest('section') || heading;
      section.insertAdjacentElement('afterend', makeFigure(config.folder, filename, title, index));
    });
  };

  const init = () => {
    const article = document.querySelector('article.content, article.main, article');
    if (!article) return;

    const shell = document.querySelector('.tutorial-shell');
    const header = document.querySelector('.tutorial-header');
    const hero = document.querySelector('.hero');
    const facts = document.querySelector('.facts');
    if (!shell || !header) return;

    const headings = [...article.querySelectorAll('h2')];
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
    });

    if (headings.length >= 3 && !document.querySelector('.tutorial-jumpbar')) {
      const jumpbar = document.createElement('nav');
      jumpbar.className = 'tutorial-jumpbar';
      jumpbar.setAttribute('aria-label', 'Tutorial sections');
      const preferred = headings.filter(h => /materials|gauge|pattern|step-by-step|finishing|troubleshooting/i.test(h.textContent));
      const selected = (preferred.length ? preferred : headings).slice(0, 6);
      jumpbar.innerHTML = selected.map(h => `<a href="#${h.id}">${escapeHtml(h.textContent)}</a>`).join('');
      header.insertAdjacentElement('afterend', jumpbar);
    }

    if (facts && !document.querySelector('.quick-pattern')) {
      const values = [...facts.querySelectorAll('.fact')].map(f => ({
        label: f.querySelector('strong')?.textContent.trim() || '',
        value: f.textContent.replace(f.querySelector('strong')?.textContent || '', '').trim()
      })).filter(x => x.value);
      const quick = document.createElement('section');
      quick.className = 'quick-pattern';
      quick.setAttribute('aria-label', 'Quick pattern information');
      quick.innerHTML = `<div><span>QUICK PATTERN</span><strong>Plan it before you stitch</strong></div><dl>${values.map(x => `<div><dt>${escapeHtml(x.label)}</dt><dd>${escapeHtml(x.value)}</dd></div>`).join('')}</dl><a href="#${headings[0]?.id || 'section-1'}">Start the tutorial ↓</a>`;
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

    if (location.pathname.includes('crochet-bucket-hat')) addBucketHatSteps(article);
    else addVisualSteps(article);

    if (!document.querySelector('.tutorial-backtop')) {
      const back = document.createElement('a');
      back.className = 'tutorial-backtop';
      back.href = '#top';
      back.textContent = 'Back to top ↑';
      article.appendChild(back);
      document.body.id = 'top';
    }

    article.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });

    if (!document.querySelector('#distributed-visual-step-style')) {
      const style = document.createElement('style');
      style.id = 'distributed-visual-step-style';
      style.textContent = `
        .distributed-visual-step{margin:38px 0 48px;padding:0;background:transparent}
        .distributed-visual-step img{display:block;width:100%;max-width:760px;height:auto;max-height:620px;object-fit:cover;border-radius:18px;box-shadow:0 14px 38px rgba(38,53,47,.13);margin:0 auto}
        .distributed-visual-step figcaption{display:flex;align-items:baseline;gap:12px;max-width:760px;margin:12px auto 0;padding:0 4px;color:#68736d;font-family:Arial,sans-serif;font-size:.88rem}
        .distributed-visual-step figcaption span{color:#45695a;text-transform:uppercase;letter-spacing:.1em;font-size:.68rem;font-weight:700;white-space:nowrap}
        .distributed-visual-step figcaption strong{font-family:Georgia,"Times New Roman",serif;color:#26352f;font-size:1.05rem;font-weight:600}
        @media(max-width:760px){.distributed-visual-step{margin:30px 0 40px}.distributed-visual-step img{border-radius:14px}.distributed-visual-step figcaption{display:block}.distributed-visual-step figcaption span{display:block;margin-bottom:4px}}
      `;
      document.head.appendChild(style);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
