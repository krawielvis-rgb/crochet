import baseWorker from './worker-v2.js';

const TUTORIALS = {
  'easy-crochet-baby-booties-pattern-for-beginners-sara-rain-crochet': {
    folder: 'baby-booties',
    markers: [
      ['Materials and Preparation', '01-baby-booties-materials.jpg', 'Materials & Yarn'],
      ['Step 1 — Crochet the Oval Sole', '02-baby-booties-start-sole.jpg', 'Starting the Sole'],
      ['Step 2 — Build the Upper', '03-baby-booties-sole-rounds.jpg', 'Building the Sole'],
      ['Step 3 — Shape the Toe', '04-baby-booties-toe.jpg', 'Shaping the Toe'],
      ['Step 4 — Finish the Opening', '05-baby-booties-sides.jpg', 'Crocheting the Sides'],
      ['Making the Second Bootie', '06-baby-booties-cuff.jpg', 'Creating the Cuff'],
      ['Troubleshooting', '07-baby-booties-finishing.jpg', 'Finishing & Weaving Ends'],
      ['Finishing the Booties', '08-baby-booties-finished.jpg', 'Finished Baby Booties']
    ]
  },
  'crochet-beanie-for-beginners-sara-rain-crochet': {
    folder: 'crochet-beanie',
    markers: [
      ['Materials & Preparation', '01-beanie-materials.jpg', 'Materials & Hook'],
      ['Start the Crown', '02-beanie-starting-crown.jpg', 'Starting the Crown'],
      ['Increase the Crown', '03-beanie-crown-rounds.jpg', 'Working the Crown Rounds'],
      ['Check the Crown Shape', '04-beanie-crown-complete.jpg', 'Completed Crown'],
      ['How to Check the Fit', '05-beanie-side-walls.jpg', 'Building the Side Walls'],
      ['Troubleshooting Common Problems', '06-beanie-shaping.jpg', 'Shaping the Beanie'],
      ['Finishing the Beanie', '07-beanie-finishing.jpg', 'Finishing & Weaving Ends'],
      ['Care & Storage', '08-beanie-finished.jpg', 'Finished Crochet Beanie']
    ]
  },
  'crochet-bookmark-tutorial-sara-rain-crochet': {
    folder: 'crochet-bookmark',
    markers: [
      ['Materials & Preparation', '01-bookmark-materials.jpg', 'Materials & Hook'],
      ['Step-by-Step Crochet Bookmark Pattern', '02-bookmark-starting-chain.jpg', 'Starting Chain'],
      ['Creating a Neat Border', '03-bookmark-first-row.jpg', 'First Crochet Row'],
      ['Adding the Tassel', '04-bookmark-building-length.jpg', 'Building the Bookmark Length'],
      ['Important Checkpoints', '05-bookmark-pattern-detail.jpg', 'Creating the Stitch Pattern'],
      ['Troubleshooting', '06-bookmark-edging.jpg', 'Adding the Edging'],
      ['Finishing & Blocking', '07-bookmark-finishing.jpg', 'Finishing & Weaving Ends'],
      ['Variations & Gift Ideas', '08-bookmark-finished.jpg', 'Finished Crochet Bookmark']
    ]
  },
  'crochet-bag-charms': {
    folder: 'crochet-bag-charms',
    markers: [
      ['Materials, tension and abbreviations', '01-bag-charms-materials.jpg', 'Materials & Yarn'],
      ['Make a secure hanging loop', '02-bag-charms-starting-piece.jpg', 'Starting the Charm'],
      ['Daisy bag charm', '03-bag-charms-building-shape.jpg', 'Building the Shape'],
      ['Strawberry bag charm', '04-bag-charms-detail.jpg', 'Adding the Crochet Details'],
      ['Cherry pair bag charm', '05-bag-charms-adding-strap.jpg', 'Adding the Strap'],
      ['Sunflower charm', '06-bag-charms-adding-ring.jpg', 'Attaching the Key Ring'],
      ['Heart charm', '07-bag-charms-finishing.jpg', 'Finishing & Weaving Ends'],
      ['Hardware and finishing', '08-bag-charms-finished.jpg', 'Finished Crochet Bag Charm']
    ]
  }
};

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const stripTags = value => value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

const processCss = `<style id="tutorial-process-images">\n.tutorial-process-image{margin:42px auto 48px;max-width:760px}.tutorial-process-image img{display:block;width:100%;height:auto;max-height:620px;object-fit:cover;border-radius:18px;box-shadow:0 16px 42px rgba(38,53,47,.14)}.tutorial-process-image figcaption{display:flex;gap:12px;align-items:baseline;margin:12px 4px 0;color:#68736d;font:14px/1.5 Arial,sans-serif}.tutorial-process-image figcaption span{color:#45695a;text-transform:uppercase;letter-spacing:.1em;font-size:10px;font-weight:700}.tutorial-process-image figcaption strong{font:600 18px/1.3 Georgia,serif;color:#26352f}@media(max-width:700px){.tutorial-process-image{margin:32px auto 40px}.tutorial-process-image img{border-radius:14px}.tutorial-process-image figcaption{display:block}.tutorial-process-image figcaption span{display:block;margin-bottom:4px}}\n</style>`;

function figure(folder, filename, title, index) {
  const src = `/images/tutorials/${folder}/${filename}`;
  return `<figure class="tutorial-process-image" data-tutorial-process-image="${filename}"><img src="${src}" alt="${title} — crochet tutorial step ${index + 1}" loading="lazy" decoding="async"><figcaption><span>Step ${index + 1}</span><strong>${title}</strong></figcaption></figure>`;
}

function injectTutorialImages(html, config) {
  if (html.includes('id="tutorial-process-images"') || html.includes('data-tutorial-process-image=')) return html;

  let output = html;
  const insertions = [];

  for (let i = 0; i < config.markers.length; i++) {
    const [marker, filename, title] = config.markers[i];
    const headingRe = /<h[23][^>]*>[\s\S]*?<\/h[23]>/gi;
    let match;
    let found = null;
    while ((match = headingRe.exec(output))) {
      if (stripTags(match[0]).toLowerCase().includes(marker.toLowerCase())) {
        found = match;
        break;
      }
    }
    if (!found) continue;

    const afterHeading = found.index + found[0].length;
    const nextHeading = output.slice(afterHeading).search(/<h[23][^>]*>/i);
    const sectionEnd = nextHeading >= 0 ? afterHeading + nextHeading : output.length;
    const section = output.slice(afterHeading, sectionEnd);
    const paragraphEnd = section.search(/<\/p>/i);
    const insertAt = paragraphEnd >= 0 ? afterHeading + paragraphEnd + 4 : afterHeading;
    insertions.push({ position: insertAt, html: figure(config.folder, filename, title, i) });
  }

  insertions.sort((a, b) => b.position - a.position);
  for (const insertion of insertions) {
    output = output.slice(0, insertion.position) + insertion.html + output.slice(insertion.position);
  }

  if (!output.includes('data-tutorial-process-image=')) return html;
  return output.replace('</head>', processCss + '</head>');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/posts/')) {
      const slug = url.pathname.split('/').pop().replace(/\.html$/, '');
      const config = TUTORIALS[slug];
      if (config) {
        const response = await baseWorker.fetch(request, env, ctx);
        const type = response.headers.get('content-type') || '';
        if (response.ok && type.includes('text/html')) {
          const html = await response.text();
          const enhanced = injectTutorialImages(html, config);
          return new Response(enhanced, {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers)
          });
        }
        return response;
      }
    }
    return baseWorker.fetch(request, env, ctx);
  }
};
