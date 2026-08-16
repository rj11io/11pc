export const workingWithThePlatform = `
# Working with the platform

This draft publication documents 11pc, the platform this site runs on. Seventeen posts. This one is the map: what the platform is, what it is not, which post to read for each job.

Want your own blog rather than to work on this one: the original 11blog essay [Build your own blog](https://blog.rj11.io/online-presence/build-your-own-blog) covers the available routes.

## What 11pc is

A blog whose writing lives in TypeScript files, rendered by a Next.js application that reads them at build time.

That sentence explains most decisions documented here. No database, no admin screen, no content fetched at request time. A post is a file. Publishing is a commit and a build. Every page is generated ahead of time and served static.

Two halves:

~~~text
11pc/
├── content/          the writing, its types, and its validator
└── v0/www/           the website that renders it
~~~

The dependency runs one way: the website imports the content, the content knows nothing about the website. That makes the front end replaceable, hence the directory name v0.

## What it is not

Stated early so you can stop reading if it is the wrong tool.

**Not a content management system.** No writing interface. You edit files in a repository.

**Not multi-tenant.** One repository, one blog, one author list.

**Cannot publish without a build.** Adding a post to a running site is impossible by design. Need to publish from a phone at short notice: wrong shape.

**No comments, no newsletter.** Deliberate omissions, not a roadmap. Measurement is page views only: Vercel Analytics, a small script rendered from the root layout. Nothing else watches a reader.

In exchange: pages that are files, content that outlives the renderer, a build that refuses to ship invalid data, almost no JavaScript on a reading page.

## Where to start

Five groups, each building on the last: the platform's shape, extending it, operating it, writing on it, joining in. Every post links onward to what it depends on. Previous and next links follow this same order; this post is the last stop. To walk the groups in order, start from [The content contract](/blog-platform-docs/content-contract).

### Understanding

For evaluating the approach, or changing its shape.

- [The content contract](/blog-platform-docs/content-contract): why the writing sits outside the application, what the boundary guarantees, what a replacement front end must provide.
- [How pages are rendered](/blog-platform-docs/rendering-model): static generation, the few components that run in the browser and why, the trades taken on images.

### Extending

For adding to the platform rather than writing on it.

- [Extending the renderer](/blog-platform-docs/extending-the-renderer): the recipe behind the custom shortcodes, walked end to end with a new one.
- [Design tokens and theming](/blog-platform-docs/design-tokens): the named values behind the interface, including the two that carry measured reasoning.
- [Accessibility contract](/blog-platform-docs/accessibility-contract): what the blog guarantees for keyboard, screen reader, contrast, and reduced-motion readers, plus the gaps that remain.

### Operating

For running the thing.

- [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects): how addresses are built, and the runbook for renaming anything without breaking old links.
- [Running and releasing the blog](/blog-platform-docs/running-the-blog): the dev server, the checks to run before committing, how a commit message becomes a release.
- [Feeds, crawlers, and the 404 page](/blog-platform-docs/feeds-and-crawlers): the RSS feed, the sitemap, the robots file, the page a dead link lands on.

### Writing

For adding or editing content.

- [Content validation rules](/blog-platform-docs/content-validation): every rule the build enforces, the exact message each throws, what to change. Read it when a build fails.
- [Markdown reference](/blog-platform-docs/markdown-reference): every form the renderer supports, written out and rendered live on the page.
- [Adding a publication or post](/blog-platform-docs/adding-content): the entry point for writers. Both post formats, every required field, a checklist per job.
- [Authors and bylines](/blog-platform-docs/authors-and-bylines): the author record, and what happens when you rename or remove one.
- [Search, tags, and discovery](/blog-platform-docs/search-and-discovery): what readers can actually search, which changes how you write a title, an excerpt, and a tag.

### Community

For taking the platform yourself, or helping this blog.

- [Run your own copy](/blog-platform-docs/run-your-own-copy): the checklist for forking this repository and making it yours. What to replace, what to configure, what to leave alone.
- [Contribute to the platform](/blog-platform-docs/contribute-to-the-platform): the path from fork to merged, for a post or for code.
- [Supporting the platform](/blog-platform-docs/supporting-the-platform): for readers rather than maintainers. Three ways to help this blog keep going; passing a post to someone who needs it matters most.

## Three things that catch everyone

The mistakes that cost the most time, pulled forward from the posts above.

**A passing typecheck proves nothing about your content.** It checks types, never runs the code. The validator executes when the registry is imported: during a build, and when the dev server renders a page. A date written as the thirtieth of February is a valid string: typecheck passes, build fails.

**Nothing checks the links you write in prose.** A link to a page that does not exist builds happily and returns a 404 to the reader. Open every internal link you write.

**Renaming anything with a URL needs a redirect in the same change.** A publication ID, a post slug, and an author ID are all public addresses. Once an address has shipped, its redirect belongs in the config permanently.

## Versions

The version comes from commit messages, not set by hand. Fix commit: patch. Feature commit: minor. Everything else releases nothing. The number in the site footer comes from the repository manifest, which the release pipeline writes.

For what changed and when, read the changelog in the repository, not any post here. A hand-written release summary goes stale on the next release; the pipeline runs on every push.

## Running your own copy

This blog's own repository is public, at [github.com/rj11io/11pc](https://github.com/rj11io/11pc), under the Apache License 2.0. Fork it and everything in this publication applies to your copy: same platform, same code. [Run your own copy](/blog-platform-docs/run-your-own-copy) is the checklist.

For the argument that running your own is worth the trouble, read the original 11blog essay [Own your platform](https://blog.rj11.io/online-presence/own-your-platform).

## How these posts are maintained

One rule, and the reason this publication is worth trusting: **a meaningful change to the platform updates the documentation in the same commit.** These posts are drafts today, but stale documentation would still make the eventual publication unreliable.

Three habits hold that up:

- Verify before writing. Several claims in these posts were wrong in their first draft, caught only by running them.
- Record the reasoning, not just the rule. The contrast measurements in the theming post and the plugin ordering in the release post are why those choices survived.
- Say what is missing. The accessibility post ends with its own gaps; the validation post names the two things nothing checks. A contract with unstated holes is worse than no contract.

`
