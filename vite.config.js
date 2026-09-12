import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const site = 'https://crochet.krawielvis.workers.dev'

const seo = {
  'first-crochet-project': { title: 'Your First Crochet Project — Beginner Practice Pattern', description: 'Learn crochet from scratch with a simple numbered practice pattern, essential stitches, yarn and hook tips, and finishing steps.', related: ['crochet-tension-guide','crochet-hook-sizes-guide','yarn-guide'] },
  'granny-square': { title: 'How to Crochet a Granny Square — Easy Beginner Pattern', description: 'Learn how to crochet a classic granny square with clear round-by-round steps, joining tips, and beginner-friendly finishing advice.', related: ['crochet-flower','crochet-coasters-pattern','how-to-crochet-in-the-round'] },
  'yarn-guide': { title: 'Best Yarn for Crochet Beginners — A Practical Yarn Guide', description: 'Understand crochet yarn weights, fibers, texture, and yardage so you can choose the right yarn for beginner crochet projects.', related: ['crochet-hook-sizes-guide','crochet-tension-guide','best-yarn-for-amigurumi'] },
  'amigurumi': { title: 'How to Start Amigurumi — Beginner Crochet Guide', description: 'Start amigurumi with beginner-friendly guidance on yarn, hooks, shaping, stuffing, tight stitches, and working in the round.', related: ['magic-ring-tutorial','best-yarn-for-amigurumi','how-to-crochet-in-the-round'] },
  'crochet-flower': { title: 'Easy Crochet Flower Pattern — Step-by-Step Tutorial', description: 'Make a simple crochet flower with clear steps for the center, petals, shaping, and finishing. Great for beginner projects and gifts.', related: ['granny-square','crochet-gift-ideas','crochet-coasters-pattern'] },
  'how-to-read-crochet-patterns': { title: 'How to Read Crochet Patterns — Abbreviations & Symbols Guide', description: 'Learn how to read crochet patterns, understand common abbreviations and symbols, follow repeats, and track rows with confidence.', related: ['crochet-stitch-abbreviations','single-vs-double-crochet','how-to-fix-crochet-mistakes'] },
  'single-vs-double-crochet': { title: 'Single Crochet vs Double Crochet — What Is the Difference?', description: 'Compare single crochet and double crochet stitch height, texture, tension, and common uses with a beginner-friendly explanation.', related: ['crochet-stitch-abbreviations','crochet-tension-guide','first-crochet-project'] },
  'crochet-hook-sizes-guide': { title: 'Crochet Hook Sizes Guide — How to Choose the Right Hook', description: 'Learn common crochet hook sizes, yarn compatibility, gauge, and how to choose the right crochet hook for your project.', related: ['yarn-guide','crochet-tension-guide','first-crochet-project'] },
  'how-to-fix-crochet-mistakes': { title: 'How to Fix Common Crochet Mistakes — Beginner Troubleshooting', description: 'Fix missed stitches, uneven edges, wrong stitch counts, and other common crochet mistakes with practical beginner troubleshooting steps.', related: ['crochet-tension-guide','how-to-read-crochet-patterns','single-vs-double-crochet'] },
  'crochet-blanket-for-beginners': { title: 'Easy Crochet Blanket for Beginners — Planning & Pattern Guide', description: 'Plan an easy beginner crochet blanket with yarn guidance, row control, straight edges, sizing tips, and finishing advice.', related: ['yarn-guide','crochet-tension-guide','how-to-crochet-a-scarf'] },
  'magic-ring-tutorial': { title: 'How to Crochet a Magic Ring — Beginner Tutorial', description: 'Learn how to make, tighten, and crochet into a magic ring for amigurumi, hats, motifs, and other projects worked in the round.', related: ['how-to-crochet-in-the-round','amigurumi','best-yarn-for-amigurumi'] },
  'crochet-vs-knitting': { title: 'Crochet vs Knitting — Which Craft Is Better for Beginners?', description: 'Compare crochet and knitting tools, stitches, fabric, learning curves, and project styles to decide which craft suits you.', related: ['first-crochet-project','yarn-guide','crochet-hook-sizes-guide'] },
  'best-yarn-for-amigurumi': { title: 'Best Yarn for Amigurumi — How to Choose Crochet Yarn', description: 'Learn which yarn weights, fibers, textures, and colors work well for amigurumi and how yarn choice affects small stuffed crochet designs.', related: ['amigurumi','yarn-guide','magic-ring-tutorial'] },
  'how-to-crochet-in-the-round': { title: 'How to Crochet in the Round — Beginner Guide', description: 'Learn the basics of crocheting in the round, including starting the center, joining rounds, continuous rounds, and keeping shapes even.', related: ['magic-ring-tutorial','granny-square','amigurumi'] },
  'crochet-stitch-abbreviations': { title: 'Crochet Stitch Abbreviations — Beginner Cheat Sheet', description: 'Learn common crochet stitch abbreviations and pattern shorthand so you can read crochet instructions faster and with fewer mistakes.', related: ['how-to-read-crochet-patterns','single-vs-double-crochet','how-to-fix-crochet-mistakes'] },
  'how-to-crochet-a-scarf': { title: 'How to Crochet a Scarf — Easy Beginner Pattern Guide', description: 'Make a simple crochet scarf while practicing consistent rows, tension, straight edges, yarn choice, and clean finishing.', related: ['crochet-tension-guide','yarn-guide','crochet-blanket-for-beginners'] },
  'crochet-gift-ideas': { title: 'Easy Crochet Gift Ideas — Handmade Projects for Any Occasion', description: 'Find practical crochet gift ideas for birthdays, holidays, thoughtful handmade presents, and quick projects for beginners.', related: ['crochet-flower','crochet-coasters-pattern','crochet-market-bag'] },
  'how-to-block-crochet': { title: 'How to Block Crochet — Beginner Finishing Guide', description: 'Learn when and how to block crochet projects for cleaner edges, more accurate shapes, and a polished handmade finish.', related: ['crochet-tension-guide','granny-square','how-to-crochet-a-scarf'] },
  'crochet-tension-guide': { title: 'Crochet Tension Guide for Beginners — Get Even Stitches', description: 'Learn what crochet tension means, why stitch size changes, how to hold yarn comfortably, and how to practice more even stitches.', related: ['crochet-hook-sizes-guide','yarn-guide','how-to-fix-crochet-mistakes'] },
  'c2c-crochet-guide': { title: 'C2C Crochet Guide for Beginners — Corner-to-Corner Basics', description: 'Learn corner-to-corner crochet basics, including diagonal construction, blocks, increasing, decreasing, and simple C2C designs.', related: ['crochet-blanket-for-beginners','crochet-tension-guide','how-to-read-crochet-patterns'] },
  'crochet-coasters-pattern': { title: 'Easy Crochet Coasters Pattern — Beginner Home Project', description: 'Make simple crochet coasters while practicing neat rounds, shaping, finishing, and useful handmade home decor techniques.', related: ['crochet-flower','granny-square','how-to-crochet-in-the-round'] },
  'how-to-join-yarn': { title: 'How to Join Yarn in Crochet — Clean Yarn Changes', description: 'Learn practical ways to join a new yarn color or skein in crochet while keeping joins secure and reducing bulky ends.', related: ['yarn-guide','crochet-tension-guide','how-to-fix-crochet-mistakes'] },
  'crochet-vs-store-bought': { title: 'Crochet vs Store-Bought — Why Handmade Is Different', description: 'Explore the practical differences between handmade crochet and store-bought items, including customization, materials, time, and value.', related: ['crochet-gift-ideas','crochet-market-bag','seasonal-crochet-projects'] },
  'crochet-market-bag': { title: 'Easy Crochet Market Bag Pattern — Reusable Beginner Project', description: 'Make a reusable crochet market bag and learn practical shaping, openwork construction, handles, and finishing for everyday use.', related: ['crochet-gift-ideas','crochet-blanket-for-beginners','how-to-crochet-a-scarf'] },
  'seasonal-crochet-projects': { title: 'Seasonal Crochet Project Ideas — Projects for Every Season', description: 'Plan crochet projects for every season with ideas for cozy winter makes, spring accessories, summer bags, and autumn home decor.', related: ['crochet-gift-ideas','crochet-market-bag','crochet-blanket-for-beginners'] }
}

const labels = {
  'crochet-tension-guide':'Crochet Tension Guide','crochet-hook-sizes-guide':'Crochet Hook Sizes Guide','yarn-guide':'Beginner Yarn Guide','best-yarn-for-amigurumi':'Best Yarn for Amigurumi',
  'crochet-flower':'Crochet Flower Pattern','crochet-coasters-pattern':'Crochet Coasters Pattern','how-to-crochet-in-the-round':'How to Crochet in the Round','granny-square':'Granny Square Pattern',
  'how-to-read-crochet-patterns':'How to Read Crochet Patterns','crochet-stitch-abbreviations':'Crochet Stitch Abbreviations','single-vs-double-crochet':'Single vs Double Crochet',
  'how-to-fix-crochet-mistakes':'Fix Common Crochet Mistakes','magic-ring-tutorial':'Magic Ring Tutorial','amigurumi':'Amigurumi for Beginners','first-crochet-project':'First Crochet Project',
  'crochet-blanket-for-beginners':'Beginner Crochet Blanket','how-to-crochet-a-scarf':'How to Crochet a Scarf','crochet-gift-ideas':'Crochet Gift Ideas','how-to-block-crochet':'How to Block Crochet',
  'c2c-crochet-guide':'C2C Crochet Guide','how-to-join-yarn':'How to Join Yarn','crochet-market-bag':'Crochet Market Bag','seasonal-crochet-projects':'Seasonal Crochet Projects',
  'crochet-vs-knitting':'Crochet vs Knitting','crochet-vs-store-bought':'Crochet vs Store-Bought'
}

const tutorialSlugs = Object.keys(seo)

const tutorialEnhancer = {
  name: 'crochet-tutorial-enhancer',
  transformIndexHtml(html, ctx) {
    const path = ctx.path || ''

    if (path === '/' || path.endsWith('/index.html')) {
      const schema = `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebSite', name: 'Sara Rain Crochet', url: `${site}/`,
        description: 'Practical crochet patterns, beginner-friendly tutorials, and inspiration for modern makers.',
        publisher: { '@type': 'Organization', name: 'Sara Rain Crochet', url: `${site}/` }
      })}</script>`
      return html.replace('25 tutorials.<br /><em>25 projects.</em>', 'Sara Rain Crochet')
        .replace('</head>', `${schema}<meta name="robots" content="index,follow,max-image-preview:large" /><meta property="og:image" content="${site}/images/pins/pin-first-crochet-project.jpg" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="Sara Rain Crochet — Beginner Crochet Patterns & Tutorials" /><meta name="twitter:description" content="Practical crochet patterns and beginner-friendly tutorials." /><meta name="twitter:image" content="${site}/images/pins/pin-first-crochet-project.jpg" /></head>`)
    }

    if (!path.includes('/posts/')) return html

    const slug = path.split('/posts/')[1]?.replace(/\.html$/, '') || ''
    const info = seo[slug]
    if (!info) return html
    const adcash = html.includes('acscdn.com/script/aclib.js') ? '' : `<script id="aclib" type="text/javascript" src="//acscdn.com/script/aclib.js"></script><script type="text/javascript">aclib.runAutoTag({ zoneId: '5j7scxnbvh' });</script>`
    const enhancer = '<script type="module" src="/src/tutorial-enhancements.js"></script><script type="module" src="/src/deep-tutorials.js"></script>'
    const image = `/images/pins/pin-${slug}.jpg`
    const url = `${site}/posts/${slug}.html`
    const relatedLinks = info.related.map(r => `<a href="/posts/${r}.html">${labels[r] || r}</a>`).join('')
    const relatedBlock = `<section class="related-tutorials" aria-labelledby="related-tutorials-title"><h2 id="related-tutorials-title">Related crochet tutorials</h2><p>Keep learning with these related beginner crochet guides:</p><nav>${relatedLinks}</nav></section>`
    const schema = `<script type="application/ld+json">${JSON.stringify({
      '@context':'https://schema.org','@type':'Article',headline:info.title,description:info.description,image:[`${site}${image}`],mainEntityOfPage:{'@type':'WebPage','@id':url},dateModified:'2026-09-12',author:{'@type':'Organization',name:'Sara Rain Crochet',url:`${site}/`},publisher:{'@type':'Organization',name:'Sara Rain Crochet',url:`${site}/`},isPartOf:{'@type':'WebSite',name:'Sara Rain Crochet',url:`${site}/`},breadcrumb:{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:`${site}/`},{'@type':'ListItem',position:2,name:'Crochet Tutorials',item:`${site}/#pinterest-tutorials`},{'@type':'ListItem',position:3,name:info.title,item:url}]}
    })}</script>`
    const social = `<meta name="robots" content="index,follow,max-image-preview:large" /><meta name="description" content="${info.description}" /><link rel="canonical" href="${url}" /><meta property="og:title" content="${info.title}" /><meta property="og:description" content="${info.description}" /><meta property="og:type" content="article" /><meta property="og:url" content="${url}" /><meta property="og:image" content="${site}${image}" /><meta property="og:site_name" content="Sara Rain Crochet" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${info.title}" /><meta name="twitter:description" content="${info.description}" /><meta name="twitter:image" content="${site}${image}" />`
    const relatedCss = `<style>.related-tutorials{margin:42px 0;padding:28px;border:1px solid rgba(25,48,43,.12);background:#f7f4ed}.related-tutorials h2{margin-top:0}.related-tutorials nav{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.related-tutorials nav a{display:inline-block;padding:9px 13px;border:1px solid rgba(25,48,43,.16);text-decoration:none}.related-tutorials nav a:hover{text-decoration:underline}</style>`
    const withRelated = html.replace('</article>', `${relatedBlock}</article>`)
    return withRelated.replace(/<title>[^<]*<\/title>/i, `<title>${info.title}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/>/i, '').replace('</head>', `${schema}${social}${relatedCss}${adcash}${enhancer}</head>`)
  }
}

export default defineConfig({
  plugins: [tutorialEnhancer],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        pinterestTutorials: resolve(import.meta.dirname, 'pinterest-tutorials.html'),
        ...Object.fromEntries(tutorialSlugs.map(slug => [slug, resolve(import.meta.dirname, `posts/${slug}.html`)]))
      }
    }
  }
})
