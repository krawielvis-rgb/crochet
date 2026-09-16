# Sara Rain Crochet admin setup

The private publisher lives at `/sara`.

It uses Cloudflare Worker secrets for the login and a GitHub fine-grained token to publish posts into this repository. **Never put the GitHub token in the repository or in browser code.**

## Required Cloudflare secrets

From the project directory, run:

```bash
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler secret put GITHUB_TOKEN
```

Use your own values for the first four. `SESSION_SECRET` should be a long random string.

For `GITHUB_TOKEN`, create a GitHub fine-grained personal access token limited to this repository with repository **Contents: Read and write** permission. Do not paste the token into chat or commit it to Git.

Then deploy:

```bash
npm run build
npx wrangler deploy
```

After deployment, open:

`https://sararaincrochet.com/sara`

The admin accepts either `ADMIN_USERNAME` or `ADMIN_EMAIL` as the login identifier.

## Publishing workflow

1. Sign in at `/sara`.
2. Upload the Pinterest pin image.
3. Enter the title and SEO description.
4. Fill the long-form tutorial sections.
5. Click **Publish tutorial**.

The Worker commits the image, tutorial page, and post catalog to `main`. The homepage reads the catalog and adds the new card automatically, so you do not need to manually create another HTML page or edit the homepage for each new post.
