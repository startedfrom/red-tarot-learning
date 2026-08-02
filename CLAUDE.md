# Red Tarot release guide

## Required checks

Before merging or deploying, run:

```bash
npm test && npm run lint
```

Do not enable ads unless the site is approved in AdSense and every required
slot ID is configured. Keep `NEXT_PUBLIC_ADSENSE_APPROVED=false` during review.

## Vercel deployment

Vercel automatically builds pull request previews and deploys `main` to
production after the Git repository is connected. The framework preset is
Next.js and the build command is `npm run build`.

Confirm the production URL in the Vercel project under Deployments, then verify
`/`, `/login`, `/course`, `/robots.txt`, `/sitemap.xml`, and `/ads.txt`. Update
`NEXT_PUBLIC_SITE_URL` and every Supabase redirect allow-list entry when the
production domain changes.

Secrets and real account identifiers belong in Vercel environment variables,
never in the repository. `.env.example` contains names only.
