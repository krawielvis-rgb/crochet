# How to add a new Pinterest crochet tutorial

Use this project as a repeatable template.

## 1. Create your Pinterest image
Save the image with a simple filename, for example:

`crochet-heart.png`

## 2. Upload the image
Put it in:

`public/images/`

So the final path is:

`public/images/crochet-heart.png`

## 3. Create the tutorial page
Copy an existing page such as:

`posts/crochet-flower.html`

and rename it, for example:

`posts/crochet-heart.html`

## 4. Replace the page-specific content
Update:
- `<title>`
- meta description
- Open Graph/Twitter title and description
- canonical URL
- image path and alt text
- H1 and introduction
- materials
- stitches
- step-by-step instructions
- related-post links
- HowTo structured data

Keep the Adcash AutoTag code on the page if you want the same ad setup:

```html
<script id="aclib" type="text/javascript" src="//acscdn.com/script/aclib.js"></script>
<script type="text/javascript">
  aclib.runAutoTag({ zoneId: '5j7scxnbvh' });
</script>
```

## 5. Add the post to the homepage
In `index.html`, add a new `.post-card` inside `.post-grid` pointing to your new HTML file.

## 6. Test locally
Run:

`npm install`

then:

`npm run build`

## 7. Commit and push
Commit the new HTML page, image, and homepage change to GitHub.

Your Pinterest pin should link directly to the matching page, for example:

`https://your-domain.com/posts/crochet-heart.html`

## Important
Do not make a Pinterest pin promise a tutorial that the landing page does not contain. Matching the pin to the actual tutorial gives visitors a better experience and is better for long-term SEO and monetization.
