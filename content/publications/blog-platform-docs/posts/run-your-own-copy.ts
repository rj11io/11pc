export const runYourOwnCopy = `
# Run your own copy

This blog's own repository is public. Fork it, replace the writing, own the result. This post is the checklist: what to replace, what to configure, what to leave alone. Why run your own platform at all: [Own your platform](/online-presence/own-your-platform).

## What you are copying

The repository: [github.com/rj11io/11blog](https://github.com/rj11io/11blog), Apache License 2.0. Not a stripped starter kit, the running site itself: content format, validator, renderer, release pipeline, and this publication. So everything here applies to your copy, and the writing you start from is real writing rather than placeholder text.

The cost of that: a fork arrives carrying this site's publications, so replacing the writing is a deletion step rather than a blank slate. The next section covers it.

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
- Publications: remove the publication directories under content/publications, write your first one following [Adding a publication or post](/blog-platform-docs/adding-content). The registry imports every publication by name: removing one means removing its import too. One decision to make deliberately: keep blog-platform-docs if you want the manual published on your own site, drop it if you would rather read it here.
- Redirects: the list in v0/www/next.config.ts is this site's address history, none of it yours. Empty it, let your own history accumulate. Why the file only grows after that: [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects).

## Configure the site's identity

- Address: v0/www/lib/site.ts holds siteOrigin, the one place the site's own domain is written. Set it to yours first. Every share link and link preview builds from it; a copy still pointing at blog.rj11.io sends your readers here.
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

This publication is the platform's manual, and your fork carries a copy of it. Where a post names this site's publications or authors, read it as an example, not a requirement. If you change how your copy works, change your copy of these posts with it: the habit that keeps documentation true is described at the end of [Working with the platform](/blog-platform-docs/working-with-the-platform). Improving the platform itself: [Contribute to the platform](/blog-platform-docs/contribute-to-the-platform) explains how to send the change back.
`
