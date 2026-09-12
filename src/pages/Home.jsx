
import React from 'react'
import { Link } from 'react-router-dom'

const featured = {
  title: 'First Project Starter Kit Tutorial',
  slug: 'first-project-starter-kit',
  image: '/images/pins/pin-first-crochet-project.jpg',
  excerpt: 'Your cozy entry into crochet — learn slip knot, chain, single crochet and finishing with step-by-step photos.'
}

const pins = [
  {title:'Classic Granny Square', slug:'classic-granny-square', file:'pin-granny-square.jpg', desc:'Blankets, bags, coasters'},
  {title:'Choosing the Right Yarn', slug:'choosing-right-yarn', file:'pin-yarn-guide.jpg', desc:'Beginner yarn guide'},
  {title:'Cute Amigurumi', slug:'cute-amigurumi', file:'pin-amigurumi.jpg', desc:'Gifts & desk buddies'},
  {title:'Easy Crochet Flower', slug:'easy-crochet-flower', file:'pin-crochet-flower.jpg', desc:'Embellishments'},
  {title:'How to Read Patterns', slug:'how-to-read-crochet-patterns', file:'pin-how-to-read-crochet-patterns.jpg', desc:'Decode abbreviations'},
  {title:'Single vs Double Crochet', slug:'single-vs-double', file:'pin-single-vs-double-crochet.jpg', desc:'Stitch comparison'},
  {title:'Hook Sizes Guide', slug:'hook-sizes-guide', file:'pin-crochet-hook-sizes-guide.jpg', desc:'Match hook to yarn'},
  {title:'Fix Mistakes', slug:'how-to-fix-mistakes', file:'pin-how-to-fix-crochet-mistakes.jpg', desc:'Frog safely'},
  {title:'Blanket for Beginners', slug:'blanket-for-beginners', file:'pin-crochet-blanket-for-beginners.jpg', desc:'Your first big project'},
  {title:'Magic Ring', slug:'magic-ring-tutorial', file:'pin-magic-ring-tutorial.jpg', desc:'Amigurumi essential'},
  {title:'Crochet vs Knitting', slug:'crochet-vs-knitting', file:'pin-crochet-vs-knitting.jpg', desc:'Tool comparison'},
  {title:'Best Yarn for Amigurumi', slug:'best-yarn-for-amigurumi', file:'pin-best-yarn-for-amigurumi.jpg', desc:'Cotton vs acrylic'},
  {title:'Crochet in the Round', slug:'how-to-crochet-in-the-round', file:'pin-how-to-crochet-in-the-round.jpg', desc:'Hats & baskets'},
  {title:'Stitch Abbreviations', slug:'stitch-abbreviations', file:'pin-crochet-stitch-abbreviations.jpg', desc:'Cheat sheet'},
  {title:'How to Crochet a Scarf', slug:'how-to-crochet-a-scarf', file:'pin-how-to-crochet-a-scarf.jpg', desc:'Winter gifts'},
  {title:'Gift Ideas', slug:'crochet-gift-ideas', file:'pin-crochet-gift-ideas.jpg', desc:'Quick <2h makes'},
  {title:'How to Block Crochet', slug:'how-to-block-crochet', file:'pin-how-to-block-crochet.jpg', desc:'Pro finish'},
  {title:'Tension Guide', slug:'crochet-tension-guide', file:'pin-crochet-tension-guide.jpg', desc:'Even stitches'},
  {title:'C2C Guide', slug:'c2c-crochet-guide', file:'pin-c2c-crochet-guide.jpg', desc:'Graphgans'},
  {title:'Coasters Pattern', slug:'crochet-coasters-pattern', file:'pin-crochet-coasters-pattern.jpg', desc:'Scrap busters'},
  {title:'How to Join Yarn', slug:'how-to-join-yarn', file:'pin-how-to-join-yarn.jpg', desc:'No knots'},
  {title:'Handmade vs Store-Bought', slug:'crochet-vs-store-bought', file:'pin-crochet-vs-store-bought.jpg', desc:'Slow living'},
  {title:'Sturdy Market Bag', slug:'crochet-market-bag', file:'pin-crochet-market-bag.jpg', desc:'Reusable everyday'},
  {title:'Cozy Fall Projects', slug:'seasonal-crochet-projects', file:'pin-seasonal-crochet-projects.jpg', desc:'Beanies & mitts'},
]

export default function Home(){
 return (
  <>
    <header className="header">
      <div className="logo">Crochet Journal</div>
      <nav className="nav"><a href="/">Home</a><a href="#guides">Guides</a><a href="#newsletter">Newsletter</a></nav>
    </header>
    <section className="hero">
      <div className="hero-text">
        <span className="badge">Small project, big joy!</span>
        <h1>Crochet<br/>FIRST PROJECT<br/>STARTER KIT<br/>TUTORIAL</h1>
        <p>Warm, cozy, beginner-friendly tutorials with step-by-step photos, what you'll need lists, and pattern notes. All 25 Pinterest pins are now real images — no more code-drawn placeholders.</p>
        <p><Link to={`/tutorial/${featured.slug}`} style={{background:'#1a3c34',color:'white',padding:'12px 20px',borderRadius:99,display:'inline-block',marginTop:12}}>Read Featured Guide →</Link></p>
      </div>
      <img src={featured.image} alt={featured.title} />
    </section>

    <div id="guides" className="grid">
      {pins.map(p=>(
        <Link key={p.slug} to={`/tutorial/${p.slug}`} className="card">
          <img src={`/images/pins/${p.file}`} alt={p.title} loading="lazy" />
          <div className="card-body">
            <h3>{p.title}</h3>
            <div className="small">{p.desc}</div>
          </div>
        </Link>
      ))}
    </div>

    <section id="newsletter" className="footer">
      <h2>Join the cozy club</h2>
      <p>Get new tutorials + Pinterest pins in your inbox.</p>
      <input placeholder="your@email.com" style={{padding:'12px 16px',borderRadius:99,border:'1px solid #ddd',width:280}} />
      <button style={{marginLeft:8,padding:'12px 20px',borderRadius:99,border:'none',background:'#1a3c34',color:'white'}}>Subscribe</button>
      <p className="small" style={{marginTop:24}}>Built with real generated images • 25 pins • SEO ready</p>
    </section>
  </>
 )
}
