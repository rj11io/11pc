export const runYourOwnCopy = `
# Run your own copy

This blog's own repository is public. Fork it, replace the writing, own the result. This post is the checklist: what to replace, what to configure, what to leave alone. Why run your own platform at all: the original 11blog essay [Own your platform](https://blog.rj11.io/online-presence/own-your-platform).

## What you are copying

The repository: [github.com/rj11io/11pc](https://github.com/rj11io/11pc), Apache License 2.0. Not a stripped starter kit, the running site itself: content format, validator, renderer, release pipeline, and this draft publication. Everything here applies to your copy.

The starting point is deliberately sparse: the platform documentation is the only publication, and it is entirely draft. Replace or extend it without first clearing unrelated editorial content.

Two halves, per [The content contract](/blog-platform-docs/content-contract): a content directory for the writing, a website that renders it. The licence asks almost nothing. Replacing the writing and the branding is expected, not merely allowed.

## Get it running first

Fork or clone the repository, then start the dev server:

~~~bash
cd v0/www
npm install
npm run dev
~~~

Open the printed address and click around before changing anything. A working baseline makes every later mistake easier to find. Commands and checks: [Running and releasing the blog](/blog-platform-docs/running-the-blog).

## Replace the writing

Three replacements make the content yours.

- Authors: replace the entries in content/authors.ts with yourself, put your photograph in v0/www/public/static/blog-authors/. Field checklist: [Authors and bylines](/blog-platform-docs/authors-and-bylines). One thing nothing validates: open an author page afterwards, check the photograph loaded.
- Publications: write your first one following [Adding a publication or post](/blog-platform-docs/adding-content), then import it in the registry. Decide deliberately whether Blog platform docs should remain draft, become public, or be removed.
- Redirects: v0/www/next.config.ts starts with only the current /browse convenience redirect. Add address history only after a public URL changes. Runbook: [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects).

With every publication still draft, production has no posts or publications. The landing page shows a neutral pre-publication state instead of empty content sections. Development and SHOW_DRAFTS=1 previews still show the drafts.

## Configure the site's identity

- Address: v0/www/lib/site.ts holds siteOrigin, the one place the site's own domain is written. Set it to yours first. Every share link and link preview builds from it; a copy still pointing at another site sends readers to the wrong host.
- Link-preview fallback: the site-wide Open Graph image (shown when a page with no cover is shared) lives under v0/www/public/static/og/. Replace it, or coverless pages preview with this blog's branding.
- Name: the header wordmark, page titles, and footer carry the site's name in the website's own files. Search v0/www for the old name, replace what you find.

## Deploy and release

Deploys as a standard Next.js application. This blog runs on Vercel; the analytics script in the root layout is Vercel's. Deploying elsewhere: remove it or replace it with your own measurement.

Releases: cut by the workflow in .github/workflows/release.yml, driven entirely by commit messages. The version in the site footer comes from the root package.json the pipeline writes. The workflow runs in a GitHub environment named release: create that environment in your repository settings. If a release still fails: [Running and releasing the blog](/blog-platform-docs/running-the-blog) covers where to look.

One environment variable matters: SHOW_DRAFTS=1 publishes drafts on a deployment. Preview environments only, never production. The flag lives in content/drafts.ts.

## What to leave alone

- The registry and the validator: they make a broken post a failed build instead of a broken page.
- content/routes.ts: change only for different URL shapes, and read [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects) first.
- The plugin order in .releaserc.js and in the Markdown renderer: both load-bearing, both commented where they live.

## Keep the manual

This draft publication is the platform's manual, and your fork carries a copy of it. Where a post names this site's authors, read it as an example, not a requirement. If you change how your copy works, change your copy of these posts with it: the habit that keeps documentation true is described at the end of [Working with the platform](/blog-platform-docs/working-with-the-platform). Improving the platform itself: [Contribute to the platform](/blog-platform-docs/contribute-to-the-platform) explains how to send the change back.
`
