
import { useParams, Link } from 'react-router-dom'

const map = {
'first-project-starter-kit': 'pin-first-crochet-project.jpg',
'classic-granny-square': 'pin-granny-square.jpg',
'choosing-right-yarn': 'pin-yarn-guide.jpg',
'cute-amigurumi': 'pin-amigurumi.jpg',
'easy-crochet-flower': 'pin-crochet-flower.jpg',
'how-to-read-crochet-patterns': 'pin-how-to-read-crochet-patterns.jpg',
'single-vs-double': 'pin-single-vs-double-crochet.jpg',
'hook-sizes-guide': 'pin-crochet-hook-sizes-guide.jpg',
'how-to-fix-mistakes': 'pin-how-to-fix-crochet-mistakes.jpg',
'blanket-for-beginners': 'pin-crochet-blanket-for-beginners.jpg',
'magic-ring-tutorial': 'pin-magic-ring-tutorial.jpg',
'crochet-vs-knitting': 'pin-crochet-vs-knitting.jpg',
'best-yarn-for-amigurumi': 'pin-best-yarn-for-amigurumi.jpg',
'how-to-crochet-in-the-round': 'pin-how-to-crochet-in-the-round.jpg',
'stitch-abbreviations': 'pin-crochet-stitch-abbreviations.jpg',
'how-to-crochet-a-scarf': 'pin-how-to-crochet-a-scarf.jpg',
'crochet-gift-ideas': 'pin-crochet-gift-ideas.jpg',
'how-to-block-crochet': 'pin-how-to-block-crochet.jpg',
'crochet-tension-guide': 'pin-crochet-tension-guide.jpg',
'c2c-crochet-guide': 'pin-c2c-crochet-guide.jpg',
'crochet-coasters-pattern': 'pin-crochet-coasters-pattern.jpg',
'how-to-join-yarn': 'pin-how-to-join-yarn.jpg',
'crochet-vs-store-bought': 'pin-crochet-vs-store-bought.jpg',
'crochet-market-bag': 'pin-crochet-market-bag.jpg',
'seasonal-crochet-projects': 'pin-seasonal-crochet-projects.jpg',
}

export default function Tutorial(){
 const {slug} = useParams()
 const file = map[slug] || 'pin-first-crochet-project.jpg'
 const title = slug.replace(/-/g,' ')
 return (
  <div style={{maxWidth:800,margin:'0 auto',padding:'32px'}}>
    <Link to="/">← Back to Journal</Link>
    <h1 style={{textTransform:'capitalize',marginTop:24}}>{title}</h1>
    <img src={`/images/pins/${file}`} style={{width:'100%',borderRadius:16,marginTop:16}} alt={title} />
    <p style={{marginTop:24,lineHeight:1.7}}>This is your long-form SEO tutorial page. Replace this text with your real article content. The pin image above is now a real generated image from your 25-pack, not a placeholder. It includes What You'll Need, Perfect For, Step-by-Step grid, and Happy Crocheting banner.</p>
    <p>Image file: <code>/public/images/pins/{file}</code></p>
  </div>
 )
}
