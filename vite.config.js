import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const site = 'https://crochet.krawielvis.workers.dev'

const tutorialEnhancer = {
  name: 'crochet-tutorial-enhancer',
  transformIndexHtml(html, ctx) {
    const path = ctx.path || ''

    if (path === '/' || path.endsWith('/index.html')) {
      const schema = `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Sara Rain Crochet',
        url: `${site}/`,
        description: 'Practical crochet patterns, beginner-friendly tutorials, and inspiration for modern makers.',
        publisher: { '@type': 'Organization', name: 'Sara Rain Crochet', url: `${site}/` }
      })}</script>`
      return html
        .replace('25 tutorials.<br /><em>25 projects.</em>', 'Sara Rain Crochet')
        .replace('</head>', `${schema}<meta name="robots" content="index,follow,max-image-preview:large" /><meta property="og:image" content="${site}/images/pins/pin-first-crochet-project.jpg" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="Sara Rain Crochet — Make something lovely" /><meta name="twitter:description" content="Practical crochet patterns and beginner-friendly tutorials." /><meta name="twitter:image" content="${site}/images/pins/pin-first-crochet-project.jpg" /></head>`)
    }

    if (!path.includes('/posts/')) return html

    const adcash = html.includes('acscdn.com/script/aclib.js') ? '' : `<script id="aclib" type="text/javascript" src="//acscdn.com/script/aclib.js"></script><script type="text/javascript">aclib.runAutoTag({ zoneId: '5j7scxnbvh' });</script>`
    const enhancer = '<script type="module" src="/src/tutorial-enhancements.js"></script>'
    const slug = path.split('/posts/')[1]?.replace(/\.html$/, '') || ''
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const descriptionMatch = html.match(/<meta name="description" content="([^"]*)"/i)
    const imageMatch = html.match(/<img[^>]+src="([^"]+)"/i)
    const title = titleMatch?.[1]?.trim() || 'Crochet Tutorial'
    const description = descriptionMatch?.[1] || 'Beginner-friendly crochet tutorial and pattern from Sara Rain Crochet.'
    const image = imageMatch?.[1] || `/images/pins/pin-${slug}.jpg`
    const url = `${site}/posts/${slug}.html`
    const schema = `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: [`${site}${image}`],
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@type': 'Organization', name: 'Sara Rain Crochet', url: `${site}/` },
      publisher: { '@type': 'Organization', name: 'Sara Rain Crochet', url: `${site}/` },
      isPartOf: { '@type': 'WebSite', name: 'Sara Rain Crochet', url: `${site}/` },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
          { '@type': 'ListItem', position: 2, name: title, item: url }
        ]
      }
    })}</script>`
    const social = `<meta name="robots" content="index,follow,max-image-preview:large" /><meta property="og:title" content="${title}" /><meta property="og:description" content="${description}" /><meta property="og:type" content="article" /><meta property="og:url" content="${url}" /><meta property="og:image" content="${site}${image}" /><meta property="og:site_name" content="Sara Rain Crochet" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${title}" /><meta name="twitter:description" content="${description}" /><meta name="twitter:image" content="${site}${image}" />`
    return html.replace('</head>', `${schema}${social}${adcash}${enhancer}</head>`)
  },
  generateBundle() {
    const slugs = [
      'first-crochet-project','granny-square','yarn-guide','amigurumi','crochet-flower',
      'how-to-read-crochet-patterns','single-vs-double-crochet','crochet-hook-sizes-guide',
      'how-to-fix-crochet-mistakes','crochet-blanket-for-beginners','magic-ring-tutorial',
      'crochet-vs-knitting','best-yarn-for-amigurumi','how-to-crochet-in-the-round',
      'crochet-stitch-abbreviations','how-to-crochet-a-scarf','crochet-gift-ideas',
      'how-to-block-crochet','crochet-tension-guide','c2c-crochet-guide',
      'crochet-coasters-pattern','how-to-join-yarn','crochet-vs-store-bought',
      'crochet-market-bag','seasonal-crochet-projects'
    ]
    const urls = [`${site}/`, ...slugs.map(slug => `${site}/posts/${slug}.html`)]
    const today = '2026-09-12'
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n` })
  }
}

export default defineConfig({
  plugins: [tutorialEnhancer],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        pinterestTutorials: resolve(import.meta.dirname, 'pinterest-tutorials.html'),
        firstProject: resolve(import.meta.dirname, 'posts/first-crochet-project.html'),
        grannySquare: resolve(import.meta.dirname, 'posts/granny-square.html'),
        yarnGuide: resolve(import.meta.dirname, 'posts/yarn-guide.html'),
        amigurumi: resolve(import.meta.dirname, 'posts/amigurumi.html'),
        crochetFlower: resolve(import.meta.dirname, 'posts/crochet-flower.html'),
        howToReadCrochetPatterns: resolve(import.meta.dirname, 'posts/how-to-read-crochet-patterns.html'),
        singleVsDoubleCrochet: resolve(import.meta.dirname, 'posts/single-vs-double-crochet.html'),
        crochetHookSizesGuide: resolve(import.meta.dirname, 'posts/crochet-hook-sizes-guide.html'),
        howToFixCrochetMistakes: resolve(import.meta.dirname, 'posts/how-to-fix-crochet-mistakes.html'),
        crochetBlanketForBeginners: resolve(import.meta.dirname, 'posts/crochet-blanket-for-beginners.html'),
        magicRingTutorial: resolve(import.meta.dirname, 'posts/magic-ring-tutorial.html'),
        crochetVsKnitting: resolve(import.meta.dirname, 'posts/crochet-vs-knitting.html'),
        bestYarnForAmigurumi: resolve(import.meta.dirname, 'posts/best-yarn-for-amigurumi.html'),
        howToCrochetInTheRound: resolve(import.meta.dirname, 'posts/how-to-crochet-in-the-round.html'),
        crochetStitchAbbreviations: resolve(import.meta.dirname, 'posts/crochet-stitch-abbreviations.html'),
        howToCrochetAScarf: resolve(import.meta.dirname, 'posts/how-to-crochet-a-scarf.html'),
        crochetGiftIdeas: resolve(import.meta.dirname, 'posts/crochet-gift-ideas.html'),
        howToBlockCrochet: resolve(import.meta.dirname, 'posts/how-to-block-crochet.html'),
        crochetTensionGuide: resolve(import.meta.dirname, 'posts/crochet-tension-guide.html'),
        c2cCrochetGuide: resolve(import.meta.dirname, 'posts/c2c-crochet-guide.html'),
        crochetCoastersPattern: resolve(import.meta.dirname, 'posts/crochet-coasters-pattern.html'),
        howToJoinYarn: resolve(import.meta.dirname, 'posts/how-to-join-yarn.html'),
        crochetVsStoreBought: resolve(import.meta.dirname, 'posts/crochet-vs-store-bought.html'),
        crochetMarketBag: resolve(import.meta.dirname, 'posts/crochet-market-bag.html'),
        seasonalCrochetProjects: resolve(import.meta.dirname, 'posts/seasonal-crochet-projects.html')
      }
    }
  }
})
