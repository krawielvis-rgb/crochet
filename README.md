# Sara Rain Crochet

A responsive, SEO-ready editorial site for crochet tutorials, materials guides, and handmade-project inspiration.

**Live site:** [https://crochet.krawielvis.workers.dev](https://crochet.krawielvis.workers.dev)

## Features

- Clean, warm editorial design with custom CSS illustrations and typography (Fraunces + DM Sans/Mono)
- 25+ beginner-friendly tutorial and guide pages with structured long-form content
- SEO optimized: canonical URLs, Open Graph, Twitter cards, JSON-LD structured data, sitemap, robots.txt
- Pinterest-focused homepage cards with matching pin images
- Related tutorials system and progressive enhancement via Vite plugins
- Cloudflare Worker + private admin publisher at `/sara` for adding new tutorials
- Automated homepage card sync via GitHub Actions when `data/posts.json` changes
- Responsive layout, accessibility basics, and privacy/terms pages

## Tech stack

- **Frontend**: Static HTML + Vite
- **Hosting**: Cloudflare Workers (via Wrangler)
- **Styling**: Custom CSS (no heavy frameworks)
- **Content**: Hand-written HTML tutorials + `data/posts.json` catalog
- **Automation**: GitHub Actions for homepage sync; Cloudflare Worker for admin publishing

## Local development

```bash
npm install
npm run start          # Vite dev server
npm run build          # Production build → dist/
npm run preview        # Preview production build
```

## Deployment

```bash
npm run build
npx wrangler deploy
```

See `wrangler.jsonc` and `ADMIN-SETUP.md` for Worker configuration and secrets.

## Adding new tutorials

Preferred method: use the private admin at `/sara` (requires Cloudflare secrets — see `ADMIN-SETUP.md`).

Manual method:
1. Create `posts/your-slug.html` following the existing tutorial structure.
2. Add a pin image at `public/images/pins/pin-your-slug.jpg` (or .png).
3. Add an entry to `data/posts.json` with `slug`, `title`, `description`, `image`, and `published: true`.
4. The GitHub Action will attempt to add a homepage card on the next relevant push (only if the image exists).
5. Update `public/sitemap.xml` and the Vite `seo` map in `vite.config.js` for full SEO support.

## Project structure

```
├── index.html                 # Homepage
├── posts/                     # Tutorial pages
├── public/                    # Static assets, legal pages, images, sitemap
├── src/                       # CSS, JS enhancements, Worker code, Vite plugins
├── data/posts.json            # Tutorial catalog
├── vite.config.js             # Build + SEO/related-posts plugins
├── wrangler.jsonc             # Cloudflare Workers config
└── .github/workflows/         # Homepage card sync
```

## Legal & compliance pages

- About, Contact, Privacy Policy, Cookie Policy, Terms of Service (in `public/`)

## Notes

- Images are stored in the repository for simplicity. Consider optimizing large pin images for production if needed.
- The site prioritizes clarity and patience for beginners over complex interactivity.
- Content is independently created and not affiliated with yarn or tool brands unless stated.

---

Make something lovely, slowly.
