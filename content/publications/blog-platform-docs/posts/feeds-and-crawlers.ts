export const feedsAndCrawlers = `
# Feeds, crawlers, and the 404 page

Readers arrive through pages. Three other consumers arrive through machine-readable addresses: feed readers, search crawlers, whoever follows a dead link. Four pieces serve them: the RSS feed, the sitemap, the robots file, the 404 page. None needs maintaining when content changes.

## The three addresses

| Address | What it serves |
| --- | --- |
| /feed.xml | An RSS feed of every published post, newest first |
| /sitemap.xml | Every address on the site, for search engines |
| /robots.txt | Crawl permissions, and a pointer to the sitemap |

All three built from the registry at build time, same as the pages. Consequences:

- They list what the site serves, nothing else. Drafts are gone before any of them is generated.
- Adding or removing a post updates all three on the next build. Nothing to remember.

See [The content contract](/blog-platform-docs/content-contract) for why the registry is the only door.

## The feed

Lives at v0/www/app/feed.xml/route.ts. Route handler forced static: rendered once at build, served as a file.

Per entry: title, address, date, excerpt. No body. Excerpts are the summary everywhere else on the site, the feed follows that. Reader who wants the post follows the link.

Order: updated date when set, created date otherwise, so a revised post resurfaces. Addresses built by the same route helpers as every link on the site, wrapped in absoluteUrl (feed entries need full addresses). See [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects).

## The sitemap and the robots file

Both use the framework's file conventions: v0/www/app/sitemap.ts and v0/www/app/robots.ts export a description, the build turns each into the file crawlers expect.

Sitemap lists: landing page, the three browse indexes, every publication, every post, every author page. Posts and publications carry a last-modified date: the updated field when set, created otherwise. One more reason to set updated when revising a post.

Robots file: allows everything, points at the sitemap. Nothing to hide, a draft has no address at all. Stronger guarantee than asking crawlers to stay away.

## The 404 page

Every content route refuses unknown addresses. Mistyped path, drafted post, removed page: all land on v0/www/app/not-found.tsx. Styled page with two ways onward (landing page, browse index), not the framework's unstyled default.

This page can quietly receive real traffic. Nothing validates links written in post prose, so a broken internal link sends readers here instead of failing the build. 404 page showing in analytics usually means a missing redirect. Fix: [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects).

## What changes when content changes

Nothing, by design.

- Publish a post: next build adds it to the feed and the sitemap.
- Draft one: the same build removes it from both, along with its address.
- One manual habit: set the updated field when revising a post. Feed and sitemap both read it.

## Limits, stated plainly

- The feed carries excerpts, not full bodies. A full-content feed would mean rendering Markdown to HTML inside the feed, which nothing else needs.
- One feed for the whole site. Per-publication feeds would be easy to add if a publication ever deserves its own audience.
- Nothing advertises the feed: no visible link in the footer and no discovery tag in the page head yet. A feed reader has to be handed /feed.xml directly.
`
